import{s as k,t as g,a as q,l as y,f as u}from"./index-ClmVJz2W.js";import{query as I,where as h,limit as B,getDocs as F}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let S=[],v=[],p="rotation";async function j(e,n){e.innerHTML=`
    <div class="filterbar no-print">
      <div class="date-range-group"><label>من</label>
        <input type="date" id="pa-from" value="${k()}" onchange="loadProductAnalytics()" /></div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="pa-to" value="${g()}" onchange="loadProductAnalytics()" /></div>
      <div class="quick-filters">
        <button class="quick-filter-btn" onclick="paRange('today')">اليوم</button>
        <button class="quick-filter-btn active" onclick="paRange('month')">هذا الشهر</button>
        <button class="quick-filter-btn" onclick="paRange('last_month')">الشهر الماضي</button>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="exportProductAnalyticsCSV()">📤 CSV</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
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
          <table class="data-dense">
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
  `,window.paRange=M,window.loadProductAnalytics=f,window.paSetSection=L,window.exportProductAnalyticsCSV=P,await f()}async function f(){const e=document.getElementById("pa-from")?.value||"",n=document.getElementById("pa-to")?.value||"",t=document.getElementById("pa-period");t&&(t.textContent=`الفترة من ${e||"البداية"} إلى ${n||"اليوم"}`);try{const o=I(q.salesInvoices(),h("date",">=",e),h("date","<=",n),B(1500));S=(await F(o)).docs.map(l=>({id:l.id,...l.data()})),C(),w()}catch(o){window.showToast("فشل تحميل تحليلات الأصناف: "+o.message,"danger")}}function C(){const e={};let n=0,t=0,o=0;S.forEach(a=>{a.status!=="cancelled"&&(a.lines||[]).forEach(d=>{const r=d.productId;if(!r)return;const m=parseFloat(d.qty||0),$=(d.unitPrice||0)*m,E=parseFloat(d.discount||0),b=Math.max(0,$-E),x=(d.costPrice||0)*m;n+=m,t+=b,o+=x,e[r]||(e[r]={id:r,name:d.productName||"صنف غير معروف",qty:0,revenue:0,cost:0,profit:0,margin:0}),e[r].qty+=m,e[r].revenue+=b,e[r].cost+=x})}),v=Object.values(e).map(a=>(a.profit=a.revenue-a.cost,a.margin=a.revenue>0?a.profit/a.revenue*100:0,a)),document.getElementById("pa-total-qty").textContent=y(n);const c=t-o,l=t>0?c/t*100:0;document.getElementById("pa-avg-margin").textContent=`${l.toFixed(1)}%`;const i=[...v].sort((a,d)=>d.qty-a.qty);i.length>0?document.getElementById("pa-top-rotation").innerHTML=`${i[0].name}<br><span class="mono" style="font-size:11px;color:var(--text-2);">${y(i[0].qty)} وحدة / كرتونة</span>`:document.getElementById("pa-top-rotation").textContent="—";const s=[...v].sort((a,d)=>d.profit-a.profit);s.length>0?document.getElementById("pa-top-contrib").innerHTML=`${s[0].name}<br><span class="mono text-good" style="font-size:11px;font-weight:bold;">+${u(s[0].profit)}</span>`:document.getElementById("pa-top-contrib").textContent="—"}function w(){const e=document.getElementById("pa-tbody");if(!e)return;if(v.length===0){e.innerHTML='<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد مبيعات في هذه الفترة</td></tr>';return}let n=[...v];p==="rotation"?n.sort((t,o)=>o.qty-t.qty):p==="margin"?n.sort((t,o)=>o.margin-t.margin):p==="contribution"&&n.sort((t,o)=>o.profit-t.profit),e.innerHTML=n.map((t,o)=>`
      <tr class="${o===0?"row-good":""}">
        <td class="mono dim">${o+1}</td>
        <td><strong>${t.name}</strong></td>
        <td class="mono font-bold" style="text-align:center;">${y(t.qty)}</td>
        <td class="mono" style="text-align:left;">${u(t.revenue)}</td>
        <td class="mono dim" style="text-align:left;">${u(t.cost)}</td>
        <td class="mono font-bold text-good" style="text-align:left;">${u(t.profit)}</td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="mono" style="width:36px; text-align:right;">${t.margin.toFixed(0)}%</span>
            <div class="progress-bar" style="height:6px; flex:1;"><div class="fill ${t.margin>0?"indigo":"bad"}" style="width:${Math.max(0,Math.min(100,t.margin))}%;"></div></div>
          </div>
        </td>
      </tr>
    `).join("")}function L(e){p=e,document.querySelectorAll(".tab-btn").forEach(t=>{t.classList.remove("active")});const n=document.getElementById(`btn-pa-${e}`);n&&n.classList.add("active"),w()}function M(e){const n=document.getElementById("pa-from"),t=document.getElementById("pa-to");if(!n||!t)return;const o=new Date;let c=g(),l=g();e==="today"||(e==="month"?c=k():e==="last_month"&&(c=new Date(o.getFullYear(),o.getMonth()-1,1).toISOString().split("T")[0],l=new Date(o.getFullYear(),o.getMonth(),0).toISOString().split("T")[0])),n.value=c,t.value=l,document.querySelectorAll(".quick-filter-btn").forEach(i=>{i.classList.remove("active")}),event.target.classList.add("active"),f()}function P(){const e=document.getElementById("pa-from")?.value||"",n=document.getElementById("pa-to")?.value||"",t=[["تحليلات دوران وربحية الأصناف",`من: ${e} إلى: ${n}`],[],["الترتيب","اسم الصنف","الكمية المبيعة","الإيراد (ر.س)","التكلفة (ر.س)","الربح المحقق (ر.س)","الهامش %"]];let o=[...v];p==="rotation"?o.sort((i,s)=>s.qty-i.qty):p==="margin"?o.sort((i,s)=>s.margin-i.margin):p==="contribution"&&o.sort((i,s)=>s.profit-i.profit),o.forEach((i,s)=>{t.push([s+1,i.name,i.qty.toFixed(2),i.revenue.toFixed(2),i.cost.toFixed(2),i.profit.toFixed(2),`${i.margin.toFixed(1)}%`])});const c=t.map(i=>i.map(s=>`"${String(s??"").replace(/"/g,'""')}"`).join(",")).join(`
`),l=document.createElement("a");l.href=URL.createObjectURL(new Blob(["\uFEFF"+c],{type:"text/csv"})),l.download=`Product_Analytics_${e}_to_${n}.csv`,l.click()}export{j as render};
