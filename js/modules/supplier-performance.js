// ============================================================
// IDHAM ERP — Supplier Performance Report (أداء تصريف الموردين)
// مقارنة المشتريات بالمبيعات لكل مورد — Phase 1
// ============================================================
import { getAll } from "../utils/db.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import { db, COMPANY_ID } from "../firebase-config.js";

// ── State ─────────────────────────────────────────────────────
let _purchases  = [];
let _sales      = [];
let _products   = [];
let _suppliers  = [];
let _reportData = [];
let _dateFrom   = "";
let _dateTo     = "";
let _selSupplier = "";

// ── Entry Point ───────────────────────────────────────────────
export async function render(container) {
  container.innerHTML = buildSkeleton();
  attachEventListeners();
  await loadData();
  populateSupplierFilter();
  runReport();
}

// ── HTML Skeleton ─────────────────────────────────────────────
function buildSkeleton() {
  const today = new Date().toISOString().slice(0, 10);
  const y = today.slice(0, 4);
  const fromDefault = `${y}-01-01`;
  return `
<div class="sp-wrap" dir="rtl">

  <!-- Page Header -->
  <div class="sp-page-header">
    <div>
      <h2 class="sp-page-title">📊 أداء تصريف الموردين</h2>
      <p class="sp-page-sub">مقارنة المشتريات بالمبيعات والمخزون المتبقي لكل مورد</p>
    </div>
    <button class="btn-sp-export" onclick="window.exportSupplierPerf()">⬇ تصدير CSV</button>
  </div>

  <!-- Filters -->
  <div class="sp-filters card">
    <div class="sp-filter-row">
      <div class="sp-filter-group">
        <label>من تاريخ</label>
        <input type="date" id="sp-date-from" value="${fromDefault}" class="sp-input">
      </div>
      <div class="sp-filter-group">
        <label>إلى تاريخ</label>
        <input type="date" id="sp-date-to" value="${today}" class="sp-input">
      </div>
      <div class="sp-filter-group">
        <label>المورد</label>
        <select id="sp-supplier" class="sp-input">
          <option value="">— كل الموردين —</option>
        </select>
      </div>
      <button class="btn-sp-run" onclick="window.runPerfReport()">🔍 تشغيل التقرير</button>
    </div>
  </div>

  <!-- KPI Cards -->
  <div id="sp-kpi" class="sp-kpi-row"></div>

  <!-- Main Table -->
  <div class="sp-table-wrap card">
    <div id="sp-table-container">
      <p class="sp-hint">اضغط "تشغيل التقرير" لعرض البيانات</p>
    </div>
  </div>

</div>

<style>
/* ── Supplier Performance Styles ── */
.sp-wrap { padding: 1rem; max-width: 1400px; margin: 0 auto; }
.sp-page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; }
.sp-page-title  { font-size:1.5rem; font-weight:700; margin:0; color:var(--text-primary,#1e293b); }
.sp-page-sub    { font-size:.85rem; color:var(--text-muted,#64748b); margin:0; }

.sp-filters { padding:1rem 1.25rem; margin-bottom:1rem; }
.sp-filter-row { display:flex; flex-wrap:wrap; gap:.75rem; align-items:flex-end; }
.sp-filter-group { display:flex; flex-direction:column; gap:.25rem; }
.sp-filter-group label { font-size:.8rem; font-weight:600; color:var(--text-muted,#64748b); }
.sp-input { padding:.45rem .75rem; border:1px solid var(--border,#e2e8f0); border-radius:8px;
            font-size:.88rem; background:var(--bg-input,#fff); color:var(--text-primary,#1e293b);
            min-width:140px; }
.sp-input:focus { outline:none; border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.15); }

.btn-sp-run { padding:.5rem 1.25rem; background:#1d4ed8; color:#fff; border:none;
              border-radius:8px; font-size:.9rem; font-weight:600; cursor:pointer; align-self:flex-end; }
.btn-sp-run:hover { background:#1e40af; }
.btn-sp-export { padding:.45rem 1rem; background:transparent; border:2px solid #1d4ed8;
                 color:#1d4ed8; border-radius:8px; font-size:.85rem; font-weight:600;
                 cursor:pointer; }
.btn-sp-export:hover { background:#eff6ff; }

/* KPI Row */
.sp-kpi-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; margin-bottom:1rem; }
.sp-kpi-card { background:var(--bg-card,#fff); border-radius:12px;
               box-shadow:0 1px 3px rgba(0,0,0,.08); padding:1rem 1.25rem;
               border-right:4px solid #3b82f6; }
.sp-kpi-label { font-size:.78rem; color:var(--text-muted,#64748b); margin-bottom:.35rem; font-weight:600; }
.sp-kpi-value { font-size:1.45rem; font-weight:700; color:var(--text-primary,#1e293b); }
.sp-kpi-sub   { font-size:.75rem; color:var(--text-muted,#64748b); margin-top:.2rem; }

/* Table */
.sp-table-wrap { padding:1rem; }
.sp-hint { text-align:center; color:var(--text-muted,#64748b); padding:2rem; }
.sp-table { width:100%; border-collapse:collapse; font-size:.85rem; }
.sp-table th { background:var(--bg-th,#f1f5f9); padding:.6rem .75rem; text-align:right;
               font-weight:700; color:var(--text-secondary,#475569); border-bottom:2px solid var(--border,#e2e8f0); }
.sp-table td { padding:.55rem .75rem; border-bottom:1px solid var(--border,#f1f5f9);
               vertical-align:middle; }
.sp-table tr:hover td { background:rgba(59,130,246,.04); }

/* Progress Bar */
.sp-bar-wrap { background:#f1f5f9; border-radius:99px; height:8px; min-width:80px; overflow:hidden; }
.sp-bar { height:8px; border-radius:99px; transition:width .4s ease; }
.bar-green { background:#22c55e; }
.bar-yellow { background:#f59e0b; }
.bar-red { background:#ef4444; }

/* Status Badge */
.sp-badge { display:inline-flex; align-items:center; gap:.3rem; padding:.2rem .6rem;
            border-radius:99px; font-size:.75rem; font-weight:700; white-space:nowrap; }
.badge-green  { background:#dcfce7; color:#166534; }
.badge-yellow { background:#fef9c3; color:#854d0e; }
.badge-red    { background:#fee2e2; color:#991b1b; }

/* Expand Button */
.btn-expand { background:none; border:none; cursor:pointer; font-size:1rem; padding:.1rem .4rem;
              color:#3b82f6; transition:transform .2s; }
.btn-expand.open { transform:rotate(90deg); }

/* Detail Table */
.sp-detail-row td { padding:0 !important; }
.sp-detail-inner { padding:.5rem 1rem 1rem 1rem; background:#f8fafc; }
.sp-detail-table { width:100%; border-collapse:collapse; font-size:.8rem; }
.sp-detail-table th { background:#e2e8f0; padding:.45rem .6rem; text-align:right; font-weight:700; }
.sp-detail-table td { padding:.4rem .6rem; border-bottom:1px solid #e2e8f0; }

/* Responsive */
@media(max-width:768px) {
  .sp-filter-row { flex-direction:column; }
  .sp-kpi-row    { grid-template-columns:1fr 1fr; }
  .sp-table-wrap { overflow-x:auto; }
}
</style>
  `;
}

