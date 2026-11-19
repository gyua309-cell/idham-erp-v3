// ============================================================
// IDHAM ERP — سندات تسليم البضاعة (أذون تسليم المبيعات غير الضريبية)
// Official Delivery Notes (DN) & Goods Dispatch Module
// ============================================================

import {
  COLS, getAll, getById, create, update, remove,
  adjustStockBulk, db, COMPANY_ID, collection, doc, getDoc,
  query, where, orderBy, limit, serverTimestamp
} from "../utils/db.js";
import { formatCurrency, formatQuantity, formatDate, todayString, tafqeetArabic, translateUnit } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

let allDeliveryNotes = [];
let allCustomers = [];
let allSalesReps = [];
let allWarehouses = [];
let allProducts = [];
let dnLines = [];
let selectedCustomer = null;
let currentEditingId = null;

const toast = (msg, type = "info") => {
  if (typeof window.showToast === "function") window.showToast(msg, type);
  else alert(msg);
};

function getCompanyInfo() {
  let co = {
    name: "شركة نظم الإمداد المتطورة",
    nameEn: "Advanced Supply Systems Co.",
    address: "مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414",
    phone: "0549141648",
    email: "Nuzmalamdad@gmail.com",
    vatNumber: "314996148100003",
    crNumber: "7054969006",
    logoBase64: "",
    logoUrl: ""
  };
  try {
    const raw = localStorage.getItem("idham_company");
    if (raw) {
      const parsed = JSON.parse(raw);
      co = { ...co, ...parsed };
    } else if (window.ERP_COMPANY) {
      co = { ...co, ...window.ERP_COMPANY };
    }
  } catch {}
  return co;
}

