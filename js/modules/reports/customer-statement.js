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
      <!-- نوع الحساب -->
      <div class="filter-select-group" style="min-width:150px;">
        <label>نوع الحساب</label>
        <select id="stmt-type-select" onchange="onStatementTypeChange()">
          <option value="customer">عميل</option>
          <option value="supplier">مورد</option>
          <option value="rep">مندوب مبيعات</option>
        </select>
      </div>

      <!-- بحث بالاسم / الكود / الهاتف -->
      <div style="position:relative; min-width:300px; flex:1; max-width:420px;">
        <label id="stmt-entity-label" style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:4px;">🔍 ابحث بالاسم أو الهاتف أو الكود</label>
        <input type="text" id="stmt-entity-search"
          class="input"
          placeholder="اكتب للبحث..."
          autocomplete="off"
          style="width:100%; padding-left:14px;"
          oninput="onStmtSearchInput()" />
        <div id="stmt-entity-results"
          style="position:absolute; top:100%; right:0; left:0; z-index:9999; max-height:280px; overflow-y:auto;
                 background:var(--bg-card); border:1px solid var(--border); border-radius:10px;
                 box-shadow:0 8px 32px rgba(0,0,0,.15); display:none;">
        </div>
        <!-- hidden value holder -->
        <input type="hidden" id="stmt-entity-id" value="" />
      </div>

      <!-- تواريخ -->
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="stmt-from" value="${startOfMonth()}" onchange="loadStatement()" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="stmt-to" value="${todayString()}" onchange="loadStatement()" />
      </div>

      <!-- أزرار التصدير -->
      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn-export" onclick="exportStatementPDF()" title="طباعة / PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportStatementExcel()" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="exportStatementPDF()" title="طباعة كشف الحساب"><span>🖨️</span> طباعة</button>
      </div>
    </div>


    <style>
      /* ── كروت المدين/الدائن/الرصيد ─────────────── */
      .stmt-kpi-card {
        border-radius: 14px;
        padding: 18px 20px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        border: 1px solid transparent;
        position: relative;
        overflow: hidden;
      }
      .stmt-kpi-card::before {
        content: "";
        position: absolute;
        top: 0; right: 0;
        width: 60px; height: 60px;
        border-radius: 50%;
        opacity: .08;
      }
      .stmt-kpi-card .kpi-icon { font-size: 22px; }
      .stmt-kpi-card .kpi-label { font-size: 11.5px; font-weight: 700; opacity: .75; }
      .stmt-kpi-card .kpi-value { font-size: 24px; font-weight: 900; font-family: monospace; }

      /* الهيدر الملكي الأزرق */
      #stmt-header-card {
        background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 55%, #2563eb 100%) !important;
        border: none !important;
        border-radius: 16px !important;
        box-shadow: 0 8px 32px rgba(29,78,216,.35) !important;
      }
      #stmt-entity-name  { color: #fff !important; font-size: 22px !important; font-weight: 900 !important; }
      #stmt-entity-details { color: rgba(255,255,255,.75) !important; }
      #stmt-closing-status { background: rgba(255,255,255,.18) !important; color: #fff !important; border: 1px solid rgba(255,255,255,.3) !important; }
      #stmt-closing-status-box { display: block !important; }

      @media print {
        /* إخفاء الهيدر الأخضر العام عند طباعة كشف الحساب */
        .print-header,
        .company-header,
        header.main-header,
        .sidebar,
        .topbar,
        .app-topbar,
        .filterbar,
        .no-print,
        .btn,
        .btn-export,
        nav { display: none !important; }

        /* ظهور الهيدر الأزرق الملكي في الطباعة */
        #stmt-header-card {
          background: linear-gradient(135deg, #1e3a8a, #2563eb) !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          border-radius: 12px !important;
          padding: 16px 24px !important;
          margin-bottom: 12px !important;
        }
        #stmt-entity-name   { color: #fff !important; font-size: 18px !important; }
        #stmt-entity-details { color: rgba(255,255,255,.8) !important; font-size: 11px !important; }
        #stmt-closing-status { background: rgba(255,255,255,.15) !important; color: #fff !important; }

        /* كروت الـ KPI في الطباعة */
        .stmt-kpi-card {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* الجدول */
        table { font-size: 11px !important; }
        .page-content { padding: 0 !important; }
        body { margin: 0 !important; }
      }
    </style>


    <div class="page-content">

      <!-- ── كروت KPI المدين / الدائن / الرصيد ── -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:14px; margin-bottom:20px;" id="stmt-summary-cards">

        <!-- المدين -->
        <div class="stmt-kpi-card" style="background:linear-gradient(135deg,rgba(29,78,216,.08),rgba(29,78,216,.03)); border-color:rgba(29,78,216,.2);">
          <div class="kpi-icon">📤</div>
          <div class="kpi-label" style="color:#1d4ed8;">إجمالي المدين (+)</div>
          <div class="kpi-value" id="stmt-total-debit" style="color:#1d4ed8;">0.00 ر.س</div>
        </div>

        <!-- الدائن -->
        <div class="stmt-kpi-card" style="background:linear-gradient(135deg,rgba(16,185,129,.08),rgba(16,185,129,.03)); border-color:rgba(16,185,129,.2);">
          <div class="kpi-icon">📥</div>
          <div class="kpi-label" style="color:#059669;">إجمالي الدائن (-)</div>
          <div class="kpi-value" id="stmt-total-credit" style="color:#059669;">0.00 ر.س</div>
        </div>

        <!-- الرصيد -->
        <div class="stmt-kpi-card" style="background:linear-gradient(135deg,rgba(239,68,68,.08),rgba(239,68,68,.03)); border-color:rgba(239,68,68,.2);">
          <div class="kpi-icon">⚖️</div>
          <div class="kpi-label" style="color:#dc2626;">الرصيد النهائي (الصافي)</div>
          <div class="kpi-value" id="stmt-closing-balance" style="color:#dc2626;">0.00 ر.س</div>
        </div>

      </div>

      <!-- ── الهيدر الملكي الأزرق ── -->
      <div class="mb-20" id="stmt-header-card" style="border-radius:16px; padding:22px 28px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <h2 style="margin:0 0 4px;" id="stmt-entity-name">كشف حساب موحد</h2>
            <div id="stmt-entity-details">حدد نوع الحساب والكيان لعرض الحركة التفصيلية</div>
          </div>
          <div id="stmt-closing-status-box" style="display:none;">
            <span class="badge" id="stmt-closing-status" style="font-size:13px; padding:6px 14px;">—</span>
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

  await initData();
}

