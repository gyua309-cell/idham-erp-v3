const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-HrCilPJ3.js","assets/index-BTgEPYae.css"])))=>i.map(i=>d[i]);
import{g as w,C as g,u as p,f as y,b as L,_ as T,n as N,r as _,d as k,a as B}from"./index-HrCilPJ3.js";import{s as I,d as D}from"./coa-connector-Bwq94sQ7.js";import{orderBy as $,query as P,limit as H,getDocs as j,doc as E,runTransaction as O,serverTimestamp as A,collection as F}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function W(t,a){t.innerHTML=`
    <div class="filterbar">
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn-export" onclick="exportPagePDF('.data-dense','الحسابات_البنكية')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportPageExcel('.data-dense','الحسابات_البنكية')" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn btn-secondary btn-sm" onclick="openBankTxnModal()">+ حركة بنكية</button>
        <button class="btn btn-primary" onclick="openBankModal()">+ حساب بنكي جديد</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">الحسابات البنكية والتحويلات</h1>
        <p class="page-subtitle">إدارة الحسابات البنكية السعودية (الراجحي، الأهلي، الرياض...) والتحويلات الإيداعية</p>
      </div>

      <div class="grid-3 gap-16 mb-24" id="ba-grid">
        <div class="page-loading"><div class="loading-spinner"></div></div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 style="font-family:var(--font-heading);font-size:14px;">كشف الحركات البنكية الأخيرة</h3>
        </div>
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>البنك</th>
                <th>نوع الحركة</th>
                <th>رقم المرجع / الحوالة</th>
                <th>البيان</th>
                <th>المبلغ</th>
                <th>الرصيد بعد الحركة</th>
              </tr>
            </thead>
            <tbody id="ba-tbody">
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

    <!-- New Bank Account Modal -->
    <div class="modal-overlay" id="ba-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="ba-modal-title">إضافة حساب بنكي</h3>
          <button class="modal-close" onclick="closeModal('ba-modal')">×</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="ba-edit-id" />
          <div class="form-group mb-16">
            <label>اسم البنك / الحساب *</label>
            <input type="text" id="ba-name" class="input" placeholder="مثال: مصرف الراجحي — الحساب الرئيسي" />
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>رقم الحساب</label>
              <input type="text" id="ba-acc-num" class="input mono" placeholder="1234567890" />
            </div>
            <div class="form-group">
              <label>رقم الآيبان (IBAN)</label>
              <input type="text" id="ba-iban" class="input mono" placeholder="SA0000000000000000000000" />
            </div>
          </div>
          <div class="form-group mb-16">
            <label>الرصيد الافتتاحي (ر.س)</label>
            <input type="number" id="ba-opening" class="input mono" step="0.01" placeholder="0.00" />
          </div>
          <div class="form-group mb-16" id="ba-coa-toggle-wrap" style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="ba-coa-toggle" checked style="width:16px;height:16px;cursor:pointer;" />
            <label for="ba-coa-toggle" style="margin-bottom:0;cursor:pointer;font-weight:bold;">إنشاء حساب مستقل في شجرة الحسابات</label>
          </div>
          <div id="ba-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('ba-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveBankAccount()" id="save-ba-btn">حفظ الحساب</button>
        </div>
      </div>
    </div>

    <!-- Bank Transaction Modal -->
    <div class="modal-overlay" id="ba-txn-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">تسجيل حركة بنكية</h3>
          <button class="modal-close" onclick="closeModal('ba-txn-modal')">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group mb-16">
            <label>الحساب البنكي *</label>
            <select id="btxn-acc"></select>
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>نوع الحركة *</label>
              <select id="btxn-type">
                <option value="in">إيداع / تحويل وارد (+)</option>
                <option value="out">سحب / تحويل صادرة (-)</option>
              </select>
            </div>
            <div class="form-group">
              <label>المبلغ (ر.س) *</label>
              <input type="number" id="btxn-amount" class="input mono" step="0.01" min="0.01" />
            </div>
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>رقم مرجع الحوالة</label>
              <input type="text" id="btxn-ref" class="input mono" placeholder="TRX-987654" />
            </div>
            <div class="form-group">
              <label>البيان / الملاحظات *</label>
              <input type="text" id="btxn-notes" class="input" placeholder="مثال: تحويل سداد عميل، سداد مورد..." />
            </div>
          </div>
          <div id="btxn-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('ba-txn-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveBankTxn()" id="save-btxn-btn">💾 حفظ الحركة</button>
        </div>
      </div>
    </div>`,await v(),await M()}let l=[];async function v(){const t=document.getElementById("ba-grid");if(t)try{l=await w(g.bankAccounts(),[$("name")]);const a=await w(g.chartOfAccounts());for(const e of l){const n=a.find(d=>d.id===e.accountId||d.code===e.accountCode);if(n){const d=n.balance||0;e.balance!==d&&(e.balance=d,await p("bankAccounts",e.id,{balance:d}))}}if(l.length===0){t.innerHTML='<div class="empty-state" style="grid-column:span 3;"><div class="empty-icon">🏦</div><h3>لا توجد حسابات بنكية</h3><p>اضغط على "حساب بنكي جديد" لإضافة حسابك في البنك</p></div>';return}t.innerHTML=l.map(e=>`
      <div class="card" style="padding:20px;">
        <div class="flex items-center justify-between mb-12">
          <span class="badge indigo">🏦 بنكي</span>
          <div class="flex items-center gap-4">
            <button class="btn btn-icon sm btn-ghost" onclick="openBankModal('${e.id}')" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="deleteBankAccount('${e.id}','${e.name}')" style="color:var(--bad);" title="حذف">🗑️</button>
          </div>
        </div>
        <h3 style="font-family:var(--font-heading);font-size:16px;margin-bottom:4px;">${e.name}</h3>
        <div class="mono text-2 mb-12" style="font-size:11px;">IBAN: ${e.iban||"—"}</div>
        <div class="section-label mb-4">الرصيد الحالي</div>
        <div class="mono font-bold text-indigo" style="font-size:24px;">${y(e.balance||0)}</div>
      </div>`).join("")}catch(a){t.innerHTML=`<div class="alert bad">${a.message}</div>`}}async function M(){const t=document.getElementById("ba-tbody");if(t)try{const a=P(g.bankTransactions(),$("createdAt","desc"),H(100)),n=(await j(a)).docs.map(o=>({id:o.id,...o.data()})).reverse(),d={};if(l.forEach(o=>d[o.id]=o.name),n.length===0){t.innerHTML='<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد حركات بنكية مسجلة</td></tr>';return}t.innerHTML=n.map(o=>`
      <tr>
        <td class="dim">${L(o.createdAt)}</td>
        <td class="font-heading font-semibold">${d[o.bankAccountId]||o.bankAccountId}</td>
        <td><span class="badge ${o.type==="in"?"good":"bad"}">${o.type==="in"?"إيداع (+)":"سحب (-)"}</span></td>
        <td class="mono dim">${o.refNumber||"—"}</td>
        <td>${o.notes||"—"}</td>
        <td class="mono font-bold ${o.type==="in"?"text-good":"text-bad"}">${o.type==="in"?"+":"-"}${y(o.amount)}</td>
        <td class="mono dim">${y(o.balanceAfter||0)}</td>
      </tr>`).join("")}catch(a){t.innerHTML=`<tr><td colspan="7"><div class="alert bad" style="margin:8px;">${a.message}</div></td></tr>`}}window.openBankModal=(t="")=>{const a=document.getElementById("ba-opening")?.closest(".form-group"),e=document.getElementById("ba-coa-toggle-wrap");if(t){const n=l.find(d=>d.id===t);if(!n)return;document.getElementById("ba-edit-id").value=n.id,document.getElementById("ba-name").value=n.name||"",document.getElementById("ba-acc-num").value=n.accountNumber||"",document.getElementById("ba-iban").value=n.iban||"",document.getElementById("ba-opening").value=n.openingBalance||0,a&&(a.style.display="none"),e&&(e.style.display="none")}else{document.getElementById("ba-edit-id").value="",document.getElementById("ba-name").value="",document.getElementById("ba-acc-num").value="",document.getElementById("ba-iban").value="",document.getElementById("ba-opening").value="",a&&(a.style.display="block"),e&&(e.style.display="flex");const n=document.getElementById("ba-coa-toggle");n&&(n.checked=!0)}document.getElementById("ba-error").classList.add("hidden"),openModal("ba-modal")};window.saveBankAccount=async()=>{const t=document.getElementById("ba-error");t.classList.add("hidden");const a=document.getElementById("ba-name").value.trim(),e=document.getElementById("ba-acc-num").value.trim(),n=document.getElementById("ba-iban").value.trim(),d=document.getElementById("ba-edit-id").value;if(!a){t.textContent="اسم البنك مطلوب",t.classList.remove("hidden");return}const o=document.getElementById("save-ba-btn");o.disabled=!0;try{const{serverTimestamp:c}=await T(async()=>{const{serverTimestamp:s}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{serverTimestamp:s}},[]);if(d){await p("bankAccounts",d,{name:a,accountNumber:e,iban:n,updatedAt:c()});const s=l.find(i=>i.id===d);if(s)if(s.accountId)await p("chartOfAccounts",s.accountId,{name:a,updatedAt:c()});else{const i=await I("banks",d,a);i&&await p("bankAccounts",d,i)}}else{const s=parseFloat(document.getElementById("ba-opening").value)||0,i={name:a,accountNumber:e,iban:n,openingBalance:s,balance:s,createdAt:c()},b=await N(g.bankAccounts(),i);if(!!document.getElementById("ba-coa-toggle").checked){const m=await I("banks",b,a);m&&await p("bankAccounts",b,m)}}showToast("تم الحفظ بنجاح","success"),closeModal("ba-modal"),await v()}catch(c){t.textContent=c.message,t.classList.remove("hidden")}finally{o.disabled=!1}};window.deleteBankAccount=async(t,a)=>{if(await showConfirm(`هل تريد حذف الحساب البنكي "${a}" نهائياً؟`,"تأكيد الحذف"))try{const e=l.find(n=>n.id===t);if(e&&e.accountId&&(await D("bankAccounts",t,e.accountId)).action==="archived"){showToast("⚠️ الحساب البنكي لديه معاملات مالية سابقة. تم أرشفته وتجميد حسابه في شجرة الحسابات.","warning"),await v();return}await _("bankAccounts",t),showToast("تم الحذف بنجاح","success"),await v()}catch(e){showToast(e.message,"error")}};window.openBankTxnModal=()=>{const t=document.getElementById("btxn-acc");if(l.length===0){showToast("قم بإضافة حساب بنكي أولاً","warning");return}t.innerHTML=l.map(a=>`<option value="${a.id}">${a.name} (${y(a.balance||0)})</option>`).join(""),document.getElementById("btxn-amount").value="",document.getElementById("btxn-ref").value="",document.getElementById("btxn-notes").value="",document.getElementById("btxn-error").classList.add("hidden"),openModal("ba-txn-modal")};window.saveBankTxn=async()=>{const t=document.getElementById("btxn-error");t.classList.add("hidden");const a=document.getElementById("btxn-acc").value,e=document.getElementById("btxn-type").value,n=parseFloat(document.getElementById("btxn-amount").value)||0,d=document.getElementById("btxn-notes").value.trim();if(!a){t.textContent="اختر البنك",t.classList.remove("hidden");return}if(n<=0){t.textContent="المبلغ غير صحيح",t.classList.remove("hidden");return}if(!d){t.textContent="أدخل البيان",t.classList.remove("hidden");return}const o=document.getElementById("save-btxn-btn");o.disabled=!0;try{const c=E(k,`companies/${B}/bankAccounts`,a);let s=0,i="1-1-1-3",b="البنك";await O(k,async r=>{const m=await r.get(c);if(!m.exists())throw new Error("الحساب البنكي غير موجود");const u=m.data(),f=u.balance||0,h=e==="in"?+n:-n;s=f+h,i=u.accountCode||"1-1-1-3",b=u.name,r.update(c,{balance:s,updatedAt:A()});const x=E(F(k,`companies/${B}/bankTransactions`));r.set(x,{bankAccountId:a,type:e,amount:n,refNumber:document.getElementById("btxn-ref").value.trim(),notes:d,balanceAfter:s,createdAt:A()})});try{const{createJournalEntry:r}=await T(async()=>{const{createJournalEntry:x}=await import("./index-HrCilPJ3.js").then(C=>C.N);return{createJournalEntry:x}},__vite__mapDeps([0,1])),m=e==="in"?i:"6-9-1",u=e==="in"?b:"مصاريف متنوعة",f=e==="in"?"4-9-1":i,h=e==="in"?"إيرادات متنوعة":b;await r({date:new Date().toISOString().split("T")[0],description:`حركة بنكية — ${d} — حساب: ${b}`,sourceType:"bankTransaction",lines:[{accountCode:m,accountName:u,debit:n,credit:0},{accountCode:f,accountName:h,debit:0,credit:n}],status:"posted",createdByName:"النظام"})}catch(r){console.warn("[BankTxn JE] Failed (non-fatal):",r.message)}showToast("تم تسجيل الحركة البنكية","success"),closeModal("ba-txn-modal"),await v(),await M()}catch(c){t.textContent=c.message,t.classList.remove("hidden")}finally{o.disabled=!1}};export{W as render};
