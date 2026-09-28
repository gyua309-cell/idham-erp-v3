// ============================================================
// IDHAM ERP — Advanced Expense Analysis & Cost Centers
// تقرير تحليل المصروفات المتقدم ومراكز التكلفة والتحليل الرأسي
// ============================================================
import { COLS, getAll, query, orderBy, limit, getDocs, where, doc, getDoc } from "../../utils/db.js";
import { formatCurrency, formatPercent, formatDate, startOfMonth, todayString, debounce } from "../../utils/formatters.js";
import { exportToExcel } from "../../utils/excel.js";
import { db, COMPANY_ID } from "../../firebase-config.js";

let _accounts = [];
let _costCenters = [];
let _journalEntries = [];
let _calculatedData = null;
let _activeScope = "opex"; // "opex" (Default), "selling", "admin", "all_with_cogs"
let _activeCostCenter = "all";
let _searchQuery = "";
let _datePreset = "month";
let _activeModalAccCode = null;
let _modalSearchQuery = "";
let _sortBy = "amount_desc"; // "amount_desc", "amount_asc", "pct_rev_desc", "name_asc"

export async function render(container, user) {
  const currentMonthStart = startOfMonth();
  const currentToday = todayString();

  container.innerHTML = `
    <!-- Top Filter Bar -->
    <div class="filterbar no-print" style="flex-wrap:wrap; gap:12px; align-items:flex-end; background:var(--bg-1); padding:14px 18px; border-radius:14px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); margin-bottom:20px;">
      
      <!-- Date Range -->
      <div class="date-range-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">من تاريخ</label>
        <input type="date" id="exp-from" value="${currentMonthStart}" onchange="onExpDateChange()" style="padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12.5px;" />
      </div>
      <div class="date-range-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">إلى تاريخ</label>
        <input type="date" id="exp-to" value="${currentToday}" onchange="onExpDateChange()" style="padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12.5px;" />
      </div>

      <!-- Quick Date Presets -->
      <div style="display:flex; gap:4px; align-items:center; flex-wrap:wrap;">
        <button class="btn btn-sm btn-ghost exp-preset-btn" data-preset="today" onclick="setExpDatePreset('today')" style="font-size:11px; padding:5px 9px;">اليوم</button>
        <button class="btn btn-sm btn-ghost exp-preset-btn" data-preset="yesterday" onclick="setExpDatePreset('yesterday')" style="font-size:11px; padding:5px 9px;">أمس</button>
        <button class="btn btn-sm btn-ghost exp-preset-btn" data-preset="week" onclick="setExpDatePreset('week')" style="font-size:11px; padding:5px 9px;">هذا الأسبوع</button>
        <button class="btn btn-sm btn-ghost exp-preset-btn active" data-preset="month" onclick="setExpDatePreset('month')" style="font-size:11px; padding:5px 9px;">هذا الشهر</button>
        <button class="btn btn-sm btn-ghost exp-preset-btn" data-preset="last_month" onclick="setExpDatePreset('last_month')" style="font-size:11px; padding:5px 9px;">الشهر الماضي</button>
        <button class="btn btn-sm btn-ghost exp-preset-btn" data-preset="quarter" onclick="setExpDatePreset('quarter')" style="font-size:11px; padding:5px 9px;">الربع الحالي</button>
        <button class="btn btn-sm btn-ghost exp-preset-btn" data-preset="year" onclick="setExpDatePreset('year')" style="font-size:11px; padding:5px 9px;">هذا العام</button>
      </div>

      <!-- Scope Filter (نطاق المصروفات) -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">نطاق التحليل المحاسبي</label>
        <select id="exp-scope" onchange="onExpScopeChange()" style="min-width:210px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px; font-weight:600;">
          <option value="opex" selected>المصروفات التشغيلية والإدارية (OpEx)</option>
          <option value="selling">مصروفات البيع والتوزيع (5-3)</option>
          <option value="admin">المصروفات الإدارية والعمومية (5-2)</option>
          <option value="all_with_cogs">جميع المصروفات شاملة تكلفة المبيعات (COGS)</option>
        </select>
      </div>

      <!-- Cost Center Filter -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">مركز التكلفة / المندوب</label>
        <select id="exp-cc-filter" onchange="onExpCCChange()" style="min-width:180px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px;">
          <option value="all">الكل (جميع مراكز التكلفة)</option>
        </select>
      </div>

      <!-- Search Input -->
      <div style="flex:1; min-width:160px;">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">بحث في المصروفات</label>
        <input type="text" id="exp-search" placeholder="كود أو اسم الحساب..." oninput="onExpSearchInput(this.value)" style="width:100%; padding:6px 12px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px;" />
      </div>

      <!-- Export & Print Actions -->
      <div style="margin-right:auto; display:flex; gap:8px; align-items:center;">
        <button class="btn btn-secondary btn-sm" onclick="exportExpensesExcel()" style="font-weight:700; display:inline-flex; align-items:center; gap:6px; border-radius:8px;">
          <span>📊</span> تصدير Excel
        </button>
        <button class="btn btn-secondary btn-sm" onclick="printExpenseAnalysisPDF()" style="font-weight:700; display:inline-flex; align-items:center; gap:6px; border-radius:8px;">
          <span>🖨️</span> طباعة / PDF
        </button>
      </div>
    </div>

    <!-- Main Page Content -->
    <div class="page-content" style="padding:0 4px;">
      
      <!-- Page Header with Subtitle info -->
      <div class="page-header" style="margin-bottom:18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h1 class="page-title" style="font-size:21px; font-weight:900; color:var(--text-1); margin-bottom:3px; display:flex; align-items:center; gap:8px;">
            <span>💼</span> تقرير تحليل المصروفات ومراكز التكلفة
          </h1>
          <p class="page-subtitle" id="exp-period-label" style="font-size:12.5px; color:var(--text-2); font-weight:600;">
            جاري تحميل البيانات المالية...
          </p>
        </div>
        <div id="exp-scope-badge-container">
          <!-- Dynamic Scope Badge -->
        </div>
      </div>

      <!-- KPIs Grid (5 Cards) -->
      <div class="kpi-grid mb-24" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:14px; margin-bottom:24px;">
        
        <!-- KPI 1: Total Expenses -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:16px 18px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar bad" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#ef4444,#dc2626);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kpi-label" style="font-size:12px; font-weight:700; color:var(--text-2); margin-bottom:4px;" id="kpi-exp-title">إجمالي المصروفات (OpEx)</div>
              <div class="kpi-value mono" id="kpi-exp-total" style="font-size:20px; font-weight:900; color:#ef4444;">—</div>
            </div>
            <div style="width:40px; height:40px; border-radius:10px; background:rgba(239,68,68,0.12); display:flex; align-items:center; justify-content:center; font-size:18px;">💸</div>
          </div>
          <div class="kpi-subtext" id="kpi-exp-subtitle" style="font-size:11px; color:var(--text-3); margin-top:8px; font-weight:600;">
            مصاريف الفترة التشغيلية والإدارية
          </div>
        </div>

        <!-- KPI 2: Net Revenue -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:16px 18px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar indigo" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#6366f1,#4f46e5);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kpi-label" style="font-size:12px; font-weight:700; color:var(--text-2); margin-bottom:4px;">صافي المبيعات والإيرادات</div>
              <div class="kpi-value mono" id="kpi-rev-total" style="font-size:20px; font-weight:900; color:var(--text-1);">—</div>
            </div>
            <div style="width:40px; height:40px; border-radius:10px; background:rgba(99,102,241,0.12); display:flex; align-items:center; justify-content:center; font-size:18px;">📈</div>
          </div>
          <div class="kpi-subtext" style="font-size:11px; color:var(--text-3); margin-top:8px; font-weight:600;">
            إيراد النشاط بعد خصم المردودات
          </div>
        </div>

        <!-- KPI 3: Expense to Revenue Ratio -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:16px 18px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar lime" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#10b981,#059669);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kpi-label" style="font-size:12px; font-weight:700; color:var(--text-2); margin-bottom:4px;">نسبة المصروفات للإيراد</div>
              <div class="kpi-value mono" id="kpi-exp-ratio" style="font-size:20px; font-weight:900; color:#10b981;">—</div>
            </div>
            <div style="width:40px; height:40px; border-radius:10px; background:rgba(16,185,129,0.12); display:flex; align-items:center; justify-content:center; font-size:18px;">📊</div>
          </div>
          <div class="kpi-subtext" id="kpi-ratio-subtitle" style="font-size:11px; color:var(--text-3); margin-top:8px; font-weight:600;">
            التحليل الرأسي لكفاءة الإنفاق
          </div>
        </div>

        <!-- KPI 4: Daily Burn Rate -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:16px 18px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar warn" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#f59e0b,#d97706);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kpi-label" style="font-size:12px; font-weight:700; color:var(--text-2); margin-bottom:4px;">معدل الصرف اليومي</div>
              <div class="kpi-value mono" id="kpi-burn-rate" style="font-size:20px; font-weight:900; color:#f59e0b;">—</div>
            </div>
            <div style="width:40px; height:40px; border-radius:10px; background:rgba(245,158,11,0.12); display:flex; align-items:center; justify-content:center; font-size:18px;">🔥</div>
          </div>
          <div class="kpi-subtext" id="kpi-burn-subtitle" style="font-size:11px; color:var(--text-3); margin-top:8px; font-weight:600;">
            متوسط التكلفة لكل يوم
          </div>
        </div>

        <!-- KPI 5: Top Expense Driver -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:16px 18px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar purple" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#8b5cf6,#7c3aed);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div style="overflow:hidden; max-width:80%;">
              <div class="kpi-label" style="font-size:12px; font-weight:700; color:var(--text-2); margin-bottom:4px;">أكبر بند استهلاكاً للميزانية</div>
              <div class="kpi-value" id="kpi-top-driver" style="font-size:15px; font-weight:800; color:var(--text-1); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">—</div>
            </div>
            <div style="width:40px; height:40px; border-radius:10px; background:rgba(139,92,246,0.12); display:flex; align-items:center; justify-content:center; font-size:18px;">🏆</div>
          </div>
          <div class="kpi-subtext" id="kpi-top-driver-sub" style="font-size:11px; color:var(--text-3); margin-top:8px; font-weight:600;">
            —
          </div>
        </div>

      </div>

      <!-- Visual Composition Bar Card -->
      <div class="card mb-24" style="background:var(--bg-card); border-radius:14px; padding:18px 22px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
          <div>
            <h3 style="font-family:var(--font-heading); font-size:15px; font-weight:800; margin:0 0 2px; color:var(--text-1); display:flex; align-items:center; gap:8px;">
              <span>📊</span> التوزيع الهيكلي والنسبي لبنود المصروفات
            </h3>
            <p style="font-size:12px; color:var(--text-3); margin:0;">
              الوزن النسبي لأهم بنود المصروفات مقارنة بالميزانية التشغيلية
            </p>
          </div>
          <div id="exp-stacked-total-badge" style="font-size:12px; font-weight:700; padding:4px 10px; background:var(--bg-2); border-radius:8px; color:var(--text-2);">
            —
          </div>
        </div>

        <!-- Stacked Percentage Bar -->
        <div id="exp-composition-bar" style="width:100%; height:22px; border-radius:8px; overflow:hidden; display:flex; background:var(--bg-3); margin-bottom:14px; box-shadow:inset 0 1px 3px rgba(0,0,0,0.1);">
          <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-3); font-size:11px;">جاري الاحتساب...</div>
        </div>

        <!-- Legend Chips -->
        <div id="exp-composition-legend" style="display:flex; flex-wrap:wrap; gap:10px 16px; font-size:12px; align-items:center;">
          <!-- Generated chips -->
        </div>
      </div>

      <!-- Main Tables Grid -->
      <div class="grid-2 gap-20" style="display:grid; grid-template-columns:1fr; gap:24px;">
        
        <!-- Table 1: Category Breakdown with Dual Ratio Analysis -->
        <div class="card" style="background:var(--bg-card); border-radius:14px; padding:18px 20px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm);">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
            <div>
              <h3 style="font-family:var(--font-heading); font-size:16px; font-weight:800; margin:0 0 3px; color:var(--text-1); display:flex; align-items:center; gap:8px;">
                <span>📑</span> تفصيل المصروفات والتحليل المالي المزدوج
              </h3>
              <p style="font-size:12px; color:var(--text-3); margin:0;">
                تحليل كل بند: نسبته من ميزانية الصرف (%) والتحليل الرأسي من المبيعات (كم هللة لكل ريال)
              </p>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <label style="font-size:12px; color:var(--text-2); font-weight:700;">ترتيب حسب:</label>
              <select id="exp-sort-select" onchange="onExpSortChange(this.value)" style="padding:4px 8px; border:1px solid var(--border); border-radius:6px; background:var(--bg-1); color:var(--text-1); font-size:11.5px; font-weight:600;">
                <option value="amount_desc" selected>الأعلى مبلغاً</option>
                <option value="amount_asc">الأقل مبلغاً</option>
                <option value="pct_rev_desc">الأعلى نسبة من المبيعات</option>
                <option value="name_asc">أبجدياً (اسم الحساب)</option>
              </select>
            </div>
          </div>

          <div class="table-container" style="overflow-x:auto;">
            <table class="data-dense" style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:var(--bg-2); border-bottom:2px solid var(--border);">
                  <th style="padding:10px 12px; text-align:right; font-size:12px; width:90px;">الكود</th>
                  <th style="padding:10px 12px; text-align:right; font-size:12px;">اسم المصروف / الحساب</th>
                  <th style="padding:10px 12px; text-align:right; font-size:12px; width:130px;">التصنيف</th>
                  <th style="padding:10px 12px; text-align:center; font-size:12px; width:75px;">الحركات</th>
                  <th style="padding:10px 12px; text-align:left; font-size:12px; width:125px;">المبلغ (ر.س)</th>
                  <th style="padding:10px 12px; text-align:center; font-size:12px; width:140px;">حصة المصروف %</th>
                  <th style="padding:10px 12px; text-align:center; font-size:12px; width:140px;">نسبته من المبيعات %</th>
                  <th style="padding:10px 12px; text-align:center; font-size:12px; width:90px;" class="no-print">إجراءات</th>
                </tr>
              </thead>
              <tbody id="exp-category-tbody">
                <tr><td colspan="8" style="text-align:center; padding:24px; color:var(--text-2);">جاري تحميل المصروفات...</td></tr>
              </tbody>
              <tfoot id="exp-category-tfoot" style="background:var(--bg-2); font-weight:800; border-top:2px solid var(--border);">
                <!-- Dynamic Totals -->
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Table 2: Cost Centers Breakdown -->
        <div class="card" style="background:var(--bg-card); border-radius:14px; padding:18px 20px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm);">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
            <div>
              <h3 style="font-family:var(--font-heading); font-size:16px; font-weight:800; margin:0 0 3px; color:var(--text-1); display:flex; align-items:center; gap:8px;">
                <span>🚚</span> توزيع المصروفات حسب مراكز التكلفة والمناديب
              </h3>
              <p style="font-size:12px; color:var(--text-3); margin:0;">
                تحليل تكاليف كل سيارة توزيع، فرع، أو قسم إداري مع البند الأكثر استهلاكاً
              </p>
            </div>
            <div id="exp-cc-count-badge" style="font-size:12px; font-weight:700; padding:4px 10px; background:var(--bg-2); border-radius:8px; color:var(--text-2);">
              —
            </div>
          </div>

          <div class="table-container" style="overflow-x:auto;">
            <table class="data-dense" style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:var(--bg-2); border-bottom:2px solid var(--border);">
                  <th style="padding:10px 12px; text-align:right; font-size:12px;">مركز التكلفة / المندوب</th>
                  <th style="padding:10px 12px; text-align:right; font-size:12px; width:120px;">النوع / التصنيف</th>
                  <th style="padding:10px 12px; text-align:center; font-size:12px; width:75px;">الحركات</th>
                  <th style="padding:10px 12px; text-align:left; font-size:12px; width:130px;">إجمالي المصروف (ر.س)</th>
                  <th style="padding:10px 12px; text-align:center; font-size:12px; width:140px;">الحصة من الإجمالي %</th>
                  <th style="padding:10px 12px; text-align:right; font-size:12px;">أعلى بند مصروف في المركز</th>
                  <th style="padding:10px 12px; text-align:center; font-size:12px; width:100px;" class="no-print">إجراءات</th>
                </tr>
              </thead>
              <tbody id="exp-cc-tbody">
                <tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-2);">جاري تحميل مراكز التكلفة...</td></tr>
              </tbody>
              <tfoot id="exp-cc-tfoot" style="background:var(--bg-2); font-weight:800; border-top:2px solid var(--border);">
                <!-- Dynamic Totals -->
              </tfoot>
            </table>
          </div>
        </div>

      </div>

    </div>

    <!-- Drill Down Modal Container -->
    <div id="exp-drilldown-modal-container"></div>
  `;

  // Attach global functions to window
  window.setExpDatePreset = setExpDatePreset;
  window.onExpDateChange = onExpDateChange;
  window.onExpScopeChange = onExpScopeChange;
  window.onExpCCChange = onExpCCChange;
  window.onExpSearchInput = debounce(onExpSearchInput, 200);
  window.onExpSortChange = onExpSortChange;
  window.openAccountDrillDown = openAccountDrillDown;
  window.closeAccountDrillDown = closeAccountDrillDown;
  window.filterByCostCenter = filterByCostCenter;
  window.exportExpensesExcel = exportExpensesExcel;
  window.exportAccountDrillDownCSV = exportAccountDrillDownCSV;
  window.printExpenseAnalysisPDF = printExpenseAnalysisPDF;
  window.onModalSearchInput = debounce(onModalSearchInput, 150);

  // Initial Data Load
  await loadExpenseAnalysisData();
}

