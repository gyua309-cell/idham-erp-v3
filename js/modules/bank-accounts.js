
// Alias for card button clicks
window.openBankStatementModal = (bankId) => window.openBankAccountStatementModal(bankId);
// ============================================================
// IDHAM ERP — Bank Accounts Module (الحسابات البنكية والتحويلات)
// ============================================================
import { COLS, create, update, remove, getAll, createJournalEntry } from "../utils/db.js";
import { query, orderBy, limit, getDocs, where, doc, getDoc, runTransaction, serverTimestamp, collection } from "../utils/db.js";
import { syncEntityToCoa, deleteEntityInCoa } from "../utils/coa-connector.js";
import { formatCurrency, formatDate, todayString } from "../utils/formatters.js";
import { db, COMPANY_ID } from "../firebase-config.js";

let bankAccounts = [];
let _allBankTxns = [];
let _selectedBankFilter = "";
let _activeBankStatement = null;
let _activeBankStatementRows = [];

function _normAr(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي");
}

function _getBankTheme(b) {
  const name = _normAr(b.name || "");
  if (name.includes("راجحي") || name.includes("alrajhi") || name.includes("al-rajhi")) {
    return {
      gradient: "linear-gradient(135deg, #1e3a8a 0%, #172554 100%)",
      border: "1.5px solid #3b82f6",
      shadow: "0 14px 30px -5px rgba(30,58,138,0.5)",
      icon: "🏛️",
      badgeText: "مصرف الراجحي"
    };
  } else if (name.includes("اهلي") || name.includes("snb")) {
    return {
      gradient: "linear-gradient(135deg, #065f46 0%, #022c22 100%)",
      border: "1.5px solid #10b981",
      shadow: "0 14px 30px -5px rgba(6,95,70,0.5)",
      icon: "🏢",
      badgeText: "البنك الأهلي SNB"
    };
  } else if (name.includes("جزير") || name.includes("jazira")) {
    return {
      gradient: "linear-gradient(135deg, #0369a1 0%, #082f49 100%)",
      border: "1.5px solid #38bdf8",
      shadow: "0 14px 30px -5px rgba(2,132,199,0.5)",
      icon: "🌊",
      badgeText: "بنك الجزيرة"
    };
  } else if (name.includes("رياض") || name.includes("riyad")) {
    return {
      gradient: "linear-gradient(135deg, #9a3412 0%, #431407 100%)",
      border: "1.5px solid #f97316",
      shadow: "0 14px 30px -5px rgba(154,52,18,0.5)",
      icon: "🏧",
      badgeText: "بنك الرياض"
    };
  } else if (name.includes("انما") || name.includes("alinma")) {
    return {
      gradient: "linear-gradient(135deg, #78350f 0%, #451a03 100%)",
      border: "1.5px solid #f59e0b",
      shadow: "0 14px 30px -5px rgba(217,119,6,0.5)",
      icon: "🌾",
      badgeText: "مصرف الإنماء"
    };
  } else if (name.includes("بلاد") || name.includes("bilad")) {
    return {
      gradient: "linear-gradient(135deg, #831843 0%, #500724 100%)",
      border: "1.5px solid #f43f5e",
      shadow: "0 14px 30px -5px rgba(225,29,72,0.5)",
      icon: "💎",
      badgeText: "بنك البلاد"
    };
  } else {
    return {
      gradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      border: "1.5px solid #64748b",
      shadow: "0 14px 30px -5px rgba(15,23,42,0.5)",
      icon: "🏦",
      badgeText: "حساب بنكي رسمي"
    };
  }
}


function _buildBankCardsHtml(accounts) {
  if (!accounts || accounts.length === 0) {
    return `<div class="empty-state" style="grid-column:span 3;"><div class="empty-icon">🏦</div><h3>لا توجد حسابات بنكية</h3><p>اضغط على "حساب بنكي جديد" لإضافة حسابك في البنك</p></div>`;
  }
  return accounts.map(b => {
    const theme = _getBankTheme(b);
    const isSelected = _selectedBankFilter === b.id;

    return `
      <div class="card ba-card-luxury ba-card-interactive" onclick="filterBankTxnsByCard('${b.id}')" style="background:${theme.gradient}; border:${theme.border}; box-shadow:${theme.shadow}; cursor:pointer; ${isSelected ? 'outline:3.5px solid #ffffff;transform:scale(1.02);' : ''}">
        
        <div style="position:absolute; top:-15px; left:-15px; font-size:95px; opacity:0.12; pointer-events:none; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">${theme.icon}</div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; position:relative; z-index:2;">
          <span class="ba-badge" style="font-size:11.5px; display:inline-flex; align-items:center; gap:6px;">
            <span>${theme.icon}</span> <span>${theme.badgeText}</span>
          </span>
          <div style="display:flex; gap:6px;" onclick="event.stopPropagation();">
            <button class="btn btn-icon sm" onclick="openBankStatementModal('${b.id}')" style="background:rgba(255,255,255,0.22); color:#ffffff !important; border:1px solid rgba(255,255,255,0.3); border-radius:8px;" title="كشف حساب تفصيلي">📄</button>
            <button class="btn btn-icon sm" onclick="openBankModal('${b.id}')" style="background:rgba(255,255,255,0.22); color:#ffffff !important; border:1px solid rgba(255,255,255,0.3); border-radius:8px;" title="تعديل">✏️</button>
            <button class="btn btn-icon sm" onclick="deleteBankAccount('${b.id}','${b.name}')" style="background:rgba(239,68,68,0.4); color:#ffffff !important; border:1px solid rgba(239,68,68,0.6); border-radius:8px;" title="حذف">🗑️</button>
          </div>
        </div>

        <h3 class="ba-bank-title" style="margin:0 0 6px 0; position:relative; z-index:2;">${b.name}</h3>
        
        <div class="ba-iban-text" style="margin-bottom:14px; position:relative; z-index:2; display:flex; align-items:center; gap:6px;">
          <span style="opacity:0.85;">الآيبان:</span>
          <span style="font-family:var(--font-mono, monospace); font-weight:800; direction:ltr; letter-spacing:0.5px; color:#ffffff !important;">${b.iban || "غير مسجل"}</span>
          ${b.iban ? `<button class="btn btn-icon sm" onclick="event.stopPropagation(); navigator.clipboard.writeText('${b.iban}'); alert('تم نسخ الآيبان ✅');" style="background:transparent; border:none; color:#ffffff !important; padding:0 2px; font-size:12px; cursor:pointer;" title="نسخ الآيبان">📋</button>` : ""}
        </div>

        <div class="ba-amount-box" style="position:relative; z-index:2;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:rgba(255,255,255,0.95) !important;">💰 الرصيد الحالي المتاح</span>
            <span style="font-size:10.5px; font-weight:800; background:rgba(16,185,129,0.35); border:1px solid rgba(16,185,129,0.6); padding:2px 8px; border-radius:12px; color:#a7f3d0 !important;">رصيد مباشر</span>
          </div>
          <div class="ba-balance-value" style="direction:ltr; text-align:right;">
            ${formatCurrency(b.balance || 0)}
          </div>
        </div>

        <div style="margin-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:11.5px; position:relative; z-index:2;">
          <span style="color:rgba(255,255,255,0.95) !important; font-weight:700;">
            ${isSelected ? '🎯 تصفية نشطة للجدول' : '🔍 انقر لتصفية الحركات'}
          </span>
          <button onclick="event.stopPropagation(); openBankStatementModal('${b.id}')" style="background:transparent; border:none; color:#ffffff !important; text-decoration:underline; font-size:11.5px; font-weight:800; cursor:pointer; padding:0;">
            كشف الحساب التفصيلي 📄
          </button>
        </div>
      </div>`;
  }).join("");
}

