// ============================================================
// IDHAM ERP — Expense Tracking Report (تقرير تتبع مصروفات الشركة التفصيلي)
// ============================================================
import { COLS, getAll, collection } from "../../utils/db.js";
import { query, orderBy, limit, getDocs, where } from "../../utils/db.js";
import { formatCurrency, startOfMonth, todayString } from "../../utils/formatters.js";
import { db, COMPANY_ID } from "../../firebase-config.js";

let _expenses = [];
let _expenseAccounts = [];
let _costCenters = [];
let _allAccountsMap = {};

let _categoryChartInstance = null;
let _trendChartInstance = null;

export async function render(container, user) {
  container.innerHTML = `
    <style>
      .print-only-header { display: none; }
      @media print {
        .print-only-header { display: block !important; }
        .no-print { display: none !important; }
        .chart-container-card { display: none !important; }
      }
      .chart-container-card {
        background: var(--bg-1);
        border: 1px solid var(--border-soft);
        border-radius: 12px;
        padding: 16px;
        box-shadow: var(--shadow-sm);
      }
    </style>
    <div class="filterbar no-print" style="flex-wrap: wrap; gap: 12px; height: auto; padding: 12px;">
      <div class="date-range-group"><label>من</label>
        <input type="date" id="et-from" value="${startOfMonth()}" onchange="loadExpenseTracking()" /></div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="et-to" value="${todayString()}" onchange="loadExpenseTracking()" /></div>
      
      <div class="filter-select-group"><label>تصنيف المصروف</label>
        <select id="et-class-filter" onchange="filterExpenseTracking()" style="min-width:140px;">
          <option value="">الكل</option>
          <option value="تشغيلية">تشغيلية</option>
          <option value="إدارية وعمومية">إدارية وعمومية</option>
          <option value="تمويلية">تمويلية</option>
        </select>
      </div>

      <div class="filter-select-group"><label>الحساب التفصيلي</label>
        <select id="et-account-filter" onchange="filterExpenseTracking()" style="min-width:160px;">
          <option value="">الكل</option>
        </select>
      </div>

      <div class="filter-select-group"><label>مركز التكلفة</label>
        <select id="et-cc-filter" onchange="filterExpenseTracking()" style="min-width:140px;">
          <option value="">الكل</option>
        </select>
      </div>

      <div class="filter-select-group"><label>طريقة الصرف</label>
        <select id="et-method-filter" onchange="filterExpenseTracking()" style="min-width:120px;">
          <option value="">الكل</option>
          <option value="cash">نقدي (الصناديق)</option>
          <option value="bank">بنكي (الحسابات)</option>
        </select>
      </div>

      <div style="margin-right:auto;display:flex;gap:8px;align-items:center;">
        <button class="btn-export" onclick="exportPagePDF('#et-table','تقرير تتبع مصروفات الشركة')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportPageExcel('#et-table','تقرير تتبع مصروفات الشركة')" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
      </div>
    </div>

    <div class="page-content">
      <!-- Luxury Print Header -->
      <div class="print-only-header" style="border-bottom:3px double var(--brand); padding-bottom:12px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:16px; align-items:center;">
            <img id="et-print-logo" style="max-height:64px; max-width:120px;" src="" alt="شعار الشركة" />
            <div>
              <h2 id="et-print-co-name" style="margin:0; font-family:var(--font-heading); color:var(--brand);"></h2>
              <div id="et-print-co-details" class="dim" style="font-size:11px; margin-top:4px;"></div>
            </div>
          </div>
          <div style="text-align:left;">
            <h3 style="margin:0; font-family:var(--font-heading);">تقرير تتبع مصروفات الشركة التفصيلي</h3>
            <p style="margin:4px 0 0 0; font-size:11px; color:var(--text-2);" id="et-print-period"></p>
          </div>
        </div>
      </div>

      <div class="page-header no-print">
        <h1 class="page-title">لوحة تتبع وتحليل المصروفات (تشغيلية / إدارية / تمويلية)</h1>
        <p class="page-subtitle" id="et-period"></p>
      </div>

      <!-- KPI Summary -->
      <div class="kpi-grid mb-24">
        <div class="kpi-card"><div class="status-bar good"></div>
          <div class="kpi-icon good">⚙️</div>
          <div class="kpi-content"><div class="kpi-label">المصروفات التشغيلية</div>
            <div class="kpi-value mono" id="et-total-op">—</div></div></div>
        <div class="kpi-card"><div class="status-bar indigo"></div>
          <div class="kpi-icon indigo">🏢</div>
          <div class="kpi-content"><div class="kpi-label">المصروفات الإدارية والعمومية</div>
            <div class="kpi-value mono" id="et-total-admin">—</div></div></div>
        <div class="kpi-card"><div class="status-bar warn"></div>
          <div class="kpi-icon warn">💳</div>
          <div class="kpi-content"><div class="kpi-label">المصروفات التمويلية</div>
            <div class="kpi-value mono" id="et-total-fin">—</div></div></div>
        <div class="kpi-card"><div class="status-bar bad"></div>
          <div class="kpi-icon bad">💸</div>
          <div class="kpi-content"><div class="kpi-label">إجمالي مصروفات الشركة</div>
            <div class="kpi-value mono" id="et-total-amount">—</div></div></div>
      </div>

      <!-- Dashboard Charts Row -->
      <div class="grid-2 gap-20 mb-24 no-print">
        <!-- Chart 1: Expenses by Account (Column Chart) -->
        <div class="chart-container-card">
          <h3 style="font-family:var(--font-heading);font-size:14px;margin-top:0;margin-bottom:16px;color:var(--text-1);">📊 توزيع المصروفات حسب الحسابات</h3>
          <div style="position:relative; height:240px; width:100%;">
            <canvas id="et-category-chart"></canvas>
          </div>
        </div>

        <!-- Chart 2: Monthly Trend (Line Chart) -->
        <div class="chart-container-card">
          <h3 style="font-family:var(--font-heading);font-size:14px;margin-top:0;margin-bottom:16px;color:var(--text-1);">📈 تتبع زيادة ونقص المصروفات بالفترة</h3>
          <div style="position:relative; height:240px; width:100%;">
            <canvas id="et-trend-chart"></canvas>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header no-print" style="margin-bottom: 12px;">
          <h3 style="font-family:var(--font-heading);font-size:15px;margin:0;">📋 سجل حركة المصروفات التفصيلي</h3>
        </div>
        <div class="table-container">
          <table class="data-dense" id="et-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>رقم السند</th>
                <th>البند / الحساب المدين</th>
                <th>نوع المصروف</th>
                <th>طريقة الصرف (الدفع من)</th>
                <th>مركز التكلفة</th>
                <th>البيان / الملاحظات</th>
                <th style="text-align:left; color:var(--bad);">المبلغ (ر.س)</th>
              </tr>
            </thead>
            <tbody id="et-tbody">
              <tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد مصروفات مسجلة</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Attach global actions
  window.loadExpenseTracking = loadExpenseTracking;
  window.filterExpenseTracking = filterExpenseTracking;

  await loadFilters();
  await loadExpenseTracking();
}

function getExpenseClass(code) {
  if (!code) return "أخرى";
  if (code.startsWith("5-5")) return "تمويلية";
  if (code.startsWith("5-4") || code.startsWith("5-6") || code.startsWith("5-7")) return "إدارية وعمومية";
  if (code.startsWith("5-2") || code.startsWith("5-3") || code.startsWith("5-1")) return "تشغيلية";
  return "أخرى";
}

async function loadFilters() {
  try {
    const [accounts, ccs] = await Promise.all([
      getAll(COLS.chartOfAccounts(), [orderBy("code")]),
      getAll(COLS.costCenters(), [orderBy("name")])
    ]);

    // Build accounts mapping
    _allAccountsMap = {};
    accounts.forEach(a => {
      _allAccountsMap[a.id] = a;
    });

    // Filter accounts of type "expense" (code starts with 5 or configured as expense)
    _expenseAccounts = accounts.filter(a => a.type === "expense" || String(a.code).startsWith("5"));
    _costCenters = ccs;

    const accSel = document.getElementById("et-account-filter");
    if (accSel) {
      accSel.innerHTML = '<option value="">الكل</option>' +
        _expenseAccounts.map(a => `<option value="${a.name}">${a.code} — ${a.name}</option>`).join("");
    }

    const ccSel = document.getElementById("et-cc-filter");
    if (ccSel) {
      ccSel.innerHTML = '<option value="">الكل</option>' +
        _costCenters.map(c => `<option value="${c.name}">${c.name}</option>`).join("");
    }
  } catch (err) {
    console.error("loadFilters error:", err);
  }
}

async function loadExpenseTracking() {
  const from = document.getElementById("et-from")?.value || "";
  const to = document.getElementById("et-to")?.value || "";

  const periodEl = document.getElementById("et-period");
  if (periodEl) periodEl.textContent = `الفترة من ${from || "البداية"} إلى ${to || "اليوم"}`;

  try {
    // 1. Load accounts, cost centers, and JEs in parallel
    const [accounts, ccs, jeSnap] = await Promise.all([
      getAll(COLS.chartOfAccounts(), [orderBy("code")]),
      getAll(COLS.costCenters(), [orderBy("name")]),
      getDocs(query(collection(db, `companies/${COMPANY_ID}/journalEntries`), where("date", ">=", from), where("date", "<=", to), limit(2000)))
    ]);

    // Build accounts mapping
    _allAccountsMap = {};
    accounts.forEach(a => {
      _allAccountsMap[a.id] = a;
    });

    _expenseAccounts = accounts.filter(a => a.type === "expense" || String(a.code || "").startsWith("5"));
    _costCenters = ccs;

    const rawJEs = jeSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const tempExps = [];
    rawJEs.forEach(je => {
      if (je.status && je.status !== "posted") return;
      const lines = je.lines || [];

      // Find credit side to determine payment source
      let payMethod = "";
      let paySource = "";
      const creditLines = lines.filter(l => (l.credit || 0) > 0);
      if (creditLines.length > 0) {
        const cashLine = creditLines.find(l => String(l.accountCode || "").startsWith("1-1-1-1"));
        if (cashLine) {
          payMethod = "cash";
          paySource = cashLine.accountName;
        } else {
          const bankLine = creditLines.find(l => String(l.accountCode || "").startsWith("1-1-1-3"));
          if (bankLine) {
            payMethod = "bank";
            paySource = bankLine.accountName;
          } else {
            const suppLine = creditLines.find(l => String(l.accountCode || "").startsWith("2-1-1"));
            if (suppLine) {
              payMethod = "supplier";
              paySource = suppLine.accountName;
            } else {
              payMethod = "other";
              paySource = creditLines[0].accountName;
            }
          }
        }
      }

      // Extract debit lines that are expenses
      lines.forEach(line => {
        if ((line.debit || 0) <= 0) return;
        const accCode = line.accountCode || "";
        const acc = Object.values(_allAccountsMap).find(a => a.code === accCode) || _allAccountsMap[line.accountId];
        
        const isExpense = acc?.type === "expense" || accCode.startsWith("5") || String(accCode).startsWith("5");
        if (!isExpense) return;

        const cls = getExpenseClass(accCode);
        tempExps.push({
          id: je.id,
          entryNumber: je.entryNumber,
          date: je.date || "",
          amount: parseFloat(line.debit || 0),
          entityType: "account",
          targetId: line.accountId || "",
          accountCode: accCode,
          accountName: line.accountName || acc?.name || "مصروف",
          expenseClass: cls,
          method: payMethod || "other",
          sourceName: paySource || "—",
          costCenterName: line.costCenterName || "—",
          notes: line.note || je.description || "—"
        });
      });
    });

    _expenses = tempExps;

    // Refresh select elements
    const accSel = document.getElementById("et-account-filter");
    if (accSel) {
      accSel.innerHTML = '<option value="">الكل</option>' +
        _expenseAccounts.map(a => `<option value="${a.name}">${a.code} — ${a.name}</option>`).join("");
    }

    const ccSel = document.getElementById("et-cc-filter");
    if (ccSel) {
      ccSel.innerHTML = '<option value="">الكل</option>' +
        _costCenters.map(c => `<option value="${c.name}">${c.name}</option>`).join("");
    }

    filterExpenseTracking();
    populatePrintHeader(from, to);
  } catch (err) {
    window.showToast("فشل تحميل تتبع المصروفات: " + err.message, "danger");
  }
}

function filterExpenseTracking() {
  const expClass = document.getElementById("et-class-filter")?.value || "";
  const accName = document.getElementById("et-account-filter")?.value || "";
  const ccName = document.getElementById("et-cc-filter")?.value || "";
  const method = document.getElementById("et-method-filter")?.value || "";
  const tbody = document.getElementById("et-tbody");
  if (!tbody) return;

  let filtered = [..._expenses];

  if (expClass) {
    filtered = filtered.filter(e => e.expenseClass === expClass);
  }
  if (accName) {
    filtered = filtered.filter(e => e.accountName === accName);
  }
  if (ccName) {
    filtered = filtered.filter(e => e.costCenterName === ccName);
  }
  if (method) {
    filtered = filtered.filter(e => e.method === method);
  }

  // Sort by date descending
  filtered.sort((a, b) => b.date.localeCompare(a.date));

  // Calculate totals by classification
  const total = filtered.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const totalOp = filtered.filter(e => e.expenseClass === "تشغيلية").reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const totalAdmin = filtered.filter(e => e.expenseClass === "إدارية وعمومية").reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const totalFin = filtered.filter(e => e.expenseClass === "تمويلية").reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  document.getElementById("et-total-amount").textContent = formatCurrency(total);
  document.getElementById("et-total-op").textContent = formatCurrency(totalOp);
  document.getElementById("et-total-admin").textContent = formatCurrency(totalAdmin);
  document.getElementById("et-total-fin").textContent = formatCurrency(totalFin);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد مصروفات تطابق الفلاتر المحددة</td></tr>`;
    renderCharts([]);
    return;
  }

  tbody.innerHTML = filtered.map(e => {
    let classBadge = "neutral";
    if (e.expenseClass === "تشغيلية") classBadge = "good";
    if (e.expenseClass === "إدارية وعمومية") classBadge = "indigo";
    if (e.expenseClass === "تمويلية") classBadge = "warn";

    return `
      <tr>
        <td class="mono dim">${e.date}</td>
        <td class="mono font-bold">${e.entryNumber || e.id.substring(0,8).toUpperCase()}</td>
        <td><strong>${e.accountName || "مصروف"}</strong> <span class="mono dim" style="font-size:11px;">(${e.accountCode})</span></td>
        <td><span class="badge ${classBadge}">${e.expenseClass}</span></td>
        <td>
          <span class="badge ${e.method === 'cash' ? 'neutral' : 'indigo'}">
            ${e.method === 'cash' ? '💵 ' : '🏦 '} ${e.sourceName || (e.method === 'cash' ? 'الصندوق' : 'البنك')}
          </span>
        </td>
        <td><span class="dim">${e.costCenterName || "—"}</span></td>
        <td>${e.notes || "—"}</td>
        <td class="mono font-bold text-bad" style="text-align:left;">${formatCurrency(e.amount)}</td>
      </tr>
    `;
  }).join("");

  renderCharts(filtered);
}

