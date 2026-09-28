// ============================================================
// IDHAM ERP — Purchase Invoices (Complete Rebuild v11)
// فواتير المشتريات — مع ربط مخزون + قيد محاسبي + VAT + طباعة
// ============================================================
import { COLS, create, update, getById, remove, getAll, adjustStock, createJournalEntry, deleteJournalEntry, generateInvoiceNumber, autoCashTransaction, autoBankTransaction, isPeriodClosed }
  from "../utils/db.js";
import { collection, query, orderBy, limit, getDocs, where, doc, getDoc } from "../utils/db.js";
import { formatCurrency, formatDate, calcInvoiceTotals, calcLineTotal,
         getInvoiceStatusBadge, todayString, debounce } from "../utils/formatters.js";
import { db, COMPANY_ID, storage } from "../firebase-config.js";
import { autoPurchaseJE } from "../utils/accounting-engine.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

// ── Unit Translation Helper ──────────────────────────────────────
function translateUnit(u) {
  const map = {
    Piece:'حبة', Carton:'كرتون', Box:'صندوق', Bag:'كيس', Pack:'شد',
    Sack:'شوال', Bale:'بالة', Barrel:'برميل', Tray:'طبق', Gallon:'جالون',
    Kilogram:'كيلو', Ton:'طن', Liter:'لتر', Gram:'جرام', Can:'علبة',
    Bottle:'زجاجة', Meter:'متر', Tank:'تنك', Roll:'رول', Pallet:'باليت',
    PCS:'حبة'
  };
  return map[u] || u || '';
}
window.translateUnit = translateUnit;

let purchaseLines = [];
let currentInvoice = null;
let purInvoicesCache = new Map();
let cachedSuppliers = null;
let cachedPurWarehouses = null;
let allProducts = [];
let allCategories = [];

let sortField = "date"; // Default sort by document date
let sortAsc = false;   // Default descending

window.sortPurList = (field) => {
  if (sortField === field) {
    sortAsc = !sortAsc;
  } else {
    sortField = field;
    sortAsc = (field === "date" || field === "createdAt") ? false : true;
  }
  loadPurchaseList();
};

function getSortArrowPur(field) {
  if (sortField !== field) return `<span style="color:var(--text-3); font-size:10px; margin-right:4px;">⇅</span>`;
  return sortAsc 
    ? `<span style="color:var(--brand); font-size:10px; margin-right:4px;">▲</span>` 
    : `<span style="color:var(--brand); font-size:10px; margin-right:4px;">▼</span>`;
}
window.getSortArrowPur = getSortArrowPur;

// ────────────────────────────────────────────────
// RENDER
// ────────────────────────────────────────────────
export async function render(container, user) {
  container.innerHTML = buildPage();

  // ديبونس على حقل البحث النصي — 300ms تأخير بعد التوقف عن الكتابة
  setTimeout(() => {
    const searchEl = document.getElementById("pur-text-filter");
    if (searchEl) {
      const debouncedFn = window.debounce ? window.debounce(() => loadPurchaseList(), 300) : () => loadPurchaseList();
      searchEl.addEventListener("input", debouncedFn);
    }
  }, 100);

  await Promise.all([
    loadSuppliersDropdown(),
    loadWarehousesPurchase(),
    loadPurchaseList(),
  ]);
  setupSupplierAC();
  setupPurProductAC();
  renderPurLines();

  // Check incoming GRPO conversion
  const convertGrpoStr = sessionStorage.getItem("convert_grpo_to_invoice");
  if (convertGrpoStr) {
    sessionStorage.removeItem("convert_grpo_to_invoice");
    try {
      const data = JSON.parse(convertGrpoStr);
      setTimeout(() => {
        window.openPurchaseModalFromGRPO(data);
      }, 150);
    } catch (e) {
      console.error(e);
    }
  }
}

function buildPage() {
  return `
  <!-- Filter Bar -->
  <div class="filterbar">
    <div class="date-range-group"><label>من</label>
      <input type="date" id="pur-from" value="${new Date(new Date().setDate(1)).toISOString().split('T')[0]}"
        onchange="loadPurchaseList()" />
    </div>
    <div class="date-range-group"><label>إلى</label>
      <input type="date" id="pur-to" value="${todayString()}" onchange="loadPurchaseList()" />
    </div>
    <div class="filterbar-divider"></div>
    <div class="filter-select-group"><label>المورد</label>
      <select id="pur-supplier-filter" onchange="loadPurchaseList()">
        <option value="">الكل</option>
      </select>
    </div>
    <div class="filter-select-group"><label>المستودع</label>
      <select id="pur-warehouse-filter" onchange="loadPurchaseList()">
        <option value="">كل المستودعات</option>
      </select>
    </div>
    <div class="filter-select-group"><label>الحالة</label>
      <select id="pur-status-filter" onchange="loadPurchaseList()">
        <option value="">الكل</option>
        <option value="posted">مرحلة</option>
        <option value="paid">مدفوعة</option>
        <option value="partial">جزئي</option>
        <option value="cancelled">ملغاة</option>
      </select>
    </div>
    <div class="filter-select-group"><label>نوع الضريبة</label>
      <select id="pur-tax-type-filter" onchange="loadPurchaseList()">
        <option value="">كل الفواتير</option>
        <option value="taxable">🏢 فواتير ضريبية (15%)</option>
        <option value="non_tax">🟢 فواتير غير ضريبية (0%)</option>
      </select>
    </div>
    <div style="margin-right:auto; display:flex; gap:8px;">
      <button class="btn-export" onclick="exportPagePDF('.data-dense','فواتير_المشتريات')" title="تصدير PDF"><span>📄</span> PDF</button>
      <button class="btn-export excel" onclick="exportPageExcel('.data-dense','فواتير_المشتريات')" title="تصدير Excel"><span>📊</span> Excel</button>
      <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
      <button class="btn btn-warning btn-sm" onclick="generatePurchaseOrder()" title="أمر شراء / طلب عرض سعر" style="background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;box-shadow:0 2px 8px rgba(249,115,22,0.3);">📋 أمر شراء</button>
      <button class="btn btn-primary" onclick="openPurchaseModal()">＋ فاتورة شراء جديدة</button>
    </div>
  </div>

  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">📦 فواتير المشتريات</h1>
      <p class="page-subtitle" id="pur-count"></p>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid mb-20">
      <div class="kpi-card g-orange">
        <div class="kpi-icon">🛒</div>
        <div class="kpi-content"><div class="kpi-label">إجمالي المشتريات</div>
          <div class="kpi-value mono" id="pur-kpi-total">—</div></div></div>
      <div class="kpi-card g-purple">
        <div class="kpi-icon">⏳</div>
        <div class="kpi-content"><div class="kpi-label">المستحق للموردين</div>
          <div class="kpi-value mono" id="pur-kpi-unpaid">—</div></div></div>
      <div class="kpi-card g-green">
        <div class="kpi-icon">✅</div>
        <div class="kpi-content"><div class="kpi-label">مدفوع</div>
          <div class="kpi-value mono" id="pur-kpi-paid">—</div></div></div>
      <div class="kpi-card g-blue">
        <div class="kpi-icon">🔢</div>
        <div class="kpi-content"><div class="kpi-label">عدد الفواتير</div>
          <div class="kpi-value mono" id="pur-kpi-count">—</div></div></div>
    </div>

    <div class="card">
      <div class="table-container">
        <table class="data-dense">
          <thead><tr>
            <th onclick="sortPurList('number')" style="cursor:pointer; user-select:none;">رقم الفاتورة ${getSortArrowPur('number')}</th>
            <th onclick="sortPurList('date')" style="cursor:pointer; user-select:none;">التاريخ ${getSortArrowPur('date')}</th>
            <th onclick="sortPurList('supplierName')" style="cursor:pointer; user-select:none;">المورد ${getSortArrowPur('supplierName')}</th>
            <th onclick="sortPurList('warehouseName')" style="cursor:pointer; user-select:none;">المخزن ${getSortArrowPur('warehouseName')}</th>
            <th onclick="sortPurList('subtotal')" style="cursor:pointer; user-select:none;">المجموع قبل VAT ${getSortArrowPur('subtotal')}</th>
            <th onclick="sortPurList('totalVat')" style="cursor:pointer; user-select:none;">VAT 15% ${getSortArrowPur('totalVat')}</th>
            <th onclick="sortPurList('totalWithVat')" style="cursor:pointer; user-select:none;">الإجمالي ${getSortArrowPur('totalWithVat')}</th>
            <th onclick="sortPurList('status')" style="cursor:pointer; user-select:none;">الحالة ${getSortArrowPur('status')}</th>
            <th onclick="sortPurList('journalEntryId')" style="cursor:pointer; user-select:none;">قيد ${getSortArrowPur('journalEntryId')}</th>
            <th></th>
          </tr></thead>
          <tbody id="pur-tbody">
            ${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(10).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- ═══════════ NEW PURCHASE INVOICE MODAL (WORLD-CLASS ENTERPRISE) ═══════════ -->
  <div class="modal-overlay" id="purchase-modal" onclick="if(event.target===this)closeModal('purchase-modal')">
    <div class="modal modal-xl" style="max-width:98vw; width:98vw; height:96vh; max-height:96vh; display:flex; flex-direction:column; padding:0; overflow:hidden; border-radius:16px; background:var(--bg-1); box-shadow:0 25px 60px -15px rgba(0,0,0,0.5);">
      
      <!-- Modal Header -->
      <div class="modal-header" style="padding:12px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); flex-shrink:0;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:34px; height:34px; border-radius:8px; background:linear-gradient(135deg, #6366F1, #4F46E5); display:flex; align-items:center; justify-content:center; color:#fff; font-size:16px;">
            🏢
          </div>
          <div>
            <h3 class="modal-title" id="pur-modal-title" style="margin:0; font-size:15px; font-weight:900; color:var(--text-0);">
              فاتورة مشتريات وتوريد بضاعة
            </h3>
            <div style="font-size:11px; color:var(--text-2); margin-top:1px;">
              توثيق الشراء • الخصومات التجارية • البونص المجاني • تحديث تكلفة الأصناف
            </div>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
          <!-- Invoice Tax Type Selector (Standard Tax vs Non-Tax) -->
          <div style="display:inline-flex; background:var(--bg-2); padding:3px; border-radius:8px; border:1px solid var(--border-soft); gap:3px;">
            <button type="button" id="pur-type-btn-taxable" class="btn btn-sm btn-primary" onclick="setPurchaseInvoiceType('taxable')" style="padding:4px 10px; font-size:11.5px; font-weight:800; border-radius:6px; display:inline-flex; align-items:center; gap:4px; cursor:pointer;">
              <span>🏢</span> فاتورة ضريبية (15%)
            </button>
            <button type="button" id="pur-type-btn-nontax" class="btn btn-sm btn-ghost" onclick="setPurchaseInvoiceType('non_tax')" style="padding:4px 10px; font-size:11.5px; font-weight:800; border-radius:6px; display:inline-flex; align-items:center; gap:4px; color:#059669; cursor:pointer;">
              <span>🟢</span> غير ضريبية (0%)
            </button>
          </div>
          <input type="hidden" id="pur-invoice-type" value="taxable" />

          <span class="badge" id="pur-live-badge-status" style="background:rgba(99,102,241,0.12); color:var(--brand); font-weight:800; font-size:11px; padding:4px 8px;">
            📝 فاتورة جديدة
          </span>
          <button class="modal-close" onclick="closeModal('purchase-modal')" style="font-size:20px; line-height:1;">×</button>
        </div>
      </div>

      <!-- Modal Body (Optimized Clean Workspace) -->
      <div class="modal-body" style="padding:14px 18px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:10px; background:var(--bg-3);">
        
        <!-- Pinned Supplier Warning Alert -->
        <div id="sup-warning-alert" class="alert bad hidden" style="margin-bottom:6px; padding:8px 12px; font-size:12px; font-weight:800; border-radius:8px; display:flex; align-items:center; gap:8px;"></div>

        <!-- Section 1: Compact Ergonomic Header Grid (2 Rows Only) -->
        <div class="card" style="padding:10px 14px; border-radius:10px; background:var(--bg-card); border:1px solid var(--border-soft); flex-shrink:0;">
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:10px 14px; align-items:center;">
            
            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-weight:700; font-size:11px; margin-bottom:2px;">رقم الفاتورة (System)</label>
              <input type="text" id="pur-inv-number" class="form-control mono font-bold" readonly
                style="background:var(--bg-2); color:var(--brand); font-size:12px; height:32px; padding:4px 8px;" placeholder="يُولَّد تلقائياً" />
            </div>

            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-weight:700; font-size:11px; margin-bottom:2px;">تاريخ الفاتورة <span class="text-bad">*</span></label>
              <input type="date" id="pur-inv-date" class="form-control mono font-bold" value="${todayString()}" style="height:32px; padding:4px 8px; font-size:12px;" />
            </div>

            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-weight:700; font-size:11px; margin-bottom:2px;">فاتورة المورد الورقية / المرجع</label>
              <input type="text" id="pur-ref-num" class="form-control mono font-bold" placeholder="INV-SUPP-00123" style="height:32px; padding:4px 8px; font-size:12px;" />
            </div>

            <div class="form-group" style="margin:0; min-width:210px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                <label class="form-label" style="font-weight:700; font-size:11px; margin:0;">المورد <span class="text-bad">*</span></label>
                <button type="button" id="pur-sup-360-btn" class="btn btn-ghost sm hidden" style="font-size:10px; padding:0 3px; color:var(--brand);" onclick="window.viewSupplierIntelligence360(document.getElementById('supplier-id').value)">👁️ 360°</button>
              </div>
              <div class="autocomplete-container">
                <input type="text" id="supplier-search" class="form-control font-bold"
                  placeholder="ابحث باسم المورد…" autocomplete="off" style="height:32px; padding:4px 8px; font-size:12px;" />
                <div class="autocomplete-results hidden" id="supplier-results"></div>
                <input type="hidden" id="supplier-id" />
              </div>
            </div>

            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-weight:700; font-size:11px; margin-bottom:2px;">المخزن المستلِم <span class="text-bad">*</span></label>
              <select id="pur-warehouse" class="form-control font-bold" style="height:32px; padding:4px 8px; font-size:12px;">
                <option value="">اختر المستودع</option>
              </select>
            </div>

            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-weight:700; font-size:11px; margin-bottom:2px;">طريقة السداد</label>
              <select id="pur-payment" class="form-control font-bold" style="height:32px; padding:4px 8px; font-size:12px;">
                <option value="credit">آجل (سداد لاحق)</option>
                <option value="cash">نقدي فوري (من الخزينة)</option>
                <option value="transfer">تحويل بنكي</option>
                <option value="check">شيك مصرفي</option>
              </select>
            </div>

            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-weight:700; font-size:11px; margin-bottom:2px;">الاستحقاق (Due Date)</label>
              <input type="date" id="pur-due-date" class="form-control mono" style="height:32px; padding:4px 8px; font-size:11.5px;" />
            </div>

            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-weight:700; font-size:11px; margin-bottom:2px;">ضريبة المورد (VAT)</label>
              <input type="text" id="pur-supplier-vat" class="form-control mono" placeholder="300000000000003" style="height:32px; padding:4px 8px; font-size:11.5px;" />
            </div>

            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-weight:700; font-size:11px; margin-bottom:2px;">المرفق (صورة/PDF)</label>
              <input type="file" id="pur-attachment" class="form-control" accept="image/*,application/pdf" style="height:32px; padding:2px 4px; font-size:11px;" />
            </div>

          </div>
        </div>

        <!-- Section 2: Huge Items Workspace (المساحة الكبرى للأصناف) -->
        <div class="card" style="padding:12px 14px; border-radius:10px; background:var(--bg-card); border:1px solid var(--border-soft); flex:1; display:flex; flex-direction:column; min-height:420px;">
          
          <!-- Smart Action Toolbar -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <strong style="font-size:13.5px; color:var(--text-0);">📋 بنود وأصناف الفاتورة</strong>
              <span class="badge" id="pur-items-badge" style="font-size:11px; background:var(--bg-2);">0 صنف</span>
            </div>

            <!-- Smart Import Buttons -->
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <button type="button" class="btn btn-secondary btn-sm" onclick="window.openImportPOModal()" title="استيراد من أمر شراء" style="font-size:11px; padding:4px 8px;">
                📋 استيراد من PO
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="window.openImportQuoteModal()" title="استيراد من عرض سعر مورد" style="font-size:11px; padding:4px 8px;">
                📑 استيراد عرض سعر
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="window.openImportDeliveryModal()" title="استيراد من شحنة واردة" style="font-size:11px; padding:4px 8px;">
                🚚 استيراد شحنة
              </button>
              <button type="button" class="btn btn-secondary btn-sm" style="color:var(--brand); font-size:11px; padding:4px 8px;" onclick="window.openQuickProductModal()" title="إضافة صنف جديد سريع">
                + صنف جديد
              </button>
            </div>
          </div>

          <!-- Search & Add Product Row -->
          <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px; background:var(--bg-2); padding:6px 10px; border-radius:8px;">
            <select id="pur-product-category-filter" class="form-control" style="width:160px; height:34px; font-size:12px;">
              <option value="">كل الفئات</option>
            </select>
            <div class="autocomplete-container" style="flex:1;">
              <input type="text" id="pur-product-search" class="form-control"
                placeholder="🔍 ابحث بالاسم، الكود، أو امسح الباركود لإضافة الصنف مباشرة للفاتورة... [F8 للبحث المتقدم]" autocomplete="off"
                style="height:34px; font-size:13px; font-weight:600; padding:6px 12px; background:var(--bg-card);" />
              <div class="autocomplete-results hidden" id="pur-product-results"></div>
            </div>
          </div>

          <!-- Lines Table (Expanded Height Workspace) -->
          <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px; flex:1; min-height:300px; max-height:calc(100vh - 430px); overflow-y:auto; background:var(--bg-1);">
            <table class="data-dense" style="margin:0; font-size:12px; width:100%;">
              <thead>
                <tr style="background:var(--bg-3); position:sticky; top:0; z-index:2; box-shadow:0 1px 2px rgba(0,0,0,0.06);">
                  <th style="width:30px; text-align:center;">#</th>
                  <th style="width:90px;">كود الصنف</th>
                  <th>اسم الصنف</th>
                  <th style="width:80px;">الوحدة</th>
                  <th style="width:85px; text-align:center;">الكمية</th>
                  <th style="width:85px; text-align:center; color:#10B981;" title="كميات إضافية مجانية ممنوحة من المورد">🎁 بونص</th>
                  <th style="width:100px; text-align:left;">السعر</th>
                  <th style="width:80px; text-align:center;" title="نسبة الخصم الخاصة بالبند %">خصم%</th>
                  <th style="width:100px; text-align:left; color:var(--brand);" title="صافي تكلفة الوحدة بعد الخصم">صافي الوحدة</th>
                  <th style="width:100px;">التشغيلة (Lot)</th>
                  <th style="width:115px;">الانتهاء</th>
                  <th style="width:55px; text-align:center;">VAT</th>
                  <th style="width:110px; text-align:left; color:var(--brand);">الإجمالي</th>
                  <th style="width:35px;"></th>
                </tr>
              </thead>
              <tbody id="pur-lines-tbody"></tbody>
            </table>
          </div>
        </div>

        <!-- Section 3: Docked Financial Summary & Notes -->
        <div style="display:grid; grid-template-columns: 1fr 1.1fr; gap:12px; flex-shrink:0;">
          
          <!-- Left Box: Global Discount & Notes -->
          <div class="card" style="padding:10px 14px; border-radius:10px; background:var(--bg-card); border:1px solid var(--border-soft); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div class="grid-2 gap-10 mb-8">
                <div class="form-group" style="margin:0;">
                  <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:2px;">نوع الخصم العام</label>
                  <select id="pur-global-discount-type" class="form-control" onchange="window.recalcPurchaseTotals()" style="height:30px; padding:3px 8px; font-size:11.5px;">
                    <option value="pct">نسبة مئوية (%)</option>
                    <option value="amount">مبلغ مقطوع (ر.س)</option>
                  </select>
                </div>
                <div class="form-group" style="margin:0;">
                  <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:2px;">قيمة الخصم العام</label>
                  <input type="number" id="pur-global-discount-val" class="form-control mono font-bold" placeholder="0.00" min="0" step="0.5" oninput="window.recalcPurchaseTotals()" style="height:30px; padding:3px 8px; font-size:12px;" />
                </div>
              </div>

              <div class="grid-2 gap-10 mb-8">
                <div class="form-group" style="margin:0;">
                  <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:2px;">مصاريف شحن/نقل (Freight)</label>
                  <input type="number" id="pur-freight-val" class="form-control mono" placeholder="0.00" min="0" step="1" oninput="window.recalcPurchaseTotals()" style="height:30px; padding:3px 8px; font-size:12px;" />
                </div>
                <div class="form-group" style="margin:0;">
                  <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:2px;">شروط وملاحظات التوريد</label>
                  <input type="text" id="pur-notes" class="form-control" placeholder="أي ملاحظة أو شروط سداد إضافية…" style="height:30px; padding:3px 8px; font-size:11.5px;" />
                </div>
              </div>
            </div>

            <!-- Savings & Bonus Summary Banner -->
            <div id="pur-savings-banner" style="background:rgba(16,185,129,0.06); border:1px dashed rgba(16,185,129,0.3); padding:6px 12px; border-radius:8px; font-size:11.5px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span style="color:#10B981; font-weight:800;">🎁 إجمالي البونص: </span>
                <b id="pur-total-bonus-label" class="mono font-bold">0 كرتون مجاني</b>
              </div>
              <div>
                <span style="color:var(--brand); font-weight:800;">💰 إجمالي الوفر: </span>
                <b id="pur-total-savings-label" class="mono font-bold text-good">0.00 ر.س</b>
              </div>
            </div>
          </div>

          <!-- Right Box: Financial Totals Breakdown -->
          <div class="card" style="padding:10px 14px; border-radius:10px; background:var(--bg-card); border:1.5px solid var(--border-soft); display:flex; flex-direction:column; justify-content:space-between;">
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:4px 12px; font-size:12px;">
              
              <div class="invoice-total-row" style="display:flex; justify-content:space-between; padding:2px 0;">
                <span style="color:var(--text-2);">قبل الخصم:</span>
                <span class="mono font-bold" id="pur-gross-subtotal">0.00 ر.س</span>
              </div>

              <div class="invoice-total-row" style="display:flex; justify-content:space-between; padding:2px 0;">
                <span style="color:var(--text-2);">خصومات البنود:</span>
                <span class="mono font-bold text-bad" id="pur-line-discounts">- 0.00 ر.س</span>
              </div>

              <div class="invoice-total-row" style="display:flex; justify-content:space-between; padding:2px 0;">
                <span style="color:var(--text-2);">الخصم العام:</span>
                <span class="mono font-bold text-bad" id="pur-global-discount-amount">- 0.00 ر.س</span>
              </div>

              <div class="invoice-total-row" style="display:flex; justify-content:space-between; padding:2px 0;">
                <span style="color:var(--text-1); font-weight:700;">صافي الوعاء (15%):</span>
                <span class="mono font-bold text-brand" id="pur-net-taxable">0.00 ر.س</span>
              </div>

              <div class="invoice-total-row" id="pur-exempt-row" style="display:flex; justify-content:space-between; padding:2px 0;">
                <span style="color:var(--text-2);">معفاة (0%):</span>
                <span class="mono font-bold text-good" id="pur-net-exempt">0.00 ر.س</span>
              </div>

              <div class="invoice-total-row" style="display:flex; justify-content:space-between; padding:2px 0;">
                <span style="color:var(--text-2);">ضريبة (15% VAT):</span>
                <span class="mono font-bold text-warn" id="pur-vat">0.00 ر.س</span>
              </div>

              <div class="invoice-total-row" style="display:flex; justify-content:space-between; padding:2px 0;">
                <span style="color:var(--text-2);">الشحن والنقل:</span>
                <span class="mono font-bold" id="pur-freight-label">+ 0.00 ر.س</span>
              </div>

            </div>

            <div class="invoice-total-row grand-total"
              style="border-top:2px solid var(--brand); margin-top:6px; padding-top:6px; display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:14px; font-weight:900; color:var(--text-0);">الإجمالي النهائي المستحق:</span>
              <span class="mono" style="font-size:18px; font-weight:900; color:var(--brand);" id="pur-grand">0.00 ر.س</span>
            </div>
          </div>

        </div>

        <div id="pur-form-error" class="alert bad hidden" style="margin-top:6px;"></div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer" style="padding:10px 20px; background:var(--bg-card); border-top:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
        <button class="btn btn-ghost" onclick="closeModal('purchase-modal')">إلغاء</button>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary" onclick="printPurchasePreview()">🖨️ معاينة وطباعة</button>
          <button class="btn btn-warning" onclick="generatePurchaseOrder()" style="background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;">📋 أمر شراء / عرض سعر</button>
          <button class="btn btn-primary" onclick="savePurchase()" id="save-pur-btn" style="padding:7px 22px; font-weight:800; font-size:13px;">
            💾 حفظ واعتماد الفاتورة
          </button>
        </div>
      </div>
    </div>
  </div>

      <!-- Modal Footer -->
      <div class="modal-footer" style="padding:14px 24px; background:var(--bg-card); border-top:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
        <button class="btn btn-ghost" onclick="closeModal('purchase-modal')">إلغاء</button>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary" onclick="printPurchasePreview()">🖨️ معاينة وطباعة</button>
          <button class="btn btn-warning" onclick="generatePurchaseOrder()" style="background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;">📋 أمر شراء / عرض سعر</button>
          <button class="btn btn-primary" onclick="savePurchase()" id="save-pur-btn" style="padding:8px 20px; font-weight:800;">
            💾 حفظ واعتماد الفاتورة
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══════════ VIEW PURCHASE MODAL ═══════════ -->
  <div class="modal-overlay" id="view-purchase-modal" onclick="if(event.target===this)closeModal('view-purchase-modal')">
    <div class="modal modal-lg">
      <div class="modal-header">
        <h3 class="modal-title" id="view-pur-title">تفاصيل فاتورة الشراء</h3>
        <button class="modal-close" onclick="closeModal('view-purchase-modal')">×</button>
      </div>
      <div class="modal-body" id="view-pur-body" style="padding:20px;"></div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal('view-purchase-modal')">إغلاق</button>
        <button class="btn btn-secondary" onclick="printPurchaseInvoice()">🖨️ طباعة</button>
        <button class="btn btn-lime" id="pur-pay-btn" onclick="registerPayment()">💳 تسجيل دفعة</button>
        <button class="btn btn-warning" id="pur-restock-btn" onclick="reapplyPurchaseStock()" title="إعادة تطبيق المخزون والقيود يدوياً" style="background:linear-gradient(135deg,#7C3AED,#5B21B6);color:#fff;">🔄 تحديث المخزون والقيود</button>
        <button class="btn btn-ghost text-bad" id="pur-cancel-btn" onclick="cancelCurrentPurchase()" style="margin-right:auto;">🚫 إلغاء الفاتورة</button>
      </div>

    </div>
  </div>`;
}

