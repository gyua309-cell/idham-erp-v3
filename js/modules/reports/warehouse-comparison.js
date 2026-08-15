// ============================================================
// IDHAM ERP — Warehouse Stock Comparison Report (Dynamic Columns)
// (تقرير مقارنة أرصدة المستودعات وسيارة مصطفى)
// ============================================================
import { COLS, getAll } from "../../utils/db.js";
import { query, getDocs, collection } from "../../utils/db.js";
import { formatCurrency, formatQuantity, todayString } from "../../utils/formatters.js";
import { db, COMPANY_ID } from "../../firebase-config.js";

let comparisonData = [];
let activeWarehouses = [];

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar no-print flex flex-wrap gap-12 items-center" style="padding:14px 20px; background:var(--bg-1); border-bottom:1px solid var(--border-soft);">
      <!-- Quick Search -->
      <div style="min-width:260px;">
        <label style="font-size:11px; font-weight:bold; color:var(--text-2); margin-bottom:4px; display:block;">بحث عن صنف</label>
        <input type="text" id="wc-search" class="form-control" placeholder="🔍 ابحث باسم الصنف أو الكود..." oninput="filterWarehouseComparison()" />
      </div>

      <!-- Hide Zero Stock Toggle -->
      <div style="display:flex; align-items:center; gap:6px; margin-top:16px;">
        <input type="checkbox" id="wc-hide-zero" onchange="filterWarehouseComparison()" checked />
        <label for="wc-hide-zero" style="font-size:12px; cursor:pointer;">إخفاء الأصناف غير المتوفرة (رصيد صفر)</label>
      </div>

      <!-- Export & Actions -->
      <div style="margin-right:auto; display:flex; gap:8px; align-items:flex-end;">
        <button class="btn btn-secondary btn-sm" onclick="exportWarehouseComparisonExcel()" title="تصدير إكسل">📊 تصدير إكسل</button>
        <button class="btn btn-secondary btn-sm" onclick="window.print()" title="طباعة">🖨️ طباعة</button>
        <button class="btn btn-primary btn-sm" onclick="loadWarehouseComparison()" title="تحديث البيانات">🔄 تحديث البيانات</button>
      </div>
    </div>

    <div class="page-content" style="padding:20px;">
      <!-- Dynamic KPI Banner Container -->
      <div class="grid-4 gap-16 mb-20" id="wc-kpi-banner">
        <div class="card" style="padding:16px;"><div class="sk" style="height:40px;"></div></div>
        <div class="card" style="padding:16px;"><div class="sk" style="height:40px;"></div></div>
        <div class="card" style="padding:16px;"><div class="sk" style="height:40px;"></div></div>
        <div class="card" style="padding:16px;"><div class="sk" style="height:40px;"></div></div>
      </div>

      <!-- Main Data Table Card -->
      <div class="card">
        <div class="card-header flex justify-between items-center" style="padding:16px 20px; border-bottom:1px solid var(--border-soft);">
          <div>
            <h2 style="font-family:var(--font-heading); font-size:16px; margin:0;">تقرير مقارنة أرصدة المستودعات والسيارات التفصيلي</h2>
            <div class="text-dim" style="font-size:12px; margin-top:2px;">مقارنة أرصدة كل صنف بالمستودع الرئيسي وسيارة مصطفى وسائر المستودعات لحظياً</div>
          </div>
          <div class="badge badge-info" id="wc-displayed-count" style="font-size:12px; padding:4px 10px;">0 صنف</div>
        </div>

        <div class="table-container">
          <table class="data-dense" id="wc-table" style="width:100%; border-collapse:collapse;">
            <thead id="wc-thead">
              <tr style="background:var(--bg-2); text-align:right;">
                <th style="padding:10px 14px;">كود الصنف (SKU)</th>
                <th style="padding:10px 14px;">اسم الصنف</th>
                <th style="padding:10px 14px;">التصنيف</th>
                <th style="padding:10px 14px;">الوحدة</th>
                <th style="padding:10px 14px; text-align:center;">المستودع الرئيسي</th>
                <th style="padding:10px 14px; text-align:center;">سيارة مصطفى</th>
                <th style="padding:10px 14px; text-align:center;">إجمالي الرصيد</th>
                <th style="padding:10px 14px; text-align:left;">متوسط التكلفة</th>
                <th style="padding:10px 14px; text-align:left;">القيمة التراكمية</th>
                <th style="padding:10px 14px; text-align:center;">الحالة</th>
              </tr>
            </thead>
            <tbody id="wc-tbody">
              ${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(10).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:14px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
            <tfoot id="wc-tfoot" style="background:var(--bg-2); font-weight:bold; border-top:2px solid var(--border-soft);">
            </tfoot>
          </table>
        </div>
      </div>
    </div>`;

  window.loadWarehouseComparison = loadWarehouseComparison;
  window.filterWarehouseComparison = filterWarehouseComparison;
  window.exportWarehouseComparisonExcel = exportWarehouseComparisonExcel;

  await loadWarehouseComparison();
}

async function loadWarehouseComparison() {
  try {
    const [prodSnap, whSnap, stockSnap] = await Promise.all([
      getDocs(collection(db, `companies/${COMPANY_ID}/products`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/warehouses`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/stockByWarehouse`))
    ]);

    const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const warehouses = whSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const stockDocs = stockSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Sort warehouses: Main warehouse first (W5uANJjMgfFh2p3xU4bT), Mustafa car second (Zyltw7uwvd0aKejdeqQq), others after
    activeWarehouses = warehouses.sort((a, b) => {
      if (a.id === "W5uANJjMgfFh2p3xU4bT") return -1;
      if (b.id === "W5uANJjMgfFh2p3xU4bT") return 1;
      if (a.id === "Zyltw7uwvd0aKejdeqQq") return -1;
      if (b.id === "Zyltw7uwvd0aKejdeqQq") return 1;
      const nameA = a.name || "";
      const nameB = b.name || "";
      if (nameA.indexOf("رئيس") !== -1) return -1;
      if (nameB.indexOf("رئيس") !== -1) return 1;
      return 0;
    });

    comparisonData = products.map(p => {
      const pId = p.id;
      const whQuantities = {};
      let totalQty = 0;

      activeWarehouses.forEach(wh => {
        const matchingDocs = stockDocs.filter(s => 
          (s.warehouseId === wh.id || s.warehouseId == wh.id) &&
          (s.productId === pId || s.productId == pId)
        );
        const q = matchingDocs.reduce((sum, s) => sum + parseFloat(s.qty || 0), 0);
        whQuantities[wh.id] = Math.round(q * 100) / 100;
        totalQty += q;
      });

      totalQty = Math.round(totalQty * 100) / 100;
      const unitCost = parseFloat(p.averageCost || p.costPrice || p.purchasePrice || 0);
      const totalValuation = Math.round((totalQty * unitCost) * 100) / 100;

      return {
        id: pId,
        sku: p.sku || "-",
        name: p.name || "صنف بدون اسم",
        categoryName: p.categoryName || p.category || "عام",
        unit: p.unit || "حبة",
        whQuantities,
        totalQty,
        unitCost,
        totalValuation
      };
    });

    filterWarehouseComparison();
  } catch (err) {
    console.error("Failed to load warehouse comparison:", err);
    window.showToast?.("خطأ في تحميل بيانات التقرير: " + err.message, "error");
  }
}

function filterWarehouseComparison() {
  const search = (document.getElementById("wc-search")?.value || "").trim().toLowerCase();
  const hideZero = document.getElementById("wc-hide-zero")?.checked ?? true;

  const filtered = comparisonData.filter(item => {
    if (search) {
      const matchName = item.name.toLowerCase().includes(search);
      const matchSku = item.sku.toLowerCase().includes(search);
      if (!matchName && !matchSku) return false;
    }

    if (hideZero && item.totalQty <= 0) return false;

    return true;
  });

  renderComparisonTable(filtered);
}

function renderComparisonTable(items) {
  const thead = document.getElementById("wc-thead");
  const tbody = document.getElementById("wc-tbody");
  const tfoot = document.getElementById("wc-tfoot");
  const countBadge = document.getElementById("wc-displayed-count");

  const whTotals = {};
  activeWarehouses.forEach(w => whTotals[w.id] = 0);
  let grandTotalQty = 0;
  let grandTotalValuation = 0;

  comparisonData.forEach(d => {
    activeWarehouses.forEach(w => {
      whTotals[w.id] += (d.whQuantities[w.id] || 0);
    });
    grandTotalQty += d.totalQty;
    grandTotalValuation += d.totalValuation;
  });

  if (countBadge) countBadge.textContent = `${items.length} صنف`;

  // Render KPI Banner
  const kpiBanner = document.getElementById("wc-kpi-banner");
  if (kpiBanner) {
    const kpiCardsHtml = activeWarehouses.map((wh, idx) => {
      const colors = ["--indigo", "--warn", "--accent", "--good"];
      const borderCol = colors[idx % colors.length];
      const qty = whTotals[wh.id] || 0;
      const typesCount = comparisonData.filter(d => (d.whQuantities[wh.id] || 0) > 0).length;

      return `
        <div class="card" style="padding:16px; border-right:4px solid var(${borderCol});">
          <div class="text-2 mb-4" style="font-size:12px;">كميات ${wh.name}</div>
          <div class="mono font-bold" style="font-size:22px; color:var(${borderCol});">${formatQuantity(qty)}</div>
          <div class="text-dim" style="font-size:11px; margin-top:4px;">${typesCount} صنف متوفر</div>
        </div>`;
    }).join("") + `
      <div class="card" style="padding:16px; border-right:4px solid var(--good);">
        <div class="text-2 mb-4" style="font-size:12px;">إجمالي المخزون الشامل</div>
        <div class="mono font-bold text-good" style="font-size:22px;">${formatQuantity(grandTotalQty)}</div>
        <div class="text-dim" style="font-size:11px; margin-top:4px;">تقييم: ${formatCurrency(grandTotalValuation)}</div>
      </div>`;

    kpiBanner.innerHTML = kpiCardsHtml;
  }

  // Dynamic Table Headers
  const whHeadersHtml = activeWarehouses.map((wh, idx) => {
    const bgStyles = [
      "background:rgba(91,127,255,0.08); color:var(--indigo);",
      "background:rgba(245,158,11,0.08); color:var(--warn-dark);",
      "background:rgba(16,185,129,0.08); color:var(--good-dark);"
    ];
    const style = bgStyles[idx % bgStyles.length];
    return `<th style="padding:10px 14px; text-align:center; ${style}">${wh.name}</th>`;
  }).join("");

  thead.innerHTML = `
    <tr style="background:var(--bg-2); text-align:right;">
      <th style="padding:10px 14px;">كود الصنف (SKU)</th>
      <th style="padding:10px 14px;">اسم الصنف</th>
      <th style="padding:10px 14px;">التصنيف</th>
      <th style="padding:10px 14px;">الوحدة</th>
      ${whHeadersHtml}
      <th style="padding:10px 14px; text-align:center; background:rgba(16,185,129,0.12); color:var(--good-dark);">إجمالي الرصيد</th>
      <th style="padding:10px 14px; text-align:left;">متوسط التكلفة</th>
      <th style="padding:10px 14px; text-align:left;">القيمة التراكمية</th>
      <th style="padding:10px 14px; text-align:center;">الحالة</th>
    </tr>`;

  if (!items || items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${5 + activeWarehouses.length + 3}" style="text-align:center; padding:30px; color:var(--text-2);">
          لا توجد أصناف مطابقة لخيارات الفلترة أو البحث.
        </td>
      </tr>`;
    return;
  }

  const tableWhTotals = {};
  activeWarehouses.forEach(w => tableWhTotals[w.id] = 0);
  let tableSumTotal = 0;
  let tableSumValuation = 0;

  tbody.innerHTML = items.map(item => {
    activeWarehouses.forEach(w => {
      tableWhTotals[w.id] += (item.whQuantities[w.id] || 0);
    });
    tableSumTotal += item.totalQty;
    tableSumValuation += item.totalValuation;

    let statusBadge = "";
    if (item.totalQty > 0) statusBadge = `<span class="badge badge-success">متوفر</span>`;
    else statusBadge = `<span class="badge badge-danger">غير متوفر</span>`;

    const whCellsHtml = activeWarehouses.map((w, idx) => {
      const qty = item.whQuantities[w.id] || 0;
      const textCol = idx === 0 ? "text-indigo" : idx === 1 ? "text-warn" : "";
      return `<td style="padding:10px 14px; text-align:center;" class="mono font-bold ${textCol}">${formatQuantity(qty)}</td>`;
    }).join("");

    return `
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:10px 14px;" class="mono">${item.sku}</td>
        <td style="padding:10px 14px; font-weight:bold;">${item.name}</td>
        <td style="padding:10px 14px; color:var(--text-2); font-size:12px;">${item.categoryName}</td>
        <td style="padding:10px 14px; color:var(--text-2); font-size:12px;">${item.unit}</td>
        ${whCellsHtml}
        <td style="padding:10px 14px; text-align:center; background:rgba(16,185,129,0.04);" class="mono font-bold text-good">${formatQuantity(item.totalQty)}</td>
        <td style="padding:10px 14px; text-align:left;" class="mono">${formatCurrency(item.unitCost)}</td>
        <td style="padding:10px 14px; text-align:left; font-weight:bold;" class="mono">${formatCurrency(item.totalValuation)}</td>
        <td style="padding:10px 14px; text-align:center;">${statusBadge}</td>
      </tr>`;
  }).join("");

  // Footer Row
  const whFootHtml = activeWarehouses.map(w => {
    return `<td style="padding:12px 14px; text-align:center;" class="mono">${formatQuantity(tableWhTotals[w.id] || 0)}</td>`;
  }).join("");

  tfoot.innerHTML = `
    <tr>
      <td colspan="4" style="padding:12px 14px;">الإجمالي الشامل لمخزون الأصناف المعروضة</td>
      ${whFootHtml}
      <td style="padding:12px 14px; text-align:center;" class="mono text-good">${formatQuantity(tableSumTotal)}</td>
      <td></td>
      <td style="padding:12px 14px; text-align:left;" class="mono">${formatCurrency(tableSumValuation)}</td>
      <td></td>
    </tr>`;
}

