// ============================================================
// IDHAM ERP — Product Analytics Report (تحليل دوران وربحية الأصناف)
// ============================================================
import { COLS, getAll } from "../../utils/db.js";
import { query, orderBy, limit, getDocs, where } from "../../utils/db.js";
import { formatCurrency, formatQuantity, startOfMonth, todayString } from "../../utils/formatters.js";

let _salesInvoices = [];
let _productStats = [];
let _activeSection = "rotation"; // "rotation" | "margin" | "contribution"

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
        <input type="date" id="pa-from" value="${startOfMonth()}" onchange="loadProductAnalytics()" /></div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="pa-to" value="${todayString()}" onchange="loadProductAnalytics()" /></div>
      <div class="quick-filters">
        <button class="quick-filter-btn" onclick="paRange('today', event)">اليوم</button>
        <button class="quick-filter-btn active" onclick="paRange('month', event)">هذا الشهر</button>
        <button class="quick-filter-btn" onclick="paRange('last_month', event)">الشهر الماضي</button>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn-export" onclick="exportPagePDF('#pa-table','تحليلات دوران وربحية الأصناف')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportPageExcel('#pa-table','تحليلات دوران وربحية الأصناف')" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
      </div>
    </div>

    <div class="page-content">
      <!-- Luxury Print Header -->
      <div class="print-only-header" style="border-bottom:3px double var(--brand); padding-bottom:12px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:16px; align-items:center;">
            <img id="pa-print-logo" style="max-height:64px; max-width:120px;" src="" alt="شعار الشركة" />
            <div>
              <h2 id="pa-print-co-name" style="margin:0; font-family:var(--font-heading); color:var(--brand);"></h2>
              <div id="pa-print-co-details" class="dim" style="font-size:11px; margin-top:4px;"></div>
            </div>
          </div>
          <div style="text-align:left;">
            <h3 style="margin:0; font-family:var(--font-heading);">تحليلات دوران وربحية الأصناف</h3>
            <p style="margin:4px 0 0 0; font-size:11px; color:var(--text-2);" id="pa-print-period"></p>
          </div>
        </div>
      </div>

      <div class="page-header no-print">
        <h1 class="page-title">تحليلات دوران وربحية الأصناف</h1>
        <p class="page-subtitle" id="pa-period"></p>
      </div>

      <!-- KPI Summary -->
      <div class="kpi-grid mb-24">
        <div class="kpi-card"><div class="status-bar good"></div>
          <div class="kpi-icon good">📦</div>
          <div class="kpi-content"><div class="kpi-label">إجمالي القطع/الكراتين المبيعة</div>
            <div class="kpi-value mono" id="pa-total-qty">—</div></div></div>
        <div class="kpi-card"><div class="status-bar indigo"></div>
          <div class="kpi-icon indigo">📈</div>
          <div class="kpi-content"><div class="kpi-label">أكثر صنف مبيعاً (كمية)</div>
            <div class="kpi-value" id="pa-top-rotation" style="font-size:13px;">—</div></div></div>
        <div class="kpi-card"><div class="status-bar lime"></div>
          <div class="kpi-icon lime">🏆</div>
          <div class="kpi-content"><div class="kpi-label">أعلى صنف مساهمة بالربح</div>
            <div class="kpi-value" id="pa-top-contrib" style="font-size:13px;">—</div></div></div>
        <div class="kpi-card"><div class="status-bar warn"></div>
          <div class="kpi-icon warn">⚡</div>
          <div class="kpi-content"><div class="kpi-label">متوسط هامش الربح الإجمالي</div>
            <div class="kpi-value mono" id="pa-avg-margin">—</div></div></div>
      </div>

      <!-- Tabs to switch sections -->
      <div class="card mb-20">
        <div style="display:flex; border-bottom:1px solid var(--border-soft); margin-bottom:12px;" class="no-print">
          <button class="tab-btn active" id="btn-pa-rotation" onclick="paSetSection('rotation')" style="padding:12px 20px; font-weight:bold; cursor:pointer;">📦 الأكثر دوراناً (الكميات)</button>
          <button class="tab-btn" id="btn-pa-margin" onclick="paSetSection('margin')" style="padding:12px 20px; font-weight:bold; cursor:pointer;">⚡ الأعلى هامش ربح (%)</button>
          <button class="tab-btn" id="btn-pa-contrib" onclick="paSetSection('contribution')" style="padding:12px 20px; font-weight:bold; cursor:pointer;">💰 الأكثر مساهمة في الأرباح (ر.س)</button>
        </div>

        <div class="table-container">
          <table class="data-dense" id="pa-table">
            <thead>
              <tr>
                <th>#</th>
                <th>اسم الصنف</th>
                <th style="text-align:center;">الكمية المبيعة</th>
                <th style="text-align:left;">إجمالي المبيعات (صافي)</th>
                <th style="text-align:left;">إجمالي التكلفة</th>
                <th style="text-align:left; color:var(--good);">صافي الربح المحقق</th>
                <th style="width:140px;">نسبة الهامش</th>
              </tr>
            </thead>
            <tbody id="pa-tbody">
              <tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد بيانات للفترة المحددة</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Attach global actions
  window.paRange = paRange;
  window.loadProductAnalytics = loadProductAnalytics;
  window.paSetSection = paSetSection;
  window.exportProductAnalyticsCSV = exportProductAnalyticsCSV;

  await loadProductAnalytics();
}

