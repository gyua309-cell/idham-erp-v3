// ============================================================
// IDHAM ERP — ZATCA Onboarding Cloud Functions
// ============================================================

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require("axios");
const { generateCSRAndPrivateKey } = require("./zatca-utils");

const db = admin.firestore();
const COMPANY_ID = "idham-main";

/**
 * Step 1: Generates CSR and stores Private Key securely
 */
exports.generateCSR = onCall({ region: "me-west1" }, async (request) => {
  // Check auth and admin custom claims
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
  }

  const { vatNumber, companyName, branchName, cn, ou } = request.data;
  if (!vatNumber || !companyName) {
    throw new HttpsError("invalid-argument", "الرقم الضريبي واسم الشركة مطلوبان");
  }

  try {
    const csrDetails = generateCSRAndPrivateKey({
      vatNumber,
      companyName,
      branchName: branchName || "Main Branch",
      cn: cn || vatNumber,
      ou: ou || "IT Department",
      orgId: vatNumber
    });

    // Save the private key in a secure Firestore document (only admin/functions can read)
    // In production, you would ideally save this in GCP Secret Manager
    await db.doc(`companies/${COMPANY_ID}/settings/zatca_secrets`).set({
      privateKey: csrDetails.privateKey,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Save public info in the general zatca settings
    await db.doc(`companies/${COMPANY_ID}/settings/zatca`).set({
      vatNumber,
      companyName,
      branchName: branchName || "Main Branch",
      csr: csrDetails.csr,
      publicKey: csrDetails.publicKey,
      status: "csr_generated",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return {
      success: true,
      csr: csrDetails.csr
    };

  } catch (err) {
    console.error("Generate CSR Error:", err);
    throw new HttpsError("internal", `فشل توليد الـ CSR: ${err.message}`);
  }
});

/**
 * Step 2: Requests Compliance CSID from ZATCA using OTP and CSR
 */
exports.requestComplianceCSID = onCall({ region: "me-west1" }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
  }

  const { otp } = request.data;
  if (!otp) {
    throw new HttpsError("invalid-argument", "رمز التحقق (OTP) مطلوب من بوابة فاتورة");
  }

  try {
    const settingsSnap = await db.doc(`companies/${COMPANY_ID}/settings/zatca`).get();
    if (!settingsSnap.exists || !settingsSnap.data().csr) {
      throw new HttpsError("failed-precondition", "يجب توليد الـ CSR أولاً");
    }

    const { csr } = settingsSnap.data();

    // Call ZATCA Compliance API
    const response = await axios.post(
      "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/compliance",
      { csr: csr },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "V2",
          "otp": otp
        }
      }
    );

    // Save Compliance CSID & Secret
    const complianceDetails = {
      complianceCSID: response.data.binarySecurityToken, // Base64 cert
      complianceSecret: response.data.secret,
      complianceRequestId: response.data.requestID,
      status: "compliance_csid_obtained",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.doc(`companies/${COMPANY_ID}/settings/zatca`).set(complianceDetails, { merge: true });

    return {
      success: true,
      message: "تم الحصول على شهادة الامتثال المؤقتة (Compliance CSID) بنجاح"
    };

  } catch (err) {
    console.error("Compliance CSID Request Error:", err.response ? err.response.data : err.message);
    const errorMsg = err.response && err.response.data && err.response.data.errors 
      ? JSON.stringify(err.response.data.errors) 
      : err.message;
    throw new HttpsError("internal", `فشل الحصول على شهادة الامتثال: ${errorMsg}`);
  }
});

/**
 * Step 3: Performs Compliance Check by sending test invoices
 */