/**
 * ── Data Fetching from Firestore ─────────────────────────────
 */
async function loadExpenseAnalysisData() {
  const from = document.getElementById("exp-from")?.value || startOfMonth();
  const to = document.getElementById("exp-to")?.value || todayString();

  const periodLabel = document.getElementById("exp-period-label");
  if (periodLabel) {
    periodLabel.innerHTML = `📅 الفترة المالية من <span style="color:var(--primary);">${formatDate(from)}</span> إلى <span style="color:var(--primary);">${formatDate(to)}</span>`;
  }

  try {
    // Load Chart of Accounts, Cost Centers, and Journal Entries in parallel
    const [accs, ccs, jeSnap] = await Promise.all([
      getAll(COLS.chartOfAccounts(), [orderBy("code")]),
      getAll(COLS.costCenters(), [orderBy("name")]),
      getDocs(query(COLS.journalEntries(), where("date", ">=", from), where("date", "<=", to), limit(3000)))
    ]);

    _accounts = accs || [];
    _costCenters = ccs || [];
    _journalEntries = jeSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Populate Cost Center dropdown
    populateCostCenterDropdown();

    // Compute metrics & render
    calculateAndRender();
  } catch (err) {
    console.error("Error loading expense analysis:", err);
    if (window.showToast) window.showToast("فشل تحميل بيانات المصروفات: " + err.message, "danger");
  }
}

