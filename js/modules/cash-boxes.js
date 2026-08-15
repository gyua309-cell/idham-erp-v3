// ============================================================
// IDHAM ERP — Cash Boxes Module (الصناديق النقدية والعهد)
// ============================================================
import { COLS, create, update, remove, getAll, createJournalEntry, clearERPCache } from "../utils/db.js";
import { query, orderBy, limit, getDocs, where, doc, getDoc, runTransaction, serverTimestamp, collection } from "../utils/db.js";
import { syncEntityToCoa, deleteEntityInCoa } from "../utils/coa-connector.js";
import { formatCurrency, formatDate, todayString } from "../utils/formatters.js";
import { db, COMPANY_ID } from "../firebase-config.js";

let cashBoxes = [];
let _allCashTxns = [];
let _allJEsCache = [];
let _selectedBoxFilter = "";
let _activeStatementBox = null;
let _activeStatementRows = [];

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

function formatTxnBalance(bal, boxOrBoxId) {
  if (bal === null || bal === undefined || isNaN(bal)) return "—";
  
  let box = null;
  if (typeof boxOrBoxId === "object" && boxOrBoxId) {
    box = boxOrBoxId;
  } else if (typeof boxOrBoxId === "string") {
    box = cashBoxes.find(b => b.id === boxOrBoxId);
  }

  const isOwnerOrEquity = box && (box.type === "owner_current" || (box.accountCode && box.accountCode.startsWith("3")) || (box.name || "").includes("مالك") || (box.name || "").includes("جاري"));

  if (isOwnerOrEquity) {
    if (bal < 0) {
      return `<span style="color:#7c3aed;font-weight:800;">${formatCurrency(Math.abs(bal))} دائن</span>`;
    } else if (bal > 0) {
      return `<span style="color:#2563eb;font-weight:800;">${formatCurrency(bal)} مدين</span>`;
    } else {
      return formatCurrency(0);
    }
  }

  return formatCurrency(bal);
}

export async function render(container, user) {
  container.innerHTML = `
    <!-- Top Actions Header -->
    <div class="filterbar" style="flex-wrap:wrap;gap:10px;align-items:center;background:var(--bg-1);padding:14px 18px;border-radius:14px;border:1px solid var(--border-soft);margin-bottom:20px;">
      <div style="margin-right:auto;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="exportPagePDF('.data-dense','الصناديق_والعهد')" title="تصدير PDF">📄 PDF</button>
        <button class="btn btn-secondary btn-sm" onclick="exportPageExcel('.data-dense','الصناديق_والعهد')" title="تصدير Excel">📊 Excel</button>
        <button class="btn btn-secondary btn-sm" onclick="window.print()" title="طباعة">🖨️ طباعة</button>
        <button class="btn btn-secondary btn-sm" onclick="openCashTxnModal()">+ حركة نقدية جديدة</button>
        <button class="btn btn-primary" onclick="openCashBoxModal()">+ صندوق / عهدة جديدة</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header" style="margin-bottom:16px;">
        <h1 class="page-title" style="font-size:22px;font-weight:900;">💵 إدارة الصناديق النقدية والعهَد والتمويل الشخصي</h1>
        <p class="page-subtitle" style="color:var(--text-3);font-size:13px;">إدارة عهد المناديـب، الخزائن الرئيسية والفرعية، وحسابات جاري المالك مع كشوفات الحركات النقدية</p>
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

        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>الصندوق / العهدة</th>
                <th>نوع الحركة</th>
                <th>البيان والسبب</th>
                <th>المبلغ</th>
                <th>الرصيد بعد الحركة</th>
                <th>المستخدم</th>
              </tr>
            </thead>
            <tbody id="cb-txn-tbody">
              ${Array(6).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(7).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
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

    <!-- ═══ MODAL: CASH TRANSACTION ═══ -->
    <div class="modal-overlay" id="cb-txn-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">سند حركة نقدية</h3>
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

    <!-- ═══ MODAL: DETAILED STATEMENT OF ACCOUNT ═══ -->
    <div class="modal-overlay" id="cb-statement-modal">
      <div class="modal modal-lg" style="max-width:920px;border-radius:20px;overflow:hidden;">
        <div class="modal-header" style="background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);color:#fff;padding:18px 24px;">
          <h3 class="modal-title" id="cb-stmt-modal-title" style="color:#fff;font-size:18px;font-weight:900;">📄 كشف حساب تفصيلي للصندوق</h3>
          <button class="modal-close" onclick="closeModal('cb-statement-modal')" style="color:#fff;opacity:0.8;">×</button>
        </div>
        <div class="modal-body" id="cb-stmt-body" style="padding:20px;background:#f8fafc;">
          <!-- Loaded dynamically -->
        </div>
        <div class="modal-footer" style="background:#f1f5f9;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;">
          <button class="btn btn-secondary" onclick="closeModal('cb-statement-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="printCashBoxStatementHTML()">🖨️ طباعة رسمية لكشف الحساب</button>
        </div>
      </div>
    </div>
  `;

  await loadCashBoxes();
  await loadCashTxns();
}

