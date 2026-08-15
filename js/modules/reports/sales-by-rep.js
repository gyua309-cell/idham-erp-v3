// ============================================================
// IDHAM ERP — Sales by Rep Report (مبيعات حسب المندوب)
// ============================================================
import { COLS, getAll, collection } from "../../utils/db.js";
import { query, orderBy, limit, getDocs, where } from "../../utils/db.js";
import { formatCurrency, formatPercent, startOfMonth, todayString } from "../../utils/formatters.js";
import { db, COMPANY_ID } from "../../firebase-config.js";

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar">
      <div class="date-range-group"><label>من</label>
        <input type="date" id="rsr-from" value="${startOfMonth()}" onchange="loadSalesByRep()" /></div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="rsr-to" value="${todayString()}" onchange="loadSalesByRep()" /></div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="exportSalesByRep()">📤 CSV</button>
        <button class="btn btn-secondary btn-sm" onclick="loadSalesByRep()">🔄 تحديث</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">تقرير مبيعات المناديب وعمولاتهم</h1>
        <p class="page-subtitle" id="rsr-period"></p>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>اسم المندوب</th>
                <th>المنطقة</th>
                <th>عدد الفواتير</th>
                <th>إجمالي المبيعات</th>
                <th>المحصّل</th>
                <th>المتبقي</th>
                <th>الهدف الشهري</th>
                <th>نسبة الإنجاز</th>
                <th>العمولة المستحقة</th>
              </tr>
            </thead>
            <tbody id="rsr-tbody">
              ${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(9).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;

  await loadSalesByRep();
}

let repReportData = [];

