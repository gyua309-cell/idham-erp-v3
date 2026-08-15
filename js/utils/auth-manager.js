// ============================================================
// IDHAM ERP — Authentication & Session Manager
// Multi-tenant login, role resolution, permission guards
// ============================================================
// This module:
//   1. Handles Firebase Auth sign-in / sign-out
//   2. After login, resolves companyId + role from Firestore
//      (via resolveUserSession in firebase-config.js)
//   3. Updates COMPANY_ID globally so all COLS references are correct
//   4. Provides permission check helpers for UI gating
//   5. Persists minimal session data in sessionStorage (no PII)
// ============================================================

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import {
  auth,
  resolveUserSession,
  setCompanyId,
  clearSession,
  getUserProfile,
  getCompanyId,
  getCompanyData,
  COMPANY_ID,
} from "../firebase-config.js";

// ──────────────────────────────────────────
// Internal State
// ──────────────────────────────────────────
let _authReady = false;
let _onReadyCallbacks = [];

// ──────────────────────────────────────────
// Login
// ──────────────────────────────────────────
export async function login(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;

    // Resolve company and role (3 Firestore reads, then cached)
    const session = await resolveUserSession(uid);
    setCompanyId(session.companyId);

    // Store minimal session hint in sessionStorage (no sensitive data)
    sessionStorage.setItem("erp_company_id", session.companyId);
    sessionStorage.setItem("erp_role",       session.userProfile.role);

    console.log(`🔐 Logged in: ${email} | Company: ${session.companyId} | Role: ${session.userProfile.role}`);
    return session;
  } catch (err) {
    console.error("Login failed:", err.code, err.message);
    throw _mapAuthError(err);
  }
}

// ──────────────────────────────────────────
// Logout
// ──────────────────────────────────────────
export async function logout() {
  await signOut(auth);
  clearSession();
  sessionStorage.removeItem("erp_company_id");
  sessionStorage.removeItem("erp_role");
  // Reload to clear all module-level state
  window.location.href = "/login.html";
}

// ──────────────────────────────────────────
// Auth State Observer
// Call this once at app startup (before rendering any UI).
// Fires immediately with current auth state, then on each change.
// ──────────────────────────────────────────
export function initAuthObserver(onLoggedIn, onLoggedOut) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const session = await resolveUserSession(user.uid);
        setCompanyId(session.companyId);
        _authReady = true;
        _onReadyCallbacks.forEach(fn => fn(session));
        _onReadyCallbacks = [];
        if (onLoggedIn) onLoggedIn(session);
      } catch (err) {
        console.error("Session resolution failed:", err);
        await logout();
      }
    } else {
      _authReady = false;
      if (onLoggedOut) onLoggedOut();
    }
  });
}

/**
 * Returns a promise that resolves with the session once auth is ready.
 * Useful for modules that initialize before auth observer fires.
 */
export function waitForAuth() {
  if (_authReady) {
    return Promise.resolve({
      companyId:   getCompanyId(),
      userProfile: getUserProfile(),
      companyData: getCompanyData(),
    });
  }
  return new Promise((resolve) => {
    _onReadyCallbacks.push(resolve);
  });
}

// ──────────────────────────────────────────
// Permission Helpers
// ──────────────────────────────────────────

/** Current user's role string ("admin" | "accountant" | "rep") */
export function getCurrentRole() {
  const profile = getUserProfile();
  return profile ? profile.role : null;
}

/** Returns true if current user is an admin */
export function isAdmin() {
  return getCurrentRole() === "admin";
}

/** Returns true if admin or accountant */
export function isAdminOrAccountant() {
  const role = getCurrentRole();
  return role === "admin" || role === "accountant";
}

/** Returns true if rep */
export function isRep() {
  return getCurrentRole() === "rep";
}

/**
 * Guards a UI action or navigation.
 * Throws a readable error if the user lacks the required role.
 * @param {"admin"|"accountant"|"rep"} requiredRole
 */
export function requireRole(requiredRole) {
  const role = getCurrentRole();
  const hierarchy = { admin: 3, accountant: 2, rep: 1 };
  if (!role || (hierarchy[role] ?? 0) < (hierarchy[requiredRole] ?? 0)) {
    throw new Error(`ليس لديك صلاحية القيام بهذا الإجراء. المطلوب: ${requiredRole}`);
  }
}

/**
 * Hides or shows a DOM element based on role.
 * @param {string}   selector  CSS selector for the element
 * @param {"admin"|"accountant"|"rep"} visibleFor  minimum role to see element
 */
export function applyRoleVisibility(selector, visibleFor) {
  const els = document.querySelectorAll(selector);
  const role = getCurrentRole();
  const hierarchy = { admin: 3, accountant: 2, rep: 1 };
  const visible = (hierarchy[role] ?? 0) >= (hierarchy[visibleFor] ?? 0);
  els.forEach(el => {
    el.style.display = visible ? "" : "none";
  });
}

/**
 * Applies all role-based visibility rules in bulk.
 * Call this after the DOM is rendered.
 * Elements use data attributes: data-min-role="accountant"
 */
export function applyAllRoleVisibility() {
  const role = getCurrentRole();
  const hierarchy = { admin: 3, accountant: 2, rep: 1 };
  const userLevel = hierarchy[role] ?? 0;

  document.querySelectorAll("[data-min-role]").forEach(el => {
    const required = el.getAttribute("data-min-role");
    const requiredLevel = hierarchy[required] ?? 0;
    el.style.display = userLevel >= requiredLevel ? "" : "none";
  });
}

// ──────────────────────────────────────────
// Password Management
// ──────────────────────────────────────────
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  if (!user) throw new Error("غير مسجل الدخول");

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

// ──────────────────────────────────────────
// Error Message Mapping
// ──────────────────────────────────────────
function _mapAuthError(err) {
  const messages = {
    "auth/user-not-found":    "البريد الإلكتروني غير مسجل في النظام.",
    "auth/wrong-password":    "كلمة المرور غير صحيحة.",
    "auth/invalid-email":     "البريد الإلكتروني غير صالح.",
    "auth/user-disabled":     "تم تعطيل هذا الحساب. يرجى التواصل مع المسؤول.",
    "auth/too-many-requests": "محاولات كثيرة. يرجى الانتظار قليلاً والمحاولة مجدداً.",
    "auth/network-request-failed": "فشل الاتصال. تحقق من اتصال الإنترنت.",
    "auth/invalid-credential": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  };
  const msg = messages[err.code] || `خطأ: ${err.message}`;
  return new Error(msg);
}

// ──────────────────────────────────────────
// Current user info (convenience exports)
// ──────────────────────────────────────────
export function getCurrentUser()    { return auth.currentUser; }
export function getCurrentUid()     { return auth.currentUser?.uid ?? null; }
export function getCompanyIdSafe()  { return getCompanyId(); }
export { getUserProfile, getCompanyData };
