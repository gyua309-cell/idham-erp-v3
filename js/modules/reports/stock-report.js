// ============================================================
// IDHAM ERP — Stock Report Module
// ============================================================
import { COLS, getAll } from "../../utils/db.js";
import { query, where, orderBy, getDocs } from "../../utils/db.js";
import { formatQuantity, formatCurrency, getStockStatusBadge, todayString } from "../../utils/formatters.js";
export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar">
      <div class="filter-select-group"><label>المخزن</label>
        <select id="stock-wh" onchange="loadStockReport()"><option value="">الكل</option></select></div>
      <div class="filter-select-group"><label>الحالة</label>
        <select id="stock-status" onchange="loadStockReport()">
          <option value="">الكل</option><option value="out">نافد</option><option value="low">منخفض</option><option value="ok">متوفر</option>
        </select></div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="exportStockReport()">📤 CSV</button>
        <button class="btn btn-secondary btn-sm" onclick="loadStockReport()">🔄 تحديث</button>
      </div>
    </div>
    <div class="page-content">
      <div class="page-header"><h1 class="page-title">تقرير المخزون</h1><p class="page-subtitle" id="stock-count"></p></div>
      <div class="kpi-grid mb-20">
        <div class="kpi-card"><div class="status-bar indigo"></div><div class="kpi-icon indigo">📦</div><div class="kpi-content"><div class="kpi-label">إجمالي الأصناف</div><div class="kpi-value mono" id="sk-all">—</div></div></div>
        <div class="kpi-card"><div class="status-bar bad"></div><div class="kpi-icon bad">🔴</div><div class="kpi-content"><div class="kpi-label">نافد المخزون</div><div class="kpi-value mono" id="sk-out">—</div></div></div>
        <div class="kpi-card"><div class="status-bar warn"></div><div class="kpi-icon warn">🟡</div><div class="kpi-content"><div class="kpi-label">منخفض المخزون</div><div class="kpi-value mono" id="sk-low">—</div></div></div>
        <div class="kpi-card"><div class="status-bar lime"></div><div class="kpi-icon lime">💰</div><div class="kpi-content"><div class="kpi-label">قيمة المخزون</div><div class="kpi-value mono" id="sk-value">—</div></div></div>
      </div>
      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead><tr><th>الصنف</th><th>الكود</th><th>المخزن</th><th>الكمية</th><th>حد الطلب</th><th>سعر التكلفة</th><th>القيمة</th><th>الحالة</th></tr></thead>
            <tbody id="stock-tbody">${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}</tbody>
          </table>
        </div>
      </div>
    </div>`;
  await loadWarehousesForStock();
  await loadStockReport();
}
async function loadWarehousesForStock() {
  try {
    const whs = await getAll(COLS.warehouses(), [orderBy("name")]);
    const sel = document.getElementById("stock-wh");
    if (sel) whs.forEach(w => sel.innerHTML += `<option value="${w.id}">${w.name}</option>`);
  } catch {}
}
let stockData = [];
window.loadStockReport = async () => {
  const tbody = document.getElementById("stock-tbody");
  if (!tbody) return;
  tbody.innerHTML = `${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;
  try {
    const whId   = document.getElementById("stock-wh")?.value;
    const status = document.getElementById("stock-status")?.value;
    
    // جلب جميع السجلات دون فلاتر معقدة بقاعدة البيانات لتجنب الحاجة لفهارس مركبة (Composite Indexes)
    const q = query(COLS.stockByWarehouse());
    const snap = await getDocs(q);
    let allStock = snap.docs.map(d => d.data());
    
    // الفلترة برمجياً (Client-side)
    if (whId) {
      allStock = allStock.filter(s => s.warehouseId === whId);
    }
    if (status) {
      allStock = allStock.filter(s => s.stockStatus === status);
    }
    
    // الترتيب برمجياً حسب معرف المنتج
    allStock.sort((a, b) => (a.productId || "").localeCompare(b.productId || ""));
    stockData = allStock;
    // Get product info
    const products = await getAll(COLS.products(), [orderBy("name")]);
    const prodMap = {};
    products.forEach(p => prodMap[p.id] = p);
    // Get warehouse info
    const warehouses = await getAll(COLS.warehouses(), [orderBy("name")]);
    const whMap = {};
    warehouses.forEach(w => whMap[w.id] = w.name);
    // Enrich data
    stockData.forEach(s => {
      const prod = prodMap[s.productId] || {};
      s.productName = prod.name || prod.nameAr || prod.nameEn || s.productId;
      s.sku         = prod.sku  || "";
      s.warehouseName = whMap[s.warehouseId] || s.warehouseId;
      s.costPrice   = prod.costPrice || 0;
      s.value       = (s.qty || 0) * s.costPrice;
    });
    // KPIs
    const outCount  = stockData.filter(s => s.stockStatus === "out").length;
    const lowCount  = stockData.filter(s => s.stockStatus === "low").length;
    const totalValue = stockData.reduce((sum, s) => sum + s.value, 0);
    document.getElementById("sk-all").textContent   = stockData.length;
    document.getElementById("sk-out").textContent   = outCount;
    document.getElementById("sk-low").textContent   = lowCount;
    document.getElementById("sk-value").textContent = formatCurrency(totalValue);
    document.getElementById("stock-count").textContent = `${stockData.length} سجل`;
    if (!stockData.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد بيانات مخزون</td></tr>`;
      return;
    }
    tbody.innerHTML = stockData.map(s => `<tr class="status-${s.stockStatus === "out" ? "bad" : s.stockStatus === "low" ? "warn" : ""}">
      <td class="font-semibold font-heading">${s.productName}</td>
      <td class="mono dim" style="font-size:11px;">${s.sku}</td>
      <td class="dim">${s.warehouseName}</td>
      <td class="mono font-bold">${formatQuantity(s.qty)}</td>
      <td class="mono text-2">${s.reorderLevel || 0}</td>
      <td class="mono">${formatCurrency(s.costPrice)}</td>
      <td class="mono">${formatCurrency(s.value)}</td>
      <td>${getStockStatusBadge(s.qty, s.reorderLevel)}</td>
    </tr>`).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="alert bad">${err.message}</div></td></tr>`;
  }
};
window.exportStockReport = () => {
  const rows = [["الصنف","الكود","المخزن","الكمية","حد الطلب","سعر التكلفة","القيمة","الحالة"]];
  stockData.forEach(s => rows.push([s.productName,s.sku,s.warehouseName,s.qty,s.reorderLevel||0,s.costPrice,s.value,s.stockStatus]));
  const csv = rows.map(r=>r.map(v=>`"${v||""}"`).join(",")).join("\n");
  const a = document.createElement("a"); a.href=URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv"}));
  a.download=`stock_${todayString()}.csv`; a.click(); showToast("تم التصدير","success");
};
