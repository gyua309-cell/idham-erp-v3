// ============================================================
// IDHAM ERP — Inventory Intelligence Dashboard v2.0
// لوحة الذكاء التشغيلي وتحليلات المخزون — شاملة وتفاعلية
// ============================================================
import { COLS, getAll, query, orderBy, limit, getDocs, clearERPCache } from "../utils/db.js";
import { formatCurrency, formatQuantity, formatPercent } from "../utils/formatters.js";
import { COMPANY_ID } from "../firebase-config.js";

let _products = [], _categories = [], _warehouses = [], _stockBalances = [];
let _stockTxs = [], _salesInvoices = [], _charts = {}, _alive = false;

export async function render(container, user) {
  _alive = true;
  _destroyCharts();
  container.innerHTML = buildShell();
  injectDashboardStyles();
  try {
    await loadAllData();
    if (!_alive) return;
    renderDashboard();
  } catch (err) {
    console.error("[InventoryDash]", err);
    if (!_alive) return;
    const sk   = document.getElementById("dash-skeleton");
    const main = document.getElementById("dash-main");
    if (sk)   sk.style.display   = "none";
    if (main) { main.style.display = "block"; main.innerHTML = `<div class="alert bad" style="margin:24px"><strong>خطأ في تحميل البيانات:</strong> ${err.message}</div>`; }
  }
}

const _q  = (s, c = document) => c.querySelector(s);
const _qq = (s, c = document) => [...c.querySelectorAll(s)];

function _destroyCharts() {
  Object.values(_charts).forEach(ch => { try { ch.destroy(); } catch(_){} });
  _charts = {};
}

// ── Styles ──────────────────────────────────────────────────
function injectDashboardStyles() {
  if (document.getElementById("inv-dash-styles")) return;
  const s = document.createElement("style");
  s.id = "inv-dash-styles";
  s.textContent = `
    .idash-kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px}
    @media(max-width:1100px){.idash-kpi-row{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:600px){.idash-kpi-row{grid-template-columns:1fr}}
    .idash-kpi{border-radius:14px;padding:20px 22px;position:relative;overflow:hidden;display:flex;align-items:center;gap:16px;box-shadow:0 4px 20px rgba(0,0,0,.18);transition:transform .15s,box-shadow .15s;cursor:default}
    .idash-kpi:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,.28)}
    .idash-kpi::before{content:'';position:absolute;inset:0;opacity:.12;background:radial-gradient(ellipse at 80% -20%,#fff 0%,transparent 60%);pointer-events:none}
    .idash-kpi-icon{width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;background:rgba(255,255,255,.18)}
    .idash-kpi-body{flex:1;min-width:0}
    .idash-kpi-label{font-size:12px;font-weight:600;opacity:.85;margin-bottom:4px;color:#fff}
    .idash-kpi-value{font-size:22px;font-weight:800;font-variant-numeric:tabular-nums;color:#fff;line-height:1.1;word-break:break-all}
    .idash-kpi-sub{font-size:11px;opacity:.7;color:#fff;margin-top:3px}
    .idash-kpi.blue{background:linear-gradient(135deg,#1a73e8,#0052cc)}
    .idash-kpi.teal{background:linear-gradient(135deg,#00897b,#005c52)}
    .idash-kpi.green{background:linear-gradient(135deg,#2e7d32,#1b5e20)}
    .idash-kpi.purple{background:linear-gradient(135deg,#6a1b9a,#4a148c)}
    .idash-alert-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
    @media(max-width:1100px){.idash-alert-row{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:600px){.idash-alert-row{grid-template-columns:1fr}}
    .idash-alert-card{border-radius:12px;padding:16px 18px;display:flex;align-items:center;gap:14px;border:1.5px solid transparent;background:var(--bg-2);transition:transform .15s}
    .idash-alert-card:hover{transform:translateY(-2px)}
    .idash-alert-card .ac-icon{font-size:28px;flex-shrink:0}
    .idash-alert-card .ac-body{flex:1}
    .idash-alert-card .ac-count{font-size:26px;font-weight:800;line-height:1}
    .idash-alert-card .ac-label{font-size:11px;color:var(--text-2);margin-top:2px}
    .idash-alert-card.red{border-color:#e53935}.idash-alert-card.red .ac-count{color:#e53935}
    .idash-alert-card.orange{border-color:#fb8c00}.idash-alert-card.orange .ac-count{color:#fb8c00}
    .idash-alert-card.darkred{border-color:#b71c1c}.idash-alert-card.darkred .ac-count{color:#b71c1c}
    .idash-alert-card.gray{border-color:#757575}.idash-alert-card.gray .ac-count{color:#9e9e9e}
    .idash-charts-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
    @media(max-width:900px){.idash-charts-grid{grid-template-columns:1fr}}
    .idash-chart-card{background:var(--bg-2);border:1px solid var(--border-soft);border-radius:14px;padding:20px}
    .idash-chart-title{font-size:14px;font-weight:700;color:var(--text-1);margin-bottom:14px;display:flex;align-items:center;gap:8px}
    .idash-chart-wrap{position:relative;height:240px}
    .idash-section-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;margin-top:24px}
    .idash-section-hdr h3{font-size:15px;font-weight:700;color:var(--text-1);display:flex;align-items:center;gap:8px;margin:0}
    .idash-tbl-wrap{background:var(--bg-2);border:1px solid var(--border-soft);border-radius:12px;overflow:hidden;margin-bottom:4px}
    .idash-tbl-wrap .table-container{max-height:320px;overflow-y:auto}
    .abc-a{background:#1565c0;color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}
    .abc-b{background:#2e7d32;color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}
    .abc-c{background:#616161;color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}
    .xyz-x{background:#00695c;color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}
    .xyz-y{background:#e65100;color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}
    .xyz-z{background:#b71c1c;color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}
    .exp-urgent{background:#b71c1c;color:#fff;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700}
    .exp-warn{background:#e65100;color:#fff;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700}
    .exp-ok{background:#1b5e20;color:#fff;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700}
    @keyframes skeleton-shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
    .sk-block{border-radius:8px;background:linear-gradient(90deg,var(--bg-2) 25%,var(--bg-3) 50%,var(--bg-2) 75%);background-size:600px 100%;animation:skeleton-shimmer 1.4s infinite linear}
    .sk-kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px}
    .sk-kpi{height:96px;border-radius:14px}
    .sk-alert-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
    .sk-alert{height:72px;border-radius:12px}
    .sk-chart-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
    .sk-chart{height:280px;border-radius:14px}
    .sk-table{height:220px;border-radius:12px;margin-bottom:20px}
    @media(max-width:1100px){.sk-kpi-row,.sk-alert-row{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:900px){.sk-chart-row{grid-template-columns:1fr}}
    @media(max-width:600px){.sk-kpi-row,.sk-alert-row{grid-template-columns:1fr}}
    .idash-2col{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    @media(max-width:900px){.idash-2col{grid-template-columns:1fr}}
    .progress-bar-wrap{background:var(--bg-3);border-radius:4px;height:6px;min-width:60px}
    .progress-bar-fill{height:100%;border-radius:4px;transition:width .5s ease}
  `;
  document.head.appendChild(s);
}

