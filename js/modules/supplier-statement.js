// ============================================================
// IDHAM ERP — كشف حساب مورد تفصيلي وأعمار المستحقات المطور
// Advanced Detailed Supplier Statement, Payables Aging & Balance Confirmation
// ============================================================
import { COLS, getAll, query, where, orderBy, getDocs, getById, db, COMPANY_ID, doc, getDoc } from "../utils/db.js";
import { formatCurrency, formatDate, debounce } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

let allSuppliers = [];
let selectedSupplierId = null;
let currentStatementData = null;
let currentSupplierDoc = null;
let activeTypeFilter = "all";
let activePeriod = "year"; // 'month' | 'last_month' | 'quarter' | 'year' | 'all'

const todayStr = () => new Date().toISOString().slice(0, 10);
const monthAgoStr = () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); };
const quarterAgoStr = () => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d.toISOString().slice(0, 10); };
const startOfYearStr = () => `${new Date().getFullYear()}-01-01`;

// Arabic normalization helper for search
function normArabic(str) {
  if (!str) return "";
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[أإآء]/g, "ا")
    .replace(/[ة]/g, "ه")
    .replace(/[ى]/g, "ي")
    .replace(/[\u064B-\u065F]/g, "") // remove tashkeel
    .replace(/[\s\-_/.]/g, ""); // remove spaces and dashes
}

export async function render(container, user) {
  container.innerHTML = `
    <!-- Top Filter Bar -->
    <div class="filterbar no-print" style="gap:10px; align-items:flex-end; flex-wrap:wrap; background:var(--bg-card); padding:14px 18px; border-radius:12px; margin-bottom:16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm);">
      
      <!-- 1. Smart Autocomplete Search by Supplier Name / Code / Phone / VAT -->
      <div style="position:relative; min-width:280px; flex:1; max-width:360px;">
        <label style="font-size:11px; font-weight:800; color:var(--text-1); display:flex; align-items:center; gap:5px; margin-bottom:5px;">
          <span>🔍</span> <span>بحث باسم المورد / الكود / الجوال:</span>
        </label>
        <div style="position:relative;">
          <input type="text" id="stmt-sup-search" class="input" placeholder="اكتب اسم المورد، الكود، الجوال أو الضريبي..." autocomplete="off" style="padding-left:30px; font-weight:600;" />
          <button type="button" id="stmt-sup-clear" onclick="window.clearSupplierSearch()" title="مسح البحث" style="position:absolute; left:8px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text-3); cursor:pointer; font-size:14px; display:none;">✕</button>
        </div>
        <div id="stmt-sup-results" class="autocomplete-dropdown hidden" style="position:absolute; top:calc(100% + 4px); left:0; right:0; z-index:9999; max-height:290px; overflow-y:auto; background:var(--bg-card); border:1px solid var(--border); border-radius:10px; box-shadow:0 12px 30px rgba(0,0,0,0.2);"></div>
      </div>

      <!-- 2. Dropdown Selector (Synchronized with search) -->
      <div class="filter-select-group" style="min-width:240px; flex:1; max-width:320px;">
        <label style="font-size:11px; font-weight:800; color:var(--text-1); display:flex; align-items:center; gap:5px; margin-bottom:5px;">
          <span>🏢</span> <span>أو اختر المورد من القائمة:</span>
        </label>
        <select id="stmt-sup-select" class="input" onchange="window.onSupplierSelectChange(this.value)" style="font-weight:600;">
          <option value="">-- اختر المورد لعرض الكشف --</option>
        </select>
      </div>

      <!-- 3. Date Range -->
      <div class="filter-date-group">
        <label style="font-size:11px; font-weight:800; color:var(--text-1); margin-bottom:5px; display:block;">من تاريخ</label>
        <input type="date" id="stmt-sup-from" class="input" value="${startOfYearStr()}" style="width:138px;" onchange="window.onSupplierDateChange()" />
      </div>

      <div class="filter-date-group">
        <label style="font-size:11px; font-weight:800; color:var(--text-1); margin-bottom:5px; display:block;">إلى تاريخ</label>
        <input type="date" id="stmt-sup-to" class="input" value="${todayStr()}" style="width:138px;" onchange="window.onSupplierDateChange()" />
      </div>

      <!-- 4. Quick Period Filter Buttons -->
      <div style="display:flex; flex-direction:column; gap:5px;">
        <label style="font-size:11px; font-weight:800; color:var(--text-1); margin-bottom:0;">فترات سريعة:</label>
        <div style="display:flex; gap:4px;">
          <button class="btn btn-secondary btn-sm" id="btn-p-month" onclick="window.setSupplierPeriod('month')" title="الشهر الحالي">الشهر</button>
          <button class="btn btn-secondary btn-sm" id="btn-p-last-month" onclick="window.setSupplierPeriod('last_month')" title="الشهر السابق">السابق</button>
          <button class="btn btn-secondary btn-sm" id="btn-p-quarter" onclick="window.setSupplierPeriod('quarter')" title="آخر 3 أشهر">الربع</button>
          <button class="btn btn-primary btn-sm" id="btn-p-year" onclick="window.setSupplierPeriod('year')" title="من بداية السنة">السنة</button>
          <button class="btn btn-secondary btn-sm" id="btn-p-all" onclick="window.setSupplierPeriod('all')" title="كامل الفترة">شامل</button>
        </div>
      </div>

      <!-- 5. Actions Group -->
      <div style="margin-right:auto; display:flex; gap:6px; flex-wrap:wrap;">
        <button class="btn btn-secondary" id="stmt-btn-print" onclick="window.printSupplierStatement()" disabled title="طباعة كشف الحساب A4">🖨️ طباعة</button>
        <button class="btn btn-secondary" id="stmt-btn-excel" onclick="window.exportSupplierStatementExcel()" disabled title="تصدير جدول الحركات إلى ملف Excel">📊 Excel</button>
        <button class="btn btn-secondary" id="stmt-btn-wa" style="color:#25D366; border-color:rgba(37,211,102,0.4);" onclick="window.shareSupplierStatementWhatsApp()" disabled title="إرسال ملخص الحساب عبر واتساب">💬 واتساب</button>
        <button class="btn btn-secondary" id="stmt-btn-confirm" style="color:#6366f1; border-color:rgba(99,102,241,0.4);" onclick="window.printSupplierConfirmationLetter()" disabled title="خطاب مطابقة ومصادقة رصيد المورد">📑 مصادقة رصيد</button>
      </div>
    </div>

    <!-- Movement Type Filter Pills Bar (shown once a supplier is selected) -->
    <div id="stmt-sup-type-bar" class="no-print mb-16" style="display:none; align-items:center; gap:8px; flex-wrap:wrap; background:var(--bg-card); padding:10px 16px; border-radius:10px; border:1px solid var(--border-soft);">
      <span style="font-size:12px; font-weight:800; color:var(--text-1);">تصفية الحركات:</span>
      <button class="btn btn-primary btn-sm" id="btn-flt-all" onclick="window.filterSupplierStatementType('all')">🌟 كل الحركات (<span id="cnt-all">0</span>)</button>
      <button class="btn btn-secondary btn-sm" id="btn-flt-purchase" onclick="window.filterSupplierStatementType('purchase')">🏢 مشتريات (<span id="cnt-purchase">0</span>)</button>
      <button class="btn btn-secondary btn-sm" id="btn-flt-payment" onclick="window.filterSupplierStatementType('payment')">💵 سندات صرف (<span id="cnt-payment">0</span>)</button>
      <button class="btn btn-secondary btn-sm" id="btn-flt-receipt" onclick="window.filterSupplierStatementType('receipt')">📥 قبض واسترداد (<span id="cnt-receipt">0</span>)</button>
      <button class="btn btn-secondary btn-sm" id="btn-flt-return" onclick="window.filterSupplierStatementType('return')">↩️ مردودات شراء (<span id="cnt-return">0</span>)</button>
      <button class="btn btn-secondary btn-sm" id="btn-flt-journal" onclick="window.filterSupplierStatementType('journal')">⚖️ قيود وتسويات (<span id="cnt-journal">0</span>)</button>
    </div>

    <!-- Page Content Container -->
    <div class="page-content" id="supplier-statement-content">
      <div class="card" style="padding:56px 24px; text-align:center; color:var(--text-2); border-radius:14px; background:var(--bg-card); border:1px dashed var(--border);" id="stmt-sup-empty-placeholder">
        <div style="font-size:52px; margin-bottom:14px; animation:pulse 2s infinite;">📊</div>
        <div style="font-size:18px; font-weight:800; color:var(--text-0);">يرجى البحث عن المورد أو اختياره من القائمة أعلاه</div>
        <div style="font-size:13px; color:var(--text-2); margin-top:6px; max-width:540px; margin-left:auto; margin-right:auto;">
          يمكنك البحث باسم المورد، كود المورد، رقم الهاتف أو الرقم الضريبي. سيتم جلب كافة فواتير المشتريات، سندات الصرف، سندات الاسترداد، المردودات، والقيود اليومية التلقائية والافتتاحية بدقة متناهية.
        </div>
      </div>
    </div>

    <!-- Drill-down Document Preview Modal -->
    <div class="modal-overlay" id="doc-sup-preview-modal">
      <div class="modal modal-lg" style="max-width:760px; width:95%; border-radius:14px;">
        <div class="modal-header" style="padding:16px 22px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <h3 class="modal-title" id="doc-sup-modal-title" style="margin:0; font-size:16px; font-weight:800; color:var(--text-0);">تفاصيل المستند</h3>
          <button class="modal-close" onclick="closeModal('doc-sup-preview-modal')">×</button>
        </div>
        <div class="modal-body" id="doc-sup-modal-body" style="padding:22px; max-height:calc(85vh - 140px); overflow-y:auto;"></div>
        <div class="modal-footer" style="padding:14px 22px; border-top:1px solid var(--border-soft); display:flex; justify-content:flex-end;">
          <button class="btn btn-secondary" onclick="closeModal('doc-sup-preview-modal')">إغلاق</button>
        </div>
      </div>
    </div>
  `;

  await loadSuppliers();
  setupSupplierAutocomplete();
  setupGlobalFunctions();
}

