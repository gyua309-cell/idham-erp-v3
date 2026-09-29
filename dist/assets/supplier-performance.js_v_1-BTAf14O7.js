import{g as m}from"./index-T8P1GM2w.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let v=[],w=[],x=[],k=[],p=[],f="",g="",h="";async function T(o){o.innerHTML=I(),await D(),L(),z()}function I(){const o=new Date().toISOString().slice(0,10);return`
<div class="sp-wrap" dir="rtl">

  <!-- Page Header -->
  <div class="sp-page-header">
    <div>
      <h2 class="sp-page-title">📊 أداء تصريف الموردين</h2>
      <p class="sp-page-sub">مقارنة المشتريات بالمبيعات والمخزون المتبقي لكل مورد</p>
    </div>
    <button class="btn-sp-export" onclick="window.exportSupplierPerf()">⬇ تصدير CSV</button>
  </div>

  <!-- Filters -->
  <div class="sp-filters card">
    <div class="sp-filter-row">
      <div class="sp-filter-group">
        <label>من تاريخ</label>
        <input type="date" id="sp-date-from" value="${`${o.slice(0,4)}-01-01`}" class="sp-input">
      </div>
      <div class="sp-filter-group">
        <label>إلى تاريخ</label>
        <input type="date" id="sp-date-to" value="${o}" class="sp-input">
      </div>
      <div class="sp-filter-group">
        <label>المورد</label>
        <select id="sp-supplier" class="sp-input">
          <option value="">— كل الموردين —</option>
        </select>
      </div>
      <button class="btn-sp-run" onclick="window.runPerfReport()">🔍 تشغيل التقرير</button>
    </div>
  </div>

  <!-- KPI Cards -->
  <div id="sp-kpi" class="sp-kpi-row"></div>

  <!-- Main Table -->
  <div class="sp-table-wrap card">
    <div id="sp-table-container">
      <p class="sp-hint">اضغط "تشغيل التقرير" لعرض البيانات</p>
    </div>
  </div>

</div>

