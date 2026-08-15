import{s as V,t as N,d as f,a as g,f as p}from"./index-HrCilPJ3.js";import{getDocs as u,collection as b}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let h=[];async function tt(n,a){n.innerHTML=`
    <div class="filterbar no-print flex flex-wrap gap-12 items-center" style="padding:14px 20px; background:var(--bg-1); border-bottom:1px solid var(--border-soft);">
      <!-- Entity Type Selector -->
      <div class="filter-select-group" style="min-width:150px;">
        <label style="font-size:11px; font-weight:bold; color:var(--text-2); margin-bottom:4px; display:block;">نوع الكيان</label>
        <select id="cb-type-filter" class="form-control" onchange="filterConsolidatedReport()">
          <option value="all">الكل (عملاء وموردين)</option>
          <option value="customer">العملاء فقط</option>
          <option value="supplier">الموردين فقط</option>
        </select>
      </div>

      <!-- Date Range Filters -->
      <div class="date-range-group" style="display:flex; align-items:center; gap:6px;">
        <label style="font-size:11px; font-weight:bold; color:var(--text-2);">من</label>
        <input type="date" id="cb-from" class="form-control" value="${V()}" onchange="loadConsolidatedBalances()" />
      </div>
      <div class="date-range-group" style="display:flex; align-items:center; gap:6px;">
        <label style="font-size:11px; font-weight:bold; color:var(--text-2);">إلى</label>
        <input type="date" id="cb-to" class="form-control" value="${N()}" onchange="loadConsolidatedBalances()" />
      </div>

      <!-- Quick Search -->
      <div style="min-width:200px;">
        <label style="font-size:11px; font-weight:bold; color:var(--text-2); margin-bottom:4px; display:block;">بحث سريع</label>
        <input type="text" id="cb-search" class="form-control" placeholder="ابحث باسم الكيان أو الكود..." oninput="filterConsolidatedReport()" />
      </div>

      <!-- Hide Zero Balances Checkbox -->
      <div style="display:flex; align-items:center; gap:6px; margin-top:16px;">
        <input type="checkbox" id="cb-hide-zero" onchange="filterConsolidatedReport()" checked />
        <label for="cb-hide-zero" style="font-size:12px; cursor:pointer;">إخفاء الأرصدة الصفريّة</label>
      </div>

      <!-- Export & Refresh Buttons -->
      <div style="margin-right:auto; display:flex; gap:8px; align-items:flex-end;">
        <button class="btn btn-secondary btn-sm" onclick="exportConsolidatedExcel()" title="تصدير إكسل">📊 إكسل</button>
        <button class="btn btn-secondary btn-sm" onclick="window.print()" title="طباعة">🖨️ طباعة</button>
        <button class="btn btn-primary btn-sm" onclick="loadConsolidatedBalances()" title="تحديث البيانات">🔄 تحديث</button>
      </div>
    </div>

    <div class="page-content" style="padding:20px;">
      <!-- KPI Summary Banner -->
      <div class="grid-3 gap-16 mb-20">
        <!-- Card 1: Total Customer Receivables -->
        <div class="card" style="padding:16px; border-right:4px solid var(--bad);">
          <div class="text-2 mb-4" style="font-size:12px;">إجمالي ديون العملاء (مستحق للمنشأة)</div>
          <div class="mono font-bold text-bad" style="font-size:22px;" id="cb-kpi-cust-receivables">0.00 ر.س</div>
          <div class="text-dim" style="font-size:11px; margin-top:4px;" id="cb-kpi-cust-count">0 عميل مدين</div>
        </div>

        <!-- Card 2: Total Supplier Payables -->
        <div class="card" style="padding:16px; border-right:4px solid var(--good);">
          <div class="text-2 mb-4" style="font-size:12px;">إجمالي مستحقات الموردين (التزامات)</div>
          <div class="mono font-bold text-good" style="font-size:22px;" id="cb-kpi-supp-payables">0.00 ر.س</div>
          <div class="text-dim" style="font-size:11px; margin-top:4px;" id="cb-kpi-supp-count">0 مورد دائن</div>
        </div>

        <!-- Card 3: Net Working Balance -->
        <div class="card" style="padding:16px; border-right:4px solid var(--indigo);">
          <div class="text-2 mb-4" style="font-size:12px;">صافي رصيد الذمم المجمع</div>
          <div class="mono font-bold text-indigo" style="font-size:22px;" id="cb-kpi-net-balance">0.00 ر.س</div>
          <div class="text-dim" style="font-size:11px; margin-top:4px;" id="cb-kpi-total-entities">0 كيان إجمالي</div>
        </div>
      </div>

      <!-- Main Data Table Card -->
      <div class="card">
        <div class="card-header flex justify-between items-center" style="padding:16px 20px; border-bottom:1px solid var(--border-soft);">
          <div>
            <h2 style="font-family:var(--font-heading); font-size:16px; margin:0;" id="cb-table-title">تقرير أرصدة العملاء والموردين المجمع</h2>
            <div class="text-dim" style="font-size:12px; margin-top:2px;" id="cb-period-label">الفترة: --</div>
          </div>
          <div class="badge badge-info" id="cb-displayed-count" style="font-size:12px; padding:4px 10px;">0 حساب</div>
        </div>

        <div class="table-container">
          <table class="data-dense" id="cb-table" style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:var(--bg-2); text-align:right;">
                <th style="padding:10px 14px;">كود الحساب</th>
                <th style="padding:10px 14px;">اسم الكيان</th>
                <th style="padding:10px 14px;">نوع الحساب</th>
                <th style="padding:10px 14px; text-align:left;">رصيد بداية الفترة</th>
                <th style="padding:10px 14px; text-align:left;">حركات مدين (Debit)</th>
                <th style="padding:10px 14px; text-align:left;">حركات دائن (Credit)</th>
                <th style="padding:10px 14px; text-align:left;">رصيد نهاية الفترة</th>
                <th style="padding:10px 14px; text-align:center;">الحالة</th>
              </tr>
            </thead>
            <tbody id="cb-tbody">
              ${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:14px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
            <tfoot id="cb-tfoot" style="background:var(--bg-2); font-weight:bold; border-top:2px solid var(--border-soft);">
              <tr>
                <td colspan="3" style="padding:12px 14px;">الإجمالي العام للتقرير</td>
                <td style="padding:12px 14px; text-align:left;" class="mono" id="cb-foot-open">0.00 ر.س</td>
                <td style="padding:12px 14px; text-align:left;" class="mono text-indigo" id="cb-foot-debit">0.00 ر.س</td>
                <td style="padding:12px 14px; text-align:left;" class="mono text-good" id="cb-foot-credit">0.00 ر.س</td>
                <td style="padding:12px 14px; text-align:left;" class="mono" id="cb-foot-close">0.00 ر.س</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>`,window.loadConsolidatedBalances=j,window.filterConsolidatedReport=O,window.exportConsolidatedExcel=H,window.viewDetailedStatement=(l,c)=>{window._preselectedStatementEntity={id:l,type:c},typeof window.navigate=="function"?window.navigate("report-customer-statement"):console.error("navigate function not found on window")},await j()}async function j(){const n=document.getElementById("cb-from")?.value||V(),a=document.getElementById("cb-to")?.value||N(),l=document.getElementById("cb-period-label");l&&(l.textContent=`الفترة من ${n} إلى ${a}`);try{const[c,r,v,w,I,k,$,T,S,D]=await Promise.all([u(b(f,`companies/${g}/customers`)),u(b(f,`companies/${g}/suppliers`)),u(b(f,`companies/${g}/chartOfAccounts`)),u(b(f,`companies/${g}/salesInvoices`)),u(b(f,`companies/${g}/receipts`)),u(b(f,`companies/${g}/purchaseInvoices`)),u(b(f,`companies/${g}/expenses`)),u(b(f,`companies/${g}/salesReturns`)),u(b(f,`companies/${g}/purchaseReturns`)),u(b(f,`companies/${g}/collections`))]),M=c.docs.map(t=>({id:t.id,...t.data(),entityType:"customer"})),z=r.docs.map(t=>({id:t.id,...t.data(),entityType:"supplier"})),x=v.docs.map(t=>({id:t.id,...t.data()})),C=w.docs.map(t=>({id:t.id,...t.data()})).filter(t=>t.status!=="cancelled"),L=I.docs.map(t=>({id:t.id,...t.data()})),R=k.docs.map(t=>({id:t.id,...t.data()})).filter(t=>t.status!=="cancelled"),B=$.docs.map(t=>({id:t.id,...t.data()})),F=T.docs.map(t=>({id:t.id,...t.data()})).filter(t=>t.status!=="cancelled"),_=S.docs.map(t=>({id:t.id,...t.data()})).filter(t=>t.status!=="cancelled"),o=D.docs.map(t=>({id:t.id,...t.data()}));h=[];for(const t of M){if(!t.name||t.name==="undefined")continue;let d=parseFloat(t.openingBalance||0),m=0,y=0;C.filter(e=>e.customerId===t.id).forEach(e=>{const s=e.date||"",i=parseFloat(e.totalWithVat||e.total||0);s<n?d+=i:s<=a&&(m+=i)}),F.filter(e=>e.customerId===t.id).forEach(e=>{const s=e.date||"",i=parseFloat(e.totalWithVat||0);s<n?d-=i:s<=a&&(y+=i)}),o.filter(e=>e.customerId===t.id).forEach(e=>{const s=e.date||"",i=parseFloat(e.amount||0);s<n?d-=i:s<=a&&(y+=i)}),L.filter(e=>e.targetId===t.id&&e.entityType==="customer").forEach(e=>{const s=e.date||"",i=parseFloat(e.amount||0);s<n?d-=i:s<=a&&(y+=i)});let A=Math.round((d+m-y)*100)/100,E=x.find(e=>e.id===t.accountId||e.code===t.accountCode)||x.find(e=>e.sourceEntityId===t.id&&e.sourceModule==="customers")||x.find(e=>e.name&&t.name&&e.name.includes(t.name)&&(e.code.startsWith("1-1-2-1")||e.code.startsWith("1-1-2-1-2")));h.push({id:t.id,code:t.code||t.accountCode||(E?E.code:"-"),name:t.name,entityType:"customer",entityTypeName:"عميل",openBalance:Math.round(d*100)/100,periodDebit:Math.round(m*100)/100,periodCredit:Math.round(y*100)/100,closingBalance:A})}for(const t of z){if(!t.name||t.name==="undefined")continue;let d=parseFloat(t.openingBalance||0),m=0,y=0;R.filter(e=>e.supplierId===t.id).forEach(e=>{const s=e.date||"",i=parseFloat(e.totalWithVat||e.total||0);if(s<n?d+=i:s<=a&&(y+=i),e.paidAmount>0){const X=e.date||"";B.some(W=>(W.date||"")===X&&W.targetId===t.id&&Math.abs((W.amount||0)-e.paidAmount)<.01)||(X<n?d-=e.paidAmount:X<=a&&(m+=e.paidAmount))}}),_.filter(e=>e.supplierId===t.id).forEach(e=>{const s=e.date||"",i=parseFloat(e.totalWithVat||0);s<n?d-=i:s<=a&&(m+=i)}),B.filter(e=>e.targetId===t.id&&e.entityType==="supplier").forEach(e=>{const s=e.date||"",i=parseFloat(e.amount||0);s<n?d-=i:s<=a&&(m+=i)});let A=Math.round((d+y-m)*100)/100,E=x.find(e=>e.id===t.accountId||e.code===t.accountCode)||x.find(e=>e.sourceEntityId===t.id&&e.sourceModule==="suppliers")||x.find(e=>e.name&&t.name&&e.name.includes(t.name)&&e.code.startsWith("2-1-1"));h.push({id:t.id,code:t.code||t.accountCode||(E?E.code:"-"),name:t.name,entityType:"supplier",entityTypeName:"مورد",openBalance:Math.round(d*100)/100,periodDebit:Math.round(m*100)/100,periodCredit:Math.round(y*100)/100,closingBalance:A})}O()}catch(c){console.error("Failed to load consolidated balances:",c),window.showToast?.("خطأ في تحميل بيانات التقرير: "+c.message,"error")}}function O(){const n=document.getElementById("cb-type-filter")?.value||"all",a=(document.getElementById("cb-search")?.value||"").trim().toLowerCase(),l=document.getElementById("cb-hide-zero")?.checked??!0,c=h.filter(r=>{if(n!=="all"&&r.entityType!==n)return!1;if(a){const v=r.name.toLowerCase().includes(a),w=r.code.toLowerCase().includes(a);if(!v&&!w)return!1}return!(l&&Math.abs(r.closingBalance)<.01&&Math.abs(r.periodDebit)<.01&&Math.abs(r.periodCredit)<.01)});P(c)}function P(n){const a=document.getElementById("cb-tbody"),l=document.getElementById("cb-displayed-count");let c=0,r=0,v=0,w=0,I=0,k=0,$=0,T=0;h.forEach(o=>{o.entityType==="customer"?o.closingBalance>.01&&(c+=o.closingBalance,r++):o.entityType==="supplier"&&o.closingBalance>.01&&(v+=o.closingBalance,w++)}),l&&(l.textContent=`${n.length} حساب`);const S=document.getElementById("cb-kpi-cust-receivables");S&&(S.textContent=p(c));const D=document.getElementById("cb-kpi-cust-count");D&&(D.textContent=`${r} عميل مدين`);const M=document.getElementById("cb-kpi-supp-payables");M&&(M.textContent=p(v));const z=document.getElementById("cb-kpi-supp-count");z&&(z.textContent=`${w} مورد دائن`);const x=c-v,C=document.getElementById("cb-kpi-net-balance");C&&(C.textContent=p(x),C.className=x>=0?"mono font-bold text-indigo":"mono font-bold text-bad");const L=document.getElementById("cb-kpi-total-entities");if(L&&(L.textContent=`${h.length} كيان إجمالي`),!n||n.length===0){a.innerHTML=`
      <tr>
        <td colspan="8" style="text-align:center; padding:30px; color:var(--text-2);">
          لا توجد بيانات مطابقة لخيارات البحث أو الفلترة المحجوبة.
        </td>
      </tr>`;return}a.innerHTML=n.map(o=>{I+=o.openBalance,k+=o.periodDebit,$+=o.periodCredit,T+=o.closingBalance;let t="";o.entityType==="customer"?o.closingBalance>.01?t='<span class="badge badge-danger">مستحق عليه</span>':o.closingBalance<-.01?t='<span class="badge badge-success">رصيد دائن</span>':t='<span class="badge" style="background:var(--bg-3); color:var(--text-2);">متزن</span>':o.closingBalance>.01?t='<span class="badge badge-success">مستحق له</span>':o.closingBalance<-.01?t='<span class="badge badge-danger">رصيد مدين</span>':t='<span class="badge" style="background:var(--bg-3); color:var(--text-2);">متزن</span>';const d=o.entityType==="customer"?'<span class="badge" style="background:rgba(91,127,255,0.1); color:var(--indigo); font-size:11px;">عميل</span>':'<span class="badge" style="background:rgba(16,185,129,0.1); color:var(--good); font-size:11px;">مورد</span>';return`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:10px 14px;" class="mono">${o.code}</td>
        <td style="padding:10px 14px; font-weight:bold;">
          <a href="javascript:void(0)" onclick="viewDetailedStatement('${o.id}', '${o.entityType}')" style="color:var(--primary); text-decoration:none; border-bottom:1px dashed var(--primary); padding-bottom:1px; cursor:pointer;" title="عرض كشف الحساب التفصيلي">
            ${o.name}
          </a>
        </td>
        <td style="padding:10px 14px;">${d}</td>
        <td style="padding:10px 14px; text-align:left;" class="mono">${p(o.openBalance)}</td>
        <td style="padding:10px 14px; text-align:left;" class="mono text-indigo">${p(o.periodDebit)}</td>
        <td style="padding:10px 14px; text-align:left;" class="mono text-good">${p(o.periodCredit)}</td>
        <td style="padding:10px 14px; text-align:left; font-weight:bold;" class="mono ${o.closingBalance>0?"text-bad":o.closingBalance<0?"text-good":""}">
          ${p(o.closingBalance)}
        </td>
        <td style="padding:10px 14px; text-align:center;">${t}</td>
      </tr>`}).join("");const R=document.getElementById("cb-foot-open");R&&(R.textContent=p(I));const B=document.getElementById("cb-foot-debit");B&&(B.textContent=p(k));const F=document.getElementById("cb-foot-credit");F&&(F.textContent=p($));const _=document.getElementById("cb-foot-close");_&&(_.textContent=p(T))}function H(){if(!h||h.length===0){window.showToast?.("لا توجد بيانات للتصدير","warn");return}try{const n=h.map(a=>({"كود الحساب":a.code,"اسم الكيان":a.name,"نوع الحساب":a.entityTypeName,"رصيد بداية الفترة":a.openBalance,"مدين الفترة (+)":a.periodDebit,"دائن الفترة (-)":a.periodCredit,"رصيد نهاية الفترة":a.closingBalance}));if(window.XLSX){const a=window.XLSX.utils.json_to_sheet(n),l=window.XLSX.utils.book_new();window.XLSX.utils.book_append_sheet(l,a,"أرصدة العملاء والموردين"),window.XLSX.writeFile(l,`تقرير_أرصدة_العملاء_والموردين_${N()}.xlsx`),window.showToast?.("تم تصدير ملف الإكسل بنجاح ✅","success")}else window.showToast?.("مكتبة Excel غير مثبتة","error")}catch(n){window.showToast?.("خطأ أثناء التصدير: "+n.message,"error")}}export{tt as render};
