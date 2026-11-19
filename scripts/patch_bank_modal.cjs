const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../js/modules/bank-accounts.js");
let code = fs.readFileSync(filePath, "utf8");

// Normalize CRLF to LF
const isCRLF = code.includes("\r\n");
code = code.replace(/\r\n/g, "\n");

console.log("Applying modal improvements to bank-accounts.js...");

// 1. Add de-duplication in openBankAccountStatementModal
const oldTxnPush = `    // 1. Direct Bank Transactions
    txnsSnap.forEach(d => {
      const data = d.data();
      const dt = data.createdAt?.seconds ? formatDate(data.createdAt) : (data.date || todayString());
      processedIds.add(d.id);`;

const newTxnPush = `    // 1. Direct Bank Transactions
    txnsSnap.forEach(d => {
      const data = d.data();
      const dt = data.createdAt?.seconds ? formatDate(data.createdAt) : (data.date || todayString());
      processedIds.add(d.id);
      if (data.sourceId) processedIds.add(data.sourceId);
      if (data.refNumber) processedIds.add(data.refNumber);`;

if (code.includes(oldTxnPush)) {
  code = code.replace(oldTxnPush, newTxnPush);
  console.log("✓ Added de-duplication for sourceId and refNumber");
}

// 2. Add Excel button to modal footer
const oldModalFooter = `<div class="modal-footer" style="background:#f1f5f9;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;">
          <button class="btn btn-secondary" onclick="closeModal('ba-statement-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="printBankStatementHTML()">🖨️ طباعة رسمية لكشف الحساب البنكي</button>
        </div>`;

const newModalFooter = `<div class="modal-footer" style="background:#f1f5f9;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <button class="btn btn-secondary" onclick="closeModal('ba-statement-modal')">إغلاق</button>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary" onclick="exportBankStatementExcel()" style="background:#10b981;color:#fff;border-color:#059669;font-weight:800;">📊 تصدير Excel منسق</button>
            <button class="btn btn-primary" onclick="printBankStatementHTML()">🖨️ طباعة رسمية لكشف الحساب البنكي</button>
          </div>
        </div>`;

if (code.includes(oldModalFooter)) {
  code = code.replace(oldModalFooter, newModalFooter);
  console.log("✓ Added Excel button to modal footer");
}

// 3. In statement table header in modal, add an Excel button in the top banner
const oldBanner = `<div style="text-align:left; background:rgba(255,255,255,0.12); padding:12px 20px; border-radius:14px; border:1px solid rgba(255,255,255,0.25);">
          <div style="font-size:11px; color:#93c5fd; font-weight:700;">الرصيد النهائي الفعلي في البنك</div>
          <div class="mono" style="font-size:24px; font-weight:900; direction:ltr; color:#ffffff;">\${formatCurrency(bank.balance || 0)}</div>
        </div>`;

const newBanner = `<div style="text-align:left; background:rgba(255,255,255,0.12); padding:12px 20px; border-radius:14px; border:1px solid rgba(255,255,255,0.25);">
          <div style="font-size:11px; color:#93c5fd; font-weight:700;">الرصيد النهائي الفعلي في البنك</div>
          <div class="mono" style="font-size:24px; font-weight:900; direction:ltr; color:#ffffff;">\${formatCurrency(bank.balance || 0)}</div>
          <div style="margin-top:6px; text-align:center;">
            <button class="btn btn-sm" onclick="exportBankStatementExcel()" style="background:#10b981;color:#fff;border:none;font-size:11.5px;font-weight:800;padding:4px 10px;border-radius:6px;cursor:pointer;">📊 تصدير كشف الحساب Excel</button>
          </div>
        </div>`;

if (code.includes(oldBanner)) {
  code = code.replace(oldBanner, newBanner);
  console.log("✓ Added Excel button in modal banner");
}

if (isCRLF) {
  code = code.replace(/\n/g, "\r\n");
}

fs.writeFileSync(filePath, code, "utf8");
console.log("Modal enhancements applied successfully!");
