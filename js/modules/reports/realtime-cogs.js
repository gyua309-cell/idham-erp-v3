// ============================================================
// IDHAM ERP — Real-Time Sales Cost & Gross Profit Monitor v3.0
// الشاشة اللحظية لتكلفة المبيعات ومجمل الربح — فرز الترتيب والألوان الثلاثية
// ============================================================

import { COLS, getAll } from "../../utils/db.js";
import { formatCurrency, formatDate } from "../../utils/formatters.js";

let _container = null;
let _salesInvoices = [];
let _productsMap = {};
let _customersMap = {};
let _usersMap = {};
let _period = "month";

// Sorting State
let _sortCol = "date";
let _sortDir = "desc";

export async function render(container) {
  _container = container;
  container.innerHTML = buildShell();
  setupEvents();
  await loadAndRenderData();
}

function buildShell() {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const firstDayStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

  return `
  <div id="rtc-module" style="display:flex; flex-direction:column; gap:16px; background:var(--bg-0); color:var(--text-0); min-height:100%; padding:4px;">
    
    <style>
      #rtc-module .rtc-card {
        background: var(--bg-card);
        border: 1px solid var(--border-soft);
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      #rtc-module .rtc-kpi {
        position: relative;
        overflow: hidden;
        border-radius: 16px;
        padding: 18px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 120px;
        box-shadow: 0 4px 18px rgba(0,0,0,0.04);
      }
      #rtc-module .rtc-kpi-bg-icon {
        position: absolute;
        top: 10px;
        left: 12px;
        font-size: 42px;
        opacity: 0.12;
        pointer-events: none;
      }
      #rtc-module .rtc-pbtn {
        padding: 6px 14px;
        border: none;
        background: transparent;
        color: var(--text-1);
        font-size: 11.5px;
        font-weight: 700;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.15s ease;
      }
      #rtc-module .rtc-pbtn.active {
        background: var(--brand);
        color: #ffffff;
        box-shadow: 0 2px 10px rgba(99,102,241,0.3);
      }
      #rtc-module .rtc-btn {
        padding: 8px 16px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s ease;
        border: 1px solid var(--border-soft);
        background: var(--bg-2);
        color: var(--text-0);
      }
      #rtc-module .rtc-btn-primary {
        background: linear-gradient(135deg, #d97706, #b45309);
        color: #ffffff;
        border-color: #d97706;
        box-shadow: 0 4px 14px rgba(217,119,6,0.3);
      }
      #rtc-module .rtc-btn-primary:hover {
        background: linear-gradient(135deg, #b45309, #92400e);
      }
      #rtc-module table th {
        background: var(--bg-2);
        color: var(--text-1);
        font-size: 11.5px;
        font-weight: 900;
        padding: 12px;
        border-bottom: 2px solid var(--border-soft);
        user-select: none;
      }
      #rtc-module table th.sortable {
        cursor: pointer;
        transition: background 0.15s ease;
      }
      #rtc-module table th.sortable:hover {
        background: var(--bg-3, var(--border-soft));
        color: var(--text-0);
      }
      #rtc-module table td {
        padding: 12px;
        border-bottom: 1px solid var(--border-soft);
      }
      #rtc-module table tr:hover td {
        background: var(--bg-2);
      }
    </style>

    <!-- Header Toolbar -->
    <div class="rtc-card" style="padding:16px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:16px;">
      <div style="display:flex; align-items:center; gap:14px;">
        <div style="width:48px; height:48px; border-radius:14px; background:linear-gradient(135deg,#f59e0b,#d97706); display:flex; align-items:center; justify-content:center; font-size:24px; color:#fff; box-shadow:0 4px 18px rgba(245,158,11,0.35);">
          ⚡
        </div>
        <div>
          <h1 style="font-size:19px; font-weight:900; margin:0; color:var(--text-0); display:flex; align-items:center; gap:8px;">
            الشاشة اللحظية لتكلفة المبيعات
            <span style="font-size:11px; padding:3px 10px; border-radius:20px; background:rgba(245,158,11,0.15); color:#d97706; border:1px solid rgba(245,158,11,0.3); font-weight:800;">مباشرة وبدقة الفواتير</span>
          </h1>
          <p style="font-size:11px; color:var(--text-2); margin:3px 0 0;">
            احتساب مباشر لحظي للمبيعات (بدون ضريبة) وتكلفة الشراء الفعلية والأرباح الصافية لكل فاتورة وبند
          </p>
        </div>
      </div>

      <!-- Controls & Date Filters -->
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:10px;">
        <!-- Date Inputs -->
        <div style="display:flex; align-items:center; gap:8px; background:var(--bg-2); padding:5px 12px; border-radius:12px; border:1px solid var(--border-soft);">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:11px; font-weight:800; color:var(--text-2);">من:</span>
            <input type="date" id="rtc-from" value="${firstDayStr}" style="background:var(--bg-card); color:var(--text-0); font-size:11.5px; font-weight:800; padding:5px 8px; border-radius:8px; border:1px solid var(--border-soft);" />
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:11px; font-weight:800; color:var(--text-2);">إلى:</span>
            <input type="date" id="rtc-to" value="${todayStr}" style="background:var(--bg-card); color:var(--text-0); font-size:11.5px; font-weight:800; padding:5px 8px; border-radius:8px; border:1px solid var(--border-soft);" />
          </div>
        </div>

        <!-- Quick Ranges -->
        <div style="display:flex; background:var(--bg-2); padding:3px; border-radius:12px; border:1px solid var(--border-soft);">
          <button class="rtc-pbtn" data-p="today">اليوم</button>
          <button class="rtc-pbtn" data-p="week">آخر 7 أيام</button>
          <button class="rtc-pbtn active" data-p="month">هذا الشهر</button>
          <button class="rtc-pbtn" data-p="all">كل الفترات</button>
        </div>

        <button id="rtc-refresh-btn" class="rtc-btn">🔄 تحديث</button>
        <button id="rtc-print-btn" class="rtc-btn rtc-btn-primary">🖨️ طباعة التقرير</button>
      </div>
    </div>

    <!-- 4 Glowing KPI Cards Grid (Side-by-Side) -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:14px;">
      
      <!-- Card 1: Live Revenue -->
      <div class="rtc-kpi" style="background:linear-gradient(135deg, rgba(99,102,241,0.12), rgba(79,70,229,0.03)); border:1px solid rgba(99,102,241,0.3);">
        <div class="rtc-kpi-bg-icon">🧾</div>
        <div style="font-size:11px; font-weight:900; color:#6366f1; text-transform:uppercase; letter-spacing:0.5px;">المبيعات اللحظية (بدون ضريبة)</div>
        <div id="rtc-kpi-sales" style="font-size:23px; font-weight:900; color:#4f46e5; margin:6px 0 2px; font-variant-numeric:tabular-nums;">0.00 <span style="font-size:12px; opacity:0.7;">ر.س</span></div>
        <div id="rtc-kpi-sales-count" style="font-size:11px; font-weight:800; color:var(--text-2);">0 فاتورة بيع</div>
      </div>

      <!-- Card 2: COGS (Purchase Cost) -->
      <div class="rtc-kpi" style="background:linear-gradient(135deg, rgba(244,63,94,0.12), rgba(225,29,72,0.03)); border:1px solid rgba(244,63,94,0.3);">
        <div class="rtc-kpi-bg-icon">📦</div>
        <div style="font-size:11px; font-weight:900; color:#f43f5e; text-transform:uppercase; letter-spacing:0.5px;">تكلفة المبيعات (سعر الشراء)</div>
        <div id="rtc-kpi-cost" style="font-size:23px; font-weight:900; color:#e11d48; margin:6px 0 2px; font-variant-numeric:tabular-nums;">0.00 <span style="font-size:12px; opacity:0.7;">ر.س</span></div>
        <div style="font-size:11px; font-weight:800; color:#f43f5e;">سعر شراء البضاعة المباعة</div>
      </div>

      <!-- Card 3: Live Gross Profit -->
      <div class="rtc-kpi" style="background:linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.03)); border:1px solid rgba(16,185,129,0.3);">
        <div class="rtc-kpi-bg-icon">💰</div>
        <div style="font-size:11px; font-weight:900; color:#10b981; text-transform:uppercase; letter-spacing:0.5px;">مجمل الربح الصافي اللحظي</div>
        <div id="rtc-kpi-profit" style="font-size:23px; font-weight:900; color:#059669; margin:6px 0 2px; font-variant-numeric:tabular-nums;">0.00 <span style="font-size:12px; opacity:0.7;">ر.س</span></div>
        <div style="font-size:11px; font-weight:800; color:#10b981;">صافي الربح قبل المصروفات</div>
      </div>

      <!-- Card 4: Profit Margin % -->
      <div class="rtc-kpi" style="background:linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.03)); border:1px solid rgba(245,158,11,0.3);">
        <div class="rtc-kpi-bg-icon">📊</div>
        <div style="font-size:11px; font-weight:900; color:#f59e0b; text-transform:uppercase; letter-spacing:0.5px;">نسبة هامش الربح الموزون</div>
        <div id="rtc-kpi-margin" style="font-size:23px; font-weight:900; color:#d97706; margin:6px 0 2px; font-variant-numeric:tabular-nums;">0.00%</div>
        <div style="font-size:11px; font-weight:800; color:#f59e0b;">معدل الربحية المباشر</div>
      </div>

    </div>

    <!-- Threshold Color Guide Bar -->
    <div class="rtc-card" style="padding:10px 16px; display:flex; flex-wrap:wrap; align-items:center; justify-content:between; gap:16px; font-size:11px; font-weight:800;">
      <div style="display:flex; align-items:center; gap:6px;">
        <span style="font-size:12px;">🎨 دليل ألوان الربحية:</span>
      </div>
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:12px;">
        <div style="display:flex; align-items:center; gap:6px; padding:3px 10px; border-radius:12px; background:rgba(239,68,68,0.12); color:#ef4444; border:1px solid rgba(239,68,68,0.25);">
          <span>🔴 أقل من 6%: ضعيف / منخفض</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px; padding:3px 10px; border-radius:12px; background:rgba(245,158,11,0.12); color:#d97706; border:1px solid rgba(245,158,11,0.25);">
          <span>🟡 من 6% إلى أقل من 10%: متوسط / مقبول</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px; padding:3px 10px; border-radius:12px; background:rgba(16,185,129,0.12); color:#10b981; border:1px solid rgba(16,185,129,0.25);">
          <span>🟢 10% فأكثر: ممتاز / مرتفع</span>
        </div>
      </div>
    </div>

    <!-- Search & Records Count -->
    <div class="rtc-card" style="padding:12px 16px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px;">
      <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:260px;">
        <span style="font-size:14px; opacity:0.6;">🔍</span>
        <input type="text" id="rtc-search" placeholder="بحث برقم الفاتورة أو اسم العميل أو المندوب..." style="width:100%; background:transparent; border:none; outline:none; font-size:12px; font-weight:800; color:var(--text-0);" />
      </div>
      <div id="rtc-records-count" style="font-size:12px; font-weight:900; color:var(--text-2);">
        عرض 0 فاتورة مطابقة
      </div>
    </div>

    <!-- Invoices Breakdown Table Card -->
    <div class="rtc-card" style="overflow:hidden;">
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; text-align:right; font-size:12px;">
          <thead>
            <tr>
              <th style="width:40px; text-align:center;">#</th>
              <th class="sortable" data-sort="number">رقم الفاتورة <span id="rtc-sort-number">⇅</span></th>
              <th class="sortable" data-sort="date">التاريخ والوقت <span id="rtc-sort-date">⇣</span></th>
              <th class="sortable" data-sort="customer">العميل / المندوب <span id="rtc-sort-customer">⇅</span></th>
              <th class="sortable" data-sort="salesNet" style="text-align:left;">المبيعات (بدون VAT) <span id="rtc-sort-salesNet">⇅</span></th>
              <th class="sortable" data-sort="cost" style="text-align:left;">تكلفة الشراء (COGS) <span id="rtc-sort-cost">⇅</span></th>
              <th class="sortable" data-sort="profit" style="text-align:left;">مجمل الربح <span id="rtc-sort-profit">⇅</span></th>
              <th class="sortable" data-sort="marginPct" style="text-align:center;">نسبة الربح % <span id="rtc-sort-marginPct">⇅</span></th>
              <th style="text-align:center;">التفاصيل</th>
            </tr>
          </thead>
          <tbody id="rtc-tbody" style="font-weight:700;">
            <tr>
              <td colspan="9" style="padding:40px; text-align:center; color:var(--text-2);">
                <div style="font-size:24px; margin-bottom:8px;">🔄</div>
                <div>جارٍ تحميل فواتير المبيعات واحتساب تكلفة الشراء اللحظية...</div>
              </td>
            </tr>
          </tbody>
          <tfoot id="rtc-tfoot" style="background:var(--bg-2); font-weight:900; border-top:2px solid var(--border-soft);">
            <!-- Populated dynamically -->
          </tfoot>
        </table>
      </div>
    </div>

  </div>
  `;
}

