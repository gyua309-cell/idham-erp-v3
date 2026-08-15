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

let purchaseLines = [];
let currentInvoice = null;
let purInvoicesCache = new Map();
let cachedSuppliers = null;
let cachedPurWarehouses = null;
let allProducts = [];
let allCategories = [];

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
        <option value="pending">معلقة</option>
        <option value="paid">مدفوعة</option>
        <option value="partial">جزئي</option>
        <option value="cancelled">ملغاة</option>
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
            <th>رقم الفاتورة</th><th>التاريخ</th><th>المورد</th>
            <th>المخزن</th><th>المجموع قبل VAT</th><th>VAT 15%</th>
            <th>الإجمالي</th><th>الحالة</th><th>قيد</th><th></th>
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

  <!-- ═══════════ NEW PURCHASE INVOICE MODAL ═══════════ -->
  <div class="modal-overlay" id="purchase-modal" onclick="if(event.target===this)closeModal('purchase-modal')">
    <div class="modal modal-xl">
      <div class="modal-header">
        <h3 class="modal-title" id="pur-modal-title">📦 فاتورة شراء جديدة</h3>
        <button class="modal-close" onclick="closeModal('purchase-modal')">×</button>
      </div>
      <div class="modal-body" style="padding:20px; overflow-y:auto; max-height:75vh;">

        <!-- Row 1: Basic Info -->
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group">
            <label class="form-label">رقم الفاتورة</label>
            <input type="text" id="pur-inv-number" class="form-control mono" readonly
              placeholder="يُولَّد تلقائياً" />
          </div>
          <div class="form-group">
            <label class="form-label">تاريخ الفاتورة <span class="text-bad">*</span></label>
            <input type="date" id="pur-inv-date" class="form-control" value="${todayString()}" />
          </div>
          <div class="form-group">
            <label class="form-label">رقم فاتورة المورد (مرجع)</label>
            <input type="text" id="pur-ref-num" class="form-control mono" placeholder="INV-SUPP-001" />
          </div>
        </div>

        <!-- Row 2: Supplier / Warehouse / Payment -->
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group">
            <label class="form-label">المورد <span class="text-bad">*</span></label>
            <div class="autocomplete-container">
              <input type="text" id="supplier-search" class="form-control"
                placeholder="ابحث باسم المورد…" autocomplete="off" />
              <div class="autocomplete-results hidden" id="supplier-results"></div>
              <input type="hidden" id="supplier-id" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">المخزن المستلِم <span class="text-bad">*</span></label>
            <select id="pur-warehouse" class="form-control">
              <option value="">اختر المخزن</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">طريقة الدفع</label>
            <select id="pur-payment" class="form-control">
              <option value="credit">آجل</option>
              <option value="cash">نقدي فوري</option>
              <option value="transfer">تحويل بنكي</option>
              <option value="check">شيك</option>
            </select>
          </div>
        </div>

        <!-- Row 3: Due Date / VAT Reg / Attachment -->
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group">
            <label class="form-label">تاريخ الاستحقاق</label>
            <input type="date" id="pur-due-date" class="form-control" />
          </div>
          <div class="form-group">
            <label class="form-label">رقم VAT للمورد</label>
            <input type="text" id="pur-supplier-vat" class="form-control mono"
              placeholder="300000000000003" />
          </div>
          <div class="form-group">
            <label class="form-label">مرفق الفاتورة الأصلية (صورة/PDF)</label>
            <input type="file" id="pur-attachment" class="form-control" accept="image/*,application/pdf" />
          </div>
        </div>

        <!-- Row 4: Notes -->
        <div class="grid-1 gap-16 mb-16">
          <div class="form-group">
            <label class="form-label">ملاحظات</label>
            <input type="text" id="pur-notes" class="form-control"
              placeholder="أي ملاحظة إضافية…" />
          </div>
        </div>

        <!-- Items Section -->
        <div style="background:var(--bg-2); border-radius:8px; padding:12px; margin-bottom:12px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; flex-wrap:wrap; gap:10px;">
            <strong style="font-size:13px; color:var(--brand);">📋 بنود الفاتورة</strong>
            <div style="display:flex; gap:8px; align-items:center;">
              <select id="pur-product-category-filter" class="form-control" style="width:160px; height:34px; font-size:12px; padding:4px 8px;">
                <option value="">كل الفئات</option>
              </select>
              <div class="autocomplete-container" style="width:480px;">
                <input type="text" id="pur-product-search" class="form-control"
                  placeholder="+ أضف صنفاً... (بالاسم أو الكود) [F8 للبحث المتقدم]" autocomplete="off"
                  style="height:34px; font-size:12px;" />
                <div class="autocomplete-results hidden" id="pur-product-results"></div>
              </div>
            </div>
          </div>
          <div class="invoice-lines" style="max-height:260px; overflow-y:auto; margin-top: 0;">
            <table style="width:100%; font-size:12px; border-collapse:collapse;">
              <thead>
                <tr style="background:var(--bg-3); position:sticky; top:0; z-index:1;">
                  <th style="padding:8px 10px; text-align:right;">#</th>
                  <th style="padding:8px 10px; text-align:right;">كود الصنف</th>
                  <th style="padding:8px 10px; text-align:right;">اسم الصنف</th>
                  <th style="padding:8px 10px; text-align:right;">الوحدة</th>
                  <th style="padding:8px 10px; text-align:right;">الكمية</th>
                  <th style="padding:8px 10px; text-align:right;">سعر الوحدة</th>
                  <th style="padding:8px 10px; text-align:right;">خصم%</th>
                  <th style="padding:8px 10px; text-align:right;">رقم التشغيلة</th>
                  <th style="padding:8px 10px; text-align:right;">تاريخ الانتهاء</th>
                  <th style="padding:8px 10px; text-align:right;">VAT</th>
                  <th style="padding:8px 10px; text-align:right; color:var(--brand);">الإجمالي</th>
                  <th style="padding:8px 6px;"></th>
                </tr>
              </thead>
              <tbody id="pur-lines-tbody"></tbody>
            </table>
          </div>
        </div>

        <!-- Totals -->
        <div style="display:flex; justify-content:flex-end; margin-top:12px;">
          <div style="width:320px; background:var(--bg-2); border-radius:8px; padding:16px;">
            <div class="invoice-total-row">
              <span>المجموع قبل الضريبة</span>
              <span class="mono" id="pur-subtotal">0.00 ر.س</span>
            </div>
            <div class="invoice-total-row">
              <span>إجمالي الخصومات</span>
              <span class="mono text-bad" id="pur-discount">- 0.00 ر.س</span>
            </div>
            <div class="invoice-total-row">
              <span>ضريبة القيمة المضافة (15%)</span>
              <span class="mono text-warn" id="pur-vat">0.00 ر.س</span>
            </div>
            <div class="invoice-total-row grand-total"
              style="border-top:2px solid var(--brand); margin-top:8px; padding-top:8px;">
              <span style="font-size:15px;">الإجمالي النهائي</span>
              <span class="mono" style="font-size:18px; color:var(--brand);" id="pur-grand">0.00 ر.س</span>
            </div>
          </div>
        </div>

        <div id="pur-form-error" class="alert bad hidden" style="margin-top:12px;"></div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal('purchase-modal')">إلغاء</button>
        <button class="btn btn-secondary" onclick="printPurchasePreview()">🖨️ معاينة</button>
        <button class="btn btn-warning" onclick="generatePurchaseOrder()" style="background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;">📋 أمر شراء / عرض سعر</button>
        <button class="btn btn-primary" onclick="savePurchase()" id="save-pur-btn">
          💾 حفظ وإنشاء قيد
        </button>
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
    const sups = await getAll(COLS.suppliers(), [orderBy("name")]);
    const filter = document.getElementById("pur-supplier-filter");
    if (filter) sups.forEach(s => filter.innerHTML += `<option value="${s.id}">${s.name}</option>`);
  } catch {}
}