let customersList = [];
let suppliersList = [];
let repsList     = [];
let statementRows = [];
let _currentEntityId = "";
let _currentEntityType = "customer";

// ── تحميل البيانات ─────────────────────────────────────────────
async function initData() {
  try {
    const [custs, sups, reps] = await Promise.all([
      getAll(COLS.customers(), [orderBy("name")]),
      getAll(COLS.suppliers(), [orderBy("name")]),
      getAll(COLS.salesReps(), [orderBy("name")]),
    ]);
    customersList = custs;
    suppliersList = sups;
    repsList      = reps;

    // إذا في كيان محدد مسبقاً (من نافذة العميل)
    if (window._preselectedStatementEntity) {
      const pre = window._preselectedStatementEntity;
      window._preselectedStatementEntity = null;
      const typeSel = document.getElementById("stmt-type-select");
      if (typeSel) typeSel.value = pre.type;
      _currentEntityType = pre.type;
      const list = pre.type === "customer" ? customersList
                 : pre.type === "supplier" ? suppliersList
                 : repsList;
      const ent = list.find(x => x.id === pre.id);
      if (ent) {
        const inp = document.getElementById("stmt-entity-search");
        const hid = document.getElementById("stmt-entity-id");
        if (inp) inp.value = ent.name;
        if (hid) hid.value = ent.id;
        _currentEntityId = ent.id;
        await loadStatement();
      }
    }

    // إغلاق نتائج البحث عند النقر خارجه
    document.addEventListener("click", (e) => {
      const res = document.getElementById("stmt-entity-results");
      const inp = document.getElementById("stmt-entity-search");
      if (res && !res.contains(e.target) && e.target !== inp) {
        res.style.display = "none";
      }
    });
  } catch (err) {
    console.error("Statement init error:", err);
  }
}

