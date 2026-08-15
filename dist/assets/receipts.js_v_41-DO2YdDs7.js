import{s as Q,t as z,d as p,a as l,f as R,g as E,C,i as Z,h as T,e as V,_ as ee}from"./index-HrCilPJ3.js";import{query as S,collection as I,getDocs as j,runTransaction as _,doc as m,serverTimestamp as b,getDoc as $,where as q,writeBatch as G}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import{recalculateCustomerBalance as J,recalculateSupplierBalance as W}from"./balance-sync-B0nwXHmR.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";import"./sync-engine-CjRafMpJ.js";let L=[],g=[],N=[],M=[],P=[],H=[],k=null;async function te(){L=(await E(C.costCenters()).catch(()=>[])).sort((t,n)=>(t.code||"").localeCompare(n.code||""));const o=document.getElementById("rcpt-cc-sel");o&&(o.innerHTML='<option value="">بدون مركز تكلفة</option>'+L.map(t=>`<option value="${t.id}">${t.code} — ${t.name}</option>`).join(""))}async function ye(e,o){e.innerHTML=`
    <div class="filterbar" style="flex-wrap:wrap;gap:8px;align-items:flex-end;">
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="rcpt-from" value="${Q()}" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="rcpt-to" value="${z()}" />
      </div>
      <div class="filter-select-group">
        <label>نوع الجهة</label>
        <select id="rcpt-entity-type-filter" onchange="loadReceipts()">
          <option value="">كل الجهات</option>
          <option value="customer">عميل</option>
          <option value="supplier">مورد</option>
          <option value="revenue">إيراد مباشر</option>
          <option value="other">حساب عام</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>طريقة الدفع</label>
        <select id="rcpt-method-filter" onchange="loadReceipts()">
          <option value="">كل الطرق</option>
          <option value="cash">نقدي</option>
          <option value="bank">تحويل بنكي</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="exportPagePDF('.data-dense','سندات_القبض')" title="تصدير PDF">📄 PDF</button>
        <button class="btn btn-secondary btn-sm" onclick="exportPageExcel('.data-dense','سندات_القبض')" title="تصدير Excel">📊 Excel</button>
        <button class="btn btn-primary" onclick="openReceiptModal()">+ سند قبض جديد</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">إدارة سندات القبض (Receipts)</h1>
        <p class="page-subtitle" id="rcpt-count">سجل سندات القبض النقدية والبنكية للعملاء والإيرادات</p>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>رقم السند</th>
                <th>جهة القبض</th>
                <th>نوع الجهة</th>
                <th>البيان</th>
                <th>طريقة القبض</th>
                <th>مركز التكلفة</th>
                <th style="text-align:left;">المبلغ</th>
                <th style="text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="rcpt-tbody">
              ${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(9).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px;height:12px;margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         Receipt Form Modal (New + Edit)
    ═══════════════════════════════════════════════════════ -->
    <div class="modal-overlay" id="receipt-modal">
      <div class="modal modal-md">
        <div class="modal-header">
          <h3 class="modal-title" id="rcpt-modal-title">سند قبض جديد (Receipt Voucher)</h3>
          <button class="modal-close" onclick="closeModal('receipt-modal')">×</button>
        </div>
        <div class="modal-body">
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>التاريخ *</label>
              <input type="date" id="rcpt-date" class="input" value="${z()}" />
            </div>
            <div class="form-group">
              <label>المبلغ *</label>
              <input type="number" id="rcpt-amount" class="input mono" min="0" step="0.01" />
            </div>
          </div>

          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>جهة القبض (النوع) *</label>
              <select id="rcpt-entity-type" class="input" onchange="onReceiptEntityTypeChange()">
                <option value="customer">عميل (تحصيل ذمة مدينة)</option>
                <option value="supplier">مورد (استرداد نقدية)</option>
                <option value="revenue">بند إيراد مباشر</option>
                <option value="other">حساب عام</option>
              </select>
            </div>
            <div class="form-group">
              <label id="rcpt-entity-label">الحساب / الكيان المقابل *</label>
              <select id="rcpt-target-entity" class="input">
                <option value="">اختر...</option>
              </select>
            </div>
          </div>

          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>طريقة القبض *</label>
              <select id="rcpt-pay-method" class="input" onchange="toggleReceiptPaySource()">
                <option value="cash">نقدي (إيداع بصندوق)</option>
                <option value="bank">تحويل بنكي (إيداع ببنك)</option>
              </select>
            </div>
            <div class="form-group">
              <label id="rcpt-source-label">صندوق الاستلام *</label>
              <select id="rcpt-source" class="input">
                <option value="">اختر...</option>
              </select>
            </div>
          </div>

          <div class="form-group mb-16">
            <label>البيان / ملاحظات *</label>
            <textarea id="rcpt-notes" class="input" rows="2" placeholder="اكتب بياناً تفصيلياً لعملية القبض والتحصيل..."></textarea>
          </div>

          <div class="form-group mb-16">
            <label>🏷️ مركز التكلفة (اختياري)</label>
            <select id="rcpt-cc-sel" class="input">
              <option value="">بدون مركز تكلفة</option>
            </select>
          </div>

          <div class="form-group mb-16" id="rcpt-file-group">
            <label>📁 إرفاق إيصال / صورة التحويل البنكي أو الشيك</label>
            <input type="file" id="rcpt-file-upload" class="input" accept="image/*,application/pdf" />
          </div>

          <div id="rcpt-error" class="alert bad hidden" style="margin-top:16px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('receipt-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveReceipt()" id="save-rcpt-btn">حفظ واعتماد</button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         Receipt Preview Modal
    ═══════════════════════════════════════════════════════ -->
    <div class="modal-overlay" id="receipt-preview-modal">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">معاينة سند القبض</h3>
          <button class="modal-close" onclick="closeModal('receipt-preview-modal')">×</button>
        </div>
        <div class="modal-body" id="receipt-preview-body">
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('receipt-preview-modal')">إغلاق</button>
          <button class="btn btn-primary" onclick="printReceiptVoucher()">🖨️ طباعة</button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         Delete Confirm Modal
    ═══════════════════════════════════════════════════════ -->
    <div class="modal-overlay" id="rcpt-delete-modal">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3 class="modal-title" style="color:var(--bad);">⚠️ تأكيد حذف سند القبض</h3>
          <button class="modal-close" onclick="closeModal('rcpt-delete-modal')">×</button>
        </div>
        <div class="modal-body">
          <p style="margin-bottom:12px;font-size:15px;">هل أنت متأكد من حذف هذا السند؟</p>
          <div id="rcpt-delete-info" style="background:var(--bg-2);border-radius:8px;padding:12px;font-size:13px;line-height:1.8;"></div>
          <div class="alert bad" style="margin-top:16px;font-size:13px;">
            ⚠️ سيتم حذف <strong>السند + القيود المحاسبية + حركات الصندوق/البنك</strong> المرتبطة به نهائياً ولا يمكن التراجع عن ذلك.
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('rcpt-delete-modal')">إلغاء</button>
          <button class="btn btn-danger" onclick="confirmDeleteReceipt()" id="rcpt-confirm-delete-btn">🗑️ حذف نهائياً</button>
        </div>
      </div>
    </div>
  `;const t=e.querySelector("#rcpt-from"),n=e.querySelector("#rcpt-to");t&&t.addEventListener("change",A),n&&n.addEventListener("change",A),await Promise.all([oe(),te(),A()])}async function oe(){[g,N,M,P,H]=await Promise.all([E(C.chartOfAccounts()),E(C.cashBoxes()),E(C.bankAccounts()),E(C.suppliers()),E(C.customers())]),onReceiptEntityTypeChange(),toggleReceiptPaySource()}window.onReceiptEntityTypeChange=()=>{const e=document.getElementById("rcpt-entity-type").value,o=document.getElementById("rcpt-entity-label"),t=document.getElementById("rcpt-target-entity");t.innerHTML='<option value="">اختر...</option>',e==="customer"?(o.textContent="العميل المستهدف *",t.innerHTML+=H.map(n=>`<option value="${n.id}">${n.name}</option>`).join("")):e==="supplier"?(o.textContent="المورد المستهدف *",t.innerHTML+=P.map(n=>`<option value="${n.id}">${n.name}</option>`).join("")):e==="revenue"?(o.textContent="بند الإيراد (الحساب) *",t.innerHTML+=g.filter(n=>n.type==="revenue").map(n=>`<option value="${n.id}">${n.code} - ${n.name}</option>`).join("")):(o.textContent="الحساب الدائن (دليل الحسابات) *",t.innerHTML+=g.map(n=>`<option value="${n.id}">${n.code} - ${n.name}</option>`).join(""))};window.toggleReceiptPaySource=()=>{const e=document.getElementById("rcpt-pay-method").value,o=document.getElementById("rcpt-source-label"),t=document.getElementById("rcpt-source");t.innerHTML='<option value="">اختر...</option>',e==="cash"?(o.textContent="صندوق الاستلام *",t.innerHTML+=N.map(n=>`<option value="${n.id}">${n.name}</option>`).join("")):(o.textContent="الحساب البنكي المودع به *",t.innerHTML+=M.map(n=>`<option value="${n.id}">${n.name||"بنك"} - ${n.accountNumber||""}</option>`).join(""))};window.openReceiptModal=(e=null)=>{k=e?e.id:null;const o=document.getElementById("rcpt-modal-title"),t=document.getElementById("rcpt-file-group");e?(o.textContent=`تعديل سند القبض — #${e.id.substring(0,6).toUpperCase()}`,t&&(t.style.display="none")):(o.textContent="سند قبض جديد (Receipt Voucher)",t&&(t.style.display="")),document.getElementById("rcpt-date").value=e?.date||z(),document.getElementById("rcpt-amount").value=e?.amount||"",document.getElementById("rcpt-notes").value=e?.notes||"";const n=document.getElementById("rcpt-entity-type");n.value=e?.entityType||"customer",onReceiptEntityTypeChange(),setTimeout(()=>{const d=document.getElementById("rcpt-target-entity");e?.targetId&&(d.value=e.targetId);const s=document.getElementById("rcpt-pay-method");s.value=e?.method||"cash",toggleReceiptPaySource(),setTimeout(()=>{const i=document.getElementById("rcpt-source");e?.sourceId&&(i.value=e.sourceId);const a=document.getElementById("rcpt-cc-sel");a&&e?.costCenterId&&(a.value=e.costCenterId)},50)},50),document.getElementById("rcpt-error").classList.add("hidden"),openModal("receipt-modal")};window.saveReceipt=async()=>{const e=document.getElementById("rcpt-error");e.classList.add("hidden");const o=document.getElementById("rcpt-date").value,t=parseFloat(document.getElementById("rcpt-amount").value),n=document.getElementById("rcpt-entity-type").value,d=document.getElementById("rcpt-target-entity").value,s=document.getElementById("rcpt-pay-method").value,i=document.getElementById("rcpt-source").value,a=document.getElementById("rcpt-notes").value.trim(),c=document.getElementById("rcpt-cc-sel")?.value||null;if(!o||!t||t<=0||!d||!i||!a){e.textContent="الرجاء تعبئة جميع الحقول المطلوبة وكتابة بيان صحيح",e.classList.remove("hidden");return}const f=document.getElementById("save-rcpt-btn");f.disabled=!0,f.textContent=k?"جاري التعديل...":"جاري الحفظ...";try{if(await Z(o)){e.textContent=`⚠️ لا يمكن الحفظ لأن تاريخ (${o}) يقع في فترة محاسبية مغلقة.`,e.classList.remove("hidden");return}const{creditAccId:u,creditAccCode:h,creditAccName:y,destinationName:r}=ce(n,d),{debitAccId:v,debitAccCode:B,debitAccName:U,sourceDocRef:D}=de(s,i),F=s==="cash"?N.find(x=>x.id===i)?.name:M.find(x=>x.id===i)?.name,O=L.find(x=>x.id===c)?.name||null;if(k)await ae({id:k,date:o,amount:t,entityType:n,targetId:d,accountName:r||"إيراد",method:s,sourceId:i,sourceName:F,notes:a,ccId:c,ccName:O,debitAccId:v,debitAccCode:B,debitAccName:U,creditAccId:u,creditAccCode:h,creditAccName:y,sourceDocRef:D}),showToast("تم تعديل سند القبض وتحديث القيود","success");else{await ne({date:o,amount:t,entityType:n,targetId:d,accountName:r||"إيراد",method:s,sourceId:i,sourceName:F,notes:a,ccId:c,ccName:O,debitAccId:v,debitAccCode:B,debitAccName:U,creditAccId:u,creditAccCode:h,creditAccName:y,sourceDocRef:D});const x=document.getElementById("rcpt-file-upload");x?.files?.length>0&&window.uploadFileToArchive(x.files[0],"bank_transfers","new",`مرفق سند قبض — ${a}`).catch(K=>console.warn(K)),showToast("تم حفظ سند القبض واعتماده","success")}T(`companies/${l}/receipts`),T(`companies/${l}/chartOfAccounts`),T(`companies/${l}/journalEntries`),closeModal("receipt-modal"),await A(),n==="customer"?J(d).catch(()=>{}):n==="supplier"&&W(d).catch(()=>{})}catch(u){e.textContent=u.message,e.classList.remove("hidden")}finally{f.disabled=!1,f.textContent="حفظ واعتماد"}};async function ne(e){let o="";return await _(p,async t=>{let n=0;if(e.sourceDocRef){const f=await t.get(e.sourceDocRef);f.exists()&&(n=parseFloat(f.data().balance||0))}const d=n+e.amount,s=m(I(p,`companies/${l}/receipts`));o=s.id,t.set(s,{date:e.date,amount:e.amount,entityType:e.entityType,targetId:e.targetId,accountName:e.accountName,method:e.method,sourceId:e.sourceId,sourceName:e.sourceName,notes:e.notes,costCenterId:e.ccId,costCenterName:e.ccName,createdAt:b(),updatedAt:b()}),e.sourceDocRef&&t.update(e.sourceDocRef,{balance:d,updatedAt:b()});const i=e.method==="cash"?`companies/${l}/cashTransactions`:`companies/${l}/bankTransactions`,a=m(I(p,i)),c=e.method==="cash"?{cashBoxId:e.sourceId,type:"in",amount:e.amount,balanceAfter:d,sourceType:"receipt",sourceId:o,notes:`سند قبض — ${e.notes}`,createdAt:b()}:{bankAccountId:e.sourceId,type:"in",amount:e.amount,balanceAfter:d,sourceType:"receipt",sourceId:o,refNumber:`RV-${o.substring(0,6).toUpperCase()}`,notes:`سند قبض — ${e.notes}`,createdAt:b()};t.set(a,c)}),await V({date:e.date,description:`سند قبض رقم #${o.substring(0,6).toUpperCase()} - ${e.notes}`,sourceType:"receipt",sourceId:o,lines:[{accountId:e.debitAccId,accountCode:e.debitAccCode,accountName:e.debitAccName,debit:e.amount,credit:0,note:e.notes,costCenterId:e.ccId},{accountId:e.creditAccId,accountCode:e.creditAccCode,accountName:e.creditAccName,debit:0,credit:e.amount,note:"تحصيل سند قبض",costCenterId:e.ccId}]}),o}async function ae(e){const o=await $(m(p,`companies/${l}/receipts`,e.id));if(!o.exists())throw new Error("سند القبض غير موجود");const t={id:e.id,...o.data()},n=t.method==="cash"?"cashBoxes":"bankAccounts",d=m(p,`companies/${l}/${n}`,t.sourceId),s=e.method==="cash"?"cashBoxes":"bankAccounts",i=m(p,`companies/${l}/${s}`,e.sourceId);await _(p,async u=>{const h=await u.get(d),y=parseFloat(h.data()?.balance||0);let r;if(t.sourceId===e.sourceId)r=y-t.amount+e.amount,u.update(d,{balance:r,updatedAt:b()});else{const v=await u.get(i),B=parseFloat(v.data()?.balance||0);u.update(d,{balance:y-t.amount,updatedAt:b()}),u.update(i,{balance:B+e.amount,updatedAt:b()})}u.update(m(p,`companies/${l}/receipts`,e.id),{date:e.date,amount:e.amount,entityType:e.entityType,targetId:e.targetId,accountName:e.accountName,method:e.method,sourceId:e.sourceId,sourceName:e.sourceName,notes:e.notes,costCenterId:e.ccId,costCenterName:e.ccName,updatedAt:b()})}),await Y(e.id),await X(e.id,t.method),await V({date:e.date,description:`سند قبض (معدّل) #${e.id.substring(0,6).toUpperCase()} - ${e.notes}`,sourceType:"receipt",sourceId:e.id,lines:[{accountId:e.debitAccId,accountCode:e.debitAccCode,accountName:e.debitAccName,debit:e.amount,credit:0,note:e.notes,costCenterId:e.ccId},{accountId:e.creditAccId,accountCode:e.creditAccCode,accountName:e.creditAccName,debit:0,credit:e.amount,note:"تحصيل سند قبض",costCenterId:e.ccId}]});const a=e.method==="cash"?`companies/${l}/cashTransactions`:`companies/${l}/bankTransactions`;m(I(p,a));const c=e.method==="cash"?{cashBoxId:e.sourceId,type:"in",amount:e.amount,sourceType:"receipt",sourceId:e.id,notes:`سند قبض (معدّل) — ${e.notes}`,createdAt:b()}:{bankAccountId:e.sourceId,type:"in",amount:e.amount,sourceType:"receipt",sourceId:e.id,refNumber:`RV-${e.id.substring(0,6).toUpperCase()}`,notes:`سند قبض (معدّل) — ${e.notes}`,createdAt:b()},{addDoc:f}=await ee(async()=>{const{addDoc:u}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{addDoc:u}},[]);await f(I(p,a),c)}let w=null;window.confirmDeleteReceiptModal=async e=>{w=e;const o=await $(m(p,`companies/${l}/receipts`,e));if(!o.exists()){showToast("السند غير موجود","error");return}const t=o.data();document.getElementById("rcpt-delete-info").innerHTML=`
    <div>📅 التاريخ: <strong>${t.date}</strong></div>
    <div>🔢 رقم السند: <strong>${e.substring(0,6).toUpperCase()}</strong></div>
    <div>👤 الجهة: <strong>${t.accountName}</strong></div>
    <div>💰 المبلغ: <strong>${R(t.amount)}</strong></div>
    <div>📝 البيان: <strong>${t.notes}</strong></div>
  `,openModal("rcpt-delete-modal")};window.confirmDeleteReceipt=async()=>{if(!w)return;const e=document.getElementById("rcpt-confirm-delete-btn");e.disabled=!0,e.textContent="جاري الحذف...";try{const o=await $(m(p,`companies/${l}/receipts`,w));if(!o.exists())throw new Error("السند غير موجود");const t=o.data(),n=t.method==="cash"?"cashBoxes":"bankAccounts",d=m(p,`companies/${l}/${n}`,t.sourceId);await _(p,async s=>{const i=await s.get(d);if(i.exists()){const a=parseFloat(i.data().balance||0);s.update(d,{balance:Math.max(0,a-t.amount),updatedAt:b()})}s.delete(m(p,`companies/${l}/receipts`,w))}),await Y(w),await X(w,t.method),T(`companies/${l}/receipts`),T(`companies/${l}/journalEntries`),T(`companies/${l}/chartOfAccounts`),t.entityType==="customer"?J(t.targetId).catch(()=>{}):t.entityType==="supplier"&&W(t.targetId).catch(()=>{}),showToast("تم حذف السند وجميع القيود والحركات المرتبطة به","success"),closeModal("rcpt-delete-modal"),await A()}catch(o){showToast("خطأ: "+o.message,"error")}finally{e.disabled=!1,e.textContent="🗑️ حذف نهائياً",w=null}};window.previewReceipt=async e=>{const o=await $(m(p,`companies/${l}/receipts`,e));if(!o.exists()){showToast("السند غير موجود","error");return}const t=o.data();let n={};try{const[s,i]=await Promise.all([$(m(p,`companies/${l}/settings`,"company")),$(m(p,`companies/${l}/settings`,"logo"))]);if(s.exists())n=s.data();else{const a=await $(m(p,`companies/${l}`));a.exists()&&(n=a.data())}i.exists()&&i.data().dataUrl&&(n.logoUrl=i.data().dataUrl)}catch{}const d=document.getElementById("receipt-preview-body");d.setAttribute("data-receipt-id",e),d.innerHTML=ie(t,e,n),openModal("receipt-preview-modal")};window.printReceiptVoucher=()=>{const o=document.getElementById("receipt-preview-body").innerHTML,t=window.open("","_blank","width=850,height=700");t.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>سند قبض</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Cairo',sans-serif; direction:rtl; color:#1a1a2e; background:#fff; padding:0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @media print {
      body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      .header-container { background:linear-gradient(135deg,#0f2460 0%,#1d4ed8 60%,#2563eb 100%) !important; }
    }
  </style>
</head>
<body>${o}</body>
</html>`),t.document.close(),setTimeout(()=>{t.focus(),t.print(),t.close()},600)};function ie(e,o,t){const n=o.substring(0,8).toUpperCase(),d={customer:"عميل",supplier:"مورد",revenue:"إيراد مباشر",other:"حساب عام"},s={cash:"نقدي",bank:"تحويل بنكي"},i=se(e.amount),a=t.name||t.companyName||"مؤسسة إدهام للمواد الغذائية",c=[t.address,t.city,t.zip,t.country].filter(Boolean).join("، ")||"ينبع، المملكة العربية السعودية",f=t.phone||"",u=t.email||"",h=t.vatNumber||t.vat||t.taxNumber||"",y=t.crNumber||t.cr||"",r=t.logoUrl||t.logoBase64||t.logo||"";return`
  <div style="font-family:'Cairo',Arial,sans-serif;direction:rtl;max-width:820px;margin:0 auto;background:#fff;">

    <!-- ═══ HEADER ═══ -->
    <div class="header-container" style="background:linear-gradient(135deg,#0f2460 0%,#1d4ed8 60%,#2563eb 100%) !important;padding:0;border-radius:14px 14px 0 0;overflow:hidden;-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;">
      <div style="padding:22px 32px;display:flex;justify-content:space-between;align-items:center;">
        <!-- Logo + Company -->
        <div style="display:flex;align-items:center;gap:16px;">
          ${r?`<img src="${r}" style="height:70px;width:70px;object-fit:contain;background:white;border-radius:8px;padding:4px;box-shadow:0 2px 4px rgba(0,0,0,0.1);" />`:'<div style="width:70px;height:70px;background:rgba(255,255,255,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:32px;">🏢</div>'}
          <div>
            <div style="font-size:22px;font-weight:900;color:white;line-height:1.2;color:#fff !important;">${a}</div>
            ${`<div style="font-size:11.5px;color:rgba(255,255,255,0.9);margin-top:3px;color:#fff !important;">📍 العنوان: <strong>${c}</strong></div>`}
            <div style="font-size:11.5px;color:rgba(255,255,255,0.85);margin-top:3px;display:flex;flex-wrap:wrap;gap:4px 14px;color:#fff !important;">
              ${f?`<span>📞 الهاتف: <strong>${f}</strong></span>`:""}
              ${u?`<span>✉️ البريد: <strong>${u}</strong></span>`:""}
              ${h?`<span>🔢 رقم ضريبي: <strong>${h}</strong></span>`:""}
              ${y?`<span>📋 سجل تجاري: <strong>${y}</strong></span>`:""}
            </div>
          </div>
        </div>
        <!-- Voucher Title -->
        <div style="text-align:left;">
          <div style="background:rgba(255,255,255,0.18) !important;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.25) !important;border-radius:12px;padding:10px 22px;text-align:center;-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;">
            <div style="font-size:26px;font-weight:900;color:white;letter-spacing:1px;color:#fff !important;">سند قبض</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.8);letter-spacing:2px;font-weight:600;color:#fff !important;">RECEIPT VOUCHER</div>
          </div>
        </div>
      </div>
      <!-- Gold accent bar -->
      <div style="height:4px;background:linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b) !important;-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;"></div>
    </div>

    <!-- ═══ VOUCHER META ═══ -->
    <div style="background:#eef2ff;border:1px solid #c7d7f5;border-top:none;padding:14px 32px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
      <div style="text-align:center;border-left:1px solid #c7d7f5;">
        <div style="font-size:10px;color:#6b7280;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">رقم السند</div>
        <div style="font-size:20px;font-weight:900;color:#1e3a8a;font-family:monospace;margin-top:3px;">#${n}</div>
      </div>
      <div style="text-align:center;border-left:1px solid #c7d7f5;">
        <div style="font-size:10px;color:#6b7280;font-weight:700;letter-spacing:.08em;">التاريخ</div>
        <div style="font-size:16px;font-weight:800;color:#111827;margin-top:3px;">${e.date}</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:10px;color:#6b7280;font-weight:700;letter-spacing:.08em;">طريقة القبض</div>
        <div style="font-size:14px;font-weight:800;color:#111827;margin-top:3px;">${s[e.method]||e.method}</div>
        <div style="font-size:12px;color:#6b7280;">${e.sourceName||""}</div>
      </div>
    </div>

    <!-- ═══ AMOUNT BOX ═══ -->
    <div style="border:1px solid #e2e8f0;border-top:none;padding:20px 32px;">
      <div style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:2px solid #10b981;border-radius:14px;padding:18px 28px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:11px;color:#065f46;font-weight:700;margin-bottom:5px;letter-spacing:.06em;">💰 المبلغ المستلم</div>
          <div style="font-size:38px;font-weight:900;color:#064e3b;font-family:monospace;line-height:1;">${R(e.amount)}</div>
        </div>
        <div style="text-align:left;background:rgba(255,255,255,0.6);border-radius:10px;padding:10px 16px;max-width:300px;">
          <div style="font-size:10px;color:#065f46;font-weight:700;margin-bottom:4px;">المبلغ كتابةً</div>
          <div style="font-size:14px;color:#064e3b;font-weight:700;line-height:1.5;">فقط ${i} لا غير</div>
        </div>
      </div>
    </div>

    <!-- ═══ DETAILS TABLE ═══ -->
    <div style="border:1px solid #e2e8f0;border-top:none;padding:0 32px 20px;">
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:10px 14px;font-size:12px;color:#64748b;font-weight:700;border:1px solid #e2e8f0;text-align:right;">البيان</th>
            <th style="padding:10px 14px;font-size:12px;color:#64748b;font-weight:700;border:1px solid #e2e8f0;text-align:right;">الجهة</th>
            <th style="padding:10px 14px;font-size:12px;color:#64748b;font-weight:700;border:1px solid #e2e8f0;text-align:right;">النوع</th>
            ${e.costCenterName?'<th style="padding:10px 14px;font-size:12px;color:#64748b;font-weight:700;border:1px solid #e2e8f0;text-align:right;">مركز التكلفة</th>':""}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:14px;font-size:14px;font-weight:600;border:1px solid #e2e8f0;">${e.notes}</td>
            <td style="padding:14px;font-size:14px;font-weight:700;color:#1e3a8a;border:1px solid #e2e8f0;">${e.accountName}</td>
            <td style="padding:14px;border:1px solid #e2e8f0;">
              <span style="background:#dbeafe;color:#1e40af;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">${d[e.entityType]||e.entityType}</span>
            </td>
            ${e.costCenterName?`<td style="padding:14px;font-size:13px;font-weight:600;border:1px solid #e2e8f0;">${e.costCenterName}</td>`:""}
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ═══ SIGNATURES ═══ -->
    <div style="border:1px solid #e2e8f0;border-top:none;padding:24px 32px 28px;">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:32px;">
        ${["المستلم (الجهة الدافعة)","المحاسب / الأمين","مدير مالي / مراجع"].map(v=>`
          <div style="text-align:center;">
            <div style="height:56px;border-bottom:2px dashed #94a3b8;margin-bottom:8px;"></div>
            <div style="font-size:11px;color:#64748b;font-weight:700;">${v}</div>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- ═══ FOOTER ═══ -->
    <div style="background:linear-gradient(135deg,#f8fafc,#f1f5f9);border:1px solid #e2e8f0;border-top:2px solid #c7d7f5;border-radius:0 0 14px 14px;padding:10px 32px;display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:10px;color:#94a3b8;">طُبع بتاريخ: ${new Date().toLocaleString("ar-SA")} | ${a}</div>
      <div style="font-size:10px;color:#94a3b8;font-family:monospace;">REF: ${n}</div>
    </div>
  </div>`}async function A(){const e=document.getElementById("rcpt-from"),o=document.getElementById("rcpt-to"),t=document.getElementById("rcpt-tbody");if(!t)return;const n=e?.value||"",d=o?.value||"";try{const s=S(I(p,`companies/${l}/receipts`));let a=(await j(s)).docs.map(r=>({id:r.id,...r.data()}));a.sort((r,v)=>(v.date||"").localeCompare(r.date||"")),n&&d&&(a=a.filter(r=>!r.date||r.date>=n&&r.date<=d));const c=document.getElementById("rcpt-entity-type-filter")?.value,f=document.getElementById("rcpt-method-filter")?.value;c&&(a=a.filter(r=>r.entityType===c)),f&&(a=a.filter(r=>r.method===f));const u=document.getElementById("rcpt-count");if(u&&(u.textContent=`الإجمالي: ${R(a.reduce((r,v)=>r+(v.amount||0),0))}`),!a.length){t.innerHTML='<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--text-3);">لا توجد سندات قبض في هذه الفترة</td></tr>';return}const h={customer:"عميل",supplier:"مورد",revenue:"إيراد مباشر",other:"حساب عام"},y={customer:"lime",supplier:"indigo",revenue:"blue",other:"neutral"};t.innerHTML=a.map(r=>`
      <tr>
        <td>${r.date}</td>
        <td class="mono" style="font-size:12px;color:var(--text-2);">${r.id.substring(0,6).toUpperCase()}</td>
        <td><strong>${r.accountName}</strong></td>
        <td><span class="badge ${y[r.entityType]||"neutral"}">${h[r.entityType]||"عميل"}</span></td>
        <td>${r.notes||"—"}</td>
        <td>${r.method==="cash"?"نقدي":"بنكي"} - ${r.sourceName||""}</td>
        <td>${r.costCenterName?`<span style="font-size:11px;background:var(--bg-3);padding:2px 8px;border-radius:12px;color:var(--primary);">${r.costCenterName}</span>`:"—"}</td>
        <td style="text-align:left;" class="mono text-good">${R(r.amount)}</td>
        <td style="text-align:center;white-space:nowrap;">
          <button class="btn btn-xs btn-secondary" onclick="previewReceipt('${r.id}')" title="معاينة">👁️</button>
          <button class="btn btn-xs btn-secondary" onclick='openReceiptModal(${JSON.stringify({...r,id:r.id})})' title="تعديل">✏️</button>
          <button class="btn btn-xs btn-danger"    onclick="confirmDeleteReceiptModal('${r.id}')" title="حذف">🗑️</button>
        </td>
      </tr>
    `).join("")}catch(s){console.error(s),t.innerHTML='<tr><td colspan="9" class="text-bad" style="text-align:center;">لا توجد حركات مسجلة حالياً</td></tr>'}}async function Y(e){const o=S(I(p,`companies/${l}/journalEntries`),q("sourceId","==",e)),t=await j(o);if(t.empty)return;const n=G(p);t.docs.forEach(d=>n.delete(d.ref)),await n.commit()}async function X(e,o){const t=o==="cash"?`companies/${l}/cashTransactions`:`companies/${l}/bankTransactions`,n=S(I(p,t),q("sourceId","==",e)),d=await j(n);if(d.empty)return;const s=G(p);d.docs.forEach(i=>s.delete(i.ref)),await s.commit()}function ce(e,o){let t=null,n=null,d=null,s=null;if(e==="customer"){const i=H.find(c=>c.id===o);s=i?.name||null;const a=g.find(c=>c.sourceEntityId===o&&c.sourceModule==="customers")||g.find(c=>c.name&&i?.name&&c.name.includes(i.name))||g.find(c=>c.code==="1-1-2-1-1");t=a?.id||null,n=a?.code||null,d=a?.name||"ذمم العملاء"}else if(e==="supplier"){const i=P.find(c=>c.id===o);s=i?.name||null;const a=g.find(c=>c.sourceEntityId===o&&c.sourceModule==="suppliers")||g.find(c=>c.name&&i?.name&&c.name.includes(i.name))||g.find(c=>c.code==="2-1-1-1-1");t=a?.id||null,n=a?.code||null,d=a?.name||"ذمم الموردين"}else{const i=g.find(a=>a.id===o);t=o||null,n=i?.code||null,d=i?.name||null,s=i?.name||null}return{creditAccId:t,creditAccCode:n,creditAccName:d,destinationName:s}}function de(e,o){let t=null,n=null,d=null,s=null;if(e==="cash"){const i=N.find(c=>c.id===o);t=i?.accountId||null;const a=g.find(c=>c.id===i?.accountId);n=a?.code||i?.code||null,d=a?.name||i?.name||null,s=m(p,`companies/${l}/cashBoxes`,o)}else{const i=M.find(c=>c.id===o);t=i?.accountId||null;const a=g.find(c=>c.id===i?.accountId);n=a?.code||i?.code||null,d=a?.name||i?.name||null,s=m(p,`companies/${l}/bankAccounts`,o)}if(!t){const i=g.find(a=>a.code===(e==="cash"?"1-1-1-1-3":"1-1-1-3-2"))||e!=="cash"&&g.find(a=>a.parentCode==="1-1-1-3")||g.find(a=>a.code==="1-1-1-1-3");t=i?.id||null,n=i?.code||null,d=i?.name||null}return{debitAccId:t,debitAccCode:n,debitAccName:d,sourceDocRef:s}}function se(e){if(!e||isNaN(e))return"صفر ريال سعودي";const o=Math.floor(e),t=Math.round((e-o)*100),n=["","واحد","اثنان","ثلاثة","أربعة","خمسة","ستة","سبعة","ثمانية","تسعة","عشرة","أحد عشر","اثنا عشر","ثلاثة عشر","أربعة عشر","خمسة عشر","ستة عشر","سبعة عشر","ثمانية عشر","تسعة عشر"],d=["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"],s=["","مائة","مئتان","ثلاثمائة","أربعمائة","خمسمائة","ستمائة","سبعمائة","ثمانمائة","تسعمائة"];function i(c){return c===0?"":c<20?n[c]:c<100?d[Math.floor(c/10)]+(c%10?" و"+n[c%10]:""):s[Math.floor(c/100)]+(c%100?" و"+i(c%100):"")}let a="";return o>=1e6&&(a+=i(Math.floor(o/1e6))+" مليون "),o>=1e3&&(a+=i(Math.floor(o%1e6/1e3))+" ألف "),a+=i(o%1e3),a=a.trim()+" ريال سعودي",t>0&&(a+=` و${i(t)} هللة`),a}export{ye as render};
