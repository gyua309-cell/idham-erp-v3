// ============================================================
// IDHAM ERP — سجل وملاحظات العملاء
// Customer Activity Logs & Pinned Warning Notes Module
// ============================================================
import { COLS, getAll, create, update, remove, orderBy } from "../utils/db.js";
import { formatDate } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

let allNotes = [];
let allCustomers = [];

const todayStr = () => new Date().toISOString().slice(0, 10);

const NOTE_TYPES = [
  { id: "warning", label: "⚠️ تحذير ائتماني وسداد", color: "#EF4444", bg: "rgba(239,68,68,0.08)" },
  { id: "payment_deal", label: "🤝 اتفاقية دفع وسداد", color: "#10B981", bg: "rgba(16,185,129,0.08)" },
  { id: "delivery", label: "🚚 مواعيد وملاحظات توصيل", color: "#3B82F6", bg: "rgba(59,130,246,0.08)" },
  { id: "visit", label: "🚗 زيارة ميدانية ومتابعة", color: "#8B5CF6", bg: "rgba(139,92,246,0.08)" },
  { id: "general", label: "📝 ملاحظة عامة", color: "#6B7280", bg: "rgba(107,114,128,0.08)" }
];

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:280px;">
        <input type="text" id="not-search" class="input" placeholder="🔍 بحث في نص الملاحظة أو اسم العميل..." oninput="window.filterCustomerNotes(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>النوع</label>
        <select id="not-type-filter" onchange="window.filterCustomerNotes()">
          <option value="">كل الأنواع</option>
          ${NOTE_TYPES.map(t => `<option value="${t.id}">${t.label}</option>`).join("")}
        </select>
      </div>
      <div class="filter-select-group">
        <label>المثبتة</label>
        <select id="not-pinned-filter" onchange="window.filterCustomerNotes()">
          <option value="">الكل</option>
          <option value="pinned">📌 التحذيرات المثبتة فقط</option>
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportNotesExcel()">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openCustomerNoteModal()">+ تدوين ملاحظة جديدة</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Stats -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي الملاحظات</div>
          <div class="mono" id="not-kpi-total" style="font-size:20px; font-weight:900; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(239,68,68,0.25); border-radius:12px;">
          <div style="font-size:11px; color:#EF4444; font-weight:700;">📌 تحذيرات مثبتة هامة</div>
          <div class="mono" id="not-kpi-pinned" style="font-size:20px; font-weight:900; color:#EF4444; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">اتفاقيات سداد مسجلة</div>
          <div class="mono" id="not-kpi-payment" style="font-size:20px; font-weight:900; color:#10B981; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(99,102,241,0.2); border-radius:12px;">
          <div style="font-size:11px; color:var(--brand); font-weight:700;">ملاحظات الزيارات والمتابعة</div>
          <div class="mono" id="not-kpi-visits" style="font-size:20px; font-weight:900; color:var(--brand); margin-top:4px;">0</div>
        </div>
      </div>

      <!-- Notes Grid / Feed -->
      <div id="notes-feed-container" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:14px;">
        <div style="grid-column:1/-1; text-align:center; padding:32px;"><span class="spin"></span> جاري تحميل الملاحظات...</div>
      </div>
    </div>

    <!-- Note Modal -->
    <div class="modal-overlay" id="note-modal">
      <div class="modal" style="max-width:550px;">
        <div class="modal-header">
          <h3 class="modal-title" id="not-modal-title">➕ تدوين ملاحظة جديدة</h3>
          <button class="modal-close" onclick="closeModal('note-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="not-edit-id" />
          
          <div class="form-group mb-12">
            <label>العميل المعني بالملاحظة *</label>
            <select id="not-cust-id" class="input">
              <option value="">-- اختر العميل --</option>
            </select>
          </div>

          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>نوع الملاحظة *</label>
              <select id="not-type" class="input">
                ${NOTE_TYPES.map(t => `<option value="${t.id}">${t.label}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label>التاريخ *</label>
              <input type="date" id="not-date" class="input" value="${todayStr()}" />
            </div>
          </div>

          <div class="form-group mb-12">
            <label>نص الملاحظة والتفاصيل *</label>
            <textarea id="not-content" class="input" rows="4" placeholder="اكتب تفاصيل الملاحظة، مثلاً: تم الاتفاق على تسليم بضاعة الأسبوع القادم وسداد 50% نقداً..."></textarea>
          </div>

          <div class="form-group mb-12" style="background:rgba(239,68,68,0.06); padding:12px 14px; border-radius:8px; border:1px solid rgba(239,68,68,0.15);">
            <label class="checkbox-label" style="display:flex; align-items:center; gap:8px; cursor:pointer;">
              <input type="checkbox" id="not-pinned" />
              <span style="font-weight:800; color:#EF4444; font-size:13px;">📌 تثبيت كملاحظة تحذيرية هامة (تظهر للمحاسب والمندوب عند الفوترة)</span>
            </label>
          </div>

          <div id="not-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('note-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveCustomerNote()">💾 حفظ الملاحظة</button>
        </div>
      </div>
    </div>
  `;

  await loadData();
  setupGlobalFunctions(user);
}

async function loadData() {
  try {
    const [notes, custs] = await Promise.all([
      getAll(COLS.customerNotes ? COLS.customerNotes() : "customerNotes", [orderBy("date", "desc")]).catch(() => []),
      getAll(COLS.customers(), [orderBy("name")]).catch(() => [])
    ]);

    allNotes = notes;
    allCustomers = custs;

    populateCustomerDropdown();
    updateKPIs();
    renderNotesFeed();
  } catch (e) {
    console.warn("Failed to load customer notes:", e);
  }
}

function updateKPIs() {
  const pinned = allNotes.filter(n => n.isPinned);
  const payments = allNotes.filter(n => n.type === "payment_deal");
  const visits = allNotes.filter(n => n.type === "visit");

  const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setT("not-kpi-total", allNotes.length);
  setT("not-kpi-pinned", pinned.length);
  setT("not-kpi-payment", payments.length);
  setT("not-kpi-visits", visits.length);
}

function populateCustomerDropdown() {
  const sel = document.getElementById("not-cust-id");
  if (!sel) return;
  sel.innerHTML = `<option value="">-- اختر العميل --</option>` +
    allCustomers.map(c => `<option value="${c.id}">${c.name} (${c.phone || "—"})</option>`).join("");
}

function renderNotesFeed(list = allNotes) {
  const feed = document.getElementById("notes-feed-container");
  if (!feed) return;

  if (!list.length) {
    feed.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:48px; color:var(--text-2);">لا توجد ملاحظات مسجلة بعد</div>`;
    return;
  }

  feed.innerHTML = list.map(n => {
    const typeObj = NOTE_TYPES.find(t => t.id === n.type) || NOTE_TYPES[4];
    return `
      <div class="card" style="padding:16px; border:1.5px solid ${n.isPinned ? '#EF4444' : 'var(--border-soft)'}; background:${n.isPinned ? 'rgba(239,68,68,0.03)' : 'var(--bg-card)'}; border-radius:12px; display:flex; flex-direction:column; position:relative;">
        ${n.isPinned ? `
          <div style="position:absolute; top:12px; left:12px; font-size:11px; background:#EF4444; color:#fff; padding:2px 8px; border-radius:12px; font-weight:800;">
            📌 تحذير مثبت
          </div>
        ` : ""}
        
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <span class="badge" style="background:${typeObj.bg}; color:${typeObj.color}; font-weight:700;">${typeObj.label}</span>
          <span class="mono" style="font-size:11px; color:var(--text-3);">${n.date || "—"}</span>
        </div>

        <div style="font-weight:800; font-size:14px; color:var(--text-0); margin-bottom:6px;">👤 ${n.customerName}</div>
        
        <div style="font-size:13px; color:var(--text-1); line-height:1.6; flex:1; white-space:pre-wrap; margin-bottom:12px;">${n.content}</div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed var(--border-soft); padding-top:10px; margin-top:auto; font-size:11px; color:var(--text-3);">
          <span>✍️ كتبها: ${n.authorName || "الإدارة"}</span>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-icon sm btn-ghost" onclick="window.editCustomerNote('${n.id}')" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deleteCustomerNote('${n.id}')" title="حذف">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function setupGlobalFunctions(currentUser) {
  window.filterCustomerNotes = () => {
    const q = (document.getElementById("not-search")?.value || "").trim().toLowerCase();
    const type = document.getElementById("not-type-filter")?.value || "";
    const pin = document.getElementById("not-pinned-filter")?.value || "";

    const filtered = allNotes.filter(n => {
      const mQ = !q || (n.customerName || "").toLowerCase().includes(q) || (n.content || "").toLowerCase().includes(q);
      const mT = !type || n.type === type;
      const mP = !pin || n.isPinned;
      return mQ && mT && mP;
    });

    renderNotesFeed(filtered);
  };

  window.openCustomerNoteModal = () => {
    document.getElementById("not-edit-id").value = "";
    document.getElementById("not-modal-title").textContent = "➕ تدوين ملاحظة جديدة";
    document.getElementById("not-cust-id").value = "";
    document.getElementById("not-type").value = "general";
    document.getElementById("not-date").value = todayStr();
    document.getElementById("not-content").value = "";
    document.getElementById("not-pinned").checked = false;
    document.getElementById("not-modal-err").classList.add("hidden");
    openModal("note-modal");
  };

  window.saveCustomerNote = async () => {
    const err = document.getElementById("not-modal-err");
    err.classList.add("hidden");

    const custId = document.getElementById("not-cust-id").value;
    const cust = allCustomers.find(c => c.id === custId);
    const content = document.getElementById("not-content").value.trim();
    const editId = document.getElementById("not-edit-id").value;

    if (!custId) { err.textContent = "يرجى اختيار العميل"; err.classList.remove("hidden"); return; }
    if (!content) { err.textContent = "الرجاء كتابة نص الملاحظة"; err.classList.remove("hidden"); return; }

    const isPinned = document.getElementById("not-pinned").checked;

    const data = {
      customerId: custId,
      customerName: cust ? cust.name : "عميل",
      customerPhone: cust ? cust.phone : "",
      date: document.getElementById("not-date").value,
      type: document.getElementById("not-type").value,
      content: content,
      isPinned: isPinned,
      authorName: currentUser?.displayName || currentUser?.name || "الإدارة"
    };

    try {
      if (editId) {
        await update("customerNotes", editId, data);
      } else {
        await create("customerNotes", data);
      }

      // If note is pinned warning, store it on the customer doc directly for fast invoice warnings!
      if (isPinned) {
        await update("customers", custId, { pinnedWarningNote: content });
      } else {
        await update("customers", custId, { pinnedWarningNote: null });
      }

      closeModal("note-modal");
      await loadData();
    } catch (e) {
      err.textContent = e.message;
      err.classList.remove("hidden");
    }
  };

  window.editCustomerNote = (id) => {
    const n = allNotes.find(x => x.id === id);
    if (!n) return;

    document.getElementById("not-edit-id").value = n.id;
    document.getElementById("not-modal-title").textContent = "✏️ تعديل الملاحظة — " + n.customerName;
    document.getElementById("not-cust-id").value = n.customerId || "";
    document.getElementById("not-type").value = n.type || "general";
    document.getElementById("not-date").value = n.date || todayStr();
    document.getElementById("not-content").value = n.content || "";
    document.getElementById("not-pinned").checked = !!n.isPinned;
    document.getElementById("not-modal-err").classList.add("hidden");
    openModal("note-modal");
  };

  window.deleteCustomerNote = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذه الملاحظة؟")) return;
    try {
      await remove("customerNotes", id);
      await loadData();
    } catch (e) {
      alert("فشل الحذف: " + e.message);
    }
  };

  window.exportNotesExcel = () => {
    const data = allNotes.map(n => ({
      "العميل": n.customerName,
      "الهاتف": n.customerPhone,
      "التاريخ": n.date,
      "النوع": NOTE_TYPES.find(t => t.id === n.type)?.label || n.type,
      "مثبتة": n.isPinned ? "نعم" : "لا",
      "الملاحظة": n.content,
      "الكاتب": n.authorName || "—"
    }));
    exportToExcel(data, "سجل_ملاحظات_العملاء");
  };
}
