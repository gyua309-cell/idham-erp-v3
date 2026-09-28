import{s as T,t as A,g as $,a as y,d as w,C as D,f as p}from"./index-DZSjEJ7g.js";import{orderBy as j,getDocs as v,query as R,collection as M,where as L,limit as O}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function q(d,c){d.innerHTML=`
    <div class="filterbar">
      <div class="date-range-group"><label>من</label>
        <input type="date" id="rsr-from" value="${T()}" onchange="loadSalesByRep()" /></div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="rsr-to" value="${A()}" onchange="loadSalesByRep()" /></div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="exportSalesByRep()">📤 CSV</button>
        <button class="btn btn-secondary btn-sm" onclick="loadSalesByRep()">🔄 تحديث</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">تقرير مبيعات المناديب وعمولاتهم</h1>
        <p class="page-subtitle" id="rsr-period"></p>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>اسم المندوب</th>
                <th>المنطقة</th>
                <th>عدد الفواتير</th>
                <th>إجمالي المبيعات</th>
                <th>المحصّل</th>
                <th>المتبقي</th>
                <th>الهدف الشهري</th>
                <th>نسبة الإنجاز</th>
                <th>العمولة المستحقة</th>
              </tr>
            </thead>
            <tbody id="rsr-tbody">
              ${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(9).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>`,await k()}let u=[];async function k(){const d=document.getElementById("rsr-tbody"),c=document.getElementById("rsr-from")?.value,r=document.getElementById("rsr-to")?.value;document.getElementById("rsr-period").textContent=`الفترة: ${c} — ${r}`,d&&(d.innerHTML=`${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(9).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`);try{const[e,l,h,f,C]=await Promise.all([$(y.salesReps(),[j("name")]),$(y.customers()),v(R(M(w,`companies/${D}/receipts`),L("entityType","==","customer"))).catch(t=>(console.warn(t),{docs:[]})),v(M(w,`companies/${D}/collections`)).catch(t=>(console.warn(t),{docs:[]})),v(R(y.salesInvoices(),O(2e3)))]),B=h.docs.map(t=>t.data()),E=f.docs.map(t=>t.data()),b=C.docs.map(t=>t.data()).filter(t=>{const a=t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:t.date||"";return a>=c&&a<=r&&t.status!=="cancelled"}),m=t=>t?t.date?t.date:t.createdAt?t.createdAt.toDate?t.createdAt.toDate().toISOString().split("T")[0]:t.createdAt.seconds?new Date(t.createdAt.seconds*1e3).toISOString().split("T")[0]:typeof t.createdAt=="string"?t.createdAt.split("T")[0]:"":"":"",I=B.filter(t=>{const a=m(t);return(!c||a>=c)&&(!r||a<=r)}),x=E.filter(t=>{const a=m(t);return(!c||a>=c)&&(!r||a<=r)}),s={};if(e.forEach(t=>{s[t.id]={name:t.name,zone:t.zone||"—",target:t.monthlyTarget||0,commRate:t.commissionRate||0,invCount:0,totalSales:0,paid:0}}),I.forEach(t=>{const a=l.find(o=>o.id===t.targetId);a&&a.repId&&s[a.repId]&&(s[a.repId].paid+=t.amount||0)}),x.forEach(t=>{t.repId&&s[t.repId]&&(s[t.repId].paid+=t.amount||0)}),b.filter(t=>t.status!=="cancelled").filter(t=>t.paymentMethod==="cash"||t.status==="paid").forEach(t=>{if(!t.repId||!s[t.repId])return;const a=t.totalWithVat||t.total||0,o=t.date||"";I.some(n=>{const i=m(n);if(!i||!o)return!1;const g=Math.abs(new Date(i)-new Date(o))/864e5;return(n.targetId===t.customerId||n.customerId===t.customerId)&&Math.abs(n.amount-a)<2&&g<=7})||x.some(n=>{const i=m(n);if(!i||!o)return!1;const g=Math.abs(new Date(i)-new Date(o))/864e5;return n.customerId===t.customerId&&Math.abs(n.amount-a)<2&&g<=7})||(s[t.repId].paid+=a)}),b.forEach(t=>{!t.repId||!s[t.repId]||(s[t.repId].invCount++,s[t.repId].totalSales+=t.totalWithVat||t.total||0)}),u=Object.values(s),u.length===0){d.innerHTML='<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد بيانات مناديب</td></tr>';return}d.innerHTML=u.map(t=>{const a=t.totalSales-t.paid,o=t.target>0?t.totalSales/t.target*100:0,S=t.paid*(t.commRate/100),n=o>=100?"good":o>=70?"indigo":"warn";return`
        <tr>
          <td class="font-heading font-semibold">${t.name}</td>
          <td class="dim">${t.zone}</td>
          <td class="mono">${t.invCount}</td>
          <td class="mono font-bold">${p(t.totalSales)}</td>
          <td class="mono text-good">${p(t.paid)}</td>
          <td class="mono text-bad">${p(a)}</td>
          <td class="mono dim">${p(t.target)}</td>
          <td style="min-width:110px;">
            <div class="flex items-center gap-6">
              <div class="progress-bar" style="flex:1;">
                <div class="fill ${n}" style="width:${Math.min(o,100)}%;"></div>
              </div>
              <span class="mono text-${n}" style="font-size:10px;">${o.toFixed(0)}%</span>
            </div>
          </td>
          <td class="mono font-bold text-indigo">${p(S)}</td>
        </tr>`}).join("")}catch(e){d.innerHTML=`<tr><td colspan="9"><div class="alert bad" style="margin:8px;">${e.message}</div></td></tr>`}}window.exportSalesByRep=()=>{const d=[["المندوب","المنطقة","عدد الفواتير","المبيعات","المحصّل","المتبقي","الهدف","إنجاز%","العمولة"]];u.forEach(e=>{const l=e.totalSales-e.paid,h=e.target>0?e.totalSales/e.target*100:0,f=e.paid*(e.commRate/100);d.push([e.name,e.zone,e.invCount,e.totalSales,e.paid,l,e.target,h.toFixed(1)+"%",f.toFixed(2)])});const c=d.map(e=>e.map(l=>`"${l}"`).join(",")).join(`
`),r=document.createElement("a");r.href=URL.createObjectURL(new Blob(["\uFEFF"+c],{type:"text/csv"})),r.download=`sales_by_rep_${A()}.csv`,r.click(),showToast("تم التصدير","success")};export{q as render};
