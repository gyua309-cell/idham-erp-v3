// ══════════════════════════════════════════════════════════════════
// VAN LOADING & MORNING DISPATCH MODULE (إدارة تحميل وجرد سيارات التوزيع)
// مؤتمت بالكامل: حركات مخزنية فورية (المستودع الرئيسي ↔ سيارة المندوب) + قيود محاسبية تلقائية
// ══════════════════════════════════════════════════════════════════

import { db, COMPANY_ID } from "../firebase-config.js";
import {
  getAll, create, update, remove, getById,
  COLS, orderBy, where, getDoc, doc,
  collection, getDocs, query,
  adjustStock, createJournalEntry, clearERPCache,
  getStockForWarehouse
} from "../utils/db.js";
import { formatCurrency, formatDate, todayString } from "../utils/formatters.js";

// helpers not in formatters — use global window functions
const showToast   = (...a) => window.showToast?.(...a)   ?? console.log(...a);
const showConfirm = (...a) => window.showConfirm?.(...a) ?? Promise.resolve(true);

let allDispatches       = [];
let allReps             = [];
let allWarehouses       = [];
let allProducts         = [];
let currentLines        = [];
let currentWhStockMap   = new Map();
let currentSourceWhId   = null;

// ──────────────────────────────────────────
// حساب المخزون لكل مستودع في شجرة الحسابات (COA)
// ──────────────────────────────────────────
async function getWarehouseInventoryAccount(warehouseId, warehouseName) {
  const isVehicle = /سيارة|سياره|مندوب|vehicle|car|\brep\b|مصطفى|عمرو|احمد|عوض|السيد/i.test(warehouseName || "");
  const parentCode = isVehicle ? "1-1-4-1-02" : "1-1-4-1";

  try {
    const colRef = collection(db, `companies/${COMPANY_ID}/chartOfAccounts`);

    // 1. الأولوية الأولى: الربط المباشر عبر sourceEntityId
    if (warehouseId) {
      const byEntityQ = query(colRef, where("sourceEntityId", "==", warehouseId));
      const byEntitySnap = await getDocs(byEntityQ);
      if (!byEntitySnap.empty) {
        const docSnap = byEntitySnap.docs[0];
        const d = docSnap.data();
        return { code: d.code, id: docSnap.id, name: d.name };
      }
    }

    // 2. الأولوية الثانية: البحث بالتطابق في الاسم
    const subQ = query(colRef, where("parentCode", "==", parentCode));
    const subSnap = await getDocs(subQ);
    const subs = subSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const wn = (warehouseName || "").trim().toLowerCase();
    for (const acc of subs) {
      const accName = (acc.name || "").toLowerCase();
      if (accName === wn || accName.includes(wn) || wn.includes(accName)) {
        return { code: acc.code, id: acc.id, name: acc.name };
      }
    }

    // 3. الحساب الافتراضي كبديل
    if (isVehicle) {
      return { code: "1-1-4-1-02", id: "Sk02PGbhDhvVPQtKmkq6", name: "مخزون سيارات التوزيع" };
    } else {
      return { code: "1-1-4-1-01", id: "wh_coa_W5uANJjMgfFh2p3xU4bT", name: "مخزون المستودع الرئيسى" };
    }
  } catch (e) {
    console.warn("[getWarehouseInventoryAccount] COA lookup failed:", e.message);
  }

  return {
    code: isVehicle ? "1-1-4-1-02" : "1-1-4-1-01",
    id:   isVehicle ? "Sk02PGbhDhvVPQtKmkq6" : "wh_coa_W5uANJjMgfFh2p3xU4bT",
    name: isVehicle ? "مخزون سيارات التوزيع" : "مخزون المستودع الرئيسى"
  };
}

// ──────────────────────────────────────────
// حساب خسائر وتوالف البضاعة في شجرة الحسابات
// ──────────────────────────────────────────
async function getDamageExpenseAccount() {
  try {
    const colRef = collection(db, `companies/${COMPANY_ID}/chartOfAccounts`);
    const q10 = query(colRef, where("code", "==", "5-1-10"));
    const s10 = await getDocs(q10);
    if (!s10.empty) {
      const d = s10.docs[0].data();
      return { id: s10.docs[0].id, code: d.code, name: d.name };
    }
    const q22 = query(colRef, where("code", "==", "5-2-2"));
    const s22 = await getDocs(q22);
    if (!s22.empty) {
      const d = s22.docs[0].data();
      return { id: s22.docs[0].id, code: d.code, name: d.name };
    }
  } catch (e) {
    console.warn("getDamageExpenseAccount:", e);
  }
  return { id: "LwGr9VldJ6MD8ds1WO3l", code: "5-1-10", name: "خسائر وتوالف مخزنية وبضاعة تالفة" };
}

// ──────────────────────────────────────────
// Entry point required by ERP router
// ──────────────────────────────────────────
export async function render(container, user) {
  await renderVanLoadingDispatch(container);
}

