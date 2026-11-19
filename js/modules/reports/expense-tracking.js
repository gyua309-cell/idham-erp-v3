// ============================================================
// IDHAM ERP — Expense Tracking Report (تقرير تتبع مصروفات الشركة التفصيلي)
// Version 4.0: Strict Accounting P&L Engine + Interactive Tree View (شجرة المصروفات التفاعلية)
// Zero Liabilities (سداد الموردين والمستحقات مستبعدة), Freight & Transport Included, COGS Excluded
// ============================================================
import { COLS, getAll, query, orderBy, limit, getDocs, where } from "../../utils/db.js";
import { formatCurrency, startOfMonth, todayString, formatDate } from "../../utils/formatters.js";
import { exportToExcel } from "../../utils/excel.js";

let _expenses = [];
let _expenseAccounts = [];
let _costCenters = [];
let _costCentersMap = {};
let _allAccountsMap = {};

let _currentViewMode = "tree"; // "tree" | "table"
let _expandedCategories = new Set(["cat_transport", "cat_payroll", "cat_admin", "cat_finance", "cat_deprec"]);
let _expandedSubAccounts = new Set();

let _categoryChartInstance = null;
let _trendChartInstance = null;

export async function render(container, user) {
  const currentMonthStart = startOfMonth();
  const currentToday = todayString();

  container.innerHTML = `
    <style>
      .print-only-header { display: none; }
      @media print {
        .print-only-header { display: block !important; }
        .no-print { display: none !important; }
        .chart-container-card { display: none !important; }
        .filterbar { display: none !important; }
        .view-mode-bar { display: none !important; }
        .tree-exp-sub-body { display: block !important; }
        .tree-cat-body { display: block !important; }
        body, .page-content { background: #fff !important; padding: 0 !important; }
        .card { box-shadow: none !important; border: 1px solid #ccc !important; }
        table { width: 100% !important; border-collapse: collapse !important; font-size: 11px !important; }
        th, td { border: 1px solid #999 !important; padding: 5px 6px !important; }
      }
      .chart-container-card {
        background: var(--bg-1);
        border: 1px solid var(--border-soft);
        border-radius: 14px;
        padding: 16px 20px;
        box-shadow: var(--shadow-sm);
      }
      .exp-preset-btn {
        font-size: 11.5px;
        font-weight: 700;
        padding: 5px 10px;
        border-radius: 7px;
        transition: all 0.15s ease;
      }
      .badge-logistics {
        background: rgba(16, 185, 129, 0.12);
        color: #047857;
        border: 1px solid rgba(16, 185, 129, 0.25);
      }
      .badge-staff {
        background: rgba(37, 99, 235, 0.12);
        color: #1d4ed8;
        border: 1px solid rgba(37, 99, 235, 0.25);
      }
      .badge-admin {
        background: rgba(124, 58, 237, 0.12);
        color: #6d28d9;
        border: 1px solid rgba(124, 58, 237, 0.25);
      }
      .badge-finance {
        background: rgba(245, 158, 11, 0.12);
        color: #b45309;
        border: 1px solid rgba(245, 158, 11, 0.25);
      }
      .badge-deprec {
        background: rgba(107, 114, 128, 0.12);
        color: #374151;
        border: 1px solid rgba(107, 114, 128, 0.25);
      }
      .badge-cash {
        background: rgba(16, 185, 129, 0.08);
        color: #065f46;
        border: 1px solid rgba(16, 185, 129, 0.2);
      }
      .badge-bank {
        background: rgba(37, 99, 235, 0.08);
        color: #1e40af;
        border: 1px solid rgba(37, 99, 235, 0.2);
      }
      .badge-journal {
        background: rgba(139, 92, 246, 0.08);
        color: #6d28d9;
        border: 1px solid rgba(139, 92, 246, 0.2);
      }
      
      /* Tree View Styles */
      .tree-cat-card {
        background: var(--bg-card);
        border: 1.5px solid var(--border-soft);
        border-radius: 14px;
        margin-bottom: 16px;
        box-shadow: var(--shadow-sm);
        overflow: hidden;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .tree-cat-card:hover {
        border-color: var(--brand);
        box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      }
      .tree-cat-header {
        padding: 14px 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        user-select: none;
        transition: background 0.15s ease;
      }
      .tree-cat-header:hover {
        background: rgba(0,0,0,0.02);
      }
      .tree-cat-body {
        border-top: 1px solid var(--border-soft);
        background: var(--bg-1);
        padding: 12px 14px;
      }
      .tree-sub-card {
        background: var(--bg-card);
        border: 1px solid var(--border-soft);
        border-radius: 10px;
        margin-bottom: 10px;
        overflow: hidden;
        transition: border-color 0.15s ease;
      }
      .tree-sub-card:last-child {
        margin-bottom: 0;
      }
      .tree-sub-card:hover {
        border-color: rgba(30,58,138,0.3);
      }
      .tree-sub-header {
        padding: 10px 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        user-select: none;
        background: var(--bg-2);
        transition: background 0.15s ease;
      }
      .tree-sub-header:hover {
        background: rgba(30,58,138,0.04);
      }
      .tree-sub-body {
        border-top: 1px solid var(--border-soft);
        padding: 0;
        background: var(--bg-card);
      }
      .chevron-icon {
        display: inline-block;
        transition: transform 0.2s ease;
        font-size: 11px;
        color: var(--text-3);
      }
      .chevron-icon.open {
        transform: rotate(90deg);
        color: var(--brand);
      }
      .view-mode-tab {
        padding: 7px 16px;
        border-radius: 9px;
        font-size: 13px;
        font-weight: 800;
        cursor: pointer;
        border: 1.5px solid transparent;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .view-mode-tab.active {
        background: var(--brand);
        color: #fff;
        box-shadow: 0 2px 8px rgba(30,58,138,0.25);
      }
      .view-mode-tab:not(.active) {
        background: var(--bg-2);
        color: var(--text-1);
        border-color: var(--border-soft);
      }
      .view-mode-tab:not(.active):hover {
        background: var(--bg-3);
      }
    </style>

    <!-- ═══ TOP FILTER BAR ═══ -->
    <div class="filterbar no-print" style="flex-wrap:wrap; gap:12px; height:auto; padding:14px 18px; background:var(--bg-1); border-radius:14px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); margin-bottom:20px; align-items:flex-end;">
      
      <!-- Date Inputs -->
      <div class="date-range-group" style="margin:0;">
        <label style="font-size:11.5px; font-weight:700; margin-bottom:4px; display:block; color:var(--text-2);">من تاريخ</label>
        <input type="date" id="et-from" value="${currentMonthStart}" onchange="loadExpenseTracking()" class="input" style="height:34px; font-size:12.5px;" />
      </div>
      <div class="date-range-group" style="margin:0;">
        <label style="font-size:11.5px; font-weight:700; margin-bottom:4px; display:block; color:var(--text-2);">إلى تاريخ</label>
        <input type="date" id="et-to" value="${currentToday}" onchange="loadExpenseTracking()" class="input" style="height:34px; font-size:12.5px;" />
      </div>

      <!-- Date Presets -->
      <div style="display:flex; gap:4px; align-items:center; flex-wrap:wrap; margin-bottom:2px;">
        <button type="button" class="btn btn-sm btn-ghost exp-preset-btn" data-preset="today" onclick="setExpDatePreset('today')">اليوم</button>
        <button type="button" class="btn btn-sm btn-ghost exp-preset-btn" data-preset="yesterday" onclick="setExpDatePreset('yesterday')">أمس</button>
        <button type="button" class="btn btn-sm btn-ghost exp-preset-btn" data-preset="week" onclick="setExpDatePreset('week')">هذا الأسبوع</button>
        <button type="button" class="btn btn-sm btn-primary exp-preset-btn" data-preset="month" onclick="setExpDatePreset('month')">هذا الشهر</button>
        <button type="button" class="btn btn-sm btn-ghost exp-preset-btn" data-preset="last_month" onclick="setExpDatePreset('last_month')">الشهر الماضي</button>
        <button type="button" class="btn btn-sm btn-ghost exp-preset-btn" data-preset="quarter" onclick="setExpDatePreset('quarter')">الربع الحالي</button>
        <button type="button" class="btn btn-sm btn-ghost exp-preset-btn" data-preset="year" onclick="setExpDatePreset('year')">هذا العام</button>
        <button type="button" class="btn btn-sm btn-ghost exp-preset-btn" data-preset="all" onclick="setExpDatePreset('all')">الكل</button>
      </div>
      
      <!-- Expense Classification Filter -->
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11.5px; font-weight:700; margin-bottom:4px; display:block; color:var(--text-2);">تصنيف المصروف</label>
        <select id="et-class-filter" onchange="filterExpenseTracking()" class="input" style="min-width:170px; height:34px; font-size:12px; font-weight:700;">
          <option value="">الكل (جميع التصنيفات)</option>
          <option value="نقل ولوجستيات">🚚 نقل ولوجستيات وتوزيع (شحن، ديزل، صيانة)</option>
          <option value="موظفين وعمالة">👥 موظفين وعمالة (رواتب، بدلات، إقامات)</option>
          <option value="إدارية وعمومية">🏢 إدارية وعمومية (إيجارات، فواتير، خدمات، وسيط)</option>
          <option value="تمويلية وبنكية">💳 تمويلية وبنكية (رسوم بنكية، نقاط بيع)</option>
          <option value="إهلاك ومخصصات">📉 إهلاك أصول ومخصصات</option>
        </select>
      </div>

      <!-- Detailed Account Filter -->
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11.5px; font-weight:700; margin-bottom:4px; display:block; color:var(--text-2);">الحساب التفصيلي</label>
        <select id="et-account-filter" onchange="filterExpenseTracking()" class="input" style="min-width:210px; height:34px; font-size:12px;">
          <option value="">الكل (جميع الحسابات)</option>
        </select>
      </div>

      <!-- Cost Center Filter -->
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11.5px; font-weight:700; margin-bottom:4px; display:block; color:var(--text-2);">مركز التكلفة / المندوب / السيارة</label>
        <select id="et-cc-filter" onchange="filterExpenseTracking()" class="input" style="min-width:160px; height:34px; font-size:12px;">
          <option value="">الكل (جميع المراكز)</option>
        </select>
      </div>

      <!-- Payment Method Filter -->
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11.5px; font-weight:700; margin-bottom:4px; display:block; color:var(--text-2);">طريقة الصرف</label>
        <select id="et-method-filter" onchange="filterExpenseTracking()" class="input" style="min-width:140px; height:34px; font-size:12px;">
          <option value="">الكل (جميع الطرق)</option>
          <option value="cash">💵 نقدي (الصناديق والعهد)</option>
          <option value="bank">🏦 بنكي (التحويلات والحسابات)</option>
          <option value="journal">📝 قيود يومية وتسويات</option>
        </select>
      </div>

      <!-- Quick Text Search -->
      <div style="flex:1; min-width:180px; margin:0;">
        <label style="font-size:11.5px; font-weight:700; margin-bottom:4px; display:block; color:var(--text-2);">🔍 بحث سريع</label>
        <input type="text" id="et-search" class="input" placeholder="رقم السند، البيان، الحساب، الصندوق..." oninput="filterExpenseTracking()" style="height:34px; font-size:12px;" />
      </div>

      <!-- Action Buttons -->
      <div style="margin-right:auto; display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="exportExpenseTrackingExcel()" title="تصدير Excel" style="font-weight:700; height:34px; border-radius:8px;">
          <span>📊</span> Excel
        </button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="exportExpenseTrackingPDF()" title="تصدير PDF" style="font-weight:700; height:34px; border-radius:8px;">
          <span>📄</span> PDF
        </button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="printExpenseTrackingReport()" title="طباعة فورية" style="font-weight:700; height:34px; border-radius:8px;">
          <span>🖨️</span> طباعة
        </button>
        <button type="button" class="btn btn-primary btn-sm" onclick="loadExpenseTracking()" title="تحديث البيانات" style="font-weight:700; height:34px; border-radius:8px;">
          <span>🔄</span> تحديث
        </button>
      </div>
    </div>

    <div class="page-content" style="padding:0 4px;">
      <!-- Luxury Print Header -->
      <div class="print-only-header" style="border-bottom:3px double #1e3a8a; padding-bottom:14px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:16px; align-items:center;">
            <img id="et-print-logo" style="max-height:64px; max-width:120px;" src="" alt="شعار الشركة" />
            <div>
              <h2 id="et-print-co-name" style="margin:0; font-family:var(--font-heading); color:#1e3a8a; font-size:18px;">مؤسسة إدهام للمواد الغذائية</h2>
              <div id="et-print-co-details" class="dim" style="font-size:11px; margin-top:4px; color:#475569;"></div>
            </div>
          </div>
          <div style="text-align:left;">
            <h3 style="margin:0; font-family:var(--font-heading); font-size:16px;">تقرير تتبع وتحليل مصروفات الشركة</h3>
            <p style="margin:4px 0 0 0; font-size:11.5px; color:#64748b; font-weight:700;" id="et-print-period"></p>
          </div>
        </div>
      </div>

      <div class="page-header no-print" style="margin-bottom:18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h1 class="page-title" style="font-size:20px; font-weight:900; margin:0 0 4px 0; display:flex; align-items:center; gap:8px;">
            <span>💼</span> تتبع وتحليل المصروفات (تشغيلية / لوجستية / إدارية)
          </h1>
          <p class="page-subtitle" id="et-period" style="font-size:12.5px; color:var(--text-2); font-weight:600; margin:0;"></p>
        </div>
        <div>
          <span class="badge" id="et-count-badge" style="font-size:12px; font-weight:800; background:rgba(30,58,138,0.08); color:var(--brand); border:1.5px solid rgba(30,58,138,0.2); padding:6px 12px;">0 حركة مسجلة</span>
        </div>
      </div>

      <!-- ═══ 6 KPI SUMMARY CARDS ═══ -->
      <div class="kpi-grid mb-24" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:24px;">
        
        <!-- KPI 1: Logistics & Fleet Expenses -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:15px 16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar good" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#10b981,#059669);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kpi-label" style="font-size:11.5px; font-weight:700; color:var(--text-2); margin-bottom:4px;">النقل واللوجستيات والأسطول</div>
              <div class="kpi-value mono" id="et-total-logistics" style="font-size:17.5px; font-weight:900; color:#059669;">0.00 ر.س</div>
            </div>
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(16,185,129,0.12); display:flex; align-items:center; justify-content:center; font-size:16px;">🚚</div>
          </div>
          <div class="kpi-subtext" style="font-size:10.5px; color:#059669; margin-top:6px; font-weight:700;">
            شحن بضائع، ديزل، صيانة <span id="et-pct-logistics" class="mono">(0%)</span>
          </div>
        </div>

        <!-- KPI 2: Staff & Payroll Expenses -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:15px 16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar blue" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#3b82f6,#1d4ed8);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kpi-label" style="font-size:11.5px; font-weight:700; color:var(--text-2); margin-bottom:4px;">الموظفين والعمالة</div>
              <div class="kpi-value mono" id="et-total-payroll" style="font-size:17.5px; font-weight:900; color:#1d4ed8;">0.00 ر.س</div>
            </div>
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(59,130,246,0.12); display:flex; align-items:center; justify-content:center; font-size:16px;">👥</div>
          </div>
          <div class="kpi-subtext" style="font-size:10.5px; color:#1d4ed8; margin-top:6px; font-weight:700;">
            رواتب، بدلات، إقامات، تأمينات <span id="et-pct-payroll" class="mono">(0%)</span>
          </div>
        </div>

        <!-- KPI 3: Admin & Overhead Expenses -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:15px 16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar purple" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#8b5cf6,#6d28d9);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kpi-label" style="font-size:11.5px; font-weight:700; color:var(--text-2); margin-bottom:4px;">الإدارية والعمومية</div>
              <div class="kpi-value mono" id="et-total-admin" style="font-size:17.5px; font-weight:900; color:#6d28d9;">0.00 ر.س</div>
            </div>
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(139,92,246,0.12); display:flex; align-items:center; justify-content:center; font-size:16px;">🏢</div>
          </div>
          <div class="kpi-subtext" style="font-size:10.5px; color:#6d28d9; margin-top:6px; font-weight:700;">
            إيجار، كهرباء، تراخيص، وسيط <span id="et-pct-admin" class="mono">(0%)</span>
          </div>
        </div>

        <!-- KPI 4: Financial & Depreciation -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:15px 16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar warn" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#f59e0b,#d97706);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kpi-label" style="font-size:11.5px; font-weight:700; color:var(--text-2); margin-bottom:4px;">التمويلية والإهلاك</div>
              <div class="kpi-value mono" id="et-total-fin" style="font-size:17.5px; font-weight:900; color:#d97706;">0.00 ر.س</div>
            </div>
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(245,158,11,0.12); display:flex; align-items:center; justify-content:center; font-size:16px;">💳</div>
          </div>
          <div class="kpi-subtext" style="font-size:10.5px; color:#d97706; margin-top:6px; font-weight:700;">
            رسوم بنكية، نقاط بيع، إهلاك <span id="et-pct-fin" class="mono">(0%)</span>
          </div>
        </div>

        <!-- KPI 5: Grand Total -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:15px 16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar bad" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#ef4444,#dc2626);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kpi-label" style="font-size:11.5px; font-weight:700; color:var(--text-2); margin-bottom:4px;">إجمالي المصروفات</div>
              <div class="kpi-value mono" id="et-total-amount" style="font-size:19px; font-weight:900; color:#dc2626;">0.00 ر.س</div>
            </div>
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(239,68,68,0.12); display:flex; align-items:center; justify-content:center; font-size:16px;">💸</div>
          </div>
          <div class="kpi-subtext" style="font-size:10.5px; color:#dc2626; margin-top:6px; font-weight:700;">
            كافة المصروفات خلال الفترة
          </div>
        </div>

        <!-- KPI 6: Daily Burn Rate -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:15px 16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar cyan" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#0ea5e9,#0284c7);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kpi-label" style="font-size:11.5px; font-weight:700; color:var(--text-2); margin-bottom:4px;">معدل الصرف اليومي</div>
              <div class="kpi-value mono" id="et-burn-rate" style="font-size:17.5px; font-weight:900; color:#0284c7;">0.00 ر.س / يوم</div>
            </div>
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(14,165,233,0.12); display:flex; align-items:center; justify-content:center; font-size:16px;">📈</div>
          </div>
          <div class="kpi-subtext" style="font-size:10.5px; color:#0284c7; margin-top:6px; font-weight:700;">
            متوسط الإنفاق اليومي
          </div>
        </div>
      </div>

      <!-- ═══ DASHBOARD CHARTS ROW ═══ -->
      <div class="grid-2 gap-20 mb-24 no-print" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(340px, 1fr)); gap:20px; margin-bottom:24px;">
        
        <!-- Chart 1: Expenses by Top Accounts (Bar Chart) -->
        <div class="chart-container-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 style="font-family:var(--font-heading); font-size:14px; font-weight:800; margin:0; color:var(--text-1); display:flex; align-items:center; gap:6px;">
              <span>📊</span> أعلى بنود المصروفات استهلاكاً
            </h3>
            <span style="font-size:11px; color:var(--text-3); font-weight:600;">(حسب الحساب المدين)</span>
          </div>
          <div style="position:relative; height:240px; width:100%;">
            <canvas id="et-category-chart"></canvas>
          </div>
        </div>

        <!-- Chart 2: Time Progression (Line Chart) -->
        <div class="chart-container-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 style="font-family:var(--font-heading); font-size:14px; font-weight:800; margin:0; color:var(--text-1); display:flex; align-items:center; gap:6px;">
              <span>📈</span> تتبع حركة وتراكم المصروفات بالفترة
            </h3>
            <span style="font-size:11px; color:var(--text-3); font-weight:600;">(مقارنة التصنيفات الرئيسية)</span>
          </div>
          <div style="position:relative; height:240px; width:100%;">
            <canvas id="et-trend-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- ═══ VIEW MODE SWITCHER & TREE CONTROLS ═══ -->
      <div class="view-mode-bar no-print" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px; background:var(--bg-1); padding:10px 16px; border-radius:12px; border:1px solid var(--border-soft);">
        <div style="display:flex; gap:8px; align-items:center;">
          <button type="button" class="view-mode-tab active" id="et-btn-mode-tree" onclick="switchExpenseViewMode('tree')">
            <span>🌲</span> شجرة المصروفات التفاعلية (Tree View)
          </button>
          <button type="button" class="view-mode-tab" id="et-btn-mode-table" onclick="switchExpenseViewMode('table')">
            <span>📋</span> جدول الحركات المسطح (Flat Table)
          </button>
        </div>

        <div id="et-tree-controls" style="display:flex; gap:8px; align-items:center;">
          <button type="button" class="btn btn-sm btn-ghost" onclick="expandAllTreeNodes()" style="font-size:12px; font-weight:700;">
            <span>➕</span> توسيع الكل
          </button>
          <button type="button" class="btn btn-sm btn-ghost" onclick="collapseAllTreeNodes()" style="font-size:12px; font-weight:700;">
            <span>➖</span> طي الكل
          </button>
        </div>
      </div>

      <!-- ═══ 1. INTERACTIVE TREE VIEW CONTAINER ═══ -->
      <div id="et-tree-container" style="display:block;">
        <div id="et-tree-content">
          <div style="text-align:center; padding:36px; color:var(--text-2);">
            <div class="loading-spinner" style="margin:0 auto 12px auto; width:32px; height:32px;"></div>
            جارٍ تحميل وبناء شجرة المصروفات...
          </div>
        </div>
      </div>

      <!-- ═══ 2. FLAT TRANSACTIONS TABLE CARD ═══ -->
      <div class="card" id="et-table-card" style="display:none; border-radius:14px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); overflow:hidden; background:var(--bg-card); margin-bottom:24px;">
        <div class="card-header no-print" style="padding:14px 18px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <h3 style="font-family:var(--font-heading); font-size:15px; font-weight:800; margin:0; display:flex; align-items:center; gap:8px;">
            <span>📋</span> سجل حركة المصروفات التفصيلي
          </h3>
          <div style="font-size:12px; color:var(--text-2);">
            * يعرض جميع الحركات المسجلة مرتبة زمنياً
          </div>
        </div>
        <div class="table-container" style="overflow-x:auto;">
          <table class="data-dense" id="et-table" style="width:100%; margin:0; border-collapse:collapse;">
            <thead>
              <tr style="background:var(--bg-2); border-bottom:2px solid var(--border-soft);">
                <th style="width:36px; text-align:center;">#</th>
                <th style="width:95px; text-align:right;">التاريخ</th>
                <th style="width:115px; text-align:right;">رقم السند / القيد</th>
                <th style="min-width:180px; text-align:right;">الحساب المدين / البند</th>
                <th style="width:140px; text-align:right;">التصنيف</th>
                <th style="width:140px; text-align:right;">طريقة الصرف (الدفع من)</th>
                <th style="width:130px; text-align:right;">مركز التكلفة</th>
                <th style="min-width:180px; text-align:right;">البيان / الملاحظات</th>
                <th style="width:125px; text-align:left; color:#dc2626;">المبلغ (ر.س)</th>
                <th style="width:60px; text-align:center;" class="no-print">معاينة</th>
              </tr>
            </thead>
            <tbody id="et-tbody">
              <tr><td colspan="10" style="text-align:center; padding:32px; color:var(--text-2);">جاري تحميل المصروفات...</td></tr>
            </tbody>
            <tfoot id="et-tfoot"></tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL FOR TRANSACTION PREVIEW ═══ -->
    <div class="modal-overlay hidden" id="et-voucher-modal" style="z-index: 1050;">
      <div class="modal modal-md" style="max-width:580px; border-radius:14px;">
        <div class="modal-header" style="background:linear-gradient(135deg,#1e3a8a,#0f172a); color:#fff; border-radius:14px 14px 0 0; padding:14px 20px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">📄</span>
            <h3 class="modal-title" style="color:#fff; font-size:15px; font-weight:800; margin:0;" id="et-vm-title">تفاصيل حركة المصروف</h3>
          </div>
          <button type="button" class="modal-close" style="color:#fff; opacity:0.8;" onclick="closeModal('et-voucher-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;" id="et-vm-body">
          <!-- Dynamic details content -->
        </div>
        <div class="modal-footer" style="padding:12px 20px; background:var(--bg-2); border-radius:0 0 14px 14px; display:flex; justify-content:space-between; align-items:center;">
          <button type="button" class="btn btn-ghost" onclick="closeModal('et-voucher-modal')">إغلاق</button>
          <button type="button" class="btn btn-primary" id="et-vm-print-btn" onclick="printExpenseTrackingVoucherModal()" style="font-weight:700;">
            🖨️ طباعة السند
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach global window actions
  window.loadExpenseTracking = loadExpenseTracking;
  window.filterExpenseTracking = filterExpenseTracking;
  window.setExpDatePreset = setExpDatePreset;
  window.switchExpenseViewMode = switchExpenseViewMode;
  window.toggleExpenseCategory = toggleExpenseCategory;
  window.toggleExpenseSubAccount = toggleExpenseSubAccount;
  window.expandAllTreeNodes = expandAllTreeNodes;
  window.collapseAllTreeNodes = collapseAllTreeNodes;
  window.exportExpenseTrackingExcel = exportExpenseTrackingExcel;
  window.exportExpenseTrackingPDF = exportExpenseTrackingPDF;
  window.printExpenseTrackingReport = printExpenseTrackingReport;
  window.viewExpenseTrackingDetail = viewExpenseTrackingDetail;
  window.printExpenseTrackingVoucherModal = printExpenseTrackingVoucherModal;

  await loadFilters();
  await loadExpenseTracking();
}

/**
 * ── Helper: Account Classification ───────────────────────────
 */
function getExpenseClass(code, name = "") {
  const c = String(code || "").trim();
  const n = String(name || "").trim().toLowerCase();

  // 1. Freight & Logistics (5-1-7 or 5-3, or freight/fuel/fleet)
  if (c.startsWith("5-1-7") || c.startsWith("5-3") ||
      n.includes("نقل بضاعة") || n.includes("شحن") || n.includes("ديزل") ||
      n.includes("سيار") || n.includes("بنزين") || n.includes("محروقات") ||
      n.includes("توزيع") || n.includes("فحص دوري") || n.includes("مرور")) {
    return "نقل ولوجستيات";
  }

  // 2. Staff & Payroll (5-2, or employee salaries/allowances/iqama)
  if (c.startsWith("5-2") || n.includes("رواتب") || n.includes("أجور") ||
      n.includes("بدل") || n.includes("تأمين طبي") || n.includes("مكافأة") ||
      n.includes("عمالة") || n.includes("سعوديين") || n.includes("إقامة") ||
      n.includes("اقامة") || n.includes("تأشير") || n.includes("جوازات")) {
    return "موظفين وعمالة";
  }

  // 3. Financial & Bank (5-5, or bank fees/POS)
  if (c.startsWith("5-5") || n.includes("تمويل") || n.includes("رسوم بنكي") ||
      n.includes("عمولة بنكي") || n.includes("نقاط بيع") || n.includes("مدى") ||
      n.includes("فوائد") || n.includes("بوابة دفع")) {
    return "تمويلية وبنكية";
  }

  // 4. Depreciation & Provisions (5-6, 5-7)
  if (c.startsWith("5-6") || c.startsWith("5-7") || n.includes("إهلاك") ||
      n.includes("اهلاك") || n.includes("استهلاك") || n.includes("مخصص") ||
      n.includes("هالك")) {
    return "إهلاك ومخصصات";
  }

  // 5. G&A (Administrative & General) - 5-4 and others (Rent, utilities, broker commissions 5-4-10)
  return "إدارية وعمومية";
}

function getMainCategoryMeta(expClass) {
  const meta = {
    "نقل ولوجستيات": {
      id: "cat_transport",
      title: "مصروفات النقل والتوزيع واللوجستيات",
      codeRange: "5-3, 5-1-7",
      icon: "🚚",
      color: "#059669",
      bgLight: "rgba(16, 185, 129, 0.08)",
      border: "rgba(16, 185, 129, 0.25)",
      badgeClass: "badge-logistics"
    },
    "موظفين وعمالة": {
      id: "cat_payroll",
      title: "مصروفات الموظفين والعمالة والرواتب",
      codeRange: "5-2",
      icon: "👥",
      color: "#1d4ed8",
      bgLight: "rgba(37, 99, 235, 0.08)",
      border: "rgba(37, 99, 235, 0.25)",
      badgeClass: "badge-staff"
    },
    "إدارية وعمومية": {
      id: "cat_admin",
      title: "المصروفات الإدارية والعمومية والتشغيلية",
      codeRange: "5-4",
      icon: "🏢",
      color: "#6d28d9",
      bgLight: "rgba(124, 58, 237, 0.08)",
      border: "rgba(124, 58, 237, 0.25)",
      badgeClass: "badge-admin"
    },
    "تمويلية وبنكية": {
      id: "cat_finance",
      title: "المصروفات التمويلية والبنكية",
      codeRange: "5-5",
      icon: "💳",
      color: "#d97706",
      bgLight: "rgba(217, 119, 6, 0.08)",
      border: "rgba(217, 119, 6, 0.25)",
      badgeClass: "badge-finance"
    },
    "إهلاك ومخصصات": {
      id: "cat_deprec",
      title: "الإهلاك والاستهلاك والمخصصات",
      codeRange: "5-6, 5-7",
      icon: "📉",
      color: "#374151",
      bgLight: "rgba(107, 114, 128, 0.08)",
      border: "rgba(107, 114, 128, 0.25)",
      badgeClass: "badge-deprec"
    }
  };
  return meta[expClass] || meta["إدارية وعمومية"];
}

function getSourceTypeLabel(t) {
  const map = {
    expense: "سند صرف",
    cash: "صرف نقدي",
    bank: "تحويل بنكي",
    journal: "قيد يومية",
    manual: "قيد يدوي",
    payroll: "مسير رواتب",
    pos: "نقطة بيع",
    payment: "سند صرف"
  };
  return t ? (map[t] || t) : "قيد محاسبي";
}

/**
 * ── Helper: Quick Date Presets ────────────────────────────────
 */
function setExpDatePreset(preset) {
  const fromEl = document.getElementById("et-from");
  const toEl = document.getElementById("et-to");
  if (!fromEl || !toEl) return;

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (year, month, day) => `${year}-${pad(month)}-${pad(day)}`;
  const todayStr = fmt(y, m + 1, d);

  document.querySelectorAll(".exp-preset-btn").forEach(b => {
    const isAct = b.dataset.preset === preset;
    b.classList.toggle("btn-primary", isAct);
    b.classList.toggle("btn-ghost", !isAct);
  });

  if (preset === "today") {
    fromEl.value = todayStr;
    toEl.value = todayStr;
  } else if (preset === "yesterday") {
    const yest = new Date(now);
    yest.setDate(d - 1);
    const yestStr = fmt(yest.getFullYear(), yest.getMonth() + 1, yest.getDate());
    fromEl.value = yestStr;
    toEl.value = yestStr;
  } else if (preset === "week") {
    const dayOfWeek = now.getDay();
    const startWeek = new Date(now);
    startWeek.setDate(d - ((dayOfWeek + 1) % 7));
    fromEl.value = fmt(startWeek.getFullYear(), startWeek.getMonth() + 1, startWeek.getDate());
    toEl.value = todayStr;
  } else if (preset === "month") {
    fromEl.value = fmt(y, m + 1, 1);
    toEl.value = todayStr;
  } else if (preset === "last_month") {
    const lastM = m === 0 ? 11 : m - 1;
    const lastY = m === 0 ? y - 1 : y;
    const lastDay = new Date(y, m, 0).getDate();
    fromEl.value = fmt(lastY, lastM + 1, 1);
    toEl.value = fmt(lastY, lastM + 1, lastDay);
  } else if (preset === "quarter") {
    const qMonth = Math.floor(m / 3) * 3;
    fromEl.value = fmt(y, qMonth + 1, 1);
    toEl.value = todayStr;
  } else if (preset === "year") {
    fromEl.value = fmt(y, 1, 1);
    toEl.value = todayStr;
  } else if (preset === "all") {
    fromEl.value = "2020-01-01";
    toEl.value = todayStr;
  }

  loadExpenseTracking();
}

/**
 * ── Load Accounts and Cost Centers Filters ───────────────────
 */
async function loadFilters() {
  try {
    const [accounts, ccs] = await Promise.all([
      getAll(COLS.chartOfAccounts(), [orderBy("code")]).catch(() => []),
      getAll(COLS.costCenters(), [orderBy("name")]).catch(() => [])
    ]);

    _allAccountsMap = {};
    accounts.forEach(a => {
      if (a.id) _allAccountsMap[a.id] = a;
      if (a.code) _allAccountsMap[a.code] = a;
      if (a.name) _allAccountsMap[a.name.trim().toLowerCase()] = a;
    });

    _costCenters = ccs || [];
    _costCentersMap = {};
    _costCenters.forEach(c => {
      if (c.id) _costCentersMap[c.id] = c;
      if (c.name) {
        _costCentersMap[c.name] = c;
        _costCentersMap[c.name.trim().toLowerCase()] = c;
      }
    });

    // Filter accounts: Must be Class 5 (or explicit expense type)
    // EXCLUDE: 1-X (Assets), 2-X (Liabilities / Suppliers / Accrued Salaries), 3-X (Equity), 4-X (Revenue)
    // EXCLUDE COGS: 5-1-8, 5-1-1, 5-1-2, 5-1-3, 5-1 (except 5-1-7 freight in)
    _expenseAccounts = accounts.filter(a => {
      const code = String(a.code || "").trim();
      const name = String(a.name || "").trim().toLowerCase();

      // Strict rejection of Balance Sheet accounts
      if (code.startsWith("1") || code.startsWith("2") || code.startsWith("3") || code.startsWith("4")) {
        return false;
      }

      // Special handling for 5-1: Allow 5-1-7 (freight in) only!
      if (code.startsWith("5-1")) {
        return code.startsWith("5-1-7") || name.includes("نقل بضاعة");
      }

      if (name.includes("بضاعة مباعة") || name.includes("بضاعه مباعه") ||
          name.includes("تكلفة مبيعات") || name.includes("تكلفة المبيعات") ||
          name.includes("تكلفة البضاعة")) {
        return false;
      }

      return a.type === "expense" || code.startsWith("5");
    });

    const accSel = document.getElementById("et-account-filter");
    if (accSel) {
      accSel.innerHTML = '<option value="">الكل (جميع الحسابات)</option>' +
        _expenseAccounts.map(a => `<option value="${a.id || a.code}">${a.code} — ${a.name}</option>`).join("");
    }

    const ccSel = document.getElementById("et-cc-filter");
    if (ccSel) {
      ccSel.innerHTML = '<option value="">الكل (جميع المراكز والمناديب)</option>' +
        _costCenters.map(c => {
          const icon = c.type === "vehicle" ? "🚐" : (c.type === "branch" ? "🏢" : "📁");
          return `<option value="${c.id}">${icon} ${c.name}</option>`;
        }).join("") +
        '<option value="unassigned">⚪ غير محدد / عام (بدون مركز)</option>';
    }
  } catch (err) {
    console.error("loadFilters error:", err);
  }
}

/**
 * ── Master Data Loader: Expenses + Journal Entries ───────────
 * STRICT P&L LOGIC: Excludes Supplier Payments (2-1-1-X) & Accrued Salaries (2-1-5-X)
 * INCLUDES Freight In (5-1-7) & Logistics (5-3-X), EXCLUDES COGS (5-1-8)
 */
async function loadExpenseTracking() {
  const from = document.getElementById("et-from")?.value || "";
  const to = document.getElementById("et-to")?.value || "";

  const periodEl = document.getElementById("et-period");
  if (periodEl) periodEl.textContent = `الفترة من ${from || "البداية"} إلى ${to || "اليوم"}`;

  const tbody = document.getElementById("et-tbody");
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:36px;color:var(--text-2);"><div class="loading-spinner" style="margin:0 auto 12px auto;width:32px;height:32px;"></div>جارٍ استخراج وتدقيق بيانات المصروفات وسندات الصرف والقيود...</td></tr>`;
  }
  const treeContent = document.getElementById("et-tree-content");
  if (treeContent) {
    treeContent.innerHTML = `<div style="text-align:center;padding:36px;color:var(--text-2);"><div class="loading-spinner" style="margin:0 auto 12px auto;width:32px;height:32px;"></div>جارٍ استخراج وتدقيق بيانات المصروفات وسندات الصرف والقيود...</div>`;
  }

  try {
    // 1. Fetch Expenses (Payment Vouchers)
    let expQuery = COLS.expenses();
    if (from && to) {
      expQuery = query(COLS.expenses(), where("date", ">=", from), where("date", "<=", to), limit(3000));
    }
    const expSnap = await getDocs(expQuery).catch(() => ({ docs: [] }));
    const rawExpenses = expSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // 2. Fetch Journal Entries (Debits on Expense accounts)
    let jeQuery = COLS.journalEntries();
    if (from && to) {
      jeQuery = query(COLS.journalEntries(), where("date", ">=", from), where("date", "<=", to), limit(4000));
    }
    const jeSnap = await getDocs(jeQuery).catch(() => ({ docs: [] }));
    const rawJournalEntries = jeSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Assign sequential display numbers for expenses
    rawExpenses.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    rawExpenses.forEach((e, idx) => {
      if (!e.displayCode) {
        e.displayCode = `PV-${String(idx + 101).padStart(5, '0')}`;
      }
    });

    const combined = [];
    const processedSourceIds = new Set();

    // A) Process Direct Payment Vouchers
    rawExpenses.forEach(e => {
      const acc = _allAccountsMap[e.targetId] ||
                  _allAccountsMap[e.accountId] ||
                  _allAccountsMap[e.accountCode] ||
                  _allAccountsMap[e.accountName] ||
                  _allAccountsMap[(e.accountName || "").trim().toLowerCase()];

      const accCode = String(acc?.code || e.accountCode || "").trim();
      const accName = acc?.name || e.accountName || e.destinationName || "";
      const entityType = String(e.entityType || "").trim().toLowerCase();

      // ── STRICT EXCLUSION ──
      // 1. Supplier & Customer settlements are balance sheet movements, NOT operating expenses!
      if (entityType === "supplier" || entityType === "customer") return;

      // 2. Any account starting with 1 (Assets), 2 (Liabilities: 2-1-1 suppliers, 2-1-5 salaries payable, 2-1-4 accrued),
      //    3 (Equity: drawings), 4 (Revenue) is strictly excluded!
      if (accCode.startsWith("1-") || accCode.startsWith("2-") || accCode.startsWith("3-") || accCode.startsWith("4-")) {
        return;
      }

      const testName = (accName + " " + (e.notes || "")).toLowerCase();
      // Skip owner drawings, employee custody advance, or supplier debt settlements
      if (testName.includes("جاري المالك") || testName.includes("جاري الشريك") ||
          testName.includes("عهدة") || testName.includes("سلفة") ||
          testName.includes("سداد مورد") || testName.includes("سداد مستحقات")) {
        if (!accCode.startsWith("5")) return;
      }

      // 3. Exclude Cost of Goods Sold (5-1-8, 5-1-1, 5-1) EXCEPT 5-1-7 (Freight In / نقل بضاعة للداخل)
      if (accCode.startsWith("5-1") && !accCode.startsWith("5-1-7")) {
        return;
      }
      if (testName.includes("تكلفة بضاعة") || testName.includes("تكلفة مبيعات") || testName.includes("تكلفة البضاعة")) {
        return;
      }

      // 4. Must be a true expense account
      const isTrueExp = (accCode.startsWith("5") && (!accCode.startsWith("5-1") || accCode.startsWith("5-1-7"))) ||
                        (acc?.type === "expense" && (!accCode.startsWith("5-1") || accCode.startsWith("5-1-7"))) ||
                        (testName.includes("نقل بضاعة") || testName.includes("شحن") || testName.includes("ضيافة") ||
                         testName.includes("ديزل") || testName.includes("محروقات") || testName.includes("صيانة"));

      if (!isTrueExp) return;

      const finalCode = accCode || (testName.includes("نقل بضاعة") ? "5-1-7" : "5-4-14");
      const finalName = accName || (testName.includes("نقل بضاعة") ? "مصروفات نقل بضاعة (للداخل)" : "مصروف عام");
      const cls = getExpenseClass(finalCode, finalName);
      const ccName = e.costCenterName || _costCentersMap[e.costCenterId]?.name || "—";
      const amount = parseFloat(e.amount || 0);

      if (amount <= 0 || isNaN(amount)) return;

      processedSourceIds.add(e.id);

      combined.push({
        id: e.id,
        sourceDocId: e.id,
        sourceType: "expense",
        date: e.date || "",
        refNumber: e.displayCode || e.number || ("PV-" + e.id.substring(0, 6).toUpperCase()),
        accountName: finalName,
        accountCode: finalCode,
        targetId: acc?.id || e.targetId || "",
        expenseClass: cls,
        method: e.method || "cash",
        sourceName: e.sourceName || (e.method === "cash" ? "الصندوق" : "البنك"),
        costCenterId: e.costCenterId || null,
        costCenterName: ccName,
        notes: e.notes || "سند صرف",
        amount: amount,
        rawObj: e
      });
    });

    // B) Process Journal Entries on Expense Accounts (Excluding COGS & Non-expense entries)
    const nonExpenseSourceTypes = new Set([
      "salescogs", "sales_cogs", "cogs", "salesreturncogs", "sales_return_cogs", "poscogs",
      "salesinvoice", "sales", "salesreturn", "sales_return",
      "purchaseinvoice", "purchase", "purchasereturn", "purchase_return",
      "stocktransfer", "stockadjustment", "physical_count", "initialbalance",
      "receipt"
    ]);

    rawJournalEntries.forEach(je => {
      const st = String(je.sourceType || "").trim().toLowerCase();
      if (nonExpenseSourceTypes.has(st)) return;

      // If linked to an already processed payment voucher, skip to avoid double counting
      if (st === "expense" && je.sourceId && processedSourceIds.has(je.sourceId)) {
        return;
      }

      // Skip entries where description indicates COGS
      const desc = String(je.description || "").toLowerCase();
      if (desc.includes("تكلفة بضاعة") || desc.includes("تكلفة مبيعات") ||
          desc.includes("تكلفة بضاعه") || desc.includes("تكلفة البضاعة")) {
        return;
      }

      (je.lines || []).forEach((line, lIdx) => {
        const debit = parseFloat(line.debit || 0);
        if (debit <= 0 || isNaN(debit)) return;

        const acc = _allAccountsMap[line.accountCode] ||
                    _allAccountsMap[line.accountId] ||
                    _allAccountsMap[line.accountName] ||
                    _allAccountsMap[(line.accountName || "").trim().toLowerCase()];

        const code = String(line.accountCode || acc?.code || "").trim();
        const name = line.accountName || acc?.name || "";

        // ── STRICT EXCLUSION ──
        // 1. Any account starting with 1-, 2-, 3-, 4- is NEVER an expense!
        // (Excludes 2-1-1 supplier debts, 2-1-5 employee liabilities, 2-1-4 accrued liabilities, 1-1-2 employee custody)
        if (code.startsWith("1-") || code.startsWith("2-") || code.startsWith("3-") || code.startsWith("4-")) {
          return;
        }

        // 2. Exclude Cost of Goods Sold accounts (5-1, 5-1-1, 5-1-8) EXCEPT 5-1-7 (Freight In / نقل بضاعة للداخل)
        if (code.startsWith("5-1") && !code.startsWith("5-1-7")) {
          return;
        }
        if (name.includes("بضاعة مباعة") || name.includes("بضاعه مباعه") ||
            name.includes("تكلفة مبيعات") || name.includes("تكلفة المبيعات") ||
            name.includes("تكلفة البضاعة")) {
          return;
        }

        const lineNote = String(line.note || "").toLowerCase();
        if (lineNote.includes("تكلفة بضاعة") || lineNote.includes("تكلفة مبيعات") || lineNote.includes("تكلفة بضاعه")) {
          return;
        }

        // 3. Must be true expense account (Class 5 or explicit expense type)
        const isExp = (code.startsWith("5") && (!code.startsWith("5-1") || code.startsWith("5-1-7"))) ||
                      (acc?.type === "expense" && (!code.startsWith("5-1") || code.startsWith("5-1-7")));

        if (!isExp) return;

        const cls = getExpenseClass(code, name);
        const ccId = line.costCenterId || je.costCenterId || null;
        const ccName = line.costCenterName || je.costCenterName || _costCentersMap[ccId]?.name || "—";

        combined.push({
          id: `${je.id}_${lIdx}`,
          sourceDocId: je.id,
          sourceType: je.sourceType || "journal",
          date: je.date || "",
          refNumber: je.entryNumber || je.refNumber || ("JE-" + (je.number || je.id.substring(0, 6)).toUpperCase()),
          accountName: name || "مصروف",
          accountCode: code,
          targetId: acc?.id || line.accountId || "",
          expenseClass: cls,
          method: je.sourceType === "payroll" ? "payroll" : "journal",
          sourceName: getSourceTypeLabel(je.sourceType),
          costCenterId: ccId,
          costCenterName: ccName,
          notes: line.note || je.description || "قيد يومية",
          amount: debit,
          rawObj: je
        });
      });
    });

    _expenses = combined;
    filterExpenseTracking();
    populatePrintHeader(from, to);
  } catch (err) {
    console.error("loadExpenseTracking error:", err);
    if (window.showToast) window.showToast("فشل تحميل تتبع المصروفات: " + err.message, "danger");
  }
}

