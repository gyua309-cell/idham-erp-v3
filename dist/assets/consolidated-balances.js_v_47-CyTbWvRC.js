import{s as q,t as Q,g as b,C as h,d as j,a as tt,f as x}from"./index-CF9GFeRJ.js";import{collection as et}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let B=[];async function pt(s,o){s.innerHTML=`
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
        <input type="date" id="cb-from" class="form-control" value="${q()}" onchange="loadConsolidatedBalances()" />
      </div>
      <div class="date-range-group" style="display:flex; align-items:center; gap:6px;">
        <label style="font-size:11px; font-weight:bold; color:var(--text-2);">إلى</label>
        <input type="date" id="cb-to" class="form-control" value="${Q()}" onchange="loadConsolidatedBalances()" />
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
    </div>`,window.loadConsolidatedBalances=Y,window.filterConsolidatedReport=G,window.exportConsolidatedExcel=st,window.viewDetailedStatement=(r,d)=>{window._preselectedStatementEntity={id:r,type:d},typeof window.navigate=="function"?window.navigate(d==="supplier"?"supplier-statement":"customer-statement"):console.error("navigate function not found on window")},await Y()}function l(s){return s?s.toString().trim().toLowerCase().replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/\s+/g," "):""}function ot(s){if(s.status==="cancelled"||s.isReversed)return!1;const o=(s.sourceType||"").toLowerCase();if(o==="manual"||o==="opening"||o==="adjustment")return!0;if(s.auto===!0)return!1;const r=(s.refType||"").toLowerCase(),d=(s.description||"").toLowerCase();return!(o==="salesinvoice"||o==="sales"||o==="receipt"||o==="salesreturn"||o==="sales_return"||o==="salescogs"||o==="cogs"||o==="salesreturncogs"||o==="salesinvoice_cogs"||o==="collection"||o==="expense"||o==="supplierpayment"||o==="purchase"||o==="purchaseinvoice"||o==="purchasereturn"||o==="purchase_return"||r.includes("sales")||r.includes("receipt")||r.includes("invoice")||r.includes("return")||r.includes("expense")||d.includes("مبيعات")||d.includes("فاتورة")||d.includes("سند قبض")||d.includes("سند صرف")||d.includes("مرتجع")||d.includes("إشعار دائن")||d.includes("تصفية"))}async function Y(){const s=document.getElementById("cb-from")?.value||q(),o=document.getElementById("cb-to")?.value||Q(),r=document.getElementById("cb-period-label");r&&(r.textContent=`الفترة من ${s} إلى ${o}`);try{const[d,u,I,D,S,L,F,R,_,O,X]=await Promise.all([b(h.customers()),b(h.suppliers()),b(h.chartOfAccounts()),b(h.salesInvoices()),b(h.receipts()),b(h.purchaseInvoices()),b(h.expenses()),b(h.salesReturns()),b(h.purchaseReturns()),b(et(j,`companies/${tt}/collections`)),b(h.journalEntries())]),W=d.map(e=>({...e,entityType:"customer"})),V=u.map(e=>({...e,entityType:"supplier"})),f=I,P=D.filter(e=>e.status!=="cancelled"),$=S.filter(e=>e.status!=="cancelled"),H=L.filter(e=>e.status!=="cancelled"),M=F.filter(e=>e.status!=="cancelled"),K=R.filter(e=>e.status!=="cancelled"),i=_.filter(e=>e.status!=="cancelled"),v=O.filter(e=>e.status!=="cancelled"),Z=X.filter(ot);B=[];for(const e of W){if(!e.name||e.name==="undefined")continue;const c=l(e.name),w=new Set,N=new Set;e.id&&w.add(e.id),e.accountId&&w.add(e.accountId),e.accountCode&&N.add(e.accountCode),f.forEach(t=>{(t.sourceEntityId===e.id||t.code&&t.code===e.accountCode||t.name&&l(t.name)===c)&&(w.add(t.id),t.code&&N.add(t.code))});let p=parseFloat(e.openingBalance||0),g=0,m=0;P.filter(t=>t.customerId===e.id||t.customerName&&l(t.customerName)===c).forEach(t=>{const n=t.date||"",a=parseFloat(t.totalWithVat||t.total||0);n<s?p+=a:n<=o&&(g+=a)}),K.filter(t=>t.customerId===e.id||t.customerName&&l(t.customerName)===c).forEach(t=>{const n=t.date||"",a=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total!==void 0?t.total:t.subtotal||0);n<s?p-=a:n<=o&&(m+=a)}),v.filter(t=>t.customerId===e.id||t.customerName&&l(t.customerName)===c).forEach(t=>{const n=t.date||"",a=parseFloat(t.amount||0);n<s?p-=a:n<=o&&(m+=a)}),$.filter(t=>t.entityType==="supplier"?!1:t.targetId===e.id||t.customerId===e.id||t.customerName&&l(t.customerName)===c||t.accountName&&l(t.accountName)===c).forEach(t=>{const n=t.date||"",a=parseFloat(t.amount||0);n<s?p-=a:n<=o&&(m+=a)}),M.filter(t=>t.entityType!=="customer"?!1:t.targetId===e.id||t.customerId===e.id||t.customerName&&l(t.customerName)===c||t.accountName&&l(t.accountName)===c).forEach(t=>{const n=t.date||"",a=parseFloat(t.amount||0);n<s?p+=a:n<=o&&(g+=a)}),Z.forEach(t=>{(t.lines||[]).forEach(n=>{const a=n.accountId,C=n.accountCode,y=l(n.accountName);if(a&&w.has(a)||C&&N.has(C)||c&&y&&(y===c||y.includes(c)||c.includes(y))){const E=parseFloat(n.debit||0),T=parseFloat(n.credit||0);if(E===0&&T===0)return;const k=t.date||"";(t.description||"").includes("افتتاحي")||(n.note||"").includes("افتتاحي")||t.sourceType==="opening"||t.refType==="opening"||k&&k<s?p+=E-T:k<=o&&(g+=E,m+=T)}})});let J=Math.round((p+g-m)*100)/100,z=f.find(t=>t.id===e.accountId||t.code===e.accountCode)||f.find(t=>t.sourceEntityId===e.id&&t.sourceModule==="customers")||f.find(t=>t.name&&e.name&&l(t.name)===c&&(t.code.startsWith("1-1-2-1")||t.code.startsWith("1-1-2-1-2")));B.push({id:e.id,code:e.code||e.accountCode||(z?z.code:"-"),name:e.name,entityType:"customer",entityTypeName:"عميل",openBalance:Math.round(p*100)/100,periodDebit:Math.round(g*100)/100,periodCredit:Math.round(m*100)/100,closingBalance:J})}for(const e of V){if(!e.name||e.name==="undefined")continue;const c=l(e.name),w=new Set,N=new Set;e.id&&w.add(e.id),e.accountId&&w.add(e.accountId),e.accountCode&&N.add(e.accountCode),f.forEach(t=>{(t.sourceEntityId===e.id||t.code&&t.code===e.accountCode||t.name&&l(t.name)===c)&&(w.add(t.id),t.code&&N.add(t.code))});let p=parseFloat(e.openingBalance||0),g=0,m=0;H.filter(t=>t.supplierId===e.id||t.supplierName&&l(t.supplierName)===c).forEach(t=>{const n=t.date||"",a=parseFloat(t.totalWithVat||t.total||0);if(n<s?p+=a:n<=o&&(m+=a),t.paidAmount>0){const C=t.date||"";M.some(A=>(A.date||"")===C&&(A.targetId===e.id||A.supplierId===e.id)&&Math.abs((A.amount||0)-t.paidAmount)<.01)||(C<s?p-=t.paidAmount:C<=o&&(g+=t.paidAmount))}}),i.filter(t=>t.supplierId===e.id||t.supplierName&&l(t.supplierName)===c).forEach(t=>{const n=t.date||"",a=parseFloat(t.totalWithVat||0);n<s?p-=a:n<=o&&(g+=a)}),M.filter(t=>t.entityType==="customer"?!1:t.targetId===e.id||t.supplierId===e.id||t.supplierName&&l(t.supplierName)===c||t.accountName&&l(t.accountName)===c).forEach(t=>{const n=t.date||"",a=parseFloat(t.amount||0);n<s?p-=a:n<=o&&(g+=a)}),$.filter(t=>t.entityType&&t.entityType!=="supplier"?!1:t.targetId===e.id||t.supplierId===e.id||t.entityType==="supplier"&&(t.supplierName&&l(t.supplierName)===c||t.accountName&&l(t.accountName)===c)).forEach(t=>{const n=t.date||"",a=parseFloat(t.amount||0);n<s?p+=a:n<=o&&(m+=a)}),Z.forEach(t=>{(t.lines||[]).forEach(n=>{const a=n.accountId,C=n.accountCode,y=l(n.accountName);if(a&&w.has(a)||C&&N.has(C)||c&&y&&(y===c||y.includes(c)||c.includes(y))){const E=parseFloat(n.debit||0),T=parseFloat(n.credit||0);if(E===0&&T===0)return;const k=t.date||"";(t.description||"").includes("افتتاحي")||(n.note||"").includes("افتتاحي")||t.sourceType==="opening"||t.refType==="opening"||k&&k<s?p+=T-E:k<=o&&(g+=E,m+=T)}})});let J=Math.round((p+m-g)*100)/100,z=f.find(t=>t.id===e.accountId||t.code===e.accountCode)||f.find(t=>t.sourceEntityId===e.id&&t.sourceModule==="suppliers")||f.find(t=>t.name&&e.name&&l(t.name)===c&&t.code.startsWith("2-1-1"));B.push({id:e.id,code:e.code||e.accountCode||(z?z.code:"-"),name:e.name,entityType:"supplier",entityTypeName:"مورد",openBalance:Math.round(p*100)/100,periodDebit:Math.round(g*100)/100,periodCredit:Math.round(m*100)/100,closingBalance:J})}G()}catch(d){console.error("Failed to load consolidated balances:",d),window.showToast?.("خطأ في تحميل بيانات التقرير: "+d.message,"error")}}function G(){const s=document.getElementById("cb-type-filter")?.value||"all",o=(document.getElementById("cb-search")?.value||"").trim().toLowerCase(),r=document.getElementById("cb-hide-zero")?.checked??!0,d=B.filter(u=>{if(s!=="all"&&u.entityType!==s)return!1;if(o){const I=u.name.toLowerCase().includes(o),D=u.code.toLowerCase().includes(o);if(!I&&!D)return!1}return!(r&&Math.abs(u.closingBalance)<.01&&Math.abs(u.periodDebit)<.01&&Math.abs(u.periodCredit)<.01)});nt(d)}function nt(s){const o=document.getElementById("cb-tbody"),r=document.getElementById("cb-displayed-count");let d=0,u=0,I=0,D=0,S=0,L=0,F=0,R=0;B.forEach(i=>{i.entityType==="customer"?i.closingBalance>.01&&(d+=i.closingBalance,u++):i.entityType==="supplier"&&i.closingBalance>.01&&(I+=i.closingBalance,D++)}),r&&(r.textContent=`${s.length} حساب`);const _=document.getElementById("cb-kpi-cust-receivables");_&&(_.textContent=x(d));const O=document.getElementById("cb-kpi-cust-count");O&&(O.textContent=`${u} عميل مدين`);const X=document.getElementById("cb-kpi-supp-payables");X&&(X.textContent=x(I));const W=document.getElementById("cb-kpi-supp-count");W&&(W.textContent=`${D} مورد دائن`);const V=d-I,f=document.getElementById("cb-kpi-net-balance");f&&(f.textContent=x(V),f.className=V>=0?"mono font-bold text-indigo":"mono font-bold text-bad");const P=document.getElementById("cb-kpi-total-entities");if(P&&(P.textContent=`${B.length} كيان إجمالي`),!s||s.length===0){o.innerHTML=`
      <tr>
        <td colspan="8" style="text-align:center; padding:30px; color:var(--text-2);">
          لا توجد بيانات مطابقة لخيارات البحث أو الفلترة المحجوبة.
        </td>
      </tr>`;return}o.innerHTML=s.map(i=>{S+=i.openBalance,L+=i.periodDebit,F+=i.periodCredit,R+=i.closingBalance;let v="";i.entityType==="customer"?i.closingBalance>.01?v='<span class="badge badge-danger">مستحق عليه</span>':i.closingBalance<-.01?v='<span class="badge badge-success">رصيد دائن</span>':v='<span class="badge" style="background:var(--bg-3); color:var(--text-2);">متزن</span>':i.closingBalance>.01?v='<span class="badge badge-success">مستحق له</span>':i.closingBalance<-.01?v='<span class="badge badge-danger">رصيد مدين</span>':v='<span class="badge" style="background:var(--bg-3); color:var(--text-2);">متزن</span>';const Z=i.entityType==="customer"?'<span class="badge" style="background:rgba(91,127,255,0.1); color:var(--indigo); font-size:11px;">عميل</span>':'<span class="badge" style="background:rgba(16,185,129,0.1); color:var(--good); font-size:11px;">مورد</span>';return`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:10px 14px;" class="mono">${i.code}</td>
        <td style="padding:10px 14px; font-weight:bold;">
          <a href="javascript:void(0)" onclick="viewDetailedStatement('${i.id}', '${i.entityType}')" style="color:var(--primary); text-decoration:none; border-bottom:1px dashed var(--primary); padding-bottom:1px; cursor:pointer;" title="عرض كشف الحساب التفصيلي">
            ${i.name}
          </a>
        </td>
        <td style="padding:10px 14px;">${Z}</td>
        <td style="padding:10px 14px; text-align:left;" class="mono">${x(i.openBalance)}</td>
        <td style="padding:10px 14px; text-align:left;" class="mono text-indigo">${x(i.periodDebit)}</td>
        <td style="padding:10px 14px; text-align:left;" class="mono text-good">${x(i.periodCredit)}</td>
        <td style="padding:10px 14px; text-align:left; font-weight:bold;" class="mono ${i.closingBalance>0?"text-bad":i.closingBalance<0?"text-good":""}">
          ${x(i.closingBalance)}
        </td>
        <td style="padding:10px 14px; text-align:center;">${v}</td>
      </tr>`}).join("");const $=document.getElementById("cb-foot-open");$&&($.textContent=x(S));const H=document.getElementById("cb-foot-debit");H&&(H.textContent=x(L));const M=document.getElementById("cb-foot-credit");M&&(M.textContent=x(F));const K=document.getElementById("cb-foot-close");K&&(K.textContent=x(R))}function st(){if(!B||B.length===0){window.showToast?.("لا توجد بيانات للتصدير","warn");return}try{const s=B.map(o=>({"كود الحساب":o.code,"اسم الكيان":o.name,"نوع الحساب":o.entityTypeName,"رصيد بداية الفترة":o.openBalance,"مدين الفترة (+)":o.periodDebit,"دائن الفترة (-)":o.periodCredit,"رصيد نهاية الفترة":o.closingBalance}));if(window.XLSX){const o=window.XLSX.utils.json_to_sheet(s),r=window.XLSX.utils.book_new();window.XLSX.utils.book_append_sheet(r,o,"أرصدة العملاء والموردين"),window.XLSX.writeFile(r,`تقرير_أرصدة_العملاء_والموردين_${Q()}.xlsx`),window.showToast?.("تم تصدير ملف الإكسل بنجاح ✅","success")}else window.showToast?.("مكتبة Excel غير مثبتة","error")}catch(s){window.showToast?.("خطأ أثناء التصدير: "+s.message,"error")}}export{pt as render};
