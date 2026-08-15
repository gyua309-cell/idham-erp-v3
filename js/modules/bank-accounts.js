// ============================================================
// IDHAM ERP — Bank Accounts Module (الحسابات البنكية والتحويلات)
// ============================================================
import { COLS, create, update, remove, getAll, createJournalEntry, clearERPCache } from "../utils/db.js";
import { query, orderBy, limit, getDocs, where, doc, getDoc, runTransaction, serverTimestamp, collection } from "../utils/db.js";
import { syncEntityToCoa, deleteEntityInCoa } from "../utils/coa-connector.js";
import { formatCurrency, formatDate, todayString } from "../utils/formatters.js";
import { db, COMPANY_ID } from "../firebase-config.js";

let bankAccounts = [];
let _allBankTxns = [];
let _selectedBankFilter = "";
let _activeBankStatement = null;
let _activeBankStatementRows = [];

function _getBankTheme(b) {
  const name = (b.name || "").toLowerCase();
  if (name.includes("راجحي") || name.includes("alrajhi")) {
    return {
      gradient: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
      border: "1.5px solid #3b82f6",
      shadow: "0 10px 25px -5px rgba(30,58,138,0.4)",
      icon: "🏦",
      badgeText: "مصرف الراجحي"
    };
  } else if (name.includes("أهلي") || name.includes("اهلي") || name.includes("snb")) {
    return {
      gradient: "linear-gradient(135deg, #065f46 0%, #064e3b 100%)",
      border: "1.5px solid #10b981",
      shadow: "0 10px 25px -5px rgba(6,95,70,0.4)",
      icon: "🏛️",
      badgeText: "البنك الأهلي SNB"
    };
  } else if (name.includes("رياض") || name.includes("riyad")) {
    return {
      gradient: "linear-gradient(135deg, #9a3412 0%, #7c2d12 100%)",
      border: "1.5px solid #f97316",
      shadow: "0 10px 25px -5px rgba(154,52,18,0.4)",
      icon: "🏧",
      badgeText: "بنك الرياض"
    };
  } else {
    return {
      gradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      border: "1.5px solid #64748b",
      shadow: "0 10px 25px -5px rgba(30,41,59,0.4)",
      icon: "🏦",
      badgeText: "حساب بنكي"
    };
  }
}

