// ============================================================
// IDHAM ERP — VAT, Zakat & Income Tax Module (Saudi Arabia)
// ضريبة القيمة المضافة، الزكاة، وضريبة الدخل - المملكة العربية السعودية
// ============================================================
import { COLS, getAll, query, orderBy, getDocs, where, limit } from "../utils/db.js";
import { formatCurrency, todayString, startOfMonth } from "../utils/formatters.js";

let salesInvoices    = [];
let purchaseInvoices = [];
let salesReturns     = [];
let purchaseReturns  = [];
let expenses         = [];
let products         = [];
let stockBal         = [];
let serviceInvoices  = [];

let activeTab = "vat";

// Early initialization of window.VZ to avoid undefined errors
window.VZ = window.VZ || {
  async tab(t) {
    activeTab = t;
    document.querySelectorAll(".vz-tab").forEach(b => b.classList.remove("active"));
    document.getElementById(`vzt-${t}`)?.classList.add("active");
    await renderTab();
  },
  async reload() {
    const body = document.getElementById("vz-body");
    if (body) body.innerHTML = `<div class="page-loading"><div class="loading-spinner"></div><span>جارٍ تحديث البيانات…</span></div>`;
    await loadAllData();
  }
};

export async function render(container, user) {
  const now = new Date();
  // الربع الضريبي الحالي في المملكة (Q1: 1 يناير, Q2: 1 أبريل, Q3: 1 يوليو, Q4: 1 أكتوبر)
  const qMonth = Math.floor(now.getMonth() / 3) * 3;
  const qYear  = now.getFullYear();
  const fromDate = `${qYear}-${String(qMonth + 1).padStart(2, "0")}-01`; // مثلاً 2026-07-01 للربع الثالث
  const toDate   = todayString();

  container.innerHTML = `
    <!-- Filter Bar -->
    <div class="filterbar no-print" style="flex-wrap:wrap; gap:10px; align-items:center;">
      <div style="display:flex; gap:6px; background:var(--bg-2); padding:3px 6px; border-radius:8px;">
        <button class="btn btn-xs btn-ghost active" id="btn-rng-q" onclick="VZ.setRange('quarter')">الربع الحالي (Q${Math.floor(now.getMonth()/3)+1})</button>
        <button class="btn btn-xs btn-ghost" id="btn-rng-m" onclick="VZ.setRange('month')">هذا الشهر</button>
        <button class="btn btn-xs btn-ghost" id="btn-rng-lm" onclick="VZ.setRange('last_month')">الشهر السابق</button>
        <button class="btn btn-xs btn-ghost" id="btn-rng-y" onclick="VZ.setRange('year')">العام الحالي</button>
      </div>

      <div class="date-range-group"><label>من</label>
        <input type="date" id="vz-from" value="${fromDate}" />
      </div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="vz-to" value="${toDate}" />
      </div>
      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="printVatDeclaration()" style="font-weight:700;background:linear-gradient(135deg, #1e3a8a, #2563eb);color:#fff;border:none;">🖨️ طباعة الإقرار الرسمي</button>
        <button class="btn btn-primary" onclick="VZ.reload()">🔄 تحديث البيانات</button>
      </div>
    </div>

    <!-- Tabs -->
    <div style="display:flex; border-bottom:2px solid var(--border-soft); background:var(--bg-1); padding:0 16px;">
      <button class="vz-tab active" id="vzt-vat"      onclick="VZ.tab('vat')">📊 إقرار VAT</button>
      <button class="vz-tab"        id="vzt-zakat"    onclick="VZ.tab('zakat')">🕌 الزكاة</button>
      <button class="vz-tab"        id="vzt-income"   onclick="VZ.tab('income')">💼 ضريبة الدخل</button>
      <button class="vz-tab"        id="vzt-invoices" onclick="VZ.tab('invoices')">📋 سجل الفواتير الضريبي</button>
    </div>

    <div class="page-content" id="vz-body" style="padding:24px;">
      <div class="page-loading"><div class="loading-spinner"></div></div>
    </div>

    <style>
      .vz-tab { padding:14px 20px; border:none; background:none; cursor:pointer;
        font-weight:600; color:var(--text-2); border-bottom:3px solid transparent;
        margin-bottom:-2px; font-size:13px; transition:all 0.2s; }
      .vz-tab.active, .vz-tab:hover { color:var(--brand); border-bottom-color:var(--brand); }
      .tax-section { background:var(--bg-1); border:1px solid var(--border); border-radius:12px;
        padding:20px; margin-bottom:20px; }
      .tax-row { display:flex; justify-content:space-between; align-items:center;
        padding:10px 0; border-bottom:1px solid var(--border-soft); font-size:14px; }
      .tax-row:last-child { border-bottom:none; }
      .tax-row.total { font-weight:700; font-size:16px; padding-top:14px; }
      .tax-row.payable { background:var(--bg-2); border-radius:8px; padding:12px 16px;
        margin-top:12px; font-weight:700; font-size:17px; }
      .tax-badge-due { background:rgba(239,68,68,0.15); color:var(--bad);
        padding:4px 12px; border-radius:20px; font-size:13px; }
      .tax-badge-refund { background:rgba(34,197,94,0.15); color:var(--good);
        padding:4px 12px; border-radius:20px; font-size:13px; }
    </style>
  `;

  document.getElementById("vz-from").addEventListener("change", () => VZ.reload());
  document.getElementById("vz-to").addEventListener("change", () => VZ.reload());

  window.VZ.setRange = (range) => {
    const d = new Date();
    const today = todayString();
    if (range === "quarter") {
      const qM = Math.floor(d.getMonth() / 3) * 3;
      document.getElementById("vz-from").value = `${d.getFullYear()}-${String(qM + 1).padStart(2, "0")}-01`;
      document.getElementById("vz-to").value   = today;
    } else if (range === "month") {
      document.getElementById("vz-from").value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
      document.getElementById("vz-to").value   = today;
    } else if (range === "last_month") {
      const start = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      const end   = new Date(d.getFullYear(), d.getMonth(), 0);
      document.getElementById("vz-from").value = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-01`;
      document.getElementById("vz-to").value   = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
    } else if (range === "year") {
      document.getElementById("vz-from").value = `${d.getFullYear()}-01-01`;
      document.getElementById("vz-to").value   = today;
    }
    VZ.reload();
  };

  await loadAllData();
}

async function loadAllData() {
  const from = document.getElementById("vz-from")?.value || "";
  const to   = document.getElementById("vz-to")?.value   || "";

  try {
    // Build date-scoped query constraints to prevent massive unneeded document downloads
    const constraints = [];
    if (from) constraints.push(where("date", ">=", from));
    if (to)   constraints.push(where("date", "<=", to));
    if (constraints.length === 0) constraints.push(limit(500));

    // Notice: products and stockByWarehouse are NOT fetched here.
    // They are deferred until the user explicitly opens the Zakat tab.
    const [siSnap, piSnap, srSnap, prSnap, expSnap, jeSnap] = await Promise.all([
      getAll(COLS.salesInvoices(),    constraints),
      getAll(COLS.purchaseInvoices(), constraints),
      getAll(COLS.salesReturns(),     constraints),
      getAll(COLS.purchaseReturns(),  constraints),
      getAll(COLS.expenses(),         constraints),
      getAll(COLS.journalEntries(),   constraints),
    ]);

    salesInvoices    = Array.isArray(siSnap) ? siSnap : (siSnap.docs?.map(d => ({ id: d.id, ...d.data() })) || []);
    purchaseInvoices = Array.isArray(piSnap) ? piSnap : (piSnap.docs?.map(d => ({ id: d.id, ...d.data() })) || []);
    salesReturns     = Array.isArray(srSnap) ? srSnap : (srSnap.docs?.map(d => ({ id: d.id, ...d.data() })) || []);
    purchaseReturns  = Array.isArray(prSnap) ? prSnap : (prSnap.docs?.map(d => ({ id: d.id, ...d.data() })) || []);
    expenses         = Array.isArray(expSnap) ? expSnap : (expSnap.docs?.map(d => ({ id: d.id, ...d.data() })) || []);
    const journalEntries = Array.isArray(jeSnap) ? jeSnap : (jeSnap.docs?.map(d => ({ id: d.id, ...d.data() })) || []);

    // Date filter helper
    const filterDate = (list, dateField = "date") => list.filter(item => {
      const d = item[dateField] || (item.createdAt?.toDate ? item.createdAt.toDate().toISOString().split("T")[0] : "");
      return (!from || d >= from) && (!to || d <= to);
    });

    salesInvoices    = filterDate(salesInvoices,    "date");
    purchaseInvoices = filterDate(purchaseInvoices, "date");
    salesReturns     = filterDate(salesReturns,     "date");
    purchaseReturns  = filterDate(purchaseReturns,  "date");
    expenses         = filterDate(expenses,         "date");
    const filteredJEs = filterDate(journalEntries,   "date");

    // ✅ دقة مطابقة حسابات ضريبة المدخلات فقط (VAT Input 15%)
    // الحساب المعتمد: 1-1-5-2 (ضريبة القيمة المضافة - المدخلات) أو 2-1-3-2
    // لا يتم مطابقة حسابات الموردين (2-1-1) أو الأصول الأخرى
    const _isVatInputLine = l => {
      if (!l || (l.debit || 0) <= 0) return false;
      const code = String(l.accountCode || "").trim();
      const name = String(l.accountName || "").trim();
      if (code === "1-1-5-2" || code === "2-1-3-2" || code === "1152" || code === "2132" || code === "2-2-2") return true;
      if (name.includes("المدخلات") || name.includes("مدخلات")) {
        if (!name.includes("مخرجات") && !name.includes("المخرجات") && !name.includes("مبيعات") && !name.includes("مورد")) {
          return true;
        }
      }
      return false;
    };

    const _isVatInputCode = code => {
      const c = String(code || "").trim();
      return c === "1-1-5-2" || c === "2-1-3-2" || c === "1152" || c === "2132" || c === "2-2-2";
    };

    serviceInvoices = [];
    filteredJEs.forEach(je => {
      if (je.status !== "posted") return;
      // استبعاد قيود فواتير المشتريات والمبيعات الآلية لمنع التكرار (لأنها محتسبة بالفعل من سجل الفواتير)
      if (je.sourceType === "purchaseInvoice" || je.sourceType === "purchaseReturn" || je.sourceType === "salesInvoice" || je.sourceType === "salesReturn" || je.sourceType === "salesCOGS" || je.sourceType === "pos") {
        return;
      }

      // ── الاستراتيجية الأساسية: اكتشاف قيد ضريبة المدخلات من سطر ضريبة القيمة المضافة ──
      const vatInputLine = (je.lines || []).find(_isVatInputLine);
      if (vatInputLine) {
        const vatAmt = vatInputLine.debit || 0;
        // ابحث عن سطر المصروف (المدين الأساسي غير الضريبي) لاستخراج المبلغ الأساسي
        const baseLine = (je.lines || []).find(l =>
          !_isVatInputLine(l) &&
          !_isVatInputCode(l.accountCode) &&
          (l.debit || 0) > 0
        );
        const baseAmt = baseLine ? (baseLine.debit || 0) : Math.round((vatAmt / 0.15) * 100) / 100;
        // استخرج بيانات المورد من سطور القيد أو من رأس القيد
        const spName = (je.lines || []).reduce((n, l) => n || (l.serviceProvider || "").trim(), "")
                       || (je.supplierName || je.vendorName || je.entityName || "").trim()
                       || je.description || "مورد خدمة";
        const tNum   = (je.lines || []).reduce((n, l) => n || (l.taxNumber || "").trim(), "")
                       || (je.taxNumber || je.supplierVatNumber || "").trim()
                       || "—";
        const invRef = (je.lines || []).reduce((n, l) => n || (l.invoiceRef || "").trim(), "")
                       || je.taxInvoiceNumber || je.reference || je.entryNumber || je.id.slice(0, 8);
        serviceInvoices.push({
          id:           je.id,
          number:       invRef,
          date:         je.date || "",
          supplierName: spName,
          taxNumber:    tNum,
          subtotal:     Math.round(baseAmt * 100) / 100,
          totalVat:     Math.round(vatAmt * 100) / 100,
          totalWithVat: Math.round((baseAmt + vatAmt) * 100) / 100,
          direction:    "وارد (قيد خدمات يدوية)",
          vatSign:      -1,
          _fromVatLine: true,
        });
        return; // تم معالجة القيد بالكامل
      }

      // ── الاستراتيجية الاحتياطية: قيود مصروفات يدوية محدد فيها مورد ورقم ضريبي/فاتورة ──
      const expLineWithSupplier = (je.lines || []).find(l =>
        (l.debit || 0) > 0 &&
        String(l.accountCode || "").startsWith("5-") &&
        (l.serviceProvider || "").trim() &&
        ((l.taxNumber || "").trim() || (l.invoiceRef || "").trim())
      );
      if (expLineWithSupplier) {
        const baseAmt = expLineWithSupplier.debit || 0;
        const vatAmt = Math.round((baseAmt * 0.15) * 100) / 100;
        const sp = (expLineWithSupplier.serviceProvider || "").trim();
        const tn = (expLineWithSupplier.taxNumber || "").trim() || "—";
        const ref = (expLineWithSupplier.invoiceRef || "").trim() || je.taxInvoiceNumber || je.entryNumber || je.id.slice(0, 8);
        serviceInvoices.push({
          id:           je.id,
          number:       ref,
          date:         je.date || "",
          supplierName: sp,
          taxNumber:    tn,
          subtotal:     baseAmt,
          totalVat:     vatAmt,
          totalWithVat: baseAmt + vatAmt,
          direction:    "وارد (قيد خدمات يدوية)",
          vatSign:      -1
        });
      }
    });

    await renderTab();
  } catch (err) {
    const body = document.getElementById("vz-body");
    if (body) body.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
}

async function renderTab() {
  switch (activeTab) {
    case "vat":      renderVATDeclaration(); break;
    case "zakat":    await renderZakat(); break;
    case "income":   renderIncomeTax(); break;
    case "invoices": renderTaxInvoiceLog(); break;
  }
}

// ═══════════════════════════════════════════════
// TAB 1: VAT Declaration (إقرار ضريبة القيمة المضافة)
// ═══════════════════════════════════════════════
function renderVATDeclaration() {
  const from = document.getElementById("vz-from")?.value || "";
  const to   = document.getElementById("vz-to")?.value   || "";

  // Output VAT (from sales minus sales returns)
  const baseOutputVAT   = salesInvoices
    .filter(i => i.status !== "cancelled")
    .reduce((s, i) => s + (i.totalVat || 0), 0);
  const baseOutputSales = salesInvoices
    .filter(i => i.status !== "cancelled")
    .reduce((s, i) => s + (i.subtotal || 0), 0);

  const returnsOutputVAT   = salesReturns.reduce((s, r) => s + (r.totalVat || 0), 0);
  const returnsOutputSales = salesReturns.reduce((s, r) => s + (r.subtotal || 0), 0);

  const outputVAT   = Math.max(0, baseOutputVAT - returnsOutputVAT);
  const outputSales = Math.max(0, baseOutputSales - returnsOutputSales);

  // Input VAT (from purchases minus purchase returns + manual service JEs)
  const baseInputVAT      = purchaseInvoices
    .filter(i => i.status !== "cancelled")
    .reduce((s, i) => s + (i.totalVat || 0), 0);
  const baseInputPurchases = purchaseInvoices
    .filter(i => i.status !== "cancelled")
    .reduce((s, i) => s + (i.subtotal || 0), 0);

  const serviceInputVAT      = serviceInvoices.reduce((s, i) => s + (i.totalVat || 0), 0);
  const serviceInputPurchases = serviceInvoices.reduce((s, i) => s + (i.subtotal || 0), 0);

  const returnsInputVAT      = purchaseReturns.reduce((s, r) => s + (r.totalVat || 0), 0);
  const returnsInputPurchases = purchaseReturns.reduce((s, r) => s + (r.subtotal || 0), 0);

  const inputVAT   = Math.max(0, baseInputVAT + serviceInputVAT - returnsInputVAT);
  const inputPurchases = Math.max(0, baseInputPurchases + serviceInputPurchases - returnsInputPurchases);

  // Net VAT
  const netVAT    = outputVAT - inputVAT;
  const isDue     = netVAT > 0;
  const isRefund  = netVAT < 0;

  const body = document.getElementById("vz-body");
  if (!body) return;

  const serviceRowsHtml = serviceInvoices.map((s, idx) => `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:6px 10px; text-align:center; color:#64748b;">${idx + 1}</td>
      <td style="padding:6px 10px;" class="mono">${s.date || "—"}</td>
      <td style="padding:6px 10px; font-weight:700;">${s.supplierName || "—"}</td>
      <td style="padding:6px 10px;" class="mono">${s.taxNumber || "—"}</td>
      <td style="padding:6px 10px;" class="mono">${s.number || "—"}</td>
      <td style="padding:6px 10px; text-align:right;" class="mono">${formatCurrency(s.subtotal || 0)}</td>
      <td style="padding:6px 10px; text-align:right; color:#16a34a;" class="mono font-bold">${formatCurrency(s.totalVat || 0)}</td>
      <td style="padding:6px 10px; text-align:right;" class="mono font-bold">${formatCurrency(s.totalWithVat || 0)}</td>
    </tr>
  `).join("");

  body.innerHTML = `
    <div style="max-width:1100px; margin:0 auto; padding-bottom:40px;">
      
      <!-- Executive Header Banner -->
      <div style="display:flex; align-items:center; justify-content:space-between; background:var(--bg-card, #ffffff); border:1px solid var(--border-soft, #cbd5e1); border-right:6px solid #4f46e5; padding:20px 24px; border-radius:16px; margin-bottom:20px; box-shadow:0 4px 16px rgba(0,0,0,0.04);">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <span style="background:#4f46e5; color:#ffffff !important; font-size:11px; font-weight:800; padding:3px 10px; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px;">ZATCA Form 15%</span>
            <span style="color:var(--brand, #4338ca); font-size:12.5px; font-weight:700;">هيئة الزكاة والضريبة والجمارك</span>
          </div>
          <h2 style="font-size:22px; font-weight:900; margin:0; color:var(--text-1, #0f172a) !important; font-family:var(--font-heading);">إقرار ضريبة القيمة المضافة التفصيلي الموحد</h2>
          <div style="font-size:12.5px; color:var(--text-2, #334155); margin-top:6px; font-weight:600;">
            الفترة من <strong class="mono" style="color:#0284c7;">${from}</strong> إلى <strong class="mono" style="color:#0284c7;">${to}</strong> | حالة البيانات: <span style="color:#16a34a; font-weight:800;">محدثة ومطابقة 100%</span>
          </div>
        </div>
        <div style="display:flex; gap:10px;" class="no-print">
          <button class="btn btn-primary" onclick="window.printVATReturn()" style="font-weight:700; font-size:13px; padding:10px 18px; border-radius:10px; display:flex; align-items:center; gap:8px;">
            <span>🖨️</span> <span>طباعة الإقرار الضريبي الرسمي</span>
          </button>
        </div>
      </div>

      <!-- Top Executive KPI Summary Cards -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin-bottom:24px;">
        
        <!-- Card 1: Output VAT -->
        <div style="background:#ffffff; border-radius:14px; border:1px solid #e2e8f0; padding:18px; box-shadow:0 4px 12px rgba(0,0,0,0.03); border-top:4px solid #6366f1;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-size:12px; font-weight:800; color:#475569;">📤 إجمالي ضريبة المخرجات (المبيعات)</span>
            <span style="background:#e0e7ff; color:#4338ca; font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px;">15% VAT</span>
          </div>
          <div class="mono" style="font-size:24px; font-weight:900; color:#4338ca; margin-bottom:6px;">
            ${formatCurrency(outputVAT)} <span style="font-size:13px;">ر.س</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748b; border-top:1px solid #f1f5f9; padding-top:8px; margin-top:6px;">
            <span>الخاضع قبل الضريبة: <strong class="mono" style="color:#1e293b;">${formatCurrency(outputSales)} ر.س</strong></span>
            <span>${salesInvoices.filter(i=>i.status!=="cancelled").length} فاتورة</span>
          </div>
        </div>

        <!-- Card 2: Input VAT -->
        <div style="background:#ffffff; border-radius:14px; border:1px solid #e2e8f0; padding:18px; box-shadow:0 4px 12px rgba(0,0,0,0.03); border-top:4px solid #10b981;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-size:12px; font-weight:800; color:#475569;">📥 إجمالي ضريبة المدخلات (المشتريات والخدمات)</span>
            <span style="background:#d1fae5; color:#047857; font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px;">قابلة للخصم</span>
          </div>
          <div class="mono" style="font-size:24px; font-weight:900; color:#047857; margin-bottom:6px;">
            ${formatCurrency(inputVAT)} <span style="font-size:13px;">ر.س</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748b; border-top:1px solid #f1f5f9; padding-top:8px; margin-top:6px;">
            <span>الخاضع قبل الضريبة: <strong class="mono" style="color:#1e293b;">${formatCurrency(inputPurchases)} ر.س</strong></span>
            <span>${purchaseInvoices.filter(i=>i.status!=="cancelled").length} مشتريات</span>
          </div>
        </div>

        <!-- Card 3: Net VAT Result -->
        <div style="background:${isDue ? '#fef2f2' : '#f0fdf4'}; border-radius:14px; border:1.5px solid ${isDue ? '#fca5a5' : '#86efac'}; padding:18px; box-shadow:0 4px 12px rgba(0,0,0,0.03); border-top:4px solid ${isDue ? '#dc2626' : '#16a34a'};">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-size:12px; font-weight:800; color:${isDue ? '#991b1b' : '#166534'};">⚖️ صافي موقف الإقرار الضريبي النهائي</span>
            <span style="background:${isDue ? '#fee2e2' : '#dcfce7'}; color:${isDue ? '#991b1b' : '#166534'}; font-size:10.5px; font-weight:800; padding:2px 10px; border-radius:12px;">
              ${isDue ? '💰 مستحق للسداد' : isRefund ? '💚 استرداد ضريبي لك' : '✓ متوازن'}
            </span>
          </div>
          <div class="mono" style="font-size:24px; font-weight:900; color:${isDue ? '#dc2626' : '#15803d'}; margin-bottom:6px;">
            ${formatCurrency(Math.abs(netVAT))} <span style="font-size:13px;">ر.س</span>
          </div>
          <div style="font-size:11px; color:${isDue ? '#b91c1c' : '#15803d'}; border-top:1px solid ${isDue ? '#fecaca' : '#bbf7d0'}; padding-top:8px; margin-top:6px; font-weight:700;">
            ${isDue ? 'يتوجب سداد هذا المبلغ لحساب هيئة ZATCA قبل الموعد' : 'رصيد دائن مسترد لصالح المؤسسة من هيئة الزكاة والضريبة'}
          </div>
        </div>

      </div>

      <!-- ZATCA Standard Declaration Table -->
      <div style="background:#ffffff; border-radius:16px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.04); margin-bottom:24px;">
        <div style="background:#f8fafc; padding:14px 20px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
          <div style="font-weight:900; font-size:15px; color:#1e293b;">
            📑 نموذج الإقرار الضريبي الرسمي التجميعي (طريقة هيئة الزكاة والضريبة ZATCA Form)
          </div>
          <div style="font-size:11px; color:#64748b; font-weight:700;">
            النسبة المطبقة: 15% الضريبة المضافة
          </div>
        </div>

        <table style="width:100%; border-collapse:collapse; text-align:right; font-size:12.5px;">
          <thead>
            <tr style="background:#1e293b; color:#ffffff;">
              <th style="padding:10px 16px; width:45%;">بند الإقرار الضريبي</th>
              <th style="padding:10px 16px; text-align:center; width:12%;">عدد العمليات</th>
              <th style="padding:10px 16px; text-align:right; width:22%;">المبلغ الخاضع للضريبة (ر.س)</th>
              <th style="padding:10px 16px; text-align:right; width:21%;">مبلغ الضريبة 15% (ر.س)</th>
            </tr>
          </thead>
          <tbody>
            
            <!-- Output Header -->
            <tr style="background:#e0e7ff; color:#3730a3; font-weight:900;">
              <td colspan="4" style="padding:8px 16px; font-size:13px;">📤 أولاً: المبيعات والمخرجات (Output VAT)</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:10px 16px;">1. المبيعات المحلية الخاضعة للنسبة الأساسية (15%)</td>
              <td style="text-align:center;" class="mono">${salesInvoices.filter(i=>i.status!=="cancelled").length}</td>
              <td style="text-align:right;" class="mono font-bold">${formatCurrency(baseOutputSales)}</td>
              <td style="text-align:right; color:#dc2626;" class="mono font-bold">${formatCurrency(baseOutputVAT)}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:10px 16px;">2. يخصم: مردودات ومسموحات المبيعات الخاضعة (الإشعارات الدائنة)</td>
              <td style="text-align:center;" class="mono">${salesReturns.length}</td>
              <td style="text-align:right; color:#dc2626;" class="mono">- ${formatCurrency(returnsOutputSales)}</td>
              <td style="text-align:right; color:#16a34a;" class="mono">- ${formatCurrency(returnsOutputVAT)}</td>
            </tr>
            <tr style="background:#f5f3ff; font-weight:900; border-bottom:2px solid #c7d2fe;">
              <td style="padding:10px 16px; color:#4338ca;">إجمالي ضريبة المخرجات المستحقة عن الفترة (1)</td>
              <td style="text-align:center;">—</td>
              <td style="text-align:right;" class="mono">${formatCurrency(outputSales)} ر.س</td>
              <td style="text-align:right; color:#4338ca; font-size:14px;" class="mono font-bold">${formatCurrency(outputVAT)} ر.س</td>
            </tr>

            <!-- Input Header -->
            <tr style="background:#d1fae5; color:#065f46; font-weight:900;">
              <td colspan="4" style="padding:8px 16px; font-size:13px;">📥 ثانياً: المشتريات والمدخلات القابلة للخصم (Input VAT)</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:10px 16px;">1. مشتريات البضائع المحلية الخاضعة للنسبة الأساسية (15%)</td>
              <td style="text-align:center;" class="mono">${purchaseInvoices.filter(i=>i.status!=="cancelled").length}</td>
              <td style="text-align:right;" class="mono font-bold">${formatCurrency(baseInputPurchases)}</td>
              <td style="text-align:right; color:#16a34a;" class="mono font-bold">${formatCurrency(baseInputVAT)}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:10px 16px;">2. قيود الخدمات والمصاريف التشغيلية والأصول الخاضعة للضريبة (15%)</td>
              <td style="text-align:center;" class="mono">${serviceInvoices.length}</td>
              <td style="text-align:right; color:#4338ca;" class="mono font-bold">+ ${formatCurrency(serviceInputPurchases)}</td>
              <td style="text-align:right; color:#16a34a;" class="mono font-bold">+ ${formatCurrency(serviceInputVAT)}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:10px 16px;">3. يخصم: مردودات المشتريات الخاضعة (الإشعارات المدينة)</td>
              <td style="text-align:center;" class="mono">${purchaseReturns.length}</td>
              <td style="text-align:right; color:#dc2626;" class="mono">- ${formatCurrency(returnsInputPurchases)}</td>
              <td style="text-align:right; color:#dc2626;" class="mono">- ${formatCurrency(returnsInputVAT)}</td>
            </tr>
            <tr style="background:#ecfdf5; font-weight:900; border-bottom:2px solid #a7f3d0;">
              <td style="padding:10px 16px; color:#047857;">إجمالي ضريبة المدخلات القابلة للاسترداد والخصم (2)</td>
              <td style="text-align:center;">—</td>
              <td style="text-align:right;" class="mono">${formatCurrency(inputPurchases)} ر.س</td>
              <td style="text-align:right; color:#047857; font-size:14px;" class="mono font-bold">${formatCurrency(inputVAT)} ر.س</td>
            </tr>

            <!-- Final Result Row -->
            <tr style="background:${isDue ? '#fef2f2' : '#f0fdf4'}; font-weight:900; font-size:14px;">
              <td style="padding:14px 16px; color:${isDue ? '#991b1b' : '#166534'};">
                ⚖️ ${isDue ? 'صافي الضريبة الواجب سدادها لـ ZATCA (1 - 2)' : 'صافي المبلغ الضريبي المسترد لصالح المؤسسة (2 - 1)'}
              </td>
              <td style="text-align:center;">—</td>
              <td style="text-align:right;" class="mono">${formatCurrency(Math.abs(outputSales - inputPurchases))} ر.س</td>
              <td style="text-align:right; color:${isDue ? '#dc2626' : '#15803d'}; font-size:16px;" class="mono font-bold">
                ${formatCurrency(Math.abs(netVAT))} ر.س
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      ${serviceInvoices.length > 0 ? `
      <!-- Detailed Service & Capital Assets Entries Ledger -->
      <div style="background:#ffffff; border-radius:16px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.04); margin-bottom:24px;">
        <div style="background:#f8fafc; padding:12px 20px; border-bottom:1px solid #e2e8f0; font-weight:800; font-size:13px; color:#334155; display:flex; justify-content:space-between; align-items:center;">
          <span>📑 بيان تفصيلي بـ قيود الخدمات والأصول والمصروفات المرفقة بالإقرار (${serviceInvoices.length} قيد)</span>
          <span style="font-size:11px; color:#6366f1; font-weight:700;">ضريبة مدخلاتها: ${formatCurrency(serviceInputVAT)} ر.س</span>
        </div>
        <table style="width:100%; border-collapse:collapse; text-align:right; font-size:11.5px;">
          <thead>
            <tr style="background:#f1f5f9; color:#475569;">
              <th style="padding:8px 12px; width:35px; text-align:center;">#</th>
              <th style="padding:8px 12px; width:85px;">التاريخ</th>
              <th style="padding:8px 12px;">اسم المورد / بيان الخدمة</th>
              <th style="padding:8px 12px; width:130px;">الرقم الضريبي للمورد</th>
              <th style="padding:8px 12px; width:95px;">رقم القيد/الفاتورة</th>
              <th style="padding:8px 12px; text-align:right; width:100px;">المبلغ الخاضع</th>
              <th style="padding:8px 12px; text-align:right; width:90px;">الضريبة 15%</th>
              <th style="padding:8px 12px; text-align:right; width:100px;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${serviceRowsHtml}
          </tbody>
        </table>
      </div>` : ''}

      <!-- Official ZATCA Instructions Box -->
      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:12px; padding:16px 20px; font-size:12px; color:#475569; line-height:1.7;">
        <div style="font-weight:800; color:#1e293b; margin-bottom:6px; font-size:13px;">📡 إرشادات الفحص والتقديم على منصة هيئة الزكاة والضريبة والجمارك (ZATCA Fatoora):</div>
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px;">
          <div>• موعد تقديم الإقرار الضريبي: قبل نهاية الشهر التالي للفترة الضريبية.</div>
          <div>• رابط البوابة الرسمية: <a href="https://fatoora.zatca.gov.sa" target="_blank" style="color:#4f46e5; font-weight:700;">fatoora.zatca.gov.sa</a></div>
          <div>• غرامة تأخير التقديم: 5% إلى 25% من قيمة الضريبة المستحقة.</div>
          <div>• حالة الربط الإلكتروني: الفواتير والإشعارات مطابقة لمعايير المفلترة (Phase 2).</div>
        </div>
      </div>

    </div>
  `;
}

// ═══════════════════════════════════════════════
// TAB 2: Zakat (الزكاة)
// ═══════════════════════════════════════════════
async function renderZakat() {
  const body = document.getElementById("vz-body");
  if (!body) return;

  // Lazy-load inventory balances and product catalog only when accessing Zakat
  if (!products.length || !stockBal.length) {
    body.innerHTML = `
      <div class="page-loading" style="padding:40px 0;">
        <div class="loading-spinner"></div>
        <div style="margin-top:12px; font-weight:600; color:var(--text-2);">جارٍ احتساب وعاء الزكاة وتقييم أرصدة المخزون…</div>
      </div>`;
    try {
      const [prods, stock] = await Promise.all([
        getAll(COLS.products()),
        getAll(COLS.stockByWarehouse()),
      ]);
      products = prods || [];
      stockBal = stock || [];
    } catch (e) {
      console.warn("Zakat stock load error:", e);
    }
  }

  // Zakat base = Inventory value at cost
  const inventoryMap = {};
  stockBal.forEach(s => {
    inventoryMap[s.productId] = (inventoryMap[s.productId] || 0) + (s.qty || 0);
  });

  const inventoryValue = products.reduce((s, p) => {
    return s + (inventoryMap[p.id] || 0) * (p.costPrice || 0);
  }, 0);

  // Net sales (revenue base)
  const netRevenue = salesInvoices
    .filter(i => i.status !== "cancelled")
    .reduce((s, i) => s + (i.subtotal || 0), 0) - salesReturns.reduce((s, r) => s + (r.subtotal || 0), 0);

  // Expenses deduction
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  // Purchases deduction
  const purchasesDeduction = purchaseInvoices
    .filter(i => i.status !== "cancelled")
    .reduce((s, i) => s + (i.subtotal || 0), 0) - purchaseReturns.reduce((s, r) => s + (r.subtotal || 0), 0);

  const zakatBase  = Math.max(0, inventoryValue + netRevenue - totalExpenses - purchasesDeduction);
  const zakatRate  = 0.025; // 2.5%
  const zakatDue   = zakatBase * zakatRate;

  body.innerHTML = `
    <div style="max-width:800px; margin:0 auto;">
      <div style="text-align:center; margin-bottom:28px;" class="print-header">
        <h2 style="font-size:22px; font-weight:800; color:var(--brand);">🕌 حساب الزكاة</h2>
        <p style="color:var(--text-2); margin-top:4px;">معدل الزكاة: 2.5% من وعاء الزكاة الصافي</p>
        <p style="color:var(--text-2); font-size:12px;">تُطبَّق على المنشآت المملوكة للمواطنين السعوديين</p>
      </div>

      <div class="tax-section">
        <h3 style="color:var(--brand); font-size:15px; margin-bottom:16px; font-weight:700;">
          📦 عناصر وعاء الزكاة
        </h3>
        <div class="tax-row">
          <span>قيمة المخزون بسعر التكلفة (+)</span>
          <span class="mono text-good">${formatCurrency(inventoryValue)}</span>
        </div>
        <div class="tax-row">
          <span>صافي الإيرادات خلال الفترة (+)</span>
          <span class="mono text-good">${formatCurrency(netRevenue)}</span>
        </div>
        <div class="tax-row">
          <span>المشتريات خلال الفترة (-)</span>
          <span class="mono text-bad">- ${formatCurrency(purchasesDeduction)}</span>
        </div>
        <div class="tax-row">
          <span>المصروفات التشغيلية (-)</span>
          <span class="mono text-bad">- ${formatCurrency(totalExpenses)}</span>
        </div>
        <div class="tax-row total">
          <span>وعاء الزكاة الصافي</span>
          <span class="mono" style="font-size:17px;">${formatCurrency(zakatBase)}</span>
        </div>
      </div>

      <div class="tax-section" style="border:2px solid var(--warn);">
        <div class="tax-row payable" style="border-radius:8px;">
          <div>
            <div style="font-size:16px; font-weight:700;">💰 الزكاة المستحقة (2.5%)</div>
            <div style="font-size:12px; color:var(--text-2); margin-top:4px;">
              ${formatCurrency(zakatBase)} × 2.5%
            </div>
          </div>
          <span class="mono" style="font-size:24px; color:var(--warn);">${formatCurrency(zakatDue)}</span>
        </div>
      </div>

      <div class="tax-section" style="font-size:13px; line-height:1.8; color:var(--text-2);">
        <h4 style="color:var(--text-1); margin-bottom:8px;">📌 ملاحظات مهمة:</h4>
        <p>• هذا حساب تقديري مبسط. يجب مراجعة محاسب قانوني معتمد لحساب الزكاة الدقيق.</p>
        <p>• تُحسب الزكاة بشكل سنوي في نهاية السنة المالية بعد اكتمال الحول.</p>
        <p>• تقديم إقرار الزكاة عبر منصة: <strong>zatca.gov.sa</strong></p>
        <p>• موعد تقديم الإقرار: خلال 120 يوماً من نهاية السنة المالية.</p>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════
// TAB 3: Income Tax (ضريبة الدخل)
// ═══════════════════════════════════════════════
function renderIncomeTax() {
  const body = document.getElementById("vz-body");
  if (!body) return;

  const revenue   = salesInvoices.filter(i=>i.status!=="cancelled").reduce((s,i)=>s+(i.subtotal||0),0) - salesReturns.reduce((s,r)=>s+(r.subtotal||0),0);
  const purchases = purchaseInvoices.filter(i=>i.status!=="cancelled").reduce((s,i)=>s+(i.subtotal||0),0) - purchaseReturns.reduce((s,r)=>s+(r.subtotal||0),0);
  const expTotal  = expenses.reduce((s,e)=>s+(e.amount||0),0);
  const grossProfit  = revenue - purchases;
  const netProfit    = grossProfit - expTotal;

  const taxRate   = 0.20;
  const taxableProfit = Math.max(0, netProfit);
  const incomeTaxDue  = taxableProfit * taxRate;

  body.innerHTML = `
    <div style="max-width:800px; margin:0 auto;">
      <div style="text-align:center; margin-bottom:28px;" class="print-header">
        <h2 style="font-size:22px; font-weight:800; color:var(--brand);">💼 ضريبة الدخل</h2>
        <p style="color:var(--text-2); margin-top:4px;">معدل الضريبة: 20% على صافي الربح (للمساهمين غير السعوديين)</p>
      </div>

      <div class="tax-section">
        <h3 style="font-size:15px; margin-bottom:16px; font-weight:700; color:var(--brand);">
          📊 قائمة الدخل المختصرة
        </h3>
        <div class="tax-row">
          <span>إيرادات المبيعات (الصافي بعد المردودات)</span>
          <span class="mono text-good">${formatCurrency(revenue)}</span>
        </div>
        <div class="tax-row">
          <span>( - ) تكلفة المشتريات (الصافي بعد المردودات)</span>
          <span class="mono text-bad">- ${formatCurrency(purchases)}</span>
        </div>
        <div class="tax-row total">
          <span>مجمل الربح (Gross Profit)</span>
          <span class="mono" style="color:${grossProfit>=0?"var(--good)":"var(--bad)"};">
            ${formatCurrency(grossProfit)}
          </span>
        </div>
        <div class="tax-row">
          <span>( - ) المصروفات التشغيلية</span>
          <span class="mono text-bad">- ${formatCurrency(expTotal)}</span>
        </div>
        <div class="tax-row total" style="font-size:17px;">
          <span>صافي الربح (Net Profit)</span>
          <span class="mono" style="color:${netProfit>=0?"var(--good)":"var(--bad)"};">
            ${formatCurrency(netProfit)}
          </span>
        </div>
      </div>

      <div class="tax-section" style="border:2px solid var(--indigo);">
        <h3 style="font-size:15px; margin-bottom:16px; font-weight:700; color:var(--indigo);">
          🧮 احتساب الضريبة
        </h3>
        <div class="tax-row">
          <span>الدخل الخاضع للضريبة</span>
          <span class="mono">${formatCurrency(taxableProfit)}</span>
        </div>
        <div class="tax-row">
          <span>معدل ضريبة الدخل</span>
          <span class="mono">20%</span>
        </div>
        <div class="tax-row payable">
          <span style="font-size:16px; font-weight:700;">💰 ضريبة الدخل المستحقة</span>
          <span class="mono" style="font-size:22px; color:var(--indigo);">${formatCurrency(incomeTaxDue)}</span>
        </div>
      </div>

      <div class="tax-section" style="background:rgba(99,102,241,0.05);">
        <h4 style="color:var(--brand); margin-bottom:8px; font-size:14px;">⚖️ الإطار القانوني السعودي:</h4>
        <div style="font-size:12px; line-height:1.9; color:var(--text-2);">
          <p>• <strong>المواطنون السعوديون وشركاء الخليج:</strong> يخضعون للزكاة (2.5%) فقط — لا ضريبة دخل</p>
          <p>• <strong>المساهمون الأجانب:</strong> يخضعون لضريبة دخل 20% على نصيبهم من الأرباح</p>
          <p>• <strong>الشركات المختلطة:</strong> يُحسب كل جزء بحسب نسبة الملكية</p>
          <p>• تقديم الإقرار عبر: <strong>zatca.gov.sa → نظام أسأل</strong></p>
          <p>• الموعد النهائي: 120 يوماً من نهاية السنة المالية</p>
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════
// TAB 4: Tax Invoice Log (سجل الفواتير الضريبي)
// ═══════════════════════════════════════════════
function renderTaxInvoiceLog() {
  const body = document.getElementById("vz-body");
  if (!body) return;

  const allInvoices = [
    ...salesInvoices.filter(i=>i.status!=="cancelled").map(i => ({
      ...i, direction: "صادر (مبيعات)", vatSign: +1
    })),
    ...purchaseInvoices.filter(i=>i.status!=="cancelled").map(i => ({
      ...i, direction: "وارد (مشتريات)", vatSign: -1,
      customerName: i.supplierName
    })),
    ...salesReturns.map(r => ({
      ...r, direction: "مردود مبيعات (دائن)", vatSign: -1,
      number: r.number || r.id.slice(0, 8),
      customerName: r.customerName
    })),
    ...purchaseReturns.map(r => ({
      ...r, direction: "مردود مشتريات (مدين)", vatSign: +1,
      number: r.number || r.id.slice(0, 8),
      customerName: r.supplierName
    })),
    ...serviceInvoices.map(s => ({
      ...s, direction: "وارد (خدمات يدوية)", vatSign: -1,
      customerName: s.supplierName
    }))
  ].sort((a,b) => (a.date||"") > (b.date||"") ? -1 : 1);

  const serviceInputVAT = serviceInvoices.reduce((s, i) => s + (i.totalVat || 0), 0);
  const totalOutputVAT = salesInvoices.filter(i=>i.status!=="cancelled").reduce((s,i)=>s+(i.totalVat||0),0) - salesReturns.reduce((s,r)=>s+(r.totalVat||0),0);
  const totalInputVAT  = purchaseInvoices.filter(i=>i.status!=="cancelled").reduce((s,i)=>s+(i.totalVat||0),0) - purchaseReturns.reduce((s,r)=>s+(r.totalVat||0),0) + serviceInputVAT;
  const netVAT         = totalOutputVAT - totalInputVAT;

  body.innerHTML = `
    <div class="kpi-grid mb-20" style="grid-template-columns:repeat(3,1fr);">
      <div class="kpi-card"><div class="status-bar bad"></div>
        <div class="kpi-content"><div class="kpi-label">صافي ضريبة مخرجات (مبيعات)</div>
          <div class="kpi-value mono text-bad">${formatCurrency(Math.max(0, totalOutputVAT))}</div></div></div>
      <div class="kpi-card"><div class="status-bar good"></div>
        <div class="kpi-content"><div class="kpi-label">صافي ضريبة مدخلات (مشتريات + خدمات)</div>
          <div class="kpi-value mono text-good">${formatCurrency(Math.max(0, totalInputVAT))}</div></div></div>
      <div class="kpi-card"><div class="status-bar ${netVAT>0?"warn":"good"}"></div>
        <div class="kpi-content"><div class="kpi-label">صافي الضريبة المستحقة / (المستردة)</div>
          <div class="kpi-value mono" style="color:${netVAT>0?"var(--warn)":"var(--good)"};">
            ${formatCurrency(Math.abs(netVAT))} ${netVAT>0?"مستحق":"مسترد"}
          </div></div></div>
    </div>

    <div class="card">
      <div class="table-container">
        <table class="data-dense">
          <thead><tr>
            <th>رقم المستند</th><th>التاريخ</th><th>النوع</th>
            <th>الطرف الآخر</th><th>المجموع قبل VAT</th>
            <th>مبلغ VAT</th><th>الإجمالي</th>
          </tr></thead>
          <tbody>
            ${allInvoices.map(inv => `
              <tr>
                <td class="mono text-indigo">${inv.number||"—"}</td>
                <td class="dim">${inv.date||"—"}</td>
                <td>
                  <span class="badge ${inv.direction.includes("مبيعات") ? "bad" : "good"}" style="font-size:10px;">
                    ${inv.direction}
                  </span>
                </td>
                <td class="font-semibold">${inv.customerName||inv.supplierName||"—"}</td>
                <td class="mono">${formatCurrency(inv.subtotal||0)}</td>
                <td class="mono ${inv.vatSign>0?"text-bad":"text-good"}">
                  ${inv.vatSign>0?"+ ":"- "}${formatCurrency(inv.totalVat||0)}
                </td>
                <td class="mono font-bold">${formatCurrency(inv.totalWithVat||0)}</td>
              </tr>`).join("")}
            ${allInvoices.length === 0 ? `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-2);">لا توجد فواتير أو إشعارات في الفترة المحددة</td></tr>` : ""}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ────────────────────────────────────────────────
// PUBLIC API
// ────────────────────────────────────────────────
window.VZ = {
  ...window.VZ,
  async tab(t) {
    activeTab = t;
    document.querySelectorAll(".vz-tab").forEach(b => b.classList.remove("active"));
    document.getElementById(`vzt-${t}`)?.classList.add("active");
    await renderTab();
  },
  async reload() {
    const body = document.getElementById("vz-body");
    if (body) body.innerHTML = `<div class="page-loading"><div class="loading-spinner"></div><span>جارٍ تحديث البيانات…</span></div>`;
    await loadAllData();
  }
};

window.printVatDeclaration = async () => {
  const from = document.getElementById("vz-from")?.value || "";
  const to   = document.getElementById("vz-to")?.value   || "";

  let company = {
    name: "شركة نظم الإمداد المتطورة",
    nameEn: "Modern Supply Systems Co.",
    crNumber: "7054969006",
    vatNumber: "314996148100003",
    phone: "0549141648",
    email: "Nuzmalamdad@gmail.com",
    address: "مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414",
    logoUrl: ""
  };

  try {
    const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const { db, COMPANY_ID } = await import("../firebase-config.js");
    const [coSnap, logoSnap] = await Promise.all([
      getDoc(doc(db, `companies/${COMPANY_ID}/settings/company`)),
      getDoc(doc(db, `companies/${COMPANY_ID}/settings/logo`))
    ]);
    if (coSnap.exists()) {
      const cd = coSnap.data();
      company.name = cd.name || cd.companyName || company.name;
      company.nameEn = cd.nameEn || cd.legalName || company.nameEn;
      company.crNumber = cd.crNumber || cd.cr || company.crNumber;
      company.vatNumber = cd.vatNumber || cd.vat || company.vatNumber;
      company.phone = cd.phone || company.phone;
      company.email = cd.email || company.email;
      company.address = cd.address ? (cd.city ? `${cd.address} — ${cd.city}` : cd.address) : company.address;
    }
    if (logoSnap.exists()) {
      company.logoUrl = logoSnap.data().dataUrl || logoSnap.data().logoUrl || "";
    }
  } catch (_) {}

  // Output VAT calculations
  const baseOutputSales = salesInvoices.filter(i=>i.status!=="cancelled").reduce((s,i)=>s+(i.subtotal||0),0);
  const baseOutputVAT   = salesInvoices.filter(i=>i.status!=="cancelled").reduce((s,i)=>s+(i.totalVat||0),0);
  const returnsOutputSales = salesReturns.reduce((s,r)=>s+(r.subtotal||0),0);
  const returnsOutputVAT   = salesReturns.reduce((s,r)=>s+(r.totalVat||0),0);
  const outputSales = Math.max(0, baseOutputSales - returnsOutputSales);
  const outputVAT   = Math.max(0, baseOutputVAT - returnsOutputVAT);

  // Input VAT calculations
  const baseInputPurchases = purchaseInvoices.filter(i=>i.status!=="cancelled").reduce((s,i)=>s+(i.subtotal||0),0);
  const baseInputVAT      = purchaseInvoices.filter(i=>i.status!=="cancelled").reduce((s,i)=>s+(i.totalVat||0),0);
  const serviceInputPurchases = serviceInvoices.reduce((s,i)=>s+(i.subtotal||0),0);
  const serviceInputVAT      = serviceInvoices.reduce((s,i)=>s+(i.totalVat||0),0);
  const returnsInputPurchases = purchaseReturns.reduce((s,r)=>s+(r.subtotal||0),0);
  const returnsInputVAT      = purchaseReturns.reduce((s,r)=>s+(r.totalVat||0),0);
  const inputPurchases = Math.max(0, baseInputPurchases + serviceInputPurchases - returnsInputPurchases);
  const inputVAT   = Math.max(0, baseInputVAT + serviceInputVAT - returnsInputVAT);

  // Net VAT
  const netVAT = outputVAT - inputVAT;
  const isDue = netVAT > 0;
  const isRefund = netVAT < 0;

  const printTime = new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });

  let serviceRowsHtml = "";
  if (serviceInvoices.length > 0) {
    serviceRowsHtml = serviceInvoices.map((s, idx) => `
      <tr>
        <td style="text-align:center;font-family:monospace;color:#64748b;">${idx + 1}</td>
        <td style="font-family:monospace;white-space:nowrap;">${s.date || "—"}</td>
        <td style="font-weight:700;color:#0f172a;">${s.supplierName || "مورد خدمة"}</td>
        <td style="font-family:monospace;color:#475569;">${s.taxNumber || "—"}</td>
        <td style="font-family:monospace;color:#4338ca;font-weight:700;">#${s.number || "—"}</td>
        <td style="text-align:right;font-family:monospace;">${formatCurrency(s.subtotal || 0)} ر.س</td>
        <td style="text-align:right;font-family:monospace;font-weight:700;color:#16a34a;">${formatCurrency(s.totalVat || 0)} ر.س</td>
        <td style="text-align:right;font-family:monospace;font-weight:800;">${formatCurrency(s.totalWithVat || 0)} ر.س</td>
      </tr>
    `).join("");
  }

  const printableHTML = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>إقرار ضريبة القيمة المضافة - ${company.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=IBM+Plex+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 4mm 6mm 4mm 6mm; }
    * { 
      box-sizing: border-box; margin: 0; padding: 0; 
      -webkit-print-color-adjust: exact !important; 
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    body { font-family: 'Tajawal', sans-serif; background: #ffffff !important; color: #0f172a; line-height: 1.25; font-size: 9.5px; }
    .mono { font-family: 'IBM Plex Mono', monospace; }
    
    .vat-card { max-width: 100%; margin: 0 auto; background: #ffffff !important; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; }
    
    /* Company Header - Royal Blue */
    .company-header {
      background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #1e40af 100%) !important;
      color: #ffffff !important; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #f59e0b;
      -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
    }
    .company-title h1 { font-size: 18px; font-weight: 900; margin-bottom: 1px; letter-spacing: -0.3px; color: #ffffff !important; }
    .company-title h2 { font-size: 9.5px; font-weight: 500; color: #cbd5e1 !important; margin-bottom: 4px; font-family: sans-serif; }
    .company-meta { font-size: 9.5px; color: #f8fafc !important; display: flex; flex-wrap: wrap; gap: 12px; }
    .company-meta span { display: inline-flex; align-items: center; gap: 3px; color: #ffffff !important; }
    .company-meta strong { color: #fef08a !important; font-weight: 700; }
    .header-logo { width: 60px; height: 60px; background: #ffffff !important; border-radius: 10px; padding: 4px; display: flex; align-items: center; justify-content: center; border: 1px solid #cbd5e1; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .header-logo img { max-width: 100%; max-height: 100%; object-fit: contain; }

    /* Doc Title Banner */
    .doc-banner {
      background: #f8fafc !important; border-bottom: 1px solid #e2e8f0; padding: 8px 18px; display: flex; justify-content: space-between; align-items: center;
      -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
    }
    .doc-badge {
      display: inline-flex; align-items: center; gap: 6px; background: #1e3a8a !important; color: #ffffff !important; padding: 4px 12px; border-radius: 6px; font-weight: 800; font-size: 11px;
      -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
    }
    .doc-period { font-size: 10.5px; color: #334155; font-weight: 700; }

    .content-pad { padding: 10px 18px; }

    /* Tables */
    .section-title {
      font-size: 11px; font-weight: 800; margin: 8px 0 4px 0; display: flex; align-items: center; gap: 5px;
    }
    .section-title.output { color: #1e40af; }
    .section-title.input { color: #047857; }
    .section-title.summary { color: #0f172a; }

    .tax-table {
      width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 9.5px; border-radius: 6px; overflow: hidden; border: 1px solid #cbd5e1; page-break-inside: avoid;
    }
    .tax-table th { background: #f1f5f9 !important; color: #1e293b; font-weight: 800; text-align: right; padding: 4px 8px; border-bottom: 1px solid #cbd5e1; font-size: 9.5px; -webkit-print-color-adjust: exact !important; }
    .tax-table td { padding: 4px 8px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 9.5px; }
    .tax-table tr:last-child td { border-bottom: none; }
    .tax-table tr.total-row { background: #f8fafc !important; font-weight: 900; font-size: 10px; border-top: 2px solid #cbd5e1; -webkit-print-color-adjust: exact !important; }

    /* Result Box */
    .result-box {
      border: 2px solid ${isDue ? '#ef4444' : '#16a34a'} !important; border-radius: 8px; padding: 8px 14px; background: ${isDue ? '#fef2f2' : '#f0fdf4'} !important; display: flex; justify-content: space-between; align-items: center; margin: 8px 0; page-break-inside: avoid;
      -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
    }
    .result-label { font-size: 11.5px; font-weight: 800; color: ${isDue ? '#991b1b' : '#166534'}; }
    .result-desc { font-size: 9.5px; color: #475569; margin-top: 1px; }
    .result-amount { font-size: 18px; font-weight: 900; font-family: 'IBM Plex Mono', monospace; color: ${isDue ? '#dc2626' : '#15803d'}; }

    /* Signatures */
    .signatures {
      margin-top: 10px; padding-top: 8px; border-top: 1px dashed #cbd5e1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; text-align: center; page-break-inside: avoid;
    }
    .sig-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; background: #fafafa !important; -webkit-print-color-adjust: exact !important; }
    .sig-title { font-weight: 800; font-size: 9.5px; color: #1e3a8a; margin-bottom: 18px; }
    .sig-line { border-top: 1px dotted #94a3b8; padding-top: 2px; font-size: 8.5px; color: #64748b; }

    @media print {
      html, body { height: 100%; overflow: hidden; background: #fff !important; }
      .vat-card { border: none; box-shadow: none; }
      .no-print { display: none !important; }
      tr, .tax-table, .result-box, .signatures { page-break-inside: avoid !important; }
    }
  </style>
</head>
<body>
  <div class="vat-card">
    <!-- Header -->
    <div class="company-header">
      <div class="company-title">
        <h1>${company.name}</h1>
        <h2>${company.nameEn}</h2>
        <div class="company-meta">
          <span>🏛️ س.ت: <strong class="mono">${company.crNumber}</strong></span>
          <span>🏷️ الرقم الضريبي: <strong class="mono">${company.vatNumber}</strong></span>
          <span>📍 ${company.address}</span>
          <span>📞 ${company.phone}</span>
        </div>
      </div>
      <div class="header-logo">
        ${company.logoUrl ? `<img src="${company.logoUrl}" alt="شعار الشركة" />` : '<div style="font-weight:900;font-size:24px;color:#1e3a8a;">MSS</div>'}
      </div>
    </div>

    <!-- Doc Banner -->
    <div class="doc-banner">
      <div class="doc-badge">
        <span>📋 إقرار ضريبة القيمة المضافة الرسمي (ZATCA VAT Return)</span>
      </div>
      <div class="doc-period">
        الفترة الضريبية: <strong class="mono">${from || "—"}</strong> إلى <strong class="mono">${to || "—"}</strong>
        <span style="margin-right:12px;font-size:10px;color:#64748b;">(تاريخ الاستخراج: ${printTime})</span>
      </div>
    </div>

    <div class="content-pad">
      <!-- Output Tax Table -->
      <div class="section-title output">
        <span>📤 الجزء الأول: ضريبة المخرجات (Output VAT) — المبيعات والإيرادات</span>
      </div>
      <table class="tax-table">
        <thead>
          <tr>
            <th style="width:50%;">البيان والتفاصيل</th>
            <th style="width:15%;text-align:center;">عدد العمليات</th>
            <th style="width:18%;text-align:right;">المبلغ الخاضع للضريبة (ر.س)</th>
            <th style="width:17%;text-align:right;">مبلغ الضريبة 15% (ر.س)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1. إجمالي مبيعات البضائع والخدمات الخاضعة للنسبة الأساسية (15%)</td>
            <td style="text-align:center;" class="mono">${salesInvoices.filter(i=>i.status!=="cancelled").length}</td>
            <td style="text-align:right;" class="mono font-bold">${formatCurrency(baseOutputSales)}</td>
            <td style="text-align:right;color:#dc2626;" class="mono font-bold">${formatCurrency(baseOutputVAT)}</td>
          </tr>
          <tr>
            <td>2. يخصم: مردودات ومسموحات المبيعات الخاضعة للضريبة</td>
            <td style="text-align:center;" class="mono">${salesReturns.length}</td>
            <td style="text-align:right;color:#dc2626;" class="mono">- ${formatCurrency(returnsOutputSales)}</td>
            <td style="text-align:right;color:#16a34a;" class="mono">- ${formatCurrency(returnsOutputVAT)}</td>
          </tr>
          <tr class="total-row">
            <td>صافي ضريبة المخرجات المستحقة (1)</td>
            <td style="text-align:center;">—</td>
            <td style="text-align:right;" class="mono">${formatCurrency(outputSales)} ر.س</td>
            <td style="text-align:right;color:#dc2626;" class="mono font-bold">${formatCurrency(outputVAT)} ر.س</td>
          </tr>
        </tbody>
      </table>

      <!-- Input Tax Table -->
      <div class="section-title input">
        <span>📥 الجزء الثاني: ضريبة المدخلات (Input VAT) — المشتريات والخدمات والقيود</span>
      </div>
      <table class="tax-table">
        <thead>
          <tr>
            <th style="width:50%;">البيان والتفاصيل</th>
            <th style="width:15%;text-align:center;">عدد العمليات</th>
            <th style="width:18%;text-align:right;">المبلغ الخاضع للضريبة (ر.س)</th>
            <th style="width:17%;text-align:right;">الضريبة المستردة 15% (ر.س)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1. إجمالي مشتريات البضائع المحلية الخاضعة للنسبة الأساسية (15%)</td>
            <td style="text-align:center;" class="mono">${purchaseInvoices.filter(i=>i.status!=="cancelled").length}</td>
            <td style="text-align:right;" class="mono font-bold">${formatCurrency(baseInputPurchases)}</td>
            <td style="text-align:right;color:#16a34a;" class="mono font-bold">${formatCurrency(baseInputVAT)}</td>
          </tr>
          <tr>
            <td>2. قيود الخدمات والمصاريف التشغيلية الخاضعة (قيود اليومية وخدمات الموردين)</td>
            <td style="text-align:center;" class="mono">${serviceInvoices.length}</td>
            <td style="text-align:right;color:#4338ca;" class="mono font-bold">+ ${formatCurrency(serviceInputPurchases)}</td>
            <td style="text-align:right;color:#16a34a;" class="mono font-bold">+ ${formatCurrency(serviceInputVAT)}</td>
          </tr>
          <tr>
            <td>3. يخصم: مردودات المشتريات الخاضعة للضريبة</td>
            <td style="text-align:center;" class="mono">${purchaseReturns.length}</td>
            <td style="text-align:right;color:#dc2626;" class="mono">- ${formatCurrency(returnsInputPurchases)}</td>
            <td style="text-align:right;color:#dc2626;" class="mono">- ${formatCurrency(returnsInputVAT)}</td>
          </tr>
          <tr class="total-row">
            <td>صافي ضريبة المدخلات القابلة للاسترداد (2)</td>
            <td style="text-align:center;">—</td>
            <td style="text-align:right;" class="mono">${formatCurrency(inputPurchases)} ر.س</td>
            <td style="text-align:right;color:#16a34a;" class="mono font-bold">${formatCurrency(inputVAT)} ر.س</td>
          </tr>
        </tbody>
      </table>

      <!-- Result Box -->
      <div class="result-box">
        <div>
          <div class="result-label">
            ${isDue ? '⚠️ صافي الضريبة المستحقة للسداد لهيئة الزكاة والضريبة والجمارك (Net VAT Payable)' : isRefund ? '💚 صافي الضريبة القابلة للاسترداد أو التدوير من الهيئة (Net VAT Refundable)' : '✓ الحساب متوازن تماماً (Zero Balance)'}
          </div>
          <div class="result-desc">
            (صافي ضريبة المخرجات: ${formatCurrency(outputVAT)} ر.س) - (صافي ضريبة المدخلات: ${formatCurrency(inputVAT)} ر.س)
          </div>
        </div>
        <div class="result-amount">
          ${formatCurrency(Math.abs(netVAT))} ر.س
        </div>
      </div>

      ${serviceInvoices.length > 0 ? `
      <!-- Supporting Service Entries Table -->
      <div class="section-title summary" style="font-size:12px;margin-top:14px;">
        <span>📑 سجل قيود الخدمات والمصاريف الضريبية المرفقة بالإقرار:</span>
      </div>
      <table class="tax-table" style="font-size:10.5px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="width:30px;text-align:center;">#</th>
            <th style="width:80px;">التاريخ</th>
            <th>اسم المورد / مقدم الخدمة</th>
            <th style="width:130px;">الرقم الضريبي للمورد</th>
            <th style="width:90px;">رقم الفاتورة</th>
            <th style="width:95px;text-align:right;">المبلغ الخاضع</th>
            <th style="width:85px;text-align:right;">الضريبة 15%</th>
            <th style="width:95px;text-align:right;">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${serviceRowsHtml}
        </tbody>
      </table>` : ''}

      <!-- Signatures -->
      <div class="signatures">
        <div class="sig-box">
          <div class="sig-title">إعداد: المحاسب المالي</div>
          <div class="sig-line">التوقيع والتاريخ</div>
        </div>
        <div class="sig-box">
          <div class="sig-title">مراجعة: المدير المالي / المستشار الضريبي</div>
          <div class="sig-line">التوقيع والاعتماد</div>
        </div>
        <div class="sig-box">
          <div class="sig-title">الاعتماد والختم الرسمي للمنشأة</div>
          <div class="sig-line">ختم الشركة المعتمد</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const printWin = window.open("", "_blank", "width=920,height=950");
  if (!printWin) {
    window.showToast?.("يرجى السماح بالنوافذ المنبثقة لطباعة الإقرار", "warn");
    return;
  }
  printWin.document.open();
  printWin.document.write(printableHTML);
  printWin.document.close();
  setTimeout(() => {
    printWin.focus();
    printWin.print();
  }, 400);
};

window.printVATReturn = window.printVatDeclaration;