/**
 * ── Helper: Populate Cost Centers Select Dropdown ───────────
 */
function populateCostCenterDropdown() {
  const select = document.getElementById("exp-cc-filter");
  if (!select) return;

  const currentVal = _activeCostCenter || "all";

  // Build sorted list
  const options = ['<option value="all">الكل (جميع مراكز التكلفة)</option>'];
  
  _costCenters.forEach(cc => {
    const typeLabel = cc.type === "vehicle" ? "🚐 مركبة" : (cc.type === "branch" ? "🏢 فرع" : (cc.type === "warehouse" ? "📦 مستودع" : "📁 مركز"));
    options.push(`<option value="${cc.id}" ${currentVal === cc.id ? "selected" : ""}>${typeLabel} — ${cc.name}</option>`);
  });

  options.push(`<option value="unassigned" ${currentVal === "unassigned" ? "selected" : ""}>⚪ غير محدد / عام</option>`);

  select.innerHTML = options.join("");
}

/**
 * ── Helper: Account Classification ───────────────────────────
 */
function isCOGSAccount(acc) {
  const code = acc.code || "";
  if (code.startsWith("5-1-1")) return false; // Exclude periodic purchases
  return code === "5-1-8" || code === "5-1-7" || code === "5-1-9" || code === "5-1-3" ||
    (code.startsWith("5-1-") && !code.startsWith("5-1-1")) || code === "4-2-4" ||
    acc.name?.includes("تكلفة البضاعة المباعة") ||
    acc.name?.includes("تكلفة مبيعات") ||
    acc.name?.includes("نقل بضاعة");
}

function getAccountCategory(acc) {
  const code = acc.code || "";
  if (isCOGSAccount(acc) || code.startsWith("5-1")) {
    return { key: "cogs", name: "تكلفة المبيعات (COGS)", badgeClass: "badge-cogs", color: "#64748b", bg: "rgba(100,116,139,0.15)", text: "#475569" };
  }
  if (code.startsWith("5-3") || acc.name?.includes("تسويق") || acc.name?.includes("بيع") || acc.name?.includes("توزيع") || acc.name?.includes("سيارات") || acc.name?.includes("محروقات") || acc.name?.includes("بنزين") || acc.name?.includes("عمولة")) {
    return { key: "selling", name: "مصروفات بيع وتوزيع", badgeClass: "badge-selling", color: "#f59e0b", bg: "rgba(245,158,11,0.15)", text: "#b45309" };
  }
  if (code.startsWith("5-2") || acc.name?.includes("إداري") || acc.name?.includes("رواتب") || acc.name?.includes("إيجار") || acc.name?.includes("عمومية") || acc.name?.includes("بدل") || acc.name?.includes("إقامة") || acc.name?.includes("تأمينات")) {
    return { key: "admin", name: "مصروفات إدارية وعمومية", badgeClass: "badge-admin", color: "#6366f1", bg: "rgba(99,102,241,0.15)", text: "#4338ca" };
  }
  if (code.startsWith("5-4") || code.startsWith("5-6") || acc.name?.includes("صيانة") || acc.name?.includes("تشغيل") || acc.name?.includes("إهلاك") || acc.name?.includes("استهلاك")) {
    return { key: "operations", name: "صيانة وتشغيل وإهلاك", badgeClass: "badge-ops", color: "#10b981", bg: "rgba(16,185,129,0.15)", text: "#047857" };
  }
  if (code.startsWith("5-5") || acc.name?.includes("بنك") || acc.name?.includes("تمويل") || acc.name?.includes("رسوم بنكية") || acc.name?.includes("فوائد")) {
    return { key: "finance", name: "مصروفات بنكية وتمويلية", badgeClass: "badge-finance", color: "#ec4899", bg: "rgba(236,72,153,0.15)", text: "#be185d" };
  }
  return { key: "other", name: "مصروفات تشغيلية متنوعة", badgeClass: "badge-other", color: "#8b5cf6", bg: "rgba(139,92,246,0.15)", text: "#6d28d9" };
}

/**
 * ── Source Type Labels ───────────────────────────────────────
 */
function getSourceTypeLabel(t) {
  const map = {
    sales: "مبيعات", salesInvoice: "فاتورة بيع", salesCOGS: "تكلفة مبيعات",
    salesReturn: "مردود مبيعات", salesReturnCOGS: "تكلفة مردود مبيعات",
    purchase: "مشتريات", purchaseInvoice: "فاتورة شراء", purchaseReturn: "مردود شراء",
    receipt: "سند قبض", payment: "سند صرف", cashOut: "صرف نقدي", cashIn: "إيداع نقدي",
    bankDeposit: "إيداع بنكي", bankWithdraw: "سحب بنكي", payroll: "مسير رواتب",
    expense: "سند مصروف", manual: "قيد يدوي", pos: "نقطة بيع", inventoryAdjust: "تسوية مخزنية",
    vatPayment: "سداد ضريبة", opening: "رصيد افتتاحي"
  };
  return t ? (map[t] || t) : "قيد عام";
}

/**
 * ── Main Computation & UI Rendering Engine ───────────────────
 */
