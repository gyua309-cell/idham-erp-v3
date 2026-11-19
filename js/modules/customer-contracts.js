// ============================================================
// IDHAM ERP — العقود والاتفاقيات التجارية المطورة
// Customer Contracts, Quotation Conversion & Fulfillment Module
// ============================================================
import { COLS, getAll, getById, create, update, remove, query, where, orderBy } from "../utils/db.js";
import { formatCurrency, formatDate, debounce } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

let allContracts = [];
let allCustomers = [];
let allProducts = [];
let allQuotations = [];
let allSalesInvoices = [];
let contractLines = [];

const todayStr = () => new Date().toISOString().slice(0, 10);
const nextYearStr = () => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().slice(0, 10); };

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:280px;">
        <input type="text" id="ctr-search" class="input" placeholder="🔍 بحث في العقود (الرقم / العميل)..." oninput="window.filterContracts(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="ctr-status-filter" onchange="window.filterContracts()">
          <option value="">كل الحالات</option>
          <option value="active">🟢 نشط وساري</option>
          <option value="expiring">⏳ ينتهي قريباً (30 يوم)</option>
          <option value="expired">🔴 منتهي الصلاحية</option>
          <option value="draft">📝 مسودة</option>
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.openImportQuoteModal()">📑 تحويل عرض سعر إلى عقد</button>
        <button class="btn btn-secondary" onclick="window.exportContractsExcel()">📊 تصدير Excel</button>
        <button class="btn btn-primary" onclick="window.openContractModal()">+ إنشاء عقد جديد</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Stats Strip -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px; margin-bottom:20px;">
        <div class="kpi-card" style="padding:16px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي العقود</div>
          <div class="mono" id="ctr-kpi-total" style="font-size:22px; font-weight:900; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:16px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">العقود السارية النشطة</div>
          <div class="mono" id="ctr-kpi-active" style="font-size:22px; font-weight:900; color:#10B981; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:16px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#F59E0B; font-weight:700;">تنتهي قريباً (30 يوم)</div>
          <div class="mono" id="ctr-kpi-expiring" style="font-size:22px; font-weight:900; color:#F59E0B; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:16px; background:var(--bg-card); border:1px solid rgba(99,102,241,0.2); border-radius:12px;">
          <div style="font-size:11px; color:var(--brand); font-weight:700;">القيمة التقديرية للتعاقدات</div>
          <div class="mono" id="ctr-kpi-val" style="font-size:20px; font-weight:900; color:var(--brand); margin-top:4px;">0 ر.س</div>
        </div>
      </div>

      <!-- Contracts Table -->
      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th style="width:110px;">رقم العقد</th>
                <th>العميل والمنشأة</th>
                <th style="width:105px;">تاريخ البدء</th>
                <th style="width:105px;">تاريخ الانتهاء</th>
                <th style="width:100px;">المدة المتبقية</th>
                <th style="width:110px;">شروط الدفع</th>
                <th style="width:110px; text-align:left;">القيمة التقديرية</th>
                <th style="width:90px; text-align:center;">الحالة</th>
                <th style="width:140px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="ctr-tbody">
              <tr><td colspan="9" style="text-align:center; padding:32px;"><span class="spin"></span> جاري تحميل العقود...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Contract Modal -->
    <div class="modal-overlay" id="contract-modal">
      <div class="modal modal-lg" style="max-width:850px; max-height:90vh; display:flex; flex-direction:column;">
        <div class="modal-header">
          <h3 class="modal-title" id="ctr-modal-title">➕ إنشاء عقد توريد جديد</h3>
          <button class="modal-close" onclick="closeModal('contract-modal')">×</button>
        </div>
        <div class="modal-body" style="flex:1; overflow-y:auto; padding:20px;">
          <input type="hidden" id="ctr-edit-id" />
          
          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>رقم العقد *</label>
              <input type="text" id="ctr-num" class="input mono" placeholder="CTR-2026-001" />
            </div>
            <div class="form-group" style="grid-column:span 2;">
              <label>العميل المتعاقد معه *</label>
              <select id="ctr-cust-id" class="input">
                <option value="">-- اختر العميل --</option>
              </select>
            </div>
          </div>

          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>تاريخ سريان العقد *</label>
              <input type="date" id="ctr-start" class="input" value="${todayStr()}" />
            </div>
            <div class="form-group">
              <label>تاريخ انتهاء العقد *</label>
              <input type="date" id="ctr-end" class="input" value="${nextYearStr()}" />
            </div>
            <div class="form-group">
              <label>شروط وضوابط السداد</label>
              <select id="ctr-terms" class="input">
                <option value="cash_on_delivery">نقدي عند الاستلام (COD)</option>
                <option value="credit_15">آجل 15 يوماً من الفاتورة</option>
                <option value="credit_30" selected>آجل 30 يوماً من الفاتورة</option>
                <option value="end_of_month">سداد نهاية كل شهر ميلادي</option>
                <option value="custom">شروط خاصة (حسب الملاحظات)</option>
              </select>
            </div>
          </div>

          <!-- Contract Items Section -->
          <div style="border-top:1px dashed var(--border); padding-top:14px; margin-top:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <div style="font-weight:800; font-size:13px; color:var(--text-0);">📦 الأصناف والأسعار المتفق عليها:</div>
              <button class="btn btn-secondary btn-sm" onclick="window.addContractLine()">+ إضافة صنف</button>
            </div>
            <div class="table-container" style="max-height:220px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:8px;">
              <table class="data-dense" style="margin:0;">
                <thead>
                  <tr>
                    <th>الصنف</th>
                    <th style="width:80px;">الوحدة</th>
                    <th style="width:100px;">سعر التوريد</th>
                    <th style="width:90px;">الكمية التقديرية</th>
                    <th style="width:110px;">الإجمالي التقديري</th>
                    <th style="width:40px;"></th>
                  </tr>
                </thead>
                <tbody id="ctr-lines-tbody"></tbody>
              </table>
            </div>
          </div>

          <div class="form-group mt-12">
            <label>بنود وشروط خاصة بالعقد (ملاحظات)</label>
            <textarea id="ctr-notes" class="input" rows="3" placeholder="مثال: يلتزم الطرف الأول بتوريد البضاعة خلال 24 ساعة من استلام أمر الشراء، ويلتزم الطرف الثاني بالسداد في الموعد المحدد..."></textarea>
          </div>

          <div id="ctr-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('contract-modal')">إلغاء</button>
          <button class="btn btn-primary" id="ctr-save-btn" onclick="window.saveContract()">💾 حفظ العقد</button>
        </div>
      </div>
    </div>

    <!-- Import Quotation Modal -->
    <div class="modal-overlay" id="import-quote-modal">
      <div class="modal" style="max-width:550px;">
        <div class="modal-header">
          <h3 class="modal-title">📑 تحويل عرض سعر إلى عقد رسمي</h3>
          <button class="modal-close" onclick="closeModal('import-quote-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <p style="font-size:12.5px; color:var(--text-2); margin-bottom:12px;">اختر عرض السعر المعتمد لنقل بنوده وأسعاره وتفاصيل العميل مباشرة إلى عقد جديد:</p>
          <div class="form-group mb-12">
            <label>عرض السعر *</label>
            <select id="import-quote-sel" class="input">
              <option value="">-- اختر عرض السعر --</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('import-quote-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.confirmImportQuote()">✨ تحويل لعقد الآن</button>
        </div>
      </div>
    </div>
  `;

  await loadData();
  setupGlobalFunctions();
}

async function loadData() {
  try {
    const [cList, custs, prods, quotes, invoices] = await Promise.all([
      getAll(COLS.customerContracts ? COLS.customerContracts() : "customerContracts").catch(() => []),
      getAll(COLS.customers(), [orderBy("name")]).catch(() => []),
      getAll(COLS.products(), [orderBy("name")]).catch(() => []),
      getAll(COLS.quotations ? COLS.quotations() : "quotations", [orderBy("date", "desc")]).catch(() => []),
      getAll(COLS.salesInvoices()).catch(() => [])
    ]);

    allContracts = cList;
    allCustomers = custs;
    allProducts = prods;
    allQuotations = quotes;
    allSalesInvoices = invoices;

    renderContractsTable();
    updateKPIs();
    populateCustomerDropdown();
  } catch (e) {
    console.warn("Failed to load contracts data:", e);
  }
}

function updateKPIs() {
  const today = todayStr();
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);
  const nextMonthStr = nextMonth.toISOString().slice(0, 10);

  const active = allContracts.filter(c => c.status !== "expired" && c.status !== "draft" && (!c.endDate || c.endDate >= today));
  const expiring = active.filter(c => c.endDate && c.endDate <= nextMonthStr);
  const totalVal = active.reduce((s, c) => s + (parseFloat(c.totalValue) || 0), 0);

  const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setT("ctr-kpi-total", allContracts.length);
  setT("ctr-kpi-active", active.length);
  setT("ctr-kpi-expiring", expiring.length);
  setT("ctr-kpi-val", formatCurrency(totalVal));
}

function populateCustomerDropdown() {
  const sel = document.getElementById("ctr-cust-id");
  if (!sel) return;
  sel.innerHTML = `<option value="">-- اختر العميل --</option>` +
    allCustomers.map(c => `<option value="${c.id}">${c.name} (${c.phone || "—"})</option>`).join("");
}

function renderContractsTable(list = allContracts) {
  const tbody = document.getElementById("ctr-tbody");
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد عقود مسجلة بعد</td></tr>`;
    return;
  }

  const today = new Date();

  tbody.innerHTML = list.map(c => {
    let daysLeft = "—";
    let isExpiringSoon = false;
    let isExpired = false;

    if (c.endDate) {
      const endD = new Date(c.endDate);
      const diffTime = endD - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        daysLeft = `<span style="color:var(--bad); font-weight:700;">منتهي (${Math.abs(diffDays)} يوم)</span>`;
        isExpired = true;
      } else if (diffDays <= 30) {
        daysLeft = `<span style="color:#F59E0B; font-weight:700;">${diffDays} يوم ⏳</span>`;
        isExpiringSoon = true;
      } else {
        daysLeft = `${diffDays} يوم`;
      }
    }

    const statusBadge = isExpired ? '<span class="badge bad">منتهي</span>'
      : isExpiringSoon ? '<span class="badge warn">قارب الانتهاء</span>'
      : (c.status === "draft" ? '<span class="badge neutral">مسودة</span>' : '<span class="badge good">نشط وساري</span>');

    const termsMap = {
      cash_on_delivery: "نقدي (COD)",
      credit_15: "آجل 15 يوم",
      credit_30: "آجل 30 يوم",
      end_of_month: "نهاية الشهر",
      custom: "شروط خاصة"
    };

    return `
      <tr>
        <td class="mono font-bold" style="color:var(--brand);">${c.contractNumber || c.number || c.id}</td>
        <td>
          <div style="font-weight:700; color:var(--text-0);">${c.customerName}</div>
          <div style="font-size:11px; color:var(--text-2);">${c.customerPhone || "—"}</div>
        </td>
        <td class="mono dim">${c.startDate || "—"}</td>
        <td class="mono font-semibold">${c.endDate || "—"}</td>
        <td style="font-size:12px;">${daysLeft}</td>
        <td style="font-size:11.5px;">${termsMap[c.paymentTerms] || c.paymentTerms || "آجل 30 يوم"}</td>
        <td class="mono font-bold" style="text-align:left;">${formatCurrency(c.totalValue || 0)}</td>
        <td style="text-align:center;">${statusBadge}</td>
        <td>
          <div class="row-actions" style="justify-content:center;">
            <button class="btn btn-icon sm btn-ghost" onclick="window.printContract('${c.id}')" title="طباعة العقد الرسمي">🖨️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="window.renewContract('${c.id}')" title="تجديد العقد لسنة جديدة">🔄</button>
            <button class="btn btn-icon sm btn-ghost" onclick="window.editContract('${c.id}')" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deleteContract('${c.id}')" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function setupGlobalFunctions() {
  window.filterContracts = () => {
    const q = (document.getElementById("ctr-search")?.value || "").trim().toLowerCase();
    const st = document.getElementById("ctr-status-filter")?.value || "";
    const today = todayStr();
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    const nextMonthStr = nextMonth.toISOString().slice(0, 10);

    const filtered = allContracts.filter(c => {
      const matchQ = !q || (c.contractNumber || "").toLowerCase().includes(q) || (c.customerName || "").toLowerCase().includes(q);
      let matchSt = true;
      if (st === "active") matchSt = (!c.endDate || c.endDate >= today) && c.status !== "draft";
      else if (st === "expiring") matchSt = c.endDate && c.endDate >= today && c.endDate <= nextMonthStr;
      else if (st === "expired") matchSt = c.endDate && c.endDate < today;
      else if (st === "draft") matchSt = c.status === "draft";
      return matchQ && matchSt;
    });

    renderContractsTable(filtered);
  };

  window.openContractModal = () => {
    document.getElementById("ctr-edit-id").value = "";
    document.getElementById("ctr-modal-title").textContent = "➕ إنشاء عقد توريد جديد";
    document.getElementById("ctr-num").value = `CTR-${new Date().getFullYear()}-${String(allContracts.length + 1).padStart(3, "0")}`;
    document.getElementById("ctr-cust-id").value = "";
    document.getElementById("ctr-start").value = todayStr();
    document.getElementById("ctr-end").value = nextYearStr();
    document.getElementById("ctr-terms").value = "credit_30";
    document.getElementById("ctr-notes").value = "";
    document.getElementById("ctr-modal-err").classList.add("hidden");
    
    contractLines = [];
    renderContractLines();
    openModal("contract-modal");
  };

  window.openImportQuoteModal = () => {
    const sel = document.getElementById("import-quote-sel");
    if (!sel) return;
    sel.innerHTML = `<option value="">-- اختر عرض السعر --</option>` +
      allQuotations.map(q => `<option value="${q.id}">عرض #${q.number || q.id} — ${q.customerName || q.clientName} (${formatCurrency(q.totalWithVat || q.total || 0)})</option>`).join("");
    openModal("import-quote-modal");
  };

  window.confirmImportQuote = () => {
    const qId = document.getElementById("import-quote-sel")?.value;
    const q = allQuotations.find(x => x.id === qId);
    if (!q) return;

    closeModal("import-quote-modal");

    // Open contract modal pre-filled
    window.openContractModal();
    document.getElementById("ctr-cust-id").value = q.customerId || "";
    document.getElementById("ctr-notes").value = `تم إنشاء العقد بناءً على عرض السعر رقم #${q.number || q.id}. ${q.notes || ""}`;

    contractLines = (q.lines || q.items || []).map(item => ({
      productId: item.productId || item.id,
      productName: item.name || item.productName,
      unit: item.unit || "حبة",
      unitPrice: parseFloat(item.unitPrice || item.price || 0),
      qty: parseFloat(item.qty || item.quantity || 100),
      total: (parseFloat(item.unitPrice || item.price || 0)) * (parseFloat(item.qty || item.quantity || 100))
    }));

    renderContractLines();
  };

  window.renewContract = async (id) => {
    const c = allContracts.find(x => x.id === id);
    if (!c) return;

    if (!confirm(`هل تريد تجديد العقد "${c.contractNumber || c.id}" لمدة سنة إضافية؟`)) return;

    const newStart = c.endDate || todayStr();
    const endD = new Date(newStart);
    endD.setFullYear(endD.getFullYear() + 1);
    const newEnd = endD.toISOString().slice(0, 10);

    const newDoc = {
      ...c,
      contractNumber: `CTR-${new Date().getFullYear()}-${String(allContracts.length + 1).padStart(3, "0")}`,
      number: `CTR-${new Date().getFullYear()}-${String(allContracts.length + 1).padStart(3, "0")}`,
      startDate: newStart,
      endDate: newEnd,
      status: "active",
      notes: `تجديد للعقد السابق (${c.contractNumber || c.id}). ${c.notes || ""}`
    };
    delete newDoc.id;

    try {
      await create("customerContracts", newDoc);
      alert("✅ تم تجديد العقد بنجاح!");
      await loadData();
    } catch (e) {
      alert("فشل التجديد: " + e.message);
    }
  };

  window.addContractLine = (prodId = "", price = 0, qty = 100) => {
    contractLines.push({
      productId: prodId,
      productName: "",
      unit: "حبة",
      unitPrice: price,
      qty: qty,
      total: price * qty
    });
    renderContractLines();
  };

  window.removeContractLine = (idx) => {
    contractLines.splice(idx, 1);
    renderContractLines();
  };

  window.updateContractLine = (idx, field, val) => {
    const l = contractLines[idx];
    if (!l) return;
    if (field === "productId") {
      l.productId = val;
      const p = allProducts.find(x => x.id === val);
      if (p) {
        l.productName = p.name;
        l.unit = p.unit || "حبة";
        l.unitPrice = p.salePrice || p.price || 0;
        l.total = l.unitPrice * l.qty;
      }
    } else if (field === "unitPrice") {
      l.unitPrice = parseFloat(val) || 0;
      l.total = l.unitPrice * l.qty;
    } else if (field === "qty") {
      l.qty = parseFloat(val) || 0;
      l.total = l.unitPrice * l.qty;
    }
    renderContractLines();
  };

  function renderContractLines() {
    const tbody = document.getElementById("ctr-lines-tbody");
    if (!tbody) return;

    if (!contractLines.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:16px; color:var(--text-2); font-size:12px;">لم يتم إضافة أصناف للعقد بعد</td></tr>`;
      return;
    }

    tbody.innerHTML = contractLines.map((l, i) => `
      <tr>
        <td>
          <select class="input" style="height:32px; font-size:12px; padding:2px 8px;" onchange="window.updateContractLine(${i}, 'productId', this.value)">
            <option value="">-- اختر الصنف --</option>
            ${allProducts.map(p => `<option value="${p.id}" ${p.id === l.productId ? "selected" : ""}>${p.name}</option>`).join("")}
          </select>
        </td>
        <td style="font-size:11px; color:var(--text-2); text-align:center;">${l.unit || "حبة"}</td>
        <td>
          <input type="number" class="input mono" style="height:32px; font-size:12px; width:90px;" value="${l.unitPrice}" min="0" step="0.1" onchange="window.updateContractLine(${i}, 'unitPrice', this.value)" />
        </td>
        <td>
          <input type="number" class="input mono" style="height:32px; font-size:12px; width:80px;" value="${l.qty}" min="1" onchange="window.updateContractLine(${i}, 'qty', this.value)" />
        </td>
        <td class="mono font-bold">${formatCurrency(l.total || 0)}</td>
        <td>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.removeContractLine(${i})">✕</button>
        </td>
      </tr>
    `).join("");
  }

  window.saveContract = async () => {
    const errEl = document.getElementById("ctr-modal-err");
    errEl.classList.add("hidden");

    const custId = document.getElementById("ctr-cust-id").value;
    const cust = allCustomers.find(c => c.id === custId);
    const num = document.getElementById("ctr-num").value.trim();
    const start = document.getElementById("ctr-start").value;
    const end = document.getElementById("ctr-end").value;
    const terms = document.getElementById("ctr-terms").value;
    const notes = document.getElementById("ctr-notes").value.trim();
    const editId = document.getElementById("ctr-edit-id").value;

    if (!custId) { errEl.textContent = "يرجى اختيار العميل"; errEl.classList.remove("hidden"); return; }
    if (!num) { errEl.textContent = "يرجى كتابة رقم العقد"; errEl.classList.remove("hidden"); return; }

    const totalVal = contractLines.reduce((s, l) => s + (l.total || 0), 0);

    const docData = {
      contractNumber: num,
      number: num,
      customerId: custId,
      customerName: cust ? cust.name : "عميل",
      customerPhone: cust ? cust.phone : "",
      customerCr: cust ? (cust.crNumber || cust.vatNumber || "") : "",
      startDate: start,
      endDate: end,
      paymentTerms: terms,
      notes: notes,
      lines: contractLines,
      totalValue: totalVal,
      status: "active"
    };

    try {
      if (editId) {
        await update("customerContracts", editId, docData);
      } else {
        await create("customerContracts", docData);
      }
      closeModal("contract-modal");
      await loadData();
    } catch (e) {
      errEl.textContent = e.message;
      errEl.classList.remove("hidden");
    }
  };

  window.editContract = (id) => {
    const c = allContracts.find(x => x.id === id);
    if (!c) return;

    document.getElementById("ctr-edit-id").value = c.id;
    document.getElementById("ctr-modal-title").textContent = "✏️ تعديل العقد " + (c.contractNumber || c.id);
    document.getElementById("ctr-num").value = c.contractNumber || c.number || "";
    document.getElementById("ctr-cust-id").value = c.customerId || "";
    document.getElementById("ctr-start").value = c.startDate || todayStr();
    document.getElementById("ctr-end").value = c.endDate || nextYearStr();
    document.getElementById("ctr-terms").value = c.paymentTerms || "credit_30";
    document.getElementById("ctr-notes").value = c.notes || "";
    
    contractLines = c.lines || [];
    renderContractLines();
    openModal("contract-modal");
  };

  window.deleteContract = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا العقد نهائياً؟")) return;
    try {
      await remove("customerContracts", id);
      await loadData();
    } catch (e) {
      alert("فشل الحذف: " + e.message);
    }
  };

  window.printContract = (id) => {
    const c = allContracts.find(x => x.id === id);
    if (!c) return;
    const co = window.ERP_COMPANY || { name: "مؤسسة إدهام للمواد الغذائية", crNumber: "1010000000", vatNumber: "300000000000003" };

    const win = window.open("", "_blank");
    win.document.write(`
      <html dir="rtl">
      <head>
        <title>عقد توريد مواد غذائية — ${c.customerName}</title>
        <style>
          body { font-family:'Cairo',sans-serif; padding:40px; line-height:1.8; color:#1e293b; font-size:13.5px; }
          .header { text-align:center; border-bottom:2px solid #0f172a; padding-bottom:16px; margin-bottom:24px; }
          .contract-title { font-size:20px; font-weight:800; color:#0f172a; margin-top:6px; }
          .parties { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin-bottom:20px; }
          table { width:100%; border-collapse:collapse; margin:20px 0; font-size:12.5px; }
          th, td { border:1px solid #cbd5e1; padding:8px 12px; text-align:right; }
          th { background:#f1f5f9; }
          .signatures { display:flex; justify-content:space-between; margin-top:60px; padding:0 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${co.name}</h2>
          <div class="contract-title">عقد اتفاق وتوريد مواد غذائية</div>
          <div style="font-size:12px; color:#64748b;">رقم العقد: ${c.contractNumber || c.number} | التاريخ: ${c.startDate}</div>
        </div>

        <div class="parties">
          <p><b>الطرف الأول (المورّد):</b> ${co.name} — س.ت: ${co.crNumber || "—"} — الرقم الضريبي: ${co.vatNumber || "—"}</p>
          <p><b>الطرف الثاني (العميل):</b> ${c.customerName} — الجوال: ${c.customerPhone || "—"} — س.ت / ضريبي: ${c.customerCr || "—"}</p>
        </div>

        <p><b>تمهيد:</b> حيث أن الطرف الأول مؤسسة متخصصة في توريد وتوزيع المواد الغذائية، ورغب الطرف الثاني في التعاقد لتوريد احتياجاته وفق البنود التالية:</p>

        <h4>البند الأول: موضوع العقد والأسعار</h4>
        <p>يلتزم الطرف الأول بتوريد الأصناف الموضحة أدناه للطرف الثاني بالأسعار المتفق عليها طوال فترة سريان العقد:</p>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>الصنف والمواصفات</th>
              <th>الوحدة</th>
              <th>سعر التوريد المعتمد (ر.س)</th>
              <th>الكمية التقديرية</th>
            </tr>
          </thead>
          <tbody>
            ${(c.lines || []).map((l, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><b>${l.productName}</b></td>
                <td>${l.unit || "حبة"}</td>
                <td>${formatCurrency(l.unitPrice)}</td>
                <td>${l.qty || "—"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <h4>البند الثاني: مدة العقد والسريان</h4>
        <p>يسري هذا العقد اعتباراً من تاريخ <b>${c.startDate}</b> وحتى تاريخ <b>${c.endDate}</b> ويجدد تلقائياً باتفاق الطرفين كتابياً.</p>

        <h4>البند الثالث: شروط وضوابط السداد</h4>
        <p>اتفق الطرفان على أن تكون طريقة السداد: <b>${c.paymentTerms === "cash_on_delivery" ? "نقداً عند الاستلام" : (c.paymentTerms === "credit_15" ? "آجل 15 يوماً من إصدار الفاتورة" : "آجل 30 يوماً من إصدار الفاتورة")}</b>.</p>

        ${c.notes ? `<h4>البند الرابع: شروط خاصة</h4><p>${c.notes}</p>` : ""}

        <div class="signatures">
          <div>
            <b>الطرف الأول (المورّد)</b><br>
            الاسم: ____________________<br>
            التوقيع والختم: ______________
          </div>
          <div>
            <b>الطرف الثاني (العميل)</b><br>
            الاسم: ____________________<br>
            التوقيع والختم: ______________
          </div>
        </div>

        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `);
    win.document.close();
  };

  window.exportContractsExcel = () => {
    const data = allContracts.map(c => ({
      "رقم العقد": c.contractNumber || c.number,
      "العميل": c.customerName,
      "الهاتف": c.customerPhone,
      "تاريخ البدء": c.startDate,
      "تاريخ الانتهاء": c.endDate,
      "شروط السداد": c.paymentTerms,
      "القيمة التقديرية": c.totalValue || 0,
      "الحالة": c.status
    }));
    exportToExcel(data, "عقود_العملاء");
  };
}
