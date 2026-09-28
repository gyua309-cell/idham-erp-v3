// ============================================================
// IDHAM ERP — Enterprise Products & Item Catalog
// SAP Business One / NetSuite Level Inventory Control
// ============================================================

import { COLS, create, update, remove, getAll, getPaginated, getStockForProduct } from "../utils/db.js";
import { query, where, orderBy, limit, getDocs, doc, getDoc, serverTimestamp } from "../utils/db.js";
import { formatCurrency, formatQuantity, getStockStatus, getStockStatusBadge, debounce, generateSearchTokens } from "../utils/formatters.js";
import { db, COMPANY_ID } from "../firebase-config.js";
import { exportToExcel, importFromExcel, pickExcelFile, downloadTemplate } from "../utils/excel.js";
import { syncProductCostsFromPurchaseInvoices } from "../utils/product-cost-sync.js";

let allProducts = [];
let currentPage = 0;
const PAGE_SIZE = 50;
let lastDocSnapshot = null;
let hasMore = false;
let filterCategory = "";
let filterStatus = "";
let warehouses = [];
let categories = [];

let sortFieldProd = "sku"; // Default sort by SKU
let sortAscProd = true;   // Default ascending

window.sortProdList = (field) => {
  if (sortFieldProd === field) {
    sortAscProd = !sortAscProd;
  } else {
    sortFieldProd = field;
    sortAscProd = (field === "sku" || field === "name" || field === "category") ? true : false;
  }
  loadProducts();
};

function getSortArrowProd(field) {
  if (sortFieldProd !== field) return `<span style="color:var(--text-3); font-size:10px; margin-right:4px;">⇅</span>`;
  return sortAscProd 
    ? `<span style="color:var(--brand); font-size:10px; margin-right:4px;">▲</span>` 
    : `<span style="color:var(--brand); font-size:10px; margin-right:4px;">▼</span>`;
}
window.getSortArrowProd = getSortArrowProd;

let cachedKPIs = null;
let pricingSettings = null;

async function getPricingSettings() {
  if (pricingSettings) return pricingSettings;
  try {
    const sysSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "system"));
    if (sysSnap.exists()) {
      pricingSettings = sysSnap.data();
    }
  } catch (e) {
    console.error("Failed to load pricing settings:", e);
  }
  return pricingSettings || {};
}

