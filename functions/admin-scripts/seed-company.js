// ============================================================
// IDHAM ERP — Firebase Admin SDK Scripts
// Multi-Tenant Company & User Onboarding
// ============================================================
// Run with: node functions/admin-scripts/seed-company.js
// Requires: GOOGLE_APPLICATION_CREDENTIALS env var pointing to
//           your Firebase service account JSON key
// ============================================================

const admin = require("firebase-admin");

// Initialize Admin SDK (uses service account credentials)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId:  "idham-foodstuffs-sa",
  });
}

const db = admin.firestore();
const auth = admin.auth();

// ──────────────────────────────────────────
// Create a new Company (Tenant)
// ──────────────────────────────────────────
async function createCompany(companyData) {
  const {
    companyId,      // e.g. "idham-main" or "company-xyz"
    name,           // "إدهام للمواد الغذائية"
    vatNumber,      // "300XXXXXXXXX"
    crNumber,       // Commercial Registration
    address,        // { street, city, district, postalCode, country }
    phone,
    email,
    plan = "spark", // "spark" | "blaze"
    adminEmail,     // First admin user email (must already exist in Firebase Auth)
    adminUid,       // Firebase Auth UID of the first admin
  } = companyData;

  const batch = db.batch();

  // 1. Company root document
  const companyRef = db.doc(`companies/${companyId}`);
  batch.set(companyRef, {
    companyId,
    name,
    vatNumber,
    crNumber,
    address,
    phone,
    email,
    plan,
    isActive:  true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 2. Default settings
  const settingsRef = db.doc(`companies/${companyId}/settings/general`);
  batch.set(settingsRef, {
    companyId,
    vatRate:          0.15,
    currency:         "SAR",
    currencySymbol:   "ر.س",
    locale:           "ar-SA",
    invoicePrefix:    "INV",
    purchasePrefix:   "PUR",
    returnPrefix:     "RET",
    pageSize:         50,
    zatcaEnvironment: "simulation",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 3. Invoice counters
  const countersRef = db.doc(`companies/${companyId}/counters/invoices`);
  batch.set(countersRef, {
    companyId,
    salesInvoice:    0,
    purchaseInvoice: 0,
    salesReturn:     0,
    purchaseReturn:  0,
    quotation:       0,
    purchaseRequest: 0,
  });

  // 4. Admin user profile (inside company)
  if (adminUid) {
    const userRef = db.doc(`companies/${companyId}/users/${adminUid}`);
    batch.set(userRef, {
      companyId,
      uid:                adminUid,
      email:              adminEmail,
      role:               "admin",
      isActive:           true,
      assignedWarehouseId: null,
      assignedCustomerIds: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 5. UserIndex entry (for fast company lookup on login)
    // /userIndex/{uid} → { companyId }
    const indexRef = db.doc(`userIndex/${adminUid}`);
    batch.set(indexRef, { companyId, email: adminEmail });
  }

  // 6. Default chart of accounts (basic Saudi structure)
  await createDefaultChartOfAccounts(companyId, batch);

  await batch.commit();
  console.log(`✅ Company "${name}" (${companyId}) created successfully.`);
  return { companyId };
}

// ──────────────────────────────────────────
// Add a User to an Existing Company
// ──────────────────────────────────────────
async function addUserToCompany({
  email,
  password,
  companyId,
  role,           // "admin" | "accountant" | "rep"
  displayName,
  assignedWarehouseId = null,
  assignedCustomerIds = [],
}) {
  // 1. Create Firebase Auth account
  let userRecord;
  try {
    userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });
  } catch (err) {
    if (err.code === "auth/email-already-exists") {
      userRecord = await auth.getUserByEmail(email);
      console.log(`⚠️ User ${email} already exists in Auth, linking to company.`);
    } else {
      throw err;
    }
  }

  const uid   = userRecord.uid;
  const batch = db.batch();

  // 2. User profile inside company
  const userRef = db.doc(`companies/${companyId}/users/${uid}`);
  batch.set(userRef, {
    companyId,
    uid,
    email,
    displayName,
    role,
    isActive: true,
    assignedWarehouseId,
    assignedCustomerIds,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 3. UserIndex (for login session resolution)
  const indexRef = db.doc(`userIndex/${uid}`);
  batch.set(indexRef, { companyId, email });

  await batch.commit();
  console.log(`✅ User ${email} (${role}) added to company ${companyId}.`);
  return { uid, email, role, companyId };
}

// ──────────────────────────────────────────
// Default Chart of Accounts (Saudi Structure)
// ──────────────────────────────────────────
async function createDefaultChartOfAccounts(companyId, batch) {
  const accounts = [
    // Assets
    { code: "1000", name: "الأصول",                    type: "header",  category: "asset" },
    { code: "1100", name: "الأصول المتداولة",            type: "header",  category: "asset" },
    { code: "1110", name: "الصندوق",                    type: "detail",  category: "asset",    canBeNegative: false },
    { code: "1120", name: "البنوك",                     type: "detail",  category: "asset",    canBeNegative: false },
    { code: "1130", name: "ذمم المدينون",               type: "detail",  category: "asset",    canBeNegative: true  },
    { code: "1140", name: "أوراق القبض",                type: "detail",  category: "asset",    canBeNegative: false },
    { code: "1200", name: "المخزون",                    type: "detail",  category: "asset",    canBeNegative: false },
    { code: "1300", name: "الأصول الثابتة",             type: "header",  category: "asset" },
    { code: "1310", name: "المعدات والأثاث",             type: "detail",  category: "asset",    canBeNegative: false },
    { code: "1320", name: "السيارات والمركبات",          type: "detail",  category: "asset",    canBeNegative: false },
    // Liabilities
    { code: "2000", name: "الخصوم",                    type: "header",  category: "liability" },
    { code: "2100", name: "الخصوم المتداولة",           type: "header",  category: "liability" },
    { code: "2110", name: "ذمم الدائنون",              type: "detail",  category: "liability" },
    { code: "2120", name: "أوراق الدفع",               type: "detail",  category: "liability" },
    { code: "2130", name: "ضريبة القيمة المضافة المستحقة",type: "detail", category: "liability" },
    { code: "2140", name: "ضريبة القيمة المضافة المدفوعة",type: "detail", category: "liability" },
    { code: "2200", name: "الخصوم طويلة الأجل",        type: "header",  category: "liability" },
    { code: "2210", name: "القروض بنكية",              type: "detail",  category: "liability" },
    // Equity
    { code: "3000", name: "حقوق الملكية",              type: "header",  category: "equity" },
    { code: "3100", name: "رأس المال",                 type: "detail",  category: "equity" },
    { code: "3200", name: "الأرباح المحتجزة",          type: "detail",  category: "equity" },
    { code: "3300", name: "صافي الربح",                type: "detail",  category: "equity" },
    // Revenue
    { code: "4000", name: "الإيرادات",                 type: "header",  category: "revenue" },
    { code: "4100", name: "إيرادات المبيعات",           type: "detail",  category: "revenue" },
    { code: "4200", name: "مردودات المبيعات",           type: "detail",  category: "revenue" },
    { code: "4300", name: "خصم المبيعات",              type: "detail",  category: "revenue" },
    { code: "4400", name: "إيرادات أخرى",              type: "detail",  category: "revenue" },
    // Expenses
    { code: "5000", name: "المصروفات",                 type: "header",  category: "expense" },
    { code: "5100", name: "تكلفة البضاعة المباعة",     type: "detail",  category: "expense" },
    { code: "5200", name: "مصروفات التشغيل",            type: "header",  category: "expense" },
    { code: "5210", name: "الرواتب والأجور",            type: "detail",  category: "expense" },
    { code: "5220", name: "الإيجارات",                  type: "detail",  category: "expense" },
    { code: "5230", name: "المصاريف العمومية",          type: "detail",  category: "expense" },
    { code: "5240", name: "مصاريف النقل والتوصيل",     type: "detail",  category: "expense" },
    { code: "5250", name: "مصاريف الاتصالات",          type: "detail",  category: "expense" },
    { code: "5260", name: "مصاريف الصيانة",            type: "detail",  category: "expense" },
    { code: "5300", name: "المصاريف المالية",           type: "header",  category: "expense" },
    { code: "5310", name: "فوائد بنكية",               type: "detail",  category: "expense" },
  ];

  const colRef = db.collection(`companies/${companyId}/chartOfAccounts`);
  for (const account of accounts) {
    const ref = colRef.doc(account.code);
    batch.set(ref, {
      ...account,
      companyId,
      balance:   0,
      isActive:  true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

// ──────────────────────────────────────────
// Seed IDHAM Main Company (one-time setup)
// ──────────────────────────────────────────
async function seedIDHAMCompany() {
  await createCompany({
    companyId:    "idham-main",
    name:         "إدهام للمواد الغذائية والتوزيع",
    vatNumber:    "300000000000003",
    crNumber:     "1000000000",
    address: {
      street:     "شارع الأمير محمد بن عبدالعزيز",
      city:       "الرياض",
      district:   "العليا",
      postalCode:  "12244",
      country:    "SA",
    },
    phone:        "+966500000000",
    email:        "info@idham.sa",
    plan:         "spark",
    adminEmail:   "admin@idham.sa",
    adminUid:     "REPLACE_WITH_ACTUAL_UID", // Get from Firebase Console → Authentication
  });
}

// ──────────────────────────────────────────
// USAGE EXAMPLES
// ──────────────────────────────────────────

// Uncomment and run the function you need:

// seedIDHAMCompany().catch(console.error);

// addUserToCompany({
//   email:               "accountant@idham.sa",
//   password:            "SecurePass@123",
//   companyId:           "idham-main",
//   role:                "accountant",
//   displayName:         "أحمد المحاسب",
//   assignedWarehouseId: null,
//   assignedCustomerIds: [],
// }).catch(console.error);

// addUserToCompany({
//   email:               "rep1@idham.sa",
//   password:            "RepPass@456",
//   companyId:           "idham-main",
//   role:                "rep",
//   displayName:         "خالد المندوب",
//   assignedWarehouseId: "warehouse-riyadh",
//   assignedCustomerIds: ["cust-001", "cust-002", "cust-003"],
// }).catch(console.error);

module.exports = { createCompany, addUserToCompany, createDefaultChartOfAccounts };
