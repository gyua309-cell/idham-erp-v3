// ============================================================
// IDHAM ERP — كشف حساب العميل المطور الشامل
// Customer Statement & Aging of Receivables Module
// ============================================================
import { COLS, getAll, getById, query, where, orderBy, getDocs, db, COMPANY_ID, doc, getDoc } from "../utils/db.js";
import { formatCurrency, formatDate, debounce } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

let allCustomers = [];
let selectedCustomer = null;
let rawStatementEvents = [];
let customerStatementData = [];
let statementKPIs = { opening: 0, debit: 0, credit: 0, returns: 0, balance: 0 };
let agingBuckets = { current: 0, days30: 0, days60: 0, days90Plus: 0 };
let filterFrom = "";
let filterTo = "";
let activeTypeFilter = "all"; // 'all' | 'invoice' | 'receipt' | 'return'

const todayStr = () => new Date().toISOString().slice(0, 10);
const monthAgoStr = () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); };
const yearStartStr = () => `${new Date().getFullYear()}-01-01`;

export async function render(container, user) {
  filterFrom = monthAgoStr();
  filterTo = todayStr();
  
  container.innerHTML = `
    <div class="filterbar no-print">
      <div style="position:relative; min-width:280px; flex:1; max-width:360px;">
        <input type="text" id="stmt-cust-search" class="input" placeholder="🔍 ابحث عن العميل (الاسم / الهاتف / الكود)..." autocomplete="off" />
        <div id="stmt-cust-results" class="autocomplete-dropdown hidden" style="position:absolute; top:100%; left:0; right:0; z-index:999; max-height:260px; overflow-y:auto; background:var(--bg-card); border:1px solid var(--border); border-radius:8px; box-shadow:var(--shadow-lg);"></div>
      </div>
      
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="stmt-from" class="input" value="${filterFrom}" style="width:135px;" onchange="window.onStmtDateChange()" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="stmt-to" class="input" value="${filterTo}" style="width:135px;" onchange="window.onStmtDateChange()" />
      </div>

      <div style="display:flex; gap:4px;">
        <button class="btn btn-secondary btn-sm" onclick="window.setStmtPeriod('month')">الشهر</button>
        <button class="btn btn-secondary btn-sm" onclick="window.setStmtPeriod('quarter')">الربع</button>
        <button class="btn btn-secondary btn-sm" onclick="window.setStmtPeriod('year')">السنة</button>
        <button class="btn btn-secondary btn-sm" onclick="window.setStmtPeriod('all')">شامل</button>
      </div>

      <div style="margin-right:auto; display:flex; gap:6px; flex-wrap:wrap;">
        <button class="btn btn-secondary" onclick="window.printCustomerStatement()" id="stmt-print-btn" disabled>🖨️ طباعة</button>
        <button class="btn btn-secondary" onclick="window.exportCustomerStatementPDF()" id="stmt-pdf-btn" disabled>📄 تصدير PDF</button>
        <button class="btn btn-secondary" onclick="window.exportCustomerStatementExcel()" id="stmt-excel-btn" disabled>📊 Excel</button>
        <button class="btn btn-primary" style="background:#25D366; border-color:#25D366;" onclick="window.shareCustomerStatementWhatsApp()" id="stmt-wa-btn" disabled>💬 واتساب</button>
        <button class="btn btn-secondary" style="background:rgba(124,58,237,.1); color:#7C3AED; border-color:rgba(124,58,237,.3);" onclick="window.printBalanceConfirmation()" id="stmt-confirm-btn" disabled>📑 مصادقة رصيد</button>
      </div>
    </div>

    <div class="page-content">
      <!-- Customer Info Header Card -->
      <div id="stmt-cust-header" class="card mb-16" style="padding:16px 20px; background:linear-gradient(135deg, var(--bg-card), rgba(99,102,241,0.03)); border:1px solid var(--border-soft);">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:48px; height:48px; border-radius:12px; background:rgba(99,102,241,0.1); color:var(--brand); display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:800;">👤</div>
            <div>
              <h2 id="stmt-cust-name" style="margin:0; font-size:18px; font-weight:800; color:var(--text-0);">اختر عميلاً لعرض كشف الحساب</h2>
              <div id="stmt-cust-sub" style="font-size:12px; color:var(--text-2); margin-top:2px;">قم بالبحث عن العميل بالأعلى لبدء استعراض الحركات المالية وأعمار الديون</div>
            </div>
          </div>
          <div id="stmt-kpi-strip" style="display:flex; gap:12px; flex-wrap:wrap;"></div>
        </div>
      </div>

      <!-- Aging of Receivables (أعمار الديون) Strip -->
      <div id="stmt-aging-strip" class="mb-16" style="display:none;">
        <div style="font-size:12px; font-weight:800; color:var(--text-2); margin-bottom:8px; display:flex; align-items:center; gap:6px;">
          <span>⏳ تحليل أعمار الديون والمستحقات (Aging Analysis):</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px;">
          <div style="padding:12px 14px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.25); border-radius:10px;">
            <div style="font-size:11px; color:#10B981; font-weight:700;">🟢 جارية (0 - 30 يوم)</div>
            <div class="mono" id="aging-current" style="font-size:16px; font-weight:900; color:#10B981; margin-top:3px;">0.00 ر.س</div>
          </div>
          <div style="padding:12px 14px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.25); border-radius:10px;">
            <div style="font-size:11px; color:#F59E0B; font-weight:700;">🟡 معتدلة (31 - 60 يوم)</div>
            <div class="mono" id="aging-30" style="font-size:16px; font-weight:900; color:#F59E0B; margin-top:3px;">0.00 ر.س</div>
          </div>
          <div style="padding:12px 14px; background:var(--bg-card); border:1px solid rgba(249,115,22,0.25); border-radius:10px;">
            <div style="font-size:11px; color:#F97316; font-weight:700;">🟠 متأخرة (61 - 90 يوم)</div>
            <div class="mono" id="aging-60" style="font-size:16px; font-weight:900; color:#F97316; margin-top:3px;">0.00 ر.س</div>
          </div>
          <div style="padding:12px 14px; background:var(--bg-card); border:1px solid rgba(239,68,68,0.25); border-radius:10px;">
            <div style="font-size:11px; color:#EF4444; font-weight:700;">🔴 متعثرة (+90 يوم)</div>
            <div class="mono" id="aging-90" style="font-size:16px; font-weight:900; color:#EF4444; margin-top:3px;">0.00 ر.س</div>
          </div>
        </div>
      </div>

      <!-- Quick Type Filter Buttons -->
      <div id="stmt-type-bar" class="mb-12 no-print" style="display:none; align-items:center; gap:8px;">
        <span style="font-size:12px; font-weight:700; color:var(--text-2);">نوع الحركة:</span>
        <button class="btn btn-primary btn-sm" id="btn-flt-all" onclick="window.setStmtTypeFilter('all')">الكل</button>
        <button class="btn btn-secondary btn-sm" id="btn-flt-inv" onclick="window.setStmtTypeFilter('invoice')">🧾 فواتير فقط</button>
        <button class="btn btn-secondary btn-sm" id="btn-flt-rcpt" onclick="window.setStmtTypeFilter('receipt')">💵 سندات قبض فقط</button>
        <button class="btn btn-secondary btn-sm" id="btn-flt-ret" onclick="window.setStmtTypeFilter('return')">↩️ مردودات فقط</button>
      </div>

      <!-- Statement Ledger Table -->
      <div class="card" id="stmt-table-card">
        <div class="table-container">
          <table class="data-dense" id="stmt-table">
            <thead>
              <tr>
                <th style="width:105px;">التاريخ</th>
                <th style="width:115px;">نوع الحركة</th>
                <th style="width:125px;">رقم المرجع</th>
                <th>البيان والتفاصيل</th>
                <th style="width:115px; text-align:left;">مدين (+)</th>
                <th style="width:115px; text-align:left;">دائن (-)</th>
                <th style="width:125px; text-align:left;">الرصيد المستحق</th>
                <th style="width:85px; text-align:center;" class="no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody id="stmt-tbody">
              <tr>
                <td colspan="8" style="text-align:center; padding:48px; color:var(--text-2);">
                  <div style="font-size:36px; margin-bottom:8px;">📊</div>
                  <div style="font-size:15px; font-weight:700;">الرجاء اختيار العميل من شريط البحث أعلاه</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Drill-down Details Modal -->
    <div class="modal-overlay" id="stmt-detail-modal">
      <div class="modal modal-lg" style="max-width:820px; width:95%;">
        <div class="modal-header">
          <h3 class="modal-title" id="stmt-detail-title">تفاصيل المستند</h3>
          <button class="modal-close" onclick="closeModal('stmt-detail-modal')">×</button>
        </div>
        <div class="modal-body" id="stmt-detail-body" style="padding:20px; max-height:calc(85vh - 140px); overflow-y:auto;"></div>
        <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; padding:14px 20px; background:var(--bg-card); border-top:1px solid var(--border-soft);">
          <div id="stmt-modal-actions" style="display:flex; gap:8px; flex-wrap:wrap;"></div>
          <button class="btn btn-secondary" onclick="closeModal('stmt-detail-modal')">إغلاق</button>
        </div>
      </div>
    </div>
  `;

  await loadCustomerList();
  setupCustomerAutocomplete();
  setupGlobalFunctions();
}

