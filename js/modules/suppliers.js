// Suppliers — mirrors Customers module
import { COLS, create, update, remove, getAll } from "../utils/db.js";
import { query, orderBy, limit, getDocs } from "../utils/db.js";
import { syncEntityToCoa, updateEntityInCoa, deleteEntityInCoa } from "../utils/coa-connector.js";
import { formatCurrency, debounce } from "../utils/formatters.js";
import { exportToExcel, importFromExcel, downloadTemplate } from "../utils/excel.js";
import { showRecordPreview, printRecord } from "../utils/record-actions.js";
import { syncSupplierNameEverywhere, syncSupplierBalanceToCoa } from "../utils/sync-engine.js";
let cachedSuppliers = [];

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar">
      <div class="search-bar" style="max-width:240px;"><input type="text" id="sup-search" class="input" placeholder="🔍  بحث في الموردين…" /></div>
      <div class="filter-select-group" style="max-width:180px;">
        <select id="sup-category-filter" class="input">
          <option value="">كل التصنيفات</option>
          <option value="rice">موردو الأرز</option>
          <option value="sugar_oil">موردو السكر والزيت</option>
          <option value="flour">موردو الدقيق والمواد الأساسية</option>
          <option value="services">موردو الخدمات (مرافق وإيجار)</option>
          <option value="other">موردون آخرون</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn-export" onclick="exportPagePDF('.data-dense','الموردين')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportSuppliersExcel()" title="تصدير Excel"><span>📊</span> تصدير Excel</button>
        <button class="btn-export" style="background:#10B981;color:#fff;" onclick="openSupplierImportModal()" title="استيراد من Excel"><span>📤</span> استيراد Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn btn-primary" onclick="openSupplierModal()">+ إضافة مورد</button>
      </div>
    </div>
    <div class="page-content">
      <div class="page-header"><h1 class="page-title">الموردون</h1><p class="page-subtitle" id="sup-count"></p></div>
      <div class="card">
        <div class="table-container">
          <table class="data-dense"><thead><tr><th>اسم المورد</th><th>الهاتف</th><th>رقم الضريبة</th><th>الرصيد</th><th></th></tr></thead>
          <tbody id="sup-tbody">${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(5).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}</tbody>
        </table></div></div>
    </div>
    <div class="modal-overlay" id="supplier-modal">
      <div class="modal modal-md"><div class="modal-header"><h3 class="modal-title" id="sup-modal-title">إضافة مورد</h3><button class="modal-close" onclick="closeModal('supplier-modal')">×</button></div>
      <div class="modal-body">
        <input type="hidden" id="sup-edit-id" />
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>اسم المورد *</label><input type="text" id="sup-name" class="input" placeholder="الاسم التجاري للمورد" /></div>
          <div class="form-group"><label>كود المورد</label><input type="text" id="sup-code" class="input mono" placeholder="SUP-001" /></div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:16px;">
          <div class="form-group"><label>رقم الهاتف</label><input type="text" id="sup-phone" class="input mono" placeholder="05xxxxxxxx" /></div>
          <div class="form-group"><label>الرقم الضريبي (VAT)</label><input type="text" id="sup-vat" class="input mono" placeholder="3xxxxxxxxxxxxxx" /></div>
          <div class="form-group"><label>الهوية الوطنية / السجل التجاري</label><input type="text" id="sup-national-id" class="input mono" placeholder="رقم الهوية أو السجل" /></div>
        </div>
        <div class="form-group mb-16"><label>العنوان</label><input type="text" id="sup-address" class="input" placeholder="المدينة، الشارع، الرمز البريدي" /></div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group">
            <label>تصنيف المورد *</label>
            <select id="sup-category" class="input">
              <option value="other">موردون آخرون</option>
              <option value="rice">موردو الأرز</option>
              <option value="sugar_oil">موردو السكر والزيت</option>
              <option value="flour">موردو الدقيق والمواد الأساسية</option>
              <option value="services">موردو الخدمات (مرافق وإيجار)</option>
            </select>
          </div>
          <div class="form-group" id="sup-coa-toggle-wrap" style="display:flex; align-items:center; gap:8px; margin-top:20px;">
            <input type="checkbox" id="sup-coa-toggle" checked style="width:16px;height:16px;cursor:pointer;" />
            <label for="sup-coa-toggle" style="margin-bottom:0;cursor:pointer;font-weight:bold;">إنشاء حساب مستقل</label>
          </div>
        </div>
        <div class="form-group"><label>ملاحظات</label><input type="text" id="sup-notes" class="input" placeholder="شروط الدفع أو أي تفاصيل أخرى..." /></div>
        <div id="sup-error" class="alert bad hidden" style="margin-top:8px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('supplier-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="saveSupplier()" id="save-sup-btn">حفظ</button>
      </div></div></div>`;
  const searchInput = container.querySelector("#sup-search");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(() => loadSuppliers(), 350));
  }
  const catFilterInput = container.querySelector("#sup-category-filter");
  if (catFilterInput) {
    catFilterInput.addEventListener("change", () => loadSuppliers());
  }
  await loadSuppliers();
}
async function loadSuppliers() {
  const tbody = document.getElementById("sup-tbody");
  if (!tbody) return;
  const searchInput = document.getElementById("sup-search");
  const term  = searchInput ? searchInput.value.toLowerCase().trim() : "";
  try {
    // getAll يستخدم الـ Cache التلقائي (5 دقائق) — لا يذهب لـ Firebase إلا عند انتهاء المدة
    let sups = await getAll(COLS.suppliers(), [orderBy("name")]);
    cachedSuppliers = sups;
    renderSuppliersTable(sups, term, tbody);
  } catch (err) { tbody.innerHTML = `<tr><td colspan="5"><div class="alert bad">${err.message}</div></td></tr>`; }
}

function renderSuppliersTable(sups, term, tbody) {
  let filtered = [...sups];
  if (term) filtered = filtered.filter(s => s.name?.toLowerCase().includes(term));

  const catFilter = document.getElementById("sup-category-filter")?.value || "";
  if (catFilter) filtered = filtered.filter(s => s.category === catFilter);

  const countEl = document.getElementById("sup-count");
  if (countEl) countEl.textContent = `${filtered.length} مورد`;

  const CAT_LABELS = {
    rice: "موردو الأرز",
    sugar_oil: "موردو السكر والزيت",
    flour: "موردو الدقيق",
    services: "موردو الخدمات",
    other: "أخرى"
  };
  const CAT_COLORS = {
    rice: "#6366f1",
    sugar_oil: "#f59e0b",
    flour: "#10b981",
    services: "#8b5cf6",
    other: "#6b7280"
  };

  tbody.innerHTML = filtered.length === 0
    ? `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-2);">لا يوجد موردون</td></tr>`
    : filtered.map(s => `<tr>
        <td>
          <div style="display:flex;align-items:center;gap:6px;">
            <div class="font-semibold font-heading">${s.name}</div>
            ${s.category ? `<span class="coa-badge" style="background:${CAT_COLORS[s.category]}22;color:${CAT_COLORS[s.category]};padding:1px 5px;border-radius:4px;font-size:9px;font-weight:bold;">${CAT_LABELS[s.category] || s.category}</span>` : ""}
          </div>
          ${s.code ? `<div style="font-size:11px;color:var(--text-2);">${s.code}</div>` : ""}
        </td>
        <td class="mono dim">${s.phone||"—"}</td>
        <td class="mono dim">${s.vatNumber||"—"}</td>
        <td class="mono ${(s.balance||0)>0?"text-bad":""}">${formatCurrency(s.balance||0)}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-icon sm btn-ghost" onclick="previewSupplier('${s.id}')" title="معاينة">👁️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="editSupplier('${s.id}')" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="printSupplier('${s.id}')" title="طباعة">🖨️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="exportSupplierPDF('${s.id}')" title="تصدير PDF">📄</button>
            <button class="btn btn-icon sm btn-ghost" onclick="viewSupplierStatement('${s.id}')" title="كشف حساب">📊</button>
            <button class="btn btn-icon sm btn-ghost" onclick="delSupplier('${s.id}','${s.name}')" style="color:var(--bad);" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>`).join("");
}
window.openSupplierModal = (s=null) => {
  document.getElementById("sup-edit-id").value = s?.id||"";
  document.getElementById("sup-modal-title").textContent = s?"تعديل المورد":"إضافة مورد";
  document.getElementById("sup-name").value    = s?.name||"";
  document.getElementById("sup-code").value    = s?.code||"";
  document.getElementById("sup-phone").value   = s?.phone||"";
  document.getElementById("sup-vat").value     = s?.vatNumber||s?.vat||"";
  document.getElementById("sup-national-id").value = s?.nationalId||"";
  document.getElementById("sup-address").value = s?.address||"";
  document.getElementById("sup-category").value = s?.category||"other";
  document.getElementById("sup-notes").value   = s?.notes||"";
  document.getElementById("sup-error").classList.add("hidden");

  // Handle COA toggle visibility
  const toggleWrap = document.getElementById("sup-coa-toggle-wrap");
  const toggle = document.getElementById("sup-coa-toggle");
  if (s) {
    if (toggleWrap) toggleWrap.style.display = "none";
    if (toggle) toggle.checked = !!s.accountId;
  } else {
    if (toggleWrap) toggleWrap.style.display = "flex";
    if (toggle) toggle.checked = true;
  }

  openModal("supplier-modal");
};
window.editSupplier = (id) => {
  const s = cachedSuppliers.find(x => x.id === id);
  if (s) {
    openSupplierModal(s);
  } else {
    import("../utils/db.js").then(async ({ getById }) => {
      try {
        const x = await getById("suppliers", id);
        if (x) openSupplierModal(x);
      } catch (err) { showToast(err.message, "error"); }
    });
  }
};
window.saveSupplier = async()=>{
  const errEl=document.getElementById("sup-error"); errEl.classList.add("hidden");
  const id=document.getElementById("sup-edit-id").value;
  const name=document.getElementById("sup-name").value.trim();
  if(!name){errEl.textContent="الاسم مطلوب";errEl.classList.remove("hidden");return;}
  const data={
    name,
    code: document.getElementById("sup-code").value.trim(),
    phone: document.getElementById("sup-phone").value.trim(),
    vatNumber: document.getElementById("sup-vat").value.trim(),
    nationalId: document.getElementById("sup-national-id").value.trim(),
    address: document.getElementById("sup-address").value.trim(),
    category: document.getElementById("sup-category").value,
    notes: document.getElementById("sup-notes").value.trim()
  };
  if(!id){ data.balance = 0; }
  const btn=document.getElementById("save-sup-btn"); btn.disabled=true;
  try {
    if (id) {
      const oldSup = cachedSuppliers.find(x => x.id === id);
      await update("suppliers", id, data);
      if (oldSup) {
        const nameChanged = oldSup.name !== name;
        if (oldSup.accountId) {
          if (nameChanged) {
            await updateEntityInCoa(oldSup.accountId, name);
            // ✅ cascade: تحديث الاسم في الفواتير وسندات الدفع والقيود
            syncSupplierNameEverywhere(id, name).catch(e =>
              console.warn("[Suppliers] syncSupplierNameEverywhere:", e.message)
            );
          }
        } else {
          // Heal missing COA reference
          const coaData = await syncEntityToCoa("suppliers", id, name);
          if (coaData) {
            await update("suppliers", id, coaData);
          }
        }
        // ✅ مزامنة رصيد COA دائماً
        syncSupplierBalanceToCoa(id).catch(() => {});
      }
      showToast("تم تحديث المورد بنجاح", "success");
    } else {
      const skipCoa = !document.getElementById("sup-coa-toggle").checked;
      const supId = await create(COLS.suppliers(), data);
      if (!skipCoa) {
        try {
          const coaData = await syncEntityToCoa("suppliers", supId, name);
          if (coaData) {
            await update("suppliers", supId, coaData);
          }
        } catch (coaErr) {
          console.error("Failed to sync supplier to COA:", coaErr);
          showToast(`⚠️ تم حفظ المورد ولكن فشل تكامل شجرة الحسابات: ${coaErr.message}`, "error");
        }
      }
      showToast("تمت إضافة المورد بنجاح", "success");
    }
    closeModal("supplier-modal");
    await loadSuppliers();
  }
  catch(err){errEl.textContent=err.message;errEl.classList.remove("hidden");} finally{btn.disabled=false;}
};
window.delSupplier = async (id, name) => {
  if (!await showConfirm(`هل تريد حذف المورد "${name}" نهائياً؟`, "تأكيد الحذف"))  return;
  try {
    const sup = cachedSuppliers.find(s => s.id === id);
    if (sup && sup.accountId) {
      const res = await deleteEntityInCoa("suppliers", id, sup.accountId);
      if (res.action === "archived") {
        showToast("⚠️ المورد لديه معاملات مالية سابقة. تم أرشفته وتجميد حسابه في شجرة الحسابات.", "warning");
        await loadSuppliers();
        return;
      }
    }
    await remove("suppliers", id);
    showToast(`تم حذف "${name}" بنجاح`, "success");
    cachedSuppliers = cachedSuppliers.filter(s => s.id !== id);
    await loadSuppliers();
  } catch (err) {
    console.error("Delete supplier error:", err);
    showToast("فشل الحذف: " + (err.code === 'permission-denied' ? 'ليس لديك صلاحية الحذف' : err.message), "error");
  }
};
window.viewSupplierStatement = (id) => {
  window._preselectedStatementEntity = { type: "supplier", id };
  navigate("report-customer-statement");
};

