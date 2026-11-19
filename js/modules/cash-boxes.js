// ============================================================
// IDHAM ERP — Cash Boxes Module (الصناديق النقدية والعهد)
// ============================================================
import { COLS, create, update, remove, getAll, createJournalEntry, clearERPCache } from "../utils/db.js";
import { query, orderBy, limit, getDocs, where, doc, getDoc, runTransaction, serverTimestamp, collection } from "../utils/db.js";
import { syncEntityToCoa, deleteEntityInCoa } from "../utils/coa-connector.js";
import { formatCurrency, formatDate, todayString, tafqeetArabic } from "../utils/formatters.js";
import { db, COMPANY_ID } from "../firebase-config.js";
import { exportToExcel } from "../utils/excel.js";

let cashBoxes = [];
let _allCashTxns = [];
let _selectedBoxFilter = "";
let _activeStatementBox = null;
let _activeStatementRows = [];
let _activeStatementRawItems = [];
let _activeStatementSort = "asc"; // "asc" (oldest to newest) or "desc"
let _activeStatementFilterFrom = "";
let _activeStatementFilterTo = "";
let _activeStatementType = "";
let _activeStatementSearch = "";
let _activeStatementOpeningBal = 0;
let _activeStatementClosingBal = 0;

function _getCashBoxTheme(cb) {
  const name = (cb.name || "").toLowerCase();
  const type = cb.type || "";
  const code = cb.accountCode || "";

  if (type === "main" || name.includes("الرئيسي")) {
    return {
      gradient: "linear-gradient(135deg, #059669 0%, #064e3b 100%)",
      border: "1.5px solid #10b981",
      shadow: "0 10px 25px -5px rgba(5,150,105,0.4)",
      icon: "🏛️",
      badgeText: "خزينة رئيسية",
      accentBg: "rgba(255,255,255,0.2)"
    };
  } else if (type === "owner_current" || code === "3-1-4" || name.includes("مالك")) {
    return {
      gradient: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
      border: "1.5px solid #8b5cf6",
      shadow: "0 10px 25px -5px rgba(109,40,217,0.4)",
      icon: "👑",
      badgeText: "👤 جاري المالك",
      accentBg: "rgba(255,255,255,0.2)"
    };
  } else if (name.includes("مصطفى")) {
    return {
      gradient: "linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)",
      border: "1.5px solid #3b82f6",
      shadow: "0 10px 25px -5px rgba(29,78,216,0.4)",
      icon: "🚚",
      badgeText: "عهدة مندوب",
      accentBg: "rgba(255,255,255,0.2)"
    };
  } else if (name.includes("عوض")) {
    return {
      gradient: "linear-gradient(135deg, #0d9488 0%, #115e59 100%)",
      border: "1.5px solid #14b8a6",
      shadow: "0 10px 25px -5px rgba(13,148,136,0.4)",
      icon: "📦",
      badgeText: "عهدة مندوب",
      accentBg: "rgba(255,255,255,0.2)"
    };
  } else if (name.includes("خالد")) {
    return {
      gradient: "linear-gradient(135deg, #ea580c 0%, #9a3412 100%)",
      border: "1.5px solid #f97316",
      shadow: "0 10px 25px -5px rgba(234,88,12,0.4)",
      icon: "🚛",
      badgeText: "عهدة مندوب",
      accentBg: "rgba(255,255,255,0.2)"
    };
  } else {
    return {
      gradient: "linear-gradient(135deg, #334155 0%, #0f172a 100%)",
      border: "1.5px solid #64748b",
      shadow: "0 10px 25px -5px rgba(51,65,85,0.4)",
      icon: "💼",
      badgeText: cb.type === "petty" ? "نثريات" : "صندوق فرعي",
      accentBg: "rgba(255,255,255,0.2)"
    };
  }
}

export async function render(container, user) {
  container.innerHTML = `
    <!-- Top Actions Header -->
    <div class="filterbar" style="flex-wrap:wrap;gap:10px;align-items:center;background:var(--bg-1);padding:14px 18px;border-radius:14px;border:1px solid var(--border-soft);margin-bottom:20px;">
      <div style="margin-right:auto;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="refreshCashBoxesLive()" title="تحديث الأرصدة من قاعدة البيانات">🔄 تحديث الأرصدة</button>
        <button class="btn btn-secondary btn-sm" onclick="exportPagePDF('.data-dense','الصناديق_والعهد')" title="تصدير PDF">📄 PDF</button>
        <button class="btn btn-secondary btn-sm" onclick="exportPageExcel('.data-dense','الصناديق_والعهد')" title="تصدير Excel">📊 Excel</button>
        <button class="btn btn-secondary btn-sm" onclick="window.print()" title="طباعة">🖨️ طباعة</button>
        <button class="btn btn-primary btn-sm" onclick="openQuickTransferModal('')" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%);border:none;box-shadow:0 2px 6px rgba(2,132,199,0.3);font-weight:800;">⚡ تحويل نقدية بين الصناديق</button>
        <button class="btn btn-secondary btn-sm" onclick="openCashTxnModal()">+ إيداع / سحب مباشر</button>
        <button class="btn btn-success btn-sm" onclick="openCashBoxModal()">+ صندوق / عهدة جديدة</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header" style="margin-bottom:16px;">
        <h1 class="page-title" style="font-size:22px;font-weight:900;">💵 إدارة الصناديق النقدية والعهَد والتمويل الشخصي</h1>
        <p class="page-subtitle" style="color:var(--text-3);font-size:13px;">إدارة عهد المناديـب، الخزائن الرئيسية والفرعية، وحسابات جاري المالك مع كشوفات الحركات النقدية والتحويل المزدوج الفوري</p>
      </div>

      <!-- Luxury Color Cards Grid -->
      <div class="grid-3 gap-16 mb-24" id="cb-grid">
        <div class="page-loading"><div class="loading-spinner"></div></div>
      </div>

      <!-- Filter Bar for Transactions -->
      <div class="card" style="margin-bottom:24px;">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border-soft);">
          <div>
            <h3 style="font-size:16px;font-weight:800;margin:0;" id="cb-txn-table-title">📑 سجل ودعم كشف حركات الصناديق والعهد</h3>
            <p style="font-size:12px;color:var(--text-3);margin:2px 0 0 0;" id="cb-txn-table-subtitle">انقر على أي كارت صندوق بالأعلى للتصفية المباشرة عليه أو استعراض كشف الحساب الشامل</p>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-reset-box-filter" onclick="filterCashBoxTxnsByCard('')" style="display:none;">✕ عرض كافة الصناديق</button>
        </div>

        <div style="padding:14px 20px;background:var(--bg-2);border-bottom:1px solid var(--border-soft);display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <div style="flex:1;min-width:180px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">تصفية بالصندوق</label>
            <select id="filter-cb-box" class="input" onchange="applyCashTxnFilters()" style="font-size:12.5px;">
              <option value="">جميع الصناديق والعهد</option>
            </select>
          </div>
          <div style="width:140px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">من تاريخ</label>
            <input type="date" id="filter-cb-from" class="input" onchange="applyCashTxnFilters()" style="font-size:12px;" />
          </div>
          <div style="width:140px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">إلى تاريخ</label>
            <input type="date" id="filter-cb-to" class="input" onchange="applyCashTxnFilters()" style="font-size:12px;" />
          </div>
          <div style="width:140px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">نوع الحركة</label>
            <select id="filter-cb-type" class="input" onchange="applyCashTxnFilters()" style="font-size:12.5px;">
              <option value="">كل الحركات</option>
              <option value="in">إيداعات / مقبوضات (+)</option>
              <option value="out">سحوبات / مصروفات (-)</option>
            </select>
          </div>
          <div style="flex:1;min-width:200px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">🔍 بحث بالبيان / المرجع</label>
            <input type="text" id="filter-cb-search" class="input" placeholder="اكتب بياناً أو مرجعاً للبحث..." oninput="applyCashTxnFilters()" style="font-size:12.5px;" />
          </div>
        </div>

        <!-- Filtered Transactions KPI Summary -->
        <div id="cb-txn-kpis" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;padding:14px 20px;background:#f8fafc;border-bottom:1px solid var(--border-soft);">
          <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:10px 14px;text-align:center;">
            <div style="font-size:11px;color:#047857;font-weight:700;">إجمالي الوارد (+)</div>
            <div id="kpi-tx-total-in" class="mono text-ok" style="font-size:16px;font-weight:900;">0.00 ر.س</div>
          </div>
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:10px 14px;text-align:center;">
            <div style="font-size:11px;color:#dc2626;font-weight:700;">إجمالي الصادر (-)</div>
            <div id="kpi-tx-total-out" class="mono text-bad" style="font-size:16px;font-weight:900;">0.00 ر.س</div>
          </div>
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:10px 14px;text-align:center;">
            <div style="font-size:11px;color:#1d4ed8;font-weight:700;">صافي حركة الفترة</div>
            <div id="kpi-tx-net" class="mono" style="font-size:16px;font-weight:900;color:#1e40af;">0.00 ر.س</div>
          </div>
          <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:10px;padding:10px 14px;text-align:center;">
            <div style="font-size:11px;color:#475569;font-weight:700;">عدد الحركات المعروضة</div>
            <div id="kpi-tx-count" class="mono" style="font-size:16px;font-weight:900;color:#0f172a;">0 حركة</div>
          </div>
        </div>

        <div class="table-container">
          <table class="data-dense" style="width:100%;font-size:12.5px;">
            <thead>
              <tr style="background:#1e293b;color:#ffffff;">
                <th style="padding:10px 12px;width:110px;">التاريخ والوقت</th>
                <th style="padding:10px 12px;width:140px;">الصندوق / العهدة</th>
                <th style="padding:10px 12px;width:130px;">نوع الحركة</th>
                <th style="padding:10px 12px;width:95px;">المرجع</th>
                <th style="padding:10px 12px;">البيان والسبب التفصيلي</th>
                <th style="padding:10px 12px;text-align:left;width:115px;">وارد (+)</th>
                <th style="padding:10px 12px;text-align:left;width:115px;">صادر (-)</th>
                <th style="padding:10px 12px;text-align:left;width:125px;">الرصيد بعد الحركة</th>
                <th style="padding:10px 12px;width:90px;">المستخدم</th>
                <th style="padding:10px 12px;width:115px;text-align:center;">طباعة السند</th>
              </tr>
            </thead>
            <tbody id="cb-txn-tbody">
              ${Array(6).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(10).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: NEW / EDIT CASH BOX ═══ -->
    <div class="modal-overlay" id="cb-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="cb-modal-title">إضافة صندوق نقدي</h3>
          <button class="modal-close" onclick="closeModal('cb-modal')">×</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="cb-edit-id" />
          <div class="form-group mb-16">
            <label>اسم الصندوق / العهدة *</label>
            <input type="text" id="cb-name" class="input" placeholder="مثال: عهدة المندوب أحمد / الصندوق الرئيسي" />
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>نوع الصندوق</label>
              <select id="cb-type">
                <option value="main">خزينة رئيسية</option>
                <option value="rep">عهدة مندوب</option>
                <option value="owner_current">👤 جاري المالك (تمويل شخصي)</option>
                <option value="petty">مصروفات نثرية</option>
              </select>
            </div>
            <div class="form-group">
              <label>المسؤول</label>
              <input type="text" id="cb-keeper" class="input" placeholder="اسم المندوب / أمين الصندوق" />
            </div>
          </div>
          <div class="form-group mb-16">
            <label>الرصيد الافتتاحي (ر.س)</label>
            <input type="number" id="cb-opening" class="input mono" step="0.01" placeholder="0.00" />
          </div>
          <div class="form-group mb-16" id="cb-coa-toggle-wrap" style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="cb-coa-toggle" checked style="width:16px;height:16px;cursor:pointer;" />
            <label for="cb-coa-toggle" style="margin-bottom:0;cursor:pointer;font-weight:bold;">إنشاء حساب مستقل في شجرة الحسابات</label>
          </div>
          <div id="cb-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('cb-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveCashBox()" id="save-cb-btn">حفظ الصندوق</button>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: QUICK CASH TRANSFER (بضغطة زر) ═══ -->
    <div class="modal-overlay" id="cb-quick-transfer-modal">
      <div class="modal" style="max-width:540px;border-radius:20px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.3);">
        <div class="modal-header" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%);color:#fff;padding:16px 22px;">
          <h3 class="modal-title" style="color:#fff;font-size:17px;font-weight:900;display:flex;align-items:center;gap:8px;">
            <span>⚡</span> تحويل نقدية فوري بين الصناديق والعهد
          </h3>
          <button class="modal-close" onclick="closeModal('cb-quick-transfer-modal')" style="color:#fff;opacity:0.85;">×</button>
        </div>
        <div class="modal-body" style="padding:20px;background:#f8fafc;">
          
          <!-- Source Box -->
          <div class="form-group mb-16">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <label style="font-weight:800;font-size:12.5px;color:#0f172a;margin:0;">الصندوق المحول منه (المُسلِّم) *</label>
              <span id="qtx-source-bal-badge" style="font-size:11px;font-weight:800;background:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:6px;border:1px solid #bae6fd;">الرصيد المتاح: 0.00 ر.س</span>
            </div>
            <select id="qtx-source-box" class="input" onchange="onQuickTransferSourceChange()" style="font-size:13px;font-weight:700;"></select>
          </div>

          <!-- Target Box -->
          <div class="form-group mb-16">
            <label style="font-weight:800;font-size:12.5px;color:#0f172a;display:block;margin-bottom:6px;">الصندوق المستلم (المُستلِم) *</label>
            <select id="qtx-target-box" class="input" style="font-size:13px;font-weight:700;"></select>
          </div>

          <!-- Amount & Date -->
          <div class="grid-2 gap-14 mb-16">
            <div class="form-group">
              <label style="font-weight:800;font-size:12.5px;color:#0f172a;display:block;margin-bottom:6px;">المبلغ المراد تحويله (ر.س) *</label>
              <input type="number" id="qtx-amount" class="input mono font-bold" step="0.01" min="0.01" placeholder="0.00" oninput="validateQuickTransferAmount()" style="font-size:16px;color:#0f172a;" />
            </div>
            <div class="form-group">
              <label style="font-weight:800;font-size:12.5px;color:#0f172a;display:block;margin-bottom:6px;">تاريخ التحويل *</label>
              <input type="date" id="qtx-date" class="input" style="font-size:13px;" />
            </div>
          </div>

          <!-- Quick reason chips & Notes -->
          <div class="form-group mb-16">
            <label style="font-weight:800;font-size:12.5px;color:#0f172a;display:block;margin-bottom:6px;">البيان وسبب التحويل *</label>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
              <span class="chip-preset" onclick="setQuickTransferNote('تغذية عهدة سيارة')" style="cursor:pointer;background:#e2e8f0;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;color:#334155;">+ تغذية عهدة سيارة</span>
              <span class="chip-preset" onclick="setQuickTransferNote('توريد مبيعات يومية للخزينة')" style="cursor:pointer;background:#e2e8f0;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;color:#334155;">+ توريد مبيعات يومية</span>
              <span class="chip-preset" onclick="setQuickTransferNote('مناقلة سيولة نقدية')" style="cursor:pointer;background:#e2e8f0;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;color:#334155;">+ مناقلة سيولة</span>
              <span class="chip-preset" onclick="setQuickTransferNote('تسليم نقدية بيد المسؤول')" style="cursor:pointer;background:#e2e8f0;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;color:#334155;">+ تسليم نقدية</span>
            </div>
            <input type="text" id="qtx-notes" class="input" placeholder="اكتب سبباً أو اختر من المقترحات أعلاه..." style="font-size:13px;" />
          </div>

          <!-- Auto Accounting Entry Notice -->
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:10px 14px;font-size:11.5px;color:#166534;display:flex;align-items:center;gap:8px;">
            <span>⚖️</span>
            <span>سيتم إنشاء <strong>قيد محاسبي مزدوج تلقائياً</strong> (مدين: الصندوق المستلم | دائن: الصندوق المحول منه) فور الحفظ.</span>
          </div>

          <div id="qtx-error" class="alert bad hidden" style="margin-top:12px;"></div>
        </div>
        <div class="modal-footer" style="background:#f1f5f9;padding:14px 22px;display:flex;justify-content:space-between;align-items:center;">
          <button class="btn btn-secondary" onclick="closeModal('cb-quick-transfer-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="executeQuickTransfer()" id="btn-save-qtx" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%);border:none;font-weight:800;padding:8px 20px;">
            ⚡ تأكيد وتحويل النقدية الآن
          </button>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: CASH TRANSACTION (MANUAL IN/OUT) ═══ -->
    <div class="modal-overlay" id="cb-txn-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">سند حركة نقدية مباشرة</h3>
          <button class="modal-close" onclick="closeModal('cb-txn-modal')">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group mb-16">
            <label>الصندوق *</label>
            <select id="ctxn-box" onchange="toggleTxnTypeFields()"></select>
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>نوع الحركة *</label>
              <select id="ctxn-type" onchange="toggleTxnTypeFields()">
                <option value="in">إيداع / تزويد نقدية (+)</option>
                <option value="out">سحب / مصاريف (-)</option>
                <option value="transfer">تحويل بين الصناديق 🔄</option>
              </select>
            </div>
            <div class="form-group">
              <label>المبلغ (ر.س) *</label>
              <input type="number" id="ctxn-amount" class="input mono" step="0.01" min="0.01" />
            </div>
          </div>
          <div class="form-group mb-16 hidden" id="ctxn-target-box-wrap">
            <label>الصندوق المستلم (إلى) *</label>
            <select id="ctxn-target-box"></select>
          </div>
          <div class="form-group mb-16">
            <label>البيان / السبب *</label>
            <input type="text" id="ctxn-notes" class="input" placeholder="مثال: توريد مبيعات يومية، تسليم نقدية المندوب..." />
          </div>
          <div id="ctxn-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('cb-txn-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveCashTxn()" id="save-ctxn-btn">💾 حفظ الحركة</button>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: ADVANCED DETAILED STATEMENT OF ACCOUNT ═══ -->
    <div class="modal-overlay" id="cb-statement-modal">
      <div class="modal modal-lg" style="max-width:1160px;border-radius:18px;overflow:hidden;box-shadow:0 25px 60px -15px rgba(0,0,0,0.35);border:1px solid #cbd5e1;">
        <div class="modal-header" style="background:#ffffff;border-bottom:1.5px solid #e2e8f0;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="background:#eff6ff;color:#1d4ed8;width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;border:1px solid #bfdbfe;">
              📄
            </div>
            <div>
              <h3 class="modal-title" id="cb-stmt-modal-title" style="color:#0f172a !important;font-size:18px;font-weight:900;margin:0;">كشف حساب تفصيلي للصندوق</h3>
              <div style="font-size:12px;color:#475569;margin-top:2px;font-weight:600;">دفتر أستاذ الحركات النقدية مع الترتيب الزمني المحاسبي والرصيد التراكمي</div>
            </div>
          </div>
          <button class="modal-close" onclick="closeModal('cb-statement-modal')" style="color:#64748b;font-size:26px;background:none;border:none;cursor:pointer;line-height:1;">×</button>
        </div>
        <div class="modal-body" id="cb-stmt-body" style="padding:22px;background:#f8fafc;max-height:80vh;overflow-y:auto;">
          <!-- Loaded dynamically -->
        </div>
        <div class="modal-footer" style="background:#ffffff;border-top:1.5px solid #e2e8f0;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <button class="btn btn-secondary" onclick="closeModal('cb-statement-modal')" style="font-weight:700;color:#334155;">إغلاق</button>
          <div style="display:flex;gap:10px;">
            <button class="btn btn-secondary" onclick="exportCashBoxStatementToExcel()" style="background:#059669;color:#ffffff;border:none;font-weight:800;padding:8px 16px;border-radius:8px;">
              📊 تصدير إكسيل ملون (XLSX)
            </button>
            <button class="btn btn-primary" onclick="printCashBoxStatementOfficial()" style="background:#1d4ed8;color:#ffffff;border:none;font-weight:800;padding:8px 18px;border-radius:8px;">
              🖨️ طباعة رسمية A4 لكشف الحساب
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Non-blocking parallel load (fresh COA & CashBoxes read ensures live card balances)
  loadCashBoxes(true);
  loadCashTxns();
}

function _resolveSafeCashBoxCoaAccount(cb, coaAccounts) {
  if (!Array.isArray(coaAccounts) || coaAccounts.length === 0) return null;
  const name = (cb.name || "").trim();
  const nonHeader = a => a.nodeType !== "header";

  // Guard against legacy Main Cash Box misbinding to Bank Header "1-1-1-3" -> repair to "1-1-1-1-3"
  if (name.includes("الرئيسى") || name.includes("الرئيسي") || cb.type === "main") {
    const mainAcc = coaAccounts.find(a => a.code === "1-1-1-1-3" && nonHeader(a));
    if (mainAcc) return mainAcc;
  }
  if (name.includes("مصطفى")) {
    const acc = coaAccounts.find(a => a.code === "1-1-1-2-01" && nonHeader(a));
    if (acc) return acc;
  }
  if (name.includes("رضا")) {
    const acc = coaAccounts.find(a => a.code === "1-1-1-2-04" && nonHeader(a));
    if (acc) return acc;
  }

  if (cb.accountId) {
    const byId = coaAccounts.find(a => a.id === cb.accountId && nonHeader(a));
    if (byId) return byId;
  }
  if (cb.accountCode) {
    const byCode = coaAccounts.find(a => a.code === cb.accountCode && nonHeader(a));
    if (byCode) return byCode;
  }
  if (name) {
    const byName = coaAccounts.find(a => a.name && nonHeader(a) && (a.name.trim() === name || a.name.includes(name)));
    if (byName) return byName;
  }
  return null;
}

window.refreshCashBoxesLive = async () => {
  await Promise.all([loadCashBoxes(true), loadCashTxns()]);
  showToast("تم تحديث أرصدة الصناديق والحركات من قاعدة البيانات", "success");
};

async function loadCashBoxes(forceRefresh = false) {
  const grid = document.getElementById("cb-grid");
  const selectBoxFilter = document.getElementById("filter-cb-box");
  if (!grid) return;

  try {
    if (forceRefresh) {
      await Promise.all([
        clearERPCache(COLS.cashBoxes().path),
        clearERPCache(COLS.chartOfAccounts().path)
      ]);
    }

    const [cbList, coaAccounts] = await Promise.all([
      getAll(COLS.cashBoxes(), [orderBy("name")]),
      getAll(COLS.chartOfAccounts())
    ]);
    cashBoxes = cbList || [];

    // Sync card balances & account links directly from Chart of Accounts (single accounting source of truth)
    const syncUpdates = [];
    for (const cb of cashBoxes) {
      const acc = _resolveSafeCashBoxCoaAccount(cb, coaAccounts);
      if (!acc) continue;

      const coaBal = Math.round(Number(acc.balance || 0) * 100) / 100;
      const storedBal = Math.round(Number(cb.balance || 0) * 100) / 100;
      const updateData = {};
      let needsUpdate = false;

      if (Math.abs(storedBal - coaBal) > 0.009) {
        updateData.balance = coaBal;
        needsUpdate = true;
      }
      cb.balance = coaBal;

      if (cb.accountId !== acc.id) {
        cb.accountId = acc.id;
        updateData.accountId = acc.id;
        needsUpdate = true;
      }
      if (cb.accountCode !== acc.code) {
        cb.accountCode = acc.code;
        cb.code = acc.code;
        updateData.accountCode = acc.code;
        updateData.code = acc.code;
        needsUpdate = true;
      }

      if (needsUpdate) {
        syncUpdates.push(
          update("cashBoxes", cb.id, updateData).catch(err => console.warn("Background cashBox sync:", err))
        );
      }
    }

    if (syncUpdates.length > 0) {
      Promise.all(syncUpdates).then(() => clearERPCache(COLS.cashBoxes().path)).catch(() => {});
    }

    if (selectBoxFilter) {
      selectBoxFilter.innerHTML = '<option value="">جميع الصناديق والعهد</option>' +
        cashBoxes.map(b => `<option value="${b.id}" ${b.id === _selectedBoxFilter ? 'selected' : ''}>${b.name}</option>`).join("");
    }

    if (cashBoxes.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:span 3;"><div class="empty-icon">💵</div><h3>لا توجد صناديق نقدية</h3><p>اضغط على "صندوق جديد" لإضافة خزينة أو عهدة مندوب</p></div>`;
      return;
    }

    grid.innerHTML = cashBoxes.map(cb => {
      const theme = _getCashBoxTheme(cb);
      const isSelected = _selectedBoxFilter === cb.id;

      return `
        <div class="card cb-card-luxury cb-card-interactive" onclick="filterCashBoxTxnsByCard('${cb.id}')" style="background:${theme.gradient}; border:${theme.border}; box-shadow:${theme.shadow}; cursor:pointer; ${isSelected ? 'outline:3.5px solid #ffffff;transform:scale(1.02);' : ''}">
          
          <div style="position:absolute; top:-15px; left:-15px; font-size:95px; opacity:0.12; pointer-events:none; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">${theme.icon}</div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; position:relative; z-index:2;">
            <span class="cb-badge" style="font-size:11.5px; display:inline-flex; align-items:center; gap:6px;">
              <span>${theme.icon}</span> <span>${theme.badgeText}</span>
            </span>
            <div style="display:flex; gap:6px;" onclick="event.stopPropagation();">
              <button class="btn btn-icon sm" onclick="openQuickTransferModal('${cb.id}')" style="background:rgba(255,255,255,0.25); color:#ffffff !important; border:1px solid rgba(255,255,255,0.35); border-radius:8px;" title="⚡ تحويل نقدية سريع من هذا الصندوق">⚡</button>
              <button class="btn btn-icon sm" onclick="openCashBoxStatementModal('${cb.id}')" style="background:rgba(255,255,255,0.22); color:#ffffff !important; border:1px solid rgba(255,255,255,0.3); border-radius:8px;" title="كشف حساب تفصيلي">📄</button>
              <button class="btn btn-icon sm" onclick="openCashBoxModal('${cb.id}')" style="background:rgba(255,255,255,0.22); color:#ffffff !important; border:1px solid rgba(255,255,255,0.3); border-radius:8px;" title="تعديل">✏️</button>
              <button class="btn btn-icon sm" onclick="deleteCashBox('${cb.id}','${cb.name}')" style="background:rgba(239,68,68,0.4); color:#ffffff !important; border:1px solid rgba(239,68,68,0.6); border-radius:8px;" title="حذف">🗑️</button>
            </div>
          </div>

          <h3 class="cb-box-title" style="margin:0 0 6px 0; position:relative; z-index:2;">${cb.name}</h3>
          <div class="cb-sub-text" style="margin-bottom:14px; position:relative; z-index:2;">👤 المسؤول: <strong style="color:#ffffff !important;">${cb.keeper || "غير محدد"}</strong> ${cb.accountCode ? `| كود: <span dir="ltr" style="font-family:var(--font-mono, monospace);font-weight:800;direction:ltr;unicode-bidi:isolate;display:inline-block;color:#ffffff !important;">${cb.accountCode}</span>` : ''}</div>

          <div class="cb-amount-box" style="position:relative; z-index:2;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:12px; font-weight:800; color:rgba(255,255,255,0.95) !important;">💵 الرصيد النقدي المتوفر</span>
              <span style="font-size:10.5px; font-weight:800; background:rgba(16,185,129,0.35); border:1px solid rgba(16,185,129,0.6); padding:2px 8px; border-radius:12px; color:#a7f3d0 !important;">نقد فوري</span>
            </div>
            <div class="cb-balance-value" style="direction:ltr; text-align:right;">
              ${formatCurrency(cb.balance || 0)}
            </div>
          </div>

          <!-- Quick Actions on Card -->
          <div style="display:flex; gap:8px; margin-top:12px; position:relative; z-index:2;" onclick="event.stopPropagation();">
            <button class="btn btn-sm" onclick="openQuickTransferModal('${cb.id}')" style="flex:1; background:rgba(255,255,255,0.25); color:#ffffff; font-weight:800; border:1px solid rgba(255,255,255,0.4); border-radius:10px; font-size:12px; padding:6px 10px; display:inline-flex; align-items:center; justify-content:center; gap:5px; box-shadow:0 2px 5px rgba(0,0,0,0.15);">
              ⚡ تحويل نقدية
            </button>
            <button class="btn btn-sm" onclick="openCashBoxStatementModal('${cb.id}')" style="flex:1; background:rgba(0,0,0,0.25); color:#ffffff; font-weight:800; border:1px solid rgba(255,255,255,0.25); border-radius:10px; font-size:12px; padding:6px 10px; display:inline-flex; align-items:center; justify-content:center; gap:5px;">
              📄 كشف الحساب
            </button>
          </div>

          <div style="margin-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:11.5px; position:relative; z-index:2;">
            <span style="color:rgba(255,255,255,0.95) !important; font-weight:700;">
              ${isSelected ? '🎯 تصفية نشطة للجدول أدناه' : '🔍 انقر لتصفية جدول الحركات'}
            </span>
          </div>
        </div>`;
    }).join("");

  } catch (err) {
    grid.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
}