// ────────────────────────────────────────────────
// LOAD DATA
// ────────────────────────────────────────────────
async function loadSuppliersDropdown() {
  try {
    const filter = document.getElementById("pur-supplier-filter");
    if (filter) {
      filter.innerHTML = '<option value="">الكل</option>';
      const sups = await getAll(COLS.suppliers());
      sups.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      sups.forEach(s => {
        filter.innerHTML += `<option value="${s.id}">${s.name}</option>`;
      });
    }
  } catch (e) {
    console.error("loadSuppliersDropdown failed:", e);
  }
}

async function loadWarehousesPurchase() {
  try {
    const whs = await getAll(COLS.warehouses());
    whs.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    const sel = document.getElementById("pur-warehouse");
    if (sel) {
      sel.innerHTML = '<option value="">اختر المستودع...</option>';
      whs.forEach(w =>
        sel.innerHTML += `<option value="${w.id}" data-name="${w.name}">${w.name}</option>`);
    }

    const filter = document.getElementById("pur-warehouse-filter");
    if (filter) {
      filter.innerHTML = '<option value="">كل المستودعات</option>';
      whs.forEach(w => filter.innerHTML += `<option value="${w.id}">${w.name}</option>`);
    }
  } catch (e) {
    console.error("loadWarehousesPurchase failed:", e);
  }
  try {
    const num = await generateInvoiceNumber("PUR");
    const el = document.getElementById("pur-inv-number");
    if (el) el.value = num;
  } catch {}
}

