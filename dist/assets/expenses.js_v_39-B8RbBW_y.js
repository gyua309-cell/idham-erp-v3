const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-HrCilPJ3.js","assets/index-BTgEPYae.css","assets/balance-sync-B0nwXHmR.js","assets/sync-engine-CjRafMpJ.js"])))=>i.map(i=>d[i]);
import{s as ie,t as K,C as j,f as Z,g as S,i as se,_ as w,e as de}from"./index-HrCilPJ3.js";import{query as le,getDocs as ce}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let ee=[],b=[],G=[],Q=[],te=[],oe=[],ne=[],z=null;async function re(){ee=(await S(j.costCenters()).catch(()=>[])).sort((e,a)=>(e.code||"").localeCompare(a.code||""));const i=document.getElementById("exp-cc-sel");i&&(i.innerHTML='<option value="">بدون مركز تكلفة</option>'+ee.map(e=>`<option value="${e.id}">${e.code} — ${e.name}</option>`).join(""))}async function he(n,i){n.innerHTML=`
    <div class="filterbar" style="flex-wrap: wrap; gap: 8px; align-items: flex-end;">
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="exp-from" value="${ie()}" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="exp-to" value="${K()}" />
      </div>
      <div class="filter-select-group">
        <label>نوع الجهة</label>
        <select id="exp-entity-type-filter" onchange="loadExpenses()">
          <option value="">كل الجهات</option>
          <option value="expense">مصروف</option>
          <option value="supplier">مورد</option>
          <option value="customer">عميل</option>
          <option value="other">حساب عام</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>طريقة الدفع</label>
        <select id="exp-method-filter" onchange="loadExpenses()">
          <option value="">كل الطرق</option>
          <option value="cash">نقدي</option>
          <option value="bank">تحويل بنكي</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="exportPagePDF('.data-dense','سندات_الصرف')" title="تصدير PDF">📄 PDF</button>
        <button class="btn btn-secondary btn-sm" onclick="exportPageExcel('.data-dense','سندات_الصرف')" title="تصدير Excel">📊 Excel</button>
        <button class="btn btn-primary" onclick="openExpenseModal()">+ سند صرف جديد</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">إدارة سندات الصرف (Payments)</h1>
        <p class="page-subtitle" id="exp-count">سجل سندات الصرف النقدية والبنكية للمصروفات والموردين</p>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>رقم السند</th>
                <th>جهة الصرف</th>
                <th>نوع الجهة</th>
                <th>البيان</th>
                <th>طريقة الدفع</th>
                <th>مركز التكلفة</th>
                <th style="text-align:left;">المبلغ</th>
                <th style="text-align:center;" class="no-print">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="exp-tbody">
              ${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                  <td class="no-print"></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Expense Modal -->
    <div class="modal-overlay" id="expense-modal">
      <div class="modal modal-md">
        <div class="modal-header">
          <h3 class="modal-title" id="expense-modal-title">سند صرف جديد (Payment Voucher)</h3>
          <button class="modal-close" onclick="closeModal('expense-modal')">×</button>
        </div>
        <div class="modal-body">
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>التاريخ *</label>
              <input type="date" id="exp-date" class="input" value="${K()}" />
            </div>
            <div class="form-group">
              <label>المبلغ *</label>
              <input type="number" id="exp-amount" class="input mono" min="0" step="0.01" />
            </div>
          </div>

          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>جهة الصرف (النوع) *</label>
              <select id="exp-entity-type" class="input" onchange="onEntityTypeChange()">
                <option value="expense">بند مصروف</option>
                <option value="supplier">مورد (سداد ذمة دائنة)</option>
                <option value="customer">عميل (رد نقدية)</option>
                <option value="other">حساب عام</option>
              </select>
            </div>
            <div class="form-group">
              <label id="exp-entity-label">الحساب / الحساب المستهدف *</label>
              <select id="exp-target-entity" class="input">
                <option value="">اختر...</option>
              </select>
            </div>
          </div>

          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>طريقة الصرف *</label>
              <select id="exp-pay-method" class="input" onchange="togglePaySource()">
                <option value="cash">نقدي (سند صرف صندوق)</option>
                <option value="bank">تحويل بنكي (سند صرف بنك)</option>
              </select>
            </div>
            <div class="form-group">
              <label id="exp-source-label">صندوق الصرف *</label>
              <select id="exp-source" class="input">
                <option value="">اختر...</option>
              </select>
            </div>
          </div>

          <div class="form-group mb-16">
            <label>البيان / ملاحظات *</label>
            <textarea id="exp-notes" class="input" rows="2" placeholder="اكتب بياناً تفصيلياً لعملية الصرف..."></textarea>
          </div>
          
          <div class="form-group mb-16">
            <label>🏷️ مركز التكلفة (اختياري)</label>
            <select id="exp-cc-sel" class="input">
              <option value="">بدون مركز تكلفة</option>
            </select>
          </div>
          
          <div class="form-group mb-16">
            <label>📁 إرفاق صورة السند / الفاتورة (أتمتة الأرشيف)</label>
            <input type="file" id="exp-file-upload" class="input" accept="image/*,application/pdf" />
          </div>
          
          <div id="exp-error" class="alert bad hidden" style="margin-top:16px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('expense-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveExpense()" id="save-exp-btn">حفظ واعتماد</button>
        </div>
      </div>
    </div>

    <!-- Expense Preview Modal -->
    <div class="modal-overlay" id="expense-preview-modal">
      <div class="modal modal-lg">
        <div class="modal-header no-print">
          <h3 class="modal-title">معاينة سند الصرف</h3>
          <button class="modal-close" onclick="closeModal('expense-preview-modal')">×</button>
        </div>
        <div class="modal-body" id="expense-preview-body" style="padding: 0; background: white;">
          <!-- Content built by js -->
        </div>
        <div class="modal-footer no-print">
          <button class="btn btn-secondary" onclick="closeModal('expense-preview-modal')">إغلاق</button>
          <button class="btn btn-primary" onclick="window.printExpenseVoucher()"><i class="fas fa-print"></i> طباعة السند</button>
        </div>
      </div>
    </div>
  `;const e=n.querySelector("#exp-from"),a=n.querySelector("#exp-to");e&&e.addEventListener("change",H),a&&a.addEventListener("change",H),await Promise.all([pe(),re(),H()])}async function pe(){b=await S(j.chartOfAccounts()),G=await S(j.cashBoxes()),Q=await S(j.bankAccounts()),te=await S(j.suppliers()),oe=await S(j.customers()),onEntityTypeChange(),togglePaySource()}window.onEntityTypeChange=()=>{const n=document.getElementById("exp-entity-type").value,i=document.getElementById("exp-entity-label"),e=document.getElementById("exp-target-entity");if(e.innerHTML='<option value="">اختر...</option>',n==="expense"){i.textContent="بند المصروف (الحساب) *";const a=b.filter(l=>l.type==="expense");e.innerHTML+=a.map(l=>`<option value="${l.id}">${l.code} - ${l.name}</option>`).join("")}else n==="supplier"?(i.textContent="المورد المستهدف *",e.innerHTML+=te.map(a=>`<option value="${a.id}">${a.name}</option>`).join("")):n==="customer"?(i.textContent="العميل المستهدف *",e.innerHTML+=oe.map(a=>`<option value="${a.id}">${a.name}</option>`).join("")):(i.textContent="الحساب المستهدف (دليل الحسابات) *",e.innerHTML+=b.map(a=>`<option value="${a.id}">${a.code} - ${a.name}</option>`).join(""))};window.togglePaySource=()=>{const n=document.getElementById("exp-pay-method").value,i=document.getElementById("exp-source-label"),e=document.getElementById("exp-source");e.innerHTML='<option value="">اختر...</option>',n==="cash"?(i.textContent="صندوق الصرف *",e.innerHTML+=G.map(a=>`<option value="${a.id}">${a.name}</option>`).join("")):(i.textContent="الحساب البنكي المخصوم منه *",e.innerHTML+=Q.map(a=>`<option value="${a.id}">${a.name||"بنك"} - ${a.accountNumber||""}</option>`).join(""))};window.openExpenseModal=()=>{z=null;const n=document.getElementById("expense-modal-title");n&&(n.textContent="سند صرف جديد (Payment Voucher)"),document.getElementById("exp-date").value=K(),document.getElementById("exp-amount").value="",document.getElementById("exp-entity-type").value="expense",onEntityTypeChange(),document.getElementById("exp-notes").value="";const i=document.getElementById("exp-cc-sel");i&&(i.value=""),document.getElementById("exp-error").classList.add("hidden"),openModal("expense-modal")};window.saveExpense=async()=>{const n=document.getElementById("exp-error");n.classList.add("hidden");const i=document.getElementById("exp-date").value,e=parseFloat(document.getElementById("exp-amount").value),a=document.getElementById("exp-entity-type").value,l=document.getElementById("exp-target-entity").value,g=document.getElementById("exp-pay-method").value,m=document.getElementById("exp-source").value,s=document.getElementById("exp-notes").value.trim();if(!i||!e||e<=0||!l||!m||!s){n.textContent="الرجاء تعبئة جميع الحقول المطلوبة وكتابة بيان صحيح",n.classList.remove("hidden");return}const p=document.getElementById("save-exp-btn");p.disabled=!0;try{if(await se(i)){n.textContent=`⚠️ لا يمكن حفظ سند الصرف لأن تاريخه (${i}) يقع في فترة محاسبية مغلقة ومقفلة نهائياً.`,n.classList.remove("hidden"),p.disabled=!1;return}const{doc:x,runTransaction:E,serverTimestamp:f,collection:t,getDoc:_,getDocs:U,query:F,where:B,updateDoc:q}=await w(async()=>{const{doc:o,runTransaction:r,serverTimestamp:c,collection:d,getDoc:T,getDocs:P,query:M,where:N,updateDoc:D}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:o,runTransaction:r,serverTimestamp:c,collection:d,getDoc:T,getDocs:P,query:M,where:N,updateDoc:D}},[]),{db:h,COMPANY_ID:y}=await w(async()=>{const{db:o,COMPANY_ID:r}=await import("./index-HrCilPJ3.js").then(c=>c.M);return{db:o,COMPANY_ID:r}},__vite__mapDeps([0,1]));if(z){const o=x(h,`companies/${y}/expenses`,z),r=await _(o);if(r.exists()){const c=r.data(),d=x(h,`companies/${y}/${c.method==="cash"?"cashBoxes":"bankAccounts"}`,c.sourceId),T=await _(d);if(T.exists()){const D=parseFloat(T.data().balance||0);await q(d,{balance:D+c.amount,updatedAt:f()})}const{deleteJournalEntry:P}=await w(async()=>{const{deleteJournalEntry:D}=await import("./index-HrCilPJ3.js").then(V=>V.N);return{deleteJournalEntry:D}},__vite__mapDeps([0,1])),M=F(t(h,`companies/${y}/journalEntries`),B("sourceId","==",z),B("sourceType","==","expense")),N=await U(M);N.empty||await P(N.docs[0].id)}}let v="",C="",u="",$="";if(a==="expense"){const o=b.find(r=>r.id===l);v=l,C=o?.code,u=o?.name,$=o?.name}else if(a==="supplier"){const o=te.find(c=>c.id===l);$=o?.name;const r="2-1-1-1-1";for(const c in b){const d=b[c];if(d.sourceEntityId===l&&d.sourceModule==="suppliers"){v=d.id,C=d.code,u=d.name;break}}if(!v){const c=b.find(d=>d.name.includes(o?.name));v=c?.id||b.find(d=>d.code===r)?.id,C=c?.code||r,u=c?.name||"ذمم الموردين"}}else if(a==="customer"){const o=oe.find(c=>c.id===l);$=o?.name;const r="1-1-2-1-1";for(const c in b){const d=b[c];if(d.sourceEntityId===l&&d.sourceModule==="customers"){v=d.id,C=d.code,u=d.name;break}}if(!v){const c=b.find(d=>d.name.includes(o?.name));v=c?.id||b.find(d=>d.code===r)?.id,C=c?.code||r,u=c?.name||"ذمم العملاء"}}else{const o=b.find(r=>r.id===l);v=l,C=o?.code,u=o?.name,$=o?.name}let I="",R="",O="",L=null;if(g==="cash"){const o=G.find(r=>r.id===m);I=o?.accountId,R=o?.code,O=o?.name,L=x(h,`companies/${y}/cashBoxes`,m)}else{const o=Q.find(r=>r.id===m);I=o?.accountId,R=o?.code,O=o?.name,L=x(h,`companies/${y}/bankAccounts`,m)}if(!I){const c=g==="cash"?"1-1-1-1-3":"1-1-1-3-2",d=b.find(T=>T.code===c)||b.find(T=>T.parentCode==="1-1-1-3");I=d?.id,R=d?.code,O=d?.name}let A="";await E(h,async o=>{let r=0,c=null;L&&(c=await o.get(L),c.exists()&&(r=parseFloat(c.data().balance||0)));let d=null,T=0,P=null;I&&(P=x(h,`companies/${y}/chartOfAccounts`,I),d=await o.get(P),d.exists()&&(T=parseFloat(d.data().balance||0)));let M=null,N=0,D=null;v&&(D=x(h,`companies/${y}/chartOfAccounts`,v),M=await o.get(D),M.exists()&&(N=parseFloat(M.data().balance||0)));const V=r-e;L&&o.update(L,{balance:V,updatedAt:f()}),I&&P&&d&&o.update(P,{balance:T-e,totalCredit:parseFloat(d.data()?.totalCredit||0)+e,updatedAt:f()}),v&&D&&M&&o.update(D,{balance:N+e,totalDebit:parseFloat(M.data()?.totalDebit||0)+e,updatedAt:f()});const ae=z?x(h,`companies/${y}/expenses`,z):x(t(h,`companies/${y}/expenses`));if(A=ae.id,o.set(ae,{date:i,amount:e,entityType:a,targetId:l,accountName:$||"مصروف",method:g,sourceId:m,sourceName:g==="cash"?G.find(k=>k.id===m)?.name:Q.find(k=>k.id===m)?.name,notes:s,costCenterId:document.getElementById("exp-cc-sel")?.value||null,costCenterName:ee.find(k=>k.id===document.getElementById("exp-cc-sel")?.value)?.name||null,createdAt:f(),updatedAt:f()}),g==="cash"){const k=x(t(h,`companies/${y}/cashTransactions`));o.set(k,{cashBoxId:m,type:"out",amount:e,balanceAfter:V,notes:`سند صرف رقم ${A.substring(0,6).toUpperCase()} — ${s}`,userName:"المستخدم",createdAt:f()})}else{const k=x(t(h,`companies/${y}/bankTransactions`));o.set(k,{bankAccountId:m,type:"out",amount:e,balanceAfter:V,notes:`سند صرف رقم ${A.substring(0,6).toUpperCase()} — ${s}`,refNumber:`PV-${A.substring(0,6).toUpperCase()}`,createdAt:f()})}});const Y=b.find(o=>o.id===v),J=b.find(o=>o.id===I);await de({date:i,description:`سند صرف رقم #${A.substring(0,6).toUpperCase()} - ${s}`,sourceType:"expense",sourceId:A,lines:[{accountId:v,accountCode:C||Y?.code||"",accountName:u||Y?.name||"",debit:e,credit:0,note:s,costCenterId:document.getElementById("exp-cc-sel")?.value||null},{accountId:I,accountCode:R||J?.code||"",accountName:O||J?.name||"",debit:0,credit:e,note:"سداد سند صرف",costCenterId:document.getElementById("exp-cc-sel")?.value||null}]});const{clearERPCache:W}=await w(async()=>{const{clearERPCache:o}=await import("./index-HrCilPJ3.js").then(r=>r.N);return{clearERPCache:o}},__vite__mapDeps([0,1]));W(`companies/${y}/expenses`),W(`companies/${y}/chartOfAccounts`),W(`companies/${y}/journalEntries`),showToast("تم حفظ سند الصرف واعتماده","success");const X=document.getElementById("exp-file-upload");if(X&&X.files.length>0){const o=X.files[0];window.uploadFileToArchive(o,"expenses",A,`مرفق سند صرف رقم PV-${A.substring(0,6).toUpperCase()}: ${s}`).catch(r=>console.warn(r))}closeModal("expense-modal"),await H(),a==="customer"?w(()=>import("./balance-sync-B0nwXHmR.js"),__vite__mapDeps([2,0,1,3])).then(o=>o.recalculateCustomerBalance(l)).catch(o=>console.warn(o)):a==="supplier"&&w(()=>import("./balance-sync-B0nwXHmR.js"),__vite__mapDeps([2,0,1,3])).then(o=>o.recalculateSupplierBalance(l)).catch(o=>console.warn(o))}catch(x){n.textContent=x.message,n.classList.remove("hidden")}finally{p.disabled=!1}};async function H(){const n=document.getElementById("exp-from"),i=document.getElementById("exp-to"),e=document.getElementById("exp-tbody");if(!e)return;const a=n?n.value:"",l=i?i.value:"";try{const g=le(j.expenses());let s=(await ce(g)).docs.map(t=>({id:t.id,...t.data()}));s.sort((t,_)=>(_.date||"").localeCompare(t.date||"")),a&&l&&(s=s.filter(t=>!t.date||t.date>=a&&t.date<=l));const p=document.getElementById("exp-entity-type-filter")?.value;p&&(s=s.filter(t=>t.entityType===p));const x=document.getElementById("exp-method-filter")?.value;x&&(s=s.filter(t=>t.method===x)),ne=s;const E=document.getElementById("exp-count");if(E&&(E.textContent=`الإجمالي: ${Z(s.reduce((t,_)=>t+(_.amount||0),0))}`),!s.length){e.innerHTML='<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--text-3);">لا توجد سندات صرف في هذه الفترة</td></tr>';return}const f={expense:"مصروف",supplier:"مورد",customer:"عميل",other:"حساب عام"};e.innerHTML=s.map(t=>`
      <tr>
        <td>${t.date||"—"}</td>
        <td class="mono" style="font-size:12px;color:var(--text-2);">${(t.number||t.id||"").substring(0,8).toUpperCase()}</td>
        <td><strong>${t.accountName||t.targetName||t.supplierName||t.category||t.description||"—"}</strong></td>
        <td><span class="badge ${t.entityType==="supplier"?"indigo":t.entityType==="customer"?"lime":"neutral"}">${f[t.entityType]||"مصروف"}</span></td>
        <td>${t.notes||t.description||"—"}</td>
        <td>${t.method==="cash"?"نقدي":"بنكي"}${t.sourceName?` - ${t.sourceName}`:""}</td>
        <td>${t.costCenterName?`<span style="font-size:11px;background:var(--bg-3);padding:2px 8px;border-radius:12px;color:var(--primary);">${t.costCenterName}</span>`:"—"}</td>
        <td style="text-align:left;" class="mono text-bad">${Z(t.amount||0)}</td>
        <td style="text-align:center;" class="no-print">
          <div style="display:flex;gap:4px;justify-content:center;">
            <button class="btn btn-secondary btn-sm" onclick="previewExpense('${t.id}')" title="معاينة"><i class="fas fa-eye"></i></button>
            <button class="btn btn-secondary btn-sm" onclick="editExpense('${t.id}')" style="border-color:#fbbf24;color:#d97706;" title="تعديل"><i class="fas fa-edit"></i></button>
            <button class="btn btn-secondary btn-sm" onclick="deleteExpense('${t.id}')" style="border-color:#f87171;color:#dc2626;" title="حذف"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      </tr>
    `).join("")}catch(g){console.error(g),e.innerHTML='<tr><td colspan="9" class="text-bad" style="text-align:center;">خطأ في تحميل المصروفات</td></tr>'}}window.previewExpense=async n=>{const i=ne.find(a=>a.id===n);if(!i)return;const e=document.getElementById("expense-preview-body");if(e){e.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-3);"><i class="fas fa-spinner fa-spin fa-2x"></i><br><br>جارٍ تحميل بيانات الشركة والشعار...</div>',openModal("expense-preview-modal");try{const{doc:a,getDoc:l}=await w(async()=>{const{doc:E,getDoc:f}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:E,getDoc:f}},[]),{db:g,COMPANY_ID:m}=await w(async()=>{const{db:E,COMPANY_ID:f}=await import("./index-HrCilPJ3.js").then(t=>t.M);return{db:E,COMPANY_ID:f}},__vite__mapDeps([0,1])),[s,p]=await Promise.all([l(a(g,`companies/${m}/settings/company`)),l(a(g,`companies/${m}/settings/logo`))]),x=s.exists()?s.data():{};p.exists()&&(x.logoUrl=p.data().dataUrl||p.data().logoUrl||""),e.innerHTML=ue(i,n,x)}catch(a){console.error(a),e.innerHTML=`<div style="padding:40px;text-align:center;color:var(--bad);">خطأ في تحميل بيانات المعاينة: ${a.message}</div>`}}};window.printExpenseVoucher=()=>{const n=document.getElementById("expense-preview-body");if(!n)return;const i=n.innerHTML,e=window.open("","_blank","width=850,height=700");e.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>سند صرف</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Cairo',sans-serif; direction:rtl; color:#1a1a2e; background:#fff; padding:20px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @media print {
      body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; padding:0; }
      .header-container { background:linear-gradient(135deg,#7c2d12 0%,#c2410c 60%,#ea580c 100%) !important; }
    }
  </style>
</head>
<body>${i}</body>
</html>`),e.document.close(),setTimeout(()=>{e.focus(),e.print(),e.close()},600)};window.editExpense=n=>{const i=ne.find(l=>l.id===n);if(!i)return;z=n;const e=document.getElementById("expense-modal-title");e&&(e.textContent=`تعديل سند الصرف (#${n.substring(0,6).toUpperCase()})`),document.getElementById("exp-date").value=i.date,document.getElementById("exp-amount").value=i.amount,document.getElementById("exp-entity-type").value=i.entityType,window.onEntityTypeChange(),document.getElementById("exp-target-entity").value=i.targetId,document.getElementById("exp-pay-method").value=i.method,window.togglePaySource(),document.getElementById("exp-source").value=i.sourceId,document.getElementById("exp-notes").value=i.notes||"";const a=document.getElementById("exp-cc-sel");a&&(a.value=i.costCenterId||""),document.getElementById("exp-error").classList.add("hidden"),openModal("expense-modal")};window.deleteExpense=async n=>{if(await window.showConfirm?.("هل أنت متأكد من رغبتك في حذف سند الصرف هذا؟ سيتم إرجاع المبالغ للصندوق/البنك وعكس القيود المحاسبية بالكامل.","حذف سند الصرف"))try{const{doc:e,getDoc:a,updateDoc:l,deleteDoc:g,getDocs:m,query:s,where:p,collection:x,serverTimestamp:E}=await w(async()=>{const{doc:u,getDoc:$,updateDoc:I,deleteDoc:R,getDocs:O,query:L,where:A,collection:Y,serverTimestamp:J}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:u,getDoc:$,updateDoc:I,deleteDoc:R,getDocs:O,query:L,where:A,collection:Y,serverTimestamp:J}},[]),{db:f,COMPANY_ID:t}=await w(async()=>{const{db:u,COMPANY_ID:$}=await import("./index-HrCilPJ3.js").then(I=>I.M);return{db:u,COMPANY_ID:$}},__vite__mapDeps([0,1])),{deleteJournalEntry:_}=await w(async()=>{const{deleteJournalEntry:u}=await import("./index-HrCilPJ3.js").then($=>$.N);return{deleteJournalEntry:u}},__vite__mapDeps([0,1])),U=e(f,`companies/${t}/expenses`,n),F=await a(U);if(!F.exists()){window.showToast("سند الصرف غير موجود","error");return}const B=F.data(),q=e(f,`companies/${t}/${B.method==="cash"?"cashBoxes":"bankAccounts"}`,B.sourceId),h=await a(q);if(h.exists()){const u=parseFloat(h.data().balance||0);await l(q,{balance:u+B.amount,updatedAt:E()})}const y=s(x(f,`companies/${t}/journalEntries`),p("sourceId","==",n),p("sourceType","==","expense")),v=await m(y);v.empty||await _(v.docs[0].id),await g(U);const{clearERPCache:C}=await w(async()=>{const{clearERPCache:u}=await import("./index-HrCilPJ3.js").then($=>$.N);return{clearERPCache:u}},__vite__mapDeps([0,1]));C(`companies/${t}/expenses`),C(`companies/${t}/chartOfAccounts`),C(`companies/${t}/journalEntries`),window.showToast("تم حذف سند الصرف وعكس القيود المحاسبية بنجاح","success"),await H(),B.entityType==="customer"?w(()=>import("./balance-sync-B0nwXHmR.js"),__vite__mapDeps([2,0,1,3])).then(u=>u.recalculateCustomerBalance(B.targetId)).catch(u=>console.warn(u)):B.entityType==="supplier"&&w(()=>import("./balance-sync-B0nwXHmR.js"),__vite__mapDeps([2,0,1,3])).then(u=>u.recalculateSupplierBalance(B.targetId)).catch(u=>console.warn(u))}catch(e){console.error(e),window.showToast("خطأ في حذف سند الصرف: "+e.message,"error")}};function ue(n,i,e){const a=i.substring(0,8).toUpperCase(),l={expense:"مصروف",supplier:"مورد",customer:"عميل",other:"حساب عام"},g={cash:"نقدي",bank:"تحويل بنكي"},m=me(n.amount),s=e.name||e.companyName||"مؤسسة إدهام للمواد الغذائية",p=[e.address,e.city,e.zip,e.country].filter(Boolean).join("، ")||"",x=e.phone||"",E=e.email||"",f=e.vatNumber||e.vat||e.taxNumber||"",t=e.crNumber||e.cr||"",_=e.logoUrl||e.logoBase64||e.logo||"";return`
  <div style="font-family:'Cairo',Arial,sans-serif;direction:rtl;max-width:820px;margin:0 auto;background:#fff;padding:20px;border:1px solid #e2e8f0;border-radius:14px;">
    <!-- HEADER -->
    <div class="header-container" style="background:linear-gradient(135deg,#7c2d12 0%,#c2410c 60%,#ea580c 100%) !important;padding:0;border-radius:14px 14px 0 0;overflow:hidden;-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;">
      <div style="padding:22px 32px;display:flex;justify-content:space-between;align-items:center;">
        <!-- Logo + Company -->
        <div style="display:flex;align-items:center;gap:16px;">
          ${_?`<img src="${_}" style="height:70px;width:70px;object-fit:contain;background:white;border-radius:8px;padding:4px;box-shadow:0 2px 4px rgba(0,0,0,0.1);" />`:'<div style="width:70px;height:70px;background:rgba(255,255,255,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:32px;color:white;">PV</div>'}
          <div>
            <div style="font-size:22px;font-weight:900;color:white;line-height:1.2;color:#fff !important;">${s}</div>
            ${p?`<div style="font-size:11.5px;color:rgba(255,255,255,0.9);margin-top:3px;color:#fff !important;">📍 العنوان: <strong>${p}</strong></div>`:""}
            <div style="font-size:11.5px;color:rgba(255,255,255,0.85);margin-top:3px;display:flex;flex-wrap:wrap;gap:4px 14px;color:#fff !important;">
              ${x?`<span>📞 هاتف: <strong>${x}</strong></span>`:""}
              ${E?`<span>📧 بريد: <strong>${E}</strong></span>`:""}
              ${f?`<span>🔢 الرقم الضريبي: <strong>${f}</strong></span>`:""}
              ${t?`<span>📋 السجل التجاري: <strong>${t}</strong></span>`:""}
            </div>
          </div>
        </div>
        <!-- Voucher Title -->
        <div style="text-align:left;">
          <div style="background:rgba(255,255,255,0.18) !important;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.25) !important;border-radius:12px;padding:10px 22px;text-align:center;-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;">
            <div style="font-size:26px;font-weight:900;color:white;letter-spacing:1px;color:#fff !important;">سند صرف</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.8);letter-spacing:2px;font-weight:600;color:#fff !important;">PAYMENT VOUCHER</div>
          </div>
        </div>
      </div>
      <!-- Gold accent bar -->
      <div style="height:4px;background:linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b) !important;-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;"></div>
    </div>

    <!-- VOUCHER META -->
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-top:none;padding:14px 32px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
      <div style="text-align:center;border-left:1px solid #fed7aa;">
        <div style="font-size:10px;color:#7c2d12;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">رقم السند</div>
        <div style="font-size:20px;font-weight:900;color:#9a3412;font-family:monospace;margin-top:3px;">#${a}</div>
      </div>
      <div style="text-align:center;border-left:1px solid #fed7aa;">
        <div style="font-size:10px;color:#7c2d12;font-weight:700;letter-spacing:.08em;">التاريخ</div>
        <div style="font-size:16px;font-weight:800;color:#111827;margin-top:3px;">${n.date}</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:10px;color:#7c2d12;font-weight:700;letter-spacing:.08em;">طريقة الدفع</div>
        <div style="font-size:14px;font-weight:800;color:#111827;margin-top:3px;">${g[n.method]||n.method}</div>
        <div style="font-size:12px;color:#6b7280;">${n.sourceName||""}</div>
      </div>
    </div>

    <!-- AMOUNT BOX -->
    <div style="border:1px solid #e2e8f0;border-top:none;padding:20px 32px;">
      <div style="background:linear-gradient(135deg,#fef2f2,#fee2e2);border:2px solid #ef4444;border-radius:14px;padding:18px 28px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:11px;color:#991b1b;font-weight:700;margin-bottom:5px;letter-spacing:.06em;">المبلـغ المدفوع بالأرقام</div>
          <div style="font-size:38px;font-weight:900;color:#7f1d1d;font-family:monospace;line-height:1;">${Z(n.amount)}</div>
        </div>
        <div style="text-align:left;background:rgba(255,255,255,0.6);border-radius:10px;padding:10px 16px;max-width:320px;">
          <div style="font-size:10px;color:#991b1b;font-weight:700;margin-bottom:4px;">المبلغ تفقيطاً</div>
          <div style="font-size:14px;color:#7f1d1d;font-weight:700;line-height:1.5;">فقط ${m} لا غير</div>
        </div>
      </div>
    </div>

    <!-- DETAILS TABLE -->
    <div style="border:1px solid #e2e8f0;border-top:none;padding:0 32px 20px;">
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px 14px;font-size:12px;color:#475569;font-weight:700;border:1px solid #e2e8f0;text-align:right;">المدفوع له (جهة الصرف)</th>
            <th style="padding:10px 14px;font-size:12px;color:#475569;font-weight:700;border:1px solid #e2e8f0;text-align:right;">نوع الجهة</th>
            <th style="padding:10px 14px;font-size:12px;color:#475569;font-weight:700;border:1px solid #e2e8f0;text-align:right;">مركز التكلفة</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:12px 14px;font-size:14px;color:#1e293b;border:1px solid #e2e8f0;">
              <strong>${n.accountName||"مصروف"}</strong>
            </td>
            <td style="padding:12px 14px;font-size:13px;color:#1e293b;border:1px solid #e2e8f0;">
              ${l[n.entityType]||"مصروف"}
            </td>
            <td style="padding:12px 14px;font-size:13px;color:#1e293b;border:1px solid #e2e8f0;color:#475569;">
              ${n.costCenterName||"بدون مركز تكلفة"}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- NOTES / STATEMENT -->
      <div style="margin-top:20px;border:1px dashed #cbd5e1;border-radius:10px;padding:16px;">
        <div style="font-size:11px;color:#64748b;font-weight:700;margin-bottom:6px;text-transform:uppercase;">البيان / ملاحظات الصرف</div>
        <div style="font-size:14px;color:#1e293b;line-height:1.6;font-weight:600;">${n.notes||"—"}</div>
      </div>
    </div>

    <!-- SIGNATURES -->
    <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 14px 14px;padding:24px 32px 32px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;background:#fefefe;">
      <div style="text-align:center;">
        <div style="font-size:13px;font-weight:700;color:#475569;margin-bottom:45px;">توقيع المستلم</div>
        <div style="border-top:1.5px dashed #cbd5e1;width:140px;margin:0 auto;color:#94a3b8;font-size:11px;">الإسم: ....................</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:13px;font-weight:700;color:#475569;margin-bottom:45px;">توقيع المحاسب</div>
        <div style="border-top:1.5px dashed #cbd5e1;width:140px;margin:0 auto;color:#94a3b8;font-size:11px;">التوقيع والختم</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:13px;font-weight:700;color:#475569;margin-bottom:45px;">توقيع المدير العام</div>
        <div style="border-top:1.5px dashed #cbd5e1;width:140px;margin:0 auto;color:#94a3b8;font-size:11px;">التوقيع والاعتماد</div>
      </div>
    </div>
  </div>
  `}function me(n){if(!n||isNaN(n))return"صفر";const i=Math.floor(n),e=Math.round((n-i)*100),a=["","واحد","اثنان","ثلاثة","أربعة","خمسة","ستة","سبعة","ثمانية","تسعة","عشرة","أحد عشر","اثنا عشر","ثلاثة عشر","أربعة عشر","خمسة عشر","ستة عشر","سبعة عشر","ثمانية عشر","تسعة عشر"],l=["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"],g=["","مائة","مائتان","ثلاثمائة","أربعمائة","خمسمائة","ستمائة","سبعمائة","ثمانيمائة","تسعمائة"];function m(p){return p===0?"":p<20?a[p]:p<100?l[Math.floor(p/10)]+(p%10?" و"+a[p%10]:""):g[Math.floor(p/100)]+(p%100?" و"+m(p%100):"")}let s="";return i>=1e6&&(s+=m(Math.floor(i/1e6))+" مليون "),i>=1e3&&(s+=m(Math.floor(i%1e6/1e3))+" ألف "),s+=m(i%1e3),s=s.trim()+" ريال سعودي",e>0&&(s+=` و ${m(e)} هللة`),s}export{he as render};