function calculateAndRender() {
  const from = document.getElementById("exp-from")?.value || "";
  const to = document.getElementById("exp-to")?.value || "";

  // Lookup maps
  const accMap = {};
  _accounts.forEach(a => {
    accMap[a.code] = a;
    if (a.id) accMap[a.id] = a;
  });

  const ccMap = {};
  _costCenters.forEach(c => {
    ccMap[c.id] = c;
    if (c.code) ccMap[c.code] = c;
  });

  let totalRevenue = 0;
  let totalGrossSales = 0;
  let totalSalesReturns = 0;
  let totalAllExpenses = 0;
  let totalScopeExpenses = 0;

  const expByAcc = {};
  const expByCC  = {};

  // Process all Journal Entries
  _journalEntries.forEach(je => {
    (je.lines || []).forEach(line => {
      const code = line.accountCode;
      const id = line.accountId;
      const acc = (code && accMap[code]) || (id && accMap[id]);
      if (!acc) return;

      const debit = parseFloat(line.debit || 0);
      const credit = parseFloat(line.credit || 0);

      // ── 1. Calculate Net Revenue (Revenues are credit normal) ──
      if (acc.type === "revenue") {
        const netRev = credit - debit;
        totalRevenue += netRev;
        if (netRev > 0) totalGrossSales += netRev;
        else totalSalesReturns += Math.abs(netRev);
      }

      // ── 2. Calculate Expenses (Expenses are debit normal) ──
      else if (acc.type === "expense") {
        // Exclude periodic purchase accounts (e.g. 5-1-1)
        if (acc.code?.startsWith("5-1-1") || acc.name?.includes("مشتريات البضاعة")) return;

        const netExp = debit - credit;
        if (Math.abs(netExp) < 0.01) return;

        const isCOGS = isCOGSAccount(acc);
        const cat = getAccountCategory(acc);

        totalAllExpenses += netExp;

        // Check if account falls within the selected Scope filter
        let inScope = false;
        if (_activeScope === "opex") {
          inScope = !isCOGS && !acc.code?.startsWith("5-1");
        } else if (_activeScope === "selling") {
          inScope = cat.key === "selling" || acc.code?.startsWith("5-3");
        } else if (_activeScope === "admin") {
          inScope = cat.key === "admin" || acc.code?.startsWith("5-2");
        } else if (_activeScope === "all_with_cogs") {
          inScope = true;
        }

        // Cost Center matching
        const lineCCId = line.costCenterId || je.costCenterId || "unassigned";
        const lineCCName = line.costCenterName || je.costCenterName || (ccMap[lineCCId]?.name) || (lineCCId === "unassigned" ? "غير محدد / عام" : lineCCId);

        // Check Cost Center filter
        let inCC = false;
        if (_activeCostCenter === "all") {
          inCC = true;
        } else if (_activeCostCenter === "unassigned") {
          inCC = (lineCCId === "unassigned" || !lineCCId);
        } else {
          inCC = (lineCCId === _activeCostCenter);
        }

        // If in scope and matches Cost Center filter, accumulate
        if (inScope && inCC) {
          totalScopeExpenses += netExp;

          // Categorize by Account Code
          if (!expByAcc[acc.code]) {
            expByAcc[acc.code] = {
              code: acc.code,
              name: acc.name,
              category: cat,
              amount: 0,
              count: 0,
              lines: [],
              costCenters: {}
            };
          }
          expByAcc[acc.code].amount += netExp;
          expByAcc[acc.code].count += 1;
          expByAcc[acc.code].lines.push({
            jeId: je.id,
            jeNumber: je.entryNumber || (je.id ? `JE-${je.id.slice(-6).toUpperCase()}` : "—"),
            date: je.date,
            sourceType: je.sourceType,
            description: line.note || je.description || "—",
            costCenterId: lineCCId,
            costCenterName: lineCCName,
            debit,
            credit,
            net: netExp
          });

          // Accumulate inside this account by CC
          if (!expByAcc[acc.code].costCenters[lineCCId]) {
            expByAcc[acc.code].costCenters[lineCCId] = { name: lineCCName, amount: 0 };
          }
          expByAcc[acc.code].costCenters[lineCCId].amount += netExp;
        }

        // Always accumulate Cost Centers for all in-scope expenses
        if (inScope) {
          if (!expByCC[lineCCId]) {
            const ccObj = ccMap[lineCCId];
            expByCC[lineCCId] = {
              id: lineCCId,
              name: lineCCName,
              type: ccObj?.type || (lineCCId === "unassigned" ? "general" : "other"),
              code: ccObj?.code || "",
              amount: 0,
              count: 0,
              byAcc: {}
            };
          }
          expByCC[lineCCId].amount += netExp;
          expByCC[lineCCId].count += 1;

          if (!expByCC[lineCCId].byAcc[acc.code]) {
            expByCC[lineCCId].byAcc[acc.code] = { code: acc.code, name: acc.name, amount: 0 };
          }
          expByCC[lineCCId].byAcc[acc.code].amount += netExp;
        }
      }
    });
  });

  // Calculate days in period for burn rate
  let daysInPeriod = 1;
  if (from && to) {
    const dFrom = new Date(from);
    const dTo = new Date(to);
    daysInPeriod = Math.max(1, Math.round((dTo - dFrom) / (1000 * 60 * 60 * 24)) + 1);
  }

  // Convert map to array and sort
  const accList = Object.values(expByAcc);
  
  // Sort accounts based on current sort criteria
  sortAccountList(accList);

  // Convert CC map to sorted array
  const ccList = Object.values(expByCC).sort((a,b) => b.amount - a.amount);
  ccList.forEach(c => {
    // Find top account in each CC
    const topAcc = Object.values(c.byAcc).sort((x,y) => y.amount - x.amount)[0];
    c.topAcc = topAcc || { name: "—", amount: 0 };
  });

  // Save calculated data globally for export and modal
  _calculatedData = {
    from,
    to,
    daysInPeriod,
    totalRevenue,
    totalGrossSales,
    totalSalesReturns,
    totalAllExpenses,
    totalScopeExpenses,
    accList,
    ccList,
    scope: _activeScope,
    costCenterFilter: _activeCostCenter
  };

  // Render all UI components
  renderScopeBadge();
  renderKPIs();
  renderCompositionBar();
  renderCategoryTable();
  renderCostCenterTable();
}

/**
 * ── Helper: Sort Account List ────────────────────────────────
 */
function sortAccountList(list) {
  if (_sortBy === "amount_desc") {
    list.sort((a,b) => b.amount - a.amount);
  } else if (_sortBy === "amount_asc") {
    list.sort((a,b) => a.amount - b.amount);
  } else if (_sortBy === "pct_rev_desc") {
    list.sort((a,b) => {
      const pA = _calculatedData?.totalRevenue > 0 ? (a.amount / _calculatedData.totalRevenue) : 0;
      const pB = _calculatedData?.totalRevenue > 0 ? (b.amount / _calculatedData.totalRevenue) : 0;
      return pB - pA;
    });
  } else if (_sortBy === "name_asc") {
    list.sort((a,b) => (a.name || "").localeCompare(b.name || ""));
  }
}

/**
 * ── UI: Render Scope Badge ───────────────────────────────────
 */
function renderScopeBadge() {
  const container = document.getElementById("exp-scope-badge-container");
  if (!container) return;

  const scopeLabels = {
    opex: { text: "التحليل: المصروفات التشغيلية والإدارية (OpEx)", color: "#4f46e5", bg: "rgba(79,70,229,0.1)" },
    selling: { text: "التحليل: مصروفات البيع والتوزيع فقط (5-3)", color: "#d97706", bg: "rgba(217,119,6,0.1)" },
    admin: { text: "التحليل: المصروفات الإدارية والعمومية (5-2)", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
    all_with_cogs: { text: "التحليل: جميع المصروفات شاملة تكلفة المبيعات (COGS)", color: "#475569", bg: "rgba(71,85,105,0.1)" }
  };

  const current = scopeLabels[_activeScope] || scopeLabels.opex;
  container.innerHTML = `
    <span style="font-size:12px; font-weight:800; padding:6px 14px; border-radius:20px; background:${current.bg}; color:${current.color}; border:1px solid ${current.color}30; display:inline-flex; align-items:center; gap:6px;">
      <span>📌</span> ${current.text}
    </span>
  `;
}

/**
 * ── UI: Render Smart KPI Cards ───────────────────────────────
 */
function renderKPIs() {
  const d = _calculatedData;
  if (!d) return;

  // 1. Total Expenses
  const expTitleEl = document.getElementById("kpi-exp-title");
  if (expTitleEl) {
    if (_activeScope === "opex") expTitleEl.textContent = "المصروفات التشغيلية (OpEx)";
    else if (_activeScope === "selling") expTitleEl.textContent = "مصروفات البيع والتوزيع";
    else if (_activeScope === "admin") expTitleEl.textContent = "المصروفات الإدارية";
    else expTitleEl.textContent = "إجمالي المصروفات و COGS";
  }
  document.getElementById("kpi-exp-total").textContent = formatCurrency(d.totalScopeExpenses);

  // 2. Net Revenue
  document.getElementById("kpi-rev-total").textContent = formatCurrency(d.totalRevenue);

  // 3. Expense to Revenue Ratio (التحليل الرأسي)
  const ratio = d.totalRevenue > 0 ? (d.totalScopeExpenses / d.totalRevenue) * 100 : 0;
  const ratioEl = document.getElementById("kpi-exp-ratio");
  ratioEl.textContent = `${ratio.toFixed(1)}%`;
  
  // Dynamic color coding for ratio
  if (_activeScope === "opex") {
    if (ratio <= 15) ratioEl.style.color = "#10b981"; // Excellent
    else if (ratio <= 25) ratioEl.style.color = "#f59e0b"; // Warning
    else ratioEl.style.color = "#ef4444"; // High
  }

  // 4. Daily Burn Rate
  const dailyBurn = d.totalScopeExpenses / d.daysInPeriod;
  document.getElementById("kpi-burn-rate").textContent = `${formatCurrency(dailyBurn)} / يوم`;
  document.getElementById("kpi-burn-subtitle").textContent = `على مدار ${d.daysInPeriod} يوماً في الفترة`;

  // 5. Top Expense Driver
  const topAcc = d.accList[0];
  const topDriverEl = document.getElementById("kpi-top-driver");
  const topDriverSubEl = document.getElementById("kpi-top-driver-sub");
  if (topAcc) {
    const topPct = d.totalScopeExpenses > 0 ? (topAcc.amount / d.totalScopeExpenses) * 100 : 0;
    topDriverEl.textContent = topAcc.name;
    topDriverEl.title = `${topAcc.name} (${formatCurrency(topAcc.amount)})`;
    topDriverSubEl.innerHTML = `<strong style="color:var(--text-1);">${formatCurrency(topAcc.amount)}</strong> (${topPct.toFixed(1)}% من المصروفات)`;
  } else {
    topDriverEl.textContent = "لا توجد مصروفات";
    topDriverSubEl.textContent = "—";
  }
}

/**
 * ── UI: Render Visual Composition Bar ────────────────────────
 */
function renderCompositionBar() {
  const bar = document.getElementById("exp-composition-bar");
  const legend = document.getElementById("exp-composition-legend");
  const totalBadge = document.getElementById("exp-stacked-total-badge");
  const d = _calculatedData;
  if (!bar || !legend || !d) return;

  const total = d.totalScopeExpenses;
  if (totalBadge) totalBadge.innerHTML = `المجموع: <strong style="color:var(--text-1);">${formatCurrency(total)}</strong>`;

  if (total <= 0 || d.accList.length === 0) {
    bar.innerHTML = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-3); font-size:11px;">لا توجد مصروفات مسجلة في هذا النطاق والفترة</div>`;
    legend.innerHTML = "";
    return;
  }

  // Color palette for segments
  const colors = [
    { fill: "#4f46e5", text: "#ffffff" },
    { fill: "#10b981", text: "#ffffff" },
    { fill: "#f59e0b", text: "#ffffff" },
    { fill: "#06b6d4", text: "#ffffff" },
    { fill: "#ec4899", text: "#ffffff" },
    { fill: "#8b5cf6", text: "#ffffff" },
    { fill: "#64748b", text: "#ffffff" }
  ];

  // Pick top 5 and group rest as 'Others'
  const segments = [];
  let otherAmount = 0;

  d.accList.forEach((acc, idx) => {
    if (idx < 5) {
      segments.push({
        name: acc.name,
        code: acc.code,
        amount: acc.amount,
        pct: (acc.amount / total) * 100,
        color: colors[idx % colors.length]
      });
    } else {
      otherAmount += acc.amount;
    }
  });

  if (otherAmount > 0) {
    segments.push({
      name: `باقي المصروفات (${d.accList.length - 5} بنود)`,
      code: "OTHER",
      amount: otherAmount,
      pct: (otherAmount / total) * 100,
      color: colors[colors.length - 1]
    });
  }

  // Render stacked bar segments
  bar.innerHTML = segments.map(s => {
    return `
      <div style="width:${s.pct}%; height:100%; background:${s.color.fill}; position:relative; transition:width 0.4s ease;" 
           title="${s.name}: ${formatCurrency(s.amount)} (${s.pct.toFixed(1)}%)">
      </div>
    `;
  }).join("");

  // Render legend chips
  legend.innerHTML = segments.map(s => {
    return `
      <div style="display:inline-flex; align-items:center; gap:6px; background:var(--bg-2); padding:4px 10px; border-radius:8px; border:1px solid var(--border-soft);">
        <span style="width:10px; height:10px; border-radius:3px; background:${s.color.fill}; display:inline-block;"></span>
        <span style="font-weight:700; color:var(--text-1);">${s.name}:</span>
        <span class="mono" style="color:var(--text-2); font-weight:600;">${formatCurrency(s.amount)}</span>
        <span class="mono" style="font-weight:800; color:${s.color.fill};">(${s.pct.toFixed(1)}%)</span>
      </div>
    `;
  }).join("");
}

