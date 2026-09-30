const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-DaYejt0r.js","assets/index-Dq7oGj9k.css"])))=>i.map(i=>d[i]);
import{a as v,d as f,C as h,f as m,o as _,_ as j,u as w}from"./index-DaYejt0r.js";import{getDocs as N,query as M,getDoc as I,doc as B,where as S,orderBy as z,collection as O}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";const $={active:{label:"نشط",color:"good",icon:"🟢"},paid:{label:"مسدد",color:"neutral",icon:"✅"},overdue:{label:"متأخر",color:"bad",icon:"🔴"},cancelled:{label:"ملغي",color:"neutral",icon:"⛔"}};let c=[],C=null;function T(a){if(!a||isNaN(a))return"صفر ريال سعودي";const t=["","واحد","اثنان","ثلاثة","أربعة","خمسة","ستة","سبعة","ثمانية","تسعة","عشرة","أحد عشر","اثنا عشر","ثلاثة عشر","أربعة عشر","خمسة عشر","ستة عشر","سبعة عشر","ثمانية عشر","تسعة عشر"],e=["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"],s=["","مئة","مئتان","ثلاثمئة","أربعمئة","خمسمئة","ستمئة","سبعمئة","ثمانمئة","تسعمئة"],n=["","ألف","ألفان","ثلاثة آلاف","أربعة آلاف","خمسة آلاف","ستة آلاف","سبعة آلاف","ثمانية آلاف","تسعة آلاف"],o=Math.floor(Math.abs(a)),l=Math.round((Math.abs(a)-o)*100);function d(p){if(p===0)return"";if(p<20)return t[p];const u=Math.floor(p/10),b=p%10;return b===0?e[u]:t[b]+" و"+e[u]}function i(p){if(p===0)return"صفر";let u="";const b=Math.floor(p/1e3),A=p%1e3,D=Math.floor(A/100),x=A%100;return b>0&&(u+=b<10?n[b]:d(b)+" ألف",(D>0||x>0)&&(u+=" و")),D>0&&(u+=s[D],x>0&&(u+=" و")),x>0&&(u+=d(x)),u}const r=Math.floor(o/1e6),y=o%1e6;let g="";r>0&&(g+=i(r)+" مليون "),g+=i(y);let k=g.trim()+" ريال سعودي";return l>0&&(k+=" و"+i(l)+" هللة"),k+=" لا غير",k}async function R(){const a=new Date().getFullYear(),t=await N(M(v.promissoryNotes(),S("noteNumber",">=",`PN-${a}-`),S("noteNumber","<=",`PN-${a}-z`),z("noteNumber","desc")));let e=1;if(!t.empty){const n=t.docs[0].data().noteNumber.split("-");e=(parseInt(n[3]||"0")||0)+1}return`PN-${a}-${String(e).padStart(4,"0")}`}async function it(a,t){if(C=t,a.innerHTML=`
    <div class="filterbar" style="flex-wrap:wrap; gap:8px;">
      <div class="search-bar" style="max-width:240px;">
        <input type="text" id="pn-search" class="input" placeholder="🔍  بحث بالعميل أو رقم السند…" oninput="filterNotes()"/>
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="pn-status-filter" onchange="filterNotes()">
          <option value="">الكل</option>
          <option value="active">نشط</option>
          <option value="overdue">متأخر</option>
          <option value="paid">مسدد</option>
          <option value="cancelled">ملغي</option>
        </select>
      </div>
      <div style="margin-right:auto; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn-export print" onclick="window.print()">🖨️ طباعة</button>
        <button class="btn btn-primary" onclick="openNewNoteModal()">📜 + إصدار سند أمر جديد</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">سندات الأمر</h1>
          <p class="page-subtitle" id="pn-count">جاري التحميل…</p>
        </div>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid" id="pn-kpis" style="margin-bottom:20px;"></div>

      <!-- Table -->
      <div class="card">
        <div class="table-container">
          <table class="data-dense" id="pn-table">
            <thead><tr>
              <th>رقم السند</th>
              <th>العميل</th>
              <th>المبلغ</th>
              <th>تاريخ الإصدار</th>
              <th>تاريخ الاستحقاق</th>
              <th>الحالة</th>
              <th style="text-align:center;">الإجراءات</th>
            </tr></thead>
            <tbody id="pn-tbody">
              <tr><td colspan="7" style="text-align:center;padding:32px;">
                <div class="sk" style="height:14px;width:60%;margin:auto;"></div>
              </td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal: New / Edit Note -->
    <div id="pn-modal" style="display:none;" class="modal-overlay" onclick="if(event.target===this)closePnModal()">
      <div class="modal-box" style="max-width:600px; width:94vw;">
        <div class="modal-header">
          <h2 class="modal-title" id="pn-modal-title">📜 إصدار سند أمر جديد</h2>
          <button class="modal-close" onclick="closePnModal()">✕</button>
        </div>
        <div class="modal-body" id="pn-modal-body"></div>
      </div>
    </div>
  `,!document.getElementById("pn-styles")){const e=document.createElement("style");e.id="pn-styles",e.innerHTML=`
      .pn-print-doc { display:none; }
      @media print {
        body > * { display:none !important; }
        .pn-print-doc { display:block !important; }
      }
      .pn-status-badge { padding:2px 8px; border-radius:10px; font-size:11px; font-weight:700; }
      .pn-status-active    { background:rgba(16,185,129,.12); color:#059669; }
      .pn-status-paid      { background:rgba(107,114,128,.12); color:#6B7280; }
      .pn-status-overdue   { background:rgba(239,68,68,.12);  color:#DC2626; }
      .pn-status-cancelled { background:rgba(107,114,128,.12); color:#9CA3AF; }
      .pn-amount-badge { font-family:monospace; font-weight:800; color:var(--brand); }
    `,document.head.appendChild(e)}window.filterNotes=L,window.openNewNoteModal=U,window.closePnModal=F,window.savePnNote=G,window.markNoteAsPaid=J,window.cancelNote=Q,window.printNote=H,window.viewNote=X,await E()}async function E(){try{c=(await N(M(v.promissoryNotes(),z("createdAt","desc")))).docs.map(e=>({id:e.id,...e.data()}));const t=new Date().toISOString().slice(0,10);c.forEach(e=>{e.status==="active"&&e.dueDate&&e.dueDate!=="لدى الاطلاع"&&e.dueDate<t&&(e.status="overdue")}),W(),L()}catch(a){document.getElementById("pn-tbody").innerHTML=`<tr><td colspan="7" style="text-align:center;color:var(--text-bad);">${a.message}</td></tr>`}}function W(){const a=c.filter(o=>o.status==="active"),t=c.filter(o=>o.status==="overdue"),e=c.filter(o=>o.status==="paid"),s=a.reduce((o,l)=>o+(l.amount||0),0),n=t.reduce((o,l)=>o+(l.amount||0),0);document.getElementById("pn-kpis").innerHTML=`
    <div class="inv-kpi-card">
      <div class="inv-kpi-val">${a.length+t.length}</div>
      <div class="inv-kpi-label">سندات نشطة</div>
    </div>
    <div class="inv-kpi-card" style="border-color:var(--brand);">
      <div class="inv-kpi-val" style="color:var(--brand);">${m(s)}</div>
      <div class="inv-kpi-label">إجمالي المبالغ النشطة</div>
    </div>
    <div class="inv-kpi-card" style="border-color:#EF4444;">
      <div class="inv-kpi-val" style="color:#EF4444;">${t.length}</div>
      <div class="inv-kpi-label">سندات متأخرة — ${m(n)}</div>
    </div>
    <div class="inv-kpi-card">
      <div class="inv-kpi-val" style="color:#10B981;">${e.length}</div>
      <div class="inv-kpi-label">سندات مسددة</div>
    </div>
  `}function L(){const a=(document.getElementById("pn-search")?.value||"").trim().toLowerCase(),t=document.getElementById("pn-status-filter")?.value||"";let e=c;t&&(e=e.filter(n=>n.status===t)),a&&(e=e.filter(n=>(n.noteNumber||"").toLowerCase().includes(a)||(n.customerName||"").toLowerCase().includes(a)));const s=document.getElementById("pn-count");s&&(s.textContent=`${e.length} سند`),document.getElementById("pn-tbody").innerHTML=e.length===0?'<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد سندات مطابقة</td></tr>':e.map(n=>{const o=$[n.status]||$.active;return`<tr>
          <td class="mono font-bold" style="color:var(--brand); cursor:pointer;" onclick="viewNote('${n.id}')">${n.noteNumber||"—"}</td>
          <td><strong>${n.customerName||"—"}</strong></td>
          <td class="pn-amount-badge">${m(n.amount||0)}</td>
          <td class="mono dim">${n.issueDate||"—"}</td>
          <td class="mono dim">${n.dueDate||"—"}</td>
          <td><span class="pn-status-badge pn-status-${n.status}">${o.icon} ${o.label}</span></td>
          <td style="text-align:center;">
            <div style="display:flex; gap:4px; justify-content:center; flex-wrap:wrap;">
              <button class="btn btn-icon sm btn-ghost" onclick="printNote('${n.id}')" title="طباعة السند">🖨️</button>
              ${n.status==="active"||n.status==="overdue"?`<button class="btn btn-icon sm" style="background:rgba(16,185,129,.12);color:#059669;border:1px solid rgba(16,185,129,.25);" onclick="markNoteAsPaid('${n.id}')" title="تسديد السند">✅ تسديد</button>
                   <button class="btn btn-icon sm btn-ghost text-bad" onclick="cancelNote('${n.id}')" title="إلغاء السند">⛔</button>`:""}
            </div>
          </td>
        </tr>`}).join("")}async function U(a=null,t=null){let e="ينبع",s="شركة نظم الإمداد الحديثة",n="4700124180";try{const d=await N(M(v.settings?v.settings():v.companies()));if(!d.empty){const i=d.docs[0]?.data()||{};e=i.city||i.cityAr||e,s=i.name||i.nameAr||s,n=i.crNumber||i.commercialRegistration||n}}catch{}const o=await R(),l=new Date().toISOString().slice(0,10);if(document.getElementById("pn-modal-title").textContent="📜 إصدار سند أمر جديد",document.getElementById("pn-modal-body").innerHTML=`
    <form id="pn-form" onsubmit="savePnNote(event)" autocomplete="off">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">

        <div class="form-group">
          <label class="form-label">رقم السند (تلقائي)</label>
          <input class="input" id="pn-num" value="${o}" readonly style="background:var(--bg-2);"/>
        </div>

        <div class="form-group">
          <label class="form-label">تاريخ الإصدار *</label>
          <input class="input" type="date" id="pn-issue-date" value="${l}" required/>
        </div>

        <div class="form-group" style="grid-column:1/-1;">
          <label class="form-label">العميل (المدين) *</label>
          <div style="position:relative;">
            <input class="input" id="pn-cust-search" placeholder="🔍 ابحث عن عميل…"
                   oninput="searchPnCustomer(this.value)" autocomplete="off"
                   value="${t||""}"/>
            <div id="pn-cust-dropdown" style="
              position:absolute; top:100%; right:0; left:0; background:var(--bg-1);
              border:1px solid var(--border); border-radius:8px; z-index:200;
              max-height:200px; overflow-y:auto; display:none; box-shadow:var(--shadow);
            "></div>
          </div>
          <input type="hidden" id="pn-cust-id" value="${a||""}"/>
          <input type="hidden" id="pn-cust-credit-limit" value="0"/>
          <input type="hidden" id="pn-cust-balance" value="0"/>
          <div id="pn-credit-bar" style="display:none; margin-top:6px;"></div>
        </div>

        <div class="form-group">
          <label class="form-label">رقم هوية / سجل تجاري العميل</label>
          <input class="input" id="pn-cust-id-num" placeholder="1234567890"/>
        </div>

        <div class="form-group">
          <label class="form-label">المبلغ (رقماً) *</label>
          <input class="input" type="number" id="pn-amount" min="1" step="0.01"
                 placeholder="0.00" required oninput="updateAmountWords()"/>
        </div>

        <div class="form-group" style="grid-column:1/-1;">
          <label class="form-label">المبلغ كتابةً (تلقائي)</label>
          <input class="input" id="pn-amount-words" readonly style="background:var(--bg-2); font-size:12px;" placeholder="—"/>
        </div>

        <div class="form-group">
          <label class="form-label">تاريخ الاستحقاق</label>
          <div style="display:flex; gap:6px; align-items:center;">
            <input class="input" type="date" id="pn-due-date" style="flex:1;"/>
            <label style="white-space:nowrap; font-size:12px; display:flex; align-items:center; gap:4px;">
              <input type="checkbox" id="pn-on-demand" onchange="toggleDueDate(this)"/> لدى الاطلاع
            </label>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">مدينة الإصدار</label>
          <input class="input" id="pn-issue-city" value="${e}"/>
        </div>

        <div class="form-group">
          <label class="form-label">مدينة الوفاء</label>
          <input class="input" id="pn-pay-city" value="${e}"/>
        </div>

        <div class="form-group" style="grid-column:1/-1;">
          <label class="form-label">ملاحظات</label>
          <textarea class="input" id="pn-notes" rows="2" style="resize:vertical;"
                    placeholder="مرتبط بفاتورة رقم … أو أي ملاحظة"></textarea>
        </div>

      </div>

      <!-- Hidden company fields -->
      <input type="hidden" id="pn-company-name" value="${s}"/>
      <input type="hidden" id="pn-company-cr"   value="${n}"/>

      <div class="modal-footer" style="margin-top:16px; display:flex; gap:8px; justify-content:flex-end;">
        <button type="button" class="btn btn-secondary" onclick="closePnModal()">إلغاء</button>
        <button type="submit" class="btn btn-primary">📜 إصدار السند</button>
      </div>
    </form>
  `,window.searchPnCustomer=K,window.selectPnCustomer=V,window.updateAmountWords=q,window.toggleDueDate=Y,a)try{const d=await I(B(f,`companies/${h}/customers`,a));if(d.exists()){const i=d.data();document.getElementById("pn-cust-id-num").value=i.idNumber||i.crNumber||"",document.getElementById("pn-cust-credit-limit").value=i.creditLimit||0,document.getElementById("pn-cust-balance").value=i.balance||0,P(i.creditLimit||0,i.balance||0,0)}}catch{}document.getElementById("pn-modal").style.display="flex"}function Y(a){const t=document.getElementById("pn-due-date");t.disabled=a.checked,a.checked&&(t.value="")}function q(){const a=parseFloat(document.getElementById("pn-amount")?.value||0),t=document.getElementById("pn-amount-words");t&&(t.value=a>0?T(a):"");const e=parseFloat(document.getElementById("pn-cust-credit-limit")?.value||0),s=parseFloat(document.getElementById("pn-cust-balance")?.value||0);P(e,s,a)}function P(a,t,e){const s=document.getElementById("pn-credit-bar");if(!s)return;if(a<=0){s.style.display="none";return}const n=t+e,o=Math.min(n/a*100,100),l=n>a;s.style.display="block",s.innerHTML=`
    <div style="font-size:11px; color:${l?"#DC2626":"var(--text-2)"}; margin-bottom:4px;">
      ${l?"⚠️ تجاوز حد الائتمان!":"📊 الائتمان المستخدم"}
      ${m(n)} / ${m(a)}
    </div>
    <div style="height:6px; background:var(--bg-3); border-radius:4px; overflow:hidden;">
      <div style="height:100%; width:${o}%; background:${l?"#EF4444":o>80?"#F59E0B":"#10B981"}; border-radius:4px; transition:.3s;"></div>
    </div>
  `}async function K(a){const t=document.getElementById("pn-cust-dropdown");if(!a||a.length<1){t.style.display="none";return}try{const s=(await N(v.customers())).docs.map(n=>({id:n.id,...n.data()})).filter(n=>(n.name||"").includes(a)||(n.phone||"").includes(a)).slice(0,8);if(!s.length){t.style.display="none";return}t.innerHTML=s.map(n=>`
      <div class="autocomplete-item"
           onclick="selectPnCustomer('${n.id}','${(n.name||"").replace(/'/g,"\\'")}','${n.idNumber||n.crNumber||""}',${n.creditLimit||0},${n.balance||0})"
           style="padding:8px 12px; cursor:pointer; border-bottom:1px solid var(--border);">
        <strong>${n.name}</strong>
        <span class="dim" style="font-size:11px;"> | حد: ${m(n.creditLimit||0)} | رصيد: ${m(n.balance||0)}</span>
      </div>`).join(""),t.style.display="block"}catch{}}function V(a,t,e,s,n){document.getElementById("pn-cust-search").value=t,document.getElementById("pn-cust-id").value=a,document.getElementById("pn-cust-id-num").value=e,document.getElementById("pn-cust-credit-limit").value=s,document.getElementById("pn-cust-balance").value=n,document.getElementById("pn-cust-dropdown").style.display="none";const o=parseFloat(document.getElementById("pn-amount")?.value||0);P(s,n,o)}async function G(a){a.preventDefault();const t=a.submitter;t&&(t.disabled=!0,t.textContent="⏳ جاري الحفظ…");try{const e=document.getElementById("pn-cust-id").value,s=document.getElementById("pn-cust-search").value;if(!e)throw new Error("يرجى اختيار عميل من القائمة");const n=parseFloat(document.getElementById("pn-amount").value);if(!n||n<=0)throw new Error("يرجى إدخال مبلغ صحيح");const l=document.getElementById("pn-on-demand").checked?"لدى الاطلاع":document.getElementById("pn-due-date").value||"لدى الاطلاع",d={noteNumber:document.getElementById("pn-num").value,customerId:e,customerName:s,customerIdNumber:document.getElementById("pn-cust-id-num").value,companyName:document.getElementById("pn-company-name").value,companyCR:document.getElementById("pn-company-cr").value,amount:n,amountInWords:T(n),issueDate:document.getElementById("pn-issue-date").value,dueDate:l,issueCity:document.getElementById("pn-issue-city").value,paymentCity:document.getElementById("pn-pay-city").value,notes:document.getElementById("pn-notes").value,status:"active",createdBy:C?.displayName||C?.name||"النظام",createdAt:new Date().toISOString()};await _("promissoryNotes",d);try{const{update:i}=await j(async()=>{const{update:y}=await import("./index-DaYejt0r.js").then(g=>g.T);return{update:y}},__vite__mapDeps([0,1])),r=await I(B(f,`companies/${h}/customers`,e));if(r.exists()){const y=r.data().promissoryBalance||0;await i("customers",e,{promissoryBalance:y+n})}}catch(i){console.warn("[PN] could not update promissoryBalance:",i)}if(F(),await E(),confirm(`✅ تم إصدار السند بنجاح!
هل تريد طباعته الآن؟`)){const i=c.find(r=>r.noteNumber===d.noteNumber);i&&H(i.id)}}catch(e){alert("❌ "+e.message)}finally{t&&(t.disabled=!1,t.textContent="📜 إصدار السند")}}async function J(a){const t=c.find(e=>e.id===a);if(t&&confirm(`✅ تأكيد تسديد سند الأمر رقم ${t.noteNumber}
المبلغ: ${m(t.amount)}
للعميل: ${t.customerName}`))try{await w("promissoryNotes",a,{status:"paid",paidDate:new Date().toISOString().slice(0,10)});try{const e=await I(B(f,`companies/${h}/customers`,t.customerId));if(e.exists()){const s=e.data().promissoryBalance||0;await w("customers",t.customerId,{promissoryBalance:Math.max(0,s-t.amount)})}}catch{}await E()}catch(e){alert("❌ "+e.message)}}async function Q(a){const t=c.find(e=>e.id===a);if(t&&confirm(`⛔ إلغاء سند الأمر رقم ${t.noteNumber}؟
هذا الإجراء لا يمكن التراجع عنه.`))try{await w("promissoryNotes",a,{status:"cancelled"});try{const e=await I(B(f,`companies/${h}/customers`,t.customerId));if(e.exists()){const s=e.data().promissoryBalance||0;await w("customers",t.customerId,{promissoryBalance:Math.max(0,s-t.amount)})}}catch{}await E()}catch(e){alert("❌ "+e.message)}}function X(a){const t=c.find(s=>s.id===a);if(!t)return;const e=$[t.status]||$.active;document.getElementById("pn-modal-title").textContent=`📜 سند الأمر — ${t.noteNumber}`,document.getElementById("pn-modal-body").innerHTML=`
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:13px;">
      <div><span class="dim">رقم السند:</span> <strong>${t.noteNumber}</strong></div>
      <div><span class="dim">الحالة:</span> <span class="pn-status-badge pn-status-${t.status}">${e.icon} ${e.label}</span></div>
      <div><span class="dim">العميل:</span> <strong>${t.customerName}</strong></div>
      <div><span class="dim">رقم الهوية/السجل:</span> ${t.customerIdNumber||"—"}</div>
      <div><span class="dim">المبلغ:</span> <strong style="color:var(--brand);">${m(t.amount)}</strong></div>
      <div><span class="dim">تاريخ الإصدار:</span> ${t.issueDate}</div>
      <div><span class="dim">الاستحقاق:</span> ${t.dueDate}</div>
      <div><span class="dim">مدينة الإصدار:</span> ${t.issueCity}</div>
      <div style="grid-column:1/-1;"><span class="dim">المبلغ كتابةً:</span> <em>${t.amountInWords}</em></div>
      ${t.notes?`<div style="grid-column:1/-1;"><span class="dim">ملاحظات:</span> ${t.notes}</div>`:""}
    </div>
    <div class="modal-footer" style="margin-top:16px; display:flex; gap:8px; justify-content:flex-end;">
      <button class="btn btn-secondary" onclick="closePnModal()">إغلاق</button>
      <button class="btn btn-primary" onclick="closePnModal();printNote('${a}')">🖨️ طباعة السند</button>
    </div>
  `,document.getElementById("pn-modal").style.display="flex"}function F(){document.getElementById("pn-modal").style.display="none"}async function H(a){const t=typeof a=="string"?c.find(l=>l.id===a):a;if(!t)return;let e="";try{const d=await(await fetch("/icons/company-stamp.png")).blob();e=await new Promise(i=>{const r=new FileReader;r.onload=()=>i(r.result),r.readAsDataURL(d)})}catch{}const s=Z(t.issueDate),n=`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<title>سند الأمر — ${t.noteNumber}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Arial', 'Tahoma', sans-serif; background:#fff; color:#111;
         direction:rtl; padding:20px; font-size:13px; }
  .doc { max-width:720px; margin:0 auto; border:2px solid #333; border-radius:8px;
         padding:28px 32px; position:relative; }
  .header { display:flex; justify-content:space-between; align-items:flex-start;
             border-bottom:2px solid #444; padding-bottom:16px; margin-bottom:16px; }
  .header-right { text-align:right; }
  .header-left  { text-align:left;  }
  .doc-title    { font-size:26px; font-weight:900; color:#111; letter-spacing:1px; }
  .note-num     { font-size:13px; color:#555; margin-top:4px; }
  .section-head { background:#333; color:#fff; padding:8px 14px; border-radius:6px;
                  font-size:14px; font-weight:700; margin:16px 0 10px; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:8px 20px; }
  .field { display:flex; gap:6px; align-items:baseline; font-size:13px; }
  .field-label { color:#555; white-space:nowrap; min-width:120px; }
  .field-val   { font-weight:700; color:#111; }
  .amount-box  { border:1px solid #aaa; border-radius:6px; padding:10px 14px;
                 background:#f9f9f9; margin:10px 0; font-size:13px; }
  .pledge-box  { border:1px dashed #555; border-radius:8px; padding:14px 18px;
                 background:#fafafa; margin:16px 0; font-size:13px; line-height:1.9; }
  .sig-area { display:flex; justify-content:space-between; align-items:flex-end;
              margin-top:24px; gap:20px; }
  .sig-block { text-align:center; min-width:160px; }
  .sig-line { border-top:1px solid #333; margin-top:10px; padding-top:6px;
              font-size:11px; color:#555; }
  .stamp-area { position:relative; }
  .stamp-img  { width:120px; height:120px; object-fit:contain; opacity:0.85; }
  .footer { text-align:center; font-size:10px; color:#888;
            border-top:1px solid #ddd; margin-top:20px; padding-top:10px; }
  @media print {
    body { padding:8px; }
    .doc { border-radius:0; }
  }
</style>
</head>
<body>
<div class="doc">

  <!-- Header -->
  <div class="header">
    <div class="header-right">
      <div class="doc-title">سند لأمر</div>
      <div class="note-num">رقم السند: <strong>${t.noteNumber}</strong></div>
    </div>
    <div class="header-left" style="text-align:left;">
      <div style="font-size:15px; font-weight:800;">${t.companyName}</div>
      <div style="font-size:11px; color:#555;">س.ت: ${t.companyCR}</div>
      <div style="font-size:11px; color:#555;">المملكة العربية السعودية</div>
    </div>
  </div>

  <!-- Details -->
  <div class="section-head">تفاصيل السند</div>
  <div class="grid2">
    <div class="field"><span class="field-label">تاريخ الإنشاء :</span><span class="field-val">${s} هـ — الموافق ${t.issueDate} م</span></div>
    <div class="field"><span class="field-label">مدينة الإصدار :</span><span class="field-val">${t.issueCity}، المملكة العربية السعودية</span></div>
    <div class="field"><span class="field-label">مدينة الوفاء :</span><span class="field-val">${t.paymentCity}، المملكة العربية السعودية</span></div>
    <div class="field"><span class="field-label">تاريخ الاستحقاق :</span><span class="field-val">${t.dueDate}</span></div>
  </div>
  <div class="amount-box">
    <div class="field"><span class="field-label">قيمة السند رقماً :</span><span class="field-val">${t.amount.toLocaleString("ar-SA")} ريال سعودي لا غير</span></div>
    <div class="field" style="margin-top:6px;"><span class="field-label">قيمة السند كتابةً :</span><span class="field-val">${t.amountInWords}</span></div>
  </div>

  <!-- Debtor -->
  <div class="section-head">تفاصيل المدين (العميل)</div>
  <div class="grid2">
    <div class="field"><span class="field-label">الاسم :</span><span class="field-val">${t.customerName}</span></div>
    <div class="field"><span class="field-label">رقم الهوية/السجل :</span><span class="field-val">${t.customerIdNumber||"—"}</span></div>
  </div>

  <!-- Creditor -->
  <div class="section-head">تفاصيل الدائن (الشركة)</div>
  <div class="grid2">
    <div class="field"><span class="field-label">الاسم :</span><span class="field-val">${t.companyName}</span></div>
    <div class="field"><span class="field-label">رقم السجل التجاري :</span><span class="field-val">${t.companyCR}</span></div>
  </div>

  <!-- Pledge -->
  <div class="pledge-box">
    أتعهد بأن أدفع لأمر <strong>${t.companyName}</strong> دون قيد أو شرط مبلغاً وقدره
    (<strong>${t.amount.toLocaleString("ar-SA")}</strong>) ريال سعودي وفق البيانات المذكورة أعلاه.
    <br/>
    ولحامل هذا السند حق الرجوع دون أي مصاريف أو احتجاج بعدم الوفاء.
    ${t.notes?`<br/><em style="color:#555;">ملاحظة: ${t.notes}</em>`:""}
  </div>

  <!-- Signatures -->
  <div class="sig-area">
    <div class="sig-block">
      <div style="height:60px;"></div>
      <div class="sig-line">توقيع المدين<br/>${t.customerName}</div>
    </div>
    <div class="sig-block stamp-area">
      ${e?`<img src="${e}" class="stamp-img" alt="ختم الشركة"/>`:""}
      <div class="sig-line">ختم وتوقيع الدائن<br/>${t.companyName}</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    تاريخ الإصدار: ${t.issueDate} م — رقم السند: ${t.noteNumber}
    — ${t.companyName} — المملكة العربية السعودية
  </div>

</div>
<script>window.onload=()=>window.print();<\/script>
</body>
</html>`,o=window.open("","_blank","width=800,height=900");o?(o.document.write(n),o.document.close()):alert("يرجى السماح بالنوافذ المنبثقة للطباعة.")}function Z(a){if(!a)return"—";try{return new Intl.DateTimeFormat("ar-SA-u-ca-islamic",{year:"numeric",month:"long",day:"numeric"}).format(new Date(a)).replace(/\u06f\d/g,t=>t)}catch{return a}}v.promissoryNotes||(v.promissoryNotes=()=>O(f,`companies/${h}/promissoryNotes`));export{U as openNewNoteModal,it as render};