// ── Load Firestore Data ───────────────────────────────────────
async function loadData() {
  const btn = document.querySelector(".btn-sp-run");
  if (btn) btn.textContent = "⏳ جارٍ التحميل...";

  try {
    const [purchases, sales, products, suppliers] = await Promise.all([
      getAll("purchaseInvoices"),
      getAll("salesInvoices"),
      getAll("products"),
      getAll("suppliers"),
    ]);
    _purchases = purchases  || [];
    _sales     = sales      || [];
    _products  = products   || [];
    _suppliers = suppliers  || [];
  } catch (e) {
    console.error("SP: loadData error", e);
  }

  if (btn) btn.textContent = "🔍 تشغيل التقرير";
}

// ── Populate Supplier Filter ──────────────────────────────────
function populateSupplierFilter() {
  const sel = document.getElementById("sp-supplier");
  if (!sel) return;
  // Collect unique suppliers from purchases
  const seen = new Set();
  _purchases.forEach(p => {
    if (p.supplierId && !seen.has(p.supplierId)) {
      seen.add(p.supplierId);
      const opt = document.createElement("option");
      opt.value = p.supplierId;
      opt.textContent = p.supplierName || p.supplierId;
      sel.appendChild(opt);
    }
  });
}

// ── Build Report ──────────────────────────────────────────────
function buildReport() {
  const from = _dateFrom ? new Date(_dateFrom) : null;
  const to   = _dateTo   ? new Date(_dateTo + "T23:59:59") : null;

  // Product map
  const prodMap = {};
  _products.forEach(p => { prodMap[p.id] = p; });

  // Supplier map
  const supMap = {};
  _suppliers.forEach(s => { supMap[s.id] = s.name || s.id; });

  // ── Aggregate purchases per supplier → product ────────────
  const supData = {}; // { supplierId: { name, products: { productId: { purchased, sold, stock } } } }

  const inRange = (dateVal) => {
    if (!dateVal) return true;
    let d;
    if (dateVal?.toDate) d = dateVal.toDate();
    else if (typeof dateVal === "string") d = new Date(dateVal);
    else d = new Date(dateVal);
    if (from && d < from) return false;
    if (to   && d > to  ) return false;
    return true;
  };

  // Process purchases
  _purchases.forEach(inv => {
    if (!inRange(inv.date)) return;
    const sid  = inv.supplierId  || "unknown";
    const sname = inv.supplierName || supMap[sid] || "غير محدد";
    if (_selSupplier && sid !== _selSupplier) return;

    if (!supData[sid]) supData[sid] = { name: sname, id: sid, prods: {} };

    const lines = inv.lines || inv.items || [];
    lines.forEach(l => {
      const pid = l.productId || l.id || "";
      if (!pid) return;
      if (!supData[sid].prods[pid]) {
        supData[sid].prods[pid] = {
          name: l.productName || prodMap[pid]?.name || pid,
          sku:  l.sku || prodMap[pid]?.sku || "",
          purchasedQty: 0, purchasedVal: 0,
          soldQty: 0, soldVal: 0,
          currentStock: 0,
        };
      }
      const qty   = Number(l.qty || 0) + Number(l.bonus || 0);
      const price = Number(l.unitCost || l.unitPrice || 0);
      supData[sid].prods[pid].purchasedQty += qty;
      supData[sid].prods[pid].purchasedVal += qty * price;
    });
  });

  // Process sales — match by productId across ALL suppliers that have that product
  _sales.forEach(inv => {
    if (!inRange(inv.date)) return;
    const lines = inv.lines || inv.items || [];
    lines.forEach(l => {
      const pid = l.productId || l.id || "";
      if (!pid) return;
      // Add sold qty to each supplier that has this product
      Object.values(supData).forEach(sup => {
        if (sup.prods[pid]) {
          const qty   = Number(l.qty || 0);
          const price = Number(l.unitPrice || 0);
          sup.prods[pid].soldQty += qty;
          sup.prods[pid].soldVal += qty * price;
        }
      });
    });
  });

  // Fill current stock from products collection
  Object.values(supData).forEach(sup => {
    Object.keys(sup.prods).forEach(pid => {
      const p = prodMap[pid];
      if (p) {
        const stk = Number(p.currentStock ?? p.stock ?? p.qty ?? 0);
        sup.prods[pid].currentStock = stk;
      }
    });
  });

  // ── Build report rows ─────────────────────────────────────
  _reportData = Object.values(supData).map(sup => {
    let totalPurchased = 0, totalSold = 0, totalRemaining = 0;
    const prods = Object.values(sup.prods);
    prods.forEach(p => {
      totalPurchased += p.purchasedQty;
      totalSold      += p.soldQty;
      p.remaining     = Math.max(0, p.purchasedQty - p.soldQty);
      totalRemaining += p.remaining;
    });
    const turnoverPct = totalPurchased > 0
      ? Math.round((totalSold / totalPurchased) * 100) : 0;
    return {
      ...sup,
      prods,
      totalPurchased, totalSold, totalRemaining, turnoverPct,
    };
  });

  // Sort by turnoverPct desc
  _reportData.sort((a, b) => b.turnoverPct - a.turnoverPct);
}