// ── Shell ─────────────────────────────────────────────────────
function buildShell() {
  return `<div class="page-content" style="padding:20px 24px" dir="rtl">
    <div class="page-header" style="margin-bottom:20px">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
        <div>
          <h1 class="page-title" style="margin:0">📦 لوحة ذكاء المخزون</h1>
          <p class="page-subtitle" style="margin:4px 0 0;color:var(--text-2);font-size:13px">تحليلات ABC/XYZ · مؤشرات الدوران · الرواكد · تواريخ الانتهاء</p>
        </div>
        <button class="btn btn-secondary" id="idash-refresh-btn" style="gap:6px;display:flex;align-items:center">🔄 تحديث البيانات</button>
      </div>
    </div>
    <div id="dash-skeleton">
      <div class="sk-kpi-row"><div class="sk-block sk-kpi"></div><div class="sk-block sk-kpi"></div><div class="sk-block sk-kpi"></div><div class="sk-block sk-kpi"></div></div>
      <div class="sk-alert-row"><div class="sk-block sk-alert"></div><div class="sk-block sk-alert"></div><div class="sk-block sk-alert"></div><div class="sk-block sk-alert"></div></div>
      <div class="sk-chart-row"><div class="sk-block sk-chart"></div><div class="sk-block sk-chart"></div></div>
      <div class="sk-chart-row"><div class="sk-block sk-chart"></div><div class="sk-block sk-chart"></div></div>
      <div class="sk-block sk-table"></div><div class="sk-block sk-table"></div>
    </div>
    <div id="dash-main" style="display:none"></div>
  </div>`;
}

// ── Data ──────────────────────────────────────────────────────
async function loadAllData() {
  const [products, categories, warehouses, stockBalances] = await Promise.all([
    getAll(COLS.products()), getAll(COLS.categories()),
    getAll(COLS.warehouses()), getAll(COLS.stockByWarehouse()),
  ]);
  _products = products; _categories = categories;
  _warehouses = warehouses; _stockBalances = stockBalances;
  const txSnap = await getDocs(query(COLS.stockTransactions(), orderBy("createdAt","desc"), limit(500)));
  _stockTxs = txSnap.docs.map(d => ({id:d.id,...d.data()}));
  const siSnap = await getDocs(query(COLS.salesInvoices(), orderBy("createdAt","desc"), limit(300)));
  _salesInvoices = siSnap.docs.map(d => ({id:d.id,...d.data()}));
}