export async function render(container, user) {
  container.innerHTML = `
    <!-- Top Actions Header -->
    <div class="filterbar" style="flex-wrap:wrap;gap:10px;align-items:center;background:var(--bg-1);padding:14px 18px;border-radius:14px;border:1px solid var(--border-soft);margin-bottom:20px;">
      <div style="margin-right:auto;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="exportPagePDF('.data-dense','الحسابات_البنكية')" title="تصدير PDF">📄 PDF</button>
        <button class="btn btn-secondary btn-sm" onclick="exportPageExcel('.data-dense','الحسابات_البنكية')" title="تصدير Excel">📊 Excel</button>
        <button class="btn btn-secondary btn-sm" onclick="window.print()" title="طباعة">🖨️ طباعة</button>
        <button class="btn btn-secondary btn-sm" onclick="openBankTxnModal()">+ حركة بنكية جديد</button>
        <button class="btn btn-primary" onclick="openBankModal()">+ حساب بنكي جديد</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header" style="margin-bottom:16px;">
        <h1 class="page-title" style="font-size:22px;font-weight:900;">🏦 إدارة الحسابات البنكية والتحويلات الرسمية</h1>
        <p class="page-subtitle" style="color:var(--text-3);font-size:13px;">إدارة الحسابات البنكية السعودية (الراجحي، الأهلي، الرياض...) والتحويلات الإيداعية والمصروفات البنكية</p>
      </div>

      <!-- Luxury Color Cards Grid for Banks -->
      <div class="grid-3 gap-16 mb-24" id="ba-grid">
        <div class="page-loading"><div class="loading-spinner"></div></div>
      </div>

      <!-- Filter Bar for Bank Transactions -->
      <div class="card" style="margin-bottom:24px;">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border-soft);">
          <div>
            <h3 style="font-size:16px;font-weight:800;margin:0;" id="ba-txn-table-title">📑 سجل ودعم كشف الحركات البنكية</h3>
            <p style="font-size:12px;color:var(--text-3);margin:2px 0 0 0;" id="ba-txn-table-subtitle">انقر على أي كارت بنكي بالأعلى للتصفية المباشرة عليه أو استعراض كشف الحساب البنكي التفصيلي</p>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-reset-bank-filter" onclick="filterBankTxnsByCard('')" style="display:none;">✕ عرض كافة البنوك</button>
        </div>

        <div style="padding:14px 20px;background:var(--bg-2);border-bottom:1px solid var(--border-soft);display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <div style="flex:1;min-width:180px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">تصفية بالبنك</label>
            <select id="filter-ba-box" class="input" onchange="applyBankTxnFilters()" style="font-size:12.5px;">
              <option value="">جميع الحسابات البنكية</option>
            </select>
          </div>
          <div style="width:140px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">من تاريخ</label>
            <input type="date" id="filter-ba-from" class="input" onchange="applyBankTxnFilters()" style="font-size:12px;" />
          </div>
          <div style="width:140px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">إلى تاريخ</label>
            <input type="date" id="filter-ba-to" class="input" onchange="applyBankTxnFilters()" style="font-size:12px;" />
          </div>
          <div style="width:140px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">نوع الحركة</label>
            <select id="filter-ba-type" class="input" onchange="applyBankTxnFilters()" style="font-size:12.5px;">
              <option value="">كل الحركات</option>
              <option value="in">إيداعات واردة (+)</option>
              <option value="out">حوالات صادرة (-)</option>
            </select>
          </div>
          <div style="flex:1;min-width:200px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">🔍 بحث بالبيان / المرجع</label>
            <input type="text" id="filter-ba-search" class="input" placeholder="اكتب بياناً أو مرجعاً للبحث..." oninput="applyBankTxnFilters()" style="font-size:12.5px;" />
          </div>
        </div>

        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>البنك</th>
                <th>نوع الحركة</th>
                <th>رقم المرجع / الحوالة</th>
                <th>البيان</th>
                <th>المبلغ</th>
                <th>الرصيد بعد الحركة</th>
              </tr>
            </thead>
            <tbody id="ba-tbody">
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

    <!-- ═══ MODAL: NEW / EDIT BANK ACCOUNT ═══ -->
    <div class="modal-overlay" id="ba-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="ba-modal-title">إضافة حساب بنكي</h3>
          <button class="modal-close" onclick="closeModal('ba-modal')">×</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="ba-edit-id" />
          <div class="form-group mb-16">
            <label>اسم البنك / الحساب *</label>
            <input type="text" id="ba-name" class="input" placeholder="مثال: مصرف الراجحي — الحساب الرئيسي" />
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>رقم الحساب</label>
              <input type="text" id="ba-acc-num" class="input mono" placeholder="1234567890" />
            </div>
            <div class="form-group">
              <label>رقم الآيبان (IBAN)</label>
              <input type="text" id="ba-iban" class="input mono" placeholder="SA0000000000000000000000" />
            </div>
          </div>
          <div class="form-group mb-16">
            <label>الرصيد الافتتاحي (ر.س)</label>
            <input type="number" id="ba-opening" class="input mono" step="0.01" placeholder="0.00" />
          </div>
          <div class="form-group mb-16" id="ba-coa-toggle-wrap" style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="ba-coa-toggle" checked style="width:16px;height:16px;cursor:pointer;" />
            <label for="ba-coa-toggle" style="margin-bottom:0;cursor:pointer;font-weight:bold;">إنشاء حساب مستقل في شجرة الحسابات</label>
          </div>
          <div id="ba-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('ba-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveBankAccount()" id="save-ba-btn">حفظ الحساب</button>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: BANK TRANSACTION ═══ -->
    <div class="modal-overlay" id="ba-txn-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">تسجيل حركة بنكية</h3>
          <button class="modal-close" onclick="closeModal('ba-txn-modal')">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group mb-16">
            <label>الحساب البنكي *</label>
            <select id="btxn-acc"></select>
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>نوع الحركة *</label>
              <select id="btxn-type">
                <option value="in">إيداع / تحويل وارد (+)</option>
                <option value="out">سحب / تحويل صادرة (-)</option>
              </select>
            </div>
            <div class="form-group">
              <label>المبلغ (ر.س) *</label>
              <input type="number" id="btxn-amount" class="input mono" step="0.01" min="0.01" />
            </div>
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>رقم مرجع الحوالة</label>
              <input type="text" id="btxn-ref" class="input mono" placeholder="TRX-987654" />
            </div>
            <div class="form-group">
              <label>البيان / الملاحظات *</label>
              <input type="text" id="btxn-notes" class="input" placeholder="مثال: تحويل سداد عميل، سداد مورد..." />
            </div>
          </div>
          <div id="btxn-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('ba-txn-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveBankTxn()" id="save-btxn-btn">💾 حفظ الحركة</button>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: DETAILED BANK STATEMENT OF ACCOUNT ═══ -->
    <div class="modal-overlay" id="ba-statement-modal">
      <div class="modal modal-lg" style="max-width:920px;border-radius:20px;overflow:hidden;">
        <div class="modal-header" style="background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);color:#fff;padding:18px 24px;">
          <h3 class="modal-title" id="ba-stmt-modal-title" style="color:#fff;font-size:18px;font-weight:900;">📄 كشف حساب بنكي تفصيلي رسمي</h3>
          <button class="modal-close" onclick="closeModal('ba-statement-modal')" style="color:#fff;opacity:0.8;">×</button>
        </div>
        <div class="modal-body" id="ba-stmt-body" style="padding:20px;background:#f8fafc;">
          <!-- Loaded dynamically -->
        </div>
        <div class="modal-footer" style="background:#f1f5f9;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;">
          <button class="btn btn-secondary" onclick="closeModal('ba-statement-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="printBankStatementHTML()">🖨️ طباعة رسمية لكشف الحساب البنكي</button>
        </div>
      </div>
    </div>
  `;

  await loadBankAccounts();
  await loadBankTxns();
}