async function loadSuppliers() {
  try {
    allSuppliers = await getAll(COLS.suppliers(), [orderBy("name")]);
    const sel = document.getElementById("stmt-sup-select");
    if (!sel) return;

    sel.innerHTML = `<option value="">-- اختر المورد لعرض الكشف --</option>` +
      allSuppliers.map(s => {
        const bal = parseFloat(s.balance || 0);
        const balLabel = bal !== 0 ? ` (${formatCurrency(Math.abs(bal))} ${bal > 0 ? "دائن" : "مدين"})` : "";
        return `<option value="${s.id}">${s.name}${s.code ? " [" + s.code + "]" : ""}${balLabel}</option>`;
      }).join("");

    if (selectedSupplierId) {
      sel.value = selectedSupplierId;
      const match = allSuppliers.find(s => s.id === selectedSupplierId);
      if (match) {
        const searchInput = document.getElementById("stmt-sup-search");
        if (searchInput) searchInput.value = match.name;
      }
      await window.reloadSupplierStatement();
    }
  } catch (e) {
    console.warn("Error loading suppliers for statement:", e);
  }
}

function setupSupplierAutocomplete() {
  const inp = document.getElementById("stmt-sup-search");
  const res = document.getElementById("stmt-sup-results");
  const clr = document.getElementById("stmt-sup-clear");
  if (!inp || !res) return;

  inp.addEventListener("input", debounce(() => {
    const rawVal = inp.value.trim();
    if (clr) clr.style.display = rawVal ? "block" : "none";

    if (!rawVal) {
      res.classList.add("hidden");
      return;
    }

    const qNorm = normArabic(rawVal);
    const qLower = rawVal.toLowerCase();
    const qDigits = rawVal.replace(/[^0-9]/g, "");

    const matches = allSuppliers.filter(s => {
      const nName = normArabic(s.name);
      const nCode = (s.code || "").toLowerCase();
      const nPhone = (s.phone || "").replace(/[^0-9]/g, "");
      const nVat = (s.vatNumber || "").replace(/[^0-9]/g, "");
      const nAddress = (s.address || "").toLowerCase();

      return (
        nName.includes(qNorm) ||
        nCode.includes(qLower) ||
        (qDigits && (nPhone.includes(qDigits) || nVat.includes(qDigits))) ||
        nAddress.includes(qLower)
      );
    }).slice(0, 15);

    if (!matches.length) {
      res.innerHTML = `
        <div style="padding:16px; text-align:center; color:var(--text-2); font-size:12.5px;">
          <span>🔍 لا يوجد مورد مطابق لـ: <b>"${rawVal}"</b></span>
        </div>
      `;
      res.classList.remove("hidden");
      return;
    }

    res.innerHTML = matches.map(s => {
      const bal = parseFloat(s.balance || 0);
      const isCreditor = bal > 0;
      const isDebtor = bal < 0;
      const balBadge = isCreditor
        ? `<span class="badge" style="background:rgba(239,68,68,0.12); color:#dc2626; font-weight:800; font-size:11px;">مستحق له: ${formatCurrency(bal)}</span>`
        : isDebtor
        ? `<span class="badge" style="background:rgba(16,185,129,0.12); color:#059669; font-weight:800; font-size:11px;">مدين لنا: ${formatCurrency(Math.abs(bal))}</span>`
        : `<span class="badge" style="background:rgba(100,116,139,0.12); color:var(--text-2); font-weight:700; font-size:11px;">متزن: 0.00</span>`;

      return `
        <div class="autocomplete-item" onclick="window.selectSupplierForStmt('${s.id}')" style="padding:10px 14px; border-bottom:1px solid var(--border-soft); cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:background 0.15s ease;" onmouseover="this.style.background='var(--bg-2)'" onmouseout="this.style.background='transparent'">
          <div>
            <div style="font-weight:800; font-size:13.5px; color:var(--text-0);">${s.name}</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:2px; display:flex; gap:10px;">
              <span>كود: <b>${s.code || "—"}</b></span>
              ${s.phone ? `<span>هاتف: <span class="mono">${s.phone}</span></span>` : ""}
              ${s.vatNumber ? `<span>ضريبي: <span class="mono">${s.vatNumber}</span></span>` : ""}
            </div>
          </div>
          <div style="text-align:left;">
            ${balBadge}
          </div>
        </div>
      `;
    }).join("");

    res.classList.remove("hidden");
  }, 150));

  // Close dropdown on click outside
  document.addEventListener("click", (e) => {
    if (!inp.contains(e.target) && !res.contains(e.target)) {
      res.classList.add("hidden");
    }
  });
}

