// ============================================================
// IDHAM ERP — Rep Performance Report & Comprehensive Daily Report
// ============================================================
import { COLS, getAll, collection, db, COMPANY_ID } from "../../utils/db.js";
import { query, orderBy, limit, getDocs, where, doc, updateDoc } from "../../utils/db.js";
import { formatCurrency, formatPercent, getTargetColor, todayString } from "../../utils/formatters.js";

let allProducts = [];
let allReps = [];
let currentPlannerMix = [];

export async function render(container, user) {
  allReps = await getAll(COLS.salesReps(), [orderBy("name")]).catch(() => []);
  allProducts = await getAll(COLS.products(), [orderBy("name")]).catch(() => []);

  container.innerHTML = getTemplateHTML();

  // Populate product select for planner
  const prodSelect = document.getElementById("planner-product-select");
  if (prodSelect) {
    prodSelect.innerHTML = '<option value="">-- اختر صنف --</option>' +
      allProducts.map(p => `<option value="${p.id}" data-price="${p.salePrice || 0}">${p.name} (${formatCurrency(p.salePrice)})</option>`).join("");
  }

  // Populate rep select for daily report
  const repSelect = document.getElementById("daily-rep-select");
  if (repSelect) {
    repSelect.innerHTML = '<option value="">-- الكل (بدون تحديد) --</option>' +
      allReps.map(r => `<option value="${r.id}">${r.name}</option>`).join("");
  }

  // Set default dates for KPI filters
  const fromEl = document.getElementById("kpi-filter-from");
  const toEl = document.getElementById("kpi-filter-to");
  if (fromEl && toEl) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const fmt = d => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    fromEl.value = fmt(firstDay);
    toEl.value = fmt(now);
  }

  // Set default dates for daily report
  const dailyFrom = document.getElementById("daily-report-from");
  const dailyTo = document.getElementById("daily-report-to");
  const todayStr = new Date().toISOString().split("T")[0];
  if (dailyFrom) dailyFrom.value = todayStr;
  if (dailyTo) dailyTo.value = todayStr;

  // Global window functions
  window.openTargetPlanner = openTargetPlanner;
  window.addProductToPlannerMix = addProductToPlannerMix;
  window.removeProductFromPlannerMix = removeProductFromPlannerMix;
  window.recalculatePlannerDaily = recalculatePlannerDaily;
  window.updateMixRowWeight = updateMixRowWeight;
  window.switchRepTab = switchRepTab;
  window.loadRepDailyReport = loadRepDailyReport;
  window.setKpiRange = setKpiRange;
  window.loadRepPerformance = loadRepPerformance;

  // Default to KPIs tab
  switchRepTab("kpis");
}

function getTemplateHTML() {
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
          <button class="btn btn-sm" id="tab-rep-daily" onclick="switchRepTab('daily')" style="border-radius:8px; padding:6px 16px; border:none; cursor:pointer;">📑 التقرير اليومي التفصيلي</button>
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
          <div style="margin-right:auto; display:flex; gap:8px; margin-top:20px;">
            <button class="btn btn-secondary" onclick="window.print()">🖨️ طباعة التقرير</button>
            <button class="btn btn-primary" id="update-report-btn" onclick="loadRepDailyReport(true)">🔄 تحديث</button>
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
  const fromEl = document.getElementById("kpi-filter-from");
  const toEl = document.getElementById("kpi-filter-to");
  if (!fromEl || !toEl) return;

  const now = new Date();
  const fmt = d => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  if (range === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    fromEl.value = fmt(start);
    toEl.value = fmt(now);
  } else if (range === "last_month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    fromEl.value = fmt(start);
    toEl.value = fmt(end);
  } else if (range === "year") {
    const start = new Date(now.getFullYear(), 0, 1);
    fromEl.value = fmt(start);
    toEl.value = fmt(now);
  }

  loadRepPerformance();
}

function switchRepTab(tab) {
  const kpisContent = document.getElementById("rep-kpis-tab-content");
  const dailyContent = document.getElementById("rep-daily-tab-content");
  const kpisBtn = document.getElementById("tab-rep-kpis");
  const dailyBtn = document.getElementById("tab-rep-daily");

  if (!kpisContent || !dailyContent || !kpisBtn || !dailyBtn) return;

  if (tab === "kpis") {
    kpisContent.classList.remove("hidden");
    dailyContent.classList.add("hidden");
    kpisBtn.style.background = "var(--brand)";
    kpisBtn.style.color = "#ffffff";
    kpisBtn.style.fontWeight = "bold";
    dailyBtn.style.background = "transparent";
    dailyBtn.style.color = "var(--text-1)";
    dailyBtn.style.fontWeight = "normal";
    loadRepPerformance();
  } else {
    kpisContent.classList.add("hidden");
    dailyContent.classList.remove("hidden");
    dailyBtn.style.background = "var(--brand)";
    dailyBtn.style.color = "#ffffff";
    dailyBtn.style.fontWeight = "bold";
    kpisBtn.style.background = "transparent";
    kpisBtn.style.color = "var(--text-1)";
    kpisBtn.style.fontWeight = "normal";
    loadRepDailyReport();
  }
}