function renderProductRowsHtml(docs) {
  if (docs.length === 0) {
    return `<tr><td colspan="14" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد أصناف مطابقة</td></tr>`;
  }
  return docs.map(p => {
    // Use _totalQty (from stockByWarehouse collection) as source of truth — even when 0
    const totalQty = Math.max(0,
      (p._totalQty !== undefined && p._totalQty !== null) ? p._totalQty :
      (p.totalQty !== undefined ? p.totalQty : (p.stockQty !== undefined ? p.stockQty : 0))
    );
    const status = getStockStatus(totalQty, p.reorderLevel || 0);
    const costVal     = p.costPrice || p.purchasePrice || 0;
    const avgCostVal  = p.avgCostPrice || p.averageCost || costVal;   // المتوسط المرجح من الفواتير
    const lastPurVal  = p.lastPurchasePrice || (p.lastPurchasePrice === 0 ? 0 : (p.avgCostPrice || (costVal > 0 ? costVal : null))); // آخر سعر شراء
    const saleVal = p.sellingPrice || p.salePrice || p.priceRetail || p.price || 0;
    // الهامش يُحسب من آخر سعر شراء كأولوية لحماية الأرباح من التآكل
    const effectiveCost = (lastPurVal && lastPurVal > 0) ? lastPurVal : (avgCostVal || costVal);
    const margin = saleVal > 0 ? ((saleVal - effectiveCost) / saleVal) * 100 : 0;
    
    let marginClass = "low";
    let marginText = `${margin.toFixed(1)}%`;
    if (margin >= 20) {
      marginClass = "high";
    } else if (margin >= 10) {
      marginClass = "medium";
    } else {
      marginClass = "low";
      if (margin <= 0) marginText = `⚠️ ${margin.toFixed(1)}%`;
      else marginText = `${margin.toFixed(1)}%`;
    }

    const skuCode = p.sku || p.code || "—";

    return `
      <tr class="status-${status.color}">
        <td class="mono font-bold" style="cursor:pointer; color:var(--brand);" onclick="viewStock('${p.id}')" title="كشف حركة الصنف">${skuCode}</td>
        <td style="cursor:pointer;" onclick="viewStock('${p.id}')" title="كشف حركة الصنف">
          <strong>${p.name || p.nameAr}</strong>
          ${p.nameEn ? `<div class="dim" style="font-size:10px;">${p.nameEn}</div>` : ""}
          ${p.barcode ? `<div class="mono dim" style="font-size:10px;">Barcode: ${p.barcode}</div>` : ""}
        </td>
        <td>
          ${p.tracking === 'batch' ? '<span class="badge warn" style="font-size:10px;">التشغيلة</span>' : 
            p.tracking === 'serial' ? '<span class="badge info" style="font-size:10px;">تسلسلي</span>' : 
            '<span class="badge neutral" style="font-size:10px;">عام</span>'}
        </td>
        <td class="dim">${p.categoryName || "—"}</td>
        <td>${translateUnit(p.unit || "Piece")}${p.altUnit ? ` (${translateUnit(p.altUnit)}: ${p.unitFactor} ${translateUnit(p.unit || "Piece")})` : ""}</td>
        
        <td class="mono price-editable" style="text-align:left; color:var(--text-2);" title="سعر التكلفة اليدوي — انقر مرتين للتعديل"
            ondblclick="inlineEditPrice(this, '${p.id}', 'costPrice', ${costVal})">
          ${costVal > 0 ? formatCurrency(costVal) : '<span class="dim">—</span>'}
        </td>

        <td class="mono font-bold" style="text-align:left;"
            title="المتوسط المرجح المحسوب تلقائياً من فواتير الشراء">
          ${p.avgCostPrice !== undefined && p.avgCostPrice !== null && p.avgCostPrice > 0
            ? `<span style="color:var(--brand);">${formatCurrency(p.avgCostPrice)}</span>`
            : (costVal > 0 ? `<span class="dim" style="font-size:11px;" title="التكلفة اليدوية">${formatCurrency(costVal)}</span>` : `<span class="dim" style="font-size:11px;">—</span>`)}
        </td>

        <td class="mono font-bold" style="text-align:left;"
            title="${p.lastPurchaseDate ? 'تاريخ آخر شراء: ' + p.lastPurchaseDate + (p.lastSupplierName ? ' | المورد: ' + p.lastSupplierName : '') : (p.lastPurchasePrice ? 'آخر سعر شراء مسجل' : 'التكلفة المسجلة')}">
          ${p.lastPurchasePrice !== undefined && p.lastPurchasePrice !== null && p.lastPurchasePrice > 0
            ? `<span style="color:#059669; background:rgba(16,185,129,0.1); padding:2px 6px; border-radius:4px; border:1px solid rgba(16,185,129,0.25); display:inline-block;">${formatCurrency(p.lastPurchasePrice)}</span>${p.lastPurchaseDate ? `<div class="dim" style="font-size:10px; margin-top:2px;">${p.lastPurchaseDate}</div>` : ''}`
            : (lastPurVal !== null && lastPurVal > 0
                ? `<span style="color:var(--text-1);">${formatCurrency(lastPurVal)}</span>`
                : (costVal > 0 ? `<span class="dim" style="font-size:11px;">${formatCurrency(costVal)}</span>` : `<span class="dim" style="font-size:11px;">—</span>`))}
        </td>
        
        <td class="mono font-bold price-editable" style="text-align:left;" title="انقر مرتين للتعديل السريع"
            ondblclick="inlineEditPrice(this, '${p.id}', 'salePrice', ${saleVal})">
          <span class="profit-dot ${marginClass}" title="هامش الربح الفعلي: ${margin.toFixed(1)}%"></span>
          ${formatCurrency(saleVal)}
        </td>
        
        <td style="text-align:center;">
          <span class="margin-pct ${marginClass}" title="الهامش الفعلي المحسوب من آخر سعر شراء">${marginText}</span>
          ${p.targetMarginPct ? `<div class="dim" style="font-size:9.5px; margin-top:2px;" title="نسبة الربح المستهدفة المسجلة">هدف: ${p.targetMarginPct}%</div>` : ''}
        </td>
        
        <td>${p.taxCategory === 'S' ? '15%' : '0%'}</td>
        <td class="mono font-bold" style="cursor:pointer; color:var(--brand);" onclick="viewStock('${p.id}')" title="كشف حركة الصنف">${formatQuantity(totalQty)}</td>
        <td>${getStockStatusBadge(totalQty, p.reorderLevel)}</td>
        <td style="padding:6px; text-align:center;">
          <div class="prod-actions-stack">
            <button class="btn-act btn-act-view" onclick="event.stopPropagation();viewStock('${p.id}')" title="كشف حركة الصنف">
              <span>📦</span> حركة
            </button>
            <button class="btn-act btn-act-edit" onclick="event.stopPropagation();editProduct('${p.id}')" title="تعديل صنف">
              <span>✏️</span> تعديل
            </button>
            <button class="btn-act btn-act-barcode" onclick="event.stopPropagation();printProductBarcode('${p.id}')" title="طباعة باركود">
              <span>🏷️</span> باركود
            </button>
            <button class="btn-act btn-act-delete" onclick="event.stopPropagation();deleteProduct('${p.id}')" title="حذف الصنف">
              <span>🗑️</span> حذف
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}


export async function render(container, user) {
  // Inject local styles for skeleton and inline edit once
  if (!document.getElementById("prod-local-styles")) {
    const style = document.createElement("style");
    style.id = "prod-local-styles";
    style.innerHTML = `
      .skeleton-row td { padding: 12px 14px; }
      .profit-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-left: 6px; }
      .profit-dot.high { background: #10B981; }
      .profit-dot.medium { background: #F59E0B; }
      .profit-dot.low { background: #EF4444; }
      .margin-pct { font-weight: bold; padding: 2px 6px; border-radius: 4px; font-size: 11px; display: inline-block; }
      .margin-pct.high { color: #10B981; background: rgba(16, 185, 129, 0.1); }
      .margin-pct.medium { color: #F59E0B; background: rgba(245, 158, 11, 0.1); }
      .margin-pct.low { color: #EF4444; background: rgba(239, 68, 68, 0.1); }
      td.price-editable { cursor: pointer; position: relative; }
      td.price-editable:hover { background: rgba(91, 127, 255, 0.08) !important; color: var(--brand); }
      .prod-actions-stack { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; min-width: 120px; position: relative; z-index: 10; }
      .btn-act { display: inline-flex; align-items: center; justify-content: center; gap: 4px; padding: 4px 6px; font-size: 11px; font-weight: 700; border-radius: 6px; border: 1px solid transparent; cursor: pointer; transition: all 0.18s ease; white-space: nowrap; font-family: inherit; }
      .btn-act-view { background: rgba(99, 102, 241, 0.12); color: #4F46E5; border-color: rgba(99, 102, 241, 0.25); }
      .btn-act-view:hover { background: #4F46E5; color: #ffffff; box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3); }
      .btn-act-edit { background: rgba(245, 158, 11, 0.12); color: #D97706; border-color: rgba(245, 158, 11, 0.25); }
      .btn-act-edit:hover { background: #D97706; color: #ffffff; box-shadow: 0 2px 8px rgba(217, 119, 6, 0.3); }
      .btn-act-barcode { background: rgba(16, 185, 129, 0.12); color: #059669; border-color: rgba(16, 185, 129, 0.25); }
      .btn-act-barcode:hover { background: #059669; color: #ffffff; box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3); }
      .btn-act-delete { background: rgba(239, 68, 68, 0.12); color: #DC2626; border-color: rgba(239, 68, 68, 0.25); }
      .btn-act-delete:hover { background: #DC2626; color: #ffffff; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3); }
    `;
    document.head.appendChild(style);
  }

  // Always clear product cache on page open so stock reflects latest invoice data
  allProducts = [];

  const hasCache = false; // always fetch fresh

  container.innerHTML = `
    <!-- Filter Bar -->
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:300px;">
        <input type="text" id="prod-search" class="input" placeholder="🔍  بحث في الأصناف (اسم، كود، باركود)…" />
      </div>
      <div class="filterbar-divider"></div>
      <div class="filter-select-group">
        <label>الفئة</label>
        <select id="prod-cat-filter">
          <option value="">كل الفئات</option>
          ${categories.map(c => `<option value="${c.id}" ${filterCategory === c.id ? 'selected' : ''}>${c.name}</option>`).join("")}
        </select>
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="prod-status-filter">
          <option value="">الكل</option>
          <option value="ok" ${filterStatus === 'ok' ? 'selected' : ''}>متوفر</option>
          <option value="low" ${filterStatus === 'low' ? 'selected' : ''}>منخفض</option>
          <option value="out" ${filterStatus === 'out' ? 'selected' : ''}>نافد</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <button class="btn-export" style="background:#4F46E5;color:#fff;" onclick="syncAllProductPurchasePrices(this)" title="تحديث ومزامنة آخر أسعار الشراء ومتوسط التكلفة من كافة فواتير الشراء"><span>🔄</span> تحديث أسعار الشراء</button>
        <button class="btn-export" onclick="exportPagePDF('#prod-tbody','كتالوج_الأصناف')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportProductsExcel()" title="تصدير Excel - جميع البيانات"><span>📊</span> تصدير Excel</button>
        <button class="btn-export" style="background:var(--bg-2);border:1px solid var(--border-soft);color:var(--text-1);" onclick="downloadProductTemplate()" title="تنزيل نموذج استيراد"><span>📥</span> نموذج الاستيراد</button>
        <button class="btn-export" style="background:#10B981;color:#fff;" onclick="openProductImportModal()" title="استيراد من Excel"><span>📤</span> استيراد Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn btn-primary" onclick="openProductModal()">+ إضافة صنف جديد</button>
      </div>
    </div>

    <!-- KPIs Section -->
    <div class="inv-kpi-grid" style="margin-bottom: 20px;">
      <div class="inv-kpi-card g-blue">
        <div class="inv-kpi-icon">💰</div>
        <div class="inv-kpi-body">
          <div class="inv-kpi-value" id="kpi-total-val">${cachedKPIs ? formatCurrency(cachedKPIs.totalValue) : '—'}</div>
          <div class="inv-kpi-label">قيمة المخزون (سعر البيع)</div>
        </div>
      </div>
      <div class="inv-kpi-card g-teal">
        <div class="inv-kpi-icon">🏷️</div>
        <div class="inv-kpi-body">
          <div class="inv-kpi-value" id="kpi-total-cost">${cachedKPIs ? formatCurrency(cachedKPIs.totalCost) : '—'}</div>
          <div class="inv-kpi-label">تكلفة المخزون (الشرائية)</div>
        </div>
      </div>
      <div class="inv-kpi-card g-green">
        <div class="inv-kpi-icon">📈</div>
        <div class="inv-kpi-body">
          <div class="inv-kpi-value" id="kpi-margin-pct">${cachedKPIs ? `${cachedKPIs.avgMargin}%` : '—'}</div>
          <div class="inv-kpi-label">متوسط هامش الربح %</div>
        </div>
      </div>
      <div class="inv-kpi-card g-orange">
        <div class="inv-kpi-icon">⚠️</div>
        <div class="inv-kpi-body">
          <div class="inv-kpi-value" id="kpi-low-stock">${cachedKPIs ? cachedKPIs.lowStockCount : '—'}</div>
          <div class="inv-kpi-label">أصناف تحت حد الطلب</div>
        </div>
      </div>
    </div>

    <!-- Page Content -->
    <div class="page-content">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">كتالوج الأصناف والبطاقات التعريفية</h1>
          <p class="page-subtitle" id="prod-count-label">${hasCache ? `${allProducts.length} صنف مسجل حالياً` : 'جارٍ التحميل…'}</p>
        </div>
        <div class="page-header-right">
          <span id="prod-page-info" class="text-2 mono" style="font-size:12px;"></span>
        </div>
      </div>

      <!-- Products Table -->
      <div class="card">
        <div class="table-container" id="prod-table-wrap">
          <table class="data-dense" id="prod-table">
            <thead>
              <tr>
                <th onclick="sortProdList('sku')" style="cursor:pointer; user-select:none;">الكود ${getSortArrowProd('sku')}</th>
                <th onclick="sortProdList('name')" style="cursor:pointer; user-select:none;">اسم الصنف (عربي/إنجليزي) ${getSortArrowProd('name')}</th>
                <th>التتبع</th>
                <th onclick="sortProdList('category')" style="cursor:pointer; user-select:none;">الفئة ${getSortArrowProd('category')}</th>
                <th>الوحدات والتحويل</th>
                <th onclick="sortProdList('costPrice')" style="cursor:pointer; user-select:none; text-align:left;">التكلفة (يدوي) ${getSortArrowProd('costPrice')}</th>
                <th onclick="sortProdList('avgCostPrice')" style="cursor:pointer; user-select:none; text-align:left; color:var(--brand);">متوسط الشراء (تلقائي) ${getSortArrowProd('avgCostPrice')}</th>
                <th onclick="sortProdList('lastPurchasePrice')" style="cursor:pointer; user-select:none; text-align:left;">آخر سعر شراء ${getSortArrowProd('lastPurchasePrice')}</th>
                <th onclick="sortProdList('sellingPrice')" style="cursor:pointer; user-select:none; text-align:left;">سعر البيع (جملة/تجزئة) ${getSortArrowProd('sellingPrice')}</th>
                <th onclick="sortProdList('profit')" style="cursor:pointer; user-select:none; text-align:center;">نسبة الربح ${getSortArrowProd('profit')}</th>
                <th>الضريبة</th>
                <th onclick="sortProdList('totalQty')" style="cursor:pointer; user-select:none;">المخزون الإجمالي ${getSortArrowProd('totalQty')}</th>
                <th>الحالة</th>
                <th style="width:130px; text-align:center;">الخيارات والإجراءات</th>
              </tr>
            </thead>
            <tbody id="prod-tbody">
              ${hasCache ? renderProductRowsHtml(allProducts) : `
                <tr class="skeleton-row">
                  <td><div class="sk" style="width:70px;height:12px;"></div></td>
                  <td><div class="sk" style="width:180px;height:12px;margin-bottom:6px;"></div><div class="sk" style="width:110px;height:10px;"></div></td>
                  <td><div class="sk" style="width:40px;height:16px;border-radius:4px;"></div></td>
                  <td><div class="sk" style="width:70px;height:12px;"></div></td>
                  <td><div class="sk" style="width:80px;height:12px;"></div></td>
                  <td><div class="sk" style="width:60px;height:12px;"></div></td>
                  <td><div class="sk" style="width:60px;height:12px;"></div></td>
                  <td><div class="sk" style="width:40px;height:16px;border-radius:4px;"></div></td>
                  <td><div class="sk" style="width:30px;height:12px;"></div></td>
                  <td><div class="sk" style="width:50px;height:12px;"></div></td>
                  <td><div class="sk" style="width:50px;height:16px;border-radius:10px;"></div></td>
                  <td><div class="sk" style="width:120px;height:40px;border-radius:6px;"></div></td>
                </tr>
                <tr class="skeleton-row">
                  <td><div class="sk" style="width:70px;height:12px;"></div></td>
                  <td><div class="sk" style="width:180px;height:12px;margin-bottom:6px;"></div><div class="sk" style="width:110px;height:10px;"></div></td>
                  <td><div class="sk" style="width:40px;height:16px;border-radius:4px;"></div></td>
                  <td><div class="sk" style="width:70px;height:12px;"></div></td>
                  <td><div class="sk" style="width:80px;height:12px;"></div></td>
                  <td><div class="sk" style="width:60px;height:12px;"></div></td>
                  <td><div class="sk" style="width:60px;height:12px;"></div></td>
                  <td><div class="sk" style="width:40px;height:16px;border-radius:4px;"></div></td>
                  <td><div class="sk" style="width:30px;height:12px;"></div></td>
                  <td><div class="sk" style="width:50px;height:12px;"></div></td>
                  <td><div class="sk" style="width:50px;height:16px;border-radius:10px;"></div></td>
                  <td><div class="sk" style="width:120px;height:40px;border-radius:6px;"></div></td>
                </tr>
              `}
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-top:1px solid var(--border-soft); position:relative; z-index:10;">
          <button class="btn btn-sm btn-secondary" id="prev-page-btn" onclick="window.loadPrevPage()" ${currentPage === 0 ? 'disabled' : ''}>السابق</button>
          <span id="page-counter" class="text-2 mono" style="font-size:12px;">الصفحة ${currentPage + 1}</span>
          <button class="btn btn-sm btn-secondary" id="next-page-btn" onclick="window.loadNextPage()" ${!hasMore ? 'disabled' : ''}>التالي</button>
        </div>
      </div>
    </div>

    <!-- Product Modal (Add/Edit) -->
    <div class="modal-overlay" id="product-modal">
      <div class="modal modal-xl" style="max-height:90vh; overflow-y:auto;">
        <div class="modal-header">
          <h3 class="modal-title" id="prod-modal-title">إضافة صنف جديد</h3>
          <button class="modal-close" onclick="closeModal('product-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:24px;">
          <input type="hidden" id="prod-edit-id" />
          
          <div class="modal-tabs" style="display:flex; border-bottom:1px solid var(--border-soft); margin-bottom:20px;">
            <button class="tab-btn active" id="prod-tab-basic" onclick="switchProdFormTab('basic')" style="padding:10px 16px; border:none; background:none; cursor:pointer; font-weight:bold; border-bottom:2px solid var(--brand); color:var(--brand);">البيانات الأساسية</button>
            <button class="tab-btn" id="prod-tab-inventory" onclick="switchProdFormTab('inventory')" style="padding:10px 16px; border:none; background:none; cursor:pointer; font-weight:bold; border-bottom:2px solid transparent; color:var(--text-2);">مؤشرات المخازن وتتبع الصلاحية</button>
            <button class="tab-btn" id="prod-tab-pricing" onclick="switchProdFormTab('pricing')" style="padding:10px 16px; border:none; background:none; cursor:pointer; font-weight:bold; border-bottom:2px solid transparent; color:var(--text-2);">التكلفة ومستويات الأسعار</button>
            <button class="tab-btn" id="prod-tab-units" onclick="switchProdFormTab('units')" style="padding:10px 16px; border:none; background:none; cursor:pointer; font-weight:bold; border-bottom:2px solid transparent; color:var(--text-2);">الوحدات المتعددة والتحويل</button>
          </div>

          <!-- Tab 1: Basic Information -->
          <div class="prod-form-tab-content" id="content-prod-basic">
            <div class="grid-3 gap-16 mb-16">
              <div class="form-group">
                <label>كود الصنف (Item Code) *</label>
                <input type="text" id="prod-sku" class="input" placeholder="RICE-100" />
              </div>
              <div class="form-group">
                <label>الاسم باللغة العربية *</label>
                <input type="text" id="prod-name-ar" class="input" placeholder="أرز بسمتي الشعلان 10 كجم" />
              </div>
              <div class="form-group">
                <label>الاسم باللغة الإنجليزية</label>
                <input type="text" id="prod-name-en" class="input" placeholder="Al Shalan Basmati Rice 10kg" />
              </div>
            </div>
            <div class="grid-3 gap-16 mb-16">
              <div class="form-group">
                <label>الفئة الرئيسية *</label>
                <select id="prod-category" class="input" onchange="onCategoryChange()">
                  <option value="">اختر الفئة...</option>
                </select>
              </div>
              <div class="form-group">
                <label>المورد الافتراضي</label>
                <select id="prod-supplier" class="input">
                  <option value="">اختر المورد...</option>
                </select>
              </div>
              <div class="form-group">
                <label>بلد المنشأ</label>
                <input type="text" id="prod-origin" class="input" placeholder="الهند، البرازيل..." />
              </div>
            </div>
            <div class="grid-3 gap-16 mb-16">
              <div class="form-group">
                <label>الباركود الأساسي</label>
                <input type="text" id="prod-barcode" class="input mono" placeholder="628xxxxxxxxxx" />
              </div>
              <div class="form-group">
                <label>باركود بديل (متعدد، مفصول بفاصلة)</label>
                <input type="text" id="prod-barcodes-alt" class="input mono" placeholder="6281002003, 6284005006" />
              </div>
              <div class="form-group">
                <label>رمز النظام المنسق الجمركي (HS Code)</label>
                <input type="text" id="prod-hs-code" class="input mono" placeholder="1006.30.00" />
              </div>
            </div>
            <div class="form-group">
              <label>وصف الصنف / تفاصيل إضافية</label>
              <textarea id="prod-desc" class="input" rows="3" placeholder="المواصفات الفنية والملاحظات التشغيلية..."></textarea>
            </div>
          </div>

          <!-- Tab 2: Warehouse Control & Expiry Tracking -->
          <div class="prod-form-tab-content hidden" id="content-prod-inventory">
            <div class="grid-3 gap-16 mb-16">
              <div class="form-group">
                <label>طريقة التتبع (Tracking Method)</label>
                <select id="prod-tracking" class="input" onchange="toggleTrackingFields()">
                  <option value="none">بدون تتبع خاص</option>
                  <option value="batch">بالتشغيلة وتاريخ الانتهاء (Batch & Expiry)</option>
                  <option value="serial">بالرقم التسلسلي (Serial Number)</option>
                </select>
              </div>
              <div class="form-group">
                <label>فترة الصلاحية بالأيام (Shelf Life)</label>
                <input type="number" id="prod-shelf-life" class="input mono" placeholder="365" />
              </div>
              <div class="form-group">
                <label>درجة حرارة التخزين (°م)</label>
                <select id="prod-temp" class="input">
                  <option value="dry">مخزن جاف (غرفة)</option>
                  <option value="chilled">تبريد (1°م إلى 4°م)</option>
                  <option value="frozen">تجميد (-18°م وأقل)</option>
                </select>
              </div>
            </div>
            <div class="grid-4 gap-16 mb-16">
              <div class="form-group">
                <label>الحد الأدنى للمخزون (Min)</label>
                <input type="number" id="prod-min" class="input mono" placeholder="10" />
              </div>
              <div class="form-group">
                <label>الحد الأقصى للمخزون (Max)</label>
                <input type="number" id="prod-max" class="input mono" placeholder="1000" />
              </div>
              <div class="form-group">
                <label>نقطة إعادة الطلب (Reorder Point)</label>
                <input type="number" id="prod-reorder" class="input mono" placeholder="50" />
              </div>
              <div class="form-group">
                <label>مخزون الأمان (Safety Stock)</label>
                <input type="number" id="prod-safety" class="input mono" placeholder="20" />
              </div>
            </div>
            <div class="grid-3 gap-16">
              <div class="form-group">
                <label>الكمية الاقتصادية للطلب (EOQ)</label>
                <input type="number" id="prod-eoq" class="input mono" placeholder="150" />
              </div>
              <div class="form-group">
                <label>وقت التوريد بالأيام (Lead Time)</label>
                <input type="number" id="prod-lead-time" class="input mono" placeholder="15" />
              </div>
              <div class="form-group">
                <label>فئة ضريبة القيمة المضافة ZATCA *</label>
                <select id="prod-zatca-tax" class="input">
                  <option value="S">خاضع للضريبة الأساسية 15%</option>
                  <option value="Z">خاضع لنسبة الصفر 0%</option>
                  <option value="E">معفى من الضريبة</option>
                </select>
              </div>
            </div>

            <!-- Multi-Warehouse shelf/bin locations mapping -->
            <h4 style="border-top:1px solid var(--border-soft); padding-top:16px; margin-top:20px; color:var(--brand); font-family:var(--font-heading); font-size:14px; font-weight:700;">📍 مواقع التخزين داخل المستودعات (Locations & Bins)</h4>
            <p class="dim" style="font-size:11px; margin-bottom:12px;">تحديد الرفوف والممرات لكل مستودع لتسهيل التحضير (مثال: الرف A-12، الممر 3)</p>
            <div class="table-container" style="max-height: 180px; overflow-y: auto;">
              <table class="data-dense" style="width:100%; margin:0;">
                <thead>
                  <tr>
                    <th>اسم المستودع</th>
                    <th>موقع الصنف بالرف / الممر (Location / Shelf Code)</th>
                  </tr>
                </thead>
                <tbody id="prod-locations-tbody">
                  <!-- Will be loaded dynamically from warehouses -->
                </tbody>
              </table>
            </div>

          </div>

          <!-- Tab 3: Costing & Price Levels -->
          <div class="prod-form-tab-content hidden" id="content-prod-pricing">
            
            <!-- Smart Pricing Strategy Card (استراتيجية التسعير الذكي وآخر سعر شراء) -->
            <div style="background:rgba(99,102,241,0.06); border:1.5px solid rgba(99,102,241,0.25); border-radius:12px; padding:14px 18px; margin-bottom:18px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:18px;">🎯</span>
                  <strong style="font-size:13.5px; color:var(--text-0);">استراتيجية التسعير وهامش الربح المستهدف (Last Purchase Price Pricing)</strong>
                </div>
                <div style="font-size:11.5px; color:var(--text-2);">
                  🛒 آخر سعر شراء مسجل: <b id="prod-last-purchase-display" class="mono font-bold" style="color:#059669;">—</b>
                </div>
              </div>

              <div class="grid-3 gap-16">
                <div class="form-group" style="margin:0;">
                  <label style="font-size:11px; font-weight:700;">نسبة هامش الربح المستهدفة %</label>
                  <div style="display:flex; gap:6px; align-items:center;">
                    <input type="number" id="prod-target-margin-pct" class="input mono font-bold" placeholder="مثال: 20" min="0" max="500" step="0.5" oninput="onTargetMarginInput()" style="font-size:13px; font-weight:800; border-color:var(--brand);" />
                    <span style="font-size:12px; font-weight:800; color:var(--brand);">%</span>
                  </div>
                </div>

                <div class="form-group" style="margin:0;">
                  <label style="font-size:11px; font-weight:700;">طريقة احتساب الهامش</label>
                  <select id="prod-margin-type" class="input font-bold" onchange="onTargetMarginInput()" style="font-size:11.5px; height:36px;">
                    <option value="markup">إضافة على التكلفة (Markup %)</option>
                    <option value="margin">هامش ربح من سعر البيع (Margin %)</option>
                  </select>
                </div>

                <div class="form-group" style="margin:0; display:flex; flex-direction:column; justify-content:flex-end;">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="applyLastPurchasePricePricing()" style="height:36px; font-size:11px; font-weight:700; color:var(--brand); border-color:var(--brand);">
                    ⚡ حساب الأسعار من آخر سعر شراء
                  </button>
                </div>
              </div>
            </div>

            <div class="grid-3 gap-16 mb-20">
              <div class="form-group">
                <label>طريقة التقييم المالي (Valuation)</label>
                <select id="prod-valuation" class="input">
                  <option value="moving_average">المتوسط المرجح المتحرك (Moving Average)</option>
                  <option value="fifo">الوارد أولاً يصرف أولاً (FIFO)</option>
                  <option value="lifo">الوارد أخيراً يصرف أولاً (LIFO)</option>
                  <option value="standard">التكلفة القياسية (Standard Cost)</option>
                </select>
              </div>
              <div class="form-group">
                <label>سعر التكلفة اليدوي الافتراضي (ر.س)</label>
                <input type="number" id="prod-purchase-price" class="input mono" step="0.01" placeholder="0.00" oninput="onCostInput()" />
              </div>
              <div class="form-group">
                <label>التكلفة القياسية / المعيارية (ر.س)</label>
                <input type="number" id="prod-std-cost" class="input mono" step="0.01" placeholder="0.00" />
              </div>
            </div>
            
            <h4 style="border-bottom:1px solid var(--border-soft); padding-bottom:8px; margin-bottom:16px; color:var(--brand); font-family:var(--font-heading); font-size:14px; font-weight:700;">💰 مستويات أسعار البيع للعملاء وهامش الربح</h4>
            <div class="grid-3 gap-16">
              <!-- Retail -->
              <div class="form-group" style="background:var(--bg-2); padding:12px; border-radius:10px; border:1px solid var(--border);">
                <label style="font-weight:700; color:var(--brand); display:block; margin-bottom:8px;">🛒 بيع التجزئة (Retail)</label>
                <div style="display:flex; flex-direction:column; gap:6px;">
                  <div>
                    <label style="font-size:10px; color:var(--text-muted);">السعر قبل الضريبة (ر.س) *</label>
                    <input type="number" id="prod-price-retail" class="input mono" step="0.01" placeholder="0.00" oninput="onPriceInput('retail')" />
                  </div>
                  <div>
                    <label style="font-size:10px; color:var(--text-muted);">السعر شامل الضريبة (ر.س)</label>
                    <input type="number" id="prod-price-inc-retail" class="input mono" step="0.01" placeholder="0.00" oninput="onPriceIncInput('retail')" />
                  </div>
                  <div>
                    <label style="font-size:10px; color:var(--text-muted);">نسبة الربح % (هامش التكلفة)</label>
                    <input type="number" id="prod-pct-retail" class="input mono" step="0.1" placeholder="%" oninput="onPctInput('retail')" />
                  </div>
                </div>
              </div>

              <!-- Wholesale -->
              <div class="form-group" style="background:var(--bg-2); padding:12px; border-radius:10px; border:1px solid var(--border);">
                <label style="font-weight:700; color:var(--brand); display:block; margin-bottom:8px;">📦 بيع الجملة (Wholesale)</label>
                <div style="display:flex; flex-direction:column; gap:6px;">
                  <div>
                    <label style="font-size:10px; color:var(--text-muted);">السعر قبل الضريبة (ر.س)</label>
                    <input type="number" id="prod-price-wholesale" class="input mono" step="0.01" placeholder="0.00" oninput="onPriceInput('wholesale')" />
                  </div>
                  <div>
                    <label style="font-size:10px; color:var(--text-muted);">السعر شامل الضريبة (ر.س)</label>
                    <input type="number" id="prod-price-inc-wholesale" class="input mono" step="0.01" placeholder="0.00" oninput="onPriceIncInput('wholesale')" />
                  </div>
                  <div>
                    <label style="font-size:10px; color:var(--text-muted);">نسبة الربح % (هامش التكلفة)</label>
                    <input type="number" id="prod-pct-wholesale" class="input mono" step="0.1" placeholder="%" oninput="onPctInput('wholesale')" />
                  </div>
                </div>
              </div>

              <!-- Distributor -->
              <div class="form-group" style="background:var(--bg-2); padding:12px; border-radius:10px; border:1px solid var(--border);">
                <label style="font-weight:700; color:var(--brand); display:block; margin-bottom:8px;">🚚 الموزعين (Distributor)</label>
                <div style="display:flex; flex-direction:column; gap:6px;">
                  <div>
                    <label style="font-size:10px; color:var(--text-muted);">السعر قبل الضريبة (ر.س)</label>
                    <input type="number" id="prod-price-distributor" class="input mono" step="0.01" placeholder="0.00" oninput="onPriceInput('distributor')" />
                  </div>
                  <div>
                    <label style="font-size:10px; color:var(--text-muted);">السعر شامل الضريبة (ر.س)</label>
                    <input type="number" id="prod-price-inc-distributor" class="input mono" step="0.01" placeholder="0.00" oninput="onPriceIncInput('distributor')" />
                  </div>
                  <div>
                    <label style="font-size:10px; color:var(--text-muted);">نسبة الربح % (هامش التكلفة)</label>
                    <input type="number" id="prod-pct-distributor" class="input mono" step="0.1" placeholder="%" oninput="onPctInput('distributor')" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 4: Multi-Unit & UoM Conversion -->
          <div class="prod-form-tab-content hidden" id="content-prod-units">
            <div class="alert info mb-16">تتيح لك هذه الواجهة تحديد وحدات القياس المختلفة للصنف (مثال: الشراء بالكرتون والبيع بالحبة) مع ضبط معامل التحويل التلقائي.</div>
            <div class="grid-3 gap-16 mb-20">
              <div class="form-group">
                <label>الوحدة الأساسية (المخزنية/أصغر وحدة) *</label>
                <select id="prod-unit-base" class="input">
                  <option value="Carton">كرتون (Carton)</option>
                  <option value="Piece">حبة (Piece)</option>
                  <option value="Box">صندوق (Box)</option>
                  <option value="Bag">كيس (Bag)</option>
                  <option value="Bale">بالة (Bale)</option>
                  <option value="Barrel">برميل (Barrel)</option>
                  <option value="Pack">شد / ربطة (Pack)</option>
                  <option value="Sack">شوال (Sack)</option>
                  <option value="Tray">طبق (Tray)</option>
                  <option value="Gallon">جالون (Gallon)</option>
                  <option value="Kilogram">كيلو جرام (KG)</option>
                  <option value="Ton">طن (Ton)</option>
                  <option value="Liter">لتر (Liter)</option>
                  <option value="Gram">جرام (Gram)</option>
                  <option value="Can">علبة (Can)</option>
                  <option value="Bottle">زجاجة (Bottle)</option>
                  <option value="Meter">متر (Meter)</option>
                  <option value="Tank">تنك (Tank)</option>
                  <option value="Roll">رول (Roll)</option>
                </select>
              </div>
              <div class="form-group">
                <label>الوحدة البديلة الأولى (وحدة الشراء/التعبئة)</label>
                <select id="prod-unit-alt" class="input">
                  <option value="">بدون وحدة بديلة</option>
                  <option value="Carton">كرتون (Carton)</option>
                  <option value="Box">صندوق (Box)</option>
                  <option value="Bag">كيس (Bag)</option>
                  <option value="Bale">بالة (Bale)</option>
                  <option value="Barrel">برميل (Barrel)</option>
                  <option value="Pack">شد / ربطة (Pack)</option>
                  <option value="Sack">شوال (Sack)</option>
                  <option value="Tray">طبق (Tray)</option>
                  <option value="Gallon">جالون (Gallon)</option>
                  <option value="Ton">طن (Ton)</option>
                  <option value="Pallet">باليت (Pallet)</option>
                  <option value="Piece">حبة (Piece)</option>
                  <option value="Kilogram">كيلو جرام (KG)</option>
                  <option value="Liter">لتر (Liter)</option>
                  <option value="Gram">جرام (Gram)</option>
                  <option value="Can">علبة (Can)</option>
                  <option value="Bottle">زجاجة (Bottle)</option>
                  <option value="Meter">متر (Meter)</option>
                  <option value="Tank">تنك (Tank)</option>
                  <option value="Roll">رول (Roll)</option>
                </select>
              </div>
              <div class="form-group">
                <label>معامل التحويل (كم وحدة أساسية في البديلة)</label>
                <input type="number" id="prod-unit-conv" class="input mono" placeholder="مثال: 12 حبة في الكرتون" />
              </div>
            </div>
          </div>

          <div id="prod-form-error" class="alert bad hidden" style="margin-top:16px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('product-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveProduct()" id="save-prod-btn">حفظ الصنف</button>
        </div>
      </div>
    </div>

    <!-- Enhanced Stock Ledger & Batch Card Modal -->
    <div class="modal-overlay" id="stock-modal">
      <div class="modal" style="max-width:1100px; width:97%; max-height:92vh; display:flex; flex-direction:column;">
        <div class="modal-header" style="border-bottom:none; padding-bottom:0; flex-shrink:0;">
          <h3 class="modal-title" id="stock-modal-title">تفاصيل بطاقة الصنف</h3>
          <button class="modal-close" onclick="closeModal('stock-modal')">×</button>
        </div>
        <div class="modal-tabs" style="display:flex; border-bottom:1px solid var(--border-soft); margin: 0 24px 0 24px; flex-shrink:0;">
          <button class="tab-btn active" id="tab-btn-balances" onclick="switchStockTab('balances')" style="padding:10px 18px; border:none; background:none; cursor:pointer; font-weight:bold; border-bottom:2px solid var(--brand); color:var(--brand);">📦 أرصدة المخازن</button>
          <button class="tab-btn" id="tab-btn-batches" onclick="switchStockTab('batches')" style="padding:10px 18px; border:none; background:none; cursor:pointer; font-weight:bold; border-bottom:2px solid transparent; color:var(--text-2);">🧬 التشغيلات والتواريخ</button>
          <button class="tab-btn" id="tab-btn-card" onclick="switchStockTab('card')" style="padding:10px 18px; border:none; background:none; cursor:pointer; font-weight:bold; border-bottom:2px solid transparent; color:var(--text-2);">📜 دفتر الحركة التفصيلي</button>
        </div>
        <div class="modal-body" id="stock-modal-body" style="flex:1; overflow-y:auto; padding:0;">
          <!-- Will be loaded dynamically -->
        </div>
      </div>
    </div>
  `;

  // ── Wire up event listeners AFTER HTML is injected ────────────
  // Category filter
  const catEl = document.getElementById("prod-cat-filter");
  if (catEl) catEl.addEventListener("change", () => { filterCategory = catEl.value; loadProducts(true); });

  // Status filter
  const statusEl = document.getElementById("prod-status-filter");
  if (statusEl) statusEl.addEventListener("change", () => { filterStatus = statusEl.value; loadProducts(true); });

  // Search
  window.setupProductSearch();

  const savedCat = sessionStorage.getItem("filter_category_id");
  if (savedCat) {
    filterCategory = savedCat;
    sessionStorage.removeItem("filter_category_id");
  }

  // Load data immediately (show cached instantly if available, then refresh)
  await loadProducts(true);
}

export async function loadProducts(reset = false) {
  if (reset) {
    lastDocSnapshot = null;
    currentPage = 0;
  }
  const tbody = document.getElementById("prod-tbody");
  if (!tbody) return;

  try {
    // ── 1. Load categories if not loaded yet ──────────────────────
    if (!categories || categories.length === 0) {
      categories = await getAll(COLS.categories());

      const defaultCats = [
        { id: "dairy",          name: "ألبان ومنتجاتها",       icon: "🥛" },
        { id: "oils",           name: "زيوت وسمن",             icon: "🌻" },
        { id: "rice_grains",    name: "أرز وحبوب",             icon: "🌾" },
        { id: "dry_goods",      name: "سكر ودقيق ومعجنات",     icon: "🍞" },
        { id: "beverages",      name: "مشروبات وعصائر",        icon: "🧃" },
        { id: "water",          name: "مياه معبأة",             icon: "💧" },
        { id: "meat_poultry",   name: "لحوم ودواجن مجمدة",     icon: "🍗" },
        { id: "seafood",        name: "أسماك ومأكولات بحرية",  icon: "🐟" },
        { id: "canned",         name: "معلبات وصلصات",         icon: "🥫" },
        { id: "confectionery",  name: "حلويات وشوكولاتة",      icon: "🍫" },
        { id: "biscuits",       name: "بسكويت وكيك",           icon: "🍪" },
        { id: "spices",         name: "توابل وبهارات",         icon: "🧂" },
        { id: "coffee_tea",     name: "قهوة وشاي",             icon: "☕" },
        { id: "cleaning",       name: "منظفات ومعطرات",        icon: "🧴" },
        { id: "personal_care",  name: "عناية شخصية وورقيات",   icon: "🧻" },
        { id: "baby",           name: "أطفال وحفاضات",         icon: "👶" },
        { id: "bakery",         name: "مخبوزات وخبز",          icon: "🥖" },
        { id: "frozen",         name: "أغذية مجمدة",           icon: "🧊" },
        { id: "honey_jam",      name: "عسل ومربيات وطحينة",    icon: "🍯" },
        { id: "snacks",         name: "شيبس ومكسرات",          icon: "🥜" },
        { id: "veg_fruits",    name: "خضار وفواكه طازجة",     icon: "🍅" },
        { id: "frozen_veg",    name: "خضروات مجمدة",          icon: "🥦" },
        { id: "dates",         name: "تمور ومنتجاتها",        icon: "🌴" },
        { id: "pickles",       name: "مخللات وأجبان مكشوفة",  icon: "🥒" },
        { id: "plastics",      name: "بلاستيكيات ومستلزمات تغليف", icon: "🛍️" },
        { id: "disposables",   name: "أكواب ومستلزمات ضيافة",  icon: "🥤" },
        { id: "tobacco",       name: "تبغ ومستلزمات تدخين",    icon: "🚬" },
        { id: "egg",           name: "بيض طازج",              icon: "🥚" },
        { id: "sauces",        name: "صلصات ومايونيز وتوابل سائلة", icon: "🍯" },
        { id: "nuts_seeds",    name: "مكسرات وبذور",          icon: "🌰" },
        { id: "ice_cream",     name: "آيس كريم وحلويات باردة", icon: "🍦" }
      ];

      const missingCats = defaultCats.filter(d => !categories.some(c => c.id === d.id));
      if (missingCats.length > 0) {
        try {
          const { writeBatch, doc: fbDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
          const batch = writeBatch(db);
          missingCats.forEach(c => {
            const docRef = fbDoc(COLS.categories(), c.id);
            batch.set(docRef, {
              name: c.name,
              code: c.id,
              icon: c.icon,
              description: `أصناف تابعة لقسم ${c.name}`,
              createdAt: new Date(),
              updatedAt: new Date()
            }, { merge: true });
          });
          await batch.commit();
          categories = await getAll(COLS.categories());
        } catch (e) {
          console.error("Auto-seed categories failed:", e);
        }
      }
    }

    const catFilterEl = document.getElementById("prod-cat-filter");
    if (catFilterEl) {
      catFilterEl.innerHTML = '<option value="">كل الفئات</option>' +
        categories.map(c => `<option value="${c.id}" ${filterCategory === c.id ? 'selected' : ''}>${c.name}</option>`).join("");
    }
    const prodCatEl = document.getElementById("prod-category");
    if (prodCatEl) {
      prodCatEl.innerHTML = '<option value="">اختر الفئة...</option>' +
        categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    }

    // ── 2. Load warehouses if not loaded yet ─────────────────────
    if (!warehouses || warehouses.length === 0) {
      warehouses = await getAll(COLS.warehouses());
    }

    // ── 3. Fetch ALL products and stock quantities ──────────────────
    const { clearERPCache } = await import("../utils/db.js");
    await clearERPCache(COLS.stockByWarehouse().path);
    await clearERPCache(COLS.products().path);

    let docs = await getAll(COLS.products());
    docs.sort((a, b) => (a.sku || "").localeCompare(b.sku || "", undefined, { numeric: true }));

    // ── Load live stock quantities from server ─────────────────────────────
    try {
      const stockDocs = await getAll(COLS.stockByWarehouse());
      const stockMap = {};
      stockDocs.forEach(data => {
        if (data.productId) {
          stockMap[data.productId] = (stockMap[data.productId] || 0) + (data.qty || 0);
        }
      });
      docs.forEach(p => {
        p._totalQty = stockMap[p.id] !== undefined ? stockMap[p.id] : (p.totalQty !== undefined ? p.totalQty : 0);
      });
    } catch (e) {
      console.warn("Stock balances unavailable:", e);
    }
    allProducts = docs;

    // ── 4. Client-side filtering ──────────────────────────────────
    const catFilter    = document.getElementById("prod-cat-filter")?.value    || filterCategory || "";
    const statusFilter = document.getElementById("prod-status-filter")?.value || filterStatus   || "";
    const searchVal    = (document.getElementById("prod-search")?.value || "").trim().toLowerCase();

    let filtered = [...allProducts];

    if (catFilter) {
      filtered = filtered.filter(p => p.category === catFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(p => {
        const qty = p._totalQty || 0;
        const reorder = p.reorderLevel || 0;
        if (statusFilter === "out") return qty <= 0;
        if (statusFilter === "low") return qty > 0 && qty <= reorder;
        if (statusFilter === "ok")  return qty > reorder;
        return true;
      });
    }

    if (searchVal) {
      filtered = filtered.filter(d =>
        d.name?.toLowerCase().includes(searchVal) ||
        d.sku?.toLowerCase().includes(searchVal)  ||
        d.barcode?.includes(searchVal)             ||
        d.nameEn?.toLowerCase().includes(searchVal)||
        d.categoryName?.toLowerCase().includes(searchVal)
      );
    }

    // Sort in-memory before pagination
    if (sortFieldProd) {
      filtered.sort((a, b) => {
        let valA = a[sortFieldProd];
        let valB = b[sortFieldProd];

        if (sortFieldProd === "sku") {
          valA = a.sku || "";
          valB = b.sku || "";
        } else if (sortFieldProd === "name") {
          valA = a.name || "";
          valB = b.name || "";
        } else if (sortFieldProd === "category") {
          valA = a.categoryName || a.category || "";
          valB = b.categoryName || b.category || "";
        } else if (sortFieldProd === "costPrice") {
          valA = Number(a.costPrice || a.purchasePrice || 0);
          valB = Number(b.costPrice || b.purchasePrice || 0);
        } else if (sortFieldProd === "sellingPrice") {
          valA = Number(a.sellingPrice || a.salePrice || a.priceRetail || a.price || 0);
          valB = Number(b.sellingPrice || b.salePrice || b.priceRetail || b.price || 0);
        } else if (sortFieldProd === "totalQty") {
          valA = Number(a._totalQty || 0);
          valB = Number(b._totalQty || 0);
        } else if (sortFieldProd === "profit") {
          const cA = Number(a.costPrice || a.purchasePrice || 0);
          const sA = Number(a.sellingPrice || a.salePrice || a.priceRetail || a.price || 0);
          const pA = sA > 0 ? ((sA - cA) / sA) * 100 : 0;

          const cB = Number(b.costPrice || b.purchasePrice || 0);
          const sB = Number(b.sellingPrice || b.salePrice || b.priceRetail || b.price || 0);
          const pB = sB > 0 ? ((sB - cB) / sB) * 100 : 0;

          valA = pA;
          valB = pB;
        }

        if (typeof valA === "string") {
          return sortAscProd ? valA.localeCompare(valB, undefined, { numeric: true }) : valB.localeCompare(valA, undefined, { numeric: true });
        } else {
          return sortAscProd ? valA - valB : valB - valA;
        }
      });
    }

    // ── 5. Client-side pagination ─────────────────────────────────
    hasMore = filtered.length > (currentPage + 1) * PAGE_SIZE;
    const pageStart = currentPage * PAGE_SIZE;
    const pageData  = filtered.slice(pageStart, pageStart + PAGE_SIZE);

    // ── 6. Compute KPIs on full filtered set ──────────────────────
    let totalValue = 0, totalCost = 0, profitSum = 0, lowStockCount = 0, pricedCount = 0;
    filtered.forEach(p => {
      const qty    = p._totalQty  || 0;
      // avgCostPrice = المتوسط المرجح المُحسَب من الفواتير (يتطابق مع شجرة الحسابات)
      // إذا لم يُحسَب بعد، نرجع للـ costPrice اليدوي
      const cPrice = p.avgCostPrice || p.costPrice  || p.purchasePrice || 0;
      const sPrice = p.sellingPrice || p.salePrice  || p.priceRetail || p.price || 0;
      totalValue += qty * sPrice;
      totalCost  += qty * cPrice;
      if (sPrice > 0) { profitSum += ((sPrice - cPrice) / sPrice) * 100; pricedCount++; }
      if (qty < (p.reorderLevel || 0)) lowStockCount++;
    });
    const avgMargin = pricedCount > 0 ? (profitSum / pricedCount).toFixed(1) : "0.0";
    cachedKPIs = { totalValue, totalCost, avgMargin, lowStockCount };


    const kpiVal    = document.getElementById("kpi-total-val");
    const kpiCost   = document.getElementById("kpi-total-cost");
    const kpiMargin = document.getElementById("kpi-margin-pct");
    const kpiLow    = document.getElementById("kpi-low-stock");
    if (kpiVal)    kpiVal.textContent    = formatCurrency(totalValue);
    if (kpiCost)   kpiCost.textContent   = formatCurrency(totalCost);
    if (kpiMargin) kpiMargin.textContent = `${avgMargin}%`;
    if (kpiLow)    kpiLow.textContent    = lowStockCount;

    const countLabel = document.getElementById("prod-count-label");
    if (countLabel) countLabel.textContent = `${filtered.length} صنف — عرض ${pageData.length}`;

    // ── 7. Render table rows ──────────────────────────────────────
    tbody.innerHTML = renderProductRowsHtml(pageData);

    const pi = document.getElementById("page-counter");
    if (pi) pi.textContent = `الصفحة ${currentPage + 1} / ${Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}`;

    const prevBtn = document.getElementById("prev-page-btn");
    const nextBtn = document.getElementById("next-page-btn");
    if (prevBtn) prevBtn.disabled = (currentPage === 0);
    if (nextBtn) nextBtn.disabled = !hasMore;

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;padding:40px;color:var(--danger);">
      ⚠️ ${err.message}
      <br><button class="btn btn-sm btn-secondary" style="margin-top:12px;" onclick="loadProducts(true)">إعادة المحاولة</button>
    </td></tr>`;
  }
}


window.applySuggestedCategoryMargin = async () => {
  const settings = await getPricingSettings();
  if (!settings.enableCategoryMargins) return;

  const catId = document.getElementById("prod-category").value;
  const cost = parseFloat(document.getElementById("prod-purchase-price").value) || 0;
  if (cost <= 0) return;

  const cat = categories.find(c => c.id === catId);
  if (!cat) return;

  let margin = 0;
  if (cat.velocity === "fast") margin = settings.marginFast ?? 5;
  else if (cat.velocity === "medium") margin = settings.marginMedium ?? 10;
  else if (cat.velocity === "slow") margin = settings.marginSlow ?? 15;
  else return;

  const suggestedSale = Math.round((cost * (1 + margin / 100)) * 100) / 100;
  document.getElementById("prod-price-retail").value = suggestedSale;
};

window.onCategoryChange = async () => {
  // 1. Margins suggestion
  await applySuggestedCategoryMargin();

  // 2. Auto SKU Generation (Only for new products)
  const isEdit = !!document.getElementById("prod-edit-id").value;
  if (isEdit) return; // Keep existing SKU for edits

  const catId = document.getElementById("prod-category").value;
  if (!catId) return;

  const skuInput = document.getElementById("prod-sku");
  if (!skuInput) return;

  // Prefix mapping based on category ID
  const prefixMap = {
    "dairy": "01",
    "oils": "02",
    "rice_grains": "03",
    "dry_goods": "04",
    "beverages": "05",
    "water": "06",
    "meat_poultry": "07",
    "seafood": "08",
    "canned": "09",
    "confectionery": "10",
    "biscuits": "11",
    "spices": "12",
    "coffee_tea": "13",
    "cleaning": "14",
    "personal_care": "15",
    "baby": "16",
    "bakery": "17",
    "frozen": "18",
    "honey_jam": "19",
    "snacks": "20"
  };

  // Fallback prefix: If not in map, generate prefix dynamically based on category index
  let prefix = prefixMap[catId];
  if (!prefix) {
    const idx = categories.findIndex(c => c.id === catId);
    prefix = String(idx >= 0 ? 21 + idx : 99);
  }

  // Find all products starting with this prefix
  const skuList = allProducts
    .map(p => String(p.sku || ""))
    .filter(sku => sku.startsWith(prefix));

  let maxNum = 0;
  skuList.forEach(sku => {
    // Extract trailing digits (e.g. from "01005", extract "005" -> 5)
    const trailingPart = sku.slice(prefix.length);
    const num = parseInt(trailingPart, 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  });

  const nextNum = maxNum + 1;
  // Pad number to 3 digits (e.g. 1 -> 001, resulting in 01001)
  const nextSku = prefix + String(nextNum).padStart(3, '0');

  skuInput.value = nextSku;
};

// Global function to perform quick inline edits
// ── Inline price editor ───────────────────────────────────────────────────────
// Keeps a reference to the currently-open editor so we can close it when
// another one is opened (prevents two open inputs at the same time).
let _activeInlineCell = null;
let _activeInlineCancel = null;

window.inlineEditPrice = (cell, productId, field, currentVal) => {
  // If THIS cell is already in edit mode, do nothing
  if (cell.querySelector('input')) return;

  // ── Close any other open inline editor first ──────────────────────────────
  if (_activeInlineCancel) {
    _activeInlineCancel();
  }

  // ── Snapshot the original cell HTML so we can restore exactly ────────────
  const originalHTML = cell.innerHTML;

  // ── Build the input ───────────────────────────────────────────────────────
  const input = document.createElement('input');
  input.type    = 'number';
  input.step    = '0.01';
  input.min     = '0';
  input.value   = currentVal;
  input.style.cssText = [
    'width:90px',
    'height:26px',
    'padding:3px 7px',
    'font-size:12px',
    'font-family:var(--font-mono,monospace)',
    'font-weight:700',
    'border:2px solid var(--brand)',
    'border-radius:6px',
    'background:var(--bg-1,#fff)',
    'color:var(--text-1,#1e293b)',
    'outline:none',
    'box-shadow:0 0 0 3px rgba(91,127,255,.15)',
    'text-align:left',
    'display:block',
    'box-sizing:border-box',
  ].join(';');

  cell.innerHTML = '';
  cell.style.padding = '4px 8px'; // keep cell height stable
  cell.appendChild(input);
  input.focus();
  input.select();

  // ── Register as active ────────────────────────────────────────────────────
  _activeInlineCell   = cell;
  _activeInlineCancel = cancel;

  let committed = false;

  // Restore cell to its original look (cancel path)
  function cancel() {
    if (committed) return;
    committed = true;
    cell.style.padding = '';
    cell.innerHTML = originalHTML;
    if (_activeInlineCell === cell) {
      _activeInlineCell   = null;
      _activeInlineCancel = null;
    }
  }

  // Save & restore (commit path)
  const save = async () => {
    if (committed) return;
    committed = true;

    const newVal = parseFloat(input.value);

    // Invalid → just restore original
    if (isNaN(newVal) || newVal < 0) {
      cell.style.padding = '';
      cell.innerHTML = originalHTML;
      if (_activeInlineCell === cell) { _activeInlineCell = null; _activeInlineCancel = null; }
      return;
    }

    // No change → restore original silently
    if (newVal === currentVal) {
      cell.style.padding = '';
      cell.innerHTML = originalHTML;
      if (_activeInlineCell === cell) { _activeInlineCell = null; _activeInlineCancel = null; }
      return;
    }

    // Show spinner while saving
    cell.style.padding = '';
    cell.innerHTML = `<div class="loading-spinner sm"></div>`;
    if (_activeInlineCell === cell) { _activeInlineCell = null; _activeInlineCancel = null; }

    try {
      const updateData = {};
      if (field === 'salePrice' || field === 'sellingPrice' || field === 'priceRetail') {
        updateData.salePrice = newVal;
        updateData.sellingPrice = newVal;
        updateData.priceRetail  = newVal;
      } else if (field === 'costPrice' || field === 'purchasePrice') {
        updateData.costPrice     = newVal;
        updateData.purchasePrice = newVal;
        updateData.averageCost   = newVal;
      } else {
        updateData[field] = newVal;
      }

      await update('products', productId, updateData);

      // Patch cached list
      const prod = allProducts.find(p => p.id === productId);
      if (prod) Object.assign(prod, updateData);

      showToast("✅ تم تحديث السعر بنجاح", "success");

      // Refresh the full list (re-renders all rows with correct KPIs)
      await loadProducts();
    } catch (e) {
      showToast("❌ " + e.message, "error");
      cell.innerHTML = originalHTML;
    }
  };

  input.addEventListener('blur',    () => save());
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter')  { input.blur(); }   // triggers blur → save
    if (e.key === 'Escape') { committed = true; cancel(); }
  });
};

window.switchProdFormTab = (tab) => {
  const tabs = ['basic', 'inventory', 'pricing', 'units'];
  tabs.forEach(t => {
    const btn = document.getElementById(`prod-tab-${t}`);
    if (btn) {
      btn.classList.remove("active");
      btn.style.borderBottomColor = "transparent";
      btn.style.color = "var(--text-2)";
    }
    const content = document.getElementById(`content-prod-${t}`);
    if (content) content.classList.add("hidden");
  });

  const activeBtn = document.getElementById(`prod-tab-${tab}`);
  if (activeBtn) {
    activeBtn.classList.add("active");
    activeBtn.style.borderBottomColor = "var(--brand)";
    activeBtn.style.color = "var(--brand)";
  }
  const activeContent = document.getElementById(`content-prod-${tab}`);
  if (activeContent) activeContent.classList.remove("hidden");
};

window.toggleTrackingFields = () => {
  const val = document.getElementById("prod-tracking")?.value;
  const shelfLifeInput = document.getElementById("prod-shelf-life");
  if (shelfLifeInput) {
    if (val === "batch") {
      shelfLifeInput.disabled = false;
      shelfLifeInput.parentElement.classList.remove("disabled");
    } else {
      shelfLifeInput.disabled = true;
      shelfLifeInput.value = "";
      shelfLifeInput.parentElement.classList.add("disabled");
    }
  }
};

window.openProductModal = (prod = null) => {
  switchProdFormTab('basic');
  document.getElementById("prod-edit-id").value = prod?.id || "";
  document.getElementById("prod-modal-title").textContent = prod ? "تعديل بطاقة الصنف" : "إضافة صنف جديد";
  
  document.getElementById("prod-sku").value = prod?.sku || "";
  document.getElementById("prod-name-ar").value = prod?.name || prod?.nameAr || "";
  document.getElementById("prod-name-en").value = prod?.nameEn || "";
  document.getElementById("prod-category").value = prod?.category || "";
  document.getElementById("prod-supplier").value = prod?.supplierId || "";
  document.getElementById("prod-origin").value = prod?.country || "";
  document.getElementById("prod-barcode").value = prod?.barcode || "";
  document.getElementById("prod-barcodes-alt").value = (prod?.alternativeBarcodes || []).join(", ");
  document.getElementById("prod-hs-code").value = prod?.hsCode || "";
  document.getElementById("prod-desc").value = prod?.description || "";
  
  document.getElementById("prod-tracking").value = prod?.tracking || "none";
  document.getElementById("prod-shelf-life").value = prod?.shelfLife || "";
  document.getElementById("prod-temp").value = prod?.storageTemperature || "dry";
  
  document.getElementById("prod-min").value = prod?.minimumQuantity || "";
  document.getElementById("prod-max").value = prod?.maximumQuantity || "";
  document.getElementById("prod-reorder").value = prod?.reorderLevel || "";
  document.getElementById("prod-safety").value = prod?.safetyStock || "";
  document.getElementById("prod-eoq").value = prod?.economicOrderQuantity || "";
  document.getElementById("prod-lead-time").value = prod?.leadTime || "";
  document.getElementById("prod-zatca-tax").value = prod?.taxCategory || "S";
  
  document.getElementById("prod-valuation").value = prod?.valuationMethod || "moving_average";
  document.getElementById("prod-purchase-price").value = prod?.costPrice || prod?.purchasePrice || "";
  document.getElementById("prod-std-cost").value = prod?.standardCost || "";

  // Smart pricing and target margin
  document.getElementById("prod-target-margin-pct").value = (prod?.targetMarginPct !== undefined && prod?.targetMarginPct !== null) ? prod.targetMarginPct : "";
  document.getElementById("prod-margin-type").value = prod?.marginType || "markup";
  
  const lastPurDisplay = document.getElementById("prod-last-purchase-display");
  if (lastPurDisplay) {
    if (prod?.lastPurchasePrice !== undefined && prod?.lastPurchasePrice !== null && prod?.lastPurchasePrice > 0) {
      lastPurDisplay.textContent = `${formatCurrency(prod.lastPurchasePrice)} ${prod.lastPurchaseDate ? `(تاريخ: ${prod.lastPurchaseDate})` : ''}`;
    } else {
      lastPurDisplay.textContent = "لا يوجد فواتير شراء مسجلة بعد";
    }
  }

  window._currentEditingProduct = prod;
  
  const cost = parseFloat(prod?.costPrice || prod?.purchasePrice) || 0;
  const taxCat = prod?.taxCategory || "S";
  const mult = taxCat === "S" ? 1.15 : 1.0;

  document.getElementById("prod-price-retail").value = prod?.salePrice || prod?.priceRetail || "";
  document.getElementById("prod-price-wholesale").value = prod?.priceWholesale || "";
  document.getElementById("prod-price-distributor").value = prod?.priceDistributor || "";

  // Calculate and populate percentage margins and inclusive prices
  ["retail", "wholesale", "distributor"].forEach(level => {
    const priceVal = parseFloat(level === 'retail' ? (prod?.salePrice || prod?.priceRetail) : level === 'wholesale' ? prod?.priceWholesale : prod?.priceDistributor) || 0;
    
    // Set Price including VAT
    const priceIncEl = document.getElementById(`prod-price-inc-${level}`);
    if (priceIncEl) {
      priceIncEl.value = priceVal > 0 ? (priceVal * mult).toFixed(2) : "";
    }

    // Set Profit Percentage
    const pctInput = document.getElementById(`prod-pct-${level}`);
    if (pctInput) {
      if (cost > 0 && priceVal > 0) {
        pctInput.value = (((priceVal - cost) / cost) * 100).toFixed(1);
      } else {
        pctInput.value = "";
      }
    }
  });

  // Attach change listener to tax Category dropdown to dynamically recalculate inclusive prices
  const taxDropdown = document.getElementById("prod-zatca-tax");
  if (taxDropdown && !taxDropdown._changeListenerAttached) {
    taxDropdown.addEventListener("change", () => {
      ["retail", "wholesale", "distributor"].forEach(level => {
        const priceInput = document.getElementById(`prod-price-${level}`);
        if (priceInput && priceInput.value !== "") {
          window.onPriceInput(level);
        }
      });
    });
    taxDropdown._changeListenerAttached = true;
  }
  
  document.getElementById("prod-unit-base").value = prod?.unit || "Piece";
  document.getElementById("prod-unit-alt").value = prod?.altUnit || "";
  document.getElementById("prod-unit-conv").value = prod?.unitFactor || "";

  // Dynamic locations tbody
  const locTbody = document.getElementById("prod-locations-tbody");
  if (locTbody) {
    locTbody.innerHTML = warehouses.map(w => {
      const locVal = prod?.locationsByWarehouse?.[w.id] || "";
      return `
        <tr>
          <td><strong>${w.name}</strong></td>
          <td>
            <input type="text" class="input sm sc-wh-loc-input" data-wh-id="${w.id}" value="${locVal}" placeholder="مثال: الرف A-12" style="padding:4px 8px; font-size:12px; margin:0;" />
          </td>
        </tr>
      `;
    }).join("");
  }

  document.getElementById("prod-form-error").classList.add("hidden");
  openModal("product-modal");
};

window.editProduct = (id) => {
  const prod = allProducts.find(p => p.id === id);
  if (prod) {
    openProductModal(prod);
  } else {
    import("../utils/db.js").then(async ({ getById }) => {
      try {
        const p = await getById("products", id);
        if (p) openProductModal(p);
      } catch (err) { showToast(err.message, "error"); }
    });
  }
};

window.saveProduct = async () => {
  const errEl = document.getElementById("prod-form-error"); errEl.classList.add("hidden");

  const id = document.getElementById("prod-edit-id").value;
  const sku = document.getElementById("prod-sku").value.trim().toUpperCase();
  const nameAr = document.getElementById("prod-name-ar").value.trim();
  const priceRetail = parseFloat(document.getElementById("prod-price-retail").value) || 0;

  if (!sku || !nameAr) { errEl.textContent = "يرجى تعبئة الكود والاسم العربي"; errEl.classList.remove("hidden"); return; }
  if (!priceRetail) { errEl.textContent = "يرجى تعبئة سعر التجزئة الأساسي"; errEl.classList.remove("hidden"); return; }

  const catId = document.getElementById("prod-category").value;
  const cat = categories.find(c => c.id === catId);

  const locationsByWarehouse = {};
  document.querySelectorAll(".sc-wh-loc-input").forEach(inp => {
    const whId = inp.dataset.whId;
    const val = inp.value.trim();
    if (val) locationsByWarehouse[whId] = val;
  });

  const targetMarginVal = parseFloat(document.getElementById("prod-target-margin-pct").value);
  const marginTypeVal = document.getElementById("prod-margin-type").value || "markup";

  const data = {
    sku,
    name: nameAr,
    nameAr,
    nameEn: document.getElementById("prod-name-en").value.trim(),
    category: catId,
    categoryName: cat?.name || "",
    supplierId: document.getElementById("prod-supplier").value,
    country: document.getElementById("prod-origin").value.trim(),
    barcode: document.getElementById("prod-barcode").value.trim(),
    alternativeBarcodes: document.getElementById("prod-barcodes-alt").value.split(",").map(b => b.trim()).filter(Boolean),
    hsCode: document.getElementById("prod-hs-code").value.trim(),
    description: document.getElementById("prod-desc").value.trim(),
    
    tracking: document.getElementById("prod-tracking").value,
    shelfLife: parseInt(document.getElementById("prod-shelf-life").value) || null,
    storageTemperature: document.getElementById("prod-temp").value,
    locationsByWarehouse,
    
    minimumQuantity: parseInt(document.getElementById("prod-min").value) || 0,
    maximumQuantity: parseInt(document.getElementById("prod-max").value) || 0,
    reorderLevel: parseInt(document.getElementById("prod-reorder").value) || 0,
    safetyStock: parseInt(document.getElementById("prod-safety").value) || 0,
    economicOrderQuantity: parseInt(document.getElementById("prod-eoq").value) || 0,
    leadTime: parseInt(document.getElementById("prod-lead-time").value) || 0,
    taxCategory: document.getElementById("prod-zatca-tax").value,
    
    valuationMethod: document.getElementById("prod-valuation").value,
    costPrice: parseFloat(document.getElementById("prod-purchase-price").value) || 0,
    purchasePrice: parseFloat(document.getElementById("prod-purchase-price").value) || 0,
    standardCost: parseFloat(document.getElementById("prod-std-cost").value) || 0,
    
    targetMarginPct: !isNaN(targetMarginVal) ? targetMarginVal : null,
    marginType: marginTypeVal,

    salePrice: priceRetail,
    sellingPrice: priceRetail,
    priceRetail,
    priceWholesale: parseFloat(document.getElementById("prod-price-wholesale").value) || 0,
    priceDistributor: parseFloat(document.getElementById("prod-price-distributor").value) || 0,
    
    unit: document.getElementById("prod-unit-base").value,
    altUnit: document.getElementById("prod-unit-alt").value,
    unitFactor: parseInt(document.getElementById("prod-unit-conv").value) || 1,
    
    searchTokens: generateSearchTokens(nameAr + " " + sku)
  };

  const btn = document.getElementById("save-prod-btn"); btn.disabled = true;

  try {
    if (id) {
      await update("products", id, data);
      showToast("تم تحديث بطاقة الصنف بنجاح", "success");
    } else {
      await create(COLS.products(), data);
      showToast("تم إضافة الصنف بنجاح", "success");
    }
    closeModal("product-modal");
    allProducts = []; // invalidate cache → force fresh fetch
    await loadProducts(true);
  } catch (err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

window.deleteProduct = async (id, name = null) => {
  if (!name) {
    const prod = allProducts.find(p => p.id === id);
    name = prod ? (prod.name || prod.nameAr || "") : "";
  }

  // ── Safety Check: block deletion if any stock movement exists ──────────────
  try {
    const txQuery = query(
      COLS.stockTransactions(),
      where("productId", "==", id),
      limit(1)
    );
    const txSnap = await getDocs(txQuery);
    if (!txSnap.empty) {
      // Build a friendly modal instead of alert
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay active";
      overlay.id = "del-guard-overlay";
      overlay.innerHTML = `
        <div class="modal" style="max-width:480px;">
          <div class="modal-header" style="background:rgba(239,68,68,0.08);border-bottom:1px solid rgba(239,68,68,0.2);">
            <h3 class="modal-title" style="color:var(--danger);">⛔ لا يمكن حذف الصنف</h3>
            <button class="modal-close" onclick="document.getElementById('del-guard-overlay').remove()">×</button>
          </div>
          <div class="modal-body" style="padding:24px;">
            <p style="font-size:15px;margin-bottom:12px;">الصنف <strong>"${name}"</strong> لديه حركات مخزنية مسجلة (فواتير شراء / بيع / تسويات).</p>
            <div class="alert" style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:8px;padding:12px;margin-bottom:16px;color:var(--text-1);">
              <strong>⚠️ لحماية سلامة البيانات المحاسبية</strong>، لا يُسمح بحذف صنف له تاريخ حركات.<br/>
              <span style="font-size:12px;opacity:0.8;">يمكنك بدلاً من ذلك تعطيل الصنف لمنع استخدامه في الفواتير الجديدة.</span>
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end;">
              <button class="btn btn-secondary" onclick="document.getElementById('del-guard-overlay').remove()">إغلاق</button>
              <button class="btn" style="background:rgba(239,68,68,0.15);color:var(--danger);border:1px solid rgba(239,68,68,0.3);"
                onclick="_forceDeleteProduct('${id}', '${name.replace(/'/g, "\\'")}')">حذف قسري مع العلم بالمخاطر</button>
            </div>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      return;
    }
  } catch (chkErr) {
    console.warn("Safety check failed, proceeding with confirmation:", chkErr);
  }

  // ── No transactions found → standard confirmation ──────────────────────────
  if (confirm(`هل تريد حذف الصنف "${name}"؟\nلا توجد حركات مسجلة لهذا الصنف.`)) {
    try {
      await remove("products", id);
      showToast("تم حذف الصنف بنجاح", "success");
      allProducts = [];
      await loadProducts(true);
    } catch (err) { showToast(err.message, "error"); }
  }
};

// Force-delete (only accessible via the warning modal — requires conscious click)
window._forceDeleteProduct = async (id, name) => {
  const overlay = document.getElementById("del-guard-overlay");
  if (overlay) overlay.remove();
  if (confirm(`⚠️ تأكيد الحذف القسري للصنف "${name}"؟\nستبقى الحركات التاريخية ولكن الصنف لن يظهر في القوائم.`)) {
    try {
      await remove("products", id);
      showToast(`تم حذف الصنف "${name}" قسرياً`, "success");
      allProducts = [];
      await loadProducts(true);
    } catch (err) { showToast(err.message, "error"); }
  }
};

// Expose loadProducts globally so HTML onclick can call it
window.loadProducts = loadProducts;

// ── Tabbed Product Card (viewStock) ──
let currentProductId = null;
let currentProductName = null;
let cachedStockBalances = [];
let cachedStockTxs = [];
let cachedBatches = [];
let cachedPartyMap = new Map();
let cachedDocMetaMap = new Map();
let currentLedgerCalculated = [];
let cachedLedgerSort = "desc"; // Default: newest first

window.switchStockTab = async (tab) => {
  const btnBal = document.getElementById("tab-btn-balances");
  const btnBatches = document.getElementById("tab-btn-batches");
  const btnCard = document.getElementById("tab-btn-card");
  const body = document.getElementById("stock-modal-body");
  if (!btnBal || !btnBatches || !btnCard) return;

  // Clear tabs active state
  [btnBal, btnBatches, btnCard].forEach(b => {
    b.classList.remove("active");
    b.style.borderBottomColor = "transparent";
    b.style.color = "var(--text-2)";
  });

  const activeBtn = document.getElementById(`tab-btn-${tab}`);
  activeBtn.classList.add("active");
  activeBtn.style.borderBottomColor = "var(--brand)";
  activeBtn.style.color = "var(--brand)";

  body.innerHTML = `<div class="page-loading" style="min-height:80px;"><div class="loading-spinner"></div></div>`;

  try {
    if (tab === 'balances') {
      renderStockBalances();
    } else if (tab === 'batches') {
      if (!cachedBatches.length) {
        // Query batches from stockTransactions where tracking == batch
        const q = query(COLS.stockTransactions(), where("productId", "==", currentProductId));
        const snap = await getDocs(q);
        const txs = snap.docs.map(d => d.data());
        
        // Group by batchNumber to calculate quantity
        const batchMap = {};
        txs.forEach(t => {
          if (t.batchNumber) {
            if (!batchMap[t.batchNumber]) batchMap[t.batchNumber] = { qty: 0, expiryDate: t.expiryDate, prodDate: t.productionDate };
            batchMap[t.batchNumber].qty += t.qtyChange || 0;
          }
        });
        cachedBatches = Object.keys(batchMap).map(num => ({ number: num, ...batchMap[num] })).filter(b => b.qty > 0);
      }
      renderBatches();
    } else {
      if (!cachedStockTxs.length) {
        const [snap, siSnap, purSnap, transfersSnap, balSnap] = await Promise.all([
          getDocs(query(COLS.stockTransactions(), where("productId", "==", currentProductId))),
          getDocs(COLS.salesInvoices ? COLS.salesInvoices() : collection(db, `companies/${COMPANY_ID}/salesInvoices`)).catch(() => ({ docs: [] })),
          getDocs(COLS.purchaseInvoices ? COLS.purchaseInvoices() : collection(db, `companies/${COMPANY_ID}/purchaseInvoices`)).catch(() => ({ docs: [] })),
          getDocs(COLS.stockTransfers ? COLS.stockTransfers() : collection(db, `companies/${COMPANY_ID}/stockTransfers`)).catch(() => ({ docs: [] })),
          getStockForProduct(currentProductId).catch(() => [])
        ]);

        cachedStockBalances = balSnap || [];
        cachedPartyMap = new Map();
        cachedDocMetaMap = new Map();

        (siSnap.docs || []).forEach(d => {
          const inv = d.data();
          const p = inv.customerName || inv.clientName || "عميل نقدي";
          const num = inv.invoiceNumber || inv.number || inv.code;
          const data = { type: "sale", party: p, rep: inv.repName || "", status: inv.status, id: d.id, date: inv.date };
          if (num) { cachedPartyMap.set(num, p); cachedDocMetaMap.set(num, data); }
          if (d.id) { cachedPartyMap.set(d.id, p); cachedDocMetaMap.set(d.id, data); }
        });

        (purSnap.docs || []).forEach(d => {
          const pur = d.data();
          const p = pur.supplierName || pur.vendorName || "مورد معتمد";
          const num = pur.invoiceNumber || pur.number || pur.code;
          const data = { type: "purchase", party: p, status: pur.status, id: d.id, date: pur.date };
          if (num) { cachedPartyMap.set(num, p); cachedDocMetaMap.set(num, data); }
          if (d.id) { cachedPartyMap.set(d.id, p); cachedDocMetaMap.set(d.id, data); }
        });

        (transfersSnap.docs || []).forEach(d => {
          const tr = d.data();
          const num = tr.number || tr.code || tr.transferNumber;
          const fromN = tr.fromWarehouseName || "المستودع الرئيسي";
          const toN = tr.toWarehouseName || "المستودع";
          const p = `${fromN} ⬅️ ${toN}`;
          const data = { type: "transfer", party: p, fromN, toN, status: tr.status, id: d.id, date: tr.date };
          if (num) { cachedPartyMap.set(num, p); cachedDocMetaMap.set(num, data); }
          if (d.id) { cachedPartyMap.set(d.id, p); cachedDocMetaMap.set(d.id, data); }
        });

        cachedStockTxs = snap.docs.map(d => {
          const data = d.data();
          const docNum = data.documentNumber || data.docNum || data.docNo || data.refNo || data.refCode || data.invoiceNumber || data.number || (data.notes?.match(/(REP-\d+|INV-\d+|TR-[A-Z0-9]+|PUR-\d+)/i)?.[0]) || "";
          const party = data.customerName || data.supplierName || cachedPartyMap.get(docNum) || cachedPartyMap.get(d.id) || "";
          return { id: d.id, ...data, docNum, partyName: party };
        });
      }
      renderItemLedgerCard();
    }
  } catch (err) {
    body.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
};


function renderStockBalances() {
  const body = document.getElementById("stock-modal-body");
  const warehouseMap = {};
  warehouses.forEach(w => warehouseMap[w.id] = w.name);

  const prod = allProducts.find(p => p.id === currentProductId);
  const locations = prod?.locationsByWarehouse || {};

  if (cachedStockBalances.length === 0) {
    body.innerHTML = `<div class="empty-state" style="padding:20px;"><div class="empty-icon">📦</div><p>لا يوجد رصيد في أي مخزن</p></div>`;
  } else {
    body.innerHTML = `
      <table class="data-dense" style="width:100%;">
        <thead><tr><th>المخزن / موقع الرف</th><th>الكمية المتوفرة</th><th>حد الطلب</th><th>الحالة</th></tr></thead>
        <tbody>
          ${cachedStockBalances.map(s => {
            const wName = warehouseMap[s.warehouseId] || s.warehouseId;
            const locVal = locations[s.warehouseId] || "";
            const locStr = locVal ? `<span class="dim" style="font-size:10px; display:block; margin-top:2px;">📍 الرف/الموقع: ${locVal}</span>` : `<span class="dim" style="font-size:10px; display:block; margin-top:2px;">📍 الموقع غير محدد</span>`;
            const st    = getStockStatus(s.qty, s.reorderLevel || 0);
            return `<tr>
              <td><strong>${wName}</strong>${locStr}</td>
              <td class="mono font-bold">${formatQuantity(s.qty)}</td>
              <td class="mono dim">${s.reorderLevel || 0}</td>
              <td>${getStockStatusBadge(s.qty, s.reorderLevel)}</td>
            </tr>`;
          }).join("")}
          <tr style="border-top:2px solid var(--border);">
            <td class="font-bold">الإجمالي</td>
            <td class="mono font-bold text-indigo">${formatQuantity(cachedStockBalances.reduce((s,r) => s + r.qty, 0))}</td>
            <td></td><td></td>
          </tr>
        </tbody>
      </table>`;
  }
}

function renderBatches() {
  const body = document.getElementById("stock-modal-body");
  if (cachedBatches.length === 0) {
    body.innerHTML = `<div class="empty-state" style="padding:20px;"><div class="empty-icon">🧬</div><p>لا توجد تشغيلات (Batches) فعالة أو منتهية الصلاحية مسجلة</p></div>`;
  } else {
    body.innerHTML = `
      <table class="data-dense" style="width:100%;">
        <thead><tr><th>رقم التشغيلة</th><th>تاريخ الإنتاج</th><th>تاريخ الانتهاء</th><th>الكمية المتبقية</th><th>الحالة</th></tr></thead>
        <tbody>
          ${cachedBatches.map(b => {
            const isExpired = b.expiryDate && new Date(b.expiryDate) < new Date();
            return `
              <tr>
                <td class="mono font-bold">${b.number}</td>
                <td class="dim">${b.prodDate || "—"}</td>
                <td class="mono ${isExpired ? 'text-bad font-bold' : ''}">${b.expiryDate || "—"}</td>
                <td class="mono font-bold">${formatQuantity(b.qty)}</td>
                <td>${isExpired ? '<span class="badge bad">منتهية الصلاحية</span>' : '<span class="badge good">صالحة</span>'}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>`;
  }
}

function renderItemLedgerCard(filterDateFrom, filterDateTo, filterType, filterWarehouse, filterSimplified = false) {
  const body = document.getElementById("stock-modal-body");
  const warehouseMap = {};
  warehouses.forEach(w => warehouseMap[w.id] = w.name);

  const prod = allProducts.find(p => p.id === currentProductId) || {};
  const unitStr = prod.unit || "كرتون";

  const typeLabels = {
    purchase_invoice: "فاتورة شراء", purchase_in: "فاتورة شراء",
    sales_invoice: "فاتورة بيع", sale_out: "فاتورة بيع",
    transfer_out: "تحويل صادر", transfer_in: "تحويل وارد",
    sales_return: "مرتجع مبيعات", return_in: "مرتجع مبيعات",
    purchase_return: "مرتجع مشتريات", return_out: "مرتجع مشتريات",
    adjustment: "تسوية مخزنية", damage: "إهلاك تالف",
    donation: "تبرعات وهبات", expired: "إعدام صلاحية",
    "return-damaged": "مرتجع تالف للمورد", assembly: "تجميع", disassembly: "تفكيك",
    "spot-count": "جرد مفاجئ", "spot-count-reversal": "إلغاء جرد مفاجئ",
    adjustment_in: "تسوية إضافة", adjustment_out: "تسوية خصم",
    adjustment_delete: "إلغاء تسوية", adjustment_reverse: "تعديل تسوية",
    opening: "رصيد افتتاحي", sale_cancel: "تعديل مبيعات"
  };

  const typeIcons = {
    purchase_invoice: "🛒", purchase_in: "🛒",
    sales_invoice: "💰", sale_out: "💰",
    transfer_in: "📥", transfer_out: "📤",
    sales_return: "↩️", return_in: "↩️",
    purchase_return: "↩️", return_out: "↩️",
    adjustment: "⚖️", adjustment_in: "➕", adjustment_out: "➖",
    damage: "💔", expired: "🗑️", "spot-count": "🔢",
    "return-damaged": "↩️", assembly: "🔧", disassembly: "🔩",
    donation: "🎁", opening: "🏁", sale_cancel: "📝"
  };

  // ── 1. Live Warehouse Distribution Pills ────────────────────────────────────
  let totalStockAllWh = 0;
  const pillsHtml = (cachedStockBalances || []).map(s => {
    const q = parseFloat(s.qty) || 0;
    totalStockAllWh += q;
    const wh = warehouses.find(w => w.id === s.warehouseId) || { name: s.warehouseName || s.warehouseId, type: "Main" };
    const isVan = wh.type === "Vehicle" || wh.type === "Distribution" || (wh.name && (wh.name.includes("سيارة") || wh.name.includes("مندوب")));
    const color = q > 0 ? (isVan ? "#2563EB" : "#059669") : "#64748B";
    return `
      <span style="display:inline-flex; align-items:center; gap:6px; padding:4px 10px; background:var(--bg-card, #fff); border:1px solid var(--border-soft); border-radius:20px; font-size:11.5px; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
        <span>${isVan ? '🚐' : '🏢'}</span>
        <span>${wh.name}:</span>
        <b class="mono" style="color:${color}; font-weight:800;">${formatQuantity(q)} ${unitStr}</b>
      </span>
    `;
  }).join("") || '<span class="dim" style="font-size:11px;">لا توجد أرصدة مسجلة بالمستودعات</span>';

  // ── 2. Filter bar ──────────────────────────────────────────────────────────
  const warehouseOptions = warehouses.map(w =>
    `<option value="${w.id}" ${filterWarehouse === w.id ? 'selected' : ''}>${w.name}</option>`
  ).join("");

  const filterBarHtml = `
    <!-- Live Warehouse Distribution Banner -->
    <div style="padding:10px 18px; background:var(--bg-2); border-bottom:1px solid var(--border-soft); display:flex; flex-direction:column; gap:8px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:16px;">📍</span>
          <b style="font-size:12.5px; color:var(--text-0);">الأرصدة اللحظية المتوفرة بالمستودعات والسيارات:</b>
        </div>
        <div style="font-size:12.5px; font-weight:800; color:var(--brand);">
          📦 إجمالي رصيد المؤسسة: <span class="mono" style="font-size:14px;">${formatQuantity(totalStockAllWh)}</span> ${unitStr}
        </div>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:8px;">
        ${pillsHtml}
      </div>
    </div>

    <!-- Filter Bar Inputs -->
    <div id="ledger-filter-bar" style="
      display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end;
      padding:12px 18px;
      background:linear-gradient(135deg, var(--bg-2) 0%, var(--bg-1) 100%);
      border-bottom:1px solid var(--border-soft);
    ">
      <!-- Date From -->
      <div style="display:flex;flex-direction:column;gap:4px;">
        <label style="font-size:10px;color:var(--text-2);font-weight:700;">📅 من تاريخ</label>
        <input type="date" id="ledger-from" class="input" style="padding:5px 8px;font-size:11.5px;width:130px;border-radius:6px;" value="${filterDateFrom || ''}" />
      </div>

      <!-- Date To -->
      <div style="display:flex;flex-direction:column;gap:4px;">
        <label style="font-size:10px;color:var(--text-2);font-weight:700;">📅 إلى تاريخ</label>
        <input type="date" id="ledger-to" class="input" style="padding:5px 8px;font-size:11.5px;width:130px;border-radius:6px;" value="${filterDateTo || ''}" />
      </div>

      <!-- Warehouse -->
      <div style="display:flex;flex-direction:column;gap:4px;">
        <label style="font-size:10px;color:var(--text-2);font-weight:700;">🏭 المستودع / السيارة</label>
        <select id="ledger-warehouse" class="input" style="padding:5px 8px;font-size:11.5px;min-width:160px;border-radius:6px;">
          <option value="">🏢 كل المستودعات والسيارات</option>
          ${warehouseOptions}
        </select>
      </div>

      <!-- Movement Type -->
      <div style="display:flex;flex-direction:column;gap:4px;">
        <label style="font-size:10px;color:var(--text-2);font-weight:700;">🔄 نوع الحركة</label>
        <select id="ledger-type" class="input" style="padding:5px 8px;font-size:11.5px;min-width:145px;border-radius:6px;">
          <option value="">كل الحركات</option>
          <option value="purchase_invoice" ${filterType==='purchase_invoice'?'selected':''}>🛒 مشتريات واردة</option>
          <option value="sales_invoice" ${filterType==='sales_invoice'?'selected':''}>💰 مبيعات صادرة</option>
          <option value="transfer_in" ${filterType==='transfer_in'?'selected':''}>📥 تحويلات واردة</option>
          <option value="transfer_out" ${filterType==='transfer_out'?'selected':''}>📤 تحويلات صادرة</option>
          <option value="adjustment" ${filterType==='adjustment'?'selected':''}>⚖️ تسويات جردية</option>
        </select>
      </div>

      <!-- Sorting Toggle -->
      <div style="display:flex;flex-direction:column;gap:4px;">
        <label style="font-size:10px;color:var(--text-2);font-weight:700;">↕️ الترتيب</label>
        <div style="display:flex;gap:4px;">
          <button type="button" class="btn btn-sm ${cachedLedgerSort==='desc'?'btn-primary':'btn-secondary'}" style="padding:4px 9px;font-size:11px;border-radius:6px;" onclick="window.toggleProductModalSort('desc')" title="عرض أحدث العمليات في البداية">⬆️ الأحدث</button>
          <button type="button" class="btn btn-sm ${cachedLedgerSort==='asc'?'btn-primary':'btn-secondary'}" style="padding:4px 9px;font-size:11px;border-radius:6px;" onclick="window.toggleProductModalSort('asc')" title="عرض تسلسلي دفتري من البداية">⬇️ الأقدم</button>
        </div>
      </div>

      <!-- Simplified Checkbox -->
      <div style="display:inline-flex; align-items:center; gap:6px; padding-bottom:5px;">
        <input type="checkbox" id="ledger-simplified" style="width:16px; height:16px; cursor:pointer;" ${filterSimplified ? 'checked' : ''} onchange="_applyLedgerFilters()" />
        <label for="ledger-simplified" style="font-size:11px; font-weight:700; color:var(--text-1); cursor:pointer;">📊 تحميل وبيع فقط</label>
      </div>

      <!-- Action Buttons -->
      <div style="display:flex;gap:6px;align-items:flex-end;margin-right:auto;flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" style="padding:6px 14px;font-size:11.5px;border-radius:6px;font-weight:700;" onclick="_applyLedgerFilters()">🔍 تطبيق</button>
        <button class="btn btn-secondary btn-sm" style="padding:6px 10px;font-size:11.5px;border-radius:6px;" onclick="_resetLedgerFilters()">↺ إعادة</button>
        <button class="btn btn-sm" style="padding:6px 12px;font-size:11.5px;border-radius:6px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;border:none;cursor:pointer;font-weight:700;" onclick="window.printCustodyReconciliationFromProductModal()" title="طباعة محضر مطابقة وجرد رسمي للسيارة أو المستودع">📋 محضر العهدة</button>
        <button class="btn btn-sm" style="padding:6px 10px;font-size:11.5px;border-radius:6px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;border:none;cursor:pointer;font-weight:700;" onclick="_exportLedgerExcel()">📊 Excel</button>
        <button class="btn btn-sm" style="padding:6px 10px;font-size:11.5px;border-radius:6px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;border:none;cursor:pointer;font-weight:700;" onclick="_exportLedgerPdf()">📄 PDF</button>
      </div>
    </div>`;

  // ── 3. Canonical Running Balance Calculation ────────────────────────────────
  const getDateStr = (t) => {
    if (t.date) return String(t.date).slice(0, 10);
    let secs = t.createdAt?.seconds || t.createdAt?._seconds;
    if (secs) return new Date(secs * 1000).toISOString().slice(0, 10);
    if (t.createdAt?.toDate) return t.createdAt.toDate().toISOString().slice(0, 10);
    if (typeof t.createdAt === "string") return t.createdAt.slice(0, 10);
    return "2026-08-01";
  };

  const getTxTypePriority = (type) => {
    if (type === "opening" || type === "purchase_in" || type === "purchase_invoice") return 1;
    if (type === "sales_return" || type === "return_in") return 2;
    if (type === "transfer_in" || type === "adjustment_in") return 3;
    if (type === "sale_out" || type === "sales_invoice" || type === "pos_sale" || type === "pos_out") return 4;
    if (type === "transfer_out") return 5;
    if (type === "adjustment_out" || type === "damage" || type === "expired") return 6;
    return 7;
  };

  // Sort chronological (oldest first) to compute running balances
  let allTxs = [...cachedStockTxs].sort((a, b) => {
    const dA = getDateStr(a);
    const dB = getDateStr(b);
    if (dA !== dB) return dA.localeCompare(dB);
    const priDiff = getTxTypePriority(a.type) - getTxTypePriority(b.type);
    if (priDiff !== 0) return priDiff;
    const secA = a.createdAt?.seconds || a.createdAt?._seconds || (a.createdAt?.toMillis ? a.createdAt.toMillis() / 1000 : 0);
    const secB = b.createdAt?.seconds || b.createdAt?._seconds || (b.createdAt?.toMillis ? b.createdAt.toMillis() / 1000 : 0);
    return secA - secB;
  });

  const whRunningBalances = {};
  warehouses.forEach(w => { whRunningBalances[w.id] = 0; });
  let companyRunningBal = 0;

  let periodIn = 0;
  let periodOut = 0;
  let openingBal = 0;

  const txsCalculated = [];

  for (let i = 0; i < allTxs.length; i++) {
    const t = allTxs[i];
    const wid = t.warehouseId || "main";
    const dateStr = getDateStr(t);
    const isBeforePeriod = filterDateFrom && dateStr < filterDateFrom;

    const tType = t.type || "";
    const isPur = ["purchase_invoice", "purchase_in", "purchase_return", "sales_return", "return_in"].includes(tType);
    const isSale = ["sales_invoice", "sale_out", "pos_sale", "pos_out", "sale_cancel", "cancel_sale"].includes(tType);
    const isTrans = ["transfer_out", "transfer_in", "transfer_cancel"].includes(tType);
    const isAdj = ["adjustment", "damage", "assembly", "disassembly", "opening", "adjustment_in", "adjustment_out", "spot-count"].includes(tType);

    // Document number
    let docNum = t.docNum || t.documentNumber || t.refNo || t.refCode || t.invoiceNumber || t.number || "";
    if (!docNum && t.notes) {
      const m = t.notes.match(/(REP-\d+|INV-\d+|TR-[A-Z0-9]+|PUR-\d+)/i);
      if (m) docNum = m[0];
    }
    if (!docNum) docNum = "—";

    // Party Name (Customer, Supplier, or Transfer Route)
    let partyName = t.partyName || cachedPartyMap.get(docNum) || cachedPartyMap.get(t.id) || "";
    if (!partyName && isTrans) {
      partyName = "🔄 تحويل بين المخازن";
    }

    // Extraction of qtyChange
    let qtyChange = t.qtyChange;
    if (qtyChange === undefined || qtyChange === null || isNaN(qtyChange)) {
      const rawQ = Number(t.qty || t.quantity || t.qtyIn || t.qtyOut || 0);
      const isOut = (tType === "sale_out" || tType === "sales_invoice" || tType === "transfer_out" || tType === "adjustment_out" || tType === "damage" || tType === "expired");
      qtyChange = isOut ? -Math.abs(rawQ) : Math.abs(rawQ);
    } else {
      qtyChange = Number(qtyChange);
    }

    // Reversal artifact check (reconcile old edit cancellation artifacts on active invoices)
    const isReversalArtifact = (tType === "sale_cancel" || tType === "cancel_sale") && 
      (String(t.notes || "").includes("إرجاع كمية التعديل") || String(t.notes || "").includes("تعديل"));
    
    let isIgnoredReversal = false;
    if (isReversalArtifact) {
      const invMeta = cachedDocMetaMap.get(docNum) || cachedDocMetaMap.get(t.id);
      if (invMeta && invMeta.status !== "cancelled") {
        isIgnoredReversal = true;
        qtyChange = 0;
      }
    }

    whRunningBalances[wid] = (whRunningBalances[wid] || 0) + qtyChange;
    if (!isTrans) {
      companyRunningBal += qtyChange;
    }

    const currentBal = filterWarehouse ? (whRunningBalances[filterWarehouse] || 0) : companyRunningBal;

    if (isBeforePeriod) {
      if (!filterWarehouse || filterWarehouse === wid) {
        openingBal = currentBal;
      }
      continue;
    }

    if (filterDateTo && dateStr > filterDateTo) continue;
    if (filterWarehouse && wid !== filterWarehouse) continue;
    if (filterSimplified && !isTrans && !isSale) continue;

    let inQty = 0;
    let outQty = 0;
    if (!filterWarehouse && isTrans) {
      inQty = qtyChange > 0 ? qtyChange : 0;
      outQty = qtyChange < 0 ? Math.abs(qtyChange) : 0;
    } else if (isIgnoredReversal) {
      inQty = 0;
      outQty = 0;
    } else {
      inQty = qtyChange > 0 ? qtyChange : 0;
      outQty = qtyChange < 0 ? Math.abs(qtyChange) : 0;
    }

    if (inQty) periodIn += inQty;
    if (outQty) periodOut += outQty;

    if (filterType === "sales_invoice" && !isSale) continue;
    if (filterType === "purchase_invoice" && !isPur) continue;
    if (filterType === "transfer_in" && tType !== "transfer_in") continue;
    if (filterType === "transfer_out" && tType !== "transfer_out") continue;
    if (filterType === "adjustment" && !isAdj) continue;

    const whName = warehouseMap[wid] || wid || "—";

    txsCalculated.push({
      ...t,
      dateStr,
      documentNumber: docNum,
      partyName,
      whName,
      inQty,
      outQty,
      qtyChange,
      balanceAfter: currentBal,
      whBalance: whRunningBalances[wid],
      companyBalance: companyRunningBal,
      isIgnoredReversal,
      isPur,
      isSale,
      isTrans,
      isAdj
    });
  }

  // Active Live Stock vs Running Balance
  const activeBalance = filterWarehouse 
    ? parseFloat(cachedStockBalances.find(s => s.warehouseId === filterWarehouse)?.qty || 0)
    : totalStockAllWh;

  const finalRunningBal = filterWarehouse 
    ? (whRunningBalances[filterWarehouse] || 0)
    : companyRunningBal;

  const isMatch = Math.abs(finalRunningBal - activeBalance) < 0.001;

  currentLedgerCalculated = txsCalculated;

  // ── 4. Summary KPI Cards ───────────────────────────────────────────────────
  const kpiHtml = `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:10px; padding:12px 18px 4px 18px;">
      <!-- Opening Balance -->
      <div style="background:var(--bg-card); border:1px solid var(--border-soft); border-radius:10px; padding:10px 14px; position:relative; overflow:hidden;">
        <div style="position:absolute; top:0; right:0; left:0; height:3px; background:#64748B;"></div>
        <div style="font-size:10.5px; color:var(--text-2); font-weight:700;">رصيد أول المدة 📅</div>
        <div class="mono font-bold" style="font-size:18px; color:var(--text-0); margin-top:2px;">${formatQuantity(openingBal)}</div>
        <div style="font-size:9.5px; color:var(--text-2);">${filterDateFrom ? 'في ' + filterDateFrom : 'بداية الحركات (صفر)'}</div>
      </div>

      <!-- Total In -->
      <div style="background:var(--bg-card); border:1px solid var(--border-soft); border-radius:10px; padding:10px 14px; position:relative; overflow:hidden;">
        <div style="position:absolute; top:0; right:0; left:0; height:3px; background:#10B981;"></div>
        <div style="font-size:10.5px; color:var(--text-2); font-weight:700;">إجمالي الوارد 📥</div>
        <div class="mono font-bold text-good" style="font-size:18px; margin-top:2px;">+${formatQuantity(periodIn)}</div>
        <div style="font-size:9.5px; color:var(--text-2);">${filterWarehouse ? 'شحنات مستلمة' : 'مشتريات ومرتجعات'}</div>
      </div>

      <!-- Total Out -->
      <div style="background:var(--bg-card); border:1px solid var(--border-soft); border-radius:10px; padding:10px 14px; position:relative; overflow:hidden;">
        <div style="position:absolute; top:0; right:0; left:0; height:3px; background:#EF4444;"></div>
        <div style="font-size:10.5px; color:var(--text-2); font-weight:700;">إجمالي الصادر 📤</div>
        <div class="mono font-bold text-bad" style="font-size:18px; margin-top:2px;">-${formatQuantity(periodOut)}</div>
        <div style="font-size:9.5px; color:var(--text-2);">${filterWarehouse ? 'مبيعات مسلمة' : 'مبيعات وهالك'}</div>
      </div>

      <!-- Current Stock -->
      <div style="background:rgba(16,185,129,0.04); border:1px solid rgba(16,185,129,0.25); border-radius:10px; padding:10px 14px; position:relative; overflow:hidden;">
        <div style="position:absolute; top:0; right:0; left:0; height:3px; background:#10B981;"></div>
        <div style="font-size:10.5px; color:#059669; font-weight:800;">الرصيد الفعلي الحالي 📦</div>
        <div class="mono font-bold text-good" style="font-size:19px; margin-top:2px;">${formatQuantity(activeBalance)} ${unitStr}</div>
        <div style="font-size:9.5px; color:var(--text-2);">${filterWarehouse ? 'بالمستودع المحدد' : 'شامل المؤسسة والسيارات'}</div>
      </div>
    </div>
  `;

  // ── 5. Audit Alert Banner ──────────────────────────────────────────────────
  const auditAlertHtml = isMatch
    ? `<div style="margin:8px 18px; padding:8px 14px; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.3); border-radius:8px; color:#059669; font-size:12px; font-weight:700; display:flex; align-items:center; gap:8px;">
        <span>✅</span>
        <span><b>تدقيق مطابق 100%:</b> الرصيد التراكمي لدفتر الأستاذ (${formatQuantity(finalRunningBal)}) يطابق تماماً الرصيد الفعلي في المستودع (${formatQuantity(activeBalance)} ${unitStr}). لا يوجد أي عجز أو تضارب دفتري.</span>
      </div>`
    : `<div style="margin:8px 18px; padding:8px 14px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.3); border-radius:8px; color:#DC2626; font-size:12px; font-weight:700; display:flex; align-items:center; gap:8px;">
        <span>⚠️</span>
        <span><b>تنبيه تدقيق:</b> رصيد الدفتر التراكمي (${formatQuantity(finalRunningBal)}) والرصيد المسجل بالمستودع (${formatQuantity(activeBalance)} ${unitStr}). الفارق: ${formatQuantity(finalRunningBal - activeBalance)}.</span>
      </div>`;

  // ── 6. Display List based on sort order ────────────────────────────────────
  const displayTxs = cachedLedgerSort === "desc" 
    ? [...txsCalculated].reverse() 
    : [...txsCalculated];

  const tableHtml = displayTxs.length === 0
    ? `<div class="empty-state" style="padding:40px;"><div class="empty-icon">🔍</div><p>لا توجد حركات تطابق الفلاتر المحددة</p></div>`
    : `<div style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; font-size:12px;">
        <thead>
          <tr style="background:var(--bg-2); position:sticky; top:0; z-index:2;">
            <th style="padding:9px 10px; width:35px; text-align:center; font-size:11px; font-weight:700; color:var(--text-2); border-bottom:2px solid var(--border-soft);">#</th>
            <th style="padding:9px 12px; text-align:right; font-size:11px; font-weight:700; color:var(--text-2); border-bottom:2px solid var(--border-soft); white-space:nowrap;">📅 التاريخ</th>
            <th style="padding:9px 12px; text-align:center; font-size:11px; font-weight:700; color:var(--text-2); border-bottom:2px solid var(--border-soft);">نوع الحركة</th>
            <th style="padding:9px 12px; text-align:right; font-size:11px; font-weight:700; color:var(--text-2); border-bottom:2px solid var(--border-soft);">رقم المستند</th>
            <th style="padding:9px 12px; text-align:right; font-size:11px; font-weight:700; color:var(--text-2); border-bottom:2px solid var(--border-soft);">👤 الطرف الثاني (العميل / المورد / المسار)</th>
            <th style="padding:9px 12px; text-align:right; font-size:11px; font-weight:700; color:var(--text-2); border-bottom:2px solid var(--border-soft);">المخزن / الموقع</th>
            <th style="padding:9px 10px; text-align:center; font-size:11px; font-weight:700; color:#10B981; border-bottom:2px solid var(--border-soft);">وارد (+)</th>
            <th style="padding:9px 10px; text-align:center; font-size:11px; font-weight:700; color:#EF4444; border-bottom:2px solid var(--border-soft);">صادر (-)</th>
            <th style="padding:9px 12px; text-align:center; font-size:11px; font-weight:700; color:var(--brand); border-bottom:2px solid var(--border-soft);">الرصيد بعد 📦</th>
            <th style="padding:9px 12px; text-align:right; font-size:11px; font-weight:700; color:var(--text-2); border-bottom:2px solid var(--border-soft);">البيان والملاحظات</th>
          </tr>
        </thead>
        <tbody>
          ${displayTxs.map((t, idx) => {
            const rawType = t.type || t.refType || "adjustment";
            const labelText = typeLabels[rawType] || rawType;
            const icon = typeIcons[rawType] || "📋";
            const rowBg = idx % 2 === 0 ? 'var(--bg-1)' : 'var(--bg-2)';
            
            const isIn = t.inQty > 0;
            const inBadge = isIn
              ? `<span style="background:rgba(16,185,129,.12);color:#10B981;font-weight:800;padding:2px 8px;border-radius:6px;font-size:11.5px;">+${formatQuantity(t.inQty)}</span>`
              : `<span style="color:var(--text-3);">—</span>`;
            const outBadge = !isIn && t.outQty > 0
              ? `<span style="background:rgba(239,68,68,.1);color:#EF4444;font-weight:800;padding:2px 8px;border-radius:6px;font-size:11.5px;">-${formatQuantity(t.outQty)}</span>`
              : `<span style="color:var(--text-3);">—</span>`;

            // Balance Display: show clean running balance
            let balHtml = "";
            if (filterWarehouse) {
              balHtml = `<span style="font-weight:800; color:var(--brand); font-family:var(--font-mono); font-size:12.5px;">${formatQuantity(t.balanceAfter)}</span>`;
            } else {
              balHtml = `
                <div style="font-weight:800; color:var(--brand); font-family:var(--font-mono); font-size:12.5px;">${formatQuantity(t.companyBalance)}</div>
                <div style="font-size:9.5px; color:var(--text-3); font-family:var(--font-mono);">مخزن: ${formatQuantity(t.whBalance)}</div>
              `;
            }

            // Party HTML with distinctive icons & colors
            let partyHtml = `<span style="color:var(--text-3);">—</span>`;
            if (t.partyName) {
              let pColor = "#475569";
              let pIcon = "👤";
              if (t.isSale) { pColor = "#0284c7"; pIcon = "👤"; }
              else if (t.isPur) { pColor = "#d97706"; pIcon = "🏭"; }
              else if (t.isTrans) { pColor = "#6366f1"; pIcon = "🔄"; }
              
              partyHtml = `
                <span style="display:inline-flex; align-items:center; gap:5px; font-weight:700; color:${pColor}; font-size:12px;">
                  <span>${pIcon}</span>
                  <span>${t.partyName}</span>
                </span>
              `;
            }

            // Commercial note
            let noteStr = t.notes || t.note || t.description || "";
            if (t.isIgnoredReversal) {
              noteStr = "[حركة تعديل محاسبي دفتري — مسجلة لأغراض التدقيق بدون خصم مادي]";
            } else if (!noteStr) {
              if (t.isSale) noteStr = `فاتورة بيع للعميل: ${t.partyName || 'نقدي'}`;
              else if (t.isPur) noteStr = `توريد مشتريات من المورد: ${t.partyName || 'معتمد'}`;
              else if (t.isTrans) noteStr = `تحويل بضاعة: ${t.partyName || 'بين المستودعات'}`;
              else noteStr = "—";
            }

            return `
              <tr style="background:${rowBg}; border-bottom:1px solid var(--border-soft); transition:background .15s;"
                onmouseover="this.style.background='rgba(91,127,255,.06)'"
                onmouseout="this.style.background='${rowBg}'">
                <td style="padding:8px 10px; text-align:center; color:var(--text-3); font-family:var(--font-mono); font-size:11px;">${idx + 1}</td>
                <td style="padding:8px 12px; white-space:nowrap; color:var(--text-2); font-family:var(--font-mono); font-size:11.5px;">${t.dateStr}</td>
                <td style="padding:8px 12px; white-space:nowrap; text-align:center;">
                  <span style="
                    display:inline-flex; align-items:center; gap:4px;
                    background:${isIn ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.08)'};
                    color:${isIn ? '#059669' : '#DC2626'};
                    padding:2px 8px; border-radius:12px; font-size:11px; font-weight:700;
                  ">${icon} ${labelText}</span>
                </td>
                <td style="padding:8px 12px; font-family:var(--font-mono); font-weight:700; color:var(--brand); font-size:12px;">${t.documentNumber || "—"}</td>
                <td style="padding:8px 12px; white-space:nowrap;">${partyHtml}</td>
                <td style="padding:8px 12px; font-size:11.5px; color:var(--text-1);">${t.whName}</td>
                <td style="padding:8px 10px; text-align:center;">${inBadge}</td>
                <td style="padding:8px 10px; text-align:center;">${outBadge}</td>
                <td style="padding:8px 12px; text-align:center;">${balHtml}</td>
                <td style="padding:8px 12px; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--text-2); font-size:11.5px;"
                  title="${noteStr.replace(/"/g, '&quot;')}">${noteStr}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>`;

  body.innerHTML = filterBarHtml + kpiHtml + auditAlertHtml + tableHtml;
}

// ── Toggle Sort Order in Modal ───────────────────────────────────────────────
window.toggleProductModalSort = (dir) => {
  cachedLedgerSort = dir;
  _applyLedgerFilters();
};

window._applyLedgerFilters = () => {
  const from = document.getElementById("ledger-from")?.value      || "";
  const to   = document.getElementById("ledger-to")?.value        || "";
  const type = document.getElementById("ledger-type")?.value      || "";
  const wh   = document.getElementById("ledger-warehouse")?.value || "";
  const simp = document.getElementById("ledger-simplified")?.checked || false;
  renderItemLedgerCard(from, to, type, wh, simp);
};

window._resetLedgerFilters = () => {
  renderItemLedgerCard("", "", "", "", false);
};

// ── Export to Excel ──────────────────────────────────────────────────────────
window._exportLedgerExcel = async () => {
  try {
    if (!currentLedgerCalculated || currentLedgerCalculated.length === 0) {
      showToast("لا توجد بيانات للتصدير", "warning"); return;
    }
    const headers = ["م", "التاريخ", "نوع الحركة", "رقم المستند", "الطرف الثاني (العميل / المورد / المسار)", "المستودع", "وارد (+)", "صادر (-)", "الرصيد بعد", "البيان والملاحظات"];
    const colWidths = [6, 12, 16, 16, 25, 18, 10, 10, 12, 35];
    const rows = currentLedgerCalculated.map((t, idx) => [
      idx + 1,
      t.dateStr,
      t.type || "حركة",
      t.documentNumber || "—",
      t.partyName || "—",
      t.whName || "—",
      t.inQty || "—",
      t.outQty || "—",
      t.balanceAfter !== undefined ? t.balanceAfter : 0,
      t.notes || t.note || t.description || "—"
    ]);

    const title = `دفتر_حركة_${currentProductName || "الصنف"}_${new Date().toISOString().slice(0,10)}`;
    await exportToExcel({ title, headers, rows, colWidths });
    showToast("تم تصدير Excel بنجاح ✅", "success");
  } catch (err) {
    showToast("خطأ في التصدير: " + err.message, "error");
  }
};

// ── Export to PDF ────────────────────────────────────────────────────────────
window._exportLedgerPdf = () => {
  if (!currentLedgerCalculated || currentLedgerCalculated.length === 0) {
    showToast("لا توجد بيانات للتصدير", "warning"); return;
  }

  const dateRange = (() => {
    const from = document.getElementById("ledger-from")?.value || "";
    const to   = document.getElementById("ledger-to")?.value   || "";
    if (from && to) return `من ${from} إلى ${to}`;
    if (from) return `من ${from}`;
    if (to)   return `حتى ${to}`;
    return "كل الفترات";
  })();

  const rows = currentLedgerCalculated.map((t, i) => {
    const isIn = t.inQty > 0;
    return `<tr style="background:${i%2===0?'#fff':'#f8fafc'}">
      <td style="text-align:center;">${i+1}</td>
      <td>${t.dateStr}</td>
      <td><span style="background:${isIn?'#dcfce7':'#fee2e2'};color:${isIn?'#166534':'#991b1b'};padding:2px 6px;border-radius:10px;font-size:10px;">${t.type||""}</span></td>
      <td style="font-weight:700;color:#1e3a8a;">${t.documentNumber||"—"}</td>
      <td style="font-weight:700;">${t.partyName||"—"}</td>
      <td>${t.whName||"—"}</td>
      <td style="color:#16a34a;font-weight:700;text-align:center;">${t.inQty ? "+"+formatQuantity(t.inQty) : "—"}</td>
      <td style="color:#dc2626;font-weight:700;text-align:center;">${t.outQty ? "-"+formatQuantity(t.outQty) : "—"}</td>
      <td style="font-weight:700;color:#1d4ed8;text-align:center;">${formatQuantity(t.balanceAfter||0)}</td>
      <td style="color:#64748b;font-size:10.5px;">${t.notes||t.note||t.description||"—"}</td>
    </tr>`;
  }).join("");

  const printWin = window.open("", "_blank", "width=1100,height=750");
  printWin.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head>
    <meta charset="UTF-8">
    <title>دفتر حركة - ${currentProductName||""}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=IBM+Plex+Mono:wght@500;700&display=swap');
      * { box-sizing:border-box; margin:0; padding:0; }
      body { font-family:'Cairo',sans-serif; direction:rtl; background:#fff; color:#1e293b; padding:15px; font-size:11px; }
      .mono { font-family:'IBM Plex Mono', monospace; }
      .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; padding-bottom:10px; border-bottom:2.5px solid #1e3a8a; }
      .logo-title h1 { font-size:18px; font-weight:800; color:#1e3a8a; }
      .logo-title p  { font-size:11px; color:#64748b; margin-top:2px; }
      .meta { text-align:left; font-size:10px; color:#64748b; }
      table { width:100%; border-collapse:collapse; font-size:10.5px; }
      thead tr { background:#1e3a8a; color:#fff; }
      thead th { padding:6px 8px; text-align:right; font-weight:700; white-space:nowrap; }
      tbody td { padding:5px 8px; border-bottom:1px solid #e2e8f0; }
      @media print {
        @page { size:A4 landscape; margin:8mm; }
        button { display:none !important; }
      }
    </style>
  </head><body>
    <div class="header">
      <div class="logo-title">
        <h1>إدهام للمواد الغذائية</h1>
        <p>دفتر حركة تفصيلي: <strong>${currentProductName||""}</strong></p>
      </div>
      <div class="meta">
        <strong>الفترة: ${dateRange}</strong>
        <div>تاريخ الطباعة: ${new Date().toLocaleString("ar-SA")}</div>
      </div>
    </div>
    <table>
      <thead><tr>
        <th style="width:25px;">#</th>
        <th>التاريخ</th><th>نوع الحركة</th><th>رقم المستند</th><th>الطرف الثاني</th><th>المستودع</th>
        <th style="text-align:center;">وارد (+)</th><th style="text-align:center;">صادر (-)</th>
        <th style="text-align:center;">الرصيد بعد</th><th>البيان والملاحظات</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="margin-top:20px;text-align:center;">
      <button onclick="window.print()" style="padding:8px 24px;background:#1e3a8a;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;">🖨️ طباعة / حفظ PDF</button>
    </div>
  </body></html>`);
  printWin.document.close();
  setTimeout(() => printWin.focus(), 300);
};

// ── Official Custody Handover & Reconciliation Printout ──────────────────────
window.printCustodyReconciliationFromProductModal = () => {
  if (!currentProductId) return;
  const prod = allProducts.find(p => p.id === currentProductId) || { name: currentProductName, unit: "كرتون", sku: "—" };
  const whId = document.getElementById("ledger-warehouse")?.value || "";
  const whObj = warehouses.find(w => w.id === whId);
  const whName = whObj?.name || "جميع المستودعات والسيارات";
  
  const inRows = currentLedgerCalculated.filter(t => t.inQty > 0);
  const totalIn = inRows.reduce((sum, t) => sum + (t.inQty || 0), 0);
  const outRows = currentLedgerCalculated.filter(t => t.outQty > 0);
  const totalOut = outRows.reduce((sum, t) => sum + (t.outQty || 0), 0);
  const endingBal = currentLedgerCalculated.length > 0 ? currentLedgerCalculated[currentLedgerCalculated.length - 1].balanceAfter : 0;
  const unitStr = prod.unit || "كرتون";

  const win = window.open("", "_blank", "width=920,height=800");
  win.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>محضر مطابقة وجرد عهدة — ${prod.name || currentProductName} — ${whName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=IBM+Plex+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4 portrait; margin: 8mm; }
    body { font-family:'Cairo',sans-serif; direction:rtl; color:#0f172a; background:#fff; padding:10px; font-size:11px; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
    .mono { font-family:'IBM Plex Mono', monospace; }
    table { width:100%; border-collapse:collapse; margin-bottom:10px; }
    th, td { border:1px solid #cbd5e1; padding:4px 6px; font-size:10.5px; }
    th { background:#f1f5f9; font-weight:800; }
    .header { border-bottom:2px solid #0f3d19; padding-bottom:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; }
    .title-box { text-align:center; flex:1; }
    .kpi-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; margin-bottom:12px; }
    .kpi-box { border:1.5px solid #cbd5e1; border-radius:8px; padding:6px; text-align:center; background:#f8fafc; }
    .kpi-val { font-size:15px; font-weight:900; margin-top:2px; }
    .audit-box { border:2px dashed #0f3d19; border-radius:8px; padding:10px; margin:12px 0; background:#f0fdf4; }
    .signatures { display:flex; justify-content:space-between; margin-top:24px; padding-top:8px; }
    .sig-col { width:30%; text-align:center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h2 style="font-size:15px; font-weight:900; color:#0f3d19;">شركة إدهام للمواد الغذائية</h2>
      <div style="font-size:9.5px; color:#64748b;">إدارة سلاسل الإمداد والمستودعات</div>
    </div>
    <div class="title-box">
      <h1 style="font-size:16px; font-weight:900; color:#0f172a;">محضر مطابقة وجرد عهدة سيارة / مخزن</h1>
      <div style="font-size:10.5px; color:#0f3d19; font-weight:700;">كشف تفريغ حركة الصنف وتدقيق العهدة الميدانية</div>
    </div>
    <div style="text-align:left; font-size:9.5px; color:#64748b;">
      <div>تاريخ الاستخراج: <b>${new Date().toISOString().slice(0,10)}</b></div>
      <div>نظام IDHAM ERP</div>
    </div>
  </div>

  <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:6px 12px; margin-bottom:10px; display:flex; justify-content:space-between; font-size:11px;">
    <div><b>📦 الصنف:</b> <span style="font-weight:900; color:#0f3d19;">${prod.name || currentProductName}</span> (SKU: <span class="mono">${prod.sku || '—'}</span>)</div>
    <div><b>🏢 الموقع / السيارة:</b> <span style="font-weight:900; color:#2563EB;">${whName}</span></div>
    <div><b>الوحدة:</b> <span>${unitStr}</span></div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-box">
      <div style="color:#64748b; font-size:9.5px;">إجمالي الوارد للعهدة 📥</div>
      <div class="kpi-val mono" style="color:#059669;">+${formatQuantity(totalIn)}</div>
    </div>
    <div class="kpi-box">
      <div style="color:#64748b; font-size:9.5px;">إجمالي الصادر / المبيعات 📤</div>
      <div class="kpi-val mono" style="color:#dc2626;">-${formatQuantity(totalOut)}</div>
    </div>
    <div class="kpi-box" style="border-color:#2563EB; background:#eff6ff;">
      <div style="color:#1d4ed8; font-size:9.5px; font-weight:700;">الرصيد الدفتري المطلوب 📦</div>
      <div class="kpi-val mono" style="color:#1d4ed8;">${formatQuantity(endingBal)} ${unitStr}</div>
    </div>
    <div class="kpi-box">
      <div style="color:#64748b; font-size:9.5px;">عدد العمليات الموثقة</div>
      <div class="kpi-val mono">${currentLedgerCalculated.length} حركة</div>
    </div>
  </div>

  <h4 style="font-size:11.5px; font-weight:800; color:#0f3d19; margin-bottom:4px;">1. بيان الشحنات والكميات المستلمة في العهدة (الوارد):</h4>
  <table>
    <thead>
      <tr>
        <th style="width:28px;">#</th>
        <th style="width:70px;">التاريخ</th>
        <th style="width:90px;">رقم السند</th>
        <th>مصدر الشحنة / المسار</th>
        <th style="width:80px; text-align:center;">الكمية المستلمة</th>
        <th style="width:75px; text-align:center;">الحالة</th>
      </tr>
    </thead>
    <tbody>
      ${inRows.map((t, i) => `
        <tr>
          <td style="text-align:center;" class="mono">${i+1}</td>
          <td class="mono">${t.dateStr}</td>
          <td class="mono font-bold">${t.documentNumber || '—'}</td>
          <td>${t.partyName || t.notes || 'استلام شحنة معتمدة'}</td>
          <td style="text-align:center; font-weight:900; color:#059669;" class="mono">+${formatQuantity(t.inQty)}</td>
          <td style="text-align:center; color:#059669; font-size:9.5px; font-weight:700;">مستلم ومؤكد ✅</td>
        </tr>
      `).join("") || '<tr><td colspan="6" style="text-align:center; color:#64748b;">لا توجد حركات وارد مسجلة</td></tr>'}
      <tr style="background:#f1f5f9; font-weight:900;">
        <td colspan="4" style="text-align:right;">إجمالي الكميات المستلمة بالسيارة / المستودع:</td>
        <td style="text-align:center; color:#059669;" class="mono">+${formatQuantity(totalIn)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <h4 style="font-size:11.5px; font-weight:800; color:#0f3d19; margin-bottom:4px; margin-top:8px;">2. بيان المبيعات والتسليمات الموثقة للعملاء (الصادر):</h4>
  <table>
    <thead>
      <tr>
        <th style="width:28px;">#</th>
        <th style="width:70px;">التاريخ</th>
        <th style="width:90px;">رقم الفاتورة</th>
        <th>اسم العميل / المستلم</th>
        <th style="width:80px; text-align:center;">الكمية المباعة</th>
        <th style="width:75px; text-align:center;">حالة الفاتورة</th>
      </tr>
    </thead>
    <tbody>
      ${outRows.map((t, i) => `
        <tr>
          <td style="text-align:center;" class="mono">${i+1}</td>
          <td class="mono">${t.dateStr}</td>
          <td class="mono font-bold">${t.documentNumber || '—'}</td>
          <td><b>${t.partyName || 'عميل نقدي'}</b></td>
          <td style="text-align:center; font-weight:900; color:#dc2626;" class="mono">-${formatQuantity(t.outQty)}</td>
          <td style="text-align:center; font-size:9.5px; color:#1e293b;">مرحلة رسمياً</td>
        </tr>
      `).join("") || '<tr><td colspan="6" style="text-align:center; color:#64748b;">لا توجد حركات مبيعات مسجلة</td></tr>'}
      <tr style="background:#f1f5f9; font-weight:900;">
        <td colspan="4" style="text-align:right;">إجمالي الكميات المباعة والمسلمة للعملاء:</td>
        <td style="text-align:center; color:#dc2626;" class="mono">-${formatQuantity(totalOut)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <!-- Physical Audit & Handover Box -->
  <div class="audit-box">
    <div style="font-size:11.5px; font-weight:900; color:#0f3d19; margin-bottom:4px;">📋 نتيجة الجرد الميداني للسيارة / المستودع:</div>
    <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; flex-wrap:wrap; gap:10px;">
      <div>الرصيد الدفتري المطلوب وجوده: <b class="mono" style="font-size:12.5px; color:#1e3a8a;">${formatQuantity(endingBal)} ${unitStr}</b></div>
      <div>الرصيد الفعلي الموجود بالسيارة الآن: <b style="border-bottom:1.5px solid #000; display:inline-block; width:70px; text-align:center;">&nbsp;</b> ${unitStr}</div>
      <div>الفارق (عجز / زيادة): <b style="border-bottom:1.5px solid #000; display:inline-block; width:70px; text-align:center;">&nbsp;</b> ${unitStr}</div>
    </div>
  </div>

  <div class="signatures">
    <div class="sig-col">
      <div style="font-weight:700;">المندوب / المسؤول عن العهدة</div>
      <div style="margin-top:22px; border-top:1px dashed #94a3b8; padding-top:4px;">التوقيع: ___________________</div>
    </div>
    <div class="sig-col">
      <div style="font-weight:700;">أمين المستودع العام / الجارد</div>
      <div style="margin-top:22px; border-top:1px dashed #94a3b8; padding-top:4px;">التوقيع: ___________________</div>
    </div>
    <div class="sig-col">
      <div style="font-weight:700;">اعتماد الإدارة والتدقيق المالي</div>
      <div style="margin-top:22px; border-top:1px dashed #94a3b8; padding-top:4px;">الختم: ___________________</div>
    </div>
  </div>

  <div style="text-align:center; font-size:8px; color:#94a3b8; margin-top:16px;">
    وثيقة رسمية صادرة من نظام إدهام لإدارة الموارد — IDHAM ERP SCM • صالحة للتدقيق والمطابقة القانونية
  </div>
</body>
</html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); win.close(); }, 700);
};

// ── Reconcile Product Stock Action ───────────────────────────────────────────
window.reconcileProductStock = async (productId, btn) => {
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `⏳ جارٍ التدقيق…`;
  }
  try {
    cachedStockTxs = [];
    cachedStockBalances = [];
    await switchStockTab("card");
    showToast("تم تدقيق ومطابقة حركات الصنف بنجاح ✅", "success");
  } catch (err) {
    showToast("فشل التدقيق: " + err.message, "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `⚖️ تدقيق ومطابقة الرصيد`;
    }
  }
};


window.viewStock = async (productId, productName = null) => {
  currentProductId = productId;
  if (!productName) {
    const prod = allProducts.find(p => p.id === productId);
    productName = prod ? (prod.name || prod.nameAr || "") : "";
  }
  currentProductName = productName;
  cachedStockBalances = [];
  cachedStockTxs = [];
  cachedBatches = [];

  document.getElementById("stock-modal-title").textContent = `بطاقة الصنف: ${productName}`;
  const body = document.getElementById("stock-modal-body");
  body.innerHTML = `<div class="page-loading" style="min-height:80px;"><div class="loading-spinner"></div></div>`;
  openModal("stock-modal");

  try {
    cachedStockBalances = await getStockForProduct(productId);
    renderStockBalances();
  } catch (err) {
    body.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
};

window.setupProductSearch = () => {
  const input = document.getElementById("prod-search");
  if (!input) return;
  input.addEventListener("input", debounce(() => loadProducts(true), 400));
};

window.exportProducts = async () => {
  showToast("جارٍ تصدير البيانات…", "info");
  try {
    const all = await getAll(COLS.products(), [orderBy("sku")]);
    const rows = [["الكود", "الاسم", "الاسم الإنجليزي", "الفئة", "التتبع", "الوحدة", "درجة حرارة الحفظ", "سعر التكلفة", "سعر البيع", "الباركود"]];
    all.forEach(p => rows.push([
      p.sku, p.name, p.nameEn||"", p.categoryName||p.category, p.tracking, p.unit, p.storageTemperature, p.costPrice, p.salePrice, p.barcode
    ]));

    const csv = rows.map(r => r.map(v => `"${v||""}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `products_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    showToast("تم تصدير الملف بنجاح", "success");
  } catch (err) { showToast(err.message, "error"); }
};

window.loadNextPage = () => { currentPage++; loadProducts(); };
window.loadPrevPage = () => { if (currentPage > 0) { currentPage--; lastDocSnapshot = null; loadProducts(); }};

window.printProductBarcode = async (id) => {
  try {
    const { getById } = await import("../utils/db.js");
    const prod = await getById("products", id);
    if (!prod) return;

    const barcodeVal = prod.barcode || prod.sku;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
      <head>
        <title>طباعة باركود: ${prod.name}</title>
        <style>
          body { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; font-family: sans-serif; text-align: center; }
          .barcode-card { border: 1px solid #ccc; padding: 20px; border-radius: 8px; width: 280px; }
          h4 { margin: 0 0 10px 0; }
          svg { margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="barcode-card">
          <h4>إدهام للمواد الغذائية</h4>
          <div style="font-size:12px; font-weight:bold;">${prod.name}</div>
          <div style="font-size:11px; color:#555; margin-top:4px;">السعر: ${prod.salePrice} ر.س</div>
          <svg id="barcode-svg"></svg>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
        <script>
          JsBarcode("#barcode-svg", "${barcodeVal}", {
            format: "CODE128",
            width: 2,
            height: 80,
            displayValue: true
          });
          setTimeout(() => { window.print(); window.close(); }, 500);
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  } catch (err) {
    showToast(err.message, "error");
  }
};

// ============================================================
// EXCEL EXPORT — Full Products Catalog
// ============================================================
window.exportProductsExcel = async () => {
  try {
    const all = allProducts.length > 0 ? allProducts : await getAll(COLS.products(), [orderBy('name')]);
    showToast('جاري تجهيز ملف Excel…', 'info');
    const rows = all.map(p => [
      p.sku || '',
      p.name || p.nameAr || '',
      p.nameEn || '',
      p.barcode || '',
      p.categoryName || '',
      p.unit || '',
      p.altUnit || '',
      p.unitFactor || 1,
      p.costPrice || 0,
      p.salePrice || 0,
      p.priceWholesale || 0,
      p.taxCategory === 'S' ? 15 : 0,
      p.reorderLevel || 0,
      p.tracking || 'none',
      p.totalQty || 0,
      p.active === false ? 'غير نشط' : 'نشط',
      p.notes || '',
    ]);
    await exportToExcel({
      title: 'كتالوج_الأصناف',
      headers: [
        'كود الصنف (SKU)*', 'الاسم العربي*', 'الاسم الإنجليزي', 'الباركود',
        'الفئة', 'وحدة البيع', 'الوحدة الكبرى', 'معامل التحويل',
        'سعر التكلفة', 'سعر البيع', 'سعر الجملة', 'ضريبة القيمة المضافة %',
        'حد إعادة الطلب', 'نظام التتبع', 'المخزون الحالي',
        'الحالة', 'ملاحظات'
      ],
      rows,
      colWidths: [16, 28, 24, 16, 18, 10, 12, 12, 14, 14, 14, 10, 12, 12, 14, 10, 22],
    });
    showToast(`تم تصدير ${rows.length} صنف بنجاح ✅`, 'success');
  } catch (err) {
    showToast('خطأ في التصدير: ' + err.message, 'error');
  }
};

// ─── Download Import Template ─────────────────────────────
window.downloadProductTemplate = async () => {
  try {
    await downloadTemplate({
      title: 'الأصناف',
      headers: [
        'كود الصنف (SKU)*', 'الاسم العربي*', 'الاسم الإنجليزي', 'الباركود',
        'اسم الفئة', 'وحدة البيع', 'الوحدة الكبرى', 'معامل التحويل',
        'سعر التكلفة*', 'سعر البيع*', 'سعر الجملة', 'ضريبة (S أو E)',
        'حد إعادة الطلب', 'نظام التتبع (none/batch/serial)',
      ],
      sampleRows: [
        ['P001', 'زيت نخيل', 'Palm Oil', '6281234567890', 'زيوت', 'لتر', 'كرتون', 12, 18.5, 25.0, 22.0, 'S', 50, 'none'],
        ['P002', 'سكر أبيض', 'White Sugar', '6281234567891', 'سلع أساسية', 'كيلو', 'كيس', 50, 3.0, 4.5, 4.0, 'S', 100, 'none'],
      ],
      colWidths: [16, 28, 24, 16, 18, 10, 12, 12, 14, 14, 14, 10, 12, 22],
    });
    showToast('تم تنزيل نموذج الاستيراد ✅', 'success');
  } catch (err) {
    showToast('خطأ: ' + err.message, 'error');
  }
};

// ─── Import Modal ────────────────────────────────────────
window.openProductImportModal = () => {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.id = 'prod-import-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:740px;width:95%;max-height:92vh;display:flex;flex-direction:column;">
      <div class="modal-header">
        <h3 class="modal-title">📤 استيراد الأصناف من Excel</h3>
        <button class="modal-close" onclick="document.getElementById('prod-import-overlay').remove()">×</button>
      </div>
      <div class="modal-body" style="flex:1;overflow-y:auto;">
        <!-- Step 1: Upload -->
        <div id="import-step-1">
          <div style="background:var(--bg-2);border-radius:12px;padding:20px;margin-bottom:16px;">
            <div style="display:flex;gap:12px;align-items:flex-start;">
              <span style="font-size:28px;">💡</span>
              <div>
                <div style="font-weight:700;margin-bottom:4px;">تعليمات الاستيراد</div>
                <ul style="font-size:12px;color:var(--text-2);margin:0;padding-right:16px;line-height:1.8;">
                  <li>قم بتنزيل نموذج Excel أولاً عبر زر <strong>نموذج الاستيراد</strong></li>
                  <li>الأعمدة المميزة بـ (*) إلزامية</li>
                  <li>لا تغيّر أسماء الأعمدة في الصف الأول</li>
                  <li>الحد الأقصى <strong>5,000 صنف</strong> في الاستيراد الواحد</li>
                  <li>الأصناف ذات كود (SKU) موجود مسبقاً ستُحدَّث، والجديدة ستُضاف</li>
                </ul>
              </div>
            </div>
          </div>
          <div id="import-drop-zone" style="border:2px dashed var(--border-soft);border-radius:12px;padding:40px;text-align:center;cursor:pointer;transition:all 0.2s;background:var(--bg-1);"
            onclick="document.getElementById('import-file-input').click()"
            ondragover="event.preventDefault();this.style.borderColor='var(--brand)';this.style.background='rgba(91,127,255,0.05)';"
            ondragleave="this.style.borderColor='var(--border-soft)';this.style.background='var(--bg-1)';"
            ondrop="event.preventDefault();this.style.borderColor='var(--border-soft)';this.style.background='var(--bg-1)';handleImportFileDrop(event.dataTransfer.files[0]);">
            <div style="font-size:48px;margin-bottom:12px;">📊</div>
            <div style="font-size:15px;font-weight:600;margin-bottom:6px;">اسحب ملف Excel هنا</div>
            <div style="font-size:12px;color:var(--text-2);">أو انقر للاختيار — .xlsx / .xls / .csv</div>
            <input type="file" id="import-file-input" accept=".xlsx,.xls,.csv" style="display:none" onchange="handleImportFileDrop(this.files[0])">
          </div>
        </div>
        <!-- Step 2: Preview & mapping -->
        <div id="import-step-2" style="display:none;">
          <div id="import-stats" style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;"></div>
          <div style="max-height:340px;overflow:auto;border-radius:8px;border:1px solid var(--border-soft);">
            <table class="data-dense" style="font-size:11.5px;" id="import-preview-table"></table>
          </div>
          <div id="import-validation-errors" style="margin-top:12px;"></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="document.getElementById('prod-import-overlay').remove()">إلغاء</button>
        <button class="btn" style="background:var(--bg-2);" onclick="downloadProductTemplate()">📥 تنزيل نموذج</button>
        <button class="btn btn-primary" id="import-confirm-btn" style="display:none;" onclick="executeProductImport()">✅ استيراد البيانات</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
};

let _importRows = [];
window.handleImportFileDrop = async (file) => {
  if (!file) return;
  try {
    showToast('جاري قراءة الملف…', 'info');
    const { headers, rows } = await importFromExcel(file);
    _importRows = rows;

    // Validate
    const errors = [];
    const skuMap = {};
    rows.forEach((r, i) => {
      const sku = String(r[headers[0]] || r['كود الصنف (SKU)*'] || r['SKU'] || '').trim();
      const name = String(r[headers[1]] || r['الاسم العربي*'] || r['اسم الصنف'] || '').trim();
      if (!sku) errors.push(`الصف ${i + 2}: كود الصنف (SKU) مطلوب`);
      if (!name) errors.push(`الصف ${i + 2}: الاسم العربي مطلوب`);
      if (skuMap[sku]) errors.push(`الصف ${i + 2}: كود مكرر "${sku}"`);
      if (sku) skuMap[sku] = true;
    });

    // Show preview table
    const previewCols = Object.keys(rows[0] || {}).slice(0, 8);
    const previewRows = rows.slice(0, 10);
    const tableHtml = `
      <thead><tr>${previewCols.map(h => `<th>${h}</th>`).join('')}${previewCols.length < Object.keys(rows[0]||{}).length ? '<th>…</th>' : ''}</tr></thead>
      <tbody>${previewRows.map((r, ri) => `<tr style="background:${ri%2===0?'var(--bg-1)':'var(--bg-2)'}">${previewCols.map(h => `<td>${r[h]||''}</td>`).join('')}${previewCols.length < Object.keys(r).length ? '<td>…</td>' : ''}</tr>`).join('')}</tbody>
    `;
    document.getElementById('import-preview-table').innerHTML = tableHtml;

    // Stats
    const statsHtml = [
      { label: 'إجمالي الصفوف', val: rows.length, color: '#2563eb' },
      { label: 'الأعمدة', val: headers.length, color: '#10B981' },
      { label: 'أخطاء', val: errors.length, color: errors.length ? '#EF4444' : '#10B981' },
    ].map(s => `
      <div style="background:var(--bg-2);border-radius:8px;padding:10px 16px;display:flex;flex-direction:column;align-items:center;min-width:100px;">
        <span style="font-size:22px;font-weight:800;color:${s.color};">${s.val}</span>
        <span style="font-size:11px;color:var(--text-2);">${s.label}</span>
      </div>`).join('');
    document.getElementById('import-stats').innerHTML = statsHtml;

    // Errors
    if (errors.length > 0) {
      document.getElementById('import-validation-errors').innerHTML = `
        <div class="alert bad" style="max-height:120px;overflow:auto;">
          <strong>⚠️ تحذيرات التحقق (${errors.length}):</strong><br>
          ${errors.slice(0, 15).map(e => `<div style="font-size:11px;">${e}</div>`).join('')}
          ${errors.length > 15 ? `<div style="font-size:11px;">...و ${errors.length-15} أخرى</div>` : ''}
        </div>`;
    } else {
      document.getElementById('import-validation-errors').innerHTML = `<div class="alert good">✅ جميع البيانات صحيحة وجاهزة للاستيراد</div>`;
    }

    document.getElementById('import-step-1').style.display = 'none';
    document.getElementById('import-step-2').style.display = 'block';
    if (errors.length === 0) document.getElementById('import-confirm-btn').style.display = '';
    showToast(`تم قراءة ${rows.length} صنف. راجع البيانات قبل الاستيراد.`, rows.length > 0 ? 'success' : 'warn');
  } catch (err) {
    showToast('خطأ في قراءة الملف: ' + err.message, 'error');
  }
};

window.executeProductImport = async () => {
  const btn = document.getElementById('import-confirm-btn');
  btn.disabled = true;
  btn.textContent = '⏳ جاري الاستيراد…';
  let added = 0, updated = 0, failed = 0;
  try {
    // Load existing SKUs
    const existing = await getAll(COLS.products(), []);
    const skuToId = {};
    existing.forEach(p => { if (p.sku) skuToId[p.sku.trim()] = p.id; });

    const catList = categories.length > 0 ? categories : await getAll(COLS.categories ? COLS.categories() : `companies/${COMPANY_ID}/categories`, [orderBy('name')]).catch(() => []);
    const catMap = {};
    catList.forEach(c => { catMap[(c.name||'').trim().toLowerCase()] = { id: c.id, name: c.name }; });

    const BATCH_SIZE = 50;
    for (let i = 0; i < _importRows.length; i++) {
      const r = _importRows[i];
      const sku  = String(r['كود الصنف (SKU)*'] || r['SKU'] || r[Object.keys(r)[0]] || '').trim();
      const name = String(r['الاسم العربي*'] || r['الاسم'] || r[Object.keys(r)[1]] || '').trim();
      if (!sku || !name) { failed++; continue; }

      const catName = String(r['اسم الفئة'] || r['الفئة'] || '').trim().toLowerCase();
      const catInfo = catMap[catName] || {};

      const payload = {
        sku,
        name,
        nameAr: name,
        nameEn: String(r['الاسم الإنجليزي'] || '').trim() || null,
        barcode: String(r['الباركود'] || '').trim() || null,
        categoryId:   catInfo.id || null,
        categoryName: catInfo.name || (r['اسم الفئة'] || r['الفئة'] || null),
        unit:         String(r['وحدة البيع'] || 'حبة').trim(),
        altUnit:      String(r['الوحدة الكبرى'] || '').trim() || null,
        unitFactor:   parseFloat(r['معامل التحويل'] || 1) || 1,
        costPrice:    parseFloat(r['سعر التكلفة*'] || r['سعر التكلفة'] || 0) || 0,
        salePrice:    parseFloat(r['سعر البيع*']   || r['سعر البيع']   || 0) || 0,
        priceWholesale: parseFloat(r['سعر الجملة'] || 0) || 0,
        taxCategory:  String(r['ضريبة (S أو E)'] || r['ضريبة'] || 'S').toUpperCase() === 'E' ? 'E' : 'S',
        reorderLevel: parseInt(r['حد إعادة الطلب'] || 0) || 0,
        tracking:     String(r['نظام التتبع (none/batch/serial)'] || r['نظام التتبع'] || 'none').toLowerCase(),
        active: true,
        updatedAt: new Date().toISOString(),
      };

      try {
        if (skuToId[sku]) {
          await update(COLS.products(), skuToId[sku], payload);
          updated++;
        } else {
          payload.createdAt = new Date().toISOString();
          await create(COLS.products(), payload);
          added++;
        }
      } catch (e) {
        failed++;
        console.warn('Import row failed:', sku, e);
      }

      // Update progress every 10 items
      if (i % 10 === 0) {
        btn.textContent = `⏳ ${i + 1} / ${_importRows.length}`;
      }
      await new Promise(r => setTimeout(r, 20)); // avoid overwhelming Firestore
    }

    document.getElementById('prod-import-overlay').remove();
    showToast(`✅ الاستيراد مكتمل — مضاف: ${added} | محدَّث: ${updated} | فاشل: ${failed}`, 'success');
    // Reload products
    allProducts = [];
    lastDocSnapshot = null;
    hasMore = false;
    await loadProducts();
  } catch (err) {
    showToast('خطأ في الاستيراد: ' + err.message, 'error');
    btn.disabled = false;
    btn.textContent = '✅ استيراد البيانات';
  }
};

function translateUnit(u) {
  const map = {
    "Piece": "حبة",
    "Kilogram": "كجم",
    "Liter": "لتر",
    "Gram": "جرام",
    "Can": "علبة",
    "Bottle": "زجاجة",
    "Meter": "متر",
    "Carton": "كرتون",
    "Box": "صندوق",
    "Pallet": "باليت",
    "Bag": "كيس",
    "Bale": "بالة",
    "Tank": "تنك",
    "Barrel": "برميل",
    "Roll": "رول",
    "Pack": "شد / ربطة",
    "Sack": "شوال",
    "Tray": "طبق",
    "Gallon": "جالون",
    "Ton": "طن"
  };
  return map[u] || u || "";
}

function getTaxMultiplier() {
  const taxCat = document.getElementById("prod-zatca-tax")?.value || "S";
  return taxCat === "S" ? 1.15 : 1.0;
}

window.onCostInput = () => {
  if (typeof applySuggestedCategoryMargin === "function") {
    applySuggestedCategoryMargin();
  }
  ["retail", "wholesale", "distributor"].forEach(level => {
    const pctInput = document.getElementById(`prod-pct-${level}`);
    if (pctInput && pctInput.value !== "") {
      window.onPctInput(level);
    }
  });
};

window.onPriceInput = (level) => {
  const cost = parseFloat(document.getElementById("prod-purchase-price").value) || 0;
  const priceInput = document.getElementById(`prod-price-${level}`);
  const priceIncInput = document.getElementById(`prod-price-inc-${level}`);
  const pctInput = document.getElementById(`prod-pct-${level}`);
  if (!priceInput) return;

  const price = parseFloat(priceInput.value) || 0;
  const mult = getTaxMultiplier();

  // Update Price including tax
  if (priceIncInput) {
    priceIncInput.value = price > 0 ? (price * mult).toFixed(2) : "";
  }

  // Update Profit % based on net price before tax
  if (pctInput) {
    if (cost > 0 && price > 0) {
      const pct = ((price - cost) / cost) * 100;
      pctInput.value = pct.toFixed(1);
    } else {
      pctInput.value = "";
    }
  }
};

window.onPriceIncInput = (level) => {
  const cost = parseFloat(document.getElementById("prod-purchase-price").value) || 0;
  const priceInput = document.getElementById(`prod-price-${level}`);
  const priceIncInput = document.getElementById(`prod-price-inc-${level}`);
  const pctInput = document.getElementById(`prod-pct-${level}`);
  if (!priceIncInput) return;

  const priceInc = parseFloat(priceIncInput.value) || 0;
  const mult = getTaxMultiplier();

  // Calculate Price before tax
  const price = priceInc > 0 ? priceInc / mult : 0;
  if (priceInput) {
    priceInput.value = price > 0 ? price.toFixed(2) : "";
  }

  // Calculate Profit %
  if (pctInput) {
    if (cost > 0 && price > 0) {
      const pct = ((price - cost) / cost) * 100;
      pctInput.value = pct.toFixed(1);
    } else {
      pctInput.value = "";
    }
  }
};

window.onPctInput = (level) => {
  const cost = parseFloat(document.getElementById("prod-purchase-price").value) || 0;
  const priceInput = document.getElementById(`prod-price-${level}`);
  const priceIncInput = document.getElementById(`prod-price-inc-${level}`);
  const pctInput = document.getElementById(`prod-pct-${level}`);
  if (!pctInput) return;

  const pct = parseFloat(pctInput.value) || 0;
  const mult = getTaxMultiplier();

  if (cost > 0) {
    const price = cost * (1 + pct / 100);
    if (priceInput) priceInput.value = price.toFixed(2);
    if (priceIncInput) priceIncInput.value = (price * mult).toFixed(2);
  } else {
    if (priceInput) priceInput.value = "";
    if (priceIncInput) priceIncInput.value = "";
  }
};

window.loadNextPage = () => {
  if (hasMore) {
    currentPage++;
    loadProducts();
  }
};

window.loadPrevPage = () => {
  if (currentPage > 0) {
    currentPage--;
    loadProducts();
  }
};

window.onTargetMarginInput = () => {
  const marginPct = parseFloat(document.getElementById("prod-target-margin-pct")?.value);
  const marginType = document.getElementById("prod-margin-type")?.value || "markup";
  
  if (isNaN(marginPct) || marginPct < 0) return;

  const cost = parseFloat(document.getElementById("prod-purchase-price")?.value) || 0;
  const prod = window._currentEditingProduct || {};
  const lastPur = parseFloat(prod.lastPurchasePrice) || 0;
  const baseCost = lastPur > 0 ? lastPur : cost;

  if (baseCost > 0) {
    let retailPrice = 0;
    if (marginType === "margin" && marginPct < 100) {
      retailPrice = Math.round((baseCost / (1 - (marginPct / 100))) * 100) / 100;
    } else {
      retailPrice = Math.round((baseCost * (1 + (marginPct / 100))) * 100) / 100;
    }

    const priceRetailInput = document.getElementById("prod-price-retail");
    if (priceRetailInput) {
      priceRetailInput.value = retailPrice.toFixed(2);
      window.onPriceInput("retail");
    }

    // Suggested wholesale (5% less margin) & distributor (10% less margin)
    const wholesaleMargin = Math.max(0, marginPct - 5);
    const distributorMargin = Math.max(0, marginPct - 10);

    let wholesalePrice = 0;
    let distributorPrice = 0;

    if (marginType === "margin" && wholesaleMargin < 100) {
      wholesalePrice = Math.round((baseCost / (1 - (wholesaleMargin / 100))) * 100) / 100;
      distributorPrice = Math.round((baseCost / (1 - (distributorMargin / 100))) * 100) / 100;
    } else {
      wholesalePrice = Math.round((baseCost * (1 + (wholesaleMargin / 100))) * 100) / 100;
      distributorPrice = Math.round((baseCost * (1 + (distributorMargin / 100))) * 100) / 100;
    }

    const priceWholesaleInput = document.getElementById("prod-price-wholesale");
    if (priceWholesaleInput) {
      priceWholesaleInput.value = wholesalePrice.toFixed(2);
      window.onPriceInput("wholesale");
    }

    const priceDistributorInput = document.getElementById("prod-price-distributor");
    if (priceDistributorInput) {
      priceDistributorInput.value = distributorPrice.toFixed(2);
      window.onPriceInput("distributor");
    }
  }
};

window.applyLastPurchasePricePricing = () => {
  const prod = window._currentEditingProduct || {};
  const lastPur = parseFloat(prod.lastPurchasePrice) || 0;
  
  if (lastPur <= 0) {
    window.showToast?.("لا يوجد آخر سعر شراء مسجل لهذا الصنف بعد", "warn");
    return;
  }

  const purchasePriceInput = document.getElementById("prod-purchase-price");
  if (purchasePriceInput) {
    purchasePriceInput.value = lastPur.toFixed(2);
  }

  const marginInput = document.getElementById("prod-target-margin-pct");
  let margin = parseFloat(marginInput?.value);
  if (isNaN(margin) || margin <= 0) {
    margin = 15;
    if (marginInput) marginInput.value = margin;
  }

  window.onTargetMarginInput();
  window.showToast?.(`✅ تم تطبيق آخر سعر شراء (${formatCurrency(lastPur)}) وحساب أسعار البيع بهامش ${margin}%`, "success");
};


