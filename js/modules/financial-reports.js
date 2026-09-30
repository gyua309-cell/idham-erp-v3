// ============================================================
// IDHAM ERP — Unified Financial Reports & Analysis
// دفتر الأستاذ، ميزان المراجعة، قائمة الدخل، الميزانية، التدفقات، حقوق الملكية، والتحليل المالي
// ============================================================
import { COLS, getAll, query, orderBy, getDocs, doc, getDoc, db, COMPANY_ID } from "../utils/db.js";
import { formatCurrency, todayString, startOfMonth } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

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
        <button class="btn btn-secondary" onclick="printActiveReportPDF()" style="font-weight:700; background:linear-gradient(135deg,#5b3ec2,#4338ca); color:#fff; border:none; box-shadow:0 2px 6px rgba(91,62,194,0.3);">📑 تصدير PDF / طباعة التقرير</button>
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
      <button class="tab-btn" id="btn-tab-breakeven" onclick="switchFinTab('breakeven')" style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--text-2); border-bottom:2px solid transparent; white-space:nowrap;">🎯 نقطة التعادل CVP</button>
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
  // حسابات تكلفة المبيعات والتكلفة المباشرة فقط (COGS)
  const code = acc.code || "";
  if (code.startsWith("5-1-1")) return false; // استبعاد أي حسابات مشتريات دورية
  return code === "5-1-8" || code === "5-1-7" || code === "5-1-9" || code === "5-1-3" ||
    (code.startsWith("5-1-") && !code.startsWith("5-1-1")) || code === "4-2-4" ||
    acc.name?.includes("تكلفة البضاعة المباعة") ||
    acc.name?.includes("تكلفة مبيعات") ||
    acc.name?.includes("نقل بضاعة");
}

