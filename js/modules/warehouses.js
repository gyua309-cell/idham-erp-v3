// ============================================================
// IDHAM ERP — Warehouses Management System v3.0
// دورة مخزنية متكاملة — إدارة المخازن والمواقع والإحصائيات
// ============================================================
import { COLS, create, update, remove, getAll, query, orderBy, getDocs, where, limit, getStockForWarehouse } from "../utils/db.js";
import { formatCurrency, formatQuantity, debounce } from "../utils/formatters.js";
import { db, COMPANY_ID } from "../firebase-config.js";
import { doc, getDoc, collection, orderBy as fbOrderBy } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { syncEntityToCoa, updateEntityInCoa, deleteEntityInCoa } from "../utils/coa-connector.js";

// ─── State ───────────────────────────────────────────────────
let warehouses = [];
let allAccounts = [];
let activeView = "cards"; // cards | table
let filterType = "";
let filterStatus = "active";
let searchTerm = "";

// ─── Warehouse Types Config ───────────────────────────────────
const WAREHOUSE_TYPES = {
  Main:         { label: "رئيسي",           icon: "🏭", color: "#5B7FFF", bg: "#5B7FFF18" },
  Branch:       { label: "فرع",             icon: "🏪", color: "#22C55E", bg: "#22C55E18" },
  Distribution: { label: "توزيع",           icon: "🚛", color: "#F59E0B", bg: "#F59E0B18" },
  Transit:      { label: "بضاعة في الطريق", icon: "🔄", color: "#8B5CF6", bg: "#8B5CF618" },
  Returns:      { label: "مرتجعات",         icon: "↩️",  color: "#EF4444", bg: "#EF444418" },
  Damaged:      { label: "تالف / منتهي",   icon: "⚠️",  color: "#DC2626", bg: "#DC262618" },
  Consignment:  { label: "أمانات",          icon: "🤝", color: "#06B6D4", bg: "#06B6D418" },
  Frozen:       { label: "مجمدات",          icon: "❄️",  color: "#3B82F6", bg: "#3B82F618" },
  Chilled:      { label: "مبردات",          icon: "🌡️", color: "#0EA5E9", bg: "#0EA5E918" },
  Dry:          { label: "مواد جافة",       icon: "📦", color: "#92400E", bg: "#92400E18" },
  Vehicle:      { label: "سيارة توزيع",     icon: "🚐", color: "#059669", bg: "#05966918" },
  Virtual:      { label: "افتراضي",         icon: "☁️",  color: "#6B7280", bg: "#6B728018" },
};

const TEMP_LABELS = {
  ambient: "درجة الغرفة (Ambient)",
  chilled: "تبريد +1°م إلى +4°م",
  frozen:  "تجميد −18°م وأقل",
};

// ─── Render ───────────────────────────────────────────────────
export async function render(container, user) {
  container.innerHTML = buildShell();

  await Promise.all([loadAccounts(), loadWarehouses()]);
  setupSearch();
}

