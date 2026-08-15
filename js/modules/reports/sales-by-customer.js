// ============================================================
// IDHAM ERP — Sales by Customer Report (مبيعات حسب العميل)
// ============================================================
import { COLS, getAll } from "../../utils/db.js";
import { query, orderBy, limit, getDocs } from "../../utils/db.js";
import { formatCurrency, startOfMonth, todayString } from "../../utils/formatters.js";

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar">
      <div class="date-range-group"><label>من</label>
        <input type="date" id="rsc-from" value="${startOfMonth()}" onchange="loadSalesByCustomer()" /></div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="rsc-to" value="${todayString()}" onchange="loadSalesByCustomer()" /></div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="exportSalesByCustomer()">📤 CSV</button>
        <button class="btn btn-secondary btn-sm" onclick="loadSalesByCustomer()">🔄 تحديث</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">تقرير مبيعات العملاء وديونهم</h1>
        <p class="page-subtitle" id="rsc-period"></p>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>اسم العميل</th>
                <th>المنطقة</th>
                <th>المندوب</th>
                <th>عدد الفواتير</th>
                <th>إجمالي المشتروات</th>
                <th>الرصيد المدين الحالي</th>
                <th>حد الائتمان</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="rsc-tbody">
              ${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;

  await loadSalesByCustomer();
}

let custReportData = [];

async function loadSalesByCustomer() {
  const tbody = document.getElementById("rsc-tbody");
  const from  = document.getElementById("rsc-from")?.value;
  const to    = document.getElementById("rsc-to")?.value;

  document.getElementById("rsc-period").textContent = `الفترة: ${from} — ${to}`;
  if (tbody) tbody.innerHTML = `${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;

  try {
    const custs = await getAll(COLS.customers(), [orderBy("name")]);
    const q     = query(COLS.salesInvoices(), limit(2000));
    const snap  = await getDocs(q);
    const invoices = snap.docs.map(d => d.data()).filter(inv => {
      const d = inv.createdAt?.toDate ? inv.createdAt.toDate().toISOString().split("T")[0] : inv.date || "";
      return d >= from && d <= to && inv.status !== "cancelled";
    });

    const custMap = {};
    custs.forEach(c => {
      custMap[c.id] = {
        id: c.id,
        name: c.name,
        zone: c.zone || "—",
        repName: c.repName || "—",
        balance: c.balance || 0,
        creditLimit: c.creditLimit || 0,
        invCount: 0,
        totalSales: 0,
      };
    });

    invoices.forEach(inv => {
      if (!inv.customerId || !custMap[inv.customerId]) return;
      custMap[inv.customerId].invCount++;
      custMap[inv.customerId].totalSales += inv.totalWithVat || 0;
    });

    custReportData = Object.values(custMap).filter(c => c.totalSales > 0 || c.balance > 0);

    if (custReportData.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد حركات مبيعات عملاء في هذه الفترة</td></tr>`;
      return;
    }

    tbody.innerHTML = custReportData.map(c => `
      <tr>
        <td class="font-heading font-semibold">${c.name}</td>
        <td class="dim">${c.zone}</td>
        <td class="dim">${c.repName}</td>
        <td class="mono">${c.invCount}</td>
        <td class="mono font-bold text-indigo">${formatCurrency(c.totalSales)}</td>
        <td class="mono font-bold ${c.balance > 0 ? "text-bad" : "text-good"}">${formatCurrency(c.balance)}</td>
        <td class="mono dim">${formatCurrency(c.creditLimit)}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="navigate('report-customer-statement')">📄 كشف حساب</button>
        </td>
      </tr>`).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="alert bad" style="margin:8px;">${err.message}</div></td></tr>`;
  }
}

window.exportSalesByCustomer = () => {
  const rows = [["العميل","المنطقة","المندوب","الفواتير","المشتروات","الرصيد المدين","حد الائتمان"]];
  custReportData.forEach(c => rows.push([c.name, c.zone, c.repName, c.invCount, c.totalSales, c.balance, c.creditLimit]));
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv" }));
  a.download = `sales_by_customer_${todayString()}.csv`;
  a.click();
  showToast("تم التصدير", "success");
};