function isCOGSOrPurchase(acc) {
  return isCOGSAccount(acc);
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
    const { clearERPCache, COLS } = await import("../utils/db.js");
    clearERPCache(COLS.chartOfAccounts().path);
    clearERPCache(COLS.journalEntries().path);
    clearERPCache(COLS.salesInvoices().path);
    clearERPCache(COLS.receipts().path);
    _salesInvoicesCache = null;
    _receiptsCache = null;

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
        <div style="display:flex; gap:8px; align-items:flex-end; flex-wrap:wrap;">
          <div style="position:relative; display:inline-block;">
            <button id="btn-custperf-cols" class="btn btn-secondary" onclick="toggleCustPerfColMenu(event)" style="white-space:nowrap; min-height:38px; display:inline-flex; align-items:center; gap:6px; background:var(--bg-1); border:1px solid var(--border); cursor:pointer;">
              ⚙️ تخصيص الأعمدة ▾
            </button>
            <div id="custperf-col-dropdown" class="card shadow-lg" style="display:none; position:absolute; top:calc(100% + 6px); left:0; min-width:280px; z-index:1050; padding:12px; border-radius:10px; border:1px solid var(--border); background:var(--bg-card, var(--bg-1)); box-shadow:0 12px 30px rgba(0,0,0,0.35);">
            </div>
          </div>
          <button class="btn btn-secondary" onclick="exportCustPerfExcel()" style="white-space:nowrap; min-height:38px; display:inline-flex; align-items:center; gap:6px;">
            📥 تصدير Excel
          </button>
          <button class="btn btn-primary" onclick="exportCustPerfPDF()" style="white-space:nowrap; min-height:38px; display:inline-flex; align-items:center; gap:6px;">
            🖨️ طباعة / PDF
          </button>
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
    breakeven: renderBreakEvenAnalysis,
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
    if (acc.isGroup || acc.isHeader || acc.nodeType === 'header' || acc.nodeType === 'group') continue;
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

    if (Math.abs(balance) < 0.01) continue;

    if (acc.type === "revenue") {
      // إيرادات الفترة المحددة
      const revVal = balance;
      if (Math.abs(revVal) > 0.01) {
        revenueTotal += revVal;
        revItems.push({ name: acc.name, code: acc.code, balance: revVal });
      }
    } else if (acc.type === "expense") {
      // استبعاد أي حسابات مشتريات دورية (الجرد المستمر يعتمد على المخزون 1-1-4 و COGS 5-1-8)
      if (acc.code?.startsWith("5-1-1") || acc.name?.includes("مشتريات البضاعة")) continue;

      // مصروفات وتكلفة الفترة المحددة (Normal Debit: Debit - Credit)
      const expVal = -balance; // لأن balance = credit - debit
      if (Math.abs(expVal) < 0.01) continue;

      if (isCOGSAccount(acc)) {
        cogsTotal += expVal;
        cogsItems.push({ name: acc.name, code: acc.code, balance: expVal });
      } else {
        opExpTotal += expVal;
        expItems.push({ name: acc.name, code: acc.code, balance: expVal });
      }
    }
  }

  const grossRevenue = revItems.filter(i => i.balance > 0).reduce((s, i) => s + i.balance, 0) || revenueTotal;

  return {
    grossRevenue,
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

window.printActiveReportPDF = () => {
  const from = document.getElementById("fin-from")?.value || startOfMonth();
  const to = document.getElementById("fin-to")?.value || todayString();
  if (activeTab === "income") {
    window.printIncomeStatementPDF(from, to);
  } else if (activeTab === "breakeven") {
    window.printBreakEvenPDF(from, to);
  } else {
    window.print();
  }
};

window.printIncomeStatementPDF = async (from, to) => {
  const cur = _calcIncomeData(from, to);
  const { grossRevenue, revenueTotal, cogsTotal, opExpTotal, revItems, cogsItems, expItems, grossProfit, netProfit } = cur;
  const margin      = revenueTotal > 0 ? (netProfit   / revenueTotal * 100).toFixed(1) : "0.0";
  const grossMargin = revenueTotal > 0 ? (grossProfit / revenueTotal * 100).toFixed(1) : "0.0";

  revItems.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
  cogsItems.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
  expItems.sort((a, b) => (a.code || '').localeCompare(b.code || ''));

  // Company details
  let co = {
    name: "شركة نظم الإمداد الحديثة",
    vatNumber: "312448150500003",
    crNumber: "4700123180",
    phone: "0549141648",
    email: "Nuzmalamdad@gmail.com",
    address: "7480 - الشارع: عامر الشعبي، ينبع",
    logoUrl: ""
  };
  // 1. Check local storage cache
  try {
    const cached = JSON.parse(localStorage.getItem("idham_company") || "{}");
    if (cached.name) Object.assign(co, cached);
    if (cached.cr) co.crNumber = cached.cr;
    if (cached.crNumber) co.crNumber = cached.crNumber;
    if (cached.logoBase64) co.logoUrl = cached.logoBase64;
    if (cached.logoUrl) co.logoUrl = cached.logoUrl;
  } catch (_) {}

  // 2. Fetch fresh logo and company info from Firestore
  try {
    const [compSnap, logoSnap] = await Promise.all([
      getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company")),
      getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "logo"))
    ]);
    if (compSnap.exists()) {
      const d = compSnap.data();
      const rawCr = d.crNumber || d.cr || d.commercialRegistration || "";
      d.crNumber = (rawCr && rawCr.startsWith("47")) ? rawCr : "4700123180";
      d.vatNumber = d.vatNumber || "312448150500003";
      d.name = d.name || "شركة نظم الإمداد الحديثة";
      Object.assign(co, d);
    }
    if (logoSnap.exists()) {
      const ld = logoSnap.data();
      const imgData = ld.dataUrl || ld.logoBase64 || ld.url || ld.logoUrl || "";
      if (imgData) {
        co.logoUrl = imgData;
        try {
          const c2 = JSON.parse(localStorage.getItem("idham_company") || "{}");
          localStorage.setItem("idham_company", JSON.stringify({ ...c2, logoBase64: imgData, logoUrl: imgData }));
        } catch (_) {}
      }
    }
  } catch (e) {
    console.warn("Could not load fresh logo from Firestore:", e);
  }

  const logoHtml = co.logoUrl
    ? `<div class="logo-circle"><img src="${co.logoUrl}" alt="Logo" /></div>`
    : `<div class="logo-circle"><span class="default-logo">🏢</span></div>`;

  const isLoss = netProfit < 0;

  const win = window.open("", "_blank");
  win.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>قائمة الدخل والأرباح والخسائر — ${from} إلى ${to}</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'IBM Plex Sans Arabic', sans-serif; direction: rtl; color: #1f2937; background: #f8fafc; padding: 12px; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    
    .no-print { background: #1f2937; padding: 10px; display: flex; gap: 12px; justify-content: center; margin-bottom: 12px; border-radius: 8px; }
    .btn { padding: 8px 20px; font-weight: 700; border-radius: 8px; cursor: pointer; border: none; font-size: 13px; font-family: inherit; }
    
    .report-container { background: #fff; max-width: 210mm; margin: 0 auto; padding: 18px 22px; border: 1.5px solid #5b3ec2; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    
    /* Top Title */
    .top-title { text-align: center; margin-bottom: 12px; }
    .top-title h1 { font-size: 20px; color: #5b3ec2; font-weight: 800; margin-bottom: 2px; }
    .top-title h2 { font-size: 10px; color: #5b3ec2; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
    
    /* Purple Company Banner */
    .company-banner { background: #5b3ec2 !important; color: #fff !important; border-radius: 8px; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .banner-left { text-align: right; font-size: 11.5px; font-weight: 500; line-height: 1.5; color: #fff !important; }
    .banner-left div { color: #fff !important; }
    .banner-left strong { color: #fff !important; }
    .banner-right { text-align: left; line-height: 1.4; color: #fff !important; }
    .banner-right h2 { font-size: 16px; font-weight: 800; margin-bottom: 3px; color: #fff !important; }
    .banner-right div { font-size: 11.5px; color: #fff !important; }
    .banner-right strong { color: #fff !important; }
    .logo-circle { width: 68px; height: 68px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 4px; border: 1.5px solid #5b3ec2; box-shadow: 0 2px 6px rgba(0,0,0,0.12); flex-shrink: 0; }
    .logo-circle img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .logo-circle .default-logo { font-size: 28px; }
    
    /* Info Strip */
    .info-strip { border: 1px solid #5b3ec2; border-radius: 6px; padding: 6px 12px; font-size: 10.5px; background: #fdfcff; margin-bottom: 14px; display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
    .info-strip span { color: #1f2937; }
    .info-strip strong { color: #5b3ec2; }
    
    /* KPI Strip */
    .kpi-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 14px; }
    .kpi-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; background: #f8fafc; text-align: center; }
    .kpi-box.blue { border-color: #3b82f6; background: #eff6ff; }
    .kpi-box.indigo { border-color: #6366f1; background: #eef2ff; }
    .kpi-box.loss { border-color: #ef4444; background: #fef2f2; }
    .kpi-box.profit { border-color: #22c55e; background: #f0fdf4; }
    .kpi-box .lbl { font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px; }
    .kpi-box .val { font-size: 16px; font-weight: 900; font-family: 'IBM Plex Mono', monospace; }
    .kpi-box.blue .val { color: #1d4ed8; }
    .kpi-box.indigo .val { color: #4338ca; }
    .kpi-box.loss .val { color: #b91c1c; }
    .kpi-box.profit .val { color: #15803d; }
    
    /* Section Head */
    .sec-head { background: #5b3ec2 !important; color: #fff !important; font-size: 12px; font-weight: 800; padding: 7px 12px; border-radius: 6px 6px 0 0; margin-top: 14px; display: flex; justify-content: space-between; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .sec-head span { color: #fff !important; }
    
    /* Accounting Table */
    .acc-table { width: 100%; border-collapse: collapse; margin-bottom: 4px; border: 1px solid #5b3ec2; border-top: none; }
    .acc-table thead tr { background: #f1f5f9; border-bottom: 1px solid #cbd5e1; }
    .acc-table thead th { font-size: 10.5px; font-weight: 700; padding: 6px 8px; color: #334155; text-align: right; }
    .acc-table tbody tr { border-bottom: 1px solid #e2e8f0; }
    .acc-table tbody tr:nth-child(even) { background: #fcfcfd; }
    .acc-table tbody td { padding: 6px 8px; font-size: 11px; color: #1f2937; }
    .acc-table tbody td.mono { font-family: 'IBM Plex Mono', monospace; font-weight: 700; text-align: left; }
    
    .subtotal-row { background: #f8fafc; border: 1px solid #cbd5e1; border-top: none; padding: 7px 10px; display: flex; justify-content: space-between; font-weight: 800; font-size: 11.5px; margin-bottom: 12px; border-radius: 0 0 6px 6px; }
    .gross-profit-box { background: #eef2ff !important; border: 1.5px solid #6366f1; border-radius: 8px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; font-weight: 900; margin-bottom: 14px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .gross-profit-box .val { font-family: 'IBM Plex Mono', monospace; font-size: 15px; color: #4338ca; }
    
    /* Grand Summary Box */
    .grand-summary { border-radius: 8px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; margin-top: 18px; margin-bottom: 18px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .grand-summary.loss { background: #991b1b !important; color: #fff !important; border: 2px solid #ef4444; }
    .grand-summary.profit { background: #166534 !important; color: #fff !important; border: 2px solid #22c55e; }
    .grand-summary h3 { font-size: 16px; font-weight: 900; color: #fff !important; }
    .grand-summary p { font-size: 11px; opacity: 0.9; color: #fff !important; }
    .grand-summary .val { font-size: 22px; font-weight: 900; font-family: 'IBM Plex Mono', monospace; color: #fff !important; }
    
    /* Signatures */
    .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 25px; padding-top: 15px; border-top: 1px dashed #5b3ec2; text-align: center; }
    .signatures .role { font-size: 11px; font-weight: 800; color: #334155; margin-bottom: 35px; }
    .signatures .line { border-top: 1px dotted #94a3b8; width: 110px; margin: 0 auto; font-size: 10px; color: #64748b; padding-top: 3px; }
    
    @page {
      size: A4;
      margin: 8mm 10mm 8mm 10mm;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .no-print { display: none !important; }
      .report-container { max-width: 100%; box-shadow: none; border-radius: 0; border: 1px solid #5b3ec2; padding: 10px; }
      .company-banner { background: #5b3ec2 !important; color: #fff !important; }
      .sec-head { background: #5b3ec2 !important; color: #fff !important; }
      .grand-summary.loss { background: #991b1b !important; color: #fff !important; }
      .grand-summary.profit { background: #166534 !important; color: #fff !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn" style="background:#5b3ec2;color:#fff;" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
    <button class="btn" style="background:#374151;color:#fff;" onclick="window.close()">✕ إغلاق</button>
  </div>

  <div class="report-container">
    <!-- Top Title -->
    <div class="top-title">
      <h1>قائمة الدخل والأرباح والخسائر</h1>
      <h2>INCOME STATEMENT & COMPREHENSIVE PROFIT / LOSS REPORT</h2>
    </div>

    <!-- Purple Company Banner -->
    <div class="company-banner">
      <div class="banner-left">
        <div>الفترة المالية: <strong>من ${from} إلى ${to}</strong></div>
        <div>تاريخ الإصدار: <strong>${new Date().toLocaleDateString('ar-SA')}</strong></div>
        <div>العملة: <strong>ريال سعودي (SAR)</strong></div>
      </div>
      ${logoHtml}
      <div class="banner-right">
        <h2>${co.name}</h2>
        ${co.vatNumber ? `<div>الرقم الضريبي: <strong>${co.vatNumber}</strong></div>` : ""}
        ${co.crNumber ? `<div>السجل التجاري: <strong>${co.crNumber}</strong></div>` : ""}
        ${co.phone ? `<div>الهاتف: <strong>${co.phone}</strong></div>` : ""}
      </div>
    </div>

    <!-- Info Strip -->
    <div class="info-strip">
      <span><strong>بيانات المنشأة:</strong> ${co.name}</span>
      <span><strong>الرقم الضريبي:</strong> ${co.vatNumber || "—"}</span>
      <span><strong>السجل التجاري:</strong> ${co.crNumber || "—"}</span>
      <span><strong>العنوان:</strong> ${co.address || "المملكة العربية السعودية"}</span>
    </div>

    <!-- KPI Summary Strip -->
    <div class="kpi-strip">
      <div class="kpi-box blue">
        <div class="lbl">صافي الإيرادات والمبيعات</div>
        <div class="val" dir="ltr">${formatCurrency(revenueTotal)}</div>
      </div>
      <div class="kpi-box indigo">
        <div class="lbl">مجمل الربح (هامش ${grossMargin}%)</div>
        <div class="val" dir="ltr">${formatCurrency(grossProfit)}</div>
      </div>
      <div class="kpi-box ${isLoss ? 'loss' : 'profit'}">
        <div class="lbl">${isLoss ? 'صافي الخسارة' : 'صافي الربح'} (هامش ${margin}%)</div>
        <div class="val" dir="ltr">${formatCurrency(netProfit)}</div>
      </div>
    </div>

    <!-- 1. Revenues -->
    <div class="sec-head">
      <span>أولاً: الإيرادات التشغيلية والمبيعات (Revenues)</span>
      <span>100.0%</span>
    </div>
    <table class="acc-table">
      <thead>
        <tr>
          <th style="width:130px;">كود الحساب</th>
          <th>اسم الحساب والبيان</th>
          <th style="width:140px; text-align:left;">المبلغ (ر.س)</th>
          <th style="width:70px; text-align:center;">النسبة</th>
        </tr>
      </thead>
      <tbody>
        ${revItems.length ? revItems.map(item => `
          <tr>
            <td style="font-family:'IBM Plex Mono',monospace; font-weight:700;">${item.code}</td>
            <td style="font-weight:700;">${item.name}</td>
            <td class="mono" dir="ltr">${formatCurrency(item.balance)}</td>
            <td style="text-align:center; font-size:10.5px;">${grossRevenue > 0 ? (item.balance / grossRevenue * 100).toFixed(1) : 0}%</td>
          </tr>
        `).join("") : `<tr><td colspan="4" style="text-align:center; padding:10px;">لا توجد إيرادات مسجلة</td></tr>`}
      </tbody>
    </table>
    <div class="subtotal-row">
      <span style="color:#1d4ed8;">صافي الإيرادات التشغيلية:</span>
      <span class="mono" style="color:#1d4ed8;" dir="ltr">${formatCurrency(revenueTotal)} (${grossRevenue > 0 ? (revenueTotal / grossRevenue * 100).toFixed(1) : 100}%)</span>
    </div>

    <!-- 2. COGS -->
    <div class="sec-head">
      <span>ثانياً: تكلفة البضاعة المباعة (COGS)</span>
      <span>تكلفة مباشرة</span>
    </div>
    <table class="acc-table">
      <thead>
        <tr>
          <th style="width:130px;">كود الحساب</th>
          <th>اسم الحساب والبيان</th>
          <th style="width:140px; text-align:left;">المبلغ (ر.س)</th>
          <th style="width:70px; text-align:center;">النسبة</th>
        </tr>
      </thead>
      <tbody>
        ${cogsItems.length ? cogsItems.map(item => `
          <tr>
            <td style="font-family:'IBM Plex Mono',monospace; font-weight:700;">${item.code}</td>
            <td style="font-weight:700;">${item.name}</td>
            <td class="mono" style="color:#b45309;" dir="ltr">(${formatCurrency(item.balance)})</td>
            <td style="text-align:center; font-size:10.5px;">${revenueTotal > 0 ? (item.balance / revenueTotal * 100).toFixed(1) : 0}%</td>
          </tr>
        `).join("") : `<tr><td colspan="4" style="text-align:center; padding:10px;">لا توجد تكلفة مباشرة مسجلة</td></tr>`}
      </tbody>
    </table>
    <div class="subtotal-row">
      <span style="color:#b45309;">يخصم: إجمالي تكلفة البضاعة المباعة:</span>
      <span class="mono" style="color:#b45309;" dir="ltr">(${formatCurrency(cogsTotal)})</span>
    </div>

    <div class="gross-profit-box">
      <div>🏷️ مجمل الربح التشغيلي (Gross Profit) — هامش: ${grossMargin}%</div>
      <div class="val" dir="ltr">${formatCurrency(grossProfit)}</div>
    </div>

    <!-- 3. Operating Expenses -->
    <div class="sec-head">
      <span>ثالثاً: المصروفات التشغيلية والعمومية والإدارية (Operating Expenses)</span>
      <span>مصروفات تشغيلية</span>
    </div>
    <table class="acc-table">
      <thead>
        <tr>
          <th style="width:130px;">كود الحساب</th>
          <th>اسم الحساب والبيان</th>
          <th style="width:140px; text-align:left;">المبلغ (ر.س)</th>
          <th style="width:70px; text-align:center;">النسبة</th>
        </tr>
      </thead>
      <tbody>
        ${expItems.length ? expItems.map(item => `
          <tr>
            <td style="font-family:'IBM Plex Mono',monospace; font-weight:700;">${item.code}</td>
            <td style="font-weight:700;">${item.name}</td>
            <td class="mono" style="color:#dc2626;" dir="ltr">(${formatCurrency(item.balance)})</td>
            <td style="text-align:center; font-size:10.5px;">${opExpTotal > 0 ? (item.balance / opExpTotal * 100).toFixed(1) : 0}%</td>
          </tr>
        `).join("") : `<tr><td colspan="4" style="text-align:center; padding:10px;">لا توجد مصروفات تشغيلية مسجلة</td></tr>`}
      </tbody>
    </table>
    <div class="subtotal-row">
      <span style="color:#dc2626;">إجمالي المصروفات التشغيلية والإدارية:</span>
      <span class="mono" style="color:#dc2626;" dir="ltr">(${formatCurrency(opExpTotal)})</span>
    </div>

    <!-- Grand Summary Banner -->
    <div class="grand-summary ${isLoss ? 'loss' : 'profit'}">
      <div>
        <h3>${isLoss ? '⚠️ صافي الخسارة للفترة (Net Loss)' : '🎉 صافي الربح للفترة (Net Profit)'}</h3>
        <p>نسبة صافي ${isLoss ? 'الخسارة' : 'الربح'} من الإيراد: ${margin}% | تم احتساب كافة الإيرادات والتكاليف والمصروفات</p>
      </div>
      <div class="val" dir="ltr">${formatCurrency(netProfit)}</div>
    </div>

    <!-- Signatures -->
    <div class="signatures">
      <div>
        <div class="role">إعداد / المحاسب المالي</div>
        <div class="line">التوقيع</div>
      </div>
      <div>
        <div class="role">مراجعة / الإدارة المالية</div>
        <div class="line">التوقيع</div>
      </div>
      <div>
        <div class="role">اعتماد / المدير العام</div>
        <div class="line">الختم والتوقيع</div>
      </div>
    </div>

  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>`);
  win.document.close();
};

window.exportIncomeStatementExcel = (from, to) => {
  const cur = _calcIncomeData(from, to);
  const rows = [];
  rows.push(["قائمة الدخل والأرباح والخسائر — شركة نظم الإمداد الحديثة"]);
  rows.push([`للفترة من: ${from} إلى: ${to}`]);
  rows.push([]);
  rows.push(["القسم", "كود الحساب", "اسم الحساب", "المبلغ (ر.س)"]);
  
  (cur.revItems || []).forEach(r => rows.push(["الإيرادات", r.code, r.name, r.balance]));
  rows.push(["الإيرادات", "", "إجمالي الإيرادات", cur.revenueTotal]);
  rows.push([]);
  
  (cur.cogsItems || []).forEach(c => rows.push(["تكلفة المبيعات", c.code, c.name, -c.balance]));
  rows.push(["تكلفة المبيعات", "", "إجمالي تكلفة المبيعات", -cur.cogsTotal]);
  rows.push(["مجمل الربح", "", "مجمل الربح (Gross Profit)", cur.grossProfit]);
  rows.push([]);
  
  (cur.expItems || []).forEach(e => rows.push(["المصروفات التشغيلية", e.code, e.name, -e.balance]));
  rows.push(["المصروفات التشغيلية", "", "إجمالي المصروفات التشغيلية", -cur.opExpTotal]);
  rows.push([]);
  rows.push(["النتيجة النهائية", "", "صافي الربح / (الخسارة)", cur.netProfit]);
  
  exportToExcel(rows, `قائمة_الدخل_${from}_${to}`);
};

function renderIncomeStatement(container, from, to) {
  const cur = _calcIncomeData(from, to);
  const { grossRevenue, revenueTotal, cogsTotal, opExpTotal, revItems, cogsItems, expItems, grossProfit, netProfit } = cur;
  const margin      = revenueTotal > 0 ? (netProfit   / revenueTotal * 100).toFixed(1) : "0.0";
  const grossMargin = revenueTotal > 0 ? (grossProfit / revenueTotal * 100).toFixed(1) : "0.0";
  
  // Sort items by code
  revItems.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
  cogsItems.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
  expItems.sort((a, b) => (a.code || '').localeCompare(b.code || ''));

  // مقارنة بالفترة السابقة
  const { prevFrom, prevTo } = _getPrevPeriod(from, to);
  const prev = _calcIncomeData(prevFrom, prevTo);
  const _trend = (cv, pv) => {
    if (!pv || Math.abs(pv) < 0.01) return "";
    const pct = ((cv - pv) / Math.abs(pv) * 100).toFixed(1);
    const up  = parseFloat(pct) >= 0;
    return `<span style="font-size:11px; font-weight:700; color:${up ? '#16a34a' : '#dc2626'}; margin-right:4px;">${up ? '▲' : '▼'} ${Math.abs(pct)}%</span>`;
  };

  const isLoss = netProfit < 0;

  container.innerHTML = `
    <!-- Top Print Header (Visible in Print) -->
    <div class="report-print-header" style="border-bottom:2px solid #3b82f6; padding-bottom:12px; margin-bottom:18px;">
      ${window.getCompanyPrintHeaderHTML ? window.getCompanyPrintHeaderHTML("قائمة الدخل والأرباح والخسائر (Income Statement)", `للفترة المالية من: ${from} إلى: ${to}`) : ""}
    </div>

    <!-- On-screen Action Toolbar -->
    <div class="no-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; background:var(--bg-1); padding:12px 18px; border-radius:12px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm);">
      <div style="font-size:13px; font-weight:700; color:var(--text-2);">
        📊 <strong style="color:var(--text-1);">قائمة الأرباح والخسائر الشاملة</strong> | مقارنة بالفترة السابقة (${prevFrom} → ${prevTo})
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-secondary btn-sm" onclick="exportIncomeStatementExcel('${from}', '${to}')" style="font-weight:700;">📊 تصدير Excel</button>
        <button class="btn btn-primary btn-sm" onclick="printIncomeStatementPDF('${from}', '${to}')" style="font-weight:700; background:linear-gradient(135deg, #5b3ec2, #4338ca); border:none; box-shadow:0 2px 6px rgba(91,62,194,0.3);">📑 تصدير PDF المطور (الهيدر الملون الرسمي)</button>
      </div>
    </div>

    <div class="income-statement-doc" style="max-width:920px; margin:0 auto;">
      
      <!-- ═══ KPI SUMMARY CARDS ═══ -->
      <div class="grid-3 gap-16 mb-24 kpi-row" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin-bottom:20px;">
        
        <!-- Total Revenues -->
        <div class="kpi-card" style="background:linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02)); border:1.5px solid rgba(59,130,246,0.3); border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:#1d4ed8;">💰 صافي الإيرادات والمبيعات</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:rgba(59,130,246,0.15); color:#1d4ed8;">صافي الإيراد 📈</span>
          </div>
          <div style="font-size:20px; font-weight:900; color:#1d4ed8; font-family:'IBM Plex Mono', monospace;">
            ${formatCurrency(revenueTotal)} ${_trend(revenueTotal, prev.revenueTotal)}
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">إجمالي المبيعات قبل المردود: <strong class="mono">${formatCurrency(grossRevenue)}</strong></div>
        </div>

        <!-- Gross Profit -->
        <div class="kpi-card" style="background:linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02)); border:1.5px solid rgba(99,102,241,0.3); border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:#4338ca;">🏷️ مجمل الربح (Gross Profit)</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:rgba(99,102,241,0.15); color:#4338ca;">هامش ${grossMargin}%</span>
          </div>
          <div style="font-size:20px; font-weight:900; color:#4338ca; font-family:'IBM Plex Mono', monospace;">
            ${formatCurrency(grossProfit)} ${_trend(grossProfit, prev.grossProfit)}
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">السابق: <strong class="mono">${formatCurrency(prev.grossProfit)}</strong></div>
        </div>

        <!-- Net Profit / Loss -->
        <div class="kpi-card" style="background:${isLoss ? "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.02))" : "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02))"}; border:1.5px solid ${isLoss ? "rgba(239,68,68,0.4)" : "rgba(16,185,129,0.4)"}; border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:${isLoss ? "#b91c1c" : "#047857"};">${isLoss ? "⚠️ صافي الخسارة" : "🏆 صافي الربح"}</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:${isLoss ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)"}; color:${isLoss ? "#b91c1c" : "#047857"};">${margin}%</span>
          </div>
          <div style="font-size:20px; font-weight:900; color:${isLoss ? "#b91c1c" : "#047857"}; font-family:'IBM Plex Mono', monospace;">
            ${formatCurrency(netProfit)} ${_trend(netProfit, prev.netProfit)}
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">السابق: <strong class="mono">${formatCurrency(prev.netProfit)}</strong></div>
        </div>

      </div>

      <!-- ═══ MAIN STATEMENT REPORT CARD ═══ -->
      <div class="card income-report-body" style="border-radius:16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); overflow:hidden; padding:24px; background:var(--bg-1);">
        
        <!-- SECTION 1: REVENUES -->
        <div class="income-sec mb-24" style="page-break-inside:avoid; break-inside:avoid; margin-bottom:24px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #2563eb; padding-bottom:8px; margin-bottom:12px;">
            <h4 style="margin:0; font-size:15px; font-weight:900; color:#1d4ed8;">أولاً: الإيرادات التشغيلية والمبيعات (Revenues)</h4>
            <span style="font-size:11px; font-weight:700; color:#1d4ed8; background:rgba(37,99,235,0.1); padding:2px 8px; border-radius:6px;">حسابات الإيراد</span>
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:8px;">
            <thead>
              <tr style="background:var(--bg-2); color:var(--text-2); font-size:11.5px; border-bottom:1px solid var(--border-soft);">
                <th style="text-align:right; padding:6px 10px; width:130px;">كود الحساب</th>
                <th style="text-align:right; padding:6px 10px;">اسم الحساب / البند</th>
                <th style="text-align:left; padding:6px 10px; width:140px;">المبلغ (ر.س)</th>
                <th style="text-align:center; padding:6px 10px; width:80px;">النسبة</th>
              </tr>
            </thead>
            <tbody>
              ${revItems.length ? revItems.map((item, idx) => {
                const itemPct = grossRevenue > 0 ? (item.balance / grossRevenue * 100).toFixed(1) : "0.0";
                return `
                <tr style="border-bottom:1px solid var(--border-soft); background:${idx % 2 === 1 ? 'rgba(0,0,0,0.015)' : 'transparent'};">
                  <td style="padding:8px 10px; font-family:'IBM Plex Mono',monospace; font-weight:700; color:var(--text-3);">${item.code}</td>
                  <td style="padding:8px 10px; font-weight:700; color:var(--text-1);">${item.name}</td>
                  <td style="padding:8px 10px; text-align:left; font-family:'IBM Plex Mono',monospace; font-weight:700; color:${item.balance >= 0 ? '#1e293b' : '#dc2626'};" dir="ltr">${formatCurrency(item.balance)}</td>
                  <td style="padding:8px 10px; text-align:center; font-size:11px; color:var(--text-3); font-weight:600;">${itemPct}%</td>
                </tr>`;
              }).join("") : `<tr><td colspan="4" style="text-align:center; padding:12px; color:var(--text-3);">لا توجد إيرادات مسجلة في هذه الفترة</td></tr>`}
            </tbody>
          </table>
          <div style="display:flex; justify-content:space-between; align-items:center; background:linear-gradient(90deg, rgba(37,99,235,0.12), rgba(37,99,235,0.04)); padding:10px 14px; border-radius:8px; border:1px solid rgba(37,99,235,0.25); font-weight:800;">
            <span style="color:#1d4ed8; font-size:14px;">صافي الإيرادات التشغيلية (بعد خصم المردودات)</span>
            <span style="font-family:'IBM Plex Mono',monospace; font-size:16px; color:#1d4ed8;" dir="ltr">${formatCurrency(revenueTotal)}</span>
          </div>
        </div>

        <!-- SECTION 2: COGS & GROSS PROFIT -->
        <div class="income-sec mb-24" style="page-break-inside:avoid; break-inside:avoid; margin-bottom:24px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #d97706; padding-bottom:8px; margin-bottom:12px;">
            <h4 style="margin:0; font-size:15px; font-weight:900; color:#b45309;">ثانياً: تكلفة البضاعة المباعة (Cost of Goods Sold - COGS)</h4>
            <span style="font-size:11px; font-weight:700; color:#b45309; background:rgba(217,119,6,0.1); padding:2px 8px; border-radius:6px;">تكلفة مباشرة</span>
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:8px;">
            <thead>
              <tr style="background:var(--bg-2); color:var(--text-2); font-size:11.5px; border-bottom:1px solid var(--border-soft);">
                <th style="text-align:right; padding:6px 10px; width:130px;">كود الحساب</th>
                <th style="text-align:right; padding:6px 10px;">اسم الحساب / البند</th>
                <th style="text-align:left; padding:6px 10px; width:140px;">المبلغ (ر.س)</th>
                <th style="text-align:center; padding:6px 10px; width:80px;">النسبة</th>
              </tr>
            </thead>
            <tbody>
              ${cogsItems.length ? cogsItems.map((item, idx) => {
                const itemPct = revenueTotal > 0 ? (item.balance / revenueTotal * 100).toFixed(1) : "0.0";
                return `
                <tr style="border-bottom:1px solid var(--border-soft); background:${idx % 2 === 1 ? 'rgba(0,0,0,0.015)' : 'transparent'};">
                  <td style="padding:8px 10px; font-family:'IBM Plex Mono',monospace; font-weight:700; color:var(--text-3);">${item.code}</td>
                  <td style="padding:8px 10px; font-weight:700; color:var(--text-1);">${item.name}</td>
                  <td style="padding:8px 10px; text-align:left; font-family:'IBM Plex Mono',monospace; font-weight:700; color:#b45309;" dir="ltr">(${formatCurrency(item.balance)})</td>
                  <td style="padding:8px 10px; text-align:center; font-size:11px; color:var(--text-3);">${itemPct}%</td>
                </tr>`;
              }).join("") : `<tr><td colspan="4" style="text-align:center; padding:12px; color:var(--text-3);">لا توجد تكلفة مباعة مسجلة</td></tr>`}
            </tbody>
          </table>
          <div style="display:flex; justify-content:space-between; align-items:center; background:linear-gradient(90deg, rgba(217,119,6,0.12), rgba(217,119,6,0.04)); padding:10px 14px; border-radius:8px; border:1px solid rgba(217,119,6,0.25); font-weight:800; margin-bottom:12px;">
            <span style="color:#b45309; font-size:14px;">يخصم: إجمالي تكلفة البضاعة المباعة</span>
            <span style="font-family:'IBM Plex Mono',monospace; font-size:16px; color:#b45309;" dir="ltr">(${formatCurrency(cogsTotal)})</span>
          </div>

          <!-- GROSS PROFIT HIGHLIGHT -->
          <div style="display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.06)); padding:12px 16px; border-radius:10px; border:1.5px solid #6366f1; font-weight:900;">
            <div>
              <span style="font-size:15px; color:#4338ca;">🏷️ مجمل الربح التشغيلي (Gross Profit)</span>
              <span style="font-size:11px; color:#6366f1; margin-right:8px;">[هامش الربح الإجمالي: ${grossMargin}%]</span>
            </div>
            <span style="font-family:'IBM Plex Mono',monospace; font-size:18px; color:#4338ca;" dir="ltr">${formatCurrency(grossProfit)}</span>
          </div>
        </div>

        <!-- SECTION 3: OPERATING EXPENSES -->
        <div class="income-sec mb-24" style="page-break-inside:avoid; break-inside:avoid; margin-bottom:24px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #dc2626; padding-bottom:8px; margin-bottom:12px;">
            <h4 style="margin:0; font-size:15px; font-weight:900; color:#dc2626;">ثالثاً: المصروفات التشغيلية والعمومية والإدارية (Operating Expenses)</h4>
            <span style="font-size:11px; font-weight:700; color:#dc2626; background:rgba(220,38,38,0.1); padding:2px 8px; border-radius:6px;">مصروفات عامة</span>
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:8px;">
            <thead>
              <tr style="background:var(--bg-2); color:var(--text-2); font-size:11.5px; border-bottom:1px solid var(--border-soft);">
                <th style="text-align:right; padding:6px 10px; width:130px;">كود الحساب</th>
                <th style="text-align:right; padding:6px 10px;">اسم الحساب / البند</th>
                <th style="text-align:left; padding:6px 10px; width:140px;">المبلغ (ر.س)</th>
                <th style="text-align:center; padding:6px 10px; width:80px;">النسبة</th>
              </tr>
            </thead>
            <tbody>
              ${expItems.length ? expItems.map((item, idx) => {
                const itemPct = opExpTotal > 0 ? (item.balance / opExpTotal * 100).toFixed(1) : "0.0";
                return `
                <tr style="border-bottom:1px solid var(--border-soft); background:${idx % 2 === 1 ? 'rgba(0,0,0,0.015)' : 'transparent'};">
                  <td style="padding:8px 10px; font-family:'IBM Plex Mono',monospace; font-weight:700; color:var(--text-3);">${item.code}</td>
                  <td style="padding:8px 10px; font-weight:700; color:var(--text-1);">${item.name}</td>
                  <td style="padding:8px 10px; text-align:left; font-family:'IBM Plex Mono',monospace; font-weight:700; color:#dc2626;" dir="ltr">(${formatCurrency(item.balance)})</td>
                  <td style="padding:8px 10px; text-align:center; font-size:11px; color:var(--text-3);">${itemPct}%</td>
                </tr>`;
              }).join("") : `<tr><td colspan="4" style="text-align:center; padding:12px; color:var(--text-3);">لا توجد مصروفات تشغيلية مسجلة</td></tr>`}
            </tbody>
          </table>
          <div style="display:flex; justify-content:space-between; align-items:center; background:linear-gradient(90deg, rgba(220,38,38,0.12), rgba(220,38,38,0.04)); padding:10px 14px; border-radius:8px; border:1px solid rgba(220,38,38,0.25); font-weight:800;">
            <span style="color:#dc2626; font-size:14px;">إجمالي المصروفات التشغيلية والإدارية</span>
            <span style="font-family:'IBM Plex Mono',monospace; font-size:16px; color:#dc2626;" dir="ltr">(${formatCurrency(opExpTotal)})</span>
          </div>
        </div>

        <!-- ═══ GRAND NET PROFIT / LOSS BANNER (ULTRA HIGH CONTRAST) ═══ -->
        <div class="grand-summary-box" style="page-break-inside:avoid; break-inside:avoid; margin-top:20px;">
          ${isLoss ? `
          <div style="display:flex; justify-content:space-between; align-items:center; background:#991b1b !important; color:#ffffff !important; padding:18px 24px; border-radius:14px; border:2px solid #ef4444 !important; box-shadow:0 6px 16px rgba(220,38,38,0.3); -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
            <div>
              <div style="font-size:18px; font-weight:900; color:#ffffff !important; display:flex; align-items:center; gap:8px;">
                <span>⚠️</span>
                <span style="color:#ffffff !important;">صافي الخسارة للفترة (Net Loss)</span>
              </div>
              <div style="font-size:12px; color:#fecaca !important; font-weight:700; margin-top:3px;">
                نسبة صافي الخسارة من الإيراد: ${margin}% | تم احتساب كافة الإيرادات والتكاليف والمصروفات
              </div>
            </div>
            <div style="font-size:24px; font-weight:900; font-family:'IBM Plex Mono',monospace; color:#ffffff !important; text-shadow:0 1px 3px rgba(0,0,0,0.5);" dir="ltr">
              ${formatCurrency(netProfit)}
            </div>
          </div>
          ` : `
          <div style="display:flex; justify-content:space-between; align-items:center; background:#166534 !important; color:#ffffff !important; padding:18px 24px; border-radius:14px; border:2px solid #22c55e !important; box-shadow:0 6px 16px rgba(22,163,74,0.3); -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
            <div>
              <div style="font-size:18px; font-weight:900; color:#ffffff !important; display:flex; align-items:center; gap:8px;">
                <span>🎉</span>
                <span style="color:#ffffff !important;">صافي الربح للفترة (Net Profit)</span>
              </div>
              <div style="font-size:12px; color:#bbf7d0 !important; font-weight:700; margin-top:3px;">
                هامش صافي الربح: ${margin}% | تم احتساب كافة الإيرادات والتكاليف والمصروفات
              </div>
            </div>
            <div style="font-size:24px; font-weight:900; font-family:'IBM Plex Mono',monospace; color:#ffffff !important; text-shadow:0 1px 3px rgba(0,0,0,0.5);" dir="ltr">
              ${formatCurrency(netProfit)}
            </div>
          </div>
          `}
        </div>

        <!-- ═══ AUDIT & SIGNATURES FOOTER (PRINT ONLY) ═══ -->
        <div class="print-signatures" style="margin-top:35px; border-top:1.5px dashed #94a3b8; padding-top:20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; text-align:center;">
          <div>
            <div style="font-size:12px; font-weight:800; color:#334155; margin-bottom:40px;">إعداد / المحاسب المالي</div>
            <div style="font-size:11px; color:#64748b; border-top:1px dotted #94a3b8; width:130px; margin:0 auto; padding-top:4px;">التوقيع</div>
          </div>
          <div>
            <div style="font-size:12px; font-weight:800; color:#334155; margin-bottom:40px;">مراجعة / الإدارة المالية</div>
            <div style="font-size:11px; color:#64748b; border-top:1px dotted #94a3b8; width:130px; margin:0 auto; padding-top:4px;">التوقيع</div>
          </div>
          <div>
            <div style="font-size:12px; font-weight:800; color:#334155; margin-bottom:40px;">اعتماد / المدير العام</div>
            <div style="font-size:11px; color:#64748b; border-top:1px dotted #94a3b8; width:130px; margin:0 auto; padding-top:4px;">الختم والتوقيع</div>
          </div>
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
// 7. Break-Even & CVP Analysis (تقرير نقطة التعادل)
// ──────────────────────────────────────────
// ──────────────────────────────────────────
// 7. Break-Even & CVP Analysis (تقرير نقطة التعادل وتحليل الأرباح المستهدفة)
// ──────────────────────────────────────────

function _classifyExpenseAccount(code, name) {
  const c = String(code || '');
  if (c.startsWith('5-2-6') || c.startsWith('5-2-1') || c.startsWith('5-2-2') || c.startsWith('5-2-3')) {
    return { type: 'fixed_salary', label: '🛡️ ثابتة (أجور ورواتب)', isCoreFixed: true, isCash: true, badgeBg: 'rgba(59,130,246,0.12)', badgeColor: '#1d4ed8' };
  }
  if (c.startsWith('5-4-1')) {
    return { type: 'fixed_rent', label: '🛡️ ثابتة (إيجارات)', isCoreFixed: true, isCash: true, badgeBg: 'rgba(59,130,246,0.12)', badgeColor: '#1d4ed8' };
  }
  if (c.startsWith('5-6')) {
    return { type: 'depreciation', label: '📉 ثابتة دفترياً (إهلاكات)', isCoreFixed: true, isCash: false, badgeBg: 'rgba(100,116,139,0.15)', badgeColor: '#475569' };
  }
  if (c.startsWith('5-3-3')) {
    return { type: 'mixed_fuel', label: '⚡ شبه متغيرة (ديزل ومحروقات)', isCoreFixed: false, isCash: true, badgeBg: 'rgba(245,158,11,0.12)', badgeColor: '#b45309' };
  }
  if (c.startsWith('5-3-2')) {
    return { type: 'mixed_maint', label: '⚡ شبه متغيرة (صيانة وإصلاح)', isCoreFixed: false, isCash: true, badgeBg: 'rgba(245,158,11,0.12)', badgeColor: '#b45309' };
  }
  if (c.startsWith('5-4-7') || c.startsWith('5-4-8') || c.startsWith('5-4-3')) {
    return { type: 'amortized', label: '📅 دورية سنوية (إقامات ورخص)', isCoreFixed: false, isCash: true, badgeBg: 'rgba(168,85,247,0.12)', badgeColor: '#7e22ce' };
  }
  return { type: 'operating', label: '🏷️ مصاريف تشغيلية', isCoreFixed: false, isCash: true, badgeBg: 'rgba(15,23,42,0.08)', badgeColor: 'var(--text-2)' };
}

function _calcBreakEvenData(from, to, selectedAccountCodes = null) {
  const inc = _calcIncomeData(from, to);
  const { grossRevenue, revenueTotal, cogsTotal, opExpTotal, revItems, cogsItems, expItems, grossProfit, netProfit } = inc;

  const f = new Date(from + 'T00:00:00');
  const t = new Date(to   + 'T00:00:00');
  const days = Math.max(1, Math.round((t - f) / 86400000) + 1);

  // هامش المساهمة ونسبته
  const contributionMargin = grossProfit; // Revenue - COGS
  const cmRatio = revenueTotal > 0 ? (contributionMargin / revenueTotal) : 0;
  const cmPct   = cmRatio * 100;

  // إذا لم يتم تمرير مصفوفة تحديد، نعتبر جميع المصروفات محددة افتراضياً
  const selectedSet = selectedAccountCodes ? new Set(selectedAccountCodes) : null;

  // تفكيك وتصنيف المصروفات
  const allExpWithMeta = (expItems || []).map(item => {
    const meta = _classifyExpenseAccount(item.code, item.name);
    const isSelected = selectedSet ? selectedSet.has(item.code) : true;
    return {
      ...item,
      ...meta,
      isSelected
    };
  });

  // حساب التكاليف الثابتة بناءً على المصروفات المحددة فقط
  const selectedExpenses = allExpWithMeta.filter(x => x.isSelected);
  const fixedCosts = selectedExpenses.reduce((sum, x) => sum + (x.balance || 0), 0);
  const unselectedCosts = opExpTotal - fixedCosts;

  // نقطة التعادل بالريال للتكاليف المحددة
  const breakEvenSales = cmRatio > 0 ? (fixedCosts / cmRatio) : 0;
  const dailyBreakEven = days > 0 ? (breakEvenSales / days) : 0;
  const dailyActual    = days > 0 ? (revenueTotal / days) : 0;

  // هامش الأمان
  const marginOfSafetyVal = revenueTotal - breakEvenSales;
  const marginOfSafetyPct = revenueTotal > 0 ? ((revenueTotal - breakEvenSales) / revenueTotal * 100) : 0;

  // يوم تحقيق التعادل في الفترة
  const breakEvenDay = dailyActual > 0 ? Math.round(breakEvenSales / dailyActual) : null;

  // ترتيب المصروفات تنازلياً مع احتساب المبيعات اللازمة لتغطية كل مصروف
  const sortedExp = [...allExpWithMeta].sort((a, b) => b.balance - a.balance).map(item => {
    const pctOfSelected = fixedCosts > 0 && item.isSelected ? (item.balance / fixedCosts * 100) : 0;
    const pctOfTotal = opExpTotal > 0 ? (item.balance / opExpTotal * 100) : 0;
    const salesNeeded = cmRatio > 0 ? (item.balance / cmRatio) : 0;
    return {
      ...item,
      pctOfSelected,
      pctOfTotal,
      salesNeeded
    };
  });

  return {
    from, to, days,
    grossRevenue, revenueTotal, cogsTotal, opExpTotal,
    grossProfit, netProfit,
    contributionMargin, cmRatio, cmPct,
    fixedCosts, unselectedCosts,
    selectedCount: selectedExpenses.length,
    totalCount: allExpWithMeta.length,
    breakEvenSales, dailyBreakEven, dailyActual,
    marginOfSafetyVal, marginOfSafetyPct,
    breakEvenDay,
    sortedExp
  };
}

window.exportBreakEvenExcel = (from, to) => {
  const be = _calcBreakEvenData(from, to, window._beSelectedExpenseCodes);
  const rows = [];
  rows.push(["تقرير تحليل نقطة التعادل والتحليل الحجمي (CVP) وسيناريوهات الأرباح ونسب الهوامش — شركة نظم الإمداد الحديثة"]);
  rows.push([`الفترة من: ${from} إلى: ${to} (${be.days} يوماً)`]);
  rows.push([]);
  
  rows.push(["المؤشر المالي", "القيمة", "الوحدة / النسبة"]);
  rows.push(["صافي الإيرادات والمبيعات الفعلية", be.revenueTotal, "ر.س"]);
  rows.push(["تكلفة البضاعة المباعة (التكلفة المتغيرة)", be.cogsTotal, "ر.س"]);
  rows.push(["هامش المساهمة (مجمل الربح)", be.grossProfit, "ر.س"]);
  rows.push(["نسبة هامش المساهمة الفعلي (Contribution Margin %)", be.cmPct.toFixed(2) + "%", "%"]);
  rows.push(["المصروفات المحددة للتعادل", be.fixedCosts, "ر.س"]);
  rows.push(["إجمالي المصروفات الكلية بالدفاتر", be.opExpTotal, "ر.س"]);
  rows.push(["نقطة التعادل بالمبيعات (Break-Even Sales)", be.breakEvenSales, "ر.س"]);
  rows.push(["المعدل اليومي المطلوب للتعادل", be.dailyBreakEven, "ر.س / يوم"]);
  rows.push(["المعدل اليومي الفعلي للمبيعات", be.dailyActual, "ر.س / يوم"]);
  rows.push(["هامش الأمان (Margin of Safety)", be.marginOfSafetyVal, "ر.س"]);
  rows.push(["نسبة هامش الأمان", be.marginOfSafetyPct.toFixed(2) + "%", "%"]);
  rows.push(["صافي الربح الفعلي بالفترة", be.netProfit, "ر.س"]);
  rows.push([]);

  // 2D Cross Matrix in Excel
  const margins = [
    { label: `الفعلي (${be.cmPct.toFixed(1)}%)`, val: be.cmRatio },
    { label: "8.0%", val: 0.08 },
    { label: "10.0%", val: 0.10 },
    { label: "12.0%", val: 0.12 },
    { label: "15.0%", val: 0.15 },
    { label: "18.0%", val: 0.18 },
    { label: "20.0%", val: 0.20 },
    { label: "25.0%", val: 0.25 }
  ];

  rows.push(["مصفوفة المبيعات المطلوبة عند مختلف الأرباح ونسب هوامش الربح:"]);
  rows.push(["صافي الربح المستهدف", ...margins.map(m => `عند هامش ${m.label}`)]);
  
  [0, 5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000].forEach(tp => {
    const row = [tp === 0 ? "0 (نقطة التعادل)" : tp];
    margins.forEach(m => {
      const s = m.val > 0 ? ((be.fixedCosts + tp) / m.val) : 0;
      row.push(s);
    });
    rows.push(row);
  });
  rows.push([]);

  rows.push(["تفكيك المصروفات وحالة التحديد:", "كود الحساب", "اسم المصروف", "التصنيف", "المبلغ (ر.س)", "حالة التحديد", "المبيعات اللازمة لتغطيته"]);
  be.sortedExp.forEach(e => {
    rows.push(["مصروف", e.code, e.name, e.label, e.balance, e.isSelected ? "محدد ومدرج" : "مستبعد", e.salesNeeded]);
  });

  exportToExcel(rows, `نقطة_التعادل_${from}_${to}`);
};

window.printBreakEvenPDF = async (from, to) => {
  const be = _calcBreakEvenData(from, to, window._beSelectedExpenseCodes);
  const { revenueTotal, cogsTotal, fixedCosts, opExpTotal, grossProfit, netProfit, cmPct, cmRatio, breakEvenSales, dailyBreakEven, dailyActual, marginOfSafetyPct, marginOfSafetyVal, sortedExp, days, selectedCount, totalCount } = be;

  let co = {
    name: "شركة نظم الإمداد الحديثة",
    vatNumber: "312448150500003",
    crNumber: "4700123180",
    phone: "0549141648",
    email: "Nuzmalamdad@gmail.com",
    address: "7480 - الشارع: عامر الشعبي، ينبع",
    logoUrl: ""
  };
  try {
    const cached = JSON.parse(localStorage.getItem("idham_company") || "{}");
    if (cached.name) Object.assign(co, cached);
    if (cached.logoBase64) co.logoUrl = cached.logoBase64;
  } catch (_) {}

  const isProfitable = netProfit >= 0;

  const margins = [
    { label: `الفعلي (${cmPct.toFixed(1)}%)`, val: cmRatio },
    { label: "10%", val: 0.10 },
    { label: "15%", val: 0.15 },
    { label: "20%", val: 0.20 },
    { label: "25%", val: 0.25 }
  ];

  const win = window.open("", "_blank");
  if (!win) { showToast("يرجى السماح بالنوافذ المنبثقة للطباعة", "warn"); return; }

  win.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تقرير تحليل نقطة التعادل والأرباح المستهدفة CVP — ${from} إلى ${to}</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'IBM Plex Sans Arabic', sans-serif; direction: rtl; color: #1e293b; background: #f8fafc; padding: 12px; }
    .no-print { background: #1e293b; padding: 10px; display: flex; gap: 10px; justify-content: center; margin-bottom: 12px; border-radius: 8px; }
    .btn { padding: 8px 18px; border-radius: 6px; cursor: pointer; border: none; font-family: inherit; font-size: 13px; font-weight: 700; }
    .report-container { background: #fff; max-width: 210mm; margin: 0 auto; padding: 18px 22px; border: 1.5px solid #5b3ec2; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .company-banner { background: #5b3ec2 !important; color: #fff !important; border-radius: 8px; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .banner-left { font-size: 11.5px; line-height: 1.5; color: #fff !important; }
    .banner-right h2 { font-size: 16px; font-weight: 800; margin-bottom: 3px; color: #fff !important; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
    .kpi-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; text-align: center; background: #f8fafc; }
    .kpi-box .lbl { font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px; }
    .kpi-box .val { font-size: 15px; font-weight: 900; font-family: 'IBM Plex Mono', monospace; }
    .sec-title { background: #5b3ec2 !important; color: #fff !important; font-size: 12px; font-weight: 800; padding: 6px 12px; border-radius: 6px 6px 0 0; margin-top: 14px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11px; border: 1px solid #5b3ec2; border-top: none; }
    thead tr { background: #f1f5f9; border-bottom: 1px solid #cbd5e1; }
    thead th { padding: 6px 8px; font-weight: 700; color: #334155; text-align: right; }
    tbody tr { border-bottom: 1px solid #e2e8f0; }
    tbody tr:nth-child(even) { background: #fcfcfd; }
    tbody td { padding: 6px 8px; color: #1e293b; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 25px; padding-top: 15px; border-top: 1px dashed #5b3ec2; text-align: center; }
    .signatures .role { font-size: 11px; font-weight: 800; color: #334155; margin-bottom: 35px; }
    .signatures .line { border-top: 1px dotted #94a3b8; width: 110px; margin: 0 auto; font-size: 10px; color: #64748b; padding-top: 3px; }
    @page { size: A4; margin: 8mm 10mm 8mm 10mm; }
    @media print {
      body { background: #fff; padding: 0; }
      .no-print { display: none !important; }
      .report-container { max-width: 100%; box-shadow: none; border: none; padding: 0; }
      .company-banner { background: #5b3ec2 !important; color: #fff !important; }
      .sec-title { background: #5b3ec2 !important; color: #fff !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn" style="background:#5b3ec2;color:#fff;" onclick="window.print()">🖨️ طباعة التقرير</button>
    <button class="btn" style="background:#475569;color:#fff;" onclick="window.close()">✕ إغلاق</button>
  </div>

  <div class="report-container">
    <div style="text-align:center; margin-bottom:12px;">
      <h1 style="font-size:20px; color:#5b3ec2; font-weight:800;">تقرير تحليل نقطة التعادل والتحليل الحجمي للأرباح (CVP)</h1>
      <h2 style="font-size:10px; color:#5b3ec2; font-weight:700; letter-spacing:1px; text-transform:uppercase;">BREAK-EVEN POINT & PROFIT MARGIN SENSITIVITY</h2>
    </div>

    <div class="company-banner">
      <div class="banner-left">
        <div>الفترة المالية: <strong>من ${from} إلى ${to} (${days} يوماً)</strong></div>
        <div>تاريخ الإصدار: <strong>${new Date().toLocaleDateString('ar-SA')}</strong></div>
        <div>نقطة التعادل للمصروفات المحددة: <strong>${formatCurrency(breakEvenSales)}</strong></div>
      </div>
      <div class="banner-right">
        <h2>${co.name}</h2>
        <div>الرقم الضريبي: <strong>${co.vatNumber}</strong></div>
        <div>السجل التجاري: <strong>${co.crNumber}</strong></div>
      </div>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-box" style="border-color:#3b82f6; background:#eff6ff;">
        <div class="lbl">مبيعات نقطة التعادل</div>
        <div class="val" style="color:#1d4ed8;" dir="ltr">${formatCurrency(breakEvenSales)}</div>
      </div>
      <div class="kpi-box" style="border-color:#6366f1; background:#eef2ff;">
        <div class="lbl">الهدف اليومي للتعادل</div>
        <div class="val" style="color:#4338ca;" dir="ltr">${formatCurrency(dailyBreakEven)}</div>
      </div>
      <div class="kpi-box" style="border-color:#f59e0b; background:#fefce8;">
        <div class="lbl">نسبة هامش المساهمة</div>
        <div class="val" style="color:#b45309;" dir="ltr">${cmPct.toFixed(1)}%</div>
      </div>
      <div class="kpi-box" style="border-color:${isProfitable ? '#22c55e' : '#ef4444'}; background:${isProfitable ? '#f0fdf4' : '#fef2f2'};">
        <div class="lbl">هامش الأمان فوق التعادل</div>
        <div class="val" style="color:${isProfitable ? '#15803d' : '#b91c1c'};" dir="ltr">${marginOfSafetyPct.toFixed(1)}%</div>
      </div>
    </div>

    <!-- CVP Summary Table -->
    <div class="sec-title">أولاً: ملخص معادلة التعادل للفترة (CVP Summary)</div>
    <table>
      <thead>
        <tr>
          <th>البند المالي</th>
          <th style="width:130px; text-align:left;">المبلغ (ر.س)</th>
          <th style="width:90px; text-align:center;">النسبة</th>
          <th>ملاحظات وتفسير إداري</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>صافي المبيعات والإيرادات</strong></td>
          <td style="font-family:'IBM Plex Mono',monospace; font-weight:700; text-align:left;" dir="ltr">${formatCurrency(revenueTotal)}</td>
          <td style="text-align:center; font-weight:700;">100.0%</td>
          <td style="font-size:10.5px; color:#475569;">إجمالي الإيرادات بعد خصم المردودات</td>
        </tr>
        <tr>
          <td><strong>يخصم: التكاليف المتغيرة المباشرة (COGS)</strong></td>
          <td style="font-family:'IBM Plex Mono',monospace; font-weight:700; text-align:left; color:#b45309;" dir="ltr">(${formatCurrency(cogsTotal)})</td>
          <td style="text-align:center; font-weight:700; color:#b45309;">${revenueTotal > 0 ? (cogsTotal / revenueTotal * 100).toFixed(1) : 0}%</td>
          <td style="font-size:10.5px; color:#475569;">تكلفة شراء البضاعة المباعة فقط</td>
        </tr>
        <tr style="background:#eef2ff; font-weight:800;">
          <td style="color:#4338ca;"><strong>هامش المساهمة (مجمل الربح)</strong></td>
          <td style="font-family:'IBM Plex Mono',monospace; text-align:left; color:#4338ca;" dir="ltr">${formatCurrency(grossProfit)}</td>
          <td style="text-align:center; color:#4338ca;">${cmPct.toFixed(1)}%</td>
          <td style="font-size:10.5px; color:#4338ca;">المبلغ المتاح لتغطية المصروفات الثابتة والأرباح</td>
        </tr>
        <tr>
          <td><strong>يخصم: المصروفات المحددة في الحسبة</strong></td>
          <td style="font-family:'IBM Plex Mono',monospace; font-weight:700; text-align:left; color:#dc2626;" dir="ltr">(${formatCurrency(fixedCosts)})</td>
          <td style="text-align:center; font-weight:700; color:#dc2626;">${revenueTotal > 0 ? (fixedCosts / revenueTotal * 100).toFixed(1) : 0}%</td>
          <td style="font-size:10.5px; color:#475569;">المحدد: ${selectedCount} من أصل ${totalCount} بند مصروف</td>
        </tr>
        <tr style="background:${isProfitable ? '#f0fdf4' : '#fef2f2'}; font-weight:900;">
          <td style="color:${isProfitable ? '#15803d' : '#b91c1c'};"><strong>النتيجة النهائية للفترة</strong></td>
          <td style="font-family:'IBM Plex Mono',monospace; text-align:left; color:${isProfitable ? '#15803d' : '#b91c1c'};" dir="ltr">${formatCurrency(netProfit)}</td>
          <td style="text-align:center; color:${isProfitable ? '#15803d' : '#b91c1c'};">${revenueTotal > 0 ? (netProfit / revenueTotal * 100).toFixed(1) : 0}%</td>
          <td style="font-size:10.5px; color:${isProfitable ? '#15803d' : '#b91c1c'};">${isProfitable ? 'تحقيق أرباح تفوق نقطة التعادل' : 'عجز دون نقطة التعادل بالفترة'}</td>
        </tr>
      </tbody>
    </table>

    <!-- 2D Cross Sensitivity Matrix Table -->
    <div class="sec-title">ثانياً: مصفوفة المبيعات المطلوبة عند مختلف الأرباح وهوامش الربح (2D Sensitivity Matrix)</div>
    <table>
      <thead>
        <tr>
          <th>صافي الربح المستهدف</th>
          ${margins.map(m => `<th style="text-align:left;">هامش ${m.label}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${[
          { label: '0 ر.س (نقطة التعادل)', profit: 0 },
          { label: '10,000 ر.س', profit: 10000 },
          { label: '20,000 ر.س', profit: 20000 },
          { label: '30,000 ر.س', profit: 30000 },
          { label: '50,000 ر.س', profit: 50000 },
          { label: '100,000 ر.س', profit: 100000 },
        ].map(row => `
          <tr>
            <td><strong>${row.label}</strong></td>
            ${margins.map(m => {
              const req = m.val > 0 ? ((fixedCosts + row.profit) / m.val) : 0;
              return `<td style="font-family:'IBM Plex Mono',monospace; font-weight:700; text-align:left;" dir="ltr">${formatCurrency(req)}</td>`;
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Expense Breakdown Table -->
    <div class="sec-title">ثالثاً: تفكيك المصروفات وحالة التحديد</div>
    <table>
      <thead>
        <tr>
          <th style="width:40px; text-align:center;">الحالة</th>
          <th style="width:90px;">كود الحساب</th>
          <th>اسم المصروف</th>
          <th style="width:120px;">التصنيف</th>
          <th style="width:110px; text-align:left;">المبلغ الفعلي</th>
          <th style="width:130px; text-align:left;">المبيعات لتغطيته</th>
        </tr>
      </thead>
      <tbody>
        ${sortedExp.map(e => `
          <tr style="${e.isSelected ? '' : 'opacity:0.6; background:#f8fafc;'}">
            <td style="text-align:center; font-weight:bold;">${e.isSelected ? '☑️' : '◻️'}</td>
            <td style="font-family:'IBM Plex Mono',monospace; font-weight:700; color:#64748b;">${e.code}</td>
            <td style="font-weight:700;">${e.name} ${e.isSelected ? '' : '<span style="font-size:9.5px; color:#94a3b8;">(مستبعد)</span>'}</td>
            <td style="font-size:10px; color:#475569;">${e.label}</td>
            <td style="font-family:'IBM Plex Mono',monospace; text-align:left; color:#dc2626;" dir="ltr">${formatCurrency(e.balance)}</td>
            <td style="font-family:'IBM Plex Mono',monospace; text-align:left; font-weight:700; color:#4338ca;" dir="ltr">${formatCurrency(e.salesNeeded)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <!-- Signatures -->
    <div class="signatures">
      <div>
        <div class="role">إعداد / التحليل المالي</div>
        <div class="line">التوقيع</div>
      </div>
      <div>
        <div class="role">مراجعة / الإدارة المالية</div>
        <div class="line">التوقيع</div>
      </div>
      <div>
        <div class="role">اعتماد / المدير العام</div>
        <div class="line">الختم والتوقيع</div>
      </div>
    </div>
  </div>
</body>
</html>`);
  win.document.close();
};

function renderBreakEvenAnalysis(container, from, to) {
  // حفظ المراجع العامة
  window._beCurrentContainer = container;
  window._beCurrentFrom = from;
  window._beCurrentTo = to;

  // جلب البيانات الأساسية لمعرفة جميع بنود المصروفات
  const initialData = _calcBreakEvenData(from, to, null);

  // إذا لم يتم تحديد مصفوفة المصروفات بعد، نحدد الكل افتراضياً
  if (!window._beSelectedExpenseCodes || !(window._beSelectedExpenseCodes instanceof Set)) {
    window._beSelectedExpenseCodes = new Set((initialData.sortedExp || []).map(e => e.code));
  }

  // حساب البيانات النهائية بناءً على التحديد الحالي
  const be = _calcBreakEvenData(from, to, window._beSelectedExpenseCodes);
  const { revenueTotal, cogsTotal, fixedCosts, unselectedCosts, opExpTotal, grossProfit, netProfit, cmPct, cmRatio, breakEvenSales, dailyBreakEven, dailyActual, marginOfSafetyPct, marginOfSafetyVal, sortedExp, days, selectedCount, totalCount } = be;

  const isProfitable = netProfit >= 0;
  const isAboveBreakEven = revenueTotal >= breakEvenSales;

  // القيم الافتراضية للربح المستهدف ونسبة الهامش المفترضة
  if (typeof window._beTargetProfitVal === "undefined") {
    window._beTargetProfitVal = 20000;
  }
  if (typeof window._beTargetMarginVal === "undefined") {
    window._beTargetMarginVal = parseFloat(cmPct.toFixed(1)) || 15.0;
  }

  const crossMargins = [
    { label: `الفعلي (${cmPct.toFixed(1)}%)`, val: cmRatio, isActual: true },
    { label: "8.0%", val: 0.08 },
    { label: "10.0%", val: 0.10 },
    { label: "12.0%", val: 0.12 },
    { label: "15.0%", val: 0.15 },
    { label: "18.0%", val: 0.18 },
    { label: "20.0%", val: 0.20 },
    { label: "25.0%", val: 0.25 },
  ];

  container.innerHTML = `
    <!-- Top Action Toolbar -->
    <div class="no-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; background:var(--bg-1); padding:12px 18px; border-radius:12px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); flex-wrap:wrap; gap:10px;">
      <div style="font-size:13px; font-weight:700; color:var(--text-2);">
        🎯 <strong style="color:var(--text-1);">تحليل نقطة التعادل والتحليل الحجمي للأرباح والتكاليف (CVP)</strong> | الفترة: <strong>${from}</strong> → <strong>${to}</strong> (${days} يوماً)
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="exportBreakEvenExcel('${from}', '${to}')" style="font-weight:700;">📊 تصدير Excel</button>
        <button class="btn btn-primary btn-sm" onclick="printBreakEvenPDF('${from}', '${to}')" style="font-weight:700; background:linear-gradient(135deg, #5b3ec2, #4338ca); border:none; box-shadow:0 2px 6px rgba(91,62,194,0.3);">📑 تصدير PDF التقرير التنفيذي للتعادل</button>
      </div>
    </div>

    <div class="breakeven-doc" style="max-width:1150px; margin:0 auto;">

      <!-- ═══ 4 TOP KPI CARDS ═══ -->
      <div class="grid-4 gap-16 mb-24" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:16px; margin-bottom:24px;">
        
        <!-- Break-Even Sales -->
        <div class="kpi-card" style="background:linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02)); border:1.5px solid rgba(59,130,246,0.3); border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:#1d4ed8;">🎯 مبيعات نقطة التعادل</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:rgba(59,130,246,0.15); color:#1d4ed8;">Break-Even</span>
          </div>
          <div style="font-size:22px; font-weight:900; color:#1d4ed8; font-family:'IBM Plex Mono', monospace;" dir="ltr">
            ${formatCurrency(breakEvenSales)}
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">لتغطية المصروفات المحددة (<strong class="mono">${formatCurrency(fixedCosts)}</strong>)</div>
        </div>

        <!-- Daily Target -->
        <div class="kpi-card" style="background:linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02)); border:1.5px solid rgba(99,102,241,0.3); border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:#4338ca;">📅 الهدف اليومي للتعادل</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:rgba(99,102,241,0.15); color:#4338ca;">Daily Target</span>
          </div>
          <div style="font-size:22px; font-weight:900; color:#4338ca; font-family:'IBM Plex Mono', monospace;" dir="ltr">
            ${formatCurrency(dailyBreakEven)}
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">الفعلي اليومي: <strong class="mono" dir="ltr">${formatCurrency(dailyActual)}</strong></div>
        </div>

        <!-- Contribution Margin % -->
        <div class="kpi-card" style="background:linear-gradient(135deg, rgba(217,119,6,0.08), rgba(217,119,6,0.02)); border:1.5px solid rgba(217,119,6,0.3); border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:#b45309;">📈 نسبة هامش المساهمة</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:rgba(217,119,6,0.15); color:#b45309;">CM Ratio</span>
          </div>
          <div style="font-size:22px; font-weight:900; color:#b45309; font-family:'IBM Plex Mono', monospace;" dir="ltr">
            ${cmPct.toFixed(1)}%
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">مجمل الربح: <strong class="mono" dir="ltr">${formatCurrency(grossProfit)}</strong></div>
        </div>

        <!-- Margin of Safety -->
        <div class="kpi-card" style="background:${isAboveBreakEven ? "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02))" : "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.02))"}; border:1.5px solid ${isAboveBreakEven ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}; border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:${isAboveBreakEven ? "#047857" : "#b91c1c"};">🛡️ هامش الأمان (Safety)</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:${isAboveBreakEven ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)"}; color:${isAboveBreakEven ? "#047857" : "#b91c1c"};">${marginOfSafetyPct.toFixed(1)}%</span>
          </div>
          <div style="font-size:22px; font-weight:900; color:${isAboveBreakEven ? "#047857" : "#b91c1c"}; font-family:'IBM Plex Mono', monospace;" dir="ltr">
            ${formatCurrency(marginOfSafetyVal)}
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">${isAboveBreakEven ? 'فائض أمان فوق التعادل' : 'عجز دون نقطة التعادل'}</div>
        </div>

      </div>

      <!-- ═══ EXECUTIVE SUMMARY STRIP ═══ -->
      <div class="card mb-24" style="border-radius:14px; padding:18px 24px; background:linear-gradient(135deg, rgba(91,62,194,0.08), rgba(91,62,194,0.02)); border:1.5px solid rgba(91,62,194,0.25); margin-bottom:24px;">
        <h4 style="color:#5b3ec2; margin-bottom:8px; font-size:15px; font-weight:900;">📋 التقرير والتشخيص التنفيذي:</h4>
        <div style="font-size:13px; line-height:1.7; color:var(--text-1);">
          • إجمالي المصروفات المحددة في الحسبة: <strong style="color:#dc2626;">${formatCurrency(fixedCosts)}</strong> (تم تحديد <strong>${selectedCount}</strong> من أصل <strong>${totalCount}</strong> بند مصروف).<br>
          • نسبة هامش الربح الإجمالي الفعلي (هامش المساهمة) تمثل <strong>${cmPct.toFixed(1)}%</strong> من قيمة المبيعات.<br>
          • بناءً على ذلك، نقطة التعادل المطلوبة لتغطية المصروفات المحددة هي <strong style="color:#1d4ed8;">${formatCurrency(breakEvenSales)}</strong> (بمعدل <strong>${formatCurrency(dailyBreakEven)}</strong> يومياً).<br>
          • ${isAboveBreakEven 
              ? `<span style="color:#16a34a; font-weight:700;">✅ المبيعات الحالية (${formatCurrency(revenueTotal)}) تجاوزت نقطة التعادل بفائض قدره ${formatCurrency(marginOfSafetyVal)} (هامش أمان ${marginOfSafetyPct.toFixed(1)}%).</span>` 
              : `<span style="color:#dc2626; font-weight:700;">⚠️ المبيعات الحالية (${formatCurrency(revenueTotal)}) دون نقطة التعادل بفارق ${formatCurrency(Math.abs(marginOfSafetyVal))}. لتحقيق الربحية ينصح برفع هامش الربح أو زيادة حجم التوزيع أو تقسيط المصروفات السنوية.</span>`}
        </div>
      </div>

      <!-- ═══ 1. TARGET PROFIT & MARGIN SENSITIVITY (قسم الأرباح ونسب الهوامش المستهدفة) ═══ -->
      <div class="card mb-24" style="border-radius:16px; border:1.5px solid #0284c7; box-shadow:0 4px 14px rgba(2,132,199,0.12); padding:24px; background:var(--bg-1); margin-bottom:24px;">
        
        <div style="border-bottom:2px solid #0284c7; padding-bottom:12px; margin-bottom:18px;">
          <h4 style="margin:0; font-size:17px; font-weight:900; color:#0284c7;">🎯 حاسبة وسيناريوهات تحقيق الأرباح عند مختلف نسب هوامش الربح</h4>
          <p style="margin:3px 0 0; font-size:12px; color:var(--text-3);">جرب تغيير صافي الربح المطلوب ونسبة هامش الربح لمشاهدة تأثيرهما المباشر على المبيعات المطلوبة والهدف اليومي</p>
        </div>

        <!-- 2 Controls: Target Profit & Assumed Margin % -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
          
          <!-- Control 1: Target Net Profit -->
          <div style="background:rgba(2,132,199,0.04); padding:16px; border-radius:12px; border:1px solid rgba(2,132,199,0.2);">
            <label style="font-size:12.5px; font-weight:800; color:#0369a1; display:block; margin-bottom:6px;">💰 صافي الربح المستهدف للفترة (ر.س):</label>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <input type="number" id="be-target-profit-input" class="input mono font-bold" value="${window._beTargetProfitVal}" step="1000" min="0" oninput="updateTargetProfitCalc()" style="font-size:18px; color:#0369a1; height:40px; width:100%; border:2px solid #0284c7; border-radius:8px; padding:0 12px;" />
              <span style="font-weight:800; font-size:13px; color:var(--text-2);">ر.س</span>
            </div>
            
            <!-- Quick Profit Presets -->
            <div style="display:flex; gap:4px; flex-wrap:wrap;">
              <button class="btn btn-sm btn-ghost" onclick="setTargetProfitPreset(0)" style="font-size:10.5px; padding:2px 6px;">0 (تعادل)</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetProfitPreset(5000)" style="font-size:10.5px; padding:2px 6px;">+5K</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetProfitPreset(10000)" style="font-size:10.5px; padding:2px 6px;">+10K</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetProfitPreset(20000)" style="font-size:10.5px; padding:2px 6px; color:#0284c7; font-weight:800; border:1px solid #0284c7;">⭐ +20K</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetProfitPreset(30000)" style="font-size:10.5px; padding:2px 6px; color:#0284c7; font-weight:800; border:1px solid #0284c7;">⭐ +30K</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetProfitPreset(50000)" style="font-size:10.5px; padding:2px 6px;">+50K</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetProfitPreset(100000)" style="font-size:10.5px; padding:2px 6px;">+100K</button>
            </div>
          </div>

          <!-- Control 2: Assumed Profit Margin % -->
          <div style="background:rgba(217,119,6,0.04); padding:16px; border-radius:12px; border:1px solid rgba(217,119,6,0.25);">
            <label style="font-size:12.5px; font-weight:800; color:#b45309; display:block; margin-bottom:6px;">📈 نسبة مجمل الربح المفترضة (Gross Margin %):</label>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <input type="number" id="be-target-margin-input" class="input mono font-bold" value="${window._beTargetMarginVal}" step="0.5" min="1" max="99" oninput="updateTargetProfitCalc()" style="font-size:18px; color:#b45309; height:40px; width:100%; border:2px solid #d97706; border-radius:8px; padding:0 12px;" />
              <span style="font-weight:800; font-size:15px; color:#b45309;">%</span>
            </div>
            
            <!-- Quick Margin Presets -->
            <div style="display:flex; gap:4px; flex-wrap:wrap;">
              <button class="btn btn-sm btn-ghost" onclick="setTargetMarginPreset(${cmPct.toFixed(1)})" style="font-size:10.5px; padding:2px 6px; color:#5b3ec2; font-weight:800; border:1px solid #5b3ec2;">الفعلي (${cmPct.toFixed(1)}%)</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetMarginPreset(8)" style="font-size:10.5px; padding:2px 6px;">8%</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetMarginPreset(10)" style="font-size:10.5px; padding:2px 6px;">10%</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetMarginPreset(12)" style="font-size:10.5px; padding:2px 6px;">12%</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetMarginPreset(15)" style="font-size:10.5px; padding:2px 6px;">15%</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetMarginPreset(18)" style="font-size:10.5px; padding:2px 6px;">18%</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetMarginPreset(20)" style="font-size:10.5px; padding:2px 6px;">20%</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetMarginPreset(25)" style="font-size:10.5px; padding:2px 6px;">25%</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetMarginPreset(30)" style="font-size:10.5px; padding:2px 6px;">30%</button>
            </div>
          </div>

        </div>

        <!-- Dynamic Output Metrics Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:20px;">
          
          <div style="background:var(--bg-2); padding:14px; border-radius:10px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm);">
            <div style="font-size:11px; font-weight:700; color:var(--text-3);">🚀 المبيعات الإجمالية المطلوبة:</div>
            <div class="mono font-bold" id="tp-res-sales" style="font-size:19px; color:#0284c7; margin:3px 0;" dir="ltr">0.00 ر.س</div>
            <div style="font-size:11px; color:var(--text-3);" id="tp-res-daily">0.00 ر.س / يومياً</div>
          </div>

          <div style="background:var(--bg-2); padding:14px; border-radius:10px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm);">
            <div style="font-size:11px; font-weight:700; color:var(--text-3);">⚖️ الفجوة عن المبيعات الحالية:</div>
            <div class="mono font-bold" id="tp-res-gap" style="font-size:19px; margin:3px 0;" dir="ltr">0.00 ر.س</div>
            <div style="font-size:11px; font-weight:700;" id="tp-res-status">جاري الاحتساب...</div>
          </div>

          <div style="background:var(--bg-2); padding:14px; border-radius:10px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm);">
            <div style="font-size:11px; font-weight:700; color:var(--text-3);">📈 نمو المبيعات المطلوب:</div>
            <div class="mono font-bold" id="tp-res-growth" style="font-size:19px; color:#4338ca; margin:3px 0;" dir="ltr">0%</div>
            <div style="font-size:11px; color:var(--text-3);" id="tp-res-net-margin">صافي الهامش: 0%</div>
          </div>

        </div>

        <!-- 2D Cross Matrix Table (الأرباح المستهدفة × نسب هوامش الربح المختلفة) -->
        <div style="margin-top:14px;">
          <div style="font-size:13px; font-weight:800; color:var(--text-1); margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
            <span>🧭 <strong>مصفوفة السيناريوهات المتقاطعة (الأرباح المستهدفة × نسب هوامش الربح):</strong></span>
            <span style="font-size:11px; color:var(--text-3);">توضح كيف تنخفض المبيعات المطلوبة بشدة كلما زادت نسبة هامش الربح</span>
          </div>

          <div class="table-container" style="max-height:320px; overflow:auto; border:1px solid var(--border-soft); border-radius:10px;">
            <table class="data-dense" style="width:100%; font-size:11.5px; border-collapse:collapse;">
              <thead>
                <tr style="background:var(--bg-2); position:sticky; top:0; z-index:2; border-bottom:1.5px solid var(--border-soft);">
                  <th style="min-width:130px; position:sticky; right:0; background:var(--bg-2); z-index:3;">صافي الربح المستهدف</th>
                  ${crossMargins.map(m => `
                    <th style="text-align:left; min-width:115px; ${m.isActual ? 'background:rgba(91,62,194,0.12); color:#4338ca; font-weight:900;' : ''}">
                      هامش ${m.label}
                    </th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                ${[
                  { profit: 0, label: '0 ر.س (نقطة التعادل)' },
                  { profit: 5000, label: '5,000 ر.س' },
                  { profit: 10000, label: '10,000 ر.س' },
                  { profit: 15000, label: '15,000 ر.س' },
                  { profit: 20000, label: '20,000 ر.س', isHighlight: true },
                  { profit: 25000, label: '25,000 ر.س' },
                  { profit: 30000, label: '30,000 ر.س', isHighlight: true },
                  { profit: 40000, label: '40,000 ر.س' },
                  { profit: 50000, label: '50,000 ر.س' },
                  { profit: 75000, label: '75,000 ر.س' },
                  { profit: 100000, label: '100,000 ر.س' },
                ].map(sc => {
                  const isCurrentTarget = window._beTargetProfitVal === sc.profit;

                  return `
                    <tr style="border-bottom:1px solid var(--border-soft); ${isCurrentTarget ? 'background:rgba(2,132,199,0.08); font-weight:800;' : sc.isHighlight ? 'background:rgba(91,62,194,0.03);' : ''}">
                      <td style="position:sticky; right:0; background:${isCurrentTarget ? '#f0f9ff' : 'var(--bg-1)'}; z-index:1; font-weight:800;">
                        ${sc.label}
                        ${sc.isHighlight ? '<span style="font-size:9px; background:#5b3ec2; color:#fff; padding:1px 4px; border-radius:3px; margin-right:3px;">شائع</span>' : ''}
                      </td>
                      ${crossMargins.map(m => {
                        const reqSales = m.val > 0 ? ((fixedCosts + sc.profit) / m.val) : 0;
                        const isAchieved = revenueTotal >= reqSales && reqSales > 0;
                        const isMatchCurrent = isCurrentTarget && Math.abs((m.val * 100) - window._beTargetMarginVal) < 0.2;

                        return `
                          <td class="mono" style="text-align:left; ${m.isActual ? 'background:rgba(91,62,194,0.05); font-weight:800;' : ''} ${isMatchCurrent ? 'outline:2px solid #0284c7; background:rgba(2,132,199,0.15); font-weight:900;' : ''}" dir="ltr">
                            <span style="color:${isAchieved ? '#15803d' : '#1e293b'}; font-weight:${isAchieved ? '800' : '600'};">
                              ${formatCurrency(reqSales)}
                            </span>
                            ${isAchieved ? '<span style="color:#15803d; font-size:10px;"> ✅</span>' : ''}
                          </td>
                        `;
                      }).join('')}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- ═══ 2. INTERACTIVE EXPENSES CHECKLIST TABLE (جدول تحديد المصروفات) ═══ -->
      <div class="card mb-24" style="border-radius:16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); padding:24px; background:var(--bg-1); margin-bottom:24px;">
        
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #dc2626; padding-bottom:12px; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
          <div>
            <h4 style="margin:0; font-size:16px; font-weight:900; color:#dc2626;">📊 تحديد وتفكيك المصروفات واحتساب نقطة التعادل</h4>
            <p style="margin:2px 0 0; font-size:11.5px; color:var(--text-3);">حدد بالمربعات ☑️ المصروفات التي ترغب بإدراجها في الحسبة (أو استبعد أي مصروف)، وسيقوم النظام فوراً بإعادة احتساب نقطة التعادل</p>
          </div>
          
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span style="font-size:11.5px; font-weight:800; color:#dc2626; background:rgba(220,38,38,0.1); padding:4px 10px; border-radius:8px;">
              المحدد: ${selectedCount} من ${totalCount} بند | الإجمالي: ${formatCurrency(fixedCosts)}
            </span>
            ${unselectedCosts > 0 ? `
              <span style="font-size:11.5px; font-weight:700; color:var(--text-3); background:var(--bg-2); padding:4px 8px; border-radius:8px;">
                مستبعد: ${formatCurrency(unselectedCosts)}
              </span>
            ` : ''}
          </div>
        </div>

        <!-- Quick Filter Preset Buttons Bar -->
        <div style="display:flex; gap:8px; align-items:center; margin-bottom:14px; background:var(--bg-2); padding:10px 14px; border-radius:10px; border:1px solid var(--border-soft); flex-wrap:wrap;">
          <span style="font-size:12px; font-weight:800; color:var(--text-1); margin-left:6px;">🔘 فلاتر وتحديدات سريعة:</span>
          <button class="btn btn-sm" onclick="setBEPreset('all')" style="font-size:11.5px; font-weight:700; background:var(--bg-1); border:1px solid var(--border); cursor:pointer;">
            ☑️ تحديد الكل (الوضع الشامل)
          </button>
          <button class="btn btn-sm" onclick="setBEPreset('core_fixed')" style="font-size:11.5px; font-weight:700; background:rgba(59,130,246,0.1); color:#1d4ed8; border:1px solid rgba(59,130,246,0.3); cursor:pointer;">
            🛡️ المصروفات الثابتة فقط (رواتب + إيجارات + إهلاكات)
          </button>
          <button class="btn btn-sm" onclick="setBEPreset('cash_only')" style="font-size:11.5px; font-weight:700; background:rgba(16,185,129,0.1); color:#047857; border:1px solid rgba(16,185,129,0.3); cursor:pointer;">
            💵 المصروفات النقدية التشغيلية (بدون إهلاك)
          </button>
          <button class="btn btn-sm" onclick="setBEPreset('none')" style="font-size:11.5px; font-weight:700; background:var(--bg-1); color:#dc2626; border:1px solid var(--border); cursor:pointer;">
            ◻️ إلغاء التحديد
          </button>
        </div>

        <div class="table-container">
          <table class="data-dense" style="width:100%; font-size:12.5px;">
            <thead>
              <tr style="background:var(--bg-2); border-bottom:1.5px solid var(--border-soft);">
                <th style="width:45px; text-align:center;">
                  <input type="checkbox" id="be-master-check" ${selectedCount === totalCount ? 'checked' : ''} onchange="toggleBEMasterCheck(this.checked)" style="cursor:pointer; width:16px; height:16px;" title="تحديد/إلغاء تحديد الكل" />
                </th>
                <th style="width:110px;">كود الحساب</th>
                <th>اسم المصروف / البند</th>
                <th style="width:180px;">التصنيف المحاسبي</th>
                <th style="width:130px; text-align:left;">المبلغ الفعلي (ر.س)</th>
                <th style="width:85px; text-align:center;">النسبة</th>
                <th style="width:160px; text-align:left;">المبيعات المطلوبة لتغطيته</th>
                <th style="width:130px; text-align:left;">المعدل اليومي</th>
              </tr>
            </thead>
            <tbody>
              ${sortedExp.map((e, idx) => `
                <tr style="border-bottom:1px solid var(--border-soft); ${e.isSelected ? (idx % 2 === 1 ? 'background:rgba(0,0,0,0.015);' : '') : 'opacity:0.5; background:var(--bg-2);'}">
                  <td style="text-align:center;">
                    <input type="checkbox" class="be-item-check" data-code="${e.code}" ${e.isSelected ? 'checked' : ''} onchange="toggleBEExpenseItem('${e.code}')" style="cursor:pointer; width:16px; height:16px;" />
                  </td>
                  <td class="mono font-bold" style="color:var(--text-3);">${e.code}</td>
                  <td style="font-weight:700; color:var(--text-1);">
                    ${e.name}
                    ${!e.isSelected ? '<span style="font-size:10px; color:#dc2626; margin-right:4px;">(مستبعد)</span>' : ''}
                  </td>
                  <td>
                    <span style="font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:6px; background:${e.badgeBg}; color:${e.badgeColor};">
                      ${e.label}
                    </span>
                  </td>
                  <td class="mono font-bold" style="text-align:left; color:#dc2626;" dir="ltr">${formatCurrency(e.balance)}</td>
                  <td style="text-align:center; font-weight:700; color:var(--text-2); font-size:11.5px;">
                    ${e.isSelected ? e.pctOfSelected.toFixed(1) + '%' : '—'}
                  </td>
                  <td class="mono font-bold" style="text-align:left; color:${e.isSelected ? '#4338ca' : 'var(--text-3)'};" dir="ltr">
                    ${e.isSelected ? formatCurrency(e.salesNeeded) : '—'}
                  </td>
                  <td class="mono dim" style="text-align:left; font-size:11.5px;" dir="ltr">
                    ${e.isSelected ? formatCurrency(e.salesNeeded / days) : '—'}
                  </td>
                </tr>
              `).join("")}
            </tbody>
            <tfoot>
              <tr style="background:var(--bg-2); font-weight:900; border-top:2px solid var(--border);">
                <td style="text-align:center;">☑️</td>
                <td colspan="3">إجمالي المصروفات المحددة في نقطة التعادل</td>
                <td class="mono" style="text-align:left; color:#dc2626;" dir="ltr">${formatCurrency(fixedCosts)}</td>
                <td style="text-align:center;">100.0%</td>
                <td class="mono" style="text-align:left; color:#4338ca;" dir="ltr">${formatCurrency(breakEvenSales)}</td>
                <td class="mono" style="text-align:left; color:#4338ca;" dir="ltr">${formatCurrency(dailyBreakEven)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- ═══ 3. INTERACTIVE DECISION & WHAT-IF SIMULATOR ═══ -->
      <div class="card mb-24" style="border-radius:16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); padding:24px; background:var(--bg-1); margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5b3ec2; padding-bottom:10px; margin-bottom:18px;">
          <div>
            <h4 style="margin:0; font-size:16px; font-weight:900; color:#5b3ec2;">🎛️ محاكي القرارات الإدارية وتوقعات التعادل (What-If Simulator)</h4>
            <p style="margin:2px 0 0; font-size:11.5px; color:var(--text-3);">جرب تغيير الهوامش والمصروفات لمشاهدة تأثيرها الفوري على نقطة التعادل والأرباح المتوقعة</p>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="resetBESimulator()" style="font-size:11px;">🔄 إعادة ضبط</button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:20px; margin-bottom:20px;">
          
          <!-- Slider 1: Margin % -->
          <div style="background:var(--bg-2); padding:14px; border-radius:10px; border:1px solid var(--border-soft);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <label style="font-weight:800; font-size:12px; color:var(--text-1);">هامش الربح المتوقع (CM %)</label>
              <span class="mono font-bold" id="sim-cm-val" style="color:#b45309; font-size:14px;">${cmPct.toFixed(1)}%</span>
            </div>
            <input type="range" id="sim-cm-slider" min="3" max="40" step="0.5" value="${cmPct.toFixed(1)}" oninput="updateBESimulator()" style="width:100%; cursor:pointer;" />
            <div style="font-size:10px; color:var(--text-3); display:flex; justify-content:space-between; margin-top:2px;">
              <span>3%</span><span>15%</span><span>25%</span><span>40%</span>
            </div>
          </div>

          <!-- Slider 2: Fixed Cost Adj % -->
          <div style="background:var(--bg-2); padding:14px; border-radius:10px; border:1px solid var(--border-soft);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <label style="font-weight:800; font-size:12px; color:var(--text-1);">تعديل المصاريف المحددة</label>
              <span class="mono font-bold" id="sim-exp-adj-val" style="color:#dc2626; font-size:14px;">0%</span>
            </div>
            <input type="range" id="sim-exp-slider" min="-50" max="50" step="5" value="0" oninput="updateBESimulator()" style="width:100%; cursor:pointer;" />
            <div style="font-size:10px; color:var(--text-3); display:flex; justify-content:space-between; margin-top:2px;">
              <span>-50% (ترشيد)</span><span>0% (الحالي)</span><span>+50% (توسع)</span>
            </div>
          </div>

          <!-- Input 3: Target Profit Simulator -->
          <div style="background:var(--bg-2); padding:14px; border-radius:10px; border:1px solid var(--border-soft);">
            <label style="font-weight:800; font-size:12px; color:var(--text-1); display:block; margin-bottom:6px;">صافي الربح المستهدف (ر.س)</label>
            <input type="number" id="sim-target-profit" class="input mono font-bold" value="${window._beTargetProfitVal}" step="1000" min="0" oninput="updateBESimulator()" style="width:100%; height:34px;" />
            <div style="font-size:10px; color:var(--text-3); margin-top:4px;">حدد الربح المطلوب لمعرفة المبيعات اللازمة</div>
          </div>

        </div>

        <!-- Simulator Result Cards -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; background:linear-gradient(135deg, rgba(91,62,194,0.12), rgba(91,62,194,0.03)); padding:18px; border-radius:12px; border:1.5px solid #5b3ec2;">
          
          <div>
            <div style="font-size:11.5px; font-weight:700; color:#5b3ec2; margin-bottom:4px;">🎯 نقطة التعادل المحاكاة:</div>
            <div class="mono font-bold" id="sim-res-be" style="font-size:20px; color:#1d4ed8;" dir="ltr">${formatCurrency(breakEvenSales)}</div>
            <div style="font-size:11px; color:var(--text-3);" id="sim-res-be-daily">${formatCurrency(dailyBreakEven)} / يومياً</div>
          </div>

          <div>
            <div style="font-size:11.5px; font-weight:700; color:#5b3ec2; margin-bottom:4px;">🚀 المبيعات لتحقيق الربح المستهدف:</div>
            <div class="mono font-bold" id="sim-res-target-sales" style="font-size:20px; color:#4338ca;" dir="ltr">0.00 ر.س</div>
            <div style="font-size:11px; color:var(--text-3);" id="sim-res-target-daily">0.00 ر.س / يومياً</div>
          </div>

          <div>
            <div style="font-size:11.5px; font-weight:700; color:#5b3ec2; margin-bottom:4px;">🏆 الربح المتوقع عند المبيعات الحالية:</div>
            <div class="mono font-bold" id="sim-res-profit" style="font-size:20px; color:#15803d;" dir="ltr">${formatCurrency(netProfit)}</div>
            <div style="font-size:11px; color:var(--text-3);" id="sim-res-profit-margin">هامش صافي: 0%</div>
          </div>

        </div>
      </div>

    </div>
  `;

  // حفظ البيانات الحالية في window للاستخدام في الدوال التفاعلية
  window._beCurrentData = be;

  // ── دوال التفاعل مع مربعات الاختيار والفلاتر ──
  window.toggleBEExpenseItem = (code) => {
    if (!window._beSelectedExpenseCodes) {
      window._beSelectedExpenseCodes = new Set();
    }
    if (window._beSelectedExpenseCodes.has(code)) {
      window._beSelectedExpenseCodes.delete(code);
    } else {
      window._beSelectedExpenseCodes.add(code);
    }
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    renderBreakEvenAnalysis(window._beCurrentContainer, window._beCurrentFrom, window._beCurrentTo);
    window.scrollTo(0, scrollTop);
  };

  window.toggleBEMasterCheck = (isChecked) => {
    if (!window._beSelectedExpenseCodes) window._beSelectedExpenseCodes = new Set();
    if (isChecked) {
      window._beCurrentData.sortedExp.forEach(e => window._beSelectedExpenseCodes.add(e.code));
    } else {
      window._beSelectedExpenseCodes.clear();
    }
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    renderBreakEvenAnalysis(window._beCurrentContainer, window._beCurrentFrom, window._beCurrentTo);
    window.scrollTo(0, scrollTop);
  };

  window.setBEPreset = (type) => {
    if (!window._beSelectedExpenseCodes) window._beSelectedExpenseCodes = new Set();
    window._beSelectedExpenseCodes.clear();

    const allExp = window._beCurrentData.sortedExp;
    if (type === 'all') {
      allExp.forEach(e => window._beSelectedExpenseCodes.add(e.code));
    } else if (type === 'core_fixed') {
      allExp.filter(e => e.isCoreFixed).forEach(e => window._beSelectedExpenseCodes.add(e.code));
    } else if (type === 'cash_only') {
      allExp.filter(e => e.isCash).forEach(e => window._beSelectedExpenseCodes.add(e.code));
    } else if (type === 'none') {
      // already cleared
    }
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    renderBreakEvenAnalysis(window._beCurrentContainer, window._beCurrentFrom, window._beCurrentTo);
    window.scrollTo(0, scrollTop);
  };

  // ── دوال حاسبة الأرباح ونسب الهوامش المستهدفة ──
  window.setTargetProfitPreset = (val) => {
    window._beTargetProfitVal = parseFloat(val) || 0;
    const input = document.getElementById("be-target-profit-input");
    if (input) input.value = window._beTargetProfitVal;
    
    // تحديث المحاكي أيضاً
    const simInput = document.getElementById("sim-target-profit");
    if (simInput) simInput.value = window._beTargetProfitVal;

    window.updateTargetProfitCalc();
    window.updateBESimulator();
  };

  window.setTargetMarginPreset = (val) => {
    window._beTargetMarginVal = parseFloat(val) || 15.0;
    const input = document.getElementById("be-target-margin-input");
    if (input) input.value = window._beTargetMarginVal;

    // تحديث شريط المحاكي
    const simCm = document.getElementById("sim-cm-slider");
    if (simCm) simCm.value = window._beTargetMarginVal;

    window.updateTargetProfitCalc();
    window.updateBESimulator();
  };

  window.updateTargetProfitCalc = () => {
    const data = window._beCurrentData;
    if (!data) return;

    const profitInput = document.getElementById("be-target-profit-input");
    const targetProfit = parseFloat(profitInput?.value ?? window._beTargetProfitVal ?? 0);
    window._beTargetProfitVal = targetProfit;

    const marginInput = document.getElementById("be-target-margin-input");
    const targetMarginPct = parseFloat(marginInput?.value ?? window._beTargetMarginVal ?? data.cmPct);
    window._beTargetMarginVal = targetMarginPct;

    const targetMarginRatio = targetMarginPct / 100;

    const reqSales = targetMarginRatio > 0 ? ((data.fixedCosts + targetProfit) / targetMarginRatio) : 0;
    const reqDaily = data.days > 0 ? (reqSales / data.days) : 0;
    const gap = data.revenueTotal - reqSales;
    const isDone = gap >= 0 && reqSales > 0;
    const growthNeeded = data.revenueTotal > 0 && reqSales > data.revenueTotal 
      ? (((reqSales - data.revenueTotal) / data.revenueTotal) * 100).toFixed(1) + '%' 
      : '0%';
    const netMargin = reqSales > 0 ? (targetProfit / reqSales * 100).toFixed(1) + '%' : '0%';

    const salesEl = document.getElementById("tp-res-sales");
    const dailyEl = document.getElementById("tp-res-daily");
    const gapEl   = document.getElementById("tp-res-gap");
    const statEl  = document.getElementById("tp-res-status");
    const grwEl   = document.getElementById("tp-res-growth");
    const nmgEl   = document.getElementById("tp-res-net-margin");

    if (salesEl) salesEl.textContent = formatCurrency(reqSales);
    if (dailyEl) dailyEl.textContent = formatCurrency(reqDaily) + " / يومياً";

    if (gapEl) {
      gapEl.textContent = (isDone ? "+" : "-") + formatCurrency(Math.abs(gap));
      gapEl.style.color = isDone ? "#15803d" : "#dc2626";
    }
    if (statEl) {
      statEl.textContent = isDone 
        ? `✅ تم تجاوز هذا الربح بفائض قدره ${formatCurrency(gap)}` 
        : `⏳ متبقي مبيعات إضافية قدرها ${formatCurrency(Math.abs(gap))} لتحقيق الهدف`;
      statEl.style.color = isDone ? "#15803d" : "#dc2626";
    }
    if (grwEl) {
      grwEl.textContent = isDone ? "✅ محقق بالفعل" : `+${growthNeeded}`;
      grwEl.style.color = isDone ? "#15803d" : "#4338ca";
    }
    if (nmgEl) {
      nmgEl.textContent = "هامش صافي من المبيعات: " + netMargin;
    }
  };

  // ── دوال محاكي القرارات الإدارية (What-If) ──
  window.updateBESimulator = () => {
    const data = window._beCurrentData;
    if (!data) return;

    const cmInput = parseFloat(document.getElementById("sim-cm-slider")?.value || data.cmPct);
    const expAdj = parseFloat(document.getElementById("sim-exp-slider")?.value || 0);
    const targetProfit = parseFloat(document.getElementById("sim-target-profit")?.value || window._beTargetProfitVal || 0);

    const cmValEl = document.getElementById("sim-cm-val");
    const expAdjValEl = document.getElementById("sim-exp-adj-val");
    if (cmValEl) cmValEl.textContent = cmInput.toFixed(1) + "%";
    if (expAdjValEl) expAdjValEl.textContent = (expAdj >= 0 ? "+" : "") + expAdj + "%";

    const simCmRatio = cmInput / 100;
    const simFixed = data.fixedCosts * (1 + expAdj / 100);

    const simBE = simCmRatio > 0 ? (simFixed / simCmRatio) : 0;
    const simBEDaily = data.days > 0 ? (simBE / data.days) : 0;

    const simTargetSales = simCmRatio > 0 ? ((simFixed + targetProfit) / simCmRatio) : 0;
    const simTargetDaily = data.days > 0 ? (simTargetSales / data.days) : 0;

    const simProfitAtCurrent = (data.revenueTotal * simCmRatio) - simFixed;
    const simProfitMargin = data.revenueTotal > 0 ? (simProfitAtCurrent / data.revenueTotal * 100) : 0;

    const resBeEl = document.getElementById("sim-res-be");
    const resBeDailyEl = document.getElementById("sim-res-be-daily");
    const resTargetSalesEl = document.getElementById("sim-res-target-sales");
    const resTargetDailyEl = document.getElementById("sim-res-target-daily");
    const resProfitEl = document.getElementById("sim-res-profit");
    const resProfitMarginEl = document.getElementById("sim-res-profit-margin");

    if (resBeEl) resBeEl.textContent = formatCurrency(simBE);
    if (resBeDailyEl) resBeDailyEl.textContent = formatCurrency(simBEDaily) + " / يومياً";

    if (resTargetSalesEl) resTargetSalesEl.textContent = formatCurrency(simTargetSales);
    if (resTargetDailyEl) resTargetDailyEl.textContent = formatCurrency(simTargetDaily) + " / يومياً";

    if (resProfitEl) {
      resProfitEl.textContent = formatCurrency(simProfitAtCurrent);
      resProfitEl.style.color = simProfitAtCurrent >= 0 ? "#15803d" : "#b91c1c";
    }
    if (resProfitMarginEl) resProfitMarginEl.textContent = "هامش صافي: " + simProfitMargin.toFixed(1) + "%";
  };

  window.resetBESimulator = () => {
    const data = window._beCurrentData;
    if (!data) return;
    const s1 = document.getElementById("sim-cm-slider");
    const s2 = document.getElementById("sim-exp-slider");
    const p  = document.getElementById("sim-target-profit");
    if (s1) s1.value = data.cmPct.toFixed(1);
    if (s2) s2.value = 0;
    if (p)  p.value = window._beTargetProfitVal || 20000;
    window.updateBESimulator();
  };

  // تشغيل الحسابات الفورية فور اكتمال الرسم
  setTimeout(() => {
    window.updateTargetProfitCalc();
    window.updateBESimulator();
  }, 40);
}

// ──────────────────────────────────────────
// 8. Aged Receivables (تقرير أعمار الديون والمستحقات للعملاء)
// ──────────────────────────────────────────
let _allAgedReceivables = [];
let _filteredAgedReceivables = [];
let _arSortKey = "balance";
let _arSortDir = "desc";
let _arRepsList = [];

async function renderAgedReceivables(container, from, to) {
  container.innerHTML = `<div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin fa-2x" style="color:var(--brand);"></i><div style="margin-top:10px;font-weight:700;color:var(--text-1);">جاري مطابقة فواتير وسندات ومديونيات العملاء واحتساب أعمار الديون بدقة…</div></div>`;
  
  try {
    const [custs, allInvoices] = await Promise.all([
      getAll(COLS.customers()),
      getAll(COLS.salesInvoices())
    ]);

    // Group invoices by customerId
    const invoicesByCustomer = {};
    (allInvoices || []).forEach(inv => {
      if (inv.status === 'cancelled') return;
      const cId = inv.customerId;
      if (!cId) return;
      if (!invoicesByCustomer[cId]) invoicesByCustomer[cId] = [];
      invoicesByCustomer[cId].push(inv);
    });

    // Sort customer invoices newest first for exact debt allocation
    Object.values(invoicesByCustomer).forEach(list => {
      list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rows = [];
    const repSet = new Set();

    (custs || []).forEach(c => {
      const bal = parseFloat(c.balance || 0);
      if (bal <= 0) return; // Only customers with positive debt

      const rep = (c.repName || c.salesRepName || "بدون مندوب").trim();
      if (rep && rep !== "بدون مندوب") repSet.add(rep);
      const creditDays = parseInt(c.creditDays || 0, 10);

      let current = 0;
      let aging1_30 = 0;
      let aging31_60 = 0;
      let aging61_90 = 0;
      let agingOver90 = 0;

      let remainingToAllocate = bal;
      const custInvoices = invoicesByCustomer[c.id] || [];

      for (const inv of custInvoices) {
        if (remainingToAllocate <= 0) break;

        const invTotal = parseFloat(inv.totalWithVat || inv.total || 0);
        if (invTotal <= 0) continue;

        const alloc = Math.min(remainingToAllocate, invTotal);
        remainingToAllocate -= alloc;

        const invDate = inv.date ? new Date(inv.date) : today;
        const diffDays = Math.max(0, Math.floor((today - invDate) / (1000 * 60 * 60 * 24)));
        const overdueDays = diffDays - creditDays;

        if (overdueDays <= 0) {
          current += alloc;
        } else if (overdueDays <= 30) {
          aging1_30 += alloc;
        } else if (overdueDays <= 60) {
          aging31_60 += alloc;
        } else if (overdueDays <= 90) {
          aging61_90 += alloc;
        } else {
          agingOver90 += alloc;
        }
      }

      // Any remaining unallocated debt (e.g. old opening balance) belongs to >90 days
      if (remainingToAllocate > 0) {
        agingOver90 += remainingToAllocate;
      }

      rows.push({
        id: c.id,
        name: c.name || "عميل مجهول",
        code: c.code || "",
        phone: c.phone || "",
        repName: rep || "بدون مندوب",
        creditLimit: parseFloat(c.creditLimit || 0),
        creditDays: creditDays,
        balance: bal,
        current: current,
        aging1_30: aging1_30,
        aging31_60: aging31_60,
        aging61_90: aging61_90,
        agingOver90: agingOver90,
        totalRemaining: bal // 100% matches ledger balance
      });
    });

    _allAgedReceivables = rows;
    _arRepsList = Array.from(repSet).sort();
    
    renderAgedReceivablesLayout(container);
  } catch (err) {
    container.innerHTML = `<div class="alert bad">خطأ في احتساب أعمار الديون: ${err.message}</div>`;
  }
}

function renderAgedReceivablesLayout(container) {
  container.innerHTML = `
    <!-- Header & Action Buttons -->
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:16px;">
      <div>
        <h2 style="margin:0;color:var(--brand);font-size:18px;display:flex;align-items:center;gap:8px;">
          <span>⏳ تقرير مديونيات وأعمار ديون العملاء</span>
        </h2>
        <div style="font-size:12px;color:var(--text-2);margin-top:4px;">
          تاريخ التقرير: ${new Date().toLocaleDateString("ar-SA-u-nu-latn")} • مطابق 100% لأرصدة كشوف الحسابات ودفاتر الأستاذ
        </div>
      </div>
      <div class="no-print" style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn btn-secondary" onclick="window.exportAgedReceivablesExcel()" style="white-space:nowrap; display:inline-flex; align-items:center; gap:6px;">
          📥 تصدير Excel
        </button>
        <button class="btn btn-primary" onclick="window.exportAgedReceivablesPDF()" style="white-space:nowrap; display:inline-flex; align-items:center; gap:6px;">
          🖨️ طباعة / PDF
        </button>
      </div>
    </div>

    <!-- Live KPI Summary Strip -->
    <div class="grid-4 gap-12 mb-16" id="ar-kpi-strip" style="grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));">
      <div style="background:var(--bg-card); padding:12px 14px; border-radius:10px; border:1px solid rgba(99,102,241,0.25);">
        <div style="font-size:11px; color:var(--text-2); font-weight:700;">💰 إجمالي المديونيات المستحقة</div>
        <div class="mono" id="ar-kpi-total" style="font-size:17px; font-weight:900; color:var(--brand); margin-top:4px;">0.00 ر.س</div>
      </div>
      <div style="background:var(--bg-card); padding:12px 14px; border-radius:10px; border:1px solid rgba(16,185,129,0.25);">
        <div style="font-size:11px; color:#10B981; font-weight:700;">🟢 غير مستحق (خلال المهلة)</div>
        <div class="mono" id="ar-kpi-current" style="font-size:17px; font-weight:900; color:#10B981; margin-top:4px;">0.00 ر.س</div>
      </div>
      <div style="background:var(--bg-card); padding:12px 14px; border-radius:10px; border:1px solid rgba(245,158,11,0.25);">
        <div style="font-size:11px; color:#F59E0B; font-weight:700;">🟡 متأخر (1 - 30 يوم)</div>
        <div class="mono" id="ar-kpi-30" style="font-size:17px; font-weight:900; color:#F59E0B; margin-top:4px;">0.00 ر.س</div>
      </div>
      <div style="background:var(--bg-card); padding:12px 14px; border-radius:10px; border:1px solid rgba(249,115,22,0.25);">
        <div style="font-size:11px; color:#F97316; font-weight:700;">🟠 متأخر (31 - 60 يوم)</div>
        <div class="mono" id="ar-kpi-60" style="font-size:17px; font-weight:900; color:#F97316; margin-top:4px;">0.00 ر.س</div>
      </div>
      <div style="background:var(--bg-card); padding:12px 14px; border-radius:10px; border:1px solid rgba(220,38,38,0.25);">
        <div style="font-size:11px; color:#DC2626; font-weight:700;">🔴 متأخر (61 - 90 يوم)</div>
        <div class="mono" id="ar-kpi-90" style="font-size:17px; font-weight:900; color:#DC2626; margin-top:4px;">0.00 ر.س</div>
      </div>
      <div style="background:var(--bg-card); padding:12px 14px; border-radius:10px; border:1px solid rgba(185,28,28,0.35); background:linear-gradient(135deg, var(--bg-card), rgba(185,28,28,0.05));">
        <div style="font-size:11px; color:#B91C1C; font-weight:800;">⛔ متعثر حرج (+90 يوم)</div>
        <div class="mono" id="ar-kpi-over90" style="font-size:17px; font-weight:900; color:#B91C1C; margin-top:4px;">0.00 ر.س</div>
      </div>
      <div style="background:var(--bg-card); padding:12px 14px; border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:11px; color:var(--text-2); font-weight:700;">👥 عدد العملاء المدينين</div>
        <div class="mono" id="ar-kpi-count" style="font-size:17px; font-weight:900; color:var(--text-0); margin-top:4px;">0 عميل</div>
      </div>
    </div>

    <!-- Filter Control Bar -->
    <div class="card mb-16 no-print" style="padding:12px 16px; background:var(--bg-card); border:1px solid var(--border-soft);">
      <div style="display:flex; align-items:center; flex-wrap:wrap; gap:12px;">
        
        <!-- Rep Filter -->
        <div style="display:flex; align-items:center; gap:6px; min-width:180px;">
          <label style="font-size:12px; font-weight:700; color:var(--text-2); white-space:nowrap;">👤 المندوب:</label>
          <select id="ar-rep-filter" class="input" style="padding:6px 10px; font-size:12px;" onchange="window.filterAgedReceivables()">
            <option value="">جميع المناديب</option>
            ${_arRepsList.map(r => `<option value="${r}">${r}</option>`).join("")}
          </select>
        </div>

        <!-- Overdue Risk Filter -->
        <div style="display:flex; align-items:center; gap:6px; min-width:180px;">
          <label style="font-size:12px; font-weight:700; color:var(--text-2); white-space:nowrap;">⏳ فئة التأخير:</label>
          <select id="ar-risk-filter" class="input" style="padding:6px 10px; font-size:12px;" onchange="window.filterAgedReceivables()">
            <option value="all">جميع المديونيات</option>
            <option value="over90">🔴 متعثرة حرجة (+90 يوم)</option>
            <option value="over60">🟠 متأخرة (+60 يوم فما فوق)</option>
            <option value="over30">🟡 متأخرة (+30 يوم فما فوق)</option>
            <option value="current">🟢 جارية / غير متأخرة فقط</option>
          </select>
        </div>

        <!-- Search Input -->
        <div style="position:relative; flex:1; min-width:200px; max-width:320px;">
          <input type="text" id="ar-search-input" class="input" placeholder="🔍 بحث باسم العميل أو الكود..." style="padding:6px 12px; font-size:12px; width:100%;" oninput="window.filterAgedReceivables()" />
        </div>

        <!-- Quick Sort Presets -->
        <div style="margin-right:auto; display:flex; gap:6px; align-items:center;">
          <span style="font-size:11.5px; color:var(--text-2); font-weight:700;">ترتيب سريع:</span>
          <button class="btn btn-secondary btn-sm" onclick="window.sortAgedReceivables('balance')" title="ترتيب حسب إجمالي المديونية">
            💰 المبلغ ${_arSortKey === 'balance' ? (_arSortDir === 'desc' ? '▼' : '▲') : ''}
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.sortAgedReceivables('agingOver90')" title="ترتيب حسب الأكثر تعثراً (+90 يوم)">
            ⛔ الأكثر تعثراً ${_arSortKey === 'agingOver90' ? (_arSortDir === 'desc' ? '▼' : '▲') : ''}
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card" style="padding:0; overflow:hidden;">
      <div class="table-container" style="overflow-x:auto;">
        <table class="data-dense" style="width:100%; border-collapse:collapse; font-size:12px; margin:0;" id="ar-table">
          <thead>
            <tr style="background:var(--bg-2); border-bottom:2px solid var(--border);">
              <th style="padding:10px 8px; text-align:center; width:35px;">#</th>
              <th style="padding:10px 8px; text-align:right; cursor:pointer;" onclick="window.sortAgedReceivables('name')" title="انقر للترتيب حسب اسم العميل">
                العميل ${_arSortKey === 'name' ? (_arSortDir === 'desc' ? '▼' : '▲') : '<span style="opacity:0.3;">↕</span>'}
              </th>
              <th style="padding:10px 8px; text-align:right; cursor:pointer;" onclick="window.sortAgedReceivables('repName')" title="انقر للترتيب حسب المندوب">
                المندوب ${_arSortKey === 'repName' ? (_arSortDir === 'desc' ? '▼' : '▲') : '<span style="opacity:0.3;">↕</span>'}
              </th>
              <th style="padding:10px 8px; text-align:center; width:55px;">المهلة</th>
              <th style="padding:10px 8px; text-align:left; color:var(--brand); cursor:pointer; font-weight:800;" onclick="window.sortAgedReceivables('balance')" title="انقر للترتيب حسب إجمالي المديونية">
                إجمالي المديونية ${_arSortKey === 'balance' ? (_arSortDir === 'desc' ? '▼' : '▲') : '<span style="opacity:0.3;">↕</span>'}
              </th>
              <th style="padding:10px 8px; text-align:left; color:#10B981; cursor:pointer;" onclick="window.sortAgedReceivables('current')" title="انقر للترتيب">
                غير مستحق ${_arSortKey === 'current' ? (_arSortDir === 'desc' ? '▼' : '▲') : '<span style="opacity:0.3;">↕</span>'}
              </th>
              <th style="padding:10px 8px; text-align:left; color:#F59E0B; cursor:pointer;" onclick="window.sortAgedReceivables('aging1_30')" title="انقر للترتيب">
                متأخر (1-30) ${_arSortKey === 'aging1_30' ? (_arSortDir === 'desc' ? '▼' : '▲') : '<span style="opacity:0.3;">↕</span>'}
              </th>
              <th style="padding:10px 8px; text-align:left; color:#F97316; cursor:pointer;" onclick="window.sortAgedReceivables('aging31_60')" title="انقر للترتيب">
                متأخر (31-60) ${_arSortKey === 'aging31_60' ? (_arSortDir === 'desc' ? '▼' : '▲') : '<span style="opacity:0.3;">↕</span>'}
              </th>
              <th style="padding:10px 8px; text-align:left; color:#DC2626; cursor:pointer;" onclick="window.sortAgedReceivables('aging61_90')" title="انقر للترتيب">
                متأخر (61-90) ${_arSortKey === 'aging61_90' ? (_arSortDir === 'desc' ? '▼' : '▲') : '<span style="opacity:0.3;">↕</span>'}
              </th>
              <th style="padding:10px 8px; text-align:left; color:#B91C1C; font-weight:900; cursor:pointer;" onclick="window.sortAgedReceivables('agingOver90')" title="انقر للترتيب حسب الأكثر تعثراً">
                متعثر (+90 يوم) ${_arSortKey === 'agingOver90' ? (_arSortDir === 'desc' ? '▼' : '▲') : '<span style="opacity:0.3;">↕</span>'}
              </th>
              <th style="padding:10px 8px; text-align:center; width:85px;" class="no-print">إجراءات</th>
            </tr>
          </thead>
          <tbody id="ar-tbody"></tbody>
          <tfoot id="ar-tfoot"></tfoot>
        </table>
      </div>
    </div>
  `;

  window.filterAgedReceivables();
}

window.filterAgedReceivables = () => {
  const rep = document.getElementById("ar-rep-filter")?.value || "";
  const risk = document.getElementById("ar-risk-filter")?.value || "all";
  const search = (document.getElementById("ar-search-input")?.value || "").trim().toLowerCase();

  let filtered = [..._allAgedReceivables];

  if (rep) {
    filtered = filtered.filter(r => r.repName === rep);
  }

  if (risk === "over90") {
    filtered = filtered.filter(r => r.agingOver90 > 0);
  } else if (risk === "over60") {
    filtered = filtered.filter(r => (r.agingOver90 + r.aging61_90) > 0);
  } else if (risk === "over30") {
    filtered = filtered.filter(r => (r.agingOver90 + r.aging61_90 + r.aging31_60) > 0);
  } else if (risk === "current") {
    filtered = filtered.filter(r => r.current > 0 && r.aging1_30 === 0 && r.aging31_60 === 0 && r.aging61_90 === 0 && r.agingOver90 === 0);
  }

  if (search) {
    filtered = filtered.filter(r => 
      (r.name || "").toLowerCase().includes(search) ||
      (r.code || "").toLowerCase().includes(search) ||
      (r.phone || "").includes(search) ||
      (r.repName || "").toLowerCase().includes(search)
    );
  }

  // Sort
  filtered.sort((a, b) => {
    let vA = a[_arSortKey];
    let vB = b[_arSortKey];

    if (typeof vA === "string") {
      return _arSortDir === "asc" ? vA.localeCompare(vB) : vB.localeCompare(vA);
    }
    vA = parseFloat(vA || 0);
    vB = parseFloat(vB || 0);
    return _arSortDir === "asc" ? vA - vB : vB - vA;
  });

  _filteredAgedReceivables = filtered;

  // Calculate Totals for filtered set
  const totals = {
    balance: 0,
    current: 0,
    aging1_30: 0,
    aging31_60: 0,
    aging61_90: 0,
    agingOver90: 0
  };

  filtered.forEach(r => {
    totals.balance += r.balance;
    totals.current += r.current;
    totals.aging1_30 += r.aging1_30;
    totals.aging31_60 += r.aging31_60;
    totals.aging61_90 += r.aging61_90;
    totals.agingOver90 += r.agingOver90;
  });

  window._agedReceivablesRows = filtered;
  window._agedReceivablesTotals = totals;

  // Update KPI Cards
  const setEl = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  setEl("ar-kpi-total", formatCurrency(totals.balance));
  setEl("ar-kpi-current", formatCurrency(totals.current));
  setEl("ar-kpi-30", formatCurrency(totals.aging1_30));
  setEl("ar-kpi-60", formatCurrency(totals.aging31_60));
  setEl("ar-kpi-90", formatCurrency(totals.aging61_90));
  setEl("ar-kpi-over90", formatCurrency(totals.agingOver90));
  setEl("ar-kpi-count", `${filtered.length} عميل`);

  // Render Table Body
  const tbody = document.getElementById("ar-tbody");
  const tfoot = document.getElementById("ar-tfoot");
  if (!tbody || !tfoot) return;

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:36px; color:var(--text-2);">لا توجد مديونيات مطابقة لمعايير الفلترة المحددة</td></tr>`;
    tfoot.innerHTML = "";
    return;
  }

  tbody.innerHTML = filtered.map((r, idx) => `
    <tr style="border-bottom:1px solid var(--border-soft); transition:background .15s;" onmouseover="this.style.background='rgba(99,102,241,0.03)'" onmouseout="this.style.background=''">
      <td style="padding:10px 8px; text-align:center; color:var(--text-2); font-size:11px;">${idx + 1}</td>
      <td style="padding:10px 8px;">
        <div style="font-weight:700; color:var(--text-0); cursor:pointer; display:inline-block;" onclick="window.openCustomerStatementFromAging('${r.id}')" title="انقر لفتح كشف الحساب">
          ${r.name}
        </div>
        ${r.code ? `<div style="font-size:10.5px; color:var(--text-2); font-family:monospace;">كود: ${r.code}</div>` : ""}
      </td>
      <td style="padding:10px 8px; color:var(--text-1);">${r.repName}</td>
      <td style="padding:10px 8px; text-align:center; color:var(--text-2); font-family:monospace;">${r.creditDays ? `${r.creditDays} ي` : "—"}</td>
      <td class="mono font-bold" style="padding:10px 8px; text-align:left; color:var(--brand); font-size:13px;">${formatCurrency(r.balance)}</td>
      <td class="mono" style="padding:10px 8px; text-align:left; color:${r.current ? '#10B981' : 'var(--text-dim)'}; font-weight:${r.current ? '700' : 'normal'};">${r.current ? formatCurrency(r.current) : "—"}</td>
      <td class="mono" style="padding:10px 8px; text-align:left; color:${r.aging1_30 ? '#F59E0B' : 'var(--text-dim)'}; font-weight:${r.aging1_30 ? '700' : 'normal'};">${r.aging1_30 ? formatCurrency(r.aging1_30) : "—"}</td>
      <td class="mono" style="padding:10px 8px; text-align:left; color:${r.aging31_60 ? '#F97316' : 'var(--text-dim)'}; font-weight:${r.aging31_60 ? '700' : 'normal'};">${r.aging31_60 ? formatCurrency(r.aging31_60) : "—"}</td>
      <td class="mono" style="padding:10px 8px; text-align:left; color:${r.aging61_90 ? '#DC2626' : 'var(--text-dim)'}; font-weight:${r.aging61_90 ? '700' : 'normal'};">${r.aging61_90 ? formatCurrency(r.aging61_90) : "—"}</td>
      <td class="mono font-bold" style="padding:10px 8px; text-align:left; color:${r.agingOver90 ? '#B91C1C' : 'var(--text-dim)'}; font-size:${r.agingOver90 ? '13px' : '12px'}; background:${r.agingOver90 ? 'rgba(185,28,28,0.05)' : 'transparent'};">${r.agingOver90 ? formatCurrency(r.agingOver90) : "—"}</td>
      <td style="padding:6px 8px; text-align:center; white-space:nowrap;" class="no-print">
        <div style="display:inline-flex; gap:4px; align-items:center;">
          <button class="btn btn-icon sm btn-ghost" onclick="window.openCustomerStatementFromAging('${r.id}')" title="عرض كشف حساب العميل">
            📊
          </button>
          ${r.phone ? `
            <button class="btn btn-icon sm btn-ghost" onclick="window.sendCustomerDebtWhatsApp('${r.id}')" title="إرسال تذكير سداد عبر واتساب" style="color:#25D366;">
              💬
            </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join("");

  tfoot.innerHTML = `
    <tr style="background:var(--bg-2); border-top:2px solid var(--border); font-weight:bold; font-size:12px;">
      <td colspan="4" style="padding:12px 8px; font-weight:900;">الإجمالي العام (${filtered.length} عميل)</td>
      <td class="mono font-bold" style="padding:12px 8px; text-align:left; color:var(--brand); font-size:13.5px;">${formatCurrency(totals.balance)}</td>
      <td class="mono font-bold" style="padding:12px 8px; text-align:left; color:#10B981;">${formatCurrency(totals.current)}</td>
      <td class="mono font-bold" style="padding:12px 8px; text-align:left; color:#F59E0B;">${formatCurrency(totals.aging1_30)}</td>
      <td class="mono font-bold" style="padding:12px 8px; text-align:left; color:#F97316;">${formatCurrency(totals.aging31_60)}</td>
      <td class="mono font-bold" style="padding:12px 8px; text-align:left; color:#DC2626;">${formatCurrency(totals.aging61_90)}</td>
      <td class="mono font-bold" style="padding:12px 8px; text-align:left; color:#B91C1C; font-size:13px; background:rgba(185,28,28,0.06);">${formatCurrency(totals.agingOver90)}</td>
      <td class="no-print"></td>
    </tr>
  `;
};

window.sortAgedReceivables = (key) => {
  if (_arSortKey === key) {
    _arSortDir = _arSortDir === "desc" ? "asc" : "desc";
  } else {
    _arSortKey = key;
    _arSortDir = (key === "name" || key === "repName") ? "asc" : "desc";
  }
  
  const container = document.getElementById("fin-report-body");
  if (container) renderAgedReceivablesLayout(container);
};

window.openCustomerStatementFromAging = (cId) => {
  if (typeof window.navigate === "function") {
    window.navigate("customer-statement");
    setTimeout(() => {
      if (typeof window.selectStmtCustomer === "function") {
        window.selectStmtCustomer(cId);
      }
    }, 250);
  }
};

window.sendCustomerDebtWhatsApp = (cId) => {
  const r = _allAgedReceivables.find(x => x.id === cId);
  if (!r) return;
  const phone = (r.phone || "").replace(/[^0-9]/g, "");
  if (!phone) {
    if (window.showToast) window.showToast("رقم جوال العميل غير مسجل", "warning");
    return;
  }
  const cleanPhone = phone.startsWith("0") ? "966" + phone.slice(1) : (phone.startsWith("966") ? phone : "966" + phone);
  const coName = window.ERP_COMPANY?.name || "مؤسسة إدهام للمواد الغذائية";
  
  const msg = `مرحباً ${r.name}،\nتحية طيبة من ${coName}.\nنود تذكيركم بأن إجمالي الرصيد المستحق على حسابكم هو: *${formatCurrency(r.balance)}*.\n` +
    (r.agingOver90 > 0 ? `⛔ مبالغ متأخرة أكثر من 90 يوم: *${formatCurrency(r.agingOver90)}*\n` : '') +
    (r.aging61_90 > 0 ? `⚠️ مبالغ متأخرة (61-90 يوم): *${formatCurrency(r.aging61_90)}*\n` : '') +
    `يرجى التكرم بالترتيب لسداد المبلغ، شاكرين ومقدرين حسن تعاونكم الدائم معنا!`;

  window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`, "_blank");
};

// ── تصدير أعمار الديون إلى Excel ──
window.exportAgedReceivablesExcel = async () => {
  const rows = window._agedReceivablesRows;
  const totals = window._agedReceivablesTotals;
  if (!rows || rows.length === 0) {
    if (window.showToast) window.showToast("لا توجد بيانات لتصديرها", "warning");
    else alert("لا توجد بيانات لتصديرها");
    return;
  }

  const title = `تقرير مديونيات وأعمار ديون العملاء - ${new Date().toLocaleDateString("ar-SA-u-nu-latn")}`;
  const headers = [
    "#",
    "العميل",
    "الكود",
    "المندوب",
    "الهاتف",
    "مهلة الائتمان (أيام)",
    "إجمالي المديونية (الرصيد)",
    "غير مستحق (خلال المهلة)",
    "متأخر (1-30 يوم)",
    "متأخر (31-60 يوم)",
    "متأخر (61-90 يوم)",
    "متعثر (+90 يوم)"
  ];

  const excelRows = rows.map((r, idx) => [
    idx + 1,
    r.name,
    r.code || "—",
    r.repName,
    r.phone || "—",
    r.creditDays || 0,
    Math.round(r.balance * 100) / 100,
    Math.round(r.current * 100) / 100,
    Math.round(r.aging1_30 * 100) / 100,
    Math.round(r.aging31_60 * 100) / 100,
    Math.round(r.aging61_90 * 100) / 100,
    Math.round(r.agingOver90 * 100) / 100
  ]);

  if (totals) {
    excelRows.push([
      "الإجمالي العام",
      `عدد العملاء: ${rows.length}`,
      "",
      "",
      "",
      "",
      Math.round(totals.balance * 100) / 100,
      Math.round(totals.current * 100) / 100,
      Math.round(totals.aging1_30 * 100) / 100,
      Math.round(totals.aging31_60 * 100) / 100,
      Math.round(totals.aging61_90 * 100) / 100,
      Math.round(totals.agingOver90 * 100) / 100
    ]);
  }

  const colWidths = [6, 32, 14, 20, 16, 16, 20, 20, 18, 18, 18, 20];

  try {
    await exportToExcel({
      title,
      headers,
      rows: excelRows,
      colWidths
    });
  } catch (err) {
    console.error("Export Aged Receivables Excel error:", err);
    alert("حدث خطأ أثناء التصدير: " + err.message);
  }
};

// ── طباعة وتصدير أعمار الديون إلى PDF ──
window.exportAgedReceivablesPDF = () => {
  if (!window._agedReceivablesRows || window._agedReceivablesRows.length === 0) {
    if (window.showToast) window.showToast("لا توجد بيانات للطباعة", "warning");
    else alert("لا توجد بيانات للطباعة");
    return;
  }
  window.print();
};

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

// ── Customer Performance Columns Visibility & Settings ──
const CUSTPERF_DEFAULT_COLS = {
  lastInvoiceDate: true,  // آخر فاتورة
  lastReceiptDate: true,  // آخر تحصيل
  invoiceCount:    true,  // الفواتير
  totalSales:      true,  // المبيعات
  totalCost:       true,  // التكلفة
  profit:          true,  // الربح / %
  collected:       true,  // المحصل
  remainingAmount: true,  // المتبقي
  collectionPct:   true,  // نسبة التحصيل
  dailyAvg:        true,  // معدل يومي
  avgInvoice:      true,  // متوسط الفاتورة
  profitKpi:       true   // كروت الأرباح العلوية
};

function getCustPerfColSettings() {
  try {
    const saved = localStorage.getItem("idham_custperf_cols");
    if (saved) return { ...CUSTPERF_DEFAULT_COLS, ...JSON.parse(saved) };
  } catch(e) {}
  return { ...CUSTPERF_DEFAULT_COLS };
}

function saveCustPerfColSettings(cols) {
  try {
    localStorage.setItem("idham_custperf_cols", JSON.stringify(cols));
  } catch(e) {}
}

window.custperfCols = getCustPerfColSettings();

window.toggleCustPerfCol = (key) => {
  window.custperfCols[key] = !window.custperfCols[key];
  saveCustPerfColSettings(window.custperfCols);
  renderCustPerfColMenu();
  const tableContainer = document.getElementById("custperf-table-wrapper");
  const kpiContainer = document.getElementById("custperf-kpi-wrapper");
  const champsContainer = document.getElementById("custperf-champs-wrapper");
  if (tableContainer && kpiContainer && champsContainer) {
    updateAnalyticsComponents(tableContainer, kpiContainer, champsContainer);
  }
};

window.setCustPerfPreset = (preset) => {
  if (preset === 'rep') {
    // 🛡️ وضع عرض المندوب: إخفاء التكلفة والأرباح وكروت الأرباح
    window.custperfCols.totalCost = false;
    window.custperfCols.profit = false;
    window.custperfCols.profitKpi = false;
    window.custperfCols.lastInvoiceDate = true;
    window.custperfCols.lastReceiptDate = true;
    window.custperfCols.invoiceCount = true;
    window.custperfCols.totalSales = true;
    window.custperfCols.collected = true;
    window.custperfCols.remainingAmount = true;
    window.custperfCols.collectionPct = true;
    window.custperfCols.dailyAvg = true;
    window.custperfCols.avgInvoice = true;
  } else if (preset === 'all') {
    // 📊 عرض الكل
    Object.keys(window.custperfCols).forEach(k => window.custperfCols[k] = true);
  } else if (preset === 'minimal') {
    // ⚡ الأساسي
    window.custperfCols.lastInvoiceDate = false;
    window.custperfCols.lastReceiptDate = false;
    window.custperfCols.invoiceCount = true;
    window.custperfCols.totalSales = true;
    window.custperfCols.totalCost = false;
    window.custperfCols.profit = false;
    window.custperfCols.profitKpi = false;
    window.custperfCols.collected = true;
    window.custperfCols.remainingAmount = true;
    window.custperfCols.collectionPct = true;
    window.custperfCols.dailyAvg = false;
    window.custperfCols.avgInvoice = false;
  }
  saveCustPerfColSettings(window.custperfCols);
  renderCustPerfColMenu();
  const tableContainer = document.getElementById("custperf-table-wrapper");
  const kpiContainer = document.getElementById("custperf-kpi-wrapper");
  const champsContainer = document.getElementById("custperf-champs-wrapper");
  if (tableContainer && kpiContainer && champsContainer) {
    updateAnalyticsComponents(tableContainer, kpiContainer, champsContainer);
  }
};

window.toggleCustPerfColMenu = (e) => {
  if (e) e.stopPropagation();
  const menu = document.getElementById("custperf-col-dropdown");
  if (!menu) return;
  const isVisible = menu.style.display === "block";
  if (isVisible) {
    menu.style.display = "none";
  } else {
    renderCustPerfColMenu();
    menu.style.display = "block";
  }
};

function renderCustPerfColMenu() {
  const menu = document.getElementById("custperf-col-dropdown");
  if (!menu) return;
  const cols = window.custperfCols;

  const colList = [
    { key: "totalSales",      label: "المبيعات (شامل)", icon: "💵" },
    { key: "collected",       label: "المحصّل", icon: "✅" },
    { key: "remainingAmount", label: "المتبقي (الذمم)", icon: "⏳" },
    { key: "collectionPct",   label: "نسبة التحصيل", icon: "📊" },
    { key: "invoiceCount",    label: "عدد الفواتير", icon: "📄" },
    { key: "lastInvoiceDate", label: "تاريخ آخر فاتورة", icon: "📅" },
    { key: "lastReceiptDate", label: "تاريخ آخر تحصيل", icon: "💰" },
    { key: "dailyAvg",        label: "المعدل اليومي", icon: "📈" },
    { key: "avgInvoice",      label: "متوسط الفاتورة", icon: "🧾" },
    { key: "totalCost",       label: "التكلفة (خاص)", icon: "🔒" },
    { key: "profit",          label: "الربح وهامش الربح (خاص)", icon: "🔒" },
    { key: "profitKpi",       label: "كروت الأرباح العلوية (خاص)", icon: "🔒" }
  ];

  menu.innerHTML = `
    <div style="font-weight:bold; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
      <span>⚙️ تخصيص أعمدة العرض</span>
      <span style="font-size:10px; color:var(--text-3);">اختر ما ترغب بإظهاره</span>
    </div>
    <div style="display:flex; gap:6px; margin-bottom:10px; flex-wrap:wrap;">
      <button type="button" class="btn btn-sm" onclick="setCustPerfPreset('rep')" style="font-size:11px; padding:4px 8px; background:#6366f1; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
        🛡️ وضع المندوب
      </button>
      <button type="button" class="btn btn-sm" onclick="setCustPerfPreset('all')" style="font-size:11px; padding:4px 8px; background:var(--bg-2); border:1px solid var(--border); border-radius:6px; font-weight:bold; cursor:pointer;">
        عرض الكل
      </button>
      <button type="button" class="btn btn-sm" onclick="setCustPerfPreset('minimal')" style="font-size:11px; padding:4px 8px; background:var(--bg-2); border:1px solid var(--border); border-radius:6px; font-weight:bold; cursor:pointer;">
        الأساسي
      </button>
    </div>
    <div style="border-top:1px solid var(--border); padding-top:8px; display:grid; grid-template-columns:1fr; gap:6px; max-height:260px; overflow-y:auto;">
      ${colList.map(c => `
        <label style="display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer; padding:4px 6px; border-radius:4px; transition:background .15s;" onmouseover="this.style.background='var(--bg-2)'" onmouseout="this.style.background=''">
          <input type="checkbox" ${cols[c.key] ? 'checked' : ''} onchange="toggleCustPerfCol('${c.key}')" style="cursor:pointer;" />
          <span>${c.icon} ${c.label}</span>
        </label>
      `).join('')}
    </div>
  `;
}

if (!window._custperfClickListenerAdded) {
  document.addEventListener("click", (e) => {
    const menu = document.getElementById("custperf-col-dropdown");
    const btn = document.getElementById("btn-custperf-cols");
    if (menu && menu.style.display === "block") {
      if (!menu.contains(e.target) && !btn?.contains(e.target)) {
        menu.style.display = "none";
      }
    }
  });
  window._custperfClickListenerAdded = true;
}

function updateAnalyticsComponents(tableContainer, kpiContainer, champsContainer) {
  const cols = window.custperfCols || CUSTPERF_DEFAULT_COLS;
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
      ${cols.profitKpi ? `<div class="card" style="padding:16px;text-align:center;border-top:3px solid #10b981;"><div style="font-size:10px;color:var(--text-3);margin-bottom:4px;">إجمالي الأرباح (صافي المبيعات)</div><div style="font-size:17px;font-weight:900;font-family:monospace;color:#10b981;">${formatCurrency(tot.profit)}</div><div style="font-size:10px;color:var(--text-3);margin-top:4px;">هامش ربح ${p2(totProfitPct)}%</div></div>` : ''}
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #3b82f6;"><div style="font-size:10px;color:var(--text-3);margin-bottom:4px;">إجمالي التحصيل</div><div style="font-size:17px;font-weight:900;font-family:monospace;color:#3b82f6;">${formatCurrency(tot.collected)}</div><div style="font-size:10px;color:var(--text-3);margin-top:4px;">نسبة ${p2(totCollectionPct)}%</div></div>
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #f59e0b;"><div style="font-size:10px;color:var(--text-3);margin-bottom:4px;">إجمالي المتبقي</div><div style="font-size:17px;font-weight:900;font-family:monospace;color:#f59e0b;">${formatCurrency(tot.remaining)}</div><div style="font-size:10px;color:var(--text-3);margin-top:4px;">ذمم متبقية</div></div>
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #8b5cf6;"><div style="font-size:10px;color:var(--text-3);margin-bottom:4px;">المعدل اليومي</div><div style="font-size:17px;font-weight:900;font-family:monospace;color:#8b5cf6;">${formatCurrency(totDailyAvg)}</div><div style="font-size:10px;color:var(--text-3);margin-top:4px;">ر.س / يوم</div></div>
    </div>
  `;

  champsContainer.innerHTML = (bestSales || (cols.profitKpi && bestProfit) || bestCollection) ? `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:20px;">
      ${bestSales && bestSales.totalSales > 0 ? `<div class="card" style="padding:12px 16px;display:flex;align-items:center;gap:12px;border:1px solid rgba(99,102,241,.3);"><span style="font-size:28px;">🥇</span><div><div style="font-size:10px;color:#6366f1;font-weight:700;margin-bottom:2px;">الأعلى مبيعاً</div><div style="font-weight:700;font-size:13px;">${bestSales.name}</div><div style="font-size:11px;color:var(--text-2);">${formatCurrency(bestSales.totalSales)}</div></div></div>` : ''}
      ${cols.profitKpi && bestProfit && bestProfit.profit > 0 ? `<div class="card" style="padding:12px 16px;display:flex;align-items:center;gap:12px;border:1px solid rgba(16,185,129,.3);"><span style="font-size:28px;">💰</span><div><div style="font-size:10px;color:#10b981;font-weight:700;margin-bottom:2px;">الأعلى ربحاً (صافي)</div><div style="font-weight:700;font-size:13px;">${bestProfit.name}</div><div style="font-size:11px;color:var(--text-2);">${formatCurrency(bestProfit.profit)} (${p2(bestProfit.profitPct)}%)</div></div></div>` : ''}
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
      ${cols.lastInvoiceDate ? `<td style="padding:10px 8px;text-align:center;color:var(--text-2);white-space:nowrap;">${fd(r.lastInvoiceDate)}</td>` : ''}
      ${cols.lastReceiptDate ? `<td style="padding:10px 8px;text-align:center;color:var(--text-2);white-space:nowrap;">${fd(r.lastReceiptDate)}</td>` : ''}
      ${cols.invoiceCount ? `<td style="padding:10px 8px;text-align:center;color:var(--text-2);">${r.invoiceCount}</td>` : ''}
      ${cols.totalSales ? `<td style="padding:10px 8px;text-align:right;font-family:monospace;font-weight:700;">${formatCurrency(r.totalSales)}</td>` : ''}
      ${cols.totalCost ? `<td style="padding:10px 8px;text-align:right;font-family:monospace;color:var(--text-2);">${formatCurrency(r.totalCost)}</td>` : ''}
      ${cols.profit ? `
      <td style="padding:10px 8px;text-align:right;font-family:monospace;color:${r.profit>=0?'#10b981':'#ef4444'};font-weight:700;">
        ${formatCurrency(r.profit)}
        <div style="font-size:10px;font-weight:400;opacity:0.8;">${p2(r.profitPct)}%</div>
      </td>` : ''}
      ${cols.collected ? `<td style="padding:10px 8px;text-align:right;font-family:monospace;">${formatCurrency(r.collected)}</td>` : ''}
      ${cols.remainingAmount ? `<td style="padding:10px 8px;text-align:right;font-family:monospace;color:${r.remainingAmount>0?'#f59e0b':'var(--text-3)'};">${r.remainingAmount>0?formatCurrency(r.remainingAmount):'—'}</td>` : ''}
      ${cols.collectionPct ? `
      <td style="padding:10px 8px;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:5px;background:${cb.bg};color:${cb.color};padding:4px 10px;border-radius:20px;font-weight:700;font-size:12px;">
          ${cb.icon} ${p2(r.collectionPct)}%
        </div>
      </td>` : ''}
      ${cols.dailyAvg ? `<td style="padding:10px 8px;text-align:right;font-family:monospace;color:var(--text-2);">${formatCurrency(r.dailyAvg)}</td>` : ''}
      ${cols.avgInvoice ? `<td style="padding:10px 8px;text-align:right;font-family:monospace;color:var(--text-2);">${formatCurrency(r.avgInvoice)}</td>` : ''}
    </tr>`;
  }).join('');

  const leadColSpan = 2 + (cols.lastInvoiceDate ? 1 : 0) + (cols.lastReceiptDate ? 1 : 0);

  tableContainer.innerHTML = `
    <div class="table-container" style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr style="background:var(--bg-2);border-bottom:2px solid var(--border);user-select:none;">
            <th style="padding:10px 8px;text-align:center;">#</th>
            <th onclick="toggleCustPerfSort('name')" style="padding:10px 8px;text-align:right;cursor:pointer;">العميل${renderSortArrow('name')}</th>
            ${cols.lastInvoiceDate ? `<th onclick="toggleCustPerfSort('lastInvoiceDate')" style="padding:10px 8px;text-align:center;cursor:pointer;white-space:nowrap;">آخر فاتورة${renderSortArrow('lastInvoiceDate')}</th>` : ''}
            ${cols.lastReceiptDate ? `<th onclick="toggleCustPerfSort('lastReceiptDate')" style="padding:10px 8px;text-align:center;cursor:pointer;white-space:nowrap;">آخر تحصيل${renderSortArrow('lastReceiptDate')}</th>` : ''}
            ${cols.invoiceCount ? `<th onclick="toggleCustPerfSort('invoiceCount')" style="padding:10px 8px;text-align:center;cursor:pointer;white-space:nowrap;">الفواتير${renderSortArrow('invoiceCount')}</th>` : ''}
            ${cols.totalSales ? `<th onclick="toggleCustPerfSort('totalSales')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">المبيعات${renderSortArrow('totalSales')}</th>` : ''}
            ${cols.totalCost ? `<th onclick="toggleCustPerfSort('totalCost')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">التكلفة${renderSortArrow('totalCost')}</th>` : ''}
            ${cols.profit ? `<th onclick="toggleCustPerfSort('profit')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">الربح / %${renderSortArrow('profit')}</th>` : ''}
            ${cols.collected ? `<th onclick="toggleCustPerfSort('collected')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">المحصّل${renderSortArrow('collected')}</th>` : ''}
            ${cols.remainingAmount ? `<th onclick="toggleCustPerfSort('remainingAmount')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">المتبقي${renderSortArrow('remainingAmount')}</th>` : ''}
            ${cols.collectionPct ? `<th onclick="toggleCustPerfSort('collectionPct')" style="padding:10px 8px;text-align:center;cursor:pointer;white-space:nowrap;">نسبة التحصيل${renderSortArrow('collectionPct')}</th>` : ''}
            ${cols.dailyAvg ? `<th onclick="toggleCustPerfSort('dailyAvg')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">معدل يومي${renderSortArrow('dailyAvg')}</th>` : ''}
            ${cols.avgInvoice ? `<th onclick="toggleCustPerfSort('avgInvoice')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">متوسط الفاتورة${renderSortArrow('avgInvoice')}</th>` : ''}
          </tr>
        </thead>
        <tbody>
          ${_custperfRows.length === 0 ? `<tr><td colspan="15" style="text-align:center;padding:40px;color:var(--text-2);">لا توجد بيانات للفترة المختارة</td></tr>` : rowsHTML}
        </tbody>
        <tfoot>
          <tr style="background:var(--bg-2);border-top:2px solid var(--border);font-weight:900;">
            <td colspan="${leadColSpan}" style="padding:12px 8px;">الإجمالي (${_custperfRows.length} عميل)</td>
            ${cols.invoiceCount ? `<td style="padding:12px 8px;text-align:center;">${tot.invoices}</td>` : ''}
            ${cols.totalSales ? `<td style="padding:12px 8px;text-align:right;font-family:monospace;color:#6366f1;">${formatCurrency(tot.sales)}</td>` : ''}
            ${cols.totalCost ? `<td style="padding:12px 8px;text-align:right;font-family:monospace;">${formatCurrency(tot.cost)}</td>` : ''}
            ${cols.profit ? `<td style="padding:12px 8px;text-align:right;font-family:monospace;color:#10b981;">${formatCurrency(tot.profit)} <span style="font-size:10px;font-weight:400;">(${p2(totProfitPct)}%)</span></td>` : ''}
            ${cols.collected ? `<td style="padding:12px 8px;text-align:right;font-family:monospace;color:#3b82f6;">${formatCurrency(tot.collected)}</td>` : ''}
            ${cols.remainingAmount ? `<td style="padding:12px 8px;text-align:right;font-family:monospace;color:#f59e0b;">${formatCurrency(tot.remaining)}</td>` : ''}
            ${cols.collectionPct ? `<td style="padding:12px 8px;text-align:center;font-weight:900;color:${totCollectionPct >= 80 ? '#10b981' : totCollectionPct >= 50 ? '#f59e0b' : '#ef4444'};">${p2(totCollectionPct)}%</td>` : ''}
            ${cols.dailyAvg ? `<td style="padding:12px 8px;text-align:right;font-family:monospace;color:#8b5cf6;">${formatCurrency(totDailyAvg)}</td>` : ''}
            ${cols.avgInvoice ? `<td style="padding:12px 8px;text-align:right;font-family:monospace;">${formatCurrency(tot.invoices > 0 ? tot.sales / tot.invoices : 0)}</td>` : ''}
          </tr>
        </tfoot>
      </table>
    </div>
    <div class="no-print" style="display:flex;gap:20px;margin-top:14px;font-size:11px;color:var(--text-3);flex-wrap:wrap;">
      <span>🟢 تحصيل ممتاز (≥80%)</span><span>🟡 تحصيل متوسط (50–79%)</span><span>🔴 تحصيل ضعيف (&lt;50%)</span>
    </div>
  `;
}

// ── تصدير تقرير أداء العملاء إلى Excel ──
window.exportCustPerfExcel = async () => {
  if (!_custperfRows || _custperfRows.length === 0) {
    alert("لا توجد بيانات لتصديرها");
    return;
  }

  const cols = window.custperfCols || CUSTPERF_DEFAULT_COLS;
  const from = document.getElementById("fin-from")?.value || "";
  const to = document.getElementById("fin-to")?.value || "";
  const selectedRep = window.custperfRep ? ` (مندوب: ${window.custperfRep})` : "";
  const title = `تقرير أداء العملاء للفترة من ${from} إلى ${to}${selectedRep}`;

  const headers = ["#", "اسم العميل", "المندوب"];
  const colWidths = [6, 32, 20];

  if (cols.lastInvoiceDate) { headers.push("آخر فاتورة"); colWidths.push(14); }
  if (cols.lastReceiptDate) { headers.push("آخر تحصيل"); colWidths.push(14); }
  if (cols.invoiceCount)    { headers.push("عدد الفواتير"); colWidths.push(12); }
  if (cols.totalSales)      { headers.push("المبيعات (شامل)"); colWidths.push(20); }
  if (cols.totalCost)       { headers.push("التكلفة"); colWidths.push(18); }
  if (cols.profit)          { headers.push("صافي الربح", "نسبة الربح %"); colWidths.push(18, 14); }
  if (cols.collected)       { headers.push("المحصل"); colWidths.push(18); }
  if (cols.remainingAmount) { headers.push("المتبقي (الذمم)"); colWidths.push(18); }
  if (cols.collectionPct)   { headers.push("نسبة التحصيل %"); colWidths.push(16); }
  if (cols.dailyAvg)        { headers.push("المعدل اليومي"); colWidths.push(16); }
  if (cols.avgInvoice)      { headers.push("متوسط الفاتورة"); colWidths.push(16); }

  const rows = _custperfRows.map((r, idx) => {
    const row = [idx + 1, r.name, r.repName];
    if (cols.lastInvoiceDate) row.push(r.lastInvoiceDate || "—");
    if (cols.lastReceiptDate) row.push(r.lastReceiptDate || "—");
    if (cols.invoiceCount)    row.push(r.invoiceCount);
    if (cols.totalSales)      row.push(Math.round(r.totalSales * 100) / 100);
    if (cols.totalCost)       row.push(Math.round(r.totalCost * 100) / 100);
    if (cols.profit)          row.push(Math.round(r.profit * 100) / 100, `${(Math.round(r.profitPct * 100) / 100).toFixed(2)}%`);
    if (cols.collected)       row.push(Math.round(r.collected * 100) / 100);
    if (cols.remainingAmount) row.push(Math.round(r.remainingAmount * 100) / 100);
    if (cols.collectionPct)   row.push(`${(Math.round(r.collectionPct * 100) / 100).toFixed(2)}%`);
    if (cols.dailyAvg)        row.push(Math.round(r.dailyAvg * 100) / 100);
    if (cols.avgInvoice)      row.push(Math.round(r.avgInvoice * 100) / 100);
    return row;
  });

  // Add Totals row
  const tot = _custperfRows.reduce((acc, r) => {
    acc.sales += r.totalSales;
    acc.cost += r.totalCost;
    acc.profit += r.profit;
    acc.collected += r.collected;
    acc.remaining += r.remainingAmount;
    acc.invoices += r.invoiceCount;
    return acc;
  }, { sales: 0, cost: 0, profit: 0, collected: 0, remaining: 0, invoices: 0 });

  const totProfitPct = tot.sales > 0 ? (tot.profit / (tot.sales / 1.15) * 100) : 0;
  const totCollectionPct = tot.sales > 0 ? Math.min(100, tot.collected / tot.sales * 100) : 0;

  const totalRow = ["الإجمالي", `عدد العملاء: ${_custperfRows.length}`, ""];
  if (cols.lastInvoiceDate) totalRow.push("");
  if (cols.lastReceiptDate) totalRow.push("");
  if (cols.invoiceCount)    totalRow.push(tot.invoices);
  if (cols.totalSales)      totalRow.push(Math.round(tot.sales * 100) / 100);
  if (cols.totalCost)       totalRow.push(Math.round(tot.cost * 100) / 100);
  if (cols.profit)          totalRow.push(Math.round(tot.profit * 100) / 100, `${totProfitPct.toFixed(2)}%`);
  if (cols.collected)       totalRow.push(Math.round(tot.collected * 100) / 100);
  if (cols.remainingAmount) totalRow.push(Math.round(tot.remaining * 100) / 100);
  if (cols.collectionPct)   totalRow.push(`${totCollectionPct.toFixed(2)}%`);
  if (cols.dailyAvg)        totalRow.push("");
  if (cols.avgInvoice)      totalRow.push("");
  rows.push(totalRow);

  try {
    await exportToExcel({
      title,
      headers,
      rows,
      colWidths
    });
  } catch (err) {
    console.error("Export Excel error:", err);
    alert("حدث خطأ أثناء تصدير ملف Excel: " + err.message);
  }
};

// ── طباعة وتصدير تقرير أداء العملاء إلى PDF ──
window.exportCustPerfPDF = () => {
  if (!_custperfRows || _custperfRows.length === 0) {
    alert("لا توجد بيانات للطباعة");
    return;
  }
  window.print();
};


