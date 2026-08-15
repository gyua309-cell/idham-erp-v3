// ============================================================
// IDHAM ERP — Expiry Date Tracking
// تتبع تواريخ انتهاء الصلاحية للدفعات والمنتجات الغذائية
// ============================================================
import { COLS, getAll } from "../utils/db.js";
import { formatQuantity } from "../utils/formatters.js";

let products  = [];
let stockBal  = [];
let stockTxs  = [];

export async function render(container, user) {
  container.innerHTML = `
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">⏰ تتبع تواريخ انتهاء الصلاحية</h1>
        <p class="page-subtitle">مراقبة تواريخ انتهاء صلاحية الدفعات — تنبيهات مسبقة 30 / 60 / 90 يوم</p>
      </div>

      <div class="filterbar" style="margin-bottom:16px;">
        <select id="exp-filter-days" class="form-control" style="width:200px; height:36px;" onchange="EXP_TRACK.applyFilter()">
          <option value="30">⏰ ستنتهي خلال 30 يوم</option>
          <option value="60">⚠️ ستنتهي خلال 60 يوم</option>
          <option value="90">📅 ستنتهي خلال 90 يوم</option>
          <option value="-1">🔴 منتهية الصلاحية بالفعل</option>
          <option value="0">📋 جميع الدفعات</option>
        </select>
        <input id="exp-search" type="text" class="form-control" placeholder="🔍 بحث بالصنف أو رقم الدفعة..." style="width:240px; height:36px;" oninput="EXP_TRACK.applyFilter()">
        <div style="flex:1;"></div>
        <button class="btn btn-secondary" onclick="EXP_TRACK.printReport()">🖨️ طباعة التقرير</button>
        <button class="btn btn-primary" onclick="EXP_TRACK.exportCSV()">📥 تصدير Excel</button>
      </div>

      <!-- KPI Row -->
      <div class="kpi-grid mb-24" style="grid-template-columns: repeat(5, 1fr);">
        <div class="kpi-card" style="cursor:pointer;" onclick="document.getElementById('exp-filter-days').value='-1'; EXP_TRACK.applyFilter()">
          <div class="status-bar bad"></div>
          <div class="kpi-content">
            <div class="kpi-label">منتهية الصلاحية 🔴</div>
            <div class="kpi-value mono text-bad" id="exp-kpi-expired">—</div>
          </div>
        </div>
        <div class="kpi-card" style="cursor:pointer;" onclick="document.getElementById('exp-filter-days').value='30'; EXP_TRACK.applyFilter()">
          <div class="status-bar bad"></div>
          <div class="kpi-content">
            <div class="kpi-label">تنتهي خلال 30 يوم</div>
            <div class="kpi-value mono text-bad" id="exp-kpi-30">—</div>
          </div>
        </div>
        <div class="kpi-card" style="cursor:pointer;" onclick="document.getElementById('exp-filter-days').value='60'; EXP_TRACK.applyFilter()">
          <div class="status-bar warn"></div>
          <div class="kpi-content">
            <div class="kpi-label">تنتهي خلال 60 يوم</div>
            <div class="kpi-value mono text-warn" id="exp-kpi-60">—</div>
          </div>
        </div>
        <div class="kpi-card" style="cursor:pointer;" onclick="document.getElementById('exp-filter-days').value='90'; EXP_TRACK.applyFilter()">
          <div class="status-bar warn"></div>
          <div class="kpi-content">
            <div class="kpi-label">تنتهي خلال 90 يوم</div>
            <div class="kpi-value mono text-warn" id="exp-kpi-90">—</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="status-bar good"></div>
          <div class="kpi-content">
            <div class="kpi-label">دفعات سليمة</div>
            <div class="kpi-value mono text-good" id="exp-kpi-ok">—</div>
          </div>
        </div>
      </div>

      <div id="exp-loading" class="page-loading" style="min-height:200px;"><div class="loading-spinner"></div></div>

      <div id="exp-wrap" class="hidden">
        <!-- Timeline / Alerts Banner -->
        <div id="exp-alert-banner" style="margin-bottom:16px;"></div>

        <div class="card" style="padding:0;">
          <div class="table-container">
            <table class="data-table" id="exp-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الصنف</th>
                  <th>رقم الدفعة</th>
                  <th>تاريخ الإنتاج</th>
                  <th>تاريخ الانتهاء</th>
                  <th>الأيام المتبقية</th>
                  <th>الكمية المتاحة</th>
                  <th>المخزن / الموقع</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody id="exp-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  await loadData();
}

let allBatches = [];

async function loadData() {
  try {
    [products, stockBal, stockTxs] = await Promise.all([
      getAll(COLS.products()),
      getAll(COLS.stockByWarehouse()),
      getAll(COLS.stockTransactions()),
    ]);

    // Build batch map from stockTransactions (entries with expiryDate)
    const batchMap = {};
    stockTxs.forEach(tx => {
      if (!tx.batchNumber || !tx.expiryDate) return;
      const key = `${tx.productId}_${tx.batchNumber}`;
      if (!batchMap[key]) {
        batchMap[key] = {
          productId:    tx.productId,
          productName:  tx.productName || getProductName(tx.productId),
          sku:          tx.sku || getProductSku(tx.productId),
          batchNumber:  tx.batchNumber,
          productionDate: tx.productionDate || '',
          expiryDate:   tx.expiryDate,
          warehouseId:  tx.warehouseId || '',
          warehouseName:tx.warehouseName || '',
          location:     tx.location || '',
          qty:          0,
        };
      }
      // Net qty: in = +, out = -
      if (tx.type === 'in' || tx.type === 'purchase' || tx.type === 'transfer_in' || tx.type === 'adjustment_in') {
        batchMap[key].qty += (tx.qty || 0);
      } else {
        batchMap[key].qty -= (tx.qty || 0);
      }
    });

    allBatches = Object.values(batchMap).filter(b => b.qty > 0); // Only batches with stock

    // Also include products with expiry but no batch tx
    products.forEach(p => {
      if (!p.expiryDate) return;
      const hasEntry = allBatches.some(b => b.productId === p.id);
      if (!hasEntry) {
        const totalQty = stockBal.filter(s => s.productId === p.id).reduce((s, x) => s + (x.qty || 0), 0);
        if (totalQty > 0) {
          allBatches.push({
            productId: p.id, productName: p.name, sku: p.sku,
            batchNumber: '—', productionDate: '', expiryDate: p.expiryDate,
            warehouseId: '', warehouseName: '', location: '', qty: totalQty,
          });
        }
      }
    });

    updateKPIs();
    applyFilter();

    document.getElementById('exp-loading')?.classList.add('hidden');
    document.getElementById('exp-wrap')?.classList.remove('hidden');
  } catch(err) {
    const el = document.getElementById('exp-loading');
    if (el) el.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
}

function getProductName(id) {
  return products.find(p => p.id === id)?.name || '—';
}
function getProductSku(id) {
  return products.find(p => p.id === id)?.sku || '—';
}

function daysUntilExpiry(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const exp   = new Date(dateStr); exp.setHours(0,0,0,0);
  return Math.floor((exp - today) / 86400000);
}

function updateKPIs() {
  const el = id => document.getElementById(id);
  if (!el('exp-kpi-expired')) return;

  const today = new Date(); today.setHours(0,0,0,0);
  let expired = 0, d30 = 0, d60 = 0, d90 = 0, ok = 0;

  allBatches.forEach(b => {
    const days = daysUntilExpiry(b.expiryDate);
    if (days === null) return;
    if (days < 0)        expired++;
    else if (days <= 30) d30++;
    else if (days <= 60) d60++;
    else if (days <= 90) d90++;
    else                 ok++;
  });

  el('exp-kpi-expired').textContent = expired;
  el('exp-kpi-30').textContent = d30;
  el('exp-kpi-60').textContent = d60;
  el('exp-kpi-90').textContent = d90;
  el('exp-kpi-ok').textContent = ok;
}

function applyFilter() {
  const daysVal  = parseInt(document.getElementById('exp-filter-days')?.value ?? '30');
  const q        = (document.getElementById('exp-search')?.value || '').toLowerCase();

  let filtered = [...allBatches];

  if (daysVal === -1) {
    filtered = filtered.filter(b => {
      const d = daysUntilExpiry(b.expiryDate);
      return d !== null && d < 0;
    });
  } else if (daysVal > 0) {
    filtered = filtered.filter(b => {
      const d = daysUntilExpiry(b.expiryDate);
      return d !== null && d >= 0 && d <= daysVal;
    });
  }

  if (q) {
    filtered = filtered.filter(b =>
      (b.productName||'').toLowerCase().includes(q) ||
      (b.sku||'').toLowerCase().includes(q) ||
      (b.batchNumber||'').toLowerCase().includes(q)
    );
  }

  // Sort by expiryDate ascending
  filtered.sort((a,b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  renderTable(filtered);
  renderAlertBanner(filtered);
}

function renderTable(list) {
  const tbody = document.getElementById('exp-tbody');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="dim" style="text-align:center; padding:40px;">لا توجد دفعات بالمعايير المحددة</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map((b, i) => {
    const days = daysUntilExpiry(b.expiryDate);
    let daysDisplay = '—';
    let rowClass = '';
    let badge = '';

    if (days !== null) {
      if (days < 0) {
        daysDisplay = `<span class="text-bad font-bold">${Math.abs(days)} يوم منذ الانتهاء</span>`;
        rowClass = 'row-highlight-bad';
        badge    = '<span class="badge bad">🔴 منتهية</span>';
      } else if (days === 0) {
        daysDisplay = '<span class="text-bad font-bold">ينتهي اليوم!</span>';
        rowClass = 'row-highlight-bad';
        badge    = '<span class="badge bad">🔴 اليوم</span>';
      } else if (days <= 7) {
        daysDisplay = `<span class="text-bad font-bold">${days} يوم</span>`;
        rowClass = 'row-highlight-bad';
        badge    = '<span class="badge bad">🔴 عاجل</span>';
      } else if (days <= 30) {
        daysDisplay = `<span class="text-warn font-bold">${days} يوم</span>`;
        rowClass = 'row-highlight-warn';
        badge    = '<span class="badge warn">🟡 قريب</span>';
      } else if (days <= 60) {
        daysDisplay = `<span class="text-warn">${days} يوم</span>`;
        badge    = '<span class="badge warn">🟡 تحذير</span>';
      } else {
        daysDisplay = `${days} يوم`;
        badge    = '<span class="badge good">🟢 سليم</span>';
      }
    }

    return `
      <tr class="${rowClass}">
        <td class="mono">${i + 1}</td>
        <td>
          <div style="font-weight:600;">${b.productName}</div>
          <div class="mono" style="font-size:11px; color:var(--text-2);">${b.sku}</div>
        </td>
        <td class="mono font-bold">${b.batchNumber}</td>
        <td class="mono">${b.productionDate || '—'}</td>
        <td class="mono font-bold">${b.expiryDate}</td>
        <td>${daysDisplay}</td>
        <td class="mono font-bold">${formatQuantity(b.qty)}</td>
        <td>
          <div style="font-size:12px;">${b.warehouseName || '—'}</div>
          ${b.location ? `<div class="mono" style="font-size:11px; color:var(--text-2);">${b.location}</div>` : ''}
        </td>
        <td>${badge}</td>
      </tr>
    `;
  }).join('');
}

function renderAlertBanner(list) {
  const banner = document.getElementById('exp-alert-banner');
  if (!banner) return;

  const expired = list.filter(b => daysUntilExpiry(b.expiryDate) < 0);
  const urgent  = list.filter(b => { const d = daysUntilExpiry(b.expiryDate); return d !== null && d >= 0 && d <= 7; });

  if (expired.length === 0 && urgent.length === 0) {
    banner.innerHTML = '';
    return;
  }

  let html = '';
  if (expired.length > 0) {
    html += `<div class="alert bad" style="margin-bottom:8px;">🚨 <strong>${expired.length} دفعة منتهية الصلاحية</strong> — يجب إخراجها فوراً من المخزن!</div>`;
  }
  if (urgent.length > 0) {
    html += `<div class="alert warn" style="margin-bottom:8px;">⚠️ <strong>${urgent.length} دفعة</strong> ستنتهي خلال 7 أيام — يجب التصرف العاجل!</div>`;
  }
  banner.innerHTML = html;
}

window.EXP_TRACK = {
  applyFilter,

  exportCSV() {
    const headers = ['الصنف','كود الصنف','رقم الدفعة','تاريخ الإنتاج','تاريخ الانتهاء','الأيام المتبقية','الكمية','المخزن','الموقع'];
    const rows = allBatches.map(b => [
      b.productName, b.sku, b.batchNumber, b.productionDate||'',
      b.expiryDate, daysUntilExpiry(b.expiryDate) ?? '—',
      b.qty, b.warehouseName||'', b.location||''
    ]);
    const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'expiry-tracking.csv';
    a.click();
  },

  printReport() {
    window.print();
  }
};
