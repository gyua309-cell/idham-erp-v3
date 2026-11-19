const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../js/modules/bank-accounts.js");
let code = fs.readFileSync(filePath, "utf8");

// Normalize line endings to LF for consistent matching
const isCRLF = code.includes("\r\n");
code = code.replace(/\r\n/g, "\n");

console.log("Applying patches to bank-accounts.js...");

// 1. Add Arabic normalization and fix _getBankTheme
const oldThemeFunc = `function _getBankTheme(b) {
  const name = (b.name || "").toLowerCase();
  if (name.includes("راجحي") || name.includes("alrajhi")) {`;

const newThemeFunc = `function _normAr(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي");
}

function _getBankTheme(b) {
  const name = _normAr(b.name || "");
  if (name.includes("راجحي") || name.includes("alrajhi") || name.includes("al-rajhi")) {`;

if (code.includes(oldThemeFunc)) {
  code = code.replace(oldThemeFunc, newThemeFunc);
  console.log("✓ Patched _getBankTheme with Arabic normalization");
} else {
  console.warn("! Warning: _getBankTheme match not found");
}

// Also normalize other banks in _getBankTheme
code = code.replace(
  `} else if (name.includes("أهلي") || name.includes("اهلي") || name.includes("snb")) {`,
  `} else if (name.includes("اهلي") || name.includes("snb")) {`
);
code = code.replace(
  `} else if (name.includes("جزيرة") || name.includes("jazira")) {`,
  `} else if (name.includes("جزير") || name.includes("jazira")) {`
);
code = code.replace(
  `} else if (name.includes("إنماء") || name.includes("انماء") || name.includes("alinma")) {`,
  `} else if (name.includes("انما") || name.includes("alinma")) {`
);

// 2. Patch Excel button in top filterbar
code = code.replace(
  `<button class="btn btn-secondary btn-sm" onclick="exportPageExcel('.data-dense','الحسابات_البنكية')" title="تصدير Excel">📊 Excel</button>`,
  `<button class="btn btn-secondary btn-sm" onclick="exportBankStatementExcel()" title="تصدير كشف حساب بنكي Excel منسق" style="background:#10b981;color:#fff;border-color:#059669;font-weight:700;">📊 Excel منسق</button>`
);

// 3. Add period summary strip before table container
const oldTableDiv = `<div class="table-container">`;
const newTableDiv = `<!-- Dynamic Period Summary Strip -->
        <div id="ba-period-summary" style="display:none;padding:14px 20px;background:var(--bg-1);border-bottom:1px solid var(--border-soft);border-top:1px solid var(--border-soft);"></div>

        <div class="table-container">`;

if (code.includes(oldTableDiv) && !code.includes("id=\"ba-period-summary\"")) {
  code = code.replace(oldTableDiv, newTableDiv);
  console.log("✓ Added #ba-period-summary strip");
}

// 4. Replace applyBankTxnFilters with ISO-aware date comparison and KPI summary
const oldApplyStart = `window.applyBankTxnFilters = () => {`;
const oldApplyEnd = `tbody.innerHTML = filtered.map(t => {`;