// ── Render ─────────────────────────────────────────────────────
function renderDashboard() {
  const skeleton = document.getElementById("dash-skeleton");
  const main     = document.getElementById("dash-main");
  if (!skeleton || !main) return;

  const sm  = buildStockMap();
  const kpi = computeKPIs(sm);
  const alr = computeAlerts(sm);
  const abc = computeABC(sm, kpi.totalCostValue);
  const xyz = computeXYZ();
  const nex = computeNearExpiry(sm);
  const slw = computeSlowMovers(sm);
  const top = computeTopMovers();
  const cat = computeCategoryDistribution(sm);
  const wch = computeWarehouseComparison();
  const mth = computeMonthlyTurnover();

  main.innerHTML =
    kpiRow(kpi) + alertRow(alr) + chartsSection() +
    abcSection(abc) + xyzSection(xyz) +
    `<div class="idash-2col">${slowSection(slw)}${expirySection(nex)}</div>` +
    topSection(top);

  skeleton.style.display = "none";
  main.style.display = "block";

  requestAnimationFrame(() => {
    renderDoughnut(cat);
    renderBarTopMovers(top);
    renderLineTurnover(mth);
    renderBarWarehouse(wch);
  });

  document.getElementById("idash-refresh-btn")?.addEventListener("click", async () => {
    const btn = document.getElementById("idash-refresh-btn");
    if (btn) { btn.disabled = true; btn.textContent = "⏳ جاري التحديث..."; }
    skeleton.style.display = "block"; main.style.display = "none";
    _destroyCharts();
    try {
      clearERPCache();
      await loadAllData(); if (_alive) renderDashboard();
    } catch(err) {
      window.showToast?.("فشل التحديث: " + err.message, "error");
      skeleton.style.display = "none"; main.style.display = "block";
      if (btn) { btn.disabled = false; btn.textContent = "🔄 تحديث البيانات"; }
    }
  });
  _qq("[data-csv-export]").forEach(b => b.addEventListener("click", () => exportCSV(b.dataset.csvExport)));
}

// ── Computations ───────────────────────────────────────────────
function buildStockMap() {
  const m = {};
  _stockBalances.forEach(s => {
    if (!m[s.productId]) m[s.productId] = {total:0,wh:{}};
    m[s.productId].total += s.qty||0;
    m[s.productId].wh[s.warehouseId] = (m[s.productId].wh[s.warehouseId]||0) + (s.qty||0);
  });
  return m;
}

function computeKPIs(sm) {
  let cv=0, sv=0, qty=0;
  _products.forEach(p => {
    const q = sm[p.id]?.total||0;
    cv += q*(p.costPrice||p.averageCost||p.purchasePrice||0);
    sv += q*(p.sellingPrice||p.salePrice||p.priceRetail||p.price||0);
    qty += q;
  });
  return { totalCostValue:cv, totalSaleValue:sv, totalQty:qty,
    expectedProfitPct: cv>0?((sv-cv)/cv)*100:0,
    expectedProfitAbs: sv-cv };
}

function computeAlerts(sm) {
  const today=new Date(); today.setHours(0,0,0,0);
  const in30=new Date(today); in30.setDate(today.getDate()+30);
  const ago90=new Date(today); ago90.setDate(today.getDate()-90);
  let low=0, near=0, exp=0, dor=0;
  _products.forEach(p => { const q=sm[p.id]?.total||0; if(q>0&&p.reorderLevel&&q<=p.reorderLevel) low++; });
  const seen=new Set();
  _stockTxs.forEach(t => {
    if(!t.expiryDate||!t.batchNumber||seen.has(t.batchNumber)) return;
    seen.add(t.batchNumber);
    const d=new Date(t.expiryDate); if(isNaN(d)) return;
    const q=sm[t.productId]?.total||0; if(q<=0) return;
    if(d<today) exp++; else if(d<=in30) near++;
  });
  const active=new Set();
  _stockTxs.forEach(t => {
    if(!t.createdAt) return;
    const d=t.createdAt?.toDate?t.createdAt.toDate():new Date(t.createdAt);
    if(d>=ago90) active.add(t.productId);
  });
  _products.forEach(p => { const q=sm[p.id]?.total||0; if(q>0&&!active.has(p.id)) dor++; });
  return {lowStock:low, nearExpiry:near, expired:exp, dormant:dor};
}

function computeABC(sm, total) {
  const items = _products.map(p => {
    const q=sm[p.id]?.total||0, c=p.costPrice||p.averageCost||0;
    return { id:p.id, sku:p.sku||"—", name:p.name||"—", qty:q, value:q*c, cost:c,
             catName:_categories.find(x=>x.id===p.categoryId)?.name||"—" };
  }).sort((a,b)=>b.value-a.value);
  let cum=0;
  return items.map(it => {
    cum += it.value;
    const pct = total>0?(cum/total)*100:0;
    return {...it, cls: pct<=80?"A": pct<=95?"B":"C"};
  });
}

function computeXYZ() {
  const mq = {};
  _stockTxs.forEach(t => {
    if(!t.productId||!t.createdAt) return;
    if(t.type!=="sale_out"&&t.type!=="sales_out") return;
    const d=t.createdAt?.toDate?t.createdAt.toDate():new Date(t.createdAt);
    if(isNaN(d)) return;
    const k=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
    if(!mq[t.productId]) mq[t.productId]={};
    mq[t.productId][k]=(mq[t.productId][k]||0)+Math.abs(t.qtyChange||0);
  });
  _salesInvoices.forEach(inv => {
    if(!inv.createdAt) return;
    const d=inv.createdAt?.toDate?inv.createdAt.toDate():new Date(inv.createdAt);
    if(isNaN(d)) return;
    const k=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
    (inv.lines||[]).forEach(l => {
      if(!l.productId) return;
      if(!mq[l.productId]) mq[l.productId]={};
      mq[l.productId][k]=(mq[l.productId][k]||0)+(l.qty||0);
    });
  });
  return _products.map(p => {
    const vals=Object.values(mq[p.id]||{}), n=vals.length;
    if(n<2) return {id:p.id,sku:p.sku||"—",name:p.name||"—",cv:null,cls:n===0?"Z":"Y",avg:vals[0]||0,months:n};
    const mean=vals.reduce((s,v)=>s+v,0)/n;
    const std=Math.sqrt(vals.reduce((s,v)=>s+(v-mean)**2,0)/n);
    const cv=mean>0?(std/mean)*100:999;
    return {id:p.id,sku:p.sku||"—",name:p.name||"—",cv,cls:cv<=50?"X":cv<=100?"Y":"Z",avg:mean,months:n};
  }).sort((a,b)=>(a.cv??999)-(b.cv??999));
}

