// ============================================================
// IDHAM ERP — Sales Invoice Module (ZATCA Compliant)
// ============================================================

import { COLS, create, getAll, getById, update, remove, generateInvoiceNumber,
         adjustStock, adjustStockBulk, createJournalEntry, deleteJournalEntry, autoCashTransaction, autoBankTransaction, isPeriodClosed } from "../utils/db.js";
import { collection, query, where, orderBy, limit, getDocs, serverTimestamp, doc, getDoc, updateDoc, increment } from "../utils/db.js";
import { formatCurrency, formatDate, formatISOTimestamp, calcInvoiceTotals,
         getInvoiceStatusBadge, calcLineTotal, todayString, debounce, uuid } from "../utils/formatters.js";
import { generateZATCAQRBase64, renderZATCAQR } from "../utils/zatca-qr.js";
import { APP_CONFIG, COMPANY_ID, getUserProfile } from "../firebase-config.js";
import { db } from "../firebase-config.js";
import { autoSalesJE } from "../utils/accounting-engine.js";
import { exportToExcel } from "../utils/excel.js";

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
    console.log(`[Toast Fallback - ${type}]:`, message);
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

  // ديبونس على حقل البحث — 300ms تأخير بعد التوقف عن الكتابة
  const searchEl = document.getElementById("inv-text-filter");
  if (searchEl) {
    searchEl.addEventListener("input", (window.debounce || ((fn) => fn))(() => loadInvoicesList(), 300));
  }

  await Promise.all([
    loadListFiltersData(),
    loadInvoicesList()
  ]);

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
        <select id="inv-status-filter">
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
        <select id="inv-zatca-filter">
          <option value="">الكل</option>
          <option value="reported">مُرسلة</option>
          <option value="pending">لم تُرسل</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>العميل</label>
        <select id="inv-customer-filter" onchange="loadInvoicesList()">
          <option value="">كل العملاء</option>
        </select>
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
        <button class="quick-filter-btn" onclick="invFilterRange('today')">اليوم</button>
        <button class="quick-filter-btn active" onclick="invFilterRange('month')">هذا الشهر</button>
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

    <!-- New/Edit Invoice Modal -->
    <div class="modal-overlay" id="new-invoice-modal">
      <div class="modal modal-xl">
        <div class="modal-header">
          <h3 class="modal-title" id="invoice-modal-title">فاتورة مبيعات جديدة</h3>
          <button class="modal-close" onclick="closeModal('new-invoice-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <!-- Header Fields -->
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group">
              <label>رقم الفاتورة</label>
              <input type="text" id="inv-number" class="input mono" readonly placeholder="يُولَّد تلقائياً" />
            </div>
            <div class="form-group">
              <label>التاريخ *</label>
              <input type="date" id="inv-date" class="input" value="${todayString()}" />
            </div>
            <div class="form-group">
              <label>نوع الفاتورة</label>
              <select id="inv-type">
                <option value="standard">فاتورة ضريبية (B2B)</option>
                <option value="simplified">فاتورة مبسطة (B2C)</option>
              </select>
            </div>
          </div>

          <div class="grid-3 gap-16 mb-16">
            <!-- Customer -->
            <div class="form-group">
              <label>العميل *</label>
              <div class="autocomplete-container" id="customer-ac-wrap">
                <input type="text" id="customer-search" class="input" placeholder="ابحث باسم العميل…" autocomplete="off" />
                <div class="autocomplete-results hidden" id="customer-results"></div>
                <input type="hidden" id="customer-id" />
              </div>
              <div id="donation-badge" class="alert info hidden" style="margin-top:8px; padding: 6px 12px; font-size:11px; font-weight: bold; border-left: 3px solid var(--info, #3b82f6); background: rgba(59,130,246,0.1); color: #3b82f6;"></div>
              <!-- Credit Status -->
              <div id="credit-status-bar" class="hidden" style="margin-top:8px;">
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
            </div>

            <!-- Sales Rep -->
            <div class="form-group">
              <label>المندوب (اختياري)</label>
              <select id="inv-rep" onchange="window.autoSelectCostCenter && window.autoSelectCostCenter()">
                <option value="">بيع مباشر (بدون مندوب)</option>
              </select>
            </div>

            <!-- Warehouse -->
            <div class="form-group">
              <label>المخزن *</label>
              <select id="inv-warehouse" onchange="window.resolveAllLineBatches(); renderInvoiceLines(); window.autoSelectCostCenter && window.autoSelectCostCenter();">
                <option value="">اختر المخزن</option>
              </select>
            </div>

            <!-- Cost Center -->
            <div class="form-group">
              <label>🏷️ مركز التكلفة (اختياري)</label>
              <select id="inv-cost-center">
                <option value="">بدون مركز تكلفة</option>
              </select>
            </div>
          </div>

          <div class="grid-3 gap-16 mb-16">
            <div class="form-group">
              <label>طريقة الدفع</label>
              <select id="inv-payment" onchange="updateInvoiceTotals()">
                <option value="cash">نقدي</option>
                <option value="credit">آجل</option>
                <option value="transfer">تحويل بنكي</option>
                <option value="check">شيك</option>
              </select>
            </div>
            <div class="form-group">
              <label>المبلغ المدفوع (ر.س)</label>
              <input type="number" id="inv-paid-amount" class="input mono" step="0.01" min="0" placeholder="0.00" />
            </div>
            <div class="form-group">
              <label>ملاحظات</label>
              <input type="text" id="inv-notes" class="input" placeholder="ملاحظة اختيارية" />
            </div>
          </div>

          <div class="divider-label">بنود الفاتورة</div>

          <!-- Line Items -->
          <div class="invoice-lines">
            <table style="width:100%;font-size:12.5px;">
              <thead>
                <tr style="background:var(--bg-2);border-bottom:1px solid var(--border);">
                  <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-2);">#</th>
                  <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-2);">الصنف</th>
                  <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-2);">الوحدة</th>
                  <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-2);">الكمية</th>
                  <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-2);">سعر الوحدة</th>
                  <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-2);">خصم%</th>
                  <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-2);">رقم التشغيلة</th>
                  <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-2);">تاريخ الانتهاء</th>
                  <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-2);">ض.ق.م</th>
                  <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-2);">الإجمالي</th>
                  <th style="width:36px;"></th>
                </tr>
              </thead>
              <tbody id="invoice-lines-tbody"></tbody>
            </table>
          </div>

          <div class="grid-2 gap-16" style="margin-top:16px; align-items:start;">
            <!-- Add Product & Search -->
            <div>
              <div style="display:grid; grid-template-columns:160px 1fr; gap:12px; align-items:end;">
                <div class="form-group" style="margin-bottom:0;">
                  <label style="font-size:11px; margin-bottom:4px;">تصفية بالفئة</label>
                  <select id="inv-product-category-filter" class="input" style="padding:6px; font-size:12px; height:34px;">
                    <option value="">كل الفئات</option>
                  </select>
                </div>
                <div class="form-group" style="margin-bottom:0;">
                  <label style="font-size:11px; margin-bottom:4px;">إضافة صنف للفاتورة</label>
                  <div class="autocomplete-container">
                    <input type="text" id="product-search-input" class="input" style="padding:6px; font-size:12px; height:34px;" placeholder="🔍 ابحث باسم الصنف أو الكود للإضافة... [F8 للبحث المتقدم]" autocomplete="off" />
                    <div class="autocomplete-results hidden" id="product-search-results"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Totals -->
            <div style="display:flex; justify-content:flex-end;">
              <div class="invoice-totals" style="width:100%; max-width:320px;">
                <div class="invoice-total-row">
                  <span>المجموع الفرعي</span>
                  <span class="mono" id="total-subtotal">0.00 ر.س</span>
                </div>
                <div class="invoice-total-row">
                  <span>الخصم الإجمالي</span>
                  <span class="mono text-bad" id="total-discount">0.00 ر.س</span>
                </div>
                <div class="invoice-total-row">
                  <span>ضريبة القيمة المضافة (15%)</span>
                  <span class="mono text-warn" id="total-vat">0.00 ر.س</span>
                </div>
                <div class="invoice-total-row grand-total">
                  <span>الإجمالي النهائي</span>
                  <span class="mono" id="total-grand">0.00 ر.س</span>
                </div>
                <div class="invoice-total-row" style="border-top:1px dashed var(--border-soft); margin-top:8px; padding-top:8px;">
                  <span style="font-weight:bold;color:var(--good);">الربح التقديري (صافي)</span>
                  <span class="mono font-bold text-good" id="total-profit">0.00 ر.س</span>
                </div>
                <div class="invoice-total-row">
                  <span style="font-weight:bold;color:var(--good);">نسبة الهامش التقديرية</span>
                  <span class="mono font-bold text-good" id="total-margin">0.0%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group mb-16" style="margin-top: 16px;">
            <label>📁 إرفاق مستند / سند تسليم الفاتورة (أتمتة الأرشيف)</label>
            <input type="file" id="inv-file-upload" class="input" accept="image/*,application/pdf" />
          </div>

          <div id="inv-form-error" class="alert bad hidden" style="margin-top:12px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="closeModal('new-invoice-modal')">إلغاء</button>
          <button class="btn btn-secondary" onclick="saveInvoice('draft')">حفظ مسودة</button>
          <button class="btn btn-primary" onclick="saveInvoice('pending')" id="save-inv-btn">💾 حفظ وإصدار</button>
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

    let q = COLS.salesInvoices();
    const constraints = [];
    if (from) {
      constraints.push(where("date", ">=", from));
    }
    if (to) {
      constraints.push(where("date", "<=", to));
    }

    if (!from && !to) {
      // جلب آخر 100 فاتورة فقط لتسريع الصفحة الافتتاحية
      q = query(q, ...constraints, orderBy("date", "desc"), limit(100));
    } else {
      q = query(q, ...constraints, orderBy("date", "desc"));
    }

    const snap = await getDocs(q);
    let invs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Cache loaded invoices in memory for 0ms instant view
    invs.forEach(inv => invoicesCache.set(inv.id, inv));

    // Customer, Sales Rep, Warehouse, and Status filters
    const statusF = document.getElementById("inv-status-filter")?.value;
    if (statusF) {
      invs = invs.filter(inv => inv.status === statusF);
    }
    const custF = document.getElementById("inv-customer-filter")?.value;
    if (custF) {
      invs = invs.filter(inv => inv.customerId === custF || inv.customerName === (cachedCustomers?.find(c => c.id === custF)?.name));
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

      if (!from && !to && !custF) {
        rq = query(rq, ...rConstraints, orderBy("date", "desc"), limit(100));
      } else {
        rq = query(rq, ...rConstraints, orderBy("date", "desc"));
      }

      const rcptSnap = await getDocs(rq);
      const receipts = rcptSnap.docs.map(d => ({ id: d.id, ...d.data() }));

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

    let totalUnpaid = Math.max(0, totalSales - totalPaid);
    if (repF) {
      const repCusts = cachedCustomers?.filter(c => c.repId === repF || c.repName === selectedRepName || (selectedRepName && c.repName?.includes("مصطفى"))) || [];
      const repDebtSum = repCusts.reduce((sum, c) => sum + parseFloat(c.balance || 0), 0);
      if (repDebtSum > 0) totalUnpaid = repDebtSum;
    }
    const zatcaCount = invs.filter(i => i.zatcaStatus === "reported").length;

    document.getElementById("kpi-total").textContent  = formatCurrency(totalSales);
    document.getElementById("kpi-paid").textContent   = formatCurrency(totalPaid);
    document.getElementById("kpi-unpaid").textContent = formatCurrency(totalUnpaid);
    document.getElementById("kpi-zatca").textContent  = `${zatcaCount} / ${invs.length}`;
    document.getElementById("inv-count-label").textContent = `${invs.length} فاتورة`;


    if (invs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد فواتير</td></tr>`;
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
    tbody.innerHTML = `<tr><td colspan="11"><div class="alert bad" style="margin:8px;">${err.message}</div></td></tr>`;
  }
}

window.invFilterRange = (range) => {
  const today = todayString();
  if (range === "today") {
    document.getElementById("inv-from").value = today;
    document.getElementById("inv-to").value   = today;
  } else if (range === "month") {
    document.getElementById("inv-from").value = new Date(new Date().setDate(1)).toISOString().split("T")[0];
    document.getElementById("inv-to").value   = today;
  }
  document.querySelectorAll(".quick-filter-btn").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
  loadInvoicesList();
};

// ── New Invoice (Instant 0ms Modal Open) ──
window.openNewInvoice = () => {
  invoiceLines = [];
  selectedCustomer = null;
  window._editingInvoiceId = null;

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
  document.getElementById("credit-status-bar").classList.add("hidden");
  document.getElementById("donation-badge")?.classList.add("hidden");
  document.getElementById("inv-form-error").classList.add("hidden");

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

  const donationBadge = document.getElementById("donation-badge");
  const isDonation = id === "005" || name.includes("سلة البركة");

  if (isDonation) {
    if (donationBadge) {
      donationBadge.textContent = "🎁 عميل تبرعات (معفى من الضريبة وتكلفتها مصروف تبرعات)";
      donationBadge.classList.remove("hidden");
    }
    document.getElementById("credit-status-bar")?.classList.add("hidden");
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
      document.getElementById("credit-status-bar")?.classList.add("hidden");
    }
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
      const safeCost  = p.averageCost || p.costPrice || p.purchasePrice || 0;
      return `
        <div class="autocomplete-item" onclick="addProductLine('${p.id}','${safeName}',${safePrice},'${safeUnit}','${safeCat}',${safeCost})">
          <div class="flex justify-between">
            <span>${p.name}</span>
            <div>
              <span class="mono text-indigo" style="margin-left:12px;">${formatCurrency(p.salePrice)}</span>
              <span class="${qtyClass}" style="font-size:10px;">المتاح: ${qty}</span>
            </div>
          </div>
          <div class="item-code">${p.sku || ''} | ${p.unit || ''}</div>
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

window.addProductLine = (productId, productName, unitPrice, unit, taxCategory, costPrice = 0) => {
  document.getElementById("product-search-input").value = "";
  document.getElementById("product-search-results").classList.add("hidden");

  invoiceLines.push({
    productId, productName, unit,
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
    qty: 1, unitPrice, discount: 0,
    costPrice: costPrice || 0,
    batchNumber: "",
    expiryDate: "",
    availableBatches: []
  });
  
  const lineIdx = invoiceLines.length - 1;
  renderInvoiceLines();
  updateInvoiceTotals();
  
  window.resolveLineBatches(lineIdx);
};

function renderInvoiceLines() {
  const tbody = document.getElementById("invoice-lines-tbody");
  if (!tbody) return;

  if (invoiceLines.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:16px;color:var(--text-2);font-size:12px;">لم يتم إضافة أصناف بعد</td></tr>`;
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
    const lineTotal = calcLineTotal(line.qty, line.unitPrice, line.discount);
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
    const isOver = line.qty > avail;

    return `<tr style="border-bottom:1px solid var(--border-soft);">
      <td style="padding:6px 10px;color:var(--text-2);width:30px;">${i + 1}</td>
      <td style="padding:6px 10px;"><span style="font-family:var(--font-heading);font-size:12.5px;">${line.productName}</span></td>
      <td style="padding:6px 10px;font-size:11px;color:var(--text-2);">${line.unit}</td>
      <td style="padding:6px 10px;width:80px;">
        <input type="number" class="input mono" style="width:70px;height:30px;font-size:12px;${isOver ? 'border-color:var(--bad);background-color:rgba(239,68,68,0.05);' : ''}"
          value="${line.qty}" min="0.001" step="0.001"
          onchange="updateLine(${i},'qty',this.value)" />
        <div style="font-size:9.5px;margin-top:2px;white-space:nowrap;color:${isOver ? 'var(--bad)' : 'var(--text-dim)'};font-weight:${isOver ? '700' : 'normal'};">
          المتاح: ${avail}
        </div>
      </td>
      <td style="padding:6px 10px;width:110px;">
        <input type="number" class="input mono" style="width:100px;height:30px;font-size:12px;"
          value="${line.unitPrice}" min="0" step="0.01"
          onchange="updateLine(${i},'unitPrice',this.value)" />
      </td>
      <td style="padding:6px 10px;width:70px;">
        <input type="number" class="input mono" style="width:60px;height:30px;font-size:12px;"
          value="${line.discount}" min="0" max="100" step="0.1"
          onchange="updateLine(${i},'discount',this.value)" />
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
  invoiceLines[idx][field] = parseFloat(val) || 0;
  renderInvoiceLines();
  updateInvoiceTotals();
};

window.removeLine = (idx) => {
  invoiceLines.splice(idx, 1);
  renderInvoiceLines();
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
  
  // Calculate base totals using default formula
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

  const isDonation = selectedCustomer?.id === "005" || (selectedCustomer?.name || "").includes("سلة البركة");
  if (isDonation) {
    invoiceLines.forEach(l => { l.taxCategory = "E"; });
  }

  const finalSubtotal = isDonation ? 0 : Math.max(0, totals.subtotal - autoDiscountAmount);
  const finalVat = isDonation ? 0 : Math.round((finalSubtotal * 0.15) * 100) / 100;
  const finalGrand = finalSubtotal + finalVat;

  const fmt = (n) => `${formatCurrency(n)}`;
  document.getElementById("total-subtotal").textContent  = fmt(totals.subtotal + totals.discountTotal);
  
  // Display total discount including automatic ones
  const totalDiscount = totals.discountTotal + autoDiscountAmount;
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

  // Store automatic discount info on window
  window._autoDiscountAmount = autoDiscountAmount;
  window._autoDiscountRate = additionalDiscountPct;
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
  
  const subtotal = isDonation ? 0 : Math.max(0, baseTotals.subtotal - autoDiscount);
  const discountTotal = baseTotals.discountTotal + autoDiscount;
  const totalVat = isDonation ? 0 : Math.round((subtotal * 0.15) * 100) / 100;
  const totalWithVat = subtotal + totalVat;
  const remainingAmount = Math.max(0, totalWithVat - paidAmount);

  // 1. Max rep manual discount check
  let exceededDiscount = false;
  invoiceLines.forEach(line => {
    if (line.discount > (pricingPolicy.maxRepDiscount ?? 3)) {
      exceededDiscount = true;
    }
  });

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

    // Verify stock availability for all items before saving invoice
    // If editing, load the old invoice and add back its quantities to the validation pool
    let oldInv = null;
    let oldInvMap = {};
    if (window._editingInvoiceId) {
      try {
        oldInv = await getById("salesInvoices", window._editingInvoiceId);
        if (oldInv && oldInv.lines && oldInv.warehouseId === warehouseId) {
          oldInv.lines.forEach(l => {
            if (l.productId) {
              oldInvMap[l.productId] = (oldInvMap[l.productId] || 0) + (l.qty || 0);
            }
          });
        }
      } catch (e) {
        console.warn("Failed to load old invoice for stock validation:", e);
      }
    }

    const stockPromises = invoiceLines.map(async (line) => {
      if (!line.productId || !line.qty) return null;
      try {
        const stockDocId = `${warehouseId}_${line.productId}`;
        const stockSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, stockDocId));
        let currentQty = stockSnap.exists() ? (stockSnap.data().qty || 0) : 0;
        
        // Add back the quantity from the old invoice since it will be reversed
        if (oldInvMap[line.productId]) {
          currentQty += oldInvMap[line.productId];
        }

        if (currentQty < line.qty) {
          return `⚠️ الكمية المطلوبة من الصنف "${line.productName || line.productId}" (${line.qty}) تتجاوز المتوفر في هذا المخزن (${currentQty})`;
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
      btn.disabled = false;
      btn.textContent = "💾 حفظ وإصدار";
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
      number:       invNum,
      uuid:         invUUID,
      date:         invDate,
      invoiceType:  invType,
      customerId:   customerId || null,
      customerName: customerName || "عميل نقدي",
      repId, repName, warehouseId, warehouseName,
      costCenterId: costCenterId || null,
      costCenterName: costCenterName || null,
      lines:        invoiceLines,
      subtotal,
      discountTotal,
      totalVat,
      vatAmount:    totalVat,
      total:        totalWithVat,
      totalWithVat,
      paymentMethod: payment,
      paidAmount,
      remainingAmount,
      notes,
      status:       finalStatus,
      zatcaStatus:  "pending",
      qrBase64,
      createdBy:    window._salesUser?.uid || "system",
      autoDiscountAmount: autoDiscount,
      autoDiscountRate: window._autoDiscountRate || 0,
    };

    // Save invoice
    let invId = window._editingInvoiceId;
    if (invId) {
      // Optimized Stock adjustments for edit: only reverse/issue changed items
      const oldInv = await getById("salesInvoices", invId);
      if (oldInv) {
        const oldLinesMap = {};
        if (oldInv.lines) {
          oldInv.lines.forEach(l => {
            const key = `${l.productId}_${l.batchNumber || ""}`;
            oldLinesMap[key] = {
              productId: l.productId,
              qty: l.qty,
              warehouseId: oldInv.warehouseId,
              batchNumber: l.batchNumber || "",
              expiryDate: l.expiryDate || ""
            };
          });
        }
        const newLinesMap = {};
        invoiceLines.forEach(l => {
          const key = `${l.productId}_${l.batchNumber || ""}`;
          newLinesMap[key] = {
            productId: l.productId,
            qty: l.qty,
            warehouseId: warehouseId,
            batchNumber: l.batchNumber || "",
            expiryDate: l.expiryDate || ""
          };
        });

        // 1. Gather all stock changes for edit mode in bulk
        const adjustments = [];
        for (const [key, oldLine] of Object.entries(oldLinesMap)) {
          const newLine = newLinesMap[key];
          if (!newLine || newLine.qty !== oldLine.qty || newLine.warehouseId !== oldLine.warehouseId) {
            adjustments.push({
              warehouseId: oldLine.warehouseId,
              productId: oldLine.productId,
              qtyDelta: oldLine.qty,
              metadata: {
                type: "sale_reverse_edit",
                refId: oldInv.number,
                documentNumber: oldInv.number,
                invoiceNumber: oldInv.number,
                batchNumber: oldLine.batchNumber || "",
                expiryDate: oldLine.expiryDate || "",
                notes: `تعديل الفاتورة ${oldInv.number} (عكس الكمية القديمة)`
              }
            });
          }
        }

        invoiceLines.forEach(line => {
          if (!line.productId || !line.qty) return;
          const key = `${line.productId}_${line.batchNumber || ""}`;
          const oldLine = oldLinesMap[key];
          if (!oldLine || oldLine.qty !== line.qty || oldLine.warehouseId !== warehouseId) {
            adjustments.push({
              warehouseId,
              productId: line.productId,
              qtyDelta: -line.qty,
              metadata: {
                type: "sale_out",
                sourceType: "salesInvoice",
                sourceId: invId,
                documentNumber: invoiceData.number,
                invoiceNumber: invoiceData.number,
                date: invoiceData.date || new Date().toISOString().split("T")[0],
                productName: line.productName || line.name || "",
                userId: window._salesUser?.uid,
                createdByName: window._salesUser?.displayName || window._salesUser?.email || "النظام",
                batchNumber: line.batchNumber || "",
                expiryDate: line.expiryDate || "",
                notes: `فاتورة بيع ${invoiceData.number}`,
              }
            });
          }
        });

        if (adjustments.length > 0) {
          try {
            await adjustStockBulk(adjustments);
          } catch (stockErr) {
            console.error("[adjustStockBulk] ❌ Edit adjust stock failed:", stockErr.message);
            if (stockErr.message.includes("رصيد")) {
              window.showToast?.(`⚠️ رصيد غير كافٍ لبعض الأصناف`, "warn");
            }
          }
        }
      }

      // Clean up old transactions, receipts, and their JEs
      if (oldInv) {
        await cleanupInvoiceAssociatedTransactions(oldInv);
      }

      // Delete ALL linked journal entries (main + COGS) before recreating
      const oldSourceKey = oldInv?.invoiceNumber || oldInv?.number || invId;
      const editJeTypes  = ["salesInvoice", "sales", "salesCOGS", "salesInvoice_cogs", "salesReturnCOGS", "posCOGS"];
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
      // Create new invoice
      invId = await create(COLS.salesInvoices(), invoiceData);

      // Adjust stock for each line in bulk
      const adjustments = invoiceLines.map(line => ({
        warehouseId,
        productId: line.productId,
        qtyDelta: -line.qty,
        metadata: {
          type: "sale_out",
          sourceType: "salesInvoice",
          sourceId: invId,
          documentNumber: invoiceData.number,
          invoiceNumber: invoiceData.number,
          date: invoiceData.date || new Date().toISOString().split("T")[0],
          productName: line.productName || line.name || "",
          userId: window._salesUser?.uid,
          createdByName: window._salesUser?.displayName || window._salesUser?.email || "النظام",
          batchNumber: line.batchNumber || "",
          expiryDate: line.expiryDate || "",
          notes: `فاتورة بيع ${invoiceData.number}`,
        }
      }));
      if (adjustments.length > 0) {
        try {
          await adjustStockBulk(adjustments);
        } catch (stockErr) {
          console.error("[adjustStockBulk] ❌ Create adjust stock failed:", stockErr.message);
          if (stockErr.message.includes("رصيد")) {
            window.showToast?.(`⚠️ رصيد غير كافٍ لبعض الأصناف`, "warn");
          }
        }
      }
    }

    // ─── Automated Accounting Engine ───
    // ✅ FIX: أولوية averageCost موحدة في كل مكان — averageCost → costPrice → purchasePrice
    let totalCost = invoiceLines.reduce((s, l) => {
      const avgCost = l.averageCost || l.costPrice || l.purchasePrice || 0;
      return s + (avgCost * (l.qty || 0));
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
              // ✅ FIX: أولوية موحدة: averageCost → costPrice → purchasePrice
              const cost = pd.averageCost || pd.costPrice || pd.purchasePrice || 0;
              l.averageCost = cost;  // ✅ تخزينها في averageCost للاتساق مع الحساب الفوري
              l.costPrice = cost;
              return cost * (l.qty || 0);
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
          console.log(`[COGS] Fetched from Firestore in parallel: ${totalCost}`);
        }
      } catch(e) {
        console.warn("[COGS] Failed to fetch product costs:", e.message);
      }
    }

    try {
      const warehouses = await getAll(COLS.warehouses());
      
      // If editing an existing invoice, delete old journal entries so autoSalesJE can recreate them with updated cost center
      if (window._editingInvoiceId) {
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
        taxAmount:     totalVat,
        total:         totalWithVat,
        paidAmount:    paidAmount,
        remainingAmount: remainingAmount,
        totalCost,
        warehouseId,
        warehouseName,
        costCenterId,
        sourceType:    "salesInvoice",
        customerId:    customerId,
      }, window._salesUser || {}, warehouses);
      await update("salesInvoices", invId, { journalEntryId: jeId, totalCost: Math.round(totalCost * 100) / 100 });
    } catch(jeErr) {
      // سجّل الخطأ في Firestore ليتمكن الـ Backfill من اكتشافه وإصلاحه تلقائياً
      console.error("[AccountingEngine] Sales JE failed:", jeErr.message);
      try { await update("salesInvoices", invId, { journalEntryError: jeErr.message, journalEntryId: null }); } catch(_){}
      window.showToast?.("⚠️ تم حفظ الفاتورة لكن القيد المحاسبي فشل — " + jeErr.message, "warn");
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

    // Update Customer balance on client side (since Cloud Functions are disabled on Spark plan)
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

    const successMsg = window._editingInvoiceId ? `تم تحديث الفاتورة ${invNum} بنجاح` : `تم إنشاء الفاتورة ${invNum} بنجاح`;
    window._editingInvoiceId = null;
    showToast(successMsg, "success");

    const fileInput = document.getElementById("inv-file-upload");
    if (fileInput && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      window.uploadFileToArchive(file, "sales_invoices", invId, `مرفق فاتورة مبيعات رقم ${invNum}`).catch(e => console.warn(e));
    }

    closeModal("new-invoice-modal");
    await loadInvoicesList();

    if (customerId) {
      import("../utils/balance-sync.js").then(m => m.recalculateCustomerBalance(customerId)).catch(e => console.warn(e));
    }

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

    const lines = (inv.lines || []).map((l, i) => {
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
    const lines = invData.items || invData.lines || [];
    const warehouseId = invData.warehouseId || invData.sourceWarehouseId;
    if (warehouseId && lines.length > 0) {
      const adjustments = [];
      for (const item of lines) {
        const productId = item.productId || item.id;
        const qty = parseFloat(item.quantity || item.qty || 0);
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

window.printInvoice = async () => {
  if (!currentInvoice) return;
  const inv = currentInvoice;

  // 1. Load company settings (from localStorage cache first, then Firestore)
  let co = {
    name: "مؤسسة إدهام للمواد الغذائية",
    vatNumber: "300987654300003",
    address: "الرياض، المملكة العربية السعودية",
    phone: "", email: "", logoUrl: "", crNumber: ""
  };
  // Fast path: use cached company data from localStorage
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
      // Normalize: `cr` field → `crNumber`
      if (d.cr && !d.crNumber) d.crNumber = d.cr;
      Object.assign(co, d);
      // Cache for future use
      const cached2 = JSON.parse(localStorage.getItem("idham_company") || "{}");
      localStorage.setItem("idham_company", JSON.stringify({ ...cached2, ...d, crNumber: d.crNumber || d.cr || "" }));
    }
    if (logoSnap.exists() && logoSnap.data().dataUrl) {
      co.logoUrl = logoSnap.data().dataUrl;
    }
  } catch (e) { console.warn("Failed to load company settings from Firestore:", e); }

  // 2. Load customer full data from Firestore
  let cust = {
    name: inv.customerName || "—",
    vatNumber: "", phone: inv.customerPhone || "", address: "", crNumber: "", email: ""
  };
  if (inv.customerId) {
    try {
      const { getDoc: gd2, doc: dd2 } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
      const custSnap = await gd2(dd2(db, `companies/${COMPANY_ID}/customers`, inv.customerId));
      if (custSnap.exists()) {
        Object.assign(cust, custSnap.data());
        if (custSnap.data().name) cust.name = custSnap.data().name;
      }
    } catch (e) { console.warn("Failed to load customer data:", e); }
  }

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

  // Always regenerate QR with real company data (don't trust the stored QR which may have old/wrong data)
  const qrData = buildZatcaQr(
    co.name      || "مؤسسة إدهام للمواد الغذائية",
    co.vatNumber || co.crNumber || "",
    inv.date, inv.totalWithVat, inv.totalVat
  ) || inv.zatcaQr || inv.qrBase64 || inv.qrCodeData || inv.qr;

  // 4. Build line items HTML
  const linesHtml = (inv.lines || []).map((l, i) => {
    const qty = parseFloat(l.qty || 0);
    const price = parseFloat(l.unitPrice || 0);
    const discPercent = parseFloat(l.discount || 0);
    const taxableAmount = (qty * price) * (1 - discPercent / 100);
    const vatRate = (l.taxCategory === "E" || l.taxCategory === "Z") ? 0 : 15;
    const vatAmount = taxableAmount * (vatRate / 100);
    const totalWithVat = taxableAmount + vatAmount;

    return `
      <tr>
        <td>${i + 1}</td>
        <td class="desc">${l.productName || ""}<br><span style="font-size:9px;color:#6b7280;">الواحدة: ${l.unit || "حبة"}</span></td>
        <td>${qty}</td>
        <td class="mono">${formatCurrency(price)}</td>
        <td class="mono">${formatCurrency(taxableAmount)}</td>
        <td>${vatRate}%</td>
        <td class="mono">${formatCurrency(vatAmount)}</td>
        <td class="mono" style="font-weight:700;">${formatCurrency(totalWithVat)}</td>
      </tr>`;
  }).join("");

    const logoSrc = co.logoUrl || co.logoBase64 || co.logo || "";
  const logoHtml = logoSrc
    ? `<div class="logo-circle"><img src="${logoSrc}" alt="شعار" /></div>`
    : `<div class="logo-circle"><div class="default-logo">🏢</div></div>`;

  const barcodeSvg = (() => {
    const clean = inv.number.replace(/[^a-zA-Z0-9]/g, '');
    let svg = '<svg width="140" height="36" viewBox="0 0 140 36" xmlns="http://www.w3.org/2000/svg">';
    let x = 12;
    let hash = 5381;
    for (let i = 0; i < clean.length; i++) {
      hash = ((hash << 5) + hash) + clean.charCodeAt(i);
    }
    svg += '<rect x="' + x + '" y="2" width="2" height="20" fill="#000" />'; x += 3;
    svg += '<rect x="' + x + '" y="2" width="1" height="20" fill="#000" />'; x += 2;
    for (let i = 0; i < 18; i++) {
      const width = ((Math.abs(hash) >> i) & 1) ? 2.5 : 1;
      svg += '<rect x="' + x + '" y="2" width="' + width + '" height="20" fill="#000" />';
      x += width + 1.5;
    }
    svg += '<rect x="' + x + '" y="2" width="1" height="20" fill="#000" />'; x += 2;
    svg += '<rect x="' + x + '" y="2" width="2" height="20" fill="#000" />';
    svg += '<text x="70" y="32" font-family="monospace" font-size="8" text-anchor="middle" fill="#000">' + inv.number + '</text>';
    svg += '</svg>';
    return svg;
  })();

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>فاتورة ضريبية مبسطة #${inv.number}</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'IBM Plex Sans Arabic', sans-serif; direction: rtl; color: #1f2937; background: #f3f4f6; padding: 10px; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    
    .no-print { background: #1f2937; padding: 10px; display: flex; gap: 10px; justify-content: center; margin-bottom: 10px; border-radius: 8px; }
    .btn { padding: 8px 18px; font-weight: 600; border-radius: 8px; cursor: pointer; border: none; font-size: 13px; font-family: inherit; }
    
    .invoice-container { background: #fff; max-width: 210mm; margin: 0 auto; padding: 15px; border: 1.5px solid #5b3ec2; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    
    /* Top Barcode and Title */
    .top-row { display: flex; justify-content: center; align-items: center; margin-bottom: 12px; position: relative; }
    .title-box { text-align: center; }
    .title-box h1 { font-size: 22px; color: #5b3ec2; font-weight: 800; margin-bottom: 2px; }
    .title-box h2 { font-size: 10px; color: #5b3ec2; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
    
    /* Purple Company Banner */
    .company-banner { background: #5b3ec2 !important; color: #fff !important; border-radius: 8px; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .banner-left { text-align: right; font-size: 12px; font-weight: 500; line-height: 1.5; color: #fff !important; }
    .banner-left div { color: #fff !important; }
    .banner-left strong { color: #fff !important; }
    .banner-right { text-align: left; line-height: 1.4; color: #fff !important; }
    .banner-right h2 { font-size: 17px; font-weight: 800; margin-bottom: 4px; color: #fff !important; }
    .banner-right div { font-size: 12px; color: #fff !important; }
    .banner-right strong { color: #fff !important; }
    .logo-circle { width: 70px; height: 70px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 4px; border: 1.5px solid #5b3ec2; box-shadow: 0 3px 6px rgba(0,0,0,0.1); }
    .logo-circle img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .logo-circle .default-logo { font-size: 30px; }
    
    /* Info Strips */
    .info-strip { border: 1px solid #5b3ec2; border-radius: 6px; padding: 6px 12px; font-size: 10.5px; background: #fdfcff; margin-bottom: 8px; display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
    .info-strip span { color: #1f2937; }
    .info-strip strong { color: #5b3ec2; }
    
    /* Table Styling */
    .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #5b3ec2; border-radius: 8px; overflow: hidden; }
    .invoice-table thead tr { background: #5b3ec2 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .invoice-table thead th { color: #fff !important; font-size: 10.5px; font-weight: 700; padding: 8px 4px; text-align: center; border: 1px solid rgba(255,255,255,0.15); }
    .invoice-table tbody tr { border-bottom: 1px solid #5b3ec2; }
    .invoice-table tbody tr:nth-child(even) { background: #fdfcff; }
    .invoice-table tbody tr:last-child { border-bottom: none; }
    .invoice-table tbody td { padding: 8px 4px; font-size: 11px; text-align: center; border: 1px solid #e5e7eb; color: #1f2937; white-space: nowrap; }
    .invoice-table tbody td.desc { text-align: right; font-weight: 700; white-space: normal; }
    .invoice-table tbody td.mono { font-family: 'IBM Plex Mono', 'Courier New', monospace; font-weight: 500; }
    
    /* Totals section */
    .totals-section { display: flex; justify-content: space-between; align-items: stretch; gap: 15px; margin-top: 10px; }
    .left-footer-box { width: 52%; display: flex; gap: 10px; align-items: stretch; }
    .qr-wrapper { border: 1px solid #5b3ec2; border-radius: 8px; padding: 6px; background: #fff; display: flex; align-items: center; justify-content: center; width: 90px; flex-shrink: 0; }
    .notes-box { flex-grow: 1; font-size: 10.5px; color: #4b5563; border: 1px solid #5b3ec2; border-radius: 8px; padding: 10px; background: #fff; }
    .notes-box h4 { color: #5b3ec2; font-weight: 700; margin-bottom: 4px; font-size: 11px; }
    .notes-content { line-height: 1.4; color: #4b5563; }
    
    .totals-box { width: 44%; border: 1px solid #5b3ec2; border-radius: 8px; overflow: hidden; background: #fff; display: flex; flex-direction: column; justify-content: space-between; }
    .totals-row { display: flex; justify-content: space-between; padding: 7px 10px; font-size: 11px; border-bottom: 1px solid #e5e7eb; color: #4b5563; }
    .totals-row:last-child { border-bottom: none; }
    .totals-row.grand-total { background: #5b3ec2 !important; color: #fff !important; font-weight: 800; font-size: 13.5px; border-bottom: none; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .totals-row.grand-total span { color: #fff !important; }
    .totals-row span.val { font-family: 'IBM Plex Mono', 'Courier New', monospace; font-weight: 700; }
    .totals-row.discount { color: #dc2626; }
    
    .thank-you { text-align: center; padding: 10px; font-size: 11px; color: #6b7280; font-weight: 500; border-top: 1px dashed #5b3ec2; margin-top: 15px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
    
    @page {
      size: A4;
      margin: 8mm 10mm 8mm 10mm;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .no-print { display: none !important; }
      .invoice-container { max-width: 100%; box-shadow: none; border-radius: 0; border: 1px solid #5b3ec2; padding: 12px; }
      .company-banner { background: #5b3ec2 !important; color: #fff !important; }
      .invoice-table thead tr { background: #5b3ec2 !important; }
      .totals-row.grand-total { background: #5b3ec2 !important; color: #fff !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn" style="background:#5b3ec2;color:#fff;" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
    <button class="btn" style="background:#374151;color:#fff;" onclick="window.close()">✕ إغلاق</button>
  </div>

  <div class="invoice-container">
    <!-- Top Barcode and Title -->
    <div class="top-row">
      <div class="title-box">
        <h1>فاتورة ضريبية مبسطة</h1>
        <h2>SIMPLIFIED TAX INVOICE</h2>
      </div>
    </div>

    <!-- Purple Company Banner -->
    <div class="company-banner">
      <div class="banner-left">
        <div>رقم الفاتورة / Invoice No: <strong>${inv.number}</strong></div>
        <div>تاريخ الفاتورة / Date: <strong>${inv.date || "—"}</strong></div>
        <div>طريقة الدفع / Payment: <strong>${inv.paymentMethod === "cash" ? "نقدي" : "آجل"}</strong></div>
      </div>
      ${logoHtml}
      <div class="banner-right">
        <h2>${co.name}</h2>
        ${co.vatNumber ? `<div>الرقم الضريبي: <strong>${co.vatNumber}</strong></div>` : ""}
        ${co.crNumber ? `<div>السجل التجاري: <strong>${co.crNumber}</strong></div>` : ""}
      </div>
    </div>

    <!-- Seller Info Strip -->
    <div class="info-strip">
      <span><strong>بيانات البائع / Seller:</strong> ${co.name}</span>
      <span><strong>الرقم الضريبي:</strong> ${co.vatNumber || "—"}</span>
      <span><strong>السجل التجاري:</strong> ${co.crNumber || "—"}</span>
      <span><strong>العنوان:</strong> ${co.address || "المملكة العربية السعودية"}</span>
    </div>

    <!-- Client Info Strip -->
    <div class="info-strip">
      <span><strong>بيانات المشتري / Client:</strong> ${cust.name}</span>
      <span><strong>الرقم الضريبي:</strong> ${cust.vatNumber || "—"}</span>
      <span><strong>السجل التجاري:</strong> ${cust.crNumber || cust.nationalId || cust.cr || "—"}</span>
      <span><strong>العنوان:</strong> ${cust.address || "—"}</span>
    </div>

    <!-- Items Table -->
    <table class="invoice-table">
      <thead>
        <tr>
          <th style="width:36px;">م / SR</th>
          <th>الصنف والبيان / Description</th>
          <th style="width:55px;">الكمية / Qty</th>
          <th style="width:80px;">السعر / Price</th>
          <th style="width:85px;">الخاضع / Taxable</th>
          <th style="width:55px;">النسبة / Rate</th>
          <th style="width:80px;">الضريبة / VAT</th>
          <th style="width:90px;">الإجمالي / Total</th>
        </tr>
      </thead>
      <tbody>
        ${linesHtml}
      </tbody>
    </table>

    <!-- Totals Section -->
    <div class="totals-section">
      <!-- Left Side: QR Code + Notes -->
      <div class="left-footer-box">
        <div class="qr-wrapper">
          <div id="qrcode-container"></div>
        </div>
        <div class="notes-box">
          <h4>شروط وملاحظات / Notes</h4>
          <div class="notes-content">
            ${inv.notes || "شكراً لتعاملكم معنا."}
            ${inv.repName ? `<br><span style="font-weight:700; color:#5b3ec2;">المندوب: ${inv.repName}</span>` : ""}
            ${inv.warehouseName ? ` | <span>المستودع: ${inv.warehouseName}</span>` : ""}
          </div>
        </div>
      </div>

      <!-- Right Side: Totals -->
      <div class="totals-box">
        <div class="totals-row"><span>المجموع الخاضع للضريبة / Taxable Amount:</span><span class="val">${formatCurrency(inv.subtotal || 0)}</span></div>
        ${(inv.discountTotal || 0) > 0 ? `<div class="totals-row discount"><span>إجمالي الخصم / Discount:</span><span class="val">- ${formatCurrency(inv.discountTotal)}</span></div>` : ""}
        <div class="totals-row"><span>ضريبة القيمة المضافة / VAT (15%):</span><span class="val">${formatCurrency(inv.totalVat || 0)}</span></div>
        <div class="totals-row grand-total">
          <span>الإجمالي شامل الضريبة / Grand Total:</span>
          <span class="val">${formatCurrency(inv.totalWithVat || 0)} ر.س</span>
        </div>
        ${(inv.paymentMethod === "credit" || (cust.balance || 0) > 0) ? `
        <div class="totals-row" style="margin-top:2px; border-top:1px dashed #d1d5db; padding-top:2px; font-size:10px; color:#6b7280;">
          <span>الرصيد السابق للعميل:</span>
          <span class="val">${formatCurrency((cust.balance || 0) - (inv.remainingAmount || 0))} ر.س</span>
        </div>
        <div class="totals-row" style="font-weight:700; color:#5b3ec2; font-size:11.5px; padding-top:2px;">
          <span>إجمالي الرصيد المستحق:</span>
          <span class="val">${formatCurrency(cust.balance || 0)} ر.س</span>
        </div>
        ` : ""}
      </div>
    </div>

    <!-- Thank you footer -->
    <div class="thank-you">
      <div>
        شكراً لتعاملكم معنا — ${co.name}
        ${co.phone ? `| 📞 الهاتف: ${co.phone}` : ""}
        ${co.email ? `| ✉️ البريد: ${co.email}` : ""}
      </div>
      <div style="margin-top: 5px;">
        ${barcodeSvg}
      </div>
    </div>
  </div>

  <script src="js/utils/qrcode.min.js"><\/script>
  <script>
    const qrData = "${qrData.replace(/"/g, '\\"')}";
    if (qrData) {
      try {
        new QRCode(document.getElementById("qrcode-container"), {
          text: qrData,
          width: 80,
          height: 80,
          correctLevel: QRCode.CorrectLevel.M
        });
      } catch(e) {
        document.getElementById("qrcode-container").innerHTML = '<p style="font-size:9px;color:#9ca3af;">تعذر توليد QR</p>';
      }
    }
  </script>
</body>
</html>`);
  printWindow.document.close();
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

    window._editingInvoiceId = id;

    // Set form fields
    document.getElementById("inv-number").value = inv.number;
    document.getElementById("customer-search").value = inv.customerName || "";
    document.getElementById("customer-id").value = inv.customerId || "";
    document.getElementById("inv-date").value = inv.date || "";
    document.getElementById("inv-payment").value = inv.paymentMethod || "credit";
    document.getElementById("inv-paid-amount").value = inv.paidAmount || "";
    document.getElementById("inv-notes").value = inv.notes || "";
    document.getElementById("inv-type").value = inv.invoiceType || "B2C";

    // Set customer object in memory
    selectedCustomer = inv.customerId ? { id: inv.customerId, name: inv.customerName, type: inv.customerType || "retail" } : null;

    // Show donation badge if appropriate
    const donationBadge = document.getElementById("donation-badge");
    const isDonation = inv.customerId === "005" || (inv.customerName || "").includes("سلة البركة");
    if (isDonation) {
      if (donationBadge) {
        donationBadge.textContent = "🎁 عميل تبرعات (معفى من الضريبة وتكلفتها مصروف تبرعات)";
        donationBadge.classList.remove("hidden");
      }
      document.getElementById("credit-status-bar")?.classList.add("hidden");
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
    invoiceLines = (inv.lines || []).map(line => ({
      productId:   line.productId,
      productName: line.productName,
      qty:         line.qty         || 1,
      unit:        line.unit        || "PCS",
      unitCode:    line.unitCode    || "PCE",
      unitPrice:   line.unitPrice   || line.price || 0,
      discount:    line.discount    || 0,
      taxCategory: line.taxCategory || "S",
      sku:         line.sku         || "",
      costPrice:   line.costPrice   || 0,
      batchNumber: line.batchNumber || "",
      expiryDate:  line.expiryDate  || "",
      availableBatches: []
    }));

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
    if (inv.lines && inv.warehouseId && inv.status !== "cancelled") {
      const adjustments = inv.lines.map(line => ({
        warehouseId: inv.warehouseId,
        productId: line.productId,
        qtyDelta: line.qty,
        metadata: {
          type: "sale_reverse",
          refId: inv.number,
          documentNumber: inv.number,
          invoiceNumber: inv.number,
          notes: `حذف الفاتورة ${inv.number}`,
          batchNumber: line.batchNumber || "",
          expiryDate: line.expiryDate || "",
        }
      }));
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
  document.getElementById("credit-status-bar").classList.add("hidden");
  document.getElementById("donation-badge")?.classList.add("hidden");
  document.getElementById("inv-form-error").classList.add("hidden");

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


