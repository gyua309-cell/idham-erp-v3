const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-HrCilPJ3.js","assets/index-BTgEPYae.css"])))=>i.map(i=>d[i]);
import{p as M,y as h,f as y,g as b,C as m,_ as S,u as v,n as E,r as z}from"./index-HrCilPJ3.js";import{u as F,s as w,d as X,m as A}from"./coa-connector-Bwq94sQ7.js";import{e as D,d as P,i as H}from"./excel-zCoXiaxq.js";import{s as N,p as _}from"./record-actions-BUPPxq1M.js";import{s as j,a as R}from"./sync-engine-CjRafMpJ.js";import{orderBy as x,limit as O,where as V}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let r=[];function $(t){return t.map(o=>{const e=h(o.balance||0,o.creditLimit||0);return`<tr>
      <td><div class="font-semibold font-heading">${o.name}</div><div style="font-size:11px;color:var(--text-2);">${o.code||""}</div></td>
      <td class="mono dim">${o.phone||"—"}</td>
      <td class="dim">${o.zone||"—"}</td>
      <td class="dim">${o.repName||"—"}</td>
      <td class="mono ${o.balance>0?"text-bad":"text-good"}">${y(o.balance||0)}</td>
      <td class="mono">${y(o.creditLimit||0)}</td>
      <td style="min-width:120px;">
        ${o.creditLimit>0?`
        <div class="credit-meter">
          <div class="meter-label">
            <span style="font-size:10px;" class="text-${e.color}">${e.label}</span>
            <span style="font-size:10px;" class="mono">${e.pct.toFixed(0)}%</span>
          </div>
          <div class="progress-bar">
            <div class="fill ${e.color}" style="width:${e.pct}%;"></div>
          </div>
        </div>`:'<span class="text-2" style="font-size:11px;">بلا حد</span>'}
      </td>
      <td><span class="badge neutral" style="font-size:10px;">${o.priceList==="wholesale"?"الجملة":o.priceList==="retail"?"التجزئة":"الأساسي"}</span></td>
      <td>
        <div class="row-actions">
          <button class="btn btn-icon sm btn-ghost" onclick="previewCustomer('${o.id}')" title="معاينة">👁️</button>
          <button class="btn btn-icon sm btn-ghost" onclick="editCustomer('${o.id}')" title="تعديل">✏️</button>
          <button class="btn btn-icon sm btn-ghost" onclick="printCustomer('${o.id}')" title="طباعة">🖨️</button>
          <button class="btn btn-icon sm btn-ghost" onclick="exportCustomerPDF('${o.id}')" title="PDF">📄</button>
          <button class="btn btn-icon sm btn-ghost" onclick="viewCustomerStatement('${o.id}','${o.name}')" title="كشف حساب">📊</button>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteCustomer('${o.id}','${o.name}')" title="حذف">🗑️</button>
        </div>
      </td>
    </tr>`}).join("")}async function nt(t,o){const e=r&&r.length>0;t.innerHTML=`
    <div class="filterbar">
      <div class="search-bar" style="max-width:280px;">
        <input type="text" id="cust-search" class="input" placeholder="🔍  بحث في العملاء…" />
      </div>
      <div class="filter-select-group">
        <label>المنطقة</label>
        <select id="cust-zone-filter" onchange="loadCustomers(true)">
          <option value="">الكل</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>المندوب</label>
        <select id="cust-rep-filter" onchange="loadCustomers(true)">
          <option value="">الكل</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>الائتمان</label>
        <select id="cust-credit-filter" onchange="loadCustomers(true)">
          <option value="">الكل</option>
          <option value="ok">طبيعي</option>
          <option value="warn">قارب الحد</option>
          <option value="bad">تجاوز</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn-export" onclick="exportPagePDF('.data-dense','العملاء')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportCustomersExcel()" title="تصدير Excel بجميع البيانات"><span>📊</span> تصدير Excel</button>
        <button class="btn-export" style="background:#10B981;color:#fff;" onclick="openCustomerImportModal()" title="استيراد من Excel"><span>📤</span> استيراد Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn-export" style="background:#7C3AED;color:#fff;" onclick="runCustomerCoaMigration()" title="ربط العملاء بشجرة الحسابات حسب مندوبيهم (مرة واحدة فقط)" id="btn-migrate-coa"><span>🔗</span> ترحيل ذمم العملاء</button>
        <button class="btn btn-primary" onclick="openCustomerModal()">+ إضافة عميل</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">العملاء</h1>
          <p class="page-subtitle" id="cust-count">${e?`${r.length} عميل`:""}</p>
        </div>
        <div style="margin-right:auto;display:flex;gap:8px;align-items:center;">
          <button class="btn btn-secondary btn-icon sm" id="cust-refresh-btn" onclick="refreshCustomers()" title="تحديث البيانات" style="font-size:13px;padding:6px 12px;">\0 تحديث</button>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead><tr>
              <th>اسم العميل</th><th>الهاتف</th><th>المنطقة</th>
              <th>المندوب</th><th>الرصيد الحالي</th><th>حد الائتمان</th>
              <th>استخدام الائتمان</th><th>قائمة الأسعار</th><th></th>
            </tr></thead>
            <tbody id="cust-tbody">
              ${e?$(r):`
                <tr class="skeleton-row">
                  ${Array(9).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
                <tr class="skeleton-row">
                  ${Array(9).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
                <tr class="skeleton-row">
                  ${Array(9).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Customer Modal -->
    <div class="modal-overlay" id="customer-modal">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 class="modal-title" id="cust-modal-title">إضافة عميل جديد</h3>
          <button class="modal-close" onclick="closeModal('customer-modal')">×</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="cust-edit-id" />
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group" style="grid-column:span 2;">
              <label>اسم العميل *</label>
              <input type="text" id="cust-name" class="input" />
            </div>
            <div class="form-group">
              <label>كود العميل</label>
              <input type="text" id="cust-code" class="input mono" placeholder="CUST-001" />
            </div>
          </div>
          <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:16px;">
            <div class="form-group">
              <label>الهاتف</label>
              <input type="tel" id="cust-phone" class="input mono" placeholder="05XXXXXXXX" />
            </div>
            <div class="form-group">
              <label>الرقم الضريبي (VAT)</label>
              <input type="text" id="cust-vat" class="input mono" placeholder="300000000000003" />
            </div>
            <div class="form-group">
              <label>الهوية الوطنية / السجل</label>
              <input type="text" id="cust-national-id" class="input mono" placeholder="1XXXXXXXXX" />
            </div>
            <div class="form-group">
              <label>المنطقة/المسار</label>
              <input type="text" id="cust-zone" class="input" placeholder="الرياض — شمال" />
            </div>
          </div>
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group">
              <label>حد الائتمان (ر.س)</label>
              <input type="number" id="cust-credit-limit" class="input mono" step="100" min="0" placeholder="0" />
            </div>
            <div class="form-group">
              <label>أيام الائتمان (مهلة السداد)</label>
              <input type="number" id="cust-credit-days" class="input mono" min="0" placeholder="30" />
            </div>
            <div class="form-group">
              <label>المندوب المسؤول</label>
              <select id="cust-rep">
                <option value="">اختر المندوب</option>
              </select>
            </div>
          </div>
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group">
              <label>قائمة الأسعار</label>
              <select id="cust-price-list">
                <option value="default">السعر الأساسي</option>
                <option value="wholesale">الجملة</option>
                <option value="retail">التجزئة</option>
              </select>
            </div>
            <div class="form-group" style="grid-column:span 2;">
              <label>العنوان</label>
              <input type="text" id="cust-address" class="input" />
            </div>
          </div>
          <div class="form-group mb-16" id="cust-coa-toggle-wrap" style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="cust-coa-toggle" checked style="width:16px;height:16px;cursor:pointer;" />
            <label for="cust-coa-toggle" style="margin-bottom:0;cursor:pointer;font-weight:bold;">إنشاء حساب مستقل في شجرة الحسابات</label>
          </div>
          <div class="form-group">
            <label>ملاحظات</label>
            <textarea id="cust-notes" class="input" rows="2"></textarea>
          </div>
          <div id="cust-form-error" class="alert bad hidden" style="margin-top:8px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('customer-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveCustomer()" id="save-cust-btn">حفظ</button>
        </div>
      </div>
    </div>`;const s=t.querySelector("#cust-search");s&&s.addEventListener("input",M(()=>c(!0),350)),await Promise.all([W(),c()])}async function W(){try{const t=await b(m.salesReps(),[x("name")]),o=document.getElementById("cust-rep-filter"),e=document.getElementById("cust-rep");t.forEach(s=>{o&&(o.innerHTML+=`<option value="${s.id}">${s.name}</option>`),e&&(e.innerHTML+=`<option value="${s.id}">${s.name}</option>`)})}catch{}}async function c(t=!1){const o=document.getElementById("cust-tbody");if(o){r.length===0&&(o.innerHTML=`${Array(5).fill(0).map(()=>`
                  <tr class="skeleton-row">
                    ${Array(9).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                  </tr>
                `).join("")}`);try{const e=[x("name"),O(200)],s=document.getElementById("cust-rep-filter")?.value;s&&e.unshift(V("repId","==",s));const l=await b(m.customers(),e);r=l,q(l,o)}catch(e){o.innerHTML=`<tr><td colspan="9"><div class="alert bad" style="margin:8px;">${e.message}</div></td></tr>`}}}window.refreshCustomers=async()=>{const t=document.getElementById("cust-refresh-btn");if(t&&(t.disabled=!0,t.textContent="⏳ جاري…"),r=[],window.ERP_CACHE)for(const o of Object.keys(window.ERP_CACHE))o.includes("customers")&&delete window.ERP_CACHE[o];await c(),t&&(t.disabled=!1,t.textContent="\0 تحديث")};function q(t,o){let e=[...t];const s=document.getElementById("cust-search")?.value?.toLowerCase().trim();s&&(e=e.filter(a=>a.name?.toLowerCase().includes(s)||a.phone?.includes(s)));const l=document.getElementById("cust-zone-filter")?.value;l&&(e=e.filter(a=>a.zone===l));const d=document.getElementById("cust-credit-filter")?.value;d&&(e=e.filter(a=>h(a.balance||0,a.creditLimit||0).color===d));const i=document.getElementById("cust-count");if(i&&(i.textContent=`${e.length} عميل`),e.length===0){o.innerHTML='<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد نتائج</td></tr>';return}o.innerHTML=$(e)}window.openCustomerModal=(t=null)=>{document.getElementById("cust-edit-id").value=t?.id||"",document.getElementById("cust-modal-title").textContent=t?"تعديل العميل":"إضافة عميل جديد",document.getElementById("cust-name").value=t?.name||"",document.getElementById("cust-code").value=t?.code||"",document.getElementById("cust-phone").value=t?.phone||"",document.getElementById("cust-vat").value=t?.vatNumber||t?.vat||"",document.getElementById("cust-national-id").value=t?.nationalId||"",document.getElementById("cust-zone").value=t?.zone||"",document.getElementById("cust-address").value=t?.address||"",document.getElementById("cust-notes").value=t?.notes||"",document.getElementById("cust-credit-limit").value=t?.creditLimit||"",document.getElementById("cust-credit-days").value=t?.creditDays||"",document.getElementById("cust-rep").value=t?.repId||"",document.getElementById("cust-price-list").value=t?.priceList||"default",document.getElementById("cust-form-error").classList.add("hidden");const o=document.getElementById("cust-coa-toggle-wrap"),e=document.getElementById("cust-coa-toggle");t?(o&&(o.style.display="none"),e&&(e.checked=!!t.accountId)):(o&&(o.style.display="flex"),e&&(e.checked=!0)),openModal("customer-modal")};window.editCustomer=t=>{const o=r.find(e=>e.id===t);o?openCustomerModal(o):S(()=>import("./index-HrCilPJ3.js").then(e=>e.N),__vite__mapDeps([0,1])).then(async({getById:e})=>{try{const s=await e("customers",t);s&&openCustomerModal(s)}catch(s){showToast(s.message,"error")}})};window.saveCustomer=async()=>{const t=document.getElementById("cust-form-error");t.classList.add("hidden");const o=document.getElementById("cust-edit-id").value,e=document.getElementById("cust-name").value.trim();if(!e){t.textContent="اسم العميل مطلوب",t.classList.remove("hidden");return}const s=document.getElementById("cust-rep"),l={name:e,code:document.getElementById("cust-code").value.trim(),phone:document.getElementById("cust-phone").value.trim(),vatNumber:document.getElementById("cust-vat").value.trim(),nationalId:document.getElementById("cust-national-id").value.trim(),zone:document.getElementById("cust-zone").value.trim(),creditLimit:parseFloat(document.getElementById("cust-credit-limit").value)||0,creditDays:parseInt(document.getElementById("cust-credit-days").value)||0,repId:s.value,repName:s.options[s.selectedIndex]?.text||"",priceList:document.getElementById("cust-price-list").value,address:document.getElementById("cust-address").value.trim(),notes:document.getElementById("cust-notes").value.trim()};o||(l.balance=0);const d=document.getElementById("save-cust-btn");d.disabled=!0;try{if(o){const i=r.find(a=>a.id===o);if(await v("customers",o,l),i){const a=i.name!==e;if(i.accountId)a&&(await F(i.accountId,e),j(o,e).catch(n=>console.warn("[Customers] syncCustomerNameEverywhere error:",n.message)));else{const n=await w("customers",o,e);n&&await v("customers",o,n)}R(o).catch(()=>{})}showToast("تم تحديث العميل بنجاح","success")}else{const i=!document.getElementById("cust-coa-toggle").checked,a=await E(m.customers(),l);if(!i)try{const n=await w("customers",a,e,{repId:l.repId||null});n&&await v("customers",a,n)}catch(n){console.error("Failed to sync customer to COA:",n),showToast(`⚠️ تم حفظ العميل ولكن فشل تكامل شجرة الحسابات: ${n.message}`,"error")}showToast("تمت إضافة العميل بنجاح","success")}closeModal("customer-modal"),await c()}catch(i){t.textContent=i.message,t.classList.remove("hidden")}finally{d.disabled=!1}};window.deleteCustomer=async(t,o)=>{if(await showConfirm(`هل تريد حذف العميل "${o}" نهائياً؟`,"تأكيد الحذف"))try{const e=r.find(s=>s.id===t);if(e&&e.accountId&&(await X("customers",t,e.accountId)).action==="archived"){showToast("⚠️ العميل لديه معاملات مالية سابقة. تم أرشفته وتجميد حسابه في شجرة الحسابات.","warning"),await c();return}await z("customers",t),showToast("تم حذف العميل بنجاح","success"),await c()}catch(e){showToast(e.message,"error")}};window.viewCustomerStatement=(t,o)=>{window._preselectedStatementEntity={type:"customer",id:t},navigate("report-customer-statement")};window.exportCustomers=async()=>{window.exportCustomersExcel()};window.exportCustomersExcel=async()=>{try{const t=r.length>0?r:await b(m.customers(),[x("name")]);showToast("جاري تجهيز ملف Excel…","info");const o=t.map(e=>[e.name||"",e.code||"",e.phone||"",e.email||"",e.zone||"",e.repName||"",e.priceList||"",e.balance||0,e.creditLimit||0,e.paymentTerms||"",e.vatNumber||"",e.notes||""]);await D({title:"العملاء",headers:["اسم العميل*","كود العميل","رقم الهاتف","البريد الإلكتروني","المنطقة","المندوب","قائمة الأسعار","الرصيد الحالي","حد الائتمان","شروط الدفع","الرقم الضريبي","ملاحظات"],rows:o,colWidths:[28,14,14,26,14,18,14,14,14,14,18,26]}),showToast(`تم تصدير ${o.length} عميل ✅`,"success")}catch(t){showToast("خطأ: "+t.message,"error")}};window.openCustomerImportModal=()=>{const t=document.createElement("div");t.className="modal-overlay active",t.id="cust-import-overlay",t.innerHTML=`
    <div class="modal" style="max-width:680px;width:95%;">
      <div class="modal-header">
        <h3 class="modal-title">📤 استيراد العملاء من Excel</h3>
        <button class="modal-close" onclick="document.getElementById('cust-import-overlay').remove()">×</button>
      </div>
      <div class="modal-body">
        <div style="background:var(--bg-2);border-radius:10px;padding:16px;margin-bottom:16px;font-size:12px;color:var(--text-2);line-height:1.8;">
          <strong style="color:var(--text-1);">الأعمدة المطلوبة:</strong> اسم العميل(*), كود العميل, رقم الهاتف, البريد الإلكتروني, المنطقة, المندوب, قائمة الأسعار, حد الائتمان, شروط الدفع, الرقم الضريبي, ملاحظات
        </div>
        <div id="cust-drop-zone" style="border:2px dashed var(--border-soft);border-radius:12px;padding:36px;text-align:center;cursor:pointer;"
          onclick="document.getElementById('cust-file-inp').click()"
          ondragover="event.preventDefault();this.style.borderColor='var(--brand)';"
          ondragleave="this.style.borderColor='var(--border-soft)';"
          ondrop="event.preventDefault();this.style.borderColor='var(--border-soft)';handleCustomerImport(event.dataTransfer.files[0]);">
          <div style="font-size:40px;margin-bottom:8px;">📊</div>
          <div style="font-weight:600;">اسحب ملف Excel أو انقر للاختيار</div>
          <input type="file" id="cust-file-inp" accept=".xlsx,.xls,.csv" style="display:none" onchange="handleCustomerImport(this.files[0])">
        </div>
        <div id="cust-import-status" style="margin-top:12px;"></div>
        <div id="cust-import-preview" style="max-height:200px;overflow:auto;margin-top:8px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="document.getElementById('cust-import-overlay').remove()">إلغاء</button>
        <button class="btn" style="background:var(--bg-2);" onclick="downloadCustomerTemplate()">📥 نموذج</button>
        <button class="btn btn-primary" id="cust-import-btn" style="display:none;" onclick="executeCustImport()">✅ استيراد</button>
      </div>
    </div>`,document.body.appendChild(t)};let B=[],U=[];window.downloadCustomerTemplate=async()=>{await P({title:"العملاء",headers:["اسم العميل*","كود العميل","رقم الهاتف","البريد الإلكتروني","المنطقة","اسم المندوب","قائمة الأسعار","حد الائتمان","شروط الدفع","الرقم الضريبي","ملاحظات"],sampleRows:[["شركة المستقبل","C001","0501234567","info@co.sa","الرياض","أحمد","retail",5e4,"net30","300xxxxxxxxxx","عميل مميز"]],colWidths:[28,14,14,26,14,18,14,14,14,18,26]}),showToast("تم تنزيل النموذج ✅","success")};window.handleCustomerImport=async t=>{if(t)try{const{headers:o,rows:e}=await H(t);B=e,U=o,document.getElementById("cust-import-status").innerHTML=`<div class="alert good">✅ تم قراءة <strong>${e.length}</strong> عميل. اضغط استيراد لتأكيد الحفظ.</div>`;const s=e.slice(0,5).map(l=>`<tr>${Object.values(l).slice(0,5).map(d=>`<td>${d}</td>`).join("")}</tr>`).join("");document.getElementById("cust-import-preview").innerHTML=`<table class="data-dense" style="font-size:11px;"><tbody>${s}</tbody></table>`,document.getElementById("cust-import-btn").style.display=""}catch(o){showToast(o.message,"error")}};window.executeCustImport=async()=>{const t=document.getElementById("cust-import-btn");t.disabled=!0,t.textContent="⏳ جاري...";let o=0,e=0,s=0;const[l,d]=await Promise.all([b(m.customers(),[]),b(m.salesReps(),[])]),i={};l.forEach(n=>{i[n.name?.trim()?.toLowerCase()]=n.id});const a={};d.forEach(n=>{a[n.name?.trim()?.toLowerCase()]=n.id});for(const n of B){const u=String(n["اسم العميل*"]||n.اسم||Object.values(n)[0]||"").trim();if(!u){s++;continue}const C=String(n["اسم المندوب"]||"").trim(),T=a[C.toLowerCase()]||null,p={name:u,code:String(n["كود العميل"]||"").trim()||null,phone:String(n["رقم الهاتف"]||"").trim()||null,email:String(n["البريد الإلكتروني"]||"").trim()||null,zone:String(n.المنطقة||"").trim()||null,repName:C||null,repId:T,priceList:String(n["قائمة الأسعار"]||"retail").trim(),creditLimit:parseFloat(n["حد الائتمان"]||0)||0,paymentTerms:String(n["شروط الدفع"]||"net30").trim(),vatNumber:String(n["الرقم الضريبي"]||"").trim()||null,notes:String(n.ملاحظات||"").trim()||null,updatedAt:new Date().toISOString()};try{const f=i[u.toLowerCase()];if(f)await v("customers",f,p),e++;else{p.createdAt=new Date().toISOString(),p.balance=0;const I=await E(m.customers(),p);w("customers",I,u,{repId:p.repId||null}).then(g=>{g&&v("customers",I,g)}).catch(g=>console.warn(`[Import] COA sync failed for ${u}:`,g.message)),o++}}catch{s++}}document.getElementById("cust-import-overlay").remove(),showToast(`✅ مضاف: ${o} | محدث: ${e} | فاشل: ${s}`,"success"),r=[],await c(!0)};function k(t){return r.find(o=>o.id===t)||null}function L(t){const o=h(t.balance||0,t.creditLimit||0);return[{heading:"بيانات العميل",rows:[{label:"اسم العميل",value:t.name,bold:!0},{label:"كود العميل",value:t.code,mono:!0},{label:"رقم الهاتف",value:t.phone,mono:!0},{label:"البريد الإلكتروني",value:t.email},{label:"المنطقة",value:t.zone},{label:"المندوب",value:t.repName},{label:"قائمة الأسعار",value:t.priceList==="wholesale"?"الجملة":t.priceList==="retail"?"التجزئة":"الأساسي"}]},{heading:"بيانات مالية وقانونية",rows:[{label:"الرصيد الحالي",value:y(t.balance||0),mono:!0,bold:!0},{label:"حد الائتمان",value:y(t.creditLimit||0),mono:!0},{label:"نسبة استهلاك الحد",value:t.creditLimit>0?`${o.pct.toFixed(1)}%`:"بلا حد"},{label:"شروط الدفع",value:t.paymentTerms},{label:"الرقم الضريبي",value:t.vatNumber,mono:!0},{label:"الهوية الوطنية / السجل التجاري",value:t.nationalId,mono:!0},{label:"ملاحظات",value:t.notes}]}]}window.previewCustomer=t=>{const o=k(t);if(!o){showToast("لم يتم إيجاد العميل","error");return}const e=h(o.balance||0,o.creditLimit||0);N({title:o.name,icon:"👤",badgeText:e.label,badgeColor:e.color==="good"?"good":e.color==="warn"?"warn":"bad",sections:L(o),actions:[{icon:"✏️",label:"تعديل",fn:`document.getElementById('record-preview-overlay').remove();editCustomer('${t}')`,style:"background:var(--brand);color:#fff;"},{icon:"🖨️",label:"طباعة",fn:`printCustomer('${t}')`,style:"background:var(--bg-2);color:var(--text-1);"},{icon:"📄",label:"PDF",fn:`exportCustomerPDF('${t}')`,style:"background:#EF4444;color:#fff;"},{icon:"📊",label:"كشف حساب",fn:`viewCustomerStatement('${t}','${o.name.replace(/'/g,"\\'")}')`,style:"background:#10B981;color:#fff;"}]})};window.printCustomer=t=>{const o=k(t);o&&_({title:o.name,icon:"👤",sections:L(o)})};window.exportCustomerPDF=t=>{window.printCustomer(t)};window.runCustomerCoaMigration=async()=>{const t=document.getElementById("btn-migrate-coa");if(window.confirm(`⚠️ هذه العملية ستُنشئ حسابات تفصيلية في شجرة الحسابات لكل عميل تحت مندوبه.

• العملاء التابعون لمندوب → تحت حساب المندوب (1-1-2-1-2-X)
• العملاء التجاريون المباشرون → تحت (1-1-2-1-1)

العملاء المرتبطون مسبقاً سيُتخطّوا تلقائياً.

هل تريد المتابعة؟`)){t&&(t.disabled=!0,t.textContent="⏳ جاري الترحيل...");try{const e=await A(),s=[`✅ تم ترحيل: ${e.migrated.length} عميل`,`⏭️ تم تخطّي: ${e.skipped.length} عميل (مرتبط مسبقاً)`,e.errors.length>0?`❌ أخطاء: ${e.errors.join(", ")}`:""].filter(Boolean).join(`
`);e.migrated.length>0&&console.table(e.migrated),window.alert(s),await c()}catch(e){window.alert("❌ خطأ أثناء الترحيل: "+e.message),console.error("Customer COA Migration Error:",e)}finally{t&&(t.disabled=!1,t.innerHTML="<span>🔗</span> ترحيل ذمم العملاء")}}};export{nt as render};
