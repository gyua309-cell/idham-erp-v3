// ============================================================

// IDHAM ERP — Sales Invoice Module (ZATCA Compliant)

// ============================================================



import { COLS, create, getAll, getById, update, remove, generateInvoiceNumber,

         adjustStock, adjustStockBulk, createJournalEntry, deleteJournalEntry, autoCashTransaction, autoBankTransaction, isPeriodClosed } from "../utils/db.js";

import { collection, query, where, orderBy, limit, getDocs, serverTimestamp, doc, getDoc, updateDoc, increment } from "../utils/db.js";

import { formatCurrency, formatDate, formatISOTimestamp, calcInvoiceTotals,

         getInvoiceStatusBadge, calcLineTotal, todayString, debounce, uuid, tafqeetArabic } from "../utils/formatters.js";

import { generateZATCAQRBase64, renderZATCAQR } from "../utils/zatca-qr.js";

import { APP_CONFIG, COMPANY_ID, getUserProfile } from "../firebase-config.js";

import { db } from "../firebase-config.js";

import { autoSalesJE } from "../utils/accounting-engine.js";

import { exportToExcel } from "../utils/excel.js";

import { recalculateCustomerBalance } from "../utils/balance-sync.js";



function translateUnit(u) {

  const map = {

    Piece:'حبة', Carton:'كرتون', Box:'بوكس', Bag:'كيس', Pack:'شد',

    Sack:'شوال', Bale:'بالة', Barrel:'برميل', Tray:'طبق', Gallon:'جالون',

    Kilogram:'كيلو', Ton:'طن', Liter:'لتر', Gram:'جرام', Can:'علبة',

    Bottle:'زجاجة', Meter:'متر', Tank:'تنك', Roll:'رول', Pallet:'باليت',

    PCS:'حبة'

  };

  return map[u] || u || '';

}



let invoiceLines = [];

let selectedCustomer = null;

let selectedRep = null;

let selectedWarehouse = null;

let allProducts = [];

let allCategories = [];

let currentView = "list"; // "list" | "new" | "view"

let currentInvoice = null;

let pricingSettings = null;



const showToast = (message, type = "info") => {

  if (window.showToast) {

    window.showToast(message, type);

  } else {

    console.log(`[Toast Fallback - ${type}]: ${message}`);

  }

};



function showErr(msg) {
  const errEl = document.getElementById("inv-form-error");
  if (errEl) {
    errEl.textContent = msg;
    errEl.classList.remove("hidden");
  } else {
    alert(msg);
  }
}

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

export async function render(container, user) {
  container.innerHTML = buildListPage();
  window._salesUser = user;

  // Bind change events to all filters
  document.getElementById("inv-from").addEventListener("change", () => loadInvoicesList());
  document.getElementById("inv-to").addEventListener("change", () => loadInvoicesList());
  document.getElementById("inv-status-filter").addEventListener("change", () => loadInvoicesList());
  document.getElementById("inv-zatca-filter").addEventListener("change", () => loadInvoicesList());

  // ديبونس على حقل البحث العام — 250ms تأخير بعد التوقف عن الكتابة
  const searchEl = document.getElementById("inv-text-filter");
  if (searchEl) {
    searchEl.addEventListener("input", (window.debounce || ((fn) => fn))(() => loadInvoicesList(), 250));
  }

  // البحث في حقل العميل المخصص مع المزامنة
  const custSearchInp = document.getElementById("inv-customer-search-input");
  if (custSearchInp) {
    custSearchInp.addEventListener("input", (window.debounce || ((fn) => fn))(() => {
      const val = custSearchInp.value.trim();
      const clearBtn = document.getElementById("inv-customer-clear-btn");
      if (clearBtn) clearBtn.style.display = val ? "block" : "none";

      const matched = cachedCustomers?.find(c => (c.name || "").trim().toLowerCase() === val.toLowerCase());
      const custSel = document.getElementById("inv-customer-filter");
      if (custSel) custSel.value = matched ? matched.id : "";

      loadInvoicesList();
    }, 200));
  }

  // Load filters and invoices asynchronously so render() completes instantly (<10ms)
  // and dismisses the top progress bar immediately without waiting on network
  loadListFiltersData().catch(e => console.warn("Filters load:", e));
  loadInvoicesList().catch(e => console.warn("Invoices load:", e));

  // Check incoming purchase invoice to convert
  const convertPurStr = sessionStorage.getItem("convert_purchase_to_sale");
  if (convertPurStr) {
    sessionStorage.removeItem("convert_purchase_to_sale");
    try {
      const data = JSON.parse(convertPurStr);
      setTimeout(() => {
        window.openSalesInvoiceFromPurchase(data);
      }, 200);
    } catch(e) { console.error(e); }
  }

  // Check incoming quotation to convert
  const convertQuoteStr = sessionStorage.getItem("convert_quote");
  if (convertQuoteStr) {
    sessionStorage.removeItem("convert_quote");
    try {
      const data = JSON.parse(convertQuoteStr);
      setTimeout(() => {
        window.openSalesInvoiceFromQuote(data);
      }, 200);
    } catch(e) { console.error(e); }
  }
}

async function loadListFiltersData() {
  try {
    const [custs, reps, whs] = await Promise.all([
      getAll(COLS.customers(), [orderBy("name")]),
      getAll(COLS.salesReps(), [orderBy("name")]),
      getAll(COLS.warehouses(), [orderBy("name")])
    ]);
    
    cachedCustomers = custs;
    cachedReps = reps;
    cachedWarehouses = whs;

    const custSel = document.getElementById("inv-customer-filter");
    if (custSel) custSel.innerHTML = '<option value="">كل العملاء</option>' +
      custs.map(c => `<option value="${c.id}">${c.name}</option>`).join("");

    const datalist = document.getElementById("inv-customers-datalist");
    if (datalist) {
      datalist.innerHTML = custs.map(c => `<option value="${c.name}">${c.code ? `[${c.code}] ` : ''}${c.phone || ''}</option>`).join("");
    }

    const repSel = document.getElementById("inv-rep-filter");
    if (repSel) {
      const uniqueReps = [];
      const seen = new Set();
      reps.forEach(r => {
        const nameKey = (r.name || "").trim();
        if (nameKey && !seen.has(nameKey)) {
          seen.add(nameKey);
          uniqueReps.push(r);
        }
      });
      repSel.innerHTML = '<option value="">كل المناديب</option>' +
        uniqueReps.map(r => `<option value="${r.id}">${r.name}</option>`).join("");
    }

    const whSel = document.getElementById("inv-warehouse-filter");
    if (whSel) whSel.innerHTML = '<option value="">كل المستودعات</option>' +
      whs.map(w => `<option value="${w.id}">${w.name}</option>`).join("");
  } catch (err) {
    console.warn("Failed to load list filters dropdowns:", err);
  }
}

function buildListPage() {
  return `
    <!-- Filter Bar -->
    <div class="filterbar" style="flex-wrap: wrap; gap: 8px; align-items: flex-end;">
      <!-- Search Input for Invoices & Customers -->
      <div class="search-bar" style="min-width:240px; flex:1; max-width:300px;">
        <input type="text" id="inv-text-filter" class="input" placeholder="🔍 بحث سريع باسم العميل أو الفاتورة…" autocomplete="off" />
      </div>

      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="inv-from" value="${new Date(new Date().setDate(1)).toISOString().split('T')[0]}" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="inv-to" value="${todayString()}" />
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="inv-status-filter" onchange="loadInvoicesList()">
          <option value="">الكل</option>
          <option value="posted">مرحلة</option>
          <option value="pending">معلقة</option>
          <option value="paid">مدفوعة</option>
          <option value="partial">جزئي</option>
          <option value="overdue">متأخرة</option>
          <option value="cancelled">ملغاة</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>ZATCA</label>
        <select id="inv-zatca-filter" onchange="loadInvoicesList()">
          <option value="">الكل</option>
          <option value="reported">مُرسلة</option>
          <option value="pending">لم تُرسل</option>
        </select>
      </div>
      <div class="filter-select-group" style="position:relative;">
        <label>العميل (بحث بالاسم)</label>
        <div style="display:flex; align-items:center; position:relative; min-width:190px;">
          <input type="text" id="inv-customer-search-input" list="inv-customers-datalist" class="input" placeholder="🔍 اكتب أو اختر العميل…" style="padding-left:24px; font-size:12px; width:100%;" autocomplete="off" />
          <datalist id="inv-customers-datalist"></datalist>
          <button type="button" id="inv-customer-clear-btn" style="position:absolute; left:6px; background:none; border:none; color:var(--text-3); cursor:pointer; font-size:12px; font-weight:bold; display:none;" onclick="window.clearInvoiceCustomerFilter()" title="إلغاء التصفية بالعميل">✕</button>
          <select id="inv-customer-filter" onchange="window.onCustomerSelectChange()" style="display:none;">
            <option value="">كل العملاء</option>
          </select>
        </div>
      </div>
      <div class="filter-select-group">
        <label>المندوب</label>
        <select id="inv-rep-filter" onchange="loadInvoicesList()">
          <option value="">كل المناديب</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>المستودع</label>
        <select id="inv-warehouse-filter" onchange="loadInvoicesList()">
          <option value="">كل المستودعات</option>
        </select>
      </div>
      <div class="quick-filters">
        <button class="quick-filter-btn" id="qf-today" onclick="invFilterRange('today')">اليوم</button>
        <button class="quick-filter-btn active" id="qf-month" onclick="invFilterRange('month')">هذا الشهر</button>
        <button class="quick-filter-btn" id="qf-all" onclick="invFilterRange('all')">كل الفترات</button>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn-export" onclick="exportPagePDF('.data-dense','فواتير_المبيعات')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportInvoicesExcel()" title="تصدير Excel بجميع البيانات"><span>📊</span> تصدير Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn btn-primary" onclick="openNewInvoice()">+ فاتورة مبيعات</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPIs -->
      <div class="kpi-grid mb-20" id="inv-kpis">
        <div class="kpi-card g-blue">
          <div class="kpi-icon">🧾</div>
          <div class="kpi-content"><div class="kpi-label">إجمالي المبيعات</div>
            <div class="kpi-value mono" id="kpi-total">—</div></div></div>
        <div class="kpi-card g-green">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content"><div class="kpi-label">المحصّل</div>
            <div class="kpi-value mono" id="kpi-paid">—</div></div></div>
        <div class="kpi-card g-orange">
          <div class="kpi-icon">⏳</div>
          <div class="kpi-content"><div class="kpi-label">المتبقي</div>
            <div class="kpi-value mono" id="kpi-unpaid">—</div></div></div>
        <div class="kpi-card g-purple">
          <div class="kpi-icon">⚡</div>
          <div class="kpi-content"><div class="kpi-label">مُرسلة لـ ZATCA</div>
            <div class="kpi-value mono" id="kpi-zatca">—</div></div></div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 style="font-family:var(--font-heading);font-size:14px;">قائمة فواتير المبيعات</h3>
          <span id="inv-count-label" class="text-2" style="font-size:12px;"></span>
        </div>
        <div class="table-container">
          <table class="data-dense" id="inv-table">
            <thead><tr>
              <th>رقم الفاتورة</th><th>التاريخ</th><th>العميل</th>
              <th>المندوب</th><th>المخزن</th><th>الصافي</th>
              <th>VAT</th><th>الإجمالي</th><th>الحالة</th><th>ZATCA</th><th>قيد</th><th></th>
            </tr></thead>
            <tbody id="inv-tbody">
              ${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(11).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        <div style="padding:12px 16px;border-top:1px solid var(--border-soft);display:flex;justify-content:flex-end;gap:8px;">
          <button class="btn btn-sm btn-secondary" id="inv-prev" onclick="invPage('prev')" disabled>السابق</button>
          <span class="text-2 mono" style="font-size:12px;" id="inv-page-info"></span>
          <button class="btn btn-sm btn-secondary" id="inv-next" onclick="invPage('next')">التالي</button>
        </div>
      </div>
    </div>

    <!-- New/Edit Invoice Modal (True Fullscreen Cockpit - Identical Ergonomics to Purchase Invoices) -->
    <div class="modal-overlay" id="new-invoice-modal" onclick="if(event.target===this)closeModal('new-invoice-modal')">
      <style>
        #new-invoice-modal {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          padding: 0 !important;
          margin: 0 !important;
          background: rgba(15, 23, 42, 0.85) !important;
          z-index: 9999 !important;
          display: flex !important;
          align-items: stretch !important;
          justify-content: stretch !important;
        }
        #new-invoice-modal .modal-xl {
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          border-radius: 0 !important;
          margin: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
          border: none !important;
          background: #f8fafc !important;
        }
        #new-invoice-modal .form-control {
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          background: #ffffff;
          color: #0f172a;
          box-sizing: border-box;
        }
        #new-invoice-modal .no-spin::-webkit-outer-spin-button,
        #new-invoice-modal .no-spin::-webkit-inner-spin-button {
          -webkit-appearance: none !important;
          margin: 0 !important;
        }
        #new-invoice-modal .no-spin {
          -moz-appearance: textfield !important;
        }
        #new-invoice-modal input:focus, #new-invoice-modal select:focus {
          outline: 2px solid #2563eb !important;
          outline-offset: -1px !important;
          background-color: #eff6ff !important;
        }
        #invoice-lines-tbody tr:hover {
          background-color: #f1f5f9 !important;
        }
        .sale-hud-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 6px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          font-size: 11.5px;
          font-weight: 700;
          color: #334155;
          white-space: nowrap;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        .sale-hud-pill b {
          font-family: monospace;
          font-size: 12.5px;
          font-weight: 800;
        }
      </style>
      <div class="modal modal-xl">
        
        <!-- Header (Crisp Light Theme 44px) -->
        <div class="modal-header" style="height:44px; padding:6px 18px; border-bottom:1.5px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; background:#ffffff; color:#0f172a; flex-shrink:0; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:20px;">📄</span>
            <h3 class="modal-title" id="invoice-modal-title" style="margin:0; font-size:15px; font-weight:900; color:#0f172a;">
              فاتورة مبيعات جديدة
            </h3>
            <span class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:800; font-size:10.5px; padding:2px 7px; border:1px solid #c7d2fe;">
              ⛶ شاشة كاملة
            </span>
          </div>

          <div style="display:flex; align-items:center; gap:8px;">
            <select id="inv-type" class="form-control font-bold" style="height:30px; font-size:11.5px; padding:2px 8px;" title="نوع الفاتورة">
              <option value="standard">فاتورة ضريبية (B2B)</option>
              <option value="simplified">فاتورة مبسطة (B2C)</option>
            </select>
            <button class="modal-close" onclick="closeModal('new-invoice-modal')" style="color:#64748b; font-size:24px; line-height:1; padding:0 6px; background:transparent; border:none; cursor:pointer; font-weight:700;">×</button>
          </div>
        </div>

        <!-- Body (Flex 1, No outer scroll, pure ergonomics like purchase invoices) -->
        <div class="modal-body" style="padding:8px 12px; overflow:hidden; flex:1 1 0%; min-height:0; display:flex; flex-direction:column; gap:6px; background:#f1f5f9;">

          <!-- Section 1: Compact Ergonomic Meta Bar (Single Row ~40px) -->
          <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:6px 10px; box-shadow:0 1px 3px rgba(0,0,0,0.04); flex-shrink:0;">
            <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
              
              <div style="width:115px;">
                <input type="text" id="inv-number" class="form-control mono font-bold" readonly
                  style="background:#f8fafc; color:#4338ca; font-size:11.5px; height:30px; padding:2px 6px; text-align:center;" placeholder="رقم الفاتورة" title="رقم الفاتورة بالنظام" />
              </div>

              <div style="width:125px;">
                <input type="date" id="inv-date" class="form-control mono font-bold" value="${todayString()}"
                  style="height:30px; padding:2px 6px; font-size:11.5px; text-align:center;" title="تاريخ الفاتورة *" />
              </div>

              <div style="flex:2; min-width:220px; position:relative;">
                <div class="autocomplete-container" id="customer-ac-wrap">
                  <input type="text" id="customer-search" class="form-control font-bold"
                    placeholder="👤 ابحث باسم العميل أو اختر العميل... *" autocomplete="off"
                    style="height:30px; padding:2px 10px; font-size:12px; border-color:#2563eb; background:#fff;" />
                  <div class="autocomplete-results hidden" id="customer-results" style="z-index:99999; max-height:260px; box-shadow:0 8px 24px rgba(0,0,0,0.18);"></div>
                  <input type="hidden" id="customer-id" />
                </div>
              </div>

              <div style="width:130px;">
                <select id="inv-warehouse" class="form-control font-bold" style="height:30px; padding:2px 6px; font-size:11.5px;" title="المخزن المستخرج منه" onchange="window.resolveAllLineBatches(); renderInvoiceLines(); window.autoSelectCostCenter && window.autoSelectCostCenter();">
                  <option value="">المخزن *</option>
                </select>
              </div>

              <div style="width:130px;">
                <select id="inv-rep" class="form-control font-bold" style="height:30px; padding:2px 6px; font-size:11.5px;" title="المندوب (اختياري)" onchange="window.autoSelectCostCenter && window.autoSelectCostCenter()">
                  <option value="">بيع مباشر (بدون مندوب)</option>
                </select>
              </div>

              <div style="width:115px;">
                <select id="inv-payment" class="form-control font-bold" style="height:30px; padding:2px 6px; font-size:11.5px;" title="طريقة الدفع" onchange="updateInvoiceTotals()">
                  <option value="credit">آجل (سداد لاحق)</option>
                  <option value="cash">نقدي (خزينة)</option>
                  <option value="transfer">تحويل بنكي</option>
                  <option value="check">شيك مصرفي</option>
                </select>
              </div>

              <div style="width:105px;">
                <input type="number" id="inv-paid-amount" class="form-control mono font-bold no-spin" step="0.01" min="0" placeholder="0.00" style="height:30px; padding:2px 6px; font-size:11.5px; text-align:center;" title="المبلغ المدفوع (ر.س)" />
              </div>

              <button type="button" class="btn btn-secondary btn-sm" onclick="window.toggleSaleExtraDetails()" style="height:30px; font-size:11px; padding:0 8px; font-weight:700;" title="إظهار مركز التكلفة، الملاحظات، والمرفقات">
                ⚙️ تفاصيل إضافية
              </button>

            </div>

            <!-- Secondary Extra Details Drawer -->
            <div id="sale-extra-details-drawer" style="display:none; margin-top:6px; padding-top:6px; border-top:1px dashed #cbd5e1; gap:10px; align-items:center; flex-wrap:wrap;">
              <div style="display:flex; align-items:center; gap:6px;">
                <label style="font-size:11px; font-weight:700; color:#475569; white-space:nowrap;">🏷️ مركز التكلفة:</label>
                <select id="inv-cost-center" class="form-control" style="height:28px; padding:2px 6px; font-size:11px; width:150px;">
                  <option value="">بدون مركز تكلفة</option>
                </select>
              </div>
              <div style="display:flex; align-items:center; gap:6px; flex:1; min-width:220px;">
                <label style="font-size:11px; font-weight:700; color:#475569; white-space:nowrap;">ملاحظات:</label>
                <input type="text" id="inv-notes" class="form-control" placeholder="ملاحظات اختيارية على الفاتورة..." style="height:28px; padding:2px 8px; font-size:11px; flex:1;" />
              </div>
              <div style="display:flex; align-items:center; gap:6px; min-width:220px;">
                <label style="font-size:11px; font-weight:700; color:#475569; white-space:nowrap;">📁 إرفاق مستند:</label>
                <input type="file" id="inv-file-upload" class="form-control" accept="image/*,application/pdf" style="height:28px; padding:1px 4px; font-size:10.5px;" />
              </div>
            </div>

            <!-- Customer Alerts (Donation / Broker / Credit) -->
            <div id="donation-badge" class="alert info hidden" style="margin-top:6px; padding:4px 10px; font-size:11px; font-weight:bold;"></div>
            <div id="inv-broker-alert" style="display:none; margin-top:6px; padding:4px 10px; font-size:11.5px; font-weight:800; border-left:3px solid #0284c7; background:rgba(2,132,199,0.08); color:#0369a1; border-radius:6px;"></div>
            <div id="credit-status-bar" class="hidden" style="margin-top:6px;">
              <div class="credit-meter">
                <div class="meter-label">
                  <span id="credit-label">الرصيد المتاح</span>
                  <span id="credit-numbers" class="mono"></span>
                </div>
                <div class="progress-bar">
                  <div class="fill" id="credit-fill" style="width:0%;"></div>
                </div>
              </div>
            </div>
            <div id="inv-aging-alert" class="hidden" style="margin-top:6px; padding:6px 12px; font-size:11.5px; font-weight:800; border-radius:8px;"></div>

          </div>

          <!-- Section 2: Search & Smart Action Toolbar (Directly Above Table, exactly like Purchase Invoices) -->
          <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:4px 8px; box-shadow:0 1px 3px rgba(0,0,0,0.04); flex-shrink:0; display:flex; gap:8px; align-items:center; justify-content:space-between; flex-wrap:wrap;">
            <div style="display:flex; gap:6px; flex:1; min-width:320px; align-items:center;">
              <select id="inv-product-category-filter" class="form-control" style="width:130px; height:32px; font-size:11.5px; padding:2px 6px;">
                <option value="">كل الفئات</option>
              </select>
              <div class="autocomplete-container" style="flex:1; position:relative;">
                <input type="text" id="product-search-input" class="form-control"
                  placeholder="🔍 ابحث باسم الصنف أو امسح الباركود لإضافة الصنف فوراً... [F8 للبحث المتقدم]" autocomplete="off"
                  style="height:32px; font-size:12.5px; font-weight:700; padding:2px 10px; background:#fff; border-color:#2563eb;" />
                <div class="autocomplete-results hidden" id="product-search-results" style="z-index:99999; max-height:280px; box-shadow:0 10px 30px rgba(0,0,0,0.18);"></div>
              </div>
              <span class="badge" id="inv-items-badge" style="font-size:11px; background:#e0e7ff; color:#3730a3; font-weight:800; padding:4px 8px; white-space:nowrap;">0 صنف</span>
              <button type="button" class="btn sm" onclick="window.refreshInvoiceCostsFromCatalog()" style="height:30px; font-size:11px; padding:2px 8px; white-space:nowrap; background:#f0f9ff; border:1px solid #bae6fd; color:#0369a1; font-weight:700; border-radius:6px; cursor:pointer;" title="تحديث تكاليف البنود في الفاتورة وفق أحدث أسعار وتكاليف المخزون الحالية">
                🔄 تحديث التكاليف من المخزن
              </button>
            </div>
          </div>

          <!-- Section 3: THE MAIN ITEMS TABLE (Maximized Screen Real Estate) -->
          <div class="table-container" style="border:1.5px solid #cbd5e1; border-radius:8px; flex:1 1 0%; min-height:0; overflow-y:auto; overflow-x:auto; background:#fff; box-shadow:inset 0 1px 3px rgba(0,0,0,0.04);">
            <table class="data-dense" style="margin:0; font-size:12px; width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:#f8fafc; color:#1e293b; position:sticky; top:0; z-index:10; border-bottom:2px solid #cbd5e1; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                  <th style="width:30px; text-align:center; padding:8px 4px; color:#475569; font-weight:800;">#</th>
                  <th style="padding:8px 8px; text-align:right; color:#0f172a; font-weight:900; min-width:240px;">الصنف</th>
                  <th style="width:105px; padding:8px 4px; text-align:center; color:#334155; font-weight:800;">الوحدة</th>
                  <th style="width:85px; text-align:center; padding:8px 4px; color:#0284c7; font-weight:900;">الكمية</th>
                  <th style="width:95px; text-align:left; padding:8px 4px; color:#334155; font-weight:800;">سعر الوحدة</th>
                  <th style="width:110px; text-align:center; padding:8px 4px; color:#dc2626; font-weight:900;">الخصم ✂️</th>
                  <th style="width:95px; text-align:center; padding:8px 4px; color:#0369a1; background:#f0f9ff; font-weight:800;" title="متوسط التكلفة المرجح للصنف (WAC)">متوسط التكلفة ⚖️</th>
                  <th style="width:85px; text-align:center; padding:8px 4px; color:#047857; background:#ecfdf5; font-weight:900;" title="نسبة هامش الربح للسطر وفق المتوسط المرجح">هامش الربح % 📈</th>
                  <th style="width:110px; padding:8px 4px; color:#334155; font-weight:800;">التشغيلة</th>
                  <th style="width:100px; padding:8px 4px; color:#334155; font-weight:800;">الانتهاء</th>
                  <th style="width:65px; text-align:center; padding:8px 4px; color:#334155; font-weight:800;">VAT</th>
                  <th style="width:110px; text-align:left; padding:8px 8px; color:#1e40af; font-weight:900;">الإجمالي</th>
                  <th style="width:36px; padding:8px 2px; text-align:center;"></th>
                </tr>
              </thead>
              <tbody id="invoice-lines-tbody"></tbody>
            </table>
          </div>

          <div id="inv-form-error" class="alert bad hidden" style="margin:0; padding:6px 10px; font-size:11.5px;"></div>

        </div>

        <!-- Section 4: FIXED BOTTOM HUD BAR (Crisp High-Contrast Light Theme) -->
        <div class="modal-footer" style="height:54px; padding:0 16px; background:#ffffff; border-top:2px solid #cbd5e1; display:flex; justify-content:space-between; align-items:center; flex-shrink:0; box-shadow:0 -2px 10px rgba(0,0,0,0.04);">
          
          <!-- Live Totals Strip -->
          <div style="display:flex; align-items:center; gap:8px; overflow-x:auto; flex:1; margin-left:12px;">
            
            <div class="sale-hud-pill">
              <span style="color:#64748b;">المجموع الفرعي:</span>
              <b id="total-subtotal" style="color:#0f172a;">0.00 ر.س</b>
            </div>

            <div class="sale-hud-pill" style="display:inline-flex; align-items:center; gap:4px; background:#fff1f2; border:1px solid #fecdd3; padding:2px 8px; border-radius:6px;" title="خصم إضافي على إجمالي الفاتورة (مبلغ أو نسبة)">
              <span style="color:#dc2626; font-weight:800; font-size:11px; white-space:nowrap;">خصم إضافي:</span>
              <input type="number" id="inv-global-discount-val" class="mono font-bold no-spin" step="0.01" min="0" value="0" placeholder="0" style="width:55px; height:24px; padding:1px 4px; font-size:11.5px; text-align:center; border:1px solid #fda4af; border-radius:4px; background:#ffffff; color:#be123c;" oninput="window.onGlobalDiscountChanged()" title="أدخل قيمة الخصم الإضافي" />
              <select id="inv-global-discount-type" style="height:24px; padding:0 2px; font-size:11px; font-weight:bold; border:1px solid #fda4af; border-radius:4px; background:#ffffff; color:#be123c; cursor:pointer;" onchange="window.onGlobalDiscountChanged()" title="نوع الخصم: مبلغ (ر.س) أو نسبة مئوية (%)">
                <option value="amount">ر.س</option>
                <option value="percent">%</option>
              </select>
              <b id="total-discount" style="color:#dc2626; font-size:11.5px; margin-right:4px; white-space:nowrap;">- 0.00 ر.س</b>
            </div>

            <div class="sale-hud-pill">
              <span style="color:#d97706;">الضريبة (15%):</span>
              <b id="total-vat" style="color:#d97706;">0.00 ر.س</b>
            </div>

            <div class="sale-hud-pill" title="تكلفة البضاعة المباعة وفق المتوسط المرجح">
              <span style="color:#64748b;">التكلفة (WAC):</span>
              <b id="inv-hud-cost" style="color:#64748b;">0.00 ر.س</b>
            </div>

            <div class="sale-hud-pill" title="صافي ربح الفاتورة التقديري">
              <span style="color:#16a34a;">الربح التقديري:</span>
              <b id="total-profit" style="color:#16a34a;">0.00 ر.س</b>
            </div>

            <div class="sale-hud-pill" id="inv-hud-margin-pill" style="background:#ecfdf5; border-color:#6ee7b7;" title="نسبة هامش الربح للفاتورة">
              <span style="color:#065f46;">🎯 هامش الربح:</span>
              <b id="total-margin" style="color:#059669; font-size:12.5px;">0.0%</b>
            </div>

            <!-- Pinned Grand Total -->
            <div style="display:inline-flex; align-items:center; gap:8px; padding:5px 16px; background:linear-gradient(135deg, #1e40af, #2563eb); border-radius:8px; border:1px solid #1d4ed8; box-shadow:0 2px 6px rgba(37,99,235,0.25);">
              <span style="font-size:12.5px; font-weight:800; color:#dbeafe;">المستحق:</span>
              <span class="mono" style="font-size:18px; font-weight:900; color:#ffffff;" id="total-grand">0.00 ر.س</span>
            </div>

          </div>

          <!-- Action Buttons -->
          <div style="display:flex; gap:6px; align-items:center; flex-shrink:0;">
            <button class="btn btn-ghost sm" onclick="closeModal('new-invoice-modal')" style="color:#64748b; height:34px; font-size:12px; font-weight:700;">إلغاء</button>
            <button class="btn btn-secondary sm" onclick="saveInvoice('draft')" style="height:34px; font-size:12px; padding:0 12px; background:#f8fafc; border:1.5px solid #cbd5e1; color:#0f172a; font-weight:800;">حفظ مسودة</button>
            <button class="btn btn-primary" onclick="saveInvoice('pending')" id="save-inv-btn" style="height:36px; padding:0 20px; font-weight:900; font-size:13px; background:linear-gradient(135deg,#2563eb,#1d4ed8); box-shadow:0 2px 6px rgba(37,99,235,0.3);">
              💾 حفظ وإصدار الفاتورة
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- View Invoice Modal -->
    <div class="modal-overlay" id="view-invoice-modal">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 class="modal-title" id="view-inv-title">تفاصيل الفاتورة</h3>
          <button class="modal-close" onclick="closeModal('view-invoice-modal')">×</button>
        </div>
        <div class="modal-body" id="view-inv-body"></div>
         <div class="modal-footer" id="view-inv-footer"></div>
      </div>
    </div>`;
}

