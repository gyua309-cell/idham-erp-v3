const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-T8P1GM2w.js","assets/index-Dq7oGj9k.css"])))=>i.map(i=>d[i]);
import{g as b,a as g,G as O,f as u,y as P,_ as y,u as D,o as S,r as F}from"./index-T8P1GM2w.js";import{s as W,p as j}from"./record-actions-BUPPxq1M.js";import{e as V}from"./excel-zCoXiaxq.js";import{a as H}from"./coa-connector-BkSx3WB1.js";import{orderBy as U}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function ee(e,a){e.innerHTML=`
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
    </div>`,await C()}async function C(){const e=document.getElementById("reps-grid");if(e)try{const[a,s,m]=await Promise.all([b(g.salesReps()).catch(()=>[]),b(g.customers()).catch(()=>[]),b(g.chartOfAccounts()).catch(()=>[])]);if(w=(a||[]).sort((t,o)=>(t.name||"").localeCompare(o.name||"")),w.length===0){e.innerHTML='<div class="empty-state" style="grid-column:span 3;"><div class="empty-icon">🚚</div><h3>لا يوجد مناديب</h3><p>اضغط على "إضافة مندوب" للبدء</p></div>';return}const i={};(m||[]).forEach(t=>{i[t.id]=t,t.code&&(i[t.code]=t)});const[p,n]=await Promise.all([b(g.salesInvoices()).catch(()=>[]),b(g.receipts()).catch(()=>[])]),l=(p||[]).filter(t=>t.status!=="cancelled");e.innerHTML=a.map(t=>{const o=s.filter(r=>r.repId===t.id||r.assignedRepId===t.id),d=new Set(o.map(r=>r.id)),c=new Set(o.map(r=>r.name));let f=0;l.forEach(r=>{(r.repId===t.id||d.has(r.customerId))&&(f+=parseFloat(r.totalWithVat||r.total||0))});let R=0;n.forEach(r=>{(r.repId===t.id||d.has(r.customerId)||d.has(r.targetId))&&(R+=parseFloat(r.amount||0))});const z=o.reduce((r,M)=>r+parseFloat(M.balance||0),0),x=t.monthlyTarget||0,B=f<x?1:parseFloat(t.commissionRate||2.5),L=R*B/100,E=x>0?Math.min(f/x*100,150):0,I=O(E),v=t.accountId?i[t.accountId]:null,h=v?parseFloat(v.balance||v.totalDebit-v.totalCredit||0):null,$=h!==null&&Math.abs(h)<.01,A=v?`
        <div style="margin-top:10px;padding:10px 12px;border-radius:10px;
          background:${$?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.07)"};
          border:1px solid ${$?"rgba(16,185,129,0.25)":"rgba(239,68,68,0.2)"};
          display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:10px;color:var(--text-2);margin-bottom:2px;">📒 رصيد الحساب المحاسبي</div>
            <div style="font-size:11px;color:var(--text-2);">${v.code} — ${v.name}</div>
          </div>
          <div style="text-align:left;">
            ${$?'<span style="font-size:13px;font-weight:700;color:#10b981;">✅ مسوّى (صفر)</span>':`<span style="font-size:14px;font-weight:800;color:${h>0?"#f59e0b":"#ef4444"};"
                   class="mono">${u(Math.abs(h))}</span>
                 <div style="font-size:10px;color:var(--text-2);">${h>0?"رصيد مدين":"رصيد دائن"}</div>`}
          </div>
        </div>`:"";return`
        <div class="card" style="padding:0;overflow:hidden;border-radius:14px;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          <div style="height:4px;background:var(--${I});"></div>
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
                <span class="mono text-${I} font-bold">${P(E)}</span>
              </div>
              <div class="progress-bar" style="height:7px;background:rgba(255,255,255,0.06);">
                <div class="fill ${I}" style="width:${Math.min(E,100)}%;transition:width 0.6s ease;border-radius:4px;"></div>
              </div>
              <div class="flex justify-between mt-8" style="font-size:11px;">
                <span class="mono font-bold" style="color:var(--text-0);">${u(f)}</span>
                <span class="text-2">الهدف: ${u(x)}</span>
              </div>
            </div>

            <!-- Financials & Commission Metrics -->
            <div class="grid-2 gap-10" style="font-size:12px;margin-bottom:12px;">
              <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:12px;">
                <div class="text-2 mb-4" style="font-size:11px;color:var(--good);">💵 التحصيلات النقدية</div>
                <div class="mono font-bold text-good" style="font-size:15px;">${u(R)}</div>
                <div class="dim" style="font-size:10px;margin-top:2px;">من كشوفات العملاء</div>
              </div>
              <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:12px;">
                <div class="text-2 mb-4" style="font-size:11px;color:var(--indigo);">💰 العمولة المستحقة (${B}%)</div>
                <div class="mono font-bold text-indigo" style="font-size:15px;">${u(L)}</div>
                <div class="dim" style="font-size:10px;margin-top:2px;">محسوبة على النقد المحصل</div>
              </div>
            </div>

            <!-- Customer & Contact Info -->
            <div class="grid-2 gap-10" style="font-size:11px;">
              <div style="background:var(--bg-2);border-radius:8px;padding:8px 10px;">
                <div class="text-2 mb-2">👥 العملاء المربوطون</div>
                <div class="mono font-bold" style="color:var(--text-0);">${o.length} عميل (ديون: ${u(z)})</div>
              </div>
              <div style="background:var(--bg-2);border-radius:8px;padding:8px 10px;">
                <div class="text-2 mb-2">📞 الهاتف والجوال</div>
                <div class="mono font-bold" style="color:var(--text-0);">${t.phone||"—"}</div>
              </div>
            </div>

            <!-- COA Account Balance (reflects journal entry settlements) -->
            ${A}
          </div>
        </div>`}).join("")}catch(a){e.innerHTML=`<div class="alert bad">${a.message}</div>`}}window.openRepModal=async(e=null)=>{document.getElementById("rep-edit-id").value=e?.id||"",document.getElementById("rep-modal-title").textContent=e?"تعديل المندوب":"إضافة مندوب",document.getElementById("rep-name").value=e?.name||"",document.getElementById("rep-phone").value=e?.phone||"",document.getElementById("rep-zone").value=e?.zone||"",document.getElementById("rep-target").value=e?.monthlyTarget||"",document.getElementById("rep-salary").value=e?.salary||"",document.getElementById("rep-commission").value=e?.commissionRate||"",document.getElementById("rep-pin").value="",document.getElementById("rep-form-error").classList.add("hidden");try{const{getAll:a,COLS:s}=await y(async()=>{const{getAll:n,COLS:l}=await import("./index-T8P1GM2w.js").then(t=>t.T);return{getAll:n,COLS:l}},__vite__mapDeps([0,1])),{orderBy:m}=await y(async()=>{const{orderBy:n}=await import("./index-T8P1GM2w.js").then(l=>l.T);return{orderBy:n}},__vite__mapDeps([0,1])),i=await a(s.warehouses(),[m("name")]),p=document.getElementById("rep-warehouse");p.innerHTML='<option value="">-- اختر مستودع --</option>'+i.map(n=>`<option value="${n.id}" ${e?.assignedWarehouseId===n.id?"selected":""}>${n.name}</option>`).join("")}catch{}try{const{getAll:a,COLS:s}=await y(async()=>{const{getAll:n,COLS:l}=await import("./index-T8P1GM2w.js").then(t=>t.T);return{getAll:n,COLS:l}},__vite__mapDeps([0,1])),{orderBy:m}=await y(async()=>{const{orderBy:n}=await import("./index-T8P1GM2w.js").then(l=>l.T);return{orderBy:n}},__vite__mapDeps([0,1])),i=await a(s.employees(),[m("name")]),p=document.getElementById("rep-employee");p.innerHTML='<option value="">-- اختر موظف --</option>'+i.map(n=>`<option value="${n.id}" ${e?.employeeId===n.id?"selected":""}>${n.name} (${n.job||"موظف"})</option>`).join("")}catch{}openModal("rep-modal")};window.editRep=async e=>{const{getById:a}=await y(async()=>{const{getById:m}=await import("./index-T8P1GM2w.js").then(i=>i.T);return{getById:m}},__vite__mapDeps([0,1])),s=await a("salesReps",e);s&&openRepModal(s)};async function T(e,a,s,m,i){try{const{update:p,getAll:n,COLS:l}=await y(async()=>{const{update:t,getAll:o,COLS:d}=await import("./index-T8P1GM2w.js").then(c=>c.T);return{update:t,getAll:o,COLS:d}},__vite__mapDeps([0,1]));if(m)try{await p("employees",m,{name:a,job:"مندوب مبيعات"})}catch(t){console.warn("[syncRepCascade] Employee sync error:",t)}try{const t=await n(l.costCenters()).catch(()=>[]);for(const o of t){let d=!1;if(i&&o.warehouseId===i&&(d=!0),o.linkedRepId===e&&(d=!0),s&&o.name&&o.name.includes(s)&&(d=!0),d){let c=o.name;s&&c.includes(s)?c=c.replace(new RegExp(s,"g"),a):c.includes(a)||(c=`سيارة ${a}`),await p("costCenters",o.id,{name:c,linkedRepId:e}),console.log(`[syncRepCascade] Updated Cost Center ${o.id} → ${c}`)}}}catch(t){console.warn("[syncRepCascade] Cost Center sync error:",t)}try{const t=await n(l.chartOfAccounts()).catch(()=>[]);for(const o of t){let d=!1;if((o.linkedRepId===e||o.sourceEntityId===e)&&(d=!0),s&&o.name&&o.name.includes(s)&&(d=!0),d&&(o.code?.startsWith("1-1-2-1-2")||o.code?.startsWith("1-1-1-2")||o.parentCode?.startsWith("1-1-2-1-2"))){let c=o.name;s&&c.includes(s)?c=c.replace(new RegExp(s,"g"),a):c=o.code?.startsWith("1-1-1-2")?`صندوق المندوب - ${a}`:`عملاء ${a}`,await p("chartOfAccounts",o.id,{name:c,linkedRepId:e}),console.log(`[syncRepCascade] Updated COA Account ${o.code} → ${c}`)}}}catch(t){console.warn("[syncRepCascade] COA sync error:",t)}if(i)try{const o=(await n(l.warehouses()).catch(()=>[])).find(d=>d.id===i);if(o&&s&&o.name&&o.name.includes(s)){const d=o.name.replace(new RegExp(s,"g"),a);await p("warehouses",o.id,{name:d}),console.log(`[syncRepCascade] Updated Warehouse ${o.id} → ${d}`)}}catch(t){console.warn("[syncRepCascade] Warehouse sync error:",t)}}catch(p){console.warn("[syncRepCascade] Global cascade error:",p)}}window.saveRep=async()=>{const e=document.getElementById("rep-form-error");e.classList.add("hidden");const a=document.getElementById("rep-edit-id").value,s=document.getElementById("rep-name").value.trim();if(!s){e.textContent="اسم المندوب مطلوب",e.classList.remove("hidden");return}const m=document.getElementById("rep-pin").value.trim(),i={name:s,phone:document.getElementById("rep-phone").value.trim(),zone:document.getElementById("rep-zone").value.trim(),monthlyTarget:parseFloat(document.getElementById("rep-target").value)||0,salary:parseFloat(document.getElementById("rep-salary").value)||0,commissionRate:parseFloat(document.getElementById("rep-commission").value)||0,assignedWarehouseId:document.getElementById("rep-warehouse").value||null,employeeId:document.getElementById("rep-employee").value||null};m&&(i.pin=m);const p=document.getElementById("save-rep-btn");p.disabled=!0;try{let n="";if(a){const l=w.find(t=>t.id===a);l&&l.name&&(n=l.name),await D("salesReps",a,i),showToast("تم تحديث المندوب ومزامنة الأقسام المرتبطة بنجاح","success"),await T(a,i.name,n,i.employeeId,i.assignedWarehouseId)}else{const l=await S(g.salesReps(),i),t=typeof l=="string"?l:l?.id||l;showToast("تمت إضافة المندوب ومزامنة الحسابات","success");try{t&&(await H(t,i.name),await T(t,i.name,"",i.employeeId,i.assignedWarehouseId))}catch(o){console.warn("[syncRepToCoa] فشل إنشاء حساب المندوب:",o.message)}}closeModal("rep-modal"),await C()}catch(n){e.textContent=n.message,e.classList.remove("hidden")}finally{p.disabled=!1}};window.deleteRep=async(e,a)=>{if(await showConfirm(`حذف المندوب "${a}"؟`,"تأكيد"))try{await F("salesReps",e),showToast("تم الحذف","success"),await C()}catch(s){showToast(s.message,"error")}};window.viewRepStatement=e=>{window._preselectedStatementEntity={type:"rep",id:e},navigate("report-customer-statement")};let w=[];function _(e){return w.find(a=>a.id===e)||null}function k(e){return[{heading:"بيانات المندوب",rows:[{label:"اسم المندوب",value:e.name,bold:!0},{label:"رقم الهاتف",value:e.phone,mono:!0},{label:"المنطقة/المسار",value:e.zone}]},{heading:"بيانات مالية",rows:[{label:"الراتب الأساسي",value:u(e.salary||0),mono:!0},{label:"الهدف الشهري",value:u(e.monthlyTarget||0),mono:!0},{label:"نسبة العمولة",value:e.commissionRate?`${e.commissionRate}%`:null},{label:"ملاحظات",value:e.notes}]}]}window.previewRep=e=>{const a=_(e);if(!a){showToast("لم يتم إيجاد المندوب","error");return}W({title:a.name,icon:"👤",sections:k(a),actions:[{icon:"✏️",label:"تعديل",fn:`document.getElementById('record-preview-overlay').remove();editRep('${e}')`,style:"background:var(--brand);color:#fff;"},{icon:"🖨️",label:"طباعة",fn:`printRep('${e}')`,style:"background:var(--bg-2);color:var(--text-1);"},{icon:"📄",label:"PDF",fn:`exportRepPDF('${e}')`,style:"background:#EF4444;color:#fff;"}]})};window.printRep=e=>{const a=_(e);a&&j({title:a.name,icon:"👤",sections:k(a)})};window.exportRepPDF=e=>{window.printRep(e)};window.exportRepsExcel=async()=>{try{const e=await b(g.salesReps(),[U("name")]);await V({title:"المندوبون",headers:["اسم المندوب","رقم الهاتف","المنطقة","الراتب","الهدف الشهري","العمولة %"],rows:e.map(a=>[a.name,a.phone||"",a.zone||"",a.salary||0,a.monthlyTarget||0,a.commissionRate||0]),colWidths:[26,16,18,14,16,12]}),showToast("تم تصدير المندوبين ✅","success")}catch(e){showToast(e.message,"error")}};export{ee as render};
