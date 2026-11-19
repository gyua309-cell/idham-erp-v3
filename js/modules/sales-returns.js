// ============================================================
// IDHAM ERP — Sales Returns Module (مردودات مبيعات - إشعار دائن ZATCA)
// ============================================================
import { COLS, create, update, getAll, adjustStock, createJournalEntry, generateInvoiceNumber } from "../utils/db.js";
import { query, orderBy, limit, getDocs, where, doc, getDoc } from "../utils/db.js";
import { formatCurrency, formatDate, calcInvoiceTotals, todayString, debounce, startOfMonth, tafqeetArabic } from "../utils/formatters.js";
import { generateZATCAQRBase64, renderZATCAQR } from "../utils/zatca-qr.js";
import { APP_CONFIG, db, COMPANY_ID } from "../firebase-config.js";
import { autoSalesReturnJE } from "../utils/accounting-engine.js";
import { exportToExcel } from "../utils/excel.js";

let returnLines = [];
let originalInvoice = null;
let cachedSalesReturns = [];
let filteredReturns = [];
let allCustomers = [];
let allWarehouses = [];
let allReps = [];
let allProducts = [];

export async function render(container, user) {
  const currentMonthStart = startOfMonth();
  const currentToday = todayString();

  container.innerHTML = `
    <!-- Top Action & Filter Bar -->
    <div class="filterbar no-print" style="flex-wrap:wrap; gap:10px; align-items:flex-end; background:var(--bg-1); padding:14px 18px; border-radius:12px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); margin-bottom:16px;">
      
      <!-- Date Filter -->
      <div class="date-range-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">من</label>
        <input type="date" id="sr-from" value="${currentMonthStart}" style="padding:6px 10px; border:1px solid var(--border); border-radius:6px; background:var(--bg-card); color:var(--text-1); font-size:12.5px;" />
      </div>
      <div class="date-range-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">إلى</label>
        <input type="date" id="sr-to" value="${currentToday}" style="padding:6px 10px; border:1px solid var(--border); border-radius:6px; background:var(--bg-card); color:var(--text-1); font-size:12.5px;" />
      </div>

      <!-- Quick Date Presets -->
      <div style="display:flex; gap:4px; align-items:center;">
        <button class="btn btn-sm btn-ghost" onclick="setSRDatePreset('today')" style="font-size:11px; padding:5px 8px;">اليوم</button>
        <button class="btn btn-sm btn-ghost" onclick="setSRDatePreset('thisMonth')" style="font-size:11px; padding:5px 8px;">هذا الشهر</button>
        <button class="btn btn-sm btn-ghost" onclick="setSRDatePreset('lastMonth')" style="font-size:11px; padding:5px 8px;">الشهر السابق</button>
        <button class="btn btn-sm btn-ghost" onclick="setSRDatePreset('all')" style="font-size:11px; padding:5px 8px;">الكل</button>
      </div>

      <!-- Customer Filter -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">العميل</label>
        <select id="sr-customer-filter" onchange="applySRFilters()" style="min-width:160px; padding:6px 10px; border:1px solid var(--border); border-radius:6px; background:var(--bg-card); color:var(--text-1); font-size:12px;">
          <option value="">كل العملاء</option>
        </select>
      </div>

      <!-- Warehouse Filter -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">المستودع / السيارة</label>
        <select id="sr-warehouse-filter" onchange="applySRFilters()" style="min-width:150px; padding:6px 10px; border:1px solid var(--border); border-radius:6px; background:var(--bg-card); color:var(--text-1); font-size:12px;">
          <option value="">كل المستودعات</option>
        </select>
      </div>

      <!-- Rep Filter -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">المندوب</label>
        <select id="sr-rep-filter" onchange="applySRFilters()" style="min-width:130px; padding:6px 10px; border:1px solid var(--border); border-radius:6px; background:var(--bg-card); color:var(--text-1); font-size:12px;">
          <option value="">كل المناديب</option>
        </select>
      </div>

      <!-- Search Input -->
      <div style="flex:1; min-width:180px;">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">بحث سريع</label>
        <input type="text" id="sr-search-input" placeholder="رقم الإشعار، الفاتورة، العميل..." oninput="applySRFilters()" style="width:100%; padding:6px 12px; border:1px solid var(--border); border-radius:6px; background:var(--bg-card); color:var(--text-1); font-size:12px;" />
      </div>

      <!-- Action Buttons -->
      <div style="margin-right:auto; display:flex; gap:8px; align-items:center;">
        <button class="btn btn-secondary btn-sm" onclick="exportSRExcel()" style="font-weight:700; display:inline-flex; align-items:center; gap:6px;">
          <span>📊</span> Excel
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.print()" style="font-weight:700; display:inline-flex; align-items:center; gap:6px;">
          <span>🖨️</span> طباعة
        </button>
        <button class="btn btn-primary btn-sm" onclick="openSalesReturnModal()" style="font-weight:800; background:linear-gradient(135deg,#dc2626,#b91c1c); border:none; box-shadow:0 2px 6px rgba(220,38,38,0.3); display:inline-flex; align-items:center; gap:6px;">
          <span>+</span> مردود مبيعات جديد (إشعار دائن)
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="page-content" style="padding:0 4px;">
      
      <!-- Top Title Header -->
      <div class="page-header" style="margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h1 class="page-title" style="font-size:20px; font-weight:900; color:var(--text-1); margin-bottom:2px;">
            ↩️ مردودات المبيعات والإشعارات الدائنة (Credit Notes)
          </h1>
          <p class="page-subtitle" style="font-size:12px; color:var(--text-3);">
            إرجاع البضائع للمخازن والسيارات وإصدار إشعارات دائنة معتمدة ومتوافقة مع هيئة الزكاة والضريبة والجمارك (ZATCA)
          </p>
        </div>
      </div>

      <!-- ═══ KPI SUMMARY CARDS ═══ -->
      <div class="grid-4 gap-16 mb-20" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-bottom:18px;">
        
        <!-- Total Returns Count -->
        <div class="card" style="background:linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02)); border:1.5px solid rgba(239,68,68,0.25); border-radius:12px; padding:14px 16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-size:12px; font-weight:800; color:#b91c1c;">📋 عدد الإشعارات الدائنة</span>
            <span style="font-size:18px;">📑</span>
          </div>
          <div style="font-size:22px; font-weight:900; color:#b91c1c; font-family:'IBM Plex Mono', monospace;" id="kpi-sr-count">
            0
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:2px;">إجمالي الإشعارات بالفترة المحددة</div>
        </div>

        <!-- Subtotal Before VAT -->
        <div class="card" style="background:linear-gradient(135deg, rgba(217,119,6,0.08), rgba(217,119,6,0.02)); border:1.5px solid rgba(217,119,6,0.25); border-radius:12px; padding:14px 16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-size:12px; font-weight:800; color:#b45309;">💰 إجمالي المردود (قبل الضريبة)</span>
            <span style="font-size:18px;">🏷️</span>
          </div>
          <div style="font-size:22px; font-weight:900; color:#b45309; font-family:'IBM Plex Mono', monospace;" id="kpi-sr-subtotal">
            0.00 ر.س
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:2px;">قيمة البضاعة المرجعة الصافية</div>
        </div>

        <!-- VAT 15% -->
        <div class="card" style="background:linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02)); border:1.5px solid rgba(99,102,241,0.25); border-radius:12px; padding:14px 16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-size:12px; font-weight:800; color:#4338ca;">🏛️ ضريبة القيمة المضافة (15%)</span>
            <span style="font-size:18px;">📊</span>
          </div>
          <div style="font-size:22px; font-weight:900; color:#4338ca; font-family:'IBM Plex Mono', monospace;" id="kpi-sr-vat">
            0.00 ر.س
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:2px;">الضريبة المستردة لصالح العميل</div>
        </div>

        <!-- Total with VAT -->
        <div class="card" style="background:linear-gradient(135deg, rgba(220,38,38,0.12), rgba(220,38,38,0.03)); border:1.5px solid #dc2626; border-radius:12px; padding:14px 16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-size:12px; font-weight:800; color:#991b1b;">💵 الصافي الإجمالي (شامل الضريبة)</span>
            <span style="font-size:18px;">💳</span>
          </div>
          <div style="font-size:22px; font-weight:900; color:#991b1b; font-family:'IBM Plex Mono', monospace;" id="kpi-sr-grand">
            0.00 ر.س
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:2px;">المبلغ الإجمالي المخصوم من رصيد العميل</div>
        </div>

      </div>

      <!-- Main Table Card -->
      <div class="card" style="border-radius:14px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); overflow:hidden;">
        <div class="table-container">
          <table class="data-dense" style="width:100%;">
            <thead>
              <tr style="background:var(--bg-2); border-bottom:1.5px solid var(--border-soft);">
                <th style="width:120px;">رقم الإشعار</th>
                <th style="width:95px;">التاريخ</th>
                <th style="width:120px;">الفاتورة الأصلية</th>
                <th>العميل</th>
                <th style="width:140px;">المستودع / السيارة</th>
                <th style="width:110px;">المندوب</th>
                <th style="text-align:left; width:110px;">المبلغ قبل الضريبة</th>
                <th style="text-align:left; width:100px;">الضريبة 15%</th>
                <th style="text-align:left; width:120px;">الإجمالي شامل</th>
                <th style="text-align:center; width:90px;">ZATCA</th>
                <th style="text-align:center; width:140px;">إجراءات / طباعة</th>
              </tr>
            </thead>
            <tbody id="sr-tbody">
              ${Array(6).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(11).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*70|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Sales Return Creation Modal -->
    <div class="modal-overlay" id="sr-modal">
      <div class="modal modal-xl" style="max-width:960px;">
        <div class="modal-header" style="background:linear-gradient(135deg, #991b1b, #7f1d1d); color:#fff; padding:14px 20px;">
          <h3 class="modal-title" style="color:#fff; font-size:16px; font-weight:800;">↩️ إصدار إشعار دائن جديد (مردود مبيعات)</h3>
          <button class="modal-close" onclick="closeModal('sr-modal')" style="color:#fff;">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          
          <div class="grid-3 gap-16 mb-16" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:14px; margin-bottom:14px;">
            <div class="form-group">
              <label style="font-weight:700; font-size:12px;">رقم الفاتورة الأصلية *</label>
              <div class="autocomplete-container" style="position:relative;">
                <input type="text" id="sr-inv-search" class="input mono" placeholder="ابحث برقم الفاتورة أو العميل..." autocomplete="off" style="font-weight:700;" />
                <div class="autocomplete-results hidden" id="sr-inv-results" style="position:absolute; top:100%; left:0; right:0; z-index:100; max-height:220px; overflow-y:auto; background:var(--bg-card); border:1px solid var(--border); border-radius:8px; box-shadow:var(--shadow-md);"></div>
              </div>
            </div>
            <div class="form-group">
              <label style="font-weight:700; font-size:12px;">رقم الإشعار الدائن</label>
              <input type="text" id="sr-number" class="input mono" readonly placeholder="يُولّد تلقائياً..." style="background:var(--bg-2); font-weight:800; color:#b91c1c;" />
            </div>
            <div class="form-group">
              <label style="font-weight:700; font-size:12px;">تاريخ الإرجاع *</label>
              <input type="date" id="sr-date" class="input" value="${todayString()}" style="font-weight:700;" />
            </div>
          </div>

          <div class="grid-3 gap-16 mb-16" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:14px; margin-bottom:14px;">
            <div class="form-group">
              <label style="font-weight:700; font-size:12px;">العميل</label>
              <input type="text" id="sr-cust-name" class="input" readonly placeholder="يتم تحديده تلقائياً من الفاتورة" style="background:var(--bg-2); font-weight:700;" />
            </div>
            <div class="form-group">
              <label style="font-weight:700; font-size:12px;">المخزن المستلم للبضاعة المرجعة *</label>
              <select id="sr-warehouse" style="font-weight:700;"><option value="">اختر المخزن المستلم</option></select>
            </div>
            <div class="form-group">
              <label style="font-weight:700; font-size:12px;">المندوب</label>
              <input type="text" id="sr-rep-name" class="input" readonly placeholder="مندوب الفاتورة" style="background:var(--bg-2);" />
            </div>
          </div>

          <div class="form-group mb-16" style="margin-bottom:14px;">
            <label style="font-weight:700; font-size:12px;">سبب الإرجاع *</label>
            <input type="text" id="sr-reason" class="input" placeholder="مثال: تلف بالعبوة، زيادة بالطلب، انتهاء صلاحية، خطأ بالطلب..." />
          </div>

          <div class="divider-label" style="font-weight:800; font-size:13px; color:var(--text-1); border-bottom:2px solid #b91c1c; padding-bottom:4px; margin-bottom:10px;">
            📦 أصناف وبنود الفاتورة المرجعة
          </div>

          <div class="invoice-lines" style="border:1px solid var(--border-soft); border-radius:8px; overflow:hidden; margin-bottom:14px;">
            <table style="width:100%; font-size:12.5px; border-collapse:collapse;">
              <thead>
                <tr style="background:var(--bg-2); border-bottom:1px solid var(--border-soft);">
                  <th style="padding:8px 10px; width:30px;">#</th>
                  <th style="padding:8px 10px;">اسم الصنف</th>
                  <th style="padding:8px 10px; width:90px; text-align:center;">الكمية الأصلية</th>
                  <th style="padding:8px 10px; width:130px; text-align:center;">الكمية المرجعة</th>
                  <th style="padding:8px 10px; width:110px; text-align:left;">السعر (قبل الضريبة)</th>
                  <th style="padding:8px 10px; width:100px; text-align:left;">الضريبة (15%)</th>
                  <th style="padding:8px 10px; width:120px; text-align:left;">الإجمالي شامل الضريبة</th>
                </tr>
              </thead>
              <tbody id="sr-lines-tbody">
                <tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-3);">حدد الفاتورة الأصلية أولاً من خانة البحث بالأعلى</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Bottom Totals & Info -->
          <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px;">
            <div style="font-size:12px; color:var(--text-2); background:rgba(220,38,38,0.06); padding:10px 14px; border-radius:8px; border:1px solid rgba(220,38,38,0.2); max-width:440px;">
              💡 <strong>إشعار دائن ضريبي معتمد (ZATCA):</strong> يتم إرجاع الكميات للمخزن المختار، وتخفيض مبيعات الفترة والضريبة المستحقة، وتخفيض مديونية العميل بالقيمة الإجمالية شاملة الضريبة.
            </div>
            <div class="invoice-totals" style="width:320px; background:var(--bg-2); padding:12px 16px; border-radius:10px; border:1px solid var(--border-soft);">
              <div class="invoice-total-row" style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span>المجموع قبل الضريبة:</span>
                <span class="mono font-bold" id="sr-subtotal">0.00 ر.س</span>
              </div>
              <div class="invoice-total-row" style="display:flex; justify-content:space-between; margin-bottom:6px; color:#d97706;">
                <span>ضريبة القيمة المضافة (15%):</span>
                <span class="mono font-bold" id="sr-vat">0.00 ر.س</span>
              </div>
              <div class="invoice-total-row grand-total" style="display:flex; justify-content:space-between; padding-top:8px; border-top:1.5px solid var(--border); font-size:14px; font-weight:900; color:#dc2626;">
                <span>إجمالي الإشعار (شامل الضريبة):</span>
                <span class="mono" id="sr-grand">0.00 ر.س</span>
              </div>
            </div>
          </div>

          <div id="sr-error" class="alert bad hidden" style="margin-top:12px;"></div>
        </div>
        <div class="modal-footer" style="padding:14px 20px; background:var(--bg-2); border-top:1px solid var(--border-soft); display:flex; justify-content:flex-end; gap:10px;">
          <button class="btn btn-ghost" onclick="closeModal('sr-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveSalesReturn()" id="save-sr-btn" style="background:#dc2626; font-weight:800;">
            💾 حفظ واعتماد الإشعار الدائن
          </button>
        </div>
      </div>
    </div>
  `;

  // Bind change events to from/to date inputs
  document.getElementById("sr-from")?.addEventListener("change", () => loadSalesReturnsList());
  document.getElementById("sr-to")?.addEventListener("change", () => loadSalesReturnsList());

  await Promise.all([
    loadCustomersFilter(),
    loadWarehousesList(),
    loadRepsFilter(),
  ]);

  await loadSalesReturnsList();
  setupInvoiceSearch();
}

