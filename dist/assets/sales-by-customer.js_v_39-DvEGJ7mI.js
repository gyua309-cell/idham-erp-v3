import{s as u,t as m,g as b,C as c,f as l}from"./index-HrCilPJ3.js";import{orderBy as h,query as y,limit as g,getDocs as v}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function I(a,o){a.innerHTML=`
    <div class="filterbar">
      <div class="date-range-group"><label>من</label>
        <input type="date" id="rsc-from" value="${u()}" onchange="loadSalesByCustomer()" /></div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="rsc-to" value="${m()}" onchange="loadSalesByCustomer()" /></div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="exportSalesByCustomer()">📤 CSV</button>
        <button class="btn btn-secondary btn-sm" onclick="loadSalesByCustomer()">🔄 تحديث</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">تقرير مبيعات العملاء وديونهم</h1>
        <p class="page-subtitle" id="rsc-period"></p>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>اسم العميل</th>
                <th>المنطقة</th>
                <th>المندوب</th>
                <th>عدد الفواتير</th>
                <th>إجمالي المشتروات</th>
                <th>الرصيد المدين الحالي</th>
                <th>حد الائتمان</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="rsc-tbody">
              ${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>`,await f()}let r=[];async function f(){const a=document.getElementById("rsc-tbody"),o=document.getElementById("rsc-from")?.value,s=document.getElementById("rsc-to")?.value;document.getElementById("rsc-period").textContent=`الفترة: ${o} — ${s}`,a&&(a.innerHTML=`${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`);try{const e=await b(c.customers(),[h("name")]),d=y(c.salesInvoices(),g(2e3)),p=(await v(d)).docs.map(t=>t.data()).filter(t=>{const i=t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:t.date||"";return i>=o&&i<=s&&t.status!=="cancelled"}),n={};if(e.forEach(t=>{n[t.id]={id:t.id,name:t.name,zone:t.zone||"—",repName:t.repName||"—",balance:t.balance||0,creditLimit:t.creditLimit||0,invCount:0,totalSales:0}}),p.forEach(t=>{!t.customerId||!n[t.customerId]||(n[t.customerId].invCount++,n[t.customerId].totalSales+=t.totalWithVat||0)}),r=Object.values(n).filter(t=>t.totalSales>0||t.balance>0),r.length===0){a.innerHTML='<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد حركات مبيعات عملاء في هذه الفترة</td></tr>';return}a.innerHTML=r.map(t=>`
      <tr>
        <td class="font-heading font-semibold">${t.name}</td>
        <td class="dim">${t.zone}</td>
        <td class="dim">${t.repName}</td>
        <td class="mono">${t.invCount}</td>
        <td class="mono font-bold text-indigo">${l(t.totalSales)}</td>
        <td class="mono font-bold ${t.balance>0?"text-bad":"text-good"}">${l(t.balance)}</td>
        <td class="mono dim">${l(t.creditLimit)}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="navigate('report-customer-statement')">📄 كشف حساب</button>
        </td>
      </tr>`).join("")}catch(e){a.innerHTML=`<tr><td colspan="8"><div class="alert bad" style="margin:8px;">${e.message}</div></td></tr>`}}window.exportSalesByCustomer=()=>{const a=[["العميل","المنطقة","المندوب","الفواتير","المشتروات","الرصيد المدين","حد الائتمان"]];r.forEach(e=>a.push([e.name,e.zone,e.repName,e.invCount,e.totalSales,e.balance,e.creditLimit]));const o=a.map(e=>e.map(d=>`"${d}"`).join(",")).join(`
`),s=document.createElement("a");s.href=URL.createObjectURL(new Blob(["\uFEFF"+o],{type:"text/csv"})),s.download=`sales_by_customer_${m()}.csv`,s.click(),showToast("تم التصدير","success")};export{I as render};
