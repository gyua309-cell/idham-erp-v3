const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../js/modules/bank-accounts.js");
let code = fs.readFileSync(filePath, "utf8");

const isCRLF = code.includes("\r\n");
code = code.replace(/\r\n/g, "\n");

console.log("Patching bank-accounts.js with true running balance and chronological modal sorting...");

// 1. Update loadBankTxns to compute running balances across all transactions
const oldLoadBankTxns = `async function loadBankTxns() {
  const tbody = document.getElementById("ba-tbody");
  if (!tbody) return;

  try {
    const q = query(COLS.bankTransactions(), orderBy("createdAt", "desc"), limit(200));
    const snap = await getDocs(q);
    _allBankTxns = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    applyBankTxnFilters();
  } catch (err) {
    tbody.innerHTML = \`<tr><td colspan="7"><div class="alert bad" style="margin:8px;">\${err.message}</div></td></tr>\`;
  }
}`;

const newLoadBankTxns = `async function loadBankTxns() {
  const tbody = document.getElementById("ba-tbody");
  if (!tbody) return;

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

    // Compute dynamic running balances per bank account
    // Group txns by bankAccountId
    const txnsByBank = {};
    rawTxns.forEach(t => {
      const bId = t.bankAccountId || "unknown";
      if (!txnsByBank[bId]) txnsByBank[bId] = [];
      txnsByBank[bId].push(t);
    });

    // For each bank, sort chronologically ascending to compute true running balance
    Object.keys(txnsByBank).forEach(bId => {
      const list = txnsByBank[bId];
      list.sort((a, b) => {
        const c = (a.isoDate || "").localeCompare(b.isoDate || "");
        if (c !== 0) return c;
        return (a.ts || 0) - (b.ts || 0);
      });

      const bank = (bankAccounts || []).find(b => b.id === bId);
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

    _allBankTxns = rawTxns;
    applyBankTxnFilters();
  } catch (err) {
    tbody.innerHTML = \`<tr><td colspan="7"><div class="alert bad" style="margin:8px;">\${err.message}</div></td></tr>\`;
  }
}`;

if (code.includes(oldLoadBankTxns)) {
  code = code.replace(oldLoadBankTxns, newLoadBankTxns);
  console.log("✓ Patched loadBankTxns with dynamic running balance calculator");
} else {
  console.warn("! Warning: loadBankTxns match not found");
}

// 2. In applyBankTxnFilters, use computedBalanceAfter instead of static balanceAfter
const oldRowBal = `<td class="mono font-bold" style="font-size:12.5px;"><span dir="ltr" style="display:inline-block;direction:ltr;background:var(--bg-2);padding:2px 8px;border-radius:6px;">\${formatCurrency(t.balanceAfter || 0)}</span></td>`;
const newRowBal = `<td class="mono font-bold" style="font-size:12.5px;"><span dir="ltr" style="display:inline-block;direction:ltr;background:var(--bg-2);padding:2px 8px;border-radius:6px;">\${formatCurrency(t.computedBalanceAfter !== undefined ? t.computedBalanceAfter : (t.balanceAfter || 0))}</span></td>`;

if (code.includes(oldRowBal)) {
  code = code.replace(oldRowBal, newRowBal);
  console.log("✓ Patched main table to render computedBalanceAfter");
}

// 3. Rewrite openBankAccountStatementModal to support chronological sorting and date filtering
const oldModalStart = `window.openBankAccountStatementModal = async (bankId) => {`;
const oldModalEnd = `window.printBankStatementHTML = () => {`;

