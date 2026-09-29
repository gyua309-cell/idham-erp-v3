// ============================================================
// IDHAM ERP — Executive Dashboard Module
// Fully resilient with fallback metrics, VAT breakdown,
// Sales Reps Leaderboard, and dual Sales & Collections Chart
// ============================================================

import { COLS, getAll, collection, clearERPCache } from "../utils/db.js";
import { formatCurrency, formatDate, todayString, startOfMonth, getStockStatusBadge, getInvoiceStatusBadge } from "../utils/formatters.js";
import { query, where, orderBy, limit, getDocs } from "../utils/db.js";
import { db, COMPANY_ID } from "../firebase-config.js";

export async function render(container, user) {
  const userName = user?.displayName || "مدير النظام";
  container.innerHTML = `
    <!-- Advanced Dashboard Hero Header -->
    <div class="dashboard-hero animate-fade-in">
      <div class="hero-greeting">
        <h1>مرحباً بك مجدداً، ${userName} 👋</h1>
        <p>إليك ملخص الأداء التنفيذي والمؤشرات المالية والبيعية المباشرة</p>
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
    if (window.event && window.event.target) window.event.target.classList.add("active");

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

  // ── Show skeleton immediately ──
  content.innerHTML = `
    <div class="animate-fade-in">
      <div class="kpi-grid mb-24">
        ${[1,2,3,4].map(() => `
          <div class="kpi-card" style="min-height:120px;">
            <div class="skeleton" style="width:40px;height:40px;border-radius:10px;margin-bottom:12px;"></div>
            <div class="skeleton" style="width:60%;height:14px;margin-bottom:8px;"></div>
            <div class="skeleton" style="width:80%;height:22px;margin-bottom:6px;"></div>
            <div class="skeleton" style="width:50%;height:12px;"></div>
          </div>`).join("")}
      </div>
      <div class="content-grid-sidebar mb-24">
        <div class="card" style="border-radius:16px;min-height:340px;">
          <div class="skeleton" style="width:100%;height:100%;min-height:340px;border-radius:16px;"></div>
        </div>
        <div class="card" style="border-radius:16px;min-height:340px;">
          <div class="skeleton" style="width:100%;height:100%;min-height:340px;border-radius:16px;"></div>
        </div>
      </div>
    </div>`;

  let invoices = [];
  let salesReturns = [];
  let purchases = [];
  let stockWarnings = [];
  let receipts = [];
  let collections = [];
  let jes = [];
  let accounts = [];
  let products = [];
  let reps = [];
  let customers = [];

  const safeDateStr = (item) => {
    if (!item) return "";
    if (item.date) return item.date;
    if (!item.createdAt) return "";
    if (item.createdAt.toDate) return item.createdAt.toDate().toISOString().split("T")[0];
    if (item.createdAt.seconds) return new Date(item.createdAt.seconds * 1000).toISOString().split("T")[0];
    if (typeof item.createdAt === "string") return item.createdAt.split("T")[0];
    return "";
  };

  try {
    const colQ = collection(db, `companies/${COMPANY_ID}/collections`);
    const jeQ = collection(db, `companies/${COMPANY_ID}/journalEntries`);
    const coaQ = collection(db, `companies/${COMPANY_ID}/chartOfAccounts`);

    // Fetch concurrently using unified cache
    const [invSnap, retSnap, purSnap, stockSnap, rcptSnap, jeSnap, coaSnap, colSnap, prodSnap, repSnap, custSnap] = await Promise.all([
      getDocs(collection(db, `companies/${COMPANY_ID}/salesInvoices`)).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))).catch(e => { console.warn(e); return []; }),
      getAll(COLS.salesReturns ? COLS.salesReturns() : "salesReturns").catch(e => { console.warn(e); return []; }),
      getAll(COLS.purchaseInvoices()).catch(e => { console.warn(e); return []; }),
      getAll(COLS.stockByWarehouse()).catch(e => { console.warn(e); return []; }),
      getAll(COLS.receipts()).catch(e => { console.warn(e); return []; }),
      getAll(jeQ, [where("status", "==", "posted")]).catch(e => { console.warn(e); return []; }),
      getAll(coaQ).catch(e => { console.warn(e); return []; }),
      getAll(colQ).catch(e => { console.warn(e); return []; }),
      getAll(COLS.products()).catch(e => { console.warn(e); return []; }),
      getAll(COLS.salesReps ? COLS.salesReps() : "salesReps").catch(e => { console.warn(e); return []; }),
      getAll(COLS.customers ? COLS.customers() : "customers").catch(e => { console.warn(e); return []; })
    ]);

    invoices = invSnap || [];
    salesReturns = retSnap || [];
    purchases = purSnap || [];
    receipts = rcptSnap || [];
    collections = colSnap || [];
    jes = jeSnap || [];
    accounts = coaSnap || [];
    products = prodSnap || [];
    reps = repSnap || [];
    customers = custSnap || [];
    stockWarnings = (stockSnap || []).filter(s => s.stockStatus === "out" || s.stockStatus === "low").slice(0, 10);

    // Filter in JS by selected date range
    invoices = invoices.filter(i => {
      const d = safeDateStr(i);
      return (!fromStr || d >= fromStr) && (!toStr || d <= toStr);
    });
    salesReturns = salesReturns.filter(r => {
      const d = safeDateStr(r);
      return (!fromStr || d >= fromStr) && (!toStr || d <= toStr);
    });
    purchases = purchases.filter(p => {
      const d = safeDateStr(p);
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

  // ──────── 1. Sales & Returns Calculations ────────
  const activeInvoices = invoices.filter(i => i.status !== "cancelled");
  const activeReturns = salesReturns.filter(r => r.status !== "cancelled");

  // Gross Invoiced Sales
  let totalSalesWithVat = 0;
  let totalSalesSubtotal = 0;
  activeInvoices.forEach(inv => {
    const gross = parseFloat(inv.totalWithVat !== undefined ? inv.totalWithVat : (inv.total || 0));
    const sub   = parseFloat(inv.subtotal || inv.totalWithoutVat || inv.netTotal || (gross > 0 ? gross / 1.15 : 0));
    totalSalesWithVat += gross;
    totalSalesSubtotal += sub;
  });
  const totalSalesVat = Math.max(0, totalSalesWithVat - totalSalesSubtotal);
  const invoiceCount  = activeInvoices.length;
  const avgInvoice    = invoiceCount > 0 ? totalSalesWithVat / invoiceCount : 0;

  // Sales Returns
  let totalReturnsWithVat = 0;
  let totalReturnsSubtotal = 0;
  activeReturns.forEach(ret => {
    const gross = parseFloat(ret.totalWithVat !== undefined ? ret.totalWithVat : (ret.total || 0));
    const sub   = parseFloat(ret.subtotal || ret.totalWithoutVat || (gross > 0 ? gross / 1.15 : 0));
    totalReturnsWithVat += gross;
    totalReturnsSubtotal += sub;
  });
  const totalReturnsVat = Math.max(0, totalReturnsWithVat - totalReturnsSubtotal);
  const returnCount     = activeReturns.length;

  // Net Sales (الصافي الفعلي = المبيعات - المردودات)
  const netSalesWithVat  = Math.max(0, totalSalesWithVat - totalReturnsWithVat);
  const netSalesSubtotal = Math.max(0, totalSalesSubtotal - totalReturnsSubtotal);
  const netSalesVat      = Math.max(0, netSalesWithVat - netSalesSubtotal);

  // ──────── 2. COGS & Gross Profit Calculations ────────
  const prodCostMap = {};
  products.forEach(p => { prodCostMap[p.id] = parseFloat(p.costPrice || p.purchasePrice || 0); });

  let cogsTotal = 0;
  activeInvoices.forEach(inv => {
    if (inv.totalCost !== undefined && inv.totalCost !== null) {
      cogsTotal += parseFloat(inv.totalCost);
    } else {
      let linesCost = 0;
      (inv.items || inv.lines || []).forEach(item => {
        const q = parseFloat(item.qty || item.quantity || 0);
        const c = parseFloat(item.averageCost || item.costPrice || item.purchasePrice || prodCostMap[item.productId || item.id] || 0);
        linesCost += q * c;
      });
      cogsTotal += linesCost;
    }
  });

  // Deduct returned COGS if available
  let returnsCogs = 0;
  activeReturns.forEach(ret => {
    (ret.items || ret.lines || []).forEach(item => {
      const q = parseFloat(item.qty || item.quantity || 0);
      const c = parseFloat(item.averageCost || item.costPrice || item.purchasePrice || prodCostMap[item.productId || item.id] || 0);
      returnsCogs += q * c;
    });
  });
  cogsTotal = Math.max(0, cogsTotal - returnsCogs);

  // Fallback to JEs if cogsTotal is 0
  if (cogsTotal === 0 && jes.length > 0) {
    jes.filter(j => j.type === 'salesCOGS' || j.sourceType === 'salesCOGS' || (j.description && j.description.includes('تكلفة بضاعة'))).forEach(j => {
      cogsTotal += parseFloat(j.totalDebit || j.amount || 0);
    });
  }

  const grossProfit = netSalesSubtotal - cogsTotal;
  const grossMargin = netSalesSubtotal > 0 ? (grossProfit / netSalesSubtotal * 100).toFixed(1) : "0.0";

  // ──────── 3. Collections & Receipts Calculations ────────
  const customerReceipts = receipts.filter(r => r.entityType === "customer" || !r.entityType || r.type === "receipt");
  let totalCollected = customerReceipts.reduce((s, r) => s + parseFloat(r.amount || 0), 0);

  // Collections collection docs
  collections.forEach(c => {
    totalCollected += parseFloat(c.amount || 0);
  });

  // Include cash / direct paid amounts on invoices without separate receipt doc
  activeInvoices.forEach(inv => {
    const pm = (inv.paymentMethod || "").toLowerCase();
    if (pm === "cash" || pm === "نقدي" || pm === "paid" || pm === "partial" || pm === "جزئي") {
      const paid = parseFloat(inv.paidAmount || (pm === "cash" || pm === "نقدي" || pm === "paid" ? (inv.totalWithVat || inv.total || 0) : 0));
      if (paid > 0) {
        const hasReceipt = customerReceipts.some(r => r.invoiceId === inv.id || r.invoiceNumber === inv.invoiceNumber) ||
                           collections.some(c => c.invoiceId === inv.id);
        if (!hasReceipt) {
          totalCollected += paid;
        }
      }
    }
  });

  const totalOutstanding = Math.max(0, netSalesWithVat - totalCollected);
  const globalCollectionRate = netSalesWithVat > 0 ? Math.min(100, (totalCollected / netSalesWithVat * 100)).toFixed(1) : (totalCollected > 0 ? "100.0" : "0.0");

  // ──────── 4. Sales Reps Comprehensive Performance Mapping ────────
  // Build customer to rep mapping
  const custRepMap = {};
  customers.forEach(c => {
    if (c.id && (c.repId || c.assignedRepId)) {
      custRepMap[c.id] = c.repId || c.assignedRepId;
    }
  });

  // Reps stats map
  const repStats = {};
  // 1. Initialize registered reps
  reps.forEach(r => {
    repStats[r.id] = {
      id: r.id,
      name: r.name || "مندوب",
      zone: r.zone || "مسار ميداني",
      target: parseFloat(r.monthlyTarget || 0),
      salesWithVat: 0,
      salesSubtotal: 0,
      returnsWithVat: 0,
      returnsSubtotal: 0,
      netSalesWithVat: 0,
      netSalesSubtotal: 0,
      collections: 0,
      invoiceCount: 0,
      returnCount: 0
    };
  });

  // 2. Direct Warehouse / Direct Sales fallback
  const DIRECT_KEY = "rep_direct_warehouse";
  repStats[DIRECT_KEY] = {
    id: DIRECT_KEY,
    name: "المستودع الرئيسي (مبيعات مباشرة)",
    zone: "إدارة المبيعات المركزية",
    target: 0,
    salesWithVat: 0,
    salesSubtotal: 0,
    returnsWithVat: 0,
    returnsSubtotal: 0,
    netSalesWithVat: 0,
    netSalesSubtotal: 0,
    collections: 0,
    invoiceCount: 0,
    returnCount: 0
  };

  // Helper to resolve Rep ID
  const resolveRepKey = (doc) => {
    if (doc.repId && repStats[doc.repId]) return doc.repId;
    if (doc.salesRepId && repStats[doc.salesRepId]) return doc.salesRepId;
    // Check by rep name
    if (doc.repName) {
      const match = reps.find(r => r.name === doc.repName || r.id === doc.repName);
      if (match) return match.id;
    }
    // Check customer mapping
    const custId = doc.customerId || doc.targetId;
    if (custId && custRepMap[custId] && repStats[custRepMap[custId]]) {
      return custRepMap[custId];
    }
    return DIRECT_KEY;
  };

  // Map Invoices to Reps
  activeInvoices.forEach(inv => {
    const key = resolveRepKey(inv);
    const gross = parseFloat(inv.totalWithVat !== undefined ? inv.totalWithVat : (inv.total || 0));
    const sub   = parseFloat(inv.subtotal || inv.totalWithoutVat || (gross > 0 ? gross / 1.15 : 0));
    if (!repStats[key]) {
      repStats[key] = {
        id: key,
        name: inv.repName || "مندوب مبيعات",
        zone: "مسار ميداني",
        target: 0,
        salesWithVat: 0, salesSubtotal: 0, returnsWithVat: 0, returnsSubtotal: 0,
        netSalesWithVat: 0, netSalesSubtotal: 0, collections: 0, invoiceCount: 0, returnCount: 0
      };
    }
    repStats[key].salesWithVat += gross;
    repStats[key].salesSubtotal += sub;
    repStats[key].invoiceCount += 1;
  });

  // Map Returns to Reps
  activeReturns.forEach(ret => {
    const key = resolveRepKey(ret);
    const gross = parseFloat(ret.totalWithVat !== undefined ? ret.totalWithVat : (ret.total || 0));
    const sub   = parseFloat(ret.subtotal || ret.totalWithoutVat || (gross > 0 ? gross / 1.15 : 0));
    if (!repStats[key]) {
      repStats[key] = {
        id: key,
        name: ret.repName || "مندوب مبيعات",
        zone: "مسار ميداني",
        target: 0,
        salesWithVat: 0, salesSubtotal: 0, returnsWithVat: 0, returnsSubtotal: 0,
        netSalesWithVat: 0, netSalesSubtotal: 0, collections: 0, invoiceCount: 0, returnCount: 0
      };
    }
    repStats[key].returnsWithVat += gross;
    repStats[key].returnsSubtotal += sub;
    repStats[key].returnCount += 1;
  });

  // Map Receipts to Reps
  customerReceipts.forEach(rcpt => {
    const key = resolveRepKey(rcpt);
    if (repStats[key]) {
      repStats[key].collections += parseFloat(rcpt.amount || 0);
    }
  });

  // Map Collections collection to Reps
  collections.forEach(col => {
    const key = resolveRepKey(col);
    if (repStats[key]) {
      repStats[key].collections += parseFloat(col.amount || 0);
    }
  });

  // Map Direct Cash Invoices to Rep Collections
  activeInvoices.forEach(inv => {
    const pm = (inv.paymentMethod || "").toLowerCase();
    if (pm === "cash" || pm === "نقدي" || pm === "paid" || pm === "partial" || pm === "جزئي") {
      const paid = parseFloat(inv.paidAmount || (pm === "cash" || pm === "نقدي" || pm === "paid" ? (inv.totalWithVat || inv.total || 0) : 0));
      if (paid > 0) {
        const hasReceipt = customerReceipts.some(r => r.invoiceId === inv.id || r.invoiceNumber === inv.invoiceNumber) ||
                           collections.some(c => c.invoiceId === inv.id);
        if (!hasReceipt) {
          const key = resolveRepKey(inv);
          if (repStats[key]) {
            repStats[key].collections += paid;
          }
        }
      }
    }
  });

  // Compute final net sales and collection metrics per rep
  const repList = Object.values(repStats).map(r => {
    const netVat = Math.max(0, r.salesWithVat - r.returnsWithVat);
    const netSub = Math.max(0, r.salesSubtotal - r.returnsSubtotal);
    const gap = Math.max(0, netVat - r.collections);
    const colRate = netVat > 0 ? Math.min(100, (r.collections / netVat * 100)) : (r.collections > 0 ? 100 : 0);
    return {
      ...r,
      netSalesWithVat: netVat,
      netSalesSubtotal: netSub,
      gap,
      colRate
    };
  }).filter(r => r.salesWithVat > 0 || r.returnsWithVat > 0 || r.collections > 0 || r.id !== DIRECT_KEY)
    .sort((a, b) => b.netSalesWithVat - a.netSalesWithVat || b.salesWithVat - a.salesWithVat);

  // Top 6 reps for leaderboard
  const topReps = repList.slice(0, 6);
  const maxRepSales = topReps.length > 0 ? Math.max(...topReps.map(r => r.netSalesWithVat || r.salesWithVat || 1)) : 1;

  // ──────── 5. Render Full Dashboard HTML ────────
  const recentInvs = activeInvoices.slice(0, 8);

  content.innerHTML = `
    <div class="animate-fade-in">
      <!-- Top Primary Financial KPI Grid -->
      <div class="kpi-grid mb-24">
        ${kpiCard(
          "💰",
          "إجمالي المبيعات (شامل الضريبة 15%)",
          formatCurrency(totalSalesWithVat),
          `صافي: <b>${formatCurrency(netSalesWithVat)}</b> • قبل الضريبة: ${formatCurrency(totalSalesSubtotal)}`,
          "sales",
          `${formatCurrency(totalSalesVat)} ضريبة`
        )}
        
        ${kpiCard(
          "✅",
          "المبالغ المحصلة (سندات ونقدي)",
          formatCurrency(totalCollected),
          `نسبة التغطية: <b>${globalCollectionRate}%</b> • المتبقي: ${formatCurrency(totalOutstanding)}`,
          "receipts",
          `${globalCollectionRate}% تحصيل`
        )}
        
        ${kpiCard(
          "🧾",
          "الفواتير والمردودات",
          `${invoiceCount.toLocaleString("ar")} فاتورة`,
          `المردودات: <b>${formatCurrency(totalReturnsWithVat)}</b> (${returnCount} إشعار) • متوسط: ${formatCurrency(avgInvoice)}`,
          "invoices",
          `${invoiceCount} حركة`
        )}
        
        ${kpiCard(
          "📈",
          "مجمل الربح التقديري (Gross Profit)",
          formatCurrency(grossProfit),
          `هامش الربح: <b>${grossMargin}%</b> • تكلفة البضاعة: ${formatCurrency(cogsTotal)}`,
          "profit",
          `${grossMargin}% هامش`,
          grossProfit >= 0 ? "up" : "down"
        )}
      </div>

      <!-- Charts & Top Reps Row -->
      <div class="content-grid-sidebar mb-24" style="align-items: stretch;">
        
        <!-- Daily Sales & Collections Chart Card -->
        <div class="card" style="border-radius:16px; background:var(--bg-1); border:1px solid var(--border-soft); display:flex; flex-direction:column;">
          <div class="card-header" style="border-bottom: 1px solid var(--border-soft); padding:18px 20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="kpi-icon-glass" style="width:38px; height:38px; font-size:18px; border-radius:10px; background:rgba(99,102,241,0.12); color:#6366F1; display:flex; align-items:center; justify-content:center;">📊</div>
              <div>
                <h3 style="font-size:16px; font-family:var(--font-heading); color:var(--text-0); margin:0;">تحليل المبيعات والتحصيلات اليومية</h3>
                <span class="text-2" style="font-size:12px;">مقارنة صافي المبيعات بالمبالغ المحصلة فعلياً للفترة</span>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:12px; font-size:12px; font-weight:700;">
              <span style="display:flex; align-items:center; gap:6px; color:#6366F1;">
                <span style="width:10px; height:10px; border-radius:50%; background:#6366F1;"></span>
                صافي المبيعات
              </span>
              <span style="display:flex; align-items:center; gap:6px; color:#10B981;">
                <span style="width:10px; height:10px; border-radius:50%; background:#10B981;"></span>
                التحصيلات النقدية
              </span>
            </div>
          </div>
          <div class="card-body" style="padding:20px; flex:1; min-height:300px; position:relative;">
            <div class="chart-container" style="height:300px; width:100%; position:relative;">
              <canvas id="sales-chart"></canvas>
            </div>
          </div>
        </div>

        <!-- Upgraded Sales Reps Leaderboard Card -->
        <div class="card" style="border-radius:16px; background:var(--bg-1); border:1px solid var(--border-soft); display:flex; flex-direction:column;">
          <div class="card-header" style="border-bottom: 1px solid var(--border-soft); padding:18px 20px; display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="kpi-icon-glass" style="width:38px; height:38px; font-size:18px; border-radius:10px; background:rgba(245,158,11,0.12); color:#F59E0B; display:flex; align-items:center; justify-content:center;">🏆</div>
              <div>
                <h3 style="font-size:16px; font-family:var(--font-heading); color:var(--text-0); margin:0;">نخبة المناديب ومؤشرات التحصيل</h3>
                <span class="text-2" style="font-size:12px;">المبيعات قبل/بعد الضريبة والصافي والتحصيلات</span>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="navigate('sales-reps')" style="font-size:12px; color:var(--brand); padding:4px 8px;" title="فتح تقرير المناديب الكامل">
              عرض الكل ❯
            </button>
          </div>
          
          <div class="card-body" style="padding:16px 20px; flex:1; overflow-y:auto; max-height:480px;">
            ${topReps.length === 0 ? `
              <div class="empty-state" style="padding:40px 0; text-align:center;">
                <div class="empty-icon" style="font-size:36px; margin-bottom:8px;">🚚</div>
                <h4 style="color:var(--text-0); margin-bottom:4px;">لا توجد حركات مناديب مسجلة</h4>
                <p style="font-size:12px; color:var(--text-2);">لم تسجل فواتير أو تحصيلات للمناديب خلال هذه الفترة</p>
              </div>` : `
              <div style="display:flex; flex-direction:column; gap:16px;">
                ${topReps.map((r, i) => {
                  const rankMedals = ["🥇", "🥈", "🥉", "4", "5", "6"];
                  const rankColors = ["#F59E0B", "#94A3B8", "#D97706", "#6366F1", "#3B82F6", "#8B5CF6"];
                  const barColor = rankColors[i] || "#6366F1";
                  const salesPct = maxRepSales > 0 ? Math.min(100, Math.max(8, (r.netSalesWithVat / maxRepSales) * 100)) : 0;
                  const colColor = r.colRate >= 80 ? "#10B981" : (r.colRate >= 50 ? "#3B82F6" : "#F59E0B");

                  return `
                  <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:14px 16px; transition:all 0.2s ease;">
                    <!-- Rep Header Row -->
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
                      <div style="display:flex; align-items:center; gap:10px;">
                        <span style="display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:8px; font-weight:800; font-size:${i < 3 ? '16px' : '12px'}; background:${i < 3 ? 'transparent' : 'rgba(255,255,255,0.08)'}; color:var(--text-0);">
                          ${rankMedals[i]}
                        </span>
                        <div>
                          <div style="font-weight:700; font-size:14px; color:var(--text-0); font-family:var(--font-heading); display:flex; align-items:center; gap:6px;">
                            ${r.name}
                            ${r.invoiceCount > 0 ? `<span style="font-size:10.5px; padding:1px 6px; border-radius:6px; background:var(--primary-dim); color:var(--brand); font-weight:600;">${r.invoiceCount} فواتير</span>` : ''}
                          </div>
                          <div style="font-size:11px; color:var(--text-2); margin-top:2px;">📍 ${r.zone}</div>
                        </div>
                      </div>

                      <div style="text-align:left;">
                        <div style="font-size:10px; color:var(--text-2); font-weight:600;">صافي المبيعات</div>
                        <div class="mono" style="font-weight:800; font-size:15px; color:${barColor};">
                          ${formatCurrency(r.netSalesWithVat)}
                        </div>
                      </div>
                    </div>

                    <!-- Breakdown Financial Mini-Grid -->
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap:6px; background:var(--bg-card); border-radius:8px; padding:8px 10px; margin-bottom:10px; font-size:11px;">
                      <div>
                        <span style="color:var(--text-2); display:block; font-size:10px;">شامل الضريبة 15%:</span>
                        <span class="mono font-bold" style="color:var(--text-0);">${formatCurrency(r.salesWithVat)}</span>
                      </div>
                      <div>
                        <span style="color:var(--text-2); display:block; font-size:10px;">قبل الضريبة:</span>
                        <span class="mono font-bold" style="color:var(--text-1);">${formatCurrency(r.salesSubtotal)}</span>
                      </div>
                      <div>
                        <span style="color:var(--text-2); display:block; font-size:10px;">المردودات:</span>
                        <span class="mono font-bold" style="color:${r.returnsWithVat > 0 ? '#EF4444' : 'var(--text-2)'};">
                          ${r.returnsWithVat > 0 ? `- ${formatCurrency(r.returnsWithVat)}` : '0.00 ر.س'}
                        </span>
                      </div>
                      <div>
                        <span style="color:var(--text-2); display:block; font-size:10px;">المحصل الفعلي:</span>
                        <span class="mono font-bold" style="color:#10B981;">${formatCurrency(r.collections)}</span>
                      </div>
                    </div>

                    <!-- Collection Progress Bar & Gap -->
                    <div>
                      <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; margin-bottom:4px;">
                        <span style="color:var(--text-2);">
                          نسبة التحصيل: <b style="color:${colColor};">${r.colRate.toFixed(1)}%</b>
                        </span>
                        <span style="color:var(--text-2);">
                          المتبقي (الفجوة): <b class="mono" style="color:${r.gap > 0 ? '#F59E0B' : '#10B981'};">${formatCurrency(r.gap)}</b>
                        </span>
                      </div>
                      <div style="height:6px; background:rgba(255,255,255,0.06); border-radius:4px; overflow:hidden; display:flex;">
                        <div style="width:${r.colRate}%; background:${colColor}; border-radius:4px; transition:width 0.4s ease;"></div>
                      </div>
                    </div>
                  </div>`;
                }).join("")}
              </div>`}
          </div>
        </div>
      </div>

      <!-- Recent Invoices Table (Full Width) -->
      <div class="card mb-24" style="border-radius:16px; background:var(--bg-1); border:1px solid var(--border-soft);">
        <div class="card-header" style="padding:18px 20px; border-bottom:1px solid var(--border-soft); display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:20px;">🧾</span>
            <div>
              <h3 style="font-size:16px; font-family:var(--font-heading); color:var(--text-0); margin:0;">أحدث فواتير المبيعات</h3>
              <span class="text-2" style="font-size:12px;">سجل الحركات الأحدث الصادرة خلال الفترة المحددة</span>
            </div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="navigate('sales-invoices')">عرض السجل الكامل</button>
        </div>
        <div class="table-container" style="margin:0; border:none;">
          <table class="data-dense">
            <thead>
              <tr>
                <th>الرقم المرجعي</th>
                <th>العميل</th>
                <th>المندوب</th>
                <th>التاريخ</th>
                <th>طريقة الدفع</th>
                <th>الحالة</th>
                <th style="text-align:left;">المبلغ قبل الضريبة</th>
                <th style="text-align:left;">الإجمالي شامل الضريبة</th>
              </tr>
            </thead>
            <tbody>
              ${recentInvs.length === 0 ? `
                <tr><td colspan="8" style="text-align:center; color:var(--text-2); padding:40px;">
                  <div class="empty-icon" style="font-size:36px; margin-bottom:8px;">📄</div>
                  <div>لا توجد حركات مسجلة في هذه الفترة</div>
                </td></tr>` : recentInvs.map(inv => {
                  const gross = parseFloat(inv.totalWithVat !== undefined ? inv.totalWithVat : (inv.total || 0));
                  const sub   = parseFloat(inv.subtotal || inv.totalWithoutVat || (gross > 0 ? gross / 1.15 : 0));
                  return `
                  <tr onclick="navigate('sales-invoices')" style="cursor:pointer; transition: background 0.2s;">
                    <td class="mono font-bold" style="color:var(--brand);">#${inv.invoiceNumber || inv.number || inv.id.slice(0,8)}</td>
                    <td class="font-semibold" style="color:var(--text-0);">${inv.customerName || "عميل نقدي"}</td>
                    <td style="color:var(--text-1);">${inv.repName || inv.salesRepName || "المستودع الرئيسي"}</td>
                    <td class="dim">${formatDate(inv.createdAt || inv.date)}</td>
                    <td><span class="badge ${inv.paymentMethod === 'cash' ? 'good' : 'warn'}">${inv.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}</span></td>
                    <td>${getInvoiceStatusBadge(inv.status || "pending")}</td>
                    <td class="mono" style="text-align:left; color:var(--text-2);">${formatCurrency(sub)}</td>
                    <td class="mono font-bold text-good" style="text-align:left; font-size:14px;">${formatCurrency(gross)}</td>
                  </tr>`;
                }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;

  renderSalesChart(activeInvoices, customerReceipts, activeReturns, fromStr, toStr);
}

function kpiCard(icon, label, value, sub, cardType, trend, trendDir = "up") {
  const trendClass = trendDir === "up" ? "trend-up" : "trend-down";
  const trendIcon = trendDir === "up" ? "↑" : "↓";
  const gradientClass = {
    sales: "g-blue",
    invoices: "g-purple",
    receipts: "g-green",
    profit: "g-orange"
  }[cardType] || "g-blue";
  
  return `
    <div class="kpi-card ${gradientClass}">
      <div class="kpi-header-row">
        <div class="kpi-icon-glass">${icon}</div>
        ${trend ? `<div class="trend-badge">${trend}</div>` : ''}
      </div>
      <div class="kpi-content">
        <div class="kpi-label">${label}</div>
        <div class="kpi-value mono">${value}</div>
        <div class="kpi-sub">${sub}</div>
      </div>
    </div>`;
}

function renderSalesChart(invoices, receipts, salesReturns, fromStr, toStr) {
  const canvas = document.getElementById("sales-chart");
  if (!canvas || typeof Chart === "undefined") return;

  const daysSales = {};
  const daysReceipts = {};
  const start = new Date(fromStr);
  const end   = new Date(toStr);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split("T")[0];
    daysSales[key] = 0;
    daysReceipts[key] = 0;
  }

  // Aggregate daily Net Sales (Sales - Returns)
  invoices.forEach(inv => {
    const key = inv.createdAt?.toDate ? inv.createdAt.toDate().toISOString().split("T")[0] : (inv.date || "");
    if (daysSales[key] !== undefined) {
      daysSales[key] += parseFloat(inv.totalWithVat !== undefined ? inv.totalWithVat : (inv.total || 0));
    }
  });

  salesReturns.forEach(ret => {
    const key = ret.createdAt?.toDate ? ret.createdAt.toDate().toISOString().split("T")[0] : (ret.date || "");
    if (daysSales[key] !== undefined) {
      daysSales[key] -= parseFloat(ret.totalWithVat !== undefined ? ret.totalWithVat : (ret.total || 0));
    }
  });

  // Aggregate daily Receipts & Collections
  receipts.forEach(rcpt => {
    const key = rcpt.createdAt?.toDate ? rcpt.createdAt.toDate().toISOString().split("T")[0] : (rcpt.date || "");
    if (daysReceipts[key] !== undefined) {
      daysReceipts[key] += parseFloat(rcpt.amount || 0);
    }
  });

  // Cash invoices on that day
  invoices.forEach(inv => {
    const pm = (inv.paymentMethod || "").toLowerCase();
    if (pm === "cash" || pm === "نقدي" || pm === "paid") {
      const key = inv.createdAt?.toDate ? inv.createdAt.toDate().toISOString().split("T")[0] : (inv.date || "");
      if (daysReceipts[key] !== undefined) {
        const amt = parseFloat(inv.paidAmount || inv.totalWithVat || inv.total || 0);
        const hasReceipt = receipts.some(r => r.invoiceId === inv.id);
        if (!hasReceipt) {
          daysReceipts[key] += amt;
        }
      }
    }
  });

  const labels = Object.keys(daysSales).map(k => k.slice(5)); // MM-DD
  const salesData = Object.values(daysSales).map(v => Math.max(0, v));
  const receiptsData = Object.values(daysReceipts).map(v => Math.max(0, v));

  const ctx = canvas.getContext('2d');
  
  const gradientSales = ctx.createLinearGradient(0, 0, 0, 280);
  gradientSales.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
  gradientSales.addColorStop(0.6, 'rgba(99, 102, 241, 0.08)');
  gradientSales.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

  const gradientReceipts = ctx.createLinearGradient(0, 0, 0, 280);
  gradientReceipts.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
  gradientReceipts.addColorStop(0.6, 'rgba(16, 185, 129, 0.08)');
  gradientReceipts.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

  const isLight = document.body.classList.contains('theme-light');
  const tickColor = isLight ? '#0F172A' : '#9CA3AF';
  const gridColor = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.06)';
  const borderAxisColor = isLight ? '#CBD5E1' : '#334155';

  new Chart(canvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "صافي المبيعات (ر.س)",
          data: salesData,
          borderColor: "#6366F1",
          backgroundColor: gradientSales,
          borderWidth: 2.5,
          pointBackgroundColor: "#6366F1",
          pointBorderColor: isLight ? "#FFFFFF" : "#0F172A",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.35
        },
        {
          label: "التحصيلات النقدية (ر.س)",
          data: receiptsData,
          borderColor: "#10B981",
          backgroundColor: gradientReceipts,
          borderWidth: 2.5,
          pointBackgroundColor: "#10B981",
          pointBorderColor: isLight ? "#FFFFFF" : "#0F172A",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.35
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: tickColor,
            font: { family: 'IBM Plex Sans Arabic', size: 12, weight: '600' },
            boxWidth: 12,
            boxHeight: 12,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          titleFont: { family: "IBM Plex Sans Arabic", size: 13, weight: '700' },
          bodyFont: { family: "IBM Plex Mono", size: 13 },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const val = context.parsed.y || 0;
              return ` ${label}: ${formatCurrency(val)}`;
            }
          }
        }
      },
      scales: {
        y: { 
          beginAtZero: true, 
          grid: { color: gridColor },
          border: { color: borderAxisColor },
          ticks: { 
            color: tickColor, 
            font: { family: "IBM Plex Mono", size: 11, weight: '600' },
            callback: (v) => formatCurrency(v, true)
          }
        },
        x: {
          grid: { display: false },
          border: { color: borderAxisColor },
          ticks: { 
            color: tickColor, 
            font: { family: "IBM Plex Sans Arabic", size: 11, weight: '600' }
          }
        }
      }
    }
  });
}