window.loadPurchaseList = async () => {
  const tbody = document.getElementById("pur-tbody");
  if (!tbody) return;
  tbody.innerHTML = `${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(10).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;

  try {
    const constraints = [orderBy("createdAt", "desc"), limit(1000)];
    const statusF = document.getElementById("pur-status-filter")?.value;
    if (statusF) constraints.unshift(where("status", "==", statusF));

    const q = query(COLS.purchaseInvoices(), ...constraints);
    const snap = await getDocs(q);
    let invs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Cache in memory for instant 0ms viewing
    invs.forEach(inv => purInvoicesCache.set(inv.id, inv));

    // Date filter
    const from = document.getElementById("pur-from")?.value;
    const to   = document.getElementById("pur-to")?.value;
    if (from || to) {
      invs = invs.filter(inv => {
        const d = inv.date || (inv.createdAt?.toDate ? inv.createdAt.toDate().toISOString().split("T")[0] : "");
        return (!from || d >= from) && (!to || d <= to);
      });
    }

    // Supplier filter
    const supF = document.getElementById("pur-supplier-filter")?.value;
    if (supF) invs = invs.filter(i => i.supplierId === supF);

    // Warehouse filter
    const whF = document.getElementById("pur-warehouse-filter")?.value;
    if (whF) invs = invs.filter(i => i.warehouseId === whF);

    // Tax type filter (Taxable 15% vs Non-Tax 0%)
    const taxTypeF = document.getElementById("pur-tax-type-filter")?.value;
    if (taxTypeF === "non_tax") {
      invs = invs.filter(i => i.invoiceType === "non_tax" || i.isTaxExempt || (i.totalVat === 0 && (i.exemptSubtotal > 0 || (i.totalWithVat > 0 && i.totalVat === 0))));
    } else if (taxTypeF === "taxable") {
      invs = invs.filter(i => i.invoiceType !== "non_tax" && !i.isTaxExempt && (i.totalVat > 0 || (!i.exemptSubtotal && i.taxableSubtotal > 0)));
    }

    // Sort In-Memory before computing KPIs and rendering
    if (sortField) {
      invs.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === "createdAt") {
          valA = a.createdAt?.seconds || 0;
          valB = b.createdAt?.seconds || 0;
        } else if (sortField === "date") {
          valA = a.date || (a.createdAt?.toDate ? a.createdAt.toDate().toISOString().split("T")[0] : "");
          valB = b.date || (b.createdAt?.toDate ? b.createdAt.toDate().toISOString().split("T")[0] : "");
        } else if (sortField === "supplierName") {
          valA = a.supplierName || "";
          valB = b.supplierName || "";
        } else if (sortField === "warehouseName") {
          valA = a.warehouseName || "";
          valB = b.warehouseName || "";
        } else if (sortField === "subtotal" || sortField === "totalVat" || sortField === "totalWithVat") {
          valA = Number(valA || 0);
          valB = Number(valB || 0);
        } else if (sortField === "number") {
          valA = a.number || "";
          valB = b.number || "";
        } else if (sortField === "status") {
          valA = a.status || "";
          valB = b.status || "";
        } else if (sortField === "journalEntryId") {
          valA = a.journalEntryId ? 1 : 0;
          valB = b.journalEntryId ? 1 : 0;
        }

        if (typeof valA === "string") {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          return sortAsc ? valA - valB : valB - valA;
        }
      });
    }

    // ── KPIs ──────────────────────────────────────────────────────────
    // المنطق الصحيح لهذا النظام:
    //   إجمالي المشتريات = مجموع الفواتير النشطة في الفترة المختارة
    //   المستحق للموردين = رصيد المورد من Firestore (يتحدث عند كل دفعة تلقائياً)
    //                      مُقيّد بالحد الأقصى = إجمالي الفاتورة (لا يتجاوز المُفوتَر)
    //   المدفوع          = إجمالي - المستحق
    // ─────────────────────────────────────────────────────────────────
    const activeInvs = invs.filter(i => i.status !== "cancelled");
    const totalAll   = activeInvs.reduce((s, i) => s + (i.totalWithVat || 0), 0);

    // جمع أرصدة الموردين من Firestore (المصدر الحقيقي للمبالغ المستحقة)
    let totalUnpaid = 0;
    try {
      const uniqueSupplierIds = [...new Set(activeInvs.map(i => i.supplierId).filter(Boolean))];
      if (uniqueSupplierIds.length > 0) {
        const balances = await Promise.all(
          uniqueSupplierIds.map(sid =>
            getDoc(doc(db, `companies/${COMPANY_ID}/suppliers`, sid))
              .then(d => d.exists() ? Math.max(0, d.data().balance || 0) : 0)
              .catch(() => 0)
          )
        );
        const rawUnpaid = balances.reduce((s, b) => s + b, 0);
        // المستحق لا يتجاوز إجمالي الفواتير المعروضة
        totalUnpaid = Math.min(rawUnpaid, totalAll);
      }
    } catch (balErr) {
      // fallback: استخدم حالة الفاتورة
      console.warn("[KPI] supplier balance fetch failed, falling back to status:", balErr.message);
      totalUnpaid = activeInvs.reduce((s, inv) => {
        const st = (inv.status || "").toLowerCase();
        if (st === "paid" || st === "cash") return s;
        if (st === "partial") return s + Math.max(0, (inv.totalWithVat || 0) - (inv.paidAmount || 0));
        return s + (inv.totalWithVat || 0);
      }, 0);
    }


    const totalPaid = Math.max(0, totalAll - totalUnpaid);

    document.getElementById("pur-kpi-total").textContent  = formatCurrency(totalAll);
    document.getElementById("pur-kpi-unpaid").textContent = formatCurrency(totalUnpaid);
    document.getElementById("pur-kpi-paid").textContent   = formatCurrency(totalPaid);
    document.getElementById("pur-kpi-count").textContent  = invs.length;
    document.getElementById("pur-count").textContent      = `${invs.length} فاتورة`;


    if (invs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--text-2);">
        لا توجد فواتير في الفترة المحددة</td></tr>`;
      return;
    }

    tbody.innerHTML = invs.map(inv => {
      const isNonTax = inv.invoiceType === "non_tax" || inv.isTaxExempt || (inv.totalVat === 0 && (inv.exemptSubtotal > 0 || (inv.totalWithVat > 0 && inv.totalVat === 0)));
      const typeBadge = isNonTax 
        ? `<span class="badge" style="background:rgba(16,185,129,0.12); color:#059669; font-size:10px; font-weight:700; border:1px solid rgba(16,185,129,0.25); display:block; margin-top:3px; width:fit-content;">🟢 غير ضريبية</span>`
        : `<span class="badge" style="background:rgba(99,102,241,0.08); color:var(--brand); font-size:10px; font-weight:700; border:1px solid rgba(99,102,241,0.2); display:block; margin-top:3px; width:fit-content;">🏢 ضريبية</span>`;

      return `
      <tr style="cursor:pointer;" onclick="viewPurchaseInvoice('${inv.id}')">
        <td class="mono text-indigo">
          <strong>${inv.number || inv.id.slice(0,8)}</strong>
          ${typeBadge}
        </td>
        <td class="dim">${formatDate(inv.date || inv.createdAt)}</td>
        <td class="font-semibold">${inv.supplierName || "—"}</td>
        <td class="dim" style="font-size:11px;">${inv.warehouseName || "—"}</td>
        <td class="mono">${formatCurrency(inv.subtotal || 0)}</td>
        <td class="mono ${isNonTax ? 'text-good' : 'text-warn'}">${isNonTax ? '<span class="dim">0% (معفى)</span>' : formatCurrency(inv.totalVat || 0)}</td>
        <td class="mono font-bold">${formatCurrency(inv.totalWithVat || 0)}</td>
        <td>${getInvoiceStatusBadge(inv.status)}</td>
        <td style="font-size:11px;">${inv.journalEntryId
          ? '<span class="badge good" style="font-size:10px;">✓ مُرحَّل</span>'
          : '<span class="badge" style="font-size:10px; background:var(--bg-3); color:var(--text-2);">—</span>'}</td>
        <td onclick="event.stopPropagation()">
          <div class="row-actions">
            <button class="btn btn-icon sm btn-ghost" onclick="viewPurchaseInvoice('${inv.id}')" title="عرض">👁️</button>
            ${inv.status !== "cancelled"
              ? `<button class="btn btn-icon sm btn-ghost" onclick="editPurchaseInvoice('${inv.id}')"
                  title="تعديل" style="color:var(--primary);">✏️</button>` : ""}
            ${inv.status !== "cancelled" && inv.status !== "paid"
              ? `<button class="btn btn-icon sm btn-ghost" onclick="cancelPurchaseInvoice('${inv.id}')"
                  title="إلغاء" style="color:var(--bad);">🚫</button>` : ""}
            <button class="btn btn-icon sm btn-ghost" onclick="deletePurchaseInvoice('${inv.id}','${(inv.number||'').replace(/'/g,"\\'")}')"
              title="حذف نهائي" style="color:var(--danger);">🗑️</button>
          </div>
        </td>
      </tr>`;
    }).join("");

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="10">
      <div class="alert bad" style="margin:8px;">${err.message}</div></td></tr>`;
  }
};

// ────────────────────────────────────────────────
// AUTOCOMPLETE — Supplier
// ────────────────────────────────────────────────
function setupSupplierAC() {
  const input   = document.getElementById("supplier-search");
  const results = document.getElementById("supplier-results");
  if (!input) return;

  input.addEventListener("input", debounce(async () => {
    const term = input.value.trim().toLowerCase();
    if (term.length < 1) { results.classList.add("hidden"); return; }
    try {
      if (!cachedSuppliers || cachedSuppliers.length === 0) {
        cachedSuppliers = await getAll(COLS.suppliers(), [orderBy("name")]);
      }

      const sups = cachedSuppliers.filter(s => 
        (s.name || "").toLowerCase().includes(term) ||
        (s.phone || "").includes(term)
      ).slice(0, 15);

      if (!sups.length) { results.classList.add("hidden"); return; }
      results.innerHTML = sups.map(s => `
        <div class="autocomplete-item" onclick="selectPurSupplier('${s.id}','${(s.name||"").replace(/'/g,"\\'")}','${s.vatNumber||""}')">
          <div>${s.name}</div>
          <div class="item-code">${s.phone || ""} ${s.vatNumber ? "| VAT: "+s.vatNumber : ""}</div>
        </div>`).join("");
      results.classList.remove("hidden");
    } catch (err) {
      console.warn("setupSupplierAC error:", err);
    }
  }, 100));

  document.addEventListener("click", e => {
    if (!input.contains(e.target)) results.classList.add("hidden");
  });
}

window.selectPurSupplier = (id, name, vatNum) => {
  document.getElementById("supplier-id").value    = id;
  document.getElementById("supplier-search").value = name;
  document.getElementById("supplier-results").classList.add("hidden");
  if (vatNum) document.getElementById("pur-supplier-vat").value = vatNum;

  const warningEl = document.getElementById("sup-warning-alert");
  const supDoc = (cachedSuppliers || []).find(s => s.id === id);
  if (supDoc && supDoc.pinnedWarningNote && warningEl) {
    warningEl.innerHTML = `⚠️ <b>تنبيه مثبت:</b> ${supDoc.pinnedWarningNote}`;
    warningEl.classList.remove("hidden");
  } else if (warningEl) {
    warningEl.classList.add("hidden");
  }
};

window.openNewPurchaseModal = (supplierId, supplierName, lines = []) => {
  if (typeof window.openPurchaseModal === "function") {
    window.openPurchaseModal();
    if (supplierId) {
      window.selectPurSupplier(supplierId, supplierName, "");
    }
    if (lines && lines.length) {
      purchaseLines = lines.map(l => ({
        productId: l.productId,
        name: l.productName || l.name,
        unit: l.unit || "كرتون",
        qty: parseFloat(l.qty || 1),
        unitPrice: parseFloat(l.unitPrice || 0),
        vatRate: 15,
        total: (parseFloat(l.qty || 1) * parseFloat(l.unitPrice || 0)) * 1.15
      }));
      renderPurLines();
      if (typeof recalcPurchaseTotals === "function") recalcPurchaseTotals();
    }
  }
};

// ────────────────────────────────────────────────
// AUTOCOMPLETE — Product
// ────────────────────────────────────────────────
function setupPurProductAC() {
  const input   = document.getElementById("pur-product-search");
  const results = document.getElementById("pur-product-results");
  const catFilter = document.getElementById("pur-product-category-filter");
  if (!input) return;

  const performSearch = () => {
    const term = input.value.trim().toLowerCase();
    const catId = catFilter ? catFilter.value : "";

    if (!term && !catId) {
      results.classList.add("hidden");
      return;
    }

    let matched = allProducts;
    if (catId) {
      matched = matched.filter(p => p.category === catId);
    }
    if (term) {
      matched = matched.filter(p =>
        (p.name||"").toLowerCase().includes(term) ||
        (p.sku||"").toLowerCase().includes(term)  ||
        (p.barcode||"").includes(term)
      );
    }

    matched = matched.slice(0, 15);

    if (!matched.length) {
      results.innerHTML = `<div style="padding:10px;text-align:center;color:var(--text-2);font-size:12px;">لا توجد نتائج</div>`;
      results.classList.remove("hidden");
      return;
    }

    results.innerHTML = matched.map(p => `
      <div class="autocomplete-item"
        onclick="addPurLine('${p.id}','${(p.name||"").replace(/'/g,"\\'")}',${p.costPrice||0},'${p.unit||"Piece"}','${p.sku||""}','${p.taxCategory||"S"}','${p.altUnit||""}',${p.unitFactor||1})">
        <div class="flex justify-between">
          <span>${p.name}</span>
          <span class="mono text-indigo">${formatCurrency(p.costPrice||0)}</span>
        </div>
        <div class="item-code">${p.sku||""} | الوحدة: ${p.unit||""}${p.altUnit && p.unitFactor > 1 ? ` | <span style="color:#d97706;font-weight:700;">📦 ${p.unitFactor} ${p.unit} = 1 ${p.altUnit}</span>` : ''}</div>
      </div>`).join("");
    results.classList.remove("hidden");
  };

  input.addEventListener("input", debounce(performSearch, 200));
  input.addEventListener("focus", performSearch);
  if (catFilter) {
    catFilter.addEventListener("change", performSearch);
  }

  document.addEventListener("click", e => {
    if (!input.contains(e.target) && !results.contains(e.target) && (!catFilter || !catFilter.contains(e.target)))
      results.classList.add("hidden");
  });
}

async function loadProductsAndCategories() {
  try {
    if (allProducts.length === 0 || allCategories.length === 0) {
      const [pSnap, cSnap] = await Promise.all([
        getAll(COLS.products(), [orderBy("name")]),
        getAll(COLS.categories(), [orderBy("name")])
      ]);
      allProducts = pSnap;
      allCategories = cSnap;
    }
    const catFilter = document.getElementById("pur-product-category-filter");
    if (catFilter) {
      catFilter.innerHTML = '<option value="">كل الفئات</option>' + 
        allCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    }
  } catch (err) {
    console.error("loadProductsAndCategories error:", err);
  }
}

// ────────────────────────────────────────────────
// LINE MANAGEMENT
// ────────────────────────────────────────────────
window.setPurchaseInvoiceType = (type) => {
  const typeInput = document.getElementById("pur-invoice-type");
  const btnTaxable = document.getElementById("pur-type-btn-taxable");
  const btnNonTax = document.getElementById("pur-type-btn-nontax");

  if (type === "non_tax") {
    if (typeInput) typeInput.value = "non_tax";
    if (btnTaxable) {
      btnTaxable.className = "btn btn-sm btn-ghost";
      btnTaxable.style.background = "transparent";
      btnTaxable.style.color = "var(--text-2)";
    }
    if (btnNonTax) {
      btnNonTax.className = "btn btn-sm btn-primary";
      btnNonTax.style.background = "#059669";
      btnNonTax.style.color = "#ffffff";
    }
    purchaseLines.forEach(l => {
      l.taxCategory = "E";
    });
  } else {
    if (typeInput) typeInput.value = "taxable";
    if (btnTaxable) {
      btnTaxable.className = "btn btn-sm btn-primary";
      btnTaxable.style.background = "";
      btnTaxable.style.color = "";
    }
    if (btnNonTax) {
      btnNonTax.className = "btn btn-sm btn-ghost";
      btnNonTax.style.background = "transparent";
      btnNonTax.style.color = "#059669";
    }
    purchaseLines.forEach(l => {
      l.taxCategory = "S";
    });
  }
  renderPurLines();
  updatePurTotals();
};

window.addPurLine = (pid, pname, unitPrice, unit, sku, taxCategory, altUnit, unitFactor) => {
  document.getElementById("pur-product-search").value = "";
  document.getElementById("pur-product-results").classList.add("hidden");
  const isInvoiceNonTax = document.getElementById("pur-invoice-type")?.value === "non_tax";
  purchaseLines.push({
    productId: pid,
    productName: pname,
    sku: sku || "",
    unit: unit || "Piece",                                                   // base/stock unit (e.g. Piece)
    altUnit: altUnit || "",                                                   // purchase unit (e.g. Carton)
    unitFactor: parseFloat(unitFactor) || 1,                                 // how many base units in 1 altUnit
    selectedUnit: (altUnit && parseFloat(unitFactor) > 1) ? altUnit : (unit || "Piece"), // default to carton if available
    taxCategory: isInvoiceNonTax ? "E" : (taxCategory || "S"),
    qty: 1,
    bonusQty: 0,
    unitPrice: parseFloat(unitPrice) || 0,
    discount: 0,
    batchNumber: "",
    expiryDate: "",
  });
  renderPurLines();
  updatePurTotals();
};

function renderPurLines() {
  const tbody = document.getElementById("pur-lines-tbody");
  const badgeEl = document.getElementById("pur-items-badge");
  if (!tbody) return;

  if (badgeEl) badgeEl.textContent = `${purchaseLines.length} صنف`;

  if (!purchaseLines.length) {
    tbody.innerHTML = `<tr><td colspan="14" style="text-align:center;padding:24px;color:var(--text-2);">
      لم يتم إضافة أصناف — ابحث وأضف أصناف أعلاه أو استخدم أزرار الاستيراد الذكية</td></tr>`;
    return;
  }

  const isInvoiceNonTax = document.getElementById("pur-invoice-type")?.value === "non_tax";

  tbody.innerHTML = purchaseLines.map((l, i) => {
    const qty = parseFloat(l.qty) || 0;
    const price = parseFloat(l.unitPrice) || 0;
    const discPct = parseFloat(l.discount) || 0;
    const gross = qty * price;
    const discAmt = gross * (discPct / 100);
    const lineSub = Math.max(0, gross - discAmt);
    const netUnitPrice = qty > 0 ? (lineSub / qty) : price;
    const isTaxable = !isInvoiceNonTax && (l.taxCategory === "S" || l.taxCategory === "standard");
    const vatAmt = isTaxable ? lineSub * 0.15 : 0;
    const lineTotalWithVat = lineSub + vatAmt;

    return `
    <tr id="pur-line-row-${i}" style="border-bottom:1px solid var(--border-soft); background:var(--bg-card);">
      <td style="padding:6px 4px; text-align:center; color:var(--text-2); font-size:11px;">${i+1}</td>
      <td style="padding:6px 6px;" class="mono dim" style="font-size:11px;">${l.sku || "—"}</td>
      <td style="padding:6px 6px; font-weight:700; color:var(--text-0);">${l.productName}</td>
      <td style="padding:6px 4px; min-width:90px;">
        ${(l.altUnit && l.unitFactor > 1)
          ? `<select class="form-control" style="height:28px;font-size:11px;padding:2px 4px;color:var(--brand);font-weight:700;"
               onchange="updatePurLineUnit(${i},this.value)" title="اختر وحدة الإدخال">
               <option value="${l.altUnit}" ${l.selectedUnit===l.altUnit?'selected':''}>${translateUnit(l.altUnit)} (كرتون)</option>
               <option value="${l.unit}" ${l.selectedUnit===l.unit?'selected':''}>${translateUnit(l.unit)} (حبة)</option>
             </select>
             <div style="font-size:9.5px;color:#64748b;margin-top:2px;text-align:center">
               ${l.selectedUnit===l.altUnit ? `1 ${translateUnit(l.altUnit)} = ${l.unitFactor} ${translateUnit(l.unit)}` : translateUnit(l.unit)}
             </div>`
          : `<span style="font-size:11px;color:var(--text-2)">${translateUnit(l.unit||'Piece')}</span>`
        }
      </td>
      
      <!-- Qty -->
      <td style="padding:6px 4px; width:75px;">
        <input type="number" class="form-control mono font-bold"
          style="width:70px; height:28px; font-size:11.5px; padding:2px 4px; text-align:center;"
          value="${l.qty}" min="0.001" step="0.001"
          oninput="updatePurLine(${i},'qty',this.value)" />
        ${(l.altUnit && l.unitFactor > 1 && l.selectedUnit === l.altUnit)
          ? `<div style="font-size:9.5px;color:#059669;margin-top:2px;text-align:center;font-weight:700;">= ${(parseFloat(l.qty)||0) * l.unitFactor} ${translateUnit(l.unit)}</div>`
          : ''}
      </td>

      <!-- Bonus Qty -->
      <td style="padding:6px 4px; width:75px;">
        <input type="number" class="form-control mono font-bold"
          style="width:70px; height:28px; font-size:11.5px; padding:2px 4px; text-align:center; color:#10B981; background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.3);"
          value="${l.bonusQty || ""}" placeholder="0" min="0" step="1"
          title="كمية مجانية ممنوحة من المورد (تضاف للمخزون بدون تكلفة)"
          oninput="updatePurLine(${i},'bonusQty',this.value)" />
      </td>

      <!-- Unit Price -->
      <td style="padding:6px 4px; width:95px;">
        <input type="number" class="form-control mono font-bold"
          style="width:90px; height:28px; font-size:11.5px; padding:2px 6px;"
          value="${l.unitPrice}" min="0" step="0.01"
          oninput="updatePurLine(${i},'unitPrice',this.value)" />
      </td>

      <!-- Line Discount % -->
      <td style="padding:6px 4px; width:70px;">
        <input type="number" class="form-control mono font-bold"
          style="width:65px; height:28px; font-size:11.5px; padding:2px 4px; text-align:center; color:#EF4444;"
          value="${l.discount || ""}" placeholder="0%" min="0" max="100" step="0.5"
          oninput="updatePurLine(${i},'discount',this.value)" />
      </td>

      <!-- Net Unit Price -->
      <td style="padding:6px 6px;" class="mono font-bold pur-line-net-price" style="font-size:12px; color:var(--brand);">
        ${formatCurrency(netUnitPrice)}
      </td>

      <!-- Batch Number -->
      <td style="padding:6px 4px; width:90px;">
        <input type="text" class="form-control mono"
          style="width:85px; height:28px; font-size:11px; padding:2px 4px;"
          value="${l.batchNumber || ""}" placeholder="LOT-01"
          onchange="updatePurLine(${i},'batchNumber',this.value)" />
      </td>

      <!-- Expiry Date -->
      <td style="padding:6px 4px; width:110px;">
        <input type="date" class="form-control mono"
          style="width:105px; height:28px; font-size:10.5px; padding:2px 2px;"
          value="${l.expiryDate || ""}"
          onchange="updatePurLine(${i},'expiryDate',this.value)" />
      </td>

      <!-- VAT Badge -->
      <td style="padding:6px 4px; text-align:center;">
        ${isInvoiceNonTax
          ? `<span class="badge good" style="font-size:9.5px; padding:2px 6px; user-select:none;" title="فاتورة غير ضريبية (معفاة)">0% معفى</span>`
          : (l.taxCategory === "S"
            ? `<span class="badge warn" style="font-size:9.5px; padding:2px 6px; cursor:pointer; user-select:none;" onclick="togglePurLineTax(${i})" title="انقر لتغيير الضريبة (خاضع 15% / معفى 0%)">15% 🔄</span>`
            : `<span class="badge good" style="font-size:9.5px; padding:2px 6px; cursor:pointer; user-select:none;" onclick="togglePurLineTax(${i})" title="انقر لتغيير الضريبة (خاضع 15% / معفى 0%)">معفى 🔄</span>`)}
      </td>

      <!-- Total With VAT -->
      <td style="padding:6px 6px;" class="mono font-bold text-brand pur-line-total-vat" style="font-size:12px;">
        ${formatCurrency(lineTotalWithVat)}
      </td>

      <!-- Delete Button -->
      <td style="padding:6px 2px; text-align:center;">
        <button class="btn btn-icon sm btn-ghost" onclick="removePurLine(${i})"
          style="color:var(--bad); font-size:14px; padding:2px 4px;" title="حذف البند">✕</button>
      </td>
    </tr>`;
  }).join("");
}

window.togglePurLineTax = (i) => {
  if (!purchaseLines[i]) return;
  const isInvoiceNonTax = document.getElementById("pur-invoice-type")?.value === "non_tax";
  if (isInvoiceNonTax) {
    purchaseLines[i].taxCategory = "E";
    return;
  }
  const curr = purchaseLines[i].taxCategory || "S";
  purchaseLines[i].taxCategory = (curr === "E" || curr === "Z") ? "S" : "E";
  renderPurLines();
  updatePurTotals();
};

window.updatePurLine = (i, f, v) => {
  if (!purchaseLines[i]) return;
  if (f === 'batchNumber' || f === 'expiryDate') {
    purchaseLines[i][f] = v;
  } else {
    purchaseLines[i][f] = parseFloat(v) || 0;
  }

  // Update single row calculations without destroying input focus!
  const l = purchaseLines[i];
  const qty = parseFloat(l.qty) || 0;
  const price = parseFloat(l.unitPrice) || 0;
  const discPct = parseFloat(l.discount) || 0;
  const gross = qty * price;
  const discAmt = gross * (discPct / 100);
  const lineSub = Math.max(0, gross - discAmt);
  const netUnitPrice = qty > 0 ? (lineSub / qty) : price;
  const isInvoiceNonTax = document.getElementById("pur-invoice-type")?.value === "non_tax";
  const isTaxable = !isInvoiceNonTax && (l.taxCategory === "S" || l.taxCategory === "standard");
  const vatAmt = isTaxable ? lineSub * 0.15 : 0;
  const lineTotalWithVat = lineSub + vatAmt;

  const row = document.getElementById(`pur-line-row-${i}`);
  if (row) {
    const netEl = row.querySelector(".pur-line-net-price");
    const totEl = row.querySelector(".pur-line-total-vat");
    if (netEl) netEl.textContent = formatCurrency(netUnitPrice);
    if (totEl) totEl.textContent = formatCurrency(lineTotalWithVat);
  }

  updatePurTotals();
};

window.removePurLine = (i) => {
  purchaseLines.splice(i, 1);
  renderPurLines();
  updatePurTotals();
};

window.updatePurLineUnit = (i, newUnit) => {
  const l = purchaseLines[i];
  if (!l) return;
  l.selectedUnit = newUnit;
  renderPurLines();
  updatePurTotals();
};

function updatePurTotals() {
  const gType = document.getElementById("pur-global-discount-type")?.value || "pct";
  const gVal = parseFloat(document.getElementById("pur-global-discount-val")?.value) || 0;
  const freight = parseFloat(document.getElementById("pur-freight-val")?.value) || 0;
  const invType = document.getElementById("pur-invoice-type")?.value || "taxable";
  const isInvoiceNonTax = invType === "non_tax";

  let grossSubtotal = 0;
  let lineDiscountTotal = 0;
  let totalPurchasedQty = 0;
  let totalBonusQty = 0;
  let grossTaxable = 0;
  let grossExempt = 0;

  purchaseLines.forEach(l => {
    const qty = parseFloat(l.qty) || 0;
    const bonus = parseFloat(l.bonusQty) || 0;
    const price = parseFloat(l.unitPrice) || 0;
    const discPct = parseFloat(l.discount) || 0;

    const lineGross = qty * price;
    const lineDiscAmt = lineGross * (discPct / 100);
    const lineNet = Math.max(0, lineGross - lineDiscAmt);

    grossSubtotal += lineGross;
    lineDiscountTotal += lineDiscAmt;
    totalPurchasedQty += qty;
    totalBonusQty += bonus;

    if (isInvoiceNonTax) {
      grossExempt += lineNet;
    } else {
      const isStandardTax = (l.taxCategory === "S" || l.taxCategory === "standard" || l.vatRate === 15 || (!l.taxCategory && l.vatRate !== 0));
      if (isStandardTax) {
        grossTaxable += lineNet;
      } else {
        grossExempt += lineNet;
      }
    }
  });

  const subtotalAfterLineDiscounts = Math.max(0, grossSubtotal - lineDiscountTotal);

  let globalDiscountAmt = 0;
  if (gType === "pct") {
    globalDiscountAmt = subtotalAfterLineDiscounts * (gVal / 100);
  } else {
    globalDiscountAmt = Math.min(subtotalAfterLineDiscounts, gVal);
  }

  // Distribute global discount proportionally across taxable and exempt items
  const globalDiscRatio = subtotalAfterLineDiscounts > 0 ? (globalDiscountAmt / subtotalAfterLineDiscounts) : 0;
  const netTaxableBase = Math.max(0, grossTaxable * (1 - globalDiscRatio));
  const netExemptBase = Math.max(0, grossExempt * (1 - globalDiscRatio));

  const vatTotal = netTaxableBase * 0.15;
  const grandTotal = netTaxableBase + netExemptBase + vatTotal + freight;
  const totalSavings = lineDiscountTotal + globalDiscountAmt;

  const fmt = (n) => `${formatCurrency(n)}`;
  const el = id => document.getElementById(id);

  if (el("pur-gross-subtotal")) el("pur-gross-subtotal").textContent = fmt(grossSubtotal);
  if (el("pur-line-discounts")) el("pur-line-discounts").textContent = `- ${fmt(lineDiscountTotal)}`;
  if (el("pur-global-discount-amount")) el("pur-global-discount-amount").textContent = `- ${fmt(globalDiscountAmt)}`;
  if (el("pur-net-taxable")) el("pur-net-taxable").textContent = fmt(netTaxableBase);
  if (el("pur-net-exempt")) el("pur-net-exempt").textContent = fmt(netExemptBase);
  if (el("pur-vat")) el("pur-vat").textContent = fmt(vatTotal);
  if (el("pur-freight-label")) el("pur-freight-label").textContent = `+ ${fmt(freight)}`;
  if (el("pur-grand")) el("pur-grand").textContent = fmt(grandTotal);

  if (el("pur-total-bonus-label")) el("pur-total-bonus-label").textContent = `${totalBonusQty} كرتون مجاني`;
  if (el("pur-total-savings-label")) {
    const savingsPct = grossSubtotal > 0 ? ((totalSavings / grossSubtotal) * 100).toFixed(1) : 0;
    el("pur-total-savings-label").textContent = `${fmt(totalSavings)} (${savingsPct}%)`;
  }
}
window.recalcPurchaseTotals = updatePurTotals;

// ────────────────────────────────────────────────
// OPEN / SAVE MODAL
// ────────────────────────────────────────────────
window.openPurchaseModal = async () => {
  purchaseLines = [];
  window._editingPurchaseId = null;
  const btn = document.getElementById("save-pur-btn");
  if (btn) btn.textContent = "💾 حفظ واعتماد الفاتورة";

  ["supplier-search","pur-ref-num","pur-notes","pur-supplier-vat","pur-global-discount-val","pur-freight-val"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  if (document.getElementById("pur-global-discount-type")) {
    document.getElementById("pur-global-discount-type").value = "pct";
  }
  document.getElementById("supplier-id").value = "";
  document.getElementById("pur-inv-date").value = todayString();
  document.getElementById("pur-form-error").classList.add("hidden");
  document.getElementById("pur-modal-title").textContent = "فاتورة مشتريات وتوريد بضاعة";
  document.getElementById("pur-inv-number").value = "جارِ التوليد...";
  
  const sup360Btn = document.getElementById("pur-sup-360-btn");
  if (sup360Btn) sup360Btn.classList.add("hidden");
  const warnEl = document.getElementById("sup-warning-alert");
  if (warnEl) warnEl.classList.add("hidden");

  renderPurLines();
  updatePurTotals();
  if (typeof window.setPurchaseInvoiceType === "function") {
    window.setPurchaseInvoiceType("taxable");
  }

  // Open modal INSTANTLY
  openModal("purchase-modal");

  // Load products and categories in background
  loadProductsAndCategories();

  // Generate number in background (non-blocking)
  try {
    const num = await generateInvoiceNumber("PUR");
    document.getElementById("pur-inv-number").value = num;
  } catch {}
};

async function cleanupPurchaseAssociatedTransactions(oldInv) {
  if (!oldInv) return;

  const invId = oldInv.id;
  const invNum = oldInv.number || oldInv.invoiceNumber || "";

  // 1. Query and reverse cash transactions for this purchase invoice
  try {
    const { getDocs, query, collection, where } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    
    // Reverse cashTransactions
    const qCash = query(collection(db, `companies/${COMPANY_ID}/cashTransactions`), where("sourceId", "==", invId), where("sourceType", "==", "purchaseInvoice"));
    const cashSnap = await getDocs(qCash);
    for (const txnDoc of cashSnap.docs) {
      const txnData = txnDoc.data();
      const revType = txnData.type === "out" ? "in" : "out";
      await autoCashTransaction({
        type:       revType,
        amount:     txnData.amount,
        notes:      `عكس سداد/تعديل فاتورة مشتريات ${invNum}`,
        sourceType: "purchaseInvoice_reverse",
        sourceId:   invId,
        date:       oldInv.date || todayString(),
      });
      console.log(`[Cleanup] Reversed cash transaction of ${txnData.amount} for purchase invoice ${invNum}`);
    }

    // Reverse bankTransactions
    const qBank = query(collection(db, `companies/${COMPANY_ID}/bankTransactions`), where("sourceId", "==", invId), where("sourceType", "==", "purchaseInvoice"));
    const bankSnap = await getDocs(qBank);
    for (const txnDoc of bankSnap.docs) {
      const txnData = txnDoc.data();
      const revType = txnData.type === "out" ? "in" : "out";
      await autoBankTransaction({
        type:       revType,
        amount:     txnData.amount,
        notes:      `عكس سداد/تعديل فاتورة مشتريات ${invNum}`,
        sourceType: "purchaseInvoice_reverse",
        sourceId:   invId,
        date:       oldInv.date || todayString(),
      });
      console.log(`[Cleanup] Reversed bank transaction of ${txnData.amount} for purchase invoice ${invNum}`);
    }
  } catch (err) {
    console.warn("[Cleanup] Querying and reversing purchase transactions failed:", err.message);
  }

  // 2. Delete payment journal entry if exists
  if (oldInv.paymentJournalEntryId) {
    try {
      await remove("journalEntries", oldInv.paymentJournalEntryId);
      console.log(`[Cleanup] Deleted payment journal entry ${oldInv.paymentJournalEntryId} for purchase invoice ${invNum}`);
    } catch (jeErr) {
      console.warn("[Cleanup] Failed to delete payment JE:", jeErr.message);
    }
  }
}

window.savePurchase = async () => {
  const errEl = document.getElementById("pur-form-error");
  errEl.classList.add("hidden");

  let supplierId    = document.getElementById("supplier-id").value;
  const supplierName  = document.getElementById("supplier-search").value.trim();
  const waSel         = document.getElementById("pur-warehouse");
  const warehouseId   = waSel.value;
  const warehouseName = waSel.options[waSel.selectedIndex]?.dataset.name || "";
  const payment       = document.getElementById("pur-payment").value;
  const invDate       = document.getElementById("pur-inv-date").value;
  const refNum        = document.getElementById("pur-ref-num").value.trim();
  const dueDate       = document.getElementById("pur-due-date").value;
  const notes         = document.getElementById("pur-notes").value.trim();
  const supplierVat   = document.getElementById("pur-supplier-vat").value.trim();

  // Auto-resolve supplier by typed name if user didn't click from dropdown
  if (!supplierId && supplierName) {
    try {
      const q = query(COLS.suppliers(), orderBy("name"), limit(20));
      const snap = await getDocs(q);
      const found = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .find(s => (s.name || "").toLowerCase() === supplierName.toLowerCase());
      if (found) {
        supplierId = found.id;
        document.getElementById("supplier-id").value = found.id;
        if (!supplierVat && found.vatNumber)
          document.getElementById("pur-supplier-vat").value = found.vatNumber;
      }
    } catch {}
  }

  const showErr = (msg) => {
    errEl.textContent = msg;
    errEl.classList.remove("hidden");
    errEl.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (!supplierId)           { showErr("⚠️ يرجى اختيار المورد من القائمة"); return; }
  if (!warehouseId)          { showErr("⚠️ يرجى اختيار المخزن المستلِم"); return; }
  if (!purchaseLines.length) { showErr("⚠️ أضف صنفاً واحداً على الأقل"); return; }

  const btn = document.getElementById("save-pur-btn");
  btn.disabled = true;
  btn.textContent = "⌛ جارٍ الحفظ…";

  try {
    // التحقق من إقفال الفترة المالية لمنع التلاعب بأثر رجعي
    if (await isPeriodClosed(invDate)) {
      showErr(`⚠️ لا يمكن حفظ الفاتورة لأن تاريخها (${invDate}) يقع في فترة محاسبية مغلقة ومقفلة نهائياً.`);
      btn.disabled = false;
      btn.textContent = "💾 حفظ واعتماد";
      return;
    }

    const gType = document.getElementById("pur-global-discount-type")?.value || "pct";
    const gVal = parseFloat(document.getElementById("pur-global-discount-val")?.value) || 0;
    const freight = parseFloat(document.getElementById("pur-freight-val")?.value) || 0;
    const invoiceType = document.getElementById("pur-invoice-type")?.value || "taxable";
    const isInvoiceNonTax = invoiceType === "non_tax";

    let grossSubtotal = 0;
    let lineDiscountTotal = 0;
    let totalBonusQty = 0;
    let totalPurchasedQty = 0;
    let grossTaxable = 0;
    let grossExempt = 0;

    purchaseLines.forEach(l => {
      const qty = parseFloat(l.qty) || 0;
      const bonus = parseFloat(l.bonusQty) || 0;
      const price = parseFloat(l.unitPrice) || 0;
      const discPct = parseFloat(l.discount) || 0;

      const lineGross = qty * price;
      const lineDiscAmt = lineGross * (discPct / 100);
      const lineNet = Math.max(0, lineGross - lineDiscAmt);

      grossSubtotal += lineGross;
      lineDiscountTotal += lineDiscAmt;
      totalPurchasedQty += qty;
      totalBonusQty += bonus;

      if (isInvoiceNonTax) {
        l.taxCategory = "E";
        grossExempt += lineNet;
      } else {
        const isStandardTax = (l.taxCategory === "S" || l.taxCategory === "standard" || l.vatRate === 15 || (!l.taxCategory && l.vatRate !== 0));
        if (isStandardTax) {
          grossTaxable += lineNet;
        } else {
          grossExempt += lineNet;
        }
      }
    });

    const subtotalAfterLineDiscounts = Math.max(0, grossSubtotal - lineDiscountTotal);

    let globalDiscountAmt = 0;
    if (gType === "pct") {
      globalDiscountAmt = subtotalAfterLineDiscounts * (gVal / 100);
    } else {
      globalDiscountAmt = Math.min(subtotalAfterLineDiscounts, gVal);
    }

    const globalDiscRatio = subtotalAfterLineDiscounts > 0 ? (globalDiscountAmt / subtotalAfterLineDiscounts) : 0;
    const netTaxableBase = Math.max(0, grossTaxable * (1 - globalDiscRatio));
    const netExemptBase = Math.max(0, grossExempt * (1 - globalDiscRatio));

    const vatTotal = netTaxableBase * 0.15;
    const grandTotal = netTaxableBase + netExemptBase + vatTotal + freight;
    const totalDiscount = lineDiscountTotal + globalDiscountAmt;

    const invNum = document.getElementById("pur-inv-number").value;

    // Upload attachment if any
    const fileInput = document.getElementById("pur-attachment");
    const file = fileInput ? fileInput.files[0] : null;
    let attachmentUrl = "";

    if (file) {
      btn.textContent = "⏳ جارٍ رفع المرفق…";
      try {
        const storageRef = ref(storage, `companies/${COMPANY_ID}/purchases/${invNum}_${file.name}`);
        const uploadSnap = await uploadBytes(storageRef, file);
        attachmentUrl = await getDownloadURL(uploadSnap.ref);
      } catch (e) {
        console.warn("Storage upload failed, saving without attachment:", e);
        if (!confirm("⚠️ فشل رفع المرفق. هل تريد الاستمرار بحفظ الفاتورة بدون مرفق؟")) {
          btn.disabled = false;
          btn.textContent = "💾 حفظ وإنشاء قيد";
          return;
        }
      }
    }
    // Auto-generate batchNumber for any line missing it (Phase 2: Lot/Batch Tracking)
    purchaseLines.forEach((l, idx) => {
      if (!l.batchNumber || !l.batchNumber.trim()) {
        const pCode = (l.sku || l.productId || "P").slice(-4).toUpperCase();
        const dStr = (invDate || todayString()).replace(/-/g, "").slice(2);
        l.batchNumber = `LOT-${dStr}-${pCode}-${idx + 1}`;
      }
    });

    const data = {
      invoiceType:    invoiceType,
      isTaxExempt:    isInvoiceNonTax,
      number:         invNum,
      date:           invDate,
      dueDate:        dueDate || "",
      refNumber:      refNum,
      supplierId,
      supplierName,
      supplierVatNumber: supplierVat,
      warehouseId,
      warehouseName,
      lines:          purchaseLines,
      grossSubtotal:  grossSubtotal,
      subtotal:       netTaxableBase + netExemptBase,
      taxableSubtotal: netTaxableBase,
      exemptSubtotal:  netExemptBase,
      lineDiscountTotal: lineDiscountTotal,
      globalDiscountType: gType,
      globalDiscountVal: gVal,
      globalDiscountAmount: globalDiscountAmt,
      discountTotal:  totalDiscount,
      freightCharge:  freight,
      totalVat:       vatTotal,
      totalWithVat:   grandTotal,
      totalBonusQty:  totalBonusQty,
      totalPurchasedQty: totalPurchasedQty,
      paymentMethod:  payment,
      status:         payment === "cash" ? "paid" : "posted",
      notes,
      attachmentUrl,
    };

    // 1. Save/Update invoice
    let invId = window._editingPurchaseId;
    let oldSupplierId = null;
    const oldStockQtyByProd = {};

    if (invId) {
      const oldInv = await getById("purchaseInvoices", invId);
      if (oldInv) {
        oldSupplierId = oldInv.supplierId;
        // Build old quantities map by product ID
        for (const line of oldInv.lines || []) {
          if (!line.productId) continue;
          const oldFactor = (line.altUnit && line.unitFactor > 1 && line.selectedUnit === line.altUnit)
            ? (parseFloat(line.unitFactor) || 1)
            : 1;
          const oldPhysQty = ((parseFloat(line.qty) || 0) * oldFactor) + (parseFloat(line.bonusQty) || 0);
          oldStockQtyByProd[line.productId] = (oldStockQtyByProd[line.productId] || 0) + oldPhysQty;
        }

        // Clean up old transactions and payments
        await cleanupPurchaseAssociatedTransactions(oldInv);

        // Delete ALL linked journal entries (main + COGS) before recreating
        const searchKeys = Array.from(new Set([invId, oldInv.id, oldInv.invoiceNumber, oldInv.number].filter(Boolean)));
        for (const sType of ["purchaseInvoice", "purchase", "purchaseCOGS"]) {
          for (const sKey of searchKeys) {
            try {
              const jeSnap = await getDocs(
                query(collection(db, `companies/${COMPANY_ID}/journalEntries`),
                  where("sourceType", "==", sType),
                  where("sourceId",   "==", sKey))
              );
              for (const jeDoc of jeSnap.docs) {
                await deleteJournalEntry(jeDoc.id);
                console.log(`[purchaseEdit] Deleted JE ${jeDoc.id} (${sType}) for ${sKey}`);
              }
            } catch (jeErr) {
              console.warn(`[purchaseEdit] JE cleanup (${sType}/${sKey}) skipped:`, jeErr.message);
            }
          }
        }
        if (oldInv.journalEntryId && typeof oldInv.journalEntryId === "string") {
          try { await deleteJournalEntry(oldInv.journalEntryId); } catch (_) {}
        }
      }
      await update("purchaseInvoices", invId, data);
    } else {
      const invRef = await create(COLS.purchaseInvoices(), data);
      invId  = typeof invRef === "string" ? invRef : invRef.id;
    }

    if (file) {
      window.uploadFileToArchive(file, "purchase_invoices", invId, `مرفق فاتورة شراء رقم ${invNum}`).catch(e => console.warn(e));
    }

    // 2. Adjust stock for each line using net quantity delta (only if quantities actually changed!)
    let stockOk = 0;
    let stockFail = 0;

    // Collect all unique products in this invoice
    const newStockQtyByProd = {};
    for (const line of purchaseLines) {
      if (!line.productId) continue;
      const factor = (line.altUnit && line.unitFactor > 1 && line.selectedUnit === line.altUnit)
        ? (parseFloat(line.unitFactor) || 1)
        : 1;
      const physicalQty = ((parseFloat(line.qty) || 0) * factor) + (parseFloat(line.bonusQty) || 0);
      newStockQtyByProd[line.productId] = (newStockQtyByProd[line.productId] || 0) + physicalQty;
    }

    // Combine all products from old and new
    const allProdIds = new Set([...Object.keys(oldStockQtyByProd), ...Object.keys(newStockQtyByProd)]);

    for (const pid of allProdIds) {
      const newQty = newStockQtyByProd[pid] || 0;
      const oldQty = oldStockQtyByProd[pid] || 0;
      const netDelta = newQty - oldQty;

      if (netDelta === 0) {
        console.log(`[adjustStock] ℹ️ Quantity unchanged for product ${pid} (Qty: ${newQty}). Skipping stock delta.`);
        continue;
      }

      const line = purchaseLines.find(l => l.productId === pid) || {};
      try {
        await adjustStock(warehouseId, pid, netDelta, {
          type:          netDelta > 0 ? "purchase_in" : "purchase_reverse_edit",
          sourceType:    "purchaseInvoice",
          sourceId:      invId,
          documentNumber: invNum,
          invoiceNumber: invNum,
          purchasePrice: line.unitPrice || 0,
          batchNumber:   line.batchNumber || "",
          expiryDate:    line.expiryDate  || "",
          sku:           line.sku         || "",
          productName:   line.productName || "",
          notes:         invId ? `تعديل فاتورة الشراء ${invNum} (الفارق الصافي: ${netDelta})` : `فاتورة شراء جديدة ${invNum}`
        });
        stockOk++;
        console.log(`[adjustStock] ✅ Product ${pid} net stock delta: ${netDelta > 0 ? '+' : ''}${netDelta} in ${warehouseId}`);
      } catch (stockErr) {
        stockFail++;
        console.error(`[adjustStock] ❌ Failed for product ${pid}:`, stockErr.message);
      }
    }
    if (stockFail > 0) {
      window.showToast?.(`⚠️ تحديث المخزون: ${stockOk} صنف نجح، ${stockFail} فشل`, "warn");
    }

    // ─── تحديث آخر سعر شراء + المتوسط المرجح (WACC) لكل صنف ────────────
    // يضمن هذا تطابق قيمة المخزون في الأصناف مع شجرة الحسابات
    try {
      const { getDoc, updateDoc, doc: fsDoc, serverTimestamp: fsST } =
        await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
      const stockDocs = await getAll(COLS.stockByWarehouse());
      // بناء map إجمالي الكمية الحالية لكل منتج (من كل المستودعات)
      const currentQtyMap = {};
      stockDocs.forEach(d => {
        if (d.productId) currentQtyMap[d.productId] = (currentQtyMap[d.productId] || 0) + (d.qty || 0);
      });

      const priceChangeItems = [];
      for (const line of purchaseLines) {
        const qty = parseFloat(line.qty) || 0;
        const bonus = parseFloat(line.bonusQty) || 0;
        const physicalQty = qty + bonus;
        if (!line.productId || physicalQty <= 0 || !line.unitPrice) continue;

        try {
          const prodRef = fsDoc(db, `companies/${COMPANY_ID}/products`, line.productId);
          const prodSnap = await getDoc(prodRef);
          if (!prodSnap.exists()) continue;
          const prod = prodSnap.data();

          // صافي تكلفة البند الفعلي بعد الخصم الموزع والبونص المجاني
          const lineGross = qty * line.unitPrice;
          const lineDisc = lineGross * ((parseFloat(line.discount) || 0) / 100);
          const lineAfterLineDisc = lineGross - lineDisc;
          const globalDiscPortion = subtotalAfterLineDiscounts > 0 ? (lineAfterLineDisc / subtotalAfterLineDiscounts) * globalDiscountAmt : 0;
          const netLinePaid = Math.max(0, lineAfterLineDisc - globalDiscPortion);
          const effectiveNetUnitPrice = physicalQty > 0 ? (netLinePaid / physicalQty) : line.unitPrice;

          const totalQty    = Math.max(physicalQty, (currentQtyMap[line.productId] || 0) + physicalQty);
          const oldQty      = Math.max(0, totalQty - physicalQty);
          const oldAvg      = Number(prod.avgCostPrice || prod.costPrice || prod.purchasePrice || 0);

          // المتوسط المرجح: (قديم × كمية قديمة + جديد × كمية جديدة) ÷ (قديمة + جديدة)
          const newAvg = (oldQty + physicalQty) > 0
            ? ((oldAvg * oldQty) + (effectiveNetUnitPrice * physicalQty)) / (oldQty + physicalQty)
            : effectiveNetUnitPrice;

          const oldLastPur = Number(prod.lastPurchasePrice || prod.purchasePrice || prod.costPrice || 0);
          const roundedNewCost = Math.round(effectiveNetUnitPrice * 100) / 100;

          await updateDoc(prodRef, {
            lastPurchasePrice: roundedNewCost,
            lastPurchaseDate:  invDate,
            lastSupplierName:  supplierName || "",
            avgCostPrice:      Math.round(newAvg * 100) / 100, // تقريب لخانتين عشريتين
            updatedAt:         fsST(),
          });
          console.log(`[WACC] ${line.productName}: netPrice ${effectiveNetUnitPrice.toFixed(2)}, avg ${oldAvg} → ${newAvg.toFixed(2)} (qty ${oldQty}+${physicalQty})`);

          // ── تجميع الأصناف لمعالج مراجعة واعتماد أسعار البيع الجديدة ──
          const currentSellPrice = Number(prod.sellingPrice || prod.salePrice || prod.priceRetail || 0);
          let targetMargin = parseFloat(prod.targetMarginPct);
          const marginType = prod.marginType || "markup";

          if (isNaN(targetMargin) || targetMargin <= 0) {
            if (currentSellPrice > 0 && oldLastPur > 0) {
              targetMargin = marginType === "margin"
                ? Math.round(((currentSellPrice - oldLastPur) / currentSellPrice) * 1000) / 10
                : Math.round(((currentSellPrice - oldLastPur) / oldLastPur) * 1000) / 10;
            } else {
              targetMargin = 15; // افتراضي 15%
            }
          }

          // إذا تغيرت التكلفة أو كان الصنف بدون سعر بيع
          if (Math.abs(roundedNewCost - oldLastPur) >= 0.01 || currentSellPrice <= 0) {
            let suggestedPrice = 0;
            if (marginType === "margin" && targetMargin < 100) {
              suggestedPrice = Math.round((roundedNewCost / (1 - (targetMargin / 100))) * 100) / 100;
            } else {
              suggestedPrice = Math.round((roundedNewCost * (1 + (targetMargin / 100))) * 100) / 100;
            }

            priceChangeItems.push({
              productId: line.productId,
              productName: line.productName || prod.name || prod.nameAr || "صنف",
              sku: prod.sku || "",
              unit: line.unit || prod.unit || "Piece",
              oldCost: oldLastPur,
              newCost: roundedNewCost,
              currentSellingPrice: currentSellPrice,
              targetMarginPct: targetMargin,
              marginType: marginType,
              suggestedSellingPrice: suggestedPrice,
              newSellingPrice: suggestedPrice,
              taxCategory: prod.taxCategory || "S",
              selected: true
            });
          }
        } catch (prodErr) {
          console.warn(`[WACC] Failed to update costPrice for ${line.productId}:`, prodErr.message);
        }
      }
    } catch (waccErr) {
      console.warn("[WACC] Cost price update block failed:", waccErr.message);
    }

    // ─── Automated Accounting Engine (Purchase) ───
    try {
      const warehouses = await getAll(COLS.warehouses());
      const rawJeId = await autoPurchaseJE({
        id:            invId,
        invoiceNumber: invNum,
        date:          invDate,
        supplierId:    supplierId,
        supplierName:  supplierName,
        paymentMethod: payment,
        subtotal:      netTaxableBase + netExemptBase,
        taxAmount:     vatTotal,
        total:         grandTotal,
        warehouseId,
      }, window._purchaseUser || {}, warehouses);
      const jeId = typeof rawJeId === "object" && rawJeId ? (rawJeId.id || String(rawJeId)) : String(rawJeId);
      await update("purchaseInvoices", invId, { journalEntryId: jeId, journalEntryError: null });
    } catch(jeErr) {
      console.error("[AccountingEngine] Purchase JE failed:", jeErr.message);
      try { await update("purchaseInvoices", invId, { journalEntryError: jeErr.message, journalEntryId: null }); } catch(_){}
      window.showToast?.("⚠️ تم حفظ فاتورة الشراء لكن القيد المحاسبي فشل — " + jeErr.message, "warn");
    }

    // ─── Auto Cash Box: خصم من الصندوق إذا كان الدفع نقداً ───
    if (payment === "cash" || payment === "نقدي") {
      try {
        await autoCashTransaction({
          type:       "out",
          amount:     grandTotal,
          notes:      `شراء نقدي — فاتورة ${invNum} — ${supplierName}`,
          sourceType: "purchaseInvoice",
          sourceId:   invId,
          date:       invDate,
        });
      } catch (cashErr) {
        console.warn("[autoCashTransaction] Cash box update failed:", cashErr.message);
      }
    }

    // ─── Auto Bank: اخصم من البنك إذا كان الدفع بالتحويل أو الشيك ───
    if (["transfer", "bank", "cheque", "check", "تحويل", "شيك"].includes(payment)) {
      try {
        await autoBankTransaction({
          type:       "out",
          amount:     grandTotal,
          notes:      `شراء — فاتورة ${invNum} — ${supplierName}`,
          sourceType: "purchaseInvoice",
          sourceId:   invId,
          date:       invDate,
        });
      } catch (bankErr) {
        console.warn("[autoBankTransaction] Bank update failed:", bankErr.message);
      }
    }

    // Update Supplier balance on client side (since Cloud Functions are disabled on Spark plan)
    const unpaidAmount = grandTotal - (payment === "cash" ? grandTotal : 0);
    if (supplierId && unpaidAmount > 0) {
      try {
        const { increment, updateDoc, doc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
        const suppRef = doc(db, `companies/${COMPANY_ID}/suppliers`, supplierId);
        await updateDoc(suppRef, {
          balance: increment(unpaidAmount),
          updatedAt: serverTimestamp()
        });
        console.log(`[SupplierBalance] Client-side incremented supplier ${supplierId} balance by +${unpaidAmount}`);
      } catch (suppErr) {
        console.warn("Failed to update supplier balance on client:", suppErr.message);
      }
    }

    const successMsg = window._editingPurchaseId ? `✅ تم تحديث فاتورة الشراء ${invNum} بنجاح` : `✅ تم حفظ فاتورة الشراء ${invNum} وإنشاء القيد المحاسبي`;
    window._editingPurchaseId = null;

    window.showToast(successMsg, "success");
    closeModal("purchase-modal");
    purchaseLines = [];
    await loadPurchaseList();

    if (supplierId) {
      import("../utils/balance-sync.js").then(m => m.recalculateSupplierBalance(supplierId)).catch(e => console.warn(e));
    }
    if (oldSupplierId && oldSupplierId !== supplierId) {
      import("../utils/balance-sync.js").then(m => m.recalculateSupplierBalance(oldSupplierId)).catch(e => console.warn(e));
    }

    // ── تشغيل معالج مراجعة واعتماد أسعار البيع إذا تغيرت التكلفة ──
    if (priceChangeItems.length > 0) {
      setTimeout(() => {
        window.openPriceUpdateWizard(priceChangeItems);
      }, 350);
    }

  } catch (err) {
    errEl.textContent = "خطأ: " + err.message;
    errEl.classList.remove("hidden");
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.textContent = "💾 حفظ وإنشاء قيد";
  }
};

window.editPurchaseInvoice = async (id) => {
  try {
    const inv = await getById("purchaseInvoices", id);
    if (!inv) { window.showToast("لم يتم العثور على الفاتورة", "error"); return; }

    window._editingPurchaseId = id;

    // Set form fields
    document.getElementById("pur-inv-number").value = inv.number;
    document.getElementById("pur-ref-num").value = inv.refNumber || "";
    document.getElementById("pur-notes").value = inv.notes || "";
    document.getElementById("pur-supplier-vat").value = inv.supplierVatNumber || "";
    document.getElementById("pur-inv-date").value = inv.date || "";
    document.getElementById("pur-due-date").value = inv.dueDate || "";
    document.getElementById("pur-payment").value = inv.paymentMethod || "credit";

    // Set supplier
    document.getElementById("supplier-id").value = inv.supplierId || "";
    document.getElementById("supplier-search").value = inv.supplierName || "";

    // Set warehouse
    const whSel = document.getElementById("pur-warehouse");
    if (whSel) whSel.value = inv.warehouseId || "";

    // Set invoice type
    const invType = inv.invoiceType || (inv.isTaxExempt || (inv.totalVat === 0 && inv.exemptSubtotal > 0) ? "non_tax" : "taxable");
    if (typeof window.setPurchaseInvoiceType === "function") {
      window.setPurchaseInvoiceType(invType);
    }

    // Set global discount & freight values
    if (document.getElementById("pur-global-discount-type")) {
      document.getElementById("pur-global-discount-type").value = inv.globalDiscountType || inv.discountType || (inv.discountPercent ? "pct" : "pct");
    }
    if (document.getElementById("pur-global-discount-val")) {
      const discVal = inv.globalDiscountVal !== undefined ? inv.globalDiscountVal : (inv.discountValue !== undefined ? inv.discountValue : (inv.discountPercent !== undefined ? inv.discountPercent : (inv.globalDiscountAmount || inv.discountTotal || 0)));
      document.getElementById("pur-global-discount-val").value = discVal || "";
    }
    if (document.getElementById("pur-freight-val")) {
      document.getElementById("pur-freight-val").value = inv.freightCharge || inv.freight || inv.freightAmount || "";
    }

    // Set lines
    purchaseLines = (inv.lines || []).map(line => ({
      productId:   line.productId,
      productName: line.productName,
      sku:         line.sku         || "",
      unit:        line.unit        || "PCS",
      qty:         line.qty         || 0,
      bonusQty:    line.bonusQty    || 0,
      unitPrice:   line.unitPrice   || 0,
      discount:    line.discount    || 0,
      taxCategory: invType === "non_tax" ? "E" : (line.taxCategory || "S"),
      batchNumber: line.batchNumber || "",
      expiryDate:  line.expiryDate  || ""
    }));

    renderPurLines();
    updatePurTotals();

    // Change Save Button Text
    const btn = document.getElementById("save-pur-btn");
    if (btn) btn.textContent = "💾 تحديث فاتورة الشراء";
    document.getElementById("pur-modal-title").textContent = "📦 تعديل فاتورة شراء";

    openModal("purchase-modal");
  } catch (err) {
    window.showToast("خطأ: " + err.message, "error");
  }
};

// ────────────────────────────────────────────────
// VIEW INVOICE
// ────────────────────────────────────────────────
window.viewPurchaseInvoice = async (id) => {
  const body  = document.getElementById("view-pur-body");
  const title = document.getElementById("view-pur-title");
  body.innerHTML = `<div class="page-loading" style="min-height:120px;"><div class="loading-spinner"></div></div>`;
  openModal("view-purchase-modal");
  currentInvoice = null;

  try {
    const invRef = doc(db, `companies/${COMPANY_ID}/purchaseInvoices`, id);
    const snap   = await getDoc(invRef);
    if (!snap.exists()) throw new Error("الفاتورة غير موجودة");
    const inv = { id: snap.id, ...snap.data() };
    currentInvoice = inv;
    const isNonTax = inv.invoiceType === "non_tax" || inv.isTaxExempt || (inv.totalVat === 0 && (inv.exemptSubtotal > 0 || (inv.totalWithVat > 0 && inv.totalVat === 0)));
    title.textContent = isNonTax ? `فاتورة شراء غير ضريبية: ${inv.number || id}` : `فاتورة شراء: ${inv.number || id}`;

    // Hide pay button if paid/cancelled
    const payBtn = document.getElementById("pur-pay-btn");
    const cancelBtn = document.getElementById("pur-cancel-btn");
    if (payBtn) payBtn.style.display = (inv.status === "paid" || inv.status === "cancelled") ? "none" : "";
    if (cancelBtn) cancelBtn.style.display = inv.status === "cancelled" ? "none" : "";

    const lines = (inv.lines || []).map((l, i) => {
      const tot = calcLineTotal(l.qty, l.unitPrice, l.discount);
      const isTaxable = !isNonTax && (l.taxCategory === "S" || l.taxCategory === "standard");
      const vat = isTaxable ? tot * 0.15 : 0;
      return `<tr>
        <td style="padding:7px 12px;">${i+1}</td>
        <td style="padding:7px 12px;" class="mono">${l.sku||"—"}</td>
        <td style="padding:7px 12px; font-weight:600;">${l.productName}</td>
        <td style="padding:7px 12px;">${l.unit||"—"}</td>
        <td style="padding:7px 12px;" class="mono">${l.qty}</td>
        <td style="padding:7px 12px;" class="mono">${formatCurrency(l.unitPrice)}</td>
        <td style="padding:7px 12px;" class="mono">${l.discount||0}%</td>
        <td style="padding:7px 12px;" class="mono ${isNonTax ? 'text-good' : 'text-warn'}">${isNonTax ? '0% (معفى)' : formatCurrency(vat)}</td>
        <td style="padding:7px 12px;" class="mono font-bold">${formatCurrency(tot + vat)}</td>
      </tr>`;
    }).join("");

    body.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
        <div>
          <div class="grid-2 gap-12">
            <div><div class="section-label mb-6">رقم الفاتورة</div><div class="mono text-indigo font-bold text-xl">${inv.number}</div></div>
            <div><div class="section-label mb-6">الحالة والنوع</div>
              ${getInvoiceStatusBadge(inv.status)}
              ${isNonTax ? '<span class="badge" style="background:rgba(16,185,129,0.12); color:#059669; font-size:10px; font-weight:700; border:1px solid rgba(16,185,129,0.25); margin-right:4px;">🟢 غير ضريبية</span>' : '<span class="badge" style="background:rgba(99,102,241,0.08); color:var(--brand); font-size:10px; font-weight:700; border:1px solid rgba(99,102,241,0.2); margin-right:4px;">🏢 ضريبية 15%</span>'}
            </div>
            <div><div class="section-label mb-6">المورد</div><div class="font-semibold">${inv.supplierName}</div></div>
            <div><div class="section-label mb-6">المخزن</div><div>${inv.warehouseName||"—"}</div></div>
            <div><div class="section-label mb-6">التاريخ</div><div>${formatDate(inv.date || inv.createdAt)}</div></div>
            <div><div class="section-label mb-6">طريقة الدفع</div><div>${inv.paymentMethod === "credit" ? "آجل" : inv.paymentMethod === "cash" ? "نقدي" : inv.paymentMethod}</div></div>
            ${inv.refNumber ? `<div><div class="section-label mb-6">مرجع المورد</div><div class="mono">${inv.refNumber}</div></div>` : ""}
            ${inv.journalEntryId ? `<div><div class="section-label mb-6">رقم القيد</div><span class="badge good">✓ مُرحَّل</span></div>` : ""}
            ${inv.attachmentUrl ? `<div style="grid-column: span 2;"><div class="section-label mb-6">المرفق (فاتورة المورد)</div><a href="${inv.attachmentUrl}" target="_blank" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:6px;width:fit-content;padding:6px 12px;background:var(--primary-dim);color:var(--primary);border-color:var(--primary);">📎 فتح الفاتورة المرفقة</a></div>` : ""}
          </div>
        </div>
        <div style="background:var(--bg-2); border-radius:8px; padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div class="invoice-total-row"><span>المجموع قبل الضريبة</span><span class="mono">${formatCurrency(inv.subtotal||0)}</span></div>
            ${inv.discountTotal > 0 ? `<div class="invoice-total-row"><span>الخصومات</span><span class="mono text-bad">- ${formatCurrency(inv.discountTotal)}</span></div>` : ""}
            <div class="invoice-total-row"><span>${isNonTax ? 'ضريبة القيمة المضافة (0% معفى)' : 'VAT 15%'}</span><span class="mono ${isNonTax ? 'text-good' : 'text-warn'}">${isNonTax ? '0.00 ر.س' : formatCurrency(inv.totalVat||0)}</span></div>
            <div class="invoice-total-row grand-total"><span>الإجمالي</span><span class="mono text-brand">${formatCurrency(inv.totalWithVat||0)}</span></div>
          </div>
          <div style="margin-top:16px; border-top:1px solid var(--border-soft); padding-top:12px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <div>
              ${inv.status === "pending" ? `
                <button class="btn btn-sm" onclick="markPurchaseAsPaidManually('${inv.id}')" style="background:#047857; color:#fff; border:none; padding:6px 12px; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
                  🟢 تعيين كمدفوعة (مسددة بسند)
                </button>
              ` : ""}
            </div>
            <div style="display:flex; gap:8px;">
              ${inv.status !== "cancelled" ? `
                <button class="btn btn-sm btn-secondary" onclick="closeModal('view-purchase-modal'); editPurchaseInvoice('${inv.id}')" style="display:inline-flex; align-items:center; gap:6px;">
                  ✏️ تعديل
                </button>
              ` : ""}
              <button class="btn btn-sm btn-primary" onclick="convertPurchaseToSaleInvoice('${inv.id}')" style="background:linear-gradient(135deg,#10B981,#059669); color:#fff; border:none; padding:6px 12px; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
                📄 تحويل لبيع
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="table-container">
        <table class="data-dense">
          <thead><tr>
            <th>#</th><th>الكود</th><th>الصنف</th><th>الوحدة</th>
            <th>الكمية</th><th>السعر</th><th>خصم%</th><th>VAT</th><th>الإجمالي</th>
          </tr></thead>
          <tbody>${lines}</tbody>
        </table>
      </div>
      ${inv.notes ? `<div class="mt-16" style="padding:12px; background:var(--bg-2); border-radius:6px; font-size:13px;"><strong>ملاحظات:</strong> ${inv.notes}</div>` : ""}
    `;
  } catch (err) {
    body.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
};

// ────────────────────────────────────────────────
// ACTIONS
// ────────────────────────────────────────────────
window.cancelPurchaseInvoice = async (id) => {
  if (!await window.showConfirm("إلغاء هذه الفاتورة؟ سيتم عكس حركة المخزون وحذف القيود المحاسبية.", "تأكيد الإلغاء")) return;
  try {
    const { getDoc, doc: fsDoc, collection: fsColl, getDocs: fsGetDocs, query: fsQuery, where: fsWhere }
      = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");

    const invSnap = await getDoc(fsDoc(db, `companies/${COMPANY_ID}/purchaseInvoices`, id));
    if (!invSnap.exists()) { window.showToast("الفاتورة غير موجودة", "error"); return; }
    const invData = invSnap?.data();
    const suppId  = invData?.supplierId;
    const sourceKey = invData.invoiceNumber || id;

    // ── 1. عكس المخزون لكل سطر ──
    const lines = invData.items || invData.lines || [];
    const warehouseId = invData.warehouseId;
    if (warehouseId && lines.length > 0) {
      for (const line of lines) {
        const productId = line.productId || line.id;
        const qty = parseFloat(line.qty || line.quantity || 0);
        if (productId && qty > 0) {
          try {
            await adjustStock(warehouseId, productId, -qty, "cancel_purchase",
              `إلغاء فاتورة مشتريات ${sourceKey}`, id);
          } catch (stockErr) {
            console.warn(`[cancelPurchaseInvoice] Stock reversal failed for ${productId}:`, stockErr.message);
          }
        }
      }
    }

    // ── 2. حذف القيود المحاسبية المرتبطة ──
    const JE_TYPES = ["purchaseInvoice", "purchase", "purchaseCOGS"];
    for (const sType of JE_TYPES) {
      try {
        const jeSnap = await fsGetDocs(fsQuery(
          fsColl(db, `companies/${COMPANY_ID}/journalEntries`),
          fsWhere("sourceType", "==", sType),
          fsWhere("sourceId",   "==", sourceKey)
        ));
        for (const jeDoc of jeSnap.docs) {
          await deleteJournalEntry(jeDoc.id);
          console.log(`[cancelPurchaseInvoice] Deleted JE ${jeDoc.id} (${sType})`);
        }
        if (sourceKey !== id) {
          const jeSnap2 = await fsGetDocs(fsQuery(
            fsColl(db, `companies/${COMPANY_ID}/journalEntries`),
            fsWhere("sourceType", "==", sType),
            fsWhere("sourceId",   "==", id)
          ));
          for (const jeDoc of jeSnap2.docs) { await deleteJournalEntry(jeDoc.id); }
        }
      } catch (jeErr) {
        console.warn(`[cancelPurchaseInvoice] JE cleanup (${sType}):`, jeErr.message);
      }
    }
    if (invData.journalEntryId) {
      try { await deleteJournalEntry(invData.journalEntryId); } catch (_) {}
    }

    // ── 3. تحديث الحالة ──
    await update("purchaseInvoices", id, { status: "cancelled", cancelledAt: new Date().toISOString() });

    // ── 4. إعادة حساب رصيد المورد ──
    if (suppId) {
      const { recalculateSupplierBalance } = await import("../utils/balance-sync.js");
      await recalculateSupplierBalance(suppId).catch(() => {});
    }

    window.showToast("✅ تم إلغاء الفاتورة وعكس المخزون والقيود", "success");
    await loadPurchaseList();
  } catch (err) {
    window.showToast("خطأ: " + err.message, "error");
  }
};

window.deletePurchaseInvoice = async (id, number) => {
  if (!await window.showConfirm(`هل أنت متأكد من حذف الفاتورة "${number}" نهائياً؟`, "تأكيد الحذف النهائي")) return;
  try {
    const { getById, remove } = await import("../utils/db.js");
    const inv = await getById("purchaseInvoices", id);
    if (!inv) throw new Error("لم يتم العثور على الفاتورة");

    // Clean up old transactions and payments
    await cleanupPurchaseAssociatedTransactions(inv);

    // Reverse stock — non-blocking (skip for cancelled invoices)
    if (inv.lines && inv.warehouseId && inv.status !== "cancelled") {
      for (const line of inv.lines) {
        try {
          await adjustStock(inv.warehouseId, line.productId, -(+line.qty), {
            type: "purchase_reverse",
            refId: inv.number,
            documentNumber: inv.number,
            invoiceNumber: inv.number,
            notes: `حذف فاتورة الشراء ${inv.number}`
          });
        } catch (e) {
          console.warn("Stock reverse skipped:", line.productId, e.message);
        }
      }
    }

    // Delete ALL linked journal entries (main + COGS) — non-blocking
    const purchDelKey = inv.invoiceNumber || inv.number || id;
    for (const sType of ["purchaseInvoice", "purchase", "purchaseCOGS"]) {
      try {
        const jeSnap = await getDocs(
          query(collection(db, `companies/${COMPANY_ID}/journalEntries`),
            where("sourceType", "==", sType),
            where("sourceId",   "==", purchDelKey))
        );
        for (const jeDoc of jeSnap.docs) {
          await deleteJournalEntry(jeDoc.id);
          console.log(`[deletePurchaseInvoice] Deleted JE ${jeDoc.id} (${sType}) for ${purchDelKey}`);
        }
      } catch (jeErr) {
        console.warn(`[deletePurchaseInvoice] JE cleanup (${sType}) skipped:`, jeErr.message);
      }
    }
    if (inv.journalEntryId) {
      try { await deleteJournalEntry(inv.journalEntryId); } catch (_) {}
    }

    // Delete the invoice
    await remove("purchaseInvoices", id);

    if (inv.supplierId) {
      const { recalculateSupplierBalance } = await import("../utils/balance-sync.js");
      await recalculateSupplierBalance(inv.supplierId);
    }

    window.showToast(`✅ تم حذف الفاتورة ${number} بنجاح`, "success");
    await loadPurchaseList();
  } catch (err) {
    window.showToast("خطأ في الحذف: " + err.message, "error");
    console.error("deletePurchaseInvoice error:", err);
  }
};

window.reapplyPurchaseStock = async () => {
  if (!currentInvoice) { window.showToast("لا توجد فاتورة مفتوحة", "error"); return; }
  const inv = currentInvoice;
  if (!inv.warehouseId) {
    window.showToast("⚠️ هذه الفاتورة لا تحتوي على مخزن — لا يمكن تحديث المخزون والقيود", "warn");
    return;
  }
  if (!inv.lines || inv.lines.length === 0) {
    window.showToast("لا توجد بنود في الفاتورة", "warn"); return;
  }
  const btn = document.getElementById("pur-restock-btn");
  if (btn) { btn.disabled = true; btn.textContent = "⌛ جارٍ التحديث…"; }

  let ok = 0, fail = 0;
  const errors = [];

  // 1. Reapply stock adjustment
  for (const line of inv.lines) {
    try {
      await adjustStock(inv.warehouseId, line.productId, +line.qty, {
        type:          "purchase_in",
        sourceType:    "purchaseInvoice",
        sourceId:      inv.id,
        documentNumber: inv.number,
        invoiceNumber: inv.number,
        purchasePrice: line.unitPrice,
        sku:           line.sku || "",
        productName:   line.productName || "",
        notes:         "إعادة تطبيق مخزون " + inv.number,
      });
      ok++;
    } catch(e) {
      console.warn("reapplyStock failed for", line.productName, e.message);
      errors.push(`${line.productName}: ${e.message}`);
      fail++;
    }
  }

  // 2. Generate and post Journal Entry
  let jeId = null;
  let accountingStatus = "لم يتم إنشاء القيد";
  try {
    const warehouses = await getAll(COLS.warehouses());
    // Auto purchase journal entry
    jeId = await autoPurchaseJE({
      id:            inv.id,
      invoiceNumber: inv.number,
      date:          inv.date,
      supplierId:    inv.supplierId,  // ← مطلوب لتحديد الحساب الفرعي للمورد
      supplierName:  inv.supplierName,
      paymentMethod: inv.paymentMethod,
      subtotal:      inv.subtotal,
      taxAmount:     inv.totalVat || inv.taxAmount || 0,
      total:         inv.totalWithVat || inv.total || 0,
      warehouseId:   inv.warehouseId,
    }, window._purchaseUser || {}, warehouses);

    // Save the JE id to the invoice doc
    await update("purchaseInvoices", inv.id, { journalEntryId: jeId });
    inv.journalEntryId = jeId; // update in memory too
    accountingStatus = `تم إنشاء القيد بنجاح برقم: ${jeId}`;
  } catch (jeErr) {
    console.error("[AccountingEngine] Failed to create JE:", jeErr);
    errors.push(`خطأ القيد: ${jeErr.message}`);
  }

  if (btn) { btn.disabled = false; btn.textContent = "🔄 تحديث المخزون والقيود"; }

  if (ok > 0 && jeId) {
    window.showToast(`✅ تم تحديث المخزون لـ ${ok} أصناف بنجاح. ${accountingStatus}`, "success");
    closeModal("view-purchase-modal");
    await loadPurchaseList();
  } else {
    window.showToast(`⚠️ تم تحديث ${ok} أصناف. فشل القيد: ${errors.join(", ")}`, "warn");
  }
};


window.cancelCurrentPurchase = async () => {
  if (!currentInvoice) return;
  closeModal("view-purchase-modal");
  await cancelPurchaseInvoice(currentInvoice.id);
};

window.registerPayment = async () => {
  if (!currentInvoice) return;
  const amtStr = prompt(`تسجيل دفعة لفاتورة ${currentInvoice.number}\nالمبلغ المستحق: ${formatCurrency(currentInvoice.totalWithVat)}\n\nأدخل المبلغ المدفوع:`);
  if (!amtStr) return;
  const amt = parseFloat(amtStr);
  if (isNaN(amt) || amt <= 0) { alert("مبلغ غير صحيح"); return; }

  const method = prompt("اختر طريقة السداد (نقدي / بنك):");
  if (!method) return;
  const isCash = method.includes("نقد") || method.toLowerCase().includes("cash");
  const isBank = method.includes("بنك") || method.toLowerCase().includes("bank") || method.toLowerCase().includes("transfer");

  if (!isCash && !isBank) {
    alert("طريقة دفع غير صالحة. يرجى كتابة 'نقدي' أو 'بنك'.");
    return;
  }

  try {
    const newStatus = amt >= currentInvoice.totalWithVat ? "paid" : "partial";
    await update("purchaseInvoices", currentInvoice.id, { status: newStatus, paidAmount: amt });

    // Auto record cash/bank outflow transaction
    if (isCash) {
      await autoCashTransaction({
        type:       "out",
        amount:     amt,
        notes:      `سداد فاتورة مشتريات آجل ${currentInvoice.number} — ${currentInvoice.supplierName}`,
        sourceType: "purchaseInvoice",
        sourceId:   currentInvoice.id,
        date:       currentInvoice.date || new Date().toISOString().split("T")[0],
      });
    } else {
      await autoBankTransaction({
        type:       "out",
        amount:     amt,
        notes:      `سداد فاتورة مشتريات آجل ${currentInvoice.number} — ${currentInvoice.supplierName}`,
        sourceType: "purchaseInvoice",
        sourceId:   currentInvoice.id,
        date:       currentInvoice.date || new Date().toISOString().split("T")[0],
      });
    }

    // Auto record automated accounting journal entry (JE) for payment
    let paymentJeId = "";
    try {
      const { autoSupplierPaymentJE } = await import("../utils/accounting-engine.js");
      paymentJeId = await autoSupplierPaymentJE({
        id:             currentInvoice.id,
        date:           currentInvoice.date || new Date().toISOString().split("T")[0],
        amount:         amt,
        supplierId:     currentInvoice.supplierId,  // ← مطلوب لتحديد الحساب الفرعي للمورد
        paymentMethod:  isCash ? "cash" : "bank",
        supplierName:   currentInvoice.supplierName,
        reference:      `PAY-${currentInvoice.number}`,
      }, window._purchaseUser || {});
      
      // Save payment JE ID to the invoice document
      await update("purchaseInvoices", currentInvoice.id, { paymentJournalEntryId: paymentJeId });
    } catch (jeErr) {
      console.warn("[AccountingEngine] Supplier payment JE failed:", jeErr.message);
    }

    // Auto deduct supplier balance
    if (currentInvoice.supplierId) {
      try {
        const { increment, updateDoc, doc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
        const suppRef = doc(db, `companies/${COMPANY_ID}/suppliers`, currentInvoice.supplierId);
        await updateDoc(suppRef, {
          balance: increment(-amt),
          updatedAt: serverTimestamp(),
        });
      } catch (suppErr) {
        console.warn("Supplier balance update failed:", suppErr.message);
      }
    }

    window.showToast("✅ تم تسجيل السداد وتوليد قيد اليومية وتحديث حساب المورد بنجاح", "success");
    closeModal("view-purchase-modal");
    await loadPurchaseList();
  } catch (err) {
    window.showToast("خطأ: " + err.message, "error");
  }
};

window.printPurchaseInvoice = async () => {
  if (!currentInvoice) return;
  await generatePurchasePDF(currentInvoice);
};

window.printPurchasePreview = async () => {
  // Build invoice data from current form
  const inv = {
    number: document.getElementById("pur-inv-number").value,
    date: document.getElementById("pur-inv-date").value,
    supplierName: document.getElementById("supplier-search").value,
    supplierVat: document.getElementById("pur-supplier-vat").value,
    warehouseName: document.getElementById("pur-warehouse").selectedOptions?.[0]?.text || "",
    notes: document.getElementById("pur-notes").value,
    items: purchaseLines,
    ...calcInvoiceTotals(purchaseLines),
  };
  await generatePurchasePDF(inv);
};

// ────────────────────────────────────────────────
// PURCHASE ORDER / RFQ PDF GENERATOR
// أمر شراء / طلب عرض سعر — يُرسل للمورد
// ────────────────────────────────────────────────
async function generatePurchasePDF(inv, isPO = false) {
  let company = {};
  try { company = JSON.parse(localStorage.getItem("idham_company") || "{}"); } catch(e) {}

  // Load from Firestore dynamically if available
  try {
    const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const [compSnap, logoSnap] = await Promise.all([
      getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company")),
      getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "logo"))
    ]);
    if (compSnap.exists()) {
      Object.assign(company, compSnap.data());
    }
    if (logoSnap.exists() && logoSnap.data().dataUrl) {
      company.logoUrl = logoSnap.data().dataUrl;
    }
  } catch(e) { console.warn("Failed to load company details for purchase PDF:", e); }

  const companyName = company.name || company.companyName || "إدهام للمواد الغذائية والتوزيع";
  const companyVAT  = company.vatNumber || company.vat || "";
  const companyPhone = company.phone || "";
  const companyEmail = company.email || "";
  const companyAddr  = [company.address, company.city, company.zip, company.country].filter(Boolean).join("، ") || "الرياض، المملكة العربية السعودية";
  const companyLogo = company.logoUrl || company.logoBase64 || company.logo || "";

  // Dynamic lookup of supplier details
  let sVat   = inv.supplierVat || inv.supplierVatNumber || "";
  let sPhone = inv.supplierPhone || "";
  let sAddr  = inv.supplierAddress || "";

  if (inv.supplierId) {
    try {
      const { getById } = await import("../utils/db.js");
      const supplierDoc = await getById("suppliers", inv.supplierId);
      if (supplierDoc) {
        sVat   = supplierDoc.vatNumber || supplierDoc.vat || sVat;
        sPhone = supplierDoc.phone || sPhone;
        sAddr  = supplierDoc.address || sAddr;
      }
    } catch (suppErr) {
      console.warn("[generatePurchasePDF] Supplier details lookup failed:", suppErr);
    }
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });

  const items = inv.items || inv.lines || [];
  let itemsHTML = "";
  let subtotal = 0, totalVat = 0;

  items.forEach((l, i) => {
    const lineTotal = (l.qty || 0) * (l.unitPrice || 0) * (1 - (l.discount || 0) / 100);
    const vat = l.taxCategory === "S" ? lineTotal * 0.15 : 0;
    subtotal += lineTotal;
    totalVat += vat;
    itemsHTML += `
      <tr>
        <td style="text-align:center;">${i + 1}</td>
        <td class="mono">${l.sku || "—"}</td>
        <td style="font-weight:600;">${l.productName || ""}</td>
        <td style="text-align:center;">${l.unit || "—"}</td>
        <td class="mono" style="text-align:center;">${l.qty}</td>
        <td class="mono">${Number(l.unitPrice || 0).toFixed(2)}</td>
        <td class="mono" style="text-align:center;">${l.discount || 0}%</td>
        <td class="mono">${lineTotal.toFixed(2)}</td>
      </tr>`;
  });

  const grandTotal = subtotal + totalVat;
  const isNonTax = inv.invoiceType === "non_tax" || inv.isTaxExempt || (inv.totalVat === 0 && (inv.exemptSubtotal > 0 || (inv.subtotal > 0 && inv.totalVat === 0)));
  const docTitle = isPO ? "أمر شراء / طلب عرض سعر" : (isNonTax ? "فاتورة مشتريات (غير ضريبية)" : "فاتورة مشتريات ضريبية");
  const docIcon = isPO ? "📋" : (isNonTax ? "🟢" : "📦");
  const docLabel = isPO ? "Purchase Order / RFQ" : (isNonTax ? "Non-Tax Purchase Invoice" : "Purchase Invoice");

  const printHTML = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${docTitle} — ${inv.number || ""}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4; margin: 15mm; }
    body { font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 11px; color: #000; direction: rtl; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .doc-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 15px; border-bottom: 3px solid ${isNonTax ? '#059669' : '#5B5CEB'}; margin-bottom: 20px; }
    .co-logo { max-height: 60px; max-width: 150px; object-fit: contain; background:#fff; padding:4px; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,0.1); }
    .company-info h1 { font-size: 18px; color: #1a1a2e; margin-bottom: 4px; }
    .company-info p { font-size: 10px; color: #555; line-height: 1.6; }
    .doc-badge { background: ${isNonTax ? '#059669' : '#5B5CEB'} !important; color: #fff !important; padding: 8px 20px; border-radius: 8px; font-size: 14px; font-weight: 700; text-align: center; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .doc-badge small { display: block; font-size: 9px; font-weight: 400; opacity: 0.8; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .info-box { background: #f8f9fc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; }
    .info-box h3 { font-size: 11px; color: ${isNonTax ? '#059669' : '#5B5CEB'}; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    .info-row { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 3px; }
    .info-row .label { color: #666; }
    .info-row .value { font-weight: 600; color: #000; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead th { background: #1a1a2e !important; color: #fff !important; padding: 8px 10px; font-size: 10px; font-weight: 600; text-align: right; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    tbody td { padding: 7px 10px; font-size: 10px; border-bottom: 1px solid #e5e7eb; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    .mono { font-family: 'IBM Plex Mono', monospace; direction: ltr; text-align: left; }
    .totals-box { float: left; width: 250px; background: #f8f9fc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; }
    .total-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; }
    .total-row.grand { border-top: 2px solid ${isNonTax ? '#059669' : '#5B5CEB'}; padding-top: 8px; margin-top: 8px; font-size: 14px; font-weight: 700; color: ${isNonTax ? '#059669' : '#5B5CEB'}; }
    .footer { clear: both; margin-top: 40px; padding-top: 15px; border-top: 1px solid #ddd; }
    .signatures { display: flex; justify-content: space-between; margin-top: 30px; }
    .sig-box { text-align: center; width: 150px; }
    .sig-line { border-top: 1px solid #999; margin-top: 40px; padding-top: 4px; font-size: 9px; color: #666; }
    ${isPO ? '.po-note { background: #FFF7ED; border: 1px solid #FDBA74; border-radius: 6px; padding: 10px; font-size: 10px; color: #92400E; margin-bottom: 15px; }' : ''}
    .terms { font-size: 9px; color: #666; margin-top: 15px; }
    .terms li { margin-bottom: 3px; }

    @media print {
      body { background:#fff; }
      .doc-badge { background: ${isNonTax ? '#059669' : '#5B5CEB'} !important; color: #fff !important; }
      thead th { background: #1a1a2e !important; color: #fff !important; }
    }
  </style>
</head>
<body>
  <div class="doc-header">
    <div style="display:flex; gap:15px; align-items:center;">
      ${companyLogo ? `<img class="co-logo" src="${companyLogo}" alt="الشعار">` : ""}
      <div class="company-info">
        <h1>${companyName}</h1>
        <p>📍 العنوان: <strong>${companyAddr}</strong></p>
        ${companyPhone ? `<p>📞 الهاتف: <strong>${companyPhone}</strong></p>` : ""}
        ${companyEmail ? `<p>✉️ البريد: <strong>${companyEmail}</strong></p>` : ""}
        ${companyVAT ? `<p>🔢 الرقم الضريبي: <strong>${companyVAT}</strong></p>` : ""}
      </div>
    </div>
    <div class="doc-badge">
      ${docIcon} ${docTitle}
      <small>${docLabel}</small>
      <div style="font-size:16px; margin-top:4px;">${inv.number || "—"}</div>
    </div>
  </div>

  ${isPO ? `<div class="po-note">
    ⚠️ هذا أمر شراء / طلب عرض سعر. يُرجى من المورد المذكور أدناه تأكيد الأسعار والكميات المتاحة والتوقيع والختم وإعادة هذه الوثيقة. صلاحية هذا الطلب <strong>7 أيام عمل</strong> من تاريخه.
  </div>` : ""}

  <div class="info-grid">
    <div class="info-box">
      <h3>بيانات ${isPO ? 'المورد المطلوب منه' : 'المورد'}</h3>
      <div class="info-row"><span class="label">اسم المورد:</span><span class="value">${inv.supplierName || "—"}</span></div>
      ${sVat ? `<div class="info-row"><span class="label">الرقم الضريبي:</span><span class="value mono">${sVat}</span></div>` : ""}
      ${sPhone ? `<div class="info-row"><span class="label">رقم الهاتف:</span><span class="value mono">${sPhone}</span></div>` : ""}
      ${sAddr ? `<div class="info-row"><span class="label">العنوان:</span><span class="value">${sAddr}</span></div>` : ""}
    </div>
    <div class="info-box">
      <h3>بيانات ${isPO ? 'الطلب' : 'الفاتورة'}</h3>
      <div class="info-row"><span class="label">التاريخ:</span><span class="value">${inv.date || dateStr}</span></div>
      <div class="info-row"><span class="label">المخزن المستلم:</span><span class="value">${inv.warehouseName || "—"}</span></div>
      ${inv.refNumber ? `<div class="info-row"><span class="label">مرجع المورد:</span><span class="value mono">${inv.refNumber}</span></div>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:30px; text-align:center;">#</th>
        <th>الكود</th>
        <th>اسم الصنف</th>
        <th style="text-align:center;">الوحدة</th>
        <th style="text-align:center;">الكمية${isPO ? ' المطلوبة' : ''}</th>
        <th>سعر الوحدة</th>
        <th style="text-align:center;">خصم%</th>
        <th>الصافي</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHTML}
    </tbody>
  </table>

  <div class="totals-box">
    <div class="total-row"><span>المجموع قبل الضريبة</span><span class="mono">${subtotal.toFixed(2)} ر.س</span></div>
    ${isNonTax ? `
      <div class="total-row"><span>ضريبة القيمة المضافة (0%)</span><span class="mono" style="color:#059669;">0.00 ر.س (معفى)</span></div>
    ` : `
      <div class="total-row"><span>ضريبة القيمة المضافة 15%</span><span class="mono">${totalVat.toFixed(2)} ر.س</span></div>
    `}
    <div class="total-row grand"><span>الإجمالي النهائي</span><span class="mono">${grandTotal.toFixed(2)} ر.س</span></div>
  </div>

  ${isNonTax ? `
    <div style="clear:both; margin-top:14px; padding:8px 12px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; font-size:10px; color:#166534; font-weight:600;">
      ℹ️ فاتورة مشتريات غير خاضعة لضريبة القيمة المضافة (0% VAT) وفقاً للوائح هيئة الزكاة والضريبة والجمارك (ZATCA).
    </div>
  ` : ''}

  ${inv.notes ? `<div style="clear:both; padding-top:15px;"><strong>ملاحظات:</strong> ${inv.notes}</div>` : '<div style="clear:both;"></div>'}

  ${isPO ? `
  <div class="terms">
    <strong>الشروط والأحكام:</strong>
    <ul>
      <li>يجب تأكيد هذا الطلب خلال 7 أيام عمل من تاريخه.</li>
      <li>يلتزم المورد بتوريد البضاعة وفقاً للمواصفات والكميات المذكورة.</li>
      <li>شروط الدفع: حسب الاتفاق المبرم بين الطرفين.</li>
      <li>أي تغيير في الأسعار أو الكميات يجب إخطارنا به كتابياً قبل التوريد.</li>
      <li>البضاعة المستلمة تخضع للفحص والقبول من قبل إدارة المخازن.</li>
    </ul>
  </div>
  ` : ""}

  <div class="signatures">
    <div class="sig-box">
      <div class="sig-line">المشتري / ${companyName}</div>
    </div>
    ${isPO ? `<div class="sig-box">
      <div class="sig-line">تأكيد المورد / الختم</div>
    </div>` : ""}
    <div class="sig-box">
      <div class="sig-line">المستلم / أمين المخزن</div>
    </div>
  </div>

  <div class="footer" style="text-align:center; font-size:8px; color:#aaa; margin-top:20px;">
    مُنشأ من نظام إدهام ERP — ${dateStr}
  </div>
