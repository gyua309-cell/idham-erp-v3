const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/balance-sync-B0nwXHmR.js","assets/index-HrCilPJ3.js","assets/index-BTgEPYae.css","assets/sync-engine-CjRafMpJ.js"])))=>i.map(i=>d[i]);
import{t as I,C as m,b as E,f as p,g as L,p as S,d as B,a as T,B as R,x as H,n as V,v as F,e as O,_ as $}from"./index-HrCilPJ3.js";import{query as g,orderBy as y,limit as P,getDocs as b,doc as Q,getDoc as W,where as z}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let c=[],r=null;async function at(e,t){e.innerHTML=`
    <div class="filterbar" style="flex-wrap: wrap; gap: 8px; align-items: flex-end;">
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="pr-from" value="${new Date(new Date().setDate(1)).toISOString().split("T")[0]}" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="pr-to" value="${I()}" />
      </div>
      <div class="filter-select-group">
        <label>المورد</label>
        <select id="pr-supplier-filter" onchange="loadPurchaseReturnsList()">
          <option value="">كل الموردين</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>المستودع</label>
        <select id="pr-warehouse-filter" onchange="loadPurchaseReturnsList()">
          <option value="">كل المستودعات</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn-export" onclick="exportPagePDF('.data-dense','مردودات_المشتريات')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportPageExcel('.data-dense','مردودات_المشتريات')" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn btn-primary" onclick="openPurchaseReturnModal()">+ مردود شراء جديد (إشعار مدين)</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">مردودات المشتريات والإشعارات المدينة</h1>
        <p class="page-subtitle">إرجاع البضائع للموردين وخصم قيمتها من الذمم الدائنة</p>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>رقم الإشعار المدين</th>
                <th>التاريخ</th>
                <th>الفاتورة الأصلية</th>
                <th>المورد</th>
                <th>المخزن المرجَع منه</th>
                <th>إجمالي المردود</th>
                <th>VAT 15%</th>
                <th>الصافي</th>
              </tr>
            </thead>
            <tbody id="pr-tbody">
              ${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Purchase Return Modal -->
    <div class="modal-overlay" id="pr-modal">
      <div class="modal modal-xl">
        <div class="modal-header">
          <h3 class="modal-title">إصدار إشعار مدين (مردود مشتريات)</h3>
          <button class="modal-close" onclick="closeModal('pr-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group">
              <label>رقم فاتورة الشراء الأصلية *</label>
              <div class="autocomplete-container">
                <input type="text" id="pr-inv-search" class="input mono" placeholder="ادخل رقم الفاتورة..." autocomplete="off" />
                <div class="autocomplete-results hidden" id="pr-inv-results"></div>
              </div>
            </div>
            <div class="form-group">
              <label>رقم الإشعار المدين</label>
              <input type="text" id="pr-number" class="input mono" readonly placeholder="يُولّد تلقائياً" />
            </div>
            <div class="form-group">
              <label>التاريخ *</label>
              <input type="date" id="pr-date" class="input" value="${I()}" />
            </div>
          </div>

          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>المورد</label>
              <input type="text" id="pr-sup-name" class="input" readonly placeholder="يتم تحديده من الفاتورة" />
            </div>
            <div class="form-group">
              <label>المخزن المسحوب منه البضاعة *</label>
              <select id="pr-warehouse"><option value="">اختر المخزن</option></select>
            </div>
          </div>

          <div class="form-group mb-16">
            <label>سبب الإرجاع *</label>
            <input type="text" id="pr-reason" class="input" placeholder="مثال: أصناف تالفة، عدم مطابقة المواصفات..." />
          </div>

          <div class="divider-label">بنود الفاتورة المرجعة</div>

          <div class="invoice-lines">
            <table style="width:100%;font-size:12.5px;">
              <thead>
                <tr style="background:var(--bg-2);">
                  <th style="padding:8px 10px;">#</th>
                  <th style="padding:8px 10px;">الصنف</th>
                  <th style="padding:8px 10px;">الكمية المشترات</th>
                  <th style="padding:8px 10px;">الكمية المرجعة للمورد</th>
                  <th style="padding:8px 10px;">سعر التكلفة</th>
                  <th style="padding:8px 10px;">الإجمالي المرجع</th>
                </tr>
              </thead>
              <tbody id="pr-lines-tbody">
                <tr><td colspan="6" style="text-align:center;padding:16px;color:var(--text-2);">حدد فاتورة الشراء الأصلية أولاً</td></tr>
              </tbody>
            </table>
          </div>

          <div style="display:flex;justify-content:flex-end;margin-top:16px;">
            <div class="invoice-totals" style="width:280px;">
              <div class="invoice-total-row"><span>المجموع</span><span class="mono" id="pr-subtotal">0.00 ر.س</span></div>
              <div class="invoice-total-row"><span>VAT 15%</span><span class="mono text-warn" id="pr-vat">0.00 ر.س</span></div>
              <div class="invoice-total-row grand-total"><span>إجمالي الإشعار المدين</span><span class="mono" id="pr-grand">0.00 ر.س</span></div>
            </div>
          </div>

          <div id="pr-error" class="alert bad hidden" style="margin-top:12px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="closeModal('pr-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="savePurchaseReturn()" id="save-pr-btn">💾 حفظ وحصم الإشعار المدين</button>
        </div>
      </div>
    </div>`,document.getElementById("pr-from")?.addEventListener("change",()=>h()),document.getElementById("pr-to")?.addEventListener("change",()=>h()),await Y(),await J(),await h(),G()}async function J(){try{const e=await L(m.suppliers(),[y("name")]),t=document.getElementById("pr-supplier-filter");t&&(t.innerHTML='<option value="">كل الموردين</option>'+e.map(s=>`<option value="${s.id}">${s.name}</option>`).join(""))}catch{}}async function Y(){try{const e=await L(m.warehouses(),[y("name")]),t=document.getElementById("pr-warehouse");t&&e.forEach(n=>t.innerHTML+=`<option value="${n.id}" data-name="${n.name}">${n.name}</option>`);const s=document.getElementById("pr-warehouse-filter");s&&(s.innerHTML='<option value="">كل المستودعات</option>'+e.map(n=>`<option value="${n.id}">${n.name}</option>`).join(""))}catch{}}async function h(){const e=document.getElementById("pr-tbody");if(e){e.innerHTML=`${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;try{const t=g(m.purchaseReturns(),y("createdAt","desc"),P(100));let n=(await b(t)).docs.map(a=>({id:a.id,...a.data()}));const u=document.getElementById("pr-from")?.value,i=document.getElementById("pr-to")?.value;(u||i)&&(n=n.filter(a=>{const v=a.date||(a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:"");return(!u||v>=u)&&(!i||v<=i)}));const o=document.getElementById("pr-supplier-filter")?.value;o&&(n=n.filter(a=>a.supplierId===o));const d=document.getElementById("pr-warehouse-filter")?.value;if(d&&(n=n.filter(a=>a.warehouseId===d)),n.length===0){e.innerHTML='<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد مردودات مشتريات تطابق الفلاتر المحددة</td></tr>';return}e.innerHTML=n.map(a=>`
      <tr>
        <td class="mono text-indigo font-bold">${a.number}</td>
        <td class="dim">${E(a.createdAt)}</td>
        <td class="mono text-2">${a.originalPurchaseNumber||"—"}</td>
        <td class="font-semibold">${a.supplierName||"—"}</td>
        <td class="dim">${a.warehouseName||"—"}</td>
        <td class="mono">${p(a.subtotal)}</td>
        <td class="mono text-warn">${p(a.totalVat)}</td>
        <td class="mono font-bold text-good">${p(a.totalWithVat)}</td>
      </tr>`).join("")}catch(t){e.innerHTML=`<tr><td colspan="8"><div class="alert bad" style="margin:8px;">${t.message}</div></td></tr>`}}}function G(){const e=document.getElementById("pr-inv-search"),t=document.getElementById("pr-inv-results");e&&e.addEventListener("input",S(async()=>{const s=e.value.trim().toLowerCase();if(!s){t.classList.add("hidden");return}const n=g(m.purchaseInvoices(),y("createdAt","desc"),P(100)),i=(await b(n)).docs.map(o=>({id:o.id,...o.data()})).filter(o=>(o.number||"").toLowerCase().includes(s)||(o.supplierName||"").toLowerCase().includes(s));if(i.length===0){t.classList.add("hidden");return}t.innerHTML=i.slice(0,8).map(o=>`
      <div class="autocomplete-item" onclick="selectOriginalPurchase('${o.id}')">
        <div class="flex justify-between"><span class="font-bold text-indigo">${o.number}</span><span>${p(o.totalWithVat)}</span></div>
        <div class="item-code">${o.supplierName} | ${E(o.createdAt||o.date)}</div>
      </div>`).join(""),t.classList.remove("hidden")},300))}window.selectOriginalPurchase=async e=>{try{const t=Q(B,`companies/${T}/purchaseInvoices`,e),s=await W(t);if(!s.exists())return;r={id:s.id,...s.data()},document.getElementById("pr-inv-search").value=r.number,document.getElementById("pr-sup-name").value=r.supplierName,document.getElementById("pr-inv-results").classList.add("hidden");const n={},u=g(m.purchaseReturns(),z("originalPurchaseId","==",r.id));(await b(u)).docs.forEach(o=>{const d=o.data();d.status!=="cancelled"&&(d.lines||[]).forEach(a=>{n[a.productId]=(n[a.productId]||0)+(a.qty||0)})}),c=(r.lines||[]).map(o=>{const d=n[o.productId]||0,a=Math.max(0,o.qty-d);return{...o,originalQty:o.qty,alreadyReturned:d,maxReturnable:a,qty:0}}),x(),f()}catch(t){showToast(t.message,"error")}};function x(){const e=document.getElementById("pr-lines-tbody");e&&(e.innerHTML=c.map((t,s)=>{const n=t.qty*t.unitPrice*(1-(t.discount||0)/100);return`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:6px 10px;">${s+1}</td>
        <td style="padding:6px 10px;font-family:var(--font-heading);">${t.productName}</td>
        <td style="padding:6px 10px;" class="mono dim">${t.originalQty}</td>
        <td style="padding:6px 10px;width:140px;">
          <input type="number" class="input mono font-bold text-warn" style="width:90px;height:30px;font-size:12px;"
            value="${t.qty}" min="0" max="${t.maxReturnable}" step="0.001"
            onchange="updatePurchaseReturnQty(${s},this.value)" />
          <div style="font-size:9.5px;color:var(--text-dim);margin-top:2px;">الحد الأقصى: ${t.maxReturnable} (أرجع: ${t.alreadyReturned})</div>
        </td>
        <td style="padding:6px 10px;" class="mono">${p(t.unitPrice)}</td>
        <td style="padding:6px 10px;" class="mono font-bold">${p(n)}</td>
      </tr>`}).join(""))}window.updatePurchaseReturnQty=(e,t)=>{const s=parseFloat(t)||0;s>c[e].maxReturnable?(showToast(`الكمية المرجعة لا تزيد عن الكمية المتاحة للإرجاع (${c[e].maxReturnable})`,"warning"),c[e].qty=c[e].maxReturnable):c[e].qty=s,x(),f()};function f(){const e=c.filter(s=>s.qty>0),t=R(e);document.getElementById("pr-subtotal").textContent=p(t.subtotal),document.getElementById("pr-vat").textContent=p(t.vatTotal),document.getElementById("pr-grand").textContent=p(t.grandTotal)}window.openPurchaseReturnModal=()=>{c=[],r=null,document.getElementById("pr-inv-search").value="",document.getElementById("pr-sup-name").value="",document.getElementById("pr-reason").value="",document.getElementById("pr-error").classList.add("hidden"),document.getElementById("pr-number").value="جارِ التوليد...",x(),f(),openModal("pr-modal"),H("DN").then(e=>{const t=document.getElementById("pr-number");t&&(t.value=e)}).catch(()=>{})};window.savePurchaseReturn=async()=>{const e=document.getElementById("pr-error");if(e.classList.add("hidden"),!r){e.textContent="اختر فاتورة الشراء الأصلية",e.classList.remove("hidden");return}const t=c.filter(d=>d.qty>0);if(t.length===0){e.textContent="حدد كمية مرجعة لصنف واحد على الأقل",e.classList.remove("hidden");return}const s=document.getElementById("pr-warehouse"),n=s.value,u=s.options[s.selectedIndex]?.dataset.name||"",i=document.getElementById("pr-reason").value.trim();if(!n){e.textContent="اختر المخزن المسحوب منه البضاعة المرجعة",e.classList.remove("hidden");return}if(!i){e.textContent="أدخل سبب الإرجاع",e.classList.remove("hidden");return}const o=document.getElementById("save-pr-btn");o.disabled=!0;try{const d=R(t),a=document.getElementById("pr-number").value,v=document.getElementById("pr-date").value,M={number:a,date:v,originalPurchaseId:r.id,originalPurchaseNumber:r.number,supplierId:r.supplierId,supplierName:r.supplierName,warehouseId:n,warehouseName:u,lines:t,subtotal:d.subtotal,totalVat:d.vatTotal,totalWithVat:d.grandTotal,reason:i,status:"issued"},w=await V(m.purchaseReturns(),M);for(const l of t)await F(n,l.productId,-l.qty,{type:"return_out",sourceType:"purchaseReturn",sourceId:w,documentNumber:a,invoiceNumber:a});if(await O({date:v,description:`مردودات مشتريات — إشعار مدين ${a} — ${r.supplierName}`,sourceType:"purchaseReturn",sourceId:w,lines:[{accountCode:"2-1-1-1-1",accountName:"ذمم موردون محليون",debit:d.grandTotal,credit:0},{accountCode:"1-1-4-1-01",accountName:"مخزون المستودع الرئيسي",debit:0,credit:d.subtotal},{accountCode:"1-1-5-2",accountName:"ضريبة القيمة المضافة - المدخلات",debit:0,credit:d.vatTotal}]}),r.supplierId&&d.grandTotal>0)try{const{increment:l,updateDoc:N,doc:C,serverTimestamp:A}=await $(async()=>{const{increment:_,updateDoc:q,doc:k,serverTimestamp:j}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{increment:_,updateDoc:q,doc:k,serverTimestamp:j}},[]),D=C(B,`companies/${T}/suppliers`,r.supplierId);await N(D,{balance:l(-d.grandTotal),updatedAt:A()}),console.log(`[SupplierBalance] Client-side decremented supplier ${r.supplierId} balance by -${d.grandTotal} due to return`)}catch(l){console.warn("Failed to update supplier balance on return:",l.message)}showToast(`تم إصدار الإشعار المدين ${a}`,"success"),closeModal("pr-modal"),await h(),r.supplierId&&$(()=>import("./balance-sync-B0nwXHmR.js"),__vite__mapDeps([0,1,2,3])).then(l=>l.recalculateSupplierBalance(r.supplierId)).catch(l=>console.warn(l))}catch(d){e.textContent=d.message,e.classList.remove("hidden")}finally{o.disabled=!1}};export{at as render};
