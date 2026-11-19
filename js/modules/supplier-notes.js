// ============================================================
// IDHAM ERP — الشروط البنكية وملاحظات الموردين والتحذيرات
// Supplier Bank Details, Verified IBANs & Pinned Payment Notes
// ============================================================
import { COLS, getAll, create, update, remove, orderBy } from "../utils/db.js";
import { formatDate } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

let allNotes = [];
let allSuppliers = [];

const todayStr = () => new Date().toISOString().slice(0, 10);

const NOTE_TYPES = [
  { id: "bank_account", label: "🏦 حساب بنكي وآيبان معتمد للتحويل", color: "#3B82F6", icon: "🏦" },
  { id: "pinned_warning", label: "⚠️ تنبيه وتحذير مالي مثبت", color: "#EF4444", icon: "⚠️" },
  { id: "cash_discount", label: "💰 شروط خصم السداد النقدي المبكر", color: "#10B981", icon: "💰" },
  { id: "receiving_terms", label: "📦 اشتراطات تفريغ واستلام المستودع", color: "#F59E0B", icon: "📦" },
  { id: "general", label: "📌 ملاحظة وتفاهم عام", color: "#6B7280", icon: "📌" }
];

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:260px;">
        <input type="text" id="sup-note-search" class="input" placeholder="🔍 بحث في الملاحظات والآيبان..." oninput="window.filterSupplierNotes(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>المورد</label>
        <select id="sup-note-sup-filter" onchange="window.filterSupplierNotes()">
          <option value="">كل الموردين</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>النوع</label>
        <select id="sup-note-type-filter" onchange="window.filterSupplierNotes()">
          <option value="">كل الأنواع</option>
          ${NOTE_TYPES.map(t => `<option value="${t.id}">${t.label}</option>`).join("")}
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportSupplierNotesExcel()">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openSupplierNoteModal()">+ إضافة حساب بنكي / ملاحظة</button>
      </div>
    </div>

    <div class="page-content">
      <!-- Pinned Bank & Warning Strip -->
      <div id="sup-pinned-notes-container" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:12px; margin-bottom:16px;"></div>

      <!-- Notes Table -->
      <div class="card">
        <div class="card-header" style="padding:14px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0; font-size:15px; font-weight:800; color:var(--text-0);">📝 سجل الحسابات البنكية والملاحظات الموثقة</h3>
          <span class="badge" id="sup-notes-count">0 سجل</span>
        </div>
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th style="width:95px;">التاريخ</th>
                <th>المورد</th>
                <th style="width:130px;">النوع</th>
                <th>تفاصيل الحساب / الملاحظة</th>
                <th style="width:180px;">رقم الآيبان (IBAN)</th>
                <th style="width:80px; text-align:center;">مثبتة</th>
                <th style="width:110px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="sup-notes-tbody">
              <tr><td colspan="7" style="text-align:center; padding:32px;"><span class="spin"></span> جاري تحميل الملاحظات...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Note Modal -->
    <div class="modal-overlay" id="sup-note-modal">
      <div class="modal" style="max-width:640px;">
        <div class="modal-header">
          <h3 class="modal-title" id="sup-note-modal-title">➕ إضافة حساب بنكي / ملاحظة مورد</h3>
          <button class="modal-close" onclick="closeModal('sup-note-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="sup-note-edit-id" />
          
          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>المورد *</label>
              <select id="sup-note-sup-id" class="input">
                <option value="">-- اختر المورد --</option>
              </select>
            </div>
            <div class="form-group">
              <label>تاريخ التسجيل *</label>
              <input type="date" id="sup-note-date" class="input" value="${todayStr()}" />
            </div>
          </div>

          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>نوع السجل *</label>
              <select id="sup-note-type" class="input" onchange="window.onNoteTypeChange(this.value)">
                ${NOTE_TYPES.map(t => `<option value="${t.id}">${t.label}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label>اسم البنك (إن وجد)</label>
              <input type="text" id="sup-note-bank" class="input" placeholder="مصرف الراجحي / الأهلي..." />
            </div>
          </div>

          <div class="form-group mb-12" id="sup-note-iban-wrap">
            <label>رقم الآيبان الدولي (IBAN) المعتمد للتحويلات</label>
            <input type="text" id="sup-note-iban" class="input mono" placeholder="SA0000000000000000000000" style="letter-spacing:1px;" />
          </div>

          <div class="form-group mb-12">
            <label>نص الملاحظة / شروط السداد والخصم *</label>
            <textarea id="sup-note-content" class="input" rows="3" placeholder="اكتب الملاحظة بالتفصيل أو شروط الخصم (مثال: خصم 2% في حال السداد خلال 10 أيام)..."></textarea>
          </div>

          <div class="form-group mb-12" style="display:flex; align-items:center; gap:8px; background:rgba(239,68,68,0.06); padding:10px 14px; border-radius:8px; border:1px solid rgba(239,68,68,0.2);">
            <input type="checkbox" id="sup-note-pinned" style="width:18px; height:18px; cursor:pointer;" />
            <label for="sup-note-pinned" style="margin:0; cursor:pointer; font-weight:800; color:#EF4444;">
              📌 تثبيت كتنبيه تحذيري يظهر تلقائياً في فواتير الشراء وسندات الصرف
            </label>
          </div>

          <div id="sup-note-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('sup-note-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveSupplierNote()">💾 حفظ البيانات</button>
        </div>
      </div>
    </div>
  `;

  await loadData();
  setupGlobalFunctions();
}

async function loadData() {
  try {
    const [notes, sups] = await Promise.all([
      getAll(COLS.supplierNotes ? COLS.supplierNotes() : "supplierNotes", [orderBy("createdAt", "desc")]).catch(() => []),
      getAll(COLS.suppliers(), [orderBy("name")]).catch(() => [])
    ]);

    allNotes = notes;
    allSuppliers = sups;

    populateSuppliersFilter();
    renderPinnedNotesStrip();
    renderNotesTable();
  } catch (e) {
    console.warn("Error loading supplier notes data:", e);
  }
}

function populateSuppliersFilter() {
  const f = document.getElementById("sup-note-sup-filter");
  const m = document.getElementById("sup-note-sup-id");
  const opts = allSuppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  if (f) f.innerHTML = `<option value="">كل الموردين</option>` + opts;
  if (m) m.innerHTML = `<option value="">-- اختر المورد --</option>` + opts;
}

function renderPinnedNotesStrip() {
  const container = document.getElementById("sup-pinned-notes-container");
  if (!container) return;

  const pinned = allNotes.filter(n => n.isPinned || n.type === "pinned_warning" || n.type === "bank_account");
  if (!pinned.length) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = pinned.slice(0, 4).map(n => {
    const isBank = n.type === "bank_account" || !!n.iban;
    const color = isBank ? "#3B82F6" : "#EF4444";
    const bg = isBank ? "rgba(59,130,246,0.06)" : "rgba(239,68,68,0.06)";

    return `
      <div class="card" style="padding:14px; border:1.5px solid ${color}40; background:${bg}; border-radius:12px;">
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:6px;">
          <div style="font-weight:800; font-size:13.5px; color:var(--text-0);">${n.supplierName}</div>
          <span class="badge" style="background:${color}20; color:${color}; font-weight:800; font-size:10.5px;">
            ${isBank ? '🏦 حساب بنكي' : '⚠️ تنبيه مثبت'}
          </span>
        </div>

        ${n.iban ? `
          <div style="background:var(--bg-card); padding:8px 10px; border-radius:6px; border:1px solid var(--border-soft); margin:6px 0; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:10.5px; color:var(--text-3); font-weight:700;">${n.bankName || "البنك"}:</div>
              <div class="mono font-bold" style="font-size:12.5px; color:var(--brand);">${n.iban}</div>
            </div>
            <button class="btn btn-secondary btn-sm" style="font-size:11px; padding:2px 8px;" onclick="window.copyIBAN('${n.iban}')">📋 نسخ</button>
          </div>
        ` : ""}

        <div style="font-size:12px; color:var(--text-1); margin-top:6px; line-height:1.4;">${n.content}</div>
      </div>
    `;
  }).join("");
}

function renderNotesTable(list = allNotes) {
  const tbody = document.getElementById("sup-notes-tbody");
  const countEl = document.getElementById("sup-notes-count");
  if (!tbody) return;

  if (countEl) countEl.textContent = `${list.length} سجل`;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد ملاحظات أو حسابات مسجلة</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(n => {
    const typeObj = NOTE_TYPES.find(t => t.id === n.type) || NOTE_TYPES[4];
    return `
      <tr>
        <td class="mono dim">${n.date || "—"}</td>
        <td class="font-bold">${n.supplierName}</td>
        <td>
          <span class="badge" style="background:${typeObj.color}15; color:${typeObj.color}; font-weight:700; font-size:11px;">
            ${typeObj.label}
          </span>
        </td>
        <td style="font-size:12px; max-width:240px;">
          ${n.bankName ? `<b>[${n.bankName}]</b> ` : ""}${n.content || "—"}
        </td>
        <td class="mono font-bold" style="color:var(--brand); font-size:12px;">
          ${n.iban ? `
            <div style="display:flex; align-items:center; gap:6px;">
              <span>${n.iban}</span>
              <button class="btn btn-icon sm btn-ghost" onclick="window.copyIBAN('${n.iban}')" title="نسخ الآيبان">📋</button>
            </div>
          ` : '—'}
        </td>
        <td style="text-align:center;">
          ${n.isPinned ? `<span class="badge bad" style="font-weight:800;">📌 نعم</span>` : `<span class="dim">—</span>`}
        </td>
        <td>
          <div class="row-actions" style="justify-content:center;">
            <button class="btn btn-icon sm btn-ghost" onclick="window.editSupplierNote('${n.id}')" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deleteSupplierNote('${n.id}')" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function setupGlobalFunctions() {
  window.filterSupplierNotes = () => {
    const q = (document.getElementById("sup-note-search")?.value || "").trim().toLowerCase();
    const supId = document.getElementById("sup-note-sup-filter")?.value || "";
    const tp = document.getElementById("sup-note-type-filter")?.value || "";

    const filtered = allNotes.filter(n => {
      const mQ = !q || (n.supplierName || "").toLowerCase().includes(q) || (n.content || "").toLowerCase().includes(q) || (n.iban || "").toLowerCase().includes(q);
      const mS = !supId || n.supplierId === supId;
      const mT = !tp || n.type === tp;
      return mQ && mS && mT;
    });

    renderNotesTable(filtered);
  };

  window.copyIBAN = (iban) => {
    navigator.clipboard.writeText(iban);
    alert(`✅ تم نسخ الآيبان إلى الحافظة:\n${iban}`);
  };

  window.onNoteTypeChange = (t) => {
    const ibanWrap = document.getElementById("sup-note-iban-wrap");
    if (ibanWrap) {
      ibanWrap.style.display = (t === "bank_account" || t === "general") ? "block" : "block";
    }
  };

  window.openSupplierNoteModal = () => {
    document.getElementById("sup-note-edit-id").value = "";
    document.getElementById("sup-note-modal-title").textContent = "➕ إضافة حساب بنكي / ملاحظة مورد";
    document.getElementById("sup-note-sup-id").value = "";
    document.getElementById("sup-note-date").value = todayStr();
    document.getElementById("sup-note-type").value = "bank_account";
    document.getElementById("sup-note-bank").value = "";
    document.getElementById("sup-note-iban").value = "";
    document.getElementById("sup-note-content").value = "";
    document.getElementById("sup-note-pinned").checked = false;
    document.getElementById("sup-note-modal-err").classList.add("hidden");
    openModal("sup-note-modal");
  };

  window.saveSupplierNote = async () => {
    const err = document.getElementById("sup-note-modal-err");
    err.classList.add("hidden");

    const supId = document.getElementById("sup-note-sup-id").value;
    const sup = allSuppliers.find(s => s.id === supId);
    const content = document.getElementById("sup-note-content").value.trim();
    const isPinned = document.getElementById("sup-note-pinned").checked;
    const editId = document.getElementById("sup-note-edit-id").value;

    if (!supId) { err.textContent = "يرجى اختيار المورد"; err.classList.remove("hidden"); return; }
    if (!content && !document.getElementById("sup-note-iban").value) { err.textContent = "يرجى كتابة نص الملاحظة أو الآيبان"; err.classList.remove("hidden"); return; }

    const data = {
      supplierId: supId,
      supplierName: sup ? sup.name : "مورد",
      date: document.getElementById("sup-note-date").value,
      type: document.getElementById("sup-note-type").value,
      bankName: document.getElementById("sup-note-bank").value.trim(),
      iban: document.getElementById("sup-note-iban").value.trim(),
      content: content,
      isPinned: isPinned
    };

    try {
      if (editId) {
        await update("supplierNotes", editId, data);
      } else {
        await create("supplierNotes", data);
      }

      // If pinned warning, update in supplier doc as well for instant alert in purchase invoices
      if (isPinned && data.type === "pinned_warning") {
        await update("customers", supId, { pinnedWarningNote: content }).catch(() => {});
      }

      closeModal("sup-note-modal");
      await loadData();
    } catch (e) {
      err.textContent = e.message;
      err.classList.remove("hidden");
    }
  };

  window.editSupplierNote = (id) => {
    const n = allNotes.find(x => x.id === id);
    if (!n) return;

    document.getElementById("sup-note-edit-id").value = n.id;
    document.getElementById("sup-note-modal-title").textContent = "✏️ تعديل السجل — " + n.supplierName;
    document.getElementById("sup-note-sup-id").value = n.supplierId || "";
    document.getElementById("sup-note-date").value = n.date || todayStr();
    document.getElementById("sup-note-type").value = n.type || "bank_account";
    document.getElementById("sup-note-bank").value = n.bankName || "";
    document.getElementById("sup-note-iban").value = n.iban || "";
    document.getElementById("sup-note-content").value = n.content || "";
    document.getElementById("sup-note-pinned").checked = !!n.isPinned;
    document.getElementById("sup-note-modal-err").classList.add("hidden");
    openModal("sup-note-modal");
  };

  window.deleteSupplierNote = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا السجل؟")) return;
    try {
      await remove("supplierNotes", id);
      await loadData();
    } catch (e) {
      alert("فشل الحذف: " + e.message);
    }
  };

  window.exportSupplierNotesExcel = () => {
    const rows = allNotes.map(n => ({
      "المورد": n.supplierName,
      "التاريخ": n.date,
      "النوع": NOTE_TYPES.find(t => t.id === n.type)?.label || n.type,
      "البنك": n.bankName || "—",
      "الآيبان": n.iban || "—",
      "الملاحظة / الشروط": n.content,
      "مثبتة": n.isPinned ? "نعم" : "لا"
    }));
    exportToExcel(rows, "ملاحظات_وحسابات_الموردين");
  };
}