export async function render(container, user) {
  container.innerHTML = `
    <!-- Top Filter & Action Bar -->
    <div class="filterbar no-print" style="padding:14px 20px; background:var(--bg-card); border-radius:14px; border:1px solid var(--border-soft); margin-bottom:20px; display:flex; flex-wrap:wrap; gap:12px; align-items:flex-end;">
      
      <!-- Live Search -->
      <div class="search-bar" style="min-width:220px; flex:1;">
        <label style="font-size:11px; font-weight:800; margin-bottom:3px; display:block; color:var(--text-2);">🔍 بحث في سندات التسليم</label>
        <input type="text" id="dn-search" class="input font-bold" placeholder="ابحث برقم السند، العميل، المندوب..." oninput="window.filterDeliveryNotes()" style="height:38px;" />
      </div>

      <!-- Customer Filter -->
      <div class="filter-select-group" style="min-width:180px;">
        <label style="font-size:11px; font-weight:800; margin-bottom:3px; display:block; color:var(--text-2);">العميل</label>
        <select id="dn-cust-filter" class="input font-bold" onchange="window.filterDeliveryNotes()" style="height:38px;">
          <option value="">كل العملاء</option>
        </select>
      </div>

      <!-- Sales Rep Filter -->
      <div class="filter-select-group" style="min-width:160px;">
        <label style="font-size:11px; font-weight:800; margin-bottom:3px; display:block; color:var(--text-2);">المندوب</label>
        <select id="dn-rep-filter" class="input font-bold" onchange="window.filterDeliveryNotes()" style="height:38px;">
          <option value="">كل المناديب</option>
        </select>
      </div>

      <!-- Warehouse Filter -->
      <div class="filter-select-group" style="min-width:170px;">
        <label style="font-size:11px; font-weight:800; margin-bottom:3px; display:block; color:var(--text-2);">المستودع / السيارة</label>
        <select id="dn-wh-filter" class="input font-bold" onchange="window.filterDeliveryNotes()" style="height:38px;">
          <option value="">كل المستودعات والسيارات</option>
        </select>
      </div>

      <!-- Status Filter -->
      <div class="filter-select-group" style="min-width:150px;">
        <label style="font-size:11px; font-weight:800; margin-bottom:3px; display:block; color:var(--text-2);">حالة السند</label>
        <select id="dn-status-filter" class="input font-bold" onchange="window.filterDeliveryNotes()" style="height:38px;">
          <option value="">كل الحالات</option>
          <option value="confirmed">🟢 تم التسليم (مؤكد)</option>
          <option value="draft">🟡 مسودة (قيد التحضير)</option>
          <option value="converted_to_invoice">🔵 تم التحويل لفاتورة</option>
          <option value="cancelled">🔴 ملغي</option>
        </select>
      </div>

      <!-- Date Range -->
      <div class="date-range-group" style="display:flex; gap:6px; align-items:flex-end;">
        <div>
          <label style="font-size:11px; font-weight:800; margin-bottom:3px; display:block; color:var(--text-2);">من تاريخ</label>
          <input type="date" id="dn-date-from" class="input font-bold mono" onchange="window.filterDeliveryNotes()" style="height:38px; width:130px;" />
        </div>
        <div>
          <label style="font-size:11px; font-weight:800; margin-bottom:3px; display:block; color:var(--text-2);">إلى تاريخ</label>
          <input type="date" id="dn-date-to" class="input font-bold mono" value="${todayString()}" onchange="window.filterDeliveryNotes()" style="height:38px; width:130px;" />
        </div>
      </div>

      <!-- Actions -->
      <div style="margin-right:auto; display:flex; gap:8px; align-items:flex-end;">
        <button class="btn btn-secondary" onclick="window.exportDeliveryNotesExcel()" style="height:38px; font-weight:bold;">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openNewDeliveryNoteModal()" style="height:38px; font-weight:900; background:linear-gradient(135deg, #2563eb, #1d4ed8); display:inline-flex; align-items:center; gap:6px;">
          <span>📦</span> إنشاء سند تسليم بضاعة (DN)
        </button>
      </div>
    </div>

    <div class="page-content">
      
      <!-- KPI Stats -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px; border-top:3px solid #2563eb;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي سندات التسليم</div>
          <div class="mono" id="dn-kpi-count" style="font-size:20px; font-weight:900; margin-top:4px; color:#2563eb;">0</div>
          <div style="font-size:9.5px; color:var(--text-3); margin-top:2px;">سندات تسليم مبيعات</div>
        </div>

        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px; border-top:3px solid #10b981;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي قيمة البضاعة المسلمة</div>
          <div class="mono" id="dn-kpi-total-val" style="font-size:20px; font-weight:900; margin-top:4px; color:#10b981;">0.00 ر.س</div>
          <div style="font-size:9.5px; color:var(--text-3); margin-top:2px;">صافي بدون ضريبة مضافة</div>
        </div>

        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px; border-top:3px solid #8b5cf6;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي الكميات المسلمة</div>
          <div class="mono" id="dn-kpi-total-qty" style="font-size:20px; font-weight:900; margin-top:4px; color:#8b5cf6;">0</div>
          <div style="font-size:9.5px; color:var(--text-3); margin-top:2px;">كرتون / وحدة مباعة</div>
        </div>

        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px; border-top:3px solid #f59e0b;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">سندات قيد التحضير (مسودات)</div>
          <div class="mono" id="dn-kpi-drafts" style="font-size:20px; font-weight:900; margin-top:4px; color:#f59e0b;">0</div>
          <div style="font-size:9.5px; color:var(--text-3); margin-top:2px;">بانتظار التأكيد والصرف</div>
        </div>
      </div>

      <!-- Main Delivery Notes Table -->
      <div class="card" style="border-radius:14px; border:1px solid var(--border-soft); overflow:hidden;">
        <div class="table-container" style="overflow-x:auto;">
          <table class="data-dense" style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr style="background:var(--bg-2); border-bottom:2px solid var(--border-soft); user-select:none;">
                <th style="padding:10px 8px; width:35px; text-align:center;">#</th>
                <th style="padding:10px 10px; width:120px; text-align:right;">رقم السند</th>
                <th style="padding:10px 10px; width:95px; text-align:center;">التاريخ</th>
                <th style="padding:10px 12px; text-align:right;">العميل المستلم</th>
                <th style="padding:10px 10px; text-align:right;">المندوب</th>
                <th style="padding:10px 10px; text-align:right;">المستودع / السيارة</th>
                <th style="padding:10px 8px; width:75px; text-align:center;">الكمية</th>
                <th style="padding:10px 12px; width:120px; text-align:left;">إجمالي القيمة</th>
                <th style="padding:10px 8px; width:95px; text-align:center;">طريقة الدفع</th>
                <th style="padding:10px 10px; width:130px; text-align:center;">الحالة</th>
                <th style="padding:10px 12px; width:160px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="dn-tbody">
              <tr><td colspan="11" style="text-align:center; padding:40px;"><span class="spin"></span> جارٍ تحميل سندات التسليم...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: NEW / EDIT DELIVERY NOTE ═══ -->
    <div class="modal-overlay" id="dn-modal">
      <div class="modal modal-xl" style="background:var(--bg-card, #ffffff); border-radius:16px; border:1px solid var(--border-soft); width:100%; max-width:1050px; max-height:92vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 60px rgba(0,0,0,0.35);">
        
        <!-- Modal Header -->
        <div class="modal-header" style="padding:16px 22px; background:linear-gradient(135deg, #1e3a8a, #2563eb); color:#fff; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 class="modal-title" id="dn-modal-title" style="margin:0; font-size:16px; font-weight:900; color:#fff;">📦 إنشاء سند تسليم بضاعة مبيعات جديد (DN)</h3>
            <div style="font-size:11px; opacity:0.85; margin-top:2px;">سند تسليم تجاري غير ضريبي — يخصم المخزون ويثبت الاستلام والمديونية فوراً</div>
          </div>
          <button type="button" class="modal-close" onclick="window.closeDeliveryNoteModal()" style="background:none; border:none; color:#fff; font-size:24px; cursor:pointer; line-height:1;">×</button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body" style="padding:18px 22px; overflow-y:auto; flex:1;">
          
          <!-- Top Form Row 1: Document Meta -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:12px; margin-bottom:14px;">
            <div class="form-group">
              <label style="font-size:11px; font-weight:800; margin-bottom:4px; display:block; color:var(--text-1);">رقم سند التسليم</label>
              <input type="text" id="dn-number" class="input mono font-bold" readonly style="height:36px; background:var(--bg-2); color:var(--brand);" />
            </div>

            <div class="form-group">
              <label style="font-size:11px; font-weight:800; margin-bottom:4px; display:block; color:var(--text-1);">التاريخ *</label>
              <input type="date" id="dn-date" class="input mono font-bold" value="${todayString()}" style="height:36px;" />
            </div>

            <div class="form-group">
              <label style="font-size:11px; font-weight:800; margin-bottom:4px; display:block; color:var(--text-1);">طريقة الدفع *</label>
              <select id="dn-payment-method" class="input font-bold" style="height:36px;">
                <option value="credit">آجل (على حساب العميل)</option>
                <option value="cash">نقدي (تم استلام القيمة)</option>
              </select>
            </div>

            <div class="form-group">
              <label style="font-size:11px; font-weight:800; margin-bottom:4px; display:block; color:var(--text-1);">المستودع / السيارة المصدر *</label>
              <select id="dn-warehouse" class="input font-bold" onchange="window.onDNWarehouseChanged()" style="height:36px;">
                <!-- Warehouses -->
              </select>
            </div>

            <div class="form-group">
              <label style="font-size:11px; font-weight:800; margin-bottom:4px; display:block; color:var(--text-1);">المندوب المسؤول</label>
              <select id="dn-rep" class="input font-bold" style="height:36px;">
                <!-- Reps -->
              </select>
            </div>
          </div>

          <!-- Customer Selection Row -->
          <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:12px; margin-bottom:16px; background:var(--bg-2); padding:12px 16px; border-radius:10px; border:1px solid var(--border-soft);">
            <div style="position:relative;">
              <label style="font-size:11px; font-weight:800; margin-bottom:4px; display:block; color:var(--text-1);">العميل المستلم *</label>
              <input type="text" id="dn-customer-search" class="input font-bold" placeholder="🔍 ابحث عن العميل بالاسم أو رقم الهاتف..." autocomplete="off" style="height:36px;" />
              <div id="dn-customer-results" class="shadow-lg" style="display:none; position:absolute; top:calc(100% + 4px); right:0; left:0; z-index:1050; max-height:220px; overflow-y:auto; background:var(--bg-card, #fff); border:1.5px solid #2563eb; border-radius:8px; padding:4px;"></div>
              <input type="hidden" id="dn-customer-id" />
            </div>

            <div>
              <label style="font-size:11px; font-weight:800; margin-bottom:4px; display:block; color:var(--text-2);">الرصيد الحالي للعميل</label>
              <div id="dn-customer-balance-box" class="mono font-bold" style="height:36px; display:flex; align-items:center; padding:0 10px; background:var(--bg-1); border-radius:6px; border:1px solid var(--border-soft); font-size:13px; color:var(--text-1);">—</div>
            </div>

            <div>
              <label style="font-size:11px; font-weight:800; margin-bottom:4px; display:block; color:var(--text-2);">اسم المستلم / السائق</label>
              <input type="text" id="dn-receiver-name" class="input" placeholder="اسم الشخص المستلم..." style="height:36px;" />
            </div>
          </div>

          <!-- Add Product Autocomplete Row -->
          <div style="display:flex; gap:10px; align-items:flex-end; margin-bottom:12px; background:rgba(37,99,235,0.05); padding:12px 16px; border-radius:10px; border:1px solid rgba(37,99,235,0.2);">
            <div style="position:relative; flex:2;">
              <label style="font-size:11.5px; font-weight:800; margin-bottom:4px; display:block; color:#1e40af;">➕ إضافة صنف لسند التسليم</label>
              <input type="text" id="dn-product-search" class="input font-bold" placeholder="ابحث باسم الصنف، الكود، الباركود..." autocomplete="off" style="height:38px; border-color:#93c5fd;" />
              <div id="dn-product-results" class="shadow-lg" style="display:none; position:absolute; top:calc(100% + 4px); right:0; left:0; z-index:1050; max-height:260px; overflow-y:auto; background:var(--bg-card, #fff); border:1.5px solid #2563eb; border-radius:8px; padding:4px;"></div>
            </div>
            <div style="font-size:11px; color:var(--text-2); padding-bottom:10px;">
              💡 سيتم إظهار الرصيد الفعلي المتوفر في المستودع المختار فوراً لكل صنف
            </div>
          </div>

          <!-- Line Items Table -->
          <div style="border:1px solid var(--border-soft); border-radius:10px; overflow:hidden; margin-bottom:16px;">
            <table style="width:100%; border-collapse:collapse; font-size:12px;">
              <thead>
                <tr style="background:var(--bg-2); border-bottom:1.5px solid var(--border-soft);">
                  <th style="padding:8px 6px; width:30px; text-align:center;">#</th>
                  <th style="padding:8px 10px; text-align:right;">الصنف والوصف</th>
                  <th style="padding:8px 8px; width:90px; text-align:center;">الوحدة</th>
                  <th style="padding:8px 8px; width:130px; text-align:center;">التشغيلة / الصلاحية</th>
                  <th style="padding:8px 8px; width:80px; text-align:center;">الرصيد المتاح</th>
                  <th style="padding:8px 8px; width:85px; text-align:center;">الكمية المسلمة</th>
                  <th style="padding:8px 8px; width:95px; text-align:center;">سعر الوحدة</th>
                  <th style="padding:8px 8px; width:70px; text-align:center;">خصم %</th>
                  <th style="padding:8px 10px; width:105px; text-align:left;">الإجمالي</th>
                  <th style="padding:8px 6px; width:35px; text-align:center;"></th>
                </tr>
              </thead>
              <tbody id="dn-lines-tbody">
                <!-- Lines rendered dynamically -->
              </tbody>
            </table>
          </div>

          <!-- Summary & Totals Bottom Section -->
          <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:16px; align-items:start;">
            
            <!-- Notes & Terms -->
            <div>
              <label style="font-size:11px; font-weight:800; margin-bottom:4px; display:block; color:var(--text-1);">ملاحظات وشروط سند التسليم</label>
              <textarea id="dn-notes" class="input" rows="3" placeholder="أدخل أي ملاحظات خاصة بالتسليم، رقم طلب الشراء، السائق، إلخ..." style="width:100%; resize:vertical; font-size:12px;"></textarea>
            </div>

            <!-- Totals Box (No Tax / Non-VAT) -->
            <div style="background:var(--bg-2); padding:14px 18px; border-radius:10px; border:1px solid var(--border-soft);">
              <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:12px; color:var(--text-2);">
                <span>إجمالي القيمة قبل الخصم:</span>
                <span class="mono font-bold" id="dn-subtotal">0.00 ر.س</span>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:12px; color:#ef4444;">
                <span>إجمالي الخصم:</span>
                <span class="mono font-bold" id="dn-discount">-0.00 ر.س</span>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:11px; color:#10b981; font-weight:700; border-top:1px dashed var(--border-soft); padding-top:6px;">
                <span>ضريبة القيمة المضافة (0% مستند غير ضريبي):</span>
                <span class="mono">0.00 ر.س</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:15px; font-weight:900; color:var(--brand); border-top:2px solid var(--border-soft); padding-top:8px;">
                <span>الصافي النهائي للتسليم:</span>
                <span class="mono" id="dn-grand-total">0.00 ر.س</span>
              </div>
              <div style="font-size:10.5px; color:var(--text-2); margin-top:6px; text-align:left; font-weight:700;" id="dn-tafqeet">
                فقط صفر ريال سعودي لا غير
              </div>
            </div>

          </div>

        </div>

        <!-- Modal Footer -->
        <div class="modal-footer" style="padding:14px 22px; background:var(--bg-1); border-top:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <button type="button" class="btn btn-ghost" onclick="window.closeDeliveryNoteModal()">إلغاء</button>
          
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn btn-secondary" onclick="window.saveDeliveryNote('draft')" style="font-weight:700;">
              📝 حفظ كمسودة
            </button>
            <button type="button" class="btn btn-primary" id="btn-save-dn" onclick="window.saveDeliveryNote('confirmed')" style="font-weight:900; background:linear-gradient(135deg, #16a34a, #15803d);">
              ✅ حفظ وتأكيد التسليم (خصم فوري للمخزون)
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- ═══ MODAL: VIEW & PRINT DELIVERY NOTE ═══ -->
    <div class="modal-overlay" id="dn-view-modal">
      <div class="modal modal-lg" style="background:#fff; border-radius:16px; border:1px solid #cbd5e1; width:100%; max-width:920px; max-height:92vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 60px rgba(0,0,0,0.35);">
        
        <div class="modal-header no-print" style="padding:14px 20px; background:#1e293b; color:#fff; display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0; font-size:15px; font-weight:900; color:#fff;">معاينة وطباعة سند تسليم البضاعة</h3>
          <button type="button" class="modal-close" onclick="window.closeViewDNModal()" style="background:none; border:none; color:#fff; font-size:24px; cursor:pointer;">×</button>
        </div>

        <div class="modal-body" id="dn-view-content" style="padding:24px; overflow-y:auto; flex:1; background:#fff; color:#0f172a;">
          <!-- Printable Sheet Rendered Dynamically -->
        </div>

        <div class="modal-footer no-print" style="padding:12px 20px; background:#f8fafc; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn btn-ghost" onclick="window.closeViewDNModal()">إغلاق</button>
            <button type="button" class="btn btn-secondary" id="btn-convert-dn-to-inv" onclick="window.convertDNToSalesInvoice()" style="font-weight:700; color:#2563eb; border-color:#2563eb;">
              ⚡ تحويل إلى فاتورة ضريبية رسمية (INV)
            </button>
          </div>

          <div style="display:flex; gap:8px;">
            <button type="button" class="btn btn-secondary" onclick="window.printDNThermal()" style="font-weight:700;">
              🧾 طباعة إيصال حراري (80mm)
            </button>
            <button type="button" class="btn btn-primary" onclick="window.printDNA4()" style="font-weight:900; background:#1e3a8a;">
              🖨️ طباعة سند تسليم رسمي (A4)
            </button>
          </div>
        </div>

      </div>
    </div>
  `;

  await loadInitialData();
}

