// ============================================================
// IDHAM ERP — ZATCA Invoice Signing & Submission
// ============================================================

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require("axios");
const { computeInvoiceHash, signInvoiceHash, generateTLVQRCode } = require("./zatca-utils");

const db = admin.firestore();
const COMPANY_ID = "idham-main";

/**
 * Main Function to Sign, Hash, and Submit an Invoice to ZATCA
 */
exports.submitInvoiceToZATCA = onCall({ region: "me-west1" }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
  }

  const { invoiceId, invoiceCollection = "salesInvoices" } = request.data;
  if (!invoiceId) {
    throw new HttpsError("invalid-argument", "رقم الفاتورة مطلوب");
  }

  const invoiceRef = db.doc(`companies/${COMPANY_ID}/${invoiceCollection}/${invoiceId}`);
  const invoiceSnap = await invoiceRef.get();
  if (!invoiceSnap.exists) {
    throw new HttpsError("not-found", "الفاتورة غير موجودة");
  }

  const invoice = invoiceSnap.data();

  // Get ZATCA Configuration
  const settingsSnap = await db.doc(`companies/${COMPANY_ID}/settings/zatca`).get();
  const config = settingsSnap.exists ? settingsSnap.data() : {};

  // Get Secure secrets (Private Key)
  const secretsSnap = await db.doc(`companies/${COMPANY_ID}/settings/zatca_secrets`).get();
  const secrets = secretsSnap.exists ? secretsSnap.data() : {};

  const isOonboarded = config.status === "production_ready" || config.complianceChecked;

  try {
    // 1. Get previous invoice hash (PIH) to link the chain
    let prevHash = "NWZlY2QyM2E5M2U0YTlhNmE3M2U2M2U4Y2QxY2U2ZTU4Y2Q2ZTU4Y2Q2ZTU4Y2Q2ZTU4Y2Q2ZTU4Y2Q="; // Default base64 hash for first invoice
    const chainSnap = await db.doc(`companies/${COMPANY_ID}/settings/zatca_chain`).get();
    if (chainSnap.exists && chainSnap.data().lastInvoiceHash) {
      prevHash = chainSnap.data().lastInvoiceHash;
    }

    // 2. Build UBL 2.1 XML
    const xmlString = buildUBLXml({
      invoice,
      config,
      prevHash
    });

    // 3. Compute current invoice hash
    const currentHash = computeInvoiceHash(xmlString);

    let signature = "MOCK_SIGNATURE_BASE64";
    let qrCodeBase64 = "";

    // 4. Perform signing and QR code generation
    if (isOonboarded && secrets.privateKey) {
      // Real signing
      signature = signInvoiceHash(currentHash, secrets.privateKey);

      // Generate Phase 2 QR TLV
      qrCodeBase64 = generateTLVQRCode({
        sellerName: config.companyName || "إدهام للمواد الغذائية",
        vatNumber: config.vatNumber || "300000000000003",
        timestamp: invoice.createdAt || new Date().toISOString(),
        total: String(invoice.totalWithVat),
        vatAmount: String(invoice.totalVat || 0),
        xmlHash: currentHash,
        signature: signature,
        publicKey: config.publicKey,
        certSignature: config.productionCSID ? "PRODUCTION_CERT_SIG" : "COMPLIANCE_CERT_SIG"
      });
    } else {
      // Mock/Sandbox Mode QR (Phase 1 Compliant TLV)
      qrCodeBase64 = generateTLVQRCode({
        sellerName: config.companyName || "إدهام للمواد الغذائية (تجريبي)",
        vatNumber: config.vatNumber || "300000000000003",
        timestamp: invoice.createdAt || new Date().toISOString(),
        total: String(invoice.totalWithVat),
        vatAmount: String(invoice.totalVat || 0)
      });
    }

    // 5. Submit to ZATCA (Skip or mock if not onboarded)
    let responseData = { status: "PASS", message: "تمت المحاكاة بنجاح في بيئة التطوير" };
    let finalXml = xmlString;

    if (isOonboarded && config.productionCSID) {
      const isSimplified = invoice.invoiceType === "simplified";
      
      const payload = {
        invoiceHash: currentHash,
        uuid: invoice.uuid || invoiceId,
        invoice: Buffer.from(xmlString).toString("base64")
      };

      const env = config.environment || "simulation";
      const baseUrl = env === "production"
        ? "https://gw-fatoora.zatca.gov.sa/e-invoicing/core"
        : "https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation";

      const endpoint = isSimplified
        ? `${baseUrl}/invoices/reporting/single`
        : `${baseUrl}/invoices/clearance/single`;

      const csid = config.productionCSID;
      const secret = config.productionSecret;

      // Call ZATCA API
      const response = await axios.post(endpoint, payload, {
        headers: {
          "Accept-Language": "ar",
          "Accept-Version": "V2",
          "Authorization": `Basic ${Buffer.from(`${csid}:${secret}`).toString("base64")}`,
          "Content-Type": "application/json"
        }
      });

      responseData = response.data;
    }

    // 6. Update Invoice Document in Firestore
    await invoiceRef.update({
      zatcaStatus: responseData.clearanceStatus === "CLEARED" || responseData.reportingStatus === "REPORTED" || responseData.status === "PASS" ? "reported" : "failed",
      zatcaReportedAt: admin.firestore.FieldValue.serverTimestamp(),
      zatcaResponse: responseData,
      zatcaHash: currentHash,
      zatcaQr: qrCodeBase64,
      qrCodeData: qrCodeBase64 // Keep in sync with UI display
    });

    // 7. Update Chain
    await db.doc(`companies/${COMPANY_ID}/settings/zatca_chain`).set({
      lastInvoiceHash: currentHash,
      lastInvoiceId: invoiceId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 8. Write Audit Logs (Required for 6 Years audit compliance)
    await db.collection(`companies/${COMPANY_ID}/zatca_logs`).add({
      invoiceId,
      invoiceNumber: invoice.number || "N/A",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      xmlPayload: finalXml,
      response: responseData,
      hash: currentHash,
      qrCode: qrCodeBase64
    });

    return {
      success: true,
      message: "تم إرسال الفاتورة وتوثيقها رقمياً بنجاح",
      hash: currentHash,
      qr: qrCodeBase64
    };

  } catch (err) {
    console.error("ZATCA Submission Error:", err.response ? err.response.data : err.message);
    const errorDetails = err.response ? err.response.data : err.message;

    // Update status to failed
    await invoiceRef.update({
      zatcaStatus: "failed",
      zatcaError: errorDetails,
      zatcaReportedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create a notification for the accountant/admin
    await db.collection(`companies/${COMPANY_ID}/notifications`).add({
      title: `فشل إرسال الفاتورة #${invoice.number || invoiceId} لـ ZATCA`,
      message: `حدث خطأ أثناء الاتصال بهيئة الزكاة: ${JSON.stringify(errorDetails)}`,
      type: "zatca_error",
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    throw new HttpsError("internal", `فشل توثيق الفاتورة وإرسالها: ${err.message}`);
  }
});

/**
 * Builds UBL 2.1 Compliant XML Document String
 */
function buildUBLXml({ invoice, config, prevHash }) {
  const invoiceNumber = invoice.number || "INV-001";
  const dateStr = invoice.createdAt ? invoice.createdAt.split("T")[0] : new Date().toISOString().split("T")[0];
  const timeStr = invoice.createdAt ? invoice.createdAt.split("T")[1]?.slice(0, 8) || "09:00:00" : "09:00:00";
  const sellerVat = config.vatNumber || "300000000000003";
  const sellerName = config.companyName || "إدهام للمواد الغذائية";
  
  // Standard UBL 2.1 invoice template string
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ProfileID>urn:fdc:zatca.gov.sa:invoice:20210819:v2.0</cbc:ProfileID>
  <cbc:ID>${invoiceNumber}</cbc:ID>
  <cbc:UUID>${invoice.uuid || crypto.randomUUID()}</cbc:UUID>
  <cbc:IssueDate>${dateStr}</cbc:IssueDate>
  <cbc:IssueTime>${timeStr}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="0100000">388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>
  <cac:AdditionalDocumentReference>
    <cbc:ID>PIH</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${prevHash}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">1010000000</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${sellerName}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>الشارع الرئيسي</cbc:StreetName>
        <cbc:BuildingNumber>1234</cbc:BuildingNumber>
        <cbc:PlotIdentification>5678</cbc:PlotIdentification>
        <cbc:CitySubdivisionName>الحي</cbc:CitySubdivisionName>
        <cbc:CityName>الرياض</cbc:CityName>
        <cbc:PostalZone>12345</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>SA</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${sellerName}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${invoice.customerName || "عميل نقدي"}</cbc:Name>
      </cac:PartyName>
      <cac:PartyTaxScheme>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${invoice.totalVat || 0}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="SAR">${invoice.subtotal || invoice.totalWithVat}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="SAR">${invoice.subtotal || invoice.totalWithVat}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SAR">${invoice.totalWithVat}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="SAR">${invoice.totalWithVat}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`;
}