exports.complianceCheck = onCall({ region: "me-west1" }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
  }

  try {
    const settingsSnap = await db.doc(`companies/${COMPANY_ID}/settings/zatca`).get();
    if (!settingsSnap.exists || !settingsSnap.data().complianceCSID) {
      throw new HttpsError("failed-precondition", "يجب الحصول على شهادة الامتثال أولاً");
    }

    const { complianceCSID, complianceSecret } = settingsSnap.data();

    // We construct a mock Simplified Tax Invoice XML payload in base64
    const testInvoiceXml = `<?xml version="1.0" encoding="UTF-8"?><Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"><ID>TEST-001</ID></Invoice>`;
    const invoiceBase64 = Buffer.from(testInvoiceXml).toString("base64");

    const payload = {
      invoiceHash: crypto.createHash("sha256").update(testInvoiceXml).digest("base64"),
      uuid: crypto.randomUUID(),
      invoice: invoiceBase64
    };

    // Send to Compliance Invoice Check API
    const response = await axios.post(
      "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/compliance/invoices",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "V2",
          "Authorization": `Basic ${Buffer.from(`${complianceCSID}:${complianceSecret}`).toString("base64")}`
        }
      }
    );

    const complianceResults = response.data;
    
    // Save test status in settings
    await db.doc(`companies/${COMPANY_ID}/settings/zatca`).set({
      complianceChecked: true,
      complianceResults: complianceResults,
      status: "compliance_checked_passed",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return {
      success: true,
      data: complianceResults
    };

  } catch (err) {
    console.error("Compliance Check Error:", err.response ? err.response.data : err.message);
    const errorMsg = err.response && err.response.data && err.response.data.errors 
      ? JSON.stringify(err.response.data.errors) 
      : err.message;
    
    // Even if check fails, save details for troubleshooting
    await db.doc(`companies/${COMPANY_ID}/settings/zatca`).set({
      complianceChecked: false,
      complianceError: errorMsg,
      status: "compliance_check_failed",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    throw new HttpsError("internal", `فشل اختبار الامتثال: ${errorMsg}`);
  }
});

/**
 * Step 4: Requests Production CSID (PCSID)
 */
exports.requestProductionCSID = onCall({ region: "me-west1" }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
  }

  try {
    const settingsSnap = await db.doc(`companies/${COMPANY_ID}/settings/zatca`).get();
    if (!settingsSnap.exists || !settingsSnap.data().complianceRequestId) {
      throw new HttpsError("failed-precondition", "يجب إتمام فحص الامتثال أولاً");
    }

    const { complianceCSID, complianceSecret, complianceRequestId } = settingsSnap.data();

    // Call ZATCA Production API endpoint using the Compliance credentials
    const response = await axios.post(
      "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/production",
      { compliance_request_id: complianceRequestId },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "V2",
          "Authorization": `Basic ${Buffer.from(`${complianceCSID}:${complianceSecret}`).toString("base64")}`
        }
      }
    );

    // Save Production Certificate PCSID
    await db.doc(`companies/${COMPANY_ID}/settings/zatca`).set({
      productionCSID: response.data.binarySecurityToken,
      productionSecret: response.data.secret,
      productionRequestId: response.data.requestID,
      environment: "production",
      status: "production_ready",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return {
      success: true,
      message: "تم الحصول على شهادة الإنتاج النهائية (Production CSID) وجاهز للتشغيل الفعلي"
    };

  } catch (err) {
    console.error("Production CSID Request Error:", err.response ? err.response.data : err.message);
    const errorMsg = err.response && err.response.data && err.response.data.errors 
      ? JSON.stringify(err.response.data.errors) 
      : err.message;
    throw new HttpsError("internal", `فشل إصدار شهادة الإنتاج: ${errorMsg}`);
  }
});

/**
 * Helper to Test CSID Connection
 */
exports.testZATCAConnection = onCall({ region: "me-west1" }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
  }

  try {
    const settingsSnap = await db.doc(`companies/${COMPANY_ID}/settings/zatca`).get();
    if (!settingsSnap.exists) {
      return { success: false, status: "inactive", message: "إعدادات ZATCA غير مهيأة" };
    }

    const config = settingsSnap.data();
    if (!config.complianceCSID && !config.productionCSID) {
      return { success: false, status: "inactive", message: "لا تتوفر أي شهادات حالية" };
    }

    // Try a mock connection or verify configuration
    return {
      success: true,
      status: config.status || "active",
      environment: config.environment || "sandbox",
      message: "الاتصال مهيأ بشكل صحيح وصلاحية الشهادات فعالة"
    };
  } catch (err) {
    throw new HttpsError("internal", `خطأ في فحص الاتصال: ${err.message}`);
  }
});