async function buildSupplierStatement(supId, fromDate, toDate) {
  const sup = allSuppliers.find(s => s.id === supId) || await getById("suppliers", supId).catch(() => null);
  currentSupplierDoc = sup;
  if (!sup) return null;

  const supName = (sup.name || "").trim().toLowerCase();

  // 1. Fetch matching COA accounts for this supplier
  const coaSnap = await getDocs(query(
    COLS.chartOfAccounts(),
    where("sourceEntityId", "==", supId)
  )).catch(() => ({ docs: [] }));

  const matchedAccCodes = new Set();
  const matchedAccIds = new Set();
  coaSnap.docs.forEach(d => {
    matchedAccIds.add(d.id);
    if (d.data().code) matchedAccCodes.add(d.data().code);
  });

  const [purchasesSnap, paymentsSnap, receiptsSnap, returnsSnap, jeSnap] = await Promise.all([
    getDocs(query(COLS.purchaseInvoices(), where("supplierId", "==", supId))).catch(() => ({ docs: [] })),
    getDocs(query(COLS.expenses ? COLS.expenses() : "expenses", where("targetId", "==", supId))).catch(() => ({ docs: [] })),
    getDocs(query(COLS.receipts ? COLS.receipts() : "receipts", where("targetId", "==", supId))).catch(() => ({ docs: [] })),
    getDocs(query(COLS.purchaseReturns ? COLS.purchaseReturns() : "purchaseReturns", where("supplierId", "==", supId))).catch(() => ({ docs: [] })),
    getDocs(COLS.journalEntries()).catch(() => ({ docs: [] }))
  ]);

  let rawTransactions = [];
  const expensesList = paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(e => e.status !== "cancelled");

  // 1. Purchase Invoices (Credit -> Increases company's debt to supplier)
  purchasesSnap.docs.forEach(doc => {
    const inv = doc.data();
    if (inv.status === "cancelled") return;
    const invDate = inv.date || inv.invoiceDate || "";
    const total = parseFloat(inv.totalWithVat || inv.grandTotal || inv.total || 0);

    rawTransactions.push({
      id: doc.id,
      docNumber: inv.number || inv.invoiceNumber || doc.id.slice(0, 8),
      date: invDate,
      type: "purchase",
      typeLabel: "فاتورة مشتريات",
      typeBadge: '<span class="badge" style="background:rgba(99,102,241,0.12); color:#4f46e5; border:1px solid rgba(99,102,241,0.3); font-weight:800;">🏢 فاتورة مشتريات</span>',
      description: inv.notes || `شراء بضاعة ومواد غذائية (فاتورة ${inv.number || ""})`,
      debit: 0,
      credit: total,
      raw: inv
    });

    // Check if there was an immediate cash/bank payment recorded directly inside the invoice that doesn't duplicate an expense voucher
    const paidAmt = parseFloat(inv.paidAmount || 0);
    if (paidAmt > 0) {
      const purDateStr = invDate || (inv.createdAt?.toDate ? inv.createdAt.toDate().toISOString().split("T")[0] : "");
      const hasMatchingVoucher = expensesList.some(e => {
        const eDate = e.date || (e.createdAt?.toDate ? e.createdAt.toDate().toISOString().split("T")[0] : "");
        return eDate === purDateStr && Math.abs((e.amount || 0) - paidAmt) < 0.01;
      });

      if (!hasMatchingVoucher) {
        rawTransactions.push({
          id: `${doc.id}_paid`,
          docNumber: `PAY-${inv.number || doc.id.slice(0, 6)}`,
          date: invDate,
          type: "payment",
          typeLabel: "سداد فوري مع الفاتورة",
          typeBadge: '<span class="badge good" style="font-weight:800;">💵 سداد فوري مع الشراء</span>',
          description: `دفعة نقدية مسددة فوراً مع فاتورة المشتريات رقم ${inv.number || ""}`,
          debit: paidAmt,
          credit: 0,
          raw: { ...inv, voucherType: "direct_purchase_payment", amount: paidAmt }
        });
      }
    }
  });

  // 2. Payments / Expense Vouchers (Debit -> Reduces company's debt to supplier)
  paymentsSnap.docs.forEach(doc => {
    const pay = doc.data();
    if (pay.status === "cancelled") return;
    const payDate = pay.date || "";
    const amt = parseFloat(pay.amount || 0);

    rawTransactions.push({
      id: doc.id,
      docNumber: pay.number || pay.voucherNumber || doc.id.slice(0, 8),
      date: payDate,
      type: "payment",
      typeLabel: "سند صرف",
      typeBadge: '<span class="badge good" style="font-weight:800;">💵 سند صرف للمورد</span>',
      description: pay.notes || pay.description || `سداد دفعة من الحساب (${pay.paymentMethod || "تحويل بنكي / نقدي"})`,
      debit: amt,
      credit: 0,
      raw: pay
    });
  });

  // 2b. Receipt Vouchers from Supplier (Credit -> Supplier refunded/paid us)
  receiptsSnap.docs.forEach(doc => {
    const rcpt = doc.data();
    if (rcpt.status === "cancelled") return;
    if (rcpt.entityType && rcpt.entityType !== "supplier") return;
    const rcptDate = rcpt.date || "";
    const amt = parseFloat(rcpt.amount || 0);

    rawTransactions.push({
      id: doc.id,
      docNumber: rcpt.number || rcpt.voucherNumber || `RV-${doc.id.slice(0, 6).toUpperCase()}`,
      date: rcptDate,
      type: "receipt",
      typeLabel: "سند قبض من مورد",
      typeBadge: '<span class="badge" style="background:rgba(16,185,129,0.12); color:#059669; border:1px solid rgba(16,185,129,0.3); font-weight:800;">📥 قبض واسترداد من مورد</span>',
      description: rcpt.notes ? `سند قبض من المورد — ${rcpt.notes} (${rcpt.sourceName || (rcpt.method === "cash" ? "نقدي" : "بنكي")})` : `قبض/استرداد دفعة من المورد (${rcpt.sourceName || "نقدي/بنكي"})`,
      debit: 0,
      credit: amt,
      raw: rcpt
    });
  });

  // 3. Purchase Returns (Debit -> Reduces debt to supplier)
  returnsSnap.docs.forEach(doc => {
    const ret = doc.data();
    if (ret.status === "cancelled" || ret.status === "void") return;
    const retDate = ret.date || "";
    const total = parseFloat(ret.totalWithVat || ret.total || 0);

    rawTransactions.push({
      id: doc.id,
      docNumber: ret.number || ret.returnNumber || doc.id.slice(0, 8),
      date: retDate,
      type: "return",
      typeLabel: "مردودات شراء",
      typeBadge: '<span class="badge warn" style="font-weight:800;">↩️ مردود شراء</span>',
      description: ret.reason || ret.notes || "مرتجع بضاعة ومواد غذائية للمورد",
      debit: total,
      credit: 0,
      raw: ret
    });
  });

  // 4. Manual Journal Entries (قيود اليومية والقيود الافتتاحية للمورد فقط)
  jeSnap.docs.forEach(doc => {
    const je = doc.data();
    if (je.status === "cancelled" || je.isReversed) return;

    const st = (je.sourceType || "").toLowerCase();
    const rt = (je.refType || "").toLowerCase();
    const desc = (je.description || "").toLowerCase();

    const isAuto =
      je.auto === true ||
      st === "purchase" || st === "purchaseinvoice" || st === "purchase_invoice" ||
      st === "expense" || st === "supplierpayment" || st === "purchase_return" || st === "purchasereturn" ||
      st === "sales" || st === "salesinvoice" || st === "receipt" || st === "salesreturn" ||
      rt.includes("purchase") || rt.includes("invoice") || rt.includes("expense") || rt.includes("return") || rt.includes("receipt") ||
      desc.includes("فاتورة") || desc.includes("مشتريات") || desc.includes("سند صرف") || desc.includes("سند قبض") || desc.includes("مرتجع") ||
      (je.sourceId && (purchasesSnap.docs.some(p => p.id === je.sourceId) || paymentsSnap.docs.some(p => p.id === je.sourceId) || receiptsSnap.docs.some(r => r.id === je.sourceId)));

    const isOpening = desc.includes("افتتاحي") || st === "opening" || rt === "opening";

    if (isAuto && !isOpening) return;

    (je.lines || []).forEach((line, idx) => {
      const lAccId = line.accountId;
      const lAccCode = line.accountCode;
      const lAccName = (line.accountName || "").trim().toLowerCase();

      const isMatch = (lAccId && matchedAccIds.has(lAccId)) ||
                      (lAccCode && matchedAccCodes.has(lAccCode)) ||
                      (supName && lAccName && (lAccName === supName || lAccName.includes(supName) || supName.includes(lAccName)));

      if (isMatch) {
        const dAmt = parseFloat(line.debit || 0);
        const cAmt = parseFloat(line.credit || 0);
        if (dAmt === 0 && cAmt === 0) return;

        const isLineOpening = (je.description || "").includes("افتتاحي") || (line.note || "").includes("افتتاحي") || je.sourceType === "opening";

        rawTransactions.push({
          id: `${doc.id}_${idx}`,
          docNumber: je.entryNumber || je.number || doc.id.slice(0, 8),
          date: je.date || "",
          type: "journal",
          typeLabel: isLineOpening ? "قيد رصيد افتتاحي" : "قيد يومية",
          typeBadge: isLineOpening 
            ? '<span class="badge" style="background:#fef3c7; color:#b45309; border:1px solid rgba(180,83,9,0.3); font-weight:800;">⚖️ قيد افتتاحى</span>'
            : '<span class="badge" style="background:#f3e8ff; color:#7e22ce; border:1px solid rgba(126,34,206,0.3); font-weight:800;">📝 قيد تسوية/يومية</span>',
          description: je.description || line.note || line.accountName || "قيد محاسبي مرحل",
          debit: dAmt,
          credit: cAmt,
          raw: je
        });
      }
    });
  });

  // Sort chronological
  rawTransactions.sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  // Calculate opening balance before fromDate
  let openingBalance = 0;
  const filteredTx = [];

  rawTransactions.forEach(t => {
    if (fromDate && t.date < fromDate) {
      openingBalance += (t.credit - t.debit);
    } else if (!toDate || t.date <= toDate) {
      filteredTx.push(t);
    }
  });

  // Calculate running cumulative balance
  let running = openingBalance;
  filteredTx.forEach(t => {
    running += (t.credit - t.debit);
    t.balanceAfter = running;
  });

  // Calculate Aging of Payables (FIFO)
  const unpaidPurchases = rawTransactions
    .filter(t => t.type === "purchase" || (t.type === "journal" && t.credit > 0))
    .map(p => ({ date: p.date, amount: p.credit, remaining: p.credit }))
    .reverse();

  let remainingDebt = Math.max(0, running);
  let aging = { d0_30: 0, d31_60: 0, d61_90: 0, d90_plus: 0 };
  const today = new Date();

  for (const p of unpaidPurchases) {
    if (remainingDebt <= 0) break;
    const take = Math.min(remainingDebt, p.remaining);
    const pDate = new Date(p.date || todayStr());
    const days = Math.max(0, Math.floor((today - pDate) / (1000 * 60 * 60 * 24)));

    if (days <= 30) aging.d0_30 += take;
    else if (days <= 60) aging.d31_60 += take;
    else if (days <= 90) aging.d61_90 += take;
    else aging.d90_plus += take;

    remainingDebt -= take;
  }

  // Calculate total across ALL transactions to get actual current balance
  let allTimeBalance = 0;
  rawTransactions.forEach(t => {
    allTimeBalance += (t.credit - t.debit);
  });
  const trueCurrentBalance = Math.round(allTimeBalance * 100) / 100;

  // Auto-sync supplier balance in background if it drifted
  if (sup.id && Math.abs((sup.balance || 0) - trueCurrentBalance) > 0.009) {
    import("../utils/db.js").then(({ update }) => {
      update("suppliers", sup.id, { balance: trueCurrentBalance }).catch(() => {});
    });
    sup.balance = trueCurrentBalance;
  }

  const counts = {
    all: filteredTx.length,
    purchase: filteredTx.filter(t => t.type === "purchase").length,
    payment: filteredTx.filter(t => t.type === "payment").length,
    receipt: filteredTx.filter(t => t.type === "receipt").length,
    return: filteredTx.filter(t => t.type === "return").length,
    journal: filteredTx.filter(t => t.type === "journal").length
  };

  return {
    supplier: sup,
    fromDate,
    toDate,
    openingBalance,
    closingBalance: running,
    transactions: filteredTx,
    allFiltered: filteredTx,
    totalDebit: filteredTx.reduce((s, t) => s + t.debit, 0),
    totalCredit: filteredTx.reduce((s, t) => s + t.credit, 0),
    aging,
    counts
  };
}