/**
 * ── Reactive Filter & Render Engine ──────────────────────────
 */
function filterExpenseTracking() {
  const expClass = document.getElementById("et-class-filter")?.value || "";
  const accVal = document.getElementById("et-account-filter")?.value || "";
  const ccVal = document.getElementById("et-cc-filter")?.value || "";
  const method = document.getElementById("et-method-filter")?.value || "";
  const search = (document.getElementById("et-search")?.value || "").trim().toLowerCase();

  let filtered = [..._expenses];

  // 1. Classification
  if (expClass) {
    filtered = filtered.filter(e => e.expenseClass === expClass);
  }

  // 2. Account Filter
  if (accVal) {
    const accObj = _allAccountsMap[accVal];
    const targetCode = accObj?.code || accVal;
    const targetName = accObj?.name || "";

    filtered = filtered.filter(e => {
      if (e.targetId === accVal) return true;
      if (e.accountCode === targetCode) return true;
      if (targetCode && e.accountCode && e.accountCode.startsWith(targetCode)) return true;
      if (targetName && e.accountName && e.accountName.trim().toLowerCase() === targetName.trim().toLowerCase()) return true;
      return false;
    });
  }

  // 3. Cost Center Filter
  if (ccVal) {
    if (ccVal === "unassigned") {
      filtered = filtered.filter(e => !e.costCenterId || e.costCenterName === "—" || e.costCenterName === "" || e.costCenterName === "بدون مركز تكلفة");
    } else {
      const ccObj = _costCentersMap[ccVal];
      const targetName = (ccObj?.name || ccVal).trim().toLowerCase();
      filtered = filtered.filter(e => {
        if (e.costCenterId === ccVal) return true;
        const eName = (e.costCenterName || "").trim().toLowerCase();
        if (eName && eName === targetName) return true;
        if (eName && targetName && (eName.includes(targetName) || targetName.includes(eName))) return true;
        return false;
      });
    }
  }

  // 4. Method Filter
  if (method) {
    if (method === "cash") filtered = filtered.filter(e => e.method === "cash");
    else if (method === "bank") filtered = filtered.filter(e => e.method === "bank");
    else if (method === "journal") filtered = filtered.filter(e => e.method !== "cash" && e.method !== "bank");
  }

  // 5. Search query
  if (search) {
    filtered = filtered.filter(e =>
      (e.refNumber || "").toLowerCase().includes(search) ||
      (e.accountName || "").toLowerCase().includes(search) ||
      (e.accountCode || "").toLowerCase().includes(search) ||
      (e.notes || "").toLowerCase().includes(search) ||
      (e.sourceName || "").toLowerCase().includes(search) ||
      (e.costCenterName || "").toLowerCase().includes(search) ||
      String(e.amount || "").includes(search)
    );
  }

  // Sort descending by date, then ref
  filtered.sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.refNumber || "").localeCompare(a.refNumber || ""));

  // Calculate Metrics
  const total = filtered.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const totalLogistics = filtered.filter(e => e.expenseClass === "نقل ولوجستيات").reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const totalPayroll = filtered.filter(e => e.expenseClass === "موظفين وعمالة").reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const totalAdmin = filtered.filter(e => e.expenseClass === "إدارية وعمومية").reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const totalFin = filtered.filter(e => e.expenseClass === "تمويلية وبنكية" || e.expenseClass === "إهلاك ومخصصات").reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  const pctLogistics = total > 0 ? Math.round((totalLogistics / total) * 1000) / 10 : 0;
  const pctPayroll = total > 0 ? Math.round((totalPayroll / total) * 1000) / 10 : 0;
  const pctAdmin = total > 0 ? Math.round((totalAdmin / total) * 1000) / 10 : 0;
  const pctFin = total > 0 ? Math.round((totalFin / total) * 1000) / 10 : 0;

  // Daily burn rate
  const from = document.getElementById("et-from")?.value || "";
  const to = document.getElementById("et-to")?.value || "";
  let days = 1;
  if (from && to) {
    const d1 = new Date(from);
    const d2 = new Date(to);
    days = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
  }
  const dailyBurn = Math.round((total / days) * 100) / 100;

  // Update UI KPI elements
  const setEl = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  setEl("et-total-amount", formatCurrency(total));
  setEl("et-total-logistics", formatCurrency(totalLogistics));
  setEl("et-total-payroll", formatCurrency(totalPayroll));
  setEl("et-total-admin", formatCurrency(totalAdmin));
  setEl("et-total-fin", formatCurrency(totalFin));
  setEl("et-burn-rate", `${formatCurrency(dailyBurn)} / يوم`);
  setEl("et-count-badge", `${filtered.length} حركة مسجلة`);

  const setPct = (id, pct) => { const el = document.getElementById(id); if (el) el.textContent = `(${pct}%)`; };
  setPct("et-pct-logistics", pctLogistics);
  setPct("et-pct-payroll", pctPayroll);
  setPct("et-pct-admin", pctAdmin);
  setPct("et-pct-fin", pctFin);

  // If search active, auto-expand matching nodes
  if (search || expClass || accVal) {
    filtered.forEach(e => {
      const meta = getMainCategoryMeta(e.expenseClass);
      _expandedCategories.add(meta.id);
      const subKey = `${meta.id}_${e.accountCode || e.accountName}`;
      _expandedSubAccounts.add(subKey);
    });
  }

  // Render Both Views
  renderTreeView(filtered, total);
  renderTableView(filtered, total, totalLogistics, totalPayroll, totalAdmin, totalFin);
  renderCharts(filtered);
}