async function loadWarehousesPurchase() {
  try {
    const whs = await getAll(COLS.warehouses(), [orderBy("name")]);
    const sel = document.getElementById("pur-warehouse");
    if (sel) whs.forEach(w =>
      sel.innerHTML += `<option value="${w.id}" data-name="${w.name}">${w.name}</option>`);

    const filter = document.getElementById("pur-warehouse-filter");
    if (filter) {
      filter.innerHTML = '<option value="">كل المستودعات</option>';
      whs.forEach(w => filter.innerHTML += `<option value="${w.id}">${w.name}</option>`);
    }
  } catch {}
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
    const constraints = [orderBy("createdAt", "desc"), limit(100)];
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

    // KPIs
    // 1. Total Purchases = Sum of all active purchase invoices in the selected period and supplier
    const activeInvs = invs.filter(i => i.status !== "cancelled");
    const totalAll  = activeInvs.reduce((s, i) => s + (i.totalWithVat || 0), 0);

    // 2. جلب مدفوعات الموردين من الـ Cache (المرة الأولى فقط تذهب لـ Firestore)
    const expenses = await getAll(collection(db, `companies/${COMPANY_ID}/expenses`), [where("entityType", "==", "supplier")]);

    let filteredExpenses = expenses;

    if (from || to) {
      filteredExpenses = filteredExpenses.filter(e => {
        const d = e.date || (e.createdAt?.toDate ? e.createdAt.toDate().toISOString().split("T")[0] : "");
        return (!from || d >= from) && (!to || d <= to);
      });
    }

    if (supF) {
      filteredExpenses = filteredExpenses.filter(e => e.targetId === supF);
    }

    const totalExpenses = filteredExpenses.reduce((s, e) => s + (e.amount || 0), 0);

    // ──────────────────────────────────────────────────────────────────────
    // المنطق: كل فواتير الشراء تُعامل كآجل (ذمم دائنة للمورد)
    // المدفوع = مجموع سندات الصرف فقط (expenses/payments)
    // المتبقي = إجمالي الفواتير - المدفوع من سندات الصرف
    // ──────────────────────────────────────────────────────────────────────
    const totalPaid   = totalExpenses;
    const totalUnpaid = Math.max(0, totalAll - totalPaid);

    document.getElementById("pur-kpi-total").textContent  = formatCurrency(totalAll);
    document.getElementById("pur-kpi-paid").textContent   = formatCurrency(totalPaid);
    document.getElementById("pur-kpi-unpaid").textContent = formatCurrency(totalUnpaid);
    document.getElementById("pur-kpi-count").textContent  = invs.length;
    document.getElementById("pur-count").textContent      = `${invs.length} فاتورة`;

    if (invs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--text-2);">
        لا توجد فواتير في الفترة المحددة</td></tr>`;
      return;
    }

    tbody.innerHTML = invs.map(inv => `
      <tr style="cursor:pointer;" onclick="viewPurchaseInvoice('${inv.id}')">
        <td class="mono text-indigo">${inv.number || inv.id.slice(0,8)}</td>
        <td class="dim">${formatDate(inv.createdAt || inv.date)}</td>
        <td class="font-semibold">${inv.supplierName || "—"}</td>
        <td class="dim" style="font-size:11px;">${inv.warehouseName || "—"}</td>
        <td class="mono">${formatCurrency(inv.subtotal || 0)}</td>
        <td class="mono text-warn">${formatCurrency(inv.totalVat || 0)}</td>
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
      </tr>`).join("");

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
        onclick="addPurLine('${p.id}','${(p.name||"").replace(/'/g,"\\'")}',${p.costPrice||0},'${p.unit||"PCS"}','${p.sku||""}','${p.taxCategory||"S"}')">
        <div class="flex justify-between">
          <span>${p.name}</span>
          <span class="mono text-indigo">${formatCurrency(p.costPrice||0)}</span>
        </div>
        <div class="item-code">${p.sku||""} | الوحدة: ${p.unit||""}</div>
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
window.addPurLine = (pid, pname, unitPrice, unit, sku, taxCategory) => {
  document.getElementById("pur-product-search").value = "";
  document.getElementById("pur-product-results").classList.add("hidden");
  purchaseLines.push({
    productId: pid, productName: pname, sku, unit,
    taxCategory: taxCategory || "S",
    qty: 1, unitPrice, discount: 0,
    batchNumber: "", expiryDate: "",
  });
  renderPurLines();
  updatePurTotals();
};

function renderPurLines() {
  const tbody = document.getElementById("pur-lines-tbody");
  if (!tbody) return;
  if (!purchaseLines.length) {
    tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;padding:20px;color:var(--text-2);">
      لم يتم إضافة أصناف — ابحث وأضف أصناف أعلاه</td></tr>`;
    return;
  }
  tbody.innerHTML = purchaseLines.map((l, i) => {
    const lineTotal = calcLineTotal(l.qty, l.unitPrice, l.discount);
    const vatAmt    = l.taxCategory === "S" ? lineTotal * 0.15 : 0;
    return `
    <tr style="border-bottom:1px solid var(--border-soft);">
      <td style="padding:5px 8px; color:var(--text-2);">${i+1}</td>
      <td style="padding:5px 8px;" class="mono" style="font-size:11px;">${l.sku||"—"}</td>
      <td style="padding:5px 8px; font-weight:600;">${l.productName}</td>
      <td style="padding:5px 8px; color:var(--text-2);">${l.unit}</td>
      <td style="padding:5px 8px; width:80px;">
        <input type="number" class="form-control mono"
          style="width:70px;height:28px;font-size:11px;padding:2px 6px;"
          value="${l.qty}" min="0.001" step="0.001"
          onchange="updatePurLine(${i},'qty',this.value)" />
      </td>
      <td style="padding:5px 8px; width:110px;">
        <input type="number" class="form-control mono"
          style="width:100px;height:28px;font-size:11px;padding:2px 6px;"
          value="${l.unitPrice}" min="0" step="0.01"
          onchange="updatePurLine(${i},'unitPrice',this.value)" />
      </td>
      <td style="padding:5px 8px; width:65px;">
        <input type="number" class="form-control mono"
          style="width:55px;height:28px;font-size:11px;padding:2px 6px;"
          value="${l.discount}" min="0" max="100"
          onchange="updatePurLine(${i},'discount',this.value)" />
      </td>
      <td style="padding:5px 8px; width:100px;">
        <input type="text" class="form-control mono"
          style="width:90px;height:28px;font-size:11px;padding:2px 6px;"
          value="${l.batchNumber || ""}" placeholder="التشغيلة"
          onchange="updatePurLine(${i},'batchNumber',this.value)" />
      </td>
      <td style="padding:5px 8px; width:130px;">
        <input type="date" class="form-control mono"
          style="width:120px;height:28px;font-size:11px;padding:2px 6px;"
          value="${l.expiryDate || ""}"
          onchange="updatePurLine(${i},'expiryDate',this.value)" />
      </td>
      <td style="padding:5px 8px;">
        ${l.taxCategory === "S"
          ? '<span class="badge warn" style="font-size:10px;">15%</span>'
          : '<span class="badge good" style="font-size:10px;">معفى</span>'}
      </td>
      <td style="padding:5px 8px;" class="mono font-bold text-indigo">
        ${formatCurrency(lineTotal + vatAmt)}
      </td>
      <td style="padding:5px 4px;">
        <button class="btn btn-icon sm btn-ghost" onclick="removePurLine(${i})"
          style="color:var(--bad); font-size:16px; padding:2px 6px;">✕</button>
      </td>
    </tr>`;
  }).join("");
}

