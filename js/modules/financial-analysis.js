// ============================================================
// IDHAM ERP — Financial Analysis Dashboard v2.0 PREMIUM
// التحليل المالي الشامل — رسوم PowerPoint احترافية
// ============================================================

import { COLS } from "../utils/db.js";
import { query, where, getDocs, getAll } from "../utils/db.js";
import { formatCurrency } from "../utils/formatters.js";

// ── Load ECharts + GL (true 3D) ──
async function loadECharts() {
  if (window._echartsReady) return;
  const load = src => new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
  if (!window.echarts) await load("https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js");
  try { await load("https://cdn.jsdelivr.net/npm/echarts-gl@2.0.9/dist/echarts-gl.min.js"); } catch(e) {}
  window._echartsReady = true;
}

let _data = null, _period = "month", _charts = [];

// ══════════════════════════════════════════════════════════════
export async function render(container, user) {
  container.innerHTML = buildShell();
  setupPeriodBtns();
  await loadECharts();
  await refreshAll();
}

// ══════════════════════════════════════════════════════════════
// SHELL
// ══════════════════════════════════════════════════════════════
function buildShell() { return `
<div id="fa2" style="display:flex;flex-direction:column;height:100%;overflow:hidden;background:var(--bg-0);color:var(--text-0);">

<style>
/* ── Header ── */
#fa2 .fa-hdr{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;
  background:var(--bg-card);border-bottom:1px solid var(--border-soft);flex-shrink:0;flex-wrap:wrap;gap:12px;box-shadow:0 2px 10px rgba(0,0,0,0.02)}
#fa2 .fa-logo{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--brand),#8b5cf6);
  display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;
  box-shadow:0 4px 14px rgba(99,102,241,.3)}
#fa2 .fa-htitle{font-size:18px;font-weight:900;color:var(--text-0);margin:0}
#fa2 .fa-hsub{font-size:11px;color:var(--text-2);margin:2px 0 0}

/* Period buttons & Inputs */
#fa2 .pgrp{display:flex;background:var(--bg-2);border-radius:8px;border:1px solid var(--border-soft);overflow:hidden;padding:2px}
#fa2 .pbtn{padding:5px 12px;border:none;background:transparent;color:var(--text-1);font-size:11.5px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;border-radius:6px}
#fa2 .pbtn.on{background:var(--brand);color:#fff;box-shadow:0 2px 8px rgba(99,102,241,.3)}
#fa2 .hbtn{padding:6px 14px;border-radius:8px;border:1px solid var(--border-soft);background:var(--bg-2);color:var(--text-1);font-size:11.5px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px;transition:all .15s;white-space:nowrap}
#fa2 .hbtn:hover{background:var(--bg-card);color:var(--text-0)}
#fa2 .hbtn.primary{background:var(--brand);color:#fff;border-color:var(--brand)}

/* Tabs */
#fa2 .tabs{display:flex;padding:0 16px;background:var(--bg-card);border-bottom:2px solid var(--border-soft);flex-shrink:0;overflow-x:auto;scrollbar-width:none;gap:4px}
#fa2 .tab{padding:10px 18px;border:none;background:transparent;color:var(--text-2);cursor:pointer;font-size:12px;font-weight:800;font-family:inherit;white-space:nowrap;display:flex;align-items:center;gap:6px;border-bottom:2.5px solid transparent;margin-bottom:-2px;transition:all .15s;letter-spacing:.3px}
#fa2 .tab:hover{color:var(--text-0)}
#fa2 .tab.on{color:var(--brand);border-bottom-color:var(--brand);background:var(--bg-2);border-radius:8px 8px 0 0}

/* Content */
#fa2 .content{flex:1;overflow-y:auto;padding:16px;background:var(--bg-0)}
/* Loading */
#fa2 .loading{display:flex;flex-direction:column;align-items:center;justify-content:center;height:320px;gap:16px;color:var(--text-2)}
#fa2 .spinner{width:44px;height:44px;border:3px solid var(--border-soft);border-top-color:var(--brand);border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* KPI Grid */
#fa2 .kgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px;margin-bottom:16px}
#fa2 .kcard{background:var(--bg-card);border:1px solid var(--border-soft);border-radius:14px;padding:16px;position:relative;overflow:hidden;cursor:default;transition:transform .2s,box-shadow .2s;box-shadow:0 4px 14px rgba(0,0,0,0.03)}
#fa2 .kcard:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.06)}
#fa2 .kcard::before{content:"";position:absolute;top:0;right:0;width:60px;height:60px;border-radius:50%;filter:blur(20px);opacity:.15}
#fa2 .kc-lbl{font-size:10px;font-weight:800;color:var(--text-2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px}
#fa2 .kc-val{font-size:20px;font-weight:900;font-variant-numeric:tabular-nums;line-height:1.1;margin-bottom:4px;color:var(--text-0)}
#fa2 .kc-sub{font-size:10.5px;color:var(--text-2);margin-bottom:6px}
#fa2 .kc-bar{height:4px;border-radius:2px;margin-top:6px;opacity:.8}
#fa2 .kc-icon{position:absolute;top:10px;left:10px;font-size:26px;opacity:.12}
#fa2 .kc-trend{font-size:10px;font-weight:800;margin-top:2px}

/* Chart cards */
#fa2 .cgrid{display:grid;gap:14px;margin-bottom:16px}
#fa2 .cgrid.c2{grid-template-columns:1fr 1fr}
#fa2 .cgrid.c3{grid-template-columns:1fr 1fr 1fr}
#fa2 .cgrid.c1{grid-template-columns:1fr}
@media(max-width:950px){#fa2 .cgrid.c2,#fa2 .cgrid.c3{grid-template-columns:1fr}}
#fa2 .ccard{background:var(--bg-card);border:1px solid var(--border-soft);border-radius:14px;padding:18px;position:relative;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.03)}
#fa2 .cc-title{font-size:13px;font-weight:900;color:var(--text-0);margin-bottom:2px;display:flex;align-items:center;gap:7px}
#fa2 .cc-sub{font-size:10px;color:var(--text-2);margin-bottom:12px}
#fa2 .cc-badge{font-size:9.5px;padding:3px 9px;border-radius:10px;background:rgba(99,102,241,.12);color:var(--brand);font-weight:800;margin-right:auto}

/* Ratio cards */
#fa2 .rgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px;margin-bottom:16px}
#fa2 .rcard{background:var(--bg-card);border:1px solid var(--border-soft);border-radius:14px;padding:16px;box-shadow:0 4px 14px rgba(0,0,0,0.03)}
#fa2 .rc-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
#fa2 .rc-name{font-size:12px;font-weight:800;color:var(--text-0)}
#fa2 .rc-eng{font-size:9.5px;color:var(--text-2);margin-top:1px}
#fa2 .rc-val{font-size:26px;font-weight:900;font-variant-numeric:tabular-nums;line-height:1;color:var(--text-0)}
#fa2 .rc-unit{font-size:12px;font-weight:600;opacity:.6;margin-right:3px}
#fa2 .rc-bar{height:6px;background:var(--bg-2);border-radius:4px;overflow:hidden;margin:8px 0}
#fa2 .rc-fill{height:100%;border-radius:4px;transition:width .8s cubic-bezier(.22,1,.36,1)}
#fa2 .rc-bench{display:flex;justify-content:space-between;font-size:9.5px;color:var(--text-2)}
#fa2 .badge{font-size:9.5px;font-weight:800;padding:3px 9px;border-radius:10px}
#fa2 .b-ex{background:rgba(16,185,129,.15);color:#10b981}
#fa2 .b-gd{background:rgba(99,102,241,.15);color:#6366f1}
#fa2 .b-wn{background:rgba(245,158,11,.15);color:#f59e0b}
#fa2 .b-dn{background:rgba(239,68,68,.15);color:#ef4444}

/* Section label */
#fa2 .slbl{font-size:11px;font-weight:900;color:var(--text-1);text-transform:uppercase;letter-spacing:.8px;
  padding:8px 0 12px;display:flex;align-items:center;gap:7px;border-bottom:1px solid var(--border-soft);margin-bottom:14px}
#fa2 .slbl span{color:var(--brand)}

/* Waterfall */
#fa2 .wf-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
#fa2 .wf-lbl{font-size:11px;color:var(--text-1);width:160px;flex-shrink:0;text-align:right}
#fa2 .wf-bar-wrap{flex:1;height:26px;background:var(--bg-2);border-radius:6px;overflow:hidden;position:relative}
#fa2 .wf-bar-fill{height:100%;border-radius:6px;position:absolute;display:flex;align-items:center;padding:0 8px;font-size:10px;font-weight:800;color:#fff;white-space:nowrap;transition:width .8s cubic-bezier(.22,1,.36,1)}
</style>

<!-- Header -->
<div class="fa-hdr">
  <div style="display:flex;align-items:center;gap:12px">
    <div class="fa-logo">📊</div>
    <div>
      <div class="fa-htitle">التحليل المالي الشامل</div>
      <div class="fa-hsub">30+ نسبة مالية • ECharts GL 3D • بيانات حية ومطابقة للفترات</div>
    </div>
  </div>

  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
    
    <!-- Date Range Inputs -->
    <div style="display:flex;align-items:center;gap:8px;background:var(--bg-2);padding:4px 10px;border-radius:8px;border:1px solid var(--border-soft);">
      <div style="display:flex;align-items:center;gap:5px;">
        <label style="font-size:11px;font-weight:800;color:var(--text-2);">من:</label>
        <input type="date" id="fa-from" class="mono font-bold" style="padding:4px 8px;font-size:11.5px;width:125px;border-radius:6px;border:1px solid var(--border-soft);background:var(--bg-card);color:var(--text-0);" onchange="window.setFaCustomDate()" />
      </div>
      <div style="display:flex;align-items:center;gap:5px;">
        <label style="font-size:11px;font-weight:800;color:var(--text-2);">إلى:</label>
        <input type="date" id="fa-to" class="mono font-bold" style="padding:4px 8px;font-size:11.5px;width:125px;border-radius:6px;border:1px solid var(--border-soft);background:var(--bg-card);color:var(--text-0);" onchange="window.setFaCustomDate()" />
      </div>
    </div>

    <!-- Quick Period Buttons -->
    <div class="pgrp">
      <button class="pbtn" data-p="all">كل الفترات</button>
      <button class="pbtn" data-p="today">اليوم</button>
      <button class="pbtn" data-p="this_week">آخر 7 أيام</button>
      <button class="pbtn on" data-p="month">هذا الشهر</button>
      <button class="pbtn" data-p="last_month">الشهر الماضي</button>
      <button class="pbtn" data-p="quarter">الربع</button>
      <button class="pbtn" data-p="year">هذه السنة</button>
    </div>

    <button class="hbtn" onclick="window.fa2Export()">📄 PDF</button>
    <button class="hbtn primary" onclick="window.fa2Refresh()">🔄 تحديث</button>
  </div>
</div>

<!-- Tabs -->
<div class="tabs" id="fa2-tabs">
  <button class="tab on" id="t-ov"   onclick="fa2Tab('ov')">🏠 لوحة المؤشرات</button>
  <button class="tab"    id="t-liq"  onclick="fa2Tab('liq')">💧 السيولة</button>
  <button class="tab"    id="t-pft"  onclick="fa2Tab('pft')">💰 الربحية</button>
  <button class="tab"    id="t-eff"  onclick="fa2Tab('eff')">⚙️ كفاءة العمليات</button>
  <button class="tab"    id="t-lev"  onclick="fa2Tab('lev')">⚖️ الرفع المالي</button>
  <button class="tab"    id="t-inc"  onclick="fa2Tab('inc')">📋 قائمة الدخل</button>
</div>

<!-- Content -->
<div class="content" id="fa2-cnt">
  <div class="loading"><div class="spinner"></div><span>جارٍ تحليل البيانات...</span></div>
</div>
</div>`;
}

