// ============================================================
// IDHAM ERP — تقرير مشتريات الموردين وتتبع تقلبات الأسعار (الملكي)
// Supplier Purchases, Side-by-Side Comparison & Price Analytics
// ============================================================
import { COLS, getAll, create, update, orderBy, db, COMPANY_ID, doc, getDoc, updateDoc, serverTimestamp } from "../utils/db.js";
import { formatCurrency, formatDate, tafqeetArabic } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

let allProducts = [];
let allSuppliers = [];
let allPurchases = [];
let allSalesInvoices = [];
let allQuotations = [];
let allDeliveryNotes = [];
let allSalesReturns = [];
let allPurchaseReturns = [];
let allStockBalances = {}; // { [productId]: totalQty }
let selectedRfqItems = new Map(); // key = prodKey, value = { productId, productName, sku, unit, reqQty, bestSup }
let currentUser = null;

// Track active saved RFQ in current session to allow seamless updating when items are added/removed
let activeSavedRfq = null; // { id, number, itemCount }
let companySettings = {
  name: "شركة نظم الإمداد المتطوره",
  crNumber: "7054969006",
  vatNumber: "314996148100003",
  phone: "0549141648",
  email: "Nuzmalamdad@gmail.com",
  address: "ينبع الصناعية — حي غرناطة"
};

// Filters state
let currentFilters = {
  supplierId: "",
  productId: "",
  dateFrom: "",
  dateTo: "",
  trend: "all",
  search: "",
  activeTab: "purchases-report", // 'purchases-report' | 'sales-profit' | 'product-compare'
  profitSort: "qty-sold", // 'qty-sold' | 'demand' | 'gross-profit' | 'margin' | 'golden' | 'stagnant'
  // Tab 1 Sorting state:
  sortCol: "totalAmount", // 'productName' | 'minPrice' | 'maxPrice' | 'totalQty' | 'qtySold' | 'currentStock' | 'totalAmount'
  sortDir: "desc", // 'asc' | 'desc'
  quickFilter: "all" // 'all' | 'stockout' | 'low-stock' | 'has-savings' | 'fast-moving' | 'stagnant'
};

export async function render(container, user) {
  currentUser = user;
  container.innerHTML = `
    <!-- Top Tab Navigation & Actions Header -->
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <button id="sph-tab-report" class="btn btn-primary" onclick="window.sphSwitchTab('purchases-report')" style="display:flex; align-items:center; gap:6px; font-weight:700;">
          <span>📑</span> تقرير مشتريات الأصناف ومقارنة الموردين الأفقية
        </button>
        <button id="sph-tab-profit" class="btn btn-secondary" onclick="window.sphSwitchTab('sales-profit')" style="display:flex; align-items:center; gap:6px; font-weight:700; border:1px solid #d97706;">
          <span>💎</span> تحليل الطلب والمبيعات والأرباح للأصناف
        </button>
        <button id="sph-tab-compare" class="btn btn-secondary" onclick="window.sphSwitchTab('product-compare')" style="display:flex; align-items:center; gap:6px; font-weight:700;">
          <span>🔍</span> البحث بالصنف وحاسبة الوفر والترسية
        </button>
      </div>

      <div class="no-print" style="display:flex; gap:8px;">
        <button id="sph-main-excel-btn" class="btn" onclick="window.exportSupplierPurchasesExcel()" title="تصدير تقرير إكسل مطور بتنسيقات احترافية وتبويبات ملونة" style="background:#047857; color:#ffffff; font-weight:700; display:flex; align-items:center; gap:6px; box-shadow:0 2px 6px rgba(4,120,87,0.25); border:1px solid #065f46;">
          <span>📊</span> تصدير Excel مطور
        </button>
        <button id="sph-main-royal-print-btn" class="btn" onclick="window.sphTriggerActivePrint()" style="background:#1e1b4b; color:#f8fafc; border:1px solid #d97706; display:flex; align-items:center; gap:6px; font-weight:800; box-shadow:0 2px 6px rgba(0,0,0,0.15);">
          <span>👑</span> طباعة ملكي PDF
        </button>
      </div>
    </div>

    <!-- Filter Bar for Purchases Report (Tab 1) -->
    <div id="sph-filterbar-report" class="filterbar no-print" style="margin-bottom:16px; padding:12px 16px; border-radius:10px; background:var(--bg-card); border:1px solid var(--border-soft); display:flex; flex-wrap:wrap; gap:12px; align-items:flex-end;">
      
      <!-- Supplier Selector -->
      <div class="filter-select-group" style="min-width:240px; flex:1;">
        <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:4px; display:block;">المورد *</label>
        <select id="sph-filter-sup" class="input" onchange="window.sphOnFilterChange()">
          <option value="">🏢 كل الموردين (عرض الأصناف والموردين جنباً إلى جنب)</option>
        </select>
      </div>

      <!-- Optional Product Selector -->
      <div class="filter-select-group" style="min-width:200px; flex:1;">
        <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:4px; display:block;">الصنف (اختياري)</label>
        <select id="sph-filter-prod" class="input" onchange="window.sphOnFilterChange()">
          <option value="">📦 كل الأصناف</option>
        </select>
      </div>

      <!-- Date From -->
      <div class="filter-select-group" style="width:130px;">
        <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:4px; display:block;">من تاريخ</label>
        <input type="date" id="sph-filter-date-from" class="input" onchange="window.sphOnFilterChange()" />
      </div>

      <!-- Date To -->
      <div class="filter-select-group" style="width:130px;">
        <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:4px; display:block;">إلى تاريخ</label>
        <input type="date" id="sph-filter-date-to" class="input" onchange="window.sphOnFilterChange()" />
      </div>

      <!-- Price Trend Filter -->
      <div class="filter-select-group" style="width:180px;">
        <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:4px; display:block;">تصفية التعدد والحركة</label>
        <select id="sph-filter-trend" class="input" onchange="window.sphOnFilterChange()">
          <option value="all">كل الحركات السعرية</option>
          <option value="multi-sup">🔄 أصناف متعددة الموردين فقط</option>
          <option value="up">🔺 أصناف ارتفع سعرها</option>
          <option value="down">🔻 أصناف انخفض سعرها</option>
          <option value="stable">⚪ أسعار مستقرة</option>
        </select>
      </div>

      <!-- Instant Search Filter -->
      <div class="filter-select-group" style="min-width:180px; flex:1;">
        <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:4px; display:block;">بحث سريع</label>
        <input type="text" id="sph-filter-search" class="input" placeholder="اسم الصنف، المورد، الكود…" oninput="window.sphOnFilterChange()" />
      </div>

      <!-- Quick Reset Button -->
      <div>
        <button class="btn btn-secondary" onclick="window.sphResetFilters()" title="إعادة ضبط الفلاتر">
          🔄 مسح الفلاتر
        </button>
      </div>
    </div>

    <!-- Filter Bar for Product Single Comparison (Tab 2) -->
    <div id="sph-filterbar-compare" class="filterbar no-print hidden" style="margin-bottom:16px; padding:12px 16px; border-radius:10px; background:var(--bg-card); border:1px solid var(--border-soft); display:flex; flex-wrap:wrap; gap:12px; align-items:flex-end;">
      
      <!-- Instant Search Input -->
      <div class="filter-select-group" style="min-width:240px; flex:1;">
        <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:4px; display:block;">🔍 ابحث بالصنف أو الكود مباشرة</label>
        <input type="text" id="sph-compare-search" class="input" placeholder="اكتب اسم الصنف للبحث الفوري…" oninput="window.sphOnCompareSearch(this.value)" />
      </div>

      <!-- Product Dropdown -->
      <div class="filter-select-group" style="min-width:280px; flex:1.2;">
        <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:4px; display:block;">اختر الصنف من القائمة *</label>
        <select id="sph-compare-prod" class="input" onchange="window.sphOnCompareProductChange(this.value)">
          <option value="">-- اختر الصنف لتتبع الأسعار والموردين --</option>
        </select>
      </div>

      <!-- Supplier Filter (Optional) -->
      <div class="filter-select-group" style="min-width:180px;">
        <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:4px; display:block;">تصفية مورد محدد (اختياري)</label>
        <select id="sph-compare-sup" class="input" onchange="window.sphRenderCompareView()">
          <option value="">كل الموردين المتاحين</option>
        </select>
      </div>

      <!-- Desired Quantity for Savings Calculator -->
      <div class="filter-select-group" style="width:140px;">
        <label style="font-size:11px; font-weight:700; color:#d97706; margin-bottom:4px; display:block;">💡 كمية الشراء المستهدفة</label>
        <input type="number" id="sph-calc-qty" class="input" value="50" min="1" step="1" oninput="window.sphRenderCompareView()" />
      </div>

      <!-- Print Product Comparison -->
      <div>
        <button class="btn" onclick="window.printRoyalProductCompare()" style="background:#1e1b4b; color:#f8fafc; border:1px solid #d97706; display:flex; align-items:center; gap:6px; font-weight:800;">
          <span>👑</span> طباعة مقارنة الصنف PDF
        </button>
      </div>
    </div>

    <!-- Main Dynamic Content Container -->
    <div id="sph-main-content" class="page-content">
      <div class="card" style="padding:48px 24px; text-align:center; color:var(--text-2);">
        <div style="font-size:40px; margin-bottom:12px;">⏳</div>
        <div style="font-size:16px; font-weight:700;">جارٍ استخراج وتجميع بيانات المشتريات وتقلبات الأسعار…</div>
      </div>
    </div>

    <!-- History Detail Modal -->
    <div id="sph-modal" class="modal-overlay hidden" style="display:none; position:fixed; inset:0; background:rgba(15,23,42,0.7); z-index:9999; align-items:center; justify-content:center; padding:16px;">
      <div class="modal-content" style="background:var(--bg-card, #fff); border-radius:14px; max-width:900px; width:100%; max-height:90vh; overflow-y:auto; box-shadow:0 20px 40px rgba(0,0,0,0.3); border:1px solid var(--border-soft);">
        <div style="padding:16px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <h3 id="sph-modal-title" style="margin:0; font-size:15px; font-weight:800; color:var(--text-0);">سجل فواتير الصنف</h3>
          <button class="btn btn-secondary" onclick="window.sphCloseModal()" style="padding:4px 10px;">✕ إغلاق</button>
        </div>
        <div id="sph-modal-body" style="padding:20px;"></div>
      </div>
    </div>
  `;

  await loadData();
  setupGlobalFunctions();
  renderPurchasesReport();
}

async function loadData() {
  try {
    const [prods, sups, invs, salesInvs, quotes, stockDocs, dnDocs, srDocs, prDocs] = await Promise.all([
      getAll(COLS.products(), [orderBy("name")]).catch(() => []),
      getAll(COLS.suppliers(), [orderBy("name")]).catch(() => []),
      getAll(COLS.purchaseInvoices(), [orderBy("date", "desc")]).catch(() => []),
      getAll(COLS.salesInvoices(), [orderBy("date", "desc")]).catch(() => []),
      getAll(COLS.quotations(), [orderBy("date", "desc")]).catch(() => []),
      getAll(COLS.stockByWarehouse ? COLS.stockByWarehouse() : "stockByWarehouse").catch(() => []),
      getAll(COLS.deliveryNotes ? COLS.deliveryNotes() : "deliveryNotes").catch(() => []),
      getAll(COLS.salesReturns ? COLS.salesReturns() : "salesReturns").catch(() => []),
      getAll(COLS.purchaseReturns ? COLS.purchaseReturns() : "purchaseReturns").catch(() => [])
    ]);

    allProducts = prods || [];
    allSuppliers = sups || [];
    allPurchases = (invs || []).filter(i => i.status !== "cancelled");
    allSalesInvoices = (salesInvs || []).filter(i => i.status !== "cancelled");
    allQuotations = quotes || [];
    allDeliveryNotes = (dnDocs || []).filter(d => d.status !== "cancelled");
    allSalesReturns = (srDocs || []).filter(r => r.status !== "cancelled");
    allPurchaseReturns = (prDocs || []).filter(r => r.status !== "cancelled");

    allStockBalances = {};
    (stockDocs || []).forEach(s => {
      if (s.productId) {
        allStockBalances[s.productId] = (allStockBalances[s.productId] || 0) + (parseFloat(s.qty) || 0);
      }
    });

    populateFilterDropdowns();

    // Load Company Settings from database
    try {
      const coSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company"));
      if (coSnap.exists()) {
        const d = coSnap.data();
        companySettings = {
          name: d.name || d.nameAr || d.legalName || "شركة نظم الإمداد المتطوره",
          crNumber: d.crNumber || d.cr || "7054969006",
          vatNumber: d.vatNumber || "314996148100003",
          phone: d.phone || "0549141648",
          email: d.email || "Nuzmalamdad@gmail.com",
          address: d.address || [d.street, d.district, d.city].filter(Boolean).join(" — ") || "ينبع الصناعية — حي غرناطة"
        };
        try { localStorage.setItem("idham_company", JSON.stringify(companySettings)); } catch {}
      }
    } catch (errCo) {
      console.warn("Could not load company settings:", errCo);
    }

    try {
      const savedRfq = sessionStorage.getItem("sph_active_rfq");
      if (savedRfq) activeSavedRfq = JSON.parse(savedRfq);
    } catch {}
  } catch (e) {
    console.warn("Error loading supplier price, sales and stock data:", e);
  }
}

function populateFilterDropdowns() {
  const supSel = document.getElementById("sph-filter-sup");
  const prodSel = document.getElementById("sph-filter-prod");
  const compProdSel = document.getElementById("sph-compare-prod");
  const compSupSel = document.getElementById("sph-compare-sup");

  const supInvCounts = {};
  allPurchases.forEach(i => {
    const sId = i.supplierId || "unknown";
    supInvCounts[sId] = (supInvCounts[sId] || 0) + 1;
  });

  if (supSel) {
    supSel.innerHTML = `<option value="">🏢 كل الموردين (عرض الأصناف والموردين جنباً إلى جنب)</option>` +
      allSuppliers.map(s => {
        const cnt = supInvCounts[s.id] || 0;
        return `<option value="${s.id}">${s.name} ${cnt > 0 ? `(${cnt} فاتورة)` : ''}</option>`;
      }).join("");
  }

  if (prodSel) {
    prodSel.innerHTML = `<option value="">📦 كل الأصناف</option>` +
      allProducts.map(p => `<option value="${p.id}">${p.name} (${p.unit || "كرتون"})</option>`).join("");
  }

  if (compProdSel) {
    compProdSel.innerHTML = `<option value="">-- اختر الصنف لتتبع الأسعار والموردين --</option>` +
      allProducts.map(p => `<option value="${p.id}">${p.name} (${p.unit || "كرتون"})</option>`).join("");
    if (allProducts.length > 0) compProdSel.value = allProducts[0].id;
  }

  if (compSupSel) {
    compSupSel.innerHTML = `<option value="">كل الموردين المتاحين</option>` +
      allSuppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  }
}

/**
 * Core Data Processing Engine
 * Groups by Product and collects ALL suppliers side-by-side with prices underneath!
 */
function processPurchasesData(ignoreQuickFilter = false) {
  const { supplierId, productId, dateFrom, dateTo, trend, search } = currentFilters;
  const prodMap = new Map(allProducts.map(p => [p.id, p]));
  const supMap = new Map(allSuppliers.map(s => [s.id, s]));

  // Groups map: key = productId || productName
  const productGroups = new Map();

  allPurchases.forEach(inv => {
    // If supplierId filter is selected, skip invoices not matching
    if (supplierId && inv.supplierId !== supplierId) return;

    // Date range filter
    const invDate = inv.date || inv.invoiceDate || "";
    if (dateFrom && invDate && invDate < dateFrom) return;
    if (dateTo && invDate && invDate > dateTo) return;

    const currentSupId = inv.supplierId || "";
    const currentSupName = inv.supplierName || (currentSupId ? supMap.get(currentSupId)?.name : "") || "مورد عام";

    (inv.lines || inv.items || []).forEach(line => {
      const pId = line.productId || "";
      const pName = line.productName || line.name || (pId ? prodMap.get(pId)?.name : "") || "صنف غير معروف";
      const matchedProd = pId ? prodMap.get(pId) : allProducts.find(p => p.name === pName);

      // Product filter
      if (productId && pId !== productId && (!matchedProd || matchedProd.id !== productId)) return;

      const unitPrice = parseFloat(line.unitPrice !== undefined ? line.unitPrice : (line.price || 0));
      const qty = parseFloat(line.qty !== undefined ? line.qty : (line.quantity || 1));
      const total = parseFloat(line.total !== undefined ? line.total : (qty * unitPrice));
      const unit = line.unit || matchedProd?.unit || "كرتون";
      const sku = line.sku || matchedProd?.sku || "—";

      // Search filter across product, sku, and supplier
      if (search) {
        const q = search.trim().toLowerCase();
        const str = `${pName} ${sku} ${currentSupName}`.toLowerCase();
        if (!str.includes(q)) return;
      }

      const prodKey = pId || pName;

      if (!productGroups.has(prodKey)) {
        productGroups.set(prodKey, {
          productId: pId || matchedProd?.id || "",
          productName: pName,
          sku: sku,
          unit: unit,
          suppliersMap: new Map()
        });
      }

      const prodObj = productGroups.get(prodKey);
      const supKey = currentSupId || currentSupName;

      if (!prodObj.suppliersMap.has(supKey)) {
        prodObj.suppliersMap.set(supKey, {
          supplierId: currentSupId,
          supplierName: currentSupName,
          invoices: []
        });
      }

      prodObj.suppliersMap.get(supKey).invoices.push({
        date: invDate,
        invoiceNumber: inv.number || inv.invoiceNumber || (inv.id ? inv.id.slice(0, 8) : "—"),
        invoiceId: inv.id || "",
        unitPrice,
        qty,
        total,
        unit
      });
    });
  });

  // Calculate metrics per grouped product
  const results = [];
  productGroups.forEach(prod => {
    const suppliersList = [];
    let productTotalQty = 0;
    let productTotalSpend = 0;
    let productTotalPurchases = 0;
    const allPrices = [];

    prod.suppliersMap.forEach(sup => {
      sup.invoices.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
      const pCount = sup.invoices.length;
      const prices = sup.invoices.map(i => i.unitPrice);
      const initialPrice = prices[0] || 0;
      const latestPrice = prices[pCount - 1] || 0;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceDiff = latestPrice - initialPrice;
      const priceDiffPct = initialPrice > 0 ? (priceDiff / initialPrice) * 100 : 0;
      const totalQty = sup.invoices.reduce((s, i) => s + i.qty, 0);
      const totalAmount = sup.invoices.reduce((s, i) => s + i.total, 0);
      const avgPrice = totalQty > 0 ? totalAmount / totalQty : latestPrice;

      productTotalQty += totalQty;
      productTotalSpend += totalAmount;
      productTotalPurchases += pCount;
      allPrices.push(...prices);

      let movement = "stable";
      if (priceDiff > 0.01) movement = "up";
      else if (priceDiff < -0.01) movement = "down";

      suppliersList.push({
        supplierId: sup.supplierId,
        supplierName: sup.supplierName,
        purchaseCount: pCount,
        initialPrice,
        latestPrice,
        minPrice,
        maxPrice,
        avgPrice,
        priceDiff,
        priceDiffPct,
        movement,
        totalQty,
        totalAmount,
        latestDate: sup.invoices[pCount - 1]?.date || "",
        invoices: sup.invoices
      });
    });

    if (suppliersList.length === 0) return;

    // Sort suppliers: cheapest latestPrice first!
    suppliersList.sort((a, b) => a.latestPrice - b.latestPrice || a.avgPrice - b.avgPrice);
    const minOverall = Math.min(...allPrices);
    const maxOverall = Math.max(...allPrices);
    const priceSpread = maxOverall - minOverall;

    // Trend filters
    if (trend === "multi-sup" && suppliersList.length <= 1) return;
    if (trend === "up" && !suppliersList.some(s => s.movement === "up")) return;
    if (trend === "down" && !suppliersList.some(s => s.movement === "down")) return;
    if (trend === "stable" && !suppliersList.some(s => s.movement === "stable")) return;

    const avgPurchasePrice = productTotalQty > 0 ? (productTotalSpend / productTotalQty) : (suppliersList[0]?.latestPrice || 0);

    // ==========================================
    // 🛒 SALES, DEMAND & PROFITABILITY TRACKING
    // ==========================================
    const prodId = prod.productId;
    const prodNameClean = (prod.productName || "").trim().toLowerCase();
    const prodSkuClean = (prod.sku || "").trim();
    const matchedProd = prodId ? prodMap.get(prodId) : allProducts.find(p => p.name === prod.productName);

    let salesDistinctInvoices = new Set();
    let qtySold = 0;
    let salesRevenue = 0;
    let costOfSales = 0;

    allSalesInvoices.forEach(sInv => {
      const invDate = sInv.date || sInv.invoiceDate || "";
      if (dateFrom && invDate && invDate < dateFrom) return;
      if (dateTo && invDate && invDate > dateTo) return;

      const lines = sInv.lines || sInv.items || [];
      let itemMatchedInInvoice = false;

      lines.forEach(l => {
        const lPId = l.productId || "";
        const lName = (l.productName || l.name || "").trim().toLowerCase();
        const lSku = (l.sku || "").trim();

        const isMatch = (prodId && lPId === prodId) ||
                        (prodSkuClean && prodSkuClean !== "—" && lSku && lSku === prodSkuClean) ||
                        (lName && lName === prodNameClean);

        if (isMatch) {
          itemMatchedInInvoice = true;
          const lQty = parseFloat(l.qty !== undefined ? l.qty : (l.quantity || 0));
          const lPrice = parseFloat(l.unitPrice !== undefined ? l.unitPrice : (l.price || 0));
          const lDiscount = parseFloat(l.discount || 0);
          const lTotal = Math.max(0, (lQty * lPrice) - lDiscount);
          const lUnitCost = parseFloat(l.averageCost || l.costPrice || 0) || avgPurchasePrice || parseFloat(matchedProd?.costPrice || 0);

          qtySold += lQty;
          salesRevenue += lTotal;
          costOfSales += (lQty * lUnitCost);
        }
      });

      if (itemMatchedInInvoice) {
        salesDistinctInvoices.add(sInv.id || sInv.number || Math.random());
      }
    });

    // ------------------------------------------
    // 📦 DELIVERED VIA DELIVERY NOTES (سندات استلام وتسليم البضاعة)
    // ------------------------------------------
    let qtyDeliveredDN = 0;
    allDeliveryNotes.forEach(dn => {
      // Exclude cancelled or already converted to tax invoice to avoid double-counting
      if (dn.status === "cancelled" || dn.status === "converted_to_invoice") return;
      const dnDate = dn.date || dn.deliveryDate || "";
      if (dateFrom && dnDate && dnDate < dateFrom) return;
      if (dateTo && dnDate && dnDate > dateTo) return;

      const lines = dn.lines || dn.items || [];
      let itemMatchedInDN = false;

      lines.forEach(l => {
        const lPId = l.productId || "";
        const lName = (l.productName || l.name || "").trim().toLowerCase();
        const lSku = (l.sku || "").trim();

        const isMatch = (prodId && lPId === prodId) ||
                        (prodSkuClean && prodSkuClean !== "—" && lSku && lSku === prodSkuClean) ||
                        (lName && lName === prodNameClean);

        if (isMatch) {
          itemMatchedInDN = true;
          const lQty = parseFloat(l.qty !== undefined ? l.qty : (l.quantity || 0));
          const lPrice = parseFloat(l.unitPrice !== undefined ? l.unitPrice : (l.price || 0));
          const lTotal = lQty * lPrice;
          const lUnitCost = parseFloat(l.costPrice || 0) || avgPurchasePrice || parseFloat(matchedProd?.costPrice || 0);

          qtyDeliveredDN += lQty;
          salesRevenue += lTotal;
          costOfSales += (lQty * lUnitCost);
        }
      });

      if (itemMatchedInDN) {
        salesDistinctInvoices.add(dn.id || dn.number || Math.random());
      }
    });

    // ------------------------------------------
    // ↩️ SALES RETURNS (مرتجعات المبيعات)
    // ------------------------------------------
    let qtySalesReturns = 0;
    allSalesReturns.forEach(sr => {
      if (sr.status === "cancelled") return;
      const srDate = sr.date || sr.returnDate || "";
      if (dateFrom && srDate && srDate < dateFrom) return;
      if (dateTo && srDate && srDate > dateTo) return;

      const lines = sr.lines || sr.items || [];
      lines.forEach(l => {
        const lPId = l.productId || "";
        const lName = (l.productName || l.name || "").trim().toLowerCase();
        const lSku = (l.sku || "").trim();

        const isMatch = (prodId && lPId === prodId) ||
                        (prodSkuClean && prodSkuClean !== "—" && lSku && lSku === prodSkuClean) ||
                        (lName && lName === prodNameClean);

        if (isMatch) {
          const lQty = parseFloat(l.qty !== undefined ? l.qty : (l.quantity || 0));
          const lPrice = parseFloat(l.unitPrice !== undefined ? l.unitPrice : (l.price || 0));
          const lTotal = lQty * lPrice;
          const lUnitCost = parseFloat(l.costPrice || 0) || avgPurchasePrice || parseFloat(matchedProd?.costPrice || 0);

          qtySalesReturns += lQty;
          salesRevenue = Math.max(0, salesRevenue - lTotal);
          costOfSales = Math.max(0, costOfSales - (lQty * lUnitCost));
        }
      });
    });

    const netQtySold = Math.max(0, (qtySold + qtyDeliveredDN) - qtySalesReturns);

    // ------------------------------------------
    // ↩️ PURCHASE RETURNS (مرتجعات المشتريات)
    // ------------------------------------------
    let qtyPurchaseReturns = 0;
    let spendPurchaseReturns = 0;
    allPurchaseReturns.forEach(pr => {
      if (pr.status === "cancelled") return;
      const prDate = pr.date || pr.returnDate || "";
      if (dateFrom && prDate && prDate < dateFrom) return;
      if (dateTo && prDate && prDate > dateTo) return;

      const lines = pr.lines || pr.items || [];
      lines.forEach(l => {
        const lPId = l.productId || "";
        const lName = (l.productName || l.name || "").trim().toLowerCase();
        const lSku = (l.sku || "").trim();

        const isMatch = (prodId && lPId === prodId) ||
                        (prodSkuClean && prodSkuClean !== "—" && lSku && lSku === prodSkuClean) ||
                        (lName && lName === prodNameClean);

        if (isMatch) {
          const lQty = parseFloat(l.qty !== undefined ? l.qty : (l.quantity || 0));
          const lPrice = parseFloat(l.unitPrice !== undefined ? l.unitPrice : (l.price || 0));
          qtyPurchaseReturns += lQty;
          spendPurchaseReturns += (lQty * lPrice);
        }
      });
    });

    const netProductTotalQty = Math.max(0, productTotalQty - qtyPurchaseReturns);
    const netProductTotalSpend = Math.max(0, productTotalSpend - spendPurchaseReturns);

    const salesInvoiceCount = salesDistinctInvoices.size;
    const grossProfit = salesRevenue - costOfSales;
    const marginPct = salesRevenue > 0 ? (grossProfit / salesRevenue) * 100 : 0;
    const avgSellingPrice = netQtySold > 0 ? (salesRevenue / netQtySold) : (matchedProd?.price || 0);

    // ==========================================
    // 📋 QUOTATIONS DEMAND TRACKING
    // ==========================================
    let quotationsDistinct = new Set();
    let qtyQuoted = 0;

    allQuotations.forEach(qInv => {
      const qDate = qInv.date || qInv.quotationDate || "";
      if (dateFrom && qDate && qDate < dateFrom) return;
      if (dateTo && qDate && qDate > dateTo) return;

      const lines = qInv.lines || qInv.items || [];
      let itemMatchedInQuote = false;

      lines.forEach(l => {
        const lPId = l.productId || "";
        const lName = (l.productName || l.name || "").trim().toLowerCase();
        const lSku = (l.sku || "").trim();

        const isMatch = (prodId && lPId === prodId) ||
                        (prodSkuClean && prodSkuClean !== "—" && lSku && lSku === prodSkuClean) ||
                        (lName && lName === prodNameClean);

        if (isMatch) {
          itemMatchedInQuote = true;
          const lQty = parseFloat(l.qty !== undefined ? l.qty : (l.quantity || 0));
          qtyQuoted += lQty;
        }
      });

      if (itemMatchedInQuote) {
        quotationsDistinct.add(qInv.id || qInv.number || Math.random());
      }
    });

    const quotationsCount = quotationsDistinct.size;
    const demandCount = salesInvoiceCount + quotationsCount;
    const sellThroughRate = netProductTotalQty > 0 ? (netQtySold / netProductTotalQty) * 100 : 0;

    // ==========================================
    // 🌟 SMART COMMERCIAL PERFORMANCE CLASSIFICATION
    // ==========================================
    let commercialBadge = {
      type: "normal",
      label: "اعتيادي",
      icon: "⚪",
      color: "#64748b",
      bg: "#f1f5f9",
      border: "#cbd5e1"
    };

    if (netQtySold === 0) {
      commercialBadge = {
        type: "stagnant",
        label: "راكد / لم يُبع",
        icon: "⚠️",
        color: "#b45309",
        bg: "#fef3c7",
        border: "#fde68a"
      };
    } else if (netQtySold > 0 && marginPct >= 15 && (sellThroughRate >= 40 || salesInvoiceCount >= 3 || grossProfit >= 300)) {
      commercialBadge = {
        type: "golden",
        label: "صنف ذهبي",
        icon: "🌟",
        color: "#92400e",
        bg: "#fef9c3",
        border: "#facc15"
      };
    } else if (sellThroughRate >= 50 || salesInvoiceCount >= 5) {
      commercialBadge = {
        type: "fast",
        label: "سريع الدوران",
        icon: "⚡",
        color: "#0369a1",
        bg: "#e0f2fe",
        border: "#bae6fd"
      };
    } else if (marginPct >= 20) {
      commercialBadge = {
        type: "high-margin",
        label: "عالي الهامش",
        icon: "💎",
        color: "#0f766e",
        bg: "#ccfbf1",
        border: "#99f6e4"
      };
    }

    const currentStock = allStockBalances[prodId] !== undefined 
      ? allStockBalances[prodId] 
      : (matchedProd?._totalQty !== undefined ? matchedProd._totalQty : (matchedProd?.totalQty !== undefined ? matchedProd.totalQty : (matchedProd?.stockQty || 0)));

    // Quick Filters
    if (!ignoreQuickFilter && currentFilters.quickFilter && currentFilters.quickFilter !== "all") {
      if (currentFilters.quickFilter === "stockout" && currentStock > 0) return;
      if (currentFilters.quickFilter === "low-stock" && (currentStock <= 0 || currentStock >= 10)) return;
      if (currentFilters.quickFilter === "has-savings" && (suppliersList.length <= 1 || priceSpread <= 0)) return;
      if (currentFilters.quickFilter === "fast-moving" && commercialBadge.type !== "fast" && commercialBadge.type !== "golden") return;
      if (currentFilters.quickFilter === "stagnant" && netQtySold > 0) return;
    }

    results.push({
      productKey: prod.productId || prod.productName,
      productId: prod.productId,
      productName: prod.productName,
      sku: prod.sku,
      unit: prod.unit,
      suppliers: suppliersList,
      suppliersCount: suppliersList.length,
      totalQty: netProductTotalQty,
      purchasedQty: productTotalQty,
      purchaseReturnsQty: qtyPurchaseReturns,
      totalAmount: netProductTotalSpend,
      spendPurchaseReturns,
      totalPurchases: productTotalPurchases,
      minPrice: minOverall,
      maxPrice: maxOverall,
      priceSpread,
      avgPurchasePrice,
      salesInvoiceCount,
      qtySold: netQtySold,
      qtySoldInvoices: qtySold,
      qtyDeliveredDN,
      qtySalesReturns,
      salesRevenue,
      costOfSales,
      grossProfit,
      marginPct,
      avgSellingPrice,
      quotationsCount,
      qtyQuoted,
      demandCount,
      sellThroughRate,
      commercialBadge,
      currentStock
    });
  });

  // Sort products according to active sort column & direction if in purchases-report
  if (currentFilters.activeTab === "purchases-report") {
    const col = currentFilters.sortCol || "totalAmount";
    const dir = currentFilters.sortDir || "desc";
    const mult = dir === "asc" ? 1 : -1;

    results.sort((a, b) => {
      if (col === "productName") {
        return mult * (a.productName || "").localeCompare(b.productName || "", "ar");
      } else if (col === "minPrice") {
        return mult * (a.minPrice - b.minPrice);
      } else if (col === "maxPrice") {
        return mult * (a.maxPrice - b.maxPrice);
      } else if (col === "totalQty") {
        return mult * (a.totalQty - b.totalQty);
      } else if (col === "qtySold") {
        return mult * (a.qtySold - b.qtySold);
      } else if (col === "currentStock") {
        return mult * (a.currentStock - b.currentStock);
      } else if (col === "totalAmount") {
        return mult * (a.totalAmount - b.totalAmount);
      }
      return mult * (a.totalAmount - b.totalAmount);
    });
  } else {
    // Default sort by total spend descending
    results.sort((a, b) => b.totalAmount - a.totalAmount);
  }
  return results;
}

