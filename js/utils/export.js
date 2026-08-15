// ============================================================
// IDHAM ERP — Global Export Utilities (PDF + XLSX + Print)
// يُستخدم في جميع أقسام النظام — v3.0
// جميع المستندات تحمل بيانات الشركة من الإعدادات
// ============================================================

// ── SheetJS lazy loader ───────────────────────────────────────
let _xlsxPromise = null;
async function loadXLSX() {
  if (window.XLSX) return window.XLSX;
  if (_xlsxPromise) return _xlsxPromise;
  _xlsxPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload  = () => resolve(window.XLSX);
    s.onerror = () => reject(new Error("تعذّر تحميل مكتبة SheetJS"));
    document.head.appendChild(s);
  });
  return _xlsxPromise;
}

// ── Helpers ───────────────────────────────────────────────────
function _toast(msg, type = "info") {
  if (typeof window.showToast === "function") window.showToast(msg, type);
}

/**
 * يجلب بيانات الشركة من localStorage (يُحفظ عند الحفظ في الإعدادات)
 */
function _companyInfo() {
  try {
    const raw = localStorage.getItem("idham_company");
    if (raw) return JSON.parse(raw);
    // Fallback: try window.ERP_COMPANY if available
    if (window.ERP_COMPANY) return window.ERP_COMPANY;
    return {};
  } catch { return {}; }
}

function _nowStrings() {
  const now = new Date();
  return {
    date: now.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }),
    time: now.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
    fileStamp: now.toISOString().replace(/[:.]/g, "-").slice(0, 19),
  };
}

// ── Column auto-width for SheetJS ────────────────────────────
function _calcColWidths(headers, rows) {
  return headers.map((h, col) => {
    let max = String(h).length;
    rows.forEach(r => { const v = String(r[col] ?? ""); if (v.length > max) max = v.length; });
    return { wch: Math.min(Math.max(max + 2, 8), 60) };
  });
}

// ── Number detector ──────────────────────────────────────────
function _tryNumber(val) {
  if (typeof val === "number") return val;
  if (typeof val !== "string") return val;
  const cleaned = val.replace(/,/g, "").replace(/ر\.س\.?/g, "").trim();
  const n = Number(cleaned);
  return isNaN(n) ? val : n;
}

// ── Build company header lines for Excel ─────────────────────
function _buildExcelHeader(company, title, date, time) {
  const lines = [];
  lines.push([company.name || "—"]);
  if (company.address || company.city) {
    lines.push([`${company.address || ""}${company.city ? "، " + company.city : ""}`.trim()]);
  }
  const infoLine = [];
  if (company.phone)     infoLine.push(`هاتف: ${company.phone}`);
  if (company.vatNumber) infoLine.push(`رقم ضريبي: ${company.vatNumber}`);
  if (company.crNumber)  infoLine.push(`سجل تجاري: ${company.crNumber}`);
  if (infoLine.length)   lines.push([infoLine.join("   |   ")]);
  lines.push([`${title}`]);
  lines.push([`تاريخ التصدير: ${date} — ${time}`]);
  lines.push([]); // separator
  return lines;
}

// ═══════════════════════════════════════════════════════════════
// 1. exportXLSX — Real Excel with SheetJS
// ═══════════════════════════════════════════════════════════════
/**
 * @param {Object} opts
 * @param {string}   opts.filename    - اسم الملف بدون امتداد
 * @param {string}   opts.title       - عنوان التقرير
 * @param {string[]} opts.headers     - رؤوس الأعمدة
 * @param {Array[]}  opts.rows        - صفوف البيانات
 * @param {string}  [opts.sheetName]  - اسم الورقة
 * @param {Object}  [opts.summary]    - ملخص {label: value} يُكتب فوق الجدول
 */
