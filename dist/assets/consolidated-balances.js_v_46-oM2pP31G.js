import{s as U,t as q,d as b,C as x,f as y}from"./index-BgjRa7f-.js";import{getDocs as h,collection as v}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let E=[];async function rt(a,o){a.innerHTML=`
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
        <input type="date" id="cb-from" class="form-control" value="${U()}" onchange="loadConsolidatedBalances()" />
      </div>
      <div class="date-range-group" style="display:flex; align-items:center; gap:6px;">
        <label style="font-size:11px; font-weight:bold; color:var(--text-2);">إلى</label>
        <input type="date" id="cb-to" class="form-control" value="${q()}" onchange="loadConsolidatedBalances()" />
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
    </div>`,window.loadConsolidatedBalances=G,window.filterConsolidatedReport=j,window.exportConsolidatedExcel=nt,window.viewDetailedStatement=(r,c)=>{window._preselectedStatementEntity={id:r,type:c},typeof window.navigate=="function"?window.navigate(c==="supplier"?"supplier-statement":"customer-statement"):console.error("navigate function not found on window")},await G()}function l(a){return a?a.toString().trim().toLowerCase().replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/\s+/g," "):""}function et(a){if(a.status==="cancelled"||a.isReversed)return!1;const o=(a.sourceType||"").toLowerCase();if(o==="manual"||o==="opening"||o==="adjustment")return!0;if(a.auto===!0)return!1;const r=(a.refType||"").toLowerCase(),c=(a.description||"").toLowerCase();return!(o==="salesinvoice"||o==="sales"||o==="receipt"||o==="salesreturn"||o==="sales_return"||o==="salescogs"||o==="cogs"||o==="salesreturncogs"||o==="salesinvoice_cogs"||o==="collection"||o==="expense"||o==="supplierpayment"||o==="purchase"||o==="purchaseinvoice"||o==="purchasereturn"||o==="purchase_return"||r.includes("sales")||r.includes("receipt")||r.includes("invoice")||r.includes("return")||r.includes("expense")||c.includes("مبيعات")||c.includes("فاتورة")||c.includes("سند قبض")||c.includes("سند صرف")||c.includes("مرتجع")||c.includes("إشعار دائن")||c.includes("تصفية"))}async function G(){const a=document.getElementById("cb-from")?.value||U(),o=document.getElementById("cb-to")?.value||q(),r=document.getElementById("cb-period-label");r&&(r.textContent=`الفترة من ${a} إلى ${o}`);try{const[c,u,N,M,F,R,_,X,O,W,V]=await Promise.all([h(v(b,`companies/${x}/customers`)),h(v(b,`companies/${x}/suppliers`)),h(v(b,`companies/${x}/chartOfAccounts`)),h(v(b,`companies/${x}/salesInvoices`)),h(v(b,`companies/${x}/receipts`)),h(v(b,`companies/${x}/purchaseInvoices`)),h(v(b,`companies/${x}/expenses`)),h(v(b,`companies/${x}/salesReturns`)),h(v(b,`companies/${x}/purchaseReturns`)),h(v(b,`companies/${x}/collections`)),h(v(b,`companies/${x}/journalEntries`))]),P=c.docs.map(e=>({id:e.id,...e.data(),entityType:"customer"})),H=u.docs.map(e=>({id:e.id,...e.data(),entityType:"supplier"})),f=N.docs.map(e=>({id:e.id,...e.data()})),K=M.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.status!=="cancelled"),z=F.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.status!=="cancelled"),Z=R.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.status!=="cancelled"),A=_.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.status!=="cancelled"),J=X.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.status!=="cancelled"),i=O.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.status!=="cancelled"),C=W.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.status!=="cancelled"),Q=V.docs.map(e=>({id:e.id,...e.data()})).filter(et);E=[];for(const e of P){if(!e.name||e.name==="undefined")continue;const d=l(e.name),B=new Set,k=new Set;e.id&&B.add(e.id),e.accountId&&B.add(e.accountId),e.accountCode&&k.add(e.accountCode),f.forEach(t=>{(t.sourceEntityId===e.id||t.code&&t.code===e.accountCode||t.name&&l(t.name)===d)&&(B.add(t.id),t.code&&k.add(t.code))});let p=parseFloat(e.openingBalance||0),m=0,g=0;K.filter(t=>t.customerId===e.id||t.customerName&&l(t.customerName)===d).forEach(t=>{const n=t.date||"",s=parseFloat(t.totalWithVat||t.total||0);n<a?p+=s:n<=o&&(m+=s)}),J.filter(t=>t.customerId===e.id||t.customerName&&l(t.customerName)===d).forEach(t=>{const n=t.date||"",s=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total!==void 0?t.total:t.subtotal||0);n<a?p-=s:n<=o&&(g+=s)}),C.filter(t=>t.customerId===e.id||t.customerName&&l(t.customerName)===d).forEach(t=>{const n=t.date||"",s=parseFloat(t.amount||0);n<a?p-=s:n<=o&&(g+=s)}),z.filter(t=>t.entityType==="supplier"?!1:t.targetId===e.id||t.customerId===e.id||t.customerName&&l(t.customerName)===d||t.accountName&&l(t.accountName)===d).forEach(t=>{const n=t.date||"",s=parseFloat(t.amount||0);n<a?p-=s:n<=o&&(g+=s)}),A.filter(t=>t.entityType!=="customer"?!1:t.targetId===e.id||t.customerId===e.id||t.customerName&&l(t.customerName)===d||t.accountName&&l(t.accountName)===d).forEach(t=>{const n=t.date||"",s=parseFloat(t.amount||0);n<a?p+=s:n<=o&&(m+=s)}),Q.forEach(t=>{(t.lines||[]).forEach(n=>{const s=n.accountId,I=n.accountCode,w=l(n.accountName);if(s&&B.has(s)||I&&k.has(I)||d&&w&&(w===d||w.includes(d)||d.includes(w))){const T=parseFloat(n.debit||0),$=parseFloat(n.credit||0);if(T===0&&$===0)return;const S=t.date||"";(t.description||"").includes("افتتاحي")||(n.note||"").includes("افتتاحي")||t.sourceType==="opening"||t.refType==="opening"||S&&S<a?p+=T-$:S<=o&&(m+=T,g+=$)}})});let Y=Math.round((p+m-g)*100)/100,L=f.find(t=>t.id===e.accountId||t.code===e.accountCode)||f.find(t=>t.sourceEntityId===e.id&&t.sourceModule==="customers")||f.find(t=>t.name&&e.name&&l(t.name)===d&&(t.code.startsWith("1-1-2-1")||t.code.startsWith("1-1-2-1-2")));E.push({id:e.id,code:e.code||e.accountCode||(L?L.code:"-"),name:e.name,entityType:"customer",entityTypeName:"عميل",openBalance:Math.round(p*100)/100,periodDebit:Math.round(m*100)/100,periodCredit:Math.round(g*100)/100,closingBalance:Y})}for(const e of H){if(!e.name||e.name==="undefined")continue;const d=l(e.name),B=new Set,k=new Set;e.id&&B.add(e.id),e.accountId&&B.add(e.accountId),e.accountCode&&k.add(e.accountCode),f.forEach(t=>{(t.sourceEntityId===e.id||t.code&&t.code===e.accountCode||t.name&&l(t.name)===d)&&(B.add(t.id),t.code&&k.add(t.code))});let p=parseFloat(e.openingBalance||0),m=0,g=0;Z.filter(t=>t.supplierId===e.id||t.supplierName&&l(t.supplierName)===d).forEach(t=>{const n=t.date||"",s=parseFloat(t.totalWithVat||t.total||0);if(n<a?p+=s:n<=o&&(g+=s),t.paidAmount>0){const I=t.date||"";A.some(D=>(D.date||"")===I&&(D.targetId===e.id||D.supplierId===e.id)&&Math.abs((D.amount||0)-t.paidAmount)<.01)||(I<a?p-=t.paidAmount:I<=o&&(m+=t.paidAmount))}}),i.filter(t=>t.supplierId===e.id||t.supplierName&&l(t.supplierName)===d).forEach(t=>{const n=t.date||"",s=parseFloat(t.totalWithVat||0);n<a?p-=s:n<=o&&(m+=s)}),A.filter(t=>t.entityType==="customer"?!1:t.targetId===e.id||t.supplierId===e.id||t.supplierName&&l(t.supplierName)===d||t.accountName&&l(t.accountName)===d).forEach(t=>{const n=t.date||"",s=parseFloat(t.amount||0);n<a?p-=s:n<=o&&(m+=s)}),z.filter(t=>t.entityType&&t.entityType!=="supplier"?!1:t.targetId===e.id||t.supplierId===e.id||t.entityType==="supplier"&&(t.supplierName&&l(t.supplierName)===d||t.accountName&&l(t.accountName)===d)).forEach(t=>{const n=t.date||"",s=parseFloat(t.amount||0);n<a?p+=s:n<=o&&(g+=s)}),Q.forEach(t=>{(t.lines||[]).forEach(n=>{const s=n.accountId,I=n.accountCode,w=l(n.accountName);if(s&&B.has(s)||I&&k.has(I)||d&&w&&(w===d||w.includes(d)||d.includes(w))){const T=parseFloat(n.debit||0),$=parseFloat(n.credit||0);if(T===0&&$===0)return;const S=t.date||"";(t.description||"").includes("افتتاحي")||(n.note||"").includes("افتتاحي")||t.sourceType==="opening"||t.refType==="opening"||S&&S<a?p+=$-T:S<=o&&(m+=T,g+=$)}})});let Y=Math.round((p+g-m)*100)/100,L=f.find(t=>t.id===e.accountId||t.code===e.accountCode)||f.find(t=>t.sourceEntityId===e.id&&t.sourceModule==="suppliers")||f.find(t=>t.name&&e.name&&l(t.name)===d&&t.code.startsWith("2-1-1"));E.push({id:e.id,code:e.code||e.accountCode||(L?L.code:"-"),name:e.name,entityType:"supplier",entityTypeName:"مورد",openBalance:Math.round(p*100)/100,periodDebit:Math.round(m*100)/100,periodCredit:Math.round(g*100)/100,closingBalance:Y})}j()}catch(c){console.error("Failed to load consolidated balances:",c),window.showToast?.("خطأ في تحميل بيانات التقرير: "+c.message,"error")}}function j(){const a=document.getElementById("cb-type-filter")?.value||"all",o=(document.getElementById("cb-search")?.value||"").trim().toLowerCase(),r=document.getElementById("cb-hide-zero")?.checked??!0,c=E.filter(u=>{if(a!=="all"&&u.entityType!==a)return!1;if(o){const N=u.name.toLowerCase().includes(o),M=u.code.toLowerCase().includes(o);if(!N&&!M)return!1}return!(r&&Math.abs(u.closingBalance)<.01&&Math.abs(u.periodDebit)<.01&&Math.abs(u.periodCredit)<.01)});ot(c)}function ot(a){const o=document.getElementById("cb-tbody"),r=document.getElementById("cb-displayed-count");let c=0,u=0,N=0,M=0,F=0,R=0,_=0,X=0;E.forEach(i=>{i.entityType==="customer"?i.closingBalance>.01&&(c+=i.closingBalance,u++):i.entityType==="supplier"&&i.closingBalance>.01&&(N+=i.closingBalance,M++)}),r&&(r.textContent=`${a.length} حساب`);const O=document.getElementById("cb-kpi-cust-receivables");O&&(O.textContent=y(c));const W=document.getElementById("cb-kpi-cust-count");W&&(W.textContent=`${u} عميل مدين`);const V=document.getElementById("cb-kpi-supp-payables");V&&(V.textContent=y(N));const P=document.getElementById("cb-kpi-supp-count");P&&(P.textContent=`${M} مورد دائن`);const H=c-N,f=document.getElementById("cb-kpi-net-balance");f&&(f.textContent=y(H),f.className=H>=0?"mono font-bold text-indigo":"mono font-bold text-bad");const K=document.getElementById("cb-kpi-total-entities");if(K&&(K.textContent=`${E.length} كيان إجمالي`),!a||a.length===0){o.innerHTML=`
      <tr>
        <td colspan="8" style="text-align:center; padding:30px; color:var(--text-2);">
          لا توجد بيانات مطابقة لخيارات البحث أو الفلترة المحجوبة.
        </td>
      </tr>`;return}o.innerHTML=a.map(i=>{F+=i.openBalance,R+=i.periodDebit,_+=i.periodCredit,X+=i.closingBalance;let C="";i.entityType==="customer"?i.closingBalance>.01?C='<span class="badge badge-danger">مستحق عليه</span>':i.closingBalance<-.01?C='<span class="badge badge-success">رصيد دائن</span>':C='<span class="badge" style="background:var(--bg-3); color:var(--text-2);">متزن</span>':i.closingBalance>.01?C='<span class="badge badge-success">مستحق له</span>':i.closingBalance<-.01?C='<span class="badge badge-danger">رصيد مدين</span>':C='<span class="badge" style="background:var(--bg-3); color:var(--text-2);">متزن</span>';const Q=i.entityType==="customer"?'<span class="badge" style="background:rgba(91,127,255,0.1); color:var(--indigo); font-size:11px;">عميل</span>':'<span class="badge" style="background:rgba(16,185,129,0.1); color:var(--good); font-size:11px;">مورد</span>';return`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:10px 14px;" class="mono">${i.code}</td>
        <td style="padding:10px 14px; font-weight:bold;">
          <a href="javascript:void(0)" onclick="viewDetailedStatement('${i.id}', '${i.entityType}')" style="color:var(--primary); text-decoration:none; border-bottom:1px dashed var(--primary); padding-bottom:1px; cursor:pointer;" title="عرض كشف الحساب التفصيلي">
            ${i.name}
          </a>
        </td>
        <td style="padding:10px 14px;">${Q}</td>
        <td style="padding:10px 14px; text-align:left;" class="mono">${y(i.openBalance)}</td>
        <td style="padding:10px 14px; text-align:left;" class="mono text-indigo">${y(i.periodDebit)}</td>
        <td style="padding:10px 14px; text-align:left;" class="mono text-good">${y(i.periodCredit)}</td>
        <td style="padding:10px 14px; text-align:left; font-weight:bold;" class="mono ${i.closingBalance>0?"text-bad":i.closingBalance<0?"text-good":""}">
          ${y(i.closingBalance)}
        </td>
        <td style="padding:10px 14px; text-align:center;">${C}</td>
      </tr>`}).join("");const z=document.getElementById("cb-foot-open");z&&(z.textContent=y(F));const Z=document.getElementById("cb-foot-debit");Z&&(Z.textContent=y(R));const A=document.getElementById("cb-foot-credit");A&&(A.textContent=y(_));const J=document.getElementById("cb-foot-close");J&&(J.textContent=y(X))}function nt(){if(!E||E.length===0){window.showToast?.("لا توجد بيانات للتصدير","warn");return}try{const a=E.map(o=>({"كود الحساب":o.code,"اسم الكيان":o.name,"نوع الحساب":o.entityTypeName,"رصيد بداية الفترة":o.openBalance,"مدين الفترة (+)":o.periodDebit,"دائن الفترة (-)":o.periodCredit,"رصيد نهاية الفترة":o.closingBalance}));if(window.XLSX){const o=window.XLSX.utils.json_to_sheet(a),r=window.XLSX.utils.book_new();window.XLSX.utils.book_append_sheet(r,o,"أرصدة العملاء والموردين"),window.XLSX.writeFile(r,`تقرير_أرصدة_العملاء_والموردين_${q()}.xlsx`),window.showToast?.("تم تصدير ملف الإكسل بنجاح ✅","success")}else window.showToast?.("مكتبة Excel غير مثبتة","error")}catch(a){window.showToast?.("خطأ أثناء التصدير: "+a.message,"error")}}export{rt as render};
