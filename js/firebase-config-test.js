// ============================================================
// IDHAM ERP — Firebase Configuration
// إدهام للمواد الغذائية والتوزيع
// Project: IDHAM Foodstuffs and Distribution (standalone)
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";
import { getFunctions, connectFunctionsEmulator } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";

// ──────────────────────────────────────────
// Firebase Config — IDHAM Project
// Replace with your actual Firebase project config from:
// https://console.firebase.google.com → Project Settings → Your Apps
// ──────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "idham-foodstuffs.firebaseapp.com",
  projectId:         "idham-foodstuffs-sa",
  storageBucket:     "idham-foodstuffs-sa.appspot.com",
  messagingSenderId: "877840134444",
  appId:             "1:877840134444:web:idham001",
  measurementId:     "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase app (named to avoid conflicts)
const app  = initializeApp(firebaseConfig, "idham-erp");
const db   = getFirestore(app);
const auth = getAuth(app);
const storage  = getStorage(app);
const functions = getFunctions(app, "us-central1");

// ──────────────────────────────────────────
// Local Emulator Support
// Run: firebase emulators:start
// ──────────────────────────────────────────
const USE_EMULATORS = location.hostname === "localhost" || location.hostname === "127.0.0.1";

if (USE_EMULATORS) {
  console.log("🔧 Using Firebase Emulators");
  connectFirestoreEmulator(db, "localhost", 8080);
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFunctionsEmulator(functions, "localhost", 5001);
}

// ──────────────────────────────────────────
// Company / Tenant Configuration
// Multi-tenant: all docs scoped under companies/{companyId}
// ──────────────────────────────────────────
export const COMPANY_ID = "idham-main"; // change per tenant

// Firestore collection helpers
export const col = (path) => {
  // Auto-prefix with company path
  return `companies/${COMPANY_ID}/${path}`;
};

export { app, db, auth, storage, functions };

// ──────────────────────────────────────────
// ZATCA API Configuration
// ──────────────────────────────────────────
export const ZATCA_CONFIG = {
  // Set to 'simulation' for testing, 'production' for live
  environment: "simulation",
  baseUrls: {
    simulation:  "https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation",
    production:  "https://gw-fatoora.zatca.gov.sa/e-invoicing/core",
  },
  get baseUrl() {
    return this.baseUrls[this.environment];
  },
  // These are stored in Firestore settings after onboarding
  // binarySecurityToken: "",
  // secret: "",
};

// ──────────────────────────────────────────
// App Constants
// ──────────────────────────────────────────
export const APP_CONFIG = {
  name: "إدهام ERP",
  companyName: "إدهام للمواد الغذائية والتوزيع",
  vatRate: 0.15,       // 15% standard Saudi VAT
  currency: "SAR",
  currencySymbol: "ر.س",
  locale: "ar-SA",
  pageSize: 50,        // default pagination size
  productPageSize: 50, // product catalog page size
  invoicePrefix: "INV",
  purchasePrefix: "PUR",
  returnPrefix: "RET",
  dateFormat: { year: "numeric", month: "2-digit", day: "2-digit" },
};
