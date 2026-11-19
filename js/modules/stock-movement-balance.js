// ══════════════════════════════════════════════════════════════════
// IDHAM ERP — STOCK MOVEMENT BALANCE SHEET & RECONCILIATION
// ══════════════════════════════════════════════════════════════════

import { getAll, COLS } from "../utils/db.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";

let allProducts = [];
let allStock = [];
let allSalesInvoices = [];
let allPurchaseInvoices = [];
let allStockTransfers = [];
let allStockTransactions = [];
let filteredProducts = [];

export async function render(container, user) {
  const root = container || document.getElementById("main-content");
  if (!root) return;

  root.innerHTML = `
    <div class="page-container" style="padding:20px 24px; animation: fadeIn 0.3s ease;">
      
      <!-- Top Title Strip -->
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg, #0EA5E9, #0284C7); display:flex; align-items:center; justify-content:center; color:#fff; font-size:22px; box-shadow:0 4px 12px rgba(14,165,233,0.25);">
            ⚖️
          </div>
          <div>
            <h2 style="font-size:20px; font-weight:900; margin:0; color:var(--text-0);">ميزان حركة المخزون الكمي والقيمي (Stock Balance Sheet)</h2>
            <p style="margin:2px 0 0; font-size:12.5px; color:var(--text-2);">رصيد أول المدة • الوارد والمشتريات • المنصرف والمبيعات • رصيد آخر المدة والتقييم الدفتري</p>
          </div>
        </div>

        <div style="display:flex; gap:10px;">
          <button class="btn btn-secondary btn-sm" onclick="window.print()">🖨️ طباعة الميزان</button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="kpi-grid mb-24" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:20px;">
        <div class="card" style="padding:16px; border-radius:12px; background:var(--bg-card); border:1px solid var(--border-soft);">
          <div style="font-size:11.5px; color:var(--text-2); font-weight:700; margin-bottom:4px;">📦 إجمالي القيمة الدفترية للمخزون</div>
          <div id="kpi-total-val" class="mono font-bold text-brand" style="font-size:20px;">0.00 ر.س</div>
        </div>
        <div class="card" style="padding:16px; border-radius:12px; background:var(--bg-card); border:1px solid var(--border-soft);">
          <div style="font-size:11.5px; color:var(--text-2); font-weight:700; margin-bottom:4px;">📥 إجمالي حركة الوارد (كميات)</div>
          <div id="kpi-in-qty" class="mono font-bold text-good" style="font-size:20px;">0</div>
        </div>
        <div class="card" style="padding:16px; border-radius:12px; background:var(--bg-card); border:1px solid var(--border-soft);">
          <div style="font-size:11.5px; color:var(--text-2); font-weight:700; margin-bottom:4px;">📤 إجمالي حركة المنصرف (كميات)</div>
          <div id="kpi-out-qty" class="mono font-bold text-bad" style="font-size:20px;">0</div>
        </div>
        <div class="card" style="padding:16px; border-radius:12px; background:var(--bg-card); border:1px solid var(--border-soft);">
          <div style="font-size:11.5px; color:var(--text-2); font-weight:700; margin-bottom:4px;">🏷️ إجمالي الأصناف النشطة</div>
          <div id="kpi-product-count" class="mono font-bold" style="font-size:20px; color:var(--text-0);">0</div>
        </div>
      </div>

      <!-- Controls & Search Strip -->
      <div class="card mb-16" style="padding:14px; border-radius:12px; background:var(--bg-card); border:1px solid var(--border-soft); display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
        <div style="flex:1; min-width:240px;">
          <input type="text" id="stock-search" class="form-control" placeholder="🔍 بحث باسم الصنف أو البار كود..." style="width:100%; border-radius:8px;" oninput="window._filterStockBalance()" />
        </div>
      </div>

      <!-- Balance Table -->
      <div class="card" style="padding:0; border-radius:14px; border:1px solid var(--border-soft); overflow:hidden; background:var(--bg-card);">
        <div class="table-container" style="max-height:600px; overflow-y:auto;">
          <table class="data-dense" style="margin:0; font-size:12px; width:100%;">
            <thead>
              <tr style="background:var(--bg-3); position:sticky; top:0; z-index:2;">
                <th style="padding:10px 14px;">اسم الصنف</th>
                <th style="width:90px;">الوحدة</th>
                <th style="width:90px; text-align:center;">رصيد أول</th>
                <th style="width:90px; text-align:center; color:#10B981;">الوارد (+)</th>
                <th style="width:90px; text-align:center; color:#EF4444;">المنصرف (-)</th>
                <th style="width:100px; text-align:center; color:var(--brand);">رصيد آخر</th>
                <th style="width:110px; text-align:left;">متوسط التكلفة</th>
                <th style="width:130px; text-align:left; color:var(--brand);">إجمالي القيمة الدفترية</th>
              </tr>
            </thead>
            <tbody id="stock-balance-tbody">
              <tr><td colspan="8" style="text-align:center; padding:35px; color:var(--text-2);">⏳ جارٍ احتساب وتوليد ميزان حركة المخزون…</td></tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  window._filterStockBalance = filterStockBalance;
  await loadMovementData();
}

async function loadMovementData() {
  try {
    const [pList, sList, salesList, purList, stList, txList] = await Promise.all([
      getAll(COLS.products ? COLS.products() : "products").catch(() => []),
      getAll(COLS.stockByWarehouse ? COLS.stockByWarehouse() : "stockByWarehouse").catch(() => []),
      getAll(COLS.salesInvoices ? COLS.salesInvoices() : "salesInvoices").catch(() => []),
      getAll(COLS.purchaseInvoices ? COLS.purchaseInvoices() : "purchaseInvoices").catch(() => []),
      getAll(COLS.stockTransfers ? COLS.stockTransfers() : "stockTransfers").catch(() => []),
      getAll(COLS.stockTransactions ? COLS.stockTransactions() : "stockTransactions").catch(() => [])
    ]);

    allProducts = pList;
    allStock = sList;
    allSalesInvoices = salesList;
    allPurchaseInvoices = purList;
    allStockTransfers = stList;
    allStockTransactions = txList;
    filteredProducts = [...allProducts];

    renderMovementTable();
  } catch (e) {
    console.error("loadMovementData error:", e);
  }
}

function filterStockBalance() {
  const query = (document.getElementById("stock-search")?.value || "").toLowerCase().trim();
  if (!query) {
    filteredProducts = [...allProducts];
  } else {
    filteredProducts = allProducts.filter(p => 
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.code && String(p.code).toLowerCase().includes(query)) ||
      (p.barcode && String(p.barcode).toLowerCase().includes(query))
    );
  }
  renderMovementTable();
}

function renderMovementTable() {
  const tbody = document.getElementById("stock-balance-tbody");
  if (!tbody) return;

  if (!filteredProducts.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-2);">لا توجد أصناف مطابقة للبحث</td></tr>`;
    return;
  }

  // Stock per product map
  const stockMap = {};
  allStock.forEach(s => {
    const pid = s.productId || s.id;
    if (!stockMap[pid]) stockMap[pid] = 0;
    stockMap[pid] += Number(s.quantity || s.qty || 0);
  });

  // Calculate Inward (+) and Outward (-) movements per product
  const inQtyMap = {};
  const outQtyMap = {};

  // 1. Sales Invoices (Outward -)
  allSalesInvoices.forEach(inv => {
    if (inv.status === 'cancelled') return;
    (inv.items || inv.lines || []).forEach(item => {
      const pid = item.productId || item.id;
      const qty = Number(item.quantity || item.qty || 0);
      if (pid && qty > 0) {
        outQtyMap[pid] = (outQtyMap[pid] || 0) + qty;
      }
    });
  });

  // 2. Purchase Invoices (Inward +)
  allPurchaseInvoices.forEach(inv => {
    if (inv.status === 'cancelled') return;
    (inv.items || inv.lines || []).forEach(item => {
      const pid = item.productId || item.id;
      const qty = Number(item.quantity || item.qty || 0);
      if (pid && qty > 0) {
        inQtyMap[pid] = (inQtyMap[pid] || 0) + qty;
      }
    });
  });

  // 3. Stock Transactions & Adjustments
  allStockTransactions.forEach(t => {
    const pid = t.productId;
    const qty = Number(t.quantity || t.qty || 0);
    if (!pid || qty === 0) return;
    if (t.type === 'in' || t.type === 'purchase') {
      inQtyMap[pid] = (inQtyMap[pid] || 0) + Math.abs(qty);
    } else if (t.type === 'out' || t.type === 'sale') {
      outQtyMap[pid] = (outQtyMap[pid] || 0) + Math.abs(qty);
    }
  });

  let grandTotalValue = 0;
  let grandInQty = 0;
  let grandOutQty = 0;

  const rowsHtml = filteredProducts.map(p => {
    const cost = Number(p.avgCostPrice || p.costPrice || p.purchasePrice || 0);
    const endQty = stockMap[p.id] !== undefined ? stockMap[p.id] : Number(p.currentStock || p.stock || 0);
    
    const inQty = inQtyMap[p.id] || 0;
    const outQty = outQtyMap[p.id] || 0;
    const openQty = Math.max(0, endQty - inQty + outQty);

    const totalVal = endQty * cost;

    grandTotalValue += totalVal;
    grandInQty += inQty;
    grandOutQty += outQty;

    return `
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:10px 14px; font-weight:700; color:var(--text-0);">${p.name || '—'}</td>
        <td style="color:var(--text-2);">${p.unit || 'حبة'}</td>
        <td style="text-align:center;" class="mono">${openQty}</td>
        <td style="text-align:center;" class="mono font-bold text-good">+${inQty}</td>
        <td style="text-align:center;" class="mono font-bold text-bad">-${outQty}</td>
        <td style="text-align:center;" class="mono font-bold text-brand">${endQty}</td>
        <td class="mono" dir="ltr">${formatCurrency(cost)}</td>
        <td class="mono font-bold text-brand" dir="ltr">${formatCurrency(totalVal)}</td>
      </tr>
    `;
  }).join("");

  tbody.innerHTML = rowsHtml;

  // Update KPI Summary Cards
  const totalValEl = document.getElementById("kpi-total-val");
  const inQtyEl = document.getElementById("kpi-in-qty");
  const outQtyEl = document.getElementById("kpi-out-qty");
  const prodCountEl = document.getElementById("kpi-product-count");

  if (totalValEl) totalValEl.innerText = formatCurrency(grandTotalValue);
  if (inQtyEl) inQtyEl.innerText = grandInQty.toLocaleString();
  if (outQtyEl) outQtyEl.innerText = grandOutQty.toLocaleString();
  if (prodCountEl) prodCountEl.innerText = filteredProducts.length.toLocaleString();
}
