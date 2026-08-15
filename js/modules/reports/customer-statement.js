// ============================================================
// IDHAM ERP — Unified Statement Report (كشف الحساب الموحد)
// Customers, Suppliers, and Sales Representatives
// ============================================================
import { COLS, getAll } from "../../utils/db.js";
import { query, where, orderBy, limit, getDocs, doc, getDoc, collection } from "../../utils/db.js";
import { formatCurrency, formatDate, startOfMonth, todayString } from "../../utils/formatters.js";
import { db, COMPANY_ID } from "../../firebase-config.js";

export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar no-print">
      <!-- Entity Type Selector -->
      <div class="filter-select-group" style="min-width:160px;">
        <label>نوع الحساب</label>
        <select id="stmt-type-select" onchange="onStatementTypeChange()">
          <option value="customer">عميل (Customer)</option>
          <option value="supplier">مورد (Supplier)</option>
          <option value="rep">مندوب مبيعات (Sales Rep)</option>
        </select>
      </div>
      
      <!-- Entity Selector -->
      <div class="filter-select-group" style="min-width:240px;">
        <label id="stmt-entity-label">اختر العميل</label>
        <select id="stmt-entity-select" onchange="loadStatement()">
          <option value="">اختر...</option>
        </select>
      </div>
      
      <!-- Date Range Filters -->
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="stmt-from" value="${startOfMonth()}" onchange="loadStatement()" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="stmt-to" value="${todayString()}" onchange="loadStatement()" />
      </div>
      
      <!-- Export Buttons -->
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn-export" onclick="exportStatementPDF()" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportStatementExcel()" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة كشف الحساب"><span>🖨️</span> طباعة</button>
      </div>
    </div>

    <div class="page-content">
      <!-- Summary stat cards banner -->
      <div class="grid-3 gap-16 mb-20" id="stmt-summary-cards">
        <!-- Stat 1: Total Debit -->
        <div class="card" style="padding:16px;">
          <div class="text-2 mb-4" style="font-size:12px;">إجمالي المدين (+)</div>
          <div class="mono font-bold text-indigo" style="font-size:22px;" id="stmt-total-debit">0.00 ر.س</div>
        </div>
        <!-- Stat 2: Total Credit -->
        <div class="card" style="padding:16px;">
          <div class="text-2 mb-4" style="font-size:12px;">إجمالي الدائن (-)</div>
          <div class="mono font-bold text-good" style="font-size:22px;" id="stmt-total-credit">0.00 ر.س</div>
        </div>
        <!-- Stat 3: Closing Balance -->
        <div class="card" style="padding:16px;">
          <div class="text-2 mb-4" style="font-size:12px;">الرصيد النهائي (الصافي)</div>
          <div class="mono font-bold text-bad" style="font-size:22px;" id="stmt-closing-balance">0.00 ر.س</div>
        </div>
      </div>

      <!-- Header Banner -->
      <div class="card mb-20" id="stmt-header-card">
        <div class="card-body" style="padding:24px;">
          <div class="flex justify-between items-center">
            <div>
              <h2 style="font-family:var(--font-heading);font-size:20px;margin-bottom:4px;" id="stmt-entity-name">كشف حساب موحد</h2>
              <div class="text-2" style="font-size:12px;" id="stmt-entity-details">حدد نوع الحساب والكيان لعرض الحركة التفصيلية</div>
            </div>
            <div class="text-left" style="display:none;" id="stmt-closing-status-box">
              <span class="badge" id="stmt-closing-status" style="font-size:13px; padding:6px 14px;">—</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sales Rep Performance Summary Panel (Conditionally visible) -->
      <div class="card mb-20 hidden" id="stmt-rep-perf-panel" style="background:var(--bg-1); border-right:4px solid var(--indigo); overflow:hidden;">
        <div class="card-header" style="padding:12px 20px; border-bottom:1px solid var(--border-soft); background:rgba(91,127,255,0.03);">
          <h3 style="font-family:var(--font-heading);font-size:14px;color:var(--indigo);margin:0;"><i class="fas fa-chart-line"></i> ملخص أداء المندوب خلال الفترة</h3>
        </div>
        <div class="card-body" style="padding:20px;">
          <div class="grid-3 gap-16">
            <div style="background:var(--bg-2); padding:12px; border-radius:8px; border:1px solid var(--border-soft);">
              <div class="text-2 mb-4" style="font-size:11px;">إجمالي المبيعات (نقدي + آجل)</div>
              <div class="mono font-bold text-indigo" style="font-size:18px;" id="stmt-rep-sales">0.00 ر.س</div>
            </div>
            <div style="background:var(--bg-2); padding:12px; border-radius:8px; border:1px solid var(--border-soft);">
              <div class="text-2 mb-4" style="font-size:11px;">العمولة المستحقة</div>
              <div class="mono font-bold text-warn" style="font-size:18px;" id="stmt-rep-commission">0.00 ر.س</div>
            </div>
            <div style="background:var(--bg-2); padding:12px; border-radius:8px; border:1px solid var(--border-soft);">
              <div class="text-2 mb-4" style="font-size:11px;">إجمالي مرتجعات عملائه</div>
              <div class="mono font-bold text-bad" style="font-size:18px;" id="stmt-rep-returns">0.00 ر.س</div>
            </div>
          </div>
          <div class="grid-3 gap-16" style="margin-top:16px;">
            <div style="background:var(--bg-2); padding:12px; border-radius:8px; border:1px solid var(--border-soft);">
              <div class="text-2 mb-4" style="font-size:11px;">النقدية المحصلة بطرفه (العهد المستلمة)</div>
              <div class="mono font-bold text-good" style="font-size:18px;" id="stmt-rep-collections">0.00 ر.س</div>
            </div>
            <div style="background:var(--bg-2); padding:12px; border-radius:8px; border:1px solid var(--border-soft);">
              <div class="text-2 mb-4" style="font-size:11px;">المبالغ الموردة والمسلَّمة للخزينة</div>
              <div class="mono font-bold text-good" style="font-size:18px;" id="stmt-rep-handovers">0.00 ر.س</div>
            </div>
            <div style="background:var(--bg-2); padding:12px; border-radius:8px; border:1px solid var(--border-soft);">
              <div class="text-2 mb-4" style="font-size:11px;">الرصيد النقدي المتبقي بحوزته (المحفظة)</div>
              <div class="mono font-bold text-bad" style="font-size:18px;" id="stmt-rep-vault-balance">0.00 ر.س</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statement Ledger Table -->
      <div class="card">
        <div class="table-container">
          <table class="data-dense" id="stmt-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>نوع الحركة</th>
                <th>رقم المستند</th>
                <th>البيان / ملاحظات</th>
                <th class="text-indigo">مدين (+)</th>
                <th class="text-lime">دائن (-)</th>
                <th>الرصيد المترتب</th>
              </tr>
            </thead>
            <tbody id="stmt-tbody">
              <tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">اختر نوع الحساب ثم الكيان لعرض كشف الحساب</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>`;

  await initDropdowns();
}

