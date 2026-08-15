const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-HrCilPJ3.js","assets/index-BTgEPYae.css"])))=>i.map(i=>d[i]);
import{g as m,C as p,z as _,w as k,f as c,_ as v,u as z,n as C,r as L}from"./index-HrCilPJ3.js";import{s as P,p as M}from"./record-actions-BUPPxq1M.js";import{e as F}from"./excel-zCoXiaxq.js";import{a as S}from"./coa-connector-Bwq94sQ7.js";import{orderBy as w}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function J(e,o){e.innerHTML=`
    <div class="filterbar">
      <div class="search-bar" style="max-width:260px;">
        <input type="text" id="rep-search" class="input" placeholder="🔍  بحث في المناديب…" />
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn-export" onclick="exportPagePDF('#reps-grid','المناديب')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportRepsExcel()" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn btn-primary" onclick="openRepModal()">+ إضافة مندوب</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">المناديب الميدانيون</h1>
      </div>
      <div id="reps-grid" class="grid-3" style="gap:16px;margin-bottom:24px;">
        <div class="page-loading"><div class="loading-spinner"></div></div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" id="rep-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="rep-modal-title">إضافة مندوب جديد</h3>
          <button class="modal-close" onclick="closeModal('rep-modal')">×</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="rep-edit-id" />
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>اسم المندوب *</label>
              <input type="text" id="rep-name" class="input" />
            </div>
            <div class="form-group">
              <label>الهاتف</label>
              <input type="tel" id="rep-phone" class="input mono" />
            </div>
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>المنطقة/المسار</label>
              <input type="text" id="rep-zone" class="input" />
            </div>
            <div class="form-group">
              <label>الهدف الشهري (ر.س)</label>
              <input type="number" id="rep-target" class="input mono" step="100" min="0" />
            </div>
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>الراتب الأساسي (ر.س)</label>
              <input type="number" id="rep-salary" class="input mono" step="100" />
            </div>
            <div class="form-group">
              <label>نسبة العمولة (%)</label>
              <input type="number" id="rep-commission" class="input mono" step="0.1" min="0" max="100" />
            </div>
          </div>
          <div class="grid-2 gap-16 mb-16" style="border-top:1px solid var(--border);padding-top:12px;">
            <div class="form-group">
              <label>🔑 رقم PIN (تطبيق الجوال)</label>
              <input type="password" id="rep-pin" class="input mono" maxlength="6" placeholder="4-6 أرقام" />
            </div>
            <div class="form-group">
              <label>🚗 مخزن السيارة (المستودع)</label>
              <select id="rep-warehouse" class="input"><option value="">-- اختر مستودع --</option></select>
            </div>
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>👤 الموظف المرتبط (الموارد البشرية)</label>
              <select id="rep-employee" class="input"><option value="">-- اختر موظف --</option></select>
            </div>
            <div class="form-group"></div>
          </div>
          <div id="rep-form-error" class="alert bad hidden" style="margin-top:8px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('rep-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveRep()" id="save-rep-btn">حفظ</button>
        </div>
      </div>
    </div>`,await x()}async function x(){const e=document.getElementById("reps-grid");if(e)try{const[o,n,l,i]=await Promise.all([m(p.salesReps(),[w("name")]),m(p.customers()),m(p.salesInvoices()),m(p.receipts())]);if(I=o,o.length===0){e.innerHTML='<div class="empty-state" style="grid-column:span 3;"><div class="empty-icon">🚚</div><h3>لا يوجد مناديب</h3><p>اضغط على "إضافة مندوب" للبدء</p></div>';return}const d=l.filter(t=>t.status!=="cancelled");e.innerHTML=o.map(t=>{const a=n.filter(s=>s.repId===t.id||s.assignedRepId===t.id),r=new Set(a.map(s=>s.id)),D=new Set(a.map(s=>s.name));let u=0;d.forEach(s=>{(s.repId===t.id||r.has(s.customerId))&&(u+=parseFloat(s.totalWithVat||s.total||0))});let b=0;i.forEach(s=>{(s.repId===t.id||r.has(s.customerId)||r.has(s.targetId))&&(b+=parseFloat(s.amount||0))});const $=a.reduce((s,T)=>s+parseFloat(T.balance||0),0),g=t.monthlyTarget||0,f=u<g?1:parseFloat(t.commissionRate||2.5),B=b*f/100,y=g>0?Math.min(u/g*100,150):0,h=_(y);return`
        <div class="card" style="padding:0;overflow:hidden;border-radius:14px;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          <div style="height:4px;background:var(--${h});"></div>
          <div style="padding:20px;">
            <div class="flex items-center gap-12 mb-16">
              <div class="user-avatar" style="width:46px;height:46px;font-size:18px;background:var(--brand-glow);color:var(--brand);font-weight:bold;">${t.name[0]}</div>
              <div>
                <div class="font-heading font-bold" style="font-size:16px;color:var(--text-0);">${t.name}</div>
                <div class="text-2" style="font-size:12px;">📍 ${t.zone||"ينبع والمسارات الميدانية"}</div>
              </div>
              <div style="margin-right:auto;">
                <div class="row-actions" style="opacity:1;">
                  <button class="btn btn-icon sm btn-ghost" onclick="viewRepStatement('${t.id}')" title="كشف الحساب والتحصيلات">📑</button>
                  <button class="btn btn-icon sm btn-ghost" onclick="previewRep('${t.id}')" title="معاينة">👁️</button>
                  <button class="btn btn-icon sm btn-ghost" onclick="editRep('${t.id}')" title="تعديل">✏️</button>
                  <button class="btn btn-icon sm btn-ghost" onclick="printRep('${t.id}')" title="طباعة">🖨️</button>
                  <button class="btn btn-icon sm btn-ghost" onclick="deleteRep('${t.id}','${t.name}')" style="color:var(--bad);" title="حذف">🗑️</button>
                </div>
              </div>
            </div>

            <!-- Target Progress -->
            <div class="mb-16" style="background:var(--bg-2);padding:12px;border-radius:10px;">
              <div class="flex justify-between mb-8" style="font-size:12px;">
                <span class="text-2 font-semibold">تحقيق الهدف الشهري (المبيعات)</span>
                <span class="mono text-${h} font-bold">${k(y)}</span>
              </div>
              <div class="progress-bar" style="height:7px;background:rgba(255,255,255,0.06);">
                <div class="fill ${h}" style="width:${Math.min(y,100)}%;transition:width 0.6s ease;border-radius:4px;"></div>
              </div>
              <div class="flex justify-between mt-8" style="font-size:11px;">
                <span class="mono font-bold" style="color:var(--text-0);">${c(u)}</span>
                <span class="text-2">الهدف: ${c(g)}</span>
              </div>
            </div>

            <!-- Financials & Commission Metrics -->
            <div class="grid-2 gap-10" style="font-size:12px;margin-bottom:12px;">
              <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:12px;">
                <div class="text-2 mb-4" style="font-size:11px;color:var(--good);">💵 التحصيلات النقدية</div>
                <div class="mono font-bold text-good" style="font-size:15px;">${c(b)}</div>
                <div class="dim" style="font-size:10px;margin-top:2px;">من كشوفات العملاء</div>
              </div>
              <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:12px;">
                <div class="text-2 mb-4" style="font-size:11px;color:var(--indigo);">💰 العمولة المستحقة (${f}%)</div>
                <div class="mono font-bold text-indigo" style="font-size:15px;">${c(B)}</div>
                <div class="dim" style="font-size:10px;margin-top:2px;">محسوبة على النقد المحصل</div>
              </div>
            </div>

            <!-- Customer & Contact Info -->
            <div class="grid-2 gap-10" style="font-size:11px;">
              <div style="background:var(--bg-2);border-radius:8px;padding:8px 10px;">
                <div class="text-2 mb-2">👥 العملاء المربوطون</div>
                <div class="mono font-bold" style="color:var(--text-0);">${a.length} عميل (ديون: ${c($)})</div>
              </div>
              <div style="background:var(--bg-2);border-radius:8px;padding:8px 10px;">
                <div class="text-2 mb-2">📞 الهاتف والجوال</div>
                <div class="mono font-bold" style="color:var(--text-0);">${t.phone||"—"}</div>
              </div>
            </div>
          </div>
        </div>`}).join("")}catch(o){e.innerHTML=`<div class="alert bad">${o.message}</div>`}}window.openRepModal=async(e=null)=>{document.getElementById("rep-edit-id").value=e?.id||"",document.getElementById("rep-modal-title").textContent=e?"تعديل المندوب":"إضافة مندوب",document.getElementById("rep-name").value=e?.name||"",document.getElementById("rep-phone").value=e?.phone||"",document.getElementById("rep-zone").value=e?.zone||"",document.getElementById("rep-target").value=e?.monthlyTarget||"",document.getElementById("rep-salary").value=e?.salary||"",document.getElementById("rep-commission").value=e?.commissionRate||"",document.getElementById("rep-pin").value="",document.getElementById("rep-form-error").classList.add("hidden");try{const{getAll:o,COLS:n}=await v(async()=>{const{getAll:t,COLS:a}=await import("./index-HrCilPJ3.js").then(r=>r.N);return{getAll:t,COLS:a}},__vite__mapDeps([0,1])),{orderBy:l}=await v(async()=>{const{orderBy:t}=await import("./index-HrCilPJ3.js").then(a=>a.N);return{orderBy:t}},__vite__mapDeps([0,1])),i=await o(n.warehouses(),[l("name")]),d=document.getElementById("rep-warehouse");d.innerHTML='<option value="">-- اختر مستودع --</option>'+i.map(t=>`<option value="${t.id}" ${e?.assignedWarehouseId===t.id?"selected":""}>${t.name}</option>`).join("")}catch{}try{const{getAll:o,COLS:n}=await v(async()=>{const{getAll:t,COLS:a}=await import("./index-HrCilPJ3.js").then(r=>r.N);return{getAll:t,COLS:a}},__vite__mapDeps([0,1])),{orderBy:l}=await v(async()=>{const{orderBy:t}=await import("./index-HrCilPJ3.js").then(a=>a.N);return{orderBy:t}},__vite__mapDeps([0,1])),i=await o(n.employees(),[l("name")]),d=document.getElementById("rep-employee");d.innerHTML='<option value="">-- اختر موظف --</option>'+i.map(t=>`<option value="${t.id}" ${e?.employeeId===t.id?"selected":""}>${t.name} (${t.job||"موظف"})</option>`).join("")}catch{}openModal("rep-modal")};window.editRep=async e=>{const{getById:o}=await v(async()=>{const{getById:l}=await import("./index-HrCilPJ3.js").then(i=>i.N);return{getById:l}},__vite__mapDeps([0,1])),n=await o("salesReps",e);n&&openRepModal(n)};window.saveRep=async()=>{const e=document.getElementById("rep-form-error");e.classList.add("hidden");const o=document.getElementById("rep-edit-id").value,n=document.getElementById("rep-name").value.trim();if(!n){e.textContent="اسم المندوب مطلوب",e.classList.remove("hidden");return}const l=document.getElementById("rep-pin").value.trim(),i={name:n,phone:document.getElementById("rep-phone").value.trim(),zone:document.getElementById("rep-zone").value.trim(),monthlyTarget:parseFloat(document.getElementById("rep-target").value)||0,salary:parseFloat(document.getElementById("rep-salary").value)||0,commissionRate:parseFloat(document.getElementById("rep-commission").value)||0,assignedWarehouseId:document.getElementById("rep-warehouse").value||null,employeeId:document.getElementById("rep-employee").value||null};l&&(i.pin=l);const d=document.getElementById("save-rep-btn");d.disabled=!0;try{if(o)await z("salesReps",o,i),showToast("تم تحديث المندوب","success");else{const t=await C(p.salesReps(),i);showToast("تمت إضافة المندوب","success");try{const a=typeof t=="string"?t:t?.id||t;a&&await S(a,i.name)}catch(a){console.warn("[syncRepToCoa] فشل إنشاء حساب المندوب في شجرة الحسابات:",a.message)}}closeModal("rep-modal"),await x()}catch(t){e.textContent=t.message,e.classList.remove("hidden")}finally{d.disabled=!1}};window.deleteRep=async(e,o)=>{if(await showConfirm(`حذف المندوب "${o}"؟`,"تأكيد"))try{await L("salesReps",e),showToast("تم الحذف","success"),await x()}catch(n){showToast(n.message,"error")}};window.viewRepStatement=e=>{window._preselectedStatementEntity={type:"rep",id:e},navigate("report-customer-statement")};let I=[];function R(e){return I.find(o=>o.id===e)||null}function E(e){return[{heading:"بيانات المندوب",rows:[{label:"اسم المندوب",value:e.name,bold:!0},{label:"رقم الهاتف",value:e.phone,mono:!0},{label:"المنطقة/المسار",value:e.zone}]},{heading:"بيانات مالية",rows:[{label:"الراتب الأساسي",value:c(e.salary||0),mono:!0},{label:"الهدف الشهري",value:c(e.monthlyTarget||0),mono:!0},{label:"نسبة العمولة",value:e.commissionRate?`${e.commissionRate}%`:null},{label:"ملاحظات",value:e.notes}]}]}window.previewRep=e=>{const o=R(e);if(!o){showToast("لم يتم إيجاد المندوب","error");return}P({title:o.name,icon:"👤",sections:E(o),actions:[{icon:"✏️",label:"تعديل",fn:`document.getElementById('record-preview-overlay').remove();editRep('${e}')`,style:"background:var(--brand);color:#fff;"},{icon:"🖨️",label:"طباعة",fn:`printRep('${e}')`,style:"background:var(--bg-2);color:var(--text-1);"},{icon:"📄",label:"PDF",fn:`exportRepPDF('${e}')`,style:"background:#EF4444;color:#fff;"}]})};window.printRep=e=>{const o=R(e);o&&M({title:o.name,icon:"👤",sections:E(o)})};window.exportRepPDF=e=>{window.printRep(e)};window.exportRepsExcel=async()=>{try{const e=await m(p.salesReps(),[w("name")]);await F({title:"المندوبون",headers:["اسم المندوب","رقم الهاتف","المنطقة","الراتب","الهدف الشهري","العمولة %"],rows:e.map(o=>[o.name,o.phone||"",o.zone||"",o.salary||0,o.monthlyTarget||0,o.commissionRate||0]),colWidths:[26,16,18,14,16,12]}),showToast("تم تصدير المندوبين ✅","success")}catch(e){showToast(e.message,"error")}};export{J as render};