</body>
</html>`;

  const printWin = window.open("", "_blank", "width=800,height=1000");
  printWin.document.write(printHTML);
  printWin.document.close();
  printWin.onload = () => setTimeout(() => printWin.print(), 500);
}

// ── Generate Purchase Order (PO/RFQ) from current form ──
window.generatePurchaseOrder = async () => {
  const supplierName = document.getElementById("supplier-search")?.value;
  if (!supplierName && !purchaseLines.length) {
    window.showToast("أضف المورد والأصناف أولاً ثم اضغط 'أمر شراء'", "info");
    openPurchaseModal();
    return;
  }

  const inv = {
    number: document.getElementById("pur-inv-number")?.value || "PO-" + Date.now(),
    date: document.getElementById("pur-inv-date")?.value || todayString(),
    supplierName: supplierName || "—",
    supplierVat: document.getElementById("pur-supplier-vat")?.value || "",
    warehouseName: document.getElementById("pur-warehouse")?.selectedOptions?.[0]?.text || "",
    notes: document.getElementById("pur-notes")?.value || "",
    items: purchaseLines,
  };
  await generatePurchasePDF(inv, true); // isPO = true
};

window.exportPurchaseCSV = async () => {
  try {
    const q = query(COLS.purchaseInvoices(), orderBy("createdAt","desc"), limit(500));
    const snap = await getDocs(q);
    const invs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const headers = ["رقم الفاتورة","التاريخ","المورد","المخزن","المجموع","VAT","الإجمالي","الحالة"];
    const rows = invs.map(i => [i.number, i.date||"", i.supplierName, i.warehouseName,
      i.subtotal||0, i.totalVat||0, i.totalWithVat||0, i.status]);
    const csv = "\uFEFF" + [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "purchase-invoices.csv";
    a.click();
  } catch(err) { window.showToast("خطأ: " + err.message, "error"); }
};

window.openPurchaseModalFromGRPO = async (data) => {
  purchaseLines = (data.items || []).map(item => ({
    productId:   item.productId,
    productName: item.productName,
    sku:         item.sku || "",
    unit:        item.unit || "PCS",
    qty:         item.qty || 0,
    unitPrice:   item.unitPrice || 0,
    discount:    0,
    taxCategory: "S",
    batchNumber: item.batchNumber || "",
    expiryDate:  item.expiryDate || ""
  }));
  
  renderPurLines();
  updatePurTotals();

  // Wait a small timeout to let the modal load the dropdown lists
  setTimeout(() => {
    const supSearch = document.getElementById("supplier-search");
    if (supSearch) supSearch.value = data.supplierName || "";
    
    const supId = document.getElementById("supplier-id");
    if (supId) supId.value = data.supplierId || "";
    
    const refNum = document.getElementById("pur-ref-num");
    if (refNum) refNum.value = data.grpoNumber ? `GRPO-${data.grpoNumber}` : "";
    
    const notes = document.getElementById("pur-notes");
    if (notes) notes.value = `محولة من إذن الاستلام رقم ${data.grpoNumber || ""}`;
    
    const waSel = document.getElementById("pur-warehouse");
    if (waSel && data.warehouseId) {
      waSel.value = data.warehouseId;
    }
  }, 300);

  document.getElementById("pur-inv-date").value = todayString();
  document.getElementById("pur-form-error").classList.add("hidden");
  document.getElementById("pur-modal-title").textContent = `📦 فاتورة شراء من إذن استلام ${data.grpoNumber || ""}`;
  document.getElementById("pur-inv-number").value = "جارِ التوليد...";

  // Open modal
  openModal("purchase-modal");

  // Load products and categories in background
  loadProductsAndCategories();

  // Generate invoice number
  try {
    const num = await generateInvoiceNumber("PUR");
    document.getElementById("pur-inv-number").value = num;
  } catch {}
};

window.convertPurchaseToSaleInvoice = async (id) => {
  try {
    const { getById } = await import("../utils/db.js");
    const inv = await getById("purchaseInvoices", id);
    if (!inv) { showToast("الفاتورة غير موجودة", "error"); return; }
    
    // Save to sessionStorage
    sessionStorage.setItem("convert_purchase_to_sale", JSON.stringify({
      purchaseInvoiceId: inv.id,
      purchaseNumber: inv.number,
      warehouseId: inv.warehouseId || "",
      items: (inv.lines || []).map(line => ({
        productId: line.productId,
        productName: line.productName,
        sku: line.sku || "",
        unit: line.unit || "PCS",
        qty: line.qty || 0,
        unitPrice: line.unitPrice || 0
      }))
    }));
    
    closeModal("view-purchase-modal");
    showToast("تم نسخ بنود الفاتورة بنجاح. يتم توجيهك الآن للمبيعات...", "success");
    
    if (typeof navigate === "function") {
      navigate("sales-invoices");
    }
  } catch (err) {
    showToast(err.message, "error");
  }
};

window.markPurchaseAsPaidManually = async (id) => {
  if (!await window.showConfirm("هل تريد تعيين الفاتورة كمدفوعة يدوياً؟ (سيتم تغيير الحالة فقط دون إنشاء قيد سداد مكرر)", "تأكيد التغيير")) return;
  try {
    const { update } = await import("../utils/db.js");
    await update("purchaseInvoices", id, { 
      status: "paid",
      paidAmount: currentInvoice?.totalWithVat || 0,
      manuallyPaid: true,
      updatedAt: new Date().toISOString()
    });
    window.showToast("✅ تم تعيين الفاتورة كمدفوعة يدوياً بنجاح", "success");
    closeModal("view-purchase-modal");
    await loadPurchaseList();
  } catch (err) {
    window.showToast("خطأ: " + err.message, "error");
  }
};

// ────────────────────────────────────────────────
// SMART TOOLBAR MODALS (PO / Quote / Delivery / Quick Product)
// ────────────────────────────────────────────────
window.openImportPOModal = async () => {
  try {
    const pos = await getAll(COLS.purchaseOrders ? COLS.purchaseOrders() : "purchaseOrders", [orderBy("createdAt", "desc")]).catch(() => []);
    const openPOs = pos.filter(p => p.status !== "received" && p.status !== "cancelled");

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay active";
    overlay.id = "import-po-overlay";
    overlay.style.zIndex = "1200";
    overlay.innerHTML = `
      <div class="modal modal-lg" style="max-width:700px; background:var(--bg-1); border-radius:16px;">
        <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <h3 class="modal-title" style="font-size:15px; font-weight:800; color:var(--brand); margin:0;">📋 استيراد بنود من أمر شراء (PO)</h3>
          <button class="modal-close" onclick="document.getElementById('import-po-overlay').remove()">×</button>
        </div>
        <div class="modal-body" style="padding:18px; max-height:60vh; overflow-y:auto;">
          ${!openPOs.length ? `<div style="text-align:center; padding:30px; color:var(--text-2);">لا توجد أوامر شراء نشطة بانتظار التوريد</div>` : `
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${openPOs.map(p => `
                <div class="card" style="padding:12px 16px; border:1px solid var(--border-soft); border-radius:10px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="window.applyPOToPurchase('${p.id}')">
                  <div>
                    <div class="font-bold" style="color:var(--brand);">${p.poNumber || p.id} — <span style="color:var(--text-0);">${p.supplierName}</span></div>
                    <div style="font-size:11.5px; color:var(--text-2); margin-top:2px;">التاريخ: ${p.date || '—'} • الأصناف: ${(p.lines||[]).length} • الإجمالي: <b>${formatCurrency(p.totalAmount||0)}</b></div>
                  </div>
                  <button class="btn btn-secondary btn-sm">استيراد ⬅️</button>
                </div>
              `).join("")}
            </div>
          `}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  } catch (e) {
    alert("خطأ: " + e.message);
  }
};

