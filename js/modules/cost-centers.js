// ============================================================
// IDHAM ERP — مراكز التكلفة وسيارات التوزيع v1.0
// Cost Centers & Vehicle Warehouses Management
// ============================================================
import { COLS, create, update, remove, getAll, query, where, orderBy, getDocs } from "../utils/db.js";
import { formatCurrency } from "../utils/formatters.js";
import { db, COMPANY_ID } from "../firebase-config.js";
import { collection, getDocs as _getDocs, doc, getDoc, addDoc, serverTimestamp, Timestamp, setDoc }
  from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { syncEntityToCoa } from "../utils/coa-connector.js";
// ── State ─────────────────────────────────────────────────────
let costCenters = [];
let warehouses  = [];
let allExpenses = [];
let allSalesInv = [];
let allStockTx  = [];
let allProducts = [];
let activeTab   = "dashboard";
let filterFrom  = "";
let filterTo    = "";

// ── Date helpers ──────────────────────────────────────────────
const todayStr = () => new Date().toISOString().slice(0, 10);
const monthAgoStr = () => { const d = new Date(); d.setMonth(d.getMonth()-1); return d.toISOString().slice(0,10); };

// ═══════════════════════════════════════════════════════════════
// RENDER ENTRY POINT
// ═══════════════════════════════════════════════════════════════
export async function render(container, user) {
  window.switchTab = switchTabLocal;
  container.innerHTML = buildShell();
  await loadAll();
  switchTabLocal("dashboard");
  setupEvents();
}

function buildShell() {
  return `
  <!-- Filter Bar -->
  <div class="filterbar no-print">
    <div class="date-range-group">
      <label>من</label>
      <input type="date" id="cc-from" class="input" value="${monthAgoStr()}" style="width:150px;" onchange="ccRefresh()">
    </div>
    <div class="date-range-group">
      <label>إلى</label>
      <input type="date" id="cc-to" class="input" value="${todayStr()}" style="width:150px;" onchange="ccRefresh()">
    </div>
    <div style="margin-right:auto; display:flex; gap:8px;">
      <button class="btn btn-secondary btn-sm" onclick="ccExportPDF()">📄 تصدير PDF</button>
      <button class="btn btn-primary" onclick="openCCModal()">＋ مركز تكلفة جديد</button>
    </div>
  </div>

  <!-- Tab Navigation -->
  <div style="display:flex; gap:4px; padding:12px 20px 0; border-bottom:1px solid var(--border-soft); background:var(--bg-1); flex-wrap:wrap;">
    ${tabBtn("dashboard",  "📊", "لوحة التحكم")}
    ${tabBtn("vehicles",   "🚐", "السيارات والمخازن")}
    ${tabBtn("profit",     "💰", "تقرير الربحية")}
    ${tabBtn("compare",    "📈", "مقارنة الأداء")}
    ${tabBtn("inventory",  "📦", "حركة المخزون")}
    ${tabBtn("allocation", "⚖️", "توزيع المصاريف")}
    ${tabBtn("breakeven",  "⚡", "نقطة التعادل")}
    ${tabBtn("invoice-perf",  "🧾", "أداء الفواتير")}
    ${tabBtn("manage",     "⚙️", "إدارة مراكز التكلفة")}
  </div>

  <!-- Tab Content -->
  <div id="cc-tab-content" class="page-content" style="padding:20px;">
    <div class="page-loading"><div class="loading-spinner"></div></div>
  </div>

  <!-- Cost Center Modal -->
  <div class="modal-overlay" id="cc-modal">
    <div class="modal" style="max-width:560px;">
      <div class="modal-header">
        <h3 class="modal-title" id="cc-modal-title">➕ مركز تكلفة جديد</h3>
        <button class="modal-close" onclick="closeModal('cc-modal')">×</button>
      </div>
      <div class="modal-body" style="padding:24px;">
        <input type="hidden" id="cc-edit-id">
        <div class="form-group mb-12">
          <label>كود مركز التكلفة <span class="req">*</span></label>
          <input type="text" id="cc-code" class="input mono" placeholder="CC-VEH-001">
        </div>
        <div class="form-group mb-12">
          <label>الاسم <span class="req">*</span></label>
          <input type="text" id="cc-name" class="input" placeholder="سيارة أحمد — خط الرياض">
        </div>
        <div class="form-group mb-12">
          <label>النوع</label>
          <select id="cc-type" class="input" onchange="ccTypeToggle()">
            <option value="vehicle">🚐 سيارة توزيع</option>
            <option value="warehouse">🏭 مخزن</option>
            <option value="department">🏢 قسم إداري</option>
            <option value="general">📌 عام</option>
          </select>
        </div>
        <div id="cc-vehicle-fields">
          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>اسم السائق</label>
              <input type="text" id="cc-driver" class="input" placeholder="أحمد محمد">
            </div>
            <div class="form-group">
              <label>رقم اللوحة</label>
              <input type="text" id="cc-plate" class="input mono" placeholder="ب ج د 1234">
            </div>
          </div>
          <div class="form-group mb-12">
            <label>رقم/اسم السيارة</label>
            <input type="text" id="cc-vehicle-id" class="input" placeholder="ديانا — VAN-001">
          </div>
          <div class="form-group mb-12">
            <label>إنشاء مخزن سيارة تلقائياً</label>
            <label class="checkbox-label">
              <input type="checkbox" id="cc-auto-warehouse" checked>
              <span>إنشاء مخزن سيارة مرتبط تلقائياً عند الحفظ</span>
            </label>
          </div>
        </div>
        <div class="form-group mb-12">
          <label>المصروفات الثابتة الشهرية (ر.س)</label>
          <input type="number" id="cc-fixed-cost" class="input mono" placeholder="0" min="0">
        </div>
        <div class="form-group mb-12">
          <label>نسبة التوزيع من المصاريف غير المباشرة (%)</label>
          <input type="number" id="cc-alloc-pct" class="input mono" placeholder="تلقائي (حسب المبيعات)" min="0" max="100">
        </div>
        <div class="form-group">
          <label>ملاحظات</label>
          <input type="text" id="cc-notes" class="input" placeholder="أي معلومات إضافية">
        </div>
        <div id="cc-modal-err" class="alert bad hidden mt-12"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('cc-modal')">إلغاء</button>
        <button class="btn btn-primary" id="cc-save-btn" onclick="saveCostCenter()">💾 حفظ</button>
      </div>
    </div>
  </div>`;
}

function tabBtn(id, icon, label) {
  return `<button class="tab-btn" id="tab-btn-${id}" onclick="switchTab('${id}')"
    style="padding:8px 14px; border:none; background:transparent; cursor:pointer;
    font-size:13px; color:var(--text-2); border-bottom:2px solid transparent;
    display:flex; align-items:center; gap:6px; white-space:nowrap;">
    <span>${icon}</span><span>${label}</span>
  </button>`;
}

// ═══════════════════════════════════════════════════════════════
// DATA LOADING
// ═══════════════════════════════════════════════════════════════
async function loadAll() {
  const [ccList, whList] = await Promise.all([
    getAll(COLS.costCenters()).catch(() => []),
    getAll(COLS.warehouses(), [orderBy("name")]).catch(() => []),
  ]);
  costCenters = ccList.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
  warehouses = whList;

  filterFrom = document.getElementById("cc-from")?.value || monthAgoStr();
  filterTo   = document.getElementById("cc-to")?.value   || todayStr();

  // Load financial data and products for COGS analysis
  const [expList, invList, txList, prodList] = await Promise.all([
    getAll(COLS.expenses(),          [orderBy("date", "desc")]).catch(() => []),
    getAll(COLS.salesInvoices(),     [orderBy("date", "desc")]).catch(() => []),
    getAll(COLS.stockTransactions(), [orderBy("date", "desc")]).catch(() => []),
    getAll(COLS.products()).catch(() => []),
  ]);
  allExpenses = expList;
  allSalesInv = invList;
  allStockTx  = txList;
  allProducts = prodList;
}

// ── Filter by date range ──────────────────────────────────────
function inRange(dateStr) {
  if (!dateStr) return true;
  return dateStr >= filterFrom && dateStr <= filterTo;
}

// ── Build warehouse→costCenter map ────────────────────────────
function whCCMap() {
  const map = {};
  warehouses.forEach(w => { if (w.costCenterId) map[w.id] = w.costCenterId; });
  return map;
}

// ── KPIs per cost center ──────────────────────────────────────
function buildCCKPIs() {
  const whMap = whCCMap();
  const prodCostMap = {};
  allProducts.forEach(p => { prodCostMap[p.id] = parseFloat(p.costPrice || p.purchasePrice || 0); });

  // Sales & COGS per CC
  const sales = {};
  const cogs = {};
  allSalesInv.filter(i => inRange(i.date) && i.status !== "cancelled").forEach(inv => {
    const ccId = inv.costCenterId || (inv.warehouseId && whMap[inv.warehouseId]) || "NONE";
    // المبيعات بدون الضريبة: نستخدم subtotal وإن لم يوجد نطرح vatAmount من total
    const salesAmt = parseFloat(inv.subtotal || inv.totalBeforeVat || inv.totalExcludingVat || 0)
      || Math.max(0, (parseFloat(inv.total || 0) - parseFloat(inv.vatAmount || inv.taxAmount || inv.vat || 0)));
    sales[ccId] = (sales[ccId] || 0) + salesAmt;

    let invCogs = 0;
    (inv.items || inv.lines || []).forEach(item => {
      const q = parseFloat(item.qty || item.quantity || 0);
      const c = parseFloat(item.costPrice || item.purchasePrice || prodCostMap[item.productId || item.id] || 0);
      invCogs += q * c;
    });
    cogs[ccId] = (cogs[ccId] || 0) + invCogs;
  });

  // Expenses per CC — only direct expenses assigned to a CC
  // Indirect expenses (payroll etc.) visible in Allocation tab only
  const expenses = {};
  allExpenses.filter(e => inRange(e.date)).forEach(exp => {
    const ccId = exp.costCenterId || "NONE";
    expenses[ccId] = (expenses[ccId] || 0) + (parseFloat(exp.amount) || 0);
  });



  // Stock transactions per CC (vehicle warehouses)
  const loaded = {}, sold = {}, returned = {};
  allStockTx.filter(tx => inRange(tx.date)).forEach(tx => {
    const whId = tx.warehouseId || tx.toWarehouseId || tx.fromWarehouseId;
    const ccId = (whId && whMap[whId]) || tx.costCenterId || "NONE";
    // Support both field names: quantity (old) and qty (new)
    const qty = parseFloat(tx.quantity || tx.qty || 0);
    if (tx.type === "transfer_in")  loaded[ccId]   = (loaded[ccId]   || 0) + qty;
    if (tx.type === "sale")         sold[ccId]     = (sold[ccId]     || 0) + qty;
    if (tx.type === "transfer_out") returned[ccId] = (returned[ccId] || 0) + qty;
  });

  return costCenters.map(cc => {
    const s  = sales[cc.id]    || 0;
    const cg = cogs[cc.id]     || 0;
    const ex = expenses[cc.id] || 0;
    const fixedCost = parseFloat(cc.fixedCost || 0);
    return {
      cc,
      sales:    s,
      cogs:     cg,
      grossProfit: s - cg,
      expenses: ex,
      fixed:    fixedCost,
      profit:   s - cg - ex - fixedCost, // Net Profit = Sales - COGS - Expenses - Fixed Cost
      loaded:   loaded[cc.id]   || 0,
      sold:     sold[cc.id]     || 0,
      returned: returned[cc.id] || 0,
      waste:    Math.max(0, (loaded[cc.id]||0) - (sold[cc.id]||0) - (returned[cc.id]||0)),
    };
  });
}


