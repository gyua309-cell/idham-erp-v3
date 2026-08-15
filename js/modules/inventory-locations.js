// ============================================================
// IDHAM ERP — Inventory Locations (Zones / Racks / Bins)
// مواقع ورفوف وأدراج التخزين داخل المخازن
// ============================================================
import { COLS, getAll, create, update, remove } from "../utils/db.js";

let warehouses = [];
let locations  = [];
let editingId  = null;

export async function render(container, user) {
  container.innerHTML = `
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">📍 مواقع ورفوف وأدراج التخزين</h1>
        <p class="page-subtitle">إدارة التخطيط الداخلي للمخازن (Zone → Aisle → Rack → Bin)</p>
      </div>

      <div class="filterbar" style="margin-bottom:16px;">
        <button class="btn btn-primary" id="btn-add-location">
          ➕ إضافة موقع جديد
        </button>
        <div style="flex:1;"></div>
        <label style="font-size:12px; color:var(--text-2);">المخزن:</label>
        <select id="loc-filter-wh" class="form-control" style="width:200px; height:36px;">
          <option value="">جميع المخازن</option>
        </select>
        <input id="loc-search" type="text" class="form-control" placeholder="🔍 بحث بالكود أو الاسم..." style="width:220px; height:36px;">
      </div>

      <!-- KPI Row -->
      <div class="kpi-grid mb-24" style="grid-template-columns: repeat(4, 1fr);">
        <div class="kpi-card">
          <div class="status-bar indigo"></div>
          <div class="kpi-content">
            <div class="kpi-label">إجمالي المواقع</div>
            <div class="kpi-value mono text-indigo" id="loc-kpi-total">—</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="status-bar good"></div>
          <div class="kpi-content">
            <div class="kpi-label">مواقع نشطة</div>
            <div class="kpi-value mono text-good" id="loc-kpi-active">—</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="status-bar warn"></div>
          <div class="kpi-content">
            <div class="kpi-label">مواقع ممتلئة</div>
            <div class="kpi-value mono text-warn" id="loc-kpi-full">—</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="status-bar bad"></div>
          <div class="kpi-content">
            <div class="kpi-label">مواقع معطّلة</div>
            <div class="kpi-value mono text-bad" id="loc-kpi-disabled">—</div>
          </div>
        </div>
      </div>

      <div id="loc-loading" class="page-loading" style="min-height:200px;">
        <div class="loading-spinner"></div>
      </div>

      <div id="loc-list-wrap" class="hidden">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>الكود</th>
                <th>اسم الموقع</th>
                <th>المخزن</th>
                <th>المنطقة</th>
                <th>الممر</th>
                <th>الرف</th>
                <th>الدرج</th>
                <th>الحالة</th>
                <th>الطاقة الاستيعابية</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody id="loc-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div id="loc-modal" class="modal-overlay">
      <div class="modal" style="max-width:600px;">
        <div class="modal-header">
          <h2 class="modal-title" id="loc-modal-title">إضافة موقع تخزين</h2>
          <button class="modal-close" id="btn-close-modal">✕</button>
        </div>
        <div class="modal-body" style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <div class="form-group">
            <label class="form-label">كود الموقع <span class="text-bad">*</span></label>
            <input id="loc-f-code" type="text" class="form-control" placeholder="مثال: A-01-R02-B03" />
          </div>
          <div class="form-group">
            <label class="form-label">اسم الموقع <span class="text-bad">*</span></label>
            <input id="loc-f-name" type="text" class="form-control" placeholder="وصف تعريفي" />
          </div>
          <div class="form-group">
            <label class="form-label">المخزن <span class="text-bad">*</span></label>
            <select id="loc-f-wh" class="form-control"></select>
          </div>
          <div class="form-group">
            <label class="form-label">المنطقة (Zone)</label>
            <input id="loc-f-zone" type="text" class="form-control" placeholder="مثال: A - مبرد / B - جاف" />
          </div>
          <div class="form-group">
            <label class="form-label">الممر (Aisle)</label>
            <input id="loc-f-aisle" type="text" class="form-control" placeholder="مثال: 01 / 02" />
          </div>
          <div class="form-group">
            <label class="form-label">الرف (Rack)</label>
            <input id="loc-f-rack" type="text" class="form-control" placeholder="مثال: R01 / R02" />
          </div>
          <div class="form-group">
            <label class="form-label">الدرج (Bin / Level)</label>
            <input id="loc-f-bin" type="text" class="form-control" placeholder="مثال: B1 / B2 / Top" />
          </div>
          <div class="form-group">
            <label class="form-label">نوع الموقع</label>
            <select id="loc-f-type" class="form-control">
              <option value="storage">تخزين عادي</option>
              <option value="receiving">استقبال بضاعة</option>
              <option value="picking">منطقة التجهيز</option>
              <option value="quarantine">حجر صحي</option>
              <option value="cold">مبرد</option>
              <option value="hazmat">مواد خطرة</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">الطاقة الاستيعابية (وحدة)</label>
            <input id="loc-f-capacity" type="number" class="form-control" placeholder="0 = غير محدودة" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">درجة الحرارة (°C) - اختياري</label>
            <input id="loc-f-temp" type="text" class="form-control" placeholder="مثال: 2-8 أو -18" />
          </div>
          <div class="form-group" style="grid-column:span 2;">
            <label class="form-label">الحالة</label>
            <select id="loc-f-status" class="form-control">
              <option value="active">نشط</option>
              <option value="full">ممتلئ</option>
              <option value="disabled">معطّل</option>
            </select>
          </div>
          <div class="form-group" style="grid-column:span 2;">
            <label class="form-label">ملاحظات</label>
            <textarea id="loc-f-notes" class="form-control" rows="2" placeholder="ملاحظات إضافية..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" id="btn-cancel-modal">إلغاء</button>
          <button class="btn btn-primary" id="btn-save-location">💾 حفظ</button>
        </div>
      </div>
    </div>
  `;

  // ── Wire up event listeners (instead of inline onclick) ──────────
  document.getElementById('btn-add-location').addEventListener('click', () => openModal(null));
  document.getElementById('btn-close-modal').addEventListener('click', closeModal);
  document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
  document.getElementById('btn-save-location').addEventListener('click', saveLocation);
  document.getElementById('loc-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById('loc-filter-wh').addEventListener('change', filterLocations);
  document.getElementById('loc-search').addEventListener('input', filterLocations);

  // Keep window.INV_LOC up-to-date (for any legacy inline onclick references in table rows)
  window.INV_LOC = {
    openModal: (id = null) => openModal(id),
    closeModal,
    save: saveLocation,
    del: deleteLocation,
    filterByWarehouse: filterLocations,
    filterList: filterLocations,
  };

  await load();
}

// ── Private helpers ──────────────────────────────────────────────

function openModal(id = null) {
  editingId = id;
  const modal = document.getElementById('loc-modal');
  if (!modal) { console.error('[INV_LOC] Modal element not found!'); return; }

  const title = document.getElementById('loc-modal-title');

  // Reset all fields safely
  const safeSet = (elId, val) => {
    const el = document.getElementById(elId);
    if (el) el.value = val;
  };

  safeSet('loc-f-code', '');
  safeSet('loc-f-name', '');
  safeSet('loc-f-zone', '');
  safeSet('loc-f-aisle', '');
  safeSet('loc-f-rack', '');
  safeSet('loc-f-bin', '');
  safeSet('loc-f-capacity', '0');
  safeSet('loc-f-temp', '');
  safeSet('loc-f-notes', '');
  safeSet('loc-f-type', 'storage');
  safeSet('loc-f-status', 'active');

  if (id) {
    const loc = locations.find(l => l.id === id);
    if (!loc) return;
    if (title) title.textContent = 'تعديل موقع التخزين';
    safeSet('loc-f-code',     loc.code       || '');
    safeSet('loc-f-name',     loc.name       || '');
    safeSet('loc-f-wh',       loc.warehouseId || '');
    safeSet('loc-f-zone',     loc.zone       || '');
    safeSet('loc-f-aisle',    loc.aisle      || '');
    safeSet('loc-f-rack',     loc.rack       || '');
    safeSet('loc-f-bin',      loc.bin        || '');
    safeSet('loc-f-type',     loc.type       || 'storage');
    safeSet('loc-f-capacity', loc.capacity   || '0');
    safeSet('loc-f-temp',     loc.tempRange  || '');
    safeSet('loc-f-status',   loc.status     || 'active');
    safeSet('loc-f-notes',    loc.notes      || '');
  } else {
    if (title) title.textContent = 'إضافة موقع تخزين جديد';
  }

  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('loc-modal')?.classList.remove('active');
  editingId = null;
}

async function saveLocation() {
  const code  = document.getElementById('loc-f-code')?.value.trim()  || '';
  const name  = document.getElementById('loc-f-name')?.value.trim()  || '';
  const whId  = document.getElementById('loc-f-wh')?.value           || '';

  if (!code || !name || !whId) {
    window.showToast?.('الكود والاسم والمخزن حقول إلزامية', 'error');
    return;
  }

  const payload = {
    code,
    name,
    warehouseId: whId,
    zone:      document.getElementById('loc-f-zone')?.value.trim()     || '',
    aisle:     document.getElementById('loc-f-aisle')?.value.trim()    || '',
    rack:      document.getElementById('loc-f-rack')?.value.trim()     || '',
    bin:       document.getElementById('loc-f-bin')?.value.trim()      || '',
    type:      document.getElementById('loc-f-type')?.value            || 'storage',
    capacity:  parseInt(document.getElementById('loc-f-capacity')?.value) || 0,
    tempRange: document.getElementById('loc-f-temp')?.value.trim()     || '',
    status:    document.getElementById('loc-f-status')?.value          || 'active',
    notes:     document.getElementById('loc-f-notes')?.value.trim()    || '',
  };

  const saveBtn = document.getElementById('btn-save-location');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = '⏳ جارٍ الحفظ...'; }

  try {
    if (editingId) {
      await update('locations', editingId, payload);
      const idx = locations.findIndex(l => l.id === editingId);
      if (idx > -1) locations[idx] = { ...locations[idx], ...payload };
      window.showToast?.('تم تحديث الموقع بنجاح ✅', 'success');
    } else {
      const ref = await create(COLS.locations(), payload);
      locations.push({ id: ref.id, ...payload });
      window.showToast?.('تم إضافة الموقع بنجاح ✅', 'success');
    }
    closeModal();
    renderTable(locations);
    updateKPIs(locations);
  } catch(err) {
    window.showToast?.('خطأ: ' + err.message, 'error');
    console.error('[INV_LOC] Save error:', err);
  } finally {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = '💾 حفظ'; }
  }
}