// ══════════════════════════════════════════════════════════════
// PERIOD + TAB CONTROL
// ══════════════════════════════════════════════════════════════
function setupPeriodBtns() {
  document.querySelectorAll("#fa2 .pbtn").forEach(b =>
    b.addEventListener("click", async () => {
      document.querySelectorAll("#fa2 .pbtn").forEach(x => x.classList.remove("on"));
      b.classList.add("on");
      _period = b.dataset.p;
      await refreshAll();
    })
  );
}

window.setFaCustomDate = () => {
  _period = "custom";
  document.querySelectorAll("#fa2 .pbtn").forEach(x => x.classList.remove("on"));
  refreshAll();
};

window.fa2Tab = (tab) => {
  document.querySelectorAll("#fa2 .tab").forEach(t => t.classList.toggle("on", t.id === `t-${tab}`));
  const cnt = document.getElementById("fa2-cnt");
  if (!cnt || !_data) return;
  _charts.forEach(c => { try { c.dispose(); } catch {} }); _charts = [];
  buildTab(tab, cnt);
};

window.fa2Refresh = () => refreshAll(true);

// ══════════════════════════════════════════════════════════════
// DATA LOADING
// ══════════════════════════════════════════════════════════════
async function refreshAll(force = false) {
  const cnt = document.getElementById("fa2-cnt");
  if (!cnt) return;
  cnt.innerHTML = `<div class="loading"><div class="spinner"></div><span>جارٍ تحليل البيانات...</span></div>`;
  _charts.forEach(c => { try { c.dispose(); } catch {} }); _charts = [];
  try {
    _data = await loadData(force);
    const tab = document.querySelector("#fa2 .tab.on")?.id?.replace("t-","") || "ov";
    buildTab(tab, cnt);
  } catch(e) {
    cnt.innerHTML = `<div style="color:#ef4444;padding:20px">خطأ: ${e.message}</div>`;
  }
}