// ═══════════════════════════════════════════════════════════════
// TAB RENDERING
// ═══════════════════════════════════════════════════════════════
function switchTabLocal(tab) {
  activeTab = tab;
  // Highlight active tab
  document.querySelectorAll(".tab-btn").forEach(b => {
    b.style.borderBottomColor = "transparent";
    b.style.color = "var(--text-2)";
    b.style.fontWeight = "400";
  });
  const active = document.getElementById(`tab-btn-${tab}`);
  if (active) {
    active.style.borderBottomColor = "var(--primary)";
    active.style.color = "var(--primary)";
    active.style.fontWeight = "700";
  }
  renderTab(tab);
};

window.ccRefresh = async () => {
  filterFrom = document.getElementById("cc-from")?.value || monthAgoStr();
  filterTo   = document.getElementById("cc-to")?.value   || todayStr();
  await loadAll();
  renderTab(activeTab);
};

function renderTab(tab) {
  const c = document.getElementById("cc-tab-content");
  if (!c) return;
  switch (tab) {
    case "dashboard":  c.innerHTML = renderDashboard();  break;
    case "vehicles":   c.innerHTML = renderVehicles();   break;
    case "profit":     c.innerHTML = renderProfit();     break;
    case "compare":    c.innerHTML = renderCompare();    break;
    case "inventory":  c.innerHTML = renderInventory();  break;
    case "allocation": c.innerHTML = renderAllocation(); break;
    case "breakeven":  c.innerHTML = renderBreakeven();  break;
    case "manage":     c.innerHTML = renderManage();     break;
    case "invoice-perf": c.innerHTML = renderInvoicePerf(); break;
    default:           c.innerHTML = renderDashboard();
  }
}

