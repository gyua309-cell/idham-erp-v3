import{t as H,d as k,C as I,b as ot,g as L,a as T,q as dt,l as $,p as tt,z as et,A,u as P,o as it,B as st,e as rt}from"./index-BfKDPs3D.js";import{collection as O,where as E,query as Q,orderBy as z,limit as ct,getDocs as M,doc as B,getDoc as C,deleteDoc as nt,updateDoc as J}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";function b(t){return{Piece:"حبة",Carton:"كرتون",Box:"بوكس",Bag:"كيس",Pack:"شد",Sack:"شوال",Bale:"بالة",Barrel:"برميل",Tray:"طبق",Gallon:"جالون",Kilogram:"كيلو",Ton:"طن",Liter:"لتر",Gram:"جرام",Can:"علبة",Bottle:"زجاجة",Meter:"متر",Tank:"تنك",Roll:"رول",Pallet:"باليت",PCS:"حبة"}[t]||t||""}async function X(t,e){const s=/سيارة|سياره|مندوب|vehicle|car|\brep\b|مصطفى|علي|ناجي/i.test(e||""),n=s?"1-1-4-1-02":"1-1-4-1";try{const a=O(k,`companies/${I}/chartOfAccounts`);if(t){const l=Q(a,E("sourceEntityId","==",t)),u=await M(l);if(!u.empty){const v=u.docs[0],p=v.data();return console.log(`[TransferJE] ✅ حساب بـ sourceEntityId: ${p.code} - ${p.name}`),{code:p.code,id:v.id,name:p.name}}}const c=Q(a,E("parentCode","==",n)),i=(await M(c)).docs.map(l=>({id:l.id,...l.data()})),o=(e||"").trim().toLowerCase();for(const l of i){const u=(l.name||"").toLowerCase();if(u===o||u.includes(o)||o.includes(u))return{code:l.code,id:l.id,name:l.name}}return s?{code:"1-1-4-1-02",id:"1-1-4-1-02",name:"مخزون سيارات التوزيع"}:{code:"1-1-4-1-01",id:"1-1-4-1-01",name:"مخزون المستودع الرئيسي"}}catch(a){console.warn("[TransferJE] COA lookup failed:",a.message)}return{code:s?"1-1-4-1-02":"1-1-4-1-01",id:s?"1-1-4-1-02":"1-1-4-1-01",name:s?"مخزون سيارات التوزيع":"مخزون المستودع الرئيسي"}}async function lt(t){try{const e=await C(B(k,`companies/${I}/products`,t));if(e.exists()){const s=e.data(),n=parseFloat(s.averageCost||s.costPrice||s.purchasePrice||0);if(n>.001)return n;const a=parseFloat(s.salePrice||s.priceRetail||0);if(a>.001)return Math.round(a*.7*100)/100}}catch{}return 1}async function G(t){let e=0;for(const i of t.lines||[]){const o=i.costPrice||await lt(i.productId),l=i.altUnit&&i.unitFactor>1&&i.selectedUnit===i.altUnit?i.unitFactor:1,u=i.effectiveQty!==void 0?i.effectiveQty:i.qty*l;e+=Math.round(o*u*100)/100}e<.001&&(e=(t.lines||[]).reduce((i,o)=>{const l=o.altUnit&&o.unitFactor>1&&o.selectedUnit===o.altUnit?o.unitFactor:1,u=o.effectiveQty!==void 0?o.effectiveQty:o.qty*l;return i+(u||1)},0));const s=Q(T.journalEntries(),E("sourceType","==","stockTransfer"),E("sourceId","==",t.id)),n=await M(s);if(!n.empty)return console.log("[TransferJE] القيد موجود بالفعل للتحويل",t.id),n.docs[0].id;const a=await X(t.fromWarehouseId,t.fromWarehouseName),c=await X(t.toWarehouseId,t.toWarehouseName),d=await rt({entryNumber:`JE-${t.number}`,date:t.date||new Date().toISOString().slice(0,10),description:`تحويل مخزني ${t.number} — من ${t.fromWarehouseName} إلى ${t.toWarehouseName}`,lines:[{accountCode:c.code,accountId:c.id,accountName:c.name,debit:Math.round(e*100)/100,credit:0,note:`استلام مخزون — تحويل ${t.number}`},{accountCode:a.code,accountId:a.id,accountName:a.name,debit:0,credit:Math.round(e*100)/100,note:`صرف مخزون — تحويل ${t.number}`}],sourceType:"stockTransfer",sourceId:t.id,status:"posted",createdByName:window._transferUser?.displayName||window._transferUser?.email||"النظام"});return console.log(`[TransferJE] تم إنشاء القيد للتحويل ${t.number} — قيمة: ${e}`),d}let j=[],U=[],Z=[],w=[],x=null;function ut(t,e){let s="";for(let n=0;n<e;n++){s+='<tr class="skeleton-row">';for(let a=0;a<t;a++){const c=40+Math.floor(Math.random()*80);s+=`<td><div class="sk" style="width:${c}px; height:12px; margin:4px 0;"></div></td>`}s+="</tr>"}return s}async function ht(t,e){window._transferUser=e,t.innerHTML=`
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
            <div style="max-height:280px; overflow-y:auto; border:1px solid var(--border); border-radius:6px; background:#fff;">
              <table style="width:100%; font-size:12px; border-collapse:collapse;">
                <thead>
                  <tr style="background:var(--bg-3); position:sticky; top:0; z-index:1;">
                    <th style="padding:8px 10px; text-align:right; width:30px;">#</th>
                    <th style="padding:8px 10px; text-align:right;">اسم الصنف</th>
                    <th style="padding:8px 10px; text-align:right; width:85px;">الكود</th>
                    <th style="padding:8px 10px; text-align:right; min-width:95px;">الوحدة</th>
                    <th style="padding:8px 10px; text-align:right; color:var(--primary);">الرصيد المتاح</th>
                    <th style="padding:8px 10px; text-align:center; min-width:160px;">الكمية المحولة</th>
                    <th style="padding:8px 6px; width:40px;"></th>
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
    </div>`,document.getElementById("st-from")?.addEventListener("change",()=>N()),document.getElementById("st-to")?.addEventListener("change",()=>N()),await K(),await N(),pt()}async function K(){try{j=await L(T.warehouses(),[z("name")]);const t=document.getElementById("st-from-wh"),e=document.getElementById("st-to-wh");if(t&&e){const d=j.map(i=>`<option value="${i.id}" data-name="${i.name}">${i.name}</option>`).join("");t.innerHTML='<option value="">اختر المخزن المصدر</option>'+d,e.innerHTML='<option value="">اختر المخزن المستلم</option>'+d}const[s,n,a]=await Promise.all([L(T.products(),[z("name")]),L(T.categories(),[z("name")]),L(T.stockByWarehouse())]);U=s||[],Z=n||[],window._stStockCache=a||[];const c=document.getElementById("st-product-category-filter");c&&(c.innerHTML='<option value="">كل الفئات</option>'+Z.map(d=>`<option value="${d.id}">${d.name}</option>`).join(""))}catch(t){console.warn("[StockTransfer] Error loading warehouses/products:",t)}}async function N(){const t=document.getElementById("st-tbody");if(!t)return;t.innerHTML=ut(9,8);const e=document.getElementById("st-from")?.value,s=document.getElementById("st-to")?.value;try{let n=O(k,`companies/${I}/stockTransfers`);const a=[];e&&a.push(E("date",">=",e)),s&&a.push(E("date","<=",s)),!e&&!s?n=Q(n,...a,z("date","desc"),ct(100)):n=Q(n,...a,z("date","desc"));let d=(await M(n)).docs.map(r=>({id:r.id,...r.data()}));d.sort((r,f)=>{const h=r.createdAt?.toMillis?.()??r.createdAt?.seconds*1e3??0,q=f.createdAt?.toMillis?.()??f.createdAt?.seconds*1e3??0;if(q!==h)return q-h;const _=r.date||"",y=f.date||"";if(y>_)return 1;if(y<_)return-1;const W=parseInt((r.number||"0").replace(/\D/g,""),10)||0;return(parseInt((f.number||"0").replace(/\D/g,""),10)||0)-W}),document.getElementById("st-count").textContent=`${d.length} أمر تحويل مخزني`;const i=d.length,o=d.filter(r=>r.status==="in_transit").length,l=d.filter(r=>r.status==="received").length,u=d.reduce((r,f)=>r+(f.lines||[]).length,0),v=document.getElementById("st-kpi-total");v&&(v.textContent=i);const p=document.getElementById("st-kpi-transit");p&&(p.textContent=o);const g=document.getElementById("st-kpi-received");g&&(g.textContent=l);const m=document.getElementById("st-kpi-items");if(m&&(m.textContent=u),d.length===0){t.innerHTML='<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد تحويلات مخزنية مسجلة</td></tr>';return}t.innerHTML=d.map(r=>{let f="";return r.status==="requested"?f='<span class="badge indigo">⏳ طلب شحن</span>':r.status==="in_transit"?f='<span class="badge warn">🚚 قيد النقل</span>':r.status==="received"?f='<span class="badge good">✅ تم الاستلام</span>':f='<span class="badge neutral">🚫 ملغى</span>',`
        <tr style="cursor:pointer;" onclick="viewTransfer('${r.id}')">
          <td class="mono font-bold text-indigo">${r.number||r.id.slice(0,8)}</td>
          <td class="dim">${ot(r.createdAt||r.date)}</td>
          <td><span class="badge neutral">${r.fromWarehouseName||r.fromWarehouseId}</span></td>
          <td><span class="badge indigo">${r.toWarehouseName||r.toWarehouseId}</span></td>
          <td class="mono font-semibold">${(r.lines||[]).length} أصناف</td>
          <td>${f}</td>
          <td class="dim">${r.notes||"—"}</td>
          <td class="dim" style="font-size:11px;">${r.createdByName||"النظام"}</td>
          <td>
            <button class="btn btn-icon sm btn-ghost" onclick="event.stopPropagation();viewTransfer('${r.id}')">👁️</button>
          </td>
        </tr>`}).join("")}catch(n){t.innerHTML=`<tr><td colspan="9"><div class="alert bad" style="margin:8px;">${n.message}</div></td></tr>`}}function pt(){const t=document.getElementById("st-product-search"),e=document.getElementById("st-product-results"),s=document.getElementById("st-product-category-filter");if(!t)return;const n=()=>{const a=t.value.trim().toLowerCase(),c=s?s.value:"";if(!a&&!c){e.classList.add("hidden");return}let d=U;if(c&&(d=d.filter(l=>l.category===c)),a&&(d=d.filter(l=>(l.name||"").toLowerCase().includes(a)||(l.sku||"").toLowerCase().includes(a)||(l.barcode||"").includes(a))),d=d.slice(0,30),!d.length){e.innerHTML='<div style="padding:10px;text-align:center;color:var(--text-2);font-size:12px;">لا توجد نتائج</div>',e.classList.remove("hidden");return}const i=document.getElementById("st-from-wh")?.value,o=window._stStockCache||[];e.innerHTML=d.map(l=>{let u=0;if(i){const f=o.find(h=>h.productId===l.id&&h.warehouseId===i);u=f&&f.qty||0}else{const f=o.filter(h=>h.productId===l.id);u=f.length>0?f.reduce((h,q)=>h+(q.qty||0),0):l.totalQty||l.stock||0}const v=(l.name||"").replace(/'/g,"\\'"),p=(l.unit||"Piece").replace(/'/g,"\\'"),g=(l.sku||"").replace(/'/g,"\\'"),m=(l.altUnit||"").replace(/'/g,"\\'"),r=parseFloat(l.unitFactor)||1;return`
        <div class="autocomplete-item" onclick="addTransferLine('${l.id}','${v}','${p}','${g}','${m}',${r})">
          <div class="flex justify-between" style="align-items:center;">
            <strong style="font-size:13px;">${l.name}</strong>
            <span class="badge ${u>0?"good":"bad"}" style="font-size:11px;">
              ${i?"المتاح بالمخزن: ":"إجمالي المتاح: "}${$(u)} ${b(l.unit)||""}
            </span>
          </div>
          <div class="item-code" style="font-size:11px;color:var(--text-2);margin-top:2px;">
            كود: ${l.sku||"بدون كود"} | وحدة: ${b(l.unit)||"حبة"}
            ${l.altUnit&&r>1?`<span style="color:#d97706;font-weight:700;margin-right:6px;">📦 1 ${b(l.altUnit)} = ${r} ${b(l.unit)}</span>`:""}
          </div>
        </div>
      `}).join(""),e.classList.remove("hidden")};t.addEventListener("input",dt(n,200)),t.addEventListener("focus",n),s&&s.addEventListener("change",n),document.addEventListener("click",a=>{!t.contains(a.target)&&!e.contains(a.target)&&(!s||!s.contains(a.target))&&e.classList.add("hidden")})}window.addTransferLine=async(t,e,s,n,a="",c=1)=>{if(document.getElementById("st-product-search").value="",document.getElementById("st-product-results").classList.add("hidden"),w.some(g=>g.productId===t)){showToast("الصنف مضاف بالفعل","warn");return}const d=document.getElementById("st-from-wh")?.value;let i=0;if(d)try{const m=(await tt(t)).find(r=>r.warehouseId===d);i=m?m.qty:0}catch{const m=(window._stStockCache||[]).find(r=>r.productId===t&&r.warehouseId===d);i=m&&m.qty||0}else{const m=(window._stStockCache||[]).filter(r=>r.productId===t);if(m.length>0)i=m.reduce((r,f)=>r+(f.qty||0),0);else{const r=U.find(f=>f.id===t);i=r&&(r.totalQty||r.stock)||0}}const o=U.find(g=>g.id===t),l=o?parseFloat(o.averageCost||o.costPrice||o.purchasePrice||0):0,u=a||o?.altUnit||"",v=parseFloat(c||o?.unitFactor)||1,p=!!(u&&v>1);w.push({productId:t,productName:e,unit:s||o?.unit||"Piece",sku:n||o?.sku||"",altUnit:u,unitFactor:v,selectedUnit:p?u:s||o?.unit||"Piece",qty:1,availQty:i,costPrice:l}),S()};window.updateAllAvailableStock=async()=>{const t=document.getElementById("st-from-wh")?.value;try{window._stStockCache=await L(T.stockByWarehouse())}catch{}if(!t){const e=window._stStockCache||[];w.forEach(s=>{const n=e.filter(a=>a.productId===s.productId);s.availQty=n.length>0?n.reduce((a,c)=>a+(c.qty||0),0):0}),S();return}for(const e of w)try{const n=(await tt(e.productId)).find(a=>a.warehouseId===t);e.availQty=n?n.qty:0}catch{const s=(window._stStockCache||[]).find(n=>n.productId===e.productId&&n.warehouseId===t);e.availQty=s&&s.qty||0}S()};function at(){let t=!1,e=[];w.forEach(a=>{const c=a.altUnit&&a.unitFactor>1&&a.selectedUnit===a.altUnit?a.unitFactor:1,d=(parseFloat(a.qty)||0)*c;d>a.availQty&&(t=!0,e.push(`${a.productName} (المطلوب: ${$(a.qty)} ${b(a.selectedUnit||a.unit)} = ${$(d)} ${b(a.unit)} > المتاح: ${$(a.availQty)})`))});const s=document.getElementById("st-error"),n=document.getElementById("exec-st-btn");t?(s&&(s.innerHTML=`🚨 <strong>تنبيه رصيد غير كافٍ:</strong> الأصناف التالية تزيد عن المتاح بالمخزن المصدر:<br>• ${e.join("<br>• ")}`,s.classList.remove("hidden")),n&&(n.disabled=!0,n.style.opacity="0.5",n.style.cursor="not-allowed")):(s&&s.classList.add("hidden"),n&&(n.disabled=!1,n.style.opacity="1",n.style.cursor="pointer"))}function S(){const t=document.getElementById("st-lines-tbody");if(t){if(w.length===0){t.innerHTML='<tr><td colspan="7" style="text-align:center;padding:16px;color:var(--text-2);">لم يتم إضافة أصناف بعد</td></tr>',document.getElementById("st-error")?.classList.add("hidden");const e=document.getElementById("exec-st-btn");e&&(e.disabled=!1,e.style.opacity="1",e.style.cursor="pointer");return}t.innerHTML=w.map((e,s)=>{const n=e.altUnit&&e.unitFactor>1&&e.selectedUnit===e.altUnit?e.unitFactor:1,a=(parseFloat(e.qty)||0)*n,c=a>e.availQty;let d=`<div class="mono font-semibold ${e.availQty>0?"text-good":"text-bad"}" style="font-size:12px;">${$(e.availQty)} ${b(e.unit)}</div>`;if(e.altUnit&&e.unitFactor>1){const l=Math.floor(e.availQty/e.unitFactor),u=Math.round(e.availQty%e.unitFactor*1e3)/1e3;d+=`<div style="font-size:10px;color:var(--text-dim);margin-top:2px;">(يعادل ${$(l)} ${b(e.altUnit)}${u>0?` + ${$(u)} ${b(e.unit)}`:""})</div>`}const i=e.altUnit&&e.unitFactor>1?`<select class="input" style="height:30px;font-size:11.5px;padding:2px 4px;color:var(--brand);font-weight:700;"
           onchange="updateTransferLineUnit(${s}, this.value)">
           <option value="${e.altUnit}" ${e.selectedUnit===e.altUnit?"selected":""}>${b(e.altUnit)} (كرتون)</option>
           <option value="${e.unit}" ${e.selectedUnit===e.unit?"selected":""}>${b(e.unit)} (حبة)</option>
         </select>
         <div style="font-size:9.5px;color:#64748b;margin-top:2px;text-align:center;">
           ${e.selectedUnit===e.altUnit?`1 ${b(e.altUnit)} = ${e.unitFactor} ${b(e.unit)}`:b(e.unit)}
         </div>`:`<span style="font-size:11.5px;color:var(--text-2);font-weight:600;">${b(e.unit||"—")}</span>`,o=e.altUnit&&e.unitFactor>1&&e.selectedUnit===e.altUnit?`<div id="st-line-conv-${s}" style="font-size:10px;color:#059669;margin-top:3px;text-align:center;font-weight:700;">
           = ${$(a)} ${b(e.unit)}
         </div>`:`<div id="st-line-conv-${s}"></div>`;return`
      <tr id="st-line-row-${s}" style="border-bottom:1px solid var(--border-soft); ${c?"background-color:rgba(239,68,68,0.08);":""}">
        <td style="padding:6px 10px;color:var(--text-2);width:30px;">${s+1}</td>
        <td style="padding:6px 10px;font-weight:600;">${e.productName}</td>
        <td style="padding:6px 10px;" class="mono dim">${e.sku||"—"}</td>
        <td style="padding:6px 6px;min-width:95px;">${i}</td>
        <td style="padding:6px 10px;">${d}</td>
        <td style="padding:6px 8px;min-width:160px;text-align:center;">
          <input type="number" id="st-qty-input-${s}" class="input mono" style="width:105px;height:30px;font-size:13px;text-align:center;${c?"border-color:var(--bad);background-color:rgba(239,68,68,0.18);color:var(--bad);font-weight:bold;":""}"
            value="${e.qty}" min="0.001" step="any"
            oninput="updateTransferLineQtyQuiet(${s}, this.value)"
            onchange="updateTransferLineQty(${s}, this.value)" />

          <!-- أزرار الكسور السريعة للكرتون (ربع، نصف، ثلاثة أرباع، كرتون كامل) -->
          <div style="display:flex;gap:3px;justify-content:center;margin-top:4px;">
            <button type="button" class="btn btn-xs" style="padding:2px 6px;font-size:10.5px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:4px;cursor:pointer;font-weight:700;color:#334155;"
              onclick="setTransferLineFraction(${s}, 0.25)" title="ربع كرتون (0.25)">¼ ربع</button>
            <button type="button" class="btn btn-xs" style="padding:2px 6px;font-size:10.5px;background:#e0e7ff;border:1px solid #a5b4fc;border-radius:4px;cursor:pointer;font-weight:700;color:#3730a3;"
              onclick="setTransferLineFraction(${s}, 0.5)" title="نصف كرتون (0.5)">½ نصف</button>
            <button type="button" class="btn btn-xs" style="padding:2px 6px;font-size:10.5px;background:#fef3c7;border:1px solid #fde68a;border-radius:4px;cursor:pointer;font-weight:700;color:#92400e;"
              onclick="setTransferLineFraction(${s}, 0.75)" title="ثلاثة أرباع كرتون (0.75)">¾</button>
            <button type="button" class="btn btn-xs" style="padding:2px 6px;font-size:10.5px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;cursor:pointer;font-weight:700;color:#065f46;"
              onclick="setTransferLineFraction(${s}, 1)" title="كرتون كامل (1)">1</button>
          </div>

          ${o}
        </td>
        <td style="padding:6px 6px;text-align:center;width:40px;">
          <button class="btn btn-icon sm btn-ghost" onclick="removeTransferLine(${s})" style="color:var(--bad);" title="حذف الصنف">✕</button>
        </td>
      </tr>`}).join(""),at()}}window.updateTransferLineQtyQuiet=(t,e)=>{const s=w[t];if(!s)return;const n=parseFloat(e);s.qty=isNaN(n)?0:n;const a=s.altUnit&&s.unitFactor>1&&s.selectedUnit===s.altUnit?s.unitFactor:1,c=(s.qty||0)*a,d=document.getElementById(`st-line-conv-${t}`);d&&(s.altUnit&&s.unitFactor>1&&s.selectedUnit===s.altUnit?d.textContent=`= ${$(c)} ${b(s.unit)}`:d.textContent="");const i=c>s.availQty,o=document.getElementById(`st-line-row-${t}`),l=document.getElementById(`st-qty-input-${t}`);o&&(o.style.backgroundColor=i?"rgba(239,68,68,0.08)":""),l&&(l.style.borderColor=i?"var(--bad)":"",l.style.backgroundColor=i?"rgba(239,68,68,0.18)":"",l.style.color=i?"var(--bad)":"",l.style.fontWeight=i?"bold":"normal"),at()};window.updateTransferLineQty=(t,e)=>{const s=w[t];if(!s)return;const n=parseFloat(e);s.qty=isNaN(n)?0:n,S()};window.setTransferLineFraction=(t,e)=>{const s=w[t];s&&(s.qty=e,S())};window.updateTransferLineUnit=(t,e)=>{const s=w[t];s&&(s.selectedUnit=e,S())};window.removeTransferLine=t=>{w.splice(t,1),S()};window.openTransferModal=async()=>{window._editingTransferId=null,window._editingTransferSnap=null,w=[],S(),document.getElementById("st-product-search")&&(document.getElementById("st-product-search").value=""),document.getElementById("st-notes")&&(document.getElementById("st-notes").value=""),document.getElementById("st-error")&&document.getElementById("st-error").classList.add("hidden"),document.getElementById("st-number")&&(document.getElementById("st-number").value="جارٍ التوليد..."),document.getElementById("st-date")&&(document.getElementById("st-date").value=H()),j.length||await K();try{const[n,a]=await Promise.all([L(T.products(),[z("name")]),L(T.stockByWarehouse())]);U=n||[],window._stStockCache=a||[]}catch(n){console.warn("[StockTransfer] Live refresh failed:",n)}const t=document.getElementById("st-from-wh");if(t&&!t.value&&j.length>0){const n=j.find(a=>(a.name||"").includes("الرئيسي")||(a.name||"").includes("الرئيسى")||a.isDefault);t.value=n?n.id:j[0].id}const e=document.querySelector("#transfer-modal .modal-title");e&&(e.textContent="أمر تحويل مخزني جديد");const s=document.getElementById("exec-st-btn");s&&(s.textContent="💾 تنفيذ التحويل (قيد النقل)"),openModal("transfer-modal");try{const n=await et("TR");document.getElementById("st-number")&&(document.getElementById("st-number").value=n)}catch{}};window.openEditTransferModal=async()=>{if(!x)return;const t=x;window._editingTransferId=t.id,window._editingTransferSnap=t,w=(t.lines||[]).map(d=>{const i=U.find(v=>v.id===d.productId),o=d.altUnit||i?.altUnit||"",l=parseFloat(d.unitFactor||i?.unitFactor)||1,u=d.selectedUnit||(o&&l>1?o:d.unit);return{...d,altUnit:o,unitFactor:l,selectedUnit:u}}),j.length||await K();const e=document.getElementById("st-from-wh"),s=document.getElementById("st-to-wh");e&&(e.value=t.fromWarehouseId),s&&(s.value=t.toWarehouseId),document.getElementById("st-number").value=t.number||t.id.slice(0,8),document.getElementById("st-date").value=t.date||"",document.getElementById("st-notes").value=t.notes||"",document.getElementById("st-error").classList.add("hidden"),S();const n=document.querySelector("#transfer-modal .modal-title");n&&(n.textContent=`✏️ تعديل أمر التحويل — ${t.number||t.id.slice(0,8)}`);const a=document.getElementById("exec-st-btn");a&&(a.textContent="💾 حفظ التعديلات"),await window.updateAllAvailableStock?.();const c=t.lines||[];w.forEach(d=>{const i=c.find(o=>o.productId===d.productId);if(i){const o=i.altUnit&&i.unitFactor>1&&i.selectedUnit===i.altUnit?i.unitFactor:1,l=i.effectiveQty!==void 0?i.effectiveQty:(parseFloat(i.qty)||0)*o;l>0&&(d.availQty=(d.availQty||0)+l,d._origQty=l)}}),S(),closeModal("view-transfer-modal"),openModal("transfer-modal")};let R=!1;window.executeTransfer=async()=>{if(R){console.warn("[StockTransfer] Transfer execution already in progress...");return}const t=document.getElementById("st-error");t&&t.classList.add("hidden");const e=document.getElementById("st-from-wh")?.value,s=document.getElementById("st-to-wh")?.value,n=document.getElementById("st-date")?.value,a=document.getElementById("st-notes")?.value?.trim()||"";let c=document.getElementById("st-number")?.value?.trim();const d=document.getElementById("st-from-wh"),i=document.getElementById("st-to-wh"),o=d?.options[d.selectedIndex]?.dataset.name||"",l=i?.options[i.selectedIndex]?.dataset.name||"";if(!e||!s){t&&(t.textContent="يرجى اختيار المخزن المصدر والمستلم",t.classList.remove("hidden"));return}if(e===s){t&&(t.textContent="المخزن المصدر والمستلم متطابقان",t.classList.remove("hidden"));return}if(w.length===0){t&&(t.textContent="يرجى إضافة صنف واحد على الأقل",t.classList.remove("hidden"));return}for(const p of w){const g=p.altUnit&&p.unitFactor>1&&p.selectedUnit===p.altUnit?p.unitFactor:1,m=(parseFloat(p.qty)||0)*g;if(p.effectiveQty=Math.round(m*1e3)/1e3,p.qty<=0){t&&(t.textContent=`الكمية للصنف ${p.productName} يجب أن تكون أكبر من 0`,t.classList.remove("hidden"));return}if(m>p.availQty){t&&(t.textContent=`رصيد غير كافٍ للصنف ${p.productName} (الكمية المطلوبة: ${$(p.qty)} ${b(p.selectedUnit||p.unit)} = ${$(m)} ${b(p.unit)} > المتاح: ${$(p.availQty)})`,t.classList.remove("hidden"));return}}R=!0;const u=document.getElementById("exec-st-btn");u&&(u.disabled=!0);const v=window._editingTransferId;if(v){u&&(u.textContent="⏳ جارٍ حفظ التعديلات…");try{const p=B(k,`companies/${I}/stockTransfers`,v),g=await C(p);if(!g.exists())throw new Error("أمر التحويل غير موجود");const m={id:g.id,...g.data()},r={date:n,fromWarehouseId:e,fromWarehouseName:o||m.fromWarehouseName,toWarehouseId:s,toWarehouseName:l||m.toWarehouseName,lines:w,notes:a,updatedAt:new Date,updatedBy:window._transferUser?.uid||"system",updatedByName:window._transferUser?.displayName||window._transferUser?.email||"النظام"};if(m.status==="in_transit"||m.status==="received"){const f={};for(const y of m.lines||[]){const W=y.altUnit&&y.unitFactor>1&&y.selectedUnit===y.altUnit?y.unitFactor:1,D=y.effectiveQty!==void 0?y.effectiveQty:(parseFloat(y.qty)||0)*W;f[y.productId]=(f[y.productId]||0)+D}const h={};for(const y of w){const W=y.altUnit&&y.unitFactor>1&&y.selectedUnit===y.altUnit?y.unitFactor:1,D=Math.round((parseFloat(y.qty)||0)*W*1e3)/1e3;y.effectiveQty=D,h[y.productId]=(h[y.productId]||0)+D}const q=new Set([...Object.keys(f),...Object.keys(h)]),_=[];for(const y of q){const W=f[y]||0,F=(h[y]||0)-W;if(Math.abs(F)>1e-4){const Y=w.find(V=>V.productId===y)||(m.lines||[]).find(V=>V.productId===y);_.push({warehouseId:m.fromWarehouseId,productId:y,qtyDelta:-F,metadata:{type:F>0?"transfer_out":"transfer_cancel",sourceType:"stockTransfer",sourceId:v,documentNumber:m.number,productName:Y?.productName||y,notes:`تعديل أمر التحويل ${m.number||""} (المصدر) (فرق: ${F>0?"-":"+"}${Math.abs(F)})`}}),m.status==="received"&&_.push({warehouseId:m.toWarehouseId,productId:y,qtyDelta:F,metadata:{type:F>0?"transfer_in":"transfer_cancel",sourceType:"stockTransfer",sourceId:v,documentNumber:m.number,productName:Y?.productName||y,notes:`تعديل أمر التحويل ${m.number||""} (المستلم) (فرق: ${F>0?"+":"-"}${Math.abs(F)})`}})}}_.length>0&&await A(_)}await P("stockTransfers",v,r);try{const f=Q(T.journalEntries(),E("sourceType","==","stockTransfer"),E("sourceId","==",v)),h=await M(f);for(const q of h.docs)await nt(q.ref);m.status==="received"&&await G({...m,...r,id:v})}catch(f){console.warn("[EditTransfer] تحديث القيد فشل (غير حرج):",f.message)}showToast(`✅ تم تعديل أمر التحويل ${r.date,c} بنجاح`,"success"),window._editingTransferId=null,window._editingTransferSnap=null,closeModal("transfer-modal"),await N()}catch(p){t&&(t.textContent=p.message,t.classList.remove("hidden"))}finally{R=!1,u&&(u.disabled=!1,u.textContent="💾 حفظ التعديلات")}return}u&&(u.textContent="جارٍ الحفظ قيد النقل…");try{try{((await M(Q(O(k,`companies/${I}/stockTransfers`),E("number","==",c)))).docs.some(h=>h.data().status!=="cancelled")||!c||c.includes("جارٍ"))&&(c=await et("TR"),document.getElementById("st-number")&&(document.getElementById("st-number").value=c))}catch(r){console.warn("[StockTransfer] Number uniqueness check fallback:",r)}const p={number:c,date:n||H(),fromWarehouseId:e,fromWarehouseName:o,toWarehouseId:s,toWarehouseName:l,lines:w,notes:a,status:"in_transit",stockStatus:"pending_transfer_out",createdBy:window._transferUser?.uid||"system",createdByName:window._transferUser?.displayName||window._transferUser?.email||"النظام",receivedAt:null},g=await it(O(k,`companies/${I}/stockTransfers`),p),m=w.map(r=>{const f=r.altUnit&&r.unitFactor>1&&r.selectedUnit===r.altUnit?r.unitFactor:1,h=r.effectiveQty!==void 0?r.effectiveQty:Math.round((parseFloat(r.qty)||0)*f*1e3)/1e3;return r.effectiveQty=h,{warehouseId:e,productId:r.productId,qtyDelta:-h,metadata:{date:n||new Date().toISOString().slice(0,10),type:"transfer_out",sourceType:"stockTransfer",sourceId:g,documentNumber:c,productName:r.productName,notes:`قيد النقل إلى ${l} في المستند ${c} (${r.qty} ${b(r.selectedUnit||r.unit)})`}}});if(m.length>0)try{await A(m),await J(B(k,`companies/${I}/stockTransfers`,g),{stockStatus:"in_transit_deducted"}).catch(()=>{})}catch(r){throw console.error("[StockTransfer] adjustStockBulk failed:",r.message),await J(B(k,`companies/${I}/stockTransfers`,g),{stockStatus:"failed_transfer_out",stockError:r.message}).catch(()=>{}),new Error(`تعذر خصم المخزون من المستودع المحول منه: ${r.message}`)}try{await G({...p,id:g})}catch(r){console.warn("[StockTransfer] تعذر توليد القيد المحاسبي فوراً:",r.message)}showToast(`✅ تم حفظ أمر التحويل ${c} وتوليد القيد المحاسبي وحركة كرت الصنف`,"success"),closeModal("transfer-modal"),await N()}catch(p){(p?.message||"").includes("Quota exceeded")||p?.code==="resource-exhausted"||(p?.message||"").includes("429")?t&&(t.innerHTML="🚨 <strong>تنبيه حصة السيرفر (Quota Exceeded):</strong><br>تم الوصول للحد الأقصى اليومي المجاني لقراءة/كتابة السيرفر (50,000 عملية). يتجدد العداد تلقائياً منتصف الليل، أو يمكنك ترقية باقة الفايربيز إلى (Blaze Plan) لإلغاء الحد اليومي فوراً."):t&&(t.textContent=p.message||"حدث خطأ أثناء حفظ أمر التحويل"),t&&t.classList.remove("hidden")}finally{R=!1,u&&(u.disabled=!1,u.textContent="💾 تنفيذ التحويل (قيد النقل)")}};window.viewTransfer=async t=>{const e=document.getElementById("view-st-body");e.innerHTML='<div class="page-loading"><div class="loading-spinner"></div></div>',openModal("view-transfer-modal"),x=null,document.getElementById("st-confirm-btn").style.display="none",document.getElementById("st-cancel-btn").style.display="none",document.getElementById("st-approve-btn").style.display="none",document.getElementById("st-reject-btn").style.display="none";try{const s=B(k,`companies/${I}/stockTransfers`,t),n=await C(s);if(!n.exists())throw new Error("أمر التحويل غير موجود");const a={id:n.id,...n.data()};x=a;let c="";a.status==="requested"?(c='<span class="badge indigo">⏳ طلب شحن</span>',document.getElementById("st-approve-btn").style.display="",document.getElementById("st-reject-btn").style.display="",document.getElementById("st-edit-btn").style.display=""):a.status==="in_transit"?(c='<span class="badge warn">🚚 قيد النقل</span>',document.getElementById("st-confirm-btn").style.display="",document.getElementById("st-cancel-btn").style.display="",document.getElementById("st-edit-btn").style.display=""):a.status==="received"?c='<span class="badge good">✅ تم الاستلام</span>':c='<span class="badge neutral">🚫 ملغى</span>',U.length===0&&(U=await L(T.products()));let d=0;const i=(a.lines||[]).map((o,l)=>{const u=U.find(h=>h.id===o.productId),v=u&&(u.salePrice||u.priceRetail)||0,p=o.altUnit&&o.unitFactor>1&&o.selectedUnit===o.altUnit?o.unitFactor:1,g=o.effectiveQty!==void 0?o.effectiveQty:Math.round((parseFloat(o.qty)||0)*p*1e3)/1e3,m=g*v;d+=m;const r=b(o.selectedUnit||o.unit)||"—",f=o.altUnit&&o.unitFactor>1&&o.selectedUnit===o.altUnit?`<div style="font-size:10.5px;color:#059669;font-weight:700;">(= ${$(g)} ${b(o.unit)})</div>`:"";return`
        <tr>
          <td style="padding:7px 12px;">${l+1}</td>
          <td style="padding:7px 12px; font-weight:600;">${o.productName}</td>
          <td style="padding:7px 12px;" class="mono">${o.sku||"—"}</td>
          <td style="padding:7px 12px;">${r}</td>
          <td style="padding:7px 12px;" class="mono font-bold">${$(o.qty)}${f}</td>
          <td style="padding:7px 12px;" class="mono text-indigo">${v.toFixed(2)} ر.س</td>
          <td style="padding:7px 12px;" class="mono font-bold text-good">${m.toFixed(2)} ر.س</td>
        </tr>
      `}).join("");e.innerHTML=`
      <div class="grid-2 gap-16 mb-20">
        <div>
          <div class="section-label mb-6">رقم التحويل المرجعي</div>
          <div class="mono font-bold text-indigo text-lg">${a.number||a.id.slice(0,8)}</div>
        </div>
        <div>
          <div class="section-label mb-6">الحالة</div>
          <div>${c}</div>
        </div>
        <div>
          <div class="section-label mb-6">من مستودع (المصدر)</div>
          <div class="font-semibold">${a.fromWarehouseName||a.fromWarehouseId}</div>
        </div>
        <div>
          <div class="section-label mb-6">إلى مستودع (المستلم)</div>
          <div class="font-semibold">${a.toWarehouseName||a.toWarehouseId}</div>
        </div>
        <div>
          <div class="section-label mb-6">التاريخ</div>
          <div>${st(a.createdAt||a.date)}</div>
        </div>
        <div>
          <div class="section-label mb-6">أنشئ بواسطة</div>
          <div>${a.createdByName||"النظام"}</div>
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
          إجمالي القيمة البيعية للتحويل: <span class="mono text-indigo">${d.toFixed(2)} ر.س</span>
        </div>
      </div>

      ${a.notes?`<div style="padding:12px; background:var(--bg-2); border-radius:6px; font-size:13px;"><strong>ملاحظات:</strong> ${a.notes}</div>`:""}
    `}catch(s){e.innerHTML=`<div class="alert bad">${s.message}</div>`}};window.confirmReceipt=async()=>{if(!x||!confirm("⚠️ هل تأكدت من استلام كافة كميات الأصناف المذكورة فعلياً في المستودع المستلم؟"))return;const t=document.getElementById("st-confirm-btn");t&&(t.disabled=!0,t.textContent="⏳ جارٍ تأكيد الاستلام…");try{const e=B(k,`companies/${I}/stockTransfers`,x.id),s=await C(e);if(!s.exists())throw new Error("أمر التحويل غير موجود");const n={id:s.id,...s.data()};if(n.status==="received")throw new Error("هذا التحويل تم استلامه بالفعل");if(n.status==="cancelled")throw new Error("هذا التحويل تم إلغاؤه");await P("stockTransfers",n.id,{status:"received",receivedAt:new Date,receivedBy:window._transferUser?.uid||"system",receivedByName:window._transferUser?.displayName||window._transferUser?.email||"النظام"});const a=await M(Q(T.stockTransactions(),E("sourceId","==",n.id),E("type","==","transfer_out"))).catch(()=>({docs:[]})),c=new Set(a.docs.map(o=>o.data().productId)),d=[];if((n.lines||[]).forEach(o=>{const l=o.altUnit&&o.unitFactor>1&&o.selectedUnit===o.altUnit?o.unitFactor:1,u=o.effectiveQty!==void 0?o.effectiveQty:Math.round((parseFloat(o.qty)||0)*l*1e3)/1e3;c.has(o.productId)||d.push({warehouseId:n.fromWarehouseId,productId:o.productId,qtyDelta:-u,metadata:{date:n.date||new Date().toISOString().slice(0,10),type:"transfer_out",sourceType:"stockTransfer",sourceId:n.id,documentNumber:n.number,productName:o.productName,notes:`صرف التحويل المخزني إلى ${n.toWarehouseName||"الوجهة"} — سند: ${n.number}`}}),d.push({warehouseId:n.toWarehouseId,productId:o.productId,qtyDelta:+u,metadata:{date:n.date||new Date().toISOString().slice(0,10),type:"transfer_in",sourceType:"stockTransfer",sourceId:n.id,documentNumber:n.number,productName:o.productName,notes:`تم تأكيد استلام الشحنة ${n.number} (${o.qty} ${b(o.selectedUnit||o.unit)})`}})}),d.length>0)try{await A(d),await J(B(k,`companies/${I}/stockTransfers`,n.id),{stockStatus:"completed"}).catch(()=>{})}catch(o){throw console.error("[StockTransfer] receive adjustStockBulk failed:",o.message),await J(B(k,`companies/${I}/stockTransfers`,n.id),{stockStatus:"failed_transfer_in",stockError:o.message}).catch(()=>{}),new Error(`تعذر إضافة المخزون لمستودع/سيارة الوجهة: ${o.message}`)}let i=!1;try{i=!!await G(n)}catch(o){console.warn("[TransferJE] تعذر إنشاء القيد:",o.message)}showToast(i?`✅ تم تأكيد الاستلام وإنشاء القيد المحاسبي للتحويل ${n.number}`:"✅ تم تأكيد الاستلام (تحذير: لم تتوفر تكلفة لإنشاء القيد)",i?"success":"warning"),closeModal("view-transfer-modal"),await N()}catch(e){showToast(e.message,"error")}finally{t.disabled=!1,t.textContent="✅ تأكيد الاستلام"}};window.cancelTransfer=async()=>{if(!x||!confirm("🚫 هل تريد إلغاء أمر التحويل وإرجاع الكميات للمخزن المصدر؟"))return;const t=document.getElementById("st-cancel-btn");t.disabled=!0,t.textContent="⏳ جارٍ الإلغاء…";try{const e=B(k,`companies/${I}/stockTransfers`,x.id),s=await C(e);if(!s.exists())throw new Error("أمر التحويل غير موجود");const n={id:s.id,...s.data()};if(n.status==="received")throw new Error("لا يمكن إلغاء التحويل بعد استلامه");if(n.status==="cancelled")throw new Error("هذا التحويل ملغى بالفعل");await P("stockTransfers",n.id,{status:"cancelled",stockStatus:"cancelled",cancelledAt:new Date});const a=(n.lines||[]).map(c=>{const d=c.altUnit&&c.unitFactor>1&&c.selectedUnit===c.altUnit?c.unitFactor:1,i=c.effectiveQty!==void 0?c.effectiveQty:Math.round((parseFloat(c.qty)||0)*d*1e3)/1e3;return{warehouseId:n.fromWarehouseId,productId:c.productId,qtyDelta:+i,metadata:{type:"transfer_cancel",sourceType:"stockTransfer",sourceId:n.id,documentNumber:n.number,productName:c.productName,notes:`إرجاع الكميات بعد إلغاء الأمر ${n.number} (+${c.qty} ${b(c.selectedUnit||c.unit)})`}}});a.length>0&&await A(a);try{const c=Q(T.journalEntries(),E("sourceType","==","stockTransfer"),E("sourceId","==",n.id)),d=await M(c);for(const i of d.docs)await nt(i.ref)}catch(c){console.warn("[CancelTransfer] تعذر حذف القيد للتحويل الملغى:",c.message)}showToast("🚫 تم إلغاء أمر التحويل وإعادة الكميات لمخزن المصدر","success"),closeModal("view-transfer-modal"),await N()}catch(e){showToast(e.message,"error")}finally{t.disabled=!1,t.textContent="🚫 إلغاء الأمر"}};window.approveTransferRequest=async()=>{if(!x||!confirm(`⚠️ هل توافق على طلب شحن السيارة رقم ${x.number||x.id.slice(0,8)}؟