// ── Load Invoices List ──
let invLastDoc = null;
let invCurrentPage = 0;
let invoicesCache = new Map();
let cachedReps = null;
let cachedWarehouses = null;
let cachedProducts = null;
let cachedCustomers = null;

window.loadInvoicesList = async () => {
  invLastDoc = null; invCurrentPage = 0;
  await fetchInvoices();
};

window.invPage = async (dir) => {
  if (dir === "next" && invLastDoc) { invCurrentPage++; await fetchInvoices(); }
  if (dir === "prev" && invCurrentPage > 0) { invCurrentPage--; invLastDoc = null; await fetchInvoices(); }
};

async function fetchInvoices() {
  const tbody = document.getElementById("inv-tbody");
  if (!tbody) return;
  tbody.innerHTML = `${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(11).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;

  try {
    const from = document.getElementById("inv-from")?.value;
    const to   = document.getElementById("inv-to")?.value;

    const textFilter = (document.getElementById("inv-text-filter")?.value || "").trim().toLowerCase();
    const custSearchText = (document.getElementById("inv-customer-search-input")?.value || "").trim().toLowerCase();
    const custF = document.getElementById("inv-customer-filter")?.value;

    let q = COLS.salesInvoices();
    const constraints = [];
    if (from) {
      constraints.push(where("date", ">=", from));
    }
    if (to) {
      constraints.push(where("date", "<=", to));
    }

    const finalConstraints = [...constraints, orderBy("date", "desc")];
    if (!from && !to && !custF && !custSearchText && !textFilter) {
      // جلب آخر 100 فاتورة فقط لتسريع الصفحة الافتتاحية
      finalConstraints.push(limit(100));
    } else {
      finalConstraints.push(limit(500));
    }

    let invs = await getAll(COLS.salesInvoices(), finalConstraints);

    // Cache loaded invoices in memory for 0ms instant view
    invs.forEach(inv => invoicesCache.set(inv.id, inv));

    // Customer, Sales Rep, Warehouse, and Status filters
    const statusF = document.getElementById("inv-status-filter")?.value;
    if (statusF) {
      invs = invs.filter(inv => inv.status === statusF);
    }

    // ── تصفية بالبحث النصي السريع (اسم العميل، رقم الفاتورة، هاتف العميل، المندوب، الملاحظات) ──
    if (textFilter) {
      invs = invs.filter(inv => {
        const cName = ((cachedCustomers && cachedCustomers.find(c => c.id === inv.customerId)?.name) || inv.customerName || "").toLowerCase();
        const num = (inv.number || inv.invoiceNumber || inv.id || "").toLowerCase();
        const rName = (inv.repName || "").toLowerCase();
        const phone = (inv.customerPhone || "").toLowerCase();
        const notes = (inv.notes || "").toLowerCase();
        return cName.includes(textFilter) || num.includes(textFilter) || rName.includes(textFilter) || phone.includes(textFilter) || notes.includes(textFilter);
      });
    }

    // ── تصفية بالعميل (سواء باختيار المعرّف أو بالبحث المباشر في حقل العميل) ──
    if (custF) {
      const selectedCustName = (cachedCustomers?.find(c => c.id === custF)?.name || "").toLowerCase();
      invs = invs.filter(inv => inv.customerId === custF || (selectedCustName && (inv.customerName || "").toLowerCase() === selectedCustName));
    } else if (custSearchText) {
      invs = invs.filter(inv => {
        const cName = ((cachedCustomers && cachedCustomers.find(c => c.id === inv.customerId)?.name) || inv.customerName || "").toLowerCase();
        return cName.includes(custSearchText);
      });
    }

    const repF = document.getElementById("inv-rep-filter")?.value;
    const selectedRepName = repF ? cachedReps?.find(r => r.id === repF)?.name : null;
    if (repF) {
      invs = invs.filter(inv => inv.repId === repF || (selectedRepName && inv.repName === selectedRepName));
    }
    const whF = document.getElementById("inv-warehouse-filter")?.value;
    if (whF) {
      invs = invs.filter(inv => inv.warehouseId === whF || inv.sourceWarehouseId === whF);
    }

    // Sort client-side strictly by Date DESC, then Invoice Number DESC
    invs.sort((a, b) => {
      const da = a.date || "";
      const db = b.date || "";
      if (da !== db) return db.localeCompare(da);
      const na = a.number || a.invoiceNumber || a.id || "";
      const nb = b.number || b.invoiceNumber || b.id || "";
      return nb.localeCompare(na);
    });

    const hasMore = false;
    invLastDoc = null;

    // KPIs calculation on active (non-cancelled) invoices
    const activeInvs = invs.filter(i => i.status !== "cancelled");
    const totalSales = activeInvs.reduce((s, i) => s + (i.totalWithVat || i.grandTotal || i.total || 0), 0);

    // Load receipts (سندات القبض) matching current filters
    let totalPaid = 0;
    try {
      const from = document.getElementById("inv-from")?.value;
      const to   = document.getElementById("inv-to")?.value;
      
      let rq = COLS.receipts();
      const rConstraints = [];
      if (from) {
        rConstraints.push(where("date", ">=", from));
      }
      if (to) {
        rConstraints.push(where("date", "<=", to));
      }

      const finalRConstraints = [...rConstraints, orderBy("date", "desc")];
      if (!from && !to && !custF) {
        finalRConstraints.push(limit(100));
      } else {
        finalRConstraints.push(limit(300));
      }

      const receipts = await getAll(COLS.receipts(), finalRConstraints);

      const filteredRcpts = receipts.filter(r => {
        const d = r.date || (r.createdAt?.toDate ? r.createdAt.toDate().toISOString().slice(0,10) : "");
        const matchDate = (!from || d >= from) && (!to || d <= to);
        if (!matchDate) return false;

        if (custF && r.customerId !== custF && r.targetId !== custF) return false;
        if (repF) {
          const matchesRepId = r.repId === repF;
          const matchesRepName = selectedRepName && (r.repName === selectedRepName || r.salesRepName === selectedRepName);
          const matchesCust = activeInvs.some(i => i.customerId === r.customerId || i.customerId === r.targetId || i.customerName === r.customerName || i.customerName === r.targetName);
          if (!matchesRepId && !matchesRepName && !matchesCust) return false;
        }
        return true;
      });
      totalPaid = filteredRcpts.reduce((s, r) => s + parseFloat(r.amount || 0), 0);
    } catch(e) {
      totalPaid = activeInvs.reduce((s, i) => s + (parseFloat(i.amountPaid || i.paidAmount || 0)), 0);
    }

    const totalUnpaid = Math.max(0, totalSales - totalPaid);
    const zatcaCount = invs.filter(i => i.zatcaStatus === "reported").length;

    document.getElementById("kpi-total").textContent  = formatCurrency(totalSales);
    document.getElementById("kpi-paid").textContent   = formatCurrency(totalPaid);
    document.getElementById("kpi-unpaid").textContent = formatCurrency(totalUnpaid);
    document.getElementById("kpi-zatca").textContent  = `${zatcaCount} / ${invs.length}`;
    document.getElementById("inv-count-label").textContent = `${invs.length} فاتورة`;


    if (invs.length === 0) {
      const hasDateFilter = from || to;
      const hasSearch = textFilter || custSearchText || custF;
      tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;padding:36px;color:var(--text-2);">
        <div style="font-size:15px;font-weight:700;margin-bottom:6px;">لا توجد فواتير تطابق شروط البحث والتصفية</div>
        ${hasDateFilter && hasSearch ? `
          <div style="margin-top:10px;">
            <button class="btn btn-sm btn-secondary" onclick="window.invFilterRange('all')" style="border:1.5px solid var(--brand);color:var(--brand);font-weight:700;">
              📅 البحث في جميع الفترات والتواريخ
            </button>
          </div>` : ''}
      </td></tr>`;
    } else {
      tbody.innerHTML = invs.map(inv => `
        <tr style="cursor:pointer;" onclick="viewInvoice('${inv.id}')">
          <td class="mono text-indigo">${inv.number || inv.invoiceNumber || inv.id.slice(0,8)}</td>
          <td class="dim">${formatDate(inv.date)}</td>
          <td class="font-semibold">${(cachedCustomers && cachedCustomers.find(c => c.id === inv.customerId)?.name) || inv.customerName || "—"}</td>
          <td class="dim">${inv.repName || "—"}</td>
          <td class="dim" style="font-size:11px;">${inv.warehouseName || (cachedWarehouses && cachedWarehouses.find(w => w.id === inv.warehouseId)?.name) || "—"}</td>
          <td class="mono font-bold">${formatCurrency(inv.subtotal)}</td>
          <td class="mono text-warn">${formatCurrency(inv.totalVat || inv.vatAmount || 0)}</td>
          <td class="mono">${formatCurrency(inv.totalWithVat || inv.total || 0)}</td>
          <td>${getInvoiceStatusBadge(inv.status)}</td>
          <td>${inv.zatcaStatus === "reported"
            ? '<span class="zatca-stamp reported">✓ مُرسلة</span>'
            : '<span class="zatca-stamp pending">معلقة</span>'}</td>
          <td style="font-size:11px;">${inv.journalEntryId
            ? '<span class="badge good" style="font-size:10px;">✓ مُرحَّل</span>'
            : '<span class="badge" style="font-size:10px; background:var(--bg-3); color:var(--text-2);">—</span>'}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-icon sm btn-ghost" onclick="event.stopPropagation();viewInvoice('${inv.id}')" title="عرض">👁️</button>
              ${inv.status !== "cancelled" ? `<button class="btn btn-icon sm btn-ghost" onclick="event.stopPropagation();editInvoice('${inv.id}')" title="تعديل">✏️</button>` : ""}
              ${inv.status !== "cancelled" ? `<button class="btn btn-icon sm btn-ghost" onclick="event.stopPropagation();cancelInvoice('${inv.id}')" title="إلغاء" style="color:var(--bad);">🚫</button>` : ""}
              <button class="btn btn-icon sm btn-ghost text-bad" onclick="event.stopPropagation();deleteInvoice('${inv.id}','${inv.number}')" title="حذف">🗑️</button>
            </div>
          </td>
        </tr>`).join("");
    }

    document.getElementById("inv-next")?.toggleAttribute("disabled", !hasMore);
    document.getElementById("inv-prev")?.toggleAttribute("disabled", invCurrentPage === 0);
    document.getElementById("inv-page-info").textContent = `صفحة ${invCurrentPage + 1}`;

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="12"><div class="alert bad" style="margin:8px;">${err.message}</div></td></tr>`;
  }
}

window.clearInvoiceCustomerFilter = () => {
  const custSearchInp = document.getElementById("inv-customer-search-input");
  if (custSearchInp) custSearchInp.value = "";
  const custSel = document.getElementById("inv-customer-filter");
  if (custSel) custSel.value = "";
  const clearBtn = document.getElementById("inv-customer-clear-btn");
  if (clearBtn) clearBtn.style.display = "none";
  loadInvoicesList();
};

window.onCustomerSelectChange = () => {
  const custSel = document.getElementById("inv-customer-filter");
  const custSearchInp = document.getElementById("inv-customer-search-input");
  const clearBtn = document.getElementById("inv-customer-clear-btn");
  if (custSel && custSearchInp) {
    const selectedOpt = custSel.options[custSel.selectedIndex];
    if (custSel.value) {
      custSearchInp.value = selectedOpt ? selectedOpt.text : "";
      if (clearBtn) clearBtn.style.display = "block";
    } else {
      custSearchInp.value = "";
      if (clearBtn) clearBtn.style.display = "none";
    }
  }
  loadInvoicesList();
};

window.invFilterRange = (range) => {
  const today = todayString();
  if (range === "today") {
    document.getElementById("inv-from").value = today;
    document.getElementById("inv-to").value   = today;
  } else if (range === "month") {
    document.getElementById("inv-from").value = new Date(new Date().setDate(1)).toISOString().split("T")[0];
    document.getElementById("inv-to").value   = today;
  } else if (range === "all") {
    document.getElementById("inv-from").value = "";
    document.getElementById("inv-to").value   = "";
  }
  document.querySelectorAll(".quick-filter-btn").forEach(b => b.classList.remove("active"));
  const btn = document.getElementById(`qf-${range}`);
  if (btn) btn.classList.add("active");
  loadInvoicesList();
};

// ── New Invoice (Instant 0ms Modal Open) ──
window.openNewInvoice = () => {
  invoiceLines = [];
  selectedCustomer = null;
  window._editingInvoiceId = null;
  window._editingInvoiceVersion = null;
  window._editingOldInvoice = null;
  window._editingOldLines = null;

  const btn = document.getElementById("save-inv-btn");
  if (btn) btn.textContent = "💾 حفظ وإصدار الفاتورة";

  // Reset form immediately
  document.getElementById("inv-number").value = "جارٍ التوليد…";
  document.getElementById("customer-search").value = "";
  document.getElementById("customer-id").value = "";
  document.getElementById("inv-date").value = todayString();
  document.getElementById("inv-payment").value = "credit";
  document.getElementById("inv-paid-amount").value = "";
  document.getElementById("inv-notes").value = "";
  document.getElementById("credit-status-bar").classList.add("hidden"); document.getElementById("inv-aging-alert")?.classList.add("hidden");
  document.getElementById("donation-badge")?.classList.add("hidden");
  document.getElementById("inv-form-error").classList.add("hidden");

  const globalDiscValEl = document.getElementById("inv-global-discount-val");
  const globalDiscTypeEl = document.getElementById("inv-global-discount-type");
  if (globalDiscValEl) globalDiscValEl.value = "0";
  if (globalDiscTypeEl) globalDiscTypeEl.value = "amount";

  renderInvoiceLines();
  updateInvoiceTotals();
  setupCustomerAutocomplete();
  setupProductAutocomplete();

  // OPEN MODAL INSTANTLY (0ms response time!)
  openModal("new-invoice-modal");

  // Load dropdowns & invoice number in background asynchronously
  loadRepsDropdown();
  loadWarehousesDropdown();
  loadProductsAndCategories();
  generateInvoiceNumber("INV").then(num => {
    const el = document.getElementById("inv-number");
    if (el) el.value = num;
  }).catch(() => {});
};

async function loadRepsDropdown() {
  const sel = document.getElementById("inv-rep");
  if (!sel) return;
  if (cachedReps) {
    sel.innerHTML = '<option value="">بيع مباشر (بدون مندوب)</option>' +
      cachedReps.map(r => `<option value="${r.id}" data-name="${r.name}">${r.name}</option>`).join("");
    return;
  }
  try {
    cachedReps = await getAll(COLS.salesReps(), [orderBy("name")]);
    sel.innerHTML = '<option value="">بيع مباشر (بدون مندوب)</option>' +
      cachedReps.map(r => `<option value="${r.id}" data-name="${r.name}">${r.name}</option>`).join("");
  } catch {}
}

async function loadWarehousesDropdown() {
  const sel = document.getElementById("inv-warehouse");
  if (!sel) return;

  const buildOptions = () => {
    sel.innerHTML = '<option value="">اختر المخزن</option>' +
      cachedWarehouses.map(w => `<option value="${w.id}" data-name="${w.name}">${w.name}</option>`).join("");
    // Auto-select first warehouse if none is selected
    if (!sel.value && cachedWarehouses.length > 0) {
      sel.value = cachedWarehouses[0].id;
    }
    // Re-render lines so available qty updates
    renderInvoiceLines();
  };

  // Re-render lines whenever warehouse changes
  if (!sel._whChangeListenerAttached) {
    sel.addEventListener("change", () => renderInvoiceLines());
    sel._whChangeListenerAttached = true;
  }

  if (cachedWarehouses) {
    buildOptions();
    return;
  }
  try {
    cachedWarehouses = await getAll(COLS.warehouses(), [orderBy("name")]);
    buildOptions();
  } catch {}
}

let cachedCostCenters = null;
async function loadCostCentersDropdown() {
  const sel = document.getElementById("inv-cost-center");
  if (!sel) return;
  try {
    if (!cachedCostCenters) {
      const ccList = await getAll(COLS.costCenters()).catch(() => []);
      cachedCostCenters = ccList.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
    }
    sel.innerHTML = '<option value="">بدون مركز تكلفة</option>' +
      cachedCostCenters.map(c => `<option value="${c.id}" data-name="${c.name}">${c.code || ''} — ${c.name}</option>`).join("");
  } catch(e) {
    console.warn("Failed to load cost centers dropdown:", e);
  }
}

window.autoSelectCostCenter = () => {
  const ccSel = document.getElementById("inv-cost-center");
  if (!ccSel) return;
  const whId = document.getElementById("inv-warehouse")?.value;
  const repId = document.getElementById("inv-rep")?.value;

  if (whId && cachedWarehouses) {
    const wh = cachedWarehouses.find(w => w.id === whId);
    if (wh && (wh.costCenterId || wh.costCenter)) {
      ccSel.value = wh.costCenterId || wh.costCenter;
      return;
    }
  }
  if (repId && cachedReps) {
    const rep = cachedReps.find(r => r.id === repId);
    if (rep && rep.assignedWarehouseId && cachedWarehouses) {
      const wh = cachedWarehouses.find(w => w.id === rep.assignedWarehouseId);
      if (wh && (wh.costCenterId || wh.costCenter)) {
        ccSel.value = wh.costCenterId || wh.costCenter;
      }
    }
  }

  // تحديث أسعار البيع السابقة للأصناف الحالية فور اختيار أو تغيير العميل
  if (id && invoiceLines.length > 0) {
    refreshLastPricesForCustomer(id);
  }
};

function setupCustomerAutocomplete() {
  const input = document.getElementById("customer-search");
  const results = document.getElementById("customer-results");
  if (!input) return;

  input.addEventListener("input", debounce(async () => {
    const term = input.value.trim().toLowerCase();
    if (!term) { results.classList.add("hidden"); return; }

    try {
      if (!cachedCustomers || cachedCustomers.length === 0) {
        cachedCustomers = await getAll(COLS.customers(), [orderBy("name")]);
      }

      const custs = cachedCustomers.filter(c => 
        (c.name || "").toLowerCase().includes(term) ||
        (c.phone || "").includes(term)
      ).slice(0, 15);

      if (custs.length === 0) { results.classList.add("hidden"); return; }

      results.innerHTML = custs.map(c => `
        <div class="autocomplete-item" onclick="selectCustomer('${c.id}','${c.name.replace(/'/g, "\\'")}',${c.creditLimit||0},${c.balance||0})">
          <div>${c.name}</div>
          <div class="item-code">${c.phone || ""} | حد: ${formatCurrency(c.creditLimit || 0)}</div>
        </div>`).join("");
      results.classList.remove("hidden");
    } catch (err) {
      console.warn("setupCustomerAutocomplete error:", err);
    }
  }, 100));

  document.addEventListener("click", (e) => {
    if (!input.contains(e.target)) results.classList.add("hidden");
  });
}

window.selectCustomer = (id, name, creditLimit, balance) => {
  selectedCustomer = { id, name, creditLimit, balance };
  document.getElementById("customer-search").value = name;
  document.getElementById("customer-id").value = id;
  document.getElementById("customer-results").classList.add("hidden");

  // ── Broker Commission Detection ──
  const fullCust = (cachedCustomers || []).find(c => c.id === id);
  const brokerAlert = document.getElementById("inv-broker-alert");
  if (fullCust?.hasBrokerCommission && parseFloat(fullCust?.brokerRate) > 0) {
    selectedCustomer.hasBrokerCommission = true;
    selectedCustomer.brokerName = fullCust.brokerName || "زياد";
    selectedCustomer.brokerRate = parseFloat(fullCust.brokerRate) || 1.0;
    selectedCustomer.brokerTrigger = fullCust.brokerTrigger || "on_payment";
    selectedCustomer.brokerAccountCode = fullCust.brokerAccountCode || "2-1-4-2";
    selectedCustomer.brokerExpenseCode = fullCust.brokerExpenseCode || "5-4-10";

    if (brokerAlert) {
      brokerAlert.style.display = "block";
      brokerAlert.innerHTML = `💼 <strong>عميل مرتبط بعمولة وسيط (${selectedCustomer.brokerName}):</strong> يتم إضافة نسبة (+${selectedCustomer.brokerRate}%) آلياً على أي سعر أساسي تدخله قبل الضريبة (الاستحقاق: عند سداد الفاتورة).`;
    }
  } else {
    selectedCustomer.hasBrokerCommission = false;
    if (brokerAlert) brokerAlert.style.display = "none";
  }

  const donationBadge = document.getElementById("donation-badge");
  const isDonation = id === "005" || name.includes("سلة البركة");

  if (isDonation) {
    if (donationBadge) {
      donationBadge.textContent = "🎁 عميل تبرعات (معفى من الضريبة وتكلفتها مصروف تبرعات)";
      donationBadge.classList.remove("hidden");
    }
    document.getElementById("credit-status-bar")?.classList.add("hidden"); document.getElementById("inv-aging-alert")?.classList.add("hidden");
  } else {
    if (donationBadge) {
      donationBadge.classList.add("hidden");
    }

    // Show credit status
    if (creditLimit > 0) {
      const pct = Math.min((balance / creditLimit) * 100, 100);
      const statusEl = document.getElementById("credit-status-bar");
      const fillEl   = document.getElementById("credit-fill");
      const numbersEl = document.getElementById("credit-numbers");
      const labelEl   = document.getElementById("credit-label");

      statusEl.classList.remove("hidden");
      fillEl.style.width = pct + "%";
      numbersEl.textContent = `${formatCurrency(balance)} / ${formatCurrency(creditLimit)}`;

      if (pct >= 100) {
        fillEl.className = "fill bad";
        labelEl.textContent = "⚠️ تجاوز حد الائتمان";
      } else if (pct >= 80) {
        fillEl.className = "fill warn";
        labelEl.textContent = "⚠️ قارب حد الائتمان";
      } else {
        fillEl.className = "fill good";
        labelEl.textContent = "الرصيد المستخدم";
      }
    } else {
      document.getElementById("credit-status-bar")?.classList.add("hidden"); document.getElementById("inv-aging-alert")?.classList.add("hidden");
    }

    // Show Aging & Outstanding Balance Alert
    const agingAlert = document.getElementById("inv-aging-alert");
    if (agingAlert) {
      if (balance > 0) {
        agingAlert.classList.remove("hidden");
        const days = fullCust?.creditDays || 0;
        if (days > 0) {
          agingAlert.style.background = "#fff7ed";
          agingAlert.style.border = "1px solid #fed7aa";
          agingAlert.style.color = "#c2410c";
          agingAlert.innerHTML = `⚠️ <b>تنبيه ائتماني:</b> العميل عليه مديونية سابقة بقيمة <b>${formatCurrency(balance)}</b> (مهلة السداد: ${days} يوماً). يرجى التأكد من التزام العميل قبل تسليم بضاعة جديدة.`;
        } else {
          agingAlert.style.background = "#fef2f2";
          agingAlert.style.border = "1px solid #fecaca";
          agingAlert.style.color = "#b91c1c";
          agingAlert.innerHTML = `⚠️ <b>تنبيه مديونية:</b> العميل عليه مديونية قائمة بقيمة <b>${formatCurrency(balance)}</b> بدون مهلة ائتمانية (حساب فوري/نقدي).`;
        }
      } else {
        agingAlert.classList.remove("hidden");
        agingAlert.style.background = "#f0fdf4";
        agingAlert.style.border = "1px solid #bbf7d0";
        agingAlert.style.color = "#15803d";
        agingAlert.innerHTML = `✅ <b>الوضع الائتماني:</b> رصيد العميل 0.00 ر.س (لا توجد مديونيات سابقة معلقة).`;
      }
    }
  }

  // تحديث أسعار البيع السابقة للأصناف الحالية فور اختيار أو تغيير العميل
  if (id && invoiceLines.length > 0) {
    refreshLastPricesForCustomer(id);
  }
};

function setupProductAutocomplete() {
  const input = document.getElementById("product-search-input");
  const results = document.getElementById("product-search-results");
  const catFilter = document.getElementById("inv-product-category-filter");
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

    const whId = document.getElementById("inv-warehouse")?.value;
    const cacheKey = `companies/${COMPANY_ID}/stockByWarehouse`;
    const cachedObj = window.ERP_CACHE[cacheKey];
    let stockCache = [];
    if (cachedObj) {
      if (Array.isArray(cachedObj.data)) {
        stockCache = cachedObj.data;
      } else if (Array.isArray(cachedObj)) {
        stockCache = cachedObj;
      }
    }

    results.innerHTML = matched.map(p => {
      const qty = whId
        ? (stockCache.find(s => s.productId === p.id && s.warehouseId === whId)?.qty || 0)
        : stockCache.filter(s => s.productId === p.id).reduce((sum, s) => sum + (s.qty || 0), 0);
      const qtyClass = qty > 0 ? "badge good" : "badge bad";

      const safeName  = (p.name || '').replace(/'/g, '’');
      const safeUnit  = (p.unit || 'PCS').replace(/'/g, '’');
      const safeCat   = (p.taxCategory || 'S');
      const safePrice = p.salePrice || 0;
      // ✅ FIX: أولوية التكلفة: averageCost (محسوب من المشتريات) → costPrice → purchasePrice → 0
      // ✅ أولوية التكلفة: المتوسط المرجح WAC
      const safeCost  = p.averageCost || p.costPrice || p.lastPurchasePrice || p.avgCostPrice || p.purchasePrice || 0;
      const safeAltUnit = (p.altUnit || '').replace(/'/g, '&#39;');
      const safeFactor = parseFloat(p.unitFactor) || 1;
      const expMargin = safePrice > 0 ? (((safePrice - safeCost) / safePrice) * 100).toFixed(1) : 0;
      return `
        <div class="autocomplete-item" onclick="addProductLine('${p.id}','${safeName}',${safePrice},'${safeUnit}','${safeCat}',${safeCost},'${safeAltUnit}',${safeFactor})">
          <div class="flex justify-between">
            <span style="font-weight:700;">${p.name}</span>
            <div>
              <span class="mono text-indigo font-bold" style="margin-left:12px;">${formatCurrency(p.salePrice)}</span>
              <span class="${qtyClass}" style="font-size:10px;">المتاح: ${qty}</span>
            </div>
          </div>
          <div class="item-code" style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
            <span>${p.sku || ''} | ${translateUnit(p.unit)||''}
              ${p.altUnit && p.unitFactor > 1 ? `<span style="color:#d97706;font-weight:700;"> 📦 ${p.unitFactor} ${translateUnit(p.unit)} = 1 ${translateUnit(p.altUnit)}</span>` : ''}
            </span>
            <span style="font-size:10.5px; color:#475569;">
              متوسط التكلفة: <b style="color:#0f172a;">${formatCurrency(safeCost)}</b>
              <span class="badge ${expMargin >= 0 ? 'good' : 'bad'}" style="font-size:9.5px; padding:1px 5px; margin-right:4px;">هامش: ${expMargin}%</span>
            </span>
          </div>
        </div>`;
    }).join("");
    results.classList.remove("hidden");
  };

  input.addEventListener("input", debounce(performSearch, 200));
  input.addEventListener("focus", performSearch);
  if (catFilter) {
    catFilter.addEventListener("change", performSearch);
  }

  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !results.contains(e.target) && (!catFilter || !catFilter.contains(e.target)))
      results.classList.add("hidden");
  });
}

async function loadProductsAndCategories() {
  try {
    const cacheKey = `companies/${COMPANY_ID}/stockByWarehouse`;
    const [pSnap, cSnap, stockList] = await Promise.all([
      allProducts.length === 0 ? getAll(COLS.products(), [orderBy("name")]) : Promise.resolve(allProducts),
      allCategories.length === 0 ? getAll(COLS.categories(), [orderBy("name")]) : Promise.resolve(allCategories),
      getAll(COLS.stockByWarehouse())
    ]);
    
    allProducts = pSnap;
    allCategories = cSnap;
    window.ERP_CACHE[cacheKey] = stockList || [];

    const catFilter = document.getElementById("inv-product-category-filter");
    if (catFilter) {
      catFilter.innerHTML = '<option value="">كل الفئات</option>' + 
        allCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    }
  } catch (err) {
    console.error("loadProductsAndCategories error:", err);
  }
}

window.addProductLine = (productId, productName, unitPrice, unit, taxCategory, costPrice = 0, altUnit = '', unitFactor = 1) => {
  document.getElementById("product-search-input").value = "";
  document.getElementById("product-search-results").classList.add("hidden");

  const parsedFactor = parseFloat(unitFactor) || 1;
  const defaultToAlt = !!(altUnit && parsedFactor > 1);
  // basePricePerUnit = salePrice as entered = price per altUnit (carton/box)
  const basePricePerUnit = parseFloat(unitPrice) || 0;
  // Default to carton → show carton price. Default to piece → show carton÷factor
  const initialPrice = defaultToAlt ? basePricePerUnit : (parsedFactor > 1 ? parseFloat((basePricePerUnit / parsedFactor).toFixed(4)) : basePricePerUnit);
  const selectedUnit = defaultToAlt ? altUnit : unit;

  // Auto-calculate broker markup (+1%) if customer has broker commission
  let lineUnitPrice = initialPrice;
  let lineBasePrice = initialPrice;
  let lineCommPerUnit = 0;
  if (selectedCustomer?.hasBrokerCommission && selectedCustomer?.brokerRate > 0) {
    const rate = parseFloat(selectedCustomer.brokerRate) || 1.0;
    lineUnitPrice = parseFloat((initialPrice * (1 + rate / 100)).toFixed(2));
    lineBasePrice = initialPrice;
    lineCommPerUnit = parseFloat((lineUnitPrice - lineBasePrice).toFixed(2));
  }

  // 🛡️ SMART DUPLICATE PREVENTION & AUTO-MERGE:
  // If the product already exists with the same unit, increment qty instead of duplicating the row!
  const existingIdx = invoiceLines.findIndex(l => 
    l.productId === productId && 
    (l.selectedUnit || l.unit) === selectedUnit && 
    !l.isCustom && 
    !String(l.productId || '').startsWith('adhoc_')
  );

  if (existingIdx !== -1) {
    const exLine = invoiceLines[existingIdx];
    exLine.qty = (parseFloat(exLine.qty) || 0) + 1;
    renderInvoiceLines();
    updateInvoiceTotals();
    window.resolveLineBatches(existingIdx);

    if (window.showToast) {
      window.showToast(`تمت زيادة كمية (${productName}) إلى ${exLine.qty} في السطر (${existingIdx + 1}) بدلاً من تكرار الصنف`, "info", 3000);
    }

    setTimeout(() => {
      const tbody = document.getElementById("invoice-lines-tbody");
      const row = tbody?.children[existingIdx];
      if (row) {
        row.style.transition = "background-color 0.4s ease";
        row.style.backgroundColor = "rgba(16, 185, 129, 0.25)";
        row.scrollIntoView({ behavior: "smooth", block: "nearest" });
        setTimeout(() => { row.style.backgroundColor = ""; }, 1500);
      }
    }, 50);
    return;
  }

  invoiceLines.push({
    productId, productName, unit,
    altUnit: altUnit || '',
    unitFactor: parsedFactor,
    selectedUnit: defaultToAlt ? altUnit : unit,
    basePricePerUnit,          // always per base unit — used for price recalc on unit switch
    unitCode: (() => {
      const map = {
        "Carton": "CTN", "كرتون": "CTN",
        "Piece": "PCE", "حبة": "PCE",
        "Box": "BOX", "صندوق": "BOX",
        "Bag": "BAG", "كيس": "BAG",
        "Bale": "BL", "بالة": "BL",
        "Barrel": "BLL", "برميل": "BLL",
        "Pack": "PK", "شد / ربطة": "PK",
        "Sack": "SA", "شوال": "SA",
        "Tray": "TY", "طبق": "TY",
        "Gallon": "GLI", "جالون": "GLI",
        "Kilogram": "KGM", "كجم": "KGM",
        "Ton": "TNE", "طن": "TNE",
        "Liter": "LTR", "لتر": "LTR"
      };
      return map[unit] || "PCE";
    })(),
    taxCategory: taxCategory || "S",
    qty: 1, unitPrice: (typeof lineUnitPrice !== 'undefined' ? lineUnitPrice : initialPrice),
    basePrice: (typeof lineBasePrice !== 'undefined' ? lineBasePrice : initialPrice),
    brokerCommissionPerUnit: (typeof lineCommPerUnit !== 'undefined' ? lineCommPerUnit : 0),
    brokerCommissionTotal: (typeof lineCommPerUnit !== 'undefined' ? lineCommPerUnit : 0),
    discount: 0,
    discountType: "percent",
    costPrice: costPrice || 0,
    averageCost: costPrice || 0,
    batchNumber: "",
    expiryDate: "",
    availableBatches: []
  });
  
  const lineIdx = invoiceLines.length - 1;
  renderInvoiceLines();
  updateInvoiceTotals();
  
  window.resolveLineBatches(lineIdx);

  // جلب آخر سعر بيع لهذا الصنف مع العميل الحالي تلقائياً
  if (selectedCustomer?.id) {
    attachLastPriceToLine(lineIdx, selectedCustomer.id, productId, selectedUnit);
  }
};

function renderInvoiceLines() {
  const tbody = document.getElementById("invoice-lines-tbody");
  if (!tbody) return;

  if (invoiceLines.length === 0) {
    tbody.innerHTML = `<tr><td colspan="13" style="text-align:center;padding:16px;color:var(--text-2);font-size:12px;">لم يتم إضافة أصناف بعد</td></tr>`;
    return;
  }

  const whId = document.getElementById("inv-warehouse")?.value;
  const cacheKey = `companies/${COMPANY_ID}/stockByWarehouse`;
  const cachedObj = window.ERP_CACHE[cacheKey];
  let stockCache = [];
  if (cachedObj) {
    if (Array.isArray(cachedObj.data)) {
      stockCache = cachedObj.data;
    } else if (Array.isArray(cachedObj)) {
      stockCache = cachedObj;
    }
  }

  tbody.innerHTML = invoiceLines.map((line, i) => {
    const lineTotal = calcLineTotal(line.qty, line.unitPrice, line.discount, line.discountType || "percent");
    const vatAmt = line.taxCategory === "S" ? (lineTotal * 0.15) : 0;
    // If warehouse selected, find stock for that warehouse; otherwise sum all warehouses
    let avail = 0;
    if (whId) {
      const stockItem = stockCache.find(s => s.productId === line.productId && s.warehouseId === whId);
      avail = stockItem ? (stockItem.qty || 0) : 0;
    } else {
      // Sum across all warehouses
      avail = stockCache
        .filter(s => s.productId === line.productId)
        .reduce((sum, s) => sum + (s.qty || 0), 0);
    }

    // In edit mode: If current warehouse matches old invoice warehouse (or no warehouse filter),
    // add back the original quantity of this product from the invoice being edited
    let oldBaseQty = 0;
    if (window._editingInvoiceId && window._editingOldLines && window._editingOldInvoice) {
      const oldWh = window._editingOldInvoice.warehouseId;
      if (!whId || whId === oldWh) {
        oldBaseQty = window._editingOldLines
          .filter(ol => ol.productId === line.productId)
          .reduce((sum, ol) => {
            const factor = (ol.altUnit && ol.unitFactor > 1 && ol.selectedUnit === ol.altUnit) ? (parseFloat(ol.unitFactor) || 1) : 1;
            return sum + ((parseFloat(ol.qty) || 0) * factor);
          }, 0);
      }
    }

    const totalAvail = avail + oldBaseQty;
    const saleQtyInBaseUnit = (parseFloat(line.qty)||0) * ((line.altUnit && line.unitFactor > 1 && line.selectedUnit === line.altUnit) ? (parseFloat(line.unitFactor)||1) : 1);
    const isOver = !line.isCustom && !String(line.productId || "").startsWith("adhoc_") && (saleQtyInBaseUnit > oldBaseQty && (saleQtyInBaseUnit - oldBaseQty) > avail);

    return `<tr style="border-bottom:1px solid var(--border-soft);">
      <td style="padding:6px 10px;color:var(--text-2);width:30px;">${i + 1}</td>
      <td style="padding:6px 10px;"><span style="font-family:var(--font-heading);font-size:12.5px;">${line.productName}</span></td>
      <td style="padding:6px 6px;min-width:90px;">
        ${(line.altUnit && line.unitFactor > 1)
          ? `<select class="input" style="height:30px;font-size:11px;padding:2px 4px;color:var(--brand);font-weight:700;"
               onchange="updateSalesLineUnit(${i},this.value)">
               <option value="${line.altUnit}" ${line.selectedUnit===line.altUnit?'selected':''}>${translateUnit(line.altUnit)}</option>
               <option value="${line.unit}" ${line.selectedUnit===line.unit?'selected':''}>${translateUnit(line.unit)}</option>
             </select>
             <div style="font-size:9.5px;color:#64748b;margin-top:2px;text-align:center">
               ${line.selectedUnit===line.altUnit
                 ? `1 ${translateUnit(line.altUnit)} = ${line.unitFactor} ${translateUnit(line.unit)}`
                 : translateUnit(line.unit)}
             </div>`
          : `<span style="font-size:11px;color:var(--text-2)">${translateUnit(line.unit||'Piece')}</span>`
        }
      </td>
      <td style="padding:6px 10px;width:80px;">
        <input type="number" class="input mono" style="width:70px;height:30px;font-size:12px;${isOver ? 'border-color:var(--bad);background-color:rgba(239,68,68,0.05);' : ''}"
          value="${line.qty}" min="0.001" step="0.001"
          onchange="updateLine(${i},'qty',this.value)" />
        <div style="font-size:9.5px;margin-top:2px;white-space:nowrap;color:${isOver ? 'var(--bad)' : 'var(--text-dim)'};font-weight:${isOver ? '700' : 'normal'};">
          ${(line.altUnit && line.unitFactor > 1)
            ? `متاح: ${Math.floor(totalAvail/line.unitFactor)} ${translateUnit(line.altUnit)} + ${totalAvail % line.unitFactor} ${translateUnit(line.unit)}`
            : `المتاح: ${totalAvail}`}
        </div>
        ${(line.altUnit && line.unitFactor > 1 && line.selectedUnit === line.altUnit)
          ? `<div style="font-size:9.5px;color:#059669;margin-top:2px;text-align:center;font-weight:700;">
               = ${(parseFloat(line.qty)||0) * line.unitFactor} ${translateUnit(line.unit)}
             </div>`
          : ''}
      </td>
      <td style="padding:6px 8px; width:${selectedCustomer?.hasBrokerCommission ? '145px' : '125px'};">
        <input type="number" class="input mono" style="width:105px; height:30px; font-size:12px; font-weight:bold;"
          value="${(selectedCustomer?.hasBrokerCommission && line.basePrice !== undefined) ? line.basePrice : line.unitPrice}" min="0" step="0.01"
          title="${selectedCustomer?.hasBrokerCommission ? 'أدخل سعر الاتفاق الأساسي وسيضاف عليه الـ 1% تلقائياً' : 'سعر الوحدة'}"
          onchange="updateLine(${i},'unitPrice',this.value)" />
        ${selectedCustomer?.hasBrokerCommission ? `
          <div style="font-size:9.5px; color:#0284c7; font-weight:800; margin-top:2px; white-space:nowrap;">
            سعر الفاتورة: <strong>${line.unitPrice}</strong> <span style="font-size:8.5px; color:#059669;">(+${selectedCustomer.brokerRate}%)</span>
          </div>
        ` : ''}
        ${(line.lastCustomerPrice !== undefined && line.lastCustomerPrice !== null) ? `
          <div style="margin-top:3px; display:inline-flex; align-items:center; gap:3px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:4px; padding:1px 5px; font-size:10px; color:#1e40af; white-space:nowrap; box-shadow:0 1px 2px rgba(0,0,0,0.03);"
               title="آخر بيع لهذا العميل: فاتورة #${line.lastCustomerInvoiceNumber || ''} بتاريخ ${line.lastCustomerInvoiceDate || ''}">
            <span>🏷️ آخر بيع: <strong>${line.lastCustomerPrice}</strong>${line.lastCustomerUnit && line.lastCustomerUnit !== line.selectedUnit ? ` (${translateUnit(line.lastCustomerUnit)})` : ''}</span>
            ${Number(line.lastCustomerPrice) !== Number(line.unitPrice) ? `
              <button type="button" onclick="window.applyLastCustomerPrice(${i})" 
                      style="border:none; background:#2563eb; color:#fff; font-size:9.5px; font-weight:800; padding:1px 5px; border-radius:3px; cursor:pointer; line-height:1.2;"
                      title="تطبيق آخر سعر بيع (${line.lastCustomerPrice} ر.س)">
                تطبيق
              </button>
            ` : '<span style="color:#059669; font-weight:800; font-size:9px;">(مطابق)</span>'}
          </div>
        ` : ''}
      </td>
      <td style="padding:6px 6px; width:110px; text-align:center;">
        <div style="display:inline-flex; align-items:center; gap:2px; background:#fff; border:1px solid #cbd5e1; border-radius:6px; padding:1px 2px;">
          <input type="number" class="input mono font-bold no-spin" style="width:52px; height:26px; font-size:11.5px; text-align:center; padding:1px 3px; border:none; background:transparent; color:#be123c;"
            value="${line.discount || 0}" min="0" ${line.discountType === 'amount' ? '' : 'max="100"'} step="${line.discountType === 'amount' ? '0.01' : '1'}"
            placeholder="0"
            onchange="updateLine(${i},'discount',this.value)" />
          <button type="button" onclick="window.toggleLineDiscountType(${i})" 
            title="تبديل نوع الخصم بين نسبة مئوية (%) ومبلغ نقدي (ر.س)"
            style="border:none; background:${line.discountType === 'amount' ? '#dbeafe' : '#fef2f2'}; color:${line.discountType === 'amount' ? '#1d4ed8' : '#dc2626'}; font-weight:900; font-size:10px; padding:2px 5px; border-radius:4px; cursor:pointer; white-space:nowrap; transition:all 0.15s;">
            ${line.discountType === 'amount' ? 'ر.س' : '%'}
          </button>
        </div>
      </td>
      <td style="padding:6px 8px; text-align:center; white-space:nowrap; background:#f0f9ff;">
        <span class="mono font-bold" style="font-size:11.5px; color:#0369a1;" title="متوسط التكلفة المرجح للصنف (WAC)">${formatCurrency(parseFloat(line.averageCost || line.costPrice || 0))}</span>
      </td>
      <td style="padding:6px 8px; text-align:center; white-space:nowrap; background:#ecfdf5;">
        ${(() => {
          const q = parseFloat(line.qty) || 1;
          const gross = (parseFloat(line.qty) || 0) * (parseFloat(line.unitPrice) || 0);
          let lineDiscAmt = 0;
          if (line.discountType === 'amount') {
            lineDiscAmt = Math.min(gross, Math.max(0, parseFloat(line.discount || 0)));
          } else {
            lineDiscAmt = Math.min(gross, Math.max(0, gross * (parseFloat(line.discount || 0) / 100)));
          }
          const netLineTotal = Math.max(0, gross - lineDiscAmt);
          const effP = q > 0 ? (netLineTotal / q) : 0;
          const uCost = parseFloat(line.averageCost || line.costPrice || 0);
          const mPct = effP > 0 ? ((effP - uCost) / effP) * 100 : 0;
          return `<span class="badge ${mPct >= 0 ? 'good' : 'bad'}" style="font-size:11px; font-weight:800; padding:2px 7px;" title="هامش ربح الصنف وفق المتوسط المرجح: ${mPct.toFixed(1)}% ${mPct < 0 ? '⚠️ بيع بأقل من التكلفة' : ''}">
            ${mPct >= 0 ? '+' : ''}${mPct.toFixed(1)}%
          </span>`;
        })()}
      </td>
      <td style="padding:6px 10px;width:120px;">
        <select class="input mono" style="width:110px;height:30px;font-size:11px;padding:2px 6px;"
          onchange="window.selectLineBatch(${i}, this.value)">
          <option value="">-- افتراضي --</option>
          ${(line.availableBatches || []).map(b => `
            <option value="${b.number}" ${line.batchNumber === b.number ? "selected" : ""}>
              ${b.number} (${b.qty})
            </option>
          `).join("")}
        </select>
      </td>
      <td style="padding:6px 10px;width:110px;">
        <input type="text" class="input mono" style="width:100px;height:30px;font-size:11px;"
          value="${line.expiryDate || ""}" disabled placeholder="—" />
      </td>
      <td style="padding:6px 10px;font-size:11px;">
        ${line.taxCategory === "S" ? `<span class="badge warn" style="font-size:11px; font-weight:700;">${formatCurrency(vatAmt)}</span>` : '<span class="badge good" style="font-size:10px;">0%</span>'}
      </td>
      <td style="padding:6px 10px;" class="mono font-bold">${formatCurrency(lineTotal)}</td>
      <td style="padding:6px 10px;">
        <button class="btn btn-icon sm btn-ghost" onclick="removeLine(${i})" style="color:var(--bad);">✕</button>
      </td>
    </tr>`;
  }).join("");
}

// Asynchronously resolve batches for a specific invoice line (FEFO)
window.resolveLineBatches = async (lineIdx) => {
  const line = invoiceLines[lineIdx];
  if (!line || !line.productId) return;
  const whId = document.getElementById("inv-warehouse")?.value || "";

  try {
    const q = query(COLS.stockTransactions(), where("productId", "==", line.productId));
    const snap = await getDocs(q);
    const txs = snap.docs.map(d => d.data());

    const batchMap = {};
    txs.forEach(t => {
      if (whId && t.warehouseId !== whId) return;
      if (t.batchNumber) {
        if (!batchMap[t.batchNumber]) {
          batchMap[t.batchNumber] = { qty: 0, expiryDate: t.expiryDate || "" };
        }
        batchMap[t.batchNumber].qty += t.qtyChange || 0;
      }
    });

    const available = Object.keys(batchMap)
      .map(num => ({ number: num, ...batchMap[num] }))
      .filter(b => b.qty > 0.001)
      .sort((a, b) => {
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return new Date(a.expiryDate) - new Date(b.expiryDate);
      });

    line.availableBatches = available;

    if (available.length > 0) {
      if (!line.batchNumber) {
        line.batchNumber = available[0].number;
        line.expiryDate = available[0].expiryDate;
      }
    } else {
      line.batchNumber = "";
      line.expiryDate = "";
    }
  } catch (err) {
    console.error("resolveLineBatches error:", err);
  }

  renderInvoiceLines();
};

window.resolveAllLineBatches = () => {
  invoiceLines.forEach((_, idx) => {
    window.resolveLineBatches(idx);
  });
};

window.selectLineBatch = (idx, batchNum) => {
  const line = invoiceLines[idx];
  if (!line) return;
  line.batchNumber = batchNum;
  const found = (line.availableBatches || []).find(b => b.number === batchNum);
  line.expiryDate = found ? found.expiryDate : "";
  renderInvoiceLines();
};

window.updateLine = (idx, field, val) => {
  const line = invoiceLines[idx];
  if (!line) return;
  const numVal = parseFloat(val) || 0;

  if (field === 'unitPrice' && selectedCustomer?.hasBrokerCommission && selectedCustomer?.brokerRate > 0) {
    const rate = parseFloat(selectedCustomer.brokerRate) || 1.0;
    const baseP = numVal;
    const finalP = parseFloat((baseP * (1 + rate / 100)).toFixed(2));
    line.basePrice = baseP;
    line.unitPrice = finalP;
    line.brokerCommissionPerUnit = parseFloat((finalP - baseP).toFixed(2));
    line.brokerCommissionTotal = parseFloat((line.brokerCommissionPerUnit * (parseFloat(line.qty) || 0)).toFixed(2));
  } else {
    line[field] = numVal;
    if (field === 'qty' && selectedCustomer?.hasBrokerCommission && line.brokerCommissionPerUnit) {
      line.brokerCommissionTotal = parseFloat((line.brokerCommissionPerUnit * numVal).toFixed(2));
    }
  }

  renderInvoiceLines();
  updateInvoiceTotals();
};

window.updateSalesLineUnit = (i, newUnit) => {
  const l = invoiceLines[i];
  if (!l) return;
  const oldUnit = l.selectedUnit;
  l.selectedUnit = newUnit;

  // Auto-adjust price based on unit switch
  const factor = parseFloat(l.unitFactor) || 1;
  const base = parseFloat(l.basePricePerUnit) || 0;
  if (factor > 1 && base > 0) {
    if (newUnit === l.altUnit) {
      // Switching to carton → show salePrice (carton price as entered in product)
      l.unitPrice = base;
    } else {
      // Switching to piece/box/bag → salePrice ÷ factor
      l.unitPrice = parseFloat((base / factor).toFixed(4));
    }
  }

  renderInvoiceLines();
  updateInvoiceTotals();

  // تحديث آخر سعر بيع بحسب الوحدة الجديدة المختارة
  if (selectedCustomer?.id && l.productId) {
    attachLastPriceToLine(i, selectedCustomer.id, l.productId, newUnit);
  }
};


window.removeLine = (idx) => {
  invoiceLines.splice(idx, 1);
  renderInvoiceLines();
  updateInvoiceTotals();
};

window.toggleLineDiscountType = (i) => {
  const line = invoiceLines[i];
  if (!line) return;
  line.discountType = line.discountType === "amount" ? "percent" : "amount";
  renderInvoiceLines();
  updateInvoiceTotals();
};

window.onGlobalDiscountChanged = () => {
  updateInvoiceTotals();
};

async function updateInvoiceTotals() {
  const settings = await getPricingSettings();
  const payment = document.getElementById("inv-payment")?.value || "credit";
  const paidInput = document.getElementById("inv-paid-amount");
  
  if (payment === "credit" && window.event && window.event.type === "change") {
    if (paidInput) paidInput.value = "0";
  } else if (payment === "cash" && window.event && window.event.type === "change") {
    if (paidInput) paidInput.value = ""; // Default to full amount
  }
  
  const isDonation = selectedCustomer?.id === "005" || (selectedCustomer?.name || "").includes("سلة البركة");
  if (isDonation) {
    invoiceLines.forEach(l => { l.taxCategory = "E"; });
  }

  // Calculate base totals using default formula (respects line-level taxCategory: 'E', 'Z', etc.)
  const totals = calcInvoiceTotals(invoiceLines);
  
  let additionalDiscountPct = 0;
  
  // 1. Cash discount
  if (settings.enableCashDiscount && (payment === "cash" || payment === "transfer")) {
    additionalDiscountPct += settings.cashDiscountRate || 0;
  }
  
  // 2. Volume discount
  const totalQty = invoiceLines.reduce((sum, l) => sum + (l.qty || 0), 0);
  if (settings.enableVolumeDiscount && totalQty >= (settings.volumeDiscountThreshold || 50)) {
    additionalDiscountPct += settings.volumeDiscountRate || 0;
  }

  // If there are additional automatic discounts, apply them to subtotal
  let autoDiscountAmount = 0;
  if (additionalDiscountPct > 0) {
    autoDiscountAmount = Math.round((totals.subtotal * (additionalDiscountPct / 100)) * 100) / 100;
  }

  // 3. Manual global discount on invoice
  const globalDiscVal = parseFloat(document.getElementById("inv-global-discount-val")?.value) || 0;
  const globalDiscType = document.getElementById("inv-global-discount-type")?.value || "amount";

  let globalDiscAmt = 0;
  if (globalDiscType === "percent") {
    globalDiscAmt = Math.round((totals.subtotal * (Math.min(100, Math.max(0, globalDiscVal)) / 100)) * 100) / 100;
  } else {
    globalDiscAmt = Math.min(totals.subtotal, Math.max(0, globalDiscVal));
  }

  const totalInvoiceLevelDiscount = globalDiscAmt + autoDiscountAmount;
  const finalSubtotal = isDonation ? 0 : Math.max(0, totals.subtotal - totalInvoiceLevelDiscount);
  const discountRatio = totals.subtotal > 0 ? (totalInvoiceLevelDiscount / totals.subtotal) : 0;
  const finalVat = isDonation ? 0 : Math.round((totals.vatTotal * (1 - discountRatio)) * 100) / 100;
  const finalGrand = Math.round((finalSubtotal + finalVat) * 100) / 100;

  const fmt = (n) => `${formatCurrency(n)}`;
  document.getElementById("total-subtotal").textContent  = fmt(totals.subtotal + totals.discountTotal);
  
  // Display total discount including line discounts and invoice-level discounts
  const totalDiscount = totals.discountTotal + totalInvoiceLevelDiscount;
  document.getElementById("total-discount").textContent  = `- ${fmt(totalDiscount)}`;
  document.getElementById("total-vat").textContent       = fmt(finalVat);
  document.getElementById("total-grand").textContent     = fmt(finalGrand);

  // Real-time Estimated Profit & Margin KPIs
  // Profit = finalSubtotal (excl. VAT) - totalCost
  // ✅ FIX: استخدم averageCost بالأولوية — هو التكلفة الحقيقية المحسوبة من المشتريات
  const totalCost = invoiceLines.reduce((sum, l) => {
    const unitCost = l.averageCost || l.costPrice || 0;
    return sum + (unitCost * (l.qty || 0));
  }, 0);
  const totalRevenue = finalSubtotal; // net revenue before VAT
  const estimatedProfit = totalRevenue - totalCost;
  const profitMarginPct = totalRevenue > 0 ? (estimatedProfit / totalRevenue) * 100 : 0;

  const profitEl = document.getElementById("total-profit");
  const marginEl = document.getElementById("total-margin");
  if (profitEl) {
    profitEl.textContent = fmt(estimatedProfit);
    // Color code: red if loss/zero profit, green if positive profit
    if (estimatedProfit > 0) {
      profitEl.className = "mono font-bold text-good";
    } else {
      profitEl.className = "mono font-bold text-bad";
    }
  }
  if (marginEl) {
    marginEl.textContent = `${profitMarginPct.toFixed(1)}%`;
    if (profitMarginPct > 0) {
      marginEl.className = "mono font-bold text-good";
    } else {
      marginEl.className = "mono font-bold text-bad";
    }
  }

  // Update Live Top HUD
  const hudLines = document.getElementById("inv-hud-lines-count");
  const hudSub = document.getElementById("inv-hud-subtotal");
  const hudCost = document.getElementById("inv-hud-cost");
  const hudProfit = document.getElementById("inv-hud-profit");
  const hudMargin = document.getElementById("inv-hud-margin");

  if (hudLines) hudLines.textContent = invoiceLines.length;
  const itemsBadge = document.getElementById("inv-items-badge");
  if (itemsBadge) itemsBadge.textContent = `${invoiceLines.length} صنف`;
  if (hudSub) hudSub.textContent = fmt(finalSubtotal);
  if (hudCost) hudCost.textContent = fmt(totalCost);
  if (hudProfit) {
    hudProfit.textContent = `${estimatedProfit >= 0 ? '+' : ''}${fmt(estimatedProfit)}`;
    hudProfit.style.color = estimatedProfit >= 0 ? "#16a34a" : "#dc2626";
  }
  if (hudMargin) {
    hudMargin.textContent = `${profitMarginPct >= 0 ? '+' : ''}${profitMarginPct.toFixed(1)}%`;
    hudMargin.style.color = profitMarginPct >= 0 ? "#059669" : "#dc2626";
    const pill = document.getElementById("inv-hud-margin-pill");
    if (pill) {
      pill.style.background = profitMarginPct >= 0 ? "#ecfdf5" : "#fef2f2";
      pill.style.borderColor = profitMarginPct >= 0 ? "#6ee7b7" : "#fca5a5";
    }
  }

  // Store discount info on window
  window._autoDiscountAmount = autoDiscountAmount;
  window._autoDiscountRate = additionalDiscountPct;
  window._globalDiscountAmount = globalDiscAmt;
  window._globalDiscountValue = globalDiscVal;
  window._globalDiscountType = globalDiscType;
}

async function cleanupInvoiceAssociatedTransactions(oldInv) {
  if (!oldInv) return;

  const invId = oldInv.id;
  const invNum = oldInv.number || oldInv.invoiceNumber || "";
  const paidAmount = parseFloat(oldInv.paidAmount) || 0;
  const totalWithVat = parseFloat(oldInv.totalWithVat) || parseFloat(oldInv.total) || 0;

  // 1. Reverse Cash Box transaction if old payment method was cash
  if ((oldInv.paymentMethod === "cash" || oldInv.paymentMethod === "نقدي") && paidAmount > 0) {
    try {
      await autoCashTransaction({
        type:       "out",
        amount:     paidAmount,
        notes:      `عكس/تعديل سداد الفاتورة ${invNum}`,
        sourceType: "salesInvoice_reverse",
        sourceId:   invId,
        date:       oldInv.date || todayString(),
        cashBoxId:  oldInv.repId ? `cashBox_${oldInv.repId}` : null
      });
      console.log(`[Cleanup] Reversed cash transaction of ${paidAmount} for invoice ${invNum}`);
    } catch (cashErr) {
      console.warn("[Cleanup] Cash reversal failed:", cashErr.message);
    }
  }

  // 2. Reverse Bank transaction if old payment method was bank-related
  if (["transfer", "network", "bank", "cheque", "check", "تحويل", "شبكة", "شيك"].includes(oldInv.paymentMethod) && totalWithVat > 0) {
    try {
      await autoBankTransaction({
        type:       "out",
        amount:     totalWithVat,
        notes:      `عكس/تعديل سداد الفاتورة ${invNum}`,
        sourceType: "salesInvoice_reverse",
        sourceId:   invId,
        date:       oldInv.date || todayString(),
      });
      console.log(`[Cleanup] Reversed bank transaction of ${totalWithVat} for invoice ${invNum}`);
    } catch (bankErr) {
      console.warn("[Cleanup] Bank reversal failed:", bankErr.message);
    }
  }

  // 3. Find and delete linked receipts (سندات القبض) and their journal entries
  try {
    const queries = [];
    if (invId) {
      queries.push(query(collection(db, `companies/${COMPANY_ID}/receipts`), where("sourceInvoiceId", "==", invId)));
    }
    if (invNum) {
      queries.push(query(collection(db, `companies/${COMPANY_ID}/receipts`), where("sourceInvoiceId", "==", invNum)));
    }

    for (const q of queries) {
      const rcptSnap = await getDocs(q);
      for (const rcptDoc of rcptSnap.docs) {
        const rcptId = rcptDoc.id;
        // Delete receipt's linked journal entry — search all relevant sourceTypes
        for (const rcptSourceType of ["pos", "receipt", "salesInvoice", "customerPayment"]) {
          try {
            const jeSnap = await getDocs(
              query(collection(db, `companies/${COMPANY_ID}/journalEntries`),
                    where("sourceType", "==", rcptSourceType),
                    where("sourceId",   "==", rcptId))
            );
            for (const jeDoc of jeSnap.docs) {
              await deleteJournalEntry(jeDoc.id);
              console.log(`[Cleanup] Deleted JE ${jeDoc.id} (${rcptSourceType}) for receipt ${rcptId}`);
            }
          } catch (jeErr) {
            console.warn(`[Cleanup] JE delete (${rcptSourceType}) for receipt ${rcptId}:`, jeErr.message);
          }
        }

        // Delete the receipt document itself
        await remove("receipts", rcptId);
        console.log(`[Cleanup] Deleted receipt voucher ${rcptId} linked to invoice ${invNum}`);
      }
    }
  } catch (rcptErr) {
    console.warn("[Cleanup] Receipts cleanup failed:", rcptErr.message);
  }
}

// ── Save Invoice ──
window.saveInvoice = async (status = "pending") => {
  const errEl = document.getElementById("inv-form-error");
  errEl.classList.add("hidden");

  const customerId  = document.getElementById("customer-id").value;
  const customerName = document.getElementById("customer-search").value.trim();
  const repSel      = document.getElementById("inv-rep");
  const repId       = repSel.value || "";
  const repName     = repId ? (repSel.options[repSel.selectedIndex]?.dataset.name || "") : "بدون مندوب";
  const waSel       = document.getElementById("inv-warehouse");
  const warehouseId = waSel.value;
  const warehouseName = waSel.options[waSel.selectedIndex]?.dataset.name || "";
  const ccSel       = document.getElementById("inv-cost-center");
  const costCenterId = ccSel?.value || null;
  const costCenterName = (ccSel && costCenterId && ccSel.options[ccSel.selectedIndex]) ? (ccSel.options[ccSel.selectedIndex].dataset.name || ccSel.options[ccSel.selectedIndex].text) : null;
  const invDate     = document.getElementById("inv-date").value;
  const payment     = document.getElementById("inv-payment").value;
  let paidAmount    = parseFloat(document.getElementById("inv-paid-amount").value) || 0;
  if (payment === "credit" || payment === "deferred" || payment === "آجل") {
    paidAmount = 0;
  }
  const notes       = document.getElementById("inv-notes").value.trim();
  const invType     = document.getElementById("inv-type").value;

  // Validations
  if (!customerId && invType === "standard") {
    errEl.textContent = "يرجى اختيار العميل"; errEl.classList.remove("hidden"); return;
  }
  if (!warehouseId) { errEl.textContent = "يرجى اختيار المخزن"; errEl.classList.remove("hidden"); return; }
  if (invoiceLines.length === 0) { errEl.textContent = "يرجى إضافة صنف واحد على الأقل"; errEl.classList.remove("hidden"); return; }

  // pricing settings validations
  if (window._isSavingInvoice) return;
  window._isSavingInvoice = true;
  const btn = document.getElementById("save-inv-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "جارٍ التحقق…";
  }

  const pricingPolicy = await getPricingSettings();
  const isDonation = selectedCustomer?.id === "005" || (selectedCustomer?.name || "").includes("سلة البركة");
  if (isDonation) {
    invoiceLines.forEach(l => { l.taxCategory = "E"; });
  }
  const baseTotals = calcInvoiceTotals(invoiceLines);
  const autoDiscount = window._autoDiscountAmount || 0;

  const globalDiscVal = parseFloat(document.getElementById("inv-global-discount-val")?.value) || 0;
  const globalDiscType = document.getElementById("inv-global-discount-type")?.value || "amount";

  let globalDiscAmt = 0;
  if (globalDiscType === "percent") {
    globalDiscAmt = Math.round((baseTotals.subtotal * (Math.min(100, Math.max(0, globalDiscVal)) / 100)) * 100) / 100;
  } else {
    globalDiscAmt = Math.min(baseTotals.subtotal, Math.max(0, globalDiscVal));
  }

  const totalInvoiceLevelDiscount = globalDiscAmt + autoDiscount;
  const grossSubtotal = Math.round((baseTotals.subtotal + baseTotals.discountTotal) * 100) / 100;
  const subtotal = isDonation ? 0 : Math.max(0, baseTotals.subtotal - totalInvoiceLevelDiscount);
  const discountTotal = Math.round((baseTotals.discountTotal + totalInvoiceLevelDiscount) * 100) / 100;
  const discountRatio = baseTotals.subtotal > 0 ? (totalInvoiceLevelDiscount / baseTotals.subtotal) : 0;
  const totalVat = isDonation ? 0 : Math.round((baseTotals.vatTotal * (1 - discountRatio)) * 100) / 100;
  const totalWithVat = Math.round((subtotal + totalVat) * 100) / 100;
  const remainingAmount = Math.max(0, totalWithVat - paidAmount);

  // 1. Max rep manual discount check
  let exceededDiscount = false;
  invoiceLines.forEach(line => {
    let pct = 0;
    if (line.discountType === 'amount') {
      const g = (parseFloat(line.qty) || 1) * (parseFloat(line.unitPrice) || 1);
      pct = g > 0 ? ((parseFloat(line.discount) || 0) / g) * 100 : 0;
    } else {
      pct = parseFloat(line.discount) || 0;
    }
    if (pct > (pricingPolicy.maxRepDiscount ?? 3)) {
      exceededDiscount = true;
    }
  });
  if (globalDiscType === 'percent' && globalDiscVal > (pricingPolicy.maxRepDiscount ?? 3)) {
    exceededDiscount = true;
  }

  const resetBtn = () => {
    window._isSavingInvoice = false;
    if (btn) {
      btn.disabled = false;
      btn.textContent = "💾 حفظ وإصدار";
    }
  };

  if (exceededDiscount) {
    const pin = prompt(`⚠️ لقد تجاوزت الحد الأقصى المسموح لخصم المندوب (${pricingPolicy.maxRepDiscount ?? 3}%).\nيرجى إدخال رمز أمان المشرف (Supervisor PIN) للمتابعة:`);
    if (pin !== (pricingPolicy.supervisorPIN || "1234")) {
      alert("❌ رمز الأمان غير صحيح. تم رفض الحفظ.");
      resetBtn();
      return;
    }
  }

  // 2. Credit limit check
  const creditPolicy = pricingPolicy.creditBlockPolicy || "block_with_pin";
  if (creditPolicy !== "allow_all" && selectedCustomer?.creditLimit > 0 && payment === "credit") {
    const newBalance = (selectedCustomer.balance || 0) + totalWithVat;
    if (newBalance > selectedCustomer.creditLimit) {
      if (creditPolicy === "warn") {
        if (!confirm(`⚠️ تجاوز حد ائتمان العميل: ${formatCurrency(newBalance)} > ${formatCurrency(selectedCustomer.creditLimit)}\nهل تريد المتابعة وتجاوز الحد؟`)) {
          resetBtn();
          return;
        }
      } else if (creditPolicy === "block_with_pin") {
        const pin = prompt(`⚠️ تجاوز حد ائتمان العميل: ${formatCurrency(newBalance)} > ${formatCurrency(selectedCustomer.creditLimit)}\nيتطلب هذا الإجراء صلاحية المدير.\nيرجى إدخال رمز تجاوز المدير (Supervisor PIN):`);
        if (pin !== (pricingPolicy.supervisorPIN || "1234")) {
          alert("❌ رمز تجاوز غير صحيح! تم رفض المعاملة.");
          resetBtn();
          return;
        }
      }
    }
  }

  // 3. Overdue invoices check (Credit Days)
  if (creditPolicy !== "allow_all" && selectedCustomer?.creditDays > 0 && payment === "credit") {
    try {
      const { getDocs, query, collection, where } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
      const invoicesRef = collection(db, `companies/${COMPANY_ID}/salesInvoices`);
      const q = query(
        invoicesRef,
        where("customerId", "==", customerId),
        where("status", "in", ["pending", "posted", "partial"]),
        where("payment", "==", "credit")
      );
      const qSnap = await getDocs(q);
      const today = new Date();
      let hasOverdue = false;
      let overdueAmount = 0;
      
      qSnap.forEach(docSnap => {
        const inv = docSnap.data();
        if ((inv.remainingAmount || 0) > 0 && inv.date) {
          const invDate = new Date(inv.date);
          const diffTime = today - invDate;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > selectedCustomer.creditDays) {
            hasOverdue = true;
            overdueAmount += (inv.remainingAmount || 0);
          }
        }
      });
      
      if (hasOverdue) {
        if (creditPolicy === "warn") {
          if (!confirm(`⚠️ العميل لديه فواتير متأخرة عن مهلة السداد (${selectedCustomer.creditDays} يوم) بقيمة إجمالية ${formatCurrency(overdueAmount)}!\nهل تريد تجاوز التنبيه والمتابعة؟`)) {
            resetBtn();
            return;
          }
        } else if (creditPolicy === "block_with_pin") {
          const pin = prompt(`⚠️ العميل لديه فواتير متأخرة عن مهلة السداد (${selectedCustomer.creditDays} يوم) بقيمة إجمالية ${formatCurrency(overdueAmount)}!\nيتطلب هذا الإجراء صلاحية المدير لتجاوز الحظر الائتماني.\nيرجى إدخال رمز تجاوز المدير (Supervisor PIN):`);
          if (pin !== (pricingPolicy.supervisorPIN || "1234")) {
            alert("❌ رمز تجاوز غير صحيح! تم رفض المعاملة.");
            resetBtn();
            return;
          }
        }
      }
    } catch (err) {
      console.warn("Failed to check overdue customer invoices:", err);
    }
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = "جارٍ الحفظ…";
  }

  try {
    // التحقق من إقفال الفترة المالية لمنع التلاعب بأثر رجعي
    const invDate = document.getElementById("inv-date")?.value || todayString();
    if (await isPeriodClosed(invDate)) {
      showErr(`⚠️ لا يمكن حفظ الفاتورة لأن تاريخها (${invDate}) يقع في فترة محاسبية مغلقة ومقفلة نهائياً.`);
      btn.disabled = false;
      btn.textContent = "💾 حفظ وإصدار";
      return;
    }

    // 🛡️ Pre-Save Auto-Consolidation: Ensure no duplicate product lines with identical unit exist
    const consolidatedMap = new Map();
    const consolidatedLines = [];
    let mergedDuplicatesCount = 0;

    for (const line of invoiceLines) {
      if (!line.productId || line.isCustom || String(line.productId).startsWith("adhoc_")) {
        consolidatedLines.push(line);
        continue;
      }
      const unitKey = (line.selectedUnit || line.unit || "CTN").trim().toLowerCase();
      const key = `${line.productId}_${unitKey}`;

      if (consolidatedMap.has(key)) {
        const target = consolidatedMap.get(key);
        const prevQty = parseFloat(target.qty) || 0;
        const addQty = parseFloat(line.qty) || 0;
        target.qty = prevQty + addQty;
        mergedDuplicatesCount++;
      } else {
        consolidatedMap.set(key, line);
        consolidatedLines.push(line);
      }
    }

    if (mergedDuplicatesCount > 0) {
      invoiceLines = consolidatedLines;
      renderInvoiceLines();
      updateInvoiceTotals();
      if (window.showToast) {
        window.showToast(`تم دمج ${mergedDuplicatesCount} بنود مكررة تلقائياً لضبط كميات الفاتورة والمخزون`, "info", 3500);
      }
    }

    // Verify stock availability for all items before saving invoice
    // If editing, load the old invoice and add back its quantities to the validation pool
    let oldInv = null;
    let oldInvMap = {};
    if (window._editingInvoiceId) {
      try {
        oldInv = window._editingOldInvoice || await getById("salesInvoices", window._editingInvoiceId);
        const oldLines = oldInv ? (oldInv.lines || oldInv.items || []) : [];
        if (oldInv && oldLines.length > 0 && (oldInv.warehouseId === warehouseId || !warehouseId)) {
          oldLines.forEach(l => {
            if (l.productId) {
              const factor = (l.altUnit && l.unitFactor > 1 && l.selectedUnit === l.altUnit) ? (parseFloat(l.unitFactor) || 1) : 1;
              const baseQty = (parseFloat(l.qty) || 0) * factor;
              oldInvMap[l.productId] = (oldInvMap[l.productId] || 0) + baseQty;
            }
          });
        }
      } catch (e) {
        console.warn("Failed to load old invoice for stock validation:", e);
      }
    }

    const stockPromises = invoiceLines.map(async (line) => {
      if (!line.productId || !line.qty || String(line.productId).startsWith("adhoc_") || line.isCustom) return null;
      try {
        const reqBaseQty = (parseFloat(line.qty) || 0) * ((line.altUnit && line.unitFactor > 1 && line.selectedUnit === line.altUnit) ? (parseFloat(line.unitFactor) || 1) : 1);
        const oldBaseQty = oldInvMap[line.productId] || 0;
        const netExtraNeeded = reqBaseQty - oldBaseQty;

        // If no additional stock is required beyond what the invoice already holds, pass!
        if (netExtraNeeded <= 0) return null;

        const stockDocId = `${warehouseId}_${line.productId}`;
        const stockSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, stockDocId));
        let currentQty = stockSnap.exists() ? (stockSnap.data().qty || 0) : 0;

        if (currentQty < netExtraNeeded) {
          return `⚠️ الكمية الإضافية المطلوبة من الصنف "${line.productName || line.productId}" (${netExtraNeeded} ${translateUnit(line.unit || 'Piece')}) تتجاوز المتوفر في المخزن (${currentQty})`;
        }
      } catch (e) {
        console.warn(`Stock check failed for product ${line.productId}:`, e);
      }
      return null;
    });

    const stockResults = await Promise.all(stockPromises);
    const stockErr = stockResults.find(r => r !== null);
    if (stockErr) {
      showErr(stockErr);
      window._isSavingInvoice = false;
      btn.disabled = false;
      btn.textContent = window._editingInvoiceId ? "💾 تحديث الفاتورة" : "💾 حفظ وإصدار";
      return;
    }

    const invNum   = document.getElementById("inv-number").value;
    const timestamp = formatISOTimestamp(new Date());
    const invUUID   = uuid();

    // Generate ZATCA QR — read company data from localStorage (saved by settings page)
    const _co = (() => {
      try { return JSON.parse(localStorage.getItem("idham_company") || "{}"); } catch { return {}; }
    })();
    const qrBase64 = generateZATCAQRBase64({
      sellerName:   _co.name      || window.ERP_COMPANY?.name      || "مؤسسة إدهام للمواد الغذائية",
      vatNumber:    _co.vatNumber || window.ERP_COMPANY?.vatNumber  || "",
      timestamp,
      totalWithVat: totalWithVat,
      vatAmount:    totalVat,
    });

    const finalStatus = status === "draft" ? "draft"
      : (remainingAmount > 0 ? "posted" : "paid");

    const invoiceData = {
      number:        invNum,
      invoiceNumber: invNum,
      uuid:          invUUID,
      date:          invDate,
      invoiceType:   invType,
      customerId:    customerId || null,
      customerName:  customerName || "عميل نقدي",
      repId, repName, warehouseId, warehouseName,
      costCenterId:   costCenterId || null,
      costCenterName: costCenterName || null,
      lines:         invoiceLines,
      items:         invoiceLines,
      subtotal,
      grossSubtotal,
      discountTotal,
      globalDiscountValue: globalDiscVal,
      globalDiscountType: globalDiscType,
      globalDiscountAmount: globalDiscAmt,
      totalVat,
      vatAmount:     totalVat,
      total:         totalWithVat,
      totalWithVat,
      paymentMethod: payment,
      paidAmount,
      remainingAmount,
      notes,
      status:        finalStatus,
      zatcaStatus:   "pending",
      qrBase64,
      createdBy:     window._salesUser?.uid || "system",
      autoDiscountAmount: autoDiscount,
      autoDiscountRate: window._autoDiscountRate || 0,
      stockStatus:   "pending_deduction",
      hasBrokerCommission:   !!selectedCustomer?.hasBrokerCommission,
      brokerName:            selectedCustomer?.brokerName || "",
      brokerRate:            parseFloat(selectedCustomer?.brokerRate) || 0,
      brokerTrigger:         selectedCustomer?.brokerTrigger || "on_payment",
      brokerAccountCode:     selectedCustomer?.brokerAccountCode || "2-1-4-2",
      brokerExpenseCode:     selectedCustomer?.brokerExpenseCode || "5-4-10",
      brokerCommissionTotal: selectedCustomer?.hasBrokerCommission 
        ? Math.round(invoiceLines.reduce((s, l) => s + (parseFloat(l.brokerCommissionTotal) || (l.unitPrice ? (l.unitPrice - (l.basePrice || (l.unitPrice / 1.01))) * (parseFloat(l.qty) || 0) : 0)), 0) * 100) / 100 || Math.round(subtotal * (parseFloat(selectedCustomer.brokerRate || 1) / 100) * 100) / 100
        : 0,
      brokerCommissionStatus: selectedCustomer?.hasBrokerCommission ? (payment === "cash" ? "earned" : "pending_payment") : "none",
      brokerCommissionEarned: selectedCustomer?.hasBrokerCommission && payment === "cash" 
        ? Math.round(subtotal * (parseFloat(selectedCustomer.brokerRate || 1) / 100) * 100) / 100 
        : 0,
    };

    // Save invoice
    let invId = window._editingInvoiceId;
    const isEditing = !!invId;

    if (isEditing) {
      if (!oldInv) {
        oldInv = await getById("salesInvoices", invId);
      }
      // حماية التزامن التفاؤلي: منع الكتابة فوق تعديل تم من جلسة أخرى
      if (oldInv && oldInv.version && window._editingInvoiceVersion && window._editingInvoiceVersion !== oldInv.version) {
        showErr("⚠️ تم تعديل هذه الفاتورة مسبقاً من جلسة أخرى. يرجى إغلاق الفاتورة وإعادة فتحها لتجنب تضارب البيانات.");
        btn.disabled = false;
        btn.textContent = "💾 تحديث الفاتورة";
        window._isSavingInvoice = false;
        return;
      }
      invoiceData.version = (oldInv?.version || 1) + 1;

      const oldLines = oldInv ? (oldInv.lines || oldInv.items || []) : [];
      const wasStockCompleted = oldInv && oldInv.status !== "draft" && oldInv.status !== "cancelled" && oldInv.stockStatus !== "draft";
      const adjustments = [];
      const nowTs = Date.now();
      const oldWh = oldInv?.warehouseId || warehouseId;
      const newWh = warehouseId;
      const isSameWarehouse = (oldWh === newWh);

      // Smart Differential Stock Adjustment (حساب الفارق الصافي لمنع الحركات الوهمية)
      if (wasStockCompleted) {
        if (!isSameWarehouse) {
          // If warehouse changed, return old lines to old warehouse and deduct from new warehouse
          oldLines.forEach((ol, idx) => {
            if (!ol.productId || String(ol.productId).startsWith("adhoc_") || ol.isCustom) return;
            const factor = (ol.altUnit && ol.unitFactor > 1 && ol.selectedUnit === ol.altUnit) ? (parseFloat(ol.unitFactor) || 1) : 1;
            const oldBaseQty = (parseFloat(ol.qty) || 0) * factor;
            if (oldBaseQty > 0) {
              adjustments.push({
                warehouseId: oldWh,
                productId: ol.productId,
                qtyDelta: oldBaseQty,
                metadata: {
                  type: "sale_reverse_edit",
                  txDocId: `tx_rev_edit_${invId}_${nowTs}_${idx}_${ol.productId}`,
                  documentNumber: invoiceData.number,
                  invoiceNumber: invoiceData.number,
                  allowNegative: false,
                  date: invoiceData.date || new Date().toISOString().split("T")[0],
                  productName: ol.productName || ol.name || "",
                  notes: `تعديل الفاتورة ${invoiceData.number} (نقل للمخزن الجديد)`
                }
              });
            }
          });
          invoiceLines.forEach((line, idx) => {
            if (!line.productId || !line.qty || String(line.productId).startsWith("adhoc_") || line.isCustom) return;
            const factor = (line.altUnit && line.unitFactor > 1 && line.selectedUnit === line.altUnit) ? (parseFloat(line.unitFactor) || 1) : 1;
            const newBaseQty = (parseFloat(line.qty) || 0) * factor;
            if (newBaseQty > 0) {
              adjustments.push({
                warehouseId: newWh,
                productId: line.productId,
                qtyDelta: -newBaseQty,
                metadata: {
                  type: "sale_out",
                  sourceType: "salesInvoice",
                  sourceId: invId,
                  txDocId: `tx_sale_out_edit_${invId}_${nowTs}_${idx}_${line.productId}`,
                  documentNumber: invoiceData.number,
                  invoiceNumber: invoiceData.number,
                  allowNegative: false,
                  date: invoiceData.date || new Date().toISOString().split("T")[0],
                  productName: line.productName || line.name || "",
                  notes: `فاتورة بيع ${invoiceData.number} (معدلة)`
                }
              });
            }
          });
        } else {
          // Same warehouse: Clean Differential Delta per product
          const oldQtyMap = {};
          oldLines.forEach(ol => {
            if (!ol.productId || String(ol.productId).startsWith("adhoc_") || ol.isCustom) return;
            const factor = (ol.altUnit && ol.unitFactor > 1 && ol.selectedUnit === ol.altUnit) ? (parseFloat(ol.unitFactor) || 1) : 1;
            const q = (parseFloat(ol.qty) || 0) * factor;
            oldQtyMap[ol.productId] = (oldQtyMap[ol.productId] || 0) + q;
          });

          const newQtyMap = {};
          const newMetaMap = {};
          invoiceLines.forEach((nl, idx) => {
            if (!nl.productId || String(nl.productId).startsWith("adhoc_") || nl.isCustom) return;
            const factor = (nl.altUnit && nl.unitFactor > 1 && nl.selectedUnit === nl.altUnit) ? (parseFloat(nl.unitFactor) || 1) : 1;
            const q = (parseFloat(nl.qty) || 0) * factor;
            newQtyMap[nl.productId] = (newQtyMap[nl.productId] || 0) + q;
            newMetaMap[nl.productId] = { ...nl, lineIdx: idx };
          });

          const allPids = new Set([...Object.keys(oldQtyMap), ...Object.keys(newQtyMap)]);
          for (const pid of allPids) {
            const oldQ = oldQtyMap[pid] || 0;
            const newQ = newQtyMap[pid] || 0;
            const delta = Math.round((newQ - oldQ) * 1000) / 1000;

            if (delta > 0) {
              // Net increase in sales -> deduct delta from warehouse
              const meta = newMetaMap[pid] || {};
              adjustments.push({
                warehouseId: newWh,
                productId: pid,
                qtyDelta: -delta,
                metadata: {
                  type: "sale_out",
                  sourceType: "salesInvoice",
                  sourceId: invId,
                  txDocId: `tx_sale_out_delta_${invId}_v${invoiceData.version}_${pid}`,
                  documentNumber: invoiceData.number,
                  invoiceNumber: invoiceData.number,
                  allowNegative: false,
                  date: invoiceData.date || new Date().toISOString().split("T")[0],
                  productName: meta.productName || meta.name || "",
                  notes: `فاتورة بيع ${invoiceData.number} (زيادة كمية بعد التعديل: +${delta})`
                }
              });
            } else if (delta < 0) {
              // Net decrease in sales -> return |delta| to warehouse
              const meta = newMetaMap[pid] || oldLines.find(ol => ol.productId === pid) || {};
              const returnQty = Math.abs(delta);
              adjustments.push({
                warehouseId: newWh,
                productId: pid,
                qtyDelta: returnQty,
                metadata: {
                  type: "sale_reverse_edit",
                  txDocId: `tx_rev_edit_delta_${invId}_v${invoiceData.version}_${pid}`,
                  refId: invoiceData.number,
                  documentNumber: invoiceData.number,
                  invoiceNumber: invoiceData.number,
                  allowNegative: false,
                  date: invoiceData.date || new Date().toISOString().split("T")[0],
                  productName: meta.productName || meta.name || "",
                  notes: `تعديل الفاتورة ${invoiceData.number} (إنقاص كمية: -${returnQty})`
                }
              });
            }
            // delta === 0: EXACT SAME QUANTITY -> DO NOTHING! ZERO TRANSACTION!
          }
        }
      }

      if (adjustments.length > 0) {
        try {
          await adjustStockBulk(adjustments);
          invoiceData.stockStatus = "completed";
          invoiceData.stockError = "";
        } catch (stockErr) {
          console.error("[adjustStockBulk] ❌ Edit adjust stock failed:", stockErr.message);
          const isQuota = (stockErr?.message || "").includes("Quota exceeded") || (stockErr?.code === "resource-exhausted") || (stockErr?.message || "").includes("429");
          if (isQuota) {
            showErr("🚨 تنبيه حصة السيرفر (Firebase Quota Exceeded): تم استهلاك الحد الأقصى اليومي المجاني لقراءات فايربيز (50,000 عملية). يتجدد العداد تلقائياً عند منتصف الليل UTC (3:00 فجراً بتوقيت السعودية)، أو يمكن ترقية المشروع إلى باقة (Blaze Plan) لمنع التوقف نهائياً.");
          } else {
            showErr(`❌ تعذر تحديث المخزون: ${stockErr.message}`);
          }
          window._isSavingInvoice = false;
          btn.disabled = false;
          btn.textContent = "💾 تحديث الفاتورة";
          return; // ⛔ STOP! Never proceed if stock deduction fails!
        }
      } else {
        invoiceData.stockStatus = "completed";
      }

      // Clean up old transactions, receipts, and their JEs
      if (oldInv) {
        await cleanupInvoiceAssociatedTransactions(oldInv);
      }

      // Delete ALL linked journal entries (main + COGS) before recreating
      const oldSourceKey = oldInv?.invoiceNumber || oldInv?.number || invId;
      const editJeTypes  = ["salesInvoice", "sales", "salesCOGS", "salesInvoice_cogs", "salesReturnCOGS", "posCOGS", "broker_commission"];
      for (const sType of editJeTypes) {
        try {
          const jeSnap = await getDocs(
            query(collection(db, `companies/${COMPANY_ID}/journalEntries`),
              where("sourceType", "==", sType),
              where("sourceId",   "==", oldSourceKey))
          );
          for (const jeDoc of jeSnap.docs) {
            await deleteJournalEntry(jeDoc.id);
            console.log(`[saveInvoice-edit] Deleted old JE ${jeDoc.id} (${sType}) for ${oldSourceKey}`);
          }
          if (oldSourceKey !== invId) {
            const jeSnap2 = await getDocs(
              query(collection(db, `companies/${COMPANY_ID}/journalEntries`),
                where("sourceType", "==", sType),
                where("sourceId",   "==", invId))
            );
            for (const jeDoc of jeSnap2.docs) {
              await deleteJournalEntry(jeDoc.id);
              console.log(`[saveInvoice-edit] Deleted old JE ${jeDoc.id} (${sType}) for raw id ${invId}`);
            }
          }
        } catch (jeErr) {
          console.warn(`[saveInvoice-edit] JE cleanup (${sType}) skipped:`, jeErr.message);
        }
      }
      // Fallback by stored ID
      if (oldInv?.journalEntryId) {
        try { await deleteJournalEntry(oldInv.journalEntryId); } catch (_) {}
      }
      // Update invoice data
      await update("salesInvoices", invId, invoiceData);
    } else {
      // ── Create New Invoice ──
      // Prepare adjustments with strict allowNegative: false
      const adjustments = invoiceLines.filter(line => line.productId && !String(line.productId).startsWith("adhoc_") && !line.isCustom).map(line => ({
        warehouseId,
        productId: line.productId,
        qtyDelta: -((parseFloat(line.qty)||0) * ((line.altUnit && line.unitFactor > 1 && line.selectedUnit === line.altUnit) ? (parseFloat(line.unitFactor)||1) : 1)),
        metadata: {
          type: "sale_out",
          sourceType: "salesInvoice",
          sourceId: invoiceData.number,
          documentNumber: invoiceData.number,
          invoiceNumber: invoiceData.number,
          allowNegative: false, // ⚠️ منع البيع بالسالب قطعياً
          date: invoiceData.date || new Date().toISOString().split("T")[0],
          productName: line.productName || line.name || "",
          userId: window._salesUser?.uid,
          createdByName: window._salesUser?.displayName || window._salesUser?.email || "النظام",
          batchNumber: line.batchNumber || "",
          expiryDate: line.expiryDate || "",
          notes: `فاتورة بيع ${invoiceData.number}`,
        }
      }));

      // Adjust stock in bulk FIRST before creating the invoice
      if (adjustments.length > 0) {
        try {
          await adjustStockBulk(adjustments);
          invoiceData.stockStatus = "completed";
          invoiceData.stockError = "";
        } catch (stockErr) {
          console.error("[adjustStockBulk] ❌ Create adjust stock failed:", stockErr.message);
          const isQuota = (stockErr?.message || "").includes("Quota exceeded") || (stockErr?.code === "resource-exhausted") || (stockErr?.message || "").includes("429");
          if (isQuota) {
            showErr("🚨 تنبيه حصة السيرفر (Firebase Quota Exceeded): تم استهلاك الحد الأقصى اليومي المجاني لقراءات فايربيز (50,000 عملية). يتجدد العداد تلقائياً عند منتصف الليل UTC (3:00 فجراً بتوقيت السعودية)، أو يمكن ترقية المشروع إلى باقة (Blaze Plan) لمنع التوقف نهائياً.");
          } else {
            showErr(`❌ تعذر خصم المخزون وحفظ الفاتورة: ${stockErr.message}`);
          }
          window._isSavingInvoice = false;
          btn.disabled = false;
          btn.textContent = "💾 حفظ وإصدار";
          return; // ⛔ STOP! Never create invoice if stock deduction fails!
        }
      } else {
        invoiceData.stockStatus = "completed";
      }

      // Create new invoice document only after stock deduction succeeded
      invId = await create(COLS.salesInvoices(), invoiceData);
    }

    // ─── Automated Accounting Engine ───
    // ✅ FIX: حساب التكلفة الدقيقة لكل بند (الكمية المباعة × سعر تكلفة الوحدة)
    let totalCost = invoiceLines.reduce((s, l) => {
      const unitCost = l.averageCost || l.costPrice || l.lastPurchasePrice || l.avgCostPrice || l.purchasePrice || 0;
      return s + ((parseFloat(l.qty) || 0) * unitCost);
    }, 0);

    // If totalCost is 0, try to fetch product costs from Firestore in parallel
    if (totalCost < 0.01 && invoiceLines.length > 0) {
      try {
        const costPromises = invoiceLines.map(async (l) => {
          if (!l.productId) return 0;
          try {
            const prodSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/products`, l.productId));
            if (prodSnap.exists()) {
              const pd = prodSnap.data();
              const cost = pd.averageCost || pd.costPrice || pd.lastPurchasePrice || pd.avgCostPrice || pd.purchasePrice || 0;
              l.averageCost = cost;
              l.costPrice = cost;
              return ((parseFloat(l.qty) || 0) * cost);
            }
          } catch (e) {
            console.warn(`[COGS] Failed to fetch cost for product ${l.productId}:`, e.message);
          }
          return 0;
        });
        const costs = await Promise.all(costPromises);
        const fetchedCost = costs.reduce((s, c) => s + c, 0);
        if (fetchedCost > 0.01) {
          totalCost = fetchedCost;
        }
      } catch (e) {
        console.warn("[COGS] Failed to fetch product costs:", e.message);
      }
    }

    try {
      const warehouses = await getAll(COLS.warehouses());
      
      // If editing an existing invoice, delete old journal entries so autoSalesJE can recreate them with updated cost center
      if (isEditing) {
        try {
          const { deleteJournalEntry } = await import("../utils/db.js");
          const oldJEs = await getDocs(query(collection(db, `companies/${COMPANY_ID}/journalEntries`), where("sourceId", "in", [invId, invNum])));
          for (const jeDoc of oldJEs.docs) {
            await deleteJournalEntry(jeDoc.id);
            console.log(`[Edit] Deleted old JE ${jeDoc.id} for invoice ${invNum}`);
          }
        } catch(e) {
          console.warn("[Edit] Failed to cleanup old JEs:", e.message);
        }
      }

      const jeId = await autoSalesJE({
        id:            invId,
        invoiceNumber: invNum,
        date:          invDate,
        customerName:  customerName || "عميل نقدي",
        customerType:  selectedCustomer?.type || "retail",
        paymentMethod: payment,
        subtotal:      subtotal,
        grossSubtotal: grossSubtotal,
        discountTotal: discountTotal,
        taxAmount:     totalVat,
        total:         totalWithVat,
        paidAmount:    paidAmount,
        remainingAmount: remainingAmount,
        totalCost,
        warehouseId,
        warehouseName,
        costCenterId,
        costCenterName,
        sourceType:    "salesInvoice",
        customerId:    customerId,
        lines:         invoiceLines,
        items:         invoiceLines,
        repId:         repId,
      }, window._salesUser || {}, warehouses);
      await update("salesInvoices", invId, { journalEntryId: jeId, totalCost: Math.round(totalCost * 100) / 100 });
    } catch(jeErr) {
      // سجّل الخطأ في Firestore ليتمكن الـ Backfill من اكتشافه وإصلاحه تلقائياً
      console.error("[AccountingEngine] Sales JE failed:", jeErr.message);
      try { await update("salesInvoices", invId, { journalEntryError: jeErr.message, journalEntryId: null }); } catch(_){}
      window.showToast?.("⚠️ تم حفظ الفاتورة لكن القيد المحاسبي فشل — " + jeErr.message, "warn");
    }

    // ── Auto Broker Commission Accrual JE on Invoice Issuance ──
    const commAmount = parseFloat(invoiceData.brokerCommissionTotal) || 0;
    const bTrigger = invoiceData.brokerTrigger || "on_invoice";
    if (invoiceData.hasBrokerCommission && commAmount > 0.01 && (bTrigger === "on_invoice" || payment === "cash" || payment === "نقدي")) {
      try {
        const brokerAcc = invoiceData.brokerAccountCode || "2-1-4-2";
        const expenseAcc = invoiceData.brokerExpenseCode || "5-4-10";
        const bName = invoiceData.brokerName || "زياد";
        
        const brokerJeLines = [
          {
            accountCode: expenseAcc,
            accountName: "مصروفات عمولات وسيط",
            debit: commAmount,
            credit: 0,
            note: `استحقاق عمولة الوسيط (${bName}) عن فاتورة ${invNum}`
          },
          {
            accountCode: brokerAcc,
            accountName: `مستحقات عمولات الوسطاء - ${bName}`,
            debit: 0,
            credit: commAmount,
            note: `استحقاق عمولة الوسيط (${bName}) عن فاتورة ${invNum}`
          }
        ];

        const bJeId = await createJournalEntry({
          date: invDate || todayString(),
          sourceType: "broker_commission",
          sourceId: invId,
          description: `قيد استحقاق عمولة الوسيط ${bName} (${commAmount} ر.س) عن مبيعات فاتورة ${invNum} — ${customerName || "عميل"}`,
          lines: brokerJeLines
        });

        await update("salesInvoices", invId, {
          brokerCommissionStatus: "earned",
          brokerCommissionEarned: commAmount,
          brokerJournalEntryId: bJeId
        });
        console.log(`[BrokerCommission] Auto accrued ${commAmount} SAR via JE ${bJeId} for invoice ${invNum}`);
      } catch (bJeErr) {
        console.warn("[BrokerCommission] Accrual JE failed:", bJeErr.message);
      }
    }

    // ─── Auto Cash Box: أضف للصندوق إذا كان الدفع نقداً ───
    if (payment === "cash" || payment === "نقدي") {
      try {
        await autoCashTransaction({
          type:       "in",
          amount:     paidAmount,
          notes:      `مبيعات نقدية — فاتورة ${invNum} — ${customerName || "عميل"}`,
          sourceType: "salesInvoice",
          sourceId:   invId,
          date:       invDate,
        });
      } catch (cashErr) {
        console.warn("[autoCashTransaction] Cash box update failed:", cashErr.message);
      }
    }

    // ─── Auto Bank: أضف للبنك إذا كان الدفع بالتحويل أو الشبكة أو الشيك ───
    if (["transfer", "network", "bank", "cheque", "check", "تحويل", "شبكة", "شيك"].includes(payment)) {
      try {
        await autoBankTransaction({
          type:       "in",
          amount:     totalWithVat,
          notes:      `مبيعات — فاتورة ${invNum} — ${customerName || "عميل"}`,
          sourceType: "salesInvoice",
          sourceId:   invId,
          date:       invDate,
        });
      } catch (bankErr) {
        console.warn("[autoBankTransaction] Bank update failed:", bankErr.message);
      }
    }

    // Update Customer balance on client side
    if (isEditing) {
      // On edit: Recompute real accurate balance from actual records to avoid duplicate increments
      if (customerId) {
        await recalculateCustomerBalance(customerId).catch(e => console.warn(e));
      }
      if (oldInv?.customerId && oldInv.customerId !== customerId) {
        await recalculateCustomerBalance(oldInv.customerId).catch(e => console.warn(e));
      }
    } else {
      // On create new invoice
      if (customerId && remainingAmount > 0) {
        try {
          const custRef = doc(db, `companies/${COMPANY_ID}/customers`, customerId);
          await updateDoc(custRef, {
            balance: increment(remainingAmount),
            updatedAt: serverTimestamp()
          });
          console.log(`[CustomerBalance] Client-side incremented customer ${customerId} balance by +${remainingAmount}`);
        } catch (custErr) {
          console.warn("Failed to update customer balance on client:", custErr.message);
        }
      }
      if (customerId) {
        recalculateCustomerBalance(customerId).catch(e => console.warn(e));
      }
    }

    const successMsg = isEditing ? `تم تحديث الفاتورة ${invNum} بنجاح` : `تم إنشاء الفاتورة ${invNum} بنجاح`;
    window._editingInvoiceId = null;
    window._editingOldInvoice = null;
    window._editingOldLines = null;
    showToast(successMsg, "success");

    const fileInput = document.getElementById("inv-file-upload");
    if (fileInput && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      window.uploadFileToArchive(file, "sales_invoices", invId, `مرفق فاتورة مبيعات رقم ${invNum}`).catch(e => console.warn(e));
    }

    closeModal("new-invoice-modal");
    await loadInvoicesList();

  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
    console.error(err);
  } finally {
    window._isSavingInvoice = false;
    btn.disabled = false;
    btn.textContent = "💾 حفظ وإصدار";
  }
};

