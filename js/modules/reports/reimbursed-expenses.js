// ============================================================
// IDHAM ERP — Reimbursed Expenses Report (تقرير المصروفات المستردة للعملاء)
// ============================================================
import { COLS, getAll } from "../../utils/db.js";
import { query, orderBy, limit, getDocs, where } from "../../utils/db.js";
import { formatCurrency, startOfMonth, todayString } from "../../utils/formatters.js";

let _customers = [];
let _expenses = [];

export async function render(container, user) {
  container.innerHTML = `
    <style>
      .print-only-header { display: none; }
      @media print {
        .print-only-header { display: block !important; }
        .no-print { display: none !important; }
      }
    </style>
    <div class="filterbar no-print">
      <div class="date-range-group"><label>من</label>
        <input type="date" id="re-from" value="${startOfMonth()}" onchange="loadReimbursedExpenses()" /></div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="re-to" value="${todayString()}" onchange="loadReimbursedExpenses()" /></div>
      
      <div class="filter-select-group"><label>العميل</label>
        <select id="re-customer-filter" onchange="filterReimbursedExpenses()" style="min-width:200px;">
          <option value="">الكل</option>
        </select>
      </div>

      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn-export" onclick="exportPagePDF('#re-table','تقرير المصروفات المستردة للعملاء')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportPageExcel('#re-table','تقرير المصروفات المستردة للعملاء')" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
      </div>
    </div>

    <div class="page-content">
      <!-- Luxury Print Header -->
      <div class="print-only-header" style="border-bottom:3px double var(--brand); padding-bottom:12px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:16px; align-items:center;">
            <img id="re-print-logo" style="max-height:64px; max-width:120px;" src="" alt="شعار الشركة" />
            <div>
              <h2 id="re-print-co-name" style="margin:0; font-family:var(--font-heading); color:var(--brand);"></h2>
              <div id="re-print-co-details" class="dim" style="font-size:11px; margin-top:4px;"></div>
            </div>
          </div>
          <div style="text-align:left;">
            <h3 style="margin:0; font-family:var(--font-heading);">تقرير المصروفات المستردة للعملاء</h3>
            <p style="margin:4px 0 0 0; font-size:11px; color:var(--text-2);" id="re-print-period"></p>
          </div>
        </div>
      </div>

      <div class="page-header no-print">
        <h1 class="page-title">تقرير المصروفات المستردة للعملاء</h1>
        <p class="page-subtitle" id="re-period"></p>
      </div>

      <!-- KPI Summary -->
      <div class="kpi-grid mb-24" style="max-width:320px;">
        <div class="kpi-card"><div class="status-bar bad"></div>
          <div class="kpi-icon bad">💸</div>
          <div class="kpi-content"><div class="kpi-label">إجمالي المصروفات المستردة</div>
            <div class="kpi-value mono" id="re-total-amount">—</div></div></div>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense" id="re-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>رقم السند</th>
                <th>اسم العميل</th>
                <th>طريقة الدفع/الصرف</th>
                <th>الملاحظات / البيان</th>
                <th style="text-align:left; color:var(--bad);">المبلغ الصادر (ر.س)</th>
              </tr>
            </thead>
            <tbody id="re-tbody">
              <tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد مصروفات مستردة مسجلة</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Attach global actions
  window.loadReimbursedExpenses = loadReimbursedExpenses;
  window.filterReimbursedExpenses = filterReimbursedExpenses;

  await loadFilters();
  await loadReimbursedExpenses();
}

async function loadFilters() {
  try {
    _customers = await getAll(COLS.customers(), [orderBy("name")]);
    const sel = document.getElementById("re-customer-filter");
    if (sel) {
      sel.innerHTML = '<option value="">الكل</option>' +
        _customers.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    }
  } catch (err) {
    console.error("loadFilters error:", err);
  }
}

async function loadReimbursedExpenses() {
  const from = document.getElementById("re-from")?.value || "";
  const to = document.getElementById("re-to")?.value || "";

  const periodEl = document.getElementById("re-period");
  if (periodEl) periodEl.textContent = `الفترة من ${from || "البداية"} إلى ${to || "اليوم"}`;

  try {
    // Query expenses where entityType == "customer"
    const q = query(COLS.expenses(), where("entityType", "==", "customer"), where("date", ">=", from), where("date", "<=", to), limit(1000));
    const snap = await getDocs(q);
    _expenses = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    filterReimbursedExpenses();
    populatePrintHeader(from, to);
  } catch (err) {
    window.showToast("فشل تحميل المصروفات المستردة: " + err.message, "danger");
  }
}

function filterReimbursedExpenses() {
  const custId = document.getElementById("re-customer-filter")?.value || "";
  const tbody = document.getElementById("re-tbody");
  if (!tbody) return;

  let filtered = [..._expenses];
  if (custId) {
    filtered = filtered.filter(e => e.targetId === custId);
  }

  // Calculate total amount
  const total = filtered.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  document.getElementById("re-total-amount").textContent = formatCurrency(total);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد مصروفات مستردة مسجلة للفترة أو العميل المحدد</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(e => {
    return `
      <tr>
        <td class="mono dim">${e.date}</td>
        <td class="mono font-bold">${e.id.substring(0,8).toUpperCase()}</td>
        <td><strong>${e.accountName || "عميل"}</strong></td>
        <td><span class="badge ${e.method === 'cash' ? 'neutral' : 'indigo'}">${e.method === 'cash' ? 'صندوق نقدي' : 'حساب بنكي'}</span></td>
        <td>${e.notes || "—"}</td>
        <td class="mono font-bold text-bad" style="text-align:left;">${formatCurrency(e.amount)}</td>
      </tr>
    `;
  }).join("");
}

function populatePrintHeader(from, to) {
  let co = {};
  try {
    const raw = localStorage.getItem("idham_company");
    if (raw) co = JSON.parse(raw);
    else if (window.ERP_COMPANY) co = window.ERP_COMPANY;
  } catch {}

  const logoEl = document.getElementById("re-print-logo");
  if (logoEl) {
    if (co.logoBase64 || co.logoUrl) {
      logoEl.src = co.logoBase64 || co.logoUrl;
      logoEl.style.display = "block";
    } else {
      logoEl.style.display = "none";
    }
  }

  const nameEl = document.getElementById("re-print-co-name");
  if (nameEl) nameEl.textContent = co.name || "مؤسسة إدهام للمواد الغذائية";

  const detailsEl = document.getElementById("re-print-co-details");
  if (detailsEl) {
    const parts = [];
    if (co.address) parts.push(`📍 ${co.address}`);
    if (co.phone) parts.push(`📞 ${co.phone}`);
    if (co.vatNumber) parts.push(`🔢 الرقم الضريبي: ${co.vatNumber}`);
    if (co.crNumber) parts.push(`📋 : ${co.crNumber}`);
    detailsEl.textContent = parts.join(" | ");
  }

  const periodEl = document.getElementById("re-print-period");
  if (periodEl) periodEl.textContent = `الفترة من ${from || "البداية"} إلى ${to || "اليوم"}`;
}
