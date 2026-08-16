// ============================================================
// IDHAM ERP — Executive Dashboard Module
// Fully resilient with fallback metrics and Chart.js integration
// ============================================================

import { COLS, getAll, collection } from "../utils/db.js";
import { formatCurrency, formatDate, todayString, startOfMonth, getStockStatusBadge, getInvoiceStatusBadge } from "../utils/formatters.js";
import { query, where, orderBy, limit, getDocs } from "../utils/db.js";
import { db, COMPANY_ID } from "../firebase-config.js";

export async function render(container, user) {
  const userName = user?.displayName || "مدير النظام";
  container.innerHTML = `
    <!-- New Advanced Dashboard Hero -->
    <div class="dashboard-hero animate-fade-in">
      <div class="hero-greeting">
        <h1>مرحباً بك مجدداً، ${userName} 👋</h1>
        <p>إليك ملخص أداء شركتك والتحليلات المالية المباشرة</p>
      </div>
      <div class="hero-actions">
        <div class="quick-filters" style="margin:0; border:none; background:transparent;">
          <button class="quick-filter-btn" onclick="dashSetRange('today')">اليوم</button>
          <button class="quick-filter-btn" onclick="dashSetRange('week')">الأسبوع</button>
          <button class="quick-filter-btn active" onclick="dashSetRange('month')">هذا الشهر</button>
          <button class="quick-filter-btn" onclick="dashSetRange('last_month')">الشهر الماضي</button>
        </div>
        <div style="width:1px; height:24px; background:var(--border-soft); margin:0 8px;"></div>
        <input type="date" id="dash-from" value="${startOfMonth()}" style="background:var(--bg-2); border:1px solid var(--border-soft); color:var(--text-0); padding:6px 10px; border-radius:8px;" />
        <span style="color:var(--text-2); font-size:12px;">إلى</span>
        <input type="date" id="dash-to" value="${todayString()}" style="background:var(--bg-2); border:1px solid var(--border-soft); color:var(--text-0); padding:6px 10px; border-radius:8px;" />
        <button class="btn btn-primary btn-sm" onclick="loadDashboard()" style="margin-right:8px; border-radius:8px; padding:6px 16px;">
          🔄 تحديث
        </button>
      </div>
    </div>

    <div class="page-content" id="dash-content" style="padding: 0;">
      <div class="page-loading"><div class="loading-spinner"></div><span>جارٍ تحليل البيانات…</span></div>
    </div>`;

  window.dashSetRange = (range) => {
    const today = todayString();
    const d = new Date();
    document.querySelectorAll(".quick-filter-btn").forEach(b => b.classList.remove("active"));
    if (event && event.target) event.target.classList.add("active");

    if (range === "today") {
      document.getElementById("dash-from").value = today;
      document.getElementById("dash-to").value   = today;
    } else if (range === "week") {
      const mon = new Date(d);
      mon.setDate(d.getDate() - d.getDay() + 1);
      document.getElementById("dash-from").value = mon.toISOString().split("T")[0];
      document.getElementById("dash-to").value   = today;
    } else if (range === "month") {
      document.getElementById("dash-from").value = startOfMonth();
      document.getElementById("dash-to").value   = today;
    } else if (range === "last_month") {
      const start = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      const end   = new Date(d.getFullYear(), d.getMonth(), 0);
      document.getElementById("dash-from").value = start.toISOString().split("T")[0];
      document.getElementById("dash-to").value   = end.toISOString().split("T")[0];
    }
    loadDashboard();
  };

  window.loadDashboard = async () => {
    const from = document.getElementById("dash-from")?.value || startOfMonth();
    const to   = document.getElementById("dash-to")?.value   || todayString();
    await renderDashboardContent(from, to);
  };

  await renderDashboardContent(startOfMonth(), todayString());
}