export async function exportXLSX({ filename, title = "", headers, rows, sheetName = "بيانات", summary = null }) {
  if (!rows || rows.length === 0) { _toast("لا توجد بيانات للتصدير", "warning"); return; }

  try {
    const XLSX = await loadXLSX();
    const company = _companyInfo();
    const { date, time } = _nowStrings();

    // Build AOA (array of arrays)
    const aoa = [];

    // ── Company header ──
    const headerBlock = _buildExcelHeader(company, title || filename, date, time);
    headerBlock.forEach(l => aoa.push(l));

    // ── Summary KPIs ──
    if (summary) {
      Object.entries(summary).forEach(([k, v]) => aoa.push([k, _tryNumber(v)]));
      aoa.push([]); // separator
    }

    // ── Table headers ──
    const headerRowIdx = aoa.length; // track for styling
    aoa.push(headers);

    // ── Data rows — convert numbers intelligently ──
    rows.forEach(r => aoa.push(r.map(_tryNumber)));

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Column widths (based on table data only)
    ws["!cols"] = _calcColWidths(headers, rows);

    // Merge first cell (company name) across all columns
    if (!ws["!merges"]) ws["!merges"] = [];
    const totalCols = headers.length - 1;
    // Merge company name row
    ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(totalCols, 2) } });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName || title || "تقرير");
    XLSX.writeFile(wb, `${filename}.xlsx`);
    _toast(`تم تصدير ${rows.length} سجل إلى Excel ✅`, "success");
  } catch (err) {
    console.error("exportXLSX error:", err);
    // Fallback to CSV
    exportCSV({ filename, headers, rows });
    _toast("تم التصدير بصيغة CSV (SheetJS غير متاح)", "warning");
  }
}