/**
 * ── UI: Render Category Table with Dual Ratio Analysis ───────
 */
function renderCategoryTable() {
  const tbody = document.getElementById("exp-category-tbody");
  const tfoot = document.getElementById("exp-category-tfoot");
  const d = _calculatedData;
  if (!tbody || !d) return;

  let filtered = [...d.accList];

  // Search filter
  if (_searchQuery.trim()) {
    const q = _searchQuery.toLowerCase().trim();
    filtered = filtered.filter(a => a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.category.name.toLowerCase().includes(q));
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--text-3); font-size:13px;">لا توجد مصروفات تطابق معايير البحث والفلترة</td></tr>`;
    if (tfoot) tfoot.innerHTML = "";
    return;
  }

  const totalExp = d.totalScopeExpenses;
  const netRev = d.totalRevenue;

  tbody.innerHTML = filtered.map(a => {
    const pctOfExp = totalExp > 0 ? (a.amount / totalExp) * 100 : 0;
    const pctOfRev = netRev > 0 ? (a.amount / netRev) * 100 : 0;

    return `
      <tr style="border-bottom:1px solid var(--border-soft); transition:background 0.15s;" onmouseover="this.style.background='var(--bg-2)'" onmouseout="this.style.background='transparent'">
        <td class="mono" style="padding:10px 12px; font-weight:700; color:var(--text-3); font-size:11.5px;">${a.code}</td>
        <td style="padding:10px 12px;">
          <div style="font-weight:800; color:var(--text-1); font-size:13px; cursor:pointer;" onclick="openAccountDrillDown('${a.code}')">${a.name}</div>
          <div style="font-size:11px; color:var(--text-3); margin-top:2px;">
            ${getTopCostCenterString(a.costCenters)}
          </div>
        </td>
        <td style="padding:10px 12px;">
          <span style="font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px; background:${a.category.bg}; color:${a.category.text}; border:1px solid ${a.category.color}30; white-space:nowrap;">
            ${a.category.name}
          </span>
        </td>
        <td class="mono" style="padding:10px 12px; text-align:center; font-weight:600; font-size:12px; color:var(--text-2);">${a.count}</td>
        <td class="mono font-bold" style="padding:10px 12px; text-align:left; font-size:13px; color:#ef4444;">${formatCurrency(a.amount)}</td>
        <td style="padding:10px 12px;">
          <div style="display:flex; align-items:center; gap:8px; justify-content:center;">
            <span class="mono" style="font-weight:700; font-size:12px; width:45px; text-align:right;">${pctOfExp.toFixed(1)}%</span>
            <div style="height:6px; width:70px; background:var(--bg-3); border-radius:3px; overflow:hidden;">
              <div style="height:100%; width:${Math.min(100, pctOfExp)}%; background:${a.category.color}; border-radius:3px;"></div>
            </div>
          </div>
        </td>
        <td style="padding:10px 12px;">
          <div style="display:flex; align-items:center; gap:8px; justify-content:center;">
            <span class="mono font-bold" style="font-size:12px; width:45px; text-align:right; color:${pctOfRev > 10 ? '#ef4444' : 'var(--text-1)'};">
              ${netRev > 0 ? pctOfRev.toFixed(1) + '%' : '—'}
            </span>
            <div style="height:6px; width:70px; background:var(--bg-3); border-radius:3px; overflow:hidden;">
              <div style="height:100%; width:${Math.min(100, pctOfRev)}%; background:#6366f1; border-radius:3px;"></div>
            </div>
          </div>
        </td>
        <td style="padding:10px 12px; text-align:center;" class="no-print">
          <button class="btn btn-ghost btn-sm" onclick="openAccountDrillDown('${a.code}')" title="عرض كشف الحركات التفصيلي" style="padding:4px 8px; font-size:11.5px; font-weight:700; color:var(--primary); background:rgba(99,102,241,0.08); border-radius:6px;">
            🔍 كشف
          </button>
        </td>
      </tr>
    `;
  }).join("");

  // Footer Totals
  const totalRatio = netRev > 0 ? (totalExp / netRev) * 100 : 0;
  if (tfoot) {
    tfoot.innerHTML = `
      <tr>
        <td colspan="3" style="padding:12px; font-size:13px; color:var(--text-1);">الإجمالي المالي لبنود المصروفات (${filtered.length} بند)</td>
        <td class="mono" style="padding:12px; text-align:center; font-size:13px;">${filtered.reduce((s,a) => s + a.count, 0)}</td>
        <td class="mono font-bold" style="padding:12px; text-align:left; font-size:14px; color:#ef4444;">${formatCurrency(totalExp)}</td>
        <td class="mono" style="padding:12px; text-align:center; font-size:13px;">100.0%</td>
        <td class="mono font-bold" style="padding:12px; text-align:center; font-size:13px; color:#6366f1;">${netRev > 0 ? totalRatio.toFixed(1) + '%' : '—'}</td>
        <td class="no-print"></td>
      </tr>
    `;
  }
}

/**
 * ── Helper: Format dominant Cost Center for an account ───────
 */
function getTopCostCenterString(ccs) {
  const entries = Object.values(ccs || {});
  if (entries.length === 0) return "مركز التكلفة: عام";
  if (entries.length === 1) return `مركز التكلفة: ${entries[0].name}`;
  entries.sort((a,b) => b.amount - a.amount);
  return `المركز الأبرز: ${entries[0].name} (${entries.length} مراكز)`;
}

