// ============================================================
// IDHAM ERP — Broker Commissions Ledger & Statement Module
// كشف حساب ومستحقات الوسيط التجاري — زياد
// ============================================================

import { getById, getAll, query, where, orderBy, getDocs, create, update, COLS } from "../utils/db.js";
import { formatCurrency, formatDate, todayString } from "../utils/formatters.js";
import { exportToExcel } from "../utils/excel.js";

const showToast = (...a) => (window.showToast ? window.showToast(...a) : console.log(...a));

let _allBrokerInvoices = [];
let _filteredInvoices = [];
let _brokerSummary = {
  totalSalesTaxable: 0,
  totalCommissionCalculated: 0,
  totalCommissionEarned: 0,
  totalCommissionPending: 0,
  totalCommissionPaidOut: 0,
  currentNetPayable: 0
};
let _activeBrokerName = "زياد";

/**
 * دالة العرض الرئيسية لكشف حساب الوسيط
 */
export async function render(container) {
  container.innerHTML = `
    <div style="padding: 16px 20px; max-width: 1400px; margin: 0 auto;">
      
      <!-- Top Title & Action Bar -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; margin-bottom: 18px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #004d80 0%, #0284c7 100%); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);">
              💼
            </div>
            <div>
              <h2 style="margin: 0; font-size: 20px; font-weight: 900; color: var(--text-0, #0f172a);">كشف حساب ومستحقات الوسيط — زياد</h2>
              <div style="font-size: 12.5px; color: var(--text-2, #64748b); font-weight: 600; margin-top: 2px;">
                متابعة مبيعات العملاء المرتبطين، حساب نسبة (1%) قبل الضريبة، توليد القيود التلقائية، وإدارة صرف المستحقات
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Action Buttons -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="window.openPayBrokerCommissionModal()" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 800; background: #059669; border-color: #059669;">
            <span>💳</span>
            <span>صرف عمولة للوسيط (سند صرف)</span>
          </button>
          <button class="btn btn-secondary" onclick="window.exportBrokerStatementExcel()" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
            <span>📥</span>
            <span>تصدير إكسيل</span>
          </button>
          <button class="btn btn-secondary" onclick="window.printBrokerStatementA4()" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
            <span>🖨️</span>
            <span>طباعة كشف الحساب A4</span>
          </button>
          <button class="btn btn-ghost" onclick="window.reloadBrokerStatementData()" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
            <span>🔄</span>
            <span>تحديث</span>
          </button>
        </div>
      </div>

      <!-- Broker Profile & Integration Info Banner -->
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%); border: 1.5px solid #bae6fd; border-radius: 14px; padding: 14px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #004d80; color: #fff; font-size: 22px; display: flex; align-items: center; justify-content: center; font-weight: 900;">
            ز
          </div>
          <div>
            <div style="font-size: 15px; font-weight: 900; color: #004d80; display: flex; align-items: center; gap: 8px;">
              <span>الوسيط التجاري: زياد</span>
              <span style="font-size: 11px; background: #0284c7; color: #fff; padding: 2px 10px; border-radius: 20px; font-weight: 800;">نسبة العمولة: 1.0%</span>
            </div>
            <div style="font-size: 12px; color: #334155; margin-top: 3px; font-weight: 600;">
              العميل المرتبط حالياً: <strong style="color: #0f172a;">مؤسسة عماد ابراهيم الفت حلواني لتقديم الوجبات</strong> &nbsp;|&nbsp; بداية سريان الاتفاق: <strong style="color: #0284c7;">من الفاتورة الأخيرة INV-042070 وما بعدها</strong> &nbsp;|&nbsp; شرط الاستحقاق: <strong style="color: #059669;">فور إصدار فاتورة المبيعات (استحقاق فوري ومباشر)</strong>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 16px; font-size: 11.5px; font-weight: 700; color: #475569;">
          <div style="background: #fff; padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1;">
            حساب الالتزام بالشجرة: <strong style="color: #004d80; font-family: monospace;">2-1-4-2 (مستحقات عمولات الوسطاء - زياد)</strong>
          </div>
          <div style="background: #fff; padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1;">
            حساب المصروف بالشجرة: <strong style="color: #004d80; font-family: monospace;">5-4-10 (مصروفات عمولات وسيط)</strong>
          </div>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div id="broker-kpis-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; margin-bottom: 20px;">
        <div class="card" style="padding: 14px 16px; border-radius: 12px; border-right: 4px solid #0284c7;">
          <div style="font-size: 11.5px; font-weight: 700; color: var(--text-2);">إجمالي المبيعات قبل الضريبة</div>
          <div id="kpi-broker-sales" style="font-size: 20px; font-weight: 900; color: #004d80; margin-top: 4px; font-family: monospace;">—</div>
          <div style="font-size: 10.5px; color: var(--text-dim); margin-top: 2px;">الأساس الخاضع للعمولة (1%)</div>
        </div>

        <div class="card" style="padding: 14px 16px; border-radius: 12px; border-right: 4px solid #f59e0b;">
          <div style="font-size: 11.5px; font-weight: 700; color: var(--text-2);">إجمالي العمولات المحسوبة</div>
          <div id="kpi-broker-total-comm" style="font-size: 20px; font-weight: 900; color: #d97706; margin-top: 4px; font-family: monospace;">—</div>
          <div style="font-size: 10.5px; color: var(--text-dim); margin-top: 2px;">شاملة المسددة والمعلقة</div>
        </div>

        <div class="card" style="padding: 14px 16px; border-radius: 12px; border-right: 4px solid #10b981;">
          <div style="font-size: 11.5px; font-weight: 700; color: var(--text-2);">العمولات المكتسبة (المسددة)</div>
          <div id="kpi-broker-earned" style="font-size: 20px; font-weight: 900; color: #059669; margin-top: 4px; font-family: monospace;">—</div>
          <div style="font-size: 10.5px; color: #059669; margin-top: 2px; font-weight: 700;">تم تحصيل فواتيرها وقيدت محاسبياً</div>
        </div>

        <div class="card" style="padding: 14px 16px; border-radius: 12px; border-right: 4px solid #6366f1;">
          <div style="font-size: 11.5px; font-weight: 700; color: var(--text-2);">العمولات المعلقة (بانتظار السداد)</div>
          <div id="kpi-broker-pending" style="font-size: 20px; font-weight: 900; color: #4f46e5; margin-top: 4px; font-family: monospace;">—</div>
          <div style="font-size: 10.5px; color: var(--text-dim); margin-top: 2px;">تتحول لمكتسبة فور سداد العميل</div>
        </div>

        <div class="card" style="padding: 14px 16px; border-radius: 12px; border-right: 4px solid #ec4899;">
          <div style="font-size: 11.5px; font-weight: 700; color: var(--text-2);">العمولات المصروفة لزياد</div>
          <div id="kpi-broker-paidout" style="font-size: 20px; font-weight: 900; color: #db2777; margin-top: 4px; font-family: monospace;">—</div>
          <div style="font-size: 10.5px; color: var(--text-dim); margin-top: 2px;">بموجب سندات صرف معتمدة</div>
        </div>

        <div class="card" style="padding: 14px 16px; border-radius: 12px; background: linear-gradient(135deg, #004d80 0%, #0369a1 100%); color: #fff; border-right: 4px solid #38bdf8;">
          <div style="font-size: 11.5px; font-weight: 800; color: #bae6fd;">صافي الرصيد المستحق لزياد الآن</div>
          <div id="kpi-broker-net-due" style="font-size: 22px; font-weight: 900; color: #facc15; margin-top: 4px; font-family: monospace;">—</div>
          <div style="font-size: 10.5px; color: #e0f2fe; margin-top: 2px;">المكتسب المتاح للصرف الفوري</div>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="card" style="padding: 12px 16px; border-radius: 12px; margin-bottom: 16px;">
        <div style="display: flex; gap: 14px; flex-wrap: wrap; align-items: flex-end;">
          <div style="flex: 1; min-width: 220px;">
            <label style="font-size: 11.5px; font-weight: 800; color: var(--text-1); display: block; margin-bottom: 4px;">بحث في الفواتير أو العميل</label>
            <input type="text" id="broker-search-input" class="input" placeholder="رقم الفاتورة، اسم العميل..." oninput="window.applyBrokerStatementFilters()" />
          </div>

          <div style="width: 170px;">
            <label style="font-size: 11.5px; font-weight: 800; color: var(--text-1); display: block; margin-bottom: 4px;">حالة العمولة</label>
            <select id="broker-status-filter" class="input" onchange="window.applyBrokerStatementFilters()">
              <option value="all">كافة الحالات</option>
              <option value="earned">مكتسبة وجاهزة للصرف ✅</option>
              <option value="pending">معلقة لحين سداد العميل ⏳</option>
            </select>
          </div>

          <div style="width: 160px;">
            <label style="font-size: 11.5px; font-weight: 800; color: var(--text-1); display: block; margin-bottom: 4px;">من تاريخ</label>
            <input type="date" id="broker-date-from" class="input mono" onchange="window.applyBrokerStatementFilters()" />
          </div>

          <div style="width: 160px;">
            <label style="font-size: 11.5px; font-weight: 800; color: var(--text-1); display: block; margin-bottom: 4px;">إلى تاريخ</label>
            <input type="date" id="broker-date-to" class="input mono" value="${todayString()}" onchange="window.applyBrokerStatementFilters()" />
          </div>

          <div>
            <button class="btn btn-secondary" onclick="window.resetBrokerFilters()" style="font-weight: 700;">إعادة ضبط</button>
          </div>
        </div>
      </div>

      <!-- Invoices and Commission Table -->
      <div class="card" style="padding: 0; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color);">
        <div style="padding: 12px 18px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-1);">
          <div style="font-size: 13.5px; font-weight: 900; color: var(--text-0);">
            سجل الفواتير الخاضعة للعمولة وحالة استحقاقها (<span id="broker-records-count">0</span> فاتورة)
          </div>
          <div style="font-size: 11.5px; color: var(--text-2);">
            * تتولد القيود اليومية أوتوماتيكياً فور تسجيل سداد العميل للفاتورة
          </div>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 12.5px;">
            <thead>
              <tr style="background: var(--bg-2); border-bottom: 1.5px solid var(--border-color); color: var(--text-1); font-weight: 800;">
                <th style="padding: 10px 14px;">رقم الفاتورة</th>
                <th style="padding: 10px 14px;">التاريخ</th>
                <th style="padding: 10px 14px;">العميل</th>
                <th style="padding: 10px 14px; text-align: left;">المبلغ قبل الضريبة</th>
                <th style="padding: 10px 14px; text-align: center;">نسبة العمولة</th>
                <th style="padding: 10px 14px; text-align: left;">قيمة العمولة (1%)</th>
                <th style="padding: 10px 14px; text-align: center;">سداد العميل</th>
                <th style="padding: 10px 14px; text-align: center;">حالة استحقاق العمولة</th>
                <th style="padding: 10px 14px;">القيد المحاسبي</th>
                <th style="padding: 10px 14px; text-align: center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="broker-table-tbody">
              <tr>
                <td colspan="10" style="text-align: center; padding: 32px; color: var(--text-dim);">
                  <i class="fas fa-spinner fa-spin" style="font-size: 20px; color: #0284c7;"></i>
                  <div style="margin-top: 8px; font-weight: 700;">جاري تحميل كشف حساب الوسيط زياد...</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Payout Modal Container -->
    <div id="broker-payout-modal-container"></div>
  `;

  await loadBrokerStatementData();
}

