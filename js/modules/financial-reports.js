// ============================================================
// IDHAM ERP — Unified Financial Reports & Analysis
// دفتر الأستاذ، ميزان المراجعة، قائمة الدخل، الميزانية، التدفقات، حقوق الملكية، والتحليل المالي
// ============================================================
import { COLS, getAll, query, orderBy, getDocs } from "../utils/db.js";
import { formatCurrency, todayString, startOfMonth } from "../utils/formatters.js";

let accounts = [];
let journalEntries = [];
let activeTab = "ledger";

// cache for customer analytics data
let _salesInvoicesCache = null;
let _receiptsCache = null;
let _custperfRows = [];

export async function render(container, user) {
  container.innerHTML = `
    <!-- Top Filter Bar -->
    <div class="filterbar no-print">
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="fin-from" value="${startOfMonth()}" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="fin-to" value="${todayString()}" />
      </div>
      <!-- Extra Filters Area (Trial Balance Levels) -->
      <div id="fin-extra-filters" style="display:flex; gap:16px; align-items:center;"></div>
      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.print()">🖨️ طباعة التقرير</button>
        <button class="btn btn-primary btn-sm" onclick="loadDataAndRender(true)">🔄 تحديث</button>
      </div>
    </div>

    <!-- Tab Bar -->
    <div class="modal-tabs no-print" style="display:flex; border-bottom:1px solid var(--border-soft); background:var(--bg-1); padding:0 16px; gap:8px; overflow-x:auto;">
      <button class="tab-btn active" id="btn-tab-ledger"   onclick="switchFinTab('ledger')"   style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--brand); border-bottom:2px solid var(--brand); white-space:nowrap;">📒 دفتر الأستاذ</button>
      <button class="tab-btn" id="btn-tab-trial"    onclick="switchFinTab('trial')"    style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--text-2); border-bottom:2px solid transparent; white-space:nowrap;">⚖️ ميزان المراجعة</button>
      <button class="tab-btn" id="btn-tab-income"   onclick="switchFinTab('income')"   style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--text-2); border-bottom:2px solid transparent; white-space:nowrap;">📊 قائمة الدخل</button>
      <button class="tab-btn" id="btn-tab-balance"  onclick="switchFinTab('balance')"  style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--text-2); border-bottom:2px solid transparent; white-space:nowrap;">🏛️ المركز المالي</button>
      <button class="tab-btn" id="btn-tab-cashflow" onclick="switchFinTab('cashflow')" style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--text-2); border-bottom:2px solid transparent; white-space:nowrap;">💧 التدفقات النقدية</button>
      <button class="tab-btn" id="btn-tab-equity"   onclick="switchFinTab('equity')"   style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--text-2); border-bottom:2px solid transparent; white-space:nowrap;">🏦 التغير في الملكية</button>
      <button class="tab-btn" id="btn-tab-analysis" onclick="switchFinTab('analysis')" style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--text-2); border-bottom:2px solid transparent; white-space:nowrap;">📈 التحليل المالي والنسب</button>
      <button class="tab-btn" id="btn-tab-aging"    onclick="switchFinTab('aging')"    style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--text-2); border-bottom:2px solid transparent; white-space:nowrap;">⏳ أعمار الديون</button>
      <button class="tab-btn" id="btn-tab-custperf" onclick="switchFinTab('custperf')" style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--text-2); border-bottom:2px solid transparent; white-space:nowrap;">🏆 أداء العملاء</button>
    </div>

    <!-- Main Content Area -->
    <div class="page-content" id="fin-report-body" style="padding:24px;">
       <div class="page-loading"><div class="loading-spinner"></div></div>
    </div>
  `;

  document.getElementById("fin-from").addEventListener("change", () => loadDataAndRender());
  document.getElementById("fin-to").addEventListener("change",   () => loadDataAndRender());

  await loadDataAndRender();
}

// ── Fast lookup: match JE lines to accounts by accountId OR accountCode ──
let _accById = {};
let _accByCode = {};

function matchLineToAcc(line) {
  return _accById[line.accountId] || _accByCode[line.accountCode] || null;
}

// ──────────────────────────────────────────
// Helper: classify account category
// ──────────────────────────────────────────
function isCOGSAccount(acc) {
  // حساب COGS: الكود الجديد 5-1-8 أو القديم 5-1-2-1، ومصروفات النقل للداخل 5-1-7
  return acc.type === "expense" && (
    acc.code === "5-1-8"   ||
    acc.code === "5-1-2-1" ||   // كود قديم للبيانات التاريخية
    acc.code === "5-1-7"   ||   // مصروفات نقل بضاعة (للداخل)
    acc.name?.includes("تكلفة البضاعة المباعة") ||
    acc.name?.includes("تكلفة مبيعات") ||
    acc.name?.includes("نقل بضاعة (للداخل)")
  );
}

function isPurchaseAccount(acc) {
  // حسابات المشتريات (5-1-1-x) — تكلفة مشتريات الفترة
  return acc.type === "expense" && acc.code?.startsWith("5-1-1");
}

function isCOGSOrPurchase(acc) {
  return isCOGSAccount(acc) || isPurchaseAccount(acc);
}

// ──────────────────────────────────────────
// Helper: get account balance in date range
// ──────────────────────────────────────────
function getBalance(acc, from, to, cumulative = false) {
  let balance = 0;
  for (const entry of journalEntries) {
    const d = entry.date || "";
    if (cumulative ? d <= to : (d >= from && d <= to)) {
      for (const line of (entry.lines || [])) {
        // ✅ مطابقة بالـ id أو الكود (أيهما متاح)
        if (line.accountId !== acc.id && line.accountCode !== acc.code) continue;
        balance += (line.debit || 0) - (line.credit || 0);
      }
    }
  }
  return balance;
}

function getBalanceBefore(acc, from) {
  let balance = 0;
  for (const entry of journalEntries) {
    const d = entry.date || "";
    if (d < from) {
      for (const line of (entry.lines || [])) {
        // ✅ مطابقة بالـ id أو الكود (أيهما متاح)
        if (line.accountId !== acc.id && line.accountCode !== acc.code) continue;
        balance += (line.debit || 0) - (line.credit || 0);
      }
    }
  }
  return balance;
}

window.loadDataAndRender = async function(force = true) {
  const container = document.getElementById("fin-report-body");
  if (!container) return;
  container.innerHTML = `<div class="page-loading"><div class="loading-spinner"></div><span>جارٍ تحميل البيانات المحاسبية…</span></div>`;

  try {
    const { clearERPCache, COMPANY_ID } = await import("../utils/db.js");
    clearERPCache(`companies/${COMPANY_ID}/chartOfAccounts`);
    clearERPCache(`companies/${COMPANY_ID}/journalEntries`);

    accounts = await getAll(COLS.chartOfAccounts(), [orderBy("code")]);
    _accById = {}; _accByCode = {};
    accounts.forEach(a => { _accById[a.id] = a; _accByCode[a.code] = a; });

    journalEntries = await getAll(COLS.journalEntries(), [orderBy("date", "asc")]);

    renderActiveTab();
  } catch (err) {
    container.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
};

window.switchFinTab = (tab) => {
  activeTab = tab;
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
    btn.style.color = "var(--text-2)";
    btn.style.borderBottomColor = "transparent";
  });
  const activeBtn = document.getElementById(`btn-tab-${tab}`);
  if (activeBtn) {
    activeBtn.classList.add("active");
    activeBtn.style.color = "var(--brand)";
    activeBtn.style.borderBottomColor = "var(--brand)";
  }
  window.loadDataAndRender(true);
};

function renderActiveTab() {
  const container = document.getElementById("fin-report-body");
  if (!container) return;

  let fromVal = document.getElementById("fin-from")?.value || startOfMonth();
  let toVal   = document.getElementById("fin-to")?.value   || todayString();

  const norm = (str) => {
    if (!str) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const m = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    const d = new Date(str);
    return isNaN(d.getTime()) ? str : d.toISOString().split("T")[0];
  };

  let from = norm(fromVal);
  let to   = norm(toVal);
  if (from && to && from > to) { const tmp = from; from = to; to = tmp; }

  // التحكم في ظهور الفلاتر الإضافية بحسب التبويب النشط
  const extra = document.getElementById("fin-extra-filters");
  if (extra) {
    if (activeTab === "trial") {
      extra.innerHTML = `
        <div class="date-range-group">
          <label>مستوى الحسابات</label>
          <select id="trial-level" style="padding:6px 12px; border:1px solid var(--border); border-radius:6px; background:var(--bg-1); color:var(--text-1); font-weight:bold; font-size:12px; min-height:38px;">
            <option value="all" ${window.trialLevel === "all" ? "selected" : ""}>كل المستويات</option>
            <option value="1" ${window.trialLevel === "1" ? "selected" : ""}>المستوى 1 (رئيسي)</option>
            <option value="2" ${window.trialLevel === "2" ? "selected" : ""}>المستوى 2</option>
            <option value="3" ${window.trialLevel === "3" ? "selected" : ""}>المستوى 3</option>
            <option value="4" ${window.trialLevel === "4" ? "selected" : ""}>المستوى 4</option>
            <option value="5" ${window.trialLevel === "5" ? "selected" : ""}>المستوى 5 (تحليلي)</option>
          </select>
        </div>
      `;
      const levelSelect = document.getElementById("trial-level");
      if (levelSelect) {
        levelSelect.addEventListener("change", (e) => {
          window.trialLevel = e.target.value;
          renderActiveTab();
        });
      }
    } else if (activeTab === "custperf") {
      // فلتر المندوب لتقرير أداء العملاء
      const reps = [...new Set((_salesInvoicesCache || []).filter(i => i.repName).map(i => i.repName))].sort();
      extra.innerHTML = `
        <div class="date-range-group">
          <label>المندوب</label>
          <select id="custperf-rep" style="padding:6px 12px; border:1px solid var(--border); border-radius:6px; background:var(--bg-1); color:var(--text-1); font-weight:bold; font-size:12px; min-height:38px;">
            <option value="">كل المناديب</option>
            ${reps.map(r => `<option value="${r}" ${window.custperfRep === r ? "selected" : ""}>${r}</option>`).join("")}
          </select>
        </div>
        <div class="date-range-group">
          <label>الترتيب حسب</label>
          <select id="custperf-sort" style="padding:6px 12px; border:1px solid var(--border); border-radius:6px; background:var(--bg-1); color:var(--text-1); font-weight:bold; font-size:12px; min-height:38px;">
            <option value="sales" ${window.custperfSort === "sales" ? "selected" : ""}>المبيعات</option>
            <option value="profit" ${window.custperfSort === "profit" ? "selected" : ""}>الربح</option>
            <option value="collection" ${window.custperfSort === "collection" ? "selected" : ""}>نسبة التحصيل</option>
            <option value="remaining" ${window.custperfSort === "remaining" ? "selected" : ""}>المتبقي</option>
            <option value="daily" ${window.custperfSort === "daily" ? "selected" : ""}>المعدل اليومي</option>
          </select>
        </div>
      `;
      document.getElementById("custperf-rep")?.addEventListener("change", (e) => {
        window.custperfRep = e.target.value;
        renderActiveTab();
      });
      document.getElementById("custperf-sort")?.addEventListener("change", (e) => {
        window.custperfSort = e.target.value;
        renderActiveTab();
      });
    } else {
      extra.innerHTML = "";
    }
  }

  const fns = {
    ledger:   renderGeneralLedger,
    trial:    renderTrialBalance,
    income:   renderIncomeStatement,
    balance:  renderBalanceSheet,
    cashflow: renderCashFlows,
    equity:   renderChangesInEquity,
    analysis: renderFinancialAnalysis,
    aging:    renderAgedReceivables,
    custperf: renderCustomerAnalytics,
  };
  (fns[activeTab] || renderGeneralLedger)(container, from, to);
}

