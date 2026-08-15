// ============================================================
// IDHAM ERP — Supplier RFQs / Purchase Requests Module (طلب أسعار من مورد)
// ============================================================
import { COLS, create, update, remove, getAll, query, orderBy, limit, getDocs, where, generateInvoiceNumber } from "../utils/db.js";
import { formatCurrency, todayString } from "../utils/formatters.js";
import { db, COMPANY_ID } from "../firebase-config.js";

let allProducts = [];
let allSuppliers = [];
let allCategories = [];
let rfqCache = new Map();
let currentRfq = null;
let currentRfqLines = [];

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar no-print" style="flex-wrap: wrap; gap: 8px; align-items: flex-end;">
      <div class="date-range-group">
        <label>بحث</label>
        <input type="text" id="rfq-search" class="form-control" placeholder="رقم الطلب أو المورد..." style="width:160px; height:34px; font-size:12.5px;" />
      </div>
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="rfq-from" class="form-control" style="width:130px; height:34px; font-size:12.5px;" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="rfq-to" class="form-control" style="width:130px; height:34px; font-size:12.5px;" />
      </div>
      <div class="date-range-group">
        <label>المورد</label>
        <select id="rfq-supplier-filter" class="form-control" style="width:160px; height:34px; font-size:12.5px;">
          <option value="">كل الموردين</option>
        </select>
      </div>
      <div class="date-range-group">
        <label>الحالة</label>
        <select id="rfq-status-filter" class="form-control" style="width:120px; height:34px; font-size:12.5px;">
          <option value="">كل الحالات</option>
          <option value="draft">مسودة</option>
          <option value="sent">تم الإرسال</option>
          <option value="completed">مكتمل (مُسعّر)</option>
        </select>
      </div>
      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="exportRFQsListPDF()">PDF تصدير القائمة 📄</button>
        <button class="btn btn-primary" onclick="openNewRfqModal()">+ طلب أسعار جديد</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header no-print">
        <h1 class="page-title">طلبات أسعار الموردين (RFQ)</h1>
        <p class="page-subtitle">إنشاء طلبات تسعير للموردين ومقارنة العروض المستلمة بأسعار التكلفة الحالية</p>
      </div>

      <!-- Stat Cards -->
      <div class="grid-4 gap-16 mb-24 no-print">
        <div class="kpi-card purchases">
          <div class="kpi-header-row">
            <div class="kpi-icon-glass">📋</div>
          </div>
          <div>
            <div class="kpi-label" style="margin-bottom:4px; font-size:14px; color:var(--text-2);">إجمالي الطلبات</div>
            <div class="kpi-value mono" id="rfq-stat-total" style="color:var(--text-0);">0</div>
            <div class="kpi-sub" style="font-size:11px; color:var(--text-dim);">طلبات مسجلة بالنظام</div>
          </div>
        </div>
        <div class="kpi-card invoices">
          <div class="kpi-header-row">
            <div class="kpi-icon-glass">⏳</div>
          </div>
          <div>
            <div class="kpi-label" style="margin-bottom:4px; font-size:14px; color:var(--text-2);">طلبات معلقة</div>
            <div class="kpi-value mono" id="rfq-stat-pending" style="color:var(--text-0);">0</div>
            <div class="kpi-sub" style="font-size:11px; color:var(--text-dim);">بانتظار أسعار الموردين</div>
          </div>
        </div>
        <div class="kpi-card receipts">
          <div class="kpi-header-row">
            <div class="kpi-icon-glass">✅</div>
          </div>
          <div>
            <div class="kpi-label" style="margin-bottom:4px; font-size:14px; color:var(--text-2);">عروض مسعّرة</div>
            <div class="kpi-value mono" id="rfq-stat-completed" style="color:var(--text-0);">0</div>
            <div class="kpi-sub" style="font-size:11px; color:var(--text-dim);">تم إدخال أسعارها بنجاح</div>
          </div>
        </div>
        <div class="kpi-card sales">
          <div class="kpi-header-row">
            <div class="kpi-icon-glass">📈</div>
          </div>
          <div>
            <div class="kpi-label" style="margin-bottom:4px; font-size:14px; color:var(--text-2);">متوسط التوفير</div>
            <div class="kpi-value mono" id="rfq-stat-savings" style="color:var(--text-0);">0.00 ر.س</div>
            <div class="kpi-sub" style="font-size:11px; color:var(--text-dim);">مقارنةً بأسعار التكلفة الحالية</div>
          </div>
        </div>
      </div>

      <!-- Main RFQ List Table -->
      <div class="card no-print">
        <div class="table-container">
          <table class="data-dense" id="rfqs-main-table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>التاريخ</th>
                <th>المورد المستهدف</th>
                <th>عدد الأصناف</th>
                <th>الحالة</th>
                <th>تاريخ الاستجابة المتوقع</th>
                <th style="text-align:left;">العمليات</th>
              </tr>
            </thead>
            <tbody id="rfq-tbody">
              <tr class="skeleton-row">
                <td colspan="7"><div class="sk" style="height:12px; margin:4px 0;"></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Print Container (Hidden by default, shown in print mode) -->
      <div id="rfq-print-area" class="print-only"></div>
    </div>

    <!-- ═══════════ MODAL 1: NEW/EDIT RFQ ═══════════ -->
    <div class="modal-overlay no-print" id="rfq-modal" onclick="if(event.target===this)closeRfqModal()">
      <div class="modal modal-xl">
        <div class="modal-header">
          <h3 class="modal-title" id="rfq-modal-title">📨 طلب عروض أسعار جديد</h3>
          <button class="modal-close" onclick="closeRfqModal()">×</button>
        </div>
        <div class="modal-body" style="padding:20px; overflow-y:auto; max-height:75vh;">
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group">
              <label class="form-label">رقم الطلب</label>
              <input type="text" id="rfq-number" class="form-control mono" readonly placeholder="يُولَّد تلقائياً" />
            </div>
            <div class="form-group">
              <label class="form-label">التاريخ <span class="text-bad">*</span></label>
              <input type="date" id="rfq-date" class="form-control" value="${todayString()}" />
            </div>
            <div class="form-group">
              <label class="form-label">تاريخ الاستجابة المتوقع</label>
              <input type="date" id="rfq-target-date" class="form-control" />
            </div>
          </div>

          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label class="form-label">المورد المستهدف <span class="text-bad">*</span></label>
              <div class="autocomplete-container">
                <input type="text" id="rfq-supplier-search" class="form-control" placeholder="ابحث باسم المورد…" autocomplete="off" />
                <div class="autocomplete-results hidden" id="rfq-supplier-results"></div>
                <input type="hidden" id="rfq-supplier-id" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">ملاحظات موجهة للمورد</label>
              <input type="text" id="rfq-notes" class="form-control" placeholder="مثال: يرجى تقديم السعر شامل التوصيل لمخازننا..." />
            </div>
          </div>

          <!-- Items Table inside RFQ -->
          <div style="background:var(--bg-2); border-radius:8px; padding:12px; margin-bottom:12px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; flex-wrap:wrap; gap:10px;">
              <strong style="font-size:13px; color:var(--brand);">📋 بنود الطلب</strong>
              <div style="display:flex; gap:8px; align-items:center;">
                <select id="rfq-product-category-filter" class="form-control" style="width:160px; height:34px; font-size:12px; padding:4px 8px;">
                  <option value="">كل الفئات</option>
                </select>
                <div class="autocomplete-container" style="width:480px;">
                  <input type="text" id="rfq-product-search" class="form-control" placeholder="+ أضف صنفاً… (بالاسم أو الكود)" autocomplete="off" style="height:34px; font-size:12px;" />
                  <div class="autocomplete-results hidden" id="rfq-product-results"></div>
                </div>
              </div>
            </div>
            <div class="invoice-lines" style="max-height:260px; overflow-y:auto; margin-top:0;">
              <table style="width:100%; font-size:12px; border-collapse:collapse;">
                <thead>
                  <tr style="background:var(--bg-3); position:sticky; top:0; z-index:1;">
                    <th style="padding:8px 10px; text-align:right; width:30px;">#</th>
                    <th style="padding:8px 10px; text-align:right; width:100px;">كود الصنف</th>
                    <th style="padding:8px 10px; text-align:right;">اسم الصنف</th>
                    <th style="padding:8px 10px; text-align:right; width:90px;">الوحدة</th>
                    <th style="padding:8px 10px; text-align:right; width:90px;">الكمية المطلوبة</th>
                    <th style="padding:8px 10px; text-align:right; width:90px;">العدد (كرتون)</th>
                    <th style="padding:8px 10px; text-align:right;">ملاحظات البند</th>
                    <th style="padding:8px 6px; width:30px;"></th>
                  </tr>
                </thead>
                <tbody id="rfq-lines-tbody"></tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeRfqModal()">إلغاء</button>
          <button class="btn btn-primary" onclick="saveRfq()" id="rfq-save-btn">حفظ الطلب</button>
        </div>
      </div>
    </div>

    <!-- ═══════════ MODAL 2: ENTER SUPPLIER PRICES ═══════════ -->
    <div class="modal-overlay no-print" id="rfq-prices-modal" onclick="if(event.target===this)closeModal('rfq-prices-modal')">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">💵 إدخال أسعار المورد لعرض السعر</h3>
          <button class="modal-close" onclick="closeModal('rfq-prices-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px; overflow-y:auto; max-height:70vh;">
          <div class="mb-16" style="background:var(--bg-2); padding:12px; border-radius:6px; font-size:12.5px;">
            <p><strong>المورد:</strong> <span id="rfq-p-supplier-name"></span></p>
            <p><strong>رقم الطلب:</strong> <span id="rfq-p-number" class="mono"></span></p>
          </div>
          <div class="invoice-lines" style="margin-top:0;">
            <table style="width:100%; font-size:12.5px; border-collapse:collapse;">
              <thead>
                <tr style="background:var(--bg-3);">
                  <th style="padding:8px 10px;">#</th>
                  <th style="padding:8px 10px;">اسم الصنف</th>
                  <th style="padding:8px 10px; width:80px;">الوحدة</th>
                  <th style="padding:8px 10px; width:80px;">الكمية</th>
                  <th style="padding:8px 10px; width:130px; color:var(--brand);">السعر المقترح للمفرد</th>
                  <th style="padding:8px 10px;">ملاحظة التوريد</th>
                </tr>
              </thead>
              <tbody id="rfq-prices-tbody"></tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('rfq-prices-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveRfqPrices()" id="rfq-prices-save-btn">حفظ وتأكيد الأسعار</button>
        </div>
      </div>
    </div>

    <!-- ═══════════ MODAL 3: PRICE COMPARISON VIEW ═══════════ -->
    <div class="modal-overlay no-print" id="rfq-compare-modal" onclick="if(event.target===this)closeModal('rfq-compare-modal')">
      <div class="modal modal-xl">
        <div class="modal-header">
          <h3 class="modal-title">📊 تحليل ومقارنة أسعار عرض المورد</h3>
          <button class="modal-close" onclick="closeModal('rfq-compare-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px; overflow-y:auto; max-height:75vh;">
          <div class="mb-16 grid-3 gap-12" style="background:var(--bg-2); padding:16px; border-radius:6px; font-size:13px; line-height:1.6;">
            <div>
              <p><strong>المورد:</strong> <span id="rfq-comp-supplier"></span></p>
              <p><strong>رقم الطلب:</strong> <span id="rfq-comp-number" class="mono"></span></p>
            </div>
            <div>
              <p><strong>تاريخ الطلب:</strong> <span id="rfq-comp-date"></span></p>
              <p><strong>إجمالي التوفير في هذا العرض:</strong> <span id="rfq-comp-totalsavings" class="mono font-bold text-good">0.00 ر.س</span></p>
            </div>
            <div style="display:flex; justify-content:flex-end; align-items:center; gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="exportComparisonCSV()">CSV 📊</button>
              <button class="btn btn-primary btn-sm" onclick="printRfqComparison()">طباعة المقارنة 🖨️</button>
            </div>
          </div>
          <div class="invoice-lines" style="margin-top:0;">
            <table id="rfq-compare-table" style="width:100%; font-size:12px; border-collapse:collapse;">
              <thead>
                <tr style="background:var(--bg-3);">
                  <th style="padding:8px 8px; text-align:right;">#</th>
                  <th style="padding:8px 8px; text-align:right;">اسم الصنف</th>
                  <th style="padding:8px 8px; text-align:center;">الكمية</th>
                  <th style="padding:8px 8px; text-align:left; color:var(--brand);">السعر المعروض من المورد</th>
                  <th style="padding:8px 8px; text-align:left;">سعر التكلفة الحالية عندنا</th>
                  <th style="padding:8px 8px; text-align:left;">الفرق المالي والمئوي</th>
                  <th style="padding:8px 8px; text-align:left;">سعر البيع الحالي (تجزئة)</th>
                  <th style="padding:8px 8px; text-align:center;">هامش ربح العرض</th>
                  <th style="padding:8px 8px; text-align:center;">هامش الربح الحالي</th>
                </tr>
              </thead>
              <tbody id="rfq-compare-tbody"></tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('rfq-compare-modal')">إغلاق</button>
        </div>
      </div>
    </div>
  `;

  // Init listeners
  document.getElementById("rfq-search").addEventListener("input", filterRfqs);
  document.getElementById("rfq-status-filter").addEventListener("change", filterRfqs);
  document.getElementById("rfq-from")?.addEventListener("change", filterRfqs);
  document.getElementById("rfq-to")?.addEventListener("change", filterRfqs);
  document.getElementById("rfq-supplier-filter")?.addEventListener("change", filterRfqs);

  // Autocomplete bindings
  setupSupplierSearchAC();
  setupProductSearchAC();

  // Load basic data
  await Promise.all([
    loadRFQs(),
    loadSuppliers(),
    loadProducts()
  ]);
}

// ────────────────────────────────────────────────
// LOAD & FETCH DATA
// ────────────────────────────────────────────────
async function loadRFQs() {
  try {
    const list = await getAll(COLS.purchaseRequests(), [orderBy("createdAt", "desc")]);
    rfqCache.clear();
    list.forEach(r => rfqCache.set(r.id, r));
    renderRfqList(list);
    updateStats(list);
  } catch (err) {
    console.error("Error loading RFQs:", err);
  }
}

async function loadSuppliers() {
  try {
    allSuppliers = await getAll(COLS.suppliers(), [orderBy("name")]);
    const filter = document.getElementById("rfq-supplier-filter");
    if (filter) {
      filter.innerHTML = '<option value="">كل الموردين</option>' +
        allSuppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
    }
  } catch {}
}

async function loadProducts() {
  try {
    const [pSnap, cSnap] = await Promise.all([
      getAll(COLS.products(), [orderBy("name")]),
      getAll(COLS.categories(), [orderBy("name")])
    ]);
    allProducts = pSnap;
    allCategories = cSnap;

    const catSel = document.getElementById("rfq-product-category-filter");
    if (catSel) {
      catSel.innerHTML = '<option value="">كل الفئات</option>' +
        allCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    }
  } catch (err) {
    console.error("loadProducts error:", err);
  }
}

// ────────────────────────────────────────────────
// RENDER MAIN LIST
// ────────────────────────────────────────────────
function renderRfqList(list) {
  const tbody = document.getElementById("rfq-tbody");
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-3);">لا توجد طلبات أسعار مسجلة حالياً</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(r => {
    let badgeClass = "gray";
    let badgeText = "مسودة";
    if (r.status === "sent") { badgeClass = "blue"; badgeText = "تم الإرسال"; }
    else if (r.status === "completed") { badgeClass = "good"; badgeText = "مكتمل (مُسعّر)"; }

    return `
      <tr>
        <td class="mono font-bold">${r.number || "—"}</td>
        <td>${r.date || "—"}</td>
        <td><strong>${r.supplierName || "—"}</strong></td>
        <td>${r.lines ? r.lines.length : 0} أصناف</td>
        <td><span class="badge ${badgeClass}">${badgeText}</span></td>
        <td>${r.targetDate || "—"}</td>
        <td style="text-align:left;">
          <div style="display:flex; gap:6px; justify-content:flex-end;">
            <button class="btn btn-secondary btn-sm" onclick="printRfqForSupplier('${r.id}')">طباعة للطلب 🖨️</button>
            <button class="btn btn-secondary btn-sm" onclick="openEnterPricesModal('${r.id}')">💵 إدخال الأسعار</button>
            ${r.status === "completed" ? `<button class="btn btn-secondary btn-sm" onclick="openCompareModal('${r.id}')">📊 المقارنة والربح</button>` : ""}
            <button class="btn btn-secondary btn-sm" onclick="openEditRfqModal('${r.id}')">تعديل ✏️</button>
            <button class="btn btn-ghost btn-sm text-bad" onclick="deleteRfq('${r.id}')">حذف 🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function updateStats(list) {
  const total = list.length;
  const pending = list.filter(r => r.status !== "completed").length;
  const completed = list.filter(r => r.status === "completed").length;

  document.getElementById("rfq-stat-total").textContent = total;
  document.getElementById("rfq-stat-pending").textContent = pending;
  document.getElementById("rfq-stat-completed").textContent = completed;

  // Calculate total savings in all completed RFQs
  let totalSavings = 0;
  list.filter(r => r.status === "completed").forEach(r => {
    r.lines.forEach(l => {
      const offeredPrice = parseFloat(l.offeredPrice || 0);
      const originalProd = allProducts.find(p => p.id === l.productId);
      const cost = parseFloat(originalProd?.costPrice || 0);
      if (offeredPrice > 0 && cost > 0) {
        // Savings per unit * qty
        totalSavings += (cost - offeredPrice) * parseFloat(l.qty || 0);
      }
    });
  });
  document.getElementById("rfq-stat-savings").textContent = formatCurrency(totalSavings);
}

function filterRfqs() {
  const search = document.getElementById("rfq-search").value.trim().toLowerCase();
  const status = document.getElementById("rfq-status-filter").value;
  const from = document.getElementById("rfq-from")?.value || "";
  const to = document.getElementById("rfq-to")?.value || "";
  const supId = document.getElementById("rfq-supplier-filter")?.value || "";

  let filtered = Array.from(rfqCache.values());
  if (status) filtered = filtered.filter(r => r.status === status);
  if (search) {
    filtered = filtered.filter(r => 
      (r.number||"").toLowerCase().includes(search) || 
      (r.supplierName||"").toLowerCase().includes(search)
    );
  }
  if (from) {
    filtered = filtered.filter(r => r.date >= from);
  }
  if (to) {
    filtered = filtered.filter(r => r.date <= to);
  }
  if (supId) {
    filtered = filtered.filter(r => r.supplierId === supId);
  }
  renderRfqList(filtered);
}

// ────────────────────────────────────────────────
// AUTOCOMPLETE — SUPPLIER IN MODAL
// ────────────────────────────────────────────────
function setupSupplierSearchAC() {
  const input = document.getElementById("rfq-supplier-search");
  const results = document.getElementById("rfq-supplier-results");
  if (!input) return;

  input.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    if (!term) { results.classList.add("hidden"); return; }

    const matched = allSuppliers.filter(s => 
      (s.name||"").toLowerCase().includes(term) ||
      (s.phone||"").toLowerCase().includes(term)
    );

    if (!matched.length) { results.classList.add("hidden"); return; }

    results.innerHTML = matched.map(s => `
      <div class="autocomplete-item" onclick="selectRfqSupplier('${s.id}','${s.name.replace(/'/g, "\\'")}')">
        <div>${s.name}</div>
        <div class="item-code">${s.phone || ""}</div>
      </div>
    `).join("");
    results.classList.remove("hidden");
  });

  document.addEventListener("click", e => {
    if (!input.contains(e.target)) results.classList.add("hidden");
  });
}