/**
 * جلب بيانات فواتير الوسيط والمستحقات من Firestore
 */
async function loadBrokerStatementData() {
  try {
    const { collection, getDocs, query, where } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const { db, COMPANY_ID } = await import("../firebase-config.js");

    // 1. جلب كافة فواتير المبيعات المرتبطة بالوسيط زياد أو العميل مؤسسة عماد الفت
    const invRef = collection(db, `companies/${COMPANY_ID}/salesInvoices`);
    const snap = await getDocs(invRef);
    
    const invoices = [];
    snap.forEach(d => {
      const data = d.data();
      if (data.status === "cancelled" || data.status === "draft") return;

      // عمولة الوسيط زياد: تسري حصراً على الفواتير المعتمدة لوساطة زياد (بداية من الفاتورة INV-042070 وما بعدها من تاريخ 2026-10-19)
      // ولا تسري بأثر رجعي على الفواتير القديمة السابقة مثل 13/10
      if ((data.date || "") < "2026-10-19" || data.number === "INV-042056" || data.invoiceNumber === "INV-042056") return;

      const isZiyadBroker = (data.hasBrokerCommission && (data.brokerName || "").includes("زياد")) ||
                            ((data.brokerName || "").includes("زياد") && parseFloat(data.brokerCommissionTotal || 0) > 0) ||
                            (data.hasBrokerCommission && parseFloat(data.brokerCommissionTotal || 0) > 0);

      if (isZiyadBroker) {
        // حساب العمولة المسجلة بالفاتورة
        const subtotal = parseFloat(data.subtotal || data.taxableAmount || 0);
        const rate = parseFloat(data.brokerRate) || 1.0;
        const commAmt = parseFloat(data.brokerCommissionTotal) || (data.hasBrokerCommission ? Math.round(subtotal * (rate / 100) * 100) / 100 : 0);
        if (commAmt <= 0) return;
        
        // التحقق من حالة سداد العميل للفاتورة
        const total = parseFloat(data.totalWithVat || data.total || 0);
        const paid = parseFloat(data.paidAmount || 0);
        const isPaidFull = (total > 0 && paid >= total - 0.05) || (data.payment === "cash" || data.paymentMethod === "cash");
        const isPaidPartial = !isPaidFull && paid > 0;

        // حالة العمولة (الاستحقاق الفوري فور صدور الفاتورة)
        const isTriggerInvoice = data.brokerTrigger === "on_invoice" || !data.brokerTrigger;
        let commStatus = data.brokerCommissionStatus || (isTriggerInvoice || isPaidFull ? "earned" : "pending_payment");
        let commEarned = parseFloat(data.brokerCommissionEarned || 0);
        if ((isTriggerInvoice || isPaidFull || commStatus === "earned") && commEarned <= 0) {
          commEarned = commAmt;
        } else if (isPaidPartial && commEarned <= 0 && !isTriggerInvoice) {
          commEarned = Math.round((commAmt * (paid / total)) * 100) / 100;
        }

        invoices.push({
          id: d.id,
          number: data.number || data.invoiceNumber || d.id.slice(0, 8),
          date: data.date || "2026-10-19",
          customerId: data.customerId,
          customerName: data.customerName || "مؤسسة عماد ابراهيم الفت حلواني لتقديم الوجبات",
          subtotal,
          totalWithVat: total,
          paidAmount: paid,
          brokerRate: rate,
          brokerCommissionTotal: commAmt,
          brokerCommissionEarned: commEarned,
          isPaidFull,
          isPaidPartial,
          status: commStatus,
          journalEntryId: data.brokerJournalEntryId || data.journalEntryId || null
        });
      }
    });

    // ترتيب الفواتير تنازلياً حسب التاريخ
    invoices.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    _allBrokerInvoices = invoices;

    // 2. جلب سندات الصرف المسجلة لصالح زياد لحساب المدفوع
    let totalPaidOut = 0;
    try {
      const expRef = collection(db, `companies/${COMPANY_ID}/expenses`);
      const expSnap = await getDocs(expRef);
      expSnap.forEach(d => {
        const ed = d.data();
        if ((ed.notes || "").includes("زياد") || (ed.beneficiary || "").includes("زياد") || ed.accountCode === "2-1-4-2") {
          totalPaidOut += parseFloat(ed.amount || 0);
        }
      });
    } catch (_) {}

    _brokerSummary.totalCommissionPaidOut = totalPaidOut;

    // تطبيق الفلاتر وعرض النتائج
    window.applyBrokerStatementFilters();

  } catch (err) {
    console.error("loadBrokerStatementData error:", err);
    showToast("خطأ في تحميل كشف حساب الوسيط: " + err.message, "error");
  }
}

