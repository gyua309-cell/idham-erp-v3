// ============================================================
// IDHAM ERP — Expense Analysis Report (تحليل المصروفات المتقدم)
// ============================================================
import { COLS, getAll } from "../../utils/db.js";
import { query, orderBy, limit, getDocs, where } from "../../utils/db.js";
import { formatCurrency, formatPercent, startOfMonth, todayString } from "../../utils/formatters.js";

let _accounts = [];
let _costCenters = [];
let _journalEntries = [];
let _activeView = "table";

export async function render(container, user) {
  container.innerHTML = `
    <style>
      .print-only-header { display: none; }
      @media print {
        .print-only-header { display: block !important; }
        .no-print { display: none !important; }
      }
    </style>
    <div class="filterbar no-print">
      <div class="date-range-group"><label>من</label>
        <input type="date" id="exp-from" value="${startOfMonth()}" onchange="loadExpenseAnalysis()" /></div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="exp-to" value="${todayString()}" onchange="loadExpenseAnalysis()" /></div>
      <div class="quick-filters">
        <button class="quick-filter-btn" onclick="expRange('today', event)">اليوم</button>
        <button class="quick-filter-btn active" onclick="expRange('month', event)">هذا الشهر</button>
        <button class="quick-filter-btn" onclick="expRange('last_month', event)">الشهر الماضي</button>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn-export" onclick="exportPagePDF('#exp-category-table','تحليل المصروفات حسب فئة الحساب')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportPageExcel('#exp-category-table','تحليل المصروفات حسب فئة الحساب')" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
      </div>
    </div>

    <div class="page-content">
      <!-- Luxury Print Header -->
      <div class="print-only-header" style="border-bottom:3px double var(--brand); padding-bottom:12px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:16px; align-items:center;">
            <img id="exp-print-logo" style="max-height:64px; max-width:120px;" src="" alt="شعار الشركة" />
            <div>
              <h2 id="exp-print-co-name" style="margin:0; font-family:var(--font-heading); color:var(--brand);"></h2>
              <div id="exp-print-co-details" class="dim" style="font-size:11px; margin-top:4px;"></div>
            </div>
          </div>
          <div style="text-align:left;">
            <h3 style="margin:0; font-family:var(--font-heading);">تقرير تحليل المصروفات ومراكز التكلفة</h3>
            <p style="margin:4px 0 0 0; font-size:11px; color:var(--text-2);" id="exp-print-period"></p>
          </div>
        </div>
      </div>

      <div class="page-header no-print">
        <h1 class="page-title">تحليل المصروفات المتقدم ومراكز التكلفة</h1>
        <p class="page-subtitle" id="exp-period"></p>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid mb-24">
        <div class="kpi-card"><div class="status-bar bad"></div>
          <div class="kpi-icon bad">💸</div>
          <div class="kpi-content"><div class="kpi-label">إجمالي المصروفات</div>
            <div class="kpi-value mono" id="exp-total-amount">—</div></div></div>
        <div class="kpi-card"><div class="status-bar indigo"></div>
          <div class="kpi-icon indigo">📈</div>
          <div class="kpi-content"><div class="kpi-label">إجمالي الإيرادات</div>
            <div class="kpi-value mono" id="exp-total-rev">—</div></div></div>
        <div class="kpi-card"><div class="status-bar lime"></div>
          <div class="kpi-icon lime">📊</div>
          <div class="kpi-content"><div class="kpi-label">نسبة المصروفات للإيرادات</div>
            <div class="kpi-value mono" id="exp-ratio">—</div></div></div>
        <div class="kpi-card"><div class="status-bar warn"></div>
          <div class="kpi-icon warn">🏢</div>
          <div class="kpi-content"><div class="kpi-label">أعلى فئة صرف</div>
            <div class="kpi-value" id="exp-top-category" style="font-size:14px;">—</div></div></div>
      </div>

      <div class="grid-2 gap-20">
        <!-- Expenses by Category -->
        <div class="card">
          <div class="card-header"><h3 style="font-family:var(--font-heading);font-size:15px;">المصروفات حسب فئة الحساب</h3></div>
          <div class="table-container">
            <table class="data-dense" id="exp-category-table">
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>الحساب</th>
                  <th style="text-align:left;">المبلغ (ر.س)</th>
                  <th style="width:100px;">النسبة %</th>
                </tr>
              </thead>
              <tbody id="exp-category-tbody">
                <tr><td colspan="4" style="text-align:center;padding:16px;color:var(--text-2);">لا توجد بيانات</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Expenses by Cost Center -->
        <div class="card">
          <div class="card-header"><h3 style="font-family:var(--font-heading);font-size:15px;">المصروفات حسب مراكز التكلفة</h3></div>
          <div class="table-container">
            <table class="data-dense" id="exp-cc-table">
              <thead>
                <tr>
                  <th>مركز التكلفة</th>
                  <th style="text-align:left;">المبلغ (ر.س)</th>
                  <th style="width:100px;">النسبة %</th>
                </tr>
              </thead>
              <tbody id="exp-cc-tbody">
                <tr><td colspan="3" style="text-align:center;padding:16px;color:var(--text-2);">لا توجد بيانات</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach global actions
  window.expRange = expRange;
  window.loadExpenseAnalysis = loadExpenseAnalysis;
  window.exportExpensesCSV = exportExpensesCSV;

  await loadExpenseAnalysis();
}

async function loadExpenseAnalysis() {
  const from = document.getElementById("exp-from")?.value || "";
  const to = document.getElementById("exp-to")?.value || "";
  
  const periodEl = document.getElementById("exp-period");
  if (periodEl) periodEl.textContent = `الفترة من ${from || "البداية"} إلى ${to || "اليوم"}`;

  try {
    // Load accounts & cost centers & JEs in parallel
    const [accs, ccs, jeSnap] = await Promise.all([
      getAll(COLS.chartOfAccounts(), [orderBy("code")]),
      getAll(COLS.costCenters(), [orderBy("name")]),
      getDocs(query(COLS.journalEntries(), where("date", ">=", from), where("date", "<=", to), limit(2000)))
    ]);

    _accounts = accs;
    _costCenters = ccs;
    _journalEntries = jeSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    calculateAndRender();
    populatePrintHeader(from, to);
  } catch (err) {
    window.showToast("فشل تحميل المصروفات: " + err.message, "danger");
  }
}

function populatePrintHeader(from, to) {
  let co = {};
  try {
    const raw = localStorage.getItem("idham_company");
    if (raw) co = JSON.parse(raw);
    else if (window.ERP_COMPANY) co = window.ERP_COMPANY;
  } catch {}

  const logoEl = document.getElementById("exp-print-logo");
  if (logoEl) {
    if (co.logoBase64 || co.logoUrl) {
      logoEl.src = co.logoBase64 || co.logoUrl;
      logoEl.style.display = "block";
    } else {
      logoEl.style.display = "none";
    }
  }

  const nameEl = document.getElementById("exp-print-co-name");
  if (nameEl) nameEl.textContent = co.name || "مؤسسة إدهام للمواد الغذائية";

  const detailsEl = document.getElementById("exp-print-co-details");
  if (detailsEl) {
    const parts = [];
    if (co.address) parts.push(`📍 ${co.address}`);
    if (co.phone) parts.push(`📞 ${co.phone}`);
    if (co.vatNumber) parts.push(`🔢 الرقم الضريبي: ${co.vatNumber}`);
    if (co.crNumber) parts.push(`📋 السجل التجاري: ${co.crNumber}`);
    detailsEl.textContent = parts.join(" | ");
  }

  const periodEl = document.getElementById("exp-print-period");
  if (periodEl) periodEl.textContent = `الفترة من ${from || "البداية"} إلى ${to || "اليوم"}`;
}

function calculateAndRender() {
  let totalExpenses = 0;
  let totalRevenue = 0;
  
  const expByAcc = {};
  const expByCC  = {};

  // Map to speed up lookup
  const accMap = {};
  _accounts.forEach(a => { accMap[a.code] = a; });
  const ccMap = {};
  _costCenters.forEach(c => { ccMap[c.id] = c; });

  _journalEntries.forEach(je => {
    (je.lines || []).forEach(line => {
      const code = line.accountCode;
      const acc = accMap[code];
      if (!acc) return;

      const debit = parseFloat(line.debit || 0);
      const credit = parseFloat(line.credit || 0);

      if (acc.type === "expense") {
        // Expense normal is debit
        const amt = debit - credit;
        if (amt > 0.01) {
          totalExpenses += amt;

          // Categorize by account
          if (!expByAcc[code]) {
            expByAcc[code] = { code, name: acc.name, amount: 0 };
          }
          expByAcc[code].amount += amt;

          // Categorize by Cost Center
          const ccId = line.costCenterId || je.costCenterId || "unassigned";
          const ccName = line.costCenterName || je.costCenterName || (ccMap[ccId]?.name) || "غير محدد";
          if (!expByCC[ccId]) {
            expByCC[ccId] = { id: ccId, name: ccName, amount: 0 };
          }
          expByCC[ccId].amount += amt;
        }
      } else if (acc.type === "revenue") {
        // Revenue normal is credit
        const amt = credit - debit;
        if (amt > 0.01) {
          totalRevenue += amt;
        }
      }
    });
  });

  // Render KPIs
  const ratio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;
  
  document.getElementById("exp-total-amount").textContent = formatCurrency(totalExpenses);
  document.getElementById("exp-total-rev").textContent = formatCurrency(totalRevenue);
  document.getElementById("exp-ratio").textContent = `${ratio.toFixed(1)}%`;

  // Find top expense category
  let topCat = "—";
  let maxCatAmt = 0;
  
  // Convert map to sorted array
  const accList = Object.values(expByAcc).sort((a,b) => b.amount - a.amount);
  if (accList.length > 0) {
    topCat = accList[0].name;
    maxCatAmt = accList[0].amount;
    document.getElementById("exp-top-category").innerHTML = `${topCat}<br><span class="mono" style="font-size:11px;color:var(--text-2);">${formatCurrency(maxCatAmt)}</span>`;
  } else {
    document.getElementById("exp-top-category").textContent = "—";
  }

  // Render Category Table
  const catTbody = document.getElementById("exp-category-tbody");
  if (catTbody) {
    if (accList.length === 0) {
      catTbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:16px;color:var(--text-2);">لا توجد مصروفات مسجلة</td></tr>`;
    } else {
      catTbody.innerHTML = accList.map(a => {
        const pct = totalExpenses > 0 ? (a.amount / totalExpenses) * 100 : 0;
        return `
          <tr>
            <td class="mono dim">${a.code}</td>
            <td><strong>${a.name}</strong></td>
            <td class="mono font-bold" style="text-align:left;">${formatCurrency(a.amount)}</td>
            <td>
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="mono" style="width:36px; text-align:right;">${pct.toFixed(0)}%</span>
                <div class="progress-bar" style="height:6px; flex:1;"><div class="fill indigo" style="width:${pct}%;"></div></div>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }
  }

  // Render Cost Center Table
  const ccTbody = document.getElementById("exp-cc-tbody");
  if (ccTbody) {
    const ccList = Object.values(expByCC).sort((a,b) => b.amount - a.amount);
    if (ccList.length === 0) {
      ccTbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:16px;color:var(--text-2);">لا توجد مصروفات لمراكز التكلفة</td></tr>`;
    } else {
      ccTbody.innerHTML = ccList.map(c => {
        const pct = totalExpenses > 0 ? (c.amount / totalExpenses) * 100 : 0;
        return `
          <tr>
            <td><strong>${c.name}</strong></td>
            <td class="mono font-bold" style="text-align:left;">${formatCurrency(c.amount)}</td>
            <td>
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="mono" style="width:36px; text-align:right;">${pct.toFixed(0)}%</span>
                <div class="progress-bar" style="height:6px; flex:1;"><div class="fill lime" style="width:${pct}%;"></div></div>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }
  }
}

function expRange(range, event) {
  const fromEl = document.getElementById("exp-from");
  const toEl = document.getElementById("exp-to");
  if (!fromEl || !toEl) return;

  const today = new Date();
  let fromDate = todayString();
  let toDate = todayString();

  if (range === "today") {
    // Default values
  } else if (range === "month") {
    fromDate = startOfMonth();
  } else if (range === "last_month") {
    const lm = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    fromDate = lm.toISOString().split("T")[0];
    const le = new Date(today.getFullYear(), today.getMonth(), 0);
    toDate = le.toISOString().split("T")[0];
  }

  fromEl.value = fromDate;
  toEl.value = toDate;

  // Toggle active filter button style
  document.querySelectorAll(".quick-filter-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  if (event && event.target) {
    event.target.classList.add("active");
  }

  loadExpenseAnalysis();
}

function exportExpensesCSV() {
  const from = document.getElementById("exp-from")?.value || "";
  const to = document.getElementById("exp-to")?.value || "";
  
  // Build a manual CSV export
  const lines = [
    ["تحليل المصروفات المتقدم", `من: ${from} إلى: ${to}`],
    [],
    ["الكود", "اسم الحساب", "المصروفات (ر.س)"]
  ];

  const accMap = {};
  _accounts.forEach(a => { accMap[a.code] = a; });

  const expByAcc = {};
  let totalExpenses = 0;

  _journalEntries.forEach(je => {
    (je.lines || []).forEach(line => {
      const code = line.accountCode;
      const acc = accMap[code];
      if (acc && acc.type === "expense") {
        const amt = parseFloat(line.debit || 0) - parseFloat(line.credit || 0);
        if (amt > 0.01) {
          totalExpenses += amt;
          expByAcc[code] = (expByAcc[code] || 0) + amt;
        }
      }
    });
  });

  Object.entries(expByAcc).sort((a,b) => b[1] - a[1]).forEach(([code, amt]) => {
    const acc = accMap[code];
    lines.push([code, acc ? acc.name : "", amt.toFixed(2)]);
  });

  lines.push([]);
  lines.push(["إجمالي المصروفات", "", totalExpenses.toFixed(2)]);

  const csv = lines.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv' }));
  a.download = `Expense_Analysis_${from}_to_${to}.csv`;
  a.click();
}
