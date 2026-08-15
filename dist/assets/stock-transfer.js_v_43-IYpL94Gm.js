import{t as H,g as M,C as E,d as g,a as h,b as Q,p as K,o as D,x as Y,v as L,u as _,n as G,k as F,e as X}from"./index-HrCilPJ3.js";import{orderBy as S,query as C,collection as z,limit as Z,getDocs as W,where as B,deleteDoc as tt,doc as $,getDoc as k}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function P(t,e){const a=/سيارة|مندوب|vehicle|car|\brep\b/i.test(e||""),s=a?"1-1-4-2":"1-1-4-1";try{const n=z(g,`companies/${h}/chartOfAccounts`);if(t){const p=C(n,B("sourceEntityId","==",t)),o=await W(p);if(!o.empty){const u=o.docs[0],b=u.data();return console.log(`[TransferJE] ✅ حساب بـ sourceEntityId: ${b.code} - ${b.name}`),{code:b.code,id:u.id,name:b.name}}}const d=C(n,B("parentCode","==",s)),i=(await W(d)).docs.map(p=>({id:p.id,...p.data()})).sort((p,o)=>(o.name||"").length-(p.name||"").length),r=(e||"").trim();for(const p of i){const o=p.name||"";if(o===r||o.includes(r)||r.includes(o))return{code:p.code,id:p.id,name:o}}const y=C(n,B("code","==",s)),l=await W(y);if(!l.empty){const p=l.docs[0];return{code:p.data().code,id:p.id,name:p.data().name}}}catch(n){console.warn("[TransferJE] COA lookup failed:",n.message)}return{code:s,id:s,name:a?"مخزون سيارات التوزيع":"مخزون المستودع الرئيسي"}}async function et(t){try{const e=await k($(g,`companies/${h}/products`,t));if(e.exists()){const a=e.data();return parseFloat(a.averageCost||a.costPrice||a.purchasePrice||0)}}catch{}return 0}async function O(t){let e=0;for(const i of t.lines||[]){const r=i.costPrice||await et(i.productId);e+=Math.round(r*i.qty*100)/100}if(e<.001)return console.warn("[TransferJE] تحذير: لا تكلفة متاحة للتحويل",t.id,"— القيد لن يُنشأ"),null;const a=C(E.journalEntries(),B("sourceType","==","stockTransfer"),B("sourceId","==",t.id)),s=await W(a);if(!s.empty)return console.log("[TransferJE] القيد موجود بالفعل للتحويل",t.id),s.docs[0].id;const n=await P(t.fromWarehouseId,t.fromWarehouseName),d=await P(t.toWarehouseId,t.toWarehouseName),c=await X({date:t.date||new Date().toISOString().slice(0,10),description:`تحويل مخزني ${t.number} — من ${t.fromWarehouseName} إلى ${t.toWarehouseName}`,lines:[{accountCode:d.code,accountId:d.id,accountName:d.name,debit:Math.round(e*100)/100,credit:0,note:`استلام مخزون — تحويل ${t.number}`},{accountCode:n.code,accountId:n.id,accountName:n.name,debit:0,credit:Math.round(e*100)/100,note:`صرف مخزون — تحويل ${t.number}`}],sourceType:"stockTransfer",sourceId:t.id,status:"posted",createdByName:window._transferUser?.displayName||window._transferUser?.email||"النظام"});return console.log(`[TransferJE] تم إنشاء القيد للتحويل ${t.number} — قيمة: ${e}`),c}let A=[],I=[],R=[],f=[],m=null;function st(t,e){let a="";for(let s=0;s<e;s++){a+='<tr class="skeleton-row">';for(let n=0;n<t;n++){const d=40+Math.floor(Math.random()*80);a+=`<td><div class="sk" style="width:${d}px; height:12px; margin:4px 0;"></div></td>`}a+="</tr>"}return a}async function pt(t,e){window._transferUser=e,t.innerHTML=`
    <div class="filterbar">
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="st-from" value="${new Date(new Date().setDate(1)).toISOString().split("T")[0]}" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="st-to" value="${H()}" />
      </div>
      <div style="margin-right:auto;">
        <button class="btn btn-primary" onclick="openTransferModal()">+ أمر تحويل جديد</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">تحويل بضاعة بين المخازن</h1>
        <p class="page-subtitle" id="st-count">سجل حركة التحويلات بين المخازن</p>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid mb-20" id="st-kpi-area">
        <div class="kpi-card g-blue">
          <div class="kpi-icon">📦</div>
          <div class="kpi-content"><div class="kpi-label">إجمالي التحويلات</div>
            <div class="kpi-value mono" id="st-kpi-total">—</div></div></div>
        <div class="kpi-card g-orange">
          <div class="kpi-icon">🚚</div>
          <div class="kpi-content"><div class="kpi-label">قيد النقل (ترانزيت)</div>
            <div class="kpi-value mono" id="st-kpi-transit">—</div></div></div>
        <div class="kpi-card g-green">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content"><div class="kpi-label">تم الاستلام مخزنياً</div>
            <div class="kpi-value mono" id="st-kpi-received">—</div></div></div>
        <div class="kpi-card g-purple">
          <div class="kpi-icon">🔢</div>
          <div class="kpi-content"><div class="kpi-label">عدد الأصناف المحولة</div>
            <div class="kpi-value mono" id="st-kpi-items">—</div></div></div>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>رقم التحويل</th>
                <th>التاريخ</th>
                <th>من مخزن</th>
                <th>إلى مخزن</th>
                <th>الأصناف</th>
                <th>الحالة</th>
                <th>البيان / ملاحظات</th>
                <th>المستخدم</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="st-tbody">
              <tr><td colspan="9" style="text-align:center;padding:20px;">جاري التحميل...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Stock Transfer Modal -->
    <div class="modal-overlay" id="transfer-modal">
      <div class="modal modal-xl">
        <div class="modal-header">
          <h3 class="modal-title">أمر تحويل مخزني جديد</h3>
          <button class="modal-close" onclick="closeModal('transfer-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group">
              <label>الرقم المرجعي</label>
              <input type="text" id="st-number" class="input mono" readonly placeholder="يُولَّد تلقائياً" />
            </div>
            <div class="form-group">
              <label>المخزن المصدر (من) *</label>
              <select id="st-from-wh" onchange="updateAllAvailableStock()">
                <option value="">اختر المخزن المصدر</option>
              </select>
            </div>
            <div class="form-group">
              <label>المخزن المستلم (إلى) *</label>
              <select id="st-to-wh">
                <option value="">اختر المخزن المستلم</option>
              </select>
            </div>
          </div>

          <div style="background:var(--bg-2); border-radius:8px; padding:12px; margin-bottom:16px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; flex-wrap:wrap; gap:10px;">
              <strong style="font-size:13px; color:var(--primary);">📋 الأصناف المراد تحويلها</strong>
              <div style="display:flex; gap:8px; align-items:center;">
                <select id="st-product-category-filter" class="input" style="width:160px; height:34px; font-size:12px; padding:4px 8px;">
                  <option value="">كل الفئات</option>
                </select>
                <div class="autocomplete-container" style="width:360px;">
                  <input type="text" id="st-product-search" class="input" style="height:34px; font-size:12px;" placeholder="ابحث باسم الصنف أو الكود للإضافة…" autocomplete="off" />
                  <div class="autocomplete-results hidden" id="st-product-results"></div>
                </div>
              </div>
            </div>

            <!-- Transfer Items Lines Table -->
            <div style="max-height:220px; overflow-y:auto; border:1px solid var(--border); border-radius:6px; background:#fff;">
              <table style="width:100%; font-size:12px; border-collapse:collapse;">
                <thead>
                  <tr style="background:var(--bg-3); position:sticky; top:0; z-index:1;">
                    <th style="padding:8px 10px; text-align:right;">#</th>
                    <th style="padding:8px 10px; text-align:right;">اسم الصنف</th>
                    <th style="padding:8px 10px; text-align:right;">الكود</th>
                    <th style="padding:8px 10px; text-align:right;">الوحدة</th>
                    <th style="padding:8px 10px; text-align:right; color:var(--primary);">الرصيد المتاح</th>
                    <th style="padding:8px 10px; text-align:right; width:100px;">الكمية</th>
                    <th style="padding:8px 6px;"></th>
                  </tr>
                </thead>
                <tbody id="st-lines-tbody">
                  <tr><td colspan="7" style="text-align:center;padding:16px;color:var(--text-2);">لم يتم إضافة أصناف بعد</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>التاريخ *</label>
              <input type="date" id="st-date" class="input" value="${H()}" />
            </div>
            <div class="form-group">
              <label>ملاحظات / سبب التحويل</label>
              <input type="text" id="st-notes" class="input" placeholder="مثال: تغذية فرع شمال، إعادة توزيع..." />
            </div>
          </div>

          <div id="st-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('transfer-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="executeTransfer()" id="exec-st-btn">💾 تنفيذ التحويل (قيد النقل)</button>
        </div>
      </div>
    </div>

    <!-- View Transfer Details Modal -->
    <div class="modal-overlay" id="view-transfer-modal">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 class="modal-title" id="view-st-title">تفاصيل التحويل المخزني</h3>
          <button class="modal-close" onclick="closeModal('view-transfer-modal')">×</button>
        </div>
        <div class="modal-body" id="view-st-body" style="padding:20px;"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('view-transfer-modal')">إغلاق</button>
          <button class="btn btn-ghost" id="st-print-btn" onclick="printStockTransfer()" style="display:inline-flex; align-items:center; gap:6px;">🖨️ طباعة سند التحويل</button>
          <button class="btn btn-ghost text-bad" id="st-cancel-btn" onclick="cancelTransfer()" style="margin-right:auto;">🚫 إلغاء الأمر</button>
          <button class="btn btn-secondary" id="st-edit-btn" onclick="openEditTransferModal()" style="display:none;">✏️ تعديل الأمر</button>
          <button class="btn btn-primary" id="st-confirm-btn" onclick="confirmReceipt()">✅ تأكيد الاستلام الفعلي في المخزن المستلم</button>
          <button class="btn btn-primary" id="st-approve-btn" onclick="approveTransferRequest()" style="background-color:var(--good); border-color:var(--good); margin-left:8px; display:none;">✔️ موافقة وشحن السيارة</button>
          <button class="btn btn-ghost text-bad" id="st-reject-btn" onclick="rejectTransferRequest()" style="margin-right:auto; display:none;">❌ رفض الطلب</button>
        </div>
      </div>
    </div>`,await J(),await N(),nt()}async function J(){try{A=await M(E.warehouses(),[S("name")]);const t=document.getElementById("st-from-wh"),e=document.getElementById("st-to-wh");if(t&&e){const a=A.map(s=>`<option value="${s.id}" data-name="${s.name}">${s.name}</option>`).join("");t.innerHTML='<option value="">اختر المخزن المصدر</option>'+a,e.innerHTML='<option value="">اختر المخزن المستلم</option>'+a}M(E.products(),[S("name")]).then(a=>{I=a}),M(E.categories(),[S("name")]).then(a=>{R=a;const s=document.getElementById("st-product-category-filter");s&&(s.innerHTML='<option value="">كل الفئات</option>'+R.map(n=>`<option value="${n.id}">${n.name}</option>`).join(""))})}catch{}}async function N(){const t=document.getElementById("st-tbody");if(t){t.innerHTML=st(9,8);try{const e=C(z(g,`companies/${h}/stockTransfers`),S("createdAt","desc"),Z(100)),s=(await W(e)).docs.map(o=>({id:o.id,...o.data()}));document.getElementById("st-count").textContent=`${s.length} أمر تحويل مخزني`;const n=s.length,d=s.filter(o=>o.status==="in_transit").length,c=s.filter(o=>o.status==="received").length,i=s.reduce((o,u)=>o+(u.lines||[]).length,0),r=document.getElementById("st-kpi-total");r&&(r.textContent=n);const y=document.getElementById("st-kpi-transit");y&&(y.textContent=d);const l=document.getElementById("st-kpi-received");l&&(l.textContent=c);const p=document.getElementById("st-kpi-items");if(p&&(p.textContent=i),s.length===0){t.innerHTML='<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد تحويلات مخزنية مسجلة</td></tr>';return}t.innerHTML=s.map(o=>{let u="";return o.status==="requested"?u='<span class="badge indigo">⏳ طلب شحن</span>':o.status==="in_transit"?u='<span class="badge warn">🚚 قيد النقل</span>':o.status==="received"?u='<span class="badge good">✅ تم الاستلام</span>':u='<span class="badge neutral">🚫 ملغى</span>',`
        <tr style="cursor:pointer;" onclick="viewTransfer('${o.id}')">
          <td class="mono font-bold text-indigo">${o.number||o.id.slice(0,8)}</td>
          <td class="dim">${Q(o.createdAt||o.date)}</td>
          <td><span class="badge neutral">${o.fromWarehouseName||o.fromWarehouseId}</span></td>
          <td><span class="badge indigo">${o.toWarehouseName||o.toWarehouseId}</span></td>
          <td class="mono font-semibold">${(o.lines||[]).length} أصناف</td>
          <td>${u}</td>
          <td class="dim">${o.notes||"—"}</td>
          <td class="dim" style="font-size:11px;">${o.createdByName||"النظام"}</td>
          <td>
            <button class="btn btn-icon sm btn-ghost" onclick="event.stopPropagation();viewTransfer('${o.id}')">👁️</button>
          </td>
        </tr>`}).join("")}catch(e){t.innerHTML=`<tr><td colspan="9"><div class="alert bad" style="margin:8px;">${e.message}</div></td></tr>`}}}function nt(){const t=document.getElementById("st-product-search"),e=document.getElementById("st-product-results"),a=document.getElementById("st-product-category-filter");if(!t)return;const s=()=>{const n=t.value.trim().toLowerCase(),d=a?a.value:"";if(!n&&!d){e.classList.add("hidden");return}let c=I;if(d&&(c=c.filter(l=>l.category===d)),n&&(c=c.filter(l=>(l.name||"").toLowerCase().includes(n)||(l.sku||"").toLowerCase().includes(n)||(l.barcode||"").includes(n))),c=c.slice(0,15),!c.length){e.innerHTML='<div style="padding:10px;text-align:center;color:var(--text-2);font-size:12px;">لا توجد نتائج</div>',e.classList.remove("hidden");return}const i=document.getElementById("st-from-wh")?.value,r=window.ERP_CACHE[`companies/${h}/stockByWarehouse`],y=r&&Array.isArray(r.data)?r.data:[];e.innerHTML=c.map(l=>{const p=y.find(u=>u.productId===l.id&&u.warehouseId===i),o=p?p.qty:0;return`
        <div class="autocomplete-item" onclick="addTransferLine('${l.id}','${(l.name||"").replace(/'/g,"\\'")}','${l.unit||"PCS"}','${l.sku||""}')">
          <div class="flex justify-between">
            <span>${l.name}</span>
            <span class="badge ${o>0?"good":"bad"}" style="font-size:10px;">المتاح: ${o}</span>
          </div>
          <div class="item-code">${l.sku||""} | ${l.unit||""}</div>
        </div>
      `}).join(""),e.classList.remove("hidden")};t.addEventListener("input",K(s,200)),t.addEventListener("focus",s),a&&a.addEventListener("change",s),document.addEventListener("click",n=>{!t.contains(n.target)&&!e.contains(n.target)&&(!a||!a.contains(n.target))&&e.classList.add("hidden")})}window.addTransferLine=async(t,e,a,s)=>{if(document.getElementById("st-product-search").value="",document.getElementById("st-product-results").classList.add("hidden"),f.some(c=>c.productId===t)){showToast("الصنف مضاف بالفعل","warn");return}const n=document.getElementById("st-from-wh").value;let d=0;if(n){const i=(await D(t)).find(r=>r.warehouseId===n);d=i?i.qty:0}f.push({productId:t,productName:e,unit:a,sku:s,qty:1,availQty:d}),T()};window.updateAllAvailableStock=async()=>{const t=document.getElementById("st-from-wh").value;if(!t){f.forEach(e=>e.availQty=0),T();return}for(const e of f)try{const s=(await D(e.productId)).find(n=>n.warehouseId===t);e.availQty=s?s.qty:0}catch{e.availQty=0}T()};function T(){const t=document.getElementById("st-lines-tbody");if(t){if(f.length===0){t.innerHTML='<tr><td colspan="7" style="text-align:center;padding:16px;color:var(--text-2);">لم يتم إضافة أصناف بعد</td></tr>';return}t.innerHTML=f.map((e,a)=>{const s=e.qty>e.availQty;return`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:6px 10px;color:var(--text-2);width:30px;">${a+1}</td>
        <td style="padding:6px 10px;font-weight:600;">${e.productName}</td>
        <td style="padding:6px 10px;" class="mono dim">${e.sku||"—"}</td>
        <td style="padding:6px 10px;" class="dim">${e.unit||"—"}</td>
        <td style="padding:6px 10px;" class="mono font-semibold ${e.availQty>0?"text-good":"text-bad"}">${e.availQty}</td>
        <td style="padding:6px 10px;width:100px;">
          <input type="number" class="input mono" style="width:90px;height:30px;font-size:12px;${s?"border-color:var(--bad);background-color:rgba(239,68,68,0.05);":""}"
            value="${e.qty}" min="0.001" step="0.001"
            onchange="updateTransferLineQty(${a},this.value)" />
        </td>
        <td style="padding:6px 10px;text-align:center;">
          <button class="btn btn-icon sm btn-ghost" onclick="removeTransferLine(${a})" style="color:var(--bad);">✕</button>
        </td>
      </tr>`}).join("")}}window.updateTransferLineQty=(t,e)=>{f[t].qty=parseFloat(e)||0,T()};window.removeTransferLine=t=>{f.splice(t,1),T()};window.openTransferModal=async()=>{window._editingTransferId=null,window._editingTransferSnap=null,f=[],T(),document.getElementById("st-product-search").value="",document.getElementById("st-notes").value="",document.getElementById("st-error").classList.add("hidden"),document.getElementById("st-number").value="جارٍ التوليد...";const t=document.querySelector("#transfer-modal .modal-title");t&&(t.textContent="أمر تحويل مخزني جديد");const e=document.getElementById("exec-st-btn");e&&(e.textContent="💾 تنفيذ التحويل (قيد النقل)"),openModal("transfer-modal");try{const a=await Y("TR");document.getElementById("st-number").value=a}catch{}};window.openEditTransferModal=async()=>{if(!m)return;const t=m;window._editingTransferId=t.id,window._editingTransferSnap=t,f=(t.lines||[]).map(c=>({...c})),A.length||await J();const e=document.getElementById("st-from-wh"),a=document.getElementById("st-to-wh");e&&(e.value=t.fromWarehouseId),a&&(a.value=t.toWarehouseId),document.getElementById("st-number").value=t.number||t.id.slice(0,8),document.getElementById("st-date").value=t.date||"",document.getElementById("st-notes").value=t.notes||"",document.getElementById("st-error").classList.add("hidden"),T();const s=document.querySelector("#transfer-modal .modal-title");s&&(s.textContent=`✏️ تعديل أمر التحويل — ${t.number||t.id.slice(0,8)}`);const n=document.getElementById("exec-st-btn");n&&(n.textContent="💾 حفظ التعديلات"),await window.updateAllAvailableStock?.();const d=t.lines||[];f.forEach(c=>{const i=d.find(r=>r.productId===c.productId);i&&i.qty>0&&(c.availQty=(c.availQty||0)+i.qty,c._origQty=i.qty)}),T(),closeModal("view-transfer-modal"),openModal("transfer-modal")};window.executeTransfer=async()=>{const t=document.getElementById("st-error");t.classList.add("hidden");const e=document.getElementById("st-from-wh").value,a=document.getElementById("st-to-wh").value,s=document.getElementById("st-date").value,n=document.getElementById("st-notes").value.trim(),d=document.getElementById("st-number").value,c=document.getElementById("st-from-wh"),i=document.getElementById("st-to-wh"),r=c.options[c.selectedIndex]?.dataset.name||"",y=i.options[i.selectedIndex]?.dataset.name||"";if(!e||!a){t.textContent="يرجى اختيار المخزن المصدر والمستلم",t.classList.remove("hidden");return}if(e===a){t.textContent="المخزن المصدر والمستلم متطابقان",t.classList.remove("hidden");return}if(f.length===0){t.textContent="يرجى إضافة صنف واحد على الأقل",t.classList.remove("hidden");return}for(const u of f){if(u.qty<=0){t.textContent=`الكمية للصنف ${u.productName} يجب أن تكون أكبر من 0`,t.classList.remove("hidden");return}if(u.qty>u.availQty){t.textContent=`رصيد غير كافٍ للصنف ${u.productName} (الكمية المطلوبة: ${u.qty} > المتاح: ${u.availQty})`,t.classList.remove("hidden");return}}const l=document.getElementById("exec-st-btn");l.disabled=!0;const p=window._editingTransferId,o=window._editingTransferSnap;if(p&&o){l.textContent="⏳ جارٍ حفظ التعديلات…";try{const u={date:s,fromWarehouseId:e,fromWarehouseName:r||o.fromWarehouseName,toWarehouseId:a,toWarehouseName:y||o.toWarehouseName,lines:f,notes:n,updatedAt:new Date,updatedBy:window._transferUser?.uid||"system",updatedByName:window._transferUser?.displayName||window._transferUser?.email||"النظام"};if(o.status==="in_transit"||o.status==="received"){const b={};for(const v of o.lines||[])b[v.productId]=(b[v.productId]||0)+v.qty;const w={};for(const v of f)w[v.productId]=(w[v.productId]||0)+v.qty;const q=new Set([...Object.keys(b),...Object.keys(w)]);for(const v of q){const V=b[v]||0,x=(w[v]||0)-V;if(Math.abs(x)>1e-4){const U=f.find(j=>j.productId===v)||(o.lines||[]).find(j=>j.productId===v);await L(o.fromWarehouseId,v,-x,{type:x>0?"transfer_out":"transfer_cancel",sourceType:"stockTransfer",sourceId:p,documentNumber:o.number,productName:U?.productName||v,notes:`تعديل أمر التحويل ${o.number||""} (المصدر) (فرق: ${x>0?"-":"+"}${Math.abs(x)})`}),o.status==="received"&&await L(o.toWarehouseId,v,x,{type:x>0?"transfer_in":"transfer_cancel",sourceType:"stockTransfer",sourceId:p,documentNumber:o.number,productName:U?.productName||v,notes:`تعديل أمر التحويل ${o.number||""} (المستلم) (فرق: ${x>0?"+":"-"}${Math.abs(x)})`})}}}await _("stockTransfers",p,u);try{const b=C(E.journalEntries(),B("sourceType","==","stockTransfer"),B("sourceId","==",p)),w=await W(b);for(const q of w.docs)await tt(q.ref);o.status==="received"&&await O({...o,...u,id:p})}catch(b){console.warn("[EditTransfer] تحديث القيد فشل (غير حرج):",b.message)}showToast(`✅ تم تعديل أمر التحويل ${d} بنجاح`,"success"),window._editingTransferId=null,window._editingTransferSnap=null,closeModal("transfer-modal"),await N()}catch(u){t.textContent=u.message,t.classList.remove("hidden")}finally{l.disabled=!1,l.textContent="💾 حفظ التعديلات"}return}l.textContent="جارٍ الحفظ قيد النقل…";try{const u={number:d,date:s,fromWarehouseId:e,fromWarehouseName:r,toWarehouseId:a,toWarehouseName:y,lines:f,notes:n,status:"in_transit",createdBy:window._transferUser?.uid||"system",createdByName:window._transferUser?.displayName||window._transferUser?.email||"النظام",receivedAt:null},b=await G(z(g,`companies/${h}/stockTransfers`),u);for(const w of f)await L(e,w.productId,-w.qty,{type:"transfer_out",sourceType:"stockTransfer",sourceId:b,documentNumber:d,productName:w.productName,notes:`قيد النقل إلى ${y} في المستند ${d}`});showToast(`تم حفظ أمر التحويل ${d} قيد النقل`,"success"),closeModal("transfer-modal"),await N()}catch(u){t.textContent=u.message,t.classList.remove("hidden")}finally{l.disabled=!1,l.textContent="💾 تنفيذ التحويل (قيد النقل)"}};window.viewTransfer=async t=>{const e=document.getElementById("view-st-body");e.innerHTML='<div class="page-loading"><div class="loading-spinner"></div></div>',openModal("view-transfer-modal"),m=null,document.getElementById("st-confirm-btn").style.display="none",document.getElementById("st-cancel-btn").style.display="none",document.getElementById("st-approve-btn").style.display="none",document.getElementById("st-reject-btn").style.display="none";try{const a=$(g,`companies/${h}/stockTransfers`,t),s=await k(a);if(!s.exists())throw new Error("أمر التحويل غير موجود");const n={id:s.id,...s.data()};m=n;let d="";n.status==="requested"?(d='<span class="badge indigo">⏳ طلب شحن</span>',document.getElementById("st-approve-btn").style.display="",document.getElementById("st-reject-btn").style.display="",document.getElementById("st-edit-btn").style.display=""):n.status==="in_transit"?(d='<span class="badge warn">🚚 قيد النقل</span>',document.getElementById("st-confirm-btn").style.display="",document.getElementById("st-cancel-btn").style.display="",document.getElementById("st-edit-btn").style.display=""):n.status==="received"?d='<span class="badge good">✅ تم الاستلام</span>':d='<span class="badge neutral">🚫 ملغى</span>',I.length===0&&(I=await M(E.products()));let c=0;const i=(n.lines||[]).map((r,y)=>{const l=I.find(u=>u.id===r.productId),p=l&&(l.salePrice||l.priceRetail)||0,o=r.qty*p;return c+=o,`
        <tr>
          <td style="padding:7px 12px;">${y+1}</td>
          <td style="padding:7px 12px; font-weight:600;">${r.productName}</td>
          <td style="padding:7px 12px;" class="mono">${r.sku||"—"}</td>
          <td style="padding:7px 12px;">${r.unit||"—"}</td>
          <td style="padding:7px 12px;" class="mono font-bold">${F(r.qty)}</td>
          <td style="padding:7px 12px;" class="mono text-indigo">${p.toFixed(2)} ر.س</td>
          <td style="padding:7px 12px;" class="mono font-bold text-good">${o.toFixed(2)} ر.س</td>
        </tr>
      `}).join("");e.innerHTML=`
      <div class="grid-2 gap-16 mb-20">
        <div>
          <div class="section-label mb-6">رقم التحويل المرجعي</div>
          <div class="mono font-bold text-indigo text-lg">${n.number||n.id.slice(0,8)}</div>
        </div>
        <div>
          <div class="section-label mb-6">الحالة</div>
          <div>${d}</div>
        </div>
        <div>
          <div class="section-label mb-6">من مستودع (المصدر)</div>
          <div class="font-semibold">${n.fromWarehouseName||n.fromWarehouseId}</div>
        </div>
        <div>
          <div class="section-label mb-6">إلى مستودع (المستلم)</div>
          <div class="font-semibold">${n.toWarehouseName||n.toWarehouseId}</div>
        </div>
        <div>
          <div class="section-label mb-6">التاريخ</div>
          <div>${Q(n.createdAt||n.date)}</div>
        </div>
        <div>
          <div class="section-label mb-6">أنشئ بواسطة</div>
          <div>${n.createdByName||"النظام"}</div>
        </div>
      </div>

      <div class="table-container mb-16">
        <table class="data-dense">
          <thead>
            <tr>
              <th>#</th>
              <th>الصنف</th>
              <th>الكود</th>
              <th>الوحدة</th>
              <th>الكمية</th>
              <th style="color:var(--brand);">سعر الحبة (بيع)</th>
              <th style="color:var(--good);">إجمالي بيعي</th>
            </tr>
          </thead>
          <tbody>${i}</tbody>
        </table>
      </div>

      <div style="display:flex; justify-content:flex-end; margin-bottom:16px;">
        <div style="background:var(--bg-2); padding:10px 16px; border-radius:8px; border:1px solid var(--border); font-size:14px; font-weight:700;">
          إجمالي القيمة البيعية للتحويل: <span class="mono text-indigo">${c.toFixed(2)} ر.س</span>
        </div>
      </div>

      ${n.notes?`<div style="padding:12px; background:var(--bg-2); border-radius:6px; font-size:13px;"><strong>ملاحظات:</strong> ${n.notes}</div>`:""}
    `}catch(a){e.innerHTML=`<div class="alert bad">${a.message}</div>`}};window.confirmReceipt=async()=>{if(!m||!confirm("⚠️ هل تأكدت من استلام كافة كميات الأصناف المذكورة فعلياً في المستودع المستلم؟"))return;const t=document.getElementById("st-confirm-btn");t.disabled=!0,t.textContent="⏳ جارٍ تأكيد الاستلام…";try{const e=$(g,`companies/${h}/stockTransfers`,m.id),a=await k(e);if(!a.exists())throw new Error("أمر التحويل غير موجود");const s={id:a.id,...a.data()};if(s.status==="received")throw new Error("هذا التحويل تم استلامه بالفعل");if(s.status==="cancelled")throw new Error("هذا التحويل تم إلغاؤه");await _("stockTransfers",s.id,{status:"received",receivedAt:new Date,receivedBy:window._transferUser?.uid||"system",receivedByName:window._transferUser?.displayName||window._transferUser?.email||"النظام"});for(const d of s.lines||[])await L(s.toWarehouseId,d.productId,+d.qty,{type:"transfer_in",sourceType:"stockTransfer",sourceId:s.id,documentNumber:s.number,productName:d.productName,notes:`تم تأكيد استلام الشحنة ${s.number}`});let n=!1;try{n=!!await O(s)}catch(d){console.warn("[TransferJE] تعذر إنشاء القيد:",d.message)}showToast(n?`✅ تم تأكيد الاستلام وإنشاء القيد المحاسبي للتحويل ${s.number}`:"✅ تم تأكيد الاستلام (تحذير: لم تتوفر تكلفة لإنشاء القيد)",n?"success":"warning"),closeModal("view-transfer-modal"),await N()}catch(e){showToast(e.message,"error")}finally{t.disabled=!1,t.textContent="✅ تأكيد الاستلام"}};window.cancelTransfer=async()=>{if(!m||!confirm("🚫 هل تريد إلغاء أمر التحويل وإرجاع الكميات للمخزن المصدر؟"))return;const t=document.getElementById("st-cancel-btn");t.disabled=!0,t.textContent="⏳ جارٍ الإلغاء…";try{const e=$(g,`companies/${h}/stockTransfers`,m.id),a=await k(e);if(!a.exists())throw new Error("أمر التحويل غير موجود");const s={id:a.id,...a.data()};if(s.status==="received")throw new Error("لا يمكن إلغاء التحويل بعد استلامه");if(s.status==="cancelled")throw new Error("هذا التحويل ملغى بالفعل");await _("stockTransfers",s.id,{status:"cancelled",cancelledAt:new Date});for(const n of s.lines||[])await L(s.fromWarehouseId,n.productId,+n.qty,{type:"transfer_cancel",sourceType:"stockTransfer",sourceId:s.id,documentNumber:s.number,productName:n.productName,notes:`إرجاع الكميات بعد إلغاء الأمر ${s.number}`});showToast("🚫 تم إلغاء أمر التحويل وإعادة الكميات لمخزن المصدر","success"),closeModal("view-transfer-modal"),await N()}catch(e){showToast(e.message,"error")}finally{t.disabled=!1,t.textContent="🚫 إلغاء الأمر"}};window.approveTransferRequest=async()=>{if(!m||!confirm(`⚠️ هل توافق على طلب شحن السيارة رقم ${m.number||m.id.slice(0,8)}؟
سيتم خصم الكميات من مستودع المصدر (${m.fromWarehouseName}) وتصبح الشحنة قيد النقل للسيارة.`))return;const t=document.getElementById("st-approve-btn");t.disabled=!0,t.textContent="⏳ جاري الاعتماد والشحن…";try{const e=h,a=$(g,`companies/${e}/stockTransfers`,m.id),s=await k(a);if(!s.exists())throw new Error("أمر التحويل غير موجود");const n={id:s.id,...s.data()};if(n.status!=="requested")throw new Error("حالة هذا الطلب تغيرت بالفعل");for(const d of n.lines||[]){const c=$(g,`companies/${e}/stockByWarehouse`,`${n.fromWarehouseId}_${d.productId}`),i=await k(c),r=i.exists()&&i.data().qty||0;if(r<d.qty)throw new Error(`عذراً، الرصيد غير كافٍ في مستودع المصدر للصنف: ${d.productName} (المتاح: ${r} ، المطلوب: ${d.qty})`)}await _("stockTransfers",n.id,{status:"in_transit",approvedAt:new Date,approvedBy:window._transferUser?.uid||"system",approvedByName:window._transferUser?.displayName||window._transferUser?.email||"المدير"});for(const d of n.lines||[])await L(n.fromWarehouseId,d.productId,-d.qty,{type:"transfer_out",sourceType:"stockTransfer",sourceId:n.id,documentNumber:n.number,productName:d.productName,notes:`تمت الموافقة وشحن البضاعة للسيارة في المستند ${n.number}`});showToast("✅ تم اعتماد الطلب وبدء عملية الشحن (قيد النقل للسيارة)","success"),closeModal("view-transfer-modal"),await N()}catch(e){showToast(e.message,"error")}finally{t.disabled=!1,t.textContent="✔️ موافقة وشحن السيارة"}};window.rejectTransferRequest=async()=>{if(!m||!confirm(`❌ هل أنت متأكد من رفض وإلغاء طلب شحن السيارة رقم ${m.number||m.id.slice(0,8)}؟`))return;const t=document.getElementById("st-reject-btn");t.disabled=!0,t.textContent="⏳ جاري الرفض…";try{const e=$(g,`companies/${h}/stockTransfers`,m.id),a=await k(e);if(!a.exists())throw new Error("أمر التحويل غير موجود");const s={id:a.id,...a.data()};if(s.status!=="requested")throw new Error("حالة هذا الطلب تغيرت بالفعل");await _("stockTransfers",s.id,{status:"cancelled",rejectedAt:new Date,rejectedBy:window._transferUser?.uid||"system",rejectedByName:window._transferUser?.displayName||window._transferUser?.email||"المدير",notes:(s.notes||"")+" (تم رفض الطلب من قبل الإدارة)"}),showToast("🚫 تم رفض وإلغاء طلب الشحن بنجاح","success"),closeModal("view-transfer-modal"),await N()}catch(e){showToast(e.message,"error")}finally{t.disabled=!1,t.textContent="❌ رفض الطلب"}};window.printStockTransfer=async()=>{if(!m)return;const t=m;let e="مؤسسة أدهام للمواد الغذائية",a="",s="";try{const i=await k($(g,`companies/${h}/settings`,"company"));if(i.exists()){const r=i.data();e=r.name||e,a=r.vatNumber||"",s=r.crNumber||""}}catch(i){console.warn(i)}I.length===0&&(I=await M(E.products()));let n=0;const d=(t.lines||[]).map((i,r)=>{const y=I.find(o=>o.id===i.productId),l=y&&(y.salePrice||y.priceRetail)||0,p=i.qty*l;return n+=p,`
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${r+1}</td>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${i.productName}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;" class="mono">${i.sku||"—"}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${i.unit||"—"}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;" class="mono">${F(i.qty)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: left;" class="mono">${l.toFixed(2)} ر.س</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;" class="mono">${p.toFixed(2)} ر.س</td>
      </tr>
    `}).join(""),c=window.open("","_blank");c.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>سند تحويل مخزني — ${t.number||t.id.slice(0,8)}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 30px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0056b3; padding-bottom: 15px; margin-bottom: 20px; }
        .title { font-size: 22px; font-weight: bold; color: #0056b3; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef; }
        .meta-item { font-size: 13px; line-height: 1.6; }
        .meta-label { color: #666; font-weight: 600; }
        .meta-value { font-weight: bold; color: #111; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
        th { background: #0056b3; color: white; padding: 10px; font-weight: bold; border: 1px solid #ddd; }
        td { padding: 10px; border: 1px solid #ddd; }
        .total-box { margin-top: 20px; text-align: left; font-size: 16px; font-weight: bold; border-top: 2px solid #0056b3; padding-top: 10px; }
        .notes { margin-top: 30px; font-size: 12px; color: #555; background: #fff3cd; padding: 12px; border-radius: 6px; border-right: 4px solid #ffc107; }
        .footer-sigs { display: flex; justify-content: space-between; margin-top: 60px; font-size: 13px; }
        .sig-block { border-top: 1px dashed #666; width: 180px; text-align: center; padding-top: 8px; }
        @media print {
          body { margin: 10px; }
          .no-print { display: none !important; }
        }
        .mono { font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: left;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #0056b3; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">🖨️ طباعة السند</button>
        <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-right: 8px;">✕ إغلاق</button>
      </div>

      <div class="header">
        <div>
          <div style="font-size: 20px; font-weight: bold; color: #111;">${e}</div>
          ${s?`<div style="font-size: 12px; color: #666;">سجل تجاري: ${s}</div>`:""}
          ${a?`<div style="font-size: 12px; color: #666;">الرقم الضريبي: ${a}</div>`:""}
        </div>
        <div class="title">سند تحويل مخزني</div>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <div><span class="meta-label">رقم التحويل المرجعي:</span> <span class="meta-value">${t.number||t.id.slice(0,8)}</span></div>
          <div><span class="meta-label">تاريخ المستند:</span> <span class="meta-value">${Q(t.createdAt||t.date)}</span></div>
          <div><span class="meta-label">الحالة:</span> <span class="meta-value">${t.status==="received"?"✅ تم الاستلام مخزنياً":t.status==="in_transit"?"🚚 قيد النقل (ترانزيت)":t.status==="requested"?"⏳ طلب شحن":"🚫 ملغى"}</span></div>
        </div>
        <div class="meta-item">
          <div><span class="meta-label">المستودع المصدر (من):</span> <span class="meta-value" style="color: #c00;">${t.fromWarehouseName||t.fromWarehouseId}</span></div>
          <div><span class="meta-label">المستودع المستلم (إلى):</span> <span class="meta-value" style="color: #080;">${t.toWarehouseName||t.toWarehouseId}</span></div>
          <div><span class="meta-label">أنشئ بواسطة:</span> <span class="meta-value">${t.createdByName||"النظام"}</span></div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>اسم الصنف المعرف</th>
            <th style="width: 100px;">الكود (SKU)</th>
            <th style="width: 80px;">الوحدة</th>
            <th style="width: 80px;">الكمية المحولة</th>
            <th style="width: 120px;">سعر الحبة (بيع)</th>
            <th style="width: 130px;">الإجمالي البيعي</th>
          </tr>
        </thead>
        <tbody>
          ${d}
        </tbody>
      </table>

      <div class="total-box">
        إجمالي القيمة البيعية للتحويل: <span style="color: #0056b3; font-size: 18px;">${n.toFixed(2)} ر.س</span>
      </div>

      ${t.notes?`<div class="notes"><strong>ملاحظات التحويل:</strong> ${t.notes}</div>`:""}

      <div class="footer-sigs">
        <div>
          <p>أمين مستودع المصدر (المسلّم)</p>
          <br><br>
          <div class="sig-block">التوقيع والتاريخ</div>
        </div>
        <div>
          <p>الناقل (السائق)</p>
          <br><br>
          <div class="sig-block">التوقيع والتاريخ</div>
        </div>
        <div>
          <p>أمين مستودع المستلم (المستلم)</p>
          <br><br>
          <div class="sig-block">التوقيع والتاريخ</div>
        </div>
      </div>
    </body>
    </html>
  `),c.document.close()};export{pt as render};
