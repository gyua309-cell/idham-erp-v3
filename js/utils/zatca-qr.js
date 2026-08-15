// ============================================================
// IDHAM ERP — ZATCA QR Code Generator (TLV Encoding)
// Based on ZATCA FATOORA Phase 2 specification
// Tags 1-5 mandatory for all invoices
// Tags 6-9 required for Phase 2 standard invoices
// ============================================================

/**
 * Encode a single TLV field
 * @param {number} tag - Tag byte (1-9)
 * @param {string} value - String value
 * @returns {Uint8Array}
 */
function tlvEncode(tag, value) {
  const encoder = new TextEncoder();
  const valueBytes = encoder.encode(value);
  const result = new Uint8Array(2 + valueBytes.length);
  result[0] = tag;
  result[1] = valueBytes.length;
  result.set(valueBytes, 2);
  return result;
}

/**
 * Concatenate multiple Uint8Arrays
 */
function concatUint8Arrays(arrays) {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Convert Uint8Array to Base64
 */
function uint8ToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Generate ZATCA QR Code TLV data (Phase 1 — Tags 1-5)
 * Returns base64-encoded TLV string for QR code generation
 *
 * @param {Object} params
 * @param {string} params.sellerName - Seller name (Arabic)
 * @param {string} params.vatNumber - 15-digit VAT registration number
 * @param {string} params.timestamp - ISO 8601 timestamp (e.g., "2026-07-05T01:44:41Z")
 * @param {number} params.totalWithVat - Invoice total including VAT
 * @param {number} params.vatAmount - VAT amount only
 * @returns {string} Base64-encoded TLV
 */
export function generateZATCAQRBase64(params) {
  const { sellerName, vatNumber, timestamp, totalWithVat, vatAmount } = params;

  const fields = [
    tlvEncode(1, sellerName),
    tlvEncode(2, vatNumber),
    tlvEncode(3, timestamp),
    tlvEncode(4, Number(totalWithVat).toFixed(2)),
    tlvEncode(5, Number(vatAmount).toFixed(2)),
  ];

  return uint8ToBase64(concatUint8Arrays(fields));
}

/**
 * Decode TLV for verification
 * @param {string} base64 - Base64 TLV string
 * @returns {Object} Decoded fields
 */
export function decodeZATCAQR(base64) {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const decoder = new TextDecoder("utf-8");
    const result = {};
    const tagNames = { 1: "sellerName", 2: "vatNumber", 3: "timestamp", 4: "total", 5: "vatAmount" };

    let offset = 0;
    while (offset < bytes.length) {
      const tag    = bytes[offset++];
      const length = bytes[offset++];
      const value  = decoder.decode(bytes.slice(offset, offset + length));
      offset += length;
      result[tagNames[tag] || `tag_${tag}`] = value;
    }

    return result;
  } catch (e) {
    return {};
  }
}

/**
 * Render QR code to a canvas element using QRCode.js library
 * @param {string} base64TLV - Base64 TLV data
 * @param {HTMLElement} container - Container element
 * @param {number} size - QR size in px
 */
export async function renderZATCAQR(base64TLV, container, size = 120) {
  if (!window.QRCode) {
    console.warn("QRCode.js not loaded");
    return;
  }

  // Clear container
  container.innerHTML = "";

  try {
    const canvas = document.createElement("canvas");
    container.appendChild(canvas);

    await QRCode.toCanvas(canvas, base64TLV, {
      width: size,
      margin: 1,
      color: { dark: "#000000", light: "#FFFFFF" },
      errorCorrectionLevel: "M",
    });
  } catch (err) {
    console.error("QR generation failed:", err);
    container.innerHTML = `<div class="alert warn" style="font-size:11px;">تعذر توليد QR</div>`;
  }
}

/**
 * Generate ZATCA-compliant QR and return as data URL
 * @param {Object} params - Invoice params
 * @returns {Promise<string>} Data URL of QR image
 */