async function loadCashBoxes() {
  const grid = document.getElementById("cb-grid");
  const selectBoxFilter = document.getElementById("filter-cb-box");
  if (!grid) return;

  try {
    clearERPCache(COLS.cashBoxes().path);
    clearERPCache(COLS.chartOfAccounts().path);
    cashBoxes = await getAll(COLS.cashBoxes(), [orderBy("name")]);
    const coaAccounts = await getAll(COLS.chartOfAccounts());

    // ✅ SYNC: مزامنة رصيد الصندوق مع الرصيد المحاسبي المخزن في شجرة الحسابات
    // الرصيد المخزن (acc.balance) يتحدث تلقائياً من محرك القيود عند كل إدخال
    for (const cb of cashBoxes) {
      const acc = coaAccounts.find(a => a.id === cb.accountId || a.code === cb.accountCode);
      if (acc) {
        const coaBal = acc.balance || 0;
        if (Math.abs((cb.balance || 0) - coaBal) > 0.01) {
          cb.balance = coaBal;
          await update("cashBoxes", cb.id, { balance: coaBal });
        }
      }
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
        <div class="card cb-card-interactive" onclick="filterCashBoxTxnsByCard('${cb.id}')" style="background:${theme.gradient}; border:${theme.border}; box-shadow:${theme.shadow}; color:#ffffff !important; padding:22px; border-radius:18px; cursor:pointer; position:relative; overflow:hidden; transition:transform 0.2s ease, box-shadow 0.2s ease; ${isSelected ? 'outline:3.5px solid #ffffff;transform:scale(1.02);' : ''}">
          
          <div style="position:absolute; top:-15px; left:-15px; font-size:90px; opacity:0.15; pointer-events:none;">${theme.icon}</div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; position:relative; z-index:2;">
            <span style="background:${theme.accentBg}; border:1px solid rgba(255,255,255,0.4); color:#ffffff !important; font-size:11px; font-weight:800; padding:4px 12px; border-radius:20px; backdrop-filter:blur(4px); text-shadow:0 1px 2px rgba(0,0,0,0.3);">
              ${theme.icon} ${theme.badgeText}
            </span>
            <div style="display:flex; gap:6px;" onclick="event.stopPropagation();">
              <button class="btn btn-icon sm" onclick="openCashBoxStatementModal('${cb.id}')" style="background:rgba(255,255,255,0.25); color:#ffffff !important; border:1px solid rgba(255,255,255,0.3);" title="كشف حساب تفصيلي">📄</button>
              <button class="btn btn-icon sm" onclick="openCashBoxModal('${cb.id}')" style="background:rgba(255,255,255,0.25); color:#ffffff !important; border:1px solid rgba(255,255,255,0.3);" title="تعديل">✏️</button>
              <button class="btn btn-icon sm" onclick="deleteCashBox('${cb.id}','${cb.name}')" style="background:rgba(239,68,68,0.4); color:#ffffff !important; border:1px solid rgba(255,255,255,0.3);" title="حذف">🗑️</button>
            </div>
          </div>

          <h3 style="font-size:18px; font-weight:900; margin-bottom:6px; color:#ffffff !important; text-shadow:0 1px 3px rgba(0,0,0,0.4); position:relative; z-index:2;">${cb.name}</h3>
          <div style="font-size:12px; color:rgba(255,255,255,0.92) !important; margin-bottom:16px; position:relative; z-index:2;">👤 المسؤول: <strong style="color:#ffffff !important;">${cb.keeper || "غير محدد"}</strong> ${cb.accountCode ? `| كود: <span style="font-family:monospace;font-weight:800;color:#ffffff !important;">${cb.accountCode}</span>` : ''}</div>

          <div style="background:rgba(255,255,255,0.15); border-radius:12px; padding:12px 16px; border:1px solid rgba(255,255,255,0.3); backdrop-filter:blur(6px); display:flex; justify-content:space-between; align-items:center; position:relative; z-index:2;">
            <span style="font-size:12px; font-weight:800; color:#ffffff !important; text-shadow:0 1px 2px rgba(0,0,0,0.3);">الرصيد الحالي</span>
            <span class="mono" style="font-size:23px; font-weight:900; direction:ltr; color:#ffffff !important; text-shadow:0 2px 4px rgba(0,0,0,0.4);">${formatCurrency(cb.balance || 0)}</span>
          </div>

          <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:rgba(255,255,255,0.95) !important; font-weight:700; position:relative; z-index:2;">
            <span style="color:#ffffff !important;">${isSelected ? '🎯 تصفية نشطة' : 'انقر لتصفية الجدول 🔍'}</span>
            <span style="text-decoration:underline; cursor:pointer; color:#ffffff !important;" onclick="event.stopPropagation(); openCashBoxStatementModal('${cb.id}')">كشف حساب 📄</span>
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
    const [snapTxns, snapJEs] = await Promise.all([
      getDocs(query(COLS.cashTransactions(), orderBy("createdAt", "desc"), limit(200))),
      getDocs(COLS.journalEntries())
    ]);
    _allCashTxns = snapTxns.docs.map(d => ({ id: d.id, ...d.data() }));
    _allJEsCache = snapJEs.docs.map(d => ({ id: d.id, ...d.data() }));

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

  let filtered = [];
  const box = boxId ? cashBoxes.find(b => b.id === boxId) : null;

  if (box && box.accountCode) {
    const isOwnerOrEquity = box.type === "owner_current" || box.accountCode.startsWith("3") || (box.name || "").includes("مالك");
    const accCode = box.accountCode;

    const items = [];

    // 1. تجميع القيود المحاسبية
    _allJEsCache.forEach(d => {
      const dt = d.date || (d.createdAt?.seconds ? formatDate(d.createdAt) : todayString());
      const desc = d.description || "";
      (d.lines || []).forEach(line => {
        const code = line.accountCode || "";
        if (code === accCode || code.startsWith(accCode + "-")) {
          const dr = parseFloat(line.debit || 0);
          const cr = parseFloat(line.credit || 0);
          items.push({
            id: d.id,
            createdAt: d.createdAt || dt,
            date: dt,
            cashBoxId: box.id,
            type: (isOwnerOrEquity ? cr > 0 : dr > 0) ? "in" : "out",
            notes: desc || line.note || "قيد يومية مباشر",
            amount: isOwnerOrEquity ? (cr || dr) : (dr || cr),
            inflow: isOwnerOrEquity ? cr : dr,
            outflow: isOwnerOrEquity ? dr : cr,
            userName: d.userName || d.createdBy || "النظام"
          });
        }
      });
    });

    // 2. تجميع حركات الصناديق التي لم تُسجل بالقيود
    const txnsForBox = _allCashTxns.filter(t => t.cashBoxId === boxId);
    txnsForBox.forEach(t => {
      const dt = t.createdAt?.seconds ? formatDate(t.createdAt) : (t.date || todayString());
      const amt = t.amount || 0;
      const notes = t.notes || "";
      const existsInJEs = items.some(it => 
        it.date === dt &&
        (Math.abs(it.inflow - amt) < 0.01 || Math.abs(it.outflow - amt) < 0.01) &&
        (it.notes.includes(notes.slice(0, 8)) || notes.includes(it.notes.slice(0, 8)))
      );
      if (!existsInJEs) {
        items.push({
          ...t,
          date: dt,
          inflow: t.type === "in" ? amt : 0,
          outflow: t.type === "out" ? amt : 0
        });
      }
    });

    // حساب الرصيد التراكمي بالتسلسل التاريخي
    items.sort((a,b) => (a.date || "").localeCompare(b.date || ""));
    let runningBal = 0;
    items.forEach(it => {
      runningBal += (it.inflow - it.outflow);
      it.balanceAfter = runningBal;
    });

    filtered = items.reverse();

    if (titleEl) titleEl.textContent = `📑 كشف حركات وقيد: ${box.name}`;
    if (subtitleEl) subtitleEl.textContent = `سجل الحركات المصروفة والمقبوضة والقيود المقيدة (${filtered.length} حركة)`;
  } else if (boxId) {
    filtered = _allCashTxns.filter(t => t.cashBoxId === boxId);
    if (titleEl) titleEl.textContent = `📑 كشف حركات: ${box ? box.name : 'الصندوق المالي'}`;
    if (subtitleEl) subtitleEl.textContent = `سجل الحركات المصروفة والمقبوضة للصندوق المالي المقتطع (${filtered.length} حركة)`;
  } else {
    filtered = [..._allCashTxns];
    if (titleEl) titleEl.textContent = "📑 سجل ودعم كشف حركات كافة الصناديق والعهد";
    if (subtitleEl) subtitleEl.textContent = "انقر على أي كارت صندوق بالأعلى للتصفية المباشرة عليه أو استعراض كشف الحساب الشامل";
  }

  if (from) filtered = filtered.filter(t => t.createdAt && (t.createdAt.seconds ? formatDate(t.createdAt) >= from : true));
  if (to)   filtered = filtered.filter(t => t.createdAt && (t.createdAt.seconds ? formatDate(t.createdAt) <= to : true));
  if (type) filtered = filtered.filter(t => t.type === type);
  if (search) {
    filtered = filtered.filter(t => 
      (t.notes || "").toLowerCase().includes(search) ||
      (t.userName || "").toLowerCase().includes(search) ||
      (t.cashBoxId || "").toLowerCase().includes(search)
    );
  }

  const cbMap = {};
  cashBoxes.forEach(b => cbMap[b.id] = b.name);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:36px;color:var(--text-2);font-weight:700;">🔍 لا توجد حركات نقدية مطابقة للتصفية المختارة</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(t => {
    const isIncome = t.type === 'in';
    const badgeStyle = isIncome
      ? 'background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;font-weight:800;'
      : 'background:#fef2f2;color:#dc2626;border:1px solid #fecaca;font-weight:800;';

    return `
      <tr style="transition:all 0.15s ease;">
        <td class="mono font-bold" style="font-size:12.5px;">${formatDate(t.createdAt)}</td>
        <td><strong style="color:var(--text-1);">${cbMap[t.cashBoxId] || t.cashBoxId}</strong></td>
        <td><span class="badge" style="${badgeStyle}padding:4px 10px;border-radius:8px;">${isIncome ? 'إيداع / تحصيل (+)' : 'سحب / مصروف (-)'}</span></td>
        <td><span style="font-size:12.5px;color:var(--text-2);font-weight:600;">${t.notes || "—"}</span></td>
        <td class="mono font-bold ${isIncome ? 'text-ok' : 'text-bad'}" style="font-size:13.5px;">${isIncome ? '+' : '-'}${formatCurrency(t.amount)}</td>
        <td class="mono font-bold" style="font-size:12.5px;"><span dir="ltr" style="display:inline-block;direction:ltr;background:var(--bg-2);padding:2px 8px;border-radius:6px;">${formatTxnBalance(t.balanceAfter || 0, t.cashBoxId)}</span></td>
        <td style="font-size:11.5px;color:var(--text-3);">${t.userName || "النظام"}</td>
      </tr>`;
  }).join("");
};

