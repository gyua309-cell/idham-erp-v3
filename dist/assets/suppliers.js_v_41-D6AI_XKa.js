const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css","assets/balance-sync-CUiyFg8g.js"])))=>i.map(i=>d[i]);
import{w as Y,g as q,C as u,f as c,_ as C,u as z,c as J,r as Q}from"./index-CF9GFeRJ.js";import{updateEntityInCoa as N,syncEntityToCoa as D,deleteEntityInCoa as X}from"./coa-connector-9pNG4b1x.js";import{p as Z}from"./record-actions-BUPPxq1M.js";import{syncSupplierNameEverywhere as K,syncSupplierBalanceToCoa as ee}from"./sync-engine-B3XmYvGy.js";import{orderBy as te,getDocs as f,query as h,where as x}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let b=[],p=[];const H=[{id:"services",name:"موردو الخدمات والمرافق (إيجار، كهرباء، صيانة)"},{id:"logistics",name:"موردو النقل والشحن واللوجستيات"},{id:"packaging",name:"مستلزمات التعبئة والتغليف والبلاستيك"},{id:"maintenance",name:"صيانة أجهزة ومعدات ومستودعات"},{id:"it_software",name:"تقنية معلومات وبرمجيات واستشارات"},{id:"other",name:"موردون آخرون / عام"}],V={rice:"موردو الأرز",sugar_oil:"موردو السكر والزيت",flour:"موردو الدقيق والمواد الأساسية",services:"موردو الخدمات والمرافق",other:"موردون آخرون / عام"};function B(e){const t={rice:"#2563eb",sugar_oil:"#d97706",flour:"#059669",services:"#7c3aed",other:"#4b5563",logistics:"#0891b2",packaging:"#c026d3",maintenance:"#ea580c"};if(e&&t[e])return t[e];let o=0;for(let s=0;s<(e||"").length;s++)o=e.charCodeAt(s)+((o<<5)-o);const a=[210,160,280,30,340,190,80,250];return`hsl(${a[Math.abs(o)%a.length]}, 70%, 40%)`}function I(e){if(!e)return"مورد عام";const t=(p||[]).find(a=>a.id===e||a.code===e);if(t)return t.name;const o=H.find(a=>a.id===e);return o?o.name:V[e]?V[e]:e}async function R(){if(!p||p.length===0)try{p=await q(u.categories()),p.sort((e,t)=>(e.name||"").localeCompare(t.name||"","ar"))}catch(e){console.warn("Failed to load categories for suppliers:",e),p=[]}ae()}function ae(){const e=document.getElementById("sup-category-filter"),t=document.getElementById("sup-category"),o=(a=!1)=>{let i=a?'<option value="">كل التصنيفات</option>':'<option value="">اختر التصنيف...</option>';return p&&p.length>0&&(i+='<optgroup label="📦 فئات البضائع والمنتجات">',p.forEach(s=>{i+=`<option value="${s.id}">${s.name}</option>`}),i+="</optgroup>"),i+='<optgroup label="🏢 خدمات ومجالات عامة">',H.forEach(s=>{i+=`<option value="${s.id}">${s.name}</option>`}),i+="</optgroup>",i+='<optgroup label="🏷️ تصنيفات سابقة">',i+='<option value="rice">موردو الأرز (سابق)</option>',i+='<option value="sugar_oil">موردو السكر والزيت (سابق)</option>',i+='<option value="flour">موردو الدقيق (سابق)</option>',i+="</optgroup>",i};if(e){const a=e.value;e.innerHTML=o(!0),a&&(e.value=a)}if(t){const a=t.value;t.innerHTML=o(!1),a&&(t.value=a)}}async function be(e,t){e.innerHTML=`
    <div class="filterbar">
      <div class="search-bar" style="max-width:240px;"><input type="text" id="sup-search" class="input" placeholder="🔍  بحث في الموردين…" /></div>
      <div class="filter-select-group" style="max-width:240px; min-width:180px;">
        <select id="sup-category-filter" class="input">
          <option value="">كل التصنيفات</option>
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
              <option value="other">موردون آخرون / عام</option>
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
      </div></div></div>`;const o=e.querySelector("#sup-search");o&&o.addEventListener("input",Y(()=>w(),350));const a=e.querySelector("#sup-category-filter");a&&a.addEventListener("change",()=>w()),await Promise.all([R(),w()])}async function w(){const e=document.getElementById("sup-tbody");if(!e)return;const t=document.getElementById("sup-search"),o=t?t.value.toLowerCase().trim():"";try{let a=await q(u.suppliers(),[te("name")]);b=a,oe(a,e,o)}catch(a){e.innerHTML=`<tr><td colspan="5"><div class="alert bad">${a.message}</div></td></tr>`}}function oe(e,t,o){let a=[...e];o&&(a=a.filter(n=>(n.name||"").toLowerCase().includes(o)||(n.phone||"").includes(o)||(n.code||"").toLowerCase().includes(o)||(n.vatNumber||"").includes(o)));const i=document.getElementById("sup-category-filter")?.value;i&&(a=a.filter(n=>n.category===i));const s=document.getElementById("sup-count");s&&(s.textContent=`${a.length} مورد`),t.innerHTML=a.length===0?'<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-2);">لا يوجد موردون</td></tr>':a.map(n=>{const d=I(n.category),m=B(n.category);return`<tr>
        <td>
          <div style="display:flex;align-items:center;gap:6px;">
            <div class="font-semibold font-heading" style="cursor:pointer; color:var(--brand);" onclick="viewSupplierIntelligence360('${n.id}')">${n.name}</div>
            ${n.category?`<span class="coa-badge" style="background:${m}1a;color:${m};border:1px solid ${m}33;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:bold;">${d}</span>`:""}
          </div>
          ${n.code?`<div style="font-size:11px;color:var(--text-2);">${n.code}</div>`:""}
        </td>
        <td class="mono dim">${n.phone||"—"}</td>
        <td class="mono" style="font-size:11.5px;">${n.iban?`<b>${n.bankName||"بنك"}:</b> ${n.iban.slice(0,10)}...`:"—"}</td>
        <td class="mono font-bold ${(n.balance||0)>0?"text-bad":(n.balance||0)<0?"text-good":""}">
          ${(n.balance||0)<0?`<span style="color:#059669; font-weight:800;" title="مدين لصالحنا">(${c(Math.abs(n.balance))}) مدين</span>`:c(n.balance||0)}
        </td>
        <td>
          <div class="row-actions" style="justify-content:center;">
            <button class="btn btn-icon sm btn-ghost" onclick="viewSupplierIntelligence360('${n.id}')" title="بطاقة المورد 360°">👁️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="editSupplier('${n.id}')" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="printSupplier('${n.id}')" title="طباعة">🖨️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="viewSupplierStatement('${n.id}')" title="كشف حساب">📊</button>
            <button class="btn btn-icon sm btn-ghost" onclick="delSupplier('${n.id}','${n.name.replace(/'/g,"\\'")}')" style="color:var(--bad);" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>`}).join("")}window.openSupplierModal=async(e=null)=>{await R(),document.getElementById("sup-edit-id").value=e?.id||"",document.getElementById("sup-modal-title").textContent=e?"تعديل المورد":"إضافة مورد",document.getElementById("sup-name").value=e?.name||"",document.getElementById("sup-code").value=e?.code||"",document.getElementById("sup-phone").value=e?.phone||"",document.getElementById("sup-vat").value=e?.vatNumber||e?.vat||"",document.getElementById("sup-national-id").value=e?.nationalId||"",document.getElementById("sup-address").value=e?.address||"";const t=document.getElementById("sup-category");if(t&&(t.value=e?.category||"other",e?.category&&t.value!==e.category)){const i=document.createElement("option");i.value=e.category,i.textContent=I(e.category)||e.category,t.appendChild(i),t.value=e.category}document.getElementById("sup-bank").value=e?.bankName||"",document.getElementById("sup-iban").value=e?.iban||"",document.getElementById("sup-maps-url").value=e?.googleMapsUrl||"",document.getElementById("sup-notes").value=e?.notes||"",document.getElementById("sup-error").classList.add("hidden");const o=document.getElementById("sup-coa-toggle-wrap"),a=document.getElementById("sup-coa-toggle");e?(o&&(o.style.display="none"),a&&(a.checked=!!e.accountId)):(o&&(o.style.display="flex"),a&&(a.checked=!0)),openModal("supplier-modal")};window.editSupplier=e=>{const t=b.find(o=>o.id===e);t?openSupplierModal(t):C(()=>import("./index-CF9GFeRJ.js").then(o=>o.T),__vite__mapDeps([0,1])).then(async({getById:o})=>{try{const a=await o("suppliers",e);a&&openSupplierModal(a)}catch(a){showToast(a.message,"error")}})};window.saveSupplier=async()=>{const e=document.getElementById("sup-error");e.classList.add("hidden");const t=document.getElementById("sup-edit-id").value,o=document.getElementById("sup-name").value.trim();if(!o){e.textContent="الاسم مطلوب",e.classList.remove("hidden");return}const a={name:o,code:document.getElementById("sup-code").value.trim(),phone:document.getElementById("sup-phone").value.trim(),vatNumber:document.getElementById("sup-vat").value.trim(),nationalId:document.getElementById("sup-national-id").value.trim(),address:document.getElementById("sup-address").value.trim(),category:document.getElementById("sup-category").value,categoryName:I(document.getElementById("sup-category").value),bankName:document.getElementById("sup-bank").value.trim(),iban:document.getElementById("sup-iban").value.trim(),googleMapsUrl:document.getElementById("sup-maps-url").value.trim(),notes:document.getElementById("sup-notes").value.trim()};t||(a.balance=0);const i=document.getElementById("save-sup-btn");i.disabled=!0;try{if(t){const s=b.find(n=>n.id===t);if(await z("suppliers",t,a),s){const n=s.name!==o;if(s.accountId)n&&(await N(s.accountId,o),K(t,o).catch(d=>console.warn("[Suppliers] syncSupplierNameEverywhere error:",d.message)));else{const d=await D("suppliers",t,o);d&&await z("suppliers",t,d)}ee(t).catch(()=>{})}showToast("تم تحديث بيانات المورد ✅")}else{const s=document.getElementById("sup-coa-toggle")?.checked??!0;let n={};if(s){const m="sup_"+Date.now(),$=await D("suppliers",m,o);$&&(n=$)}const d=await J("suppliers",{...a,...n});s&&n.accountId&&await N(n.accountId,o,d),showToast("تمت إضافة المورد بنجاح ✅")}closeModal("supplier-modal"),await w()}catch(s){e.textContent=s.message,e.classList.remove("hidden")}finally{i.disabled=!1}};window.delSupplier=async(e,t)=>{if(confirm(`هل أنت متأكد من حذف المورد "${t}"؟`))try{const o=b.find(a=>a.id===e);o?.accountId&&await X(o.accountId),await Q("suppliers",e),showToast("تم حذف المورد ✅"),await w()}catch(o){showToast("فشل الحذف: "+o.message,"error")}};window.viewSupplierStatement=e=>{window.navigate&&(window.navigate("supplier-statement"),setTimeout(()=>{typeof window.selectSupplierForStmt=="function"&&window.selectSupplierForStmt(e)},300))};window.viewSupplierIntelligence360=async e=>{const t=b.find(a=>a.id===e);if(!t)return;const o=document.createElement("div");o.className="modal-overlay active",o.id="sup-360-overlay",o.style.zIndex="1100",o.innerHTML=`
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
  `,document.body.appendChild(o);try{const{recalculateSupplierBalance:a}=await C(async()=>{const{recalculateSupplierBalance:l}=await import("./balance-sync-CUiyFg8g.js");return{recalculateSupplierBalance:l}},__vite__mapDeps([2,0,1])),i=await a(e).catch(()=>t.balance||0);t.balance=i;const[s,n,d,m,$,j]=await Promise.all([f(h(u.purchaseInvoices(),x("supplierId","==",e))).catch(()=>({docs:[]})),f(h(u.expenses(),x("targetId","==",e))).catch(()=>({docs:[]})),f(h(u.receipts(),x("targetId","==",e))).catch(()=>({docs:[]})),f(h(u.supplierContracts(),x("supplierId","==",e))).catch(()=>({docs:[]})),f(h(u.supplierClaims(),x("supplierId","==",e))).catch(()=>({docs:[]})),f(h(u.supplierEvaluations(),x("supplierId","==",e))).catch(()=>({docs:[]}))]),k=(s.docs||[]).map(l=>l.data()).filter(l=>l.status!=="cancelled"),M=(n.docs||[]).map(l=>l.data()).filter(l=>l.status!=="cancelled"),O=(d.docs||[]).map(l=>l.data()).filter(l=>l.status!=="cancelled"&&(!l.entityType||l.entityType==="supplier")),U=(m.docs||[]).map(l=>l.data()),W=($.docs||[]).map(l=>l.data()),_=(j.docs||[]).map(l=>l.data()),L=k.reduce((l,r)=>l+parseFloat(r.totalWithVat||r.total||0),0),P=M.reduce((l,r)=>l+parseFloat(r.amount||0),0),G=O.reduce((l,r)=>l+parseFloat(r.amount||0),0),S=typeof t.balance=="number"?t.balance:L+G-P,T=_.length?_[0]:null,E={};k.forEach(l=>{(l.lines||l.items||[]).forEach(r=>{const y=r.name||r.productName;y&&(E[y]||(E[y]={name:y,qty:0,totalVal:0,lastPrice:r.unitPrice||r.price||0}),E[y].qty+=parseFloat(r.qty||r.quantity||1),E[y].totalVal+=parseFloat(r.total||(r.qty||1)*(r.unitPrice||0)))})});const A=Object.values(E).sort((l,r)=>r.totalVal-l.totalVal).slice(0,5),F=document.getElementById("sup-360-body");if(!F)return;const v=S>0,g=S<0;F.innerHTML=`
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
            ${t.category?`<span class="badge" style="background:${B(t.category)}22; color:${B(t.category)}; font-weight:800; border:1px solid ${B(t.category)}44;">🏷️ ${I(t.category)}</span>`:""}
            ${T?`<span class="badge good" style="font-weight:800; font-size:11.5px;">🌟 الفئة: ${T.tier||"A"} (${T.overallScore||90}%)</span>`:""}
            <span class="badge" style="background:rgba(99,102,241,0.1); color:var(--brand); font-weight:800;">📜 العقود: ${U.length}</span>
            <span class="badge" style="background:rgba(239,68,68,0.1); color:#EF4444; font-weight:800;">🔍 المطالبات: ${W.length}</span>
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
            <div class="mono font-bold" style="font-size:18px; color:var(--brand); margin-top:4px;">${c(L)}</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:2px;">عدد الفواتير: ${k.length}</div>
          </div>
          <div class="card" style="padding:14px; background:var(--bg-card); border-radius:12px;">
            <div style="font-size:11px; color:#10B981; font-weight:700;">إجمالي السدادات المنفذة</div>
            <div class="mono font-bold" style="font-size:18px; color:#10B981; margin-top:4px;">${c(P)}</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:2px;">عدد السندات: ${M.length}</div>
          </div>
          <div class="card" style="padding:14px; background:${v?"rgba(239,68,68,0.05)":g?"rgba(16,185,129,0.05)":"var(--bg-card)"}; border:1.5px solid ${v?"#EF4444":g?"#10B981":"var(--border-soft)"}; border-radius:12px;">
            <div style="font-size:11px; color:${v?"#EF4444":g?"#10B981":"var(--text-3)"}; font-weight:700;">
              ${v?"الرصيد المستحق للمورد":g?"رصيد المورد (مدين لصالحنا)":"رصيد الحساب"}
            </div>
            <div class="mono font-bold" style="font-size:18px; color:${v?"#EF4444":g?"#10B981":"var(--text-0)"}; margin-top:4px;">
              ${g?`(${c(Math.abs(S))}) مدين`:c(S)}
            </div>
            <div style="font-size:11px; color:var(--text-2); margin-top:2px;">
              الحالة: ${v?"مستحق السداد للمورد":g?"دفعة مقدمة / قيد افتتاحي لصالحنا":"مطابق (0.00)"}
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
                ${A.map(l=>`
                  <tr>
                    <td class="font-bold">${l.name}</td>
                    <td class="mono" style="text-align:center;">${l.qty}</td>
                    <td class="mono font-bold" style="text-align:left;">${c(l.lastPrice)}</td>
                    <td class="mono font-bold text-brand" style="text-align:left;">${c(l.totalVal)}</td>
                  </tr>
                `).join("")}
                ${A.length?"":'<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-3);">لا توجد مشتريات بضائع مسجلة بعد</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `}catch(a){const i=document.getElementById("sup-360-body");i&&(i.innerHTML=`<div class="alert bad">${a.message}</div>`)}};function ne(e){return b.find(t=>t.id===e)||null}function le(e){return[{heading:"بيانات المورد",rows:[{label:"اسم المورد",value:e.name,bold:!0},{label:"كود المورد",value:e.code,mono:!0},{label:"تصنيف المورد",value:I(e.category)||"مورد عام"},{label:"رقم الهاتف",value:e.phone,mono:!0},{label:"الرقم الضريبي (VAT)",value:e.vatNumber,mono:!0},{label:"الهوية الوطنية / السجل التجاري",value:e.nationalId,mono:!0},{label:"البنك والآيبان",value:e.iban?`${e.bankName||"البنك"}: ${e.iban}`:"—",mono:!0},{label:"العنوان",value:e.address}]},{heading:"بيانات مالية وقانونية",rows:[{label:"الرصيد الحالي",value:c(e.balance||0),mono:!0,bold:!0},{label:"ملاحظات",value:e.notes}]}]}window.previewSupplier=e=>{window.viewSupplierIntelligence360(e)};window.printSupplier=e=>{const t=ne(e);t&&Z({title:t.name,icon:"🏭",sections:le(t)})};window.exportSupplierPDF=e=>{window.printSupplier(e)};window.syncAllSuppliersBalances=async()=>{try{const{recalculateSupplierBalance:e}=await C(async()=>{const{recalculateSupplierBalance:t}=await import("./balance-sync-CUiyFg8g.js");return{recalculateSupplierBalance:t}},__vite__mapDeps([2,0,1]));window.showToast&&window.showToast("جاري مزامنة وتحديث أرصدة الموردين مع القيود والفواتير...","info");for(const t of b)await e(t.id).catch(()=>{});await w(),window.showToast&&window.showToast("✅ تم تحديث ومزامنة كافة أرصدة الموردين بنجاح","success")}catch(e){console.error(e),window.showToast&&window.showToast("حدث خطأ أثناء مزامنة الأرصدة","error")}};export{I as getSupplierCategoryLabel,be as render};