async function loadCashTxns() {
  const tbody = document.getElementById("cb-txn-tbody");
  if (!tbody) return;

  try {
    const q = query(COLS.cashTransactions(), orderBy("createdAt", "desc"), limit(200));
    const snap = await getDocs(q);
    _allCashTxns = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    applyCashTxnFilters();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="alert bad" style="margin:8px;">${err.message}</div></td></tr>`;
  }
}

window.filterCashBoxTxnsByCard = (boxId) => {
  _selectedBoxFilter = boxId;
  const selectEl = document.getElementById("filter-cb-box");
  if (selectEl) selectEl.value = boxId;

  const btnReset = document.getElementById("btn-reset-box-filter");
  if (btnReset) btnReset.style.display = boxId ? "inline-block" : "none";

  loadCashBoxes();
  applyCashTxnFilters();
};

window.applyCashTxnFilters = () => {
  const boxId = document.getElementById("filter-cb-box")?.value || _selectedBoxFilter || "";
  const from  = document.getElementById("filter-cb-from")?.value || "";
  const to    = document.getElementById("filter-cb-to")?.value || "";
  const type  = document.getElementById("filter-cb-type")?.value || "";
  const search= (document.getElementById("filter-cb-search")?.value || "").trim().toLowerCase();

  const tbody = document.getElementById("cb-txn-tbody");
  const titleEl = document.getElementById("cb-txn-table-title");
  const subtitleEl = document.getElementById("cb-txn-table-subtitle");

  if (!tbody) return;

  let filtered = [..._allCashTxns];

  if (boxId) {
    filtered = filtered.filter(t => t.cashBoxId === boxId);
    const box = cashBoxes.find(b => b.id === boxId);
    if (titleEl) titleEl.textContent = `📑 كشف حركات: ${box ? box.name : 'الصندوق المالي'}`;
    if (subtitleEl) subtitleEl.textContent = `سجل الحركات المصروفة والمقبوضة للصندوق المالي المقتطع (${filtered.length} حركة)`;
  } else {
    if (titleEl) titleEl.textContent = "📑 سجل ودعم كشف حركات كافة الصناديق والعهد";
    if (subtitleEl) subtitleEl.textContent = "انقر على أي كارت صندوق بالأعلى للتصفية المباشرة عليه أو استعراض كشف الحساب الشامل";
  }

  const getTxDateStr = (t) => {
    if (t.date && /^\d{4}-\d{2}-\d{2}$/.test(t.date)) return t.date;
    if (t.createdAt?.toDate) return t.createdAt.toDate().toISOString().split("T")[0];
    if (t.createdAt?.seconds) return new Date(t.createdAt.seconds * 1000).toISOString().split("T")[0];
    return "";
  };

  if (from) filtered = filtered.filter(t => {
    const dStr = getTxDateStr(t);
    return dStr ? dStr >= from : true;
  });
  if (to) filtered = filtered.filter(t => {
    const dStr = getTxDateStr(t);
    return dStr ? dStr <= to : true;
  });
  if (type) filtered = filtered.filter(t => t.type === type);
  if (search) {
    filtered = filtered.filter(t => 
      (t.notes || "").toLowerCase().includes(search) ||
      (t.userName || "").toLowerCase().includes(search) ||
      (t.cashBoxId || "").toLowerCase().includes(search)
    );
  }

  // Sort by financial date descending, then createdAt descending
  filtered.sort((a, b) => {
    const dateA = getTxDateStr(a);
    const dateB = getTxDateStr(b);
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeB - timeA;
  });

  const cbMap = {};
  cashBoxes.forEach(b => cbMap[b.id] = b.name);

  // Update summary KPI counters
  const totalIn = filtered.filter(t => t.type === 'in').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalOut = filtered.filter(t => t.type === 'out').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const netMovement = totalIn - totalOut;

  const kpiInEl = document.getElementById("kpi-tx-total-in");
  const kpiOutEl = document.getElementById("kpi-tx-total-out");
  const kpiNetEl = document.getElementById("kpi-tx-net");
  const kpiCountEl = document.getElementById("kpi-tx-count");

  if (kpiInEl) kpiInEl.textContent = `+${formatCurrency(totalIn)}`;
  if (kpiOutEl) kpiOutEl.textContent = `-${formatCurrency(totalOut)}`;
  if (kpiNetEl) {
    kpiNetEl.textContent = `${netMovement >= 0 ? '+' : ''}${formatCurrency(netMovement)}`;
    kpiNetEl.style.color = netMovement >= 0 ? "#047857" : "#dc2626";
  }
  if (kpiCountEl) kpiCountEl.textContent = `${filtered.length} حركة`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:36px;color:var(--text-2);font-weight:700;">🔍 لا توجد حركات نقدية مطابقة للتصفية المختارة</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(t => {
    const isIncome = t.type === 'in';
    const isTransfer = t.isTransfer || (t.notes && t.notes.includes("تحويل"));
    
    let badgeStyle = isIncome
      ? 'background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;font-weight:800;'
      : 'background:#fef2f2;color:#dc2626;border:1px solid #fecaca;font-weight:800;';
    let badgeText = isIncome ? 'إيداع / تحصيل (+)' : 'سحب / مصروف (-)';
    
    if (isTransfer) {
      badgeStyle = isIncome
        ? 'background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;font-weight:800;'
        : 'background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;font-weight:800;';
      badgeText = isIncome ? 'تحويل وارد 🔄' : 'تحويل صادر 🔄';
    }

    const txDate = t.date ? formatDate(t.date) : (t.createdAt ? formatDate(t.createdAt) : "—");
    let refCode = t.refNumber || "";
    if (!refCode) {
      if (t.sourceType === "receipt") refCode = `RV-${(t.sourceId||t.id).substring(0,6).toUpperCase()}`;
      else if (t.sourceType === "expense") refCode = `PV-${(t.sourceId||t.id).substring(0,6).toUpperCase()}`;
      else if (t.sourceType === "cashTransfer" || isTransfer) refCode = `TR-${t.id.substring(0,6).toUpperCase()}`;
      else refCode = `TXN-${t.id.substring(0,6).toUpperCase()}`;
    }

    return `
      <tr style="transition:all 0.15s ease;">
        <td class="mono font-bold" style="font-size:12.5px;">${txDate}</td>
        <td><strong style="color:var(--text-1);">${cbMap[t.cashBoxId] || t.cashBoxId}</strong></td>
        <td><span class="badge" style="${badgeStyle}padding:4px 10px;border-radius:8px;">${badgeText}</span></td>
        <td class="mono" style="font-size:11px;"><span dir="ltr" style="background:#f1f5f9;padding:2px 8px;border-radius:6px;font-weight:800;color:#334155;">${refCode}</span></td>
        <td><span style="font-size:12.5px;color:var(--text-2);font-weight:600;">${t.notes || "—"}</span></td>
        <td class="mono font-bold text-ok" style="text-align:left;font-size:13px;">${isIncome ? '+' + formatCurrency(t.amount) : '—'}</td>
        <td class="mono font-bold text-bad" style="text-align:left;font-size:13px;">${!isIncome ? '-' + formatCurrency(t.amount) : '—'}</td>
        <td class="mono font-bold" style="text-align:left;font-size:12.5px;"><span dir="ltr" style="display:inline-block;direction:ltr;background:var(--bg-2);padding:2px 8px;border-radius:6px;">${formatCurrency(t.balanceAfter || 0)}</span></td>
        <td style="font-size:11.5px;color:var(--text-3);">${t.userName || "النظام"}</td>
        <td style="text-align:center;padding:6px 8px;">
          <button type="button" class="btn btn-sm" onclick="printCashTxnVoucher('${t.id}')"
            title="${isIncome ? 'طباعة سند قبض واستلام نقدية' : 'طباعة سند صرف وإقرار استلام'}"
            style="font-size:11.5px;font-weight:800;padding:5px 10px;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;white-space:nowrap;transition:all 0.15s ease;${isIncome ? 'background:#ecfdf5;color:#047857;border:1.5px solid #a7f3d0;' : 'background:#fef2f2;color:#dc2626;border:1.5px solid #fecaca;'}">
            <span style="font-size:12.5px;">🖨️</span> <span>${isIncome ? 'سند قبض' : 'سند صرف'}</span>
          </button>
        </td>
      </tr>`;
  }).join("");
};

// ─────────────────────────────────────────────────────────────────────────────
// ⚡ QUICK INTER-BOX TRANSFER (تحويل نقدية فوري بضغطة زر مع توليد القيد الآلي)
// ─────────────────────────────────────────────────────────────────────────────
window.openQuickTransferModal = (sourceBoxId = "") => {
  if (!cashBoxes || cashBoxes.length < 2) {
    showToast("يجب توفر صندوقين نقديين على الأقل لإجراء التحويل", "warning");
    return;
  }

  const selSource = document.getElementById("qtx-source-box");
  const selTarget = document.getElementById("qtx-target-box");
  const errEl = document.getElementById("qtx-error");
  if (errEl) errEl.classList.add("hidden");

  let defaultSourceId = sourceBoxId;
  if (!defaultSourceId) {
    const mainBox = cashBoxes.find(b => b.type === "main" || (b.name && b.name.includes("الرئيسي")));
    defaultSourceId = mainBox ? mainBox.id : cashBoxes[0].id;
  }

  selSource.innerHTML = cashBoxes.map(b => 
    `<option value="${b.id}" ${b.id === defaultSourceId ? 'selected' : ''}>${b.name} (${formatCurrency(b.balance || 0)})</option>`
  ).join("");

  window.onQuickTransferSourceChange();

  document.getElementById("qtx-amount").value = "";
  document.getElementById("qtx-date").value = todayString();
  document.getElementById("qtx-notes").value = "";
  
  const saveBtn = document.getElementById("btn-save-qtx");
  if (saveBtn) saveBtn.disabled = false;

  openModal("cb-quick-transfer-modal");
};

window.onQuickTransferSourceChange = () => {
  const selSource = document.getElementById("qtx-source-box");
  const selTarget = document.getElementById("qtx-target-box");
  const balBadge = document.getElementById("qtx-source-bal-badge");
  if (!selSource || !selTarget) return;

  const sourceId = selSource.value;
  const sourceBox = cashBoxes.find(b => b.id === sourceId);

  const availableBal = sourceBox ? (sourceBox.balance || 0) : 0;
  if (balBadge) {
    balBadge.textContent = `الرصيد المتاح: ${formatCurrency(availableBal)}`;
    balBadge.style.color = availableBal > 0 ? "#0369a1" : "#dc2626";
    balBadge.style.background = availableBal > 0 ? "#e0f2fe" : "#fee2e2";
  }

  const targets = cashBoxes.filter(b => b.id !== sourceId);
  selTarget.innerHTML = targets.map(b => 
    `<option value="${b.id}">${b.name} (الرصيد الحالي: ${formatCurrency(b.balance || 0)})</option>`
  ).join("");

  window.validateQuickTransferAmount();
};

window.validateQuickTransferAmount = () => {
  const sourceId = document.getElementById("qtx-source-box")?.value;
  const amount = parseFloat(document.getElementById("qtx-amount")?.value) || 0;
  const sourceBox = cashBoxes.find(b => b.id === sourceId);
  const currentBal = sourceBox ? (sourceBox.balance || 0) : 0;
  const errEl = document.getElementById("qtx-error");
  const saveBtn = document.getElementById("btn-save-qtx");

  if (!errEl) return;

  if (amount > currentBal) {
    errEl.textContent = `⚠️ تحذير: المبلغ المراد تحويله (${formatCurrency(amount)}) أكبر من الرصيد المتاح (${formatCurrency(currentBal)})!`;
    errEl.classList.remove("hidden");
    if (saveBtn) saveBtn.disabled = true;
    return false;
  } else {
    errEl.classList.add("hidden");
    if (saveBtn) saveBtn.disabled = false;
    return true;
  }
};

window.setQuickTransferNote = (text) => {
  const input = document.getElementById("qtx-notes");
  if (input) {
    input.value = text;
    input.focus();
  }
};

window.executeQuickTransfer = async () => {
  const sourceId = document.getElementById("qtx-source-box").value;
  const targetId = document.getElementById("qtx-target-box").value;
  const amount   = parseFloat(document.getElementById("qtx-amount").value) || 0;
  const date     = document.getElementById("qtx-date").value || todayString();
  const notes    = (document.getElementById("qtx-notes").value || "").trim();
  const errEl    = document.getElementById("qtx-error");
  const saveBtn  = document.getElementById("btn-save-qtx");

  errEl.classList.add("hidden");

  if (!sourceId || !targetId) {
    errEl.textContent = "يرجى تحديد الصندوق المحول منه والصندوق المستلم";
    errEl.classList.remove("hidden");
    return;
  }
  if (sourceId === targetId) {
    errEl.textContent = "لا يمكن التحويل لنفس الصندوق";
    errEl.classList.remove("hidden");
    return;
  }
  if (amount <= 0) {
    errEl.textContent = "يرجى إدخال مبلغ صحيح أكبر من الصفر";
    errEl.classList.remove("hidden");
    return;
  }
  if (!notes) {
    errEl.textContent = "يرجى كتابة سبب أو بيان التحويل";
    errEl.classList.remove("hidden");
    return;
  }

  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span class="spin"></span> جاري التحويل وتوليد القيد...';

  try {
    const sourceRef = doc(db, `companies/${COMPANY_ID}/cashBoxes`, sourceId);
    const targetRef = doc(db, `companies/${COMPANY_ID}/cashBoxes`, targetId);

    let sourceBalAfter = 0;
    let targetBalAfter = 0;
    let sourceName = "";
    let targetName = "";
    let sourceCode = "";
    let targetCode = "";
    let transferTxnId = "";

    await runTransaction(db, async (tx) => {
      const sourceSnap = await tx.get(sourceRef);
      const targetSnap = await tx.get(targetRef);

      if (!sourceSnap.exists()) throw new Error("الصندوق المرسل غير موجود");
      if (!targetSnap.exists()) throw new Error("الصندوق المستلم غير موجود");

      const sourceData = sourceSnap.data();
      const targetData = targetSnap.data();

      const sCurrent = Number(sourceData.balance || 0);
      const tCurrent = Number(targetData.balance || 0);

      if (sCurrent < amount) {
        throw new Error(`رصيد الصندوق المرسل غير كافٍ: ${sCurrent} < ${amount}`);
      }

      sourceName = sourceData.name;
      targetName = targetData.name;
      sourceCode = sourceData.accountCode || sourceData.code || "1-1-1-1-3";
      targetCode = targetData.accountCode || targetData.code || "1-1-1-1-3";

      sourceBalAfter = sCurrent - amount;
      targetBalAfter = tCurrent + amount;

      tx.update(sourceRef, { balance: sourceBalAfter, updatedAt: serverTimestamp() });
      tx.update(targetRef, { balance: targetBalAfter, updatedAt: serverTimestamp() });

      const txn1Ref = doc(collection(db, `companies/${COMPANY_ID}/cashTransactions`));
      transferTxnId = txn1Ref.id.slice(0, 6).toUpperCase();

      tx.set(txn1Ref, {
        cashBoxId: sourceId,
        type: "out",
        isTransfer: true,
        sourceType: "cashTransfer",
        relatedBoxId: targetId,
        relatedBoxName: targetName,
        amount,
        date,
        notes: `تحويل صادر إلى ${targetName} — ${notes}`,
        balanceAfter: sourceBalAfter,
        refNumber: `TR-${transferTxnId}`,
        userName: "النظام",
        createdAt: serverTimestamp(),
      });

      const txn2Ref = doc(collection(db, `companies/${COMPANY_ID}/cashTransactions`));
      tx.set(txn2Ref, {
        cashBoxId: targetId,
        type: "in",
        isTransfer: true,
        sourceType: "cashTransfer",
        relatedBoxId: sourceId,
        relatedBoxName: sourceName,
        amount,
        date,
        notes: `تحويل وارد من ${sourceName} — ${notes}`,
        balanceAfter: targetBalAfter,
        refNumber: `TR-${transferTxnId}`,
        userName: "النظام",
        createdAt: serverTimestamp(),
      });
    });

    try {
      await createJournalEntry({
        date: date,
        description: `مناقلة نقدية بين الصناديق: من ${sourceName} إلى ${targetName} — إذن رقم TR-${transferTxnId} — ${notes}`,
        sourceType: 'cashTransaction',
        sourceId: transferTxnId,
        lines: [
          { accountCode: targetCode, accountName: targetName, debit: amount, credit: 0, note: `استلام تحويل من ${sourceName}` },
          { accountCode: sourceCode, accountName: sourceName, debit: 0, credit: amount, note: `تسليم تحويل إلى ${targetName}` },
        ],
        status: 'posted',
        createdByName: 'إدارة الخزينة',
      });
    } catch (jeErr) {
      console.warn('[QuickTransfer JE] Failed (non-fatal):', jeErr.message);
    }

    showToast(`تم تحويل ${formatCurrency(amount)} من ${sourceName} إلى ${targetName} بنجاح وتوليد القيد الآلي`, "success");
    closeModal("cb-quick-transfer-modal");

    await Promise.all([
      clearERPCache(COLS.cashBoxes().path),
      clearERPCache(COLS.cashTransactions().path),
      clearERPCache(COLS.journalEntries().path),
      clearERPCache(COLS.chartOfAccounts().path)
    ]);
    await loadCashBoxes();
    await loadCashTxns();

  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '⚡ تأكيد وتحويل النقدية الآن';
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 📄 ADVANCED CASH BOX STATEMENT ENGINE (محرك كشف الحساب التفصيلي المطور)
// ─────────────────────────────────────────────────────────────────────────────

function _parseStatementDateTime(entry, defaultDate = todayString()) {
  let ts = 0;
  if (entry.createdAt?.toMillis) {
    ts = entry.createdAt.toMillis();
  } else if (entry.createdAt?.seconds) {
    ts = entry.createdAt.seconds * 1000;
  } else if (entry.createdAt?.toDate) {
    ts = entry.createdAt.toDate().getTime();
  }

  let rawDate = entry.date || "";
  let isoDate = defaultDate;
  if (rawDate) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      isoDate = rawDate;
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDate)) {
      const [d, m, y] = rawDate.split("/");
      isoDate = `${y}-${m}-${d}`;
    }
  } else if (ts > 0) {
    isoDate = new Date(ts).toISOString().split("T")[0];
  }

  if (!ts) {
    const parsed = new Date(isoDate + "T12:00:00").getTime();
    ts = isNaN(parsed) ? Date.now() : parsed;
  }

  return { isoDate, timestamp: ts };
}

function _extractVoucherCodeFromNotes(notes) {
  if (!notes) return null;
  const m = notes.match(/(?:سند صرف رقم|سند قبض رقم|PV-|RV-|TXN-|TR-|إذن صرف رقم|فاتورة)\s*([A-Za-z0-9_-]+)/i);
  return m ? m[1].toUpperCase() : null;
}

function _normalizeDocsList(input) {
  const arr = input?.docs ? input.docs : (Array.isArray(input) ? input : []);
  return arr.map(d => {
    if (d && typeof d.data === "function") {
      return { id: d.id, data: d.data() || {} };
    }
    const obj = d || {};
    return { id: obj.id || "", data: obj };
  });
}

function _buildDeduplicatedStatementFromData(box, txnDocs, rcptDocs, expDocs, jeDocs) {
  const boxAccountCode = box.accountCode || box.code || "";
  const txns = _normalizeDocsList(txnDocs);
  const rcpts = _normalizeDocsList(rcptDocs);
  const exps = _normalizeDocsList(expDocs);
  const jvs = _normalizeDocsList(jeDocs);

  const expenseMap = new Map();
  for (const { id, data } of exps) {
    const idUpper = id.toUpperCase();
    expenseMap.set(idUpper, { id, ...data });
    if (idUpper.length >= 6) expenseMap.set(idUpper.slice(0, 6), { id, ...data });
    if (data.code) expenseMap.set(String(data.code).toUpperCase(), { id, ...data });
  }

  const receiptMap = new Map();
  for (const { id, data } of rcpts) {
    const idUpper = id.toUpperCase();
    receiptMap.set(idUpper, { id, ...data });
    if (idUpper.length >= 6) receiptMap.set(idUpper.slice(0, 6), { id, ...data });
    if (data.displayCode) receiptMap.set(String(data.displayCode).toUpperCase(), { id, ...data });
    if (data.code) receiptMap.set(String(data.code).toUpperCase(), { id, ...data });
  }

  const rawItems = [];
  const processedVoucherKeys = new Set();

  // 1. Process cashTransactions (primary source of truth for physical cash desk)
  const groupedTxns = new Map();
  for (const { id, data } of txns) {
    const vCode = (data.sourceId || _extractVoucherCodeFromNotes(data.notes) || "").toUpperCase();
    const groupKey = vCode ? `VOUCHER_${vCode}` : `TXN_${id}`;
    const dt = _parseStatementDateTime(data);

    const existing = groupedTxns.get(groupKey);
    if (!existing || dt.timestamp >= existing.dt.timestamp) {
      groupedTxns.set(groupKey, { id, data, dt, vCode });
    }
  }

  for (const [, { id, data, dt, vCode }] of groupedTxns.entries()) {
    const isInc = data.type === "in";
    const amount = Number(data.amount || 0);
    if (amount <= 0) continue;

    if (vCode) {
      processedVoucherKeys.add(vCode);
      if (vCode.length >= 6) processedVoucherKeys.add(vCode.slice(0, 6));
    }
    const idUpper = id.toUpperCase();
    processedVoucherKeys.add(idUpper);
    if (idUpper.length >= 6) processedVoucherKeys.add(idUpper.slice(0, 6));

    let detailedNotes = data.notes || "حركة نقدية";
    let badgeText = isInc ? "إيداع نقدي" : "سحب نقدي";
    let badgeClass = isInc ? "good" : "bad";
    let icon = isInc ? "📥" : "📤";
    let ref = `TXN-${id.slice(0, 6).toUpperCase()}`;

    if (data.sourceType === "expense" || (vCode && expenseMap.has(vCode))) {
      const exp = expenseMap.get(vCode || data.sourceId?.toUpperCase());
      ref = exp?.code || `PV-${(exp?.id || vCode || id).slice(0, 6).toUpperCase()}`;
      badgeText = "سند صرف";
      badgeClass = "bad";
      icon = "📤";
      if (exp) {
        const eIdUpper = exp.id.toUpperCase();
        processedVoucherKeys.add(eIdUpper);
        if (eIdUpper.length >= 6) processedVoucherKeys.add(eIdUpper.slice(0, 6));
        if (exp.code) processedVoucherKeys.add(String(exp.code).toUpperCase());
        const beneficiary = exp.supplierName || exp.accountName || exp.category || "";
        detailedNotes = `سند صرف: ${beneficiary ? beneficiary + ' — ' : ''}${exp.notes || data.notes || ''}`;
      }
    } else if (data.sourceType === "receipt" || (vCode && receiptMap.has(vCode))) {
      const rcpt = receiptMap.get(vCode || data.sourceId?.toUpperCase());
      ref = rcpt?.displayCode || rcpt?.code || `RV-${(rcpt?.id || vCode || id).slice(0, 6).toUpperCase()}`;
      badgeText = "سند قبض";
      badgeClass = "good";
      icon = "📥";
      if (rcpt) {
        const rIdUpper = rcpt.id.toUpperCase();
        processedVoucherKeys.add(rIdUpper);
        if (rIdUpper.length >= 6) processedVoucherKeys.add(rIdUpper.slice(0, 6));
        if (rcpt.code) processedVoucherKeys.add(String(rcpt.code).toUpperCase());
        if (rcpt.displayCode) processedVoucherKeys.add(String(rcpt.displayCode).toUpperCase());
        const customer = rcpt.customerName || rcpt.accountName || "";
        detailedNotes = `سند قبض: ${customer ? 'تحصيل من ' + customer + ' — ' : ''}${rcpt.notes || data.notes || ''}`;
      }
    } else if (data.isTransfer || data.type === "transfer" || (data.notes && data.notes.includes("تحويل"))) {
      badgeText = isInc ? "تحويل وارد 🔄" : "تحويل صادر 🔄";
      icon = "🔄";
      badgeClass = isInc ? "good" : "bad";
      ref = data.refNumber || `TR-${id.slice(0, 6).toUpperCase()}`;
    }

    rawItems.push({
      id,
      timestamp: dt.timestamp,
      date: dt.isoDate,
      displayDate: formatDate(dt.isoDate),
      ref,
      type: data.type,
      badgeText,
      badgeClass,
      icon,
      notes: detailedNotes,
      inflow: isInc ? amount : 0,
      outflow: !isInc ? amount : 0,
      userName: data.userName || data.createdByName || "النظام",
      source: "cashTransactions"
    });
  }

  // 2. Process Expenses (only if not already recorded in cashTransactions)
  for (const { id, data: exp } of exps) {
    const expId = id.toUpperCase();
    const expIdShort = expId.slice(0, 6);
    const expCode = (exp.code || "").toUpperCase();

    if (processedVoucherKeys.has(expId) || processedVoucherKeys.has(expIdShort) || (expCode && processedVoucherKeys.has(expCode))) {
      continue;
    }

    processedVoucherKeys.add(expId);
    processedVoucherKeys.add(expIdShort);
    if (expCode) processedVoucherKeys.add(expCode);

    const dt = _parseStatementDateTime(exp);
    const amount = Number(exp.amount || 0);
    const beneficiary = exp.supplierName || exp.accountName || exp.category || "جهة الصرف";

    rawItems.push({
      id,
      timestamp: dt.timestamp,
      date: dt.isoDate,
      displayDate: formatDate(dt.isoDate),
      ref: exp.code || `PV-${id.slice(0, 6).toUpperCase()}`,
      type: "out",
      badgeText: "سند صرف",
      badgeClass: "bad",
      icon: "📤",
      notes: `صرف لصالح: ${beneficiary} — ${exp.notes || ''}`,
      inflow: 0,
      outflow: amount,
      userName: exp.createdByName || "النظام",
      source: "expenses"
    });
  }

  // 3. Process Receipts (only if not already in cashTransactions)
  for (const { id, data: rcpt } of rcpts) {
    const rcptId = id.toUpperCase();
    const rcptIdShort = rcptId.slice(0, 6);
    const rcptCode = (rcpt.code || rcpt.displayCode || "").toUpperCase();

    if (processedVoucherKeys.has(rcptId) || processedVoucherKeys.has(rcptIdShort) || (rcptCode && processedVoucherKeys.has(rcptCode))) {
      continue;
    }

    processedVoucherKeys.add(rcptId);
    processedVoucherKeys.add(rcptIdShort);
    if (rcptCode) processedVoucherKeys.add(rcptCode);

    const dt = _parseStatementDateTime(rcpt);
    const amount = Number(rcpt.amount || 0);
    const customer = rcpt.customerName || rcpt.accountName || "عميل";

    rawItems.push({
      id,
      timestamp: dt.timestamp,
      date: dt.isoDate,
      displayDate: formatDate(dt.isoDate),
      ref: rcpt.displayCode || rcpt.code || `RV-${id.slice(0, 6).toUpperCase()}`,
      type: "in",
      badgeText: "سند قبض",
      badgeClass: "good",
      icon: "📥",
      notes: `تحصيل من: ${customer} — ${rcpt.notes || ''}`,
      inflow: amount,
      outflow: 0,
      userName: rcpt.createdByName || "النظام",
      source: "receipts"
    });
  }

  // 4. Process Manual/Direct Journal Entries ONLY
  if (boxAccountCode || box.accountId || box.name) {
    for (const { id, data: je } of jvs) {
      if (je.status === "cancelled" || je.isReversed) continue;
      if (je.sourceType === "expense" || je.sourceType === "receipt" || je.sourceType === "cashTransaction") continue;
      if (je.sourceId) {
        const sId = String(je.sourceId).toUpperCase();
        if (processedVoucherKeys.has(sId) || (sId.length >= 6 && processedVoucherKeys.has(sId.slice(0, 6)))) continue;
      }

      (je.lines || []).forEach((l, idx) => {
        const matchesBox =
          (boxAccountCode && l.accountCode === boxAccountCode) ||
          (box.accountId && l.accountId === box.accountId) ||
          (box.name && l.accountName && l.accountName.includes(box.name));

        if (matchesBox) {
          const lineKey = `JE_DOC_${id}_L${idx}`;
          if (processedVoucherKeys.has(lineKey)) return;
          processedVoucherKeys.add(lineKey);

          const dr = Number(l.debit || 0);
          const cr = Number(l.credit || 0);
          const dt = _parseStatementDateTime(je);
          const jvCode = je.code || je.entryNumber || `JE-${id.slice(0, 6).toUpperCase()}`;

          if (dr > 0) {
            rawItems.push({
              id: `${id}_${idx}`,
              timestamp: dt.timestamp,
              date: dt.isoDate,
              displayDate: formatDate(dt.isoDate),
              ref: jvCode,
              type: "in",
              badgeText: "قيد تسوية (+)",
              badgeClass: "good",
              icon: "⚖️",
              notes: `${je.description || l.note || 'إيداع بقيد يومية'}`,
              inflow: dr,
              outflow: 0,
              userName: je.createdByName || "النظام",
              source: "journalEntries"
            });
          } else if (cr > 0) {
            rawItems.push({
              id: `${id}_${idx}`,
              timestamp: dt.timestamp,
              date: dt.isoDate,
              displayDate: formatDate(dt.isoDate),
              ref: jvCode,
              type: "out",
              badgeText: "قيد تسوية (-)",
              badgeClass: "bad",
              icon: "⚖️",
              notes: `${je.description || l.note || 'سحب بقيد يومية'}`,
              inflow: 0,
              outflow: cr,
              userName: je.createdByName || "النظام",
              source: "journalEntries"
            });
          }
        }
      });
    }
  }

  // Strictly sort all items chronologically ascending (Oldest to Newest)
  rawItems.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.timestamp - b.timestamp;
  });

  let netBalance = 0;
  for (const item of rawItems) {
    netBalance += (Number(item.inflow || 0) - Number(item.outflow || 0));
  }
  netBalance = Math.round(netBalance * 100) / 100;

  return { items: rawItems, netBalance };
}

async function _fetchAndDeduplicateStatement(cashBoxId) {
  const box = cashBoxes.find(b => b.id === cashBoxId);
  if (!box) return null;

  const [txnsSnap, rcptsSnap, expsSnap, jvsSnap] = await Promise.all([
    getDocs(query(COLS.cashTransactions(), where("cashBoxId", "==", cashBoxId))),
    getDocs(query(COLS.receipts(), where("sourceId", "==", cashBoxId))),
    getDocs(query(COLS.expenses(), where("sourceId", "==", cashBoxId))),
    getAll(COLS.journalEntries())
  ]);

  const { items } = _buildDeduplicatedStatementFromData(box, txnsSnap, rcptsSnap, expsSnap, jvsSnap);
  return items;
}

function _isValidFourDigitDate(val) {
  if (!val) return false;
  const parts = val.trim().split("-");
  if (parts.length !== 3) return false;
  if (parts[0].length !== 4) return false;
  const year = parseInt(parts[0], 10);
  if (isNaN(year) || year < 2000 || year > 2099) return false;
  return true;
}

window.openCashBoxStatementModal = async (cashBoxId) => {
  const box = cashBoxes.find(b => b.id === cashBoxId);
  if (!box) return;

  _activeStatementBox = box;
  _activeStatementSort = "asc"; // Default to natural chronological accounting order
  _activeStatementFilterFrom = "";
  _activeStatementFilterTo = "";
  _activeStatementType = "";
  _activeStatementSearch = "";

  const titleEl = document.getElementById("cb-stmt-modal-title");
  const bodyEl = document.getElementById("cb-stmt-body");

  if (titleEl) titleEl.textContent = `📄 كشف حساب تفصيلي شامل — ${box.name}`;
  
  if (bodyEl) {
    bodyEl.innerHTML = `
      <!-- Top Box Info Card (Pure White High-Contrast Accounting Theme) -->
      <div style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:14px; padding:18px 22px; color:#0f172a; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
        <div>
          <div style="font-size:12px; color:#1d4ed8; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">كشف الحساب المالي التفصيلي الموحد</div>
          <h2 style="font-size:22px; font-weight:900; margin:4px 0 2px 0; color:#0f172a;">${box.name}</h2>
          <div style="font-size:13px; color:#334155; font-weight:600; margin-top:4px;">
            المسؤول: <strong style="color:#0f172a;">${box.keeper || "غير محدد"}</strong>
            ${box.accountCode ? ` | كود الحساب: <span style="font-family:monospace;font-weight:900;color:#0369a1;background:#f0f9ff;padding:2px 8px;border-radius:6px;border:1px solid #bae6fd;">${box.accountCode}</span>` : ''}
          </div>
        </div>
        <div id="cb-stmt-top-bal-container" style="text-align:left; background:#f0fdf4; padding:12px 20px; border-radius:12px; border:2px solid #86efac; box-shadow:0 2px 6px rgba(16,185,129,0.1); min-width:210px;">
          <div id="cb-stmt-top-bal-label" style="font-size:11.5px; color:#166534; font-weight:800;">الرصيد الفعلي الحالي بالخزينة</div>
          <div id="cb-stmt-top-bal-val" class="mono" style="font-size:24px; font-weight:900; direction:ltr; color:#15803d;">${formatCurrency(box.balance || 0)}</div>
          <div id="cb-stmt-top-bal-sub" style="font-size:11px; color:#15803d; font-weight:700; margin-top:3px; display:none;"></div>
        </div>
      </div>

      <!-- Statement Filters Bar (Static Container - Never destroyed on input change) -->
      <div style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:14px; padding:16px 20px; margin-bottom:18px; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
        <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:flex-end;">
          
          <!-- From Date -->
          <div style="flex:1; min-width:145px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label style="font-size:12px; font-weight:800; color:#0f172a; margin:0;">من تاريخ</label>
              <button type="button" onclick="clearStatementDate('from')" style="background:none; border:none; color:#64748b; font-size:11px; cursor:pointer; font-weight:800;" title="مسح">مسح ✖</button>
            </div>
            <input type="date" id="cb-stmt-from" class="input" style="font-size:13px; font-weight:700; color:#0f172a; background:#ffffff; border:1.5px solid #94a3b8; padding:7px 10px;" oninput="onStatementFilterChange()" onchange="onStatementFilterChange()" />
          </div>

          <!-- To Date -->
          <div style="flex:1; min-width:145px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label style="font-size:12px; font-weight:800; color:#0f172a; margin:0;">إلى تاريخ</label>
              <button type="button" onclick="clearStatementDate('to')" style="background:none; border:none; color:#64748b; font-size:11px; cursor:pointer; font-weight:800;" title="مسح">مسح ✖</button>
            </div>
            <input type="date" id="cb-stmt-to" class="input" style="font-size:13px; font-weight:700; color:#0f172a; background:#ffffff; border:1.5px solid #94a3b8; padding:7px 10px;" oninput="onStatementFilterChange()" onchange="onStatementFilterChange()" />
          </div>

          <!-- Movement Type -->
          <div style="flex:1; min-width:140px;">
            <label style="font-size:12px; font-weight:800; color:#0f172a; display:block; margin-bottom:4px;">نوع الحركة</label>
            <select id="cb-stmt-type" class="input" onchange="onStatementFilterChange()" style="font-size:12.5px; font-weight:700; color:#0f172a; background:#ffffff; border:1.5px solid #94a3b8; padding:7px 10px;">
              <option value="">كافة الحركات</option>
              <option value="in">📥 مقبوضات واردة (+)</option>
              <option value="out">📤 مدفوعات صادرة (-)</option>
              <option value="transfer">🔄 تحويلات ومناقلات</option>
            </select>
          </div>

          <!-- Chronological Sort Order -->
          <div style="flex:1; min-width:170px;">
            <label style="font-size:12px; font-weight:800; color:#0f172a; display:block; margin-bottom:4px;">ترتيب الحركات</label>
            <select id="cb-stmt-sort" class="input" onchange="onStatementFilterChange()" style="font-size:12.5px; font-weight:800; color:#0f172a; background:#f8fafc; border:1.5px solid #94a3b8; padding:7px 10px;">
              <option value="asc" selected>⬇️ من الأقدم للأحدث (محاسبي تراكمي)</option>
              <option value="desc">⬆️ من الأحدث للأقدم (الأحدث أولاً)</option>
            </select>
          </div>

          <!-- Search Query -->
          <div style="flex:1.5; min-width:180px;">
            <label style="font-size:12px; font-weight:800; color:#0f172a; display:block; margin-bottom:4px;">🔍 بحث بالبيان / المرجع</label>
            <input type="text" id="cb-stmt-search" class="input" placeholder="رقم السند، جهة الصرف، المندوب..." oninput="onStatementFilterChange()" style="font-size:12.5px; font-weight:600; color:#0f172a; background:#ffffff; border:1.5px solid #94a3b8; padding:7px 10px;" />
          </div>
        </div>

        <!-- Quick Period Presets -->
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; padding-top:12px; border-top:1px dashed #e2e8f0; align-items:center;">
          <span style="font-size:11.5px; font-weight:800; color:#475569;">تحديد سريع للمدة:</span>
          <button type="button" class="btn btn-secondary btn-sm" onclick="setStatementPreset('today')" style="font-size:11.5px; font-weight:800; padding:4px 12px; border:1px solid #93c5fd; background:#eff6ff; color:#1d4ed8;">📅 اليوم</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="setStatementPreset('yesterday')" style="font-size:11.5px; font-weight:800; padding:4px 12px; border:1px solid #cbd5e1; background:#f8fafc; color:#0f172a;">أمس</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="setStatementPreset('this_month')" style="font-size:11.5px; font-weight:800; padding:4px 12px; border:1px solid #cbd5e1; background:#f8fafc; color:#0f172a;">هذا الشهر</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="setStatementPreset('last_month')" style="font-size:11.5px; font-weight:800; padding:4px 12px; border:1px solid #cbd5e1; background:#f8fafc; color:#0f172a;">الشهر السابق</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="setStatementPreset('this_year')" style="font-size:11.5px; font-weight:800; padding:4px 12px; border:1px solid #cbd5e1; background:#f8fafc; color:#0f172a;">هذا العام</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="setStatementPreset('all')" style="font-size:11.5px; font-weight:800; padding:4px 12px; border:1px solid #cbd5e1; background:#f8fafc; color:#0f172a;">كل الفترات (شامل)</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="setStatementPreset('clear_dates')" style="font-size:11.5px; font-weight:800; padding:4px 12px; border:1px solid #fca5a5; background:#fff1f2; color:#be123c;">مسح التواريخ ✖</button>
        </div>
      </div>

      <!-- Dynamic Results Container (KPIs + Ledger Table rendered here only) -->
      <div id="cb-stmt-results-container">
        <div style="text-align:center; padding:50px;">
          <div class="loading-spinner" style="margin:0 auto 16px auto;"></div>
          <div style="font-weight:800; font-size:14px; color:#0f172a;">جاري تنقية وترتيب كشف الحساب المالي لـ ${box.name}…</div>
          <div style="font-size:12px; color:#64748b; margin-top:4px;">يتم الفحص ومنع التكرار وحساب الأرصدة التراكمية زمنياً بدقة</div>
        </div>
      </div>
    `;
  }

  openModal("cb-statement-modal");

  try {
    _activeStatementRawItems = await _fetchAndDeduplicateStatement(cashBoxId);
    _applyStatementFiltersAndRender();
  } catch (err) {
    console.error(err);
    const container = document.getElementById("cb-stmt-results-container");
    if (container) {
      container.innerHTML = `<div class="alert bad">حدث خطأ في تحميل كشف الحساب: ${err.message}</div>`;
    }
  }
};

function _applyStatementFiltersAndRender() {
  const container = document.getElementById("cb-stmt-results-container");
  const box = _activeStatementBox;
  if (!container || !box) return;

  const rawFrom = document.getElementById("cb-stmt-from")?.value || "";
  const rawTo   = document.getElementById("cb-stmt-to")?.value || "";

  // If user is actively typing an incomplete year (e.g. 0002-10-10), don't filter out data yet!
  const from = _isValidFourDigitDate(rawFrom) ? rawFrom : "";
  const to   = _isValidFourDigitDate(rawTo) ? rawTo : "";
  const typeFilter = document.getElementById("cb-stmt-type")?.value || "";
  const sortOrder  = document.getElementById("cb-stmt-sort")?.value || "asc";
  const searchQuery = (document.getElementById("cb-stmt-search")?.value || "").trim().toLowerCase();

  _activeStatementFilterFrom = from;
  _activeStatementFilterTo = to;
  _activeStatementType = typeFilter;
  _activeStatementSort = sortOrder;
  _activeStatementSearch = searchQuery;

  const isDateInverted = Boolean(from && to && from > to);

  // 1. Calculate opening balance before 'from' date
  let openingBal = 0;
  let periodItems = [];

  if (!isDateInverted) {
    for (const item of (_activeStatementRawItems || [])) {
      if (from && item.date < from) {
        openingBal += (item.inflow - item.outflow);
      } else {
        periodItems.push(item);
      }
    }

    // 2. Filter period items by 'to' date
    if (to) {
      periodItems = periodItems.filter(item => item.date <= to);
    }
  }

  // 3. Compute running balance sequentially from openingBal (strictly ascending order)
  let curBal = openingBal;
  let totalPeriodIn = 0;
  let totalPeriodOut = 0;

  periodItems.forEach(item => {
    totalPeriodIn += item.inflow;
    totalPeriodOut += item.outflow;
    curBal += (item.inflow - item.outflow);
    item.balanceAfter = curBal;
  });

  _activeStatementOpeningBal = openingBal;
  _activeStatementClosingBal = curBal;

  // 4. Filter for presentation (movement type and search query)
  let displayRows = [...periodItems];
  if (typeFilter === "in") displayRows = displayRows.filter(r => r.inflow > 0);
  if (typeFilter === "out") displayRows = displayRows.filter(r => r.outflow > 0);
  if (typeFilter === "transfer") displayRows = displayRows.filter(r => r.notes.includes("تحويل") || r.ref.startsWith("TR-"));

  if (searchQuery) {
    displayRows = displayRows.filter(r => 
      (r.notes || "").toLowerCase().includes(searchQuery) ||
      (r.ref || "").toLowerCase().includes(searchQuery) ||
      (r.userName || "").toLowerCase().includes(searchQuery)
    );
  }

  // Calculate totals of currently displayed/filtered rows
  const displayIn = displayRows.reduce((sum, r) => sum + (r.inflow || 0), 0);
  const displayOut = displayRows.reduce((sum, r) => sum + (r.outflow || 0), 0);
  const displayNet = displayIn - displayOut;
  const isTypeOrSearchFiltered = Boolean(typeFilter || searchQuery);

  // 5. Apply display sort order (preserving mathematical balanceAfter!)
  if (sortOrder === "desc") {
    displayRows.reverse();
  }

  _activeStatementRows = displayRows;

  // 6. Update Top Header Balance Card reactively
  const topValEl = document.getElementById("cb-stmt-top-bal-val");
  const topLblEl = document.getElementById("cb-stmt-top-bal-label");
  const topSubEl = document.getElementById("cb-stmt-top-bal-sub");

  if (topValEl && topLblEl) {
    if (from || to) {
      topLblEl.textContent = "رصيد إقفال الفترة المحددة";
      topValEl.textContent = formatCurrency(curBal);
      if (topSubEl) {
        topSubEl.style.display = "block";
        topSubEl.innerHTML = `الرصيد الفعلي الحالي بالخزينة الآن: <strong dir="ltr">${formatCurrency(box.balance || 0)}</strong>`;
      }
    } else {
      topLblEl.textContent = "الرصيد الفعلي الحالي بالخزينة";
      topValEl.textContent = formatCurrency(typeof curBal === 'number' ? curBal : (box.balance || 0));
      if (topSubEl) {
        topSubEl.style.display = "none";
      }
    }
  }

  container.innerHTML = `
    ${isDateInverted ? `
      <div class="alert warn" style="margin-bottom:14px; font-weight:800; background:#fffbeb; border:1.5px solid #fcd34d; color:#92400e; padding:10px 14px; border-radius:10px;">
        ⚠️ تنبيه: تاريخ البداية (${formatDate(from)}) يأتي بعد تاريخ النهاية (${formatDate(to)}). يرجى تعديل التواريخ لعرض الحركات بشكل سليم.
      </div>
    ` : ''}

    <!-- KPI Summary Cards Banner (High-Contrast Clean Theme) -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:18px;">
      
      <!-- 1. Opening Balance Card (Always rendered for accounting continuity) -->
      <div style="background:#ffffff; border:2px solid #94a3b8; border-radius:12px; padding:12px 14px; text-align:center; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
        <div style="font-size:11.5px; color:#334155; font-weight:800;">
          📦 الرصيد الافتتاحي ${from ? `(قبل ${formatDate(from)})` : '(بداية التعامل)'}
        </div>
        <div class="mono" style="font-size:18px; font-weight:900; margin-top:4px; color:#0f172a;">${formatCurrency(openingBal)}</div>
        <div style="font-size:10.5px; color:#64748b; margin-top:2px;">${from ? 'منقول من الحركات السابقة' : 'رصيد الانطلاق التأسيسي'}</div>
      </div>

      <!-- 2. Inflows Card -->
      <div style="background:#f0fdf4; border:2px solid #16a34a; border-radius:12px; padding:12px 14px; text-align:center; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
        <div style="font-size:11.5px; color:#166534; font-weight:800;">📥 إجمالي المقبوضات (+)</div>
        <div class="mono" style="font-size:18px; font-weight:900; margin-top:4px; color:#15803d;">
          +${formatCurrency(isTypeOrSearchFiltered ? displayIn : totalPeriodIn)}
        </div>
        <div style="font-size:10.5px; color:#166534; margin-top:2px;">
          ${isTypeOrSearchFiltered ? `المعروض: ${displayRows.filter(r => r.inflow > 0).length} حركة` : `كافة مقبوضات الفترة (${periodItems.filter(r => r.inflow > 0).length})`}
        </div>
      </div>

      <!-- 3. Outflows Card -->
      <div style="background:#fef2f2; border:2px solid #dc2626; border-radius:12px; padding:12px 14px; text-align:center; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
        <div style="font-size:11.5px; color:#991b1b; font-weight:800;">📤 إجمالي المدفوعات (-)</div>
        <div class="mono" style="font-size:18px; font-weight:900; margin-top:4px; color:#dc2626;">
          -${formatCurrency(isTypeOrSearchFiltered ? displayOut : totalPeriodOut)}
        </div>
        <div style="font-size:10.5px; color:#991b1b; margin-top:2px;">
          ${isTypeOrSearchFiltered ? `المعروض: ${displayRows.filter(r => r.outflow > 0).length} حركة` : `كافة مدفوعات الفترة (${periodItems.filter(r => r.outflow > 0).length})`}
        </div>
      </div>

      <!-- 4. Net Movement Card -->
      <div style="background:#eff6ff; border:2px solid #2563eb; border-radius:12px; padding:12px 14px; text-align:center; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
        <div style="font-size:11.5px; color:#1e40af; font-weight:800;">⚖️ صافي حركة ${isTypeOrSearchFiltered ? 'المعروض' : 'الفترة'}</div>
        <div class="mono" style="font-size:18px; font-weight:900; margin-top:4px; color:${(isTypeOrSearchFiltered ? displayNet : (totalPeriodIn - totalPeriodOut)) >= 0 ? '#15803d' : '#dc2626'};">
          ${(isTypeOrSearchFiltered ? displayNet : (totalPeriodIn - totalPeriodOut)) >= 0 ? '+' : ''}${formatCurrency(isTypeOrSearchFiltered ? displayNet : (totalPeriodIn - totalPeriodOut))}
        </div>
        <div style="font-size:10.5px; color:#1e40af; margin-top:2px;">
          ${(isTypeOrSearchFiltered ? displayNet : (totalPeriodIn - totalPeriodOut)) >= 0 ? 'فائض مقبوضات واردة' : 'عجز / زيادة منصرف'}
        </div>
      </div>

      <!-- 5. Closing / Period End Balance Card -->
      <div style="background:#f8fafc; border:2px solid #0f172a; border-radius:12px; padding:12px 14px; text-align:center; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
        <div style="font-size:11.5px; color:#0f172a; font-weight:900;">
          💵 ${to ? `رصيد إقفال (${formatDate(to)})` : 'الرصيد الختامي للصندوق'}
        </div>
        <div class="mono" style="font-size:19px; font-weight:900; margin-top:4px; color:#0f172a;">
          ${formatCurrency(curBal)}
        </div>
        <div style="font-size:10.5px; color:#475569; margin-top:2px;">
          ${to ? 'الرصيد التراكمي في نهاية التاريخ' : 'رصيد الخزينة الحالي التراكمي'}
        </div>
      </div>
    </div>

    <!-- Statement Table -->
    <div class="table-container" style="background:#ffffff; border-radius:14px; border:1.5px solid #cbd5e1; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.04);">
      <table class="data-dense" style="width:100%; font-size:12.5px; border-collapse:collapse;">
        <thead>
          <tr style="background:#0f172a; color:#ffffff !important;">
            <th style="padding:11px 12px; width:45px; text-align:center; color:#ffffff !important; font-weight:800;">#</th>
            <th style="padding:11px 12px; width:100px; color:#ffffff !important; font-weight:800;">التاريخ</th>
            <th style="padding:11px 12px; width:110px; color:#ffffff !important; font-weight:800;">المرجع</th>
            <th style="padding:11px 12px; width:135px; color:#ffffff !important; font-weight:800;">نوع الحركة</th>
            <th style="padding:11px 12px; color:#ffffff !important; font-weight:800;">البيان التفصيلي والجهة</th>
            <th style="padding:11px 12px; text-align:left; width:115px; color:#ffffff !important; font-weight:800;">وارد (+)</th>
            <th style="padding:11px 12px; text-align:left; width:115px; color:#ffffff !important; font-weight:800;">صادر (-)</th>
            <th style="padding:11px 12px; text-align:left; width:130px; color:#ffffff !important; font-weight:800;">الرصيد التراكمي</th>
            <th style="padding:11px 12px; width:85px; color:#ffffff !important; font-weight:800;">المسؤول</th>
            <th style="padding:11px 12px; width:105px; color:#ffffff !important; font-weight:800; text-align:center;">طباعة السند</th>
          </tr>
        </thead>
        <tbody>
          ${from && sortOrder === 'asc' ? `
            <tr style="background:#f8fafc; border-bottom:2px solid #cbd5e1; font-weight:800;">
              <td style="text-align:center;color:#64748b;">•</td>
              <td class="mono" style="color:#0f172a; font-weight:800;">${formatDate(from)}</td>
              <td class="mono" style="color:#475569;">OPENING</td>
              <td><span style="background:#e2e8f0;color:#0f172a;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:800;border:1px solid #cbd5e1;">📦 رصيد افتتاحي</span></td>
              <td style="color:#0f172a; font-weight:700;">الرصيد الافتتاحي المنقول قبل تاريخ ${formatDate(from)}</td>
              <td style="text-align:left;color:#94a3b8;">—</td>
              <td style="text-align:left;color:#94a3b8;">—</td>
              <td class="mono" style="text-align:left;">
                <span dir="ltr" style="background:#ffffff; border:2px solid #0284c7; padding:3px 10px; border-radius:6px; font-weight:900; color:#0369a1; display:inline-block;">
                  ${formatCurrency(openingBal)}
                </span>
              </td>
              <td style="color:#64748b; font-weight:700;">النظام</td>
              <td></td>
            </tr>
          ` : ''}

          ${displayRows.length ? displayRows.map((r, idx) => `
            <tr style="border-bottom:1px solid #e2e8f0; background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; transition:background 0.15s ease;">
              <td style="text-align:center; color:#64748b; font-size:11.5px; padding:10px 8px; font-weight:700;">${idx + 1}</td>
              <td class="mono font-bold" style="font-size:12.5px; padding:10px; color:#0f172a;">${r.displayDate}</td>
              <td class="mono" style="font-size:11.5px; padding:10px;">
                <span dir="ltr" style="background:#f1f5f9; padding:3px 8px; border-radius:6px; font-weight:800; color:#0f172a; border:1px solid #cbd5e1;">${r.ref}</span>
              </td>
              <td style="padding:10px;">
                <span style="display:inline-flex; align-items:center; gap:5px; background:${r.inflow ? '#ecfdf5' : '#fef2f2'}; color:${r.inflow ? '#15803d' : '#991b1b'}; padding:4px 9px; border-radius:6px; font-weight:800; font-size:11px; border:1px solid ${r.inflow ? '#86efac' : '#fca5a5'};">
                  <span>${r.icon}</span> <span>${r.badgeText}</span>
                </span>
              </td>
              <td style="font-size:12.5px; color:#0f172a; font-weight:700; padding:10px;">${r.notes}</td>
              <td class="mono font-bold" style="text-align:left; font-size:13.5px; padding:10px; color:#15803d;">${r.inflow ? '+' + formatCurrency(r.inflow) : '—'}</td>
              <td class="mono font-bold" style="text-align:left; font-size:13.5px; padding:10px; color:#dc2626;">${r.outflow ? '-' + formatCurrency(r.outflow) : '—'}</td>
              <td class="mono font-bold" style="text-align:left; font-size:13.5px; padding:10px;">
                <span dir="ltr" style="display:inline-block; direction:ltr; background:#ffffff; padding:4px 10px; border-radius:6px; border:2px solid #0f172a; color:#0f172a; font-weight:900;">
                  ${formatCurrency(r.balanceAfter)}
                </span>
              </td>
              <td style="font-size:11.5px; color:#475569; padding:10px; font-weight:600;">${r.userName || "النظام"}</td>
              <td style="text-align:center; padding:6px 8px;">
                <button type="button" class="btn btn-sm" onclick="printCashTxnVoucher('${r.id || r.ref}')"
                  title="${r.inflow ? 'طباعة سند قبض واستلام' : 'طباعة سند صرف وإقرار استلام'}"
                  style="font-size:11px;font-weight:800;padding:4px 8px;border-radius:7px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;${r.inflow ? 'background:#ecfdf5;color:#047857;border:1px solid #86efac;' : 'background:#fef2f2;color:#dc2626;border:1px solid #fca5a5;'}">
                  <span>🖨️</span> <span>${r.inflow ? 'سند قبض' : 'سند صرف'}</span>
                </button>
              </td>
            </tr>
          `).join("") : `<tr><td colspan="10" style="text-align:center; padding:40px; color:#475569; font-weight:800; font-size:14px;">لا توجد حركات مطابقة للفترة والتصفية المحددة</td></tr>`}
        </tbody>
        <tfoot style="background:#f1f5f9; border-top:2.5px solid #0f172a; font-weight:900;">
          <tr>
            <td colspan="5" style="padding:14px 16px; font-size:13px; color:#0f172a; font-weight:900;">
              إجمالي الحركات المعروضة بالجدول (${displayRows.length} حركة):
            </td>
            <td class="mono" style="text-align:left; font-size:14px; padding:14px 10px; color:#15803d; font-weight:900;">+${formatCurrency(displayIn)}</td>
            <td class="mono" style="text-align:left; font-size:14px; padding:14px 10px; color:#dc2626; font-weight:900;">-${formatCurrency(displayOut)}</td>
            <td class="mono" style="text-align:left; font-size:14px; padding:14px 10px; color:#0f172a; font-weight:900;">
              <span dir="ltr">${formatCurrency(curBal)}</span>
            </td>
            <td></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

window.renderActiveStatementView = () => {
  _applyStatementFiltersAndRender();
};

let _stmtFilterTimeout = null;
window.onStatementFilterChange = () => {
  if (_stmtFilterTimeout) clearTimeout(_stmtFilterTimeout);
  _stmtFilterTimeout = setTimeout(() => {
    _applyStatementFiltersAndRender();
  }, 100);
};

window.clearStatementDate = (which) => {
  if (which === "from") {
    const el = document.getElementById("cb-stmt-from");
    if (el) el.value = "";
  } else if (which === "to") {
    const el = document.getElementById("cb-stmt-to");
    if (el) el.value = "";
  }
  _applyStatementFiltersAndRender();
};

window.setStatementPreset = (preset) => {
  const fromEl = document.getElementById("cb-stmt-from");
  const toEl = document.getElementById("cb-stmt-to");
  const now = new Date();
  const formatYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const todayStr = formatYMD(now);

  if (preset === "all" || preset === "clear_dates") {
    if (fromEl) fromEl.value = "";
    if (toEl) toEl.value = "";
  } else if (preset === "today") {
    if (fromEl) fromEl.value = todayStr;
    if (toEl) toEl.value = todayStr;
  } else if (preset === "yesterday") {
    const yest = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yestStr = formatYMD(yest);
    if (fromEl) fromEl.value = yestStr;
    if (toEl) toEl.value = yestStr;
  } else if (preset === "this_month") {
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    if (fromEl) fromEl.value = `${yyyy}-${mm}-01`;
    if (toEl) toEl.value = todayStr;
  } else if (preset === "last_month") {
    const yyyy = now.getFullYear();
    const prevDate = new Date(yyyy, now.getMonth() - 1, 1);
    const pY = prevDate.getFullYear();
    const pM = String(prevDate.getMonth() + 1).padStart(2, "0");
    const lastDay = new Date(pY, prevDate.getMonth() + 1, 0).getDate();
    if (fromEl) fromEl.value = `${pY}-${pM}-01`;
    if (toEl) toEl.value = `${pY}-${pM}-${String(lastDay).padStart(2, "0")}`;
  } else if (preset === "this_year") {
    const yyyy = now.getFullYear();
    if (fromEl) fromEl.value = `${yyyy}-01-01`;
    if (toEl) toEl.value = todayStr;
  }
  _applyStatementFiltersAndRender();
};

window.exportCashBoxStatementToExcel = async () => {
  if (!_activeStatementBox || !_activeStatementRows) {
    showToast("لا توجد بيانات متاحة للتصدير", "warning");
    return;
  }

  const box = _activeStatementBox;
  const rows = _activeStatementRows;

  const excelRows = rows.map((r, idx) => [
    idx + 1,
    r.date,
    r.ref,
    r.badgeText,
    r.notes,
    r.inflow || 0,
    r.outflow || 0,
    r.balanceAfter || 0,
    r.userName || "النظام"
  ]);

  // Append totals row
  const sumIn = rows.reduce((s, r) => s + (r.inflow || 0), 0);
  const sumOut = rows.reduce((s, r) => s + (r.outflow || 0), 0);
  excelRows.push([
    "الإجمالي",
    "",
    "",
    "",
    `عدد الحركات: ${rows.length}`,
    sumIn,
    sumOut,
    typeof _activeStatementClosingBal === 'number' ? _activeStatementClosingBal : 0,
    ""
  ]);

  await exportToExcel({
    title: `كشف_حساب_${box.name.replace(/\s+/g, '_')}`,
    headers: [
      "م",
      "التاريخ",
      "رقم السند/المرجع",
      "نوع الحركة",
      "البيان والتفاصيل",
      "وارد (+)",
      "صادر (-)",
      "الرصيد التراكمي",
      "المسؤول"
    ],
    rows: excelRows,
    colWidths: [6, 14, 16, 16, 40, 14, 14, 16, 14],
    user: box.keeper || "نظام إدهام"
  });

  showToast("تم تصدير كشف الحساب إلى Excel بنجاح", "success");
};

window.printCashBoxStatementOfficial = () => {
  if (!_activeStatementBox || !_activeStatementRows) return;
  const win = window.open("", "_blank", "width=950,height=800");
  const box = _activeStatementBox;
  const rows = _activeStatementRows;
  const from = _activeStatementFilterFrom;
  const to = _activeStatementFilterTo;
  const openingBal = _activeStatementOpeningBal || 0;
  const closingBal = typeof _activeStatementClosingBal === 'number' ? _activeStatementClosingBal : (box.balance || 0);

  const totalIn = rows.reduce((s, r) => s + (r.inflow || 0), 0);
  const totalOut = rows.reduce((s, r) => s + (r.outflow || 0), 0);
  const netMov = totalIn - totalOut;

  win.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>كشف حساب رسمي — ${box.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Cairo',sans-serif; direction:rtl; padding:25px; background:#fff; color:#0f172a; }
    .header-box { background:#f8fafc; color:#0f172a; padding:18px 22px; border-radius:12px; margin-bottom:18px; display:flex; justify-content:space-between; align-items:center; border:2px solid #0f172a; }
    .kpi-row { display:flex; gap:10px; margin-bottom:18px; }
    .kpi-card { flex:1; padding:10px; border-radius:8px; border:1.5px solid #cbd5e1; text-align:center; background:#f8fafc; }
    table { width:100%; border-collapse:collapse; margin-top:10px; font-size:11.5px; }
    th { background:#f1f5f9; color:#1e293b; padding:8px 10px; font-weight:800; text-align:right; border-bottom:2px solid #cbd5e1; }
    td { padding:8px 10px; border-bottom:1px solid #e2e8f0; }
    .mono { font-family:monospace; font-weight:700; }
    @media print {
      body { padding:0; }
      .header-box { background:#f8fafc !important; color:#0f172a !important; border:2px solid #0f172a !important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div>
      <h1 style="font-size:20px;font-weight:900;color:#0f172a;">مؤسسة إدهام للمواد الغذائية</h1>
      <h2 style="font-size:16px;font-weight:800;color:#1d4ed8;margin-top:3px;">كشف حساب رسمي: ${box.name}</h2>
      <div style="font-size:12px;color:#334155;margin-top:3px;font-weight:600;">
        المسؤول: <strong style="color:#0f172a;">${box.keeper || "—"}</strong>
        ${box.accountCode ? `| كود الحساب: <strong>${box.accountCode}</strong>` : ''} 
        | الفترة: <strong>${from ? formatDate(from) : "بداية التعامل"}</strong> إلى <strong>${to ? formatDate(to) : "اليوم"}</strong>
      </div>
    </div>
    <div style="text-align:left;background:#f0fdf4;padding:10px 18px;border-radius:10px;border:1.5px solid #86efac;">
      <div style="font-size:11px;color:#166534;font-weight:800;">${(from || to) ? 'رصيد إقفال الفترة المحددة' : 'الرصيد الفعلي الحالي بالخزينة'}</div>
      <div class="mono" style="font-size:22px;font-weight:900;direction:ltr;color:#15803d;">${formatCurrency(closingBal)}</div>
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi-card" style="background:#ffffff;border-color:#94a3b8;">
      <div style="font-size:10.5px;color:#334155;font-weight:800;">الرصيد الافتتاحي ${from ? `(قبل ${formatDate(from)})` : '(البداية)'}</div>
      <div class="mono" style="font-size:15px;font-weight:900;color:#0f172a;">${formatCurrency(openingBal)}</div>
    </div>
    <div class="kpi-card" style="background:#ecfdf5;border-color:#a7f3d0;">
      <div style="font-size:10.5px;color:#047857;font-weight:800;">إجمالي المقبوضات (+)</div>
      <div class="mono" style="font-size:15px;font-weight:900;color:#047857;">+${formatCurrency(totalIn)}</div>
    </div>
    <div class="kpi-card" style="background:#fef2f2;border-color:#fecaca;">
      <div style="font-size:10.5px;color:#dc2626;font-weight:800;">إجمالي المدفوعات (-)</div>
      <div class="mono" style="font-size:15px;font-weight:900;color:#dc2626;">-${formatCurrency(totalOut)}</div>
    </div>
    <div class="kpi-card" style="background:#eff6ff;border-color:#bfdbfe;">
      <div style="font-size:10.5px;color:#1d4ed8;font-weight:800;">صافي الحركة</div>
      <div class="mono" style="font-size:15px;font-weight:900;color:${netMov >= 0 ? '#15803d' : '#dc2626'};">${netMov >= 0 ? '+' : ''}${formatCurrency(netMov)}</div>
    </div>
    <div class="kpi-card" style="background:#f8fafc;border-color:#0f172a;">
      <div style="font-size:10.5px;color:#0f172a;font-weight:900;">${to ? `رصيد إقفال (${formatDate(to)})` : 'الرصيد الختامي'}</div>
      <div class="mono" style="font-size:15px;font-weight:900;color:#0f172a;">${formatCurrency(closingBal)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:30px;">#</th>
        <th style="width:90px;">التاريخ</th>
        <th style="width:90px;">المرجع</th>
        <th style="width:110px;">نوع الحركة</th>
        <th>البيان والتفاصيل</th>
        <th style="text-align:left;width:100px;">وارد (+)</th>
        <th style="text-align:left;width:100px;">صادر (-)</th>
        <th style="text-align:left;width:115px;">الرصيد التراكمي</th>
      </tr>
    </thead>
    <tbody>
      ${from && _activeStatementSort !== 'desc' ? `
        <tr style="background:#f8fafc;font-weight:800;border-bottom:1.5px solid #cbd5e1;">
          <td style="text-align:center;">•</td>
          <td class="mono">${formatDate(from)}</td>
          <td class="mono">OPENING</td>
          <td><strong>📦 رصيد افتتاحي</strong></td>
          <td>الرصيد الافتتاحي المنقول قبل تاريخ ${formatDate(from)}</td>
          <td style="text-align:left;color:#94a3b8;">—</td>
          <td style="text-align:left;color:#94a3b8;">—</td>
          <td class="mono" style="text-align:left;font-weight:900;" dir="ltr">${formatCurrency(openingBal)}</td>
        </tr>
      ` : ''}
      ${rows.map((r, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td class="mono">${r.displayDate}</td>
          <td class="mono" dir="ltr">${r.ref}</td>
          <td><strong>${r.badgeText}</strong></td>
          <td>${r.notes}</td>
          <td class="mono" style="text-align:left;color:#047857;">${r.inflow ? '+' + formatCurrency(r.inflow) : '—'}</td>
          <td class="mono" style="text-align:left;color:#dc2626;">${r.outflow ? '-' + formatCurrency(r.outflow) : '—'}</td>
          <td class="mono" style="text-align:left;font-weight:900;" dir="ltr">${formatCurrency(r.balanceAfter)}</td>
        </tr>
      `).join("")}
    </tbody>
    <tfoot>
      <tr style="background:#f1f5f9;font-weight:900;border-top:2px solid #0f172a;">
        <td colspan="5">الإجمالي العام (${rows.length} حركة):</td>
        <td class="mono" style="text-align:left;color:#047857;">+${formatCurrency(totalIn)}</td>
        <td class="mono" style="text-align:left;color:#dc2626;">-${formatCurrency(totalOut)}</td>
        <td class="mono" style="text-align:left;" dir="ltr">${formatCurrency(closingBal)}</td>
      </tr>
    </tfoot>
  </table>

  <div style="margin-top:40px;padding-top:15px;border-top:1px dashed #94a3b8;display:flex;justify-content:space-between;font-size:11.5px;color:#475569;">
    <div><strong>أمين الصندوق / المسؤول:</strong> .....................................</div>
    <div><strong>المحاسب المالي:</strong> .....................................</div>
    <div><strong>اعتماد الإدارة:</strong> .....................................</div>
  </div>
</body>
</html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); win.close(); }, 600);
};

// ─────────────────────────────────────────────────────────────────────────────
// Modal Forms Implementation
// ─────────────────────────────────────────────────────────────────────────────
window.openCashBoxModal = (id = "") => {
  const opGroup = document.getElementById("cb-opening")?.closest(".form-group");
  const coaWrap = document.getElementById("cb-coa-toggle-wrap");
  
  if (id) {
    const cb = cashBoxes.find(x => x.id === id);
    if (!cb) return;
    document.getElementById("cb-edit-id").value = cb.id;
    document.getElementById("cb-name").value = cb.name || "";
    document.getElementById("cb-keeper").value = cb.keeper || "";
    document.getElementById("cb-type").value = cb.type || "main";
    document.getElementById("cb-opening").value = cb.openingBalance || 0;
    
    if (opGroup) opGroup.style.display = "none";
    if (coaWrap) coaWrap.style.display = "none";
  } else {
    document.getElementById("cb-edit-id").value = "";
    document.getElementById("cb-name").value = "";
    document.getElementById("cb-keeper").value = "";
    document.getElementById("cb-type").value = "main";
    document.getElementById("cb-opening").value = "";
    
    if (opGroup) opGroup.style.display = "block";
    if (coaWrap) coaWrap.style.display = "flex";
  }
  
  document.getElementById("cb-error").classList.add("hidden");
  openModal("cb-modal");
};

window.saveCashBox = async () => {
  const errEl = document.getElementById("cb-error");
  errEl.classList.add("hidden");

  const editId = document.getElementById("cb-edit-id").value;
  const name   = document.getElementById("cb-name").value.trim();
  const type   = document.getElementById("cb-type").value;
  const keeper = document.getElementById("cb-keeper").value.trim();
  const openingBalance = parseFloat(document.getElementById("cb-opening")?.value) || 0;
  const createCoa = document.getElementById("cb-coa-toggle")?.checked ?? true;

  if (!name) { errEl.textContent = "يرجى أدخال اسم الصندوق / العهدة"; errEl.classList.remove("hidden"); return; }

  const btn = document.getElementById("save-cb-btn");
  btn.disabled = true;

  try {
    if (editId) {
      const cb = cashBoxes.find(x => x.id === editId);
      await update(COLS.cashBoxes(), editId, { name, type, keeper });
      if (cb?.accountId) {
        await update(COLS.chartOfAccounts(), cb.accountId, { name });
      }
      showToast("تم تحديث بيانات الصندوق بنجاح", "success");
    } else {
      let accountId = null;
      let accountCode = null;

      if (createCoa) {
        const parentCode = type === "owner_current" ? "3-1-4" : "1-1-1-2";
        const coaDoc = await syncEntityToCoa({
          entityId: "temp",
          entityType: "cashBox",
          name,
          parentCode
        });
        if (coaDoc) {
          accountId = coaDoc.id || coaDoc.accountId;
          accountCode = coaDoc.code || coaDoc.accountCode;
        }
      }

      const newCb = await create(COLS.cashBoxes(), {
        name,
        type,
        keeper,
        openingBalance,
        balance: openingBalance,
        accountId,
        accountCode
      });

      if (accountId && newCb?.id) {
        await update(COLS.chartOfAccounts(), accountId, { sourceEntityId: newCb.id });
      }

      showToast("تم إضافة الصندوق النقدي بنجاح", "success");
    }

    closeModal("cb-modal");
    await Promise.all([
      clearERPCache(COLS.cashBoxes().path),
      clearERPCache(COLS.chartOfAccounts().path)
    ]);
    await loadCashBoxes();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally { btn.disabled = false; }
};

window.deleteCashBox = async (id, name) => {
  const confirmed = await window.showConfirm?.(`هل أنت متأكد من حذف ${name}؟`, "حذف الصندوق");
  if (!confirmed) return;

  try {
    const cb = cashBoxes.find(x => x.id === id);
    await remove(COLS.cashBoxes(), id);
    if (cb?.accountId) {
      await deleteEntityInCoa(cb.accountId);
    }
    showToast("تم حذف الصندوق بنجاح", "success");
    await Promise.all([
      clearERPCache(COLS.cashBoxes().path),
      clearERPCache(COLS.chartOfAccounts().path)
    ]);
    await loadCashBoxes();
  } catch (err) {
    showToast("خطأ في الحذف: " + err.message, "error");
  }
};

window.toggleTxnTypeFields = () => {
  const type = document.getElementById("ctxn-type").value;
  const wrap = document.getElementById("ctxn-target-box-wrap");
  const selTarget = document.getElementById("ctxn-target-box");
  const sourceBoxId = document.getElementById("ctxn-box").value;

  if (type === "transfer") {
    wrap.classList.remove("hidden");
    const targets = cashBoxes.filter(b => b.id !== sourceBoxId);
    selTarget.innerHTML = targets.map(b => `<option value="${b.id}">${b.name}</option>`).join("");
  } else {
    wrap.classList.add("hidden");
  }
};

window.openCashTxnModal = () => {
  const sel = document.getElementById("ctxn-box");
  if (cashBoxes.length === 0) { showToast("قم بإضافة صندوق نقدي أولاً", "warning"); return; }
  sel.innerHTML = cashBoxes.map(b => `<option value="${b.id}">${b.name} (${formatCurrency(b.balance || 0)})</option>`).join("");
  document.getElementById("ctxn-type").value = "in";
  document.getElementById("ctxn-amount").value = "";
  document.getElementById("ctxn-notes").value = "";
  document.getElementById("ctxn-error").classList.add("hidden");
  toggleTxnTypeFields();
  openModal("cb-txn-modal");
};

window.saveCashTxn = async () => {
  const errEl = document.getElementById("ctxn-error");
  errEl.classList.add("hidden");

  const boxId  = document.getElementById("ctxn-box").value;
  const type   = document.getElementById("ctxn-type").value;
  const amount = parseFloat(document.getElementById("ctxn-amount").value) || 0;
  const notes  = document.getElementById("ctxn-notes").value.trim();

  if (!boxId) { errEl.textContent = "اختر الصندوق"; errEl.classList.remove("hidden"); return; }
  if (amount <= 0) { errEl.textContent = "المبلغ غير صحيح"; errEl.classList.remove("hidden"); return; }
  if (!notes) { errEl.textContent = "أدخل البيان"; errEl.classList.remove("hidden"); return; }

  const btn = document.getElementById("save-ctxn-btn");
  btn.disabled = true;

  try {
    if (type === "transfer") {
      const targetBoxId = document.getElementById("ctxn-target-box").value;
      if (!targetBoxId) throw new Error("اختر الصندوق المستلم");
      if (targetBoxId === boxId) throw new Error("لا يمكن التحويل لنفس الصندوق");

      const sourceRef = doc(db, `companies/${COMPANY_ID}/cashBoxes`, boxId);
      const targetRef = doc(db, `companies/${COMPANY_ID}/cashBoxes`, targetBoxId);
      
      let sourceBalAfter = 0;
      let targetBalAfter = 0;
      let sourceName = "";
      let targetName = "";
      let sourceCode = "";
      let targetCode = "";

      await runTransaction(db, async (tx) => {
        const sourceSnap = await tx.get(sourceRef);
        const targetSnap = await tx.get(targetRef);

        if (!sourceSnap.exists()) throw new Error("الصندوق المرسل غير موجود");
        if (!targetSnap.exists()) throw new Error("الصندوق المستلم غير موجود");

        const sourceData = sourceSnap.data();
        const targetData = targetSnap.data();

        const sCurrent = sourceData.balance || 0;
        const tCurrent = targetData.balance || 0;

        sourceName = sourceData.name;
        targetName = targetData.name;
        sourceCode = sourceData.accountCode || "1-1-1-1-3";
        targetCode = targetData.accountCode || "1-1-1-1-3";

        if (sCurrent < amount) throw new Error(`رصيد الصندوق المرسل غير كافٍ: ${sCurrent} < ${amount}`);

        sourceBalAfter = sCurrent - amount;
        targetBalAfter = tCurrent + amount;

        tx.update(sourceRef, { balance: sourceBalAfter, updatedAt: serverTimestamp() });
        tx.update(targetRef, { balance: targetBalAfter, updatedAt: serverTimestamp() });

        const txn1Ref = doc(collection(db, `companies/${COMPANY_ID}/cashTransactions`));
        tx.set(txn1Ref, {
          cashBoxId: boxId,
          type: "out",
          amount,
          notes: `تحويل إلى ${targetName} — ${notes}`,
          balanceAfter: sourceBalAfter,
          createdAt: serverTimestamp(),
        });

        const txn2Ref = doc(collection(db, `companies/${COMPANY_ID}/cashTransactions`));
        tx.set(txn2Ref, {
          cashBoxId: targetBoxId,
          type: "in",
          amount,
          notes: `تحويل من ${sourceName} — ${notes}`,
          balanceAfter: targetBalAfter,
          createdAt: serverTimestamp(),
        });
      });

      try {
        await createJournalEntry({
          date:        new Date().toISOString().split('T')[0],
          description: `تحويل نقدي من صندوق ${sourceName} إلى ${targetName} — ${notes}`,
          sourceType:  'cashTransaction',
          lines: [
            { accountCode: targetCode, accountName: targetName, debit: amount, credit: 0 },
            { accountCode: sourceCode, accountName: sourceName, debit: 0, credit: amount },
          ],
          status: 'posted',
          createdByName: 'النظام',
        });
      } catch (jeErr) {
        console.warn('[CashTxn JE] Failed (non-fatal):', jeErr.message);
      }

    } else {
      const boxRef = doc(db, `companies/${COMPANY_ID}/cashBoxes`, boxId);
      let balanceAfter = 0;
      let cashCode = "1-1-1-1-3";
      let cashName = "الصندوق";

      await runTransaction(db, async (tx) => {
        const snap = await tx.get(boxRef);
        if (!snap.exists()) throw new Error("الصندوق غير موجود");
        const boxData = snap.data();
        const current = boxData.balance || 0;
        const delta   = type === "in" ? +amount : -amount;
        balanceAfter  = current + delta;
        if (balanceAfter < 0 && type === "out") throw new Error(`رصيد الصندوق غير كافٍ: ${current} < ${amount}`);

        cashCode = boxData.accountCode || "1-1-1-1-3";
        cashName = boxData.name;

        tx.update(boxRef, { balance: balanceAfter, updatedAt: serverTimestamp() });

        const txnRef = doc(collection(db, `companies/${COMPANY_ID}/cashTransactions`));
        tx.set(txnRef, {
          cashBoxId: boxId, type, amount, notes, balanceAfter, createdAt: serverTimestamp(),
        });
      });

      try {
        const debitCode  = type === 'in' ? cashCode : '6-9-1';
        const debitName  = type === 'in' ? cashName : 'مصاريف متنوعة';
        const creditCode = type === 'in' ? '4-9-1'  : cashCode;
        const creditName = type === 'in' ? 'إيرادات متنوعة' : cashName;
        await createJournalEntry({
          date:        new Date().toISOString().split('T')[0],
          description: `حركة نقدية — ${notes} — صندوق: ${cashName}`,
          sourceType:  'cashTransaction',
          lines: [
            { accountCode: debitCode,  accountName: debitName,  debit: amount, credit: 0 },
            { accountCode: creditCode, accountName: creditName, debit: 0, credit: amount },
          ],
          status: 'posted',
          createdByName: 'النظام',
        });
      } catch (jeErr) {
        console.warn('[CashTxn JE] Failed (non-fatal):', jeErr.message);
      }
    }

    showToast("تم تسجيل الحركة النقدية بنجاح", "success");
    closeModal("cb-txn-modal");
    await Promise.all([
      clearERPCache(COLS.cashBoxes().path),
      clearERPCache(COLS.cashTransactions().path),
      clearERPCache(COLS.journalEntries().path),
      clearERPCache(COLS.chartOfAccounts().path)
    ]);
    await loadCashBoxes();
    await loadCashTxns();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally { btn.disabled = false; }
};

// ─────────────────────────────────────────────────────────────────────────────
// 📄 OFFICIAL CASH VOUCHER PRINT ENGINE (محرك طباعة سند الصرف والقبض النقدي المعتمد)
// ─────────────────────────────────────────────────────────────────────────────

function _buildCashTxnVoucherHTML(t, company) {
  const isIncome = t.type === "in";
  const isTransfer = Boolean(t.isTransfer || (t.notes && t.notes.includes("تحويل")) || t.sourceType === "cashTransfer");
  const amount = Math.abs(Number(t.amount || 0));
  const amountWords = typeof tafqeetArabic === "function" ? tafqeetArabic(amount) : `${amount} ريال سعودي`;

  // Ref Code
  let refCode = t.refNumber || "";
  if (!refCode) {
    if (t.sourceType === "receipt") refCode = `RV-${(t.sourceId || t.id).substring(0, 6).toUpperCase()}`;
    else if (t.sourceType === "expense") refCode = `PV-${(t.sourceId || t.id).substring(0, 6).toUpperCase()}`;
    else if (isTransfer) refCode = `TR-${t.id.substring(0, 6).toUpperCase()}`;
    else refCode = `${isIncome ? 'RV' : 'PV'}-${t.id.substring(0, 6).toUpperCase()}`;
  }

  // Date
  let txDate = "";
  if (t.date && /^\d{4}-\d{2}-\d{2}$/.test(t.date)) txDate = formatDate(t.date);
  else if (t.date) txDate = t.date;
  else if (t.createdAt?.toDate) txDate = formatDate(t.createdAt.toDate());
  else if (t.createdAt?.seconds) txDate = formatDate(new Date(t.createdAt.seconds * 1000));
  else txDate = todayString();

  // Cash Box Name
  const cbMap = {};
  (cashBoxes || []).forEach(b => cbMap[b.id] = b.name);
  const boxName = cbMap[t.cashBoxId] || t.cashBoxName || (isIncome ? "الخزينة المستلمة" : "الصندوق الرئيسي");

  // Recipient / Beneficiary / Delivery party parsing
  let recipient = t.relatedBoxName || "";
  if (!recipient && t.notes) {
    if (t.notes.includes("إلى ")) {
      const m = t.notes.match(/إلى\s+([^—\-]+)/);
      if (m && m[1]) recipient = m[1].trim();
    } else if (t.notes.includes("من ")) {
      const m = t.notes.match(/من\s+([^—\-]+)/);
      if (m && m[1]) recipient = m[1].trim();
    }
  }
  if (!recipient) {
    recipient = isIncome
      ? (t.customerName || t.senderName || "الجهة المودعة / المحوِّلة")
      : (t.beneficiary || t.supplierName || t.receiverName || "الجهة المستلمة / الحساب المحول إليه");
  }

  // Company Details
  const coName    = company.name || company.companyName || "شركة نظم الإمداد المتطورة";
  const coAddress = [company.address, company.city, company.zip, company.country].filter(Boolean).join("، ") || "مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414";
  const coPhone   = company.phone || company.mobile || "0549141648";
  const coVat     = company.vatNumber || company.vat || company.taxNumber || "314996148100003";
  const coCr      = company.crNumber || company.cr || "7054969006";
  const coLogo    = company.logoUrl || company.logoBase64 || company.logo || "";

  // Visual Themes
  let titleAr = "سـنـد صـرف نـقـدي";
  let titleEn = "CASH PAYMENT VOUCHER";
  let themeHeader = "linear-gradient(135deg, #7f1d1d 0%, #1e1b4b 55%, #991b1b 100%)";
  let themeAccent = "linear-gradient(90deg, #ea580c 0%, #f59e0b 50%, #ea580c 100%)";
  let amountBg = "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)";
  let amountBorder = "#ef4444";
  let amountTextColor = "#7f1d1d";
  let amountBadgeText = "المبلغ المصروف نقداً";
  let badgeLabel = isTransfer ? "تحويل صادر 🔄" : "صرف نقدية 📤";

  if (isIncome) {
    titleAr = isTransfer ? "سـنـد قـبـض وتـحـويـل نـقـدي" : "سـنـد قـبـض واسـتـلام نـقـدي";
    titleEn = isTransfer ? "CASH RECEIPT & TRANSFER VOUCHER" : "CASH RECEIPT VOUCHER";
    themeHeader = "linear-gradient(135deg, #064e3b 0%, #0f172a 55%, #047857 100%)";
    themeAccent = "linear-gradient(90deg, #10b981 0%, #06b6d4 50%, #10b981 100%)";
    amountBg = "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)";
    amountBorder = "#10b981";
    amountTextColor = "#064e3b";
    amountBadgeText = "المبلغ المقبوض نقداً";
    badgeLabel = isTransfer ? "تحويل وارد 🔄" : "قبض نقدية 📥";
  } else if (isTransfer) {
    titleAr = "سـنـد صـرف وتـحـويـل نـقـدي";
    titleEn = "CASH DISBURSEMENT & TRANSFER VOUCHER";
    themeHeader = "linear-gradient(135deg, #831843 0%, #1e1b4b 50%, #991b1b 100%)";
  }

  // Legal declaration text
  let ackText = "";
  if (!isIncome) {
    ackText = `أقر أنا الموقع أدناه بأنني قد استلمت من <strong>(خزينة: ${boxName})</strong> المبلغ المالي الموضح أعلاه وقدره 
      <span style="color:#b91c1c;font-weight:900;">(${formatCurrency(amount)})</span> — 
      <em style="color:#92400e;">فقط ${amountWords} لا غير</em>، نقداً بصفة نهائية وذلك عن: <strong>${t.notes || '—'}</strong>، ويُعتبر توقيعي أدناه إقراراً بالاستلام وإبراءً لذمة الشركة ومسؤول الخزينة.`;
  } else {
    ackText = `تم استلام المبلغ المالي الموضح أعلاه وقدره 
      <span style="color:#047857;font-weight:900;">(${formatCurrency(amount)})</span> — 
      <em style="color:#065f46;">فقط ${amountWords} لا غير</em>، وتم قيده وإيداعه رسمياً في <strong>(خزينة: ${boxName})</strong> وذلك عن: <strong>${t.notes || '—'}</strong>.`;
  }

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${titleAr} — ${refCode}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { 
      size: A4 portrait; 
      margin: 5mm; 
    }
    body {
      font-family:'Cairo',Arial,sans-serif;
      direction:rtl;
      background:#f8fafc;
      color:#0f172a;
      padding:16px 12px;
      -webkit-print-color-adjust:exact !important;
      print-color-adjust:exact !important;
    }
    .no-print {
      display:flex;
      justify-content:center;
      gap:12px;
      margin-bottom:14px;
    }
    .action-btn {
      padding:8px 18px;
      border-radius:8px;
      font-size:13.5px;
      font-weight:800;
      font-family:'Cairo',sans-serif;
      cursor:pointer;
      border:none;
      transition:all 0.15s;
      box-shadow:0 2px 6px rgba(0,0,0,0.1);
    }
    .btn-print { background:#1e293b; color:#fff; }
    .btn-print:hover { background:#0f172a; }
    .btn-close { background:#e2e8f0; color:#334155; }
    .btn-close:hover { background:#cbd5e1; }
    
    .voucher-card {
      max-width:820px;
      margin:0 auto;
      background:#ffffff;
      border-radius:14px;
      overflow:hidden;
      border:1.5px solid #cbd5e1;
      box-shadow:0 8px 24px rgba(0,0,0,0.06);
    }
    @media print {
      html, body {
        background:#ffffff !important;
        padding:0 !important;
        margin:0 !important;
        height:100% !important;
        -webkit-print-color-adjust:exact !important;
        print-color-adjust:exact !important;
      }
      .no-print { display:none !important; }
      .voucher-card {
        border:1.5px solid #cbd5e1 !important;
        box-shadow:none !important;
        border-radius:8px !important;
        width:100% !important;
        max-width:100% !important;
        page-break-inside:avoid !important;
        break-inside:avoid !important;
        page-break-after:avoid !important;
        break-after:avoid !important;
      }
    }
  </style>
</head>
<body>

  <!-- Screen Action Toolbar -->
  <div class="no-print">
    <button class="action-btn btn-print" onclick="window.print()">🖨️ طباعة السند الآن (Print)</button>
    <button class="action-btn btn-close" onclick="window.close()">❌ إغلاق النافذة</button>
  </div>

  <div class="voucher-card">

    <!-- ═══ ROYAL HEADER ═══ -->
    <div style="background:${themeHeader} !important;padding:12px 22px;color:#ffffff;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        
        <!-- Company Identity -->
        <div style="display:flex;align-items:center;gap:14px;">
          ${coLogo 
            ? `<img src="${coLogo}" style="height:54px;width:54px;object-fit:contain;background:#ffffff;border-radius:10px;padding:3px;box-shadow:0 2px 8px rgba(0,0,0,0.25);" />` 
            : `<div style="width:54px;height:54px;background:rgba(255,255,255,0.18);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:28px;">🏛️</div>`
          }
          <div>
            <div style="font-size:20px;font-weight:900;color:#ffffff !important;line-height:1.15;margin-bottom:3px;letter-spacing:0.2px;">${coName}</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.92) !important;margin-bottom:4px;font-weight:600;">📍 ${coAddress}</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px 8px;font-size:10px;color:rgba(255,255,255,0.95) !important;">
              ${coVat ? `<span style="background:rgba(255,255,255,0.15) !important;padding:1px 7px;border-radius:6px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">🔢 الرقم الضريبي: <span dir="ltr" style="font-family:monospace;">${coVat}</span></span>` : ""}
              ${coCr ? `<span style="background:rgba(255,255,255,0.15) !important;padding:1px 7px;border-radius:6px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📋 السجل: <span dir="ltr" style="font-family:monospace;">${coCr}</span></span>` : ""}
              ${coPhone ? `<span style="background:rgba(255,255,255,0.15) !important;padding:1px 7px;border-radius:6px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📞 هاتف: <span dir="ltr" style="font-family:monospace;">${coPhone}</span></span>` : ""}
            </div>
          </div>
        </div>

        <!-- Voucher Certificate Title Badge -->
        <div style="text-align:center;">
          <div style="background:rgba(255,255,255,0.16) !important;backdrop-filter:blur(8px);border:1.5px solid rgba(255,255,255,0.35) !important;border-radius:12px;padding:8px 18px;box-shadow:0 3px 10px rgba(0,0,0,0.15);-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;">
            <div style="font-size:20px;font-weight:900;color:#ffffff !important;letter-spacing:0.5px;line-height:1.1;">${titleAr}</div>
            <div style="font-size:9px;color:rgba(255,255,255,0.9) !important;letter-spacing:1.5px;font-weight:800;margin-top:3px;text-transform:uppercase;">${titleEn}</div>
          </div>
        </div>

      </div>

      <!-- Accent Ribbon -->
      <div style="height:3px;background:${themeAccent} !important;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;margin-top:10px;border-radius:2px;"></div>
    </div>

    <!-- ═══ META & SERIAL BAR ═══ -->
    <div style="background:#f8fafc;border-bottom:1.5px solid #cbd5e1;padding:8px 22px;display:grid;grid-template-columns:1.2fr 1fr 1.2fr 1fr;gap:12px;align-items:center;">
      
      <!-- Ref Number -->
      <div style="text-align:center;border-left:1.5px solid #e2e8f0;padding-left:8px;">
        <div style="font-size:9.5px;color:#475569;font-weight:800;margin-bottom:2px;">رقم السند المرجعي</div>
        <div dir="ltr" style="display:inline-block;direction:ltr;font-size:15px;font-weight:900;color:#0f172a;font-family:'Courier New',Consolas,monospace;background:#ffffff;padding:2px 10px;border-radius:6px;border:1.5px solid #cbd5e1;">${refCode}</div>
      </div>

      <!-- Date -->
      <div style="text-align:center;border-left:1.5px solid #e2e8f0;padding-left:8px;">
        <div style="font-size:9.5px;color:#475569;font-weight:800;margin-bottom:2px;">تاريخ المعاملة</div>
        <div style="font-size:14px;font-weight:900;color:#0f172a;font-family:'Courier New',Consolas,monospace;">${txDate}</div>
      </div>

      <!-- Cash Box -->
      <div style="text-align:center;border-left:1.5px solid #e2e8f0;padding-left:8px;">
        <div style="font-size:9.5px;color:#475569;font-weight:800;margin-bottom:2px;">${isIncome ? 'الخزينة المودع بها' : 'الخزينة المسلّمة'}</div>
        <div style="font-size:13px;font-weight:900;color:#0f172a;">${boxName}</div>
      </div>

      <!-- Payment Method -->
      <div style="text-align:center;">
        <div style="font-size:9.5px;color:#475569;font-weight:800;margin-bottom:2px;">طريقة المعاملة</div>
        <div style="font-size:12.5px;font-weight:900;color:#0369a1;">💵 نقداً من الخزينة</div>
      </div>

    </div>

    <!-- ═══ AMOUNT BOX & TAFQEET ═══ -->
    <div style="padding:10px 22px 8px;">
      <div style="background:${amountBg};border:2px solid ${amountBorder};border-radius:12px;padding:10px 18px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 2px 6px rgba(0,0,0,0.03);">
        
        <div>
          <div style="font-size:10.5px;color:${amountTextColor};font-weight:800;margin-bottom:2px;">${amountBadgeText}</div>
          <div style="font-size:28px;font-weight:900;color:${amountTextColor};font-family:'Courier New',Consolas,monospace;line-height:1;">${formatCurrency(amount)}</div>
        </div>

        <div style="text-align:right;background:#ffffff;border:1.5px solid ${amountBorder};border-radius:10px;padding:8px 14px;max-width:440px;box-shadow:0 1px 4px rgba(0,0,0,0.02);">
          <div style="font-size:10px;color:${amountTextColor};font-weight:800;margin-bottom:2px;">المبلغ كتابةً (تفقيط معتمد):</div>
          <div style="font-size:13.5px;color:#0f172a;font-weight:900;line-height:1.4;">فقط ${amountWords} لا غير</div>
        </div>

      </div>
    </div>

    <!-- ═══ BENEFICIARY & DETAILS TABLE ═══ -->
    <div style="padding:0 22px 8px;">
      <table style="width:100%;border-collapse:separate;border-spacing:0;border:1.5px solid #cbd5e1;border-radius:10px;overflow:hidden;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:7px 12px;font-size:11px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;text-align:right;">${isIncome ? 'المستلم منه (الجهة المسلِّمة)' : 'المدفوع له (المستلم / الحساب المستفيد)'}</th>
            <th style="padding:7px 12px;font-size:11px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;border-right:1.5px solid #cbd5e1;text-align:right;width:150px;">نوع المعاملة</th>
            <th style="padding:7px 12px;font-size:11px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;border-right:1.5px solid #cbd5e1;text-align:right;width:170px;">الرصيد بعد الحركة</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:8px 12px;font-size:13.5px;font-weight:900;color:#0f172a;">${recipient}</td>
            <td style="padding:8px 12px;border-right:1.5px solid #cbd5e1;">
              <span style="background:${isIncome ? '#ecfdf5' : '#fef2f2'};color:${isIncome ? '#047857' : '#dc2626'};padding:3px 10px;border-radius:16px;font-size:11px;font-weight:800;border:1px solid ${isIncome ? '#a7f3d0' : '#fecaca'};">${badgeLabel}</span>
            </td>
            <td style="padding:8px 12px;font-size:13px;font-weight:800;color:#334155;border-right:1.5px solid #cbd5e1;" class="mono" dir="ltr">${formatCurrency(t.balanceAfter || 0)}</td>
          </tr>
        </tbody>
      </table>

      <!-- Statement & Purpose Box -->
      <div style="margin-top:6px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:7px 14px;">
        <div style="font-size:10px;color:#475569;font-weight:800;margin-bottom:2px;">البيان والسبب التفصيلي للمعاملة:</div>
        <div style="font-size:12.5px;color:#0f172a;font-weight:800;line-height:1.45;">${t.notes || "—"}</div>
      </div>
    </div>

    <!-- ═══ ACKNOWLEDGEMENT DECLARATION ═══ -->
    <div style="padding:0 22px 8px;">
      <div style="background:#fffbeb;border:1.5px dashed #d97706;border-radius:10px;padding:7px 14px;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;">
        <div style="font-size:10.5px;font-weight:900;color:#b45309;margin-bottom:2px;">📜 إقرار واستلام نقدية:</div>
        <div style="font-size:11px;font-weight:700;color:#1e293b;line-height:1.45;">${ackText}</div>
      </div>
    </div>

    <!-- ═══ OFFICIAL SIGNATURES SECTION ═══ -->
    <div style="border-top:1.5px solid #e2e8f0;padding:8px 22px 10px;background:#fafafa;">
      <div style="display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:12px;">
        
        <!-- Recipient Signature Box (المستلم - أولوية قصوى) -->
        <div style="background:#ffffff;border:1.5px solid #cbd5e1;border-radius:10px;padding:7px 10px;box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <div style="font-size:11.5px;font-weight:900;color:#0f172a;border-bottom:1.5px solid #e2e8f0;padding-bottom:4px;margin-bottom:5px;text-align:center;">
            ✍️ توقيع المستلم (المقر بالاستلام)
          </div>
          <div style="font-size:10px;color:#334155;line-height:1.75;font-weight:700;">
            <div>الاسم: ................................................................</div>
            <div>رقم الهوية: ........................................................</div>
            <div>الجوال: ............................................................</div>
            <div>التوقيع: ...........................................................</div>
            <div>التاريخ: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/ 2026 م</div>
          </div>
        </div>

        <!-- Cashier Signature Box -->
        <div style="background:#ffffff;border:1.5px solid #cbd5e1;border-radius:10px;padding:7px 10px;box-shadow:0 1px 3px rgba(0,0,0,0.02);text-align:center;">
          <div style="font-size:11.5px;font-weight:900;color:#0f172a;border-bottom:1.5px solid #e2e8f0;padding-bottom:4px;margin-bottom:5px;">
            💼 أمين الصندوق (المسلِّم)
          </div>
          <div style="font-size:10px;color:#334155;line-height:1.75;font-weight:700;text-align:right;">
            <div>الاسم: <strong>${t.userName || 'أمين الصندوق'}</strong></div>
            <div>الصفة: أمين الخزينة / المسؤول</div>
            <div>التوقيع: ...........................................</div>
            <div>التاريخ: <span class="mono">${txDate}</span></div>
          </div>
        </div>

        <!-- Management Approval & Official Stamp Box -->
        <div style="background:#ffffff;border:1.5px solid #cbd5e1;border-radius:10px;padding:7px 10px;box-shadow:0 1px 3px rgba(0,0,0,0.02);text-align:center;">
          <div style="font-size:11.5px;font-weight:900;color:#0f172a;border-bottom:1.5px solid #e2e8f0;padding-bottom:4px;margin-bottom:4px;">
            👑 اعتماد الإدارة والختم
          </div>
          <div style="font-size:10px;color:#475569;font-weight:700;margin-bottom:3px;">المدير المالي / المدير العام</div>
          <div style="border-top:1px dashed #94a3b8;width:100px;margin:5px auto 3px;font-size:9px;color:#64748b;">التوقيع والاعتماد</div>
          <div style="width:46px;height:46px;border:1.5px dashed #cbd5e1;border-radius:50%;margin:2px auto 0;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:9px;font-weight:800;">
            الختم الرسمي
          </div>
        </div>

      </div>
    </div>

    <!-- ═══ FOOTER ═══ -->
    <div style="background:#f1f5f9;border-top:1.5px solid #cbd5e1;padding:6px 22px;display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:9px;color:#64748b;font-weight:700;">
        وثيقة مالية رسمية صادرة آلياً من نظام إدارة ${coName} — لا يُعتد بهذا السند بدون توقيع المستلم والختم الرسمي.
      </div>
      <div dir="ltr" style="font-size:9.5px;color:#334155;font-family:monospace;font-weight:800;">
        REF: ${refCode}
      </div>
    </div>

  </div>

</body>
</html>`;
}

window.printCashTxnVoucher = async (txnIdOrRef) => {
  if (!txnIdOrRef) return;

  // 1. Locate transaction from _allCashTxns
  let t = (_allCashTxns || []).find(x => x.id === txnIdOrRef || x.refNumber === txnIdOrRef);

  // 2. If not found in _allCashTxns, check statement items
  if (!t && typeof _activeStatementRawItems !== "undefined" && _activeStatementRawItems) {
    const raw = _activeStatementRawItems.find(x => x.id === txnIdOrRef || x.ref === txnIdOrRef);
    if (raw) {
      t = {
        id: raw.id,
        amount: raw.inflow || raw.outflow,
        type: raw.inflow > 0 ? "in" : "out",
        isTransfer: Boolean(raw.badgeText?.includes("تحويل") || raw.notes?.includes("تحويل")),
        refNumber: raw.ref,
        date: raw.date,
        notes: raw.notes,
        balanceAfter: raw.balanceAfter,
        userName: raw.userName,
        cashBoxId: _activeStatementBox?.id,
        cashBoxName: _activeStatementBox?.name,
      };
    }
  }

  // 3. Fallback to Firestore lookup
  if (!t) {
    try {
      const snap = await getDoc(doc(db, `companies/${COMPANY_ID}/cashTransactions`, txnIdOrRef));
      if (snap.exists()) {
        t = { id: snap.id, ...snap.data() };
      } else {
        const qSnap = await getDocs(query(collection(db, `companies/${COMPANY_ID}/cashTransactions`), where("refNumber", "==", txnIdOrRef), limit(1)));
        if (!qSnap.empty) {
          t = { id: qSnap.docs[0].id, ...qSnap.docs[0].data() };
        }
      }
    } catch (err) {
      console.warn("[printCashTxnVoucher] Firestore lookup error:", err);
    }
  }

  // 4. Fallback: check expenses if it's an expense document
  if (!t) {
    try {
      const expSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/expenses`, txnIdOrRef));
      if (expSnap.exists()) {
        if (typeof window.printSingleExpenseVoucher === "function") {
          return window.printSingleExpenseVoucher(txnIdOrRef);
        } else if (typeof window.previewExpense === "function") {
          return window.previewExpense(txnIdOrRef);
        }
      }
    } catch (_) {}
  }

  if (!t) {
    showToast("تعذر العثور على بيانات الحركة النقدية المطلوبة للطباعة", "error");
    return;
  }

  // 5. Fetch Company Info & Logo
  let company = {};
  try {
    const [coSnap, logoSnap] = await Promise.all([
      getDoc(doc(db, `companies/${COMPANY_ID}/settings/company`)),
      getDoc(doc(db, `companies/${COMPANY_ID}/settings/logo`))
    ]);
    if (coSnap.exists()) company = coSnap.data();
    if (logoSnap.exists()) company.logoUrl = logoSnap.data().dataUrl || logoSnap.data().logoUrl || "";
  } catch (_) {}

  // 6. Generate HTML and open print window
  const html = _buildCashTxnVoucherHTML(t, company);
  const win = window.open("", "_blank", "width=920,height=800");
  if (!win) {
    showToast("يرجى السماح بالنوافذ المنبثقة (Popups) في المتصفح لطباعة السند", "warning");
    return;
  }

  win.document.write(html);
  win.document.close();
  setTimeout(() => {
    try {
      win.focus();
      win.print();
    } catch (_) {}
  }, 700);
};