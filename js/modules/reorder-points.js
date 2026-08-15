// ============================================================
// IDHAM ERP — Reorder Points & Safety Stock Management
// نقاط إعادة الطلب ومخزون الأمان لكل صنف ومخزن
// ============================================================
import { COLS, getAll, update } from "../utils/db.js";
import { formatQuantity, formatCurrency } from "../utils/formatters.js";

let products  = [];
let warehouses = [];
let stockBal  = [];
let renderLimit = 100;

export async function render(container, user) {
  container.innerHTML = `
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">🔔 نقاط إعادة الطلب ومخزون الأمان</h1>
        <p class="page-subtitle">إدارة حدود الطلب التلقائي (Reorder Point) ومخزون الأمان (Safety Stock) لكل صنف</p>
      </div>

      <div class="filterbar" style="margin-bottom:16px;">
        <select id="rop-filter-wh" class="form-control" style="width:200px; height:36px;" onchange="ROP.load()">
          <option value="">جميع المخازن</option>
        </select>
        <select id="rop-filter-status" class="form-control" style="width:180px; height:36px;" onchange="ROP.applyFilter()">
          <option value="">جميع الحالات</option>
          <option value="critical">🔴 حرج (أقل من الحد)</option>
          <option value="warning">🟡 تحذير (قريب من الحد)</option>
          <option value="ok">🟢 طبيعي</option>
          <option value="nodata">⚪ بدون حدود محددة</option>
        </select>
        <input id="rop-search" type="text" class="form-control" placeholder="🔍 بحث بالكود أو الاسم..." style="width:220px; height:36px;" oninput="ROP.applyFilter()">
        <div style="flex:1"></div>
        <button class="btn btn-primary" onclick="ROP.saveAll()">💾 حفظ التغييرات</button>
        <button class="btn btn-secondary" onclick="ROP.exportCSV()">📥 تصدير CSV</button>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid mb-24" style="grid-template-columns: repeat(5, 1fr);">
        <div class="kpi-card g-blue">
          <div class="kpi-content">
            <div class="kpi-label">إجمالي الأصناف</div>
            <div class="kpi-value mono" id="rop-kpi-total">—</div>
          </div>
        </div>
        <div class="kpi-card g-orange">
          <div class="kpi-content">
            <div class="kpi-label">حرجة (تحت الحد)</div>
            <div class="kpi-value mono" id="rop-kpi-critical">—</div>
          </div>
        </div>
        <div class="kpi-card g-purple">
          <div class="kpi-content">
            <div class="kpi-label">تحذير (قريب من الحد)</div>
            <div class="kpi-value mono" id="rop-kpi-warning">—</div>
          </div>
        </div>
        <div class="kpi-card g-green">
          <div class="kpi-content">
            <div class="kpi-label">بمستوى طبيعي</div>
            <div class="kpi-value mono" id="rop-kpi-ok">—</div>
          </div>
        </div>
        <div class="kpi-card g-teal">
          <div class="kpi-content">
            <div class="kpi-label">بدون حدود</div>
            <div class="kpi-value mono" id="rop-kpi-nodata">—</div>
          </div>
        </div>
      </div>

      <div id="rop-loading" class="page-loading" style="min-height:200px;"><div class="loading-spinner"></div></div>

      <div id="rop-wrap" class="hidden">
        <div class="card" style="padding:12px 0;">
          <div style="padding:8px 16px; font-size:12px; color:var(--text-2); border-bottom:1px solid var(--border-soft); margin-bottom:4px;">
            💡 يمكنك تعديل الحدود مباشرة في الجدول ثم الضغط على "حفظ التغييرات"
          </div>
          <div class="table-container" style="max-height:70vh; overflow-y:auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>اسم الصنف</th>
                  <th>الوحدة</th>
                  <th>المخزون الحالي</th>
                  <th>حد إعادة الطلب (ROP)</th>
                  <th>مخزون الأمان</th>
                  <th>الحد الأقصى</th>
                  <th>الكمية الاقتصادية (EOQ)</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody id="rop-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  await loadData();
}

let rowData = []; // {product, qty, status}

async function loadData() {
  try {
    [products, warehouses, stockBal] = await Promise.all([
      getAll(COLS.products()),
      getAll(COLS.warehouses()),
      getAll(COLS.stockByWarehouse()),
    ]);

    // Populate warehouse filter
    const whEl = document.getElementById('rop-filter-wh');
    if (whEl) {
      whEl.innerHTML = '<option value="">جميع المخازن</option>' +
        warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
    }

    buildRowData();
    renderTable();
    updateKPIs();

    document.getElementById('rop-loading')?.classList.add('hidden');
    document.getElementById('rop-wrap')?.classList.remove('hidden');
  } catch(err) {
    const el = document.getElementById('rop-loading');
    if (el) el.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
}

function buildRowData() {
  const whId = document.getElementById('rop-filter-wh')?.value || '';

  // Aggregate stock per product
  const stockMap = {};
  stockBal.forEach(s => {
    if (whId && s.warehouseId !== whId) return;
    stockMap[s.productId] = (stockMap[s.productId] || 0) + (s.qty || 0);
  });

  rowData = products.map(p => {
    const qty       = stockMap[p.id] || 0;
    const rop       = p.reorderLevel  || 0;
    const safety    = p.safetyStock   || 0;
    const maxStock  = p.maxStock      || 0;
    const eoq       = p.eoq           || 0;

    let status = 'nodata';
    if (rop > 0) {
      if (qty <= 0)      status = 'critical';
      else if (qty <= rop)   status = 'critical';
      else if (qty <= rop * 1.25) status = 'warning';
      else                    status = 'ok';
    }

    return { product: p, qty, rop, safety, maxStock, eoq, status };
  });
}

function renderTable() {
  const tbody = document.getElementById('rop-tbody');
  if (!tbody) return;

  const q         = document.getElementById('rop-search')?.value.toLowerCase() || '';
  const statusFil = document.getElementById('rop-filter-status')?.value || '';

  const filtered = rowData.filter(r => {
    const matchQ = !q || (r.product.sku||'').toLowerCase().includes(q) || (r.product.name||'').toLowerCase().includes(q);
    const matchS = !statusFil || r.status === statusFil;
    return matchQ && matchS;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="dim" style="text-align:center; padding:30px;">لا توجد نتائج</td></tr>`;
    return;
  }

  const statusBadge = {
    critical: '<span class="badge bad">🔴 حرج</span>',
    warning:  '<span class="badge warn">🟡 تحذير</span>',
    ok:       '<span class="badge good">🟢 طبيعي</span>',
    nodata:   '<span class="badge" style="background:var(--bg-3); color:var(--text-2);">⚪ غير محدد</span>',
  };

  const visibleData = filtered.slice(0, renderLimit);

  let html = visibleData.map(r => `
    <tr data-pid="${r.product.id}" class="${r.status === 'critical' ? 'row-highlight-bad' : r.status === 'warning' ? 'row-highlight-warn' : ''}">
      <td class="mono font-bold">${r.product.sku || '—'}</td>
      <td><strong>${r.product.name || '—'}</strong></td>
      <td class="mono">${r.product.unit || '—'}</td>
      <td class="mono font-bold ${r.qty <= 0 ? 'text-bad' : r.status === 'warning' ? 'text-warn' : ''}">${formatQuantity(r.qty)}</td>
      <td><input type="number" class="form-control mono" style="width:90px; padding:4px 8px; text-align:center;" value="${r.rop}" data-field="reorderLevel" min="0" onchange="ROP.markDirty('${r.product.id}')"></td>
      <td><input type="number" class="form-control mono" style="width:90px; padding:4px 8px; text-align:center;" value="${r.safety}" data-field="safetyStock" min="0" onchange="ROP.markDirty('${r.product.id}')"></td>
      <td><input type="number" class="form-control mono" style="width:90px; padding:4px 8px; text-align:center;" value="${r.maxStock}" data-field="maxStock" min="0" onchange="ROP.markDirty('${r.product.id}')"></td>
      <td><input type="number" class="form-control mono" style="width:90px; padding:4px 8px; text-align:center;" value="${r.eoq}" data-field="eoq" min="0" onchange="ROP.markDirty('${r.product.id}')"></td>
      <td>${statusBadge[r.status] || '—'}</td>
    </tr>
  `).join('');

  if (filtered.length > renderLimit) {
    const remaining = filtered.length - renderLimit;
    html += `
      <tr>
        <td colspan="9" style="text-align:center; padding:12px; background:var(--bg-2);">
          <button class="btn btn-secondary btn-sm" onclick="ROP.loadMore()" style="width:240px; font-weight:600;">
             ➕ عرض المزيد (المتبقي ${remaining} صنف)
          </button>
        </td>
      </tr>
    `;
  }

  tbody.innerHTML = html;
}