function renderStatementUI(data) {
  const container = document.getElementById("supplier-statement-content");
  if (!container || !data) return;

  const sup = data.supplier;
  const isCreditor = data.closingBalance > 0.009;
  const isDebtor = data.closingBalance < -0.009;

  // Update Type Filter Counts & Badges
  const typeBar = document.getElementById("stmt-sup-type-bar");
  if (typeBar) {
    typeBar.style.display = "flex";
    document.getElementById("cnt-all").textContent = data.counts.all || 0;
    document.getElementById("cnt-purchase").textContent = data.counts.purchase || 0;
    document.getElementById("cnt-payment").textContent = data.counts.payment || 0;
    document.getElementById("cnt-receipt").textContent = data.counts.receipt || 0;
    document.getElementById("cnt-return").textContent = data.counts.return || 0;
    document.getElementById("cnt-journal").textContent = data.counts.journal || 0;
  }

  // Calculate Aging percentages for bar
  const totalAging = data.aging.d0_30 + data.aging.d31_60 + data.aging.d61_90 + data.aging.d90_plus;
  const p0 = totalAging > 0 ? (data.aging.d0_30 / totalAging) * 100 : 0;
  const p30 = totalAging > 0 ? (data.aging.d31_60 / totalAging) * 100 : 0;
  const p60 = totalAging > 0 ? (data.aging.d61_90 / totalAging) * 100 : 0;
  const p90 = totalAging > 0 ? (data.aging.d90_plus / totalAging) * 100 : 0;

  const cleanPhone = (sup.phone || "").replace(/[^0-9]/g, "");
  const intlPhone = cleanPhone.startsWith("0") ? "966" + cleanPhone.slice(1) : (cleanPhone.startsWith("966") ? cleanPhone : "966" + cleanPhone);

  container.innerHTML = `
    <!-- Print-only official letterhead -->
    <div class="print-only" style="display:none; margin-bottom:18px; border-bottom:2px solid #1e293b; padding-bottom:14px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e1b4b;">${window.ERP_COMPANY?.name || "مؤسسة إدهام للمواد الغذائية"}</h2>
          <div style="font-size:12px; color:#475569; margin-top:3px;">تجارة الجملة والتجزئة في المواد الغذائية والمشروبات</div>
          <div style="font-size:12px; color:#475569;">الرقم الضريبي: <b>${window.ERP_COMPANY?.vatNumber || "310000000000003"}</b></div>
        </div>
        <div style="text-align:left;">
          <h3 style="margin:0; font-size:18px; color:#4338ca;">كشف حساب مورد تفصيلي</h3>
          <div style="font-size:11.5px; color:#475569; margin-top:3px;">تاريخ الطباعة: <b>${new Date().toLocaleString("ar-SA")}</b></div>
          <div style="font-size:11.5px; color:#475569;">الفترة: من <b>${data.fromDate || "البداية"}</b> إلى <b>${data.toDate || todayStr()}</b></div>
        </div>
      </div>
      <div style="margin-top:12px; padding:10px; background:#f8fafc; border-radius:6px; border:1px solid #cbd5e1; display:flex; justify-content:space-between; font-size:12px;">
        <div>اسم المورد: <b>${sup.name}</b></div>
        <div>كود المورد: <b>${sup.code || "—"}</b></div>
        <div>الهاتف: <b class="mono">${sup.phone || "—"}</b></div>
        <div>الرقم الضريبي: <b class="mono">${sup.vatNumber || "—"}</b></div>
      </div>
    </div>

    <!-- 1. Rich Supplier Profile Header Card -->
    <div class="card mb-16 no-print" style="padding:16px 20px; background:linear-gradient(135deg, var(--bg-card), rgba(99,102,241,0.04)); border:1px solid var(--border-soft); border-radius:14px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:52px; height:52px; border-radius:14px; background:linear-gradient(135deg, #4f46e5, #6366f1); color:#fff; display:flex; align-items:center; justify-content:center; font-size:26px; box-shadow:0 6px 14px rgba(79,70,229,0.25);">
            🏢
          </div>
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <h2 style="margin:0; font-size:19px; font-weight:800; color:var(--text-0);">${sup.name}</h2>
              <span class="badge" style="background:rgba(99,102,241,0.12); color:#4f46e5; font-weight:700;">كود: ${sup.code || "—"}</span>
            </div>
            <div style="display:flex; align-items:center; gap:14px; font-size:12px; color:var(--text-2); margin-top:5px; flex-wrap:wrap;">
              ${sup.phone ? `
                <a href="https://api.whatsapp.com/send?phone=${intlPhone}" target="_blank" style="color:var(--text-1); text-decoration:none; display:flex; align-items:center; gap:4px; font-weight:600;">
                  <span>📞</span> <span class="mono">${sup.phone}</span>
                </a>
              ` : `<span>📞 غير محدد</span>`}
              <span>الرقم الضريبي: <b class="mono">${sup.vatNumber || "—"}</b></span>
              ${sup.city || sup.address ? `<span>📍 ${sup.city || sup.address}</span>` : ""}
            </div>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <div style="text-align:left; background:var(--bg-2); padding:8px 14px; border-radius:10px; border:1px solid var(--border-soft);">
            <div style="font-size:11px; color:var(--text-2); font-weight:700;">حالة الرصيد المالي</div>
            <div style="font-size:14px; font-weight:800; color:${isCreditor ? '#ef4444' : isDebtor ? '#10b981' : '#64748b'};">
              ${isCreditor ? '🔴 مستحق للمورد (دائن)' : isDebtor ? '🟢 رصيد لصالحنا (مدين)' : '🔵 رصيد متزن ومطابق'}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Top Summary KPI Cards -->
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:16px;">
      
      <div class="card" style="padding:14px 16px; background:var(--bg-card); border-radius:12px; border:1px solid var(--border-soft);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:11.5px; color:var(--text-2); font-weight:700;">الرصيد الافتتاحي السابق</div>
          <span style="font-size:16px;">📅</span>
        </div>
        <div class="mono" style="font-size:18px; font-weight:800; margin-top:6px; color:var(--text-0);">${formatCurrency(data.openingBalance)}</div>
        <div style="font-size:11px; color:var(--text-3); margin-top:2px;">قبل تاريخ ${data.fromDate || "البداية"}</div>
      </div>

      <div class="card" style="padding:14px 16px; background:var(--bg-card); border-radius:12px; border:1px solid rgba(99,102,241,0.25);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:11.5px; color:#4f46e5; font-weight:800;">إجمالي المشتريات (دائن)</div>
          <span class="badge" style="background:rgba(99,102,241,0.1); color:#4f46e5; font-weight:700;">${data.counts.purchase} فاتورة</span>
        </div>
        <div class="mono font-bold" style="font-size:19px; color:#4f46e5; margin-top:6px;">+ ${formatCurrency(data.totalCredit)}</div>
        <div style="font-size:11px; color:var(--text-3); margin-top:2px;">مشتريات وبضاعة مستلمة</div>
      </div>

      <div class="card" style="padding:14px 16px; background:var(--bg-card); border-radius:12px; border:1px solid rgba(16,185,129,0.25);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:11.5px; color:#059669; font-weight:800;">إجمالي المدفوعات (مدين)</div>
          <span class="badge" style="background:rgba(16,185,129,0.1); color:#059669; font-weight:700;">${data.counts.payment + data.counts.return} حركة</span>
        </div>
        <div class="mono font-bold" style="font-size:19px; color:#059669; margin-top:6px;">- ${formatCurrency(data.totalDebit)}</div>
        <div style="font-size:11px; color:var(--text-3); margin-top:2px;">سدادات نقدية/بنكية ومردودات</div>
      </div>

      <div class="card" style="padding:14px 16px; background:${isCreditor ? 'rgba(239,68,68,0.06)' : isDebtor ? 'rgba(16,185,129,0.06)' : 'var(--bg-card)'}; border:1.5px solid ${isCreditor ? '#ef4444' : isDebtor ? '#10b981' : 'var(--border-soft)'}; border-radius:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:11.5px; color:${isCreditor ? '#ef4444' : isDebtor ? '#059669' : 'var(--text-1)'}; font-weight:900;">
            ${isCreditor ? 'المستحق النهائي للمورد (دائن)' : isDebtor ? 'رصيد المورد (مدين لصالحنا)' : 'صافي الرصيد الختامي'}
          </div>
          <span style="font-size:16px;">${isCreditor ? '🔴' : isDebtor ? '🟢' : '⚖️'}</span>
        </div>
        <div class="mono font-bold" style="font-size:22px; color:${isCreditor ? '#dc2626' : isDebtor ? '#059669' : 'var(--text-0)'}; margin-top:6px;">
          ${isDebtor ? `(${formatCurrency(Math.abs(data.closingBalance))}) مدين` : formatCurrency(data.closingBalance)}
        </div>
        <div style="font-size:11px; color:${isCreditor ? '#ef4444' : isDebtor ? '#059669' : 'var(--text-2)'}; margin-top:2px; font-weight:700;">
          ${isCreditor ? '⚠️ يستلزم جدولة سداد' : isDebtor ? '✓ رصيد متبقي لصالح المؤسسة' : '✓ الحساب متزن تماماً'}
        </div>
      </div>

    </div>

    <!-- 3. Aging of Payables Bar (تحليل أعمار المستحقات) -->
    <div class="card mb-16" style="padding:16px 20px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:16px;">⏳</span>
          <span style="font-weight:800; font-size:14px; color:var(--text-0);">تحليل أعمار مستحقات المورد (Payables Aging Analysis):</span>
        </div>
        <div style="font-size:11px; color:var(--text-2); background:var(--bg-2); padding:3px 10px; border-radius:6px;">
          محسوبة بنظام الوارد أولاً يصرف أولاً FIFO
        </div>
      </div>

      <!-- Visual Multi-segment Progress Bar -->
      ${totalAging > 0 ? `
        <div style="height:10px; border-radius:5px; overflow:hidden; display:flex; margin-bottom:14px; background:var(--bg-2);">
          <div style="width:${p0}%; background:#10b981;" title="0 - 30 يوم: ${p0.toFixed(1)}%"></div>
          <div style="width:${p30}%; background:#f59e0b;" title="31 - 60 يوم: ${p30.toFixed(1)}%"></div>
          <div style="width:${p60}%; background:#f97316;" title="61 - 90 يوم: ${p60.toFixed(1)}%"></div>
          <div style="width:${p90}%; background:#ef4444;" title="+90 يوم: ${p90.toFixed(1)}%"></div>
        </div>
      ` : ""}

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:10px;">
        <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:10px; padding:12px; text-align:center;">
          <div style="font-size:11.5px; color:#10b981; font-weight:800;">🟢 جارية (0 - 30 يوم)</div>
          <div class="mono font-bold" style="font-size:16px; margin-top:4px; color:#10b981;">${formatCurrency(data.aging.d0_30)}</div>
        </div>
        <div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:10px; padding:12px; text-align:center;">
          <div style="font-size:11.5px; color:#f59e0b; font-weight:800;">🟡 معتدلة (31 - 60 يوم)</div>
          <div class="mono font-bold" style="font-size:16px; margin-top:4px; color:#f59e0b;">${formatCurrency(data.aging.d31_60)}</div>
        </div>
        <div style="background:rgba(249,115,22,0.08); border:1px solid rgba(249,115,22,0.25); border-radius:10px; padding:12px; text-align:center;">
          <div style="font-size:11.5px; color:#f97316; font-weight:800;">🟠 متأخرة (61 - 90 يوم)</div>
          <div class="mono font-bold" style="font-size:16px; margin-top:4px; color:#f97316;">${formatCurrency(data.aging.d61_90)}</div>
        </div>
        <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); border-radius:10px; padding:12px; text-align:center;">
          <div style="font-size:11.5px; color:#ef4444; font-weight:800;">🔴 مستحقة فوراً (+90 يوم)</div>
          <div class="mono font-bold" style="font-size:16px; margin-top:4px; color:#ef4444;">${formatCurrency(data.aging.d90_plus)}</div>
        </div>
      </div>
    </div>

    <!-- 4. Statement Movements Ledger Table -->
    <div class="card" style="border-radius:14px; overflow:hidden; border:1px solid var(--border-soft);">
      <div class="card-header no-print" style="padding:14px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); flex-wrap:wrap; gap:10px;">
        <div>
          <h3 style="margin:0; font-size:15px; font-weight:800; color:var(--text-0); display:flex; align-items:center; gap:8px;">
            <span>📑</span> <span>حركات كشف حساب: ${sup.name}</span>
          </h3>
          <div style="font-size:11.5px; color:var(--text-2); margin-top:3px;">
            الفترة من <b>${data.fromDate || "البداية"}</b> إلى <b>${data.toDate || todayStr()}</b>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="badge" style="font-size:12px; font-weight:700;">المعروض: ${data.transactions.length} حركة</span>
        </div>
      </div>

      <div class="table-container">
        <table class="data-dense" id="stmt-sup-table" style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:var(--bg-2); border-bottom:2px solid var(--border-soft);">
              <th style="width:40px; text-align:center;">#</th>
              <th style="width:95px;">التاريخ</th>
              <th style="width:130px;">نوع الحركة</th>
              <th style="width:115px;">رقم المستند</th>
              <th>البيان والتفاصيل</th>
              <th style="width:115px; text-align:left;">مدين (سداد/مرتجع)</th>
              <th style="width:115px; text-align:left;">دائن (مشتريات/استرداد)</th>
              <th style="width:125px; text-align:left;">الرصيد التراكمي</th>
              <th style="width:55px; text-align:center;" class="no-print">معاينة</th>
            </tr>
          </thead>
          <tbody>
            <!-- Opening balance row -->
            <tr style="background:rgba(99,102,241,0.03); font-weight:700; border-bottom:1px solid var(--border-soft);">
              <td style="text-align:center; color:var(--text-3); font-size:11px;">—</td>
              <td class="mono font-bold">${data.fromDate || "—"}</td>
              <td><span class="badge neutral" style="font-weight:700;">📌 رصيد سابق</span></td>
              <td class="mono" style="color:var(--text-3);">—</td>
              <td style="font-weight:700; color:var(--text-1);">رصيد ما قبل فترة الكشف المحددة</td>
              <td class="mono" style="text-align:left; color:var(--text-dim);">—</td>
              <td class="mono" style="text-align:left; color:var(--text-dim);">—</td>
              <td class="mono font-bold" style="text-align:left; color:${data.openingBalance > 0 ? '#ef4444' : data.openingBalance < 0 ? '#10b981' : 'var(--text-1)'}; font-size:13.5px;">
                ${data.openingBalance < 0 ? `(${formatCurrency(Math.abs(data.openingBalance))}) مدين` : formatCurrency(data.openingBalance)}
              </td>
              <td style="text-align:center;" class="no-print">—</td>
            </tr>

            ${data.transactions.length === 0 ? `
              <tr>
                <td colspan="9" style="text-align:center; padding:36px; color:var(--text-2);">
                  <div style="font-size:24px; margin-bottom:6px;">📭</div>
                  <div>لا توجد حركات مسجلة للمورد خلال هذه الفترة المحددة</div>
                </td>
              </tr>
            ` : data.transactions.map((t, idx) => `
              <tr style="border-bottom:1px solid var(--border-soft); transition:background 0.1s ease;">
                <td style="text-align:center; color:var(--text-3); font-size:11px;" class="mono">${idx + 1}</td>
                <td class="mono dim">${t.date || "—"}</td>
                <td>${t.typeBadge}</td>
                <td class="mono font-bold" style="color:var(--brand); cursor:pointer;" onclick="window.previewSupplierDoc('${t.type}', '${t.id}')" title="عرض تفاصيل المستند">
                  ${t.docNumber}
                </td>
                <td style="font-size:12.5px; line-height:1.4;">${t.description}</td>
                <td class="mono font-bold" style="text-align:left; color:${t.debit > 0 ? '#059669' : 'var(--text-dim)'};">
                  ${t.debit > 0 ? formatCurrency(t.debit) : '—'}
                </td>
                <td class="mono font-bold" style="text-align:left; color:${t.credit > 0 ? '#4f46e5' : 'var(--text-dim)'};">
                  ${t.credit > 0 ? formatCurrency(t.credit) : '—'}
                </td>
                <td class="mono font-bold" style="text-align:left; color:${t.balanceAfter > 0 ? '#dc2626' : t.balanceAfter < 0 ? '#059669' : 'var(--text-1)'}; font-size:13px;">
                  ${t.balanceAfter < 0 ? `(${formatCurrency(Math.abs(t.balanceAfter))}) مدين` : formatCurrency(t.balanceAfter)}
                </td>
                <td style="text-align:center;" class="no-print">
                  <button class="btn btn-icon sm btn-ghost" onclick="window.previewSupplierDoc('${t.type}', '${t.id}')" title="معاينة تفاصيل المستند">👁️</button>
                </td>
              </tr>
            `).join("")}

            <!-- Summary Totals Row -->
            <tr style="background:var(--bg-2); font-weight:800; border-top:2px solid var(--border-soft);">
              <td colspan="5" style="text-align:center; font-size:13.5px; color:var(--text-0);">
                الإجمالي الكلي للحركات والرصيد الختامي المستحق
              </td>
              <td class="mono font-bold" style="text-align:left; color:#059669; font-size:14px;">
                ${formatCurrency(data.totalDebit)}
              </td>
              <td class="mono font-bold" style="text-align:left; color:#4f46e5; font-size:14px;">
                ${formatCurrency(data.totalCredit)}
              </td>
              <td class="mono font-bold" style="text-align:left; color:${isCreditor ? '#dc2626' : isDebtor ? '#059669' : 'var(--text-0)'}; font-size:15px;">
                ${data.closingBalance < 0 ? `(${formatCurrency(Math.abs(data.closingBalance))}) مدين` : formatCurrency(data.closingBalance)}
              </td>
              <td class="no-print"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Official Signatures Block (printed or at bottom) -->
    <div class="print-only" style="display:none; margin-top:36px; padding-top:20px; border-top:1.5px dashed #94a3b8;">
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; text-align:center; font-size:12px;">
        <div>
          <div style="font-weight:bold; margin-bottom:45px;">إعداد المحاسب المسؤول</div>
          <div style="border-top:1px solid #64748b; padding-top:4px;">التوقيع: ............................</div>
        </div>
        <div>
          <div style="font-weight:bold; margin-bottom:45px;">اعتماد الإدارة المالية</div>
          <div style="border-top:1px solid #64748b; padding-top:4px;">التوقيع: ............................</div>
        </div>
        <div>
          <div style="font-weight:bold; margin-bottom:45px;">ختم ومصادقة المورد</div>
          <div style="border-top:1px solid #64748b; padding-top:4px;">الختم والتوقيع: ....................</div>
        </div>
      </div>
    </div>
  `;
}