// ── Preview / Print / PDF ───────────────────────────────
function getSupplierById(id) {
  return cachedSuppliers.find(s => s.id === id) || null;
}

function buildSupplierSections(s) {
  const CAT_LABELS = {
    rice: "موردو الأرز",
    sugar_oil: "موردو السكر والزيت",
    flour: "موردو الدقيق والمواد الأساسية",
    services: "موردو الخدمات (مرافق وإيجار)",
    other: "موردون آخرون"
  };
  return [
    {
      heading: 'بيانات المورد',
      rows: [
        { label: 'اسم المورد', value: s.name, bold: true },
        { label: 'كود المورد', value: s.code, mono: true },
        { label: 'تصنيف المورد', value: CAT_LABELS[s.category] || s.category || 'موردون آخرون' },
        { label: 'رقم الهاتف', value: s.phone, mono: true },
        { label: 'الرقم الضريبي (VAT)', value: s.vatNumber, mono: true },
        { label: 'الهوية الوطنية / السجل التجاري', value: s.nationalId, mono: true },
        { label: 'العنوان', value: s.address },
      ]
    },
    {
      heading: 'بيانات مالية وقانونية',
      rows: [
        { label: 'الرصيد الحالي', value: formatCurrency(s.balance || 0), mono: true, bold: true },
        { label: 'ملاحظات', value: s.notes },
      ]
    }
  ];
}