function updateKPIs() {
  const el = id => document.getElementById(id);
  if (!el('rop-kpi-total')) return;
  el('rop-kpi-total').textContent    = rowData.length;
  el('rop-kpi-critical').textContent = rowData.filter(r => r.status === 'critical').length;
  el('rop-kpi-warning').textContent  = rowData.filter(r => r.status === 'warning').length;
  el('rop-kpi-ok').textContent       = rowData.filter(r => r.status === 'ok').length;
  el('rop-kpi-nodata').textContent   = rowData.filter(r => r.status === 'nodata').length;
}

const dirtyPids = new Set();

window.ROP = {
  markDirty(pid) { dirtyPids.add(pid); },

  applyFilter() {
    renderLimit = 100;
    renderTable();
  },

  async load() {
    renderLimit = 100;
    buildRowData();
    renderTable();
    updateKPIs();
  },

  loadMore() {
    renderLimit += 100;
    renderTable();
  },

  async saveAll() {
    if (dirtyPids.size === 0) { alert('لا توجد تغييرات للحفظ'); return; }

    const rows = document.querySelectorAll('#rop-tbody tr[data-pid]');
    const updates = [];

    rows.forEach(tr => {
      const pid = tr.dataset.pid;
      if (!dirtyPids.has(pid)) return;
      const payload = {};
      tr.querySelectorAll('input[data-field]').forEach(inp => {
        payload[inp.dataset.field] = parseFloat(inp.value) || 0;
      });
      updates.push(update('products', pid, payload));
    });

    try {
      await Promise.all(updates);
      // Update local cache
      rows.forEach(tr => {
        const pid = tr.dataset.pid;
        if (!dirtyPids.has(pid)) return;
        const p = products.find(x => x.id === pid);
        if (!p) return;
        tr.querySelectorAll('input[data-field]').forEach(inp => {
          p[inp.dataset.field] = parseFloat(inp.value) || 0;
        });
      });
      dirtyPids.clear();
      buildRowData();
      renderTable();
      updateKPIs();
      alert(`✅ تم حفظ ${updates.length} أصناف بنجاح`);
    } catch(err) {
      alert('خطأ في الحفظ: ' + err.message);
    }
  },

  exportCSV() {
    const headers = ['الكود', 'الاسم', 'الوحدة', 'المخزون', 'حد الطلب', 'مخزون الأمان', 'الحد الأقصى', 'EOQ', 'الحالة'];
    const statusMap = { critical:'حرج', warning:'تحذير', ok:'طبيعي', nodata:'غير محدد' };
    const rows = rowData.map(r => [
      r.product.sku, r.product.name, r.product.unit,
      r.qty, r.rop, r.safety, r.maxStock, r.eoq,
      statusMap[r.status] || r.status
    ]);
    const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'reorder-points.csv';
    a.click();
  }
};
