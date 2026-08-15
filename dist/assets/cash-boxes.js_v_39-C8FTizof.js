import{g as A,C as I,u as f,f as w,b as P,_ as S,n as R,r as z,d as g,a as h,e as L}from"./index-HrCilPJ3.js";import{s as D,d as J}from"./coa-connector-Bwq94sQ7.js";import{orderBy as F,query as q,limit as G,getDocs as V,doc as y,runTransaction as N,serverTimestamp as x}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function ee(a,n){a.innerHTML=`
    <div class="filterbar">
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn-export" onclick="exportPagePDF('.data-dense','الصناديق_النقدية')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportPageExcel('.data-dense','الصناديق_النقدية')" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn btn-secondary btn-sm" onclick="openCashTxnModal()">+ حركة نقدية</button>
        <button class="btn btn-primary" onclick="openCashBoxModal()">+ صندوق جديد</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">الصناديق النقدية والعهَد</h1>
        <p class="page-subtitle">إدارة عهد المناديـب وصناديق الخزينة الرئيسية والفرعية</p>
      </div>

      <div class="grid-3 gap-16 mb-24" id="cb-grid">
        <div class="page-loading"><div class="loading-spinner"></div></div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 style="font-family:var(--font-heading);font-size:14px;">سجل الحركات النقدية</h3>
        </div>
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>الصندوق</th>
                <th>نوع الحركة</th>
                <th>البيان</th>
                <th>المبلغ</th>
                <th>الرصيد بعد الحركة</th>
                <th>المستخدم</th>
              </tr>
            </thead>
            <tbody id="cb-txn-tbody">
              ${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(7).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- New Cash Box Modal -->
    <div class="modal-overlay" id="cb-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="cb-modal-title">إضافة صندوق نقدي</h3>
          <button class="modal-close" onclick="closeModal('cb-modal')">×</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="cb-edit-id" />
          <div class="form-group mb-16">
            <label>اسم الصندوق / العهدة *</label>
            <input type="text" id="cb-name" class="input" placeholder="مثال: عهدة المندوب أحمد / الصندوق الرئيسي" />
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>نوع الصندوق</label>
              <select id="cb-type">
                <option value="main">خزينة رئيسية</option>
                <option value="rep">عهدة مندوب</option>
                <option value="petty">مصروفات نثرية</option>
              </select>
            </div>
            <div class="form-group">
              <label>المسؤول</label>
              <input type="text" id="cb-keeper" class="input" placeholder="اسم المندوب / أمين الصندوق" />
            </div>
          </div>
          <div class="form-group mb-16">
            <label>الرصيد الافتتاحي (ر.س)</label>
            <input type="number" id="cb-opening" class="input mono" step="0.01" placeholder="0.00" />
          </div>
          <div class="form-group mb-16" id="cb-coa-toggle-wrap" style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="cb-coa-toggle" checked style="width:16px;height:16px;cursor:pointer;" />
            <label for="cb-coa-toggle" style="margin-bottom:0;cursor:pointer;font-weight:bold;">إنشاء حساب مستقل في شجرة الحسابات</label>
          </div>
          <div id="cb-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('cb-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveCashBox()" id="save-cb-btn">حفظ الصندوق</button>
        </div>
      </div>
    </div>

    <!-- Cash Transaction Modal -->
    <div class="modal-overlay" id="cb-txn-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">سند حركة نقدية</h3>
          <button class="modal-close" onclick="closeModal('cb-txn-modal')">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group mb-16">
            <label>الصندوق *</label>
            <select id="ctxn-box" onchange="toggleTxnTypeFields()"></select>
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>نوع الحركة *</label>
              <select id="ctxn-type" onchange="toggleTxnTypeFields()">
                <option value="in">إيداع / قبض (+)</option>
                <option value="out">صرف / سحب (-)</option>
                <option value="transfer">تحويل لصندوق آخر (⇄)</option>
              </select>
            </div>
            <div class="form-group">
              <label>المبلغ (ر.س) *</label>
              <input type="number" id="ctxn-amount" class="input mono" step="0.01" min="0.01" placeholder="0.00" />
            </div>
          </div>
          <div class="form-group mb-16 hidden" id="ctxn-target-box-wrap">
            <label>الصندوق المستلم (إلى) *</label>
            <select id="ctxn-target-box"></select>
          </div>
          <div class="form-group mb-16">
            <label>البيان / السبب *</label>
            <input type="text" id="ctxn-notes" class="input" placeholder="مثال: توريد مبيعات يومية، تسليم نقدية المندوب..." />
          </div>
          <div id="ctxn-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('cb-txn-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveCashTxn()" id="save-ctxn-btn">💾 حفظ الحركة</button>
        </div>
      </div>
    </div>`,await B(),await _()}let m=[];async function B(){const a=document.getElementById("cb-grid");if(a)try{m=await A(I.cashBoxes(),[F("name")]);const n=await A(I.chartOfAccounts());for(const e of m){const t=n.find(o=>o.id===e.accountId||o.code===e.accountCode);if(t){const o=t.balance||0;e.balance!==o&&(e.balance=o,await f("cashBoxes",e.id,{balance:o}))}}if(m.length===0){a.innerHTML='<div class="empty-state" style="grid-column:span 3;"><div class="empty-icon">💵</div><h3>لا توجد صناديق نقدية</h3><p>اضغط على "صندوق جديد" لإضافة خزينة أو عهدة مندوب</p></div>';return}a.innerHTML=m.map(e=>`
      <div class="card" style="padding:20px;">
        <div class="flex items-center justify-between mb-12">
          <span class="badge ${e.type==="main"?"indigo":e.type==="rep"?"lime":"neutral"}">
            ${e.type==="main"?"خزينة رئيسية":e.type==="rep"?"عهدة مندوب":"مصروفات"}
          </span>
          <div class="flex items-center gap-4">
            <button class="btn btn-icon sm btn-ghost" onclick="openCashBoxModal('${e.id}')" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="deleteCashBox('${e.id}','${e.name}')" style="color:var(--bad);" title="حذف">🗑️</button>
          </div>
        </div>
        <h3 style="font-family:var(--font-heading);font-size:16px;margin-bottom:4px;">${e.name}</h3>
        <div class="text-2 mb-12" style="font-size:12px;">المسؤول: ${e.keeper||"—"}</div>
        <div class="section-label mb-4">الرصيد الحالي</div>
        <div class="mono font-bold text-good" style="font-size:24px;">${w(e.balance||0)}</div>
      </div>`).join("")}catch(n){a.innerHTML=`<div class="alert bad">${n.message}</div>`}}async function _(){const a=document.getElementById("cb-txn-tbody");if(a)try{const n=q(I.cashTransactions(),F("createdAt","desc"),G(100)),t=(await V(n)).docs.map(s=>({id:s.id,...s.data()})).reverse(),o={};if(m.forEach(s=>o[s.id]=s.name),t.length===0){a.innerHTML='<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد حركات نقدية مسجلة</td></tr>';return}a.innerHTML=t.map(s=>`
      <tr>
        <td class="dim">${P(s.createdAt)}</td>
        <td class="font-heading font-semibold">${o[s.cashBoxId]||s.cashBoxId}</td>
        <td><span class="badge ${s.type==="in"?"good":"bad"}">${s.type==="in"?"إيداع (+)":"سحب (-)"}</span></td>
        <td>${s.notes||"—"}</td>
        <td class="mono font-bold ${s.type==="in"?"text-good":"text-bad"}">${s.type==="in"?"+":"-"}${w(s.amount)}</td>
        <td class="mono dim">${w(s.balanceAfter||0)}</td>
        <td class="dim" style="font-size:11px;">${s.userName||"النظام"}</td>
      </tr>`).join("")}catch(n){a.innerHTML=`<tr><td colspan="7"><div class="alert bad" style="margin:8px;">${n.message}</div></td></tr>`}}window.openCashBoxModal=(a="")=>{const n=document.getElementById("cb-opening")?.closest(".form-group"),e=document.getElementById("cb-coa-toggle-wrap");if(a){const t=m.find(o=>o.id===a);if(!t)return;document.getElementById("cb-edit-id").value=t.id,document.getElementById("cb-name").value=t.name||"",document.getElementById("cb-keeper").value=t.keeper||"",document.getElementById("cb-opening").value=t.openingBalance||0,n&&(n.style.display="none"),e&&(e.style.display="none")}else{document.getElementById("cb-edit-id").value="",document.getElementById("cb-name").value="",document.getElementById("cb-keeper").value="",document.getElementById("cb-opening").value="",n&&(n.style.display="block"),e&&(e.style.display="flex");const t=document.getElementById("cb-coa-toggle");t&&(t.checked=!0)}document.getElementById("cb-error").classList.add("hidden"),openModal("cb-modal")};window.saveCashBox=async()=>{const a=document.getElementById("cb-error");a.classList.add("hidden");const n=document.getElementById("cb-name").value.trim(),e=document.getElementById("cb-keeper").value.trim(),t=document.getElementById("cb-edit-id").value;if(!n){a.textContent="اسم الصندوق مطلوب",a.classList.remove("hidden");return}const o=document.getElementById("save-cb-btn");o.disabled=!0;try{const{serverTimestamp:s}=await S(async()=>{const{serverTimestamp:c}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{serverTimestamp:c}},[]);if(t){await f("cashBoxes",t,{name:n,keeper:e,updatedAt:s()});const c=m.find(i=>i.id===t);if(c)if(c.accountId)await f("chartOfAccounts",c.accountId,{name:n,updatedAt:s()});else{const i=await D("cashBoxes",t,n);i&&await f("cashBoxes",t,i)}}else{const c=parseFloat(document.getElementById("cb-opening").value)||0,i=document.getElementById("cb-type").value||"main",b={name:n,keeper:e,openingBalance:c,balance:c,type:i,createdAt:s()},r=await R(I.cashBoxes(),b);if(!!document.getElementById("cb-coa-toggle").checked)try{const d=await D("cashBoxes",r,n);d&&await f("cashBoxes",r,d)}catch(d){console.error("Failed to sync cashBox to COA:",d),showToast(`⚠️ تم حفظ الصندوق ولكن فشل تكامل شجرة الحسابات: ${d.message}`,"error")}}showToast("تم إنشاء الصندوق النقدي بنجاح","success"),closeModal("cb-modal"),await B()}catch(s){a.textContent=s.message,a.classList.remove("hidden")}finally{o.disabled=!1}};window.deleteCashBox=async(a,n)=>{if(await showConfirm(`هل تريد حذف الصندوق "${n}" نهائياً؟`,"تأكيد الحذف"))try{const e=m.find(t=>t.id===a);if(e&&e.accountId&&(await J("cashBoxes",a,e.accountId)).action==="archived"){showToast("⚠️ الصندوق لديه معاملات مالية سابقة. تم أرشفته وتجميد حسابه في شجرة الحسابات.","warning"),await B();return}await z("cashBoxes",a),showToast("تم الحذف بنجاح","success"),await B()}catch(e){showToast(e.message,"error")}};window.toggleTxnTypeFields=()=>{const a=document.getElementById("ctxn-type").value,n=document.getElementById("ctxn-target-box-wrap"),e=document.getElementById("ctxn-target-box");if(a==="transfer"){n.classList.remove("hidden");const t=document.getElementById("ctxn-box").value;e.innerHTML=m.filter(o=>o.id!==t).map(o=>`<option value="${o.id}">${o.name} (${w(o.balance||0)})</option>`).join("")}else n.classList.add("hidden")};window.openCashTxnModal=()=>{const a=document.getElementById("ctxn-box");if(m.length===0){showToast("قم بإضافة صندوق نقدي أولاً","warning");return}a.innerHTML=m.map(n=>`<option value="${n.id}">${n.name} (${w(n.balance||0)})</option>`).join(""),document.getElementById("ctxn-type").value="in",document.getElementById("ctxn-amount").value="",document.getElementById("ctxn-notes").value="",document.getElementById("ctxn-error").classList.add("hidden"),toggleTxnTypeFields(),openModal("cb-txn-modal")};window.saveCashTxn=async()=>{const a=document.getElementById("ctxn-error");a.classList.add("hidden");const n=document.getElementById("ctxn-box").value,e=document.getElementById("ctxn-type").value,t=parseFloat(document.getElementById("ctxn-amount").value)||0,o=document.getElementById("ctxn-notes").value.trim();if(!n){a.textContent="اختر الصندوق",a.classList.remove("hidden");return}if(t<=0){a.textContent="المبلغ غير صحيح",a.classList.remove("hidden");return}if(!o){a.textContent="أدخل البيان",a.classList.remove("hidden");return}const s=document.getElementById("save-ctxn-btn");s.disabled=!0;try{if(e==="transfer"){const c=document.getElementById("ctxn-target-box").value;if(!c)throw new Error("اختر الصندوق المستلم");if(c===n)throw new Error("لا يمكن التحويل لنفس الصندوق");const i=y(g,`companies/${h}/cashBoxes`,n),b=y(g,`companies/${h}/cashBoxes`,c);let r=0,l=0,d="",p="",v="",E="";await N(g,async u=>{const k=await u.get(i),M=await u.get(b);if(!k.exists())throw new Error("الصندوق المرسل غير موجود");if(!M.exists())throw new Error("الصندوق المستلم غير موجود");const $=k.data(),C=M.data(),T=$.balance||0,j=C.balance||0;if(d=$.name,p=C.name,v=$.accountCode||"1-1-1-1-3",E=C.accountCode||"1-1-1-1-3",T<t)throw new Error(`رصيد الصندوق المرسل غير كافٍ: ${T} < ${t}`);r=T-t,l=j+t,u.update(i,{balance:r,updatedAt:x()}),u.update(b,{balance:l,updatedAt:x()});const H=y(collection(g,`companies/${h}/cashTransactions`));u.set(H,{cashBoxId:n,type:"out",amount:t,notes:`تحويل إلى ${p} — ${o}`,balanceAfter:r,createdAt:x()});const O=y(collection(g,`companies/${h}/cashTransactions`));u.set(O,{cashBoxId:c,type:"in",amount:t,notes:`تحويل من ${d} — ${o}`,balanceAfter:l,createdAt:x()})});try{await L({date:new Date().toISOString().split("T")[0],description:`تحويل نقدي من صندوق ${d} إلى ${p} — ${o}`,sourceType:"cashTransaction",lines:[{accountCode:E,accountName:p,debit:t,credit:0},{accountCode:v,accountName:d,debit:0,credit:t}],status:"posted",createdByName:"النظام"})}catch(u){console.warn("[CashTxn JE] Failed (non-fatal):",u.message)}}else{const c=y(g,`companies/${h}/cashBoxes`,n);let i=0,b="1-1-1-1-3",r="الصندوق";await N(g,async l=>{const d=await l.get(c);if(!d.exists())throw new Error("الصندوق غير موجود");const p=d.data(),v=p.balance||0,E=e==="in"?+t:-t;if(i=v+E,i<0&&e==="out")throw new Error(`رصيد الصندوق غير كافٍ: ${v} < ${t}`);b=p.accountCode||"1-1-1-1-3",r=p.name,l.update(c,{balance:i,updatedAt:x()});const u=y(collection(g,`companies/${h}/cashTransactions`));l.set(u,{cashBoxId:n,type:e,amount:t,notes:o,balanceAfter:i,createdAt:x()})});try{const l=e==="in"?b:"6-9-1",d=e==="in"?r:"مصاريف متنوعة",p=e==="in"?"4-9-1":b,v=e==="in"?"إيرادات متنوعة":r;await L({date:new Date().toISOString().split("T")[0],description:`حركة نقدية — ${o} — صندوق: ${r}`,sourceType:"cashTransaction",lines:[{accountCode:l,accountName:d,debit:t,credit:0},{accountCode:p,accountName:v,debit:0,credit:t}],status:"posted",createdByName:"النظام"})}catch(l){console.warn("[CashTxn JE] Failed (non-fatal):",l.message)}}showToast("تم تسجيل الحركة النقدية","success"),closeModal("cb-txn-modal"),await B(),await _()}catch(c){a.textContent=c.message,a.classList.remove("hidden")}finally{s.disabled=!1}};export{ee as render};