window.applyPOToPurchase = async (poId) => {
  try {
    const pos = await getAll(COLS.purchaseOrders ? COLS.purchaseOrders() : "purchaseOrders");
    const p = pos.find(x => x.id === poId);
    if (!p) return;

    if (p.supplierId) {
      window.selectPurSupplier(p.supplierId, p.supplierName, "");
    }
    if (p.warehouseId) {
      const whSel = document.getElementById("pur-warehouse");
      if (whSel) whSel.value = p.warehouseId;
    }
    if (p.paymentTerms) {
      const notesEl = document.getElementById("pur-notes");
      if (notesEl && !notesEl.value) notesEl.value = `شروط الدفع: ${p.paymentTerms}`;
    }

    if (p.lines && p.lines.length) {
      purchaseLines = p.lines.map(l => ({
        productId: l.productId,
        productName: l.productName || l.name,
        sku: l.sku || "",
        unit: l.unit || "كرتون",
        taxCategory: "S",
        qty: parseFloat(l.qty || 1),
        bonusQty: 0,
        unitPrice: parseFloat(l.unitPrice || 0),
        discount: 0,
        batchNumber: "",
        expiryDate: ""
      }));
      renderPurLines();
      updatePurTotals();
    }

    document.getElementById("import-po-overlay")?.remove();
    window.showToast?.("✅ تم استيراد بيانات أمر الشراء بنجاح", "success");
  } catch (e) {
    alert(e.message);
  }
};