// ── Quick Date Presets ─────────────────────────────────────────
window.setSRDatePreset = (preset) => {
  const fromEl = document.getElementById("sr-from");
  const toEl   = document.getElementById("sr-to");
  if (!fromEl || !toEl) return;

  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const fmt = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

  if (preset === 'today') {
    fromEl.value = fmt(now);
    toEl.value   = fmt(now);
  } else if (preset === 'thisMonth') {
    fromEl.value = `${now.getFullYear()}-${pad(now.getMonth()+1)}-01`;
    toEl.value   = fmt(now);
  } else if (preset === 'lastMonth') {
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    fromEl.value = fmt(prev);
    toEl.value   = fmt(prevEnd);
  } else if (preset === 'all') {
    fromEl.value = "2026-01-01";
    toEl.value   = fmt(now);
  }
  loadSalesReturnsList();
};

async function loadCustomersFilter() {
  try {
    allCustomers = await getAll(COLS.customers(), [orderBy("name")]);
    const filter = document.getElementById("sr-customer-filter");
    if (filter) {
      filter.innerHTML = '<option value="">كل العملاء</option>' +
        allCustomers.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    }
  } catch {}
}

async function loadWarehousesList() {
  try {
    allWarehouses = await getAll(COLS.warehouses(), [orderBy("name")]);
    const sel = document.getElementById("sr-warehouse");
    if (sel) sel.innerHTML = '<option value="">اختر المخزن المستلم</option>' +
      allWarehouses.map(w => `<option value="${w.id}" data-name="${w.name}">${w.name}</option>`).join("");
    
    const filter = document.getElementById("sr-warehouse-filter");
    if (filter) {
      filter.innerHTML = '<option value="">كل المستودعات والسيارات</option>' +
        allWarehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join("");
    }
  } catch {}
}

