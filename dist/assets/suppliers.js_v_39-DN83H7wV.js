const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-HrCilPJ3.js","assets/index-BTgEPYae.css"])))=>i.map(i=>d[i]);
import{p as S,g,C as d,f as y,_ as B,u as c,n as f,r as k}from"./index-HrCilPJ3.js";import{u as $,s as v,d as T}from"./coa-connector-Bwq94sQ7.js";import{e as C,i as M}from"./excel-zCoXiaxq.js";import{s as L,p as D}from"./record-actions-BUPPxq1M.js";import{b as P,c as F}from"./sync-engine-CjRafMpJ.js";import{orderBy as x}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let i=[];async function U(e,t){e.innerHTML=`
    <div class="filterbar">
      <div class="search-bar" style="max-width:280px;"><input type="text" id="sup-search" class="input" placeholder="🔍  بحث في الموردين…" /></div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn-export" onclick="exportPagePDF('.data-dense','الموردين')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportSuppliersExcel()" title="تصدير Excel"><span>📊</span> تصدير Excel</button>
        <button class="btn-export" style="background:#10B981;color:#fff;" onclick="openSupplierImportModal()" title="استيراد من Excel"><span>📤</span> استيراد Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn btn-primary" onclick="openSupplierModal()">+ إضافة مورد</button>
      </div>
    </div>
    <div class="page-content">
      <div class="page-header"><h1 class="page-title">الموردون</h1><p class="page-subtitle" id="sup-count"></p></div>
      <div class="card">
        <div class="table-container">
          <table class="data-dense"><thead><tr><th>اسم المورد</th><th>الهاتف</th><th>رقم الضريبة</th><th>الرصيد</th><th></th></tr></thead>
          <tbody id="sup-tbody">${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(5).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}</tbody>
        </table></div></div>
    </div>
    <div class="modal-overlay" id="supplier-modal">
      <div class="modal modal-md"><div class="modal-header"><h3 class="modal-title" id="sup-modal-title">إضافة مورد</h3><button class="modal-close" onclick="closeModal('supplier-modal')">×</button></div>
      <div class="modal-body">
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
        <div class="form-group mb-16"><label>العنوان</label><input type="text" id="sup-address" class="input" placeholder="المدينة، الشارع، الرمز البريدي" /></div>
        <div class="form-group mb-16" id="sup-coa-toggle-wrap" style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="sup-coa-toggle" checked style="width:16px;height:16px;cursor:pointer;" />
          <label for="sup-coa-toggle" style="margin-bottom:0;cursor:pointer;font-weight:bold;">إنشاء حساب مستقل في شجرة الحسابات</label>
        </div>
        <div class="form-group"><label>ملاحظات</label><input type="text" id="sup-notes" class="input" placeholder="شروط الدفع أو أي تفاصيل أخرى..." /></div>
        <div id="sup-error" class="alert bad hidden" style="margin-top:8px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('supplier-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="saveSupplier()" id="save-sup-btn">حفظ</button>
      </div></div></div>`;const o=e.querySelector("#sup-search");o&&o.addEventListener("input",S(()=>p(),350)),await p()}async function p(){const e=document.getElementById("sup-tbody");if(!e)return;const t=document.getElementById("sup-search"),o=t?t.value.toLowerCase().trim():"";try{let a=await g(d.suppliers(),[x("name")]);i=a,A(a,o,e)}catch(a){e.innerHTML=`<tr><td colspan="5"><div class="alert bad">${a.message}</div></td></tr>`}}function A(e,t,o){let a=[...e];t&&(a=a.filter(n=>n.name?.toLowerCase().includes(t)));const r=document.getElementById("sup-count");r&&(r.textContent=`${a.length} مورد`),o.innerHTML=a.length===0?'<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-2);">لا يوجد موردون</td></tr>':a.map(n=>`<tr>
        <td><div class="font-semibold font-heading">${n.name}</div>${n.code?`<div style="font-size:11px;color:var(--text-2);">${n.code}</div>`:""}</td>
        <td class="mono dim">${n.phone||"—"}</td>
        <td class="mono dim">${n.vatNumber||"—"}</td>
        <td class="mono ${(n.balance||0)>0?"text-bad":""}">${y(n.balance||0)}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-icon sm btn-ghost" onclick="previewSupplier('${n.id}')" title="معاينة">👁️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="editSupplier('${n.id}')" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="printSupplier('${n.id}')" title="طباعة">🖨️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="exportSupplierPDF('${n.id}')" title="تصدير PDF">📄</button>
            <button class="btn btn-icon sm btn-ghost" onclick="viewSupplierStatement('${n.id}')" title="كشف حساب">📊</button>
            <button class="btn btn-icon sm btn-ghost" onclick="delSupplier('${n.id}','${n.name}')" style="color:var(--bad);" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>`).join("")}window.openSupplierModal=(e=null)=>{document.getElementById("sup-edit-id").value=e?.id||"",document.getElementById("sup-modal-title").textContent=e?"تعديل المورد":"إضافة مورد",document.getElementById("sup-name").value=e?.name||"",document.getElementById("sup-code").value=e?.code||"",document.getElementById("sup-phone").value=e?.phone||"",document.getElementById("sup-vat").value=e?.vatNumber||e?.vat||"",document.getElementById("sup-national-id").value=e?.nationalId||"",document.getElementById("sup-address").value=e?.address||"",document.getElementById("sup-notes").value=e?.notes||"",document.getElementById("sup-error").classList.add("hidden");const t=document.getElementById("sup-coa-toggle-wrap"),o=document.getElementById("sup-coa-toggle");e?(t&&(t.style.display="none"),o&&(o.checked=!!e.accountId)):(t&&(t.style.display="flex"),o&&(o.checked=!0)),openModal("supplier-modal")};window.editSupplier=e=>{const t=i.find(o=>o.id===e);t?openSupplierModal(t):B(()=>import("./index-HrCilPJ3.js").then(o=>o.N),__vite__mapDeps([0,1])).then(async({getById:o})=>{try{const a=await o("suppliers",e);a&&openSupplierModal(a)}catch(a){showToast(a.message,"error")}})};window.saveSupplier=async()=>{const e=document.getElementById("sup-error");e.classList.add("hidden");const t=document.getElementById("sup-edit-id").value,o=document.getElementById("sup-name").value.trim();if(!o){e.textContent="الاسم مطلوب",e.classList.remove("hidden");return}const a={name:o,code:document.getElementById("sup-code").value.trim(),phone:document.getElementById("sup-phone").value.trim(),vatNumber:document.getElementById("sup-vat").value.trim(),nationalId:document.getElementById("sup-national-id").value.trim(),address:document.getElementById("sup-address").value.trim(),notes:document.getElementById("sup-notes").value.trim()};t||(a.balance=0);const r=document.getElementById("save-sup-btn");r.disabled=!0;try{if(t){const n=i.find(s=>s.id===t);if(await c("suppliers",t,a),n){const s=n.name!==o;if(n.accountId)s&&(await $(n.accountId,o),P(t,o).catch(l=>console.warn("[Suppliers] syncSupplierNameEverywhere:",l.message)));else{const l=await v("suppliers",t,o);l&&await c("suppliers",t,l)}F(t).catch(()=>{})}showToast("تم تحديث المورد بنجاح","success")}else{const n=!document.getElementById("sup-coa-toggle").checked,s=await f(d.suppliers(),a);if(!n)try{const l=await v("suppliers",s,o);l&&await c("suppliers",s,l)}catch(l){console.error("Failed to sync supplier to COA:",l),showToast(`⚠️ تم حفظ المورد ولكن فشل تكامل شجرة الحسابات: ${l.message}`,"error")}showToast("تمت إضافة المورد بنجاح","success")}closeModal("supplier-modal"),await p()}catch(n){e.textContent=n.message,e.classList.remove("hidden")}finally{r.disabled=!1}};window.delSupplier=async(e,t)=>{if(await showConfirm(`هل تريد حذف المورد "${t}" نهائياً؟`,"تأكيد الحذف"))try{const o=i.find(a=>a.id===e);if(o&&o.accountId&&(await T("suppliers",e,o.accountId)).action==="archived"){showToast("⚠️ المورد لديه معاملات مالية سابقة. تم أرشفته وتجميد حسابه في شجرة الحسابات.","warning"),await p();return}await k("suppliers",e),showToast(`تم حذف "${t}" بنجاح`,"success"),i=i.filter(a=>a.id!==e),await p()}catch(o){console.error("Delete supplier error:",o),showToast("فشل الحذف: "+(o.code==="permission-denied"?"ليس لديك صلاحية الحذف":o.message),"error")}};window.viewSupplierStatement=e=>{window._preselectedStatementEntity={type:"supplier",id:e},navigate("report-customer-statement")};function w(e){return i.find(t=>t.id===e)||null}function I(e){return[{heading:"بيانات المورد",rows:[{label:"اسم المورد",value:e.name,bold:!0},{label:"كود المورد",value:e.code,mono:!0},{label:"رقم الهاتف",value:e.phone,mono:!0},{label:"الرقم الضريبي (VAT)",value:e.vatNumber,mono:!0},{label:"الهوية الوطنية / السجل التجاري",value:e.nationalId,mono:!0},{label:"العنوان",value:e.address}]},{heading:"بيانات مالية وقانونية",rows:[{label:"الرصيد الحالي",value:y(e.balance||0),mono:!0,bold:!0},{label:"ملاحظات",value:e.notes}]}]}window.previewSupplier=e=>{const t=w(e);if(!t){showToast("لم يتم إيجاد المورد","error");return}L({title:t.name,icon:"🏭",badgeText:(t.balance||0)>0?`مدين ${y(t.balance)}`:"مستوفى",badgeColor:(t.balance||0)>0?"bad":"good",sections:I(t),actions:[{icon:"✏️",label:"تعديل",fn:`document.getElementById('record-preview-overlay').remove();editSupplier('${e}')`,style:"background:var(--brand);color:#fff;"},{icon:"🖨️",label:"طباعة",fn:`printSupplier('${e}')`,style:"background:var(--bg-2);color:var(--text-1);"},{icon:"📄",label:"PDF",fn:`exportSupplierPDF('${e}')`,style:"background:#EF4444;color:#fff;"}]})};window.printSupplier=e=>{const t=w(e);t&&D({title:t.name,icon:"🏭",sections:I(t)})};window.exportSupplierPDF=e=>{window.printSupplier(e)};window.exportSuppliersExcel=async()=>{try{const e=i.length>0?i:await g(d.suppliers(),[x("name")]);showToast("جاري تجهيز ملف Excel…","info");const t=e.map(o=>[o.name||"",o.phone||"",o.vatNumber||"",o.address||"",o.balance||0,o.notes||""]);await C({title:"الموردون",headers:["اسم المورد*","رقم الهاتف","الرقم الضريبي","العنوان","الرصيد","ملاحظات"],rows:t,colWidths:[32,16,20,36,16,30]}),showToast(`تم تصدير ${t.length} مورد ✅`,"success")}catch(e){showToast("خطأ: "+e.message,"error")}};window.openSupplierImportModal=()=>{const e=document.createElement("div");e.className="modal-overlay active",e.id="sup-import-overlay",e.innerHTML=`
    <div class="modal" style="max-width:600px;width:95%;">
      <div class="modal-header">
        <h3 class="modal-title">📤 استيراد الموردين من Excel</h3>
        <button class="modal-close" onclick="document.getElementById('sup-import-overlay').remove()">×</button>
      </div>
      <div class="modal-body">
        <div style="background:var(--bg-2);border-radius:10px;padding:14px;margin-bottom:14px;font-size:12px;color:var(--text-2);">الأعمدة: <strong>اسم المورد(*)</strong>, رقم الهاتف, الرقم الضريبي, العنوان, ملاحظات</div>
        <div id="sup-dz" style="border:2px dashed var(--border-soft);border-radius:12px;padding:36px;text-align:center;cursor:pointer;"
          onclick="document.getElementById('sup-fi').click()"
          ondragover="event.preventDefault();this.style.borderColor='var(--brand)';"
          ondragleave="this.style.borderColor='var(--border-soft)';"
          ondrop="event.preventDefault();this.style.borderColor='var(--border-soft)';handleSupImport(event.dataTransfer.files[0]);">
          <div style="font-size:36px;">📊</div><div style="font-weight:600;">اسحب ملف Excel أو انقر للاختيار</div>
          <input type="file" id="sup-fi" accept=".xlsx,.xls,.csv" style="display:none" onchange="handleSupImport(this.files[0])">
        </div>
        <div id="sup-import-status" style="margin-top:12px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="document.getElementById('sup-import-overlay').remove()">إلغاء</button>
        <button class="btn btn-primary" id="sup-import-btn" style="display:none;" onclick="executeSupImport()">✅ استيراد</button>
      </div>
    </div>`,document.body.appendChild(e)};let E=[];window.handleSupImport=async e=>{if(e)try{const{rows:t}=await M(e);E=t,document.getElementById("sup-import-status").innerHTML=`<div class="alert good">✅ تم قراءة <strong>${t.length}</strong> مورد. اضغط استيراد للحفظ.</div>`,document.getElementById("sup-import-btn").style.display=""}catch(t){showToast(t.message,"error")}};window.executeSupImport=async()=>{const e=document.getElementById("sup-import-btn");e.disabled=!0,e.textContent="⏳ جاري...";let t=0,o=0,a=0;const r=await g(d.suppliers(),[]),n={};r.forEach(s=>{n[s.name?.trim()?.toLowerCase()]=s.id});for(const s of E){const l=String(s["اسم المورد*"]||s.اسم||Object.values(s)[0]||"").trim();if(!l){a++;continue}const u={name:l,phone:String(s["رقم الهاتف"]||"").trim()||null,vatNumber:String(s["الرقم الضريبي"]||"").trim()||null,address:String(s.العنوان||"").trim()||null,notes:String(s.ملاحظات||"").trim()||null,updatedAt:new Date().toISOString()};try{const b=n[l.toLowerCase()];if(b)await c(d.suppliers(),b,u),o++;else{u.createdAt=new Date().toISOString(),u.balance=0;const h=await f(d.suppliers(),u);v("suppliers",h,l).then(m=>{m&&c(d.suppliers(),h,m)}).catch(m=>console.warn(`[Import] COA sync failed for ${l}:`,m.message)),t++}}catch{a++}}document.getElementById("sup-import-overlay").remove(),showToast(`✅ مضاف: ${t} | محدث: ${o} | فاشل: ${a}`,"success"),i=[],await p()};export{U as render};