async function renderDashboardContent(fromStr, toStr) {
  const content = document.getElementById("dash-content");
  if (!content) return;

  content.innerHTML = `<div class="page-loading"><div class="loading-spinner"></div></div>`;

  let invoices = [];
  let purchases = [];
  let stockWarnings = [];
  let receipts = [];
  let collections = [];
  let jes = [];
  let accounts = [];
  let products = [];

  const safeDateStr = (item) => {
    if (!item) return "";
    if (item.date) return item.date;
    if (!item.createdAt) return "";
    if (item.createdAt.toDate) return item.createdAt.toDate().toISOString().split("T")[0];
    if (item.createdAt.seconds) return new Date(item.createdAt.seconds * 1000).toISOString().split("T")[0];
    if (typeof item.createdAt === "string") return item.createdAt.split("T")[0];
    return "";
  };

  // ── Show instant skeleton so the page appears immediately ──
  content.innerHTML = `
    <div class="animate-fade-in">
      <div class="kpi-grid mb-24">
        ${[1,2,3,4].map(() => `
          <div class="kpi-card" style="min-height:110px;">
            <div class="skeleton" style="width:40px;height:40px;border-radius:10px;margin-bottom:12px;"></div>
            <div class="skeleton" style="width:60%;height:14px;margin-bottom:8px;"></div>
            <div class="skeleton" style="width:80%;height:22px;margin-bottom:6px;"></div>
            <div class="skeleton" style="width:50%;height:12px;"></div>
          </div>`).join("")}
      </div>
      <div class="content-grid-sidebar mb-24">
        <div class="card" style="border-radius:16px;min-height:280px;">
          <div class="skeleton" style="width:100%;height:100%;min-height:280px;border-radius:16px;"></div>
        </div>
        <div class="card" style="border-radius:16px;min-height:280px;">
          <div class="skeleton" style="width:100%;height:100%;min-height:280px;border-radius:16px;"></div>
        </div>
      </div>
    </div>`;

  try {
    const colQ = collection(db, `companies/${COMPANY_ID}/collections`);
    const jeQ = collection(db, `companies/${COMPANY_ID}/journalEntries`);
    const coaQ = collection(db, `companies/${COMPANY_ID}/chartOfAccounts`);

    // Fetch concurrently to reduce load time using L1/L2 cache
    const [invSnap, purSnap, stockSnap, rcptSnap, jeSnap, coaSnap, colSnap, prodSnap] = await Promise.all([
      getAll(COLS.salesInvoices(), [limit(5000)]).catch(e => { console.warn(e); return []; }),
      getAll(COLS.purchaseInvoices(), [limit(5000)]).catch(e => { console.warn(e); return []; }),
      getAll(COLS.stockByWarehouse()).catch(e => { console.warn(e); return []; }),
      getAll(COLS.receipts(), [limit(5000)]).catch(e => { console.warn(e); return []; }),
      getAll(jeQ, [where("status", "==", "posted")]).catch(e => { console.warn(e); return []; }),
      getAll(coaQ).catch(e => { console.warn(e); return []; }),
      getAll(colQ, [limit(5000)]).catch(e => { console.warn(e); return []; }),
      getAll(COLS.products()).catch(e => { console.warn(e); return []; })
    ]);

    invoices = invSnap;
    purchases = purSnap;
    receipts = rcptSnap;
    collections = colSnap;
    jes = jeSnap;
    accounts = coaSnap;
    products = prodSnap;
    stockWarnings = stockSnap.filter(s => s.stockStatus === "out" || s.stockStatus === "low").slice(0, 10);

    // Filter in JS by selected date range
    invoices = invoices.filter(i => {
      const d = safeDateStr(i);
      return (!fromStr || d >= fromStr) && (!toStr || d <= toStr);
    });
    purchases = purchases.filter(i => {
      const d = safeDateStr(i);
      return (!fromStr || d >= fromStr) && (!toStr || d <= toStr);
    });
    receipts = receipts.filter(r => {
      const d = safeDateStr(r);
      return (!fromStr || d >= fromStr) && (!toStr || d <= toStr);
    });
    collections = collections.filter(c => {
      const d = safeDateStr(c);
      return (!fromStr || d >= fromStr) && (!toStr || d <= toStr);
    });

  } catch (e) {
    console.error("Dashboard fetch error", e);
  }

  // ──────── Calculations ────────
  const totalSales   = invoices.filter(i => i.status !== "cancelled").reduce((s, i) => s + (i.totalWithVat || i.total || 0), 0);
  const invoiceCount = invoices.filter(i => i.status !== "cancelled").length;
  const avgInvoice   = invoiceCount > 0 ? totalSales / invoiceCount : 0;

  // 1. Revenues and COGS directly from Invoices and Items (or fallback to General Ledger)
  const activeInvoices = invoices.filter(i => i.status !== "cancelled");
  const prodCostMap = {};
  products.forEach(p => { prodCostMap[p.id] = parseFloat(p.costPrice || p.purchasePrice || 0); });

  let totalSalesNet = 0;
  let cogsTotal = 0;

  activeInvoices.forEach(inv => {
    const invSubtotal = parseFloat(inv.subtotal || inv.totalWithoutVat || inv.netTotal || (inv.totalWithVat ? inv.totalWithVat / 1.15 : 0));
    totalSalesNet += invSubtotal;
    (inv.items || inv.lines || []).forEach(item => {
      const q = parseFloat(item.qty || item.quantity || 0);
      const c = parseFloat(item.costPrice || item.purchasePrice || prodCostMap[item.productId || item.id] || 0);
      cogsTotal += q * c;
    });
  });

  // Fallback to JEs if cogsTotal is 0
  if (cogsTotal === 0 && jes.length > 0) {
    jes.filter(j => j.type === 'salesCOGS' || j.sourceType === 'salesCOGS' || (j.description && j.description.includes('تكلفة بضاعة'))).forEach(j => {
      cogsTotal += parseFloat(j.totalDebit || j.amount || 0);
    });
  }

  const grossProfit = totalSalesNet - cogsTotal;
  const grossMargin = totalSalesNet > 0 ? (grossProfit / totalSalesNet * 100).toFixed(1) : "0.0";

  // ──────────────────────────────────────────────────────────────────────────
  // 2. المحصّل = مجموع سندات القبض فقط (لا يعتمد على paymentMethod)
  //    المتبقي = إجمالي الفواتير - المحصّل من سندات القبض
  //    حسابات الموردين تعتمد على سندات الصرف فقط
  // ──────────────────────────────────────────────────────────────────────────
  const customerReceipts = receipts.filter(r => r.entityType === "customer" || !r.entityType || r.type === "receipt");
  const totalCollected   = customerReceipts.reduce((s, r) => s + (r.amount || 0), 0);
  const totalOutstanding = Math.max(0, totalSales - totalCollected);

  // المشتريات
  // المشتريات قبل الضريبة كرقم محاسبي رئيسي
  const totalPurchasesNet = purchases.filter(p => p.status !== "cancelled").reduce((s, p) => {
    const sub = parseFloat(p.subtotal || p.totalBeforeTax || p.totalWithoutVat || 0);
    const tot = parseFloat(p.totalWithVat || p.total || p.grandTotal || 0);
    return s + (sub > 0 ? sub : tot / 1.15);
  }, 0);
  const totalPurchases = purchases.filter(p => p.status !== "cancelled").reduce((s, p) => s + (p.totalWithVat || p.total || p.grandTotal || 0), 0);

  // Reps totals
  const repTotals = {};
  invoices.forEach(inv => {
    let rep = inv.repName || inv.repId;
    if (!rep || rep === "بدون مندوب" || rep === "المندوب الرئيسي") {
      rep = "المستودع الرئيسي (مبيعات مباشرة)";
    }
    repTotals[rep] = (repTotals[rep] || 0) + (inv.totalWithVat || inv.total || 0);
  });
  const topReps = Object.entries(repTotals).sort(([,a],[,b]) => b - a).slice(0, 5);
  const recentInvs = invoices.slice(0, 8);

  content.innerHTML = `
    <div class="animate-fade-in">
      <div class="kpi-grid mb-24">
        ${kpiCard("💰", "إجمالي المبيعات", formatCurrency(totalSales), `بدون ضريبة: ${formatCurrency(totalSalesNet)}`, "sales", "")}
        ${kpiCard("🧾", "عدد الفواتير", invoiceCount.toLocaleString("ar"), `متوسط الفاتورة: ${formatCurrency(avgInvoice)}`, "invoices", "")}
        ${kpiCard("✅", "المبالغ المحصلة", formatCurrency(totalCollected), `المتبقي: ${formatCurrency(totalOutstanding)}`, "receipts", "")}
        ${kpiCard("📈", "مجمل الربح", formatCurrency(grossProfit), `هامش الربح: ${grossMargin}%`, "profit", grossProfit >= 0 ? "up" : "down")}
      </div>

      <!-- Charts & Top Reps Row -->
      <div class="content-grid-sidebar mb-24">
        <!-- Daily Sales Chart Card -->
        <div class="card" style="border-radius:16px; background:var(--bg-1); border:1px solid var(--border-soft);">
          <div class="card-header" style="border-bottom: 1px solid var(--border-soft); padding:20px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="kpi-icon-glass" style="width:36px; height:36px; font-size:18px; border-radius:8px;">📈</div>
              <div>
                <h3 style="font-size:16px;font-family:var(--font-heading);color:var(--text-0);">تحليل المبيعات اليومية</h3>
                <span class="text-2" style="font-size:12px;">الفترة: ${fromStr} — ${toStr}</span>
              </div>
            </div>
          </div>
          <div class="card-body" style="padding:24px;">
            <div class="chart-container" style="height:280px;position:relative;">
              <canvas id="sales-chart"></canvas>
            </div>
          </div>
        </div>

        <!-- Top Sales Reps Ranking Card -->
        <div class="card" style="border-radius:16px; background:var(--bg-1); border:1px solid var(--border-soft);">
          <div class="card-header" style="border-bottom: 1px solid var(--border-soft); padding:20px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="kpi-icon-glass" style="width:36px; height:36px; font-size:18px; border-radius:8px;">🏆</div>
              <h3 style="font-size:16px;font-family:var(--font-heading);color:var(--text-0);">نخبة المناديب</h3>
            </div>
          </div>
          <div class="card-body" style="padding:20px;">
            ${topReps.length === 0 ? `
              <div class="empty-state" style="padding:40px 0;">
                <div class="empty-icon">🚚</div>
                <h3>لا توجد مبيعات</h3>
                <button class="btn btn-secondary btn-sm mt-12" onclick="window.seedDemoData()">تحميل بيانات تجريبية 🌾</button>
              </div>` : topReps.map(([name, total], i) => {
                const maxVal = topReps[0][1];
                const pct = maxVal > 0 ? (total / maxVal * 100) : 0;
                const colors = ['#E58A2B', '#00B4D8', '#2DD4BF', '#6366F1', '#A855F7'];
                return `
                <div style="margin-bottom:20px;">
                  <div class="flex items-center justify-between mb-8" style="font-size:13px;">
                    <span class="font-heading font-semibold" style="color:#fff;">
                      <span style="display:inline-block; width:20px; height:20px; text-align:center; background:rgba(255,255,255,0.1); border-radius:50%; line-height:20px; margin-left:6px; font-size:11px;">${i + 1}</span>
                      ${name}
                    </span>
                    <span class="mono font-bold" style="color:${colors[i]}">${formatCurrency(total)}</span>
                  </div>
                  <div class="progress-bar" style="height:6px; background:rgba(255,255,255,0.05);">
                    <div class="fill" style="width:${pct}%; background:${colors[i]}; border-radius:4px; box-shadow: 0 0 10px ${colors[i]}80;"></div>
                  </div>
                </div>`;
              }).join("")}
          </div>
        </div>
      </div>

      <!-- Recent Invoices Table (Full Width) -->
      <div class="card mb-24" style="border-radius:16px;">
        <div class="card-header" style="padding:20px;">
          <h3 style="font-size:16px;font-family:var(--font-heading);">🧾 الفواتير صدارة النظام</h3>
          <button class="btn btn-sm btn-secondary" onclick="navigate('sales-invoices')">عرض السجل الكامل</button>
        </div>
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>الرقم المرجعي</th>
                <th>العميل</th>
                <th>المندوب</th>
                <th>التاريخ</th>
                <th>طريقة الدفع</th>
                <th>الحالة</th>
                <th style="text-align:left;">المبلغ الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${recentInvs.length === 0 ? `
                <tr><td colspan="7" style="text-align:center;color:var(--text-2);padding:40px;">
                  <div class="empty-icon" style="font-size:36px;margin-bottom:8px;">📄</div>
                  <div>لا توجد حركات مسجلة</div>
                </td></tr>` : recentInvs.map(inv => `
                <tr onclick="navigate('sales-invoices')" style="cursor:pointer; transition: background 0.2s;">
                  <td class="mono text-indigo font-bold">#${inv.number || inv.id.slice(0,8)}</td>
                  <td class="font-semibold" style="color:var(--text-0);">${inv.customerName || "عميل نقدي"}</td>
                  <td class="dim">${inv.repName || "—"}</td>
                  <td class="dim">${formatDate(inv.createdAt)}</td>
                  <td><span class="badge ${inv.paymentMethod === 'cash' ? 'good' : 'warn'}">${inv.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}</span></td>
                  <td>${getInvoiceStatusBadge(inv.status || "pending")}</td>
                  <td class="mono font-bold text-good" style="text-align:left; font-size:14px;">${formatCurrency(inv.totalWithVat)}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;

  renderSalesChart(invoices, fromStr, toStr);
}

