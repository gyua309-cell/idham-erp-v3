// ============================================================
// IDHAM ERP — مركز تقارير المخزون الاحترافية
// 5 tabs · 24 report types · Full Arabic UI · Single load
// ============================================================
import { COLS, getAll, query, orderBy, where, limit, getDocs, create, update } from '../../utils/db.js';
import { formatCurrency, formatQuantity, todayString } from '../../utils/formatters.js';
import { db, COMPANY_ID } from '../../firebase-config.js';
import { collection, query as fbQuery, where as fbWhere, orderBy as fbOrderBy, getDocs as fbGetDocs, Timestamp, limit as fbLimit } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

// ─── Module-level state ────────────────────────────────────────────────────────
let _products    = [];
let _categories  = [];
let _warehouses  = [];
let _stock       = [];      // stockByWarehouse records
let _txns        = [];      // stockTransactions records
let _adjustments = [];      // inventoryAdjustments records
let _physCounts  = [];      // physicalCounts records
let _dataLoaded  = false;

let _activeTab    = 'tab-basic';
let _activeReport = 'r-item-card';
let _sortCol      = null;
let _sortAsc      = true;
let _currentData  = [];     // last rendered dataset for export
let _reportRenderLimit = 100;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const safeHtml = (id, html) => { const el = $(id); if (el) el.innerHTML = html; };

function parseDate(v) {
  if (!v) return null;
  if (v?.toDate) return v.toDate();
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function daysBetween(a, b) {
  if (!a || !b) return Infinity;
  return Math.round((b - a) / 86400000);
}

function getFilters() {
  return {
    dateFrom: $('ir-date-from')?.value || '',
    dateTo:   $('ir-date-to')?.value   || '',
    whId:     $('ir-wh')?.value        || '',
    catId:    $('ir-cat')?.value       || '',
    search:   ($('ir-search')?.value   || '').trim().toLowerCase(),
  };
}

function matchesFilters(item, f) {
  if (f.whId  && item.warehouseId && item.warehouseId !== f.whId)  return false;
  if (f.catId && item.categoryId  && item.categoryId  !== f.catId) return false;
  if (f.search) {
    const hay = `${item.name||''} ${item.productName||''} ${item.sku||''} ${item.barcode||''}`.toLowerCase();
    if (!hay.includes(f.search)) return false;
  }
  return true;
}

function inDateRange(dateVal, dateFrom, dateTo) {
  if (!dateFrom && !dateTo) return true;
  const d = parseDate(dateVal);
  if (!d) return false;
  const ds = d.toISOString().slice(0, 10);
  if (dateFrom && ds < dateFrom) return false;
  if (dateTo   && ds > dateTo)   return false;
  return true;
}

function csvExport(rows, filename) {
  const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv' }));
  a.download = `${filename}_${todayString()}.csv`;
  a.click();
  window.showToast('تم تصدير الملف بنجاح', 'success');
}

function renderEmpty(msg = 'لا توجد بيانات للعرض', colCount = 6) {
  return `<tr><td colspan="${colCount}" style="text-align:center;padding:32px;color:var(--text-2);">
    <div style="font-size:32px;margin-bottom:8px;">📭</div>
    <div>${msg}</div>
  </td></tr>`;
}

function kpiCard(icon, label, value, color = 'indigo', sub = '') {
  return `<div class="kpi-card">
    <div class="status-bar ${color}"></div>
    <div class="kpi-icon ${color}" style="font-size:22px;">${icon}</div>
    <div class="kpi-content">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value mono text-${color}" style="font-size:1.25rem;">${value}</div>
      ${sub ? `<div class="dim" style="font-size:11px;margin-top:2px;">${sub}</div>` : ''}
    </div>
  </div>`;
}

function sortableHeader(col, label, current, asc) {
  const arrow = current === col ? (asc ? ' ▲' : ' ▼') : ' ⇅';
  return `<th style="cursor:pointer;user-select:none;white-space:nowrap;" onclick="irSortBy('${col}')">${label}<span style="opacity:.5;font-size:10px;">${arrow}</span></th>`;
}

function buildSortableTable(headers, rows, totalRow = null) {
  const ths = headers.map(h =>
    h.sortable
      ? sortableHeader(h.key, h.label, _sortCol, _sortAsc)
      : `<th>${h.label}</th>`
  ).join('');

  // Client-side pagination for rendering to avoid DOM overload
  const visibleRows = rows.slice(0, _reportRenderLimit);

  let trs = visibleRows.map(r => {
    const cls = r._rowClass ? ` class="${r._rowClass}"` : '';
    const cells = headers.map(h => `<td>${r[h.key] ?? ''}</td>`).join('');
    return `<tr${cls}>${cells}</tr>`;
  }).join('');

  if (!trs) trs = renderEmpty('لا توجد بيانات مطابقة', headers.length);

  // Add load more button if there are more rows remaining
  if (rows.length > _reportRenderLimit) {
    const remaining = rows.length - _reportRenderLimit;
    trs += `
      <tr class="no-print">
        <td colspan="${headers.length}" style="text-align:center; padding:12px; background:var(--bg-2);">
          <button class="btn btn-secondary btn-sm" onclick="window.irLoadMoreReportRows()" style="width:240px; font-weight:600;">
             ➕ عرض المزيد (المتبقي ${remaining} صنف)
          </button>
        </td>
      </tr>
    `;
  }

  let totalTr = '';
  if (totalRow) {
    const cells = headers.map(h => `<td style="background:var(--bg-3);font-weight:700;">${totalRow[h.key] ?? ''}</td>`).join('');
    totalTr = `<tfoot><tr>${cells}</tr></tfoot>`;
  }

  return `<div class="table-container">
    <table class="data-dense" id="ir-table">
      <thead><tr>${ths}</tr></thead>
      <tbody>${trs}</tbody>
      ${totalTr}
    </table>
  </div>`;
}

// ─── Main render ───────────────────────────────────────────────────────────────
export async function render(container, user) {
  container.innerHTML = buildShell();
  setupGlobalHandlers();
  await loadWarehouses();
  await loadCategories();
  showReport(_activeTab, _activeReport);
}

function buildShell() {
  return `
<style>
.ir-tabs { display:flex; gap:0; border-bottom:2px solid var(--border-soft); margin-bottom:0; overflow-x:auto; }
.ir-tab  { padding:11px 16px; cursor:pointer; font-size:13px; font-weight:600; white-space:nowrap;
           border-bottom:3px solid transparent; margin-bottom:-2px; color:var(--text-2); transition:all .18s; }
.ir-tab:hover  { color:var(--brand); background:var(--bg-2); }
.ir-tab.active { color:var(--brand); border-bottom-color:var(--brand); background:var(--bg-2); }
.ir-sub-tabs { display:flex; flex-wrap:wrap; gap:6px; margin:12px 0 0 0; padding:0 2px; }
.ir-sub-tab  { padding:5px 12px; font-size:12px; cursor:pointer; border-radius:20px;
               border:1.5px solid var(--border-soft); color:var(--text-2); background:var(--bg-1); transition:all .15s; }
.ir-sub-tab:hover  { background:var(--bg-3); color:var(--text-1); }
.ir-sub-tab.active { background:var(--brand); color:#fff; border-color:var(--brand); }
.ir-report-area { margin-top:16px; }
.ir-kpi-row { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:16px; }
.ir-kpi-row .kpi-card { flex:1; min-width:150px; }
.badge-danger  { background:var(--bad);  color:#fff; padding:2px 8px; border-radius:12px; font-size:11px; white-space:nowrap; }
.badge-warn    { background:var(--warn); color:#fff; padding:2px 8px; border-radius:12px; font-size:11px; white-space:nowrap; }
.badge-good    { background:var(--good); color:#fff; padding:2px 8px; border-radius:12px; font-size:11px; white-space:nowrap; }
.badge-neutral { background:var(--bg-3); color:var(--text-1); padding:2px 8px; border-radius:12px; font-size:11px; white-space:nowrap; }
.row-bad  { background:rgba(239,68,68,.07) !important; }
.row-warn { background:rgba(251,146,60,.07) !important; }
.row-good { background:rgba(34,197,94,.05) !important; }
.abc-a { background:#6366f115 !important; }
.abc-b { background:#f59e0b15 !important; }
.abc-c { background:#6b728015 !important; }
.text-bad  { color:var(--bad)  !important; }
.text-warn { color:var(--warn) !important; }
.text-good { color:var(--good) !important; }
@media print {
  .no-print { display:none !important; }
  .ir-tabs, .ir-sub-tabs, .filterbar { display:none !important; }
}
</style>

<div class="page-content" style="padding:20px;">
  <div class="page-header no-print">
    <h2 class="page-title">مركز تقارير المخزون الاحترافية</h2>
    <p class="page-subtitle dim">٢٤ تقريراً تحليلياً في ٥ تبويبات · تحميل فوري · تصدير CSV · طباعة</p>
  </div>

  <!-- MAIN TABS -->
  <div class="ir-tabs no-print" id="ir-main-tabs">
    <div class="ir-tab active" data-tab="tab-basic"    onclick="irSwitchTab('tab-basic')">📦 المخزون الأساسي</div>
    <div class="ir-tab"       data-tab="tab-movement"  onclick="irSwitchTab('tab-movement')">🔄 الحركة والمعاملات</div>
    <div class="ir-tab"       data-tab="tab-expiry"    onclick="irSwitchTab('tab-expiry')">🏷️ الصلاحية والدفعات</div>
    <div class="ir-tab"       data-tab="tab-analysis"  onclick="irSwitchTab('tab-analysis')">📊 التحليل والأداء</div>
    <div class="ir-tab"       data-tab="tab-reorder"   onclick="irSwitchTab('tab-reorder')">🔔 إعادة الطلب</div>
  </div>

  <!-- SUB-TABS -->
  <div id="sub-tabs-basic" class="ir-sub-tabs no-print">
    <div class="ir-sub-tab active" onclick="irSwitchReport('tab-basic','r-item-card')">١. بطاقة الصنف</div>
    <div class="ir-sub-tab"       onclick="irSwitchReport('tab-basic','r-valuation')">٢. تقييم المخزون</div>
    <div class="ir-sub-tab"       onclick="irSwitchReport('tab-basic','r-aging')">٣. أعمار المخزون</div>
    <div class="ir-sub-tab"       onclick="irSwitchReport('tab-basic','r-wh-summary')">٤. ملخص المخازن</div>
  </div>
  <div id="sub-tabs-movement" class="ir-sub-tabs no-print" style="display:none;">
    <div class="ir-sub-tab active" onclick="irSwitchReport('tab-movement','r-daily-movement')">٥. الحركة اليومية</div>
    <div class="ir-sub-tab"       onclick="irSwitchReport('tab-movement','r-inout')">٦. الوارد والصادر</div>
    <div class="ir-sub-tab"       onclick="irSwitchReport('tab-movement','r-transfers')">٧. التحويلات</div>
    <div class="ir-sub-tab"       onclick="irSwitchReport('tab-movement','r-dispatch')">٨. الصرف المخزني</div>
    <div class="ir-sub-tab"       onclick="irSwitchReport('tab-movement','r-grpo')">٩. إذون الاستلام</div>
    <div class="ir-sub-tab"       onclick="irSwitchReport('tab-movement','r-stock-ledger')">٢٥. كرت الحركة العام للأصناف</div>
  </div>
  <div id="sub-tabs-expiry" class="ir-sub-tabs no-print" style="display:none;">
    <div class="ir-sub-tab active" onclick="irSwitchReport('tab-expiry','r-expired')">١٠. منتهية الصلاحية</div>
    <div class="ir-sub-tab"       onclick="irSwitchReport('tab-expiry','r-near-expiry')">١١. قريبة الانتهاء</div>
    <div class="ir-sub-tab"       onclick="irSwitchReport('tab-expiry','r-batch')">١٢. تتبع الدفعات</div>
    <div class="ir-sub-tab"       onclick="irSwitchReport('tab-expiry','r-lots')">١٣. تقرير التشغيلات</div>
    <div class="ir-sub-tab"       onclick="irSwitchReport('tab-expiry','r-production')">١٤. تواريخ الإنتاج</div>
  </div>
  <div id="sub-tabs-analysis" class="ir-sub-tabs no-print" style="display:none;">
    <div class="ir-sub-tab active" onclick="irSwitchReport('tab-analysis','r-abc')">١٥. تحليل ABC</div>
    <div class="ir-sub-tab"       onclick="irSwitchReport('tab-analysis','r-xyz')">١٦. تحليل XYZ</div>
    <div class="ir-sub-tab"       onclick="irSwitchReport('tab-analysis','r-dormant')">١٧. الأصناف الراكدة</div>
    <div class="ir-sub-tab"       onclick="irSwitchReport('tab-analysis','r-fast-moving')">١٨. سريعة الحركة</div>
    <div class="ir-sub-tab"       onclick="irSwitchReport('tab-analysis','r-turnover')">١٩. معدل الدوران</div>
    <div class="ir-sub-tab"       onclick="irSwitchReport('tab-analysis','r-waste')">٢٠. الفاقد والتالف</div>
    <div class="ir-sub-tab"       onclick="irSwitchReport('tab-analysis','r-accuracy')">٢١. دقة الجرد</div>
  </div>
  <div id="sub-tabs-reorder" class="ir-sub-tabs no-print" style="display:none;">
    <div class="ir-sub-tab active" onclick="irSwitchReport('tab-reorder','r-below-min')">٢٢. دون الحد الأدنى</div>
    <div class="ir-sub-tab"       onclick="irSwitchReport('tab-reorder','r-reorder-point')">٢٣. نقطة إعادة الطلب</div>
    <div class="ir-sub-tab"       onclick="irSwitchReport('tab-reorder','r-purchase-rec')">٢٤. توصيات الشراء</div>
  </div>

  <!-- FILTER BAR -->
  <div class="filterbar no-print" style="margin-top:12px;" id="ir-filterbar">
    <div class="filter-select-group">
      <label>من تاريخ</label>
      <input type="date" id="ir-date-from" class="input" style="padding:6px 10px;" onchange="irApplyFilters()">
    </div>
    <div class="filter-select-group">
      <label>إلى تاريخ</label>
      <input type="date" id="ir-date-to" class="input" style="padding:6px 10px;" value="${todayString()}" onchange="irApplyFilters()">
    </div>
    <div class="filter-select-group">
      <label>المخزن</label>
      <select id="ir-wh" class="input" onchange="irApplyFilters()"><option value="">الكل</option></select>
    </div>
    <div class="filter-select-group">
      <label>التصنيف</label>
      <select id="ir-cat" class="input" onchange="irApplyFilters()"><option value="">الكل</option></select>
    </div>
    <div class="filter-select-group" style="flex:1;min-width:180px;">
      <label>بحث</label>
      <input type="text" id="ir-search" class="input" placeholder="اسم الصنف أو الكود…" oninput="irApplyFilters()">
    </div>
    <div style="display:flex;gap:6px;align-items:flex-end;">
      <button class="btn btn-primary btn-sm" onclick="irApplyFilters()">🔍 تطبيق</button>
      <button class="btn btn-secondary btn-sm" onclick="irReloadData()">🔄 إعادة تحميل</button>
    </div>
  </div>

  <!-- REPORT CONTENT -->
  <div class="ir-report-area" id="ir-report-area">
    <div style="text-align:center;padding:60px;">
      <div class="loading-spinner" style="margin:0 auto 16px;"></div>
      <div class="dim">جاري تهيئة مركز التقارير…</div>
    </div>
  </div>
</div>`;
}

// ─── Global handlers ──────────────────────────────────────────────────────────
function setupGlobalHandlers() {
  window.irSwitchTab    = irSwitchTab;
  window.irSwitchReport = irSwitchReport;
  window.irApplyFilters = irApplyFilters;
  window.irReloadData   = irReloadData;
  window.irSortBy       = irSortBy;
  window.irExportCSV    = irExportCSV;
  window.irPrint        = () => window.print();
  window.irLoadMoreReportRows = () => {
    _reportRenderLimit += 100;
    showReport(_activeTab, _activeReport);
  };
}

function irSwitchTab(tabId) {
  _reportRenderLimit = 100;
  _activeTab = tabId;
  document.querySelectorAll('.ir-tab').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tabId);
  });
  ['basic', 'movement', 'expiry', 'analysis', 'reorder'].forEach(k => {
    const el = $(`sub-tabs-${k}`);
    if (el) el.style.display = tabId === `tab-${k}` ? 'flex' : 'none';
  });
  const firstReport = {
    'tab-basic':    'r-item-card',
    'tab-movement': 'r-daily-movement',
    'tab-expiry':   'r-expired',
    'tab-analysis': 'r-abc',
    'tab-reorder':  'r-below-min',
  }[tabId] || 'r-item-card';
  irSwitchReport(tabId, firstReport);
}