// ─────────────────────────────────────────────────────────────────────────────
// Detailed Statement of Account Modal Implementation
// ─────────────────────────────────────────────────────────────────────────────
window.openCashBoxStatementModal = async (cashBoxId) => {
  const box = cashBoxes.find(b => b.id === cashBoxId);
  if (!box) return;

  _activeStatementBox = box;
  const titleEl = document.getElementById("cb-stmt-modal-title");
  const bodyEl = document.getElementById("cb-stmt-body");

  if (titleEl) titleEl.textContent = `📄 كشف حساب تفصيلي رسمي — ${box.name}`;
  if (bodyEl) bodyEl.innerHTML = `<div style="text-align:center;padding:40px;"><span class="spin"></span> جاري تجميع وتحليل قيود وحركات ${box.name}…</div>`;

  openModal("cb-statement-modal");

  try {
    const isOwnerOrEquity = box.type === "owner_current" || (box.accountCode && box.accountCode.startsWith("3")) || (box.name || "").includes("مالك");

    const [txnsSnap, rcptsSnap, expsSnap, jesSnap] = await Promise.all([
      getDocs(query(COLS.cashTransactions(), where("cashBoxId", "==", cashBoxId))),
      getDocs(query(COLS.receipts(), where("sourceId", "==", cashBoxId))),
      getDocs(query(COLS.expenses(), where("sourceId", "==", cashBoxId))),
      box.accountCode ? getDocs(COLS.journalEntries()) : Promise.resolve({ docs: [] })
    ]);

    const items = [];

    // 1. القيود المحاسبية المباشرة من دفتر القيود (Source of Truth)
    if (jesSnap && jesSnap.docs) {
      jesSnap.docs.forEach(d => {
        const data = d.data();
        const dt = data.date || (data.createdAt?.seconds ? formatDate(data.createdAt) : todayString());
        const desc = data.description || "";
        
        (data.lines || []).forEach(line => {
          const code = line.accountCode || "";
          if (code === box.accountCode || (box.accountCode && code.startsWith(box.accountCode + "-"))) {
            const dr = parseFloat(line.debit || 0);
            const cr = parseFloat(line.credit || 0);
            
            items.push({
              date: dt,
              type: "قيد يومية",
              notes: desc || line.note || "قيد محاسبي مباشر",
              inflow: isOwnerOrEquity ? cr : dr,
              outflow: isOwnerOrEquity ? dr : cr,
              ref: `JE-${(data.entryNumber || d.id).toString().slice(-6).toUpperCase()}`
            });
          }
        });
      });
    }

    // 2. حركات الصندوق النقدية (إن لم تكن مسجلة في القيود)
    txnsSnap.forEach(d => {
      const data = d.data();
      const dt = data.createdAt?.seconds ? formatDate(data.createdAt) : (data.date || todayString());
      const amt = data.amount || 0;
      const notes = data.notes || "";

      const existsInJEs = items.some(it => 
        it.date === dt &&
        (Math.abs(it.inflow - amt) < 0.01 || Math.abs(it.outflow - amt) < 0.01) &&
        (it.notes.includes(notes.slice(0, 8)) || notes.includes(it.notes.slice(0, 8)))
      );

      if (!existsInJEs) {
        items.push({
          date: dt,
          type: data.type === "in" ? "إيداع نقدي" : "سحب نقدي",
          notes: notes || "حركة نقدية بالصندوق",
          inflow: data.type === "in" ? amt : 0,
          outflow: data.type === "out" ? amt : 0,
          ref: `TXN-${d.id.substring(0,6).toUpperCase()}`
        });
      }
    });

    // 3. سندات القبض المستقلة
    rcptsSnap.forEach(d => {
      const data = d.data();
      const amt = data.amount || 0;
      const dt = data.date || todayString();

      const exists = items.some(it => 
        it.date === dt && (Math.abs(it.inflow - amt) < 0.01)
      );
      if (!exists) {
        items.push({
          date: dt,
          type: "سند قبض تحصيل",
          notes: `تحصيل من: ${data.accountName || 'جهة'} — ${data.notes || ''}`,
          inflow: amt,
          outflow: 0,
          ref: data.displayCode || `RV-${d.id.substring(0,6).toUpperCase()}`
        });
      }
    });

    // 4. سندات الصرف المستقلة
    expsSnap.forEach(d => {
      const data = d.data();
      const amt = data.amount || 0;
      const dt = data.date || todayString();

      const exists = items.some(it => 
        it.date === dt && (Math.abs(it.outflow - amt) < 0.01)
      );
      if (!exists) {
        items.push({
          date: dt,
          type: "سند صرف مصروف",
          notes: `صرف لصالح: ${data.accountName || 'جهة'} — ${data.notes || ''}`,
          inflow: 0,
          outflow: amt,
          ref: `PV-${d.id.substring(0,6).toUpperCase()}`
        });
      }
    });

    items.sort((a,b) => (a.date || "").localeCompare(b.date || ""));

    let runningBal = 0;
    let totalIn = 0;
    let totalOut = 0;

    items.forEach(item => {
      totalIn += item.inflow;
      totalOut += item.outflow;
      runningBal += (item.inflow - item.outflow);
      item.balanceAfter = runningBal;
    });

    _activeStatementRows = items;

    bodyEl.innerHTML = `
      <!-- Box Info Banner -->
      <div style="background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); border-radius:14px; padding:20px; color:#fff; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div>
          <div style="font-size:12px; color:#93c5fd; font-weight:700; text-transform:uppercase;">كشف حساب حركة الصندوق / العهدة</div>
          <h2 style="font-size:22px; font-weight:900; margin:4px 0 2px 0;">${box.name}</h2>
          <div style="font-size:12.5px; color:#cbd5e1;">المسؤول: <strong>${box.keeper || "غير محدد"}</strong> ${box.accountCode ? `| رمز الحساب: <span style="font-family:monospace;">${box.accountCode}</span>` : ''}</div>
        </div>
        <div style="text-align:left; background:rgba(255,255,255,0.1); padding:10px 18px; border-radius:12px; border:1px solid rgba(255,255,255,0.2);">
          <div style="font-size:11px; color:#93c5fd;">الرصيد الفعلي الحالي</div>
          <div class="mono" style="font-size:24px; font-weight:900; direction:ltr; color:#ffffff;">${formatCurrency(box.balance || 0)}</div>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid-3 gap-12 mb-16">
        <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:12px; padding:14px; text-align:center;">
          <div style="font-size:11px; color:#047857; font-weight:800;">إجمالي المقبوضات الإيداعية (+)</div>
          <div class="mono text-ok" style="font-size:18px; font-weight:900; margin-top:2px;">+${formatCurrency(totalIn)}</div>
        </div>
        <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:14px; text-align:center;">
          <div style="font-size:11px; color:#dc2626; font-weight:800;">إجمالي المصروفات والسحوبات (-)</div>
          <div class="mono text-bad" style="font-size:18px; font-weight:900; margin-top:2px;">-${formatCurrency(totalOut)}</div>
        </div>
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:14px; text-align:center;">
          <div style="font-size:11px; color:#1d4ed8; font-weight:800;">إجمالي عدد الحركات المقيدة</div>
          <div class="mono" style="font-size:18px; font-weight:900; color:#1d4ed8; margin-top:2px;">${items.length} حركة</div>
        </div>
      </div>

      <!-- Statement Table -->
      <div class="table-container" style="background:#fff; border-radius:12px; border:1px solid #e2e8f0;">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="padding:10px;">التاريخ</th>
              <th style="padding:10px;">نوع الحركة</th>
              <th style="padding:10px;">المرجع</th>
              <th style="padding:10px;">البيان والتفاصيل</th>
              <th style="padding:10px;text-align:left;">وارد (+)</th>
              <th style="padding:10px;text-align:left;">صادر (-)</th>
              <th style="padding:10px;text-align:left;">الرصيد التراكمي</th>
            </tr>
          </thead>
          <tbody>
            ${items.length ? items.map(item => `
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td class="mono font-bold" style="font-size:12px;padding:8px 10px;">${item.date}</td>
                <td style="font-size:12px;font-weight:700;">${item.type}</td>
                <td class="mono" style="font-size:11px;"><span dir="ltr" style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-weight:800;">${item.ref}</span></td>
                <td style="font-size:12px;color:#334155;">${item.notes}</td>
                <td class="mono text-ok font-bold" style="text-align:left;font-size:12.5px;">${item.inflow ? '+' + formatCurrency(item.inflow) : '—'}</td>
                <td class="mono text-bad font-bold" style="text-align:left;font-size:12.5px;">${item.outflow ? '-' + formatCurrency(item.outflow) : '—'}</td>
                <td class="mono font-bold" style="text-align:left;font-size:12.5px;"><span dir="ltr" style="display:inline-block;direction:ltr;background:#f8fafc;padding:3px 8px;border-radius:6px;border:1px solid #cbd5e1;">${formatTxnBalance(item.balanceAfter, box)}</span></td>
              </tr>
            `).join("") : `<tr><td colspan="7" style="text-align:center;padding:30px;color:#64748b;">لا توجد حركات مقيدة لهذا الصندوق حالياً</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    bodyEl.innerHTML = `<div class="alert bad">خطأ في جلب كشف الحساب التفصيلي: ${err.message}</div>`;
  }
};