function buildShell() {
  const typeOptions = Object.entries(WAREHOUSE_TYPES)
    .map(([v, t]) => `<option value="${v}">${t.icon} ${t.label}</option>`).join("");

  return `
  <!-- ── Filter Bar ── -->
  <div class="filterbar no-print">
    <div class="search-bar" style="max-width:260px;">
      <input type="text" id="wh-search" class="input" placeholder="🔍 بحث بالاسم أو الكود…" />
    </div>
    <div class="filterbar-divider"></div>
    <div class="filter-select-group">
      <label>النوع</label>
      <select id="wh-type-filter" class="input" onchange="filterWarehouses()">
        <option value="">جميع الأنواع</option>
        ${typeOptions}
      </select>
    </div>
    <div class="filter-select-group">
      <label>الحالة</label>
      <select id="wh-status-filter" class="input" onchange="filterWarehouses()">
        <option value="active">نشطة</option>
        <option value="">الكل</option>
        <option value="inactive">معطلة</option>
      </select>
    </div>
    <div style="margin-right:auto; display:flex; gap:10px; align-items:center;">
      <div class="view-toggle">
        <button id="btn-view-cards" class="btn btn-sm btn-secondary active-view" onclick="setWhView('cards')">⊞ بطاقات</button>
        <button id="btn-view-table" class="btn btn-sm btn-secondary" onclick="setWhView('table')">☰ جدول</button>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="exportWarehouses()">📤 تصدير</button>
      <button class="btn btn-primary" onclick="openWarehouseModal()">＋ مخزن جديد</button>
    </div>
  </div>

  <!-- ── Stats Bar ── -->
  <div id="wh-stats-bar" style="display:grid; grid-template-columns:repeat(4,1fr); gap:14px; padding:16px 20px 0; direction:rtl;">
    <div class="stat-mini-card" style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:16px; text-align:center;">
      <div style="font-size:24px; font-weight:700; color:var(--brand);" id="stat-total-wh">—</div>
      <div style="font-size:12px; color:var(--text-2);">إجمالي المخازن</div>
    </div>
    <div class="stat-mini-card" style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:16px; text-align:center;">
      <div style="font-size:24px; font-weight:700; color:#22C55E;" id="stat-active-wh">—</div>
      <div style="font-size:12px; color:var(--text-2);">مخازن نشطة</div>
    </div>
    <div class="stat-mini-card" style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:16px; text-align:center;">
      <div style="font-size:20px; font-weight:700; color:#F59E0B;" id="stat-total-value">—</div>
      <div style="font-size:12px; color:var(--text-2);">إجمالي قيمة المخزون (ر.س)</div>
    </div>
    <div class="stat-mini-card" style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:16px; text-align:center;">
      <div style="font-size:20px; font-weight:700; color:#8B5CF6;" id="stat-locations">—</div>
      <div style="font-size:12px; color:var(--text-2);">مواقع تخزين داخلية</div>
    </div>
  </div>

  <!-- ── Content Area ── -->
  <div class="page-content" id="wh-content-area" style="padding:16px 20px;">
    <div class="page-loading"><div class="loading-spinner"></div></div>
  </div>

  <!-- ═══════════════════ WAREHOUSE MODAL ═══════════════════ -->
  <div class="modal-overlay" id="wh-modal">
    <div class="modal" style="max-width:780px; max-height:90vh; overflow-y:auto;">
      <div class="modal-header">
        <h3 class="modal-title" id="wh-modal-title">🏭 إضافة مخزن جديد</h3>
        <button class="modal-close" onclick="closeModal('wh-modal')">×</button>
      </div>
      <div class="modal-body" style="padding:24px;">
        <input type="hidden" id="wh-edit-id" />

        <!-- Section 1: Basic Info -->
        <div class="wh-section-title">📋 المعلومات الأساسية</div>
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group">
            <label>كود المخزن (Prefix) <span class="req">*</span></label>
            <input type="text" id="wh-prefix" class="input mono" placeholder="WH-MAIN" style="text-transform:uppercase;" />
          </div>
          <div class="form-group" style="grid-column:span 2;">
            <label>اسم المخزن <span class="req">*</span></label>
            <input type="text" id="wh-name" class="input" placeholder="المستودع الرئيسي للمواد الجافة" />
          </div>
        </div>

        <div class="grid-3 gap-16 mb-16">
          <div class="form-group">
            <label>نوع المخزن <span class="req">*</span></label>
            <select id="wh-type" class="input">
              ${Object.entries(WAREHOUSE_TYPES).map(([v,t]) =>
                `<option value="${v}">${t.icon} ${t.label}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>التحكم بالحرارة <span class="req">*</span></label>
            <select id="wh-temp" class="input">
              <option value="ambient">🌡️ درجة الغرفة (Ambient)</option>
              <option value="chilled">❄️ تبريد (+1 إلى +4°م)</option>
              <option value="frozen">🧊 تجميد (−18°م وأقل)</option>
            </select>
          </div>
          <div class="form-group">
            <label>الحالة</label>
            <select id="wh-active" class="input">
              <option value="1">✅ نشط</option>
              <option value="0">⛔ معطل</option>
            </select>
          </div>
        </div>

        <!-- Section 2: Location & People -->
        <div class="wh-section-title">📍 الموقع والمسؤولون</div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group">
            <label>أمين المستودع (المسؤول)</label>
            <input type="text" id="wh-manager" class="input" placeholder="اسم أمين المخزن" />
          </div>
          <div class="form-group">
            <label>رقم الهاتف</label>
            <input type="text" id="wh-phone" class="input mono" placeholder="05xxxxxxxx" />
          </div>
        </div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group">
            <label>الموقع / العنوان</label>
            <input type="text" id="wh-location" class="input" placeholder="المنطقة الصناعية، الرياض" />
          </div>
          <div class="form-group">
            <label>ساعات العمل</label>
            <input type="text" id="wh-hours" class="input" placeholder="8:00 صباحاً — 5:00 مساءً" />
          </div>
        </div>

        <!-- Section 3: Capacity -->
        <div class="wh-section-title">📐 الطاقة الاستيعابية</div>
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group">
            <label>السعة الكلية (م³)</label>
            <input type="number" id="wh-capacity" class="input mono" placeholder="5000" />
          </div>
          <div class="form-group">
            <label>عدد الأرفف</label>
            <input type="number" id="wh-shelves" class="input mono" placeholder="50" />
          </div>
          <div class="form-group">
            <label>عدد الممرات</label>
            <input type="number" id="wh-aisles" class="input mono" placeholder="10" />
          </div>
        </div>

        <!-- Section 4: Accounting -->
        <div class="wh-section-title">💼 الربط المحاسبي</div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group">
            <label>حساب المخزون <span class="req">*</span></label>
            <select id="wh-acc-inv" class="input"><option value="">اختر الحساب…</option></select>
          </div>
          <div class="form-group">
            <label>حساب تسويات الفروق</label>
            <select id="wh-acc-var" class="input"><option value="">اختر الحساب…</option></select>
          </div>
        </div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group">
            <label>مركز التكلفة</label>
            <input type="text" id="wh-cost-center" class="input mono" placeholder="CC-MAIN-01" />
          </div>
          <div class="form-group">
            <label>ملاحظات</label>
            <input type="text" id="wh-notes" class="input" placeholder="أي ملاحظات إضافية…" />
          </div>
        </div>

        <!-- Section 5: Business Rules -->
        <div class="wh-section-title">⚙️ قواعد العمل</div>
        <div class="grid-2 gap-16 mb-16">
          <label class="checkbox-label">
            <input type="checkbox" id="wh-allow-negative" />
            <span>السماح بمخزون سالب (غير مُوصى به)</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="wh-require-serial" />
            <span>إلزامية إدخال الأرقام التسلسلية</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="wh-require-batch" checked />
            <span>إلزامية إدخال رقم الدفعة</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="wh-require-expiry" checked />
            <span>إلزامية إدخال تاريخ الانتهاء</span>
          </label>
        </div>

        <div id="wh-error" class="alert bad hidden" style="margin-top:16px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('wh-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="saveWarehouse()" id="save-wh-btn">💾 حفظ المخزن</button>
      </div>
    </div>
  </div>

  <!-- ═══════════════════ LOCATIONS MODAL ═══════════════════ -->
  <div class="modal-overlay" id="wh-locations-modal">
    <div class="modal" style="max-width:700px; max-height:90vh; overflow-y:auto;">
      <div class="modal-header">
        <h3 class="modal-title" id="wh-loc-title">📍 مواقع التخزين الداخلية</h3>
        <button class="modal-close" onclick="closeModal('wh-locations-modal')">×</button>
      </div>
      <div class="modal-body" style="padding:20px;">
        <input type="hidden" id="wh-loc-warehouse-id" />
        <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:10px; padding:16px; margin-bottom:16px;">
          <div class="grid-4 gap-12 mb-12">
            <div class="form-group">
              <label>المنطقة (Zone)</label>
              <input type="text" id="loc-zone" class="input" placeholder="A, B, C…" />
            </div>
            <div class="form-group">
              <label>الممر (Aisle)</label>
              <input type="text" id="loc-aisle" class="input mono" placeholder="01" />
            </div>
            <div class="form-group">
              <label>الرف (Shelf)</label>
              <input type="text" id="loc-shelf" class="input mono" placeholder="03" />
            </div>
            <div class="form-group">
              <label>المستوى (Level)</label>
              <input type="text" id="loc-level" class="input mono" placeholder="01" />
            </div>
          </div>
          <div class="grid-2 gap-12">
            <div class="form-group">
              <label>اسم الموقع (مخصص)</label>
              <input type="text" id="loc-name" class="input" placeholder="مثال: منطقة أ — رف 3 مستوى 1" />
            </div>
            <div class="form-group">
              <label>النوع</label>
              <select id="loc-type" class="input">
                <option value="shelf">رف (Shelf)</option>
                <option value="zone">منطقة (Zone)</option>
                <option value="aisle">ممر (Aisle)</option>
                <option value="bin">خانة (Bin)</option>
                <option value="floor">أرضية (Floor)</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="addLocation()" style="margin-top:12px;">＋ إضافة موقع</button>
        </div>
        <div class="table-container">
          <table class="data-dense">
            <thead><tr>
              <th>كود الموقع</th><th>الاسم</th><th>المنطقة</th><th>الممر</th><th>الرف</th><th>المستوى</th><th>النوع</th><th></th>
            </tr></thead>
            <tbody id="wh-locations-tbody">
              <tr><td colspan="8" style="text-align:center;padding:20px;color:var(--text-2);">لا توجد مواقع محددة بعد</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══════════════════ WAREHOUSE DETAILS MODAL ═══════════════════ -->
  <div class="modal-overlay" id="wh-detail-modal">
    <div class="modal" style="max-width:860px; max-height:90vh; overflow-y:auto;">
      <div class="modal-header">
        <h3 class="modal-title" id="wh-detail-title">تفاصيل المخزن</h3>
        <button class="modal-close" onclick="closeModal('wh-detail-modal')">×</button>
      </div>
      <div class="modal-body" id="wh-detail-body" style="padding:24px;">
        <div class="page-loading"><div class="loading-spinner"></div></div>
      </div>
    </div>
  </div>
`;
}

// ─── Load Data ───────────────────────────────────────────────
async function loadAccounts() {
  try {
    allAccounts = await getAll(COLS.chartOfAccounts(), [orderBy("code")]);
    const assetAccs = allAccounts.filter(a => a.type === "asset" || a.type === "assets");
    const selInv = document.getElementById("wh-acc-inv");
    const selVar = document.getElementById("wh-acc-var");
    if (selInv) selInv.innerHTML = '<option value="">اختر حساب المخزون…</option>' +
      assetAccs.map(a => `<option value="${a.accountId||a.id}">${a.code} — ${a.name}</option>`).join("");
    if (selVar) selVar.innerHTML = '<option value="">اختر حساب التسويات…</option>' +
      allAccounts.map(a => `<option value="${a.accountId||a.id}">${a.code} — ${a.name}</option>`).join("");
  } catch {}
}

async function loadWarehouses() {
  const area = document.getElementById("wh-content-area");
  if (!area) return;
  try {
    // Fetch all datasets in parallel for KPI accuracy
    const [whList, stockAll, products, locsAll] = await Promise.all([
      getAll(COLS.warehouses(), [orderBy("barcodePrefix")]),
      getAll(COLS.stockByWarehouse()),
      getAll(COLS.products()),
      getAll(COLS.locations()),
    ]);
    warehouses = whList;

    // Build product cost map (id → cost)
    const costMap = {};
    products.forEach(p => {
      costMap[p.id] = p.costPrice || p.avgCost || p.purchasePrice || 0;
    });

    // Compute total inventory value across all warehouses
    let totalStockValue = 0;
    stockAll.forEach(s => {
      if ((s.qty || 0) > 0) {
        totalStockValue += (s.qty || 0) * (costMap[s.productId] || 0);
      }
    });

    // Compute total active storage locations
    const totalLocations = locsAll.filter(l => l.isActive !== false).length;

    updateStats(totalStockValue, totalLocations);
    renderContent();
  } catch (err) {
    area.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
}

function updateStats(totalVal = 0, totalLocs = 0) {
  const active = warehouses.filter(w => w.isActive !== false);
  document.getElementById("stat-total-wh").textContent  = warehouses.length;
  document.getElementById("stat-active-wh").textContent = active.length;
  // Show real values — always show a number, never "—"
  document.getElementById("stat-total-value").textContent = formatCurrency(totalVal);
  document.getElementById("stat-locations").textContent   = totalLocs;
}

// ─── Render Content ───────────────────────────────────────────
function renderContent() {
  const area = document.getElementById("wh-content-area");
  if (!area) return;

  // Filter
  let list = warehouses.filter(w => {
    const st = filterStatus === "active" ? w.isActive !== false
             : filterStatus === "inactive" ? w.isActive === false
             : true;
    const tp = !filterType || w.type === filterType;
    const sr = !searchTerm || (w.name||"").includes(searchTerm)
                           || (w.barcodePrefix||"").toLowerCase().includes(searchTerm.toLowerCase());
    return st && tp && sr;
  });

  if (list.length === 0) {
    area.innerHTML = `<div style="text-align:center; padding:60px; color:var(--text-2);">
      <div style="font-size:48px; margin-bottom:12px;">🏭</div>
      <div style="font-size:18px; font-weight:600; margin-bottom:8px;">لا توجد مخازن مطابقة</div>
      <div style="font-size:13px; margin-bottom:20px;">أضف مخزنك الأول لبدء إدارة المخزون</div>
      <button class="btn btn-primary" onclick="openWarehouseModal()">＋ إضافة مخزن جديد</button>
    </div>`;
    return;
  }

  if (activeView === "cards") {
    area.innerHTML = `<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:18px; direction:rtl;">
      ${list.map(w => buildWarehouseCard(w)).join("")}
    </div>`;
  } else {
    area.innerHTML = buildTableView(list);
  }
}

function buildWarehouseCard(w) {
  const t = WAREHOUSE_TYPES[w.type] || WAREHOUSE_TYPES.Virtual;
  const isActive = w.isActive !== false;
  const tempIcon = w.storageTemperature === "frozen" ? "🧊" : w.storageTemperature === "chilled" ? "❄️" : "🌡️";
  const tempLabel = TEMP_LABELS[w.storageTemperature] || "—";
  return `
  <div class="wh-card" style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:16px; overflow:hidden; transition:box-shadow .2s, transform .2s; cursor:pointer;"
       onmouseenter="this.style.boxShadow='0 8px 32px rgba(0,0,0,.18)'; this.style.transform='translateY(-2px)'"
       onmouseleave="this.style.boxShadow=''; this.style.transform=''">
    <!-- Header -->
    <div style="background:${t.bg}; border-bottom:1px solid ${t.color}22; padding:16px 18px; display:flex; align-items:center; justify-content:space-between;">
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="width:44px; height:44px; background:${t.color}22; border:2px solid ${t.color}44; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px;">${t.icon}</div>
        <div>
          <div style="font-weight:700; font-size:15px; color:var(--text-1);">${w.name}</div>
          <div style="font-size:11px; color:${t.color}; font-family:'IBM Plex Mono',monospace; font-weight:600;">${w.barcodePrefix || "—"}</div>
        </div>
      </div>
      <span class="badge" style="background:${t.color}22; color:${t.color}; border:1px solid ${t.color}44; font-size:10px;">${t.label}</span>
    </div>
    <!-- Body -->
    <div style="padding:16px 18px;">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
        <div style="background:var(--bg-3); border-radius:8px; padding:10px;">
          <div style="font-size:10px; color:var(--text-2); margin-bottom:3px;">المسؤول</div>
          <div style="font-size:13px; font-weight:600;">${w.manager || "—"}</div>
        </div>
        <div style="background:var(--bg-3); border-radius:8px; padding:10px;">
          <div style="font-size:10px; color:var(--text-2); margin-bottom:3px;">${tempIcon} درجة الحرارة</div>
          <div style="font-size:12px; font-weight:600;">${w.storageTemperature === "frozen" ? "تجميد −18°م" : w.storageTemperature === "chilled" ? "تبريد +1→+4°م" : "درجة الغرفة"}</div>
        </div>
        <div style="background:var(--bg-3); border-radius:8px; padding:10px;">
          <div style="font-size:10px; color:var(--text-2); margin-bottom:3px;">📍 الموقع</div>
          <div style="font-size:12px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${w.location || "—"}</div>
        </div>
        <div style="background:var(--bg-3); border-radius:8px; padding:10px;">
          <div style="font-size:10px; color:var(--text-2); margin-bottom:3px;">📐 الطاقة</div>
          <div style="font-size:13px; font-weight:600;">${w.capacity ? w.capacity + " م³" : "—"}</div>
        </div>
      </div>
      <!-- KPIs if available -->
      ${w.stockValue || w.itemCount ? `
      <div style="border-top:1px solid var(--border-soft); padding-top:12px; margin-bottom:12px; display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div style="text-align:center;">
          <div style="font-size:14px; font-weight:700; color:var(--brand);">${formatCurrency(w.stockValue || 0)}</div>
          <div style="font-size:10px; color:var(--text-2);">قيمة المخزون</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:14px; font-weight:700; color:#22C55E;">${w.itemCount || 0}</div>
          <div style="font-size:10px; color:var(--text-2);">صنف</div>
        </div>
      </div>` : ""}
      <!-- Footer -->
      <div style="display:flex; align-items:center; justify-content:space-between; padding-top:4px;">
        <span class="badge ${isActive ? "good" : "bad"}" style="font-size:10px;">${isActive ? "✅ نشط" : "⛔ معطل"}</span>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); openWhDetails('${w.id}')" title="التفاصيل">🔍</button>
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); openWhLocations('${w.id}','${escQ(w.name)}')" title="المواقع الداخلية">📍</button>
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); editWarehouse('${w.id}')" title="تعديل">✏️</button>
          <button class="btn btn-sm btn-ghost text-bad" onclick="event.stopPropagation(); deleteWarehouse('${w.id}','${escQ(w.name)}')" title="حذف">🗑️</button>
        </div>
      </div>
    </div>
  </div>`;
}

function buildTableView(list) {
  const rows = list.map(w => {
    const t = WAREHOUSE_TYPES[w.type] || WAREHOUSE_TYPES.Virtual;
    const isActive = w.isActive !== false;
    return `<tr>
      <td class="mono font-bold" style="color:${t.color};">${w.barcodePrefix || "—"}</td>
      <td><div style="display:flex;align-items:center;gap:8px;"><span style="font-size:18px;">${t.icon}</span><div><div style="font-weight:600;">${w.name}</div><div style="font-size:11px;color:var(--text-2);">${w.location||""}</div></div></div></td>
      <td><span class="badge" style="background:${t.bg};color:${t.color};border:1px solid ${t.color}33;font-size:10px;">${t.label}</span></td>
      <td>${w.storageTemperature === "frozen" ? "🧊 تجميد" : w.storageTemperature === "chilled" ? "❄️ تبريد" : "🌡️ جاف"}</td>
      <td>${w.manager || "—"}</td>
      <td class="mono">${w.capacity ? w.capacity + " م³" : "—"}</td>
      <td class="mono dim">${w.costCenter || "—"}</td>
      <td>${w.workingHours || "—"}</td>
      <td><span class="badge ${isActive ? "good" : "bad"}" style="font-size:10px;">${isActive ? "نشط" : "معطل"}</span></td>
      <td>
        <div class="row-actions">
          <button class="btn btn-icon sm btn-ghost" onclick="openWhDetails('${w.id}')" title="تفاصيل">🔍</button>
          <button class="btn btn-icon sm btn-ghost" onclick="openWhLocations('${w.id}','${escQ(w.name)}')" title="مواقع">📍</button>
          <button class="btn btn-icon sm btn-ghost" onclick="editWarehouse('${w.id}')" title="تعديل">✏️</button>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteWarehouse('${w.id}','${escQ(w.name)}')" title="حذف">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join("");

  return `<div class="card"><div class="table-container"><table class="data-dense">
    <thead><tr>
      <th>الكود</th><th>اسم المخزن</th><th>النوع</th><th>الحرارة</th><th>المسؤول</th>
      <th>السعة</th><th>مركز التكلفة</th><th>ساعات العمل</th><th>الحالة</th><th style="width:120px;"></th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table></div></div>`;
}