سيتم خصم الكميات من مستودع المصدر (${x.fromWarehouseName}) وتصبح الشحنة قيد النقل للسيارة.`))return;const t=document.getElementById("st-approve-btn");t.disabled=!0,t.textContent="⏳ جاري الاعتماد والشحن…";try{const e=I,s=B(k,`companies/${e}/stockTransfers`,x.id),n=await C(s);if(!n.exists())throw new Error("أمر التحويل غير موجود");const a={id:n.id,...n.data()};if(a.status!=="requested")throw new Error("حالة هذا الطلب تغيرت بالفعل");for(const d of a.lines||[]){const i=d.altUnit&&d.unitFactor>1&&d.selectedUnit===d.altUnit?d.unitFactor:1,o=d.effectiveQty!==void 0?d.effectiveQty:Math.round((parseFloat(d.qty)||0)*i*1e3)/1e3,l=B(k,`companies/${e}/stockByWarehouse`,`${a.fromWarehouseId}_${d.productId}`),u=await C(l),v=u.exists()&&u.data().qty||0;if(v<o)throw new Error(`عذراً، الرصيد غير كافٍ في مستودع المصدر للصنف: ${d.productName} (المتاح: ${$(v)} ، المطلوب: ${$(o)} ${b(d.unit)})`)}await P("stockTransfers",a.id,{status:"in_transit",approvedAt:new Date,approvedBy:window._transferUser?.uid||"system",approvedByName:window._transferUser?.displayName||window._transferUser?.email||"المدير"});const c=(a.lines||[]).map(d=>{const i=d.altUnit&&d.unitFactor>1&&d.selectedUnit===d.altUnit?d.unitFactor:1,o=d.effectiveQty!==void 0?d.effectiveQty:Math.round((parseFloat(d.qty)||0)*i*1e3)/1e3;return{warehouseId:a.fromWarehouseId,productId:d.productId,qtyDelta:-o,metadata:{type:"transfer_out",sourceType:"stockTransfer",sourceId:a.id,documentNumber:a.number,productName:d.productName,notes:`تمت الموافقة وشحن البضاعة للسيارة في المستند ${a.number} (${d.qty} ${b(d.selectedUnit||d.unit)})`}}});c.length>0&&await A(c),showToast("✅ تم اعتماد الطلب وبدء عملية الشحن (قيد النقل للسيارة)","success"),closeModal("view-transfer-modal"),await N()}catch(e){showToast(e.message,"error")}finally{t.disabled=!1,t.textContent="✔️ موافقة وشحن السيارة"}};window.rejectTransferRequest=async()=>{if(!x||!confirm(`❌ هل أنت متأكد من رفض وإلغاء طلب شحن السيارة رقم ${x.number||x.id.slice(0,8)}؟`))return;const t=document.getElementById("st-reject-btn");t.disabled=!0,t.textContent="⏳ جاري الرفض…";try{const e=B(k,`companies/${I}/stockTransfers`,x.id),s=await C(e);if(!s.exists())throw new Error("أمر التحويل غير موجود");const n={id:s.id,...s.data()};if(n.status!=="requested")throw new Error("حالة هذا الطلب تغيرت بالفعل");await P("stockTransfers",n.id,{status:"cancelled",rejectedAt:new Date,rejectedBy:window._transferUser?.uid||"system",rejectedByName:window._transferUser?.displayName||window._transferUser?.email||"المدير",notes:(n.notes||"")+" (تم رفض الطلب من قبل الإدارة)"}),showToast("🚫 تم رفض وإلغاء طلب الشحن بنجاح","success"),closeModal("view-transfer-modal"),await N()}catch(e){showToast(e.message,"error")}finally{t.disabled=!1,t.textContent="❌ رفض الطلب"}};window.printStockTransfer=async()=>{if(!x)return;const t=x;let e="مؤسسة أدهام للمواد الغذائية",s="",n="";try{const i=await C(B(k,`companies/${I}/settings`,"company"));if(i.exists()){const o=i.data();e=o.name||e,s=o.vatNumber||"",n=o.crNumber||""}}catch(i){console.warn(i)}U.length===0&&(U=await L(T.products()));let a=0;const c=(t.lines||[]).map((i,o)=>{const l=U.find(f=>f.id===i.productId),u=l&&(l.salePrice||l.priceRetail)||0,v=i.altUnit&&i.unitFactor>1&&i.selectedUnit===i.altUnit?i.unitFactor:1,p=i.effectiveQty!==void 0?i.effectiveQty:Math.round((parseFloat(i.qty)||0)*v*1e3)/1e3,g=p*u;a+=g;const m=b(i.selectedUnit||i.unit)||"—",r=i.altUnit&&i.unitFactor>1&&i.selectedUnit===i.altUnit?` <div style="font-size:10.5px;color:#059669;font-weight:bold;">(= ${$(p)} ${b(i.unit)})</div>`:"";return`
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${o+1}</td>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${i.productName}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;" class="mono">${i.sku||"—"}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${m}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;" class="mono"><b>${$(i.qty)}</b>${r}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: left;" class="mono">${u.toFixed(2)} ر.س</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;" class="mono">${g.toFixed(2)} ر.س</td>
      </tr>
    `}).join(""),d=window.open("","_blank");d.document.write(`
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
          ${n?`<div style="font-size: 12px; color: #666;">سجل تجاري: ${n}</div>`:""}
          ${s?`<div style="font-size: 12px; color: #666;">الرقم الضريبي: ${s}</div>`:""}
        </div>
        <div class="title">سند تحويل مخزني</div>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <div><span class="meta-label">رقم التحويل المرجعي:</span> <span class="meta-value">${t.number||t.id.slice(0,8)}</span></div>
          <div><span class="meta-label">تاريخ المستند:</span> <span class="meta-value">${st(t.createdAt||t.date)}</span></div>
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
          ${c}
        </tbody>
      </table>

      <div class="total-box">
        إجمالي القيمة البيعية للتحويل: <span style="color: #0056b3; font-size: 18px;">${a.toFixed(2)} ر.س</span>
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
  `),d.document.close()};export{ht as render};
