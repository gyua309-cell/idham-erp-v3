// ============================================================
// IDHAM ERP — Profit & Loss Report (قائمة الأرباح والخسائر)
// ============================================================
import { COLS, getAll } from "../../utils/db.js";
import { getDocs } from "../../utils/db.js";
import { formatCurrency, startOfMonth, todayString } from "../../utils/formatters.js";
import { exportToExcel } from "../../utils/excel.js";

// Cache in-memory to make date switching instant
let _cachedData = {
  sales: null,
  returns: null,
  accounts: null,
  jes: null,
  loadedAt: null
};

let _lastCalculated = null;

export async function render(container, user) {
  const currentMonthStart = startOfMonth();
  const today = todayString();

  container.innerHTML = `
    <div class="filterbar" style="display:flex; flex-wrap:wrap; align-items:center; gap:10px; padding:12px 16px; background:var(--bg-1); border-bottom:1px solid var(--border);">
      <div style="display:flex; align-items:center; gap:8px;">
        <div class="date-range-group" style="display:flex; align-items:center; gap:6px;">
          <label style="font-size:12px; font-weight:700; color:var(--text-2);">من</label>
          <input type="date" id="pl-from" value="${currentMonthStart}" class="form-input" style="padding:5px 8px; font-size:13px; border-radius:6px;" />
        </div>
        <div class="date-range-group" style="display:flex; align-items:center; gap:6px;">
          <label style="font-size:12px; font-weight:700; color:var(--text-2);">إلى</label>
          <input type="date" id="pl-to" value="${today}" class="form-input" style="padding:5px 8px; font-size:13px; border-radius:6px;" />
        </div>
      </div>

      <!-- Quick Preset Buttons -->
      <div class="pl-presets" style="display:flex; gap:4px; align-items:center; flex-wrap:wrap;">
        <button type="button" class="btn btn-sm btn-ghost pl-preset-btn" data-preset="today" onclick="setPlPreset('today')" style="font-size:11px; padding:4px 8px;">اليوم</button>
        <button type="button" class="btn btn-sm btn-ghost pl-preset-btn active" data-preset="month" onclick="setPlPreset('month')" style="font-size:11px; padding:4px 8px; font-weight:700; background:var(--surface-2);">هذا الشهر</button>
        <button type="button" class="btn btn-sm btn-ghost pl-preset-btn" data-preset="last_month" onclick="setPlPreset('last_month')" style="font-size:11px; padding:4px 8px;">الشهر السابق</button>
        <button type="button" class="btn btn-sm btn-ghost pl-preset-btn" data-preset="quarter" onclick="setPlPreset('quarter')" style="font-size:11px; padding:4px 8px;">الربع الحالي</button>
        <button type="button" class="btn btn-sm btn-ghost pl-preset-btn" data-preset="year" onclick="setPlPreset('year')" style="font-size:11px; padding:4px 8px;">هذه السنة</button>
        <button type="button" class="btn btn-sm btn-ghost pl-preset-btn" data-preset="all" onclick="setPlPreset('all')" style="font-size:11px; padding:4px 8px;">كل الفترات</button>
      </div>

      <!-- Action buttons -->
      <div style="margin-right:auto; display:flex; gap:8px; align-items:center;">
        <span id="pl-loading-badge" style="display:none; font-size:11px; color:var(--text-muted);"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</span>
        <button type="button" class="btn btn-secondary btn-sm" onclick="exportProfitLossExcel()" style="font-size:12px; font-weight:600;"><i class="fas fa-file-excel"></i> تصدير Excel</button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="window.print()" style="font-size:12px; font-weight:600;"><i class="fas fa-print"></i> طباعة</button>
        <button type="button" class="btn btn-primary btn-sm" onclick="loadProfitLoss(true)" style="font-size:12px; font-weight:600;"><i class="fas fa-sync-alt"></i> تحديث</button>
      </div>
    </div>

    <div class="page-content" style="padding:24px 16px;">
      <div class="page-header" style="text-align:center; margin-bottom:24px;">
        <h1 class="page-title" style="font-size:24px; font-weight:800; margin-bottom:6px;">قائمة الأرباح والخسائر (Income Statement)</h1>
        <p class="page-subtitle" id="pl-period" style="font-size:13px; color:var(--text-2); font-weight:600;">الفترة من ${currentMonthStart} إلى ${today}</p>
      </div>

      <div style="max-width:850px; margin:0 auto;">
        <!-- Net Profit KPI Banner -->
        <div class="card mb-24" style="background:linear-gradient(135deg, var(--surface-1), var(--bg-1)); border:1.5px solid var(--border); border-radius:14px; box-shadow:var(--shadow-sm);">
          <div class="card-body" style="padding:28px; text-align:center;">
            <div class="section-label mb-8" style="font-size:13px; font-weight:700; color:var(--text-2); letter-spacing:0.5px;">صافي الربح / الخسارة التشغيلية</div>
            <div class="mono font-bold" style="font-size:38px; line-height:1.2;" id="pl-net-profit">—</div>
            <div style="display:flex; justify-content:center; gap:20px; margin-top:12px; font-size:12px; color:var(--text-2);">
              <span id="pl-profit-margin" style="font-weight:700;">هامش صافي الربح: 0%</span>
              <span>•</span>
              <span id="pl-gross-margin" style="font-weight:700;">هامش مجمل الربح: 0%</span>
            </div>
          </div>
        </div>

        <!-- Income Statement Financial Table -->
        <div class="card" style="border-radius:12px; border:1px solid var(--border); box-shadow:var(--shadow-sm); overflow:hidden;">
          <div class="card-header" style="padding:14px 18px; background:var(--surface-1); border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
            <h3 style="font-family:var(--font-heading); font-size:15px; font-weight:800; margin:0;">تفاصيل الحسابات الختامية</h3>
            <span id="pl-stats-badge" style="font-size:11px; color:var(--text-3); font-weight:600;"></span>
          </div>
          <div class="table-container" style="overflow-x:auto;">
            <table class="data-dense" style="width:100%; border-collapse:collapse;">
              <tbody>
                <!-- REVENUE SECTION -->
                <tr style="background:var(--bg-2); border-top:1px solid var(--border);">
                  <td colspan="2" class="font-heading font-bold text-indigo" style="padding:10px 16px; font-size:13px;">1. الإيرادات والمبيعات</td>
                </tr>
                <tr>
                  <td style="padding:10px 24px; font-size:13px; color:var(--text-1);">إجمالي إيراد المبيعات (بدون VAT)</td>
                  <td class="mono font-bold text-right" id="pl-gross-sales" style="padding:10px 16px; font-size:13px;">0.00 ر.س</td>
                </tr>
                <tr>
                  <td style="padding:10px 24px; font-size:13px;" class="text-bad">يخصم: مردودات المبيعات والخصومات</td>
                  <td class="mono text-bad text-right" id="pl-sales-returns" style="padding:10px 16px; font-size:13px;">0.00 ر.س</td>
                </tr>
                <tr style="border-top:1px solid var(--border); background:rgba(16, 185, 129, 0.04);">
                  <td class="font-bold" style="padding:10px 16px; font-size:13px; color:var(--text-1);">صافي المبيعات (Net Revenue)</td>
                  <td class="mono font-bold text-good text-right" id="pl-net-sales" style="padding:10px 16px; font-size:14px;">0.00 ر.س</td>
                </tr>

                <!-- COST OF GOODS SOLD -->
                <tr style="background:var(--bg-2); border-top:1px solid var(--border);">
                  <td colspan="2" class="font-heading font-bold text-warn" style="padding:10px 16px; font-size:13px;">2. تكلفة المبيعات (COGS)</td>
                </tr>
                <tr>
                  <td style="padding:10px 24px; font-size:13px; color:var(--text-1);">تكلفة البضاعة المباعة (المشتريات/المخزون)</td>
                  <td class="mono text-right" id="pl-cogs" style="padding:10px 16px; font-size:13px;">0.00 ر.س</td>
                </tr>
                <tr style="border-top:1px solid var(--border); background:rgba(99, 102, 241, 0.04);">
                  <td class="font-bold" style="padding:10px 16px; font-size:13px; color:var(--text-1);">مجمل الربح (Gross Profit)</td>
                  <td class="mono font-bold text-indigo text-right" id="pl-gross-profit" style="padding:10px 16px; font-size:14px;">0.00 ر.س</td>
                </tr>

                <!-- OPERATING EXPENSES -->
                <tr style="background:var(--bg-2); border-top:1px solid var(--border);">
                  <td colspan="2" class="font-heading font-bold text-bad" style="padding:10px 16px; font-size:13px;">3. المصروفات التشغيلية والعمومية</td>
                </tr>
                <tr>
                  <td style="padding:10px 24px; font-size:13px; color:var(--text-1);">مصروفات عُملات المناديب والتوزيع</td>
                  <td class="mono text-right" id="pl-exp-comm" style="padding:10px 16px; font-size:13px;">0.00 ر.س</td>
                </tr>
                <tr>
                  <td style="padding:10px 24px; font-size:13px; color:var(--text-1);">مصروفات رواتب وإيجارات ومصروفات عامة</td>
                  <td class="mono text-right" id="pl-exp-general" style="padding:10px 16px; font-size:13px;">0.00 ر.س</td>
                </tr>
                <tr style="border-top:1px solid var(--border); background:rgba(239, 68, 68, 0.04);">
                  <td class="font-bold" style="padding:10px 16px; font-size:13px; color:var(--text-1);">إجمالي المصروفات التشغيلية</td>
                  <td class="mono font-bold text-bad text-right" id="pl-total-expenses" style="padding:10px 16px; font-size:14px;">0.00 ر.س</td>
                </tr>

                <!-- NET PROFIT -->
                <tr style="background:var(--surface-1); border-top:2px solid var(--border);">
                  <td class="font-heading font-bold" style="padding:14px 16px; font-size:15px; color:var(--text-1);">صافي الربح / (الخسارة) قبل الضريبة</td>
                  <td class="mono font-bold text-right" style="padding:14px 16px; font-size:17px;" id="pl-final-net">0.00 ر.س</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Detailed Operating Expenses Drill-down -->
        <div class="card mt-24" id="pl-exp-breakdown-card" style="border-radius:12px; border:1px solid var(--border); box-shadow:var(--shadow-sm); overflow:hidden; margin-top:20px;">
          <div class="card-header" style="padding:12px 18px; background:var(--surface-1); border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
            <h4 style="font-size:14px; font-weight:700; margin:0; color:var(--text-1);"><i class="fas fa-list-ul"></i> تفصيل حسابات المصروفات الفعلية للفترة</h4>
            <span id="pl-exp-count" style="font-size:11px; color:var(--text-2); font-weight:600;">0 حساب</span>
          </div>
          <div class="table-container" style="max-height:350px; overflow-y:auto;">
            <table class="data-dense" style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:var(--bg-2); font-size:12px; color:var(--text-2);">
                  <th style="padding:8px 16px; text-align:right;">كود الحساب</th>
                  <th style="padding:8px 16px; text-align:right;">اسم الحساب</th>
                  <th style="padding:8px 16px; text-align:left;">المبلغ (ر.س)</th>
                </tr>
              </thead>
              <tbody id="pl-exp-tbody">
                <tr><td colspan="3" style="text-align:center; padding:16px; color:var(--text-muted);">لا توجد مصروفات مسجلة في هذه الفترة</td></tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `;

  // Attach event listeners directly to elements
  const fromEl = container.querySelector("#pl-from");
  const toEl   = container.querySelector("#pl-to");
  if (fromEl) fromEl.addEventListener("change", () => loadProfitLoss(false));
  if (toEl)   toEl.addEventListener("change", () => loadProfitLoss(false));

  // Expose global methods to window for inline HTML calls
  window.loadProfitLoss = loadProfitLoss;
  window.setPlPreset = setPlPreset;
  window.exportProfitLossExcel = exportProfitLossExcel;

  // Run initial load
  await loadProfitLoss(false);
}