function setupGlobalFunctions() {
  window.selectSupplierForStmt = async (supId) => {
    document.getElementById("stmt-sup-results")?.classList.add("hidden");
    selectedSupplierId = supId;

    const sel = document.getElementById("stmt-sup-select");
    if (sel) sel.value = supId;

    const sup = allSuppliers.find(s => s.id === supId);
    if (sup) {
      const searchInput = document.getElementById("stmt-sup-search");
      if (searchInput) searchInput.value = sup.name;
      const clr = document.getElementById("stmt-sup-clear");
      if (clr) clr.style.display = "block";
    }

    // Enable action buttons
    ["stmt-btn-print", "stmt-btn-excel", "stmt-btn-wa", "stmt-btn-confirm"].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.disabled = false;
    });

    await window.reloadSupplierStatement();
  };

  window.onSupplierSelectChange = async (val) => {
    if (!val) {
      window.clearSupplierSearch();
      return;
    }
    await window.selectSupplierForStmt(val);
  };

  window.clearSupplierSearch = () => {
    selectedSupplierId = null;
    currentStatementData = null;
    currentSupplierDoc = null;

    const inp = document.getElementById("stmt-sup-search");
    if (inp) inp.value = "";

    const clr = document.getElementById("stmt-sup-clear");
    if (clr) clr.style.display = "none";

    const sel = document.getElementById("stmt-sup-select");
    if (sel) sel.value = "";

    const typeBar = document.getElementById("stmt-sup-type-bar");
    if (typeBar) typeBar.style.display = "none";

    ["stmt-btn-print", "stmt-btn-excel", "stmt-btn-wa", "stmt-btn-confirm"].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.disabled = true;
    });

    const container = document.getElementById("supplier-statement-content");
    if (container) {
      container.innerHTML = `
        <div class="card" style="padding:56px 24px; text-align:center; color:var(--text-2); border-radius:14px; background:var(--bg-card); border:1px dashed var(--border);">
          <div style="font-size:52px; margin-bottom:14px;">📊</div>
          <div style="font-size:18px; font-weight:800; color:var(--text-0);">يرجى البحث عن المورد أو اختياره من القائمة أعلاه</div>
          <div style="font-size:13px; color:var(--text-2); margin-top:6px; max-width:540px; margin-left:auto; margin-right:auto;">
            يمكنك كتابة اسم المورد، كود المورد، رقم الهاتف أو الرقم الضريبي لبدء التحليل الفوري لكشف الحساب.
          </div>
        </div>
      `;
    }
  };

  window.onSupplierDateChange = async () => {
    if (selectedSupplierId) {
      await window.reloadSupplierStatement();
    }
  };

  window.setSupplierPeriod = async (period) => {
    activePeriod = period;
    const fInput = document.getElementById("stmt-sup-from");
    const tInput = document.getElementById("stmt-sup-to");
    if (!fInput || !tInput) return;

    // Update active button styling
    ["month", "last_month", "quarter", "year", "all"].forEach(p => {
      const b = document.getElementById(`btn-p-${p === "last_month" ? "last-month" : p}`);
      if (b) {
        if (p === period) {
          b.className = "btn btn-primary btn-sm";
        } else {
          b.className = "btn btn-secondary btn-sm";
        }
      }
    });

    const now = new Date();
    if (period === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      fInput.value = startOfMonth;
      tInput.value = todayStr();
    } else if (period === "last_month") {
      const startOfLast = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
      const endOfLast = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
      fInput.value = startOfLast;
      tInput.value = endOfLast;
    } else if (period === "quarter") {
      fInput.value = quarterAgoStr();
      tInput.value = todayStr();
    } else if (period === "year") {
      fInput.value = startOfYearStr();
      tInput.value = todayStr();
    } else if (period === "all") {
      fInput.value = "";
      tInput.value = todayStr();
    }

    if (selectedSupplierId) {
      await window.reloadSupplierStatement();
    }
  };

  window.reloadSupplierStatement = async () => {
    const supId = selectedSupplierId || document.getElementById("stmt-sup-select")?.value;
    if (!supId) {
      window.clearSupplierSearch();
      return;
    }

    const fromDate = document.getElementById("stmt-sup-from")?.value || "";
    const toDate = document.getElementById("stmt-sup-to")?.value || "";

    const container = document.getElementById("supplier-statement-content");
    if (container) {
      container.innerHTML = `
        <div style="text-align:center; padding:70px; color:var(--text-2);">
          <div class="spin" style="width:36px; height:36px; border:3px solid rgba(99,102,241,0.2); border-top-color:#4f46e5; border-radius:50%; margin:0 auto 16px auto;"></div>
          <div style="font-weight:800; font-size:16px; color:var(--text-0);">جاري جلب وفحص حركات المورد والمطابقة المحاسبية...</div>
          <div style="font-size:12px; margin-top:4px;">تتم مراجعة فواتير المشتريات، سندات الصرف، القيود ومردودات الشراء</div>
        </div>
      `;
    }

    const data = await buildSupplierStatement(supId, fromDate, toDate);
    currentStatementData = data;
    renderStatementUI(data);
  };

  window.filterSupplierStatementType = (type) => {
    if (!currentStatementData) return;
    activeTypeFilter = type;

    // Update active filter pill button style
    ["all", "purchase", "payment", "receipt", "return", "journal"].forEach(t => {
      const b = document.getElementById(`btn-flt-${t}`);
      if (b) {
        if (t === type) {
          b.className = "btn btn-primary btn-sm";
        } else {
          b.className = "btn btn-secondary btn-sm";
        }
      }
    });

    if (type === "all") {
      currentStatementData.transactions = currentStatementData.allFiltered;
    } else {
      currentStatementData.transactions = currentStatementData.allFiltered.filter(t => t.type === type);
    }
    renderStatementUI(currentStatementData);
  };

  window.previewSupplierDoc = (type, id) => {
    const t = currentStatementData?.allFiltered?.find(x => x.id === id);
    if (!t) return;

    const modalTitle = document.getElementById("doc-sup-modal-title");
    const modalBody = document.getElementById("doc-sup-modal-body");
    modalTitle.textContent = `${t.typeLabel} — ${t.docNumber}`;

    const raw = t.raw || {};
    let bodyHtml = `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:18px; background:var(--bg-2); padding:14px; border-radius:10px; font-size:13px; border:1px solid var(--border-soft);">
        <div><span style="color:var(--text-3);">التاريخ:</span> <b class="mono">${t.date || "—"}</b></div>
        <div><span style="color:var(--text-3);">المورد:</span> <b>${currentSupplierDoc?.name || "—"}</b></div>
        <div><span style="color:var(--text-3);">المبلغ:</span> <b class="mono font-bold text-brand" style="font-size:15px;">${formatCurrency(t.debit || t.credit)}</b></div>
        <div><span style="color:var(--text-3);">نوع الحركة:</span> <span>${t.typeLabel}</span></div>
        <div style="grid-column:1 / -1;"><span style="color:var(--text-3);">البيان:</span> <span>${t.description}</span></div>
      </div>
    `;

    if (type === "purchase" && (raw.lines || raw.items)) {
      const items = raw.lines || raw.items || [];
      bodyHtml += `
        <div style="font-weight:800; font-size:13.5px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
          <span>📦 الأصناف المشتراة بالفاتورة:</span>
          <span class="badge" style="font-size:11.5px;">${items.length} صنف</span>
        </div>
        <div class="table-container" style="max-height:280px; overflow-y:auto; border-radius:8px; border:1px solid var(--border-soft);">
          <table class="data-dense" style="margin:0; width:100%;">
            <thead>
              <tr style="background:var(--bg-2);">
                <th>الصنف</th>
                <th style="width:75px; text-align:center;">الكمية</th>
                <th style="width:95px; text-align:left;">سعر الوحدة</th>
                <th style="width:95px; text-align:left;">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(it => `
                <tr>
                  <td><b>${it.productName || it.name || "صنف غذائي"}</b></td>
                  <td class="mono font-bold" style="text-align:center;">${it.qty || it.quantity || 1} ${it.unit || ""}</td>
                  <td class="mono" style="text-align:left;">${formatCurrency(it.unitPrice || it.price || 0)}</td>
                  <td class="mono font-bold" style="text-align:left; color:var(--brand);">${formatCurrency(it.total || ((it.qty||1)*(it.unitPrice||0)))}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    } else if (type === "payment") {
      bodyHtml += `
        <div style="padding:14px; background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.2); border-radius:8px; font-size:13px;">
          <div style="font-weight:800; color:#059669; margin-bottom:8px;">تفاصيل سند الصرف:</div>
          <div>طريقة الدفع: <b>${raw.paymentMethod || raw.method || "تحويل بنكي / نقدي"}</b></div>
          ${raw.sourceName ? `<div>الحساب / الخزينة: <b>${raw.sourceName}</b></div>` : ""}
          ${raw.beneficiary ? `<div>المستفيد: <b>${raw.beneficiary}</b></div>` : ""}
          ${raw.referenceNo ? `<div>الرقم المرجعي: <b class="mono">${raw.referenceNo}</b></div>` : ""}
        </div>
      `;
    } else if (type === "receipt") {
      bodyHtml += `
        <div style="padding:14px; background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.2); border-radius:8px; font-size:13px;">
          <div style="font-weight:800; color:#059669; margin-bottom:8px;">تفاصيل سند القبض / الاسترداد:</div>
          <div>طريقة القبض: <b>${raw.paymentMethod || raw.method || "نقدي / بنكي"}</b></div>
          ${raw.sourceName ? `<div>الخزينة / الحساب المودع فيه: <b>${raw.sourceName}</b></div>` : ""}
          ${raw.referenceNo ? `<div>الرقم المرجعي: <b class="mono">${raw.referenceNo}</b></div>` : ""}
        </div>
      `;
    } else if (type === "return" && (raw.items || raw.lines)) {
      const items = raw.items || raw.lines || [];
      bodyHtml += `
        <div style="font-weight:800; font-size:13.5px; margin-bottom:10px;">↩️ الأصناف المرتجعة للمورد:</div>
        <div class="table-container" style="max-height:280px; overflow-y:auto; border-radius:8px; border:1px solid var(--border-soft);">
          <table class="data-dense" style="margin:0; width:100%;">
            <thead>
              <tr style="background:var(--bg-2);">
                <th>الصنف</th>
                <th style="width:75px; text-align:center;">الكمية</th>
                <th style="width:95px; text-align:left;">السعر</th>
                <th style="width:95px; text-align:left;">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(it => `
                <tr>
                  <td><b>${it.productName || it.name}</b></td>
                  <td class="mono font-bold" style="text-align:center;">${it.qty || it.quantity || 1} ${it.unit || ""}</td>
                  <td class="mono" style="text-align:left;">${formatCurrency(it.unitPrice || it.price || 0)}</td>
                  <td class="mono font-bold" style="text-align:left; color:#f97316;">${formatCurrency(it.total || ((it.qty||1)*(it.unitPrice||0)))}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    } else if (type === "journal" && raw.lines) {
      bodyHtml += `
        <div style="font-weight:800; font-size:13.5px; margin-bottom:10px;">⚖️ بنود وسطور القيد المحاسبي:</div>
        <div class="table-container" style="max-height:280px; overflow-y:auto; border-radius:8px; border:1px solid var(--border-soft);">
          <table class="data-dense" style="margin:0; width:100%;">
            <thead>
              <tr style="background:var(--bg-2);">
                <th>الحساب</th>
                <th style="width:110px; text-align:left;">مدين</th>
                <th style="width:110px; text-align:left;">دائن</th>
                <th>البيان الفرعي</th>
              </tr>
            </thead>
            <tbody>
              ${(raw.lines || []).map(ln => `
                <tr>
                  <td><b>${ln.accountCode ? `<span class="mono" style="color:#6366f1;">${ln.accountCode}</span> ` : ""}${ln.accountName || "—"}</b></td>
                  <td class="mono font-bold" style="text-align:left; color:${ln.debit > 0 ? '#10B981' : 'var(--text-dim)'};">${ln.debit > 0 ? formatCurrency(ln.debit) : '—'}</td>
                  <td class="mono font-bold" style="text-align:left; color:${ln.credit > 0 ? 'var(--brand)' : 'var(--text-dim)'};">${ln.credit > 0 ? formatCurrency(ln.credit) : '—'}</td>
                  <td style="font-size:11.5px; color:var(--text-2);">${ln.note || ln.subDescription || "—"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    modalBody.innerHTML = bodyHtml;
    openModal("doc-sup-preview-modal");
  };

  window.shareSupplierStatementWhatsApp = () => {
    if (!currentStatementData || !currentSupplierDoc) { alert("يرجى اختيار المورد أولاً"); return; }
    const sup = currentSupplierDoc;
    const clean = (sup.phone || "").replace(/[^0-9]/g, "");
    const intlPhone = clean.startsWith("0") ? "966" + clean.slice(1) : (clean.startsWith("966") ? clean : "966" + clean);
    const co = window.ERP_COMPANY?.name || "مؤسسة إدهام للمواد الغذائية";

    const msg = `سعادة المورد المحترم / ${sup.name}\nتحية طيبة من ${co} 🌿\n\nنرفق لكم ملخص كشف الحساب:\n• الفترة: من ${currentStatementData.fromDate || "البداية"} إلى ${currentStatementData.toDate || todayStr()}\n• الرصيد السابق: ${formatCurrency(currentStatementData.openingBalance)}\n• إجمالي المشتريات: ${formatCurrency(currentStatementData.totalCredit)}\n• إجمالي المسدد: ${formatCurrency(currentStatementData.totalDebit)}\n• صافي الرصيد المستحق لكم: ${formatCurrency(currentStatementData.closingBalance)}\n\nشاكرين ومقدرين حسن تعاونكم معنا!`;

    window.open(`https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(msg)}`, "_blank");
  };

  window.printSupplierConfirmationLetter = () => {
    if (!currentStatementData || !currentSupplierDoc) { alert("يرجى اختيار المورد أولاً"); return; }
    const sup = currentSupplierDoc;
    const co = window.ERP_COMPANY || { name: "مؤسسة إدهام للمواد الغذائية", vatNumber: "310000000000003" };

    const win = window.open("", "_blank");
    win.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>خطاب مصادقة ومطابقة رصيد مورد - ${sup.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, system-ui, sans-serif; padding: 40px; color: #111; line-height: 1.8; text-align: right; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .box { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 20px; margin: 20px 0; font-size: 14px; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 60px; text-align: center; }
            .sig-line { border-top: 1px dashed #475569; margin-top: 60px; padding-top: 8px; font-weight: bold; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin:0; font-size:22px;">${co.name}</h2>
            <div style="font-size:12px; color:#666;">الرقم الضريبي: ${co.vatNumber || "—"}</div>
            <h3 style="margin-top:15px; color:#4338CA; font-size:18px;">خطاب مصادقة ومطابقة رصيد مورد</h3>
          </div>

          <p><b>السادة المحترمون / شركة: ${sup.name}</b></p>
          <p>تحية طيبة وبعد،،،</p>
          <p>
            في إطار المراجعة الدورية للحسابات والمطابقة المحاسبية بين الطرفين، نرجو التكرم بالإحاطة بأن رصيد حسابكم المسجل في دفاترنا كما في تاريخ <b>${currentStatementData.toDate || todayStr()}</b> هو كالتالي:
          </p>

          <div class="box">
            <div>• الرصيد المستحق لكم في دفاترنا: <b style="font-size:16px; color:#4338ca;">${formatCurrency(currentStatementData.closingBalance)}</b></div>
            <div>• إجمالي مسحوبات ومشتريات الفترة: <b>${formatCurrency(currentStatementData.totalCredit)}</b></div>
            <div>• إجمالي السدادات والحوالات المنفذة: <b>${formatCurrency(currentStatementData.totalDebit)}</b></div>
            <div>• الرصيد الافتتاحي السابق: <b>${formatCurrency(currentStatementData.openingBalance)}</b></div>
          </div>

          <p>نرجو التكرم بمطابقة الرصيد مع دفاتركم وإعادة توقيع وختم هذا الخطاب بالمصادقة أو إشعارنا بأي فروقات إن وجدت.</p>

          <div class="signatures">
            <div>
              <div>عن / ${co.name}</div>
              <div class="sig-line">الختم والتوقيع المعتمد</div>
            </div>
            <div>
              <div>عن / ${sup.name} (المورد)</div>
              <div class="sig-line">المصادقة والختم الرسمي</div>
            </div>
          </div>

          <script>window.onload = () => { window.print(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  window.printSupplierStatement = () => {
    if (!currentStatementData) return;
    window.print();
  };

  window.exportSupplierStatementExcel = () => {
    if (!currentStatementData || !currentSupplierDoc) return;
    const sup = currentSupplierDoc;

    const rows = [
      {
        "التاريخ": currentStatementData.fromDate || "—",
        "نوع الحركة": "رصيد سابق",
        "رقم المستند": "—",
        "البيان": "رصيد ما قبل فترة الكشف المحددة",
        "مدين (سداد)": 0,
        "دائن (مشتريات)": 0,
        "الرصيد التراكمي": currentStatementData.openingBalance
      },
      ...currentStatementData.transactions.map(t => ({
        "التاريخ": t.date,
        "نوع الحركة": t.typeLabel,
        "رقم المستند": t.docNumber,
        "البيان": t.description,
        "مدين (سداد)": t.debit,
        "دائن (مشتريات)": t.credit,
        "الرصيد التراكمي": t.balanceAfter
      })),
      {
        "التاريخ": "الإجمالي",
        "نوع الحركة": "الرصيد الختامي",
        "رقم المستند": "—",
        "البيان": "إجمالي حركات الفترة والرصيد النهائي المستحق",
        "مدين (سداد)": currentStatementData.totalDebit,
        "دائن (مشتريات)": currentStatementData.totalCredit,
        "الرصيد التراكمي": currentStatementData.closingBalance
      }
    ];

    const cleanName = (sup.name || "مورد").replace(/[/\\?%*:|"<>]/g, "_");
    exportToExcel(rows, `كشف_حساب_مورد_${cleanName}_${todayStr()}`);
  };
}