window.selectRfqSupplier = (id, name) => {
  document.getElementById("rfq-supplier-id").value = id;
  document.getElementById("rfq-supplier-search").value = name;
  document.getElementById("rfq-supplier-results").classList.add("hidden");
};

// ────────────────────────────────────────────────
// AUTOCOMPLETE — PRODUCT SEARCH
// ────────────────────────────────────────────────
function setupProductSearchAC() {
  const input = document.getElementById("rfq-product-search");
  const results = document.getElementById("rfq-product-results");
  const catFilter = document.getElementById("rfq-product-category-filter");
  if (!input) return;

  const performSearch = () => {
    const term = input.value.trim().toLowerCase();
    const catId = catFilter ? catFilter.value : "";

    if (!term && !catId) { results.classList.add("hidden"); return; }

    let matched = allProducts;
    if (catId) matched = matched.filter(p => p.category === catId);
    if (term) {
      matched = matched.filter(p => 
        (p.name||"").toLowerCase().includes(term) ||
        (p.sku||"").toLowerCase().includes(term) ||
        (p.barcode||"").toLowerCase().includes(term)
      );
    }

    matched = matched.slice(0, 15);
    if (!matched.length) {
      results.innerHTML = `<div style="padding:10px;text-align:center;color:var(--text-3);">لا توجد نتائج</div>`;
      results.classList.remove("hidden");
      return;
    }

    results.innerHTML = matched.map(p => `
      <div class="autocomplete-item" onclick="addRfqLine('${p.id}', '${p.name.replace(/'/g, "\\'")}', '${p.unit||"حبة"}', '${p.sku||""}')">
        <div class="flex justify-between">
          <span>${p.name}</span>
          <span class="mono text-dim" style="font-size:11px;">التكلفة: ${formatCurrency(p.costPrice||0)}</span>
        </div>
        <div class="item-code">${p.sku || ""} | الوحدة: ${p.unit||""}</div>
      </div>
    `).join("");
    results.classList.remove("hidden");
  };

  input.addEventListener("input", performSearch);
  input.addEventListener("focus", performSearch);
  if (catFilter) catFilter.addEventListener("change", performSearch);

  document.addEventListener("click", e => {
    if (!input.contains(e.target) && !results.contains(e.target) && (!catFilter || !catFilter.contains(e.target))) {
      results.classList.add("hidden");
    }
  });
}