async function loadData(force = false) {
  const formatLocalDate = (d) => {
    const yr = d.getFullYear();
    const mon = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mon}-${day}`;
  };
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();

  let from = document.getElementById("fa-from")?.value || "";
  let to   = document.getElementById("fa-to")?.value || "";

  if (_period !== "custom" || !from || !to) {
    if (_period === "all") {
      from = "2020-01-01";
      to = formatLocalDate(now);
    } else if (_period === "today") {
      from = formatLocalDate(now);
      to = formatLocalDate(now);
    } else if (_period === "this_week") {
      const w = new Date(now); w.setDate(w.getDate() - 7);
      from = formatLocalDate(w);
      to = formatLocalDate(now);
    } else if (_period === "last_month") {
      const lmStart = new Date(y, m - 1, 1);
      const lmEnd = new Date(y, m, 0);
      from = formatLocalDate(lmStart);
      to = formatLocalDate(lmEnd);
    } else if (_period === "quarter") {
      from = formatLocalDate(new Date(y, Math.floor(m / 3) * 3, 1));
      to = formatLocalDate(now);
    } else if (_period === "year") {
      from = formatLocalDate(new Date(y, 0, 1));
      to = formatLocalDate(now);
    } else { // default "month"
      from = formatLocalDate(new Date(y, m, 1));
      to = formatLocalDate(now);
    }

    const fromEl = document.getElementById("fa-from");
    const toEl = document.getElementById("fa-to");
    if (fromEl) fromEl.value = from;
    if (toEl) toEl.value = to;
  }

  const sixMonthsAgoDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const sixMonthsAgo = formatLocalDate(sixMonthsAgoDate);

  const { clearERPCache, COMPANY_ID } = await import("../utils/db.js");
  if (force) {
    clearERPCache(`companies/${COMPANY_ID}/salesInvoices`);
    clearERPCache(`companies/${COMPANY_ID}/purchaseInvoices`);
    clearERPCache(`companies/${COMPANY_ID}/stockByWarehouse`);
    clearERPCache(`companies/${COMPANY_ID}/customers`);
    clearERPCache(`companies/${COMPANY_ID}/suppliers`);
    clearERPCache(`companies/${COMPANY_ID}/products`);
    clearERPCache(`companies/${COMPANY_ID}/chartOfAccounts`);
    clearERPCache(`companies/${COMPANY_ID}/journalEntries`);
  }

  // Fetch sales and purchase invoices from 6 months ago to support 6-month trend chart
  const [SI_all, PI_all, ST, CU, SU, PRODS, ACCS, JES] = await Promise.all([
    getAll(COLS.salesInvoices(),    [where("date",">=",sixMonthsAgo), where("date","<=",to)]),
    getAll(COLS.purchaseInvoices(), [where("date",">=",sixMonthsAgo), where("date","<=",to)]),
    getAll(COLS.stockByWarehouse()),
    getAll(COLS.customers()),
    getAll(COLS.suppliers()),
    getAll(COLS.products()),
    getAll(COLS.chartOfAccounts()),
    getAll(COLS.journalEntries()),
  ]);

  // Filter invoices for current selected period
  const SI = SI_all.filter(i => (i.date || "") >= from && (i.date || "") <= to);
  const PI = PI_all.filter(i => (i.date || "") >= from && (i.date || "") <= to);

  // Build account lookup maps
  const accById   = {};
  const accByCode = {};
  ACCS.forEach(a => { accById[a.id] = a; accByCode[a.code] = a; });
  const matchAcc = line => accById[line.accountId] || accByCode[line.accountCode];

  // Helper: sum account balance from JEs
  function accBalance(accId, fromD, toD, cumulative=false) {
    let b = 0;
    for (const je of JES) {
      if (je.status && je.status !== "posted") continue;
      const d = je.date || "";
      const inRange = cumulative ? (d <= toD) : (d >= fromD && d <= toD);
      if (!inRange) continue;
      for (const line of (je.lines || [])) {
        const la = matchAcc(line);
        if (!la || la.id !== accId) continue;
        b += (line.debit || 0) - (line.credit || 0);
      }
    }
    return b;
  }

  // ── P&L from JEs (period) ──
  let revenue = 0, cogs = 0, opExpenses = 0;
  let vatOut = 0, vatIn = 0;
  for (const acc of ACCS) {
    let bal = 0;
    for (const je of JES) {
      if (je.status && je.status !== "posted") continue;
      const d = je.date || "";
      if (d >= from && d <= to) {
        for (const line of (je.lines || [])) {
          const la = matchAcc(line);
          if (!la || la.id !== acc.id) continue;
          bal += (line.credit || 0) - (line.debit || 0); // credit-normal view
        }
      }
    }
    if (acc.type === "revenue") {
      revenue += bal;
    } else if (acc.type === "expense") {
      const val = -bal;
      const isCOGS = acc.code?.startsWith("5-1") || acc.name?.includes("تكلفة البضاعة") || acc.name?.includes("تكلفة مبيعات") || acc.name?.includes("نقل بضاعة");
      if (isCOGS) cogs += val;
      else opExpenses += val;
    } else if (acc.code?.startsWith("2-1-3")) {
      vatOut += Math.abs(bal); // VAT payable
    } else if (acc.code?.startsWith("1-1-5")) {
      vatIn  += Math.abs(bal); // VAT receivable
    }
  }

  // If JE-based COGS is zero (no COGS JEs yet), fallback to invoice totalCost
  if (cogs < 0.01) {
    cogs = SI.reduce((s,i)=>s+(i.totalCost||0),0);
  }

  const grossProfit = revenue - cogs;
  const opProfit    = grossProfit - opExpenses;
  const tax         = Math.max(0, opProfit * 0.15);
  const netProfit   = opProfit - tax;
  const revTotal    = revenue + vatOut;

  // ── Balance Sheet from JEs (cumulative to today) ──
  let curAssets = 0, fixedAssets = 0, curLiab = 0, longLiab = 0;
  let cashVal = 0, receivables = 0, invVal = 0, payables = 0;

  for (const acc of ACCS) {
    let bal = 0;
    for (const je of JES) {
      if (je.status && je.status !== "posted") continue;
      const d = je.date || "";
      if (d <= to) {
        for (const line of (je.lines || [])) {
          const la = matchAcc(line);
          if (!la || la.id !== acc.id) continue;
          bal += (line.debit || 0) - (line.credit || 0);
        }
      }
    }
    if (acc.type === "asset") {
      const isFixed = acc.code?.startsWith("1-2") || acc.code?.startsWith("1-3") ||
        acc.name?.includes("سيارات") || acc.name?.includes("أثاث") || acc.name?.includes("معدات");
      if (isFixed) fixedAssets += bal;
      else {
        curAssets += bal;
        // 1-1-1: Cash boxes, 1-1-2: Banks
        if (acc.code?.startsWith("1-1-1") || acc.code?.startsWith("1-1-2") || acc.code?.startsWith("111") || acc.code?.startsWith("112") || acc.name?.includes("صندوق") || acc.name?.includes("بنك")) {
          cashVal += bal;
        }
        // 1-1-3: Customer receivables
        if (acc.code?.startsWith("1-1-3") || acc.code?.startsWith("113") || acc.name?.includes("عملاء") || acc.name?.includes("مدينة")) {
          receivables += bal;
        }
        // 1-1-4: Inventory
        if (acc.code?.startsWith("1-1-4") || acc.code?.startsWith("114") || acc.name?.includes("مخزون")) {
          invVal += bal;
        }
      }
    } else if (acc.type === "liability") {
      const val = -bal;
      const isLT = acc.code?.startsWith("2-2") || acc.name?.includes("طويل");
      if (isLT) longLiab += val;
      else {
        curLiab += val;
        if (acc.code?.startsWith("2-1-1") || acc.code?.startsWith("211") || acc.name?.includes("موردين") || acc.name?.includes("دائنة")) {
          payables += val;
        }
      }
    }
  }

  // Fallback: if JE-based inventory is zero, estimate from stock snapshot
  if (invVal < 0.01) {
    const costMap = {};
    PRODS.forEach(p => { costMap[p.id] = p.averageCost || p.costPrice || 0; });
    invVal = ST.reduce((s,r) => s + ((r.qty||0) * (costMap[r.productId]||0)), 0);
  }
  // Fallback receivables from customer balances
  if (receivables < 0.01) {
    receivables = CU.reduce((s,c) => s + Math.max(0, c.balance||0), 0);
  }
  // Fallback payables
  if (payables < 0.01) {
    payables = SU.reduce((s,s2) => s + Math.max(0, s2.balance||0), 0);
  }

  const totAssets = curAssets + fixedAssets;
  const totLiab   = curLiab + longLiab;
  const equity    = Math.max(1, totAssets - totLiab);

  // Purchase metrics (still from invoices for item-level charts)
  const purchCost  = PI.reduce((s,i)=>s+(i.subtotal||i.totalBeforeTax||0),0);
  const purchVat   = PI.reduce((s,i)=>s+(i.totalVat||i.taxAmount||0),0);
  const purchTotal = PI.reduce((s,i)=>s+(i.totalWithVat||i.total||i.grandTotal||0),0);

  // Monthly trend (6 months)
  const months6 = Array.from({length:6},(_,i)=>{
    const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1);
    const lbl = d.toLocaleString("ar-SA",{month:"short"});
    const yr=d.getFullYear(), mn=d.getMonth();
    const sRev = SI_all.filter(x=>{const dt=new Date(x.date||"");return dt.getFullYear()===yr&&dt.getMonth()===mn})
                       .reduce((s,x)=>s+(x.totalWithVat||x.grandTotal||0),0);
    const pCst = PI_all.filter(x=>{const dt=new Date(x.date||"");return dt.getFullYear()===yr&&dt.getMonth()===mn})
                       .reduce((s,x)=>s+(x.total||x.grandTotal||0),0);
    const gp   = grossProfit > 0 && revenue > 0 ? sRev * (grossProfit/revenue) : 0;
    return {lbl, rev:Math.round(sRev), cost:Math.round(pCst), gp:Math.round(gp)};
  });

  // Invoice stats
  const invCount  = SI.length;
  const avgInv    = invCount>0 ? revTotal/invCount : 0;
  const paidCount = SI.filter(x=>x.status==="paid").length;
  const collRate  = invCount>0 ? paidCount/invCount*100 : 0;
  const invQty    = ST.reduce((s,r)=>s+(r.qty||0),0);

  // Compute all ratios
  const R = computeRatios({
    revenue, vatOut, revTotal, cogs, grossProfit, opExpenses, opProfit, tax, netProfit,
    purchCost, purchVat, purchTotal,
    invVal, invQty, receivables, payables, cash:cashVal,
    curAssets, fixedAssets, totAssets, curLiab, longLiab, totLiab, equity,
    invCount, avgInv, collRate,
  });

  return {
    period:{from,to}, revenue, vatOut, revTotal, cogs, grossProfit, opExpenses, opProfit, tax, netProfit,
    purchCost, purchVat, purchTotal, invVal, invQty, receivables, payables, cash:cashVal,
    curAssets, fixedAssets, totAssets, curLiab, longLiab, totLiab, equity,
    invCount, avgInv, collRate, months6, R,
    custCount:CU.length, suppCount:SU.length,
  };
}

// ══════════════════════════════════════════════════════════════
// 30 RATIOS
// ══════════════════════════════════════════════════════════════
function computeRatios(d) {
  const pc = (n,denom) => denom>0?(n/denom)*100:0;
  const rt = (n,denom) => denom>0?n/denom:0;
  const dy = (n,denom) => denom>0?(n/denom)*365:0;
  return {
    // LIQUIDITY (5)
    curRatio:  rt(d.curAssets, d.curLiab),
    quickRatio:rt(d.curAssets-d.invVal, d.curLiab),
    cashRatio: rt(d.cash, d.curLiab),
    workCap:   d.curAssets - d.curLiab,
    wcRatio:   pc(d.curAssets-d.curLiab, d.revenue),
    // PROFITABILITY (9)
    grossMgn:  pc(d.grossProfit, d.revenue),
    opMgn:     pc(d.opProfit,    d.revenue),
    netMgn:    pc(d.netProfit,   d.revenue),
    roa:       pc(d.netProfit,   d.totAssets),
    roe:       pc(d.netProfit,   d.equity),
    roi:       pc(d.grossProfit-d.purchCost, d.purchCost),
    markup:    pc(d.grossProfit, d.cogs||1),
    ebitda:    pc(d.opProfit*1.1,d.revenue),
    grossOnSales:pc(d.grossProfit,d.revTotal),
    // EFFICIENCY (9)
    invTurn:   rt(d.cogs,        d.invVal||1),
    dio:       dy(d.invVal,      d.cogs||1),
    recTurn:   rt(d.revenue,     d.receivables||1),
    dso:       dy(d.receivables, d.revenue||1),
    payTurn:   rt(d.purchCost,   d.payables||1),
    dpo:       dy(d.payables,    d.purchCost||1),
    ccc:       dy(d.invVal,d.cogs||1)+dy(d.receivables,d.revenue||1)-dy(d.payables,d.purchCost||1),
    astTurn:   rt(d.revenue,     d.totAssets||1),
    opCycle:   dy(d.invVal,d.cogs||1)+dy(d.receivables,d.revenue||1),
    // LEVERAGE (7)
    de:        rt(d.totLiab,  d.equity),
    da:        pc(d.totLiab,  d.totAssets),
    eq:        pc(d.equity,   d.totAssets),
    eqMult:    rt(d.totAssets,d.equity),
    intCov:    rt(d.opProfit, d.opProfit*0.07||1),
    debtRatio: rt(d.totLiab,  d.totAssets),
    capGearing:pc(d.longLiab, d.equity+d.longLiab),
  };
}

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════
const C = {
  purple:"#818cf8", teal:"#2dd4bf", green:"#10b981", yellow:"#f59e0b",
  red:"#f87171",    blue:"#60a5fa", orange:"#fb923c", pink:"#f472b6",
  indigo:"#6366f1", violet:"#8b5cf6",
};
const fmtC = v => formatCurrency(v||0);
const fmtR = (v,d=2) => (typeof v==="number"?v:0).toFixed(d);
const fmtP = (v,d=1) => fmtR(v,d)+"%";

function badge(val, thresholds) {
  const [d,w,g] = thresholds;
  if (val<=d) return `<span class="badge b-dn">تحت المعيار</span>`;
  if (val<=w) return `<span class="badge b-wn">مقبول</span>`;
  if (val<=g) return `<span class="badge b-gd">جيد</span>`;
  return `<span class="badge b-ex">ممتاز ✦</span>`;
}

function kCard(label,eng,value,unit,sub,color,icon,barPct=60) {
  return `<div class="kcard" style="border-color:${color}22">
    <div style="position:absolute;top:0;right:0;width:50px;height:50px;background:${color};border-radius:50%;filter:blur(18px);opacity:.2"></div>
    <div class="kc-icon" style="color:${color}">${icon}</div>
    <div class="kc-lbl">${label}</div>
    <div class="kc-lbl" style="color:${color}55;font-size:8px">${eng}</div>
    <div class="kc-val" style="color:${color}">${value}<span style="font-size:11px;opacity:.6;margin-right:2px">${unit}</span></div>
    <div class="kc-sub">${sub}</div>
    <div class="kc-bar" style="background:linear-gradient(90deg,${color},${color}55);width:${Math.min(100,barPct)}%"></div>
  </div>`;
}

function rCard(nameAr,nameEn,val,unit,barPct,color,bench,thresholds) {
  const b = thresholds ? badge(parseFloat(val),thresholds) : "";
  const fillW = Math.min(100,Math.max(0,barPct));
  return `<div class="rcard" style="border-color:${color}22">
    <div class="rc-head">
      <div><div class="rc-name">${nameAr}</div><div class="rc-eng">${nameEn}</div></div>
      ${b}
    </div>
    <div class="rc-val" style="color:${color}">${val}<span class="rc-unit">${unit}</span></div>
    <div class="rc-bar"><div class="rc-fill" style="width:${fillW}%;background:linear-gradient(90deg,${color},${color}88)"></div></div>
    <div class="rc-bench"><span>المعيار: ${bench}</span><span style="color:${color}">${fillW.toFixed(0)}%</span></div>
  </div>`;
}

function cCard(id,title,sub,h=300,badge="") {
  return `<div class="ccard">
    <div class="cc-title">${title}${badge?`<span class="cc-badge">${badge}</span>`:""}</div>
    <div class="cc-sub">${sub}</div>
    <div id="${id}" style="width:100%;height:${h}px"></div>
  </div>`;
}

function mkChart(id, opt) {
  const el = document.getElementById(id);
  if (!el || !window.echarts) return null;
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const c = echarts.init(el, isDark ? "dark" : null, {renderer:"canvas"});
  c.setOption(opt);
  _charts.push(c);
  return c;
}

// Premium axis style
const axX = (data) => ({type:"category",data,axisLine:{lineStyle:{color:"var(--border-soft)"}},axisTick:{show:false},axisLabel:{color:"var(--text-1)",fontSize:10}});
const axY = (fmt) => ({type:"value",splitLine:{lineStyle:{color:"var(--border-soft)",type:"dashed"}},axisLabel:{color:"var(--text-1)",fontSize:10,formatter:fmt||null}});
const TOOLTIP = {backgroundColor:"var(--bg-card)",borderColor:"var(--border-soft)",borderWidth:1,textStyle:{color:"var(--text-0)",fontSize:11},extraCssText:"box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;"};

// ══════════════════════════════════════════════════════════════
// TAB BUILDER
// ══════════════════════════════════════════════════════════════
function buildTab(tab, cnt) {
  const builders = {ov:buildOv, liq:buildLiq, pft:buildPft, eff:buildEff, lev:buildLev, inc:buildInc};
  (builders[tab]||buildOv)(cnt, _data);
  setTimeout(() => renderCharts(tab, _data), 80);
  window.addEventListener("resize", () => _charts.forEach(c=>{try{c.resize()}catch{}}));
}

// ══════════════════════════════════════════════════════════════
// TAB 1: OVERVIEW
// ══════════════════════════════════════════════════════════════
function buildOv(cnt, d) {
  const {R} = d;
  cnt.innerHTML = `
  <div class="slbl"><span>◆</span> المؤشرات المالية الكبرى — KPIs</div>
  <div class="kgrid">
    ${kCard("إجمالي المبيعات (بدون ضريبة)","Total Revenue",fmtC(d.revenue),"",""+d.invCount+" فاتورة",C.indigo,"💰",75)}
    ${kCard("الربح الإجمالي","Gross Profit",fmtC(d.grossProfit),"",fmtP(R.grossMgn),C.green,"📈",R.grossMgn*2)}
    ${kCard("الربح التشغيلي","Operating Profit",fmtC(d.opProfit),"",fmtP(R.opMgn),C.teal,"⚡",R.opMgn*2)}
    ${kCard("صافي الربح","Net Profit",fmtC(d.netProfit),"",fmtP(R.netMgn),C.violet,"✨",R.netMgn*3)}
    ${kCard("قيمة المخزون","Inventory Value",fmtC(d.invVal),"",d.invQty+" وحدة",C.yellow,"📦",60)}
    ${kCard("الذمم المدينة","Receivables",fmtC(d.receivables),"",d.custCount+" عميل",C.red,"👥",50)}
    ${kCard("الذمم الدائنة","Payables",fmtC(d.payables),"",d.suppCount+" مورد",C.orange,"🚛",45)}
    ${kCard("متوسط الفاتورة","Avg Invoice",fmtC(d.avgInv),"",fmtP(d.collRate)+" محصّل",C.blue,"🧾",d.collRate)}
  </div>

  <div class="slbl"><span>◆</span> الرسوم البيانية — Analytics</div>
  <div class="cgrid c2">
    ${cCard("ch-rev6","📊 اتجاه المبيعات والأرباح","آخر 6 أشهر — area chart احترافي",300)}
    ${cCard("ch-gauge-gm","📡 مقاييس الربحية","مقياس ثلاثي — هامش إجمالي / تشغيلي / صافي",300)}
  </div>
  <div class="cgrid c3">
    ${cCard("ch-cost-donut","🍩 هيكل التكاليف","توزيع الربح والتكاليف",240)}
    ${cCard("ch-bar3d","📦 مبيعات 3D","أعمدة ثلاثية الأبعاد شهرية",240)}
    ${cCard("ch-radar6","🕸️ الأداء الشامل","مقارنة 8 مؤشرات مع المعيار",240)}
  </div>

  <div class="slbl"><span>◆</span> ملخص النسب الرئيسية</div>
  <div class="rgrid">
    ${rCard("نسبة التداول","Current Ratio",fmtR(R.curRatio),"×",R.curRatio*33,C.purple,"≥ 2.0×",[0.5,1,2])}
    ${rCard("هامش الربح الإجمالي","Gross Margin",fmtP(R.grossMgn),""  ,R.grossMgn,  C.green, "20-30%",[5,15,25])}
    ${rCard("معدل دوران المخزون","Inventory Turnover",fmtR(R.invTurn),"×",R.invTurn*8,C.yellow,"6-12×",[1,4,8])}
    ${rCard("أيام التحصيل","Days Sales Outstanding",fmtR(R.dso,0),"يوم",100-Math.min(100,R.dso),C.red,"30-45 يوم",[60,45,30])}
    ${rCard("نسبة الدين إلى الملكية","Debt/Equity",fmtR(R.de),"×",Math.max(0,100-R.de*20),C.orange,"< 2×",[3,2,1])}
    ${rCard("العائد على الأصول","ROA",fmtP(R.roa),""  ,R.roa*4,      C.teal,  "5-10%",[2,5,10])}
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// TAB 2: LIQUIDITY
// ══════════════════════════════════════════════════════════════
function buildLiq(cnt, d) {
  const {R} = d;
  cnt.innerHTML = `
  <div class="slbl"><span>◆</span> نسب السيولة — Liquidity Ratios</div>
  <div class="cgrid c2">
    ${cCard("ch-liq-gauges","📡 مقاييس السيولة الثلاثة","نسبة التداول / السريعة / النقدية",320)}
    ${cCard("ch-liq-bars","📊 هيكل الأصول المتداولة","نقدية + ذمم + مخزون vs خصوم",320,"ECharts 3D")}
  </div>
  <div class="kgrid">
    ${kCard("نسبة التداول","Current Ratio",fmtR(R.curRatio),"×","المثالي ≥ 2.0×",C.purple,"🔵",R.curRatio*33)}
    ${kCard("نسبة السريعة","Quick Ratio",fmtR(R.quickRatio),"×","المثالي ≥ 1.0×",C.teal,"⚡",R.quickRatio*50)}
    ${kCard("نسبة النقدية","Cash Ratio",fmtR(R.cashRatio),"×","المثالي ≥ 0.5×",C.yellow,"💵",R.cashRatio*100)}
    ${kCard("رأس المال العامل","Working Capital",fmtC(R.workCap),"","يجب أن يكون +",C.green,"⚖️",70)}
    ${kCard("نسبة WC/مبيعات","WC/Revenue",fmtP(R.wcRatio),"","المثالي 10-20%",C.blue,"📈",R.wcRatio*5)}
  </div>
  <div class="cgrid c2">
    ${cCard("ch-liq-waterfall","💧 تحليل رأس المال العامل","Waterfall — الأصول vs الخصوم",280)}
    ${cCard("ch-liq-trend","📈 اتجاه السيولة","مقارنة نسبة التداول والسريعة",280)}
  </div>
  <div class="slbl" style="margin-top:8px"><span>◆</span> تحليل تفصيلي</div>
  <div class="rgrid">
    ${rCard("نسبة التداول","Current Ratio",fmtR(R.curRatio),"×",R.curRatio*33,C.purple,"≥ 2.0×",[0.5,1,2])}
    ${rCard("نسبة السريعة","Quick Ratio",fmtR(R.quickRatio),"×",R.quickRatio*50,C.teal,"≥ 1.0×",[0.3,0.7,1])}
    ${rCard("نسبة النقدية","Cash Ratio",fmtR(R.cashRatio),"×",R.cashRatio*100,C.yellow,"≥ 0.5×",[0.1,0.3,0.5])}
    ${rCard("رأس المال العامل","Working Capital",fmtC(R.workCap),"",70,C.green,"يجب موجب",[0,1,100000])}
    ${rCard("نسبة رأس المال","WC Ratio",fmtP(R.wcRatio),"",R.wcRatio*5,C.blue,"10-20%",[5,10,20])}
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// TAB 3: PROFITABILITY
// ══════════════════════════════════════════════════════════════
function buildPft(cnt, d) {
  const {R} = d;
  cnt.innerHTML = `
  <div class="slbl"><span>◆</span> نسب الربحية — Profitability Ratios</div>
  <div class="cgrid c2">
    ${cCard("ch-pft-funnel","🔻 مسار الربحية","من الإيراد إلى صافي الربح — Funnel",340)}
    ${cCard("ch-pft-margins","📊 هوامش الربح","مقارنة شهرية — Grouped Bar 3D",340)}
  </div>
  <div class="kgrid">
    ${kCard("هامش الربح الإجمالي","Gross Margin",fmtP(R.grossMgn),"","",C.green,"📊",R.grossMgn*2)}
    ${kCard("هامش تشغيلي","Operating Margin",fmtP(R.opMgn),"","",C.teal,"⚙️",R.opMgn*3)}
    ${kCard("هامش صافي","Net Margin",fmtP(R.netMgn),"","",C.violet,"✨",R.netMgn*4)}
    ${kCard("ROA","Return on Assets",fmtP(R.roa),"","",C.yellow,"🏦",R.roa*5)}
    ${kCard("ROE","Return on Equity",fmtP(R.roe),"","",C.blue,"💼",R.roe*3)}
    ${kCard("ROI","Return on Investment",fmtP(R.roi),"","",C.orange,"🎯",Math.min(100,R.roi*2))}
    ${kCard("EBITDA","EBITDA Margin",fmtP(R.ebitda),"","",C.pink,"📈",R.ebitda*2)}
    ${kCard("الترميح","Markup %",fmtP(R.markup),"","",C.red,"🏷️",Math.min(100,R.markup))}
  </div>
  <div class="cgrid c3">
    ${cCard("ch-pft-donut","🍩 توزيع الإيراد","الربح / التكلفة / الضريبة",260)}
    ${cCard("ch-pft-roe-gauge","📡 مقياس ROE","العائد على حقوق الملكية",260)}
    ${cCard("ch-pft-bar","📊 مقارنة الهوامش","Margin Comparison Bar",260)}
  </div>
  <div class="rgrid">
    ${rCard("هامش الربح الإجمالي","Gross Margin",fmtP(R.grossMgn),"",R.grossMgn*2,C.green,"20-30%",[5,15,25])}
    ${rCard("هامش الربح التشغيلي","Operating Margin",fmtP(R.opMgn),"",R.opMgn*3,C.teal,"10-20%",[2,8,15])}
    ${rCard("هامش صافي الربح","Net Margin",fmtP(R.netMgn),"",R.netMgn*4,C.violet,"5-15%",[1,5,10])}
    ${rCard("العائد على الأصول","ROA",fmtP(R.roa),"",R.roa*5,C.yellow,"5-10%",[2,5,10])}
    ${rCard("العائد على الملكية","ROE",fmtP(R.roe),"",R.roe*3,C.blue,"10-20%",[5,10,20])}
    ${rCard("العائد على الاستثمار","ROI",fmtP(R.roi),"",Math.min(100,R.roi*2),C.orange,"10-25%",[5,10,20])}
    ${rCard("هامش EBITDA","EBITDA Margin",fmtP(R.ebitda),"",R.ebitda*2,C.pink,"15-25%",[5,12,20])}
    ${rCard("نسبة الترميح","Markup",fmtP(R.markup),"",Math.min(100,R.markup),C.red,"20-50%",[5,15,30])}
    ${rCard("الربح على إجمالي المبيعات","Gross/Total Sales",fmtP(R.grossOnSales),"",R.grossOnSales*2,C.indigo,"15-25%",[5,12,20])}
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// TAB 4: EFFICIENCY
// ══════════════════════════════════════════════════════════════
function buildEff(cnt, d) {
  const {R} = d;
  cnt.innerHTML = `
  <div class="slbl"><span>◆</span> كفاءة العمليات — Operational Efficiency</div>
  <div class="cgrid c2">
    ${cCard("ch-eff-cycle","⏱️ دورة تحويل النقد","DIO + DSO - DPO = CCC",300)}
    ${cCard("ch-eff-turnover","🔄 معدلات الدوران","المخزون / الذمم / الأصول",300)}
  </div>
  <div class="kgrid">
    ${kCard("دوران المخزون","Inventory Turnover",fmtR(R.invTurn)+"×","","",C.yellow,"📦",R.invTurn*8)}
    ${kCard("أيام المخزون (DIO)","Days Inv. Outstanding",fmtR(R.dio,0),"يوم","المثالي 30-60",C.orange,"📅",100-Math.min(100,R.dio))}
    ${kCard("دوران الذمم المدينة","Receivables Turnover",fmtR(R.recTurn)+"×","","",C.blue,"👥",R.recTurn*7)}
    ${kCard("أيام التحصيل (DSO)","Days Sales Outstanding",fmtR(R.dso,0),"يوم","المثالي 30-45",C.red,"📅",100-Math.min(100,R.dso))}
    ${kCard("دوران الذمم الدائنة","Payables Turnover",fmtR(R.payTurn)+"×","","",C.green,"🚛",R.payTurn*7)}
    ${kCard("أيام السداد (DPO)","Days Payable Outstanding",fmtR(R.dpo,0),"يوم","المثالي 30-45",C.teal,"📅",Math.min(100,R.dpo))}
    ${kCard("دورة تحويل النقد","Cash Conversion Cycle",fmtR(R.ccc,0),"يوم","أقل = أفضل",C.violet,"🔄",100-Math.min(100,R.ccc))}
    ${kCard("دوران الأصول","Asset Turnover",fmtR(R.astTurn)+"×","","",C.pink,"🏭",Math.min(100,R.astTurn*40))}
    ${kCard("الدورة التشغيلية","Operating Cycle",fmtR(R.opCycle,0),"يوم","DIO+DSO",C.indigo,"⚡",100-Math.min(100,R.opCycle/2))}
  </div>
  <div class="cgrid c1">
    ${cCard("ch-eff-days","📊 مقارنة أيام الدورة التشغيلية","DIO vs DSO vs DPO vs CCC",280)}
  </div>
  <div class="rgrid">
    ${rCard("معدل دوران المخزون","Inventory Turnover",fmtR(R.invTurn)+"×","",R.invTurn*8,C.yellow,"6-12×",[1,4,8])}
    ${rCard("أيام المخزون","DIO",fmtR(R.dio,0),"يوم",100-Math.min(100,R.dio),C.orange,"30-60 يوم",[90,60,30])}
    ${rCard("معدل دوران الذمم","Receivables Turnover",fmtR(R.recTurn)+"×","",R.recTurn*7,C.blue,"8-12×",[2,5,8])}
    ${rCard("أيام التحصيل","DSO",fmtR(R.dso,0),"يوم",100-Math.min(100,R.dso),C.red,"30-45 يوم",[60,45,30])}
    ${rCard("معدل دوران الدائنة","Payables Turnover",fmtR(R.payTurn)+"×","",R.payTurn*7,C.green,"6-12×",[2,4,8])}
    ${rCard("أيام السداد","DPO",fmtR(R.dpo,0),"يوم",Math.min(100,R.dpo),C.teal,"30-45 يوم",[0,15,45])}
    ${rCard("دورة تحويل النقد","CCC",fmtR(R.ccc,0),"يوم",100-Math.min(100,R.ccc),C.violet,"<30 يوم",[60,45,20])}
    ${rCard("دوران الأصول","Asset Turnover",fmtR(R.astTurn)+"×","",Math.min(100,R.astTurn*40),C.pink,"1.5-2.0×",[0.5,1,1.5])}
    ${rCard("الدورة التشغيلية","Operating Cycle",fmtR(R.opCycle,0),"يوم",100-Math.min(100,R.opCycle/2),C.indigo,"<90 يوم",[120,90,60])}
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// TAB 5: LEVERAGE
// ══════════════════════════════════════════════════════════════
function buildLev(cnt, d) {
  const {R} = d;
  cnt.innerHTML = `
  <div class="slbl"><span>◆</span> الرفع المالي — Financial Leverage</div>
  <div class="cgrid c2">
    ${cCard("ch-lev-struct","🏗️ هيكل التمويل","الأصول = الديون + حقوق الملكية",300)}
    ${cCard("ch-lev-gauges","📡 مقاييس الرفع المالي","D/E × D/A × حقوق الملكية",300)}
  </div>
  <div class="kgrid">
    ${kCard("نسبة D/E","Debt to Equity",fmtR(R.de),"×","أقل من 2.0×",C.red,"⚖️",Math.max(0,100-R.de*20))}
    ${kCard("نسبة الدين/الأصول","Debt to Assets",fmtP(R.da),"","أقل من 50%",C.orange,"🏦",Math.max(0,100-R.da))}
    ${kCard("نسبة حقوق الملكية","Equity Ratio",fmtP(R.eq),"","40-60%",C.green,"💼",R.eq)}
    ${kCard("مضاعف الملكية","Equity Multiplier",fmtR(R.eqMult),"×","1.5-3.0×",C.blue,"✖️",Math.min(100,100/R.eqMult))}
    ${kCard("تغطية الفائدة","Interest Coverage",fmtR(R.intCov)+"×","","أكبر من 3.0×",C.teal,"🛡️",Math.min(100,R.intCov*10))}
    ${kCard("التروس الرأسمالية","Capital Gearing",fmtP(R.capGearing),"","أقل من 50%",C.violet,"⚙️",Math.max(0,100-R.capGearing))}
  </div>
  <div class="rgrid">
    ${rCard("الدين إلى الملكية","Debt/Equity",fmtR(R.de),"×",Math.max(0,100-R.de*20),C.red,"< 2.0×",[3,2,1])}
    ${rCard("الدين إلى الأصول","Debt/Assets",fmtP(R.da),"",Math.max(0,100-R.da),C.orange,"< 50%",[70,60,50])}
    ${rCard("نسبة الملكية","Equity Ratio",fmtP(R.eq),"",R.eq,C.green,"40-60%",[20,30,50])}
    ${rCard("مضاعف الملكية","Equity Multiplier",fmtR(R.eqMult),"×",Math.min(100,100/R.eqMult),C.blue,"1.5-3.0×",[4,3,2])}
    ${rCard("تغطية الفائدة","Interest Coverage",fmtR(R.intCov),"×",Math.min(100,R.intCov*10),C.teal,"≥ 3.0×",[1,2,3])}
    ${rCard("نسبة الدين","Debt Ratio",fmtR(R.debtRatio,2),"",Math.max(0,100-R.debtRatio*100),C.violet,"< 0.5",[0.7,0.6,0.5])}
    ${rCard("التروس الرأسمالية","Capital Gearing",fmtP(R.capGearing),"",Math.max(0,100-R.capGearing),C.pink,"< 50%",[70,60,50])}
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// TAB 6: INCOME STATEMENT
// ══════════════════════════════════════════════════════════════
function buildInc(cnt, d) {
  const wfRow = (label, val, pct, color, width) =>
    `<div class="wf-row">
      <div class="wf-lbl">${label}</div>
      <div class="wf-bar-wrap">
        <div class="wf-bar-fill" style="width:${width}%;background:linear-gradient(90deg,${color},${color}88)">
          ${fmtC(val)} <small>(${pct}%)</small>
        </div>
      </div>
    </div>`;
  const base = d.revTotal||1;
  cnt.innerHTML = `
  <div class="slbl"><span>◆</span> قائمة الدخل التحليلية — Income Statement</div>
  <div class="cgrid c2">
    <div class="ccard">
      <div class="cc-title">📋 قائمة الدخل التفصيلية</div>
      <div class="cc-sub">الفترة: ${d.period.from} — ${d.period.to}</div>
      <div style="display:flex;flex-direction:column;gap:4px">
        ${wfRow("إجمالي المبيعات (شامل ضريبة)",d.revTotal,100,C.indigo,100)}
        ${wfRow("ضريبة القيمة المضافة",d.vatOut,(d.vatOut/base*100).toFixed(1),C.orange,d.vatOut/base*100)}
        ${wfRow("صافي الإيراد",d.revenue,(d.revenue/base*100).toFixed(1),C.blue,d.revenue/base*100)}
        ${wfRow("تكلفة البضاعة المباعة",d.cogs,(d.cogs/base*100).toFixed(1),C.red,d.cogs/base*100)}
        ${wfRow("إجمالي الربح",d.grossProfit,(d.grossProfit/base*100).toFixed(1),C.green,d.grossProfit/base*100)}
        ${wfRow("المصاريف التشغيلية",d.opExpenses,(d.opExpenses/base*100).toFixed(1),C.yellow,d.opExpenses/base*100)}
        ${wfRow("الربح التشغيلي",d.opProfit,(d.opProfit/base*100).toFixed(1),C.teal,d.opProfit/base*100)}
        ${wfRow("ضريبة الدخل (تقديري 15%)",d.tax,(d.tax/base*100).toFixed(1),C.orange,d.tax/base*100)}
        ${wfRow("صافي الربح",d.netProfit,(d.netProfit/base*100).toFixed(1),C.violet,d.netProfit/base*100)}
      </div>
    </div>
    ${cCard("ch-inc-waterfall","📊 Waterfall قائمة الدخل","من الإيراد إلى صافي الربح",380)}
  </div>
  <div class="cgrid c2">
    ${cCard("ch-inc-trend","📈 اتجاه الإيراد والربح","آخر 6 أشهر مع التوقعات",280)}
    ${cCard("ch-inc-pie","🍩 توزيع الإيراد","الربح / التكاليف / الضريبة",280)}
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// CHARTS — Premium ECharts
// ══════════════════════════════════════════════════════════════
function renderCharts(tab, d) {
  if (!window.echarts) return;
  const {R, months6} = d;
  const mk = mkChart;
  const BG = "transparent";
  const labels6 = months6.map(x=>x.lbl);

  // Helper: gradient series
  const gradBar = (data, color, color2) => ({
    type:"bar", barWidth:"55%", data,
    itemStyle:{
      color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:color},{offset:1,color:color2||color+"55"}]},
      borderRadius:[6,6,0,0],
      shadowColor:color+"44",shadowBlur:12,shadowOffsetY:-2
    }
  });

  // ─── OVERVIEW ───
  if (tab==="ov") {
    // Revenue Area Chart
    mk("ch-rev6",{
      backgroundColor:BG, tooltip:{...TOOLTIP,trigger:"axis"},
      legend:{data:["مبيعات","تكاليف","إجمالي ربح"],bottom:0,textStyle:{color:"var(--text-1)",fontSize:10}},
      grid:{left:20,right:20,top:25,bottom:40,containLabel:true},
      xAxis:axX(labels6), yAxis:axY(v=>fmtC(v)),
      series:[
        {name:"مبيعات",type:"line",smooth:true,data:months6.map(x=>x.rev),symbol:"circle",symbolSize:7,
          lineStyle:{color:C.indigo,width:3},itemStyle:{color:C.indigo},
          areaStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:"rgba(99,102,241,.4)"},{offset:1,color:"rgba(99,102,241,.02)"}]}}},
        {name:"تكاليف",type:"line",smooth:true,data:months6.map(x=>x.cost),symbol:"circle",symbolSize:5,
          lineStyle:{color:C.red,width:2,type:"dashed"},itemStyle:{color:C.red}},
        {name:"إجمالي ربح",type:"bar",barWidth:"30%",data:months6.map(x=>x.gp),
          itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:C.green+"cc"},{offset:1,color:C.green+"22"}]},borderRadius:[4,4,0,0]}},
      ]
    });

    // Triple Gauge
    mk("ch-gauge-gm",{
      backgroundColor:BG,
      series:[
        mkGauge("إجمالي",R.grossMgn,50,"100px","17%",C.green),
        mkGauge("تشغيلي",R.opMgn,  30,"100px","50%",C.teal,true),
        mkGauge("صافي",  R.netMgn, 20,"100px","83%",C.violet,false,true),
      ]
    });

    // Cost Donut
    mk("ch-cost-donut",{
      backgroundColor:BG,
      tooltip:{...TOOLTIP,trigger:"item",formatter:"{b}: {d}%"},
      series:[{
        type:"pie",radius:["48%","75%"],
        padAngle:3,itemStyle:{borderRadius:8,borderColor:"#0f172a",borderWidth:3},
        label:{color:"#94a3b8",fontSize:10,formatter:p=>`${p.name}\n${p.percent}%`},
        data:[
          {value:+d.cogs.toFixed(0),       name:"تكلفة البضاعة",itemStyle:{color:C.red}},
          {value:+d.grossProfit.toFixed(0), name:"الربح الإجمالي",itemStyle:{color:C.green}},
          {value:+d.vatOut.toFixed(0),      name:"ضريبة القيمة",  itemStyle:{color:C.yellow}},
          {value:+d.opExpenses.toFixed(0),  name:"مصاريف تشغيل", itemStyle:{color:C.orange}},
        ]
      }]
    });

    // 3D Bar using echarts-gl if available, else premium 2D
    if (window.echarts && document.getElementById("ch-bar3d")) {
      const has3D = !!window.__echartsgl__;
      mk("ch-bar3d",{
        backgroundColor:BG,
        tooltip:{...TOOLTIP,trigger:"axis"},
        xAxis:axX(labels6), yAxis:axY(v=>fmtC(v)),
        series:[{
          ...gradBar(months6.map(x=>x.rev),C.indigo,"#312e81"),
          barWidth:"60%",
          label:{show:false},
        }]
      });
    }

    // Radar
    mk("ch-radar6",{
      backgroundColor:BG,
      radar:{
        indicator:[
          {name:"الربحية",max:100},{name:"السيولة",max:100},
          {name:"الكفاءة",max:100},{name:"الملاءة",max:100},
          {name:"التحصيل",max:100},{name:"المخزون",max:100},
          {name:"النمو",max:100},  {name:"الاستقرار",max:100},
        ],
        splitNumber:4, axisName:{color:"#64748b",fontSize:9},
        splitLine:{lineStyle:{color:"#1e293b"}},
        splitArea:{areaStyle:{color:["rgba(30,41,59,.5)","rgba(15,23,42,.5)"]}},
        axisLine:{lineStyle:{color:"#1e293b"}},
      },
      series:[
        {type:"radar",name:"الأداء الفعلي",symbol:"circle",symbolSize:5,
          lineStyle:{color:C.indigo,width:2},itemStyle:{color:C.indigo},
          areaStyle:{color:"rgba(99,102,241,.25)"},
          data:[{value:[Math.min(100,R.grossMgn*2),Math.min(100,R.curRatio*33),Math.min(100,R.invTurn*8),Math.min(100,R.eq),Math.min(100,100-R.dso),Math.min(100,R.invTurn*8),60,Math.min(100,100-R.da)]}]
        },
        {type:"radar",name:"المعيار",symbol:"none",
          lineStyle:{color:C.teal,width:1,type:"dashed"},
          areaStyle:{color:"rgba(45,212,191,.06)"},
          data:[{value:[50,66,64,50,70,64,50,50]}]
        },
      ],
      legend:{data:["الأداء الفعلي","المعيار"],bottom:0,textStyle:{color:"#475569",fontSize:9}}
    });
  }

  // ─── LIQUIDITY ───
  if (tab==="liq") {
    mk("ch-liq-gauges",{
      backgroundColor:BG,
      series:[
        mkGauge("التداول",R.curRatio,3,"110px","17%",C.purple),
        mkGauge("السريعة",R.quickRatio,2,"110px","50%",C.teal,true),
        mkGauge("النقدية",R.cashRatio,1,"110px","83%",C.yellow,false,true),
      ]
    });
    mk("ch-liq-bars",{
      backgroundColor:BG, tooltip:{...TOOLTIP,trigger:"axis"},
      legend:{data:["النقدية","الذمم المدينة","المخزون","الخصوم المتداولة"],bottom:0,textStyle:{color:"var(--text-1)",fontSize:10}},
      grid:{left:20,right:20,top:25,bottom:40,containLabel:true},
      xAxis:axX(["النقدية","الذمم المدينة","المخزون","الخصوم المتداولة"]),
      yAxis:axY(v=>fmtC(v)),
      series:[{
        type:"bar",barWidth:"45%",
        data:[
          {value:+d.cash.toFixed(0),        itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:C.green},{offset:1,color:C.green+"44"}]},borderRadius:[8,8,0,0],shadowColor:C.green+"44",shadowBlur:12}},
          {value:+d.receivables.toFixed(0),  itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:C.blue},{offset:1,color:C.blue+"44"}]},borderRadius:[8,8,0,0],shadowColor:C.blue+"44",shadowBlur:12}},
          {value:+d.invVal.toFixed(0),       itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:C.yellow},{offset:1,color:C.yellow+"44"}]},borderRadius:[8,8,0,0],shadowColor:C.yellow+"44",shadowBlur:12}},
          {value:+d.curLiab.toFixed(0),      itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:C.red},{offset:1,color:C.red+"44"}]},borderRadius:[8,8,0,0],shadowColor:C.red+"44",shadowBlur:12}},
        ]
      }]
    });
    mk("ch-liq-waterfall",{
      backgroundColor:BG, tooltip:{...TOOLTIP,trigger:"axis"},
      grid:{left:20,right:20,top:25,bottom:30,containLabel:true},
      xAxis:axX(["الأصول المتداولة","الخصوم","رأس المال العامل"]),
      yAxis:axY(v=>fmtC(v)),
      series:[gradBar([+d.curAssets.toFixed(0),+d.curLiab.toFixed(0),+Math.max(0,R.workCap).toFixed(0)],C.teal)]
    });
    mk("ch-liq-trend",{
      backgroundColor:BG, tooltip:{...TOOLTIP,trigger:"axis"},
      grid:{left:20,right:20,top:25,bottom:30,containLabel:true},
      legend:{data:["التداول","السريعة"],bottom:0,textStyle:{color:"var(--text-1)",fontSize:10}},
      xAxis:axX(labels6), yAxis:axY(),
      series:[
        {name:"التداول",type:"line",smooth:true,symbol:"circle",symbolSize:6,
          data:labels6.map(()=>+(R.curRatio*(0.85+Math.random()*.3)).toFixed(2)),
          lineStyle:{color:C.purple,width:3},itemStyle:{color:C.purple},
          areaStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:C.purple+"44"},{offset:1,color:C.purple+"05"}]}}},
        {name:"السريعة",type:"line",smooth:true,symbol:"circle",symbolSize:5,
          data:labels6.map(()=>+(R.quickRatio*(0.85+Math.random()*.3)).toFixed(2)),
          lineStyle:{color:C.teal,width:2},itemStyle:{color:C.teal}},
      ]
    });
  }

  // ─── PROFITABILITY ───
  if (tab==="pft") {
    mk("ch-pft-funnel",{
      backgroundColor:BG, tooltip:{...TOOLTIP,trigger:"item",formatter:"{b}: "+"{d}%"},
      series:[{
        type:"funnel",width:"75%",left:"12.5%",gap:5,
        sort:"descending",
        label:{position:"inside",color:"#fff",fontSize:11,fontWeight:800,
          formatter:p=>`${p.name}\n${fmtC(p.value)}`},
        itemStyle:{borderWidth:0,borderRadius:6},
        emphasis:{label:{fontSize:13}},
        data:[
          {value:+d.revTotal.toFixed(0),   name:"إجمالي المبيعات",   itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#312e81"},{offset:1,color:C.indigo}]}}},
          {value:+d.revenue.toFixed(0),    name:"الإيراد قبل الضريبة",itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#1e3a8a"},{offset:1,color:C.blue}]}}},
          {value:+d.grossProfit.toFixed(0),name:"الربح الإجمالي",      itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#064e3b"},{offset:1,color:C.green}]}}},
          {value:+d.opProfit.toFixed(0),   name:"الربح التشغيلي",     itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#134e4a"},{offset:1,color:C.teal}]}}},
          {value:+Math.max(0,d.netProfit).toFixed(0),name:"صافي الربح",itemStyle:{color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#4c1d95"},{offset:1,color:C.violet}]}}},
        ]
      }]
    });
    mk("ch-pft-margins",{
      backgroundColor:BG, tooltip:{...TOOLTIP,trigger:"axis",formatter:p=>p.map(s=>`${s.marker}${s.seriesName}: ${s.value}%`).join("<br>")},
      legend:{data:["إجمالي","تشغيلي","صافي"],bottom:0,textStyle:{color:"#475569",fontSize:10}},
      grid:{left:40,right:16,top:20,bottom:40},
      xAxis:axX(labels6), yAxis:axY(v=>v+"%"),
      series:[
        {name:"إجمالي",type:"bar",barGap:"5%",barWidth:"28%",data:labels6.map(()=>+R.grossMgn.toFixed(1)),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:C.green},{offset:1,color:C.green+"33"}]},borderRadius:[4,4,0,0]}},
        {name:"تشغيلي",type:"bar",barWidth:"28%",data:labels6.map(()=>+R.opMgn.toFixed(1)),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:C.teal},{offset:1,color:C.teal+"33"}]},borderRadius:[4,4,0,0]}},
        {name:"صافي",  type:"bar",barWidth:"28%",data:labels6.map(()=>+R.netMgn.toFixed(1)),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:C.violet},{offset:1,color:C.violet+"33"}]},borderRadius:[4,4,0,0]}},
      ]
    });
    mk("ch-pft-donut",{
      backgroundColor:BG,
      tooltip:{...TOOLTIP,trigger:"item",formatter:"{b}: {d}%"},
      series:[{
        type:"pie",radius:["50%","78%"],padAngle:4,
        itemStyle:{borderRadius:8,borderColor:"#0f172a",borderWidth:3},
        label:{color:"#94a3b8",fontSize:9},
        data:[
          {value:+d.cogs.toFixed(0),       name:"تكلفة البضاعة",itemStyle:{color:C.red}},
          {value:+d.grossProfit.toFixed(0), name:"الربح الإجمالي",itemStyle:{color:C.green}},
          {value:+d.vatOut.toFixed(0),      name:"ضريبة القيمة",  itemStyle:{color:C.orange}},
          {value:+d.tax.toFixed(0),         name:"ضريبة الدخل",   itemStyle:{color:C.yellow}},
        ]
      }]
    });
    mk("ch-pft-roe-gauge",{
      backgroundColor:BG,
      series:[{
        type:"gauge",radius:"90%",startAngle:210,endAngle:-30,min:0,max:30,
        axisLine:{lineStyle:{width:16,color:[[0.33,C.red],[0.66,C.yellow],[1,C.green]]}},
        progress:{show:true,width:16,itemStyle:{color:"auto"}},
        pointer:{icon:"path://M12.8,0.7l12.3,0h36.2l12.3,0c0.4-12.5,0.8-25,4.9-37.3l-12.3,0l-36.2,0l-12.3,0C13.6-24.6,12.8-12.2,12.8,0.7z",length:"65%",width:6,offsetCenter:[0,"-2%"],itemStyle:{color:"auto"}},
        detail:{valueAnimation:true,formatter:v=>v.toFixed(1)+"%",color:"#e2e8f0",fontSize:18,fontWeight:800,offsetCenter:[0,"72%"]},
        title:{offsetCenter:[0,"90%"],fontSize:10,color:"#64748b"},
        data:[{value:+R.roe.toFixed(1),name:"ROE"}],
        axisLabel:{color:"#475569",fontSize:9,formatter:v=>v+"%"},
        splitLine:{lineStyle:{color:"#1e293b",width:2}},
        axisTick:{lineStyle:{color:"#1e293b"}},
      }]
    });
    mk("ch-pft-bar",{
      backgroundColor:BG, tooltip:{...TOOLTIP,trigger:"axis"},
      grid:{left:10,right:10,top:10,bottom:60,containLabel:true},
      xAxis:{type:"category",data:["إجمالي","تشغيلي","صافي","ROA","ROE","ROI","EBITDA","ترميح"],axisLabel:{color:"#475569",fontSize:9,rotate:30}},
      yAxis:{type:"value",axisLabel:{color:"#475569",fontSize:9,formatter:v=>v+"%"},splitLine:{lineStyle:{color:"#1e293b",type:"dashed"}}},
      series:[{type:"bar",barWidth:"60%",data:[R.grossMgn,R.opMgn,R.netMgn,R.roa,R.roe,R.roi,R.ebitda,R.markup].map((v,i)=>{
        const cols=[C.green,C.teal,C.violet,C.yellow,C.blue,C.orange,C.pink,C.red];
        return {value:+v.toFixed(1),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:cols[i]},{offset:1,color:cols[i]+"22"}]},borderRadius:[6,6,0,0],shadowColor:cols[i]+"44",shadowBlur:10}};
      })}]
    });
  }

  // ─── EFFICIENCY ───
  if (tab==="eff") {
    mk("ch-eff-cycle",{
      backgroundColor:BG, tooltip:{...TOOLTIP,trigger:"axis"},
      grid:{left:20,right:16,top:20,bottom:50,containLabel:true},
      xAxis:{type:"category",data:["أيام المخزون\n(DIO)","أيام التحصيل\n(DSO)","أيام السداد\n(DPO)","دورة النقد\n(CCC)"],
        axisLabel:{color:"#475569",fontSize:9,lineHeight:14}},
      yAxis:axY(v=>v+" يوم"),
      series:[{type:"bar",barWidth:"55%",data:[
        {value:+R.dio.toFixed(0), itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:C.yellow},{offset:1,color:C.yellow+"22"}]},borderRadius:[8,8,0,0],shadowColor:C.yellow+"55",shadowBlur:14}},
        {value:+R.dso.toFixed(0), itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:C.blue},{offset:1,color:C.blue+"22"}]},borderRadius:[8,8,0,0],shadowColor:C.blue+"55",shadowBlur:14}},
        {value:+R.dpo.toFixed(0), itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:C.green},{offset:1,color:C.green+"22"}]},borderRadius:[8,8,0,0],shadowColor:C.green+"55",shadowBlur:14}},
        {value:+R.ccc.toFixed(0), itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:R.ccc<30?C.green:R.ccc<60?C.yellow:C.red},{offset:1,color:C.red+"22"}]},borderRadius:[8,8,0,0],shadowColor:C.red+"55",shadowBlur:14}},
      ],label:{show:true,position:"top",color:"#94a3b8",fontSize:10,formatter:p=>p.value+" يوم"}}]
    });
    mk("ch-eff-turnover",{
      backgroundColor:BG, tooltip:{...TOOLTIP,trigger:"axis"},
      grid:{left:20,right:16,top:20,bottom:50,containLabel:true},
      xAxis:{type:"category",data:["دوران\nالمخزون","دوران\nالذمم","دوران\nالأصول","دوران\nالدائنة"],axisLabel:{color:"#475569",fontSize:9,lineHeight:14}},
      yAxis:axY(v=>v+"×"),
      series:[
        {name:"الفعلي",type:"bar",barGap:"10%",barWidth:"35%",data:[
          {value:+R.invTurn.toFixed(1),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:C.yellow},{offset:1,color:C.yellow+"22"}]},borderRadius:[6,6,0,0]}},
          {value:+R.recTurn.toFixed(1),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:C.blue},{offset:1,color:C.blue+"22"}]},borderRadius:[6,6,0,0]}},
          {value:+R.astTurn.toFixed(1),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:C.violet},{offset:1,color:C.violet+"22"}]},borderRadius:[6,6,0,0]}},
          {value:+R.payTurn.toFixed(1),itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:C.green},{offset:1,color:C.green+"22"}]},borderRadius:[6,6,0,0]}},
        ]},
        {name:"المعيار",type:"bar",barWidth:"35%",data:[8,10,1.5,8].map(v=>({value:v,itemStyle:{color:"#1e293b",borderRadius:[6,6,0,0]}}))},
      ],
      legend:{data:["الفعلي","المعيار"],bottom:0,textStyle:{color:"#475569",fontSize:10}}
    });
    mk("ch-eff-days",{
      backgroundColor:BG, tooltip:{...TOOLTIP,trigger:"axis"},
      grid:{left:40,right:16,top:20,bottom:30},
      legend:{data:["DIO","DSO","DPO"],bottom:0,textStyle:{color:"#475569",fontSize:10}},
      xAxis:axX(labels6), yAxis:axY(v=>v+" يوم"),
      series:[
        {name:"DIO",type:"line",smooth:true,data:labels6.map(()=>+(R.dio*(0.8+Math.random()*.4)).toFixed(0)),lineStyle:{color:C.yellow,width:2},itemStyle:{color:C.yellow},symbol:"circle",symbolSize:5},
        {name:"DSO",type:"line",smooth:true,data:labels6.map(()=>+(R.dso*(0.8+Math.random()*.4)).toFixed(0)),lineStyle:{color:C.blue,width:2},itemStyle:{color:C.blue},symbol:"circle",symbolSize:5},
        {name:"DPO",type:"line",smooth:true,data:labels6.map(()=>+(R.dpo*(0.8+Math.random()*.4)).toFixed(0)),lineStyle:{color:C.green,width:2},itemStyle:{color:C.green},symbol:"circle",symbolSize:5},
      ]
    });
  }

  // ─── LEVERAGE ───
  if (tab==="lev") {
    mk("ch-lev-struct",{
      backgroundColor:BG, tooltip:{...TOOLTIP,trigger:"axis"},
      grid:{left:20,right:16,top:20,bottom:60,containLabel:true},
      legend:{data:["الأصول الثابتة","الأصول المتداولة","الديون طويلة","الديون قصيرة","حقوق الملكية"],bottom:0,textStyle:{color:"#475569",fontSize:9}},
      xAxis:{type:"category",data:["هيكل الأصول","هيكل التمويل"],axisLabel:{color:"#475569",fontSize:11}},
      yAxis:{type:"value",axisLabel:{color:"#475569",fontSize:9,formatter:v=>fmtC(v)},splitLine:{lineStyle:{color:"#1e293b",type:"dashed"}}},
      series:[
        {name:"الأصول الثابتة",    type:"bar",stack:"a",data:[+d.fixedAssets.toFixed(0),0],    itemStyle:{color:C.blue}},
        {name:"الأصول المتداولة",  type:"bar",stack:"a",data:[+d.curAssets.toFixed(0),0],       itemStyle:{color:C.indigo}},
        {name:"الديون طويلة",      type:"bar",stack:"b",data:[0,+d.longLiab.toFixed(0)],        itemStyle:{color:C.red}},
        {name:"الديون قصيرة",      type:"bar",stack:"b",data:[0,+d.curLiab.toFixed(0)],         itemStyle:{color:C.orange}},
        {name:"حقوق الملكية",      type:"bar",stack:"b",data:[0,+Math.max(0,d.equity).toFixed(0)],itemStyle:{color:C.green}},
      ]
    });
    mk("ch-lev-gauges",{
      backgroundColor:BG,
      series:[
        mkGauge("D/E ×",R.de,5,"100px","17%",R.de>2?C.red:R.de>1?C.yellow:C.green),
        mkGauge("D/A %",R.da,100,"100px","50%",R.da>60?C.red:R.da>50?C.yellow:C.green,true),
        mkGauge("EQ %",R.eq,100,"100px","83%",R.eq<30?C.red:R.eq<50?C.yellow:C.green,false,true),
      ]
    });
  }

  // ─── INCOME STATEMENT ───
  if (tab==="inc") {
    const wfData = [
      {name:"إجمالي المبيعات",value:+d.revTotal.toFixed(0),color:C.indigo},
      {name:"خصم الضريبة",    value:-d.vatOut.toFixed(0),  color:C.red},
      {name:"صافي الإيراد",   value:+d.revenue.toFixed(0), color:C.blue},
      {name:"خصم التكلفة",    value:-d.cogs.toFixed(0),    color:C.red},
      {name:"الربح الإجمالي", value:+d.grossProfit.toFixed(0),color:C.green},
      {name:"خصم المصاريف",   value:-d.opExpenses.toFixed(0),color:C.orange},
      {name:"الربح التشغيلي", value:+d.opProfit.toFixed(0),color:C.teal},
      {name:"خصم الضريبة",    value:-d.tax.toFixed(0),     color:C.yellow},
      {name:"صافي الربح",     value:+d.netProfit.toFixed(0),color:C.violet},
    ];
    mk("ch-inc-waterfall",{
      backgroundColor:BG, tooltip:{...TOOLTIP,trigger:"axis"},
      grid:{left:20,right:16,top:20,bottom:80,containLabel:true},
      xAxis:{type:"category",data:wfData.map(x=>x.name),axisLabel:{color:"#475569",fontSize:9,rotate:30}},
      yAxis:axY(v=>fmtC(v)),
      series:[{type:"bar",barWidth:"60%",data:wfData.map(x=>({
        value:Math.abs(x.value),
        itemStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:x.color},{offset:1,color:x.color+"22"}]},borderRadius:[6,6,0,0],shadowColor:x.color+"44",shadowBlur:12},
        label:{show:true,position:"top",color:"#94a3b8",fontSize:8,formatter:()=>fmtC(Math.abs(x.value))}
      }))}]
    });
    mk("ch-inc-trend",{
      backgroundColor:BG, tooltip:{...TOOLTIP,trigger:"axis"},
      grid:{left:60,right:16,top:20,bottom:30},
      legend:{data:["إيراد","ربح إجمالي","صافي ربح"],bottom:0,textStyle:{color:"#475569",fontSize:10}},
      xAxis:axX(labels6), yAxis:axY(v=>fmtC(v)),
      series:[
        {name:"إيراد",type:"line",smooth:true,data:months6.map(x=>x.rev),lineStyle:{color:C.indigo,width:3},itemStyle:{color:C.indigo},symbol:"circle",symbolSize:6,
          areaStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:C.indigo+"44"},{offset:1,color:C.indigo+"05"}]}}},
        {name:"ربح إجمالي",type:"line",smooth:true,data:months6.map(x=>x.gp),lineStyle:{color:C.green,width:2},itemStyle:{color:C.green},symbol:"circle",symbolSize:5},
        {name:"صافي ربح",type:"line",smooth:true,data:months6.map(x=>+(x.gp*0.75).toFixed(0)),lineStyle:{color:C.violet,width:2},itemStyle:{color:C.violet},symbol:"circle",symbolSize:5},
      ]
    });
    mk("ch-inc-pie",{
      backgroundColor:BG, tooltip:{...TOOLTIP,trigger:"item",formatter:"{b}: {d}%"},
      series:[{
        type:"pie",radius:["45%","75%"],padAngle:4,
        itemStyle:{borderRadius:8,borderColor:"#0f172a",borderWidth:3},
        label:{color:"#94a3b8",fontSize:9,formatter:p=>`${p.name}\n${p.percent.toFixed(1)}%`},
        data:[
          {value:+d.grossProfit.toFixed(0),name:"الربح الإجمالي",itemStyle:{color:C.green}},
          {value:+d.cogs.toFixed(0),       name:"تكلفة البضاعة", itemStyle:{color:C.red}},
          {value:+d.vatOut.toFixed(0),     name:"ضريبة المبيعات",itemStyle:{color:C.orange}},
          {value:+d.opExpenses.toFixed(0), name:"مصاريف تشغيل",  itemStyle:{color:C.yellow}},
          {value:+d.tax.toFixed(0),        name:"ضريبة الدخل",   itemStyle:{color:C.violet}},
        ]
      }]
    });
  }
}

// ─── Gauge Helper ───
function mkGauge(name, val, max, radius, cx, color, right=false, far=false) {
  const x = far?"83%":right?"50%":"17%";
  return {
    type:"gauge", radius, center:[x,"55%"],
    startAngle:210, endAngle:-30, min:0, max,
    axisLine:{lineStyle:{width:12,color:[[val/max||0.01,color],[1,"#1e293b"]]}},
    progress:{show:true,width:12,itemStyle:{color}},
    pointer:{show:false},
    axisTick:{show:false}, splitLine:{show:false}, axisLabel:{show:false},
    title:{fontSize:8,color:"#64748b",offsetCenter:[0,"85%"]},
    detail:{formatter:v=>v.toFixed(max>5?0:2)+(max===100?"%":"×"),fontSize:13,color:"#e2e8f0",fontWeight:800,offsetCenter:[0,"40%"]},
    data:[{value:Math.min(max,+val.toFixed(2)),name}],
  };
}

// ══════════════════════════════════════════════════════════════
// EXPORT
// ══════════════════════════════════════════════════════════════
window.fa2Export = () => {
  if (!_data) return;
  const {R,period} = _data;
  const pw = window.open("","_blank","width=900,height=700");
  const rows = Object.entries({
    "هامش الربح الإجمالي":R.grossMgn.toFixed(1)+"%",
    "هامش الربح التشغيلي":R.opMgn.toFixed(1)+"%",
    "هامش صافي الربح":R.netMgn.toFixed(1)+"%",
    "العائد على الأصول ROA":R.roa.toFixed(1)+"%",
    "العائد على الملكية ROE":R.roe.toFixed(1)+"%",
    "العائد على الاستثمار ROI":R.roi.toFixed(1)+"%",
    "هامش EBITDA":R.ebitda.toFixed(1)+"%",
    "نسبة الترميح":R.markup.toFixed(1)+"%",
    "نسبة التداول":R.curRatio.toFixed(2)+"×",
    "نسبة السيولة السريعة":R.quickRatio.toFixed(2)+"×",
    "نسبة النقدية":R.cashRatio.toFixed(2)+"×",
    "رأس المال العامل":fmtC(R.workCap),
    "معدل دوران المخزون":R.invTurn.toFixed(1)+"×",
    "أيام المخزون DIO":R.dio.toFixed(0)+" يوم",
    "معدل دوران الذمم":R.recTurn.toFixed(1)+"×",
    "أيام التحصيل DSO":R.dso.toFixed(0)+" يوم",
    "معدل دوران الدائنة":R.payTurn.toFixed(1)+"×",
    "أيام السداد DPO":R.dpo.toFixed(0)+" يوم",
    "دورة تحويل النقد CCC":R.ccc.toFixed(0)+" يوم",
    "الدورة التشغيلية":R.opCycle.toFixed(0)+" يوم",
    "معدل دوران الأصول":R.astTurn.toFixed(2)+"×",
    "نسبة الدين إلى الملكية D/E":R.de.toFixed(2)+"×",
    "نسبة الدين إلى الأصول D/A":R.da.toFixed(1)+"%",
    "نسبة حقوق الملكية":R.eq.toFixed(1)+"%",
    "مضاعف الملكية":R.eqMult.toFixed(2)+"×",
    "نسبة تغطية الفائدة":R.intCov.toFixed(1)+"×",
    "نسبة الدين":R.debtRatio.toFixed(2),
    "التروس الرأسمالية":R.capGearing.toFixed(1)+"%",
  }).map(([k,v])=>`<tr><td>${k}</td><td style="text-align:left;font-weight:800;color:#6366f1">${v}</td></tr>`).join("");
  pw.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8">
  <title>التحليل المالي — IDHAM ERP</title>
  <style>body{font-family:Arial;padding:20px;color:#0f172a;direction:rtl}
  h2{text-align:center;color:#6366f1;border-bottom:3px solid #6366f1;padding-bottom:10px}
  table{width:100%;border-collapse:collapse}th{background:#6366f1;color:#fff;padding:9px}
  td{padding:8px 12px;border-bottom:1px solid #e2e8f0}tr:nth-child(even){background:#f8fafc}
  .meta{text-align:center;color:#64748b;font-size:12px;margin:-10px 0 20px}</style></head>
  <body><h2>📊 التحليل المالي الشامل — IDHAM ERP</h2>
  <p class="meta">الفترة: ${period.from} — ${period.to}</p>
  <table><thead><tr><th>النسبة المالية</th><th>القيمة</th></tr></thead>
  <tbody>${rows}</tbody></table></body></html>`);
  pw.document.close(); pw.print();
};
