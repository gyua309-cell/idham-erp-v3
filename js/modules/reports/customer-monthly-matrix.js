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
let _taxMode = "with_vat"; // "with_vat" (شامل الضريبة), "no_vat" (قبل الضريبة)
let _searchQuery = "";
let _activeSortKey = "total_sales_desc"; // e.g. "total_sales_desc", "month_8_sales_desc", etc.
let _selectedCustomerId = null; // null = all / aggregate
let _chartInstance = null;
let _donutChartInstance = null;
let _matrixData = [];

export async function render(container, user) {
  _selectedYear = new Date().getFullYear();
  _selectedCustomerId = null;
  _searchQuery = "";
  _taxMode = "with_vat";
  _activeSortKey = "total_sales_desc";

  container.innerHTML = `
    <!-- Top Filter Bar -->
    <div class="filterbar no-print" style="flex-wrap:wrap; gap:10px; align-items:flex-end; background:var(--bg-1); padding:14px 18px; border-radius:14px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); margin-bottom:16px;">
      
      <!-- Year Selector -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">📅 السنة المالية</label>
        <select id="cmm-year-select" onchange="window.onCmmYearChange(this.value)" style="min-width:105px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12.5px; font-weight:700;">
          <option value="2026" ${_selectedYear === 2026 ? "selected" : ""}>2026</option>
          <option value="2025" ${_selectedYear === 2025 ? "selected" : ""}>2025</option>
          <option value="2024" ${_selectedYear === 2024 ? "selected" : ""}>2024</option>
          <option value="2023" ${_selectedYear === 2023 ? "selected" : ""}>2023</option>
        </select>
      </div>

      <!-- Tax Mode Filter -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">🏛️ المعاملة الضريبية بالمصفوفة</label>
        <select id="cmm-tax-mode" onchange="window.onCmmTaxModeChange(this.value)" style="min-width:175px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px; font-weight:700;">
          <option value="with_vat" ${_taxMode === "with_vat" ? "selected" : ""}>شامل الضريبة (بعد الضريبة 15%)</option>
          <option value="no_vat" ${_taxMode === "no_vat" ? "selected" : ""}>قبل الضريبة (بدون الضريبة)</option>
        </select>
      </div>

      <!-- Sales Rep Filter -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">👔 المندوب</label>
        <select id="cmm-rep-select" onchange="window.onCmmRepChange(this.value)" style="min-width:165px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px; font-weight:600;">
          <option value="all">كل المناديب (مجمع)</option>
        </select>
      </div>

      <!-- Zone Filter -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">📍 المنطقة / المسار</label>
        <select id="cmm-zone-select" onchange="window.onCmmZoneChange(this.value)" style="min-width:130px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px;">
          <option value="all">كل المناطق</option>
        </select>
      </div>

      <!-- Metric View Toggle -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">👁️ نمط العرض في الخلايا</label>
        <select id="cmm-metric-select" onchange="window.onCmmMetricChange(this.value)" style="min-width:190px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px; font-weight:700;">
          <option value="both" selected>المبيعات والتحصيلات معاً</option>
          <option value="sales">المبيعات فقط (Sales)</option>
          <option value="collections">التحصيلات فقط (Collections)</option>
          <option value="net_sales">صافي المبيعات (بعد المردودات)</option>
        </select>
      </div>

      <!-- Sort Filter Dropdown -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">⚡ ترتيب الجدول والمصفوفة</label>
        <select id="cmm-sort-select" onchange="window.onCmmSortChange(this.value)" style="min-width:210px; padding:6px 10px; border:1px solid var(--brand); border-radius:8px; background:var(--bg-card); color:var(--brand); font-size:12px; font-weight:700;">
          <optgroup label="ترتيب سنوي عام">
            <option value="total_sales_desc" selected>الأعلى صافي مبيعات في السنة كلها 🏆</option>
            <option value="total_sales_asc">الأقل صافي مبيعات في السنة كلها 📉</option>
            <option value="total_col_desc">الأعلى تحصيلاً في السنة كلها 💵</option>
            <option value="total_col_asc">الأقل تحصيلاً في السنة كلها ⚠️</option>
            <option value="balance_desc">الأعلى مديونية (رصيد كشف الحساب) ⚠️</option>
            <option value="name_asc">أبجدياً (اسم العميل أ - ي)</option>
          </optgroup>
          <optgroup label="ترتيب حسب أعلى صافي مبيعات شهر معين">
            ${MONTH_NAMES_AR.map((m, idx) => `<option value="month_${idx}_sales_desc">الأعلى صافي مبيعات شهر ${m} 🛒</option>`).join("")}
          </optgroup>
          <optgroup label="ترتيب حسب أعلى تحصيلات شهر معين">
            ${MONTH_NAMES_AR.map((m, idx) => `<option value="month_${idx}_col_desc">الأعلى تحصيلاً شهر ${m} 📥</option>`).join("")}
          </optgroup>
          <optgroup label="ترتيب حسب الأقل صافي مبيعات أو تحصيلاً">
            ${MONTH_NAMES_AR.map((m, idx) => `<option value="month_${idx}_sales_asc">الأقل صافي مبيعات شهر ${m} 📉</option>`).join("")}
            ${MONTH_NAMES_AR.map((m, idx) => `<option value="month_${idx}_col_asc">الأقل تحصيلاً شهر ${m} ⚠️</option>`).join("")}
          </optgroup>
        </select>
      </div>

      <!-- Search Input -->
      <div style="flex:1; min-width:180px; max-width:280px;">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">🔍 بحث فوري</label>
        <input type="text" id="cmm-search-input" placeholder="اسم العميل أو الكود..." oninput="window.onCmmSearchInput(this.value)" style="width:100%; padding:6px 12px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px;" />
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
            <span style="font-size:11.5px; font-weight:700; color:var(--indigo);">✨ صافي مبيعات السنة (${_selectedYear})</span>
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
              <p style="font-size:11px; color:var(--text-2); margin:3px 0 0;" id="cmm-chart-subtitle">مقارنة بصرية ديناميكية بين صافي مسحوبات المبيعات والتدفقات النقدية المحصلة</p>
            </div>
            <div style="display:flex; align-items:center; gap:14px; font-size:11.5px; font-weight:700;">
              <span style="display:inline-flex; align-items:center; gap:5px; color:#4F46E5;"><span style="width:12px; height:12px; border-radius:3px; background:#4F46E5; display:inline-block;"></span> ✨ صافي المبيعات</span>
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

      <!-- Explanatory Guide & Key Legend Strip with Current Active Sort Badge -->
      <div class="card mb-12" style="padding:10px 18px; background:linear-gradient(135deg, var(--bg-card), rgba(99,102,241,0.03)); border:1px solid var(--border-soft); border-radius:12px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; font-size:11.5px;">
        <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
          <span style="font-weight:800; color:var(--brand);">💡 دليل قراءة الخلايا:</span>
          <span style="display:inline-flex; align-items:center; gap:5px;"><b style="color:var(--text-0);">السطر العلوي:</b> ✨ صافي مبيعات الشهر (المبيعات − المردودات)</span>
          <span style="display:inline-flex; align-items:center; gap:5px;"><b style="color:#10B981;">السطر السفلي:</b> 📥 المبالغ المحصلة والمقبوضة فعلياً في الشهر</span>
          <span style="display:inline-flex; align-items:center; gap:5px;"><b style="color:var(--indigo);">⚖️ رصيد كشف الحساب:</b> ناتج (الرصيد الافتتاحي + إجمالي المبيعات − المردودات − إجمالي التحصيلات)</span>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <!-- View Switcher -->
          <div style="display:inline-flex; background:var(--bg-1); padding:2px; border-radius:8px; border:1px solid var(--border-soft);">
            <button class="btn btn-sm btn-ghost" id="cmm-view-both-btn" onclick="window.setCmmView('both')" style="padding:4px 10px; font-size:11px; font-weight:700; border-radius:6px; background:var(--brand); color:#fff;">
              📊 العرض المتكامل
            </button>
            <button class="btn btn-sm btn-ghost" id="cmm-view-matrix-btn" onclick="window.setCmmView('matrix')" style="padding:4px 10px; font-size:11px; font-weight:700; border-radius:6px; color:var(--text-2);">
              📑 مصفوفة العملاء
            </button>
            <button class="btn btn-sm btn-ghost" id="cmm-view-months-btn" onclick="window.setCmmView('months')" style="padding:4px 10px; font-size:11px; font-weight:700; border-radius:6px; color:var(--text-2);">
              📅 جدول تحليل الأشهر
            </button>
          </div>
          <span class="badge" id="cmm-active-sort-badge" style="background:rgba(99,102,241,0.12); color:var(--brand); font-weight:800; font-size:11px; padding:4px 10px; border:1px solid rgba(99,102,241,0.25);">
            ⚡ الترتيب الحالي: الأعلى صافي مبيعات
          </span>
          <div style="font-weight:700; color:var(--text-2);" id="cmm-table-rows-count">
            عرض 0 عميل
          </div>
        </div>
      </div>

      <!-- Dedicated Monthly Analysis Breakdown Table Card (جدول تحليل الأشهر ومؤشرات الأداء) -->
      <div id="cmm-months-table-card" class="card mb-16" style="border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft); overflow:hidden;">
        <div style="padding:12px 18px; background:linear-gradient(90deg, rgba(99,102,241,0.06), rgba(16,185,129,0.06)); border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">📅</span>
            <div>
              <h3 style="margin:0; font-size:14px; font-weight:800; color:var(--text-0);">جدول التحليل المالي للأشهر (${_selectedYear})</h3>
              <p style="margin:2px 0 0; font-size:11px; color:var(--text-2);">توزيع أداء المبيعات (قبل وبعد الضريبة 15%) والمردودات وصافي التدفقات والتحصيلات وأفضل العملاء شهراً بشهر</p>
            </div>
          </div>
          <div style="font-size:11.5px; font-weight:700; color:var(--brand);">
            💡 انقر على زر "فرز المصفوفة" لأي شهر لترتيب جدول العملاء مباشرة حسب ذلك الشهر
          </div>
        </div>
        <div class="table-container" style="overflow:auto;">
          <table class="data-dense" id="cmm-monthly-breakdown-table" style="width:100%; border-collapse:collapse; min-width:1300px;">
            <thead style="background:var(--bg-1);">
              <tr>
                <th style="width:110px; text-align:right; padding:10px 12px; font-weight:800;">📅 عمود الشهر</th>
                <th style="min-width:115px; text-align:left; color:var(--text-1);">🧾 قبل الضريبة</th>
                <th style="min-width:100px; text-align:left; color:var(--brand);">🏛️ الضريبة 15%</th>
                <th style="min-width:115px; text-align:left; color:var(--indigo);">💳 مبيعات (شامل الضريبة)</th>
                <th style="min-width:105px; text-align:left; color:var(--bad);">↩️ المردودات</th>
                <th style="min-width:115px; text-align:left; color:var(--text-0);">✨ صافي المبيعات</th>
                <th style="min-width:115px; text-align:left; color:#10B981;">📥 التحصيلات</th>
                <th style="min-width:110px; text-align:left; color:var(--text-1);">⚖️ فجوة الشهر</th>
                <th style="width:90px; text-align:center;">🎯 نسبة التحصيل</th>
                <th style="width:85px; text-align:center;">📊 حصة السنة</th>
                <th style="width:80px; text-align:center;">👥 عملاء</th>
                <th style="min-width:150px; text-align:right;">🥇 أعلى عميل مبيعات</th>
                <th style="min-width:150px; text-align:right;">💵 أعلى عميل تحصيلاً</th>
                <th style="width:105px; text-align:center;" class="no-print">⚡ فرز المصفوفة</th>
              </tr>
            </thead>
            <tbody id="cmm-monthly-breakdown-tbody">
              <!-- Rendered Dynamically -->
            </tbody>
            <tfoot id="cmm-monthly-breakdown-tfoot" style="background:var(--bg-2); font-weight:900; border-top:2px solid var(--border);">
              <!-- Rendered Dynamically -->
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Customer Monthly Matrix Table (مصفوفة العملاء في صفوف والأشهر في أعمدة) -->
      <div id="cmm-matrix-table-card" class="card" style="border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft); overflow:hidden;">
        <div class="table-container" style="max-height:720px; overflow:auto;">
          <table class="data-dense" id="cmm-matrix-table" style="width:100%; border-collapse:collapse; min-width:1450px;">
            <thead style="position:sticky; top:0; z-index:10; background:var(--bg-1);">
              <!-- Top Tier: Explicit Group Header Categorization -->
              <tr style="border-bottom:1px solid var(--border-soft);">
                <th colspan="2" style="position:sticky; right:0; z-index:12; background:var(--bg-1); text-align:center; padding:7px 10px; font-size:12px; font-weight:800; color:var(--text-1); border-left:1px solid var(--border);">
                  🏢 بيانات العملاء والرصيد
                </th>
                <th colspan="12" style="text-align:center; padding:7px 10px; font-size:12.5px; font-weight:900; color:var(--brand); background:linear-gradient(90deg, rgba(99,102,241,0.08), rgba(16,185,129,0.08)); border-left:1px solid var(--border);">
                  📅 عمود الأشهر (${_selectedYear}) — صافي المبيعات والتحصيلات
                </th>
                <th colspan="5" style="text-align:center; padding:7px 10px; font-size:12px; font-weight:800; color:var(--text-1); background:var(--bg-1);">
                  📊 الإجماليات ومؤشرات الأداء السنوية
                </th>
              </tr>

              <!-- Second Tier: Detailed Columns -->
              <tr>
                <th style="min-width:220px; position:sticky; right:0; z-index:11; background:var(--bg-1); box-shadow:-2px 0 6px rgba(0,0,0,0.06); padding:10px 12px; cursor:pointer;" onclick="window.toggleCmmHeaderSort('name')">
                  <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span>العميل / المندوب / المسار</span>
                    <span style="font-size:10px; color:var(--text-2);">⇅</span>
                  </div>
                </th>

                <th style="min-width:125px; text-align:left; background:rgba(99,102,241,0.04); cursor:pointer;" onclick="window.toggleCmmHeaderSort('balance')">
                  <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span>⚖️ رصيد كشف الحساب</span>
                    <span style="font-size:10px; color:var(--text-2);">⇅</span>
                  </div>
                  <div style="font-size:9.5px; font-weight:normal; color:var(--text-2);">(الصافي الفعلي التراكمي)</div>
                </th>

                ${MONTH_NAMES_AR.map((m, idx) => `
                  <th style="min-width:105px; text-align:center; padding:8px 4px; user-select:none;" id="th-month-${idx}">
                    <div style="display:flex; flex-direction:column; align-items:center; gap:3px;">
                      <span style="font-size:11.5px; font-weight:800; color:var(--text-0);">${idx + 1} - ${m}</span>
                      <div style="display:flex; gap:3px; align-items:center;">
                        <button class="btn btn-ghost btn-icon sm" title="ترتيب حسب صافي مبيعات ${m}" onclick="window.setMonthQuickSort(${idx}, 'sales')" style="padding:2px 4px; font-size:9px; height:18px; border-radius:4px; background:rgba(99,102,241,0.08); color:var(--brand);">
                          🛒 مبيعات
                        </button>
                        <button class="btn btn-ghost btn-icon sm" title="ترتيب حسب تحصيلات ${m}" onclick="window.setMonthQuickSort(${idx}, 'col')" style="padding:2px 4px; font-size:9px; height:18px; border-radius:4px; background:rgba(16,185,129,0.08); color:#10B981;">
                          📥 تحصيل
                        </button>
                      </div>
                    </div>
                  </th>
                `).join("")}

                <th style="min-width:120px; text-align:left; background:rgba(99,102,241,0.08); color:var(--indigo); cursor:pointer;" onclick="window.toggleCmmHeaderSort('total_sales')">
                  <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span id="cmm-th-total-sales-label">✨ صافي مبيعات ${_selectedYear}</span>
                    <span style="font-size:10px;">⇅</span>
                  </div>
                </th>

                <th style="min-width:115px; text-align:left; background:rgba(16,185,129,0.08); color:#10B981; cursor:pointer;" onclick="window.toggleCmmHeaderSort('total_col')">
                  <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span>تحصيلات ${_selectedYear}</span>
                    <span style="font-size:10px;">⇅</span>
                  </div>
                </th>

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

  window.onCmmTaxModeChange = (mode) => {
    _taxMode = mode;
    applySorting();
    updateKPICards();
    renderTrendChart();
    renderDonutChart();
    renderMonthlyBreakdownTable();
    renderMatrixTable();
  };

  window.onCmmMetricChange = (metric) => {
    _selectedMetric = metric;
    renderMatrixTable();
  };

  window.onCmmSortChange = (sortKey) => {
    _activeSortKey = sortKey;
    applySorting();
    renderMatrixTable();
  };

  window.setMonthQuickSort = (mIdx, type) => {
    const currentKey = _activeSortKey;
    const descKey = `month_${mIdx}_${type}_desc`;
    const ascKey = `month_${mIdx}_${type}_asc`;

    // Toggle between desc and asc if clicking same
    if (currentKey === descKey) {
      _activeSortKey = ascKey;
    } else {
      _activeSortKey = descKey;
    }

    const sortSelect = document.getElementById("cmm-sort-select");
    if (sortSelect) sortSelect.value = _activeSortKey;

    applySorting();
    renderMatrixTable();
  };

  window.toggleCmmHeaderSort = (field) => {
    if (field === "total_sales") {
      _activeSortKey = _activeSortKey === "total_sales_desc" ? "total_sales_asc" : "total_sales_desc";
    } else if (field === "total_col") {
      _activeSortKey = _activeSortKey === "total_col_desc" ? "total_col_asc" : "total_col_desc";
    } else if (field === "balance") {
      _activeSortKey = _activeSortKey === "balance_desc" ? "balance_asc" : "balance_desc";
    } else if (field === "name") {
      _activeSortKey = _activeSortKey === "name_asc" ? "name_desc" : "name_asc";
    }

    const sortSelect = document.getElementById("cmm-sort-select");
    if (sortSelect) sortSelect.value = _activeSortKey;

    applySorting();
    renderMatrixTable();
  };

  window.setCmmView = (view) => {
    const monthsCard = document.getElementById("cmm-months-table-card");
    const matrixCard = document.getElementById("cmm-matrix-table-card");
    const bothBtn = document.getElementById("cmm-view-both-btn");
    const matrixBtn = document.getElementById("cmm-view-matrix-btn");
    const monthsBtn = document.getElementById("cmm-view-months-btn");

    [bothBtn, matrixBtn, monthsBtn].forEach(b => {
      if (b) {
        b.style.background = "transparent";
        b.style.color = "var(--text-2)";
      }
    });

    if (view === "both") {
      if (monthsCard) monthsCard.style.display = "block";
      if (matrixCard) matrixCard.style.display = "block";
      if (bothBtn) {
        bothBtn.style.background = "var(--brand)";
        bothBtn.style.color = "#fff";
      }
    } else if (view === "matrix") {
      if (monthsCard) monthsCard.style.display = "none";
      if (matrixCard) matrixCard.style.display = "block";
      if (matrixBtn) {
        matrixBtn.style.background = "var(--brand)";
        matrixBtn.style.color = "#fff";
      }
    } else if (view === "months") {
      if (monthsCard) monthsCard.style.display = "block";
      if (matrixCard) matrixCard.style.display = "none";
      if (monthsBtn) {
        monthsBtn.style.background = "var(--brand)";
        monthsBtn.style.color = "#fff";
      }
    }
  };

  window.scrollCmmToMatrix = () => {
    const matrixCard = document.getElementById("cmm-matrix-table-card");
    if (matrixCard) {
      if (matrixCard.style.display === "none") {
        window.setCmmView("both");
      }
      matrixCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
    renderMonthlyBreakdownTable();
    renderMatrixTable();
  };

  window.resetCmmCustomerFocus = () => {
    _selectedCustomerId = null;
    updateFocusBanner();
    renderTrendChart();
    renderDonutChart();
    renderMonthlyBreakdownTable();
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
    const isNoVat = _taxMode === "no_vat";
    const rows = [];
    const headers = [
      "كود العميل", "اسم العميل", "المنطقة", "المندوب", "رصيد كشف الحساب الفعلي",
      ...MONTH_NAMES_AR.map(m => `صافي ${m}`),
      `إجمالي المبيعات ${_selectedYear}`, `إجمالي المردودات ${_selectedYear}`, `صافي المبيعات ${_selectedYear}`, `إجمالي التحصيلات ${_selectedYear}`, "فجوة التحصيل", "نسبة التحصيل %", "اتجاه النمو"
    ];

    _matrixData.forEach(row => {
      const grossSales = isNoVat ? row.totalSalesSubtotal : row.totalSales;
      const returns = isNoVat ? row.totalReturnsSubtotal : row.totalReturns;
      const netSales = isNoVat ? row.totalNetSalesSubtotal : row.totalNetSales;
      const gap = netSales - row.totalCollections;

      const r = [
        row.customer.code || "",
        row.customer.name || "",
        row.customer.zone || "",
        row.customer.repName || "",
        row.actualStatementBalance,
        ...row.monthlySales.map(m => (isNoVat ? m.netSalesSubtotal : m.netSales)),
        grossSales,
        returns,
        netSales,
        row.totalCollections,
        gap,
        row.collectionRate.toFixed(1) + "%",
        row.trendLabel
      ];
      rows.push(r);
    });

    window.exportXLSX({
      filename: `مصفوفة_صافي_مبيعات_العملاء_${_selectedYear}_${todayString()}`,
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
// Apply Sorting to Matrix Data
// ─────────────────────────────────────────────────────────────────────────────
function applySorting() {
  const key = _activeSortKey || "total_sales_desc";
  const badgeEl = document.getElementById("cmm-active-sort-badge");

  // Reset highlight styling on month headers
  MONTH_NAMES_AR.forEach((_, idx) => {
    const th = document.getElementById(`th-month-${idx}`);
    if (th) {
      th.style.background = "";
      th.style.boxShadow = "";
    }
  });

  const getNetSales = (row) => _taxMode === "no_vat" ? row.totalNetSalesSubtotal : row.totalNetSales;

  if (key === "total_sales_desc") {
    _matrixData.sort((a, b) => getNetSales(b) - getNetSales(a));
    if (badgeEl) badgeEl.textContent = `⚡ الترتيب الحالي: الأعلى صافي مبيعات في السنة كلها 🏆`;
  } else if (key === "total_sales_asc") {
    _matrixData.sort((a, b) => getNetSales(a) - getNetSales(b));
    if (badgeEl) badgeEl.textContent = `⚡ الترتيب الحالي: الأقل صافي مبيعات في السنة كلها 📉`;
  } else if (key === "total_col_desc") {
    _matrixData.sort((a, b) => b.totalCollections - a.totalCollections);
    if (badgeEl) badgeEl.textContent = `⚡ الترتيب الحالي: الأعلى تحصيلاً في السنة كلها 💵`;
  } else if (key === "total_col_asc") {
    _matrixData.sort((a, b) => a.totalCollections - b.totalCollections);
    if (badgeEl) badgeEl.textContent = `⚡ الترتيب الحالي: الأقل تحصيلاً في السنة كلها ⚠️`;
  } else if (key === "balance_desc") {
    _matrixData.sort((a, b) => b.actualStatementBalance - a.actualStatementBalance);
    if (badgeEl) badgeEl.textContent = `⚡ الترتيب الحالي: الأعلى مديونية (رصيد كشف الحساب) ⚠️`;
  } else if (key === "balance_asc") {
    _matrixData.sort((a, b) => a.actualStatementBalance - b.actualStatementBalance);
    if (badgeEl) badgeEl.textContent = `⚡ الترتيب الحالي: الأقل مديونية / دائن 🟢`;
  } else if (key === "name_asc") {
    _matrixData.sort((a, b) => (a.customer.name || "").localeCompare(b.customer.name || "", "ar"));
    if (badgeEl) badgeEl.textContent = `⚡ الترتيب الحالي: أبجدياً (أ - ي)`;
  } else if (key === "name_desc") {
    _matrixData.sort((a, b) => (b.customer.name || "").localeCompare(a.customer.name || "", "ar"));
    if (badgeEl) badgeEl.textContent = `⚡ الترتيب الحالي: أبجدياً (ي - أ)`;
  } else if (key.startsWith("month_")) {
    const parts = key.split("_");
    const mIdx = parseInt(parts[1], 10);
    const type = parts[2]; // "sales" or "col"
    const dir = parts[3]; // "desc" or "asc"
    const mName = MONTH_NAMES_AR[mIdx] || "";

    const th = document.getElementById(`th-month-${mIdx}`);
    if (th) {
      th.style.background = type === "sales" ? "rgba(99,102,241,0.16)" : "rgba(16,185,129,0.16)";
      th.style.boxShadow = "inset 0 0 0 1.5px var(--brand)";
    }

    _matrixData.sort((a, b) => {
      const aVal = type === "sales"
        ? (_taxMode === "no_vat" ? a.monthlySales[mIdx].netSalesSubtotal : a.monthlySales[mIdx].netSales)
        : a.monthlySales[mIdx].collections;
      const bVal = type === "sales"
        ? (_taxMode === "no_vat" ? b.monthlySales[mIdx].netSalesSubtotal : b.monthlySales[mIdx].netSales)
        : b.monthlySales[mIdx].collections;
      return dir === "desc" ? (bVal - aVal) : (aVal - bVal);
    });

    if (badgeEl) {
      badgeEl.textContent = `⚡ الترتيب الحالي: ${dir === 'desc' ? 'الأعلى' : 'الأقل'} ${type === 'sales' ? 'صافي مبيعات' : 'تحصيلاً'} لشهر (${mName}) ${dir === 'desc' ? '▾' : '▴'}`;
    }
  }
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
    const monthlySales = Array(12).fill(0).map(() => ({
      sales: 0,
      salesSubtotal: 0,
      salesVat: 0,
      returns: 0,
      returnsSubtotal: 0,
      returnsVat: 0,
      netSales: 0,
      netSalesSubtotal: 0,
      netSalesVat: 0,
      collections: 0
    }));

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

      const totalVal = parseFloat(inv.totalWithVat !== undefined ? inv.totalWithVat : (inv.total || inv.grandTotal || 0));
      const subtotalVal = parseFloat(inv.subtotal !== undefined ? inv.subtotal : (totalVal - (parseFloat(inv.taxTotal || inv.vatAmount || 0))));
      const vatVal = parseFloat(inv.taxTotal !== undefined ? inv.taxTotal : (inv.vatAmount !== undefined ? inv.vatAmount : (totalVal - subtotalVal)));

      allTimeSales += totalVal;

      const dStr = inv.date || (inv.createdAt?.toDate ? inv.createdAt.toDate().toISOString().split("T")[0] : "");
      if (dStr.startsWith(yrStr)) {
        const mIdx = parseInt(dStr.slice(5, 7), 10) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          monthlySales[mIdx].sales += totalVal;
          monthlySales[mIdx].salesSubtotal += subtotalVal;
          monthlySales[mIdx].salesVat += vatVal;
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

      const retTotalVal = parseFloat(ret.totalWithVat !== undefined ? ret.totalWithVat : (ret.totalAmount || ret.grandTotal || ret.total || 0));
      const retSubtotalVal = parseFloat(ret.subtotal !== undefined ? ret.subtotal : (retTotalVal - (parseFloat(ret.taxTotal || ret.vatAmount || 0))));
      const retVatVal = parseFloat(ret.taxTotal !== undefined ? ret.taxTotal : (ret.vatAmount !== undefined ? ret.vatAmount : (retTotalVal - retSubtotalVal)));

      allTimeReturns += retTotalVal;

      const dStr = ret.date || ret.returnDate || (ret.createdAt?.toDate ? ret.createdAt.toDate().toISOString().split("T")[0] : "");
      if (dStr.startsWith(yrStr)) {
        const mIdx = parseInt(dStr.slice(5, 7), 10) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          monthlySales[mIdx].returns += retTotalVal;
          monthlySales[mIdx].returnsSubtotal += retSubtotalVal;
          monthlySales[mIdx].returnsVat += retVatVal;
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

    // Compute Net Sales per month (exact difference)
    monthlySales.forEach(m => {
      m.netSales = m.sales - m.returns;
      m.netSalesSubtotal = m.salesSubtotal - m.returnsSubtotal;
      m.netSalesVat = m.salesVat - m.returnsVat;
    });

    const totalSales = monthlySales.reduce((sum, m) => sum + m.sales, 0);
    const totalSalesSubtotal = monthlySales.reduce((sum, m) => sum + m.salesSubtotal, 0);
    const totalSalesVat = monthlySales.reduce((sum, m) => sum + m.salesVat, 0);

    const totalReturns = monthlySales.reduce((sum, m) => sum + m.returns, 0);
    const totalReturnsSubtotal = monthlySales.reduce((sum, m) => sum + m.returnsSubtotal, 0);
    const totalReturnsVat = monthlySales.reduce((sum, m) => sum + m.returnsVat, 0);

    const totalNetSales = totalSales - totalReturns;
    const totalNetSalesSubtotal = totalSalesSubtotal - totalReturnsSubtotal;

    const totalCollections = monthlySales.reduce((sum, m) => sum + m.collections, 0);
    const collectionRate = totalNetSales > 0 ? (totalCollections / totalNetSales) * 100 : (totalSales > 0 ? (totalCollections / totalSales) * 100 : (totalCollections > 0 ? 100 : 0));

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
      totalSalesSubtotal,
      totalSalesVat,
      totalReturns,
      totalReturnsSubtotal,
      totalReturnsVat,
      totalNetSales,
      totalNetSalesSubtotal,
      totalCollections,
      collectionRate,
      trendLabel,
      trendClass,
      actualStatementBalance
    };
  });

  applySorting();
  updateKPICards();
  updateFocusBanner();
  renderTrendChart();
  renderDonutChart();
  renderMonthlyBreakdownTable();
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
  const totalSubtotal = targetData.reduce((sum, d) => sum + d.totalSalesSubtotal, 0);
  const totalVat = targetData.reduce((sum, d) => sum + d.totalSalesVat, 0);
  const totalReturns = targetData.reduce((sum, d) => sum + d.totalReturns, 0);
  const totalReturnsSubtotal = targetData.reduce((sum, d) => sum + d.totalReturnsSubtotal, 0);
  const totalNetSales = targetData.reduce((sum, d) => sum + d.totalNetSales, 0);
  const totalNetSalesSubtotal = targetData.reduce((sum, d) => sum + d.totalNetSalesSubtotal, 0);
  const totalCollections = targetData.reduce((sum, d) => sum + d.totalCollections, 0);
  const totalGap = totalNetSales - totalCollections;
  const colRate = totalNetSales > 0 ? (totalCollections / totalNetSales) * 100 : (totalSales > 0 ? (totalCollections / totalSales) * 100 : 0);
  const totalActualBalances = targetData.reduce((sum, d) => sum + d.actualStatementBalance, 0);

  const displayNetSales = _taxMode === "no_vat" ? totalNetSalesSubtotal : totalNetSales;
  const displayGrossSales = _taxMode === "no_vat" ? totalSubtotal : totalSales;
  const displayReturns = _taxMode === "no_vat" ? totalReturnsSubtotal : totalReturns;

  document.getElementById("cmm-kpi-sales").textContent = formatCurrency(displayNetSales);
  document.getElementById("cmm-kpi-sales-avg").textContent = _taxMode === "no_vat"
    ? `فواتير: ${formatCurrency(displayGrossSales)} | مردودات: ${formatCurrency(displayReturns)}`
    : `فواتير: ${formatCurrency(displayGrossSales)} | مردودات: ${formatCurrency(displayReturns)} (الضريبة: ${formatCurrency(totalVat)})`;

  document.getElementById("cmm-kpi-collections").textContent = formatCurrency(totalCollections);
  document.getElementById("cmm-kpi-col-avg").textContent = `متوسط شهري: ${formatCurrency(totalCollections / 12)}`;

  const rateEl = document.getElementById("cmm-kpi-rate");
  rateEl.textContent = `${colRate.toFixed(1)}%`;
  rateEl.style.color = colRate >= 90 ? "#10B981" : colRate >= 70 ? "#F59E0B" : "#EF4444";

  document.getElementById("cmm-kpi-gap").textContent = `فجوة التحصيل: ${formatCurrency(totalGap)} (صافي المستحق - المقبوض)`;

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
  document.getElementById("cmm-chart-subtitle").textContent = `مقارنة بصرية ديناميكية بين صافي مسحوبات المبيعات والتدفقات النقدية المحصلة`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Render Interactive Chart.js Main Trend Chart
// ─────────────────────────────────────────────────────────────────────────────
function renderTrendChart() {
  const canvas = document.getElementById("cmm-trend-canvas");
  if (!canvas || typeof Chart === "undefined") return;

  // Aggregate monthly values
  const monthlyNetSalesTotals = Array(12).fill(0);
  const monthlyCollectionsTotals = Array(12).fill(0);
  const monthlyReturnsTotals = Array(12).fill(0);

  const targetData = _selectedCustomerId
    ? _matrixData.filter(d => d.customer.id === _selectedCustomerId)
    : _matrixData;

  targetData.forEach(row => {
    row.monthlySales.forEach((m, idx) => {
      const netVal = _taxMode === "no_vat" ? m.netSalesSubtotal : m.netSales;
      const retVal = _taxMode === "no_vat" ? m.returnsSubtotal : m.returns;
      monthlyNetSalesTotals[idx] += netVal;
      monthlyCollectionsTotals[idx] += m.collections;
      monthlyReturnsTotals[idx] += retVal;
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
          label: "صافي المبيعات (المبيعات − المردودات)",
          data: monthlyNetSalesTotals,
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
          label: "التحصيلات المقبوضة",
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
          label: "المردودات المسترجعة",
          data: monthlyReturnsTotals,
          borderColor: "#EF4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderWidth: 2,
          borderDash: [3, 3],
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
              const netVal = context[0]?.raw || 0;
              const colVal = context[1]?.raw || 0;
              const gap = netVal - colVal;
              return `  ⚖️ فجوة التحصيل (صافي − مقبوض): ${formatCurrency(gap)}`;
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
      dataVals = [
        _taxMode === "no_vat" ? item.totalNetSalesSubtotal : item.totalNetSales,
        item.totalCollections,
        _taxMode === "no_vat" ? item.totalReturnsSubtotal : item.totalReturns
      ];
    }
  } else {
    if (subTitleEl) subTitleEl.textContent = `أعلى 5 مساهمات في صافي مبيعات ${_selectedYear}`;
    const top5 = _matrixData.slice(0, 5);
    labels = top5.map(d => d.customer.name);
    dataVals = top5.map(d => (_taxMode === "no_vat" ? d.totalNetSalesSubtotal : d.totalNetSales));

    const otherSum = _matrixData.slice(5).reduce((s, d) => s + (_taxMode === "no_vat" ? d.totalNetSalesSubtotal : d.totalNetSales), 0);
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

  const thSalesLabel = document.getElementById("cmm-th-total-sales-label");
  if (thSalesLabel) {
    thSalesLabel.textContent = _taxMode === "no_vat" ? `✨ صافي مبيعات ${_selectedYear} (قبل الضريبة)` : `✨ صافي مبيعات ${_selectedYear} (شامل الضريبة)`;
  }

  if (!displayList.length) {
    tbody.innerHTML = `<tr><td colspan="19" style="text-align:center; padding:40px; color:var(--text-2);">لا توجد سجلات تطابق الفلتر والبحث الحالي</td></tr>`;
    if (tfoot) tfoot.innerHTML = "";
    return;
  }

  // Find max cell value for heatmap calculation based on net sales
  let maxCellVal = 1;
  displayList.forEach(row => {
    row.monthlySales.forEach(m => {
      const salesVal = _taxMode === "no_vat" ? m.salesSubtotal : m.sales;
      const netVal = _taxMode === "no_vat" ? m.netSalesSubtotal : m.netSales;
      const val = _selectedMetric === "collections" ? m.collections
        : _selectedMetric === "sales" ? salesVal
        : netVal;
      if (val > maxCellVal) maxCellVal = val;
    });
  });

  // Render Rows
  tbody.innerHTML = displayList.map((row, rowIdx) => {
    const c = row.customer;
    const isSelected = _selectedCustomerId === c.id;

    // Monthly cell values
    const monthCellsHTML = row.monthlySales.map((m, mIdx) => {
      const salesVal = _taxMode === "no_vat" ? m.salesSubtotal : m.sales;
      const returnsVal = _taxMode === "no_vat" ? m.returnsSubtotal : m.returns;
      const netVal = _taxMode === "no_vat" ? m.netSalesSubtotal : m.netSales;
      const val = _selectedMetric === "collections" ? m.collections
        : _selectedMetric === "sales" ? salesVal
        : netVal;

      const isMonthSorted = _activeSortKey.startsWith(`month_${mIdx}_`);
      const intensity = val > 0 ? Math.min(0.28, Math.max(0.04, (val / maxCellVal) * 0.35)) : 0;
      let bgStyle = val > 0 ? `background: rgba(79, 70, 229, ${intensity});` : "";
      if (isMonthSorted) {
        bgStyle = val > 0 ? `background: rgba(99, 102, 241, ${Math.max(0.12, intensity + 0.08)});` : "background: rgba(99, 102, 241, 0.03);";
      }

      if (_selectedMetric === "both") {
        return `
          <td style="${bgStyle} text-align:center; padding:6px 6px; border-left:1px solid var(--border-soft); font-size:11px;">
            ${(salesVal > 0 || returnsVal > 0) ? `
              <div style="display:flex; justify-content:space-between; align-items:center; gap:2px;">
                <span style="font-size:9.5px; color:var(--text-2);" title="صافي المبيعات بعد خصم المردودات">✨</span>
                <span class="mono font-bold" style="color:${netVal < 0 ? 'var(--bad)' : 'var(--text-0)'};">${formatCurrency(netVal)}</span>
              </div>
              ${returnsVal > 0 ? `
                <div style="font-size:8.5px; color:var(--bad); text-align:left; line-height:1; margin-top:1px;" title="مردودات مخصومة: ${formatCurrency(returnsVal)}">
                  ↩️ -${formatCurrency(returnsVal)}
                </div>
              ` : ""}
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
            ${val !== 0 ? formatCurrency(val) : "—"}
          </span>
        </td>
      `;
    }).join("");

    const bal = row.actualStatementBalance;
    const isDebtor = bal > 0;
    const isCreditor = bal < 0;
    const rowDisplayNetSales = _taxMode === "no_vat" ? row.totalNetSalesSubtotal : row.totalNetSales;
    const rowDisplayReturns = _taxMode === "no_vat" ? row.totalReturnsSubtotal : row.totalReturns;

    return `
      <tr onclick="window.focusCmmCustomer('${c.id}')"
          style="cursor:pointer; transition:background 0.15s; ${isSelected ? 'background:rgba(99,102,241,0.14) !important; outline:2px solid var(--brand);' : ''}"
          class="cmm-row ${isSelected ? 'active' : ''}">
        
        <!-- Sticky Customer Column -->
        <td style="position:sticky; right:0; z-index:5; background:${isSelected ? 'var(--bg-card)' : 'var(--bg-card)'}; box-shadow:-2px 0 6px rgba(0,0,0,0.06); padding:8px 12px;">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <div style="font-weight:800; font-size:12.5px; color:${isSelected ? 'var(--brand)' : 'var(--text-0)'};">${c.name}</div>
            ${rowIdx < 3 && _activeSortKey.includes("desc") ? `<span style="font-size:13px;">${rowIdx === 0 ? '🥇' : rowIdx === 1 ? '🥈' : '🥉'}</span>` : ""}
          </div>
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

        <!-- Total Net Sales of Year -->
        <td class="mono font-bold" style="text-align:left; color:var(--indigo); background:rgba(99,102,241,0.04); font-size:12px;">
          <div>${formatCurrency(rowDisplayNetSales)}</div>
          ${row.totalReturns > 0 ? `
            <div style="font-size:9px; font-weight:normal; color:var(--bad);" title="إجمالي مردودات السنة المسترجعة">
              ↩️ مردود: ${formatCurrency(rowDisplayReturns)}
            </div>
          ` : ""}
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
        const salesVal = _taxMode === "no_vat" ? m.salesSubtotal : m.sales;
        const netVal = _taxMode === "no_vat" ? m.netSalesSubtotal : m.netSales;
        colMonthTotals[idx] += (_selectedMetric === "collections" ? m.collections : _selectedMetric === "sales" ? salesVal : netVal);
        colMonthCollections[idx] += m.collections;
      });
    });

    const grandTotalNetSales = displayList.reduce((s, r) => s + (_taxMode === "no_vat" ? r.totalNetSalesSubtotal : r.totalNetSales), 0);
    const grandTotalCol = displayList.reduce((s, r) => s + r.totalCollections, 0);
    const grandRate = grandTotalNetSales > 0 ? (grandTotalCol / grandTotalNetSales) * 100 : 0;
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
            ${val !== 0 ? formatCurrency(val) : "0.00"}
          </td>
        `).join("")}
        <td class="mono font-bold" style="text-align:left; color:var(--indigo); font-size:12.5px;">
          ${formatCurrency(grandTotalNetSales)}
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

