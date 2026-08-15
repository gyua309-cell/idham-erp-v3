import{s as E,t as y,g as B,C as k,k as f,f as g}from"./index-HrCilPJ3.js";import{getDocs as C,query as F,where as w,limit as M}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let $=[],m=[],p="rotation";async function Y(e,n){e.innerHTML=`
    <style>
      .print-only-header { display: none; }
      @media print {
        .print-only-header { display: block !important; }
        .no-print { display: none !important; }
      }
    </style>
    <div class="filterbar no-print">
      <div class="date-range-group"><label>من</label>
        <input type="date" id="pa-from" value="${E()}" onchange="loadProductAnalytics()" /></div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="pa-to" value="${y()}" onchange="loadProductAnalytics()" /></div>
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
  `,window.paRange=R,window.loadProductAnalytics=b,window.paSetSection=A,window.exportProductAnalyticsCSV=D,await b()}let S=[];async function b(){const e=document.getElementById("pa-from")?.value||"",n=document.getElementById("pa-to")?.value||"",t=document.getElementById("pa-period");t&&(t.textContent=`الفترة من ${e||"البداية"} إلى ${n||"اليوم"}`);try{const[o,d]=await Promise.all([B(k.products()),C(F(k.salesInvoices(),w("date",">=",e),w("date","<=",n),M(1500)))]);S=o,$=d.docs.map(l=>({id:l.id,...l.data()})),_(),I(),L(e,n)}catch(o){window.showToast("فشل تحميل تحليلات الأصناف: "+o.message,"danger")}}function L(e,n){let t={};try{const i=localStorage.getItem("idham_company");i?t=JSON.parse(i):window.ERP_COMPANY&&(t=window.ERP_COMPANY)}catch{}const o=document.getElementById("pa-print-logo");o&&(t.logoBase64||t.logoUrl?(o.src=t.logoBase64||t.logoUrl,o.style.display="block"):o.style.display="none");const d=document.getElementById("pa-print-co-name");d&&(d.textContent=t.name||"مؤسسة إدهام للمواد الغذائية");const l=document.getElementById("pa-print-co-details");if(l){const i=[];t.address&&i.push(`📍 ${t.address}`),t.phone&&i.push(`📞 ${t.phone}`),t.vatNumber&&i.push(`🔢 الرقم الضريبي: ${t.vatNumber}`),t.crNumber&&i.push(`📋 السجل التجاري: ${t.crNumber}`),l.textContent=i.join(" | ")}const a=document.getElementById("pa-print-period");a&&(a.textContent=`الفترة من ${e||"البداية"} إلى ${n||"اليوم"}`)}function _(){const e={};let n=0,t=0,o=0;const d={};S.forEach(s=>{d[s.id]=parseFloat(s.purchasePrice||s.costPrice||s.averageCost||0)}),$.forEach(s=>{s.status!=="cancelled"&&(s.lines||[]).forEach(r=>{const c=r.productId;if(!c)return;const u=parseFloat(r.qty||0),P=(r.unitPrice||0)*u,q=parseFloat(r.discount||0),x=Math.max(0,P-q),h=parseFloat(r.costPrice||d[c]||0)*u;n+=u,t+=x,o+=h,e[c]||(e[c]={id:c,name:r.productName||"صنف غير معروف",qty:0,revenue:0,cost:0,profit:0,margin:0}),e[c].qty+=u,e[c].revenue+=x,e[c].cost+=h})}),m=Object.values(e).map(s=>(s.profit=s.revenue-s.cost,s.margin=s.revenue>0?s.profit/s.revenue*100:0,s)),document.getElementById("pa-total-qty").textContent=f(n);const l=t-o,a=t>0?l/t*100:0;document.getElementById("pa-avg-margin").textContent=`${a.toFixed(1)}%`;const i=[...m].sort((s,r)=>r.qty-s.qty);i.length>0?document.getElementById("pa-top-rotation").innerHTML=`${i[0].name}<br><span class="mono" style="font-size:11px;color:var(--text-2);">${f(i[0].qty)} وحدة / كرتونة</span>`:document.getElementById("pa-top-rotation").textContent="—";const v=[...m].sort((s,r)=>r.profit-s.profit);v.length>0?document.getElementById("pa-top-contrib").innerHTML=`${v[0].name}<br><span class="mono text-good" style="font-size:11px;font-weight:bold;">+${g(v[0].profit)}</span>`:document.getElementById("pa-top-contrib").textContent="—"}function I(){const e=document.getElementById("pa-tbody");if(!e)return;if(m.length===0){e.innerHTML='<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد مبيعات في هذه الفترة</td></tr>';return}let n=[...m];p==="rotation"?n.sort((t,o)=>o.qty-t.qty):p==="margin"?n.sort((t,o)=>o.margin-t.margin):p==="contribution"&&n.sort((t,o)=>o.profit-t.profit),e.innerHTML=n.map((t,o)=>`
      <tr class="${o===0?"row-good":""}">
        <td class="mono dim">${o+1}</td>
        <td><strong>${t.name}</strong></td>
        <td class="mono font-bold" style="text-align:center;">${f(t.qty)}</td>
        <td class="mono" style="text-align:left;">${g(t.revenue)}</td>
        <td class="mono dim" style="text-align:left;">${g(t.cost)}</td>
        <td class="mono font-bold text-good" style="text-align:left;">${g(t.profit)}</td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="mono" style="width:36px; text-align:right;">${t.margin.toFixed(0)}%</span>
            <div class="progress-bar" style="height:6px; flex:1;"><div class="fill ${t.margin>0?"indigo":"bad"}" style="width:${Math.max(0,Math.min(100,t.margin))}%;"></div></div>
          </div>
        </td>
      </tr>
    `).join("")}function A(e){p=e,document.querySelectorAll(".tab-btn").forEach(t=>{t.classList.remove("active")});const n=document.getElementById(`btn-pa-${e}`);n&&n.classList.add("active"),I()}function R(e,n){const t=document.getElementById("pa-from"),o=document.getElementById("pa-to");if(!t||!o)return;const d=new Date;let l=y(),a=y();e==="today"||(e==="month"?l=E():e==="last_month"&&(l=new Date(d.getFullYear(),d.getMonth()-1,1).toISOString().split("T")[0],a=new Date(d.getFullYear(),d.getMonth(),0).toISOString().split("T")[0])),t.value=l,o.value=a,document.querySelectorAll(".quick-filter-btn").forEach(i=>{i.classList.remove("active")}),n&&n.target&&n.target.classList.add("active"),b()}function D(){const e=document.getElementById("pa-from")?.value||"",n=document.getElementById("pa-to")?.value||"",t=[["تحليلات دوران وربحية الأصناف",`من: ${e} إلى: ${n}`],[],["الترتيب","اسم الصنف","الكمية المبيعة","الإيراد (ر.س)","التكلفة (ر.س)","الربح المحقق (ر.س)","الهامش %"]];let o=[...m];p==="rotation"?o.sort((a,i)=>i.qty-a.qty):p==="margin"?o.sort((a,i)=>i.margin-a.margin):p==="contribution"&&o.sort((a,i)=>i.profit-a.profit),o.forEach((a,i)=>{t.push([i+1,a.name,a.qty.toFixed(2),a.revenue.toFixed(2),a.cost.toFixed(2),a.profit.toFixed(2),`${a.margin.toFixed(1)}%`])});const d=t.map(a=>a.map(i=>`"${String(i??"").replace(/"/g,'""')}"`).join(",")).join(`
`),l=document.createElement("a");l.href=URL.createObjectURL(new Blob(["\uFEFF"+d],{type:"text/csv"})),l.download=`Product_Analytics_${e}_to_${n}.csv`,l.click()}export{Y as render};
