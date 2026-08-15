// ============================================================
// IDHAM ERP — Consolidated Customer & Supplier Balances Report
// (تقرير أرصدة العملاء والموردين المجمع)
// ============================================================
import { COLS, getAll } from "../../utils/db.js";
import { query, where, getDocs, collection } from "../../utils/db.js";
import { formatCurrency, startOfMonth, todayString } from "../../utils/formatters.js";
import { db, COMPANY_ID } from "../../firebase-config.js";

let reportData = [];

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar no-print flex flex-wrap gap-12 items-center" style="padding:14px 20px; background:var(--bg-1); border-bottom:1px solid var(--border-soft);">
      <!-- Entity Type Selector -->
      <div class="filter-select-group" style="min-width:150px;">
        <label style="font-size:11px; font-weight:bold; color:var(--text-2); margin-bottom:4px; display:block;">نوع الكيان</label>
        <select id="cb-type-filter" class="form-control" onchange="filterConsolidatedReport()">
          <option value="all">الكل (عملاء وموردين)</option>
          <option value="customer">العملاء فقط</option>
          <option value="supplier">الموردين فقط</option>
        </select>
      </div>

      <!-- Date Range Filters -->
      <div class="date-range-group" style="display:flex; align-items:center; gap:6px;">
        <label style="font-size:11px; font-weight:bold; color:var(--text-2);">من</label>
        <input type="date" id="cb-from" class="form-control" value="${startOfMonth()}" onchange="loadConsolidatedBalances()" />
      </div>
      <div class="date-range-group" style="display:flex; align-items:center; gap:6px;">
        <label style="font-size:11px; font-weight:bold; color:var(--text-2);">إلى</label>
        <input type="date" id="cb-to" class="form-control" value="${todayString()}" onchange="loadConsolidatedBalances()" />
      </div>

      <!-- Quick Search -->
      <div style="min-width:200px;">
        <label style="font-size:11px; font-weight:bold; color:var(--text-2); margin-bottom:4px; display:block;">بحث سريع</label>
        <input type="text" id="cb-search" class="form-control" placeholder="ابحث باسم الكيان أو الكود..." oninput="filterConsolidatedReport()" />
      </div>

      <!-- Hide Zero Balances Checkbox -->
      <div style="display:flex; align-items:center; gap:6px; margin-top:16px;">
        <input type="checkbox" id="cb-hide-zero" onchange="filterConsolidatedReport()" checked />
        <label for="cb-hide-zero" style="font-size:12px; cursor:pointer;">إخفاء الأرصدة الصفريّة</label>
      </div>

      <!-- Export & Refresh Buttons -->
      <div style="margin-right:auto; display:flex; gap:8px; align-items:flex-end;">
        <button class="btn btn-secondary btn-sm" onclick="exportConsolidatedExcel()" title="تصدير إكسل">📊 إكسل</button>
        <button class="btn btn-secondary btn-sm" onclick="window.print()" title="طباعة">🖨️ طباعة</button>
        <button class="btn btn-primary btn-sm" onclick="loadConsolidatedBalances()" title="تحديث البيانات">🔄 تحديث</button>
      </div>
    </div>

    <div class="page-content" style="padding:20px;">
      <!-- KPI Summary Banner -->
      <div class="grid-3 gap-16 mb-20">
        <!-- Card 1: Total Customer Receivables -->
        <div class="card" style="padding:16px; border-right:4px solid var(--bad);">
          <div class="text-2 mb-4" style="font-size:12px;">إجمالي ديون العملاء (مستحق للمنشأة)</div>
          <div class="mono font-bold text-bad" style="font-size:22px;" id="cb-kpi-cust-receivables">0.00 ر.س</div>
          <div class="text-dim" style="font-size:11px; margin-top:4px;" id="cb-kpi-cust-count">0 عميل مدين</div>
        </div>

        <!-- Card 2: Total Supplier Payables -->
        <div class="card" style="padding:16px; border-right:4px solid var(--good);">
          <div class="text-2 mb-4" style="font-size:12px;">إجمالي مستحقات الموردين (التزامات)</div>
          <div class="mono font-bold text-good" style="font-size:22px;" id="cb-kpi-supp-payables">0.00 ر.س</div>
          <div class="text-dim" style="font-size:11px; margin-top:4px;" id="cb-kpi-supp-count">0 مورد دائن</div>
        </div>

        <!-- Card 3: Net Working Balance -->
        <div class="card" style="padding:16px; border-right:4px solid var(--indigo);">
          <div class="text-2 mb-4" style="font-size:12px;">صافي رصيد الذمم المجمع</div>
          <div class="mono font-bold text-indigo" style="font-size:22px;" id="cb-kpi-net-balance">0.00 ر.س</div>
          <div class="text-dim" style="font-size:11px; margin-top:4px;" id="cb-kpi-total-entities">0 كيان إجمالي</div>
        </div>
      </div>

      <!-- Main Data Table Card -->
      <div class="card">
        <div class="card-header flex justify-between items-center" style="padding:16px 20px; border-bottom:1px solid var(--border-soft);">
          <div>
            <h2 style="font-family:var(--font-heading); font-size:16px; margin:0;" id="cb-table-title">تقرير أرصدة العملاء والموردين المجمع</h2>
            <div class="text-dim" style="font-size:12px; margin-top:2px;" id="cb-period-label">الفترة: --</div>
          </div>
          <div class="badge badge-info" id="cb-displayed-count" style="font-size:12px; padding:4px 10px;">0 حساب</div>
        </div>

        <div class="table-container">
          <table class="data-dense" id="cb-table" style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:var(--bg-2); text-align:right;">
                <th style="padding:10px 14px;">كود الحساب</th>
                <th style="padding:10px 14px;">اسم الكيان</th>
                <th style="padding:10px 14px;">نوع الحساب</th>
                <th style="padding:10px 14px; text-align:left;">رصيد بداية الفترة</th>
                <th style="padding:10px 14px; text-align:left;">حركات مدين (Debit)</th>
                <th style="padding:10px 14px; text-align:left;">حركات دائن (Credit)</th>
                <th style="padding:10px 14px; text-align:left;">رصيد نهاية الفترة</th>
                <th style="padding:10px 14px; text-align:center;">الحالة</th>
              </tr>
            </thead>
            <tbody id="cb-tbody">
              ${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:14px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
            <tfoot id="cb-tfoot" style="background:var(--bg-2); font-weight:bold; border-top:2px solid var(--border-soft);">
              <tr>
                <td colspan="3" style="padding:12px 14px;">الإجمالي العام للتقرير</td>
                <td style="padding:12px 14px; text-align:left;" class="mono" id="cb-foot-open">0.00 ر.س</td>
                <td style="padding:12px 14px; text-align:left;" class="mono text-indigo" id="cb-foot-debit">0.00 ر.س</td>
                <td style="padding:12px 14px; text-align:left;" class="mono text-good" id="cb-foot-credit">0.00 ر.س</td>
                <td style="padding:12px 14px; text-align:left;" class="mono" id="cb-foot-close">0.00 ر.س</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>`;

  window.loadConsolidatedBalances = loadConsolidatedBalances;
  window.filterConsolidatedReport = filterConsolidatedReport;
  window.exportConsolidatedExcel = exportConsolidatedExcel;
  window.viewDetailedStatement = (id, type) => {
    window._preselectedStatementEntity = { id, type };
    if (typeof window.navigate === "function") {
      window.navigate("report-customer-statement");
    } else {
      console.error("navigate function not found on window");
    }
  };

  await loadConsolidatedBalances();
}

async function loadConsolidatedBalances() {
  const fromDate = document.getElementById("cb-from")?.value || startOfMonth();
  const toDate = document.getElementById("cb-to")?.value || todayString();
  const periodLabel = document.getElementById("cb-period-label");
  if (periodLabel) periodLabel.textContent = `الفترة من ${fromDate} إلى ${toDate}`;

  try {
    // 1. Fetch all required entities and transaction documents
    const [custSnap, suppSnap, coaSnap, invSnap, rcptSnap, purSnap, expSnap, salesRetSnap, purRetSnap, colSnap] = await Promise.all([
      getDocs(collection(db, `companies/${COMPANY_ID}/customers`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/suppliers`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/chartOfAccounts`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/salesInvoices`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/receipts`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/purchaseInvoices`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/expenses`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/salesReturns`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/purchaseReturns`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/collections`)),
    ]);

    const customers = custSnap.docs.map(d => ({ id: d.id, ...d.data(), entityType: "customer" }));
    const suppliers = suppSnap.docs.map(d => ({ id: d.id, ...d.data(), entityType: "supplier" }));
    const coaList = coaSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const salesInvoices = invSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => i.status !== "cancelled");
    const receiptsList = rcptSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const purchaseInvoices = purSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.status !== "cancelled");
    const expensesList = expSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const salesReturns = salesRetSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.status !== "cancelled");
    const purchaseReturns = purRetSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.status !== "cancelled");
    const collectionsList = colSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    reportData = [];

    // 2. Process Customers (Debit Balance calculations)
    for (const c of customers) {
      if (!c.name || c.name === "undefined") continue;

      let openBalance = parseFloat(c.openingBalance || 0);
      let periodDebit = 0;
      let periodCredit = 0;

      // 2.1 Sales Invoices (+ Debit)
      salesInvoices.filter(i => i.customerId === c.id).forEach(inv => {
        const dt = inv.date || "";
        const val = parseFloat(inv.totalWithVat || inv.total || 0);
        if (dt < fromDate) {
          openBalance += val;
        } else if (dt <= toDate) {
          periodDebit += val;
        }
      });

      // 2.2 Sales Returns (- Credit)
      salesReturns.filter(r => r.customerId === c.id).forEach(ret => {
        const dt = ret.date || "";
        const val = parseFloat(ret.totalWithVat !== undefined ? ret.totalWithVat : (ret.total !== undefined ? ret.total : (ret.subtotal || 0)));
        if (dt < fromDate) {
          openBalance -= val;
        } else if (dt <= toDate) {
          periodCredit += val;
        }
      });

      // 2.3 Representative collections (- Credit)
      collectionsList.filter(col => col.customerId === c.id).forEach(col => {
        const dt = col.date || "";
        const val = parseFloat(col.amount || 0);
        if (dt < fromDate) {
          openBalance -= val;
        } else if (dt <= toDate) {
          periodCredit += val;
        }
      });

      // 2.4 Admin ERP receipts (- Credit)
      receiptsList.filter(r => r.targetId === c.id && r.entityType === "customer").forEach(rcpt => {
        const dt = rcpt.date || "";
        const val = parseFloat(rcpt.amount || 0);
        if (dt < fromDate) {
          openBalance -= val;
        } else if (dt <= toDate) {
          periodCredit += val;
        }
      });

      let closingBalance = Math.round((openBalance + periodDebit - periodCredit) * 100) / 100;

      let cAcc = coaList.find(a => a.id === c.accountId || a.code === c.accountCode) ||
                 coaList.find(a => a.sourceEntityId === c.id && a.sourceModule === "customers") ||
                 coaList.find(a => a.name && c.name && a.name.includes(c.name) && (a.code.startsWith("1-1-2-1") || a.code.startsWith("1-1-2-1-2")));

      reportData.push({
        id: c.id,
        code: c.code || c.accountCode || (cAcc ? cAcc.code : "-"),
        name: c.name,
        entityType: "customer",
        entityTypeName: "عميل",
        openBalance: Math.round(openBalance * 100) / 100,
        periodDebit: Math.round(periodDebit * 100) / 100,
        periodCredit: Math.round(periodCredit * 100) / 100,
        closingBalance: closingBalance,
      });
    }

    // 3. Process Suppliers (Credit Balance calculations)
    for (const s of suppliers) {
      if (!s.name || s.name === "undefined") continue;

      let openBalance = parseFloat(s.openingBalance || 0);
      let periodDebit = 0;
      let periodCredit = 0;

      // 3.1 Purchase Invoices (+ Credit)
      purchaseInvoices.filter(p => p.supplierId === s.id).forEach(pur => {
        const dt = pur.date || "";
        const val = parseFloat(pur.totalWithVat || pur.total || 0);
        if (dt < fromDate) {
          openBalance += val;
        } else if (dt <= toDate) {
          periodCredit += val;
        }

        // Auto payments recorded on purchase invoices
        if (pur.paidAmount > 0) {
          const purDateStr = pur.date || "";
          const hasMatchingVoucher = expensesList.some(e => {
            const eDate = e.date || "";
            return eDate === purDateStr && e.targetId === s.id && Math.abs((e.amount || 0) - pur.paidAmount) < 0.01;
          });

          if (!hasMatchingVoucher) {
            if (purDateStr < fromDate) {
              openBalance -= pur.paidAmount;
            } else if (purDateStr <= toDate) {
              periodDebit += pur.paidAmount;
            }
          }
        }
      });

      // 3.2 Purchase Returns (- Debit)
      purchaseReturns.filter(r => r.supplierId === s.id).forEach(ret => {
        const dt = ret.date || "";
        const val = parseFloat(ret.totalWithVat || 0);
        if (dt < fromDate) {
          openBalance -= val;
        } else if (dt <= toDate) {
          periodDebit += val;
        }
      });

      // 3.3 Payments and expenses (- Debit)
      expensesList.filter(e => e.targetId === s.id && e.entityType === "supplier").forEach(exp => {
        const dt = exp.date || "";
        const val = parseFloat(exp.amount || 0);
        if (dt < fromDate) {
          openBalance -= val;
        } else if (dt <= toDate) {
          periodDebit += val;
        }
      });

      let closingBalance = Math.round((openBalance + periodCredit - periodDebit) * 100) / 100;

      let sAcc = coaList.find(a => a.id === s.accountId || a.code === s.accountCode) ||
                 coaList.find(a => a.sourceEntityId === s.id && a.sourceModule === "suppliers") ||
                 coaList.find(a => a.name && s.name && a.name.includes(s.name) && a.code.startsWith("2-1-1"));

      reportData.push({
        id: s.id,
        code: s.code || s.accountCode || (sAcc ? sAcc.code : "-"),
        name: s.name,
        entityType: "supplier",
        entityTypeName: "مورد",
        openBalance: Math.round(openBalance * 100) / 100,
        periodDebit: Math.round(periodDebit * 100) / 100,
        periodCredit: Math.round(periodCredit * 100) / 100,
        closingBalance: closingBalance,
      });
    }

    filterConsolidatedReport();
  } catch (err) {
    console.error("Failed to load consolidated balances:", err);
    window.showToast?.("خطأ في تحميل بيانات التقرير: " + err.message, "error");
  }
}

