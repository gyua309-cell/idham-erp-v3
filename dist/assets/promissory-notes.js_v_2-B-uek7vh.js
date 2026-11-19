const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css","assets/trust-receipts.js_v_2-C9I3kW4K.js","assets/debt-acknowledgment.js_v_2-H-BqRKEN.js","assets/goods-receipt-ack.js_v_1-CJv8-FcM.js"])))=>i.map(i=>d[i]);
import{d as x,a as h,C as E,g as O,f as N,c as K,_ as P,u as M}from"./index-CF9GFeRJ.js";import{getDoc as w,doc as I,getDocs as T,query as j,where as L,orderBy as H,collection as U}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";const A={active:{label:"نشط",color:"good",icon:"🟢"},paid:{label:"مسدد",color:"neutral",icon:"✅"},overdue:{label:"متأخر",color:"bad",icon:"🔴"},cancelled:{label:"ملغي",color:"neutral",icon:"⛔"}};let b=[],R=null;function G(n){if(!n||isNaN(n))return"صفر ريال سعودي";const t=["","واحد","اثنان","ثلاثة","أربعة","خمسة","ستة","سبعة","ثمانية","تسعة","عشرة","أحد عشر","اثنا عشر","ثلاثة عشر","أربعة عشر","خمسة عشر","ستة عشر","سبعة عشر","ثمانية عشر","تسعة عشر"],e=["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"],s=["","مئة","مئتان","ثلاثمئة","أربعمئة","خمسمئة","ستمئة","سبعمئة","ثمانمئة","تسعمئة"],a=["","ألف","ألفان","ثلاثة آلاف","أربعة آلاف","خمسة آلاف","ستة آلاف","سبعة آلاف","ثمانية آلاف","تسعة آلاف"],o=Math.floor(Math.abs(n)),r=Math.round((Math.abs(n)-o)*100);function i(u){if(u===0)return"";if(u<20)return t[u];const f=Math.floor(u/10),y=u%10;return y===0?e[f]:t[y]+" و"+e[f]}function l(u){if(u===0)return"صفر";let f="";const y=Math.floor(u/1e3),$=u%1e3,k=Math.floor($/100),B=$%100;return y>0&&(f+=y<10?a[y]:i(y)+" ألف",(k>0||B>0)&&(f+=" و")),k>0&&(f+=s[k],B>0&&(f+=" و")),B>0&&(f+=i(B)),f}const c=Math.floor(o/1e6),m=o%1e6;let d="";c>0&&(d+=l(c)+" مليون "),d+=l(m);let g=d.trim()+" ريال سعودي";return r>0&&(g+=" و"+l(r)+" هللة"),g+=" لا غير",g}async function Q(){const n=new Date().getFullYear(),t=await T(j(E.promissoryNotes(),L("noteNumber",">=",`PN-${n}-`),L("noteNumber","<=",`PN-${n}-z`),H("noteNumber","desc")));let e=1;if(!t.empty){const a=(t.docs[0].data().noteNumber||"").split("-"),o=parseInt(a[a.length-1]||"0",10);e=(isNaN(o)?0:o)+1}return`PN-${n}-${String(e).padStart(4,"0")}`}async function ft(n,t){if(R=t,n.innerHTML=`
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
        <button class="btn btn-secondary" style="background:#0284c7; color:#fff; border-color:#0284c7; font-weight:800;" onclick="openGoodsReceiptAckFromPn()" title="إقرار استلام بضاعة عينية وإقرار بمديونية ثمنها مرتبط بسند لأمر">📜 إقرار استلام بضاعة وسند لأمر</button>
        <button class="btn btn-secondary" style="border-color:#0284c7; color:#38bdf8;" onclick="openTrustReceiptFromPn()" title="إصدار سند أمانة وعهدة مالية (م/79)">🛡️ سند أمانة وعهدة</button>
        <button class="btn btn-secondary" style="border-color:#4338ca; color:#a5b4fc;" onclick="openDebtAcknowledgmentFromPn()" title="إصدار نموذج إقرار مديونية وتعهد بالتزام السداد">⚖️ إقرار مديونية وتعهد سداد</button>
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
    <div id="pn-modal" style="display:none; position:fixed; inset:0; z-index:1050; background:rgba(0,0,0,0.65); backdrop-filter:blur(4px); align-items:center; justify-content:center; padding:16px;" class="modal-overlay" onclick="if(event.target===this)closePnModal()">
      <div class="modal" style="max-width:650px; width:94vw; max-height:92vh; display:flex; flex-direction:column; overflow:hidden; border-radius:16px; background:var(--bg-1); border:1px solid var(--border); box-shadow:0 24px 64px rgba(0,0,0,0.45);">
        <div class="modal-header" style="flex-shrink:0; padding:16px 20px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; background:var(--bg-2);">
          <h2 class="modal-title" id="pn-modal-title" style="margin:0; font-size:17px; font-weight:800; display:flex; align-items:center; gap:8px;">📜 إصدار سند أمر جديد</h2>
          <button class="modal-close" onclick="closePnModal()" style="background:none; border:none; font-size:20px; cursor:pointer; color:var(--text-2); padding:4px 8px; border-radius:6px; line-height:1;">✕</button>
        </div>
        <div class="modal-body" id="pn-modal-body" style="flex:1; overflow-y:auto; padding:20px; min-height:0;"></div>
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
    `,document.head.appendChild(e)}window.filterNotes=V,window.openNewNoteModal=Z,window.closePnModal=q,window.savePnNote=at,window.markNoteAsPaid=st,window.cancelNote=it,window.printNote=W,window.viewNote=dt,await D()}async function D(){try{b=(await T(j(E.promissoryNotes(),H("createdAt","desc")))).docs.map(e=>({id:e.id,...e.data()}));const t=new Date().toISOString().slice(0,10);b.forEach(e=>{e.status==="active"&&e.dueDate&&e.dueDate!=="لدى الاطلاع"&&e.dueDate<t&&(e.status="overdue")}),X(),V()}catch(n){document.getElementById("pn-tbody").innerHTML=`<tr><td colspan="7" style="text-align:center;color:var(--text-bad);">${n.message}</td></tr>`}}function X(){const n=b.filter(o=>o.status==="active"),t=b.filter(o=>o.status==="overdue"),e=b.filter(o=>o.status==="paid"),s=n.reduce((o,r)=>o+(r.amount||0),0),a=t.reduce((o,r)=>o+(r.amount||0),0);document.getElementById("pn-kpis").innerHTML=`
    <div class="inv-kpi-card">
      <div class="inv-kpi-val">${n.length+t.length}</div>
      <div class="inv-kpi-label">سندات نشطة</div>
    </div>
    <div class="inv-kpi-card" style="border-color:var(--brand);">
      <div class="inv-kpi-val" style="color:var(--brand);">${N(s)}</div>
      <div class="inv-kpi-label">إجمالي المبالغ النشطة</div>
    </div>
    <div class="inv-kpi-card" style="border-color:#EF4444;">
      <div class="inv-kpi-val" style="color:#EF4444;">${t.length}</div>
      <div class="inv-kpi-label">سندات متأخرة — ${N(a)}</div>
    </div>
    <div class="inv-kpi-card">
      <div class="inv-kpi-val" style="color:#10B981;">${e.length}</div>
      <div class="inv-kpi-label">سندات مسددة</div>
    </div>
  `}function V(){const n=(document.getElementById("pn-search")?.value||"").trim().toLowerCase(),t=document.getElementById("pn-status-filter")?.value||"";let e=b;t&&(e=e.filter(a=>a.status===t)),n&&(e=e.filter(a=>(a.noteNumber||"").toLowerCase().includes(n)||(a.customerName||"").toLowerCase().includes(n)));const s=document.getElementById("pn-count");s&&(s.textContent=`${e.length} سند`),document.getElementById("pn-tbody").innerHTML=e.length===0?'<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد سندات مطابقة</td></tr>':e.map(a=>{const o=A[a.status]||A.active;return`<tr>
          <td class="mono font-bold" style="color:var(--brand); cursor:pointer;" onclick="viewNote('${a.id}')">${a.noteNumber||"—"}</td>
          <td><strong>${a.customerName||"—"}</strong></td>
          <td class="pn-amount-badge">${N(a.amount||0)}</td>
          <td class="mono dim">${a.issueDate||"—"}</td>
          <td class="mono dim">${a.dueDate||"—"}</td>
          <td><span class="pn-status-badge pn-status-${a.status}">${o.icon} ${o.label}</span></td>
          <td style="text-align:center;">
            <div style="display:flex; gap:4px; justify-content:center; flex-wrap:wrap;">
              <button class="btn btn-icon sm btn-ghost" onclick="printNote('${a.id}')" title="طباعة السند">🖨️</button>
              <button class="btn btn-icon sm btn-ghost" onclick="openGoodsReceiptAckForNote('${a.id}')" title="إقرار استلام بضاعة عينية مرتبط بهذا السند" style="color:#0284c7;">📜</button>
              ${a.status==="active"||a.status==="overdue"?`<button class="btn btn-icon sm" style="background:rgba(16,185,129,.12);color:#059669;border:1px solid rgba(16,185,129,.25);" onclick="markNoteAsPaid('${a.id}')" title="تسديد السند">✅ تسديد</button>
                   <button class="btn btn-icon sm btn-ghost text-bad" onclick="cancelNote('${a.id}')" title="إلغاء السند">⛔</button>`:""}
            </div>
          </td>
        </tr>`}).join("")}async function Z(n=null,t=null){let e="ينبع",s="شركة نظم الإمداد المتطورة",a="7054969006";try{const l=window.ERP_COMPANY||JSON.parse(localStorage.getItem("idham_company")||"{}");l.name&&(s=l.name),(l.crNumber||l.cr)&&(a=l.crNumber||l.cr),l.city&&(e=l.city);const c=await w(I(x,`companies/${h}/settings`,"company"));if(c.exists()){const m=c.data();s=m.name||m.companyName||s,a=m.cr||m.crNumber||a,e=m.city||e}}catch(l){console.warn("Could not load company settings in promissory notes:",l)}const o=await Q(),r=new Date().toISOString().slice(0,10);if(document.getElementById("pn-modal-title").textContent="📜 إصدار سند أمر جديد",document.getElementById("pn-modal-body").innerHTML=`
    <form id="pn-form" onsubmit="savePnNote(event)" autocomplete="off" style="display:flex; flex-direction:column; height:100%; min-height:0;">
      <div id="pn-error" class="alert bad" style="display:none; margin-bottom:14px; font-weight:700; padding:10px 14px; border-radius:8px; font-size:13px;"></div>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; overflow-y:auto; padding-bottom:14px; padding-left:2px; padding-right:2px;">

        <div class="form-group">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">رقم السند (تلقائي)</label>
          <input class="input mono" id="pn-num" value="${o}" readonly style="background:var(--bg-2); font-weight:700; color:var(--brand);"/>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">تاريخ الإصدار *</label>
          <input class="input" type="date" id="pn-issue-date" value="${r}" required/>
        </div>

        <div class="form-group" style="grid-column:1/-1;">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">العميل (المدين) * <span class="text-warn" style="font-size:11px;">(اضغط للاختيار من القائمة)</span></label>
          <div style="position:relative;">
            <input class="input" id="pn-cust-search" placeholder="🔍 اضغط هنا لاختيار عميل أو اكتب للبحث…"
                   onfocus="searchPnCustomer(this.value)"
                   oninput="searchPnCustomer(this.value)" autocomplete="off"
                   value="${t||""}"/>
            <div id="pn-cust-dropdown" style="
              position:absolute; top:calc(100% + 4px); right:0; left:0; background:var(--bg-1);
              border:1px solid var(--border); border-radius:10px; z-index:250;
              max-height:220px; overflow-y:auto; display:none; box-shadow:0 12px 30px rgba(0,0,0,0.3);
            "></div>
          </div>
          <input type="hidden" id="pn-cust-id" value="${n||""}"/>
          <input type="hidden" id="pn-cust-credit-limit" value="0"/>
          <input type="hidden" id="pn-cust-balance" value="0"/>
          <div id="pn-credit-bar" style="display:none; margin-top:6px;"></div>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">رقم هوية / سجل تجاري العميل</label>
          <input class="input mono" id="pn-cust-id-num" placeholder="1234567890"/>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">رقم جوال العميل</label>
          <input class="input mono" id="pn-cust-phone" placeholder="05xxxxxxxx"/>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">الرقم الضريبي للعميل (VAT)</label>
          <input class="input mono" id="pn-cust-vat" placeholder="300000000000003"/>
        </div>

        <!-- Authorized Signatory Details Card -->
        <div style="grid-column:1/-1; background:rgba(2, 132, 199, 0.05); padding:12px 14px; border-radius:10px; border:1px solid rgba(2, 132, 199, 0.25);">
          <div style="font-weight:800; font-size:12.5px; color:#0369a1; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
            <span>✍️</span> <span>بيانات الشخص المفوض بالتوقيع (المسؤول التنفيذي عن المنشأة المدينة)</span>
          </div>
          <div style="display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr; gap:8px;">
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">اسم المفوض بالتوقيع *</label>
              <input class="input" id="pn-cust-resp" placeholder="الاسم الرباعي للمفوض" style="font-size:12.5px;"/>
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">رقم هوية المفوض *</label>
              <input class="input mono font-bold" id="pn-cust-resp-id" placeholder="10xxxxxxxx" style="font-size:12.5px;"/>
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">صفة المفوض</label>
              <input class="input" id="pn-cust-resp-role" placeholder="المدير العام / وكيل شرعي" value="المدير العام المفوض" style="font-size:12.5px;"/>
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:3px;">جوال المفوض</label>
              <input class="input mono font-bold" id="pn-cust-resp-phone" placeholder="05xxxxxxxx" style="font-size:12.5px;"/>
            </div>
          </div>
        </div>

        <div class="form-group" style="grid-column:1/-1;">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">العنوان الوطني للمدين (المختار للتبليغ القضائي)</label>
          <input class="input" id="pn-cust-address" placeholder="المدينة — الحي — الشارع — الرمز البريدي"/>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">المبلغ (رقماً) *</label>
          <input class="input mono font-bold" type="number" id="pn-amount" min="1" step="0.01"
                 placeholder="0.00" required oninput="updateAmountWords()"/>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">تاريخ الاستحقاق</label>
          <div style="display:flex; gap:6px; align-items:center;">
            <input class="input" type="date" id="pn-due-date" style="flex:1;"/>
            <label style="white-space:nowrap; font-size:12px; display:flex; align-items:center; gap:4px; cursor:pointer;">
              <input type="checkbox" id="pn-on-demand" onchange="toggleDueDate(this)"/> لدى الاطلاع
            </label>
          </div>
        </div>

        <div class="form-group" style="grid-column:1/-1;">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">المبلغ كتابةً (تلقائي)</label>
          <input class="input" id="pn-amount-words" readonly style="background:var(--bg-2); font-size:12px; font-weight:600;" placeholder="—"/>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">مدينة الإصدار (مكان الإنشاء)</label>
          <input class="input" id="pn-issue-city" value="${e}"/>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">مدينة الوفاء (مكان الوفاء)</label>
          <input class="input" id="pn-pay-city" value="${e}"/>
        </div>

        <!-- كفيل غارم متضامن (اختياري) -->
        <div style="grid-column:1/-1; background:rgba(79,70,229,0.04); padding:10px 14px; border-radius:8px; border:1px solid rgba(79,70,229,0.2);">
          <div style="font-weight:700; font-size:12px; color:var(--brand); margin-bottom:8px;">🤝 بيانات الكفيل الغارم المتضامن (اختياري لتعزيز الضمان القانوني)</div>
          <div style="display:grid; grid-template-columns:1.5fr 1fr 1fr; gap:8px;">
            <input class="input" id="pn-guar-name" placeholder="اسم الكفيل الغارم الرباعي" style="font-size:12px;"/>
            <input class="input mono" id="pn-guar-id" placeholder="رقم هوية الكفيل" style="font-size:12px;"/>
            <input class="input mono" id="pn-guar-phone" placeholder="جوال الكفيل" style="font-size:12px;"/>
          </div>
        </div>

        <div class="form-group" style="grid-column:1/-1;">
          <label class="form-label" style="font-weight:700; font-size:12px; margin-bottom:4px;">ملاحظات / سبب السند</label>
          <textarea class="input" id="pn-notes" rows="2" style="resize:vertical;"
                    placeholder="ضمان سداد مسحوبات بضاعة آجلة / فاتورة رقم …"></textarea>
        </div>

      </div>

      <!-- Hidden company fields -->
      <input type="hidden" id="pn-company-name" value="${s}"/>
      <input type="hidden" id="pn-company-cr"   value="${a}"/>

      <div class="modal-footer" style="flex-shrink:0; margin-top:auto; padding-top:14px; border-top:1px solid var(--border); display:flex; gap:10px; justify-content:flex-end; background:var(--bg-1);">
        <button type="button" class="btn btn-secondary" onclick="closePnModal()" style="font-weight:600; padding:9px 18px;">إلغاء</button>
        <button type="submit" class="btn btn-primary" id="btn-save-pn" style="font-weight:700; padding:10px 24px; font-size:14px; background:linear-gradient(135deg, #4f46e5, #4338ca); color:#fff; border:none; box-shadow:0 2px 8px rgba(79,70,229,0.35); display:inline-flex; align-items:center; gap:8px;">
          <span>📜</span> <span>إصدار سند الأمر وحفظه</span>
        </button>
      </div>
    </form>
  `,window.searchPnCustomer=nt,window.selectPnCustomer=ot,window.updateAmountWords=et,window.toggleDueDate=tt,n)try{const l=await w(I(x,`companies/${h}/customers`,n));if(l.exists()){const c=l.data();document.getElementById("pn-cust-id-num").value=c.idNumber||c.crNumber||"",document.getElementById("pn-cust-credit-limit").value=c.creditLimit||0,document.getElementById("pn-cust-balance").value=c.balance||0,F(c.creditLimit||0,c.balance||0,0)}}catch{}const i=document.getElementById("pn-modal");i&&(i.classList.add("active"),i.style.display="flex")}function tt(n){const t=document.getElementById("pn-due-date");t.disabled=n.checked,n.checked&&(t.value="")}function et(){const n=parseFloat(document.getElementById("pn-amount")?.value||0),t=document.getElementById("pn-amount-words");t&&(t.value=n>0?G(n):"");const e=parseFloat(document.getElementById("pn-cust-credit-limit")?.value||0),s=parseFloat(document.getElementById("pn-cust-balance")?.value||0);F(e,s,n)}function F(n,t,e){const s=document.getElementById("pn-credit-bar");if(!s)return;if(n<=0){s.style.display="none";return}const a=t+e,o=Math.min(a/n*100,100),r=a>n;s.style.display="block",s.innerHTML=`
    <div style="font-size:11px; color:${r?"#DC2626":"var(--text-2)"}; margin-bottom:4px;">
      ${r?"⚠️ تجاوز حد الائتمان!":"📊 الائتمان المستخدم"}
      ${N(a)} / ${N(n)}
    </div>
    <div style="height:6px; background:var(--bg-3); border-radius:4px; overflow:hidden;">
      <div style="height:100%; width:${o}%; background:${r?"#EF4444":o>80?"#F59E0B":"#10B981"}; border-radius:4px; transition:.3s;"></div>
    </div>
  `}async function nt(n){const t=document.getElementById("pn-cust-dropdown");if(!t)return;const e=(n||"").trim().toLowerCase();try{const a=(await O(E.customers())).filter(o=>!e||(o.name||"").toLowerCase().includes(e)||(o.phone||"").includes(e)||(o.idNumber||"").includes(e)||(o.crNumber||"").includes(e)).slice(0,12);if(!a.length){t.innerHTML='<div style="padding:12px; text-align:center; color:var(--text-2); font-size:12px;">لا يوجد عميل مطابق</div>',t.style.display="block";return}t.innerHTML=a.map(o=>{const r=(o.name||"").replace(/'/g,"\\'"),i=[o.address,o.street,o.district,o.city].filter(Boolean).join(" — ").replace(/'/g,"\\'"),l=o.idNumber||o.crNumber||"",c=o.phone||o.mobile||"",m=o.vatNumber||"",d=(o.ownerName||o.contactPerson||o.responsiblePerson||"").replace(/'/g,"\\'"),g=(o.guarantor||o.guarantorName||"").replace(/'/g,"\\'"),u=(o.guarantorId||"").replace(/'/g,"\\'"),f=(o.guarantorPhone||"").replace(/'/g,"\\'");return`
      <div class="autocomplete-item"
           onclick="selectPnCustomer('${o.id}','${r}','${l}',${o.creditLimit||0},${o.balance||0},'${c}','${i}','${m}','${d}','${g}','${u}','${f}')"
           style="padding:10px 14px; cursor:pointer; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="color:var(--text-1); font-size:13px;">${o.name}</strong>
          <div style="font-size:11px; color:var(--text-2); margin-top:2px;">${l?"هوية/سجل: "+l:""} ${c?" | هاتف: "+c:""} ${o.city?" | "+o.city:""}</div>
        </div>
        <div style="text-align:left; font-size:11px;" class="dim">
          <span>الرصيد: ${N(o.balance||0)}</span>
        </div>
      </div>`}).join(""),t.style.display="block"}catch(s){console.warn("[PN] searchPnCustomer error:",s)}}function ot(n,t,e,s,a,o="",r="",i="",l="",c="",m="",d=""){document.getElementById("pn-cust-search").value=t,document.getElementById("pn-cust-id").value=n,e&&(document.getElementById("pn-cust-id-num").value=e),document.getElementById("pn-cust-phone")&&(document.getElementById("pn-cust-phone").value=o),document.getElementById("pn-cust-address")&&(document.getElementById("pn-cust-address").value=r),document.getElementById("pn-cust-vat")&&(document.getElementById("pn-cust-vat").value=i),document.getElementById("pn-cust-resp")&&(document.getElementById("pn-cust-resp").value=l),document.getElementById("pn-guar-name")&&(document.getElementById("pn-guar-name").value=c),document.getElementById("pn-guar-id")&&(document.getElementById("pn-guar-id").value=m),document.getElementById("pn-guar-phone")&&(document.getElementById("pn-guar-phone").value=d),document.getElementById("pn-cust-credit-limit").value=s,document.getElementById("pn-cust-balance").value=a;const g=document.getElementById("pn-cust-dropdown");g&&(g.style.display="none");const u=document.getElementById("pn-error");u&&(u.style.display="none");const f=parseFloat(document.getElementById("pn-amount")?.value||0);F(s,a,f)}document.addEventListener("click",n=>{if(!n.target.closest("#pn-cust-search")&&!n.target.closest("#pn-cust-dropdown")){const t=document.getElementById("pn-cust-dropdown");t&&(t.style.display="none")}});async function at(n){n.preventDefault();const t=document.getElementById("btn-save-pn")||n.submitter||document.querySelector("#pn-form button[type='submit']"),e=document.getElementById("pn-error");e&&(e.style.display="none",e.textContent=""),t&&(t.disabled=!0,t.innerHTML="<span>⏳</span> <span>جاري إصدار السند وحفظه…</span>");try{let s=document.getElementById("pn-cust-id")?.value,a=document.getElementById("pn-cust-search")?.value?.trim()||"",o=document.getElementById("pn-cust-id-num")?.value?.trim()||"";if(!s&&(a||o))try{const d=(await O(E.customers())).find(g=>!!(a&&(g.name||"").trim().toLowerCase()===a.toLowerCase()||o&&(g.idNumber===o||g.crNumber===o)));d&&(s=d.id,a=d.name,document.getElementById("pn-cust-id").value=s,document.getElementById("pn-cust-search").value=a,o||(o=d.idNumber||d.crNumber||"",document.getElementById("pn-cust-id-num").value=o),document.getElementById("pn-cust-phone")&&!document.getElementById("pn-cust-phone").value&&(document.getElementById("pn-cust-phone").value=d.phone||d.mobile||""),document.getElementById("pn-cust-address")&&!document.getElementById("pn-cust-address").value&&(document.getElementById("pn-cust-address").value=[d.address,d.street,d.district,d.city].filter(Boolean).join(" — ")||d.city||""),document.getElementById("pn-cust-vat")&&!document.getElementById("pn-cust-vat").value&&(document.getElementById("pn-cust-vat").value=d.vatNumber||""),document.getElementById("pn-cust-resp")&&!document.getElementById("pn-cust-resp").value&&(document.getElementById("pn-cust-resp").value=d.ownerName||d.contactPerson||d.responsiblePerson||""))}catch{}if(!s)throw new Error("يرجى اختيار العميل (المدين) من القائمة المنسدلة للعملاء");const r=parseFloat(document.getElementById("pn-amount").value);if(!r||isNaN(r)||r<=0)throw new Error("يرجى إدخال مبلغ صحيح لسند الأمر (أكبر من صفر)");const l=document.getElementById("pn-on-demand").checked?"لدى الاطلاع":document.getElementById("pn-due-date").value||"لدى الاطلاع",c={noteNumber:document.getElementById("pn-num").value,customerId:s,customerName:a,customerIdNumber:document.getElementById("pn-cust-id-num").value||o||"—",customerPhone:document.getElementById("pn-cust-phone")?.value||"",customerAddress:document.getElementById("pn-cust-address")?.value||"",customerVat:document.getElementById("pn-cust-vat")?.value||"",contactPerson:document.getElementById("pn-cust-resp")?.value||"",contactPersonId:document.getElementById("pn-cust-resp-id")?.value||"",contactPersonRole:document.getElementById("pn-cust-resp-role")?.value||"",contactPersonPhone:document.getElementById("pn-cust-resp-phone")?.value||"",guarantorName:document.getElementById("pn-guar-name")?.value||"",guarantorId:document.getElementById("pn-guar-id")?.value||"",guarantorPhone:document.getElementById("pn-guar-phone")?.value||"",companyName:document.getElementById("pn-company-name").value,companyCR:document.getElementById("pn-company-cr").value,amount:r,amountInWords:G(r),issueDate:document.getElementById("pn-issue-date").value,dueDate:l,issueCity:document.getElementById("pn-issue-city").value,paymentCity:document.getElementById("pn-pay-city").value,notes:document.getElementById("pn-notes").value,status:"active",createdBy:R?.displayName||R?.name||"النظام",createdAt:new Date().toISOString()};await K("promissoryNotes",c);try{const{update:m}=await P(async()=>{const{update:g}=await import("./index-CF9GFeRJ.js").then(u=>u.T);return{update:g}},__vite__mapDeps([0,1])),d=await w(I(x,`companies/${h}/customers`,s));if(d.exists()){const g=d.data().promissoryBalance||0;await m("customers",s,{promissoryBalance:g+r})}}catch(m){console.warn("[PN] could not update promissoryBalance:",m)}if(q(),await D(),confirm(`✅ تم إصدار سند الأمر بنجاح!