window.previewSupplier = (id) => {
  const s = getSupplierById(id);
  if (!s) { showToast('لم يتم إيجاد المورد', 'error'); return; }
  showRecordPreview({
    title: s.name,
    icon: '🏭',
    badgeText: (s.balance || 0) > 0 ? `مدين ${formatCurrency(s.balance)}` : 'مستوفى',
    badgeColor: (s.balance || 0) > 0 ? 'bad' : 'good',
    sections: buildSupplierSections(s),
    actions: [
      { icon: '✏️', label: 'تعديل', fn: `document.getElementById('record-preview-overlay').remove();editSupplier('${id}')`, style: 'background:var(--brand);color:#fff;' },
      { icon: '🖨️', label: 'طباعة', fn: `printSupplier('${id}')`, style: 'background:var(--bg-2);color:var(--text-1);' },
      { icon: '📄', label: 'PDF', fn: `exportSupplierPDF('${id}')`, style: 'background:#EF4444;color:#fff;' },
    ]
  });
};

window.printSupplier = (id) => {
  const s = getSupplierById(id);
  if (!s) return;
  printRecord({ title: s.name, icon: '🏭', sections: buildSupplierSections(s) });
};

window.exportSupplierPDF = (id) => {
  window.printSupplier(id); // Uses browser print-to-PDF
};