// ────────────────────────────────────────────────
// NEW/EDIT RFQ MODAL ACTIONS
// ────────────────────────────────────────────────
window.openNewRfqModal = () => {
  currentRfq = null;
  currentRfqLines = [];

  document.getElementById("rfq-modal-title").textContent = "📨 طلب عروض أسعار جديد";
  document.getElementById("rfq-date").value = todayString();
  document.getElementById("rfq-target-date").value = "";
  document.getElementById("rfq-supplier-search").value = "";
  document.getElementById("rfq-supplier-id").value = "";
  document.getElementById("rfq-notes").value = "";
  document.getElementById("rfq-lines-tbody").innerHTML = "";
  document.getElementById("rfq-number").value = "جارِ التوليد...";

  // Open modal INSTANTLY (0ms response time!)
  openModal("rfq-modal");

  // Generate number in background — with visible error if all retries fail
  generateInvoiceNumber("RFQ").then(num => {
    const el = document.getElementById("rfq-number");
    if (el) el.value = num;
  }).catch((err) => {
    const el = document.getElementById("rfq-number");
    const ts = Date.now().toString(36).toUpperCase();
    if (el) el.value = `RFQ-T${ts}`;
    console.warn("[RFQ] Counter fallback used:", err?.message);
  });
};

window.openEditRfqModal = (id) => {
  const rfq = rfqCache.get(id);
  if (!rfq) return;

  currentRfq = rfq;
  currentRfqLines = JSON.parse(JSON.stringify(rfq.lines || []));

  document.getElementById("rfq-modal-title").textContent = `📨 تعديل طلب عروض الأسعار: ${rfq.number}`;
  document.getElementById("rfq-number").value = rfq.number;
  document.getElementById("rfq-date").value = rfq.date;
  document.getElementById("rfq-target-date").value = rfq.targetDate || "";
  document.getElementById("rfq-supplier-search").value = rfq.supplierName || "";
  document.getElementById("rfq-supplier-id").value = rfq.supplierId || "";
  document.getElementById("rfq-notes").value = rfq.notes || "";

  renderRfqLines();
  openModal("rfq-modal");
};

