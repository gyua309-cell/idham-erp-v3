import{t as p,a as q,f as x,g as C,o as w,e as h,u as B,r as A}from"./index-CEMoTDyX.js";import{query as N,orderBy as k,getDocs as $}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let b=[],u=[],E=[];async function S(e,c){e.innerHTML=`
    <div class="filterbar">
      <div class="date-range-group">
        <label>الحالة</label>
        <select id="chq-status-filter" class="input" onchange="loadCheques()">
          <option value="all">الكل</option>
          <option value="pending" selected>تحت التحصيل/مؤجل</option>
          <option value="cleared">مُحصَّل (مصروف)</option>
          <option value="bounced">مرتجع (بدون رصيد)</option>
        </select>
      </div>
      <div style="margin-right:auto; display:flex; gap:12px;">
        <button class="btn-export" onclick="exportPagePDF('.data-dense','الشيكات')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportPageExcel('.data-dense','الشيكات')" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn btn-secondary" onclick="openChequeModal('payable')">+ ورقة دفع (شيك صادر)</button>
        <button class="btn btn-primary" onclick="openChequeModal('receivable')">+ ورقة قبض (شيك وارد)</button>
      </div>
    </div>
    
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">أوراق القبض والدفع (الشيكات)</h1>
        <p class="page-subtitle">متابعة الشيكات الواردة والصادرة وحالتها البنكية</p>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>النوع</th>
                <th>رقم الشيك</th>
                <th>البنك (المسحوب عليه)</th>
                <th>تاريخ الاستحقاق</th>
                <th>البيان / المستفيد</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th style="width:120px;">إجراءات</th>
              </tr>
            </thead>
            <tbody id="chq-tbody">
              ${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Cheque Modal -->
    <div class="modal-overlay" id="chq-modal">
      <div class="modal modal-md">
        <div class="modal-header">
          <h3 class="modal-title" id="chq-modal-title">تسجيل شيك</h3>
          <button class="modal-close" onclick="closeModal('chq-modal')">×</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="chq-type" />
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group"><label>رقم الشيك *</label><input type="text" id="chq-number" class="input mono" /></div>
            <div class="form-group"><label>تاريخ الاستحقاق *</label><input type="date" id="chq-date" class="input" value="${p()}" /></div>
          </div>
          
          <div class="form-group mb-16">
            <label>المبلغ *</label>
            <input type="number" id="chq-amount" class="input mono" min="0" step="0.01" />
          </div>

          <div class="grid-2 gap-16 mb-16">
            <div class="form-group"><label>البنك (إصدار/سحب) *</label><input type="text" id="chq-bank-name" class="input" placeholder="مثال: البنك الأهلي" /></div>
            <div class="form-group"><label>اسم المستفيد / الساحب *</label><input type="text" id="chq-beneficiary" class="input" /></div>
          </div>

          <div class="form-group mb-16">
            <label id="chq-acc-label">حساب المورد / العميل (شجرة الحسابات) *</label>
            <select id="chq-account" class="input"></select>
          </div>

          <div class="form-group mb-16">
            <label>ملاحظات</label>
            <textarea id="chq-notes" class="input" rows="2"></textarea>
          </div>
          <div id="chq-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('chq-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveCheque()" id="save-chq-btn">حفظ الشيك</button>
        </div>
      </div>
    </div>

    <!-- Action Modal (Clear/Bounce) -->
    <div class="modal-overlay" id="chq-action-modal">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3 class="modal-title">تحديث حالة الشيك</h3>
          <button class="modal-close" onclick="closeModal('chq-action-modal')">×</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="action-chq-id" />
          <input type="hidden" id="action-chq-status" />
          <p id="action-chq-msg" style="margin-bottom:16px;"></p>
          <div class="form-group">
            <label>اختر الحساب البنكي للتأثير *</label>
            <select id="action-bank-acc" class="input"></select>
          </div>
          <div id="action-chq-error" class="alert bad hidden" style="margin-top:16px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('chq-action-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="submitChequeAction()" id="save-action-btn">تأكيد</button>
        </div>
      </div>
    </div>
  `,await Promise.all([T(),window.loadCheques=v]),await v()}async function T(){u=await C(q.chartOfAccounts()),E=await C(q.bankAccounts()),document.getElementById("action-bank-acc").innerHTML='<option value="">اختر الحساب البنكي...</option>'+E.map(e=>`<option value="${e.id}">${e.bankName} - ${e.accountNumber}</option>`).join("")}async function v(){const e=document.getElementById("chq-status-filter").value,c=document.getElementById("chq-tbody");try{const n=N(q.cheques(),k("createdAt","desc"));if(b=(await $(n)).docs.map(t=>({id:t.id,...t.data()})),e!=="all"&&(b=b.filter(t=>t.status===e)),!b.length){c.innerHTML='<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-3);">لا توجد شيكات</td></tr>';return}c.innerHTML=b.map(t=>{let a=t.type==="receivable"?'<span class="badge bg-good text-white">قبض (وارد)</span>':'<span class="badge bg-bad text-white">دفع (صادر)</span>',d="";return t.status==="pending"?d='<span class="badge bg-info text-white">تحت التحصيل</span>':t.status==="cleared"?d='<span class="badge bg-good text-white">محصَّل</span>':d='<span class="badge bg-bad text-white">مرتجع</span>',`
        <tr>
          <td>${a}</td>
          <td class="mono font-bold">${t.chqNumber}</td>
          <td>${t.bankName}</td>
          <td>${t.dueDate}</td>
          <td>${t.beneficiary}</td>
          <td class="mono text-bad">${x(t.amount)}</td>
          <td>${d}</td>
          <td>
            ${t.status==="pending"?`
              <button class="btn btn-icon sm btn-ghost text-good" onclick="promptChequeAction('${t.id}', 'cleared')" title="تحصيل/صرف">✔️</button>
              <button class="btn btn-icon sm btn-ghost text-bad" onclick="promptChequeAction('${t.id}', 'bounced')" title="ارتجاع">❌</button>
            `:""}
            <button class="btn btn-icon sm btn-ghost text-bad" onclick="delCheque('${t.id}')">🗑️</button>
          </td>
        </tr>
      `}).join("")}catch(n){console.error(n),c.innerHTML='<tr><td colspan="8" class="text-bad" style="text-align:center;">خطأ في التحميل</td></tr>'}}window.openChequeModal=e=>{document.getElementById("chq-type").value=e,document.getElementById("chq-modal-title").textContent=e==="receivable"?"تسجيل ورقة قبض (شيك وارد)":"تسجيل ورقة دفع (شيك صادر)",document.getElementById("chq-acc-label").textContent=e==="receivable"?"حساب العميل (الساحب) *":"حساب المورد (المستفيد) *";const c=e==="receivable"?["customer"]:["vendor"],n=u.filter(o=>c.includes(o.type));document.getElementById("chq-account").innerHTML='<option value="">اختر...</option>'+n.map(o=>`<option value="${o.id}">${o.code} - ${o.name}</option>`).join(""),document.getElementById("chq-number").value="",document.getElementById("chq-date").value=p(),document.getElementById("chq-amount").value="",document.getElementById("chq-bank-name").value="",document.getElementById("chq-beneficiary").value="",document.getElementById("chq-notes").value="",document.getElementById("chq-error").classList.add("hidden"),openModal("chq-modal")};window.saveCheque=async()=>{const e=document.getElementById("chq-error");e.classList.add("hidden");const c=document.getElementById("chq-type").value,n=document.getElementById("chq-number").value.trim(),o=document.getElementById("chq-date").value,t=parseFloat(document.getElementById("chq-amount").value),a=document.getElementById("chq-bank-name").value.trim(),d=document.getElementById("chq-beneficiary").value.trim(),i=document.getElementById("chq-account").value;if(!n||!o||!t||!a||!d||!i){e.textContent="الرجاء تعبئة جميع الحقول المطلوبة (*)",e.classList.remove("hidden");return}const y=document.getElementById("save-chq-btn");y.disabled=!0;try{const s={type:c,chqNumber:n,dueDate:o,amount:t,bankName:a,beneficiary:d,accountId:i,accountName:u.find(r=>r.id===i)?.name,notes:document.getElementById("chq-notes").value,status:"pending"},m=await w(q.cheques(),s),l=u.find(r=>r.name.includes("أوراق قبض"))?.id||"NOTES_REC",M=u.find(r=>r.name.includes("أوراق دفع"))?.id||"NOTES_PAY",f=u.find(r=>r.name.includes("أوراق قبض"))||{id:"NOTES_REC",code:"112",name:"أوراق قبض"},I=u.find(r=>r.name.includes("أوراق دفع"))||{id:"NOTES_PAY",code:"212",name:"أوراق دفع"},g=u.find(r=>r.id===i);c==="receivable"?await h({date:o,description:`استلام شيك #${n} من ${s.accountName}`,sourceType:"cheque",sourceId:m,lines:[{accountId:f.id,accountCode:f.code,accountName:f.name,debit:t,credit:0,note:"استلام شيك"},{accountId:i,accountCode:g?.code||"",accountName:g?.name||"",debit:0,credit:t,note:"سداد بشيك"}]}):await h({date:o,description:`إصدار شيك #${n} لـ ${s.accountName}`,sourceType:"cheque",sourceId:m,lines:[{accountId:i,accountCode:g?.code||"",accountName:g?.name||"",debit:t,credit:0,note:"دفعة بشيك"},{accountId:I.id,accountCode:I.code,accountName:I.name,debit:0,credit:t,note:"إصدار شيك"}]}),showToast("تم تسجيل الشيك وإنشاء القيد المحاسبي المبدئي","success"),closeModal("chq-modal"),await v()}catch(s){e.textContent=s.message,e.classList.remove("hidden")}finally{y.disabled=!1}};window.promptChequeAction=(e,c)=>{if(!b.find(t=>t.id===e))return;document.getElementById("action-chq-id").value=e,document.getElementById("action-chq-status").value=c;const o=c==="cleared"?"هل أنت متأكد من تحصيل/صرف هذا الشيك فعلياً في البنك؟ سيتم التأثير على حساب البنك المختار.":"هل أنت متأكد من ارتجاع هذا الشيك (بدون رصيد)؟ سيتم عكس القيد المحاسبي.";document.getElementById("action-chq-msg").textContent=o,document.getElementById("action-chq-error").classList.add("hidden"),openModal("chq-action-modal")};window.submitChequeAction=async()=>{const e=document.getElementById("action-chq-error");e.classList.add("hidden");const c=document.getElementById("action-chq-id").value,n=document.getElementById("action-chq-status").value,o=document.getElementById("action-bank-acc").value;if(n==="cleared"&&!o){e.textContent="الرجاء اختيار الحساب البنكي للتأثير",e.classList.remove("hidden");return}const t=document.getElementById("save-action-btn");t.disabled=!0;try{const a=b.find(l=>l.id===c);await B("cheques",c,{status:n});const d=u.find(l=>l.name.includes("أوراق قبض"))||{id:"NOTES_REC",code:"112",name:"أوراق قبض"},i=u.find(l=>l.name.includes("أوراق دفع"))||{id:"NOTES_PAY",code:"212",name:"أوراق دفع"},y=E.find(l=>l.id===o)?.accountId||"BANK_ACC",s=u.find(l=>l.id===y)||{id:"BANK_ACC",code:"102",name:"البنك"},m=u.find(l=>l.id===a.accountId);n==="cleared"?a.type==="receivable"?await h({date:p(),description:`تحصيل شيك وارد #${a.chqNumber}`,sourceType:"cheque_clear",sourceId:c,lines:[{accountId:s.id,accountCode:s.code,accountName:s.name,debit:a.amount,credit:0,note:"إيداع شيك"},{accountId:d.id,accountCode:d.code,accountName:d.name,debit:0,credit:a.amount,note:"إقفال ورقة قبض"}]}):await h({date:p(),description:`صرف شيك صادر #${a.chqNumber}`,sourceType:"cheque_clear",sourceId:c,lines:[{accountId:i.id,accountCode:i.code,accountName:i.name,debit:a.amount,credit:0,note:"إقفال ورقة دفع"},{accountId:s.id,accountCode:s.code,accountName:s.name,debit:0,credit:a.amount,note:"سحب شيك"}]}):n==="bounced"&&(a.type==="receivable"?await h({date:p(),description:`ارتجاع شيك وارد #${a.chqNumber}`,sourceType:"cheque_bounce",sourceId:c,lines:[{accountId:a.accountId,accountCode:m?.code||"",accountName:m?.name||"",debit:a.amount,credit:0,note:"عكس تسوية (مرتجع)"},{accountId:d.id,accountCode:d.code,accountName:d.name,debit:0,credit:a.amount,note:"إلغاء ورقة قبض"}]}):await h({date:p(),description:`ارتجاع شيك صادر #${a.chqNumber}`,sourceType:"cheque_bounce",sourceId:c,lines:[{accountId:i.id,accountCode:i.code,accountName:i.name,debit:a.amount,credit:0,note:"إلغاء ورقة دفع"},{accountId:a.accountId,accountCode:m?.code||"",accountName:m?.name||"",debit:0,credit:a.amount,note:"عكس سداد (مرتجع)"}]})),showToast("تم تحديث حالة الشيك وإنشاء القيود اللازمة","success"),closeModal("chq-action-modal"),await v()}catch(a){e.textContent=a.message,e.classList.remove("hidden")}finally{t.disabled=!1}};window.delCheque=async e=>{if(confirm("تحذير: سيتم حذف سجل الشيك. هل تريد الاستمرار؟"))try{await A("cheques",e),showToast("تم الحذف","success"),await v()}catch(c){showToast(c.message,"error")}};export{S as render};