function computeNearExpiry(sm) {
  const today=new Date(); today.setHours(0,0,0,0);
  const in30=new Date(today); in30.setDate(today.getDate()+30);
  const seen=new Set(), res=[];
  _stockTxs.forEach(t => {
    if(!t.expiryDate||!t.batchNumber) return;
    const key=t.productId+"_"+t.batchNumber;
    if(seen.has(key)) return; seen.add(key);
    const exp=new Date(t.expiryDate);
    if(isNaN(exp)||exp<today||exp>in30) return;
    const q=sm[t.productId]?.total||0; if(q<=0) return;
    const p=_products.find(x=>x.id===t.productId);
    res.push({sku:p?.sku||t.sku||"—",name:p?.name||t.productName||"—",
              batch:t.batchNumber,expiryDate:t.expiryDate,
              daysLeft:Math.ceil((exp-today)/86400000),qty:q,productId:t.productId});
  });
  return res.sort((a,b)=>a.daysLeft-b.daysLeft);
}

function computeSlowMovers(sm) {
  const ago90=new Date(); ago90.setDate(ago90.getDate()-90); ago90.setHours(0,0,0,0);
  const last={};
  _stockTxs.forEach(t => {
    if(!t.productId||!t.createdAt) return;
    const d=t.createdAt?.toDate?t.createdAt.toDate():new Date(t.createdAt);
    if(isNaN(d)) return;
    if(!last[t.productId]||d>last[t.productId]) last[t.productId]=d;
  });
  return _products.filter(p => {
    const q=sm[p.id]?.total||0; if(q<=0) return false;
    const l=last[p.id]; return !l||l<ago90;
  }).map(p => {
    const q=sm[p.id]?.total||0, l=last[p.id];
    const c=p.costPrice||p.averageCost||0;
    return {id:p.id,sku:p.sku||"—",name:p.name||"—",qty:q,cost:c,value:q*c,
            daysSince:l?Math.floor((Date.now()-l.getTime())/86400000):null};
  }).sort((a,b)=>(b.daysSince??9999)-(a.daysSince??9999));
}

function computeTopMovers() {
  const sq={};
  _salesInvoices.forEach(inv => (inv.lines||[]).forEach(l => {
    if(!l.productId) return; sq[l.productId]=(sq[l.productId]||0)+(l.qty||0);
  }));
  _stockTxs.forEach(t => {
    if(t.type!=="sale_out"&&t.type!=="sales_out"||!t.productId) return;
    sq[t.productId]=(sq[t.productId]||0)+Math.abs(t.qtyChange||0);
  });
  return _products.filter(p=>sq[p.id]>0).map(p => ({
    id:p.id,sku:p.sku||"—",name:p.name||"—",qtySold:sq[p.id]||0,
    revenue:(sq[p.id]||0)*(p.salePrice||0),
    cost:(sq[p.id]||0)*(p.costPrice||p.averageCost||0),
  })).sort((a,b)=>b.qtySold-a.qtySold).slice(0,20);
}

function computeCategoryDistribution(sm) {
  const cv={};
  _products.forEach(p => {
    const q=sm[p.id]?.total||0,c=p.costPrice||p.averageCost||0;
    const cat=_categories.find(x=>x.id===p.categoryId)?.name||"غير مصنف";
    cv[cat]=(cv[cat]||0)+q*c;
  });
  const e=Object.entries(cv).sort((a,b)=>b[1]-a[1]);
  return {labels:e.map(x=>x[0]),data:e.map(x=>x[1])};
}

function computeWarehouseComparison() {
  const wh={};
  _warehouses.forEach(w => { wh[w.id]={name:w.name||w.id,value:0,qty:0}; });
  _stockBalances.forEach(sb => {
    if(!wh[sb.warehouseId]) wh[sb.warehouseId]={name:sb.warehouseId,value:0,qty:0};
    const p=_products.find(x=>x.id===sb.productId), c=p?(p.costPrice||p.averageCost||0):0;
    wh[sb.warehouseId].value+=(sb.qty||0)*c;
    wh[sb.warehouseId].qty+=sb.qty||0;
  });
  const e=Object.values(wh).filter(x=>x.value>0);
  return {labels:e.map(x=>x.name),values:e.map(x=>x.value)};
}

function computeMonthlyTurnover() {
  const now=new Date(), months=[];
  for(let i=5;i>=0;i--) {
    const d=new Date(now.getFullYear(),now.getMonth()-i,1);
    months.push({key:d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0"),
      label:d.toLocaleDateString("ar-SA",{month:"short",year:"2-digit"}),out:0,in:0});
  }
  const ki=Object.fromEntries(months.map((m,i)=>[m.key,i]));
  _stockTxs.forEach(t => {
    if(!t.createdAt) return;
    const d=t.createdAt?.toDate?t.createdAt.toDate():new Date(t.createdAt);
    if(isNaN(d)) return;
    const k=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
    const idx=ki[k]; if(idx===undefined) return;
    const q=Math.abs(t.qtyChange||0);
    if((t.qtyChange||0)<0) months[idx].out+=q; else months[idx].in+=q;
  });
  return months;
}