هل تريد طباعته الآن؟`)){const m=b.find(d=>d.noteNumber===c.noteNumber);m&&W(m.id)}}catch(s){e?(e.textContent="⚠️ "+s.message,e.style.display="block",e.scrollIntoView({behavior:"smooth",block:"nearest"})):alert("❌ "+s.message)}finally{t&&(t.disabled=!1,t.innerHTML="<span>📜</span> <span>إصدار سند الأمر وحفظه</span>")}}async function st(n){const t=b.find(e=>e.id===n);if(t&&confirm(`✅ تأكيد تسديد سند الأمر رقم ${t.noteNumber}
المبلغ: ${N(t.amount)}
للعميل: ${t.customerName}`))try{await M("promissoryNotes",n,{status:"paid",paidDate:new Date().toISOString().slice(0,10)});try{const e=await w(I(x,`companies/${h}/customers`,t.customerId));if(e.exists()){const s=e.data().promissoryBalance||0;await M("customers",t.customerId,{promissoryBalance:Math.max(0,s-t.amount)})}}catch{}await D()}catch(e){alert("❌ "+e.message)}}async function it(n){const t=b.find(e=>e.id===n);if(t&&confirm(`⛔ إلغاء سند الأمر رقم ${t.noteNumber}؟
هذا الإجراء لا يمكن التراجع عنه.`))try{await M("promissoryNotes",n,{status:"cancelled"});try{const e=await w(I(x,`companies/${h}/customers`,t.customerId));if(e.exists()){const s=e.data().promissoryBalance||0;await M("customers",t.customerId,{promissoryBalance:Math.max(0,s-t.amount)})}}catch{}await D()}catch(e){alert("❌ "+e.message)}}function dt(n){const t=b.find(a=>a.id===n);if(!t)return;const e=A[t.status]||A.active;document.getElementById("pn-modal-title").textContent=`📜 سند الأمر — ${t.noteNumber}`,document.getElementById("pn-modal-body").innerHTML=`
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:13px;">
      <div><span class="dim">رقم السند:</span> <strong>${t.noteNumber}</strong></div>
      <div><span class="dim">الحالة:</span> <span class="pn-status-badge pn-status-${t.status}">${e.icon} ${e.label}</span></div>
      <div><span class="dim">العميل:</span> <strong>${t.customerName}</strong></div>
      <div><span class="dim">رقم الهوية/السجل:</span> ${t.customerIdNumber||"—"}</div>
      <div><span class="dim">المبلغ:</span> <strong style="color:var(--brand);">${N(t.amount)}</strong></div>
      <div><span class="dim">تاريخ الإصدار:</span> ${t.issueDate}</div>
      <div><span class="dim">الاستحقاق:</span> ${t.dueDate}</div>
      <div><span class="dim">مدينة الإصدار:</span> ${t.issueCity}</div>
      <div style="grid-column:1/-1;"><span class="dim">المبلغ كتابةً:</span> <em>${t.amountInWords}</em></div>
      ${t.notes?`<div style="grid-column:1/-1;"><span class="dim">ملاحظات:</span> ${t.notes}</div>`:""}
    </div>
    <div class="modal-footer" style="margin-top:16px; display:flex; gap:8px; justify-content:flex-end;">
      <button class="btn btn-secondary" onclick="closePnModal()">إغلاق</button>
      <button class="btn btn-primary" onclick="closePnModal();printNote('${n}')">🖨️ طباعة السند</button>
    </div>
  `;const s=document.getElementById("pn-modal");s&&(s.classList.add("active"),s.style.display="flex")}function q(){const n=document.getElementById("pn-modal");n&&(n.classList.remove("active"),n.style.display="none")}async function W(n){const t=typeof n=="string"?b.find(p=>p.id===n):n;if(!t)return;let e="شركة نظم الإمداد المتطورة",s="7054969006",a="";try{const p=window.ERP_COMPANY||JSON.parse(localStorage.getItem("idham_company")||"{}");p.name&&(e=p.name),(p.crNumber||p.cr)&&(s=p.crNumber||p.cr),(p.logoUrl||p.logoBase64||p.dataUrl)&&(a=p.logoUrl||p.logoBase64||p.dataUrl);const[z,C]=await Promise.all([w(I(x,`companies/${h}/settings`,"company")),w(I(x,`companies/${h}/settings`,"logo"))]);if(z.exists()){const v=z.data();e=v.name||v.companyName||e,s=v.cr||v.crNumber||s,!a&&(v.logoUrl||v.logoBase64)&&(a=v.logoUrl||v.logoBase64)}if(C.exists()){const v=C.data();a=v.dataUrl||v.logoBase64||v.url||v.logoUrl||a}}catch{}const o=!t.companyName||t.companyName.includes("الحديثة")?e:t.companyName,r=!t.companyCR||t.companyCR==="4700123180"||t.companyCR==="4700124180"?s:t.companyCR;let i={};if(t.customerId)try{const p=await w(I(x,`companies/${h}/customers`,t.customerId));p.exists()&&(i=p.data())}catch{}if(!i.name&&t.customerName)try{const p=await T(j(U(x,`companies/${h}/customers`),L("name","==",t.customerName)));p.empty||(i=p.docs[0].data())}catch{}const l=t.customerName||i.name||"—",c=t.customerIdNumber&&t.customerIdNumber!=="—"?t.customerIdNumber:i.crNumber||i.idNumber||i.nationalId||"—",m=t.customerVat||i.vatNumber||"—",d=t.customerPhone||i.phone||i.mobile||"—",g=t.customerAddress||[i.address,i.street,i.district,i.city,i.postalCode].filter(Boolean).join(" — ")||i.city||"ينبع — المملكة العربية السعودية",u=t.contactPerson||i.ownerName||i.managerName||i.responsiblePerson||i.contactPerson||l,f=t.contactPersonId||i.responsiblePersonId||i.ownerId||"",y=t.contactPersonRole||i.responsiblePersonRole||"المدير العام المفوض";t.contactPersonPhone||i.responsiblePersonPhone;const $=t.guarantorName||i.guarantor||i.guarantorName||"",k=t.guarantorId||i.guarantorId||"",B=t.guarantorPhone||i.guarantorPhone||"";let S="";try{const z=await(await fetch("/icons/company-stamp.png?t="+Date.now())).blob();S=await new Promise(C=>{const v=new FileReader;v.onload=()=>C(v.result),v.readAsDataURL(z)})}catch{}const Y=lt(t.issueDate),J=`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<title>سند لأمر تنفيذي — ${t.noteNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@600;700&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Cairo', 'Arial', sans-serif; background:#f1f5f9; color:#0f172a;
         direction:rtl; padding:20px; font-size:12.5px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .doc { max-width:780px; margin:0 auto; background:#fff; border:3px double #004d80; border-radius:10px;
         padding:26px 30px; position:relative; box-shadow:0 10px 30px rgba(0,0,0,0.08); }
  
  .header { display:flex; justify-content:space-between; align-items:center;
             border-bottom:2px solid #004d80; padding-bottom:14px; margin-bottom:14px; gap:12px; }
  .hdr-col { flex:1.1; }
  .hdr-center { text-align:center; flex:1.2; }
  .hdr-left { text-align:left; direction:rtl; min-width:215px; }

  .doc-title { font-size:26px; font-weight:900; color:#004d80; letter-spacing:1px; line-height:1.2; }
  .doc-subtitle { font-size:11px; font-weight:700; color:#475569; margin-top:3px; }
  .note-badge { display:inline-block; margin-top:6px; background:#f0f9ff; border:1px solid #0284c7; color:#0369a1; padding:3px 12px; border-radius:20px; font-weight:800; font-size:12px; font-family:'IBM Plex Mono', monospace; }

  .amount-banner { background:linear-gradient(135deg, #004d80 0%, #0369a1 100%); color:#fff; border-radius:8px;
                   padding:12px 18px; margin:14px 0; display:flex; justify-content:space-between; align-items:center; }
  .amount-val { font-size:22px; font-weight:900; font-family:'IBM Plex Mono', monospace; letter-spacing:0.5px; }
  .amount-words { font-size:13px; font-weight:700; color:#e0f2fe; margin-top:3px; }

  .section-head { background:#0f172a; color:#fff; padding:6px 12px; border-radius:6px;
                  font-size:12.5px; font-weight:800; margin:14px 0 8px; display:flex; justify-content:space-between; align-items:center; }
  
  .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:8px 18px; }
  .grid-party { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
  .party-card { border:1.5px solid #cbd5e1; border-radius:8px; padding:10px 14px; background:#f8fafc; }
  .party-card.creditor { border-color:#0284c7; background:#f0f9ff; }
  .party-card.debtor { border-color:#64748b; background:#fff; }
  .party-title { font-size:12.5px; font-weight:900; color:#004d80; margin-bottom:8px; border-bottom:1px dashed #cbd5e1; padding-bottom:4px; display:flex; justify-content:space-between; }
  
  .field { display:flex; gap:6px; align-items:baseline; font-size:12px; margin-bottom:4px; }
  .field-label { color:#475569; white-space:nowrap; min-width:115px; font-weight:600; }
  .field-val { font-weight:700; color:#0f172a; word-break:break-word; }
  .mono { font-family:'IBM Plex Mono', monospace; }

  .pledge-box { border:2px dashed #004d80; border-radius:8px; padding:14px 18px;
                 background:#faf5ff; margin:14px 0; font-size:12px; line-height:1.8; color:#1e1b4b; }
  .pledge-title { font-size:13px; font-weight:900; color:#4338ca; margin-bottom:6px; }
  .legal-bullets { margin-top:8px; padding-right:16px; font-size:11px; color:#334155; line-height:1.7; }

  .sig-area { display:grid; grid-template-columns:${$?"1.2fr 1.2fr 1fr":"1.3fr 1fr"}; gap:14px; margin-top:18px; }
  .sig-box { border:1.5px solid #94a3b8; border-radius:8px; padding:10px 12px; background:#fff; text-align:center; position:relative; }
  .sig-box-title { font-size:12px; font-weight:800; color:#0f172a; margin-bottom:8px; border-bottom:1px solid #e2e8f0; padding-bottom:4px; }
  .sig-meta { font-size:11px; text-align:right; color:#475569; margin-bottom:8px; line-height:1.5; }
  .sig-meta strong { color:#0f172a; }
  .thumb-box { width:65px; height:60px; border:1.5px dashed #94a3b8; border-radius:6px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:9.5px; margin:0 auto; background:#f8fafc; }
  .sig-line { border-top:1px solid #475569; margin-top:8px; padding-top:4px; font-size:10.5px; color:#475569; font-weight:700; }

  .stamp-img { width:155px; height:155px; max-width:165px; max-height:165px; object-fit:contain; filter:drop-shadow(0 2px 6px rgba(0,0,0,0.18)); }

  .footer { text-align:center; font-size:10px; color:#64748b; border-top:1px solid #e2e8f0; margin-top:18px; padding-top:8px; line-height:1.4; }

  @media print {
    body { padding:0; background:#fff; }
    .doc { box-shadow:none; border-width:2px; max-width:100%; border-radius:0; padding:16px 20px; }
    .no-print { display:none !important; }
  }
</style>
</head>
<body>

<div class="doc">

  <!-- Top Action (Print helper) -->
  <div class="no-print" style="margin-bottom:14px; text-align:center; display:flex; gap:10px; justify-content:center;">
    <button onclick="window.print()" style="background:#004d80; color:#fff; font-weight:800; border:none; padding:8px 22px; border-radius:6px; cursor:pointer; font-family:inherit;">🖨️ طباعة سند الأمر التنفيذي</button>
  </div>

  <!-- Header -->
  <div class="header">
    <div class="hdr-col" style="text-align:right; display:flex; align-items:center; gap:10px;">
      ${a?`<img src="${a}" style="max-height:75px; max-width:160px; object-fit:contain;" alt="شعار الشركة"/>`:`
        <div style="width:65px; height:65px; border-radius:10px; background:linear-gradient(135deg, #004d80, #0284c7); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; font-size:20px;">نظم الإمداد</div>
      `}
    </div>
    <div class="hdr-center">
      <div class="doc-title">سـنـد لأمـر</div>
      <div class="doc-subtitle">سند تنفيذي واجب النفاذ دون قيد أو شرط</div>
      <div class="note-badge">رقم السند: ${t.noteNumber}</div>
    </div>
    <div class="hdr-col hdr-left" style="text-align:left; direction:rtl; min-width:215px;">
      <div style="font-size:14.5px; font-weight:900; color:#004d80; white-space:nowrap; letter-spacing:0.2px;">${o}</div>
      <div style="font-size:11px; color:#475569; font-weight:700; white-space:nowrap; margin-top:2px;">س.ت: <span class="mono">${r}</span></div>
      <div style="font-size:11px; color:#475569; font-weight:700; white-space:nowrap;">الرقم الضريبي: <span class="mono">314996148100003</span></div>
      <div style="font-size:10px; color:#64748b; margin-top:2px; white-space:nowrap;">ينبع — المملكة العربية السعودية</div>
    </div>
  </div>

  <!-- Note Terms & Dates -->
  <div class="section-head">
    <span>📌 البيانات المكانية والزمنية للسند</span>
    <span style="font-size:11px; font-weight:600;">(مستوفٍ لكافة أركان المادة 87 من نظام الأوراق التجارية)</span>
  </div>
  <div class="grid-2" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px;">
    <div class="field"><span class="field-label">تاريخ الإنشاء :</span><span class="field-val">${Y} هـ — الموافق <span class="mono">${t.issueDate}</span> م</span></div>
    <div class="field"><span class="field-label">مكان الإنشاء (مدينة الإصدار) :</span><span class="field-val">${t.issueCity||"ينبع"}، المملكة العربية السعودية</span></div>
    <div class="field"><span class="field-label">ميعاد الاستحقاق :</span><span class="field-val" style="color:#b91c1c; font-size:13px;">${t.dueDate}</span></div>
    <div class="field"><span class="field-label">مكان الوفاء (مدينة الأداء) :</span><span class="field-val">${t.paymentCity||"ينبع"}، المملكة العربية السعودية</span></div>
  </div>

  <!-- Amount Banner -->
  <div class="amount-banner">
    <div>
      <div style="font-size:11.5px; opacity:0.9; font-weight:700;">مبلغ السند الواجب الأداء دون قيد أو شرط :</div>
      <div class="amount-val">${t.amount.toLocaleString("ar-SA")} ريال سعودي</div>
    </div>
    <div style="text-align:left; max-width:55%;">
      <div style="font-size:11px; opacity:0.9; font-weight:700;">المبلغ تفقيطاً بالكلمات :</div>
      <div class="amount-words">${t.amountInWords} لا غير</div>
    </div>
  </div>

  <!-- Parties Grid: Creditor & Debtor -->
  <div class="grid-party">
    
    <!-- Creditor -->
    <div class="party-card creditor">
      <div class="party-title">
        <span>🏢 بيانات الدائن (المستفيد / صاحب الحق)</span>
      </div>
      <div class="field"><span class="field-label">اسم المنشأة :</span><span class="field-val">${o}</span></div>
      <div class="field"><span class="field-label">السجل التجاري :</span><span class="field-val mono">${r}</span></div>
      <div class="field"><span class="field-label">الرقم الضريبي :</span><span class="field-val mono">314996148100003</span></div>
      <div class="field"><span class="field-label">العنوان المعتمد :</span><span class="field-val">مبنى 7689 — شارع ينبع الصناعية 2179 — حي غرناطة — ينبع</span></div>
      <div class="field"><span class="field-label">رقم الهاتف :</span><span class="field-val mono">0549141648</span></div>
    </div>

    <!-- Debtor -->
    <div class="party-card debtor">
      <div class="party-title">
        <span>👤 بيانات المدين (محرر السند / الملتزم بالسداد)</span>
      </div>
      <div class="field"><span class="field-label">اسم العميل / المنشأة :</span><span class="field-val">${l}</span></div>
      <div class="field"><span class="field-label">السجل / الهوية :</span><span class="field-val mono">${c}</span></div>
      <div class="field"><span class="field-label">الرقم الضريبي :</span><span class="field-val mono">${m}</span></div>
      <div class="field"><span class="field-label">العنوان الوطني المعتمد :</span><span class="field-val">${g}</span></div>
      <div class="field"><span class="field-label">رقم الجوال :</span><span class="field-val mono">${d}</span></div>
      <div class="field"><span class="field-label">المفوض بالتوقيع :</span><span class="field-val">${u} ${`(${y})`}</span></div>
      ${f?`<div class="field"><span class="field-label">هوية المفوض :</span><span class="field-val mono">${f}</span></div>`:""}
    </div>

  </div>

  <!-- Legal Undertaking / Pledge -->
  <div class="pledge-box">
    <div class="pledge-title">📜 التعهد الصارم والآثار القضائية والتنفيذية الملزمة:</div>
    <p>
      أتعهد أنا الموقع أدناه (<strong>المدين / محرر السند</strong>) بكامل أهليتي المعتبرة شرعاً ونظاماً بأن أدفع بموجب هذا السند ودون قيد أو شرط لأمر الدائن:
      <strong style="color:#004d80; font-size:13.5px;">${o}</strong> (سجل تجاري رقم: <strong class="mono">${r}</strong>)،
      في مدينة الوفاء (<strong>${t.paymentCity||"ينبع"}</strong>)، مبلغاً وقدره:
      <strong style="color:#b91c1c; font-size:14.5px;">( ${t.amount.toLocaleString("ar-SA")} ريال سعودي )</strong>
      فقط وقدره <strong>${t.amountInWords}</strong> لا غير، وذلك في ميعاد الاستحقاق المحدد أعلاه.
    </p>
    <div class="legal-bullets">
      <div>⚖️ <strong>الصفة التنفيذية المباشرة:</strong> يُعد هذا السند سنداً تنفيذياً واجباً وقابلاً للتنفيذ المباشر والجبري بموجب الفقرة (2) من المادة التاسعة من نظام التنفيذ الصادر بالمرسوم الملكي رقم (م/53) ولائحته التنفيذية.</div>
      <div>⚖️ <strong>الرجوع بدون مصاريف أو احتجاج:</strong> لحامل هذا السند (الدائن) الحق التام في الرجوع بدون مصاريف وبدون احتجاج وبدون الحاجة لعمل بروتستو عدم الوفاء (وفق المادة 87 وما بعدها من نظام الأوراق التجارية)، مع إسقاط أي دفع أو معارضة قضائية.</div>
      <div>⚖️ <strong>انشغال الذمة والتضامن:</strong> تظل ذمة المدين (وكفيله الغارم المتضامن) مشغولة بصفة قطعية غير قابلة للتجزئة حتى تمام السداد وتبرئة الذمة بموجب مخالصة خطية رسمية صادرة من الدائن.</div>
    </div>
    ${t.notes?`<div style="margin-top:8px; padding:6px 10px; background:#fff; border-right:3px solid #004d80; font-size:11.5px; color:#1e293b;"><strong>البيان / سبب المعاملة:</strong> ${t.notes}</div>`:""}
  </div>

  <!-- Signatures -->
  <div class="sig-area">

    <!-- Debtor Signature (No thumbprint) -->
    <div class="sig-box">
      <div class="sig-box-title">✍️ توقيع وختم المدين (محرر السند / المفوض بالتوقيع)</div>
      <div class="sig-meta">
        <div>المنشأة المدينة: <strong>${l}</strong></div>
        <div>المفوض بالتوقيع: <strong>${u} ${`(${y})`}</strong></div>
        <div>هوية المفوض / السجل: <strong class="mono">${f||c}</strong></div>
      </div>
      <div style="text-align:center; margin-top:16px;">
        <div style="height:55px;"></div>
        <div class="sig-line">التوقيع والختم الرسمي للمدين</div>
      </div>
    </div>

    <!-- Guarantor (if present) (No thumbprint) -->
    ${$?`
    <div class="sig-box">
      <div class="sig-box-title">🤝 توقيع الكفيل الغارم المتضامن</div>
      <div class="sig-meta">
        <div>اسم الكفيل: <strong>${$}</strong></div>
        <div>الهوية: <strong class="mono">${k||"—"}</strong></div>
        <div>الجوال: <strong class="mono">${B||"—"}</strong></div>
      </div>
      <div style="text-align:center; margin-top:16px;">
        <div style="height:55px;"></div>
        <div class="sig-line">توقيع الكفيل الغارم</div>
      </div>
    </div>
    `:""}

    <!-- Creditor Stamp & Signature -->
    <div class="sig-box" style="border-color:#0284c7; background:#f0f9ff;">
      <div class="sig-box-title" style="color:#004d80;">🏢 اعتماد وخاتم الدائن (المستفيد)</div>
      <div class="sig-meta">
        <div>المنشأة: <strong style="white-space:nowrap;">${o}</strong></div>
        <div>السجل التجاري: <strong class="mono">${r}</strong></div>
      </div>
      <div style="text-align:center; margin-top:6px; position:relative; min-height:140px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
        ${S?`<img src="${S}" class="stamp-img" alt="ختم الشركة"/>`:'<div style="height:90px;"></div>'}
        <div class="sig-line" style="width:100%; margin-top:4px;">توقيع وخاتم الدائن المعتمد</div>
      </div>
    </div>

  </div>

  <!-- Footer -->
  <div class="footer">
    تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA")} م — رقم السند التنفيذي: <strong class="mono">${t.noteNumber}</strong>
    <br/>
    ${o} للتجارة — ينبع — المملكة العربية السعودية — وثيقة أصلية واجبة النفاذ القضائي
  </div>

</div>

<script>
  window.onload = () => {
    // Auto-open print preview if not restricted
    // window.print();
  };
<\/script>
</body>
</html>`,_=window.open("","_blank","width=850,height=950");_?(_.document.write(J),_.document.close()):alert("يرجى السماح بالنوافذ المنبثقة للطباعة.")}function lt(n){if(!n)return"—";try{return new Intl.DateTimeFormat("ar-SA-u-ca-islamic",{year:"numeric",month:"long",day:"numeric"}).format(new Date(n)).replace(/\u06f\d/g,t=>t)}catch{return n}}E.promissoryNotes||(E.promissoryNotes=()=>U(x,`companies/${h}/promissoryNotes`));window.openTrustReceiptFromPn=async()=>{const{openTrustReceiptModal:n}=await P(async()=>{const{openTrustReceiptModal:t}=await import("./trust-receipts.js_v_2-C9I3kW4K.js");return{openTrustReceiptModal:t}},__vite__mapDeps([2,0,1]));n()};window.openDebtAcknowledgmentFromPn=async()=>{const{openDebtAcknowledgmentModal:n}=await P(async()=>{const{openDebtAcknowledgmentModal:t}=await import("./debt-acknowledgment.js_v_2-H-BqRKEN.js");return{openDebtAcknowledgmentModal:t}},__vite__mapDeps([3,0,1]));n()};window.openGoodsReceiptAckFromPn=async()=>{if(typeof window.openGoodsReceiptAckModal=="function")window.openGoodsReceiptAckModal();else{const{openGoodsReceiptAckModal:n}=await P(async()=>{const{openGoodsReceiptAckModal:t}=await import("./goods-receipt-ack.js_v_1-CJv8-FcM.js");return{openGoodsReceiptAckModal:t}},__vite__mapDeps([4,0,1]));n()}};window.openGoodsReceiptAckForNote=async n=>{const t=b.find(s=>s.id===n);if(!t)return;const{openGoodsReceiptAckModal:e}=await P(async()=>{const{openGoodsReceiptAckModal:s}=await import("./goods-receipt-ack.js_v_1-CJv8-FcM.js");return{openGoodsReceiptAckModal:s}},__vite__mapDeps([4,0,1]));e({customerId:t.customerId,customerObj:{id:t.customerId,name:t.customerName,idNumber:t.debtorIdNumber,phone:t.debtorPhone,address:t.debtorCity},promissoryNoteId:t.id})};export{Z as openNewNoteModal,ft as render};