/**
 * Render Main Tab: Product rows with suppliers and prices side-by-side!
 */
function renderPurchasesReport() {
  const container = document.getElementById("sph-main-content");
  if (!container) return;

  const allData = processPurchasesData(true);
  const selectedSup = allSuppliers.find(s => s.id === currentFilters.supplierId);
  const supTitle = selectedSup ? selectedSup.name : "كل الموردين (عرض إجمالي مجمع)";

  // Compute Quick Filter counts from unfiltered dataset
  const allRowsCount = allData.length;
  const stockoutCount = allData.filter(d => d.currentStock <= 0).length;
  const lowStockCount = allData.filter(d => d.currentStock > 0 && d.currentStock < 10).length;
  const savingsCount = allData.filter(d => d.suppliersCount > 1 && d.priceSpread > 0).length;
  const fastCount = allData.filter(d => d.commercialBadge.type === "fast" || d.commercialBadge.type === "golden").length;
  const stagnantCount = allData.filter(d => d.qtySold === 0).length;

  // Filter for active quickFilter
  const data = currentFilters.quickFilter === "all" ? allData : allData.filter(d => {
    if (currentFilters.quickFilter === "stockout") return d.currentStock <= 0;
    if (currentFilters.quickFilter === "low-stock") return d.currentStock > 0 && d.currentStock < 10;
    if (currentFilters.quickFilter === "has-savings") return d.suppliersCount > 1 && d.priceSpread > 0;
    if (currentFilters.quickFilter === "fast-moving") return d.commercialBadge.type === "fast" || d.commercialBadge.type === "golden";
    if (currentFilters.quickFilter === "stagnant") return d.qtySold === 0;
    return true;
  });

  // Compute overall KPI aggregates
  const totalSpend = data.reduce((s, d) => s + d.totalAmount, 0);
  const totalQuantities = data.reduce((s, d) => s + d.totalQty, 0);
  const totalSoldQuantities = data.reduce((s, d) => s + d.qtySold, 0);
  const totalInventoryStock = data.reduce((s, d) => s + d.currentStock, 0);
  const totalPurchaseEvents = data.reduce((s, d) => s + d.totalPurchases, 0);
  const uniqueProductsCount = data.length;
  const multiSupplierItems = data.filter(d => d.suppliersCount > 1).length;
  const increasedItems = data.filter(d => d.suppliers.some(s => s.movement === "up")).length;
  const decreasedItems = data.filter(d => d.suppliers.some(s => s.movement === "down")).length;

  const getSortIndicator = (col) => {
    if (currentFilters.sortCol !== col) {
      return `<span style="opacity:0.35; margin-right:3px; font-size:10px;" title="ترتيب">⇅</span>`;
    }
    return currentFilters.sortDir === "asc"
      ? `<span style="color:#d97706; margin-right:3px; font-size:11px; font-weight:900;" title="مرتب تصاعدياً من الأقل للأعلى">▲</span>`
      : `<span style="color:#d97706; margin-right:3px; font-size:11px; font-weight:900;" title="مرتب تنازلياً من الأعلى للأقل">▼</span>`;
  };

  if (data.length === 0) {
    container.innerHTML = `
      <div class="card" style="padding:48px 24px; text-align:center; color:var(--text-2);">
        <div style="font-size:40px; margin-bottom:10px;">🔍</div>
        <div style="font-size:16px; font-weight:700; color:var(--text-1);">لا توجد مشتريات مطابقة لمعايير الفلترة المحددة</div>
        <div style="font-size:12.5px; margin-top:6px;">يرجى تجربة تعديل المورد، الصنف، النطاق الزمني، أو تصفية الحركة.</div>
        <button class="btn btn-secondary" onclick="window.sphResetFilters()" style="margin-top:16px;">🔄 تفريغ الفلاتر وعرض الكل</button>
      </div>
    `;
    renderRfqActionBar();
    return;
  }

  container.innerHTML = `
    <!-- Executive KPI Summary Cards -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(185px, 1fr)); gap:12px; margin-bottom:16px;">
      
      <!-- Total Spend -->
      <div class="card" style="padding:12px 14px; background:linear-gradient(180deg, #faf5ff 0%, #ffffff 100%); border-radius:12px; border:1px solid #e9d5ff; border-top:3px solid #7c3aed;">
        <div style="font-size:11px; color:#6b21a8; font-weight:800; display:flex; align-items:center; justify-content:space-between;">
          <span>إجمالي المشتريات</span>
          <span style="font-size:14px;">💰</span>
        </div>
        <div class="mono font-bold" style="font-size:18.5px; color:#581c87; margin-top:4px;">${formatCurrency(totalSpend)}</div>
        <div style="font-size:10px; color:#a855f7; margin-top:2px;">الفترة المحددة</div>
      </div>

      <!-- Total Purchased Quantities -->
      <div class="card" style="padding:12px 14px; background:linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%); border-radius:12px; border:1px solid #bae6fd; border-top:3px solid #0284c7;">
        <div style="font-size:11px; color:#0369a1; font-weight:800; display:flex; align-items:center; justify-content:space-between;">
          <span>حركة التوريد والمبيعات</span>
          <span style="font-size:14px;">🔄</span>
        </div>
        <div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap;">
          <span style="background:#e0f2fe; color:#0369a1; padding:2px 7px; border-radius:6px; font-weight:900; font-size:11.5px; border:1px solid #bae6fd;">
            📥 وارد: ${totalQuantities.toLocaleString('en-US')}
          </span>
          <span style="background:#dcfce7; color:#15803d; padding:2px 7px; border-radius:6px; font-weight:900; font-size:11.5px; border:1px solid #bbf7d0;">
            🛒 مباع: ${totalSoldQuantities.toLocaleString('en-US')}
          </span>
        </div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">الكميات الإجمالية للحركة</div>
      </div>

      <!-- Total Inventory Stock Balance -->
      <div class="card" style="padding:12px 14px; background:linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%); border-radius:12px; border:1px solid #bbf7d0; border-top:3px solid #16a34a;">
        <div style="font-size:11px; color:#15803d; font-weight:800; display:flex; align-items:center; justify-content:space-between;">
          <span>رصيد المخزون الفعلي</span>
          <span style="font-size:14px;">📦</span>
        </div>
        <div class="mono font-bold" style="font-size:19px; color:#16a34a; margin-top:4px;">${totalInventoryStock.toLocaleString('en-US')}</div>
        <div style="font-size:10px; color:#059669; margin-top:2px;">مطابق 100% للمستودعات والأصناف</div>
      </div>

      <!-- Unique Products Count -->
      <div class="card" style="padding:12px 14px; background:linear-gradient(180deg, #f8fafc 0%, #ffffff 100%); border-radius:12px; border:1px solid #e2e8f0; border-top:3px solid #475569;">
        <div style="font-size:11px; color:#334155; font-weight:800; display:flex; align-items:center; justify-content:space-between;">
          <span>الأصناف المشتراة</span>
          <span style="font-size:14px;">🏷️</span>
        </div>
        <div class="mono font-bold" style="font-size:19px; color:#1e293b; margin-top:4px;">${uniqueProductsCount}</div>
        <div style="font-size:10px; color:#64748b; margin-top:2px;">صنفاً مجمّعاً في التقرير</div>
      </div>

      <!-- Multi-Supplier items count -->
      <div class="card" style="padding:12px 14px; background:linear-gradient(180deg, #fffbeb 0%, #ffffff 100%); border-radius:12px; border:1px solid #fde68a; border-top:3px solid #d97706;">
        <div style="font-size:11px; color:#92400e; font-weight:800; display:flex; align-items:center; justify-content:space-between;">
          <span>أصناف متعددة الموردين</span>
          <span style="font-size:14px;">⚖️</span>
        </div>
        <div class="mono font-bold" style="font-size:19px; color:#b45309; margin-top:4px;">${multiSupplierItems}</div>
        <div style="font-size:10px; color:#d97706; margin-top:2px;">مشتراة من أكثر من مورد لمقارنة السعر</div>
      </div>

      <!-- Price Increases & Decreases -->
      <div class="card" style="padding:12px 14px; background:linear-gradient(180deg, #fef2f2 0%, #ffffff 100%); border-radius:12px; border:1px solid #fecaca; border-top:3px solid ${increasedItems > 0 ? '#dc2626' : '#16a34a'};">
        <div style="font-size:11px; color:#991b1b; font-weight:800; display:flex; align-items:center; justify-content:space-between;">
          <span>حركة وتقلبات الأسعار</span>
          <span style="font-size:14px;">📊</span>
        </div>
        <div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap;">
          <span style="background:#fee2e2; color:#b91c1c; padding:2px 7px; border-radius:6px; font-weight:900; font-size:11.5px; border:1px solid #fca5a5;">
            🔺 ${increasedItems} ارتفاع
          </span>
          <span style="background:#f0fdf4; color:#15803d; padding:2px 7px; border-radius:6px; font-weight:900; font-size:11.5px; border:1px solid #bbf7d0;">
            🟢 ${uniqueProductsCount - increasedItems} وفر وثبات
          </span>
        </div>
        <div style="font-size:10px; color:#64748b; margin-top:3px;">مقارنة بآخر سعر شراء سابق</div>
      </div>
    </div>

    <!-- Smart Quick Filter Pills & Auto-Select Bar -->
    <div class="no-print" style="margin-bottom:14px; padding:10px 16px; background:var(--bg-card); border-radius:12px; border:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
        <span style="font-size:12px; font-weight:800; color:var(--text-1); margin-left:4px;">🎯 تصفية سريعة:</span>
        
        <button class="btn btn-sm ${currentFilters.quickFilter === 'all' ? 'btn-primary' : 'btn-secondary'}" onclick="window.sphSetQuickFilter('all')" style="font-size:11px; font-weight:800; padding:4px 10px; border-radius:6px;">
          كل الأصناف (${allRowsCount})
        </button>

        <button class="btn btn-sm" onclick="window.sphSetQuickFilter('stockout')" style="font-size:11px; font-weight:800; padding:4px 10px; border-radius:6px; background:${currentFilters.quickFilter === 'stockout' ? '#dc2626' : '#fef2f2'}; color:${currentFilters.quickFilter === 'stockout' ? '#fff' : '#dc2626'}; border:1px solid #fca5a5;">
          🔴 نافد المخزون (${stockoutCount})
        </button>

        <button class="btn btn-sm" onclick="window.sphSetQuickFilter('low-stock')" style="font-size:11px; font-weight:800; padding:4px 10px; border-radius:6px; background:${currentFilters.quickFilter === 'low-stock' ? '#d97706' : '#fffbeb'}; color:${currentFilters.quickFilter === 'low-stock' ? '#fff' : '#b45309'}; border:1px solid #fde68a;">
          🟡 رصيد منخفض (${lowStockCount})
        </button>

        <button class="btn btn-sm" onclick="window.sphSetQuickFilter('has-savings')" style="font-size:11px; font-weight:800; padding:4px 10px; border-radius:6px; background:${currentFilters.quickFilter === 'has-savings' ? '#16a34a' : '#f0fdf4'}; color:${currentFilters.quickFilter === 'has-savings' ? '#fff' : '#15803d'}; border:1px solid #bbf7d0;">
          🟢 فرص وفر أسعار (${savingsCount})
        </button>

        <button class="btn btn-sm" onclick="window.sphSetQuickFilter('fast-moving')" style="font-size:11px; font-weight:800; padding:4px 10px; border-radius:6px; background:${currentFilters.quickFilter === 'fast-moving' ? '#0284c7' : '#f0f9ff'}; color:${currentFilters.quickFilter === 'fast-moving' ? '#fff' : '#0369a1'}; border:1px solid #bae6fd;">
          ⚡ سريع الدوران والطلب (${fastCount})
        </button>

        <button class="btn btn-sm" onclick="window.sphSetQuickFilter('stagnant')" style="font-size:11px; font-weight:800; padding:4px 10px; border-radius:6px; background:${currentFilters.quickFilter === 'stagnant' ? '#475569' : '#f8fafc'}; color:${currentFilters.quickFilter === 'stagnant' ? '#fff' : '#475569'}; border:1px solid #cbd5e1;">
          ⚠️ أصناف راكدة (${stagnantCount})
        </button>
      </div>

      <!-- 1-Click Auto Select Stockout Button -->
      <div>
        <button class="btn btn-sm" onclick="window.sphAutoSelectStockout()" style="background:linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color:#ffffff; font-weight:900; font-size:11.5px; padding:6px 14px; border:none; border-radius:8px; box-shadow:0 2px 8px rgba(220,38,38,0.3); display:inline-flex; align-items:center; gap:6px; cursor:pointer;" title="تحديد جميع الأصناف التي رصيدها صفر واقتراح كميات الشراء فوراً">
          <span>⚡</span>
          <span>طلب تسعير لكل الأصناف النافذة (Stockout RFQ)</span>
        </button>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="card" style="overflow:hidden; border-radius:12px; border:1px solid var(--border-soft);">
      <div class="card-header" style="padding:14px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h3 style="margin:0; font-size:14.5px; font-weight:800; color:var(--text-0);">
            📋 مصفوفة مشتريات الأصناف ومقارنة الموردين الأفقية — <span style="color:#6366f1;">${supTitle}</span>
          </h3>
          <div style="font-size:11.5px; color:var(--text-2); margin-top:3px;">
            انقر على أسهم رأس أي عمود للترتيب الفوري من الأعلى للأدنى والعكس. حدد الأصناف بالـ Checkbox لإصدار طلب عرض سعر رسمي فوري للموردين.
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <!-- Top Action Button when items selected -->
          <div id="sph-top-rfq-actions"></div>
          <span class="badge" style="font-size:12px; font-weight:700; background:var(--bg-2);">
            ${data.length} صنفاً مجمعاً
          </span>
        </div>
      </div>

      <div class="table-container" style="max-height:720px; overflow-y:auto;">
        <table class="data-dense" style="margin:0; width:100%;">
          <thead style="position:sticky; top:0; z-index:2; background:var(--bg-card);">
            <tr>
              <th style="width:36px; text-align:center;">
                <input type="checkbox" id="sph-select-all" onchange="window.sphToggleSelectAll(this.checked)" title="تحديد جميع الأصناف لطلب عرض السعر" style="cursor:pointer; width:15px; height:15px; accent-color:#d97706;" />
              </th>
              <th style="width:32px; text-align:center;">#</th>
              <th style="min-width:180px; cursor:pointer; user-select:none;" onclick="window.sphSortTab1('productName')" title="انقر للترتيب بالاسم">
                الصنف والوحدة ${getSortIndicator('productName')}
              </th>
              <th style="min-width:320px;">الموردين والأسعار (المقارنة المباشرة — تحت كل مورد سعره)</th>
              <th style="width:85px; text-align:center; cursor:pointer; user-select:none;" onclick="window.sphSortTab1('minPrice')" title="انقر للترتيب بأدنى سعر">
                أدنى سعر 🥇 ${getSortIndicator('minPrice')}
              </th>
              <th style="width:90px; text-align:center; cursor:pointer; user-select:none;" onclick="window.sphSortTab1('maxPrice')" title="انقر للترتيب بأعلى سعر">
                أعلى سعر 🔺 ${getSortIndicator('maxPrice')}
              </th>
              <th style="width:75px; text-align:center; cursor:pointer; user-select:none;" onclick="window.sphSortTab1('totalQty')" title="انقر للترتيب بالكمية المشتراة">
                المشتراة 📥 ${getSortIndicator('totalQty')}
              </th>
              <th style="width:75px; text-align:center; cursor:pointer; user-select:none;" onclick="window.sphSortTab1('qtySold')" title="انقر للترتيب بالكمية المباعة">
                المباعة 🛒 ${getSortIndicator('qtySold')}
              </th>
              <th style="width:90px; text-align:center; cursor:pointer; user-select:none;" onclick="window.sphSortTab1('currentStock')" title="انقر للترتيب برصيد المخزون الفعلي">
                المخزون المتبقي 📦 ${getSortIndicator('currentStock')}
              </th>
              <th style="width:105px; text-align:center;" title="الكمية المطلوبة لتسعير أو توريد الصنف">
                كمية الطلب ✍️
              </th>
              <th style="width:110px; text-align:left; cursor:pointer; user-select:none;" onclick="window.sphSortTab1('totalAmount')" title="انقر للترتيب بإجمالي المشتريات">
                إجمالي المشتريات 💰 ${getSortIndicator('totalAmount')}
              </th>
              <th style="width:65px; text-align:center;" class="no-print">الفواتير</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((row, idx) => {
              const isSelected = selectedRfqItems.has(row.productKey);
              const defaultReqQty = selectedRfqItems.get(row.productKey)?.reqQty || (row.totalQty > 0 ? Math.round(row.totalQty / (row.suppliers[0]?.purchaseCount || 1)) : 50) || 50;

              // Stock status styling
              let stockColor = '#16a34a';
              let stockBg = '#f0fdf4';
              let stockBorder = '#bbf7d0';
              let stockStatusText = 'متوفر';

              if (row.currentStock <= 0) {
                stockColor = '#dc2626';
                stockBg = '#fef2f2';
                stockBorder = '#fecaca';
                stockStatusText = 'نافد 0';
              } else if (row.currentStock < 10) {
                stockColor = '#d97706';
                stockBg = '#fffbeb';
                stockBorder = '#fde68a';
                stockStatusText = 'منخفض';
              }

              return `
                <tr id="sph-row-${row.productKey}" style="${isSelected ? 'background:#fefce8 !important; border-right:4px solid #d97706;' : ''}">
                  <!-- Checkbox Selection -->
                  <td style="text-align:center; vertical-align:middle;">
                    <input type="checkbox" class="sph-row-checkbox" data-prod-key="${row.productKey}" ${isSelected ? 'checked' : ''} onchange="window.sphToggleItemSelection('${row.productKey}', this.checked)" style="cursor:pointer; width:16px; height:16px; accent-color:#d97706;" />
                  </td>

                  <!-- Rank -->
                  <td class="mono font-bold" style="text-align:center; color:var(--text-3); font-size:11px;">${idx + 1}</td>
                  
                  <!-- Product Name, SKU, Unit, Sales & Profit Performance -->
                  <td>
                    <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                      <a href="javascript:void(0)" onclick="window.sphNavigateToProductCompare('${row.productId}')" style="font-weight:800; color:#1e1b4b; font-size:12.5px; text-decoration:none;" title="🔍 انقر للمقارنة وحاسبة الترسية">
                        ${row.productName}
                      </a>
                      ${row.suppliersCount > 1 ? `
                        <span class="badge" style="background:#fef3c7; color:#92400e; font-size:9.5px; font-weight:800; padding:1px 6px; border:1px solid #fde68a; border-radius:4px;">
                          🔄 ${row.suppliersCount} موردين
                        </span>
                      ` : ''}
                      <span class="badge" style="background:${row.commercialBadge.bg}; color:${row.commercialBadge.color}; border:1px solid ${row.commercialBadge.border}; font-size:9.5px; font-weight:800; padding:1px 6px; border-radius:4px;" title="التصنيف التجاري وسرعة الطلب">
                        ${row.commercialBadge.icon} ${row.commercialBadge.label}
                      </span>
                    </div>
                    <div style="font-size:10px; color:var(--text-3); margin-top:2px;">
                      كود: <b class="mono">${row.sku || "—"}</b> | الوحدة: <b style="color:#6366f1;">${row.unit}</b>
                    </div>
                    <!-- Performance Quick Strip -->
                    <div style="display:inline-flex; align-items:center; gap:6px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:2px 8px; margin-top:4px; font-size:9.5px;">
                      <span>🛒 مبيعات: <b class="mono font-bold" style="color:#0284c7;">${row.qtySold}</b></span>
                      <span style="color:#cbd5e1;">|</span>
                      <span>📋 طلب: <b class="mono font-bold" style="color:#6366f1;">${row.demandCount}</b></span>
                      <span style="color:#cbd5e1;">|</span>
                      <span>💰 إيراد: <b class="mono font-bold" style="color:#1e1b4b;">${formatCurrency(row.salesRevenue)}</b></span>
                      <span style="color:#cbd5e1;">|</span>
                      <span>📈 ربح: <b class="mono font-bold" style="color:${row.grossProfit >= 0 ? '#16a34a' : '#dc2626'};">${formatCurrency(row.grossProfit)} (${row.marginPct.toFixed(1)}%)</b></span>
                    </div>
                  </td>

                  <!-- Suppliers side-by-side with prices underneath! -->
                  <td style="padding:8px 10px;">
                    <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:stretch;">
                      ${row.suppliers.map((s, sIdx) => {
                        const isCheapest = sIdx === 0 && row.suppliersCount > 1;
                        const isHighest = sIdx === row.suppliers.length - 1 && row.suppliersCount > 1 && s.latestPrice > row.suppliers[0].latestPrice;

                        return `
                          <div style="background:${isCheapest ? '#f0fdf4' : '#f8fafc'}; border:1.5px solid ${isCheapest ? '#86efac' : '#cbd5e1'}; border-radius:8px; padding:6px 10px; min-width:140px; flex:1; max-width:240px; box-shadow:${isCheapest ? '0 1px 4px rgba(16,185,129,0.15)' : 'none'};">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px; gap:4px;">
                              <span style="font-size:10.5px; font-weight:800; color:${isCheapest ? '#166534' : '#1e1b4b'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${s.supplierName}">
                                ${isCheapest ? '🥇 ' : ''}${s.supplierName}
                              </span>
                              ${isCheapest ? '<span class="badge good" style="font-size:8.5px; padding:0 4px; font-weight:800;">الأرخص</span>' : ''}
                              ${isHighest ? '<span class="badge bad" style="font-size:8.5px; padding:0 4px; font-weight:800;">الأعلى</span>' : ''}
                            </div>
                            
                            <!-- Price underneath supplier -->
                            <div class="mono font-bold" style="font-size:14px; color:${isCheapest ? '#15803d' : '#1e1b4b'}; margin:2px 0;">
                              ${formatCurrency(s.latestPrice)}
                            </div>

                            <!-- Purchase frequency, latest date and price trend -->
                            <div style="font-size:9px; color:#64748b; display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #e2e8f0; padding-top:2px; margin-top:2px; gap:4px; flex-wrap:wrap;">
                              <span>${s.purchaseCount} مرات (${s.totalQty})</span>
                              ${s.latestDate ? `<span style="color:#0284c7; font-weight:700;" title="تاريخ آخر فاتورة شراء من هذا المورد">📅 ${formatDate(s.latestDate)}</span>` : ''}
                              ${s.priceDiff !== 0 ? `
                                <span style="font-weight:700; color:${s.priceDiff > 0 ? '#dc2626' : '#16a34a'};">
                                  ${s.priceDiff > 0 ? '🔺 +' : '🔻 '}${s.priceDiffPct.toFixed(1)}%
                                </span>
                              ` : '<span style="color:#94a3b8;">مستقر</span>'}
                            </div>
                          </div>
                        `;
                      }).join("")}
                    </div>
                  </td>

                  <!-- Lowest Price -->
                  <td class="mono font-bold" style="text-align:center; font-size:12.5px; color:#16a34a;">
                    ${formatCurrency(row.minPrice)}
                  </td>

                  <!-- Highest Price + Savings -->
                  <td class="mono font-bold" style="text-align:center; font-size:12.5px; color:${row.priceSpread > 0 ? '#dc2626' : '#475569'};">
                    ${formatCurrency(row.maxPrice)}
                    ${row.priceSpread > 0 ? `
                      <div style="font-size:9.5px; color:#059669; font-weight:800; margin-top:2px;">وفر ${formatCurrency(row.priceSpread)}</div>
                    ` : ''}
                  </td>

                  <!-- 1. الكمية المشتراة -->
                  <td class="mono font-bold" style="text-align:center; font-size:12.5px; color:#1e1b4b;">
                    ${row.purchasedQty !== undefined ? row.purchasedQty : row.totalQty}
                    <div style="font-size:9px; color:#64748b;">${row.unit}</div>
                    ${row.purchaseReturnsQty > 0 ? `
                      <div style="font-size:8.5px; color:#dc2626; margin-top:1px; font-weight:700;" title="تم إرجاعها للمورد بموجب إشعار مدين / مردود مشتريات">
                        ↩️ مرتجع: -${row.purchaseReturnsQty}
                      </div>
                      <div style="font-size:8.5px; color:#059669; font-weight:800;" title="صافي المشتريات الفعلي">
                        صافي: ${row.totalQty}
                      </div>
                    ` : ''}
                  </td>

                  <!-- 2. الكمية المباعة والمسلمة -->
                  <td class="mono font-bold" style="text-align:center; font-size:12.5px; color:#0284c7;">
                    ${row.qtySold}
                    <div style="font-size:9px; color:#64748b;">${row.unit}</div>
                    ${row.qtyDeliveredDN > 0 ? `
                      <div style="font-size:8.5px; color:#2563eb; background:#eff6ff; border:1px solid #bfdbfe; border-radius:3px; padding:1px 3px; margin-top:2px; font-weight:700;" title="تم تسليمه للعميل بسند استلام / تسليم بضاعة (DN)">
                        📦 ${row.qtyDeliveredDN} بسند تسليم
                      </div>
                    ` : ''}
                    ${row.qtySalesReturns > 0 ? `
                      <div style="font-size:8.5px; color:#dc2626; margin-top:1px;" title="مرتجع من العميل">
                        (مرتجع: -${row.qtySalesReturns})
                      </div>
                    ` : ''}
                  </td>

                  <!-- 3. المخزون المتبقي الفعلي -->
                  <td style="text-align:center;">
                    <div class="mono font-bold" style="font-size:13px; color:${stockColor};">
                      ${row.currentStock}
                    </div>
                    <span class="badge" style="background:${stockBg}; color:${stockColor}; border:1px solid ${stockBorder}; font-size:9px; font-weight:800; padding:1px 5px; border-radius:4px; display:inline-block; margin-top:1px;">
                      ${stockStatusText}
                    </span>
                  </td>

                  <!-- 4. خانة كتابة الكمية المطلوبة لعرض السعر -->
                  <td style="text-align:center;">
                    <div style="display:flex; align-items:center; justify-content:center; gap:3px;">
                      <input type="number" class="input" min="1" step="1" value="${defaultReqQty}" style="width:65px; text-align:center; height:28px; font-size:11.5px; font-weight:800; padding:2px; border-color:${isSelected ? '#d97706' : 'var(--border-soft)'}; background:${isSelected ? '#fffbeb' : '#fff'};" oninput="window.sphUpdateReqQty('${row.productKey}', this.value)" title="حدد الكمية المطلوبة لعرض السعر" />
                      <span style="font-size:9.5px; color:#64748b;">${row.unit}</span>
                    </div>
                  </td>

                  <!-- Total Spend -->
                  <td class="mono font-bold" style="text-align:left; font-size:12.5px; color:#1e1b4b;">
                    ${formatCurrency(row.totalAmount)}
                  </td>

                  <!-- Actions -->
                  <td style="text-align:center;" class="no-print">
                    <button class="btn btn-secondary" onclick="window.sphOpenProductAllInvoicesModal('${encodeURIComponent(JSON.stringify(row))}')" style="padding:3px 8px; font-size:11px; font-weight:700;" title="عرض سجل كافة الفواتير">
                      👁️ الفواتير
                    </button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
          <tfoot style="background:var(--bg-2); font-weight:800; border-top:2px solid var(--border-soft);">
            <tr>
              <td colspan="3" style="text-align:right; padding:10px 14px; font-size:12.5px; color:var(--text-0);">
                الإجمالي العام للمشتريات والمخزون المعروض:
              </td>
              <td style="padding:10px 14px; font-size:11.5px; color:#4338ca;">
                مجموع التوريدات: <b>${totalPurchaseEvents}</b> فاتورة عبر كافة الموردين
              </td>
              <td colspan="2"></td>
              <td class="mono font-bold" style="text-align:center; font-size:13px; color:#1e1b4b;">
                ${totalQuantities.toLocaleString('en-US')}
              </td>
              <td class="mono font-bold" style="text-align:center; font-size:13px; color:#0284c7;">
                ${totalSoldQuantities.toLocaleString('en-US')}
              </td>
              <td class="mono font-bold" style="text-align:center; font-size:13px; color:#059669;">
                ${totalInventoryStock.toLocaleString('en-US')}
              </td>
              <td></td>
              <td class="mono font-bold" style="text-align:left; font-size:13.5px; color:#1e1b4b; padding:10px 14px;">
                ${formatCurrency(totalSpend)}
              </td>
              <td class="no-print"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <!-- RFQ Sticky Action Bar Wrapper -->
      <div id="sph-rfq-bar-wrapper"></div>
    </div>
  `;

  renderRfqActionBar();
}

/**
 * Render Executive RFQ (Request for Quotation) Action Bar
 */
function renderRfqActionBar() {
  const count = selectedRfqItems.size;

  // 1. Update Top Action Button in the card header above the table
  const topActions = document.getElementById("sph-top-rfq-actions");
  if (topActions) {
    if (count > 0) {
      topActions.innerHTML = `
        <button class="btn" onclick="window.sphOpenActionModal()" style="background:linear-gradient(135deg, #d97706 0%, #b45309 100%); color:#ffffff; font-weight:900; font-size:12.5px; padding:7px 16px; border:none; border-radius:8px; display:inline-flex; align-items:center; gap:8px; box-shadow:0 4px 14px rgba(217, 119, 6, 0.45); cursor:pointer;">
          <span style="font-size:15px;">👑</span>
          <span>خيارات وإرسال عرض السعر (${count} أصناف) 🚀</span>
        </button>
      `;
    } else {
      topActions.innerHTML = `
        <span style="font-size:11.5px; color:#92400e; background:#fffbeb; border:1px solid #fde68a; padding:5px 12px; border-radius:8px; display:inline-flex; align-items:center; gap:6px;">
          <span>💡</span> حدد صنفاً أو اكتب كمية لإصدار عرض السعر
        </span>
      `;
    }
  }

  // 2. Inline Card Strip (when count === 0, show instructional bar)
  const wrapper = document.getElementById("sph-rfq-bar-wrapper");
  if (wrapper) {
    if (count === 0) {
      wrapper.innerHTML = `
        <div style="margin-top:14px; padding:10px 16px; background:#f8fafc; border:1.5px dashed #cbd5e1; border-radius:10px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; color:#475569; font-size:12px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">💡</span>
            <span><b>طلب تسعير وعرض أسعار فوري (RFQ):</b> حدد الأصناف المراد طلب تسعيرها من خلال مربعات الاختيار (☑️) واكتب الكمية المطلوبة لإصدار وطباعة طلب عرض سعر معتمد للموردين بضغطة واحدة.</span>
          </div>
          <button class="btn btn-secondary" onclick="window.sphToggleSelectAll(true)" style="font-size:11.5px; font-weight:700; padding:4px 12px; cursor:pointer;">
            ☑️ تحديد كل الأصناف المعروضة
          </button>
        </div>
      `;
    } else {
      wrapper.innerHTML = "";
    }
  }

  // 3. Floating Action Island attached directly to document.body (Rock-solid static positioning)
  let floatingBar = document.getElementById("sph-floating-rfq-bar");

  if (count === 0) {
    if (floatingBar) floatingBar.remove();
    return;
  }

  if (!floatingBar) {
    floatingBar = document.createElement("div");
    floatingBar.id = "sph-floating-rfq-bar";
    document.body.appendChild(floatingBar);
  }

  let totalReqQty = 0;
  let totalPotentialSavings = 0;
  selectedRfqItems.forEach(item => {
    const q = (parseFloat(item.reqQty) || 0);
    totalReqQty += q;
    if (item.priceSpread > 0) {
      totalPotentialSavings += (q * item.priceSpread);
    }
  });

  // Statically centered without transforms or hover jitter
  floatingBar.style.cssText = "position:fixed !important; bottom:20px !important; left:0 !important; right:0 !important; margin:0 auto !important; width:fit-content !important; max-width:min(1100px, 96vw) !important; z-index:99998 !important; background:linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%) !important; color:#ffffff !important; padding:10px 22px !important; border-radius:14px !important; border:1.5px solid #d97706 !important; box-shadow:0 14px 40px rgba(0,0,0,0.55), 0 0 20px rgba(217,119,6,0.35) !important; display:flex !important; align-items:center !important; justify-content:space-between !important; gap:16px !important; flex-wrap:nowrap !important; backdrop-filter:blur(16px) !important; transform:none !important; transition:none !important; pointer-events:auto !important; user-select:none !important;";

  floatingBar.innerHTML = `
    <!-- Left side: Summary & Savings -->
    <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
      <div style="background:#d97706; color:#ffffff; padding:5px 12px; border-radius:8px; font-weight:900; font-size:12.5px; display:flex; align-items:center; gap:6px;">
        <span>📋</span>
        <span>تم تحديد <b>${count}</b> أصناف</span>
      </div>
      <div style="font-size:12px; color:#e0e7ff; white-space:nowrap;">
        الكميات: <b class="mono" style="color:#fde68a; font-size:13.5px;">${totalReqQty.toLocaleString('en-US')}</b>
      </div>
      ${totalPotentialSavings > 0 ? `
        <div style="font-size:11.5px; color:#86efac; font-weight:800; background:rgba(22,163,74,0.25); border:1px solid rgba(134,239,172,0.4); padding:3px 10px; border-radius:6px; white-space:nowrap;" title="إجمالي الوفر المالي المتحقق عند الشراء من المورد الأرخص">
          💰 وفر: ${formatCurrency(totalPotentialSavings)}
        </div>
      ` : ''}
    </div>

    <!-- Right side: Executive Actions -->
    <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
      <!-- Direct Save/Update RFQ in System -->
      <button class="btn" onclick="window.saveOrUpdateRfqToSystem(false, false)" style="background:${activeSavedRfq ? '#059669' : '#d97706'}; color:#ffffff; font-weight:800; font-size:12px; padding:7px 14px; border:none; border-radius:8px; display:inline-flex; align-items:center; gap:6px; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.3); white-space:nowrap;" title="حفظ أو تحديث الأصناف في سجل طلبات عروض أسعار الموردين بالنظام">
        <span>💾</span>
        <span>${activeSavedRfq ? `تحديث الطلب (${activeSavedRfq.number})` : `حفظ الطلب بالنظام (${count})`}</span>
      </button>

      <!-- Royal Print RFQ Direct -->
      <button class="btn" onclick="window.printRoyalSupplierRfq()" style="background:rgba(255,255,255,0.15); color:#ffffff; font-weight:800; font-size:12px; padding:7px 13px; border:1px solid rgba(255,255,255,0.3); border-radius:8px; display:inline-flex; align-items:center; gap:6px; cursor:pointer; white-space:nowrap;" title="طباعة المستند الرسمي PDF لشركة نظم الإمداد المتطوره">
        <span>🖨️</span>
        <span>طباعة PDF</span>
      </button>

      <!-- Open Action Modal -->
      <button class="btn" onclick="window.sphOpenActionModal()" style="background:#4f46e5; color:#ffffff; font-weight:800; font-size:12px; padding:7px 14px; border:none; border-radius:8px; display:inline-flex; align-items:center; gap:6px; cursor:pointer; white-space:nowrap;">
        <span>👑</span>
        <span>خيارات الإرسال</span>
      </button>

      <!-- Save to RFQ Module -->
      <button class="btn" onclick="window.saveRfqAndNavigate()" style="background:#0284c7; color:#ffffff; font-weight:800; font-size:12px; padding:7px 12px; border:none; border-radius:8px; display:inline-flex; align-items:center; gap:6px; cursor:pointer; white-space:nowrap;" title="الانتقال لشاشة طلبات أسعار الموردين">
        <span>🚀</span>
        <span>شاشة RFQ</span>
      </button>

      <!-- Copy WhatsApp Text -->
      <button class="btn" onclick="window.copyRfqWhatsAppText()" style="background:#16a34a; color:#ffffff; font-weight:800; font-size:12px; padding:7px 12px; border:none; border-radius:8px; display:inline-flex; align-items:center; gap:6px; cursor:pointer; white-space:nowrap;">
        <span>💬</span>
        <span>واتساب</span>
      </button>

      <!-- Clear Selection -->
      <button class="btn" onclick="window.sphClearRfqSelection()" style="background:transparent; color:#94a3b8; font-weight:700; font-size:11.5px; padding:7px 10px; border:none; cursor:pointer; white-space:nowrap;">
        <span>❌</span>
        <span>إلغاء</span>
      </button>
    </div>
  `;
}

/**
 * Render Tab 2: Single Product Comparative View across all suppliers
 * Includes Instant Search, Smart Decision Recommendation, and Savings Calculator
 */
function renderProductCompareView() {
  const container = document.getElementById("sph-main-content");
  if (!container) return;

  const prodId = document.getElementById("sph-compare-prod")?.value || (allProducts[0]?.id || "");
  const prod = allProducts.find(p => p.id === prodId);
  const supFilter = document.getElementById("sph-compare-sup")?.value || "";
  const targetQty = parseFloat(document.getElementById("sph-calc-qty")?.value) || 50;

  if (!prod) {
    container.innerHTML = `
      <div class="card" style="padding:48px 24px; text-align:center; color:var(--text-2);">
        <div style="font-size:36px; margin-bottom:8px;">📦</div>
        <div style="font-size:15px; font-weight:700;">يرجى اختيار صنف من القائمة أعلاه لمقارنة أسعار الموردين</div>
      </div>
    `;
    return;
  }

  const history = [];
  allPurchases.forEach(inv => {
    if (supFilter && inv.supplierId !== supFilter) return;

    (inv.lines || inv.items || []).forEach(line => {
      if (line.productId === prodId || line.productName === prod.name || line.name === prod.name) {
        history.push({
          date: inv.date || inv.invoiceDate || "",
          invoiceNumber: inv.number || inv.invoiceNumber || (inv.id ? inv.id.slice(0, 8) : "—"),
          supplierId: inv.supplierId,
          supplierName: inv.supplierName || (allSuppliers.find(s => s.id === inv.supplierId)?.name || "مورد"),
          unit: line.unit || prod.unit || "كرتون",
          qty: parseFloat(line.qty || line.quantity || 1),
          unitPrice: parseFloat(line.unitPrice || line.price || 0),
          total: parseFloat(line.total || ((line.qty || 1) * (line.unitPrice || 0)))
        });
      }
    });
  });

  history.sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  if (!history.length) {
    container.innerHTML = `
      <div class="card" style="padding:48px 24px; text-align:center; color:var(--text-2);">
        <div style="font-size:36px; margin-bottom:8px;">🔍</div>
        <div style="font-size:15px; font-weight:700;">لا توجد فواتير شراء مسجلة لهذا الصنف (${prod.name})</div>
        <div style="font-size:12px; margin-top:4px;">سعر التكلفة الحالي المسجل في بطاقة الصنف: <b>${formatCurrency(prod.costPrice || prod.purchasePrice || 0)}</b></div>
      </div>
    `;
    return;
  }

  const prices = history.map(h => h.unitPrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const latestPrice = history[history.length - 1].unitPrice;
  const avgPrice = prices.reduce((s, p) => s + p, 0) / prices.length;

  const supStats = {};
  history.forEach(h => {
    if (!supStats[h.supplierName]) supStats[h.supplierName] = { name: h.supplierName, prices: [], count: 0, totalQty: 0, totalAmount: 0 };
    supStats[h.supplierName].prices.push(h.unitPrice);
    supStats[h.supplierName].count += 1;
    supStats[h.supplierName].totalQty += h.qty;
    supStats[h.supplierName].totalAmount += h.total;
  });

  const supComparison = Object.values(supStats).map(s => ({
    name: s.name,
    minPrice: Math.min(...s.prices),
    maxPrice: Math.max(...s.prices),
    avgPrice: s.prices.reduce((a, b) => a + b, 0) / s.prices.length,
    lastPrice: s.prices[s.prices.length - 1],
    totalPurchasedQty: s.totalQty,
    totalPurchasedAmount: s.totalAmount,
    purchasesCount: s.count
  })).sort((a, b) => a.lastPrice - b.lastPrice || a.avgPrice - b.avgPrice);

  const bestSup = supComparison[0];
  const bestPrice = bestSup.lastPrice || bestSup.avgPrice;
  const worstSup = supComparison[supComparison.length - 1];
  const worstPrice = worstSup ? (worstSup.lastPrice || worstSup.avgPrice) : bestPrice;
  const diffPerUnit = worstPrice - bestPrice;
  const totalSaving = diffPerUnit * targetQty;

  container.innerHTML = `
    <!-- Product Header Strip -->
    <div class="card" style="padding:14px 20px; margin-bottom:16px; background:var(--bg-card); border-radius:12px; border-right:4px solid #6366f1; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
      <div>
        <div style="font-size:16px; font-weight:800; color:var(--text-0);">📦 ${prod.name}</div>
        <div style="font-size:11.5px; color:var(--text-2); margin-top:3px;">
          كود الصنف: <b class="mono">${prod.sku || "—"}</b> | الوحدة: <b style="color:#6366f1;">${prod.unit || "كرتون"}</b> | سعر التكلفة المعتمد: <b class="mono">${formatCurrency(prod.costPrice || 0)}</b>
        </div>
      </div>
      <div style="display:flex; gap:16px; align-items:center;">
        <span class="badge" style="font-size:12.5px; font-weight:800; background:#eef2ff; color:#3730a3; padding:4px 10px;">
          🏢 ${supComparison.length} موردين معتمدين
        </span>
        <span class="badge" style="font-size:12.5px; font-weight:800; background:#ecfdf5; color:#065f46; padding:4px 10px;">
          📑 ${history.length} فاتورة شراء
        </span>
      </div>
    </div>

    <!-- Smart Purchasing Decision Recommendation Banner -->
    ${supComparison.length > 1 ? `
      <div class="card" style="padding:16px 20px; margin-bottom:16px; background:linear-gradient(90deg, #ecfdf5 0%, #f0fdf4 100%); border:1.5px solid #86efac; border-radius:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; box-shadow:0 2px 8px rgba(16,185,129,0.08);">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="font-size:36px;">💡</div>
          <div>
            <div style="font-size:14px; font-weight:900; color:#166534;">
              توصية الشراء الذكي: الترسية على المورد الأفضل سعراً [ 🥇 ${bestSup.name} ]
            </div>
            <div style="font-size:12px; color:#15803d; margin-top:3px;">
              سعر الوحدة الحالي: <b>${formatCurrency(bestPrice)}</b> | وفر فوري قدره <b>${formatCurrency(diffPerUnit)}</b> لكل ${prod.unit || 'كرتون'} مقارنة بالمورد [ ${worstSup.name} ].
            </div>
          </div>
        </div>
        <div style="background:#fff; padding:10px 18px; border-radius:10px; border:1px solid #bbf7d0; text-align:left;">
          <div style="font-size:10px; color:#475569; font-weight:700;">الوفر المالي الصافي لشراء ${targetQty} ${prod.unit || 'كرتون'}:</div>
          <div class="mono font-bold" style="font-size:20px; color:#16a34a;">${formatCurrency(totalSaving)}</div>
        </div>
      </div>
    ` : ''}

    <!-- KPI Cards -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:16px;">
      <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
        <div style="font-size:11px; color:var(--text-3); font-weight:700;">آخر سعر شراء مسجل</div>
        <div class="mono font-bold" style="font-size:20px; color:#6366f1; margin-top:4px;">${formatCurrency(latestPrice)}</div>
        <div style="font-size:11px; color:var(--text-2); margin-top:2px;">بتاريخ: ${history[history.length - 1].date || "—"}</div>
      </div>

      <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
        <div style="font-size:11px; color:#10B981; font-weight:700;">أقل سعر شراء تاريخي (الأفضل)</div>
        <div class="mono font-bold" style="font-size:20px; color:#10B981; margin-top:4px;">${formatCurrency(minPrice)}</div>
        <div style="font-size:11px; color:var(--text-2); margin-top:2px;">وفر: ${formatCurrency(maxPrice - minPrice)} عن أعلى سعر</div>
      </div>

      <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
        <div style="font-size:11px; color:#EF4444; font-weight:700;">أعلى سعر شراء تاريخي</div>
        <div class="mono font-bold" style="font-size:20px; color:#EF4444; margin-top:4px;">${formatCurrency(maxPrice)}</div>
        <div style="font-size:11px; color:var(--text-2); margin-top:2px;">فارق تذبذب: ${(((maxPrice - minPrice) / (minPrice || 1)) * 100).toFixed(1)}%</div>
      </div>

      <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
        <div style="font-size:11px; color:#8b5cf6; font-weight:700;">أفضل مورد سعراً</div>
        <div class="font-bold" style="font-size:16px; color:#8b5cf6; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          🥇 ${bestSup?.name || "—"}
        </div>
        <div style="font-size:11px; color:var(--text-2); margin-top:2px;">بآخر سعر: <b>${formatCurrency(bestSup?.lastPrice || 0)}</b></div>
      </div>
    </div>

    <!-- Visual Bars & Detailed Supplier Ranking -->
    <div style="display:grid; grid-template-columns:1.1fr 1.3fr; gap:16px; margin-bottom:16px;">
      
      <!-- Price Trend Bar Chart -->
      <div class="card" style="padding:18px;">
        <h4 style="margin:0 0 16px; font-size:13.5px; font-weight:800; color:var(--text-0);">
          📈 تدرج أسعار الشراء عبر فواتير المشتريات (آخر ${Math.min(12, history.length)} حركة):
        </h4>
        <div style="display:flex; height:160px; align-items:flex-end; gap:14px; padding:0 10px 10px; border-bottom:1px solid var(--border-soft);">
          ${history.slice(-12).map(h => {
            const pct = maxPrice > 0 ? (h.unitPrice / maxPrice) * 100 : 50;
            const isMin = h.unitPrice === minPrice;
            const isMax = h.unitPrice === maxPrice;
            const barColor = isMin ? "#10B981" : isMax ? "#EF4444" : "#6366f1";

            return `
              <div style="flex:1; display:flex; flex-direction:column; align-items:center; height:100%; justify-content:flex-end;">
                <div class="mono font-bold" style="font-size:9.5px; color:${barColor}; margin-bottom:4px;">${h.unitPrice}</div>
                <div style="width:100%; max-width:24px; height:${Math.max(15, pct)}%; background:${barColor}; border-radius:4px 4px 0 0;" title="${h.supplierName} - ${h.date}"></div>
                <div class="mono dim" style="font-size:8.5px; margin-top:6px; white-space:nowrap; transform:rotate(-25deg); transform-origin:top right;">${(h.date || "").slice(5)}</div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- Complete Supplier Comparison Ranking Table -->
      <div class="card" style="padding:18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h4 style="margin:0; font-size:13.5px; font-weight:800; color:var(--text-0);">
            🏆 مصفوفة مقارنة كافة الموردين للصنف:
          </h4>
          <span style="font-size:11px; color:#d97706; font-weight:700;">كمية الحساب: ${targetQty} ${prod.unit || 'كرتون'}</span>
        </div>
        <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px; max-height:200px; overflow-y:auto;">
          <table class="data-dense" style="margin:0; width:100%;">
            <thead>
              <tr>
                <th>المورد</th>
                <th style="text-align:left;">آخر سعر</th>
                <th style="text-align:left;">أقل سعر</th>
                <th style="text-align:center;">الفارق عن الأرخص</th>
                <th style="text-align:left;">تكلفة ${targetQty} وحدة</th>
                <th style="text-align:center;">الفواتير</th>
              </tr>
            </thead>
            <tbody>
              ${supComparison.map((s, idx) => {
                const diffFromBest = (s.lastPrice || s.avgPrice) - bestPrice;
                const costForTarget = (s.lastPrice || s.avgPrice) * targetQty;

                return `
                  <tr style="${idx === 0 ? 'background:#f0fdf4;' : ''}">
                    <td>
                      ${idx === 0 ? '🥇 ' : idx === 1 ? '🥈 ' : idx === 2 ? '🥉 ' : ''}
                      <b>${s.name}</b>
                    </td>
                    <td class="mono font-bold" style="text-align:left; color:#1e1b4b;">${formatCurrency(s.lastPrice)}</td>
                    <td class="mono font-bold text-good" style="text-align:left;">${formatCurrency(s.minPrice)}</td>
                    <td style="text-align:center;">
                      ${idx === 0 ? '<span class="badge good font-bold">🥇 الأوفر (أساس)</span>' : 
                        `<span class="badge bad font-bold">+${formatCurrency(diffFromBest)}</span>`}
                    </td>
                    <td class="mono font-bold" style="text-align:left; color:#1e1b4b;">
                      ${formatCurrency(costForTarget)}
                    </td>
                    <td class="mono" style="text-align:center;">${s.purchasesCount}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Full History Table for Product -->
    <div class="card">
      <div class="card-header" style="padding:14px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0; font-size:14.5px; font-weight:800; color:var(--text-0);">
          📑 سجل فواتير الشراء التاريخية للصنف: <span style="color:#6366f1;">${prod.name}</span>
        </h3>
        <span class="badge" style="font-size:12px;">${history.length} فاتورة مسجلة</span>
      </div>

      <div class="table-container">
        <table class="data-dense">
          <thead>
            <tr>
              <th style="width:100px;">التاريخ</th>
              <th style="width:110px;">رقم الفاتورة</th>
              <th>المورد</th>
              <th style="width:90px;">الوحدة</th>
              <th style="width:90px; text-align:center;">الكمية</th>
              <th style="width:110px; text-align:left;">سعر الوحدة</th>
              <th style="width:120px; text-align:left;">إجمالي البند</th>
              <th style="width:110px; text-align:center;">مقارنة بالمتوسط</th>
            </tr>
          </thead>
          <tbody>
            ${history.map(h => {
              const diffPct = avgPrice > 0 ? ((h.unitPrice - avgPrice) / avgPrice) * 100 : 0;
              const isHigher = diffPct > 2;
              const isLower = diffPct < -2;

              return `
                <tr>
                  <td class="mono dim">${h.date || "—"}</td>
                  <td class="mono font-bold" style="color:#6366f1;">${h.invoiceNumber}</td>
                  <td class="font-bold">${h.supplierName}</td>
                  <td>${h.unit}</td>
                  <td class="mono" style="text-align:center;">${h.qty}</td>
                  <td class="mono font-bold" style="text-align:left; font-size:13px;">${formatCurrency(h.unitPrice)}</td>
                  <td class="mono font-bold" style="text-align:left;">${formatCurrency(h.total)}</td>
                  <td style="text-align:center;">
                    ${isLower ? `<span class="badge good">وفر ${Math.abs(diffPct).toFixed(1)}%</span>` : 
                      isHigher ? `<span class="badge bad">أعلى ${diffPct.toFixed(1)}%</span>` : 
                      `<span class="badge neutral">مطابق</span>`}
                  </td>
                </tr>
              `;
            }).reverse().join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * Render Tab 3: Sales Demand & Profitability Analytics for Supplier Products
 */
function renderProfitabilityReport() {
  const container = document.getElementById("sph-main-content");
  if (!container) return;

  const rawData = processPurchasesData();
  const selectedSup = allSuppliers.find(s => s.id === currentFilters.supplierId);
  const supTitle = selectedSup ? selectedSup.name : "كافة الموردين (عرض مجمّع شامل)";
  const sortKey = currentFilters.profitSort || "qty-sold";

  if (rawData.length === 0) {
    container.innerHTML = `
      <div class="card" style="padding:48px 24px; text-align:center; color:var(--text-2);">
        <div style="font-size:40px; margin-bottom:10px;">🔍</div>
        <div style="font-size:16px; font-weight:700; color:var(--text-1);">لا توجد بيانات مشتريات مطابقة للفلترة الحالية</div>
        <div style="font-size:12.5px; margin-top:6px;">يرجى تجربة تعديل الفلاتر أو المورد المختار.</div>
        <button class="btn btn-secondary" onclick="window.sphResetFilters()" style="margin-top:16px;">🔄 تفريغ الفلاتر وعرض الكل</button>
      </div>
    `;
    return;
  }

  // Sort according to active profitSort
  const data = [...rawData];
  if (sortKey === "qty-sold") {
    data.sort((a, b) => b.qtySold - a.qtySold || b.grossProfit - a.grossProfit);
  } else if (sortKey === "demand") {
    data.sort((a, b) => b.demandCount - a.demandCount || b.qtySold - a.qtySold);
  } else if (sortKey === "gross-profit") {
    data.sort((a, b) => b.grossProfit - a.grossProfit || b.marginPct - a.marginPct);
  } else if (sortKey === "margin") {
    data.sort((a, b) => b.marginPct - a.marginPct || b.grossProfit - a.grossProfit);
  } else if (sortKey === "golden") {
    data.sort((a, b) => {
      const aG = a.commercialBadge.type === "golden" ? 2 : (a.commercialBadge.type === "fast" || a.commercialBadge.type === "high-margin" ? 1 : 0);
      const bG = b.commercialBadge.type === "golden" ? 2 : (b.commercialBadge.type === "fast" || b.commercialBadge.type === "high-margin" ? 1 : 0);
      return bG - aG || b.grossProfit - a.grossProfit;
    });
  } else if (sortKey === "stagnant") {
    data.sort((a, b) => a.qtySold - b.qtySold || b.totalQty - a.totalQty);
  }

  // Aggregate metrics
  const totalPurchasesSpend = data.reduce((s, d) => s + d.totalAmount, 0);
  const totalPurchasedQty = data.reduce((s, d) => s + d.totalQty, 0);
  const totalSoldQty = data.reduce((s, d) => s + d.qtySold, 0);
  const totalRevenue = data.reduce((s, d) => s + d.salesRevenue, 0);
  const totalGrossProfit = data.reduce((s, d) => s + d.grossProfit, 0);
  const totalCostOfSales = data.reduce((s, d) => s + d.costOfSales, 0);
  const overallMarginPct = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;
  const overallSellThrough = totalPurchasedQty > 0 ? (totalSoldQty / totalPurchasedQty) * 100 : 0;
  const stagnantCount = data.filter(d => d.qtySold === 0).length;
  const goldenCount = data.filter(d => d.commercialBadge.type === "golden").length;

  const topSold = [...data].sort((a, b) => b.qtySold - a.qtySold)[0];
  const topProfit = [...data].sort((a, b) => b.grossProfit - a.grossProfit)[0];
  const topDemand = [...data].sort((a, b) => b.demandCount - a.demandCount)[0];

  container.innerHTML = `
    <!-- Executive KPI Summary Strip for Sales & Profitability -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
      
      <!-- Total Sales Revenue -->
      <div class="card" style="padding:14px 16px; background:var(--bg-card); border-radius:12px; border-right:4px solid #0284c7;">
        <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي إيراد المبيعات (صافي)</div>
        <div class="mono font-bold" style="font-size:20px; color:#0284c7; margin-top:4px;">${formatCurrency(totalRevenue)}</div>
        <div style="font-size:10.5px; color:var(--text-3); margin-top:2px;">مبيعات الأصناف المعروضة</div>
      </div>

      <!-- Gross Profit -->
      <div class="card" style="padding:14px 16px; background:var(--bg-card); border-radius:12px; border-right:4px solid #10b981;">
        <div style="font-size:11px; color:#059669; font-weight:700;">مجمل الأرباح المحققة 📈</div>
        <div class="mono font-bold" style="font-size:20px; color:#10b981; margin-top:4px;">${formatCurrency(totalGrossProfit)}</div>
        <div style="font-size:10.5px; color:var(--text-3); margin-top:2px;">الإيراد - تكلفة البضاعة</div>
      </div>

      <!-- Profit Margin % -->
      <div class="card" style="padding:14px 16px; background:var(--bg-card); border-radius:12px; border-right:4px solid #8b5cf6;">
        <div style="font-size:11px; color:var(--text-2); font-weight:700;">متوسط هامش الربح الإجمالي</div>
        <div class="mono font-bold" style="font-size:20px; color:#8b5cf6; margin-top:4px;">${overallMarginPct.toFixed(1)}%</div>
        <div style="font-size:10.5px; color:var(--text-3); margin-top:2px;">العائد الموزون على المبيعات</div>
      </div>

      <!-- Quantities & Sell-Through -->
      <div class="card" style="padding:14px 16px; background:var(--bg-card); border-radius:12px; border-right:4px solid #f59e0b;">
        <div style="font-size:11px; color:#d97706; font-weight:700;">الكميات المباعة ومعدل التصريف</div>
        <div class="mono font-bold" style="font-size:19px; color:#d97706; margin-top:4px;">${totalSoldQty.toLocaleString('en-US')} <span style="font-size:12px; font-weight:600; color:var(--text-2);">/ ${totalPurchasedQty.toLocaleString('en-US')}</span></div>
        <div style="font-size:10.5px; color:#059669; font-weight:700; margin-top:2px;">نسبة التصريف: ${overallSellThrough.toFixed(1)}%</div>
      </div>

      <!-- Top Sold Product -->
      <div class="card" style="padding:14px 16px; background:var(--bg-card); border-radius:12px; border-right:4px solid #6366f1;">
        <div style="font-size:11px; color:#4338ca; font-weight:700;">🥇 الأكثر مبيعاً بالكمية</div>
        <div style="font-size:13px; font-weight:800; color:var(--text-0); margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${topSold?.productName || '—'}">
          ${topSold?.productName || "—"}
        </div>
        <div class="mono font-bold" style="font-size:11.5px; color:#6366f1; margin-top:2px;">
          ${topSold?.qtySold || 0} ${topSold?.unit || 'كرتون'} (${formatCurrency(topSold?.salesRevenue || 0)})
        </div>
      </div>

      <!-- Top Profit Product -->
      <div class="card" style="padding:14px 16px; background:var(--bg-card); border-radius:12px; border-right:4px solid #059669;">
        <div style="font-size:11px; color:#047857; font-weight:700;">💎 الأكثر ربحية بالريال</div>
        <div style="font-size:13px; font-weight:800; color:var(--text-0); margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${topProfit?.productName || '—'}">
          ${topProfit?.productName || "—"}
        </div>
        <div class="mono font-bold" style="font-size:11.5px; color:#059669; margin-top:2px;">
          ربح: ${formatCurrency(topProfit?.grossProfit || 0)} (${(topProfit?.marginPct || 0).toFixed(1)}%)
        </div>
      </div>
    </div>

    <!-- Quick Sorting & Filter Bar -->
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px; background:var(--bg-card); padding:10px 16px; border-radius:10px; border:1px solid var(--border-soft);">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:12px; font-weight:800; color:var(--text-1);">⚡ الترتيب والتصفية السريعة:</span>
      </div>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <button class="btn btn-sm ${sortKey === 'qty-sold' ? 'btn-primary' : 'btn-secondary'}" onclick="window.sphSetProfitSort('qty-sold')" style="font-weight:700; font-size:11px;">
          🔥 الأكثر كمية مبيعة
        </button>
        <button class="btn btn-sm ${sortKey === 'demand' ? 'btn-primary' : 'btn-secondary'}" onclick="window.sphSetProfitSort('demand')" style="font-weight:700; font-size:11px;">
          📋 الأكثر طلباً (فواتير + عروض)
        </button>
        <button class="btn btn-sm ${sortKey === 'gross-profit' ? 'btn-primary' : 'btn-secondary'}" onclick="window.sphSetProfitSort('gross-profit')" style="font-weight:700; font-size:11px;">
          💰 الأكثر ربحية (ر.س)
        </button>
        <button class="btn btn-sm ${sortKey === 'margin' ? 'btn-primary' : 'btn-secondary'}" onclick="window.sphSetProfitSort('margin')" style="font-weight:700; font-size:11px;">
          📊 الأعلى هامش ربح %
        </button>
        <button class="btn btn-sm ${sortKey === 'golden' ? 'btn-primary' : 'btn-secondary'}" onclick="window.sphSetProfitSort('golden')" style="font-weight:700; font-size:11px;">
          🌟 الأصناف الذهبية (${goldenCount})
        </button>
        <button class="btn btn-sm ${sortKey === 'stagnant' ? 'btn-primary' : 'btn-secondary'}" onclick="window.sphSetProfitSort('stagnant')" style="font-weight:700; font-size:11px;">
          ⚠️ الأصناف الراكدة (${stagnantCount})
        </button>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="card" style="overflow:hidden; border-radius:12px; border:1px solid var(--border-soft);">
      <div class="card-header" style="padding:14px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div>
          <h3 style="margin:0; font-size:14.5px; font-weight:800; color:var(--text-0);">
            💎 مصفوفة تحليل الطلب والمبيعات والأرباح — <span style="color:#6366f1;">${supTitle}</span>
          </h3>
          <div style="font-size:11.5px; color:var(--text-2); margin-top:3px;">
            تجميع دقيق لمعدلات طلب الأصناف ومبيعاتها الفعلية ومقارنة تكلفة الشراء بسعر البيع لاستخراج الربحية الصافية.
          </div>
        </div>
        <span class="badge" style="font-size:12px; font-weight:700; background:var(--bg-2);">
          ${data.length} صنفاً مشمولاً بالتحليل
        </span>
      </div>

      <div class="table-container" style="max-height:700px; overflow-y:auto;">
        <table class="data-dense" style="margin:0; width:100%;">
          <thead style="position:sticky; top:0; z-index:2; background:var(--bg-card);">
            <tr>
              <th style="width:35px; text-align:center;">#</th>
              <th style="min-width:180px;">الصنف والكود</th>
              <th style="width:110px; text-align:center;">التصنيف التجاري</th>
              <th style="width:130px; text-align:center;">المشتريات والتكلفة</th>
              <th style="width:110px; text-align:center;">حركة الطلب 📋</th>
              <th style="width:140px; text-align:center;">المبيعات والتصريف 🛒</th>
              <th style="width:130px; text-align:left;">إيراد المبيعات</th>
              <th style="width:120px; text-align:left;">مجمل الربح (ر.س)</th>
              <th style="width:95px; text-align:center;">الهامش %</th>
              <th style="min-width:160px; text-align:right;">أرخص مورد متاح</th>
              <th style="min-width:170px;" class="no-print">التوصية التجارية 💡</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((row, idx) => {
              const profitClass = row.grossProfit > 0 ? '#16a34a' : row.grossProfit < 0 ? '#dc2626' : '#64748b';
              const sellRate = Math.min(100, Math.max(0, row.sellThroughRate));
              const sellColor = sellRate >= 50 ? '#10b981' : sellRate >= 20 ? '#0284c7' : '#f59e0b';
              const bestSup = row.suppliers[0];

              // Smart Advice Text
              let adviceText = "⚪ أداء اعتيادي متوازن";
              let adviceStyle = "color:#475569;";
              if (row.qtySold === 0) {
                adviceText = "⚠️ صنف راكد لم يُبع. نشّط تسويقه أو اعمله ضمن عروض ترويجية لتفادي حبس السيولة.";
                adviceStyle = "color:#b45309; font-weight:700;";
              } else if (row.grossProfit < 0) {
                adviceText = "🚨 خسارة! يباع بأقل من تكلفة الشراء. ارفع سعر البيع فوراً.";
                adviceStyle = "color:#dc2626; font-weight:800;";
              } else if (row.commercialBadge.type === "golden") {
                adviceText = `🌟 صنف ذهبي عالي الربحية! ثبّت كمياته واشترِ من [${bestSup?.supplierName || 'الأرخص'}] لتعظيم الأرباح.`;
                adviceStyle = "color:#92400e; font-weight:700;";
              } else if (row.commercialBadge.type === "fast") {
                adviceText = `⚡ سريع الدوران! تصريف ${row.sellThroughRate.toFixed(0)}%. تفاوض لخفض التكلفة مقابل كميات أكبر.`;
                adviceStyle = "color:#0369a1; font-weight:700;";
              } else if (row.commercialBadge.type === "high-margin") {
                adviceText = `💎 هامش ممتاز (${row.marginPct.toFixed(1)}%). ركّز المناديب على زيادة توزيعه.`;
                adviceStyle = "color:#0f766e; font-weight:700;";
              }

              return `
                <tr>
                  <td class="mono font-bold" style="text-align:center; color:var(--text-3); font-size:11px;">${idx + 1}</td>
                  
                  <!-- Product Name & Unit -->
                  <td>
                    <div style="font-weight:800; color:#1e1b4b; font-size:12.5px;">
                      <a href="javascript:void(0)" onclick="window.sphNavigateToProductCompare('${row.productId}')" style="color:#1e1b4b; text-decoration:none;" title="🔍 انقر لمقارنة الموردين وحاسبة الترسية">
                        ${row.productName}
                      </a>
                    </div>
                    <div style="font-size:10px; color:var(--text-3); margin-top:2px;">
                      كود: <b class="mono">${row.sku || "—"}</b> | الوحدة: <b style="color:#6366f1;">${row.unit}</b>
                    </div>
                  </td>

                  <!-- Commercial Badge -->
                  <td style="text-align:center;">
                    <span class="badge" style="background:${row.commercialBadge.bg}; color:${row.commercialBadge.color}; border:1px solid ${row.commercialBadge.border}; font-weight:800; font-size:10px; padding:3px 8px; border-radius:6px; display:inline-block;">
                      ${row.commercialBadge.icon} ${row.commercialBadge.label}
                    </span>
                  </td>

                  <!-- Purchases & Unit Cost -->
                  <td style="text-align:center;">
                    <div class="mono font-bold" style="font-size:12px;">${row.totalQty} ${row.unit}</div>
                    <div style="font-size:9.5px; color:#64748b; margin-top:2px;">متوسط: <b>${formatCurrency(row.avgPurchasePrice)}</b></div>
                    <div style="font-size:9.5px; color:#64748b;">إجمالي: <b class="mono">${formatCurrency(row.totalAmount)}</b></div>
                  </td>

                  <!-- Demand Frequency -->
                  <td style="text-align:center;">
                    <div class="mono font-bold" style="font-size:13.5px; color:#6366f1;">${row.demandCount}</div>
                    <div style="font-size:9.5px; color:#64748b; margin-top:2px;">
                      ${row.salesInvoiceCount} فاتورة بيع
                    </div>
                    <div style="font-size:9px; color:#94a3b8;">
                      ${row.quotationsCount} عرض أسعار
                    </div>
                  </td>

                  <!-- Sales & Sell-Through Progress -->
                  <td style="text-align:center; padding:8px 10px;">
                    <div class="mono font-bold" style="font-size:13px; color:#0284c7;">
                      ${row.qtySold} ${row.unit}
                    </div>
                    <div style="background:#e2e8f0; border-radius:4px; height:5px; width:100%; margin:4px 0; overflow:hidden;">
                      <div style="background:${sellColor}; height:100%; width:${sellRate}%;"></div>
                    </div>
                    <div style="font-size:9.5px; color:#475569; font-weight:700;">
                      تصريف: <span class="mono">${row.sellThroughRate.toFixed(1)}%</span>
                    </div>
                  </td>

                  <!-- Sales Revenue -->
                  <td class="mono font-bold" style="text-align:left; font-size:12.5px; color:#1e1b4b;">
                    ${formatCurrency(row.salesRevenue)}
                    <div style="font-size:9.5px; color:#64748b; font-weight:400; margin-top:2px;">متوسط بيع: ${formatCurrency(row.avgSellingPrice)}</div>
                  </td>

                  <!-- Gross Profit -->
                  <td class="mono font-bold" style="text-align:left; font-size:13px; color:${profitClass};">
                    ${formatCurrency(row.grossProfit)}
                  </td>

                  <!-- Margin % -->
                  <td style="text-align:center;">
                    <span class="badge" style="background:${row.marginPct >= 20 ? '#dcfce7' : row.marginPct >= 10 ? '#e0f2fe' : row.marginPct > 0 ? '#fef3c7' : '#fee2e2'}; color:${row.marginPct >= 20 ? '#15803d' : row.marginPct >= 10 ? '#0369a1' : row.marginPct > 0 ? '#92400e' : '#b91c1c'}; font-size:11px; font-weight:800; font-family:'IBM Plex Mono', monospace; padding:2px 6px; border-radius:4px;">
                      ${row.marginPct.toFixed(1)}%
                    </span>
                  </td>

                  <!-- Cheapest Supplier & Savings -->
                  <td style="text-align:right;">
                    <div style="font-weight:800; font-size:11px; color:#166534; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${bestSup?.supplierName || ''}">
                      🥇 ${bestSup?.supplierName || '—'}
                    </div>
                    <div class="mono font-bold" style="font-size:11.5px; color:#15803d; margin-top:1px;">
                      ${formatCurrency(row.minPrice)}
                    </div>
                    ${row.priceSpread > 0 ? `
                      <div style="font-size:9px; color:#059669; font-weight:700;">وفر ${formatCurrency(row.priceSpread)} عن الأعلى</div>
                    ` : ''}
                  </td>

                  <!-- Commercial Recommendation -->
                  <td style="font-size:10px; line-height:1.35; ${adviceStyle}" class="no-print">
                    ${adviceText}
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
          <tfoot style="background:var(--bg-2); font-weight:800; border-top:2px solid var(--border-soft);">
            <tr>
              <td colspan="3" style="text-align:right; padding:10px 14px; font-size:12.5px; color:var(--text-0);">
                الإجمالي العام للأصناف المعروضة:
              </td>
              <td class="mono font-bold" style="text-align:center; font-size:12px;">
                ${totalPurchasedQty.toLocaleString('en-US')}
                <div style="font-size:10px; color:#64748b;">${formatCurrency(totalPurchasesSpend)}</div>
              </td>
              <td class="mono font-bold" style="text-align:center; font-size:12px; color:#6366f1;">
                ${data.reduce((s, d) => s + d.demandCount, 0)} طلب
              </td>
              <td class="mono font-bold" style="text-align:center; font-size:12px; color:#0284c7;">
                ${totalSoldQty.toLocaleString('en-US')}
                <div style="font-size:9.5px; color:#059669;">تصريف ${overallSellThrough.toFixed(1)}%</div>
              </td>
              <td class="mono font-bold" style="text-align:left; font-size:13px; color:#1e1b4b; padding:10px 14px;">
                ${formatCurrency(totalRevenue)}
              </td>
              <td class="mono font-bold" style="text-align:left; font-size:13.5px; color:#10b981; padding:10px 14px;">
                ${formatCurrency(totalGrossProfit)}
              </td>
              <td class="mono font-bold" style="text-align:center; font-size:12.5px; color:#8b5cf6;">
                ${overallMarginPct.toFixed(1)}%
              </td>
              <td colspan="2" class="no-print"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;
}

/**
 * Setup Global Window Handlers
 */
function setupGlobalFunctions() {
  window.sphSwitchTab = (tab) => {
    currentFilters.activeTab = tab;
    const btnReport = document.getElementById("sph-tab-report");
    const btnProfit = document.getElementById("sph-tab-profit");
    const btnCompare = document.getElementById("sph-tab-compare");
    const filterReport = document.getElementById("sph-filterbar-report");
    const filterCompare = document.getElementById("sph-filterbar-compare");

    // Remove floating RFQ bar if leaving purchases-report tab
    if (tab !== "purchases-report") {
      document.getElementById("sph-floating-rfq-bar")?.remove();
    }

    [btnReport, btnProfit, btnCompare].forEach(b => {
      if (b) {
        b.classList.remove("btn-primary");
        b.classList.add("btn-secondary");
      }
    });

    if (tab === "purchases-report") {
      btnReport?.classList.add("btn-primary");
      btnReport?.classList.remove("btn-secondary");
      filterReport?.classList.remove("hidden");
      filterCompare?.classList.add("hidden");
      renderPurchasesReport();
    } else if (tab === "sales-profit") {
      btnProfit?.classList.add("btn-primary");
      btnProfit?.classList.remove("btn-secondary");
      filterReport?.classList.remove("hidden");
      filterCompare?.classList.add("hidden");
      renderProfitabilityReport();
    } else {
      btnCompare?.classList.add("btn-primary");
      btnCompare?.classList.remove("btn-secondary");
      filterCompare?.classList.remove("hidden");
      filterReport?.classList.add("hidden");
      renderProductCompareView();
    }
  };

  // Instant Profit Sorting in Tab 3
  window.sphSetProfitSort = (sortKey) => {
    currentFilters.profitSort = sortKey;
    renderProfitabilityReport();
  };

  // Tab 1: Column Header Sorting (Asc / Desc toggle)
  window.sphSortTab1 = (col) => {
    if (currentFilters.sortCol === col) {
      currentFilters.sortDir = currentFilters.sortDir === "asc" ? "desc" : "asc";
    } else {
      currentFilters.sortCol = col;
      currentFilters.sortDir = (col === "productName" ? "asc" : "desc");
    }
    renderPurchasesReport();
  };

  // Quick Filter Chips Handler
  window.sphSetQuickFilter = (filterKey) => {
    currentFilters.quickFilter = filterKey;
    renderPurchasesReport();
  };

  // 1-Click Auto Select Stockout Items
  window.sphAutoSelectStockout = () => {
    const allData = processPurchasesData(true);
    const stockoutItems = allData.filter(r => r.currentStock <= 0);
    if (stockoutItems.length === 0) {
      alert("رائع! لا توجد أي أصناف نافذة من المخزون حالياً.");
      return;
    }
    stockoutItems.forEach(row => {
      const existing = selectedRfqItems.get(row.productKey);
      const defaultQty = existing?.reqQty || (row.totalQty > 0 ? Math.round(row.totalQty / (row.suppliers[0]?.purchaseCount || 1)) : 50) || 50;
      selectedRfqItems.set(row.productKey, {
        productKey: row.productKey,
        productId: row.productId,
        productName: row.productName,
        sku: row.sku,
        unit: row.unit,
        reqQty: defaultQty,
        currentStock: row.currentStock,
        minPrice: row.minPrice,
        priceSpread: row.priceSpread || 0,
        bestSupplier: row.suppliers[0]?.supplierName || ""
      });
    });
    currentFilters.quickFilter = "stockout";
    renderPurchasesReport();
  };

  // RFQ: Item checkbox toggle
  window.sphToggleItemSelection = (key, isChecked) => {
    const data = processPurchasesData();
    const row = data.find(r => r.productKey === key);
    if (!row) return;

    if (isChecked) {
      const existing = selectedRfqItems.get(key);
      const defaultQty = existing?.reqQty || (row.totalQty > 0 ? Math.round(row.totalQty / (row.suppliers[0]?.purchaseCount || 1)) : 50) || 50;
      selectedRfqItems.set(key, {
        productKey: row.productKey,
        productId: row.productId,
        productName: row.productName,
        sku: row.sku,
        unit: row.unit,
        reqQty: defaultQty,
        currentStock: row.currentStock,
        minPrice: row.minPrice,
        priceSpread: row.priceSpread || 0,
        bestSupplier: row.suppliers[0]?.supplierName || ""
      });
    } else {
      selectedRfqItems.delete(key);
    }

    // Direct DOM update for instant visual feedback
    const cb = document.querySelector(`.sph-row-checkbox[data-prod-key="${key}"]`);
    if (cb) {
      cb.checked = isChecked;
      const tr = cb.closest("tr");
      if (tr) {
        if (isChecked) {
          tr.style.setProperty("background", "#fefce8", "important");
          tr.style.borderRight = "4px solid #d97706";
        } else {
          tr.style.removeProperty("background");
          tr.style.borderRight = "";
        }
      }
    }

    // Update master select-all checkbox
    const masterCb = document.getElementById("sph-select-all");
    if (masterCb) {
      const allSelected = data.length > 0 && data.every(r => selectedRfqItems.has(r.productKey));
      const anySelected = data.some(r => selectedRfqItems.has(r.productKey));
      masterCb.checked = allSelected;
      masterCb.indeterminate = !allSelected && anySelected;
    }

    renderRfqActionBar();
  };

  // RFQ: Select All / Deselect All
  window.sphToggleSelectAll = (isChecked) => {
    const data = processPurchasesData();
    if (isChecked) {
      data.forEach(row => {
        const existing = selectedRfqItems.get(row.productKey);
        const defaultQty = existing?.reqQty || (row.totalQty > 0 ? Math.round(row.totalQty / (row.suppliers[0]?.purchaseCount || 1)) : 50) || 50;
        selectedRfqItems.set(row.productKey, {
          productKey: row.productKey,
          productId: row.productId,
          productName: row.productName,
          sku: row.sku,
          unit: row.unit,
          reqQty: defaultQty,
          currentStock: row.currentStock,
          minPrice: row.minPrice,
          priceSpread: row.priceSpread || 0,
          bestSupplier: row.suppliers[0]?.supplierName || ""
        });
      });
    } else {
      selectedRfqItems.clear();
    }
    renderPurchasesReport();
  };

  // RFQ: Update requested quantity input
  window.sphUpdateReqQty = (key, val) => {
    const parsed = Math.max(1, parseFloat(val) || 1);
    if (selectedRfqItems.has(key)) {
      const item = selectedRfqItems.get(key);
      item.reqQty = parsed;
    } else {
      const data = processPurchasesData();
      const row = data.find(r => r.productKey === key);
      if (row) {
        selectedRfqItems.set(key, {
          productKey: row.productKey,
          productId: row.productId,
          productName: row.productName,
          sku: row.sku,
          unit: row.unit,
          reqQty: parsed,
          currentStock: row.currentStock,
          minPrice: row.minPrice,
          priceSpread: row.priceSpread || 0,
          bestSupplier: row.suppliers[0]?.supplierName || ""
        });
      }
    }

    // Auto-check checkbox and illuminate row immediately
    const cb = document.querySelector(`.sph-row-checkbox[data-prod-key="${key}"]`);
    if (cb) {
      cb.checked = true;
      const tr = cb.closest("tr");
      if (tr) {
        tr.style.setProperty("background", "#fefce8", "important");
        tr.style.borderRight = "4px solid #d97706";
      }
    }

    renderRfqActionBar();
  };

  // RFQ: Clear Selection
  window.sphClearRfqSelection = () => {
    selectedRfqItems.clear();
    activeSavedRfq = null;
    try { sessionStorage.removeItem("sph_active_rfq"); } catch {}
    renderPurchasesReport();
  };

  // RFQ: Save or Update to system purchaseRequests collection
  window.saveOrUpdateRfqToSystem = async (silent = false, forceNew = false) => {
    if (selectedRfqItems.size === 0) {
      if (!silent) alert("يرجى تحديد صنف واحد على الأقل أولاً لإصدار أو تحديث طلب التسعير.");
      return null;
    }

    const items = Array.from(selectedRfqItems.values());
    const todayStr = new Date().toISOString().slice(0, 10);
    const cleanLines = items.map(it => ({
      productId: it.productId || "",
      productName: it.productName,
      sku: it.sku || "",
      unit: it.unit || "Carton",
      qty: parseFloat(it.reqQty) || 1,
      packQty: 1,
      notes: `أفضل مورد سابق: ${it.bestSupplier || "—"} | أدنى سعر: ${it.minPrice || 0} ر.س`,
      offeredPrice: 0
    }));
    const totalReqQty = items.reduce((s, it) => s + (parseFloat(it.reqQty) || 0), 0);

    // If we have an activeSavedRfq and NOT forcing new, update existing document
    if (!forceNew && activeSavedRfq && activeSavedRfq.id) {
      try {
        const updateData = {
          lines: cleanLines,
          items: cleanLines,
          itemCount: items.length,
          totalRequestedQuantity: totalReqQty,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser?.name || currentUser?.email || "المشتريات"
        };
        await update(COLS.purchaseRequests(), activeSavedRfq.id, updateData);
        activeSavedRfq.itemCount = items.length;
        try { sessionStorage.setItem("sph_active_rfq", JSON.stringify(activeSavedRfq)); } catch {}

        renderRfqActionBar();
        if (!silent) {
          if (window.showToast) {
            window.showToast(`✅ تم تحديث طلب التسعير [${activeSavedRfq.number}] بنجاح ليصبح (${items.length}) أصناف!`, "success", 4000);
          } else {
            alert(`✅ تم تحديث طلب عرض الأسعار الحالي برقم [${activeSavedRfq.number}] بنجاح ليصبح (${items.length}) أصناف!`);
          }
        }
        return activeSavedRfq.number;
      } catch (errUp) {
        console.warn("Could not update existing RFQ, will create new instead:", errUp);
      }
    }

    // Otherwise create a new document in purchaseRequests
    try {
      const rfqNumber = `RFQ-${todayStr.replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
      const rfqDoc = {
        number: rfqNumber,
        rfqNumber,
        date: todayStr,
        requestDate: todayStr,
        supplierId: "general",
        supplierName: "طلب تسعير عام للموردين",
        targetDate: "",
        status: "draft",
        type: "supplier_rfq",
        itemCount: items.length,
        totalRequestedQuantity: totalReqQty,
        lines: cleanLines,
        items: cleanLines,
        notes: "تم إنشاء طلب التسعير من شاشة مصفوفة مشتريات الأصناف ومقارنة الموردين",
        createdBy: currentUser?.name || currentUser?.email || "المشتريات",
        createdAt: new Date().toISOString()
      };

      const docRef = await create(COLS.purchaseRequests(), rfqDoc);
      const newId = docRef?.id || docRef;
      activeSavedRfq = {
        id: newId,
        number: rfqNumber,
        itemCount: items.length
      };
      try { sessionStorage.setItem("sph_active_rfq", JSON.stringify(activeSavedRfq)); } catch {}

      renderRfqActionBar();
      if (!silent) {
        if (window.showToast) {
          window.showToast(`✅ تم حفظ طلب التسعير الجديد برقم [${rfqNumber}] (${items.length} صنف)!`, "success", 4000);
        } else {
          alert(`✅ تم حفظ طلب عرض الأسعار الجديد برقم [${rfqNumber}] بنجاح في سجل طلبات الشراء بالنظام! (${items.length} صنف)`);
        }
      }
      return rfqNumber;
    } catch (err) {
      console.error("Error saving RFQ:", err);
      if (!silent) alert("تعذر حفظ الطلب في النظام: " + (err.message || err));
      return null;
    }
  };

  // RFQ: Royal Official Print / PDF with guaranteed auto-save & official company header
  window.printRoyalSupplierRfq = async () => {
    if (selectedRfqItems.size === 0) {
      alert("يرجى تحديد صنف واحد على الأقل لإصدار وطباعة طلب عرض السعر.");
      return;
    }

    // Auto-save or update in background to guarantee the printed document is saved in the system
    const rfqNumber = await window.saveOrUpdateRfqToSystem(true, false);
    if (!rfqNumber) {
      alert("تعذر حفظ وتأكيد رقم الطلب في النظام قبل الطباعة.");
      return;
    }

    const items = Array.from(selectedRfqItems.values());
    const co = companySettings || (() => {
      try { return JSON.parse(localStorage.getItem("idham_company") || "{}"); } catch { return {}; }
    })();

    const todayStr = new Date().toISOString().slice(0, 10);
    const totalItemsCount = items.length;
    const totalReqQty = items.reduce((s, it) => s + (parseFloat(it.reqQty) || 0), 0);

    const printWin = window.open("", "_blank");
    if (!printWin) {
      alert("يرجى السماح بالنوافذ المنبثقة لإتمام الطباعة الملكية.");
      return;
    }

    printWin.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>طلب عرض أسعار توريد — ${rfqNumber} — ${companySettings.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@500;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Cairo', system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 14px; font-size: 11px; line-height: 1.4; }
    .no-print { margin-bottom: 12px; display: flex; justify-content: flex-end; gap: 8px; }
    .btn { padding: 6px 16px; border-radius: 6px; font-family: 'Cairo', sans-serif; font-size: 11.5px; font-weight: 800; cursor: pointer; border: none; }
    .royal-sheet { max-width: 290mm; margin: 0 auto; background: #fff; border: 1.5px solid #0f172a; border-radius: 8px; padding: 16px 20px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    .royal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px; }
    .royal-title-box h1 { font-size: 19px; font-weight: 900; color: #0f172a; margin-bottom: 2px; }
    .royal-title-box h2 { font-size: 12px; font-weight: 700; color: #d97706; }
    .gold-pill { display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; margin-top: 4px; }
    .co-meta { text-align: left; font-size: 10.5px; color: #334155; }
    .co-meta b { color: #0f172a; }
    
    .rfq-info-strip { display: grid; grid-template-columns: 1.5fr 1fr; gap: 10px; margin-bottom: 12px; }
    .info-card { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; }
    .info-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px; }
    .info-row:last-child { margin-bottom: 0; }
    .supplier-fill-box { border: 1.5px dashed #d97706; background: #fffbeb; border-radius: 6px; padding: 8px 12px; }

    .instructions-bar { background: #eff6ff; border-right: 4px solid #2563eb; padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; font-size: 10.5px; color: #1e40af; }

    .royal-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; border: 1.5px solid #0f172a; font-size: 10px; }
    .royal-table thead { display: table-header-group !important; }
    .royal-table thead tr { background: #0f172a !important; color: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .royal-table thead th { padding: 7px 6px; font-size: 9.5px; font-weight: 800; text-align: center; border: 1px solid #334155; }
    .royal-table tbody tr { border-bottom: 1px solid #cbd5e1; page-break-inside: avoid !important; break-inside: avoid !important; }
    .royal-table tbody tr:nth-child(even) { background: #f8fafc; }
    .royal-table tbody td { padding: 6px 6px; text-align: center; border: 1px solid #cbd5e1; color: #0f172a; }
    .royal-table tbody td.desc { text-align: right; }
    .royal-table .supplier-cell { background: #fff !important; border: 1.5px dashed #64748b; }

    .conditions-box { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; margin-bottom: 14px; font-size: 9.5px; color: #334155; }
    .conditions-box ul { padding-right: 18px; margin-top: 4px; }
    .conditions-box li { margin-bottom: 2px; }

    .signatures-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 14px; page-break-inside: avoid !important; break-inside: avoid !important; }
    .sig-card { border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 10px 14px; background: #fff; min-height: 80px; }
    .sig-title { font-weight: 800; color: #0f172a; font-size: 10.5px; margin-bottom: 6px; }
    .sig-line { font-size: 9.5px; color: #475569; margin-top: 6px; }

    .mono { font-family: 'IBM Plex Mono', monospace; }
    .font-bold { font-weight: 700; }

    @media print {
      body { background: #fff; padding: 0; font-size: 10px; }
      .no-print { display: none !important; }
      .royal-sheet { border: 1px solid #0f172a !important; box-shadow: none !important; padding: 4px !important; max-width: 100% !important; border-radius: 0 !important; }
      tr, .sig-card, .info-card, .supplier-fill-box { page-break-inside: avoid !important; break-inside: avoid !important; }
      @page { size: A4 portrait; margin: 8mm; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn" onclick="window.print()" style="background:#0f172a; color:#fff;">🖨️ طباعة المستند الرسمي (Ctrl+P)</button>
    <button class="btn" onclick="window.close()" style="background:#ef4444; color:#fff;">إغلاق</button>
  </div>

  <div class="royal-sheet">
    <div class="royal-header">
      <div class="royal-title-box">
        <h1>${companySettings.name || "شركة نظم الإمداد المتطوره"}</h1>
        <h2>طلب عرض أسعار توريد (Request For Quotation - RFQ)</h2>
        <div class="gold-pill">وثيقة استدراج أسعار رسمية معتمدة</div>
      </div>
      <div class="co-meta">
        <div><b>رقم الطلب:</b> <span class="mono font-bold" style="color:#d97706; font-size:12.5px;">${rfqNumber}</span></div>
        <div><b>التاريخ:</b> ${todayStr}</div>
        <div><b>س.ت:</b> <span class="mono font-bold">${companySettings.crNumber || "7054969006"}</span></div>
        <div><b>الرقم الضريبي:</b> <span class="mono font-bold">${companySettings.vatNumber || "314996148100003"}</span></div>
        <div><b>جوال / هاتف:</b> <span class="mono font-bold">${companySettings.phone || "0549141648"}</span></div>
      </div>
    </div>

    <div class="rfq-info-strip">
      <div class="supplier-fill-box">
        <div class="info-row">
          <span><b>المكرم السادة الموردين:</b></span>
          <span style="color:#64748b;">(شركة / مؤسسة: ____________________________________)</span>
        </div>
        <div class="info-row" style="margin-top:4px;">
          <span><b>عناية السيد:</b> _________________________</span>
          <span><b>هاتف / جوال:</b> _________________________</span>
        </div>
      </div>
      <div class="info-card">
        <div class="info-row">
          <span>عدد الأصناف المطلوبة:</span>
          <b class="mono font-bold">${totalItemsCount} صنف</b>
        </div>
        <div class="info-row">
          <span>إجمالي الكميات:</span>
          <b class="mono font-bold" style="color:#0f172a;">${totalReqQty.toLocaleString('en-US')} وحدة</b>
        </div>
        <div class="info-row">
          <span>الموقع / المستودع:</b></span>
          <span>مستودعات شركة نظم الإمداد المتطوره — ينبع</span>
        </div>
      </div>
    </div>

    <div class="instructions-bar">
      📌 <b>تنبيه هام للسادة الموردين:</b> يرجى التكرم بتعبئة الأسعار المقترحة للوحدة وموعد التوريد وتوضيح أي شروط إضافية، وإعادة إرسال هذا النموذج بعد توقيعه وختمه رسمياً لاعتماده والبدء بإصدار أمر الشراء.
    </div>

    <table class="royal-table">
      <thead>
        <tr>
          <th style="width:30px;">م</th>
          <th style="width:90px;">كود الصنف</th>
          <th style="width:220px;">اسم الصنف والبيان التفصيلي</th>
          <th style="width:65px;">الوحدة</th>
          <th style="width:85px;">الكمية المطلوبة</th>
          <th style="width:110px;">سعر الوحدة المقترح<br/>(غير شامل الضريبة)</th>
          <th style="width:65px;">ضريبة %</th>
          <th style="width:115px;">الإجمالي المقترح<br/>(شامل الضريبة)</th>
          <th style="width:110px;">مدة التوريد وملاحظات</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((it, idx) => `
          <tr>
            <td class="mono font-bold">${idx + 1}</td>
            <td class="mono font-bold" style="color:#475569;">${it.sku || "—"}</td>
            <td class="desc">
              <div class="font-bold" style="font-size:11px;">${it.productName}</div>
            </td>
            <td><b>${it.unit}</b></td>
            <td class="mono font-bold" style="font-size:12px; color:#0f172a; background:#f0fdf4;">${it.reqQty}</td>
            <td class="supplier-cell mono" style="font-size:11px; color:#475569;">[ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ر.س ]</td>
            <td class="mono">15%</td>
            <td class="supplier-cell mono" style="font-size:11px; color:#475569;">[ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ر.س ]</td>
            <td class="supplier-cell" style="font-size:9.5px; color:#64748b;"></td>
          </tr>
        `).join("")}
      </tbody>
      <tfoot style="background:#f1f5f9; font-weight:800; border-top:2px solid #0f172a;">
        <tr>
          <td colspan="4" style="text-align:right; padding:6px 10px;">إجمالي بنود طلب التسعير:</td>
          <td class="mono font-bold" style="font-size:12px; color:#0f172a;">${totalReqQty.toLocaleString('en-US')}</td>
          <td colspan="4" style="text-align:left; padding:6px 10px; color:#64748b; font-size:9.5px;">(يُدون الإجمالي الكلي المقترح من واقع تسعير المورد)</td>
        </tr>
      </tfoot>
    </table>

    <div class="conditions-box">
      <b>📋 الشروط والأحكام العامة للتوريد:</b>
      <ul>
        <li>الأسعار المقدمة يجب أن تكون شاملة لكافة تكاليف الشحن والتوصيل والتفريغ بمستودعات ${companySettings.name || "شركة نظم الإمداد المتطوره"}.</li>
        <li>صلاحية عرض السعر المقدم يجب ألا تقل عن (15) يوماً تقويمياً من تاريخ تقديمه.</li>
        <li>يجب أن تكون المنتجات الغذائية مطابقة لكافة اشتراطات الهيئة العامة للغذاء والدواء (SFDA) مع توفر مدة صلاحية لا تقل عن ثلثي المدة الكلية.</li>
        <li>في حال الترسية والاعتماد، سيتم إصدار أمر شراء رسمي (PO) مرتبط بهذا العرض.</li>
      </ul>
    </div>

    <div class="signatures-row">
      <div class="sig-card">
        <div class="sig-title">✍️ جهة إصدار الطلب — ${companySettings.name || "شركة نظم الإمداد المتطوره"}</div>
        <div class="sig-line">مسؤول المشتريات: ___________________________</div>
        <div class="sig-line">التوقيع والاعتماد: ___________________________</div>
        <div class="sig-line">التاريخ: ${todayStr}</div>
      </div>

      <div class="sig-card" style="border-color:#d97706; background:#fffbeb;">
        <div class="sig-title" style="color:#b45309;">✍️ اعتماد وقبول المورد (المفوض بالتسعير)</div>
        <div class="sig-line">اسم المفوض: _______________________________</div>
        <div class="sig-line">التوقيع وختم المورد الرسمي: __________________</div>
        <div class="sig-line">مدة صلاحية الأسعار: _______________________</div>
      </div>
    </div>
  </div>
</body>
</html>`);
    printWin.document.close();
  };

  // RFQ: Copy formatted text for WhatsApp
  window.copyRfqWhatsAppText = () => {
    if (selectedRfqItems.size === 0) {
      alert("يرجى تحديد صنف واحد على الأقل.");
      return;
    }

    const items = Array.from(selectedRfqItems.values());
    const todayStr = new Date().toISOString().slice(0, 10);
    const rfqNumber = activeSavedRfq?.number || `RFQ-${todayStr.replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`;

    let text = `*طلب عرض أسعار توريد (RFQ)* 📦\n`;
    text += `*${companySettings.name || "شركة نظم الإمداد المتطوره"}*\n`;
    text += `رقم الطلب: ${rfqNumber}\n`;
    text += `التاريخ: ${todayStr}\n`;
    text += `س.ت: ${companySettings.crNumber || "7054969006"} | الرقم الضريبي: ${companySettings.vatNumber || "314996148100003"}\n`;
    text += `جوال / هاتف: ${companySettings.phone || "0549141648"}\n`;
    text += `------------------------------------\n`;
    text += `السادة الموردين الكرام،\n`;
    text += `يرجى التكرم بتسعير الأصناف والكميات المطلوبة أدناه مع بيان مدة التوريد وصلاحية الأسعار:\n\n`;

    items.forEach((it, idx) => {
      text += `${idx + 1}) *${it.productName}*\n`;
      text += `   - الكمية المطلوبة: *${it.reqQty}* ${it.unit}\n`;
      if (it.sku && it.sku !== "—") text += `   - كود الصنف: ${it.sku}\n`;
    });

    text += `\n------------------------------------\n`;
    text += `📍 التسليم: مستودعات ${companySettings.name || "شركة نظم الإمداد المتطوره"} — ينبع\n`;
    text += `شاكرين ومقدرين حسن وسرعة تعاونكم.\n`;
    text += `*إدارة المشتريات — ${companySettings.name || "شركة نظم الإمداد المتطوره"}*`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        alert("✅ تم نسخ نص طلب عرض الأسعار بنجاح!\nيمكنك الآن لصقه مباشرة في محادثة الواتساب مع المورد.");
      }).catch(() => {
        prompt("يرجى نسخ النص التالي:", text);
      });
    } else {
      prompt("يرجى نسخ النص التالي:", text);
    }
  };

  // RFQ: Save to system purchaseRequests collection (calls saveOrUpdateRfqToSystem)
  window.saveRfqToSystem = async () => {
    return await window.saveOrUpdateRfqToSystem(false, false);
  };

  // Close Action Modal
  window.sphCloseActionModal = () => {
    const modal = document.getElementById("sph-action-modal");
    if (modal) {
      modal.classList.remove("active");
      modal.classList.add("hidden");
      modal.style.display = "none";
    }
  };

  // RFQ: Save and 1-Click Navigate to purchaseRequests screen
  window.saveRfqAndNavigate = async () => {
    if (selectedRfqItems.size === 0) {
      alert("يرجى تحديد صنف واحد على الأقل.");
      return;
    }
    const rfqNo = await window.saveOrUpdateRfqToSystem(true, false);
    if (rfqNo) {
      window.sphCloseActionModal();
      location.hash = "#purchase-requests";
    }
  };

  // RFQ: Transfer to Customer Sales Quotations module
  window.transferToSalesQuotations = () => {
    if (selectedRfqItems.size === 0) {
      alert("يرجى تحديد صنف واحد على الأقل.");
      return;
    }
    const items = Array.from(selectedRfqItems.values());
    const quoteData = items.map(it => ({
      productId: it.productId || "",
      productName: it.productName,
      unit: it.unit || "Carton",
      qty: parseFloat(it.reqQty) || 1,
      price: it.minPrice > 0 ? Math.round(it.minPrice * 1.15 * 100) / 100 : 0
    }));

    try {
      sessionStorage.setItem("idham_prefilled_quote_lines", JSON.stringify(quoteData));
    } catch {}

    window.sphCloseActionModal();
    alert(`✅ تم تجهيز (${quoteData.length}) أصناف بنجاح لعرض السعر!\nجاري الانتقال لشاشة عروض أسعار المبيعات...`);
    location.hash = "#quotations";
  };

  // Executive RFQ Action & Dispatch Modal
  window.sphOpenActionModal = () => {
    if (selectedRfqItems.size === 0) {
      alert("يرجى تحديد صنف واحد على الأقل أولاً بالـ Checkbox.");
      return;
    }

    const items = Array.from(selectedRfqItems.values());
    const count = items.length;
    const totalQty = items.reduce((s, it) => s + (parseFloat(it.reqQty) || 0), 0);

    let modal = document.getElementById("sph-action-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "sph-action-modal";
      modal.className = "modal-overlay active";
      document.body.appendChild(modal);
    }

    modal.style.cssText = "position:fixed; inset:0; background:rgba(15,23,42,0.75); z-index:999999; display:flex !important; align-items:center; justify-content:center; padding:16px; opacity:1 !important; visibility:visible !important; pointer-events:auto !important; backdrop-filter:blur(4px);";
    modal.classList.add("active");
    modal.classList.remove("hidden");

    modal.onclick = (e) => {
      if (e.target === modal) {
        window.sphCloseActionModal();
      }
    };

    const statusBannerHtml = activeSavedRfq ? `
      <div style="background:#ecfdf5; border:1.5px solid #86efac; border-radius:10px; padding:10px 16px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div style="font-size:12px; color:#166534; font-weight:800; display:flex; align-items:center; gap:6px;">
          <span>🟢</span>
          <span>الطلب محفوظ ومسجل بالنظام برقم: <b class="mono" style="color:#0f172a; font-size:13px;">${activeSavedRfq.number}</b> (يحتوي حالياً على ${count} أصناف)</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn" onclick="window.saveOrUpdateRfqToSystem(false, false)" style="background:#059669; color:#fff; font-size:11.5px; font-weight:800; padding:5px 12px; border-radius:6px; border:none; cursor:pointer; display:flex; align-items:center; gap:4px;">
            <span>💾</span> <span>تحديث التعديلات الحالية</span>
          </button>
          <button class="btn" onclick="window.saveOrUpdateRfqToSystem(false, true)" style="background:#d97706; color:#fff; font-size:11.5px; font-weight:800; padding:5px 12px; border-radius:6px; border:none; cursor:pointer; display:flex; align-items:center; gap:4px;">
            <span>➕</span> <span>حفظ كطلب جديد برقم جديد</span>
          </button>
        </div>
      </div>
    ` : `
      <div style="background:#fefce8; border:1.5px solid #fde047; border-radius:10px; padding:10px 16px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div style="font-size:12px; color:#854d0e; font-weight:800; display:flex; align-items:center; gap:6px;">
          <span>🟡</span>
          <span>مسودة طلب تسعير جديدة — تم تحديد ${count} أصناف (لم تُحفظ بعد في سجل مشتريات النظام)</span>
        </div>
        <button class="btn" onclick="window.saveOrUpdateRfqToSystem(false, false)" style="background:#d97706; color:#fff; font-size:11.5px; font-weight:800; padding:5px 14px; border-radius:6px; border:none; cursor:pointer; display:flex; align-items:center; gap:4px;">
          <span>💾</span> <span>حفظ الطلب الآن بالنظام</span>
        </button>
      </div>
    `;

    modal.innerHTML = `
      <div class="modal modal-lg" onclick="event.stopPropagation()" style="max-width:860px; width:100%; border-radius:16px; overflow:hidden; border:1px solid var(--border-soft); box-shadow:0 25px 70px rgba(0,0,0,0.45); animation:modalIn 0.2s ease;">
        <div class="modal-header" style="background:linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color:#ffffff; padding:16px 22px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 class="modal-title" style="color:#ffffff; font-size:16px; font-weight:900; display:flex; align-items:center; gap:8px;">
              <span>👑</span>
              <span>خيارات إصدار وإرسال طلب عرض الأسعار للمشتريات (RFQ)</span>
            </h3>
            <div style="font-size:11.5px; color:#e0e7ff; margin-top:2px;">
              تم تحديد <b style="color:#fde68a;">${count}</b> أصناف بإجمالي كميات <b style="color:#fde68a;">${totalQty.toLocaleString('en-US')}</b>
            </div>
          </div>
          <button class="modal-close" onclick="window.sphCloseActionModal()" style="color:#ffffff; opacity:0.8; font-size:22px; cursor:pointer; background:none; border:none;">×</button>
        </div>

        <div class="modal-body" style="padding:18px 22px; max-height:75vh; overflow-y:auto; background:var(--bg-1);">
          <!-- Dynamic Persistence Status Banner -->
          ${statusBannerHtml}

          <!-- 4 Executive Action Cards -->
          <div style="margin-bottom:18px;">
            <div style="font-size:12.5px; font-weight:800; color:var(--text-1); margin-bottom:10px;">اختر الإجراء أو طريقة الإرسال المناسبة:</div>
            
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(185px, 1fr)); gap:12px;">
              <!-- 1. Royal PDF -->
              <div onclick="window.printRoyalSupplierRfq()" style="background:#fff; border:1.5px solid #d97706; border-radius:12px; padding:12px 14px; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(217,119,6,0.12);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                <div style="font-size:22px; margin-bottom:4px;">👑</div>
                <div style="font-size:13px; font-weight:900; color:#92400e;">طباعة PDF ملكية رسمية</div>
                <div style="font-size:10.5px; color:var(--text-2); margin-top:3px; line-height:1.4;">وثيقة استدراج أسعار معتمدة باسم شركة نظم الإمداد المتطوره مع حفظ تلقائي فوري بالنظام.</div>
                <button class="btn" style="background:#d97706; color:#fff; font-size:11px; font-weight:800; padding:5px 12px; border-radius:6px; margin-top:10px; width:100%; border:none; cursor:pointer;">🖨️ فتح المستند الملكي</button>
              </div>

              <!-- 2. Transfer to RFQ Module -->
              <div onclick="window.saveRfqAndNavigate()" style="background:#fff; border:1.5px solid #4f46e5; border-radius:12px; padding:12px 14px; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(79,70,229,0.12);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                <div style="font-size:22px; margin-bottom:4px;">🚀</div>
                <div style="font-size:13px; font-weight:900; color:#3730a3;">شاشة طلبات التسعير (RFQ)</div>
                <div style="font-size:10.5px; color:var(--text-2); margin-top:3px; line-height:1.4;">حفظ أو تحديث الطلب فوراً والانتقال لشاشة RFQ لمتابعة عروض الموردين وإدخال الأسعار.</div>
                <button class="btn" style="background:#4f46e5; color:#fff; font-size:11px; font-weight:800; padding:5px 12px; border-radius:6px; margin-top:10px; width:100%; border:none; cursor:pointer;">📦 حفظ وفتح شاشة RFQ</button>
              </div>

              <!-- 3. WhatsApp Direct Text -->
              <div onclick="window.copyRfqWhatsAppText()" style="background:#fff; border:1.5px solid #16a34a; border-radius:12px; padding:12px 14px; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(22,163,74,0.12);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                <div style="font-size:22px; margin-bottom:4px;">💬</div>
                <div style="font-size:13px; font-weight:900; color:#166534;">إرسال فوري بالواتساب</div>
                <div style="font-size:10.5px; color:var(--text-2); margin-top:3px; line-height:1.4;">نسخ رسالة منسقة وجاهزة باسم شركة نظم الإمداد المتطوره للإرسال المباشر للمورد.</div>
                <button class="btn" style="background:#16a34a; color:#fff; font-size:11px; font-weight:800; padding:5px 12px; border-radius:6px; margin-top:10px; width:100%; border:none; cursor:pointer;">📋 نسخ نص الواتساب</button>
              </div>

              <!-- 4. Transfer to Sales Quotations -->
              <div onclick="window.transferToSalesQuotations()" style="background:#fff; border:1.5px solid #0284c7; border-radius:12px; padding:12px 14px; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(2,132,199,0.12);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                <div style="font-size:22px; margin-bottom:4px;">📑</div>
                <div style="font-size:13px; font-weight:900; color:#075985;">عرض سعر بيع للعملاء</div>
                <div style="font-size:10.5px; color:var(--text-2); margin-top:3px; line-height:1.4;">تجهيز الأصناف والكميات كعرض سعر بيع للعملاء (المشترين) والانتقال لشاشة عروض الأسعار.</div>
                <button class="btn" style="background:#0284c7; color:#fff; font-size:11px; font-weight:800; padding:5px 12px; border-radius:6px; margin-top:10px; width:100%; border:none; cursor:pointer;">💼 تجهيز عرض سعر مبيعات</button>
              </div>
            </div>
          </div>

          <!-- Review Selected Items Table -->
          <div class="card" style="padding:0; overflow:hidden; border:1px solid var(--border-soft); border-radius:10px;">
            <div style="padding:10px 16px; background:var(--bg-2); border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:12px; font-weight:800; color:var(--text-1);">📋 مراجعة وتعديل كميات الأصناف المحددة:</span>
              <button onclick="window.sphClearRfqSelection(); window.sphCloseActionModal();" style="background:none; border:none; color:#dc2626; font-size:11px; font-weight:700; cursor:pointer;">❌ تفريغ التحديد بالكامل</button>
            </div>
            <div style="max-height:260px; overflow-y:auto;">
              <table class="data-dense" style="margin:0; width:100%;">
                <thead style="position:sticky; top:0; background:var(--bg-card); z-index:1;">
                  <tr>
                    <th style="width:30px; text-align:center;">#</th>
                    <th>اسم الصنف</th>
                    <th style="width:80px; text-align:center;">الوحدة</th>
                    <th style="width:90px; text-align:center;">المخزون الحالي</th>
                    <th style="width:150px;">أفضل مورد سابق</th>
                    <th style="width:110px; text-align:center;">الكمية المطلوبة ✍️</th>
                    <th style="width:40px; text-align:center;">حذف</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map((it, idx) => `
                    <tr>
                      <td style="text-align:center; color:var(--text-3);">${idx + 1}</td>
                      <td>
                        <div style="font-weight:800; font-size:12px; color:#1e1b4b;">${it.productName}</div>
                        ${it.sku && it.sku !== "—" ? `<div style="font-size:9.5px; color:var(--text-3);">كود: ${it.sku}</div>` : ''}
                      </td>
                      <td style="text-align:center; font-size:11px; color:var(--text-2);">${it.unit}</td>
                      <td style="text-align:center;" class="mono font-bold">${it.currentStock}</td>
                      <td style="font-size:11px; color:#475569;">
                        <div>${it.bestSupplier || "—"}</div>
                        <div class="mono" style="font-size:10px; color:#16a34a; font-weight:700;">أدنى سعر: ${formatCurrency(it.minPrice)}</div>
                      </td>
                      <td style="text-align:center;">
                        <input type="number" class="input" min="1" step="1" value="${it.reqQty}" 
                               style="width:75px; text-align:center; height:28px; font-weight:900; color:#d97706; border:1.5px solid #d97706; background:#fffbeb; border-radius:6px;"
                               onchange="window.sphUpdateReqQty('${it.productKey}', this.value); window.sphOpenActionModal();" />
                      </td>
                      <td style="text-align:center;">
                        <button onclick="window.sphToggleItemSelection('${it.productKey}', false); window.sphOpenActionModal();" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:14px;" title="إزالة من القائمة">🗑️</button>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="padding:12px 20px; background:#fff; border-top:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:11.5px; color:var(--text-2);">
            💡 يمكنك تعديل أي كمية مباشرة في الجدول أعلاه وسيتم تحديثها فوراً في المستند وطلب التسعير.
          </div>
          <button class="btn btn-secondary" onclick="window.sphCloseActionModal()">إغلاق</button>
        </div>
      </div>
    `;

    modal.classList.add("active");
    modal.classList.remove("hidden");
    modal.style.display = "flex";
  };

  // Instant Product Search in Tab 2
  window.sphOnCompareSearch = (query) => {
    const compProdSel = document.getElementById("sph-compare-prod");
    if (!compProdSel) return;

    const q = (query || "").trim().toLowerCase();
    const filteredProds = allProducts.filter(p => {
      const matchName = (p.name || "").toLowerCase().includes(q);
      const matchSku = (p.sku || "").toLowerCase().includes(q);
      return matchName || matchSku;
    });

    compProdSel.innerHTML = `<option value="">-- نتائج البحث (${filteredProds.length} صنف) --</option>` +
      filteredProds.map(p => `<option value="${p.id}">${p.name} (${p.unit || "كرتون"})</option>`).join("");

    if (filteredProds.length > 0) {
      compProdSel.value = filteredProds[0].id;
      renderProductCompareView();
    }
  };

  // 1-Click Navigate from Tab 1 to Tab 2 for specific product
  window.sphNavigateToProductCompare = (prodId) => {
    window.sphSwitchTab("product-compare");
    const compProdSel = document.getElementById("sph-compare-prod");
    if (compProdSel && prodId) {
      compProdSel.value = prodId;
      renderProductCompareView();
    }
  };

  window.sphOnFilterChange = () => {
    currentFilters.supplierId = document.getElementById("sph-filter-sup")?.value || "";
    currentFilters.productId = document.getElementById("sph-filter-prod")?.value || "";
    currentFilters.dateFrom = document.getElementById("sph-filter-date-from")?.value || "";
    currentFilters.dateTo = document.getElementById("sph-filter-date-to")?.value || "";
    currentFilters.trend = document.getElementById("sph-filter-trend")?.value || "all";
    currentFilters.search = document.getElementById("sph-filter-search")?.value || "";
    if (currentFilters.activeTab === "sales-profit") {
      renderProfitabilityReport();
    } else {
      renderPurchasesReport();
    }
  };

  window.sphResetFilters = () => {
    currentFilters.supplierId = "";
    currentFilters.productId = "";
    currentFilters.dateFrom = "";
    currentFilters.dateTo = "";
    currentFilters.trend = "all";
    currentFilters.search = "";

    const supEl = document.getElementById("sph-filter-sup");
    const prodEl = document.getElementById("sph-filter-prod");
    const dFrom = document.getElementById("sph-filter-date-from");
    const dTo = document.getElementById("sph-filter-date-to");
    const trendEl = document.getElementById("sph-filter-trend");
    const searchEl = document.getElementById("sph-filter-search");

    if (supEl) supEl.value = "";
    if (prodEl) prodEl.value = "";
    if (dFrom) dFrom.value = "";
    if (dTo) dTo.value = "";
    if (trendEl) trendEl.value = "all";
    if (searchEl) searchEl.value = "";

    if (currentFilters.activeTab === "sales-profit") {
      renderProfitabilityReport();
    } else {
      renderPurchasesReport();
    }
  };

  window.sphOnCompareProductChange = (prodId) => {
    renderProductCompareView();
  };

  window.sphRenderCompareView = () => {
    renderProductCompareView();
  };

  // Trigger active print (Main, Sales & Profitability, or Product Compare depending on active tab)
  window.sphTriggerActivePrint = () => {
    if (currentFilters.activeTab === "product-compare") {
      window.printRoyalProductCompare();
    } else if (currentFilters.activeTab === "sales-profit") {
      window.printRoyalSalesProfitability();
    } else {
      window.printRoyalSupplierPurchases();
    }
  };

  // Modal: Show full invoice transactions for this product across all suppliers
  window.sphOpenProductAllInvoicesModal = (encodedRowData) => {
    try {
      const row = JSON.parse(decodeURIComponent(encodedRowData));
      const modal = document.getElementById("sph-modal");
      const title = document.getElementById("sph-modal-title");
      const body = document.getElementById("sph-modal-body");

      if (!modal || !body) return;

      title.innerHTML = `
        <div style="font-size:14px;">
          <span>📦 ${row.productName}</span> 
          <span style="color:#6366f1; margin:0 8px;">—</span> 
          <span style="color:#4338ca;">(${row.suppliersCount} موردين)</span>
        </div>
      `;

      // Collect all invoices across all suppliers
      // Collect all invoices across all suppliers
      const allInvs = [];
      row.suppliers.forEach(s => {
        s.invoices.forEach(inv => {
          allInvs.push({
            ...inv,
            supplierName: s.supplierName
          });
        });
      });
      allInvs.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

      // Also collect purchase returns for this product
      const prs = [];
      allPurchaseReturns.forEach(pr => {
        if (pr.status === "cancelled") return;
        (pr.lines || pr.items || []).forEach(l => {
          const isMatch = (row.productId && l.productId === row.productId) ||
                          (row.sku && row.sku !== "—" && l.sku === row.sku) ||
                          (l.productName && l.productName === row.productName);
          if (isMatch) {
            prs.push({
              number: pr.number || "مرتجع",
              date: pr.date || "",
              supplierName: pr.supplierName || "المورد",
              qty: parseFloat(l.qty || 0),
              price: parseFloat(l.unitPrice || 0),
              total: parseFloat(l.total || (l.qty * l.unitPrice) || 0)
            });
          }
        });
      });

      // Also collect delivery notes for this product
      const dns = [];
      allDeliveryNotes.forEach(dn => {
        if (dn.status === "cancelled") return;
        (dn.lines || dn.items || []).forEach(l => {
          const isMatch = (row.productId && l.productId === row.productId) ||
                          (row.sku && row.sku !== "—" && l.sku === row.sku) ||
                          (l.productName && l.productName === row.productName);
          if (isMatch) {
            dns.push({
              number: dn.number || "سند تسليم",
              date: dn.date || "",
              customerName: dn.customerName || "العميل",
              qty: parseFloat(l.qty || 0),
              price: parseFloat(l.unitPrice || 0),
              total: parseFloat(l.total || (l.qty * l.unitPrice) || 0)
            });
          }
        });
      });

      // Also collect sales invoices for this product
      const sis = [];
      allSalesInvoices.forEach(si => {
        if (si.status === "cancelled") return;
        (si.lines || si.items || []).forEach(l => {
          const isMatch = (row.productId && l.productId === row.productId) ||
                          (row.sku && row.sku !== "—" && l.sku === row.sku) ||
                          (l.productName && l.productName === row.productName);
          if (isMatch) {
            sis.push({
              number: si.number || si.invoiceNumber || "فاتورة",
              date: si.date || "",
              customerName: si.customerName || "العميل",
              qty: parseFloat(l.qty || 0),
              price: parseFloat(l.unitPrice || 0),
              total: parseFloat(l.total || (l.qty * l.unitPrice) || 0)
            });
          }
        });
      });

      body.innerHTML = `
        <!-- KPI Summary Ribbon -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:8px; margin-bottom:14px; background:var(--bg-2); padding:10px 14px; border-radius:8px;">
          <div><div style="font-size:10px; color:var(--text-3);">المشتراة الإجمالية:</div><b class="mono font-bold" style="color:#1e1b4b;">${row.purchasedQty || row.totalQty} ${row.unit}</b></div>
          ${prs.length > 0 ? `<div><div style="font-size:10px; color:#dc2626;">المرتجع للمورد:</div><b class="mono font-bold" style="color:#dc2626;">-${row.purchaseReturnsQty || prs.reduce((s,p)=>s+p.qty,0)} ${row.unit}</b></div>` : ''}
          <div><div style="font-size:10px; color:#0284c7;">المباعة والمسلّمة:</div><b class="mono font-bold" style="color:#0284c7;">${row.qtySold} ${row.unit}</b></div>
          <div><div style="font-size:10px; color:#059669;">المخزون بالمستودع:</div><b class="mono font-bold" style="color:${row.currentStock > 0 ? '#16a34a' : '#dc2626'};">${row.currentStock} ${row.unit}</b></div>
          <div><div style="font-size:10px; color:var(--text-3);">صافي قيمة الشراء:</div><b class="mono font-bold" style="color:#1e1b4b;">${formatCurrency(row.totalAmount)}</b></div>
        </div>

        <!-- 1. Purchase Invoices Section -->
        <div style="margin-bottom:16px;">
          <h4 style="margin:0 0 8px 0; font-size:12.5px; font-weight:800; color:#1e1b4b; display:flex; align-items:center; gap:6px;">
            <span>📥</span> فواتير التوريد من الموردين (${allInvs.length} فاتورة)
          </h4>
          <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px;">
            <table class="data-dense" style="margin:0; width:100%;">
              <thead>
                <tr>
                  <th style="width:30px; text-align:center;">#</th>
                  <th>التاريخ</th>
                  <th>رقم الفاتورة</th>
                  <th>المورد</th>
                  <th style="text-align:center;">الكمية</th>
                  <th style="text-align:left;">سعر الوحدة</th>
                  <th style="text-align:left;">إجمالي الفاتورة</th>
                </tr>
              </thead>
              <tbody>
                ${allInvs.map((inv, i) => `
                  <tr>
                    <td class="mono" style="text-align:center; color:var(--text-3);">${i + 1}</td>
                    <td class="mono font-bold">${inv.date || "—"}</td>
                    <td class="mono font-bold" style="color:#6366f1;">${inv.invoiceNumber}</td>
                    <td class="font-bold" style="color:#1e1b4b;">${inv.supplierName}</td>
                    <td class="mono font-bold" style="text-align:center;">${inv.qty}</td>
                    <td class="mono font-bold" style="text-align:left; color:#1e1b4b;">${formatCurrency(inv.unitPrice)}</td>
                    <td class="mono font-bold" style="text-align:left;">${formatCurrency(inv.total)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2. Purchase Returns Section (if any) -->
        ${prs.length > 0 ? `
          <div style="margin-bottom:16px; background:#fff5f5; border:1px solid #fed7d7; border-radius:8px; padding:10px;">
            <h4 style="margin:0 0 8px 0; font-size:12.5px; font-weight:800; color:#c53030; display:flex; align-items:center; gap:6px;">
              <span>↩️</span> مرتجعات المشتريات المعادة للموردين (إشعارات مدينة - خصم من المخزون والتكلفة)
            </h4>
            <table class="data-dense" style="margin:0; width:100%; background:#fff;">
              <thead>
                <tr style="background:#fed7d7; color:#742a2a;">
                  <th>#</th><th>التاريخ</th><th>رقم السند</th><th>المورد</th><th style="text-align:center;">الكمية المرتجعة</th><th style="text-align:left;">سعر الوحدة</th><th style="text-align:left;">المبلغ المسترد</th>
                </tr>
              </thead>
              <tbody>
                ${prs.map((p, i) => `
                  <tr>
                    <td class="mono" style="text-align:center;">${i+1}</td>
                    <td class="mono font-bold">${p.date || "—"}</td>
                    <td class="mono font-bold" style="color:#e53e3e;">${p.number}</td>
                    <td class="font-bold">${p.supplierName}</td>
                    <td class="mono font-bold" style="text-align:center; color:#e53e3e;">-${p.qty}</td>
                    <td class="mono" style="text-align:left;">${formatCurrency(p.price)}</td>
                    <td class="mono font-bold" style="text-align:left; color:#e53e3e;">-${formatCurrency(p.total)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : ''}

        <!-- 3. Delivery Notes Section (if any) -->
        ${dns.length > 0 ? `
          <div style="margin-bottom:16px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:10px;">
            <h4 style="margin:0 0 8px 0; font-size:12.5px; font-weight:800; color:#0369a1; display:flex; align-items:center; gap:6px;">
              <span>📦</span> سندات تسليم البضاعة للعملاء (أذون صرف وتسليم فورية خفضت رصيد المستودع)
            </h4>
            <table class="data-dense" style="margin:0; width:100%; background:#fff;">
              <thead>
                <tr style="background:#e0f2fe; color:#0369a1;">
                  <th>#</th><th>التاريخ</th><th>رقم السند</th><th>العميل المستلم</th><th style="text-align:center;">الكمية المسلّمة</th><th style="text-align:left;">سعر الوحدة</th><th style="text-align:left;">إجمالي القيمة</th>
                </tr>
              </thead>
              <tbody>
                ${dns.map((d, i) => `
                  <tr>
                    <td class="mono" style="text-align:center;">${i+1}</td>
                    <td class="mono font-bold">${d.date || "—"}</td>
                    <td class="mono font-bold" style="color:#0284c7;">${d.number}</td>
                    <td class="font-bold">${d.customerName}</td>
                    <td class="mono font-bold" style="text-align:center; color:#0284c7;">${d.qty}</td>
                    <td class="mono" style="text-align:left;">${formatCurrency(d.price)}</td>
                    <td class="mono font-bold" style="text-align:left;">${formatCurrency(d.total)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : ''}

        <!-- 4. Sales Invoices Section (if any) -->
        ${sis.length > 0 ? `
          <div>
            <h4 style="margin:0 0 8px 0; font-size:12.5px; font-weight:800; color:#1e1b4b; display:flex; align-items:center; gap:6px;">
              <span>🛒</span> فواتير المبيعات الصادرة للعملاء (${sis.length} فاتورة)
            </h4>
            <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px;">
              <table class="data-dense" style="margin:0; width:100%;">
                <thead>
                  <tr>
                    <th>#</th><th>التاريخ</th><th>رقم الفاتورة</th><th>العميل</th><th style="text-align:center;">الكمية المباعة</th><th style="text-align:left;">سعر البيع</th><th style="text-align:left;">إجمالي القيمة</th>
                  </tr>
                </thead>
                <tbody>
                  ${sis.map((s, i) => `
                    <tr>
                      <td class="mono" style="text-align:center;">${i+1}</td>
                      <td class="mono font-bold">${s.date || "—"}</td>
                      <td class="mono font-bold" style="color:#059669;">${s.number}</td>
                      <td class="font-bold">${s.customerName}</td>
                      <td class="mono font-bold" style="text-align:center; color:#059669;">${s.qty}</td>
                      <td class="mono" style="text-align:left;">${formatCurrency(s.price)}</td>
                      <td class="mono font-bold" style="text-align:left;">${formatCurrency(s.total)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
      `;

      modal.style.display = "flex";
      modal.classList.remove("hidden");
    } catch (e) {
      console.warn("Modal open error:", e);
    }
  };

  window.sphCloseModal = () => {
    const modal = document.getElementById("sph-modal");
    if (modal) {
      modal.style.display = "none";
      modal.classList.add("hidden");
    }
  };

  // Helper to ensure ExcelJS is loaded
  async function ensureExcelJS() {
    if (window.ExcelJS) return window.ExcelJS;
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src*="exceljs"]');
      if (existing && window.ExcelJS) return resolve(window.ExcelJS);
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js";
      s.onload = () => {
        if (window.ExcelJS) resolve(window.ExcelJS);
        else reject(new Error("ExcelJS not initialized"));
      };
      s.onerror = () => {
        const s2 = document.createElement("script");
        s2.src = "https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js";
        s2.onload = () => {
          if (window.ExcelJS) resolve(window.ExcelJS);
          else reject(new Error("ExcelJS fallback failed"));
        };
        s2.onerror = () => reject(new Error("تعذر تحميل مكتبة ExcelJS"));
        document.head.appendChild(s2);
      };
      document.head.appendChild(s);
    });
  }

  // Fallback using SheetJS if ExcelJS is blocked
  function fallbackExportWithSheetJS(data, detailedLines, supplierSummary, filename) {
    if (!window.XLSX) {
      alert("تعذر تحميل مكتبة تصدير الإكسل.");
      return;
    }
    const wb = window.XLSX.utils.book_new();

    // Sheet 1: Matrix
    const s1Rows = data.map((d, i) => ({
      "م": i + 1,
      "كود الصنف": d.sku || "—",
      "اسم الصنف": d.productName,
      "الوحدة": d.unit || "—",
      "عدد الموردين": d.suppliersCount,
      "أرخص مورد": d.suppliers[0]?.supplierName || "—",
      "أقل سعر": Number(d.minPrice.toFixed(2)),
      "أعلى سعر": Number(d.maxPrice.toFixed(2)),
      "فارق السعر (الوفر)": Number(d.priceSpread.toFixed(2)),
      "نسبة التفاوت %": d.minPrice > 0 ? Number(((d.priceSpread / d.minPrice) * 100).toFixed(1)) : 0,
      "إجمالي الكمية": Number(d.totalQty.toFixed(2)),
      "إجمالي القيمة": Number(d.totalAmount.toFixed(2)),
      "الموردين والأسعار": d.suppliers.map(s => `${s.supplierName}: ${s.latestPrice.toFixed(2)} ر.س (${s.purchaseCount} فواتير)`).join(" | ")
    }));
    const ws1 = window.XLSX.utils.json_to_sheet(s1Rows);
    window.XLSX.utils.book_append_sheet(wb, ws1, "مصفوفة الأصناف والموردين");

    // Sheet 2: Price Trends
    const s2Rows = [];
    let s2Idx = 1;
    data.forEach(p => {
      p.suppliers.forEach(s => {
        s2Rows.push({
          "م": s2Idx++,
          "كود الصنف": p.sku || "—",
          "اسم الصنف": p.productName,
          "الوحدة": p.unit || "—",
          "اسم المورد": s.supplierName,
          "السعر الأول": Number(s.initialPrice.toFixed(2)),
          "السعر الأحدث": Number(s.latestPrice.toFixed(2)),
          "فارق السعر": Number(s.priceDiff.toFixed(2)),
          "نسبة التغير %": Number(s.priceDiffPct.toFixed(1)),
          "حركة السعر": s.movement === "up" ? "ارتفاع" : s.movement === "down" ? "انخفاض" : "مستقر",
          "أدنى سعر": Number(s.minPrice.toFixed(2)),
          "أعلى سعر": Number(s.maxPrice.toFixed(2)),
          "متوسط السعر": Number(s.avgPrice.toFixed(2)),
          "عدد الفواتير": s.purchaseCount,
          "إجمالي الكمية": Number(s.totalQty.toFixed(2)),
          "إجمالي القيمة": Number(s.totalAmount.toFixed(2))
        });
      });
    });
    const ws2 = window.XLSX.utils.json_to_sheet(s2Rows);
    window.XLSX.utils.book_append_sheet(wb, ws2, "تحليل تقلبات الأسعار والوفر");

    // Sheet 3: Itemized Invoices
    const s3Rows = detailedLines.map((l, i) => ({
      "م": i + 1,
      "تاريخ الفاتورة": l.date,
      "رقم الفاتورة": l.invoiceNumber,
      "اسم المورد": l.supplierName,
      "كود الصنف": l.sku || "—",
      "اسم الصنف": l.productName,
      "الوحدة": l.unit || "—",
      "الكمية": Number(l.qty.toFixed(2)),
      "سعر الوحدة": Number(l.unitPrice.toFixed(2)),
      "إجمالي القيمة": Number(l.total.toFixed(2))
    }));
    const ws3 = window.XLSX.utils.json_to_sheet(s3Rows);
    window.XLSX.utils.book_append_sheet(wb, ws3, "سجل الفواتير التفصيلية");

    // Sheet 4: Suppliers Summary
    const s4Rows = supplierSummary.map((s, i) => ({
      "م": i + 1,
      "اسم المورد": s.supplierName,
      "عدد الفواتير": s.invoicesCount,
      "عدد الأصناف": s.productsCount,
      "إجمالي الكميات": Number(s.totalQty.toFixed(2)),
      "إجمالي القيمة": Number(s.totalAmount.toFixed(2)),
      "نسبة المشاركة %": Number(s.sharePct.toFixed(2)),
      "أعلى صنف توريداً": s.topProduct
    }));
    const ws4 = window.XLSX.utils.json_to_sheet(s4Rows);
    window.XLSX.utils.book_append_sheet(wb, ws4, "تحليل مشتريات الموردين");

    // Sheet 5: Sales & Profitability Analysis
    const s5Rows = data.map((d, i) => ({
      "م": i + 1,
      "كود الصنف": d.sku || "—",
      "اسم الصنف": d.productName,
      "الوحدة": d.unit || "—",
      "التصنيف التجاري": `${d.commercialBadge.icon} ${d.commercialBadge.label}`,
      "عدد مرات الطلب": d.demandCount,
      "الكمية المشتراة": Number(d.totalQty.toFixed(2)),
      "متوسط سعر الشراء": Number(d.avgPurchasePrice.toFixed(2)),
      "إجمالي المشتريات": Number(d.totalAmount.toFixed(2)),
      "الكمية المباعة": Number(d.qtySold.toFixed(2)),
      "نسبة التصريف %": Number(d.sellThroughRate.toFixed(1)),
      "متوسط سعر البيع": Number(d.avgSellingPrice.toFixed(2)),
      "إجمالي إيراد المبيعات": Number(d.salesRevenue.toFixed(2)),
      "مجمل الربح (ر.س)": Number(d.grossProfit.toFixed(2)),
      "هامش الربح %": Number(d.marginPct.toFixed(1)),
      "أرخص مورد": d.suppliers[0]?.supplierName || "—",
      "أدنى سعر توريد": Number(d.minPrice.toFixed(2))
    }));
    const ws5 = window.XLSX.utils.json_to_sheet(s5Rows);
    window.XLSX.utils.book_append_sheet(wb, ws5, "تحليل المبيعات والربحية والطلب");

    window.XLSX.writeFile(wb, filename);
    if (window.showToast) {
      window.showToast("تم تصدير ملف الإكسل بنجاح بـ 5 تبويبات شاملة تحليل الأرباح والطلب!", "success");
    }
  }

  // Advanced Multi-Tab Formatted Excel Exporter
  window.exportSupplierPurchasesExcel = async () => {
    const btn = document.getElementById("sph-main-excel-btn");
    const originalBtnHtml = btn ? btn.innerHTML : "";
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>⏳</span> جاري تجهيز وتنسيق ملف Excel المطور...`;
    }

    try {
      const data = processPurchasesData();
      if (!data || !data.length) {
        alert("لا توجد بيانات متاحة للتصدير وفق معايير التصفية الحالية.");
        return;
      }

      // 1. Prepare Detailed Invoices matching active filters
      const detailedLines = [];
      const { supplierId, productId, dateFrom, dateTo, search } = currentFilters;
      const prodMap = new Map(allProducts.map(p => [p.id, p]));
      const supMap = new Map(allSuppliers.map(s => [s.id, s.name]));

      allPurchases.forEach(inv => {
        const invDate = inv.date || inv.invoiceDate || "";
        if (dateFrom && invDate < dateFrom) return;
        if (dateTo && invDate > dateTo) return;

        const currentSupId = inv.supplierId || "";
        const currentSupName = inv.supplierName || supMap.get(currentSupId) || "مورد عام";
        if (supplierId && currentSupId !== supplierId) return;

        (inv.lines || inv.items || []).forEach(line => {
          const pId = line.productId || "";
          const pName = line.productName || line.name || "صنف بدون اسم";
          const matchedProd = pId ? prodMap.get(pId) : allProducts.find(p => p.name === pName);

          if (productId && pId !== productId && (!matchedProd || matchedProd.id !== productId)) return;

          const unitPrice = parseFloat(line.unitPrice !== undefined ? line.unitPrice : (line.price || 0));
          const qty = parseFloat(line.qty !== undefined ? line.qty : (line.quantity || 1));
          const total = parseFloat(line.total !== undefined ? line.total : (qty * unitPrice));
          const unit = line.unit || matchedProd?.unit || "كرتون";
          const sku = line.sku || matchedProd?.sku || "—";

          if (search) {
            const q = search.trim().toLowerCase();
            const str = `${pName} ${sku} ${currentSupName}`.toLowerCase();
            if (!str.includes(q)) return;
          }

          detailedLines.push({
            date: invDate,
            invoiceNumber: inv.number || inv.invoiceNumber || (inv.id ? inv.id.slice(0, 8) : "—"),
            supplierName: currentSupName,
            sku,
            productName: pName,
            unit,
            qty,
            unitPrice,
            total
          });
        });
      });

      detailedLines.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

      // 2. Prepare Supplier Summary
      const supAggMap = new Map();
      let grandTotalSpend = 0;
      let grandTotalQty = 0;

      detailedLines.forEach(l => {
        grandTotalSpend += l.total;
        grandTotalQty += l.qty;

        if (!supAggMap.has(l.supplierName)) {
          supAggMap.set(l.supplierName, {
            supplierName: l.supplierName,
            invoicesSet: new Set(),
            productsMap: new Map(),
            totalQty: 0,
            totalAmount: 0
          });
        }
        const sup = supAggMap.get(l.supplierName);
        sup.invoicesSet.add(l.invoiceNumber);
        sup.totalQty += l.qty;
        sup.totalAmount += l.total;
        sup.productsMap.set(l.productName, (sup.productsMap.get(l.productName) || 0) + l.total);
      });

      const supplierSummary = Array.from(supAggMap.values()).map(s => {
        let topProduct = "—";
        let topSpend = 0;
        s.productsMap.forEach((amt, name) => {
          if (amt > topSpend) { topSpend = amt; topProduct = name; }
        });
        const sharePct = grandTotalSpend > 0 ? (s.totalAmount / grandTotalSpend) * 100 : 0;
        return {
          supplierName: s.supplierName,
          invoicesCount: s.invoicesSet.size,
          productsCount: s.productsMap.size,
          totalQty: s.totalQty,
          totalAmount: s.totalAmount,
          sharePct,
          topProduct: topProduct !== "—" ? `${topProduct} (${topSpend.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س)` : "—"
        };
      });
      supplierSummary.sort((a, b) => b.totalAmount - a.totalAmount);

      // Clean filename
      const supNameClean = currentFilters.supplierId 
        ? ((allSuppliers.find(s => s.id === currentFilters.supplierId)?.name || "مورد").replace(/[/\\?%*:|"<>]/g, "_")) 
        : "كافة_الموردين";
      const todayStr = new Date().toISOString().split("T")[0];
      const filename = `تقرير_مشتريات_وتقلبات_أسعار_الموردين_${supNameClean}_${todayStr}.xlsx`;

      // Try ExcelJS first for beautiful styles and colored tabs
      try {
        await ensureExcelJS();
      } catch (e) {
        console.warn("ExcelJS load failed, falling back to SheetJS:", e);
      }

      if (!window.ExcelJS) {
        fallbackExportWithSheetJS(data, detailedLines, supplierSummary, filename);
        return;
      }

      // Metadata & Company Details
      const co = (() => {
        try { return JSON.parse(localStorage.getItem("idham_company") || "{}"); } catch { return {}; }
      })();
      const companyName = co.name || co.businessName || "مؤسسة ادهام للمواد الغذائية";
      const exportDateStr = new Date().toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" });
      const supFilterName = currentFilters.supplierId 
        ? (allSuppliers.find(s => s.id === currentFilters.supplierId)?.name || "مورد محدد") 
        : "كافة الموردين";
      const dateRangeText = (currentFilters.dateFrom || currentFilters.dateTo)
        ? `من: ${currentFilters.dateFrom || "البداية"} إلى: ${currentFilters.dateTo || "اليوم"}`
        : "كامل الفترات التاريخية";

      const wb = new window.ExcelJS.Workbook();
      wb.creator = "مؤسسة ادهام للمواد الغذائية - IDHAM ERP";
      wb.lastModifiedBy = currentUser?.name || "IDHAM ERP";
      wb.created = new Date();
      wb.modified = new Date();

      // Border styles
      const BORDER_THIN = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } }
      };
      const BORDER_HEADER = {
        top: { style: "medium", color: { argb: "FF0F172A" } },
        left: { style: "thin", color: { argb: "FF94A3B8" } },
        bottom: { style: "medium", color: { argb: "FF0F172A" } },
        right: { style: "thin", color: { argb: "FF94A3B8" } }
      };
      const BORDER_TOTAL = {
        top: { style: "thin", color: { argb: "FF94A3B8" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "double", color: { argb: "FF0F172A" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } }
      };

      function mergeAndStyle(ws, top, left, bottom, right, opts = {}) {
        ws.mergeCells(top, left, bottom, right);
        for (let r = top; r <= bottom; r++) {
          for (let c = left; c <= right; c++) {
            const cell = ws.getCell(r, c);
            if (r === top && c === left && opts.value !== undefined) {
              cell.value = opts.value;
            }
            if (opts.font) cell.font = opts.font;
            if (opts.fill) cell.fill = opts.fill;
            if (opts.alignment) cell.alignment = opts.alignment;
            if (opts.border) cell.border = opts.border;
          }
        }
      }

      function styleCell(cell, opts = {}) {
        if (opts.value !== undefined) cell.value = opts.value;
        if (opts.font) cell.font = opts.font;
        if (opts.fill) cell.fill = opts.fill;
        if (opts.alignment) cell.alignment = opts.alignment;
        if (opts.border) cell.border = opts.border;
        if (opts.numFmt) cell.numFmt = opts.numFmt;
      }

      // ========================================================
      // 📑 TAB 1: مصفوفة الأصناف والموردين (Color: Deep Navy #1E3A8A)
      // ========================================================
      const ws1 = wb.addWorksheet("مصفوفة الأصناف والموردين", {
        properties: { tabColor: { argb: "FF1E3A8A" } },
        views: [{ rightToLeft: true, state: "frozen", xSplit: 0, ySplit: 6 }]
      });

      const ws1Widths = [6, 14, 34, 10, 13, 26, 14, 14, 16, 14, 15, 20, 48];
      ws1Widths.forEach((w, i) => { ws1.getColumn(i + 1).width = w; });

      // Title & Meta
      ws1.getRow(1).height = 32;
      mergeAndStyle(ws1, 1, 1, 1, 13, {
        value: `${companyName} — تقرير مشتريات الأصناف ومقارنة أسعار الموردين الأفقية`,
        font: { name: "Calibri", size: 14, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } },
        alignment: { horizontal: "center", vertical: "middle" }
      });

      ws1.getRow(2).height = 20;
      mergeAndStyle(ws1, 2, 1, 2, 13, {
        value: `المورد: ${supFilterName} | نطاق الفواتير: ${dateRangeText} | وقت التصدير: ${exportDateStr}`,
        font: { name: "Calibri", size: 10, color: { argb: "FF334155" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } },
        alignment: { horizontal: "center", vertical: "middle" }
      });

      ws1.getRow(3).height = 10;

      // KPI Mini Dashboard
      const grandSpend1 = data.reduce((s, d) => s + (d.totalAmount || 0), 0);
      const grandQty1 = data.reduce((s, d) => s + (d.totalQty || 0), 0);
      const multiSupCount = data.filter(d => d.suppliersCount > 1).length;

      ws1.getRow(4).height = 26;
      mergeAndStyle(ws1, 4, 1, 4, 3, {
        value: `💰 إجمالي المشتريات: ${grandSpend1.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`,
        font: { name: "Calibri", size: 10.5, bold: true, color: { argb: "FF1E3A8A" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFDBEAFE" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_THIN
      });
      mergeAndStyle(ws1, 4, 4, 4, 6, {
        value: `📦 إجمالي الأصناف: ${data.length} صنف`,
        font: { name: "Calibri", size: 10.5, bold: true, color: { argb: "FF065F46" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCFCE7" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_THIN
      });
      mergeAndStyle(ws1, 4, 7, 4, 9, {
        value: `📊 إجمالي الكميات: ${grandQty1.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
        font: { name: "Calibri", size: 10.5, bold: true, color: { argb: "FF92400E" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_THIN
      });
      mergeAndStyle(ws1, 4, 10, 4, 13, {
        value: `🤝 أصناف متعددة الموردين: ${multiSupCount} صنف (فرص تفاوض ووفر)`,
        font: { name: "Calibri", size: 10.5, bold: true, color: { argb: "FF581C87" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3E8FF" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_THIN
      });

      ws1.getRow(5).height = 10;

      // Header Row (Row 6)
      const hRow1 = ws1.getRow(6);
      hRow1.height = 30;
      const headers1 = [
        "م", "كود الصنف", "اسم الصنف", "الوحدة", "عدد الموردين",
        "أرخص مورد (الأفضل سعراً)", "أقل سعر مسجل", "أعلى سعر مسجل",
        "فارق السعر (الوفر)", "نسبة التفاوت %", "إجمالي الكمية",
        "إجمالي القيمة (ر.س)", "تفاصيل الموردين والأسعار المعروضة"
      ];
      headers1.forEach((h, cIdx) => {
        styleCell(hRow1.getCell(cIdx + 1), {
          value: h,
          font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } },
          alignment: { horizontal: "center", vertical: "middle", wrapText: true },
          border: BORDER_HEADER
        });
      });

      // Data Rows (Row 7+)
      let rIdx1 = 7;
      data.forEach((d, i) => {
        const row = ws1.getRow(rIdx1);
        row.height = 22;
        const isZebra = (i % 2 === 1);
        const bgZebra = isZebra 
          ? { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } } 
          : { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };

        const supSummary = d.suppliers.map(s => `${s.supplierName}: ${s.latestPrice.toFixed(2)} ر.س (${s.purchaseCount} فواتير)`).join(" | ");
        const spreadPct = d.minPrice > 0 ? ((d.priceSpread / d.minPrice) * 100) : 0;
        const bestSupName = d.suppliers[0]?.supplierName || "—";

        styleCell(row.getCell(1), { value: i + 1, font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
        styleCell(row.getCell(2), { value: d.sku || "—", font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
        styleCell(row.getCell(3), { value: d.productName, font: { name: "Calibri", size: 10.5, bold: true, color: { argb: "FF0F172A" } }, alignment: { horizontal: "right", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
        styleCell(row.getCell(4), { value: d.unit || "—", font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
        styleCell(row.getCell(5), { value: d.suppliersCount, font: { name: "Calibri", size: 10, bold: d.suppliersCount > 1, color: { argb: d.suppliersCount > 1 ? "FF1D4ED8" : "FF334155" } }, alignment: { horizontal: "center", vertical: "middle" }, fill: d.suppliersCount > 1 ? { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFF6FF" } } : bgZebra, border: BORDER_THIN, numFmt: "#,##0" });
        styleCell(row.getCell(6), { value: bestSupName, font: { name: "Calibri", size: 10, bold: true, color: { argb: "FF065F46" } }, alignment: { horizontal: "right", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
        styleCell(row.getCell(7), { value: Number(d.minPrice.toFixed(2)), font: { name: "Calibri", size: 10.5, bold: true, color: { argb: "FF047857" } }, alignment: { horizontal: "center", vertical: "middle" }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFECFDF5" } }, border: BORDER_THIN, numFmt: '#,##0.00 "ر.س"' });
        styleCell(row.getCell(8), { value: Number(d.maxPrice.toFixed(2)), font: { name: "Calibri", size: 10.5, bold: true, color: { argb: "FFB91C1C" } }, alignment: { horizontal: "center", vertical: "middle" }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF2F2" } }, border: BORDER_THIN, numFmt: '#,##0.00 "ر.س"' });
        styleCell(row.getCell(9), { value: Number(d.priceSpread.toFixed(2)), font: { name: "Calibri", size: 10.5, bold: true, color: { argb: "FFB45309" } }, alignment: { horizontal: "center", vertical: "middle" }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } }, border: BORDER_THIN, numFmt: '#,##0.00 "ر.س"' });
        styleCell(row.getCell(10), { value: Number(spreadPct.toFixed(1)), font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '0.0"%"' });
        styleCell(row.getCell(11), { value: Number(d.totalQty.toFixed(2)), font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00' });
        styleCell(row.getCell(12), { value: Number(d.totalAmount.toFixed(2)), font: { name: "Calibri", size: 10.5, bold: true, color: { argb: "FF1E3A8A" } }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00 "ر.س"' });
        styleCell(row.getCell(13), { value: supSummary, font: { name: "Calibri", size: 9.5, color: { argb: "FF334155" } }, alignment: { horizontal: "right", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });

        rIdx1++;
      });

      // Total Row Tab 1
      const sumRow1 = ws1.getRow(rIdx1);
      sumRow1.height = 26;
      mergeAndStyle(ws1, rIdx1, 1, rIdx1, 10, {
        value: "الإجمالي العام لكافة الأصناف الموردة",
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL
      });
      styleCell(sumRow1.getCell(11), {
        value: { formula: `SUM(K7:K${rIdx1 - 1})` },
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL,
        numFmt: '#,##0.00'
      });
      styleCell(sumRow1.getCell(12), {
        value: { formula: `SUM(L7:L${rIdx1 - 1})` },
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL,
        numFmt: '#,##0.00 "ر.س"'
      });
      styleCell(sumRow1.getCell(13), {
        value: "",
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        border: BORDER_TOTAL
      });


      // ========================================================
      // 📊 TAB 2: تحليل تقلبات الأسعار والوفر (Color: Amber #D97706)
      // ========================================================
      const ws2 = wb.addWorksheet("تحليل تقلبات الأسعار والوفر", {
        properties: { tabColor: { argb: "FFD97706" } },
        views: [{ rightToLeft: true, state: "frozen", xSplit: 0, ySplit: 4 }]
      });

      const ws2Widths = [6, 14, 32, 10, 26, 13, 13, 13, 13, 13, 13, 13, 13, 12, 14, 18];
      ws2Widths.forEach((w, i) => { ws2.getColumn(i + 1).width = w; });

      ws2.getRow(1).height = 30;
      mergeAndStyle(ws2, 1, 1, 1, 16, {
        value: `${companyName} — تحليل تقلبات أسعار التوريد وحركة الأسعار بين الموردين`,
        font: { name: "Calibri", size: 13, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFD97706" } },
        alignment: { horizontal: "center", vertical: "middle" }
      });

      ws2.getRow(2).height = 20;
      mergeAndStyle(ws2, 2, 1, 2, 16, {
        value: `المورد: ${supFilterName} | نطاق الفواتير: ${dateRangeText} | وقت التصدير: ${exportDateStr}`,
        font: { name: "Calibri", size: 10, color: { argb: "FF92400E" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } },
        alignment: { horizontal: "center", vertical: "middle" }
      });

      ws2.getRow(3).height = 10;

      // Header Row (Row 4)
      const hRow2 = ws2.getRow(4);
      hRow2.height = 28;
      const headers2 = [
        "م", "كود الصنف", "اسم الصنف", "الوحدة", "اسم المورد",
        "السعر الأول", "السعر الأحدث", "فارق السعر", "نسبة التغير %",
        "حركة السعر", "أدنى سعر تاريخي", "أعلى سعر تاريخي",
        "متوسط السعر", "عدد الفواتير", "إجمالي الكمية", "إجمالي القيمة (ر.س)"
      ];
      headers2.forEach((h, cIdx) => {
        styleCell(hRow2.getCell(cIdx + 1), {
          value: h,
          font: { name: "Calibri", size: 10.5, bold: true, color: { argb: "FFFFFFFF" } },
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFD97706" } },
          alignment: { horizontal: "center", vertical: "middle", wrapText: true },
          border: BORDER_HEADER
        });
      });

      // Data Rows (Row 5+)
      let rIdx2 = 5;
      let count2 = 1;
      data.forEach(p => {
        p.suppliers.forEach(s => {
          const row = ws2.getRow(rIdx2);
          row.height = 22;
          const isZebra = (count2 % 2 === 0);
          const bgZebra = isZebra 
            ? { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } } 
            : { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };

          let moveText = "⚪ مستقر";
          let moveFill = bgZebra;
          let moveFontColor = "FF475569";
          if (s.movement === "up") {
            moveText = "🔺 ارتفاع";
            moveFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } };
            moveFontColor = "FFDC2626";
          } else if (s.movement === "down") {
            moveText = "🔻 انخفاض";
            moveFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCFCE7" } };
            moveFontColor = "FF16A34A";
          }

          styleCell(row.getCell(1), { value: count2, font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
          styleCell(row.getCell(2), { value: p.sku || "—", font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
          styleCell(row.getCell(3), { value: p.productName, font: { name: "Calibri", size: 10, bold: true, color: { argb: "FF0F172A" } }, alignment: { horizontal: "right", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
          styleCell(row.getCell(4), { value: p.unit || "—", font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
          styleCell(row.getCell(5), { value: s.supplierName, font: { name: "Calibri", size: 10, bold: true, color: { argb: "FF1E293B" } }, alignment: { horizontal: "right", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
          styleCell(row.getCell(6), { value: Number(s.initialPrice.toFixed(2)), font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00 "ر.س"' });
          styleCell(row.getCell(7), { value: Number(s.latestPrice.toFixed(2)), font: { name: "Calibri", size: 10, bold: true }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00 "ر.س"' });
          styleCell(row.getCell(8), { value: Number(s.priceDiff.toFixed(2)), font: { name: "Calibri", size: 10, bold: true, color: { argb: s.priceDiff > 0 ? "FFDC2626" : (s.priceDiff < 0 ? "FF16A34A" : "FF475569") } }, alignment: { horizontal: "center", vertical: "middle" }, fill: moveFill, border: BORDER_THIN, numFmt: '+#,##0.00;-#,##0.00;0.00' });
          styleCell(row.getCell(9), { value: Number(s.priceDiffPct.toFixed(1)), font: { name: "Calibri", size: 10, bold: true }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '0.0"%"' });
          styleCell(row.getCell(10), { value: moveText, font: { name: "Calibri", size: 10, bold: true, color: { argb: moveFontColor } }, alignment: { horizontal: "center", vertical: "middle" }, fill: moveFill, border: BORDER_THIN });
          styleCell(row.getCell(11), { value: Number(s.minPrice.toFixed(2)), font: { name: "Calibri", size: 10, color: { argb: "FF047857" } }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00 "ر.س"' });
          styleCell(row.getCell(12), { value: Number(s.maxPrice.toFixed(2)), font: { name: "Calibri", size: 10, color: { argb: "FFB91C1C" } }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00 "ر.س"' });
          styleCell(row.getCell(13), { value: Number(s.avgPrice.toFixed(2)), font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00 "ر.س"' });
          styleCell(row.getCell(14), { value: s.purchaseCount, font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0' });
          styleCell(row.getCell(15), { value: Number(s.totalQty.toFixed(2)), font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00' });
          styleCell(row.getCell(16), { value: Number(s.totalAmount.toFixed(2)), font: { name: "Calibri", size: 10.5, bold: true, color: { argb: "FF92400E" } }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00 "ر.س"' });

          rIdx2++;
          count2++;
        });
      });

      // Total Row Tab 2
      const sumRow2 = ws2.getRow(rIdx2);
      sumRow2.height = 26;
      mergeAndStyle(ws2, rIdx2, 1, rIdx2, 13, {
        value: "الإجمالي العام لكافة سجلات الموردين والأصناف",
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL
      });
      styleCell(sumRow2.getCell(14), {
        value: { formula: `SUM(N5:N${rIdx2 - 1})` },
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL,
        numFmt: '#,##0'
      });
      styleCell(sumRow2.getCell(15), {
        value: { formula: `SUM(O5:O${rIdx2 - 1})` },
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL,
        numFmt: '#,##0.00'
      });
      styleCell(sumRow2.getCell(16), {
        value: { formula: `SUM(P5:P${rIdx2 - 1})` },
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL,
        numFmt: '#,##0.00 "ر.س"'
      });


      // ========================================================
      // 📋 TAB 3: سجل الفواتير التفصيلية (Color: Emerald Green #059669)
      // ========================================================
      const ws3 = wb.addWorksheet("سجل الفواتير التفصيلية", {
        properties: { tabColor: { argb: "FF059669" } },
        views: [{ rightToLeft: true, state: "frozen", xSplit: 0, ySplit: 4 }]
      });

      const ws3Widths = [6, 14, 16, 26, 14, 32, 10, 14, 15, 18];
      ws3Widths.forEach((w, i) => { ws3.getColumn(i + 1).width = w; });

      ws3.getRow(1).height = 30;
      mergeAndStyle(ws3, 1, 1, 1, 10, {
        value: `${companyName} — سجل بنود فواتير الشراء التفصيلية المشمولة بالتقرير`,
        font: { name: "Calibri", size: 13, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF059669" } },
        alignment: { horizontal: "center", vertical: "middle" }
      });

      ws3.getRow(2).height = 20;
      mergeAndStyle(ws3, 2, 1, 2, 10, {
        value: `المورد: ${supFilterName} | نطاق الفواتير: ${dateRangeText} | عدد البنود المسجلة: ${detailedLines.length} بند`,
        font: { name: "Calibri", size: 10, color: { argb: "FF065F46" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1FAE5" } },
        alignment: { horizontal: "center", vertical: "middle" }
      });

      ws3.getRow(3).height = 10;

      // Header Row (Row 4)
      const hRow3 = ws3.getRow(4);
      hRow3.height = 28;
      const headers3 = [
        "م", "تاريخ الفاتورة", "رقم الفاتورة", "اسم المورد",
        "كود الصنف", "اسم الصنف", "الوحدة", "الكمية المشتراة",
        "سعر الوحدة (ر.س)", "إجمالي البند (ر.س)"
      ];
      headers3.forEach((h, cIdx) => {
        styleCell(hRow3.getCell(cIdx + 1), {
          value: h,
          font: { name: "Calibri", size: 10.5, bold: true, color: { argb: "FFFFFFFF" } },
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF059669" } },
          alignment: { horizontal: "center", vertical: "middle", wrapText: true },
          border: BORDER_HEADER
        });
      });

      // Data Rows (Row 5+)
      let rIdx3 = 5;
      detailedLines.forEach((l, i) => {
        const row = ws3.getRow(rIdx3);
        row.height = 22;
        const isZebra = (i % 2 === 1);
        const bgZebra = isZebra 
          ? { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } } 
          : { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };

        styleCell(row.getCell(1), { value: i + 1, font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
        styleCell(row.getCell(2), { value: l.date || "—", font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
        styleCell(row.getCell(3), { value: l.invoiceNumber, font: { name: "Calibri", size: 10, bold: true }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
        styleCell(row.getCell(4), { value: l.supplierName, font: { name: "Calibri", size: 10, bold: true, color: { argb: "FF1E293B" } }, alignment: { horizontal: "right", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
        styleCell(row.getCell(5), { value: l.sku || "—", font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
        styleCell(row.getCell(6), { value: l.productName, font: { name: "Calibri", size: 10.5, bold: true, color: { argb: "FF0F172A" } }, alignment: { horizontal: "right", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
        styleCell(row.getCell(7), { value: l.unit || "—", font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
        styleCell(row.getCell(8), { value: Number(l.qty.toFixed(2)), font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00' });
        styleCell(row.getCell(9), { value: Number(l.unitPrice.toFixed(2)), font: { name: "Calibri", size: 10, bold: true }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00 "ر.س"' });
        styleCell(row.getCell(10), { value: Number(l.total.toFixed(2)), font: { name: "Calibri", size: 10.5, bold: true, color: { argb: "FF065F46" } }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00 "ر.س"' });

        rIdx3++;
      });

      // Total Row Tab 3
      const sumRow3 = ws3.getRow(rIdx3);
      sumRow3.height = 26;
      mergeAndStyle(ws3, rIdx3, 1, rIdx3, 7, {
        value: "الإجمالي العام لكافة بنود الفواتير التفصيلية",
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL
      });
      styleCell(sumRow3.getCell(8), {
        value: { formula: `SUM(H5:H${rIdx3 - 1})` },
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL,
        numFmt: '#,##0.00'
      });
      styleCell(sumRow3.getCell(9), {
        value: "",
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        border: BORDER_TOTAL
      });
      styleCell(sumRow3.getCell(10), {
        value: { formula: `SUM(J5:J${rIdx3 - 1})` },
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL,
        numFmt: '#,##0.00 "ر.س"'
      });


      // ========================================================
      // 🏢 TAB 4: تحليل مشتريات الموردين (Color: Royal Purple #7C3AED)
      // ========================================================
      const ws4 = wb.addWorksheet("تحليل مشتريات الموردين", {
        properties: { tabColor: { argb: "FF7C3AED" } },
        views: [{ rightToLeft: true, state: "frozen", xSplit: 0, ySplit: 4 }]
      });

      const ws4Widths = [6, 28, 14, 16, 16, 20, 16, 36];
      ws4Widths.forEach((w, i) => { ws4.getColumn(i + 1).width = w; });

      ws4.getRow(1).height = 30;
      mergeAndStyle(ws4, 1, 1, 1, 8, {
        value: `${companyName} — التحليل التجميعي لحصص ومشتريات الموردين`,
        font: { name: "Calibri", size: 13, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF7C3AED" } },
        alignment: { horizontal: "center", vertical: "middle" }
      });

      ws4.getRow(2).height = 20;
      mergeAndStyle(ws4, 2, 1, 2, 8, {
        value: `إجمالي عدد الموردين المشمولين: ${supplierSummary.length} مورد | وقت التصدير: ${exportDateStr}`,
        font: { name: "Calibri", size: 10, color: { argb: "FF5B21B6" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFEDE9FE" } },
        alignment: { horizontal: "center", vertical: "middle" }
      });

      ws4.getRow(3).height = 10;

      // Header Row (Row 4)
      const hRow4 = ws4.getRow(4);
      hRow4.height = 28;
      const headers4 = [
        "م", "اسم المورد", "عدد الفواتير", "عدد الأصناف الموردة",
        "إجمالي الكميات الموردة", "إجمالي قيمة المشتريات (ر.س)",
        "نسبة المشاركة من الإجمالي %", "أعلى صنف توريداً وقيمة"
      ];
      headers4.forEach((h, cIdx) => {
        styleCell(hRow4.getCell(cIdx + 1), {
          value: h,
          font: { name: "Calibri", size: 10.5, bold: true, color: { argb: "FFFFFFFF" } },
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF7C3AED" } },
          alignment: { horizontal: "center", vertical: "middle", wrapText: true },
          border: BORDER_HEADER
        });
      });

      // Data Rows (Row 5+)
      let rIdx4 = 5;
      supplierSummary.forEach((s, i) => {
        const row = ws4.getRow(rIdx4);
        row.height = 22;
        const isZebra = (i % 2 === 1);
        const bgZebra = isZebra 
          ? { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } } 
          : { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };

        styleCell(row.getCell(1), { value: i + 1, font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
        styleCell(row.getCell(2), { value: s.supplierName, font: { name: "Calibri", size: 10.5, bold: true, color: { argb: "FF4C1D95" } }, alignment: { horizontal: "right", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
        styleCell(row.getCell(3), { value: s.invoicesCount, font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0' });
        styleCell(row.getCell(4), { value: s.productsCount, font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0' });
        styleCell(row.getCell(5), { value: Number(s.totalQty.toFixed(2)), font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00' });
        styleCell(row.getCell(6), { value: Number(s.totalAmount.toFixed(2)), font: { name: "Calibri", size: 10.5, bold: true, color: { argb: "FF7C3AED" } }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00 "ر.س"' });
        styleCell(row.getCell(7), { value: Number(s.sharePct.toFixed(2)), font: { name: "Calibri", size: 10, bold: true }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '0.00"%"' });
        styleCell(row.getCell(8), { value: s.topProduct, font: { name: "Calibri", size: 9.5, color: { argb: "FF334155" } }, alignment: { horizontal: "right", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });

        rIdx4++;
      });

      // Total Row Tab 4
      const sumRow4 = ws4.getRow(rIdx4);
      sumRow4.height = 26;
      mergeAndStyle(ws4, rIdx4, 1, rIdx4, 2, {
        value: "الإجمالي العام لكافة الموردين",
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL
      });
      styleCell(sumRow4.getCell(3), {
        value: { formula: `SUM(C5:C${rIdx4 - 1})` },
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL,
        numFmt: '#,##0'
      });
      styleCell(sumRow4.getCell(4), {
        value: "",
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        border: BORDER_TOTAL
      });
      styleCell(sumRow4.getCell(5), {
        value: { formula: `SUM(E5:E${rIdx4 - 1})` },
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL,
        numFmt: '#,##0.00'
      });
      styleCell(sumRow4.getCell(6), {
        value: { formula: `SUM(F5:F${rIdx4 - 1})` },
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL,
        numFmt: '#,##0.00 "ر.س"'
      });
      styleCell(sumRow4.getCell(7), {
        value: "100.00%",
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL
      });
      styleCell(sumRow4.getCell(8), {
        value: "",
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        border: BORDER_TOTAL
      });

      // ========================================================
      // 💎 TAB 5: تحليل المبيعات والربحية والطلب (Color: Teal #0D9488)
      // ========================================================
      const ws5 = wb.addWorksheet("تحليل المبيعات والربحية والطلب", {
        properties: { tabColor: { argb: "FF0D9488" } },
        views: [{ rightToLeft: true, state: "frozen", xSplit: 0, ySplit: 4 }]
      });

      const ws5Widths = [6, 14, 32, 10, 16, 16, 15, 16, 18, 15, 14, 16, 18, 16, 14, 24, 16];
      ws5Widths.forEach((w, i) => { ws5.getColumn(i + 1).width = w; });

      ws5.getRow(1).height = 30;
      mergeAndStyle(ws5, 1, 1, 1, 17, {
        value: `${companyName} — تحليل حركة الطلب والمبيعات والأرباح التقديرية لأصناف الموردين`,
        font: { name: "Calibri", size: 13, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D9488" } },
        alignment: { horizontal: "center", vertical: "middle" }
      });

      ws5.getRow(2).height = 20;
      mergeAndStyle(ws5, 2, 1, 2, 17, {
        value: `المورد: ${supFilterName} | النطاق الزمني: ${dateRangeText} | عدد الأصناف المشمولة: ${data.length} صنف | وقت التصدير: ${exportDateStr}`,
        font: { name: "Calibri", size: 10, color: { argb: "FF115E59" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFCCFBF1" } },
        alignment: { horizontal: "center", vertical: "middle" }
      });

      ws5.getRow(3).height = 10;

      // Header Row (Row 4)
      const hRow5 = ws5.getRow(4);
      hRow5.height = 28;
      const headers5 = [
        "م", "كود الصنف", "اسم الصنف", "الوحدة", "التصنيف التجاري",
        "مرات الطلب", "الكمية المشتراة", "متوسط سعر الشراء", "إجمالي المشتريات (ر.س)",
        "الكمية المباعة", "نسبة التصريف %", "متوسط سعر البيع", "إجمالي إيراد المبيعات (ر.س)",
        "مجمل الربح (ر.س)", "هامش الربح %", "أرخص مورد متاح", "أدنى سعر توريد (ر.س)"
      ];
      headers5.forEach((h, cIdx) => {
        styleCell(hRow5.getCell(cIdx + 1), {
          value: h,
          font: { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } },
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D9488" } },
          alignment: { horizontal: "center", vertical: "middle", wrapText: true },
          border: BORDER_HEADER
        });
      });

      // Data Rows (Row 5+)
      let rIdx5 = 5;
      data.forEach((d, i) => {
        const row = ws5.getRow(rIdx5);
        row.height = 22;
        const isZebra = (i % 2 === 1);
        const bgZebra = isZebra 
          ? { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } } 
          : { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };

        const profitColor = d.grossProfit >= 0 ? { argb: "FF15803D" } : { argb: "FFDC2626" };

        styleCell(row.getCell(1), { value: i + 1, font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
        styleCell(row.getCell(2), { value: d.sku || "—", font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
        styleCell(row.getCell(3), { value: d.productName, font: { name: "Calibri", size: 10.5, bold: true, color: { argb: "FF0F172A" } }, alignment: { horizontal: "right", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
        styleCell(row.getCell(4), { value: d.unit || "—", font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
        styleCell(row.getCell(5), { value: `${d.commercialBadge.icon} ${d.commercialBadge.label}`, font: { name: "Calibri", size: 9.5, bold: true }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
        styleCell(row.getCell(6), { value: d.demandCount, font: { name: "Calibri", size: 10, bold: true }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0' });
        styleCell(row.getCell(7), { value: Number(d.totalQty.toFixed(2)), font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00' });
        styleCell(row.getCell(8), { value: Number(d.avgPurchasePrice.toFixed(2)), font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00 "ر.س"' });
        styleCell(row.getCell(9), { value: Number(d.totalAmount.toFixed(2)), font: { name: "Calibri", size: 10.5, bold: true }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00 "ر.س"' });
        styleCell(row.getCell(10), { value: Number(d.qtySold.toFixed(2)), font: { name: "Calibri", size: 10.5, bold: true, color: { argb: "FF0369A1" } }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00' });
        styleCell(row.getCell(11), { value: Number(d.sellThroughRate.toFixed(1)), font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '0.0"%"' });
        styleCell(row.getCell(12), { value: Number(d.avgSellingPrice.toFixed(2)), font: { name: "Calibri", size: 10 }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00 "ر.س"' });
        styleCell(row.getCell(13), { value: Number(d.salesRevenue.toFixed(2)), font: { name: "Calibri", size: 10.5, bold: true, color: { argb: "FF1E293B" } }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00 "ر.س"' });
        styleCell(row.getCell(14), { value: Number(d.grossProfit.toFixed(2)), font: { name: "Calibri", size: 10.5, bold: true, color: profitColor }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00 "ر.س"' });
        styleCell(row.getCell(15), { value: Number(d.marginPct.toFixed(1)), font: { name: "Calibri", size: 10, bold: true, color: profitColor }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '0.0"%"' });
        styleCell(row.getCell(16), { value: d.suppliers[0]?.supplierName || "—", font: { name: "Calibri", size: 9.5, bold: true, color: { argb: "FF166534" } }, alignment: { horizontal: "right", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN });
        styleCell(row.getCell(17), { value: Number(d.minPrice.toFixed(2)), font: { name: "Calibri", size: 10, bold: true, color: { argb: "FF166534" } }, alignment: { horizontal: "center", vertical: "middle" }, fill: bgZebra, border: BORDER_THIN, numFmt: '#,##0.00 "ر.س"' });

        rIdx5++;
      });

      // Total Row Tab 5
      const sumRow5 = ws5.getRow(rIdx5);
      sumRow5.height = 26;
      mergeAndStyle(ws5, rIdx5, 1, rIdx5, 6, {
        value: "الإجمالي العام لكافة الأصناف المحللة",
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL
      });
      styleCell(sumRow5.getCell(7), {
        value: { formula: `SUM(G5:G${rIdx5 - 1})` },
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL,
        numFmt: '#,##0.00'
      });
      styleCell(sumRow5.getCell(8), {
        value: "",
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        border: BORDER_TOTAL
      });
      styleCell(sumRow5.getCell(9), {
        value: { formula: `SUM(I5:I${rIdx5 - 1})` },
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL,
        numFmt: '#,##0.00 "ر.س"'
      });
      styleCell(sumRow5.getCell(10), {
        value: { formula: `SUM(J5:J${rIdx5 - 1})` },
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL,
        numFmt: '#,##0.00'
      });
      styleCell(sumRow5.getCell(11), {
        value: "",
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        border: BORDER_TOTAL
      });
      styleCell(sumRow5.getCell(12), {
        value: "",
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        border: BORDER_TOTAL
      });
      styleCell(sumRow5.getCell(13), {
        value: { formula: `SUM(M5:M${rIdx5 - 1})` },
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL,
        numFmt: '#,##0.00 "ر.س"'
      });
      styleCell(sumRow5.getCell(14), {
        value: { formula: `SUM(N5:N${rIdx5 - 1})` },
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        alignment: { horizontal: "center", vertical: "middle" },
        border: BORDER_TOTAL,
        numFmt: '#,##0.00 "ر.س"'
      });
      styleCell(sumRow5.getCell(15), {
        value: "",
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        border: BORDER_TOTAL
      });
      styleCell(sumRow5.getCell(16), {
        value: "",
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        border: BORDER_TOTAL
      });
      styleCell(sumRow5.getCell(17), {
        value: "",
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } },
        border: BORDER_TOTAL
      });

      // Write and Download Buffer
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);

      if (window.showToast) {
        window.showToast("تم تصدير ملف الإكسل المطور بنجاح بـ 5 تبويبات ملونة وتنسيقات احترافية!", "success", 4000);
      }
    } catch (err) {
      console.error("Export Excel Error:", err);
      alert("حدث خطأ أثناء تصدير ملف الإكسل: " + (err.message || err));
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalBtnHtml;
      }
    }
  };

  // Royal PDF Print: Single Product Comparison Matrix
  window.printRoyalProductCompare = () => {
    const prodId = document.getElementById("sph-compare-prod")?.value;
    const prod = allProducts.find(p => p.id === prodId);
    if (!prod) {
      alert("يرجى اختيار صنف أولاً لإتمام الطباعة الملكية.");
      return;
    }

    const targetQty = parseFloat(document.getElementById("sph-calc-qty")?.value) || 50;
    const co = (() => {
      try { return JSON.parse(localStorage.getItem("idham_company") || "{}"); } catch { return {}; }
    })();

    const history = [];
    allPurchases.forEach(inv => {
      (inv.lines || inv.items || []).forEach(line => {
        if (line.productId === prod.id || line.productName === prod.name || line.name === prod.name) {
          history.push({
            date: inv.date || inv.invoiceDate || "",
            invoiceNumber: inv.number || inv.invoiceNumber || (inv.id ? inv.id.slice(0, 8) : "—"),
            supplierName: inv.supplierName || "مورد",
            unitPrice: parseFloat(line.unitPrice || line.price || 0),
            qty: parseFloat(line.qty || 1),
            total: parseFloat(line.total || ((line.qty || 1) * (line.unitPrice || 0)))
          });
        }
      });
    });

    history.sort((a, b) => (a.date || "").localeCompare(b.date || ""));

    const prices = history.map(h => h.unitPrice);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;

    const supStats = {};
    history.forEach(h => {
      if (!supStats[h.supplierName]) supStats[h.supplierName] = { name: h.supplierName, prices: [], count: 0, totalQty: 0, totalAmount: 0 };
      supStats[h.supplierName].prices.push(h.unitPrice);
      supStats[h.supplierName].count += 1;
      supStats[h.supplierName].totalQty += h.qty;
      supStats[h.supplierName].totalAmount += h.total;
    });

    const supComparison = Object.values(supStats).map(s => ({
      name: s.name,
      minPrice: Math.min(...s.prices),
      maxPrice: Math.max(...s.prices),
      avgPrice: s.prices.reduce((a, b) => a + b, 0) / s.prices.length,
      lastPrice: s.prices[s.prices.length - 1],
      totalPurchasedQty: s.totalQty,
      totalPurchasedAmount: s.totalAmount,
      purchasesCount: s.count
    })).sort((a, b) => a.lastPrice - b.lastPrice || a.avgPrice - b.avgPrice);

    const bestSup = supComparison[0];
    const bestPrice = bestSup ? (bestSup.lastPrice || bestSup.avgPrice) : 0;
    const worstSup = supComparison[supComparison.length - 1];
    const worstPrice = worstSup ? (worstSup.lastPrice || worstSup.avgPrice) : bestPrice;
    const diffPerUnit = worstPrice - bestPrice;
    const totalSaving = diffPerUnit * targetQty;

    const printWin = window.open("", "_blank");
    if (!printWin) {
      alert("يرجى السماح بالنوافذ المنبثقة.");
      return;
    }

    printWin.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>بطاقة مقارنة أسعار الموردين والترسية الشرائية — ${prod.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@500;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Cairo', sans-serif; background: #f8fafc; color: #0f172a; padding: 16px; font-size: 11px; }
    .no-print { margin-bottom: 12px; display: flex; justify-content: flex-end; gap: 8px; }
    .btn { padding: 6px 16px; border-radius: 6px; font-family: 'Cairo', sans-serif; font-size: 12px; font-weight: 800; cursor: pointer; border: none; }
    .royal-sheet { max-width: 287mm; margin: 0 auto; background: #fff; border: 1.5px solid #1e1b4b; border-radius: 8px; padding: 14px 18px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    .royal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #1e1b4b; padding-bottom: 8px; margin-bottom: 10px; }
    .royal-title-box h1 { font-size: 18px; font-weight: 900; color: #1e1b4b; }
    .royal-title-box h2 { font-size: 11px; font-weight: 700; color: #d97706; }
    .co-meta { text-align: left; font-size: 10px; color: #475569; }
    .co-meta b { color: #1e1b4b; }
    .prod-strip { background: #eef2ff; border: 1.5px solid #c7d2fe; border-radius: 6px; padding: 8px 14px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; }
    .rec-box { background: #ecfdf5; border: 1.5px solid #86efac; border-radius: 6px; padding: 8px 14px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
    .royal-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1.5px solid #1e1b4b; font-size: 10px; }
    .royal-table thead tr { background: #1e1b4b !important; color: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .royal-table thead th { padding: 5px; font-size: 9.5px; font-weight: 800; text-align: center; border: 1px solid rgba(255,255,255,0.2); }
    .royal-table tbody tr { border-bottom: 1px solid #e2e8f0; }
    .royal-table tbody tr:nth-child(even) { background: #f8fafc; }
    .royal-table tbody td { padding: 5px; text-align: center; border: 1px solid #e2e8f0; }
    .mono { font-family: 'IBM Plex Mono', monospace; }
    .font-bold { font-weight: 700; }
    .signatures-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 14px; border-top: 1px dashed #cbd5e1; padding-top: 8px; }
    .sig-card { border: 1px dashed #94a3b8; border-radius: 6px; padding: 6px 10px; background: #fafafa; min-height: 55px; display: flex; flex-direction: column; justify-content: space-between; font-size: 9.5px; }
    .sig-title { font-weight: 800; color: #334155; }
    .sig-line { border-top: 1px solid #94a3b8; padding-top: 2px; font-size: 8.5px; color: #64748b; }
    @page { size: A4 landscape; margin: 6mm 8mm; }
    @media print {
      body { background: #fff !important; padding: 0 !important; }
      .no-print { display: none !important; }
      .royal-sheet { border: 1px solid #1e1b4b !important; box-shadow: none !important; border-radius: 0 !important; }
      tr, .sig-card { page-break-inside: avoid !important; break-inside: avoid !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn" style="background:#1e1b4b; color:#fff;" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
    <button class="btn" style="background:#64748b; color:#fff;" onclick="window.close()">✕ إغلاق</button>
  </div>
  <div class="royal-sheet">
    <div class="royal-header">
      <div class="royal-title-box">
        <h1>بطاقة مقارنة أسعار الموردين والترسية الشرائية</h1>
        <h2>PRODUCT CROSS-SUPPLIER PRICING & PROCUREMENT DECISION</h2>
      </div>
      <div class="co-meta">
        <div><b>${companySettings.name || co.name || "شركة نظم الإمداد المتطوره"}</b></div>
        <div>السجل: <span class="mono"><b>${companySettings.crNumber || co.crNumber || "7054969006"}</b></span> | الرقم الضريبي: <span class="mono"><b>${companySettings.vatNumber || co.vatNumber || "314996148100003"}</b></span></div>
      </div>
    </div>

    <div class="prod-strip">
      <div>الصنف: <b style="font-size:13px; color:#1e1b4b;">${prod.name}</b></div>
      <div>كود الصنف: <b class="mono">${prod.sku || "—"}</b></div>
      <div>الوحدة: <b style="color:#6366f1;">${prod.unit || "كرتون"}</b></div>
      <div>التكلفة المسجلة: <b class="mono">${formatCurrency(prod.costPrice || 0)}</b></div>
      <div>سعر البيع: <b class="mono" style="color:#16a34a;">${formatCurrency(prod.price || 0)}</b></div>
    </div>

    ${bestSup ? `
      <div class="rec-box">
        <div>
          <div style="font-weight:900; color:#166534; font-size:12.5px;">💡 قرار الترسية الموصى به: المورد [ ${bestSup.name} ]</div>
          <div style="color:#15803d; font-size:10.5px;">أفضل سعر حالي: <b>${formatCurrency(bestPrice)}</b> | وفر قدره <b>${formatCurrency(diffPerUnit)}</b> لكل وحدة مقارنة بالمورد [ ${worstSup?.name || '—'} ].</div>
        </div>
        <div style="text-align:left; background:#fff; padding:6px 12px; border-radius:6px; border:1px solid #bbf7d0;">
          <div style="font-size:9.5px; color:#475569; font-weight:700;">الوفر المتوقع لكمية ${targetQty} ${prod.unit || 'كرتون'}:</div>
          <div class="mono font-bold" style="font-size:16px; color:#16a34a;">${formatCurrency(totalSaving)}</div>
        </div>
      </div>
    ` : ''}

    <table class="royal-table">
      <thead>
        <tr>
          <th>ترتيب المورد</th>
          <th>اسم المورد</th>
          <th>آخر سعر مسجل</th>
          <th>أقل سعر</th>
          <th>أعلى سعر</th>
          <th>متوسط السعر</th>
          <th>الفارق عن الأرخص</th>
          <th>تكلفة ${targetQty} وحدة</th>
          <th>عدد الفواتير</th>
          <th>إجمالي الكميات المشتراة</th>
        </tr>
      </thead>
      <tbody>
        ${supComparison.map((s, idx) => `
          <tr style="${idx === 0 ? 'background:#f0fdf4;' : ''}">
            <td class="font-bold">${idx === 0 ? '🥇 الأفضل' : idx === 1 ? '🥈 الثاني' : idx === 2 ? '🥉 الثالث' : `#${idx + 1}`}</td>
            <td class="font-bold" style="text-align:right;">${s.name}</td>
            <td class="mono font-bold">${formatCurrency(s.lastPrice)}</td>
            <td class="mono text-good">${formatCurrency(s.minPrice)}</td>
            <td class="mono text-bad">${formatCurrency(s.maxPrice)}</td>
            <td class="mono">${formatCurrency(s.avgPrice)}</td>
            <td class="font-bold" style="color:${idx === 0 ? '#16a34a' : '#dc2626'};">
              ${idx === 0 ? 'سعر الأساس' : `+${formatCurrency(s.lastPrice - bestPrice)}`}
            </td>
            <td class="mono font-bold">${formatCurrency(s.lastPrice * targetQty)}</td>
            <td class="mono">${s.purchasesCount}</td>
            <td class="mono font-bold">${s.totalPurchasedQty}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div class="signatures-row">
      <div class="sig-card">
        <div class="sig-title">✍️ توصية مسؤول المشتريات:</div>
        <div class="sig-line">الاسم والتوقيع: _______________________</div>
      </div>
      <div class="sig-card">
        <div class="sig-title">✍️ تدقيق الإدارة المالية:</div>
        <div class="sig-line">الاسم والتوقيع: _______________________</div>
      </div>
      <div class="sig-card">
        <div class="sig-title">✍️ اعتماد الترسية والشراء:</div>
        <div class="sig-line">الاسم والختم: _______________________</div>
      </div>
    </div>
  </div>
</body>
</html>`);
    printWin.document.close();
  };

  // Royal PDF Print: Full Purchases Report with Side-by-side Suppliers
  window.printRoyalSupplierPurchases = () => {
    const data = processPurchasesData();
    if (!data.length) {
      alert("لا توجد بيانات للطباعة.");
      return;
    }

    const co = (() => {
      try { return JSON.parse(localStorage.getItem("idham_company") || "{}"); } catch { return {}; }
    })();

    const selectedSup = allSuppliers.find(s => s.id === currentFilters.supplierId);
    const supHeaderTitle = selectedSup ? selectedSup.name : "كافة الموردين (عرض مصفوفة الموردين الأفقية)";

    const totalSpend = data.reduce((s, d) => s + d.totalAmount, 0);
    const totalQuantities = data.reduce((s, d) => s + d.totalQty, 0);
    const totalPurchaseEvents = data.reduce((s, d) => s + d.totalPurchases, 0);
    const uniqueProductsCount = data.length;
    const multiSupplierItems = data.filter(d => d.suppliersCount > 1).length;

    const tafqeetText = (typeof tafqeetArabic === "function") ? tafqeetArabic(totalSpend) : "";

    const printWin = window.open("", "_blank");
    if (!printWin) {
      alert("يرجى السماح بالنوافذ المنبثقة لإتمام الطباعة الملكية.");
      return;
    }

    printWin.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>مصفوفة مشتريات الأصناف ومقارنة الموردين — ${supHeaderTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@500;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Cairo', system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 14px; font-size: 10.5px; line-height: 1.35; }
    .no-print { margin-bottom: 12px; display: flex; justify-content: flex-end; gap: 8px; }
    .btn { padding: 6px 16px; border-radius: 6px; font-family: 'Cairo', sans-serif; font-size: 11.5px; font-weight: 800; cursor: pointer; border: none; }
    .royal-sheet { max-width: 290mm; margin: 0 auto; background: #fff; border: 1.5px solid #1e1b4b; border-radius: 8px; padding: 12px 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    .royal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #1e1b4b; padding-bottom: 6px; margin-bottom: 8px; }
    .royal-title-box h1 { font-size: 17px; font-weight: 900; color: #1e1b4b; margin-bottom: 1px; }
    .royal-title-box h2 { font-size: 10.5px; font-weight: 700; color: #d97706; }
    .gold-pill { display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; padding: 1px 7px; border-radius: 4px; font-size: 9px; font-weight: 800; margin-top: 3px; }
    .co-meta { text-align: left; font-size: 9.5px; color: #475569; }
    .co-meta b { color: #1e1b4b; }
    .filter-meta-bar { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 5px 10px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; }
    .filter-meta-bar strong { color: #1e1b4b; font-weight: 800; }
    .kpi-strip { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-bottom: 8px; }
    .kpi-box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 5px 8px; background: #fff; text-align: center; }
    .kpi-box .lbl { font-size: 8.5px; color: #64748b; font-weight: 700; margin-bottom: 1px; }
    .kpi-box .val { font-size: 12.5px; font-weight: 800; font-family: 'IBM Plex Mono', monospace; }
    .royal-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; border: 1.5px solid #1e1b4b; font-size: 9.5px; }
    .royal-table thead tr { background: #1e1b4b !important; color: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .royal-table thead th { padding: 5px 4px; font-size: 9px; font-weight: 800; text-align: center; border: 1px solid rgba(255,255,255,0.2); }
    .royal-table tbody tr { border-bottom: 1px solid #e2e8f0; }
    .royal-table tbody tr:nth-child(even) { background: #f8fafc; }
    .royal-table tbody td { padding: 5px 4px; text-align: center; border: 1px solid #e2e8f0; color: #1e293b; }
    .royal-table tbody td.desc { text-align: right; }
    .mono { font-family: 'IBM Plex Mono', monospace; }
    .font-bold { font-weight: 700; }
    .sup-print-pill { display: inline-block; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 5px; margin: 2px; text-align: right; font-size: 8.5px; }
    .sup-print-pill.cheapest { background: #ecfdf5; border-color: #86efac; color: #166534; font-weight: 800; }
    .tafqeet-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 5px 10px; margin-bottom: 10px; font-size: 10px; display: flex; justify-content: space-between; align-items: center; }
    .tafqeet-box b { color: #1e40af; }
    .signatures-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 8px; border-top: 1px dashed #cbd5e1; padding-top: 6px; }
    .sig-card { border: 1px dashed #94a3b8; border-radius: 5px; padding: 5px 8px; background: #fafafa; min-height: 50px; display: flex; flex-direction: column; justify-content: space-between; font-size: 9px; }
    .sig-title { font-weight: 800; color: #334155; }
    .sig-line { border-top: 1px solid #94a3b8; padding-top: 2px; font-size: 8px; color: #64748b; }
    @page { size: A4 landscape; margin: 5mm 6mm; }
    @media print {
      body { background: #fff !important; padding: 0 !important; }
      .no-print { display: none !important; }
      .royal-sheet { border: 1px solid #1e1b4b !important; box-shadow: none !important; max-width: 100% !important; border-radius: 0 !important; padding: 4px !important; }
      tr, .kpi-box, .sig-card { page-break-inside: avoid !important; break-inside: avoid !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn" style="background:#1e1b4b; color:#fff;" onclick="window.print()">🖨️ طباعة التقرير / حفظ PDF</button>
    <button class="btn" style="background:#64748b; color:#fff;" onclick="window.close()">✕ إغلاق</button>
  </div>

  <div class="royal-sheet">
    <div class="royal-header">
      <div class="royal-title-box">
        <h1>مصفوفة مشتريات الأصناف ومقارنة الموردين الأفقية</h1>
        <h2>CROSS-SUPPLIER HORIZONTAL PURCHASE & PRICING MATRIX</h2>
        <span class="gold-pill">👑 تقرير ملكي — تحت كل مورد سعره وتفاصيله</span>
      </div>
      <div class="co-meta">
        <div><b>${companySettings.name || co.name || "شركة نظم الإمداد المتطوره"}</b></div>
        <div>السجل: <span class="mono"><b>${companySettings.crNumber || co.crNumber || "7054969006"}</b></span> | الضريبي: <span class="mono"><b>${companySettings.vatNumber || co.vatNumber || "314996148100003"}</b></span></div>
      </div>
    </div>

    <div class="filter-meta-bar">
      <div>المورد المختار: <strong>${supHeaderTitle}</strong></div>
      <div>الفترة: <strong>${currentFilters.dateFrom || "من البداية"}</strong> إلى <strong>${currentFilters.dateTo || "حتى تاريخه"}</strong></div>
      <div>عدد الأصناف: <strong class="mono">${data.length} صنف</strong> | متعددة الموردين: <strong class="mono">${multiSupplierItems} صنف</strong></div>
      <div>وقت الطباعة: <strong class="mono">${new Date().toLocaleDateString('ar-SA')}</strong></div>
    </div>

    <div class="kpi-strip">
      <div class="kpi-box">
        <div class="lbl">إجمالي المشتريات</div>
        <div class="val" style="color:#1e1b4b;">${formatCurrency(totalSpend)}</div>
      </div>
      <div class="kpi-box">
        <div class="lbl">إجمالي الكميات</div>
        <div class="val" style="color:#0284c7;">${totalQuantities.toLocaleString('en-US')}</div>
      </div>
      <div class="kpi-box">
        <div class="lbl">الأصناف المشتراة</div>
        <div class="val" style="color:#8b5cf6;">${uniqueProductsCount}</div>
      </div>
      <div class="kpi-box">
        <div class="lbl">أصناف متعددة الموردين 🔄</div>
        <div class="val" style="color:#d97706;">${multiSupplierItems}</div>
      </div>
      <div class="kpi-box">
        <div class="lbl">حركات التوريد</div>
        <div class="val" style="color:#10b981;">${totalPurchaseEvents}</div>
      </div>
    </div>

    <table class="royal-table">
      <thead>
        <tr>
          <th style="width:25px;">م</th>
          <th style="width:160px;">الصنف والبيان</th>
          <th>الموردين والأسعار (المقارنة المباشرة — كل مورد وتحته سعره)</th>
          <th style="width:65px;">أدنى سعر 🥇</th>
          <th style="width:75px;">أعلى سعر 🔺</th>
          <th style="width:50px;">الكمية</th>
          <th style="width:85px;">إجمالي القيمة</th>
        </tr>
      </thead>
      <tbody>
        ${data.map((r, i) => `
          <tr>
            <td class="mono font-bold">${i + 1}</td>
            <td class="desc">
              <div class="font-bold">${r.productName}</div>
              <div style="font-size:8px; color:#64748b;">الوحدة: ${r.unit} ${r.sku && r.sku !== '—' ? `| كود: ${r.sku}` : ''}</div>
            </td>
            <td style="text-align:right;">
              ${r.suppliers.map((s, sIdx) => `
                <div class="sup-print-pill ${sIdx === 0 && r.suppliersCount > 1 ? 'cheapest' : ''}">
                  <div><b>${sIdx === 0 && r.suppliersCount > 1 ? '🥇 ' : ''}${s.supplierName}</b></div>
                  <div class="mono font-bold" style="font-size:10px;">${formatCurrency(s.latestPrice)} (${s.purchaseCount} مرّة)</div>
                </div>
              `).join("")}
            </td>
            <td class="mono font-bold text-good">${formatCurrency(r.minPrice)}</td>
            <td class="mono font-bold" style="color:${r.priceSpread > 0 ? '#dc2626' : '#475569'};">
              ${formatCurrency(r.maxPrice)}
              ${r.priceSpread > 0 ? `<div style="font-size:7.5px; color:#059669;">وفر ${formatCurrency(r.priceSpread)}</div>` : ''}
            </td>
            <td class="mono font-bold">${r.totalQty}</td>
            <td class="mono font-bold" style="text-align:left;">${formatCurrency(r.totalAmount)}</td>
          </tr>
        `).join("")}
      </tbody>
      <tfoot style="background:#f1f5f9; font-weight:800; border-top:2px solid #1e1b4b;">
        <tr>
          <td colspan="2" style="text-align:right; padding:5px 8px;">المجموع الإجمالي:</td>
          <td style="text-align:right; font-size:9.5px; color:#4338ca;">توريدات: ${totalPurchaseEvents} فاتورة</td>
          <td colspan="2"></td>
          <td class="mono font-bold">${totalQuantities.toLocaleString('en-US')}</td>
          <td class="mono font-bold" style="text-align:left; color:#1e1b4b; font-size:11px;">
            ${formatCurrency(totalSpend)}
          </td>
        </tr>
      </tfoot>
    </table>

    <div class="tafqeet-box">
      <div>✍️ المبلغ الإجمالي بالحروف: <b>${tafqeetText}</b></div>
      <div>عدد البنود التحليلية: <b class="mono">${data.length} صنف</b></div>
    </div>

    <div class="signatures-row">
      <div class="sig-card">
        <div class="sig-title">✍️ إعداد المشتريات:</div>
        <div class="sig-line">الاسم والتوقيع: _______________________</div>
      </div>
      <div class="sig-card">
        <div class="sig-title">✍️ مراجعة الحسابات:</div>
        <div class="sig-line">الاسم والتوقيع: _______________________</div>
      </div>
      <div class="sig-card">
        <div class="sig-title">✍️ اعتماد الإدارة:</div>
        <div class="sig-line">الاسم والختم: _______________________</div>
      </div>
    </div>
  </div>
</body>
</html>`);
    printWin.document.close();
  };

  // Royal PDF Print: Comprehensive Sales, Demand & Profitability Report
  window.printRoyalSalesProfitability = () => {
    const rawData = processPurchasesData();
    if (!rawData.length) {
      alert("لا توجد بيانات للطباعة.");
      return;
    }

    const sortKey = currentFilters.profitSort || "qty-sold";
    const data = [...rawData];
    if (sortKey === "qty-sold") {
      data.sort((a, b) => b.qtySold - a.qtySold || b.grossProfit - a.grossProfit);
    } else if (sortKey === "demand") {
      data.sort((a, b) => b.demandCount - a.demandCount || b.qtySold - a.qtySold);
    } else if (sortKey === "gross-profit") {
      data.sort((a, b) => b.grossProfit - a.grossProfit || b.marginPct - a.marginPct);
    } else if (sortKey === "margin") {
      data.sort((a, b) => b.marginPct - a.marginPct || b.grossProfit - a.grossProfit);
    } else if (sortKey === "golden") {
      data.sort((a, b) => {
        const aG = a.commercialBadge.type === "golden" ? 2 : (a.commercialBadge.type === "fast" || a.commercialBadge.type === "high-margin" ? 1 : 0);
        const bG = b.commercialBadge.type === "golden" ? 2 : (b.commercialBadge.type === "fast" || b.commercialBadge.type === "high-margin" ? 1 : 0);
        return bG - aG || b.grossProfit - a.grossProfit;
      });
    } else if (sortKey === "stagnant") {
      data.sort((a, b) => a.qtySold - b.qtySold || b.totalQty - a.totalQty);
    }

    const co = (() => {
      try { return JSON.parse(localStorage.getItem("idham_company") || "{}"); } catch { return {}; }
    })();

    const selectedSup = allSuppliers.find(s => s.id === currentFilters.supplierId);
    const supHeaderTitle = selectedSup ? selectedSup.name : "كافة الموردين (عرض تحليلي مجمع للأصناف)";

    const totalSpend = data.reduce((s, d) => s + d.totalAmount, 0);
    const totalPurchasedQty = data.reduce((s, d) => s + d.totalQty, 0);
    const totalSoldQty = data.reduce((s, d) => s + d.qtySold, 0);
    const totalRevenue = data.reduce((s, d) => s + d.salesRevenue, 0);
    const totalGrossProfit = data.reduce((s, d) => s + d.grossProfit, 0);
    const overallMarginPct = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;
    const overallSellThrough = totalPurchasedQty > 0 ? (totalSoldQty / totalPurchasedQty) * 100 : 0;
    const totalDemandEvents = data.reduce((s, d) => s + d.demandCount, 0);

    // Top 5 Golden Performers
    const top5Performers = [...data]
      .filter(d => d.qtySold > 0)
      .sort((a, b) => b.grossProfit - a.grossProfit || b.qtySold - a.qtySold)
      .slice(0, 5);

    const tafqeetRevenue = (typeof tafqeetArabic === "function") ? tafqeetArabic(totalRevenue) : "";
    const tafqeetProfit = (typeof tafqeetArabic === "function") ? tafqeetArabic(totalGrossProfit) : "";

    const printWin = window.open("", "_blank");
    if (!printWin) {
      alert("يرجى السماح بالنوافذ المنبثقة لإتمام الطباعة الملكية.");
      return;
    }

    printWin.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>تقرير تحليل الطلب والمبيعات والأرباح — ${supHeaderTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@500;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Cairo', system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 14px; font-size: 10px; line-height: 1.35; }
    .no-print { margin-bottom: 12px; display: flex; justify-content: flex-end; gap: 8px; }
    .btn { padding: 6px 16px; border-radius: 6px; font-family: 'Cairo', sans-serif; font-size: 11.5px; font-weight: 800; cursor: pointer; border: none; }
    .royal-sheet { max-width: 292mm; margin: 0 auto; background: #fff; border: 1.5px solid #1e1b4b; border-radius: 8px; padding: 12px 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    .royal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #1e1b4b; padding-bottom: 6px; margin-bottom: 8px; }
    .royal-title-box h1 { font-size: 16.5px; font-weight: 900; color: #1e1b4b; margin-bottom: 1px; }
    .royal-title-box h2 { font-size: 10px; font-weight: 700; color: #d97706; }
    .gold-pill { display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; padding: 1px 7px; border-radius: 4px; font-size: 9px; font-weight: 800; margin-top: 3px; }
    .co-meta { text-align: left; font-size: 9.5px; color: #475569; }
    .co-meta b { color: #1e1b4b; }
    .filter-meta-bar { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 5px 10px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; }
    .filter-meta-bar strong { color: #1e1b4b; font-weight: 800; }
    .kpi-strip { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-bottom: 8px; }
    .kpi-box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 5px 8px; background: #fff; text-align: center; }
    .kpi-box .lbl { font-size: 8.5px; color: #64748b; font-weight: 700; margin-bottom: 1px; }
    .kpi-box .val { font-size: 12px; font-weight: 800; font-family: 'IBM Plex Mono', monospace; }
    
    /* Top 5 Showcase Strip */
    .top-performers-box { background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 6px; padding: 6px 10px; margin-bottom: 8px; }
    .top-performers-title { font-weight: 900; color: #92400e; font-size: 10px; margin-bottom: 4px; display: flex; align-items: center; gap: 4px; }
    .top-performers-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
    .performer-card { background: #fff; border: 1px solid #fef08a; border-radius: 5px; padding: 4px 6px; }
    .performer-rank { font-size: 8.5px; font-weight: 800; color: #b45309; }
    .performer-name { font-size: 9.5px; font-weight: 800; color: #1e1b4b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .performer-stats { font-size: 8.5px; color: #475569; margin-top: 1px; }

    .royal-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; border: 1.5px solid #1e1b4b; font-size: 9px; }
    .royal-table thead tr { background: #1e1b4b !important; color: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .royal-table thead th { padding: 5px 4px; font-size: 8.5px; font-weight: 800; text-align: center; border: 1px solid rgba(255,255,255,0.2); }
    .royal-table tbody tr { border-bottom: 1px solid #e2e8f0; }
    .royal-table tbody tr:nth-child(even) { background: #f8fafc; }
    .royal-table tbody td { padding: 4px 4px; text-align: center; border: 1px solid #e2e8f0; color: #1e293b; }
    .royal-table tbody td.desc { text-align: right; }
    .mono { font-family: 'IBM Plex Mono', monospace; }
    .font-bold { font-weight: 700; }
    .badge-print { display: inline-block; padding: 1px 4px; border-radius: 3px; font-size: 8px; font-weight: 800; }
    .tafqeet-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 5px 10px; margin-bottom: 8px; font-size: 9.5px; display: flex; justify-content: space-between; align-items: center; }
    .tafqeet-box b { color: #1e40af; }
    .signatures-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 6px; border-top: 1px dashed #cbd5e1; padding-top: 5px; }
    .sig-card { border: 1px dashed #94a3b8; border-radius: 5px; padding: 4px 6px; background: #fafafa; min-height: 48px; display: flex; flex-direction: column; justify-content: space-between; font-size: 8.5px; }
    .sig-title { font-weight: 800; color: #334155; }
    .sig-line { border-top: 1px solid #94a3b8; padding-top: 2px; font-size: 8px; color: #64748b; }
    @page { size: A4 landscape; margin: 5mm 6mm; }
    @media print {
      body { background: #fff !important; padding: 0 !important; }
      .no-print { display: none !important; }
      .royal-sheet { border: 1px solid #1e1b4b !important; box-shadow: none !important; max-width: 100% !important; border-radius: 0 !important; padding: 4px !important; }
      tr, .kpi-box, .sig-card, .performer-card { page-break-inside: avoid !important; break-inside: avoid !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn" style="background:#1e1b4b; color:#fff;" onclick="window.print()">🖨️ طباعة التقرير / حفظ PDF</button>
    <button class="btn" style="background:#64748b; color:#fff;" onclick="window.close()">✕ إغلاق</button>
  </div>

  <div class="royal-sheet">
    <div class="royal-header">
      <div class="royal-title-box">
        <h1>تقرير تحليل الطلب والمبيعات وهامش الربحية لأصناف الموردين</h1>
        <h2>SUPPLIER PRODUCTS DEMAND, SALES TURNOVER & PROFITABILITY REPORT</h2>
        <span class="gold-pill">👑 تقرير تنفيذي معتمد — الربحية ومعدلات التصريف وسرعة الدوران</span>
      </div>
      <div class="co-meta">
        <div><b>${companySettings.name || co.name || "شركة نظم الإمداد المتطوره"}</b></div>
        <div>السجل: <span class="mono"><b>${companySettings.crNumber || co.crNumber || "7054969006"}</b></span> | الضريبي: <span class="mono"><b>${companySettings.vatNumber || co.vatNumber || "314996148100003"}</b></span></div>
      </div>
    </div>

    <div class="filter-meta-bar">
      <div>المورد المختار: <strong>${supHeaderTitle}</strong></div>
      <div>الفترة المحددة: <strong>${currentFilters.dateFrom || "من البداية"}</strong> إلى <strong>${currentFilters.dateTo || "حتى تاريخه"}</strong></div>
      <div>الأصناف المشمولة: <strong class="mono">${data.length} صنف</strong> | إجمالي حركات الطلب: <strong class="mono">${totalDemandEvents} حركة</strong></div>
      <div>تاريخ وتوقيت الطباعة: <strong class="mono">${new Date().toLocaleString('ar-SA')}</strong></div>
    </div>

    <div class="kpi-strip">
      <div class="kpi-box">
        <div class="lbl">إجمالي تكلفة المشتريات</div>
        <div class="val" style="color:#1e1b4b;">${formatCurrency(totalSpend)}</div>
      </div>
      <div class="kpi-box">
        <div class="lbl">إجمالي إيراد المبيعات (صافي)</div>
        <div class="val" style="color:#0284c7;">${formatCurrency(totalRevenue)}</div>
      </div>
      <div class="kpi-box">
        <div class="lbl">مجمل الأرباح المحققة 📈</div>
        <div class="val" style="color:#10b981;">${formatCurrency(totalGrossProfit)}</div>
      </div>
      <div class="kpi-box">
        <div class="lbl">متوسط هامش الربح %</div>
        <div class="val" style="color:#8b5cf6;">${overallMarginPct.toFixed(1)}%</div>
      </div>
      <div class="kpi-box">
        <div class="lbl">نسبة تصريف المخزون %</div>
        <div class="val" style="color:#d97706;">${overallSellThrough.toFixed(1)}% (${totalSoldQty}/${totalPurchasedQty})</div>
      </div>
    </div>

    ${top5Performers.length > 0 ? `
      <!-- Top 5 Golden Performers Strip -->
      <div class="top-performers-box">
        <div class="top-performers-title">
          <span>🌟 لوحة الشرف للأصناف الذهبية الأكثر مبيعاً وربحية:</span>
        </div>
        <div class="top-performers-grid">
          ${top5Performers.map((p, idx) => `
            <div class="performer-card">
              <div class="performer-rank">${idx === 0 ? '🥇 الأول' : idx === 1 ? '🥈 الثاني' : idx === 2 ? '🥉 الثالث' : `#${idx + 1}`}</div>
              <div class="performer-name" title="${p.productName}">${p.productName}</div>
              <div class="performer-stats">
                مباع: <b>${p.qtySold}</b> ${p.unit} | ربح: <b style="color:#059669;">${formatCurrency(p.grossProfit)}</b>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    ` : ''}

    <table class="royal-table">
      <thead>
        <tr>
          <th style="width:25px;">م</th>
          <th style="width:160px;">الصنف والبيان</th>
          <th style="width:65px;">التصنيف</th>
          <th style="width:70px;">الكمية المشتراة</th>
          <th style="width:65px;">متوسط الشراء</th>
          <th style="width:55px;">مرات الطلب</th>
          <th style="width:70px;">الكمية المباعة</th>
          <th style="width:55px;">التصريف %</th>
          <th style="width:75px;">إيراد المبيعات</th>
          <th style="width:75px;">مجمل الربح</th>
          <th style="width:50px;">الهامش %</th>
          <th style="width:110px;">أرخص مورد متاح</th>
        </tr>
      </thead>
      <tbody>
        ${data.map((r, i) => `
          <tr>
            <td class="mono font-bold">${i + 1}</td>
            <td class="desc">
              <div class="font-bold">${r.productName}</div>
              <div style="font-size:7.5px; color:#64748b;">الوحدة: ${r.unit} ${r.sku && r.sku !== '—' ? `| كود: ${r.sku}` : ''}</div>
            </td>
            <td>
              <span class="badge-print" style="background:${r.commercialBadge.bg}; color:${r.commercialBadge.color}; border:1px solid ${r.commercialBadge.border};">
                ${r.commercialBadge.icon} ${r.commercialBadge.label}
              </span>
            </td>
            <td class="mono font-bold">${r.totalQty}</td>
            <td class="mono">${formatCurrency(r.avgPurchasePrice)}</td>
            <td class="mono font-bold" style="color:#6366f1;">${r.demandCount}</td>
            <td class="mono font-bold" style="color:#0284c7;">${r.qtySold}</td>
            <td class="mono font-bold" style="color:${r.sellThroughRate >= 50 ? '#166534' : '#475569'};">${r.sellThroughRate.toFixed(1)}%</td>
            <td class="mono font-bold" style="text-align:left;">${formatCurrency(r.salesRevenue)}</td>
            <td class="mono font-bold" style="text-align:left; color:${r.grossProfit >= 0 ? '#16a34a' : '#dc2626'};">${formatCurrency(r.grossProfit)}</td>
            <td class="mono font-bold" style="color:${r.marginPct >= 20 ? '#16a34a' : '#475569'};">${r.marginPct.toFixed(1)}%</td>
            <td style="text-align:right; font-size:8px;">
              <b>${r.suppliers[0]?.supplierName || '—'}</b>
              <div class="mono" style="color:#16a34a; font-size:8px;">${formatCurrency(r.minPrice)}</div>
            </td>
          </tr>
        `).join("")}
      </tbody>
      <tfoot style="background:#f1f5f9; font-weight:800; border-top:2px solid #1e1b4b;">
        <tr>
          <td colspan="3" style="text-align:right; padding:5px 8px;">الإجمالي العام:</td>
          <td class="mono font-bold">${totalPurchasedQty.toLocaleString('en-US')}</td>
          <td></td>
          <td class="mono font-bold" style="color:#6366f1;">${totalDemandEvents}</td>
          <td class="mono font-bold" style="color:#0284c7;">${totalSoldQty.toLocaleString('en-US')}</td>
          <td class="mono font-bold">${overallSellThrough.toFixed(1)}%</td>
          <td class="mono font-bold" style="text-align:left; color:#1e1b4b;">${formatCurrency(totalRevenue)}</td>
          <td class="mono font-bold" style="text-align:left; color:#10b981;">${formatCurrency(totalGrossProfit)}</td>
          <td class="mono font-bold" style="color:#8b5cf6;">${overallMarginPct.toFixed(1)}%</td>
          <td></td>
        </tr>
      </tfoot>
    </table>

    <div class="tafqeet-box">
      <div>✍️ إيراد المبيعات بالحروف: <b>${tafqeetRevenue || '—'}</b></div>
      <div>صافي مجمل الربح: <b style="color:#15803d;">${tafqeetProfit || '—'}</b></div>
    </div>

    <div class="signatures-row">
      <div class="sig-card">
        <div class="sig-title">✍️ إعداد مسؤول المشتريات والمبيعات:</div>
        <div class="sig-line">الاسم والتوقيع: _______________________</div>
      </div>
      <div class="sig-card">
        <div class="sig-title">✍️ مراجعة وتدقيق الإدارة المالية:</div>
        <div class="sig-line">الاسم والتوقيع: _______________________</div>
      </div>
      <div class="sig-card">
        <div class="sig-title">✍️ اعتماد الإدارة العامة:</div>
        <div class="sig-line">الاسم والختم: _______________________</div>
      </div>
    </div>
  </div>
</body>
</html>`);
    printWin.document.close();
  };
}