// ── 1. Data Loading & Initialization ──
async function loadInitialData() {
  try {
    const [custs, reps, whs, prods, notes] = await Promise.all([
      getAll(COLS.customers()).catch(() => []),
      getAll(COLS.salesReps()).catch(() => []),
      getAll(COLS.warehouses()).catch(() => []),
      getAll(COLS.products()).catch(() => []),
      getAll(COLS.deliveryNotes()).catch(() => [])
    ]);

    allCustomers = (custs || []).sort((a,b)=>(a.name||"").localeCompare(b.name||"", "ar"));
    allSalesReps = (reps || []).sort((a,b)=>(a.name||"").localeCompare(b.name||"", "ar"));
    allWarehouses = (whs || []).sort((a,b)=>(a.name||"").localeCompare(b.name||"", "ar"));
    allProducts = (prods || []).sort((a,b)=>(a.name||"").localeCompare(b.name||"", "ar"));
    allDeliveryNotes = (notes || []).sort((a,b)=>(b.date || "").localeCompare(a.date || ""));

    populateFilterDropdowns();
    renderDeliveryNotesTable(allDeliveryNotes);
    updateKPICards(allDeliveryNotes);
    setupCustomerAutocomplete();
    setupProductAutocomplete();
  } catch (err) {
    console.error("loadInitialData error:", err);
    toast("خطأ في تحميل بيانات سندات التسليم: " + err.message, "error");
  }
}

function populateFilterDropdowns() {
  const custSel = document.getElementById("dn-cust-filter");
  if (custSel) {
    custSel.innerHTML = '<option value="">كل العملاء</option>' +
      allCustomers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  }

  const repSel = document.getElementById("dn-rep-filter");
  if (repSel) {
    repSel.innerHTML = '<option value="">كل المناديب</option>' +
      allSalesReps.map(r => `<option value="${r.name}">${r.name}</option>`).join('');
  }

  const whSel = document.getElementById("dn-wh-filter");
  if (whSel) {
    whSel.innerHTML = '<option value="">كل المستودعات والسيارات</option>' +
      allWarehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
  }

  // Modal Dropdowns
  const modalWh = document.getElementById("dn-warehouse");
  if (modalWh) {
    modalWh.innerHTML = allWarehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
  }

  const modalRep = document.getElementById("dn-rep");
  if (modalRep) {
    modalRep.innerHTML = '<option value="">بدون مندوب</option>' +
      allSalesReps.map(r => `<option value="${r.name}">${r.name}</option>`).join('');
  }
}

// ── 2. Filtering and Rendering Table ──
window.filterDeliveryNotes = () => {
  const q = (document.getElementById("dn-search")?.value || "").trim().toLowerCase();
  const custId = document.getElementById("dn-cust-filter")?.value || "";
  const repName = document.getElementById("dn-rep-filter")?.value || "";
  const whId = document.getElementById("dn-wh-filter")?.value || "";
  const status = document.getElementById("dn-status-filter")?.value || "";
  const from = document.getElementById("dn-date-from")?.value || "";
  const to = document.getElementById("dn-date-to")?.value || "";

  const filtered = allDeliveryNotes.filter(dn => {
    if (q) {
      const matchNum = (dn.number || "").toLowerCase().includes(q);
      const matchCust = (dn.customerName || "").toLowerCase().includes(q);
      const matchRep = (dn.repName || "").toLowerCase().includes(q);
      const matchLines = (dn.lines || []).some(l => (l.productName || "").toLowerCase().includes(q));
      if (!matchNum && !matchCust && !matchRep && !matchLines) return false;
    }
    if (custId && dn.customerId !== custId) return false;
    if (repName && dn.repName !== repName) return false;
    if (whId && dn.warehouseId !== whId) return false;
    if (status && dn.status !== status) return false;
    if (from && (dn.date || "") < from) return false;
    if (to && (dn.date || "") > to) return false;
    return true;
  });

  renderDeliveryNotesTable(filtered);
  updateKPICards(filtered);
};