function renderCharts(filteredExpenses) {
  // Destroy old chart instances to prevent leaks/double overlays
  if (_categoryChartInstance) {
    _categoryChartInstance.destroy();
    _categoryChartInstance = null;
  }
  if (_trendChartInstance) {
    _trendChartInstance.destroy();
    _trendChartInstance = null;
  }

  const catCanvas = document.getElementById("et-category-chart");
  const trendCanvas = document.getElementById("et-trend-chart");
  if (!catCanvas || !trendCanvas) return;

  if (filteredExpenses.length === 0) return;

  // 1. Group by Account Category for Column/Bar Chart
  const catTotals = {};
  filteredExpenses.forEach(e => {
    const key = e.accountName || "مصروف عام";
    catTotals[key] = (catTotals[key] || 0) + parseFloat(e.amount || 0);
  });

  const catLabels = Object.keys(catTotals);
  const catData = Object.values(catTotals);

  // Render Column Chart
  _categoryChartInstance = new Chart(catCanvas, {
    type: 'bar',
    data: {
      labels: catLabels,
      datasets: [{
        label: 'إجمالي الصرف (ر.س)',
        data: catData,
        backgroundColor: 'rgba(79, 70, 229, 0.8)', // Indigo brand color with transparency
        borderColor: '#4f46e5',
        borderWidth: 1.5,
        borderRadius: 6, // Cylindrical rounded look
        borderSkipped: false,
        barThickness: catLabels.length > 5 ? 16 : 28
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
      }
    }
  });

  // 2. Group by Period for Trend Chart (Grouped by Classification: تشغيلية، إدارية، تمويلية)
  const from = document.getElementById("et-from")?.value || "";
  const to = document.getElementById("et-to")?.value || "";
  
  let groupByDay = false;
  if (from && to) {
    const diffTime = Math.abs(new Date(to) - new Date(from));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 31) {
      groupByDay = true; // granular day-to-day progression for short ranges
    }
  }

  const trendData = {}; // { 'PeriodKey': { 'Classification': amount } }
  const periodKeysSet = new Set();
  const classesSet = new Set(["تشغيلية", "إدارية وعمومية", "تمويلية"]);

  filteredExpenses.forEach(e => {
    if (!e.date) return;
    const periodKey = groupByDay ? e.date : e.date.substring(0, 7); // YYYY-MM-DD or YYYY-MM
    periodKeysSet.add(periodKey);

    if (!trendData[periodKey]) trendData[periodKey] = {};
    trendData[periodKey][e.expenseClass] = (trendData[periodKey][e.expenseClass] || 0) + parseFloat(e.amount || 0);
  });

  const sortedPeriods = Array.from(periodKeysSet).sort();
  const classes = Array.from(classesSet);

  const colorsMap = {
    "تشغيلية": "#10b981", // Emerald
    "إدارية وعمومية": "#4f46e5", // Indigo
    "تمويلية": "#f59e0b" // Amber
  };

  const datasets = classes.map(cls => {
    const data = sortedPeriods.map(p => trendData[p][cls] || 0);
    const color = colorsMap[cls] || '#6b7280';
    return {
      label: cls,
      data: data,
      borderColor: color,
      backgroundColor: color + '12', // 7% opacity fill
      borderWidth: 2.5,
      tension: 0.3,
      pointRadius: sortedPeriods.length > 15 ? 1 : 4,
      pointHoverRadius: 6,
      fill: true
    };
  });

  // Render Line Chart
  _trendChartInstance = new Chart(trendCanvas, {
    type: 'line',
    data: {
      labels: sortedPeriods,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 10, usePointStyle: true, font: { size: 10 } }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
      }
    }
  });
}