async function deleteLocation(id, name) {
  if (!confirm(`حذف الموقع "${name}"؟ تأكد أنه لا توجد أصناف مخصصة له.`)) return;
  try {
    await remove('locations', id);
    locations = locations.filter(l => l.id !== id);
    renderTable(locations);
    updateKPIs(locations);
    window.showToast?.('تم حذف الموقع ✅', 'success');
  } catch(err) {
    window.showToast?.('خطأ في الحذف: ' + err.message, 'error');
  }
}

function filterLocations() {
  const whId = document.getElementById('loc-filter-wh')?.value || '';
  const q    = (document.getElementById('loc-search')?.value || '').toLowerCase();
  const filtered = locations.filter(l => {
    const matchWh = !whId || l.warehouseId === whId;
    const matchQ  = !q || (l.code||'').toLowerCase().includes(q) || (l.name||'').toLowerCase().includes(q);
    return matchWh && matchQ;
  });
  renderTable(filtered);
}

async function load() {
  try {
    [warehouses, locations] = await Promise.all([
      getAll(COLS.warehouses()),
      getAll(COLS.locations()),
    ]);

    // Populate warehouse selects
    const whOptions = warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
    const filterEl = document.getElementById('loc-filter-wh');
    const formEl   = document.getElementById('loc-f-wh');
    if (filterEl) filterEl.innerHTML = '<option value="">جميع المخازن</option>' + whOptions;
    if (formEl)   formEl.innerHTML = whOptions;

    renderTable(locations);
    updateKPIs(locations);

    document.getElementById('loc-loading')?.classList.add('hidden');
    document.getElementById('loc-list-wrap')?.classList.remove('hidden');
  } catch(err) {
    console.error('[INV_LOC] Load error:', err);
    const el = document.getElementById('loc-loading');
    if (el) el.innerHTML = `<div class="alert bad">خطأ في تحميل البيانات: ${err.message}</div>`;
  }
}