let customersList = [];
let suppliersList = [];
let repsList = [];
let statementRows = [];

async function initDropdowns() {
  try {
    const [custs, sups, reps] = await Promise.all([
      getAll(COLS.customers(), [orderBy("name")]),
      getAll(COLS.suppliers(), [orderBy("name")]),
      getAll(COLS.salesReps(), [orderBy("name")]),
    ]);
    customersList = custs;
    suppliersList = sups;
    repsList = reps;

    if (window._preselectedStatementEntity) {
      const pre = window._preselectedStatementEntity;
      window._preselectedStatementEntity = null; // consume
      
      const typeSel = document.getElementById("stmt-type-select");
      if (typeSel) {
        typeSel.value = pre.type;
        await onStatementTypeChange();
        const entSel = document.getElementById("stmt-entity-select");
        if (entSel) {
          entSel.value = pre.id;
          await loadStatement();
        }
      }
    } else {
      await onStatementTypeChange();
    }
  } catch (err) {
    console.error("Statement init error:", err);
  }
}

window.onStatementTypeChange = async () => {
  const type = document.getElementById("stmt-type-select").value;
  const label = document.getElementById("stmt-entity-label");
  const select = document.getElementById("stmt-entity-select");
  const perfPanel = document.getElementById("stmt-rep-perf-panel");

  if (!select || !label) return;

  select.innerHTML = '<option value="">اختر...</option>';
  perfPanel?.classList.add("hidden");

  if (type === "customer") {
    label.textContent = "اختر العميل";
    customersList.forEach(c => {
      select.innerHTML += `<option value="${c.id}">${c.name} (${c.phone || "بلا هاتف"})</option>`;
    });
  } else if (type === "supplier") {
    label.textContent = "اختر المورد";
    suppliersList.forEach(s => {
      select.innerHTML += `<option value="${s.id}">${s.name} (${s.phone || "بلا هاتف"})</option>`;
    });
  } else if (type === "rep") {
    label.textContent = "اختر المندوب";
    repsList.forEach(r => {
      select.innerHTML += `<option value="${r.id}">${r.name} (${r.zone || "بلا مسار"})</option>`;
    });
  }

  const tbody = document.getElementById("stmt-tbody");
  if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">حدد الكيان لعرض كشف الحساب</td></tr>`;
  
  document.getElementById("stmt-total-debit").textContent = "0.00 ر.س";
  document.getElementById("stmt-total-credit").textContent = "0.00 ر.س";
  document.getElementById("stmt-closing-balance").textContent = "0.00 ر.س";
  document.getElementById("stmt-closing-status-box").style.display = "none";
  document.getElementById("stmt-entity-name").textContent = "كشف حساب موحد";
  document.getElementById("stmt-entity-details").textContent = "حدد نوع الحساب والكيان لعرض الحركة التفصيلية";
};

