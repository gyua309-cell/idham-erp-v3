// ============================================================
// IDHAM ERP — مقارنة عروض أسعار الموردين الذكية
// Smart Supplier Price Quotations & Comparison Matrix Module
// ============================================================
import { COLS, getAll, create, update, remove, orderBy } from "../utils/db.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

let allQuotations = [];
let allSuppliers = [];
let allProducts = [];
let quoteLines = [];

const todayStr = () => new Date().toISOString().slice(0, 10);

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:260px;">
        <input type="text" id="sup-q-search" class="input" placeholder="🔍 بحث في عروض الأسعار..." oninput="window.filterSupplierQuotes(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>المورد</label>
        <select id="sup-q-sup-filter" onchange="window.filterSupplierQuotes()">
          <option value="">كل الموردين</option>
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportSupplierQuotesExcel()">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openSupplierQuoteModal()">+ تسجيل عرض سعر مورد جديد</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Stats -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي عروض الأسعار</div>
          <div class="mono" id="sq-kpi-total" style="font-size:20px; font-weight:900; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">عروض معتمدة ومقبولة</div>
          <div class="mono" id="sq-kpi-accepted" style="font-size:20px; font-weight:900; color:#10B981; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#F59E0B; font-weight:700;">قيد المراجعة والمقارنة</div>
          <div class="mono" id="sq-kpi-pending" style="font-size:20px; font-weight:900; color:#F59E0B; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(99,102,241,0.2); border-radius:12px;">
          <div style="font-size:11px; color:var(--brand); font-weight:700;">متوسط إجمالي العرض</div>
          <div class="mono" id="sq-kpi-avg" style="font-size:18px; font-weight:900; color:var(--brand); margin-top:4px;">0 ر.س</div>
        </div>
      </div>

      <!-- Quotations Table -->
      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th style="width:110px;">رقم العرض</th>
                <th>المورد</th>
                <th style="width:95px;">التاريخ</th>
                <th style="width:95px;">تاريخ الصلاحية</th>
                <th>شروط الدفع والتسليم</th>
                <th style="width:70px; text-align:center;">الأصناف</th>
                <th style="width:115px; text-align:left;">إجمالي العرض</th>
                <th style="width:95px; text-align:center;">الحالة</th>
                <th style="width:140px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="sq-tbody">
              <tr><td colspan="9" style="text-align:center; padding:32px;"><span class="spin"></span> جاري تحميل عروض الأسعار...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Quotation Modal -->
    <div class="modal-overlay" id="sup-quote-modal">
      <div class="modal modal-lg" style="max-width:850px;">
        <div class="modal-header">
          <h3 class="modal-title" id="sup-q-modal-title">➕ تسجيل عرض سعر مورد</h3>
          <button class="modal-close" onclick="closeModal('sup-quote-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="sup-q-edit-id" />
          
          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>المورد صاحب العرض *</label>
              <select id="sup-q-sup-id" class="input">
                <option value="">-- اختر المورد --</option>
              </select>
            </div>
            <div class="form-group">
              <label>تاريخ العرض *</label>
              <input type="date" id="sup-q-date" class="input" value="${todayStr()}" />
            </div>
            <div class="form-group">
              <label>صالح حتى تاريخ</label>
              <input type="date" id="sup-q-expiry" class="input" />
            </div>
          </div>

          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>شروط الدفع والتسليم</label>
              <input type="text" id="sup-q-terms" class="input" placeholder="آجل 30 يوم — تسليم مستودع ينبع" />
            </div>
            <div class="form-group">
              <label>حالة العرض</label>
              <select id="sup-q-status" class="input">
                <option value="pending">🟡 قيد المراجعة والمقارنة</option>
                <option value="accepted">🟢 معتمد وفائز (الأفضل)</option>
                <option value="rejected">🔴 مرفوض / سعر مرتفع</option>
              </select>
            </div>
          </div>

          <!-- Product Quotation Lines -->
          <div style="margin:16px 0 8px; display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight:800; font-size:13px; color:var(--text-0);">📦 الأصناف وأسعار التوريد المقدمة:</div>
            <button class="btn btn-secondary btn-sm" onclick="window.addSupplierQuoteLine()">+ إضافة صنف</button>
          </div>

          <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px; max-height:220px; overflow-y:auto; margin-bottom:12px;">
            <table class="data-dense" style="margin:0;">
              <thead>
                <tr>
                  <th>الصنف *</th>
                  <th style="width:100px;">الوحدة</th>
                  <th style="width:100px;">الكمية المطلوبة</th>
                  <th style="width:110px;">سعر الوحدة المقترح</th>
                  <th style="width:110px; text-align:left;">الإجمالي</th>
                  <th style="width:40px;"></th>
                </tr>
              </thead>
              <tbody id="sup-q-lines-tbody"></tbody>
            </table>
          </div>

          <div class="form-group">
            <label>ملاحظات إضافية</label>
            <input type="text" id="sup-q-notes" class="input" placeholder="ملاحظات حول صلاحية العرض أو توفر البضاعة..." />
          </div>

          <div id="sup-q-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('sup-quote-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveSupplierQuote()">💾 حفظ عرض السعر</button>
        </div>
      </div>
    </div>
  `;

  await loadData();
  setupGlobalFunctions();
}

async function loadData() {
  try {
    const [quotes, sups, prods] = await Promise.all([
      getAll(COLS.supplierQuotations ? COLS.supplierQuotations() : "supplierQuotations", [orderBy("createdAt", "desc")]).catch(() => []),
      getAll(COLS.suppliers(), [orderBy("name")]).catch(() => []),
      getAll(COLS.products(), [orderBy("name")]).catch(() => [])
    ]);

    allQuotations = quotes;
    allSuppliers = sups;
    allProducts = prods;

    populateSuppliersFilter();
    updateKPIs();
    renderQuotationsTable();
  } catch (e) {
    console.warn("Error loading supplier quotes:", e);
  }
}

function updateKPIs() {
  const accepted = allQuotations.filter(q => q.status === "accepted");
  const pending = allQuotations.filter(q => q.status === "pending");
  const totalVal = allQuotations.reduce((s, q) => s + (parseFloat(q.totalAmount) || 0), 0);
  const avgVal = allQuotations.length ? totalVal / allQuotations.length : 0;

  const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setT("sq-kpi-total", allQuotations.length);
  setT("sq-kpi-accepted", accepted.length);
  setT("sq-kpi-pending", pending.length);
  setT("sq-kpi-avg", formatCurrency(avgVal));
}

function populateSuppliersFilter() {
  const f = document.getElementById("sup-q-sup-filter");
  const m = document.getElementById("sup-q-sup-id");
  const opts = allSuppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  if (f) f.innerHTML = `<option value="">كل الموردين</option>` + opts;
  if (m) m.innerHTML = `<option value="">-- اختر المورد --</option>` + opts;
}

function renderQuotationsTable(list = allQuotations) {
  const tbody = document.getElementById("sq-tbody");
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد عروض أسعار مسجلة بعد</td></tr>`;
    return;
  }

  const statusBadges = {
    pending: '<span class="badge warn">قيد المقارنة</span>',
    accepted: '<span class="badge good">معتمد وفائز</span>',
    rejected: '<span class="badge bad">مرفوض</span>'
  };

  tbody.innerHTML = list.map(q => `
    <tr>
      <td class="mono font-bold" style="color:var(--brand);">${q.quoteNumber || q.id}</td>
      <td class="font-bold">${q.supplierName}</td>
      <td class="mono dim">${q.date || "—"}</td>
      <td class="mono dim">${q.expiryDate || "—"}</td>
      <td style="font-size:12px;">${q.terms || "—"}</td>
      <td class="mono" style="text-align:center;">${(q.lines || []).length}</td>
      <td class="mono font-bold" style="text-align:left; color:var(--brand); font-size:13px;">${formatCurrency(q.totalAmount || 0)}</td>
      <td style="text-align:center;">${statusBadges[q.status] || statusBadges.pending}</td>
      <td>
        <div class="row-actions" style="justify-content:center;">
          <button class="btn btn-icon sm" style="color:#10B981;" onclick="window.convertQuoteToPurchaseInvoice('${q.id}')" title="⚡ تحويل لفاتورة شراء">⚡</button>
          <button class="btn btn-icon sm btn-ghost" onclick="window.editSupplierQuote('${q.id}')" title="تعديل">✏️</button>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deleteSupplierQuote('${q.id}')" title="حذف">🗑️</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function renderQuoteLinesTable() {
  const tbody = document.getElementById("sup-q-lines-tbody");
  if (!tbody) return;

  if (!quoteLines.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:16px; color:var(--text-3);">لا توجد أصناف. انقر على "+ إضافة صنف"</td></tr>`;
    return;
  }

  tbody.innerHTML = quoteLines.map((line, idx) => `
    <tr>
      <td>
        <select class="input" style="height:32px; font-size:12px;" onchange="window.updateSupplierQuoteLine(${idx}, 'productId', this.value)">
          <option value="">-- اختر الصنف --</option>
          ${allProducts.map(p => `<option value="${p.id}" ${p.id === line.productId ? "selected" : ""}>${p.name}</option>`).join("")}
        </select>
      </td>
      <td>
        <input type="text" class="input" style="height:32px; font-size:12px;" value="${line.unit || "كرتون"}" onchange="window.updateSupplierQuoteLine(${idx}, 'unit', this.value)" />
      </td>
      <td>
        <input type="number" class="input mono" style="height:32px; font-size:12px;" value="${line.qty || ""}" placeholder="50" min="1" oninput="window.updateSupplierQuoteLine(${idx}, 'qty', this.value)" />
      </td>
      <td>
        <input type="number" class="input mono" style="height:32px; font-size:12px;" value="${line.unitPrice || ""}" placeholder="0.00" min="0" step="0.5" oninput="window.updateSupplierQuoteLine(${idx}, 'unitPrice', this.value)" />
      </td>
      <td class="mono font-bold" style="text-align:left;">
        ${formatCurrency((line.unitPrice || 0) * (line.qty || 0))}
      </td>
      <td style="text-align:center;">
        <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.removeSupplierQuoteLine(${idx})">✕</button>
      </td>
    </tr>
  `).join("");
}