export async function render(container, user) {
  container.innerHTML = `
    <!-- Top Actions Header -->
    <div class="filterbar" style="flex-wrap:wrap;gap:10px;align-items:center;background:var(--bg-1);padding:14px 18px;border-radius:14px;border:1px solid var(--border-soft);margin-bottom:20px;">
      <div style="margin-right:auto;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="exportPagePDF('.data-dense','الحسابات_البنكية')" title="تصدير PDF">📄 PDF</button>
        <button class="btn btn-secondary btn-sm" onclick="exportBankStatementExcel()" title="تصدير كشف حساب بنكي Excel منسق" style="background:#10b981;color:#fff;border-color:#059669;font-weight:700;">📊 Excel منسق</button>
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
        ${bankAccounts && bankAccounts.length > 0 ? _buildBankCardsHtml(bankAccounts) : '<div class="page-loading"><div class="loading-spinner"></div></div>'}
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

        <!-- Dynamic Period Summary Strip -->
        <div id="ba-period-summary" style="display:none;padding:14px 20px;background:var(--bg-1);border-bottom:1px solid var(--border-soft);border-top:1px solid var(--border-soft);"></div>

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
        <div class="modal-footer" style="background:#f1f5f9;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <button class="btn btn-secondary" onclick="closeModal('ba-statement-modal')">إغلاق</button>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary" onclick="exportBankStatementExcel()" style="background:#10b981;color:#fff;border-color:#059669;font-weight:800;">📊 تصدير Excel منسق</button>
            <button class="btn btn-primary" onclick="printBankStatementHTML()">🖨️ طباعة رسمية لكشف الحساب البنكي</button>
          </div>
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
    const [fetchedBanks, coaAccounts] = await Promise.all([
      getAll(COLS.bankAccounts(), [orderBy("name")]),
      getAll(COLS.chartOfAccounts())
    ]);
    bankAccounts = fetchedBanks;

    // Seamless balance alignment from chartOfAccounts (0ms instant display, zero blocking writes)
    for (const b of bankAccounts) {
      const acc = coaAccounts.find(a => a.id === b.accountId || a.code === b.accountCode);
      if (acc && acc.balance !== undefined) {
        b.balance = acc.balance;
      }
    }

    if (selectFilter) {
      selectFilter.innerHTML = '<option value="">جميع الحسابات البنكية</option>' +
        bankAccounts.map(b => `<option value="${b.id}" ${b.id === _selectedBankFilter ? 'selected' : ''}>${b.name}</option>`).join("");
    }

    grid.innerHTML = _buildBankCardsHtml(bankAccounts);

    // If transactions are already loaded in memory, recompute their balances immediately with fresh bank balances
    if (_allBankTxns && _allBankTxns.length > 0) {
      _recomputeAllBankTxnBalances();
      applyBankTxnFilters();
    }
  } catch (err) {
    grid.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
}

function _findBankByAnyKey(key) {
  if (!key) return null;
  const k = String(key).trim();
  const kNorm = _normAr(k);
  return (bankAccounts || []).find(b =>
    b.id === k ||
    b.accountId === k ||
    b.accountCode === k ||
    _normAr(b.name) === kNorm ||
    _normAr(b.name).includes(kNorm) ||
    kNorm.includes(_normAr(b.name))
  ) || null;
}

function _recomputeAllBankTxnBalances() {
  if (!_allBankTxns || _allBankTxns.length === 0) return;

  const txnsByBank = {};
  _allBankTxns.forEach(t => {
    const bId = t.bankAccountId || "unknown";
    if (!txnsByBank[bId]) txnsByBank[bId] = [];
    txnsByBank[bId].push(t);
  });

  Object.keys(txnsByBank).forEach(bId => {
    const list = txnsByBank[bId];
    list.sort((a, b) => {
      const da = a.isoDate || "";
      const db = b.isoDate || "";
      const c = da.localeCompare(db);
      if (c !== 0) return c;
      return (a.ts || 0) - (b.ts || 0);
    });

    const sample = list[0] || {};
    const bank = _findBankByAnyKey(bId) || _findBankByAnyKey(sample.bankAccountName) || _findBankByAnyKey(sample.bankName);
    const currentBankBal = Number(bank?.balance || 0);

    let sumIn = 0;
    let sumOut = 0;
    list.forEach(t => { sumIn += t.inflow; sumOut += t.outflow; });

    // Base opening balance so that running balance ends exactly at currentBankBal
    const baseOpeningBal = currentBankBal - (sumIn - sumOut);
    let run = baseOpeningBal;

    list.forEach(t => {
      run += (t.inflow - t.outflow);
      t.computedBalanceAfter = Math.round(run * 100) / 100;
    });
  });
}

async function loadBankTxns() {
  const tbody = document.getElementById("ba-tbody");
  if (!tbody) return;

  // Ensure bank accounts with accurate balances are loaded first
  if (!bankAccounts || bankAccounts.length === 0) {
    await loadBankAccounts();
  }

  try {
    const q = query(COLS.bankTransactions(), orderBy("createdAt", "desc"), limit(400));
    const snap = await getDocs(q);
    
    // Map raw txns
    const rawTxns = snap.docs.map(d => {
      const data = d.data();
      const isoDate = _getTxnISODate(data);
      const isInc = data.type === "in";
      const amt = Number(data.amount || 0);
      return {
        id: d.id,
        ...data,
        isoDate,
        ts: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : (isoDate ? new Date(isoDate).getTime() : 0),
        inflow: isInc ? amt : 0,
        outflow: !isInc ? amt : 0,
      };
    });

    _allBankTxns = rawTxns;
    _recomputeAllBankTxnBalances();
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

let _lastFilteredBankTxns = [];

function _getTxnISODate(t) {
  if (t.date && /^\d{4}-\d{2}-\d{2}$/.test(t.date)) return t.date;
  if (t.createdAt?.seconds) {
    const d = new Date(t.createdAt.seconds * 1000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  if (typeof t.createdAt === "string" && /^\d{4}-\d{2}-\d{2}/.test(t.createdAt)) {
    return t.createdAt.substring(0, 10);
  }
  return "";
}

window.applyBankTxnFilters = () => {
  const bankId = document.getElementById("filter-ba-box")?.value || _selectedBankFilter || "";
  const from   = document.getElementById("filter-ba-from")?.value || "";
  const to     = document.getElementById("filter-ba-to")?.value || "";
  const type   = document.getElementById("filter-ba-type")?.value || "";
  const search = (document.getElementById("filter-ba-search")?.value || "").trim().toLowerCase();

  const tbody = document.getElementById("ba-tbody");
  const titleEl = document.getElementById("ba-txn-table-title");
  const subtitleEl = document.getElementById("ba-txn-table-subtitle");
  const summaryEl = document.getElementById("ba-period-summary");

  if (!tbody) return;

  let filtered = [..._allBankTxns];

  // 1. Bank filter
  if (bankId) {
    filtered = filtered.filter(t => t.bankAccountId === bankId);
    const bank = bankAccounts.find(b => b.id === bankId);
    if (titleEl) titleEl.textContent = `📑 كشف حركات: ${bank ? bank.name : 'الحساب البنكي'}`;
  } else {
    if (titleEl) titleEl.textContent = "📑 سجل ودعم كشف الحركات البنكية الأخيرة";
  }

  const totalBankTxns = filtered.length;

  // 2. Date filters (ISO comparison YYYY-MM-DD avoids local DD/MM/YYYY text mismatch)
  if (from) {
    filtered = filtered.filter(t => {
      const d = _getTxnISODate(t);
      return !d || d >= from;
    });
  }
  if (to) {
    filtered = filtered.filter(t => {
      const d = _getTxnISODate(t);
      return !d || d <= to;
    });
  }

  // 3. Type filter
  if (type) {
    filtered = filtered.filter(t => t.type === type);
  }

  // 4. Search filter
  if (search) {
    filtered = filtered.filter(t => 
      (t.notes || "").toLowerCase().includes(search) ||
      (t.refNumber || "").toLowerCase().includes(search) ||
      (t.bankAccountId || "").toLowerCase().includes(search) ||
      String(t.amount || "").includes(search)
    );
  }

  // Sort: latest date first
  filtered.sort((a, b) => {
    const da = _getTxnISODate(a) + (a.createdAt?.seconds || 0);
    const db = _getTxnISODate(b) + (b.createdAt?.seconds || 0);
    return db.localeCompare(da);
  });

  _lastFilteredBankTxns = filtered;

  // Update subtitle accurately
  if (subtitleEl) {
    if (filtered.length === totalBankTxns) {
      subtitleEl.textContent = `سجل الحركات المصروفة والمقيدة للحساب البنكي (${filtered.length} حركة)`;
    } else {
      subtitleEl.textContent = `عرض ${filtered.length} حركة مطابقة للتصفية من إجمالي ${totalBankTxns} حركة`;
    }
  }

  // Calculate totals
  let totalIn = 0;
  let totalOut = 0;
  filtered.forEach(t => {
    const amt = Number(t.amount || 0);
    if (t.type === 'in') totalIn += amt;
    else totalOut += amt;
  });
  const netDiff = totalIn - totalOut;

  // Render period summary bar
  if (summaryEl) {
    const activeBank = bankAccounts.find(b => b.id === bankId);
    summaryEl.style.display = "block";
    summaryEl.innerHTML = `
      <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:center;justify-content:space-between;width:100%;">
        <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:center;">
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:11.5px;font-weight:700;color:var(--text-3);">الحركات المعروضة:</span>
            <span class="badge" style="background:#f1f5f9;color:#0f172a;font-weight:900;font-size:12px;">${filtered.length} حركة</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:11.5px;font-weight:700;color:#15803d;">📥 إجمالي الوارد (+):</span>
            <span class="mono font-bold text-ok" style="font-size:13.5px;">+${formatCurrency(totalIn)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:11.5px;font-weight:700;color:#b91c1c;">📤 إجمالي المنصرف (-):</span>
            <span class="mono font-bold text-bad" style="font-size:13.5px;">-${formatCurrency(totalOut)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:11.5px;font-weight:700;color:var(--text-2);">⚖️ صافي حركة الفترة:</span>
            <span class="mono font-bold ${netDiff >= 0 ? 'text-ok' : 'text-bad'}" style="font-size:13.5px;direction:ltr;">${netDiff >= 0 ? '+' : ''}${formatCurrency(netDiff)}</span>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          ${activeBank ? `
            <div style="display:flex;align-items:center;gap:8px;background:rgba(30,58,138,0.08);padding:5px 14px;border-radius:10px;border:1px solid rgba(30,58,138,0.2);">
              <span style="font-size:11.5px;font-weight:800;color:#1e3a8a;">💰 الرصيد المتاح الحالي:</span>
              <span class="mono font-bold" style="font-size:14.5px;color:#1e3a8a;direction:ltr;">${formatCurrency(activeBank.balance || 0)}</span>
            </div>
          ` : ''}
          <button class="btn btn-secondary btn-sm" onclick="exportBankStatementExcel()" style="background:#10b981;color:#fff;border-color:#059669;font-weight:800;padding:5px 12px;border-radius:8px;" title="تصدير كشف الحساب الحالي لإكسيل">📊 تصدير Excel منسق</button>
        </div>
      </div>
    `;
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
        <td class="mono font-bold" style="font-size:12.5px;">${formatDate(t.date || t.createdAt)}</td>
        <td><strong style="color:var(--text-1);">${bMap[t.bankAccountId] || t.bankAccountId}</strong></td>
        <td><span class="badge" style="${badgeStyle}padding:4px 10px;border-radius:8px;">${isIncome ? 'إيداع وارد (+)' : 'سحب / تحويل (-)'}</span></td>
        <td class="mono font-bold" style="font-size:11.5px;"><span dir="ltr" style="background:var(--bg-2);padding:2px 8px;border-radius:6px;">${t.refNumber || "—"}</span></td>
        <td><span style="font-size:12.5px;color:var(--text-2);font-weight:600;">${t.notes || "—"}</span></td>
        <td class="mono font-bold ${isIncome ? 'text-ok' : 'text-bad'}" style="font-size:13.5px;">${isIncome ? '+' : '-'}${formatCurrency(t.amount)}</td>
        <td class="mono font-bold" style="font-size:12.5px;"><span dir="ltr" style="display:inline-block;direction:ltr;background:var(--bg-2);padding:2px 8px;border-radius:6px;">${formatCurrency(t.computedBalanceAfter !== undefined ? t.computedBalanceAfter : (t.balanceAfter || 0))}</span></td>
      </tr>`;
  }).join("");
};

