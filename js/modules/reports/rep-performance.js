// ============================================================
// IDHAM ERP — Rep Performance Report & Daily Target Planner
// ============================================================
import { COLS, getAll } from "../../utils/db.js";
import { query, orderBy, limit, getDocs, where } from "../../utils/db.js";
import { formatCurrency, formatPercent, getTargetColor } from "../../utils/formatters.js";
import { db, COMPANY_ID } from "../../firebase-config.js";
import { collection, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

let allProducts = [];
let allReps = [];
let activeTab = "kpis"; // "kpis" or "daily"
let selectedRepPlanner = null;
let currentPlannerMix = []; // Array of { productId, productName, price, weight }

export async function render(container, user) {
  // Save representatives globally
  allReps = await getAll(COLS.salesReps(), [orderBy("name")]);
  allProducts = await getAll(COLS.products(), [orderBy("name")]);

  container.innerHTML = buildShell();

  // Populate product selector in planner modal
  const prodSelect = document.getElementById("planner-product-select");
  if (prodSelect) {
    prodSelect.innerHTML = '<option value="">-- اختر صنف --</option>' +
      allProducts.map(p => `<option value="${p.id}" data-price="${p.salePrice || 0}">${p.name} (${formatCurrency(p.salePrice)})</option>`).join("");
  }

  // Populate representative selector in daily report
  const repSelect = document.getElementById("daily-rep-select");
  if (repSelect) {
    repSelect.innerHTML = '<option value="">-- الكل (بدون تحديد) --</option>' +
      allReps.map(r => `<option value="${r.id}">${r.name}</option>`).join("");
  }

  // Set default date range for KPIs (start of month to today)
  const kpiFromInput = document.getElementById("kpi-filter-from");
  const kpiToInput = document.getElementById("kpi-filter-to");
  if (kpiFromInput && kpiToInput) {
    const d = new Date();
    const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    const formatLocal = (date) => {
      const yr = date.getFullYear();
      const mon = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${yr}-${mon}-${day}`;
    };
    kpiFromInput.value = formatLocal(startOfMonth);
    kpiToInput.value = formatLocal(d);
  }

  // Set default date range for daily report to today
  const dailyFrom = document.getElementById("daily-report-from");
  const dailyTo = document.getElementById("daily-report-to");
  const todayStr = new Date().toISOString().split("T")[0];
  if (dailyFrom) dailyFrom.value = todayStr;
  if (dailyTo) dailyTo.value = todayStr;


  // Attach global actions to window
  window.openTargetPlanner = openTargetPlanner;
  window.addProductToPlannerMix = addProductToPlannerMix;
  window.removeProductFromPlannerMix = removeProductFromPlannerMix;
  window.recalculatePlannerDaily = recalculatePlannerDaily;
  window.updateMixRowWeight = updateMixRowWeight;
  window.switchRepTab = switchRepTab;
  window.loadRepDailyReport = loadRepDailyReport;
  window.setKpiRange = setKpiRange;
  window.loadRepPerformance = loadRepPerformance;

  // Load default tab
  switchRepTab("kpis");
}

function buildShell() {
  return `
    <div class="page-content">
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom: 24px;">
        <div>
          <h1 class="page-title" style="margin:0;">🏆 تقارير وأداء المناديب</h1>
          <p class="page-subtitle" style="margin:4px 0 0;">متابعة أداء المبيعات، نسب إنجاز الأهداف، والتقرير اليومي التفصيلي</p>
        </div>
        
        <!-- Tab switcher -->
        <div class="no-print" style="display:flex; background:var(--bg-2); padding:4px; border-radius:10px; border:1px solid var(--border-soft);">
          <button class="btn btn-sm" id="tab-rep-kpis" onclick="switchRepTab('kpis')" style="border-radius:8px; padding:6px 16px; border:none; cursor:pointer;">📊 تقييم الأهداف (KPIs)</button>
          <button class="btn btn-sm" id="tab-rep-daily" onclick="switchRepTab('daily')" style="border-radius:8px; padding:6px 16px; border:none; cursor:pointer;">📅 التقرير اليومي التفصيلي</button>
        </div>
      </div>

      <!-- Tab 1: KPIs -->
      <div id="rep-kpis-tab-content">
        <!-- Filter bar for KPIs -->
        <div class="filterbar no-print" style="margin-bottom:20px; display:flex; gap:12px; align-items:center; flex-wrap:wrap; background:var(--bg-2); padding:16px; border-radius:12px; border:1px solid var(--border-soft);">
          <div class="form-group" style="margin:0; width:180px;">
            <label style="font-size:11px; margin-bottom:4px; display:block; font-weight:bold;">البداية</label>
            <input type="date" id="kpi-filter-from" class="input" style="height:38px;" onchange="loadRepPerformance()" />
          </div>
          <div class="form-group" style="margin:0; width:180px;">
            <label style="font-size:11px; margin-bottom:4px; display:block; font-weight:bold;">النهاية</label>
            <input type="date" id="kpi-filter-to" class="input" style="height:38px;" onchange="loadRepPerformance()" />
          </div>
          <div class="quick-filters" style="margin:0; border:none; background:transparent; display:flex; gap:4px; align-items:center; height:38px; margin-top:20px;">
            <button class="btn btn-secondary btn-sm" onclick="setKpiRange('month')">هذا الشهر</button>
            <button class="btn btn-secondary btn-sm" onclick="setKpiRange('last_month')">الشهر السابق</button>
            <button class="btn btn-secondary btn-sm" onclick="setKpiRange('year')">هذه السنة</button>
          </div>
          <div style="margin-right:auto; display:flex; gap:8px; align-items:center; height:38px; margin-top:20px;">
            <button class="btn btn-primary" onclick="loadRepPerformance(true)">🔄 تحديث</button>
          </div>
        </div>

        <div class="grid-2 gap-20" id="perf-cards">
          <div class="page-loading"><div class="loading-spinner"></div></div>
        </div>
      </div>

      <!-- Tab 2: Daily Report -->
      <div id="rep-daily-tab-content" class="hidden">
        <!-- Filter bar -->
        <div class="filterbar no-print" style="margin-bottom:20px; display:flex; gap:12px; align-items:center; flex-wrap:wrap; background:var(--bg-2); padding:16px; border-radius:12px; border:1px solid var(--border-soft);">
          <div class="form-group" style="margin:0; width:180px;">
            <label style="font-size:11px; margin-bottom:4px; display:block; font-weight:bold;">المندوب</label>
            <select id="daily-rep-select" class="input" style="height:38px;" onchange="loadRepDailyReport()"></select>
          </div>
          <div class="form-group" style="margin:0; width:150px;">
            <label style="font-size:11px; margin-bottom:4px; display:block; font-weight:bold;">التاريخ من</label>
            <input type="date" id="daily-report-from" class="input" style="height:38px;" onchange="loadRepDailyReport()" />
          </div>
          <div class="form-group" style="margin:0; width:150px;">
            <label style="font-size:11px; margin-bottom:4px; display:block; font-weight:bold;">التاريخ إلى</label>
            <input type="date" id="daily-report-to" class="input" style="height:38px;" onchange="loadRepDailyReport()" />
          </div>
          <div style="margin-right:auto; display:flex; gap:8px;">
            <button class="btn btn-secondary" onclick="window.print()">🖨️ طباعة التقرير</button>
            <button class="btn btn-primary" onclick="loadRepDailyReport(true)">🔄 تحديث</button>
          </div>
        </div>

        <!-- Daily Report Results -->
        <div id="daily-report-results">
          <div class="page-loading"><div class="loading-spinner"></div></div>
        </div>
      </div>
    </div>

    <!-- target planner modal -->
    <div class="modal-overlay" id="target-planner-modal">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">مخطط التحميل اليومي والأهداف للمندوب: <span id="planner-rep-name" style="color:var(--brand);"></span></h3>
          <button class="modal-close" onclick="closeModal('target-planner-modal')">×</button>
        </div>
        <div class="modal-body">
          <div class="grid-3 gap-16 mb-20" style="background:var(--bg-2); padding:16px; border-radius:var(--radius-md);">
            <div class="form-group">
              <label>الهدف الشهري المالي (ر.س) *</label>
              <input type="number" id="planner-monthly-target" class="input mono" oninput="recalculatePlannerDaily()" />
            </div>
            <div class="form-group">
              <label>عدد أيام العمل في الشهر</label>
              <input type="number" id="planner-work-days" class="input mono" value="26" oninput="recalculatePlannerDaily()" />
            </div>
            <div class="form-group" style="display:flex; flex-direction:column; justify-content:center;">
              <span class="text-2" style="font-size:12px; margin-bottom:4px;">المبيعات اليومية المطلوبة</span>
              <span class="mono font-bold text-indigo" id="planner-daily-needed" style="font-size:18px;">0.00 ر.س</span>
            </div>
          </div>

          <h4 class="mb-12 font-heading" style="font-size:14px; border-bottom:1px solid var(--border-soft); padding-bottom:6px;">تخطيط الكراتين اليومية بناءً على مزيج المنتجات</h4>
          <p class="text-2 mb-12" style="font-size:11px;">حدد المنتجات ونسبة مساهمة كل منتج في تحقيق الهدف اليومي لمعرفة عدد الكراتين المطلوبة يومياً.</p>

          <div style="display:flex; gap:12px; align-items:flex-end; margin-bottom:16px;" class="no-print">
            <div class="form-group" style="flex:1;">
              <label>اختر المنتج لإضافته للمزيج</label>
              <select id="planner-product-select" class="input">
                <option value="">-- اختر صنف --</option>
              </select>
            </div>
            <button class="btn btn-secondary" onclick="addProductToPlannerMix()">إضافة للمزيج</button>
          </div>

          <div class="table-container">
            <table class="data-dense">
              <thead>
                <tr>
                  <th>الصنف</th>
                  <th>سعر بيع الكرتونة / الوحدة</th>
                  <th style="width:120px;">نسبة المساهمة (%)</th>
                  <th>الهدف اليومي المالي (ر.س)</th>
                  <th style="color:var(--brand);">الكراتين المطلوبة يومياً</th>
                  <th class="no-print"></th>
                </tr>
              </thead>
              <tbody id="planner-mix-tbody">
                <tr><td colspan="6" style="text-align:center; padding:16px; color:var(--text-2);">لا توجد أصناف في مزيج الأهداف بعد</td></tr>
              </tbody>
              <tfoot>
                <tr style="background:var(--bg-2); font-weight:bold;">
                  <td>الإجمالي</td>
                  <td>—</td>
                  <td id="planner-total-weight-cell" class="mono">0%</td>
                  <td id="planner-total-amount-cell" class="mono">0.00 ر.س</td>
                  <td id="planner-total-cartons-cell" class="mono text-brand">0 كرتونة</td>
                  <td class="no-print">—</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div id="planner-weight-warning" class="alert bad hidden" style="margin-top:12px; font-size:12px; padding:8px 12px;">
            ⚠️ مجموع نسب المساهمة يجب أن يساوي 100% (المجموع الحالي: <span id="planner-current-weight-sum">0</span>%)
          </div>
        </div>
        <div class="modal-footer no-print">
          <button class="btn btn-ghost" onclick="closeModal('target-planner-modal')">إغلاق</button>
          <button class="btn btn-primary" onclick="window.print()">🖨️ طباعة مخطط التحميل</button>
        </div>
      </div>
    </div>
  `;
}

function setKpiRange(range) {
  const kpiFromInput = document.getElementById("kpi-filter-from");
  const kpiToInput = document.getElementById("kpi-filter-to");
  if (!kpiFromInput || !kpiToInput) return;

  const now = new Date();
  const formatLocal = (date) => {
    const yr = date.getFullYear();
    const mon = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${yr}-${mon}-${day}`;
  };

  if (range === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    kpiFromInput.value = formatLocal(start);
    kpiToInput.value = formatLocal(now);
  } else if (range === "last_month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    kpiFromInput.value = formatLocal(start);
    kpiToInput.value = formatLocal(end);
  } else if (range === "year") {
    const start = new Date(now.getFullYear(), 0, 1);
    kpiFromInput.value = formatLocal(start);
    kpiToInput.value = formatLocal(now);
  }

  loadRepPerformance();
}

function switchRepTab(tab) {
  activeTab = tab;
  const kpisContent = document.getElementById("rep-kpis-tab-content");
  const dailyContent = document.getElementById("rep-daily-tab-content");
  const kpisBtn = document.getElementById("tab-rep-kpis");
  const dailyBtn = document.getElementById("tab-rep-daily");

  if (!kpisContent || !dailyContent || !kpisBtn || !dailyBtn) return;

  if (tab === "kpis") {
    kpisContent.classList.remove("hidden");
    dailyContent.classList.add("hidden");
    kpisBtn.style.background = "var(--brand)";
    kpisBtn.style.color = "#fff";
    kpisBtn.style.fontWeight = "bold";
    dailyBtn.style.background = "transparent";
    dailyBtn.style.color = "var(--text-1)";
    dailyBtn.style.fontWeight = "normal";
    loadRepPerformance();
  } else {
    kpisContent.classList.add("hidden");
    dailyContent.classList.remove("hidden");
    dailyBtn.style.background = "var(--brand)";
    dailyBtn.style.color = "#fff";
    dailyBtn.style.fontWeight = "bold";
    kpisBtn.style.background = "transparent";
    kpisBtn.style.color = "var(--text-1)";
    kpisBtn.style.fontWeight = "normal";
    loadRepDailyReport();
  }
}

async function loadRepPerformance(force = false) {
  const cardsEl = document.getElementById("perf-cards");
  if (!cardsEl) return;

  try {
    const reps = allReps;
    const fromStr = document.getElementById("kpi-filter-from")?.value || "";
    const toStr = document.getElementById("kpi-filter-to")?.value || "";

    const { clearERPCache } = await import("../../utils/db.js");
    if (force) {
      clearERPCache(`companies/${COMPANY_ID}/salesInvoices`);
      clearERPCache(`companies/${COMPANY_ID}/receipts`);
      clearERPCache(`companies/${COMPANY_ID}/customers`);
    }

    const [invoices, receipts, customers] = await Promise.all([
      getAll(COLS.salesInvoices()),
      getAll(COLS.receipts()),
      getAll(COLS.customers()),
    ]);

    // Filter by selected range in-memory
    const filteredInvoices = invoices.filter(inv => {
      return (!fromStr || inv.date >= fromStr) && (!toStr || inv.date <= toStr) && inv.status !== "cancelled";
    });
    const filteredReceipts = receipts.filter(rcpt => {
      return (!fromStr || rcpt.date >= fromStr) && (!toStr || rcpt.date <= toStr) && rcpt.entityType === "customer";
    });

    const custRepMap = {};
    customers.forEach(c => { custRepMap[c.id] = c.repId || null; });

    const salesByRep = {};
    const paidByRep  = {};
    const countByRep = {};

    filteredInvoices.forEach(inv => {
      if (!inv.repId) return;
      salesByRep[inv.repId] = (salesByRep[inv.repId] || 0) + (inv.totalWithVat || 0);
      paidByRep[inv.repId]  = (paidByRep[inv.repId] || 0) + (inv.amountPaid || inv.paidAmount || 0);
      countByRep[inv.repId] = (countByRep[inv.repId] || 0) + 1;
    });

    filteredReceipts.forEach(rcpt => {
      const repId = custRepMap[rcpt.targetId];
      if (repId) {
        paidByRep[repId] = (paidByRep[repId] || 0) + (rcpt.amount || 0);
      }
    });

    if (reps.length === 0) {
      cardsEl.innerHTML = `<div class="empty-state" style="grid-column:span 2;"><div class="empty-icon">🏆</div><h3>لا يوجد مناديب مسجلون</h3></div>`;
      return;
    }

    cardsEl.innerHTML = reps.map(r => {
      const sales    = salesByRep[r.id] || 0;
      const paid     = paidByRep[r.id]  || 0;
      const count    = countByRep[r.id] || 0;
      const target   = r.monthlyTarget  || 1;
      const pct      = (sales / target) * 100;
      const commRate = sales < target ? 1.0 : (r.commissionRate || 0);
      const comm     = paid * (commRate / 100);
      const color    = getTargetColor(pct);

      return `
        <div class="card" style="padding:24px;">
          <div class="flex items-center justify-between mb-16">
            <div class="flex items-center gap-12">
              <div class="user-avatar" style="width:48px;height:48px;font-size:20px;background:var(--brand-soft);color:var(--brand);">${r.name[0]}</div>
              <div>
                <h3 style="font-family:var(--font-heading);font-size:16px;">${r.name}</h3>
                <div class="text-2" style="font-size:12px;">المسار: ${r.zone || "غير محدد"}</div>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
              <span class="badge ${color}" style="font-size:12px;padding:4px 12px;">${pct.toFixed(0)}% من الهدف</span>
              <button class="btn btn-ghost sm no-print" onclick="openTargetPlanner('${r.id}','${r.name.replace(/'/g, "\\'")}',${target})" style="font-size:11px; padding:2px 8px; color:var(--brand);">🎯 مخطط التحميل اليومي</button>
            </div>
          </div>

          <div class="mb-20">
            <div class="flex justify-between mb-6" style="font-size:12px;">
              <span class="text-2">المبيعات الحالية / الهدف الشهري</span>
              <span class="mono font-bold text-${color}">${formatCurrency(sales)} / ${formatCurrency(target)}</span>
            </div>
            <div class="progress-bar" style="height:10px;">
              <div class="fill ${color}" style="width:${Math.min(pct, 100)}%;"></div>
            </div>
          </div>

          <div class="grid-3 gap-12" style="font-size:12px;text-align:center;">
            <div style="background:var(--bg-2);padding:12px;border-radius:var(--radius-sm);">
              <div class="text-2 mb-4">عدد الفواتير</div>
              <div class="mono font-bold" style="font-size:16px;">${count}</div>
            </div>
            <div style="background:var(--bg-2);padding:12px;border-radius:var(--radius-sm);">
              <div class="text-2 mb-4">المبلغ المحصل</div>
              <div class="mono font-bold text-good" style="font-size:14px;">${formatCurrency(paid)}</div>
            </div>
            <div style="background:var(--bg-2);padding:12px;border-radius:var(--radius-sm);">
              <div class="text-2 mb-4">العمولة المستحقة</div>
              <div class="mono font-bold text-indigo" style="font-size:14px;">${formatCurrency(comm)}</div>
            </div>
          </div>
        </div>`;
    }).join("");

  } catch (err) {
    cardsEl.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
}

async function loadRepDailyReport(force = false) {
  const resultsEl = document.getElementById("daily-report-results");
  if (!resultsEl) return;

  resultsEl.innerHTML = `<div class="page-loading"><div class="loading-spinner"></div><span>جارٍ إعداد التقرير اليومي للمبيعات والتحصيلات...</span></div>`;

  const repId = document.getElementById("daily-rep-select")?.value || "";
  const todayStr = new Date().toISOString().split("T")[0];
  const fromDate = document.getElementById("daily-report-from")?.value || todayStr;
  const toDate = document.getElementById("daily-report-to")?.value || todayStr;

  try {
    const { clearERPCache } = await import("../../utils/db.js");
    if (force) {
      clearERPCache(`companies/idham-main/salesInvoices`);
      clearERPCache(`companies/idham-main/receipts`);
      clearERPCache(`companies/idham-main/customers`);
      clearERPCache(`companies/idham-main/employees`);
    }

    const [invoices, receipts, customers, employees, journalEntries, coaRepsAccounts] = await Promise.all([
      getAll(COLS.salesInvoices()),
      getAll(COLS.receipts()),
      getAll(COLS.customers()),
      getAll(COLS.employees()),
      // Load all journal entries to detect rep loans recorded as JEs
      getAll(COLS.journalEntries(), [orderBy("date", "desc")]).catch(() => []),
      // Load COA sub-accounts under 1-1-2-1-2 (rep personal accounts)
      getAll(COLS.chartOfAccounts(), [where("parentCode", "==", "1-1-2-1-2")]).catch(() => []),
    ]);

    // Load active loans from employeeLoans collection
    const loansSnap = await getDocs(collection(db, `companies/${COMPANY_ID}/employeeLoans`));
    const employeeLoans = loansSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Build rep → COA account map (match by name)
    const repCoaMap = {};
    allReps.forEach(rep => {
      const repNameNorm = (rep.name || "").trim().toLowerCase();
      const match = coaRepsAccounts.find(acc => {
        const accName = (acc.name || "").toLowerCase();
        return accName.includes(repNameNorm) ||
               repNameNorm.split(" ").some(w => w.length > 1 && accName.includes(w));
      });
      if (match) repCoaMap[rep.id] = match;
    });


    const custRepMap = {};
    customers.forEach(c => { custRepMap[c.id] = c.repId || null; });

    // Filter invoices by representative and date in-memory
    const filteredInvoices = invoices.filter(inv => {
      if (inv.status === "cancelled") return false;
      if (inv.date < fromDate || inv.date > toDate) return false;
      if (repId && inv.repId !== repId) return false;
      return true;
    });

    // Filter receipts by representative and date in-memory
    const filteredReceipts = receipts.filter(rcpt => {
      if (rcpt.entityType !== "customer") return false;
      if (!rcpt.date || rcpt.date < fromDate || rcpt.date > toDate) return false;
      if (repId) {
        return custRepMap[rcpt.targetId] === repId;
      }
      return true;
    });

    // Calculate metrics and profit using latest catalog purchasePrice
    let totalSales = 0;
    let totalCollected = 0;
    let totalProfit = 0;

    filteredInvoices.forEach(inv => {
      totalSales += (inv.totalWithVat || 0);
      totalCollected += (inv.paidAmount || 0);
      
      // Calculate cost and profit dynamically from lines using last purchase price
      let invCost = 0;
      let invRev = inv.subtotal || 0;
      (inv.lines || []).forEach(l => {
        const prod = allProducts.find(p => p.id === l.productId);
        const lCostPrice = prod ? (prod.purchasePrice !== undefined ? prod.purchasePrice : (prod.costPrice !== undefined ? prod.costPrice : (prod.averageCost || 0))) : (l.averageCost || l.costPrice || l.purchasePrice || 0);
        const lQty = l.qty || 0;
        invCost += (lCostPrice * lQty);
      });
      totalProfit += (invRev - invCost);
    });

    filteredReceipts.forEach(rcpt => {
      totalCollected += (rcpt.amount || 0);
    });

    // Calculate Net Debt Change (Option 2): Sales - Collections (which can be positive or negative)
    const netDebtChange = totalSales - totalCollected;
    const isReduction = netDebtChange < 0;
    const debtCardColor = isReduction ? "good" : "bad";
    const debtCardTitle = isReduction ? "صافي تخفيض المديونية" : "إجمالي المديونية الجديدة";
    const debtCardSubtitle = isReduction ? "التحصيلات تفوق مبيعات اليوم" : "صافي الزيادة في المديونية اليوم";
    const debtCardValue = Math.abs(netDebtChange);

    // Calculate Total Current Debt for all customers belonging to the representative
    let totalCurrentDebt = 0;
    customers.forEach(cust => {
      if (repId) {
        if (cust.repId === repId || cust.assignedRepId === repId) {
          totalCurrentDebt += (cust.balance || 0);
        }
      } else {
        // If "All reps" is selected, only sum customers assigned to *some* representative (not empty)
        if (cust.repId || cust.assignedRepId) {
          totalCurrentDebt += (cust.balance || 0);
        }
      }
    });

    // Determine target employee for loan linkage
    const selectedRepObj = allReps.find(r => r.id === repId);
    let targetEmpId = selectedRepObj ? selectedRepObj.employeeId : null;
    if (selectedRepObj && !targetEmpId) {
      // Fuzzy fallback: find employee whose name starts with or contains the rep name
      const repNameNormalized = selectedRepObj.name.trim();
      const matchedEmp = employees.find(e => e.name.includes(repNameNormalized) || repNameNormalized.includes(e.name));
      if (matchedEmp) {
        targetEmpId = matchedEmp.id;
      }
    }

    // ── Journal-Entry-based loans ─────────────────────────────────────────
    // Detect loans recorded only as JEs (not in employeeLoans collection)
    let jeLoansList = [];
    let jeLoansBySalesman = {}; // repId → [{...}]

    const _detectJeLoan = (je, rep) => {
      const desc     = (je.description || "").toLowerCase();
      const repCoa   = repCoaMap[rep.id];
      const repWords = (rep.name || "").trim().toLowerCase().split(" ").filter(w => w.length > 1);
      const loanKw   = ["سلفة", "سلف", "قرض", "استلاف", "advance", "loan"];
      const isLoanDesc = loanKw.some(kw => desc.includes(kw)) &&
                         repWords.some(w => desc.includes(w));
      const hasRepAccountDebit = repCoa && (je.lines || []).some(l =>
        (l.accountId === repCoa.id || l.accountCode === repCoa.code) && (l.debit || 0) > 0
      );
      return isLoanDesc || hasRepAccountDebit;
    };

    if (repId) {
      const repObj = allReps.find(r => r.id === repId);
      if (repObj) {
        jeLoansList = journalEntries
          .filter(je => _detectJeLoan(je, repObj))
          .map(je => {
            const repCoa  = repCoaMap[repId];
            // Amount = debit on rep's account line; fallback = total debit
            let amount = 0;
            if (repCoa) {
              const repLine = (je.lines || []).find(l =>
                (l.accountId === repCoa.id || l.accountCode === repCoa.code) && (l.debit || 0) > 0
              );
              amount = repLine ? (repLine.debit || 0) : 0;
            }
            if (!amount) amount = (je.lines || []).reduce((s, l) => s + (l.debit || 0), 0);
            return {
              id: je.id, entryNumber: je.entryNumber || je.id.slice(0, 8),
              date: je.date, description: je.description, amount, status: je.status || "posted",
            };
          });
      }
    } else {
      // All reps
      allReps.forEach(rep => {
        const list = journalEntries
          .filter(je => _detectJeLoan(je, rep))
          .map(je => {
            const repCoa = repCoaMap[rep.id];
            let amount = 0;
            if (repCoa) {
              const repLine = (je.lines || []).find(l =>
                (l.accountId === repCoa.id || l.accountCode === repCoa.code) && (l.debit || 0) > 0
              );
              amount = repLine ? (repLine.debit || 0) : 0;
            }
            if (!amount) amount = (je.lines || []).reduce((s, l) => s + (l.debit || 0), 0);
            return {
              id: je.id, entryNumber: je.entryNumber || je.id.slice(0, 8),
              date: je.date, description: je.description, amount, status: je.status || "posted",
              repName: rep.name,
            };
          });
        if (list.length) jeLoansBySalesman[rep.id] = list;
        jeLoansList.push(...list);
      });
    }
    const totalJeLoans = jeLoansList.reduce((s, l) => s + l.amount, 0);
    // ── end JE loans detection ────────────────────────────────────────────

    // Filter and calculate personal outstanding loans/advances
    let totalRemainingLoans = 0;
    let repLoansList = [];
    if (repId) {
      if (targetEmpId) {
        repLoansList = employeeLoans.filter(l => l.empId === targetEmpId && l.status === "active" && l.remainingBalance > 0);
        totalRemainingLoans = repLoansList.reduce((sum, l) => sum + (l.remainingBalance || 0), 0);
      }
    } else {
      // All reps: sum loans of all employees linked to representatives
      const repEmpIds = new Set(allReps.map(r => r.employeeId).filter(Boolean));
      repLoansList = employeeLoans.filter(l => {
        if (l.status !== "active" || !(l.remainingBalance > 0)) return false;
        if (repEmpIds.has(l.empId)) return true;
        // fallback match by representative name in database
        return allReps.some(r => l.empName.includes(r.name) || r.name.includes(l.empName));
      });
      totalRemainingLoans = repLoansList.reduce((sum, l) => sum + (l.remainingBalance || 0), 0);
    }

    // Filter customers:
    // 1. If specific rep: show all customers of that rep (active + inactive)
    // 2. If "All reps": only show active customers of today (who had sales or receipts today) OR have an assigned representative
    const repCustomers = customers.filter(c => {
      if (repId) {
        return c.repId === repId || c.assignedRepId === repId;
      }
      // If "All", we only list customers belonging to *some* representative to exclude main warehouse directly,
      // and we will filter out inactive ones below.
      return c.repId || c.assignedRepId;
    });

    const customerList = repCustomers.map(cust => {
      let todayCustSales = 0;
      filteredInvoices.forEach(inv => {
        if (inv.customerId === cust.id) {
          todayCustSales += (inv.totalWithVat || 0);
        }
      });

      let todayCustCollections = 0;
      filteredInvoices.forEach(inv => {
        if (inv.customerId === cust.id) {
          todayCustCollections += (inv.paidAmount || 0);
        }
      });
      filteredReceipts.forEach(rcpt => {
        if (rcpt.targetId === cust.id) {
          todayCustCollections += (rcpt.amount || 0);
        }
      });

      const currentBal = cust.balance || 0;
      const prevBal = currentBal - todayCustSales + todayCustCollections;
      const hasActivity = todayCustSales > 0 || todayCustCollections > 0;

      return {
        cust,
        prevBal,
        todayCustSales,
        todayCustCollections,
        currentBal,
        hasActivity
      };
    }).filter(item => {
      // If no representative is selected (All view), only show active customers of today!
      // This completely excludes inactive customers belonging to main warehouse / other divisions.
      if (!repId) {
        return item.hasActivity;
      }
      return true;
    });

    // Sort: active first, then by current balance descending
    customerList.sort((a, b) => {
      if (a.hasActivity && !b.hasActivity) return -1;
      if (!a.hasActivity && b.hasActivity) return 1;
      return b.currentBal - a.currentBal;
    });

    let customerMovementRows = customerList.map(item => {
      const activeBadge = item.hasActivity 
        ? `<span class="badge good" style="font-size:9px; padding:2px 6px;">نشط بالفترة</span>` 
        : `<span class="badge secondary" style="font-size:9px; padding:2px 6px; background:#e0e0e0; color:#555;">لا توجد حركة</span>`;

      const rowBg = item.hasActivity ? "rgba(46, 204, 113, 0.06)" : "var(--bg-1)";

      // Forcing the row background color on every td cell explicitly overrides global CSS overrides (column coloring differences)
      return `
        <tr style="background: ${rowBg};">
          <td style="font-weight:bold; color:var(--text-1); background: ${rowBg} !important;">${item.cust.name}</td>
          <td class="mono font-bold" style="background: ${rowBg} !important;">${formatCurrency(item.prevBal)}</td>
          <td class="mono font-bold ${item.todayCustSales > 0 ? "text-brand" : ""}" style="background: ${rowBg} !important;">+ ${formatCurrency(item.todayCustSales)}</td>
          <td class="mono font-bold ${item.todayCustCollections > 0 ? "text-good" : ""}" style="background: ${rowBg} !important;">- ${formatCurrency(item.todayCustCollections)}</td>
          <td class="mono font-bold text-indigo" style="font-size:13px; background: ${rowBg} !important;">${formatCurrency(item.currentBal)}</td>
          <td class="no-print" style="text-align:center; background: ${rowBg} !important;">${activeBadge}</td>
        </tr>
      `;
    }).join("");

    const repName = repId ? (allReps.find(r => r.id === repId)?.name || "المندوب") : "جميع المناديب";

    // Generate detailed outstanding loans list section
    let loansTableHtml = `
      <h3 class="font-heading mb-12" style="font-size:15px; border-bottom: 2px solid #64748b; padding-bottom: 6px; margin-top: 24px; color:#475569;">💸 سلف وقروض المناديب القائمة (الربط المالي مع شؤون الموظفين)</h3>
    `;
    if (repLoansList.length === 0) {
      loansTableHtml += `<div class="alert info" style="text-align:center;">لا توجد سلف شخصية أو قروض قائمة مسجلة بذمة المندوب حالياً في شؤون الموظفين.</div>`;
    } else {
      loansTableHtml += `
        <div class="table-container mb-24">
          <table class="data-dense" style="width:100%;">
            <thead>
              <tr style="background:#475569;">
                ${!repId ? '<th style="background:#475569 !important; color:#fff;">المندوب</th>' : ''}
                <th style="background:#475569 !important; color:#fff;">تاريخ الصرف</th>
                <th style="background:#475569 !important; color:#fff;">البيان والملاحظات</th>
                <th style="background:#475569 !important; color:#fff;" class="mono">قيمة السلفة الكلية</th>
                <th style="background:#475569 !important; color:#fff;" class="mono">المسدد منها</th>
                <th style="background:#475569 !important; color:#fff;" class="mono">الرصيد المتبقي بذمة المندوب</th>
                <th style="background:#475569 !important; color:#fff;">إجراء</th>
              </tr>
            </thead>
            <tbody>
              ${repLoansList.map(l => {
                const rowBg = "var(--bg-1)";
                return `
                  <tr style="background:${rowBg};">
                    ${!repId ? `<td style="font-weight:bold; color:var(--text-1); background:${rowBg} !important;">${l.empName}</td>` : ''}
                    <td class="mono font-bold" style="background:${rowBg} !important;">${l.date}</td>
                    <td style="background:${rowBg} !important;">${l.notes || "سلفة شخصية"}</td>
                    <td class="mono" style="background:${rowBg} !important;">${formatCurrency(l.amount || 0)}</td>
                    <td class="mono text-good" style="background:${rowBg} !important;">${formatCurrency(l.paidAmount || 0)}</td>
                    <td class="mono font-bold text-bad" style="font-size:13px; color:#ef4444 !important; background:${rowBg} !important;">${formatCurrency(l.remainingBalance || 0)}</td>
                    <td style="background:${rowBg} !important; text-align:center;">
                      <button
                        onclick="settleRepLoanByJournal('${l.id}', ${l.amount || 0}, '${l.empName || ''}')"
                        style="background:#10b981;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;font-weight:700;"
                        title="تسوية السلفة بقيد محاسبي — تصفير الرصيد">✓ تسوية بقيد</button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    // ── Section 2: JE-based loans ───────────────────────────────────────
    let jeLoansHtml = `
      <h3 class="font-heading mb-12" style="font-size:15px; border-bottom:2px solid #6366f1;
          padding-bottom:6px; margin-top:24px; color:#818cf8;">
        📒 سلف مسجّلة بالقيود المحاسبية (مباشرة من دفتر اليومية)
      </h3>
    `;
    if (jeLoansList.length === 0) {
      jeLoansHtml += `<div class="alert info" style="text-align:center;">
        لا توجد سلف مُسجَّلة بقيود محاسبية لهذا المندوب.
        <br><small style="opacity:.7">يُكتشف القيد تلقائياً إذا تضمّن كلمة «سلفة» مع اسم المندوب، أو إذا استخدم حسابه في شجرة الحسابات.</small>
      </div>`;
    } else {
      const totalJeDisplay = jeLoansList.reduce((s, l) => s + l.amount, 0);
      jeLoansHtml += `
        <div class="table-container mb-24">
          <table class="data-dense" style="width:100%;">
            <thead>
              <tr style="background:#4f46e5;">
                ${!repId ? '<th style="background:#4f46e5 !important; color:#fff;">المندوب</th>' : ''}
                <th style="background:#4f46e5 !important; color:#fff;">رقم القيد</th>
                <th style="background:#4f46e5 !important; color:#fff;">التاريخ</th>
                <th style="background:#4f46e5 !important; color:#fff;">البيان</th>
                <th style="background:#4f46e5 !important; color:#fff;" class="mono">المبلغ</th>
                <th style="background:#4f46e5 !important; color:#fff;">الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${jeLoansList.map(l => {
                const rowBg = "var(--bg-1)";
                return `
                  <tr style="background:${rowBg};">
                    ${!repId ? `<td style="font-weight:bold;color:var(--text-1);background:${rowBg} !important;">${l.repName || ""}</td>` : ''}
                    <td class="mono font-bold" style="color:#818cf8;background:${rowBg} !important;">${l.entryNumber}</td>
                    <td class="mono" style="background:${rowBg} !important;">${l.date || ""}</td>
                    <td style="background:${rowBg} !important;">${l.description || "سلفة"}</td>
                    <td class="mono font-bold text-bad" style="font-size:13px;color:#ef4444 !important;background:${rowBg} !important;">${formatCurrency(l.amount)}</td>
                    <td style="background:${rowBg} !important;">
                      <span style="background:rgba(16,185,129,.15);color:#10b981;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:800;">
                        ${l.status === "posted" ? "✅ مرحّل" : "📝 مسودة"}
                      </span>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
            <tfoot>
              <tr style="background:#1e1b4b;">
                ${!repId ? '<td style="background:#1e1b4b !important;"></td>' : ''}
                <td colspan="3" style="background:#1e1b4b !important;font-weight:800;color:#a5b4fc;text-align:right;">الإجمالي</td>
                <td class="mono font-bold" style="background:#1e1b4b !important;color:#ef4444;font-size:14px;">${formatCurrency(totalJeDisplay)}</td>
                <td style="background:#1e1b4b !important;"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
    }
    // ── end JE loans section ────────────────────────────────────────────

    let html = `
      <style>
        @media print {
          /* Force Chrome to render color graphics, backgrounds and borders */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background: #fff !important;
            color: #000 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print, .filterbar, .tab-switcher, button, .modal-overlay, .page-header {
            display: none !important;
          }
          .page-content {
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          .card {
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
            background: #f8fafc !important;
            page-break-inside: avoid;
            margin-bottom: 12px !important;
            padding: 12px !important;
          }
          /* Show print header */
          .print-only-header {
            display: block !important;
          }
          /* Print KPIs side-by-side in columns instead of stacking */
          .kpi-container-print {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            justify-content: space-between !important;
            gap: 6px !important;
            margin-bottom: 20px !important;
          }
          .kpi-card-print {
            flex: 1 !important;
            min-width: 90px !important;
            padding: 12px 4px !important;
            background: #f8fafc !important;
            text-align: center !important;
            border-radius: 8px !important;
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
          }
          .kpi-card-print:nth-child(1) { border-top: 4px solid #3b82f6 !important; }
          .kpi-card-print:nth-child(2) { border-top: 4px solid #10b981 !important; }
          .kpi-card-print:nth-child(3) { border-top: 4px solid ${isReduction ? "#10b981" : "#ef4444"} !important; }
          .kpi-card-print:nth-child(4) { border-top: 4px solid #6366f1 !important; }
          .kpi-card-print:nth-child(5) { border-top: 4px solid #f59e0b !important; }
          .kpi-card-print:nth-child(6) { border-top: 4px solid #64748b !important; }

          .kpi-card-print div {
            font-size: 8px !important;
            color: #475569 !important;
            font-weight: bold !important;
          }
          .kpi-card-print .mono {
            font-size: 11px !important;
            margin-top: 4px !important;
            font-weight: bold !important;
          }
          /* Make table headers colorful and premium */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          th {
            background-color: #1e3c72 !important;
            color: #ffffff !important;
            font-weight: bold !important;
            font-size: 9px !important;
            text-align: center !important;
            border: 1px solid #cbd5e1 !important;
            padding: 6px !important;
          }
          td {
            border: 1px solid #e2e8f0 !important;
            padding: 5px !important;
            font-size: 9px !important;
          }
          h1, h2, h3, h4 {
            color: #0f172a !important;
            font-family: Arial, sans-serif !important;
          }
          h3 {
            font-size: 11px !important;
            margin-top: 15px !important;
            border-bottom: 2px solid #1e3c72 !important;
            padding-bottom: 4px !important;
            color: #1e3c72 !important;
          }
        }
      </style>

      <!-- Print Only Header -->
      <div class="print-only-header" style="display:none; margin-bottom:24px; border-radius:8px; overflow:hidden; border:1px solid #cbd5e1;">
        <!-- Top colored band with corporate gradients -->
        <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 16px 20px; color: #fff; display: flex; justify-content: space-between; align-items: center;">
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: bold; font-family: var(--font-heading); color: #00f2fe; text-shadow: 0 1px 3px rgba(0,0,0,0.3);">نظم الامداد الحديثة</div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.85); margin-top: 4px; text-align: right;">نظام التوزيع وإدارة المناديب</div>
          </div>
          <div style="text-align: left;">
            <div style="font-size: 14px; font-weight: bold; font-family: var(--font-heading); color: #fff; letter-spacing: 0.5px;">سجل تجاري: 4625072049</div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.85); margin-top: 4px; text-align: left;">الرقم الضريبي: 310061596700003</div>
          </div>
        </div>
        <!-- Sub-bar with metadata -->
        <div style="background: #f8fafc; padding: 10px 20px; border-bottom: 2px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #334155; font-weight: bold;">
          <div>تقرير مبيعات وحركة المديونيات اليومي</div>
          <div>الفترة: من ${fromDate} إلى ${toDate}</div>
          <div>المندوب: ${repName}</div>
          <div>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</div>
        </div>
      </div>

      <!-- KPI cards -->
      <div class="kpi-container-print" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:12px; margin-bottom: 24px;">
        <div class="card kpi-card-print" style="padding:16px; border-left: 4px solid var(--brand); border-radius:14px;">
          <div class="text-2 mb-4" style="font-size:11px; font-weight:bold; color:var(--text-2);">إجمالي المبيعات (شامل الضريبة)</div>
          <div class="mono font-bold text-brand" style="font-size:20px;">${formatCurrency(totalSales)}</div>
          <div style="font-size:10px; color:var(--text-3); margin-top:4px;">مبيعات الفترة</div>
        </div>
        <div class="card kpi-card-print" style="padding:16px; border-left: 4px solid var(--good); border-radius:14px;">
          <div class="text-2 mb-4" style="font-size:11px; font-weight:bold; color:var(--text-2);">إجمالي المقبوضات/المتحصلات</div>
          <div class="mono font-bold text-good" style="font-size:20px;">${formatCurrency(totalCollected)}</div>
          <div style="font-size:10px; color:var(--text-3); margin-top:4px;">دفعات الفواتير + سندات القبض</div>
        </div>
        <div class="card kpi-card-print" style="padding:16px; border-left: 4px solid var(--${debtCardColor}); border-radius:14px;">
          <div class="text-2 mb-4" style="font-size:11px; font-weight:bold; color:var(--text-2);">${debtCardTitle}</div>
          <div class="mono font-bold text-${debtCardColor}" style="font-size:20px;">${formatCurrency(debtCardValue)}</div>
          <div style="font-size:10px; color:var(--text-3); margin-top:4px;">${debtCardSubtitle}</div>
        </div>
        <div class="card kpi-card-print" style="padding:16px; border-left: 4px solid var(--indigo); border-radius:14px;">
          <div class="text-2 mb-4" style="font-size:11px; font-weight:bold; color:var(--text-2);">صافي أرباح المبيعات</div>
          <div class="mono font-bold text-indigo" style="font-size:20px;">${formatCurrency(totalProfit)}</div>
          <div style="font-size:10px; color:var(--text-3); margin-top:4px;">الكمية × (سعر البيع - سعر الشراء)</div>
        </div>
        <div class="card kpi-card-print" style="padding:16px; border-left: 4px solid #f59e0b; border-radius:14px;">
          <div class="text-2 mb-4" style="font-size:11px; font-weight:bold; color:var(--text-2);">إجمالي مديونية العملاء الحالية</div>
          <div class="mono font-bold" style="font-size:20px; color:#d97706;">${formatCurrency(totalCurrentDebt)}</div>
          <div style="font-size:10px; color:var(--text-3); margin-top:4px;">الرصيد القائم لعملاء المندوب حالياً</div>
        </div>
        <div class="card kpi-card-print" style="padding:16px; border-left: 4px solid #64748b; border-radius:14px;">
          <div class="text-2 mb-4" style="font-size:11px; font-weight:bold; color:var(--text-2);">سلف المندوب القائمة (شؤون الموظفين)</div>
          <div class="mono font-bold text-bad" style="font-size:20px; color:#ef4444 !important;">${formatCurrency(totalRemainingLoans)}</div>
          <div style="font-size:10px; color:var(--text-3); margin-top:4px;">السلف النشطة: ${repLoansList.length} سلفة قائمة</div>
        </div>
      </div>

      <!-- Outstanding Loans Details Section (from HR module) -->
      ${loansTableHtml}

      <!-- JE-Based Loans Section (from Journal Entries) -->
      ${jeLoansHtml}

      <!-- Invoices and Items Section -->
      <h3 class="font-heading mb-12" style="font-size:15px; border-bottom: 1px solid var(--border-soft); padding-bottom: 6px; margin-top: 24px;">📄 فواتير مبيعات المندوب وتفاصيل الأصناف والربحية</h3>
    `;

    if (filteredInvoices.length === 0) {
      html += `<div class="alert info mb-24" style="text-align:center;">لا توجد فواتير مبيعات مسجلة لـ ${repName} في الفترة من ${fromDate} إلى ${toDate}</div>`;
    } else {
      html += `
        <div class="table-container mb-24">
          <table class="data-dense" style="width:100%;">
            <thead>
              <tr style="background:var(--bg-3);">
                <th>رقم الفاتورة</th>
                <th>العميل</th>
                <th>طريقة الدفع</th>
                <th class="mono">الإجمالي</th>
                <th class="mono">المحصل</th>
                <th class="mono">المديونية</th>
                <th class="mono">التكلفة</th>
                <th class="mono">الربح</th>
                <th>نسبة الربح</th>
              </tr>
            </thead>
            <tbody>
      `;

      filteredInvoices.forEach(inv => {
        const invNo = inv.number || inv.invoiceNumber || inv.id;
        const custName = customers.find(c => c.id === inv.customerId)?.name || inv.customerName || "عميل نقدي";
        const methodStr = inv.paymentMethod === "cash" ? "نقدي" : inv.paymentMethod === "credit" ? "آجل" : "جزئي";
        
        let invCost = 0;
        let invRev = inv.subtotal || 0;
        
        const lineRows = (inv.lines || []).map(l => {
          const prod = allProducts.find(p => p.id === l.productId);
          const lCostPrice = prod ? (prod.purchasePrice !== undefined ? prod.purchasePrice : (prod.costPrice !== undefined ? prod.costPrice : (prod.averageCost || 0))) : (l.averageCost || l.costPrice || l.purchasePrice || 0);
          const lQty = l.qty || 0;
          const lCost = lQty * lCostPrice;
          invCost += lCost;

          const lPrice = l.unitPrice !== undefined ? l.unitPrice : (l.price || 0);
          const lDisc = l.discount || 0;
          const lRev = lQty * lPrice * (1 - lDisc / 100);
          const lProfit = lRev - lCost;
          const lProfitColor = lProfit >= 0 ? "text-good" : "text-bad";

          return `
            <tr>
              <td style="padding:6px 12px; text-align:right; font-weight:bold; color:var(--text-1);">${l.productName || "صنف غير معروف"}</td>
              <td style="padding:6px 12px;" class="mono">${lQty}</td>
              <td style="padding:6px 12px;" class="mono">${formatCurrency(lPrice)}</td>
              <td style="padding:6px 12px;" class="mono">${lDisc}%</td>
              <td style="padding:6px 12px;" class="mono font-bold">${formatCurrency(lRev)}</td>
              <td style="padding:6px 12px;" class="mono">${formatCurrency(lCost)}</td>
              <td style="padding:6px 12px;" class="mono font-bold ${lProfitColor}">${formatCurrency(lProfit)}</td>
            </tr>
          `;
        }).join("");

        const invTotal = inv.totalWithVat || 0;
        const invPaid = inv.paidAmount || 0;
        const invRem = inv.remainingAmount || 0;
        const profit = invRev - invCost;
        const profitPct = invRev > 0 ? (profit / invRev) * 100 : 0;
        const profitColor = profit >= 0 ? "text-good" : "text-bad";

        html += `
          <tr style="background:var(--bg-1); font-weight:bold; border-top: 2px solid var(--border-soft);">
            <td><a href="javascript:void(0)" onclick="window.viewInvoice && window.viewInvoice('${inv.id}')" style="color:var(--brand); text-decoration:underline;">${invNo}</a></td>
            <td>${custName}</td>
            <td><span class="badge ${inv.paymentMethod === "cash" ? "good" : "warning"}">${methodStr}</span></td>
            <td class="mono font-bold">${formatCurrency(invTotal)}</td>
            <td class="mono text-good">${formatCurrency(invPaid)}</td>
            <td class="mono text-bad">${formatCurrency(invRem)}</td>
            <td class="mono">${formatCurrency(invCost)}</td>
            <td class="mono ${profitColor}">${formatCurrency(profit)}</td>
            <td class="mono ${profitColor}">${profitPct.toFixed(1)}%</td>
          </tr>
          <!-- Invoice items details -->
          <tr style="background:var(--bg-2);">
            <td colspan="9" style="padding:8px 24px; background:var(--bg-2);">
              <div style="font-size:11px; color:var(--text-2); margin-bottom:4px; font-weight:bold;">📦 تفاصيل الأصناف المباعة بالتسعير الحقيقي (التكلفة = سعر الشراء الأخير):</div>
              <table style="width:100%; border:1px solid var(--border-soft); background:var(--bg-0); font-size:11px; margin-bottom:8px; border-radius:8px;">
                <thead>
                  <tr style="background:var(--bg-1);">
                    <th style="padding:6px 12px; text-align:right;">الصنف</th>
                    <th style="padding:6px 12px;" class="mono">الكمية</th>
                    <th style="padding:6px 12px;" class="mono">سعر البيع</th>
                    <th style="padding:6px 12px;" class="mono">الخصم</th>
                    <th style="padding:6px 12px;" class="mono">إجمالي المبيعات</th>
                    <th style="padding:6px 12px;" class="mono">التكلفة</th>
                    <th style="padding:6px 12px;" class="mono">الربح</th>
                  </tr>
                </thead>
                <tbody>
                  ${lineRows}
                </tbody>
              </table>
            </td>
          </tr>
        `;
      });

      html += `
            </tbody>
          </table>
        </div>
      `;
    }

    // Comprehensive Customer Balances Report Table (Following Filters)
    html += `
      <!-- Full Representative Customer Debts Report -->
      <h3 class="font-heading mb-12" style="font-size:15px; border-bottom: 1px solid var(--border-soft); padding-bottom: 6px; margin-top: 24px;">📊 تقرير حركة مديونيات وأرصدة كافة عملاء المندوب</h3>
    `;

    if (customerList.length === 0) {
      html += `<div class="alert info mb-24" style="text-align:center;">لا يوجد عملاء مسجلين للمندوب ${repName}</div>`;
    } else {
      html += `
        <div class="table-container mb-24">
          <table class="data-dense" style="width:100%;">
            <thead>
              <tr style="background:var(--bg-3);">
                <th>اسم العميل</th>
                <th class="mono">المديونية السابقة (رصيد أول الفترة)</th>
                <th class="mono">مبيعات الفترة (+)</th>
                <th class="mono">تحصيلات الفترة (-)</th>
                <th class="mono" style="color:var(--brand);">المديونية الحالية (رصيد نهاية الفترة)</th>
                <th class="no-print">حالة حركة الفترة</th>
              </tr>
            </thead>
            <tbody>
              ${customerMovementRows}
            </tbody>
          </table>
        </div>
      `;
    }

    // Receipts section
    html += `<h3 class="font-heading mb-12" style="font-size:15px; border-bottom: 1px solid var(--border-soft); padding-bottom: 6px;">💵 سندات القبض والتحصيلات اللاحقة لعملاء المندوب خلال الفترة</h3>`;

    if (filteredReceipts.length === 0) {
      html += `<div class="alert info" style="text-align:center;">لا توجد سندات قبض مسجلة لـ ${repName} في الفترة من ${fromDate} إلى ${toDate}</div>`;
    } else {
      html += `
        <div class="table-container">
          <table class="data-dense" style="width:100%;">
            <thead>
              <tr style="background:var(--bg-3);">
                <th>رقم السند</th>
                <th>اسم العميل</th>
                <th>طريقة التحصيل</th>
                <th>البيان/الملاحظات</th>
                <th class="mono">القيمة المحصلة</th>
              </tr>
            </thead>
            <tbody>
      `;

      filteredReceipts.forEach(rcpt => {
        const rcptNo = rcpt.id?.slice(0, 8) || "—";
        const rcptCustName = rcpt.accountName || "عميل";
        const methodStr = rcpt.method === "cash" ? "نقدي" : rcpt.method === "bank" ? "تحويل بنكي" : "شيك";
        const rcptNotes = rcpt.notes || "سداد حساب";
        const rcptAmount = rcpt.amount || 0;

        html += `
          <tr style="background:var(--bg-1);">
            <td class="mono font-bold">${rcptNo}</td>
            <td style="font-weight:bold;">${rcptCustName}</td>
            <td><span class="badge ${rcpt.method === "cash" ? "good" : "info"}">${methodStr}</span></td>
            <td>${rcptNotes}</td>
            <td class="mono font-bold text-good" style="font-size:15px;">${formatCurrency(rcptAmount)}</td>
          </tr>
        `;
      });

      html += `
            </tbody>
          </table>
        </div>
      `;
    }

    resultsEl.innerHTML = html;

  } catch (err) {
    resultsEl.innerHTML = `<div class="alert bad">حدث خطأ في تحميل التقرير اليومي: ${err.message}</div>`;
  }
}

function openTargetPlanner(repId, repName, targetAmount) {
  selectedRepPlanner = repId;
  document.getElementById("planner-rep-name").textContent = repName;
  document.getElementById("planner-monthly-target").value = targetAmount;
  
  // Reset product mix to some defaults or empty
  currentPlannerMix = [];
  
  // Try to pre-populate with first 2 products as sample if available
  if (allProducts.length > 0) {
    currentPlannerMix.push({
      productId: allProducts[0].id,
      productName: allProducts[0].name,
      price: allProducts[0].salePrice || 100,
      weight: 50
    });
    if (allProducts.length > 1) {
      currentPlannerMix.push({
        productId: allProducts[1].id,
        productName: allProducts[1].name,
        price: allProducts[1].salePrice || 100,
        weight: 50
      });
    }
  }

  recalculatePlannerDaily();
  window.openModal("target-planner-modal");
}

function recalculatePlannerDaily() {
  const target = parseFloat(document.getElementById("planner-monthly-target").value) || 0;
  const days = parseFloat(document.getElementById("planner-work-days").value) || 26;
  const dailyNeeded = days > 0 ? (target / days) : 0;
  
  document.getElementById("planner-daily-needed").textContent = `${formatCurrency(dailyNeeded)}`;

  renderPlannerMix(dailyNeeded);
}

function addProductToPlannerMix() {
  const sel = document.getElementById("planner-product-select");
  const pId = sel.value;
  if (!pId) return;

  if (currentPlannerMix.some(x => x.productId === pId)) {
    window.showToast("هذا الصنف مضاف بالفعل للمزيج", "warning");
    return;
  }

  const opt = sel.options[sel.selectedIndex];
  const name = opt.textContent.split(" (")[0];
  const price = parseFloat(opt.dataset.price) || 100;

  // Split remaining weight among items or default to 0
  const currentTotalWeight = currentPlannerMix.reduce((s, x) => s + x.weight, 0);
  const remaining = Math.max(0, 100 - currentTotalWeight);

  currentPlannerMix.push({
    productId: pId,
    productName: name,
    price: price,
    weight: remaining > 0 ? remaining : 0
  });

  sel.value = "";
  recalculatePlannerDaily();
}

function removeProductFromPlannerMix(index) {
  currentPlannerMix.splice(index, 1);
  recalculatePlannerDaily();
}

function updateMixRowWeight(index, val) {
  currentPlannerMix[index].weight = parseFloat(val) || 0;
  
  // Recalculate totals and check warning without fully re-rendering immediately to protect cursor focus
  const target = parseFloat(document.getElementById("planner-monthly-target").value) || 0;
  const days = parseFloat(document.getElementById("planner-work-days").value) || 26;
  const dailyNeeded = days > 0 ? (target / days) : 0;
  
  let totalWeight = 0;
  let totalAmount = 0;
  let totalCartons = 0;

  currentPlannerMix.forEach((item, i) => {
    totalWeight += item.weight;
    const rowAmount = dailyNeeded * (item.weight / 100);
    totalAmount += rowAmount;
    
    const rowCartons = item.price > 0 ? (rowAmount / item.price) : 0;
    totalCartons += rowCartons;

    // Dynamically update individual row cells to preserve input state
    const amtEl = document.getElementById(`planner-row-amt-${i}`);
    const cartEl = document.getElementById(`planner-row-cart-${i}`);
    if (amtEl) amtEl.textContent = formatCurrency(rowAmount);
    if (cartEl) cartEl.textContent = `${rowCartons.toFixed(1)} كرتونة / وحدة`;
  });

  // Update footer cells
  document.getElementById("planner-total-weight-cell").textContent = `${totalWeight}%`;
  document.getElementById("planner-total-amount-cell").textContent = formatCurrency(totalAmount);
  document.getElementById("planner-total-cartons-cell").textContent = `${totalCartons.toFixed(1)} كرتونة`;

  // Warning check
  const warnEl = document.getElementById("planner-weight-warning");
  const sumEl = document.getElementById("planner-current-weight-sum");
  if (warnEl && sumEl) {
    sumEl.textContent = totalWeight;
    if (Math.abs(totalWeight - 100) > 0.01) {
      warnEl.classList.remove("hidden");
    } else {
      warnEl.classList.add("hidden");
    }
  }
}

function renderPlannerMix(dailyNeeded) {
  const tbody = document.getElementById("planner-mix-tbody");
  if (!tbody) return;

  if (currentPlannerMix.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:16px; color:var(--text-2);">لا توجد أصناف في مزيج الأهداف بعد</td></tr>`;
    document.getElementById("planner-total-weight-cell").textContent = "0%";
    document.getElementById("planner-total-amount-cell").textContent = "0.00 ر.س";
    document.getElementById("planner-total-cartons-cell").textContent = "0 كرتونة";
    return;
  }

  let totalWeight = 0;
  let totalAmount = 0;
  let totalCartons = 0;

  tbody.innerHTML = currentPlannerMix.map((item, i) => {
    const rowAmount = dailyNeeded * (item.weight / 100);
    const rowCartons = item.price > 0 ? (rowAmount / item.price) : 0;

    totalWeight += item.weight;
    totalAmount += rowAmount;
    totalCartons += rowCartons;

    return `
      <tr>
        <td><strong style="color:var(--text-1);">${item.productName}</strong></td>
        <td class="mono">${formatCurrency(item.price)}</td>
        <td>
          <input type="number" class="input sm mono" style="width:80px; text-align:center; display:inline-block;"
                 value="${item.weight}" oninput="updateMixRowWeight(${i}, this.value)" /> %
        </td>
        <td class="mono text-indigo" id="planner-row-amt-${i}">${formatCurrency(rowAmount)}</td>
        <td class="mono font-bold text-brand" id="planner-row-cart-${i}">${rowCartons.toFixed(1)} كرتونة / وحدة</td>
        <td class="no-print">
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="removeProductFromPlannerMix(${i})">🗑️</button>
        </td>
      </tr>
    `;
  }).join("");

  document.getElementById("planner-total-weight-cell").textContent = `${totalWeight}%`;
  document.getElementById("planner-total-amount-cell").textContent = formatCurrency(totalAmount);
  document.getElementById("planner-total-cartons-cell").textContent = `${totalCartons.toFixed(1)} كرتونة`;

  // Warning check
  const warnEl = document.getElementById("planner-weight-warning");
  const sumEl = document.getElementById("planner-current-weight-sum");
  if (warnEl && sumEl) {
    sumEl.textContent = totalWeight;
    if (Math.abs(totalWeight - 100) > 0.01) {
      warnEl.classList.remove("hidden");
    } else {
      warnEl.classList.add("hidden");
    }
  }
}

// ── تسوية السلفة بقيد محاسبي (بدون مسير رواتب) ─────────────────────
// يُستدعى من زر "✓ تسوية بقيد" في جدول سلف المناديب
window.settleRepLoanByJournal = async (loanId, amount, empName) => {
  const confirmed = await (typeof showConfirm === "function"
    ? showConfirm(
        `تسوية سلفة ${empName} بمبلغ ${amount} ر.س عبر القيد المحاسبي؟\nسيتم تصفير الرصيد المتبقي وتغيير حالة السلفة إلى "مسوّاة".`,
        "تأكيد التسوية"
      )
    : confirm(`تسوية سلفة ${empName} بمبلغ ${amount} ر.س ؟`));

  if (!confirmed) return;

  try {
    const loanRef = doc(db, `companies/${COMPANY_ID}/employeeLoans`, loanId);
    await updateDoc(loanRef, {
      paidAmount:       amount,
      remainingBalance: 0,
      status:           "settled_journal",
      settledAt:        new Date().toISOString(),
      settledNote:      `تمت التسوية بقيد محاسبي — ${new Date().toLocaleDateString("ar-SA")}`,
    });

    if (typeof showToast === "function") {
      showToast(`✅ تمت تسوية سلفة ${empName} — الرصيد صفر الآن`, "success");
    }

    // Refresh the report automatically
    const updateBtn = document.getElementById("update-report-btn");
    if (updateBtn) updateBtn.click();

  } catch (err) {
    console.error("[settleRepLoanByJournal]", err);
    if (typeof showToast === "function") {
      showToast("حدث خطأ أثناء التسوية: " + err.message, "error");
    }
  }
};