// ── HTML ──────────────────────────────────────────────────────
const eRow = (c,m) => `<tr><td colspan="${c}" style="text-align:center;color:var(--text-2);padding:24px">${m}</td></tr>`;
const sHdr = (t,k) => `<div class="idash-section-hdr"><h3>${t}</h3><button class="btn btn-secondary" style="font-size:11px;padding:5px 12px" data-csv-export="${k}">⬇ تصدير CSV</button></div>`;

function kpiRow(kpi) {
  const card = (cls,ico,lbl,val,sub) =>
    `<div class="idash-kpi ${cls}"><div class="idash-kpi-icon">${ico}</div><div class="idash-kpi-body"><div class="idash-kpi-label">${lbl}</div><div class="idash-kpi-value">${val}</div><div class="idash-kpi-sub">${sub}</div></div></div>`;
  return `<div class="idash-kpi-row">
    ${card("blue","💰","إجمالي قيمة المخزون (سعر البيع)",formatCurrency(kpi.totalSaleValue,true),"القيمة بأسعار البيع الحالية")}
    ${card("teal","🏷️","إجمالي تكلفة المخزون",formatCurrency(kpi.totalCostValue,true),"إجمالي رأس المال المُستثمر في المخزون")}
    ${card("green","📈","الأرباح المتوقعة من المخزون",formatPercent(kpi.expectedProfitPct),formatCurrency(kpi.expectedProfitAbs,true)+" هامش ربح صافٍ")}
    ${card("purple","📦","عدد الأصناف الإجمالي",_products.length.toLocaleString("ar-SA"),"إجمالي الكميات: "+formatQuantity(kpi.totalQty)+" وحدة")}
  </div>`;
}

function alertRow(alr) {
  const card = (cls,ico,cnt,lbl) =>
    `<div class="idash-alert-card ${cls}"><div class="ac-icon">${ico}</div><div class="ac-body"><div class="ac-count">${cnt}</div><div class="ac-label">${lbl}</div></div></div>`;
  return `<div class="idash-alert-row">
    ${card("red","🔴",alr.lowStock,"أصناف أقل من حد إعادة الطلب")}
    ${card("orange","🟠",alr.nearExpiry,"أصناف قريبة الانتهاء (30 يوم)")}
    ${card("darkred","⛔",alr.expired,"أصناف منتهية الصلاحية")}
    ${card("gray","💤",alr.dormant,"أصناف راكدة +90 يوم")}
  </div>`;
}

function chartsSection() {
  const cc = (ico,ttl,id) =>
    `<div class="idash-chart-card"><div class="idash-chart-title">${ico} ${ttl}</div><div class="idash-chart-wrap"><canvas id="${id}"></canvas></div></div>`;
  return `<div class="idash-charts-grid">
    ${cc("🍩","توزيع المخزون حسب الفئة","chart-category")}
    ${cc("🏆","أعلى 10 أصناف مبيعًا (بالكمية)","chart-top-movers")}
    ${cc("📊","معدل دوران المخزون الشهري","chart-turnover")}
    ${cc("🏭","مقارنة قيمة المخازن","chart-warehouse")}
  </div>`;
}

function abcSection(items) {
  const A=items.filter(i=>i.cls==="A"),B=items.filter(i=>i.cls==="B"),C=items.filter(i=>i.cls==="C");
  const tot=items.reduce((s,i)=>s+i.value,0);
  const sm=`<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px">
    <span class="abc-a">A — ${A.length} صنف · ${formatCurrency(A.reduce((s,i)=>s+i.value,0),true)}</span>
    <span class="abc-b">B — ${B.length} صنف · ${formatCurrency(B.reduce((s,i)=>s+i.value,0),true)}</span>
    <span class="abc-c">C — ${C.length} صنف · ${formatCurrency(C.reduce((s,i)=>s+i.value,0),true)}</span>
  </div>`;
  const rows=items.slice(0,100).map(it => {
    const pct=tot>0?(it.value/tot)*100:0, bc=it.cls==="A"?"#1565c0":it.cls==="B"?"#2e7d32":"#616161";
    return `<tr>
      <td class="mono" style="font-size:11px;color:var(--text-2)">${it.sku}</td>
      <td><strong>${it.name}</strong><br><span style="font-size:10px;color:var(--text-2)">${it.catName}</span></td>
      <td class="mono">${formatQuantity(it.qty)}</td>
      <td class="mono">${formatCurrency(it.value,true)}</td>
      <td><div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${Math.min(pct*5,100)}%;background:${bc}"></div></div>
          <span style="font-size:10px;color:var(--text-2)">${pct.toFixed(1)}%</span></td>
      <td><span class="abc-${it.cls.toLowerCase()}">${it.cls}</span></td>
    </tr>`;
  }).join("");
  window._dashABCData = items;
  return sHdr("🔬 تحليل ABC — تصنيف الأصناف حسب القيمة المالية","abc") +
    `<p style="font-size:12px;color:var(--text-2);margin-bottom:10px">الفئة A: تشكل 80% من القيمة · B: 80–95% · C: الباقي</p>${sm}
    <div class="idash-tbl-wrap"><div class="table-container"><table class="data-dense">
      <thead><tr><th>الكود</th><th>اسم الصنف</th><th>الكمية</th><th>القيمة</th><th>نسبة القيمة</th><th>التصنيف</th></tr></thead>
      <tbody>${rows||eRow(6,"لا توجد أصناف")}</tbody>
    </table></div></div>`;
}