const newModalCode = `window.openBankAccountStatementModal = async (bankId) => {
  const bank = bankAccounts.find(b => b.id === bankId);
  if (!bank) return;

  _activeBankStatement = bank;
  const titleEl = document.getElementById("ba-stmt-modal-title");
  const bodyEl = document.getElementById("ba-stmt-body");

  // Read current date filters from the main page
  const initialFrom = document.getElementById("filter-ba-from")?.value || "";
  const initialTo   = document.getElementById("filter-ba-to")?.value || "";

  if (titleEl) titleEl.textContent = \`📄 كشف حساب بنكي تفصيلي معتمد — \${bank.name}\`;
  if (bodyEl) bodyEl.innerHTML = \`<div style="text-align:center;padding:40px;"><span class="spin"></span> جاري تجميع وتحليل كشف الحساب البنكي لحساب \${bank.name}…</div>\`;

  openModal("ba-statement-modal");

  try {
    const qTxns = query(collection(db, \`companies/\${COMPANY_ID}/bankTransactions\`), where("bankAccountId", "==", bankId));
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
        ref: data.refNumber || \`BTX-\${d.id.substring(0,6).toUpperCase()}\`
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
    bodyEl.innerHTML = \`<div class="alert bad">خطأ في جلب كشف الحساب التفصيلي: \${err.message}</div>\`;
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

  bodyEl.innerHTML = \`
    <!-- Bank Info Banner -->
    <div style="background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); border-radius:16px; padding:18px 22px; color:#fff; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; box-shadow:0 8px 20px rgba(15,23,42,0.3);">
      <div>
        <div style="font-size:11px; color:#93c5fd; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">كشف الحساب البنكي التفصيلي المعتمد</div>
        <h2 style="font-size:22px; font-weight:900; margin:3px 0; color:#ffffff;">\${bank.name}</h2>
        <div style="font-size:12px; color:#cbd5e1;">رقم الآيبان IBAN: <span style="font-family:monospace;font-weight:800;color:#67e8f9;">\${bank.iban || "—"}</span> \${bank.accountNumber ? \`| رقم الحساب: <span style="font-family:monospace;color:#ffffff;">\${bank.accountNumber}</span>\` : ''}</div>
      </div>
      <div style="text-align:left; background:rgba(255,255,255,0.12); padding:10px 18px; border-radius:14px; border:1px solid rgba(255,255,255,0.25);">
        <div style="font-size:11px; color:#93c5fd; font-weight:700;">الرصيد الفعلي الحالي في البنك</div>
        <div class="mono" style="font-size:22px; font-weight:900; direction:ltr; color:#ffffff;">\${formatCurrency(bank.balance || 0)}</div>
      </div>
    </div>

    <!-- Interactive Period Filter Bar Inside Modal -->
    <div style="display:flex;gap:12px;align-items:center;background:#fff;padding:12px 18px;border-radius:14px;border:1px solid #e2e8f0;margin-bottom:16px;flex-wrap:wrap;box-shadow:0 2px 6px rgba(0,0,0,0.02);">
      <span style="font-size:12px;font-weight:800;color:#0f172a;">📅 تصفية فترة الكشف:</span>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="font-size:11.5px;color:#64748b;">من:</span>
        <input type="date" id="modal-stmt-from" class="input" value="\${from}" style="width:135px;font-size:12px;padding:4px 8px;" onchange="window.onModalDateFilterChange()" />
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="font-size:11.5px;color:#64748b;">إلى:</span>
        <input type="date" id="modal-stmt-to" class="input" value="\${to}" style="width:135px;font-size:12px;padding:4px 8px;" onchange="window.onModalDateFilterChange()" />
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
        <div class="mono" style="font-size:16px; font-weight:900; margin-top:3px; color:#0f172a;">\${formatCurrency(balBeforePeriod)}</div>
      </div>
      <div style="background:#eff6ff; border:1.5px solid #bfdbfe; border-radius:12px; padding:12px; text-align:center;">
        <div style="font-size:11px; color:#1d4ed8; font-weight:800;">إجمالي الوارد للفترة (+)</div>
        <div class="mono text-ok" style="font-size:16px; font-weight:900; margin-top:3px;">+\${formatCurrency(periodIn)}</div>
      </div>
      <div style="background:#fef2f2; border:1.5px solid #fecaca; border-radius:12px; padding:12px; text-align:center;">
        <div style="font-size:11px; color:#dc2626; font-weight:800;">إجمالي المنصرف للفترة (-)</div>
        <div class="mono text-bad" style="font-size:16px; font-weight:900; margin-top:3px;">-\${formatCurrency(periodOut)}</div>
      </div>
      <div style="background:#ecfdf5; border:1.5px solid #a7f3d0; border-radius:12px; padding:12px; text-align:center;">
        <div style="font-size:11px; color:#065f46; font-weight:800;">الرصيد الختامي في نهاية الفترة</div>
        <div class="mono" style="font-size:16px; font-weight:900; margin-top:3px; color:#047857;">\${formatCurrency(periodEndBal)}</div>
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
          \${from ? \`
            <tr style="background:#f8fafc; font-weight:800; border-bottom:2px solid #cbd5e1;">
              <td style="text-align:center;">—</td>
              <td class="mono font-bold" style="text-align:center;">\${formatDate(from)}</td>
              <td colspan="3"><span style="color:#475569;">💼 الرصيد الافتتاحي السابق لبداية الفترة</span></td>
              <td style="text-align:left;">—</td>
              <td style="text-align:left;">—</td>
              <td class="mono font-bold" style="text-align:left;"><span dir="ltr" style="display:inline-block;direction:ltr;background:#e2e8f0;padding:2px 8px;border-radius:6px;color:#0f172a;">\${formatCurrency(balBeforePeriod)}</span></td>
            </tr>
          \` : ''}
          \${periodItems.length ? periodItems.map((item, idx) => \`
            <tr style="border-bottom:1px solid #f1f5f9; transition:background 0.15s ease;">
              <td style="text-align:center;color:var(--text-3);font-weight:700;">\${idx + 1}</td>
              <td class="mono font-bold" style="font-size:12px; padding:10px 12px; text-align:center;">\${item.date}</td>
              <td style="padding:10px 12px;">
                <span style="display:inline-flex; align-items:center; gap:6px; background:\${item.inflow ? '#eff6ff' : '#fef2f2'}; color:\${item.inflow ? '#1d4ed8' : '#991b1b'}; padding:4px 10px; border-radius:8px; font-weight:800; font-size:11.5px; border:1px solid \${item.inflow ? '#bfdbfe' : '#fca5a5'};">
                  <span>\${item.icon}</span> <span>\${item.badgeText}</span>
                </span>
              </td>
              <td class="mono" style="font-size:11px; padding:10px 12px;"><span dir="ltr" style="background:#f1f5f9; padding:2px 8px; border-radius:6px; font-weight:800; color:#334155;">\${item.ref}</span></td>
              <td style="font-size:12px; color:#1e293b; font-weight:600; padding:10px 12px;">\${item.notes}</td>
              <td class="mono text-ok font-bold" style="text-align:left; font-size:13px; padding:10px 12px;">\${item.inflow ? '+' + formatCurrency(item.inflow) : '—'}</td>
              <td class="mono text-bad font-bold" style="text-align:left; font-size:13px; padding:10px 12px;">\${item.outflow ? '-' + formatCurrency(item.outflow) : '—'}</td>
              <td class="mono font-bold" style="text-align:left; font-size:13px; padding:10px 12px;"><span dir="ltr" style="display:inline-block; direction:ltr; background:#f8fafc; padding:3px 10px; border-radius:8px; border:1px solid #cbd5e1; color:#0f172a;">\${formatCurrency(item.computedBalanceAfter)}</span></td>
            </tr>
          \`).join("") : \`<tr><td colspan="8" style="text-align:center; padding:36px; color:#64748b; font-weight:700;">لا توجد حركات بنكية مقيدة في الفترة المحددة</td></tr>\`}
        </tbody>
      </table>
    </div>
  \`;
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
`;

const modalIdx = code.indexOf(oldModalStart);
const modalEndIdx = code.indexOf(oldModalEnd);
if (modalIdx !== -1 && modalEndIdx !== -1) {
  code = code.substring(0, modalIdx) + newModalCode + "\n" + code.substring(modalEndIdx);
  console.log("✓ Patched openBankAccountStatementModal with chronological sorting, date filters & true balance");
} else {
  console.warn("! Warning: modal slice not found", modalIdx, modalEndIdx);
}

// 4. Update exportBankStatementExcel to write computedBalanceAfter
code = code.replace(
  `Number(t.balanceAfter || 0)`,
  `Number(t.computedBalanceAfter !== undefined ? t.computedBalanceAfter : (t.balanceAfter || 0))`
);

if (isCRLF) {
  code = code.replace(/\n/g, "\r\n");
}

fs.writeFileSync(filePath, code, "utf8");
console.log("bank-accounts.js successfully updated!");
