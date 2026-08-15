// ============================================================
// IDHAM ERP — Item Card & Stock Ledger Module (كرت الصنف)
// SAP Business One / NetSuite Level Detailed Inventory Audit
// ============================================================
import { COLS, getAll, getStockForProduct } from "../utils/db.js";
import { query, orderBy, getDocs, where } from "../utils/db.js";
import { formatCurrency, formatQuantity, formatDate, todayString, debounce } from "../utils/formatters.js";

let warehouses = [];
let products = [];
let selectedProduct = null;
let currentLedger = [];

export async function render(container, user) {
  container.innerHTML = `
    <!-- Top Filter Bar -->
    <div class="filterbar no-print">
      <div class="form-group" style="width:280px; margin:0;">
        <label style="font-size:11px; margin-bottom:4px; font-weight:bold;">الصنف المطلوب *</label>
        <div class="autocomplete-container" style="position:relative;">
          <input type="text" id="sc-product-search" class="input" placeholder="🔍 ابحث بالاسم، الكود، الباركود..." autocomplete="off" />
          <div class="autocomplete-results hidden" id="sc-product-results" style="position:absolute; width:100%; z-index:999; max-height:200px; overflow-y:auto; background:var(--bg-1); border:1.5px solid var(--border-soft); border-radius:8px; box-shadow:var(--shadow);"></div>
          <input type="hidden" id="sc-product-id" />
        </div>
      </div>

      <div class="filter-select-group">
        <label>المستودع</label>
        <select id="sc-wh-filter" class="input">
          <option value="">جميع المستودعات</option>
        </select>
      </div>

      <div class="filter-select-group">
        <label>نوع العملية</label>
        <select id="sc-type-filter" class="input">
          <option value="">جميع العمليات</option>
          <option value="sales">مبيعات</option>
          <option value="purchases">مشتريات</option>
          <option value="transfers">تحويل مخزني</option>
          <option value="adjustments">تسويات وإتلاف</option>
        </select>
      </div>

      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="sc-date-from" value="${new Date(new Date().setDate(1)).toISOString().split('T')[0]}" />
      </div>

      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="sc-date-to" value="${todayString()}" />
      </div>

      <div style="margin-right:auto; display:flex; gap:8px; align-items:flex-end;">
        <button class="btn btn-primary" onclick="loadStockCardReport()">🔍 عرض الحركة</button>
        <button class="btn-export" onclick="exportPagePDF('.data-dense','كرت_الصنف')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportPageExcel('.data-dense','كرت_الصنف')" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
      </div>
    </div>

    <!-- Page Content -->
    <div class="page-content">
      <!-- Title -->
      <div class="page-header flex justify-between items-center">
        <div>
          <h1 class="page-title">دفتر الأستاذ التفصيلي للمخزون (كرت الصنف)</h1>
          <p class="page-subtitle" id="sc-subtitle">يرجى اختيار صنف لعرض سجل الحركات وكميات المخازن التفصيلية</p>
        </div>
        <div class="no-print">
          <span id="sc-zatca-badge" class="badge good hidden">مطابق لمتطلبات هيئة الزكاة والضريبة والجمارك</span>
        </div>
      </div>

      <!-- Item Profile Card -->
      <div id="sc-profile-wrapper" class="hidden">
        <div class="grid-4 gap-16 mb-24">
          <div class="kpi-card">
            <div class="status-bar indigo"></div>
            <div class="kpi-content">
              <div class="kpi-label">إجمالي الوارد (Inbound)</div>
              <div class="kpi-value mono text-good" id="sc-total-in">0</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="status-bar warn"></div>
            <div class="kpi-content">
              <div class="kpi-label">إجمالي الصادر (Outbound)</div>
              <div class="kpi-value mono text-bad" id="sc-total-out">0</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="status-bar good"></div>
            <div class="kpi-content">
              <div class="kpi-label">الرصيد الفعلي الحالي</div>
              <div class="kpi-value mono text-indigo" id="sc-current-balance">0</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="status-bar neutral"></div>
            <div class="kpi-content">
              <div class="kpi-label">متوسط التكلفة / القيمة الكلية</div>
              <div class="kpi-value mono" id="sc-total-valuation" style="font-size:14px; font-weight:bold;">—</div>
            </div>
          </div>
        </div>

        <!-- Detailed Movements Ledger Card -->
        <div class="card">
          <h3 style="padding:16px 20px; border-bottom:1.5px solid var(--border-soft); font-family:var(--font-heading); display:flex; justify-between; align-items:center;">
            <span>📋 حركة كرت الصنف التفصيلية</span>
            <span class="mono font-semibold" style="font-size:12px; color:var(--text-2);" id="sc-meta-info"></span>
          </h3>

          <div class="table-container">
            <table class="data-dense" id="sc-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>نوع الحركة</th>
                  <th>رقم المستند</th>
                  <th>المستودع</th>
                  <th>التشغيلة / الصلاحية</th>
                  <th style="text-align:left; color:var(--good-dark);">وارد (+)</th>
                  <th style="text-align:left; color:var(--bad-dark);">صادر (-)</th>
                  <th style="text-align:left;">الرصيد بعد</th>
                  <th style="text-align:left;">تكلفة الحركة</th>
                  <th style="text-align:left;">المتوسط المرجح</th>
                  <th style="text-align:left;">القيمة التراكمية</th>
                  <th>البيان / ملاحظات</th>
                </tr>
              </thead>
              <tbody id="sc-tbody">
                <tr><td colspan="12" class="dim" style="text-align:center; padding:32px;">يرجى اختيار الصنف من شريط البحث بالأعلى ثم الضغط على "عرض الحركة"</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Welcome Placeholder -->
      <div id="sc-placeholder" class="empty-state" style="padding:60px 20px;">
        <div class="empty-icon" style="font-size:48px;">📊</div>
        <h3>استخراج كرت حركة الصنف</h3>
        <p class="dim" style="max-width:400px; margin:0 auto 16px auto;">اختر الصنف والمستودع والتواريخ لتتبع دوران الصنف ومتوسطات التكلفة والكميات الواردة والصادرة آلياً بمستوى SAP/NetSuite.</p>
      </div>

    </div>
  `;

  await Promise.all([loadWarehouses(), loadProductsList()]);
  setupAutocompleteSearch();
}

