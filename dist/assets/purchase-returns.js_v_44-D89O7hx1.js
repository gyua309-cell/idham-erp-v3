const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/balance-sync-CUiyFg8g.js","assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css"])))=>i.map(i=>d[i]);
import{t as K,C as I,e as J,f as R,g as H,w as nt,d as T,a as k,K as tt,B as ot,h as A,z as O,m as Q,_ as C,u as G,c as st,r as W,N as rt,O as it}from"./index-CF9GFeRJ.js";import{autoPurchaseReturnJE as X}from"./accounting-engine-C71tPcGM.js";import{query as M,orderBy as U,limit as et,getDocs as S,doc as D,getDoc as q,where as P,collection as F}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let B=[],c=null;async function vt(n,t){n.innerHTML=`
    <div class="filterbar" style="flex-wrap: wrap; gap: 8px; align-items: flex-end;">
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="pr-from" value="${new Date(new Date().setDate(1)).toISOString().split("T")[0]}" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="pr-to" value="${K()}" />
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
                <th style="text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="pr-tbody">
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
              <input type="date" id="pr-date" class="input" value="${K()}" />
            </div>
          </div>

          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>المورد</label>
              <input type="text" id="pr-sup-name" class="input" readonly placeholder="يتم تحديده من الفاتورة" />
            </div>
            <div class="form-group">
              <label>المخزن المسحوب منه البضاعة *</label>
              <select id="pr-warehouse" onchange="window.onPurchaseReturnWarehouseChange()"><option value="">اختر المخزن</option></select>
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
                  <th style="padding:8px 10px;">الكمية بالفاتورة</th>
                  <th style="padding:8px 10px;text-align:center;">الرصيد الفعلي بالمستودع</th>
                  <th style="padding:8px 10px;">الكمية المرجعة للمورد</th>
                  <th style="padding:8px 10px;">سعر التكلفة</th>
                  <th style="padding:8px 10px;text-align:center;">الضريبة VAT</th>
                  <th style="padding:8px 10px;">الإجمالي المرجع</th>
                </tr>
              </thead>
              <tbody id="pr-lines-tbody">
                <tr><td colspan="8" style="text-align:center;padding:16px;color:var(--text-2);">حدد فاتورة الشراء الأصلية أولاً</td></tr>
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
    </div>

    <!-- View Purchase Return Modal -->
    <div class="modal-overlay" id="pr-view-modal">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 class="modal-title" id="pr-view-title">تفاصيل الإشعار المدين (مردود مشتريات)</h3>
          <button class="modal-close" onclick="closeModal('pr-view-modal')">×</button>
        </div>
        <div class="modal-body" id="pr-view-body" style="padding:20px;"></div>
        <div class="modal-footer" id="pr-view-footer" style="padding:12px 20px;"></div>
      </div>
    </div>`,document.getElementById("pr-from")?.addEventListener("change",()=>j()),document.getElementById("pr-to")?.addEventListener("change",()=>j()),await Promise.all([ct(),dt(),j()]),lt()}async function dt(){try{const n=await H(I.suppliers(),[U("name")]),t=document.getElementById("pr-supplier-filter");t&&(t.innerHTML='<option value="">كل الموردين</option>'+n.map(a=>`<option value="${a.id}">${a.name}</option>`).join(""))}catch{}}async function ct(){try{const n=await H(I.warehouses(),[U("name")]),t=document.getElementById("pr-warehouse");t&&n.forEach(e=>t.innerHTML+=`<option value="${e.id}" data-name="${e.name}">${e.name}</option>`);const a=document.getElementById("pr-warehouse-filter");a&&(a.innerHTML='<option value="">كل المستودعات</option>'+n.map(e=>`<option value="${e.id}">${e.name}</option>`).join(""))}catch{}}async function j(){const n=document.getElementById("pr-tbody");if(n){n.innerHTML=`${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;try{const t=M(I.purchaseReturns(),U("createdAt","desc"),et(100));let e=(await S(t)).docs.map(d=>({id:d.id,...d.data()}));const m=document.getElementById("pr-from")?.value,o=document.getElementById("pr-to")?.value;(m||o)&&(e=e.filter(d=>{const r=d.date||(d.createdAt?.toDate?d.createdAt.toDate().toISOString().split("T")[0]:"");return(!m||r>=m)&&(!o||r<=o)}));const i=document.getElementById("pr-supplier-filter")?.value;i&&(e=e.filter(d=>d.supplierId===i));const v=document.getElementById("pr-warehouse-filter")?.value;if(v&&(e=e.filter(d=>d.warehouseId===v)),e.length===0){n.innerHTML='<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد مردودات مشتريات تطابق الفلاتر المحددة</td></tr>';return}n.innerHTML=e.map(d=>`
      <tr>
        <td class="mono text-indigo font-bold" style="cursor:pointer;" onclick="viewPurchaseReturn('${d.id}')" title="عرض تفاصيل الإشعار المدين">${d.number}</td>
        <td class="dim">${J(d.createdAt||d.date)}</td>
        <td class="mono text-2">${d.originalPurchaseNumber||"—"}</td>
        <td class="font-semibold">${d.supplierName||"—"}</td>
        <td class="dim">${d.warehouseName||"—"}</td>
        <td class="mono">${R(d.subtotal)}</td>
        <td class="mono text-warn">${R(d.totalVat)}</td>
        <td class="mono font-bold text-good">${R(d.totalWithVat)}</td>
        <td style="text-align:center;">
          <div style="display:flex; gap:4px; justify-content:center; flex-wrap:wrap;">
            <button class="btn btn-icon sm btn-ghost" onclick="viewPurchaseReturn('${d.id}')" title="عرض تفاصيل الإشعار المدين">👁️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="printPurchaseReturn('${d.id}')" title="طباعة الإشعار المدين">🖨️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="editPurchaseReturn('${d.id}')" title="تعديل مردود المشتريات">✏️</button>
            <button class="btn btn-icon sm btn-ghost text-bad" onclick="deletePurchaseReturn('${d.id}')" title="حذف مردود المشتريات">🗑️</button>
          </div>
        </td>
      </tr>`).join("")}catch(t){n.innerHTML=`<tr><td colspan="9"><div class="alert bad" style="margin:8px;">${t.message}</div></td></tr>`}}}function lt(){const n=document.getElementById("pr-inv-search"),t=document.getElementById("pr-inv-results");n&&n.addEventListener("input",nt(async()=>{const a=n.value.trim().toLowerCase();if(!a){t.classList.add("hidden");return}const e=M(I.purchaseInvoices(),U("createdAt","desc"),et(100)),o=(await S(e)).docs.map(i=>({id:i.id,...i.data()})).filter(i=>(i.number||"").toLowerCase().includes(a)||(i.supplierName||"").toLowerCase().includes(a));if(o.length===0){t.classList.add("hidden");return}t.innerHTML=o.slice(0,8).map(i=>`
      <div class="autocomplete-item" onclick="selectOriginalPurchase('${i.id}')">
        <div class="flex justify-between"><span class="font-bold text-indigo">${i.number}</span><span>${R(i.totalWithVat)}</span></div>
        <div class="item-code">${i.supplierName} | ${J(i.createdAt||i.date)}</div>
      </div>`).join(""),t.classList.remove("hidden")},300))}window.selectOriginalPurchase=async n=>{try{const t=D(T,`companies/${k}/purchaseInvoices`,n),a=await q(t);if(!a.exists())return;c={id:a.id,...a.data()},document.getElementById("pr-inv-search").value=c.number,document.getElementById("pr-sup-name").value=c.supplierName,c.warehouseId&&(document.getElementById("pr-warehouse").value=c.warehouseId),document.getElementById("pr-inv-results").classList.add("hidden");const e={},m=M(I.purchaseReturns(),P("originalPurchaseId","==",c.id));(await S(m)).docs.forEach(r=>{const h=r.data();h.status!=="cancelled"&&(h.lines||[]).forEach(y=>{e[y.productId]=(e[y.productId]||0)+(y.qty||0)})});const i=document.getElementById("pr-warehouse"),v=i?i.value:c.warehouseId,d=await Y(v,c.lines||[]);B=(c.lines||[]).map(r=>{const h=e[r.productId]||0,y=Math.max(0,(r.qty||0)-h),g=d[r.productId]!==void 0?d[r.productId]:0,l=Math.min(y,g);return{...r,originalQty:r.qty||0,alreadyReturned:h,invoiceReturnable:y,currentStock:g,maxReturnable:l,taxCategory:r.taxCategory||"S",taxRate:r.taxCategory==="E"||r.taxCategory==="Z"?0:15,unit:r.unit||"حبة",qty:0}}),z(),V()}catch(t){showToast(t.message,"error")}};async function Y(n,t){const a={};if(!n||!t||t.length===0)return a;try{const e=t.map(async m=>{if(m.productId)try{const o=D(T,`companies/${k}/stockByWarehouse`,`${n}_${m.productId}`),i=await q(o);a[m.productId]=i.exists()&&i.data().qty||0}catch{a[m.productId]=0}});await Promise.all(e)}catch(e){console.warn("fetchWarehouseStockForLines error:",e)}return a}window.onPurchaseReturnWarehouseChange=async()=>{const n=document.getElementById("pr-warehouse"),t=n?n.value:null;if(!t||!c||!B.length)return;const a=await Y(t,c.lines||[]);B.forEach(e=>{e.currentStock=a[e.productId]!==void 0?a[e.productId]:0,e.maxReturnable=Math.min(e.invoiceReturnable,e.currentStock),e.qty>e.maxReturnable&&(e.qty=e.maxReturnable)}),z(),V()};function z(){const n=document.getElementById("pr-lines-tbody");n&&(n.innerHTML=B.map((t,a)=>{const e=t.qty*t.unitPrice*(1-(t.discount||0)/100),m=t.taxCategory==="E"||t.taxCategory==="Z"||t.taxRate===0,o=t.currentStock<=0;return`
      <tr style="border-bottom:1px solid var(--border-soft); ${o?"background:rgba(239,68,68,0.03);":""}">
        <td style="padding:6px 10px;">${a+1}</td>
        <td style="padding:6px 10px;font-family:var(--font-heading);">
          <b>${t.productName}</b>
          <div class="dim mono" style="font-size:10px;">${t.sku||"—"} | الوحدة: ${t.unit||"حبة"}</div>
        </td>
        <td style="padding:6px 10px;" class="mono dim">${t.originalQty} ${t.unit||""}</td>
        <td style="padding:6px 10px;text-align:center;">
          ${o?'<span class="badge bad font-bold" style="font-size:10px;padding:3px 6px;">0 (غير متوفر)</span>':`<span class="badge good font-bold" style="font-size:10px;padding:3px 6px;">${t.currentStock} متوفر</span>`}
        </td>
        <td style="padding:6px 10px;width:150px;">
          <input type="number" class="input mono font-bold ${o?"disabled":"text-warn"}" style="width:90px;height:30px;font-size:12px;${o?"background:var(--bg-2);cursor:not-allowed;":""}"
            value="${t.qty}" min="0" max="${t.maxReturnable}" step="0.001"
            ${o?'disabled title="لا يمكن الإرجاع — الرصيد في المستودع صفر"':""}
            onchange="updatePurchaseReturnQty(${a},this.value)" />
          <div style="font-size:9.5px;color:${o?"#ef4444":"var(--text-dim)"};margin-top:2px;font-weight:${o?"bold":"normal"};">
            ${o?"⚠️ الرصيد بالمستودع 0 — لا يمكن الإرجاع":`المتاح للإرجاع: ${t.maxReturnable} (سابق: ${t.alreadyReturned})`}
          </div>
        </td>
        <td style="padding:6px 10px;" class="mono">${R(t.unitPrice)}</td>
        <td style="padding:6px 10px;text-align:center;">
          ${m?'<span class="badge good" style="font-size:9.5px;padding:2px 4px;">معفى</span>':'<span class="badge warn" style="font-size:9.5px;padding:2px 4px;">15%</span>'}
        </td>
        <td style="padding:6px 10px;" class="mono font-bold">${R(e)}</td>
      </tr>`}).join(""))}window.updatePurchaseReturnQty=(n,t)=>{const a=B[n];if(a.currentStock<=0){showToast(`❌ لا يمكن إرجاع الصنف "${a.productName}" لأن رصيده في المستودع 0. إذا كان الصنف مرتجعاً من عميل، يرجى إثبات فاتورة مردود المبيعات أولاً.`,"error"),a.qty=0,z(),V();return}const e=parseFloat(t)||0;e>a.maxReturnable?(showToast(`الكمية المرجعة (${e}) لا يمكن أن تزيد عن الحد المتاح في المستودع والفاتورة (${a.maxReturnable})`,"warning"),a.qty=a.maxReturnable):a.qty=Math.max(0,e),z(),V()};function V(){const n=B.filter(a=>a.qty>0),t=tt(n);document.getElementById("pr-subtotal").textContent=R(t.subtotal),document.getElementById("pr-vat").textContent=R(t.vatTotal),document.getElementById("pr-grand").textContent=R(t.grandTotal)}function pt(n){if(!n||isNaN(n))return"صفر ريال سعودي";const t=["","واحد","اثنان","ثلاثة","أربعة","خمسة","ستة","سبعة","ثمانية","تسعة","عشرة","أحد عشر","اثنا عشر","ثلاثة عشر","أربعة عشر","خمسة عشر","ستة عشر","سبعة عشر","ثمانية عشر","تسعة عشر"],a=["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"],e=["","مئة","مئتان","ثلاثمئة","أربعمئة","خمسمئة","ستمئة","سبعمئة","ثمانمئة","تسعمئة"],m=["","ألف","ألفان","ثلاثة آلاف","أربعة آلاف","خمسة آلاف","ستة آلاف","سبعة آلاف","ثمانية آلاف","تسعة آلاف"],o=Math.floor(Math.abs(n)),i=Math.round((Math.abs(n)-o)*100);function v(l){if(l===0)return"";if(l<20)return t[l];const b=Math.floor(l/10),s=l%10;return s===0?a[b]:t[s]+" و"+a[b]}function d(l){if(l===0)return"صفر";let b="";const s=Math.floor(l/1e3),f=l%1e3,E=Math.floor(f/100),w=f%100;return s>0&&(b+=s<10?m[s]:v(s)+" ألف",(E>0||w>0)&&(b+=" و")),E>0&&(b+=e[E],w>0&&(b+=" و")),w>0&&(b+=v(w)),b}const r=Math.floor(o/1e6),h=o%1e6;let y="";r>0&&(y+=d(r)+" مليون "),y+=d(h);let g=y.trim()+" ريال سعودي";return i>0&&(g+=" و"+d(i)+" هللة"),g+=" لا غير",g}window.openPurchaseReturnModal=()=>{window._editingReturnId=null,B=[],c=null;const n=document.querySelector("#pr-modal .modal-title");n&&(n.textContent="إصدار إشعار مدين (مردود مشتريات)");const t=document.getElementById("save-pr-btn");t&&(t.textContent="💾 حفظ وخصم الإشعار المدين");const a=document.getElementById("pr-inv-search");a&&(a.value="",a.disabled=!1,a.readOnly=!1),document.getElementById("pr-sup-name").value="",document.getElementById("pr-reason").value="",document.getElementById("pr-error").classList.add("hidden"),document.getElementById("pr-number").value="جارِ التوليد...",z(),V(),openModal("pr-modal"),ot("DN").then(e=>{const m=document.getElementById("pr-number");m&&!window._editingReturnId&&(m.value=e)}).catch(()=>{})};window.savePurchaseReturn=async()=>{const n=document.getElementById("pr-error");n.classList.add("hidden");const t=!!window._editingReturnId,a=window._editingReturnId;if(!c){n.textContent="اختر فاتورة الشراء الأصلية",n.classList.remove("hidden");return}const e=B.filter(r=>r.qty>0);if(e.length===0){n.textContent="حدد كمية مرجعة لصنف واحد على الأقل",n.classList.remove("hidden");return}const m=document.getElementById("pr-warehouse"),o=m.value,i=m.options[m.selectedIndex]?.dataset.name||"",v=document.getElementById("pr-reason").value.trim();if(!o){n.textContent="اختر المخزن المسحوب منه البضاعة المرجعة",n.classList.remove("hidden");return}if(!v){n.textContent="أدخل سبب الإرجاع",n.classList.remove("hidden");return}const d=document.getElementById("save-pr-btn");d.disabled=!0,d.textContent=t?"⏳ جارٍ تحديث الإشعار المدين…":"⏳ جارٍ الحفظ وخصم الرصيد…";try{const r=tt(e),h=document.getElementById("pr-number").value,y=document.getElementById("pr-date").value,g=c.paymentMethod||"credit",l={number:h,date:y,originalPurchaseId:c.id,originalPurchaseNumber:c.number,supplierId:c.supplierId,supplierName:c.supplierName,warehouseId:o,warehouseName:i,lines:e,subtotal:r.subtotal,totalVat:r.vatTotal,totalWithVat:r.grandTotal,paymentMethod:g,reason:v,status:"issued"};if(t){const s=await A("purchaseReturns",a);if(!s)throw new Error("تعذر إيجاد الإشعار المدين السابق للتعديل");for(const p of e){const x=(s.lines||[]).find(_=>_.productId===p.productId),u=x&&x.qty||0,$=p.qty-u;if($>0){const _=D(T,`companies/${k}/stockByWarehouse`,`${o}_${p.productId}`),L=await q(_),N=L.exists()&&L.data().qty||0;if(N<$)throw new Error(`رصيد الصنف "${p.productName}" في المستودع غير كافٍ لزيادة الكمية المرجعة (المتوفر: ${N}، المطلوب خصمه إضافياً: ${$})`)}}for(const p of e){const x=(s.lines||[]).find(_=>_.productId===p.productId),u=x&&x.qty||0,$=p.qty-u;Math.abs($)>1e-4&&await O(o,p.productId,-$,{type:"purchase_return_edit",sourceType:"purchaseReturn",sourceId:a,txDocId:`tx_pur_ret_edit_${a}_${Date.now()}_${p.productId}`,documentNumber:h,notes:`تعديل مردود مشتريات (إشعار مدين ${h}) — الفارق: ${-$}`})}for(const p of s.lines||[])e.some(x=>x.productId===p.productId)||await O(o,p.productId,+p.qty,{type:"purchase_return_edit",sourceType:"purchaseReturn",sourceId:a,txDocId:`tx_pur_ret_edit_${a}_${Date.now()}_${p.productId}`,documentNumber:h,notes:`إلغاء صنف من مردود مشتريات (${h}) — إعادة ${p.qty} للمستودع`});if(s.journalEntryId)try{await Q(s.journalEntryId)}catch{}for(const p of[a,s.number])try{const x=await S(M(F(T,`companies/${k}/journalEntries`),P("sourceType","==","purchaseReturn"),P("sourceId","==",p)));for(const u of x.docs)await Q(u.id)}catch{}let f=null;try{const p=await H(I.warehouses());f=await X({id:a,returnNumber:h,date:y,supplierId:c.supplierId,supplierName:c.supplierName,paymentMethod:g,warehouseId:o,subtotal:r.subtotal,taxAmount:r.vatTotal,total:r.grandTotal},window._currentUser||{},p)}catch(p){console.warn("[PurchaseReturnEdit] Auto JE failed:",p)}const E=s.totalWithVat||s.total||0,w=r.grandTotal-E;if(c.supplierId&&Math.abs(w)>.001&&g!=="cash")try{const{increment:p,updateDoc:x,doc:u,serverTimestamp:$}=await C(async()=>{const{increment:L,updateDoc:N,doc:Z,serverTimestamp:at}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{increment:L,updateDoc:N,doc:Z,serverTimestamp:at}},[]),_=u(T,`companies/${k}/suppliers`,c.supplierId);await x(_,{balance:p(-w),updatedAt:$()})}catch(p){console.warn("[PurchaseReturnEdit] Supplier balance update failed:",p)}await G(I.purchaseReturns(),a,{...l,journalEntryId:f||s.journalEntryId||null,updatedAt:new Date().toISOString()}),window._editingReturnId=null,(window.showToast||alert)(`✅ تم تحديث الإشعار المدين ${h} وتحديث المخزون والمحاسبة بنجاح`,"success"),closeModal("pr-modal"),await j(),c.supplierId&&C(()=>import("./balance-sync-CUiyFg8g.js"),__vite__mapDeps([0,1,2])).then(p=>p.recalculateSupplierBalance(c.supplierId)).catch(p=>console.warn(p));return}for(const s of e)if(s.productId)try{const f=D(T,`companies/${k}/stockByWarehouse`,`${o}_${s.productId}`),E=await q(f),w=E.exists()&&E.data().qty||0;if(w<s.qty)throw new Error(`رصيد الصنف "${s.productName||s.productId}" في المستودع غير كافٍ لإتمام المردود (المتوفر: ${w}، المطلوب إرجاعه: ${s.qty}). يرجى التأكد من استلام بضاعة الصنف أولاً.`)}catch(f){if(f.message&&f.message.includes("غير كافٍ"))throw f;console.warn("[PurchaseReturn] Stock pre-check warning:",f)}let b=null;try{b=await st(I.purchaseReturns(),l);for(const s of e)await O(o,s.productId,-s.qty,{type:"purchase_return",sourceType:"purchaseReturn",sourceId:b,txDocId:`tx_purchase_return_${b}_${Date.now()}_${s.productId}`,documentNumber:h,notes:`مردود مشتريات (إشعار مدين ${h}) — مورد: ${c.supplierName}`})}catch(s){if(b)try{await W(I.purchaseReturns(),b),console.warn(`[PurchaseReturn] Rolled back orphan return ${b} due to stock error:`,s.message)}catch{}throw s}try{const s=await H(I.warehouses()),f=await X({id:b,returnNumber:h,date:y,supplierId:c.supplierId,supplierName:c.supplierName,paymentMethod:g,warehouseId:o,subtotal:r.subtotal,taxAmount:r.vatTotal,total:r.grandTotal},window._currentUser||{},s);f&&await G(I.purchaseReturns(),b,{journalEntryId:f})}catch(s){console.warn("[PurchaseReturn] Auto JE failed:",s)}if(g==="cash"||g==="نقدي")try{await rt({type:"in",amount:r.grandTotal,notes:`استرداد نقدي لمردود مشتريات — إشعار مدين ${h} — ${c.supplierName}`,sourceType:"purchaseReturn",sourceId:b,date:y})}catch(s){console.warn("[PurchaseReturn] Cash transaction failed:",s)}else if(["transfer","bank","cheque","check","تحويل","شيك"].includes(g))try{await it({type:"in",amount:r.grandTotal,notes:`استرداد بنكي لمردود مشتريات — إشعار مدين ${h} — ${c.supplierName}`,sourceType:"purchaseReturn",sourceId:b,date:y})}catch(s){console.warn("[PurchaseReturn] Bank transaction failed:",s)}if(c.supplierId&&r.grandTotal>0&&g!=="cash")try{const{increment:s,updateDoc:f,doc:E,serverTimestamp:w}=await C(async()=>{const{increment:x,updateDoc:u,doc:$,serverTimestamp:_}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{increment:x,updateDoc:u,doc:$,serverTimestamp:_}},[]),p=E(T,`companies/${k}/suppliers`,c.supplierId);await f(p,{balance:s(-r.grandTotal),updatedAt:w()}),console.log(`[SupplierBalance] Decremented supplier ${c.supplierId} balance by -${r.grandTotal}`)}catch(s){console.warn("Failed to update supplier balance on return:",s.message)}(window.showToast||alert)(`✅ تم إصدار الإشعار المدين ${h} وتحديث المخزون والمحاسبة بنجاح`,"success"),closeModal("pr-modal"),await j(),c.supplierId&&C(()=>import("./balance-sync-CUiyFg8g.js"),__vite__mapDeps([0,1,2])).then(s=>s.recalculateSupplierBalance(c.supplierId)).catch(s=>console.warn(s))}catch(r){n.textContent=r.message,n.classList.remove("hidden")}finally{d.disabled=!1,d.textContent=t?"💾 تحديث الإشعار المدين":"💾 حفظ وخصم الإشعار المدين"}};window.viewPurchaseReturn=async n=>{try{const t=await A("purchaseReturns",n);if(!t)throw new Error("لم يتم العثور على الإشعار المدين");document.getElementById("pr-view-title").textContent=`📜 تفاصيل الإشعار المدين — ${t.number}`;const a=(t.lines||[]).map((e,m)=>{const o=(e.qty||0)*(e.unitPrice||0)*(1-(e.discount||0)/100),i=e.taxCategory==="E"||e.taxCategory==="Z"||e.taxRate===0;return`
        <tr>
          <td style="text-align:center;">${m+1}</td>
          <td><b>${e.productName||"—"}</b><div class="dim mono" style="font-size:10px;">${e.sku||"—"}</div></td>
          <td style="text-align:center;">${e.unit||"حبة"}</td>
          <td class="mono font-bold" style="text-align:center;">${e.qty}</td>
          <td class="mono" style="text-align:center;">${R(e.unitPrice)}</td>
          <td style="text-align:center;">${i?'<span class="badge good" style="font-size:10px;">معفى</span>':'<span class="badge warn" style="font-size:10px;">15%</span>'}</td>
          <td class="mono font-bold text-good" style="text-align:center;">${R(o)}</td>
        </tr>
      `}).join("");document.getElementById("pr-view-body").innerHTML=`
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:16px; background:var(--bg-2); padding:14px; border-radius:8px; border:1px solid var(--border);">
        <div><span class="dim" style="font-size:11px;">رقم الإشعار المدين:</span> <div class="mono font-bold text-indigo" style="font-size:14px;">${t.number}</div></div>
        <div><span class="dim" style="font-size:11px;">التاريخ:</span> <div class="mono font-bold">${J(t.date||t.createdAt)}</div></div>
        <div><span class="dim" style="font-size:11px;">الفاتورة الأصلية:</span> <div class="mono font-bold">${t.originalPurchaseNumber||"—"}</div></div>
        <div><span class="dim" style="font-size:11px;">المورد:</span> <div class="font-bold">${t.supplierName||"—"}</div></div>
        <div><span class="dim" style="font-size:11px;">المخزن المرجَع منه:</span> <div>${t.warehouseName||"—"}</div></div>
        <div><span class="dim" style="font-size:11px;">طريقة السداد:</span> <div>${t.paymentMethod==="cash"?"نقدي":t.paymentMethod==="bank"?"تحويل بنكي":"آجل (ذمم دائنة)"}</div></div>
        <div style="grid-column:1/-1;"><span class="dim" style="font-size:11px;">سبب الإرجاع:</span> <div>${t.reason||"—"}</div></div>
      </div>

      <div class="table-container" style="max-height:300px; overflow-y:auto; margin-bottom:16px; border:1px solid var(--border); border-radius:6px;">
        <table class="data-dense" style="width:100%; font-size:12px;">
          <thead>
            <tr>
              <th style="width:30px; text-align:center;">#</th>
              <th>الصنف</th>
              <th style="text-align:center;">الوحدة</th>
              <th style="text-align:center;">الكمية المرجعة</th>
              <th style="text-align:center;">سعر الوحدة</th>
              <th style="text-align:center;">الضريبة</th>
              <th style="text-align:center;">الإجمالي المرجع</th>
            </tr>
          </thead>
          <tbody>${a}</tbody>
        </table>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px;">
        <div style="font-size:12px;">
          ${t.journalEntryId?`<span class="badge" style="background:rgba(59,130,246,0.1); color:#2563eb; border:1px solid rgba(59,130,246,0.3);">📘 قيد رقم: ${t.journalEntryId.slice(0,8)}</span>`:""}
        </div>
        <div class="invoice-totals" style="width:280px;">
          <div class="invoice-total-row"><span>المجموع قبل الضريبة:</span><span class="mono font-bold">${R(t.subtotal)}</span></div>
          <div class="invoice-total-row"><span>ضريبة القيمة المضافة (15%):</span><span class="mono text-warn font-bold">${R(t.totalVat)}</span></div>
          <div class="invoice-total-row grand-total"><span>صافي الإشعار المدين:</span><span class="mono font-bold text-good">${R(t.totalWithVat)}</span></div>
        </div>
      </div>
    `,document.getElementById("pr-view-footer").innerHTML=`
      <div style="display:flex; gap:8px; justify-content:space-between; width:100%; flex-wrap:wrap;">
        <button class="btn btn-ghost text-bad" onclick="closeModal('pr-view-modal'); deletePurchaseReturn('${t.id}')">🗑️ حذف الإشعار</button>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary" onclick="closeModal('pr-view-modal')">إغلاق</button>
          <button class="btn btn-secondary" onclick="closeModal('pr-view-modal'); editPurchaseReturn('${t.id}')">✏️ تعديل</button>
          <button class="btn btn-primary" onclick="printPurchaseReturn('${t.id}')">🖨️ طباعة الإشعار</button>
        </div>
      </div>
    `,openModal("pr-view-modal")}catch(t){(window.showToast||alert)("خطأ: "+t.message,"error")}};window.editPurchaseReturn=async n=>{try{const t=await A("purchaseReturns",n);if(!t)throw new Error("لم يتم العثور على الإشعار المدين");window._editingReturnId=n;const a=document.querySelector("#pr-modal .modal-title");a&&(a.textContent=`✏️ تعديل إشعار مدين (مردود مشتريات) — ${t.number}`);const e=document.getElementById("save-pr-btn");e&&(e.textContent="💾 تحديث الإشعار المدين");const m=document.getElementById("pr-inv-search");m&&(m.value=t.originalPurchaseNumber||"",m.disabled=!0),document.getElementById("pr-number").value=t.number,document.getElementById("pr-date").value=t.date||K(),document.getElementById("pr-sup-name").value=t.supplierName||"",t.warehouseId&&(document.getElementById("pr-warehouse").value=t.warehouseId),document.getElementById("pr-reason").value=t.reason||"",document.getElementById("pr-error").classList.add("hidden");const o=D(T,`companies/${k}/purchaseInvoices`,t.originalPurchaseId),i=await q(o);if(!i.exists())throw new Error("فاتورة الشراء الأصلية غير موجودة");c={id:i.id,...i.data()};const v={},d=M(I.purchaseReturns(),P("originalPurchaseId","==",c.id));(await S(d)).docs.forEach(l=>{if(l.id===n)return;const b=l.data();b.status!=="cancelled"&&(b.lines||[]).forEach(s=>{v[s.productId]=(v[s.productId]||0)+(s.qty||0)})});const h=t.warehouseId||c.warehouseId,y=await Y(h,c.lines||[]),g={};(t.lines||[]).forEach(l=>{g[l.productId]=l}),B=(c.lines||[]).map(l=>{const b=v[l.productId]||0,s=Math.max(0,(l.qty||0)-b),f=y[l.productId]!==void 0?y[l.productId]:0,E=g[l.productId],w=E&&E.qty||0,p=Math.min(s,f+w);return{...l,originalQty:l.qty||0,alreadyReturned:b,invoiceReturnable:s,currentStock:f,maxReturnable:p,taxCategory:l.taxCategory||"S",taxRate:l.taxCategory==="E"||l.taxCategory==="Z"?0:15,unit:l.unit||"حبة",qty:w,oldQty:w}}),z(),V(),openModal("pr-modal")}catch(t){(window.showToast||alert)("خطأ في فتح التعديل: "+t.message,"error")}};window.deletePurchaseReturn=async n=>{try{const t=await A("purchaseReturns",n);if(!t)throw new Error("لم يتم العثور على الإشعار المدين");if(!(window.showConfirm?await window.showConfirm(`هل أنت متأكد من حذف الإشعار المدين "${t.number}" نهائياً؟
سيتم إعادة الأصناف المرجعة إلى رصيد المستودع (${t.warehouseName||"المستودع"}) وإلغاء القيد وعكس رصيد المورد.`,"تأكيد حذف الإشعار المدين"):confirm(`هل أنت متأكد من حذف الإشعار المدين "${t.number}" نهائياً؟`)))return;const e=t.warehouseId;if(e&&Array.isArray(t.lines)){for(const o of t.lines)if(!(!o.productId||!(o.qty>0)))try{await O(e,o.productId,o.qty,{type:"purchase_return_reverse",sourceType:"purchaseReturn",sourceId:n,txDocId:`tx_pur_ret_rev_${n}_${Date.now()}_${o.productId}`,documentNumber:t.number,notes:`إلغاء مردود مشتريات (إشعار مدين ${t.number}) — إعادة ${o.qty} ${o.unit||""} للمستودع`})}catch(i){console.warn("[deletePurchaseReturn] Stock reversal warning:",i.message)}}if(t.journalEntryId)try{await Q(t.journalEntryId),console.log(`[deletePurchaseReturn] Deleted JE ${t.journalEntryId}`)}catch(o){console.warn("[deletePurchaseReturn] JE delete error:",o.message)}for(const o of[n,t.number])try{const i=await S(M(F(T,`companies/${k}/journalEntries`),P("sourceType","==","purchaseReturn"),P("sourceId","==",o)));for(const v of i.docs)await Q(v.id)}catch{}try{const o=M(F(T,`companies/${k}/cashTransactions`),P("sourceId","==",n),P("sourceType","==","purchaseReturn")),i=await S(o);for(const r of i.docs)await W(I.cashTransactions?I.cashTransactions():"cashTransactions",r.id);const v=M(F(T,`companies/${k}/bankTransactions`),P("sourceId","==",n),P("sourceType","==","purchaseReturn")),d=await S(v);for(const r of d.docs)await W(I.bankTransactions?I.bankTransactions():"bankTransactions",r.id)}catch(o){console.warn("[deletePurchaseReturn] Cash/bank cleanup warning:",o)}const m=t.totalWithVat||t.total||0;if(t.supplierId&&m>0&&t.paymentMethod!=="cash")try{const{increment:o,updateDoc:i,doc:v,serverTimestamp:d}=await C(async()=>{const{increment:h,updateDoc:y,doc:g,serverTimestamp:l}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{increment:h,updateDoc:y,doc:g,serverTimestamp:l}},[]),r=v(T,`companies/${k}/suppliers`,t.supplierId);await i(r,{balance:o(m),updatedAt:d()})}catch(o){console.warn("[deletePurchaseReturn] Supplier balance reverse warning:",o.message)}await W(I.purchaseReturns(),n),t.supplierId&&C(()=>import("./balance-sync-CUiyFg8g.js"),__vite__mapDeps([0,1,2])).then(o=>o.recalculateSupplierBalance(t.supplierId)).catch(o=>console.warn(o)),(window.showToast||alert)(`✅ تم حذف الإشعار المدين ${t.number} وإعادة الأصناف للمستودع وتحديث الحسابات بنجاح`,"success"),await j()}catch(t){(window.showToast||alert)("خطأ في الحذف: "+t.message,"error")}};window.printPurchaseReturn=async n=>{try{let t=typeof n=="object"?n:null;if(t||(t=await A("purchaseReturns",n)),!t)throw new Error("لم يتم العثور على الإشعار المدين");let a={};try{a=JSON.parse(localStorage.getItem("idham_company")||"{}")}catch{}try{const[u,$]=await Promise.all([q(D(T,`companies/${k}/settings`,"company")),q(D(T,`companies/${k}/settings`,"logo"))]);u.exists()&&Object.assign(a,u.data()),$.exists()&&$.data().dataUrl&&(a.logoUrl=$.data().dataUrl)}catch{}const e=a.name||a.companyName||"مؤسسة ادهام للمواد الغذائية",m=a.vatNumber||a.vat||"300000000000003",o=a.crNumber||a.commercialRegistration||"",i=a.phone||"",v=[a.address,a.city,a.country].filter(Boolean).join("، ")||"ينبع، المملكة العربية السعودية",d=a.logoUrl||"";let r="",h="",y="",g="";if(t.supplierId)try{const u=await A("suppliers",t.supplierId);u&&(r=u.vatNumber||u.vat||"",h=u.phone||"",y=u.address||"",g=u.crNumber||"")}catch{}const l=parseFloat(t.subtotal||0),b=parseFloat(t.totalVat||0),s=parseFloat(t.totalWithVat||l+b),f=pt(s),w=(t.lines||[]).map((u,$)=>{const _=(u.qty||0)*(u.unitPrice||0)*(1-(u.discount||0)/100),L=u.taxCategory==="E"||u.taxCategory==="Z"||u.taxRate===0,N=L?0:_*.15,Z=_+N;return`
        <tr>
          <td style="text-align:center;">${$+1}</td>
          <td style="font-family:monospace; text-align:center;">${u.sku||"—"}</td>
          <td><strong>${u.productName||"—"}</strong></td>
          <td style="text-align:center;">${u.unit||"حبة"}</td>
          <td style="text-align:center; font-weight:bold; font-family:monospace;">${u.qty}</td>
          <td style="text-align:left; font-family:monospace;">${(u.unitPrice||0).toFixed(2)}</td>
          <td style="text-align:center;">${L?"0%":"15%"}</td>
          <td style="text-align:left; font-family:monospace;">${N.toFixed(2)}</td>
          <td style="text-align:left; font-weight:bold; font-family:monospace;">${Z.toFixed(2)}</td>
        </tr>
      `}).join(""),p=`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>إشعار مدين ضريبي — ${t.number}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    body { background:#fff; color:#1e293b; padding:24px; direction:rtl; font-size:12px; }
    .print-container { max-width:850px; margin:0 auto; border:1px solid #cbd5e1; border-radius:8px; padding:28px; }
    .header { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #2563eb; padding-bottom:18px; margin-bottom:18px; }
    .header-logo { max-height:75px; max-width:180px; object-fit:contain; }
    .header-info h2 { font-size:20px; font-weight:900; color:#1e3a8a; margin-bottom:4px; }
    .header-info p { font-size:11px; color:#64748b; margin:2px 0; }
    .doc-title-badge { background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:12px 18px; text-align:center; }
    .doc-title-badge h1 { font-size:18px; font-weight:900; color:#1e40af; margin:0; }
    .doc-title-badge div { font-size:12px; font-weight:700; color:#3b82f6; margin-top:2px; }
    .doc-title-badge .dn-num { font-family:monospace; font-size:15px; font-weight:900; color:#0f172a; margin-top:4px; }
    
    .meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:18px; }
    .meta-box { border:1px solid #e2e8f0; border-radius:6px; padding:12px; background:#f8fafc; font-size:11.5px; }
    .meta-box h3 { font-size:12px; font-weight:800; color:#1e293b; border-bottom:1px solid #e2e8f0; padding-bottom:6px; margin-bottom:8px; }
    .meta-row { display:flex; justify-content:space-between; margin-bottom:4px; }
    .meta-row .lbl { color:#64748b; }
    .meta-row .val { font-weight:700; color:#0f172a; }
    
    table { width:100%; border-collapse:collapse; margin-bottom:18px; font-size:11.5px; }
    th { background:#f1f5f9; color:#334155; font-weight:800; border:1px solid #cbd5e1; padding:8px 6px; text-align:center; }
    td { border:1px solid #e2e8f0; padding:7px 6px; }
    
    .summary-grid { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; gap:20px; }
    .tafqeet-box { flex:1; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:12px; font-size:11.5px; }
    .totals-box { width:280px; border:1px solid #cbd5e1; border-radius:6px; overflow:hidden; }
    .tot-row { display:flex; justify-content:space-between; padding:7px 12px; border-bottom:1px solid #e2e8f0; font-size:11.5px; }
    .tot-row.grand { background:#1e40af; color:#fff; font-size:13px; font-weight:900; border-bottom:none; }
    
    .signatures { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-top:28px; text-align:center; }
    .sig-card { border-top:1px dashed #94a3b8; padding-top:10px; font-size:11px; color:#475569; }
    .sig-card strong { display:block; font-size:12px; color:#0f172a; margin-bottom:30px; }
    
    @media print {
      body { padding:0; }
      .print-container { border:none; padding:10px; }
      .no-print { display:none !important; }
    }
  </style>
</head>
<body>
  <div class="print-container">
    <div class="no-print" style="text-align:left; margin-bottom:12px;">
      <button onclick="window.print()" style="padding:8px 18px; background:#2563eb; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">🖨️ طباعة الإشعار</button>
      <button onclick="window.close()" style="padding:8px 14px; background:#e2e8f0; color:#1e293b; border:none; border-radius:6px; cursor:pointer; margin-right:8px;">إغلاق</button>
    </div>

    <div class="header">
      <div class="header-info">
        <h2>${e}</h2>
        ${o?`<p>سجل تجاري: <strong>${o}</strong></p>`:""}
        <p>الرقم الضريبي: <strong>${m}</strong></p>
        <p>العنوان: ${v} ${i?`| هاتف: ${i}`:""}</p>
      </div>
      <div class="doc-title-badge">
        <h1>إشعار مدين ضريبي</h1>
        <div>TAX DEBIT NOTE (مردود مشتريات)</div>
        <div class="dn-num">${t.number}</div>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <h3>بيانات الإشعار المدين</h3>
        <div class="meta-row"><span class="lbl">رقم الإشعار:</span><span class="val mono">${t.number}</span></div>
        <div class="meta-row"><span class="lbl">تاريخ الإشعار:</span><span class="val">${J(t.date||t.createdAt)}</span></div>
        <div class="meta-row"><span class="lbl">فاتورة الشراء الأصلية:</span><span class="val mono">${t.originalPurchaseNumber||"—"}</span></div>
        <div class="meta-row"><span class="lbl">المستودع المرجَع منه:</span><span class="val">${t.warehouseName||"—"}</span></div>
        <div class="meta-row"><span class="lbl">طريقة التسوية:</span><span class="val">${t.paymentMethod==="cash"?"استرداد نقدي":t.paymentMethod==="bank"?"تحويل بنكي":"خصم من حساب المورد (آجل)"}</span></div>
        ${t.reason?`<div class="meta-row"><span class="lbl">سبب الإرجاع:</span><span class="val">${t.reason}</span></div>`:""}
      </div>
      <div class="meta-box">
        <h3>بيانات المورد (الدائن)</h3>
        <div class="meta-row"><span class="lbl">اسم المورد:</span><span class="val">${t.supplierName||"—"}</span></div>
        ${r?`<div class="meta-row"><span class="lbl">الرقم الضريبي:</span><span class="val mono">${r}</span></div>`:""}
        ${g?`<div class="meta-row"><span class="lbl">السجل التجاري:</span><span class="val mono">${g}</span></div>`:""}
        ${h?`<div class="meta-row"><span class="lbl">الهاتف:</span><span class="val mono">${h}</span></div>`:""}
        ${y?`<div class="meta-row"><span class="lbl">العنوان:</span><span class="val">${y}</span></div>`:""}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:28px;">#</th>
          <th style="width:90px;">الكود</th>
          <th>بيان الصنف</th>
          <th style="width:50px;">الوحدة</th>
          <th style="width:60px;">الكمية</th>
          <th style="width:75px;">السعر</th>
          <th style="width:45px;">الضريبة</th>
          <th style="width:70px;">مبلغ VAT</th>
          <th style="width:85px;">الإجمالي</th>
        </tr>
      </thead>
      <tbody>
        ${w}
      </tbody>
    </table>

    <div class="summary-grid">
      <div class="tafqeet-box">
        <div style="font-weight:700; margin-bottom:4px; color:#475569;">المبلغ كتابةً:</div>
        <div style="font-size:12px; font-weight:800; color:#1e3a8a;">${f}</div>
        <div style="margin-top:10px; font-size:10px; color:#94a3b8;">
          * يعتبر هذا الإشعار مستنداً ضريبياً رسمياً لتخفيض قيمة المشتريات المذكورة أعلاه ورد الضريبة وفقاً للائحة هيئة الزكاة والضريبة والجمارك (ZATCA).
        </div>
      </div>
      <div class="totals-box">
        <div class="tot-row"><span>المجموع الخاضع للضريبة:</span><span class="mono font-bold">${l.toFixed(2)} ر.س</span></div>
        <div class="tot-row"><span>ضريبة القيمة المضافة (15%):</span><span class="mono font-bold">${b.toFixed(2)} ر.س</span></div>
        <div class="tot-row grand"><span>الصافي المسترد / المخصوم:</span><span class="mono">${s.toFixed(2)} ر.س</span></div>
      </div>
    </div>

    <div class="signatures">
      <div class="sig-card">
        <strong>أمين المستودع (المُسلّم)</strong>
        <span>التوقيع: ............................</span>
      </div>
      <div class="sig-card">
        <strong>مندوب المورد (المُستلِم)</strong>
        <span>الاسم والتوقيع: ............................</span>
      </div>
      <div class="sig-card">
        <strong>المحاسب / الإدارة المالية</strong>
        <span>الختم والاعتماد: ............................</span>
      </div>
    </div>

    <div style="text-align:center; font-size:9px; color:#94a3b8; margin-top:24px; border-top:1px solid #f1f5f9; padding-top:8px;">
      نظام إدهام ERP — طُبع بتاريخ ${new Date().toLocaleDateString("ar-SA")} ${new Date().toLocaleTimeString("ar-SA")}
    </div>
  </div>
</body>
</html>`,x=window.open("","_blank","width=850,height=1000");if(!x){alert("يرجى السماح بالنوافذ المنبثقة للطباعة");return}x.document.write(p),x.document.close(),x.onload=()=>setTimeout(()=>x.print(),500)}catch(t){(window.showToast||alert)("خطأ في الطباعة: "+t.message,"error")}};export{vt as render};
