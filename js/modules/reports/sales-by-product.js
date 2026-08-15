// ============================================================
// IDHAM ERP — Sales by Product Report
// ============================================================
import { COLS, getAll } from "../../utils/db.js";
import { query, where, orderBy, limit, getDocs } from "../../utils/db.js";
import { formatCurrency, formatQuantity, formatPercent, startOfMonth, todayString } from "../../utils/formatters.js";

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar">
      <div class="date-range-group"><label>من</label>
        <input type="date" id="rsp-from" value="${startOfMonth()}" onchange="loadSalesByProduct()" /></div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="rsp-to" value="${todayString()}" onchange="loadSalesByProduct()" /></div>
      <div class="quick-filters">
        <button class="quick-filter-btn" onclick="rspRange('today')">اليوم</button>
        <button class="quick-filter-btn active" onclick="rspRange('month')">هذا الشهر</button>
        <button class="quick-filter-btn" onclick="rspRange('last_month')">الشهر الماضي</button>
      </div>
      <div class="filterbar-divider"></div>
      <div class="filter-select-group"><label>المخزن</label>
        <select id="rsp-warehouse" onchange="loadSalesByProduct()">
          <option value="">الكل</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <div class="view-toggle">
          <button class="toggle-btn active" onclick="rspSetView('table',this)">📋 جدول</button>
          <button class="toggle-btn" onclick="rspSetView('chart',this)">📊 رسم</button>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="exportSalesByProduct()">📤 CSV</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">مبيعات حسب الصنف</h1>
        <p class="page-subtitle" id="rsp-period"></p>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid mb-20">
        <div class="kpi-card"><div class="status-bar indigo"></div>
          <div class="kpi-icon indigo">📦</div>
          <div class="kpi-content"><div class="kpi-label">إجمالي الإيراد</div>
            <div class="kpi-value mono" id="rsp-total-rev">—</div></div></div>
        <div class="kpi-card"><div class="status-bar lime"></div>
          <div class="kpi-icon lime">📈</div>
          <div class="kpi-content"><div class="kpi-label">إجمالي الربح</div>
            <div class="kpi-value mono" id="rsp-total-profit">—</div></div></div>
        <div class="kpi-card"><div class="status-bar good"></div>
          <div class="kpi-icon good">🏆</div>
          <div class="kpi-content"><div class="kpi-label">أكثر صنف مبيعاً</div>
            <div class="kpi-value" id="rsp-top-product" style="font-size:14px;">—</div></div></div>
        <div class="kpi-card"><div class="status-bar warn"></div>
          <div class="kpi-icon warn">📊</div>
          <div class="kpi-content"><div class="kpi-label">عدد الأصناف المبيعة</div>
            <div class="kpi-value mono" id="rsp-product-count">—</div></div></div>
      </div>

      <div id="rsp-view-table" class="card">
        <div class="table-container">
          <table class="data-dense" id="rsp-table">
            <thead><tr>
              <th>#</th>
              <th onclick="rspSort('productName')">اسم الصنف ↕</th>
              <th onclick="rspSort('totalQty')">إجمالي الكمية ↕</th>
              <th onclick="rspSort('totalRevenue')">الإيراد ↕</th>
              <th onclick="rspSort('totalCost')">التكلفة ↕</th>
              <th onclick="rspSort('profit')">الربح ↕</th>
              <th onclick="rspSort('margin')">هامش الربح ↕</th>
              <th>حصة من المبيعات</th>
            </tr></thead>
            <tbody id="rsp-tbody">
              ${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div id="rsp-view-chart" class="card hidden">
        <div class="card-header"><h3 style="font-family:var(--font-heading);">مقارنة المبيعات والربح</h3></div>
        <div class="card-body"><div class="chart-container" style="height:360px;"><canvas id="rsp-chart"></canvas></div></div>
      </div>
    </div>`;

  await loadWarehousesFilter("rsp-warehouse");
  await loadSalesByProduct();
}

async function loadWarehousesFilter(selId) {
  try {
    const { getAll } = await import("../../utils/db.js");
    const whs = await getAll(COLS.warehouses(), [orderBy("name")]);
    const sel = document.getElementById(selId);
    if (sel) whs.forEach(w => sel.innerHTML += `<option value="${w.id}">${w.name}</option>`);
  } catch {}
}

let rspData = [];
let rspSortField = "totalRevenue";
let rspSortDir   = "desc";

window.loadSalesByProduct = async () => {
  const tbody  = document.getElementById("rsp-tbody");
  const from   = document.getElementById("rsp-from")?.value;
  const to     = document.getElementById("rsp-to")?.value;
  const whId   = document.getElementById("rsp-warehouse")?.value;

  document.getElementById("rsp-period").textContent = `الفترة: ${from} — ${to}`;
  if (tbody) tbody.innerHTML = `${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;

  try {
    const [snap, prods] = await Promise.all([
      getDocs(query(COLS.salesInvoices(), limit(2000))),
      getAll(COLS.products())
    ]);

    const prodMap = {};
    prods.forEach(p => {
      prodMap[p.id] = p;
      if (p.name) prodMap[p.name.trim()] = p;
    });

    let invoices = snap.docs.map(d => d.data()).filter(inv => {
      const d = inv.createdAt?.toDate ? inv.createdAt.toDate().toISOString().split("T")[0] : inv.date || "";
      return d >= from && d <= to && inv.status !== "cancelled";
    });

    if (whId) invoices = invoices.filter(inv => inv.warehouseId === whId);

    // Aggregate by product
    const productMap = {};
    invoices.forEach(inv => {
      (inv.lines || []).forEach(line => {
        const pid = line.productId || line.productName;
        if (!productMap[pid]) {
          productMap[pid] = { productId: pid, productName: line.productName, totalQty: 0, totalRevenue: 0, totalCost: 0 };
        }
        const lineRev = line.qty * line.unitPrice * (1 - (line.discount || 0) / 100);
        
        // Resolve cost price from line or catalog
        const pName = line.productName || line.name || "";
        const prod = prodMap[line.productId] || prodMap[pName.trim()];
        const masterCostPrice = prod ? (prod.costPrice || prod.purchasePrice || 0) : 0;
        const finalCostPrice = line.costPrice || masterCostPrice || line.unitPrice * 0.7;

        const lineCost = line.qty * finalCostPrice;
        productMap[pid].totalQty     += line.qty || 0;
        productMap[pid].totalRevenue += lineRev;
        productMap[pid].totalCost    += lineCost;
      });
    });

    rspData = Object.values(productMap).map(p => ({
      ...p,
      profit: p.totalRevenue - p.totalCost,
      margin: p.totalRevenue > 0 ? ((p.totalRevenue - p.totalCost) / p.totalRevenue) * 100 : 0,
    }));

    renderRspTable();
    updateRspKPIs();
    renderRspChart();
  } catch (err) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="8"><div class="alert bad" style="margin:8px;">${err.message}</div></td></tr>`;
  }
};

function renderRspTable() {
  const tbody = document.getElementById("rsp-tbody");
  if (!tbody) return;

  const sorted = [...rspData].sort((a, b) => {
    const aVal = a[rspSortField]; const bVal = b[rspSortField];
    return rspSortDir === "desc" ? bVal - aVal : aVal - bVal;
  });

  const maxRev = sorted[0]?.totalRevenue || 1;
  const totalRev = sorted.reduce((s, p) => s + p.totalRevenue, 0);

  if (sorted.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد بيانات</td></tr>`;
    return;
  }

  tbody.innerHTML = sorted.map((p, i) => {
    const share = totalRev > 0 ? (p.totalRevenue / totalRev) * 100 : 0;
    const marginColor = p.margin >= 20 ? "good" : p.margin >= 10 ? "warn" : "bad";
    return `<tr>
      <td class="text-2">${i + 1}</td>
      <td class="font-heading font-semibold">${p.productName}</td>
      <td class="mono">${formatQuantity(p.totalQty)}</td>
      <td class="mono">${formatCurrency(p.totalRevenue)}</td>
      <td class="mono text-1">${formatCurrency(p.totalCost)}</td>
      <td class="mono ${p.profit >= 0 ? "text-good" : "text-bad"}">${formatCurrency(p.profit)}</td>
      <td><span class="badge ${marginColor}" style="font-size:11px;">${formatPercent(p.margin)}</span></td>
      <td style="min-width:120px;">
        <div class="flex items-center gap-6">
          <div class="progress-bar" style="flex:1;">
            <div class="fill indigo" style="width:${share}%;"></div>
          </div>
          <span class="mono text-2" style="font-size:10px;width:32px;">${share.toFixed(1)}%</span>
        </div>
      </td>
    </tr>`;
  }).join("");
}