function setupGlobalFunctions() {
  window.filterSupplierQuotes = () => {
    const q = (document.getElementById("sup-q-search")?.value || "").trim().toLowerCase();
    const supId = document.getElementById("sup-q-sup-filter")?.value || "";

    const filtered = allQuotations.filter(qt => {
      const mQ = !q || (qt.quoteNumber || "").toLowerCase().includes(q) || (qt.supplierName || "").toLowerCase().includes(q);
      const mS = !supId || qt.supplierId === supId;
      return mQ && mS;
    });

    renderQuotationsTable(filtered);
  };

  window.openSupplierQuoteModal = () => {
    document.getElementById("sup-q-edit-id").value = "";
    document.getElementById("sup-q-modal-title").textContent = "➕ تسجيل عرض سعر مورد";
    document.getElementById("sup-q-sup-id").value = "";
    document.getElementById("sup-q-date").value = todayStr();
    document.getElementById("sup-q-expiry").value = "";
    document.getElementById("sup-q-terms").value = "آجل 30 يوم — تسليم مستودع ينبع";
    document.getElementById("sup-q-status").value = "pending";
    document.getElementById("sup-q-notes").value = "";
    document.getElementById("sup-q-modal-err").classList.add("hidden");
    quoteLines = [];
    renderQuoteLinesTable();
    openModal("sup-quote-modal");
  };

  window.addSupplierQuoteLine = () => {
    quoteLines.push({ productId: "", productName: "", unit: "كرتون", qty: 50, unitPrice: 0 });
    renderQuoteLinesTable();
  };

  window.updateSupplierQuoteLine = (idx, field, val) => {
    if (!quoteLines[idx]) return;
    if (field === "productId") {
      const p = allProducts.find(x => x.id === val);
      quoteLines[idx].productId = val;
      quoteLines[idx].productName = p ? p.name : "";
      quoteLines[idx].unit = p ? (p.unit || "كرتون") : "كرتون";
      quoteLines[idx].unitPrice = p ? (p.costPrice || 0) : 0;
    } else if (field === "unitPrice" || field === "qty") {
      quoteLines[idx][field] = parseFloat(val) || 0;
    } else {
      quoteLines[idx][field] = val;
    }
    renderQuoteLinesTable();
  };

  window.removeSupplierQuoteLine = (idx) => {
    quoteLines.splice(idx, 1);
    renderQuoteLinesTable();
  };

  window.saveSupplierQuote = async () => {
    const err = document.getElementById("sup-q-modal-err");
    err.classList.add("hidden");

    const supId = document.getElementById("sup-q-sup-id").value;
    const sup = allSuppliers.find(s => s.id === supId);
    const editId = document.getElementById("sup-q-edit-id").value;

    if (!supId) { err.textContent = "يرجى اختيار المورد"; err.classList.remove("hidden"); return; }
    if (!quoteLines.length) { err.textContent = "يرجى إضافة صنف واحد على الأقل"; err.classList.remove("hidden"); return; }

    const num = editId ? undefined : `SQ-${new Date().getFullYear()}-${String(allQuotations.length + 1).padStart(4, "0")}`;
    const total = quoteLines.reduce((s, l) => s + ((l.unitPrice || 0) * (l.qty || 0)), 0);

    const data = {
      supplierId: supId,
      supplierName: sup ? sup.name : "مورد",
      date: document.getElementById("sup-q-date").value,
      expiryDate: document.getElementById("sup-q-expiry").value,
      terms: document.getElementById("sup-q-terms").value.trim(),
      status: document.getElementById("sup-q-status").value,
      notes: document.getElementById("sup-q-notes").value.trim(),
      totalAmount: total,
      lines: quoteLines
    };

    if (num) data.quoteNumber = num;

    try {
      if (editId) {
        await update("supplierQuotations", editId, data);
      } else {
        await create("supplierQuotations", data);
      }
      closeModal("sup-quote-modal");
      await loadData();
    } catch (e) {
      err.textContent = e.message;
      err.classList.remove("hidden");
    }
  };

  window.editSupplierQuote = (id) => {
    const q = allQuotations.find(x => x.id === id);
    if (!q) return;

    document.getElementById("sup-q-edit-id").value = q.id;
    document.getElementById("sup-q-modal-title").textContent = "✏️ تعديل عرض السعر: " + (q.quoteNumber || q.id);
    document.getElementById("sup-q-sup-id").value = q.supplierId || "";
    document.getElementById("sup-q-date").value = q.date || todayStr();
    document.getElementById("sup-q-expiry").value = q.expiryDate || "";
    document.getElementById("sup-q-terms").value = q.terms || "";
    document.getElementById("sup-q-status").value = q.status || "pending";
    document.getElementById("sup-q-notes").value = q.notes || "";
    quoteLines = q.lines || [];
    renderQuoteLinesTable();
    openModal("sup-quote-modal");
  };

  window.convertQuoteToPurchaseInvoice = (id) => {
    const q = allQuotations.find(x => x.id === id);
    if (!q) return;

    if (!confirm(`هل تريد تحويل عرض السعر "${q.quoteNumber || q.id}" إلى فاتورة مشتريات فوراً؟`)) return;

    if (window.navigate) {
      window.navigate("purchase-invoices");
      setTimeout(() => {
        if (typeof window.openNewPurchaseModal === "function") {
          window.openNewPurchaseModal(q.supplierId, q.supplierName, q.lines);
        }
      }, 350);
    }
  };

  window.deleteSupplierQuote = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا العرض؟")) return;
    try {
      await remove("supplierQuotations", id);
      await loadData();
    } catch (e) {
      alert("فشل الحذف: " + e.message);
    }
  };

  window.exportSupplierQuotesExcel = () => {
    const rows = allQuotations.map(q => ({
      "رقم العرض": q.quoteNumber || q.id,
      "اسم المورد": q.supplierName,
      "التاريخ": q.date,
      "صالح حتى": q.expiryDate || "—",
      "الشروط": q.terms,
      "الحالة": q.status,
      "إجمالي العرض": q.totalAmount || 0
    }));
    exportToExcel(rows, "عروض_أسعار_الموردين");
  };
}
