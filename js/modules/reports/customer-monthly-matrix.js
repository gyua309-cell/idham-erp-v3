// ============================================================
// IDHAM ERP — Customer Monthly Sales & Collections Matrix
// مصفوفة ومقارنات مبيعات وتحصيلات العملاء الشهرية والمنحنى البياني التفاعلي
// ============================================================

import { COLS, getAll, query, where, orderBy, limit, getDocs } from "../../utils/db.js";
import { formatCurrency, formatPercent, formatDate, todayString, debounce } from "../../utils/formatters.js";
import { exportToExcel } from "../../utils/excel.js";
import { db, COMPANY_ID } from "../../firebase-config.js";

const MONTH_NAMES_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

let _customers = [];
let _salesReps = [];
let _invoices = [];
let _returns = [];
let _collections = [];
let _receipts = [];

let _selectedYear = new Date().getFullYear();
let _selectedRepId = "all";
let _selectedZone = "all";
let _selectedMetric = "both"; // "both", "sales", "collections", "net_sales"
let _searchQuery = "";
let _selectedCustomerId = null; // null = all / aggregate
let _chartInstance = null;
let _donutChartInstance = null;
let _matrixData = [];

export async function render(container, user) {
  _selectedYear = new Date().getFullYear();
  _selectedCustomerId = null;
  _searchQuery = "";

  container.innerHTML = `
    <!-- Top Filter Bar -->
    <div class="filterbar no-print" style="flex-wrap:wrap; gap:10px; align-items:flex-end; background:var(--bg-1); padding:14px 18px; border-radius:14px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); margin-bottom:16px;">
      
      <!-- Year Selector -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">📅 السنة المالية</label>
        <select id="cmm-year-select" onchange="window.onCmmYearChange(this.value)" style="min-width:110px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12.5px; font-weight:700;">
          <option value="2026" ${_selectedYear === 2026 ? "selected" : ""}>2026</option>
          <option value="2025" ${_selectedYear === 2025 ? "selected" : ""}>2025</option>
          <option value="2024" ${_selectedYear === 2024 ? "selected" : ""}>2024</option>
          <option value="2023" ${_selectedYear === 2023 ? "selected" : ""}>2023</option>
        </select>
      </div>

      <!-- Sales Rep Filter -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">👔 المندوب</label>
        <select id="cmm-rep-select" onchange="window.onCmmRepChange(this.value)" style="min-width:170px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px; font-weight:600;">
          <option value="all">كل المناديب (مجمع)</option>
        </select>
      </div>

      <!-- Zone Filter -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">📍 المنطقة / المسار</label>
        <select id="cmm-zone-select" onchange="window.onCmmZoneChange(this.value)" style="min-width:140px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px;">
          <option value="all">كل المناطق</option>
        </select>
      </div>

      <!-- Metric View Toggle -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">👁️ نمط العرض في الخلايا</label>
        <select id="cmm-metric-select" onchange="window.onCmmMetricChange(this.value)" style="min-width:210px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px; font-weight:700;">
          <option value="both" selected>المبيعات والتحصيلات معاً (سطرين)</option>
          <option value="sales">المبيعات فقط (Sales)</option>
          <option value="collections">التحصيلات فقط (Collections)</option>
          <option value="net_sales">صافي المبيعات (بعد خصم المردودات)</option>
        </select>
      </div>

      <!-- Search Input -->
      <div style="flex:1; min-width:200px; max-width:320px;">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">🔍 بحث فوري عن عميل</label>
        <input type="text" id="cmm-search-input" placeholder="اكتب اسم العميل أو الكود..." oninput="window.onCmmSearchInput(this.value)" style="width:100%; padding:6px 12px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px;" />
      </div>

      <!-- Export & Print Actions -->
      <div style="margin-right:auto; display:flex; gap:8px; align-items:center;">
        <button class="btn btn-secondary btn-sm" onclick="window.exportCmmExcel()" style="font-weight:700; display:inline-flex; align-items:center; gap:6px; border-radius:8px;">
          <span>📊</span> تصدير Excel
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.printCmmReport()" style="font-weight:700; display:inline-flex; align-items:center; gap:6px; border-radius:8px;">
          <span>🖨️</span> طباعة
        </button>
        <button class="btn btn-primary btn-sm" onclick="window.loadCmmData()" style="font-weight:700; display:inline-flex; align-items:center; gap:6px; border-radius:8px;">
          <span>🔄</span> تحديث
        </button>
      </div>
    </div>

    <!-- Page Content Container -->
    <div class="page-content" style="padding:0 4px;">
      
      <!-- Selected Focus Header Alert (When single customer is selected) -->
      <div id="cmm-focus-banner" class="card mb-16" style="display:none; padding:14px 20px; background:linear-gradient(135deg, rgba(99,102,241,0.15), rgba(16,185,129,0.1)); border:1.5px solid var(--brand); border-radius:14px; box-shadow:0 4px 16px rgba(0,0,0,0.06);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:28px;">👤</span>
            <div>
              <div style="font-size:17px; font-weight:900; color:var(--brand);" id="cmm-focus-name">اسم العميل</div>
              <div style="font-size:12px; color:var(--text-2); margin-top:2px;" id="cmm-focus-details">كود العميل | المندوب | رصيد كشف الحساب الفعلي</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <button class="btn btn-secondary btn-sm" id="cmm-focus-stmt-btn" onclick="window.openCmmCustomerStatement()" style="font-weight:700; font-size:12px;">📊 كشف الحساب التفصيلي للعميل</button>
            <button class="btn btn-primary btn-sm" onclick="window.resetCmmCustomerFocus()" style="background:#4F46E5; border-color:#4F46E5; font-weight:700; font-size:12px;">🔙 العودة للمنحنى الإجمالي (كل العملاء)</button>
          </div>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:16px;" id="cmm-kpi-cards">
        
        <div class="card" style="padding:14px 18px; background:linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02)); border:1px solid rgba(99,102,241,0.25); border-radius:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:700; color:var(--indigo);">💳 إجمالي مبيعات السنة (${_selectedYear})</span>
            <span style="font-size:18px;">📈</span>
          </div>
          <div class="mono font-bold" id="cmm-kpi-sales" style="font-size:20px; color:var(--indigo); margin-top:6px;">0.00 ر.س</div>
          <div style="font-size:11px; color:var(--text-2); margin-top:4px;" id="cmm-kpi-sales-avg">متوسط شهري: 0.00 ر.س</div>
        </div>

        <div class="card" style="padding:14px 18px; background:linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02)); border:1px solid rgba(16,185,129,0.25); border-radius:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:700; color:#10B981;">💵 إجمالي التحصيلات المقبوضة</span>
            <span style="font-size:18px;">📥</span>
          </div>
          <div class="mono font-bold" id="cmm-kpi-collections" style="font-size:20px; color:#10B981; margin-top:6px;">0.00 ر.س</div>
          <div style="font-size:11px; color:var(--text-2); margin-top:4px;" id="cmm-kpi-col-avg">متوسط شهري: 0.00 ر.س</div>
        </div>

        <div class="card" style="padding:14px 18px; background:linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02)); border:1px solid rgba(245,158,11,0.25); border-radius:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:700; color:#F59E0B;">🎯 نسبة كفاءة التحصيل والتغطية</span>
            <span style="font-size:18px;">⚖️</span>
          </div>
          <div class="mono font-bold" id="cmm-kpi-rate" style="font-size:20px; color:#F59E0B; margin-top:6px;">0.0%</div>
          <div style="font-size:11px; color:var(--text-2); margin-top:4px;" id="cmm-kpi-gap">فجوة التحصيل: 0.00 ر.س</div>
        </div>

        <div class="card" style="padding:14px 18px; background:linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.02)); border:1px solid rgba(139,92,246,0.25); border-radius:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:700; color:#8B5CF6;">👥 إجمالي الذمم والمديونيات الفعلية</span>
            <span style="font-size:18px;">🏢</span>
          </div>
          <div class="mono font-bold" id="cmm-kpi-total-balance" style="font-size:20px; color:#8B5CF6; margin-top:6px;">0.00 ر.س</div>
          <div style="font-size:11px; color:var(--text-2); margin-top:4px;" id="cmm-kpi-active-info">حسابات مطابقة لكشف الحسابات</div>
        </div>

      </div>

      <!-- Interactive Charts Container (Side by Side) -->
      <div style="display:grid; grid-template-columns: 2.2fr 1fr; gap:14px; margin-bottom:18px;" id="cmm-charts-grid">
        
        <!-- Main Line & Bar Trend Chart -->
        <div class="card" style="padding:18px 20px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft); display:flex; flex-direction:column; min-height:370px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
            <div>
              <h3 style="font-size:15px; font-weight:800; color:var(--text-0); margin:0; display:flex; align-items:center; gap:8px;">
                <span id="cmm-chart-title">📊 منحنى المبيعات والتحصيلات عبر أشهر السنة</span>
              </h3>
              <p style="font-size:11px; color:var(--text-2); margin:3px 0 0;" id="cmm-chart-subtitle">مقارنة بصرية ديناميكية بين مسحوبات المبيعات والتدفقات النقدية المحصلة</p>
            </div>
            <div style="display:flex; align-items:center; gap:14px; font-size:11.5px; font-weight:700;">
              <span style="display:inline-flex; align-items:center; gap:5px; color:#4F46E5;"><span style="width:12px; height:12px; border-radius:3px; background:#4F46E5; display:inline-block;"></span> 🧾 مبيعات</span>
              <span style="display:inline-flex; align-items:center; gap:5px; color:#10B981;"><span style="width:12px; height:12px; border-radius:3px; background:#10B981; display:inline-block;"></span> 📥 تحصيلات</span>
              <span style="display:inline-flex; align-items:center; gap:5px; color:#EF4444;"><span style="width:12px; height:12px; border-radius:3px; background:#EF4444; display:inline-block;"></span> ↩️ مردودات</span>
            </div>
          </div>
          <div style="flex:1; position:relative; min-height:280px; width:100%;">
            <canvas id="cmm-trend-canvas"></canvas>
          </div>
        </div>

        <!-- Secondary Performance Breakdown Donut Chart -->
        <div class="card" style="padding:18px 20px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft); display:flex; flex-direction:column; min-height:370px;">
          <div style="margin-bottom:12px;">
            <h3 style="font-size:15px; font-weight:800; color:var(--text-0); margin:0;">
              🥧 تحليل المساهمات والحصص
            </h3>
            <p style="font-size:11px; color:var(--text-2); margin:3px 0 0;" id="cmm-donut-subtitle">أعلى المساهمات الإجمالية</p>
          </div>
          <div style="flex:1; position:relative; min-height:220px; display:flex; align-items:center; justify-content:center;">
            <canvas id="cmm-donut-canvas"></canvas>
          </div>
          <div id="cmm-donut-legend" style="margin-top:10px; font-size:11px; color:var(--text-2); display:flex; flex-direction:column; gap:4px;"></div>
        </div>

      </div>

      <!-- Explanatory Guide & Key Legend Strip -->
      <div class="card mb-12" style="padding:10px 18px; background:linear-gradient(135deg, var(--bg-card), rgba(99,102,241,0.03)); border:1px solid var(--border-soft); border-radius:12px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; font-size:11.5px;">
        <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
          <span style="font-weight:800; color:var(--brand);">💡 دليل قراءة الخلايا:</span>
          <span style="display:inline-flex; align-items:center; gap:5px;"><b style="color:var(--text-0);">السطر العلوي:</b> 🧾 قيمة فواتير المبيعات الصادرة في الشهر</span>
          <span style="display:inline-flex; align-items:center; gap:5px;"><b style="color:#10B981;">السطر السفلي:</b> 📥 المبالغ المحصلة والمقبوضة فعلياً في الشهر</span>
          <span style="display:inline-flex; align-items:center; gap:5px;"><b style="color:var(--indigo);">⚖️ رصيد كشف الحساب:</b> ناتج (إجمالي المبيعات التاريخية - المردودات - إجمالي التحصيلات)</span>
        </div>
        <div style="font-weight:700; color:var(--text-2);" id="cmm-table-rows-count">
          عرض 0 عميل
        </div>
      </div>

      <!-- Customer Monthly Matrix Table -->
      <div class="card" style="border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft); overflow:hidden;">
        <div class="table-container" style="max-height:720px; overflow:auto;">
          <table class="data-dense" id="cmm-matrix-table" style="width:100%; border-collapse:collapse; min-width:1380px;">
            <thead style="position:sticky; top:0; z-index:10; background:var(--bg-1);">
              <tr>
                <th style="min-width:220px; position:sticky; right:0; z-index:11; background:var(--bg-1); box-shadow:-2px 0 6px rgba(0,0,0,0.06); padding:10px 12px;">
                  العميل / المندوب / المسار
                </th>
                <th style="min-width:125px; text-align:left; background:rgba(99,102,241,0.04);">
                  <div>⚖️ رصيد كشف الحساب</div>
                  <div style="font-size:9.5px; font-weight:normal; color:var(--text-2);">(الصافي الفعلي التراكمي)</div>
                </th>
                ${MONTH_NAMES_AR.map(m => `<th style="min-width:100px; text-align:center;">${m}</th>`).join("")}
                <th style="min-width:115px; text-align:left; background:rgba(99,102,241,0.08); color:var(--indigo);">مبيعات ${_selectedYear}</th>
                <th style="min-width:115px; text-align:left; background:rgba(16,185,129,0.08); color:#10B981;">تحصيلات ${_selectedYear}</th>
                <th style="width:85px; text-align:center;">التغطية %</th>
                <th style="width:95px; text-align:center;">الاتجاه</th>
                <th style="width:80px; text-align:center;" class="no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody id="cmm-tbody">
              <tr>
                <td colspan="19" style="text-align:center; padding:50px; color:var(--text-2);">
                  <div class="loading-spinner" style="margin-bottom:8px;"></div>
                  <div>جاري تجميع مصفوفة الشهور والتحليلات البيعية وحساب الأرصدة الفعلية...</div>
                </td>
              </tr>
            </tbody>
            <tfoot id="cmm-tfoot" style="position:sticky; bottom:0; z-index:10; background:var(--bg-2); font-weight:900; border-top:2px solid var(--border);">
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  `;

  await setupGlobalCmmHandlers();
  await loadCmmData();
}