// ── KPI Cards ─────────────────────────────────────────────────
function renderKPI() {
  const el = document.getElementById("sp-kpi");
  if (!el) return;

  const totalPurch = _reportData.reduce((s, r) => s + r.totalPurchased, 0);
  const totalSold  = _reportData.reduce((s, r) => s + r.totalSold,  0);
  const best  = _reportData[0];
  const worst = _reportData[_reportData.length - 1];
  const overallPct = totalPurch > 0 ? Math.round((totalSold / totalPurch) * 100) : 0;

  el.innerHTML = `
    <div class="sp-kpi-card" style="border-color:#3b82f6">
      <div class="sp-kpi-label">إجمالي المشتريات (وحدة)</div>
      <div class="sp-kpi-value">${totalPurch.toLocaleString("ar")}</div>
      <div class="sp-kpi-sub">عدد الموردين: ${_reportData.length}</div>
    </div>
    <div class="sp-kpi-card" style="border-color:#22c55e">
      <div class="sp-kpi-label">إجمالي المبيعات (وحدة)</div>
      <div class="sp-kpi-value">${totalSold.toLocaleString("ar")}</div>
      <div class="sp-kpi-sub">معدل التصريف الكلي: ${overallPct}%</div>
    </div>
    <div class="sp-kpi-card" style="border-color:#22c55e">
      <div class="sp-kpi-label">🏆 أفضل مورد تصريفاً</div>
      <div class="sp-kpi-value" style="font-size:1.1rem">${best ? best.name : "—"}</div>
      <div class="sp-kpi-sub">${best ? best.turnoverPct + "% تصريف" : ""}</div>
    </div>
    <div class="sp-kpi-card" style="border-color:#ef4444">
      <div class="sp-kpi-label">⚠ أقل مورد تصريفاً</div>
      <div class="sp-kpi-value" style="font-size:1.1rem">${worst && worst !== best ? worst.name : "—"}</div>
      <div class="sp-kpi-sub">${worst && worst !== best ? worst.turnoverPct + "% تصريف" : ""}</div>
    </div>
  `;
}