// ─────────────────────────────────────────────────────────────────────────────
// Detailed Bank Statement of Account Implementation
// ─────────────────────────────────────────────────────────────────────────────
window.openBankAccountStatementModal = async (bankId) => {
  const bank = bankAccounts.find(b => b.id === bankId);
  if (!bank) return;

  _activeBankStatement = bank;
  const titleEl = document.getElementById("ba-stmt-modal-title");
  const bodyEl = document.getElementById("ba-stmt-body");

  // Read current date filters from the main page
  const initialFrom = document.getElementById("filter-ba-from")?.value || "";
  const initialTo   = document.getElementById("filter-ba-to")?.value || "";

  if (titleEl) titleEl.textContent = `📄 كشف حساب بنكي تفصيلي معتمد — ${bank.name}`;
  if (bodyEl) bodyEl.innerHTML = `<div style="text-align:center;padding:40px;"><span class="spin"></span> جاري تجميع وتحليل كشف الحساب البنكي لحساب ${bank.name}…</div>`;

  openModal("ba-statement-modal");

  try {
    const qTxns = query(collection(db, `companies/${COMPANY_ID}/bankTransactions`), where("bankAccountId", "==", bankId));
    const snap = await getDocs(qTxns);

    const masterItems = snap.docs.map(d => {
      const data = d.data();
      const isoDate = _getTxnISODate(data);
      const isInc = data.type === "in";
      const amt = Number(data.amount || 0);
      return {
        id: d.id,
        isoDate,
        ts: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : (isoDate ? new Date(isoDate).getTime() : 0),
        date: formatDate(data.date || data.createdAt),
        icon: isInc ? "🏛️ 📥" : "🏦 📤",
        badgeText: isInc ? "إيداع بنكي" : "حوالة بنكية صادرة",
        badgeClass: isInc ? "good" : "bad",
        notes: data.notes || "حركة بنكية رسمية",
        inflow: isInc ? amt : 0,
        outflow: !isInc ? amt : 0,
        ref: data.refNumber || `BTX-${d.id.substring(0,6).toUpperCase()}`
      };
    });

    // 1. Sort ascending chronologically (Oldest to Newest)
    masterItems.sort((a, b) => {
      const c = (a.isoDate || "").localeCompare(b.isoDate || "");
      if (c !== 0) return c;
      return (a.ts || 0) - (b.ts || 0);
    });

    // Calculate base opening balance
    const currentBankBal = Number(bank.balance || 0);
    let totalInAll = 0;
    let totalOutAll = 0;
    masterItems.forEach(t => { totalInAll += t.inflow; totalOutAll += t.outflow; });
    const baseOpeningBal = currentBankBal - (totalInAll - totalOutAll);

    // Set computed balance for all items
    let rBal = baseOpeningBal;
    masterItems.forEach(t => {
      rBal += (t.inflow - t.outflow);
      t.computedBalanceAfter = Math.round(rBal * 100) / 100;
    });

    _activeBankMasterItems = masterItems;
    _activeBankBaseOpeningBal = baseOpeningBal;

    // Render modal view with interactive filter
    window.renderModalStatementView(initialFrom, initialTo);

  } catch (err) {
    bodyEl.innerHTML = `<div class="alert bad">خطأ في جلب كشف الحساب التفصيلي: ${err.message}</div>`;
  }
};