function populatePrintHeader(from, to) {
  let co = {};
  try {
    const raw = localStorage.getItem("idham_company");
    if (raw) co = JSON.parse(raw);
    else if (window.ERP_COMPANY) co = window.ERP_COMPANY;
  } catch {}

  const logoEl = document.getElementById("et-print-logo");
  if (logoEl) {
    if (co.logoBase64 || co.logoUrl) {
      logoEl.src = co.logoBase64 || co.logoUrl;
      logoEl.style.display = "block";
    } else {
      logoEl.style.display = "none";
    }
  }

  const nameEl = document.getElementById("et-print-co-name");
  if (nameEl) nameEl.textContent = co.name || "مؤسسة إدهام للمواد الغذائية";

  const detailsEl = document.getElementById("et-print-co-details");
  if (detailsEl) {
    const parts = [];
    if (co.address) parts.push(`📍 ${co.address}`);
    if (co.phone) parts.push(`📞 ${co.phone}`);
    if (co.vatNumber) parts.push(`🔢 الرقم الضريبي: ${co.vatNumber}`);
    if (co.crNumber) parts.push(`📋 السجل التجاري: ${co.crNumber}`);
    detailsEl.textContent = parts.join(" | ");
  }

  const periodEl = document.getElementById("et-print-period");
  if (periodEl) periodEl.textContent = `الفترة من ${from || "البداية"} إلى ${to || "اليوم"}`;
}