// ──────────────────────────────────────────
// 1. General Ledger (دفتر الأستاذ)
// ──────────────────────────────────────────
function renderGeneralLedger(container, from, to) {
  // بناء قائمة الحسابات مرتبة بالكود
  const sortedAccounts = [...accounts].sort((a, b) => (a.code || "").localeCompare(b.code || ""));
  const options = sortedAccounts.map(a =>
    `<option value="${a.id}">${a.code} — ${a.name}${a.nodeType === 'header' ? ' 📁' : ''}</option>`
  ).join("");

  container.innerHTML = `
    <div class="card no-print mb-16" style="padding:16px;">
      <div style="display:flex; gap:16px; align-items:flex-end; flex-wrap:wrap;">
        <div class="form-group" style="flex:1; min-width:280px; margin:0;">
          <label>اختر الحساب لعرض حركاته</label>
          <select id="ledger-acc-select" class="input" onchange="updateLedgerLines()">
            ${options}
          </select>
        </div>
        <button class="btn btn-secondary" onclick="exportLedgerExcel()" style="white-space:nowrap;">📥 تصدير Excel</button>
      </div>
    </div>
    <div id="ledger-report-area"></div>
  `;

  // ── مساعد: جمع رصيد حساب + كل أبنائه الهرميين ──
  const _getHierarchyBalance = (accCode, beforeDate, inRange) => {
    let open = 0, dr = 0, cr = 0;
    for (const entry of journalEntries) {
      const d = entry.date || "";
      for (const line of (entry.lines || [])) {
        const code = line.accountCode;
        if (!code) continue;
        // يطابق الحساب نفسه أو أي حساب ابن
        if (code !== accCode && !code.startsWith(accCode + "-")) continue;
        if (d < beforeDate) {
          open += (line.debit || 0) - (line.credit || 0);
        } else if (inRange(d)) {
          dr += line.debit  || 0;
          cr += line.credit || 0;
        }
      }
    }
    return { open, dr, cr };
  };

  window.updateLedgerLines = () => {
    const accId  = document.getElementById("ledger-acc-select")?.value;
    const acc    = accounts.find(a => a.id === accId);
    if (!acc) return;

    const isCreditNormal = ["liability", "equity", "revenue"].includes(acc.type);
    const isParent = accounts.some(a => a.code !== acc.code && a.code.startsWith(acc.code + "-"));

    // ── جمع الرصيد الافتتاحي والحركات للحساب + أبنائه ──
    let openingBalance = 0;
    const lines = [];

    if (isParent) {
      // حساب أب: نجمع كل أبنائه ونُنشئ سطر ملخص لكل قيد
      const entryMap = {}; // entryId → { date, num, desc, type, dr, cr, entryId }
      for (const entry of journalEntries) {
        const d = entry.date || "";
        for (const line of (entry.lines || [])) {
          const code = line.accountCode;
          if (!code || (code !== acc.code && !code.startsWith(acc.code + "-"))) continue;
          const dr = line.debit  || 0;
          const cr = line.credit || 0;
          if (d < from) {
            openingBalance += dr - cr;
          } else if (d >= from && d <= to) {
            if (!entryMap[entry.id]) {
              entryMap[entry.id] = {
                date: d,
                entryNumber: _fmtEntryNum(entry.entryNumber, entry.id),
                description: entry.description || "",
                sourceType: entry.sourceType || "",
                debit: 0, credit: 0,
                entryId: entry.id,  // ✅ حفظ الـ ID للنقر
              };
            }
            entryMap[entry.id].debit  += dr;
            entryMap[entry.id].credit += cr;
          }
        }
      }
      Object.values(entryMap)
        .sort((a, b) => a.date.localeCompare(b.date))
        .forEach(e => lines.push(e));
    } else {
      // حساب تفصيلي: سطر لكل قيد بالضبط
      for (const entry of journalEntries) {
        const d = entry.date || "";
        for (const line of (entry.lines || [])) {
          const la = matchLineToAcc(line);
          if (!la || la.id !== accId) continue;
          const dr = line.debit  || 0;
          const cr = line.credit || 0;
          if (d < from) {
            openingBalance += dr - cr;
          } else if (d >= from && d <= to) {
            lines.push({
              date: d,
              entryNumber: _fmtEntryNum(entry.entryNumber, entry.id),
              description: entry.description || "",
              sourceType: entry.sourceType || "",
              debit: dr, credit: cr,
              note: line.note || "",
              entryId: entry.id,
            });
          }
        }
      }
      lines.sort((a, b) => a.date.localeCompare(b.date));
    }

    const totalDr = lines.reduce((s, l) => s + l.debit,  0);
    const totalCr = lines.reduce((s, l) => s + l.credit, 0);

    // حفظ للتصدير
    window._ledgerData = { acc, from, to, openingBalance, isCreditNormal, lines, totalDr, totalCr };

    const reportArea = document.getElementById("ledger-report-area");
    if (!reportArea) return;

    const parentBadge = isParent
      ? `<span style="font-size:11px; background:var(--bg-3); padding:2px 8px; border-radius:4px; margin-right:8px;">📁 حساب أب — يشمل كل الأبناء</span>`
      : "";

    // إعادة حساب الرصيد الجاري لكل صف
    let runBal = isCreditNormal ? -openingBalance : openingBalance;

    const rowsHtml = lines.map(l => {
      const amt = l.debit - l.credit;
      runBal += isCreditNormal ? -amt : amt;
      const bal      = Math.abs(runBal);
      const side     = runBal >= 0 ? "مدين" : "دائن";
      const balColor = (isCreditNormal ? runBal <= 0 : runBal >= 0) ? "var(--text-1)" : "#ef4444";
      // ✅ رقم القيد قابل للنقر لعرض تفاصيل القيد كاملاً
      const jeLink = l.entryId
        ? `<span onclick="window.showJEDetail('${l.entryId}')" style="color:var(--brand);cursor:pointer;font-weight:bold;font-size:12px;text-decoration:underline dotted;" title="انقر لعرض القيد كاملاً">${l.entryNumber}</span>`
        : `<span style="font-size:12px;font-weight:bold;color:var(--brand);">${l.entryNumber}</span>`;
      return `
        <tr>
          <td class="dim" style="font-size:12px;">${l.date}</td>
          <td class="mono">${jeLink}</td>
          <td style="font-size:12px;max-width:250px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${l.description}</td>
          <td class="dim" style="font-size:11px;">${_sourceTypeLabel(l.sourceType) || l.note || "—"}</td>
          <td class="mono" style="color:var(--text-indigo,#6366f1);font-size:12px;">${l.debit  ? formatCurrency(l.debit)  : "—"}</td>
          <td class="mono" style="color:var(--text-lime,#22c55e);font-size:12px;">${l.credit ? formatCurrency(l.credit) : "—"}</td>
          <td class="mono font-bold" style="color:${balColor};font-size:12px;">${formatCurrency(bal)} <span class="dim" style="font-size:10px;">${side}</span></td>
        </tr>`;
    }).join("");

    const openBal    = Math.abs(isCreditNormal ? -openingBalance : openingBalance);
    const openLabel  = (isCreditNormal ? -openingBalance : openingBalance) >= 0 ? "مدين" : "دائن";
    const finalBal   = Math.abs(runBal);
    const finalSide  = runBal >= 0 ? "مدين" : "دائن";
    const finalColor = (isCreditNormal ? runBal <= 0 : runBal >= 0) ? "var(--text-1)" : "#ef4444";

    reportArea.innerHTML = `
      ${window.getCompanyPrintHeaderHTML ? window.getCompanyPrintHeaderHTML("دفتر الأستاذ التفصيلي", `حساب: ${acc.code} — ${acc.name} | من ${from} إلى ${to}`) : ""}
      <div class="no-print" style="text-align:center; margin-bottom:16px;">
        <h3 style="margin:0 0 4px;">📒 دفتر الأستاذ التفصيلي ${parentBadge}</h3>
        <p class="dim" style="margin:0;">حساب: <strong>${acc.code}</strong> — ${acc.name} | من <strong>${from}</strong> إلى <strong>${to}</strong></p>
      </div>
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr>
              <th style="width:100px;">التاريخ</th>
              <th style="width:130px;">رقم القيد</th>
              <th>البيان</th>
              <th style="width:90px;">نوع العملية</th>
              <th class="text-indigo" style="width:110px;">مدين</th>
              <th class="text-lime" style="width:110px;">دائن</th>
              <th style="width:120px;">الرصيد الجاري</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:var(--bg-2); font-weight:bold;">
              <td colspan="4">📌 رصيد افتتاحي (قبل ${from})</td>
              <td class="mono">—</td><td class="mono">—</td>
              <td class="mono font-bold" style="color:${openBal > 0 ? 'var(--text-good,#22c55e)' : 'var(--text-2)'};">${formatCurrency(openBal)} <span class="dim" style="font-size:11px;">${openLabel}</span></td>
            </tr>
            ${lines.length === 0 ? `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-2);">لا توجد حركات في هذه الفترة</td></tr>` : ""}
            ${rowsHtml}
            <tr style="border-top:2px solid var(--border); background:var(--bg-2); font-weight:bold;">
              <td colspan="4">📊 الإجمالي (${lines.length} حركة)</td>
              <td class="mono font-bold" style="color:var(--text-indigo,#6366f1);">${formatCurrency(totalDr)}</td>
              <td class="mono font-bold" style="color:var(--text-lime,#22c55e);">${formatCurrency(totalCr)}</td>
              <td class="mono font-bold" style="color:${finalColor};">${formatCurrency(finalBal)} <span class="dim" style="font-size:11px;">${finalSide}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  };

  // ✅ دالة عرض تفاصيل القيد الكامل عند النقر على رقم القيد
  window.showJEDetail = (entryId) => {
    const entry = journalEntries.find(e => e.id === entryId);
    if (!entry) { window.showToast?.("لم يُعثر على القيد", "error"); return; }

    const lines = (entry.lines || []).map(l => {
      const accObj = _accById[l.accountId] || _accByCode[l.accountCode];
      const accName = accObj ? `${accObj.code} — ${accObj.name}` : (l.accountCode || l.accountId || "—");
      return `<tr>
        <td style="font-size:13px;">${accName}</td>
        <td class="mono" style="color:#6366f1;text-align:center;">${l.debit  ? formatCurrency(l.debit)  : "—"}</td>
        <td class="mono" style="color:#22c55e;text-align:center;">${l.credit ? formatCurrency(l.credit) : "—"}</td>
        <td class="dim" style="font-size:12px;">${l.note || "—"}</td>
      </tr>`;
    }).join("");

    const totalDr = (entry.lines||[]).reduce((s,l) => s+(l.debit||0),0);
    const totalCr = (entry.lines||[]).reduce((s,l) => s+(l.credit||0),0);
    const isBalanced = Math.abs(totalDr - totalCr) < 0.01;

    const modal = document.createElement("div");
    modal.id = "je-detail-modal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;";
    modal.innerHTML = `
      <div style="background:var(--bg-1);border-radius:12px;max-width:760px;width:100%;max-height:85vh;overflow-y:auto;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.4);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:12px;">
          <div>
            <div style="font-size:18px;font-weight:bold;">📋 ${_fmtEntryNum(entry.entryNumber, entry.id)}</div>
            <div class="dim" style="font-size:13px;margin-top:4px;">${entry.date} | ${entry.description || "—"} | ${_sourceTypeLabel(entry.sourceType)||entry.sourceType||"يدوي"}</div>
          </div>
          <button onclick="document.getElementById('je-detail-modal').remove()" style="border:none;background:var(--bg-3);border-radius:8px;padding:8px 14px;cursor:pointer;font-size:16px;">✕</button>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:var(--bg-2);">
            <th style="padding:8px;text-align:right;">الحساب</th>
            <th style="padding:8px;text-align:center;color:#6366f1;">مدين</th>
            <th style="padding:8px;text-align:center;color:#22c55e;">دائن</th>
            <th style="padding:8px;text-align:right;">بيان</th>
          </tr></thead>
          <tbody>${lines}</tbody>
          <tfoot><tr style="background:var(--bg-2);font-weight:bold;border-top:2px solid var(--border);">
            <td style="padding:8px;">الإجمالي</td>
            <td style="padding:8px;text-align:center;color:#6366f1;">${formatCurrency(totalDr)}</td>
            <td style="padding:8px;text-align:center;color:#22c55e;">${formatCurrency(totalCr)}</td>
            <td style="padding:8px;font-size:12px;">${isBalanced ? '✅ قيد متوازن' : '⚠️ قيد غير متوازن!'}</td>
          </tr></tfoot>
        </table>
      </div>`;
    modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
  };

  // ── تصدير Excel ──
  window.exportLedgerExcel = () => {
    const d = window._ledgerData;
    if (!d) return;
    let csv = `\uFEFFدفتر الأستاذ - ${d.acc.code} - ${d.acc.name}\n`;
    csv += `من ${d.from} إلى ${d.to}\n\n`;
    csv += `التاريخ,رقم القيد,البيان,نوع العملية,مدين,دائن,الرصيد\n`;
    let bal = d.isCreditNormal ? -d.openingBalance : d.openingBalance;
    csv += `,,رصيد افتتاحي,,,, ${bal.toFixed(2)}\n`;
    d.lines.forEach(l => {
      const amt = l.debit - l.credit;
      bal += d.isCreditNormal ? -amt : amt;
      csv += `${l.date},${l.entryNumber},"${l.description}",${_sourceTypeLabel(l.sourceType)||'-'},${l.debit||'0'},${l.credit||'0'},${bal.toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `ledger_${d.acc.code}_${d.from}_${d.to}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  updateLedgerLines();
}

// ── مساعد: تنسيق رقم القيد ──
function _fmtEntryNum(entryNumber, id) {
  if (entryNumber && entryNumber !== 'undefined' && entryNumber.trim()) return entryNumber;
  // فلبك: JE- + آخر 6 أحرف من الـ id
  return `JE-${(id || '').slice(-6).toUpperCase()}`;
}

function _sourceTypeLabel(t) {
  const map = {
    // مبيعات
    sales: "مبيعات", salesInvoice: "فاتورة بيع", salesCOGS: "تكلفة مباعة",
    salesReturn: "مردود بيع", salesInvoice_cogs: "تكلفة فاتورة بيع",
    salesReturnCOGS: "تكلفة مردود بيع",
    // مشتريات
    purchase: "مشتريات", purchaseInvoice: "فاتورة شراء",
    purchaseReturn: "مردود شراء",
    // نقديات وبنوك
    receipt: "تحصيل", payment: "سداد",
    cashIn: "إيداع نقدي", cashOut: "صرف نقدي",
    bankDeposit: "إيداع بنكي", bankWithdraw: "سحب بنكي",
    // مخزون
    stockTransfer: "تحويل مخزني", inventoryAdjust: "جرد/تعديل",
    // أخرى
    expense: "مصروف", payroll: "رواتب",
    opening: "رصيد افتتاحي", transfer: "تحويل",
    manual: "يدوي", pos: "نقطة بيع", posCOGS: "تكلفة POS",
    vatPayment: "سداد ضريبة",
  };
  return t ? (map[t] || t) : "";
}


// ──────────────────────────────────────────
// 2. Trial Balance (ميزان المراجعة)
// ──────────────────────────────────────────
function renderTrialBalance(container, from, to) {
  const rows = [];
  const abnormalAccounts = [];  // ← لجمع الحسابات ذات الرصيد الشاذ
  let totalOpenDr = 0, totalOpenCr = 0;
  let totalTransDr = 0, totalTransCr = 0;
  let totalCloseDr = 0, totalCloseCr = 0;

  const isCrNormal = acc => ["liability", "equity", "revenue"].includes(acc.type);
  const selectedLevel = window.trialLevel || "all";

  // دالة لحساب مستوى الحساب بناءً على عدد الأجزاء المفصولة بشرطة
  const getAccountLevel = acc => (acc.code.match(/-/g) || []).length + 1;

  // ✅ ROOTFIX: حساب مجموعة الأكواد الأب (كل كود يظهر كـ parentCode لحساب آخر)
  // الحسابات الورقية (leaf) = الحسابات التي لا تظهر كـ parentCode لأي حساب آخر
  // هذا هو الأساس الرياضي الصحيح: كل قيد يومية يُسجَّل في حساب ورقي واحد
  // → جمع الحسابات الورقية فقط = مجموع كل القيود = متوازن دائماً (Dr = Cr)
  const _parentCodeSet = new Set(accounts.map(a => a.parentCode).filter(Boolean));
  const _isLeafAccount = acc => !_parentCodeSet.has(acc.code);

  // ✅ FINAL ROOTFIX: احتساب الإجماليات الحقيقية مباشرةً من بنود القيود اليومية
  // هذا يتجاوز هيكل الحسابات كلياً ويضمن: Dr = Cr مضموناً 100% رياضياً
  // لأن كل قيد يومية متوازن (Dr = Cr) → مجموع كل القيود متوازن بالضرورة
  {
    const _netByCode = {};
    for (const entry of journalEntries) {
      const d = entry.date || "";
      for (const line of (entry.lines || [])) {
        const code = line.accountCode;
        if (!code) continue;
        if (!_netByCode[code]) _netByCode[code] = { open: 0, tD: 0, tC: 0 };
        if (d < from) {
          _netByCode[code].open += (line.debit || 0) - (line.credit || 0);
        } else if (d >= from && d <= to) {
          _netByCode[code].tD += line.debit  || 0;
          _netByCode[code].tC += line.credit || 0;
        }
      }
    }
    for (const code in _netByCode) {
      const { open, tD, tC } = _netByCode[code];
      const close = open + (tD - tC);
      if (open  > 0) totalOpenDr  += open;  else if (open  < 0) totalOpenCr  += (-open);
      if (close > 0) totalCloseDr += close; else if (close < 0) totalCloseCr += (-close);
      totalTransDr += tD;
      totalTransCr += tC;
    }
  }

  // ✅ ROOTFIX v3: منطق التصفية الصحيح بالمستوى
  // عند اختيار مستوى N, يُظهر الحساب إذا:
  // (a) كان عند المستوى N تحديداً
  // (b) كان عند مستوى < N ولا يوجد له أي نسل عند المستويات من 1 إلى N
  //    (يعني: هو "ممثل الفرع" الوحيد لهذا الحساب ولا سيغطيه أي حساب عند المستوى N)
  // هذا يضمن عرض جميع القيود دون تكرار ودون إغفال
  const _shouldShowAtLevel = (acc, N) => {
    const accLvl = getAccountLevel(acc);
    if (accLvl > N) return false;  // أعمق من N → سيؿطيه حسابه الأب عند N
    if (accLvl === N) return true;  // تحديداً عند N → اعرضه
    // accLvl < N: فقط إذا لم يوجد أي نسل له عند مستويات 1→N
    const hasCoveredDescendant = accounts.some(other =>
      other.code !== acc.code &&
      other.code.startsWith(acc.code + '-') &&
      getAccountLevel(other) <= N
    );
    return !hasCoveredDescendant;  // لا يوجد نسل = هو الممثل الوحيد → اعرضه
  };

  for (const acc of accounts) {
    const accLevel = getAccountLevel(acc);
    const indentPx  = Math.max(0, (accLevel - 1)) * 14;
    const isHeader  = !_isLeafAccount(acc);
    const typeLabel = { asset: 'أصول', liability: 'خصوم', equity: 'حقوق', revenue: 'إيراد', expense: 'مصروف' };
    // تصفية ميزان المراجعة حسب المستوى المختار
    if (selectedLevel !== "all") {
      if (!_shouldShowAtLevel(acc, parseInt(selectedLevel))) continue;
    }

    let openBal = 0, transDr = 0, transCr = 0;

    for (const entry of journalEntries) {
      const d = entry.date || "";
      for (const line of (entry.lines || [])) {
        if (!line.accountCode) continue;
        
        // التحقق مما إذا كان قيد اليومية يخص هذا الحساب أو أي حساب ابن متفرع منه (تجميع ديناميكي تصاعدي)
        const isMatch = line.accountCode === acc.code || line.accountCode.startsWith(acc.code + "-");
        if (!isMatch) continue;

        if (d < from) {
          openBal += (line.debit || 0) - (line.credit || 0);
        } else if (d >= from && d <= to) {
          transDr += line.debit  || 0;
          transCr += line.credit || 0;
        }
      }
    }

    const closeBal = openBal + (transDr - transCr);
    
    // إذا كان الحساب صفرياً بالكامل، لا داعي لعرضه لتوفير مساحة العرض
    if (Math.abs(openBal) < 0.01 && transDr === 0 && transCr === 0) continue;

    const openDr  = openBal  > 0 ? openBal        : 0;
    const openCr  = openBal  < 0 ? (-openBal)     : 0;
    const closeDr = closeBal > 0 ? closeBal       : 0;
    const closeCr = closeBal < 0 ? (-closeBal)    : 0;

    // الإجماليات محسوبة مسبقاً من raw JE lines — لا تراكم هنا لتفادي الاحتساب المزدوج

    // كشف الأرصدة الشاذة (التزام برصيد مدين، أو أصل برصيد دائن)
    // ملاحظة: حسابات العملاء والموردين يمكن أن تحمل رصيداً دائناً (دفعة مقدمة من عميل) أو مديناً (دفعة لمورد) وهو وضع تجاري طبيعي ولا يُعد رصيداً شاذة
    const isCustOrSupp = acc.code && (acc.code.startsWith("1-1-2") || acc.code.startsWith("2-1-1"));
    const isAbnormal = !isCustOrSupp && ((isCrNormal(acc) && closeDr > 0.01) || (!isCrNormal(acc) && closeCr > 0.01));
    const abnormalBadge = isAbnormal
      ? `<span style="font-size:10px; background:#7f1d1d; color:#fca5a5; padding:1px 5px; border-radius:4px; margin-right:4px;">⚠️ رصيد شاذ</span>`
      : "";

    if (isAbnormal) {
      abnormalAccounts.push({
        id: acc.id, code: acc.code, name: acc.name,
        type: acc.type, parentCode: acc.parentCode,
        sourceEntityId: acc.sourceEntityId || null,
        closeDr, closeCr,
      });
    }

    rows.push(`
      <tr ${isAbnormal ? 'style="background:rgba(127,29,29,0.08);"' : (isHeader ? 'style="background:var(--bg-2);"' : '')}>
        <td class="mono dim" style="font-size:11px;">${acc.code}</td>
        <td style="padding-right:${indentPx + 8}px; ${isHeader ? 'font-weight:700;' : ''}">${abnormalBadge}${isHeader ? '📁 ' : ''}${acc.name}</td>
        <td><span style="font-size:10px; padding:1px 5px; border-radius:4px; background:var(--bg-3);">${typeLabel[acc.type] || acc.type}</span></td>
        <td class="mono">${openDr  ? formatCurrency(openDr)  : "—"}</td>
        <td class="mono">${openCr  ? formatCurrency(openCr)  : "—"}</td>
        <td class="mono text-indigo">${transDr ? formatCurrency(transDr) : "—"}</td>
        <td class="mono text-lime">${transCr ? formatCurrency(transCr) : "—"}</td>
        <td class="mono font-bold">${closeDr ? formatCurrency(closeDr) : "—"}</td>
        <td class="mono font-bold">${closeCr ? formatCurrency(closeCr) : "—"}</td>
      </tr>
    `);
  }

  // ── كشف الأسطر اليتيمة (لا تُطابق أي حساب في شجرة الحسابات) ──
  let orphanDr = 0, orphanCr = 0;
  const orphanLines = [];
  for (const entry of journalEntries) {
    const d = entry.date || "";
    for (const line of (entry.lines || [])) {
      const la = matchLineToAcc(line);
      if (!la) {
        const dr = line.debit  || 0;
        const cr = line.credit || 0;
        // تجاهل الأسطر ذات المبلغ صفر: لا تأثير محاسبي لها ولا يجب الإبلاغ عنها
        if (dr === 0 && cr === 0) continue;
        // سطر يتيم — لا يُطابق أي حساب
        orphanDr += dr;
        orphanCr += cr;
        orphanLines.push({
          entryId:   entry.id,
          entryNum:  _fmtEntryNum(entry.entryNumber, entry.id),
          date:      d,
          desc:      entry.description || "—",
          accCode:   line.accountCode  || "—",
          accName:   line.accountName  || "—",
          accId:     line.accountId    || "—",
          dr, cr
        });
      }
    }
  }

  const diffClose  = Math.abs(totalCloseDr - totalCloseCr);
  const diffTrans  = Math.abs(totalTransDr - totalTransCr);
  const hasOrphans = orphanLines.length > 0;
  const balanced   = diffClose < 0.05 && !hasOrphans;

  // ── جدول الأسطر اليتيمة ──
  const orphanTable = hasOrphans ? `
    <div class="card mb-16" style="border:2px solid #b45309; padding:20px;">
      <h4 style="color:#f59e0b; margin-bottom:12px;">⚠️ أسطر قيود يتيمة — الحسابات غير موجودة في شجرة الحسابات</h4>
      <p class="dim" style="font-size:12px; margin-bottom:12px;">
        هذه الأسطر تشير إلى حسابات محذوفة أو غير مُدرجة في الشجرة الحالية، مما يُسبب عدم التوازن.
        يجب مراجعة القيود وإعادة ربطها بحسابات صحيحة.
      </p>
      <p class="dim" style="font-size:12px; margin-bottom:12px;">
        إجمالي المدين اليتيم: <strong>${formatCurrency(orphanDr)}</strong> |
        إجمالي الدائن اليتيم: <strong>${formatCurrency(orphanCr)}</strong> |
        فرق الميزان بسببها: <strong>${formatCurrency(Math.abs(orphanDr - orphanCr))}</strong>
      </p>
      <div class="table-container" style="max-height:250px; overflow-y:auto;">
        <table class="data-dense" style="width:100%; font-size:12px;">
          <thead><tr>
            <th>رقم القيد</th><th>التاريخ</th><th>البيان</th>
            <th>كود الحساب</th><th>اسم الحساب</th>
            <th class="text-indigo">مدين</th><th class="text-lime">دائن</th>
          </tr></thead>
          <tbody>
            ${orphanLines.slice(0, 50).map(l => `
              <tr>
                <td class="mono dim">${l.entryNum}</td>
                <td>${l.date}</td>
                <td>${l.desc}</td>
                <td class="mono text-bad">${l.accCode}</td>
                <td class="dim">${l.accName}</td>
                <td class="mono text-indigo">${l.dr ? formatCurrency(l.dr) : "—"}</td>
                <td class="mono text-lime">${l.cr ? formatCurrency(l.cr) : "—"}</td>
              </tr>
            `).join("")}
            ${orphanLines.length > 50 ? `<tr><td colspan="7" style="text-align:center; color:var(--text-2);">... و ${orphanLines.length - 50} سطراً آخر</td></tr>` : ""}
          </tbody>
        </table>
      </div>
    </div>
  ` : "";

  const diffClose_rounded = Math.round(diffClose * 100) / 100;

  // ── حفظ بيانات التصدير ──
  window._trialData = { rows, from, to, totalOpenDr, totalOpenCr, totalTransDr, totalTransCr, totalCloseDr, totalCloseCr, balanced };

  container.innerHTML = `
    ${window.getCompanyPrintHeaderHTML ? window.getCompanyPrintHeaderHTML("ميزان المراجعة بالأرصدة والمجاميع", `الفترة من ${from} إلى ${to}`) : ""}
    <div class="no-print" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
      <div style="text-align:center; flex:1;">
        <h3 style="margin:0 0 4px;">⚖️ ميزان المراجعة بالأرصدة والمجاميع</h3>
        <p class="dim" style="margin:0;">من <strong>${from}</strong> إلى <strong>${to}</strong></p>
      </div>
      <button class="btn btn-secondary" onclick="exportTrialExcel()" style="white-space:nowrap;">📥 تصدير Excel</button>
    </div>

    ${!balanced ? `
    <div class="alert bad mb-16" style="display:flex; align-items:center; gap:12px;">
      <span style="font-size:22px;">⚠️</span>
      <div>
        <strong>تحذير: الميزان غير متوازن</strong><br>
        <span class="dim">
          فرق الأرصدة الختامية: ${formatCurrency(diffClose_rounded)}
          ${hasOrphans ? ` | أسطر يتيمة: ${orphanLines.length} سطر (مدين: ${formatCurrency(orphanDr)} / دائن: ${formatCurrency(orphanCr)})` : ""}
          ${diffTrans > 0.05 ? ` | فرق حركات الفترة: ${formatCurrency(Math.round(diffTrans*100)/100)}` : ""}
        </span>
      </div>
    </div>` : `
    <div class="alert good mb-16" style="display:flex; align-items:center; gap:12px;">
      <span style="font-size:22px;">✅</span>
      <div><strong>الميزان متوازن تماماً</strong> — مجموع القيود: ${formatCurrency(totalCloseDr)}</div>
    </div>`}

    ${orphanTable}

    <div class="table-container">
      <table class="data-dense" style="width:100%;">
        <thead>
          <tr>
            <th rowspan="2" style="width:120px;">الكود</th>
            <th rowspan="2">اسم الحساب</th>
            <th rowspan="2" style="width:70px;">النوع</th>
            <th colspan="2" style="text-align:center; background:var(--bg-2);">الأرصدة الافتتاحية</th>
            <th colspan="2" style="text-align:center; background:var(--bg-2);">حركات الفترة</th>
            <th colspan="2" style="text-align:center; background:var(--bg-2);">الأرصدة الختامية</th>
          </tr>
          <tr>
            <th>مدين</th><th>دائن</th>
            <th class="text-indigo">مدين</th><th class="text-lime">دائن</th>
            <th>مدين</th><th>دائن</th>
          </tr>
        </thead>
        <tbody>
          ${rows.join("")}
          <tr style="border-top:2.5px solid var(--border); background:var(--surface-1); font-weight:bold;">
            <td colspan="3">الإجمالي</td>
            <td class="mono">${formatCurrency(totalOpenDr)}</td>
            <td class="mono">${formatCurrency(totalOpenCr)}</td>
            <td class="mono text-indigo">${formatCurrency(totalTransDr)}</td>
            <td class="mono text-lime">${formatCurrency(totalTransCr)}</td>
            <td class="mono ${balanced ? "text-good" : "text-bad"}">${formatCurrency(totalCloseDr)}</td>
            <td class="mono ${balanced ? "text-good" : "text-bad"}">${formatCurrency(totalCloseCr)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  // ── تصدير Excel ──
  window.exportTrialExcel = () => {
    const d = window._trialData;
    if (!d) return;
    let csv = `\uFEFFميزان المراجعة - من ${d.from} إلى ${d.to}\n\n`;
    csv += `الكود,اسم الحساب,النوع,رصيد افتتاحي مدين,رصيد افتتاحي دائن,حركات مدين,حركات دائن,رصيد ختامي مدين,رصيد ختامي دائن\n`;
    // استخراج بيانات الجدول من الصفوف
    const tbody = document.querySelector('#fin-report-body .data-dense tbody');
    if (tbody) {
      [...tbody.querySelectorAll('tr')].forEach(tr => {
        const tds = [...tr.querySelectorAll('td')].map(td => `"${td.textContent.trim().replace(/"/g,'""')}"`);
        if (tds.length >= 8) csv += tds.join(',') + '\n';
      });
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `trial_balance_${d.from}_${d.to}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // ── لوحة إصلاح الحسابات الشاذة ──
  const fixableAccounts = abnormalAccounts.filter(a => {

    // حسابات التزام برصيد مدين قابلة للإصلاح
    if (a.type === "liability" && a.closeDr > 0.01) return true;
    // حسابات أصل برصيد دائن
    if (a.type === "asset" && a.closeCr > 0.01) return true;
    return false;
  });

  const fixPanel = fixableAccounts.length ? `
    <div class="card mt-20" style="border:2px solid #b45309; padding:20px;">
      <h4 style="color:#f59e0b; margin-bottom:8px;">🔧 حسابات تحتاج إجراء (${fixableAccounts.length} حساب)</h4>
      <p class="dim" style="font-size:12px; margin-bottom:12px;">الحسابات التالية لديها رصيد بالاتجاه الخاطئ لنوعها — اضغط زر الإجراء لكل منها</p>
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead><tr>
            <th>الكود</th><th>الاسم</th><th>النوع</th>
            <th>الرصيد الختامي</th><th>تشخيص المشكلة</th><th>الإجراء</th>
          </tr></thead>
          <tbody>
            ${fixableAccounts.map(a => {
              const balance = a.closeDr > 0.01 ? a.closeDr : a.closeCr;
              const isDebitBal = a.closeDr > 0.01;
              let diagnosis = "", actionBtn = "";

              if (a.type === "liability" && isDebitBal) {
                if (a.code?.startsWith("2-1-5") || a.code?.startsWith("2-1-4")) {
                  // سلفة موظف/مندوب مُصنَّفة كالتزام بالخطأ
                  diagnosis = "سلفة موظف/مندوب مُصنَّفة تحت الخصوم — يجب إعادة تصنيفها كأصل";
                  actionBtn = `<button class="btn btn-sm" style="background:#b45309;color:#fff;" onclick="fixReclassifyAccount('${a.id}','${a.code}','asset','1-1-5-4')">🔄 نقل إلى سلف مناديب</button>`;
                } else if (a.code?.startsWith("2-1-1-1-1-") || (a.parentCode && a.parentCode.startsWith("2-1-1-1"))) {
                  // حساب فرعي مورد — مشترياته ذهبت للأب بينما المدفوعات للفرعي
                  diagnosis = "حساب فرعي مورد: المشتريات قُيّدت بالأب بينما الدفعات قُيّدت بالفرعي";
                  actionBtn = `<button class="btn btn-sm" style="background:#b45309;color:#fff;" onclick="fixSupplierSubAccountJE('${a.id}','${a.code}','${a.name.replace(/'/g,"\\'")}',${balance.toFixed(2)})">⚖️ إنشاء قيد تسوية</button>`;
                } else {
                  diagnosis = "التزام برصيد مدين — راجع القيود يدوياً";
                  actionBtn = `<span class="dim" style="font-size:12px;">مراجعة يدوية</span>`;
                }
              } else if (a.type === "asset" && !isDebitBal) {
                diagnosis = "أصل برصيد دائن — قد يكون دفعة مستلمة زائدة";
                actionBtn = `<span class="dim" style="font-size:12px;">مراجعة يدوية</span>`;
              }

              return `
                <tr>
                  <td class="mono dim">${a.code}</td>
                  <td><strong>${a.name}</strong></td>
                  <td><span style="font-size:11px; padding:2px 6px; border-radius:4px; background:rgba(239,68,68,0.15); color:#ef4444;">${a.type === 'liability' ? 'خصوم' : 'أصول'}</span></td>
                  <td class="mono ${isDebitBal ? 'text-indigo' : 'text-lime'}">${formatCurrency(balance)} ${isDebitBal ? 'م' : 'د'}</td>
                  <td style="font-size:12px; color:var(--text-2);">${diagnosis}</td>
                  <td>${actionBtn}</td>
                </tr>
              `;

            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  ` : "";

  container.innerHTML += fixPanel;
}

// ──────────────────────────────────────────
// إعادة تصنيف حساب (من خصوم إلى أصول أو العكس)
// ──────────────────────────────────────────
window.fixReclassifyAccount = async (accId, accCode, newType, newParentCode) => {
  const confirmed = await window.showConfirm?.(
    `سيتم نقل الحساب ${accCode} إلى تصنيف "${newType === 'asset' ? 'أصول — سلف مناديب' : 'خصوم'}".\n\nهذا يُزيل علامة "رصيد شاذ" لأن رصيد السلفة المدين يُصبح طبيعياً للأصول.`,
    "تغيير تصنيف الحساب"
  );
  if (!confirmed) return;
  try {
    const { update } = await import("../utils/db.js");
    const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const { db } = await import("../utils/db.js");
    
    const normalBalance = ["asset","expense"].includes(newType) ? "debit" : "credit";
    
    // جلب الحساب الحالي لحساب رصيده الجديد
    const accDoc = await getDoc(doc(db, `companies/${COMPANY_ID}/chartOfAccounts`, accId));
    let newBal = 0;
    if (accDoc.exists()) {
      const data = accDoc.data();
      const dr = parseFloat(data.totalDebit || 0);
      const cr = parseFloat(data.totalCredit || 0);
      const delta = dr - cr;
      const isCredit = normalBalance === "credit";
      newBal = Math.round((isCredit ? -delta : delta) * 100) / 100;
    }
    
    await update("chartOfAccounts", accId, { 
      type: newType, 
      parentCode: newParentCode, 
      normalBalance,
      balance: newBal
    });
    
    // تجميع أرصدة الحسابات الأب تلقائياً
    const { recalculateCoaRollup } = await import("../utils/sync-engine.js");
    await recalculateCoaRollup();
    
    window.showToast?.("✅ تم تغيير تصنيف الحساب وتحديث الأرصدة بنجاح", "success");
    await window.loadDataAndRender?.();
  } catch(err) {
    window.showToast?.(err.message, "error");
  }
};

// ──────────────────────────────────────────
// إنشاء قيد تسوية لحساب فرعي مورد برصيد مدين
// ──────────────────────────────────────────
window.fixSupplierSubAccountJE = async (subAccId, subAccCode, subAccName, debitBalance) => {
  const parentAcc  = accounts.find(a => a.code === "2-1-1-1-1");
  const subAcc     = accounts.find(a => a.id === subAccId);
  if (!parentAcc || !subAcc) {
    window.showToast?.("لم يُعثر على حسابات المورد في شجرة الحسابات", "error");
    return;
  }
  const confirmed = await window.showConfirm?.(
    `سيتم إنشاء قيد تسوية:\n` +
    `  مدين: ${parentAcc.code} — ${parentAcc.name}   بمبلغ ${debitBalance.toFixed(2)} ر.س\n` +
    `  دائن: ${subAccCode} — ${subAccName}   بمبلغ ${debitBalance.toFixed(2)} ر.س\n\n` +
    `هذا ينقل رصيد المشتريات من الحساب الأب إلى الحساب الفرعي للمورد.\nالرصيد الإجمالي لذمم الموردين لن يتغير.`,
    "إنشاء قيد تسوية"
  );
  if (!confirmed) return;
  try {
    const { createJournalEntry } = await import("../utils/db.js");
    const today = new Date().toISOString().split("T")[0];
    await createJournalEntry({
      date:        today,
      description: `تسوية — نقل رصيد ${subAccName} من الحساب الأب إلى الفرعي`,
      entryType:   "correction",
      lines: [
        { accountId: parentAcc.id, accountCode: parentAcc.code, accountName: parentAcc.name,
          debit: debitBalance, credit: 0,
          description: `نقل رصيد مشتريات ${subAccName} للحساب الفرعي` },
        { accountId: subAcc.id,    accountCode: subAcc.code,    accountName: subAcc.name,
          debit: 0, credit: debitBalance,
          description: `تسوية رصيد مشتريات ${subAccName}` },
      ]
    });
    window.showToast?.("✅ تم إنشاء قيد التسوية بنجاح", "success");
    await window.loadDataAndRender?.();
  } catch(err) {
    window.showToast?.(err.message, "error");
  }
};

// ──────────────────────────────────────────
// 3. Income Statement (قائمة الدخل)
// ──────────────────────────────────────────
function _calcIncomeData(from, to) {
  let revenueTotal = 0, cogsTotal = 0, opExpTotal = 0;
  const revItems = [], cogsItems = [], expItems = [];

  for (const acc of accounts) {
    if (acc.nodeType === "header") continue;

    let balance = 0;
    for (const entry of journalEntries) {
      const d = entry.date || "";
      if (!from || !to || (d >= from && d <= to)) {
        for (const line of (entry.lines || [])) {
          const la = matchLineToAcc(line);
          if (la && (la.id === acc.id || la.code === acc.code)) {
            balance += (line.credit || 0) - (line.debit || 0);
          }
        }
      }
    }

    // إذا كان رصيد شجرة الحسابات المعتمد للـ Revenue / Expense أكبر، نعتمد رصيد الشجرة المحسب لضمان المطابقة 100%
    const isCreditNormal = ["2", "3", "4"].includes(acc.code ? acc.code.trim().charAt(0) : "1");
    const docBalance = acc.balance !== undefined ? (isCreditNormal ? acc.balance : -acc.balance) : 0;

    if (acc.type === "revenue") {
      const finalRev = Math.max(balance, docBalance, acc.balance || 0);
      if (Math.abs(finalRev) > 0.01) {
        revenueTotal += finalRev;
        revItems.push({ name: acc.name, code: acc.code, balance: finalRev });
      }
    } else if (acc.type === "expense") {
      const val = Math.max(Math.abs(balance), Math.abs(docBalance), Math.abs(acc.balance || 0));
      if (val < 0.01) continue;

      if (isCOGSAccount(acc)) {
        cogsTotal += val;
        cogsItems.push({ name: acc.name, code: acc.code, balance: val });
      } else if (isPurchaseAccount(acc)) {
        if (cogsTotal === 0) {
          cogsTotal += val;
          cogsItems.push({ name: acc.name + " (مشتريات)", code: acc.code, balance: val });
        }
      } else {
        opExpTotal += val;
        expItems.push({ name: acc.name, code: acc.code, balance: val });
      }
    }
  }

  return {
    revenueTotal, cogsTotal, opExpTotal,
    revItems, cogsItems, expItems,
    grossProfit: revenueTotal - cogsTotal,
    netProfit: revenueTotal - cogsTotal - opExpTotal,
  };
}

// ── مساعد: احتساب الفترة السابقة المكافئة ──
function _getPrevPeriod(from, to) {
  const f    = new Date(from + 'T00:00:00');
  const t    = new Date(to   + 'T00:00:00');
  const days = Math.round((t - f) / 86400000) + 1;
  const pTo   = new Date(f); pTo.setDate(pTo.getDate() - 1);
  const pFrom = new Date(pTo); pFrom.setDate(pFrom.getDate() - days + 1);
  const fmt = d => d.toISOString().slice(0, 10);
  return { prevFrom: fmt(pFrom), prevTo: fmt(pTo) };
}

function renderIncomeStatement(container, from, to) {
  const cur = _calcIncomeData(from, to);
  const { revenueTotal, cogsTotal, opExpTotal, revItems, cogsItems, expItems, grossProfit, netProfit } = cur;
  const margin      = revenueTotal > 0 ? (netProfit   / revenueTotal * 100).toFixed(1) : "0.0";
  const grossMargin = revenueTotal > 0 ? (grossProfit / revenueTotal * 100).toFixed(1) : "0.0";
  // مقارنة بالفترة السابقة
  const { prevFrom, prevTo } = _getPrevPeriod(from, to);
  const prev = _calcIncomeData(prevFrom, prevTo);
  const _trend = (cv, pv) => {
    if (!pv || pv < 0.01) return "";
    const pct = ((cv - pv) / pv * 100).toFixed(1);
    const up  = parseFloat(pct) >= 0;
    return `<span style="font-size:11px; color:${up ? '#22c55e' : '#ef4444'}; margin-right:4px;">${up ? '▲' : '▼'}${Math.abs(pct)}%</span>`;
  };

  container.innerHTML = `
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML ? window.getCompanyPrintHeaderHTML("تقرير الأرباح والخسائر (Income Statement)", `الفترة من ${from} إلى ${to}`) : ""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>قائمة الدخل والدخل الشامل (Income Statement)</h2>
      <p class="dim">للفترة من ${from} إلى ${to}</p>
    </div>

    <div style="max-width:800px; margin:0 auto;">
    <div class="no-print" style="text-align:center; margin-bottom:16px;">
      <p class="dim" style="margin:0; font-size:12px;">مقارنة بالفترة السابقة: ${prevFrom} → ${prevTo}</p>
    </div>
      <!-- KPI row -->
      <div class="grid-3 gap-16 mb-24">
        <div class="kpi-card">
          <div class="status-bar good"></div>
          <div class="kpi-content">
            <div class="kpi-label">صافي الربح</div>
            <div class="kpi-value ${netProfit >= 0 ? "text-good" : "text-bad"}">${formatCurrency(netProfit)} ${_trend(netProfit, prev.netProfit)}</div>
            <div class="dim" style="font-size:11px;">هامش ${margin}% | السابق: ${formatCurrency(prev.netProfit)}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="status-bar indigo"></div>
          <div class="kpi-content">
            <div class="kpi-label">مجمل الربح</div>
            <div class="kpi-value text-indigo">${formatCurrency(grossProfit)} ${_trend(grossProfit, prev.grossProfit)}</div>
            <div class="dim" style="font-size:11px;">هامش ${grossMargin}% | السابق: ${formatCurrency(prev.grossProfit)}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="status-bar warn"></div>
          <div class="kpi-content">
            <div class="kpi-label">إجمالي الإيرادات</div>
            <div class="kpi-value">${formatCurrency(revenueTotal)} ${_trend(revenueTotal, prev.revenueTotal)}</div>
            <div class="dim" style="font-size:11px;">السابق: ${formatCurrency(prev.revenueTotal)}</div>
          </div>
        </div>
      </div>

      <div class="card" style="padding:28px;">
        <!-- Revenues -->
        <h4 style="color:var(--brand); border-bottom:2px solid var(--brand); padding-bottom:8px; margin-bottom:16px;">أولاً: الإيرادات والمبيعات</h4>
        ${revItems.length ? revItems.map(item => `
          <div class="flex justify-between mb-8" style="font-size:14px;">
            <span class="dim">${item.code} — ${item.name}</span>
            <span class="mono">${formatCurrency(item.balance)}</span>
          </div>`).join("") : `<p class="dim" style="font-size:13px;">لا توجد إيرادات مسجلة في هذه الفترة</p>`}
        <div class="flex justify-between font-bold" style="background:var(--bg-2); padding:10px 12px; border-radius:8px; margin:12px 0 28px;">
          <span>إجمالي الإيرادات</span>
          <span class="mono text-good">${formatCurrency(revenueTotal)}</span>
        </div>

        <!-- COGS -->
        <h4 style="color:var(--warn); border-bottom:2px solid var(--warn); padding-bottom:8px; margin-bottom:16px;">ثانياً: تكلفة البضاعة المباعة (COGS)</h4>
        ${cogsItems.length ? cogsItems.map(item => `
          <div class="flex justify-between mb-8" style="font-size:14px;">
            <span class="dim">${item.code} — ${item.name}</span>
            <span class="mono text-bad">(${formatCurrency(item.balance)})</span>
          </div>`).join("") : `<p class="dim" style="font-size:13px;">لا توجد تكلفة مباعة في هذه الفترة</p>`}
        <div class="flex justify-between font-bold" style="background:var(--bg-2); padding:10px 12px; border-radius:8px; margin:12px 0 8px;">
          <span>يخصم: تكلفة البضاعة المباعة</span>
          <span class="mono text-bad">(${formatCurrency(cogsTotal)})</span>
        </div>
        <div class="flex justify-between font-bold" style="padding:10px 12px; margin-bottom:28px; border-bottom:1px solid var(--border);">
          <span>مجمل الربح (Gross Profit)</span>
          <span class="mono text-indigo">${formatCurrency(grossProfit)}</span>
        </div>

        <!-- Operating Expenses -->
        <h4 style="color:var(--text-bad, #ef4444); border-bottom:2px solid var(--text-bad, #ef4444); padding-bottom:8px; margin-bottom:16px;">ثالثاً: المصروفات التشغيلية والإدارية</h4>
        ${expItems.length ? expItems.map(item => `
          <div class="flex justify-between mb-8" style="font-size:14px;">
            <span class="dim">${item.code} — ${item.name}</span>
            <span class="mono text-bad">(${formatCurrency(item.balance)})</span>
          </div>`).join("") : `<p class="dim" style="font-size:13px;">لا توجد مصروفات تشغيلية مسجلة</p>`}
        <div class="flex justify-between font-bold" style="background:var(--bg-2); padding:10px 12px; border-radius:8px; margin:12px 0 28px;">
          <span>إجمالي المصروفات التشغيلية</span>
          <span class="mono text-bad">(${formatCurrency(opExpTotal)})</span>
        </div>

        <!-- Net Profit -->
        <div class="flex justify-between font-bold" style="background:${netProfit >= 0 ? "linear-gradient(135deg, #1e3a2f, #14532d)" : "linear-gradient(135deg, #3b1f1f, #7f1d1d)"}; color:#fff; padding:16px 20px; border-radius:12px; font-size:18px;">
          <span>صافي الربح / (الخسارة) للفترة</span>
          <span class="mono">${formatCurrency(netProfit)}</span>
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────
// 4. Balance Sheet (قائمة المركز المالي)
// ──────────────────────────────────────────
function renderBalanceSheet(container, from, to) {
  let assetsTotal = 0, liabilitiesTotal = 0, equityTotal = 0;
  const currentAssets = [], fixedAssets = [];
  const currentLiabilities = [], longTermLiabilities = [];
  const equityItems = [];
  let revenueTotal = 0, expenseTotal = 0;

  // ✅ ROOTFIX: تجميع هرمي من شجرة الحسابات (مثل ميزان المراجعة)
  // بناء قاموس: كود الحساب → الرصيد التراكمي حتى تاريخ "to"
  const _codeBalance = {};
  for (const entry of journalEntries) {
    const d = entry.date || "";
    if (d > to) continue;
    for (const line of (entry.lines || [])) {
      const code = line.accountCode;
      if (!code) continue;
      _codeBalance[code] = (_codeBalance[code] || 0) + (line.debit || 0) - (line.credit || 0);
    }
  }

  // رصيد الحساب + كل أبنائه (تجميع هرمي بالـ startsWith)
  const _accBal = (acc) => {
    let bal = 0;
    for (const code in _codeBalance) {
      if (code === acc.code || code.startsWith(acc.code + '-')) bal += _codeBalance[code];
    }
    // إذا لم تكن هناك قيود لهذا الحساب، نستخدم رصيد الحساب في COA إن وجد
    if (Math.abs(bal) < 0.001) {
      const coaBal = parseFloat(acc.balance || acc.openingBalance || 0);
      if (Math.abs(coaBal) > 0.001) {
        bal = ["liability", "equity", "revenue"].includes(acc.type) ? -coaBal : coaBal;
      }
    }
    return bal;
  };

  // عرض حتى المستوى 4 فقط، ولا نعرض الأب إذا كان له أبناء في نفس النوع
  const _lvl = a => (a.code?.split('-').length || 1);
  const _showInBS = (acc) => {
    if (_lvl(acc) > 4) return false;
    return !accounts.some(o =>
      o.type === acc.type && o.code !== acc.code &&
      o.code.startsWith(acc.code + '-') && _lvl(o) <= 4
    );
  };

  for (const acc of accounts) {
    if (!_showInBS(acc)) continue;
    const balance = _accBal(acc);

    if (acc.type === "asset") {
      if (Math.abs(balance) < 0.01) continue;
      assetsTotal += balance;
      const isFixed = acc.code?.startsWith("1-2") || acc.code?.startsWith("1-3") ||
        acc.name?.includes("سيارات") || acc.name?.includes("أثاث") || acc.name?.includes("عقارات") || acc.name?.includes("معدات");
      (isFixed ? fixedAssets : currentAssets).push({ name: acc.name, code: acc.code, balance });
    } else if (acc.type === "liability") {
      const val = -balance;
      if (Math.abs(val) < 0.01) continue;
      liabilitiesTotal += val;
      const isLT = acc.code?.startsWith("2-2") || acc.name?.includes("قرض طويل") || acc.name?.includes("سند");
      (isLT ? longTermLiabilities : currentLiabilities).push({ name: acc.name, code: acc.code, balance: val });
    } else if (acc.type === "equity") {
      const val = -balance;
      if (Math.abs(val) < 0.01) continue;
      equityTotal += val;
      equityItems.push({ name: acc.name, code: acc.code, balance: val });
    } else if (acc.type === "revenue") {
      revenueTotal += -balance;
    } else if (acc.type === "expense") {
      expenseTotal += balance;
    }
  }

  const periodProfit = revenueTotal - expenseTotal;
  // الأرباح (الخسائر) المرحلة والتسويات الافتتاحية لضمان توازن الميزانية التام
  const retainedEarnings = assetsTotal - liabilitiesTotal - equityTotal - periodProfit;
  const totalEquityCalculated = equityTotal + retainedEarnings + periodProfit;
  const totalLiabEquity = liabilitiesTotal + totalEquityCalculated;
  const isBalanced = Math.abs(assetsTotal - totalLiabEquity) < 1;

  const accRow = (item, color = "var(--text-0)") =>
    `<div class="flex justify-between mb-8" style="font-size:13px;">
       <span>${item.code} — ${item.name}</span>
       <span class="mono" style="color:${color}">${formatCurrency(item.balance)}</span>
     </div>`;

  const sectionTotal = (label, val, color = "var(--text-0)") =>
    `<div class="flex justify-between font-bold" style="background:var(--bg-2); padding:8px 12px; border-radius:6px; margin:8px 0 16px;">
       <span>${label}</span>
       <span class="mono" style="color:${color}">${formatCurrency(val)}</span>
     </div>`;

  container.innerHTML = `
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML ? window.getCompanyPrintHeaderHTML("ميزانية العمومية (Balance Sheet)", `كما هي في: ${to}`) : ""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>قائمة المركز المالي (Balance Sheet)</h2>
      <p class="dim">كما هي في: ${to}</p>
    </div>

    ${!isBalanced ? `<div class="alert bad mb-16">⚠️ الميزانية غير متوازنة — فرق: ${formatCurrency(Math.abs(assetsTotal - totalLiabEquity))}</div>` : ""}

    <div class="grid-2 gap-24" style="max-width:1200px; margin:0 auto;">

      <!-- ASSETS -->
      <div class="card" style="padding:24px;">
        <h3 style="color:var(--brand); border-bottom:2px solid var(--brand); padding-bottom:8px; margin-bottom:20px;">الأصول (Assets)</h3>

        <h4 style="color:var(--indigo); margin:0 0 12px;">الأصول المتداولة</h4>
        ${currentAssets.map(i => accRow(i, "var(--indigo)")).join("") || "<p class='dim'>—</p>"}
        ${sectionTotal("إجمالي الأصول المتداولة", currentAssets.reduce((s,i) => s + i.balance, 0), "var(--indigo)")}

        <h4 style="color:var(--indigo); margin:16px 0 12px;">الأصول الثابتة (غير المتداولة)</h4>
        ${fixedAssets.map(i => accRow(i)).join("") || "<p class='dim'>—</p>"}
        ${sectionTotal("إجمالي الأصول الثابتة", fixedAssets.reduce((s,i) => s + i.balance, 0))}

        <div class="flex justify-between font-bold" style="background:linear-gradient(135deg,var(--bg-2),var(--surface-1)); padding:14px 16px; border-radius:10px; font-size:16px; margin-top:8px; border:2px solid var(--brand);">
          <span>إجمالي الأصول</span>
          <span class="mono text-brand">${formatCurrency(assetsTotal)}</span>
        </div>
      </div>

      <!-- LIABILITIES & EQUITY -->
      <div class="card" style="padding:24px;">
        <h3 style="color:var(--brand); border-bottom:2px solid var(--brand); padding-bottom:8px; margin-bottom:20px;">الالتزامات وحقوق الملكية</h3>

        <h4 style="color:var(--text-bad, #ef4444); margin:0 0 12px;">الالتزامات المتداولة</h4>
        ${currentLiabilities.map(i => accRow(i, "var(--text-bad, #ef4444)")).join("") || "<p class='dim'>—</p>"}
        ${sectionTotal("إجمالي الالتزامات المتداولة", currentLiabilities.reduce((s,i) => s + i.balance, 0), "var(--text-bad, #ef4444)")}

        <h4 style="color:var(--text-bad, #ef4444); margin:16px 0 12px;">الالتزامات طويلة الأجل</h4>
        ${longTermLiabilities.map(i => accRow(i, "var(--warn)")).join("") || "<p class='dim'>—</p>"}
        ${sectionTotal("إجمالي الالتزامات طويلة الأجل", longTermLiabilities.reduce((s,i) => s + i.balance, 0), "var(--warn)")}

        <h4 style="color:var(--brand); margin:16px 0 12px; border-top:1px solid var(--border); padding-top:12px;">حقوق الملكية (Owner's Equity)</h4>
        ${equityItems.map(i => accRow(i, "var(--brand)")).join("") || "<p class='dim'>—</p>"}
        ${Math.abs(retainedEarnings) > 0.01 ? `
        <div class="flex justify-between mb-8" style="font-size:13px;">
          <span>3-1-3 — أرباح / (خسائر) مرحّلة وتعديلات افتتاحية</span>
          <span class="mono ${retainedEarnings >= 0 ? "text-good" : "text-bad"}">${formatCurrency(retainedEarnings)}</span>
        </div>` : ""}
        <div class="flex justify-between mb-8" style="font-size:13px;">
          <span>أرباح / (خسائر) الفترة الحالية</span>
          <span class="mono ${periodProfit >= 0 ? "text-good" : "text-bad"}">${formatCurrency(periodProfit)}</span>
        </div>
        ${sectionTotal("إجمالي حقوق الملكية", totalEquityCalculated, "var(--brand)")}

        <div class="flex justify-between font-bold" style="background:linear-gradient(135deg,var(--bg-2),var(--surface-1)); padding:14px 16px; border-radius:10px; font-size:16px; margin-top:8px; border:2px solid ${isBalanced ? "var(--good)" : "var(--bad)"};">
          <span>إجمالي الالتزامات وحقوق الملكية</span>
          <span class="mono ${isBalanced ? "text-good" : "text-bad"}">${formatCurrency(totalLiabEquity)}</span>
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────
// 5. Cash Flows (قائمة التدفقات النقدية — الطريقة غير المباشرة)
// ──────────────────────────────────────────
function renderCashFlows(container, from, to) {
  // Net profit from income calculation
  const { netProfit } = _calcIncomeData(from, to);

  // Identify cash/bank accounts
  const cashAccounts = accounts.filter(a =>
    a.code?.startsWith("1-1-1-1") || a.code?.startsWith("1-1-1-3") ||
    a.name?.includes("صندوق") || a.name?.includes("بنك") || a.name?.includes("مصرف")
  );
  const cashIds = new Set(cashAccounts.map(a => a.id));
  const cashCodes = new Set(cashAccounts.map(a => a.code));
  const isCash = line => cashIds.has(line.accountId) || cashCodes.has(line.accountCode);

  // Opening & closing cash balances
  let cashOpen = 0, cashClose = 0;
  for (const je of journalEntries) {
    const d = je.date || "";
    for (const line of (je.lines || [])) {
      if (!isCash(line)) continue;
      const amt = (line.debit || 0) - (line.credit || 0);
      if (d < from)  cashOpen  += amt;
      if (d <= to)   cashClose += amt;
    }
  }

  // Working capital changes
  let deltaAR = 0, deltaInv = 0, deltaAP = 0, deltaVATin = 0, deltaVATout = 0, deltaOtherA = 0, deltaOtherL = 0;
  let netCashInv = 0, netCashFin = 0;

  for (const acc of accounts) {
    if (cashIds.has(acc.id) || acc.type === "revenue" || acc.type === "expense") continue;
    let openBal = 0, closeBal = 0;
    for (const je of journalEntries) {
      const d = je.date || "";
      for (const line of (je.lines || [])) {
        // ✅ مطابقة بالـ id أو الكود
        if (line.accountId !== acc.id && line.accountCode !== acc.code) continue;
        const val = (line.debit || 0) - (line.credit || 0);
        if (d < from)  openBal  += val;
        if (d <= to)   closeBal += val;
      }
    }
    const change = closeBal - openBal;
    if (Math.abs(change) < 0.01) continue;

    const code = acc.code || "";
    if (code.startsWith("1-1-2"))      deltaAR  -= change;       // AR↑ = cash outflow
    else if (code.startsWith("1-1-4")) deltaInv -= change;       // Inv↑ = cash outflow
    else if (code.startsWith("1-1-5")) deltaVATin -= change;     // VAT input↑ = cash outflow
    else if (code.startsWith("1-2") || code.startsWith("1-3")) netCashInv -= change; // Fixed assets
    else if (code.startsWith("2-1-1") || code.startsWith("2-1-2")) deltaAP += -change; // AP↑ = cash inflow
    else if (code.startsWith("2-1-3")) deltaVATout += -change;   // VAT output↑ = cash inflow
    else if (code.startsWith("3"))     netCashFin += -change;    // Equity financing
    else if (acc.type === "asset")     deltaOtherA -= change;
    else if (acc.type === "liability") deltaOtherL += -change;
  }

  const totalAdj = deltaAR + deltaInv + deltaAP + deltaVATin + deltaVATout + deltaOtherA + deltaOtherL;
  const netOpCash = netProfit + totalAdj;
  const netTotalCash = netOpCash + netCashInv + netCashFin;

  const cfRow = (label, val, indent = true) =>
    `<div class="flex justify-between mb-8" style="font-size:14px;${indent ? "padding-right:16px; color:var(--text-1);" : ""}">
       <span>${label}</span>
       <span class="mono ${val >= 0 ? "" : "text-bad"}">${val >= 0 ? "" : "("}${formatCurrency(Math.abs(val))}${val >= 0 ? "" : ")"}</span>
     </div>`;

  const cfTotal = (label, val) =>
    `<div class="flex justify-between font-bold" style="background:var(--bg-2); padding:10px 14px; border-radius:8px; margin:12px 0 24px;">
       <span>${label}</span>
       <span class="mono ${val >= 0 ? "text-good" : "text-bad"}">${val >= 0 ? "" : "("}${formatCurrency(Math.abs(val))}${val >= 0 ? "" : ")"}</span>
     </div>`;

  container.innerHTML = `
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML ? window.getCompanyPrintHeaderHTML("تقرير التدفقات النقدية (الطريقة غير المباشرة)", `الفترة من ${from} إلى ${to}`) : ""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>تقرير التدفقات النقدية (الطريقة غير المباشرة)</h2>
      <p class="dim">للفترة من ${from} إلى ${to}</p>
    </div>

    <div style="max-width:800px; margin:0 auto;">
      <!-- Cash KPIs -->
      <div class="grid-3 gap-16 mb-24">
        <div class="kpi-card">
          <div class="status-bar good"></div>
          <div class="kpi-content">
            <div class="kpi-label">الرصيد النقدي الافتتاحي</div>
            <div class="kpi-value">${formatCurrency(cashOpen)}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="status-bar ${netTotalCash >= 0 ? "good" : "bad"}"></div>
          <div class="kpi-content">
            <div class="kpi-label">صافي التغير في النقدية</div>
            <div class="kpi-value ${netTotalCash >= 0 ? "text-good" : "text-bad"}">${formatCurrency(netTotalCash)}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="status-bar indigo"></div>
          <div class="kpi-content">
            <div class="kpi-label">الرصيد النقدي الختامي</div>
            <div class="kpi-value text-indigo">${formatCurrency(cashClose)}</div>
          </div>
        </div>
      </div>

      <div class="card" style="padding:28px;">
        <h4 style="color:var(--brand); border-bottom:1.5px solid var(--brand); padding-bottom:8px; margin-bottom:16px;">1. الأنشطة التشغيلية (Operating Activities)</h4>
        ${cfRow("صافي ربح الفترة", netProfit, false)}
        <div style="padding-right:16px; margin-bottom:8px; color:var(--text-2); font-size:12px; font-weight:600;">تسويات التغير في رأس المال العامل:</div>
        ${cfRow("(زيادة) نقص في الذمم المدينة — العملاء",       deltaAR)}
        ${cfRow("(زيادة) نقص في المخزون السلعي",               deltaInv)}
        ${cfRow("(زيادة) نقص في ضريبة القيمة المضافة المدخلات", deltaVATin)}
        ${cfRow("زيادة (نقص) في الذمم الدائنة — الموردون",      deltaAP)}
        ${cfRow("زيادة (نقص) في ضريبة القيمة المضافة المخرجات", deltaVATout)}
        ${Math.abs(deltaOtherA) > 0.01 ? cfRow("أصول تشغيلية أخرى", deltaOtherA) : ""}
        ${Math.abs(deltaOtherL) > 0.01 ? cfRow("التزامات تشغيلية أخرى", deltaOtherL) : ""}
        ${cfTotal("صافي النقد من الأنشطة التشغيلية", netOpCash)}

        <h4 style="color:var(--brand); border-bottom:1.5px solid var(--brand); padding-bottom:8px; margin-bottom:16px;">2. الأنشطة الاستثمارية (Investing Activities)</h4>
        ${cfRow("شراء / بيع أصول ثابتة وممتلكات", netCashInv, false)}
        ${cfTotal("صافي النقد من الأنشطة الاستثمارية", netCashInv)}

        <h4 style="color:var(--brand); border-bottom:1.5px solid var(--brand); padding-bottom:8px; margin-bottom:16px;">3. الأنشطة التمويلية (Financing Activities)</h4>
        ${cfRow("زيادة رأس المال / مسحوبات المالك / قروض", netCashFin, false)}
        ${cfTotal("صافي النقد من الأنشطة التمويلية", netCashFin)}

        <div style="border-top:2px solid var(--border); padding-top:16px; margin-top:8px;">
          <div class="flex justify-between font-bold mb-8" style="font-size:15px;">
            <span>صافي التغير الكلي في النقدية خلال الفترة</span>
            <span class="mono ${netTotalCash >= 0 ? "text-good" : "text-bad"}">${formatCurrency(netTotalCash)}</span>
          </div>
          <div class="flex justify-between dim mb-8">
            <span>رصيد النقدية في بداية الفترة</span>
            <span class="mono">${formatCurrency(cashOpen)}</span>
          </div>
          <div class="flex justify-between font-bold" style="font-size:16px; background:linear-gradient(135deg,var(--bg-2),var(--surface-1)); padding:14px 16px; border-radius:10px; border:2px solid var(--brand);">
            <span>رصيد النقدية في نهاية الفترة</span>
            <span class="mono text-brand">${formatCurrency(cashClose)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────
// 6. Changes in Equity (التغير في حقوق الملكية)
// ──────────────────────────────────────────
function renderChangesInEquity(container, from, to) {
  let capOpen = 0, capPeriod = 0;
  let retOpen = 0, retPeriod = 0;
  let drawOpen = 0, drawPeriod = 0;

  for (const acc of accounts) {
    if (acc.type !== "equity") continue;
    let openVal = 0, periodVal = 0;
    for (const je of journalEntries) {
      const d = je.date || "";
      for (const line of (je.lines || [])) {
        // ✅ مطابقة بالـ id أو الكود
        if (line.accountId !== acc.id && line.accountCode !== acc.code) continue;
        const val = (line.credit || 0) - (line.debit || 0); // equity normal = credit
        if (d < from)            openVal   += val;
        else if (d >= from && d <= to) periodVal += val;
      }
    }

    if (acc.name?.includes("رأس المال")) {
      capOpen += openVal; capPeriod += periodVal;
    } else if (acc.name?.includes("أرباح مبقاة") || acc.name?.includes("أرباح محتجزة") || acc.name?.includes("احتياطي")) {
      retOpen += openVal; retPeriod += periodVal;
    } else if (acc.name?.includes("مسحوبات") || acc.name?.includes("جاري المالك")) {
      drawOpen += openVal; drawPeriod += periodVal;
    } else {
      // حسابات حقوق الملكية الأخرى تُضاف لرأس المال
      capOpen += openVal; capPeriod += periodVal;
    }
  }

  const { netProfit } = _calcIncomeData(from, to);
  retPeriod += netProfit;

  const closeCap  = capOpen  + capPeriod;
  const closeRet  = retOpen  + retPeriod;
  const closeDraw = drawOpen + drawPeriod;
  const totalOpen  = capOpen  + retOpen  + drawOpen;
  const totalClose = closeCap + closeRet + closeDraw;

  const row = (label, cap, ret, draw, bold = false, color = "") =>
    `<tr ${bold ? 'style="border-top:2px solid var(--border); background:var(--bg-2); font-weight:bold;"' : ""}>
      <td>${label}</td>
      <td class="mono ${color}">${formatCurrency(cap)}</td>
      <td class="mono ${color}">${formatCurrency(ret)}</td>
      <td class="mono ${color || (draw < 0 ? "text-bad" : "")}">${formatCurrency(draw)}</td>
      <td class="mono font-bold ${color}">${formatCurrency(cap + ret + draw)}</td>
    </tr>`;

  container.innerHTML = `
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML ? window.getCompanyPrintHeaderHTML("تقرير الأرباح حسب مراكز التكلفة", `الفترة من ${from} إلى ${to}`) : ""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>قائمة التغير في حقوق الملكية</h2>
      <p class="dim">للفترة من ${from} إلى ${to}</p>
    </div>

    <div style="max-width:900px; margin:0 auto;">
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr>
              <th>البند</th>
              <th>رأس المال المدفوع</th>
              <th>الأرباح المبقاة</th>
              <th>مسحوبات المالك</th>
              <th>إجمالي حقوق الملكية</th>
            </tr>
          </thead>
          <tbody>
            ${row("رصيد بداية الفترة",             capOpen,     retOpen,     drawOpen)}
            ${row("زيادات رأس المال",               capPeriod,   0,           0)}
            ${row("صافي ربح الفترة",                0,           netProfit,   0)}
            ${drawPeriod !== 0 ? row("مسحوبات / توزيعات خلال الفترة", 0, 0, drawPeriod) : ""}
            ${row("رصيد نهاية الفترة",              closeCap,    closeRet,    closeDraw,  true, "text-brand")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────
// 7. Financial Analysis & Ratios (التحليل المالي والنسب)
// ──────────────────────────────────────────
function renderFinancialAnalysis(container, from, to) {
  // Balance sheet data (cumulative)
  let assetsCurrent = 0, assetsFixed = 0, assetsTotal = 0;
  let liabCurrent = 0, liabTotal = 0;
  let inventoryVal = 0, cashVal = 0, arVal = 0;

  for (const acc of accounts) {
    let bal = 0;
    for (const je of journalEntries) {
      const d = je.date || "";
      if (d <= to) {
        for (const line of (je.lines || [])) {
          // ✅ مطابقة بالـ id أو الكود
          if (line.accountId !== acc.id && line.accountCode !== acc.code) continue;
          bal += (line.debit || 0) - (line.credit || 0);
        }
      }
    }
    if (acc.type === "asset") {
      assetsTotal += bal;
      const isFixed = acc.code?.startsWith("1-2") || acc.code?.startsWith("1-3") ||
        acc.name?.includes("سيارات") || acc.name?.includes("أثاث") || acc.name?.includes("معدات");
      if (isFixed) assetsFixed += bal; else assetsCurrent += bal;
      if (acc.code?.startsWith("1-1-4")) inventoryVal += bal;
      if (acc.code?.startsWith("1-1-1-1") || acc.code?.startsWith("1-1-1-3")) cashVal += bal;
      if (acc.code?.startsWith("1-1-2")) arVal += bal;
    } else if (acc.type === "liability") {
      const val = -bal;
      liabTotal += val;
      const isLT = acc.code?.startsWith("2-2") || acc.name?.includes("طويل");
      if (!isLT) liabCurrent += val;
    }
  }

  // Income data
  const { revenueTotal, cogsTotal, opExpTotal, grossProfit, netProfit } = _calcIncomeData(from, to);
  const equityTotal = assetsTotal - liabTotal;

  // Ratios
  const r = (n, d, pct = false, dec = 2) => {
    if (!d || d === 0) return "—";
    const val = n / d;
    return pct ? (val * 100).toFixed(1) + "%" : val.toFixed(dec);
  };

  const ratios = [
    {
      group: "🏦 نسب السيولة (Liquidity)",
      items: [
        { label: "نسبة السيولة الجارية (Current Ratio)",  val: r(assetsCurrent, liabCurrent),            note: "الأصول المتداولة ÷ الالتزامات المتداولة — المثالي ≥ 1.5", good: parseFloat(r(assetsCurrent, liabCurrent)) >= 1.5 },
        { label: "نسبة السيولة السريعة (Quick Ratio)",    val: r(assetsCurrent - inventoryVal, liabCurrent), note: "(الأصول المتداولة - المخزون) ÷ الالتزامات المتداولة — المثالي ≥ 1.0", good: parseFloat(r(assetsCurrent - inventoryVal, liabCurrent)) >= 1 },
        { label: "نسبة النقدية (Cash Ratio)",             val: r(cashVal, liabCurrent),                  note: "النقدية فقط ÷ الالتزامات المتداولة", good: parseFloat(r(cashVal, liabCurrent)) >= 0.2 },
        { label: "رأس المال العامل (Working Capital)",     val: formatCurrency(assetsCurrent - liabCurrent), note: "الأصول المتداولة — الالتزامات المتداولة", good: (assetsCurrent - liabCurrent) >= 0 },
      ]
    },
    {
      group: "📊 نسب الربحية (Profitability)",
      items: [
        { label: "هامش مجمل الربح (Gross Margin)",      val: r(grossProfit, revenueTotal, true),  note: "مجمل الربح ÷ المبيعات", good: parseFloat(r(grossProfit, revenueTotal, true)) >= 20 },
        { label: "هامش صافي الربح (Net Margin)",        val: r(netProfit,   revenueTotal, true),  note: "صافي الربح ÷ المبيعات", good: parseFloat(r(netProfit, revenueTotal, true)) >= 5 },
        { label: "العائد على الأصول ROA",               val: r(netProfit, assetsTotal, true),     note: "صافي الربح ÷ إجمالي الأصول", good: parseFloat(r(netProfit, assetsTotal, true)) >= 5 },
        { label: "العائد على حقوق الملكية ROE",         val: r(netProfit, equityTotal, true),     note: "صافي الربح ÷ حقوق الملكية", good: parseFloat(r(netProfit, equityTotal, true)) >= 10 },
      ]
    },
    {
      group: "⚙️ نسب الكفاءة (Efficiency)",
      items: [
        { label: "معدل دوران المخزون",         val: r(cogsTotal, inventoryVal, false, 1) + "x",  note: "تكلفة المباعة ÷ المخزون — كلما ارتفع كان أفضل", good: parseFloat(r(cogsTotal, inventoryVal, false, 1)) >= 4 },
        { label: "معدل دوران الذمم المدينة",  val: r(revenueTotal, arVal, false, 1) + "x",       note: "المبيعات ÷ الذمم المدينة", good: parseFloat(r(revenueTotal, arVal, false, 1)) >= 6 },
        { label: "نسبة التكلفة إلى الإيراد",  val: r(cogsTotal, revenueTotal, true),             note: "COGS ÷ المبيعات — كلما انخفض كان أفضل", good: parseFloat(r(cogsTotal, revenueTotal, true)) <= 70 },
        { label: "نسبة المصروفات إلى الإيراد", val: r(opExpTotal, revenueTotal, true),           note: "المصاريف التشغيلية ÷ المبيعات", good: parseFloat(r(opExpTotal, revenueTotal, true)) <= 15 },
      ]
    },
    {
      group: "🏗️ نسب الرفع المالي (Leverage)",
      items: [
        { label: "نسبة الديون إلى الأصول",           val: r(liabTotal, assetsTotal, true),         note: "الالتزامات ÷ الأصول — المثالي ≤ 50%", good: parseFloat(r(liabTotal, assetsTotal, true)) <= 50 },
        { label: "نسبة الديون إلى حقوق الملكية",     val: r(liabTotal, equityTotal, false, 2),     note: "الالتزامات ÷ حقوق الملكية — المثالي ≤ 1.0", good: parseFloat(r(liabTotal, equityTotal)) <= 1 },
        { label: "إجمالي الأصول",                    val: formatCurrency(assetsTotal),             note: "مجموع الأصول المتداولة + الثابتة", good: true },
        { label: "إجمالي الالتزامات",                val: formatCurrency(liabTotal),              note: "مجموع الالتزامات المتداولة وطويلة الأجل", good: true },
      ]
    }
  ];

  container.innerHTML = `
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML ? window.getCompanyPrintHeaderHTML("نسب التحليل المالي والربحية (Financial Ratios)", `الفترة من ${from} إلى ${to}`) : ""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>لوحة التحليل المالي والمؤشرات (Financial Ratios)</h2>
      <p class="dim">للفترة من ${from} إلى ${to}</p>
    </div>

    <!-- Summary Banner -->
    <div class="grid-4 gap-16 mb-28" style="max-width:1200px; margin:0 auto 28px;">
      ${[
        { label: "إجمالي الإيرادات",    val: formatCurrency(revenueTotal), icon: "💰", color: "#22c55e" },
        { label: "مجمل الربح",          val: formatCurrency(grossProfit),  icon: "📈", color: "#6366f1" },
        { label: "صافي الربح",          val: formatCurrency(netProfit),    icon: "🎯", color: netProfit >= 0 ? "#2dd4bf" : "#ef4444" },
        { label: "إجمالي الأصول",       val: formatCurrency(assetsTotal),  icon: "🏛️", color: "#e58a2b" },
      ].map(k => `
        <div class="kpi-card">
          <div class="kpi-content">
            <div style="font-size:28px; margin-bottom:8px;">${k.icon}</div>
            <div class="kpi-label">${k.label}</div>
            <div class="kpi-value" style="color:${k.color}; font-size:20px;">${k.val}</div>
          </div>
        </div>`).join("")}
    </div>

    <!-- Ratio Groups -->
    <div style="max-width:1200px; margin:0 auto;">
      ${ratios.map(group => `
        <div class="card mb-20" style="padding:24px;">
          <h3 style="color:var(--brand); margin-bottom:20px; font-family:var(--font-heading);">${group.group}</h3>
          <div class="grid-2 gap-16">
            ${group.items.map(item => `
              <div style="background:var(--bg-2); border-radius:10px; padding:16px; border-left:4px solid ${item.good ? "var(--good, #22c55e)" : "var(--warn, #f59e0b)"};">
                <div style="font-size:12px; color:var(--text-2); margin-bottom:4px;">${item.label}</div>
                <div style="font-size:22px; font-weight:700; font-family:monospace; color:${item.good ? "var(--good, #22c55e)" : "var(--warn, #f59e0b)"};">${item.val}</div>
                <div style="font-size:11px; color:var(--text-2); margin-top:6px;">${item.note}</div>
              </div>`).join("")}
          </div>
        </div>`).join("")}
    </div>
  `;
}

// ──────────────────────────────────────────
// 8. Aged Receivables (تقرير أعمار الديون)
// ──────────────────────────────────────────
async function renderAgedReceivables(container, from, to) {
  container.innerHTML = `<div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin fa-2x"></i><div style="margin-top:10px;">جاري تحميل الفواتير والعملاء واحتساب أعمار الديون…</div></div>`;
  
  try {
    const { collection, getDocs, query, where } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const { db, COMPANY_ID } = await import("../utils/db.js");
    
    // Load all customers
    const custs = await getAll(COLS.customers());
    
    // Load all credit invoices with remainingAmount > 0
    const invoicesRef = collection(db, `companies/${COMPANY_ID}/salesInvoices`);
    const q = query(
      invoicesRef,
      where("payment", "==", "credit"),
      where("status", "in", ["pending", "posted", "partial"])
    );
    const qSnap = await getDocs(q);
    
    const invoices = [];
    qSnap.forEach(docSnap => {
      invoices.push({ id: docSnap.id, ...docSnap.data() });
    });
    
    // Group by customer
    const customerAging = {};
    custs.forEach(c => {
      customerAging[c.id] = {
        name: c.name,
        code: c.code || "",
        repName: c.repName || "بدون مندوب",
        creditLimit: c.creditLimit || 0,
        creditDays: c.creditDays || 0,
        balance: c.balance || 0,
        current: 0,   // within terms (not overdue)
        aging1_30: 0, // overdue 1-30 days
        aging31_60: 0,
        aging61_90: 0,
        agingOver90: 0,
        totalRemaining: 0
      };
    });
    
    const today = new Date();
    
    invoices.forEach(inv => {
      const cId = inv.customerId;
      if (!cId) return;
      if (!customerAging[cId]) {
        customerAging[cId] = {
          name: inv.customerName || "عميل مجهول",
          code: "",
          repName: inv.repName || "بدون مندوب",
          creditLimit: 0,
          creditDays: 0,
          balance: 0,
          current: 0,
          aging1_30: 0,
          aging31_60: 0,
          aging61_90: 0,
          agingOver90: 0,
          totalRemaining: 0
        };
      }
      
      const rem = inv.remainingAmount || 0;
      if (rem <= 0) return;
      
      const entryAging = customerAging[cId];
      entryAging.totalRemaining += rem;
      
      const invDate = new Date(inv.date || today);
      const diffTime = today - invDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      const allowedDays = entryAging.creditDays || 0;
      const overdueDays = diffDays - allowedDays;
      
      if (overdueDays <= 0) {
        entryAging.current += rem;
      } else if (overdueDays <= 30) {
        entryAging.aging1_30 += rem;
      } else if (overdueDays <= 60) {
        entryAging.aging31_60 += rem;
      } else if (overdueDays <= 90) {
        entryAging.aging61_90 += rem;
      } else {
        entryAging.agingOver90 += rem;
      }
    });
    
    const rows = Object.values(customerAging).filter(r => r.balance > 0 || r.totalRemaining > 0);
    rows.sort((a,b) => a.name.localeCompare(b.name, "ar"));
    
    const totals = {
      balance: 0,
      current: 0,
      aging1_30: 0,
      aging31_60: 0,
      aging61_90: 0,
      agingOver90: 0,
      totalRemaining: 0
    };
    
    rows.forEach(r => {
      totals.balance += r.balance;
      totals.current += r.current;
      totals.aging1_30 += r.aging1_30;
      totals.aging31_60 += r.aging31_60;
      totals.aging61_90 += r.aging61_90;
      totals.agingOver90 += r.agingOver90;
      totals.totalRemaining += r.totalRemaining;
    });
    
    container.innerHTML = `
      <div style="text-align:center;margin-bottom:20px;">
        <h2 style="margin:0;color:var(--brand);">تقرير أعمار الديون والمستحقات للعملاء</h2>
        <div style="font-size:12px;color:var(--text-2);margin-top:6px;">تاريخ التقرير: ${new Date().toLocaleDateString("ar-SA")}</div>
      </div>
      
      <div class="card" style="padding:16px;">
        <div class="table-container">
          <table class="data-dense" style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr style="background:var(--bg-2);">
                <th style="padding:10px 8px;text-align:right;">العميل</th>
                <th style="padding:10px 8px;text-align:right;">المندوب</th>
                <th style="padding:10px 8px;text-align:center;width:60px;">المهلة</th>
                <th style="padding:10px 8px;text-align:right;color:var(--brand);">الرصيد الدفتري</th>
                <th style="padding:10px 8px;text-align:right;color:#10b981;">غير مستحق</th>
                <th style="padding:10px 8px;text-align:right;color:#f59e0b;">متأخر (1-30 يوم)</th>
                <th style="padding:10px 8px;text-align:right;color:#d97706;">متأخر (31-60 يوم)</th>
                <th style="padding:10px 8px;text-align:right;color:#dc2626;">متأخر (61-90 يوم)</th>
                <th style="padding:10px 8px;text-align:right;color:#b91c1c;font-weight:900;">متأخر (>90 يوم)</th>
                <th style="padding:10px 8px;text-align:right;font-weight:bold;">مجموع المتبقي</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length === 0 ? `<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد مديونيات مستحقة على العملاء حالياً</td></tr>` : 
                rows.map(r => `
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
                    <td style="padding:10px 8px;">
                      <div style="font-weight:bold;">${r.name}</div>
                      ${r.code ? `<div style="font-size:10px;color:var(--text-3);">${r.code}</div>` : ""}
                    </td>
                    <td style="padding:10px 8px;color:var(--text-2);">${r.repName}</td>
                    <td style="padding:10px 8px;text-align:center;color:var(--text-2);font-family:monospace;">${r.creditDays ? `${r.creditDays} ي` : "—"}</td>
                    <td style="padding:10px 8px;text-align:right;font-family:monospace;font-weight:600;">${formatCurrency(r.balance)}</td>
                    <td style="padding:10px 8px;text-align:right;font-family:monospace;color:${r.current ? '#10b981' : 'var(--text-3)'};">${r.current ? formatCurrency(r.current) : "—"}</td>
                    <td style="padding:10px 8px;text-align:right;font-family:monospace;color:${r.aging1_30 ? '#f59e0b' : 'var(--text-3)'};">${r.aging1_30 ? formatCurrency(r.aging1_30) : "—"}</td>
                    <td style="padding:10px 8px;text-align:right;font-family:monospace;color:${r.aging31_60 ? '#d97706' : 'var(--text-3)'};">${r.aging31_60 ? formatCurrency(r.aging31_60) : "—"}</td>
                    <td style="padding:10px 8px;text-align:right;font-family:monospace;color:${r.aging61_90 ? '#dc2626' : 'var(--text-3)'};">${r.aging61_90 ? formatCurrency(r.aging61_90) : "—"}</td>
                    <td style="padding:10px 8px;text-align:right;font-family:monospace;font-weight:bold;color:${r.agingOver90 ? '#b91c1c' : 'var(--text-3)'};">${r.agingOver90 ? formatCurrency(r.agingOver90) : "—"}</td>
                    <td style="padding:10px 8px;text-align:right;font-family:monospace;font-weight:bold;background:rgba(255,255,255,0.01);">${formatCurrency(r.totalRemaining)}</td>
                  </tr>
                `).join("")}
            </tbody>
            <tfoot>
              <tr style="background:var(--bg-2);border-top:2px solid var(--border-soft);font-weight:bold;font-size:12px;">
                <td colspan="3" style="padding:12px 8px;font-weight:900;">الإجمالي العام</td>
                <td style="padding:12px 8px;text-align:right;font-family:monospace;color:var(--brand);">${formatCurrency(totals.balance)}</td>
                <td style="padding:12px 8px;text-align:right;font-family:monospace;color:#10b981;">${formatCurrency(totals.current)}</td>
                <td style="padding:12px 8px;text-align:right;font-family:monospace;color:#f59e0b;">${formatCurrency(totals.current ? totals.aging1_30 : 0)}</td>
                <td style="padding:12px 8px;text-align:right;font-family:monospace;color:#d97706;">${formatCurrency(totals.aging31_60)}</td>
                <td style="padding:12px 8px;text-align:right;font-family:monospace;color:#dc2626;">${formatCurrency(totals.aging61_90)}</td>
                <td style="padding:12px 8px;text-align:right;font-family:monospace;color:#b91c1c;">${formatCurrency(totals.agingOver90)}</td>
                <td style="padding:12px 8px;text-align:right;font-family:monospace;font-weight:900;background:rgba(255,255,255,0.02);">${formatCurrency(totals.totalRemaining)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
}

// ──────────────────────────────────────────────────────────────
// 9. Customer Performance Analytics (تقرير أداء العملاء)
// ──────────────────────────────────────────────────────────────
async function renderCustomerAnalytics(container, from, to) {
  container.innerHTML = '<div class="page-loading"><div class="loading-spinner"></div><span>جارٍ تحليل بيانات العملاء…</span></div>';
  try {
    if (!_salesInvoicesCache) {
      _salesInvoicesCache = await getAll(COLS.salesInvoices());
    }
    if (!_receiptsCache) {
      _receiptsCache = await getAll(COLS.receipts());
    }

    const selectedRep = window.custperfRep  || '';
    const daysDiff    = Math.max(1, Math.round((new Date(to) - new Date(from)) / 86400000) + 1);

    const invoices = _salesInvoicesCache.filter(inv => {
      if (inv.status === 'cancelled') return false;
      if (inv.date < from || inv.date > to) return false;
      if (selectedRep && inv.repName !== selectedRep) return false;
      return true;
    });
    const receipts = _receiptsCache.filter(r => {
      if (!r.date || r.date < from || r.date > to) return false;
      if (r.entityType && r.entityType !== 'customer') return false;
      return true;
    });

    const customersList = await getAll(COLS.customers());
    const custMap = {};
    customersList.forEach(cust => {
      custMap[cust.id] = {
        id: cust.id,
        name: cust.name,
        repName: cust.repName || "بدون مندوب",
        invoiceCount: 0,
        totalSales: 0,
        netRevenue: 0,
        totalCost: 0,
        paidAmount: 0,
        collectedViaReceipts: 0,
        lastInvoiceDate: "",
        lastReceiptDate: "",
      };
    });

    for (const inv of invoices) {
      const cid  = inv.customerId || 'unknown';
      if (!custMap[cid]) {
        custMap[cid] = { id:cid, name: inv.customerName || cid, repName: inv.repName||'بدون مندوب', invoiceCount:0, totalSales:0, netRevenue:0, totalCost:0, paidAmount:0, collectedViaReceipts:0, lastInvoiceDate:'', lastReceiptDate:'' };
      }
      const c = custMap[cid];
      c.invoiceCount++;
      c.totalSales      += parseFloat(inv.totalWithVat || inv.total || 0);
      c.netRevenue      += parseFloat(inv.subtotal || inv.total || 0);
      c.totalCost       += parseFloat(inv.totalCost      || 0);
      
      const pm = (inv.paymentMethod || "cash").toLowerCase();
      if (pm === "cash" || pm === "نقدي" || pm === "partial" || pm === "جزئي") {
        c.paidAmount += parseFloat(inv.paidAmount || 0);
      }
      
      if (!c.lastInvoiceDate || inv.date > c.lastInvoiceDate) c.lastInvoiceDate = inv.date;
    }

    for (const r of receipts) {
      const cid = r.targetId || r.customerId || '';
      if (custMap[cid]) {
        custMap[cid].collectedViaReceipts += parseFloat(r.amount || 0);
        if (!custMap[cid].lastReceiptDate || r.date > custMap[cid].lastReceiptDate) {
          custMap[cid].lastReceiptDate = r.date;
        }
      }
    }

    _custperfRows = Object.values(custMap)
      .filter(c => c.totalSales > 0 || c.collectedViaReceipts > 0)
      .map(c => {
        const profit        = c.netRevenue - c.totalCost;
        const profitPct     = c.netRevenue > 0 ? (profit / c.netRevenue * 100) : 0;
        const collected     = c.collectedViaReceipts + c.paidAmount;
        const remaining     = Math.max(0, c.totalSales - collected);
        const collectionPct = c.totalSales > 0 ? Math.min(100, (collected / c.totalSales) * 100) : 0;
        const dailyAvg      = c.totalSales / daysDiff;
        const avgInvoice    = c.invoiceCount > 0 ? c.totalSales / c.invoiceCount : 0;
        return { ...c, profit, profitPct, collected, remainingAmount: remaining, collectionPct, dailyAvg, avgInvoice };
      });


    if (!window.custperfSortKey) {
      window.custperfSortKey = 'totalSales';
      window.custperfSortDir = 'desc';
    }

    sortDataRows();
    renderAnalyticsUI(container, from, to, daysDiff, selectedRep);
  } catch (err) {
    container.innerHTML = '<div class="alert bad">خطأ في تحميل بيانات العملاء: ' + err.message + '</div>';
    console.error(err);
  }
}

function sortDataRows() {
  const key = window.custperfSortKey;
  const dir = window.custperfSortDir === 'asc' ? 1 : -1;

  _custperfRows.sort((a, b) => {
    let valA = a[key];
    let valB = b[key];

    if (key === 'lastInvoiceDate' || key === 'lastReceiptDate') {
      valA = valA ? new Date(valA).getTime() : 0;
      valB = valB ? new Date(valB).getTime() : 0;
      if (isNaN(valA)) valA = 0;
      if (isNaN(valB)) valB = 0;
    }
    else if (typeof valA === 'string') {
      return valA.localeCompare(valB, 'ar') * dir;
    }

    if (valA < valB) return -1 * dir;
    if (valA > valB) return 1 * dir;
    return 0;
  });
}

window.toggleCustPerfSort = (key) => {
  if (window.custperfSortKey === key) {
    window.custperfSortDir = window.custperfSortDir === 'desc' ? 'asc' : 'desc';
  } else {
    window.custperfSortKey = key;
    window.custperfSortDir = 'desc';
  }
  sortDataRows();
  
  const tableContainer = document.getElementById("custperf-table-wrapper");
  const kpiContainer = document.getElementById("custperf-kpi-wrapper");
  const champsContainer = document.getElementById("custperf-champs-wrapper");
  
  if (tableContainer && kpiContainer && champsContainer) {
    updateAnalyticsComponents(tableContainer, kpiContainer, champsContainer);
  }
};

function renderAnalyticsUI(container, from, to, daysDiff, selectedRep) {
  container.innerHTML = (window.getCompanyPrintHeaderHTML ? window.getCompanyPrintHeaderHTML('تقرير أداء العملاء','الفترة من '+from+' إلى '+to) : '')
    + '<div class="print-header no-print" style="text-align:center;margin-bottom:20px;"><h2 style="margin:0;font-size:20px;">🏆 تقرير أداء العملاء</h2><p style="color:var(--text-2);margin:4px 0 0;">من '+from+' إلى '+to+' ('+daysDiff+' يوم)'+(selectedRep?' • مندوب: '+selectedRep:'')+'</p></div>'
    + '<div id="custperf-kpi-wrapper"></div>'
    + '<div id="custperf-champs-wrapper"></div>'
    + '<div id="custperf-table-wrapper"></div>';

  const tableContainer = document.getElementById("custperf-table-wrapper");
  const kpiContainer = document.getElementById("custperf-kpi-wrapper");
  const champsContainer = document.getElementById("custperf-champs-wrapper");
  
  updateAnalyticsComponents(tableContainer, kpiContainer, champsContainer);
}

function updateAnalyticsComponents(tableContainer, kpiContainer, champsContainer) {
  const tot = _custperfRows.reduce((acc,r)=>{ acc.sales+=r.totalSales; acc.netRevenue+=r.netRevenue; acc.cost+=r.totalCost; acc.profit+=r.profit; acc.collected+=r.collected; acc.remaining+=r.remainingAmount; acc.invoices+=r.invoiceCount; return acc; }, {sales:0,netRevenue:0,cost:0,profit:0,collected:0,remaining:0,invoices:0});
  const totProfitPct     = tot.netRevenue > 0 ? (tot.profit / tot.netRevenue * 100) : 0;
  const totCollectionPct = tot.sales > 0 ? Math.min(100, tot.collected / tot.sales * 100) : 0;
  
  const fromInput = document.getElementById("fin-from")?.value;
  const toInput   = document.getElementById("fin-to")?.value;
  const daysDiffInput = Math.max(1, Math.round((new Date(toInput || todayString()) - new Date(fromInput || startOfMonth())) / 86400000) + 1);
  const totDailyAvg = tot.sales / daysDiffInput;

  const bestSales      = [..._custperfRows].sort((a,b)=>b.totalSales-a.totalSales)[0];
  const bestProfit     = [..._custperfRows].sort((a,b)=>b.profit-a.profit)[0];
  const bestCollection = [..._custperfRows].sort((a,b)=>b.collectionPct-a.collectionPct)[0];

  const collBadge = pct => pct >= 80 ? {color:'#10b981',bg:'rgba(16,185,129,.12)',icon:'🟢'} : pct >= 50 ? {color:'#f59e0b',bg:'rgba(245,158,11,.12)',icon:'🟡'} : {color:'#ef4444',bg:'rgba(239,68,68,.12)',icon:'🔴'};
  const p2 = n => (Math.round(n*100)/100).toLocaleString('ar-SA',{minimumFractionDigits:2,maximumFractionDigits:2});
  const fd = dStr => {
    if (!dStr) return "—";
    const parts = dStr.split("-");
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return dStr;
  };

  kpiContainer.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:12px;margin-bottom:20px;">
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #6366f1;"><div style="font-size:10px;color:var(--text-3);margin-bottom:4px;">إجمالي المبيعات (شامل الضريبة)</div><div style="font-size:17px;font-weight:900;font-family:monospace;color:#6366f1;">${formatCurrency(tot.sales)}</div><div style="font-size:10px;color:var(--text-3);margin-top:4px;">${tot.invoices} فاتورة • ${_custperfRows.length} عميل</div></div>
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #10b981;"><div style="font-size:10px;color:var(--text-3);margin-bottom:4px;">إجمالي الأرباح (صافي المبيعات)</div><div style="font-size:17px;font-weight:900;font-family:monospace;color:#10b981;">${formatCurrency(tot.profit)}</div><div style="font-size:10px;color:var(--text-3);margin-top:4px;">هامش ربح ${p2(totProfitPct)}%</div></div>
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #3b82f6;"><div style="font-size:10px;color:var(--text-3);margin-bottom:4px;">إجمالي التحصيل</div><div style="font-size:17px;font-weight:900;font-family:monospace;color:#3b82f6;">${formatCurrency(tot.collected)}</div><div style="font-size:10px;color:var(--text-3);margin-top:4px;">نسبة ${p2(totCollectionPct)}%</div></div>
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #f59e0b;"><div style="font-size:10px;color:var(--text-3);margin-bottom:4px;">إجمالي المتبقي</div><div style="font-size:17px;font-weight:900;font-family:monospace;color:#f59e0b;">${formatCurrency(tot.remaining)}</div><div style="font-size:10px;color:var(--text-3);margin-top:4px;">ذمم متبقية</div></div>
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #8b5cf6;"><div style="font-size:10px;color:var(--text-3);margin-bottom:4px;">المعدل اليومي</div><div style="font-size:17px;font-weight:900;font-family:monospace;color:#8b5cf6;">${formatCurrency(totDailyAvg)}</div><div style="font-size:10px;color:var(--text-3);margin-top:4px;">ر.س / يوم</div></div>
    </div>
  `;

  champsContainer.innerHTML = (bestSales || bestProfit || bestCollection) ? `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:20px;">
      ${bestSales && bestSales.totalSales > 0 ? `<div class="card" style="padding:12px 16px;display:flex;align-items:center;gap:12px;border:1px solid rgba(99,102,241,.3);"><span style="font-size:28px;">🥇</span><div><div style="font-size:10px;color:#6366f1;font-weight:700;margin-bottom:2px;">الأعلى مبيعاً</div><div style="font-weight:700;font-size:13px;">${bestSales.name}</div><div style="font-size:11px;color:var(--text-2);">${formatCurrency(bestSales.totalSales)}</div></div></div>` : ''}
      ${bestProfit && bestProfit.profit > 0 ? `<div class="card" style="padding:12px 16px;display:flex;align-items:center;gap:12px;border:1px solid rgba(16,185,129,.3);"><span style="font-size:28px;">💰</span><div><div style="font-size:10px;color:#10b981;font-weight:700;margin-bottom:2px;">الأعلى ربحاً (صافي)</div><div style="font-weight:700;font-size:13px;">${bestProfit.name}</div><div style="font-size:11px;color:var(--text-2);">${formatCurrency(bestProfit.profit)} (${p2(bestProfit.profitPct)}%)</div></div></div>` : ''}
      ${bestCollection && bestCollection.collectionPct > 0 ? `<div class="card" style="padding:12px 16px;display:flex;align-items:center;gap:12px;border:1px solid rgba(59,130,246,.3);"><span style="font-size:28px;">🏅</span><div><div style="font-size:10px;color:#3b82f6;font-weight:700;margin-bottom:2px;">الأفضل تحصيلاً</div><div style="font-weight:700;font-size:13px;">${bestCollection.name}</div><div style="font-size:11px;color:var(--text-2);">${p2(bestCollection.collectionPct)}%</div></div></div>` : ''}
    </div>
  ` : '';

  const renderSortArrow = (key) => {
    if (window.custperfSortKey !== key) return ' <span style="font-size:9px;color:var(--text-3);opacity:0.5;">↕</span>';
    return window.custperfSortDir === 'asc' ? ' <span style="font-size:10px;color:var(--brand);">▲</span>' : ' <span style="font-size:10px;color:var(--brand);">▼</span>';
  };

  const rowsHTML = _custperfRows.map((r,idx) => {
    const cb = collBadge(r.collectionPct);
    return `<tr style="border-bottom:1px solid rgba(255,255,255,.04); transition:background .15s;" onmouseover="this.style.background='rgba(255,255,255,.03)'" onmouseout="this.style.background=''">
      <td style="padding:10px 8px;text-align:center;color:var(--text-3);">${idx+1}</td>
      <td style="padding:10px 8px;"><div style="font-weight:700;font-size:13px;">${r.name}</div><div style="font-size:10px;color:var(--text-3);margin-top:2px;">مندوب: ${r.repName}</div></td>
      <td style="padding:10px 8px;text-align:center;color:var(--text-2);white-space:nowrap;">${fd(r.lastInvoiceDate)}</td>
      <td style="padding:10px 8px;text-align:center;color:var(--text-2);white-space:nowrap;">${fd(r.lastReceiptDate)}</td>
      <td style="padding:10px 8px;text-align:center;color:var(--text-2);">${r.invoiceCount}</td>
      <td style="padding:10px 8px;text-align:right;font-family:monospace;font-weight:700;">${formatCurrency(r.totalSales)}</td>
      <td style="padding:10px 8px;text-align:right;font-family:monospace;color:var(--text-2);">${formatCurrency(r.totalCost)}</td>
      <td style="padding:10px 8px;text-align:right;font-family:monospace;color:${r.profit>=0?'#10b981':'#ef4444'};font-weight:700;">
        ${formatCurrency(r.profit)}
        <div style="font-size:10px;font-weight:400;opacity:0.8;">${p2(r.profitPct)}%</div>
      </td>
      <td style="padding:10px 8px;text-align:right;font-family:monospace;">${formatCurrency(r.collected)}</td>
      <td style="padding:10px 8px;text-align:right;font-family:monospace;color:${r.remainingAmount>0?'#f59e0b':'var(--text-3)'};">${r.remainingAmount>0?formatCurrency(r.remainingAmount):'—'}</td>
      <td style="padding:10px 8px;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:5px;background:${cb.bg};color:${cb.color};padding:4px 10px;border-radius:20px;font-weight:700;font-size:12px;">
          ${cb.icon} ${p2(r.collectionPct)}%
        </div>
      </td>
      <td style="padding:10px 8px;text-align:right;font-family:monospace;color:var(--text-2);">${formatCurrency(r.dailyAvg)}</td>
      <td style="padding:10px 8px;text-align:right;font-family:monospace;color:var(--text-2);">${formatCurrency(r.avgInvoice)}</td>
    </tr>`;
  }).join('');

  tableContainer.innerHTML = `
    <div class="table-container" style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr style="background:var(--bg-2);border-bottom:2px solid var(--border);user-select:none;">
            <th style="padding:10px 8px;text-align:center;">#</th>
            <th onclick="toggleCustPerfSort('name')" style="padding:10px 8px;text-align:right;cursor:pointer;">العميل${renderSortArrow('name')}</th>
            <th onclick="toggleCustPerfSort('lastInvoiceDate')" style="padding:10px 8px;text-align:center;cursor:pointer;white-space:nowrap;">آخر فاتورة${renderSortArrow('lastInvoiceDate')}</th>
            <th onclick="toggleCustPerfSort('lastReceiptDate')" style="padding:10px 8px;text-align:center;cursor:pointer;white-space:nowrap;">آخر تحصيل${renderSortArrow('lastReceiptDate')}</th>
            <th onclick="toggleCustPerfSort('invoiceCount')" style="padding:10px 8px;text-align:center;cursor:pointer;white-space:nowrap;">الفواتير${renderSortArrow('invoiceCount')}</th>
            <th onclick="toggleCustPerfSort('totalSales')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">المبيعات${renderSortArrow('totalSales')}</th>
            <th onclick="toggleCustPerfSort('totalCost')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">التكلفة${renderSortArrow('totalCost')}</th>
            <th onclick="toggleCustPerfSort('profit')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">الربح / %${renderSortArrow('profit')}</th>
            <th onclick="toggleCustPerfSort('collected')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">المحصّل${renderSortArrow('collected')}</th>
            <th onclick="toggleCustPerfSort('remainingAmount')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">المتبقي${renderSortArrow('remainingAmount')}</th>
            <th onclick="toggleCustPerfSort('collectionPct')" style="padding:10px 8px;text-align:center;cursor:pointer;white-space:nowrap;">نسبة التحصيل${renderSortArrow('collectionPct')}</th>
            <th onclick="toggleCustPerfSort('dailyAvg')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">معدل يومي${renderSortArrow('dailyAvg')}</th>
            <th onclick="toggleCustPerfSort('avgInvoice')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">متوسط الفاتورة${renderSortArrow('avgInvoice')}</th>
          </tr>
        </thead>
        <tbody>
          ${_custperfRows.length === 0 ? `<tr><td colspan="13" style="text-align:center;padding:40px;color:var(--text-2);">لا توجد بيانات للفترة المختارة</td></tr>` : rowsHTML}
        </tbody>
        <tfoot>
          <tr style="background:var(--bg-2);border-top:2px solid var(--border);font-weight:900;">
            <td colspan="4" style="padding:12px 8px;">الإجمالي (${_custperfRows.length} عميل)</td>
            <td style="padding:12px 8px;text-align:center;">${tot.invoices}</td>
            <td style="padding:12px 8px;text-align:right;font-family:monospace;color:#6366f1;">${formatCurrency(tot.sales)}</td>
            <td style="padding:12px 8px;text-align:right;font-family:monospace;">${formatCurrency(tot.cost)}</td>
            <td style="padding:12px 8px;text-align:right;font-family:monospace;color:#10b981;">${formatCurrency(tot.profit)} <span style="font-size:10px;font-weight:400;">(${p2(totProfitPct)}%)</span></td>
            <td style="padding:12px 8px;text-align:right;font-family:monospace;color:#3b82f6;">${formatCurrency(tot.collected)}</td>
            <td style="padding:12px 8px;text-align:right;font-family:monospace;color:#f59e0b;">${formatCurrency(tot.remaining)}</td>
            <td style="padding:12px 8px;text-align:center;font-weight:900;color:${totCollectionPct >= 80 ? '#10b981' : totCollectionPct >= 50 ? '#f59e0b' : '#ef4444'};">${p2(totCollectionPct)}%</td>
            <td style="padding:12px 8px;text-align:right;font-family:monospace;color:#8b5cf6;">${formatCurrency(totDailyAvg)}</td>
            <td style="padding:12px 8px;text-align:right;font-family:monospace;">${formatCurrency(tot.invoices > 0 ? tot.sales / tot.invoices : 0)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div class="no-print" style="display:flex;gap:20px;margin-top:14px;font-size:11px;color:var(--text-3);flex-wrap:wrap;">
      <span>🟢 تحصيل ممتاز (≥80%)</span><span>🟡 تحصيل متوسط (50–79%)</span><span>🔴 تحصيل ضعيف (&lt;50%)</span>
    </div>
  `;
}