let _activeBankMasterItems = [];
let _activeBankBaseOpeningBal = 0;

window.renderModalStatementView = (from = "", to = "") => {
  const bank = _activeBankStatement;
  const bodyEl = document.getElementById("ba-stmt-body");
  if (!bodyEl || !bank) return;

  const master = _activeBankMasterItems || [];
  const baseStart = _activeBankBaseOpeningBal || 0;

  // Filter items by from and to
  const periodItems = master.filter(t => {
    if (from && t.isoDate < from) return false;
    if (to && t.isoDate > to) return false;
    return true;
  });

  // Calculate opening balance before the period
  const txnsBefore = master.filter(t => from && t.isoDate < from);
  const balBeforePeriod = txnsBefore.length > 0 
    ? txnsBefore[txnsBefore.length - 1].computedBalanceAfter 
    : baseStart;

  // Summary of the period
  let periodIn = 0;
  let periodOut = 0;
  periodItems.forEach(t => { periodIn += t.inflow; periodOut += t.outflow; });
  const periodNet = periodIn - periodOut;
  const periodEndBal = Math.round((balBeforePeriod + periodNet) * 100) / 100;

  _activeBankStatementRows = periodItems;

  bodyEl.innerHTML = `
    <!-- Bank Info Banner -->
    <div style="background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); border-radius:16px; padding:18px 22px; color:#fff; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; box-shadow:0 8px 20px rgba(15,23,42,0.3);">
      <div>
        <div style="font-size:11px; color:#93c5fd; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">كشف الحساب البنكي التفصيلي المعتمد</div>
        <h2 style="font-size:22px; font-weight:900; margin:3px 0; color:#ffffff;">${bank.name}</h2>
        <div style="font-size:12px; color:#cbd5e1;">رقم الآيبان IBAN: <span style="font-family:monospace;font-weight:800;color:#67e8f9;">${bank.iban || "—"}</span> ${bank.accountNumber ? `| رقم الحساب: <span style="font-family:monospace;color:#ffffff;">${bank.accountNumber}</span>` : ''}</div>
      </div>
      <div style="text-align:left; background:rgba(255,255,255,0.12); padding:10px 18px; border-radius:14px; border:1px solid rgba(255,255,255,0.25);">
        <div style="font-size:11px; color:#93c5fd; font-weight:700;">الرصيد الفعلي الحالي في البنك</div>
        <div class="mono" style="font-size:22px; font-weight:900; direction:ltr; color:#ffffff;">${formatCurrency(bank.balance || 0)}</div>
      </div>
    </div>

    <!-- Interactive Period Filter Bar Inside Modal -->
    <div style="display:flex;gap:12px;align-items:center;background:#fff;padding:12px 18px;border-radius:14px;border:1px solid #e2e8f0;margin-bottom:16px;flex-wrap:wrap;box-shadow:0 2px 6px rgba(0,0,0,0.02);">
      <span style="font-size:12px;font-weight:800;color:#0f172a;">📅 تصفية فترة الكشف:</span>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="font-size:11.5px;color:#64748b;">من:</span>
        <input type="date" id="modal-stmt-from" class="input" value="${from}" style="width:135px;font-size:12px;padding:4px 8px;" onchange="window.onModalDateFilterChange()" />
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="font-size:11.5px;color:#64748b;">إلى:</span>
        <input type="date" id="modal-stmt-to" class="input" value="${to}" style="width:135px;font-size:12px;padding:4px 8px;" onchange="window.onModalDateFilterChange()" />
      </div>
      <button class="btn btn-secondary btn-sm" onclick="window.resetModalDateFilter()" style="font-size:11.5px;padding:4px 10px;">عرض كافة الحركات</button>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="exportBankStatementExcel()" style="background:#10b981;color:#fff;border-color:#059669;font-weight:800;font-size:12px;padding:5px 14px;">📊 تصدير Excel منسق</button>
      </div>
    </div>

    <!-- KPI Summary Cards for the Period -->
    <div class="grid-4 gap-10 mb-16" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:16px;">
      <div style="background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:12px; padding:12px; text-align:center;">
        <div style="font-size:11px; color:#64748b; font-weight:800;">الرصيد السابق للفترة</div>
        <div class="mono" style="font-size:16px; font-weight:900; margin-top:3px; color:#0f172a;">${formatCurrency(balBeforePeriod)}</div>
      </div>
      <div style="background:#eff6ff; border:1.5px solid #bfdbfe; border-radius:12px; padding:12px; text-align:center;">
        <div style="font-size:11px; color:#1d4ed8; font-weight:800;">إجمالي الوارد للفترة (+)</div>
        <div class="mono text-ok" style="font-size:16px; font-weight:900; margin-top:3px;">+${formatCurrency(periodIn)}</div>
      </div>
      <div style="background:#fef2f2; border:1.5px solid #fecaca; border-radius:12px; padding:12px; text-align:center;">
        <div style="font-size:11px; color:#dc2626; font-weight:800;">إجمالي المنصرف للفترة (-)</div>
        <div class="mono text-bad" style="font-size:16px; font-weight:900; margin-top:3px;">-${formatCurrency(periodOut)}</div>
      </div>
      <div style="background:#ecfdf5; border:1.5px solid #a7f3d0; border-radius:12px; padding:12px; text-align:center;">
        <div style="font-size:11px; color:#065f46; font-weight:800;">الرصيد الختامي في نهاية الفترة</div>
        <div class="mono" style="font-size:16px; font-weight:900; margin-top:3px; color:#047857;">${formatCurrency(periodEndBal)}</div>
      </div>
    </div>

    <!-- Statement Table -->
    <div class="table-container" style="background:#fff; border-radius:14px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.03);">
      <table class="data-dense" style="width:100%; font-size:12px;">
        <thead>
          <tr style="background:#0f172a; color:#ffffff;">
            <th style="padding:10px 12px; width:45px; text-align:center;">م</th>
            <th style="padding:10px 12px; width:95px; text-align:center;">التاريخ</th>
            <th style="padding:10px 12px; width:170px;">نوع الحركة والرمز</th>
            <th style="padding:10px 12px; width:120px;">المرجع / الحوالة</th>
            <th style="padding:10px 12px;">البيان والسبب التفصيلي</th>
            <th style="padding:10px 12px; text-align:left; width:110px;">وارد (+)</th>
            <th style="padding:10px 12px; text-align:left; width:110px;">صادر (-)</th>
            <th style="padding:10px 12px; text-align:left; width:130px;">الرصيد بعد الحركة</th>
          </tr>
        </thead>
        <tbody>
          ${from ? `
            <tr style="background:#f8fafc; font-weight:800; border-bottom:2px solid #cbd5e1;">
              <td style="text-align:center;">—</td>
              <td class="mono font-bold" style="text-align:center;">${formatDate(from)}</td>
              <td colspan="3"><span style="color:#475569;">💼 الرصيد الافتتاحي السابق لبداية الفترة</span></td>
              <td style="text-align:left;">—</td>
              <td style="text-align:left;">—</td>
              <td class="mono font-bold" style="text-align:left;"><span dir="ltr" style="display:inline-block;direction:ltr;background:#e2e8f0;padding:2px 8px;border-radius:6px;color:#0f172a;">${formatCurrency(balBeforePeriod)}</span></td>
            </tr>
          ` : ''}
          ${periodItems.length ? periodItems.map((item, idx) => `
            <tr style="border-bottom:1px solid #f1f5f9; transition:background 0.15s ease;">
              <td style="text-align:center;color:var(--text-3);font-weight:700;">${idx + 1}</td>
              <td class="mono font-bold" style="font-size:12px; padding:10px 12px; text-align:center;">${item.date}</td>
              <td style="padding:10px 12px;">
                <span style="display:inline-flex; align-items:center; gap:6px; background:${item.inflow ? '#eff6ff' : '#fef2f2'}; color:${item.inflow ? '#1d4ed8' : '#991b1b'}; padding:4px 10px; border-radius:8px; font-weight:800; font-size:11.5px; border:1px solid ${item.inflow ? '#bfdbfe' : '#fca5a5'};">
                  <span>${item.icon}</span> <span>${item.badgeText}</span>
                </span>
              </td>
              <td class="mono" style="font-size:11px; padding:10px 12px;"><span dir="ltr" style="background:#f1f5f9; padding:2px 8px; border-radius:6px; font-weight:800; color:#334155;">${item.ref}</span></td>
              <td style="font-size:12px; color:#1e293b; font-weight:600; padding:10px 12px;">${item.notes}</td>
              <td class="mono text-ok font-bold" style="text-align:left; font-size:13px; padding:10px 12px;">${item.inflow ? '+' + formatCurrency(item.inflow) : '—'}</td>
              <td class="mono text-bad font-bold" style="text-align:left; font-size:13px; padding:10px 12px;">${item.outflow ? '-' + formatCurrency(item.outflow) : '—'}</td>
              <td class="mono font-bold" style="text-align:left; font-size:13px; padding:10px 12px;"><span dir="ltr" style="display:inline-block; direction:ltr; background:#f8fafc; padding:3px 10px; border-radius:8px; border:1px solid #cbd5e1; color:#0f172a;">${formatCurrency(item.computedBalanceAfter)}</span></td>
            </tr>
          `).join("") : `<tr><td colspan="8" style="text-align:center; padding:36px; color:#64748b; font-weight:700;">لا توجد حركات بنكية مقيدة في الفترة المحددة</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
};

