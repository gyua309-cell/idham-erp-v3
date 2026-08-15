// ============================================================
// IDHAM ERP — Profit & Loss Report (قائمة الأرباح والخسائر)
// ============================================================
import { COLS, getAll } from "../../utils/db.js";
import { query, orderBy, limit, getDocs } from "../../utils/db.js";
import { formatCurrency, startOfMonth, todayString } from "../../utils/formatters.js";

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar">
      <div class="date-range-group"><label>من</label>
        <input type="date" id="pl-from" value="${startOfMonth()}" onchange="loadProfitLoss()" /></div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="pl-to" value="${todayString()}" onchange="loadProfitLoss()" /></div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="window.print()">🖨️ طباعة التقرير</button>
        <button class="btn btn-secondary btn-sm" onclick="loadProfitLoss()">🔄 تحديث</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">قائمة الأرباح والخسائر (Income Statement)</h1>
        <p class="page-subtitle" id="pl-period"></p>
      </div>

      <div style="max-width:800px;margin:0 auto;">
        <!-- Net Profit KPI Banner -->
        <div class="card mb-24" style="background:linear-gradient(135deg, var(--surface-1), var(--bg-1));">
          <div class="card-body" style="padding:30px;text-align:center;">
            <div class="section-label mb-8" style="font-size:13px;">صافي الربح / الخسارة</div>
            <div class="mono font-bold" style="font-size:36px;line-height:1.2;" id="pl-net-profit">—</div>
            <div class="text-2 mt-8" style="font-size:12px;" id="pl-profit-margin">هامش الصافي: 0%</div>
          </div>
        </div>

        <!-- Income Statement Financial Table -->
        <div class="card">
          <div class="card-header"><h3 style="font-family:var(--font-heading);">تفاصيل الحسابات الختامية</h3></div>
          <div class="table-container">
            <table class="data-dense">
              <tbody>
                <!-- REVENUE SECTION -->
                <tr style="background:var(--bg-2);"><td colspan="2" class="font-heading font-bold text-indigo">1. الإيرادات والمبيعات</td></tr>
                <tr><td style="padding-right:24px;">إجمالي إيراد المبيعات (بدون VAT)</td><td class="mono font-bold text-right" id="pl-gross-sales">0.00 ر.س</td></tr>
                <tr><td style="padding-right:24px;" class="text-bad">يخصم: مردودات المبيعات والخصومات</td><td class="mono text-bad text-right" id="pl-sales-returns">0.00 ر.س</td></tr>
                <tr style="border-top:1px solid var(--border);"><td class="font-bold">صافي المبيعات (Net Revenue)</td><td class="mono font-bold text-good text-right" id="pl-net-sales">0.00 ر.س</td></tr>

                <!-- COST OF GOODS SOLD -->
                <tr style="background:var(--bg-2);"><td colspan="2" class="font-heading font-bold text-warn">2. تكلفة المبيعات (COGS)</td></tr>
                <tr><td style="padding-right:24px;">تكلفة البضاعة المباعة (المشتريات)</td><td class="mono text-right" id="pl-cogs">0.00 ر.س</td></tr>
                <tr style="border-top:1px solid var(--border);"><td class="font-bold">مجمل الربح (Gross Profit)</td><td class="mono font-bold text-indigo text-right" id="pl-gross-profit">0.00 ر.س</td></tr>

                <!-- OPERATING EXPENSES -->
                <tr style="background:var(--bg-2);"><td colspan="2" class="font-heading font-bold text-bad">3. المصروفات التشغيلية والعمومية</td></tr>
                <tr><td style="padding-right:24px;">مصروفات عُملات المناديب والتوزيع</td><td class="mono text-right" id="pl-exp-comm">0.00 ر.س</td></tr>
                <tr><td style="padding-right:24px;">مصروفات رواتب وإيجارات ومصروفات عامة</td><td class="mono text-right" id="pl-exp-general">0.00 ر.س</td></tr>
                <tr style="border-top:1px solid var(--border);"><td class="font-bold">إجمالي المصروفات التشغيلية</td><td class="mono font-bold text-bad text-right" id="pl-total-expenses">0.00 ر.س</td></tr>

                <!-- NET PROFIT -->
                <tr style="background:var(--surface-1);border-top:2px solid var(--border);"><td class="font-heading font-bold style=font-size:16px;">صافي الربح قبل الضريبة</td><td class="mono font-bold text-right" style="font-size:18px;" id="pl-final-net">0.00 ر.س</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;

  await loadProfitLoss();
}