// ═══════════════════════════════════════════════════════════════
// 2. exportCSV — Fallback CSV with Arabic BOM
// ═══════════════════════════════════════════════════════════════
export function exportCSV({ filename, headers, rows }) {
  if (!rows || rows.length === 0) { _toast("لا توجد بيانات للتصدير", "warning"); return; }
  const BOM = "\uFEFF";
  const csv = [
    headers.join(","),
    ...rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
  ].join("\n");
  _downloadBlob(new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" }), `${filename}.csv`);
}

// ═══════════════════════════════════════════════════════════════
// 3. exportExcel — Alias kept for backward-compat (uses XLSX now)
// ═══════════════════════════════════════════════════════════════
export function exportExcel(opts) {
  return exportXLSX(opts);
}

// ═══════════════════════════════════════════════════════════════
// 4. exportPDF — Arabic RTL print window — company branded
// ═══════════════════════════════════════════════════════════════
/**
 * @param {Object}  opts
 * @param {string}   opts.title
 * @param {string}  [opts.subtitle]
 * @param {string[]} opts.headers
 * @param {Array[]}  opts.rows
 * @param {string}  [opts.filename]
 * @param {Object}  [opts.summary]     - {label: value}
 * @param {string}  [opts.orientation] - "landscape" | "portrait"
 */
export function exportPDF({ title, subtitle, headers, rows, filename, summary, orientation = "landscape" }) {
  if (!rows || rows.length === 0) { _toast("لا توجد بيانات للتصدير", "warning"); return; }

  const company = _companyInfo();
  const { date, time } = _nowStrings();

  // ── Company info fields ──
  const companyName    = company.name    || "";
  const companyAddress = [company.address, company.city, company.country]
                           .filter(Boolean).join("، ");
  const companyPhone   = company.phone   || "";
  const companyEmail   = company.email   || "";
  const companyVAT     = company.vatNumber || "";
  const companyCR      = company.crNumber  || "";
  const companyLogo    = company.logoBase64 || company.logoUrl || "";
  const primaryColor   = company.primaryColor || "#4f46e5";

  const isLandscape = orientation === "landscape";

  // Build summary bar HTML
  const summaryHTML = summary ? `
  <div class="sumbar">
    ${Object.entries(summary).map(([k, v]) => `
      <div class="sumitem">
        <div class="lbl">${k}</div>
        <div class="val">${v}</div>
      </div>`).join("")}
  </div>` : "";

  // Build company info block
  const companyInfoHTML = `
    ${companyAddress ? `<div class="co-line">📍 ${companyAddress}</div>` : ""}
    ${companyPhone   ? `<div class="co-line">📞 ${companyPhone}</div>` : ""}
    ${companyEmail   ? `<div class="co-line">✉️ ${companyEmail}</div>` : ""}
    ${companyVAT     ? `<div class="co-line">🔢 الرقم الضريبي: ${companyVAT}</div>` : ""}
    ${companyCR      ? `<div class="co-line">📋 السجل التجاري: ${companyCR}</div>` : ""}
  `;

  const printHTML = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${companyName ? companyName + " — " : ""}${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: ${isLandscape ? "A4 landscape" : "A4"}; margin: 8mm 10mm; }
    body {
      font-family: 'IBM Plex Sans Arabic', 'Segoe UI', Tahoma, sans-serif;
      font-size: 10px; color: #111; direction: rtl;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }

    /* ── Company Header ── */
    .company-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 14px 16px;
      background: ${primaryColor};
      color: #fff;
      border-radius: 8px 8px 0 0;
      margin-bottom: 0;
    }
    .co-left { display: flex; align-items: center; gap: 12px; }
    .co-logo { max-height: 56px; max-width: 120px; object-fit: contain;
               background: #fff; padding: 4px; border-radius: 6px; }
    .co-name { font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 4px; }
    .co-line { font-size: 9px; color: rgba(255,255,255,0.85); margin-bottom: 2px; }

    /* ── Document Title Strip ── */
    .doc-strip {
      background: #1a1a2e;
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      margin-bottom: 12px;
    }
    .doc-title { font-size: 14px; font-weight: 700; }
    .doc-sub   { font-size: 9px; color: rgba(255,255,255,0.7); }
    .doc-date  { font-size: 9px; color: rgba(255,255,255,0.75); text-align: left; }

    /* ── Summary bar ── */
    .sumbar { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px; }
    .sumitem { flex:1; min-width:90px; background:#f0f2ff; border:1px solid #d0d2f0;
               border-radius:6px; padding:6px 10px; text-align:center; }
    .sumitem .lbl { font-size:8px; color:#666; margin-bottom:2px; }
    .sumitem .val { font-size:13px; font-weight:700; color:#1a1a2e; }

    /* ── Table ── */
    table { width:100%; border-collapse:collapse; }
    thead th {
      background: #1a1a2e; color:#fff; padding:7px 8px;
      font-size:9px; font-weight:700; text-align:right; white-space:nowrap;
    }
    tbody td { padding:5px 8px; font-size:9px; border-bottom:1px solid #e8e8e8; text-align:right; }
    tbody tr:nth-child(even) { background:#f8f9ff; }
    .mono { font-variant-numeric:tabular-nums; direction:ltr; text-align:left; }

    /* ── Footer ── */
    .ftr {
      margin-top: 14px; padding-top: 8px;
      border-top: 2px solid ${primaryColor};
      display: flex; justify-content: space-between;
      font-size: 8px; color: #666;
    }
    .ftr-stamp { font-weight: 600; color: #333; }

    @media print {
      body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    }
  </style>
</head>
<body>

  <!-- Company Header -->
  <div class="company-header">
    <div class="co-left">
      ${companyLogo ? `<img class="co-logo" src="${companyLogo}" alt="شعار الشركة">` : ""}
      <div>
        <div class="co-name">${companyName}</div>
        ${companyInfoHTML}
      </div>
    </div>
    <div style="text-align:left; color:rgba(255,255,255,0.8); font-size:9px;">
      <div style="font-size:11px; font-weight:700; color:#fff; margin-bottom:4px;">${date}</div>
      <div>${time}</div>
    </div>
  </div>

  <!-- Document Title Strip -->
  <div class="doc-strip">
    <div>
      <div class="doc-title">${title}</div>
      ${subtitle ? `<div class="doc-sub">${subtitle}</div>` : ""}
    </div>
    <div class="doc-date">
      عدد السجلات: <strong style="color:#fff;">${rows.length}</strong>
    </div>
  </div>

  ${summaryHTML}

  <table>
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>
      ${rows.map(row => `<tr>${row.map(cell => {
        const s = String(cell ?? "");
        const isNum = typeof cell === "number" || /^[\d,.-]+$/.test(s.replace(/ر\.س\.?/g, "").trim());
        return `<td${isNum ? ' class="mono"' : ""}>${s}</td>`;
      }).join("")}</tr>`).join("")}
    </tbody>
  </table>

  <div class="ftr">
    <span class="ftr-stamp">${companyName}</span>
    <span>${date} — ${time}</span>
  </div>

</body>
</html>`;

  const win = window.open("", "_blank", "width=960,height=720");
  if (!win) { _toast("يُرجى السماح بالنوافذ المنبثقة للتصدير", "warning"); return; }
  win.document.write(printHTML);
  win.document.close();
  win.onload = () => setTimeout(() => win.print(), 700);
  _toast("جاري تحضير PDF...", "info");
}

// ═══════════════════════════════════════════════════════════════
// 5. exportFromTable — Extract from visible HTML table
// ═══════════════════════════════════════════════════════════════
/**
 * @param {string} tableSelector  - CSS selector
 * @param {string} filename
 * @param {string} title
 * @param {'pdf'|'excel'|'print'} format
 * @param {Object} [summary]
 */
export function exportFromTable(tableSelector, filename, title, format = "pdf", summary = null) {
  const table = document.querySelector(tableSelector);
  if (!table) { _toast("لم يتم العثور على جدول البيانات", "error"); return; }

  const skipTexts = new Set(["إجراءات", "actions", "#", ""]);
  const headers = [];
  const headerIndices = [];

  table.querySelectorAll("thead th").forEach((th, i) => {
    const t = th.textContent.trim();
    if (!skipTexts.has(t.toLowerCase())) { headers.push(t); headerIndices.push(i); }
  });

  const rows = [];
  table.querySelectorAll("tbody tr").forEach(tr => {
    if (tr.classList.contains("skeleton-row") || tr.classList.contains("empty-row")) return;
    const tds = tr.querySelectorAll("td");
    const row = headerIndices.map(i => tds[i]?.textContent.trim() ?? "");
    if (row.some(c => c !== "")) rows.push(row);
  });

  if (format === "pdf")    return exportPDF({ title, headers, rows, filename, summary });
  if (format === "excel")  return exportXLSX({ filename, title, headers, rows, summary });
  if (format === "print")  return printPage();
}

// ═══════════════════════════════════════════════════════════════
// 6. renderExportButtons — Unified toolbar buttons HTML
// ═══════════════════════════════════════════════════════════════
export function renderExportButtons({ tableSelector, title, pdfFn, excelFn, printFn } = {}) {
  const safeTitle    = (title || "تقرير").replace(/'/g, "\\'");
  const safeFile     = safeTitle.replace(/\s+/g, "_");
  const safeSelector = (tableSelector || ".data-dense").replace(/'/g, "\\'");

  const pdfCall   = pdfFn   || `exportFromTable('${safeSelector}','${safeFile}','${safeTitle}','pdf')`;
  const excelCall = excelFn || `exportFromTable('${safeSelector}','${safeFile}','${safeTitle}','excel')`;
  const printCall = printFn || `window.print()`;

  return `
    <button class="btn-export" onclick="${pdfCall}" title="تصدير PDF">
      <span>📄</span> PDF
    </button>
    <button class="btn-export excel" onclick="${excelCall}" title="تصدير Excel">
      <span>📊</span> Excel
    </button>
    <button class="btn-export print" onclick="${printCall}" title="طباعة">
      <span>🖨️</span> طباعة
    </button>`;
}

// ═══════════════════════════════════════════════════════════════
// 7. printPage — Clean window.print()
// ═══════════════════════════════════════════════════════════════
export function printPage() {
  window.print();
}

// ── Helper ───────────────────────────────────────────────────
function _downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
}