window.onModalDateFilterChange = () => {
  const from = document.getElementById("modal-stmt-from")?.value || "";
  const to   = document.getElementById("modal-stmt-to")?.value || "";
  // Also sync back to main page inputs
  const mFrom = document.getElementById("filter-ba-from");
  const mTo   = document.getElementById("filter-ba-to");
  if (mFrom) mFrom.value = from;
  if (mTo)   mTo.value = to;
  window.renderModalStatementView(from, to);
};

window.resetModalDateFilter = () => {
  const mFrom = document.getElementById("filter-ba-from");
  const mTo   = document.getElementById("filter-ba-to");
  if (mFrom) mFrom.value = "";
  if (mTo)   mTo.value = "";
  window.renderModalStatementView("", "");
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
          <td><strong>${r.badgeText || (r.inflow ? 'إيداع وارد (+)' : 'تحويل صادر (-)')}</strong></td>
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
          accountId = coaDoc.id || coaDoc.accountId;
          accountCode = coaDoc.code || coaDoc.accountCode;
        }
      }

      const newBa = await create(COLS.bankAccounts(), {
        name,
        bankName: name,
        accountName: name,
        accountNumber,
        iban,
        openingBalance,
        balance: openingBalance,
        accountId,
        accountCode,
        active: true
      });

      if (accountId && newBa?.id) {
        await update(COLS.chartOfAccounts(), accountId, { sourceEntityId: newBa.id });
      }

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
// ─────────────────────────────────────────────────────────────────────────────
// Formatted Excel Export for Bank Statements (ExcelJS with SheetJS fallback)
// ─────────────────────────────────────────────────────────────────────────────
window.exportBankStatementExcel = async () => {
  const bankId = document.getElementById("filter-ba-box")?.value || _selectedBankFilter || "";
  const bank = bankAccounts.find(b => b.id === bankId);
  const bankName = bank ? bank.name : "جميع الحسابات البنكية";
  const iban = bank?.iban || "غير مسجل";
  const accNum = bank?.accountNumber || "—";
  const currentBalance = bank ? (bank.balance || 0) : 0;

  const from = document.getElementById("filter-ba-from")?.value || "";
  const to   = document.getElementById("filter-ba-to")?.value || "";

  // Target transactions
  const txns = _lastFilteredBankTxns && _lastFilteredBankTxns.length > 0
    ? _lastFilteredBankTxns
    : (bankId ? _allBankTxns.filter(t => t.bankAccountId === bankId) : _allBankTxns);

  if (!txns || txns.length === 0) {
    if (window.showToast) window.showToast("لا توجد حركات بنكية للتصدير", "warning");
    else alert("لا توجد حركات بنكية للتصدير");
    return;
  }

  // Calculate totals
  let totalIn = 0;
  let totalOut = 0;
  txns.forEach(t => {
    const a = Number(t.amount || 0);
    if (t.type === 'in') totalIn += a;
    else totalOut += a;
  });
  const netDiff = totalIn - totalOut;

  const bMap = {};
  bankAccounts.forEach(b => bMap[b.id] = b.name);

  const cleanBankName = bankName.replace(/[\\/:*?"<>|]/g, "_");
  const fileName = `كشف_حساب_${cleanBankName}_${new Date().toISOString().slice(0, 10)}`;

  // 1. Try ExcelJS first for beautiful styles and colored tabs
  if (window.ExcelJS) {
    try {
      const wb = new window.ExcelJS.Workbook();
      wb.creator = "نظام إدهام ERP";
      wb.created = new Date();

      const ws = wb.addWorksheet("كشف حساب بنكي", {
        views: [{ rtl: true, showGridLines: true }],
        pageSetup: { orientation: 'landscape', paperSize: 9 }
      });

      // Columns configuration (A to I = 9 columns)
      ws.columns = [
        { key: 'num',     width: 7 },
        { key: 'date',    width: 14 },
        { key: 'bank',    width: 20 },
        { key: 'type',    width: 18 },
        { key: 'ref',     width: 18 },
        { key: 'notes',   width: 42 },
        { key: 'inflow',  width: 16 },
        { key: 'outflow', width: 16 },
        { key: 'balance', width: 18 }
      ];

      // Fonts & Fills
      const fontHeaderTitle = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
      const fontSubTitle    = { name: 'Arial', size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } };
      const fontMeta        = { name: 'Arial', size: 9.5, italic: true, color: { argb: 'FF1E293B' } };
      const fontColHeader   = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      const fontData        = { name: 'Arial', size: 9.5 };
      const fontBold        = { name: 'Arial', size: 9.5, bold: true };
      const fontGreen       = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF15803D' } };
      const fontRed         = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FFB91C1C' } };

      const fillNavy    = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      const fillBlue    = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
      const fillLight   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
      const fillHeader  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      const fillAltRow  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      const fillTotal   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      const fillKpiBox  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      const fillKpiGrn  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
      const fillKpiRed  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };

      const borderThin = {
        top:    { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left:   { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right:  { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };

      // Row 1: Company Title
      ws.mergeCells('A1:I1');
      const c1 = ws.getCell('A1');
      c1.value = "شركة نظم الإمداد المتطورة — المنظومة المحاسبية المتكاملة";
      c1.font = fontHeaderTitle;
      c1.fill = fillNavy;
      c1.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(1).height = 32;

      // Row 2: Bank Statement Title
      ws.mergeCells('A2:I2');
      const c2 = ws.getCell('A2');
      c2.value = `كشف حساب بنكي رسمي: ${bankName} — الآيبان: ${iban} ${accNum !== '—' ? `| رقم الحساب: ${accNum}` : ''}`;
      c2.font = fontSubTitle;
      c2.fill = fillBlue;
      c2.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(2).height = 26;

      // Row 3: Metadata
      ws.mergeCells('A3:I3');
      const c3 = ws.getCell('A3');
      const fromStr = from ? formatDate(from) : 'بداية الحركات';
      const toStr   = to   ? formatDate(to)   : 'تاريخ اليوم';
      c3.value = `الفترة المستخرجة: من ${fromStr} إلى ${toStr} | تاريخ الاستخراج: ${new Date().toLocaleString('ar-SA')} | إجمالي الحركات: ${txns.length}`;
      c3.font = fontMeta;
      c3.fill = fillLight;
      c3.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(3).height = 22;

      // Row 4: Summary KPIs
      ws.mergeCells('A4:B4');
      const k1 = ws.getCell('A4');
      k1.value = `الرصيد المتاح: ${formatCurrency(currentBalance)}`;
      k1.font = fontBold;
      k1.fill = fillKpiBox;
      k1.alignment = { horizontal: 'center', vertical: 'middle' };

      ws.mergeCells('C4:D4');
      const k2 = ws.getCell('C4');
      k2.value = `إجمالي الوارد (+): +${formatCurrency(totalIn)}`;
      k2.font = { ...fontBold, color: { argb: 'FF15803D' } };
      k2.fill = fillKpiGrn;
      k2.alignment = { horizontal: 'center', vertical: 'middle' };

      ws.mergeCells('E4:F4');
      const k3 = ws.getCell('E4');
      k3.value = `إجمالي المنصرف (-): -${formatCurrency(totalOut)}`;
      k3.font = { ...fontBold, color: { argb: 'FFB91C1C' } };
      k3.fill = fillKpiRed;
      k3.alignment = { horizontal: 'center', vertical: 'middle' };

      ws.mergeCells('G4:I4');
      const k4 = ws.getCell('G4');
      k4.value = `صافي حركة الفترة: ${netDiff >= 0 ? '+' : ''}${formatCurrency(netDiff)}`;
      k4.font = { ...fontBold, color: { argb: netDiff >= 0 ? 'FF15803D' : 'FFB91C1C' } };
      k4.fill = fillKpiBox;
      k4.alignment = { horizontal: 'center', vertical: 'middle' };
      ws.getRow(4).height = 26;

      // Row 5: Column Headers
      const colHeaders = [
        "م",
        "التاريخ",
        "البنك",
        "نوع الحركة",
        "رقم المرجع / الحوالة",
        "البيان والتفاصيل",
        "وارد (+) (ر.س)",
        "صادر (-) (ر.س)",
        "الرصيد بعد الحركة (ر.س)"
      ];

      const r5 = ws.getRow(5);
      colHeaders.forEach((h, i) => {
        const cell = r5.getCell(i + 1);
        cell.value = h;
        cell.font = fontColHeader;
        cell.fill = fillHeader;
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = borderThin;
      });
      r5.height = 28;

      // Row 6+: Data Rows
      txns.forEach((t, idx) => {
        const rowNum = 6 + idx;
        const row = ws.getRow(rowNum);
        const isIncome = t.type === 'in';
        const amt = Number(t.amount || 0);
        const isAlt = idx % 2 === 1;

        const vals = [
          idx + 1,
          formatDate(t.date || t.createdAt),
          bMap[t.bankAccountId] || t.bankAccountId,
          isIncome ? "إيداع وارد (+)" : "تحويل صادر (-)",
          t.refNumber || "—",
          t.notes || "—",
          isIncome ? amt : 0,
          !isIncome ? amt : 0,
          Number(t.computedBalanceAfter !== undefined ? t.computedBalanceAfter : (t.balanceAfter || 0))
        ];

        vals.forEach((v, cIdx) => {
          const cell = row.getCell(cIdx + 1);
          cell.value = v;
          cell.border = borderThin;
          cell.fill = isAlt ? fillAltRow : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };

          if (cIdx === 0) {
            cell.font = fontBold;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else if (cIdx === 1) {
            cell.font = fontBold;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else if (cIdx === 2 || cIdx === 3) {
            cell.font = cIdx === 3 ? (isIncome ? fontGreen : fontRed) : fontData;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else if (cIdx === 4) {
            cell.font = fontData;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else if (cIdx === 5) {
            cell.font = fontData;
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
          } else if (cIdx >= 6) {
            cell.font = cIdx === 6 ? fontGreen : (cIdx === 7 ? fontRed : fontBold);
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
            cell.numFmt = '#,##0.00';
          }
        });

        row.height = 22;
      });

      // Total Row at bottom
      const totalRowNum = 6 + txns.length;
      const totRow = ws.getRow(totalRowNum);
      ws.mergeCells(`A${totalRowNum}:F${totalRowNum}`);
      const totLabel = totRow.getCell(1);
      totLabel.value = "الإجمالي الكلي للحركات المعروضة";
      totLabel.font = fontBold;
      totLabel.fill = fillTotal;
      totLabel.alignment = { horizontal: 'center', vertical: 'middle' };

      for (let c = 1; c <= 6; c++) totRow.getCell(c).border = borderThin;

      // Inflow sum
      const cIn = totRow.getCell(7);
      cIn.value = totalIn;
      cIn.font = fontGreen;
      cIn.fill = fillTotal;
      cIn.numFmt = '#,##0.00';
      cIn.alignment = { horizontal: 'left', vertical: 'middle' };
      cIn.border = borderThin;

      // Outflow sum
      const cOut = totRow.getCell(8);
      cOut.value = totalOut;
      cOut.font = fontRed;
      cOut.fill = fillTotal;
      cOut.numFmt = '#,##0.00';
      cOut.alignment = { horizontal: 'left', vertical: 'middle' };
      cOut.border = borderThin;

      // Current Bank Balance
      const cBal = totRow.getCell(9);
      cBal.value = currentBalance;
      cBal.font = fontBold;
      cBal.fill = fillTotal;
      cBal.numFmt = '#,##0.00';
      cBal.alignment = { horizontal: 'left', vertical: 'middle' };
      cBal.border = borderThin;

      totRow.height = 26;

      // Write and download
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      if (window.showToast) window.showToast("تم تصدير كشف الحساب البنكي إلى Excel بنجاح ✅", "success");
      return;
    } catch (excelErr) {
      console.warn("ExcelJS export failed, falling back to basic export:", excelErr);
    }
  }

  // Fallback: simple table export
  if (typeof exportPageExcel === "function") {
    exportPageExcel('.data-dense', fileName);
  }
};