window.closeRfqModal = () => {
  closeModal("rfq-modal");
};

window.addRfqLine = (productId, name, unit, sku) => {
  if (currentRfqLines.some(l => l.productId === productId)) {
    showToast("هذا الصنف مضاف بالفعل للطلب", "warning");
    return;
  }

  currentRfqLines.push({
    productId,
    productName: name,
    unit,
    sku,
    qty: 1,
    packQty: 1,
    notes: "",
    offeredPrice: 0
  });

  document.getElementById("rfq-product-search").value = "";
  document.getElementById("rfq-product-results").classList.add("hidden");
  renderRfqLines();
};

function renderRfqLines() {
  const tbody = document.getElementById("rfq-lines-tbody");
  tbody.innerHTML = currentRfqLines.map((l, i) => `
    <tr style="border-bottom:1px solid var(--border-soft);">
      <td style="padding:6px 10px;">${i+1}</td>
      <td style="padding:6px 10px;" class="mono">${l.sku || "—"}</td>
      <td style="padding:6px 10px; font-weight:600;">${l.productName}</td>
      <td style="padding:6px 10px;">${l.unit}</td>
      <td style="padding:6px 10px;">
        <input type="number" class="form-control mono" style="width:75px; height:28px; font-size:11px; padding:2px 6px;" value="${l.qty}" min="1" step="1" onchange="updateRfqLineField(${i}, 'qty', this.value)" />
      </td>
      <td style="padding:6px 10px;">
        <input type="number" class="form-control mono" style="width:75px; height:28px; font-size:11px; padding:2px 6px;" value="${l.packQty}" min="1" step="1" onchange="updateRfqLineField(${i}, 'packQty', this.value)" />
      </td>
      <td style="padding:6px 10px;">
        <input type="text" class="form-control" style="height:28px; font-size:11px; padding:2px 6px;" value="${l.notes}" placeholder="مواصفات توريد..." onchange="updateRfqLineField(${i}, 'notes', this.value)" />
      </td>
      <td style="padding:6px 10px;">
        <button class="btn btn-ghost btn-sm text-bad" onclick="removeRfqLine(${i})">×</button>
      </td>
    </tr>
  `).join("");
}