export async function generateZATCAQRDataURL(params) {
  if (!window.QRCode) return null;
  const base64TLV = generateZATCAQRBase64(params);
  try {
    return await QRCode.toDataURL(base64TLV, {
      width: 160,
      margin: 1,
      color: { dark: "#000000", light: "#FFFFFF" },
      errorCorrectionLevel: "M",
    });
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────
// ZATCA XML Generator (UBL 2.1)
// ──────────────────────────────────────────
/**
 * Generate ZATCA-compliant UBL 2.1 XML for a tax invoice
 * @param {Object} invoice - Invoice data
 * @param {Object} company - Company/seller data
 * @param {string} qrBase64 - Base64 TLV QR
 * @param {string} previousInvoiceHash - SHA256 of previous invoice XML (PIH)
 * @returns {string} XML string
 */
export function generateInvoiceXML(invoice, company, qrBase64, previousInvoiceHash = "NWZlY2ViNjZmZmM4NmYzOGQ5NTI5ZDZjNjYxYjU5MWQ=") {
  const isSimplified = invoice.invoiceType === "simplified"; // B2C
  const typeCode     = isSimplified ? "386" : "388";
  const profileId    = isSimplified ? "reporting:1.0" : "clearance:1.0";
  const typeCodeName = isSimplified ? "0200000" : "0100000";

  const lines = (invoice.lines || []).map((line, idx) => {
    const lineTotal = (line.qty * line.unitPrice * (1 - (line.discount || 0) / 100));
    const vatPct    = line.taxCategory === "S" ? 15 : 0;
    const vatAmt    = lineTotal * (vatPct / 100);
    return `
  <cac:InvoiceLine>
    <cbc:ID>${idx + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="${line.unitCode || 'PCE'}">${line.qty}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="SAR">${lineTotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="SAR">${vatAmt.toFixed(2)}</cbc:TaxAmount>
      <cbc:RoundingAmount currencyID="SAR">${(lineTotal + vatAmt).toFixed(2)}</cbc:RoundingAmount>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>${escapeXML(line.productName || "")}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>${line.taxCategory || "S"}</cbc:ID>
        <cbc:Percent>${vatPct}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="SAR">${Number(line.unitPrice).toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`;
  }).join("");

  const buyerBlock = isSimplified ? "" : `
  <cac:AccountingCustomerParty>
    <cac:Party>
      ${invoice.customer?.vatNumber ? `
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${invoice.customer.vatNumber}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>` : ""}
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXML(invoice.customer?.name || "")}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionURI>urn:oasis:names:specification:ubl:dsig:ext:XADES-BES</ext:ExtensionURI>
      <ext:ExtensionContent><!-- Digital Signature Placeholder --></ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:ProfileID>${profileId}</cbc:ProfileID>
  <cbc:ID>${escapeXML(invoice.number)}</cbc:ID>
  <cbc:UUID>${invoice.uuid}</cbc:UUID>
  <cbc:IssueDate>${invoice.date}</cbc:IssueDate>
  <cbc:IssueTime>${invoice.time || "00:00:00"}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="${typeCodeName}">${typeCode}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>
  <cac:AdditionalDocumentReference>
    <cbc:ID>PIH</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${previousInvoiceHash}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>QR</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${qrBase64}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">${escapeXML(company.crNumber || "")}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXML(company.street || "")}</cbc:StreetName>
        <cbc:BuildingNumber>${escapeXML(company.buildingNumber || "")}</cbc:BuildingNumber>
        <cbc:CityName>${escapeXML(company.city || "الرياض")}</cbc:CityName>
        <cbc:PostalZone>${escapeXML(company.postalCode || "")}</cbc:PostalZone>
        <cac:Country><cbc:IdentificationCode>SA</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXML(company.vatNumber || "")}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXML(company.name || "")}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  ${buyerBlock}
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${Number(invoice.totalVat).toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="SAR">${Number(invoice.subtotal).toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="SAR">${Number(invoice.totalVat).toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>15</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="SAR">${Number(invoice.subtotal).toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="SAR">${Number(invoice.subtotal).toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SAR">${Number(invoice.totalWithVat).toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="SAR">${Number(invoice.totalWithVat).toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${lines}
</Invoice>`;
}

function escapeXML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Calculate SHA-256 hash of invoice XML (for PIH chaining)
 * @param {string} xmlString
 * @returns {Promise<string>} Base64-encoded SHA-256
 */
export async function hashInvoiceXML(xmlString) {
  const encoder = new TextEncoder();
  const data = encoder.encode(xmlString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray  = Array.from(new Uint8Array(hashBuffer));
  const base64 = btoa(hashArray.map(b => String.fromCharCode(b)).join(""));
  return base64;
}
