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

export async function render(container, user) {
  const thisMonth = new Date();
  const fromDate  = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1).toISOString().split("T")[0];
  const toDate    = todayString();

  container.innerHTML = `
    <!-- Filter Bar -->
    <div class="filterbar no-print">
      <div class="date-range-group"><label>من</label>
        <input type="date" id="vz-from" value="${fromDate}" />
      </div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="vz-to" value="${toDate}" />
      </div>
      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.print()">🖨️ طباعة الإقرار</button>
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

  await loadAllData();
}

async function loadAllData() {
  const from = document.getElementById("vz-from")?.value || "";
  const to   = document.getElementById("vz-to")?.value   || "";

  try {
    const [siSnap, piSnap, srSnap, prSnap, expSnap, jeSnap, prods, stock] = await Promise.all([
      getDocs(query(COLS.salesInvoices(),    orderBy("createdAt","desc"), limit(1000))),
      getDocs(query(COLS.purchaseInvoices(), orderBy("createdAt","desc"), limit(1000))),
      getDocs(query(COLS.salesReturns(),     orderBy("createdAt","desc"), limit(1000))),
      getDocs(query(COLS.purchaseReturns(),  orderBy("createdAt","desc"), limit(1000))),
      getDocs(query(COLS.expenses(),         orderBy("date","desc"),      limit(1000))),
      getDocs(query(COLS.journalEntries(),   orderBy("date","desc"),      limit(1000))),
      getAll(COLS.products()),
      getAll(COLS.stockByWarehouse()),
    ]);

    salesInvoices    = siSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    purchaseInvoices = piSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    salesReturns     = srSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    purchaseReturns  = prSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    expenses         = expSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const journalEntries = jeSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    products         = prods;
    stockBal         = stock;

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

    // ✅ ROOTFIX: Parse manual JEs for VAT input entries
    // Strategy 1: Lines with non-empty serviceProvider/taxNumber/invoiceRef
    // Strategy 2: Lines debiting ANY VAT input account in manual/expense JEs
    // يشمل: 2-1-1-2 (المستخدم فعلياً) و 2-2-1-2 و 2-2-2 وأي حساب اسمه يحتوي على "المدخلات"
    const _isVatInputLine = l =>
      (l.debit || 0) > 0 && (
        l.accountCode === "2-1-1-2" ||
        l.accountCode === "2-2-1-2" ||
        l.accountCode === "2-2-2"   ||
        (l.accountName && l.accountName.includes("المدخلات"))
      );
    const _isVatInputCode = code => [
      "2-1-1-2", "2-2-1-2", "2-2-2"
    ].includes(code) || false;

    serviceInvoices = [];
    filteredJEs.forEach(je => {
      if (je.status !== "posted") return;
      // ── الاستراتيجية الثانية: اكتشاف قيد ضريبة المدخلات مباشرةً من الحساب ──
      const vatInputLine = (je.lines || []).find(_isVatInputLine);
      if (vatInputLine && (je.sourceType === "manual" || je.sourceType === "expense")) {
        const vatAmt = vatInputLine.debit || 0;
        // ابحث عن سطر المصروف (المدين الأساسي غير الضريبي) لاستخراج المبلغ الأساسي
        const baseLine = (je.lines || []).find(l =>
          !_isVatInputCode(l.accountCode) &&
          !(l.accountName && l.accountName.includes("المدخلات")) &&
          (l.debit || 0) > 0
        );
        const baseAmt = baseLine ? (baseLine.debit || 0) : Math.round((vatAmt / 0.15) * 100) / 100;
        // استخرج بيانات المورد من سطور القيد أو من header القيد
        const spName = (je.lines || []).reduce((n, l) => n || (l.serviceProvider || "").trim(), "")
                       || (je.supplierName || je.vendorName || je.entityName || "").trim()
                       || je.description || "مورد خدمة";
        const tNum   = (je.lines || []).reduce((n, l) => n || (l.taxNumber || "").trim(), "")
                       || (je.taxNumber || je.supplierVatNumber || "").trim()
                       || "—";
        const invRef = (je.lines || []).reduce((n, l) => n || (l.invoiceRef || "").trim(), "")
                       || je.entryNumber || je.id.slice(0, 8);
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
        return; // لا نعالج هذا القيد مرة ثانية
      }

      // ── الاستراتيجية الأولى: السطور ذات حقل serviceProvider/taxNumber/invoiceRef مكتملة ──
      (je.lines || []).forEach(l => {
        const sp  = (l.serviceProvider || "").trim();
        const tn  = (l.taxNumber       || "").trim();
        const ref = (l.invoiceRef      || "").trim();
        if (sp || tn || ref) {
          const amt = l.debit || l.credit || 0;
          if (amt > 0) {
            // اشتق ضريبة 15% إذا لم تكن موجودة
            const vat = Math.round((amt * 0.15) * 100) / 100;
            serviceInvoices.push({
              id:           je.id,
              number:       ref || je.entryNumber || je.id.slice(0, 8),
              date:         je.date || "",
              supplierName: sp || "مورد خدمة يدوي",
              taxNumber:    tn || "—",
              subtotal:     amt,
              totalVat:     vat,
              totalWithVat: amt + vat,
              direction:    "وارد (قيد خدمات يدوية)",
              vatSign:      -1
            });
          }
        }
      });
    });

    renderTab();
  } catch (err) {
    const body = document.getElementById("vz-body");
    if (body) body.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
}

function renderTab() {
  switch (activeTab) {
    case "vat":      renderVATDeclaration(); break;
    case "zakat":    renderZakat(); break;
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

  body.innerHTML = `
    <div style="max-width:800px; margin:0 auto;">
      <div style="text-align:center; margin-bottom:28px;" class="print-header">
        <h2 style="font-size:22px; font-weight:800; color:var(--brand);">إقرار ضريبة القيمة المضافة (VAT Return)</h2>
        <p style="color:var(--text-2); margin-top:4px;">الفترة: ${from} إلى ${to}</p>
        <p style="color:var(--text-2); font-size:12px;">معدل الضريبة: 15% | الجهة: هيئة الزكاة والضريبة والجمارك (ZATCA)</p>
      </div>

      <!-- Output Tax Section -->
      <div class="tax-section">
        <h3 style="color:var(--brand); font-size:15px; margin-bottom:16px; font-weight:700;">
          📤 الجزء الأول: ضريبة المخرجات (Output VAT)
        </h3>
        <div class="tax-row">
          <span>عدد فواتير المبيعات</span>
          <span class="mono font-bold">${salesInvoices.filter(i=>i.status!=="cancelled").length} فاتورة</span>
        </div>
        <div class="tax-row">
          <span>إجمالي المبيعات (قبل VAT)</span>
          <span class="mono">${formatCurrency(baseOutputSales)}</span>
        </div>
        <div class="tax-row">
          <span>يخصم: مردودات المبيعات (قبل VAT)</span>
          <span class="mono text-bad">- ${formatCurrency(returnsOutputSales)}</span>
        </div>
        <div class="tax-row total">
          <span>صافي ضريبة المخرجات (15%)</span>
          <span class="mono text-bad">${formatCurrency(outputVAT)}</span>
        </div>
      </div>

      <!-- Input Tax Section -->
      <div class="tax-section">
        <h3 style="color:var(--good); font-size:15px; margin-bottom:16px; font-weight:700;">
          📥 الجزء الثاني: ضريبة المدخلات (Input VAT)
        </h3>
        <div class="tax-row">
          <span>عدد فواتير المشتريات</span>
          <span class="mono font-bold">${purchaseInvoices.filter(i=>i.status!=="cancelled").length} فاتورة</span>
        </div>
        <div class="tax-row">
          <span>إجمالي مشتريات البضائع (قبل VAT)</span>
          <span class="mono">${formatCurrency(baseInputPurchases)}</span>
        </div>
        <div class="tax-row">
          <span>إجمالي قيود الخدمات والمصاريف (قبل VAT)</span>
          <span class="mono text-indigo">+ ${formatCurrency(serviceInputPurchases)}</span>
        </div>
        <div class="tax-row">
          <span>يخصم: مردودات المشتريات (قبل VAT)</span>
          <span class="mono text-bad">- ${formatCurrency(returnsInputPurchases)}</span>
        </div>
        <div class="tax-row" style="font-size:11px;color:var(--text-3);padding-top:4px;">
          <span>منها ضريبة مدخلات الخدمات والقيود: <strong>${formatCurrency(serviceInputVAT)}</strong></span>
        </div>
        <div class="tax-row total">
          <span>صافي ضريبة المدخلات المستردة (15%)</span>
          <span class="mono text-good">${formatCurrency(inputVAT)}</span>
        </div>
      </div>

      <!-- Net VAT -->
      <div class="tax-section" style="border:2px solid ${isDue ? "var(--bad)" : "var(--good)"};">
        <h3 style="font-size:15px; margin-bottom:16px; font-weight:700;">
          ⚖️ صافي الضريبة المستحقة
        </h3>
        <div class="tax-row">
          <span>صافي ضريبة المخرجات</span>
          <span class="mono">${formatCurrency(outputVAT)}</span>
        </div>
        <div class="tax-row">
          <span>( - ) صافي ضريبة المدخلات القابلة للاسترداد</span>
          <span class="mono text-good">- ${formatCurrency(inputVAT)}</span>
        </div>
        <div class="tax-row payable">
          <span>${isDue ? "💰 الضريبة المستحقة الدفع لـ ZATCA" : isRefund ? "💚 مبلغ مسترد من ZATCA" : "✓ الحساب متوازن"}</span>
          <div style="display:flex; align-items:center; gap:12px;">
            <span class="mono" style="font-size:20px; color:${isDue?"var(--bad)":"var(--good)"};">
              ${formatCurrency(Math.abs(netVAT))}
            </span>
            <span class="${isDue ? "tax-badge-due" : "tax-badge-refund"}">
              ${isDue ? "مستحق" : isRefund ? "مسترد" : "متوازن"}
            </span>
          </div>
        </div>
      </div>

      <!-- ZATCA Filing Info -->
      <div class="tax-section" style="background:rgba(99,102,241,0.05); border-color:var(--indigo);">
        <h3 style="color:var(--indigo); font-size:14px; margin-bottom:12px;">
          📡 معلومات رفع الإقرار على منصة ZATCA Fatoora
        </h3>
        <div style="font-size:13px; line-height:1.8; color:var(--text-1);">
          <p>• موعد تقديم الإقرار: اليوم الثلاثين من الشهر التالي للفترة الضريبية</p>
          <p>• رابط المنصة: <strong>fatoora.zatca.gov.sa</strong></p>
          <p>• غرامة التأخير: 5% - 25% من مبلغ الضريبة المستحقة</p>
          <p>• يجب مطابقة هذا الإقرار مع سجلات ZATCA eInvoicing Phase 2</p>
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════
// TAB 2: Zakat (الزكاة)
// ═══════════════════════════════════════════════
function renderZakat() {
  const body = document.getElementById("vz-body");
  if (!body) return;

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
  tab(t) {
    activeTab = t;
    document.querySelectorAll(".vz-tab").forEach(b => b.classList.remove("active"));
    document.getElementById(`vzt-${t}`)?.classList.add("active");
    renderTab();
  },
  async reload() {
    const body = document.getElementById("vz-body");
    if (body) body.innerHTML = `<div class="page-loading"><div class="loading-spinner"></div></div>`;
    await loadAllData();
  }
};
