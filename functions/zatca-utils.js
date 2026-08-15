// ============================================================
// IDHAM ERP — ZATCA Cryptography & XML Utilities
// ============================================================

const crypto = require("crypto");
const forge = require("node-forge");

/**
 * Generates an Elliptic Curve (prime256v1) key pair and creates a CSR
 * conforming to ZATCA Phase 2 specifications.
 * @param {Object} options Subject details for CSR
 * @returns {Object} { privateKey, publicKey, csr }
 */
function generateCSRAndPrivateKey(options) {
  // ZATCA requires Elliptic Curve prime256v1 (secp256r1)
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "prime256v1"
  });

  const privateKeyPem = privateKey.export({ type: "pkcs8", format: "pem" });
  const publicKeyPem = publicKey.export({ type: "spki", format: "pem" });

  // Convert keys to node-forge format to construct X.509 CSR
  const forgePrivateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const forgePublicKey = forge.pki.publicKeyFromPem(publicKeyPem);

  const csr = forge.pki.createCertificationRequest();
  csr.publicKey = forgePublicKey;

  // Subject Distinguished Name (DN)
  const attrs = [
    { name: "commonName", value: options.cn || options.vatNumber },
    { name: "countryName", value: "SA" },
    { name: "organizationName", value: options.companyName },
    { name: "organizationalUnitName", value: options.ou || "IT Department" }
  ];
  csr.setSubject(attrs);

  // ZATCA Certificate Template Name OID: 1.3.6.1.4.1.311.20.2
  // Alternative Name (AltName) OID containing ZATCA spec details
  const extensions = [
    {
      name: "subjectAltName",
      altNames: [
        {
          type: 4, // DirectoryName
          value: [
            { name: "organizationName", value: options.orgId || options.vatNumber },
            { name: "organizationalUnitName", value: options.branchName || "Main Branch" },
            { name: "businessCategory", value: "Retail & Distribution" }
          ]
        }
      ]
    }
  ];

  csr.setAttributes([
    {
      name: "extensionRequest",
      extensions: extensions
    }
  ]);

  // Sign CSR using ECDSA-SHA256
  csr.sign(forgePrivateKey, forge.md.sha256.create());

  const csrPem = forge.pki.certificationRequestToPem(csr);

  return {
    privateKey: privateKeyPem,
    publicKey: publicKeyPem,
    csr: Buffer.from(csrPem).toString("base64") // Base64 encoded for ZATCA API
  };
}

/**
 * Computes ZATCA SHA-256 Hash of XML Invoice (excluding the Signature block)
 * @param {string} xmlString Raw UBL XML
 * @returns {string} SHA-256 Base64 digest
 */
function computeInvoiceHash(xmlString) {
  // Strip existing signature block if present
  const cleanXml = xmlString.replace(/<cac:Signature>[\s\S]*?<\/cac:Signature>/g, "").trim();
  return crypto.createHash("sha256").update(cleanXml, "utf8").digest("base64");
}

/**
 * Signs an Invoice Hash using ECDSA Private Key (secp256r1)
 * @param {string} hashBase64 Invoice Hash in Base64
 * @param {string} privateKeyPem ECDSA Private Key PEM
 * @returns {string} ECDSA Signature in Base64
 */
function signInvoiceHash(hashBase64, privateKeyPem) {
  const hashBuf = Buffer.from(hashBase64, "base64");
  const sign = crypto.createSign("SHA256");
  sign.update(hashBuf);
  const signatureDer = sign.sign({
    key: privateKeyPem,
    dsaEncoding: "der"
  });
  return signatureDer.toString("base64");
}

/**
 * Helper to encode TLV tag-length-value block
 */
function encodeTLV(tag, value) {
  const tagBuf = Buffer.from([tag]);
  const valBuf = Buffer.from(String(value), "utf8");
  const lenBuf = Buffer.from([valBuf.length]);
  return Buffer.concat([tagBuf, lenBuf, valBuf]);
}

/**
 * Generates ZATCA TLV Base64 QR Code
 * @param {Object} fields QR data fields (Tags 1 to 9)
 * @returns {string} Base64 encoded TLV QR Code
 */
function generateTLVQRCode(fields) {
  const buffers = [];

  if (fields.sellerName)  buffers.push(encodeTLV(1, fields.sellerName));
  if (fields.vatNumber)   buffers.push(encodeTLV(2, fields.vatNumber));
  if (fields.timestamp)   buffers.push(encodeTLV(3, fields.timestamp));
  if (fields.total)       buffers.push(encodeTLV(4, fields.total));
  if (fields.vatAmount)   buffers.push(encodeTLV(5, fields.vatAmount));
  
  // Phase 2 Cryptographic Fields
  if (fields.xmlHash)       buffers.push(encodeTLV(6, fields.xmlHash));
  if (fields.signature)     buffers.push(encodeTLV(7, fields.signature));
  if (fields.publicKey)     buffers.push(encodeTLV(8, fields.publicKey));
  if (fields.certSignature) buffers.push(encodeTLV(9, fields.certSignature));

  return Buffer.concat(buffers).toString("base64");
}

module.exports = {
  generateCSRAndPrivateKey,
  computeInvoiceHash,
  signInvoiceHash,
  generateTLVQRCode
};
