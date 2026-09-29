const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/balance-sync-Cpo3qtSB.js","assets/index-CnctmNGr.js","assets/index-Dq7oGj9k.css"])))=>i.map(i=>d[i]);
import{q as O,g as R,a as m,_ as S,f as p,u as A,o as H,r as U}from"./index-CnctmNGr.js";import{u as P,s as z,d as W}from"./coa-connector-D6PwCSyt.js";import{p as K}from"./record-actions-BUPPxq1M.js";import{syncSupplierNameEverywhere as G,syncSupplierBalanceToCoa as J}from"./sync-engine-DfuA5k8t.js";import{orderBy as Q,getDocs as y,query as x,where as f}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let b=[];async function de(e,t){e.innerHTML=`
    <div class="filterbar">
      <div class="search-bar" style="max-width:240px;"><input type="text" id="sup-search" class="input" placeholder="🔍  بحث في الموردين…" /></div>
      <div class="filter-select-group" style="max-width:180px;">
        <select id="sup-category-filter" class="input">
          <option value="">كل التصنيفات</option>
          <option value="rice">موردو الأرز</option>
          <option value="sugar_oil">موردو السكر والزيت</option>
          <option value="flour">موردو الدقيق والمواد الأساسية</option>
          <option value="services">موردو الخدمات (مرافق وإيجار)</option>
          <option value="other">موردون آخرون</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary" onclick="window.syncAllSuppliersBalances()" title="مزامنة وتحديث أرصدة الموردين مع القيود والفواتير"><span>🔄</span> مزامنة الأرصدة</button>
        <button class="btn-export" onclick="exportPagePDF('.data-dense','الموردين')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportSuppliersExcel()" title="تصدير Excel"><span>📊</span> تصدير Excel</button>
        <button class="btn-export" style="background:#10B981;color:#fff;" onclick="openSupplierImportModal()" title="استيراد من Excel"><span>📤</span> استيراد Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn btn-primary" onclick="openSupplierModal()">+ إضافة مورد</button>
      </div>
    </div>
    <div class="page-content">
      <div class="page-header"><h1 class="page-title">دليل الموردين</h1><p class="page-subtitle" id="sup-count"></p></div>
      <div class="card">
        <div class="table-container">
          <table class="data-dense"><thead><tr><th>اسم المورد</th><th>الهاتف</th><th>الآيبان / البنك</th><th>الرصيد المستحق</th><th style="text-align:center;">الإجراءات</th></tr></thead>
          <tbody id="sup-tbody">${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(5).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}</tbody>
        </table></div></div>
    </div>
    
    <!-- Supplier Add/Edit Modal -->
    <div class="modal-overlay" id="supplier-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title" id="sup-modal-title">إضافة مورد</h3><button class="modal-close" onclick="closeModal('supplier-modal')">×</button></div>
      <div class="modal-body" style="padding:20px;">
        <input type="hidden" id="sup-edit-id" />
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>اسم المورد *</label><input type="text" id="sup-name" class="input" placeholder="الاسم التجاري للمورد" /></div>
          <div class="form-group"><label>كود المورد</label><input type="text" id="sup-code" class="input mono" placeholder="SUP-001" /></div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:16px;">
          <div class="form-group"><label>رقم الهاتف</label><input type="text" id="sup-phone" class="input mono" placeholder="05xxxxxxxx" /></div>
          <div class="form-group"><label>الرقم الضريبي (VAT)</label><input type="text" id="sup-vat" class="input mono" placeholder="3xxxxxxxxxxxxxx" /></div>
          <div class="form-group"><label>الهوية الوطنية / السجل التجاري</label><input type="text" id="sup-national-id" class="input mono" placeholder="رقم الهوية أو السجل" /></div>
        </div>
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group">
            <label>تصنيف المورد *</label>
            <select id="sup-category" class="input">
              <option value="other">موردون آخرون</option>
              <option value="rice">موردو الأرز</option>
              <option value="sugar_oil">موردو السكر والزيت</option>
              <option value="flour">موردو الدقيق والمواد الأساسية</option>
              <option value="services">موردو الخدمات (مرافق وإيجار)</option>
            </select>
          </div>
          <div class="form-group">
            <label>اسم البنك المعتمد</label>
            <input type="text" id="sup-bank" class="input" placeholder="مصرف الراجحي / الأهلي..." />
          </div>
          <div class="form-group">
            <label>رقم الآيبان (IBAN)</label>
            <input type="text" id="sup-iban" class="input mono" placeholder="SA0000000000000000000000" />
          </div>
        </div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>العنوان والمستودع</label><input type="text" id="sup-address" class="input" placeholder="المدينة، الشارع، المنطقة الصناعية" /></div>
          <div class="form-group"><label>رابط موقع المستودع على خرائط جوجل (Maps URL)</label><input type="url" id="sup-maps-url" class="input mono" placeholder="https://maps.google.com/?q=..." /></div>
        </div>
        <div class="form-group" id="sup-coa-toggle-wrap" style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input type="checkbox" id="sup-coa-toggle" checked style="width:16px;height:16px;cursor:pointer;" />
          <label for="sup-coa-toggle" style="margin-bottom:0;cursor:pointer;font-weight:bold;">إنشاء حساب مستقل في شجرة الحسابات</label>
        </div>
        <div class="form-group"><label>ملاحظات وشروط الدفع</label><input type="text" id="sup-notes" class="input" placeholder="شروط الدفع، فترات السماح، شروط التحميل..." /></div>
        <div id="sup-error" class="alert bad hidden" style="margin-top:8px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('supplier-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="saveSupplier()" id="save-sup-btn">حفظ</button>
      </div></div></div>`;const a=e.querySelector("#sup-search");a&&a.addEventListener("input",O(()=>h(),350));const n=e.querySelector("#sup-category-filter");n&&n.addEventListener("change",()=>h()),await h()}async function h(){const e=document.getElementById("sup-tbody");if(!e)return;const t=document.getElementById("sup-search"),a=t?t.value.toLowerCase().trim():"";try{let n=await R(m.suppliers(),[Q("name")]);b=n,F(n,e,a),Promise.resolve().then(async()=>{const{recalculateSupplierBalance:c}=await S(async()=>{const{recalculateSupplierBalance:i}=await import("./balance-sync-Cpo3qtSB.js");return{recalculateSupplierBalance:i}},__vite__mapDeps([0,1,2]));let d=!1;for(const i of n)if(i.balance===void 0||i.balance===null||i.balance===0){const r=await c(i.id).catch(()=>null);r!==null&&r!==i.balance&&(i.balance=r,d=!0)}d&&F(n,e,a)}).catch(()=>{})}catch(n){e.innerHTML=`<tr><td colspan="5"><div class="alert bad">${n.message}</div></td></tr>`}}function F(e,t,a){let n=[...e];a&&(n=n.filter(l=>(l.name||"").toLowerCase().includes(a)||(l.phone||"").includes(a)||(l.code||"").toLowerCase().includes(a)||(l.vatNumber||"").includes(a)));const c=document.getElementById("sup-category-filter")?.value;c&&(n=n.filter(l=>l.category===c));const d=document.getElementById("sup-count");d&&(d.textContent=`${n.length} مورد`);const i={rice:"الأرز",sugar_oil:"السكر والزيت",flour:"الدقيق والمواد الأساسية",services:"الخدمات",other:"أخرى"},r={rice:"#6366f1",sugar_oil:"#f59e0b",flour:"#10b981",services:"#8b5cf6",other:"#6b7280"};t.innerHTML=n.length===0?'<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-2);">لا يوجد موردون</td></tr>':n.map(l=>`<tr>
        <td>
          <div style="display:flex;align-items:center;gap:6px;">
            <div class="font-semibold font-heading" style="cursor:pointer; color:var(--brand);" onclick="viewSupplierIntelligence360('${l.id}')">${l.name}</div>
            ${l.category?`<span class="coa-badge" style="background:${r[l.category]}22;color:${r[l.category]};padding:1px 5px;border-radius:4px;font-size:9px;font-weight:bold;">${i[l.category]||l.category}</span>`:""}
          </div>
          ${l.code?`<div style="font-size:11px;color:var(--text-2);">${l.code}</div>`:""}
        </td>
        <td class="mono dim">${l.phone||"—"}</td>
        <td class="mono" style="font-size:11.5px;">${l.iban?`<b>${l.bankName||"بنك"}:</b> ${l.iban.slice(0,10)}...`:"—"}</td>
        <td class="mono font-bold ${(l.balance||0)>0?"text-bad":(l.balance||0)<0?"text-good":""}">
          ${(l.balance||0)<0?`<span style="color:#059669; font-weight:800;" title="مدين لصالحنا">(${p(Math.abs(l.balance))}) مدين</span>`:p(l.balance||0)}
        </td>
        <td>
          <div class="row-actions" style="justify-content:center;">
            <button class="btn btn-icon sm btn-ghost" onclick="viewSupplierIntelligence360('${l.id}')" title="بطاقة المورد 360°">👁️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="editSupplier('${l.id}')" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="printSupplier('${l.id}')" title="طباعة">🖨️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="viewSupplierStatement('${l.id}')" title="كشف حساب">📊</button>
            <button class="btn btn-icon sm btn-ghost" onclick="delSupplier('${l.id}','${l.name.replace(/'/g,"\\'")}')" style="color:var(--bad);" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>`).join("")}window.openSupplierModal=(e=null)=>{document.getElementById("sup-edit-id").value=e?.id||"",document.getElementById("sup-modal-title").textContent=e?"تعديل المورد":"إضافة مورد",document.getElementById("sup-name").value=e?.name||"",document.getElementById("sup-code").value=e?.code||"",document.getElementById("sup-phone").value=e?.phone||"",document.getElementById("sup-vat").value=e?.vatNumber||e?.vat||"",document.getElementById("sup-national-id").value=e?.nationalId||"",document.getElementById("sup-address").value=e?.address||"",document.getElementById("sup-category").value=e?.category||"other",document.getElementById("sup-bank").value=e?.bankName||"",document.getElementById("sup-iban").value=e?.iban||"",document.getElementById("sup-maps-url").value=e?.googleMapsUrl||"",document.getElementById("sup-notes").value=e?.notes||"",document.getElementById("sup-error").classList.add("hidden");const t=document.getElementById("sup-coa-toggle-wrap"),a=document.getElementById("sup-coa-toggle");e?(t&&(t.style.display="none"),a&&(a.checked=!!e.accountId)):(t&&(t.style.display="flex"),a&&(a.checked=!0)),openModal("supplier-modal")};window.editSupplier=e=>{const t=b.find(a=>a.id===e);t?openSupplierModal(t):S(()=>import("./index-CnctmNGr.js").then(a=>a.T),__vite__mapDeps([1,2])).then(async({getById:a})=>{try{const n=await a("suppliers",e);n&&openSupplierModal(n)}catch(n){showToast(n.message,"error")}})};window.saveSupplier=async()=>{const e=document.getElementById("sup-error");e.classList.add("hidden");const t=document.getElementById("sup-edit-id").value,a=document.getElementById("sup-name").value.trim();if(!a){e.textContent="الاسم مطلوب",e.classList.remove("hidden");return}const n={name:a,code:document.getElementById("sup-code").value.trim(),phone:document.getElementById("sup-phone").value.trim(),vatNumber:document.getElementById("sup-vat").value.trim(),nationalId:document.getElementById("sup-national-id").value.trim(),address:document.getElementById("sup-address").value.trim(),category:document.getElementById("sup-category").value,bankName:document.getElementById("sup-bank").value.trim(),iban:document.getElementById("sup-iban").value.trim(),googleMapsUrl:document.getElementById("sup-maps-url").value.trim(),notes:document.getElementById("sup-notes").value.trim()};t||(n.balance=0);const c=document.getElementById("save-sup-btn");c.disabled=!0;try{if(t){const d=b.find(i=>i.id===t);if(await A("suppliers",t,n),d){const i=d.name!==a;if(d.accountId)i&&(await P(d.accountId,a),G(t,a).catch(r=>console.warn("[Suppliers] syncSupplierNameEverywhere error:",r.message)));else{const r=await z("suppliers",t,a);r&&await A("suppliers",t,r)}J(t).catch(()=>{})}showToast("تم تحديث بيانات المورد ✅")}else{const d=document.getElementById("sup-coa-toggle")?.checked??!0;let i={};if(d){const l="sup_"+Date.now(),I=await z("suppliers",l,a);I&&(i=I)}const r=await H("suppliers",{...n,...i});d&&i.accountId&&await P(i.accountId,a,r),showToast("تمت إضافة المورد بنجاح ✅")}closeModal("supplier-modal"),await h()}catch(d){e.textContent=d.message,e.classList.remove("hidden")}finally{c.disabled=!1}};window.delSupplier=async(e,t)=>{if(confirm(`هل أنت متأكد من حذف المورد "${t}"؟`))try{const a=b.find(n=>n.id===e);a?.accountId&&await W(a.accountId),await U("suppliers",e),showToast("تم حذف المورد ✅"),await h()}catch(a){showToast("فشل الحذف: "+a.message,"error")}};window.viewSupplierStatement=e=>{window.navigate&&(window.navigate("supplier-statement"),setTimeout(()=>{typeof window.selectSupplierForStmt=="function"&&window.selectSupplierForStmt(e)},300))};window.viewSupplierIntelligence360=async e=>{const t=b.find(n=>n.id===e);if(!t)return;const a=document.createElement("div");a.className="modal-overlay active",a.id="sup-360-overlay",a.style.zIndex="1100",a.innerHTML=`
    <div class="modal modal-lg" style="max-width:980px; width:95%; max-height:92vh; display:flex; flex-direction:column; padding:0; overflow:hidden; border-radius:16px; background:var(--bg-1);">
      <div class="modal-header" style="padding:18px 24px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
        <h3 class="modal-title" style="display:flex; align-items:center; gap:8px; font-size:16px; font-weight:800; color:var(--brand); margin:0;">
          🏢 بطاقة المورد الشاملة 360°: <span style="color:var(--text-0);">${t.name}</span>
        </h3>
        <button class="modal-close" onclick="document.getElementById('sup-360-overlay').remove()">×</button>
      </div>
      <div class="modal-body" id="sup-360-body" style="padding:24px; overflow-y:auto; flex:1; background:var(--bg-3);">
        <div style="text-align:center; padding:60px;"><span class="spin"></span> جاري تجميع مؤشرات ومشتريات المورد...</div>
      </div>
    </div>
  `,document.body.appendChild(a);try{const{recalculateSupplierBalance:n}=await S(async()=>{const{recalculateSupplierBalance:o}=await import("./balance-sync-Cpo3qtSB.js");return{recalculateSupplierBalance:o}},__vite__mapDeps([0,1,2])),c=await n(e).catch(()=>t.balance||0);t.balance=c;const[d,i,r,l,I,N]=await Promise.all([y(x(m.purchaseInvoices(),f("supplierId","==",e))).catch(()=>({docs:[]})),y(x(m.expenses(),f("targetId","==",e))).catch(()=>({docs:[]})),y(x(m.receipts(),f("targetId","==",e))).catch(()=>({docs:[]})),y(x(m.supplierContracts(),f("supplierId","==",e))).catch(()=>({docs:[]})),y(x(m.supplierClaims(),f("supplierId","==",e))).catch(()=>({docs:[]})),y(x(m.supplierEvaluations(),f("supplierId","==",e))).catch(()=>({docs:[]}))]),$=(d.docs||[]).map(o=>o.data()).filter(o=>o.status!=="cancelled"),k=(i.docs||[]).map(o=>o.data()).filter(o=>o.status!=="cancelled"),D=(r.docs||[]).map(o=>o.data()).filter(o=>o.status!=="cancelled"&&(!o.entityType||o.entityType==="supplier")),V=(l.docs||[]).map(o=>o.data()),q=(I.docs||[]).map(o=>o.data()),T=(N.docs||[]).map(o=>o.data()),_=$.reduce((o,s)=>o+parseFloat(s.totalWithVat||s.total||0),0),L=k.reduce((o,s)=>o+parseFloat(s.amount||0),0),j=D.reduce((o,s)=>o+parseFloat(s.amount||0),0),E=typeof t.balance=="number"?t.balance:_+j-L,B=T.length?T[0]:null,w={};$.forEach(o=>{(o.lines||o.items||[]).forEach(s=>{const g=s.name||s.productName;g&&(w[g]||(w[g]={name:g,qty:0,totalVal:0,lastPrice:s.unitPrice||s.price||0}),w[g].qty+=parseFloat(s.qty||s.quantity||1),w[g].totalVal+=parseFloat(s.total||(s.qty||1)*(s.unitPrice||0)))})});const M=Object.values(w).sort((o,s)=>s.totalVal-o.totalVal).slice(0,5),C=document.getElementById("sup-360-body");if(!C)return;const v=E>0,u=E<0;C.innerHTML=`
      <div style="display:flex; flex-direction:column; gap:16px;">
        
        <!-- Action Toolbar -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; background:var(--bg-card); padding:12px 16px; border-radius:12px; border:1px solid var(--border-soft);">
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" onclick="document.getElementById('sup-360-overlay').remove(); window.viewSupplierStatement('${e}')">📊 كشف حساب تفصيلي</button>
            ${t.phone?`<button class="btn btn-secondary btn-sm" style="color:#25D366;" onclick="window.open('https://api.whatsapp.com/send?phone=${t.phone.replace(/[^0-9]/g,"")}', '_blank')">💬 محادثة واتساب</button>`:""}
            ${t.googleMapsUrl?`<a href="${t.googleMapsUrl}" target="_blank" class="btn btn-secondary btn-sm" style="color:var(--brand); text-decoration:none;">📍 موقع المستودع على الخريطة</a>`:""}
            ${t.iban?`<button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('${t.iban}'); alert('تم نسخ الآيبان ✅');">📋 نسخ الآيبان</button>`:""}
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            ${B?`<span class="badge good" style="font-weight:800; font-size:11.5px;">🌟 الفئة: ${B.tier||"A"} (${B.overallScore||90}%)</span>`:""}
            <span class="badge" style="background:rgba(99,102,241,0.1); color:var(--brand); font-weight:800;">📜 العقود: ${V.length}</span>
            <span class="badge" style="background:rgba(239,68,68,0.1); color:#EF4444; font-weight:800;">🔍 المطالبات: ${q.length}</span>
          </div>
        </div>

        ${t.pinnedWarningNote?`
          <div class="alert bad" style="padding:12px 16px; font-weight:800; font-size:13px; border-radius:10px; display:flex; align-items:center; gap:8px;">
            <span>⚠️</span> <span><b>تحذير مثبت للمورد:</b> ${t.pinnedWarningNote}</span>
          </div>
        `:""}

        <!-- KPI Cards -->
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px;">
          <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
            <div style="font-size:11px; color:var(--text-3); font-weight:700;">إجمالي المشتريات التاريخية</div>
            <div class="mono font-bold" style="font-size:18px; color:var(--brand); margin-top:4px;">${p(_)}</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:2px;">عدد الفواتير: ${$.length}</div>
          </div>
          <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
            <div style="font-size:11px; color:#10B981; font-weight:700;">إجمالي السدادات المنفذة</div>
            <div class="mono font-bold" style="font-size:18px; color:#10B981; margin-top:4px;">${p(L)}</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:2px;">عدد السندات: ${k.length}</div>
          </div>
          <div class="card" style="padding:14px; background:${v?"rgba(239,68,68,0.05)":u?"rgba(16,185,129,0.05)":"var(--bg-card)"}; border:1.5px solid ${v?"#EF4444":u?"#10B981":"var(--border-soft)"}; border-radius:12px;">
            <div style="font-size:11px; color:${v?"#EF4444":u?"#10B981":"var(--text-3)"}; font-weight:700;">
              ${v?"الرصيد المستحق للمورد":u?"رصيد المورد (مدين لصالحنا)":"رصيد الحساب"}
            </div>
            <div class="mono font-bold" style="font-size:18px; color:${v?"#EF4444":u?"#10B981":"var(--text-0)"}; margin-top:4px;">
              ${u?`(${p(Math.abs(E))}) مدين`:p(E)}
            </div>
            <div style="font-size:11px; color:var(--text-2); margin-top:2px;">
              الحالة: ${v?"مستحق السداد للمورد":u?"دفعة مقدمة / قيد افتتاحي لصالحنا":"مطابق (0.00)"}
            </div>
          </div>
          <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
            <div style="font-size:11px; color:var(--text-3); font-weight:700;">الحساب البنكي المعتمد</div>
            <div class="mono font-bold" style="font-size:12.5px; color:var(--brand); margin-top:6px; word-break:break-all;">${t.iban||"غير مسجل"}</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:2px;">${t.bankName||"البنك"}</div>
          </div>
        </div>

        <!-- Top Supplied Products Table -->
        <div class="card" style="padding:18px;">
          <h4 style="margin:0 0 12px; font-size:14px; font-weight:800; color:var(--text-0);">📦 أكثر السلع والمواد الغذائية توريداً من هذا المورد:</h4>
          <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px;">
            <table class="data-dense" style="margin:0;">
              <thead>
                <tr>
                  <th>اسم الصنف</th>
                  <th style="width:120px; text-align:center;">إجمالي الكمية الموردة</th>
                  <th style="width:130px; text-align:left;">آخر سعر شراء</th>
                  <th style="width:140px; text-align:left;">إجمالي قيمة الشراء</th>
                </tr>
              </thead>
              <tbody>
                ${M.map(o=>`
                  <tr>
                    <td class="font-bold">${o.name}</td>
                    <td class="mono" style="text-align:center;">${o.qty}</td>
                    <td class="mono font-bold" style="text-align:left;">${p(o.lastPrice)}</td>
                    <td class="mono font-bold text-brand" style="text-align:left;">${p(o.totalVal)}</td>
                  </tr>
                `).join("")}
                ${M.length?"":'<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-3);">لا توجد مشتريات بضائع مسجلة بعد</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `}catch(n){const c=document.getElementById("sup-360-body");c&&(c.innerHTML=`<div class="alert bad">${n.message}</div>`)}};function X(e){return b.find(t=>t.id===e)||null}function Y(e){const t={rice:"موردو الأرز",sugar_oil:"موردو السكر والزيت",flour:"موردو الدقيق والمواد الأساسية",services:"موردو الخدمات (مرافق وإيجار)",other:"موردون آخرون"};return[{heading:"بيانات المورد",rows:[{label:"اسم المورد",value:e.name,bold:!0},{label:"كود المورد",value:e.code,mono:!0},{label:"تصنيف المورد",value:t[e.category]||e.category||"موردون آخرون"},{label:"رقم الهاتف",value:e.phone,mono:!0},{label:"الرقم الضريبي (VAT)",value:e.vatNumber,mono:!0},{label:"الهوية الوطنية / السجل التجاري",value:e.nationalId,mono:!0},{label:"البنك والآيبان",value:e.iban?`${e.bankName||"البنك"}: ${e.iban}`:"—",mono:!0},{label:"العنوان",value:e.address}]},{heading:"بيانات مالية وقانونية",rows:[{label:"الرصيد الحالي",value:p(e.balance||0),mono:!0,bold:!0},{label:"ملاحظات",value:e.notes}]}]}window.previewSupplier=e=>{window.viewSupplierIntelligence360(e)};window.printSupplier=e=>{const t=X(e);t&&K({title:t.name,icon:"🏭",sections:Y(t)})};window.exportSupplierPDF=e=>{window.printSupplier(e)};window.syncAllSuppliersBalances=async()=>{try{const{recalculateSupplierBalance:e}=await S(async()=>{const{recalculateSupplierBalance:t}=await import("./balance-sync-Cpo3qtSB.js");return{recalculateSupplierBalance:t}},__vite__mapDeps([0,1,2]));window.showToast&&window.showToast("جاري مزامنة وتحديث أرصدة الموردين مع القيود والفواتير...","info");for(const t of b)await e(t.id).catch(()=>{});await h(),window.showToast&&window.showToast("✅ تم تحديث ومزامنة كافة أرصدة الموردين بنجاح","success")}catch(e){console.error(e),window.showToast&&window.showToast("حدث خطأ أثناء مزامنة الأرصدة","error")}};export{de as render};