const newApplyBlock = `let _lastFilteredBankTxns = [];

function _getTxnISODate(t) {
  if (t.date && /^\\d{4}-\\d{2}-\\d{2}$/.test(t.date)) return t.date;
  if (t.createdAt?.seconds) {
    const d = new Date(t.createdAt.seconds * 1000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return \`\${yyyy}-\${mm}-\${dd}\`;
  }
  if (typeof t.createdAt === "string" && /^\\d{4}-\\d{2}-\\d{2}/.test(t.createdAt)) {
    return t.createdAt.substring(0, 10);
  }
  return "";
}

window.applyBankTxnFilters = () => {
  const bankId = document.getElementById("filter-ba-box")?.value || _selectedBankFilter || "";
  const from   = document.getElementById("filter-ba-from")?.value || "";
  const to     = document.getElementById("filter-ba-to")?.value || "";
  const type   = document.getElementById("filter-ba-type")?.value || "";
  const search = (document.getElementById("filter-ba-search")?.value || "").trim().toLowerCase();

  const tbody = document.getElementById("ba-tbody");
  const titleEl = document.getElementById("ba-txn-table-title");
  const subtitleEl = document.getElementById("ba-txn-table-subtitle");
  const summaryEl = document.getElementById("ba-period-summary");

  if (!tbody) return;

  let filtered = [..._allBankTxns];

  // 1. Bank filter
  if (bankId) {
    filtered = filtered.filter(t => t.bankAccountId === bankId);
    const bank = bankAccounts.find(b => b.id === bankId);
    if (titleEl) titleEl.textContent = \`📑 كشف حركات: \${bank ? bank.name : 'الحساب البنكي'}\`;
  } else {
    if (titleEl) titleEl.textContent = "📑 سجل ودعم كشف الحركات البنكية الأخيرة";
  }

  const totalBankTxns = filtered.length;

  // 2. Date filters (ISO comparison YYYY-MM-DD avoids local DD/MM/YYYY text mismatch)
  if (from) {
    filtered = filtered.filter(t => {
      const d = _getTxnISODate(t);
      return !d || d >= from;
    });
  }
  if (to) {
    filtered = filtered.filter(t => {
      const d = _getTxnISODate(t);
      return !d || d <= to;
    });
  }

  // 3. Type filter
  if (type) {
    filtered = filtered.filter(t => t.type === type);
  }

  // 4. Search filter
  if (search) {
    filtered = filtered.filter(t => 
      (t.notes || "").toLowerCase().includes(search) ||
      (t.refNumber || "").toLowerCase().includes(search) ||
      (t.bankAccountId || "").toLowerCase().includes(search) ||
      String(t.amount || "").includes(search)
    );
  }

  // Sort: latest date first
  filtered.sort((a, b) => {
    const da = _getTxnISODate(a) + (a.createdAt?.seconds || 0);
    const db = _getTxnISODate(b) + (b.createdAt?.seconds || 0);
    return db.localeCompare(da);
  });

  _lastFilteredBankTxns = filtered;

  // Update subtitle accurately
  if (subtitleEl) {
    if (filtered.length === totalBankTxns) {
      subtitleEl.textContent = \`سجل الحركات المصروفة والمقيدة للحساب البنكي (\${filtered.length} حركة)\`;
    } else {
      subtitleEl.textContent = \`عرض \${filtered.length} حركة مطابقة للتصفية من إجمالي \${totalBankTxns} حركة\`;
    }
  }

  // Calculate totals
  let totalIn = 0;
  let totalOut = 0;
  filtered.forEach(t => {
    const amt = Number(t.amount || 0);
    if (t.type === 'in') totalIn += amt;
    else totalOut += amt;
  });
  const netDiff = totalIn - totalOut;

  // Render period summary bar
  if (summaryEl) {
    const activeBank = bankAccounts.find(b => b.id === bankId);
    summaryEl.style.display = "block";
    summaryEl.innerHTML = \`
      <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:center;justify-content:space-between;width:100%;">
        <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:center;">
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:11.5px;font-weight:700;color:var(--text-3);">الحركات المعروضة:</span>
            <span class="badge" style="background:#f1f5f9;color:#0f172a;font-weight:900;font-size:12px;">\${filtered.length} حركة</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:11.5px;font-weight:700;color:#15803d;">📥 إجمالي الوارد (+):</span>
            <span class="mono font-bold text-ok" style="font-size:13.5px;">+\${formatCurrency(totalIn)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:11.5px;font-weight:700;color:#b91c1c;">📤 إجمالي المنصرف (-):</span>
            <span class="mono font-bold text-bad" style="font-size:13.5px;">-\${formatCurrency(totalOut)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:11.5px;font-weight:700;color:var(--text-2);">⚖️ صافي حركة الفترة:</span>
            <span class="mono font-bold \${netDiff >= 0 ? 'text-ok' : 'text-bad'}" style="font-size:13.5px;direction:ltr;">\${netDiff >= 0 ? '+' : ''}\${formatCurrency(netDiff)}</span>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          \${activeBank ? \`
            <div style="display:flex;align-items:center;gap:8px;background:rgba(30,58,138,0.08);padding:5px 14px;border-radius:10px;border:1px solid rgba(30,58,138,0.2);">
              <span style="font-size:11.5px;font-weight:800;color:#1e3a8a;">💰 الرصيد المتاح الحالي:</span>
              <span class="mono font-bold" style="font-size:14.5px;color:#1e3a8a;direction:ltr;">\${formatCurrency(activeBank.balance || 0)}</span>
            </div>
          \` : ''}
          <button class="btn btn-secondary btn-sm" onclick="exportBankStatementExcel()" style="background:#10b981;color:#fff;border-color:#059669;font-weight:800;padding:5px 12px;border-radius:8px;" title="تصدير كشف الحساب الحالي لإكسيل">📊 تصدير Excel منسق</button>
        </div>
      </div>
    \`;
  }

  const bMap = {};
  bankAccounts.forEach(b => bMap[b.id] = b.name);

  if (filtered.length === 0) {
    tbody.innerHTML = \`<tr><td colspan="7" style="text-align:center;padding:36px;color:var(--text-2);font-weight:700;">🔍 لا توجد حركات بنكية مطابقة للتصفية المختارة</td></tr>\`;
    return;
  }

  tbody.innerHTML = filtered.map(t => {`;