export function setPlPreset(preset) {
  const fromEl = document.getElementById("pl-from");
  const toEl   = document.getElementById("pl-to");
  if (!fromEl || !toEl) return;

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  const fmt = (dt) => {
    const yr = dt.getFullYear();
    const mo = String(dt.getMonth() + 1).padStart(2, "0");
    const da = String(dt.getDate()).padStart(2, "0");
    return `${yr}-${mo}-${da}`;
  };

  let fromDate = "";
  let toDate = fmt(now);

  if (preset === "today") {
    fromDate = toDate;
  } else if (preset === "month") {
    fromDate = fmt(new Date(y, m, 1));
  } else if (preset === "last_month") {
    const lastMonthEnd = new Date(y, m, 0);
    const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);
    fromDate = fmt(lastMonthStart);
    toDate = fmt(lastMonthEnd);
  } else if (preset === "quarter") {
    const qStartMonth = Math.floor(m / 3) * 3;
    fromDate = fmt(new Date(y, qStartMonth, 1));
  } else if (preset === "year") {
    fromDate = fmt(new Date(y, 0, 1));
  } else if (preset === "all") {
    fromDate = "2026-01-01";
    toDate = fmt(now);
  }

  fromEl.value = fromDate;
  toEl.value = toDate;

  // Highlight active preset button
  document.querySelectorAll(".pl-preset-btn").forEach(btn => {
    if (btn.dataset.preset === preset) {
      btn.style.fontWeight = "700";
      btn.style.background = "var(--surface-2)";
    } else {
      btn.style.fontWeight = "normal";
      btn.style.background = "transparent";
    }
  });

  loadProfitLoss(false);
}