let _productsList = [];

async function loadProductAnalytics() {
  const from = document.getElementById("pa-from")?.value || "";
  const to = document.getElementById("pa-to")?.value || "";

  const periodEl = document.getElementById("pa-period");
  if (periodEl) periodEl.textContent = `الفترة من ${from || "البداية"} إلى ${to || "اليوم"}`;

  try {
    const [prods, snap] = await Promise.all([
      getAll(COLS.products()),
      getDocs(query(COLS.salesInvoices(), where("date", ">=", from), where("date", "<=", to), limit(1500)))
    ]);

    _productsList = prods;
    _salesInvoices = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    calculateStats();
    renderStatsTable();
    populatePrintHeader(from, to);
  } catch (err) {
    window.showToast("فشل تحميل تحليلات الأصناف: " + err.message, "danger");
  }
}

function populatePrintHeader(from, to) {
  let co = {};
  try {
    const raw = localStorage.getItem("idham_company");
    if (raw) co = JSON.parse(raw);
    else if (window.ERP_COMPANY) co = window.ERP_COMPANY;
  } catch {}

  const logoEl = document.getElementById("pa-print-logo");
  if (logoEl) {
    if (co.logoBase64 || co.logoUrl) {
      logoEl.src = co.logoBase64 || co.logoUrl;
      logoEl.style.display = "block";
    } else {
      logoEl.style.display = "none";
    }
  }

  const nameEl = document.getElementById("pa-print-co-name");
  if (nameEl) nameEl.textContent = co.name || "مؤسسة إدهام للمواد الغذائية";

  const detailsEl = document.getElementById("pa-print-co-details");
  if (detailsEl) {
    const parts = [];
    if (co.address) parts.push(`📍 ${co.address}`);
    if (co.phone) parts.push(`📞 ${co.phone}`);
    if (co.vatNumber) parts.push(`🔢 الرقم الضريبي: ${co.vatNumber}`);
    if (co.crNumber) parts.push(`📋 السجل التجاري: ${co.crNumber}`);
    detailsEl.textContent = parts.join(" | ");
  }

  const periodEl = document.getElementById("pa-print-period");
  if (periodEl) periodEl.textContent = `الفترة من ${from || "البداية"} إلى ${to || "اليوم"}`;
}

function calculateStats() {
  const stats = {};
  let totalQty = 0;
  let totalRevenue = 0;
  let totalCost = 0;

  // Build product cost price lookup map
  const prodCostMap = {};
  _productsList.forEach(p => {
    prodCostMap[p.id] = parseFloat(p.purchasePrice || p.costPrice || p.averageCost || 0);
  });

  _salesInvoices.forEach(inv => {
    if (inv.status === "cancelled") return;

    (inv.lines || []).forEach(line => {
      const pId = line.productId;
      if (!pId) return;

      const qty = parseFloat(line.qty || 0);
      
      // Calculate net line revenue (unit price * qty - discount)
      const lineSub = (line.unitPrice || 0) * qty;
      const lineDisc = parseFloat(line.discount || 0);
      const lineRev = Math.max(0, lineSub - lineDisc);
      
      // Calculate cost using line costPrice or product cost map
      const costPrice = parseFloat(line.costPrice || prodCostMap[pId] || 0);
      const lineCost = costPrice * qty;

      totalQty += qty;
      totalRevenue += lineRev;
      totalCost += lineCost;

      if (!stats[pId]) {
        stats[pId] = {
          id: pId,
          name: line.productName || "صنف غير معروف",
          qty: 0,
          revenue: 0,
          cost: 0,
          profit: 0,
          margin: 0
        };
      }

      stats[pId].qty += qty;
      stats[pId].revenue += lineRev;
      stats[pId].cost += lineCost;
    });
  });

  // Calculate profit and margin for each product
  _productStats = Object.values(stats).map(p => {
    p.profit = p.revenue - p.cost;
    p.margin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0;
    return p;
  });

  // Update KPIs
  document.getElementById("pa-total-qty").textContent = formatQuantity(totalQty);
  
  const totalProfit = totalRevenue - totalCost;
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  document.getElementById("pa-avg-margin").textContent = `${avgMargin.toFixed(1)}%`;

  // Top Rotation product (Quantity)
  const rotationSorted = [..._productStats].sort((a,b) => b.qty - a.qty);
  if (rotationSorted.length > 0) {
    document.getElementById("pa-top-rotation").innerHTML = `${rotationSorted[0].name}<br><span class="mono" style="font-size:11px;color:var(--text-2);">${formatQuantity(rotationSorted[0].qty)} وحدة / كرتونة</span>`;
  } else {
    document.getElementById("pa-top-rotation").textContent = "—";
  }

  // Top Profit contributor (SAR)
  const contribSorted = [..._productStats].sort((a,b) => b.profit - a.profit);
  if (contribSorted.length > 0) {
    document.getElementById("pa-top-contrib").innerHTML = `${contribSorted[0].name}<br><span class="mono text-good" style="font-size:11px;font-weight:bold;">+${formatCurrency(contribSorted[0].profit)}</span>`;
  } else {
    document.getElementById("pa-top-contrib").textContent = "—";
  }
}

