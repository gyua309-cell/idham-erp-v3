// ============================================================
// IDHAM ERP — Firebase Cloud Functions (ZATCA & Firestore Triggers)
// ============================================================

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated }  = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

const COMPANY_ID = "idham-main";

// ──────────────────────────────────────────
// ZATCA Modules Exports
// ──────────────────────────────────────────
const zatcaOnboarding = require("./zatca-onboarding");
exports.generateCSR = zatcaOnboarding.generateCSR;
exports.requestComplianceCSID = zatcaOnboarding.requestComplianceCSID;
exports.complianceCheck = zatcaOnboarding.complianceCheck;
exports.requestProductionCSID = zatcaOnboarding.requestProductionCSID;
exports.testZATCAConnection = zatcaOnboarding.testZATCAConnection;

const zatcaInvoice = require("./zatca-invoice");
exports.submitInvoiceToZATCA = zatcaInvoice.submitInvoiceToZATCA;

// Legacy endpoint wrapper for backward compatibility
exports.reportInvoiceToZatca = onCall({ region: "me-west1" }, async (request) => {
  return zatcaInvoice.submitInvoiceToZATCA.run(request);
});


// ──────────────────────────────────────────
// 2. Trigger: On Sales Invoice Created -> Update Customer Balance
// ──────────────────────────────────────────
exports.onSalesInvoiceCreated = onDocumentCreated(
  `companies/${COMPANY_ID}/salesInvoices/{invoiceId}`,
  async (event) => {
    const invoice = event.data.data();
    if (!invoice || invoice.status === "cancelled") return;

    const customerId = invoice.customerId;
    const amount     = invoice.remainingAmount || (invoice.totalWithVat - (invoice.paidAmount || 0));

    if (customerId && amount > 0) {
      const custRef = db.doc(`companies/${COMPANY_ID}/customers/${customerId}`);
      await custRef.update({
        balance: admin.firestore.FieldValue.increment(amount),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Update sales rep monthly accumulator
    if (invoice.repId) {
      const repRef = db.doc(`companies/${COMPANY_ID}/salesReps/${invoice.repId}`);
      await repRef.update({
        monthlySales: admin.firestore.FieldValue.increment(invoice.totalWithVat || 0),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
);

// ──────────────────────────────────────────
// 3. Trigger: On Sales Return Created -> Reverse Customer Balance
// ──────────────────────────────────────────
exports.onSalesReturnCreated = onDocumentCreated(
  `companies/${COMPANY_ID}/salesReturns/{returnId}`,
  async (event) => {
    const ret = event.data.data();
    if (!ret) return;

    const customerId = ret.customerId;
    const amount     = ret.totalWithVat || 0;

    if (customerId && amount > 0) {
      const custRef = db.doc(`companies/${COMPANY_ID}/customers/${customerId}`);
      await custRef.update({
        balance: admin.firestore.FieldValue.increment(-amount),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
);

// ──────────────────────────────────────────
// 4. Trigger: On Purchase Invoice Created -> Update Supplier Balance
// ──────────────────────────────────────────
exports.onPurchaseInvoiceCreated = onDocumentCreated(
  `companies/${COMPANY_ID}/purchaseInvoices/{invoiceId}`,
  async (event) => {
    const invoice = event.data.data();
    if (!invoice || invoice.status === "cancelled") return;

    const supplierId = invoice.supplierId;
    const amount     = invoice.paymentMethod === "credit" ? invoice.totalWithVat : 0;

    if (supplierId && amount > 0) {
      const supRef = db.doc(`companies/${COMPANY_ID}/suppliers/${supplierId}`);
      await supRef.update({
        balance: admin.firestore.FieldValue.increment(amount),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
);