function renderDeliveryNotesTable(list) {
  const tbody = document.getElementById("dn-tbody");
  if (!tbody) return;

  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:40px; color:var(--text-2);">لا توجد سندات تسليم تطابق الفلاتر المحددة</td></tr>`;
    return;
  }

  const getStatusBadge = (st) => {
    if (st === "confirmed") return `<span style="background:rgba(16,185,129,.12);color:#10b981;padding:3px 8px;border-radius:12px;font-weight:800;font-size:11px;">🟢 تم التسليم</span>`;
    if (st === "draft") return `<span style="background:rgba(245,158,11,.12);color:#f59e0b;padding:3px 8px;border-radius:12px;font-weight:800;font-size:11px;">🟡 مسودة</span>`;
    if (st === "converted_to_invoice") return `<span style="background:rgba(59,130,246,.12);color:#3b82f6;padding:3px 8px;border-radius:12px;font-weight:800;font-size:11px;">🔵 تم التحويل لفاتورة</span>`;
    if (st === "cancelled") return `<span style="background:rgba(239,68,68,.12);color:#ef4444;padding:3px 8px;border-radius:12px;font-weight:800;font-size:11px;">🔴 ملغي</span>`;
    return `<span style="background:var(--bg-2);color:var(--text-2);padding:3px 8px;border-radius:12px;font-weight:800;font-size:11px;">${st || '—'}</span>`;
  };

  tbody.innerHTML = list.map((dn, idx) => {
    const totalQty = (dn.lines || []).reduce((sum, l) => sum + (parseFloat(l.qty) || 0), 0);
    const totalVal = parseFloat(dn.totalAmount || dn.grandTotal || dn.total || 0);
    const pm = dn.paymentMethod === "cash" ? "💵 نقدي" : "⏳ آجل";

    return `
      <tr style="border-bottom:1px solid var(--border-soft); transition:background .15s;" onmouseover="this.style.background='var(--bg-2)'" onmouseout="this.style.background=''">
        <td style="padding:10px 8px; text-align:center; color:var(--text-3); font-family:monospace;">${idx + 1}</td>
        <td style="padding:10px 10px; font-family:monospace; font-weight:800; color:#2563eb; cursor:pointer;" onclick="window.viewDeliveryNote('${dn.id}')">
          ${dn.number || '—'}
        </td>
        <td style="padding:10px 10px; text-align:center; font-family:monospace; color:var(--text-2); white-space:nowrap;">${formatDate(dn.date)}</td>
        <td style="padding:10px 12px;">
          <div style="font-weight:700; font-size:13px; color:var(--text-0);">${dn.customerName || 'عميل نقدي'}</div>
          ${dn.receiverName ? `<div style="font-size:10px; color:var(--text-3);">مستلم: ${dn.receiverName}</div>` : ''}
        </td>
        <td style="padding:10px 10px; color:var(--text-1); font-size:11.5px;">${dn.repName || '—'}</td>
        <td style="padding:10px 10px; color:var(--text-2); font-size:11.5px;">${dn.warehouseName || '—'}</td>
        <td style="padding:10px 8px; text-align:center; font-family:monospace; font-weight:700;">${formatQuantity(totalQty)}</td>
        <td style="padding:10px 12px; text-align:left; font-family:monospace; font-weight:800; color:#10b981;">${formatCurrency(totalVal)}</td>
        <td style="padding:10px 8px; text-align:center; font-size:11px; font-weight:700;">${pm}</td>
        <td style="padding:10px 10px; text-align:center;">${getStatusBadge(dn.status)}</td>
        <td style="padding:10px 12px; text-align:center;">
          <div style="display:inline-flex; gap:4px; align-items:center;">
            <button type="button" class="btn btn-sm btn-secondary" onclick="window.viewDeliveryNote('${dn.id}')" title="عرض ومعاينة وطباعة" style="padding:3px 7px;">👁️</button>
            <button type="button" class="btn btn-sm btn-secondary" onclick="window.directPrintDNA4('${dn.id}')" title="طباعة رسمية A4" style="padding:3px 7px;">🖨️</button>
            ${dn.status === 'draft' ? `
              <button type="button" class="btn btn-sm btn-secondary" onclick="window.editDeliveryNote('${dn.id}')" title="تعديل السند" style="padding:3px 7px;">✏️</button>
            ` : ''}
            ${dn.status !== 'cancelled' && dn.status !== 'converted_to_invoice' ? `
              <button type="button" class="btn btn-sm btn-danger" onclick="window.cancelDeliveryNote('${dn.id}')" title="إلغاء السند واسترجاع المخزون" style="padding:3px 7px; background:rgba(239,68,68,.1); color:#ef4444; border:1px solid rgba(239,68,68,.2);">❌</button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function updateKPICards(list) {
  const totalCount = list.length;
  let totalVal = 0;
  let totalQty = 0;
  let draftCount = 0;

  list.forEach(dn => {
    if (dn.status !== "cancelled") {
      totalVal += parseFloat(dn.totalAmount || dn.grandTotal || dn.total || 0);
      (dn.lines || []).forEach(l => {
        totalQty += parseFloat(l.qty || 0);
      });
    }
    if (dn.status === "draft") draftCount++;
  });

  document.getElementById("dn-kpi-count").textContent = totalCount;
  document.getElementById("dn-kpi-total-val").textContent = formatCurrency(totalVal);
  document.getElementById("dn-kpi-total-qty").textContent = formatQuantity(totalQty);
  document.getElementById("dn-kpi-drafts").textContent = draftCount;
}

// ── 3. Modal Open & Auto-Number Generation ──
async function generateNextDNNumber() {
  try {
    let max = 0;
    allDeliveryNotes.forEach(dn => {
      const numStr = dn.number || "";
      const match = numStr.match(/DN-(\d+)/i);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val > max) max = val;
      }
    });
    return `DN-${String(max + 1).padStart(6, "0")}`;
  } catch (e) {
    return `DN-${Date.now().toString().slice(-6)}`;
  }
}

window.openNewDeliveryNoteModal = async () => {
  currentEditingId = null;
  selectedCustomer = null;
  dnLines = [];

  const titleEl = document.getElementById("dn-modal-title");
  if (titleEl) titleEl.textContent = "📦 إنشاء سند تسليم بضاعة مبيعات جديد (DN)";
  const btnSave = document.getElementById("btn-save-dn");
  if (btnSave) btnSave.textContent = "✅ حفظ وتأكيد التسليم (خصم فوري للمخزون)";
  
  const nextNum = await generateNextDNNumber();
  const numEl = document.getElementById("dn-number");
  if (numEl) numEl.value = nextNum;
  const dateEl = document.getElementById("dn-date");
  if (dateEl) dateEl.value = todayString();
  const searchEl = document.getElementById("dn-customer-search");
  if (searchEl) searchEl.value = "";
  const custIdEl = document.getElementById("dn-customer-id");
  if (custIdEl) custIdEl.value = "";
  const balEl = document.getElementById("dn-customer-balance-box");
  if (balEl) balEl.textContent = "—";
  const recEl = document.getElementById("dn-receiver-name");
  if (recEl) recEl.value = "";
  const notesEl = document.getElementById("dn-notes");
  if (notesEl) notesEl.value = "";
  const pmEl = document.getElementById("dn-payment-method");
  if (pmEl) pmEl.value = "credit";

  renderDNLines();
  updateDNTotals();

  if (typeof window.openModal === "function") {
    window.openModal("dn-modal");
  } else {
    const modal = document.getElementById("dn-modal");
    if (modal) {
      modal.classList.add("active");
      modal.classList.remove("hidden");
    }
  }
};

window.editDeliveryNote = (id) => {
  const dn = allDeliveryNotes.find(d => d.id === id);
  if (!dn) return;
  currentEditingId = dn.id;
  selectedCustomer = allCustomers.find(c => c.id === dn.customerId) || null;
  dnLines = (dn.lines || []).map(l => ({ ...l }));

  const titleEl = document.getElementById("dn-modal-title");
  if (titleEl) titleEl.textContent = `✏️ تعديل سند تسليم رقم ${dn.number}`;
  const btnSave = document.getElementById("btn-save-dn");
  if (btnSave) btnSave.textContent = "✅ حفظ وتأكيد التسليم (خصم فوري للمخزون)";
  
  const numEl = document.getElementById("dn-number");
  if (numEl) numEl.value = dn.number || "";
  const dateEl = document.getElementById("dn-date");
  if (dateEl) dateEl.value = dn.date || todayString();
  const searchEl = document.getElementById("dn-customer-search");
  if (searchEl) searchEl.value = dn.customerName || "";
  const custIdEl = document.getElementById("dn-customer-id");
  if (custIdEl) custIdEl.value = dn.customerId || "";
  const balEl = document.getElementById("dn-customer-balance-box");
  if (balEl) balEl.textContent = formatCurrency(selectedCustomer?.balance || 0);
  const recEl = document.getElementById("dn-receiver-name");
  if (recEl) recEl.value = dn.receiverName || "";
  const notesEl = document.getElementById("dn-notes");
  if (notesEl) notesEl.value = dn.notes || "";
  const pmEl = document.getElementById("dn-payment-method");
  if (pmEl) pmEl.value = dn.paymentMethod || "credit";
  if (dn.warehouseId) {
    const whEl = document.getElementById("dn-warehouse");
    if (whEl) whEl.value = dn.warehouseId;
  }
  if (dn.repName) {
    const repEl = document.getElementById("dn-rep");
    if (repEl) repEl.value = dn.repName;
  }

  renderDNLines();
  updateDNTotals();

  if (typeof window.openModal === "function") {
    window.openModal("dn-modal");
  } else {
    const modal = document.getElementById("dn-modal");
    if (modal) {
      modal.classList.add("active");
      modal.classList.remove("hidden");
    }
  }
};

window.closeDeliveryNoteModal = () => {
  if (typeof window.closeModal === "function") {
    window.closeModal("dn-modal");
  } else {
    const modal = document.getElementById("dn-modal");
    if (modal) {
      modal.classList.remove("active");
    }
  }
};