function xyzSection(items) {
  const X=items.filter(i=>i.cls==="X"),Y=items.filter(i=>i.cls==="Y"),Z=items.filter(i=>i.cls==="Z");
  const sm=`<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px">
    <span class="xyz-x">X — ${X.length} صنف (طلب منتظم)</span>
    <span class="xyz-y">Y — ${Y.length} صنف (طلب متغير)</span>
    <span class="xyz-z">Z — ${Z.length} صنف (طلب غير منتظم)</span>
  </div>`;
  const rows=items.slice(0,80).map(it =>
    `<tr>
      <td class="mono" style="font-size:11px;color:var(--text-2)">${it.sku}</td>
      <td><strong>${it.name}</strong></td>
      <td class="mono">${formatQuantity(it.avg)}</td>
      <td class="mono">${it.cv!==null?it.cv.toFixed(1)+"%":"لا بيانات"}</td>
      <td class="mono" style="font-size:11px;color:var(--text-2)">${it.months} شهر</td>
      <td><span class="xyz-${it.cls.toLowerCase()}">${it.cls}</span></td>
    </tr>`
  ).join("");
  window._dashXYZData = items;
  return sHdr("📐 تحليل XYZ — تصنيف الأصناف حسب انتظام الطلب","xyz") +
    `<p style="font-size:12px;color:var(--text-2);margin-bottom:10px">X: معامل التباين ≤50% · Y: 50–100% · Z: أكثر من 100%</p>${sm}
    <div class="idash-tbl-wrap" style="margin-bottom:20px"><div class="table-container"><table class="data-dense">
      <thead><tr><th>الكود</th><th>اسم الصنف</th><th>متوسط الطلب/شهر</th><th>معامل التباين (CV)</th><th>عدد الأشهر</th><th>التصنيف</th></tr></thead>
      <tbody>${rows||eRow(6,"لا توجد بيانات كافية")}</tbody>
    </table></div></div>`;
}

function slowSection(items) {
  const rows=items.slice(0,50).map(it => {
    const dl=it.daysSince!==null?it.daysSince+" يوم":"لم يتحرك قط";
    const ug=(it.daysSince??999)>180?"color:var(--bad);font-weight:700":"";
    return `<tr>
      <td class="mono" style="font-size:11px;color:var(--text-2)">${it.sku}</td>
      <td><strong>${it.name}</strong></td>
      <td class="mono">${formatQuantity(it.qty)}</td>
      <td class="mono">${formatCurrency(it.value,true)}</td>
      <td class="mono" style="${ug}">${dl}</td>
    </tr>`;
  }).join("");
  window._dashSlowData = items;
  return `<div>${sHdr("💤 الأصناف الراكدة (+90 يوم بدون حركة)","slow")}
    <div class="idash-tbl-wrap"><div class="table-container" style="max-height:260px"><table class="data-dense">
      <thead><tr><th>الكود</th><th>الصنف</th><th>الكمية</th><th>القيمة</th><th>آخر حركة</th></tr></thead>
      <tbody>${rows||eRow(5,"لا توجد أصناف راكدة ✅")}</tbody>
    </table></div></div></div>`;
}

function expirySection(items) {
  const rows=items.map(it => {
    const cn=it.daysLeft<=7?"exp-urgent":it.daysLeft<=15?"exp-warn":"exp-ok";
    return `<tr>
      <td class="mono" style="font-size:11px;color:var(--text-2)">${it.sku}</td>
      <td><strong>${it.name}</strong><br><span style="font-size:10px;color:var(--text-2)">دفعة: ${it.batch}</span></td>
      <td class="mono">${formatQuantity(it.qty)}</td>
      <td class="mono">${it.expiryDate}</td>
      <td><span class="${cn}">${it.daysLeft} يوم</span></td>
    </tr>`;
  }).join("");
  window._dashExpiryData = items;
  return `<div>${sHdr("⚠️ الأصناف قريبة الانتهاء (خلال 30 يوم)","expiry")}
    <div class="idash-tbl-wrap"><div class="table-container" style="max-height:260px"><table class="data-dense">
      <thead><tr><th>الكود</th><th>الصنف / الدفعة</th><th>الكمية</th><th>تاريخ الانتهاء</th><th>المتبقي</th></tr></thead>
      <tbody>${rows||eRow(5,"لا توجد أصناف قريبة الانتهاء ✅")}</tbody>
    </table></div></div></div>`;
}