async function renderVanLoadingDispatch(root) {
  if (!root) root = document.getElementById("main-content");
  if (!root) return;

  root.innerHTML = `
    <div class="page-container" style="padding:20px 24px; animation: fadeIn 0.3s ease;">
      
      <!-- Header -->
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:46px; height:46px; border-radius:12px; background:linear-gradient(135deg, #10B981, #059669); display:flex; align-items:center; justify-content:center; color:#fff; font-size:24px; box-shadow:0 4px 12px rgba(16,185,129,0.25);">
            🚚
          </div>
          <div>
            <h2 style="font-size:20px; font-weight:900; margin:0; color:var(--text-0);">تحميل وجرد سيارات مندوبي التوزيع (Van Dispatch)</h2>
            <p style="margin:2px 0 0; font-size:12.5px; color:var(--text-2);">إذونات التحميل الصباحية • جرد المتبقي والتوالف المسائي • قيود وحركات مخزنية مؤتمتة بالكامل</p>
          </div>
        </div>

        <div style="display:flex; gap:10px;">
          <button class="btn btn-primary" onclick="window.openNewDispatchModal()" style="display:flex; align-items:center; gap:8px; font-weight:800; padding:10px 20px; border-radius:10px; background:linear-gradient(135deg, #10B981, #059669); box-shadow:0 4px 12px rgba(16,185,129,0.3);">
            <span style="font-size:16px;">➕</span> <span>إذن تحميل صباحي جديد</span>
          </button>
        </div>
      </div>

      <!-- Quick KPI Stats Cards -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-bottom:20px;">
        <div class="card" style="padding:16px; border-radius:14px; border:1px solid var(--border-soft); background:var(--bg-card);">
          <div style="font-size:11.5px; color:var(--text-2); font-weight:700;">إجمالي إرساليات اليوم</div>
          <div class="mono font-bold" id="stat-dispatch-count" style="font-size:22px; color:var(--brand); margin-top:4px;">0</div>
        </div>
        <div class="card" style="padding:16px; border-radius:14px; border:1px solid var(--border-soft); background:var(--bg-card);">
          <div style="font-size:11.5px; color:var(--text-2); font-weight:700;">سيارات قيد التوزيع (في الميدان)</div>
          <div class="mono font-bold text-warn" id="stat-active-vans" style="font-size:22px; margin-top:4px;">0</div>
        </div>
        <div class="card" style="padding:16px; border-radius:14px; border:1px solid var(--border-soft); background:var(--bg-card);">
          <div style="font-size:11.5px; color:var(--text-2); font-weight:700;">تمت التسوية والجرد المسائي</div>
          <div class="mono font-bold text-good" id="stat-reconciled-count" style="font-size:22px; margin-top:4px;">0</div>
        </div>
        <div class="card" style="padding:16px; border-radius:14px; border:1px solid var(--border-soft); background:var(--bg-card);">
          <div style="font-size:11.5px; color:var(--text-2); font-weight:700;">إجمالي قيمة بضاعة الميدان المحملة</div>
          <div class="mono font-bold" id="stat-total-dispatched-val" style="font-size:22px; color:#6366F1; margin-top:4px;">0.00 ر.س</div>
        </div>
      </div>

      <!-- Filter & Search Toolbar -->
      <div class="card" style="padding:14px 18px; border-radius:14px; border:1px solid var(--border-soft); margin-bottom:16px; background:var(--bg-card);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div style="display:flex; gap:10px; align-items:center; flex:1; min-width:280px;">
            <input type="text" id="dispatch-search" class="form-control" placeholder="🔍 ابحث برقم الإذن، اسم المندوب، أو لوحة الشاحنة…" style="max-width:340px;" oninput="window.filterDispatches()" />
            <select id="dispatch-status-filter" class="form-control" style="max-width:180px;" onchange="window.filterDispatches()">
              <option value="">كل الحالات</option>
              <option value="out">قيد التوزيع (في الميدان)</option>
              <option value="reconciled">تمت التسوية والجرد</option>
            </select>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.refreshDispatchList()">🔄 تحديث</button>
        </div>
      </div>

      <!-- Dispatches Table -->
      <div class="card" style="padding:0; border-radius:14px; border:1px solid var(--border-soft); overflow:hidden; background:var(--bg-card);">
        <div class="table-container" style="max-height:550px; overflow-y:auto;">
          <table class="data-dense" style="margin:0; font-size:12.5px;">
            <thead>
              <tr style="background:var(--bg-3); position:sticky; top:0; z-index:2;">
                <th style="width:110px;">رقم الإذن</th>
                <th style="width:95px;">التاريخ</th>
                <th>المندوب / السائق</th>
                <th>المركبة / اللوحة</th>
                <th>المستودع المصدر</th>
                <th>مخزن السيارة</th>
                <th style="width:85px; text-align:center;">عدد الأصناف</th>
                <th style="width:85px; text-align:center;">إجمالي الكراتين</th>
                <th style="width:115px; text-align:left;">قيمة التحميل</th>
                <th style="width:105px; text-align:center;">الحالة</th>
                <th style="width:160px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="dispatches-tbody">
              <tr><td colspan="11" style="text-align:center; padding:30px; color:var(--text-2);">⏳ جارٍ تحميل أذونات التحميل…</td></tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ═══════════ NEW DISPATCH MODAL ═══════════ -->
    <div class="modal-overlay" id="dispatch-modal" onclick="if(event.target===this)window.closeDispatchModal()">
      <div class="modal modal-xl" style="max-width:1080px; width:95%; max-height:92vh; display:flex; flex-direction:column; padding:0; border-radius:18px; overflow:hidden; background:var(--bg-1);">
        <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); background:var(--bg-card); display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:22px;">🚚</span>
            <div>
              <h3 style="margin:0; font-size:16px; font-weight:900; color:var(--text-0);">إذن تحميل سيارة توزيع صباحي جديد</h3>
              <p style="margin:2px 0 0; font-size:11.5px; color:var(--text-2);">يخصم من المستودع المصدر ويضاف لعهدة ومخزن سيارة المندوب مع قيد محاسبي تلقائي</p>
            </div>
          </div>
          <button class="modal-close" onclick="window.closeDispatchModal()">×</button>
        </div>

        <div class="modal-body" style="padding:20px; overflow-y:auto; flex:1; background:var(--bg-3);">
          
          <div class="card" style="padding:16px; border-radius:12px; margin-bottom:14px; background:var(--bg-card);">
            <div class="grid-3 gap-12 mb-12">
              <div class="form-group">
                <label style="font-size:11.5px; font-weight:700;">رقم إذن التحميل</label>
                <input type="text" id="disp-number" class="form-control mono font-bold" readonly style="background:var(--bg-2); color:var(--brand);" />
              </div>
              <div class="form-group">
                <label style="font-size:11.5px; font-weight:700;">تاريخ الإرسالية *</label>
                <input type="date" id="disp-date" class="form-control mono font-bold" value="${todayString()}" />
              </div>
              <div class="form-group">
                <label style="font-size:11.5px; font-weight:700;">المستودع المصدر (الصرف) *</label>
                <select id="disp-warehouse" class="form-control font-bold" onchange="window.onSourceWarehouseChange(this.value)"></select>
              </div>
            </div>

            <div class="grid-3 gap-12">
              <div class="form-group">
                <label style="font-size:11.5px; font-weight:700;">المندوب المسؤول *</label>
                <select id="disp-rep" class="form-control font-bold" onchange="window.onDispRepChange(this.value)"></select>
              </div>
              <div class="form-group">
                <label style="font-size:11.5px; font-weight:700;">لوحة المركبة / رقمها</label>
                <input type="text" id="disp-vehicle" class="form-control font-bold mono" placeholder="مثال: ABC 1234" />
              </div>
              <div class="form-group">
                <label style="font-size:11.5px; font-weight:700;">خط السير المستهدف</label>
                <input type="text" id="disp-route" class="form-control" placeholder="مثال: خط وسط المدينة / البقالات" />
              </div>
            </div>

            <!-- Auto Warehouse Link Indicator Badge -->
            <div id="disp-rep-wh-badge" style="margin-top:12px; padding:8px 12px; border-radius:8px; font-size:12px; display:none; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); color:var(--good);">
            </div>
          </div>

          <!-- Items Selection Section -->
          <div class="card" style="padding:16px; border-radius:12px; background:var(--bg-card);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px;">
              <strong style="font-size:13.5px; color:var(--text-0);">📋 البضاعة المحملة بالسيارة</strong>
              <div style="position:relative; width:380px;">
                <input type="text" id="disp-product-search" class="form-control" placeholder="🔍 ابحث بالاسم أو الباركود لإضافة صنف للسيارة..." oninput="window.searchDispatchProducts(this.value)" autocomplete="off" />
                <div id="disp-product-results" class="autocomplete-results hidden" style="position:absolute; top:100%; right:0; left:0; max-height:220px; overflow-y:auto; z-index:100; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,0.18);"></div>
              </div>
            </div>

            <div class="table-container" style="max-height:280px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:8px;">
              <table class="data-dense" style="margin:0; font-size:12px;">
                <thead>
                  <tr style="background:var(--bg-3);">
                    <th style="width:30px;">#</th>
                    <th>اسم الصنف</th>
                    <th style="width:70px;">الوحدة</th>
                    <th style="width:85px; text-align:center;">المتاح بالمصدر</th>
                    <th style="width:100px; text-align:center;">كمية التحميل</th>
                    <th style="width:90px; text-align:left;">سعر التكلفة</th>
                    <th style="width:95px; text-align:left;">سعر البيع</th>
                    <th style="width:110px; text-align:left;">إجمالي البيع</th>
                    <th style="width:35px;"></th>
                  </tr>
                </thead>
                <tbody id="disp-lines-tbody">
                  <tr><td colspan="9" style="text-align:center; padding:25px; color:var(--text-2);">لم يتم إضافة أصناف بعد — استخدم مربع البحث أعلاه لاختيار الأصناف</td></tr>
                </tbody>
              </table>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; padding:12px 16px; background:var(--bg-2); border-radius:10px; flex-wrap:wrap; gap:10px;">
              <div>
                <span style="font-size:12px; color:var(--text-2);">عدد الأصناف: </span>
                <b id="disp-total-items-count" class="mono">0 صنف</b>
                <span style="margin:0 8px; color:var(--border-soft);">|</span>
                <span style="font-size:12px; color:var(--text-2);">إجمالي الكراتين/القطع: </span>
                <b id="disp-total-qty-count" class="mono font-bold" style="color:var(--brand);">0</b>
              </div>
              <div style="display:flex; gap:18px; align-items:center;">
                <div>
                  <span style="font-size:12px; color:var(--text-2);">إجمالي التكلفة: </span>
                  <span id="disp-total-cost" class="mono font-bold" style="font-size:14px; color:var(--text-1);">0.00 ر.س</span>
                </div>
                <div>
                  <span style="font-size:13px; font-weight:800; color:var(--text-0);">إجمالي قيمة البضاعة: </span>
                  <span id="disp-total-val" class="mono font-bold" style="font-size:17px; color:var(--brand);">0.00 ر.س</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="modal-footer" style="padding:14px 20px; border-top:1px solid var(--border-soft); background:var(--bg-card); display:flex; justify-content:space-between;">
          <button class="btn btn-ghost" onclick="window.closeDispatchModal()">إلغاء</button>
          <button class="btn btn-primary" id="save-dispatch-btn" onclick="window.saveDispatch()" style="padding:9px 24px; font-weight:800; background:linear-gradient(135deg,#10B981,#059669); box-shadow:0 4px 12px rgba(16,185,129,0.3);">
            💾 حفظ واعتماد خروج السيارة (نقل مخزني وقيد تلقائي)
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════ EVENING RECONCILIATION MODAL ═══════════ -->
    <div class="modal-overlay" id="recon-modal" onclick="if(event.target===this)window.closeReconModal()">
      <div class="modal modal-xl" style="max-width:1100px; width:95%; max-height:92vh; display:flex; flex-direction:column; padding:0; border-radius:18px; overflow:hidden; background:var(--bg-1);">
        <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); background:var(--bg-card); display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:22px;">⚖️</span>
            <div>
              <h3 style="margin:0; font-size:16px; font-weight:900; color:var(--text-0);">تسوية وجرد متبقي وتوالف سيارة التوزيع المسائي</h3>
              <p style="margin:2px 0 0; font-size:11.5px; color:var(--text-2);">إعادة المتبقي للمستودع الرئيسي وإثبات التوالف وإقفال مبيعات اليومية آلياً</p>
            </div>
          </div>
          <button class="modal-close" onclick="window.closeReconModal()">×</button>
        </div>

        <div class="modal-body" style="padding:20px; overflow-y:auto; flex:1; background:var(--bg-3);" id="recon-modal-body">
          <!-- Dynamic Content -->
        </div>

        <div class="modal-footer" style="padding:14px 20px; border-top:1px solid var(--border-soft); background:var(--bg-card); display:flex; justify-content:space-between;">
          <button class="btn btn-ghost" onclick="window.closeReconModal()">إلغاء</button>
          <button class="btn btn-primary" id="save-recon-btn" onclick="window.saveReconciliation()" style="padding:9px 24px; font-weight:800; background:linear-gradient(135deg, #6366F1, #4F46E5);">
            💾 اعتماد التسوية وإعادة المتبقي للمستودع (قيود وحركات آلية)
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════ VIEW RECONCILIATION SUMMARY MODAL ═══════════ -->
    <div class="modal-overlay" id="recon-view-modal" onclick="if(event.target===this)window.closeReconViewModal()">
      <div class="modal modal-lg" style="max-width:900px; width:95%; max-height:90vh; display:flex; flex-direction:column; padding:0; border-radius:18px; overflow:hidden; background:var(--bg-1);">
        <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); background:var(--bg-card); display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0; font-size:16px; font-weight:900; color:var(--text-0);">📊 تقرير تسوية جرد سيارة التوزيع المسائية</h3>
          <button class="modal-close" onclick="window.closeReconViewModal()">×</button>
        </div>

        <div class="modal-body" style="padding:20px; overflow-y:auto; flex:1; background:var(--bg-3);" id="recon-view-body">
          <!-- Dynamic Content -->
        </div>

        <div class="modal-footer" style="padding:14px 20px; border-top:1px solid var(--border-soft); background:var(--bg-card); display:flex; justify-content:space-between;">
          <button class="btn btn-ghost" onclick="window.closeReconViewModal()">إغلاق</button>
          <button class="btn btn-secondary" id="print-recon-summary-btn" onclick="window.printCurrentReconciliation()">🖨️ طباعة تقرير التسوية</button>
        </div>
      </div>
    </div>
  `;

  await loadDispatchInitialData();
}