async function loadBankAccounts() {
  const grid = document.getElementById("ba-grid");
  const selectFilter = document.getElementById("filter-ba-box");
  if (!grid) return;

  try {
    clearERPCache(COLS.bankAccounts().path);
    clearERPCache(COLS.chartOfAccounts().path);
    bankAccounts = await getAll(COLS.bankAccounts(), [orderBy("name")]);
    const coaAccounts = await getAll(COLS.chartOfAccounts());

    // Self-healing balance sync
    for (const b of bankAccounts) {
      const acc = coaAccounts.find(a => a.id === b.accountId || a.code === b.accountCode);
      if (acc) {
        const coaBal = acc.balance || 0;
        if (b.balance !== coaBal) {
          b.balance = coaBal;
          await update("bankAccounts", b.id, { balance: coaBal });
        }
      }
    }

    if (selectFilter) {
      selectFilter.innerHTML = '<option value="">جميع الحسابات البنكية</option>' +
        bankAccounts.map(b => `<option value="${b.id}" ${b.id === _selectedBankFilter ? 'selected' : ''}>${b.name}</option>`).join("");
    }

    if (bankAccounts.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:span 3;"><div class="empty-icon">🏦</div><h3>لا توجد حسابات بنكية</h3><p>اضغط على "حساب بنكي جديد" لإضافة حسابك في البنك</p></div>`;
      return;
    }

    grid.innerHTML = bankAccounts.map(b => {
      const theme = _getBankTheme(b);
      const isSelected = _selectedBankFilter === b.id;

      return `
        <div class="card ba-card-interactive" onclick="filterBankTxnsByCard('${b.id}')" style="background:${theme.gradient}; border:${theme.border}; box-shadow:${theme.shadow}; color:#ffffff !important; padding:22px; border-radius:18px; cursor:pointer; position:relative; overflow:hidden; transition:transform 0.2s ease, box-shadow 0.2s ease; ${isSelected ? 'outline:3.5px solid #ffffff;transform:scale(1.02);' : ''}">
          
          <div style="position:absolute; top:-15px; left:-15px; font-size:90px; opacity:0.15; pointer-events:none;">${theme.icon}</div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; position:relative; z-index:2;">
            <span style="background:rgba(255,255,255,0.22); border:1px solid rgba(255,255,255,0.4); color:#ffffff !important; font-size:11px; font-weight:800; padding:4px 12px; border-radius:20px; backdrop-filter:blur(4px); text-shadow:0 1px 2px rgba(0,0,0,0.3);">
              ${theme.icon} ${theme.badgeText}
            </span>
            <div style="display:flex; gap:6px;" onclick="event.stopPropagation();">
              <button class="btn btn-icon sm" onclick="openBankStatementModal('${b.id}')" style="background:rgba(255,255,255,0.25); color:#ffffff !important; border:1px solid rgba(255,255,255,0.3);" title="كشف حساب تفصيلي">📄</button>
              <button class="btn btn-icon sm" onclick="openBankModal('${b.id}')" style="background:rgba(255,255,255,0.25); color:#ffffff !important; border:1px solid rgba(255,255,255,0.3);" title="تعديل">✏️</button>
              <button class="btn btn-icon sm" onclick="deleteBankAccount('${b.id}','${b.name}')" style="background:rgba(239,68,68,0.4); color:#ffffff !important; border:1px solid rgba(255,255,255,0.3);" title="حذف">🗑️</button>
            </div>
          </div>

          <h3 style="font-size:18px; font-weight:900; margin-bottom:6px; color:#ffffff !important; text-shadow:0 1px 3px rgba(0,0,0,0.4); position:relative; z-index:2;">${b.name}</h3>
          <div style="font-size:12px; color:rgba(255,255,255,0.92) !important; margin-bottom:16px; position:relative; z-index:2;">IBAN: <span style="font-family:monospace;font-weight:800;color:#ffffff !important;">${b.iban || "—"}</span></div>

          <div style="background:rgba(255,255,255,0.15); border-radius:12px; padding:12px 16px; border:1px solid rgba(255,255,255,0.3); backdrop-filter:blur(6px); display:flex; justify-content:space-between; align-items:center; position:relative; z-index:2;">
            <span style="font-size:12px; font-weight:800; color:#ffffff !important; text-shadow:0 1px 2px rgba(0,0,0,0.3);">الرصيد الحالي</span>
            <span class="mono" style="font-size:23px; font-weight:900; direction:ltr; color:#ffffff !important; text-shadow:0 2px 4px rgba(0,0,0,0.4);">${formatCurrency(b.balance || 0)}</span>
          </div>

          <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:rgba(255,255,255,0.95) !important; font-weight:700; position:relative; z-index:2;">
            <span style="color:#ffffff !important;">${isSelected ? '🎯 تصفية نشطة' : 'انقر لتصفية الجدول 🔍'}</span>
            <span style="text-decoration:underline; cursor:pointer; color:#ffffff !important;" onclick="event.stopPropagation(); openBankStatementModal('${b.id}')">كشف حساب 📄</span>
          </div>
        </div>`;
    }).join("");

  } catch (err) {
    grid.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
}

async function loadBankTxns() {
  const tbody = document.getElementById("ba-tbody");
  if (!tbody) return;

  try {
    const q = query(COLS.bankTransactions(), orderBy("createdAt", "desc"), limit(200));
    const snap = await getDocs(q);
    _allBankTxns = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    applyBankTxnFilters();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="alert bad" style="margin:8px;">${err.message}</div></td></tr>`;
  }
}

window.filterBankTxnsByCard = (bankId) => {
  _selectedBankFilter = bankId;
  const selectEl = document.getElementById("filter-ba-box");
  if (selectEl) selectEl.value = bankId;

  const btnReset = document.getElementById("btn-reset-bank-filter");
  if (btnReset) btnReset.style.display = bankId ? "inline-block" : "none";

  loadBankAccounts();
  applyBankTxnFilters();
};

window.applyBankTxnFilters = () => {
  const bankId = document.getElementById("filter-ba-box")?.value || _selectedBankFilter || "";
  const from   = document.getElementById("filter-ba-from")?.value || "";
  const to     = document.getElementById("filter-ba-to")?.value || "";
  const type   = document.getElementById("filter-ba-type")?.value || "";
  const search = (document.getElementById("filter-ba-search")?.value || "").trim().toLowerCase();

  const tbody = document.getElementById("ba-tbody");
  const titleEl = document.getElementById("ba-txn-table-title");
  const subtitleEl = document.getElementById("ba-txn-table-subtitle");

  if (!tbody) return;

  let filtered = [..._allBankTxns];

  if (bankId) {
    filtered = filtered.filter(t => t.bankAccountId === bankId);
    const bank = bankAccounts.find(b => b.id === bankId);
    if (titleEl) titleEl.textContent = `📑 كشف حركات: ${bank ? bank.name : 'الحساب البنكي'}`;
    if (subtitleEl) subtitleEl.textContent = `سجل الحركات المصروفة والمقيدة للحساب البنكي (${filtered.length} حركة)`;
  } else {
    if (titleEl) titleEl.textContent = "📑 سجل ودعم كشف الحركات البنكية الأخيرة";
    if (subtitleEl) subtitleEl.textContent = "انقر على أي كارت بنكي بالأعلى للتصفية المباشرة عليه أو استعراض كشف الحساب التفصيلي";
  }

  if (from) filtered = filtered.filter(t => t.createdAt && (t.createdAt.seconds ? formatDate(t.createdAt) >= from : true));
  if (to)   filtered = filtered.filter(t => t.createdAt && (t.createdAt.seconds ? formatDate(t.createdAt) <= to : true));
  if (type) filtered = filtered.filter(t => t.type === type);
  if (search) {
    filtered = filtered.filter(t => 
      (t.notes || "").toLowerCase().includes(search) ||
      (t.refNumber || "").toLowerCase().includes(search) ||
      (t.bankAccountId || "").toLowerCase().includes(search)
    );
  }

  const bMap = {};
  bankAccounts.forEach(b => bMap[b.id] = b.name);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:36px;color:var(--text-2);font-weight:700;">🔍 لا توجد حركات بنكية مطابقة للتصفية المختارة</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(t => {
    const isIncome = t.type === 'in';
    const badgeStyle = isIncome
      ? 'background:#eff6ff;color:#1d4ed8;border:1px solid #93c5fd;font-weight:800;'
      : 'background:#fef2f2;color:#dc2626;border:1px solid #fecaca;font-weight:800;';

    return `
      <tr style="transition:all 0.15s ease;">
        <td class="mono font-bold" style="font-size:12.5px;">${formatDate(t.createdAt)}</td>
        <td><strong style="color:var(--text-1);">${bMap[t.bankAccountId] || t.bankAccountId}</strong></td>
        <td><span class="badge" style="${badgeStyle}padding:4px 10px;border-radius:8px;">${isIncome ? 'إيداع وارد (+)' : 'سحب / تحويل (-)'}</span></td>
        <td class="mono font-bold" style="font-size:11.5px;"><span dir="ltr" style="background:var(--bg-2);padding:2px 8px;border-radius:6px;">${t.refNumber || "—"}</span></td>
        <td><span style="font-size:12.5px;color:var(--text-2);font-weight:600;">${t.notes || "—"}</span></td>
        <td class="mono font-bold ${isIncome ? 'text-ok' : 'text-bad'}" style="font-size:13.5px;">${isIncome ? '+' : '-'}${formatCurrency(t.amount)}</td>
        <td class="mono font-bold" style="font-size:12.5px;"><span dir="ltr" style="display:inline-block;direction:ltr;background:var(--bg-2);padding:2px 8px;border-radius:6px;">${formatCurrency(t.balanceAfter || 0)}</span></td>
      </tr>`;
  }).join("");
};

// ─────────────────────────────────────────────────────────────────────────────
// Detailed Bank Statement of Account Implementation
// ─────────────────────────────────────────────────────────────────────────────
window.openBankStatementModal = async (bankId) => {
  const bank = bankAccounts.find(b => b.id === bankId);
  if (!bank) return;

  _activeBankStatement = bank;
  const titleEl = document.getElementById("ba-stmt-modal-title");
  const bodyEl = document.getElementById("ba-stmt-body");

  if (titleEl) titleEl.textContent = `📄 كشف حساب بنكي تفصيلي رسمي — ${bank.name}`;
  if (bodyEl) bodyEl.innerHTML = `<div style="text-align:center;padding:40px;"><span class="spin"></span> جاري تجميع وتحليل الحركات البنكية لحساب ${bank.name}…</div>`;

  openModal("ba-statement-modal");

  try {
    const [txnsSnap, rcptsSnap, expsSnap] = await Promise.all([
      getDocs(query(COLS.bankTransactions(), where("bankAccountId", "==", bankId))),
      getDocs(query(COLS.receipts(), where("sourceId", "==", bankId))),
      getDocs(query(COLS.expenses(), where("sourceId", "==", bankId)))
    ]);

    const items = [];

    txnsSnap.forEach(d => {
      const data = d.data();
      const dt = data.createdAt?.seconds ? formatDate(data.createdAt) : (data.date || todayString());
      items.push({
        date: dt,
        type: data.type === "in" ? "إيداع بنكي" : "حوالة صادرة",
        notes: data.notes || "حركة بنكية",
        inflow: data.type === "in" ? (data.amount || 0) : 0,
        outflow: data.type === "out" ? (data.amount || 0) : 0,
        ref: data.refNumber || `BTX-${d.id.substring(0,6).toUpperCase()}`
      });
    });

    rcptsSnap.forEach(d => {
      const data = d.data();
      items.push({
        date: data.date || todayString(),
        type: "تحويل بنكي وارد (سند قبض)",
        notes: `تحصيل من: ${data.accountName || 'جهة'} — ${data.notes || ''}`,
        inflow: data.amount || 0,
        outflow: 0,
        ref: data.displayCode || `RV-${d.id.substring(0,6).toUpperCase()}`
      });
    });

    expsSnap.forEach(d => {
      const data = d.data();
      items.push({
        date: data.date || todayString(),
        type: "تحويل بنكي صادر (سند صرف)",
        notes: `صرف لصالح: ${data.accountName || 'جهة'} — ${data.notes || ''}`,
        inflow: 0,
        outflow: data.amount || 0,
        ref: `PV-${d.id.substring(0,6).toUpperCase()}`
      });
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

    _activeBankStatementRows = items;

    bodyEl.innerHTML = `
      <!-- Bank Info Banner -->
      <div style="background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); border-radius:14px; padding:20px; color:#fff; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div>
          <div style="font-size:12px; color:#93c5fd; font-weight:700; text-transform:uppercase;">كشف حساب بنكي تفصيلي معتمد</div>
          <h2 style="font-size:22px; font-weight:900; margin:4px 0 2px 0;">${bank.name}</h2>
          <div style="font-size:12.5px; color:#cbd5e1;">رقم الآيبان IBAN: <span style="font-family:monospace;font-weight:800;color:#fff;">${bank.iban || "—"}</span> ${bank.accountNumber ? `| رقم الحساب: <span style="font-family:monospace;">${bank.accountNumber}</span>` : ''}</div>
        </div>
        <div style="text-align:left; background:rgba(255,255,255,0.1); padding:10px 18px; border-radius:12px; border:1px solid rgba(255,255,255,0.2);">
          <div style="font-size:11px; color:#93c5fd;">الرصيد الفعلي في البنك</div>
          <div class="mono" style="font-size:24px; font-weight:900; direction:ltr; color:#ffffff;">${formatCurrency(bank.balance || 0)}</div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid-3 gap-12 mb-16">
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:14px; text-align:center;">
          <div style="font-size:11px; color:#1d4ed8; font-weight:800;">إجمالي التحويلات الواردة (+)</div>
          <div class="mono text-ok" style="font-size:18px; font-weight:900; margin-top:2px;">+${formatCurrency(totalIn)}</div>
        </div>
        <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:14px; text-align:center;">
          <div style="font-size:11px; color:#dc2626; font-weight:800;">إجمالي التحويلات الصادرة (-)</div>
          <div class="mono text-bad" style="font-size:18px; font-weight:900; margin-top:2px;">-${formatCurrency(totalOut)}</div>
        </div>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px; text-align:center;">
          <div style="font-size:11px; color:#334155; font-weight:800;">إجمالي عدد العمليات المقيدة</div>
          <div class="mono" style="font-size:18px; font-weight:900; color:#0f172a; margin-top:2px;">${items.length} حركة</div>
        </div>
      </div>

      <!-- Statement Table -->
      <div class="table-container" style="background:#fff; border-radius:12px; border:1px solid #e2e8f0;">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="padding:10px;">التاريخ</th>
              <th style="padding:10px;">نوع الحركة</th>
              <th style="padding:10px;">المرجع / الحوالة</th>
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
                <td class="mono font-bold" style="text-align:left;font-size:12.5px;"><span dir="ltr" style="display:inline-block;direction:ltr;background:#f8fafc;padding:3px 8px;border-radius:6px;border:1px solid #cbd5e1;">${formatCurrency(item.balanceAfter)}</span></td>
              </tr>
            `).join("") : `<tr><td colspan="7" style="text-align:center;padding:30px;color:#64748b;">لا توجد حركات بنكية مقيدة لهذا الحساب حالياً</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    bodyEl.innerHTML = `<div class="alert bad">خطأ في جلب كشف الحساب التفصيلي: ${err.message}</div>`;
  }
};

window.printBankStatementHTML = () => {
  if (!_activeBankStatement) return;
  const win = window.open("", "_blank", "width=900,height=750");
  const bank = _activeBankStatement;
  const rows = _activeBankStatementRows;

  win.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>كشف حساب بنكي رسمي — ${bank.name}</title>
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
      <h1 style="font-size:20px;font-weight:900;">كشف حساب بنكي تفصيلي رسمي</h1>
      <h2 style="font-size:16px;font-weight:700;color:#93c5fd;margin-top:4px;">${bank.name}</h2>
      <div style="font-size:11px;color:#cbd5e1;margin-top:4px;">رقم الآيبان IBAN: ${bank.iban || "—"} ${bank.accountNumber ? `| رقم الحساب: ${bank.accountNumber}` : ''}</div>
    </div>
    <div style="text-align:left;">
      <div style="font-size:11px;color:#93c5fd;">الرصيد الفعلي الحسابي</div>
      <div class="mono" style="font-size:24px;font-weight:900;direction:ltr;">${formatCurrency(bank.balance || 0)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>التاريخ</th>
        <th>نوع الحركة</th>
        <th>المرجع / الحوالة</th>
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
          <td class="mono" style="text-align:left;font-weight:900;" dir="ltr">${formatCurrency(r.balanceAfter)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <div style="margin-top:30px;padding-top:15px;border-top:1px dashed #94a3b8;display:flex;justify-content:space-between;font-size:11px;color:#64748b;">
    <div>طُبع رسمياً من نظام إدهام ERP بتاريخ: ${new Date().toLocaleString("ar-SA")}</div>
    <div>توقيع المحاسب / اعتماد المدير المالي: .......................................</div>
  </div>
</body>
</html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); win.close(); }, 600);
};

