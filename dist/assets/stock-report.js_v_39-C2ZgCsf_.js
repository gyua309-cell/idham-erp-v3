import{g as r,a as n,f as l,l as w,m as f,t as x}from"./index-CEMoTDyX.js";import{orderBy as u,query as $,getDocs as S}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function j(o,a){o.innerHTML=`
    <div class="filterbar">
      <div class="filter-select-group"><label>المخزن</label>
        <select id="stock-wh" onchange="loadStockReport()"><option value="">الكل</option></select></div>
      <div class="filter-select-group"><label>الحالة</label>
        <select id="stock-status" onchange="loadStockReport()">
          <option value="">الكل</option><option value="out">نافد</option><option value="low">منخفض</option><option value="ok">متوفر</option>
        </select></div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="exportStockReport()">📤 CSV</button>
        <button class="btn btn-secondary btn-sm" onclick="loadStockReport()">🔄 تحديث</button>
      </div>
    </div>
    <div class="page-content">
      <div class="page-header"><h1 class="page-title">تقرير المخزون</h1><p class="page-subtitle" id="stock-count"></p></div>
      <div class="kpi-grid mb-20">
        <div class="kpi-card"><div class="status-bar indigo"></div><div class="kpi-icon indigo">📦</div><div class="kpi-content"><div class="kpi-label">إجمالي الأصناف</div><div class="kpi-value mono" id="sk-all">—</div></div></div>
        <div class="kpi-card"><div class="status-bar bad"></div><div class="kpi-icon bad">🔴</div><div class="kpi-content"><div class="kpi-label">نافد المخزون</div><div class="kpi-value mono" id="sk-out">—</div></div></div>
        <div class="kpi-card"><div class="status-bar warn"></div><div class="kpi-icon warn">🟡</div><div class="kpi-content"><div class="kpi-label">منخفض المخزون</div><div class="kpi-value mono" id="sk-low">—</div></div></div>
        <div class="kpi-card"><div class="status-bar lime"></div><div class="kpi-icon lime">💰</div><div class="kpi-content"><div class="kpi-label">قيمة المخزون</div><div class="kpi-value mono" id="sk-value">—</div></div></div>
      </div>
      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead><tr><th>الصنف</th><th>الكود</th><th>المخزن</th><th>الكمية</th><th>حد الطلب</th><th>سعر التكلفة</th><th>القيمة</th><th>الحالة</th></tr></thead>
            <tbody id="stock-tbody">${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}</tbody>
          </table>
        </div>
      </div>
    </div>`,await E(),await loadStockReport()}async function E(){try{const o=await r(n.warehouses(),[u("name")]),a=document.getElementById("stock-wh");a&&o.forEach(d=>a.innerHTML+=`<option value="${d.id}">${d.name}</option>`)}catch{}}let s=[];window.loadStockReport=async()=>{const o=document.getElementById("stock-tbody");if(o){o.innerHTML=`${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;try{const a=document.getElementById("stock-wh")?.value,d=document.getElementById("stock-status")?.value,e=$(n.stockByWarehouse());let c=(await S(e)).docs.map(t=>t.data());a&&(c=c.filter(t=>t.warehouseId===a)),d&&(c=c.filter(t=>t.stockStatus===d)),c.sort((t,i)=>(t.productId||"").localeCompare(i.productId||"")),s=c;const k=await r(n.products(),[u("name")]),p={};k.forEach(t=>p[t.id]=t);const h=await r(n.warehouses(),[u("name")]),m={};h.forEach(t=>m[t.id]=t.name),s.forEach(t=>{const i=p[t.productId]||{};t.productName=i.name||i.nameAr||i.nameEn||t.productId,t.sku=i.sku||"",t.warehouseName=m[t.warehouseId]||t.warehouseId,t.costPrice=i.costPrice||0,t.value=(t.qty||0)*t.costPrice});const g=s.filter(t=>t.stockStatus==="out").length,y=s.filter(t=>t.stockStatus==="low").length,b=s.reduce((t,i)=>t+i.value,0);if(document.getElementById("sk-all").textContent=s.length,document.getElementById("sk-out").textContent=g,document.getElementById("sk-low").textContent=y,document.getElementById("sk-value").textContent=l(b),document.getElementById("stock-count").textContent=`${s.length} سجل`,!s.length){o.innerHTML='<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد بيانات مخزون</td></tr>';return}o.innerHTML=s.map(t=>`<tr class="status-${t.stockStatus==="out"?"bad":t.stockStatus==="low"?"warn":""}">
      <td class="font-semibold font-heading">${t.productName}</td>
      <td class="mono dim" style="font-size:11px;">${t.sku}</td>
      <td class="dim">${t.warehouseName}</td>
      <td class="mono font-bold">${w(t.qty)}</td>
      <td class="mono text-2">${t.reorderLevel||0}</td>
      <td class="mono">${l(t.costPrice)}</td>
      <td class="mono">${l(t.value)}</td>
      <td>${f(t.qty,t.reorderLevel)}</td>
    </tr>`).join("")}catch(a){o.innerHTML=`<tr><td colspan="8"><div class="alert bad">${a.message}</div></td></tr>`}}};window.exportStockReport=()=>{const o=[["الصنف","الكود","المخزن","الكمية","حد الطلب","سعر التكلفة","القيمة","الحالة"]];s.forEach(e=>o.push([e.productName,e.sku,e.warehouseName,e.qty,e.reorderLevel||0,e.costPrice,e.value,e.stockStatus]));const a=o.map(e=>e.map(v=>`"${v||""}"`).join(",")).join(`
`),d=document.createElement("a");d.href=URL.createObjectURL(new Blob(["\uFEFF"+a],{type:"text/csv"})),d.download=`stock_${x()}.csv`,d.click(),showToast("تم التصدير","success")};export{j as render};