function kpiCard(icon, label, value, sub, cardType, trend, trendDir = "up") {
  const trendClass = trendDir === "up" ? "trend-up" : "trend-down";
  const trendIcon = trendDir === "up" ? "↑" : "↓";
  const gradientClass = {
    sales: "g-blue",
    invoices: "g-purple",
    receipts: "g-green",
    purchases: "g-orange"
  }[cardType] || "g-blue";
  
  return `
    <div class="kpi-card ${gradientClass}">
      <div class="kpi-header-row">
        <div class="kpi-icon-glass">${icon}</div>
        <div class="trend-badge">${trendIcon} ${trend}</div>
      </div>
      <div class="kpi-content">
        <div class="kpi-label">${label}</div>
        <div class="kpi-value mono">${value}</div>
        <div class="kpi-sub">${sub}</div>
      </div>
    </div>`;
}

function renderSalesChart(invoices, fromStr, toStr) {
  const canvas = document.getElementById("sales-chart");
  if (!canvas || typeof Chart === "undefined") return;

  const daysMap = {};
  const start = new Date(fromStr);
  const end   = new Date(toStr);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split("T")[0];
    daysMap[key] = 0;
  }

  invoices.forEach(inv => {
    const key = inv.createdAt?.toDate ? inv.createdAt.toDate().toISOString().split("T")[0] : (inv.date || "");
    if (daysMap[key] !== undefined) {
      daysMap[key] += inv.totalWithVat || 0;
    }
  });

  const labels = Object.keys(daysMap).map(k => k.slice(5)); // MM-DD
  const data = Object.values(daysMap);

  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
  gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.15)');
  gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

  const isLight = document.body.classList.contains('theme-light');
  const tickColor = isLight ? '#0F172A' : '#9CA3AF';
  const gridColor = isLight ? 'rgba(15, 23, 42, 0.15)' : 'rgba(150, 150, 150, 0.1)';
  const borderAxisColor = isLight ? '#0F172A' : '#475569';

  new Chart(canvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "المبيعات اليومية (ر.س)",
        data: data,
        borderColor: "#6366F1",
        backgroundColor: gradient,
        borderWidth: 3,
        pointBackgroundColor: "#6366F1",
        pointBorderColor: isLight ? "#FFFFFF" : "#121620",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          titleFont: { family: "Tajawal", size: 14 },
          bodyFont: { family: "JetBrains Mono", size: 14 },
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
        }
      },
      scales: {
        y: { 
          beginAtZero: true, 
          grid: { color: gridColor, drawBorder: true, borderColor: borderAxisColor },
          ticks: { color: tickColor, font: { family: "JetBrains Mono", weight: '600' } }
        },
        x: {
          grid: { display: false },
          ticks: { color: tickColor, font: { family: "Tajawal", size: 11, weight: '600' } },
          border: { color: borderAxisColor }
        }
      }
    }
  });
}