export async function loadProfitLoss(forceRefresh = false) {
  const badge = document.getElementById("pl-loading-badge");
  if (badge) badge.style.display = "inline";

  let fromVal = document.getElementById("pl-from")?.value;
  let toVal   = document.getElementById("pl-to")?.value;

  const norm = (str) => {
    if (!str) return "";
    str = String(str).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const m = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    const dt = new Date(str);
    return isNaN(dt.getTime()) ? str : dt.toISOString().split("T")[0];
  };

  let from = norm(fromVal) || "2026-01-01";
  let to   = norm(toVal)   || todayString();

  if (from && to && from > to) {
    const tmp = from;
    from = to;
    to = tmp;
    if (document.getElementById("pl-from")) document.getElementById("pl-from").value = from;
    if (document.getElementById("pl-to"))   document.getElementById("pl-to").value = to;
  }

  try {
    // 1. Load data from Firestore if not cached or forceRefresh requested
    if (forceRefresh || !_cachedData.sales || !_cachedData.returns || !_cachedData.jes || !_cachedData.accounts) {
      const [salesSnap, retSnap, jeSnap, accSnap] = await Promise.all([
        getDocs(COLS.salesInvoices()),
        getDocs(COLS.salesReturns()),
        getDocs(COLS.journalEntries()),
        getAll(COLS.chartOfAccounts())
      ]);

      _cachedData.sales = salesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      _cachedData.returns = retSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      _cachedData.jes = jeSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      _cachedData.accounts = Array.isArray(accSnap) ? accSnap : [];
      _cachedData.loadedAt = Date.now();
    }

    // 2. Filter sales invoices for period (Primary date: inv.date)
    const salesInvoices = _cachedData.sales.filter(inv => {
      if (inv.status === "cancelled" || inv.status === "void") return false;
      const rawDate = inv.date || (inv.createdAt?.toDate ? inv.createdAt.toDate().toISOString().split("T")[0] : "");
      const d = norm(rawDate);
      return d >= from && d <= to;
    });

    // 3. Filter sales returns for period (Primary date: r.date)
    const returns = _cachedData.returns.filter(r => {
      if (r.status === "cancelled" || r.status === "void") return false;
      const rawDate = r.date || (r.createdAt?.toDate ? r.createdAt.toDate().toISOString().split("T")[0] : "");
      const d = norm(rawDate);
      return d >= from && d <= to;
    });

    // 4. Filter journal entries for period (Primary date: entry.date)
    const periodJEs = _cachedData.jes.filter(entry => {
      if (entry.status === "cancelled" || entry.status === "void" || entry.status === "draft") return false;
      const rawDate = entry.date || (entry.createdAt?.toDate ? entry.createdAt.toDate().toISOString().split("T")[0] : "");
      const d = norm(rawDate);
      return d >= from && d <= to;
    });

    // 5. Aggregate debit & credit by account code in a fast single pass
    const jeDebitByCode = {};
    const jeCreditByCode = {};
    const jeDebitById = {};
    const jeCreditById = {};
    let cogsFromJE = 0;

    for (const entry of periodJEs) {
      for (const line of (entry.lines || [])) {
        const code = line.accountCode || "";
        const id   = line.accountId || "";
        const dr   = parseFloat(line.debit) || 0;
        const cr   = parseFloat(line.credit) || 0;

        if (code) {
          jeDebitByCode[code]  = (jeDebitByCode[code] || 0) + dr;
          jeCreditByCode[code] = (jeCreditByCode[code] || 0) + cr;
        }
        if (id) {
          jeDebitById[id]  = (jeDebitById[id] || 0) + dr;
          jeCreditById[id] = (jeCreditById[id] || 0) + cr;
        }

        // COGS accounts (5-1 except 5-1-1 purchases, plus 4-2-4 or earned discount)
        const isCOGSLine = (code.startsWith("5-1-") && !code.startsWith("5-1-1")) || code === "4-2-4" || (line.accountName || "").includes("خصم مكتسب");
        if (isCOGSLine) {
          cogsFromJE += (dr - cr);
        }
      }
    }

    // 6. Aggregate operating and general expenses
    let commExpense = 0;
    let generalExp  = 0;
    const detailedExpenses = [];

    for (const acc of _cachedData.accounts) {
      if (acc.type !== "expense") continue;
      const isCOGSOrPurchase = (acc.code?.startsWith("5-1-") || acc.code === "4-2-4") || acc.name?.includes("خصم مكتسب");
      if (isCOGSOrPurchase) continue;

      const dr = (acc.code && jeDebitByCode[acc.code]) || (acc.id && jeDebitById[acc.id]) || 0;
      const cr = (acc.code && jeCreditByCode[acc.code]) || (acc.id && jeCreditById[acc.id]) || 0;
      const balance = dr - cr;

      if (balance <= 0.005) continue;

      detailedExpenses.push({
        code: acc.code || "—",
        name: acc.name || "مصروف",
        amount: balance
      });

      if (acc.name.includes("عمولة") || acc.name.includes("توزيع") || acc.name.includes("مندوب") || acc.name.includes("مناديب")) {
        commExpense += balance;
      } else {
        generalExp += balance;
      }
    }

    detailedExpenses.sort((a, b) => b.amount - a.amount);

    // 7. Calculations
    const grossSales   = salesInvoices.reduce((s, i) => s + (i.subtotal != null ? i.subtotal : (i.total || 0)), 0);
    const returnAmount = returns.reduce((s, r) => s + (r.subtotal != null ? r.subtotal : (r.total || 0)), 0);
    const netSales     = grossSales - returnAmount;
    const cogs         = cogsFromJE;
    const grossProfit  = netSales - cogs;
    const totalExp     = commExpense + generalExp;
    const netProfit    = grossProfit - totalExp;
    const netMargin    = netSales > 0 ? (netProfit / netSales) * 100 : 0;
    const grossMargin  = netSales > 0 ? (grossProfit / netSales) * 100 : 0;

    _lastCalculated = {
      from, to,
      grossSales, returnAmount, netSales,
      cogs, grossProfit,
      commExpense, generalExp, totalExp,
      netProfit, margin: netMargin, grossMargin,
      detailedExpenses,
      salesCount: salesInvoices.length,
      returnsCount: returns.length
    };

    // 8. Update UI Elements
    const periodEl = document.getElementById("pl-period");
    if (periodEl) {
      periodEl.textContent = `الفترة من ${from} إلى ${to}`;
    }

    const statsBadge = document.getElementById("pl-stats-badge");
    if (statsBadge) {
      statsBadge.textContent = `${salesInvoices.length} فاتورة مبيعات | ${returns.length} مردود مبيعات`;
    }

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setTxt("pl-gross-sales", formatCurrency(grossSales));
    setTxt("pl-sales-returns", `- ${formatCurrency(returnAmount)}`);
    setTxt("pl-net-sales", formatCurrency(netSales));
    setTxt("pl-cogs", formatCurrency(cogs));
    setTxt("pl-gross-profit", formatCurrency(grossProfit));
    setTxt("pl-exp-comm", formatCurrency(commExpense));
    setTxt("pl-exp-general", formatCurrency(generalExp));
    setTxt("pl-total-expenses", formatCurrency(totalExp));
    setTxt("pl-final-net", formatCurrency(netProfit));

    const finalNetEl = document.getElementById("pl-final-net");
    if (finalNetEl) {
      finalNetEl.className = `mono font-bold text-right ${netProfit >= 0 ? "text-good" : "text-bad"}`;
    }

    const netBanner = document.getElementById("pl-net-profit");
    if (netBanner) {
      netBanner.textContent = formatCurrency(netProfit);
      netBanner.className   = `mono font-bold ${netProfit >= 0 ? "text-good" : "text-bad"}`;
    }

    setTxt("pl-profit-margin", `هامش صافي الربح: ${netMargin.toFixed(1)}%`);
    setTxt("pl-gross-margin", `هامش مجمل الربح: ${grossMargin.toFixed(1)}%`);

    // Detailed expenses tbody
    const tbody = document.getElementById("pl-exp-tbody");
    const countBadge = document.getElementById("pl-exp-count");
    if (countBadge) countBadge.textContent = `${detailedExpenses.length} حساب`;

    if (tbody) {
      if (detailedExpenses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:16px; color:var(--text-muted);">لا توجد مصروفات مسجلة في هذه الفترة</td></tr>`;
      } else {
        tbody.innerHTML = detailedExpenses.map(item => `
          <tr style="border-bottom:1px solid var(--border);">
            <td class="mono" style="padding:8px 16px; font-size:12px; color:var(--text-2);">${item.code}</td>
            <td style="padding:8px 16px; font-size:13px; font-weight:600; color:var(--text-1);">${item.name}</td>
            <td class="mono text-left font-bold" style="padding:8px 16px; font-size:13px; color:var(--text-bad);">${formatCurrency(item.amount)}</td>
          </tr>
        `).join("");
      }
    }

  } catch (err) {
    console.error("[Profit-Loss Error]", err);
    window.showToast?.("خطأ في احتساب الأرباح والخسائر: " + err.message, "error");
  } finally {
    if (badge) badge.style.display = "none";
  }
}