// ─────────────────────────────────────────────────────────────────────────────
// Render Dedicated Monthly Analysis Breakdown Table (جدول تحليل الأشهر ومؤشرات الأداء)
// ─────────────────────────────────────────────────────────────────────────────
function renderMonthlyBreakdownTable() {
  const tbody = document.getElementById("cmm-monthly-breakdown-tbody");
  const tfoot = document.getElementById("cmm-monthly-breakdown-tfoot");
  if (!tbody) return;

  const targetData = _selectedCustomerId
    ? _matrixData.filter(d => d.customer.id === _selectedCustomerId)
    : _matrixData;

  const grandTotalSales = targetData.reduce((s, d) => s + d.totalSales, 0);

  const monthlyStats = Array(12).fill(0).map((_, mIdx) => {
    let sales = 0;
    let salesSubtotal = 0;
    let salesVat = 0;
    let returns = 0;
    let returnsSubtotal = 0;
    let returnsVat = 0;
    let netSales = 0;
    let netSalesSubtotal = 0;
    let collections = 0;
    let activeCusts = 0;
    let topBuyer = { name: "—", amount: 0 };
    let topPayer = { name: "—", amount: 0 };

    targetData.forEach(row => {
      const m = row.monthlySales[mIdx];
      sales += m.sales;
      salesSubtotal += m.salesSubtotal;
      salesVat += m.salesVat;

      returns += m.returns;
      returnsSubtotal += m.returnsSubtotal;
      returnsVat += m.returnsVat;

      netSales += m.netSales;
      netSalesSubtotal += m.netSalesSubtotal;
      collections += m.collections;

      if (m.sales > 0 || m.collections > 0 || m.returns > 0) {
        activeCusts++;
      }

      const custMonthNet = _taxMode === "no_vat" ? m.netSalesSubtotal : m.netSales;
      if (custMonthNet > topBuyer.amount) {
        topBuyer = { name: row.customer.name, amount: custMonthNet };
      }
      if (m.collections > topPayer.amount) {
        topPayer = { name: row.customer.name, amount: m.collections };
      }
    });

    const gap = netSales - collections;
    const rate = netSales > 0 ? (collections / netSales) * 100 : (sales > 0 ? (collections / sales) * 100 : (collections > 0 ? 100 : 0));
    const share = grandTotalSales > 0 ? (sales / grandTotalSales) * 100 : 0;

    return {
      mIdx,
      monthName: MONTH_NAMES_AR[mIdx],
      sales,
      salesSubtotal,
      salesVat,
      returns,
      returnsSubtotal,
      returnsVat,
      netSales,
      netSalesSubtotal,
      collections,
      gap,
      rate,
      share,
      activeCusts,
      topBuyer,
      topPayer
    };
  });

  tbody.innerHTML = monthlyStats.map(stat => {
    const isSortedThisMonth = _activeSortKey.startsWith(`month_${stat.mIdx}_`);
    const rateBadgeClass = stat.rate >= 95 ? "good" : stat.rate >= 70 ? "warn" : stat.sales === 0 ? "neutral" : "bad";
    const gapColor = stat.gap > 0 ? "var(--bad)" : stat.gap < 0 ? "#10B981" : "var(--text-2)";

    return `
      <tr style="transition:background 0.15s; ${isSortedThisMonth ? 'background:rgba(99,102,241,0.08); font-weight:700;' : ''}">
        <td style="padding:10px 12px; font-weight:800; color:var(--text-0);">
          <span style="display:inline-flex; align-items:center; gap:6px;">
            <span class="badge" style="background:var(--bg-1); color:var(--brand); font-size:10px; font-weight:900; border:1px solid var(--border-soft); width:26px; text-align:center;">
              ${String(stat.mIdx + 1).padStart(2, "0")}
            </span>
            <span style="font-size:12.5px;">${stat.monthName}</span>
          </span>
        </td>
        <td class="mono" style="text-align:left; color:var(--text-1); font-size:12px;">
          ${stat.salesSubtotal > 0 ? formatCurrency(stat.salesSubtotal) : "0.00"}
        </td>
        <td class="mono" style="text-align:left; color:var(--brand); font-size:11.5px;">
          ${stat.salesVat > 0 ? formatCurrency(stat.salesVat) : "0.00"}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--indigo); font-size:12.5px;">
          ${stat.sales > 0 ? formatCurrency(stat.sales) : "0.00"}
        </td>
        <td class="mono" style="text-align:left; color:${stat.returns > 0 ? 'var(--bad)' : 'var(--text-3)'}; font-size:12px;">
          ${stat.returns > 0 ? formatCurrency(stat.returns) : "0.00"}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--text-0); font-size:12.5px;">
          ${stat.netSales !== 0 ? formatCurrency(stat.netSales) : "0.00"}
        </td>
        <td class="mono font-bold" style="text-align:left; color:#10B981; font-size:12.5px;">
          ${stat.collections > 0 ? formatCurrency(stat.collections) : "0.00"}
        </td>
        <td class="mono font-bold" style="text-align:left; color:${gapColor}; font-size:12px;">
          ${stat.gap > 0 ? formatCurrency(stat.gap) : stat.gap < 0 ? `(${formatCurrency(Math.abs(stat.gap))}) فائض` : "0.00"}
        </td>
        <td style="text-align:center;">
          <span class="badge ${rateBadgeClass}" style="font-size:10.5px; font-weight:800;">
            ${stat.rate.toFixed(0)}%
          </span>
        </td>
        <td style="text-align:center;" class="mono">
          <span style="font-size:11.5px; color:var(--text-1); font-weight:700;">${stat.share.toFixed(1)}%</span>
        </td>
        <td style="text-align:center;" class="mono">
          <span class="badge neutral" style="font-size:10.5px;">${stat.activeCusts}</span>
        </td>
        <td style="text-align:right; font-size:11px;">
          ${stat.topBuyer.amount > 0 ? `
            <div style="font-weight:700; color:var(--text-0); max-width:150px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${stat.topBuyer.name}</div>
            <div class="mono" style="font-size:10px; color:var(--indigo);">${formatCurrency(stat.topBuyer.amount)}</div>
          ` : `<span style="color:var(--text-3);">—</span>`}
        </td>
        <td style="text-align:right; font-size:11px;">
          ${stat.topPayer.amount > 0 ? `
            <div style="font-weight:700; color:var(--text-0); max-width:150px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${stat.topPayer.name}</div>
            <div class="mono" style="font-size:10px; color:#10B981;">${formatCurrency(stat.topPayer.amount)}</div>
          ` : `<span style="color:var(--text-3);">—</span>`}
        </td>
        <td style="text-align:center;" class="no-print">
          <div style="display:flex; gap:4px; justify-content:center;">
            <button class="btn btn-ghost btn-sm" title="فرز مصفوفة العملاء حسب مبيعات ${stat.monthName}" onclick="window.setMonthQuickSort(${stat.mIdx}, 'sales'); window.scrollCmmToMatrix();" style="padding:2px 6px; font-size:10.5px; font-weight:700; border-radius:6px; background:rgba(99,102,241,0.08); color:var(--brand);">
              🛒 مبيعات
            </button>
            <button class="btn btn-ghost btn-sm" title="فرز مصفوفة العملاء حسب تحصيلات ${stat.monthName}" onclick="window.setMonthQuickSort(${stat.mIdx}, 'col'); window.scrollCmmToMatrix();" style="padding:2px 6px; font-size:10.5px; font-weight:700; border-radius:6px; background:rgba(16,185,129,0.08); color:#10B981;">
              📥 تحصيل
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  if (tfoot) {
    const totSales = monthlyStats.reduce((s, m) => s + m.sales, 0);
    const totSubtotal = monthlyStats.reduce((s, m) => s + m.salesSubtotal, 0);
    const totVat = monthlyStats.reduce((s, m) => s + m.salesVat, 0);
    const totReturns = monthlyStats.reduce((s, m) => s + m.returns, 0);
    const totNet = monthlyStats.reduce((s, m) => s + m.netSales, 0);
    const totCol = monthlyStats.reduce((s, m) => s + m.collections, 0);
    const totGap = totNet - totCol;
    const totRate = totNet > 0 ? (totCol / totNet) * 100 : (totSales > 0 ? (totCol / totSales) * 100 : 0);

    tfoot.innerHTML = `
      <tr>
        <td style="padding:10px 12px; font-size:12px; color:var(--text-0);">
          الإجمالي العام (${_selectedYear})
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--text-1); font-size:12px;">
          ${formatCurrency(totSubtotal)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--brand); font-size:12px;">
          ${formatCurrency(totVat)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--indigo); font-size:12.5px;">
          ${formatCurrency(totSales)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--bad); font-size:12px;">
          ${formatCurrency(totReturns)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--text-0); font-size:12.5px;">
          ${formatCurrency(totNet)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:#10B981; font-size:12.5px;">
          ${formatCurrency(totCol)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:${totGap > 0 ? 'var(--bad)' : '#10B981'}; font-size:12.5px;">
          ${totGap > 0 ? formatCurrency(totGap) : `(${formatCurrency(Math.abs(totGap))}) فائض`}
        </td>
        <td style="text-align:center; font-size:12px;">
          ${totRate.toFixed(0)}%
        </td>
        <td style="text-align:center; font-size:12px;" class="mono">100%</td>
        <td style="text-align:center; font-size:12px;" class="mono">${targetData.length}</td>
        <td colspan="3"></td>
      </tr>
    `;
  }
}