async function loadRepPerformance(forceRefresh = false) {
  const cardsEl = document.getElementById("perf-cards");
  if (!cardsEl) return;

  try {
    const reps = allReps;
    const from = document.getElementById("kpi-filter-from")?.value || "";
    const to = document.getElementById("kpi-filter-to")?.value || "";

    const [salesSnap, rcptSnap, custSnap] = await Promise.all([
      getAll(COLS.salesInvoices()),
      getAll(COLS.receipts()),
      getAll(COLS.customers())
    ]);

    const invoices = salesSnap.filter(inv => (!from || inv.date >= from) && (!to || inv.date <= to) && inv.status !== "cancelled");
    const receipts = rcptSnap.filter(r => (!from || r.date >= from) && (!to || r.date <= to) && r.entityType === "customer");

    const custRepMap = {};
    custSnap.forEach(c => { custRepMap[c.id] = c.repId || null; });

    const salesByRep = {};
    const paidByRep  = {};
    const countByRep = {};

    invoices.forEach(inv => {
      if (inv.repId) {
        salesByRep[inv.repId] = (salesByRep[inv.repId] || 0) + (inv.totalWithVat || 0);
        paidByRep[inv.repId]  = (paidByRep[inv.repId] || 0) + (inv.amountPaid || inv.paidAmount || 0);
        countByRep[inv.repId] = (countByRep[inv.repId] || 0) + 1;
      }
    });

    receipts.forEach(r => {
      const repId = custRepMap[r.targetId];
      if (repId) {
        paidByRep[repId] = (paidByRep[repId] || 0) + (r.amount || 0);
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
      const rate     = sales < target ? 1 : (r.commissionRate || 0);
      const comm     = paid * (rate / 100);
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

async function loadRepDailyReport(forceRefresh = false) {
  const resEl = document.getElementById("daily-report-results");
  if (!resEl) return;

  resEl.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div><span>جارٍ إعداد التقرير اليومي للمبيعات والتحصيلات...</span></div>';

  const repId = document.getElementById("daily-rep-select")?.value || "";
  const todayStr = new Date().toISOString().split("T")[0];
  const from = document.getElementById("daily-report-from")?.value || todayStr;
  const to = document.getElementById("daily-report-to")?.value || todayStr;

  try {
    const [invoicesAll, receiptsAll, customersAll, salesReturnsAll, employeesAll, journalEntriesAll, repAccountsAll, hrLoansSnap, collectionsAll] = await Promise.all([
      getAll(COLS.salesInvoices()),
      getAll(COLS.receipts()),
      getDocs(collection(db, `companies/${COMPANY_ID}/customers`)).then(snap => snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      getAll(COLS.salesReturns ? COLS.salesReturns() : "salesReturns").catch(() => []),
      getAll(COLS.employees()),
      getAll(COLS.journalEntries(), [where("date", ">=", "2026-08-01")]).catch(() => []),
      getAll(COLS.chartOfAccounts(), [where("parentCode", "==", "1-1-2-1-2")]).catch(() => []),
      getDocs(collection(db, `companies/${COMPANY_ID}/employeeLoans`)).catch(() => ({ docs: [] })),
      getDocs(collection(db, `companies/${COMPANY_ID}/collections`)).then(snap => snap.docs.map(d => ({ id: d.id, ...d.data() }))).catch(() => [])
    ]);

    const hrLoansList = (hrLoansSnap.docs || []).map(d => ({ id: d.id, ...d.data() }));

    // ============================================================
    // TRUE BALANCE CALCULATION — same logic as consolidated-balances.js
    // كحساب الرصيد الحقيقي من الفواتير+المرتجعات+التحصيلات+السندات
    // بدلاً من الاعتماد على cust.balance المخزون الذي يتضخم
    // ============================================================
    const custTrueBalanceMap = {}; // custId → computed closing balance
    const nonCancelledInvoices = invoicesAll.filter(i => i.status !== "cancelled");
    const nonCancelledReturns = (salesReturnsAll || []).filter(r => r.status !== "cancelled");
    const customerReceipts = receiptsAll.filter(r => r.entityType === "customer");

    for (const c of customersAll) {
      let balance = parseFloat(c.openingBalance || 0);

      // + فواتير المبيعات
      nonCancelledInvoices.filter(i => i.customerId === c.id).forEach(inv => {
        balance += parseFloat(inv.totalWithVat || inv.total || 0);
      });

      // − مرتجعات المبيعات
      nonCancelledReturns.filter(r => r.customerId === c.id).forEach(ret => {
        balance -= parseFloat(ret.totalWithVat !== undefined ? ret.totalWithVat : (ret.total !== undefined ? ret.total : (ret.subtotal || 0)));
      });

      // − سندات القبض (admin receipts)
      customerReceipts.filter(r => r.targetId === c.id).forEach(rcpt => {
        balance -= parseFloat(rcpt.amount || 0);
      });

      // − تحصيلات المناديب (collections)
      (collectionsAll || []).filter(col => col.customerId === c.id).forEach(col => {
        balance -= parseFloat(col.amount || 0);
      });

      custTrueBalanceMap[c.id] = Math.round(balance * 100) / 100;
    }
    // ============================================================

    // Map rep chart of accounts
    const repCoaMap = {};
    allReps.forEach(rep => {
      const repNameLower = (rep.name || "").trim().toLowerCase();
      const match = repAccountsAll.find(acc => {
        const accNameLower = (acc.name || "").toLowerCase();
        return accNameLower.includes(repNameLower) || repNameLower.split(" ").some(w => w.length > 1 && accNameLower.includes(w));
      });
      if (match) repCoaMap[rep.id] = match;
    });

    const custRepMap = {};
    customersAll.forEach(c => { custRepMap[c.id] = c.repId || null; });

    // Filter invoices & receipts
    const filteredInvoices = invoicesAll.filter(inv => {
      if (inv.status === "cancelled") return false;
      if (inv.date < from || inv.date > to) return false;
      if (repId && inv.repId !== repId) return false;
      return true;
    });

    const filteredReceipts = receiptsAll.filter(r => {
      if (r.entityType !== "customer") return false;
      if (!r.date || r.date < from || r.date > to) return false;
      if (repId) return custRepMap[r.targetId] === repId;
      return true;
    });

    let totalSales = 0;
    let totalCollected = 0;
    let totalNetProfit = 0;

    filteredInvoices.forEach(inv => {
      totalSales += inv.totalWithVat || 0;
      totalCollected += inv.paidAmount || 0;

      let invCost = 0;
      const invSubtotal = inv.subtotal || 0;
      (inv.lines || []).forEach(line => {
        const prod = allProducts.find(p => p.id === line.productId);
        const cost = prod ? (prod.purchasePrice !== undefined ? prod.purchasePrice : (prod.costPrice !== undefined ? prod.costPrice : (prod.averageCost || 0)))
                          : (line.averageCost || line.costPrice || line.purchasePrice || 0);
        const qty = line.qty || 0;
        invCost += cost * qty;
      });
      totalNetProfit += (invSubtotal - invCost);
    });

    filteredReceipts.forEach(r => {
      totalCollected += (r.amount || 0);
    });

    const netDebtDiff = totalSales - totalCollected;
    const isDebtReduced = netDebtDiff < 0;
    const debtColor = isDebtReduced ? "good" : "bad";
    const debtTitle = isDebtReduced ? "صافي تخفيض المديونية" : "إجمالي المديونية الجديدة";
    const debtSub = isDebtReduced ? "التحصيلات تفوق مبيعات اليوم" : "صافي الزيادة في المديونية اليوم";
    const absDebtDiff = Math.abs(netDebtDiff);

    // Current Customers Total Debt — مربوط بمجمع الأرصدة (الرصيد الحقيقي)
    let currentCustomersDebt = 0;
    customersAll.forEach(cust => {
      const trueBalance = custTrueBalanceMap[cust.id] || 0;
      if (trueBalance <= 0) return; // لا نحسب الأرصدة السالبة أو الصفرية
      if (repId) {
        if ((cust.repId || cust.assignedRepId) === repId) {
          currentCustomersDebt += trueBalance;
        }
      } else {
        if (cust.repId || cust.assignedRepId) {
          currentCustomersDebt += trueBalance;
        }
      }
    });

    // Detect JE Loans
    const stopWords = new Set(["المندوب", "مندوب", "السيد", "أحمد", "احمد", "شركة", "مؤسسة", "السيارة", "سيارة"]);

    const _detectJeLoan = (je, rep) => {
      const desc = (je.description || "").toLowerCase();
      // Exclude settlements, closings, reversals, paybacks, and credit entries
      if (desc.includes("تقفيل") || desc.includes("إقفال") || desc.includes("اقفال") || desc.includes("اققال") || 
          desc.includes("سداد") || desc.includes("عكس") || desc.includes("تسوية") || desc.includes("خصم") || desc.includes("مقاصة")) return false;
      if (je.date && je.date < "2026-08-01") return false;
      
      const repCoa = repCoaMap[rep.id];
      const repWords = (rep.name || "").trim().toLowerCase().split(" ").filter(w => w.length > 1 && !stopWords.has(w));
      const hasLoanKw = ["سلفة", "سلف", "قرض", "استلاف", "advance", "loan"].some(kw => desc.includes(kw));

      // MUST have debit on loan/advance account (credit means repayment/settlement)
      const hasRepAccountDebit = repCoa && (je.lines || []).some(l => (l.accountId === repCoa.id || l.accountCode === repCoa.code) && (l.debit || 0) > 0);
      const hasLineNoteMatch = (je.lines || []).some(l => {
        const lineNote = (l.notes || l.note || l.accountName || "").toLowerCase();
        return hasLoanKw && repWords.length > 0 && repWords.some(w => lineNote.includes(w)) && (l.debit || 0) > 0;
      });

      const isLoanDesc = hasLoanKw && repWords.length > 0 && repWords.some(w => desc.includes(w));

      // Strictly verify that there is NO credit on rep account (if credit exists, it's a settlement)
      const hasRepAccountCredit = repCoa && (je.lines || []).some(l => (l.accountId === repCoa.id || l.accountCode === repCoa.code) && (l.credit || 0) > 0);
      if (hasRepAccountCredit) return false;

      return isLoanDesc || hasRepAccountDebit || hasLineNoteMatch;
    };

    let jeLoansList = [];
    if (repId) {
      const repObj = allReps.find(r => r.id === repId);
      if (repObj) {
        jeLoansList = journalEntriesAll
          .filter(je => _detectJeLoan(je, repObj))
          .map(je => {
            const repCoa = repCoaMap[repId];
            let amount = 0;
            if (repCoa) {
              const repLine = (je.lines || []).find(l => (l.accountId === repCoa.id || l.accountCode === repCoa.code) && (l.debit || 0) > 0);
              amount = repLine ? (repLine.debit || 0) : 0;
            }
            if (!amount) amount = (je.lines || []).reduce((s, l) => s + (l.debit || 0), 0);
            return {
              id: je.id,
              entryNumber: je.entryNumber || je.id.slice(0, 8),
              date: je.date,
              description: je.description,
              amount,
              status: je.status || "posted",
              repName: repObj.name
            };
          });
      }
    } else {
      allReps.forEach(rep => {
        const list = journalEntriesAll
          .filter(je => _detectJeLoan(je, rep))
          .map(je => {
            const repCoa = repCoaMap[rep.id];
            let amount = 0;
            if (repCoa) {
              const repLine = (je.lines || []).find(l => (l.accountId === repCoa.id || l.accountCode === repCoa.code) && (l.debit || 0) > 0);
              amount = repLine ? (repLine.debit || 0) : 0;
            }
            if (!amount) amount = (je.lines || []).reduce((s, l) => s + (l.debit || 0), 0);
            return {
              id: je.id,
              entryNumber: je.entryNumber || je.id.slice(0, 8),
              date: je.date,
              description: je.description,
              amount,
              status: je.status || "posted",
              repName: rep.name
            };
          });
        jeLoansList.push(...list);
      });
    }

    const jeTotal = (jeLoansList || []).reduce((s, j) => s + (j.amount || 0), 0);

    // Filter HR Loans
    let repLoansList = [];
    let totalHrLoansBalance = 0;

    const repObj = allReps.find(r => r.id === repId);
    let targetEmpId = repObj ? repObj.employeeId : null;
    if (repObj && !targetEmpId) {
      const matchEmp = employeesAll.find(e => e.name.includes(repObj.name.trim()) || repObj.name.trim().includes(e.name));
      if (matchEmp) targetEmpId = matchEmp.id;
    }

    if (repId) {
      if (targetEmpId) {
        repLoansList = hrLoansList.filter(l => l.empId === targetEmpId && l.status === "active" && (l.remainingBalance > 0));
        totalHrLoansBalance = repLoansList.reduce((sum, l) => sum + (l.remainingBalance || 0), 0);
      }
    } else {
      const repEmpIds = new Set(allReps.map(r => r.employeeId).filter(Boolean));
      repLoansList = hrLoansList.filter(l => {
        if (l.status !== "active" || !(l.remainingBalance > 0)) return false;
        if (repEmpIds.has(l.empId)) return true;
        return allReps.some(r => l.empName?.includes(r.name) || r.name?.includes(l.empName));
      });
      totalHrLoansBalance = repLoansList.reduce((sum, l) => sum + (l.remainingBalance || 0), 0);
    }

    // Customer Movements Table
    const repCustomers = customersAll.filter(c => repId ? ((c.repId || c.assignedRepId) === repId) : (c.repId || c.assignedRepId)).map(cust => {
      let custSales = 0;
      filteredInvoices.forEach(inv => { if (inv.customerId === cust.id) custSales += (inv.totalWithVat || 0); });

      let custCollections = 0;
      filteredInvoices.forEach(inv => { if (inv.customerId === cust.id) custCollections += (inv.paidAmount || 0); });
      (salesReturnsAll || []).forEach(ret => { if (ret.customerId === cust.id && ret.status !== "cancelled") custCollections += (ret.totalWithVat || ret.total || ret.amount || 0); });
      filteredReceipts.forEach(rcpt => { if (rcpt.targetId === cust.id) custCollections += (rcpt.amount || 0); });

      // استخدام الرصيد الحقيقي المحسوب من مجمع الأرصدة
      const currentBal = custTrueBalanceMap[cust.id] ?? 0;
      const prevBal = currentBal - custSales + custCollections;
      const hasActivity = custSales > 0 || custCollections > 0;

      return {
        cust,
        prevBal,
        todayCustSales: custSales,
        todayCustCollections: custCollections,
        currentBal,
        hasActivity
      };
    }).filter(item => repId ? true : item.hasActivity);

    repCustomers.sort((a, b) => {
      if (a.hasActivity && !b.hasActivity) return -1;
      if (!a.hasActivity && b.hasActivity) return 1;
      return b.currentBal - a.currentBal;
    });

    const custRowsHTML = repCustomers.map(item => {
      const badge = item.hasActivity ? '<span class="badge good" style="font-size:9px; padding:2px 6px;">نشط بالفترة</span>' : '<span class="badge secondary" style="font-size:9px; padding:2px 6px; background:#e0e0e0; color:#555;">لا توجد حركة</span>';
      const bg = item.hasActivity ? 'rgba(46, 204, 113, 0.06)' : 'var(--bg-1)';
      return `
        <tr style="background: ${bg};">
          <td style="font-weight:bold; color:var(--text-1); background: ${bg} !important;">${item.cust.name}</td>
          <td class="mono font-bold" style="background: ${bg} !important;">${formatCurrency(item.prevBal)}</td>
          <td class="mono font-bold ${item.todayCustSales > 0 ? "text-brand" : ""}" style="background: ${bg} !important;">+ ${formatCurrency(item.todayCustSales)}</td>
          <td class="mono font-bold ${item.todayCustCollections > 0 ? "text-good" : ""}" style="background: ${bg} !important;">- ${formatCurrency(item.todayCustCollections)}</td>
          <td class="mono font-bold text-indigo" style="font-size:13px; background: ${bg} !important;">${formatCurrency(item.currentBal)}</td>
          <td class="no-print" style="text-align:center; background: ${bg} !important;">${badge}</td>
        </tr>
      `;
    }).join("");

    const activeRepName = repId ? (allReps.find(r => r.id === repId)?.name || "المندوب") : "جميع المناديب";

    // HR Loans Section HTML
    let hrLoansSectionHTML = `
      <h3 class="font-heading mb-12" style="font-size:15px; border-bottom: 2px solid #64748b; padding-bottom: 6px; margin-top: 24px; color:#475569;">💸 سلف وقروض المناديب القائمة (الربط المالي مع شؤون الموظفين)</h3>
    `;
    if (repLoansList.length === 0) {
      hrLoansSectionHTML += '<div class="alert info" style="text-align:center;">لا توجد سلف شخصية أو قروض قائمة مسجلة بذمة المندوب حالياً في شؤون الموظفين.</div>';
    } else {
      hrLoansSectionHTML += `
        <div class="table-container mb-24">
          <table class="data-dense" style="width:100%;">
            <thead>
              <tr style="background:#475569;">
                ${repId ? "" : '<th style="background:#475569 !important; color:#fff;">المندوب</th>'}
                <th style="background:#475569 !important; color:#fff;">تاريخ الصرف</th>
                <th style="background:#475569 !important; color:#fff;">البيان والملاحظات</th>
                <th style="background:#475569 !important; color:#fff;" class="mono">قيمة السلفة الكلية</th>
                <th style="background:#475569 !important; color:#fff;" class="mono">المسدد منها</th>
                <th style="background:#475569 !important; color:#fff;" class="mono">الرصيد المتبقي بذمة المندوب</th>
                <th style="background:#475569 !important; color:#fff;">إجراء</th>
              </tr>
            </thead>
            <tbody>
              ${repLoansList.map(loan => {
                const bg = "var(--bg-1)";
                return `
                  <tr style="background:${bg};">
                    ${repId ? "" : `<td style="font-weight:bold; color:var(--text-1); background:${bg} !important;">${loan.empName}</td>`}
                    <td class="mono font-bold" style="background:${bg} !important;">${loan.date}</td>
                    <td style="background:${bg} !important;">${loan.notes || "سلفة شخصية"}</td>
                    <td class="mono" style="background:${bg} !important;">${formatCurrency(loan.amount || 0)}</td>
                    <td class="mono text-good" style="background:${bg} !important;">${formatCurrency(loan.paidAmount || 0)}</td>
                    <td class="mono font-bold text-bad" style="font-size:13px; color:#ef4444 !important; background:${bg} !important;">${formatCurrency(loan.remainingBalance || 0)}</td>
                    <td style="background:${bg} !important; text-align:center;">
                      <button
                        onclick="settleRepLoanByJournal('${loan.id}', ${loan.amount || 0}, '${loan.empName || ""}')"
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

    // JE Loans Section HTML
    let jeLoansSectionHTML = `
      <h3 class="font-heading mb-12" style="font-size:15px; border-bottom:2px solid #6366f1; padding-bottom:6px; margin-top:24px; color:#818cf8;">
        📒 سلف مسجّلة بالقيود المحاسبية (مباشرة من دفتر اليومية)
      </h3>
    `;
    if (jeLoansList.length === 0) {
      jeLoansSectionHTML += `
        <div class="alert info" style="text-align:center;">
          لا توجد سلف مُسجَّلة بقيود محاسبية لهذا المندوب.
          <br><small style="opacity:.7">يُكتشف القيد تلقائياً إذا تضمّن كلمة «سلفة» مع اسم المندوب، أو إذا استخدم حسابه في شجرة الحسابات.</small>
        </div>`;
    } else {
      // jeTotal calculated at outer scope
      jeLoansSectionHTML += `
        <div class="table-container mb-24">
          <table class="data-dense" style="width:100%;">
            <thead>
              <tr style="background:#4f46e5;">
                ${repId ? "" : '<th style="background:#4f46e5 !important; color:#fff;">المندوب</th>'}
                <th style="background:#4f46e5 !important; color:#fff;">رقم القيد</th>
                <th style="background:#4f46e5 !important; color:#fff;">التاريخ</th>
                <th style="background:#4f46e5 !important; color:#fff;">البيان</th>
                <th style="background:#4f46e5 !important; color:#fff;" class="mono">المبلغ</th>
                <th style="background:#4f46e5 !important; color:#fff;">الحالة</th>
                <th style="background:#4f46e5 !important; color:#fff; text-align:center;">إجراء التسوية</th>
              </tr>
            </thead>
            <tbody>
              ${jeLoansList.map(je => {
                const bg = "var(--bg-1)";
                return `
                  <tr style="background:${bg};">
                    ${repId ? "" : `<td style="font-weight:bold;color:var(--text-1);background:${bg} !important;">${je.repName || ""}</td>`}
                    <td class="mono font-bold" style="color:#818cf8;background:${bg} !important;">${je.entryNumber}</td>
                    <td class="mono" style="background:${bg} !important;">${je.date || ""}</td>
                    <td style="background:${bg} !important;">${je.description || "سلفة"}</td>
                    <td class="mono font-bold text-bad" style="font-size:13px;color:#ef4444 !important;background:${bg} !important;">${formatCurrency(je.amount)}</td>
                    <td style="background:${bg} !important;">
                      <span style="background:rgba(16,185,129,.15);color:#10b981;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:800;">
                        ${je.status === "posted" ? "✅ مرحّل" : "📝 مسودة"}
                      </span>
                    </td>
                    <td style="background:${bg} !important; text-align:center;">
                      <button
                        onclick="window.settleJeLoanInteractive('${je.id}', ${je.amount}, '${(je.repName || "").replace(/'/g, "\\'")}', '${je.entryNumber}')"
                        style="background:#10b981; color:#fff; border:none; border-radius:6px; padding:4px 10px; font-size:11px; cursor:pointer; font-weight:700;"
                        title="تسوية هذه السلفة بقيد محاسبي">✓ تسوية السلفة</button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
            <tfoot>
              <tr style="background:var(--bg-3); border-top:2px solid #6366f1;">
                ${repId ? "" : '<td style="background:var(--bg-3) !important;"></td>'}
                <td colspan="3" style="background:var(--bg-3) !important; font-weight:900; color:var(--text-0); text-align:right; font-size:13px;">إجمالي السلف المسجلة بالقيود المحاسبية</td>
                <td class="mono font-bold text-bad" style="background:var(--bg-3) !important; color:#dc2626 !important; font-size:16px;">${formatCurrency(jeTotal)}</td>
                <td style="background:var(--bg-3) !important;"></td>
                <td style="background:var(--bg-3) !important;"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
    }

    // Build Main Output
    let html = `
      <style>
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { background: #fff !important; color: #000 !important; padding: 0 !important; margin: 0 !important; }
          .no-print, .filterbar, .tab-switcher, button, .modal-overlay, .page-header { display: none !important; }
          .page-content { padding: 0 !important; margin: 0 !important; box-shadow: none !important; }
          .card { border: 1px solid #e2e8f0 !important; box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important; background: #f8fafc !important; page-break-inside: avoid; margin-bottom: 12px !important; padding: 12px !important; }
          .print-only-header { display: block !important; }
          .kpi-container-print { display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; justify-content: space-between !important; gap: 6px !important; margin-bottom: 20px !important; }
          .kpi-card-print { flex: 1 !important; min-width: 90px !important; padding: 12px 4px !important; background: #f8fafc !important; text-align: center !important; border-radius: 8px !important; box-shadow: none !important; border: 1px solid #cbd5e1 !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th { background-color: #1e3c72 !important; color: #ffffff !important; font-weight: bold !important; font-size: 9px !important; text-align: center !important; border: 1px solid #cbd5e1 !important; padding: 6px !important; }
          td { border: 1px solid #e2e8f0 !important; padding: 5px !important; font-size: 9px !important; }
        }
      </style>

      <!-- Print Header -->
      <div class="print-only-header" style="display:none; margin-bottom:24px; border-radius:8px; overflow:hidden; border:1px solid #cbd5e1;">
        <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 16px 20px; color: #fff; display: flex; justify-content: space-between; align-items: center;">
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: bold; color: #00f2fe;">نظم الإمداد المتطورة</div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.85); margin-top: 4px;">نظام التوزيع وإدارة المناديب</div>
          </div>
          <div style="text-align: left;">
            <div style="font-size: 14px; font-weight: bold; color: #fff;">سجل تجاري: 7054969006</div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.85); margin-top: 4px;">الرقم الضريبي: 314996148100003</div>
          </div>
        </div>
        <div style="background: #f8fafc; padding: 10px 20px; border-bottom: 2px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #334155; font-weight: bold;">
          <div>تقرير مبيعات وحركة المديونيات اليومي</div>
          <div>الفترة: من ${from} إلى ${to}</div>
          <div>المندوب: ${activeRepName}</div>
          <div>تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA")}</div>
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
        <div class="card kpi-card-print" style="padding:16px; border-left: 4px solid var(--${debtColor}); border-radius:14px;">
          <div class="text-2 mb-4" style="font-size:11px; font-weight:bold; color:var(--text-2);">${debtTitle}</div>
          <div class="mono font-bold text-${debtColor}" style="font-size:20px;">${formatCurrency(absDebtDiff)}</div>
          <div style="font-size:10px; color:var(--text-3); margin-top:4px;">${debtSub}</div>
        </div>
        <div class="card kpi-card-print" style="padding:16px; border-left: 4px solid var(--indigo); border-radius:14px;">
          <div class="text-2 mb-4" style="font-size:11px; font-weight:bold; color:var(--text-2);">صافي أرباح المبيعات</div>
          <div class="mono font-bold text-indigo" style="font-size:20px;">${formatCurrency(totalNetProfit)}</div>
          <div style="font-size:10px; color:var(--text-3); margin-top:4px;">الكمية × (سعر البيع - سعر الشراء)</div>
        </div>
        <div class="card kpi-card-print" style="padding:16px; border-left: 4px solid #f59e0b; border-radius:14px;">
          <div class="text-2 mb-4" style="font-size:11px; font-weight:bold; color:var(--text-2);">إجمالي مديونية العملاء الحالية</div>
          <div class="mono font-bold" style="font-size:20px; color:#d97706;">${formatCurrency(currentCustomersDebt)}</div>
          <div style="font-size:10px; color:var(--text-3); margin-top:4px;">الرصيد القائم لعملاء المندوب حالياً</div>
        </div>
      </div>

      <!-- Invoices and Items Section -->
      <h3 class="font-heading mb-12" style="font-size:15px; border-bottom: 1px solid var(--border-soft); padding-bottom: 6px; margin-top: 24px;">📄 فواتير مبيعات المندوب وتفاصيل الأصناف والربحية</h3>
    `;

    if (filteredInvoices.length === 0) {
      html += `<div class="alert info mb-24" style="text-align:center;">لا توجد فواتير مبيعات مسجلة لـ ${activeRepName} في الفترة من ${from} إلى ${to}</div>`;
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
        const invNum = inv.number || inv.invoiceNumber || inv.id;
        const custName = customersAll.find(c => c.id === inv.customerId)?.name || inv.customerName || "عميل نقدي";
        const method = inv.paymentMethod === "cash" ? "نقدي" : (inv.paymentMethod === "credit" ? "آجل" : "جزئي");

        let invCost = 0;
        const subtotal = inv.subtotal || 0;
        const itemRows = (inv.lines || []).map(line => {
          const prod = allProducts.find(p => p.id === line.productId);
          const cost = prod ? (prod.purchasePrice !== undefined ? prod.purchasePrice : (prod.costPrice !== undefined ? prod.costPrice : (prod.averageCost || 0)))
                            : (line.averageCost || line.costPrice || line.purchasePrice || 0);
          const qty = line.qty || 0;
          const totalLineCost = qty * cost;
          invCost += totalLineCost;

          const unitPrice = line.unitPrice !== undefined ? line.unitPrice : (line.price || 0);
          const disc = line.discount || 0;
          const lineSales = qty * unitPrice * (1 - disc / 100);
          const lineProfit = lineSales - totalLineCost;
          const pCol = lineProfit >= 0 ? "text-good" : "text-bad";

          return `
            <tr>
              <td style="padding:6px 12px; text-align:right; font-weight:bold; color:var(--text-1);">${line.productName || "صنف غير معروف"}</td>
              <td style="padding:6px 12px;" class="mono">${qty}</td>
              <td style="padding:6px 12px;" class="mono">${formatCurrency(unitPrice)}</td>
              <td style="padding:6px 12px;" class="mono">${disc}%</td>
              <td style="padding:6px 12px;" class="mono font-bold">${formatCurrency(lineSales)}</td>
              <td style="padding:6px 12px;" class="mono">${formatCurrency(totalLineCost)}</td>
              <td style="padding:6px 12px;" class="mono font-bold ${pCol}">${formatCurrency(lineProfit)}</td>
            </tr>
          `;
        }).join("");

        const totalWithVat = inv.totalWithVat || 0;
        const paidAmount = inv.paidAmount || 0;
        const remAmount = inv.remainingAmount || 0;
        const profit = subtotal - invCost;
        const profitPct = subtotal > 0 ? (profit / subtotal * 100) : 0;
        const prfCol = profit >= 0 ? "text-good" : "text-bad";

        html += `
          <tr style="background:var(--bg-1); font-weight:bold; border-top: 2px solid var(--border-soft);">
            <td><a href="javascript:void(0)" onclick="window.viewInvoice && window.viewInvoice('${inv.id}')" style="color:var(--brand); text-decoration:underline;">${invNum}</a></td>
            <td>${custName}</td>
            <td><span class="badge ${inv.paymentMethod === "cash" ? "good" : "warning"}">${method}</span></td>
            <td class="mono font-bold">${formatCurrency(totalWithVat)}</td>
            <td class="mono text-good">${formatCurrency(paidAmount)}</td>
            <td class="mono text-bad">${formatCurrency(remAmount)}</td>
            <td class="mono">${formatCurrency(invCost)}</td>
            <td class="mono ${prfCol}">${formatCurrency(profit)}</td>
            <td class="mono ${prfCol}">${profitPct.toFixed(1)}%</td>
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
                  ${itemRows}
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

    // Customer Debts Section
    html += `
      <!-- Full Representative Customer Debts Report -->
      <h3 class="font-heading mb-12" style="font-size:15px; border-bottom: 1px solid var(--border-soft); padding-bottom: 6px; margin-top: 24px;">📊 تقرير حركة مديونيات وأرصدة كافة عملاء المندوب</h3>
    `;

    if (repCustomers.length === 0) {
      html += `<div class="alert info mb-24" style="text-align:center;">لا يوجد عملاء مسجلين للمندوب ${activeRepName}</div>`;
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
              ${custRowsHTML}
            </tbody>
          </table>
        </div>
      `;
    }

    // Receipts Section
    html += `<h3 class="font-heading mb-12" style="font-size:15px; border-bottom: 1px solid var(--border-soft); padding-bottom: 6px;">💵 سندات القبض والتحصيلات اللاحقة لعملاء المندوب خلال الفترة</h3>`;

    if (filteredReceipts.length === 0) {
      html += `<div class="alert info" style="text-align:center;">لا توجد سندات قبض مسجلة لـ ${activeRepName} في الفترة من ${from} إلى ${to}</div>`;
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

      filteredReceipts.forEach(r => {
        const docNum = r.receiptNumber || r.number || r.code || r.id?.slice(0, 8) || "—";
        const custName = r.accountName || r.targetName || r.customerName || "عميل";
        const method = r.method === "cash" ? "نقدي" : (r.method === "bank" ? "تحويل بنكي" : "شيك");
        const note = r.notes || "سداد حساب";
        const amt = r.amount || 0;

        html += `
          <tr style="background:var(--bg-1);">
            <td class="mono font-bold">${docNum}</td>
            <td style="font-weight:bold;">${custName}</td>
            <td><span class="badge ${r.method === "cash" ? "good" : "info"}">${method}</span></td>
            <td>${note}</td>
            <td class="mono font-bold text-good" style="font-size:15px;">${formatCurrency(amt)}</td>
          </tr>
        `;
      });

      html += `
            </tbody>
          </table>
        </div>
      `;
    }

    resEl.innerHTML = html;

  } catch (err) {
    resEl.innerHTML = `<div class="alert bad">حدث خطأ في تحميل التقرير اليومي: ${err.message}</div>`;
  }
}

// ────────────────────────────────────────────────────────────
// PLANNER FUNCTIONS
// ────────────────────────────────────────────────────────────
function openTargetPlanner(repId, repName, targetAmount) {
  document.getElementById("planner-rep-name").textContent = repName;
  document.getElementById("planner-monthly-target").value = targetAmount;
  
  currentPlannerMix = [];
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
  const pId = sel?.value;
  if (!pId) return;

  if (currentPlannerMix.some(x => x.productId === pId)) {
    if (window.showToast) window.showToast("هذا الصنف مضاف بالفعل للمزيج", "warning");
    return;
  }

  const opt = sel.options[sel.selectedIndex];
  const name = opt.textContent.split(" (")[0];
  const price = parseFloat(opt.dataset.price) || 100;

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

    const amtEl = document.getElementById(`planner-row-amt-${i}`);
    const cartEl = document.getElementById(`planner-row-cart-${i}`);
    if (amtEl) amtEl.textContent = formatCurrency(rowAmount);
    if (cartEl) cartEl.textContent = `${rowCartons.toFixed(1)} كرتونة / وحدة`;
  });

  document.getElementById("planner-total-weight-cell").textContent = `${totalWeight}%`;
  document.getElementById("planner-total-amount-cell").textContent = formatCurrency(totalAmount);
  document.getElementById("planner-total-cartons-cell").textContent = `${totalCartons.toFixed(1)} كرتونة`;

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

// Settle loan function
window.settleRepLoanByJournal = async (loanId, amount, empName) => {
  const confirmed = typeof showConfirm === "function" 
    ? await showConfirm(`تسوية سلفة ${empName} بمبلغ ${amount} ر.س عبر القيد المحاسبي؟\nسيتم تصفير الرصيد المتبقي وتغيير حالة السلفة إلى "مسوّاة".`, "تأكيد التسوية")
    : confirm(`تسوية سلفة ${empName} بمبلغ ${amount} ر.س ؟`);

  if (confirmed) {
    try {
      const loanRef = doc(db, `companies/${COMPANY_ID}/employeeLoans`, loanId);
      await updateDoc(loanRef, {
        paidAmount: amount,
        remainingBalance: 0,
        status: "settled_journal",
        settledAt: new Date().toISOString(),
        settledNote: `تمت التسوية بقيد محاسبي — ${new Date().toLocaleDateString("ar-SA")}`
      });
      if (typeof showToast === "function") showToast(`✅ تمت تسوية سلفة ${empName} — الرصيد صفر الآن`, "success");
      const btn = document.getElementById("update-report-btn");
      if (btn) btn.click();
    } catch (e) {
      console.error("[settleRepLoanByJournal]", e);
      if (typeof showToast === "function") showToast("حدث خطأ أثناء التسوية: " + e.message, "error");
    }
  }
};