window.openImportQuoteModal = async () => {
  try {
    const quotes = await getAll(COLS.supplierQuotations ? COLS.supplierQuotations() : "supplierQuotations", [orderBy("createdAt", "desc")]).catch(() => []);
    const openQuotes = quotes.filter(q => q.status !== "converted");

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay active";
    overlay.id = "import-quote-overlay";
    overlay.style.zIndex = "1200";
    overlay.innerHTML = `
      <div class="modal modal-lg" style="max-width:700px; background:var(--bg-1); border-radius:16px;">
        <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <h3 class="modal-title" style="font-size:15px; font-weight:800; color:var(--brand); margin:0;">📑 استيراد من عرض سعر مورد (Quotation)</h3>
          <button class="modal-close" onclick="document.getElementById('import-quote-overlay').remove()">×</button>
        </div>
        <div class="modal-body" style="padding:18px; max-height:60vh; overflow-y:auto;">
          ${!openQuotes.length ? `<div style="text-align:center; padding:30px; color:var(--text-2);">لا توجد عروض أسعار مسجلة</div>` : `
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${openQuotes.map(q => `
                <div class="card" style="padding:12px 16px; border:1px solid var(--border-soft); border-radius:10px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="window.applyQuoteToPurchase('${q.id}')">
                  <div>
                    <div class="font-bold" style="color:var(--brand);">${q.quoteNumber || q.id} — <span style="color:var(--text-0);">${q.supplierName}</span></div>
                    <div style="font-size:11.5px; color:var(--text-2); margin-top:2px;">التاريخ: ${q.date || '—'} • الأصناف: ${(q.lines||[]).length} • الإجمالي: <b>${formatCurrency(q.totalAmount||0)}</b></div>
                  </div>
                  <button class="btn btn-secondary btn-sm">استيراد ⬅️</button>
                </div>
              `).join("")}
            </div>
          `}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  } catch (e) {
    alert(e.message);
  }
};

window.applyQuoteToPurchase = async (quoteId) => {
  try {
    const quotes = await getAll(COLS.supplierQuotations ? COLS.supplierQuotations() : "supplierQuotations");
    const q = quotes.find(x => x.id === quoteId);
    if (!q) return;

    if (q.supplierId) {
      window.selectPurSupplier(q.supplierId, q.supplierName, "");
    }

    if (q.lines && q.lines.length) {
      purchaseLines = q.lines.map(l => ({
        productId: l.productId,
        productName: l.productName || l.name,
        sku: l.sku || "",
        unit: l.unit || "كرتون",
        taxCategory: "S",
        qty: parseFloat(l.qty || 1),
        bonusQty: 0,
        unitPrice: parseFloat(l.unitPrice || 0),
        discount: 0,
        batchNumber: "",
        expiryDate: ""
      }));
      renderPurLines();
      updatePurTotals();
    }

    document.getElementById("import-quote-overlay")?.remove();
    window.showToast?.("✅ تم استيراد عرض السعر بنجاح", "success");
  } catch (e) {
    alert(e.message);
  }
};

window.openImportDeliveryModal = async () => {
  try {
    const delivs = await getAll(COLS.supplierDeliveries ? COLS.supplierDeliveries() : "supplierDeliveries", [orderBy("expectedDate", "desc")]).catch(() => []);
    const activeDelivs = delivs.filter(d => d.status !== "received");

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay active";
    overlay.id = "import-deliv-overlay";
    overlay.style.zIndex = "1200";
    overlay.innerHTML = `
      <div class="modal modal-lg" style="max-width:700px; background:var(--bg-1); border-radius:16px;">
        <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <h3 class="modal-title" style="font-size:15px; font-weight:800; color:var(--brand); margin:0;">🚚 استيراد من شحنة واردة</h3>
          <button class="modal-close" onclick="document.getElementById('import-deliv-overlay').remove()">×</button>
        </div>
        <div class="modal-body" style="padding:18px; max-height:60vh; overflow-y:auto;">
          ${!activeDelivs.length ? `<div style="text-align:center; padding:30px; color:var(--text-2);">لا توجد شحنات واردة نشطة</div>` : `
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${activeDelivs.map(d => `
                <div class="card" style="padding:12px 16px; border:1px solid var(--border-soft); border-radius:10px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="window.applyDeliveryToPurchase('${d.id}')">
                  <div>
                    <div class="font-bold" style="color:var(--brand);">${d.shipmentNumber || d.id} — <span style="color:var(--text-0);">${d.supplierName}</span></div>
                    <div style="font-size:11.5px; color:var(--text-2); margin-top:2px;">الوصول: ${d.expectedDate || '—'} • الكراتين: ${d.cartonsCount || 0} • السائق: ${d.driverName || '—'}</div>
                  </div>
                  <button class="btn btn-secondary btn-sm">استيراد ⬅️</button>
                </div>
              `).join("")}
            </div>
          `}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  } catch (e) {
    alert("خطأ: " + e.message);
  }
};