async function loadProfitLoss() {
  let fromVal = document.getElementById("pl-from")?.value;
  let toVal   = document.getElementById("pl-to")?.value;

  const norm = (str) => {
    if (!str) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const m = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    const d = new Date(str);
    return isNaN(d.getTime()) ? str : d.toISOString().split("T")[0];
  };

  let from = norm(fromVal);
  let to = norm(toVal);

  if (from && to && from > to) {
    const tmp = from;
    from = to;
    to = tmp;
  }

  document.getElementById("pl-period").textContent = `الفترة من ${from} إلى ${to}`;

  try {
    // 1. Sales Invoices
    const salesQ = query(COLS.salesInvoices(), limit(2000));
    const salesSnap = await getDocs(salesQ);
    const salesInvoices = salesSnap.docs.map(d => d.data()).filter(inv => {
      const d = inv.createdAt?.toDate ? inv.createdAt.toDate().toISOString().split("T")[0] : inv.date || "";
      return d >= from && d <= to && inv.status !== "cancelled";
    });

    // 2. Sales Returns
    const retQ = query(COLS.salesReturns(), limit(500));
    const retSnap = await getDocs(retQ);
    const returns = retSnap.docs.map(d => d.data()).filter(r => {
      const d = r.createdAt?.toDate ? r.createdAt.toDate().toISOString().split("T")[0] : r.date || "";
      return d >= from && d <= to;
    });


    // 3. Real Ledger Expenses Calculation — من قيود اليومية الفعلية

    const accs = await getAll(COLS.chartOfAccounts());
    const jeQ = query(COLS.journalEntries());
    const jeSnap = await getDocs(jeQ);
    const jes = jeSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    let commExpense = 0;
    let generalExp = 0;
    let cogsFromJE = 0;   // تكلفة البضاعة المباعة الفعلية من قيود salesCOGS

    // 4a. تكلفة البضاعة المباعة من قيود اليومية
    jes.forEach(entry => {
      const entryDate = entry.date || "";
      if (entryDate >= from && entryDate <= to) {
        (entry.lines || []).forEach(line => {
          // الجانب المدين في قيد تكلفة المبيعات (حساب 5-1-8 أو 5-1-7)
          const code = line.accountCode || "";
          if (code === "5-1-8" || code === "5-1-7" || code.startsWith("5-1-8") || code.startsWith("5-1-7")) {
            cogsFromJE += (line.debit || 0) - (line.credit || 0); // debit normal
          }
        });
      }
    });

    // 4b. المصروفات التشغيلية الأخرى (تستثني COGS والمشتريات)
    accs.forEach(acc => {
      if (acc.type !== 'expense') return;
      // استثناء حسابات تكلفة المبيعات (5-1-x) — هي COGS وليست مصروفات تشغيل
      const isCOGSOrPurchase = acc.code?.startsWith("5-1");
      if (isCOGSOrPurchase) return;

      let balance = 0;
      jes.forEach(entry => {
        const entryDate = entry.date || "";
        if (entryDate >= from && entryDate <= to) {
          (entry.lines || []).forEach(line => {
            if (line.accountId === acc.id || line.accountCode === acc.code) {
              balance += (line.debit || 0) - (line.credit || 0);
            }
          });
        }
      });

      if (balance <= 0) return;
      if (acc.name.includes("عمولة") || acc.name.includes("توزيع") || acc.name.includes("مندوب") || acc.name.includes("مناديب")) {
        commExpense += balance;
      } else {
        generalExp += balance;
      }
    });

    // Calculations — باستخدام COGS الفعلي من القيود
    const grossSales   = salesInvoices.reduce((s, i) => s + (i.subtotal || 0), 0);
    const returnAmount = returns.reduce((s, r) => s + (r.subtotal || 0), 0);
    const netSales     = grossSales - returnAmount;

    const cogs         = cogsFromJE;   // ← COGS الحقيقي من قيود اليومية
    const grossProfit  = netSales - cogs;
    const totalExp     = commExpense + generalExp;

    const netProfit    = grossProfit - totalExp;
    const margin       = netSales > 0 ? (netProfit / netSales) * 100 : 0;

    // UI Updates
    document.getElementById("pl-gross-sales").textContent   = formatCurrency(grossSales);
    document.getElementById("pl-sales-returns").textContent  = `- ${formatCurrency(returnAmount)}`;
    document.getElementById("pl-net-sales").textContent      = formatCurrency(netSales);
    document.getElementById("pl-cogs").textContent           = formatCurrency(cogs);
    document.getElementById("pl-gross-profit").textContent   = formatCurrency(grossProfit);
    document.getElementById("pl-exp-comm").textContent       = formatCurrency(commExpense);
    document.getElementById("pl-exp-general").textContent    = formatCurrency(generalExp);
    document.getElementById("pl-total-expenses").textContent = formatCurrency(totalExp);
    document.getElementById("pl-final-net").textContent      = formatCurrency(netProfit);

    const netBanner = document.getElementById("pl-net-profit");
    netBanner.textContent = formatCurrency(netProfit);
    netBanner.className   = `mono font-bold ${netProfit >= 0 ? "text-good" : "text-bad"}`;

    document.getElementById("pl-profit-margin").textContent = `هامش صافي الربح: ${margin.toFixed(1)}%`;

  } catch (err) {
    console.error(err);
  }
}