window.updateRfqLineField = (idx, field, val) => {
  if (field === 'qty' || field === 'packQty') {
    currentRfqLines[idx][field] = parseFloat(val) || 1;
  } else {
    currentRfqLines[idx][field] = val;
  }
};

window.removeRfqLine = (idx) => {
  currentRfqLines.splice(idx, 1);
  renderRfqLines();
};

window.saveRfq = async () => {
  const date = document.getElementById("rfq-date").value;
  const num = document.getElementById("rfq-number").value;
  const supplierId = document.getElementById("rfq-supplier-id").value;
  const supplierName = document.getElementById("rfq-supplier-search").value;
  const targetDate = document.getElementById("rfq-target-date").value;
  const notes = document.getElementById("rfq-notes").value.trim();

  if (!supplierId || !date) {
    showToast("يرجى تعبئة التاريخ واختيار المورد", "warning");
    return;
  }

  if (!currentRfqLines.length) {
    showToast("يرجى إضافة صنف واحد على الأقل للطلب", "warning");
    return;
  }

  const saveBtn = document.getElementById("rfq-save-btn");
  saveBtn.disabled = true;

  try {
    const docData = {
      number: num,
      date,
      supplierId,
      supplierName,
      targetDate,
      notes,
      lines: currentRfqLines,
      status: currentRfq ? currentRfq.status : "sent",
      updatedAt: new Date()
    };

    if (currentRfq) {
      await update("purchaseRequests", currentRfq.id, docData);
      showToast("تم تحديث طلب عروض الأسعار بنجاح", "success");
    } else {
      docData.createdAt = new Date();
      await create(COLS.purchaseRequests(), docData);
      showToast("تم حفظ طلب عروض الأسعار بنجاح", "success");
    }
    
    closeRfqModal();
    await loadRFQs();
  } catch (err) {
    console.error("Save RFQ Error:", err);
    showToast("حدث خطأ أثناء حفظ طلب الأسعار", "danger");
  } finally {
    saveBtn.disabled = false;
  }
};

// ────────────────────────────────────────────────
// PRICE ENTRY MODAL
// ────────────────────────────────────────────────
let activeRfqId = null;
let activeRfqLines = [];

window.openEnterPricesModal = (id) => {
  activeRfqId = id;
  const rfq = rfqCache.get(id);
  if (!rfq) return;

  document.getElementById("rfq-p-supplier-name").textContent = rfq.supplierName || "";
  document.getElementById("rfq-p-number").textContent = rfq.number || "";

  activeRfqLines = JSON.parse(JSON.stringify(rfq.lines || []));

  const tbody = document.getElementById("rfq-prices-tbody");
  tbody.innerHTML = activeRfqLines.map((l, i) => `
    <tr style="border-bottom:1px solid var(--border-soft);">
      <td style="padding:6px 10px;">${i+1}</td>
      <td style="padding:6px 10px; font-weight:600;">${l.productName}</td>
      <td style="padding:6px 10px;">${l.unit}</td>
      <td style="padding:6px 10px;" class="mono">${l.qty}</td>
      <td style="padding:6px 10px;">
        <input type="number" class="form-control mono" style="width:110px; height:30px; font-size:12px; padding:2px 8px; border-color:var(--brand) !important;" value="${l.offeredPrice || ""}" min="0" step="0.01" placeholder="0.00" onchange="updateOfferedPrice(${i}, this.value)" />
      </td>
      <td style="padding:6px 10px;">
        <input type="text" class="form-control" style="height:30px; font-size:12px; padding:2px 8px;" value="${l.supplyNotes || ""}" placeholder="مثال: جاهز للتوصيل فوراً..." onchange="updateSupplyNotes(${i}, this.value)" />
      </td>
    </tr>
  `).join("");

  openModal("rfq-prices-modal");
};