// ── View Invoice (Instant 0ms Load) ──
window.viewInvoice = async (id) => {
  const body  = document.getElementById("view-inv-body");
  const title = document.getElementById("view-inv-title");
  openModal("view-invoice-modal");
  currentInvoice = null;

  const renderInvoiceDetails = (inv) => {
    currentInvoice = inv;
    const invNo = inv.number || inv.invoiceNumber || id;
    title.textContent = `فاتورة: ${invNo}`;

    const lines = (inv.lines || inv.items || []).map((l, i) => {
      const pName = l.productName || l.name || "";
      const pQty = l.qty || 0;
      const pPrice = l.unitPrice !== undefined ? l.unitPrice : (l.price || 0);
      const pDiscount = l.discount || 0;
      const tot = calcLineTotal(pQty, pPrice, pDiscount);
      return `<tr>
        <td style="padding:7px 12px;">${i+1}</td>
        <td style="padding:7px 12px;">${pName}</td>
        <td style="padding:7px 12px;" class="mono">${pQty}</td>
        <td style="padding:7px 12px;" class="mono">${formatCurrency(pPrice)}</td>
        <td style="padding:7px 12px;" class="mono">${pDiscount}%</td>
        <td style="padding:7px 12px;" class="mono font-bold">${formatCurrency(tot)}</td>
      </tr>`;
    }).join("");

    const subtotal = inv.subtotal || 0;
    const totalVat = inv.totalVat || inv.vatAmount || 0;
    const totalWithVat = inv.totalWithVat || inv.total || 0;
    const paidAmount = inv.paidAmount !== undefined ? inv.paidAmount : ((inv.paymentMethod === 'cash' || inv.status === 'paid') ? totalWithVat : 0);
    const remainingAmount = inv.remainingAmount !== undefined ? inv.remainingAmount : (inv.status !== 'paid' && inv.paymentMethod !== 'cash' ? Math.max(0, totalWithVat - paidAmount) : 0);
    const resolvedWhName = inv.warehouseName || (cachedWarehouses && cachedWarehouses.find(w => w.id === inv.warehouseId)?.name) || "—";

    body.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 160px;gap:20px;margin-bottom:20px;">
        <div>
          <div class="grid-3 gap-12 mb-12">
            <div><div class="section-label mb-8">رقم الفاتورة</div><div class="mono text-indigo font-bold">${invNo}</div></div>
            <div><div class="section-label mb-8">التاريخ</div><div>${formatDate(inv.date)}</div></div>
            <div><div class="section-label mb-8">الحالة</div>${getInvoiceStatusBadge(inv.status)}</div>
            <div><div class="section-label mb-8">العميل</div><div class="font-semibold">${(cachedCustomers && cachedCustomers.find(c => c.id === inv.customerId)?.name) || inv.customerName}</div></div>
            <div><div class="section-label mb-8">المندوب</div><div>${inv.repName || "—"}</div></div>
            <div><div class="section-label mb-8">المخزن</div><div>${resolvedWhName}</div></div>
            <div><div class="section-label mb-8">مركز التكلفة</div><div class="font-semibold text-warn">${inv.costCenterName || "—"}</div></div>
          </div>
        </div>
        <!-- QR Code -->
        <div class="qr-container" id="inv-qr-container">
          <div style="font-size:10px;color:var(--text-2);text-align:center;">QR ZATCA</div>
        </div>
      </div>

      <div class="table-container mb-16">
        <table class="data-dense">
          <thead><tr>
            <th>#</th><th>الصنف</th><th>الكمية</th><th>سعر الوحدة</th><th>خصم</th><th>الإجمالي</th>
          </tr></thead>
          <tbody>${lines}</tbody>
        </table>
      </div>

      <div style="display:flex;justify-content:flex-end;">
        <div class="invoice-totals" style="width:260px;">
          <div class="invoice-total-row"><span>المجموع قبل الضريبة</span><span class="mono">${formatCurrency(subtotal)}</span></div>
          <div class="invoice-total-row"><span>ضريبة القيمة المضافة</span><span class="mono text-warn">${formatCurrency(totalVat)}</span></div>
          <div class="invoice-total-row grand-total"><span>الإجمالي النهائي</span><span class="mono">${formatCurrency(totalWithVat)}</span></div>
          <div class="invoice-total-row"><span>المدفوع</span><span class="mono text-good">${formatCurrency(paidAmount)}</span></div>
          <div class="invoice-total-row"><span>المتبقي</span><span class="mono text-bad">${formatCurrency(remainingAmount)}</span></div>
        </div>
      </div>`;

    const qrData = inv.qrBase64 || inv.qrCodeData || inv.zatcaQr || inv.qr;
    if (qrData) {
      setTimeout(() => renderZATCAQR("inv-qr-container", qrData), 50);
    }

    const footer = document.getElementById("view-inv-footer");
    if (footer) {
      footer.innerHTML = `
        <button class="btn btn-ghost" onclick="closeModal('view-invoice-modal')">إغلاق</button>
        ${inv.status !== 'paid' && inv.status !== 'cancelled' ? `<button class="btn" style="background:#16a34a;color:#fff;" onclick="markSalesAsPaidManually('${inv.id}')">💵 تعيين كمدفوعة (مسددة بسند)</button>` : ''}
        <button class="btn btn-secondary" onclick="window.openGoodsReceiptAckForInvoice('${inv.id}')" style="background:#0284c7;color:#fff;border-color:#0284c7;font-weight:700;"><span style="margin-left:4px;">📜</span> إقرار استلام وسند لأمر</button>
        <button class="btn btn-secondary" onclick="printInvoice()">🖨️ طباعة</button>
        <button class="btn btn-lime" onclick="sendToZATCA()" id="zatca-send-btn">⚡ إرسال ZATCA</button>
      `;
    }
  };

  // Instant 0ms render from memory cache if available!
  if (invoicesCache.has(id)) {
    renderInvoiceDetails(invoicesCache.get(id));
    return;
  }

  body.innerHTML = `<div class="page-loading" style="min-height:150px;"><div class="loading-spinner"></div></div>`;
  try {
    const invRef = doc(db, `companies/${COMPANY_ID}/salesInvoices`, id);
    const snap   = await getDoc(invRef);
    if (!snap.exists()) throw new Error("الفاتورة غير موجودة");
    const inv = { id: snap.id, ...snap.data() };
    invoicesCache.set(id, inv);
    renderInvoiceDetails(inv);
  } catch (err) {
    body.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
};

window.markSalesAsPaidManually = async (id) => {
  if (!await showConfirm("هل تريد تعيين الفاتورة كمدفوعة يدوياً؟ (سيتم تغيير الحالة فقط دون إنشاء قيد سداد مكرر)", "تأكيد التغيير")) return;
  try {
    const { update: updateDoc } = await import("../utils/db.js");
    await updateDoc("salesInvoices", id, {
      status: "paid",
      // paidAmount لا يُحدَّث — السداد موجود في سند القبض المنفصل
      remainingAmount: 0,
      manuallyPaid: true,
      updatedAt: new Date().toISOString()
    });
    
    // Invalidate local memory and storage caches
    invoicesCache.delete(id);
    const { clearERPCache, COMPANY_ID } = await import("../utils/db.js");
    clearERPCache(`companies/${COMPANY_ID}/salesInvoices`);

    showToast("✅ تم تعيين الفاتورة كمدفوعة يدوياً بنجاح", "success");
    closeModal("view-invoice-modal");
    await loadInvoicesList();
  } catch (err) {
    showToast("خطأ: " + err.message, "error");
  }
};

window.cancelInvoice = async (id) => {
  if (!await showConfirm("هل تريد إلغاء هذه الفاتورة؟ سيتم عكس حركة المخزون وحذف القيود المحاسبية.", "إلغاء الفاتورة")) return;
  try {
    const { getDoc, doc: fsDoc, collection: fsColl, getDocs: fsGetDocs, query: fsQuery, where: fsWhere }
      = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const { deleteJournalEntry, COMPANY_ID: CID } = await import("../utils/db.js");
    const { recalculateCustomerBalance } = await import("../utils/balance-sync.js");
    const { adjustStock } = await import("../utils/db.js");

    const invSnap = await getDoc(fsDoc(db, `companies/${COMPANY_ID}/salesInvoices`, id));
    if (!invSnap.exists()) { showToast("الفاتورة غير موجودة", "error"); return; }
    const invData = invSnap.data();
    const custId  = invData?.customerId;
    const sourceKey = invData.invoiceNumber || id;

    // ── 1. عكس المخزون لكل سطر دفعة واحدة ──
    const lines = invData.lines || invData.items || [];
    const warehouseId = invData.warehouseId || invData.sourceWarehouseId;
    if (warehouseId && lines.length > 0) {
      const adjustments = [];
      for (const item of lines) {
        const productId = item.productId || item.id;
        const factor = (item.altUnit && item.unitFactor > 1 && item.selectedUnit === item.altUnit) ? (parseFloat(item.unitFactor) || 1) : 1;
        const qty = (parseFloat(item.quantity || item.qty || 0)) * factor;
        if (productId && qty > 0) {
          adjustments.push({
            warehouseId,
            productId,
            qtyDelta: qty,
            metadata: {
              type: "cancel_sale",
              sourceType: "salesInvoice",
              sourceId: id,
              documentNumber: sourceKey,
              notes: `إلغاء فاتورة ${sourceKey}`
            }
          });
        }
      }
      if (adjustments.length > 0) {
        try {
          await adjustStockBulk(adjustments);
        } catch (stockErr) {
          console.warn("[cancelInvoice] Bulk stock reversal failed:", stockErr.message);
        }
      }
    }

    // ── 2. حذف القيود المحاسبية المرتبطة ──
    const JE_TYPES = ["salesInvoice", "sales", "salesCOGS", "salesInvoice_cogs", "salesReturnCOGS", "posCOGS"];
    for (const sType of JE_TYPES) {
      try {
        const jeSnap = await fsGetDocs(fsQuery(
          fsColl(db, `companies/${COMPANY_ID}/journalEntries`),
          fsWhere("sourceType", "==", sType),
          fsWhere("sourceId",   "==", sourceKey)
        ));
        for (const jeDoc of jeSnap.docs) {
          await deleteJournalEntry(jeDoc.id);
          console.log(`[cancelInvoice] Deleted JE ${jeDoc.id} (${sType})`);
        }
        // فالباك بالـ id المباشر
        if (sourceKey !== id) {
          const jeSnap2 = await fsGetDocs(fsQuery(
            fsColl(db, `companies/${COMPANY_ID}/journalEntries`),
            fsWhere("sourceType", "==", sType),
            fsWhere("sourceId",   "==", id)
          ));
          for (const jeDoc of jeSnap2.docs) {
            await deleteJournalEntry(jeDoc.id);
          }
        }
      } catch (jeErr) {
        console.warn(`[cancelInvoice] JE cleanup (${sType}) skipped:`, jeErr.message);
      }
    }
    // حذف القيد المرتبط مباشرة إن وُجد
    if (invData.journalEntryId) {
      try { await deleteJournalEntry(invData.journalEntryId); } catch (_) {}
    }

    // ── 3. تحديث الحالة ──
    await update("salesInvoices", id, { status: "cancelled" });

    // ── 4. إعادة حساب رصيد العميل ──
    if (custId) {
      await recalculateCustomerBalance(custId).catch(() => {});
    }

    showToast("✅ تم إلغاء الفاتورة وعكس المخزون والقيود", "success");
    await loadInvoicesList();
  } catch (err) { showToast(err.message, "error"); }
};

window.sendToZATCA = async () => {
  if (!currentInvoice) return;
  showToast("جارٍ التوقيع والإرسال لهيئة ZATCA...", "info");
  try {
    const { getFunctions, httpsCallable, connectFunctionsEmulator } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js");
    const { app } = await import("../firebase-config.js?v=41.2");
    
    // Instantiate me-west1 functions
    const meFunctions = getFunctions(app, "me-west1");
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      connectFunctionsEmulator(meFunctions, "localhost", 5001);
    }

    const submitInvoice = httpsCallable(meFunctions, "submitInvoiceToZATCA");
    const result = await submitInvoice({ invoiceId: currentInvoice.id });

    if (result.data.success) {
      showToast("تم توقيع الفاتورة وإرسالها إلى ZATCA بنجاح ✅", "success");
      closeModal("view-invoice-modal");
      await loadInvoicesList();
    } else {
      showToast("فشل الربط: " + result.data.message, "error");
    }
  } catch (err) {
    showToast("تعذر الإرسال: " + err.message, "error");
  }
};

window.printInvoice = async (invoiceOrId) => {
  try {
    let inv = (typeof invoiceOrId === "object" && invoiceOrId !== null) ? invoiceOrId : currentInvoice;
    if (!inv && typeof invoiceOrId === "string") {
      const snap = await getDoc(doc(db, `companies/${COMPANY_ID}/salesInvoices`, invoiceOrId));
      if (snap.exists()) inv = { id: snap.id, ...snap.data() };
    }
    if (!inv) {
      if (window.showToast) window.showToast("يرجى اختيار الفاتورة للطباعة", "warning");
      return;
    }

    // 1. Load company settings (from localStorage cache first, then Firestore)
    let co = {
      name: "شركة نظم الإمداد المتطورة",
      vatNumber: "314996148100003",
      crNumber: "7054969006",
      phone: "0549141648",
      email: "Nuzmalamdad@gmail.com",
      logoUrl: "",
      street: "ينبع  الصناعية 2179",
      district: "حي غرناطة",
      city: "ينبع",
      buildingNo: "7689",
      zip: "46414",
      additionalNo: "2811",
      country: "المملكة العربية السعودية"
    };

    try {
      const cached = JSON.parse(localStorage.getItem("idham_company") || "{}");
      if (cached.name) Object.assign(co, cached);
    } catch(_) {}

    try {
      const [compSnap, logoSnap] = await Promise.all([
        getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company")),
        getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "logo"))
      ]);
      if (compSnap.exists()) {
        const d = compSnap.data();
        const rawCr = d.crNumber || d.cr || d.commercialRegistration || "";
        d.crNumber = (rawCr && (rawCr.startsWith("70") || rawCr.startsWith("47") || rawCr.length >= 7)) ? rawCr : (co.crNumber || "7054969006");
        d.vatNumber = d.vatNumber || co.vatNumber || "314996148100003";
        d.name = d.name || co.name || "شركة نظم الإمداد المتطورة";
        Object.assign(co, d);
        const cached2 = JSON.parse(localStorage.getItem("idham_company") || "{}");
        localStorage.setItem("idham_company", JSON.stringify({ ...cached2, ...d, crNumber: co.crNumber, vatNumber: co.vatNumber, name: co.name }));
      }
      if (logoSnap.exists() && logoSnap.data().dataUrl) {
        co.logoUrl = logoSnap.data().dataUrl;
      }
    } catch (e) { console.warn("Failed to load company settings from Firestore:", e); }

    // 2. Load customer full data from Firestore
    let cust = {
      name: inv.customerName || "—",
      vatNumber: inv.customerVat || "",
      phone: inv.customerPhone || "",
      crNumber: inv.customerCr || "",
      email: "",
      street: "",
      district: "",
      city: "",
      buildingNo: "",
      postalCode: "",
      additionalNo: "",
      country: "المملكة العربية السعودية",
      address: "",
      balance: 0
    };

    if (inv.customerId || inv.customerName) {
      try {
        let custSnap = null;
        if (inv.customerId) {
          custSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/customers`, inv.customerId));
          if (!custSnap.exists()) {
            const custQ = query(collection(db, `companies/${COMPANY_ID}/customers`), where("accountId", "==", inv.customerId));
            const qSnap = await getDocs(custQ);
            if (!qSnap.empty) {
              custSnap = qSnap.docs[0];
            }
          }
        }
        if ((!custSnap || !custSnap.exists()) && inv.customerName) {
          const nameQ = query(collection(db, `companies/${COMPANY_ID}/customers`), where("name", "==", inv.customerName));
          const nSnap = await getDocs(nameQ);
          if (!nSnap.empty) custSnap = nSnap.docs[0];
        }

        if (custSnap && custSnap.exists()) {
          const cd = custSnap.data();
          Object.assign(cust, cd);
          if (cd.name) cust.name = cd.name;
          if (cd.vatNumber || cd.vat || cd.taxNumber || cd.taxNo || cd.taxId) {
            cust.vatNumber = cd.vatNumber || cd.vat || cd.taxNumber || cd.taxNo || cd.taxId;
          }
          if (cd.nationalId || cd.crNumber || cd.cr || cd.commercialRegistration || cd.idNumber) {
            cust.crNumber = cd.nationalId || cd.crNumber || cd.cr || cd.commercialRegistration || cd.idNumber;
          }
          if (cd.buildingNo || cd.buildingNumber) cust.buildingNo = cd.buildingNo || cd.buildingNumber;
          if (cd.additionalNo || cd.additionalNumber) cust.additionalNo = cd.additionalNo || cd.additionalNumber;
          if (cd.postalCode || cd.zip || cd.zipCode) cust.postalCode = cd.postalCode || cd.zip || cd.zipCode;
          if (cd.city || cd.zone) cust.city = cd.city || cd.zone;
          if (cd.street) cust.street = cd.street;
          if (cd.district) cust.district = cd.district;
          if (cd.balance !== undefined) cust.balance = parseFloat(cd.balance) || 0;
        }
      } catch (e) { console.warn("Failed to load customer data:", e); }
    }

    // Smart parsing for customer address components if structured fields are blank
    if (cust.address) {
      const addr = cust.address;
      if (!cust.buildingNo) {
        const m = addr.match(/(?:المبنى|رقم المبنى)\s*:\s*([^—\-\n,]+)/i);
        if (m && m[1]) cust.buildingNo = m[1].trim();
      }
      if (!cust.street) {
        const m = addr.match(/(?:الشارع|شارع)\s*:\s*([^—\-\n,]+)/i);
        if (m && m[1]) cust.street = m[1].trim();
      }
      if (!cust.district) {
        const m = addr.match(/(?:الحي|حي)\s*:\s*([^—\-\n,]+)/i);
        if (m && m[1]) cust.district = m[1].trim();
      }
      if (!cust.city) {
        const m = addr.match(/(?:المدينة|مدينة)\s*:\s*([^—\-\n,]+)/i);
        if (m && m[1]) cust.city = m[1].trim();
      }
      if (!cust.postalCode) {
        const m = addr.match(/(?:الرمز البريدي|الرمز|البريدي)\s*:\s*([^—\-\n,]+)/i);
        if (m && m[1]) cust.postalCode = m[1].trim();
      }
      if (!cust.additionalNo) {
        const m = addr.match(/(?:الرقم الإضافي|الرقم الاضافي|الإضافي|الاضافي)\s*:\s*([^—\-\n,]+)/i);
        if (m && m[1]) cust.additionalNo = m[1].trim();
      }
    }

    if (!cust.district && (cust.street || cust.address)) {
      const fullAddr = cust.street || cust.address || "";
      if (fullAddr.includes("حي")) {
        const match = fullAddr.match(/(?:-|—|,|\/)?\s*(حي\s+[^,-—\/]+)/);
        if (match && match[1]) {
          cust.district = match[1].trim();
          if (cust.street && cust.street.includes(match[0])) {
            cust.street = cust.street.replace(match[0], "").trim();
          }
        }
      }
    }

    // Determine ZATCA Invoice Category (Standard B2B vs Simplified B2C)
    const isB2B = !!(cust.vatNumber && cust.vatNumber.trim().length >= 10);
    const titleAr = isB2B ? "فاتورة ضريبية" : "فاتورة ضريبية مبسطة";
    const titleEn = isB2B ? "TAX INVOICE" : "SIMPLIFIED TAX INVOICE";
    const typeTag = isB2B ? "فاتورة ضريبية قياسية (B2B)" : "فاتورة ضريبية مبسطة (B2C)";

    // 3. Build QR TLV (ZATCA-compliant Base64 encoding)
    function buildZatcaQr(sellerName, vatNum, invoiceDate, totalWithVat, vatAmount) {
      function tlv(tag, value) {
        const encoded = new TextEncoder().encode(value);
        return new Uint8Array([tag, encoded.length, ...encoded]);
      }
      const dateStr = invoiceDate ? new Date(invoiceDate).toISOString() : new Date().toISOString();
      const parts = [
        tlv(1, sellerName),
        tlv(2, vatNum || ""),
        tlv(3, dateStr),
        tlv(4, String(totalWithVat?.toFixed(2) || "0.00")),
        tlv(5, String(vatAmount?.toFixed(2) || "0.00"))
      ];
      const merged = new Uint8Array(parts.reduce((acc, arr) => acc + arr.length, 0));
      let offset = 0;
      parts.forEach(arr => { merged.set(arr, offset); offset += arr.length; });
      return btoa(String.fromCharCode(...merged));
    }

    const qrData = buildZatcaQr(
      co.name || "شركة نظم الإمداد المتطورة",
      co.vatNumber || "314996148100003",
      inv.date, inv.totalWithVat, inv.totalVat
    ) || inv.zatcaQr || inv.qrBase64 || inv.qrCodeData || inv.qr;

    // Pre-render QR Code Data URL synchronously in parent window
    let qrImgDataUrl = "";
    if (qrData) {
      try {
        if (typeof window.QRCode !== "undefined") {
          const tempDiv = document.createElement("div");
          new window.QRCode(tempDiv, {
            text: qrData,
            width: 90,
            height: 90,
            correctLevel: window.QRCode.CorrectLevel ? window.QRCode.CorrectLevel.M : 0
          });
          const canvas = tempDiv.querySelector("canvas");
          const img = tempDiv.querySelector("img");
          if (canvas) {
            qrImgDataUrl = canvas.toDataURL("image/png");
          } else if (img && img.src) {
            qrImgDataUrl = img.src;
          }
        }
      } catch(err) {
        console.warn("QR pre-generation error:", err);
      }
    }

    // 4. Line items & packaging totals (with smart unit lookup from catalog)
    let totalItemsCount = 0;
    let totalQtySum = 0;
    let totalDiscountSum = 0;
    let taxableBaseSum = 0;
    let exemptBaseSum = 0;
    let lineVatSum = 0;

    if (!allProducts || allProducts.length === 0) {
      try {
        allProducts = await getAll(COLS.products());
      } catch(_) {}
    }
    const prodMap = new Map((allProducts || []).map(p => [p.id, p]));

    const linesHtml = (inv.lines || inv.items || []).map((l, i) => {
      const qty = parseFloat(l.qty || 0);
      const price = parseFloat(l.unitPrice || l.price || 0);
      const discVal = parseFloat(l.discount || 0);
      const discType = l.discountType || "percent";
      let lineDiscountAmt = 0;
      if (discType === "amount") {
        lineDiscountAmt = Math.min(qty * price, Math.max(0, discVal));
      } else {
        lineDiscountAmt = (qty * price) * (discVal / 100);
      }
      const taxableAmount = Math.max(0, (qty * price) - lineDiscountAmt);
      const vatRate = (l.taxCategory === "E" || l.taxCategory === "Z") ? 0 : 15;
      const vatAmount = taxableAmount * (vatRate / 100);
      const totalWithVat = taxableAmount + vatAmount;

      totalItemsCount++;
      totalQtySum += qty;
      totalDiscountSum += lineDiscountAmt;
      if (vatRate > 0) {
        taxableBaseSum += taxableAmount;
      } else {
        exemptBaseSum += taxableAmount;
      }
      lineVatSum += vatAmount;

      // Smart unit determination:
      let rawUnit = l.unit;
      const pName = l.productName || l.name || "";
      if (!rawUnit || rawUnit === "Piece" || rawUnit === "PCS" || rawUnit === "حبة") {
        const matchedProd = l.productId ? prodMap.get(l.productId) : (allProducts || []).find(p => p.name === pName);
        if (matchedProd && matchedProd.unit && matchedProd.unit !== "Piece" && matchedProd.unit !== "PCS") {
          rawUnit = matchedProd.unit;
        }
      }
      const unitArabic = (!rawUnit || rawUnit === "Piece" || rawUnit === "PCS" || rawUnit === "حبة") ? "كرتون" : rawUnit;

      return `
        <tr>
          <td class="mono font-bold" style="color:#6366f1;">${i + 1}</td>
          <td class="desc">
            <div class="font-bold" style="font-size:11px; color:#1e1b4b;">${pName}</div>
            <div style="font-size:9px; color:#64748b;">الوحدة: <b style="color:#1e1b4b;">${unitArabic}</b></div>
          </td>
          <td class="mono font-bold" style="font-size:11.5px;">${qty}</td>
          <td class="mono">${formatCurrency(price)}</td>
          <td class="mono" style="color:${discVal > 0 ? '#dc2626' : '#9ca3af'};">${discVal > 0 ? (discType === 'amount' ? `${discVal} ر.س` : `${discVal}%`) : "—"}</td>
          <td class="mono font-bold">${formatCurrency(taxableAmount)}</td>
          <td class="mono" style="font-size:10px;">${vatRate}%</td>
          <td class="mono">${formatCurrency(vatAmount)}</td>
          <td class="mono font-bold" style="color:#1e1b4b; font-size:11.5px;">${formatCurrency(totalWithVat)}</td>
        </tr>
      `;
    }).join("");

    const amountInWords = (typeof tafqeetArabic === "function") ? tafqeetArabic(inv.totalWithVat || 0) : "";

    // Logo formatting
    const logoHtml = co.logoUrl 
      ? `<div class="logo-circle"><img src="${co.logoUrl}" alt="شعار المؤسسة" /></div>` 
      : `<div class="logo-circle"><span class="default-logo">🏢</span></div>`;

    const invNum = inv.number || inv.invoiceNumber || inv.id || "—";
    const barcodeSvg = typeof JsBarcode !== "undefined" 
      ? (() => {
          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          try {
            JsBarcode(svg, invNum, { format: "CODE128", width: 1.2, height: 32, displayValue: false, margin: 0 });
            return svg.outerHTML;
          } catch(_) { return ""; }
        })()
      : "";

    // 5. Open popup print window with clean styled template
    const lineCount = (inv.items || inv.lines || []).length;
    const isSmallInvoice = lineCount <= 4;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      if (window.showToast) window.showToast("يرجى السماح بالنوافذ المنبثقة للطباعة", "warning");
      return;
    }

    printWindow.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>فاتورة ضريبية — ${invNum}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@500;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Cairo', system-ui, -apple-system, sans-serif; background: #f3f4f6; color: #1e293b; padding: 20px; line-height: 1.35; font-size: 11.5px; }
    
    .no-print { margin-bottom: 12px; display: flex; gap: 8px; justify-content: flex-end; }
    .btn { padding: 6px 14px; border-radius: 6px; font-family: 'Cairo', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; border: none; }
    
    .invoice-container { max-width: 210mm; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    
    /* Top Header Bar */
    .top-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e1b4b; padding-bottom: 6px; margin-bottom: 8px; }
    .title-box h1 { font-size: 19px; font-weight: 900; color: #1e1b4b; line-height: 1.1; margin-bottom: 1px; }
    .title-box h2 { font-size: 11px; font-weight: 700; color: #6366f1; letter-spacing: 0.5px; }
    .doc-badge { display: inline-block; background: #eef2ff; color: #3730a3; border: 1px solid #c7d2fe; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-top: 3px; }
    
    /* Purple Header Banner */
    .company-banner { background: #1e1b4b !important; color: #fff !important; border-radius: 8px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .banner-meta { display: flex; flex-direction: column; gap: 2px; }
    .banner-meta .meta-line { font-size: 10.5px; display: flex; gap: 5px; color: rgba(255,255,255,0.95); }
    .banner-meta .m-lbl { opacity: 0.85; font-size: 10px; }
    .banner-meta .m-val { color: #fff; font-weight: 800; }
    
    .banner-co { text-align: left; direction: ltr; }
    .banner-co h2 { font-size: 14.5px; font-weight: 900; color: #fff !important; margin-bottom: 3px; direction: rtl; text-align: right; }
    .co-id-row { display: flex; gap: 6px; flex-wrap: wrap; direction: rtl; }
    .co-pill { background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); padding: 1px 6px; border-radius: 4px; font-size: 10px; color: #fff !important; display: inline-flex; align-items: center; gap: 4px; }
    .co-pill strong { color: #fff !important; font-size: 10.5px; }
    
    .logo-circle { width: 56px; height: 56px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 3px; border: 2px solid #6366f1; box-shadow: 0 2px 6px rgba(0,0,0,0.15); flex-shrink: 0; margin: 0 10px; }
    .logo-circle img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .logo-circle .default-logo { font-size: 24px; }
    
    /* ZATCA National Address Grid (Compact & Elegant Horizontal Layout) */
    .parties-container { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
    .party-card { border: 1.2px solid #cbd5e1; border-radius: 6px; background: #f8fafc; padding: 6px 10px; font-size: 10.5px; }
    .party-card.seller { border-color: #a5b4fc; background: #fdfcff; }
    .party-card.buyer { border-color: #cbd5e1; background: #f8fafc; }
    
    .party-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px; }
    .party-title { font-weight: 800; color: #3730a3; font-size: 11px; }
    .party-name { font-size: 12.5px; font-weight: 800; color: #0f172a; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    
    /* Dedicated Party ID Badges (CR & VAT) */
    .party-ids-row { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 4px; }
    .id-badge { background: #fff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 6px; display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; }
    .id-badge.vat-badge { border-color: #818cf8; background: #fdfcff; }
    .id-lbl { color: #475569; font-weight: 700; }
    .id-val { font-weight: 800; color: #1e1b4b; font-size: 10.5px; }
    
    .badge-vat { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 4px; }
    .badge-novat { background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 4px; }

    /* Compact Horizontal Address Matrix */
    .addr-compact-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px 6px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 4px 6px;
    }
    .addr-line-item {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 9.5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .addr-line-item .lbl { color: #64748b; font-weight: 700; }
    .addr-line-item .val { color: #1e293b; font-weight: 800; }
    .addr-line-item.full { grid-column: span 3; }
    
    /* Table Styling */
    .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; border: 1.5px solid #1e1b4b; border-radius: 6px; overflow: hidden; }
    .invoice-table thead tr { background: #1e1b4b !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .invoice-table thead th { color: #fff !important; font-size: 9.5px; font-weight: 700; padding: 5px 3px; text-align: center; border: 1px solid rgba(255,255,255,0.2); }
    .invoice-table tbody tr { border-bottom: 1px solid #e2e8f0; }
    .invoice-table tbody tr:nth-child(even) { background: #fdfcff; }
    .invoice-table tbody td { padding: 5px 4px; font-size: 10px; text-align: center; border: 1px solid #e2e8f0; color: #1f2937; }
    .invoice-table tbody td.desc { text-align: right; }
    .mono { font-family: 'IBM Plex Mono', 'Courier New', monospace; }
    .font-bold { font-weight: 700; }
    
    /* Tafqeet Amount Strip */
    .tafqeet-strip { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 6px; padding: 5px 10px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; }
    .tafqeet-text { font-weight: 800; color: #3730a3; }
    .packages-count { font-size: 10px; color: #4b5563; font-weight: 600; }
    
    /* Totals & QR Section */
    .bottom-layout { display: grid; grid-template-columns: 105px 1fr 275px; gap: 8px; margin-bottom: 8px; align-items: stretch; margin-top: 10px; }
    
    .qr-box { border: 1.2px solid #cbd5e1; border-radius: 6px; padding: 4px; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    .qr-box span { font-size: 8px; color: #64748b; margin-top: 3px; font-weight: 700; }
    
    .notes-box { border: 1.2px solid #cbd5e1; border-radius: 6px; padding: 6px 8px; background: #fff; font-size: 9.5px; display: flex; flex-direction: column; justify-content: space-between; }
    .notes-title { font-weight: 800; color: #1e1b4b; margin-bottom: 2px; font-size: 10px; }
    .notes-body { color: #475569; line-height: 1.3; }
    .official-receipt-notice { margin-top: 3px; background: #fef2f2; border: 1px dashed #ef4444; border-radius: 4px; padding: 2px 5px; }
    .notice-ar { font-weight: 800; color: #991b1b; font-size: 9px; }
    .notice-en { font-size: 7.5px; color: #7f1d1d; font-weight: 600; direction: ltr; text-align: right; }
    .meta-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
    .meta-pill { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 1px 6px; font-size: 9px; font-weight: 600; }
    
    /* Totals Table - Zero Collision */
    .totals-table-wrap { border: 1.5px solid #1e1b4b; border-radius: 6px; overflow: hidden; background: #fff; }
    .totals-table { width: 100%; border-collapse: collapse; }
    .totals-table tr td { padding: 4px 8px; font-size: 10px; border-bottom: 1px solid #f1f5f9; }
    .totals-table tr td.lbl { text-align: right; color: #475569; font-weight: 600; }
    .totals-table tr td.val { text-align: left; font-family: 'IBM Plex Mono', monospace; font-weight: 700; direction: ltr; white-space: nowrap; }
    .totals-table tr.grand td { background: #1e1b4b !important; color: #fff !important; font-weight: 800; font-size: 12px; border-bottom: none; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .totals-table tr.grand td.val { color: #fff !important; }
    .totals-table tr.balance-row td { background: #f8fafc; font-size: 9.5px; color: #64748b; }
    .totals-table tr.due-row td { background: #fdfcff; font-weight: 800; color: #1e1b4b; font-size: 10.5px; }
    
    /* Signatures Section */
    .signatures-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; border-top: 1px dashed #cbd5e1; padding-top: 6px; margin-top: 4px; }
    .sig-box { border: 1px dashed #cbd5e1; border-radius: 5px; padding: 6px 10px; background: #fafafa; font-size: 9.5px; }
    .sig-title { font-weight: 800; color: #334155; margin-bottom: 14px; }
    .sig-line { border-top: 1px solid #94a3b8; padding-top: 3px; display: flex; justify-content: space-between; font-size: 9px; color: #64748b; }
    
    /* Footer */
    .footer-bar { text-align: center; padding-top: 6px; font-size: 9.5px; color: #64748b; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; margin-top: 6px; }
    
    @page { size: A4; margin: 4mm 6mm 4mm 6mm; }
    @media print {
      html, body {
        background: #fff !important;
        padding: 0 !important;
        margin: 0 !important;
        height: 100% !important;
        font-size: 10px !important;
      }
      .no-print, .toolbar { display: none !important; }
      .invoice-container {
        box-shadow: none !important;
        margin: 0 !important;
        border-radius: 0 !important;
        border: 1px solid #1e1b4b !important;
        padding: 5px 8px !important;
        max-width: 100% !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .top-header { padding-bottom: 3px !important; margin-bottom: 4px !important; }
      .title-box h1 { font-size: 16px !important; }
      .company-banner { padding: 4px 8px !important; margin-bottom: 4px !important; border-radius: 6px !important; }
      .company-banner h2 { font-size: 13px !important; }
      .logo-circle { width: 42px !important; height: 42px !important; margin: 0 4px !important; }
      .parties-container { gap: 4px !important; margin-bottom: 4px !important; }
      .party-card { padding: 3px 5px !important; font-size: 8.5px !important; }
      .party-ids-row { gap: 2px !important; margin-bottom: 2px !important; }
      .id-badge { padding: 1px 3px !important; font-size: 8px !important; }
      .addr-compact-grid { padding: 2px 4px !important; }
      .addr-line-item { font-size: 8px !important; }
      .invoice-table { margin-bottom: 4px !important; }
      .invoice-table thead th { padding: 3px 2px !important; font-size: 8.5px !important; }
      .invoice-table tbody td { padding: 2px 2px !important; font-size: 8.5px !important; }
      .tafqeet-strip { padding: 2px 5px !important; margin-bottom: 4px !important; font-size: 8.5px !important; }
      .bottom-layout { gap: 5px !important; margin-bottom: 4px !important; grid-template-columns: 80px 1fr 230px !important; }
      .qr-box { padding: 2px !important; }
      .qr-box svg, .qr-box img { max-width: 70px !important; max-height: 70px !important; }
      .notes-box { padding: 3px 5px !important; font-size: 8px !important; }
      .totals-table tr td { padding: 2px 5px !important; font-size: 8.5px !important; }
      .totals-table tr.grand td { font-size: 10px !important; padding: 2.5px 5px !important; }
      .signatures-grid { gap: 6px !important; margin-top: 3px !important; padding-top: 3px !important; }
      .sig-box { padding: 3px 5px !important; font-size: 8px !important; }
      .sig-title { margin-bottom: 6px !important; font-size: 8px !important; }
      .footer-bar { margin-top: 3px !important; padding-top: 2px !important; font-size: 8px !important; }
    }
      .no-print { display: none !important; }
      .invoice-container { max-width: 100%; box-shadow: none; border-radius: 0; border: 1px solid #1e1b4b; padding: 8px; }
      .company-banner { background: #1e1b4b !important; color: #fff !important; }
      .invoice-table thead tr { background: #1e1b4b !important; color: #fff !important; }
      .totals-table tr.grand td { background: #1e1b4b !important; color: #fff !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn" style="background:#1e1b4b;color:#fff;" onclick="window.print()">🖨️ طباعة الفاتورة A4</button>
    <button class="btn" style="background:#334155;color:#fff;" onclick="window.close()">✕ إغلاق النافذة</button>
  </div>

  <div class="invoice-container">
    <!-- Top Header with Barcode & Title -->
    <div class="top-header">
      <div class="title-box">
        <h1>${titleAr}</h1>
        <h2>${titleEn}</h2>
        <span class="doc-badge">${typeTag}</span>
      </div>
      <div>
        ${barcodeSvg}
      </div>
    </div>

    <!-- Purple Header Banner -->
    <div class="company-banner">
      <div class="banner-meta">
        <div class="meta-line"><span class="m-lbl">رقم الفاتورة / Inv No:</span> <strong class="m-val mono">${invNum}</strong></div>
        <div class="meta-line"><span class="m-lbl">تاريخ الإصدار / Date:</span> <strong class="m-val mono">${inv.date || "—"}</strong></div>
        <div class="meta-line"><span class="m-lbl">طريقة الدفع / Terms:</span> <strong class="m-val">${inv.paymentMethod === "cash" ? "نقدي (Cash)" : "آجل (Credit)"}</strong></div>
        ${inv.dueDate ? `<div class="meta-line"><span class="m-lbl">الاستحقاق / Due:</span> <strong class="m-val mono">${inv.dueDate}</strong></div>` : ""}
      </div>
      ${logoHtml}
      <div class="banner-co">
        <h2>${co.name}</h2>
        <div class="co-id-row">
          <span class="co-pill">الرقم الضريبي (VAT): <strong class="mono">${co.vatNumber || "314996148100003"}</strong></span>
          <span class="co-pill">السجل التجاري (CR): <strong class="mono">${co.crNumber || "7054969006"}</strong></span>
        </div>
      </div>
    </div>

    <!-- ZATCA National Address Tabs/Cards for Seller & Buyer -->
    <div class="parties-container">
      <!-- Seller Box -->
      <div class="party-card seller">
        <div class="party-head">
          <span class="party-title">🏢 بيانات المورد / البائع (Seller)</span>
        </div>
        <div class="party-name">${co.name}</div>
        <div class="party-ids-row">
          <div class="id-badge">
            <span class="id-lbl">السجل التجاري (CR):</span>
            <span class="id-val mono">${co.crNumber || "7054969006"}</span>
          </div>
          <div class="id-badge vat-badge">
            <span class="id-lbl">الرقم الضريبي (VAT):</span>
            <span class="id-val mono">${co.vatNumber || "314996148100003"}</span>
          </div>
        </div>
        <div class="addr-compact-grid">
          <div class="addr-line-item"><span class="lbl">المدينة:</span> <span class="val">${co.city || "ينبع"}</span></div>
          <div class="addr-line-item"><span class="lbl">الحي:</span> <span class="val">${co.district || "حي النزهة"}</span></div>
          <div class="addr-line-item"><span class="lbl">الشارع:</span> <span class="val">${co.street || "عامر الشعبي"}</span></div>
          <div class="addr-line-item"><span class="lbl">المبنى:</span> <span class="val mono">${co.buildingNo || "7480"}</span></div>
          <div class="addr-line-item"><span class="lbl">الرمز البريدي:</span> <span class="val mono">${co.zip || co.postalCode || "46424"}</span></div>
          <div class="addr-line-item"><span class="lbl">الرقم الإضافي:</span> <span class="val mono">${co.additionalNo || "3180"}</span></div>
          <div class="addr-line-item full"><span class="lbl">الدولة:</span> <span class="val">${co.country || "المملكة العربية السعودية"}</span></div>
        </div>
      </div>

      <!-- Buyer Box -->
      <div class="party-card buyer">
        <div class="party-head">
          <span class="party-title">👤 بيانات العميل / المشتري (Buyer)</span>
          <span class="${cust.vatNumber ? 'badge-vat' : 'badge-novat'}">${cust.vatNumber ? 'مسجل ضريبياً' : 'غير مسجل'}</span>
        </div>
        <div class="party-name">${cust.name}</div>
        <div class="party-ids-row">
          <div class="id-badge">
            <span class="id-lbl">السجل / الهوية:</span>
            <span class="id-val mono">${cust.crNumber || "—"}</span>
          </div>
          <div class="id-badge vat-badge">
            <span class="id-lbl">الرقم الضريبي (VAT):</span>
            <span class="id-val mono" style="color:${cust.vatNumber ? '#1e1b4b' : '#6b7280'};">${cust.vatNumber || "غير مسجل"}</span>
          </div>
        </div>
        <div class="addr-compact-grid">
          <div class="addr-line-item"><span class="lbl">المدينة:</span> <span class="val">${cust.city || "—"}</span></div>
          <div class="addr-line-item"><span class="lbl">الحي:</span> <span class="val">${cust.district || "—"}</span></div>
          <div class="addr-line-item"><span class="lbl">الشارع:</span> <span class="val">${cust.street || "—"}</span></div>
          <div class="addr-line-item"><span class="lbl">المبنى:</span> <span class="val mono">${cust.buildingNo || "—"}</span></div>
          <div class="addr-line-item"><span class="lbl">الرمز البريدي:</span> <span class="val mono">${cust.postalCode || "—"}</span></div>
          <div class="addr-line-item"><span class="lbl">الرقم الإضافي:</span> <span class="val mono">${cust.additionalNo || "—"}</span></div>
          <div class="addr-line-item full"><span class="lbl">الدولة:</span> <span class="val">${cust.country || "المملكة العربية السعودية"}</span></div>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="invoice-table">
      <thead>
        <tr>
          <th style="width:30px;">م<br><span style="font-size:7.5px;">#</span></th>
          <th>الصنف والبيان<br><span style="font-size:7.5px;">Description & Packaging</span></th>
          <th style="width:50px;">الكمية<br><span style="font-size:7.5px;">Qty</span></th>
          <th style="width:70px;">سعر الوحدة<br><span style="font-size:7.5px;">Unit Price</span></th>
          <th style="width:55px;">الخصم<br><span style="font-size:7.5px;">Discount</span></th>
          <th style="width:75px;">الخاضع<br><span style="font-size:7.5px;">Taxable Base</span></th>
          <th style="width:45px;">النسبة<br><span style="font-size:7.5px;">Rate</span></th>
          <th style="width:70px;">الضريبة<br><span style="font-size:7.5px;">VAT (15%)</span></th>
          <th style="width:80px;">الإجمالي<br><span style="font-size:7.5px;">Total (Inc. VAT)</span></th>
        </tr>
      </thead>
      <tbody>
        ${linesHtml}
      </tbody>
    </table>

    <!-- Tafqeet (Amount in words) & Packaging Bar -->
    <div class="tafqeet-strip">
      <div class="tafqeet-text">
        <span>✍️ المبلغ بالحروف:</span> ${amountInWords}
      </div>
      <div class="packages-count">
        📦 إجمالي الكمية: <b class="mono">${totalQtySum}</b> | عدد البنود: <b class="mono">${totalItemsCount}</b> صنف
      </div>
    </div>

    <!-- Bottom Layout: QR + Notes + Totals -->
    <div class="bottom-layout">
      <!-- QR Code -->
      <div class="qr-box">
        ${qrImgDataUrl ? `<img src="${qrImgDataUrl}" width="86" height="86" style="display:block;margin:0 auto;border-radius:4px;" alt="ZATCA QR" />` : `<div id="qrcode-container" style="width:86px;height:86px;border:1px dashed #cbd5e1;display:flex;align-items:center;justify-content:center;font-size:9px;color:#94a3b8;">ZATCA QR</div>`}
        <span>ZATCA</span>
      </div>

      <!-- Notes & Metadata -->
      <div class="notes-box">
        <div>
          <div class="notes-title">📌 شروط وملاحظات / Notes & Terms:</div>
          <div class="notes-body">
            <div>${inv.notes || "البضاعة المباعة لا ترد ولا تستبدل إلا بموجب الفاتورة الأصلية وخلال المدة النظامية."}</div>
            <div class="official-receipt-notice">
              <div class="notice-ar">⚠️ لا تعتبر هذه الفاتورة محصلة إلا بموجب سند قبض رسمي</div>
              <div class="notice-en">The invoice is not considered collected except with an official receipt</div>
            </div>
          </div>
        </div>
        <div class="meta-tags">
          ${inv.repName ? `<span class="meta-pill">👤 المندوب: <b>${inv.repName}</b></span>` : ""}
          ${inv.warehouseName ? `<span class="meta-pill">🏢 المستودع: <b>${inv.warehouseName}</b></span>` : ""}
          <span class="meta-pill">🕒 وقت الطباعة: <b>${new Date().toLocaleTimeString('ar-SA')}</b></span>
        </div>
      </div>

      <!-- Totals Box (Zero Overlap Guaranteed) -->
      <div class="totals-table-wrap">
        <table class="totals-table">
          ${exemptBaseSum > 0 ? `
          <tr>
            <td class="lbl">الخاضع للضريبة (15%):</td>
            <td class="val">${formatCurrency(taxableBaseSum)}</td>
          </tr>
          <tr>
            <td class="lbl" style="color:#059669;">معفى / غير خاضع (0%):</td>
            <td class="val" style="color:#059669;">${formatCurrency(exemptBaseSum)}</td>
          </tr>
          <tr>
            <td class="lbl">المجموع قبل الضريبة (Subtotal):</td>
            <td class="val">${formatCurrency(inv.subtotal || (taxableBaseSum + exemptBaseSum))}</td>
          </tr>` : `
          <tr>
            <td class="lbl">المجموع قبل الضريبة (Taxable):</td>
            <td class="val">${formatCurrency(inv.subtotal || 0)}</td>
          </tr>`}
          ${(inv.discountTotal || totalDiscountSum) > 0 ? `
          <tr>
            <td class="lbl" style="color:#dc2626;">إجمالي الخصم (Discount):</td>
            <td class="val" style="color:#dc2626;">- ${formatCurrency(inv.discountTotal || totalDiscountSum)}</td>
          </tr>` : ""}
          <tr>
            <td class="lbl">ضريبة القيمة المضافة (15% VAT):</td>
            <td class="val">${formatCurrency(inv.totalVat !== undefined ? inv.totalVat : (inv.vatAmount !== undefined ? inv.vatAmount : lineVatSum))}</td>
          </tr>
          <tr class="grand">
            <td class="lbl">الإجمالي شامل الضريبة (Grand Total):</td>
            <td class="val font-bold">${formatCurrency(inv.totalWithVat !== undefined ? inv.totalWithVat : (inv.total || 0))}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Signatures & Acceptance Strip -->
    <div class="signatures-grid">
      <div class="sig-box">
        <div class="sig-title">✍️ استلام واعتماد العميل (Received & Accepted By):</div>
        <div class="sig-line">
          <span>اسم المستلم: ______________________</span>
          <span>التوقيع والختم: ________________</span>
        </div>
      </div>
      <div class="sig-box">
        <div class="sig-title">🚚 تسليم المندوب / السائق (Delivered By):</div>
        <div class="sig-line">
          <span>المندوب: <b>${inv.repName || "سائق المؤسسة"}</b></span>
          <span>التوقيع: ____________________</span>
        </div>
      </div>
    </div>

    <!-- Footer Bar -->
    <div class="footer-bar">
      <div>📞 الهاتف: <b>${co.phone || "0549141648"}</b> | ✉️ البريد: <b>${co.email || "Nuzmalamdad@gmail.com"}</b></div>
      <div>شكراً لتعاملكم معنا — ${co.name}</div>
    </div>
  </div>
</body>
</html>`);
    printWindow.document.close();
  } catch (err) {
    console.error("[printInvoice] Error:", err);
    if (window.showToast) window.showToast("خطأ أثناء الطباعة: " + err.message, "error");
  }
};

window.exportInvoices = async () => { window.exportInvoicesExcel(); };
window.exportInvoicesExcel = async () => {
  try {
    showToast('جاري تجهيز ملف Excel…', 'info');
    const invs = await getAll(COLS.salesInvoices(), [orderBy('createdAt', 'desc')]);
    const rows = invs.map(inv => [
      inv.number || '',
      inv.date || '',
      inv.customerName || '',
      inv.repName || '',
      inv.paymentMethod || '',
      inv.subtotal || 0,
      inv.discountTotal || 0,
      inv.totalVat || 0,
      inv.totalWithVat || 0,
      inv.status || '',
      inv.notes || '',
    ]);
    await exportToExcel({
      title: 'فواتير_المبيعات',
      headers: [
        'رقم الفاتورة', 'التاريخ', 'العميل', 'المندوب', 'طريقة الدفع',
        'المجموع قبل الخصم', 'إجمالي الخصم',
        'ضريبة 15%', 'الإجمالي شامل الضريبة',
        'الحالة', 'ملاحظات'
      ],
      rows,
      colWidths: [18, 14, 26, 18, 14, 16, 16, 14, 18, 12, 28],
    });
    showToast(`تم تصدير ${rows.length} فاتورة ✅`, 'success');
  } catch (err) { showToast('خطأ: ' + err.message, 'error'); }
};

window.editInvoice = async (id) => {
  try {
    const inv = await getById("salesInvoices", id);
    if (!inv) { showToast("لم يتم العثور على الفاتورة", "error"); return; }

    const rawLines = inv.lines || inv.items || [];
    window._editingInvoiceId = id;
    window._editingInvoiceVersion = inv.version || 1;
    window._editingOldInvoice = inv;
    window._editingOldLines = JSON.parse(JSON.stringify(rawLines));

    // Ensure products and categories (and stockByWarehouse) are loaded into memory/cache
    await loadProductsAndCategories();

    // Set form fields
    document.getElementById("inv-number").value = inv.number || inv.invoiceNumber || "";
    document.getElementById("customer-search").value = inv.customerName || "";
    document.getElementById("customer-id").value = inv.customerId || "";
    document.getElementById("inv-date").value = inv.date || todayString();
    document.getElementById("inv-payment").value = inv.paymentMethod || "credit";
    document.getElementById("inv-paid-amount").value = inv.paidAmount !== undefined ? inv.paidAmount : "";
    document.getElementById("inv-notes").value = inv.notes || "";
    document.getElementById("inv-type").value = inv.invoiceType || "standard";
    document.getElementById("inv-form-error")?.classList.add("hidden");

    const globalDiscValEl = document.getElementById("inv-global-discount-val");
    const globalDiscTypeEl = document.getElementById("inv-global-discount-type");
    if (globalDiscValEl) globalDiscValEl.value = inv.globalDiscountValue || (inv.globalDiscountAmount ? inv.globalDiscountAmount : "0");
    if (globalDiscTypeEl) globalDiscTypeEl.value = inv.globalDiscountType || "amount";

    // Set customer object in memory
    selectedCustomer = inv.customerId ? { id: inv.customerId, name: inv.customerName, type: inv.customerType || "retail" } : null;
    if (inv.customerId && cachedCustomers) {
      const c = cachedCustomers.find(cust => cust.id === inv.customerId);
      if (c) selectedCustomer = { ...c, ...selectedCustomer };
    }

    // Show donation badge if appropriate
    const donationBadge = document.getElementById("donation-badge");
    const isDonation = inv.customerId === "005" || (inv.customerName || "").includes("سلة البركة");
    if (isDonation) {
      if (donationBadge) {
        donationBadge.textContent = "🎁 عميل تبرعات (معفى من الضريبة وتكلفتها مصروف تبرعات)";
        donationBadge.classList.remove("hidden");
      }
      document.getElementById("credit-status-bar")?.classList.add("hidden"); document.getElementById("inv-aging-alert")?.classList.add("hidden");
    } else {
      if (donationBadge) donationBadge.classList.add("hidden");
    }

    // Load Reps
    await loadRepsDropdown();
    document.getElementById("inv-rep").value = inv.repId || "";

    // Load Warehouses
    await loadWarehousesDropdown();
    document.getElementById("inv-warehouse").value = inv.warehouseId || "";

    // Load Cost Centers
    await loadCostCentersDropdown();
    const ccEl = document.getElementById("inv-cost-center");
    if (ccEl) {
      ccEl.value = inv.costCenterId || "";
      if (!ccEl.value) {
        window.autoSelectCostCenter();
      }
    }

    // Set lines — must map ALL fields used by renderInvoiceLines and saveInvoice
    invoiceLines = rawLines.map(line => {
      const dbProd = allProducts.find(p => p.id === line.productId);
      const unit = line.unit || dbProd?.unit || "PCS";
      const altUnit = line.altUnit || dbProd?.altUnit || "";
      const unitFactor = parseFloat(line.unitFactor || dbProd?.unitFactor) || 1;
      const selectedUnit = line.selectedUnit || unit;
      const unitPrice = line.unitPrice !== undefined ? parseFloat(line.unitPrice) : (parseFloat(line.price) || 0);
      const basePricePerUnit = line.basePricePerUnit || (selectedUnit === altUnit ? unitPrice : (unitFactor > 1 ? parseFloat((unitPrice * unitFactor).toFixed(4)) : unitPrice));

      return {
        productId:   line.productId,
        productName: line.productName || line.name || (dbProd?.name || ""),
        qty:         parseFloat(line.qty) || 1,
        unit:        unit,
        altUnit:     altUnit,
        unitFactor:  unitFactor,
        selectedUnit: selectedUnit,
        basePricePerUnit: basePricePerUnit,
        unitCode:    line.unitCode || "PCE",
        unitPrice:   unitPrice,
        discount:    parseFloat(line.discount) || 0,
        discountType: line.discountType || "percent",
        taxCategory: line.taxCategory || "S",
        sku:         line.sku || dbProd?.sku || "",
        costPrice:   (dbProd && (dbProd.averageCost || dbProd.costPrice || dbProd.lastPurchasePrice || dbProd.avgCostPrice)) ? (dbProd.averageCost || dbProd.costPrice || dbProd.lastPurchasePrice || dbProd.avgCostPrice) : (line.averageCost || line.costPrice || 0),
        averageCost: (dbProd && (dbProd.averageCost || dbProd.costPrice || dbProd.lastPurchasePrice || dbProd.avgCostPrice)) ? (dbProd.averageCost || dbProd.costPrice || dbProd.lastPurchasePrice || dbProd.avgCostPrice) : (line.averageCost || line.costPrice || 0),
        batchNumber: line.batchNumber || "",
        expiryDate:  line.expiryDate  || "",
        availableBatches: [],
        isCustom:    !!line.isCustom || String(line.productId || "").startsWith("adhoc_")
      };
    });

    // Resolve batches asynchronously for edit
    invoiceLines.forEach((_, idx) => {
      window.resolveLineBatches(idx);
    });

    renderInvoiceLines();
    updateInvoiceTotals();
    setupCustomerAutocomplete();
    setupProductAutocomplete();

    // Change Save Button Text
    const btn = document.getElementById("save-inv-btn");
    if (btn) btn.textContent = "💾 تحديث الفاتورة";

    openModal("new-invoice-modal");
  } catch (err) {
    showToast(err.message, "error");
  }
};

window.deleteInvoice = async (id, number) => {
  if (!await showConfirm(`هل أنت متأكد من حذف الفاتورة "${number}" نهائياً؟`, "تأكيد حذف الفاتورة")) return;
  try {
    const inv = await getById("salesInvoices", id);
    if (!inv) throw new Error("لم يتم العثور على الفاتورة");

    // Clean up associated transactions and receipts
    await cleanupInvoiceAssociatedTransactions(inv);

    // 1. Reverse stock adjustment in bulk — non-blocking (cancelled invoices already reversed)
    const oldLines = inv.lines || inv.items || [];
    if (oldLines.length > 0 && inv.warehouseId && inv.status !== "cancelled") {
      const adjustments = oldLines.map(line => {
        const baseQty = (parseFloat(line.qty) || 0) * ((line.altUnit && line.unitFactor > 1 && line.selectedUnit === line.altUnit) ? (parseFloat(line.unitFactor) || 1) : 1);
        return {
          warehouseId: inv.warehouseId,
          productId: line.productId,
          qtyDelta: baseQty,
          metadata: {
            type: "sale_reverse",
            refId: inv.number || inv.invoiceNumber || id,
            documentNumber: inv.number || inv.invoiceNumber || id,
            invoiceNumber: inv.number || inv.invoiceNumber || id,
            notes: `حذف الفاتورة ${inv.number || inv.invoiceNumber || id}`,
            batchNumber: line.batchNumber || "",
            expiryDate: line.expiryDate || "",
          }
        };
      });
      if (adjustments.length > 0) {
        try {
          await adjustStockBulk(adjustments);
        } catch (stockErr) {
          console.warn("Stock reversal failed on delete:", stockErr.message);
        }
      }
    }

    // 2. Delete ALL linked journal entries (main JE + COGS JE) — non-blocking
    const sourceKey = inv.invoiceNumber || inv.number || id;
    const jeSourceTypes = ["salesInvoice", "sales", "salesCOGS", "salesInvoice_cogs", "salesReturnCOGS", "posCOGS"];
    for (const sType of jeSourceTypes) {
      try {
        const jeSnap = await getDocs(
          query(collection(db, `companies/${COMPANY_ID}/journalEntries`),
            where("sourceType", "==", sType),
            where("sourceId",   "==", sourceKey))
        );
        for (const jeDoc of jeSnap.docs) {
          await deleteJournalEntry(jeDoc.id);
          console.log(`[deleteInvoice] Deleted JE ${jeDoc.id} (${sType}) for ${sourceKey}`);
        }
        // Also try by raw invoice id
        if (sourceKey !== id) {
          const jeSnap2 = await getDocs(
            query(collection(db, `companies/${COMPANY_ID}/journalEntries`),
              where("sourceType", "==", sType),
              where("sourceId",   "==", id))
          );
          for (const jeDoc of jeSnap2.docs) {
            await deleteJournalEntry(jeDoc.id);
            console.log(`[deleteInvoice] Deleted JE ${jeDoc.id} (${sType}) for raw id ${id}`);
          }
        }
      } catch (jeErr) {
        console.warn(`[deleteInvoice] JE cleanup (${sType}) skipped:`, jeErr.message);
      }
    }
    // Fallback: delete by stored journalEntryId
    if (inv.journalEntryId) {
      try { await deleteJournalEntry(inv.journalEntryId); } catch (_) {}
    }

    // 3. Delete the invoice doc
    await remove("salesInvoices", id);

    if (inv.customerId) {
      const { recalculateCustomerBalance } = await import("../utils/balance-sync.js");
      await recalculateCustomerBalance(inv.customerId);
    }

    showToast(`✅ تم حذف الفاتورة ${number} بنجاح`, "success");
    loadInvoicesList();
  } catch (err) {
    showToast("خطأ في الحذف: " + err.message, "error");
    console.error("deleteInvoice error:", err);
  }
};

window.openSalesInvoiceFromQuote = async (data) => {
  await loadProductsAndCategories();
  invoiceLines = [];

  for (const item of (data.items || [])) {
    const dbProd = allProducts.find(p => p.id === item.productId);
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const qty = parseFloat(item.qty) || 1;
    const discount = parseFloat(item.discount) || 0;
    const unit = item.unit || dbProd?.unit || "كرتون";
    const altUnit = dbProd?.altUnit || "";
    const unitFactor = parseFloat(dbProd?.unitFactor) || 1;
    const isCustom = !!item.isCustom || String(item.productId || "").startsWith("adhoc_");

    invoiceLines.push({
      productId: item.productId,
      productName: item.productName,
      sku: item.sku || dbProd?.sku || (isCustom ? "بند حر" : ""),
      unit: unit,
      altUnit: altUnit,
      unitFactor: unitFactor,
      selectedUnit: unit,
      basePricePerUnit: unitPrice,
      qty: qty,
      unitPrice: unitPrice,
      discount: discount,
      taxCategory: item.taxCategory || "S",
      costPrice: item.cost || dbProd?.averageCost || dbProd?.costPrice || dbProd?.lastPurchasePrice || 0,
      isCustom: isCustom
    });
  }

  selectedCustomer = null;
  window._editingInvoiceId = null;

  if (data.customerId && data.customerId !== "general") {
    const cust = (cachedCustomers || []).find(c => c.id === data.customerId);
    if (cust) {
      selectedCustomer = cust;
    } else {
      selectedCustomer = { id: data.customerId, name: data.customerName };
    }
  }

  const btn = document.getElementById("save-inv-btn");
  if (btn) btn.textContent = "💾 حفظ وإصدار الفاتورة";

  document.getElementById("inv-number").value = "جارٍ التوليد…";
  document.getElementById("customer-search").value = data.customerName || "";
  document.getElementById("customer-id").value = (data.customerId && data.customerId !== "general") ? data.customerId : "";
  document.getElementById("inv-date").value = todayString();
  document.getElementById("inv-payment").value = "credit";
  document.getElementById("inv-paid-amount").value = "";
  document.getElementById("credit-status-bar").classList.add("hidden"); document.getElementById("inv-aging-alert")?.classList.add("hidden");
  document.getElementById("donation-badge")?.classList.add("hidden");
  document.getElementById("inv-form-error").classList.add("hidden");

  const globalDiscValEl = document.getElementById("inv-global-discount-val");
  const globalDiscTypeEl = document.getElementById("inv-global-discount-type");
  if (globalDiscValEl) globalDiscValEl.value = "0";
  if (globalDiscTypeEl) globalDiscTypeEl.value = "amount";

  setupCustomerAutocomplete();
  setupProductAutocomplete();

  renderInvoiceLines();
  updateInvoiceTotals();

  setTimeout(() => {
    const notesEl = document.getElementById("inv-notes");
    if (notesEl) notesEl.value = `محولة من عرض سعر رقم ${data.quoteNumber || ""}${data.notes ? " | " + data.notes : ""}`;
  }, 300);

  openModal("new-invoice-modal");
  loadRepsDropdown();
  showToast(`تم استيراد بنود عرض السعر ${data.quoteNumber || ""} بنجاح`, "success");
};

window.openSalesInvoiceFromPurchase = async (data) => {
  // Pre-load products, categories, and live stock balances to populate ERP_CACHE
  await loadProductsAndCategories();

  // Clear current lines
  invoiceLines = [];

  // Populate lines and resolve sales prices
  for (const item of (data.items || [])) {
    const dbProd = allProducts.find(p => p.id === item.productId);
    
    // Resolve retail selling price dynamically
    let sellingPrice = 0;
    if (dbProd) {
      sellingPrice = dbProd.salePrice || dbProd.priceRetail || 0;
      if (!sellingPrice) {
        const cost = dbProd.purchasePrice || dbProd.costPrice || dbProd.averageCost || 0;
        sellingPrice = cost * 1.10 * 1.15; // fallback retail margin 10% + 15% VAT
      }
    } else {
      sellingPrice = item.unitPrice * 1.10 * 1.15; // default markup
    }

    invoiceLines.push({
      productId: item.productId,
      productName: item.productName,
      sku: item.sku || "",
      unit: item.unit || "PCS",
      qty: item.qty || 0,
      unitPrice: parseFloat(sellingPrice) || 0,
      discount: 0,
      taxCategory: "S"
    });
  }

  // Set form variables and pre-open config
  selectedCustomer = null;
  window._editingInvoiceId = null;

  const btn = document.getElementById("save-inv-btn");
  if (btn) btn.textContent = "💾 حفظ وإصدار الفاتورة";

  document.getElementById("inv-number").value = "جارٍ التوليد…";
  document.getElementById("customer-search").value = "";
  document.getElementById("customer-id").value = "";
  document.getElementById("inv-date").value = todayString();
  document.getElementById("inv-payment").value = "credit";
  document.getElementById("inv-paid-amount").value = "";
  document.getElementById("credit-status-bar").classList.add("hidden"); document.getElementById("inv-aging-alert")?.classList.add("hidden");
  document.getElementById("donation-badge")?.classList.add("hidden");
  document.getElementById("inv-form-error").classList.add("hidden");

  const globalDiscValEl = document.getElementById("inv-global-discount-val");
  const globalDiscTypeEl = document.getElementById("inv-global-discount-type");
  if (globalDiscValEl) globalDiscValEl.value = "0";
  if (globalDiscTypeEl) globalDiscTypeEl.value = "amount";

  setupCustomerAutocomplete();
  setupProductAutocomplete();

  // Prefill metadata (warehouse first to ensure renderInvoiceLines below reads the correct warehouse stock)
  const waSel = document.getElementById("inv-warehouse");
  if (waSel && data.warehouseId) {
    waSel.value = data.warehouseId;
  }

  // Render lines with correct warehouse quantities loaded in memory
  renderInvoiceLines();
  updateInvoiceTotals();

  setTimeout(() => {
    const notesEl = document.getElementById("inv-notes");
    if (notesEl) notesEl.value = `محولة من فاتورة مشتريات رقم ${data.purchaseNumber || ""}`;
  }, 300);

  openModal("new-invoice-modal");

  // Load dropdowns in background asynchronously
  loadRepsDropdown();
  loadWarehousesDropdown();
  loadCostCentersDropdown();

  try {
    const num = await generateInvoiceNumber("INV");
    document.getElementById("inv-number").value = num;
  } catch {}
};

window.openGoodsReceiptAckForInvoice = async (invId) => {
  if (typeof window.openGoodsReceiptAckModal === "function") {
    window.openGoodsReceiptAckModal({ invoiceId: invId });
  } else {
    const mod = await import("./goods-receipt-ack.js?v=1.0");
    mod.openGoodsReceiptAckModal({ invoiceId: invId });
  }
};