function topSection(items) {
  const mx=items[0]?.qtySold||1;
  const rows=items.map((it,idx) => {
    const pct=(it.qtySold/mx)*100;
    const md=idx===0?"🥇":idx===1?"🥈":idx===2?"🥉":"#"+(idx+1);
    const pr=it.revenue-it.cost;
    return `<tr>
      <td style="font-size:14px;text-align:center">${md}</td>
      <td class="mono" style="font-size:11px;color:var(--text-2)">${it.sku}</td>
      <td><strong>${it.name}</strong></td>
      <td class="mono">${formatQuantity(it.qtySold)}</td>
      <td class="mono">${formatCurrency(it.revenue,true)}</td>
      <td class="mono" style="color:var(--good)">${formatCurrency(pr,true)}</td>
      <td><div class="progress-bar-wrap" style="min-width:80px"><div class="progress-bar-fill" style="width:${pct}%;background:#1a73e8"></div></div></td>
    </tr>`;
  }).join("");
  window._dashTopData = items;
  return sHdr("🏆 أعلى الأصناف مبيعًا (حسب الكمية)","top") +
    `<div class="idash-tbl-wrap" style="margin-bottom:32px"><div class="table-container"><table class="data-dense">
      <thead><tr><th style="width:40px">#</th><th>الكود</th><th>اسم الصنف</th><th>الكمية المباعة</th><th>الإيراد</th><th>الربح</th><th>النسبة</th></tr></thead>
      <tbody>${rows||eRow(7,"لا توجد بيانات مبيعات")}</tbody>
    </table></div></div>`;
}

// ── Charts ────────────────────────────────────────────────────
const COLORS=["#1a73e8","#00897b","#e65100","#6a1b9a","#c62828","#2e7d32","#0277bd","#ad1457","#37474f","#f57f17","#00695c","#283593"];
const gd = () => {
  const st=getComputedStyle(document.documentElement);
  return {tc:st.getPropertyValue("--text-2").trim()||"#888", gc:st.getPropertyValue("--border-soft").trim()||"#333"};
};

function renderDoughnut(data) {
  const el=document.getElementById("chart-category"); if(!el) return;
  const {tc}=gd();
  const ctx = el.getContext("2d");
  const gradients = data.labels.map((_, i) => window.createVolumetricGradient(ctx, COLORS[i % COLORS.length], 'doughnut'));
  _charts["chart-category"]=new Chart(el,{
    type:"doughnut",
    data:{labels:data.labels,datasets:[{data:data.data,backgroundColor:gradients,borderWidth:2,borderColor:document.body.classList.contains('theme-light') ? '#fff' : 'rgba(0,0,0,0.2)',hoverOffset:10}]},
    options:{responsive:true,maintainAspectRatio:false,animation:{animateRotate:true,duration:900},
      cutout: "68%",
      borderRadius: 4,
      plugins:{legend:{position:"right",rtl:true,labels:{color:document.body.classList.contains('theme-light') ? '#0F172A' : tc,font:{size:11, family: "Tajawal", weight: "600"},boxWidth:12,padding:8}},
        tooltip:{callbacks:{label:ctx=>{const t=data.data.reduce((a,b)=>a+b,0),p=t>0?((ctx.raw/t)*100).toFixed(1):0;return ` ${ctx.label}: ${formatCurrency(ctx.raw,true)} (${p}%)`;}}}}}
  });
}

function renderBarTopMovers(items) {
  const el=document.getElementById("chart-top-movers"); if(!el) return;
  const {tc,gc}=gd(), top10=items.slice(0,10);
  const ctx = el.getContext("2d");
  const gradients = top10.map((_, i) => window.createVolumetricGradient(ctx, COLORS[i % COLORS.length], 'bar'));
  const isLight = document.body.classList.contains('theme-light');
  const borderAxisColor = isLight ? '#0F172A' : '#475569';
  const axisLabelColor = isLight ? '#0F172A' : tc;
  
  _charts["chart-top-movers"]=new Chart(el,{
    type:"bar",
    data:{labels:top10.map(i=>i.name.length>15?i.name.slice(0,15)+"…":i.name),
      datasets:[{label:"الكمية المباعة",data:top10.map(i=>i.qtySold),backgroundColor:gradients,borderRadius:8,borderSkipped:false}]},
    options:{responsive:true,maintainAspectRatio:false,animation:{duration:800},
      plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>` ${formatQuantity(ctx.raw)} وحدة`}}},
      scales:{
        x:{ticks:{color:axisLabelColor,font:{size:10, family: "Tajawal", weight: '600'}},grid:{display:false},border:{color:borderAxisColor}},
        y:{ticks:{color:axisLabelColor,font:{size:10, family: "JetBrains Mono", weight: '600'}},grid:{color:isLight ? 'rgba(15, 23, 42, 0.15)' : gc},beginAtZero:true,border:{color:borderAxisColor}}
      }}
  });
}

