// ============================================================
// IDHAM ERP — Enterprise Products & Item Catalog
// SAP Business One / NetSuite Level Inventory Control
// ============================================================

import { COLS, create, update, remove, getAll, getPaginated, getStockForProduct } from "../utils/db.js";
import { query, where, orderBy, limit, getDocs, doc, getDoc, serverTimestamp } from "../utils/db.js";
import { formatCurrency, formatQuantity, getStockStatus, getStockStatusBadge, debounce, generateSearchTokens } from "../utils/formatters.js";
import { db, COMPANY_ID } from "../firebase-config-test.js";

let allProducts = [];
let currentPage = 0;
const PAGE_SIZE = 50;
let lastDocSnapshot = null;
let hasMore = false;
let filterCategory = "";
let filterStatus = "";
let warehouses = [];
let categories = [];

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
      td.price-editable { cursor: pointer; position: relative; }
      td.price-editable:hover { background: rgba(91, 127, 255, 0.08) !important; color: var(--brand); }
    `;
    document.head.appendChild(style);
  }

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
        </select>
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="prod-status-filter">
          <option value="">الكل</option>
          <option value="ok">متوفر</option>
          <option value="low">منخفض</option>
          <option value="out">نافد</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="exportProducts()">📤 تصدير CSV</button>
        <button class="btn btn-primary" onclick="openProductModal()">+ إضافة صنف جديد</button>
      </div>
    </div>

    <!-- KPIs Section -->
    <div class="inv-kpi-grid" style="margin-bottom: 20px;">
      <div class="inv-kpi-card">
        <div class="inv-kpi-icon" style="background:#5B7FFF1c; color:var(--brand);">💰</div>
        <div class="inv-kpi-body">
          <div class="inv-kpi-value" id="kpi-total-val">—</div>
          <div class="inv-kpi-label">قيمة المخزون (سعر البيع)</div>
        </div>
      </div>
      <div class="inv-kpi-card">
        <div class="inv-kpi-icon" style="background:#10B9811c; color:#10B981;">🏷️</div>
        <div class="inv-kpi-body">
          <div class="inv-kpi-value" id="kpi-total-cost">—</div>
          <div class="inv-kpi-label">تكلفة المخزون (الشرائية)</div>
        </div>
      </div>
      <div class="inv-kpi-card">
        <div class="inv-kpi-icon" style="background:#F59E0B1c; color:#F59E0B;">📈</div>
        <div class="inv-kpi-body">
          <div class="inv-kpi-value" id="kpi-margin-pct">—</div>
          <div class="inv-kpi-label">متوسط هامش الربح %</div>
        </div>
      </div>
      <div class="inv-kpi-card">
        <div class="inv-kpi-icon" style="background:#EF44441c; color:#EF4444;">⚠️</div>
        <div class="inv-kpi-body">
          <div class="inv-kpi-value" id="kpi-low-stock">—</div>
          <div class="inv-kpi-label">أصناف تحت حد الطلب</div>
        </div>
      </div>
    </div>

    <!-- Page Content -->
    <div class="page-content">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">كتالوج الأصناف والبطاقات التعريفية</h1>
          <p class="page-subtitle" id="prod-count-label">جارٍ التحميل…</p>
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
                <th style="width:36px;"></th>
                <th>الكود</th>
                <th>اسم الصنف (عربي/إنجليزي)</th>
                <th>التتبع</th>
                <th>الفئة</th>
                <th>الوحدات والتحويل</th>
                <th style="text-align:left;">التكلفة (المتوسط)</th>
                <th style="text-align:left;">سعر البيع (جملة/تجزئة)</th>
                <th>الضريبة</th>
                <th>المخزون الإجمالي</th>
                <th>الحالة</th>
                <th style="width:80px;"></th>
              </tr>
            </thead>
            <tbody id="prod-tbody">
              ${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  <td><div class="sk" style="width:20px;height:20px;border-radius:50%;"></div></td>
                  <td><div class="sk" style="width:70px;height:12px;"></div></td>
                  <td><div class="sk" style="width:180px;height:12px;margin-bottom:6px;"></div><div class="sk" style="width:110px;height:10px;"></div></td>
                  <td><div class="sk" style="width:40px;height:16px;border-radius:4px;"></div></td>
                  <td><div class="sk" style="width:70px;height:12px;"></div></td>
                  <td><div class="sk" style="width:80px;height:12px;"></div></td>
                  <td><div class="sk" style="width:60px;height:12px;"></div></td>
                  <td><div class="sk" style="width:60px;height:12px;"></div></td>
                  <td><div class="sk" style="width:30px;height:12px;"></div></td>
                  <td><div class="sk" style="width:50px;height:12px;"></div></td>
                  <td><div class="sk" style="width:50px;height:16px;border-radius:10px;"></div></td>
                  <td><div class="sk" style="width:60px;height:24px;border-radius:6px;"></div></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-top:1px solid var(--border-soft);">
          <button class="btn btn-sm btn-secondary" id="prev-page-btn" onclick="loadPrevPage()" disabled>السابق</button>
          <span id="page-counter" class="text-2 mono" style="font-size:12px;"></span>
          <button class="btn btn-sm btn-secondary" id="next-page-btn" onclick="loadNextPage()">التالي</button>
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
                <select id="prod-category" class="input">
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
                <label>سعر الشراء الافتراضي (ر.س)</label>
                <input type="number" id="prod-purchase-price" class="input mono" step="0.01" placeholder="0.00" />
              </div>
              <div class="form-group">
                <label>التكلفة القياسية / المعيارية (ر.س)</label>
                <input type="number" id="prod-std-cost" class="input mono" step="0.01" placeholder="0.00" />
              </div>
            </div>
            
            <h4 style="border-bottom:1px solid var(--border-soft); padding-bottom:8px; margin-bottom:16px; color:var(--brand);">مستويات أسعار البيع للعملاء</h4>
            <div class="grid-3 gap-16">
              <div class="form-group">
                <label>سعر التجزئة (Retail Price) *</label>
                <input type="number" id="prod-price-retail" class="input mono" step="0.01" placeholder="0.00" />
              </div>
              <div class="form-group">
                <label>سعر الجملة (Wholesale Price)</label>
                <input type="number" id="prod-price-wholesale" class="input mono" step="0.01" placeholder="0.00" />
              </div>
              <div class="form-group">
                <label>سعر الموزعين (Distributor Price)</label>
                <input type="number" id="prod-price-distributor" class="input mono" step="0.01" placeholder="0.00" />
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
                  <option value="Piece">حبة (Piece)</option>
                  <option value="Kilogram">كيلو جرام (KG)</option>
                  <option value="Liter">لتر (Liter)</option>
                  <option value="Gram">جرام (Gram)</option>
                  <option value="Can">علبة (Can)</option>
                  <option value="Bottle">زجاجة (Bottle)</option>
                </select>
              </div>
              <div class="form-group">
                <label>الوحدة البديلة الأولى (وحدة الشراء/التعبئة)</label>
                <select id="prod-unit-alt" class="input">
                  <option value="">بدون وحدة بديلة</option>
                  <option value="Carton">كرتون (Carton)</option>
                  <option value="Box">صندوق (Box)</option>
                  <option value="Pallet">باليت (Pallet)</option>
                  <option value="Bag">كيس (Bag)</option>
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
      <div class="modal modal-lg">
        <div class="modal-header" style="border-bottom:none; padding-bottom:0;">
          <h3 class="modal-title" id="stock-modal-title">تفاصيل بطاقة الصنف</h3>
          <button class="modal-close" onclick="closeModal('stock-modal')">×</button>
        </div>
        <div class="modal-tabs" style="display:flex; border-bottom:1px solid var(--border-soft); margin: 0 24px 16px 24px;">
          <button class="tab-btn active" id="tab-btn-balances" onclick="switchStockTab('balances')" style="padding:10px 16px; border:none; background:none; cursor:pointer; font-weight:bold; border-bottom:2px solid var(--brand); color:var(--brand);">أرصدة المخازن</button>
          <button class="tab-btn" id="tab-btn-batches" onclick="switchStockTab('batches')" style="padding:10px 16px; border:none; background:none; cursor:pointer; font-weight:bold; border-bottom:2px solid transparent; color:var(--text-2);">التشغيلات والتواريخ (Batches)</button>
          <button class="tab-btn" id="tab-btn-card" onclick="switchStockTab('card')" style="padding:10px 16px; border:none; background:none; cursor:pointer; font-weight:bold; border-bottom:2px solid transparent; color:var(--text-2);">دفتر الحركة التفصيلي</button>
        </div>
        <div class="modal-body" id="stock-modal-body">
          <!-- Will be loaded dynamically -->
        </div>
      </div>
    </div>
  `;
}