window.printCashBoxStatementHTML = () => {
  if (!_activeStatementBox) return;
  const win = window.open("", "_blank", "width=900,height=750");
  const box = _activeStatementBox;
  const rows = _activeStatementRows;

  win.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>كشف حساب رسمي — ${box.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Cairo',sans-serif; direction:rtl; padding:25px; background:#fff; color:#0f172a; }
    .header-box { background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color:#fff; padding:24px; border-radius:14px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; }
    table { width:100%; border-collapse:collapse; margin-top:15px; }
    th { background:#f1f5f9; color:#1e293b; padding:10px; font-size:12px; font-weight:800; text-align:right; border-bottom:2px solid #cbd5e1; }
    td { padding:10px; border-bottom:1px solid #e2e8f0; font-size:12px; }
    .mono { font-family:monospace; font-weight:700; }
    @media print {
      body { padding:0; }
      .header-box { background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%) !important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div>
      <h1 style="font-size:20px;font-weight:900;">كشف حساب تفصيلي رسمي</h1>
      <h2 style="font-size:16px;font-weight:700;color:#93c5fd;margin-top:4px;">${box.name}</h2>
      <div style="font-size:11px;color:#cbd5e1;margin-top:4px;">مسؤول الصندوق: ${box.keeper || "—"} ${box.accountCode ? `| كود الحساب: ${box.accountCode}` : ''}</div>
    </div>
    <div style="text-align:left;">
      <div style="font-size:11px;color:#93c5fd;">الرصيد الفعلي الحالي</div>
      <div class="mono" style="font-size:24px;font-weight:900;direction:ltr;">${formatCurrency(box.balance || 0)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>التاريخ</th>
        <th>نوع الحركة</th>
        <th>المرجع</th>
        <th>البيان والتفاصيل</th>
        <th style="text-align:left;">وارد (+)</th>
        <th style="text-align:left;">صادر (-)</th>
        <th style="text-align:left;">الرصيد التراكمي</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map(r => `
        <tr>
          <td class="mono">${r.date}</td>
          <td><strong>${r.type}</strong></td>
          <td class="mono" dir="ltr">${r.ref}</td>
          <td>${r.notes}</td>
          <td class="mono" style="text-align:left;color:#047857;">${r.inflow ? '+' + formatCurrency(r.inflow) : '—'}</td>
          <td class="mono" style="text-align:left;color:#dc2626;">${r.outflow ? '-' + formatCurrency(r.outflow) : '—'}</td>
          <td class="mono" style="text-align:left;font-weight:900;" dir="ltr">${formatTxnBalance(r.balanceAfter, box)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <div style="margin-top:30px;padding-top:15px;border-top:1px dashed #94a3b8;display:flex;justify-content:space-between;font-size:11px;color:#64748b;">
    <div>طُبع رسمياً من نظام إدهام ERP بتاريخ: ${new Date().toLocaleString("ar-SA")}</div>
    <div>توقيع أمين الصندوق / المحاسب المسؤول: .......................................</div>
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
          accountId = coaDoc.id;
          accountCode = coaDoc.code;
        }
      }

      await create(COLS.cashBoxes(), {
        name,
        type,
        keeper,
        openingBalance,
        balance: openingBalance,
        accountId,
        accountCode
      });
      showToast("تم إضافة الصندوق النقدي بنجاح", "success");
    }

    closeModal("cb-modal");
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

      let sourceAccId = "";
      let targetAccId = "";

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
        sourceAccId = sourceData.accountId || "";
        targetAccId = targetData.accountId || "";

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
            { accountId: targetAccId, accountCode: targetCode, accountName: targetName, debit: amount, credit: 0 },
            { accountId: sourceAccId, accountCode: sourceCode, accountName: sourceName, debit: 0, credit: amount },
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
    await loadCashBoxes();
    await loadCashTxns();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally { btn.disabled = false; }
};