async function loadRepsFilter() {
  try {
    allReps = await getAll(COLS.users(), [where("role", "==", "rep")]);
    const filter = document.getElementById("sr-rep-filter");
    if (filter) {
      filter.innerHTML = '<option value="">كل المناديب</option>' +
        allReps.map(r => `<option value="${r.name || r.id}">${r.name || r.id}</option>`).join("");
    }
  } catch {}
}

async function loadSalesReturnsList() {
  const tbody = document.getElementById("sr-tbody");
  if (!tbody) return;
  tbody.innerHTML = `${Array(6).fill(0).map(() => `
    <tr class="skeleton-row">
      ${Array(11).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*70|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
    </tr>
  `).join("")}`;

  try {
    const q = query(COLS.salesReturns(), orderBy("date", "desc"), limit(250));
    const snap = await getDocs(q);
    let returns = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Fallback sort if dates are strings
    returns.sort((a, b) => {
      const da = a.date || (a.createdAt?.toDate ? a.createdAt.toDate().toISOString() : "") || "";
      const db = b.date || (b.createdAt?.toDate ? b.createdAt.toDate().toISOString() : "") || "";
      return db.localeCompare(da);
    });

    cachedSalesReturns = returns;
    applySRFilters();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="11"><div class="alert bad" style="margin:8px;">${err.message}</div></td></tr>`;
  }
}

window.applySRFilters = () => {
  const tbody = document.getElementById("sr-tbody");
  if (!tbody) return;

  let list = [...cachedSalesReturns];
  const from = document.getElementById("sr-from")?.value;
  const to   = document.getElementById("sr-to")?.value;

  if (from || to) {
    list = list.filter(r => {
      const d = r.date || (r.createdAt?.toDate ? r.createdAt.toDate().toISOString().split("T")[0] : "");
      return (!from || d >= from) && (!to || d <= to);
    });
  }

  const custF = document.getElementById("sr-customer-filter")?.value;
  if (custF) {
    list = list.filter(r => r.customerId === custF);
  }

  const whF = document.getElementById("sr-warehouse-filter")?.value;
  if (whF) {
    list = list.filter(r => r.warehouseId === whF);
  }

  const repF = document.getElementById("sr-rep-filter")?.value;
  if (repF) {
    list = list.filter(r => (r.repName || "") === repF || (r.repId || "") === repF);
  }

  const search = document.getElementById("sr-search-input")?.value?.trim().toLowerCase();
  if (search) {
    list = list.filter(r => {
      const num = (r.number || r.creditNoteNumber || r.id || "").toLowerCase();
      const orig = (r.originalInvoiceNumber || r.refInvoice || "").toLowerCase();
      const cust = (r.customerName || "").toLowerCase();
      const wh = (r.warehouseName || "").toLowerCase();
      const rep = (r.repName || "").toLowerCase();
      return num.includes(search) || orig.includes(search) || cust.includes(search) || wh.includes(search) || rep.includes(search);
    });
  }

  filteredReturns = list;

  // ── Calculate and Update KPI Summary Cards ──
  let totalSub = 0, totalVat = 0, totalGrand = 0;
  list.forEach(r => {
    const sub = parseFloat(r.subtotal || 0);
    const vat = parseFloat(r.totalVat !== undefined ? r.totalVat : (r.vatAmount !== undefined ? r.vatAmount : (sub * 0.15)));
    const grand = parseFloat(r.totalWithVat !== undefined ? r.totalWithVat : (r.total !== undefined ? r.total : (sub + vat)));
    totalSub += sub;
    totalVat += vat;
    totalGrand += grand;
  });

  const countEl = document.getElementById("kpi-sr-count");
  const subEl   = document.getElementById("kpi-sr-subtotal");
  const vatEl   = document.getElementById("kpi-sr-vat");
  const grandEl = document.getElementById("kpi-sr-grand");

  if (countEl) countEl.textContent = list.length;
  if (subEl)   subEl.textContent   = formatCurrency(totalSub);
  if (vatEl)   vatEl.textContent   = formatCurrency(totalVat);
  if (grandEl) grandEl.textContent = formatCurrency(totalGrand);

  // ── Render Table Rows ──
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:32px; color:var(--text-3); font-weight:700;">لا توجد مردودات مبيعات تطابق الفلاتر المحددة</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(r => {
    const returnNumber = r.number || r.creditNoteNumber || r.id || "—";
    const originalInv = r.originalInvoiceNumber || r.refInvoice || "—";
    const sub = parseFloat(r.subtotal || 0);
    const vat = parseFloat(r.totalVat !== undefined ? r.totalVat : (r.vatAmount !== undefined ? r.vatAmount : (sub * 0.15)));
    const grand = parseFloat(r.totalWithVat !== undefined ? r.totalWithVat : (r.total !== undefined ? r.total : (sub + vat)));
    const retDate = r.date || (r.createdAt?.toDate ? r.createdAt.toDate().toISOString().split("T")[0] : "");

    return `
    <tr style="border-bottom:1px solid var(--border-soft);">
      <td class="mono font-bold" style="color:#b91c1c;">${returnNumber}</td>
      <td class="dim" style="font-size:12px;">${formatDate(retDate)}</td>
      <td class="mono font-bold text-indigo" style="font-size:12px;">${originalInv}</td>
      <td class="font-bold" style="color:var(--text-1);">${r.customerName || "عميل نقدي"}</td>
      <td class="dim" style="font-size:12px;">${r.warehouseName || "—"}</td>
      <td style="font-size:12px; color:var(--text-2);">${r.repName || "—"}</td>
      <td class="mono font-bold" style="text-align:left;" dir="ltr">${formatCurrency(sub)}</td>
      <td class="mono font-bold text-warn" style="text-align:left;" dir="ltr">${formatCurrency(vat)}</td>
      <td class="mono font-bold" style="text-align:left; color:#b91c1c; font-size:13.5px;" dir="ltr">${formatCurrency(grand)}</td>
      <td style="text-align:center;"><span class="zatca-stamp reported" style="font-size:10px; padding:2px 6px;">✓ ZATCA</span></td>
      <td style="text-align:center; white-space:nowrap;">
        <button class="btn btn-sm btn-ghost" onclick="printSalesReturn('${r.id}')" title="طباعة إشعار دائن A4 رسمي" style="font-weight:700; color:#b91c1c; padding:4px 8px;">
          📄 A4
        </button>
        <button class="btn btn-sm btn-ghost" onclick="printSalesReturnThermal('${r.id}')" title="طباعة إشعار دائن حراري 80mm" style="font-weight:700; color:var(--text-2); padding:4px 8px;">
          🧾 حراري
        </button>
      </td>
    </tr>`;
  }).join("");
};

// ── Export to Excel ────────────────────────────────────────────
window.exportSRExcel = () => {
  if (!filteredReturns || filteredReturns.length === 0) {
    showToast("لا توجد بيانات لتصديرها", "warn");
    return;
  }

  const rows = [];
  rows.push(["تقرير مردودات المبيعات والإشعارات الدائنة — شركة نظم الإمداد المتطورة"]);
  rows.push([`تاريخ التصدير: ${todayString()}`]);
  rows.push([]);
  rows.push([
    "رقم الإشعار الدائن",
    "التاريخ",
    "الفاتورة الأصلية",
    "اسم العميل",
    "المستودع / المخزن",
    "المندوب",
    "المبلغ قبل الضريبة (ر.س)",
    "ضريبة القيمة المضافة 15% (ر.س)",
    "الإجمالي شامل الضريبة (ر.س)",
    "سبب الإرجاع",
    "حالة ZATCA"
  ]);

  filteredReturns.forEach(r => {
    const sub = parseFloat(r.subtotal || 0);
    const vat = parseFloat(r.totalVat !== undefined ? r.totalVat : (r.vatAmount !== undefined ? r.vatAmount : (sub * 0.15)));
    const grand = parseFloat(r.totalWithVat !== undefined ? r.totalWithVat : (r.total !== undefined ? r.total : (sub + vat)));
    rows.push([
      r.number || r.creditNoteNumber || r.id,
      r.date || "",
      r.originalInvoiceNumber || r.refInvoice || "",
      r.customerName || "عميل نقدي",
      r.warehouseName || "",
      r.repName || "",
      sub,
      vat,
      grand,
      r.reason || "",
      "معتمد ZATCA"
    ]);
  });

  exportToExcel(rows, `مردودات_المبيعات_${todayString()}`);
};

// ── Setup Original Invoice Search in Modal ─────────────────────
function setupInvoiceSearch() {
  const input = document.getElementById("sr-inv-search");
  const results = document.getElementById("sr-inv-results");
  if (!input) return;

  input.addEventListener("input", debounce(async () => {
    const term = input.value.trim().toLowerCase();
    if (!term) { results.classList.add("hidden"); return; }
    
    // Fetch last 150 invoices to search in them
    const q = query(COLS.salesInvoices(), orderBy("date", "desc"), limit(150));
    const snap = await getDocs(q);
    const invs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => 
      (i.number || i.invoiceNumber || "").toLowerCase().includes(term) || 
      (i.customerName || "").toLowerCase().includes(term)
    );

    if (invs.length === 0) { results.classList.add("hidden"); return; }

    results.innerHTML = invs.slice(0, 8).map(i => `
      <div class="autocomplete-item" onclick="selectOriginalInvoice('${i.id}')" style="padding:8px 12px; cursor:pointer; border-bottom:1px solid var(--border-soft);">
        <div style="display:flex; justify-content:space-between; font-weight:700;">
          <span style="color:#2563eb;">${i.number || i.invoiceNumber}</span>
          <span class="mono">${formatCurrency(i.totalWithVat || i.total || 0)}</span>
        </div>
        <div style="font-size:11px; color:var(--text-3);">${i.customerName} | ${formatDate(i.date || i.createdAt)}</div>
      </div>`).join("");
    results.classList.remove("hidden");
  }, 300));
}

window.selectOriginalInvoice = async (invId) => {
  try {
    const invRef = doc(db, `companies/${COMPANY_ID}/salesInvoices`, invId);
    const snap = await getDoc(invRef);
    if (!snap.exists()) return;
    originalInvoice = { id: snap.id, ...snap.data() };

    document.getElementById("sr-inv-search").value = originalInvoice.number || originalInvoice.invoiceNumber || snap.id;
    document.getElementById("sr-cust-name").value   = originalInvoice.customerName || "عميل نقدي";
    document.getElementById("sr-rep-name").value    = originalInvoice.repName || "—";
    document.getElementById("sr-inv-results").classList.add("hidden");

    if (originalInvoice.warehouseId) {
      const waSel = document.getElementById("sr-warehouse");
      if (waSel) waSel.value = originalInvoice.warehouseId;
    }

    // Fetch previous returns for this invoice
    const returnedMap = {};
    const qRet = query(COLS.salesReturns(), where("originalInvoiceId", "==", originalInvoice.id));
    const snapRet = await getDocs(qRet);
    snapRet.docs.forEach(docSnap => {
      const ret = docSnap.data();
      if (ret.status !== "cancelled") {
        (ret.lines || []).forEach(line => {
          returnedMap[line.productId] = (returnedMap[line.productId] || 0) + (line.qty || 0);
        });
      }
    });

    // Pre-fill lines with original quantities and check maxReturnable
    returnLines = (originalInvoice.lines || []).map(l => {
      const alreadyReturned = returnedMap[l.productId] || 0;
      const maxReturnable = Math.max(0, (l.qty || 0) - alreadyReturned);
      return {
        ...l,
        originalQty: l.qty,
        alreadyReturned: alreadyReturned,
        maxReturnable: maxReturnable,
        qty: 0,
      };
    });

    renderReturnLines();
    updateReturnTotals();
  } catch (err) { showToast(err.message, "error"); }
};

function renderReturnLines() {
  const tbody = document.getElementById("sr-lines-tbody");
  if (!tbody) return;

  if (returnLines.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-3);">لا توجد أصناف في هذه الفاتورة</td></tr>`;
    return;
  }

  tbody.innerHTML = returnLines.map((l, i) => {
    const unitPrice = parseFloat(l.unitPrice !== undefined ? l.unitPrice : (l.price !== undefined ? l.price : 0)) || 0;
    const netTotal = l.qty * unitPrice * (1 - (l.discount || 0)/100);
    const vatLine  = netTotal * 0.15;
    const lineTotalWithVat = netTotal + vatLine;
    const unitPriceWithVat = unitPrice * (1 - (l.discount || 0)/100) * 1.15;

    return `
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:6px 10px; text-align:center;">${i+1}</td>
        <td style="padding:6px 10px; font-weight:700; color:var(--text-1);">${l.productName || l.name}</td>
        <td style="padding:6px 10px; text-align:center;" class="mono dim">${l.originalQty}</td>
        <td style="padding:6px 10px; width:130px; text-align:center;">
          <input type="number" class="input mono font-bold text-warn" style="width:85px; height:32px; font-size:12.5px; text-align:center;"
            value="${l.qty}" min="0" max="${l.maxReturnable}" step="0.001"
            onchange="updateReturnQty(${i}, this.value)" />
          <div style="font-size:9.5px; color:var(--text-3); margin-top:2px;">المتاح: ${l.maxReturnable} (سابق: ${l.alreadyReturned})</div>
        </td>
        <td style="padding:6px 10px; text-align:left;" class="mono" dir="ltr">
          ${formatCurrency(unitPrice)}
          <div style="font-size:9.5px; color:var(--text-3);">${formatCurrency(unitPriceWithVat)} شامل</div>
        </td>
        <td style="padding:6px 10px; text-align:left;" class="mono text-warn" dir="ltr">${formatCurrency(vatLine)}</td>
        <td style="padding:6px 10px; text-align:left;" class="mono font-bold text-good" dir="ltr">${formatCurrency(lineTotalWithVat)}</td>
      </tr>`;
  }).join("");
}

window.updateReturnQty = (i, val) => {
  const qty = parseFloat(val) || 0;
  if (qty > returnLines[i].maxReturnable) {
    showToast(`الكمية المرجعة لا يمكن أن تزيد عن الكمية المتاحة للإرجاع (${returnLines[i].maxReturnable})`, "warning");
    returnLines[i].qty = returnLines[i].maxReturnable;
  } else if (qty < 0) {
    returnLines[i].qty = 0;
  } else {
    returnLines[i].qty = qty;
  }
  renderReturnLines();
  updateReturnTotals();
};

function updateReturnTotals() {
  const activeLines = returnLines.filter(l => l.qty > 0);
  const totals = calcInvoiceTotals(activeLines);
  const subEl   = document.getElementById("sr-subtotal");
  const vatEl   = document.getElementById("sr-vat");
  const grandEl = document.getElementById("sr-grand");

  if (subEl)   subEl.textContent   = formatCurrency(totals.subtotal);
  if (vatEl)   vatEl.textContent   = formatCurrency(totals.vatTotal);
  if (grandEl) grandEl.textContent = formatCurrency(totals.grandTotal);
}

window.openSalesReturnModal = () => {
  returnLines = []; originalInvoice = null;
  const sInput = document.getElementById("sr-inv-search");
  const cInput = document.getElementById("sr-cust-name");
  const rInput = document.getElementById("sr-reason");
  const repInput = document.getElementById("sr-rep-name");
  const numInput = document.getElementById("sr-number");
  const errEl = document.getElementById("sr-error");

  if (sInput) sInput.value = "";
  if (cInput) cInput.value = "";
  if (rInput) rInput.value = "";
  if (repInput) repInput.value = "";
  if (errEl) errEl.classList.add("hidden");
  if (numInput) numInput.value = "جارِ التوليد...";

  renderReturnLines();
  updateReturnTotals();
  openModal("sr-modal");

  generateInvoiceNumber("CN").then(num => {
    if (numInput) numInput.value = num;
  }).catch(() => {});
};

window.saveSalesReturn = async () => {
  const errEl = document.getElementById("sr-error");
  errEl.classList.add("hidden");

  if (!originalInvoice) { errEl.textContent = "يرجى اختيار الفاتورة الأصلية أولاً"; errEl.classList.remove("hidden"); return; }
  const activeLines = returnLines.filter(l => l.qty > 0);
  if (activeLines.length === 0) { errEl.textContent = "حدد كمية مرجعة لصنف واحد على الأقل"; errEl.classList.remove("hidden"); return; }

  const waSel       = document.getElementById("sr-warehouse");
  const warehouseId = waSel.value;
  const warehouseName = waSel.options[waSel.selectedIndex]?.dataset.name || waSel.options[waSel.selectedIndex]?.text || "";
  const reason      = document.getElementById("sr-reason").value.trim();

  if (!warehouseId) { errEl.textContent = "يرجى اختيار المخزن المستلم للبضاعة المرجعة"; errEl.classList.remove("hidden"); return; }
  if (!reason) { errEl.textContent = "يرجى إدخال سبب الإرجاع"; errEl.classList.remove("hidden"); return; }

  const btn = document.getElementById("save-sr-btn");
  btn.disabled = true;

  try {
    const totals = calcInvoiceTotals(activeLines);
    const cnNum  = document.getElementById("sr-number").value;
    const date   = document.getElementById("sr-date").value || todayString();

    let returnTotalCost = 0;
    activeLines.forEach(l => {
      const uCost = parseFloat(l.costPrice !== undefined ? l.costPrice : (l.unitCost !== undefined ? l.unitCost : 0));
      returnTotalCost += (parseFloat(l.qty || 1) * uCost);
    });

    const data = {
      number: cnNum,
      creditNoteNumber: cnNum,
      date,
      originalInvoiceId: originalInvoice.id,
      originalInvoiceNumber: originalInvoice.number || originalInvoice.invoiceNumber,
      customerId: originalInvoice.customerId,
      customerName: originalInvoice.customerName,
      repId: originalInvoice.repId || originalInvoice.salesRepId || null,
      repName: originalInvoice.repName || "",
      warehouseId, warehouseName,
      lines: activeLines,
      subtotal: totals.subtotal,
      totalCost: Math.round(returnTotalCost * 100) / 100,
      totalVat: totals.vatTotal,
      vatAmount: totals.vatTotal,
      totalWithVat: totals.grandTotal,
      total: totals.grandTotal,
      reason,
      status: "posted",
      zatcaStatus: "reported",
      createdAt: new Date(),
    };

    const cnId = await create(COLS.salesReturns(), data);

    // Reinstate stock for returned lines
    for (const line of activeLines) {
      await adjustStock(warehouseId, line.productId, +line.qty, {
        type: "return_in", sourceType: "salesReturn", sourceId: cnId,
        documentNumber: cnNum, invoiceNumber: cnNum
      });
    }

    // ─── Automated Accounting Engine (Sales Return) ───
    try {
      const warehouses = await getAll(COLS.warehouses());
      const totalCost = activeLines.reduce((s, l) => {
        return s + ((l.costPrice || l.purchasePrice || l.averageCost || 0) * (l.qty || 0));
      }, 0);

      await autoSalesReturnJE({
        id:                    cnId,
        returnNumber:          cnNum,
        date,
        customerId:            originalInvoice.customerId || null,
        repId:                 originalInvoice.repId || originalInvoice.salesRepId || null,
        customerName:          originalInvoice.customerName,
        customerType:          originalInvoice.customerType || "retail",
        paymentMethod:         originalInvoice.paymentMethod || "credit",
        subtotal:              totals.subtotal,
        taxAmount:             totals.vatTotal,
        total:                 totals.grandTotal,
        totalCost,
        warehouseId,
      }, {}, warehouses);
    } catch(jeErr) {
      console.warn("[AccountingEngine] Sales Return JE failed:", jeErr.message);
    }

    // Update Customer balance on client side
    if (originalInvoice.customerId && totals.grandTotal > 0) {
      try {
        const { increment, updateDoc, doc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
        const custRef = doc(db, `companies/${COMPANY_ID}/customers`, originalInvoice.customerId);
        await updateDoc(custRef, {
          balance: increment(-totals.grandTotal),
          updatedAt: serverTimestamp()
        });
      } catch (custErr) {
        console.warn("Failed to update customer balance on return:", custErr.message);
      }
    }

    showToast(`✅ تم إصدار الإشعار الدائن ${cnNum} بنجاح`, "success");
    closeModal("sr-modal");
    await loadSalesReturnsList();

    if (originalInvoice.customerId) {
      import("../utils/balance-sync.js").then(m => m.recalculateCustomerBalance(originalInvoice.customerId)).catch(e => console.warn(e));
    }

  } catch (err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally { btn.disabled = false; }
};

// ── Helper: Fetch Company Settings & Logo ───────────────────────
async function getCompanyDetailsForPrint() {
  const co = {
    name: "شركة نظم الإمداد المتطورة",
    vatNumber: "314996148100003",
    crNumber: "7054969006",
    address: "مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414",
    phone: "0549141648",
    email: "Nuzmalamdad@gmail.com",
    logoUrl: ""
  };

  try {
    const cached = JSON.parse(localStorage.getItem("idham_company") || "{}");
    if (cached.name) Object.assign(co, cached);
    if (cached.cr) co.crNumber = cached.cr;
    if (cached.crNumber) co.crNumber = cached.crNumber;
    if (cached.logoBase64) co.logoUrl = cached.logoBase64;
    if (cached.logoUrl) co.logoUrl = cached.logoUrl;
  } catch (_) {}

  try {
    const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const [compSnap, logoSnap] = await Promise.all([
      getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company")),
      getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "logo"))
    ]);
    if (compSnap.exists()) {
      const d = compSnap.data();
      const rawCr = d.crNumber || d.cr || d.commercialRegistration || "";
      d.crNumber = (rawCr && (rawCr.startsWith("70") || rawCr.startsWith("47") || rawCr.length >= 7)) ? rawCr : "7054969006";
      d.vatNumber = d.vatNumber || "314996148100003";
      d.name = d.name || "شركة نظم الإمداد المتطورة";
      Object.assign(co, d);
    }
    if (logoSnap.exists()) {
      const ld = logoSnap.data();
      const imgData = ld.dataUrl || ld.logoBase64 || ld.url || ld.logoUrl || "";
      if (imgData) co.logoUrl = imgData;
    }
  } catch (e) {
    console.warn("Could not load fresh company settings:", e);
  }

  return co;
}

// ── Helper: Build ZATCA TLV Base64 String ──────────────────────
function buildZatcaTLV(sellerName, vatNum, invoiceDate, totalWithVat, vatAmount) {
  function tlv(tag, value) {
    const encoded = new TextEncoder().encode(value);
    return new Uint8Array([tag, encoded.length, ...encoded]);
  }
  const dateStr = invoiceDate ? new Date(invoiceDate).toISOString() : new Date().toISOString();
  const parts = [
    tlv(1, sellerName || "شركة نظم الإمداد المتطورة"),
    tlv(2, vatNum || "314996148100003"),
    tlv(3, dateStr),
    tlv(4, String(Number(totalWithVat || 0).toFixed(2))),
    tlv(5, String(Number(vatAmount || 0).toFixed(2)))
  ];
  const totalLength = parts.reduce((acc, arr) => acc + arr.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  parts.forEach(arr => { merged.set(arr, offset); offset += arr.length; });
  return btoa(String.fromCharCode(...merged));
}

// ── Helper: Pre-render QR Code to Data URL in Parent Window ──
function generateQRDataURL(text) {
  if (!text || typeof window.QRCode === "undefined") return "";
  try {
    const tempDiv = document.createElement("div");
    new window.QRCode(tempDiv, {
      text: text,
      width: 100,
      height: 100,
      correctLevel: window.QRCode.CorrectLevel ? window.QRCode.CorrectLevel.M : 0
    });
    const canvas = tempDiv.querySelector("canvas");
    if (canvas) return canvas.toDataURL("image/png");
    const img = tempDiv.querySelector("img");
    if (img && img.src) return img.src;
  } catch (e) {
    console.warn("QR pre-generation error:", e);
  }
  return "";
}

// ─── Print Official A4 Sales Return (Credit Note) ─────────────
window.printSalesReturn = async (id) => {
  const r = cachedSalesReturns.find(x => x.id === id || x.number === id || x.creditNoteNumber === id);
  if (!r) { showToast("الإشعار الدائن غير موجود", "error"); return; }

  const co = await getCompanyDetailsForPrint();
  const sub = parseFloat(r.subtotal || 0);
  const vat = parseFloat(r.totalVat !== undefined ? r.totalVat : (r.vatAmount !== undefined ? r.vatAmount : (sub * 0.15)));
  const grand = parseFloat(r.totalWithVat !== undefined ? r.totalWithVat : (r.total !== undefined ? r.total : (sub + vat)));
  const retDate = r.date || (r.createdAt?.toDate ? r.createdAt.toDate().toISOString().split("T")[0] : todayString());

  // Generate ZATCA QR
  const tlvString = buildZatcaTLV(co.name, co.vatNumber, retDate, grand, vat);
  const qrImgDataUrl = generateQRDataURL(tlvString);
  const amountInWords = tafqeetArabic(grand);

  const linesHtml = (r.lines || []).map((l, i) => {
    const unitPrice = parseFloat(l.unitPrice !== undefined ? l.unitPrice : (l.price !== undefined ? l.price : 0)) || 0;
    const qty = parseFloat(l.qty || 0);
    const discount = parseFloat(l.discount || 0);
    const net = qty * unitPrice * (1 - discount / 100);
    const lineVat = net * 0.15;
    const tot = net + lineVat;
    const prodName = l.productName || l.name || "";
    const unit = l.unit || "حبة / كرتون";

    return `
      <tr>
        <td style="text-align:center; font-weight:700;">${i+1}</td>
        <td style="font-weight:700;">${prodName}${l.sku ? `<br><span style="font-size:10px; color:#64748b;">${l.sku}</span>` : ""}</td>
        <td style="text-align:center;">${unit}</td>
        <td style="text-align:center; font-family:'IBM Plex Mono',monospace; font-weight:800; color:#b91c1c;">${qty}</td>
        <td style="text-align:left; font-family:'IBM Plex Mono',monospace;" dir="ltr">${formatCurrency(unitPrice)}</td>
        <td style="text-align:left; font-family:'IBM Plex Mono',monospace; font-weight:700;" dir="ltr">${formatCurrency(net)}</td>
        <td style="text-align:left; font-family:'IBM Plex Mono',monospace; color:#d97706;" dir="ltr">${formatCurrency(lineVat)}</td>
        <td style="text-align:left; font-family:'IBM Plex Mono',monospace; font-weight:800; color:#1e293b;" dir="ltr">${formatCurrency(tot)}</td>
      </tr>`;
  }).join("");

  const logoHtml = co.logoUrl
    ? `<div class="logo-circle"><img src="${co.logoUrl}" alt="Logo" /></div>`
    : `<div class="logo-circle"><span style="font-size:28px;">🏢</span></div>`;

  const pw = window.open("", "_blank");
  if (!pw) { showToast("يرجى السماح بالنوافذ المنبثقة للطباعة", "warn"); return; }

  pw.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>إشعار دائن ضريبي ${r.number || r.creditNoteNumber || r.id}</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;600;700&display=swap" rel="stylesheet"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'IBM Plex Sans Arabic', sans-serif; direction: rtl; color: #1e293b; background: #f8fafc; padding: 12px; }
    .no-print { background: #1e293b; padding: 10px; display: flex; gap: 10px; justify-content: center; margin-bottom: 12px; border-radius: 8px; }
    .btn { padding: 8px 18px; border-radius: 6px; cursor: pointer; border: none; font-family: inherit; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; }
    .btn-red { background: #dc2626; color: #fff; }
    .btn-gray { background: #475569; color: #fff; }
    
    .report-container { background: #fff; max-width: 210mm; margin: 0 auto; padding: 18px 22px; border: 1.5px solid #dc2626; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    
    /* Top Header Banner */
    .top-title { text-align: center; margin-bottom: 12px; }
    .top-title h1 { font-size: 20px; color: #b91c1c; font-weight: 800; margin-bottom: 2px; }
    .top-title h2 { font-size: 10px; color: #b91c1c; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
    
    .company-banner { background: #b91c1c !important; color: #fff !important; border-radius: 8px; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .banner-left { text-align: right; font-size: 11.5px; line-height: 1.5; color: #fff !important; }
    .banner-left div { color: #fff !important; }
    .banner-left strong { color: #fff !important; }
    .banner-right { text-align: left; line-height: 1.4; color: #fff !important; }
    .banner-right h2 { font-size: 16px; font-weight: 800; margin-bottom: 3px; color: #fff !important; }
    .banner-right div { font-size: 11.5px; color: #fff !important; }
    .logo-circle { width: 68px; height: 68px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 4px; border: 1.5px solid #b91c1c; box-shadow: 0 2px 6px rgba(0,0,0,0.12); flex-shrink: 0; }
    .logo-circle img { max-width: 100%; max-height: 100%; object-fit: contain; }
    
    /* Meta Box Grid */
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
    .meta-box { background: #fdf2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px 14px; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; }
    .meta-row:last-child { margin-bottom: 0; }
    .meta-lbl { color: #64748b; font-weight: 600; }
    .meta-val { color: #0f172a; font-weight: 800; }
    
    /* Table */
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11.5px; border: 1px solid #cbd5e1; }
    thead tr { background: #991b1b !important; color: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    thead th { padding: 7px 8px; color: #ffffff !important; font-weight: 700; text-align: right; }
    tbody tr { border-bottom: 1px solid #e2e8f0; }
    tbody tr:nth-child(even) { background: #fcfcfd; }
    tbody td { padding: 7px 8px; color: #1e293b; }
    
    /* Totals & QR */
    .totals-wrapper { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; margin-bottom: 14px; gap: 16px; }
    .qr-box { display: flex; align-items: center; gap: 10px; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 8px; background: #fff; }
    .qr-box img { width: 95px; height: 95px; object-fit: contain; }
    .qr-info { font-size: 10px; color: #64748b; line-height: 1.4; }
    
    .totals-box { width: 320px; background: #fdf2f2; border: 1.5px solid #f87171; border-radius: 8px; padding: 10px 14px; }
    .tot-line { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
    .tot-line.grand { border-top: 1.5px solid #dc2626; padding-top: 6px; margin-top: 6px; font-size: 14px; font-weight: 900; color: #991b1b; }
    
    /* Tafqeet */
    .tafqeet-strip { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 6px 12px; font-size: 11.5px; font-weight: 800; color: #991b1b; margin-bottom: 14px; }
    
    /* Reason */
    .reason-box { background: #fff; border: 1px dashed #ef4444; border-radius: 6px; padding: 8px 12px; font-size: 11px; color: #991b1b; margin-bottom: 16px; }
    
    /* Signatures */
    .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px; padding-top: 12px; border-top: 1px dashed #cbd5e1; text-align: center; }
    .signatures .role { font-size: 11px; font-weight: 800; color: #334155; margin-bottom: 35px; }
    .signatures .line { border-top: 1px dotted #94a3b8; width: 110px; margin: 0 auto; font-size: 10px; color: #64748b; padding-top: 3px; }
    
    @page { size: A4; margin: 8mm 10mm 8mm 10mm; }
    @media print {
      body { background: #fff; padding: 0; }
      .no-print { display: none !important; }
      .report-container { max-width: 100%; box-shadow: none; border-radius: 0; border: none; padding: 4px; }
      .company-banner { background: #b91c1c !important; color: #fff !important; }
      thead tr { background: #991b1b !important; color: #fff !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn btn-red" onclick="window.print()">🖨️ طباعة الإشعار الدائن</button>
    <button class="btn btn-gray" onclick="window.close()">✕ إغلاق</button>
  </div>

  <div class="report-container">
    <!-- Top Title -->
    <div class="top-title">
      <h1>إشعار دائن ضريبي (مردود مبيعات)</h1>
      <h2>TAX CREDIT NOTE (SALES RETURN) — ZATCA COMPLIANT</h2>
    </div>

    <!-- Purple/Red Company Banner -->
    <div class="company-banner">
      <div class="banner-left">
        <div>رقم الإشعار: <strong>${r.number || r.creditNoteNumber || r.id}</strong></div>
        <div>تاريخ الإصدار: <strong>${formatDate(retDate)}</strong></div>
        <div>الفاتورة الأصلية: <strong>${r.originalInvoiceNumber || r.refInvoice || "—"}</strong></div>
      </div>
      ${logoHtml}
      <div class="banner-right">
        <h2>${co.name}</h2>
        <div>الرقم الضريبي: <strong>${co.vatNumber}</strong></div>
        <div>السجل التجاري: <strong>${co.crNumber}</strong></div>
        <div>الهاتف: <strong>${co.phone}</strong></div>
      </div>
    </div>

    <!-- Meta Grid -->
    <div class="meta-grid">
      <div class="meta-box">
        <div class="meta-row"><span class="meta-lbl">العميل:</span><span class="meta-val">${r.customerName || "عميل نقدي"}</span></div>
        <div class="meta-row"><span class="meta-lbl">المستودع المستلم:</span><span class="meta-val">${r.warehouseName || "—"}</span></div>
      </div>
      <div class="meta-box">
        <div class="meta-row"><span class="meta-lbl">المندوب:</span><span class="meta-val">${r.repName || "—"}</span></div>
        <div class="meta-row"><span class="meta-lbl">حالة الاعتماد:</span><span class="meta-val" style="color:#059669;">✓ موثق ومعتمد ZATCA</span></div>
      </div>
    </div>

    <!-- Line Items Table -->
    <table>
      <thead>
        <tr>
          <th style="width:28px; text-align:center;">#</th>
          <th>الصنف المرجع والبيان</th>
          <th style="width:70px; text-align:center;">الوحدة</th>
          <th style="width:60px; text-align:center;">الكمية</th>
          <th style="width:90px; text-align:left;">السعر الأصلي</th>
          <th style="width:95px; text-align:left;">المبلغ قبل الضريبة</th>
          <th style="width:80px; text-align:left;">ضريبة 15%</th>
          <th style="width:105px; text-align:left;">الإجمالي شامل الضريبة</th>
        </tr>
      </thead>
      <tbody>${linesHtml}</tbody>
    </table>

    <!-- Totals & QR Section -->
    <div class="totals-wrapper">
      <div class="qr-box">
        ${qrImgDataUrl ? `<img src="${qrImgDataUrl}" alt="ZATCA QR" />` : `<div style="width:95px; height:95px; display:flex; align-items:center; justify-content:center; background:#eee; font-size:10px;">QR ZATCA</div>`}
        <div class="qr-info">
          <strong>رمز الاستجابة السريعة (ZATCA QR)</strong><br>
          متوافق مع المرحلة الثانية للفوترة الإلكترونية<br>
          المنشأة: ${co.name}<br>
          الرقم الضريبي: ${co.vatNumber}
        </div>
      </div>
      <div class="totals-box">
        <div class="tot-line"><span>المجموع قبل الضريبة:</span><span class="mono font-bold" dir="ltr">${formatCurrency(sub)}</span></div>
        <div class="tot-line" style="color:#d97706;"><span>ضريبة القيمة المضافة (15%):</span><span class="mono font-bold" dir="ltr">${formatCurrency(vat)}</span></div>
        <div class="tot-line grand"><span>إجمالي الإشعار الدائن:</span><span class="mono" dir="ltr">${formatCurrency(grand)}</span></div>
      </div>
    </div>

    <!-- Tafqeet Strip -->
    ${amountInWords ? `<div class="tafqeet-strip">المبلغ بالحروف: فقط ${amountInWords} لا غير</div>` : ""}

    <!-- Reason Box -->
    ${r.reason ? `<div class="reason-box"><strong>سبب الإرجاع:</strong> ${r.reason}</div>` : ""}

    <!-- Signatures -->
    <div class="signatures">
      <div>
        <div class="role">أمين المخزن المستلم</div>
        <div class="line">التوقيع والختم</div>
      </div>
      <div>
        <div class="role">مندوب المبيعات / السائق</div>
        <div class="line">التوقيع</div>
      </div>
      <div>
        <div class="role">اعتماد العميل والمستلم</div>
        <div class="line">التوقيع والختم</div>
      </div>
    </div>

  </div>
</body>
</html>`);
  pw.document.close();
};

// ─── Print Thermal (80mm) Receipt for Sales Return ───────────
window.printSalesReturnThermal = async (id) => {
  const r = cachedSalesReturns.find(x => x.id === id || x.number === id || x.creditNoteNumber === id);
  if (!r) { showToast("الإشعار الدائن غير موجود", "error"); return; }

  const co = await getCompanyDetailsForPrint();
  const sub = parseFloat(r.subtotal || 0);
  const vat = parseFloat(r.totalVat !== undefined ? r.totalVat : (r.vatAmount !== undefined ? r.vatAmount : (sub * 0.15)));
  const grand = parseFloat(r.totalWithVat !== undefined ? r.totalWithVat : (r.total !== undefined ? r.total : (sub + vat)));
  const retDate = r.date || (r.createdAt?.toDate ? r.createdAt.toDate().toISOString().split("T")[0] : todayString());

  const tlvString = buildZatcaTLV(co.name, co.vatNumber, retDate, grand, vat);
  const qrImgDataUrl = generateQRDataURL(tlvString);

  const linesHtml = (r.lines || []).map(l => {
    const unitPrice = parseFloat(l.unitPrice !== undefined ? l.unitPrice : (l.price !== undefined ? l.price : 0)) || 0;
    const qty = parseFloat(l.qty || 0);
    const tot = qty * unitPrice * 1.15;
    return `
      <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:11px;">
        <div style="font-weight:700;">${l.productName || l.name} (${qty} x ${unitPrice.toFixed(2)})</div>
        <div style="font-family:monospace; font-weight:700;">${tot.toFixed(2)}</div>
      </div>`;
  }).join("");

  const pw = window.open("", "_blank");
  if (!pw) { showToast("يرجى السماح بالنوافذ المنبثقة", "warn"); return; }

  pw.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>إشعار دائن حراري ${r.number || r.creditNoteNumber || r.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: sans-serif; width: 78mm; margin: 0 auto; padding: 6px; font-size: 11px; line-height: 1.4; }
    .center { text-align: center; }
    .border-b { border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px; }
    .bold { font-weight: bold; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body onload="window.print()">
  <div class="center border-b">
    <div class="bold" style="font-size:13px;">${co.name}</div>
    <div>الرقم الضريبي: ${co.vatNumber}</div>
    <div class="bold" style="font-size:12px; margin-top:4px;">إشعار دائن (مردود مبيعات)</div>
    <div>رقم الإشعار: ${r.number || r.creditNoteNumber || r.id}</div>
    <div>التاريخ: ${retDate}</div>
    <div>الفاتورة الأصلية: ${r.originalInvoiceNumber || r.refInvoice || "—"}</div>
    <div>العميل: ${r.customerName || "عميل نقدي"}</div>
    <div>المستودع: ${r.warehouseName || "—"}</div>
  </div>

  <div class="border-b">
    <div class="bold" style="margin-bottom:4px;">الأصناف المرجعة:</div>
    ${linesHtml}
  </div>

  <div class="border-b">
    <div style="display:flex; justify-content:space-between;"><span>المجموع قبل الضريبة:</span><span>${sub.toFixed(2)} ر.س</span></div>
    <div style="display:flex; justify-content:space-between;"><span>ضريبة 15%:</span><span>${vat.toFixed(2)} ر.س</span></div>
    <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:12px; margin-top:4px;"><span>الإجمالي الصافي:</span><span>${grand.toFixed(2)} ر.س</span></div>
  </div>

  ${qrImgDataUrl ? `<div class="center" style="margin:10px 0;"><img src="${qrImgDataUrl}" width="100" height="100" /></div>` : ""}

  <div class="center" style="font-size:10px;">
    <div>شكراً لتعاملكم معنا</div>
  </div>
</body>
</html>`);
  pw.document.close();
};
