// ============================================================
// IDHAM ERP — شكاوى وتذاكر العملاء المطورة
// Customer Complaints, Service Tickets & Compensation Module
// ============================================================
import { COLS, getAll, create, update, remove, orderBy } from "../utils/db.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

let allComplaints = [];
let allCustomers = [];

const todayStr = () => new Date().toISOString().slice(0, 10);

const COMPLAINT_TYPES = [
  { id: "damaged_goods", label: "📦 تلف أو عيب في البضاعة", icon: "📦" },
  { id: "delivery_delay", label: "🚚 تأخر في موعد التسليم", icon: "🚚" },
  { id: "invoice_dispute", label: "🧾 خلاف في الفاتورة أو السعر", icon: "🧾" },
  { id: "missing_items", label: "🔍 نقص في الكميات المسلمة", icon: "🔍" },
  { id: "rep_behavior", label: "🚗 ملاحظة على تعامل المندوب", icon: "🚗" },
  { id: "other", label: "📌 أخرى", icon: "📌" }
];

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:260px;">
        <input type="text" id="cmp-search" class="input" placeholder="🔍 بحث في الشكاوى (الرقم / العميل)..." oninput="window.filterComplaints(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="cmp-status-filter" onchange="window.filterComplaints()">
          <option value="">كل الحالات</option>
          <option value="open">🔴 جديدة (مفتوحة)</option>
          <option value="in_progress">🟡 قيد المعالجة</option>
          <option value="resolved">🟢 تم الحل والتعويض</option>
          <option value="closed">⚪ مغلقة</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>النوع</label>
        <select id="cmp-type-filter" onchange="window.filterComplaints()">
          <option value="">كل الأنواع</option>
          ${COMPLAINT_TYPES.map(t => `<option value="${t.id}">${t.label}</option>`).join("")}
        </select>
      </div>
      <div class="filter-select-group">
        <label>الأولوية</label>
        <select id="cmp-priority-filter" onchange="window.filterComplaints()">
          <option value="">كل الأولويات</option>
          <option value="urgent">🔥 عاجلة جداً</option>
          <option value="high">⚡ مرتفعة</option>
          <option value="normal">🔹 عادية</option>
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportComplaintsExcel()">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openComplaintModal()">+ تسجيل شكوى جديدة</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Stats -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي التذاكر</div>
          <div class="mono" id="cmp-kpi-total" style="font-size:20px; font-weight:900; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(239,68,68,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#EF4444; font-weight:700;">شكاوى مفتوحة / عاجلة</div>
          <div class="mono" id="cmp-kpi-open" style="font-size:20px; font-weight:900; color:#EF4444; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#F59E0B; font-weight:700;">قيد المعالجة والتحقيق</div>
          <div class="mono" id="cmp-kpi-progress" style="font-size:20px; font-weight:900; color:#F59E0B; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">تم الحل وإرضاء العميل</div>
          <div class="mono" id="cmp-kpi-resolved" style="font-size:20px; font-weight:900; color:#10B981; margin-top:4px;">0</div>
        </div>
      </div>

      <!-- Complaints Table -->
      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th style="width:100px;">رقم التذكرة</th>
                <th>العميل</th>
                <th style="width:100px;">التاريخ</th>
                <th>نوع الشكوى</th>
                <th style="width:90px; text-align:center;">الأولوية</th>
                <th>تفاصيل المشكلة</th>
                <th style="width:110px; text-align:left;">مبلغ التعويض</th>
                <th style="width:105px; text-align:center;">الحالة</th>
                <th style="width:130px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="cmp-tbody">
              <tr><td colspan="9" style="text-align:center; padding:32px;"><span class="spin"></span> جاري تحميل الشكاوى...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Complaint Modal -->
    <div class="modal-overlay" id="complaint-modal">
      <div class="modal" style="max-width:640px;">
        <div class="modal-header">
          <h3 class="modal-title" id="cmp-modal-title">➕ تسجيل شكوى عميل</h3>
          <button class="modal-close" onclick="closeModal('complaint-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="cmp-edit-id" />
          
          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>العميل صاحب الشكوى *</label>
              <select id="cmp-cust-id" class="input">
                <option value="">-- اختر العميل --</option>
              </select>
            </div>
            <div class="form-group">
              <label>تاريخ الشكوى *</label>
              <input type="date" id="cmp-date" class="input" value="${todayStr()}" />
            </div>
          </div>

          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>نوع الشكوى *</label>
              <select id="cmp-type" class="input">
                ${COMPLAINT_TYPES.map(t => `<option value="${t.id}">${t.label}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label>درجة الأولوية</label>
              <select id="cmp-priority" class="input">
                <option value="urgent">🔥 عاجلة جداً</option>
                <option value="high">⚡ مرتفعة</option>
                <option value="normal" selected>🔹 عادية</option>
              </select>
            </div>
            <div class="form-group">
              <label>رقم الفاتورة المرتبطة</label>
              <input type="text" id="cmp-inv-ref" class="input mono" placeholder="INV-00123" />
            </div>
          </div>

          <div class="form-group mb-12">
            <label>تفاصيل الشكوى / اعتراض العميل *</label>
            <textarea id="cmp-details" class="input" rows="3" placeholder="اشرح المشكلة بالتفصيل (مثل: استلم العميل 5 كراتين علب مكسورة)..."></textarea>
          </div>

          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>حالة التذكرة</label>
              <select id="cmp-status" class="input">
                <option value="open">🔴 جديدة (مفتوحة)</option>
                <option value="in_progress">🟡 قيد المعالجة والتحقيق</option>
                <option value="resolved">🟢 تم الحل والتعويض</option>
                <option value="closed">⚪ مغلقة</option>
              </select>
            </div>
            <div class="form-group">
              <label>مبلغ التعويض / الخصم المقترح (ر.س)</label>
              <input type="number" id="cmp-compensation" class="input mono" placeholder="0.00" min="0" step="0.5" />
            </div>
          </div>

          <div class="form-group">
            <label>الإجراء المتخذ والحل النهائي</label>
            <textarea id="cmp-resolution" class="input" rows="2" placeholder="ما تم اتخاذه (مثال: تم إرسال بضاعة بديلة مجانية مع المندوب ومصادقة الحساب)..."></textarea>
          </div>

          <div id="cmp-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('complaint-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveComplaint()">💾 حفظ الشكوى</button>
        </div>
      </div>
    </div>
  `;

  await loadData();
  setupGlobalFunctions();
}

async function loadData() {
  try {
    const [cmps, custs] = await Promise.all([
      getAll(COLS.customerComplaints ? COLS.customerComplaints() : "customerComplaints", [orderBy("createdAt", "desc")]).catch(() => []),
      getAll(COLS.customers(), [orderBy("name")]).catch(() => [])
    ]);

    allComplaints = cmps;
    allCustomers = custs;

    populateCustomerDropdown();
    updateKPIs();
    renderComplaintsTable();
  } catch (e) {
    console.warn("Failed to load complaints data:", e);
  }
}

function updateKPIs() {
  const open = allComplaints.filter(c => c.status === "open" || c.priority === "urgent");
  const inProgress = allComplaints.filter(c => c.status === "in_progress");
  const resolved = allComplaints.filter(c => c.status === "resolved" || c.status === "closed");

  const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setT("cmp-kpi-total", allComplaints.length);
  setT("cmp-kpi-open", open.length);
  setT("cmp-kpi-progress", inProgress.length);
  setT("cmp-kpi-resolved", resolved.length);
}

function populateCustomerDropdown() {
  const sel = document.getElementById("cmp-cust-id");
  if (!sel) return;
  sel.innerHTML = `<option value="">-- اختر العميل --</option>` +
    allCustomers.map(c => `<option value="${c.id}">${c.name} (${c.phone || "—"})</option>`).join("");
}

function renderComplaintsTable(list = allComplaints) {
  const tbody = document.getElementById("cmp-tbody");
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد شكاوى مسجلة</td></tr>`;
    return;
  }

  const priorityBadges = {
    urgent: '<span class="badge bad" style="font-weight:800;">🔥 عاجلة</span>',
    high: '<span class="badge warn" style="font-weight:700;">⚡ مرتفعة</span>',
    normal: '<span class="badge neutral">عادية</span>'
  };

  const statusBadges = {
    open: '<span class="badge bad">مفتوحة</span>',
    in_progress: '<span class="badge warn">قيد المعالجة</span>',
    resolved: '<span class="badge good">تم الحل</span>',
    closed: '<span class="badge neutral">مغلقة</span>'
  };

  tbody.innerHTML = list.map(c => {
    const typeObj = COMPLAINT_TYPES.find(t => t.id === c.type);
    return `
      <tr>
        <td class="mono font-bold" style="color:var(--brand);">${c.ticketNumber || c.number || c.id}</td>
        <td>
          <div style="font-weight:700; color:var(--text-0);">${c.customerName}</div>
          <div style="font-size:11px; color:var(--text-2);">${c.customerPhone || "—"}</div>
        </td>
        <td class="mono dim">${c.date || "—"}</td>
        <td style="font-size:12px; font-weight:600;">${typeObj ? typeObj.label : (c.type || "عامة")}</td>
        <td style="text-align:center;">${priorityBadges[c.priority] || priorityBadges.normal}</td>
        <td style="font-size:12px; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${c.details || ''}">
          ${c.details || "—"}
        </td>
        <td class="mono font-bold" style="text-align:left; color:${(c.compensationAmount||0)>0?'#10B981':'var(--text-dim)'};">
          ${(c.compensationAmount||0)>0 ? formatCurrency(c.compensationAmount) : '—'}
        </td>
        <td style="text-align:center;">${statusBadges[c.status] || statusBadges.open}</td>
        <td>
          <div class="row-actions" style="justify-content:center;">
            <button class="btn btn-icon sm btn-ghost" onclick="window.editComplaint('${c.id}')" title="تعديل ومعالجة">✏️</button>
            <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deleteComplaint('${c.id}')" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function setupGlobalFunctions() {
  window.filterComplaints = () => {
    const q = (document.getElementById("cmp-search")?.value || "").trim().toLowerCase();
    const st = document.getElementById("cmp-status-filter")?.value || "";
    const pr = document.getElementById("cmp-priority-filter")?.value || "";
    const tp = document.getElementById("cmp-type-filter")?.value || "";

    const filtered = allComplaints.filter(c => {
      const mQ = !q || (c.ticketNumber || "").toLowerCase().includes(q) || (c.customerName || "").toLowerCase().includes(q) || (c.details || "").toLowerCase().includes(q);
      const mS = !st || c.status === st;
      const mP = !pr || c.priority === pr;
      const mT = !tp || c.type === tp;
      return mQ && mS && mP && mT;
    });

    renderComplaintsTable(filtered);
  };

  window.openComplaintModal = () => {
    document.getElementById("cmp-edit-id").value = "";
    document.getElementById("cmp-modal-title").textContent = "➕ تسجيل شكوى عميل";
    document.getElementById("cmp-cust-id").value = "";
    document.getElementById("cmp-date").value = todayStr();
    document.getElementById("cmp-type").value = "damaged_goods";
    document.getElementById("cmp-priority").value = "normal";
    document.getElementById("cmp-inv-ref").value = "";
    document.getElementById("cmp-details").value = "";
    document.getElementById("cmp-status").value = "open";
    document.getElementById("cmp-compensation").value = "";
    document.getElementById("cmp-resolution").value = "";
    document.getElementById("cmp-modal-err").classList.add("hidden");
    openModal("complaint-modal");
  };

  window.saveComplaint = async () => {
    const err = document.getElementById("cmp-modal-err");
    err.classList.add("hidden");

    const custId = document.getElementById("cmp-cust-id").value;
    const cust = allCustomers.find(c => c.id === custId);
    const details = document.getElementById("cmp-details").value.trim();
    const editId = document.getElementById("cmp-edit-id").value;

    if (!custId) { err.textContent = "يرجى اختيار العميل"; err.classList.remove("hidden"); return; }
    if (!details) { err.textContent = "يرجى كتابة تفاصيل الشكوى"; err.classList.remove("hidden"); return; }

    const tktNum = editId ? undefined : `TKT-${new Date().getFullYear()}-${String(allComplaints.length + 1).padStart(4, "0")}`;

    const data = {
      customerId: custId,
      customerName: cust ? cust.name : "عميل",
      customerPhone: cust ? cust.phone : "",
      date: document.getElementById("cmp-date").value,
      type: document.getElementById("cmp-type").value,
      priority: document.getElementById("cmp-priority").value,
      invoiceRef: document.getElementById("cmp-inv-ref").value.trim(),
      details: details,
      status: document.getElementById("cmp-status").value,
      compensationAmount: parseFloat(document.getElementById("cmp-compensation").value) || 0,
      resolution: document.getElementById("cmp-resolution").value.trim()
    };

    if (tktNum) data.ticketNumber = tktNum;

    try {
      if (editId) {
        await update("customerComplaints", editId, data);
      } else {
        await create("customerComplaints", data);
      }
      closeModal("complaint-modal");
      await loadData();
    } catch (e) {
      err.textContent = e.message;
      err.classList.remove("hidden");
    }
  };

  window.editComplaint = (id) => {
    const c = allComplaints.find(x => x.id === id);
    if (!c) return;

    document.getElementById("cmp-edit-id").value = c.id;
    document.getElementById("cmp-modal-title").textContent = "✏️ معالجة الشكوى " + (c.ticketNumber || c.id);
    document.getElementById("cmp-cust-id").value = c.customerId || "";
    document.getElementById("cmp-date").value = c.date || todayStr();
    document.getElementById("cmp-type").value = c.type || "damaged_goods";
    document.getElementById("cmp-priority").value = c.priority || "normal";
    document.getElementById("cmp-inv-ref").value = c.invoiceRef || "";
    document.getElementById("cmp-details").value = c.details || "";
    document.getElementById("cmp-status").value = c.status || "open";
    document.getElementById("cmp-compensation").value = c.compensationAmount || "";
    document.getElementById("cmp-resolution").value = c.resolution || "";
    document.getElementById("cmp-modal-err").classList.add("hidden");
    openModal("complaint-modal");
  };

  window.deleteComplaint = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذه الشكوى؟")) return;
    try {
      await remove("customerComplaints", id);
      await loadData();
    } catch (e) {
      alert("فشل الحذف: " + e.message);
    }
  };

  window.exportComplaintsExcel = () => {
    const data = allComplaints.map(c => ({
      "رقم التذكرة": c.ticketNumber || c.id,
      "العميل": c.customerName,
      "الهاتف": c.customerPhone,
      "التاريخ": c.date,
      "النوع": COMPLAINT_TYPES.find(t => t.id === c.type)?.label || c.type,
      "الأولوية": c.priority,
      "الحالة": c.status,
      "التفاصيل": c.details,
      "الحل": c.resolution || "—",
      "التعويض": c.compensationAmount || 0
    }));
    exportToExcel(data, "شكاوى_العملاء");
  };
}
