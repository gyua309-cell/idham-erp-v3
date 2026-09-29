const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-C8cvrlnW.js","assets/index-Dq7oGj9k.css"])))=>i.map(i=>d[i]);
import{s as f,t as b,_ as B,a as h,g as E,l as C,f as u,y as $}from"./index-C8cvrlnW.js";import{orderBy as P,getDocs as A,query as L,limit as _}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function H(e,s){e.innerHTML=`
    <div class="filterbar">
      <div class="date-range-group"><label>من</label>
        <input type="date" id="rsp-from" value="${f()}" onchange="loadSalesByProduct()" /></div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="rsp-to" value="${b()}" onchange="loadSalesByProduct()" /></div>
      <div class="quick-filters">
        <button class="quick-filter-btn" onclick="rspRange('today')">اليوم</button>
        <button class="quick-filter-btn active" onclick="rspRange('month')">هذا الشهر</button>
        <button class="quick-filter-btn" onclick="rspRange('last_month')">الشهر الماضي</button>
      </div>
      <div class="filterbar-divider"></div>
      <div class="filter-select-group"><label>المخزن</label>
        <select id="rsp-warehouse" onchange="loadSalesByProduct()">
          <option value="">الكل</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <div class="view-toggle">
          <button class="toggle-btn active" onclick="rspSetView('table',this)">📋 جدول</button>
          <button class="toggle-btn" onclick="rspSetView('chart',this)">📊 رسم</button>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="exportSalesByProduct()">📤 CSV</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">مبيعات حسب الصنف</h1>
        <p class="page-subtitle" id="rsp-period"></p>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid mb-20">
        <div class="kpi-card"><div class="status-bar indigo"></div>
          <div class="kpi-icon indigo">📦</div>
          <div class="kpi-content"><div class="kpi-label">إجمالي الإيراد</div>
            <div class="kpi-value mono" id="rsp-total-rev">—</div></div></div>
        <div class="kpi-card"><div class="status-bar lime"></div>
          <div class="kpi-icon lime">📈</div>
          <div class="kpi-content"><div class="kpi-label">إجمالي الربح</div>
            <div class="kpi-value mono" id="rsp-total-profit">—</div></div></div>
        <div class="kpi-card"><div class="status-bar good"></div>
          <div class="kpi-icon good">🏆</div>
          <div class="kpi-content"><div class="kpi-label">أكثر صنف مبيعاً</div>
            <div class="kpi-value" id="rsp-top-product" style="font-size:14px;">—</div></div></div>
        <div class="kpi-card"><div class="status-bar warn"></div>
          <div class="kpi-icon warn">📊</div>
          <div class="kpi-content"><div class="kpi-label">عدد الأصناف المبيعة</div>
            <div class="kpi-value mono" id="rsp-product-count">—</div></div></div>
      </div>

      <div id="rsp-view-table" class="card">
        <div class="table-container">
          <table class="data-dense" id="rsp-table">
            <thead><tr>
              <th>#</th>
              <th onclick="rspSort('productName')">اسم الصنف ↕</th>
              <th onclick="rspSort('totalQty')">إجمالي الكمية ↕</th>
              <th onclick="rspSort('totalRevenue')">الإيراد ↕</th>
              <th onclick="rspSort('totalCost')">التكلفة ↕</th>
              <th onclick="rspSort('profit')">الربح ↕</th>
              <th onclick="rspSort('margin')">هامش الربح ↕</th>
              <th>حصة من المبيعات</th>
            </tr></thead>
            <tbody id="rsp-tbody">
              ${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div id="rsp-view-chart" class="card hidden">
        <div class="card-header"><h3 style="font-family:var(--font-heading);">مقارنة المبيعات والربح</h3></div>
        <div class="card-body"><div class="chart-container" style="height:360px;"><canvas id="rsp-chart"></canvas></div></div>
      </div>
    </div>`,await M("rsp-warehouse"),await loadSalesByProduct()}async function M(e){try{const{getAll:s}=await B(async()=>{const{getAll:a}=await import("./index-C8cvrlnW.js").then(r=>r.T);return{getAll:a}},__vite__mapDeps([0,1])),o=await s(h.warehouses(),[P("name")]),t=document.getElementById(e);t&&o.forEach(a=>t.innerHTML+=`<option value="${a.id}">${a.name}</option>`)}catch{}}let n=[],v="totalRevenue",y="desc";window.loadSalesByProduct=async()=>{const e=document.getElementById("rsp-tbody"),s=document.getElementById("rsp-from")?.value,o=document.getElementById("rsp-to")?.value,t=document.getElementById("rsp-warehouse")?.value;document.getElementById("rsp-period").textContent=`الفترة: ${s} — ${o}`,e&&(e.innerHTML=`${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`);try{const[a,r]=await Promise.all([A(L(h.salesInvoices(),_(2e3))),E(h.products())]),l={};r.forEach(i=>{l[i.id]=i,i.name&&(l[i.name.trim()]=i)});let m=a.docs.map(i=>i.data()).filter(i=>{const d=i.createdAt?.toDate?i.createdAt.toDate().toISOString().split("T")[0]:i.date||"";return d>=s&&d<=o&&i.status!=="cancelled"});t&&(m=m.filter(i=>i.warehouseId===t));const c={};m.forEach(i=>{(i.lines||[]).forEach(d=>{const p=d.productId||d.productName;c[p]||(c[p]={productId:p,productName:d.productName,totalQty:0,totalRevenue:0,totalCost:0});const k=d.qty*d.unitPrice*(1-(d.discount||0)/100),x=d.productName||d.name||"",g=l[d.productId]||l[x.trim()],R=g&&(g.costPrice||g.purchasePrice)||0,I=d.costPrice||R||d.unitPrice*.7,S=d.qty*I;c[p].totalQty+=d.qty||0,c[p].totalRevenue+=k,c[p].totalCost+=S})}),n=Object.values(c).map(i=>({...i,profit:i.totalRevenue-i.totalCost,margin:i.totalRevenue>0?(i.totalRevenue-i.totalCost)/i.totalRevenue*100:0})),w(),T(),F()}catch(a){e&&(e.innerHTML=`<tr><td colspan="8"><div class="alert bad" style="margin:8px;">${a.message}</div></td></tr>`)}};function w(){const e=document.getElementById("rsp-tbody");if(!e)return;const s=[...n].sort((t,a)=>{const r=t[v],l=a[v];return y==="desc"?l-r:r-l});s[0]?.totalRevenue;const o=s.reduce((t,a)=>t+a.totalRevenue,0);if(s.length===0){e.innerHTML='<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد بيانات</td></tr>';return}e.innerHTML=s.map((t,a)=>{const r=o>0?t.totalRevenue/o*100:0,l=t.margin>=20?"good":t.margin>=10?"warn":"bad";return`<tr>
      <td class="text-2">${a+1}</td>
      <td class="font-heading font-semibold">${t.productName}</td>
      <td class="mono">${C(t.totalQty)}</td>
      <td class="mono">${u(t.totalRevenue)}</td>
      <td class="mono text-1">${u(t.totalCost)}</td>
      <td class="mono ${t.profit>=0?"text-good":"text-bad"}">${u(t.profit)}</td>
      <td><span class="badge ${l}" style="font-size:11px;">${$(t.margin)}</span></td>
      <td style="min-width:120px;">
        <div class="flex items-center gap-6">
          <div class="progress-bar" style="flex:1;">
            <div class="fill indigo" style="width:${r}%;"></div>
          </div>
          <span class="mono text-2" style="font-size:10px;width:32px;">${r.toFixed(1)}%</span>
        </div>
      </td>
    </tr>`}).join("")}function T(){const e=n.reduce((t,a)=>t+a.totalRevenue,0),s=n.reduce((t,a)=>t+a.profit,0),o=n.sort((t,a)=>a.totalRevenue-t.totalRevenue)[0];document.getElementById("rsp-total-rev").textContent=u(e),document.getElementById("rsp-total-profit").textContent=u(s),document.getElementById("rsp-top-product").textContent=o?.productName||"—",document.getElementById("rsp-product-count").textContent=n.length.toLocaleString("ar")}function F(){const e=document.getElementById("rsp-chart");if(!e||!window.Chart)return;e._c&&e._c.destroy();const s=[...n].sort((o,t)=>t.totalRevenue-o.totalRevenue).slice(0,10);e._c=new Chart(e,{type:"bar",data:{labels:s.map(o=>o.productName.substring(0,20)),datasets:[{label:"الإيراد",data:s.map(o=>o.totalRevenue),backgroundColor:"rgba(91,127,255,0.7)",borderRadius:4},{label:"الربح",data:s.map(o=>o.profit),backgroundColor:"rgba(183,211,61,0.7)",borderRadius:4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{labels:{color:"#9CA3BD"}}},scales:{x:{ticks:{color:"#606A8C",font:{size:11}},grid:{color:"#232A42"}},y:{ticks:{color:"#606A8C",callback:o=>u(o,!0)},grid:{color:"#232A42"}}}}})}window.rspSort=e=>{y=v===e&&y==="desc"?"asc":"desc",v=e,w()};window.rspSetView=(e,s)=>{document.querySelectorAll(".toggle-btn").forEach(o=>o.classList.remove("active")),s.classList.add("active"),document.getElementById("rsp-view-table").classList.toggle("hidden",e!=="table"),document.getElementById("rsp-view-chart").classList.toggle("hidden",e!=="chart")};window.rspRange=e=>{const s=b();if(document.querySelectorAll(".quick-filter-btn").forEach(o=>o.classList.remove("active")),event.target.classList.add("active"),e==="today")document.getElementById("rsp-from").value=s,document.getElementById("rsp-to").value=s;else if(e==="month")document.getElementById("rsp-from").value=f(),document.getElementById("rsp-to").value=s;else if(e==="last_month"){const o=new Date,t=new Date(o.getFullYear(),o.getMonth()-1,1),a=new Date(o.getFullYear(),o.getMonth(),0);document.getElementById("rsp-from").value=t.toISOString().split("T")[0],document.getElementById("rsp-to").value=a.toISOString().split("T")[0]}loadSalesByProduct()};window.exportSalesByProduct=()=>{const e=[["الصنف","الكمية","الإيراد","التكلفة","الربح","الهامش"]];n.sort((t,a)=>a.totalRevenue-t.totalRevenue).forEach(t=>{e.push([t.productName,t.totalQty,t.totalRevenue.toFixed(2),t.totalCost.toFixed(2),t.profit.toFixed(2),t.margin.toFixed(1)+"%"])});const s=e.map(t=>t.map(a=>`"${a}"`).join(",")).join(`
`),o=document.createElement("a");o.href=URL.createObjectURL(new Blob(["\uFEFF"+s],{type:"text/csv"})),o.download=`sales_by_product_${b()}.csv`,o.click(),showToast("تم التصدير","success")};export{H as render};