/**
 * ── UI: Render Cost Centers Breakdown Table ──────────────────
 */
function renderCostCenterTable() {
  const tbody = document.getElementById("exp-cc-tbody");
  const tfoot = document.getElementById("exp-cc-tfoot");
  const badge = document.getElementById("exp-cc-count-badge");
  const d = _calculatedData;
  if (!tbody || !d) return;

  const totalExp = d.totalScopeExpenses;
  const ccList = d.ccList || [];

  if (badge) badge.textContent = `${ccList.length} مراكز نشطة`;

  if (ccList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-3); font-size:13px;">لا توجد مصروفات مسجلة لمراكز التكلفة في هذه الفترة</td></tr>`;
    if (tfoot) tfoot.innerHTML = "";
    return;
  }

  tbody.innerHTML = ccList.map(c => {
    const pct = totalExp > 0 ? (c.amount / totalExp) * 100 : 0;
    const typeBadge = c.type === "vehicle" 
      ? '<span style="font-size:11px; padding:3px 8px; border-radius:6px; background:rgba(16,185,129,0.12); color:#047857; font-weight:700;">🚐 مركبة توزيع</span>'
      : (c.type === "warehouse" ? '<span style="font-size:11px; padding:3px 8px; border-radius:6px; background:rgba(245,158,11,0.12); color:#b45309; font-weight:700;">📦 مستودع</span>'
      : (c.type === "branch" ? '<span style="font-size:11px; padding:3px 8px; border-radius:6px; background:rgba(99,102,241,0.12); color:#4338ca; font-weight:700;">🏢 فرع / إدارة</span>'
      : '<span style="font-size:11px; padding:3px 8px; border-radius:6px; background:var(--bg-3); color:var(--text-2); font-weight:600;">📁 مركز عام</span>'));

    return `
      <tr style="border-bottom:1px solid var(--border-soft); transition:background 0.15s;" onmouseover="this.style.background='var(--bg-2)'" onmouseout="this.style.background='transparent'">
        <td style="padding:10px 12px;">
          <div style="font-weight:800; color:var(--text-1); font-size:13px;">${c.name}</div>
          ${c.code ? `<div class="mono" style="font-size:11px; color:var(--text-3);">${c.code}</div>` : ''}
        </td>
        <td style="padding:10px 12px;">${typeBadge}</td>
        <td class="mono" style="padding:10px 12px; text-align:center; font-weight:600; font-size:12px; color:var(--text-2);">${c.count}</td>
        <td class="mono font-bold" style="padding:10px 12px; text-align:left; font-size:13px; color:#ef4444;">${formatCurrency(c.amount)}</td>
        <td style="padding:10px 12px;">
          <div style="display:flex; align-items:center; gap:8px; justify-content:center;">
            <span class="mono" style="font-weight:700; font-size:12px; width:45px; text-align:right;">${pct.toFixed(1)}%</span>
            <div style="height:6px; width:75px; background:var(--bg-3); border-radius:3px; overflow:hidden;">
              <div style="height:100%; width:${Math.min(100, pct)}%; background:#10b981; border-radius:3px;"></div>
            </div>
          </div>
        </td>
        <td style="padding:10px 12px;">
          <div style="font-weight:700; color:var(--text-1); font-size:12px;">${c.topAcc?.name || '—'}</div>
          ${c.topAcc?.amount ? `<div class="mono" style="font-size:11px; color:var(--text-3);">${formatCurrency(c.topAcc.amount)}</div>` : ''}
        </td>
        <td style="padding:10px 12px; text-align:center;" class="no-print">
          <button class="btn btn-ghost btn-sm" onclick="filterByCostCenter('${c.id}')" title="تصفية التقرير بالكامل لهذا المركز" style="padding:4px 8px; font-size:11px; font-weight:700; color:#10b981; background:rgba(16,185,129,0.08); border-radius:6px;">
            🎯 تصفية
          </button>
        </td>
      </tr>
    `;
  }).join("");

  // Footer Totals
  if (tfoot) {
    tfoot.innerHTML = `
      <tr>
        <td colspan="2" style="padding:12px; font-size:13px; color:var(--text-1);">إجمالي مراكز التكلفة (${ccList.length} مركز)</td>
        <td class="mono" style="padding:12px; text-align:center; font-size:13px;">${ccList.reduce((s,c) => s + c.count, 0)}</td>
        <td class="mono font-bold" style="padding:12px; text-align:left; font-size:14px; color:#ef4444;">${formatCurrency(totalExp)}</td>
        <td class="mono" style="padding:12px; text-align:center; font-size:13px;">100.0%</td>
        <td colspan="2" class="no-print"></td>
      </tr>
    `;
  }
}

/**
 * ── Interactive Actions & Filters ────────────────────────────
 */
function setExpDatePreset(preset) {
  const fromEl = document.getElementById("exp-from");
  const toEl = document.getElementById("exp-to");
  if (!fromEl || !toEl) return;

  const today = new Date();
  let fromDate = todayString();
  let toDate = todayString();

  if (preset === "today") {
    // defaults
  } else if (preset === "yesterday") {
    const yest = new Date(today);
    yest.setDate(yest.getDate() - 1);
    fromDate = yest.toISOString().split("T")[0];
    toDate = fromDate;
  } else if (preset === "week") {
    const d = new Date(today);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 6 ? 0 : -1); // Saturday as start
    const startWeek = new Date(d.setDate(diff));
    fromDate = startWeek.toISOString().split("T")[0];
  } else if (preset === "month") {
    fromDate = startOfMonth();
  } else if (preset === "last_month") {
    const lm = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    fromDate = lm.toISOString().split("T")[0];
    const le = new Date(today.getFullYear(), today.getMonth(), 0);
    toDate = le.toISOString().split("T")[0];
  } else if (preset === "quarter") {
    const currentQuarter = Math.floor(today.getMonth() / 3);
    const qStart = new Date(today.getFullYear(), currentQuarter * 3, 1);
    fromDate = qStart.toISOString().split("T")[0];
  } else if (preset === "year") {
    fromDate = `${today.getFullYear()}-01-01`;
  }

  fromEl.value = fromDate;
  toEl.value = toDate;
  _datePreset = preset;

  // Toggle active class on preset buttons
  document.querySelectorAll(".exp-preset-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-preset") === preset);
  });

  loadExpenseAnalysisData();
}

function onExpDateChange() {
  document.querySelectorAll(".exp-preset-btn").forEach(btn => btn.classList.remove("active"));
  loadExpenseAnalysisData();
}

function onExpScopeChange() {
  _activeScope = document.getElementById("exp-scope")?.value || "opex";
  calculateAndRender();
}

function onExpCCChange() {
  _activeCostCenter = document.getElementById("exp-cc-filter")?.value || "all";
  calculateAndRender();
}

function filterByCostCenter(ccId) {
  _activeCostCenter = ccId;
  const select = document.getElementById("exp-cc-filter");
  if (select) select.value = ccId;
  calculateAndRender();
  if (window.showToast) window.showToast("تمت تصفية التقرير لمركز التكلفة المختار 🎯", "info");
}

function onExpSearchInput(val) {
  _searchQuery = val || "";
  renderCategoryTable();
}

function onExpSortChange(val) {
  _sortBy = val || "amount_desc";
  if (_calculatedData?.accList) {
    sortAccountList(_calculatedData.accList);
    renderCategoryTable();
  }
}

/**
 * ── Interactive Account Drill-Down Modal ─────────────────────
 */