function irSwitchReport(tabId, reportId) {
  _reportRenderLimit = 100;
  _activeTab    = tabId;
  _activeReport = reportId;
  _sortCol      = null;
  _sortAsc      = true;
  const tabKey = tabId.replace('tab-', '');
  const subContainer = $(`sub-tabs-${tabKey}`);
  if (subContainer) {
    subContainer.querySelectorAll('.ir-sub-tab').forEach(el => {
      el.classList.toggle('active', el.getAttribute('onclick')?.includes(`'${reportId}'`));
    });
  }
  showReport(tabId, reportId);
}

function irApplyFilters() {
  _reportRenderLimit = 100;
  showReport(_activeTab, _activeReport);
}

async function irReloadData() {
  _dataLoaded = false;
  _products = []; _categories = []; _warehouses = [];
  _stock = []; _txns = []; _adjustments = []; _physCounts = [];
  safeHtml('ir-report-area', `<div style="text-align:center;padding:60px;">
    <div class="loading-spinner" style="margin:0 auto 16px;"></div>
    <div class="dim">جاري إعادة تحميل البيانات…</div>
  </div>`);
  await loadAllData();
  showReport(_activeTab, _activeReport);
}

function irSortBy(col) {
  if (_sortCol === col) _sortAsc = !_sortAsc;
  else { _sortCol = col; _sortAsc = true; }
  showReport(_activeTab, _activeReport);
}

function irExportCSV() {
  if (!_currentData.length) { window.showToast('لا توجد بيانات للتصدير', 'warn'); return; }
  const keys   = Object.keys(_currentData[0]).filter(k => !k.startsWith('_'));
  const rows   = _currentData.map(r => keys.map(k => r[k] ?? ''));
  csvExport([keys, ...rows], _activeReport);
}

// ─── Data loading ─────────────────────────────────────────────────────────────
async function loadWarehouses() {
  try {
    const whs = await getAll(COLS.warehouses(), [orderBy('name')]);
    const sel = $('ir-wh');
    if (sel) whs.forEach(w => sel.innerHTML += `<option value="${w.id}">${w.name}</option>`);
  } catch (e) { console.warn('loadWarehouses:', e); }
}

async function loadCategories() {
  try {
    const cats = await getAll(COLS.categories(), [orderBy('name')]);
    const sel = $('ir-cat');
    if (sel) cats.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
  } catch (e) { console.warn('loadCategories:', e); }
}

async function loadAllData() {
  if (_dataLoaded) return;
  try {
    [_products, _categories, _warehouses, _stock, _adjustments, _physCounts] = await Promise.all([
      getAll(COLS.products()),
      getAll(COLS.categories()),
      getAll(COLS.warehouses()),
      getAll(COLS.stockByWarehouse()),
      getAll(COLS.inventoryAdjustments()),
      getAll(COLS.physicalCounts()),
    ]);

    const txSnap = await getDocs(query(COLS.stockTransactions(), orderBy('createdAt', 'desc'), limit(2000)));
    _txns = txSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const prodMap = Object.fromEntries(_products.map(p => [p.id, p]));
    const whMap   = Object.fromEntries(_warehouses.map(w => [w.id, w]));
    const catMap  = Object.fromEntries(_categories.map(c => [c.id, c]));

    _stock.forEach(s => {
      const p = prodMap[s.productId] || {};
      const w = whMap[s.warehouseId]  || {};
      s.productName    = p.name           || s.productId;
      s.sku            = p.sku            || '';
      s.barcode        = p.barcode        || '';
      s.categoryId     = p.categoryId     || '';
      s.categoryName   = (catMap[p.categoryId] || {}).name || '';
      s.costPrice      = p.costPrice      || p.purchasePrice || 0;
      s.salePrice      = p.sellingPrice   || p.salePrice     || p.priceRetail   || p.price || 0;
      s.minStock       = p.minStock       || 0;
      s.reorderPoint   = p.reorderPoint   || p.reorderLevel || 0;
      s.maxStock       = p.maxStock       || 0;
      s.expiryDate     = p.expiryDate     || '';
      s.batchNo        = p.batchNo        || '';
      s.lotNo          = p.lotNo          || '';
      s.productionDate = p.productionDate || '';
      s.warehouseName  = w.name           || s.warehouseId;
      s.value          = (s.qty || 0) * s.costPrice;
      s.saleValue      = (s.qty || 0) * s.salePrice;
    });

    _txns.forEach(t => {
      const p = prodMap[t.productId] || {};
      const w = whMap[t.warehouseId]  || {};
      t.productName   = t.productName   || p.name || t.productId;
      t.warehouseName = t.warehouseName || w.name || t.warehouseId;
      t.sku           = t.sku           || p.sku  || '';
    });

    _dataLoaded = true;
  } catch (err) { throw err; }
}

// ─── Report router ────────────────────────────────────────────────────────────
async function showReport(tabId, reportId) {
  const area = $('ir-report-area');
  if (!area) return;

  if (!_dataLoaded) {
    area.innerHTML = `<div style="text-align:center;padding:60px;">
      <div class="loading-spinner" style="margin:0 auto 16px;"></div>
      <div class="dim">جاري تحميل بيانات المخزون…</div>
    </div>`;
    try { await loadAllData(); }
    catch (err) {
      area.innerHTML = `<div class="alert bad" style="margin:24px 0;">⚠️ خطأ في تحميل البيانات: ${err.message}</div>`;
      return;
    }
  }

  const f = getFilters();
  const renderers = {
    'r-item-card':      () => renderItemCard(f),
    'r-valuation':      () => renderValuation(f),
    'r-aging':          () => renderAging(f),
    'r-wh-summary':     () => renderWhSummary(f),
    'r-daily-movement': () => renderDailyMovement(f),
    'r-inout':          () => renderInOut(f),
    'r-transfers':      () => renderTransfers(f),
    'r-dispatch':       () => renderDispatch(f),
    'r-grpo':           () => renderGRPO(f),
    'r-expired':        () => renderExpired(f),
    'r-near-expiry':    () => renderNearExpiry(f),
    'r-batch':          () => renderBatch(f),
    'r-lots':           () => renderLots(f),
    'r-production':     () => renderProduction(f),
    'r-abc':            () => renderABC(f),
    'r-xyz':            () => renderXYZ(f),
    'r-dormant':        () => renderDormant(f),
    'r-fast-moving':    () => renderFastMoving(f),
    'r-turnover':       () => renderTurnover(f),
    'r-waste':          () => renderWaste(f),
    'r-accuracy':       () => renderAccuracy(f),
    'r-below-min':      () => renderBelowMin(f),
    'r-reorder-point':  () => renderReorderPoint(f),
    'r-purchase-rec':   () => renderPurchaseRec(f),
    'r-stock-ledger':   () => renderStockLedger(f),
  };

  const fn = renderers[reportId];
  area.innerHTML = fn ? fn() : `<div class="alert bad">تقرير غير معروف: ${reportId}</div>`;
}

// ─── Report wrapper ───────────────────────────────────────────────────────────
function reportWrap(title, icon, kpiHtml, tableHtml) {
  return `<div class="card" style="margin-top:0;padding:20px;">
    <div class="flex justify-between align-center mb-16 no-print" style="flex-wrap:wrap;gap:8px;">
      <h3 style="margin:0;font-size:16px;color:var(--brand);">${icon} ${title}</h3>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="irExportCSV()">📤 تصدير CSV</button>
        <button class="btn btn-secondary btn-sm" onclick="irPrint()">🖨️ طباعة</button>
      </div>
    </div>
    ${kpiHtml ? `<div class="ir-kpi-row">${kpiHtml}</div>` : ''}
    ${tableHtml}
  </div>`;
}