window.updateOfferedPrice = (idx, val) => {
  activeRfqLines[idx].offeredPrice = parseFloat(val) || 0;
};

window.updateSupplyNotes = (idx, val) => {
  activeRfqLines[idx].supplyNotes = val;
};

window.saveRfqPrices = async () => {
  const saveBtn = document.getElementById("rfq-prices-save-btn");
  saveBtn.disabled = true;

  try {
    await update("purchaseRequests", activeRfqId, {
      lines: activeRfqLines,
      status: "completed"
    });
    showToast("تم إدخال الأسعار وحفظ العرض بنجاح", "success");
    closeModal("rfq-prices-modal");
    await loadRFQs();
  } catch (err) {
    showToast("خطأ أثناء حفظ الأسعار", "danger");
  } finally {
    saveBtn.disabled = false;
  }
};

// ────────────────────────────────────────────────
// PRICE COMPARISON ACTIONS
// ────────────────────────────────────────────────
let compareRfqData = null;

window.openCompareModal = (id) => {
  const rfq = rfqCache.get(id);
  if (!rfq) return;

  compareRfqData = rfq;

  document.getElementById("rfq-comp-supplier").textContent = rfq.supplierName || "";
  document.getElementById("rfq-comp-number").textContent = rfq.number || "";
  document.getElementById("rfq-comp-date").textContent = rfq.date || "";

  const tbody = document.getElementById("rfq-compare-tbody");
  tbody.innerHTML = "";

  let totalSavings = 0;

  rfq.lines.forEach((l, i) => {
    const originalProd = allProducts.find(p => p.id === l.productId);
    const currentCost = originalProd ? parseFloat(originalProd.costPrice || 0) : 0;
    const salePrice = originalProd ? parseFloat(originalProd.salePrice || 0) : 0;

    const offeredPrice = parseFloat(l.offeredPrice || 0);
    const qty = parseFloat(l.qty || 0);

    const diffSAR = offeredPrice - currentCost;
    const diffPct = currentCost > 0 ? (diffSAR / currentCost) * 100 : 0;

    // Savings sum
    if (offeredPrice > 0 && currentCost > 0) {
      totalSavings += (currentCost - offeredPrice) * qty;
    }

    let diffText = "—";
    let diffClass = "mono";

    if (diffSAR < 0) {
      diffText = `توفير ${formatCurrency(Math.abs(diffSAR))} (${Math.abs(diffPct).toFixed(1)}%)`;
      diffClass = "mono text-good";
    } else if (diffSAR > 0) {
      diffText = `زيادة ${formatCurrency(diffSAR)} (${diffPct.toFixed(1)}%)`;
      diffClass = "mono text-bad";
    } else if (offeredPrice > 0 && currentCost > 0) {
      diffText = "متطابق";
      diffClass = "mono text-dim";
    }

    const currentMargin = salePrice > 0 ? ((salePrice - currentCost) / salePrice) * 100 : 0;
    const offeredMargin = salePrice > 0 ? ((salePrice - offeredPrice) / salePrice) * 100 : 0;

    tbody.innerHTML += `
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:8px; text-align:right;">${i+1}</td>
        <td style="padding:8px; font-weight:600;">${l.productName}</td>
        <td style="padding:8px; text-align:center;" class="mono">${qty}</td>
        <td style="padding:8px; text-align:left; font-weight:700;" class="mono text-indigo">${formatCurrency(offeredPrice)}</td>
        <td style="padding:8px; text-align:left;" class="mono">${formatCurrency(currentCost)}</td>
        <td style="padding:8px; text-align:left;" class="${diffClass}">${diffText}</td>
        <td style="padding:8px; text-align:left;" class="mono">${formatCurrency(salePrice)}</td>
        <td style="padding:8px; text-align:center;" class="mono text-indigo font-bold">${offeredMargin.toFixed(1)}%</td>
        <td style="padding:8px; text-align:center;" class="mono">${currentMargin.toFixed(1)}%</td>
      </tr>
    `;
  });

  document.getElementById("rfq-comp-totalsavings").textContent = formatCurrency(totalSavings);
  openModal("rfq-compare-modal");
};