function renderTable(list) {
  const whMap = {};
  warehouses.forEach(w => whMap[w.id] = w.name);

  const statusBadge = {
    active:   '<span class="badge good">نشط</span>',
    full:     '<span class="badge warn">ممتلئ</span>',
    disabled: '<span class="badge bad">معطّل</span>',
  };
  const typeBadge = {
    storage:   'تخزين',
    receiving: '📥 استقبال',
    picking:   '🧺 تجهيز',
    quarantine:'🚫 حجر',
    cold:      '❄️ مبرد',
    hazmat:    '⚠️ خطر',
  };

  const tbody = document.getElementById('loc-tbody');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="dim" style="text-align:center; padding:40px;">لا توجد مواقع مسجلة — اضغط "إضافة موقع جديد"</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(loc => `
    <tr>
      <td class="mono font-bold">${loc.code || '—'}</td>
      <td><strong>${loc.name || '—'}</strong></td>
      <td>${whMap[loc.warehouseId] || '—'}</td>
      <td class="mono">${loc.zone || '—'}</td>
      <td class="mono">${loc.aisle || '—'}</td>
      <td class="mono">${loc.rack || '—'}</td>
      <td class="mono">${loc.bin || '—'}</td>
      <td>${statusBadge[loc.status] || loc.status || '—'}</td>
      <td class="mono">${loc.capacity > 0 ? loc.capacity + ' وحدة' : '∞ غير محدودة'}</td>
      <td class="row-actions">
        <button class="btn btn-sm btn-ghost" onclick="INV_LOC.openModal('${loc.id}')">✏️</button>
        <button class="btn btn-sm btn-ghost text-bad" onclick="INV_LOC.del('${loc.id}', '${(loc.name||'').replace(/'/g,'')}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function updateKPIs(list) {
  const el = id => document.getElementById(id);
  if (!el('loc-kpi-total')) return;
  el('loc-kpi-total').textContent    = list.length;
  el('loc-kpi-active').textContent   = list.filter(l => l.status === 'active').length;
  el('loc-kpi-full').textContent     = list.filter(l => l.status === 'full').length;
  el('loc-kpi-disabled').textContent = list.filter(l => l.status === 'disabled').length;
}