// ─── Helpers ─────────────────────────────────────────────────
function escQ(s) { return (s || "").replace(/'/g, "\\'"); }

function setupSearch() {
  const inp = document.getElementById("wh-search");
  if (!inp) return;
  inp.addEventListener("input", debounce(() => {
    searchTerm = inp.value.trim();
    renderContent();
  }, 250));
}

// ─── Global Window Functions ──────────────────────────────────
window.setWhView = (v) => {
  activeView = v;
  document.querySelectorAll(".active-view").forEach(b => b.classList.remove("active-view"));
  document.getElementById("btn-view-" + v)?.classList.add("active-view");
  renderContent();
};

window.filterWarehouses = () => {
  filterType   = document.getElementById("wh-type-filter")?.value || "";
  filterStatus = document.getElementById("wh-status-filter")?.value || "";
  renderContent();
};

window.openWarehouseModal = (w = null) => {
  const isEdit = !!w;
  document.getElementById("wh-edit-id").value             = w?.id || "";
  document.getElementById("wh-modal-title").textContent   = isEdit ? "✏️ تعديل مخزن" : "🏭 إضافة مخزن جديد";
  document.getElementById("wh-prefix").value              = w?.barcodePrefix || "";
  document.getElementById("wh-name").value                = w?.name || "";
  document.getElementById("wh-type").value                = w?.type || "Main";
  document.getElementById("wh-temp").value                = w?.storageTemperature || "ambient";
  document.getElementById("wh-active").value              = (w?.isActive === false) ? "0" : "1";
  document.getElementById("wh-manager").value             = w?.manager || "";
  document.getElementById("wh-phone").value               = w?.phone || "";
  document.getElementById("wh-location").value            = w?.location || "";
  document.getElementById("wh-hours").value               = w?.workingHours || "";
  document.getElementById("wh-capacity").value            = w?.capacity || "";
  document.getElementById("wh-shelves").value             = w?.shelves || "";
  document.getElementById("wh-aisles").value              = w?.aisles || "";
  document.getElementById("wh-acc-inv").value             = w?.accountId || "";
  document.getElementById("wh-acc-var").value             = w?.varianceAccountId || "";
  document.getElementById("wh-cost-center").value         = w?.costCenter || "";
  document.getElementById("wh-notes").value               = w?.notes || "";
  document.getElementById("wh-allow-negative").checked    = w?.allowNegative || false;
  document.getElementById("wh-require-serial").checked    = w?.requireSerial || false;
  document.getElementById("wh-require-batch").checked     = w?.requireBatch !== false;
  document.getElementById("wh-require-expiry").checked    = w?.requireExpiry !== false;
  document.getElementById("wh-error").classList.add("hidden");
  openModal("wh-modal");
};

window.editWarehouse = (id) => {
  const w = warehouses.find(x => x.id === id);
  if (w) openWarehouseModal(w);
};

window.saveWarehouse = async () => {
  const errEl = document.getElementById("wh-error"); errEl.classList.add("hidden");
  const id     = document.getElementById("wh-edit-id").value;
  const prefix = document.getElementById("wh-prefix").value.trim().toUpperCase();
  const name   = document.getElementById("wh-name").value.trim();
  const type   = document.getElementById("wh-type").value;
  const accId  = document.getElementById("wh-acc-inv").value;

  if (!prefix) { errEl.textContent = "يرجى إدخال كود المخزن"; errEl.classList.remove("hidden"); return; }
  if (!name)   { errEl.textContent = "يرجى إدخال اسم المخزن";  errEl.classList.remove("hidden"); return; }
  if (!type)   { errEl.textContent = "يرجى تحديد نوع المخزن"; errEl.classList.remove("hidden"); return; }

  const data = {
    barcodePrefix:      prefix,
    name,
    type,
    storageTemperature: document.getElementById("wh-temp").value,
    isActive:           document.getElementById("wh-active").value === "1",
    manager:            document.getElementById("wh-manager").value.trim(),
    phone:              document.getElementById("wh-phone").value.trim(),
    location:           document.getElementById("wh-location").value.trim(),
    workingHours:       document.getElementById("wh-hours").value.trim(),
    capacity:           parseFloat(document.getElementById("wh-capacity").value) || null,
    shelves:            parseInt(document.getElementById("wh-shelves").value) || null,
    aisles:             parseInt(document.getElementById("wh-aisles").value) || null,
    accountId:          accId,
    varianceAccountId:  document.getElementById("wh-acc-var").value,
    costCenter:         document.getElementById("wh-cost-center").value.trim(),
    notes:              document.getElementById("wh-notes").value.trim(),
    allowNegative:      document.getElementById("wh-allow-negative").checked,
    requireSerial:      document.getElementById("wh-require-serial").checked,
    requireBatch:       document.getElementById("wh-require-batch").checked,
    requireExpiry:      document.getElementById("wh-require-expiry").checked,
  };

  const btn = document.getElementById("save-wh-btn"); btn.disabled = true; btn.textContent = "جارٍ الحفظ…";
  try {
    if (id) {
      const oldWh = warehouses.find(w => w.id === id);
      let finalAccountId = accId || oldWh?.accountId;
      let finalAccountCode = oldWh?.accountCode || null;

      if (!finalAccountId) {
        // Heal missing COA reference — creates analytical sub-account automatically
        const coaData = await syncEntityToCoa("warehouses", id, name, { type });
        if (coaData) {
          finalAccountId   = coaData.accountId;
          finalAccountCode = coaData.accountCode;
        }
      } else if (oldWh && oldWh.name !== name && finalAccountId === oldWh.accountId) {
        await updateEntityInCoa(finalAccountId, name);
      }

      data.accountId            = finalAccountId;
      data.inventoryAccountId   = finalAccountId;   // ← للاستخدام في accounting-engine
      if (finalAccountCode) {
        data.accountCode          = finalAccountCode;
        data.inventoryAccountCode = finalAccountCode; // ← للاستخدام في accounting-engine
      }

      await update("warehouses", id, data);
      window.showToast("✅ تم تحديث المخزن بنجاح", "success");
    } else {
      const whId = await create(COLS.warehouses(), data);
      let finalAccountId   = accId;
      let finalAccountCode = null;

      if (!finalAccountId) {
        // إنشاء حساب تحليلي تلقائي تحت 1-1-4-1 أو 1-1-4-2
        const coaData = await syncEntityToCoa("warehouses", whId, name, { type });
        if (coaData) {
          finalAccountId   = coaData.accountId;
          finalAccountCode = coaData.accountCode;
          await update("warehouses", whId, {
            accountId:            finalAccountId,
            accountCode:          finalAccountCode,
            inventoryAccountId:   finalAccountId,   // ← للاستخدام في accounting-engine
            inventoryAccountCode: finalAccountCode, // ← للاستخدام في accounting-engine
          });
        }
      }
      window.showToast("✅ تم إضافة المخزن بنجاح", "success");
    }
    closeModal("wh-modal");
    await loadWarehouses();
  } catch (err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false; btn.textContent = "💾 حفظ المخزن";
  }
};

window.deleteWarehouse = async (id, name) => {
  if (!await window.showConfirm(`هل أنت متأكد من حذف المخزن "${name}"؟\nتأكد أنه لا توجد حركات مرتبطة به.`, "حذف المخزن")) return;
  try {
    const w = warehouses.find(x => x.id === id);
    if (w && w.accountId) {
      await deleteEntityInCoa("warehouses", id, w.accountId);
    }
    await remove("warehouses", id);
    window.showToast("تم الحذف بنجاح", "success");
    await loadWarehouses();
  } catch (err) { window.showToast(err.message, "error"); }
};

// ─── Warehouse Details ────────────────────────────────────────
window.openWhDetails = async (id) => {
  const body  = document.getElementById("wh-detail-body");
  const title = document.getElementById("wh-detail-title");
  body.innerHTML = `<div class="page-loading"><div class="loading-spinner"></div></div>`;
  openModal("wh-detail-modal");

  const w = warehouses.find(x => x.id === id);
  if (!w) { body.innerHTML = `<div class="alert bad">المخزن غير موجود</div>`; return; }
  const t = WAREHOUSE_TYPES[w.type] || WAREHOUSE_TYPES.Virtual;
  title.innerHTML = `${t.icon} ${w.name} <span class="mono" style="font-size:13px;color:${t.color};">(${w.barcodePrefix})</span>`;

  // Load stock summary for this warehouse from stockByWarehouse (the real collection)
  let stockRows = "";
  try {
    const [stockDocs, products] = await Promise.all([
      getStockForWarehouse(id),
      getAll(COLS.products()),
    ]);

    // Build product lookup map
    const prodMap = {};
    products.forEach(p => { prodMap[p.id] = p; });

    // Filter non-zero quantities and enrich with product info
    const rows = stockDocs
      .filter(s => (s.qty || 0) !== 0)
      .map(s => {
        const prod = prodMap[s.productId] || {};
        const costPrice = prod.costPrice || prod.avgCost || prod.purchasePrice || 0;
        return {
          sku:  prod.sku || prod.barcode || '—',
          name: prod.name || prod.productName || s.productId || '—',
          qty:  s.qty || 0,
          val:  Math.max(0, (s.qty || 0) * costPrice),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'ar'));

    if (rows.length === 0) {
      stockRows = `<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--text-2);">لا يوجد مخزون حالي في هذا المخزن</td></tr>`;
    } else {
      stockRows = rows.map(r => `<tr>
        <td class="mono dim">${r.sku}</td>
        <td>${r.name}</td>
        <td class="mono ${r.qty < 0 ? 'text-bad' : ''}">${formatQuantity(r.qty)}</td>
        <td class="mono">${formatCurrency(r.val)}</td>
      </tr>`).join('');
    }
  } catch(err) {
    console.error('[WH] Stock load error:', err);
    stockRows = `<tr><td colspan="4" style="text-align:center;padding:16px;"><span class="text-bad">تعذّر تحميل البيانات</span><br><small style="color:var(--text-2);">${err.message}</small></td></tr>`;
  }

  body.innerHTML = `
    <!-- Info Grid -->
    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:24px;">
      ${[
        ["النوع", t.label, t.color],
        ["درجة الحرارة", w.storageTemperature === "frozen" ? "🧊 تجميد" : w.storageTemperature === "chilled" ? "❄️ تبريد" : "🌡️ جاف", "#0EA5E9"],
        ["الحالة", w.isActive !== false ? "✅ نشط" : "⛔ معطل", w.isActive !== false ? "#22C55E" : "#EF4444"],
        ["المسؤول", w.manager || "—", "#8B5CF6"],
        ["الموقع", w.location || "—", "#F59E0B"],
        ["ساعات العمل", w.workingHours || "—", "#6B7280"],
        ["الطاقة الاستيعابية", w.capacity ? w.capacity + " م³" : "—", "#5B7FFF"],
        ["عدد الأرفف", w.shelves || "—", "#059669"],
        ["مركز التكلفة", w.costCenter || "—", "#92400E"],
      ].map(([l, v, c]) => `
        <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:10px; padding:14px;">
          <div style="font-size:11px; color:var(--text-2); margin-bottom:4px;">${l}</div>
          <div style="font-weight:600; color:${c}; font-size:14px;">${v}</div>
        </div>`).join("")}
    </div>

    <!-- Stock Table -->
    <div class="wh-section-title" style="margin-bottom:12px;">📦 المخزون الحالي في هذا المخزن</div>
    <div class="table-container">
      <table class="data-dense">
        <thead><tr><th>SKU</th><th>الصنف</th><th>الكمية</th><th>القيمة (ر.س)</th></tr></thead>
        <tbody>${stockRows}</tbody>
      </table>
    </div>
    <div style="margin-top:16px; display:flex; gap:10px;">
      <button class="btn btn-secondary btn-sm" onclick="openWhLocations('${id}','${escQ(w.name)}')">📍 المواقع الداخلية</button>
      <button class="btn btn-secondary btn-sm" onclick="editWarehouse('${id}'); closeModal('wh-detail-modal')">✏️ تعديل المخزن</button>
    </div>
  `;
};

// ─── Locations Management ─────────────────────────────────────
let locationsData = [];

window.openWhLocations = async (whId, whName) => {
  document.getElementById("wh-loc-warehouse-id").value = whId;
  document.getElementById("wh-loc-title").textContent   = `📍 مواقع التخزين — ${whName}`;
  ["loc-zone","loc-aisle","loc-shelf","loc-level","loc-name"].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = "";
  });
  openModal("wh-locations-modal");
  await loadLocations(whId);
};

async function loadLocations(whId) {
  const tbody = document.getElementById("wh-locations-tbody");
  if (!tbody) return;
  try {
    const q = query(COLS.inventoryLocations(), where("warehouseId","==", whId), orderBy("code"));
    const snap = await getDocs(q);
    locationsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (!locationsData.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--text-2);">لا توجد مواقع محددة — أضف موقعاً جديداً</td></tr>`;
      return;
    }
    tbody.innerHTML = locationsData.map(loc => `<tr>
      <td class="mono font-bold">${loc.code || "—"}</td>
      <td>${loc.name || "—"}</td>
      <td>${loc.zone || "—"}</td>
      <td>${loc.aisle || "—"}</td>
      <td>${loc.shelf || "—"}</td>
      <td>${loc.level || "—"}</td>
      <td><span class="badge neutral" style="font-size:10px;">${loc.type || "shelf"}</span></td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteLocation('${loc.id}')">🗑️</button></td>
    </tr>`).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-bad">${err.message}</td></tr>`;
  }
}