// ── تغيير نوع الحساب ───────────────────────────────────────────
window.onStatementTypeChange = () => {
  _currentEntityType = document.getElementById("stmt-type-select")?.value || "customer";
  _currentEntityId = "";
  const label = document.getElementById("stmt-entity-label");
  const inp   = document.getElementById("stmt-entity-search");
  const hid   = document.getElementById("stmt-entity-id");
  const res   = document.getElementById("stmt-entity-results");
  if (inp) inp.value = "";
  if (hid) hid.value = "";
  if (res) res.style.display = "none";
  if (label) label.textContent = _currentEntityType === "customer" ? "🔍 ابحث عن العميل"
                                : _currentEntityType === "supplier" ? "🔍 ابحث عن المورد"
                                : "🔍 ابحث عن المندوب";

  document.getElementById("stmt-rep-perf-panel")?.classList.add("hidden");
  const tbody = document.getElementById("stmt-tbody");
  if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">حدد الكيان لعرض كشف الحساب</td></tr>`;
  document.getElementById("stmt-total-debit").textContent    = "0.00 ر.س";
  document.getElementById("stmt-total-credit").textContent   = "0.00 ر.س";
  document.getElementById("stmt-closing-balance").textContent = "0.00 ر.س";
  document.getElementById("stmt-closing-status-box").style.display = "none";
  document.getElementById("stmt-entity-name").textContent    = "كشف حساب موحد";
  document.getElementById("stmt-entity-details").textContent = "حدد نوع الحساب والكيان لعرض الحركة التفصيلية";
};

// ── Autocomplete Search ─────────────────────────────────────────
window.onStmtSearchInput = () => {
  const q   = (document.getElementById("stmt-entity-search")?.value || "").trim().toLowerCase();
  const res = document.getElementById("stmt-entity-results");
  if (!res) return;
  if (!q) { res.style.display = "none"; return; }

  const list = _currentEntityType === "customer" ? customersList
             : _currentEntityType === "supplier" ? suppliersList
             : repsList;

  const matches = list.filter(x =>
    (x.name  || "").toLowerCase().includes(q) ||
    (x.code  || "").toLowerCase().includes(q) ||
    (x.phone || "").includes(q)
  ).slice(0, 15);

  if (!matches.length) {
    res.innerHTML = `<div style="padding:12px;text-align:center;color:var(--text-2);font-size:12px;">لا توجد نتائج</div>`;
    res.style.display = "block";
    return;
  }

  res.innerHTML = matches.map(x => `
    <div onclick="selectStmtEntity('${x.id}')"
      style="padding:10px 14px; border-bottom:1px solid var(--border-soft); cursor:pointer;
             display:flex; justify-content:space-between; align-items:center;
             transition:background .15s;"
      onmouseover="this.style.background='var(--bg-hover)'"
      onmouseout="this.style.background=''">
      <div>
        <div style="font-weight:700; font-size:13px; color:var(--text-0);">${x.name}</div>
        <div style="font-size:11px; color:var(--text-2);">${x.phone || "—"} ${x.code ? "• " + x.code : ""}</div>
      </div>
      <div style="font-size:11px; color:var(--brand); font-weight:700;">
        ${_currentEntityType === "rep" ? (x.zone || "") : (x.phone || "")}
      </div>
    </div>
  `).join("");
  res.style.display = "block";
};

window.selectStmtEntity = async (id) => {
  _currentEntityId = id;
  const list = _currentEntityType === "customer" ? customersList
             : _currentEntityType === "supplier" ? suppliersList
             : repsList;
  const ent = list.find(x => x.id === id);
  const inp = document.getElementById("stmt-entity-search");
  const hid = document.getElementById("stmt-entity-id");
  const res = document.getElementById("stmt-entity-results");
  if (inp && ent) inp.value = ent.name;
  if (hid) hid.value = id;
  if (res) res.style.display = "none";
  await loadStatement();
};