// ── 4. Customer Autocomplete ──
function setupCustomerAutocomplete() {
  const input = document.getElementById("dn-customer-search");
  const results = document.getElementById("dn-customer-results");
  if (!input || !results) return;

  input.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      results.style.display = "none";
      return;
    }

    const matches = allCustomers.filter(c => 
      (c.name || "").toLowerCase().includes(q) || 
      (c.phone || "").includes(q) ||
      (c.code || "").toLowerCase().includes(q)
    ).slice(0, 15);

    if (matches.length === 0) {
      results.innerHTML = `<div style="padding:8px; font-size:11.5px; color:var(--text-3); text-align:center;">لا يوجد عميل مطابق</div>`;
      results.style.display = "block";
      return;
    }

    results.innerHTML = matches.map(c => `
      <div onclick="window.selectDNCustomer('${c.id}')" style="padding:6px 10px; border-radius:6px; cursor:pointer; font-size:12px; display:flex; justify-content:space-between; align-items:center; transition:background .15s;" onmouseover="this.style.background='var(--bg-2)'" onmouseout="this.style.background=''">
        <div>
          <b>${c.name}</b>
          <span style="font-size:10px; color:var(--text-3); margin-right:6px;">${c.phone || ''}</span>
        </div>
        <div style="font-size:11px; font-family:monospace; color:${(c.balance||0)>0?'#ef4444':'#10b981'};">
          رصيد: ${formatCurrency(c.balance || 0)}
        </div>
      </div>
    `).join('');
    results.style.display = "block";
  });

  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !results.contains(e.target)) {
      results.style.display = "none";
    }
  });
}

window.selectDNCustomer = (cid) => {
  const cust = allCustomers.find(c => c.id === cid);
  if (!cust) return;
  selectedCustomer = cust;

  document.getElementById("dn-customer-id").value = cust.id;
  document.getElementById("dn-customer-search").value = cust.name;
  document.getElementById("dn-customer-balance-box").textContent = formatCurrency(cust.balance || 0);
  document.getElementById("dn-customer-balance-box").style.color = (cust.balance || 0) > 0 ? "#ef4444" : "#10b981";

  if (cust.repName) {
    const repSel = document.getElementById("dn-rep");
    if (repSel) repSel.value = cust.repName;
  }

  document.getElementById("dn-customer-results").style.display = "none";
};

// ── 5. Product Autocomplete & Stock Query ──
function setupProductAutocomplete() {
  const input = document.getElementById("dn-product-search");
  const results = document.getElementById("dn-product-results");
  if (!input || !results) return;

  input.addEventListener("input", async (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      results.style.display = "none";
      return;
    }

    const matches = allProducts.filter(p => 
      (p.name || "").toLowerCase().includes(q) || 
      (p.sku || "").toLowerCase().includes(q) || 
      (p.barcode || "").includes(q)
    ).slice(0, 20);

    if (matches.length === 0) {
      results.innerHTML = `<div style="padding:10px; font-size:12px; color:var(--text-3); text-align:center;">لا يوجد صنف مطابق لـ "${q}"</div>`;
      results.style.display = "block";
      return;
    }

    const whId = document.getElementById("dn-warehouse")?.value || "";

    results.innerHTML = matches.map(p => {
      const price = parseFloat(p.price || p.salePrice || p.retailPrice || 0);
      return `
        <div onclick="window.addDNProductLine('${p.id}')" style="padding:8px 12px; border-radius:6px; cursor:pointer; font-size:12px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-soft); transition:background .15s;" onmouseover="this.style.background='rgba(37,99,235,0.08)'" onmouseout="this.style.background=''">
          <div>
            <div style="font-weight:700; color:var(--text-0);">${p.name}</div>
            <div style="font-size:10.5px; color:var(--text-3);">كود: <span class="mono">${p.sku || '—'}</span> | الوحدة: ${translateUnit(p.unit || 'كرتون')}</div>
          </div>
          <div style="text-align:left;">
            <div style="font-weight:800; color:#10b981; font-family:monospace;">${formatCurrency(price)}</div>
            <div style="font-size:10px; color:#2563eb; font-weight:700;">المخزون الكلي: ${formatQuantity(p.totalQty || 0)}</div>
          </div>
        </div>
      `;
    }).join('');
    results.style.display = "block";
  });

  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !results.contains(e.target)) {
      results.style.display = "none";
    }
  });
}

window.addDNProductLine = async (pid) => {
  const prod = allProducts.find(p => p.id === pid);
  if (!prod) return;

  const whId = document.getElementById("dn-warehouse")?.value || "";
  
  // Get live warehouse stock
  let availableStock = 0;
  try {
    const sbwSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, `${whId}_${prod.id}`));
    if (sbwSnap.exists()) {
      availableStock = parseFloat(sbwSnap.data().qty || 0);
    }
  } catch (e) {}

  const basePrice = parseFloat(prod.price || prod.salePrice || prod.retailPrice || 0);

  dnLines.push({
    productId: prod.id,
    productName: prod.name,
    sku: prod.sku || "",
    unit: prod.unit || "Carton",
    basePrice: basePrice,
    unitPrice: basePrice,
    qty: 1,
    discountPct: 0,
    availableStock: availableStock,
    batchNumber: "",
    expiryDate: ""
  });

  document.getElementById("dn-product-search").value = "";
  document.getElementById("dn-product-results").style.display = "none";

  renderDNLines();
  updateDNTotals();
};

window.onDNWarehouseChanged = async () => {
  const whId = document.getElementById("dn-warehouse")?.value || "";
  if (!whId || dnLines.length === 0) return;

  // Refresh stock for all current lines
  for (const l of dnLines) {
    try {
      const sbwSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, `${whId}_${l.productId}`));
      l.availableStock = sbwSnap.exists() ? parseFloat(sbwSnap.data().qty || 0) : 0;
    } catch(e) {}
  }
  renderDNLines();
};