function updateRspKPIs() {
  const totalRev    = rspData.reduce((s, p) => s + p.totalRevenue, 0);
  const totalProfit = rspData.reduce((s, p) => s + p.profit, 0);
  const topProduct  = rspData.sort((a, b) => b.totalRevenue - a.totalRevenue)[0];

  document.getElementById("rsp-total-rev").textContent    = formatCurrency(totalRev);
  document.getElementById("rsp-total-profit").textContent = formatCurrency(totalProfit);
  document.getElementById("rsp-top-product").textContent  = topProduct?.productName || "—";
  document.getElementById("rsp-product-count").textContent = rspData.length.toLocaleString("ar");
}

function renderRspChart() {
  const canvas = document.getElementById("rsp-chart");
  if (!canvas || !window.Chart) return;
  if (canvas._c) canvas._c.destroy();

  const top10 = [...rspData].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10);

  canvas._c = new Chart(canvas, {
    type: "bar",
    data: {
      labels: top10.map(p => p.productName.substring(0, 20)),
      datasets: [
        { label: "الإيراد", data: top10.map(p => p.totalRevenue), backgroundColor: "rgba(91,127,255,0.7)", borderRadius: 4 },
        { label: "الربح",   data: top10.map(p => p.profit), backgroundColor: "rgba(183,211,61,0.7)", borderRadius: 4 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#9CA3BD" } } },
      scales: {
        x: { ticks: { color: "#606A8C", font: { size: 11 } }, grid: { color: "#232A42" } },
        y: { ticks: { color: "#606A8C", callback: v => formatCurrency(v, true) }, grid: { color: "#232A42" } }
      }
    }
  });
}

window.rspSort = (field) => {
  rspSortDir = (rspSortField === field && rspSortDir === "desc") ? "asc" : "desc";
  rspSortField = field;
  renderRspTable();
};

window.rspSetView = (view, btn) => {
  document.querySelectorAll(".toggle-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("rsp-view-table").classList.toggle("hidden", view !== "table");
  document.getElementById("rsp-view-chart").classList.toggle("hidden", view !== "chart");
};

window.rspRange = (range) => {
  const today = todayString();
  document.querySelectorAll(".quick-filter-btn").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
  if (range === "today") {
    document.getElementById("rsp-from").value = today;
    document.getElementById("rsp-to").value = today;
  } else if (range === "month") {
    document.getElementById("rsp-from").value = startOfMonth();
    document.getElementById("rsp-to").value = today;
  } else if (range === "last_month") {
    const d = new Date();
    const s = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    const e = new Date(d.getFullYear(), d.getMonth(), 0);
    document.getElementById("rsp-from").value = s.toISOString().split("T")[0];
    document.getElementById("rsp-to").value = e.toISOString().split("T")[0];
  }
  loadSalesByProduct();
};

window.exportSalesByProduct = () => {
  const rows = [["الصنف","الكمية","الإيراد","التكلفة","الربح","الهامش"]];
  rspData.sort((a,b) => b.totalRevenue - a.totalRevenue).forEach(p => {
    rows.push([p.productName, p.totalQty, p.totalRevenue.toFixed(2), p.totalCost.toFixed(2), p.profit.toFixed(2), p.margin.toFixed(1)+"%"]);
  });
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["\uFEFF"+csv], { type: "text/csv" }));
  a.download = `sales_by_product_${todayString()}.csv`;
  a.click();
  showToast("تم التصدير", "success");
};