// ── Excel Export ───────────────────────────────────────────
window.exportSuppliersExcel = async () => {
  try {
    const sups = cachedSuppliers.length > 0 ? cachedSuppliers : await getAll(COLS.suppliers(), [orderBy('name')]);
    showToast('جاري تجهيز ملف Excel…', 'info');
    const rows = sups.map(s => [
      s.name || '', s.phone || '', s.vatNumber || '',
      s.address || '', s.balance || 0, s.notes || ''
    ]);
    await exportToExcel({
      title: 'الموردون',
      headers: ['اسم المورد*', 'رقم الهاتف', 'الرقم الضريبي', 'العنوان', 'الرصيد', 'ملاحظات'],
      rows,
      colWidths: [32, 16, 20, 36, 16, 30],
    });
    showToast(`تم تصدير ${rows.length} مورد ✅`, 'success');
  } catch (err) { showToast('خطأ: ' + err.message, 'error'); }
};

// ── Excel Import ───────────────────────────────────────────
window.openSupplierImportModal = () => {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.id = 'sup-import-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:600px;width:95%;">
      <div class="modal-header">
        <h3 class="modal-title">📤 استيراد الموردين من Excel</h3>
        <button class="modal-close" onclick="document.getElementById('sup-import-overlay').remove()">×</button>
      </div>
      <div class="modal-body">
        <div style="background:var(--bg-2);border-radius:10px;padding:14px;margin-bottom:14px;font-size:12px;color:var(--text-2);">الأعمدة: <strong>اسم المورد(*)</strong>, رقم الهاتف, الرقم الضريبي, العنوان, ملاحظات</div>
        <div id="sup-dz" style="border:2px dashed var(--border-soft);border-radius:12px;padding:36px;text-align:center;cursor:pointer;"
          onclick="document.getElementById('sup-fi').click()"
          ondragover="event.preventDefault();this.style.borderColor='var(--brand)';"
          ondragleave="this.style.borderColor='var(--border-soft)';"
          ondrop="event.preventDefault();this.style.borderColor='var(--border-soft)';handleSupImport(event.dataTransfer.files[0]);">
          <div style="font-size:36px;">📊</div><div style="font-weight:600;">اسحب ملف Excel أو انقر للاختيار</div>
          <input type="file" id="sup-fi" accept=".xlsx,.xls,.csv" style="display:none" onchange="handleSupImport(this.files[0])">
        </div>
        <div id="sup-import-status" style="margin-top:12px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="document.getElementById('sup-import-overlay').remove()">إلغاء</button>
        <button class="btn btn-primary" id="sup-import-btn" style="display:none;" onclick="executeSupImport()">✅ استيراد</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
};
let _supImportRows = [];
window.handleSupImport = async (file) => {
  if (!file) return;
  try {
    const { rows } = await importFromExcel(file);
    _supImportRows = rows;
    document.getElementById('sup-import-status').innerHTML =
      `<div class="alert good">✅ تم قراءة <strong>${rows.length}</strong> مورد. اضغط استيراد للحفظ.</div>`;
    document.getElementById('sup-import-btn').style.display = '';
  } catch(e) { showToast(e.message, 'error'); }
};
window.executeSupImport = async () => {
  const btn = document.getElementById('sup-import-btn');
  btn.disabled = true; btn.textContent = '⏳ جاري...';
  let added = 0, updated = 0, failed = 0;
  const existing = await getAll(COLS.suppliers(), []);
  const nameMap = {}; existing.forEach(s => { nameMap[s.name?.trim()?.toLowerCase()] = s.id; });
  for (const r of _supImportRows) {
    const name = String(r['اسم المورد*'] || r['اسم'] || Object.values(r)[0] || '').trim();
    if (!name) { failed++; continue; }
    const payload = {
      name,
      phone:     String(r['رقم الهاتف'] || '').trim() || null,
      vatNumber: String(r['الرقم الضريبي'] || '').trim() || null,
      address:   String(r['العنوان'] || '').trim() || null,
      notes:     String(r['ملاحظات'] || '').trim() || null,
      updatedAt: new Date().toISOString(),
    };
    try {
      const existId = nameMap[name.toLowerCase()];
      if (existId) {
        await update(COLS.suppliers(), existId, payload);
        updated++;
      } else {
        payload.createdAt = new Date().toISOString();
        payload.balance = 0;
        const newId = await create(COLS.suppliers(), payload);
        // ✅ إنشاء حساب COA لكل مورد مستورد
        syncEntityToCoa("suppliers", newId, name)
          .then(coaData => { if (coaData) update(COLS.suppliers(), newId, coaData); })
          .catch(e => console.warn(`[Import] COA sync failed for ${name}:`, e.message));
        added++;
      }
    } catch(e) { failed++; }
  }
  document.getElementById('sup-import-overlay').remove();
  showToast(`✅ مضاف: ${added} | محدث: ${updated} | فاشل: ${failed}`, 'success');
  cachedSuppliers = []; await loadSuppliers();
};

