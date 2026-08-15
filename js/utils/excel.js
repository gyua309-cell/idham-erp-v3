// ============================================================
// IDHAM ERP — Professional Excel Import / Export Utility
// Uses SheetJS (xlsx) loaded dynamically via CDN
// ============================================================

let _xlsxLoaded = false;
let XLSX = null;

/** Load SheetJS from CDN on-demand */
async function loadXLSX() {
  if (_xlsxLoaded && window.XLSX) { XLSX = window.XLSX; return; }
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = () => { XLSX = window.XLSX; _xlsxLoaded = true; resolve(); };
    s.onerror = () => reject(new Error('فشل تحميل مكتبة Excel'));
    document.head.appendChild(s);
  });
}

// ─── Color Palette ──────────────────────────────────────────
const BRAND_BLUE  = '1E3A8A';
const LIGHT_BLUE  = 'EFF6FF';
const HEADER_FONT = 'FFFFFF';
const BORDER_CLR  = 'CBD5E1';
const ALT_ROW     = 'F8FAFC';

/** Build a styled workbook cell range from an array of arrays */
function buildStyledSheet(headers, rows, colWidths) {
  const data = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Column widths
  ws['!cols'] = colWidths.map(w => ({ wch: w }));

  // Style header row
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let C = range.s.c; C <= range.e.c; C++) {
    const hCell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
    if (!hCell) continue;
    hCell.s = {
      font:    { bold: true, color: { rgb: HEADER_FONT }, name: 'Calibri', sz: 11 },
      fill:    { patternType: 'solid', fgColor: { rgb: BRAND_BLUE } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border:  borderAll(BORDER_CLR),
    };
  }

  // Style data rows
  for (let R = 1; R <= range.e.r; R++) {
    const isAlt = R % 2 === 0;
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { t: 's', v: '' };
      ws[addr].s = {
        fill:      { patternType: 'solid', fgColor: { rgb: isAlt ? ALT_ROW : 'FFFFFF' } },
        alignment: { vertical: 'center', wrapText: false },
        border:    borderAll(BORDER_CLR),
        font:      { name: 'Calibri', sz: 10 },
      };
    }
  }

  ws['!rows'] = [{ hpt: 28 }]; // header row height
  return ws;
}

function borderAll(clr) {
  const b = { style: 'thin', color: { rgb: clr } };
  return { top: b, bottom: b, left: b, right: b };
}

/** Add a summary info sheet */
function buildInfoSheet(title, exportedBy, totalRows) {
  const now = new Date().toLocaleString('ar-SA');
  const rows = [
    ['إدهام للمواد الغذائية — نظام ERP'],
    [],
    ['التقرير',  title],
    ['تاريخ التصدير', now],
    ['عدد السجلات', totalRows],
    ['صادر بواسطة', exportedBy || 'النظام'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 22 }, { wch: 40 }];
  // Style title
  const t = ws['A1'];
  if (t) t.s = { font: { bold: true, sz: 14, color: { rgb: BRAND_BLUE }, name: 'Calibri' }, fill: { patternType: 'solid', fgColor: { rgb: LIGHT_BLUE } } };
  return ws;
}

/**
 * Generic export function
 * @param {string} title         - Sheet / file title
 * @param {string[]} headers     - Column header labels
 * @param {Array[]}  rows        - 2D array of row values
 * @param {number[]} colWidths   - Column widths in chars
 * @param {string}   [user]      - Current user name for info sheet
 */
export async function exportToExcel({ title, headers, rows, colWidths, user = '' }) {
  await loadXLSX();
  const wb = XLSX.utils.book_new();
  wb.Props = { Title: title, Company: 'إدهام للمواد الغذائية', CreatedDate: new Date() };

  const dataSheet = buildStyledSheet(headers, rows, colWidths);
  XLSX.utils.book_append_sheet(wb, dataSheet, title.substring(0, 31));

  const infoSheet = buildInfoSheet(title, user, rows.length);
  XLSX.utils.book_append_sheet(wb, infoSheet, 'معلومات');

  const filename = `${title}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename, { bookType: 'xlsx', type: 'binary', cellStyles: true });
}

// ─── Import helper ───────────────────────────────────────────

/**
 * Parse an Excel file and return its first sheet as an array of objects
 * keyed by the first-row headers.
 * @param {File} file
 * @returns {Promise<{headers: string[], rows: Object[]}>}
 */
export async function importFromExcel(file) {
  await loadXLSX();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data    = new Uint8Array(e.target.result);
        const wb      = XLSX.read(data, { type: 'array', cellText: false, cellDates: true });
        const shName  = wb.SheetNames[0];
        const ws      = wb.Sheets[shName];
        const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        if (rawRows.length < 2) { reject(new Error('الملف فارغ أو لا يحتوي على بيانات')); return; }
        const headers = rawRows[0].map(h => String(h).trim());
        const rows    = rawRows.slice(1)
          .filter(r => r.some(v => v !== '' && v !== null && v !== undefined))
          .map(r => {
            const obj = {};
            headers.forEach((h, i) => { obj[h] = r[i] !== undefined ? r[i] : ''; });
            return obj;
          });
        resolve({ headers, rows });
      } catch (err) {
        reject(new Error('فشل قراءة الملف: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('فشل فتح الملف'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Trigger a file input dialog and return the selected file
 * @returns {Promise<File>}
 */
export function pickExcelFile() {
  return new Promise((resolve, reject) => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.xlsx,.xls,.csv';
    inp.onchange = () => {
      if (inp.files && inp.files[0]) resolve(inp.files[0]);
      else reject(new Error('لم يتم اختيار ملف'));
    };
    inp.click();
  });
}

/**
 * Download a template Excel file with given headers and sample row
 * @param {string}   title
 * @param {string[]} headers
 * @param {Array[]}  sampleRows
 * @param {number[]} colWidths
 */
export async function downloadTemplate({ title, headers, sampleRows = [], colWidths }) {
  await loadXLSX();
  const wb = XLSX.utils.book_new();
  const ws = buildStyledSheet(headers, sampleRows, colWidths || headers.map(() => 20));
  XLSX.utils.book_append_sheet(wb, ws, 'البيانات');

  // Instructions sheet
  const instrWs = XLSX.utils.aoa_to_sheet([
    ['تعليمات الاستيراد'],
    [],
    ['1. لا تغيِّر أسماء الأعمدة في الصف الأول'],
    ['2. ابدأ البيانات من الصف الثاني'],
    ['3. الأعمدة المميزة بـ (*) إلزامية'],
    ['4. احفظ الملف بصيغة .xlsx قبل الرفع'],
    ['5. الحد الأقصى 5000 سجل في الاستيراد الواحد'],
  ]);
  instrWs['!cols'] = [{ wch: 55 }];
  XLSX.utils.book_append_sheet(wb, instrWs, 'تعليمات');

  XLSX.writeFile(wb, `نموذج_${title}.xlsx`, { bookType: 'xlsx', type: 'binary', cellStyles: true });
}