window.updatePurLine = (i, f, v) => {
  if (f === 'batchNumber' || f === 'expiryDate') {
    purchaseLines[i][f] = v;
  } else {
    purchaseLines[i][f] = parseFloat(v) || 0;
  }
  renderPurLines();
  updatePurTotals();
};
window.removePurLine = (i) => {
  purchaseLines.splice(i, 1);
  renderPurLines();
  updatePurTotals();
};

function updatePurTotals() {
  const totals = calcInvoiceTotals(purchaseLines);
  const fmt = (n) => `${formatCurrency(n)}`;
  const el = id => document.getElementById(id);
  if (!el("pur-subtotal")) return;
  el("pur-subtotal").textContent = fmt(totals.subtotal + totals.discountTotal);
  el("pur-discount").textContent = `- ${fmt(totals.discountTotal)}`;
  el("pur-vat").textContent      = fmt(totals.vatTotal);
  el("pur-grand").textContent    = fmt(totals.grandTotal);
}

// ────────────────────────────────────────────────
// OPEN / SAVE MODAL
// ────────────────────────────────────────────────
window.openPurchaseModal = async () => {
  purchaseLines = [];
  window._editingPurchaseId = null;
  const btn = document.getElementById("save-pur-btn");
  if (btn) btn.textContent = "💾 حفظ وإنشاء قيد";

  renderPurLines();
  updatePurTotals();
  ["supplier-search","pur-ref-num","pur-notes","pur-supplier-vat"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById("supplier-id").value = "";
  document.getElementById("pur-inv-date").value = todayString();
  document.getElementById("pur-form-error").classList.add("hidden");
  document.getElementById("pur-modal-title").textContent = "📦 فاتورة شراء جديدة";
  document.getElementById("pur-inv-number").value = "جارِ التوليد...";

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

    const totals = calcInvoiceTotals(purchaseLines);
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

    const data = {
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
      subtotal:       totals.subtotal,
      discountTotal:  totals.discountTotal,
      totalVat:       totals.vatTotal,
      totalWithVat:   totals.grandTotal,
      paymentMethod:  payment,
      status:         payment === "cash" ? "paid" : "posted",
      notes,
      attachmentUrl,
    };

    // 1. Save/Update invoice
    let invId = window._editingPurchaseId;
    let oldSupplierId = null;
    if (invId) {
      const oldInv = await getById("purchaseInvoices", invId);
      if (oldInv) {
        oldSupplierId = oldInv.supplierId;
        // Revert old stock movements (purchases increase stock, so reversal decreases stock: -qty)
        for (const line of oldInv.lines || []) {
          if (!line.productId || !line.qty) continue;
          try {
            await adjustStock(oldInv.warehouseId, line.productId, -line.qty, {
              type: "purchase_reverse_edit",
              refId: oldInv.number,
              documentNumber: oldInv.number,
              invoiceNumber: oldInv.number,
              notes: `تعديل فاتورة الشراء ${oldInv.number} (عكس الكمية القديمة)`
            });
          } catch (e) {
            console.warn("Stock reversal failed on edit:", line.productId, e.message);
          }
        }
        // Clean up old transactions and payments
        await cleanupPurchaseAssociatedTransactions(oldInv);

        // Delete ALL linked journal entries (main + COGS) before recreating
        const oldPurchKey = oldInv.invoiceNumber || oldInv.number || invId;
        for (const sType of ["purchaseInvoice", "purchase", "purchaseCOGS"]) {
          try {
            const jeSnap = await getDocs(
              query(collection(db, `companies/${COMPANY_ID}/journalEntries`),
                where("sourceType", "==", sType),
                where("sourceId",   "==", oldPurchKey))
            );
            for (const jeDoc of jeSnap.docs) {
              await deleteJournalEntry(jeDoc.id);
              console.log(`[purchaseEdit] Deleted JE ${jeDoc.id} (${sType}) for ${oldPurchKey}`);
            }
          } catch (jeErr) {
            console.warn(`[purchaseEdit] JE cleanup (${sType}) skipped:`, jeErr.message);
          }
        }
        if (oldInv.journalEntryId) {
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

    // 2. Adjust stock for each line
    let stockOk = 0;
    let stockFail = 0;
    for (const line of purchaseLines) {
      if (!line.productId || !line.qty) {
        console.warn("[adjustStock] Skipping line — missing productId or qty:", line);
        continue;
      }
      try {
        await adjustStock(warehouseId, line.productId, +line.qty, {
          type:          "purchase_in",
          sourceType:    "purchaseInvoice",
          sourceId:      invId,
          documentNumber: invNum,
          invoiceNumber: invNum,
          purchasePrice: line.unitPrice,
          batchNumber:   line.batchNumber || "",
          expiryDate:    line.expiryDate  || "",
          sku:           line.sku         || "",
          productName:   line.productName || "",
        });
        stockOk++;
        console.log(`[adjustStock] ✅ ${line.productName} +${line.qty} in ${warehouseId}`);
      } catch (stockErr) {
        stockFail++;
        console.error(`[adjustStock] ❌ Failed for ${line.productName} (${line.productId}):`, stockErr.message);
        // Continue with other lines
      }
    }
    if (stockFail > 0) {
      window.showToast?.(`⚠️ تحديث المخزون: ${stockOk} صنف نجح، ${stockFail} فشل`, "warn");
    }

    // ─── Automated Accounting Engine (Purchase) ───
    try {
      const warehouses = await getAll(COLS.warehouses());
      const jeId = await autoPurchaseJE({
        id:            invId,
        invoiceNumber: invNum,
        date:          invDate,
        supplierId:    supplierId,    // ← مطلوب لتحديد الحساب الفرعي للمورد
        supplierName:  supplierName,
        paymentMethod: payment,
        subtotal:      totals.subtotal,
        taxAmount:     totals.vatTotal,
        total:         totals.grandTotal,
        warehouseId,
      }, window._purchaseUser || {}, warehouses);
      await update("purchaseInvoices", invId, { journalEntryId: jeId });
    } catch(jeErr) {
      // سجّل الخطأ في Firestore ليتمكن الـ Backfill من اكتشافه وإصلاحه تلقائياً
      console.error("[AccountingEngine] Purchase JE failed:", jeErr.message);
      try { await update("purchaseInvoices", invId, { journalEntryError: jeErr.message, journalEntryId: null }); } catch(_){}
      window.showToast?.("⚠️ تم حفظ فاتورة الشراء لكن القيد المحاسبي فشل — " + jeErr.message, "warn");
    }

    // ─── Auto Cash Box: خصم من الصندوق إذا كان الدفع نقداً ───
    if (payment === "cash" || payment === "نقدي") {
      try {
        await autoCashTransaction({
          type:       "out",
          amount:     totals.grandTotal,
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
          amount:     totals.grandTotal,
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
    const unpaidAmount = totals.grandTotal - (payment === "cash" ? totals.grandTotal : 0);
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

    // Set lines
    purchaseLines = (inv.lines || []).map(line => ({
      productId:   line.productId,
      productName: line.productName,
      sku:         line.sku         || "",
      unit:        line.unit        || "PCS",
      qty:         line.qty         || 0,
      unitPrice:   line.unitPrice   || 0,
      discount:    line.discount    || 0,
      taxCategory: line.taxCategory || "S",
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
    title.textContent = `فاتورة شراء: ${inv.number || id}`;

    // Hide pay button if paid/cancelled
    const payBtn = document.getElementById("pur-pay-btn");
    const cancelBtn = document.getElementById("pur-cancel-btn");
    if (payBtn) payBtn.style.display = (inv.status === "paid" || inv.status === "cancelled") ? "none" : "";
    if (cancelBtn) cancelBtn.style.display = inv.status === "cancelled" ? "none" : "";

    const lines = (inv.lines || []).map((l, i) => {
      const tot = calcLineTotal(l.qty, l.unitPrice, l.discount);
      const vat = l.taxCategory === "S" ? tot * 0.15 : 0;
      return `<tr>
        <td style="padding:7px 12px;">${i+1}</td>
        <td style="padding:7px 12px;" class="mono">${l.sku||"—"}</td>
        <td style="padding:7px 12px; font-weight:600;">${l.productName}</td>
        <td style="padding:7px 12px;">${l.unit||"—"}</td>
        <td style="padding:7px 12px;" class="mono">${l.qty}</td>
        <td style="padding:7px 12px;" class="mono">${formatCurrency(l.unitPrice)}</td>
        <td style="padding:7px 12px;" class="mono">${l.discount||0}%</td>
        <td style="padding:7px 12px;" class="mono text-warn">${formatCurrency(vat)}</td>
        <td style="padding:7px 12px;" class="mono font-bold">${formatCurrency(tot + vat)}</td>
      </tr>`;
    }).join("");

    body.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
        <div>
          <div class="grid-2 gap-12">
            <div><div class="section-label mb-6">رقم الفاتورة</div><div class="mono text-indigo font-bold text-xl">${inv.number}</div></div>
            <div><div class="section-label mb-6">الحالة</div>${getInvoiceStatusBadge(inv.status)}</div>
            <div><div class="section-label mb-6">المورد</div><div class="font-semibold">${inv.supplierName}</div></div>
            <div><div class="section-label mb-6">المخزن</div><div>${inv.warehouseName||"—"}</div></div>
            <div><div class="section-label mb-6">التاريخ</div><div>${formatDate(inv.createdAt||inv.date)}</div></div>
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
            <div class="invoice-total-row"><span>VAT 15%</span><span class="mono text-warn">${formatCurrency(inv.totalVat||0)}</span></div>
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
  const docTitle = isPO ? "أمر شراء / طلب عرض سعر" : "فاتورة شراء";
  const docIcon = isPO ? "📋" : "📦";
  const docLabel = isPO ? "Purchase Order / RFQ" : "Purchase Invoice";

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
    .doc-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 15px; border-bottom: 3px solid #5B5CEB; margin-bottom: 20px; }
    .co-logo { max-height: 60px; max-width: 150px; object-fit: contain; background:#fff; padding:4px; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,0.1); }
    .company-info h1 { font-size: 18px; color: #1a1a2e; margin-bottom: 4px; }
    .company-info p { font-size: 10px; color: #555; line-height: 1.6; }
    .doc-badge { background: #5B5CEB !important; color: #fff !important; padding: 8px 20px; border-radius: 8px; font-size: 14px; font-weight: 700; text-align: center; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .doc-badge small { display: block; font-size: 9px; font-weight: 400; opacity: 0.8; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .info-box { background: #f8f9fc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; }
    .info-box h3 { font-size: 11px; color: #5B5CEB; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
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
    .total-row.grand { border-top: 2px solid #5B5CEB; padding-top: 8px; margin-top: 8px; font-size: 14px; font-weight: 700; color: #5B5CEB; }
    .footer { clear: both; margin-top: 40px; padding-top: 15px; border-top: 1px solid #ddd; }
    .signatures { display: flex; justify-content: space-between; margin-top: 30px; }
    .sig-box { text-align: center; width: 150px; }
    .sig-line { border-top: 1px solid #999; margin-top: 40px; padding-top: 4px; font-size: 9px; color: #666; }
    ${isPO ? '.po-note { background: #FFF7ED; border: 1px solid #FDBA74; border-radius: 6px; padding: 10px; font-size: 10px; color: #92400E; margin-bottom: 15px; }' : ''}
    .terms { font-size: 9px; color: #666; margin-top: 15px; }
    .terms li { margin-bottom: 3px; }

    @media print {
      body { background:#fff; }
      .doc-badge { background: #5B5CEB !important; color: #fff !important; }
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
    <div class="total-row"><span>ضريبة القيمة المضافة 15%</span><span class="mono">${totalVat.toFixed(2)} ر.س</span></div>
    <div class="total-row grand"><span>الإجمالي</span><span class="mono">${grandTotal.toFixed(2)} ر.س</span></div>
  </div>

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