// ─────────────────────────────────────────────────────────────────────────────
// Modal Forms Implementation
// ─────────────────────────────────────────────────────────────────────────────
window.openBankModal = (id = "") => {
  const opGroup = document.getElementById("ba-opening")?.closest(".form-group");
  const coaWrap = document.getElementById("ba-coa-toggle-wrap");
  
  if (id) {
    const b = bankAccounts.find(x => x.id === id);
    if (!b) return;
    document.getElementById("ba-edit-id").value = b.id;
    document.getElementById("ba-name").value = b.name || "";
    document.getElementById("ba-acc-num").value = b.accountNumber || "";
    document.getElementById("ba-iban").value = b.iban || "";
    document.getElementById("ba-opening").value = b.openingBalance || 0;
    
    if (opGroup) opGroup.style.display = "none";
    if (coaWrap) coaWrap.style.display = "none";
  } else {
    document.getElementById("ba-edit-id").value = "";
    document.getElementById("ba-name").value = "";
    document.getElementById("ba-acc-num").value = "";
    document.getElementById("ba-iban").value = "";
    document.getElementById("ba-opening").value = "";
    
    if (opGroup) opGroup.style.display = "block";
    if (coaWrap) coaWrap.style.display = "flex";
  }
  
  document.getElementById("ba-error").classList.add("hidden");
  openModal("ba-modal");
};