function setupEvents() {
  const fromEl = document.getElementById("rtc-from");
  const toEl = document.getElementById("rtc-to");

  fromEl?.addEventListener("change", () => {
    setActivePeriodBtn("custom");
    renderFiltered();
  });
  toEl?.addEventListener("change", () => {
    setActivePeriodBtn("custom");
    renderFiltered();
  });

  document.querySelectorAll("#rtc-module .rtc-pbtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = btn.dataset.p;
      _period = p;
      setActivePeriodBtn(p);
      applyPeriodPreset(p);
      renderFiltered();
    });
  });

  // Sort Header Clicks
  document.querySelectorAll("#rtc-module th.sortable").forEach(th => {
    th.addEventListener("click", () => {
      const col = th.dataset.sort;
      if (_sortCol === col) {
        _sortDir = _sortDir === "asc" ? "desc" : "asc";
      } else {
        _sortCol = col;
        _sortDir = "desc";
      }
      updateSortHeaderIcons();
      renderFiltered();
    });
  });

  document.getElementById("rtc-search")?.addEventListener("input", () => {
    renderFiltered();
  });

  document.getElementById("rtc-refresh-btn")?.addEventListener("click", async () => {
    await loadAndRenderData(true);
  });

  document.getElementById("rtc-print-btn")?.addEventListener("click", () => {
    window.print();
  });
}