// ── تحميل الكشف ────────────────────────────────────────────────
window.loadStatement = async () => {
  const type     = document.getElementById("stmt-type-select")?.value || _currentEntityType;
  const entityId = _currentEntityId || document.getElementById("stmt-entity-id")?.value;
  const tbody    = document.getElementById("stmt-tbody");
  const from     = document.getElementById("stmt-from")?.value;
  const to       = document.getElementById("stmt-to")?.value;

  if (!entityId) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">حدد الكيان لعرض كشف الحساب</td></tr>`;
    document.getElementById("stmt-total-debit").textContent    = "0.00 ر.س";
    document.getElementById("stmt-total-credit").textContent   = "0.00 ر.س";
    document.getElementById("stmt-closing-balance").textContent = "0.00 ر.س";
    document.getElementById("stmt-closing-status-box").style.display = "none";
    document.getElementById("stmt-entity-name").textContent    = "كشف حساب موحد";
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
      type: "إشعار دائن (مرتجع شامل الضريبة)",
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

  const rcptQ = query(collection(db, `companies/${COMPANY_ID}/receipts`), where("targetId", "==", supId), limit(500));
  const rcptSnap = await getDocs(rcptQ);
  const receipts = rcptSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.status !== "cancelled" && (!r.entityType || r.entityType === "supplier"));

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
    if (exp.status === "cancelled") return;
    ledger.push({
      date: exp.date || (exp.createdAt?.toDate ? exp.createdAt.toDate().toISOString().split("T")[0] : ""),
      type: "سند صرف للمورد",
      docNum: `PV-${exp.id.substring(0,6).toUpperCase()}`,
      notes: `سند صرف — طريقة الدفع: ${exp.method === 'cash' ? 'نقدي' : 'تحويل بنكي'} — بيان: ${exp.notes || ""}`,
      debit: exp.amount || 0,
      credit: 0,
    });
  });

  receipts.forEach(rcpt => {
    ledger.push({
      date: rcpt.date || (rcpt.createdAt?.toDate ? rcpt.createdAt.toDate().toISOString().split("T")[0] : ""),
      type: "سند قبض من مورد (استرداد)",
      docNum: rcpt.number || rcpt.code || `RV-${rcpt.id.substring(0,6).toUpperCase()}`,
      notes: `سند قبض من مورد — طريقة الاستلام: ${rcpt.method === 'cash' ? 'نقدي' : 'تحويل بنكي'} — بيان: ${rcpt.notes || ""}`,
      debit: 0,
      credit: rcpt.amount || 0,
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

  document.getElementById("stmt-total-debit").textContent  = formatCurrency(totalDebit);
  document.getElementById("stmt-total-credit").textContent = formatCurrency(totalCredit);

  // لوّن الرصيد ديناميكياً
  const balEl = document.getElementById("stmt-closing-balance");
  balEl.textContent = formatCurrency(runningBalance);
  const balCard = balEl.closest(".stmt-kpi-card");
  if (balCard) {
    if (runningBalance > 0) {
      balCard.style.background = "linear-gradient(135deg,rgba(239,68,68,.1),rgba(239,68,68,.04))";
      balCard.style.borderColor = "rgba(239,68,68,.3)";
      balEl.style.color = "#dc2626";
      balCard.querySelector(".kpi-label").style.color = "#dc2626";
    } else if (runningBalance < 0) {
      balCard.style.background = "linear-gradient(135deg,rgba(16,185,129,.1),rgba(16,185,129,.04))";
      balCard.style.borderColor = "rgba(16,185,129,.3)";
      balEl.style.color = "#059669";
      balCard.querySelector(".kpi-label").style.color = "#059669";
    } else {
      balCard.style.background = "linear-gradient(135deg,rgba(100,116,139,.08),rgba(100,116,139,.03))";
      balCard.style.borderColor = "rgba(100,116,139,.2)";
      balEl.style.color = "#475569";
      balCard.querySelector(".kpi-label").style.color = "#475569";
    }
  }


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

// ── طباعة كشف الحساب بهيدر ملكي أزرق ────────────────────────
window.exportStatementPDF = () => {
  if (!statementRows || statementRows.length === 0) {
    showToast("لا توجد بيانات للطباعة", "warning"); return;
  }

  const entityName  = document.getElementById("stmt-entity-name")?.textContent  || "";
  const entitySub   = document.getElementById("stmt-entity-details")?.textContent || "";
  const totalDebit  = document.getElementById("stmt-total-debit")?.textContent   || "0.00 ر.س";
  const totalCredit = document.getElementById("stmt-total-credit")?.textContent  || "0.00 ر.س";
  const finalBal    = document.getElementById("stmt-closing-balance")?.textContent || "0.00 ر.س";
  const statusBadge = document.getElementById("stmt-closing-status")?.textContent || "";
  const from        = document.getElementById("stmt-from")?.value || "";
  const to          = document.getElementById("stmt-to")?.value   || "";
  const co          = window.ERP_COMPANY || {};
  const coName      = co.name  || "مؤسسة إدهام للمواد الغذائية";
  const coPhone     = co.phone || "";
  const coEmail     = co.email || "";
  const coAddress   = co.address || "";
  const coVAT       = co.vatNumber || "";
  const coLogo      = co.logo || "";
  const now         = new Date();
  const dateStr     = now.toLocaleDateString("ar-SA");
  const timeStr     = now.toLocaleTimeString("ar-SA");

  // بناء صفوف الجدول
  const tableRows = statementRows.map(r => `
    <tr>
      <td>${formatDate(r.date)}</td>
      <td><span class="badge-type ${r.debit > 0 ? 'db' : 'cr'}">${r.type}</span></td>
      <td class="mono">${r.docNum || "—"}</td>
      <td>${r.notes || ""}</td>
      <td class="mono amt ${r.debit > 0 ? 'clr-db' : 'dim'}">${r.debit > 0 ? r.debit.toFixed(2) : "—"}</td>
      <td class="mono amt ${r.credit > 0 ? 'clr-cr' : 'dim'}">${r.credit > 0 ? r.credit.toFixed(2) : "—"}</td>
      <td class="mono amt bold ${r.balance > 0 ? 'clr-neg' : r.balance < 0 ? 'clr-pos' : ''}">${r.balance.toFixed(2)}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>كشف حساب: ${entityName}</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    @page{size:A4 landscape;margin:8mm 10mm}
    body{font-family:'IBM Plex Sans Arabic',Tahoma,sans-serif;font-size:9.5px;color:#111;direction:rtl;
         -webkit-print-color-adjust:exact;print-color-adjust:exact}

    /* ── هيدر الشركة الأزرق الملكي ── */
    .co-header{
      background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 55%,#2563eb 100%);
      color:#fff;padding:14px 18px;border-radius:10px 10px 0 0;
      display:flex;justify-content:space-between;align-items:flex-start;
    }
    .co-left{display:flex;align-items:center;gap:12px}
    .co-logo{max-height:54px;max-width:100px;object-fit:contain;background:#fff;padding:4px;border-radius:6px}
    .co-name{font-size:17px;font-weight:800;margin-bottom:4px}
    .co-line{font-size:8.5px;color:rgba(255,255,255,.8);margin-bottom:2px}
    .co-date{text-align:left;font-size:8.5px;color:rgba(255,255,255,.8)}
    .co-date strong{font-size:11px;color:#fff;display:block;margin-bottom:2px}

    /* ── شريط كشف الحساب ── */
    .stmt-strip{background:#1a1a2e;color:#fff;padding:9px 18px;display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
    .stmt-strip h2{font-size:13px;font-weight:800}
    .stmt-strip .sub{font-size:8px;color:rgba(255,255,255,.7);margin-top:2px}
    .stmt-strip .period{font-size:8.5px;color:rgba(255,255,255,.75)}

    /* ── كروت المدين / الدائن / الرصيد ── */
    .kpi-row{display:flex;gap:8px;margin-bottom:10px}
    .kpi-card{flex:1;padding:8px 12px;border-radius:8px;border:1px solid transparent}
    .kpi-card .lbl{font-size:8px;font-weight:700;margin-bottom:3px}
    .kpi-card .val{font-size:14px;font-weight:900;font-family:monospace}
    .kpi-db{background:rgba(29,78,216,.08);border-color:rgba(29,78,216,.2)}
    .kpi-db .lbl,.kpi-db .val{color:#1d4ed8}
    .kpi-cr{background:rgba(16,185,129,.08);border-color:rgba(16,185,129,.2)}
    .kpi-cr .lbl,.kpi-cr .val{color:#059669}
    .kpi-bal-neg{background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.2)}
    .kpi-bal-neg .lbl,.kpi-bal-neg .val{color:#dc2626}
    .kpi-bal-pos{background:rgba(16,185,129,.08);border-color:rgba(16,185,129,.2)}
    .kpi-bal-pos .lbl,.kpi-bal-pos .val{color:#059669}
    .kpi-bal-zero{background:rgba(100,116,139,.08);border-color:rgba(100,116,139,.2)}
    .kpi-bal-zero .lbl,.kpi-bal-zero .val{color:#475569}

    /* ── الجدول ── */
    table{width:100%;border-collapse:collapse}
    thead th{background:#1a1a2e;color:#fff;padding:6px 8px;font-size:8.5px;font-weight:700;text-align:right;white-space:nowrap}
    tbody td{padding:5px 8px;font-size:8.5px;border-bottom:1px solid #eee;text-align:right}
    tbody tr:nth-child(even){background:#f8f9ff}
    .mono{font-variant-numeric:tabular-nums;direction:ltr;text-align:left}
    .amt{text-align:left}
    .bold{font-weight:700}
    .dim{color:#94a3b8}
    .clr-db{color:#1d4ed8;font-weight:700}
    .clr-cr{color:#059669;font-weight:700}
    .clr-neg{color:#dc2626}
    .clr-pos{color:#059669}
    .badge-type{display:inline-block;padding:2px 6px;border-radius:4px;font-size:8px;font-weight:700}
    .badge-type.db{background:rgba(29,78,216,.1);color:#1d4ed8}
    .badge-type.cr{background:rgba(16,185,129,.1);color:#059669}

    /* ── فوتر ── */
    .ftr{margin-top:12px;padding-top:8px;border-top:2px solid #1d4ed8;display:flex;justify-content:space-between;font-size:8px;color:#666}
  </style>
</head>
<body>

  <!-- هيدر الشركة الأزرق -->
  <div class="co-header">
    <div class="co-left">
      ${coLogo ? `<img class="co-logo" src="${coLogo}" alt="">` : ""}
      <div>
        <div class="co-name">${coName}</div>
        ${coAddress ? `<div class="co-line">📍 ${coAddress}</div>` : ""}
        ${coPhone   ? `<div class="co-line">📞 ${coPhone}</div>` : ""}
        ${coEmail   ? `<div class="co-line">✉️ ${coEmail}</div>` : ""}
        ${coVAT     ? `<div class="co-line">🔢 الرقم الضريبي: ${coVAT}</div>` : ""}
      </div>
    </div>
    <div class="co-date"><strong>${dateStr}</strong>${timeStr}</div>
  </div>

  <!-- شريط كشف الحساب -->
  <div class="stmt-strip">
    <div>
      <h2>كشف حساب: ${entityName}</h2>
      <div class="sub">${entitySub}</div>
    </div>
    <div class="period">الفترة: ${from} — ${to} &nbsp;|&nbsp; ${statusBadge}</div>
  </div>

  <!-- كروت المدين / الدائن / الرصيد -->
  <div class="kpi-row">
    <div class="kpi-card kpi-db">
      <div class="lbl">📤 إجمالي المدين (+)</div>
      <div class="val">${totalDebit}</div>
    </div>
    <div class="kpi-card kpi-cr">
      <div class="lbl">📥 إجمالي الدائن (-)</div>
      <div class="val">${totalCredit}</div>
    </div>
    <div class="kpi-card ${statementRows.length && statementRows[statementRows.length-1].balance > 0 ? 'kpi-bal-neg' : statementRows.length && statementRows[statementRows.length-1].balance < 0 ? 'kpi-bal-pos' : 'kpi-bal-zero'}">
      <div class="lbl">⚖️ الرصيد النهائي</div>
      <div class="val">${finalBal}</div>
    </div>
  </div>

  <!-- الجدول -->
  <table>
    <thead>
      <tr>
        <th>التاريخ</th>
        <th>نوع الحركة</th>
        <th>رقم المستند</th>
        <th>البيان / ملاحظات</th>
        <th>مدين (+)</th>
        <th>دائن (-)</th>
        <th>الرصيد المترتب</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>

  <div class="ftr">
    <span>${coName}</span>
    <span>طُبع بتاريخ: ${dateStr} ${timeStr} — عدد الحركات: ${statementRows.length}</span>
  </div>

  <script>window.onload = () => { window.print(); }<\/script>
</body></html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
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