function openAccountDrillDown(accCode) {
  _activeModalAccCode = accCode;
  _modalSearchQuery = "";

  const accData = _calculatedData?.accList.find(a => a.code === accCode);
  if (!accData) return;

  const modalContainer = document.getElementById("exp-drilldown-modal-container");
  if (!modalContainer) return;

  const netRev = _calculatedData.totalRevenue || 0;
  const pctOfExp = _calculatedData.totalScopeExpenses > 0 ? (accData.amount / _calculatedData.totalScopeExpenses) * 100 : 0;
  const pctOfRev = netRev > 0 ? (accData.amount / netRev) * 100 : 0;

  modalContainer.innerHTML = `
    <div id="exp-modal-backdrop" style="position:fixed; inset:0; background:rgba(15,23,42,0.7); backdrop-filter:blur(4px); z-index:9999; display:flex; align-items:center; justify-content:center; padding:16px;">
      <div style="background:var(--bg-card); border-radius:16px; width:100%; max-width:900px; max-height:90vh; display:flex; flex-direction:column; box-shadow:0 25px 50px -12px rgba(0,0,0,0.4); border:1px solid var(--border-soft); overflow:hidden; animation:modalSlideUp 0.2s ease-out;">
        
        <!-- Modal Header -->
        <div style="padding:18px 22px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:flex-start; background:var(--bg-1);">
          <div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
              <span class="mono" style="font-size:12px; font-weight:800; padding:2px 8px; border-radius:6px; background:var(--bg-3); color:var(--text-2);">${accData.code}</span>
              <h2 style="font-size:18px; font-weight:900; margin:0; color:var(--text-1);">${accData.name}</h2>
              <span style="font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px; background:${accData.category.bg}; color:${accData.category.text};">
                ${accData.category.name}
              </span>
            </div>
            <p style="font-size:12px; color:var(--text-3); margin:0;">
              الفترة من ${formatDate(_calculatedData.from)} إلى ${formatDate(_calculatedData.to)} | إجمالي الحركات: <strong>${accData.lines.length} قيد</strong>
            </p>
          </div>
          <button onclick="closeAccountDrillDown()" style="background:var(--bg-3); border:none; border-radius:8px; width:34px; height:34px; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; color:var(--text-2);">✕</button>
        </div>

        <!-- Mini Stats in Modal -->
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; padding:14px 22px; background:var(--bg-2); border-bottom:1px solid var(--border-soft);">
          <div>
            <div style="font-size:11px; color:var(--text-3); font-weight:600;">إجمالي الصرف في الفترة</div>
            <div class="mono" style="font-size:16px; font-weight:900; color:#ef4444;">${formatCurrency(accData.amount)}</div>
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-3); font-weight:600;">الحصة من ميزانية المصروفات</div>
            <div class="mono" style="font-size:16px; font-weight:900; color:var(--text-1);">${pctOfExp.toFixed(1)}%</div>
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-3); font-weight:600;">التحليل الرأسي (% من المبيعات)</div>
            <div class="mono" style="font-size:16px; font-weight:900; color:#6366f1;">${netRev > 0 ? pctOfRev.toFixed(1) + '%' : '—'}</div>
          </div>
        </div>

        <!-- Filter in Modal -->
        <div style="padding:12px 22px; border-bottom:1px solid var(--border-soft); display:flex; gap:10px; align-items:center;">
          <div style="flex:1;">
            <input type="text" id="modal-search" placeholder="بحث في البيان، رقم القيد، أو مركز التكلفة..." oninput="onModalSearchInput(this.value)" style="width:100%; padding:6px 12px; border:1px solid var(--border); border-radius:8px; background:var(--bg-1); color:var(--text-1); font-size:12px;" />
          </div>
          <button class="btn btn-secondary btn-sm" onclick="exportAccountDrillDownCSV()" style="font-weight:700; display:inline-flex; align-items:center; gap:6px;">
            <span>📥</span> تصدير الحركات
          </button>
        </div>

        <!-- Modal Table Body -->
        <div style="flex:1; overflow-y:auto; padding:0 22px;">
          <table class="data-dense" style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead style="position:sticky; top:0; background:var(--bg-card); z-index:10; border-bottom:2px solid var(--border);">
              <tr>
                <th style="padding:10px 8px; text-align:right; width:95px;">التاريخ</th>
                <th style="padding:10px 8px; text-align:right; width:110px;">رقم القيد</th>
                <th style="padding:10px 8px; text-align:right; width:100px;">نوع المستند</th>
                <th style="padding:10px 8px; text-align:right; width:130px;">مركز التكلفة</th>
                <th style="padding:10px 8px; text-align:right;">البيان / الشرح</th>
                <th style="padding:10px 8px; text-align:left; width:110px;">المبلغ (ر.س)</th>
              </tr>
            </thead>
            <tbody id="exp-modal-tbody">
              <!-- Rendered via renderModalTableRows() -->
            </tbody>
          </table>
        </div>

        <!-- Modal Footer -->
        <div style="padding:14px 22px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:10px; background:var(--bg-1);">
          <button class="btn btn-secondary" onclick="closeAccountDrillDown()">إغلاق</button>
        </div>

      </div>
    </div>
  `;

  // Render initial rows
  renderModalTableRows();
}

function renderModalTableRows() {
  const tbody = document.getElementById("exp-modal-tbody");
  if (!tbody || !_activeModalAccCode || !_calculatedData) return;

  const accData = _calculatedData.accList.find(a => a.code === _activeModalAccCode);
  if (!accData) return;

  let lines = [...accData.lines];
  if (_modalSearchQuery.trim()) {
    const q = _modalSearchQuery.toLowerCase().trim();
    lines = lines.filter(l => 
      (l.description || "").toLowerCase().includes(q) ||
      (l.jeNumber || "").toLowerCase().includes(q) ||
      (l.costCenterName || "").toLowerCase().includes(q) ||
      (getSourceTypeLabel(l.sourceType)).toLowerCase().includes(q)
    );
  }

  if (lines.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-3);">لا توجد حركات تطابق البحث</td></tr>`;
    return;
  }

  tbody.innerHTML = lines.map(l => {
    return `
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td class="mono" style="padding:8px; color:var(--text-2); font-size:11.5px;">${l.date}</td>
        <td class="mono font-bold" style="padding:8px; color:var(--primary);">${l.jeNumber}</td>
        <td style="padding:8px;">
          <span style="font-size:10.5px; padding:2px 6px; border-radius:4px; background:var(--bg-3); color:var(--text-2); font-weight:600;">
            ${getSourceTypeLabel(l.sourceType)}
          </span>
        </td>
        <td style="padding:8px; font-weight:600; color:var(--text-1); font-size:11.5px;">${l.costCenterName}</td>
        <td style="padding:8px; color:var(--text-1);">${l.description}</td>
        <td class="mono font-bold" style="padding:8px; text-align:left; color:#ef4444;">${formatCurrency(l.net)}</td>
      </tr>
    `;
  }).join("");
}

function onModalSearchInput(val) {
  _modalSearchQuery = val || "";
  renderModalTableRows();
}

function closeAccountDrillDown() {
  const modalContainer = document.getElementById("exp-drilldown-modal-container");
  if (modalContainer) modalContainer.innerHTML = "";
  _activeModalAccCode = null;
}

/**
 * ── Export Account Drill Down to CSV ─────────────────────────
 */
function exportAccountDrillDownCSV() {
  if (!_activeModalAccCode || !_calculatedData) return;
  const accData = _calculatedData.accList.find(a => a.code === _activeModalAccCode);
  if (!accData) return;

  const rows = [
    ["كشف حركات المصروف", `${accData.code} - ${accData.name}`],
    ["الفترة", `من: ${_calculatedData.from} إلى: ${_calculatedData.to}`],
    [],
    ["التاريخ", "رقم القيد", "نوع المستند", "مركز التكلفة", "البيان / الشرح", "المبلغ (ر.س)"]
  ];

  accData.lines.forEach(l => {
    rows.push([
      l.date,
      l.jeNumber,
      getSourceTypeLabel(l.sourceType),
      l.costCenterName,
      l.description,
      l.net.toFixed(2)
    ]);
  });

  rows.push([]);
  rows.push(["الإجمالي", "", "", "", "", accData.amount.toFixed(2)]);

  const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv' }));
  a.download = `Expense_${accData.code}_${_calculatedData.from}_to_${_calculatedData.to}.csv`;
  a.click();
}

/**
 * ── Export Entire Expense Analysis to Styled Excel ───────────
 */
async function exportExpensesExcel() {
  const d = _calculatedData;
  if (!d) {
    if (window.showToast) window.showToast("لا توجد بيانات للتصدير", "warning");
    return;
  }

  const title = `تقرير تحليل المصروفات ومراكز التكلفة (${d.from} إلى ${d.to})`;
  const headers = [
    "كود الحساب",
    "اسم المصروف / الحساب",
    "التصنيف المحاسبي",
    "عدد الحركات",
    "المبلغ (ر.س)",
    "حصة المصروف %",
    "نسبته من المبيعات %",
    "مركز التكلفة السائد"
  ];

  const totalExp = d.totalScopeExpenses;
  const netRev = d.totalRevenue;

  const rows = d.accList.map(a => {
    const pctOfExp = totalExp > 0 ? ((a.amount / totalExp) * 100).toFixed(2) + "%" : "0%";
    const pctOfRev = netRev > 0 ? ((a.amount / netRev) * 100).toFixed(2) + "%" : "—";
    return [
      a.code,
      a.name,
      a.category.name,
      a.count,
      a.amount.toFixed(2),
      pctOfExp,
      pctOfRev,
      getTopCostCenterString(a.costCenters)
    ];
  });

  // Add Summary row
  rows.push([
    "الإجمالي",
    "إجمالي المصروفات",
    "",
    d.accList.reduce((s,a) => s + a.count, 0),
    totalExp.toFixed(2),
    "100.0%",
    netRev > 0 ? ((totalExp / netRev) * 100).toFixed(2) + "%" : "—",
    ""
  ]);

  const colWidths = [14, 30, 24, 12, 18, 16, 18, 28];

  try {
    await exportToExcel({
      title,
      headers,
      rows,
      colWidths,
      user: window.currentUser?.name || "المحاسب المالي"
    });
    if (window.showToast) window.showToast("تم تصدير تقرير المصروفات إلى Excel بنجاح 📊", "success");
  } catch (err) {
    console.error("Excel export error:", err);
    if (window.showToast) window.showToast("فشل تصدير Excel: " + err.message, "danger");
  }
}