const applyIdx = code.indexOf(oldApplyStart);
const applyEndIdx = code.indexOf(oldApplyEnd);
if (applyIdx !== -1 && applyEndIdx !== -1) {
  code = code.substring(0, applyIdx) + newApplyBlock + code.substring(applyEndIdx + oldApplyEnd.length);
  console.log("✓ Patched applyBankTxnFilters with ISO date comparisons and period summary");
} else {
  console.warn("! Warning: applyBankTxnFilters slice not found", applyIdx, applyEndIdx);
}

// Also ensure row rendering displays t.date || t.createdAt
code = code.replace(
  `<td class="mono font-bold" style="font-size:12.5px;">\${formatDate(t.createdAt)}</td>`,
  `<td class="mono font-bold" style="font-size:12.5px;">\${formatDate(t.date || t.createdAt)}</td>`
);

// 5. Alias openBankStatementModal so card buttons work
const modalAlias = `
// Alias for card button clicks
window.openBankStatementModal = (bankId) => window.openBankAccountStatementModal(bankId);
`;

if (!code.includes("window.openBankStatementModal = ")) {
  code = modalAlias + code;
  console.log("✓ Added openBankStatementModal alias");
}

// 6. Fix printBankStatementHTML to use r.badgeText instead of r.type
code = code.replace(
  `<td><strong>\${r.type}</strong></td>`,
  `<td><strong>\${r.badgeText || (r.inflow ? 'إيداع وارد (+)' : 'تحويل صادر (-)')}</strong></td>`
);