function renderStatsTable() {
  const tbody = document.getElementById("pa-tbody");
  if (!tbody) return;

  if (_productStats.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد مبيعات في هذه الفترة</td></tr>`;
    return;
  }

  // Sort based on active tab section
  let sorted = [..._productStats];
  if (_activeSection === "rotation") {
    sorted.sort((a, b) => b.qty - a.qty);
  } else if (_activeSection === "margin") {
    sorted.sort((a, b) => b.margin - a.margin);
  } else if (_activeSection === "contribution") {
    sorted.sort((a, b) => b.profit - a.profit);
  }

  tbody.innerHTML = sorted.map((p, index) => {
    return `
      <tr class="${index === 0 ? "row-good" : ""}">
        <td class="mono dim">${index + 1}</td>
        <td><strong>${p.name}</strong></td>
        <td class="mono font-bold" style="text-align:center;">${formatQuantity(p.qty)}</td>
        <td class="mono" style="text-align:left;">${formatCurrency(p.revenue)}</td>
        <td class="mono dim" style="text-align:left;">${formatCurrency(p.cost)}</td>
        <td class="mono font-bold text-good" style="text-align:left;">${formatCurrency(p.profit)}</td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="mono" style="width:36px; text-align:right;">${p.margin.toFixed(0)}%</span>
            <div class="progress-bar" style="height:6px; flex:1;"><div class="fill ${p.margin > 0 ? "indigo" : "bad"}" style="width:${Math.max(0, Math.min(100, p.margin))}%;"></div></div>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function paSetSection(sec) {
  _activeSection = sec;
  
  // Update active tab button style
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  
  const activeBtn = document.getElementById(`btn-pa-${sec}`);
  if (activeBtn) activeBtn.classList.add("active");

  renderStatsTable();
}

function paRange(range, event) {
  const fromEl = document.getElementById("pa-from");
  const toEl = document.getElementById("pa-to");
  if (!fromEl || !toEl) return;

  const today = new Date();
  let fromDate = todayString();
  let toDate = todayString();

  if (range === "today") {
    // Default values
  } else if (range === "month") {
    fromDate = startOfMonth();
  } else if (range === "last_month") {
    const lm = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    fromDate = lm.toISOString().split("T")[0];
    const le = new Date(today.getFullYear(), today.getMonth(), 0);
    toDate = le.toISOString().split("T")[0];
  }

  fromEl.value = fromDate;
  toEl.value = toDate;

  // Toggle active filter button style
  document.querySelectorAll(".quick-filter-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  if (event && event.target) {
    event.target.classList.add("active");
  }

  loadProductAnalytics();
}

function exportProductAnalyticsCSV() {
  const from = document.getElementById("pa-from")?.value || "";
  const to = document.getElementById("pa-to")?.value || "";
  
  const lines = [
    ["تحليلات دوران وربحية الأصناف", `من: ${from} إلى: ${to}`],
    [],
    ["الترتيب", "اسم الصنف", "الكمية المبيعة", "الإيراد (ر.س)", "التكلفة (ر.س)", "الربح المحقق (ر.س)", "الهامش %"]
  ];

  let sorted = [..._productStats];
  if (_activeSection === "rotation") {
    sorted.sort((a, b) => b.qty - a.qty);
  } else if (_activeSection === "margin") {
    sorted.sort((a, b) => b.margin - a.margin);
  } else if (_activeSection === "contribution") {
    sorted.sort((a, b) => b.profit - a.profit);
  }

  sorted.forEach((p, index) => {
    lines.push([
      index + 1,
      p.name,
      p.qty.toFixed(2),
      p.revenue.toFixed(2),
      p.cost.toFixed(2),
      p.profit.toFixed(2),
      `${p.margin.toFixed(1)}%`
    ]);
  });

  const csv = lines.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv' }));
  a.download = `Product_Analytics_${from}_to_${to}.csv`;
  a.click();
}