window.loadStatement = async () => {
  const type = document.getElementById("stmt-type-select")?.value;
  const entityId = document.getElementById("stmt-entity-select")?.value;
  const tbody = document.getElementById("stmt-tbody");
  const from = document.getElementById("stmt-from")?.value;
  const to = document.getElementById("stmt-to")?.value;

  if (!entityId) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">حدد الكيان لعرض كشف الحساب</td></tr>`;
    document.getElementById("stmt-total-debit").textContent = "0.00 ر.س";
    document.getElementById("stmt-total-credit").textContent = "0.00 ر.س";
    document.getElementById("stmt-closing-balance").textContent = "0.00 ر.س";
    document.getElementById("stmt-closing-status-box").style.display = "none";
    document.getElementById("stmt-entity-name").textContent = "كشف حساب موحد";
    return;
  }

  if (tbody) {
    tbody.innerHTML = `${Array(6).fill(0).map(() => `
      <tr class="skeleton-row">
        ${Array(7).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
      </tr>`).join("")}`;
  }

  try {
    if (type === "customer") {
      await loadCustomerStatement(entityId, from, to);
    } else if (type === "supplier") {
      await loadSupplierStatement(entityId, from, to);
    } else if (type === "rep") {
      await loadRepStatement(entityId, from, to);
    }
  } catch (err) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="7"><div class="alert bad" style="margin:8px;">${err.message}</div></td></tr>`;
  }
};

async function loadCustomerStatement(custId, from, to) {
  const cust = customersList.find(c => c.id === custId);
  if (cust) {
    document.getElementById("stmt-entity-name").textContent = cust.name;
    document.getElementById("stmt-entity-details").textContent = `الهاتف: ${cust.phone || "—"} | المنطقة: ${cust.zone || "—"} | حد الائتمان: ${formatCurrency(cust.creditLimit || 0)}`;
  }

  const invQ = query(COLS.salesInvoices(), where("customerId", "==", custId), limit(500));
  const invSnap = await getDocs(invQ);
  const invoices = invSnap.docs.map(d => d.data());

  const retQ = query(COLS.salesReturns(), where("customerId", "==", custId), limit(500));
  const retSnap = await getDocs(retQ);
  const returns = retSnap.docs.map(d => d.data());

  const colQ = query(collection(db, `companies/${COMPANY_ID}/collections`), where("customerId", "==", custId), limit(500));
  const colSnap = await getDocs(colQ);
  const collections = colSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const rcptQ = query(collection(db, `companies/${COMPANY_ID}/receipts`), where("targetId", "==", custId), limit(500));
  const rcptSnap = await getDocs(rcptQ);
  const receipts = rcptSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.entityType === "customer");

  let ledger = [];

  invoices.forEach(inv => {
    if (inv.status === "cancelled") return;
    const pm = (inv.paymentMethod || "cash").toLowerCase();
    // تم إلغاء استثناء الفواتير النقدية لكي تظهر في كشف الحساب وتتطابق مع سند القبض التلقائي المقابل لها
    /*
    if (pm === "cash" && (inv.status === "paid" || (inv.paidAmount || 0) >= (inv.totalWithVat || inv.total || 0))) {
      // Exclude cash invoices that are paid (since they have no effect on credit/receivables balance)
      return;
    }
    */
    ledger.push({
      date: inv.date || (inv.createdAt?.toDate ? inv.createdAt.toDate().toISOString().split("T")[0] : ""),
      type: "فاتورة مبيعات",
      docNum: inv.number || inv.invoiceNumber || "",
      notes: `مبيعات ${inv.lines?.length || 0} صنف — ${pm === 'cash' ? 'نقدي' : 'آجل'}`,
      debit: inv.totalWithVat || 0,
      credit: 0,
    });
  });

  returns.forEach(ret => {
    if (ret.status === "cancelled" || ret.status === "void") return;
    const docNum = ret.number || ret.creditNoteNumber || ret.id || "";
    const originalInv = ret.originalInvoiceNumber || ret.refInvoice || "";
    const creditVal = parseFloat(ret.totalWithVat !== undefined ? ret.totalWithVat : (ret.total !== undefined ? ret.total : (ret.subtotal || 0)));
    ledger.push({
      date: ret.date || (ret.createdAt?.toDate ? ret.createdAt.toDate().toISOString().split("T")[0] : ""),
      type: "إشعار دائن (مرتجع)",
      docNum: docNum,
      notes: `مردودات فاتورة ${originalInv} — ${ret.reason || ""}`,
      debit: 0,
      credit: creditVal,
    });
  });

  collections.forEach(col => {
    ledger.push({
      date: col.date || (col.createdAt?.toDate ? col.createdAt.toDate().toISOString().split("T")[0] : ""),
      type: "سند قبض وتحصيل (مبيعات)",
      docNum: col.number || `COL-${col.id.slice(0, 5)}`,
      notes: `تحصيل نقدي — طريقة الدفع: ${col.method || "نقدي"} ${col.notes ? '— ' + col.notes : ''}`,
      debit: 0,
      credit: col.amount || 0,
    });
  });

  receipts.forEach(rcpt => {
    ledger.push({
      date: rcpt.date || (rcpt.createdAt?.toDate ? rcpt.createdAt.toDate().toISOString().split("T")[0] : ""),
      type: "سند قبض",
      docNum: `RC-${rcpt.id.substring(0,6).toUpperCase()}`,
      notes: `سند قبض — طريقة الدفع: ${rcpt.method === 'cash' ? 'نقدي' : 'تحويل بنكي'} — بيان: ${rcpt.notes || ""}`,
      debit: 0,
      credit: rcpt.amount || 0,
    });
  });

  renderLedger(ledger, from, to, "balance_due");
}

async function loadSupplierStatement(supId, from, to) {
  const supplier = suppliersList.find(s => s.id === supId);
  if (supplier) {
    document.getElementById("stmt-entity-name").textContent = supplier.name;
    document.getElementById("stmt-entity-details").textContent = `الهاتف: ${supplier.phone || "—"} | الرقم الضريبي: ${supplier.vatNumber || "—"}`;
  }

  const invQ = query(COLS.purchaseInvoices(), where("supplierId", "==", supId), limit(500));
  const invSnap = await getDocs(invQ);
  const invoices = invSnap.docs.map(d => d.data());

  const retQ = query(COLS.purchaseReturns(), where("supplierId", "==", supId), limit(500));
  const retSnap = await getDocs(retQ);
  const returns = retSnap.docs.map(d => d.data());

  const expQ = query(collection(db, `companies/${COMPANY_ID}/expenses`), where("targetId", "==", supId), limit(500));
  const expSnap = await getDocs(expQ);
  const expenses = expSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(e => e.entityType === "supplier");

  let ledger = [];

  invoices.forEach(pur => {
    if (pur.status === "cancelled") return;
    ledger.push({
      date: pur.date || (pur.createdAt?.toDate ? pur.createdAt.toDate().toISOString().split("T")[0] : ""),
      type: "فاتورة مشتريات",
      docNum: pur.number,
      notes: `مشتريات ${pur.lines?.length || 0} صنف — ${pur.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}`,
      debit: 0,
      credit: pur.totalWithVat || 0,
    });

    if (pur.paidAmount > 0) {
      // Check if there is already a manual payment voucher (PV-xxxx) or expense on the same day with the same amount
      const purDateStr = pur.date || (pur.createdAt?.toDate ? pur.createdAt.toDate().toISOString().split("T")[0] : "");
      const hasMatchingVoucher = expenses.some(e => {
        const eDate = e.date || (e.createdAt?.toDate ? e.createdAt.toDate().toISOString().split("T")[0] : "");
        return eDate === purDateStr && Math.abs((e.amount || 0) - pur.paidAmount) < 0.01;
      });

      if (!hasMatchingVoucher) {
        ledger.push({
          date: purDateStr,
          type: "سداد دفعة للمورد (فاتورة)",
          docNum: `PAY-${pur.number}`,
          notes: `سداد دفعة عن فاتورة ${pur.number}`,
          debit: pur.paidAmount,
          credit: 0,
        });
      }
    }
  });

  returns.forEach(ret => {
    if (ret.status === "cancelled" || ret.status === "void") return;
    ledger.push({
      date: ret.date || (ret.createdAt?.toDate ? ret.createdAt.toDate().toISOString().split("T")[0] : ""),
      type: "إشعار مدين (مرتجع مشتريات)",
      docNum: ret.number,
      notes: `مرتجع مشتريات للفاتورة ${ret.originalInvoiceNumber || ""} — ${ret.reason || ""}`,
      debit: ret.totalWithVat || 0,
      credit: 0,
    });
  });

  expenses.forEach(exp => {
    ledger.push({
      date: exp.date || (exp.createdAt?.toDate ? exp.createdAt.toDate().toISOString().split("T")[0] : ""),
      type: "سند صرف للمورد",
      docNum: `PV-${exp.id.substring(0,6).toUpperCase()}`,
      notes: `سند صرف — طريقة الدفع: ${exp.method === 'cash' ? 'نقدي' : 'تحويل بنكي'} — بيان: ${exp.notes || ""}`,
      debit: exp.amount || 0,
      credit: 0,
    });
  });

  renderLedger(ledger, from, to, "liability_due");
}

async function loadRepStatement(repId, from, to) {
  const rep = repsList.find(r => r.id === repId);
  if (rep) {
    document.getElementById("stmt-entity-name").textContent = rep.name;
    document.getElementById("stmt-entity-details").textContent = `الهاتف: ${rep.phone || "—"} | المسار: ${rep.zone || "—"} | العمولة: ${rep.commissionRate || 0}%`;
  }

  document.getElementById("stmt-rep-perf-panel").classList.remove("hidden");

  const invQ = query(COLS.salesInvoices(), where("repId", "==", repId), limit(500));
  const invSnap = await getDocs(invQ);
  const invoices = invSnap.docs.map(d => d.data());

  const retQ = query(COLS.salesReturns(), where("repId", "==", repId), limit(500));
  const retSnap = await getDocs(retQ);
  const returns = retSnap.docs.map(d => d.data());

  const colQ = query(collection(db, `companies/${COMPANY_ID}/collections`), where("repId", "==", repId), limit(500));
  const colSnap = await getDocs(colQ);
  const collections = colSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const cBoxes = await getAll(COLS.cashBoxes());
  const repBox = cBoxes.find(b => b.keeper?.trim() === rep.name.trim() || b.name.includes(rep.name));
  
  let cashTxns = [];
  if (repBox) {
    const txnQ = query(COLS.cashTransactions(), where("cashBoxId", "==", repBox.id), limit(1000));
    const txnSnap = await getDocs(txnQ);
    cashTxns = txnSnap.docs.map(d => d.data());
  }

  let totalSales = 0;
  let totalReturns = 0;
  let totalCashCollected = 0;
  let totalHandovers = 0;

  invoices.forEach(inv => {
    if (inv.status === "cancelled") return;
    totalSales += (inv.totalWithVat || 0);
    if (inv.paidAmount > 0) {
      totalCashCollected += inv.paidAmount;
    }
  });

  returns.forEach(ret => {
    if (ret.status === "cancelled") return;
    const val = parseFloat(ret.totalWithVat !== undefined ? ret.totalWithVat : (ret.total !== undefined ? ret.total : (ret.subtotal || 0)));
    totalReturns += val;
  });

  collections.forEach(col => {
    totalCashCollected += (col.amount || 0);
  });

  cashTxns.forEach(txn => {
    if (txn.type === "out") {
      totalHandovers += (txn.amount || 0);
    }
  });

  const commission = totalSales * (rep.commissionRate || 0) / 100;
  const vaultBalance = repBox ? (repBox.balance || 0) : Math.max(0, totalCashCollected - totalHandovers);

  document.getElementById("stmt-rep-sales").textContent       = formatCurrency(totalSales);
  document.getElementById("stmt-rep-commission").textContent  = formatCurrency(commission);
  document.getElementById("stmt-rep-returns").textContent     = formatCurrency(totalReturns);
  document.getElementById("stmt-rep-collections").textContent = formatCurrency(totalCashCollected);
  document.getElementById("stmt-rep-handovers").textContent   = formatCurrency(totalHandovers);
  document.getElementById("stmt-rep-vault-balance").textContent = formatCurrency(vaultBalance);

  let ledger = [];

  invoices.forEach(inv => {
    if (inv.status === "cancelled") return;
    ledger.push({
      date: inv.date || (inv.createdAt?.toDate ? inv.createdAt.toDate().toISOString().split("T")[0] : ""),
      type: "مبيعات مندوب (فاتورة)",
      docNum: inv.number,
      notes: `فاتورة مبيعات للعميل ${inv.customerName} (${inv.lines?.length || 0} صنف)`,
      debit: inv.totalWithVat || 0,
      credit: 0,
    });
  });

  returns.forEach(ret => {
    if (ret.status === "cancelled") return;
    const docNum = ret.number || ret.creditNoteNumber || ret.id || "";
    const originalInv = ret.originalInvoiceNumber || ret.refInvoice || "";
    const creditVal = parseFloat(ret.totalWithVat !== undefined ? ret.totalWithVat : (ret.total !== undefined ? ret.total : (ret.subtotal || 0)));
    ledger.push({
      date: ret.date || (ret.createdAt?.toDate ? ret.createdAt.toDate().toISOString().split("T")[0] : ""),
      type: "مرتجع مبيعات لعملائه",
      docNum: docNum,
      notes: `مرتجع من العميل ${ret.customerName} للفاتورة ${originalInv}`,
      debit: 0,
      credit: creditVal,
    });
  });

  collections.forEach(col => {
    ledger.push({
      date: col.date || (col.createdAt?.toDate ? col.createdAt.toDate().toISOString().split("T")[0] : ""),
      type: "تحصيل نقدي من عميل",
      docNum: col.number || `COL-${col.id.slice(0, 5)}`,
      notes: `تحصيل من العميل — طريقة السداد: ${col.method || "نقدي"}`,
      debit: 0,
      credit: col.amount || 0,
    });
  });

  cashTxns.forEach(txn => {
    if (txn.type === "out") {
      const txnDate = txn.createdAt?.toDate ? txn.createdAt.toDate().toISOString().split("T")[0] : "";
      ledger.push({
        date: txnDate || todayString(),
        type: "تسليم نقدية للخزينة",
        docNum: "TRF-MAIN",
        notes: `توريد المندوب للخزينة: ${txn.notes || "تصدير عهدة نقدية"}`,
        debit: 0,
        credit: txn.amount || 0,
      });
    }
  });

  renderLedger(ledger, from, to, "rep_sales_balance");
}

function renderLedger(ledger, from, to, balanceMode) {
  const tbody = document.getElementById("stmt-tbody");

  ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (from || to) {
    ledger = ledger.filter(l => (!from || l.date >= from) && (!to || l.date <= to));
  }

  let totalDebit = 0;
  let totalCredit = 0;
  let runningBalance = 0;

  statementRows = ledger.map(l => {
    totalDebit += l.debit;
    totalCredit += l.credit;
    runningBalance += (l.debit - l.credit);
    return { ...l, balance: runningBalance };
  });

  document.getElementById("stmt-total-debit").textContent = formatCurrency(totalDebit);
  document.getElementById("stmt-total-credit").textContent = formatCurrency(totalCredit);
  document.getElementById("stmt-closing-balance").textContent = formatCurrency(runningBalance);

  const statusBox = document.getElementById("stmt-closing-status-box");
  const statusBadge = document.getElementById("stmt-closing-status");
  statusBox.style.display = "block";

  if (balanceMode === "balance_due") {
    if (runningBalance > 0) {
      statusBadge.className = "badge bad";
      statusBadge.textContent = "مستحق عليه (ذمم مدينة)";
    } else if (runningBalance < 0) {
      statusBadge.className = "badge good";
      statusBadge.textContent = "مستحق له (دائن)";
    } else {
      statusBadge.className = "badge neutral";
      statusBadge.textContent = "حساب متزن";
    }
  } else if (balanceMode === "liability_due") {
    if (runningBalance > 0) {
      statusBadge.className = "badge good";
      statusBadge.textContent = "مستحق لنا (مدين)";
    } else if (runningBalance < 0) {
      statusBadge.className = "badge bad";
      statusBadge.textContent = "مستحق له (ذمم دائنة)";
    } else {
      statusBadge.className = "badge neutral";
      statusBadge.textContent = "حساب متزن";
    }
  } else {
    statusBadge.className = "badge indigo";
    statusBadge.textContent = "رصيد الأنشطة والتحصيل";
  }

  if (statementRows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد حركات مالية مسجلة في هذه الفترة</td></tr>`;
    return;
  }

  tbody.innerHTML = statementRows.map(r => `
    <tr>
      <td class="dim">${formatDate(r.date)}</td>
      <td><span class="badge ${r.debit > 0 ? 'indigo' : 'good'}" style="font-size:10.5px;">${r.type}</span></td>
      <td class="mono font-semibold text-indigo">${r.docNum}</td>
      <td>${r.notes}</td>
      <td class="mono ${r.debit > 0 ? "text-indigo font-bold" : "dim"}">${r.debit > 0 ? formatCurrency(r.debit) : "—"}</td>
      <td class="mono ${r.credit > 0 ? "text-good font-bold" : "dim"}">${r.credit > 0 ? formatCurrency(r.credit) : "—"}</td>
      <td class="mono font-bold ${r.balance > 0 ? "text-bad" : "text-good"}">${formatCurrency(r.balance)}</td>
    </tr>`).join("");
}