function renderDNLines() {
  const tbody = document.getElementById("dn-lines-tbody");
  if (!tbody) return;

  if (dnLines.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:25px; color:var(--text-3);">لم تتم إضافة أي أصناف بعد. ابحث عن صنف من الحقل أعلاه لإضافته للسند.</td></tr>`;
    return;
  }

  tbody.innerHTML = dnLines.map((l, idx) => {
    const lineTotal = (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0) * (1 - (parseFloat(l.discountPct) || 0) / 100);
    const isLow = l.availableStock < l.qty;

    return `
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:6px; text-align:center; color:var(--text-3); font-family:monospace;">${idx + 1}</td>
        <td style="padding:6px 10px;">
          <div style="font-weight:700; font-size:12.5px;">${l.productName}</div>
          <div style="font-size:10px; color:var(--text-3);">كود: <span class="mono">${l.sku || '—'}</span></div>
        </td>
        <td style="padding:6px; text-align:center; font-size:11px; font-weight:700;">
          ${translateUnit(l.unit)}
        </td>
        <td style="padding:6px;">
          <input type="text" class="input" placeholder="رقم التشغيلة..." value="${l.batchNumber || ''}" onchange="window.updateDNLine(${idx}, 'batchNumber', this.value)" style="height:28px; font-size:11px; text-align:center; width:100%; margin-bottom:2px;" />
          <input type="date" class="input mono" value="${l.expiryDate || ''}" onchange="window.updateDNLine(${idx}, 'expiryDate', this.value)" style="height:26px; font-size:10.5px; width:100%;" />
        </td>
        <td style="padding:6px; text-align:center;">
          <span style="display:inline-block; padding:2px 6px; border-radius:4px; font-size:11px; font-family:monospace; font-weight:800; background:${isLow ? 'rgba(239,68,68,.12)' : 'rgba(16,185,129,.12)'}; color:${isLow ? '#ef4444' : '#10b981'};">
            ${formatQuantity(l.availableStock)}
          </span>
        </td>
        <td style="padding:6px;">
          <input type="number" step="any" min="1" class="input mono font-bold" value="${l.qty}" oninput="window.updateDNLine(${idx}, 'qty', this.value)" style="height:30px; font-size:12px; text-align:center; width:100%;" />
        </td>
        <td style="padding:6px;">
          <input type="number" step="0.01" min="0" class="input mono font-bold" value="${l.unitPrice}" oninput="window.updateDNLine(${idx}, 'unitPrice', this.value)" style="height:30px; font-size:12px; text-align:center; width:100%;" />
        </td>
        <td style="padding:6px;">
          <input type="number" step="0.5" min="0" max="100" class="input mono" value="${l.discountPct}" oninput="window.updateDNLine(${idx}, 'discountPct', this.value)" style="height:30px; font-size:11.5px; text-align:center; width:100%;" />
        </td>
        <td style="padding:6px 10px; text-align:left; font-family:monospace; font-weight:800; color:#2563eb; font-size:12.5px;">
          ${formatCurrency(lineTotal)}
        </td>
        <td style="padding:6px; text-align:center;">
          <button type="button" onclick="window.removeDNLine(${idx})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:16px;">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

window.updateDNLine = (idx, field, val) => {
  if (!dnLines[idx]) return;
  if (field === 'qty' || field === 'unitPrice' || field === 'discountPct') {
    dnLines[idx][field] = parseFloat(val) || 0;
  } else {
    dnLines[idx][field] = val;
  }
  updateDNTotals();
};

window.removeDNLine = (idx) => {
  dnLines.splice(idx, 1);
  renderDNLines();
  updateDNTotals();
};

function updateDNTotals() {
  let subtotal = 0;
  let totalDiscount = 0;

  dnLines.forEach(l => {
    const gross = (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0);
    const disc = gross * ((parseFloat(l.discountPct) || 0) / 100);
    subtotal += gross;
    totalDiscount += disc;
  });

  const grandTotal = Math.max(0, subtotal - totalDiscount);

  document.getElementById("dn-subtotal").textContent = formatCurrency(subtotal);
  document.getElementById("dn-discount").textContent = `-${formatCurrency(totalDiscount)}`;
  document.getElementById("dn-grand-total").textContent = formatCurrency(grandTotal);
  document.getElementById("dn-tafqeet").textContent = tafqeetArabic(grandTotal);
}

// ── 6. Saving Delivery Note (Confirmed vs Draft) ──
window.saveDeliveryNote = async (status = "confirmed") => {
  try {
    const dnNum = document.getElementById("dn-number")?.value.trim();
    const date = document.getElementById("dn-date")?.value;
    const custId = document.getElementById("dn-customer-id")?.value;
    const custName = document.getElementById("dn-customer-search")?.value.trim();
    const whId = document.getElementById("dn-warehouse")?.value;
    const repName = document.getElementById("dn-rep")?.value;
    const paymentMethod = document.getElementById("dn-payment-method")?.value || "credit";
    const receiverName = document.getElementById("dn-receiver-name")?.value.trim();
    const notes = document.getElementById("dn-notes")?.value.trim();

    if (!dnNum) throw new Error("رقم سند التسليم مطلوب");
    if (!date) throw new Error("تاريخ التسليم مطلوب");
    if (!custId || !custName) throw new Error("يرجى اختيار العميل المستلم");
    if (!whId) throw new Error("يرجى تحديد المستودع أو سيارة المندوب");
    if (dnLines.length === 0) throw new Error("يجب إضافة صنف واحد على الأقل في سند التسليم");

    const whObj = allWarehouses.find(w => w.id === whId);
    const whName = whObj ? whObj.name : whId;

    let subtotal = 0;
    let totalDiscount = 0;
    let totalCost = 0;
    const cleanLines = dnLines.map(l => {
      const q = parseFloat(l.qty) || 1;
      const p = parseFloat(l.unitPrice) || 0;
      const d = parseFloat(l.discountPct) || 0;
      const gross = q * p;
      const disc = gross * (d / 100);
      const net = gross - disc;
      subtotal += gross;
      totalDiscount += disc;

      const prod = (allProducts || []).find(x => x.id === l.productId);
      const cost = parseFloat(l.costPrice || prod?.avgCostPrice || prod?.lastPurchasePrice || prod?.costPrice || prod?.purchasePrice || 0);
      totalCost += (q * cost);

      return {
        productId: l.productId,
        productName: l.productName,
        sku: l.sku || "",
        unit: l.unit || "Carton",
        qty: q,
        unitPrice: p,
        costPrice: cost,
        discountPct: d,
        lineTotal: net,
        batchNumber: l.batchNumber || "",
        expiryDate: l.expiryDate || ""
      };
    });

    const grandTotal = Math.round((subtotal - totalDiscount) * 100) / 100;

    const docData = {
      number: dnNum,
      dnNumber: dnNum,
      date: date,
      customerId: custId,
      customerName: custName,
      warehouseId: whId,
      warehouseName: whName,
      repName: repName || "بدون مندوب",
      paymentMethod: paymentMethod,
      receiverName: receiverName || "",
      notes: notes || "",
      lines: cleanLines,
      subtotal: subtotal,
      totalDiscount: totalDiscount,
      taxAmount: 0,
      vatAmount: 0,
      grandTotal: grandTotal,
      totalAmount: grandTotal,
      totalCost: Math.round(totalCost * 100) / 100,
      status: status, // "confirmed" or "draft"
      isNonVat: true,
      docType: "delivery_note",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    let dnId = currentEditingId;
    if (!dnId) {
      const createdDoc = await create("deliveryNotes", docData);
      dnId = createdDoc.id;
    } else {
      await update("deliveryNotes", dnId, docData);
    }

    // If CONFIRMED -> Execute immediate inventory deduction & Balance Sync
    if (status === "confirmed") {
      const adjustments = cleanLines.map(l => ({
        warehouseId: whId,
        productId: l.productId,
        qtyDelta: -parseFloat(l.qty),
        metadata: {
          type: "delivery_note",
          docNum: dnNum,
          documentNumber: dnNum,
          sourceId: dnId,
          refType: "delivery_note",
          partyName: custName,
          date: date,
          batchNumber: l.batchNumber || "",
          expiryDate: l.expiryDate || "",
          notes: `سند تسليم بضاعة رقم ${dnNum} للعميل: ${custName} (${whName})`
        }
      }));

      try {
        await adjustStockBulk(adjustments);
      } catch (stockErr) {
        console.error("Stock deduction error:", stockErr);
        toast("تم حفظ السند ولكن حدث تنبيه في المخزون: " + stockErr.message, "warn");
      }

      // Sync customer balance
      if (custId) {
        import("../utils/balance-sync.js").then(m => m.recalculateCustomerBalance(custId)).catch(console.warn);
      }

      // Automated Accounting JE
      try {
        const { autoDeliveryNoteJE } = await import("../utils/accounting-engine.js");
        await autoDeliveryNoteJE({ id: dnId, ...docData, number: dnNum }, user, allWarehouses);
      } catch (jeErr) {
        console.warn("[DeliveryNote] Accounting JE warning:", jeErr);
      }
    }

    toast(status === "confirmed" ? `✅ تم إصدار سند التسليم رقم ${dnNum} وخصم المخزون بنجاح` : `📝 تم حفظ سند التسليم كمسودة`, "success");
    window.closeDeliveryNoteModal();
    await loadInitialData();
  } catch (err) {
    console.error("saveDeliveryNote error:", err);
    toast("خطأ: " + err.message, "error");
  }
};

// ── 7. View & Print Delivery Note ──
let currentViewingDN = null;

window.viewDeliveryNote = (id) => {
  const dn = allDeliveryNotes.find(d => d.id === id);
  if (!dn) return;
  currentViewingDN = dn;

  const co = getCompanyInfo();
  const modal = document.getElementById("dn-view-modal");
  const content = document.getElementById("dn-view-content");
  if (!modal || !content) return;

  const totalQty = (dn.lines || []).reduce((s, l) => s + (parseFloat(l.qty) || 0), 0);
  const totalVal = parseFloat(dn.totalAmount || dn.grandTotal || dn.total || 0);

  content.innerHTML = `
    <div style="max-width:820px; margin:0 auto; font-family:'Cairo',sans-serif;">
      
      <!-- High-End Header -->
      <div style="display:grid; grid-template-columns:1fr auto 1fr; gap:16px; align-items:center; border-bottom:2.5px solid #1e3a8a; padding-bottom:14px; margin-bottom:16px;">
        <div>
          <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e3a8a;">${co.name}</h2>
          <div style="font-size:11px; color:#64748b; margin-top:2px;">${co.nameEn || 'Foodstuff Trading & Distribution'}</div>
          <div style="font-size:11px; color:#334155; margin-top:4px;">
            السجل التجاري: <b>${co.crNumber || '—'}</b> • هاتف: ${co.phone || '—'}
          </div>
          <div style="font-size:11px; color:#334155;">العنوان: ${co.address || 'المملكة العربية السعودية'}</div>
        </div>

        <div style="text-align:center;">
          <div style="display:inline-block; border:2px solid #1e3a8a; border-radius:10px; padding:6px 18px; background:#eff6ff;">
            <h1 style="margin:0; font-size:16px; font-weight:900; color:#1e3a8a;">سند تسليم بضاعة مبيعات</h1>
            <div style="font-size:10.5px; font-weight:800; color:#2563eb; letter-spacing:1px; margin-top:1px;">DELIVERY NOTE (NON-VAT)</div>
          </div>
          <div style="font-size:10px; color:#64748b; margin-top:4px; font-weight:700;">مستند تسليم وإثبات استلام تجاري</div>
        </div>

        <div style="text-align:left;">
          <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:8px 12px; font-size:11px; display:inline-block; text-align:right;">
            <div>رقم السند: <b class="mono" style="color:#1e3a8a; font-size:13px;">${dn.number}</b></div>
            <div style="margin-top:2px;">التاريخ: <b class="mono">${formatDate(dn.date)}</b></div>
            <div style="margin-top:2px;">طريقة الدفع: <b>${dn.paymentMethod === 'cash' ? 'نقدي' : 'آجل (على الحساب)'}</b></div>
            <div style="margin-top:2px;">الحالة: <b style="color:${dn.status==='confirmed'?'#16a34a':'#f59e0b'};">${dn.status==='confirmed'?'مؤكد ومسلم':'مسودة'}</b></div>
          </div>
        </div>
      </div>

      <!-- Customer & Route Meta Box -->
      <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:12px; margin-bottom:16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px 16px; font-size:11.5px;">
        <div>
          <div>العميل المستلم: <b style="font-size:13px; color:#0f172a;">${dn.customerName}</b></div>
          <div style="margin-top:4px; color:#475569;">المستودع / السيارة المسلِّمة: <b>${dn.warehouseName || '—'}</b></div>
          ${dn.receiverName ? `<div style="margin-top:4px; color:#475569;">الشخص المستلم: <b>${dn.receiverName}</b></div>` : ''}
        </div>
        <div>
          <div>المندوب المسؤول: <b>${dn.repName || '—'}</b></div>
          <div style="margin-top:4px; color:#475569;">تاريخ الطباعة: <b class="mono">${new Date().toLocaleDateString('ar-SA')}</b></div>
          ${dn.convertedInvoiceNumber ? `<div style="margin-top:4px; color:#2563eb; font-weight:700;">مرتبط بفاتورة ضريبية: ${dn.convertedInvoiceNumber}</div>` : ''}
        </div>
      </div>

      <!-- Items Table -->
      <table style="width:100%; border-collapse:collapse; font-size:11.5px; margin-bottom:14px;">
        <thead>
          <tr style="background:#f1f5f9; border-bottom:2px solid #cbd5e1;">
            <th style="border:1px solid #cbd5e1; padding:6px 4px; width:30px; text-align:center;">#</th>
            <th style="border:1px solid #cbd5e1; padding:6px 8px; text-align:right;">بيان الصنف والمواصفات</th>
            <th style="border:1px solid #cbd5e1; padding:6px 6px; width:80px; text-align:center;">الكود</th>
            <th style="border:1px solid #cbd5e1; padding:6px 6px; width:70px; text-align:center;">الوحدة</th>
            <th style="border:1px solid #cbd5e1; padding:6px 6px; width:110px; text-align:center;">التشغيلة / الصلاحية</th>
            <th style="border:1px solid #cbd5e1; padding:6px 6px; width:70px; text-align:center;">الكمية</th>
            <th style="border:1px solid #cbd5e1; padding:6px 8px; width:85px; text-align:center;">السعر</th>
            <th style="border:1px solid #cbd5e1; padding:6px 8px; width:95px; text-align:left;">الإجمالي (ر.س)</th>
          </tr>
        </thead>
        <tbody>
          ${(dn.lines || []).map((l, i) => `
            <tr>
              <td style="border:1px solid #e2e8f0; padding:5px; text-align:center; color:#64748b; font-family:monospace;">${i + 1}</td>
              <td style="border:1px solid #e2e8f0; padding:5px 8px; font-weight:700;">${l.productName}</td>
              <td style="border:1px solid #e2e8f0; padding:5px; text-align:center; font-family:monospace; color:#475569;">${l.sku || '—'}</td>
              <td style="border:1px solid #e2e8f0; padding:5px; text-align:center;">${translateUnit(l.unit)}</td>
              <td style="border:1px solid #e2e8f0; padding:5px; text-align:center; font-size:10px; font-family:monospace; color:#475569;">
                ${l.batchNumber ? `تشغيلة: ${l.batchNumber}` : ''} ${l.expiryDate ? `<br>انتهاء: ${l.expiryDate}` : '—'}
              </td>
              <td style="border:1px solid #e2e8f0; padding:5px; text-align:center; font-weight:900; font-family:monospace; font-size:12px;">${formatQuantity(l.qty)}</td>
              <td style="border:1px solid #e2e8f0; padding:5px 8px; text-align:center; font-family:monospace;">${parseFloat(l.unitPrice || 0).toFixed(2)}</td>
              <td style="border:1px solid #e2e8f0; padding:5px 8px; text-align:left; font-family:monospace; font-weight:800;">${parseFloat(l.lineTotal || (l.qty * l.unitPrice) || 0).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="background:#f8fafc; font-weight:900;">
            <td colspan="5" style="border:1px solid #cbd5e1; padding:6px 8px; text-align:right;">الإجمالي العام (${(dn.lines || []).length} أصناف)</td>
            <td style="border:1px solid #cbd5e1; padding:6px; text-align:center; font-family:monospace; color:#2563eb; font-size:12.5px;">${formatQuantity(totalQty)}</td>
            <td style="border:1px solid #cbd5e1; padding:6px 8px; text-align:center;">—</td>
            <td style="border:1px solid #cbd5e1; padding:6px 8px; text-align:left; font-family:monospace; color:#15803d; font-size:13px;">${formatCurrency(totalVal)}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Amount in Words & Notes -->
      <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:12px; margin-bottom:16px;">
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 12px; font-size:11px;">
          <div style="font-weight:700; color:#334155; margin-bottom:2px;">المبلغ بالحروف:</div>
          <div style="font-weight:800; color:#1e3a8a;">${tafqeetArabic(totalVal)}</div>
          ${dn.notes ? `<div style="margin-top:6px; color:#475569;">ملاحظات: ${dn.notes}</div>` : ''}
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 12px; font-size:10px; color:#475569; line-height:1.4;">
          <b>📌 إقرار وتعهد الاستلام:</b>
          أقر أنا الموقع أدناه بأنني قد استلمت البضاعة الموضحة أعلاه كاملة وبحالة سليمة ومطابقة للمواصفات المطلوبة، وأتعهد بالالتزام بالقيمة المسجلة.
        </div>
      </div>

      <!-- Triple Signatures Area -->
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; text-align:center; font-size:11px; margin-top:20px; border-top:1px solid #cbd5e1; padding-top:12px;">
        <div style="border:1px dashed #cbd5e1; border-radius:8px; padding:10px;">
          <b>توقيع واستلام العميل (المستلم)</b>
          <div style="height:35px;"></div>
          <div style="border-top:1px solid #94a3b8; font-size:10px; color:#64748b; padding-top:3px;">الاسم والتوقيع والختم</div>
        </div>

        <div style="border:1px dashed #cbd5e1; border-radius:8px; padding:10px;">
          <b>مندوب المبيعات / السائق</b>
          <div style="height:35px;"></div>
          <div style="border-top:1px solid #94a3b8; font-size:10px; color:#64748b; padding-top:3px;">توقيع مندوب التوصيل</div>
        </div>

        <div style="border:1px dashed #cbd5e1; border-radius:8px; padding:10px;">
          <b>أمين المستودع / الاعتماد</b>
          <div style="height:35px;"></div>
          <div style="border-top:1px solid #94a3b8; font-size:10px; color:#64748b; padding-top:3px;">إذن صرف المستودع الرسمي</div>
        </div>
      </div>

    </div>
  `;

  if (typeof window.openModal === "function") {
    window.openModal("dn-view-modal");
  } else {
    modal.classList.add("active");
    modal.classList.remove("hidden");
  }
};

window.closeViewDNModal = () => {
  if (typeof window.closeModal === "function") {
    window.closeModal("dn-view-modal");
  } else {
    const modal = document.getElementById("dn-view-modal");
    if (modal) {
      modal.classList.remove("active");
    }
  }
};

window.directPrintDNA4 = (id) => {
  window.viewDeliveryNote(id);
  setTimeout(() => {
    window.printDNA4();
  }, 200);
};

window.printDNA4 = () => {
  const content = document.getElementById("dn-view-content");
  if (!content) return;

  const win = window.open("", "_blank", "width=900,height=800");
  if (!win) {
    alert("يرجى السماح بالنوافذ المنبثقة للطباعة");
    return;
  }

  win.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>سند تسليم بضاعة — ${currentViewingDN?.number || ''}</title>
      <style>
        @page { size: A4 portrait; margin: 10mm 12mm; }
        * { box-sizing: border-box; }
        body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; background:#fff; color:#0f172a; margin:0; padding:10px; font-size:11px; }
        .mono { font-family: monospace; }
        table { width:100%; border-collapse:collapse; }
      </style>
    </head>
    <body onload="window.print();">
      ${content.innerHTML}
    </body>
    </html>
  `);
  win.document.close();
};

window.printDNThermal = () => {
  if (!currentViewingDN) return;
  const dn = currentViewingDN;
  const co = getCompanyInfo();

  const totalQty = (dn.lines || []).reduce((s, l) => s + (parseFloat(l.qty) || 0), 0);
  const totalVal = parseFloat(dn.totalAmount || dn.grandTotal || dn.total || 0);

  const win = window.open("", "_blank", "width=400,height=700");
  if (!win) {
    alert("يرجى السماح بالنوافذ المنبثقة للطباعة");
    return;
  }

  win.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>إيصال تسليم ${dn.number}</title>
      <style>
        @page { size: 80mm auto; margin: 2mm; }
        body { font-family: 'Cairo', Tahoma, sans-serif; width: 76mm; margin: 0 auto; padding: 4px; font-size: 11px; line-height: 1.25; color: #000; }
        .text-center { text-align: center; }
        .bold { font-weight: bold; }
        .mono { font-family: monospace; }
        .hr { border-top: 1px dashed #000; margin: 6px 0; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; }
        th, td { padding: 3px 2px; }
      </style>
    </head>
    <body onload="window.print();">
      <div class="text-center">
        <div class="bold" style="font-size:14px;">${co.name}</div>
        <div style="font-size:9.5px;">سند تسليم بضاعة مبيعات</div>
        <div class="bold mono" style="font-size:12px; margin:3px 0;">${dn.number}</div>
        <div class="mono" style="font-size:10px;">${formatDate(dn.date)}</div>
      </div>
      <div class="hr"></div>
      <div>العميل: <b>${dn.customerName}</b></div>
      <div>المندوب: ${dn.repName || '—'}</div>
      <div>المستودع: ${dn.warehouseName || '—'}</div>
      <div>الدفع: <b>${dn.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}</b></div>
      <div class="hr"></div>
      <table>
        <thead>
          <tr style="border-bottom:1px solid #000;">
            <th style="text-align:right;">الصنف</th>
            <th style="text-align:center; width:30px;">الكمية</th>
            <th style="text-align:center; width:35px;">السعر</th>
            <th style="text-align:left; width:45px;">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${(dn.lines || []).map(l => `
            <tr>
              <td>${l.productName}</td>
              <td class="mono" style="text-align:center; font-weight:bold;">${l.qty}</td>
              <td class="mono" style="text-align:center;">${parseFloat(l.unitPrice).toFixed(2)}</td>
              <td class="mono" style="text-align:left; font-weight:bold;">${parseFloat(l.lineTotal || (l.qty*l.unitPrice)).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="hr"></div>
      <div style="display:flex; justify-content:space-between; font-size:11px;">
        <span>إجمالي الكمية:</span>
        <span class="mono bold">${totalQty}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:bold; margin-top:3px;">
        <span>الصافي المطلوب:</span>
        <span class="mono">${formatCurrency(totalVal)}</span>
      </div>
      <div class="hr"></div>
      <div class="text-center" style="font-size:9.5px;">
        استلمت البضاعة كاملة وبحالة جيدة
        <br><br>
        توقيع المستلم: ___________________
      </div>
    </body>
    </html>
  `);
  win.document.close();
};

// ── 8. Cancel Delivery Note ──
window.cancelDeliveryNote = async (id) => {
  const dn = allDeliveryNotes.find(d => d.id === id);
  if (!dn) return;

  if (!confirm(`هل أنت متأكد من إلغاء سند التسليم رقم "${dn.number}"؟\nسيتم استرجاع كميات البضاعة إلى المستودع وإلغاء المديونية.`)) return;

  try {
    // If was confirmed, reverse stock
    if (dn.status === "confirmed") {
      const reversals = (dn.lines || []).map(l => ({
        warehouseId: dn.warehouseId,
        productId: l.productId,
        qtyDelta: parseFloat(l.qty || 0),
        metadata: {
          type: "delivery_cancel",
          docNum: dn.number,
          documentNumber: dn.number,
          sourceId: dn.id,
          refType: "delivery_cancel",
          partyName: dn.customerName,
          date: todayString(),
          notes: `إلغاء سند تسليم بضاعة رقم ${dn.number}`
        }
      }));

      await adjustStockBulk(reversals);

      if (dn.customerId) {
        import("../utils/balance-sync.js").then(m => m.recalculateCustomerBalance(dn.customerId)).catch(console.warn);
      }

      // Cancel related journal entries
      try {
        const jeSnap = await getDocs(query(collection(db, `companies/${COMPANY_ID}/journalEntries`), where("sourceId", "==", id)));
        for (const jeDoc of jeSnap.docs) {
          await update("journalEntries", jeDoc.id, { status: "cancelled", cancelledAt: serverTimestamp() });
        }
      } catch (jeErr) {
        console.warn("[DeliveryNote] Error cancelling related JEs:", jeErr);
      }
    }

    await update("deliveryNotes", id, {
      status: "cancelled",
      cancelledAt: serverTimestamp()
    });

    toast(`تم إلغاء سند التسليم رقم ${dn.number} واسترجاع المخزون بنجاح`, "success");
    await loadInitialData();
  } catch (err) {
    console.error("cancelDeliveryNote error:", err);
    toast("خطأ في إلغاء السند: " + err.message, "error");
  }
};

// ── 9. Convert Delivery Note to Official Tax Sales Invoice ──
window.convertDNToSalesInvoice = async () => {
  if (!currentViewingDN) return;
  const dn = currentViewingDN;

  if (dn.status === "converted_to_invoice") {
    toast(`هذا السند تم تحويله مسبقاً إلى فاتورة ضريبية رقم ${dn.convertedInvoiceNumber || ''}`, "warn");
    return;
  }

  if (!confirm(`هل ترغب في تحويل سند التسليم "${dn.number}" إلى فاتورة ضريبية رسمية (INV)؟`)) return;

  try {
    // Prepare quote-like object for sales invoice converter
    const convertData = {
      customerId: dn.customerId,
      customerName: dn.customerName,
      warehouseId: dn.warehouseId,
      repName: dn.repName,
      paymentMethod: dn.paymentMethod || "credit",
      notes: `تحويل من سند تسليم بضاعة رقم ${dn.number}`,
      deliveryNoteId: dn.id,
      deliveryNoteNumber: dn.number,
      items: (dn.lines || []).map(l => ({
        productId: l.productId,
        productName: l.productName,
        sku: l.sku,
        unit: l.unit,
        qty: l.qty,
        unitPrice: l.unitPrice,
        discountPct: l.discountPct || 0,
        batchNumber: l.batchNumber || "",
        expiryDate: l.expiryDate || ""
      }))
    };

    sessionStorage.setItem("convert_quote", JSON.stringify(convertData));

    // Update status to converted_to_invoice
    await update("deliveryNotes", dn.id, {
      status: "converted_to_invoice",
      convertedAt: serverTimestamp()
    });

    window.closeViewDNModal();

    if (window.navigate) {
      window.navigate("sales-invoices");
    } else {
      location.hash = "#sales-invoices";
    }
  } catch (err) {
    console.error("convertDNToSalesInvoice error:", err);
    toast("خطأ في تحويل السند إلى فاتورة: " + err.message, "error");
  }
};

// ── 10. Export to Excel ──
window.exportDeliveryNotesExcel = async () => {
  if (!allDeliveryNotes || allDeliveryNotes.length === 0) {
    toast("لا توجد بيانات لتصديرها", "warn");
    return;
  }

  const title = `سجل سندات تسليم البضاعة (أذون تسليم المبيعات) — ${todayString()}`;
  const headers = ["#", "رقم السند", "التاريخ", "العميل", "المندوب", "المستودع / السيارة", "طريقة الدفع", "عدد الأصناف", "إجمالي الكمية", "إجمالي القيمة (ر.س)", "الحالة", "ملاحظات"];
  const colWidths = [6, 16, 14, 28, 18, 20, 14, 12, 14, 18, 16, 25];

  const rows = allDeliveryNotes.map((dn, idx) => {
    const totalQty = (dn.lines || []).reduce((s, l) => s + (parseFloat(l.qty) || 0), 0);
    const totalVal = parseFloat(dn.totalAmount || dn.grandTotal || dn.total || 0);
    const stLabel = dn.status === "confirmed" ? "تم التسليم" : dn.status === "draft" ? "مسودة" : dn.status === "converted_to_invoice" ? "تم التحويل لفاتورة" : "ملغي";

    return [
      idx + 1,
      dn.number || '—',
      dn.date || '—',
      dn.customerName || '—',
      dn.repName || '—',
      dn.warehouseName || '—',
      dn.paymentMethod === 'cash' ? 'نقدي' : 'آجل',
      (dn.lines || []).length,
      totalQty,
      Math.round(totalVal * 100) / 100,
      stLabel,
      dn.notes || ''
    ];
  });

  try {
    await exportToExcel({
      title,
      headers,
      rows,
      colWidths
    });
    toast("تم تصدير ملف Excel بنجاح", "success");
  } catch (err) {
    console.error("Excel export error:", err);
    toast("خطأ في تصدير Excel: " + err.message, "error");
  }
};