// 7. Add exportBankStatementExcel function at the end
const exportFunctionCode = `
// ─────────────────────────────────────────────────────────────────────────────
// Formatted Excel Export for Bank Statements (ExcelJS with SheetJS fallback)
// ─────────────────────────────────────────────────────────────────────────────
window.exportBankStatementExcel = async () => {
  const bankId = document.getElementById("filter-ba-box")?.value || _selectedBankFilter || "";
  const bank = bankAccounts.find(b => b.id === bankId);
  const bankName = bank ? bank.name : "جميع الحسابات البنكية";
  const iban = bank?.iban || "غير مسجل";
  const accNum = bank?.accountNumber || "—";
  const currentBalance = bank ? (bank.balance || 0) : 0;

  const from = document.getElementById("filter-ba-from")?.value || "";
  const to   = document.getElementById("filter-ba-to")?.value || "";

  // Target transactions
  const txns = _lastFilteredBankTxns && _lastFilteredBankTxns.length > 0
    ? _lastFilteredBankTxns
    : (bankId ? _allBankTxns.filter(t => t.bankAccountId === bankId) : _allBankTxns);

  if (!txns || txns.length === 0) {
    if (window.showToast) window.showToast("لا توجد حركات بنكية للتصدير", "warning");
    else alert("لا توجد حركات بنكية للتصدير");
    return;
  }

  // Calculate totals
  let totalIn = 0;
  let totalOut = 0;
  txns.forEach(t => {
    const a = Number(t.amount || 0);
    if (t.type === 'in') totalIn += a;
    else totalOut += a;
  });
  const netDiff = totalIn - totalOut;

  const bMap = {};
  bankAccounts.forEach(b => bMap[b.id] = b.name);

  const cleanBankName = bankName.replace(/[\\\\/:*?"<>|]/g, "_");
  const fileName = \`كشف_حساب_\${cleanBankName}_\${new Date().toISOString().slice(0, 10)}\`;

  // 1. Try ExcelJS first for beautiful styles and colored tabs
  if (window.ExcelJS) {
    try {
      const wb = new window.ExcelJS.Workbook();
      wb.creator = "نظام إدهام ERP";
      wb.created = new Date();

      const ws = wb.addWorksheet("كشف حساب بنكي", {
        views: [{ rtl: true, showGridLines: true }],
        pageSetup: { orientation: 'landscape', paperSize: 9 }
      });

      // Columns configuration (A to I = 9 columns)
      ws.columns = [
        { key: 'num',     width: 7 },
        { key: 'date',    width: 14 },
        { key: 'bank',    width: 20 },
        { key: 'type',    width: 18 },
        { key: 'ref',     width: 18 },
        { key: 'notes',   width: 42 },
        { key: 'inflow',  width: 16 },
        { key: 'outflow', width: 16 },
        { key: 'balance', width: 18 }
      ];

      // Fonts & Fills
      const fontHeaderTitle = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
      const fontSubTitle    = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } };
      const fontMeta        = { name: 'Arial', size: 9.5, italic: true, color: { argb: 'FF1E293B' } };
      const fontColHeader   = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      const fontData        = { name: 'Arial', size: 9.5 };
      const fontBold        = { name: 'Arial', size: 9.5, bold: true };
      const fontGreen       = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF15803D' } };
      const fontRed         = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FFB91C1C' } };

      const fillNavy    = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      const fillBlue    = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
      const fillLight   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
      const fillHeader  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      const fillAltRow  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      const fillTotal   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      const fillKpiBox  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      const fillKpiGrn  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
      const fillKpiRed  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };

      const borderThin = {
        top:    { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left:   { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right:  { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };

      // Row 1: Company Title
      ws.mergeCells('A1:I1');
      const c1 = ws.getCell('A1');
      c1.value = "شركة نظم الإمداد المتطورة — المنظومة المحاسبية المتكاملة";
      c1.font = fontHeaderTitle;
      c1.fill = fillNavy;
      c1.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(1).height = 32;

      // Row 2: Bank Statement Title
      ws.mergeCells('A2:I2');
      const c2 = ws.getCell('A2');
      c2.value = \`كشف حساب بنكي رسمي: \${bankName} — الآيبان: \${iban} \${accNum !== '—' ? \`| رقم الحساب: \${accNum}\` : ''}\`;
      c2.font = fontSubTitle;
      c2.fill = fillBlue;
      c2.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(2).height = 26;

      // Row 3: Metadata
      ws.mergeCells('A3:I3');
      const c3 = ws.getCell('A3');
      const fromStr = from ? formatDate(from) : 'بداية الحركات';
      const toStr   = to   ? formatDate(to)   : 'تاريخ اليوم';
      c3.value = \`الفترة المستخرجة: من \${fromStr} إلى \${toStr} | تاريخ الاستخراج: \${new Date().toLocaleString('ar-SA')} | إجمالي الحركات: \${txns.length}\`;
      c3.font = fontMeta;
      c3.fill = fillLight;
      c3.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(3).height = 22;

      // Row 4: Summary KPIs
      ws.mergeCells('A4:B4');
      const k1 = ws.getCell('A4');
      k1.value = \`الرصيد المتاح: \${formatCurrency(currentBalance)}\`;
      k1.font = fontBold;
      k1.fill = fillKpiBox;
      k1.alignment = { horizontal: 'center', vertical: 'middle' };

      ws.mergeCells('C4:D4');
      const k2 = ws.getCell('C4');
      k2.value = \`إجمالي الوارد (+): +\${formatCurrency(totalIn)}\`;
      k2.font = { ...fontBold, color: { argb: 'FF15803D' } };
      k2.fill = fillKpiGrn;
      k2.alignment = { horizontal: 'center', vertical: 'middle' };

      ws.mergeCells('E4:F4');
      const k3 = ws.getCell('E4');
      k3.value = \`إجمالي المنصرف (-): -\${formatCurrency(totalOut)}\`;
      k3.font = { ...fontBold, color: { argb: 'FFB91C1C' } };
      k3.fill = fillKpiRed;
      k3.alignment = { horizontal: 'center', vertical: 'middle' };

      ws.mergeCells('G4:I4');
      const k4 = ws.getCell('G4');
      k4.value = \`صافي حركة الفترة: \${netDiff >= 0 ? '+' : ''}\${formatCurrency(netDiff)}\`;
      k4.font = { ...fontBold, color: { argb: netDiff >= 0 ? 'FF15803D' : 'FFB91C1C' } };
      k4.fill = fillKpiBox;
      k4.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(4).height = 26;

      // Row 5: Column Headers
      const colHeaders = [
        "م",
        "التاريخ",
        "البنك",
        "نوع الحركة",
        "رقم المرجع / الحوالة",
        "البيان والتفاصيل",
        "وارد (+) (ر.س)",
        "صادر (-) (ر.س)",
        "الرصيد بعد الحركة (ر.س)"
      ];

      const r5 = ws.getRow(5);
      colHeaders.forEach((h, i) => {
        const cell = r5.getCell(i + 1);
        cell.value = h;
        cell.font = fontColHeader;
        cell.fill = fillHeader;
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = borderThin;
      });
      r5.height = 28;

      // Row 6+: Data Rows
      txns.forEach((t, idx) => {
        const rowNum = 6 + idx;
        const row = ws.getRow(rowNum);
        const isIncome = t.type === 'in';
        const amt = Number(t.amount || 0);
        const isAlt = idx % 2 === 1;

        const vals = [
          idx + 1,
          formatDate(t.date || t.createdAt),
          bMap[t.bankAccountId] || t.bankAccountId,
          isIncome ? "إيداع وارد (+)" : "تحويل صادر (-)",
          t.refNumber || "—",
          t.notes || "—",
          isIncome ? amt : 0,
          !isIncome ? amt : 0,
          Number(t.balanceAfter || 0)
        ];

        vals.forEach((v, cIdx) => {
          const cell = row.getCell(cIdx + 1);
          cell.value = v;
          cell.border = borderThin;
          cell.fill = isAlt ? fillAltRow : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };

          if (cIdx === 0) {
            cell.font = fontBold;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else if (cIdx === 1) {
            cell.font = fontBold;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else if (cIdx === 2 || cIdx === 3) {
            cell.font = cIdx === 3 ? (isIncome ? fontGreen : fontRed) : fontData;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else if (cIdx === 4) {
            cell.font = fontData;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else if (cIdx === 5) {
            cell.font = fontData;
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
          } else if (cIdx >= 6) {
            cell.font = cIdx === 6 ? fontGreen : (cIdx === 7 ? fontRed : fontBold);
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
            cell.numFmt = '#,##0.00';
          }
        });

        row.height = 22;
      });

      // Total Row at bottom
      const totalRowNum = 6 + txns.length;
      const totRow = ws.getRow(totalRowNum);
      ws.mergeCells(\`A\${totalRowNum}:F\${totalRowNum}\`);
      const totLabel = totRow.getCell(1);
      totLabel.value = "الإجمالي الكلي للحركات المعروضة";
      totLabel.font = fontBold;
      totLabel.fill = fillTotal;
      totLabel.alignment = { horizontal: 'center', vertical: 'middle' };

      for (let c = 1; c <= 6; c++) totRow.getCell(c).border = borderThin;

      // Inflow sum
      const cIn = totRow.getCell(7);
      cIn.value = totalIn;
      cIn.font = fontGreen;
      cIn.fill = fillTotal;
      cIn.numFmt = '#,##0.00';
      cIn.alignment = { horizontal: 'left', vertical: 'middle' };
      cIn.border = borderThin;

      // Outflow sum
      const cOut = totRow.getCell(8);
      cOut.value = totalOut;
      cOut.font = fontRed;
      cOut.fill = fillTotal;
      cOut.numFmt = '#,##0.00';
      cOut.alignment = { horizontal: 'left', vertical: 'middle' };
      cOut.border = borderThin;

      // Current Bank Balance
      const cBal = totRow.getCell(9);
      cBal.value = currentBalance;
      cBal.font = fontBold;
      cBal.fill = fillTotal;
      cBal.numFmt = '#,##0.00';
      cBal.alignment = { horizontal: 'left', vertical: 'middle' };
      cBal.border = borderThin;

      totRow.height = 26;

      // Write and download
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = \`\${fileName}.xlsx\`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      if (window.showToast) window.showToast("تم تصدير كشف الحساب البنكي إلى Excel بنجاح ✅", "success");
      return;
    } catch (excelErr) {
      console.warn("ExcelJS export failed, falling back to basic export:", excelErr);
    }
  }

  // Fallback: simple table export
  if (typeof exportPageExcel === "function") {
    exportPageExcel('.data-dense', fileName);
  }
};
`;

if (!code.includes("window.exportBankStatementExcel = ")) {
  code += exportFunctionCode;
  console.log("✓ Added exportBankStatementExcel function");
}

// Convert back to original line endings
if (isCRLF) {
  code = code.replace(/\n/g, "\r\n");
}

fs.writeFileSync(filePath, code, "utf8");
console.log("bank-accounts.js patched and saved successfully!");