/**
 * ── Executive PDF Print Layout ───────────────────────────────
 */
async function printExpenseAnalysisPDF() {
  const d = _calculatedData;
  if (!d) return;

  // Fetch company details
  let co = {
    name: "شركة نظم الإمداد الحديثة",
    vatNumber: "312448150500003",
    crNumber: "4700123180",
    phone: "0549141648",
    email: "Nuzmalamdad@gmail.com",
    address: "7480 - الشارع: عامر الشعبي، ينبع",
    logoUrl: ""
  };

  try {
    const cached = JSON.parse(localStorage.getItem("idham_company") || "{}");
    if (cached.name) Object.assign(co, cached);
    if (cached.logoBase64) co.logoUrl = cached.logoBase64;
    if (cached.logoUrl) co.logoUrl = cached.logoUrl;

    const [compSnap, logoSnap] = await Promise.all([
      getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company")),
      getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "logo"))
    ]);
    if (compSnap.exists()) Object.assign(co, compSnap.data());
    if (logoSnap.exists()) {
      const ld = logoSnap.data();
      co.logoUrl = ld.dataUrl || ld.logoBase64 || ld.url || ld.logoUrl || co.logoUrl;
    }
  } catch (e) {
    console.warn("Could not load company branding for print:", e);
  }

  const logoHtml = co.logoUrl
    ? `<img src="${co.logoUrl}" style="max-height:65px; max-width:180px; object-fit:contain;" alt="Logo" />`
    : `<span style="font-size:32px;">🏢</span>`;

  const totalExp = d.totalScopeExpenses;
  const netRev = d.totalRevenue;
  const ratio = netRev > 0 ? (totalExp / netRev) * 100 : 0;
  const dailyBurn = totalExp / d.daysInPeriod;

  const win = window.open("", "_blank");
  win.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تقرير تحليل المصروفات ومراكز التكلفة</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Cairo', sans-serif; }
    body { background: #fff; color: #1e293b; padding: 24px; font-size: 12px; }
    .print-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 18px; }
    .co-info h2 { font-size: 17px; font-weight: 900; color: #0f172a; }
    .co-info p { font-size: 11px; color: #64748b; margin-top: 2px; }
    .rep-title { text-align: center; margin-bottom: 20px; }
    .rep-title h1 { font-size: 19px; font-weight: 900; color: #1e3a8a; }
    .rep-title p { font-size: 12px; color: #475569; font-weight: 600; margin-top: 3px; }
    
    .kpi-row { display: flex; gap: 12px; margin-bottom: 20px; }
    .kpi-box { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; background: #f8fafc; }
    .kpi-box .lbl { font-size: 10.5px; color: #64748b; font-weight: 700; }
    .kpi-box .val { font-size: 16px; font-weight: 900; margin-top: 2px; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 22px; font-size: 11px; }
    th { background: #f1f5f9; color: #1e293b; font-weight: 800; text-align: right; padding: 8px 10px; border: 1px solid #cbd5e1; }
    td { padding: 7px 10px; border: 1px solid #e2e8f0; }
    .mono { font-family: 'Courier New', monospace; font-weight: bold; }
    .text-left { text-align: left; }
    .text-center { text-align: center; }
    .total-row { background: #f8fafc; font-weight: 900; }
    .footer { display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 11px; color: #64748b; margin-top: 30px; }
    @media print {
      body { padding: 10px; }
      @page { size: A4 portrait; margin: 12mm; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="print-header">
    <div class="co-info">
      <h2>${co.name}</h2>
      <p>الرقم الضريبي: ${co.vatNumber} | السجل التجاري: ${co.crNumber}</p>
      <p>${co.address} | هاتف: ${co.phone}</p>
    </div>
    <div>${logoHtml}</div>
  </div>

  <!-- Title -->
  <div class="rep-title">
    <h1>تقرير تحليل المصروفات ومراكز التكلفة</h1>
    <p>للفترة المالية من: ${formatDate(d.from)} إلى: ${formatDate(d.to)}</p>
  </div>

  <!-- KPIs -->
  <div class="kpi-row">
    <div class="kpi-box">
      <div class="lbl">إجمالي المصروفات</div>
      <div class="val mono" style="color:#ef4444;">${formatCurrency(totalExp)}</div>
    </div>
    <div class="kpi-box">
      <div class="lbl">صافي المبيعات</div>
      <div class="val mono" style="color:#1e3a8a;">${formatCurrency(netRev)}</div>
    </div>
    <div class="kpi-box">
      <div class="lbl">نسبة المصروفات للمبيعات</div>
      <div class="val mono" style="color:#10b981;">${ratio.toFixed(1)}%</div>
    </div>
    <div class="kpi-box">
      <div class="lbl">معدل الصرف اليومي</div>
      <div class="val mono" style="color:#f59e0b;">${formatCurrency(dailyBurn)} / يوم</div>
    </div>
  </div>

  <!-- Category Table -->
  <h3 style="font-size:13px; font-weight:800; margin-bottom:8px; color:#1e293b;">1. التحليل المالي والنسبي لبنود المصروفات</h3>
  <table>
    <thead>
      <tr>
        <th style="width:70px;">الكود</th>
        <th>اسم المصروف / الحساب</th>
        <th style="width:110px;">التصنيف</th>
        <th class="text-center" style="width:60px;">الحركات</th>
        <th class="text-left" style="width:110px;">المبلغ (ر.س)</th>
        <th class="text-center" style="width:95px;">حصة المصروف %</th>
        <th class="text-center" style="width:105px;">نسبته من المبيعات %</th>
      </tr>
    </thead>
    <tbody>
      ${d.accList.map(a => {
        const pExp = totalExp > 0 ? ((a.amount / totalExp) * 100).toFixed(1) + "%" : "0%";
        const pRev = netRev > 0 ? ((a.amount / netRev) * 100).toFixed(1) + "%" : "—";
        return `
          <tr>
            <td class="mono">${a.code}</td>
            <td><strong>${a.name}</strong></td>
            <td>${a.category.name}</td>
            <td class="mono text-center">${a.count}</td>
            <td class="mono text-left">${formatCurrency(a.amount)}</td>
            <td class="mono text-center">${pExp}</td>
            <td class="mono text-center">${pRev}</td>
          </tr>
        `;
      }).join("")}
      <tr class="total-row">
        <td colspan="3">الإجمالي</td>
        <td class="mono text-center">${d.accList.reduce((s,a) => s + a.count, 0)}</td>
        <td class="mono text-left">${formatCurrency(totalExp)}</td>
        <td class="mono text-center">100.0%</td>
        <td class="mono text-center">${netRev > 0 ? ratio.toFixed(1) + '%' : '—'}</td>
      </tr>
    </tbody>
  </table>

  <!-- Cost Centers Table -->
  <h3 style="font-size:13px; font-weight:800; margin-bottom:8px; color:#1e293b; margin-top:20px;">2. توزيع المصروفات حسب مراكز التكلفة</h3>
  <table>
    <thead>
      <tr>
        <th>مركز التكلفة / المندوب</th>
        <th class="text-center" style="width:70px;">الحركات</th>
        <th class="text-left" style="width:120px;">المبلغ (ر.س)</th>
        <th class="text-center" style="width:100px;">الحصة %</th>
        <th>أعلى بند مصروف في المركز</th>
      </tr>
    </thead>
    <tbody>
      ${d.ccList.map(c => {
        const p = totalExp > 0 ? ((c.amount / totalExp) * 100).toFixed(1) + "%" : "0%";
        return `
          <tr>
            <td><strong>${c.name}</strong></td>
            <td class="mono text-center">${c.count}</td>
            <td class="mono text-left">${formatCurrency(c.amount)}</td>
            <td class="mono text-center">${p}</td>
            <td>${c.topAcc?.name || '—'} (${formatCurrency(c.topAcc?.amount || 0)})</td>
          </tr>
        `;
      }).join("")}
    </tbody>
  </table>

  <!-- Signatures -->
  <div class="footer">
    <div>تاريخ الطباعة: ${new Date().toLocaleString('ar-SA')}</div>
    <div>المحاسب المسؤول: _______________</div>
    <div>المدير المالي: _______________</div>
  </div>

  <script>
    window.onload = () => { window.print(); };
  </script>
</body>
</html>`);
  win.document.close();
}