async function loadDispatchInitialData() {
  try {
    const [dList, rList, wList, pList] = await Promise.all([
      getAll(COLS.vanDispatches(), [orderBy("createdAt", "desc")]).catch(async () => {
        // Fallback without orderBy in case of indexing
        return getAll(COLS.vanDispatches()).catch(() => []);
      }),
      getAll(COLS.salesReps()).catch(() => []),
      getAll(COLS.warehouses()).catch(() => []),
      getAll(COLS.products()).catch(() => [])
    ]);

    allDispatches = dList || [];
    // Sort client side by createdAt desc
    allDispatches.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    allReps       = rList || [];
    allWarehouses = wList || [];
    allProducts   = pList || [];

    renderDispatchesTable(allDispatches);
    updateKPIs();
  } catch (err) {
    console.error("loadDispatchInitialData error:", err);
    showToast("خطأ في تحميل البيانات: " + err.message, "error");
  }
}

function updateKPIs() {
  const total = allDispatches.length;
  const active = allDispatches.filter(d => d.status === "out").length;
  const reconciled = allDispatches.filter(d => d.status === "reconciled").length;
  const totalVal = allDispatches.filter(d => d.status === "out").reduce((acc, d) => acc + (d.totalValue || 0), 0);

  const el = id => document.getElementById(id);
  if (el("stat-dispatch-count")) el("stat-dispatch-count").textContent = total;
  if (el("stat-active-vans")) el("stat-active-vans").textContent = active;
  if (el("stat-reconciled-count")) el("stat-reconciled-count").textContent = reconciled;
  if (el("stat-total-dispatched-val")) el("stat-total-dispatched-val").textContent = formatCurrency(totalVal);
}