window.saveBankAccount = async () => {
  const errEl = document.getElementById("ba-error");
  errEl.classList.add("hidden");

  const editId = document.getElementById("ba-edit-id").value;
  const name   = document.getElementById("ba-name").value.trim();
  const accountNumber = document.getElementById("ba-acc-num").value.trim();
  const iban = document.getElementById("ba-iban").value.trim();
  const openingBalance = parseFloat(document.getElementById("ba-opening")?.value) || 0;
  const createCoa = document.getElementById("ba-coa-toggle")?.checked ?? true;

  if (!name) { errEl.textContent = "يرجى أدخال اسم الحساب البنكي"; errEl.classList.remove("hidden"); return; }

  const btn = document.getElementById("save-ba-btn");
  btn.disabled = true;

  try {
    if (editId) {
      const b = bankAccounts.find(x => x.id === editId);
      await update(COLS.bankAccounts(), editId, { name, accountNumber, iban });
      if (b?.accountId) {
        await update(COLS.chartOfAccounts(), b.accountId, { name });
      }
      showToast("تم تحديث بيانات الحساب البنكي بنجاح", "success");
    } else {
      let accountId = null;
      let accountCode = null;

      if (createCoa) {
        const coaDoc = await syncEntityToCoa({
          entityId: "temp",
          entityType: "bankAccount",
          name,
          parentCode: "1-1-1-3"
        });
        if (coaDoc) {
          accountId = coaDoc.id;
          accountCode = coaDoc.code;
        }
      }

      await create(COLS.bankAccounts(), {
        name,
        accountNumber,
        iban,
        openingBalance,
        balance: openingBalance,
        accountId,
        accountCode
      });
      showToast("تم إضافة الحساب البنكي بنجاح", "success");
    }

    closeModal("ba-modal");
    await loadBankAccounts();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally { btn.disabled = false; }
};

window.deleteBankAccount = async (id, name) => {
  const confirmed = await window.showConfirm?.(`هل أنت متأكد من حذف الحساب البنكي ${name}؟`, "حذف حساب بنكي");
  if (!confirmed) return;

  try {
    const b = bankAccounts.find(x => x.id === id);
    await remove(COLS.bankAccounts(), id);
    if (b?.accountId) {
      await deleteEntityInCoa(b.accountId);
    }
    showToast("تم حذف الحساب البنكي بنجاح", "success");
    await loadBankAccounts();
  } catch (err) {
    showToast("خطأ في الحذف: " + err.message, "error");
  }
};

window.openBankTxnModal = () => {
  const sel = document.getElementById("btxn-acc");
  if (bankAccounts.length === 0) { showToast("قم بإضافة حساب بنكي أولاً", "warning"); return; }
  sel.innerHTML = bankAccounts.map(b => `<option value="${b.id}">${b.name} (${formatCurrency(b.balance || 0)})</option>`).join("");
  document.getElementById("btxn-type").value = "in";
  document.getElementById("btxn-amount").value = "";
  document.getElementById("btxn-ref").value = "";
  document.getElementById("btxn-notes").value = "";
  document.getElementById("btxn-error").classList.add("hidden");
  openModal("ba-txn-modal");
};

window.saveBankTxn = async () => {
  const errEl = document.getElementById("btxn-error");
  errEl.classList.add("hidden");

  const bankAccountId = document.getElementById("btxn-acc").value;
  const type   = document.getElementById("btxn-type").value;
  const amount = parseFloat(document.getElementById("btxn-amount").value) || 0;
  const refNumber = document.getElementById("btxn-ref").value.trim();
  const notes  = document.getElementById("btxn-notes").value.trim();

  if (!bankAccountId) { errEl.textContent = "اختر الحساب البنكي"; errEl.classList.remove("hidden"); return; }
  if (amount <= 0) { errEl.textContent = "المبلغ غير صحيح"; errEl.classList.remove("hidden"); return; }
  if (!notes) { errEl.textContent = "أدخل البيان والتفاصيل"; errEl.classList.remove("hidden"); return; }

  const btn = document.getElementById("save-btxn-btn");
  btn.disabled = true;

  try {
    const bankRef = doc(db, `companies/${COMPANY_ID}/bankAccounts`, bankAccountId);
    let balanceAfter = 0;
    let bankCode = "1-1-1-3-2";
    let bankName = "مصرف الراجحي";

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(bankRef);
      if (!snap.exists()) throw new Error("الحساب البنكي غير موجود");
      const bankData = snap.data();
      const current = bankData.balance || 0;
      const delta   = type === "in" ? +amount : -amount;
      balanceAfter  = current + delta;
      if (balanceAfter < 0 && type === "out") throw new Error(`رصيد الحساب البنكي غير كافٍ: ${current} < ${amount}`);

      bankCode = bankData.accountCode || "1-1-1-3-2";
      bankName = bankData.name;

      tx.update(bankRef, { balance: balanceAfter, updatedAt: serverTimestamp() });

      const txnRef = doc(collection(db, `companies/${COMPANY_ID}/bankTransactions`));
      tx.set(txnRef, {
        bankAccountId, type, amount, refNumber, notes, balanceAfter, createdAt: serverTimestamp(),
      });
    });

    try {
      const debitCode  = type === 'in' ? bankCode : '6-9-1';
      const debitName  = type === 'in' ? bankName : 'مصاريف بنكية ومشاريع';
      const creditCode = type === 'in' ? '4-9-1'  : bankCode;
      const creditName = type === 'in' ? 'إيرادات بنكية' : bankName;
      await createJournalEntry({
        date:        new Date().toISOString().split('T')[0],
        description: `حركة بنكية — ${notes} — مرجع: ${refNumber || '—'} — بنك: ${bankName}`,
        sourceType:  'bankTransaction',
        lines: [
          { accountCode: debitCode,  accountName: debitName,  debit: amount, credit: 0 },
          { accountCode: creditCode, accountName: creditName, debit: 0, credit: amount },
        ],
        status: 'posted',
        createdByName: 'النظام',
      });
    } catch (jeErr) {
      console.warn('[BankTxn JE] Failed (non-fatal):', jeErr.message);
    }

    showToast("تم تسجيل الحركة البنكية بنجاح", "success");
    closeModal("ba-txn-modal");
    await loadBankAccounts();
    await loadBankTxns();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally { btn.disabled = false; }
};
