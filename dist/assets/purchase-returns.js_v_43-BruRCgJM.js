const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/balance-sync-CRpzcgfF.js","assets/index-BgjRa7f-.js","assets/index-Dq7oGj9k.css"])))=>i.map(i=>d[i]);
import{t as R,a as m,b as L,f as u,g as f,q as H,d as B,C as P,J as M,z as V,o as F,x as O,u as z,M as Q,N as W,_ as T}from"./index-BgjRa7f-.js";import{autoPurchaseReturnJE as J}from"./accounting-engine-05LwIRNc.js";import{query as w,orderBy as x,limit as C,getDocs as I,doc as Z,getDoc as U,where as Y}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let p=[],d=null;async function dt(e,t){e.innerHTML=`
    <div class="filterbar" style="flex-wrap: wrap; gap: 8px; align-items: flex-end;">
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="pr-from" value="${new Date(new Date().setDate(1)).toISOString().split("T")[0]}" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="pr-to" value="${R()}" />
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
        <p class="page-subtitle">إرجاع البضائع للموردين وخصم قيمتها من الذمم الدائنة وتحديث المخزون والقيد المحاسبي</p>
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
                <th>الصافي المسترد</th>
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
              <input type="date" id="pr-date" class="input" value="${R()}" />
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
                  <th style="padding:8px 10px;text-align:center;">الضريبة VAT</th>
                  <th style="padding:8px 10px;">الإجمالي المرجع</th>
                </tr>
              </thead>
              <tbody id="pr-lines-tbody">
                <tr><td colspan="7" style="text-align:center;padding:16px;color:var(--text-2);">حدد فاتورة الشراء الأصلية أولاً</td></tr>
              </tbody>
            </table>
          </div>

          <div style="display:flex;justify-content:flex-end;margin-top:16px;">
            <div class="invoice-totals" style="width:300px;">
              <div class="invoice-total-row"><span>المجموع قبل الضريبة:</span><span class="mono font-bold" id="pr-subtotal">0.00 ر.س</span></div>
              <div class="invoice-total-row"><span>ضريبة القيمة المضافة:</span><span class="mono text-warn font-bold" id="pr-vat">0.00 ر.س</span></div>
              <div class="invoice-total-row grand-total"><span>إجمالي الإشعار المدين:</span><span class="mono font-bold text-good" id="pr-grand">0.00 ر.س</span></div>
            </div>
          </div>

          <div id="pr-error" class="alert bad hidden" style="margin-top:12px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="closeModal('pr-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="savePurchaseReturn()" id="save-pr-btn">💾 حفظ وخصم الإشعار المدين</button>
        </div>
      </div>
    </div>`,document.getElementById("pr-from")?.addEventListener("change",()=>b()),document.getElementById("pr-to")?.addEventListener("change",()=>b()),await K(),await G(),await b(),X()}async function G(){try{const e=await f(m.suppliers(),[x("name")]),t=document.getElementById("pr-supplier-filter");t&&(t.innerHTML='<option value="">كل الموردين</option>'+e.map(o=>`<option value="${o.id}">${o.name}</option>`).join(""))}catch{}}async function K(){try{const e=await f(m.warehouses(),[x("name")]),t=document.getElementById("pr-warehouse");t&&e.forEach(s=>t.innerHTML+=`<option value="${s.id}" data-name="${s.name}">${s.name}</option>`);const o=document.getElementById("pr-warehouse-filter");o&&(o.innerHTML='<option value="">كل المستودعات</option>'+e.map(s=>`<option value="${s.id}">${s.name}</option>`).join(""))}catch{}}async function b(){const e=document.getElementById("pr-tbody");if(e){e.innerHTML=`${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;try{const t=w(m.purchaseReturns(),x("createdAt","desc"),C(100));let s=(await I(t)).docs.map(a=>({id:a.id,...a.data()}));const l=document.getElementById("pr-from")?.value,c=document.getElementById("pr-to")?.value;(l||c)&&(s=s.filter(a=>{const h=a.date||(a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:"");return(!l||h>=l)&&(!c||h<=c)}));const n=document.getElementById("pr-supplier-filter")?.value;n&&(s=s.filter(a=>a.supplierId===n));const r=document.getElementById("pr-warehouse-filter")?.value;if(r&&(s=s.filter(a=>a.warehouseId===r)),s.length===0){e.innerHTML='<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد مردودات مشتريات تطابق الفلاتر المحددة</td></tr>';return}e.innerHTML=s.map(a=>`
      <tr>
        <td class="mono text-indigo font-bold">${a.number}</td>
        <td class="dim">${L(a.createdAt||a.date)}</td>
        <td class="mono text-2">${a.originalPurchaseNumber||"—"}</td>
        <td class="font-semibold">${a.supplierName||"—"}</td>
        <td class="dim">${a.warehouseName||"—"}</td>
        <td class="mono">${u(a.subtotal)}</td>
        <td class="mono text-warn">${u(a.totalVat)}</td>
        <td class="mono font-bold text-good">${u(a.totalWithVat)}</td>
      </tr>`).join("")}catch(t){e.innerHTML=`<tr><td colspan="8"><div class="alert bad" style="margin:8px;">${t.message}</div></td></tr>`}}}function X(){const e=document.getElementById("pr-inv-search"),t=document.getElementById("pr-inv-results");e&&e.addEventListener("input",H(async()=>{const o=e.value.trim().toLowerCase();if(!o){t.classList.add("hidden");return}const s=w(m.purchaseInvoices(),x("createdAt","desc"),C(100)),c=(await I(s)).docs.map(n=>({id:n.id,...n.data()})).filter(n=>(n.number||"").toLowerCase().includes(o)||(n.supplierName||"").toLowerCase().includes(o));if(c.length===0){t.classList.add("hidden");return}t.innerHTML=c.slice(0,8).map(n=>`
      <div class="autocomplete-item" onclick="selectOriginalPurchase('${n.id}')">
        <div class="flex justify-between"><span class="font-bold text-indigo">${n.number}</span><span>${u(n.totalWithVat)}</span></div>
        <div class="item-code">${n.supplierName} | ${L(n.createdAt||n.date)}</div>
      </div>`).join(""),t.classList.remove("hidden")},300))}window.selectOriginalPurchase=async e=>{try{const t=Z(B,`companies/${P}/purchaseInvoices`,e),o=await U(t);if(!o.exists())return;d={id:o.id,...o.data()},document.getElementById("pr-inv-search").value=d.number,document.getElementById("pr-sup-name").value=d.supplierName,d.warehouseId&&(document.getElementById("pr-warehouse").value=d.warehouseId),document.getElementById("pr-inv-results").classList.add("hidden");const s={},l=w(m.purchaseReturns(),Y("originalPurchaseId","==",d.id));(await I(l)).docs.forEach(n=>{const r=n.data();r.status!=="cancelled"&&(r.lines||[]).forEach(a=>{s[a.productId]=(s[a.productId]||0)+(a.qty||0)})}),p=(d.lines||[]).map(n=>{const r=s[n.productId]||0,a=Math.max(0,(n.qty||0)-r);return{...n,originalQty:n.qty||0,alreadyReturned:r,maxReturnable:a,taxCategory:n.taxCategory||"S",taxRate:n.taxCategory==="E"||n.taxCategory==="Z"?0:15,unit:n.unit||"حبة",qty:0}}),E(),$()}catch(t){showToast(t.message,"error")}};function E(){const e=document.getElementById("pr-lines-tbody");e&&(e.innerHTML=p.map((t,o)=>{const s=t.qty*t.unitPrice*(1-(t.discount||0)/100),l=t.taxCategory==="E"||t.taxCategory==="Z"||t.taxRate===0;return`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:6px 10px;">${o+1}</td>
        <td style="padding:6px 10px;font-family:var(--font-heading);">
          <b>${t.productName}</b>
          <div class="dim mono" style="font-size:10px;">${t.sku||"—"} | الوحدة: ${t.unit||"حبة"}</div>
        </td>
        <td style="padding:6px 10px;" class="mono dim">${t.originalQty} ${t.unit||""}</td>
        <td style="padding:6px 10px;width:140px;">
          <input type="number" class="input mono font-bold text-warn" style="width:90px;height:30px;font-size:12px;"
            value="${t.qty}" min="0" max="${t.maxReturnable}" step="0.001"
            onchange="updatePurchaseReturnQty(${o},this.value)" />
          <div style="font-size:9.5px;color:var(--text-dim);margin-top:2px;">الحد المتاح: ${t.maxReturnable} (سابق: ${t.alreadyReturned})</div>
        </td>
        <td style="padding:6px 10px;" class="mono">${u(t.unitPrice)}</td>
        <td style="padding:6px 10px;text-align:center;">
          ${l?'<span class="badge good" style="font-size:9.5px;padding:2px 4px;">معفى</span>':'<span class="badge warn" style="font-size:9.5px;padding:2px 4px;">15%</span>'}
        </td>
        <td style="padding:6px 10px;" class="mono font-bold">${u(s)}</td>
      </tr>`}).join(""))}window.updatePurchaseReturnQty=(e,t)=>{const o=parseFloat(t)||0;o>p[e].maxReturnable?(showToast(`الكمية المرجعة لا تزيد عن الكمية المتاحة للإرجاع (${p[e].maxReturnable})`,"warning"),p[e].qty=p[e].maxReturnable):p[e].qty=o,E(),$()};function $(){const e=p.filter(o=>o.qty>0),t=M(e);document.getElementById("pr-subtotal").textContent=u(t.subtotal),document.getElementById("pr-vat").textContent=u(t.vatTotal),document.getElementById("pr-grand").textContent=u(t.grandTotal)}window.openPurchaseReturnModal=()=>{p=[],d=null,document.getElementById("pr-inv-search").value="",document.getElementById("pr-sup-name").value="",document.getElementById("pr-reason").value="",document.getElementById("pr-error").classList.add("hidden"),document.getElementById("pr-number").value="جارِ التوليد...",E(),$(),openModal("pr-modal"),V("DN").then(e=>{const t=document.getElementById("pr-number");t&&(t.value=e)}).catch(()=>{})};window.savePurchaseReturn=async()=>{const e=document.getElementById("pr-error");if(e.classList.add("hidden"),!d){e.textContent="اختر فاتورة الشراء الأصلية",e.classList.remove("hidden");return}const t=p.filter(r=>r.qty>0);if(t.length===0){e.textContent="حدد كمية مرجعة لصنف واحد على الأقل",e.classList.remove("hidden");return}const o=document.getElementById("pr-warehouse"),s=o.value,l=o.options[o.selectedIndex]?.dataset.name||"",c=document.getElementById("pr-reason").value.trim();if(!s){e.textContent="اختر المخزن المسحوب منه البضاعة المرجعة",e.classList.remove("hidden");return}if(!c){e.textContent="أدخل سبب الإرجاع",e.classList.remove("hidden");return}const n=document.getElementById("save-pr-btn");n.disabled=!0,n.textContent="⏳ جارٍ الحفظ وخصم الرصيد…";try{const r=M(t),a=document.getElementById("pr-number").value,h=document.getElementById("pr-date").value,v=d.paymentMethod||"credit",N={number:a,date:h,originalPurchaseId:d.id,originalPurchaseNumber:d.number,supplierId:d.supplierId,supplierName:d.supplierName,warehouseId:s,warehouseName:l,lines:t,subtotal:r.subtotal,totalVat:r.vatTotal,totalWithVat:r.grandTotal,paymentMethod:v,reason:c,status:"issued"},y=await F(m.purchaseReturns(),N);for(const i of t)await O(s,i.productId,-i.qty,{type:"purchase_return",sourceType:"purchaseReturn",sourceId:y,documentNumber:a,notes:`مردود مشتريات (إشعار مدين ${a}) — مورد: ${d.supplierName}`});try{const i=await f(m.warehouses()),g=await J({id:y,returnNumber:a,date:h,supplierId:d.supplierId,supplierName:d.supplierName,paymentMethod:v,warehouseId:s,subtotal:r.subtotal,taxAmount:r.vatTotal,total:r.grandTotal},window._currentUser||{},i);g&&await z(m.purchaseReturns(),y,{journalEntryId:g})}catch(i){console.warn("[PurchaseReturn] Auto JE failed:",i)}if(v==="cash"||v==="نقدي")try{await Q({type:"in",amount:r.grandTotal,notes:`استرداد نقدي لمردود مشتريات — إشعار مدين ${a} — ${d.supplierName}`,sourceType:"purchaseReturn",sourceId:y,date:h})}catch(i){console.warn("[PurchaseReturn] Cash transaction failed:",i)}else if(["transfer","bank","cheque","check","تحويل","شيك"].includes(v))try{await W({type:"in",amount:r.grandTotal,notes:`استرداد بنكي لمردود مشتريات — إشعار مدين ${a} — ${d.supplierName}`,sourceType:"purchaseReturn",sourceId:y,date:h})}catch(i){console.warn("[PurchaseReturn] Bank transaction failed:",i)}if(d.supplierId&&r.grandTotal>0&&v!=="cash")try{const{increment:i,updateDoc:g,doc:k,serverTimestamp:D}=await T(async()=>{const{increment:q,updateDoc:_,doc:j,serverTimestamp:S}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{increment:q,updateDoc:_,doc:j,serverTimestamp:S}},[]),A=k(B,`companies/${P}/suppliers`,d.supplierId);await g(A,{balance:i(-r.grandTotal),updatedAt:D()}),console.log(`[SupplierBalance] Decremented supplier ${d.supplierId} balance by -${r.grandTotal}`)}catch(i){console.warn("Failed to update supplier balance on return:",i.message)}showToast(`✅ تم إصدار الإشعار المدين ${a} وتحديث المخزون والمحاسبة بنجاح`,"success"),closeModal("pr-modal"),await b(),d.supplierId&&T(()=>import("./balance-sync-CRpzcgfF.js"),__vite__mapDeps([0,1,2])).then(i=>i.recalculateSupplierBalance(d.supplierId)).catch(i=>console.warn(i))}catch(r){e.textContent=r.message,e.classList.remove("hidden")}finally{n.disabled=!1,n.textContent="💾 حفظ وخصم الإشعار المدين"}};export{dt as render};