<style>
/* ── Supplier Performance Styles ── */
.sp-wrap { padding: 1rem; max-width: 1400px; margin: 0 auto; }
.sp-page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; }
.sp-page-title  { font-size:1.5rem; font-weight:700; margin:0; color:var(--text-primary,#1e293b); }
.sp-page-sub    { font-size:.85rem; color:var(--text-muted,#64748b); margin:0; }

.sp-filters { padding:1rem 1.25rem; margin-bottom:1rem; }
.sp-filter-row { display:flex; flex-wrap:wrap; gap:.75rem; align-items:flex-end; }
.sp-filter-group { display:flex; flex-direction:column; gap:.25rem; }
.sp-filter-group label { font-size:.8rem; font-weight:600; color:var(--text-muted,#64748b); }
.sp-input { padding:.45rem .75rem; border:1px solid var(--border,#e2e8f0); border-radius:8px;
            font-size:.88rem; background:var(--bg-input,#fff); color:var(--text-primary,#1e293b);
            min-width:140px; }
.sp-input:focus { outline:none; border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.15); }

.btn-sp-run { padding:.5rem 1.25rem; background:#1d4ed8; color:#fff; border:none;
              border-radius:8px; font-size:.9rem; font-weight:600; cursor:pointer; align-self:flex-end; }
.btn-sp-run:hover { background:#1e40af; }
.btn-sp-export { padding:.45rem 1rem; background:transparent; border:2px solid #1d4ed8;
                 color:#1d4ed8; border-radius:8px; font-size:.85rem; font-weight:600;
                 cursor:pointer; }
.btn-sp-export:hover { background:#eff6ff; }

/* KPI Row */
.sp-kpi-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; margin-bottom:1rem; }
.sp-kpi-card { background:var(--bg-card,#fff); border-radius:12px;
               box-shadow:0 1px 3px rgba(0,0,0,.08); padding:1rem 1.25rem;
               border-right:4px solid #3b82f6; }
.sp-kpi-label { font-size:.78rem; color:var(--text-muted,#64748b); margin-bottom:.35rem; font-weight:600; }
.sp-kpi-value { font-size:1.45rem; font-weight:700; color:var(--text-primary,#1e293b); }
.sp-kpi-sub   { font-size:.75rem; color:var(--text-muted,#64748b); margin-top:.2rem; }

/* Table */
.sp-table-wrap { padding:1rem; }
.sp-hint { text-align:center; color:var(--text-muted,#64748b); padding:2rem; }
.sp-table { width:100%; border-collapse:collapse; font-size:.85rem; }
.sp-table th { background:var(--bg-th,#f1f5f9); padding:.6rem .75rem; text-align:right;
               font-weight:700; color:var(--text-secondary,#475569); border-bottom:2px solid var(--border,#e2e8f0); }
.sp-table td { padding:.55rem .75rem; border-bottom:1px solid var(--border,#f1f5f9);
               vertical-align:middle; }
.sp-table tr:hover td { background:rgba(59,130,246,.04); }

/* Progress Bar */
.sp-bar-wrap { background:#f1f5f9; border-radius:99px; height:8px; min-width:80px; overflow:hidden; }
.sp-bar { height:8px; border-radius:99px; transition:width .4s ease; }
.bar-green { background:#22c55e; }
.bar-yellow { background:#f59e0b; }
.bar-red { background:#ef4444; }

/* Status Badge */
.sp-badge { display:inline-flex; align-items:center; gap:.3rem; padding:.2rem .6rem;
            border-radius:99px; font-size:.75rem; font-weight:700; white-space:nowrap; }
.badge-green  { background:#dcfce7; color:#166534; }
.badge-yellow { background:#fef9c3; color:#854d0e; }
.badge-red    { background:#fee2e2; color:#991b1b; }

/* Expand Button */
.btn-expand { background:none; border:none; cursor:pointer; font-size:1rem; padding:.1rem .4rem;
              color:#3b82f6; transition:transform .2s; }
.btn-expand.open { transform:rotate(90deg); }

/* Detail Table */
.sp-detail-row td { padding:0 !important; }
.sp-detail-inner { padding:.5rem 1rem 1rem 1rem; background:#f8fafc; }
.sp-detail-table { width:100%; border-collapse:collapse; font-size:.8rem; }
.sp-detail-table th { background:#e2e8f0; padding:.45rem .6rem; text-align:right; font-weight:700; }
.sp-detail-table td { padding:.4rem .6rem; border-bottom:1px solid #e2e8f0; }

/* Responsive */
@media(max-width:768px) {
  .sp-filter-row { flex-direction:column; }
  .sp-kpi-row    { grid-template-columns:1fr 1fr; }
  .sp-table-wrap { overflow-x:auto; }
}
</style>
  `}async function D(){const o=document.querySelector(".btn-sp-run");o&&(o.textContent="⏳ جارٍ التحميل...");try{const[n,e,s,a]=await Promise.all([m("purchaseInvoices"),m("salesInvoices"),m("products"),m("suppliers")]);v=n||[],w=e||[],x=s||[],k=a||[]}catch(n){console.error("SP: loadData error",n)}o&&(o.textContent="🔍 تشغيل التقرير")}function L(){const o=document.getElementById("sp-supplier");if(!o)return;const n=new Set;v.forEach(e=>{if(e.supplierId&&!n.has(e.supplierId)){n.add(e.supplierId);const s=document.createElement("option");s.value=e.supplierId,s.textContent=e.supplierName||e.supplierId,o.appendChild(s)}})}function $(){const o=f?new Date(f):null,n=g?new Date(g+"T23:59:59"):null,e={};x.forEach(t=>{e[t.id]=t});const s={};k.forEach(t=>{s[t.id]=t.name||t.id});const a={},c=t=>{if(!t)return!0;let r;return t?.toDate?r=t.toDate():typeof t=="string"?r=new Date(t):r=new Date(t),!(o&&r<o||n&&r>n)};v.forEach(t=>{if(!c(t.date))return;const r=t.supplierId||"unknown",i=t.supplierName||s[r]||"غير محدد";if(h&&r!==h)return;a[r]||(a[r]={name:i,id:r,prods:{}}),(t.lines||t.items||[]).forEach(d=>{const l=d.productId||d.id||"";if(!l)return;a[r].prods[l]||(a[r].prods[l]={name:d.productName||e[l]?.name||l,sku:d.sku||e[l]?.sku||"",purchasedQty:0,purchasedVal:0,soldQty:0,soldVal:0,currentStock:0});const u=Number(d.qty||0)+Number(d.bonus||0),E=Number(d.unitCost||d.unitPrice||0);a[r].prods[l].purchasedQty+=u,a[r].prods[l].purchasedVal+=u*E})}),w.forEach(t=>{if(!c(t.date))return;(t.lines||t.items||[]).forEach(i=>{const b=i.productId||i.id||"";b&&Object.values(a).forEach(d=>{if(d.prods[b]){const l=Number(i.qty||0),u=Number(i.unitPrice||0);d.prods[b].soldQty+=l,d.prods[b].soldVal+=l*u}})})}),Object.values(a).forEach(t=>{Object.keys(t.prods).forEach(r=>{const i=e[r];if(i){const b=Number(i.currentStock??i.stock??i.qty??0);t.prods[r].currentStock=b}})}),p=Object.values(a).map(t=>{let r=0,i=0,b=0;const d=Object.values(t.prods);d.forEach(u=>{r+=u.purchasedQty,i+=u.soldQty,u.remaining=Math.max(0,u.purchasedQty-u.soldQty),b+=u.remaining});const l=r>0?Math.round(i/r*100):0;return{...t,prods:d,totalPurchased:r,totalSold:i,totalRemaining:b,turnoverPct:l}}),p.sort((t,r)=>r.turnoverPct-t.turnoverPct)}function S(){const o=document.getElementById("sp-kpi");if(!o)return;const n=p.reduce((t,r)=>t+r.totalPurchased,0),e=p.reduce((t,r)=>t+r.totalSold,0),s=p[0],a=p[p.length-1],c=n>0?Math.round(e/n*100):0;o.innerHTML=`
    <div class="sp-kpi-card" style="border-color:#3b82f6">
      <div class="sp-kpi-label">إجمالي المشتريات (وحدة)</div>
      <div class="sp-kpi-value">${n.toLocaleString("ar")}</div>
      <div class="sp-kpi-sub">عدد الموردين: ${p.length}</div>
    </div>
    <div class="sp-kpi-card" style="border-color:#22c55e">
      <div class="sp-kpi-label">إجمالي المبيعات (وحدة)</div>
      <div class="sp-kpi-value">${e.toLocaleString("ar")}</div>
      <div class="sp-kpi-sub">معدل التصريف الكلي: ${c}%</div>
    </div>
    <div class="sp-kpi-card" style="border-color:#22c55e">
      <div class="sp-kpi-label">🏆 أفضل مورد تصريفاً</div>
      <div class="sp-kpi-value" style="font-size:1.1rem">${s?s.name:"—"}</div>
      <div class="sp-kpi-sub">${s?s.turnoverPct+"% تصريف":""}</div>
    </div>
    <div class="sp-kpi-card" style="border-color:#ef4444">
      <div class="sp-kpi-label">⚠ أقل مورد تصريفاً</div>
      <div class="sp-kpi-value" style="font-size:1.1rem">${a&&a!==s?a.name:"—"}</div>
      <div class="sp-kpi-sub">${a&&a!==s?a.turnoverPct+"% تصريف":""}</div>
    </div>
  `}function y(o){return o>=75?{cls:"badge-green",barCls:"bar-green",icon:"🟢",label:"ممتاز"}:o>=40?{cls:"badge-yellow",barCls:"bar-yellow",icon:"🟡",label:"متوسط"}:{cls:"badge-red",barCls:"bar-red",icon:"🔴",label:"ضعيف"}}function P(){const o=document.getElementById("sp-table-container");if(!o)return;if(!p.length){o.innerHTML='<p class="sp-hint">لا توجد بيانات للفترة المحددة</p>';return}const n=p.map((e,s)=>{const a=y(e.turnoverPct),c=Math.min(100,e.turnoverPct);return`
      <tr>
        <td>
          <button class="btn-expand" id="expand-${s}" onclick="window.togglePerfDetail(${s})">▶</button>
        </td>
        <td><strong>${e.name}</strong></td>
        <td>${e.totalPurchased.toLocaleString("ar")}</td>
        <td>${e.totalSold.toLocaleString("ar")}</td>
        <td>${e.totalRemaining.toLocaleString("ar")}</td>
        <td>
          <div style="display:flex;align-items:center;gap:.5rem;">
            <div class="sp-bar-wrap" style="flex:1">
              <div class="sp-bar ${a.barCls}" style="width:${c}%"></div>
            </div>
            <span style="min-width:40px;font-weight:700;color:${c>=75?"#16a34a":c>=40?"#d97706":"#dc2626"}">${e.turnoverPct}%</span>
          </div>
        </td>
        <td><span class="sp-badge ${a.cls}">${a.icon} ${a.label}</span></td>
        <td>${e.prods.length}</td>
      </tr>
      <tr id="detail-row-${s}" class="sp-detail-row" style="display:none">
        <td colspan="8">${Q(e)}</td>
      </tr>
    `}).join("");o.innerHTML=`
    <table class="sp-table">
      <thead>
        <tr>
          <th style="width:40px"></th>
          <th>المورد</th>
          <th>إجمالي المشتريات</th>
          <th>إجمالي المبيعات</th>
          <th>المتبقي</th>
          <th style="min-width:160px">نسبة التصريف</th>
          <th>التقييم</th>
          <th>عدد الأصناف</th>
        </tr>
      </thead>
      <tbody>${n}</tbody>
    </table>
  `}function Q(o){return o.prods.length?`
    <div class="sp-detail-inner">
      <table class="sp-detail-table">
        <thead>
          <tr>
            <th>الصنف</th>
            <th>مشتريات</th>
            <th>مبيعات</th>
            <th>متبقي (محسوب)</th>
            <th>مخزون فعلي</th>
            <th>نسبة التصريف</th>
          </tr>
        </thead>
        <tbody>${o.prods.map(e=>{const s=y(e.purchasedQty>0?Math.round(e.soldQty/e.purchasedQty*100):0),a=e.purchasedQty>0?Math.round(e.soldQty/e.purchasedQty*100):0;return`
      <tr>
        <td>${e.sku?`<small style="color:#64748b">${e.sku}</small> `:""}${e.name}</td>
        <td>${e.purchasedQty.toLocaleString("ar")}</td>
        <td>${e.soldQty.toLocaleString("ar")}</td>
        <td>${e.remaining.toLocaleString("ar")}</td>
        <td>${e.currentStock.toLocaleString("ar")}</td>
        <td>
          <span class="sp-badge ${s.cls}">${s.icon} ${a}%</span>
        </td>
      </tr>
    `}).join("")}</tbody>
      </table>
    </div>
  `:'<div class="sp-detail-inner"><em>لا توجد أصناف</em></div>'}window.runPerfReport=function(){f=document.getElementById("sp-date-from")?.value||"",g=document.getElementById("sp-date-to")?.value||"",h=document.getElementById("sp-supplier")?.value||"",$(),S(),P()};window.togglePerfDetail=function(o){const n=document.getElementById(`detail-row-${o}`),e=document.getElementById(`expand-${o}`);if(!n)return;const s=n.style.display!=="none";n.style.display=s?"none":"table-row",e&&e.classList.toggle("open",!s)};window.exportSupplierPerf=function(){if(!p.length){alert("شغّل التقرير أولاً");return}const o="\uFEFF",n=["المورد","إجمالي المشتريات","إجمالي المبيعات","المتبقي","نسبة التصريف%","التقييم"].join(","),e=p.map(r=>{const i=y(r.turnoverPct);return[`"${r.name}"`,r.totalPurchased,r.totalSold,r.totalRemaining,r.turnoverPct,`"${i.label}"`].join(",")}),s=o+[n,...e].join(`
`),a=new Blob([s],{type:"text/csv;charset=utf-8;"}),c=URL.createObjectURL(a),t=document.createElement("a");t.href=c,t.download=`أداء-الموردين-${new Date().toISOString().slice(0,10)}.csv`,t.click(),URL.revokeObjectURL(c)};function z(){f=document.getElementById("sp-date-from")?.value||"",g=document.getElementById("sp-date-to")?.value||"",h="",$(),S(),P()}export{T as render};