function sortData(data, col, asc) {
  if (!col) return data;
  return [...data].sort((a, b) => {
    let va = a[col] ?? '';
    let vb = b[col] ?? '';
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return asc ? -1 : 1;
    if (va > vb) return asc ? 1 : -1;
    return 0;
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — المخزون الأساسي
// ══════════════════════════════════════════════════════════════════════════════

// ─── 1. بطاقة الصنف ──────────────────────────────────────────────────────────
function renderItemCard(f) {
  let rows = _stock.filter(s => {
    if (!matchesFilters(s, f)) return false;
    if (f.whId && s.warehouseId !== f.whId) return false;
    return true;
  });
  rows = sortData(rows, _sortCol || 'productName', _sortAsc);

  _currentData = rows.map(s => ({
    اسم_الصنف: s.productName, الكود: s.sku, الباركود: s.barcode,
    المخزن: s.warehouseName, التصنيف: s.categoryName,
    الكمية: s.qty, سعر_التكلفة: s.costPrice, القيمة: s.value,
    الحد_الأدنى: s.minStock, نقطة_الطلب: s.reorderPoint,
  }));

  const totalQty   = rows.reduce((s, r) => s + (r.qty || 0), 0);
  const totalValue = rows.reduce((s, r) => s + r.value, 0);
  const outCount   = rows.filter(r => (r.qty || 0) <= 0).length;
  const lowCount   = rows.filter(r => (r.qty || 0) > 0 && (r.qty || 0) <= (r.reorderPoint || 0)).length;

  const kpis = [
    kpiCard('📦', 'إجمالي السجلات', rows.length, 'indigo'),
    kpiCard('📊', 'إجمالي الكميات', formatQuantity(totalQty), 'indigo'),
    kpiCard('💰', 'القيمة الإجمالية', formatCurrency(totalValue), 'good'),
    kpiCard('🔴', 'نافد المخزون', outCount, 'bad'),
    kpiCard('🟡', 'منخفض', lowCount, 'warn'),
  ].join('');

  const headers = [
    { key: 'productName',   label: 'اسم الصنف',       sortable: true },
    { key: 'sku',           label: 'الكود',            sortable: true },
    { key: 'warehouseName', label: 'المخزن',           sortable: true },
    { key: 'categoryName',  label: 'التصنيف',          sortable: true },
    { key: 'qty',           label: 'الكمية',           sortable: true },
    { key: 'costPrice',     label: 'سعر التكلفة',     sortable: true },
    { key: 'value',         label: 'القيمة الإجمالية', sortable: true },
    { key: 'minStock',      label: 'الحد الأدنى',     sortable: true },
    { key: 'status',        label: 'الحالة',           sortable: false },
  ];

  const tableRows = rows.map(s => {
    const qty = s.qty || 0;
    let statusBadge, rowClass = '';
    if (qty <= 0)                                            { statusBadge = '<span class="badge-danger">نافد</span>';  rowClass = 'row-bad'; }
    else if (s.reorderPoint > 0 && qty <= s.reorderPoint)   { statusBadge = '<span class="badge-warn">منخفض</span>';  rowClass = 'row-warn'; }
    else                                                     { statusBadge = '<span class="badge-good">متوفر</span>'; rowClass = 'row-good'; }
    return {
      _rowClass: rowClass,
      productName:   `<strong>${s.productName}</strong>`,
      sku:           `<span class="mono dim" style="font-size:11px;">${s.sku}</span>`,
      warehouseName: s.warehouseName,
      categoryName:  s.categoryName,
      qty:           `<span class="mono font-bold" style="${qty <= 0 ? 'color:var(--bad)' : ''}">${formatQuantity(qty)}</span>`,
      costPrice:     `<span class="mono">${formatCurrency(s.costPrice)}</span>`,
      value:         `<span class="mono">${formatCurrency(s.value)}</span>`,
      minStock:      `<span class="mono dim">${s.minStock || '—'}</span>`,
      status:        statusBadge,
    };
  });

  const total = {
    productName: `<strong>الإجمالي (${rows.length} صنف)</strong>`,
    sku: '', warehouseName: '', categoryName: '',
    qty:      `<span class="mono font-bold">${formatQuantity(totalQty)}</span>`,
    costPrice: '',
    value:    `<span class="mono font-bold">${formatCurrency(totalValue)}</span>`,
    minStock: '', status: '',
  };

  return reportWrap('بطاقة الصنف — المخزون الكامل', '📦', kpis,
    buildSortableTable(headers, tableRows, total));
}

// ─── 2. تقييم المخزون ────────────────────────────────────────────────────────
function renderValuation(f) {
  const prodMap = {};
  _stock.filter(s => matchesFilters(s, f)).forEach(s => {
    if (f.whId && s.warehouseId !== f.whId) return;
    if (!prodMap[s.productId]) {
      prodMap[s.productId] = {
        productId: s.productId, productName: s.productName, sku: s.sku,
        categoryName: s.categoryName, costPrice: s.costPrice, salePrice: s.salePrice,
        qty: 0, costValue: 0, saleValue: 0,
      };
    }
    prodMap[s.productId].qty       += (s.qty || 0);
    prodMap[s.productId].costValue += s.value;
    prodMap[s.productId].saleValue += s.saleValue;
  });

  let rows = Object.values(prodMap).map(r => ({
    ...r,
    margin:    r.saleValue - r.costValue,
    marginPct: r.costValue > 0 ? ((r.saleValue - r.costValue) / r.costValue * 100).toFixed(1) + '%' : '—',
  }));
  if (!_sortCol) rows.sort((a, b) => b.costValue - a.costValue);
  else rows = sortData(rows, _sortCol, _sortAsc);

  _currentData = rows.map(r => ({
    اسم_الصنف: r.productName, الكود: r.sku, التصنيف: r.categoryName,
    الكمية: r.qty, سعر_التكلفة: r.costPrice, سعر_البيع: r.salePrice,
    قيمة_التكلفة: r.costValue, قيمة_البيع: r.saleValue,
    هامش_الربح: r.margin, نسبة_الهامش: r.marginPct,
  }));

  const totalCost   = rows.reduce((s, r) => s + r.costValue, 0);
  const totalSale   = rows.reduce((s, r) => s + r.saleValue, 0);
  const totalMargin = totalSale - totalCost;

  const kpis = [
    kpiCard('💰', 'قيمة المخزون (التكلفة)', formatCurrency(totalCost), 'indigo'),
    kpiCard('🏷️', 'قيمة المخزون (البيع)', formatCurrency(totalSale), 'good'),
    kpiCard('📈', 'الربح المتوقع', formatCurrency(totalMargin), totalMargin >= 0 ? 'good' : 'bad'),
    kpiCard('📦', 'عدد الأصناف', rows.length, 'indigo'),
  ].join('');

  const headers = [
    { key: 'productName', label: 'اسم الصنف',      sortable: true },
    { key: 'sku',         label: 'الكود',           sortable: true },
    { key: 'categoryName',label: 'التصنيف',         sortable: true },
    { key: 'qty',         label: 'الكمية',          sortable: true },
    { key: 'costPrice',   label: 'سعر التكلفة',    sortable: true },
    { key: 'costValue',   label: 'قيمة التكلفة',   sortable: true },
    { key: 'saleValue',   label: 'قيمة البيع',     sortable: true },
    { key: 'margin',      label: 'هامش الربح',     sortable: true },
    { key: 'marginPct',   label: 'نسبة الهامش',    sortable: false },
  ];

  const tableRows = rows.map(r => ({
    _rowClass: r.margin < 0 ? 'row-bad' : '',
    productName: `<strong>${r.productName}</strong>`,
    sku:         `<span class="mono dim" style="font-size:11px;">${r.sku}</span>`,
    categoryName: r.categoryName,
    qty:         `<span class="mono">${formatQuantity(r.qty)}</span>`,
    costPrice:   `<span class="mono">${formatCurrency(r.costPrice)}</span>`,
    costValue:   `<span class="mono font-bold">${formatCurrency(r.costValue)}</span>`,
    saleValue:   `<span class="mono">${formatCurrency(r.saleValue)}</span>`,
    margin:      `<span class="mono" style="color:${r.margin >= 0 ? 'var(--good)' : 'var(--bad)'};">${formatCurrency(r.margin)}</span>`,
    marginPct:   `<span class="mono">${r.marginPct}</span>`,
  }));

  const total = {
    productName: '<strong>الإجمالي</strong>', sku: '', categoryName: '', qty: '', costPrice: '',
    costValue:  `<span class="mono font-bold">${formatCurrency(totalCost)}</span>`,
    saleValue:  `<span class="mono font-bold">${formatCurrency(totalSale)}</span>`,
    margin:     `<span class="mono font-bold">${formatCurrency(totalMargin)}</span>`,
    marginPct:  `<span class="mono">${totalCost > 0 ? ((totalMargin/totalCost)*100).toFixed(1)+'%' : '—'}</span>`,
  };

  return reportWrap('تقييم المخزون — القيمة الإجمالية', '💰', kpis,
    buildSortableTable(headers, tableRows, total));
}

// ─── 3. أعمار المخزون ────────────────────────────────────────────────────────
function renderAging(f) {
  const today = new Date();
  const lastMovement = {};
  _txns.forEach(t => {
    const d = parseDate(t.createdAt);
    if (!d) return;
    if (!lastMovement[t.productId] || d > lastMovement[t.productId]) lastMovement[t.productId] = d;
  });

  let rows = _stock.filter(s => matchesFilters(s, f) && (s.qty || 0) > 0);
  if (f.whId) rows = rows.filter(s => s.warehouseId === f.whId);

  const enriched = rows.map(s => {
    const lm   = lastMovement[s.productId];
    const days = lm ? daysBetween(lm, today) : null;
    const group = days === null ? 'غير محدد'
      : days < 30 ? 'أقل من 30 يوم'
      : days < 60 ? '30–60 يوم'
      : days < 90 ? '60–90 يوم'
      : 'أكثر من 90 يوم';
    return { ...s, lastMovementDate: lm, daysIdle: days ?? 999, agingGroup: group };
  });

  const groupOrder = ['أقل من 30 يوم', '30–60 يوم', '60–90 يوم', 'أكثر من 90 يوم', 'غير محدد'];
  const groups = {};
  groupOrder.forEach(g => { groups[g] = enriched.filter(r => r.agingGroup === g); });

  let flat = _sortCol ? sortData(enriched, _sortCol, _sortAsc) : enriched.sort((a,b) => b.daysIdle - a.daysIdle);

  _currentData = flat.map(r => ({
    اسم_الصنف: r.productName, الكود: r.sku, المخزن: r.warehouseName,
    الكمية: r.qty, القيمة: r.value,
    آخر_حركة: r.lastMovementDate?.toLocaleDateString('ar-SA') || '—',
    أيام_الركود: r.daysIdle === 999 ? '—' : r.daysIdle, فئة_العمر: r.agingGroup,
  }));

  const kpis = groupOrder.map(label => {
    const items = groups[label] || [];
    const color = label === 'أكثر من 90 يوم' ? 'bad' : label === '60–90 يوم' ? 'warn' : label === '30–60 يوم' ? 'indigo' : 'good';
    return kpiCard('⏱️', label, `${items.length} صنف`, color, formatCurrency(items.reduce((s,r) => s+r.value, 0)));
  }).join('');

  const headers = [
    { key: 'agingGroup',       label: 'فئة العمر',     sortable: true },
    { key: 'productName',      label: 'اسم الصنف',     sortable: true },
    { key: 'sku',              label: 'الكود',          sortable: true },
    { key: 'warehouseName',    label: 'المخزن',         sortable: true },
    { key: 'qty',              label: 'الكمية',         sortable: true },
    { key: 'value',            label: 'القيمة',         sortable: true },
    { key: 'lastMovementDate', label: 'آخر حركة',       sortable: true },
    { key: 'daysIdle',         label: 'أيام الركود',   sortable: true },
  ];

  const tableRows = flat.map(r => ({
    _rowClass: r.daysIdle > 90 ? 'row-bad' : r.daysIdle > 60 ? 'row-warn' : '',
    agingGroup:       `<span class="badge-${r.daysIdle > 90 ? 'danger' : r.daysIdle > 60 ? 'warn' : r.daysIdle > 30 ? 'neutral' : 'good'}">${r.agingGroup}</span>`,
    productName:      `<strong>${r.productName}</strong>`,
    sku:              `<span class="mono dim" style="font-size:11px;">${r.sku}</span>`,
    warehouseName:    r.warehouseName,
    qty:              `<span class="mono">${formatQuantity(r.qty)}</span>`,
    value:            `<span class="mono">${formatCurrency(r.value)}</span>`,
    lastMovementDate: r.lastMovementDate ? r.lastMovementDate.toLocaleDateString('ar-SA') : '<span class="dim">—</span>',
    daysIdle:         r.daysIdle === 999
      ? '<span class="dim">—</span>'
      : `<span class="mono font-bold" style="color:${r.daysIdle>90?'var(--bad)':r.daysIdle>60?'var(--warn)':'inherit'}">${r.daysIdle}</span>`,
  }));

  return reportWrap('أعمار المخزون — تحليل فترة الركود', '⏱️', kpis,
    buildSortableTable(headers, tableRows));
}

// ─── 4. ملخص المخازن ─────────────────────────────────────────────────────────
function renderWhSummary(f) {
  const whGroups = {};
  _stock.filter(s => matchesFilters(s, f)).forEach(s => {
    if (!whGroups[s.warehouseId]) {
      whGroups[s.warehouseId] = {
        warehouseId: s.warehouseId, warehouseName: s.warehouseName,
        itemCount: 0, totalQty: 0, totalValue: 0, outItems: 0, lowItems: 0,
      };
    }
    const g = whGroups[s.warehouseId];
    g.itemCount++;
    g.totalQty   += (s.qty || 0);
    g.totalValue += s.value;
    if ((s.qty || 0) <= 0) g.outItems++;
    else if (s.reorderPoint > 0 && (s.qty || 0) <= s.reorderPoint) g.lowItems++;
  });

  let rows = Object.values(whGroups);
  rows = _sortCol ? sortData(rows, _sortCol, _sortAsc) : rows.sort((a,b) => b.totalValue - a.totalValue);

  _currentData = rows.map(r => ({
    المخزن: r.warehouseName, عدد_الأصناف: r.itemCount,
    إجمالي_الكميات: r.totalQty, القيمة_الإجمالية: r.totalValue,
    أصناف_نافدة: r.outItems, أصناف_منخفضة: r.lowItems,
  }));

  const totalValue = rows.reduce((s, r) => s + r.totalValue, 0);
  const kpis = [
    kpiCard('🏭', 'عدد المخازن', rows.length, 'indigo'),
    kpiCard('💰', 'إجمالي القيمة', formatCurrency(totalValue), 'good'),
    kpiCard('📦', 'إجمالي الأصناف', rows.reduce((s,r) => s+r.itemCount, 0), 'indigo'),
  ].join('');

  const headers = [
    { key: 'warehouseName', label: 'المخزن',           sortable: true },
    { key: 'itemCount',     label: 'عدد الأصناف',      sortable: true },
    { key: 'totalQty',      label: 'إجمالي الكميات',   sortable: true },
    { key: 'totalValue',    label: 'القيمة الإجمالية', sortable: true },
    { key: 'outItems',      label: 'أصناف نافدة',      sortable: true },
    { key: 'lowItems',      label: 'أصناف منخفضة',     sortable: true },
    { key: 'pct',           label: 'نسبة من الإجمالي', sortable: false },
  ];

  const tableRows = rows.map(r => ({
    _rowClass: r.outItems > 3 ? 'row-warn' : '',
    warehouseName: `<strong>${r.warehouseName}</strong>`,
    itemCount:  `<span class="mono">${r.itemCount}</span>`,
    totalQty:   `<span class="mono">${formatQuantity(r.totalQty)}</span>`,
    totalValue: `<span class="mono font-bold">${formatCurrency(r.totalValue)}</span>`,
    outItems:   `<span class="mono ${r.outItems > 0 ? 'text-bad' : ''}">${r.outItems}</span>`,
    lowItems:   `<span class="mono ${r.lowItems > 0 ? 'text-warn' : ''}">${r.lowItems}</span>`,
    pct: totalValue > 0
      ? `<div style="display:flex;align-items:center;gap:8px;">
           <div style="flex:1;background:var(--bg-3);border-radius:4px;height:8px;">
             <div style="width:${Math.min((r.totalValue/totalValue)*100,100).toFixed(1)}%;background:var(--brand);border-radius:4px;height:8px;"></div>
           </div>
           <span class="mono" style="font-size:11px;min-width:36px;">${((r.totalValue/totalValue)*100).toFixed(1)}%</span>
         </div>` : '—',
  }));

  const total = {
    warehouseName: '<strong>الإجمالي</strong>',
    itemCount:  `<span class="mono font-bold">${rows.reduce((s,r)=>s+r.itemCount,0)}</span>`,
    totalQty:   `<span class="mono font-bold">${formatQuantity(rows.reduce((s,r)=>s+r.totalQty,0))}</span>`,
    totalValue: `<span class="mono font-bold">${formatCurrency(totalValue)}</span>`,
    outItems:   `<span class="mono font-bold">${rows.reduce((s,r)=>s+r.outItems,0)}</span>`,
    lowItems:   `<span class="mono font-bold">${rows.reduce((s,r)=>s+r.lowItems,0)}</span>`,
    pct: '',
  };

  return reportWrap('ملخص المخازن — المقارنة والتوزيع', '🏭', kpis,
    buildSortableTable(headers, tableRows, total));
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — الحركة والمعاملات
// ══════════════════════════════════════════════════════════════════════════════

// ─── 5. الحركة اليومية ───────────────────────────────────────────────────────
function renderDailyMovement(f) {
  const txns = _txns.filter(t => {
    if (!inDateRange(t.createdAt, f.dateFrom, f.dateTo)) return false;
    if (f.whId && t.warehouseId !== f.whId) return false;
    if (f.search && !`${t.productName||''} ${t.sku||''}`.toLowerCase().includes(f.search)) return false;
    return true;
  });

  const byDate = {};
  txns.forEach(t => {
    const d = parseDate(t.createdAt);
    if (!d) return;
    const key = d.toISOString().slice(0, 10);
    if (!byDate[key]) byDate[key] = { date: key, inQty: 0, outQty: 0, inValue: 0, outValue: 0, count: 0 };
    const g = byDate[key]; g.count++;
    const qty  = Math.abs(t.qtyChange || 0);
    const cost = (t.cost || 0) * qty;
    if ((t.qtyChange || 0) > 0) { g.inQty  += qty; g.inValue  += cost; }
    else                        { g.outQty += qty; g.outValue += cost; }
  });

  let rows = Object.values(byDate);
  rows = _sortCol ? sortData(rows, _sortCol, _sortAsc) : rows.sort((a,b) => b.date.localeCompare(a.date));

  _currentData = rows.map(r => ({
    التاريخ: r.date, عمليات_واردة: r.inQty, عمليات_صادرة: r.outQty,
    قيمة_الوارد: r.inValue, قيمة_الصادر: r.outValue, عدد_الحركات: r.count,
  }));

  const kpis = [
    kpiCard('📅', 'أيام نشطة', rows.length, 'indigo'),
    kpiCard('⬇️', 'إجمالي الوارد', formatQuantity(rows.reduce((s,r)=>s+r.inQty,0)), 'good'),
    kpiCard('⬆️', 'إجمالي الصادر', formatQuantity(rows.reduce((s,r)=>s+r.outQty,0)), 'warn'),
    kpiCard('🔄', 'إجمالي الحركات', txns.length, 'indigo'),
  ].join('');

  const headers = [
    { key: 'date',     label: 'التاريخ',        sortable: true },
    { key: 'count',    label: 'عدد الحركات',    sortable: true },
    { key: 'inQty',    label: 'الكمية الواردة',  sortable: true },
    { key: 'outQty',   label: 'الكمية الصادرة', sortable: true },
    { key: 'inValue',  label: 'قيمة الوارد',    sortable: true },
    { key: 'outValue', label: 'قيمة الصادر',    sortable: true },
    { key: 'net',      label: 'صافي الحركة',    sortable: false },
  ];

  const tableRows = rows.map(r => {
    const net = r.inQty - r.outQty;
    return {
      date:     `<span class="mono">${r.date}</span>`,
      count:    `<span class="mono">${r.count}</span>`,
      inQty:    `<span class="mono text-good">${formatQuantity(r.inQty)}</span>`,
      outQty:   `<span class="mono text-warn">${formatQuantity(r.outQty)}</span>`,
      inValue:  `<span class="mono">${formatCurrency(r.inValue)}</span>`,
      outValue: `<span class="mono">${formatCurrency(r.outValue)}</span>`,
      net:      `<span class="mono font-bold" style="color:${net>=0?'var(--good)':'var(--bad)'};">${net>=0?'+':''}${formatQuantity(net)}</span>`,
    };
  });

  return reportWrap('الحركة اليومية — سجل يومي تفصيلي', '📅', kpis,
    buildSortableTable(headers, tableRows));
}

// ─── 6. الوارد والصادر ───────────────────────────────────────────────────────
function renderInOut(f) {
  const txns = _txns.filter(t => {
    if (!inDateRange(t.createdAt, f.dateFrom, f.dateTo)) return false;
    if (f.whId && t.warehouseId !== f.whId) return false;
    if (f.search && !`${t.productName||''} ${t.sku||''}`.toLowerCase().includes(f.search)) return false;
    return true;
  });

  const prodMap = {};
  txns.forEach(t => {
    if (!prodMap[t.productId]) prodMap[t.productId] = {
      productId: t.productId, productName: t.productName, sku: t.sku,
      inQty: 0, outQty: 0, inValue: 0, outValue: 0, txCount: 0,
    };
    const qty  = Math.abs(t.qtyChange || 0);
    const cost = (t.cost || 0) * qty;
    prodMap[t.productId].txCount++;
    if ((t.qtyChange || 0) > 0) { prodMap[t.productId].inQty  += qty; prodMap[t.productId].inValue  += cost; }
    else                        { prodMap[t.productId].outQty += qty; prodMap[t.productId].outValue += cost; }
  });

  let rows = Object.values(prodMap);
  rows = _sortCol ? sortData(rows, _sortCol, _sortAsc) : rows.sort((a,b) => (b.inQty+b.outQty) - (a.inQty+a.outQty));

  _currentData = rows.map(r => ({
    اسم_الصنف: r.productName, الكود: r.sku,
    كمية_الوارد: r.inQty, كمية_الصادر: r.outQty, صافي: r.inQty - r.outQty,
    قيمة_الوارد: r.inValue, قيمة_الصادر: r.outValue,
  }));

  const kpis = [
    kpiCard('📦', 'عدد الأصناف', rows.length, 'indigo'),
    kpiCard('⬇️', 'إجمالي الوارد', formatQuantity(rows.reduce((s,r)=>s+r.inQty,0)), 'good'),
    kpiCard('⬆️', 'إجمالي الصادر', formatQuantity(rows.reduce((s,r)=>s+r.outQty,0)), 'warn'),
    kpiCard('💰', 'قيمة الوارد', formatCurrency(rows.reduce((s,r)=>s+r.inValue,0)), 'good'),
    kpiCard('💸', 'قيمة الصادر', formatCurrency(rows.reduce((s,r)=>s+r.outValue,0)), 'warn'),
  ].join('');

  const headers = [
    { key: 'productName', label: 'اسم الصنف',  sortable: true },
    { key: 'sku',         label: 'الكود',       sortable: true },
    { key: 'inQty',       label: 'الوارد',      sortable: true },
    { key: 'outQty',      label: 'الصادر',      sortable: true },
    { key: 'netQty',      label: 'الصافي',      sortable: false },
    { key: 'inValue',     label: 'قيمة الوارد', sortable: true },
    { key: 'outValue',    label: 'قيمة الصادر', sortable: true },
    { key: 'txCount',     label: 'حركات',       sortable: true },
  ];

  const tableRows = rows.map(r => {
    const net = r.inQty - r.outQty;
    return {
      productName: `<strong>${r.productName}</strong>`,
      sku:         `<span class="mono dim" style="font-size:11px;">${r.sku}</span>`,
      inQty:       `<span class="mono text-good">${formatQuantity(r.inQty)}</span>`,
      outQty:      `<span class="mono text-warn">${formatQuantity(r.outQty)}</span>`,
      netQty:      `<span class="mono font-bold" style="color:${net>=0?'var(--good)':'var(--bad)'};">${net>=0?'+':''}${formatQuantity(net)}</span>`,
      inValue:     `<span class="mono">${formatCurrency(r.inValue)}</span>`,
      outValue:    `<span class="mono">${formatCurrency(r.outValue)}</span>`,
      txCount:     `<span class="mono dim">${r.txCount}</span>`,
    };
  });

  const total = {
    productName: '<strong>الإجمالي</strong>', sku: '',
    inQty:    `<span class="mono font-bold">${formatQuantity(rows.reduce((s,r)=>s+r.inQty,0))}</span>`,
    outQty:   `<span class="mono font-bold">${formatQuantity(rows.reduce((s,r)=>s+r.outQty,0))}</span>`,
    netQty:   `<span class="mono font-bold">${formatQuantity(rows.reduce((s,r)=>s+r.inQty-r.outQty,0))}</span>`,
    inValue:  `<span class="mono font-bold">${formatCurrency(rows.reduce((s,r)=>s+r.inValue,0))}</span>`,
    outValue: `<span class="mono font-bold">${formatCurrency(rows.reduce((s,r)=>s+r.outValue,0))}</span>`,
    txCount:  `<span class="mono font-bold">${rows.reduce((s,r)=>s+r.txCount,0)}</span>`,
  };

  return reportWrap('تقرير الوارد والصادر — حسب الصنف', '🔄', kpis,
    buildSortableTable(headers, tableRows, total));
}

// ─── 7. التحويلات بين المخازن ────────────────────────────────────────────────
function renderTransfers(f) {
  const txns = _txns.filter(t => {
    if (!['transfer_in', 'transfer_out'].includes(t.type)) return false;
    if (!inDateRange(t.createdAt, f.dateFrom, f.dateTo)) return false;
    if (f.search && !`${t.productName||''} ${t.sku||''}`.toLowerCase().includes(f.search)) return false;
    return true;
  });

  let rows = txns.filter(t => t.type === 'transfer_out').map(t => ({
    date:          parseDate(t.createdAt)?.toISOString().slice(0,10) || '',
    productName:   t.productName, sku: t.sku,
    fromWarehouse: t.warehouseName || t.warehouseId,
    toWarehouse:   t.toWarehouseName || t.refWarehouseId || '—',
    qty:           Math.abs(t.qtyChange || 0),
    refId:         t.refId || t.id,
    cost:          Math.abs(t.qtyChange || 0) * (t.cost || 0),
  }));

  rows = _sortCol ? sortData(rows, _sortCol, _sortAsc) : rows.sort((a,b) => b.date.localeCompare(a.date));

  _currentData = rows.map(r => ({
    التاريخ: r.date, اسم_الصنف: r.productName, الكود: r.sku,
    من_المخزن: r.fromWarehouse, إلى_المخزن: r.toWarehouse,
    الكمية: r.qty, القيمة: r.cost, رقم_المرجع: r.refId,
  }));

  const kpis = [
    kpiCard('🔀', 'إجمالي التحويلات', rows.length, 'indigo'),
    kpiCard('📦', 'إجمالي الكميات', formatQuantity(rows.reduce((s,r)=>s+r.qty,0)), 'good'),
    kpiCard('💰', 'القيمة المحوّلة', formatCurrency(rows.reduce((s,r)=>s+r.cost,0)), 'indigo'),
  ].join('');

  const headers = [
    { key: 'date',          label: 'التاريخ',    sortable: true },
    { key: 'productName',   label: 'الصنف',      sortable: true },
    { key: 'sku',           label: 'الكود',      sortable: true },
    { key: 'fromWarehouse', label: 'من المخزن',  sortable: true },
    { key: 'toWarehouse',   label: 'إلى المخزن', sortable: true },
    { key: 'qty',           label: 'الكمية',     sortable: true },
    { key: 'cost',          label: 'القيمة',     sortable: true },
    { key: 'refId',         label: 'المرجع',     sortable: false },
  ];

  const tableRows = rows.map(r => ({
    date:          `<span class="mono">${r.date}</span>`,
    productName:   `<strong>${r.productName}</strong>`,
    sku:           `<span class="mono dim" style="font-size:11px;">${r.sku}</span>`,
    fromWarehouse: r.fromWarehouse,
    toWarehouse:   r.toWarehouse,
    qty:           `<span class="mono">${formatQuantity(r.qty)}</span>`,
    cost:          `<span class="mono">${formatCurrency(r.cost)}</span>`,
    refId:         `<span class="mono dim" style="font-size:11px;">${r.refId}</span>`,
  }));

  return reportWrap('التحويلات بين المخازن', '🔀', kpis,
    buildSortableTable(headers, tableRows));
}

// ─── 8. الصرف المخزني ────────────────────────────────────────────────────────
function renderDispatch(f) {
  const txns = _txns.filter(t => {
    if ((t.qtyChange || 0) >= 0) return false;
    if (!inDateRange(t.createdAt, f.dateFrom, f.dateTo)) return false;
    if (f.whId && t.warehouseId !== f.whId) return false;
    if (f.search && !`${t.productName||''} ${t.sku||''}`.toLowerCase().includes(f.search)) return false;
    return true;
  });

  let rows = txns.map(t => ({
    date:          parseDate(t.createdAt)?.toISOString().slice(0,10) || '',
    productName:   t.productName, sku: t.sku,
    warehouseName: t.warehouseName,
    qty:           Math.abs(t.qtyChange || 0),
    type:          t.type || '—',
    cost:          Math.abs(t.qtyChange || 0) * (t.cost || 0),
    refId:         t.refId || '—',
  }));

  rows = _sortCol ? sortData(rows, _sortCol, _sortAsc) : rows.sort((a,b) => b.date.localeCompare(a.date));

  _currentData = rows.map(r => ({
    التاريخ: r.date, اسم_الصنف: r.productName, الكود: r.sku,
    المخزن: r.warehouseName, الكمية: r.qty, النوع: r.type, القيمة: r.cost,
  }));

  const kpis = [
    kpiCard('📤', 'إجمالي الصرف', rows.length, 'warn'),
    kpiCard('📦', 'إجمالي الكميات', formatQuantity(rows.reduce((s,r)=>s+r.qty,0)), 'warn'),
    kpiCard('💸', 'القيمة المصروفة', formatCurrency(rows.reduce((s,r)=>s+r.cost,0)), 'bad'),
  ].join('');

  const headers = [
    { key: 'date',          label: 'التاريخ',     sortable: true },
    { key: 'productName',   label: 'الصنف',       sortable: true },
    { key: 'warehouseName', label: 'المخزن',      sortable: true },
    { key: 'qty',           label: 'الكمية',      sortable: true },
    { key: 'cost',          label: 'القيمة',      sortable: true },
    { key: 'type',          label: 'النوع',       sortable: true },
    { key: 'refId',         label: 'رقم المرجع', sortable: false },
  ];

  const tableRows = rows.map(r => ({
    date:          `<span class="mono">${r.date}</span>`,
    productName:   `<strong>${r.productName}</strong>`,
    warehouseName: r.warehouseName,
    qty:           `<span class="mono text-warn">${formatQuantity(r.qty)}</span>`,
    cost:          `<span class="mono">${formatCurrency(r.cost)}</span>`,
    type:          `<span class="badge-neutral">${r.type}</span>`,
    refId:         `<span class="mono dim" style="font-size:11px;">${r.refId}</span>`,
  }));

  const total = {
    date: '<strong>الإجمالي</strong>', productName: '', warehouseName: '', type: '', refId: '',
    qty:  `<span class="mono font-bold">${formatQuantity(rows.reduce((s,r)=>s+r.qty,0))}</span>`,
    cost: `<span class="mono font-bold">${formatCurrency(rows.reduce((s,r)=>s+r.cost,0))}</span>`,
  };

  return reportWrap('الصرف المخزني — سجل المخرجات', '📤', kpis,
    buildSortableTable(headers, tableRows, total));
}

// ─── 9. إذون الاستلام (GRPO) ─────────────────────────────────────────────────
function renderGRPO(f) {
  const txns = _txns.filter(t => {
    if ((t.qtyChange || 0) <= 0) return false;
    if (!inDateRange(t.createdAt, f.dateFrom, f.dateTo)) return false;
    if (f.whId && t.warehouseId !== f.whId) return false;
    if (f.search && !`${t.productName||''} ${t.sku||''}`.toLowerCase().includes(f.search)) return false;
    return true;
  });

  let rows = txns.map(t => ({
    date:          parseDate(t.createdAt)?.toISOString().slice(0,10) || '',
    productName:   t.productName, sku: t.sku,
    warehouseName: t.warehouseName,
    qty:           Math.abs(t.qtyChange || 0),
    cost:          t.cost || 0,
    totalCost:     Math.abs(t.qtyChange || 0) * (t.cost || 0),
    batchNo:       t.batchNumber || t.batchNo || '—',
    expiryDate:    t.expiryDate || '—',
    supplier:      t.supplierName || '—',
  }));

  rows = _sortCol ? sortData(rows, _sortCol, _sortAsc) : rows.sort((a,b) => b.date.localeCompare(a.date));

  _currentData = rows.map(r => ({
    التاريخ: r.date, اسم_الصنف: r.productName, الكود: r.sku,
    المخزن: r.warehouseName, الكمية: r.qty, سعر_التكلفة: r.cost,
    الإجمالي: r.totalCost, رقم_الدفعة: r.batchNo, تاريخ_الانتهاء: r.expiryDate, المورد: r.supplier,
  }));

  const kpis = [
    kpiCard('📥', 'إذون الاستلام', rows.length, 'good'),
    kpiCard('📦', 'إجمالي المستلم', formatQuantity(rows.reduce((s,r)=>s+r.qty,0)), 'good'),
    kpiCard('💰', 'إجمالي التكلفة', formatCurrency(rows.reduce((s,r)=>s+r.totalCost,0)), 'indigo'),
  ].join('');

  const headers = [
    { key: 'date',          label: 'التاريخ',        sortable: true },
    { key: 'productName',   label: 'الصنف',          sortable: true },
    { key: 'warehouseName', label: 'المخزن',         sortable: true },
    { key: 'qty',           label: 'الكمية',         sortable: true },
    { key: 'cost',          label: 'سعر الوحدة',    sortable: true },
    { key: 'totalCost',     label: 'الإجمالي',       sortable: true },
    { key: 'batchNo',       label: 'رقم الدفعة',    sortable: true },
    { key: 'expiryDate',    label: 'تاريخ الانتهاء', sortable: true },
    { key: 'supplier',      label: 'المورد',         sortable: true },
  ];

  const tableRows = rows.map(r => ({
    date:          `<span class="mono">${r.date}</span>`,
    productName:   `<strong>${r.productName}</strong>`,
    warehouseName: r.warehouseName,
    qty:           `<span class="mono text-good">${formatQuantity(r.qty)}</span>`,
    cost:          `<span class="mono">${formatCurrency(r.cost)}</span>`,
    totalCost:     `<span class="mono font-bold">${formatCurrency(r.totalCost)}</span>`,
    batchNo:       `<span class="mono dim">${r.batchNo}</span>`,
    expiryDate:    `<span class="mono ${r.expiryDate !== '—' && r.expiryDate < todayString() ? 'text-bad' : ''}">${r.expiryDate}</span>`,
    supplier:      r.supplier,
  }));

  const total = {
    date: '<strong>الإجمالي</strong>', productName: '', warehouseName: '',
    qty:      `<span class="mono font-bold">${formatQuantity(rows.reduce((s,r)=>s+r.qty,0))}</span>`,
    cost: '',
    totalCost:`<span class="mono font-bold">${formatCurrency(rows.reduce((s,r)=>s+r.totalCost,0))}</span>`,
    batchNo: '', expiryDate: '', supplier: '',
  };

  return reportWrap('إذون الاستلام (GRPO) — سجل المدخلات', '📥', kpis,
    buildSortableTable(headers, tableRows, total));
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — الصلاحية والدفعات
// ══════════════════════════════════════════════════════════════════════════════

// ─── 10. منتهية الصلاحية ─────────────────────────────────────────────────────
function renderExpired(f) {
  const todayS = todayString();
  let rows = _stock.filter(s => {
    if (!matchesFilters(s, f)) return false;
    if ((s.qty || 0) <= 0) return false;
    return s.expiryDate && s.expiryDate < todayS;
  });
  if (f.whId) rows = rows.filter(s => s.warehouseId === f.whId);
  rows = _sortCol ? sortData(rows, _sortCol, _sortAsc) : rows.sort((a,b) => a.expiryDate.localeCompare(b.expiryDate));

  _currentData = rows.map(r => ({
    اسم_الصنف: r.productName, الكود: r.sku, المخزن: r.warehouseName,
    الكمية: r.qty, القيمة: r.value, تاريخ_الانتهاء: r.expiryDate,
    أيام_منذ_الانتهاء: daysBetween(parseDate(r.expiryDate), new Date()),
  }));

  const totalLost = rows.reduce((s,r) => s + r.value, 0);
  const kpis = [
    kpiCard('⛔', 'أصناف منتهية الصلاحية', rows.length, 'bad'),
    kpiCard('💸', 'القيمة المعرضة للخسارة', formatCurrency(totalLost), 'bad'),
  ].join('');

  const headers = [
    { key: 'productName',  label: 'اسم الصنف',           sortable: true },
    { key: 'sku',          label: 'الكود',                sortable: true },
    { key: 'warehouseName',label: 'المخزن',               sortable: true },
    { key: 'qty',          label: 'الكمية',               sortable: true },
    { key: 'value',        label: 'القيمة',               sortable: true },
    { key: 'expiryDate',   label: 'تاريخ الانتهاء',      sortable: true },
    { key: 'daysExpired',  label: 'منذ الانتهاء (أيام)', sortable: true },
  ];

  const tableRows = rows.map(r => {
    const dExp = daysBetween(parseDate(r.expiryDate), new Date());
    return {
      _rowClass: 'row-bad',
      productName:   `<strong>${r.productName}</strong>`,
      sku:           `<span class="mono dim" style="font-size:11px;">${r.sku}</span>`,
      warehouseName: r.warehouseName,
      qty:           `<span class="mono text-bad">${formatQuantity(r.qty)}</span>`,
      value:         `<span class="mono text-bad">${formatCurrency(r.value)}</span>`,
      expiryDate:    `<span class="mono text-bad font-bold">${r.expiryDate}</span>`,
      daysExpired:   `<span class="mono font-bold text-bad">منذ ${dExp} يوم</span>`,
    };
  });

  return reportWrap('منتهية الصلاحية — الأصناف المنتهية في المخزن', '⛔', kpis,
    buildSortableTable(headers, tableRows));
}

// ─── 11. قريبة الانتهاء ──────────────────────────────────────────────────────
function renderNearExpiry(f) {
  const today  = new Date();
  const todayS = todayString();
  const in30   = new Date(today); in30.setDate(in30.getDate() + 30);
  const in30S  = in30.toISOString().slice(0, 10);

  let rows = _stock.filter(s => {
    if (!matchesFilters(s, f)) return false;
    if ((s.qty || 0) <= 0) return false;
    return s.expiryDate && s.expiryDate >= todayS && s.expiryDate <= in30S;
  });
  if (f.whId) rows = rows.filter(s => s.warehouseId === f.whId);
  rows = _sortCol ? sortData(rows, _sortCol, _sortAsc) : rows.sort((a,b) => a.expiryDate.localeCompare(b.expiryDate));

  _currentData = rows.map(r => ({
    اسم_الصنف: r.productName, الكود: r.sku, المخزن: r.warehouseName,
    الكمية: r.qty, القيمة: r.value, تاريخ_الانتهاء: r.expiryDate,
    أيام_متبقية: daysBetween(today, parseDate(r.expiryDate)),
  }));

  const kpis = [
    kpiCard('⚠️', 'أصناف تنتهي خلال 30 يوم', rows.length, 'warn'),
    kpiCard('💰', 'القيمة المعرضة للخطر', formatCurrency(rows.reduce((s,r)=>s+r.value,0)), 'warn'),
  ].join('');

  const headers = [
    { key: 'productName',  label: 'اسم الصنف',      sortable: true },
    { key: 'sku',          label: 'الكود',           sortable: true },
    { key: 'warehouseName',label: 'المخزن',          sortable: true },
    { key: 'qty',          label: 'الكمية',          sortable: true },
    { key: 'value',        label: 'القيمة',          sortable: true },
    { key: 'expiryDate',   label: 'تاريخ الانتهاء', sortable: true },
    { key: 'countdown',    label: 'العد التنازلي',   sortable: false },
  ];

  const tableRows = rows.map(r => {
    const daysLeft = daysBetween(today, parseDate(r.expiryDate));
    const urgency  = daysLeft <= 7 ? 'danger' : daysLeft <= 15 ? 'warn' : 'neutral';
    return {
      _rowClass: daysLeft <= 7 ? 'row-bad' : 'row-warn',
      productName:   `<strong>${r.productName}</strong>`,
      sku:           `<span class="mono dim" style="font-size:11px;">${r.sku}</span>`,
      warehouseName: r.warehouseName,
      qty:           `<span class="mono">${formatQuantity(r.qty)}</span>`,
      value:         `<span class="mono">${formatCurrency(r.value)}</span>`,
      expiryDate:    `<span class="mono font-bold">${r.expiryDate}</span>`,
      countdown:     `<span class="badge-${urgency}" style="font-size:12px;font-weight:700;">⏳ ${daysLeft} يوم</span>`,
    };
  });

  return reportWrap('قريبة الانتهاء — تنتهي خلال 30 يوماً', '⚠️', kpis,
    buildSortableTable(headers, tableRows));
}

// ─── 12. تتبع الدفعات ────────────────────────────────────────────────────────
function renderBatch(f) {
  const batchMap = {};
  _txns.filter(t => t.batchNumber || t.batchNo).forEach(t => {
    const key = t.batchNumber || t.batchNo;
    if (f.search && !`${t.productName||''} ${key}`.toLowerCase().includes(f.search)) return;
    if (!inDateRange(t.createdAt, f.dateFrom, f.dateTo)) return;
    if (f.whId && t.warehouseId !== f.whId) return;
    if (!batchMap[key]) batchMap[key] = {
      batchNo: key, productName: t.productName, sku: t.sku,
      expiryDate: t.expiryDate || '—',
      inQty: 0, outQty: 0, firstDate: '', lastDate: '', warehouses: new Set(),
    };
    const b = batchMap[key];
    const ds = parseDate(t.createdAt)?.toISOString().slice(0,10) || '';
    if (!b.firstDate || ds < b.firstDate) b.firstDate = ds;
    if (!b.lastDate  || ds > b.lastDate)  b.lastDate  = ds;
    b.warehouses.add(t.warehouseName || t.warehouseId);
    if ((t.qtyChange || 0) > 0) b.inQty  += Math.abs(t.qtyChange);
    else                        b.outQty += Math.abs(t.qtyChange);
  });

  let rows = Object.values(batchMap).map(b => ({ ...b, balance: b.inQty - b.outQty, warehouses: [...b.warehouses].join('، ') }));
  rows = _sortCol ? sortData(rows, _sortCol, _sortAsc) : rows.sort((a,b) => b.firstDate.localeCompare(a.firstDate));

  _currentData = rows.map(r => ({
    رقم_الدفعة: r.batchNo, اسم_الصنف: r.productName, الكود: r.sku,
    تاريخ_الانتهاء: r.expiryDate, الوارد: r.inQty, المصروف: r.outQty, الرصيد: r.balance,
  }));

  const kpis = [
    kpiCard('🏷️', 'عدد الدفعات', rows.length, 'indigo'),
    kpiCard('📦', 'إجمالي الوارد', formatQuantity(rows.reduce((s,r)=>s+r.inQty,0)), 'good'),
    kpiCard('📤', 'إجمالي المصروف', formatQuantity(rows.reduce((s,r)=>s+r.outQty,0)), 'warn'),
  ].join('');

  const headers = [
    { key: 'batchNo',     label: 'رقم الدفعة',      sortable: true },
    { key: 'productName', label: 'الصنف',            sortable: true },
    { key: 'expiryDate',  label: 'تاريخ الانتهاء',  sortable: true },
    { key: 'inQty',       label: 'الوارد',           sortable: true },
    { key: 'outQty',      label: 'المصروف',          sortable: true },
    { key: 'balance',     label: 'الرصيد الحالي',   sortable: true },
    { key: 'firstDate',   label: 'أول حركة',         sortable: true },
    { key: 'lastDate',    label: 'آخر حركة',          sortable: true },
    { key: 'warehouses',  label: 'المخازن',          sortable: false },
  ];

  const tableRows = rows.map(r => {
    const expired = r.expiryDate !== '—' && r.expiryDate < todayString();
    return {
      _rowClass: expired ? 'row-bad' : '',
      batchNo:     `<span class="mono font-bold">${r.batchNo}</span>`,
      productName: `<strong>${r.productName}</strong>`,
      expiryDate:  `<span class="mono ${expired ? 'text-bad' : ''}">${r.expiryDate}</span>`,
      inQty:       `<span class="mono text-good">${formatQuantity(r.inQty)}</span>`,
      outQty:      `<span class="mono text-warn">${formatQuantity(r.outQty)}</span>`,
      balance:     `<span class="mono font-bold" style="color:${r.balance > 0 ? 'inherit' : 'var(--bad)'};">${formatQuantity(r.balance)}</span>`,
      firstDate:   `<span class="mono dim">${r.firstDate}</span>`,
      lastDate:    `<span class="mono dim">${r.lastDate}</span>`,
      warehouses:  `<span class="dim" style="font-size:12px;">${r.warehouses}</span>`,
    };
  });

  return reportWrap('تتبع الدفعات — Batch Number Tracking', '🏷️', kpis,
    buildSortableTable(headers, tableRows));
}

// ─── 13. تقرير التشغيلات (Lot) ───────────────────────────────────────────────
function renderLots(f) {
  const lotMap = {};
  _stock.filter(s => s.lotNo && matchesFilters(s, f)).forEach(s => {
    if (f.whId && s.warehouseId !== f.whId) return;
    if (!lotMap[s.lotNo]) lotMap[s.lotNo] = {
      lotNo: s.lotNo, productName: s.productName, sku: s.sku,
      qty: 0, value: 0, productionDate: s.productionDate || '—', expiryDate: s.expiryDate || '—',
      warehouses: new Set(),
    };
    lotMap[s.lotNo].qty   += (s.qty || 0);
    lotMap[s.lotNo].value += s.value;
    lotMap[s.lotNo].warehouses.add(s.warehouseName);
  });

  let rows = Object.values(lotMap).map(l => ({ ...l, warehouses: [...l.warehouses].join('، ') }));
  rows = sortData(rows, _sortCol || 'lotNo', _sortAsc);

  _currentData = rows.map(r => ({
    رقم_التشغيلة: r.lotNo, اسم_الصنف: r.productName, الكود: r.sku,
    الكمية: r.qty, القيمة: r.value, تاريخ_الإنتاج: r.productionDate, تاريخ_الانتهاء: r.expiryDate,
  }));

  const kpis = [
    kpiCard('🔢', 'عدد التشغيلات', rows.length, 'indigo'),
    kpiCard('📦', 'إجمالي الكميات', formatQuantity(rows.reduce((s,r)=>s+r.qty,0)), 'good'),
    kpiCard('💰', 'القيمة الإجمالية', formatCurrency(rows.reduce((s,r)=>s+r.value,0)), 'indigo'),
  ].join('');

  const headers = [
    { key: 'lotNo',          label: 'رقم التشغيلة',  sortable: true },
    { key: 'productName',    label: 'الصنف',          sortable: true },
    { key: 'qty',            label: 'الكمية',         sortable: true },
    { key: 'value',          label: 'القيمة',         sortable: true },
    { key: 'productionDate', label: 'تاريخ الإنتاج', sortable: true },
    { key: 'expiryDate',     label: 'تاريخ الانتهاء',sortable: true },
    { key: 'warehouses',     label: 'المخازن',        sortable: false },
  ];

  const tableRows = rows.map(r => ({
    lotNo:          `<span class="mono font-bold">${r.lotNo}</span>`,
    productName:    `<strong>${r.productName}</strong>`,
    qty:            `<span class="mono">${formatQuantity(r.qty)}</span>`,
    value:          `<span class="mono">${formatCurrency(r.value)}</span>`,
    productionDate: `<span class="mono dim">${r.productionDate}</span>`,
    expiryDate:     `<span class="mono ${r.expiryDate !== '—' && r.expiryDate < todayString() ? 'text-bad' : ''}">${r.expiryDate}</span>`,
    warehouses:     `<span class="dim" style="font-size:12px;">${r.warehouses}</span>`,
  }));

  return reportWrap('تقرير التشغيلات — Lot Tracking', '🔢', kpis,
    buildSortableTable(headers, tableRows));
}

// ─── 14. تواريخ الإنتاج ──────────────────────────────────────────────────────
function renderProduction(f) {
  const today = new Date();
  let rows = _stock.filter(s => {
    if (!matchesFilters(s, f)) return false;
    if (f.whId && s.warehouseId !== f.whId) return false;
    return s.productionDate || s.expiryDate;
  }).map(s => {
    const remaining = s.expiryDate ? Math.max(0, daysBetween(today, parseDate(s.expiryDate))) : null;
    return {
      productName: s.productName, sku: s.sku, warehouseName: s.warehouseName,
      qty: s.qty, value: s.value,
      productionDate:  s.productionDate || '—',
      expiryDate:      s.expiryDate     || '—',
      batchNo:         s.batchNo        || '—',
      shelfLife:       (s.productionDate && s.expiryDate)
        ? `${daysBetween(parseDate(s.productionDate), parseDate(s.expiryDate))} يوم` : '—',
      remaining,
    };
  });

  rows = sortData(rows, _sortCol || 'productionDate', _sortAsc);

  _currentData = rows.map(r => ({
    اسم_الصنف: r.productName, الكود: r.sku, المخزن: r.warehouseName,
    الكمية: r.qty, تاريخ_الإنتاج: r.productionDate, تاريخ_الانتهاء: r.expiryDate,
    رقم_الدفعة: r.batchNo, مدة_الصلاحية: r.shelfLife, الأيام_المتبقية: r.remaining ?? '—',
  }));

  const kpis = [
    kpiCard('🏭', 'أصناف بتواريخ', rows.length, 'indigo'),
    kpiCard('⚠️', 'تنتهي خلال 30 يوم', rows.filter(r=>r.remaining!==null&&r.remaining<=30&&r.remaining>0).length, 'warn'),
    kpiCard('⛔', 'منتهية الصلاحية', rows.filter(r=>r.remaining===0).length, 'bad'),
  ].join('');

  const headers = [
    { key: 'productName',    label: 'الصنف',           sortable: true },
    { key: 'warehouseName',  label: 'المخزن',          sortable: true },
    { key: 'qty',            label: 'الكمية',          sortable: true },
    { key: 'productionDate', label: 'تاريخ الإنتاج',  sortable: true },
    { key: 'expiryDate',     label: 'تاريخ الانتهاء', sortable: true },
    { key: 'batchNo',        label: 'رقم الدفعة',     sortable: true },
    { key: 'shelfLife',      label: 'مدة الصلاحية',   sortable: false },
    { key: 'remaining',      label: 'متبقي',           sortable: false },
  ];

  const tableRows = rows.map(r => {
    const rd = r.remaining;
    return {
      _rowClass: rd === 0 ? 'row-bad' : rd !== null && rd <= 30 ? 'row-warn' : '',
      productName:    `<strong>${r.productName}</strong>`,
      warehouseName:  r.warehouseName,
      qty:            `<span class="mono">${formatQuantity(r.qty)}</span>`,
      productionDate: `<span class="mono dim">${r.productionDate}</span>`,
      expiryDate:     `<span class="mono ${rd !== null && rd <= 0 ? 'text-bad' : rd !== null && rd <= 30 ? 'text-warn' : ''}">${r.expiryDate}</span>`,
      batchNo:        `<span class="mono dim">${r.batchNo}</span>`,
      shelfLife:      `<span class="mono dim">${r.shelfLife}</span>`,
      remaining:      rd === null ? '<span class="dim">—</span>'
        : rd === 0   ? '<span class="badge-danger">منتهي</span>'
        : rd <= 7    ? `<span class="badge-danger">⚡ ${rd} يوم</span>`
        : rd <= 30   ? `<span class="badge-warn">⏳ ${rd} يوم</span>`
        : `<span class="badge-good">${rd} يوم</span>`,
    };
  });

  return reportWrap('متابعة تواريخ الإنتاج والصلاحية', '🏭', kpis,
    buildSortableTable(headers, tableRows));
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — التحليل والأداء
// ══════════════════════════════════════════════════════════════════════════════

// ─── 15. تحليل ABC ───────────────────────────────────────────────────────────
function renderABC(f) {
  const prodMap = {};
  _stock.filter(s => matchesFilters(s, f)).forEach(s => {
    if (f.whId && s.warehouseId !== f.whId) return;
    if (!prodMap[s.productId]) prodMap[s.productId] = {
      productId: s.productId, productName: s.productName, sku: s.sku,
      categoryName: s.categoryName, qty: 0, value: 0,
    };
    prodMap[s.productId].qty   += (s.qty || 0);
    prodMap[s.productId].value += s.value;
  });

  let items = Object.values(prodMap).sort((a, b) => b.value - a.value);
  const totalValue = items.reduce((s, i) => s + i.value, 0);

  let cumulative = 0;
  items.forEach(item => {
    cumulative += item.value;
    const pct = totalValue > 0 ? (cumulative / totalValue) * 100 : 0;
    item.cumPct   = pct;
    item.pct      = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
    item.abcClass = pct <= 80 ? 'A' : pct <= 95 ? 'B' : 'C';
  });

  if (_sortCol) items = sortData(items, _sortCol, _sortAsc);

  _currentData = items.map(r => ({
    فئة_ABC: r.abcClass, اسم_الصنف: r.productName, الكود: r.sku,
    التصنيف: r.categoryName, الكمية: r.qty, القيمة: r.value,
    النسبة: r.pct.toFixed(2) + '%', التراكمي: r.cumPct.toFixed(2) + '%',
  }));

  const aItems = items.filter(i => i.abcClass === 'A');
  const bItems = items.filter(i => i.abcClass === 'B');
  const cItems = items.filter(i => i.abcClass === 'C');

  const kpis = [
    kpiCard('🅰️', `فئة A — ${aItems.length} صنف`, formatCurrency(aItems.reduce((s,i)=>s+i.value,0)), 'bad', 'أعلى 80% من القيمة'),
    kpiCard('🅱️', `فئة B — ${bItems.length} صنف`, formatCurrency(bItems.reduce((s,i)=>s+i.value,0)), 'warn', 'من 80% إلى 95%'),
    kpiCard('©️',  `فئة C — ${cItems.length} صنف`, formatCurrency(cItems.reduce((s,i)=>s+i.value,0)), 'indigo', 'الـ 5% الأخيرة'),
    kpiCard('💰', 'إجمالي القيمة', formatCurrency(totalValue), 'good'),
  ].join('');

  const headers = [
    { key: 'abcClass',    label: 'فئة ABC',             sortable: true },
    { key: 'productName', label: 'اسم الصنف',           sortable: true },
    { key: 'sku',         label: 'الكود',                sortable: true },
    { key: 'qty',         label: 'الكمية',               sortable: true },
    { key: 'value',       label: 'القيمة',               sortable: true },
    { key: 'pctBar',      label: 'النسبة من الإجمالي',   sortable: false },
    { key: 'cumPct',      label: 'التراكمي',             sortable: true },
  ];

  const tableRows = items.map(r => ({
    _rowClass: r.abcClass === 'A' ? 'abc-a' : r.abcClass === 'B' ? 'abc-b' : 'abc-c',
    abcClass:    `<span class="badge-${r.abcClass==='A'?'danger':r.abcClass==='B'?'warn':'neutral'}" style="font-weight:900;font-size:13px;">فئة ${r.abcClass}</span>`,
    productName: `<strong>${r.productName}</strong>`,
    sku:         `<span class="mono dim" style="font-size:11px;">${r.sku}</span>`,
    qty:         `<span class="mono">${formatQuantity(r.qty)}</span>`,
    value:       `<span class="mono font-bold">${formatCurrency(r.value)}</span>`,
    pctBar:      `<div style="display:flex;align-items:center;gap:6px;">
      <div style="flex:1;background:var(--bg-3);border-radius:4px;height:6px;min-width:80px;">
        <div style="width:${Math.min(r.pct,100).toFixed(1)}%;background:${r.abcClass==='A'?'var(--bad)':r.abcClass==='B'?'var(--warn)':'var(--brand)'};border-radius:4px;height:6px;"></div>
      </div>
      <span class="mono" style="font-size:11px;min-width:36px;">${r.pct.toFixed(1)}%</span>
    </div>`,
    cumPct:      `<span class="mono dim">${r.cumPct.toFixed(1)}%</span>`,
  }));

  return reportWrap('تحليل ABC — تصنيف حسب القيمة المالية', '📊', kpis,
    buildSortableTable(headers, tableRows));
}

// ─── 16. تحليل XYZ ───────────────────────────────────────────────────────────
function renderXYZ(f) {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 90);
  const txMap = {};
  _txns.forEach(t => {
    const d = parseDate(t.createdAt);
    if (!d || d < cutoff) return;
    if (!txMap[t.productId]) txMap[t.productId] = { count: 0, qty: 0 };
    txMap[t.productId].count++;
    txMap[t.productId].qty += Math.abs(t.qtyChange || 0);
  });

  const prodMap = {};
  _stock.filter(s => matchesFilters(s, f)).forEach(s => {
    if (f.whId && s.warehouseId !== f.whId) return;
    if (!prodMap[s.productId]) prodMap[s.productId] = {
      productId: s.productId, productName: s.productName, sku: s.sku,
      categoryName: s.categoryName, qty: 0, value: 0,
    };
    prodMap[s.productId].qty   += (s.qty || 0);
    prodMap[s.productId].value += s.value;
  });

  let items = Object.values(prodMap).map(p => {
    const tx = txMap[p.productId] || { count: 0, qty: 0 };
    return { ...p, txCount: tx.count, movedQty: tx.qty, xyzClass: tx.count >= 20 ? 'X' : tx.count >= 6 ? 'Y' : 'Z' };
  });

  items = _sortCol ? sortData(items, _sortCol, _sortAsc) : items.sort((a,b) => b.txCount - a.txCount);

  _currentData = items.map(r => ({
    فئة_XYZ: r.xyzClass, اسم_الصنف: r.productName, الكود: r.sku,
    الكمية: r.qty, القيمة: r.value, حركات_90_يوم: r.txCount, كمية_محركة: r.movedQty,
  }));

  const xItems = items.filter(i => i.xyzClass === 'X');
  const yItems = items.filter(i => i.xyzClass === 'Y');
  const zItems = items.filter(i => i.xyzClass === 'Z');

  const kpis = [
    kpiCard('📈', `فئة X — ${xItems.length} صنف`, 'طلب مستقر', 'good', '≥20 حركة / 90 يوم'),
    kpiCard('📊', `فئة Y — ${yItems.length} صنف`, 'طلب متذبذب', 'warn', '6–19 حركة / 90 يوم'),
    kpiCard('📉', `فئة Z — ${zItems.length} صنف`, 'طلب غير منتظم', 'bad', 'أقل من 6 حركات'),
  ].join('');

  const headers = [
    { key: 'xyzClass',    label: 'فئة XYZ',         sortable: true },
    { key: 'productName', label: 'اسم الصنف',        sortable: true },
    { key: 'sku',         label: 'الكود',             sortable: true },
    { key: 'qty',         label: 'المخزون الحالي',   sortable: true },
    { key: 'value',       label: 'القيمة',            sortable: true },
    { key: 'txCount',     label: 'حركات (90 يوم)',    sortable: true },
    { key: 'movedQty',    label: 'كمية محركة',        sortable: true },
  ];

  const tableRows = items.map(r => ({
    _rowClass: r.xyzClass === 'Z' ? 'row-warn' : '',
    xyzClass:    `<span class="badge-${r.xyzClass==='X'?'good':r.xyzClass==='Y'?'warn':'danger'}" style="font-weight:900;font-size:13px;">فئة ${r.xyzClass}</span>`,
    productName: `<strong>${r.productName}</strong>`,
    sku:         `<span class="mono dim" style="font-size:11px;">${r.sku}</span>`,
    qty:         `<span class="mono">${formatQuantity(r.qty)}</span>`,
    value:       `<span class="mono">${formatCurrency(r.value)}</span>`,
    txCount:     `<span class="mono font-bold" style="color:${r.txCount>=20?'var(--good)':r.txCount>=6?'var(--warn)':'var(--bad)'};">${r.txCount}</span>`,
    movedQty:    `<span class="mono">${formatQuantity(r.movedQty)}</span>`,
  }));

  return reportWrap('تحليل XYZ — تصنيف حسب استقرار الطلب', '📊', kpis,
    buildSortableTable(headers, tableRows));
}

// ─── 17. الأصناف الراكدة ─────────────────────────────────────────────────────
function renderDormant(f) {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 90);
  const activeIds = new Set();
  _txns.forEach(t => { const d = parseDate(t.createdAt); if (d && d > cutoff) activeIds.add(t.productId); });

  const lastMov = {};
  _txns.forEach(t => {
    const d = parseDate(t.createdAt);
    if (!d) return;
    if (!lastMov[t.productId] || d > lastMov[t.productId]) lastMov[t.productId] = d;
  });

  const prodMap = {};
  _stock.filter(s => matchesFilters(s, f) && (s.qty || 0) > 0).forEach(s => {
    if (f.whId && s.warehouseId !== f.whId) return;
    if (!prodMap[s.productId]) prodMap[s.productId] = {
      productId: s.productId, productName: s.productName, sku: s.sku,
      categoryName: s.categoryName, qty: 0, value: 0,
    };
    prodMap[s.productId].qty   += (s.qty || 0);
    prodMap[s.productId].value += s.value;
  });

  let items = Object.values(prodMap)
    .filter(p => !activeIds.has(p.productId))
    .map(p => ({
      ...p,
      lastMovement: lastMov[p.productId]?.toLocaleDateString('ar-SA') || 'لا توجد حركة',
      idleDays:     lastMov[p.productId] ? daysBetween(lastMov[p.productId], new Date()) : 999,
    }));

  items = _sortCol ? sortData(items, _sortCol, _sortAsc) : items.sort((a,b) => b.idleDays - a.idleDays);

  _currentData = items.map(r => ({
    اسم_الصنف: r.productName, الكود: r.sku, التصنيف: r.categoryName,
    الكمية: r.qty, القيمة: r.value, آخر_حركة: r.lastMovement,
    أيام_الركود: r.idleDays === 999 ? '—' : r.idleDays,
  }));

  const totalLocked = items.reduce((s,r) => s+r.value, 0);
  const kpis = [
    kpiCard('💤', 'أصناف راكدة (+90 يوم)', items.length, 'bad'),
    kpiCard('💸', 'قيمة رأس المال المجمد', formatCurrency(totalLocked), 'bad'),
    kpiCard('📦', 'إجمالي الكميات الراكدة', formatQuantity(items.reduce((s,r)=>s+r.qty,0)), 'warn'),
  ].join('');

  const headers = [
    { key: 'productName',   label: 'اسم الصنف',   sortable: true },
    { key: 'sku',           label: 'الكود',        sortable: true },
    { key: 'categoryName',  label: 'التصنيف',      sortable: true },
    { key: 'qty',           label: 'الكمية',       sortable: true },
    { key: 'value',         label: 'القيمة',       sortable: true },
    { key: 'lastMovement',  label: 'آخر حركة',     sortable: true },
    { key: 'idleDays',      label: 'أيام الركود',  sortable: true },
  ];

  const tableRows = items.map(r => ({
    _rowClass: r.idleDays > 180 ? 'row-bad' : 'row-warn',
    productName:  `<strong>${r.productName}</strong>`,
    sku:          `<span class="mono dim" style="font-size:11px;">${r.sku}</span>`,
    categoryName: r.categoryName,
    qty:          `<span class="mono">${formatQuantity(r.qty)}</span>`,
    value:        `<span class="mono font-bold">${formatCurrency(r.value)}</span>`,
    lastMovement: `<span class="mono dim">${r.lastMovement}</span>`,
    idleDays:     `<span class="mono font-bold" style="color:${r.idleDays>180?'var(--bad)':'var(--warn)'};">${r.idleDays===999?'—':r.idleDays+' يوم'}</span>`,
  }));

  const total = {
    productName: `<strong>الإجمالي (${items.length} صنف)</strong>`, sku: '', categoryName: '',
    qty:  `<span class="mono font-bold">${formatQuantity(items.reduce((s,r)=>s+r.qty,0))}</span>`,
    value:`<span class="mono font-bold">${formatCurrency(totalLocked)}</span>`,
    lastMovement: '', idleDays: '',
  };

  return reportWrap('الأصناف الراكدة — بدون حركة 90+ يوم', '💤', kpis,
    buildSortableTable(headers, tableRows, total));
}

// ─── 18. سريعة الحركة ────────────────────────────────────────────────────────
function renderFastMoving(f) {
  const dateFrom = f.dateFrom ? new Date(f.dateFrom) : (() => { const d=new Date(); d.setDate(d.getDate()-90); return d; })();
  const dateTo   = f.dateTo   ? new Date(f.dateTo)   : new Date();

  // ─── الأصناف سريعة الحركة = الأكثر مبيعاً (فواتير + سيارات المناديب)
  const txMap = {};

  // مصدر 1: فواتير المبيعات المباشرة
  (_salesInvoices || []).forEach(inv => {
    const d = parseDate(inv.date || inv.createdAt);
    if (!d || d < dateFrom || d > dateTo) return;
    if (f.whId && inv.warehouseId && inv.warehouseId !== f.whId) return;
    (inv.lines || inv.items || []).forEach(l => {
      if (!l.productId) return;
      const nm = l.productName || l.name || '';
      const sk = l.sku || '';
      if (f.search && !`${nm} ${sk}`.toLowerCase().includes(f.search)) return;
      if (!txMap[l.productId]) txMap[l.productId] = {
        productId: l.productId, productName: nm, sku: sk,
        outQty: 0, txCount: 0, totalCost: 0,
      };
      const qty = Math.abs(l.qty || l.quantity || 0);
      txMap[l.productId].outQty    += qty;
      txMap[l.productId].txCount   += 1;
      txMap[l.productId].totalCost += qty * (l.costPrice || l.cost || 0);
    });
  });

  // مصدر 2: تحميل سيارات المناديب (rep_load = بيع عبر السيارة)
  (_txns || []).forEach(t => {
    const type = (t.type || '').toLowerCase().replace(/_/g,'-');
    if (type !== 'rep-load') return;
    const d = parseDate(t.createdAt);
    if (!d || d < dateFrom || d > dateTo) return;
    if (f.whId && t.warehouseId && t.warehouseId !== f.whId) return;
    if (f.search && !`${t.productName||''} ${t.sku||''}`.toLowerCase().includes(f.search)) return;
    if (!t.productId) return;
    if (!txMap[t.productId]) txMap[t.productId] = {
      productId: t.productId, productName: t.productName||'', sku: t.sku||'',
      outQty: 0, txCount: 0, totalCost: 0,
    };
    const qty = Math.abs(t.qtyChange || 0);
    txMap[t.productId].outQty    += qty;
    txMap[t.productId].txCount   += 1;
    txMap[t.productId].totalCost += qty * (t.cost || 0);
  });

  let items = Object.values(txMap);
  items = _sortCol ? sortData(items, _sortCol, _sortAsc) : items.sort((a,b) => b.outQty - a.outQty);
  items = items.slice(0, 50);

  const days = Math.max(1, Math.round((dateTo - dateFrom) / 86400000));

  _currentData = items.map(r => ({
    اسم_الصنف: r.productName, الكود: r.sku,
    كمية_الصادر: r.outQty, عدد_الحركات: r.txCount, تكلفة_الصادر: r.totalCost,
    معدل_يومي: (r.outQty / days).toFixed(2),
  }));

  const kpis = [
    kpiCard('🚀', 'أعلى الأصناف حركةً', items.length, 'good'),
    kpiCard('📤', 'إجمالي الصادر', formatQuantity(items.reduce((s,r)=>s+r.outQty,0)), 'good'),
    kpiCard('💰', 'تكلفة الصادر', formatCurrency(items.reduce((s,r)=>s+r.totalCost,0)), 'indigo'),
  ].join('');

  const headers = [
    { key: 'rank',        label: '#',               sortable: false },
    { key: 'productName', label: 'اسم الصنف',      sortable: true },
    { key: 'sku',         label: 'الكود',           sortable: true },
    { key: 'outQty',      label: 'الكمية المنصرفة',sortable: true },
    { key: 'txCount',     label: 'عدد الحركات',    sortable: true },
    { key: 'totalCost',   label: 'تكلفة الصادر',  sortable: true },
    { key: 'avgPerDay',   label: 'معدل يومي',      sortable: false },
  ];

  const tableRows = items.map((r, idx) => ({
    _rowClass: idx < 3 ? 'row-good' : '',
    rank:        `<span class="mono font-bold" style="color:${idx<3?'var(--brand)':'var(--text-2)'};">${idx+1}</span>`,
    productName: `<strong>${r.productName}</strong>`,
    sku:         `<span class="mono dim" style="font-size:11px;">${r.sku}</span>`,
    outQty:      `<span class="mono font-bold">${formatQuantity(r.outQty)}</span>`,
    txCount:     `<span class="mono">${r.txCount}</span>`,
    totalCost:   `<span class="mono">${formatCurrency(r.totalCost)}</span>`,
    avgPerDay:   `<span class="mono dim">${(r.outQty / days).toFixed(2)}</span>`,
  }));

  return reportWrap('الأصناف سريعة الحركة — أعلى 50 صنف', '🚀', kpis,
    buildSortableTable(headers, tableRows));
}

// ─── 19. معدل دوران المخزون ──────────────────────────────────────────────────
function renderTurnover(f) {
  const outflows = {};
  _txns.forEach(t => {
    if ((t.qtyChange || 0) >= 0) return;
    if (!inDateRange(t.createdAt, f.dateFrom, f.dateTo)) return;
    if (f.whId && t.warehouseId !== f.whId) return;
    if (!outflows[t.productId]) outflows[t.productId] = { cogs: 0, productName: t.productName, sku: t.sku };
    outflows[t.productId].cogs += Math.abs(t.qtyChange || 0) * (t.cost || 0);
  });

  const prodMap = {};
  _stock.filter(s => matchesFilters(s, f)).forEach(s => {
    if (f.whId && s.warehouseId !== f.whId) return;
    if (!prodMap[s.productId]) prodMap[s.productId] = {
      productId: s.productId, productName: s.productName, sku: s.sku, qty: 0, value: 0,
    };
    prodMap[s.productId].qty   += (s.qty || 0);
    prodMap[s.productId].value += s.value;
  });

  let items = Object.values(prodMap).map(p => {
    const of  = outflows[p.productId] || { cogs: 0 };
    const avgInv   = p.value || 1;
    const turnover = of.cogs / avgInv;
    return { ...p, cogs: of.cogs, turnover: Math.round(turnover * 100) / 100, daysInStock: turnover > 0 ? Math.round(365 / turnover) : 999 };
  }).filter(i => i.value > 0);

  items = _sortCol ? sortData(items, _sortCol, _sortAsc) : items.sort((a,b) => b.turnover - a.turnover);

  _currentData = items.map(r => ({
    اسم_الصنف: r.productName, الكود: r.sku,
    قيمة_المخزون: r.value, تكلفة_الصادر: r.cogs,
    معدل_الدوران: r.turnover, أيام_المخزون: r.daysInStock === 999 ? '—' : r.daysInStock,
  }));

  const avgTurnover = items.length > 0 ? (items.reduce((s,r)=>s+r.turnover,0) / items.length).toFixed(2) : '0';
  const kpis = [
    kpiCard('🔄', 'متوسط معدل الدوران', `${avgTurnover}×`, 'indigo', 'مرات في السنة'),
    kpiCard('📦', 'إجمالي قيمة المخزون', formatCurrency(items.reduce((s,r)=>s+r.value,0)), 'good'),
    kpiCard('💸', 'إجمالي تكلفة الصادر', formatCurrency(items.reduce((s,r)=>s+r.cogs,0)), 'warn'),
  ].join('');

  const headers = [
    { key: 'productName', label: 'اسم الصنف',     sortable: true },
    { key: 'sku',         label: 'الكود',          sortable: true },
    { key: 'value',       label: 'قيمة المخزون',  sortable: true },
    { key: 'cogs',        label: 'تكلفة الصادر',  sortable: true },
    { key: 'turnover',    label: 'معدل الدوران ×', sortable: true },
    { key: 'daysInStock', label: 'أيام التغطية',  sortable: true },
    { key: 'perf',        label: 'الأداء',         sortable: false },
  ];

  const tableRows = items.map(r => {
    const t = r.turnover;
    const perfLabel = t >= 8 ? 'ممتاز' : t >= 4 ? 'جيد' : t >= 1 ? 'متوسط' : 'ضعيف';
    const perfColor = t >= 8 ? 'good' : t >= 4 ? 'neutral' : t >= 1 ? 'warn' : 'danger';
    return {
      _rowClass: t < 1 ? 'row-bad' : t < 4 ? 'row-warn' : 'row-good',
      productName: `<strong>${r.productName}</strong>`,
      sku:         `<span class="mono dim" style="font-size:11px;">${r.sku}</span>`,
      value:       `<span class="mono">${formatCurrency(r.value)}</span>`,
      cogs:        `<span class="mono">${formatCurrency(r.cogs)}</span>`,
      turnover:    `<span class="mono font-bold">${r.turnover}×</span>`,
      daysInStock: `<span class="mono">${r.daysInStock === 999 ? '—' : r.daysInStock + ' يوم'}</span>`,
      perf:        `<span class="badge-${perfColor}">${perfLabel}</span>`,
    };
  });

  return reportWrap('معدل دوران المخزون — Inventory Turnover Rate', '🔄', kpis,
    buildSortableTable(headers, tableRows));
}

// ─── 20. الفاقد والتالف ──────────────────────────────────────────────────────
function renderWaste(f) {
  let txns = _txns.filter(t => {
    const isWaste = ['waste','damage','damaged','spoilage','loss','write_off'].includes((t.type||'').toLowerCase())
      || (t.reason || '').toLowerCase().includes('تالف')
      || (t.reason || '').toLowerCase().includes('فاقد');
    if (!isWaste) return false;
    if (!inDateRange(t.createdAt, f.dateFrom, f.dateTo)) return false;
    if (f.whId && t.warehouseId !== f.whId) return false;
    if (f.search && !`${t.productName||''} ${t.sku||''}`.toLowerCase().includes(f.search)) return false;
    return true;
  });

  _adjustments.forEach(adj => {
    if (!['waste','damage','loss','spoilage'].includes((adj.opType||'').toLowerCase())) return;
    if (!inDateRange(adj.date, f.dateFrom, f.dateTo)) return;
    if (f.whId && adj.warehouseId !== f.whId) return;
    (adj.lines || []).forEach(line => {
      if (f.search && !`${line.productName||''} ${line.sku||''}`.toLowerCase().includes(f.search)) return;
      txns.push({
        productName: line.productName || line.name || '—', sku: line.sku || '',
        warehouseName: adj.warehouseName || '—',
        qtyChange: -(line.qty || 0), cost: line.cost || 0,
        createdAt: adj.date, type: adj.opType, reason: adj.reason || '—',
      });
    });
  });

  let rows = txns.map(t => ({
    date:          parseDate(t.createdAt)?.toISOString().slice(0,10) || '',
    productName:   t.productName, sku: t.sku || '',
    warehouseName: t.warehouseName,
    qty:           Math.abs(t.qtyChange || 0),
    totalLoss:     Math.abs(t.qtyChange || 0) * (t.cost || 0),
    type:          t.type || '—', reason: t.reason || '—',
  }));

  rows = _sortCol ? sortData(rows, _sortCol, _sortAsc) : rows.sort((a,b) => b.date.localeCompare(a.date));

  _currentData = rows.map(r => ({
    التاريخ: r.date, اسم_الصنف: r.productName, الكود: r.sku,
    المخزن: r.warehouseName, الكمية: r.qty, الخسارة: r.totalLoss, السبب: r.reason,
  }));

  const totalLoss = rows.reduce((s,r) => s+r.totalLoss, 0);
  const kpis = [
    kpiCard('🗑️', 'حوادث الفاقد والتالف', rows.length, 'bad'),
    kpiCard('💸', 'إجمالي الخسائر', formatCurrency(totalLoss), 'bad'),
    kpiCard('📦', 'إجمالي الكميات التالفة', formatQuantity(rows.reduce((s,r)=>s+r.qty,0)), 'warn'),
  ].join('');

  const headers = [
    { key: 'date',          label: 'التاريخ',  sortable: true },
    { key: 'productName',   label: 'الصنف',    sortable: true },
    { key: 'warehouseName', label: 'المخزن',   sortable: true },
    { key: 'qty',           label: 'الكمية',   sortable: true },
    { key: 'totalLoss',     label: 'الخسارة',  sortable: true },
    { key: 'type',          label: 'النوع',    sortable: true },
    { key: 'reason',        label: 'السبب',    sortable: false },
  ];

  const tableRows = rows.map(r => ({
    _rowClass: 'row-bad',
    date:          `<span class="mono">${r.date}</span>`,
    productName:   `<strong>${r.productName}</strong>`,
    warehouseName: r.warehouseName,
    qty:           `<span class="mono text-bad">${formatQuantity(r.qty)}</span>`,
    totalLoss:     `<span class="mono font-bold text-bad">${formatCurrency(r.totalLoss)}</span>`,
    type:          `<span class="badge-danger">${r.type}</span>`,
    reason:        `<span class="dim">${r.reason}</span>`,
  }));

  const total = {
    date: '<strong>الإجمالي</strong>', productName: '', warehouseName: '', type: '', reason: '',
    qty:       `<span class="mono font-bold">${formatQuantity(rows.reduce((s,r)=>s+r.qty,0))}</span>`,
    totalLoss: `<span class="mono font-bold text-bad">${formatCurrency(totalLoss)}</span>`,
  };

  return reportWrap('فاقد المخزون والتالف — سجل الخسائر', '🗑️', kpis,
    buildSortableTable(headers, tableRows, total));
}

// ─── 21. دقة الجرد ───────────────────────────────────────────────────────────
function renderAccuracy(f) {
  const stockMap = {};
  _stock.forEach(s => { stockMap[`${s.warehouseId}_${s.productId}`] = s; });

  let rows = [];
  _physCounts.forEach(pc => {
    if (!inDateRange(pc.date || pc.createdAt, f.dateFrom, f.dateTo)) return;
    if (f.whId && pc.warehouseId !== f.whId) return;
    const whName = pc.warehouseName || _warehouses.find(w => w.id === pc.warehouseId)?.name || pc.warehouseId;
    (pc.lines || []).forEach(line => {
      if (f.search && !`${line.productName||''} ${line.sku||''}`.toLowerCase().includes(f.search)) return;
      const key         = `${pc.warehouseId}_${line.productId}`;
      const bookQty     = stockMap[key]?.qty || 0;
      const physicalQty = line.countedQty || line.qty || 0;
      const variance    = physicalQty - bookQty;
      const costPrice   = stockMap[key]?.costPrice || line.cost || 0;
      rows.push({
        date: pc.date || parseDate(pc.createdAt)?.toISOString().slice(0,10) || '',
        productName: line.productName || '—', sku: line.sku || '',
        warehouseName: whName, bookQty, physicalQty, variance,
        variancePct:  bookQty !== 0 ? ((variance / bookQty) * 100).toFixed(1) + '%' : '—',
        varianceCost: variance * costPrice,
      });
    });
  });

  rows = _sortCol ? sortData(rows, _sortCol, _sortAsc) : rows.sort((a,b) => Math.abs(b.variance) - Math.abs(a.variance));

  _currentData = rows.map(r => ({
    التاريخ: r.date, اسم_الصنف: r.productName, الكود: r.sku,
    المخزن: r.warehouseName, رصيد_الدفتر: r.bookQty,
    رصيد_العد: r.physicalQty, الفرق: r.variance, قيمة_الفرق: r.varianceCost,
  }));

  const matched      = rows.filter(r => r.variance === 0).length;
  const accuracy     = rows.length > 0 ? ((matched / rows.length) * 100).toFixed(1) : '—';
  const totalVarCost = rows.reduce((s,r) => s + Math.abs(r.varianceCost), 0);

  const kpis = [
    kpiCard('🎯', 'دقة الجرد', `${accuracy}%`, accuracy >= 90 ? 'good' : accuracy >= 70 ? 'warn' : 'bad'),
    kpiCard('✅', 'أصناف مطابقة', matched, 'good'),
    kpiCard('❌', 'أصناف بفرق', rows.length - matched, 'bad'),
    kpiCard('💸', 'قيمة الفروقات', formatCurrency(totalVarCost), 'warn'),
  ].join('');

  const headers = [
    { key: 'date',          label: 'تاريخ الجرد',  sortable: true },
    { key: 'productName',   label: 'الصنف',        sortable: true },
    { key: 'warehouseName', label: 'المخزن',       sortable: true },
    { key: 'bookQty',       label: 'رصيد الدفتر',  sortable: true },
    { key: 'physicalQty',   label: 'رصيد العد',    sortable: true },
    { key: 'variance',      label: 'الفرق',        sortable: true },
    { key: 'variancePct',   label: 'نسبة الفرق',  sortable: false },
    { key: 'varianceCost',  label: 'قيمة الفرق',  sortable: true },
  ];

  const tableRows = rows.map(r => ({
    _rowClass: r.variance === 0 ? 'row-good' : Math.abs(r.variance) > 10 ? 'row-bad' : 'row-warn',
    date:          `<span class="mono">${r.date}</span>`,
    productName:   `<strong>${r.productName}</strong>`,
    warehouseName: r.warehouseName,
    bookQty:       `<span class="mono">${formatQuantity(r.bookQty)}</span>`,
    physicalQty:   `<span class="mono">${formatQuantity(r.physicalQty)}</span>`,
    variance:      `<span class="mono font-bold" style="color:${r.variance===0?'var(--good)':r.variance>0?'var(--warn)':'var(--bad)'};">${r.variance>0?'+':''}${formatQuantity(r.variance)}</span>`,
    variancePct:   `<span class="mono">${r.variancePct}</span>`,
    varianceCost:  `<span class="mono ${r.varianceCost!==0?'text-bad':''}">${formatCurrency(Math.abs(r.varianceCost))}</span>`,
  }));

  return reportWrap('دقة الجرد — مقارنة الرصيد الدفتري والفعلي', '🎯', kpis,
    buildSortableTable(headers, tableRows));
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 5 — إعادة الطلب
// ══════════════════════════════════════════════════════════════════════════════

// ─── 22. أصناف دون الحد الأدنى ───────────────────────────────────────────────
function renderBelowMin(f) {
  const prodMap = {};
  _stock.filter(s => matchesFilters(s, f)).forEach(s => {
    if (f.whId && s.warehouseId !== f.whId) return;
    if (!prodMap[s.productId]) prodMap[s.productId] = {
      productId: s.productId, productName: s.productName, sku: s.sku,
      categoryName: s.categoryName, qty: 0, value: 0,
      minStock: s.minStock, reorderPoint: s.reorderPoint, maxStock: s.maxStock, costPrice: s.costPrice,
    };
    prodMap[s.productId].qty   += (s.qty || 0);
    prodMap[s.productId].value += s.value;
  });

  let items = Object.values(prodMap).filter(p => p.minStock > 0 && p.qty < p.minStock);
  items = sortData(items, _sortCol || 'qty', _sortAsc);

  _currentData = items.map(r => ({
    اسم_الصنف: r.productName, الكود: r.sku, التصنيف: r.categoryName,
    الكمية_الحالية: r.qty, الحد_الأدنى: r.minStock,
    العجز: r.minStock - r.qty, تكلفة_سد_العجز: (r.minStock - r.qty) * r.costPrice,
  }));

  const totalDeficit = items.reduce((s,r) => s + (r.minStock - r.qty) * r.costPrice, 0);
  const kpis = [
    kpiCard('⬇️', 'أصناف دون الحد الأدنى', items.length, 'bad'),
    kpiCard('💸', 'تكلفة سد العجز', formatCurrency(totalDeficit), 'bad'),
    kpiCard('📦', 'إجمالي العجز (وحدات)', formatQuantity(items.reduce((s,r)=>s+(r.minStock-r.qty),0)), 'warn'),
  ].join('');

  const headers = [
    { key: 'productName',  label: 'اسم الصنف',     sortable: true },
    { key: 'sku',          label: 'الكود',          sortable: true },
    { key: 'categoryName', label: 'التصنيف',        sortable: true },
    { key: 'qty',          label: 'الكمية الحالية', sortable: true },
    { key: 'minStock',     label: 'الحد الأدنى',   sortable: true },
    { key: 'deficit',      label: 'العجز',          sortable: true },
    { key: 'deficitCost',  label: 'تكلفة السد',    sortable: true },
    { key: 'urgency',      label: 'الأولوية',       sortable: false },
  ];

  const tableRows = items.map(r => {
    const deficit = r.minStock - r.qty;
    const pct     = r.minStock > 0 ? (r.qty / r.minStock) * 100 : 0;
    return {
      _rowClass: pct === 0 ? 'row-bad' : 'row-warn',
      productName:  `<strong>${r.productName}</strong>`,
      sku:          `<span class="mono dim" style="font-size:11px;">${r.sku}</span>`,
      categoryName: r.categoryName,
      qty:          `<span class="mono font-bold" style="color:${r.qty<=0?'var(--bad)':'var(--warn)'};">${formatQuantity(r.qty)}</span>`,
      minStock:     `<span class="mono">${r.minStock}</span>`,
      deficit:      `<span class="mono font-bold text-bad">${formatQuantity(deficit)}</span>`,
      deficitCost:  `<span class="mono">${formatCurrency(deficit * r.costPrice)}</span>`,
      urgency:      `<span class="badge-${pct===0?'danger':'warn'}">${pct===0?'حرجة':pct<30?'عالية':'متوسطة'}</span>`,
    };
  });

  const total = {
    productName: `<strong>الإجمالي (${items.length} صنف)</strong>`, sku: '', categoryName: '', qty: '', minStock: '', urgency: '',
    deficit:     `<span class="mono font-bold">${formatQuantity(items.reduce((s,r)=>s+(r.minStock-r.qty),0))}</span>`,
    deficitCost: `<span class="mono font-bold text-bad">${formatCurrency(totalDeficit)}</span>`,
  };

  return reportWrap('أصناف دون الحد الأدنى — تنبيه عاجل', '⬇️', kpis,
    buildSortableTable(headers, tableRows, total));
}

// ─── 23. عند نقطة إعادة الطلب ────────────────────────────────────────────────
function renderReorderPoint(f) {
  const prodMap = {};
  _stock.filter(s => matchesFilters(s, f)).forEach(s => {
    if (f.whId && s.warehouseId !== f.whId) return;
    if (!prodMap[s.productId]) prodMap[s.productId] = {
      productId: s.productId, productName: s.productName, sku: s.sku,
      categoryName: s.categoryName, qty: 0, value: 0,
      minStock: s.minStock, reorderPoint: s.reorderPoint, maxStock: s.maxStock, costPrice: s.costPrice,
    };
    prodMap[s.productId].qty   += (s.qty || 0);
    prodMap[s.productId].value += s.value;
  });

  let items = Object.values(prodMap).filter(p => p.reorderPoint > 0 && p.qty > 0 && p.qty <= p.reorderPoint);
  items = sortData(items, _sortCol || 'qty', _sortAsc);

  _currentData = items.map(r => ({
    اسم_الصنف: r.productName, الكود: r.sku, التصنيف: r.categoryName,
    الكمية_الحالية: r.qty, نقطة_الطلب: r.reorderPoint, الحد_الأقصى: r.maxStock,
  }));

  const kpis = [
    kpiCard('🔁', 'عند نقطة إعادة الطلب', items.length, 'warn'),
    kpiCard('💰', 'قيمة المخزون المنخفض', formatCurrency(items.reduce((s,r)=>s+r.value,0)), 'warn'),
  ].join('');

  const headers = [
    { key: 'productName',  label: 'اسم الصنف',     sortable: true },
    { key: 'sku',          label: 'الكود',          sortable: true },
    { key: 'categoryName', label: 'التصنيف',        sortable: true },
    { key: 'qty',          label: 'الكمية الحالية', sortable: true },
    { key: 'reorderPoint', label: 'نقطة الطلب',    sortable: true },
    { key: 'maxStock',     label: 'الحد الأقصى',   sortable: true },
    { key: 'coverage',     label: 'نسبة التغطية',  sortable: false },
    { key: 'status',       label: 'الحالة',         sortable: false },
  ];

  const tableRows = items.map(r => {
    const pct = r.reorderPoint > 0 ? (r.qty / r.reorderPoint) * 100 : 0;
    return {
      _rowClass: pct < 50 ? 'row-bad' : 'row-warn',
      productName:  `<strong>${r.productName}</strong>`,
      sku:          `<span class="mono dim" style="font-size:11px;">${r.sku}</span>`,
      categoryName: r.categoryName,
      qty:          `<span class="mono font-bold text-warn">${formatQuantity(r.qty)}</span>`,
      reorderPoint: `<span class="mono">${r.reorderPoint}</span>`,
      maxStock:     `<span class="mono dim">${r.maxStock || '—'}</span>`,
      coverage:     `<div style="display:flex;align-items:center;gap:6px;">
        <div style="flex:1;background:var(--bg-3);border-radius:4px;height:8px;min-width:60px;">
          <div style="width:${Math.min(pct,100).toFixed(0)}%;background:${pct<30?'var(--bad)':pct<60?'var(--warn)':'var(--brand)'};border-radius:4px;height:8px;"></div>
        </div>
        <span class="mono" style="font-size:11px;min-width:30px;">${pct.toFixed(0)}%</span>
      </div>`,
      status: `<span class="badge-${pct < 50 ? 'danger' : 'warn'}">يجب طلب شراء</span>`,
    };
  });

  return reportWrap('عند نقطة إعادة الطلب — Reorder Point Alert', '🔁', kpis,
    buildSortableTable(headers, tableRows));
}

// ─── 24. توصيات الشراء ───────────────────────────────────────────────────────
function renderPurchaseRec(f) {
  const prodMap = {};
  _stock.filter(s => matchesFilters(s, f)).forEach(s => {
    if (f.whId && s.warehouseId !== f.whId) return;
    if (!prodMap[s.productId]) prodMap[s.productId] = {
      productId: s.productId, productName: s.productName, sku: s.sku,
      categoryName: s.categoryName, qty: 0, value: 0,
      minStock: s.minStock, reorderPoint: s.reorderPoint, maxStock: s.maxStock, costPrice: s.costPrice,
    };
    prodMap[s.productId].qty   += (s.qty || 0);
    prodMap[s.productId].value += s.value;
  });

  const cutoff30 = new Date(); cutoff30.setDate(cutoff30.getDate() - 30);
  const consumption = {};
  _txns.forEach(t => {
    const d = parseDate(t.createdAt);
    if (!d || d < cutoff30 || (t.qtyChange || 0) >= 0) return;
    if (!consumption[t.productId]) consumption[t.productId] = 0;
    consumption[t.productId] += Math.abs(t.qtyChange || 0);
  });

  let items = Object.values(prodMap)
    .filter(p => (p.reorderPoint > 0 && p.qty <= p.reorderPoint) || (p.minStock > 0 && p.qty <= p.minStock) || p.qty <= 0)
    .map(p => {
      const dailyConsump = (consumption[p.productId] || 0) / 30;
      const reorderQty   = Math.max(0, (p.maxStock || Math.max((p.reorderPoint || 0) * 3, 100)) - p.qty);
      const urgencyDays  = dailyConsump > 0 ? Math.round(p.qty / dailyConsump) : null;
      const priority     = p.qty <= 0 ? 'حرجة' : urgencyDays === null ? 'عادي'
        : urgencyDays <= 3 ? 'حرجة' : urgencyDays <= 7 ? 'عالية' : 'متوسطة';
      return { ...p, dailyConsump: Math.round(dailyConsump * 100) / 100, reorderQty: Math.round(reorderQty), purchaseCost: Math.round(reorderQty) * p.costPrice, urgencyDays, priority };
    });

  const prioOrder = { 'حرجة': 0, 'عالية': 1, 'متوسطة': 2, 'عادي': 3 };
  if (_sortCol) items = sortData(items, _sortCol, _sortAsc);
  else items.sort((a,b) => (prioOrder[a.priority]??3) - (prioOrder[b.priority]??3));

  _currentData = items.map(r => ({
    اسم_الصنف: r.productName, الكود: r.sku, التصنيف: r.categoryName,
    الكمية_الحالية: r.qty, نقطة_الطلب: r.reorderPoint, الحد_الأقصى: r.maxStock,
    كمية_الطلب_المقترحة: r.reorderQty, تكلفة_الطلب: r.purchaseCost,
    المعدل_اليومي: r.dailyConsump, أيام_الكفاية: r.urgencyDays ?? '—', الأولوية: r.priority,
  }));

  const totalPurchaseCost = items.reduce((s,r) => s + r.purchaseCost, 0);
  const criticalCount     = items.filter(r => r.priority === 'حرجة').length;
  const kpis = [
    kpiCard('🛒', 'أصناف تحتاج طلب شراء', items.length, 'warn'),
    kpiCard('🚨', 'أولوية حرجة', criticalCount, 'bad'),
    kpiCard('💰', 'تكلفة الطلب المقترح', formatCurrency(totalPurchaseCost), 'indigo'),
    kpiCard('📦', 'إجمالي الكميات المطلوبة', formatQuantity(items.reduce((s,r)=>s+r.reorderQty,0)), 'good'),
  ].join('');

  const headers = [
    { key: 'priority',     label: 'الأولوية',       sortable: true },
    { key: 'productName',  label: 'اسم الصنف',      sortable: true },
    { key: 'sku',          label: 'الكود',           sortable: true },
    { key: 'qty',          label: 'المخزون الحالي', sortable: true },
    { key: 'reorderPoint', label: 'نقطة الطلب',    sortable: true },
    { key: 'maxStock',     label: 'الحد الأقصى',   sortable: true },
    { key: 'reorderQty',   label: 'كمية الطلب',    sortable: true },
    { key: 'purchaseCost', label: 'تكلفة الطلب',   sortable: true },
    { key: 'dailyConsump', label: 'معدل يومي',      sortable: true },
    { key: 'urgencyDays',  label: 'أيام الكفاية',  sortable: true },
  ];

  const tableRows = items.map(r => ({
    _rowClass: r.priority === 'حرجة' ? 'row-bad' : r.priority === 'عالية' ? 'row-warn' : '',
    priority:     `<span class="badge-${r.priority==='حرجة'?'danger':r.priority==='عالية'?'warn':r.priority==='متوسطة'?'neutral':'good'}" style="font-weight:700;">${r.priority}</span>`,
    productName:  `<strong>${r.productName}</strong>`,
    sku:          `<span class="mono dim" style="font-size:11px;">${r.sku}</span>`,
    qty:          `<span class="mono font-bold" style="color:${r.qty<=0?'var(--bad)':'var(--warn)'};">${formatQuantity(r.qty)}</span>`,
    reorderPoint: `<span class="mono dim">${r.reorderPoint || '—'}</span>`,
    maxStock:     `<span class="mono dim">${r.maxStock || '—'}</span>`,
    reorderQty:   `<span class="mono font-bold text-good">${formatQuantity(r.reorderQty)}</span>`,
    purchaseCost: `<span class="mono font-bold">${formatCurrency(r.purchaseCost)}</span>`,
    dailyConsump: `<span class="mono dim">${r.dailyConsump}</span>`,
    urgencyDays:  r.urgencyDays !== null
      ? `<span class="mono" style="color:${r.urgencyDays<=3?'var(--bad)':r.urgencyDays<=7?'var(--warn)':'inherit'};">${r.urgencyDays} يوم</span>`
      : '<span class="dim">—</span>',
  }));

  const total = {
    priority: '<strong>الإجمالي</strong>', productName: '', sku: '', qty: '',
    reorderPoint: '', maxStock: '', dailyConsump: '', urgencyDays: '',
    reorderQty:   `<span class="mono font-bold">${formatQuantity(items.reduce((s,r)=>s+r.reorderQty,0))}</span>`,
    purchaseCost: `<span class="mono font-bold">${formatCurrency(totalPurchaseCost)}</span>`,
  };

  return reportWrap('توصيات الشراء — خطة إعادة التزويد الكاملة', '🛒', kpis,
    buildSortableTable(headers, tableRows, total));
}

// ─── 25. كرت الحركة العام للأصناف ──────────────────────────────────────────────────
function renderStockLedger(f) {
  // Group current stock by productId (+ optionally filter by warehouse)
  const currentStockMap = {};
  _stock.forEach(s => {
    if (f.whId && s.warehouseId !== f.whId) return;
    if (!currentStockMap[s.productId]) currentStockMap[s.productId] = 0;
    currentStockMap[s.productId] += (s.qty || 0);
  });

  // Filter transactions
  const whTxs = _txns.filter(t => {
    if (f.whId && t.warehouseId !== f.whId) return;
    return true;
  });

  // Group transactions by productId
  const txByProduct = {};
  whTxs.forEach(t => {
    if (!txByProduct[t.productId]) txByProduct[t.productId] = [];
    txByProduct[t.productId].push(t);
  });

  const productIds = new Set([...Object.keys(currentStockMap), ...Object.keys(txByProduct)]);
  const prodMap = Object.fromEntries(_products.map(p => [p.id, p]));
  const catMap  = Object.fromEntries(_categories.map(c => [c.id, c]));

  let rows = [];

  productIds.forEach(pid => {
    const p = prodMap[pid];
    if (!p) return; // Skip unknown products

    // Filter by category
    if (f.catId && p.categoryId !== f.catId) return;

    // Filter by search
    if (f.search && !`${p.name||''} ${p.sku||''}`.toLowerCase().includes(f.search)) return;

    const currentQty = currentStockMap[pid] || 0;
    const txs = txByProduct[pid] || [];

    let qtyChangeSinceFrom = 0;
    let pur = 0;
    let tfIn = 0;
    let retIn = 0;
    let sal = 0;
    let tfOut = 0;
    let adj = 0;

    txs.forEach(t => {
      let dateStr = t.date || "";
      if (!dateStr && t.createdAt) {
        try {
          const dateVal = t.createdAt.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
          dateStr = dateVal.toISOString().split("T")[0];
        } catch {
          dateStr = todayString();
        }
      }

      const qtyChange = t.qtyChange || 0;
      const inRange = inDateRange(dateStr, f.dateFrom, f.dateTo);

      if (f.dateFrom && dateStr >= f.dateFrom) {
        qtyChangeSinceFrom += qtyChange;
      }

      if (inRange) {
        const type = (t.type || '').toLowerCase();
        const srcType = (t.sourceType || '').toLowerCase();
        if (type === 'purchase_in' || srcType === 'purchaseinvoice') {
          pur += qtyChange;
        } else if (type === 'sale_out' || srcType === 'salesinvoice') {
          sal += Math.abs(qtyChange);
        } else if (type === 'transfer_in') {
          tfIn += qtyChange;
        } else if (type === 'transfer_out') {
          tfOut += Math.abs(qtyChange);
        } else if (type === 'return_in' || srcType === 'salesreturn') {
          retIn += qtyChange;
        } else {
          adj += qtyChange;
        }
      }
    });

    const openingQty = currentQty - qtyChangeSinceFrom;
    const closingQty = openingQty + pur + tfIn + retIn - sal - tfOut + adj;
    const costPrice = p.costPrice || p.averageCost || 0;

    rows.push({
      productId: pid,
      productName: p.name || pid,
      sku: p.sku || "",
      categoryName: (catMap[p.categoryId] || {}).name || "",
      openingQty,
      openingValue: openingQty * costPrice,
      pur,
      tfIn,
      retIn,
      sal,
      tfOut,
      adj,
      closingQty,
      closingValue: closingQty * costPrice,
      costPrice,
      currentQty,
      variance: currentQty - closingQty
    });
  });

  // Sort
  if (!_sortCol) rows.sort((a, b) => b.closingValue - a.closingValue);
  else rows = sortData(rows, _sortCol, _sortAsc);

  _currentData = rows.map(r => ({
    اسم_الصنف: r.productName, الكود: r.sku, الافتتاحي: r.openingQty,
    مشتريات: r.pur, تحويل_وارد: r.tfIn, مرتجع: r.retIn,
    مبيعات: r.sal, تحويل_صادر: r.tfOut, تسويات: r.adj,
    الختامي: r.closingQty, الفعلي: r.currentQty, الانحراف: r.variance
  }));

  const totalOpening = rows.reduce((s, r) => s + r.openingQty, 0);
  const totalPur     = rows.reduce((s, r) => s + r.pur, 0);
  const totalTfIn    = rows.reduce((s, r) => s + r.tfIn, 0);
  const totalRetIn   = rows.reduce((s, r) => s + r.retIn, 0);
  const totalSal     = rows.reduce((s, r) => s + r.sal, 0);
  const totalTfOut   = rows.reduce((s, r) => s + r.tfOut, 0);
  const totalAdj     = rows.reduce((s, r) => s + r.adj, 0);
  const totalClosing = rows.reduce((s, r) => s + r.closingQty, 0);
  const totalCurrent = rows.reduce((s, r) => s + r.currentQty, 0);
  const totalVariance= rows.reduce((s, r) => s + r.variance, 0);

  const totalOpeningValue = rows.reduce((s, r) => s + r.openingValue, 0);
  const totalClosingValue = rows.reduce((s, r) => s + r.closingValue, 0);
  const totalSalesValue   = rows.reduce((s, r) => s + (r.sal * r.costPrice), 0);
  const totalTransfersOutValue = rows.reduce((s, r) => s + (r.tfOut * r.costPrice), 0);

  const kpis = [
    kpiCard('🚪', 'قيمة الرصيد الافتتاحي', formatCurrency(totalOpeningValue), 'indigo'),
    kpiCard('⬆️', 'تكلفة المبيعات', formatCurrency(totalSalesValue), 'warn'),
    kpiCard('🚚', 'تكلفة التحويلات الصادرة', formatCurrency(totalTransfersOutValue), 'orange'),
    kpiCard('🔒', 'قيمة الرصيد الختامي', formatCurrency(totalClosingValue), 'lime'),
  ].join('');

  const headers = [
    { key: 'productName',  label: 'اسم الصنف',         sortable: true },
    { key: 'sku',          label: 'الكود',            sortable: true },
    { key: 'openingQty',   label: 'الافتتاحي',         sortable: true },
    { key: 'pur',          label: 'مشتريات (+)',       sortable: true },
    { key: 'tfIn',         label: 'تحويل وارد (+)',    sortable: true },
    { key: 'retIn',        label: 'مرتجع (+)',         sortable: true },
    { key: 'sal',          label: 'مبيعات (-)',        sortable: true },
    { key: 'tfOut',        label: 'تحويل صادر (-)',    sortable: true },
    { key: 'adj',          label: 'تسويات (±)',        sortable: true },
    { key: 'closingQty',   label: 'الختامي الدفتري',    sortable: true },
    { key: 'currentQty',   label: 'الرصيد الفعلي',     sortable: true },
    { key: 'variance',     label: 'الانحراف',          sortable: true },
  ];

  const tableRows = rows.map(r => {
    let varianceHtml = `<span class="mono">0</span>`;
    if (r.variance > 0) {
      varianceHtml = `<span class="mono text-good font-bold">+${formatQuantity(r.variance)}</span>`;
    } else if (r.variance < 0) {
      varianceHtml = `<span class="mono text-bad font-bold">${formatQuantity(r.variance)}</span>`;
    }

    return {
      productName:  `<strong>${r.productName}</strong>`,
      sku:          `<span class="mono dim" style="font-size:11px;">${r.sku}</span>`,
      openingQty:   `<span class="mono">${formatQuantity(r.openingQty)}</span>`,
      pur:          `<span class="mono text-good">${r.pur > 0 ? '+' : ''}${formatQuantity(r.pur)}</span>`,
      tfIn:         `<span class="mono text-good">${r.tfIn > 0 ? '+' : ''}${formatQuantity(r.tfIn)}</span>`,
      retIn:        `<span class="mono text-good">${r.retIn > 0 ? '+' : ''}${formatQuantity(r.retIn)}</span>`,
      sal:          `<span class="mono text-bad">${r.sal > 0 ? '-' : ''}${formatQuantity(r.sal)}</span>`,
      tfOut:        `<span class="mono text-bad">${r.tfOut > 0 ? '-' : ''}${formatQuantity(r.tfOut)}</span>`,
      adj:          `<span class="mono">${r.adj > 0 ? '+' : ''}${formatQuantity(r.adj)}</span>`,
      closingQty:   `<span class="mono font-bold">${formatQuantity(r.closingQty)}</span>`,
      currentQty:   `<span class="mono font-bold text-indigo">${formatQuantity(r.currentQty)}</span>`,
      variance:     varianceHtml,
    };
  });

  const total = {
    productName: '<strong>الإجمالي</strong>', sku: '',
    openingQty: `<span class="mono font-bold">${formatQuantity(totalOpening)}</span>`,
    pur:        `<span class="mono font-bold">${formatQuantity(totalPur)}</span>`,
    tfIn:       `<span class="mono font-bold">${formatQuantity(totalTfIn)}</span>`,
    retIn:      `<span class="mono font-bold">${formatQuantity(totalRetIn)}</span>`,
    sal:        `<span class="mono font-bold">${formatQuantity(totalSal)}</span>`,
    tfOut:      `<span class="mono font-bold">${formatQuantity(totalTfOut)}</span>`,
    adj:        `<span class="mono font-bold">${formatQuantity(totalAdj)}</span>`,
    closingQty: `<span class="mono font-bold">${formatQuantity(totalClosing)}</span>`,
    currentQty: `<span class="mono font-bold text-indigo">${formatQuantity(totalCurrent)}</span>`,
    variance:   `<span class="mono font-bold ${totalVariance > 0 ? 'text-good' : (totalVariance < 0 ? 'text-bad' : '')}">${formatQuantity(totalVariance)}</span>`,
  };

  return reportWrap('تقرير كرت مطابقة حركات وأرصدة المستودعات التفصيلي', '🔄', kpis,
    buildSortableTable(headers, tableRows, total));
}