function updateSortHeaderIcons() {
  const cols = ["number", "date", "customer", "salesNet", "cost", "profit", "marginPct"];
  cols.forEach(c => {
    const el = document.getElementById(`rtc-sort-${c}`);
    if (!el) return;
    if (c === _sortCol) {
      el.innerText = _sortDir === "asc" ? "⇡" : "⇣";
      el.style.color = "#d97706";
    } else {
      el.innerText = "⇅";
      el.style.color = "var(--text-2)";
    }
  });
}

function setActivePeriodBtn(pKey) {
  document.querySelectorAll("#rtc-module .rtc-pbtn").forEach(b => {
    if (b.dataset.p === pKey) {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });
}

function applyPeriodPreset(p) {
  const now = new Date();
  const formatLocalDate = d => {
    const yr = d.getFullYear();
    const mon = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mon}-${day}`;
  };

  const fromEl = document.getElementById("rtc-from");
  const toEl = document.getElementById("rtc-to");
  if (!fromEl || !toEl) return;

  if (p === "today") {
    fromEl.value = formatLocalDate(now);
    toEl.value = formatLocalDate(now);
  } else if (p === "week") {
    const w = new Date(now); w.setDate(w.getDate() - 7);
    fromEl.value = formatLocalDate(w);
    toEl.value = formatLocalDate(now);
  } else if (p === "month") {
    fromEl.value = formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1));
    toEl.value = formatLocalDate(now);
  } else if (p === "all") {
    fromEl.value = "2020-01-01";
    toEl.value = formatLocalDate(now);
  }
}

async function loadAndRenderData(force = false) {
  try {
    const [invoices, products, customers, users] = await Promise.all([
      getAll(COLS.salesInvoices()),
      getAll(COLS.products()),
      getAll(COLS.customers()),
      getAll(COLS.users())
    ]);

    _salesInvoices = invoices.filter(inv => inv.status !== "cancelled");
    
    _productsMap = {};
    products.forEach(p => { _productsMap[p.id] = p; });

    _customersMap = {};
    customers.forEach(c => { _customersMap[c.id] = c; });

    _usersMap = {};
    users.forEach(u => { _usersMap[u.id] = u; });

    renderFiltered();
  } catch (err) {
    console.error("Error loading sales cost data:", err);
    const tbody = document.getElementById("rtc-tbody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="9" style="padding:20px; text-align:center; color:#ef4444; font-weight:800;">خطأ في تحميل البيانات: ${err.message}</td></tr>`;
    }
  }
}