function exportWarehouseComparisonExcel() {
  if (!comparisonData || comparisonData.length === 0) {
    window.showToast?.("لا توجد بيانات للتصدير", "warn");
    return;
  }

  try {
    const rows = comparisonData.map(item => {
      const rowObj = {
        "كود الصنف (SKU)": item.sku,
        "اسم الصنف": item.name,
        "التصنيف": item.categoryName,
        "الوحدة": item.unit,
      };

      activeWarehouses.forEach(w => {
        rowObj[`رصيد ${w.name}`] = item.whQuantities[w.id] || 0;
      });

      rowObj["إجمالي رصيد الكيان"] = item.totalQty;
      rowObj["متوسط التكلفة"] = item.unitCost;
      rowObj["القيمة التراكمية"] = item.totalValuation;

      return rowObj;
    });

    if (window.XLSX) {
      const ws = window.XLSX.utils.json_to_sheet(rows);
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, "مقارنة أرصدة المستودعات");
      window.XLSX.writeFile(wb, `تقرير_مقارنة_أرصدة_المستودعات_${todayString()}.xlsx`);
      window.showToast?.("تم تصدير ملف الإكسل بنجاح ✅", "success");
    } else {
      window.showToast?.("مكتبة Excel غير مثبتة", "error");
    }
  } catch (err) {
    window.showToast?.("خطأ أثناء التصدير: " + err.message, "error");
  }
}