async function loadWarehouses() {
  try {
    warehouses = await getAll(COLS.warehouses(), [orderBy("name")]);
    const sel = document.getElementById("sc-wh-filter");
    if (sel) {
      sel.innerHTML = '<option value="">جميع المستودعات</option>' + 
        warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join("");
    }
  } catch (err) { showToast(err.message, "error"); }
}

async function loadProductsList() {
  try {
    products = await getAll(COLS.products(), [orderBy("sku")]);
  } catch (err) { showToast(err.message, "error"); }
}

function setupAutocompleteSearch() {
  const input = document.getElementById("sc-product-search");
  const results = document.getElementById("sc-product-results");
  const hiddenId = document.getElementById("sc-product-id");

  if (!input || !results) return;

  const performSearch = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      results.innerHTML = "";
      results.classList.add("hidden");
      return;
    }

    const filtered = products.filter(p => 
      p.sku?.toLowerCase().includes(q) || 
      p.name?.toLowerCase().includes(q) || 
      p.barcode?.includes(q)
    ).slice(0, 15);

    if (filtered.length === 0) {
      results.innerHTML = `<div style="padding:8px 12px; color:var(--text-3); font-size:12px;">لا توجد أصناف مطابقة</div>`;
    } else {
      results.innerHTML = filtered.map(p => `
        <div class="search-item" data-id="${p.id}" data-sku="${p.sku}" data-name="${p.name}" style="padding:8px 12px; cursor:pointer; font-size:12px; border-bottom:1px solid var(--border-soft); display:flex; flex-direction:column;">
          <strong style="color:var(--text-0);">${p.sku} - ${p.name}</strong>
          <span class="dim" style="font-size:10px;">الباركود: ${p.barcode || "—"} | متوسط التكلفة: ${formatCurrency(p.averageCost || p.costPrice || 0)}</span>
        </div>
      `).join("");
    }
    results.classList.remove("hidden");
  };

  input.addEventListener("input", debounce(performSearch, 300));
  input.addEventListener("focus", performSearch);

  // Close results on outer click
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".autocomplete-container")) {
      results.classList.add("hidden");
    }
  });

  results.addEventListener("click", (e) => {
    const item = e.target.closest(".search-item");
    if (item) {
      const id = item.dataset.id;
      const sku = item.dataset.sku;
      const name = item.dataset.name;

      input.value = `${sku} - ${name}`;
      hiddenId.value = id;
      selectedProduct = products.find(p => p.id === id);

      results.classList.add("hidden");
    }
  });
}