export async function loadProducts(reset = false) {
  if (reset) { lastDocSnapshot = null; currentPage = 0; }
  const tbody = document.getElementById("prod-tbody");
  if (!tbody) return;

  try {
    const catFilter    = document.getElementById("prod-cat-filter")?.value || "";
    const statusFilter = document.getElementById("prod-status-filter")?.value || "";
    const searchVal    = document.getElementById("prod-search")?.value?.trim() || "";

    const constraints = [];
    if (catFilter) constraints.push(where("category", "==", catFilter));
    constraints.push(orderBy("sku"));
    constraints.push(limit(PAGE_SIZE + 1));

    const q = query(COLS.products(), ...constraints);
    const snap = await getDocs(q);
    let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Map total quantities from stockByWarehouse
    let stockMap = {};
    try {
      const stockBalances = await getAll(COLS.stockByWarehouse());
      stockBalances.forEach(s => {
        stockMap[s.productId] = (stockMap[s.productId] || 0) + (s.qty || 0);
      });
      docs.forEach(p => {
        p._totalQty = stockMap[p.id] || 0;
      });
    } catch (e) {
      console.warn("Failed to load stock balances:", e);
    }

    hasMore = docs.length > PAGE_SIZE;
    if (hasMore) docs.pop();

    if (searchVal) {
      const term = searchVal.toLowerCase();
      docs = docs.filter(d => 
        d.name?.toLowerCase().includes(term) ||
        d.sku?.toLowerCase().includes(term) ||
        d.barcode?.includes(term)
      );
    }

    allProducts = docs; // cache locally for searches and edits

    // Compute KPIs
    let totalValue = 0;
    let totalCost = 0;
    let profitSum = 0;
    let lowStockCount = 0;
    let pricedCount = 0;

    docs.forEach(p => {
      const qty = p._totalQty || 0;
      const cPrice = p.costPrice || p.purchasePrice || 0;
      const sPrice = p.salePrice || p.priceRetail || 0;

      totalValue += qty * sPrice;
      totalCost += qty * cPrice;

      if (sPrice > 0) {
        const margin = ((sPrice - cPrice) / sPrice) * 100;
        profitSum += margin;
        pricedCount++;
      }

      if (qty < (p.reorderLevel || 0)) {
        lowStockCount++;
      }
    });

    const avgMargin = pricedCount > 0 ? (profitSum / pricedCount).toFixed(1) : "0.0";

    const kpiVal = document.getElementById("kpi-total-val");
    const kpiCost = document.getElementById("kpi-total-cost");
    const kpiMargin = document.getElementById("kpi-margin-pct");
    const kpiLow = document.getElementById("kpi-low-stock");

    if (kpiVal) kpiVal.textContent = formatCurrency(totalValue);
    if (kpiCost) kpiCost.textContent = formatCurrency(totalCost);
    if (kpiMargin) kpiMargin.textContent = `${avgMargin}%`;
    if (kpiLow) kpiLow.textContent = lowStockCount;

    const countLabel = document.getElementById("prod-count-label");
    if (countLabel) countLabel.textContent = `${docs.length} صنف مسجل حالياً`;

    if (docs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد أصناف مطابقة</td></tr>`;
      return;
    }

    tbody.innerHTML = docs.map(p => {
      const status = getStockStatus(p._totalQty || 0, p.reorderLevel || 0);
      const costVal = p.costPrice || p.purchasePrice || 0;
      const saleVal = p.salePrice || p.priceRetail || 0;
      const margin = saleVal > 0 ? ((saleVal - costVal) / saleVal) * 100 : 0;
      
      let marginClass = "low";
      if (margin > 20) marginClass = "high";
      else if (margin >= 10) marginClass = "medium";

      return `
        <tr class="status-${status.color}">
          <td><button class="btn btn-icon sm btn-ghost" onclick="viewStock('${p.id}','${p.name}')">📦</button></td>
          <td class="mono font-bold">${p.sku}</td>
          <td>
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
          <td>${p.unit || "حبة"}${p.altUnit ? ` (كرتون: ${p.unitFactor} حبة)` : ""}</td>
          
          <td class="mono font-bold price-editable" style="text-align:left;" title="انقر مرتين للتعديل السريع"
              ondblclick="inlineEditPrice(this, '${p.id}', 'costPrice', ${costVal})">
            ${formatCurrency(costVal)}
          </td>
          
          <td class="mono font-bold price-editable" style="text-align:left;" title="انقر مرتين للتعديل السريع"
              ondblclick="inlineEditPrice(this, '${p.id}', 'salePrice', ${saleVal})">
            <span class="profit-dot ${marginClass}" title="هامش الربح: ${margin.toFixed(1)}%"></span>
            ${formatCurrency(saleVal)}
          </td>
          
          <td>${p.taxCategory === 'S' ? '15%' : '0%'}</td>
          <td class="mono font-bold">${formatQuantity(p._totalQty || 0)}</td>
          <td>${getStockStatusBadge(p._totalQty || 0, p.reorderLevel)}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-icon sm btn-ghost" onclick="printProductBarcode('${p.id}')" title="طباعة باركود">🏷️</button>
              <button class="btn btn-icon sm btn-ghost" onclick="editProduct('${p.id}')" title="تعديل">✏️</button>
              <button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteProduct('${p.id}','${p.name}')" title="حذف">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    const pi = document.getElementById("page-counter");
    if (pi) pi.textContent = `صفحة ${currentPage + 1}`;

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="12" class="text-bad">${err.message}</td></tr>`;
  }
}

// Global function to perform quick inline edits
window.inlineEditPrice = (cell, productId, field, currentVal) => {
  if (cell.querySelector('input')) return; // Avoid double rendering inputs
  const input = document.createElement('input');
  input.type = 'number';
  input.step = '0.01';
  input.value = currentVal;
  input.className = 'input mono';
  input.style.cssText = 'width:80px; padding:4px 6px; font-size:12px; margin:0; text-align:left;';
  cell.innerHTML = '';
  cell.appendChild(input);
  input.focus();
  input.select();

  let saved = false;
  const save = async () => {
    if (saved) return;
    saved = true;
    const newVal = parseFloat(input.value);
    if (isNaN(newVal) || newVal < 0) {
      cell.innerHTML = formatCurrency(currentVal);
      return;
    }
    cell.innerHTML = `<div class="loading-spinner sm"></div>`;
    try {
      await update('products', productId, { [field]: newVal });
      // update cached list
      const prod = allProducts.find(p => p.id === productId);
      if (prod) {
        prod[field] = newVal;
        if (field === 'costPrice') prod.purchasePrice = newVal;
        if (field === 'salePrice') prod.priceRetail = newVal;
      }
      showToast("تم تحديث السعر بنجاح", "success");
      await loadProducts(); // Refresh list to update all computed values/KPIs
    } catch(e) {
      showToast(e.message, "error");
      cell.innerHTML = formatCurrency(currentVal);
    }
  };

  input.addEventListener('blur', save);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') {
      saved = true;
      cell.innerHTML = formatCurrency(currentVal);
    }
  });
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
  
  document.getElementById("prod-price-retail").value = prod?.salePrice || prod?.priceRetail || "";
  document.getElementById("prod-price-wholesale").value = prod?.priceWholesale || "";
  document.getElementById("prod-price-distributor").value = prod?.priceDistributor || "";
  
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

window.editProduct = async (id) => {
  try {
    const { getById } = await import("../utils/db.js");
    const prod = await getById("products", id);
    if (prod) openProductModal(prod);
  } catch (err) { showToast(err.message, "error"); }
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
    
    salePrice: priceRetail,
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
    await loadProducts(true);
  } catch (err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

window.deleteProduct = async (id, name) => {
  if (confirm(`هل تريد حذف الصنف "${name}"؟`)) {
    try { await remove("products", id); showToast("تم حذف الصنف", "success"); await loadProducts(true); }
    catch (err) { showToast(err.message, "error"); }
  }
};

// ── Tabbed Product Card (viewStock) ──
let currentProductId = null;
let currentProductName = null;
let cachedStockBalances = [];
let cachedStockTxs = [];
let cachedBatches = [];

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
        const q = query(COLS.stockTransactions(), where("productId", "==", currentProductId));
        const snap = await getDocs(q);
        cachedStockTxs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        cachedStockTxs.sort((a,b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
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

function renderItemLedgerCard() {
  const body = document.getElementById("stock-modal-body");
  const warehouseMap = {};
  warehouses.forEach(w => warehouseMap[w.id] = w.name);

  if (cachedStockTxs.length === 0) {
    body.innerHTML = `<div class="empty-state" style="padding:20px;"><div class="empty-icon">📜</div><p>لا توجد حركات مسجلة لهذا الصنف</p></div>`;
  } else {
    const typeLabels = {
      purchase_invoice: "فاتورة شراء", sales_invoice: "فاتورة بيع",
      transfer_out: "تحويل صادر", transfer_in: "تحويل وارد",
      adjustment: "تسوية عجز/زيادة", damage: "إهلاك تالف",
      assembly: "تجميع", disassembly: "تفكيك"
    };

    body.innerHTML = `
      <table class="data-dense" style="width:100%; font-size:12px;">
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>نوع الحركة</th>
            <th>رقم المستند</th>
            <th>المخزن</th>
            <th class="text-good">وارد (+)</th>
            <th class="text-bad">صادر (-)</th>
            <th>الرصيد بعد</th>
            <th>التكلفة / البيان</th>
          </tr>
        </thead>
        <tbody>
          ${cachedStockTxs.map(t => {
            const dateStr = t.createdAt?.toDate ? t.createdAt.toDate().toISOString().split("T")[0] : (t.date || "—");
            const wName = warehouseMap[t.warehouseId] || t.warehouseId || "—";
            const qtyChange = t.qtyChange || 0;
            const inQty = qtyChange > 0 ? qtyChange : 0;
            const outQty = qtyChange < 0 ? Math.abs(qtyChange) : 0;

            return `
              <tr>
                <td class="dim">${dateStr}</td>
                <td><span class="badge neutral" style="font-size:10px;">${typeLabels[t.type] || t.type || "تسوية"}</span></td>
                <td class="mono font-bold">${t.documentNumber || t.invoiceNumber || "—"}</td>
                <td>${wName}</td>
                <td class="mono text-good font-bold">${inQty ? `+${formatQuantity(inQty)}` : "—"}</td>
                <td class="mono text-bad font-bold">${outQty ? `-${formatQuantity(outQty)}` : "—"}</td>
                <td class="mono">${formatQuantity(t.qtyAfter || 0)}</td>
                <td class="dim" style="max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${t.notes || ''}">
                  ${t.notes || "—"}
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>`;
  }
}

window.viewStock = async (productId, productName) => {
  currentProductId = productId;
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
