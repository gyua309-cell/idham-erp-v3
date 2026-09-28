// ============================================================
// IDHAM ERP — كشف حساب مورد تفصيلي وأعمار المستحقات
// Detailed Supplier Statement, Payables Aging & Balance Confirmation
// ============================================================
import { COLS, getAll, query, where, orderBy, getDocs, getById } from "../utils/db.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

let allSuppliers = [];
let selectedSupplierId = null;
let currentStatementData = [];
let currentSupplierDoc = null;

const todayStr = () => new Date().toISOString().slice(0, 10);
const startOfYearStr = () => `${new Date().getFullYear()}-01-01`;

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar no-print">
      <div class="filter-select-group" style="min-width:260px;">
        <label>اختر المورد *</label>
        <select id="stmt-sup-select" class="input" onchange="window.onSupplierSelectChange(this.value)">
          <option value="">-- اختر المورد لعرض الكشف --</option>
        </select>
      </div>

      <div class="filter-date-group">
        <label>من تاريخ</label>
        <input type="date" id="stmt-sup-from" class="input" value="${startOfYearStr()}" onchange="window.reloadSupplierStatement()" />
      </div>

      <div class="filter-date-group">
        <label>إلى تاريخ</label>
        <input type="date" id="stmt-sup-to" class="input" value="${todayStr()}" onchange="window.reloadSupplierStatement()" />
      </div>

      <div class="filter-select-group">
        <label>نوع الحركة</label>
        <select id="stmt-sup-type-filter" class="input" onchange="window.filterSupplierStatementType(this.value)">
          <option value="all">كل الحركات</option>
          <option value="purchase">فواتير مشتريات فقط</option>
          <option value="payment">سندات صرف فقط</option>
          <option value="receipt">سندات قبض (استرداد) فقط</option>
          <option value="return">مردودات شراء فقط</option>
          <option value="journal">قيود اليومية والافتتاحية فقط</option>
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:6px; flex-wrap:wrap;">
        <button class="btn btn-secondary" onclick="window.exportSupplierStatementExcel()">📊 Excel</button>
        <button class="btn btn-secondary" style="color:#25D366;" onclick="window.shareSupplierStatementWhatsApp()">💬 واتساب</button>
        <button class="btn btn-secondary" onclick="window.printSupplierConfirmationLetter()">📑 مصادقة رصيد</button>
        <button class="btn btn-primary" onclick="window.printSupplierStatement()">🖨️ طباعة كشف الحساب</button>
      </div>
    </div>

    <div class="page-content" id="supplier-statement-content">
      <div class="card" style="padding:48px 24px; text-align:center; color:var(--text-2);" id="stmt-sup-empty-placeholder">
        <div style="font-size:44px; margin-bottom:12px;">📊</div>
        <div style="font-size:16px; font-weight:700; color:var(--text-1);">يرجى اختيار مورد لعرض كشف الحساب وتحليل المستحقات</div>
        <div style="font-size:12px; margin-top:4px;">سيتم جلب كافة فواتير المشتريات وسندات الصرف وسندات القبض ومردودات الشراء آلياً</div>
      </div>
    </div>

    <!-- Drill-down Modal -->
    <div class="modal-overlay" id="doc-sup-preview-modal">
      <div class="modal modal-lg" style="max-width:700px;">
        <div class="modal-header">
          <h3 class="modal-title" id="doc-sup-modal-title">تفاصيل المستند</h3>
          <button class="modal-close" onclick="closeModal('doc-sup-preview-modal')">×</button>
        </div>
        <div class="modal-body" id="doc-sup-modal-body" style="padding:20px;"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('doc-sup-preview-modal')">إغلاق</button>
        </div>
      </div>
    </div>
  `;

  await loadSuppliers();
  setupGlobalFunctions();
}

async function loadSuppliers() {
  try {
    allSuppliers = await getAll(COLS.suppliers(), [orderBy("name")]);
    const sel = document.getElementById("stmt-sup-select");
    if (!sel) return;

    sel.innerHTML = `<option value="">-- اختر المورد لعرض الكشف --</option>` +
      allSuppliers.map(s => {
        return `<option value="${s.id}">${s.name}</option>`;
      }).join("");

    if (selectedSupplierId) {
      sel.value = selectedSupplierId;
      await window.reloadSupplierStatement();
    }
  } catch (e) {
    console.warn("Error loading suppliers for statement:", e);
  }
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
      typeBadge: '<span class="badge" style="background:rgba(99,102,241,0.1); color:var(--brand); font-weight:700;">فاتورة مشتريات</span>',
      description: inv.notes || `شراء بضاعة ومواد غذائية (فاتورة ${inv.number || ""})`,
      debit: 0,
      credit: total,
      raw: inv
    });
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
      typeBadge: '<span class="badge good" style="font-weight:700;">سند صرف نقدي/بنكي</span>',
      description: pay.notes || pay.description || `سداد دفعة من الحساب (${pay.paymentMethod || "تحويل بنكي"})`,
      debit: amt,
      credit: 0,
      raw: pay
    });
  });

  // 2b. Receipt Vouchers from Supplier (Credit -> Supplier refunded/paid us, reducing their debit balance or increasing credit)
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
      typeBadge: '<span class="badge" style="background:rgba(16,185,129,0.12); color:#059669; border:1px solid rgba(16,185,129,0.3); font-weight:700;">💵 سند قبض من مورد</span>',
      description: rcpt.notes ? `سند قبض من المورد — ${rcpt.notes} (${rcpt.sourceName || (rcpt.method === "cash" ? "نقدي" : "بنكي")})` : `قبض/استرداد دفعة من المورد (${rcpt.sourceName || "نقدي/بنكي"})`,
      debit: 0,
      credit: amt,
      raw: rcpt
    });
  });

  // 3. Purchase Returns (Debit -> Reduces debt to supplier)
  returnsSnap.docs.forEach(doc => {
    const ret = doc.data();
    if (ret.status === "cancelled") return;
    const retDate = ret.date || "";
    const total = parseFloat(ret.totalWithVat || ret.total || 0);

    rawTransactions.push({
      id: doc.id,
      docNumber: ret.number || ret.returnNumber || doc.id.slice(0, 8),
      date: retDate,
      type: "return",
      typeLabel: "مردودات شراء",
      typeBadge: '<span class="badge warn" style="font-weight:700;">مردود شراء</span>',
      description: ret.reason || ret.notes || "مرتجع بضاعة للمورد",
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

        const isOpening = (je.description || "").includes("افتتاحي") || (line.note || "").includes("افتتاحي") || je.sourceType === "opening";

        rawTransactions.push({
          id: `${doc.id}_${idx}`,
          docNumber: je.entryNumber || je.number || doc.id.slice(0, 8),
          date: je.date || "",
          type: "journal",
          typeLabel: isOpening ? "قيد رصيد افتتاحي" : "قيد يومية",
          typeBadge: isOpening 
            ? '<span class="badge" style="background:#fef3c7; color:#b45309; font-weight:700;">⚖️ قيد افتتاحى</span>'
            : '<span class="badge" style="background:#f3e8ff; color:#7e22ce; font-weight:700;">📝 قيد تسوية/يومية</span>',
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
    aging
  };
}

function renderStatementUI(data) {
  const container = document.getElementById("supplier-statement-content");
  if (!container || !data) return;

  const sup = data.supplier;
  const isCreditor = data.closingBalance > 0;

  container.innerHTML = `
    <!-- Top Summary & Aging Cards -->
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:16px;">
      <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
        <div style="font-size:11px; color:var(--text-3); font-weight:700;">الرصيد الافتتاحي</div>
        <div class="mono" style="font-size:17px; font-weight:800; margin-top:4px;">${formatCurrency(data.openingBalance)}</div>
      </div>
      <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
        <div style="font-size:11px; color:var(--brand); font-weight:700;">إجمالي المشتريات (دائن)</div>
        <div class="mono font-bold" style="font-size:17px; color:var(--brand); margin-top:4px;">+ ${formatCurrency(data.totalCredit)}</div>
      </div>
      <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
        <div style="font-size:11px; color:#10B981; font-weight:700;">إجمالي السدادات (مدين)</div>
        <div class="mono font-bold" style="font-size:17px; color:#10B981; margin-top:4px;">- ${formatCurrency(data.totalDebit)}</div>
      </div>
      <div class="card" style="padding:14px; background:${isCreditor ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)'}; border:1.5px solid ${isCreditor ? '#EF4444' : '#10B981'}; border-radius:12px;">
        <div style="font-size:11px; color:${isCreditor ? '#EF4444' : '#10B981'}; font-weight:800;">
          ${isCreditor ? 'المستحق النهائي للمورد (دائن)' : data.closingBalance < 0 ? 'رصيد المورد (مدين لصالحنا)' : 'الرصيد المتبقي'}
        </div>
        <div class="mono font-bold" style="font-size:20px; color:${isCreditor ? '#EF4444' : '#10B981'}; margin-top:4px;">
          ${data.closingBalance < 0 ? `(${formatCurrency(Math.abs(data.closingBalance))}) مدين` : formatCurrency(Math.abs(data.closingBalance))}
        </div>
      </div>
    </div>

    <!-- Aging of Payables Bar -->
    <div class="card mb-16" style="padding:14px 18px; border-radius:12px; background:var(--bg-card);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <div style="font-weight:800; font-size:13px; color:var(--text-0);">⏳ تحليل أعمار مستحقات المورد (Payables Aging):</div>
        <div style="font-size:11px; color:var(--text-2);">محسوبة بنظام الوارد أولاً يصرف أولاً FIFO</div>
      </div>
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px;">
        <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:8px; padding:10px; text-align:center;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">🟢 حديث (0 - 30 يوم)</div>
          <div class="mono font-bold" style="font-size:15px; margin-top:2px;">${formatCurrency(data.aging.d0_30)}</div>
        </div>
        <div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:8px; padding:10px; text-align:center;">
          <div style="font-size:11px; color:#F59E0B; font-weight:700;">🟡 متوسط (31 - 60 يوم)</div>
          <div class="mono font-bold" style="font-size:15px; margin-top:2px;">${formatCurrency(data.aging.d31_60)}</div>
        </div>
        <div style="background:rgba(249,115,22,0.08); border:1px solid rgba(249,115,22,0.25); border-radius:8px; padding:10px; text-align:center;">
          <div style="font-size:11px; color:#F97316; font-weight:700;">🟠 متأخر (61 - 90 يوم)</div>
          <div class="mono font-bold" style="font-size:15px; margin-top:2px;">${formatCurrency(data.aging.d61_90)}</div>
        </div>
        <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); border-radius:8px; padding:10px; text-align:center;">
          <div style="font-size:11px; color:#EF4444; font-weight:700;">🔴 مستحق فوراً (+90 يوم)</div>
          <div class="mono font-bold" style="font-size:15px; margin-top:2px;">${formatCurrency(data.aging.d90_plus)}</div>
        </div>
      </div>
    </div>

    <!-- Statement Table -->
    <div class="card">
      <div class="card-header" style="padding:14px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h3 style="margin:0; font-size:15px; font-weight:800; color:var(--text-0);">
            📑 حركات كشف حساب: ${sup.name}
          </h3>
          <div style="font-size:11px; color:var(--text-2); margin-top:2px;">
            الفترة من ${data.fromDate || "البداية"} إلى ${data.toDate || "اليوم"}
          </div>
        </div>
        <span class="badge" style="font-size:12px;">${data.transactions.length} حركة</span>
      </div>

      <div class="table-container">
        <table class="data-dense" id="stmt-sup-table">
          <thead>
            <tr>
              <th style="width:100px;">التاريخ</th>
              <th style="width:120px;">نوع الحركة</th>
              <th style="width:110px;">رقم المستند</th>
              <th>البيان والتفاصيل</th>
              <th style="width:110px; text-align:left;">مدين (سداد/مرتجع)</th>
              <th style="width:110px; text-align:left;">دائن (مشتريات/استرداد)</th>
              <th style="width:120px; text-align:left;">الرصيد التراكمي</th>
              <th style="width:50px; text-align:center;">معاينة</th>
            </tr>
          </thead>
          <tbody>
            <!-- Opening balance row -->
            <tr style="background:var(--bg-2); font-weight:700;">
              <td class="mono">${data.fromDate || "—"}</td>
              <td><span class="badge neutral">رصيد سابق</span></td>
              <td class="mono">—</td>
              <td>رصيد ما قبل فترة الكشف</td>
              <td class="mono" style="text-align:left;">—</td>
              <td class="mono" style="text-align:left;">—</td>
              <td class="mono" style="text-align:left; color:var(--brand);">${formatCurrency(data.openingBalance)}</td>
              <td style="text-align:center;">—</td>
            </tr>

            ${data.transactions.map(t => `
              <tr>
                <td class="mono dim">${t.date || "—"}</td>
                <td>${t.typeBadge}</td>
                <td class="mono font-bold" style="color:var(--brand);">${t.docNumber}</td>
                <td style="font-size:12px;">${t.description}</td>
                <td class="mono font-bold" style="text-align:left; color:${t.debit > 0 ? '#10B981' : 'var(--text-dim)'};">
                  ${t.debit > 0 ? formatCurrency(t.debit) : '—'}
                </td>
                <td class="mono font-bold" style="text-align:left; color:${t.credit > 0 ? 'var(--brand)' : 'var(--text-dim)'};">
                  ${t.credit > 0 ? formatCurrency(t.credit) : '—'}
                </td>
                <td class="mono font-bold" style="text-align:left; color:${t.balanceAfter > 0 ? '#EF4444' : '#10B981'};">
                  ${t.balanceAfter < 0 ? `(${formatCurrency(Math.abs(t.balanceAfter))}) مدين` : formatCurrency(t.balanceAfter)}
                </td>
                <td style="text-align:center;">
                  <button class="btn btn-icon sm btn-ghost" onclick="window.previewSupplierDoc('${t.type}', '${t.id}')" title="معاينة تفاصيل المستند">👁️</button>
                </td>
              </tr>
            `).join("")}

            <!-- Summary Totals Row -->
            <tr style="background:var(--bg-2); font-weight:800; border-top:2px solid var(--border-soft);">
              <td colspan="4" style="text-align:center;">الإجمالي الكلي للحركات والرصيد الختامي</td>
              <td class="mono font-bold" style="text-align:left; color:#10B981;">${formatCurrency(data.totalDebit)}</td>
              <td class="mono font-bold" style="text-align:left; color:var(--brand);">${formatCurrency(data.totalCredit)}</td>
              <td class="mono font-bold" style="text-align:left; color:${isCreditor ? '#EF4444' : '#10B981'}; font-size:14px;">
                ${data.closingBalance < 0 ? `(${formatCurrency(Math.abs(data.closingBalance))}) مدين` : formatCurrency(data.closingBalance)}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function setupGlobalFunctions() {
  window.selectSupplierForStmt = async (supId) => {
    selectedSupplierId = supId;
    const sel = document.getElementById("stmt-sup-select");
    if (sel) sel.value = supId;
    await window.reloadSupplierStatement();
  };

  window.onSupplierSelectChange = async (val) => {
    selectedSupplierId = val;
    await window.reloadSupplierStatement();
  };

  window.reloadSupplierStatement = async () => {
    const supId = document.getElementById("stmt-sup-select")?.value;
    if (!supId) {
      document.getElementById("supplier-statement-content").innerHTML = `
        <div class="card" style="padding:48px 24px; text-align:center; color:var(--text-2);">
          <div style="font-size:44px; margin-bottom:12px;">📊</div>
          <div style="font-size:16px; font-weight:700;">يرجى اختيار مورد لعرض كشف الحساب</div>
        </div>
      `;
      return;
    }

    const fromDate = document.getElementById("stmt-sup-from")?.value || "";
    const toDate = document.getElementById("stmt-sup-to")?.value || "";

    document.getElementById("supplier-statement-content").innerHTML = `
      <div style="text-align:center; padding:60px;"><span class="spin"></span> جاري جلب وتحليل حركات المورد...</div>
    `;

    const data = await buildSupplierStatement(supId, fromDate, toDate);
    currentStatementData = data;
    renderStatementUI(data);
  };

  window.filterSupplierStatementType = (type) => {
    if (!currentStatementData) return;
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
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; background:var(--bg-2); padding:12px; border-radius:8px; font-size:12.5px;">
        <div><span style="color:var(--text-3);">التاريخ:</span> <b class="mono">${t.date}</b></div>
        <div><span style="color:var(--text-3);">المورد:</span> <b>${currentSupplierDoc?.name || "—"}</b></div>
        <div><span style="color:var(--text-3);">المبلغ:</span> <b class="mono font-bold text-brand">${formatCurrency(t.debit || t.credit)}</b></div>
        <div><span style="color:var(--text-3);">البيان:</span> <span>${t.description}</span></div>
      </div>
    `;

    if (type === "purchase" && (raw.lines || raw.items)) {
      const items = raw.lines || raw.items || [];
      bodyHtml += `
        <div style="font-weight:700; font-size:13px; margin-bottom:8px;">📦 الأصناف المشتراة بالفاتورة:</div>
        <table class="data-dense" style="margin:0;">
          <thead>
            <tr>
              <th>الصنف</th>
              <th style="width:70px; text-align:center;">الكمية</th>
              <th style="width:90px; text-align:left;">سعر الوحدة</th>
              <th style="width:90px; text-align:left;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(it => `
              <tr>
                <td>${it.productName || it.name}</td>
                <td class="mono" style="text-align:center;">${it.qty || it.quantity || 1} ${it.unit || ""}</td>
                <td class="mono" style="text-align:left;">${formatCurrency(it.unitPrice || it.price || 0)}</td>
                <td class="mono font-bold" style="text-align:left;">${formatCurrency(it.total || ((it.qty||1)*(it.unitPrice||0)))}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } else if (type === "journal" && raw.lines) {
      bodyHtml += `
        <div style="font-weight:700; font-size:13px; margin-bottom:8px;">⚖️ بنود وسطور القيد المحاسبي:</div>
        <table class="data-dense" style="margin:0;">
          <thead>
            <tr>
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
                <td style="font-size:11px; color:var(--text-2);">${ln.note || ln.subDescription || "—"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
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

    const msg = `سعادة المورد المحترم / ${sup.name}\nتحية طيبة من ${co} 🌿\n\nنرفق لكم ملخص كشف الحساب:\n• الفترة: من ${currentStatementData.fromDate || "البداية"} إلى ${currentStatementData.toDate || todayStr()}\n• إجمالي المشتريات: ${formatCurrency(currentStatementData.totalCredit)}\n• إجمالي المسدد: ${formatCurrency(currentStatementData.totalDebit)}\n• الرصيد المستحق لكم: ${formatCurrency(currentStatementData.closingBalance)}\n\nشاكرين حسن تعاونكم معنا!`;

    window.open(`https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(msg)}`, "_blank");
  };

  window.printSupplierConfirmationLetter = () => {
    if (!currentStatementData || !currentSupplierDoc) { alert("يرجى اختيار المورد أولاً"); return; }
    const sup = currentSupplierDoc;
    const co = window.ERP_COMPANY || { name: "مؤسسة إدهام للمواد الغذائية", vatNumber: "310000000000003" };

    const win = window.open("", "_blank");
    win.document.write(`
      <html dir="rtl">
        <head>
          <title>خطاب مصادقة رصيد مورد - ${sup.name}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #111; line-height: 1.8; text-align: right; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .box { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 20px; margin: 20px 0; font-size: 14px; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 60px; text-align: center; }
            .sig-line { border-top: 1px dashed #475569; margin-top: 60px; padding-top: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin:0;">${co.name}</h2>
            <div style="font-size:12px; color:#666;">الرقم الضريبي: ${co.vatNumber || "—"}</div>
            <h3 style="margin-top:15px; color:#4338CA;">خطاب مصادقة ومطابقة رصيد مورد</h3>
          </div>

          <p><b>السادة المحترمون / شركة: ${sup.name}</b></p>
          <p>تحية طيبة وبعد،،،</p>
          <p>
            في إطار المراجعة الدورية للحسابات والمطابقة المحاسبية بين الطرفين، نرجو التكرم بالإحاطة بأن رصيد حسابكم المسجل في دفاترنا كما في تاريخ <b>${currentStatementData.toDate || todayStr()}</b> هو كالتالي:
          </p>

          <div class="box">
            <div>• الرصيد المستحق لكم في دفاترنا: <b>${formatCurrency(currentStatementData.closingBalance)}</b></div>
            <div>• إجمالي مسحوبات ومشتريات الفترة: <b>${formatCurrency(currentStatementData.totalCredit)}</b></div>
            <div>• إجمالي السدادات والحوالات المنفذة: <b>${formatCurrency(currentStatementData.totalDebit)}</b></div>
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
    window.print();
  };

  window.exportSupplierStatementExcel = () => {
    if (!currentStatementData) return;
    const rows = currentStatementData.transactions.map(t => ({
      "التاريخ": t.date,
      "نوع الحركة": t.typeLabel,
      "رقم المستند": t.docNumber,
      "البيان": t.description,
      "مدين (سداد)": t.debit,
      "دائن (مشتريات)": t.credit,
      "الرصيد التراكمي": t.balanceAfter
    }));
    exportToExcel(rows, `كشف_حساب_مورد_${currentSupplierDoc?.name || "المورد"}`);
  };
}