// ── Status Indicator ──────────────────────────────────────────
function indicator(pct) {
  if (pct >= 75) return { cls: "badge-green",  barCls: "bar-green",  icon: "🟢", label: "ممتاز"  };
  if (pct >= 40) return { cls: "badge-yellow", barCls: "bar-yellow", icon: "🟡", label: "متوسط"  };
  return          { cls: "badge-red",   barCls: "bar-red",   icon: "🔴", label: "ضعيف"   };
}

// ── Main Table ────────────────────────────────────────────────
function renderTable() {
  const tc = document.getElementById("sp-table-container");
  if (!tc) return;

  if (!_reportData.length) {
    tc.innerHTML = `<p class="sp-hint">لا توجد بيانات للفترة المحددة</p>`;
    return;
  }

  const rows = _reportData.map((row, i) => {
    const ind = indicator(row.turnoverPct);
    const barW = Math.min(100, row.turnoverPct);
    return `
      <tr>
        <td>
          <button class="btn-expand" id="expand-${i}" onclick="window.togglePerfDetail(${i})">▶</button>
        </td>
        <td><strong>${row.name}</strong></td>
        <td>${row.totalPurchased.toLocaleString("ar")}</td>
        <td>${row.totalSold.toLocaleString("ar")}</td>
        <td>${row.totalRemaining.toLocaleString("ar")}</td>
        <td>
          <div style="display:flex;align-items:center;gap:.5rem;">
            <div class="sp-bar-wrap" style="flex:1">
              <div class="sp-bar ${ind.barCls}" style="width:${barW}%"></div>
            </div>
            <span style="min-width:40px;font-weight:700;color:${barW>=75?'#16a34a':barW>=40?'#d97706':'#dc2626'}">${row.turnoverPct}%</span>
          </div>
        </td>
        <td><span class="sp-badge ${ind.cls}">${ind.icon} ${ind.label}</span></td>
        <td>${row.prods.length}</td>
      </tr>
      <tr id="detail-row-${i}" class="sp-detail-row" style="display:none">
        <td colspan="8">${buildDetailTable(row)}</td>
      </tr>
    `;
  }).join("");

  tc.innerHTML = `
    <table class="sp-table">
      <thead>
        <tr>
          <th style="width:40px"></th>
          <th>المورد</th>
          <th>إجمالي المشتريات</th>
          <th>إجمالي المبيعات</th>
          <th>المتبقي</th>
          <th style="min-width:160px">نسبة التصريف</th>
          <th>التقييم</th>
          <th>عدد الأصناف</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// ── Detail Table per supplier ─────────────────────────────────
function buildDetailTable(row) {
  if (!row.prods.length) return `<div class="sp-detail-inner"><em>لا توجد أصناف</em></div>`;

  const items = row.prods.map(p => {
    const ind  = indicator(p.purchasedQty > 0 ? Math.round((p.soldQty / p.purchasedQty) * 100) : 0);
    const pct  = p.purchasedQty > 0 ? Math.round((p.soldQty / p.purchasedQty) * 100) : 0;
    return `
      <tr>
        <td>${p.sku ? `<small style="color:#64748b">${p.sku}</small> ` : ""}${p.name}</td>
        <td>${p.purchasedQty.toLocaleString("ar")}</td>
        <td>${p.soldQty.toLocaleString("ar")}</td>
        <td>${p.remaining.toLocaleString("ar")}</td>
        <td>${p.currentStock.toLocaleString("ar")}</td>
        <td>
          <span class="sp-badge ${ind.cls}">${ind.icon} ${pct}%</span>
        </td>
      </tr>
    `;
  }).join("");

  return `
    <div class="sp-detail-inner">
      <table class="sp-detail-table">
        <thead>
          <tr>
            <th>الصنف</th>
            <th>مشتريات</th>
            <th>مبيعات</th>
            <th>متبقي (محسوب)</th>
            <th>مخزون فعلي</th>
            <th>نسبة التصريف</th>
          </tr>
        </thead>
        <tbody>${items}</tbody>
      </table>
    </div>
  `;
}

// ── Event Listeners ───────────────────────────────────────────
function attachEventListeners() {
  // handled via global window functions below
}

// ── Global Handler: Run Report ─────────────────────────────────
window.runPerfReport = function() {
  _dateFrom    = document.getElementById("sp-date-from")?.value || "";
  _dateTo      = document.getElementById("sp-date-to")?.value   || "";
  _selSupplier = document.getElementById("sp-supplier")?.value  || "";
  buildReport();
  renderKPI();
  renderTable();
};

// ── Global Handler: Toggle Detail Row ─────────────────────────
window.togglePerfDetail = function(i) {
  const detailRow = document.getElementById(`detail-row-${i}`);
  const btn       = document.getElementById(`expand-${i}`);
  if (!detailRow) return;
  const isOpen = detailRow.style.display !== "none";
  detailRow.style.display = isOpen ? "none" : "table-row";
  if (btn) btn.classList.toggle("open", !isOpen);
};

// ── Global Handler: Export CSV ─────────────────────────────────
window.exportSupplierPerf = function() {
  if (!_reportData.length) { alert("شغّل التقرير أولاً"); return; }

  const BOM = "\uFEFF";
  const header = ["المورد","إجمالي المشتريات","إجمالي المبيعات","المتبقي","نسبة التصريف%","التقييم"].join(",");
  const rows = _reportData.map(r => {
    const ind = indicator(r.turnoverPct);
    return [
      `"${r.name}"`,
      r.totalPurchased,
      r.totalSold,
      r.totalRemaining,
      r.turnoverPct,
      `"${ind.label}"`,
    ].join(",");
  });

  const csv = BOM + [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `أداء-الموردين-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Run Report on first load ──────────────────────────────────
function runReport() {
  _dateFrom    = document.getElementById("sp-date-from")?.value || "";
  _dateTo      = document.getElementById("sp-date-to")?.value   || "";
  _selSupplier = "";
  buildReport();
  renderKPI();
  renderTable();
}