async function loadSalesByRep() {
  const tbody = document.getElementById("rsr-tbody");
  const from  = document.getElementById("rsr-from")?.value;
  const to    = document.getElementById("rsr-to")?.value;

  document.getElementById("rsr-period").textContent = `الفترة: ${from} — ${to}`;
  if (tbody) tbody.innerHTML = `${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(9).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;

  try {
    const [reps, customers, rcptSnap, colSnap, invSnap] = await Promise.all([
      getAll(COLS.salesReps(), [orderBy("name")]),
      getAll(COLS.customers()),
      getDocs(query(collection(db, `companies/${COMPANY_ID}/receipts`), where("entityType", "==", "customer"))).catch(e => { console.warn(e); return { docs: [] }; }),
      getDocs(collection(db, `companies/${COMPANY_ID}/collections`)).catch(e => { console.warn(e); return { docs: [] }; }),
      getDocs(query(COLS.salesInvoices(), limit(2000)))
    ]);

    const receipts = rcptSnap.docs.map(d => d.data());
    const collections = colSnap.docs.map(d => d.data());
    const invoices = invSnap.docs.map(d => d.data()).filter(inv => {
      const d = inv.createdAt?.toDate ? inv.createdAt.toDate().toISOString().split("T")[0] : inv.date || "";
      return d >= from && d <= to && inv.status !== "cancelled";
    });

    const safeDateStr = (item) => {
      if (!item) return "";
      if (item.date) return item.date;
      if (!item.createdAt) return "";
      if (item.createdAt.toDate) return item.createdAt.toDate().toISOString().split("T")[0];
      if (item.createdAt.seconds) return new Date(item.createdAt.seconds * 1000).toISOString().split("T")[0];
      if (typeof item.createdAt === "string") return item.createdAt.split("T")[0];
      return "";
    };

    const periodReceipts = receipts.filter(r => {
      const d = safeDateStr(r);
      return (!from || d >= from) && (!to || d <= to);
    });

    const periodCollections = collections.filter(c => {
      const d = safeDateStr(c);
      return (!from || d >= from) && (!to || d <= to);
    });

    const repMap = {};
    reps.forEach(r => {
      repMap[r.id] = {
        name: r.name,
        zone: r.zone || "—",
        target: r.monthlyTarget || 0,
        commRate: r.commissionRate || 0,
        invCount: 0,
        totalSales: 0,
        paid: 0,
      };
    });

    // Sum receipts for customers belonging to this rep
    periodReceipts.forEach(r => {
      const cust = customers.find(c => c.id === r.targetId);
      if (cust && cust.repId && repMap[cust.repId]) {
        repMap[cust.repId].paid += r.amount || 0;
      }
    });

    // Sum collections belonging to this rep
    periodCollections.forEach(c => {
      if (c.repId && repMap[c.repId]) {
        repMap[c.repId].paid += c.amount || 0;
      }
    });

    // Sum unmatched cash/paid invoices belonging to this rep
    const activeInvs = invoices.filter(i => i.status !== "cancelled");
    const periodCashInvs = activeInvs.filter(i => i.paymentMethod === "cash" || i.status === "paid");
    periodCashInvs.forEach(i => {
      if (!i.repId || !repMap[i.repId]) return;
      const amt = i.totalWithVat || i.total || 0;
      const invDateStr = i.date || "";
      
      const hasReceipt = periodReceipts.some(r => {
        const rDate = safeDateStr(r);
        if (!rDate || !invDateStr) return false;
        const diffDays = Math.abs(new Date(rDate) - new Date(invDateStr)) / 86400000;
        return (r.targetId === i.customerId || r.customerId === i.customerId) && Math.abs(r.amount - amt) < 2.0 && diffDays <= 7;
      }) || periodCollections.some(c => {
        const cDate = safeDateStr(c);
        if (!cDate || !invDateStr) return false;
        const diffDays = Math.abs(new Date(cDate) - new Date(invDateStr)) / 86400000;
        return c.customerId === i.customerId && Math.abs(c.amount - amt) < 2.0 && diffDays <= 7;
      });

      if (!hasReceipt) {
        repMap[i.repId].paid += amt;
      }
    });

    // Loop through all invoices to count totalSales and invCount
    invoices.forEach(inv => {
      if (!inv.repId || !repMap[inv.repId]) return;
      repMap[inv.repId].invCount++;
      repMap[inv.repId].totalSales += inv.totalWithVat || inv.total || 0;
    });

    repReportData = Object.values(repMap);

    if (repReportData.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد بيانات مناديب</td></tr>`;
      return;
    }

    tbody.innerHTML = repReportData.map(r => {
      const remaining  = r.totalSales - r.paid;
      const pct        = r.target > 0 ? (r.totalSales / r.target) * 100 : 0;
      const commission = r.paid * (r.commRate / 100);
      const color      = pct >= 100 ? "good" : pct >= 70 ? "indigo" : "warn";

      return `
        <tr>
          <td class="font-heading font-semibold">${r.name}</td>
          <td class="dim">${r.zone}</td>
          <td class="mono">${r.invCount}</td>
          <td class="mono font-bold">${formatCurrency(r.totalSales)}</td>
          <td class="mono text-good">${formatCurrency(r.paid)}</td>
          <td class="mono text-bad">${formatCurrency(remaining)}</td>
          <td class="mono dim">${formatCurrency(r.target)}</td>
          <td style="min-width:110px;">
            <div class="flex items-center gap-6">
              <div class="progress-bar" style="flex:1;">
                <div class="fill ${color}" style="width:${Math.min(pct, 100)}%;"></div>
              </div>
              <span class="mono text-${color}" style="font-size:10px;">${pct.toFixed(0)}%</span>
            </div>
          </td>
          <td class="mono font-bold text-indigo">${formatCurrency(commission)}</td>
        </tr>`;
    }).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="alert bad" style="margin:8px;">${err.message}</div></td></tr>`;
  }
}

window.exportSalesByRep = () => {
  const rows = [["المندوب","المنطقة","عدد الفواتير","المبيعات","المحصّل","المتبقي","الهدف","إنجاز%","العمولة"]];
  repReportData.forEach(r => {
    const rem = r.totalSales - r.paid;
    const pct = r.target > 0 ? (r.totalSales / r.target) * 100 : 0;
    const comm = r.paid * (r.commRate / 100);
    rows.push([r.name, r.zone, r.invCount, r.totalSales, r.paid, rem, r.target, pct.toFixed(1)+"%", comm.toFixed(2)]);
  });
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv" }));
  a.download = `sales_by_rep_${todayString()}.csv`;
  a.click();
  showToast("تم التصدير", "success");
};