window.applyDeliveryToPurchase = async (delivId) => {
  try {
    const delivs = await getAll(COLS.supplierDeliveries ? COLS.supplierDeliveries() : "supplierDeliveries");
    const d = delivs.find(x => x.id === delivId);
    if (!d) return;

    if (d.supplierId) {
      window.selectPurSupplier(d.supplierId, d.supplierName, "");
    }
    if (d.warehouseId) {
      const whSel = document.getElementById("pur-warehouse");
      if (whSel) whSel.value = d.warehouseId;
    }
    const notesEl = document.getElementById("pur-notes");
    if (notesEl) {
      notesEl.value = `شحنة رقم: ${d.shipmentNumber || d.id} | السائق: ${d.driverName || ''} (${d.driverPhone || ''}) | لوحة: ${d.truckPlate || ''}`;
    }

    document.getElementById("import-deliv-overlay")?.remove();
    window.showToast?.("✅ تم استيراد بيانات الشحنة بنجاح", "success");
  } catch (e) {
    alert(e.message);
  }
};

window.openQuickProductModal = () => {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "quick-prod-overlay";
  overlay.style.zIndex = "1300";
  overlay.innerHTML = `
    <div class="modal" style="max-width:520px; background:var(--bg-1); border-radius:16px;">
      <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
        <h3 class="modal-title" style="font-size:15px; font-weight:800; color:var(--brand); margin:0;">➕ إضافة صنف جديد سريع</h3>
        <button class="modal-close" onclick="document.getElementById('quick-prod-overlay').remove()">×</button>
      </div>
      <div class="modal-body" style="padding:20px;">
        <div class="form-group mb-12">
          <label>اسم الصنف والمواصفات *</label>
          <input type="text" id="quick-prod-name" class="input font-bold" placeholder="أرز بسمتي هندي 40 كجم..." />
        </div>
        <div class="grid-2 gap-12 mb-12">
          <div class="form-group">
            <label>الوحدة</label>
            <input type="text" id="quick-prod-unit" class="input" value="كرتون" />
          </div>
          <div class="form-group">
            <label>سعر الشراء التقديري (ر.س)</label>
            <input type="number" id="quick-prod-price" class="input mono font-bold" placeholder="0.00" min="0" step="0.5" />
          </div>
        </div>
        <div class="form-group">
          <label>الباركود (اختياري)</label>
          <input type="text" id="quick-prod-barcode" class="input mono" placeholder="628XXXXXXXXX" />
        </div>
        <div id="quick-prod-err" class="alert bad hidden mt-12"></div>
      </div>
      <div class="modal-footer" style="padding:12px 20px; border-top:1px solid var(--border-soft); display:flex; justify-content:space-between;">
        <button class="btn btn-secondary" onclick="document.getElementById('quick-prod-overlay').remove()">إلغاء</button>
        <button class="btn btn-primary" onclick="window.saveQuickProduct()">💾 حفظ وإضافة للفاتورة</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
};

window.saveQuickProduct = async () => {
  const err = document.getElementById("quick-prod-err");
  const name = document.getElementById("quick-prod-name")?.value.trim();
  const unit = document.getElementById("quick-prod-unit")?.value.trim() || "كرتون";
  const price = parseFloat(document.getElementById("quick-prod-price")?.value) || 0;
  const barcode = document.getElementById("quick-prod-barcode")?.value.trim() || "";

  if (!name) {
    if (err) { err.textContent = "يرجى كتابة اسم الصنف"; err.classList.remove("hidden"); }
    return;
  }

  try {
    const sku = "PRD-" + Date.now().toString().slice(-5);
    const prodData = {
      name,
      sku,
      unit,
      costPrice: price,
      purchasePrice: price,
      sellingPrice: price * 1.15,
      barcode,
      taxCategory: "S",
      createdAt: new Date().toISOString()
    };

    const newId = await create(COLS.products(), prodData);
    allProducts.push({ id: newId, ...prodData });

    // Add directly to invoice lines
    window.addPurLine(newId, name, price, unit, sku, "S");

    document.getElementById("quick-prod-overlay")?.remove();
    window.showToast?.("✅ تم إنشاء الصنف وإضافته للفاتورة", "success");
  } catch (e) {
    if (err) { err.textContent = e.message; err.classList.remove("hidden"); }
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// SMART PRICE-UPDATE REVIEW WIZARD (معالج مراجعة واعتماد أسعار البيع الجديدة)
// ══════════════════════════════════════════════════════════════════════════════
window._activePriceWizardItems = [];
window._activePriceWizardMode = "markup"; // 'markup' or 'margin'

window.openPriceUpdateWizard = (items) => {
  if (!items || items.length === 0) return;
  window._activePriceWizardItems = items;
  window._activePriceWizardMode = "markup";

  // Remove existing modal if any
  const oldModal = document.getElementById("price-wizard-overlay");
  if (oldModal) oldModal.remove();

  const upCount = items.filter(i => i.newCost > i.oldCost).length;
  const downCount = items.filter(i => i.newCost < i.oldCost).length;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "price-wizard-overlay";
  overlay.style.cssText = "z-index:9999; backdrop-filter:blur(5px); background:rgba(15,23,42,0.75); display:flex; align-items:center; justify-content:center;";

  overlay.innerHTML = `
    <div class="modal modal-xl" style="max-width:1100px; width:96vw; height:90vh; max-height:90vh; display:flex; flex-direction:column; border-radius:16px; overflow:hidden; box-shadow:0 25px 60px -15px rgba(0,0,0,0.6); background:var(--bg-1);">
      
      <!-- Wizard Header -->
      <div class="modal-header" style="background:linear-gradient(135deg, #1E1B4B, #3730A3); color:#fff; padding:14px 22px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); flex-shrink:0;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:40px; height:40px; border-radius:10px; background:rgba(255,255,255,0.18); display:flex; align-items:center; justify-content:center; font-size:20px; box-shadow:inset 0 0 10px rgba(255,255,255,0.2);">
            🏷️
          </div>
          <div>
            <h3 style="margin:0; font-size:15px; font-weight:900; color:#fff; display:flex; align-items:center; gap:8px;">
              معالج مراجعة واعتماد أسعار البيع الجديدة
              <span style="font-size:11px; background:#10B981; color:#fff; padding:2px 8px; border-radius:12px; font-weight:700;">تسعير ذكي بناءً على آخر شراء</span>
            </h3>
            <div style="font-size:11.5px; color:rgba(255,255,255,0.8); margin-top:2px;">
              تم رصد تغير في تكلفة شراء أصناف هذه الفاتورة • راجع الأسعار المقترحة واعتمدها بنقرة زر لحماية هامش أرباحك
            </div>
          </div>
        </div>
        <button class="modal-close" onclick="window.closePriceWizard()" style="color:#fff; opacity:0.8; font-size:22px; background:none; border:none; cursor:pointer;">×</button>
      </div>

      <!-- Quick Options & Batch Toolbar -->
      <div style="background:var(--bg-2); padding:10px 18px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; flex-shrink:0;">
        
        <!-- Stats Badges -->
        <div style="display:flex; align-items:center; gap:8px; font-size:12px;">
          <span class="badge" style="background:rgba(99,102,241,0.12); color:var(--brand); font-weight:800; font-size:11.5px; padding:4px 8px;">
            📦 ${items.length} أصناف تغيرت تكلفتها
          </span>
          ${upCount > 0 ? `<span class="badge" style="background:rgba(239,68,68,0.12); color:#DC2626; font-weight:800; font-size:11.5px; padding:4px 8px;">🔺 ${upCount} ارتفاع تكلفة</span>` : ''}
          ${downCount > 0 ? `<span class="badge" style="background:rgba(16,185,129,0.12); color:#059669; font-weight:800; font-size:11.5px; padding:4px 8px;">🔻 ${downCount} انخفاض تكلفة</span>` : ''}
        </div>

        <!-- Uniform Margin / Calculation Mode Tools -->
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          
          <div style="display:inline-flex; background:var(--bg-card); padding:2px; border-radius:8px; border:1px solid var(--border-soft); gap:2px;">
            <button type="button" id="wiz-mode-markup" class="btn btn-sm btn-primary" onclick="window.switchWizardMarginType('markup')" style="padding:3px 8px; font-size:11px; font-weight:800;">
              إضافة على التكلفة (Markup)
            </button>
            <button type="button" id="wiz-mode-margin" class="btn btn-sm btn-ghost" onclick="window.switchWizardMarginType('margin')" style="padding:3px 8px; font-size:11px; font-weight:800;">
              هامش من سعر البيع (Margin)
            </button>
          </div>

          <div style="display:flex; align-items:center; gap:6px; background:var(--bg-card); padding:3px 8px; border-radius:8px; border:1px solid var(--border-soft);">
            <span style="font-size:11.5px; font-weight:700; color:var(--text-1);">تطبيق هامش موحد:</span>
            <input type="number" id="wiz-uniform-margin" class="form-control mono font-bold" value="15" min="1" max="500" step="1" style="width:55px; height:26px; padding:2px 4px; font-size:11.5px; text-align:center;" />
            <span style="font-size:11px; color:var(--text-2);">%</span>
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.applyUniformMarginToWizard()" style="padding:2px 8px; font-size:11px;">تطبيق على الكل</button>
          </div>

        </div>

      </div>

      <!-- Table Body -->
      <div class="modal-body" style="padding:12px 18px; flex:1; overflow-y:auto; background:var(--bg-3); display:flex; flex-direction:column;">
        <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px; background:var(--bg-card); flex:1; overflow-y:auto;">
          <table class="data-dense" style="width:100%; margin:0; font-size:12px;">
            <thead>
              <tr style="background:var(--bg-2); position:sticky; top:0; z-index:2; box-shadow:0 1px 2px rgba(0,0,0,0.06);">
                <th style="width:35px; text-align:center;">
                  <input type="checkbox" id="wiz-select-all" checked onchange="window.toggleAllWizardItems(this.checked)" style="cursor:pointer;" />
                </th>
                <th>كود واسم الصنف</th>
                <th style="width:65px; text-align:center;">الوحدة</th>
                <th style="width:95px; text-align:left;">آخر تكلفة سابقة</th>
                <th style="width:115px; text-align:left; color:var(--brand);">آخر تكلفة جديدة</th>
                <th style="width:95px; text-align:left;">سعر البيع الحالي</th>
                <th style="width:95px; text-align:center;">نسبة الربح %</th>
                <th style="width:120px; text-align:left; color:#10B981;">سعر البيع المقترح</th>
                <th style="width:110px; text-align:left; color:var(--text-2);">شامل VAT (15%)</th>
              </tr>
            </thead>
            <tbody id="price-wizard-tbody"></tbody>
          </table>
        </div>
      </div>

      <!-- Footer Action Buttons -->
      <div class="modal-footer" style="padding:12px 20px; border-top:1px solid var(--border-soft); background:var(--bg-card); display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
        <button type="button" class="btn btn-secondary" onclick="window.closePriceWizard()" style="font-size:12px;">
          تخطي والإبقاء على الأسعار السابقة
        </button>
        <div style="display:flex; align-items:center; gap:12px;">
          <span id="wiz-selected-count-label" style="font-size:12px; font-weight:700; color:var(--text-2);">محدد: ${items.length} صنف</span>
          <button type="button" id="wiz-confirm-btn" class="btn btn-primary" onclick="window.confirmPriceWizardUpdates()" style="background:linear-gradient(135deg, #10B981, #059669); border:none; padding:8px 20px; font-weight:800; font-size:12.5px; box-shadow:0 4px 12px rgba(16,185,129,0.3); cursor:pointer;">
            🚀 اعتماد وتحديث أسعار البيع المحددة
          </button>
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(overlay);
  window.renderPriceWizardRows();
};