// 3-Color Threshold Badge Helper Function
function getMarginBadgeStyle(marginPct) {
  if (marginPct < 6) {
    return {
      bg: 'rgba(239,68,68,0.15)',
      color: '#ef4444',
      border: 'rgba(239,68,68,0.3)',
      text: marginPct.toFixed(1) + '%'
    };
  } else if (marginPct < 10) {
    return {
      bg: 'rgba(245,158,11,0.15)',
      color: '#d97706',
      border: 'rgba(245,158,11,0.3)',
      text: marginPct.toFixed(1) + '%'
    };
  } else {
    return {
      bg: 'rgba(16,185,129,0.15)',
      color: '#10b981',
      border: 'rgba(16,185,129,0.3)',
      text: marginPct.toFixed(1) + '%'
    };
  }
}

function renderFiltered() {
  const fromVal = document.getElementById("rtc-from")?.value || "";
  const toVal = document.getElementById("rtc-to")?.value || "";
  const searchVal = (document.getElementById("rtc-search")?.value || "").trim().toLowerCase();

  const filtered = _salesInvoices.filter(inv => {
    const invDate = inv.date || "";
    if (fromVal && invDate < fromVal) return false;
    if (toVal && invDate > toVal) return false;

    if (searchVal) {
      const num = (inv.number || inv.invoiceNumber || "").toLowerCase();
      const cust = (inv.customerName || _customersMap[inv.customerId]?.name || "").toLowerCase();
      const rep = (inv.createdByName || inv.repName || _usersMap[inv.createdBy]?.name || "").toLowerCase();
      if (!num.includes(searchVal) && !cust.includes(searchVal) && !rep.includes(searchVal)) {
        return false;
      }
    }
    return true;
  });

  // Calculate invoice level salesNet, cost, profit, and margin for sorting
  const preparedInvoices = filtered.map(inv => {
    const invNum = inv.number || inv.invoiceNumber || inv.id;
    const dateStr = inv.date || "";
    const custName = inv.customerName || _customersMap[inv.customerId]?.name || "عميل عام";
    const repName = inv.createdByName || inv.repName || _usersMap[inv.createdBy]?.name || "المبيعات";

    let invSalesNet = 0;
    let invCostSum = 0;

    const linesDetail = (inv.lines || []).map(line => {
      const qty = parseFloat(line.qty) || 0;
      const unitPrice = parseFloat(line.unitPrice || line.price) || 0;
      const discount = parseFloat(line.discount) || 0;
      const lineSubtotal = line.subtotal !== undefined ? parseFloat(line.subtotal) : (qty * unitPrice - discount);
      
      const prod = line.productId ? _productsMap[line.productId] : null;
      const unitCost = parseFloat(line.costPrice || line.purchasePrice || prod?.averageCost || prod?.costPrice || 0);
      const lineTotalCost = qty * unitCost;
      const lineProfit = lineSubtotal - lineTotalCost;
      const lineMargin = lineSubtotal > 0 ? (lineProfit / lineSubtotal) * 100 : 0;

      invSalesNet += lineSubtotal;
      invCostSum += lineTotalCost;

      return {
        productName: line.productName || prod?.name || line.productId,
        qty,
        unitPrice,
        lineSubtotal,
        unitCost,
        lineTotalCost,
        lineProfit,
        lineMargin
      };
    });

    if (invSalesNet <= 0) {
      invSalesNet = parseFloat(inv.subtotal || inv.totalBeforeTax || 0);
    }
    if (invCostSum <= 0 && inv.totalCost) {
      invCostSum = parseFloat(inv.totalCost);
    }

    const invProfit = invSalesNet - invCostSum;
    const invMarginPct = invSalesNet > 0 ? (invProfit / invSalesNet) * 100 : 0;

    return {
      inv,
      invNum,
      dateStr,
      custName,
      repName,
      invSalesNet,
      invCostSum,
      invProfit,
      invMarginPct,
      linesDetail
    };
  });

  // Sort Array dynamically
  preparedInvoices.sort((a, b) => {
    let valA, valB;
    if (_sortCol === "number") {
      valA = a.invNum; valB = b.invNum;
    } else if (_sortCol === "date") {
      valA = a.dateStr; valB = b.dateStr;
    } else if (_sortCol === "customer") {
      valA = a.custName; valB = b.custName;
    } else if (_sortCol === "salesNet") {
      valA = a.invSalesNet; valB = b.invSalesNet;
    } else if (_sortCol === "cost") {
      valA = a.invCostSum; valB = b.invCostSum;
    } else if (_sortCol === "profit") {
      valA = a.invProfit; valB = b.invProfit;
    } else if (_sortCol === "marginPct") {
      valA = a.invMarginPct; valB = b.invMarginPct;
    } else {
      valA = a.dateStr; valB = b.dateStr;
    }

    let comp = 0;
    if (typeof valA === "number" && typeof valB === "number") {
      comp = valA - valB;
    } else {
      comp = String(valA || "").localeCompare(String(valB || ""));
    }

    return _sortDir === "asc" ? comp : -comp;
  });

  let totalSalesNet = 0;
  let totalCostSum = 0;
  let totalProfitSum = 0;

  const tbody = document.getElementById("rtc-tbody");
  if (!tbody) return;

  if (preparedInvoices.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="padding:40px; text-align:center; color:var(--text-2);">لا توجد فواتير مبيعات مطابقة للفترة المحددة</td></tr>`;
    updateKPIs(0, 0, 0, 0);
    return;
  }

  let html = "";

  preparedInvoices.forEach((item, index) => {
    totalSalesNet += item.invSalesNet;
    totalCostSum += item.invCostSum;
    totalProfitSum += item.invProfit;

    const rowId = `rtc-row-${index}`;
    const detailId = `rtc-detail-${index}`;

    // Get exact 3-color badge style
    const bStyle = getMarginBadgeStyle(item.invMarginPct);

    html += `
    <tr id="${rowId}">
      <td style="text-align:center; color:var(--text-2); font-family:monospace;">${index + 1}</td>
      <td style="font-family:monospace; font-weight:900; color:#d97706;">${item.invNum}</td>
      <td style="color:var(--text-2); font-family:monospace;">${formatDate(item.dateStr || item.inv.createdAt)}</td>
      <td>
        <div style="font-weight:900; color:var(--text-0);">${item.custName}</div>
        <div style="font-size:10px; color:var(--text-2); font-weight:400;">المندوب: ${item.repName}</div>
      </td>
      <td style="text-align:left; font-family:monospace; font-weight:900; color:var(--text-0);">${formatCurrency(item.invSalesNet)}</td>
      <td style="text-align:left; font-family:monospace; font-weight:800; color:#e11d48;">${formatCurrency(item.invCostSum)}</td>
      <td style="text-align:left; font-family:monospace; font-weight:900; color:${item.invProfit >= 0 ? '#059669' : '#e11d48'};">${formatCurrency(item.invProfit)}</td>
      <td style="text-align:center;">
        <span style="padding:4px 12px; border-radius:20px; font-size:11.5px; font-weight:900; background:${bStyle.bg}; color:${bStyle.color}; border:1px solid ${bStyle.border}; box-shadow:0 2px 8px ${bStyle.color}22;">
          ${bStyle.text}
        </span>
      </td>
      <td style="text-align:center;">
        <button onclick="window.toggleRtcDetail('${detailId}')" style="padding:4px 10px; border-radius:8px; font-size:10.5px; font-weight:800; border:1px solid var(--border-soft); background:var(--bg-2); color:var(--text-0); cursor:pointer;">
          🔍 التفاصيل
        </button>
      </td>
    </tr>

    <!-- Collapsible Detail Row -->
    <tr id="${detailId}" style="display:none; background:var(--bg-2);">
      <td colspan="9" style="padding:14px;">
        <div style="background:var(--bg-card); border-radius:12px; padding:14px; border:1px solid var(--border-soft);">
          <div style="font-size:12px; font-weight:900; color:var(--text-0); margin-bottom:8px;">
            📦 أصناف الفاتورة وحساب التكلفة المباشرة (سعر الشراء):
          </div>
          <table style="width:100%; text-align:right; font-size:11px; border-collapse:collapse;">
            <thead>
              <tr style="background:var(--bg-2); color:var(--text-1);">
                <th style="padding:8px;">اسم الصنف</th>
                <th style="padding:8px; text-align:center;">الكمية</th>
                <th style="padding:8px; text-align:left;">سعر البيع (بدون VAT)</th>
                <th style="padding:8px; text-align:left;">إجمالي المبيعات</th>
                <th style="padding:8px; text-align:left;">سعر الشراء (التكلفة)</th>
                <th style="padding:8px; text-align:left;">إجمالي التكلفة</th>
                <th style="padding:8px; text-align:left;">الربح الصافي</th>
                <th style="padding:8px; text-align:center;">نسبة الربح %</th>
              </tr>
            </thead>
            <tbody>
              ${item.linesDetail.map(ld => {
                const lineBadge = getMarginBadgeStyle(ld.lineMargin);
                return `
                <tr style="border-bottom:1px solid var(--border-soft);">
                  <td style="padding:8px; font-weight:800; color:var(--text-0);">${ld.productName}</td>
                  <td style="padding:8px; text-align:center; font-family:monospace; font-weight:800;">${ld.qty}</td>
                  <td style="padding:8px; text-align:left; font-family:monospace;">${formatCurrency(ld.unitPrice)}</td>
                  <td style="padding:8px; text-align:left; font-family:monospace; font-weight:900; color:var(--text-0);">${formatCurrency(ld.lineSubtotal)}</td>
                  <td style="padding:8px; text-align:left; font-family:monospace; color:#f43f5e;">${formatCurrency(ld.unitCost)}</td>
                  <td style="padding:8px; text-align:left; font-family:monospace; font-weight:900; color:#e11d48;">${formatCurrency(ld.lineTotalCost)}</td>
                  <td style="padding:8px; text-align:left; font-family:monospace; font-weight:900; color:${ld.lineProfit >= 0 ? '#059669' : '#e11d48'};">${formatCurrency(ld.lineProfit)}</td>
                  <td style="padding:8px; text-align:center;">
                    <span style="padding:2px 8px; border-radius:12px; font-size:10.5px; font-weight:900; background:${lineBadge.bg}; color:${lineBadge.color}; border:1px solid ${lineBadge.border};">
                      ${lineBadge.text}
                    </span>
                  </td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
    `;
  });

  tbody.innerHTML = html;

  // Footer Summary
  const tfoot = document.getElementById("rtc-tfoot");
  const overallMargin = totalSalesNet > 0 ? (totalProfitSum / totalSalesNet) * 100 : 0;
  const overallBadge = getMarginBadgeStyle(overallMargin);

  if (tfoot) {
    tfoot.innerHTML = `
    <tr>
      <td colspan="4" style="padding:14px; text-align:right; font-weight:900;">الإجمالي التراكمي بالفترة المحددة:</td>
      <td style="padding:14px; text-align:left; font-family:monospace; font-weight:900; color:#d97706; font-size:13px;">${formatCurrency(totalSalesNet)}</td>
      <td style="padding:14px; text-align:left; font-family:monospace; font-weight:900; color:#e11d48; font-size:13px;">${formatCurrency(totalCostSum)}</td>
      <td style="padding:14px; text-align:left; font-family:monospace; font-weight:900; color:${totalProfitSum >= 0 ? '#059669' : '#e11d48'}; font-size:13px;">${formatCurrency(totalProfitSum)}</td>
      <td style="padding:14px; text-align:center;">
        <span style="padding:4px 14px; border-radius:20px; font-size:12px; font-weight:900; background:${overallBadge.bg}; color:${overallBadge.color}; border:1px solid ${overallBadge.border};">
          ${overallBadge.text}
        </span>
      </td>
      <td style="padding:14px;"></td>
    </tr>
    `;
  }

  updateKPIs(totalSalesNet, totalCostSum, totalProfitSum, preparedInvoices.length);
}

function updateKPIs(salesNet, costSum, profitSum, count) {
  const marginPct = salesNet > 0 ? (profitSum / salesNet) * 100 : 0;

  const salesEl = document.getElementById("rtc-kpi-sales");
  const salesCountEl = document.getElementById("rtc-kpi-sales-count");
  const costEl = document.getElementById("rtc-kpi-cost");
  const profitEl = document.getElementById("rtc-kpi-profit");
  const marginEl = document.getElementById("rtc-kpi-margin");
  const countEl = document.getElementById("rtc-records-count");

  if (salesEl) salesEl.innerHTML = `${formatCurrency(salesNet)} <span style="font-size:12px; opacity:0.7;">ر.س</span>`;
  if (salesCountEl) salesCountEl.innerText = `${count} فاتورة بيع`;
  if (costEl) costEl.innerHTML = `${formatCurrency(costSum)} <span style="font-size:12px; opacity:0.7;">ر.س</span>`;
  if (profitEl) profitEl.innerHTML = `${formatCurrency(profitSum)} <span style="font-size:12px; opacity:0.7;">ر.س</span>`;
  if (marginEl) marginEl.innerText = `${marginPct.toFixed(1)}%`;
  if (countEl) countEl.innerText = `عرض ${count} فاتورة مطابقة`;
}

window.toggleRtcDetail = function(detailId) {
  const el = document.getElementById(detailId);
  if (el) {
    el.style.display = el.style.display === "none" ? "table-row" : "none";
  }
};