window.exportStatement = () => {
  const entityName = document.getElementById("stmt-entity-name")?.textContent || "Statement";
  const rows = [["التاريخ", "نوع الحركة", "رقم المستند", "البيان والملخص", "مدين (+)", "دائن (-)", "الرصيد المترتب"]];
  statementRows.forEach(r => rows.push([r.date, r.type, r.docNum, r.notes, r.debit, r.credit, r.balance]));
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
  a.download = `statement_${entityName.replace(/\s+/g, "_")}_${todayString()}.csv`;
  a.click();
  showToast("تم تصدير كشف الحساب بنجاح", "success");
};

// ── New: PDF export for statement ─────────────────────────────
window.exportStatementPDF = () => {
  if (!statementRows || statementRows.length === 0) {
    showToast("لا توجد بيانات لتصديرها", "warning"); return;
  }
  const entityName = document.getElementById("stmt-entity-name")?.textContent || "";
  const totalDebit  = parseFloat(document.getElementById("stmt-total-debit")?.textContent) || 0;
  const totalCredit = parseFloat(document.getElementById("stmt-total-credit")?.textContent) || 0;
  const finalBal    = document.getElementById("stmt-final-balance")?.textContent || "";

  const headers = ["التاريخ", "نوع الحركة", "رقم المستند", "البيان", "مدين (+)", "دائن (-)", "الرصيد"];
  const rows = statementRows.map(r => [
    formatDate(r.date), r.type, r.docNum, r.notes,
    r.debit  > 0 ? formatCurrency(r.debit)  : "—",
    r.credit > 0 ? formatCurrency(r.credit) : "—",
    formatCurrency(r.balance)
  ]);

  window.exportPDF({
    title: `كشف حساب: ${entityName}`,
    subtitle: `${document.getElementById("stmt-from")?.value || ""} — ${document.getElementById("stmt-to")?.value || ""}`,
    headers, rows,
    filename: `كشف_حساب_${(entityName || "").replace(/\s+/g,"_")}`,
    summary: { "إجمالي المدين": formatCurrency(totalDebit), "إجمالي الدائن": formatCurrency(totalCredit), "الرصيد الختامي": finalBal },
    orientation: "landscape",
  });
};

// ── New: Excel (XLSX) export for statement ────────────────────
window.exportStatementExcel = () => {
  if (!statementRows || statementRows.length === 0) {
    showToast("لا توجد بيانات لتصديرها", "warning"); return;
  }
  const entityName = document.getElementById("stmt-entity-name")?.textContent || "Statement";
  const headers = ["التاريخ", "نوع الحركة", "رقم المستند", "البيان", "مدين (+)", "دائن (-)", "الرصيد"];
  const rows = statementRows.map(r => [
    r.date, r.type, r.docNum, r.notes, r.debit || 0, r.credit || 0, r.balance || 0
  ]);
  window.exportXLSX({
    filename: `كشف_حساب_${entityName.replace(/\s+/g, "_")}_${todayString()}`,
    headers, rows, sheetName: "كشف الحساب"
  });
};