/**
 * تطبيق الفلاتر وإعادة حساب المؤشرات
 */
window.applyBrokerStatementFilters = () => {
  const searchTerm = (document.getElementById("broker-search-input")?.value || "").toLowerCase().trim();
  const statusFilter = document.getElementById("broker-status-filter")?.value || "all";
  const dateFrom = document.getElementById("broker-date-from")?.value || "";
  const dateTo = document.getElementById("broker-date-to")?.value || "";

  _filteredInvoices = _allBrokerInvoices.filter(inv => {
    if (searchTerm) {
      const matchNum = inv.number.toLowerCase().includes(searchTerm);
      const matchCust = (inv.customerName || "").toLowerCase().includes(searchTerm);
      if (!matchNum && !matchCust) return false;
    }

    if (statusFilter === "earned" && !inv.isPaidFull && inv.brokerCommissionEarned <= 0) return false;
    if (statusFilter === "pending" && inv.isPaidFull) return false;

    if (dateFrom && inv.date < dateFrom) return false;
    if (dateTo && inv.date > dateTo) return false;

    return true;
  });

  // حساب مؤشرات الأداء الكلية (من كامل السجل)
  let salesTotal = 0;
  let commTotal = 0;
  let earnedTotal = 0;
  let pendingTotal = 0;

  _allBrokerInvoices.forEach(inv => {
    salesTotal += inv.subtotal;
    commTotal += inv.brokerCommissionTotal;
    earnedTotal += inv.brokerCommissionEarned;
    if (!inv.isPaidFull) {
      pendingTotal += (inv.brokerCommissionTotal - inv.brokerCommissionEarned);
    }
  });

  _brokerSummary.totalSalesTaxable = Math.round(salesTotal * 100) / 100;
  _brokerSummary.totalCommissionCalculated = Math.round(commTotal * 100) / 100;
  _brokerSummary.totalCommissionEarned = Math.round(earnedTotal * 100) / 100;
  _brokerSummary.totalCommissionPending = Math.round(pendingTotal * 100) / 100;
  _brokerSummary.currentNetPayable = Math.max(0, Math.round((earnedTotal - _brokerSummary.totalCommissionPaidOut) * 100) / 100);

  // تحديث البطاقات
  const setEl = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setEl("kpi-broker-sales", formatCurrency(_brokerSummary.totalSalesTaxable));
  setEl("kpi-broker-total-comm", formatCurrency(_brokerSummary.totalCommissionCalculated));
  setEl("kpi-broker-earned", formatCurrency(_brokerSummary.totalCommissionEarned));
  setEl("kpi-broker-pending", formatCurrency(_brokerSummary.totalCommissionPending));
  setEl("kpi-broker-paidout", formatCurrency(_brokerSummary.totalCommissionPaidOut));
  setEl("kpi-broker-net-due", formatCurrency(_brokerSummary.currentNetPayable));

  const countEl = document.getElementById("broker-records-count");
  if (countEl) countEl.textContent = _filteredInvoices.length;

  renderBrokerTable();
};