async function loadCustomerList() {
  try {
    allCustomers = await getAll(COLS.customers(), [orderBy("name")]);
  } catch (e) {
    console.warn("Failed to load customers for statement:", e);
  }
}

function setupCustomerAutocomplete() {
  const inp = document.getElementById("stmt-cust-search");
  const res = document.getElementById("stmt-cust-results");
  if (!inp || !res) return;

  inp.addEventListener("input", debounce(() => {
    const q = inp.value.trim().toLowerCase();
    if (!q) { res.classList.add("hidden"); return; }

    const matches = allCustomers.filter(c => 
      (c.name || "").toLowerCase().includes(q) ||
      (c.code || "").toLowerCase().includes(q) ||
      (c.phone || "").includes(q)
    ).slice(0, 15);

    if (!matches.length) {
      res.innerHTML = `<div style="padding:12px; text-align:center; color:var(--text-2); font-size:12px;">لا يوجد نتائج</div>`;
      res.classList.remove("hidden");
      return;
    }

    res.innerHTML = matches.map(c => `
      <div class="autocomplete-item" onclick="window.selectStmtCustomer('${c.id}')" style="padding:10px 14px; border-bottom:1px solid var(--border-soft); cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:700; font-size:13px; color:var(--text-0);">${c.name}</div>
          <div style="font-size:11px; color:var(--text-2);">${c.phone || "—"} • كود: ${c.code || "—"}</div>
        </div>
        <div class="mono" style="font-weight:800; font-size:13px; color:${(c.balance || 0) > 0 ? 'var(--bad)' : 'var(--good)'};">
          ${formatCurrency(c.balance || 0)}
        </div>
      </div>
    `).join("");
    res.classList.remove("hidden");
  }, 200));

  document.addEventListener("click", (e) => {
    if (!inp.contains(e.target) && !res.contains(e.target)) {
      res.classList.add("hidden");
    }
  });
}