window.renderPriceWizardRows = () => {
  const tbody = document.getElementById("price-wizard-tbody");
  if (!tbody) return;

  const items = window._activePriceWizardItems || [];
  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px; color:var(--text-2);">لا توجد أصناف</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map((item, idx) => {
    const costDiff = item.newCost - item.oldCost;
    const diffPct = item.oldCost > 0 ? ((costDiff / item.oldCost) * 100).toFixed(1) : "—";
    const diffBadge = item.oldCost > 0
      ? (costDiff > 0
          ? `<span style="font-size:10px; color:#DC2626; background:rgba(239,68,68,0.1); padding:1px 4px; border-radius:3px; margin-right:4px;">🔺 +${diffPct}%</span>`
          : costDiff < 0
          ? `<span style="font-size:10px; color:#059669; background:rgba(16,185,129,0.1); padding:1px 4px; border-radius:3px; margin-right:4px;">🔻 ${diffPct}%</span>`
          : `<span style="font-size:10px; color:var(--text-3); margin-right:4px;">= 0%</span>`)
      : `<span style="font-size:10px; color:var(--brand); background:rgba(99,102,241,0.1); padding:1px 4px; border-radius:3px; margin-right:4px;">جديد</span>`;

    const mult = item.taxCategory === "S" ? 1.15 : 1.0;
    const incPrice = item.newSellingPrice > 0 ? (item.newSellingPrice * mult).toFixed(2) : "0.00";

    return `
      <tr style="background:${item.selected ? 'var(--bg-1)' : 'rgba(0,0,0,0.02)'}; opacity:${item.selected ? '1' : '0.55'};">
        <td style="text-align:center;">
          <input type="checkbox" class="wiz-item-check" data-idx="${idx}" ${item.selected ? 'checked' : ''} onchange="window.toggleWizardItem(${idx}, this.checked)" style="cursor:pointer;" />
        </td>
        <td>
          <div style="font-weight:700; color:var(--text-0);">${item.productName}</div>
          <div class="dim mono" style="font-size:10.5px;">${item.sku || '—'}</div>
        </td>
        <td style="text-align:center;">
          <span class="badge neutral" style="font-size:10.5px;">${translateUnit(item.unit || 'Piece')}</span>
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--text-2);">
          ${formatCurrency(item.oldCost)}
        </td>
        <td class="mono font-bold" style="text-align:left;">
          <span style="color:var(--brand);">${formatCurrency(item.newCost)}</span>
          ${diffBadge}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--text-1);">
          ${item.currentSellingPrice > 0 ? formatCurrency(item.currentSellingPrice) : '<span class="dim" style="font-size:11px;">غير مسجل</span>'}
        </td>
        <td style="text-align:center;">
          <div style="display:inline-flex; align-items:center; gap:2px;">
            <input type="number" class="form-control mono font-bold" value="${item.targetMarginPct}" min="0" max="500" step="0.5"
              oninput="window.recalcPriceWizardRow(${idx}, 'margin', this.value)"
              style="width:55px; height:26px; padding:2px 4px; font-size:11.5px; text-align:center; border:1px solid var(--brand); border-radius:4px;" />
            <span style="font-size:11px; font-weight:700; color:var(--text-2);">%</span>
          </div>
        </td>
        <td style="text-align:left;">
          <input type="number" class="form-control mono font-bold text-good" value="${item.newSellingPrice.toFixed(2)}" min="0" step="0.25"
            oninput="window.recalcPriceWizardRow(${idx}, 'price', this.value)"
            style="width:90px; height:26px; padding:2px 6px; font-size:12px; font-weight:800; border:1.5px solid #10B981; border-radius:5px; background:rgba(16,185,129,0.04);" />
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--text-2);" id="wiz-inc-price-${idx}">
          ${formatCurrency(incPrice)}
        </td>
      </tr>
    `;
  }).join("");

  window.updateWizardSummaryLabel();
};

window.recalcPriceWizardRow = (idx, trigger, val) => {
  const item = window._activePriceWizardItems[idx];
  if (!item) return;

  const mode = window._activePriceWizardMode || "markup";
  const mult = item.taxCategory === "S" ? 1.15 : 1.0;

  if (trigger === "margin") {
    const margin = parseFloat(val) || 0;
    item.targetMarginPct = margin;
    item.marginType = mode;

    if (mode === "margin" && margin < 100) {
      item.newSellingPrice = Math.round((item.newCost / (1 - (margin / 100))) * 100) / 100;
    } else {
      item.newSellingPrice = Math.round((item.newCost * (1 + (margin / 100))) * 100) / 100;
    }

    const row = document.getElementById("price-wizard-tbody")?.children[idx];
    if (row) {
      const priceInp = row.querySelector("input[oninput*='price']");
      if (priceInp) priceInp.value = item.newSellingPrice.toFixed(2);
      const incEl = document.getElementById(`wiz-inc-price-${idx}`);
      if (incEl) incEl.textContent = formatCurrency(item.newSellingPrice * mult);
    }
  } else if (trigger === "price") {
    const price = parseFloat(val) || 0;
    item.newSellingPrice = price;

    if (item.newCost > 0 && price > 0) {
      if (mode === "margin") {
        item.targetMarginPct = Math.round(((price - item.newCost) / price) * 1000) / 10;
      } else {
        item.targetMarginPct = Math.round(((price - item.newCost) / item.newCost) * 1000) / 10;
      }
    } else {
      item.targetMarginPct = 0;
    }

    const row = document.getElementById("price-wizard-tbody")?.children[idx];
    if (row) {
      const marginInp = row.querySelector("input[oninput*='margin']");
      if (marginInp) marginInp.value = item.targetMarginPct;
      const incEl = document.getElementById(`wiz-inc-price-${idx}`);
      if (incEl) incEl.textContent = formatCurrency(item.newSellingPrice * mult);
    }
  }
};

window.applyUniformMarginToWizard = () => {
  const marginVal = parseFloat(document.getElementById("wiz-uniform-margin")?.value) || 15;
  const mode = window._activePriceWizardMode || "markup";

  (window._activePriceWizardItems || []).forEach(item => {
    item.targetMarginPct = marginVal;
    item.marginType = mode;
    if (mode === "margin" && marginVal < 100) {
      item.newSellingPrice = Math.round((item.newCost / (1 - (marginVal / 100))) * 100) / 100;
    } else {
      item.newSellingPrice = Math.round((item.newCost * (1 + (marginVal / 100))) * 100) / 100;
    }
  });

  window.renderPriceWizardRows();
  window.showToast?.(`تم تطبيق هامش ${marginVal}% على جميع أصناف المعالج`, "info");
};

window.switchWizardMarginType = (mode) => {
  window._activePriceWizardMode = mode;
  const btnMarkup = document.getElementById("wiz-mode-markup");
  const btnMargin = document.getElementById("wiz-mode-margin");
  if (btnMarkup && btnMargin) {
    if (mode === "markup") {
      btnMarkup.className = "btn btn-sm btn-primary";
      btnMargin.className = "btn btn-sm btn-ghost";
    } else {
      btnMarkup.className = "btn btn-sm btn-ghost";
      btnMargin.className = "btn btn-sm btn-primary";
    }
  }

  (window._activePriceWizardItems || []).forEach(item => {
    item.marginType = mode;
    const margin = item.targetMarginPct || 15;
    if (mode === "margin" && margin < 100) {
      item.newSellingPrice = Math.round((item.newCost / (1 - (margin / 100))) * 100) / 100;
    } else {
      item.newSellingPrice = Math.round((item.newCost * (1 + (margin / 100))) * 100) / 100;
    }
  });

  window.renderPriceWizardRows();
};

window.toggleAllWizardItems = (checked) => {
  (window._activePriceWizardItems || []).forEach(item => { item.selected = checked; });
  window.renderPriceWizardRows();
};

window.toggleWizardItem = (idx, checked) => {
  const item = window._activePriceWizardItems[idx];
  if (item) item.selected = checked;
  window.renderPriceWizardRows();
};

window.updateWizardSummaryLabel = () => {
  const selectedCount = (window._activePriceWizardItems || []).filter(i => i.selected).length;
  const label = document.getElementById("wiz-selected-count-label");
  if (label) label.textContent = `محدد: ${selectedCount} من ${window._activePriceWizardItems.length} صنف`;
};

window.confirmPriceWizardUpdates = async () => {
  const btn = document.getElementById("wiz-confirm-btn");
  if (btn) { btn.disabled = true; btn.textContent = "⏳ جارٍ التحديث..."; }

  const selectedItems = (window._activePriceWizardItems || []).filter(i => i.selected && i.newSellingPrice > 0);
  if (selectedItems.length === 0) {
    window.showToast?.("لم يتم تحديد أي صنف للتحديث", "warn");
    window.closePriceWizard();
    return;
  }

  let successCount = 0;
  try {
    const { doc: fsDoc, updateDoc, serverTimestamp: fsST } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    
    await Promise.all(selectedItems.map(async (item) => {
      try {
        const pRef = fsDoc(db, `companies/${COMPANY_ID}/products`, item.productId);
        await updateDoc(pRef, {
          salePrice:           item.newSellingPrice,
          sellingPrice:        item.newSellingPrice,
          priceRetail:         item.newSellingPrice,
          targetMarginPct:     item.targetMarginPct,
          marginType:          item.marginType,
          lastPriceUpdateDate: todayString(),
          updatedAt:           fsST()
        });
        successCount++;
      } catch (err) {
        console.warn("[PriceWizard] Failed to update price for", item.productId, err);
      }
    }));

    window.closePriceWizard();
    window.showToast?.(`✅ تم بنجاح تحديث أسعار البيع لـ (${successCount}) صنف وفق آخر أسعار الشراء`, "success");
    
    if (typeof allProducts !== "undefined") allProducts = [];
    if (window.loadProducts) window.loadProducts(true);

  } catch (err) {
    console.error("[PriceWizard] Batch update failed:", err);
    window.showToast?.("حدث خطأ أثناء تحديث الأسعار: " + err.message, "error");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "🚀 اعتماد وتحديث أسعار البيع المحددة"; }
  }
};

window.closePriceWizard = () => {
  const overlay = document.getElementById("price-wizard-overlay");
  if (overlay) overlay.remove();
  window._activePriceWizardItems = [];
};