window.addLocation = async () => {
  const whId = document.getElementById("wh-loc-warehouse-id").value;
  const zone  = document.getElementById("loc-zone").value.trim().toUpperCase();
  const aisle = document.getElementById("loc-aisle").value.trim().padStart(2,"0");
  const shelf = document.getElementById("loc-shelf").value.trim().padStart(2,"0");
  const level = document.getElementById("loc-level").value.trim().padStart(2,"0");
  const name  = document.getElementById("loc-name").value.trim();
  const type  = document.getElementById("loc-type").value;

  const code = [zone, aisle, shelf, level].filter(Boolean).join("-") || name;
  if (!code) { window.showToast("يرجى إدخال بيانات الموقع", "error"); return; }

  try {
    await create(COLS.inventoryLocations(), { warehouseId: whId, code, name: name || code, zone, aisle, shelf, level, type, isActive: true });
    window.showToast("✅ تم إضافة الموقع", "success");
    await loadLocations(whId);
  } catch (err) { window.showToast(err.message, "error"); }
};

window.deleteLocation = async (id) => {
  const whId = document.getElementById("wh-loc-warehouse-id").value;
  if (!await window.showConfirm("هل تريد حذف هذا الموقع؟", "حذف موقع")) return;
  try {
    await remove("inventoryLocations", id);
    window.showToast("تم الحذف", "success");
    await loadLocations(whId);
  } catch (err) { window.showToast(err.message, "error"); }
};

window.exportWarehouses = () => {
  const rows = [["الكود","الاسم","النوع","الحرارة","المسؤول","الموقع","الطاقة","مركز التكلفة","الحالة"]];
  warehouses.forEach(w => {
    const t = WAREHOUSE_TYPES[w.type] || {};
    rows.push([w.barcodePrefix, w.name, t.label||w.type, w.storageTemperature, w.manager||"", w.location||"", w.capacity||"", w.costCenter||"", w.isActive!==false?"نشط":"معطل"]);
  });
  const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csv);
  a.download = `warehouses_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
};