window.loadStockCardReport = async () => {
  const productId = document.getElementById("sc-product-id")?.value;
  const whId = document.getElementById("sc-wh-filter")?.value;
  const fromDate = document.getElementById("sc-date-from")?.value;
  const toDate = document.getElementById("sc-date-to")?.value;

  if (!productId || !selectedProduct) {
    showToast("يرجى اختيار صنف صحيح من القائمة المنسدلة أولاً", "warning");
    return;
  }

  // Show profiles
  document.getElementById("sc-placeholder").classList.add("hidden");
  document.getElementById("sc-profile-wrapper").classList.remove("hidden");

  const tbody = document.getElementById("sc-tbody");
  tbody.innerHTML = `${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(12).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;

  try {
    // 1. Fetch transactions and live stock balance for this product
    const [snap, stockDocsSnap] = await Promise.all([
      getDocs(query(COLS.stockTransactions(), where("productId", "==", productId))),
      getStockForProduct(productId)
    ]);
    let txs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Sort chronologically by date, prioritizing inflows (transfer_in/purchase_in) before outflows on the same date
    txs.sort((a, b) => {
      const getDateStr = (t) => {
        if (t.date) return t.date;
        let secs = t.createdAt?.seconds || t.createdAt?._seconds;
        if (secs) return new Date(secs * 1000).toISOString().split("T")[0];
        if (t.createdAt?.toDate) return t.createdAt.toDate().toISOString().split("T")[0];
        return "2026-07-20";
      };

      const dateA = getDateStr(a);
      const dateB = getDateStr(b);
      if (dateA !== dateB) return dateA.localeCompare(dateB);

      const typePriority = {
        "purchase_in": 1,
        "transfer_in": 1,
        "sale_cancel": 2,
        "sale_out": 3,
        "transfer_out": 4,
        "purchase_return": 4
      };
      const prioA = typePriority[a.type] || 5;
      const prioB = typePriority[b.type] || 5;
      if (prioA !== prioB) return prioA - prioB;

      const secA = a.createdAt?.seconds || a.createdAt?._seconds || 0;
      const secB = b.createdAt?.seconds || b.createdAt?._seconds || 0;
      return secA - secB;
    });

    // 2. Calculate running values — TWO PASSES for correctness:
    //    Pass 1: Calculate running balance across ALL transactions (no date filter, no warehouse filter)
    //            to get opening balance before the selected period.
    //    Pass 2: Collect displayed rows (applying warehouse + date + type filters).
    //
    //    NOTE: Warehouse filter is applied BEFORE balance calc so that the ledger
    //    reflects a single warehouse's perspective (matching what the user selected).
    //    Transfer_out and transfer_in are separate rows per warehouse — this is correct.

    const typeFilter = document.getElementById("sc-type-filter")?.value || "";

    // ── Pass 1: compute opening balance (all txns before fromDate, filtered by warehouse) ──
    let openingQty = 0;
    let openingWAC = selectedProduct.averageCost || selectedProduct.costPrice || 0;

    txs.forEach(t => {
      // Resolve date
      let dateStr = t.date || "";
      if (!dateStr && t.createdAt) {
        try {
          let secs = t.createdAt.seconds || t.createdAt._seconds;
          if (secs) dateStr = new Date(secs * 1000).toISOString().split("T")[0];
          else if (t.createdAt.toDate) dateStr = t.createdAt.toDate().toISOString().split("T")[0];
          else if (typeof t.createdAt === "string") dateStr = t.createdAt.split("T")[0];
          else { const dv = new Date(t.createdAt); if (!isNaN(dv.getTime())) dateStr = dv.toISOString().split("T")[0]; }
        } catch { dateStr = ""; }
      }
      t.__dateStr = dateStr; // cache for Pass 2

      // Apply warehouse filter
      if (whId && t.warehouseId !== whId) return;

      // Only count transactions BEFORE the selected from-date
      if (fromDate && dateStr >= fromDate) return;

      const qtyChange = t.qtyChange || 0;
      const txCost = t.costPrice || t.purchasePrice || openingWAC || 0;
      if (qtyChange > 0) {
        const total = openingQty + qtyChange;
        openingWAC = total > 0 ? ((openingQty * openingWAC) + (qtyChange * txCost)) / total : txCost;
        openingQty += qtyChange;
      } else if (qtyChange < 0) {
        openingQty += qtyChange;
      }
    });

    // ── Pass 2: iterate txns in the selected period and collect display rows ──
    let runningQty = openingQty;
    let runningWAC = openingWAC;
    let runningValuation = runningQty * runningWAC;

    let totalIn = 0;
    let totalOut = 0;

    const formattedTxs = [];

    txs.forEach(t => {
      const dateStr = t.__dateStr || "";

      // Apply warehouse filter
      if (whId && t.warehouseId !== whId) return;

      // Skip transactions before the fromDate (already counted in openingQty)
      if (fromDate && dateStr < fromDate) return;

      // Running cost price logic
      const qtyChange = t.qtyChange || 0;
      const txCost = t.costPrice || t.purchasePrice || runningWAC || 0;

      if (qtyChange > 0) {
        // Receipt: recalculate WAC
        if (runningQty + qtyChange > 0) {
          runningWAC = ((runningQty * runningWAC) + (qtyChange * txCost)) / (runningQty + qtyChange);
        } else {
          runningWAC = txCost;
        }
        runningQty += qtyChange;
        runningValuation = runningQty * runningWAC;
        totalIn += qtyChange;
      } else if (qtyChange < 0) {
        runningQty += qtyChange;
        runningValuation = runningQty * runningWAC;
        totalOut += Math.abs(qtyChange);
      }

      // Apply type filter
      let matchesType = true;
      if (typeFilter) {
        const tType = t.type || "";
        if (typeFilter === "sales") {
          // Covers all sale-related types written by sales-invoices.js, POS, returns
          matchesType = [
            "sales_invoice", "sale_out", "sale_cancel", "cancel_sale",
            "pos_sale", "pos_out", "sales_return", "return_in"
          ].includes(tType);
        } else if (typeFilter === "purchases") {
          matchesType = [
            "purchase_invoice", "purchase_in", "purchase_return"
          ].includes(tType);
        } else if (typeFilter === "transfers") {
          matchesType = [
            "transfer_out", "transfer_in", "transfer_cancel"
          ].includes(tType);
        } else if (typeFilter === "adjustments") {
          matchesType = [
            "adjustment", "damage", "assembly", "disassembly", "opening"
          ].includes(tType);
        }
      }

      // Apply to-date filter
      const inDateRange = (!toDate || dateStr <= toDate);
      if (inDateRange && matchesType) {
        formattedTxs.push({
          ...t,
          dateStr,
          qtyIn: qtyChange > 0 ? qtyChange : 0,
          qtyOut: qtyChange < 0 ? Math.abs(qtyChange) : 0,
          qtyAfter: runningQty,
          txCost,
          runningWAC,
          runningValuation,
          wName: warehouses.find(w => w.id === t.warehouseId)?.name || t.warehouseId || "—"
        });
      }
    });

    currentLedger = formattedTxs;

    // Calculate current live stock balance for the selected warehouse scope
    let currentScopeStock = 0;
    if (whId) {
      const match = stockDocsSnap.find(s => s.warehouseId === whId);
      currentScopeStock = Number(match ? match.qty : 0);
    } else {
      currentScopeStock = stockDocsSnap.reduce((sum, s) => sum + Number(s.qty || 0), 0);
    }

    // Display summary metrics
    document.getElementById("sc-total-in").textContent = formatQuantity(totalIn);
    document.getElementById("sc-total-out").textContent = formatQuantity(totalOut);
    document.getElementById("sc-current-balance").textContent = formatQuantity(currentScopeStock);
    document.getElementById("sc-total-valuation").innerHTML = `
      <div style="font-weight:bold; color:var(--brand);">${formatCurrency(runningWAC)} <span style="font-size:10px; color:var(--text-3); font-weight:normal;">(متوسط)</span></div>
      <div class="dim" style="font-size:11px; margin-top:2px;">القيمة: ${formatCurrency(currentScopeStock * runningWAC)}</div>
    `;

    document.getElementById("sc-subtitle").innerHTML = `
      بطاقة الصنف: <strong class="text-indigo">${selectedProduct.name}</strong> | الكود: <strong class="mono">${selectedProduct.sku}</strong> 
      | الباركود الأساسي: <strong class="mono">${selectedProduct.barcode || "—"}</strong> 
      | طريقة التخزين: <strong>${selectedProduct.storageTemperature === "dry" ? "جاف" : selectedProduct.storageTemperature === "chilled" ? "مبرد (1-4م)" : "مجمد (-18م)"}</strong>
    `;

    document.getElementById("sc-meta-info").textContent = `إجمالي الحركات المفحوصة: ${formattedTxs.length}`;

    if (formattedTxs.length === 0) {
      // Even if no transactions in period, show opening balance row if it's non-zero
      if (fromDate && openingQty !== 0) {
        const openingValuation = openingQty * openingWAC;
        tbody.innerHTML = `
          <tr style="background:color-mix(in srgb, var(--brand) 8%, transparent); font-weight:600;">
            <td class="mono dim">${fromDate}</td>
            <td><span class="badge indigo" style="font-size:11px;">رصيد أول المدة</span></td>
            <td colspan="5" class="dim" style="text-align:center; font-size:12px;">— رصيد منقول —</td>
            <td class="mono font-bold" style="text-align:left;">${formatQuantity(openingQty)}</td>
            <td class="mono" style="text-align:left;">—</td>
            <td class="mono text-indigo font-semibold" style="text-align:left;">${formatCurrency(openingWAC)}</td>
            <td class="mono" style="text-align:left;">${formatCurrency(openingValuation)}</td>
            <td class="dim">لا توجد حركات خلال الفترة</td>
          </tr>`;
      } else {
        tbody.innerHTML = `<tr><td colspan="12" class="dim" style="text-align:center; padding:32px;">لا توجد حركات مسجلة للصنف خلال الفترة المحددة</td></tr>`;
      }
      return;
    }

    const typeLabels = {
      // Purchases
      purchase_invoice: "فاتورة شراء (وارد)",
      purchase_in:      "فاتورة شراء (وارد)",
      purchase_return:  "مرتجع مشتريات (صادر)",
      // Sales
      sales_invoice:    "فاتورة بيع (صادر)",
      sale_out:         "فاتورة بيع (صادر)",
      sale_cancel:      "تعديل/إلغاء مبيعات",
      cancel_sale:      "إلغاء فاتورة بيع",
      sales_return:     "مرتجع مبيعات (وارد)",
      return_in:        "مرتجع مبيعات (وارد)",
      // POS
      pos_sale:         "نقطة بيع (صادر)",
      pos_out:          "نقطة بيع (صادر)",
      // Transfers
      transfer_out:     "تحويل صادر (−)",
      transfer_in:      "تحويل وارد (+)",
      transfer_cancel:  "إلغاء تحويل (+)",
      // Adjustments
      adjustment:       "تسوية مخزنية",
      damage:           "إتلاف مواد تالفة",
      assembly:         "تجميع منتج (+)",
      disassembly:      "تفكيك منتج (−)",
      opening:          "رصيد افتتاحي",
    };

    // Opening balance row (shown when a from-date is selected)
    let openingRow = "";
    if (fromDate) {
      const openingValuation = openingQty * openingWAC;
      openingRow = `
        <tr style="background:color-mix(in srgb, var(--brand) 8%, transparent); font-weight:600;">
          <td class="mono dim">${fromDate}</td>
          <td><span class="badge indigo" style="font-size:11px;">رصيد أول المدة</span></td>
          <td colspan="5" class="dim" style="text-align:center; font-size:12px;">— رصيد منقول من قبل الفترة —</td>
          <td class="mono font-bold text-indigo" style="text-align:left;">${formatQuantity(openingQty)}</td>
          <td class="mono" style="text-align:left;">—</td>
          <td class="mono text-indigo font-semibold" style="text-align:left;">${formatCurrency(openingWAC)}</td>
          <td class="mono" style="text-align:left;">${formatCurrency(openingValuation)}</td>
          <td class="dim">—</td>
        </tr>`;
    }

    // Render table (Show newest transactions at the top with top-to-bottom reverse running calculation)
    let reverseBalanceCounter = currentScopeStock;
    const displayList = formattedTxs.slice().reverse().map(t => {
      const rowAfterBalance = reverseBalanceCounter;
      reverseBalanceCounter = reverseBalanceCounter - (t.qtyIn || 0) + (t.qtyOut || 0);
      return {
        ...t,
        qtyAfter: rowAfterBalance
      };
    });
    tbody.innerHTML = openingRow + displayList.map(t => {
      const isExpired = t.expiryDate && new Date(t.expiryDate) < new Date();
      return `
        <tr>
          <td class="mono dim">${t.dateStr}</td>
          <td><span class="badge neutral" style="font-size:11px;">${typeLabels[t.type] || t.type || "تسوية"}</span></td>
          <td class="mono font-bold">${t.documentNumber || t.invoiceNumber || "—"}</td>
          <td><strong>${t.wName}</strong></td>
          <td class="mono">
            ${t.batchNumber ? `
              <div style="font-size:11px; font-weight:bold;">Bat: ${t.batchNumber}</div>
              <div class="${isExpired ? 'text-bad' : 'dim'}" style="font-size:9px;">Exp: ${t.expiryDate || '—'}</div>
            ` : "—"}
          </td>
          <td class="mono text-good font-bold" style="text-align:left;">${t.qtyIn ? `+${formatQuantity(t.qtyIn)}` : "—"}</td>
          <td class="mono text-bad font-bold" style="text-align:left;">${t.qtyOut ? `-${formatQuantity(t.qtyOut)}` : "—"}</td>
          <td class="mono font-bold" style="text-align:left;">${formatQuantity(t.qtyAfter)}</td>
          <td class="mono" style="text-align:left;">${formatCurrency(t.txCost)}</td>
          <td class="mono text-indigo font-semibold" style="text-align:left;">${formatCurrency(t.runningWAC)}</td>
          <td class="mono" style="text-align:left;">${formatCurrency(t.runningValuation)}</td>
          <td class="dim" style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${(t.createdByName || '') + ' — ' + (t.notes || '')}">
            ${t.createdByName ? `<div style="font-size:10px; font-weight:600; color:var(--text-1);">${t.createdByName}</div>` : ''}
            <div style="font-size:11px;">${t.notes || '—'}</div>
          </td>
        </tr>
      `;
    }).join("");

    // Show compliance ZATCA badge if tracking exists
    if (selectedProduct.tracking === 'batch') {
      document.getElementById("sc-zatca-badge").classList.remove("hidden");
    } else {
      document.getElementById("sc-zatca-badge").classList.add("hidden");
    }

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="12" class="text-bad" style="text-align:center; padding:32px;">حدث خطأ: ${err.message}</td></tr>`;
  }
};

window.exportStockCardCSV = () => {
  if (!currentLedger.length || !selectedProduct) {
    showToast("يرجى جلب تقرير كرت الصنف أولاً لتصديره", "warning");
    return;
  }

  showToast("جارٍ التصدير...", "info");
  const headers = ["التاريخ", "نوع الحركة", "رقم المستند", "المستودع", "التشغيلة", "وارد (+)", "صادر (-)", "الرصيد بعد", "تكلفة الحركة", "المتوسط المرجح", "القيمة التراكمية", "البيان"];
  const rows = [headers];

  currentLedger.forEach(t => {
    rows.push([
      t.dateStr,
      t.type,
      t.documentNumber || t.invoiceNumber || "",
      t.wName,
      t.batchNumber || "",
      t.qtyIn || 0,
      t.qtyOut || 0,
      t.qtyAfter || 0,
      t.txCost || 0,
      t.runningWAC || 0,
      t.runningValuation || 0,
      t.notes || ""
    ]);
  });

  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `stock_card_${selectedProduct.sku}_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  showToast("تم تصدير الملف بنجاح", "success");
};