function setupGlobalFunctions() {
  window.selectStmtCustomer = async (custId) => {
    document.getElementById("stmt-cust-results")?.classList.add("hidden");
    selectedCustomer = allCustomers.find(c => c.id === custId);
    if (!selectedCustomer) return;

    const inp = document.getElementById("stmt-cust-search");
    if (inp) inp.value = selectedCustomer.name;

    // Enable buttons and show aging & type filter
    ["stmt-print-btn", "stmt-pdf-btn", "stmt-excel-btn", "stmt-wa-btn", "stmt-confirm-btn"].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.disabled = false;
    });

    const agingEl = document.getElementById("stmt-aging-strip");
    const typeEl = document.getElementById("stmt-type-bar");
    if (agingEl) agingEl.style.display = "block";
    if (typeEl) typeEl.style.display = "flex";

    await generateStatementData();
  };

  window.onStmtDateChange = async () => {
    filterFrom = document.getElementById("stmt-from")?.value || "";
    filterTo = document.getElementById("stmt-to")?.value || "";
    if (selectedCustomer) await generateStatementData();
  };

  window.setStmtPeriod = async (period) => {
    if (period === "month") {
      filterFrom = monthAgoStr();
      filterTo = todayStr();
    } else if (period === "quarter") {
      const qd = new Date();
      qd.setMonth(qd.getMonth() - 3);
      filterFrom = qd.toISOString().slice(0, 10);
      filterTo = todayStr();
    } else if (period === "year") {
      filterFrom = yearStartStr();
      filterTo = todayStr();
    } else if (period === "all") {
      filterFrom = "2020-01-01";
      filterTo = todayStr();
    }
    document.getElementById("stmt-from").value = filterFrom;
    document.getElementById("stmt-to").value = filterTo;
    if (selectedCustomer) await generateStatementData();
  };

  window.setStmtTypeFilter = (type) => {
    activeTypeFilter = type;
    ["all", "inv", "rcpt", "ret"].forEach(k => {
      const b = document.getElementById(`btn-flt-${k}`);
      if (b) {
        const isMatched = (k === "all" && type === "all") ||
          (k === "inv" && type === "invoice") ||
          (k === "rcpt" && type === "receipt") ||
          (k === "ret" && type === "return");
        b.className = isMatched ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm";
      }
    });
    renderStatementTable();
  };

  window.previewDocDetail = async (idx) => {
    const item = customerStatementData[idx];
    if (!item || !item.raw) return;

    const titleEl = document.getElementById("stmt-detail-title");
    const bodyEl = document.getElementById("stmt-detail-body");
    const actionsEl = document.getElementById("stmt-modal-actions");

    if (titleEl) {
      titleEl.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <span>${item.typeLabel}</span>
          <span class="mono" style="color:var(--brand); font-weight:800; font-size:14px;">${item.refNo}</span>
        </div>
      `;
    }

    if (actionsEl) actionsEl.innerHTML = "";

    if (item.type === "invoice") {
      let inv = item.raw;
      // Fallback: fetch complete fresh invoice with lines if missing
      if ((!inv.lines || !inv.lines.length) && (!inv.items || !inv.items.length) && inv.id) {
        try {
          const freshSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/salesInvoices`, inv.id));
          if (freshSnap.exists()) {
            inv = { id: freshSnap.id, ...freshSnap.data() };
            item.raw = inv;
          }
        } catch (_) {}
      }

      const lines = inv.lines || inv.items || [];
      const sub = parseFloat(inv.subtotal || 0);
      const discount = parseFloat(inv.totalDiscount || inv.discount || 0);
      const vat = parseFloat(inv.totalVat || inv.vatAmount || 0);
      const grand = parseFloat(inv.totalWithVat || inv.total || 0);

      bodyEl.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px; margin-bottom:16px;">
          <div style="background:var(--bg-card); padding:10px 12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:10.5px; color:var(--text-2);">رقم الفاتورة</div>
            <div class="mono" style="font-weight:800; font-size:13px; color:var(--brand);">${inv.number || inv.invoiceNumber || item.refNo}</div>
          </div>
          <div style="background:var(--bg-card); padding:10px 12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:10.5px; color:var(--text-2);">تاريخ الفاتورة</div>
            <div class="mono" style="font-weight:700; font-size:13px;">${inv.date || item.date}</div>
          </div>
          <div style="background:var(--bg-card); padding:10px 12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:10.5px; color:var(--text-2);">نوع الدفع</div>
            <div style="font-weight:700; font-size:12px;">${inv.paymentMethod === 'cash' ? '💵 نقدي' : '📑 آجل (على الحساب)'}</div>
          </div>
          ${inv.repName ? `
            <div style="background:var(--bg-card); padding:10px 12px; border-radius:8px; border:1px solid var(--border-soft);">
              <div style="font-size:10.5px; color:var(--text-2);">المندوب المسؤول</div>
              <div style="font-weight:700; font-size:12px;">👤 ${inv.repName}</div>
            </div>
          ` : ''}
        </div>

        <div class="table-container mb-16" style="border:1px solid var(--border-soft); border-radius:8px; max-height:280px; overflow-y:auto;">
          <table class="data-dense" style="margin:0; font-size:12px;">
            <thead>
              <tr style="background:var(--bg-2);">
                <th style="width:35px; text-align:center;">#</th>
                <th>الصنف</th>
                <th style="width:65px; text-align:center;">الكمية</th>
                <th style="width:85px; text-align:left;">السعر</th>
                ${discount > 0 ? `<th style="width:70px; text-align:left;">الخصم</th>` : ''}
                <th style="width:75px; text-align:left;">الضريبة</th>
                <th style="width:95px; text-align:left;">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${lines.length ? lines.map((l, i) => {
                const q = parseFloat(l.qty || l.quantity || 0);
                const p = parseFloat(l.unitPrice || l.price || 0);
                const d = parseFloat(l.discount || 0);
                const lineNet = (q * p) - d;
                const lineVat = parseFloat(l.vat || l.vatAmount || (lineNet * 0.15));
                const lineTot = parseFloat(l.totalWithVat || l.total || (lineNet + lineVat));
                return `
                  <tr>
                    <td class="dim" style="text-align:center;">${i + 1}</td>
                    <td><b>${l.name || l.productName || '—'}</b> ${l.code ? `<span class="dim mono" style="font-size:10.5px;">(${l.code})</span>` : ''}</td>
                    <td class="mono" style="text-align:center; font-weight:700;">${q} ${l.unit ? `<small class="dim">${l.unit}</small>` : ''}</td>
                    <td class="mono" style="text-align:left;">${formatCurrency(p)}</td>
                    ${discount > 0 ? `<td class="mono" style="text-align:left; color:var(--bad);">${d > 0 ? formatCurrency(d) : '—'}</td>` : ''}
                    <td class="mono" style="text-align:left; color:var(--text-2); font-size:11px;">${formatCurrency(lineVat)}</td>
                    <td class="mono font-bold" style="text-align:left; color:var(--text-0);">${formatCurrency(lineTot)}</td>
                  </tr>
                `;
              }).join("") : `<tr><td colspan="7" style="text-align:center; padding:16px; color:var(--text-2);">لا توجد بنود تفصيلية</td></tr>`}
            </tbody>
          </table>
        </div>

        <div style="background:linear-gradient(135deg, var(--bg-card), rgba(99,102,241,0.04)); padding:12px 16px; border-radius:8px; border:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; gap:16px; flex-wrap:wrap;">
            <div>
              <div style="font-size:10.5px; color:var(--text-2);">قبل الضريبة</div>
              <div class="mono font-bold" style="font-size:13px;">${formatCurrency(sub || (grand - vat))}</div>
            </div>
            <div>
              <div style="font-size:10.5px; color:var(--text-2);">ضريبة القيمة المضافة (15%)</div>
              <div class="mono font-bold" style="font-size:13px; color:var(--text-1);">${formatCurrency(vat)}</div>
            </div>
            ${discount > 0 ? `
              <div>
                <div style="font-size:10.5px; color:var(--text-2);">الخصم الممنوح</div>
                <div class="mono font-bold" style="font-size:13px; color:var(--bad);">${formatCurrency(discount)}</div>
              </div>
            ` : ''}
          </div>
          <div style="text-align:left;">
            <div style="font-size:11px; font-weight:700; color:var(--brand);">الإجمالي الصافي الشامل</div>
            <div class="mono" style="font-size:18px; font-weight:900; color:var(--brand);">${formatCurrency(grand)}</div>
          </div>
        </div>
      `;

      if (actionsEl) {
        actionsEl.innerHTML = `
          <button class="btn btn-primary" onclick="window.printDocFromStatement(${idx})" style="background:linear-gradient(135deg, #1e3a8a, #2563eb); border:none; display:flex; align-items:center; gap:6px; font-weight:700;">
            <i class="fas fa-print"></i> 🖨️ طباعة الفاتورة الضريبية الرسمية (A4)
          </button>
          <button class="btn btn-secondary" onclick="window.printInvoiceThermalFromStatement(${idx})" style="display:flex; align-items:center; gap:6px;">
            <i class="fas fa-receipt"></i> 🧾 إيصال حراري (80mm)
          </button>
        `;
      }
    } else if (item.type === "receipt") {
      const rcpt = item.raw;
      bodyEl.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:12px; margin-bottom:16px;">
          <div style="background:var(--bg-card); padding:12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:11px; color:var(--text-2);">رقم سند القبض</div>
            <div class="mono font-bold" style="font-size:14px; color:var(--brand);">${rcpt.number || rcpt.code || rcpt.receiptNumber || item.refNo}</div>
          </div>
          <div style="background:var(--bg-card); padding:12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:11px; color:var(--text-2);">تاريخ السند</div>
            <div class="mono font-bold" style="font-size:13px;">${rcpt.date || item.date}</div>
          </div>
          <div style="background:var(--bg-card); padding:12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:11px; color:var(--text-2);">طريقة الاستلام</div>
            <div style="font-weight:800; font-size:13px; color:var(--good);">${rcpt.method === 'cash' ? '💵 نقدي' : '🏦 تحويل بنكي / شيك'}</div>
          </div>
        </div>

        <div style="background:linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02)); padding:16px 20px; border-radius:10px; border:1px solid rgba(16,185,129,0.25); margin-bottom:16px;">
          <div style="font-size:12px; color:var(--text-2); margin-bottom:4px;">المبلغ المقبوض:</div>
          <div class="mono" style="font-size:24px; font-weight:900; color:#059669;">${formatCurrency(rcpt.amount || item.credit || 0)}</div>
        </div>

        <div style="background:var(--bg-card); padding:14px; border-radius:8px; border:1px solid var(--border-soft); line-height:1.8;">
          <div><span style="color:var(--text-2);">البيان / الملاحظات:</span> <b>${rcpt.notes || rcpt.note || "سداد دفعة حساب"}</b></div>
          ${rcpt.repName ? `<div><span style="color:var(--text-2);">المحصل / المندوب:</span> <b>${rcpt.repName}</b></div>` : ''}
          ${rcpt.bankName ? `<div><span style="color:var(--text-2);">الحساب المودع فيه:</span> <b>${rcpt.bankName}</b></div>` : ''}
        </div>
      `;

      if (actionsEl) {
        actionsEl.innerHTML = `
          <button class="btn btn-primary" onclick="window.printDocFromStatement(${idx})" style="background:#059669; border-color:#059669; display:flex; align-items:center; gap:6px; font-weight:700;">
            <i class="fas fa-print"></i> 🖨️ طباعة سند القبض
          </button>
        `;
      }
    } else if (item.type === "return") {
      const ret = item.raw;
      const lines = ret.lines || ret.items || [];
      bodyEl.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px; margin-bottom:16px;">
          <div style="background:var(--bg-card); padding:10px 12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:10.5px; color:var(--text-2);">رقم إشعار المردود</div>
            <div class="mono" style="font-weight:800; font-size:13px; color:var(--brand);">${ret.number || ret.creditNoteNumber || item.refNo}</div>
          </div>
          <div style="background:var(--bg-card); padding:10px 12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:10.5px; color:var(--text-2);">التاريخ</div>
            <div class="mono" style="font-weight:700; font-size:13px;">${ret.date || item.date}</div>
          </div>
          <div style="background:var(--bg-card); padding:10px 12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:10.5px; color:var(--text-2);">قيمة المردود الإجمالية</div>
            <div class="mono font-bold" style="font-size:14px; color:var(--bad);">${formatCurrency(ret.totalWithVat || ret.total || item.credit || 0)}</div>
          </div>
        </div>

        <div class="table-container mb-16" style="border:1px solid var(--border-soft); border-radius:8px; max-height:250px; overflow-y:auto;">
          <table class="data-dense" style="margin:0; font-size:12px;">
            <thead>
              <tr style="background:var(--bg-2);">
                <th>الصنف المرتجع</th>
                <th style="width:70px; text-align:center;">الكمية</th>
                <th style="width:90px; text-align:left;">السعر</th>
                <th style="width:100px; text-align:left;">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${lines.map(l => `
                <tr>
                  <td><b>${l.productName || l.name || '—'}</b></td>
                  <td class="mono" style="text-align:center;">${l.qty || 1}</td>
                  <td class="mono" style="text-align:left;">${formatCurrency(l.unitPrice || l.price || 0)}</td>
                  <td class="mono font-bold" style="text-align:left;">${formatCurrency((l.qty || 1) * (l.unitPrice || l.price || 0))}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;

      if (actionsEl) {
        actionsEl.innerHTML = `
          <button class="btn btn-primary" onclick="window.printDocFromStatement(${idx})" style="background:#dc2626; border-color:#dc2626; display:flex; align-items:center; gap:6px; font-weight:700;">
            <i class="fas fa-print"></i> 🖨️ طباعة إشعار المردود
          </button>
        `;
      }
    } else if (item.type === "journal") {
      const je = item.raw;
      const lines = je.lines || [];
      bodyEl.innerHTML = `
        <div style="background:var(--bg-card); padding:14px; border-radius:8px; border:1px solid var(--border-soft); margin-bottom:14px; line-height:1.8;">
          <div><span style="color:var(--text-2);">رقم القيد:</span> <b class="mono">${je.entryNumber || je.code || item.refNo}</b></div>
          <div><span style="color:var(--text-2);">التاريخ:</span> <b class="mono">${je.date || item.date}</b></div>
          <div><span style="color:var(--text-2);">البيان:</span> <b>${je.description || item.notes || "—"}</b></div>
        </div>
        <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px;">
          <table class="data-dense" style="margin:0; font-size:12px;">
            <thead>
              <tr style="background:var(--bg-2);">
                <th>الحساب</th>
                <th style="width:100px; text-align:left;">مدين</th>
                <th style="width:100px; text-align:left;">دائن</th>
                <th>ملاحظة</th>
              </tr>
            </thead>
            <tbody>
              ${lines.map(l => `
                <tr>
                  <td><b>${l.accountName || l.accountCode || '—'}</b></td>
                  <td class="mono" style="text-align:left; color:#1d4ed8;">${l.debit > 0 ? formatCurrency(l.debit) : '—'}</td>
                  <td class="mono" style="text-align:left; color:#059669;">${l.credit > 0 ? formatCurrency(l.credit) : '—'}</td>
                  <td style="font-size:11px; color:var(--text-2);">${l.note || '—'}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;

      if (actionsEl) {
        actionsEl.innerHTML = `
          <button class="btn btn-primary" onclick="window.printDocFromStatement(${idx})" style="display:flex; align-items:center; gap:6px; font-weight:700;">
            <i class="fas fa-print"></i> 🖨️ طباعة سند القيد
          </button>
        `;
      }
    } else {
      bodyEl.innerHTML = `<pre style="background:var(--bg-2); padding:12px; border-radius:8px;">${JSON.stringify(item.raw, null, 2)}</pre>`;
    }

    openModal("stmt-detail-modal");
  };

  window.printDocFromStatement = async (idx) => {
    const item = customerStatementData[idx];
    if (!item || !item.raw) return;

    try {
      if (item.type === "invoice") {
        if (typeof window.printInvoice !== "function") {
          try {
            await import("./sales-invoices.js?v=50.0");
          } catch (e) {
            console.error("Failed to load sales-invoices module:", e);
          }
        }
        if (typeof window.printInvoice === "function") {
          window.printInvoice(item.raw);
        } else {
          window.printInvoiceThermalFromStatement(idx);
        }
      } else if (item.type === "receipt") {
        if (typeof window.printSingleReceiptVoucher !== "function") {
          try {
            await import("./receipts.js?v=44.0");
          } catch (e) {
            console.error("Failed to load receipts module:", e);
          }
        }
        if (typeof window.printSingleReceiptVoucher === "function") {
          window.printSingleReceiptVoucher(item.raw.id || item.raw.receiptNumber);
        }
      } else if (item.type === "return") {
        if (typeof window.printSalesReturn !== "function") {
          try {
            await import("./sales-returns.js?v=39.0");
          } catch (e) {
            console.error("Failed to load sales-returns module:", e);
          }
        }
        if (typeof window.printSalesReturn === "function") {
          window.printSalesReturn(item.raw.id || item.raw.creditNoteNumber);
        }
      } else if (item.type === "journal") {
        if (typeof window.printSingleJournalVoucher !== "function") {
          try {
            await import("./journal-entries.js?v=44.0");
          } catch (e) {
            console.error("Failed to load journal-entries module:", e);
          }
        }
        if (typeof window.printSingleJournalVoucher === "function") {
          window.printSingleJournalVoucher(item.raw.id);
        }
      }
    } catch (err) {
      console.error("Error printing document from statement:", err);
      window.showToast?.("حدث خطأ أثناء محاولة طباعة المستند", "error");
    }
  };

  window.printInvoiceThermalFromStatement = (idx) => {
    const item = customerStatementData[idx];
    if (!item || !item.raw) return;
    const inv = item.raw;

    const co = window.ERP_COMPANY || { name: "مؤسسة إدهام للمواد الغذائية", vatNumber: "312448150500003", phone: "0549141648" };
    const lines = inv.lines || inv.items || [];
    const grand = parseFloat(inv.totalWithVat || inv.total || 0);
    const vat = parseFloat(inv.totalVat || 0);
    const sub = parseFloat(inv.subtotal || (grand - vat));

    const win = window.open("", "_blank", "width=400,height=600");
    win.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة مبسطة حرارية — ${inv.number || inv.invoiceNumber || item.refNo}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { font-family: 'Cairo', monospace, sans-serif; width: 72mm; margin: 0 auto; padding: 10px 4px; font-size: 11px; color: #000; line-height: 1.4; }
          .text-center { text-align: center; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .bold { font-weight: bold; }
          .flex-between { display: flex; justify-content: space-between; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; margin: 6px 0; }
          th, td { padding: 4px 2px; text-align: right; }
          th { border-bottom: 1px solid #000; }
          .total-row { font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body onload="window.print();">
        <div class="text-center bold" style="font-size:14px;">${co.name}</div>
        <div class="text-center" style="font-size:10px;">الرقم الضريبي: ${co.vatNumber || '—'}</div>
        <div class="text-center" style="font-size:10px;">الهاتف: ${co.phone || '—'}</div>
        <div class="divider"></div>
        <div class="text-center bold">فاتورة ضريبية مبسطة</div>
        <div class="flex-between"><span>رقم الفاتورة:</span><span class="bold">${inv.number || inv.invoiceNumber || item.refNo}</span></div>
        <div class="flex-between"><span>التاريخ:</span><span>${inv.date || item.date}</span></div>
        <div class="flex-between"><span>العميل:</span><span>${inv.customerName || selectedCustomer?.name || '—'}</span></div>
        ${inv.repName ? `<div class="flex-between"><span>المندوب:</span><span>${inv.repName}</span></div>` : ''}
        <div class="divider"></div>
        <table>
          <thead>
            <tr>
              <th>الصنف</th>
              <th style="text-align:center;">الكمية</th>
              <th style="text-align:left;">السعر</th>
              <th style="text-align:left;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${lines.map(l => `
              <tr>
                <td>${l.name || l.productName}</td>
                <td style="text-align:center;">${l.qty || l.quantity}</td>
                <td style="text-align:left;">${formatCurrency(l.unitPrice || l.price || 0)}</td>
                <td style="text-align:left;">${formatCurrency((l.qty || l.quantity || 1) * (l.unitPrice || l.price || 0))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="divider"></div>
        <div class="flex-between"><span>المجموع قبل الضريبة:</span><span>${formatCurrency(sub)}</span></div>
        <div class="flex-between"><span>ضريبة القيمة المضافة (15%):</span><span>${formatCurrency(vat)}</span></div>
        <div class="divider"></div>
        <div class="flex-between total-row" style="font-size:13px;"><span>الإجمالي النهائي:</span><span>${formatCurrency(grand)}</span></div>
        <div class="divider"></div>
        <div class="text-center" style="font-size:10px; margin-top:8px;">شكراً لتعاملكم معنا!</div>
      </body>
      </html>
    `);
    win.document.close();
  };

  window.printCustomerStatement = () => {
    if (!selectedCustomer) return;
    window.print();
  };

  window.exportCustomerStatementPDF = () => {
    if (!selectedCustomer) return;
    window.print();
  };

  window.exportCustomerStatementExcel = () => {
    if (!selectedCustomer || !customerStatementData.length) return;
    const exportData = customerStatementData.map(r => ({
      "التاريخ": r.date,
      "نوع الحركة": r.typeLabel,
      "رقم المرجع": r.refNo,
      "البيان": r.notes,
      "مدين": r.debit || 0,
      "دائن": r.credit || 0,
      "الرصيد": r.runningBalance
    }));
    exportToExcel(exportData, `كشف_حساب_${selectedCustomer.name.replace(/\s+/g, '_')}`);
  };

  window.shareCustomerStatementWhatsApp = () => {
    if (!selectedCustomer) return;
    const phone = (selectedCustomer.phone || "").replace(/[^0-9]/g, "");
    const cleanPhone = phone.startsWith("0") ? "966" + phone.slice(1) : (phone.startsWith("966") ? phone : "966" + phone);
    
    const msg = `مرحباً ${selectedCustomer.name}،\nمرفق ملخص كشف الحساب الخاص بكم لدى ${window.ERP_COMPANY?.name || "مؤسسة إدهام للمواد الغذائية"}:\n\n` +
      `📅 الفترة: من ${filterFrom} إلى ${filterTo}\n` +
      `💵 إجمالي المسحوبات (مدين): ${formatCurrency(statementKPIs.debit)}\n` +
      `💳 إجمالي المدفوعات (دائن): ${formatCurrency(statementKPIs.credit)}\n` +
      `💰 الرصيد الحالي المستحق: ${formatCurrency(statementKPIs.balance)}\n\n` +
      `شاكرين ومقدرين تعاملكم معنا!`;

    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  window.printBalanceConfirmation = () => {
    if (!selectedCustomer) return;
    const win = window.open("", "_blank");
    const coName = window.ERP_COMPANY?.name || "مؤسسة إدهام للمواد الغذائية";
    win.document.write(`
      <html dir="rtl">
      <head>
        <title>خطاب مصادقة رصيد — ${selectedCustomer.name}</title>
        <style>
          body { font-family:'Cairo',sans-serif; padding:40px; line-height:1.8; color:#1e293b; }
          .header { text-align:center; border-bottom:2px solid #334155; padding-bottom:20px; margin-bottom:30px; }
          .box { border:1px solid #cbd5e1; padding:20px; border-radius:8px; margin:20px 0; background:#f8fafc; }
          .signatures { display:flex; justify-content:space-between; margin-top:80px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${coName}</h2>
          <h3>خطاب مصادقة رصيد (Balance Confirmation)</h3>
        </div>
        <p>التاريخ: <b>${todayStr()}</b></p>
        <p>السادة / <b>${selectedCustomer.name}</b> المحترمين</p>
        <p>تحية طيبة وبعد،،،</p>
        <p>يرجى التكرم بمطابقة رصيد حسابكم المسجل بدفاترنا حتى تاريخ <b>${filterTo}</b>، حيث يظهر الحساب بالرصيد التالي:</p>
        
        <div class="box">
          <p style="font-size:18px; text-align:center;">
            الرصيد المستحق: <b>${formatCurrency(statementKPIs.balance)}</b>
          </p>
        </div>

        <p>في حال وجود أي ملاحظات أو اختلاف في الرصيد، يرجى إفادتنا خلال أسبوع من تاريخه. شاكرين حسن تعاونكم.</p>

        <div class="signatures">
          <div><b>الختم والتوقيع (الشركة)</b><br><br>____________________</div>
          <div><b>المصادقة والاعتماد (العميل)</b><br><br>____________________</div>
        </div>
        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `);
    win.document.close();
  };
}

async function generateStatementData() {
  if (!selectedCustomer) return;

  const nameEl = document.getElementById("stmt-cust-name");
  const subEl = document.getElementById("stmt-cust-sub");
  const kpiEl = document.getElementById("stmt-kpi-strip");

  if (nameEl) nameEl.textContent = selectedCustomer.name;
  if (subEl) subEl.textContent = `كود: ${selectedCustomer.code || "—"} | الجوال: ${selectedCustomer.phone || "—"} | المندوب: ${selectedCustomer.repName || "—"} | المنطقة: ${selectedCustomer.zone || "—"}`;

  const custName = (selectedCustomer.name || "").trim().toLowerCase();

  // 1. Fetch matching COA accounts for this customer
  const coaSnap = await getAll(COLS.chartOfAccounts(), [where("sourceEntityId", "==", selectedCustomer.id)]).catch(() => []);
  const matchedAccCodes = new Set();
  const matchedAccIds = new Set();
  coaSnap.forEach(d => {
    matchedAccIds.add(d.id);
    if (d.code) matchedAccCodes.add(d.code);
  });

  // Fetch all transactions for customer
  const [invoices, receipts, returns, journalEntries] = await Promise.all([
    getAll(COLS.salesInvoices(), [where("customerId", "==", selectedCustomer.id)]).catch(() => []),
    getAll(COLS.receipts(),      [where("targetId", "==", selectedCustomer.id)]).catch(() => []),
    getAll(COLS.salesReturns(),   [where("customerId", "==", selectedCustomer.id)]).catch(() => []),
    getAll(COLS.journalEntries()).catch(() => [])
  ]);

  // Combine and sort by date
  const allEvents = [];

  invoices.forEach(inv => {
    const tot = parseFloat(inv.totalWithVat || inv.total || 0);
    allEvents.push({
      date: inv.date || todayStr(),
      type: "invoice",
      typeLabel: "🧾 فاتورة بيع",
      refNo: inv.number || inv.invoiceNumber || inv.id,
      notes: inv.notes || `فاتورة مبيعات (${(inv.lines||[]).length} أصناف)`,
      debit: tot,
      credit: 0,
      raw: inv
    });
  });

  receipts.forEach(rcpt => {
    const amt = parseFloat(rcpt.amount || 0);
    allEvents.push({
      date: rcpt.date || todayStr(),
      type: "receipt",
      typeLabel: "💵 سند قبض",
      refNo: rcpt.receiptNumber || rcpt.number || rcpt.code || rcpt.id,
      notes: rcpt.notes || `سداد دفعة حساب (${rcpt.method === 'cash' ? 'نقدي' : 'بنكي'})`,
      debit: 0,
      credit: amt,
      raw: rcpt
    });
  });

  returns.forEach(ret => {
    const tot = parseFloat(ret.totalWithVat || ret.total || 0);
    allEvents.push({
      date: ret.date || todayStr(),
      type: "return",
      typeLabel: "↩️ مردود مبيعات",
      refNo: ret.number || ret.creditNoteNumber || ret.id,
      notes: ret.notes || "إشعار دائن مردودات",
      debit: 0,
      credit: tot,
      raw: ret
    });
  });

  // 4. Manual Journal Entries
  journalEntries.forEach((je, jeIdx) => {
    if (je.status === "cancelled" || je.isReversed) return;
    
    const st = (je.sourceType || "").toLowerCase();
    const rt = (je.refType || "").toLowerCase();
    const desc = (je.description || "").toLowerCase();

    // Exclude ALL auto-generated journal entries (sales, invoices, receipts, returns, cogs)
    const isAutoGenerated = 
      st === "salesinvoice" || st === "sales" || st === "receipt" || st === "salesreturn" || 
      st === "sales_return" || st === "salescogs" || st === "cogs" || st === "salesreturncogs" || 
      st === "salesinvoice_cogs" || st === "collection" || st === "expense" || st === "supplierpayment" ||
      rt.includes("sales") || rt.includes("receipt") || rt.includes("invoice") || rt.includes("return") ||
      desc.includes("مبيعات") || desc.includes("فاتورة") || desc.includes("سند قبض") || 
      desc.includes("مرتجع") || desc.includes("إشعار دائن") || desc.includes("تصفية");

    if (isAutoGenerated) return;
  

    (je.lines || []).forEach((line, lIdx) => {
      const lAccId = line.accountId;
      const lAccCode = line.accountCode;
      const lAccName = (line.accountName || "").trim().toLowerCase();

      const isMatch = (lAccId && matchedAccIds.has(lAccId)) ||
                      (lAccCode && matchedAccCodes.has(lAccCode)) ||
                      (custName && lAccName && lAccName === custName);

      if (isMatch) {
        const dAmt = parseFloat(line.debit || 0);
        const cAmt = parseFloat(line.credit || 0);
        if (dAmt === 0 && cAmt === 0) return;

        const isOpening = (je.description || "").includes("افتتاحي") || (line.note || "").includes("افتتاحي") || je.sourceType === "opening";

        allEvents.push({
          date: je.date || todayStr(),
          type: "journal",
          typeLabel: isOpening ? "⚖️ قيد افتتاحى" : "📝 قيد يومية",
          refNo: je.entryNumber || je.number || `JE-${jeIdx}`,
          notes: je.description || line.note || line.accountName || "قيد محاسبي مرحل",
          debit: dAmt,
          credit: cAmt,
          raw: je
        });
      }
    });
  });

  allEvents.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  rawStatementEvents = allEvents;

  // Calculate Aging of Unpaid Invoices
  calculateAging(invoices, receipts);

  // Calculate opening balance before filterFrom
  let openingBalance = parseFloat(selectedCustomer.openingBalance || 0);
  allEvents.forEach(e => {
    if (e.date < filterFrom) {
      openingBalance += (e.debit - e.credit);
    }
  });

  // Filter within date range
  const filteredEvents = allEvents.filter(e => e.date >= filterFrom && e.date <= filterTo);

  let runningBalance = openingBalance;
  let totalDebit = 0;
  let totalCredit = 0;

  customerStatementData = [];

  // Opening balance row
  if (openingBalance !== 0 || filteredEvents.length > 0) {
    customerStatementData.push({
      date: filterFrom,
      type: "opening",
      typeLabel: "⚖️ رصيد افتتاحي",
      refNo: "—",
      notes: "رصيد سابق قبل الفترة المحددة",
      debit: openingBalance > 0 ? openingBalance : 0,
      credit: openingBalance < 0 ? Math.abs(openingBalance) : 0,
      runningBalance: openingBalance
    });
  }

  filteredEvents.forEach(e => {
    runningBalance += (e.debit - e.credit);
    totalDebit += e.debit;
    totalCredit += e.credit;
    customerStatementData.push({
      ...e,
      runningBalance
    });
  });

  statementKPIs = {
    opening: openingBalance,
    debit: totalDebit,
    credit: totalCredit,
    balance: runningBalance
  };

  // Render KPIs
  if (kpiEl) {
    kpiEl.innerHTML = `
      <div style="text-align:center; padding:6px 12px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:8px;">
        <div style="font-size:10px; color:var(--text-2);">الرصيد الافتتاحي</div>
        <div class="mono" style="font-size:13px; font-weight:800;">${formatCurrency(openingBalance)}</div>
      </div>
      <div style="text-align:center; padding:6px 12px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:8px;">
        <div style="font-size:10px; color:var(--text-2);">المسحوبات (مدين)</div>
        <div class="mono" style="font-size:13px; font-weight:800; color:var(--bad);">+ ${formatCurrency(totalDebit)}</div>
      </div>
      <div style="text-align:center; padding:6px 12px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:8px;">
        <div style="font-size:10px; color:var(--text-2);">المدفوعات (دائن)</div>
        <div class="mono" style="font-size:13px; font-weight:800; color:var(--good);">- ${formatCurrency(totalCredit)}</div>
      </div>
      <div style="text-align:center; padding:6px 14px; background:linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05)); border:1.5px solid var(--brand); border-radius:8px;">
        <div style="font-size:10.5px; font-weight:700; color:var(--brand);">الرصيد النهائي المستحق</div>
        <div class="mono" style="font-size:15px; font-weight:900; color:${runningBalance > 0 ? 'var(--bad)' : 'var(--good)'};">${formatCurrency(runningBalance)}</div>
      </div>
    `;
  }

  renderStatementTable();
}

function calculateAging(invoices, receipts) {
  const today = new Date();
  let remainingReceipts = receipts.reduce((s, r) => s + parseFloat(r.amount || 0), 0);

  let current = 0;
  let days30 = 0;
  let days60 = 0;
  let days90Plus = 0;

  // Sort invoices oldest first for FIFO allocation
  const sortedInvs = [...invoices].sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  sortedInvs.forEach(inv => {
    let invTotal = parseFloat(inv.totalWithVat || inv.total || 0);
    if (remainingReceipts >= invTotal) {
      remainingReceipts -= invTotal;
      invTotal = 0;
    } else {
      invTotal -= remainingReceipts;
      remainingReceipts = 0;
    }

    if (invTotal > 0 && inv.date) {
      const invDate = new Date(inv.date);
      const diffDays = Math.floor((today - invDate) / (1000 * 60 * 60 * 24));

      if (diffDays <= 30) current += invTotal;
      else if (diffDays <= 60) days30 += invTotal;
      else if (diffDays <= 90) days60 += invTotal;
      else days90Plus += invTotal;
    }
  });

  const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = formatCurrency(v); };
  setT("aging-current", current);
  setT("aging-30", days30);
  setT("aging-60", days60);
  setT("aging-90", days90Plus);
}

function renderStatementTable() {
  const tbody = document.getElementById("stmt-tbody");
  if (!tbody) return;

  let displayData = customerStatementData;
  if (activeTypeFilter !== "all") {
    displayData = customerStatementData.filter(r => r.type === "opening" || r.type === activeTypeFilter);
  }

  if (!displayData.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد حركات مالية مسجلة للعميل خلال هذه الفترة</td></tr>`;
    return;
  }

  tbody.innerHTML = displayData.map((r, i) => `
    <tr style="${r.type === 'opening' ? 'background:rgba(99,102,241,0.04); font-weight:700;' : ''}">
      <td class="mono font-semibold">${r.date}</td>
      <td><span class="badge neutral" style="font-size:11px;">${r.typeLabel}</span></td>
      <td class="mono" style="color:var(--brand); font-weight:700; ${r.type !== 'opening' ? 'cursor:pointer;' : ''}" ${r.type !== 'opening' ? `onclick="window.previewDocDetail(${i})" title="انقر لعرض وطباعة التفاصيل"` : ''}>
        ${r.type !== 'opening' ? `<span style="text-decoration:underline; text-underline-offset:3px;">${r.refNo}</span>` : r.refNo}
      </td>
      <td style="font-size:12px; color:var(--text-1);">${r.notes}</td>
      <td class="mono" style="text-align:left; color:${r.debit > 0 ? 'var(--bad)' : 'var(--text-dim)'}; font-weight:${r.debit > 0 ? '700' : 'normal'};">
        ${r.debit > 0 ? formatCurrency(r.debit) : '—'}
      </td>
      <td class="mono" style="text-align:left; color:${r.credit > 0 ? 'var(--good)' : 'var(--text-dim)'}; font-weight:${r.credit > 0 ? '700' : 'normal'};">
        ${r.credit > 0 ? formatCurrency(r.credit) : '—'}
      </td>
      <td class="mono font-bold" style="text-align:left; font-size:13px; color:${r.runningBalance > 0 ? 'var(--bad)' : 'var(--good)'};">
        ${formatCurrency(r.runningBalance)}
      </td>
      <td style="text-align:center; white-space:nowrap;" class="no-print">
        ${r.type !== 'opening' ? `
          <div style="display:inline-flex; gap:4px; align-items:center; justify-content:center;">
            <button class="btn btn-icon sm btn-ghost" onclick="window.previewDocDetail(${i})" title="استعراض تفاصيل المستند">
              👁️
            </button>
            <button class="btn btn-icon sm btn-ghost" onclick="window.printDocFromStatement(${i})" title="طباعة فورية" style="color:var(--brand);">
              🖨️
            </button>
          </div>
        ` : ''}
      </td>
    </tr>
  `).join("");
}