export async function exportProfitLossExcel() {
  if (!_lastCalculated) {
    window.showToast?.("يرجى تحميل التقرير أولاً", "warn");
    return;
  }
  const { from, to, grossSales, returnAmount, netSales, cogs, grossProfit, commExpense, generalExp, totalExp, netProfit, margin, detailedExpenses } = _lastCalculated;

  const rows = [
    ["1. الإيرادات والمبيعات", ""],
    ["إجمالي إيراد المبيعات (بدون VAT)", grossSales],
    ["يخصم: مردودات المبيعات والخصومات", -returnAmount],
    ["صافي المبيعات (Net Revenue)", netSales],
    ["", ""],
    ["2. تكلفة المبيعات (COGS)", ""],
    ["تكلفة البضاعة المباعة (المشتريات/المخزون)", cogs],
    ["مجمل الربح (Gross Profit)", grossProfit],
    ["", ""],
    ["3. المصروفات التشغيلية والعمومية", ""],
    ["مصروفات عُملات المناديب والتوزيع", commExpense],
    ["مصروفات رواتب وإيجارات ومصروفات عامة", generalExp],
    ["إجمالي المصروفات التشغيلية", totalExp],
    ["", ""],
    ["4. النتيجة الختامية", ""],
    ["صافي الربح / (الخسارة) قبل الضريبة", netProfit],
    ["هامش صافي الربح (%)", `${margin.toFixed(2)}%`],
    ["", ""],
    ["=== تفصيل حسابات المصروفات ===", ""],
    ...detailedExpenses.map(e => [`${e.code} - ${e.name}`, e.amount])
  ];

  await exportToExcel({
    title: `قائمة_الأرباح_والخسائر_${from}_إلى_${to}`,
    headers: ["البند المحاسبي", "المبلغ (ر.س)"],
    rows,
    colWidths: [45, 20]
  });
}
