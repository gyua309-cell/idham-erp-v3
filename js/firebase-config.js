// ============================================================
// IDHAM ERP — Firebase Configuration (Multi-Tenant SaaS)
// ============================================================
// Architecture:
//   Each company (tenant) is isolated under companies/{companyId}
//   companyId is loaded dynamically from the logged-in user's profile
//   Private keys and ZATCA secrets NEVER touch this file
//
// Spark Plan Optimization:
//   - Company settings are cached in memory (no repeated Firestore reads)
//   - COMPANY_ID is derived from auth state, not hardcoded
//   - All list queries use .limit() to stay within free tier quotas
//     (50,000 reads / 20,000 writes / 20,000 deletes per day)
//
// Future (Blaze Plan):
//   - Cloud Functions for ZATCA signing, scheduled backups, onboarding
//   - connectFunctionsEmulator is already wired for local dev
// ============================================================

import { initializeApp }              from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { initializeFirestore,
         persistentLocalCache,
         persistentMultipleTabManager,
         connectFirestoreEmulator,
         doc, getDoc }                from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth,
         connectAuthEmulator }        from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getStorage }                 from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";
import { getFunctions,
         connectFunctionsEmulator }   from "https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";

// ──────────────────────────────────────────
// Firebase Project Configuration
// Get this from: Firebase Console → Project Settings → Your Apps
// ──────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyAike2lPO7VnFoRHevnGkbHpAQbKoDb5r8",
  authDomain:        "idham-foodstuffs-sa.firebaseapp.com",
  projectId:         "idham-foodstuffs-sa",
  storageBucket:     "idham-foodstuffs-sa.firebasestorage.app",
  messagingSenderId: "771445462953",
  appId:             "1:771445462953:web:05d70fb7c36a385c9796b8",
};

// Named app instance to avoid conflicts if multiple Firebase instances
const app       = initializeApp(firebaseConfig, "idham-erp");

// Initialize Firestore with modern Multi-Tab Offline Cache & Persistence
const db        = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

const auth      = getAuth(app);
const storage   = getStorage(app);
const functions = getFunctions(app, "me-west1");  // Saudi Arabia region

// ──────────────────────────────────────────
// Local Emulator Support
// Run: npx firebase emulators:start
// ──────────────────────────────────────────
const USE_EMULATORS = location.hostname === "localhost" || location.hostname === "127.0.0.1";

if (USE_EMULATORS) {
  console.log("🔧 Using Firebase Emulators (Spark Plan safe)");
  connectFirestoreEmulator(db, "localhost", 8080);
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFunctionsEmulator(functions, "localhost", 5001);
}

// ──────────────────────────────────────────
// Multi-Tenant State
// companyId is resolved from the logged-in user's Firestore profile.
// It is set once on login and cached for the session.
// NEVER hardcode companyId — it must come from the auth state.
// ──────────────────────────────────────────

// In-memory session state (cleared on page reload / logout)
const _session = {
  companyId:    null,   // resolved after login
  userProfile:  null,   // { role, assignedWarehouseId, assignedCustomerIds, ... }
  companyData:  null,   // company metadata (name, plan, zatca ref) — cached from Firestore
};

/**
 * Resolves the current user's companyId and profile from Firestore.
 * Called once after successful authentication.
 * Caches the result to avoid repeated Firestore reads (Spark plan optimization).
 *
 * @param {string} uid  Firebase Auth UID of the logged-in user
 * @returns {Promise<{companyId, userProfile, companyData}>}
 */
export async function resolveUserSession(uid) {
  if (_session.companyId && _session.userProfile) {
    // Already resolved — return cached session (0 Firestore reads)
    return _session;
  }

  // Step 1: Find which company this user belongs to.
  // We store a lightweight mapping: /userIndex/{uid} → { companyId }
  // This avoids a Collection Group query on login.
  const indexRef  = doc(db, "userIndex", uid);
  const indexSnap = await getDoc(indexRef);

  if (!indexSnap.exists()) {
    throw new Error("حساب المستخدم غير مرتبط بأي شركة. يرجى التواصل مع مسؤول النظام.");
  }

  const { companyId } = indexSnap.data();

  // Step 2: Load user profile (role, warehouse, assigned customers)
  const userRef  = doc(db, `companies/${companyId}/users/${uid}`);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("ملف المستخدم غير موجود. يرجى التواصل مع المسؤول.");
  }

  // Step 3: Load company metadata (cached — rarely changes)
  const companyRef  = doc(db, `companies/${companyId}`);
  const companySnap = await getDoc(companyRef);

  // Store in session cache
  _session.companyId   = companyId;
  _session.userProfile = { uid, ...userSnap.data() };
  _session.companyData = companySnap.exists() ? companySnap.data() : {};

  console.log(`✅ Session resolved | Company: ${companyId} | Role: ${_session.userProfile.role}`);
  return _session;
}

/** Returns the current companyId (throws if not logged in yet) */
export function getCompanyId() {
  if (!_session.companyId) throw new Error("لم يتم تسجيل الدخول بعد");
  return _session.companyId;
}

/** Returns the cached user profile */
export function getUserProfile() {
  return _session.userProfile;
}

/** Returns the cached company metadata (no Firestore read) */
export function getCompanyData() {
  return _session.companyData;
}

/** Clears session on logout */
export function clearSession() {
  _session.companyId   = null;
  _session.userProfile = null;
  _session.companyData = null;
}

// ──────────────────────────────────────────
// Backward-compatible COMPANY_ID export
// Modules that import COMPANY_ID directly will use this getter.
// The actual value is set after resolveUserSession() is called.
// ──────────────────────────────────────────
export let COMPANY_ID = "idham-main"; // default — overwritten on login

export function setCompanyId(id) {
  COMPANY_ID = id;
}

// ──────────────────────────────────────────
// Firestore collection helper
// ──────────────────────────────────────────
export const col = (path) => `companies/${COMPANY_ID}/${path}`;

// ──────────────────────────────────────────
// Exports
// ──────────────────────────────────────────
export { app, db, auth, storage, functions, firebaseConfig };

// ──────────────────────────────────────────
// ZATCA API Configuration (public endpoints only)
// Private keys live exclusively in Cloud Functions / Secret Manager
// ──────────────────────────────────────────
export const ZATCA_CONFIG = {
  environment: "simulation",  // "simulation" | "production"
  baseUrls: {
    simulation: "https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation",
    production:  "https://gw-fatoora.zatca.gov.sa/e-invoicing/core",
  },
  get baseUrl() { return this.baseUrls[this.environment]; },
};

// ──────────────────────────────────────────
// App Constants
// ──────────────────────────────────────────
export const APP_CONFIG = {
  name:             "IDHAM ERP",
  vatRate:          0.15,
  currency:         "SAR",
  currencySymbol:   "ر.س",
  locale:           "ar-SA",
  // Spark Plan safe pagination sizes
  pageSize:         50,    // max 50 invoices/customers per page
  productPageSize:  100,   // products list batch size
  invoicePrefix:    "INV",
  purchasePrefix:   "PUR",
  returnPrefix:     "RET",
  dateFormat: { year: "numeric", month: "2-digit", day: "2-digit" },
};