function renderLineTurnover(months) {
  const el=document.getElementById("chart-turnover"); if(!el) return;
  const {tc,gc}=gd();
  const ctx = el.getContext("2d");
  const isLight = document.body.classList.contains('theme-light');
  const borderAxisColor = isLight ? '#0F172A' : '#475569';
  const axisLabelColor = isLight ? '#0F172A' : tc;
  
  const gradOut = ctx.createLinearGradient(0, 0, 0, 300);
  gradOut.addColorStop(0, 'rgba(229,57,53,0.4)');
  gradOut.addColorStop(1, 'rgba(229,57,53,0.0)');
  
  const gradIn = ctx.createLinearGradient(0, 0, 0, 300);
  gradIn.addColorStop(0, 'rgba(26,115,232,0.35)');
  gradIn.addColorStop(1, 'rgba(26,115,232,0.0)');

  _charts["chart-turnover"]=new Chart(el,{
    type:"line",
    data:{labels:months.map(m=>m.label),datasets:[
      {label:"الصادر",data:months.map(m=>m.out),borderColor:"#e53935",backgroundColor:gradOut,borderWidth:3,fill:true,tension:0.4,pointRadius:4,pointHoverRadius:7},
      {label:"الوارد",data:months.map(m=>m.in),borderColor:"#1a73e8",backgroundColor:gradIn,borderWidth:3,fill:true,tension:0.4,pointRadius:4,pointHoverRadius:7}
    ]},
    options:{responsive:true,maintainAspectRatio:false,animation:{duration:1000},
      plugins:{legend:{labels:{color:axisLabelColor,font:{size:11, family: "Tajawal", weight: '600'}}},tooltip:{callbacks:{label:ctx=>` ${ctx.dataset.label}: ${formatQuantity(ctx.raw)} وحدة`}}},
      scales:{
        x:{ticks:{color:axisLabelColor,font:{size:11, family: "Tajawal", weight: '600'}},grid:{display:false},border:{color:borderAxisColor}},
        y:{ticks:{color:axisLabelColor,font:{size:10, family: "JetBrains Mono", weight: '600'}},grid:{color:isLight ? 'rgba(15, 23, 42, 0.15)' : gc},beginAtZero:true,border:{color:borderAxisColor}}
      }}
  });
}

function renderBarWarehouse(data) {
  const el=document.getElementById("chart-warehouse"); if(!el) return;
  const {tc,gc}=gd();
  const ctx = el.getContext("2d");
  const gradients = data.labels.map((_, i) => window.createVolumetricGradient(ctx, COLORS[i % COLORS.length], 'horizontalBar'));
  const isLight = document.body.classList.contains('theme-light');
  const borderAxisColor = isLight ? '#0F172A' : '#475569';
  const axisLabelColor = isLight ? '#0F172A' : tc;
  
  _charts["chart-warehouse"]=new Chart(el,{
    type:"bar",
    data:{labels:data.labels,datasets:[{label:"قيمة المخزون",data:data.values,backgroundColor:gradients,borderRadius:8,borderSkipped:false}]},
    options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,animation:{duration:900},
      plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>` ${formatCurrency(ctx.raw,true)}`}}},
      scales:{x:{ticks:{color:axisLabelColor,font:{size:10, family: "JetBrains Mono", weight: '600'},callback:v=>formatCurrency(v,true)},grid:{color:isLight ? 'rgba(15, 23, 42, 0.15)' : gc},beginAtZero:true,border:{color:borderAxisColor}},
              y:{ticks:{color:axisLabelColor,font:{size:11, family: "Tajawal", weight: '600'}},grid:{display:false},border:{color:borderAxisColor}}}}
  });
}

// ── CSV ───────────────────────────────────────────────────────
function exportCSV(type) {
  const today=new Date().toISOString().split("T")[0];
  let rows=[], fname="";
  if(type==="abc"&&window._dashABCData){
    fname=`abc-analysis-${today}.csv`;
    rows=[["الكود","اسم الصنف","الفئة","الكمية","التكلفة","القيمة","التصنيف"],
          ...window._dashABCData.map(i=>[i.sku,i.name,i.catName,i.qty,i.cost,i.value,i.cls])];
  } else if(type==="xyz"&&window._dashXYZData){
    fname=`xyz-analysis-${today}.csv`;
    rows=[["الكود","اسم الصنف","متوسط الطلب/شهر","معامل التباين","عدد الأشهر","التصنيف"],
          ...window._dashXYZData.map(i=>[i.sku,i.name,i.avg?.toFixed(2)||0,i.cv!==null?i.cv.toFixed(1)+"%":"N/A",i.months,i.cls])];
  } else if(type==="slow"&&window._dashSlowData){
    fname=`slow-movers-${today}.csv`;
    rows=[["الكود","اسم الصنف","الكمية","القيمة","أيام بدون حركة"],
          ...window._dashSlowData.map(i=>[i.sku,i.name,i.qty,i.value,i.daysSince??'N/A'])];
  } else if(type==="expiry"&&window._dashExpiryData){
    fname=`near-expiry-${today}.csv`;
    rows=[["الكود","اسم الصنف","رقم الدفعة","تاريخ الانتهاء","أيام متبقية","الكمية"],
          ...window._dashExpiryData.map(i=>[i.sku,i.name,i.batch,i.expiryDate,i.daysLeft,i.qty])];
  } else if(type==="top"&&window._dashTopData){
    fname=`top-movers-${today}.csv`;
    rows=[["الكود","اسم الصنف","الكمية المباعة","الإيراد","التكلفة","الربح"],
          ...window._dashTopData.map(i=>[i.sku,i.name,i.qtySold,i.revenue,i.cost,i.revenue-i.cost])];
  } else { window.showToast?.("لا توجد بيانات للتصدير","warn"); return; }
  const bom="\uFEFF";
  const csv=bom+rows.map(r=>r.map(c=>`"${String(c??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob);
  const a=Object.assign(document.createElement("a"),{href:url,download:fname});
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  window.showToast?.(`تم تصدير الملف: ${fname}`,"success");
}