function renderDispatchesTable(list) {
  const tbody = document.getElementById("dispatches-tbody");
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:30px; color:var(--text-2);">لا توجد أذونات تحميل مسجلة حتى الآن</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(d => {
    const isOut = d.status === "out";
    return `
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td class="mono font-bold" style="color:var(--brand);">${d.dispatchNumber || d.id}</td>
        <td class="mono">${d.date || '—'}</td>
        <td class="font-bold" style="color:var(--text-0);">${d.repName || '—'}</td>
        <td>${d.vehiclePlate ? `🚚 ${d.vehiclePlate}` : '—'}</td>
        <td style="color:var(--text-2); font-size:12px;">${d.warehouseName || '—'}</td>
        <td style="color:var(--brand); font-size:12px; font-weight:700;">${d.destWarehouseName || '—'}</td>
        <td style="text-align:center;" class="mono">${(d.lines||[]).length}</td>
        <td style="text-align:center;" class="mono font-bold">${d.totalQty || 0}</td>
        <td style="text-align:left;" class="mono font-bold text-good">${formatCurrency(d.totalValue || 0)}</td>
        <td style="text-align:center;">
          ${isOut 
            ? '<span class="badge warn" style="font-size:11px; padding:3px 8px;">⏳ في الميدان</span>'
            : '<span class="badge good" style="font-size:11px; padding:3px 8px;">✅ تمت التسوية</span>'}
        </td>
        <td style="text-align:center;">
          <div style="display:flex; gap:6px; justify-content:center; flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" onclick="window.printDispatch('${d.id}')" title="طباعة إذن التحميل">🖨️ إذن</button>
            ${isOut ? `
              <button class="btn btn-primary btn-sm" style="background:#6366F1; font-size:11px; padding:3px 8px; font-weight:700;" onclick="window.openReconciliationModal('${d.id}')">⚖️ جرد مسائي</button>
            ` : `
              <button class="btn btn-secondary btn-sm" style="font-size:11px; padding:3px 8px;" onclick="window.viewReconciliationSummary('${d.id}')">👁️ التقرير</button>
              <button class="btn btn-secondary btn-sm" style="font-size:11px; padding:3px 8px;" onclick="window.printReconciliation('${d.id}')" title="طباعة تقرير التسوية">🖨️ تسوية</button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

window.filterDispatches = () => {
  const term = document.getElementById("dispatch-search")?.value.toLowerCase().trim() || "";
  const st = document.getElementById("dispatch-status-filter")?.value || "";

  const filtered = allDispatches.filter(d => {
    const matchTerm = !term || 
      (d.dispatchNumber||"").toLowerCase().includes(term) || 
      (d.repName||"").toLowerCase().includes(term) || 
      (d.vehiclePlate||"").toLowerCase().includes(term);
    const matchStatus = !st || d.status === st;
    return matchTerm && matchStatus;
  });

  renderDispatchesTable(filtered);
};

window.refreshDispatchList = loadDispatchInitialData;

// ──────────────────────────────────────────
// فتح نافذة إذن التحميل الصباحي الجديد
// ──────────────────────────────────────────
window.openNewDispatchModal = async () => {
  currentLines = [];

  // توليد رقم إذن التحميل
  const now = new Date();
  const dateStr = now.toISOString().slice(0,10).replace(/-/g,"");
  const rand = Math.floor(Math.random() * 900) + 100;
  
  const numEl = document.getElementById("disp-number");
  const dateEl = document.getElementById("disp-date");
  const routeEl = document.getElementById("disp-route");
  const vehEl = document.getElementById("disp-vehicle");
  const badgeEl = document.getElementById("disp-rep-wh-badge");

  if (numEl) numEl.value = `DSP-${dateStr}-${rand}`;
  if (dateEl) dateEl.value = todayString();
  if (routeEl) routeEl.value = "";
  if (vehEl) vehEl.value = "";
  if (badgeEl) badgeEl.style.display = "none";

  // المستودعات المصدر (المستودع الرئيسي افتراضياً)
  const whSel = document.getElementById("disp-warehouse");
  if (whSel) {
    const mainWh = allWarehouses.find(w => w.id === "W5uANJjMgfFh2p3xU4bT" || (w.type || "").toLowerCase() === "main" || w.name.includes("الرئيس"));
    whSel.innerHTML = allWarehouses
      .filter(w => (w.type || "").toLowerCase() !== "vehicle") // إذن التحميل يصرف من مستودع ثابت
      .map(w => `<option value="${w.id}" ${(mainWh && mainWh.id === w.id) ? 'selected' : ''}>${w.name}</option>`)
      .join("");
    
    // إذا لم يكن هناك مستودع رئيسي مفلتر
    if (!whSel.options.length) {
      whSel.innerHTML = allWarehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join("");
    }

    currentSourceWhId = whSel.value;
  }

  // المندوبين
  const repSel = document.getElementById("disp-rep");
  if (repSel) {
    repSel.innerHTML = '<option value="">— اختر المندوب المسند له التحميل —</option>' +
      allReps.map(r => `<option value="${r.id}" data-name="${r.name||r.fullName||''}">${r.name||r.fullName||r.id}</option>`).join("");
  }

  // تحميل مخزون المستودع المصدر
  await window.onSourceWarehouseChange(currentSourceWhId);

  renderDispatchLines();

  // فتح المودال باستخدام دالة النظام الرسمية
  window.openModal("dispatch-modal");
};

window.closeDispatchModal = () => {
  window.closeModal("dispatch-modal");
};

// عند تغيير المستودع المصدر
window.onSourceWarehouseChange = async (whId) => {
  currentSourceWhId = whId || document.getElementById("disp-warehouse")?.value;
  currentWhStockMap.clear();

  if (currentSourceWhId) {
    try {
      const stocks = await getStockForWarehouse(currentSourceWhId);
      for (const s of stocks) {
        currentWhStockMap.set(s.productId, s.qty || 0);
      }
    } catch(e) {
      console.warn("Could not fetch warehouse stock:", e);
    }
  }

  renderDispatchLines();
};

// عند اختيار المندوب
window.onDispRepChange = (repId) => {
  const rep = allReps.find(r => r.id === repId);
  const vehEl = document.getElementById("disp-vehicle");
  const badgeEl = document.getElementById("disp-rep-wh-badge");

  if (!rep) {
    if (vehEl) vehEl.value = "";
    if (badgeEl) badgeEl.style.display = "none";
    return;
  }

  // لوحة السيارة
  const vehicle = rep.vehiclePlate || rep.vehicle || "";
  if (vehEl) vehEl.value = vehicle;

  // فحص المستودع المرتبط بالمندوب
  let vanWh = null;
  if (rep.assignedWarehouseId) {
    vanWh = allWarehouses.find(w => w.id === rep.assignedWarehouseId);
  }
  if (!vanWh) {
    // محاولة تطابق بالاسم
    const repName = (rep.name || rep.fullName || "").trim();
    vanWh = allWarehouses.find(w => (w.name || "").includes(repName) && (w.type || "").toLowerCase() === "vehicle");
  }

  if (badgeEl) {
    if (vanWh) {
      badgeEl.innerHTML = `🚚 <b>مخزن سيارة المندوب المرتبط:</b> ${vanWh.name} <span class="badge good" style="margin-right:6px; font-size:11px;">مربوط وجاهز للأتمتة التامة</span>`;
      badgeEl.style.display = "block";
    } else {
      badgeEl.innerHTML = `⚠️ <span style="color:var(--warn); font-weight:700;">تنبيه:</span> لا يوجد مخزن سيارة مرتبط بهذا المندوب. سيتم ربطه آلياً بمخزن سيارات التوزيع.`;
      badgeEl.style.display = "block";
    }
  }
};

// البحث عن الأصناف لإضافتها
window.searchDispatchProducts = (term) => {
  const resEl = document.getElementById("disp-product-results");
  if (!resEl) return;
  term = (term || "").toLowerCase().trim();
  if (!term) { resEl.classList.add("hidden"); return; }

  const matches = allProducts.filter(p => 
    (p.name || "").toLowerCase().includes(term) || 
    (p.sku || "").toLowerCase().includes(term) ||
    (p.barcode || "").toLowerCase().includes(term)
  ).slice(0, 10);

  if (!matches.length) {
    resEl.innerHTML = `<div style="padding:12px; color:var(--text-2); font-size:12px; text-align:center;">لا توجد أصناف مطابقة للبحث</div>`;
    resEl.classList.remove("hidden");
    return;
  }

  resEl.innerHTML = matches.map(p => {
    const avail = currentWhStockMap.get(p.id) || 0;
    const availClass = avail > 0 ? "text-good" : "text-bad";
    return `
      <div class="autocomplete-item" style="padding:9px 14px; cursor:pointer; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;" onclick="window.addDispatchProduct('${p.id}')">
        <div>
          <b style="color:var(--text-0);">${p.name}</b> 
          <span style="font-size:11px; color:var(--text-2); margin-right:6px;">(${p.unit || 'كرتون'} - ${p.sku||'—'})</span>
        </div>
        <div style="display:flex; gap:14px; align-items:center;">
          <span style="font-size:11.5px; color:var(--text-2);">المتاح: <b class="mono ${availClass}">${avail}</b></span>
          <b class="mono text-good">${formatCurrency(p.sellingPrice || p.priceRetail || 0)}</b>
        </div>
      </div>
    `;
  }).join("");
  resEl.classList.remove("hidden");
};

// إضافة صنف لجدول التحميل
window.addDispatchProduct = (prodId) => {
  const p = allProducts.find(x => x.id === prodId);
  if (!p) return;

  const cost = parseFloat(p.averageCost || p.costPrice || p.purchasePrice || 0) || 
               Math.round((parseFloat(p.sellingPrice || p.priceRetail || 0) * 0.7) * 100) / 100 || 1;
  const sell = parseFloat(p.sellingPrice || p.priceRetail || 0) || 0;

  const existing = currentLines.find(l => l.productId === prodId);
  if (existing) {
    existing.qty += 1;
  } else {
    currentLines.push({
      productId:   p.id,
      productName: p.name,
      sku:         p.sku || "",
      unit:        p.unit || "كرتون",
      qty:         10,
      costPrice:   cost,
      sellingPrice: sell
    });
  }

  const sInput = document.getElementById("disp-product-search");
  const sRes = document.getElementById("disp-product-results");
  if (sInput) sInput.value = "";
  if (sRes) sRes.classList.add("hidden");

  renderDispatchLines();
};

function renderDispatchLines() {
  const tbody = document.getElementById("disp-lines-tbody");
  if (!tbody) return;

  let totalQty  = 0;
  let totalVal  = 0;
  let totalCost = 0;

  if (!currentLines.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:25px; color:var(--text-2);">لم يتم إضافة أصناف بعد — استخدم مربع البحث أعلاه لاختيار الأصناف</td></tr>`;
  } else {
    tbody.innerHTML = currentLines.map((l, i) => {
      const lineVal  = l.qty * l.sellingPrice;
      const lineCost = l.qty * l.costPrice;
      totalQty  += l.qty;
      totalVal  += lineVal;
      totalCost += lineCost;

      const avail = currentWhStockMap.get(l.productId) || 0;
      const availWarn = l.qty > avail;

      return `
        <tr style="border-bottom:1px solid var(--border-soft); ${availWarn ? 'background:rgba(239,68,68,0.05);' : ''}">
          <td style="text-align:center; color:var(--text-2); font-size:11px;">${i+1}</td>
          <td class="font-bold">${l.productName}</td>
          <td style="color:var(--text-2);">${l.unit}</td>
          <td style="text-align:center;" class="mono font-bold ${avail > 0 ? 'text-good' : 'text-bad'}">
            ${avail}
          </td>
          <td style="text-align:center;">
            <input type="number" class="form-control mono font-bold" style="width:80px; height:28px; text-align:center; ${availWarn ? 'border-color:var(--bad); color:var(--bad);' : ''}" value="${l.qty}" min="1" onchange="window.updateDispLine(${i}, 'qty', this.value)" />
          </td>
          <td class="mono font-bold" style="color:var(--text-2);">${formatCurrency(l.costPrice)}</td>
          <td class="mono font-bold">${formatCurrency(l.sellingPrice)}</td>
          <td class="mono font-bold text-good">${formatCurrency(lineVal)}</td>
          <td style="text-align:center;">
            <button class="btn btn-ghost sm" style="color:var(--bad); padding:2px 6px;" onclick="window.removeDispLine(${i})">✕</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  const itemsEl = document.getElementById("disp-total-items-count");
  const qtyEl   = document.getElementById("disp-total-qty-count");
  const costEl  = document.getElementById("disp-total-cost");
  const valEl   = document.getElementById("disp-total-val");

  if (itemsEl) itemsEl.textContent = `${currentLines.length} صنف`;
  if (qtyEl)   qtyEl.textContent   = totalQty;
  if (costEl)  costEl.textContent  = formatCurrency(totalCost);
  if (valEl)   valEl.textContent   = formatCurrency(totalVal);
}

window.updateDispLine = (idx, field, val) => {
  if (!currentLines[idx]) return;
  currentLines[idx][field] = parseFloat(val) || 0;
  renderDispatchLines();
};

window.removeDispLine = (idx) => {
  currentLines.splice(idx, 1);
  renderDispatchLines();
};

// ──────────────────────────────────────────
// حفظ إذن التحميل الصباحي + الحركات المخزنية + القيد المحاسبي
// ──────────────────────────────────────────
window.saveDispatch = async () => {
  const saveBtn = document.getElementById("save-dispatch-btn");
  const whSel   = document.getElementById("disp-warehouse");
  const repSel  = document.getElementById("disp-rep");
  const vehEl   = document.getElementById("disp-vehicle");

  const warehouseId   = whSel?.value;
  const warehouseName = whSel?.options[whSel.selectedIndex]?.text || "";
  const repId         = repSel?.value;
  const repOpt        = repSel?.options[repSel?.selectedIndex];
  const repName       = repOpt?.dataset?.name || repOpt?.text || "";
  const vehiclePlate  = (vehEl?.value || "").trim();
  const route         = document.getElementById("disp-route")?.value.trim() || "";
  const dispNum       = document.getElementById("disp-number")?.value;
  const dispDate      = document.getElementById("disp-date")?.value;

  if (!warehouseId)         { showToast("يرجى اختيار المستودع المصدر", "error"); return; }
  if (!repId)               { showToast("يرجى اختيار المندوب المسؤول", "error"); return; }
  if (!currentLines.length) { showToast("يرجى إضافة صنف واحد على الأقل للسيارة", "error"); return; }

  for (const l of currentLines) {
    if ((l.qty || 0) <= 0) {
      showToast(`الكمية المدخلة للصنف ${l.productName} غير صحيحة`, "error");
      return;
    }
  }

  // البحث عن مخزن سيارة المندوب المستهدف
  const repObj = allReps.find(r => r.id === repId);
  let destWarehouseId = repObj?.assignedWarehouseId || null;
  let destWarehouse = destWarehouseId ? allWarehouses.find(w => w.id === destWarehouseId) : null;

  if (!destWarehouse) {
    // محاولة البحث بالاسم
    destWarehouse = allWarehouses.find(w => (w.name || "").includes(repName) && (w.type || "").toLowerCase() === "vehicle");
    if (destWarehouse) destWarehouseId = destWarehouse.id;
  }

  const destWarehouseName = destWarehouse ? destWarehouse.name : `مخزن سيارة المندوب ${repName}`;

  const totalQty   = currentLines.reduce((a, l) => a + l.qty, 0);
  const totalValue = currentLines.reduce((a, l) => a + (l.qty * l.sellingPrice), 0);
  const totalCost  = currentLines.reduce((a, l) => a + (l.qty * (l.costPrice || 0)), 0);

  if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = "⏳ جارٍ الحفظ وإجراء القيود والحركات المخزنية…"; }

  try {
    // 1. إنشاء مستند إذن التحميل
    const docData = {
      dispatchNumber:    dispNum,
      date:              dispDate,
      warehouseId,       // المستودع المصدر
      warehouseName,
      destWarehouseId,   // مستودع سيارة المندوب
      destWarehouseName,
      repId,
      repName,
      vehiclePlate,
      route,
      lines:             currentLines,
      totalQty,
      totalValue,
      totalCost:         Math.round(totalCost * 100) / 100,
      status:            "out",
      createdAt:         new Date().toISOString()
    };

    const newId = await create(COLS.vanDispatches(), docData);

    // 2. الحركات المخزنية التلقائية (خصم من المستودع المصدر وإضافة لمخزن السيارة)
    for (const line of currentLines) {
      // 2.1 صرف من المستودع الرئيسي
      await adjustStock(warehouseId, line.productId, -line.qty, {
        type:           "van_dispatch_out",
        sourceId:       newId,
        documentNumber: dispNum,
        notes:          `إذن تحميل صباحي: صرف بضاعة لسيارة المندوب ${repName} (${vehiclePlate || ''})`
      });

      // 2.2 إضافة لمخزن سيارة المندوب
      if (destWarehouseId) {
        await adjustStock(destWarehouseId, line.productId, +line.qty, {
          type:           "van_dispatch_in",
          sourceId:       newId,
          documentNumber: dispNum,
          notes:          `استلام تحميل بضاعة بالسيارة - إذن ${dispNum}`
        });
      }
    }

    // 3. القيد المحاسبي المالي التلقائي (من مخزن رئيسي إلى مخزن سيارة)
    let jeId = null;
    if (totalCost > 0.001) {
      try {
        const fromAcc = await getWarehouseInventoryAccount(warehouseId, warehouseName);
        const toAcc   = await getWarehouseInventoryAccount(destWarehouseId, destWarehouseName);

        jeId = await createJournalEntry({
          entryNumber: `JE-${dispNum}`,
          date:        dispDate || todayString(),
          description: `إذن تحميل صباحي ${dispNum} — نقل بضاعة من ${warehouseName} إلى ${destWarehouseName}`,
          sourceType:  "vanDispatch",
          sourceId:    newId,
          costCenterId: repObj?.costCenterId || null,
          lines: [
            {
              accountId:   toAcc.id,
              accountCode: toAcc.code,
              accountName: toAcc.name,
              debit:       Math.round(totalCost * 100) / 100,
              credit:      0,
              note:        `استلام مخزون بسيارة المندوب ${repName}`
            },
            {
              accountId:   fromAcc.id,
              accountCode: fromAcc.code,
              accountName: fromAcc.name,
              debit:       0,
              credit:      Math.round(totalCost * 100) / 100,
              note:        `صرف مخزون من ${warehouseName} للسيارة`
            }
          ]
        });

        await update(COLS.vanDispatches(), newId, { journalEntryId: jeId });
      } catch (jeErr) {
        console.warn("[saveDispatch] Auto JE failed:", jeErr.message);
      }
    }

    clearERPCache(COLS.vanDispatches().path);
    window.closeDispatchModal();
    showToast(`✅ تم اعتماد إذن التحميل ${dispNum} وتحديث المخزون والقيد المحاسبي بنجاح`, "success", 4000);
    await loadDispatchInitialData();
  } catch (e) {
    showToast("خطأ في الحفظ: " + e.message, "error");
    console.error(e);
  } finally {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = "💾 حفظ واعتماد خروج السيارة (نقل مخزني وقيد تلقائي)"; }
  }
};

// ──────────────────────────────────────────
// نافذة الجرد والتسوية المسائية (Reconciliation)
// ──────────────────────────────────────────
window.openReconciliationModal = async (dispId) => {
  const d = allDispatches.find(x => x.id === dispId);
  if (!d) return;

  const modalBody = document.getElementById("recon-modal-body");
  if (!modalBody) return;

  window._activeReconDispatch = d;

  modalBody.innerHTML = `
    <div class="card" style="padding:14px; margin-bottom:14px; background:var(--bg-card); border-radius:12px; border:1px solid var(--border-soft);">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <b style="color:var(--brand); font-size:16px;">${d.dispatchNumber}</b> — <span style="font-weight:800; font-size:14px;">المندوب: ${d.repName}</span> (${d.vehiclePlate || 'بدون لوحة'})
          <div style="font-size:12px; color:var(--text-2); margin-top:3px;">
            تاريخ التحميل: <b class="mono">${d.date}</b> • المستودع المصدر: <b>${d.warehouseName}</b> • مخزن السيارة: <b>${d.destWarehouseName || 'مخزن السيارة'}</b>
          </div>
        </div>
        <span class="badge warn" style="font-size:12px; padding:4px 10px;">جرد وتسوية نهاية اليوم</span>
      </div>
    </div>

    <div class="card" style="padding:16px; background:var(--bg-card); border-radius:12px; border:1px solid var(--border-soft);">
      <div style="margin-bottom:10px; font-weight:800; font-size:13.5px; color:var(--text-0);">📦 أدخل الكميات الفعلية المتبقية والتوالف في السيارة:</div>
      <div class="table-container" style="max-height:320px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:8px;">
        <table class="data-dense" style="margin:0; font-size:12px;">
          <thead>
            <tr style="background:var(--bg-3);">
              <th>اسم الصنف</th>
              <th style="width:85px; text-align:center;">المحمّل صباحاً</th>
              <th style="width:110px; text-align:center; color:#10B981;">المتبقي العائد للمستودع</th>
              <th style="width:95px; text-align:center; color:#EF4444;">التوالف</th>
              <th style="width:95px; text-align:center; color:var(--brand);">المباع فعلياً</th>
              <th style="width:115px; text-align:left;">إجمالي مبيعات البند</th>
            </tr>
          </thead>
          <tbody>
            ${(d.lines || []).map((l, i) => `
              <tr style="border-bottom:1px solid var(--border-soft);">
                <td class="font-bold">${l.productName} <span style="font-size:11px; color:var(--text-2);">(${l.unit})</span></td>
                <td style="text-align:center;" class="mono font-bold">${l.qty}</td>
                <td style="text-align:center;">
                  <input type="number" id="recon-return-${i}" class="form-control mono font-bold" style="width:85px; height:28px; text-align:center; color:#10B981; border-color:#10B981;" value="0" min="0" max="${l.qty}" oninput="window.calcReconRow(${i})" />
                </td>
                <td style="text-align:center;">
                  <input type="number" id="recon-damage-${i}" class="form-control mono font-bold" style="width:80px; height:28px; text-align:center; color:#EF4444; border-color:#EF4444;" value="0" min="0" max="${l.qty}" oninput="window.calcReconRow(${i})" />
                </td>
                <td style="text-align:center;">
                  <span id="recon-sold-${i}" class="mono font-bold text-brand" style="font-size:13px;">${l.qty}</span>
                </td>
                <td style="text-align:left;">
                  <span id="recon-row-val-${i}" class="mono font-bold text-good">${formatCurrency(l.qty * l.sellingPrice)}</span>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <!-- Realtime Summary Row -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px; margin-top:14px; padding:12px; background:var(--bg-2); border-radius:10px;">
        <div>
          <span style="font-size:11px; color:var(--text-2);">إجمالي المحمّل صباحاً:</span>
          <div class="mono font-bold" style="font-size:15px;">${d.totalQty} كرتون</div>
        </div>
        <div>
          <span style="font-size:11px; color:#10B981;">إجمالي المرتجع للمستودع:</span>
          <div class="mono font-bold" id="recon-sum-return" style="font-size:15px; color:#10B981;">0 كرتون</div>
        </div>
        <div>
          <span style="font-size:11px; color:#EF4444;">إجمالي التوالف:</span>
          <div class="mono font-bold" id="recon-sum-damage" style="font-size:15px; color:#EF4444;">0 كرتون</div>
        </div>
        <div>
          <span style="font-size:11px; color:var(--brand);">إجمالي المباع فعلياً:</span>
          <div class="mono font-bold" id="recon-sum-sold" style="font-size:15px; color:var(--brand);">${d.totalQty} كرتون</div>
        </div>
        <div>
          <span style="font-size:11px; color:var(--text-0);">إجمالي المبيعات التقديرية:</span>
          <div class="mono font-bold text-good" id="recon-sum-val" style="font-size:15px;">${formatCurrency(d.totalValue)}</div>
        </div>
      </div>
    </div>
  `;

  // فتح المودال باستخدام دالة النظام الرسمية
  window.openModal("recon-modal");
};

window.closeReconModal = () => {
  window.closeModal("recon-modal");
};

window.calcReconRow = (i) => {
  const d = window._activeReconDispatch;
  if (!d) return;

  const lines = d.lines || [];
  let sumRet  = 0;
  let sumDam  = 0;
  let sumSold = 0;
  let sumVal  = 0;

  lines.forEach((l, idx) => {
    const retInput = document.getElementById(`recon-return-${idx}`);
    const damInput = document.getElementById(`recon-damage-${idx}`);
    const soldEl   = document.getElementById(`recon-sold-${idx}`);
    const valEl    = document.getElementById(`recon-row-val-${idx}`);

    let ret = parseFloat(retInput?.value) || 0;
    let dam = parseFloat(damInput?.value) || 0;

    // منع تجاوز الكمية المحملة
    if (ret + dam > l.qty) {
      if (idx === i) {
        showToast(`مجموع المرتجع والتالف للصنف ${l.productName} لا يمكن أن يتجاوز المحمل (${l.qty})`, "warn");
      }
      ret = Math.min(ret, l.qty);
      dam = Math.max(0, Math.min(dam, l.qty - ret));
      if (retInput) retInput.value = ret;
      if (damInput) damInput.value = dam;
    }

    const sold = Math.max(0, l.qty - ret - dam);
    const lineVal = sold * l.sellingPrice;

    if (soldEl) soldEl.textContent = sold;
    if (valEl)  valEl.textContent  = formatCurrency(lineVal);

    sumRet  += ret;
    sumDam  += dam;
    sumSold += sold;
    sumVal  += lineVal;
  });

  const sumRetEl  = document.getElementById("recon-sum-return");
  const sumDamEl  = document.getElementById("recon-sum-damage");
  const sumSoldEl = document.getElementById("recon-sum-sold");
  const sumValEl  = document.getElementById("recon-sum-val");

  if (sumRetEl)  sumRetEl.textContent  = `${sumRet} كرتون`;
  if (sumDamEl)  sumDamEl.textContent  = `${sumDam} كرتون`;
  if (sumSoldEl) sumSoldEl.textContent = `${sumSold} كرتون`;
  if (sumValEl)  sumValEl.textContent  = formatCurrency(sumVal);
};

// ──────────────────────────────────────────
// اعتماد التسوية المسائية وإرجاع المتبقي وإثبات التوالف
// ──────────────────────────────────────────
window.saveReconciliation = async () => {
  const d = window._activeReconDispatch;
  if (!d) return;

  const reconBtn = document.getElementById("save-recon-btn");
  if (!await showConfirm(`هل أنت متأكد من اعتماد تسوية إذن التحميل ${d.dispatchNumber} وإعادة البضاعة المتبقية لمستودع ${d.warehouseName}؟`, "تأكيد التسوية المسائية")) return;

  if (reconBtn) { reconBtn.disabled = true; reconBtn.innerHTML = "⏳ جارٍ تسوية المخزون وإجراء القيود المحاسبية…"; }

  try {
    let totalReturnedQty  = 0;
    let totalDamagedQty   = 0;
    let totalSoldQty      = 0;
    let totalSalesVal     = 0;
    let totalReturnedCost = 0;
    let totalDamagedCost  = 0;

    const reconLines = (d.lines || []).map((l, i) => {
      const ret = parseFloat(document.getElementById(`recon-return-${i}`)?.value) || 0;
      const dam = parseFloat(document.getElementById(`recon-damage-${i}`)?.value) || 0;
      const sold = Math.max(0, l.qty - ret - dam);
      const cost = l.costPrice || 0;

      totalReturnedQty  += ret;
      totalDamagedQty   += dam;
      totalSoldQty      += sold;
      totalSalesVal     += (sold * l.sellingPrice);
      totalReturnedCost += (ret * cost);
      totalDamagedCost  += (dam * cost);

      return {
        ...l,
        returnedQty: ret,
        damagedQty:  dam,
        soldQty:     sold,
        soldAmount:  sold * l.sellingPrice
      };
    });

    const vanWarehouseId    = d.destWarehouseId;
    const sourceWarehouseId = d.warehouseId;

    // 1. تسوية الحركات المخزنية
    for (const l of reconLines) {
      // 1.1 إعادة المتبقي من سيارة المندوب إلى المستودع الرئيسي
      if (l.returnedQty > 0) {
        // خصم من مخزن السيارة
        if (vanWarehouseId) {
          await adjustStock(vanWarehouseId, l.productId, -l.returnedQty, {
            type:           "van_return_out",
            sourceId:       d.id,
            documentNumber: d.dispatchNumber,
            notes:          `إرجاع متبقي جرد مسائي من سيارة: ${d.repName}`
          });
        }
        // إضافة للمستودع الرئيسي
        await adjustStock(sourceWarehouseId, l.productId, +l.returnedQty, {
          type:           "van_return_in",
          sourceId:       d.id,
          documentNumber: d.dispatchNumber,
          notes:          `استلام مرتجع جرد مسائي من سيارة: ${d.repName}`
        });
      }

      // 1.2 خصم التوالف من سيارة المندوب
      if (l.damagedQty > 0) {
        const targetDamWh = vanWarehouseId || sourceWarehouseId;
        await adjustStock(targetDamWh, l.productId, -l.damagedQty, {
          type:           "inventory_damage",
          sourceId:       d.id,
          documentNumber: d.dispatchNumber,
          notes:          `تسوية توالف سيارة التوزيع: ${d.repName} (${l.damagedQty} ${l.unit})`
        });
      }
    }

    // 2. القيود المحاسبية التلقائية
    let returnJEId = null;
    let damageJEId = null;

    const fromWhAcc = await getWarehouseInventoryAccount(sourceWarehouseId, d.warehouseName);
    const vanWhAcc  = await getWarehouseInventoryAccount(vanWarehouseId, d.destWarehouseName);

    // 2.1 قيد إرجاع المتبقي (مدين المستودع الرئيسي / دائن مخزن السيارة)
    if (totalReturnedCost > 0.001) {
      try {
        returnJEId = await createJournalEntry({
          entryNumber: `JE-RET-${d.dispatchNumber}`,
          date:        todayString(),
          description: `تسوية مرتجع جرد مسائي ${d.dispatchNumber} — من سيارة ${d.repName} إلى ${d.warehouseName}`,
          sourceType:  "vanReconciliationReturn",
          sourceId:    d.id,
          lines: [
            {
              accountId:   fromWhAcc.id,
              accountCode: fromWhAcc.code,
              accountName: fromWhAcc.name,
              debit:       Math.round(totalReturnedCost * 100) / 100,
              credit:      0,
              note:        `إعادة بضاعة متبقية للمستودع الرئيسي`
            },
            {
              accountId:   vanWhAcc.id,
              accountCode: vanWhAcc.code,
              accountName: vanWhAcc.name,
              debit:       0,
              credit:      Math.round(totalReturnedCost * 100) / 100,
              note:        `تخفيض عهدة سيارة المندوب ${d.repName}`
            }
          ]
        });
      } catch (errJE) {
        console.warn("Return JE Error:", errJE);
      }
    }

    // 2.2 قيد التوالف (مدين حساب خسائر وتوالف بضاعة / دائن مخزن السيارة)
    if (totalDamagedCost > 0.001) {
      try {
        const damageAcc = await getDamageExpenseAccount();
        damageJEId = await createJournalEntry({
          entryNumber: `JE-DAM-${d.dispatchNumber}`,
          date:        todayString(),
          description: `إثبات توالف بضاعة جرد مسائي ${d.dispatchNumber} — سيارة ${d.repName}`,
          sourceType:  "vanReconciliationDamage",
          sourceId:    d.id,
          lines: [
            {
              accountId:   damageAcc.id,
              accountCode: damageAcc.code,
              accountName: damageAcc.name,
              debit:       Math.round(totalDamagedCost * 100) / 100,
              credit:      0,
              note:        `خسائر وتوالف بضاعة سيارة التوزيع`
            },
            {
              accountId:   vanWhAcc.id,
              accountCode: vanWhAcc.code,
              accountName: vanWhAcc.name,
              debit:       0,
              credit:      Math.round(totalDamagedCost * 100) / 100,
              note:        `تخفيض مخزون السيارة للتالف`
            }
          ]
        });
      } catch (errDamJE) {
        console.warn("Damage JE Error:", errDamJE);
      }
    }

    // 3. تحديث مستند إذن التحميل
    await update(COLS.vanDispatches(), d.id, {
      status:            "reconciled",
      reconLines,
      totalReturnedQty,
      totalDamagedQty,
      totalSoldQty,
      totalSalesVal,
      totalReturnedCost: Math.round(totalReturnedCost * 100) / 100,
      totalDamagedCost:  Math.round(totalDamagedCost * 100) / 100,
      returnJEId,
      damageJEId,
      reconciledAt:      new Date().toISOString()
    });

    clearERPCache(COLS.vanDispatches().path);
    window.closeReconModal();
    showToast(`✅ تمت التسوية بنجاح: تم إرجاع ${totalReturnedQty} كرتون للمستودع وإجراء القيود المحاسبية الآلية`, "success", 4000);
    await loadDispatchInitialData();
  } catch (e) {
    showToast("خطأ في اعتماد التسوية: " + e.message, "error");
    console.error(e);
  } finally {
    if (reconBtn) { reconBtn.disabled = false; reconBtn.innerHTML = "💾 اعتماد التسوية وإعادة المتبقي للمستودع (قيود وحركات آلية)"; }
  }
};

// ──────────────────────────────────────────
// عرض ملخص وتقرير التسوية المسائية
// ──────────────────────────────────────────
window.viewReconciliationSummary = (id) => {
  const d = allDispatches.find(x => x.id === id);
  if (!d) return;

  window._currentViewingRecon = d;
  const modalBody = document.getElementById("recon-view-body");
  if (!modalBody) return;

  const lines = d.reconLines || d.lines || [];

  modalBody.innerHTML = `
    <div class="card" style="padding:16px; margin-bottom:14px; background:var(--bg-card); border-radius:12px; border:1px solid var(--border-soft);">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h4 style="margin:0; font-size:16px; font-weight:900; color:var(--brand);">${d.dispatchNumber}</h4>
          <div style="font-size:12.5px; color:var(--text-1); margin-top:4px;">
            المندوب: <b>${d.repName}</b> • اللوحة: <b>${d.vehiclePlate || '—'}</b> • التاريخ: <b>${d.date}</b>
          </div>
          <div style="font-size:12px; color:var(--text-2); margin-top:2px;">
            المستودع المصدر: <b>${d.warehouseName}</b> • مخزن السيارة: <b>${d.destWarehouseName || 'مخزن السيارة'}</b>
          </div>
        </div>
        <span class="badge good" style="font-size:12px; padding:4px 10px;">✅ تمت التسوية والجرد</span>
      </div>
    </div>

    <!-- Quick Stats Grid -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:10px; margin-bottom:14px;">
      <div class="card" style="padding:12px; background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:11px; color:var(--text-2);">المحمّل صباحاً</div>
        <div class="mono font-bold" style="font-size:17px; margin-top:2px;">${d.totalQty || 0} كرتون</div>
      </div>
      <div class="card" style="padding:12px; background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:11px; color:#10B981;">المرتجع للمستودع</div>
        <div class="mono font-bold text-good" style="font-size:17px; margin-top:2px;">${d.totalReturnedQty || 0} كرتون</div>
      </div>
      <div class="card" style="padding:12px; background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:11px; color:#EF4444;">التوالف</div>
        <div class="mono font-bold text-bad" style="font-size:17px; margin-top:2px;">${d.totalDamagedQty || 0} كرتون</div>
      </div>
      <div class="card" style="padding:12px; background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:11px; color:var(--brand);">المباع بالميدان</div>
        <div class="mono font-bold" style="font-size:17px; margin-top:2px; color:var(--brand);">${d.totalSoldQty || 0} كرتون</div>
      </div>
      <div class="card" style="padding:12px; background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:11px; color:var(--text-0); font-weight:700;">إجمالي المبيعات</div>
        <div class="mono font-bold text-good" style="font-size:17px; margin-top:2px;">${formatCurrency(d.totalSalesVal || 0)}</div>
      </div>
    </div>

    <!-- Items Detail Table -->
    <div class="card" style="padding:0; background:var(--bg-card); border-radius:12px; border:1px solid var(--border-soft); overflow:hidden; margin-bottom:14px;">
      <div class="table-container" style="max-height:260px; overflow-y:auto;">
        <table class="data-dense" style="margin:0; font-size:12px;">
          <thead>
            <tr style="background:var(--bg-3);">
              <th>#</th>
              <th>الصنف</th>
              <th style="width:70px;">الوحدة</th>
              <th style="text-align:center;">المحمّل</th>
              <th style="text-align:center; color:#10B981;">المرتجع</th>
              <th style="text-align:center; color:#EF4444;">التالف</th>
              <th style="text-align:center; color:var(--brand);">المباع</th>
              <th style="text-align:left;">إجمالي البيع</th>
            </tr>
          </thead>
          <tbody>
            ${lines.map((l, i) => `
              <tr style="border-bottom:1px solid var(--border-soft);">
                <td style="color:var(--text-2); text-align:center;">${i+1}</td>
                <td class="font-bold">${l.productName}</td>
                <td style="color:var(--text-2);">${l.unit}</td>
                <td style="text-align:center;" class="mono font-bold">${l.qty}</td>
                <td style="text-align:center;" class="mono font-bold text-good">${l.returnedQty || 0}</td>
                <td style="text-align:center;" class="mono font-bold text-bad">${l.damagedQty || 0}</td>
                <td style="text-align:center;" class="mono font-bold" style="color:var(--brand);">${l.soldQty !== undefined ? l.soldQty : l.qty}</td>
                <td style="text-align:left;" class="mono font-bold text-good">${formatCurrency(l.soldAmount !== undefined ? l.soldAmount : (l.qty * l.sellingPrice))}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Linked Accounting Entries -->
    <div class="card" style="padding:12px 16px; background:var(--bg-2); border-radius:10px; border:1px solid var(--border-soft); font-size:12px;">
      <div style="font-weight:800; margin-bottom:6px; color:var(--text-0);">📑 القيود المحاسبية التلقائية المرتبطة:</div>
      <div style="display:flex; gap:16px; flex-wrap:wrap;">
        <div>إذن التحميل الصباحي: <b class="mono" style="color:var(--brand);">${d.journalEntryId ? 'JE-' + d.dispatchNumber : '—'}</b></div>
        <div>تسوية المرتجع: <b class="mono text-good">${d.returnJEId ? 'JE-RET-' + d.dispatchNumber : '—'}</b></div>
        <div>تسوية التوالف: <b class="mono text-bad">${d.damageJEId ? 'JE-DAM-' + d.dispatchNumber : '—'}</b></div>
      </div>
    </div>
  `;

  window.openModal("recon-view-modal");
};

window.closeReconViewModal = () => {
  window.closeModal("recon-view-modal");
};

window.printCurrentReconciliation = () => {
  if (window._currentViewingRecon) {
    window.printReconciliation(window._currentViewingRecon.id);
  }
};

// ──────────────────────────────────────────
// طباعة إذن التحميل الصباحي
// ──────────────────────────────────────────
window.printDispatch = (id) => {
  const d = allDispatches.find(x => x.id === id);
  if (!d) return;

  const w = window.open("", "_blank");
  w.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>إذن تحميل سيارة ${d.dispatchNumber}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; padding: 10px; color: #111; margin: 0; }
          .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 12px; margin-bottom: 16px; }
          .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px; font-size: 13px; }
          .meta-box { border: 1px solid #ddd; padding: 8px 12px; border-radius: 6px; background: #fafafa; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12.5px; }
          th, td { border: 1px solid #777; padding: 7px 10px; text-align: right; }
          th { background: #f2f2f2; font-weight: bold; }
          .mono { font-family: monospace; font-weight: bold; }
          .totals { margin-top: 14px; text-align: left; font-size: 13.5px; font-weight: bold; }
          .signatures { margin-top: 45px; display: flex; justify-content: space-between; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="margin:0 0 4px;">شركة إدهام للمواد الغذائية</h2>
          <h3 style="margin:0 0 6px; color:#059669;">إذن صرف وتحميل بضاعة لسيارة توزيع (Morning Dispatch)</h3>
          <p style="margin:0; font-size:12.5px; color:#555;">رقم الإذن: <b class="mono">${d.dispatchNumber}</b> | التاريخ: <b class="mono">${d.date}</b></p>
        </div>

        <div class="meta-grid">
          <div class="meta-box"><b>المستودع المصدر:</b> ${d.warehouseName}</div>
          <div class="meta-box"><b>مخزن السيارة المستلم:</b> ${d.destWarehouseName || 'مخزن سيارة المندوب'}</div>
          <div class="meta-box"><b>المندوب المسؤول:</b> ${d.repName}</div>
          <div class="meta-box"><b>المركبة / اللوحة:</b> ${d.vehiclePlate || '—'}</div>
          ${d.route ? `<div class="meta-box" style="grid-column: span 2;"><b>خط السير المستهدف:</b> ${d.route}</div>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:30px; text-align:center;">#</th>
              <th>اسم الصنف</th>
              <th style="width:80px;">الوحدة</th>
              <th style="width:90px; text-align:center;">الكمية المسلمة</th>
              <th style="width:110px; text-align:left;">سعر البيع</th>
              <th style="width:120px; text-align:left;">إجمالي القيمة</th>
            </tr>
          </thead>
          <tbody>
            ${(d.lines||[]).map((l, i) => `
              <tr>
                <td style="text-align:center;">${i+1}</td>
                <td><b>${l.productName}</b></td>
                <td>${l.unit}</td>
                <td style="text-align:center;" class="mono">${l.qty}</td>
                <td style="text-align:left;" class="mono">${formatCurrency(l.sellingPrice)}</td>
                <td style="text-align:left;" class="mono">${formatCurrency(l.qty * l.sellingPrice)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="totals">
          <span>إجمالي الأصناف: <b class="mono">${(d.lines||[]).length}</b></span>
          <span style="margin:0 15px;">|</span>
          <span>إجمالي الكراتين المحملة: <b class="mono">${d.totalQty}</b></span>
          <span style="margin:0 15px;">|</span>
          <span>إجمالي قيمة البضاعة: <b class="mono">${formatCurrency(d.totalValue)}</b></span>
        </div>

        <div class="signatures">
          <div>
            <div>توقيع أمين المستودع (المسلّم):</div>
            <div style="margin-top:28px;">______________________</div>
          </div>
          <div>
            <div>توقيع مسؤول الحركة / الرقابة:</div>
            <div style="margin-top:28px;">______________________</div>
          </div>
          <div>
            <div>توقيع المندوب (المستلم للعهدة):</div>
            <div style="margin-top:28px;">______________________</div>
          </div>
        </div>
      </body>
    </html>
  `);
  w.document.close();
  setTimeout(() => w.print(), 300);
};

// ──────────────────────────────────────────
// طباعة تقرير الجرد والتسوية المسائية
// ──────────────────────────────────────────
window.printReconciliation = (id) => {
  const d = allDispatches.find(x => x.id === id);
  if (!d) return;

  const lines = d.reconLines || d.lines || [];
  const w = window.open("", "_blank");
  w.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>تقرير تسوية وجرد سيارة ${d.dispatchNumber}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; padding: 10px; color: #111; margin: 0; }
          .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 12px; margin-bottom: 16px; }
          .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 16px; font-size: 13px; }
          .meta-box { border: 1px solid #ddd; padding: 8px 12px; border-radius: 6px; background: #fafafa; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #777; padding: 6px 8px; text-align: right; }
          th { background: #f2f2f2; font-weight: bold; }
          .mono { font-family: monospace; font-weight: bold; }
          .totals { margin-top: 14px; text-align: left; font-size: 13px; font-weight: bold; }
          .signatures { margin-top: 45px; display: flex; justify-content: space-between; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="margin:0 0 4px;">شركة إدهام للمواد الغذائية</h2>
          <h3 style="margin:0 0 6px; color:#4F46E5;">تقرير جرد وتسوية متبقي وتوالف سيارة التوزيع (Evening Reconciliation)</h3>
          <p style="margin:0; font-size:12.5px; color:#555;">إذن التحميل: <b class="mono">${d.dispatchNumber}</b> | التاريخ: <b class="mono">${d.date}</b></p>
        </div>

        <div class="meta-grid">
          <div class="meta-box"><b>المندوب:</b> ${d.repName}</div>
          <div class="meta-box"><b>لوحة الشاحنة:</b> ${d.vehiclePlate || '—'}</div>
          <div class="meta-box"><b>المستودع المصدر:</b> ${d.warehouseName}</div>
          <div class="meta-box"><b>مخزن السيارة:</b> ${d.destWarehouseName || 'مخزن السيارة'}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:25px; text-align:center;">#</th>
              <th>اسم الصنف</th>
              <th style="width:65px;">الوحدة</th>
              <th style="width:75px; text-align:center;">المحمّل</th>
              <th style="width:80px; text-align:center;">المرتجع للمستودع</th>
              <th style="width:70px; text-align:center;">التوالف</th>
              <th style="width:75px; text-align:center;">المباع</th>
              <th style="width:90px; text-align:left;">سعر البيع</th>
              <th style="width:110px; text-align:left;">إجمالي المباع</th>
            </tr>
          </thead>
          <tbody>
            ${lines.map((l, i) => `
              <tr>
                <td style="text-align:center;">${i+1}</td>
                <td><b>${l.productName}</b></td>
                <td>${l.unit}</td>
                <td style="text-align:center;" class="mono">${l.qty}</td>
                <td style="text-align:center;" class="mono">${l.returnedQty || 0}</td>
                <td style="text-align:center;" class="mono">${l.damagedQty || 0}</td>
                <td style="text-align:center;" class="mono"><b>${l.soldQty !== undefined ? l.soldQty : l.qty}</b></td>
                <td style="text-align:left;" class="mono">${formatCurrency(l.sellingPrice)}</td>
                <td style="text-align:left;" class="mono"><b>${formatCurrency(l.soldAmount !== undefined ? l.soldAmount : (l.qty * l.sellingPrice))}</b></td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="totals">
          <span>المحمّل: <b class="mono">${d.totalQty}</b></span>
          <span style="margin:0 10px;">|</span>
          <span>المرتجع: <b class="mono" style="color:#059669;">${d.totalReturnedQty || 0}</b></span>
          <span style="margin:0 10px;">|</span>
          <span>التوالف: <b class="mono" style="color:#dc2626;">${d.totalDamagedQty || 0}</b></span>
          <span style="margin:0 10px;">|</span>
          <span>المباع: <b class="mono">${d.totalSoldQty || 0}</b></span>
          <span style="margin:0 10px;">|</span>
          <span>إجمالي المبيعات: <b class="mono">${formatCurrency(d.totalSalesVal || 0)}</b></span>
        </div>

        <div class="signatures">
          <div>
            <div>توقيع أمين المستودع (المستلم للمرتجع):</div>
            <div style="margin-top:28px;">______________________</div>
          </div>
          <div>
            <div>توقيع المحاسب المالي (المطابق للقيود):</div>
            <div style="margin-top:28px;">______________________</div>
          </div>
          <div>
            <div>توقيع المندوب:</div>
            <div style="margin-top:28px;">______________________</div>
          </div>
        </div>
      </body>
    </html>
  `);
  w.document.close();
  setTimeout(() => w.print(), 300);
};