function filterConsolidatedReport() {
  const typeFilter = document.getElementById("cb-type-filter")?.value || "all";
  const search = (document.getElementById("cb-search")?.value || "").trim().toLowerCase();
  const hideZero = document.getElementById("cb-hide-zero")?.checked ?? true;

  const filtered = reportData.filter(item => {
    // Type Filter
    if (typeFilter !== "all" && item.entityType !== typeFilter) return false;

    // Search Filter
    if (search) {
      const matchName = item.name.toLowerCase().includes(search);
      const matchCode = item.code.toLowerCase().includes(search);
      if (!matchName && !matchCode) return false;
    }

    // Hide Zero Balances Filter
    if (hideZero) {
      const isZero = Math.abs(item.closingBalance) < 0.01 && Math.abs(item.periodDebit) < 0.01 && Math.abs(item.periodCredit) < 0.01;
      if (isZero) return false;
    }

    return true;
  });

  renderConsolidatedTable(filtered);
}

function renderConsolidatedTable(items) {
  const tbody = document.getElementById("cb-tbody");
  const countBadge = document.getElementById("cb-displayed-count");

  let totalCustomerReceivables = 0;
  let custCount = 0;
  let totalSupplierPayables = 0;
  let suppCount = 0;

  let sumOpen = 0;
  let sumDebit = 0;
  let sumCredit = 0;
  let sumClose = 0;

  reportData.forEach(d => {
    if (d.entityType === "customer") {
      if (d.closingBalance > 0.01) {
        totalCustomerReceivables += d.closingBalance;
        custCount++;
      }
    } else if (d.entityType === "supplier") {
      if (d.closingBalance > 0.01) {
        totalSupplierPayables += d.closingBalance;
        suppCount++;
      }
    }
  });

  if (countBadge) countBadge.textContent = `${items.length} حساب`;

  // Update KPIs
  const custKpi = document.getElementById("cb-kpi-cust-receivables");
  if (custKpi) custKpi.textContent = formatCurrency(totalCustomerReceivables);
  const custCntEl = document.getElementById("cb-kpi-cust-count");
  if (custCntEl) custCntEl.textContent = `${custCount} عميل مدين`;

  const suppKpi = document.getElementById("cb-kpi-supp-payables");
  if (suppKpi) suppKpi.textContent = formatCurrency(totalSupplierPayables);
  const suppCntEl = document.getElementById("cb-kpi-supp-count");
  if (suppCntEl) suppCntEl.textContent = `${suppCount} مورد دائن`;

  const netBalance = totalCustomerReceivables - totalSupplierPayables;
  const netKpi = document.getElementById("cb-kpi-net-balance");
  if (netKpi) {
    netKpi.textContent = formatCurrency(netBalance);
    netKpi.className = netBalance >= 0 ? "mono font-bold text-indigo" : "mono font-bold text-bad";
  }
  const totalEntEl = document.getElementById("cb-kpi-total-entities");
  if (totalEntEl) totalEntEl.textContent = `${reportData.length} كيان إجمالي`;

  if (!items || items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:30px; color:var(--text-2);">
          لا توجد بيانات مطابقة لخيارات البحث أو الفلترة المحجوبة.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = items.map(item => {
    sumOpen += item.openBalance;
    sumDebit += item.periodDebit;
    sumCredit += item.periodCredit;
    sumClose += item.closingBalance;

    let statusBadge = "";
    if (item.entityType === "customer") {
      if (item.closingBalance > 0.01) statusBadge = `<span class="badge badge-danger">مستحق عليه</span>`;
      else if (item.closingBalance < -0.01) statusBadge = `<span class="badge badge-success">رصيد دائن</span>`;
      else statusBadge = `<span class="badge" style="background:var(--bg-3); color:var(--text-2);">متزن</span>`;
    } else {
      if (item.closingBalance > 0.01) statusBadge = `<span class="badge badge-success">مستحق له</span>`;
      else if (item.closingBalance < -0.01) statusBadge = `<span class="badge badge-danger">رصيد مدين</span>`;
      else statusBadge = `<span class="badge" style="background:var(--bg-3); color:var(--text-2);">متزن</span>`;
    }

    const entityBadge = item.entityType === "customer" 
      ? `<span class="badge" style="background:rgba(91,127,255,0.1); color:var(--indigo); font-size:11px;">عميل</span>`
      : `<span class="badge" style="background:rgba(16,185,129,0.1); color:var(--good); font-size:11px;">مورد</span>`;

    return `
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:10px 14px;" class="mono">${item.code}</td>
        <td style="padding:10px 14px; font-weight:bold;">
          <a href="javascript:void(0)" onclick="viewDetailedStatement('${item.id}', '${item.entityType}')" style="color:var(--primary); text-decoration:none; border-bottom:1px dashed var(--primary); padding-bottom:1px; cursor:pointer;" title="عرض كشف الحساب التفصيلي">
            ${item.name}
          </a>
        </td>
        <td style="padding:10px 14px;">${entityBadge}</td>
        <td style="padding:10px 14px; text-align:left;" class="mono">${formatCurrency(item.openBalance)}</td>
        <td style="padding:10px 14px; text-align:left;" class="mono text-indigo">${formatCurrency(item.periodDebit)}</td>
        <td style="padding:10px 14px; text-align:left;" class="mono text-good">${formatCurrency(item.periodCredit)}</td>
        <td style="padding:10px 14px; text-align:left; font-weight:bold;" class="mono ${item.closingBalance > 0 ? 'text-bad' : item.closingBalance < 0 ? 'text-good' : ''}">
          ${formatCurrency(item.closingBalance)}
        </td>
        <td style="padding:10px 14px; text-align:center;">${statusBadge}</td>
      </tr>`;
  }).join("");

  // Footer totals
  const footOpen = document.getElementById("cb-foot-open");
  if (footOpen) footOpen.textContent = formatCurrency(sumOpen);

  const footDebit = document.getElementById("cb-foot-debit");
  if (footDebit) footDebit.textContent = formatCurrency(sumDebit);

  const footCredit = document.getElementById("cb-foot-credit");
  if (footCredit) footCredit.textContent = formatCurrency(sumCredit);

  const footClose = document.getElementById("cb-foot-close");
  if (footClose) footClose.textContent = formatCurrency(sumClose);
}

function exportConsolidatedExcel() {
  if (!reportData || reportData.length === 0) {
    window.showToast?.("لا توجد بيانات للتصدير", "warn");
    return;
  }

  try {
    const rows = reportData.map(item => ({
      "كود الحساب": item.code,
      "اسم الكيان": item.name,
      "نوع الحساب": item.entityTypeName,
      "رصيد بداية الفترة": item.openBalance,
      "مدين الفترة (+)": item.periodDebit,
      "دائن الفترة (-)": item.periodCredit,
      "رصيد نهاية الفترة": item.closingBalance,
    }));

    if (window.XLSX) {
      const ws = window.XLSX.utils.json_to_sheet(rows);
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, "أرصدة العملاء والموردين");
      window.XLSX.writeFile(wb, `تقرير_أرصدة_العملاء_والموردين_${todayString()}.xlsx`);
      window.showToast?.("تم تصدير ملف الإكسل بنجاح ✅", "success");
    } else {
      window.showToast?.("مكتبة Excel غير مثبتة", "error");
    }
  } catch (err) {
    window.showToast?.("خطأ أثناء التصدير: " + err.message, "error");
  }
}