// ─────────────────────────────────────────────────────────────
// TAB 1: DASHBOARD
// ─────────────────────────────────────────────────────────────
function renderDashboard() {
  const kpis = buildCCKPIs();
  if (kpis.length === 0) {
    return `<div class="alert info" style="margin:40px auto; max-width:500px; text-align:center;">
      <p style="font-size:18px; margin-bottom:12px;">🏁 لا توجد مراكز تكلفة بعد</p>
      <p>اضغط <strong>"مركز تكلفة جديد"</strong> لإضافة سيارة أو مخزن كمركز تكلفة</p>
    </div>`;
  }

  const totalSales   = kpis.reduce((s, k) => s + k.sales, 0);
  const totalCogs    = kpis.reduce((s, k) => s + k.cogs, 0);
  const totalExp     = kpis.reduce((s, k) => s + k.expenses + k.fixed, 0);
  const totalProfit  = totalSales - totalCogs - totalExp;
  const totalWaste   = kpis.reduce((s, k) => s + k.waste, 0);

  const cards = kpis.map(({ cc, sales, cogs, expenses, fixed, profit, waste, loaded, sold }) => {
    const wh  = warehouses.find(w => w.costCenterId === cc.id && w.type === "Vehicle");
    const pct = sales > 0 ? ((profit / sales) * 100).toFixed(1) : "0.0";
    const wPct= loaded > 0 ? ((waste / loaded) * 100).toFixed(1) : "0.0";
    const color = profit >= 0 ? "#10b981" : "#ef4444";
    return `
    <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:14px; padding:18px; position:relative; overflow:hidden;">
      <div style="position:absolute; top:0; right:0; width:4px; height:100%; background:${color};"></div>
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
        <div>
          <div style="font-size:15px; font-weight:700; color:var(--text-0);">${cc.type === "vehicle" ? "🚐" : "🏭"} ${cc.name}</div>
          <div style="font-size:11px; color:var(--text-2); margin-top:2px;">
            ${cc.driverName ? `👤 ${cc.driverName}` : ""}
            ${cc.plateNumber ? ` • ${cc.plateNumber}` : ""}
            ${wh ? ` • مخزن: ${wh.name}` : ""}
          </div>
        </div>
        <span class="mono" style="font-size:10px; background:var(--bg-3); padding:3px 8px; border-radius:20px; color:var(--text-2);">${cc.code}</span>
      </div>
      <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:6px; margin-bottom:10px;">
        <div style="background:var(--bg-1); border-radius:8px; padding:6px; text-align:center;">
          <div style="font-size:10px; color:var(--text-2);">المبيعات</div>
          <div style="font-size:12px; font-weight:700; color:var(--text-0); margin-top:2px;">${formatCurrency(sales)}</div>
        </div>
        <div style="background:var(--bg-1); border-radius:8px; padding:6px; text-align:center;">
          <div style="font-size:10px; color:var(--text-2);">التكلفة</div>
          <div style="font-size:12px; font-weight:700; color:#8b5cf6; margin-top:2px;">${formatCurrency(cogs)}</div>
        </div>
        <div style="background:var(--bg-1); border-radius:8px; padding:6px; text-align:center;">
          <div style="font-size:10px; color:var(--text-2);">المصاريف</div>
          <div style="font-size:12px; font-weight:700; color:#f59e0b; margin-top:2px;">${formatCurrency(expenses + fixed)}</div>
        </div>
        <div style="background:var(--bg-1); border-radius:8px; padding:6px; text-align:center;">
          <div style="font-size:10px; color:var(--text-2);">الربح</div>
          <div style="font-size:12px; font-weight:700; color:${color}; margin-top:2px;">${formatCurrency(profit)}</div>
        </div>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <span style="font-size:11px; background:${color}22; color:${color}; padding:3px 10px; border-radius:20px; font-weight:600;">
          هامش ${pct}%
        </span>
        ${waste > 0 ? `<span style="font-size:11px; background:#ef444422; color:#ef4444; padding:3px 10px; border-radius:20px;">⚠️ فاقد ${wPct}%</span>` : ""}
        <span style="font-size:11px; background:var(--bg-3); color:var(--text-2); padding:3px 10px; border-radius:20px; margin-right:auto; cursor:pointer;"
          onclick="goToCCDetail('${cc.id}')">تفاصيل →</span>
      </div>
    </div>`;
  }).join("");

  return `
  <!-- KPI Strip -->
  <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:14px; margin-bottom:20px;">
    <div class="kpi-card sales">
      <div class="kpi-label">إجمالي المبيعات</div>
      <div class="kpi-value">${formatCurrency(totalSales)}</div>
    </div>
    <div class="kpi-card" style="border-right:3px solid #8b5cf6;">
      <div class="kpi-label">تكلفة البضاعة المباعة</div>
      <div class="kpi-value" style="color:#8b5cf6;">${formatCurrency(totalCogs)}</div>
    </div>
    <div class="kpi-card purchases">
      <div class="kpi-label">إجمالي المصاريف</div>
      <div class="kpi-value">${formatCurrency(totalExp)}</div>
    </div>
    <div class="kpi-card" style="border-right:3px solid ${totalProfit>=0?'#10b981':'#ef4444'};">
      <div class="kpi-label">صافي الربح</div>
      <div class="kpi-value" style="color:${totalProfit>=0?'#10b981':'#ef4444'};">${formatCurrency(totalProfit)}</div>
    </div>
    <div class="kpi-card" style="border-right:3px solid #f59e0b;">
      <div class="kpi-label">إجمالي الفاقد (وحدة)</div>
      <div class="kpi-value" style="color:#f59e0b;">${totalWaste.toLocaleString()}</div>
    </div>
  </div>

  <!-- CC Cards -->
  <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:16px;">
    ${cards || `<div class="alert info">لا توجد بيانات في هذه الفترة</div>`}
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// TAB 2: VEHICLES & WAREHOUSES
// ─────────────────────────────────────────────────────────────
function renderVehicles() {
  const vehicleCCs = costCenters.filter(cc => cc.type === "vehicle");
  const vehicleWHs = warehouses.filter(w => w.type === "Vehicle");

  if (vehicleCCs.length === 0 && vehicleWHs.length === 0) {
    return `<div class="alert info" style="margin:40px auto;max-width:500px;text-align:center;">
      <p style="font-size:18px;margin-bottom:12px;">🚐 لا توجد سيارات مسجلة</p>
      <p>اضغط <strong>"مركز تكلفة جديد"</strong> واختر نوع "سيارة توزيع" لإضافة سيارتك الأولى</p>
      <button class="btn btn-primary mt-12" onclick="openCCModal()">＋ إضافة سيارة</button>
    </div>`;
  }

  const rows = vehicleCCs.map(cc => {
    const wh = warehouses.find(w => w.costCenterId === cc.id && w.type === "Vehicle");
    return `<tr>
      <td><span class="mono" style="color:var(--primary);">${cc.code}</span></td>
      <td style="font-weight:600;">🚐 ${cc.name}</td>
      <td>${cc.driverName || "—"}</td>
      <td class="mono">${cc.plateNumber || "—"}</td>
      <td>${cc.vehicleId || "—"}</td>
      <td>${wh ? `<span style="color:#10b981;">✅ ${wh.name}</span>` : `<span style="color:#f59e0b;">⚠️ لا يوجد <button class="btn btn-sm btn-secondary" onclick="createVehicleWarehouse('${cc.id}')">إنشاء</button></span>`}</td>
      <td>${formatCurrency(cc.fixedCost || 0)}/شهر</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="openCCModal('${cc.id}')">✏️</button>
        <button class="btn btn-sm" style="background:#ef444422;color:#ef4444;border:1px solid #ef444433;" onclick="deleteCostCenter('${cc.id}','${cc.name}')">🗑️</button>
      </td>
    </tr>`;
  }).join("");

  return `
  <div class="card mb-16">
    <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
      <h3>🚐 سيارات التوزيع كمراكز تكلفة</h3>
      <button class="btn btn-primary btn-sm" onclick="openCCModal()">＋ إضافة سيارة</button>
    </div>
    <div class="table-container">
      <table class="data-dense">
        <thead><tr>
          <th>الكود</th><th>الاسم</th><th>السائق</th><th>اللوحة</th><th>رقم السيارة</th>
          <th>المخزن المرتبط</th><th>التكلفة الثابتة</th><th>إجراءات</th>
        </tr></thead>
        <tbody>${rows || `<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--text-2);">لا توجد سيارات</td></tr>`}</tbody>
      </table>
    </div>
  </div>

  <div class="card">
    <div class="card-header"><h3>🔄 سندات التحميل والإرجاع</h3></div>
    <div class="card-body" style="padding:16px;">
      <p style="color:var(--text-2);margin-bottom:12px;">لتحميل بضاعة على سيارة أو إرجاعها، استخدم شاشة <strong>تحويل المخزون</strong>:</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <div style="flex:1;min-width:220px;background:var(--bg-2);border-radius:10px;padding:16px;border:1px solid var(--border-soft);">
          <div style="font-size:20px;margin-bottom:6px;">📤</div>
          <div style="font-weight:700;margin-bottom:4px;">تحميل للسيارة</div>
          <div style="font-size:12px;color:var(--text-2);">من: المخزن الرئيسي → إلى: مخزن السيارة</div>
          <a href="#stock-transfer" style="display:block;margin-top:8px;font-size:12px;color:var(--primary);">فتح تحويل المخزون ←</a>
        </div>
        <div style="flex:1;min-width:220px;background:var(--bg-2);border-radius:10px;padding:16px;border:1px solid var(--border-soft);">
          <div style="font-size:20px;margin-bottom:6px;">📥</div>
          <div style="font-weight:700;margin-bottom:4px;">جرد راجع من السيارة</div>
          <div style="font-size:12px;color:var(--text-2);">من: مخزن السيارة → إلى: المخزن الرئيسي</div>
          <a href="#stock-transfer" style="display:block;margin-top:8px;font-size:12px;color:var(--primary);">فتح تحويل المخزون ←</a>
        </div>
        <div style="flex:1;min-width:220px;background:var(--bg-2);border-radius:10px;padding:16px;border:1px solid #ef444433;">
          <div style="font-size:20px;margin-bottom:6px;">⚠️</div>
          <div style="font-weight:700;margin-bottom:4px;">تسجيل فاقد/تالف</div>
          <div style="font-size:12px;color:var(--text-2);">البضاعة المحمّلة - المباعة - المرتجعة = الفاقد</div>
          <button class="btn btn-sm" style="margin-top:8px;background:#ef444422;color:#ef4444;" onclick="switchTab('inventory')">عرض تقرير الفاقد</button>
        </div>
      </div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// TAB 3: PROFITABILITY REPORT
// ─────────────────────────────────────────────────────────────
function renderProfit() {
  const kpis = buildCCKPIs();
  const rows = kpis.map(({ cc, sales, cogs, grossProfit, expenses, fixed, profit }) => {
    const margin = sales > 0 ? ((profit / sales) * 100).toFixed(1) : "—";
    const cls = profit >= 0 ? "color:#10b981;" : "color:#ef4444;";
    return `<tr>
      <td><span class="mono" style="color:var(--primary);">${cc.code}</span></td>
      <td style="font-weight:600;">${cc.type === "vehicle" ? "🚐" : "🏭"} ${cc.name}</td>
      <td>${cc.driverName || "—"}</td>
      <td class="mono">${formatCurrency(sales)}</td>
      <td class="mono" style="color:#8b5cf6;">${formatCurrency(cogs)}</td>
      <td class="mono font-bold" style="color:#10b981;">${formatCurrency(grossProfit)}</td>
      <td class="mono" style="color:#f59e0b;">${formatCurrency(expenses)}</td>
      <td class="mono" style="color:#a855f7;">${formatCurrency(fixed)}</td>
      <td class="mono font-bold" style="${cls}">${formatCurrency(profit)}</td>
      <td><span style="font-size:12px;padding:3px 10px;border-radius:20px;${cls}background:${profit>=0?'#10b98122':'#ef444422'};font-weight:700;">${margin}%</span></td>
    </tr>`;
  }).join("");

  const totals = kpis.reduce((a, k) => ({
    sales: a.sales + k.sales,
    cogs:  a.cogs  + k.cogs,
    gp:    a.gp    + k.grossProfit,
    exp:   a.exp   + k.expenses,
    fixed: a.fixed + k.fixed,
    profit: a.profit + k.profit,
  }), { sales: 0, cogs: 0, gp: 0, exp: 0, fixed: 0, profit: 0 });

  return `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
    <h2 style="font-size:18px;font-weight:700;">💰 تقرير ربحية مراكز التكلفة التفصيلي</h2>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-secondary btn-sm" onclick="ccExportPDF()">📄 PDF</button>
      <button class="btn btn-secondary btn-sm" onclick="ccExportExcel()">📊 Excel</button>
    </div>
  </div>
  <div class="table-container">
    <table class="data-dense" id="profit-table">
      <thead><tr>
        <th>الكود</th><th>مركز التكلفة</th><th>المسؤول</th>
        <th>المبيعات</th><th>تكلفة البضاعة (COGS)</th><th>مجمل الربح</th>
        <th>المصاريف المباشرة</th><th>التكلفة الثابتة</th><th>صافي الربح</th><th>هامش الربح</th>
      </tr></thead>
      <tbody>
        ${rows || `<tr><td colspan="10" style="text-align:center;padding:20px;color:var(--text-2);">لا توجد بيانات في هذه الفترة</td></tr>`}
      </tbody>
      <tfoot>
        <tr style="background:var(--bg-3);font-weight:700;">
          <td colspan="3" style="padding:10px;">الإجمالي</td>
          <td class="mono">${formatCurrency(totals.sales)}</td>
          <td class="mono" style="color:#8b5cf6;">${formatCurrency(totals.cogs)}</td>
          <td class="mono" style="color:#10b981;">${formatCurrency(totals.gp)}</td>
          <td class="mono" style="color:#f59e0b;">${formatCurrency(totals.exp)}</td>
          <td class="mono" style="color:#a855f7;">${formatCurrency(totals.fixed)}</td>
          <td class="mono font-bold" style="${totals.profit>=0?'color:#10b981':'color:#ef4444'}">${formatCurrency(totals.profit)}</td>
          <td>—</td>
        </tr>
      </tfoot>
    </table>
  </div>`;
}



// ─────────────────────────────────────────────────────────────
// TAB NEW: INVOICE PERFORMANCE REPORT
// ─────────────────────────────────────────────────────────────
function buildInvoicePerfData() {
  const whMap = whCCMap();
  const prodCostMap = {};
  allProducts.forEach(p => { prodCostMap[p.id] = parseFloat(p.costPrice || p.purchasePrice || 0); });

  const invoices = [];

  allSalesInv.filter(i => inRange(i.date) && i.status !== "cancelled").forEach(inv => {
    const ccId = inv.costCenterId || (inv.warehouseId && whMap[inv.warehouseId]) || null;
    const cc   = costCenters.find(c => c.id === ccId);

    const salesAmt = parseFloat(inv.subtotal || inv.totalBeforeVat || inv.totalExcludingVat || 0)
      || Math.max(0, (parseFloat(inv.total || 0) - parseFloat(inv.vatAmount || inv.taxAmount || inv.vat || 0)));

    const itemsRaw = inv.items || inv.lines || [];
    let invCogs = 0;
    const items = itemsRaw.map(item => {
      const q   = parseFloat(item.qty || item.quantity || 0);
      const sp  = parseFloat(item.unitPrice || item.price || 0);
      const cp  = parseFloat(item.costPrice || item.purchasePrice || prodCostMap[item.productId || item.id] || 0);
      const lineTotal = Math.round(q * sp * 100) / 100;
      const lineCost  = Math.round(q * cp  * 100) / 100;
      const lineProfit = Math.round((lineTotal - lineCost) * 100) / 100;
      invCogs += lineCost;
      return {
        name: item.name || item.productName || "—",
        qty: q, unitPrice: sp, costPrice: cp,
        lineTotal, lineCost, lineProfit,
        lineMargin: lineTotal > 0 ? ((lineProfit / lineTotal) * 100).toFixed(1) : "0.0"
      };
    });

    const grossProfit = Math.round((salesAmt - invCogs) * 100) / 100;
    const margin      = salesAmt > 0 ? ((grossProfit / salesAmt) * 100).toFixed(1) : "0.0";

    invoices.push({
      id:           inv.id || inv.invoiceNumber,
      number:       inv.invoiceNumber || inv.id || "—",
      date:         inv.date || "—",
      customerName: inv.customerName || inv.clientName || "—",
      ccId, cc,
      ccName:       cc ? cc.name : "بدون مركز تكلفة",
      driverName:   cc ? (cc.driverName || "—") : "—",
      sales:        salesAmt,
      cogs:         Math.round(invCogs * 100) / 100,
      grossProfit,
      margin,
      items
    });
  });

  return invoices;
}

window.toggleInvoiceRows = (id) => {
  const el = document.getElementById(`inv-detail-${id}`);
  if (el) el.style.display = el.style.display === "none" ? "" : "none";
};

function renderInvoicePerf() {
  const data = buildInvoicePerfData();

  if (!data.length) {
    return `<div class="alert info" style="margin:40px auto;max-width:500px;text-align:center;">
      <p style="font-size:18px;margin-bottom:8px;">🧾 لا توجد فواتير في هذه الفترة</p>
      <p style="color:var(--text-2);">جرّب توسيع نطاق التاريخ من الفلتر أعلاه</p>
    </div>`;
  }

  // ── 1. حساب وتحليل البيانات الشاملة ──
  const grandSales = data.reduce((s, i) => s + i.sales, 0);
  const grandCOGS  = data.reduce((s, i) => s + i.cogs, 0);
  const grandGP    = data.reduce((s, i) => s + i.grossProfit, 0);
  const grandMargin = grandSales > 0 ? ((grandGP / grandSales) * 100).toFixed(1) : "0.0";

  // ترتيب الفواتير حسب الربحية
  const sortedByProfit = [...data].sort((a, b) => b.grossProfit - a.grossProfit);
  const topInv = sortedByProfit[0];
  const botInv = sortedByProfit[sortedByProfit.length - 1];

  // تجميع وتحليل الأصناف (مبيعات، كميات، ربحية)
  const productMap = {};
  data.forEach(inv => {
    inv.items.forEach(it => {
      const k = it.name;
      if (!productMap[k]) {
        productMap[k] = { name: k, qty: 0, sales: 0, cost: 0, profit: 0 };
      }
      productMap[k].qty    += it.qty;
      productMap[k].sales  += it.lineTotal;
      productMap[k].cost   += it.lineCost;
      productMap[k].profit += it.lineProfit;
    });
  });

  const prodList = Object.values(productMap);
  const sortedProdByProfit = [...prodList].sort((a, b) => b.profit - a.profit);
  const sortedProdBySales  = [...prodList].sort((a, b) => b.sales - a.sales);

  const topProdProfit = sortedProdByProfit[0];
  const botProdProfit = sortedProdByProfit[sortedProdByProfit.length - 1];
  const topProdSales  = sortedProdBySales[0];
  const botProdSales  = sortedProdBySales[sortedProdBySales.length - 1];

  // تجميع وتحليل العملاء
  const customerMap = {};
  data.forEach(inv => {
    const k = inv.customerName;
    if (!customerMap[k]) {
      customerMap[k] = { name: k, sales: 0, cost: 0, profit: 0, count: 0 };
    }
    customerMap[k].sales  += inv.sales;
    customerMap[k].cost   += inv.cogs;
    customerMap[k].profit += inv.grossProfit;
    customerMap[k].count  += 1;
  });

  const customerList = Object.values(customerMap);
  const sortedCustomers = [...customerList].sort((a, b) => b.sales - a.sales);
  const topCustomer = sortedCustomers[0];

  // ── 2. بناء كروت المؤشرات السريعة (KPIs) ──
  const kpiCards = `
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;margin-bottom:24px;">
    <!-- الفواتير المتميزة -->
    <div style="background:linear-gradient(135deg,rgba(16,185,129,0.1),rgba(16,185,129,0.02));border:1px solid rgba(16,185,129,0.25);border-radius:12px;padding:14px;position:relative;">
      <div style="font-size:11px;color:#10b981;font-weight:700;margin-bottom:6px;">🏆 أعلى فاتورة ربحاً</div>
      <div style="font-size:16px;font-weight:800;color:var(--text-0);">${formatCurrency(topInv.grossProfit)}</div>
      <div style="font-size:11px;color:var(--text-2);margin-top:4px;">فاتورة: ${topInv.number} • ${topInv.ccName}</div>
      <div style="font-size:10px;color:var(--text-3);margin-top:2px;">العميل: ${topInv.customerName}</div>
    </div>
    <div style="background:linear-gradient(135deg,rgba(239,68,68,0.1),rgba(239,68,68,0.02));border:1px solid rgba(239,68,68,0.25);border-radius:12px;padding:14px;">
      <div style="font-size:11px;color:#ef4444;font-weight:700;margin-bottom:6px;">⚠️ أقل فاتورة ربحاً</div>
      <div style="font-size:16px;font-weight:800;color:var(--text-0);">${formatCurrency(botInv.grossProfit)}</div>
      <div style="font-size:11px;color:var(--text-2);margin-top:4px;">فاتورة: ${botInv.number} • ${botInv.ccName}</div>
      <div style="font-size:10px;color:var(--text-3);margin-top:2px;">العميل: ${botInv.customerName}</div>
    </div>

    <!-- الأصناف المتميزة -->
    <div style="background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(99,102,241,0.02));border:1px solid rgba(99,102,241,0.25);border-radius:12px;padding:14px;">
      <div style="font-size:11px;color:#6366f1;font-weight:700;margin-bottom:6px;">📈 الصنف الأعلى ربحية</div>
      <div style="font-size:15px;font-weight:800;color:var(--text-0);text-overflow:ellipsis;overflow:hidden;white-space:nowrap;" title="${topProdProfit ? topProdProfit.name : ''}">${topProdProfit ? topProdProfit.name : '—'}</div>
      <div style="font-size:12px;font-weight:700;color:#10b981;margin-top:4px;">ربح: ${topProdProfit ? formatCurrency(topProdProfit.profit) : '0'}</div>
      <div style="font-size:10px;color:var(--text-3);margin-top:2px;">مبيعات: ${topProdProfit ? formatCurrency(topProdProfit.sales) : '0'}</div>
    </div>
    <div style="background:linear-gradient(135deg,rgba(245,158,11,0.1),rgba(245,158,11,0.02));border:1px solid rgba(245,158,11,0.25);border-radius:12px;padding:14px;">
      <div style="font-size:11px;color:#f59e0b;font-weight:700;margin-bottom:6px;">📊 الصنف الأكثر مبيعاً (قيمة)</div>
      <div style="font-size:15px;font-weight:800;color:var(--text-0);text-overflow:ellipsis;overflow:hidden;white-space:nowrap;" title="${topProdSales ? topProdSales.name : ''}">${topProdSales ? topProdSales.name : '—'}</div>
      <div style="font-size:12px;font-weight:700;color:var(--primary);margin-top:4px;">مبيعات: ${topProdSales ? formatCurrency(topProdSales.sales) : '0'}</div>
      <div style="font-size:10px;color:var(--text-3);margin-top:2px;">الكمية المباعة: ${topProdSales ? topProdSales.qty : '0'} وحدة</div>
    </div>

    <!-- العميل الأكثر سحباً -->
    <div style="background:linear-gradient(135deg,rgba(168,85,247,0.1),rgba(168,85,247,0.02));border:1px solid rgba(168,85,247,0.25);border-radius:12px;padding:14px;">
      <div style="font-size:11px;color:#a855f7;font-weight:700;margin-bottom:6px;">👤 العميل الأعلى سحباً</div>
      <div style="font-size:15px;font-weight:800;color:var(--text-0);text-overflow:ellipsis;overflow:hidden;white-space:nowrap;" title="${topCustomer ? topCustomer.name : ''}">${topCustomer ? topCustomer.name : '—'}</div>
      <div style="font-size:12px;font-weight:700;color:#10b981;margin-top:4px;">مسحوبات: ${topCustomer ? formatCurrency(topCustomer.sales) : '0'}</div>
      <div style="font-size:10px;color:var(--text-3);margin-top:2px;">عدد الفواتير: ${topCustomer ? topCustomer.count : '0'}</div>
    </div>
  </div>`;

  // ── 3. بناء تقارير تفصيلية للأصناف والعملاء والفواتير ──
  // فلتر المندوب
  const ccOptions = [
    ["all", "كل المناديب والمراكز"],
    ...costCenters.map(cc => [cc.id, `${cc.type === "vehicle" ? "🚐" : "🏭"} ${cc.name}`]),
    ["NONE", "بدون مركز تكلفة"]
  ].map(([v, l]) => `<option value="${v}">${l}</option>`).join("");

  // جدول الأصناف
  const prodRows = sortedProdByProfit.map(p => {
    const margin = p.sales > 0 ? ((p.profit / p.sales) * 100).toFixed(1) : "0.0";
    const cl = p.profit >= 0 ? "color:#10b981;" : "color:#ef4444;";
    return `<tr>
      <td style="font-weight:600;">📦 ${p.name}</td>
      <td class="mono">${p.qty.toLocaleString()}</td>
      <td class="mono">${formatCurrency(p.sales)}</td>
      <td class="mono" style="color:#8b5cf6;">${formatCurrency(p.cost)}</td>
      <td class="mono font-bold" style="${cl}">${formatCurrency(p.profit)}</td>
      <td><span style="font-size:11.5px;padding:3px 9px;border-radius:12px;background:${p.profit>=0?'#10b98118':'#ef444418'};${cl}font-weight:700;">${margin}%</span></td>
    </tr>`;
  }).join("");

  // جدول العملاء
  const custRows = sortedCustomers.slice(0, 15).map(c => {
    const margin = c.sales > 0 ? ((c.profit / c.sales) * 100).toFixed(1) : "0.0";
    const cl = c.profit >= 0 ? "color:#10b981;" : "color:#ef4444;";
    return `<tr>
      <td style="font-weight:600;">👤 ${c.name}</td>
      <td class="mono">${c.count}</td>
      <td class="mono">${formatCurrency(c.sales)}</td>
      <td class="mono" style="color:#8b5cf6;">${formatCurrency(c.cost)}</td>
      <td class="mono font-bold" style="${cl}">${formatCurrency(c.profit)}</td>
      <td><span style="font-size:11.5px;padding:3px 9px;border-radius:12px;background:${c.profit>=0?'#10b98118':'#ef444418'};${cl}font-weight:700;">${margin}%</span></td>
    </tr>`;
  }).join("");

  // جدول الفواتير مجمعة حسب مركز التكلفة
  const groupByCc = {};
  data.forEach(inv => {
    const key = inv.ccId || "NONE";
    if (!groupByCc[key]) {
      groupByCc[key] = { ccName: inv.ccName, driverName: inv.driverName, invoices: [] };
    }
    groupByCc[key].invoices.push(inv);
  });

  const invoiceSections = Object.entries(groupByCc).map(([ccId, group]) => {
    const totalSales  = group.invoices.reduce((s, i) => s + i.sales, 0);
    const totalCogs   = group.invoices.reduce((s, i) => s + i.cogs, 0);
    const totalGP     = group.invoices.reduce((s, i) => s + i.grossProfit, 0);
    const totalMargin = totalSales > 0 ? ((totalGP / totalSales) * 100).toFixed(1) : "0.0";
    const gpColor     = totalGP >= 0 ? "#10b981" : "#ef4444";

    const rows = group.invoices.map((inv, idx) => {
      const mgColor = parseFloat(inv.margin) >= 20 ? "#10b981" : parseFloat(inv.margin) >= 0 ? "#f59e0b" : "#ef4444";
      const itemsHtml = inv.items.map(it => `
        <tr style="background:var(--bg-1);font-size:11px;">
          <td style="padding:5px 8px;padding-right:24px;color:var(--text-1);">${it.name}</td>
          <td style="padding:5px 8px;text-align:center;">${it.qty}</td>
          <td style="padding:5px 8px;text-align:left;">${formatCurrency(it.unitPrice)}</td>
          <td style="padding:5px 8px;text-align:left;color:#8b5cf6;">${formatCurrency(it.costPrice)}</td>
          <td style="padding:5px 8px;text-align:left;">${formatCurrency(it.lineTotal)}</td>
          <td style="padding:5px 8px;text-align:left;color:#8b5cf6;">${formatCurrency(it.lineCost)}</td>
          <td style="padding:5px 8px;text-align:left;color:${parseFloat(it.lineMargin)>=0?'#10b981':'#ef4444'};font-weight:700;">${formatCurrency(it.lineProfit)}</td>
          <td style="padding:5px 8px;text-align:center;">
            <span style="font-size:10px;padding:2px 6px;border-radius:10px;background:${parseFloat(it.lineMargin)>=0?'#10b98122':'#ef444422'};color:${parseFloat(it.lineMargin)>=0?'#10b981':'#ef4444'};">${it.lineMargin}%</span>
          </td>
        </tr>`).join("");

      const safeId = `${ccId}_${idx}`.replace(/[^a-zA-Z0-9_]/g, "_");
      return `
        <tr style="cursor:pointer;border-bottom:1px solid var(--border-soft);" onclick="toggleInvoiceRows('${safeId}')">
          <td style="padding:8px;"><span class="mono" style="color:var(--primary);font-size:11px;">${inv.number}</span></td>
          <td style="padding:8px;font-size:11.5px;">${inv.date}</td>
          <td style="padding:8px;font-size:11.5px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${inv.customerName}">${inv.customerName}</td>
          <td style="padding:8px;text-align:left;font-size:12px;">${formatCurrency(inv.sales)}</td>
          <td style="padding:8px;text-align:left;font-size:12px;color:#8b5cf6;">${formatCurrency(inv.cogs)}</td>
          <td style="padding:8px;text-align:left;font-size:12px;font-weight:700;color:${parseFloat(inv.margin)>=0?'#10b981':'#ef4444'};">${formatCurrency(inv.grossProfit)}</td>
          <td style="padding:8px;text-align:center;">
            <span style="font-size:11px;padding:3px 8px;border-radius:12px;background:${mgColor}22;color:${mgColor};font-weight:700;">${inv.margin}%</span>
          </td>
          <td style="padding:8px;text-align:center;font-size:11px;color:var(--text-2);">${inv.items.length} أصناف ▾</td>
        </tr>
        <tr id="inv-detail-${safeId}" style="display:none;">
          <td colspan="8" style="padding:0;background:var(--bg-0);">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:var(--bg-3);font-size:10px;color:var(--text-2);">
                  <th style="padding:5px 8px;padding-right:24px;text-align:right;font-weight:600;">الصنف</th>
                  <th style="padding:5px 8px;text-align:center;font-weight:600;">الكمية</th>
                  <th style="padding:5px 8px;text-align:left;font-weight:600;">سعر البيع</th>
                  <th style="padding:5px 8px;text-align:left;font-weight:600;">التكلفة</th>
                  <th style="padding:5px 8px;text-align:left;font-weight:600;">إجمالي البيع</th>
                  <th style="padding:5px 8px;text-align:left;font-weight:600;">إجمالي التكلفة</th>
                  <th style="padding:5px 8px;text-align:left;font-weight:600;">الربح</th>
                  <th style="padding:5px 8px;text-align:center;font-weight:600;">الهامش</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
          </td>
        </tr>`;
    }).join("");

    return `
    <div class="cc-inv-section" data-ccid="${ccId}" style="background:var(--bg-2);border:1px solid var(--border-soft);border-radius:12px;overflow:hidden;margin-bottom:20px;">
      <div style="background:var(--bg-3);padding:10px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-soft);flex-wrap:wrap;gap:8px;">
        <div>
          <span style="font-size:14px;font-weight:700;">${group.ccName}</span>
          ${group.driverName !== "—" ? `<span style="font-size:11px;color:var(--text-2);margin-right:8px;">👤 المندوب: ${group.driverName}</span>` : ""}
        </div>
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
          <span style="font-size:11px;color:var(--text-2);">${group.invoices.length} فاتورة</span>
          <span style="font-size:12px;font-weight:700;color:var(--primary);">المبيعات (صافي): ${formatCurrency(totalSales)}</span>
          <span style="font-size:12px;font-weight:700;color:${gpColor};">مجمل الربح: ${formatCurrency(totalGP)}</span>
          <span style="font-size:11px;padding:2px 8px;border-radius:12px;background:${gpColor}22;color:${gpColor};font-weight:700;">هامش: ${totalMargin}%</span>
        </div>
      </div>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;min-width:680px;" class="data-dense">
          <thead>
            <tr style="background:var(--bg-3);font-size:11px;color:var(--text-2);">
              <th style="padding:8px;text-align:right;font-weight:600;">رقم الفاتورة</th>
              <th style="padding:8px;text-align:right;font-weight:600;">التاريخ</th>
              <th style="padding:8px;text-align:right;font-weight:600;">العميل</th>
              <th style="padding:8px;text-align:left;font-weight:600;">المبيعات (صافي)</th>
              <th style="padding:8px;text-align:left;font-weight:600;">التكلفة (COGS)</th>
              <th style="padding:8px;text-align:left;font-weight:600;">مجمل الربح</th>
              <th style="padding:8px;text-align:center;font-weight:600;">هامش %</th>
              <th style="padding:8px;text-align:center;font-weight:600;">الأصناف</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
  }).join("");

  return `
  <!-- Header Action Panel -->
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;border-bottom:1px solid var(--border-soft);padding-bottom:14px;">
    <div>
      <h2 style="font-size:18px;font-weight:700;margin:0;">🧾 تقرير أداء مبيعات وربحية مراكز التكلفة</h2>
      <div style="font-size:12px;color:var(--text-2);margin-top:2px;">
        الفترة: ${filterFrom} إلى ${filterTo} | مبيعات صافية (بدون ضريبة): <span style="font-weight:700;color:var(--primary);">${formatCurrency(grandSales)}</span> | ربح: <span style="font-weight:700;color:#10b981;">${formatCurrency(grandGP)}</span> (${grandMargin}%)
      </div>
    </div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
      <select id="inv-perf-filter" class="input" style="height:32px;font-size:12px;width:180px;"
        onchange="filterInvPerfSections(this.value)">
        ${ccOptions}
      </select>
      <button class="btn btn-secondary btn-sm" onclick="printInvoicePerfReport()" style="display:inline-flex;align-items:center;gap:6px;">
        🖨️ طباعة ومعاينة التقرير
      </button>
      <button class="btn btn-secondary btn-sm" onclick="exportInvoicePerfExcel()" style="display:inline-flex;align-items:center;gap:6px;">
        📊 تصدير إكسل
      </button>
    </div>
  </div>

  <!-- Quick KPIs Grid -->
  ${kpiCards}

  <!-- Analysis Tables Sections (Products and Customers Side by Side) -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;flex-wrap:wrap;">
    <!-- الأصناف الأكثر مبيعاً وربحية -->
    <div class="card" style="padding:16px;">
      <div style="font-weight:700;font-size:14px;margin-bottom:12px;border-bottom:2px solid var(--primary);padding-bottom:6px;">
        📦 تحليل أداء وربحية الأصناف
      </div>
      <div class="table-container" style="max-height:350px;overflow-y:auto;">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr>
              <th>الصنف</th>
              <th>الكمية</th>
              <th>المبيعات</th>
              <th>التكلفة</th>
              <th>الربح</th>
              <th>الهامش</th>
            </tr>
          </thead>
          <tbody>
            ${prodRows || `<tr><td colspan="6" style="text-align:center;padding:12px;color:var(--text-2);">لا توجد بيانات للأصناف</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>

    <!-- العملاء الأكثر سحباً وربحية -->
    <div class="card" style="padding:16px;">
      <div style="font-weight:700;font-size:14px;margin-bottom:12px;border-bottom:2px solid #a855f7;padding-bottom:6px;">
        👤 تحليل مسحوبات وربحية العملاء (أعلى 15 عميل)
      </div>
      <div class="table-container" style="max-height:350px;overflow-y:auto;">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr>
              <th>العميل</th>
              <th>الفواتير</th>
              <th>المبيعات</th>
              <th>التكلفة</th>
              <th>الربح</th>
              <th>الهامش</th>
            </tr>
          </thead>
          <tbody>
            ${custRows || `<tr><td colspan="6" style="text-align:center;padding:12px;color:var(--text-2);">لا توجد بيانات للعملاء</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Detailed Invoices Sections by cost center -->
  <div style="font-weight:700;font-size:14px;margin-bottom:14px;border-bottom:2px solid var(--border-soft);padding-bottom:6px;">
    📋 تفاصيل الفواتير والأصناف والمناديب
  </div>
  <div id="inv-perf-sections">
    ${invoiceSections || `<div class="alert info">لا توجد بيانات فواتير</div>`}
  </div>
  
  <style>
    .data-dense th { background: var(--bg-3) !important; color: var(--text-2); padding: 8px 10px; font-size: 11px; }
    .data-dense td { padding: 6px 10px; font-size: 12px; }
    .data-dense tbody tr:hover { background: var(--bg-1); }
  </style>`;
}

window.filterInvPerfSections = function(ccId) {
  document.querySelectorAll('.cc-inv-section').forEach(el => {
    el.style.display = (ccId === 'all' || el.dataset.ccid === ccId) ? '' : 'none';
  });
};

// Navigate to a specific CC's invoice details from the dashboard card
window.goToCCDetail = function(ccId) {
  switchTabLocal('invoice-perf');
  // Apply filter after DOM renders
  setTimeout(() => {
    const sel = document.getElementById('inv-perf-filter');
    if (sel) {
      sel.value = ccId;
      filterInvPerfSections(ccId);
    }
  }, 80);
};

window.toggleInvoiceRows = function(id) {
  const el = document.getElementById(`inv-detail-${id}`);
  if (el) el.style.display = el.style.display === "none" ? "" : "none";
};

// ── طباعة تقرير مبيعات وربحية مراكز التكلفة الشامل ──
window.printInvoicePerfReport = () => {
  const data = buildInvoicePerfData();
  if (!data.length) {
    window.showToast?.("لا توجد بيانات للطباعة في هذه الفترة", "warn");
    return;
  }

  const html = buildInvoicePerfPrintHTML(data);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = function() {
      printWindow.print();
    };
  }
};

// ── تصدير إكسل لتقرير الأداء الشامل ──
window.exportInvoicePerfExcel = async () => {
  const { exportXLSX } = await import("../utils/export.js");
  const data = buildInvoicePerfData();
  if (!data.length) {
    window.showToast?.("لا توجد بيانات للتصدير", "warn");
    return;
  }

  const rows = [];
  data.forEach(inv => {
    inv.items.forEach(it => {
      rows.push([
        inv.number,
        inv.date,
        inv.ccName,
        inv.driverName,
        inv.customerName,
        it.name,
        it.qty,
        it.unitPrice,
        it.lineTotal,
        it.costPrice,
        it.lineCost,
        it.lineProfit,
        it.lineMargin + "%"
      ]);
    });
  });

  exportXLSX({
    filename: `أداء_الفواتير_${filterFrom}_إلى_${filterTo}`,
    title: "تقرير مبيعات وربحية مراكز التكلفة التفصيلي",
    headers: [
      "رقم الفاتورة", "التاريخ", "مركز التكلفة", "المندوب/السائق", "العميل",
      "الصنف", "الكمية", "سعر البيع", "إجمالي البيع", "سعر التكلفة", 
      "إجمالي التكلفة", "صافي الربح", "هامش الربح %"
    ],
    rows: rows
  });
};

// ── بناء كود الطباعة للتقرير الشامل ──
function buildInvoicePerfPrintHTML(data) {
  const grandSales = data.reduce((s, i) => s + i.sales, 0);
  const grandCOGS  = data.reduce((s, i) => s + i.cogs, 0);
  const grandGP    = data.reduce((s, i) => s + i.grossProfit, 0);
  const grandMargin = grandSales > 0 ? ((grandGP / grandSales) * 100).toFixed(1) : "0.0";

  // ترتيب الفواتير والأصناف والعملاء للطباعة
  const sortedByProfit = [...data].sort((a, b) => b.grossProfit - a.grossProfit);
  const topInv = sortedByProfit[0];
  const botInv = sortedByProfit[sortedByProfit.length - 1];

  const productMap = {};
  data.forEach(inv => {
    inv.items.forEach(it => {
      const k = it.name;
      if (!productMap[k]) productMap[k] = { name: k, qty: 0, sales: 0, cost: 0, profit: 0 };
      productMap[k].qty    += it.qty;
      productMap[k].sales  += it.lineTotal;
      productMap[k].cost   += it.lineCost;
      productMap[k].profit += it.lineProfit;
    });
  });
  const sortedProds = Object.values(productMap).sort((a, b) => b.profit - a.profit);
  const topProdProfit = sortedProds[0];
  const topProdSales = Object.values(productMap).sort((a, b) => b.sales - a.sales)[0];

  const customerMap = {};
  data.forEach(inv => {
    const k = inv.customerName;
    if (!customerMap[k]) customerMap[k] = { name: k, sales: 0, cost: 0, profit: 0, count: 0 };
    customerMap[k].sales  += inv.sales;
    customerMap[k].cost   += inv.cogs;
    customerMap[k].profit += inv.grossProfit;
    customerMap[k].count  += 1;
  });
  const sortedCustomers = Object.values(customerMap).sort((a, b) => b.sales - a.sales);
  const topCustomer = sortedCustomers[0];

  // جداول الأصناف للطباعة
  const prodRows = sortedProds.map((p, i) => `
    <tr>
      <td>${i+1}</td>
      <td style="text-align:right;">${p.name}</td>
      <td>${p.qty.toLocaleString()}</td>
      <td>${formatCurrency(p.sales)}</td>
      <td>${formatCurrency(p.cost)}</td>
      <td style="font-weight:700;color:${p.profit>=0?'#16a34a':'#dc2626'}">${formatCurrency(p.profit)}</td>
      <td>${(p.sales>0?((p.profit/p.sales)*100):0).toFixed(1)}%</td>
    </tr>`).join("");

  // جداول العملاء للطباعة
  const custRows = sortedCustomers.slice(0, 15).map((c, i) => `
    <tr>
      <td>${i+1}</td>
      <td style="text-align:right;">${c.name}</td>
      <td>${c.count}</td>
      <td>${formatCurrency(c.sales)}</td>
      <td>${formatCurrency(c.cost)}</td>
      <td style="font-weight:700;color:${c.profit>=0?'#16a34a':'#dc2626'}">${formatCurrency(c.profit)}</td>
      <td>${(c.sales>0?((c.profit/c.sales)*100):0).toFixed(1)}%</td>
    </tr>`).join("");

  // جداول الفواتير للطباعة
  const invRows = data.map((inv, i) => `
    <tr>
      <td>${i+1}</td>
      <td>${inv.number}</td>
      <td>${inv.date}</td>
      <td style="text-align:right;">${inv.customerName}</td>
      <td style="text-align:right;">${inv.ccName}</td>
      <td>${formatCurrency(inv.sales)}</td>
      <td>${formatCurrency(inv.cogs)}</td>
      <td style="font-weight:700;color:${inv.grossProfit>=0?'#16a34a':'#dc2626'}">${formatCurrency(inv.grossProfit)}</td>
      <td>${inv.margin}%</td>
    </tr>`).join("");

  return `<html dir="rtl" lang="ar"><head><meta charset="UTF-8">
  <title>تقرير أداء مراكز التكلفة ومبيعات المناديب التفصيلي</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1f2937; direction: rtl; font-size: 12px; background: #fff; }
    .hdr { text-align: center; margin-bottom: 25px; border-bottom: 3px solid #5b3ec2; padding-bottom: 12px; }
    .hdr h1 { margin: 0; color: #5b3ec2; font-size: 22px; }
    .hdr p { margin: 4px 0 0; color: #6b7280; font-size: 12px; }
    .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .meta-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; }
    .meta-box label { font-size: 11px; color: #6b7280; display: block; margin-bottom: 4px; }
    .meta-box span { font-weight: 700; font-size: 14px; }
    
    /* KPIs style */
    .kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px; }
    .kpi { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center; }
    .kpi.green { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
    .kpi.blue { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }
    .kpi.purple { background: #faf5ff; border-color: #e9d5ff; color: #6b21a8; }
    .kpi.yellow { background: #fffbeb; border-color: #fde68a; color: #854d0e; }
    .kpi-title { font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
    .kpi-val { font-size: 16px; font-weight: 800; }
    .kpi-desc { font-size: 10px; color: #6b7280; margin-top: 2px; }
    
    h2 { font-size: 14px; border-bottom: 2px solid #5b3ec2; padding-bottom: 6px; margin: 25px 0 10px; color: #5b3ec2; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
    th { background: #5b3ec2; color: #fff; padding: 6px 8px; text-align: center; font-weight: 600; }
    td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: center; }
    tr:nth-child(even) td { background: #f9fafb; }
    .footer { margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px; display: flex; justify-content: space-between; font-size: 11px; color: #6b7280; }
    @media print {
      body { padding: 0; }
      @page { size: A4 landscape; margin: 1cm; }
      .page-break { page-break-before: always; }
    }
  </style></head><body>
  <div class="hdr">
    <h1>📈 تقرير مبيعات وربحية مراكز التكلفة والمناديب التفصيلي الشامل</h1>
    <p>إدهام للمواد الغذائية — نظام ERP</p>
  </div>

  <div class="meta">
    <div class="meta-box"><label>فترة التقرير</label><span>من ${filterFrom} إلى ${filterTo}</span></div>
    <div class="meta-box"><label>مبيعات صافية (بدون ضريبة)</label><span style="color:#5b3ec2;">${formatCurrency(grandSales)}</span></div>
    <div class="meta-box"><label>صافي ربح الفواتير</label><span style="color:#16a34a;">${formatCurrency(grandGP)} (${grandMargin}%)</span></div>
  </div>

  <div class="kpis">
    <div class="kpi green">
      <div class="kpi-title">🏆 أعلى فاتورة ربحاً</div>
      <div class="kpi-val">${formatCurrency(topInv ? topInv.grossProfit : 0)}</div>
      <div class="kpi-desc">${topInv ? topInv.number : '—'} • ${topInv ? topInv.customerName : '—'}</div>
    </div>
    <div class="kpi blue">
      <div class="kpi-title">📊 الصنف الأكثر مبيعاً</div>
      <div class="kpi-val" style="font-size:12px;font-weight:700;">${topProdSales ? topProdSales.name : '—'}</div>
      <div class="kpi-desc">مبيعات: ${topProdSales ? formatCurrency(topProdSales.sales) : '0'}</div>
    </div>
    <div class="kpi purple">
      <div class="kpi-title">📈 الصنف الأعلى ربحاً</div>
      <div class="kpi-val" style="font-size:12px;font-weight:700;">${topProdProfit ? topProdProfit.name : '—'}</div>
      <div class="kpi-desc">صافي الربح: ${topProdProfit ? formatCurrency(topProdProfit.profit) : '0'}</div>
    </div>
    <div class="kpi yellow">
      <div class="kpi-title">👤 العميل الأكثر سحباً</div>
      <div class="kpi-val" style="font-size:12px;font-weight:700;">${topCustomer ? topCustomer.name : '—'}</div>
      <div class="kpi-desc">مسحوبات: ${topCustomer ? formatCurrency(topCustomer.sales) : '0'}</div>
    </div>
    <div class="kpi">
      <div class="kpi-title">🧾 عدد الفواتير</div>
      <div class="kpi-val">${data.length}</div>
      <div class="kpi-desc">فاتورة مبيعات مُرحّلة</div>
    </div>
  </div>

  <h2>📦 أولاً: مبيعات وربحية الأصناف بالتفصيل</h2>
  <table>
    <thead>
      <tr>
        <th style="width:40px;">#</th>
        <th style="text-align:right;">الصنف</th>
        <th>الكمية المباعة</th>
        <th>إجمالي المبيعات (صافي)</th>
        <th>إجمالي التكلفة (COGS)</th>
        <th>صافي الربح</th>
        <th>الهامش %</th>
      </tr>
    </thead>
    <tbody>${prodRows}</tbody>
  </table>

  <div class="page-break"></div>

  <h2>👤 ثانياً: مسحوبات وربحية العملاء (أعلى 15 عميل)</h2>
  <table>
    <thead>
      <tr>
        <th style="width:40px;">#</th>
        <th style="text-align:right;">العميل</th>
        <th>عدد الفواتير</th>
        <th>إجمالي المسحوبات (صافي)</th>
        <th>إجمالي التكلفة</th>
        <th>صافي الربح</th>
        <th>الهامش %</th>
      </tr>
    </thead>
    <tbody>${custRows}</tbody>
  </table>

  <h2>🧾 ثالثاً: أداء مبيعات وربحية الفواتير</h2>
  <table>
    <thead>
      <tr>
        <th style="width:40px;">#</th>
        <th>رقم الفاتورة</th>
        <th>التاريخ</th>
        <th style="text-align:right;">العميل</th>
        <th style="text-align:right;">مركز التكلفة</th>
        <th>المبيعات (صافي)</th>
        <th>التكلفة</th>
        <th>مجمل الربح</th>
        <th>الهامش %</th>
      </tr>
    </thead>
    <tbody>${invRows}</tbody>
  </table>

  <div class="footer">
    <span>تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA", { dateStyle: "full" })}</span>
    <span>نظام إدهام ERP — إدارة مراكز التكلفة</span>
  </div>
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────
// TAB 4: PERFORMANCE COMPARISON
// ─────────────────────────────────────────────────────────────
function renderCompare() {
  const kpis = buildCCKPIs().sort((a, b) => b.profit - a.profit);
  if (kpis.length === 0) return `<div class="alert info">لا توجد بيانات</div>`;

  const maxSales  = Math.max(...kpis.map(k => k.sales), 1);
  const maxProfit = Math.max(...kpis.map(k => Math.abs(k.profit)), 1);

  const bars = kpis.map(({ cc, sales, profit, waste }) => {
    const sBar = Math.round((sales / maxSales) * 100);
    const pBar = Math.round((Math.abs(profit) / maxProfit) * 100);
    const pColor = profit >= 0 ? "#10b981" : "#ef4444";
    return `
    <div style="background:var(--bg-2);border:1px solid var(--border-soft);border-radius:12px;padding:16px;margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <span style="font-weight:700;">${cc.type==="vehicle"?"🚐":"🏭"} ${cc.name}</span>
        <span style="font-size:11px;color:var(--text-2);">${cc.driverName || cc.code}</span>
      </div>
      <div style="margin-bottom:6px;">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-2);margin-bottom:3px;">
          <span>المبيعات</span><span>${formatCurrency(sales)}</span>
        </div>
        <div style="height:8px;background:var(--bg-3);border-radius:4px;overflow:hidden;">
          <div style="width:${sBar}%;height:100%;background:var(--primary);border-radius:4px;transition:width 0.4s;"></div>
        </div>
      </div>
      <div style="margin-bottom:4px;">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-2);margin-bottom:3px;">
          <span>الربح / الخسارة</span><span style="color:${pColor};font-weight:700;">${formatCurrency(profit)}</span>
        </div>
        <div style="height:8px;background:var(--bg-3);border-radius:4px;overflow:hidden;">
          <div style="width:${pBar}%;height:100%;background:${pColor};border-radius:4px;transition:width 0.4s;"></div>
        </div>
      </div>
      ${waste > 0 ? `<div style="font-size:11px;color:#ef4444;margin-top:4px;">⚠️ فاقد: ${waste.toLocaleString()} وحدة</div>` : ""}
    </div>`;
  }).join("");

  return `
  <h2 style="font-size:18px;font-weight:700;margin-bottom:16px;">📈 مقارنة أداء مراكز التكلفة</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:16px;">
    ${bars}
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// TAB 5: INVENTORY MOVEMENT
// ─────────────────────────────────────────────────────────────
function renderInventory() {
  const kpis = buildCCKPIs().filter(k => k.cc.type === "vehicle" || k.loaded > 0);
  const rows = kpis.map(({ cc, loaded, sold, returned, waste }) => {
    const wPct = loaded > 0 ? ((waste / loaded) * 100).toFixed(1) : "0.0";
    const wColor = parseFloat(wPct) > 5 ? "#ef4444" : parseFloat(wPct) > 2 ? "#f59e0b" : "#10b981";
    return `<tr>
      <td><span class="mono">${cc.code}</span></td>
      <td style="font-weight:600;">🚐 ${cc.name}</td>
      <td>${cc.driverName || "—"}</td>
      <td class="mono">${loaded.toLocaleString()}</td>
      <td class="mono" style="color:#10b981;">${sold.toLocaleString()}</td>
      <td class="mono" style="color:#8b5cf6;">${returned.toLocaleString()}</td>
      <td class="mono" style="color:${wColor};font-weight:700;">${waste.toLocaleString()}</td>
      <td><span style="padding:3px 10px;border-radius:20px;background:${wColor}22;color:${wColor};font-weight:700;">${wPct}%</span></td>
    </tr>`;
  }).join("");

  return `
  <h2 style="font-size:18px;font-weight:700;margin-bottom:16px;">📦 حركة المخزون لكل سيارة</h2>
  <div class="alert info mb-16" style="font-size:12px;">
    الفاقد = البضاعة المحمّلة − المباعة − المرتجعة. نسبة فاقد أكثر من 5% تستوجب المراجعة.
  </div>
  <div class="table-container">
    <table class="data-dense" id="inventory-table">
      <thead><tr>
        <th>الكود</th><th>السيارة</th><th>السائق</th>
        <th>المحمّل (وحدة)</th><th>المباع</th><th>المرتجع</th>
        <th>الفاقد</th><th>نسبة الفاقد</th>
      </tr></thead>
      <tbody>${rows || `<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--text-2);">لا توجد حركات مخزنية لسيارات في هذه الفترة</td></tr>`}</tbody>
    </table>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// TAB 6: COST ALLOCATION
// ─────────────────────────────────────────────────────────────
function renderAllocation() {
  const indirectExp = allExpenses.filter(e => inRange(e.date) && !e.costCenterId);
  const totalIndirect = indirectExp.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  // Group indirect by account name / category for visibility
  const indirectByType = {};
  indirectExp.forEach(e => {
    const key = e.accountName || e.notes || "أخرى";
    if (!indirectByType[key]) indirectByType[key] = 0;
    indirectByType[key] += parseFloat(e.amount) || 0;
  });
  const indirectTypeRows = Object.entries(indirectByType)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `<tr><td style="padding:5px 10px;font-size:12px;">${k}</td><td class="mono" style="padding:5px 10px;font-size:12px;color:#8b5cf6;">${formatCurrency(v)}</td></tr>`)
    .join("");
  const vehicleCCs = costCenters.filter(cc => cc.type === "vehicle");
  const kpis = buildCCKPIs();

  const totalSales = kpis.reduce((s, k) => s + k.sales, 0);

  const allocationRows = vehicleCCs.map(cc => {
    const kpi = kpis.find(k => k.cc.id === cc.id) || {};
    const salesShare = totalSales > 0 ? ((kpi.sales || 0) / totalSales) : (1 / (vehicleCCs.length || 1));
    const manualPct  = cc.allocPct ? (parseFloat(cc.allocPct) / 100) : null;
    const pct = manualPct ?? salesShare;
    const allocated = totalIndirect * pct;
    return `<tr>
      <td style="font-weight:600;">🚐 ${cc.name}</td>
      <td class="mono">${formatCurrency(kpi.sales || 0)}</td>
      <td class="mono">${(salesShare * 100).toFixed(1)}%</td>
      <td><input type="number" class="input mono" style="width:80px;height:28px;padding:2px 6px;font-size:12px;"
        value="${cc.allocPct || ""}" placeholder="تلقائي" min="0" max="100"
        onchange="updateAllocPct('${cc.id}', this.value)" /></td>
      <td class="mono" style="color:#8b5cf6;font-weight:700;">${formatCurrency(allocated)}</td>
    </tr>`;
  }).join("");

  return `
  <h2 style="font-size:18px;font-weight:700;margin-bottom:16px;">⚖️ تقرير المصاريف الموزّعة</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;">
    <div class="kpi-card" style="border-right:3px solid #8b5cf6;">
      <div class="kpi-label">المصاريف غير المباشرة (رواتب وعمومية)</div>
      <div class="kpi-value" style="color:#8b5cf6;">${formatCurrency(totalIndirect)}</div>
      <div style="font-size:11px;color:var(--text-2);margin-top:4px;">${indirectExp.length} مصروف — مُوزَّعة تلقائياً على مراكز التكلفة</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">أسلوب التوزيع الافتراضي</div>
      <div style="font-size:14px;font-weight:700;margin-top:8px;">حسب حجم المبيعات لكل مركز</div>
      <div style="font-size:11px;color:var(--text-2);margin-top:2px;">يمكنك تحديد نسبة يدوية في الجدول أدناه</div>
    </div>
  </div>

  ${indirectTypeRows ? `
  <div class="card mb-16" style="padding:14px 16px;">
    <div style="font-weight:700;font-size:13px;margin-bottom:10px;color:var(--text-1);">📋 تفصيل المصاريف غير المباشرة (الرواتب والعموميات)</div>
    <div style="overflow-x:auto;max-height:200px;overflow-y:auto;">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:var(--bg-3);font-size:11px;">
          <th style="padding:6px 10px;text-align:right;font-weight:600;">نوع المصروف</th>
          <th style="padding:6px 10px;text-align:left;font-weight:600;">المبلغ</th>
        </tr></thead>
        <tbody>${indirectTypeRows}</tbody>
      </table>
    </div>
  </div>` : ''}

  <div class="table-container">
    <table class="data-dense">
      <thead><tr>
        <th>مركز التكلفة</th><th>المبيعات</th><th>الحصة حسب المبيعات</th>
        <th>نسبة يدوية %</th><th>المبلغ الموزّع</th>
      </tr></thead>
      <tbody>${allocationRows || `<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-2);">لا توجد سيارات مسجلة</td></tr>`}</tbody>
    </table>
  </div>
  <div class="alert info mt-12" style="font-size:12px;">
    💡 لإضافة مصروف على مركز تكلفة مباشرة، افتح شاشة <strong>المصروفات</strong> واختر مركز التكلفة من القائمة.
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// TAB 7: BREAK-EVEN
// ─────────────────────────────────────────────────────────────
function renderBreakeven() {
  const kpis = buildCCKPIs();
  const rows = kpis.map(({ cc, sales, cogs, expenses, fixed }) => {
    const totalFixed = fixed;
    // Variable costs = COGS + direct/allocated expenses (correct formula)
    const varCostRatio = sales > 0 ? (((cogs + expenses) / sales)).toFixed(3) : 0;
    const contribution = 1 - parseFloat(varCostRatio);
    const breakeven = contribution > 0 ? (totalFixed / contribution) : null;
    const bLabel = breakeven !== null ? formatCurrency(breakeven) : "—";
    const gap = breakeven !== null ? sales - breakeven : null;
    const gapLabel = gap !== null ? formatCurrency(Math.abs(gap)) : "—";
    const gapColor = gap === null ? "" : gap >= 0 ? "color:#10b981;" : "color:#ef4444;";
    const status = gap === null ? "—" : gap >= 0 ? "✅ فوق نقطة التعادل" : "❌ أقل من نقطة التعادل";
    return `<tr>
      <td style="font-weight:600;">🚐 ${cc.name}</td>
      <td class="mono">${formatCurrency(totalFixed)}</td>
      <td class="mono">${(parseFloat(varCostRatio) * 100).toFixed(1)}%</td>
      <td class="mono" style="color:#8b5cf6;font-weight:700;">${bLabel}</td>
      <td class="mono">${formatCurrency(sales)}</td>
      <td class="mono" style="${gapColor}font-weight:700;">${gapLabel}</td>
      <td style="${gapColor}font-size:12px;">${status}</td>
    </tr>`;
  }).join("");

  return `
  <h2 style="font-size:18px;font-weight:700;margin-bottom:8px;">⚡ تقرير نقطة التعادل (Break-even Analysis)</h2>
  <div class="alert info mb-16" style="font-size:12px;">
    نقطة التعادل = التكاليف الثابتة ÷ هامش المساهمة (1 − نسبة التكاليف المتغيرة للمبيعات)
  </div>
  <div class="table-container">
    <table class="data-dense">
      <thead><tr>
        <th>السيارة</th><th>التكاليف الثابتة</th><th>نسبة التكاليف المتغيرة</th>
        <th>نقطة التعادل</th><th>المبيعات الفعلية</th><th>الفجوة</th><th>الحالة</th>
      </tr></thead>
      <tbody>${rows || `<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-2);">لا توجد بيانات</td></tr>`}</tbody>
    </table>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// TAB 8: MANAGE COST CENTERS
// ─────────────────────────────────────────────────────────────
function renderManage() {
  const rows = costCenters.map(cc => {
    const wh = warehouses.find(w => w.costCenterId === cc.id);
    const typeLabel = { vehicle: "🚐 سيارة", warehouse: "🏭 مخزن", department: "🏢 قسم", general: "📌 عام" };
    return `<tr>
      <td><span class="mono" style="color:var(--primary);">${cc.code}</span></td>
      <td style="font-weight:600;">${typeLabel[cc.type] || cc.type} ${cc.name}</td>
      <td>${cc.driverName || "—"}</td>
      <td class="mono">${cc.plateNumber || "—"}</td>
      <td>${wh ? `<span style="color:#10b981;font-size:12px;">✅ ${wh.name}</span>` : "—"}</td>
      <td class="mono">${formatCurrency(cc.fixedCost || 0)}</td>
      <td><span style="font-size:11px;padding:2px 8px;border-radius:12px;background:${cc.isActive!==false?'#10b98122':'#ef444422'};color:${cc.isActive!==false?'#10b981':'#ef4444'};">${cc.isActive!==false?'نشط':'معطل'}</span></td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="openCCModal('${cc.id}')">✏️ تعديل</button>
        <button class="btn btn-sm" style="background:#ef444422;color:#ef4444;border:1px solid #ef444433;margin-right:4px;" onclick="deleteCostCenter('${cc.id}','${cc.name}')">🗑️</button>
      </td>
    </tr>`;
  }).join("");

  return `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
    <h2 style="font-size:18px;font-weight:700;">⚙️ إدارة مراكز التكلفة</h2>
    <button class="btn btn-primary" onclick="openCCModal()">＋ مركز تكلفة جديد</button>
  </div>
  <div class="table-container">
    <table class="data-dense">
      <thead><tr>
        <th>الكود</th><th>الاسم</th><th>المسؤول</th><th>اللوحة</th>
        <th>المخزن المرتبط</th><th>التكلفة الثابتة/شهر</th><th>الحالة</th><th>إجراءات</th>
      </tr></thead>
      <tbody>${rows || `<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-2);">لا توجد مراكز تكلفة مسجلة</td></tr>`}</tbody>
    </table>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════════
window.openCCModal = (id = null) => {
  const cc = id ? costCenters.find(c => c.id === id) : null;
  document.getElementById("cc-edit-id").value     = cc?.id || "";
  document.getElementById("cc-modal-title").textContent = cc ? "✏️ تعديل مركز تكلفة" : "➕ مركز تكلفة جديد";
  document.getElementById("cc-code").value        = cc?.code || "";
  document.getElementById("cc-name").value        = cc?.name || "";
  document.getElementById("cc-type").value        = cc?.type || "vehicle";
  document.getElementById("cc-driver").value      = cc?.driverName || "";
  document.getElementById("cc-plate").value       = cc?.plateNumber || "";
  document.getElementById("cc-vehicle-id").value  = cc?.vehicleId || "";
  document.getElementById("cc-fixed-cost").value  = cc?.fixedCost || "";
  document.getElementById("cc-alloc-pct").value   = cc?.allocPct || "";
  document.getElementById("cc-notes").value       = cc?.notes || "";
  document.getElementById("cc-auto-warehouse").checked = true;
  document.getElementById("cc-modal-err").classList.add("hidden");
  ccTypeToggle();
  openModal("cc-modal");
};

window.ccTypeToggle = () => {
  const type = document.getElementById("cc-type")?.value;
  const vf   = document.getElementById("cc-vehicle-fields");
  if (vf) vf.style.display = type === "vehicle" ? "block" : "none";
};

window.saveCostCenter = async () => {
  const errEl  = document.getElementById("cc-modal-err"); errEl.classList.add("hidden");
  const id     = document.getElementById("cc-edit-id").value;
  const code   = document.getElementById("cc-code").value.trim().toUpperCase();
  const name   = document.getElementById("cc-name").value.trim();
  const type   = document.getElementById("cc-type").value;
  if (!code) { errEl.textContent = "يرجى إدخال كود مركز التكلفة"; errEl.classList.remove("hidden"); return; }
  if (!name) { errEl.textContent = "يرجى إدخال اسم مركز التكلفة"; errEl.classList.remove("hidden"); return; }

  const data = {
    code, name, type,
    driverName:  document.getElementById("cc-driver").value.trim(),
    plateNumber: document.getElementById("cc-plate").value.trim(),
    vehicleId:   document.getElementById("cc-vehicle-id").value.trim(),
    fixedCost:   parseFloat(document.getElementById("cc-fixed-cost").value) || 0,
    allocPct:    parseFloat(document.getElementById("cc-alloc-pct").value) || null,
    notes:       document.getElementById("cc-notes").value.trim(),
    isActive:    true,
  };

  const btn = document.getElementById("cc-save-btn"); btn.disabled = true; btn.textContent = "جارٍ الحفظ…";
  try {
    let ccId = id;
    if (id) {
      await update("costCenters", id, data);
      showToast("✅ تم تحديث مركز التكلفة", "success");
    } else {
      ccId = await create(COLS.costCenters(), data);
      showToast("✅ تم إنشاء مركز التكلفة", "success");

      // ── إنشاء مخزن سيارة تلقائياً ──
      if (type === "vehicle" && document.getElementById("cc-auto-warehouse").checked) {
        const whData = {
          barcodePrefix: code,
          name: `مخزن سيارة — ${name}`,
          type: "Vehicle",
          storageTemperature: "ambient",
          isActive: true,
          manager: data.driverName,
          costCenterId: ccId,
          driverName:   data.driverName,
          plateNumber:  data.plateNumber,
          notes: `مخزن سيارة توزيع — تم إنشاؤه تلقائياً`,
          allowNegative: false,
          requireBatch: false,
          requireExpiry: false,
          requireSerial: false,
        };
        const whId = await create(COLS.warehouses(), whData);
        try {
          const coaData = await syncEntityToCoa("warehouses", whId, whData.name, { type: "Vehicle" });
          if (coaData) {
            await update("warehouses", whId, coaData);
          }
        } catch (coaErr) {
          console.warn("Failed to sync vehicle warehouse to COA:", coaErr.message);
        }
        await update("costCenters", ccId, { warehouseId: whId });
        showToast(`✅ تم إنشاء مخزن السيارة: ${whData.name}`, "success");
      }
    }
    closeModal("cc-modal");
    await loadAll();
    renderTab(activeTab);
  } catch (err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false; btn.textContent = "💾 حفظ";
  }
};

window.deleteCostCenter = async (id, name) => {
  if (!await window.showConfirm(`هل تريد حذف مركز التكلفة "${name}"؟\nسيتم إلغاء ربطه بالمخزن فقط ولن تُحذف الحركات.`, "حذف مركز التكلفة")) return;
  try {
    await remove("costCenters", id);
    showToast("تم الحذف", "success");
    await loadAll(); renderTab(activeTab);
  } catch (err) { showToast(err.message, "error"); }
};

window.createVehicleWarehouse = async (ccId) => {
  const cc = costCenters.find(c => c.id === ccId);
  if (!cc) return;
  const whData = {
    barcodePrefix: cc.code,
    name: `مخزن سيارة — ${cc.name}`,
    type: "Vehicle",
    storageTemperature: "ambient",
    isActive: true,
    manager: cc.driverName || "",
    costCenterId: ccId,
    driverName: cc.driverName || "",
    plateNumber: cc.plateNumber || "",
    notes: `مخزن سيارة توزيع — تم إنشاؤه تلقائياً`,
    allowNegative: false,
    requireBatch: false,
    requireExpiry: false,
    requireSerial: false,
  };
  try {
    const whId = await create(COLS.warehouses(), whData);
    try {
      const coaData = await syncEntityToCoa("warehouses", whId, whData.name, { type: "Vehicle" });
      if (coaData) {
        await update("warehouses", whId, coaData);
      }
    } catch (coaErr) {
      console.warn("Failed to sync vehicle warehouse to COA:", coaErr.message);
    }
    await update("costCenters", ccId, { warehouseId: whId });
    showToast("✅ تم إنشاء مخزن السيارة", "success");
    await loadAll(); renderTab(activeTab);
  } catch (err) { showToast(err.message, "error"); }
};

window.updateAllocPct = async (ccId, val) => {
  try { await update("costCenters", ccId, { allocPct: parseFloat(val) || null }); } catch {}
};

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════
window.ccExportPDF = async () => {
  const { exportPDF } = await import("../utils/export.js");
  const kpis = buildCCKPIs();
  exportPDF({
    title: "تقرير ربحية مراكز التكلفة",
    subtitle: `الفترة: ${filterFrom} — ${filterTo}`,
    headers: ["مركز التكلفة", "السائق", "المبيعات", "المصاريف", "التكلفة الثابتة", "صافي الربح", "هامش الربح"],
    rows: kpis.map(({ cc, sales, expenses, fixed, profit }) => [
      cc.name,
      cc.driverName || "—",
      formatCurrency(sales),
      formatCurrency(expenses),
      formatCurrency(fixed),
      formatCurrency(profit),
      sales > 0 ? `${((profit/sales)*100).toFixed(1)}%` : "—",
    ]),
    filename: `مراكز_التكلفة_${filterFrom}`,
    orientation: "landscape",
  });
};

window.ccExportExcel = async () => {
  const { exportXLSX } = await import("../utils/export.js");
  const kpis = buildCCKPIs();
  exportXLSX({
    filename: `مراكز_التكلفة_${filterFrom}`,
    title: "تقرير ربحية مراكز التكلفة",
    headers: ["مركز التكلفة", "الكود", "السائق", "المبيعات", "المصاريف المباشرة", "التكلفة الثابتة", "صافي الربح"],
    rows: kpis.map(({ cc, sales, expenses, fixed, profit }) => [
      cc.name, cc.code, cc.driverName || "", sales, expenses, fixed, profit,
    ]),
  });
};

// ═══════════════════════════════════════════════════════════════
// UTILITY — expose getCostCenters for other modules
// ═══════════════════════════════════════════════════════════════
export async function getCostCenters() {
  if (costCenters.length > 0) return costCenters;
  const ccList = await getAll(COLS.costCenters()).catch(() => []);
  return ccList.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
}

export function costCenterSelect(selectedId = "") {
  return costCenters
    .map(cc => `<option value="${cc.id}" ${cc.id === selectedId ? "selected" : ""}>${cc.code} — ${cc.name}</option>`)
    .join("");
}

function setupEvents() {
  // date filters handled inline via onchange
}