/**
 * رسم جدول الفواتير والعمولات
 */
function renderBrokerTable() {
  const tbody = document.getElementById("broker-table-tbody");
  if (!tbody) return;

  if (_filteredInvoices.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 28px; color: var(--text-dim); font-weight: 700;">
          لا توجد فواتير مطابقة لخيارات الفلترة المحددة
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = _filteredInvoices.map((inv, idx) => {
    // حالة سداد العميل
    let custPayBadge = "";
    if (inv.isPaidFull) {
      custPayBadge = `<span class="badge good" style="font-weight: 800; font-size: 11px;">تم السداد بالكامل ✅</span>`;
    } else if (inv.isPaidPartial) {
      custPayBadge = `<span class="badge warn" style="font-weight: 800; font-size: 11px;">سداد جزئي (${formatCurrency(inv.paidAmount)})</span>`;
    } else {
      custPayBadge = `<span class="badge" style="background:#fef3c7; color:#92400e; font-weight:800; font-size:11px;">آجل معلق (غير مسدد)</span>`;
    }

    // حالة استحقاق العمولة للوسيط
    let commBadge = "";
    if (inv.status === "earned" || inv.isPaidFull || inv.brokerCommissionEarned >= inv.brokerCommissionTotal - 0.05) {
      commBadge = `<span style="background: #dcfce7; color: #15803d; padding: 3px 10px; border-radius: 20px; font-weight: 800; font-size: 11.5px; display: inline-flex; align-items: center; gap: 4px;">
        <span>✅</span> <span>مستحقة ومكتسبة وجاهزة للصرف</span>
      </span>`;
    } else {
      commBadge = `<span style="background: #ede9fe; color: #5b21b6; padding: 3px 10px; border-radius: 20px; font-weight: 800; font-size: 11.5px; display: inline-flex; align-items: center; gap: 4px;">
        <span>⏳</span> <span>معلقة لحين سداد العميل</span>
      </span>`;
    }

    return `
      <tr style="border-bottom: 1px solid var(--border-color); ${idx % 2 === 1 ? 'background: rgba(0,0,0,0.015);' : ''}">
        <td style="padding: 10px 14px; font-weight: 900; font-family: monospace; color: #0284c7;">
          <a href="javascript:void(0)" onclick="window.viewBrokerLinkedInvoice('${inv.id}')" style="text-decoration: underline; color: inherit;">
            ${inv.number}
          </a>
        </td>
        <td style="padding: 10px 14px; font-family: monospace; color: var(--text-1); font-weight: 700;">
          ${formatDate(inv.date)}
        </td>
        <td style="padding: 10px 14px; font-weight: 800; color: var(--text-0);">
          ${inv.customerName}
        </td>
        <td style="padding: 10px 14px; text-align: left; font-family: monospace; font-weight: 800; color: #004d80;">
          ${formatCurrency(inv.subtotal)}
        </td>
        <td style="padding: 10px 14px; text-align: center;">
          <span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 12px; font-weight: 900; font-size: 11px;">
            ${inv.brokerRate}%
          </span>
        </td>
        <td style="padding: 10px 14px; text-align: left; font-family: monospace; font-weight: 900; color: #d97706; font-size: 13.5px;">
          ${formatCurrency(inv.brokerCommissionTotal)}
        </td>
        <td style="padding: 10px 14px; text-align: center;">
          ${custPayBadge}
        </td>
        <td style="padding: 10px 14px; text-align: center;">
          ${commBadge}
        </td>
        <td style="padding: 10px 14px; font-size: 11px;">
          ${inv.journalEntryId ? `
            <span style="font-family: monospace; color: #059669; font-weight: 800;">قيد آلي معتمد</span>
          ` : `
            <span style="color: var(--text-dim);">يتولد عند السداد</span>
          `}
        </td>
        <td style="padding: 10px 14px; text-align: center; white-space: nowrap;">
          <button class="btn btn-icon btn-ghost sm" onclick="window.viewBrokerLinkedInvoice('${inv.id}')" title="معاينة الفاتورة">
            👁️
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

/**
 * إعادة ضبط الفلاتر
 */
window.resetBrokerFilters = () => {
  const s = document.getElementById("broker-search-input");
  if (s) s.value = "";
  const f = document.getElementById("broker-status-filter");
  if (f) f.value = "all";
  const df = document.getElementById("broker-date-from");
  if (df) df.value = "";
  const dt = document.getElementById("broker-date-to");
  if (dt) dt.value = todayString();
  window.applyBrokerStatementFilters();
};

/**
 * تحديث البيانات من السيرفر
 */
window.reloadBrokerStatementData = async () => {
  showToast("جاري تحديث كشف الحساب من السيرفر...", "info");
  await loadBrokerStatementData();
  showToast("تم تحديث البيانات بنجاح", "success");
};

/**
 * فتح الفاتورة المرتبطة للمعاينة
 */
window.viewBrokerLinkedInvoice = (invId) => {
  if (typeof window.viewInvoice === "function") {
    window.viewInvoice(invId);
  } else {
    showToast("رقم الفاتورة: " + invId, "info");
  }
};

/**
 * نافذة تسجيل صرف عمولة للوسيط زياد (سند صرف رسمي)
 */
window.openPayBrokerCommissionModal = async () => {
  const container = document.getElementById("broker-payout-modal-container");
  if (!container) return;

  const currentDue = _brokerSummary.currentNetPayable || 0;

  // جلب الصناديق والبنوك المتاحة
  let paymentSources = [];
  try {
    const boxes = await getAll(COLS.cashBoxes());
    boxes.forEach(b => paymentSources.push({ id: b.id, name: `خزينة: ${b.name}`, type: "cash", balance: b.balance || 0 }));
    const banks = await getAll("bankAccounts");
    banks.forEach(b => paymentSources.push({ id: b.id, name: `بنك: ${b.bankName || b.name}`, type: "bank", balance: b.balance || 0 }));
  } catch (_) {}

  container.innerHTML = `
    <div class="modal-overlay active" id="broker-payout-modal" style="z-index: 10000;">
      <div class="modal" style="max-width: 500px; border-radius: 16px;">
        <div class="modal-header" style="background: #004d80; color: #fff; border-radius: 16px 16px 0 0;">
          <div style="font-weight: 900; font-size: 15px; display: flex; align-items: center; gap: 8px;">
            <span>💳</span>
            <span>تسجيل صرف عمولة للوسيط — زياد</span>
          </div>
          <button class="btn btn-icon btn-ghost" onclick="window.closeBrokerPayoutModal()" style="color:#fff;">✕</button>
        </div>

        <div class="modal-body" style="padding: 18px 22px;">
          <div style="background: #ecfdf5; border: 1.2px solid #a7f3d0; border-radius: 10px; padding: 10px 14px; margin-bottom: 14px;">
            <div style="font-size: 11.5px; color: #065f46; font-weight: 700;">الرصيد المكتسب المتاح للصرف حالياً:</div>
            <div style="font-size: 20px; font-weight: 900; color: #047857; font-family: monospace;">${formatCurrency(currentDue)}</div>
            <div style="font-size: 10.5px; color: #065f46; margin-top: 2px;">(الحساب المدين: 2-1-4-2 مستحقات عمولات الوسطاء - زياد)</div>
          </div>

          <div class="form-group mb-14">
            <label style="font-size: 12px; font-weight: 800;">المبلغ المراد صرفه (ريال سعودي) *</label>
            <input type="number" id="payout-amount" class="input mono font-bold" style="font-size: 17px; color: #004d80;" value="${currentDue > 0 ? currentDue : ''}" step="0.01" min="1" placeholder="أدخل المبلغ" />
          </div>

          <div class="form-group mb-14">
            <label style="font-size: 12px; font-weight: 800;">طريقة ومصدر الصرف (الخزينة / البنك) *</label>
            <select id="payout-source-id" class="input">
              ${paymentSources.map(s => `
                <option value="${s.id}" data-type="${s.type}">${s.name} (الرصيد: ${formatCurrency(s.balance)})</option>
              `).join("")}
            </select>
          </div>

          <div class="form-group mb-14">
            <label style="font-size: 12px; font-weight: 800;">تاريخ الصرف *</label>
            <input type="date" id="payout-date" class="input mono" value="${todayString()}" />
          </div>

          <div class="form-group mb-14">
            <label style="font-size: 12px; font-weight: 800;">البيان والملاحظات</label>
            <input type="text" id="payout-notes" class="input" value="صرف عمولة مبيعات للوسيط زياد عن فواتير العملاء المحصلة" />
          </div>
        </div>

        <div class="modal-footer" style="padding: 12px 20px;">
          <button class="btn btn-secondary" onclick="window.closeBrokerPayoutModal()">إلغاء</button>
          <button class="btn btn-primary" id="save-broker-payout-btn" onclick="window.executeBrokerPayout()" style="background:#059669; border-color:#059669; font-weight:800;">
            💾 اعتماد وسداد الصرف
          </button>
        </div>
      </div>
    </div>
  `;
};

window.closeBrokerPayoutModal = () => {
  const m = document.getElementById("broker-payout-modal");
  if (m) m.remove();
};

/**
 * تنفيذ عملية الصرف وتوليد القيد المحاسبي
 */
window.executeBrokerPayout = async () => {
  const amtEl = document.getElementById("payout-amount");
  const amount = parseFloat(amtEl?.value) || 0;
  if (amount <= 0) {
    showToast("يرجى إدخال مبلغ صحيح للصرف", "warning");
    return;
  }

  const sourceSelect = document.getElementById("payout-source-id");
  const sourceId = sourceSelect?.value;
  const sourceType = sourceSelect?.selectedOptions[0]?.getAttribute("data-type") || "cash";
  const sourceName = sourceSelect?.selectedOptions[0]?.textContent || "الخزينة";

  const payoutDate = document.getElementById("payout-date")?.value || todayString();
  const notes = document.getElementById("payout-notes")?.value.trim() || "صرف عمولة الوسيط زياد";

  const btn = document.getElementById("save-broker-payout-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "جاري الحفظ والترحيل...";
  }

  try {
    const { addDoc, collection, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const { db, COMPANY_ID } = await import("../firebase-config.js");
    const { autoCashTransaction, autoBankTransaction, createJournalEntry } = await import("../utils/db.js");

    // 1. تسجيل سند صرف في collection المصروفات / المدفوعات
    const expData = {
      date: payoutDate,
      amount,
      beneficiary: "زياد (وسيط مبيعات)",
      category: "عمولات وساطة تجارية",
      accountCode: "2-1-4-2",
      accountName: "مستحقات عمولات الوسطاء - زياد",
      paymentMethod: sourceType,
      sourceId,
      sourceName,
      notes,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const expRef = await addDoc(collection(db, `companies/${COMPANY_ID}/expenses`), expData);

    // 2. خصم المبلغ من حركة الخزينة أو البنك
    if (sourceType === "cash") {
      await autoCashTransaction({
        type: "out",
        amount,
        notes: `صرف عمولة وسيط — ${notes}`,
        sourceType: "expense",
        sourceId: expRef.id,
        cashBoxId: sourceId,
        date: payoutDate
      });
    } else {
      await autoBankTransaction({
        type: "out",
        amount,
        notes: `صرف عمولة وسيط — ${notes}`,
        sourceType: "expense",
        sourceId: expRef.id,
        date: payoutDate
      });
    }

    // 3. إنشاء قيد اليومية الرسمي لتخفيض الاستحقاق من النقدية أو البنك
    // مدين: 2-1-4-2 (مستحقات عمولات الوسطاء - زياد) [تخفيض الاستحقاق]
    // دائن: حساب الصندوق أو البنك الدقيق [خروج النقدية]
    let creditAccountCode = "1-1-1-1";
    let creditAccountName = "الصندوق الرئيسي";

    if (sourceType === "cash") {
      try {
        const boxes = await getAll("cashBoxes");
        const b = (boxes || []).find(x => x.id === sourceId);
        if (b && b.accountCode) creditAccountCode = b.accountCode;
        if (b && b.name) creditAccountName = b.name;
      } catch (_) {}
    } else {
      try {
        const banks = await getAll("bankAccounts");
        const bk = (banks || []).find(x => x.id === sourceId);
        if (bk && bk.accountCode) creditAccountCode = bk.accountCode;
        else creditAccountCode = "1-1-1-3-02";
        if (bk && (bk.name || bk.bankName)) creditAccountName = bk.name || bk.bankName;
      } catch (_) {}
    }

    const jeLines = [
      {
        accountCode: "2-1-4-2",
        accountName: "مستحقات عمولات الوسطاء - زياد",
        debit: amount,
        credit: 0,
        note: `سداد وتخفيض مستحقات عمولة الوسيط زياد — ${notes}`
      },
      {
        accountCode: creditAccountCode,
        accountName: creditAccountName,
        debit: 0,
        credit: amount,
        note: `صرف نقدي/بنكي للوسيط زياد بموجب سند رقم ${expRef.id.slice(0, 8)}`
      }
    ];

    await createJournalEntry({
      date: payoutDate,
      sourceType: "broker_payout",
      sourceId: expRef.id,
      description: `قيد سداد وتخفيض مستحقات عمولة الوسيط زياد بمبلغ ${formatCurrency(amount)} من ${creditAccountName}`,
      lines: jeLines
    });

    window.closeBrokerPayoutModal();
    showToast(`✅ تم صرف ${formatCurrency(amount)} للوسيط زياد وتوليد القيد المحاسبي بنجاح`, "success");
    await loadBrokerStatementData();

  } catch (err) {
    console.error("Payout error:", err);
    showToast("خطأ في تسجيل الصرف: " + err.message, "error");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "💾 اعتماد وسداد الصرف";
    }
  }
};

/**
 * تصدير كشف الحساب لإكسيل
 */
window.exportBrokerStatementExcel = () => {
  if (_filteredInvoices.length === 0) {
    showToast("لا توجد بيانات للتصدير", "warning");
    return;
  }

  const headers = [
    "رقم الفاتورة",
    "التاريخ",
    "اسم العميل",
    "المبلغ قبل الضريبة (ر.س)",
    "نسبة العمولة",
    "قيمة العمولة (ر.س)",
    "حالة سداد العميل",
    "حالة استحقاق العمولة"
  ];

  const rows = _filteredInvoices.map(inv => [
    inv.number,
    inv.date,
    inv.customerName,
    inv.subtotal,
    `${inv.brokerRate}%`,
    inv.brokerCommissionTotal,
    inv.isPaidFull ? "مسددة بالكامل" : (inv.isPaidPartial ? "سداد جزئي" : "آجل غير مسدد"),
    inv.isPaidFull ? "مكتسبة وجاهزة للصرف" : "معلقة لحين سداد العميل"
  ]);

  // سطر الإجماليات
  rows.push([
    "الإجمالي",
    "",
    "",
    _brokerSummary.totalSalesTaxable,
    "1%",
    _brokerSummary.totalCommissionCalculated,
    `المكتسب: ${_brokerSummary.totalCommissionEarned}`,
    `الصافي المستحق: ${_brokerSummary.currentNetPayable}`
  ]);

  exportToExcel("كشف_حساب_عمولات_الوسيط_زياد", headers, rows);
  showToast("تم تصدير كشف الحساب إلى Excel بنجاح", "success");
};

/**
 * طباعة كشف حساب معتمد A4 للوسيط زياد
 */
window.printBrokerStatementA4 = () => {
  const printWin = window.open("", "_blank");
  if (!printWin) {
    showToast("يرجى السماح بالنوافذ المنبثقة للطباعة", "error");
    return;
  }

  const rowsHtml = _filteredInvoices.map((inv, i) => `
    <tr>
      <td style="text-align:center; padding:6px;">${i + 1}</td>
      <td style="font-weight:bold; font-family:monospace; padding:6px;">${inv.number}</td>
      <td style="text-align:center; font-family:monospace; padding:6px;">${inv.date}</td>
      <td style="padding:6px;">${inv.customerName}</td>
      <td style="text-align:left; font-family:monospace; font-weight:bold; padding:6px;">${formatCurrency(inv.subtotal)}</td>
      <td style="text-align:center; padding:6px;">${inv.brokerRate}%</td>
      <td style="text-align:left; font-family:monospace; font-weight:bold; color:#b45309; padding:6px;">${formatCurrency(inv.brokerCommissionTotal)}</td>
      <td style="text-align:center; font-size:11px; padding:6px;">${inv.isPaidFull ? "مسددة بالكامل" : "آجل معلق"}</td>
      <td style="text-align:center; font-size:11px; font-weight:bold; padding:6px;">${inv.isPaidFull ? "مكتسبة وجاهزة للصرف" : "معلقة لحين السداد"}</td>
    </tr>
  `).join("");

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>كشف حساب عمولات الوسيط — زياد</title>
  <style>
    @page { size: A4 landscape; margin: 8mm; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 11px; direction: rtl; margin: 0; padding: 10px; color: #000; }
    .hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #004d80; padding-bottom: 8px; margin-bottom: 12px; }
    .kpi-row { display: flex; gap: 10px; margin-bottom: 14px; }
    .kpi-box { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; background: #f8fafc; }
    .kpi-title { font-size: 10px; color: #64748b; font-weight: bold; }
    .kpi-val { font-size: 15px; font-weight: 900; color: #004d80; font-family: monospace; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 6px; }
    th, td { border: 1px solid #cbd5e1; padding: 5px 8px; }
    th { background: #e0f2fe; color: #004d80; font-weight: 900; }
    .ftr { margin-top: 20px; display: flex; justify-content: space-between; font-weight: bold; padding-top: 10px; border-top: 1px dashed #cbd5e1; }
  </style>
</head>
<body>
  <div class="hdr">
    <div>
      <h2 style="margin:0; font-size:18px; color:#004d80;">شركة نظم الإمداد المتطورة</h2>
      <div style="font-size:11px; color:#475569; margin-top:2px;">كشف حساب وتصفية عمولات مبيعات الوسيط</div>
    </div>
    <div style="text-align:center;">
      <h3 style="margin:0; font-size:16px;">كشف مستحقات الوسيط: زياد</h3>
      <div style="font-size:11px; color:#0284c7; font-weight:bold; margin-top:2px;">نسبة العمولة: 1.0% قبل الضريبة</div>
    </div>
    <div style="text-align:left; font-size:11px; font-family:monospace;">
      التاريخ: ${todayString()}<br />
      الحساب: 2-1-4-2
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi-box"><div class="kpi-title">إجمالي المبيعات الخاضعة</div><div class="kpi-val">${formatCurrency(_brokerSummary.totalSalesTaxable)}</div></div>
    <div class="kpi-box"><div class="kpi-title">إجمالي العمولات المحسوبة</div><div class="kpi-val" style="color:#d97706;">${formatCurrency(_brokerSummary.totalCommissionCalculated)}</div></div>
    <div class="kpi-box"><div class="kpi-title">العمولات المكتسبة (المسددة)</div><div class="kpi-val" style="color:#059669;">${formatCurrency(_brokerSummary.totalCommissionEarned)}</div></div>
    <div class="kpi-box"><div class="kpi-title">العمولات المعلقة بالسداد</div><div class="kpi-val" style="color:#4f46e5;">${formatCurrency(_brokerSummary.totalCommissionPending)}</div></div>
    <div class="kpi-box"><div class="kpi-title">العمولات المصروفة نقداً/بنكاً</div><div class="kpi-val" style="color:#db2777;">${formatCurrency(_brokerSummary.totalCommissionPaidOut)}</div></div>
    <div class="kpi-box" style="background:#004d80; color:#fff;"><div class="kpi-title" style="color:#e0f2fe;">الرصيد الصافي المستحق للصرف</div><div class="kpi-val" style="color:#facc15;">${formatCurrency(_brokerSummary.currentNetPayable)}</div></div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:30px;">#</th>
        <th>رقم الفاتورة</th>
        <th>التاريخ</th>
        <th>العميل</th>
        <th>المبلغ قبل الضريبة</th>
        <th>النسبة</th>
        <th>العمولة (ر.س)</th>
        <th>سداد العميل</th>
        <th>حالة الاستحقاق</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="ftr">
    <div>إعداد المحاسب المسؤول: _______________________</div>
    <div>المراجعة والتدقيق المالي: _______________________</div>
    <div>توقيع المستفيد (زياد): _______________________</div>
    <div>اعتماد الإدارة: _______________________</div>
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

  printWin.document.open();
  printWin.document.write(html);
  printWin.document.close();
};