/**
 * ── Render 1: Interactive Hierarchical Tree View (شجرة المصروفات التفاعلية) ──
 */
function renderTreeView(filteredExpenses, grandTotal) {
  const container = document.getElementById("et-tree-content");
  if (!container) return;

  if (filteredExpenses.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:48px 20px; background:var(--bg-card); border-radius:14px; border:1px solid var(--border-soft); color:var(--text-2);">
        <div style="font-size:36px; margin-bottom:12px;">🔍</div>
        <div style="font-size:15px; font-weight:800; color:var(--text-1); margin-bottom:6px;">لا توجد مصروفات مطابقة للبحث أو الفلاتر</div>
        <div style="font-size:12px; color:var(--text-3);">جرب تغيير نطاق التواريخ أو تصفير الفلاتر لمعاينة المصروفات</div>
      </div>
    `;
    return;
  }

  // Grouping by Category -> SubAccount -> Transactions
  const categoriesOrder = ["نقل ولوجستيات", "موظفين وعمالة", "إدارية وعمومية", "تمويلية وبنكية", "إهلاك ومخصصات"];
  const tree = {};

  categoriesOrder.forEach(cat => {
    const meta = getMainCategoryMeta(cat);
    tree[cat] = {
      meta,
      total: 0,
      subAccounts: {}
    };
  });

  filteredExpenses.forEach(e => {
    const cat = e.expenseClass || "إدارية وعمومية";
    if (!tree[cat]) {
      tree[cat] = {
        meta: getMainCategoryMeta(cat),
        total: 0,
        subAccounts: {}
      };
    }
    tree[cat].total += parseFloat(e.amount || 0);

    const subKey = e.accountCode || e.accountName || "other";
    if (!tree[cat].subAccounts[subKey]) {
      tree[cat].subAccounts[subKey] = {
        code: e.accountCode || "—",
        name: e.accountName || "بند مصروف",
        total: 0,
        txns: []
      };
    }
    tree[cat].subAccounts[subKey].total += parseFloat(e.amount || 0);
    tree[cat].subAccounts[subKey].txns.push(e);
  });

  let html = "";

  categoriesOrder.forEach(cat => {
    const group = tree[cat];
    if (!group || group.total <= 0) return;

    const meta = group.meta;
    const isCatOpen = _expandedCategories.has(meta.id);
    const catPct = grandTotal > 0 ? ((group.total / grandTotal) * 100).toFixed(1) : "0.0";
    const subAccCount = Object.keys(group.subAccounts).length;
    const txnCount = Object.values(group.subAccounts).reduce((sum, s) => sum + s.txns.length, 0);

    html += `
      <div class="tree-cat-card" id="tree-cat-${meta.id}">
        <!-- Level 1: Category Header -->
        <div class="tree-cat-header" onclick="toggleExpenseCategory('${meta.id}')">
          <div style="display:flex; align-items:center; gap:12px; flex:1; flex-wrap:wrap;">
            <span class="chevron-icon ${isCatOpen ? 'open' : ''}" id="chevron-${meta.id}">▶</span>
            <span style="font-size:20px; line-height:1;">${meta.icon}</span>
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:15px; font-weight:900; color:var(--text-0);">${meta.title}</span>
                <span class="mono badge ${meta.badgeClass}" style="font-size:11px; padding:2px 8px;">[${meta.codeRange}]</span>
              </div>
              <div style="font-size:11.5px; color:var(--text-3); margin-top:2px; font-weight:600;">
                <span>${subAccCount} بند تفصيلي</span> • <span>${txnCount} حركة مسجلة</span>
              </div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:16px;">
            <!-- Mini Progress Bar -->
            <div class="no-print" style="width:90px; text-align:left; display:none; @media (min-width:640px){ display:block; }">
              <div style="font-size:10.5px; font-weight:800; color:var(--text-2); margin-bottom:3px; text-align:left;" class="mono">${catPct}%</div>
              <div style="width:100%; height:6px; background:rgba(0,0,0,0.06); border-radius:3px; overflow:hidden;">
                <div style="width:${Math.min(100, Math.max(2, catPct))}%; height:100%; background:${meta.color}; border-radius:3px;"></div>
              </div>
            </div>

            <div style="text-align:left;">
              <div class="mono font-bold" style="font-size:16.5px; color:${meta.color};">${formatCurrency(group.total)}</div>
              <div class="mono" style="font-size:11px; color:var(--text-3); font-weight:700;">${catPct}% من الإجمالي</div>
            </div>
          </div>
        </div>

        <!-- Level 2: Sub-Accounts List -->
        <div class="tree-cat-body" id="body-${meta.id}" style="display:${isCatOpen ? 'block' : 'none'};">
    `;

    // Sort sub-accounts by total descending
    const sortedSubKeys = Object.keys(group.subAccounts).sort((a, b) => group.subAccounts[b].total - group.subAccounts[a].total);

    sortedSubKeys.forEach(subKey => {
      const sub = group.subAccounts[subKey];
      const subDomId = `${meta.id}_${sub.code.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const isSubOpen = _expandedSubAccounts.has(subDomId);
      const subPct = group.total > 0 ? ((sub.total / group.total) * 100).toFixed(1) : "0.0";

      html += `
        <div class="tree-sub-card" id="subcard-${subDomId}">
          <!-- Sub-Account Header -->
          <div class="tree-sub-header" onclick="toggleExpenseSubAccount('${subDomId}')">
            <div style="display:flex; align-items:center; gap:10px; flex:1; flex-wrap:wrap;">
              <span class="chevron-icon ${isSubOpen ? 'open' : ''}" id="chevron-${subDomId}">▶</span>
              <span class="mono badge" style="font-size:11px; font-weight:800; background:rgba(30,58,138,0.06); color:#1e3a8a; border:1px solid rgba(30,58,138,0.18);">
                ${sub.code}
              </span>
              <span style="font-size:13.5px; font-weight:800; color:var(--text-0);">${sub.name}</span>
              <span style="font-size:11px; color:var(--text-3); font-weight:600;">(${sub.txns.length} حركة)</span>
            </div>

            <div style="display:flex; align-items:center; gap:12px;">
              <span class="mono" style="font-size:11px; color:var(--text-3); font-weight:700;">(${subPct}% من الفئة)</span>
              <span class="mono font-bold" style="font-size:14.5px; color:#dc2626;">${formatCurrency(sub.total)}</span>
            </div>
          </div>

          <!-- Level 3: Detailed Transactions Table -->
          <div class="tree-sub-body" id="body-${subDomId}" style="display:${isSubOpen ? 'block' : 'none'};">
            <div style="overflow-x:auto;">
              <table class="data-dense" style="width:100%; margin:0; border-collapse:collapse; font-size:12px;">
                <thead>
                  <tr style="background:var(--bg-1); border-bottom:1.5px solid var(--border-soft); color:var(--text-2);">
                    <th style="width:32px; text-align:center;">#</th>
                    <th style="width:90px; text-align:right;">التاريخ</th>
                    <th style="width:110px; text-align:right;">رقم السند/القيد</th>
                    <th style="width:125px; text-align:right;">طريقة الصرف</th>
                    <th style="width:130px; text-align:right;">مركز التكلفة / المندوب</th>
                    <th style="min-width:180px; text-align:right;">البيان والملاحظات</th>
                    <th style="width:110px; text-align:left; color:#dc2626;">المبلغ</th>
                    <th style="width:50px; text-align:center;" class="no-print">معاينة</th>
                  </tr>
                </thead>
                <tbody>
      `;

      sub.txns.forEach((t, tIdx) => {
        let methodBadge = "badge-journal";
        let methodIcon = "📝";
        if (t.method === "cash") { methodBadge = "badge-cash"; methodIcon = "💵"; }
        else if (t.method === "bank") { methodBadge = "badge-bank"; methodIcon = "🏦"; }

        html += `
          <tr style="border-bottom:1px solid var(--border-soft); transition:background 0.15s ease;">
            <td style="text-align:center; font-size:11px; color:var(--text-3);">${tIdx + 1}</td>
            <td class="mono font-bold" style="white-space:nowrap; font-size:11.5px;">${t.date || "—"}</td>
            <td class="mono font-bold" style="white-space:nowrap;">
              <span class="badge" style="font-size:11px; background:rgba(30,58,138,0.06); color:#1e3a8a; border:1px solid rgba(30,58,138,0.18);">
                ${t.refNumber}
              </span>
            </td>
            <td>
              <span class="badge ${methodBadge}" style="font-size:11px; font-weight:700;">
                ${methodIcon} ${t.sourceName}
              </span>
            </td>
            <td>
              <span style="font-size:11.5px; color:${t.costCenterName !== '—' ? '#0f766e' : 'var(--text-3)'}; font-weight:${t.costCenterName !== '—' ? '700' : 'normal'};">
                ${t.costCenterName !== '—' ? '🏷️ ' + t.costCenterName : '—'}
              </span>
            </td>
            <td style="font-size:11.5px; max-width:260px; line-height:1.4;" title="${(t.notes || '').replace(/"/g, '&quot;')}">
              ${t.notes || "—"}
            </td>
            <td class="mono font-bold" style="text-align:left; color:#dc2626; font-size:12.5px; white-space:nowrap;">
              ${formatCurrency(t.amount)}
            </td>
            <td class="no-print" style="text-align:center; white-space:nowrap;">
              <button type="button" class="btn btn-icon sm btn-ghost" onclick="viewExpenseTrackingDetail('${t.id}')" title="معاينة تفاصيل الحركة" style="color:var(--brand); font-size:13px; padding:2px 6px;">
                👁️
              </button>
            </td>
          </tr>
        `;
      });

      html += `
                </tbody>
                <tfoot>
                  <tr style="background:var(--bg-1); border-top:1.5px solid var(--border-soft); font-weight:800; font-size:11.5px;">
                    <td colspan="6" style="text-align:right; padding:6px 12px; color:var(--text-2);">
                      مجموع بند [${sub.name}] (${sub.txns.length} حركة)
                    </td>
                    <td class="mono font-bold" style="text-align:left; color:#dc2626; padding:6px 12px;">
                      ${formatCurrency(sub.total)}
                    </td>
                    <td class="no-print"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * ── Render 2: Flat Transactions Table View (جدول الحركات المسطح) ──
 */
function renderTableView(filtered, total, totalLogistics, totalPayroll, totalAdmin, totalFin) {
  const tbody = document.getElementById("et-tbody");
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:36px;color:var(--text-2);font-size:13px;">لا توجد أي مصروفات تطابق الفلاتر المحددة</td></tr>`;
    const tfoot = document.getElementById("et-tfoot");
    if (tfoot) tfoot.innerHTML = "";
    return;
  }

  tbody.innerHTML = filtered.map((e, idx) => {
    const meta = getMainCategoryMeta(e.expenseClass);
    let methodBadge = "badge-journal";
    let methodIcon = "📝";
    if (e.method === "cash") { methodBadge = "badge-cash"; methodIcon = "💵"; }
    else if (e.method === "bank") { methodBadge = "badge-bank"; methodIcon = "🏦"; }

    return `
      <tr style="transition:background 0.15s ease;">
        <td style="text-align:center; font-size:11px; color:var(--text-3); width:36px;">${idx + 1}</td>
        <td class="mono font-bold" style="white-space:nowrap; font-size:12px;">${e.date || "—"}</td>
        <td class="mono font-bold" style="white-space:nowrap;">
          <span class="badge" style="font-size:11.5px; background:rgba(30,58,138,0.08); color:#1e3a8a; border:1px solid rgba(30,58,138,0.2);">
            ${e.refNumber}
          </span>
        </td>
        <td>
          <div style="font-weight:700; font-size:12.5px; color:var(--text-0);">${e.accountName}</div>
          ${e.accountCode ? `<div class="mono" style="font-size:11px; color:var(--text-3);">${e.accountCode}</div>` : ""}
        </td>
        <td>
          <span class="badge ${meta.badgeClass}" style="font-size:11.5px; font-weight:700;">
            ${meta.icon} ${meta.title}
          </span>
        </td>
        <td>
          <span class="badge ${methodBadge}" style="font-size:11.5px; font-weight:700;">
            ${methodIcon} ${e.sourceName}
          </span>
        </td>
        <td>
          <span style="font-size:12px; color:${e.costCenterName !== '—' ? '#0f766e' : 'var(--text-3)'}; font-weight:${e.costCenterName !== '—' ? '700' : 'normal'};">
            ${e.costCenterName !== '—' ? '🏷️ ' + e.costCenterName : '—'}
          </span>
        </td>
        <td style="font-size:12px; max-width:280px; line-height:1.4;" title="${(e.notes || '').replace(/"/g, '&quot;')}">
          ${e.notes || "—"}
        </td>
        <td class="mono font-bold" style="text-align:left; color:#dc2626; font-size:13.5px; white-space:nowrap;">
          ${formatCurrency(e.amount)}
        </td>
        <td class="no-print" style="text-align:center; white-space:nowrap;">
          <button type="button" class="btn btn-icon sm btn-ghost" onclick="viewExpenseTrackingDetail('${e.id}')" title="معاينة تفاصيل الحركة" style="color:var(--brand); font-size:14px;">
            👁️
          </button>
        </td>
      </tr>
    `;
  }).join("");

  const tfoot = document.getElementById("et-tfoot");
  if (tfoot) {
    tfoot.innerHTML = `
      <tr style="background:var(--bg-2); border-top:2px solid var(--border-soft); font-weight:800;">
        <td colspan="3" style="text-align:right; padding:12px 16px; font-size:13px;">
          إجمالي المصروفات المعروضة (${filtered.length} حركة)
        </td>
        <td colspan="5" style="text-align:left; font-size:12px; color:var(--text-2); padding:12px 16px;">
          لوجستيات ونقل: <strong style="color:#059669;">${formatCurrency(totalLogistics)}</strong> |
          رواتب وعمالة: <strong style="color:#1d4ed8;">${formatCurrency(totalPayroll)}</strong> |
          إدارية: <strong style="color:#6d28d9;">${formatCurrency(totalAdmin)}</strong> |
          تمويلية وإهلاك: <strong style="color:#d97706;">${formatCurrency(totalFin)}</strong>
        </td>
        <td class="mono font-bold" style="text-align:left; font-size:15px; color:#dc2626; padding:12px 16px;">
          ${formatCurrency(total)}
        </td>
        <td class="no-print"></td>
      </tr>
    `;
  }
}

/**
 * ── View Switcher & Tree Accordion Logic ─────────────────────
 */
function switchExpenseViewMode(mode) {
  _currentViewMode = mode;
  const treeContainer = document.getElementById("et-tree-container");
  const tableCard = document.getElementById("et-table-card");
  const treeControls = document.getElementById("et-tree-controls");
  const btnTree = document.getElementById("et-btn-mode-tree");
  const btnTable = document.getElementById("et-btn-mode-table");

  if (mode === "tree") {
    if (treeContainer) treeContainer.style.display = "block";
    if (tableCard) tableCard.style.display = "none";
    if (treeControls) treeControls.style.display = "flex";
    btnTree?.classList.add("active");
    btnTable?.classList.remove("active");
  } else {
    if (treeContainer) treeContainer.style.display = "none";
    if (tableCard) tableCard.style.display = "block";
    if (treeControls) treeControls.style.display = "none";
    btnTable?.classList.add("active");
    btnTree?.classList.remove("active");
  }
}

function toggleExpenseCategory(catId) {
  const body = document.getElementById(`body-${catId}`);
  const chevron = document.getElementById(`chevron-${catId}`);
  if (!body) return;

  const isOpen = body.style.display !== "none";
  if (isOpen) {
    body.style.display = "none";
    chevron?.classList.remove("open");
    _expandedCategories.delete(catId);
  } else {
    body.style.display = "block";
    chevron?.classList.add("open");
    _expandedCategories.add(catId);
  }
}

function toggleExpenseSubAccount(subDomId) {
  const body = document.getElementById(`body-${subDomId}`);
  const chevron = document.getElementById(`chevron-${subDomId}`);
  if (!body) return;

  const isOpen = body.style.display !== "none";
  if (isOpen) {
    body.style.display = "none";
    chevron?.classList.remove("open");
    _expandedSubAccounts.delete(subDomId);
  } else {
    body.style.display = "block";
    chevron?.classList.add("open");
    _expandedSubAccounts.add(subDomId);
  }
}

function expandAllTreeNodes() {
  document.querySelectorAll(".tree-cat-body").forEach(el => el.style.display = "block");
  document.querySelectorAll(".tree-sub-body").forEach(el => el.style.display = "block");
  document.querySelectorAll(".chevron-icon").forEach(el => el.classList.add("open"));
  _expandedCategories = new Set(["cat_transport", "cat_payroll", "cat_admin", "cat_finance", "cat_deprec"]);
  document.querySelectorAll("[id^='subcard-']").forEach(el => {
    _expandedSubAccounts.add(el.id.replace("subcard-", ""));
  });
}

function collapseAllTreeNodes() {
  document.querySelectorAll(".tree-cat-body").forEach(el => el.style.display = "none");
  document.querySelectorAll(".tree-sub-body").forEach(el => el.style.display = "none");
  document.querySelectorAll(".chevron-icon").forEach(el => el.classList.remove("open"));
  _expandedCategories.clear();
  _expandedSubAccounts.clear();
}

/**
 * ── Render Interactive Chart.js Visualizations ────────────────
 */
function renderCharts(filteredExpenses) {
  if (_categoryChartInstance) {
    _categoryChartInstance.destroy();
    _categoryChartInstance = null;
  }
  if (_trendChartInstance) {
    _trendChartInstance.destroy();
    _trendChartInstance = null;
  }

  const catCanvas = document.getElementById("et-category-chart");
  const trendCanvas = document.getElementById("et-trend-chart");
  if (!catCanvas || !trendCanvas) return;

  if (filteredExpenses.length === 0) return;

  // 1. Group by Account for Top Accounts Bar Chart
  const catTotals = {};
  filteredExpenses.forEach(e => {
    const key = e.accountName || "مصروف عام";
    catTotals[key] = (catTotals[key] || 0) + parseFloat(e.amount || 0);
  });

  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const topCats = sortedCats.slice(0, 8);
  const otherSum = sortedCats.slice(8).reduce((s, c) => s + c[1], 0);
  if (otherSum > 0) {
    topCats.push(["أخرى", otherSum]);
  }

  const catLabels = topCats.map(c => c[0]);
  const catData = topCats.map(c => c[1]);

  _categoryChartInstance = new Chart(catCanvas, {
    type: 'bar',
    data: {
      labels: catLabels,
      datasets: [{
        label: 'المبلغ (ر.س)',
        data: catData,
        backgroundColor: [
          '#059669', '#1d4ed8', '#6d28d9', '#d97706',
          '#06b6d4', '#ec4899', '#f97316', '#64748b', '#94a3b8'
        ],
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 32
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` الصرف: ${formatCurrency(ctx.raw || 0)}`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
      }
    }
  });

  // 2. Group by Period for Multi-Line Trend Chart
  const from = document.getElementById("et-from")?.value || "";
  const to = document.getElementById("et-to")?.value || "";
  let groupByDay = false;
  if (from && to) {
    const diffDays = Math.ceil(Math.abs(new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24));
    if (diffDays <= 45) groupByDay = true;
  }

  const trendData = {};
  const periodKeysSet = new Set();
  filteredExpenses.forEach(e => {
    if (!e.date) return;
    const periodKey = groupByDay ? e.date : e.date.substring(0, 7);
    periodKeysSet.add(periodKey);

    if (!trendData[periodKey]) {
      trendData[periodKey] = {
        "نقل ولوجستيات": 0,
        "موظفين وعمالة": 0,
        "إدارية وعمومية": 0,
        "تمويلية وبنكية": 0,
        "إهلاك ومخصصات": 0
      };
    }
    if (trendData[periodKey][e.expenseClass] !== undefined) {
      trendData[periodKey][e.expenseClass] += parseFloat(e.amount || 0);
    }
  });

  const sortedPeriods = Array.from(periodKeysSet).sort();
  const classes = ["نقل ولوجستيات", "موظفين وعمالة", "إدارية وعمومية", "تمويلية وبنكية"];
  const colorsMap = {
    "نقل ولوجستيات": "#059669",
    "موظفين وعمالة": "#1d4ed8",
    "إدارية وعمومية": "#6d28d9",
    "تمويلية وبنكية": "#d97706"
  };

  const datasets = classes.map(cls => ({
    label: cls,
    data: sortedPeriods.map(p => trendData[p]?.[cls] || 0),
    borderColor: colorsMap[cls],
    backgroundColor: colorsMap[cls] + '15',
    borderWidth: 2.5,
    tension: 0.3,
    pointRadius: sortedPeriods.length > 20 ? 1 : 4,
    pointHoverRadius: 6,
    fill: true
  }));

  _trendChartInstance = new Chart(trendCanvas, {
    type: 'line',
    data: {
      labels: sortedPeriods,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, usePointStyle: true, font: { size: 11, weight: 'bold' } }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw || 0)}`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
      }
    }
  });
}

/**
 * ── View Transaction Detail Modal ─────────────────────────────
 */
let _activeVoucherDetail = null;

function viewExpenseTrackingDetail(id) {
  const item = _expenses.find(e => e.id === id);
  if (!item) return;

  _activeVoucherDetail = item;
  const meta = getMainCategoryMeta(item.expenseClass);

  const titleEl = document.getElementById("et-vm-title");
  const bodyEl = document.getElementById("et-vm-body");

  if (titleEl) titleEl.textContent = `تفاصيل حركة المصروف [${item.refNumber}]`;
  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="background:var(--bg-2); border:1.5px solid var(--border-soft); border-radius:12px; padding:16px; margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px dashed var(--border); padding-bottom:8px;">
          <div>
            <span style="font-size:11.5px; color:var(--text-3); font-weight:700;">رقم المرجع:</span>
            <span class="mono font-bold" style="font-size:14px; color:#1e3a8a; margin-right:6px;">${item.refNumber}</span>
          </div>
          <div>
            <span style="font-size:11.5px; color:var(--text-3); font-weight:700;">التاريخ:</span>
            <span class="mono font-bold" style="font-size:13px; color:var(--text-0); margin-right:6px;">${item.date}</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:12.5px;">
          <div>
            <div style="font-size:11px; color:var(--text-3); font-weight:700;">الحساب المدين / البند:</div>
            <div style="font-weight:800; color:var(--text-0); margin-top:2px;">${item.accountName}</div>
            <div class="mono" style="font-size:11px; color:var(--text-3);">${item.accountCode || '—'}</div>
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-3); font-weight:700;">التصنيف المحاسبي:</div>
            <div style="font-weight:800; color:${meta.color}; margin-top:2px;">${meta.icon} ${meta.title}</div>
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-3); font-weight:700;">طريقة الصرف (الدفع من):</div>
            <div style="font-weight:800; color:var(--text-0); margin-top:2px;">${item.sourceName}</div>
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-3); font-weight:700;">مركز التكلفة / المندوب / السيارة:</div>
            <div style="font-weight:800; color:var(--text-0); margin-top:2px;">${item.costCenterName}</div>
          </div>
        </div>
      </div>

      <div style="background:var(--bg-2); border:1.5px solid var(--border-soft); border-radius:12px; padding:16px; margin-bottom:14px;">
        <div style="font-size:11px; color:var(--text-3); font-weight:700; margin-bottom:4px;">البيان والملاحظات:</div>
        <div style="font-size:13px; color:var(--text-0); font-weight:600; line-height:1.5;">${item.notes || 'لا توجد ملاحظات إضافية'}</div>
      </div>

      <div style="background:rgba(239,68,68,0.06); border:1.5px solid rgba(239,68,68,0.25); border-radius:12px; padding:16px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:13.5px; font-weight:800; color:#dc2626;">المبلغ الإجمالي المصروف:</span>
        <span class="mono font-bold" style="font-size:20px; color:#dc2626;">${formatCurrency(item.amount)}</span>
      </div>
    `;
  }

  if (typeof openModal === "function") openModal("et-voucher-modal");
}

function printExpenseTrackingVoucherModal() {
  if (!_activeVoucherDetail) return;
  const item = _activeVoucherDetail;

  let co = {};
  try {
    const raw = localStorage.getItem("idham_company");
    if (raw) co = JSON.parse(raw);
    else if (window.ERP_COMPANY) co = window.ERP_COMPANY;
  } catch {}

  const win = window.open("", "_blank", "width=850,height=700");
  win.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>سند صرف - ${item.refNumber}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 24px; color: #1e293b; direction: rtl; }
        .box { border: 2px solid #1e3a8a; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 16px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
        .row-item { background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .lbl { font-size: 11px; color: #64748b; font-weight: bold; margin-bottom: 3px; }
        .val { font-size: 13.5px; font-weight: 800; color: #0f172a; }
        .amount-card { background: #fef2f2; border: 2px solid #ef4444; border-radius: 10px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; }
        .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; }
        .sign-col { text-align: center; width: 180px; }
        .sign-line { border-bottom: 1px dashed #64748b; margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="header">
          <div>
            <h2 style="margin:0; color:#1e3a8a;">${co.name || "مؤسسة إدهام للمواد الغذائية"}</h2>
            <div style="font-size:11px; color:#64748b; margin-top:4px;">سجل تجاري: ${co.crNumber || '—'} | الرقم الضريبي: ${co.vatNumber || '—'}</div>
          </div>
          <div style="text-align:left;">
            <h3 style="margin:0; color:#dc2626;">سـنـد صـرف</h3>
            <div style="font-family:monospace; font-size:14px; font-weight:bold; color:#1e3a8a; margin-top:4px;">${item.refNumber}</div>
            <div style="font-size:11px; color:#64748b; margin-top:2px;">التاريخ: ${item.date}</div>
          </div>
        </div>

        <div class="grid">
          <div class="row-item"><div class="lbl">الحساب المدين / البند:</div><div class="val">${item.accountName} (${item.accountCode || '—'})</div></div>
          <div class="row-item"><div class="lbl">التصنيف المحاسبي:</div><div class="val">${item.expenseClass}</div></div>
          <div class="row-item"><div class="lbl">طريقة الدفع (الحساب الدائن):</div><div class="val">${item.sourceName}</div></div>
          <div class="row-item"><div class="lbl">مركز التكلفة / المندوب:</div><div class="val">${item.costCenterName}</div></div>
        </div>

        <div class="row-item" style="margin-bottom:16px;">
          <div class="lbl">البيان والملاحظات:</div>
          <div class="val" style="font-weight:600;">${item.notes || '—'}</div>
        </div>

        <div class="amount-card">
          <span style="font-size:14px; font-weight:800; color:#991b1b;">المبلغ المصروف:</span>
          <span style="font-size:22px; font-weight:900; color:#dc2626; font-family:monospace;">${formatCurrency(item.amount)}</span>
        </div>

        <div class="signatures">
          <div class="sign-col"><div class="lbl">المحاسب المسؤول</div><div class="sign-line"></div></div>
          <div class="sign-col"><div class="lbl">المدير المالي</div><div class="sign-line"></div></div>
          <div class="sign-col"><div class="lbl">المستلم / صاحب الصرف</div><div class="sign-line"></div></div>
        </div>
      </div>
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `);
  win.document.close();
}

/**
 * ── Export to Excel ───────────────────────────────────────────
 */
async function exportExpenseTrackingExcel() {
  const from = document.getElementById("et-from")?.value || "";
  const to = document.getElementById("et-to")?.value || "";
  const filtered = [..._expenses];

  if (filtered.length === 0) {
    if (window.showToast) window.showToast("لا توجد بيانات لتصديرها", "warn");
    return;
  }

  const headers = ["#", "التاريخ", "رقم السند/القيد", "كود الحساب", "اسم الحساب المدين", "التصنيف الرئيسي", "طريقة الصرف", "مركز التكلفة", "البيان والملاحظات", "المبلغ (ر.س)"];
  const rows = filtered.map((e, i) => [
    i + 1,
    e.date || "",
    e.refNumber || "",
    e.accountCode || "",
    e.accountName || "",
    e.expenseClass || "",
    e.sourceName || "",
    e.costCenterName || "",
    e.notes || "",
    parseFloat(e.amount || 0)
  ]);

  const total = filtered.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  rows.push(["", "", "", "", "الإجمالي العام لمصروفات الشركة", "", "", "", "", total]);

  await exportToExcel({
    title: `تتبع_مصروفات_الشركة_${from}_إلى_${to}`,
    headers,
    rows,
    colWidths: [6, 12, 16, 12, 26, 18, 18, 18, 32, 16]
  });

  if (window.showToast) window.showToast("تم تصدير ملف الإكسيل بنجاح 📊", "success");
}

/**
 * ── Export to PDF & Print ─────────────────────────────────────
 */
function exportExpenseTrackingPDF() {
  if (typeof exportPagePDF === "function") {
    exportPagePDF("#et-tree-container", "تقرير_تتبع_مصروفات_الشركة_التفصيلي");
  } else {
    window.print();
  }
}

function printExpenseTrackingReport() {
  window.print();
}

function populatePrintHeader(from, to) {
  let co = {};
  try {
    const raw = localStorage.getItem("idham_company");
    if (raw) co = JSON.parse(raw);
    else if (window.ERP_COMPANY) co = window.ERP_COMPANY;
  } catch {}

  const logoEl = document.getElementById("et-print-logo");
  if (logoEl) {
    if (co.logoBase64 || co.logoUrl) {
      logoEl.src = co.logoBase64 || co.logoUrl;
      logoEl.style.display = "block";
    } else {
      logoEl.style.display = "none";
    }
  }

  const nameEl = document.getElementById("et-print-co-name");
  if (nameEl) nameEl.textContent = co.name || "مؤسسة إدهام للمواد الغذائية";

  const detailsEl = document.getElementById("et-print-co-details");
  if (detailsEl) {
    const parts = [];
    if (co.address) parts.push(`📍 ${co.address}`);
    if (co.phone) parts.push(`📞 ${co.phone}`);
    if (co.vatNumber) parts.push(`🔢 الرقم الضريبي: ${co.vatNumber}`);
    if (co.crNumber) parts.push(`📋 السجل التجاري: ${co.crNumber}`);
    detailsEl.textContent = parts.join(" | ");
  }

  const periodEl = document.getElementById("et-print-period");
  if (periodEl) periodEl.textContent = `الفترة من ${from || "البداية"} إلى ${to || "اليوم"}`;
}