window.exportComparisonCSV = () => {
  if (!compareRfqData) return;
  let csv = "\uFEFF#;الصنف;الكمية;سعر المورد المقترح;تكلفة الشراء الحالية عندنا;الفرق المالي;سعر البيع الحالي;هامش ربح العرض;هامش الربح الحالي\n";
  compareRfqData.lines.forEach((l, i) => {
    const originalProd = allProducts.find(p => p.id === l.productId);
    const currentCost = originalProd ? parseFloat(originalProd.costPrice || 0) : 0;
    const salePrice = originalProd ? parseFloat(originalProd.salePrice || 0) : 0;
    const offeredPrice = parseFloat(l.offeredPrice || 0);
    const currentMargin = salePrice > 0 ? ((salePrice - currentCost) / salePrice) * 100 : 0;
    const offeredMargin = salePrice > 0 ? ((salePrice - offeredPrice) / salePrice) * 100 : 0;
    const diff = offeredPrice - currentCost;

    csv += `${i+1};"${l.productName}";${l.qty};${offeredPrice};${currentCost};${diff};${salePrice};${offeredMargin.toFixed(2)}%;${currentMargin.toFixed(2)}%\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `مقارنة_أسعار_طلب_${compareRfqData.number}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ────────────────────────────────────────────────
// PRINT RFQ FOR SUPPLIER (WITHOUT PRICES)
// ────────────────────────────────────────────────
window.printRfqForSupplier = (id) => {
  const rfq = rfqCache.get(id);
  if (!rfq) return;

  // ── جلب بيانات الشركة من الإعدادات المحفوظة ──
  let co = {};
  try { co = JSON.parse(localStorage.getItem("idham_company") || "{}"); } catch {}
  const coName    = co.name    || "شركتنا";
  const coAddress = [co.address, co.city, co.country].filter(Boolean).join("، ");
  const coPhone   = co.phone   || "";
  const coVAT     = co.vatNumber || "";
  const coCR      = co.crNumber  || "";
  const coEmail   = co.email   || "";
  const coLogo    = co.logoBase64 || "";
  const primaryColor = co.primaryColor || "#4f46e5";

  const rowsHtml = rfq.lines.map((l, i) => `
    <tr>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; text-align:center; width:30px;">${i+1}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; font-family:monospace; font-size:11px;">${l.sku || "—"}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; font-weight:600;">${l.productName}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; text-align:center;">${l.unit}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; text-align:center; font-family:monospace;">${l.qty}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; text-align:center; font-family:monospace;">${l.packQty || 1}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; background:#fefce8;"></td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; color:#94a3b8; font-style:italic; font-size:11px;">${l.notes || ""}</td>
    </tr>`).join("");

  const printHTML = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${coName} — طلب عرض أسعار ${rfq.number}</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    @page { size: A4; margin: 8mm 10mm; }
    body {
      font-family: 'IBM Plex Sans Arabic', Tahoma, sans-serif;
      font-size: 11px; color: #111; direction: rtl;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    /* Header */
    .hdr {
      display: flex; justify-content: space-between; align-items: center;
      background: ${primaryColor}; color: #fff;
      padding: 12px 16px; border-radius: 8px 8px 0 0;
      margin-bottom: 0;
    }
    .hdr-left { display:flex; align-items:center; gap:12px; }
    .co-logo { max-height:52px; max-width:110px; object-fit:contain;
               background:#fff; padding:4px; border-radius:5px; }
    .co-name { font-size:17px; font-weight:800; color:#fff; margin-bottom:3px; }
    .co-info { font-size:9px; color:rgba(255,255,255,0.85); line-height:1.7; }
    /* Doc strip */
    .doc-strip {
      background:#1a1a2e; color:#fff;
      display:flex; justify-content:space-between; align-items:center;
      padding:8px 16px; margin-bottom:12px;
    }
    .doc-title { font-size:14px; font-weight:700; }
    .doc-meta  { font-size:10px; color:rgba(255,255,255,0.8); text-align:left; }
    /* Recipient box */
    .recip-box {
      background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px;
      padding:10px 14px; margin-bottom:10px; font-size:12px; line-height:1.8;
    }
    /* Table */
    table { width:100%; border-collapse:collapse; font-size:11px; margin-bottom:12px; }
    thead tr { background:#1a1a2e; color:#fff; }
    thead th { padding:8px 6px; text-align:right; border:1px solid #334155; font-size:10px; white-space:nowrap; }
    tbody tr:nth-child(even) { background:#f8fafc; }
    /* Signature */
    .sig-row { display:flex; justify-content:space-between; margin-top:16px; }
    .sig-box { text-align:center; width:200px; font-size:11px; }
    .sig-line { border-top:1px solid #999; margin-top:40px; padding-top:4px; }
    /* Footer */
    .ftr { margin-top:12px; padding-top:8px; border-top:2px solid ${primaryColor};
           display:flex; justify-content:space-between; font-size:9px; color:#666; }
    @media print {
      body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    }
  </style>
</head>
<body>

  <!-- Company Header -->
  <div class="hdr">
    <div class="hdr-left">
      ${coLogo ? `<img class="co-logo" src="${coLogo}" alt="شعار الشركة">` : ""}
      <div>
        <div class="co-name">${coName}</div>
        <div class="co-info">
          ${coAddress ? `📍 ${coAddress}<br>` : ""}
          ${coPhone   ? `📞 ${coPhone}` : ""}${coEmail ? `   ✉️ ${coEmail}` : ""}${(coPhone||coEmail) ? "<br>" : ""}
          ${coVAT     ? `الرقم الضريبي: ${coVAT}` : ""}${(coVAT && coCR) ? "   |   " : ""}${coCR ? `س.ت: ${coCR}` : ""}
        </div>
      </div>
    </div>
    <div style="text-align:left; color:rgba(255,255,255,0.85);">
      <div style="font-size:11px; font-weight:700; color:#fff;">طلب عرض أسعار (RFQ)</div>
      <div style="font-size:10px; margin-top:4px;">رقم الطلب: <strong style="color:#fff; font-family:monospace;">${rfq.number}</strong></div>
      <div style="font-size:10px;">التاريخ: ${rfq.date}</div>
    </div>
  </div>

  <!-- Doc strip -->
  <div class="doc-strip">
    <div class="doc-title">طلب عرض أسعار (Request for Quotation)</div>
    <div class="doc-meta">الحالة: ${rfq.status === "sent" ? "تم الإرسال" : rfq.status === "completed" ? "مكتمل" : "مسودة"}</div>
  </div>

  <!-- Recipient -->
  <div class="recip-box">
    <p><strong>موجه للسيد / الموقر:</strong> <span style="font-size:13px; font-weight:700; color:#1e293b;">${rfq.supplierName}</span></p>
    <p><strong>تاريخ الاستجابة وتقديم السعر المأمول:</strong> ${rfq.targetDate || "—"}</p>
    ${rfq.notes ? `<p><strong>ملاحظات وشروط إضافية:</strong> ${rfq.notes}</p>` : ""}
  </div>

  <p style="font-size:12px; margin-bottom:10px; color:#334155;">
    السادة الموردين الكرام، نرجو التكرم بتعبئة الأسعار المقترحة للكميات المذكورة أدناه وإعادة إرسال المستند إلينا:
  </p>

  <!-- Items Table -->
  <table>
    <thead>
      <tr>
        <th style="width:30px; text-align:center;">#</th>
        <th style="width:110px;">كود الصنف</th>
        <th>اسم الصنف والمواصفات</th>
        <th style="width:70px;">الوحدة</th>
        <th style="width:60px; text-align:center;">الكمية</th>
        <th style="width:70px; text-align:center;">الكراتين</th>
        <th style="width:120px; color:#fcd34d;">سعر المفرد المقترح</th>
        <th style="width:150px;">ملاحظات المورد</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>

  <!-- Signatures -->
  <div class="sig-row">
    <div class="sig-box">
      <strong>توقيع وختم إدارة المشتريات</strong>
      <div class="sig-line">${coName}</div>
    </div>
    <div class="sig-box">
      <strong>اعتماد وتوقيع المورد المستجيب</strong>
      <div class="sig-line">${rfq.supplierName}</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="ftr">
    <span style="font-weight:600;">${coName}</span>
    <span>${rfq.number} — ${rfq.date}</span>
  </div>

</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) { showToast("يُرجى السماح بالنوافذ المنبثقة للطباعة", "warning"); return; }
  win.document.write(printHTML);
  win.document.close();
  win.onload = () => setTimeout(() => win.print(), 700);
  showToast("جاري تحضير المستند للطباعة...", "info");
};


// ────────────────────────────────────────────────
// PRINT COMPARISON REPORT
// ────────────────────────────────────────────────
window.printRfqComparison = () => {
  if (!compareRfqData) return;

  const printArea = document.getElementById("rfq-print-area");
  let totalSavings = 0;

  const rows = compareRfqData.lines.map((l, i) => {
    const originalProd = allProducts.find(p => p.id === l.productId);
    const currentCost = originalProd ? parseFloat(originalProd.costPrice || 0) : 0;
    const salePrice = originalProd ? parseFloat(originalProd.salePrice || 0) : 0;
    const offeredPrice = parseFloat(l.offeredPrice || 0);
    const qty = parseFloat(l.qty || 0);
    const diffSAR = offeredPrice - currentCost;
    const diffPct = currentCost > 0 ? (diffSAR / currentCost) * 100 : 0;

    if (offeredPrice > 0 && currentCost > 0) {
      totalSavings += (currentCost - offeredPrice) * qty;
    }

    let diffText = "متطابق";
    if (diffSAR < 0) {
      diffText = `توفير ${Math.abs(diffSAR).toFixed(2)} ر.س (${Math.abs(diffPct).toFixed(1)}%)`;
    } else if (diffSAR > 0) {
      diffText = `زيادة ${diffSAR.toFixed(2)} ر.س (${diffPct.toFixed(1)}%)`;
    }

    return `
      <tr style="border-bottom:1px solid #cbd5e1;">
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:right;">${i+1}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold;">${l.productName}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:center;" class="mono">${qty}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:left; font-weight:bold;" class="mono">${formatCurrency(offeredPrice)}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:left;" class="mono">${formatCurrency(currentCost)}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:left;" class="mono">${diffText}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:left;" class="mono">${formatCurrency(salePrice)}</td>
      </tr>
    `;
  }).join("");

  printArea.innerHTML = `
    <div style="direction:rtl; text-align:right; font-family:'IBM Plex Sans Arabic', sans-serif; padding:40px; color:#000; background:#fff;">
      <h2 style="margin:0 0 5px 0; font-size:22px; color:#1e293b;">تقرير مقارنة عروض الأسعار ونسب الأرباح</h2>
      <p style="margin:0 0 20px 0; font-size:12px; color:#64748b;">تاريخ التقرير: ${todayString()}</p>

      <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:16px; border-radius:6px; margin-bottom:24px; font-size:13px; line-height:1.6;">
        <p><strong>المورد:</strong> ${compareRfqData.supplierName}</p>
        <p><strong>رقم العرض المرجعي:</strong> ${compareRfqData.number}</p>
        <p><strong>إجمالي القيمة التوفيرية للعرض:</strong> <span style="font-size:15px; font-weight:bold; color:#10b981;">${formatCurrency(totalSavings)}</span></p>
      </div>

      <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:30px;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:8px; border:1px solid #cbd5e1; text-align:right; width:30px;">#</th>
            <th style="padding:8px; border:1px solid #cbd5e1; text-align:right;">اسم الصنف</th>
            <th style="padding:8px; border:1px solid #cbd5e1; text-align:center; width:50px;">الكمية</th>
            <th style="padding:8px; border:1px solid #cbd5e1; text-align:left; width:90px;">عرض المورد</th>
            <th style="padding:8px; border:1px solid #cbd5e1; text-align:left; width:90px;">التكلفة الحالية</th>
            <th style="padding:8px; border:1px solid #cbd5e1; text-align:left; width:130px;">الفرق التقديري</th>
            <th style="padding:8px; border:1px solid #cbd5e1; text-align:left; width:90px;">سعر البيع</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;

  window.print();
};

// ────────────────────────────────────────────────
// EXPORT LIST TO PDF
// ────────────────────────────────────────────────
window.exportRFQsListPDF = () => {
  if (typeof exportPagePDF === "function") {
    exportPagePDF("#rfqs-main-table", "سجل_طلبات_عروض_الأسعار_RFQ", "قائمة طلبات عروض أسعار الموردين والعهد");
  } else {
    window.print();
  }
};

// ────────────────────────────────────────────────
// DELETE RFQ
// ────────────────────────────────────────────────
window.deleteRfq = async (id) => {
  if (!confirm("هل أنت متأكد من حذف طلب عروض الأسعار هذا؟")) return;
  try {
    await remove("purchaseRequests", id);
    showToast("تم حذف طلب الأسعار بنجاح", "success");
    await loadRFQs();
  } catch {
    showToast("حدث خطأ أثناء الحذف", "danger");
  }
};
