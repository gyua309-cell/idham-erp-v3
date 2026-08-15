const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/balance-sync-B0nwXHmR.js","assets/index-HrCilPJ3.js","assets/index-BTgEPYae.css","assets/sync-engine-CjRafMpJ.js"])))=>i.map(i=>d[i]);
import{t as T,C as p,b as B,f as u,g as f,p as P,d as C,a as A,B as M,x as H,n as F,v as O,_ as R}from"./index-HrCilPJ3.js";import{autoSalesReturnJE as V}from"./accounting-engine-BmLox5ep.js";import{query as w,orderBy as h,limit as N,getDocs as I,doc as z,getDoc as Q,where as W}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let c=[],r=null;async function st(e,t){e.innerHTML=`
    <div class="filterbar" style="flex-wrap: wrap; gap: 8px; align-items: flex-end;">
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="sr-from" value="${new Date(new Date().setDate(1)).toISOString().split("T")[0]}" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="sr-to" value="${T()}" />
      </div>
      <div class="filter-select-group">
        <label>العميل</label>
        <select id="sr-customer-filter" onchange="loadSalesReturnsList()">
          <option value="">كل العملاء</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>المستودع</label>
        <select id="sr-warehouse-filter" onchange="loadSalesReturnsList()">
          <option value="">كل المستودعات</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn-export" onclick="exportPagePDF('.data-dense','مردودات_المبيعات')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportPageExcel('.data-dense','مردودات_المبيعات')" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn btn-primary" onclick="openSalesReturnModal()">+ مردود مبيعات جديد (إشعار دائن)</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">مردودات المبيعات والإشعارات الدائنة</h1>
        <p class="page-subtitle">إرجاع البضائع للمخازن وإصدار إشعارات دائنة متوافقة مع ZATCA</p>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>رقم الإشعار الدائن</th>
                <th>التاريخ</th>
                <th>رقم الفاتورة الأصلية</th>
                <th>العميل</th>
                <th>المخزن المستلم</th>
                <th>إجمالي المردود</th>
                <th>VAT 15%</th>
                <th>الصافي</th>
                <th>ZATCA</th>
              </tr>
            </thead>
            <tbody id="sr-tbody">
              ${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(9).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Sales Return Modal -->
    <div class="modal-overlay" id="sr-modal">
      <div class="modal modal-xl">
        <div class="modal-header">
          <h3 class="modal-title">إصدار إشعار دائن (مردود مبيعات)</h3>
          <button class="modal-close" onclick="closeModal('sr-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group">
              <label>رقم الفاتورة الأصلية *</label>
              <div class="autocomplete-container">
                <input type="text" id="sr-inv-search" class="input mono" placeholder="ادخل رقم الفاتورة..." autocomplete="off" />
                <div class="autocomplete-results hidden" id="sr-inv-results"></div>
              </div>
            </div>
            <div class="form-group">
              <label>رقم الإشعار الدائن</label>
              <input type="text" id="sr-number" class="input mono" readonly placeholder="يُولّد تلقائياً" />
            </div>
            <div class="form-group">
              <label>التاريخ *</label>
              <input type="date" id="sr-date" class="input" value="${T()}" />
            </div>
          </div>

          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>العميل</label>
              <input type="text" id="sr-cust-name" class="input" readonly placeholder="يتم تحديده من الفاتورة" />
            </div>
            <div class="form-group">
              <label>المخزن المستلم للبضاعة المرجعة *</label>
              <select id="sr-warehouse"><option value="">اختر المخزن</option></select>
            </div>
          </div>

          <div class="form-group mb-16">
            <label>سبب الإرجاع *</label>
            <input type="text" id="sr-reason" class="input" placeholder="مثال: تلف بالعبوة، زيادة بالطلب، انتهاء صلاحية..." />
          </div>

          <div class="divider-label">بنود الفاتورة المرجعة</div>

          <div class="invoice-lines">
            <table style="width:100%;font-size:12.5px;">
              <thead>
                <tr style="background:var(--bg-2);">
                  <th style="padding:8px 10px;">#</th>
                  <th style="padding:8px 10px;">الصنف</th>
                  <th style="padding:8px 10px;">الكمية الأصلية</th>
                  <th style="padding:8px 10px;">الكمية المرجعة</th>
                  <th style="padding:8px 10px;">السعر الأصلي</th>
                  <th style="padding:8px 10px;">الإجمالي المرجع</th>
                </tr>
              </thead>
              <tbody id="sr-lines-tbody">
                <tr><td colspan="6" style="text-align:center;padding:16px;color:var(--text-2);">حدد الفاتورة الأصلية أولاً</td></tr>
              </tbody>
            </table>
          </div>

          <div style="display:flex;justify-content:flex-end;margin-top:16px;">
            <div class="invoice-totals" style="width:280px;">
              <div class="invoice-total-row"><span>المجموع قبل الضريبة</span><span class="mono" id="sr-subtotal">0.00 ر.س</span></div>
              <div class="invoice-total-row"><span>ضريبة القيمة المضافة (15%)</span><span class="mono text-warn" id="sr-vat">0.00 ر.س</span></div>
              <div class="invoice-total-row grand-total"><span>إجمالي الإشعار الدائن</span><span class="mono" id="sr-grand">0.00 ر.س</span></div>
            </div>
          </div>

          <div id="sr-error" class="alert bad hidden" style="margin-top:12px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="closeModal('sr-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveSalesReturn()" id="save-sr-btn">💾 حفظ وحفظ الإشعار الدائن</button>
        </div>
      </div>
    </div>`,document.getElementById("sr-from")?.addEventListener("change",()=>g()),document.getElementById("sr-to")?.addEventListener("change",()=>g()),await J(),await Z(),await g(),Y()}async function Z(){try{const e=await f(p.customers(),[h("name")]),t=document.getElementById("sr-customer-filter");t&&(t.innerHTML='<option value="">كل العملاء</option>'+e.map(n=>`<option value="${n.id}">${n.name}</option>`).join(""))}catch{}}async function J(){try{const e=await f(p.warehouses(),[h("name")]),t=document.getElementById("sr-warehouse");t&&e.forEach(s=>t.innerHTML+=`<option value="${s.id}" data-name="${s.name}">${s.name}</option>`);const n=document.getElementById("sr-warehouse-filter");n&&(n.innerHTML='<option value="">كل المستودعات</option>'+e.map(s=>`<option value="${s.id}">${s.name}</option>`).join(""))}catch{}}async function g(){const e=document.getElementById("sr-tbody");if(e){e.innerHTML=`${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(9).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;try{const t=w(p.salesReturns(),h("createdAt","desc"),N(100));let s=(await I(t)).docs.map(a=>({id:a.id,...a.data()}));const m=document.getElementById("sr-from")?.value,i=document.getElementById("sr-to")?.value;(m||i)&&(s=s.filter(a=>{const v=a.date||(a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:"");return(!m||v>=m)&&(!i||v<=i)}));const o=document.getElementById("sr-customer-filter")?.value;o&&(s=s.filter(a=>a.customerId===o));const d=document.getElementById("sr-warehouse-filter")?.value;if(d&&(s=s.filter(a=>a.warehouseId===d)),s.length===0){e.innerHTML='<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد مردودات مبيعات تطابق الفلاتر المحددة</td></tr>';return}e.innerHTML=s.map(a=>`
      <tr>
        <td class="mono text-indigo font-bold">${a.number}</td>
        <td class="dim">${B(a.createdAt)}</td>
        <td class="mono text-2">${a.originalInvoiceNumber||"—"}</td>
        <td class="font-semibold">${a.customerName||"عميل نقدي"}</td>
        <td class="dim">${a.warehouseName||"—"}</td>
        <td class="mono">${u(a.subtotal)}</td>
        <td class="mono text-warn">${u(a.totalVat)}</td>
        <td class="mono font-bold text-good">${u(a.totalWithVat)}</td>
        <td><span class="zatca-stamp reported">✓ CN-ZATCA</span></td>
      </tr>`).join("")}catch(t){e.innerHTML=`<tr><td colspan="9"><div class="alert bad" style="margin:8px;">${t.message}</div></td></tr>`}}}function Y(){const e=document.getElementById("sr-inv-search"),t=document.getElementById("sr-inv-results");e&&e.addEventListener("input",P(async()=>{const n=e.value.trim().toLowerCase();if(!n){t.classList.add("hidden");return}const s=w(p.salesInvoices(),h("createdAt","desc"),N(100)),i=(await I(s)).docs.map(o=>({id:o.id,...o.data()})).filter(o=>(o.number||"").toLowerCase().includes(n)||(o.customerName||"").toLowerCase().includes(n));if(i.length===0){t.classList.add("hidden");return}t.innerHTML=i.slice(0,8).map(o=>`
      <div class="autocomplete-item" onclick="selectOriginalInvoice('${o.id}')">
        <div class="flex justify-between"><span class="font-bold text-indigo">${o.number}</span><span>${u(o.totalWithVat)}</span></div>
        <div class="item-code">${o.customerName} | ${B(o.createdAt||o.date)}</div>
      </div>`).join(""),t.classList.remove("hidden")},300))}window.selectOriginalInvoice=async e=>{try{const t=z(C,`companies/${A}/salesInvoices`,e),n=await Q(t);if(!n.exists())return;r={id:n.id,...n.data()},document.getElementById("sr-inv-search").value=r.number,document.getElementById("sr-cust-name").value=r.customerName,document.getElementById("sr-inv-results").classList.add("hidden");const s={},m=w(p.salesReturns(),W("originalInvoiceId","==",r.id));(await I(m)).docs.forEach(o=>{const d=o.data();d.status!=="cancelled"&&(d.lines||[]).forEach(a=>{s[a.productId]=(s[a.productId]||0)+(a.qty||0)})}),c=(r.lines||[]).map(o=>{const d=s[o.productId]||0,a=Math.max(0,o.qty-d);return{...o,originalQty:o.qty,alreadyReturned:d,maxReturnable:a,qty:0}}),E(),$()}catch(t){showToast(t.message,"error")}};function E(){const e=document.getElementById("sr-lines-tbody");e&&(e.innerHTML=c.map((t,n)=>{const s=t.qty*t.unitPrice*(1-(t.discount||0)/100);return`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:6px 10px;">${n+1}</td>
        <td style="padding:6px 10px;font-family:var(--font-heading);">${t.productName}</td>
        <td style="padding:6px 10px;" class="mono dim">${t.originalQty}</td>
        <td style="padding:6px 10px;width:140px;">
          <input type="number" class="input mono font-bold text-warn" style="width:90px;height:30px;font-size:12px;"
            value="${t.qty}" min="0" max="${t.maxReturnable}" step="0.001"
            onchange="updateReturnQty(${n},this.value)" />
          <div style="font-size:9.5px;color:var(--text-dim);margin-top:2px;">الحد الأقصى: ${t.maxReturnable} (أرجع: ${t.alreadyReturned})</div>
        </td>
        <td style="padding:6px 10px;" class="mono">${u(t.unitPrice)}</td>
        <td style="padding:6px 10px;" class="mono font-bold">${u(s)}</td>
      </tr>`}).join(""))}window.updateReturnQty=(e,t)=>{const n=parseFloat(t)||0;n>c[e].maxReturnable?(showToast(`الكمية المرجعة لا تزيد عن الكمية المتاحة للإرجاع (${c[e].maxReturnable})`,"warning"),c[e].qty=c[e].maxReturnable):c[e].qty=n,E(),$()};function $(){const e=c.filter(n=>n.qty>0),t=M(e);document.getElementById("sr-subtotal").textContent=u(t.subtotal),document.getElementById("sr-vat").textContent=u(t.vatTotal),document.getElementById("sr-grand").textContent=u(t.grandTotal)}window.openSalesReturnModal=()=>{c=[],r=null,document.getElementById("sr-inv-search").value="",document.getElementById("sr-cust-name").value="",document.getElementById("sr-reason").value="",document.getElementById("sr-error").classList.add("hidden"),document.getElementById("sr-number").value="جارِ التوليد...",E(),$(),openModal("sr-modal"),H("CN").then(e=>{const t=document.getElementById("sr-number");t&&(t.value=e)}).catch(()=>{})};window.saveSalesReturn=async()=>{const e=document.getElementById("sr-error");if(e.classList.add("hidden"),!r){e.textContent="اختر الفاتورة الأصلية",e.classList.remove("hidden");return}const t=c.filter(d=>d.qty>0);if(t.length===0){e.textContent="حدد كمية مرجعة لصنف واحد على الأقل",e.classList.remove("hidden");return}const n=document.getElementById("sr-warehouse"),s=n.value,m=n.options[n.selectedIndex]?.dataset.name||"",i=document.getElementById("sr-reason").value.trim();if(!s){e.textContent="اختر المخزن المستلم للبضاعة المرجعة",e.classList.remove("hidden");return}if(!i){e.textContent="أدخل سبب الإرجاع",e.classList.remove("hidden");return}const o=document.getElementById("save-sr-btn");o.disabled=!0;try{const d=M(t),a=document.getElementById("sr-number").value,v=document.getElementById("sr-date").value,S={number:a,date:v,originalInvoiceId:r.id,originalInvoiceNumber:r.number,customerId:r.customerId,customerName:r.customerName,repId:r.repId||r.salesRepId||null,warehouseId:s,warehouseName:m,lines:t,subtotal:d.subtotal,totalVat:d.vatTotal,totalWithVat:d.grandTotal,reason:i,status:"issued",zatcaStatus:"reported"},L=await F(p.salesReturns(),S);for(const l of t)await O(s,l.productId,+l.qty,{type:"return_in",sourceType:"salesReturn",sourceId:L,documentNumber:a,invoiceNumber:a});try{const l=await f(p.warehouses()),b=t.reduce((x,y)=>x+(y.costPrice||y.averageCost||0)*(y.qty||0),0);await V({id:L,returnNumber:a,date:v,customerName:r.customerName,customerType:r.customerType||"retail",paymentMethod:r.paymentMethod||"credit",subtotal:d.subtotal,taxAmount:d.vatTotal,total:d.grandTotal,totalCost:b,warehouseId:s},{},l)}catch(l){console.warn("[AccountingEngine] Sales Return JE failed:",l.message)}if(r.customerId&&d.grandTotal>0)try{const{increment:l,updateDoc:b,doc:x,serverTimestamp:y}=await R(async()=>{const{increment:_,updateDoc:D,doc:k,serverTimestamp:j}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{increment:_,updateDoc:D,doc:k,serverTimestamp:j}},[]),q=x(C,`companies/${A}/customers`,r.customerId);await b(q,{balance:l(-d.grandTotal),updatedAt:y()}),console.log(`[CustomerBalance] Client-side decremented customer ${r.customerId} balance by -${d.grandTotal} due to return`)}catch(l){console.warn("Failed to update customer balance on return:",l.message)}showToast(`تم إصدار الإشعار الدائن ${a}`,"success"),closeModal("sr-modal"),await g(),r.customerId&&R(()=>import("./balance-sync-B0nwXHmR.js"),__vite__mapDeps([0,1,2,3])).then(l=>l.recalculateCustomerBalance(r.customerId)).catch(l=>console.warn(l))}catch(d){e.textContent=d.message,e.classList.remove("hidden")}finally{o.disabled=!1}};export{st as render};