// ─────────────────────────────────────────────────────────────────────────────
// Setup Global Handlers
// ─────────────────────────────────────────────────────────────────────────────
async function setupGlobalCmmHandlers() {
  window.onCmmYearChange = (yr) => {
    _selectedYear = parseInt(yr, 10);
    _selectedCustomerId = null;
    processAndRenderMatrix();
  };

  window.onCmmRepChange = (repId) => {
    _selectedRepId = repId;
    processAndRenderMatrix();
  };

  window.onCmmZoneChange = (zone) => {
    _selectedZone = zone;
    processAndRenderMatrix();
  };

  window.onCmmMetricChange = (metric) => {
    _selectedMetric = metric;
    renderMatrixTable();
  };

  window.onCmmSearchInput = debounce((query) => {
    _searchQuery = (query || "").trim().toLowerCase();
    renderMatrixTable();
  }, 200);

  window.focusCmmCustomer = (custId) => {
    _selectedCustomerId = custId;
    updateFocusBanner();
    renderTrendChart();
    renderDonutChart();
    renderMatrixTable();
  };

  window.resetCmmCustomerFocus = () => {
    _selectedCustomerId = null;
    updateFocusBanner();
    renderTrendChart();
    renderDonutChart();
    renderMatrixTable();
  };

  window.openCmmCustomerStatement = () => {
    if (!_selectedCustomerId) return;
    if (typeof window.navigate === "function") {
      window._preselectedStatementEntity = { type: "customer", id: _selectedCustomerId };
      window.navigate("report-customer-statement");
    }
  };

  window.exportCmmExcel = () => {
    if (!_matrixData.length) return;
    const rows = [];
    const headers = [
      "كود العميل", "اسم العميل", "المنطقة", "المندوب", "رصيد كشف الحساب الفعلي",
      ...MONTH_NAMES_AR,
      `إجمالي مبيعات ${_selectedYear}`, `إجمالي تحصيلات ${_selectedYear}`, "نسبة التحصيل %", "اتجاه النمو"
    ];

    _matrixData.forEach(row => {
      const r = [
        row.customer.code || "",
        row.customer.name || "",
        row.customer.zone || "",
        row.customer.repName || "",
        row.actualStatementBalance,
        ...row.monthlySales.map(m => m.sales),
        row.totalSales,
        row.totalCollections,
        row.collectionRate.toFixed(1) + "%",
        row.trendLabel
      ];
      rows.push(r);
    });

    window.exportXLSX({
      filename: `مصفوفة_مبيعات_العملاء_${_selectedYear}_${todayString()}`,
      headers,
      rows,
      sheetName: `مبيعات_${_selectedYear}`
    });
  };

  window.printCmmReport = () => {
    window.print();
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Load Raw Data from Firestore
// ─────────────────────────────────────────────────────────────────────────────
window.loadCmmData = async function loadCmmData() {
  const tbody = document.getElementById("cmm-tbody");
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="19" style="text-align:center; padding:50px; color:var(--text-2);"><div class="loading-spinner" style="margin-bottom:8px;"></div><div>جاري جلب البيانات وحساب الأرصدة من كشوف الحسابات...</div></td></tr>`;
  }

  try {
    const [custSnap, repSnap, invSnap, retSnap, colSnap, rcptSnap] = await Promise.all([
      getAll(COLS.customers(), [orderBy("name")]).catch(() => []),
      getAll(COLS.salesReps(), [orderBy("name")]).catch(() => []),
      getAll(COLS.salesInvoices()).catch(() => []),
      getAll(COLS.salesReturns()).catch(() => []),
      getAll(COLS.collections()).catch(() => []),
      getAll(COLS.receipts()).catch(() => [])
    ]);

    _customers = custSnap || [];
    _salesReps = repSnap || [];
    _invoices = (invSnap || []).filter(i => i.status !== "cancelled");
    _returns = (retSnap || []).filter(r => r.status !== "cancelled" && r.status !== "void");
    _collections = (colSnap || []);
    _receipts = (rcptSnap || []).filter(r => r.status !== "cancelled" && (!r.entityType || r.entityType === "customer"));

    populateFilters();
    processAndRenderMatrix();
  } catch (err) {
    console.error("[CustomerMatrix] Data load error:", err);
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="19" style="text-align:center; color:var(--bad); padding:30px;">فشل تحميل البيانات: ${err.message}</td></tr>`;
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Populate Filter Select Elements
// ─────────────────────────────────────────────────────────────────────────────
function populateFilters() {
  const repSelect = document.getElementById("cmm-rep-select");
  if (repSelect) {
    const prev = repSelect.value;
    repSelect.innerHTML = `<option value="all">كل المناديب (مجمع)</option>` +
      _salesReps.map(r => `<option value="${r.id}">${r.name}</option>`).join("");
    if (prev) repSelect.value = prev;
  }

  const zoneSelect = document.getElementById("cmm-zone-select");
  if (zoneSelect) {
    const zones = new Set();
    _customers.forEach(c => { if (c.zone && c.zone.trim()) zones.add(c.zone.trim()); });
    const sortedZones = Array.from(zones).sort();
    zoneSelect.innerHTML = `<option value="all">كل المناطق</option>` +
      sortedZones.map(z => `<option value="${z}">${z}</option>`).join("");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Processing: Build Pivot Matrix & Exact Statement Balance
// ─────────────────────────────────────────────────────────────────────────────
function processAndRenderMatrix() {
  const yrStr = String(_selectedYear);

  // Filter Customers based on Rep & Zone
  let filteredCusts = _customers.filter(c => {
    if (_selectedRepId !== "all" && c.repId !== _selectedRepId) {
      const repObj = _salesReps.find(r => r.id === _selectedRepId);
      if (!repObj || c.repName !== repObj.name) return false;
    }
    if (_selectedZone !== "all" && c.zone !== _selectedZone) return false;
    return true;
  });

  // Build matrix records for each customer
  _matrixData = filteredCusts.map(cust => {
    const monthlySales = Array(12).fill(0).map(() => ({ sales: 0, returns: 0, netSales: 0, collections: 0 }));

    let allTimeSales = 0;
    let allTimeReturns = 0;
    let allTimeCollections = 0;
    let allTimeReceipts = 0;
    let allTimeAutoPaid = 0;

    const custNorm = (cust.name || "").trim().toLowerCase();

    // 1. Invoices (Selected Year + All Time)
    _invoices.forEach(inv => {
      const isMatch = (inv.customerId === cust.id) || (inv.customerName && inv.customerName.trim().toLowerCase() === custNorm);
      if (!isMatch) return;

      const totalVal = parseFloat(inv.totalWithVat || inv.total || 0);
      allTimeSales += totalVal;

      const dStr = inv.date || (inv.createdAt?.toDate ? inv.createdAt.toDate().toISOString().split("T")[0] : "");
      if (dStr.startsWith(yrStr)) {
        const mIdx = parseInt(dStr.slice(5, 7), 10) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          monthlySales[mIdx].sales += totalVal;
        }
      }

      // Check auto payments
      if (inv.paidAmount > 0) {
        const hasMatchingVoucher = _receipts.some(r => {
          const rDate = r.date || (r.createdAt?.toDate ? r.createdAt.toDate().toISOString().split("T")[0] : "");
          return rDate === dStr && (r.targetId === cust.id || (r.customerName && r.customerName.trim().toLowerCase() === custNorm)) && Math.abs((r.amount || 0) - inv.paidAmount) < 0.01;
        }) || _collections.some(c => {
          const cDate = c.date || (c.createdAt?.toDate ? c.createdAt.toDate().toISOString().split("T")[0] : "");
          return cDate === dStr && (c.customerId === cust.id || (c.customerName && c.customerName.trim().toLowerCase() === custNorm)) && Math.abs((c.amount || 0) - inv.paidAmount) < 0.01;
        });

        if (!hasMatchingVoucher) {
          allTimeAutoPaid += parseFloat(inv.paidAmount || 0);
        }
      }
    });

    // 2. Returns (Selected Year + All Time)
    _returns.forEach(ret => {
      const isMatch = (ret.customerId === cust.id) || (ret.customerName && ret.customerName.trim().toLowerCase() === custNorm);
      if (!isMatch) return;

      const retVal = parseFloat(ret.totalWithVat !== undefined ? ret.totalWithVat : (ret.total || 0));
      allTimeReturns += retVal;

      const dStr = ret.date || (ret.createdAt?.toDate ? ret.createdAt.toDate().toISOString().split("T")[0] : "");
      if (dStr.startsWith(yrStr)) {
        const mIdx = parseInt(dStr.slice(5, 7), 10) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          monthlySales[mIdx].returns += retVal;
        }
      }
    });

    // 3. Representative Collections
    _collections.forEach(col => {
      const isMatch = (col.customerId === cust.id) || (col.customerName && col.customerName.trim().toLowerCase() === custNorm);
      if (!isMatch) return;

      const colAmt = parseFloat(col.amount || 0);
      allTimeCollections += colAmt;

      const dStr = col.date || (col.createdAt?.toDate ? col.createdAt.toDate().toISOString().split("T")[0] : "");
      if (dStr.startsWith(yrStr)) {
        const mIdx = parseInt(dStr.slice(5, 7), 10) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          monthlySales[mIdx].collections += colAmt;
        }
      }
    });

    // 4. Admin ERP Receipts
    _receipts.forEach(rcpt => {
      const isMatch = (rcpt.targetId === cust.id) || (rcpt.customerId === cust.id) || (rcpt.customerName && rcpt.customerName.trim().toLowerCase() === custNorm);
      if (!isMatch) return;

      const rcptAmt = parseFloat(rcpt.amount || 0);
      allTimeReceipts += rcptAmt;

      const dStr = rcpt.date || (rcpt.createdAt?.toDate ? rcpt.createdAt.toDate().toISOString().split("T")[0] : "");
      if (dStr.startsWith(yrStr)) {
        const mIdx = parseInt(dStr.slice(5, 7), 10) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          monthlySales[mIdx].collections += rcptAmt;
        }
      }
    });

    // Compute Exact Statement Balance dynamically from transactions
    const openBal = parseFloat(cust.openingBalance || 0);
    const actualStatementBalance = Math.round((openBal + allTimeSales - allTimeReturns - allTimeCollections - allTimeReceipts - allTimeAutoPaid) * 100) / 100;

    // Compute Net Sales per month
    monthlySales.forEach(m => {
      m.netSales = Math.max(0, m.sales - m.returns);
    });

    const totalSales = monthlySales.reduce((sum, m) => sum + m.sales, 0);
    const totalReturns = monthlySales.reduce((sum, m) => sum + m.returns, 0);
    const totalNetSales = monthlySales.reduce((sum, m) => sum + m.netSales, 0);
    const totalCollections = monthlySales.reduce((sum, m) => sum + m.collections, 0);
    const collectionRate = totalSales > 0 ? (totalCollections / totalSales) * 100 : (totalCollections > 0 ? 100 : 0);

    // Calculate growth trajectory
    const h1Sales = monthlySales.slice(0, 6).reduce((s, m) => s + m.sales, 0);
    const h2Sales = monthlySales.slice(6, 12).reduce((s, m) => s + m.sales, 0);
    let trendLabel = "🟢 مستقر";
    let trendClass = "good";

    if (totalSales > 0) {
      if (h2Sales > h1Sales * 1.15) {
        trendLabel = "📈 صاعد";
        trendClass = "indigo";
      } else if (h2Sales < h1Sales * 0.7 && h1Sales > 0) {
        trendLabel = "📉 متراجع";
        trendClass = "bad";
      }
    } else {
      trendLabel = "⚪ غير نشط";
      trendClass = "neutral";
    }

    return {
      customer: cust,
      monthlySales,
      totalSales,
      totalReturns,
      totalNetSales,
      totalCollections,
      collectionRate,
      trendLabel,
      trendClass,
      actualStatementBalance
    };
  });

  // Sort by Total Sales Descending
  _matrixData.sort((a, b) => b.totalSales - a.totalSales);

  updateKPICards();
  updateFocusBanner();
  renderTrendChart();
  renderDonutChart();
  renderMatrixTable();
}

// ─────────────────────────────────────────────────────────────────────────────
// Update KPI Summary Metrics
// ─────────────────────────────────────────────────────────────────────────────
function updateKPICards() {
  const targetData = _selectedCustomerId
    ? _matrixData.filter(d => d.customer.id === _selectedCustomerId)
    : _matrixData;

  const totalSales = targetData.reduce((sum, d) => sum + d.totalSales, 0);
  const totalCollections = targetData.reduce((sum, d) => sum + d.totalCollections, 0);
  const totalGap = totalSales - totalCollections;
  const colRate = totalSales > 0 ? (totalCollections / totalSales) * 100 : (totalCollections > 0 ? 100 : 0);
  const totalActualBalances = targetData.reduce((sum, d) => sum + d.actualStatementBalance, 0);

  document.getElementById("cmm-kpi-sales").textContent = formatCurrency(totalSales);
  document.getElementById("cmm-kpi-sales-avg").textContent = `متوسط شهري: ${formatCurrency(totalSales / 12)}`;

  document.getElementById("cmm-kpi-collections").textContent = formatCurrency(totalCollections);
  document.getElementById("cmm-kpi-col-avg").textContent = `متوسط شهري: ${formatCurrency(totalCollections / 12)}`;

  const rateEl = document.getElementById("cmm-kpi-rate");
  rateEl.textContent = `${colRate.toFixed(1)}%`;
  rateEl.style.color = colRate >= 90 ? "#10B981" : colRate >= 70 ? "#F59E0B" : "#EF4444";

  document.getElementById("cmm-kpi-gap").textContent = `فجوة التحصيل: ${formatCurrency(totalGap)}`;

  const balEl = document.getElementById("cmm-kpi-total-balance");
  balEl.textContent = formatCurrency(totalActualBalances);
  balEl.style.color = totalActualBalances > 0 ? "#EF4444" : totalActualBalances < 0 ? "#10B981" : "#8B5CF6";
}

// ─────────────────────────────────────────────────────────────────────────────
// Update Focus Banner
// ─────────────────────────────────────────────────────────────────────────────
function updateFocusBanner() {
  const banner = document.getElementById("cmm-focus-banner");
  if (!banner) return;

  if (_selectedCustomerId) {
    const item = _matrixData.find(d => d.customer.id === _selectedCustomerId);
    if (item) {
      const c = item.customer;
      document.getElementById("cmm-focus-name").textContent = `${c.name}`;
      document.getElementById("cmm-focus-details").textContent = `كود: ${c.code || "—"} | المندوب: ${c.repName || "—"} | المنطقة: ${c.zone || "—"} | رصيد كشف الحساب الفعلي الصافي: ${formatCurrency(item.actualStatementBalance)}`;
      banner.style.display = "block";
      document.getElementById("cmm-chart-title").textContent = `👤 منحنى أداء العميل: ${c.name} (${_selectedYear})`;
      document.getElementById("cmm-chart-subtitle").textContent = `تحليل تفصيلي لمشتريات وتحصيلات العميل على مدار أشهر السنة`;
      return;
    }
  }

  banner.style.display = "none";
  document.getElementById("cmm-chart-title").textContent = `📊 منحنى المبيعات والتحصيلات المجمعة لسنة ${_selectedYear}`;
  document.getElementById("cmm-chart-subtitle").textContent = `مقارنة بصرية ديناميكية بين مسحوبات المبيعات والتدفقات النقدية المحصلة`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Render Interactive Chart.js Main Trend Chart
// ─────────────────────────────────────────────────────────────────────────────
function renderTrendChart() {
  const canvas = document.getElementById("cmm-trend-canvas");
  if (!canvas || typeof Chart === "undefined") return;

  // Aggregate monthly values
  const monthlySalesTotals = Array(12).fill(0);
  const monthlyCollectionsTotals = Array(12).fill(0);
  const monthlyReturnsTotals = Array(12).fill(0);

  const targetData = _selectedCustomerId
    ? _matrixData.filter(d => d.customer.id === _selectedCustomerId)
    : _matrixData;

  targetData.forEach(row => {
    row.monthlySales.forEach((m, idx) => {
      monthlySalesTotals[idx] += m.sales;
      monthlyCollectionsTotals[idx] += m.collections;
      monthlyReturnsTotals[idx] += m.returns;
    });
  });

  if (_chartInstance) {
    _chartInstance.destroy();
  }

  const ctx = canvas.getContext("2d");

  // Create Gradients
  const salesGrad = ctx.createLinearGradient(0, 0, 0, 320);
  salesGrad.addColorStop(0, "rgba(79, 70, 229, 0.40)");
  salesGrad.addColorStop(1, "rgba(79, 70, 229, 0.0)");

  const colGrad = ctx.createLinearGradient(0, 0, 0, 320);
  colGrad.addColorStop(0, "rgba(16, 185, 129, 0.30)");
  colGrad.addColorStop(1, "rgba(16, 185, 129, 0.0)");

  _chartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels: MONTH_NAMES_AR,
      datasets: [
        {
          label: "المبيعات (ر.س)",
          data: monthlySalesTotals,
          borderColor: "#4F46E5",
          backgroundColor: salesGrad,
          borderWidth: 3.5,
          tension: 0.38,
          pointRadius: 5.5,
          pointHoverRadius: 9,
          pointBackgroundColor: "#4F46E5",
          pointBorderColor: "#FFFFFF",
          pointBorderWidth: 2.5,
          fill: true
        },
        {
          label: "التحصيلات (ر.س)",
          data: monthlyCollectionsTotals,
          borderColor: "#10B981",
          backgroundColor: colGrad,
          borderWidth: 3.5,
          borderDash: [6, 4],
          tension: 0.38,
          pointRadius: 5.5,
          pointHoverRadius: 9,
          pointBackgroundColor: "#10B981",
          pointBorderColor: "#FFFFFF",
          pointBorderWidth: 2.5,
          fill: true
        },
        {
          label: "المردودات (ر.س)",
          data: monthlyReturnsTotals,
          borderColor: "#EF4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderWidth: 2,
          borderDash: [2, 2],
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "#EF4444",
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          titleFont: { family: "IBM Plex Sans Arabic", size: 13, weight: "bold" },
          bodyFont: { family: "IBM Plex Mono", size: 12.5 },
          padding: 14,
          cornerRadius: 10,
          borderColor: "rgba(255, 255, 255, 0.12)",
          borderWidth: 1,
          callbacks: {
            label: function (context) {
              const val = context.raw || 0;
              return `  ${context.dataset.label}: ${formatCurrency(val)}`;
            },
            afterBody: function (context) {
              const sVal = context[0]?.raw || 0;
              const cVal = context[1]?.raw || 0;
              const gap = sVal - cVal;
              return `  ⚖️ فجوة الشهر: ${formatCurrency(gap)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: "rgba(150, 150, 150, 0.08)" },
          ticks: { font: { family: "IBM Plex Sans Arabic", size: 11.5, weight: "600" }, color: "var(--text-2)" }
        },
        y: {
          grid: { color: "rgba(150, 150, 150, 0.08)" },
          ticks: {
            font: { family: "IBM Plex Mono", size: 11 },
            color: "var(--text-2)",
            callback: (v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
          }
        }
      }
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Render Donut Breakdown Chart
// ─────────────────────────────────────────────────────────────────────────────
function renderDonutChart() {
  const canvas = document.getElementById("cmm-donut-canvas");
  if (!canvas || typeof Chart === "undefined") return;

  if (_donutChartInstance) {
    _donutChartInstance.destroy();
  }

  const legendEl = document.getElementById("cmm-donut-legend");
  const subTitleEl = document.getElementById("cmm-donut-subtitle");

  let labels = [];
  let dataVals = [];
  const colors = ["#4F46E5", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#06B6D4", "#64748B"];

  if (_selectedCustomerId) {
    const item = _matrixData.find(d => d.customer.id === _selectedCustomerId);
    if (item) {
      if (subTitleEl) subTitleEl.textContent = `هيكل حساب ${item.customer.name}`;
      labels = ["صافي المبيعات", "التحصيلات", "المردودات"];
      dataVals = [item.totalNetSales, item.totalCollections, item.totalReturns];
    }
  } else {
    if (subTitleEl) subTitleEl.textContent = `أعلى 5 مساهمات في مبيعات ${_selectedYear}`;
    const top5 = _matrixData.slice(0, 5);
    labels = top5.map(d => d.customer.name);
    dataVals = top5.map(d => d.totalSales);

    const otherSum = _matrixData.slice(5).reduce((s, d) => s + d.totalSales, 0);
    if (otherSum > 0) {
      labels.push("باقي العملاء");
      dataVals.push(otherSum);
    }
  }

  const totalSum = dataVals.reduce((s, v) => s + v, 0);

  _donutChartInstance = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: dataVals,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: "var(--bg-card)"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.raw || 0;
              const pct = totalSum > 0 ? ((val / totalSum) * 100).toFixed(1) : "0";
              return ` ${ctx.label}: ${formatCurrency(val)} (${pct}%)`;
            }
          }
        }
      }
    }
  });

  if (legendEl) {
    legendEl.innerHTML = labels.map((lbl, i) => {
      const val = dataVals[i] || 0;
      const pct = totalSum > 0 ? ((val / totalSum) * 100).toFixed(1) : "0";
      return `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="display:inline-flex; align-items:center; gap:6px;">
            <span style="width:8px; height:8px; border-radius:50%; background:${colors[i]}; display:inline-block;"></span>
            <span style="max-width:130px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${lbl}</span>
          </span>
          <span class="mono font-bold" style="font-size:11px;">${pct}%</span>
        </div>
      `;
    }).join("");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Render Monthly Matrix Table
// ─────────────────────────────────────────────────────────────────────────────
function renderMatrixTable() {
  const tbody = document.getElementById("cmm-tbody");
  const tfoot = document.getElementById("cmm-tfoot");
  if (!tbody) return;

  let displayList = _matrixData;

  // Search Filter
  if (_searchQuery) {
    displayList = displayList.filter(d =>
      (d.customer.name || "").toLowerCase().includes(_searchQuery) ||
      (d.customer.code || "").toLowerCase().includes(_searchQuery) ||
      (d.customer.phone || "").includes(_searchQuery) ||
      (d.customer.repName || "").toLowerCase().includes(_searchQuery)
    );
  }

  document.getElementById("cmm-table-rows-count").textContent = `عرض ${displayList.length} من أصل ${_matrixData.length} عميل`;

  if (!displayList.length) {
    tbody.innerHTML = `<tr><td colspan="19" style="text-align:center; padding:40px; color:var(--text-2);">لا توجد سجلات تطابق الفلتر والبحث الحالي</td></tr>`;
    if (tfoot) tfoot.innerHTML = "";
    return;
  }

  // Find max sales cell value for heatmap calculation
  let maxCellVal = 1;
  displayList.forEach(row => {
    row.monthlySales.forEach(m => {
      const val = _selectedMetric === "collections" ? m.collections
        : _selectedMetric === "net_sales" ? m.netSales
        : m.sales;
      if (val > maxCellVal) maxCellVal = val;
    });
  });

  // Render Rows
  tbody.innerHTML = displayList.map(row => {
    const c = row.customer;
    const isSelected = _selectedCustomerId === c.id;

    // Monthly cell values
    const monthCellsHTML = row.monthlySales.map(m => {
      const val = _selectedMetric === "collections" ? m.collections
        : _selectedMetric === "net_sales" ? m.netSales
        : m.sales;

      const intensity = val > 0 ? Math.min(0.28, Math.max(0.04, (val / maxCellVal) * 0.35)) : 0;
      const bgStyle = val > 0 ? `background: rgba(79, 70, 229, ${intensity});` : "";

      if (_selectedMetric === "both") {
        return `
          <td style="${bgStyle} text-align:center; padding:6px 6px; border-left:1px solid var(--border-soft); font-size:11px;">
            ${m.sales > 0 ? `
              <div style="display:flex; justify-content:space-between; align-items:center; gap:2px;">
                <span style="font-size:9.5px; color:var(--text-2);">🧾</span>
                <span class="mono font-bold" style="color:var(--text-0);">${formatCurrency(m.sales)}</span>
              </div>
            ` : `<div style="color:var(--text-3); font-size:10px;">—</div>`}
            ${m.collections > 0 ? `
              <div style="display:flex; justify-content:space-between; align-items:center; gap:2px; margin-top:2px;">
                <span style="font-size:9.5px; color:#10B981;">📥</span>
                <span class="mono font-bold" style="color:#10B981;">${formatCurrency(m.collections)}</span>
              </div>
            ` : ""}
          </td>
        `;
      }

      return `
        <td style="${bgStyle} text-align:center; padding:8px 4px; border-left:1px solid var(--border-soft);">
          <span class="mono ${val > 0 ? 'font-bold' : 'dim'}" style="font-size:11.5px; color:${val > 0 ? 'var(--text-0)' : 'var(--text-3)'};">
            ${val > 0 ? formatCurrency(val) : "—"}
          </span>
        </td>
      `;
    }).join("");

    const bal = row.actualStatementBalance;
    const isDebtor = bal > 0;
    const isCreditor = bal < 0;

    return `
      <tr onclick="window.focusCmmCustomer('${c.id}')"
          style="cursor:pointer; transition:background 0.15s; ${isSelected ? 'background:rgba(99,102,241,0.14) !important; outline:2px solid var(--brand);' : ''}"
          class="cmm-row ${isSelected ? 'active' : ''}">
        
        <!-- Sticky Customer Column -->
        <td style="position:sticky; right:0; z-index:5; background:${isSelected ? 'var(--bg-card)' : 'var(--bg-card)'}; box-shadow:-2px 0 6px rgba(0,0,0,0.06); padding:8px 12px;">
          <div style="font-weight:800; font-size:12.5px; color:${isSelected ? 'var(--brand)' : 'var(--text-0)'};">${c.name}</div>
          <div style="font-size:10.5px; color:var(--text-2); margin-top:2px; display:flex; gap:6px; align-items:center;">
            <span>${c.code ? `[${c.code}]` : ""}</span>
            <span>👔 ${c.repName || "—"}</span>
            <span>📍 ${c.zone || "—"}</span>
          </div>
        </td>

        <!-- Exact Statement Balance (Calculated Dynamically) -->
        <td style="text-align:left; font-size:11.5px; background:rgba(99,102,241,0.03);">
          <span class="mono font-bold" style="color:${isDebtor ? 'var(--bad)' : isCreditor ? '#10B981' : 'var(--text-2)'}; font-size:12px;">
            ${isDebtor ? formatCurrency(bal) : isCreditor ? `(${formatCurrency(Math.abs(bal))}) دائن` : "0.00"}
          </span>
        </td>

        <!-- 12 Month Cells -->
        ${monthCellsHTML}

        <!-- Total Sales of Year -->
        <td class="mono font-bold" style="text-align:left; color:var(--indigo); background:rgba(99,102,241,0.04); font-size:12px;">
          ${formatCurrency(row.totalSales)}
        </td>

        <!-- Total Collections of Year -->
        <td class="mono font-bold" style="text-align:left; color:#10B981; background:rgba(16,185,129,0.04); font-size:12px;">
          ${formatCurrency(row.totalCollections)}
        </td>

        <!-- Collection Coverage Rate % -->
        <td style="text-align:center;">
          <span class="badge ${row.collectionRate >= 95 ? 'good' : row.collectionRate >= 70 ? 'warn' : 'bad'}" style="font-size:10px; font-weight:800; padding:2px 6px;">
            ${row.collectionRate.toFixed(0)}%
          </span>
        </td>

        <!-- Growth Trend -->
        <td style="text-align:center;">
          <span class="badge ${row.trendClass}" style="font-size:10.5px; font-weight:700;">
            ${row.trendLabel}
          </span>
        </td>

        <!-- Actions -->
        <td style="text-align:center;" class="no-print" onclick="event.stopPropagation();">
          <button class="btn btn-icon sm btn-ghost" title="كشف الحساب التفصيلي" onclick="window.focusCmmCustomer('${c.id}'); window.openCmmCustomerStatement();">
            📊
          </button>
        </td>

      </tr>
    `;
  }).join("");

  // Render Table Foot Totals
  if (tfoot) {
    const colMonthTotals = Array(12).fill(0);
    const colMonthCollections = Array(12).fill(0);

    displayList.forEach(row => {
      row.monthlySales.forEach((m, idx) => {
        colMonthTotals[idx] += (_selectedMetric === "collections" ? m.collections : _selectedMetric === "net_sales" ? m.netSales : m.sales);
        colMonthCollections[idx] += m.collections;
      });
    });

    const grandTotalSales = displayList.reduce((s, r) => s + r.totalSales, 0);
    const grandTotalCol = displayList.reduce((s, r) => s + r.totalCollections, 0);
    const grandRate = grandTotalSales > 0 ? (grandTotalCol / grandTotalSales) * 100 : 0;
    const grandBalance = displayList.reduce((s, r) => s + r.actualStatementBalance, 0);

    tfoot.innerHTML = `
      <tr>
        <td style="position:sticky; right:0; z-index:11; background:var(--bg-2); padding:10px 12px; font-size:12px; color:var(--text-0);">
          الإجمالي العام (${displayList.length} عميل)
        </td>
        <td class="mono font-bold" style="text-align:left; font-size:12px; color:${grandBalance > 0 ? 'var(--bad)' : 'var(--text-0)'};">
          ${formatCurrency(grandBalance)}
        </td>
        ${colMonthTotals.map(val => `
          <td class="mono font-bold" style="text-align:center; font-size:11.5px; color:var(--text-0); padding:8px 4px;">
            ${val > 0 ? formatCurrency(val) : "0.00"}
          </td>
        `).join("")}
        <td class="mono font-bold" style="text-align:left; color:var(--indigo); font-size:12.5px;">
          ${formatCurrency(grandTotalSales)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:#10B981; font-size:12.5px;">
          ${formatCurrency(grandTotalCol)}
        </td>
        <td style="text-align:center; font-size:11.5px; color:var(--text-0);">
          ${grandRate.toFixed(0)}%
        </td>
        <td colspan="2"></td>
      </tr>
    `;
  }
}
