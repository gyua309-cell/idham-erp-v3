const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css","assets/balance-sync-CUiyFg8g.js"])))=>i.map(i=>d[i]);
import{s as be,t as se,g as q,C as W,f as J,j as ye,_ as T,k as he}from"./index-CF9GFeRJ.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let oe=[],w=[],j=[],K=[],le=[],ce=[],R=[],G=null;async function ve(){oe=(await q(W.costCenters()).catch(()=>[])).sort((s,i)=>(s.code||"").localeCompare(i.code||""));const a=document.getElementById("exp-cc-sel");a&&(a.innerHTML='<option value="">بدون مركز تكلفة</option>'+oe.map(s=>`<option value="${s.id}">${s.code} — ${s.name}</option>`).join(""));const o=document.getElementById("exp-cc-filter");o&&(o.innerHTML='<option value="">كل المراكز</option>'+oe.map(s=>`<option value="${s.id}">${s.name}</option>`).join(""))}window.filterExpensesByCard=e=>{const a=document.getElementById("exp-method-filter");a&&(a.value=e==="all"?"":e,Q())};async function Te(e,a){e.innerHTML=`
    <!-- ═══ FILTER BAR ═══ -->
    <div class="filterbar" style="flex-wrap:wrap;gap:10px;align-items:flex-end;background:var(--bg-1);padding:14px 18px;border-radius:14px;border:1px solid var(--border-soft);margin-bottom:20px;box-shadow:var(--shadow-sm);">
      <div class="form-group" style="margin:0;flex:1;min-width:200px;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">🔍 بحث سريع بالسندات</label>
        <input type="text" id="exp-search" class="input" placeholder="اسم الجهة، رقم السند، البيان، الصندوق..." oninput="loadExpenses()" />
      </div>
      <div class="date-range-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">من تاريخ</label>
        <input type="date" id="exp-from" class="input" value="${be()}" onchange="loadExpenses()" />
      </div>
      <div class="date-range-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">إلى تاريخ</label>
        <input type="date" id="exp-to" class="input" value="${se()}" onchange="loadExpenses()" />
      </div>
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">نوع الجهة</label>
        <select id="exp-entity-type-filter" class="input" onchange="loadExpenses()">
          <option value="">كل الجهات</option>
          <option value="expense">مصروف</option>
          <option value="supplier">مورد</option>
          <option value="customer">عميل</option>
          <option value="cash_box">تحويل لصندوق / عهدة</option>
          <option value="other">حساب عام</option>
        </select>
      </div>
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">طريقة الدفع</label>
        <select id="exp-method-filter" class="input" onchange="loadExpenses()">
          <option value="">كل الطرق</option>
          <option value="cash">💵 نقدي</option>
          <option value="bank">🏦 تحويل بنكي</option>
        </select>
      </div>
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">مركز التكلفة</label>
        <select id="exp-cc-filter" class="input" onchange="loadExpenses()">
          <option value="">كل المراكز</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="exportPagePDF('.data-dense','سندات_الصرف')" title="تصدير PDF">📄 PDF</button>
        <button class="btn btn-secondary btn-sm" onclick="exportPageExcel('.data-dense','سندات_الصرف')" title="تصدير Excel">📊 Excel</button>
        <button class="btn btn-secondary btn-sm" onclick="printAllExpenseVouchers()" title="طباعة جميع السندات المعروضة">🖨️ طباعة الكل</button>
        <button class="btn btn-secondary btn-sm" onclick="printBlankExpenseVoucher()" title="طباعة سند صرف فارغ للتعبئة اليدوية" style="background:rgba(239,68,68,0.08);border-color:rgba(239,68,68,0.35);color:#991b1b;">📝 سند فارغ</button>
        <button class="btn btn-primary" onclick="openExpenseModal()">+ سند صرف جديد</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header" style="margin-bottom:16px;">
        <h1 class="page-title" style="font-size:22px;font-weight:900;">💸 سجل سندات الصرف (Payment Vouchers)</h1>
        <p class="page-subtitle" id="exp-count" style="color:var(--text-3);font-size:13px;">سجل سندات الصرف النقدية والبنكية للمصروفات والموردين</p>
      </div>

      <!-- ═══ RICH INTERACTIVE KPI CARDS ═══ -->
      <div class="grid-4 gap-16 mb-20" id="exp-kpi-grid">
        <div class="stats-card kpi-interactive" id="kpi-exp-card-all" onclick="filterExpensesByCard('all')" style="cursor:pointer;background:linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02));border:1.5px solid rgba(239,68,68,0.3);border-radius:16px;padding:18px;transition:all 0.2s ease;" title="انقر لتصفية كافة سندات الصرف">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span class="stats-title" style="font-weight:800;color:#ef4444;">📤 إجمالي المدفوعات المعروضة</span>
            <span class="badge sm" id="kpi-exp-badge-all" style="font-size:10px;background:#ef4444;color:#fff;">الكل 🎯</span>
          </div>
          <span class="stats-val text-bad" id="kpi-exp-total" style="font-size:22px;font-weight:900;">0.00 ر.س</span>
        </div>

        <div class="stats-card kpi-interactive" id="kpi-exp-card-cash" onclick="filterExpensesByCard('cash')" style="cursor:pointer;background:linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02));border:1.5px solid rgba(245,158,11,0.3);border-radius:16px;padding:18px;transition:all 0.2s ease;" title="انقر لتصفية المدفوعات النقدية فقط">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span class="stats-title" style="font-weight:800;color:#d97706;">💵 المدفوعات النقدية (صناديق)</span>
            <span class="badge sm" id="kpi-exp-badge-cash" style="font-size:10px;background:rgba(245,158,11,0.15);color:#d97706;">تصفية 🔍</span>
          </div>
          <span class="stats-val text-warning" id="kpi-exp-cash" style="font-size:22px;font-weight:900;">0.00 ر.س</span>
        </div>

        <div class="stats-card kpi-interactive" id="kpi-exp-card-bank" onclick="filterExpensesByCard('bank')" style="cursor:pointer;background:linear-gradient(135deg, rgba(37,99,235,0.08), rgba(37,99,235,0.02));border:1.5px solid rgba(37,99,235,0.3);border-radius:16px;padding:18px;transition:all 0.2s ease;" title="انقر لتصفية المدفوعات البنكية فقط">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span class="stats-title" style="font-weight:800;color:#1d4ed8;">🏦 المدفوعات البنكية والتحويلات</span>
            <span class="badge sm" id="kpi-exp-badge-bank" style="font-size:10px;background:rgba(37,99,235,0.15);color:#1d4ed8;">تصفية 🔍</span>
          </div>
          <span class="stats-val text-brand" id="kpi-exp-bank" style="font-size:22px;font-weight:900;color:#1d4ed8;">0.00 ر.س</span>
        </div>

        <div class="stats-card" style="background:linear-gradient(135deg, rgba(107,114,128,0.08), rgba(107,114,128,0.02));border:1.5px solid rgba(107,114,128,0.3);border-radius:16px;padding:18px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span class="stats-title" style="font-weight:800;color:#4b5563;">🔢 عدد سندات الصرف</span>
            <span class="badge sm" style="font-size:10px;background:rgba(107,114,128,0.15);color:#4b5563;">عدد 📋</span>
          </div>
          <span class="stats-val text-bad" id="kpi-exp-count" style="font-size:22px;font-weight:900;">0 سند</span>
        </div>
      </div>

      <div class="card" style="border-radius:16px;box-shadow:var(--shadow-sm);overflow:hidden;">
        <div class="table-container">
          <table class="data-dense" style="margin:0;">
            <thead>
              <tr style="background:var(--bg-2);">
                <th style="width:100px;">التاريخ</th>
                <th style="width:130px;">رقم السند / القيد</th>
                <th>جهة الصرف</th>
                <th style="width:100px;">نوع الجهة</th>
                <th>البيان والملاحظات</th>
                <th>طريقة الدفع والصندوق</th>
                <th>مركز التكلفة</th>
                <th style="text-align:left;width:120px;">المبلغ</th>
                <th style="text-align:center;width:150px;" class="no-print">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="exp-tbody">
              ${Array(6).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:14px; margin:4px 0;"></div></td>`).join("")}
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
              <input type="date" id="exp-date" class="input" value="${se()}" />
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
                <option value="cash_box">📦 تحويل لصندوق / تغذية عهدة</option>
                <option value="other">حساب عام</option>
              </select>
            </div>
            <div class="form-group">
              <label id="exp-entity-label">الحساب / الحساب المستهدف *</label>
              <div style="display:flex;gap:6px;flex-direction:column;">
                <input type="text" id="exp-target-search" class="input" placeholder="🔍 ابحث بجزء من اسم الحساب أو الكود..." oninput="filterExpenseTargetEntity()" style="font-size:12.5px;padding:6px 12px;background:var(--bg-2);border-radius:8px;" />
                <select id="exp-target-entity" class="input">
                  <option value="">اختر...</option>
                </select>
              </div>
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
  `;const o=e.querySelector("#exp-from"),s=e.querySelector("#exp-to");o&&o.addEventListener("change",Q),s&&s.addEventListener("change",Q),await Promise.all([me(),ve(),Q()])}async function me(){[w,j,K,le,ce]=await Promise.all([q(W.chartOfAccounts()),q(W.cashBoxes()),q(W.bankAccounts()),q(W.suppliers()),q(W.customers())]),onEntityTypeChange(),togglePaySource()}let de=[];function re(e,a,o=""){if(!e)return;let s='<option value="">اختر...</option>';a&&a.length?s+=a.map(i=>`<option value="${i.id}">${i.text}</option>`).join(""):s=`<option value="">🔍 لا يوجد حساب يطابق "${o}"</option>`,e.innerHTML=s}window.onEntityTypeChange=()=>{const e=document.getElementById("exp-entity-type").value,a=document.getElementById("exp-entity-label"),o=document.getElementById("exp-target-entity"),s=document.getElementById("exp-target-search");s&&(s.value="");let i=[];if(e==="expense")a.textContent="بند المصروف (الحساب) *",i=w.filter(d=>d.type==="expense").map(d=>({id:d.id,text:`${d.code} - ${d.name}`}));else if(e==="supplier")a.textContent="المورد المستهدف *",i=le.map(d=>({id:d.id,text:d.name}));else if(e==="customer")a.textContent="العميل المستهدف *",i=ce.map(d=>({id:d.id,text:d.name}));else if(e==="cash_box"){a.textContent="الصندوق المستلم (المراد تغذيته) *";const d=document.getElementById("exp-source")?.value;i=(j||[]).filter(r=>r.id!==d).map(r=>({id:r.id,text:`${r.name} (${J(r.balance||0)})`}))}else a.textContent="الحساب المستهدف (دليل الحسابات) *",i=w.map(d=>({id:d.id,text:`${d.code} - ${d.name}`}));de=i,re(o,i)};window.filterExpenseTargetEntity=()=>{const e=(document.getElementById("exp-target-search")?.value||"").trim().toLowerCase(),a=document.getElementById("exp-target-entity");if(!e){re(a,de);return}const o=de.filter(s=>s.text.toLowerCase().includes(e));re(a,o,e),o.length===1&&a&&(a.value=o[0].id)};window.togglePaySource=()=>{const e=document.getElementById("exp-pay-method")?.value||"cash",a=document.getElementById("exp-source-label"),o=document.getElementById("exp-source");if(o)if(o.innerHTML='<option value="">اختر...</option>',e==="cash"){a&&(a.textContent="صندوق الصرف *");let s=j&&j.length>0?j:[];s.length===0&&w&&w.length>0&&(s=w.filter(i=>i.code?.startsWith("1-1-1-1")||i.code?.startsWith("1-1-1-2")||i.name?.includes("صندوق")||i.code==="1-1-1-1-3")),o.innerHTML+=s.map(i=>`<option value="${i.id}">${i.name||i.accountName||i.code}</option>`).join("")}else{a&&(a.textContent="الحساب البنكي المخصوم منه *");let s=K&&K.length>0?K:[];s.length===0&&w&&w.length>0&&(s=w.filter(i=>i.code?.startsWith("1-1-1-3")||i.name?.includes("بنك")||i.name?.includes("الراجح")||i.name?.includes("الجزير"))),o.innerHTML+=s.map(i=>{const d=i.name||i.bankName||i.accountName||"حساب بنكي",r=i.accountNumber?` (${i.accountNumber})`:i.accountCode?` [${i.accountCode}]`:"";return`<option value="${i.id}">${d}${r}</option>`}).join("")}};window.openExpenseModal=async()=>{(!j.length||!K.length||!w.length)&&await me(),G=null;const e=document.getElementById("expense-modal-title");e&&(e.textContent="سند صرف جديد (Payment Voucher)"),document.getElementById("exp-date").value=se(),document.getElementById("exp-amount").value="",document.getElementById("exp-entity-type").value="expense",onEntityTypeChange();const a=document.getElementById("exp-pay-method");a&&(a.value="cash"),togglePaySource(),document.getElementById("exp-notes").value="";const o=document.getElementById("exp-cc-sel");o&&(o.value=""),document.getElementById("exp-error").classList.add("hidden"),openModal("expense-modal")};window.saveExpense=async()=>{const e=document.getElementById("exp-error");e.classList.add("hidden");const a=document.getElementById("exp-date").value,o=parseFloat(document.getElementById("exp-amount").value),s=document.getElementById("exp-entity-type").value,i=document.getElementById("exp-target-entity").value,d=document.getElementById("exp-pay-method").value,r=document.getElementById("exp-source").value,g=document.getElementById("exp-notes").value.trim();if(!a||!o||o<=0||!i||!r||!g){e.textContent="الرجاء تعبئة جميع الحقول المطلوبة وكتابة بيان صحيح",e.classList.remove("hidden");return}const f=document.getElementById("save-exp-btn");f.disabled=!0;try{if(await ye(a)){e.textContent=`⚠️ لا يمكن حفظ سند الصرف لأن تاريخه (${a}) يقع في فترة محاسبية مغلقة ومقفلة نهائياً.`,e.classList.remove("hidden"),f.disabled=!1;return}const{doc:l,runTransaction:y,serverTimestamp:p,collection:b,getDoc:u,getDocs:P,query:S,where:B,updateDoc:D}=await T(async()=>{const{doc:n,runTransaction:x,serverTimestamp:c,collection:h,getDoc:z,getDocs:H,query:ee,where:Y,updateDoc:V}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:n,runTransaction:x,serverTimestamp:c,collection:h,getDoc:z,getDocs:H,query:ee,where:Y,updateDoc:V}},[]),{db:_,COMPANY_ID:E}=await T(async()=>{const{db:n,COMPANY_ID:x}=await import("./index-CF9GFeRJ.js").then(c=>c.S);return{db:n,COMPANY_ID:x}},__vite__mapDeps([0,1]));if(G){const n=l(_,`companies/${E}/expenses`,G),x=await u(n);if(x.exists()){const c=x.data(),h=l(_,`companies/${E}/${c.method==="cash"?"cashBoxes":"bankAccounts"}`,c.sourceId),z=await u(h);if(z.exists()){const V=parseFloat(z.data().balance||0);await D(h,{balance:V+c.amount,updatedAt:p()})}const{deleteJournalEntry:H}=await T(async()=>{const{deleteJournalEntry:V}=await import("./index-CF9GFeRJ.js").then(ae=>ae.T);return{deleteJournalEntry:V}},__vite__mapDeps([0,1])),ee=S(b(_,`companies/${E}/journalEntries`),B("sourceId","==",G),B("sourceType","==","expense")),Y=await P(ee);Y.empty||await H(Y.docs[0].id)}}let I="",A="",m="",k="";if(s==="expense"){const n=w.find(x=>x.id===i);I=i,A=n?.code,m=n?.name,k=n?.name}else if(s==="supplier"){const n=le.find(c=>c.id===i);k=n?.name;const x="2-1-1-1-1";if(n?.accountId){const c=w.find(h=>h.id===n.accountId);c&&(I=c.id,A=c.code,m=c.name)}if(!I){const c=w.find(h=>h.sourceEntityId===i);c&&(I=c.id,A=c.code,m=c.name)}if(!I&&n?.name){const c=n.name.trim().toLowerCase(),h=w.find(z=>z.name&&(z.name.trim().toLowerCase()===c||z.name.includes(n.name)||n.name.includes(z.name)));I=h?.id||w.find(z=>z.code===x)?.id,A=h?.code||x,m=h?.name||"ذمم الموردين"}}else if(s==="customer"){const n=ce.find(c=>c.id===i);k=n?.name;const x="1-1-2-1-1";for(const c in w){const h=w[c];if(h.sourceEntityId===i&&h.sourceModule==="customers"){I=h.id,A=h.code,m=h.name;break}}if(!I){const c=w.find(h=>h.name.includes(n?.name));I=c?.id||w.find(h=>h.code===x)?.id,A=c?.code||x,m=c?.name||"ذمم العملاء"}}else if(s==="cash_box"){const n=j.find(x=>x.id===i);k=`صندوق: ${n?.name||"مستلم"}`,I=n?.accountId||null,A=n?.accountCode||n?.code||"1-1-1-1-3",m=n?.name||"صندوق مستلم"}else{const n=w.find(x=>x.id===i);I=i,A=n?.code,m=n?.name,k=n?.name}let $="",U="",M="",t=null;if(d==="cash"){const n=j.find(c=>c.id===r);$=n?.accountId||null;const x=w.find(c=>c.id===n?.accountId||n?.accountCode&&c.code===n.accountCode||c.id===r||c.code===r);$=$||x?.id||null,U=x?.code||n?.accountCode||n?.code||null,M=x?.name||n?.name||null,t=l(_,`companies/${E}/cashBoxes`,r)}else{const n=K.find(c=>c.id===r);$=n?.accountId||null;let x=w.find(c=>c.id===n?.accountId||n?.accountCode&&c.code===n.accountCode||c.id===r||c.code===r);if(!x&&n?.name){const c=n.name.replace(/[\s\-_]/g,"").toLowerCase();x=w.find(h=>h.parentCode==="1-1-1-3"&&(h.name?.replace(/[\s\-_]/g,"").toLowerCase().includes(c)||c.includes((h.name||"").replace(/[\s\-_]/g,"").toLowerCase())))}$=$||x?.id||null,U=x?.code||n?.accountCode||n?.code||null,M=x?.name||n?.name||null,t=l(_,`companies/${E}/bankAccounts`,r)}if(!$){const n=w.find(x=>x.code===(d==="cash"?"1-1-1-1-3":"1-1-1-3-02"))||d!=="cash"&&w.find(x=>x.code?.startsWith("1-1-1-3"))||w.find(x=>x.code==="1-1-1-1-3");$=n?.id||null,U=n?.code||null,M=n?.name||null}const v=j.find(n=>n.accountId===I||n.id===i||n.accountCode===A);let N=null;v&&(N=l(_,`companies/${E}/cashBoxes`,v.id));let C="";await y(_,async n=>{let x=0,c=null;t&&(c=await n.get(t),c.exists()&&(x=parseFloat(c.data().balance||0)));let h=null,z=0;N&&(h=await n.get(N),h.exists()&&(z=parseFloat(h.data().balance||0)));let H=null,ee=0,Y=null;$&&(Y=l(_,`companies/${E}/chartOfAccounts`,$),H=await n.get(Y),H.exists()&&(ee=parseFloat(H.data().balance||0)));let V=null,ae=0,xe=null;I&&(xe=l(_,`companies/${E}/chartOfAccounts`,I),V=await n.get(xe),V.exists()&&(ae=parseFloat(V.data().balance||0)));const ie=x-o,ge=z+o;t&&n.update(t,{balance:ie,updatedAt:p()}),N&&h&&h.exists()&&n.update(N,{balance:ge,updatedAt:p()});const ue=G?l(_,`companies/${E}/expenses`,G):l(b(_,`companies/${E}/expenses`));if(C=ue.id,n.set(ue,{date:a,amount:o,entityType:s,targetId:i,isTransfer:s==="cash_box",accountName:k||"مصروف",method:d,sourceId:r,sourceName:d==="cash"?j.find(L=>L.id===r)?.name:K.find(L=>L.id===r)?.name,notes:g,costCenterId:document.getElementById("exp-cc-sel")?.value||null,costCenterName:oe.find(L=>L.id===document.getElementById("exp-cc-sel")?.value)?.name||null,createdAt:p(),updatedAt:p()}),d==="cash"){const L=l(b(_,`companies/${E}/cashTransactions`));n.set(L,{cashBoxId:r,type:"out",amount:o,balanceAfter:ie,sourceType:"expense",sourceId:C,isTransfer:s==="cash_box",notes:s==="cash_box"?`تحويل صادر لسند صرف #${C.substring(0,6).toUpperCase()} إلى ${k} — ${g}`:`سند صرف رقم ${C.substring(0,6).toUpperCase()} — ${g}`,userName:"المستخدم",createdAt:p()})}else{const L=l(b(_,`companies/${E}/bankTransactions`));n.set(L,{bankAccountId:r,type:"out",amount:o,balanceAfter:ie,sourceType:"expense",sourceId:C,isTransfer:s==="cash_box",notes:`سند صرف رقم ${C.substring(0,6).toUpperCase()} — ${g}`,refNumber:`PV-${C.substring(0,6).toUpperCase()}`,createdAt:p()})}if(v&&h&&h.exists()){const L=l(b(_,`companies/${E}/cashTransactions`));n.set(L,{cashBoxId:v.id,type:"in",amount:o,balanceAfter:ge,sourceType:"expense",sourceId:C,isTransfer:!0,notes:`توريد واستلام من سند صرف رقم ${C.substring(0,6).toUpperCase()} — ${g}`,userName:"المستخدم",createdAt:p()})}});const F=w.find(n=>n.id===I),te=w.find(n=>n.id===$),ne=s==="cash_box"?`مناقلة نقدية (سند صرف #${C.substring(0,6).toUpperCase()}) — تغذية إلى ${k} — ${g}`:`سند صرف رقم #${C.substring(0,6).toUpperCase()} - ${g}`,X=await he({date:a,description:ne,sourceType:"expense",sourceId:C,lines:[{accountId:I,accountCode:A||F?.code||"",accountName:m||F?.name||"",debit:o,credit:0,note:g,costCenterId:document.getElementById("exp-cc-sel")?.value||null},{accountId:$,accountCode:U||te?.code||"",accountName:M||te?.name||"",debit:0,credit:o,note:"سداد سند صرف",costCenterId:document.getElementById("exp-cc-sel")?.value||null}]});if(X&&C)try{const n=await u(l(_,`companies/${E}/journalEntries`,X)),x=n.exists()&&(n.data().entryNumber||n.data().code)||"";await D(l(_,`companies/${E}/expenses`,C),{journalEntryId:X,journalEntryCode:x})}catch(n){console.warn("[expenses] Error linking journalEntry to expense doc:",n)}const{clearERPCache:O}=await T(async()=>{const{clearERPCache:n}=await import("./index-CF9GFeRJ.js").then(x=>x.T);return{clearERPCache:n}},__vite__mapDeps([0,1]));O(`companies/${E}/expenses`),O(`companies/${E}/cashBoxes`),O(`companies/${E}/cashTransactions`),O(`companies/${E}/bankAccounts`),O(`companies/${E}/bankTransactions`),O(`companies/${E}/chartOfAccounts`),O(`companies/${E}/journalEntries`),showToast("تم حفظ سند الصرف واعتماده","success");const Z=document.getElementById("exp-file-upload");if(Z&&Z.files.length>0){const n=Z.files[0];window.uploadFileToArchive(n,"expenses",C,`مرفق سند صرف رقم PV-${C.substring(0,6).toUpperCase()}: ${g}`).catch(x=>console.warn(x))}closeModal("expense-modal"),await Q(),s==="customer"?T(()=>import("./balance-sync-CUiyFg8g.js"),__vite__mapDeps([2,0,1])).then(n=>n.recalculateCustomerBalance(i)).catch(n=>console.warn(n)):s==="supplier"&&T(()=>import("./balance-sync-CUiyFg8g.js"),__vite__mapDeps([2,0,1])).then(n=>n.recalculateSupplierBalance(i)).catch(n=>console.warn(n))}catch(l){e.textContent=l.message,e.classList.remove("hidden")}finally{f.disabled=!1}};window.printSingleExpenseVoucher=async e=>{let a=R.find(d=>d.id===e);if(!a)try{const{doc:d,getDoc:r}=await T(async()=>{const{doc:y,getDoc:p}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:y,getDoc:p}},[]),{db:g,COMPANY_ID:f}=await T(async()=>{const{db:y,COMPANY_ID:p}=await import("./index-CF9GFeRJ.js").then(b=>b.S);return{db:y,COMPANY_ID:p}},__vite__mapDeps([0,1])),l=await r(d(g,`companies/${f}/expenses`,e));l.exists()&&(a={id:l.id,...l.data()})}catch{}if(!a){showToast("سند الصرف غير موجود","error");return}let o={};try{const{doc:d,getDoc:r}=await T(async()=>{const{doc:p,getDoc:b}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:p,getDoc:b}},[]),{db:g,COMPANY_ID:f}=await T(async()=>{const{db:p,COMPANY_ID:b}=await import("./index-CF9GFeRJ.js").then(u=>u.S);return{db:p,COMPANY_ID:b}},__vite__mapDeps([0,1])),[l,y]=await Promise.all([r(d(g,`companies/${f}/settings/company`)),r(d(g,`companies/${f}/settings/logo`))]);l.exists()&&(o=l.data()),y.exists()&&(o.logoUrl=y.data().dataUrl||y.data().logoUrl||"")}catch{}const s=pe(a,e,o),i=window.open("","_blank","width=850,height=700");i.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>سند صرف — #${e.substring(0,6).toUpperCase()}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4 portrait; margin: 8mm; }
    body { font-family:'Cairo',sans-serif; direction:rtl; color:#1a1a2e; background:#fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @media print {
      body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      .header-container { background:linear-gradient(135deg, #450a0a 0%, #1c1917 50%, #7c2d12 100%) !important; }
    }
  </style>
</head>
<body>${s}</body>
</html>`),i.document.close(),setTimeout(()=>{i.focus(),i.print(),i.close()},600)};async function Q(){const e=document.getElementById("exp-from"),a=document.getElementById("exp-to"),o=document.getElementById("exp-search"),s=document.getElementById("exp-entity-type-filter"),i=document.getElementById("exp-method-filter"),d=document.getElementById("exp-cc-filter"),r=document.getElementById("exp-tbody");if(!r)return;const g=e?e.value:"",f=a?a.value:"",l=(o?.value||"").trim().toLowerCase(),y=s?.value||"",p=i?.value||"",b=d?.value||"";try{let u=await q(W.expenses()).catch(()=>[]);u.sort((t,v)=>{const N=(t.date||"").localeCompare(v.date||"");if(N!==0)return N;const C=t.createdAt?.seconds||t.createdAt||0,F=v.createdAt?.seconds||v.createdAt||0;return C-F}),u.forEach((t,v)=>{!t.number&&!t.seqNo?t.displayCode=`PV-${String(v+101).padStart(5,"0")}`:t.displayCode=`PV-${String(t.number||t.seqNo).padStart(5,"0")}`}),u.sort((t,v)=>{const N=(v.date||"").localeCompare(t.date||"");if(N!==0)return N;const C=t.createdAt?.seconds||t.createdAt||0;return(v.createdAt?.seconds||v.createdAt||0)-C}),R=u,g&&(u=u.filter(t=>t.date&&t.date>=g)),f&&(u=u.filter(t=>t.date&&t.date<=f)),p==="cash"?u=u.filter(t=>t.method==="cash"||t.sourceName&&t.sourceName.includes("صندوق")):p==="bank"&&(u=u.filter(t=>t.method==="bank"||t.method==="transfer"||t.method==="bank_transfer"||t.method==="network"||t.method==="cheque"||t.sourceName&&(t.sourceName.includes("بنك")||t.sourceName.includes("مصرف")||t.sourceName.includes("الراجحى")||t.sourceName.includes("الاهلي")))),y&&(u=u.filter(t=>t.entityType===y)),b&&(u=u.filter(t=>t.costCenterId===b)),l&&(u=u.filter(t=>{const v=(t.id||"").toLowerCase(),N=(t.number||"").toLowerCase(),C=(t.displayCode||"").toLowerCase(),F=(t.journalEntryCode||"").toLowerCase(),te=v.substring(0,6),ne=(t.accountName||t.targetName||t.supplierName||t.category||"").toLowerCase(),X=(t.notes||t.description||"").toLowerCase(),O=(t.sourceName||"").toLowerCase(),Z=(t.costCenterName||"").toLowerCase();return v.includes(l)||N.includes(l)||C.includes(l)||F.includes(l)||te.includes(l)||ne.includes(l)||X.includes(l)||O.includes(l)||Z.includes(l)}));const P=u.reduce((t,v)=>t+(v.amount||0),0),S=u.filter(t=>t.method==="cash"||t.sourceName&&t.sourceName.includes("صندوق")).reduce((t,v)=>t+(v.amount||0),0),B=u.filter(t=>t.method==="bank"||t.method==="transfer"||t.method==="bank_transfer"||t.sourceName&&(t.sourceName.includes("بنك")||t.sourceName.includes("مصرف")||t.sourceName.includes("الراجحى"))).reduce((t,v)=>t+(v.amount||0),0),D=document.getElementById("kpi-exp-total"),_=document.getElementById("kpi-exp-cash"),E=document.getElementById("kpi-exp-bank"),I=document.getElementById("kpi-exp-count"),A=document.getElementById("exp-count");D&&(D.textContent=J(P)),_&&(_.textContent=J(S)),E&&(E.textContent=J(B)),I&&(I.textContent=`${u.length} سند`),A&&(A.textContent=`مستندات الصرف المفلترة: ${u.length} سند — إجمالي المدفوعات: ${J(P)}`);const m=document.getElementById("kpi-exp-badge-all"),k=document.getElementById("kpi-exp-badge-cash"),$=document.getElementById("kpi-exp-badge-bank");if(m&&(m.style.background=p===""?"#ef4444":"rgba(239,68,68,0.15)",m.textContent=p===""?"نشط 🎯":"الكل 🔍"),k&&(k.style.background=p==="cash"?"#d97706":"rgba(245,158,11,0.15)",k.style.color=p==="cash"?"#fff":"#d97706",k.textContent=p==="cash"?"نشط 🎯":"تصفية 🔍"),$&&($.style.background=p==="bank"?"#1d4ed8":"rgba(37,99,235,0.15)",$.style.color=p==="bank"?"#fff":"#1d4ed8",$.textContent=p==="bank"?"نشط 🎯":"تصفية 🔍"),!u.length){r.innerHTML='<tr><td colspan="9" style="text-align:center;padding:36px;color:var(--text-3);font-weight:700;">🔍 لا توجد سندات صرف ضمن التصفية الفعالة حالياً</td></tr>';return}const U={expense:"مصروف",supplier:"مورد",customer:"عميل",cash_box:"تحويل لصندوق / عهدة",other:"حساب عام"},M={expense:"background:rgba(239,68,68,0.12);color:#ef4444;border:1px solid rgba(239,68,68,0.25);",supplier:"background:rgba(99,102,241,0.12);color:#4f46e5;border:1px solid rgba(99,102,241,0.25);",customer:"background:rgba(16,185,129,0.12);color:#059669;border:1px solid rgba(16,185,129,0.25);",cash_box:"background:rgba(2,132,199,0.12);color:#0284c7;border:1px solid rgba(2,132,199,0.25);",other:"background:rgba(107,114,128,0.12);color:#4b5563;border:1px solid rgba(107,114,128,0.25);"};r.innerHTML=u.map(t=>{const v=t.method==="bank"||t.method==="transfer"||t.method==="bank_transfer"||t.sourceName&&(t.sourceName.includes("بنك")||t.sourceName.includes("مصرف")||t.sourceName.includes("الراجحى")),N=v?"background:rgba(37,99,235,0.06);border-bottom:1px solid rgba(37,99,235,0.12);":"background:rgba(239,68,68,0.02);border-bottom:1px solid var(--border-soft);",C=v?`<span class="badge" style="background:#eff6ff;color:#1d4ed8;border:1.5px solid #93c5fd;font-weight:800;padding:4px 10px;border-radius:8px;box-shadow:0 1px 3px rgba(37,99,235,0.12);">🏦 تحويل بنكي — ${t.sourceName||"بنك"}</span>`:`<span class="badge" style="background:#fff7ed;color:#c2410c;border:1px solid #ffedd5;font-weight:700;padding:4px 10px;border-radius:8px;">💵 نقدي — ${t.sourceName||"صندوق"}</span>`;return`
        <tr style="${N}transition:all 0.15s ease;">
          <td class="mono font-bold" style="font-size:12.5px;">${t.date||"—"}</td>
          <td class="mono" style="font-size:12px;">
            <span dir="ltr" style="display:inline-block;direction:ltr;background:var(--bg-2);padding:2px 8px;border-radius:6px;font-weight:900;color:#c2410c;font-family:monospace;">${t.displayCode}</span>
            ${t.journalEntryCode?`<div style="margin-top:4px;"><span dir="ltr" style="display:inline-block;direction:ltr;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;padding:1px 6px;border-radius:4px;font-size:10.5px;font-weight:800;font-family:monospace;" title="القيد المحاسبي الآلي المرتبط">⚖️ ${t.journalEntryCode}</span></div>`:""}
          </td>
          <td><strong style="font-size:13.5px;color:var(--text-1);">${t.accountName||t.targetName||t.supplierName||t.category||t.description||"—"}</strong></td>
          <td><span class="badge" style="${M[t.entityType]||M.expense}font-size:11px;font-weight:700;">${U[t.entityType]||"مصروف"}</span></td>
          <td><small style="color:var(--text-2);font-size:12px;font-weight:600;">${t.notes||t.description||"—"}</small></td>
          <td>${C}</td>
          <td>${t.costCenterName?`<span style="font-size:11px;background:rgba(249,115,22,0.1);padding:3px 10px;border-radius:12px;color:#c2410c;font-weight:700;">${t.costCenterName}</span>`:"—"}</td>
          <td style="text-align:left;" class="mono font-bold text-bad" style="font-size:14px;">${J(t.amount||0)}</td>
          <td style="text-align:center;" class="no-print">
            <div style="display:flex;gap:4px;justify-content:center;">
              <button class="btn btn-icon sm btn-ghost text-brand" onclick="previewExpense('${t.id}')" title="معاينة السند">👁️</button>
              <button class="btn btn-icon sm btn-ghost text-ok" onclick="editExpense('${t.id}')" title="تعديل السند">✏️</button>
              <button class="btn btn-icon sm btn-ghost text-warning" onclick="printSingleExpenseVoucher('${t.id}')" title="طباعة سند آلي">🖨️</button>
              <button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteExpense('${t.id}')" title="حذف نهائي">🗑️</button>
            </div>
          </td>
        </tr>
      `}).join("")}catch(u){console.error(u),r.innerHTML=`<tr><td colspan="9" class="text-bad" style="text-align:center;">خطأ في تحميل المصروفات: ${u.message}</td></tr>`}}window.loadExpenses=Q;function fe(e,a,o){if(e&&e.displayCode)return e.displayCode;if(e&&(e.number||e.seqNo)){const d=e.number||e.seqNo;return`${o}-${String(d).padStart(5,"0")}`}if(typeof R<"u"&&R.length){const d=R.findIndex(r=>r.id===a);if(d!==-1)return`${o}-${String(d+101).padStart(5,"0")}`}let s=0;for(let d=0;d<a.length;d++)s=(s<<5)-s+a.charCodeAt(d),s|=0;const i=Math.abs(s%8999)+101;return`${o}-${String(i).padStart(5,"0")}`}window.previewExpense=async e=>{let a=(typeof R<"u"?R:[]).find(s=>s.id===e);const o=document.getElementById("expense-preview-body");if(o){o.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-3);"><i class="fas fa-spinner fa-spin fa-2x"></i><br><br>جارٍ تحميل بيانات الشركة والشعار...</div>',openModal("expense-preview-modal");try{const{doc:s,getDoc:i}=await T(async()=>{const{doc:y,getDoc:p}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:y,getDoc:p}},[]),{db:d,COMPANY_ID:r}=await T(async()=>{const{db:y,COMPANY_ID:p}=await import("./index-CF9GFeRJ.js").then(b=>b.S);return{db:y,COMPANY_ID:p}},__vite__mapDeps([0,1]));if(!a){const y=await i(s(d,`companies/${r}/expenses`,e));y.exists()&&(a={id:y.id,...y.data()})}if(!a){o.innerHTML='<div style="padding:30px;text-align:center;color:var(--bad);">سند الصرف غير موجود</div>';return}a.displayCode=fe(a,e,"PV");const[g,f]=await Promise.all([i(s(d,`companies/${r}/settings/company`)),i(s(d,`companies/${r}/settings/logo`))]),l=g.exists()?g.data():{};f.exists()&&(l.logoUrl=f.data().dataUrl||f.data().logoUrl||""),o.innerHTML=pe(a,e,l)}catch(s){console.error(s),o.innerHTML=`<div style="padding:40px;text-align:center;color:var(--bad);">خطأ في تحميل بيانات المعاينة: ${s.message}</div>`}}};window.printExpenseVoucher=()=>{const e=document.getElementById("expense-preview-body");if(!e)return;const a=e.innerHTML,o=window.open("","_blank","width=850,height=700");o.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>سند صرف</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4 portrait; margin: 8mm; }
    body { font-family:'Cairo',sans-serif; direction:rtl; color:#1a1a2e; background:#fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @media print {
      body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      .header-container { background:linear-gradient(135deg, #450a0a 0%, #1c1917 50%, #7c2d12 100%) !important; }
    }
  </style>
</head>
<body>${a}</body>
</html>`),o.document.close(),setTimeout(()=>{o.focus(),o.print(),o.close()},600)};window.printAllExpenseVouchers=async()=>{const e=typeof R<"u"?R:[];if(!e.length){window.showToast("لا توجد سندات صرف للطباعة في القائمة الحالية","warning");return}let a={};try{const{doc:i,getDoc:d}=await T(async()=>{const{doc:y,getDoc:p}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:y,getDoc:p}},[]),{db:r,COMPANY_ID:g}=await T(async()=>{const{db:y,COMPANY_ID:p}=await import("./index-CF9GFeRJ.js").then(b=>b.S);return{db:y,COMPANY_ID:p}},__vite__mapDeps([0,1])),[f,l]=await Promise.all([d(i(r,`companies/${g}/settings/company`)),d(i(r,`companies/${g}/settings/logo`))]);f.exists()&&(a=f.data()),l.exists()&&(a.logoUrl=l.data().dataUrl||l.data().logoUrl||"")}catch{}const o=e.map((i,d)=>`<div style="${d===e.length-1?"":"page-break-after:always;"}">${pe(i,i.id,a)}</div>`).join(""),s=window.open("","_blank","width=900,height=700");s.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>طباعة جميع سندات الصرف (${e.length} سند)</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4 portrait; margin: 8mm; }
    body { font-family:'Cairo',sans-serif; direction:rtl; color:#1a1a2e; background:#fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @media print {
      body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      .header-container { background:linear-gradient(135deg, #450a0a 0%, #1c1917 50%, #7c2d12 100%) !important; }
    }
  </style>
</head>
<body>${o}</body>
</html>`),s.document.close(),setTimeout(()=>{s.focus(),s.print(),s.close()},800)};window.printBlankExpenseVoucher=async()=>{let e={};try{const{doc:y,getDoc:p}=await T(async()=>{const{doc:B,getDoc:D}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:B,getDoc:D}},[]),{db:b,COMPANY_ID:u}=await T(async()=>{const{db:B,COMPANY_ID:D}=await import("./index-CF9GFeRJ.js").then(_=>_.S);return{db:B,COMPANY_ID:D}},__vite__mapDeps([0,1])),[P,S]=await Promise.all([p(y(b,`companies/${u}/settings/company`)),p(y(b,`companies/${u}/settings/logo`))]);P.exists()&&(e=P.data()),S.exists()&&(e.logoUrl=S.data().dataUrl||S.data().logoUrl||"")}catch{}const a=e.name||e.companyName||"شركة نظم الإمداد المتطورة",o=[e.address,e.city,e.zip,e.country].filter(Boolean).join("، ")||"ينبع، المملكة العربية السعودية",s=e.phone||e.mobile||"",i=e.vatNumber||e.vat||e.taxNumber||"",d=e.crNumber||e.cr||"",r=e.logoUrl||e.logoBase64||e.logo||"",g=(y="48px")=>`<div style="border:1.5px dashed #d1d5db;border-radius:8px;height:${y};width:100%;"></div>`,f=`
  <div style="font-family:'Cairo',Arial,sans-serif;direction:rtl;max-width:820px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.08);border:1px solid #cbd5e1;">

    <!-- ═══ ROYAL HEADER (Red/Brown Payment Theme) ═══ -->
    <div class="header-container" style="background:linear-gradient(135deg,#450a0a 0%,#1c1917 50%,#7c2d12 100%) !important;padding:20px 30px;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="display:flex;align-items:center;gap:16px;">
          ${r?`<img src="${r}" style="height:70px;width:70px;object-fit:contain;background:#fff;border-radius:12px;padding:5px;box-shadow:0 3px 10px rgba(0,0,0,0.2);" />`:'<div style="width:70px;height:70px;background:rgba(255,255,255,0.15);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:32px;">🏢</div>'}
          <div>
            <div style="font-size:22px;font-weight:900;color:#fff !important;margin-bottom:5px;text-shadow:0 1px 2px rgba(0,0,0,0.3);">${a}</div>
            <div style="font-size:11.5px;color:rgba(255,255,255,0.9) !important;margin-bottom:5px;">📍 ${o}</div>
            <div style="display:flex;flex-wrap:wrap;gap:5px 8px;font-size:11px;color:rgba(255,255,255,0.95) !important;">
              ${i?`<span style="background:rgba(255,255,255,0.15) !important;padding:2px 9px;border-radius:7px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">🔢 الرقم الضريبي: <span dir="ltr">${i}</span></span>`:""}
              ${d?`<span style="background:rgba(255,255,255,0.15) !important;padding:2px 9px;border-radius:7px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📋 السجل التجاري: <span dir="ltr">${d}</span></span>`:""}
              ${s?`<span style="background:rgba(255,255,255,0.15) !important;padding:2px 9px;border-radius:7px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📞 <span dir="ltr">${s}</span></span>`:""}
            </div>
          </div>
        </div>
        <div style="text-align:center;">
          <div style="background:rgba(255,255,255,0.15) !important;border:2px solid rgba(255,255,255,0.4) !important;border-radius:14px;padding:12px 24px;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;">
            <div style="font-size:26px;font-weight:900;color:#fff !important;letter-spacing:1.5px;">سـنـد صـرف</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.85) !important;letter-spacing:3px;font-weight:800;margin-top:4px;text-transform:uppercase;">PAYMENT VOUCHER</div>
          </div>
        </div>
      </div>
      <div style="height:4px;background:linear-gradient(90deg,#ea580c 0%,#f59e0b 50%,#ea580c 100%) !important;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;margin-top:14px;border-radius:3px;"></div>
    </div>

    <!-- ═══ META BAR ═══ -->
    <div style="background:#fff7ed;border-bottom:1.5px solid #fed7aa;padding:14px 30px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;align-items:center;">
      <div style="text-align:center;border-left:1.5px solid #fed7aa;padding-left:10px;">
        <div style="font-size:10.5px;color:#7c2d12;font-weight:800;margin-bottom:6px;">رقم السند</div>
        <div style="background:#ffedd5;border-radius:8px;border:1px solid #fed7aa;padding:4px 10px;font-size:18px;font-weight:900;color:#9a3412;font-family:monospace;min-width:130px;min-height:32px;display:inline-block;"></div>
      </div>
      <div style="text-align:center;border-left:1.5px solid #fed7aa;padding-left:10px;">
        <div style="font-size:10.5px;color:#7c2d12;font-weight:800;margin-bottom:6px;">التاريخ</div>
        <div style="font-size:14px;font-weight:900;color:#0f172a;"> &nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
        <div style="border-bottom:1.5px solid #ea580c;width:140px;margin:4px auto 0;"></div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:10.5px;color:#7c2d12;font-weight:800;margin-bottom:6px;">طريقة الدفع</div>
        <div style="display:flex;justify-content:center;gap:14px;font-size:13px;font-weight:800;color:#334155;">
          <label style="display:flex;align-items:center;gap:4px;"><span style="width:15px;height:15px;border:2px solid #c2410c;border-radius:3px;display:inline-block;"></span> نقدي</label>
          <label style="display:flex;align-items:center;gap:4px;"><span style="width:15px;height:15px;border:2px solid #c2410c;border-radius:3px;display:inline-block;"></span> تحويل بنكي</label>
        </div>
      </div>
    </div>

    <!-- ═══ AMOUNT BOX ═══ -->
    <div style="padding:18px 30px 14px;">
      <div style="background:linear-gradient(135deg,#fef2f2 0%,#fee2e2 100%);border:2px solid #ef4444;border-radius:14px;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;gap:16px;">
        <div style="flex:0 0 auto;">
          <div style="font-size:11px;color:#991b1b;font-weight:800;margin-bottom:6px;">📤 المبلغ المدفوع بالأرقام (ر.س)</div>
          <div style="border-bottom:2px solid #ef4444;width:190px;height:38px;font-size:26px;font-weight:900;color:#7f1d1d;font-family:monospace;"></div>
        </div>
        <div style="flex:1;background:#fff;border:1.5px solid #fca5a5;border-radius:10px;padding:12px 18px;">
          <div style="font-size:10.5px;color:#991b1b;font-weight:800;margin-bottom:8px;">المبلغ كتابةً (تفقيط)</div>
          <div style="font-size:13px;color:#7f1d1d;font-weight:700;">فقط ${g("24px")} لا غير</div>
        </div>
      </div>
    </div>

    <!-- ═══ DETAILS TABLE ═══ -->
    <div style="padding:0 30px 16px;">
      <table style="width:100%;border-collapse:separate;border-spacing:0;border:1.5px solid #cbd5e1;border-radius:12px;overflow:hidden;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:11px 16px;font-size:12px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;text-align:right;">المدفوع له (جهة الصرف / الحساب المدين)</th>
            <th style="padding:11px 16px;font-size:12px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;border-right:1.5px solid #cbd5e1;text-align:right;width:130px;">نوع الجهة</th>
            <th style="padding:11px 16px;font-size:12px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;border-right:1.5px solid #cbd5e1;text-align:right;width:180px;">مركز التكلفة</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:14px 16px;">${g("32px")}</td>
            <td style="padding:14px 16px;border-right:1.5px solid #cbd5e1;">
              <div style="display:flex;flex-direction:column;gap:6px;font-size:12px;font-weight:700;color:#334155;">
                <label style="display:flex;align-items:center;gap:5px;"><span style="width:13px;height:13px;border:1.5px solid #c2410c;border-radius:50%;display:inline-block;"></span> مصروف</label>
                <label style="display:flex;align-items:center;gap:5px;"><span style="width:13px;height:13px;border:1.5px solid #c2410c;border-radius:50%;display:inline-block;"></span> مورد</label>
                <label style="display:flex;align-items:center;gap:5px;"><span style="width:13px;height:13px;border:1.5px solid #c2410c;border-radius:50%;display:inline-block;"></span> عميل / أخرى</label>
              </div>
            </td>
            <td style="padding:14px 16px;border-right:1.5px solid #cbd5e1;">${g("32px")}</td>
          </tr>
        </tbody>
      </table>

      <!-- Notes -->
      <div style="margin-top:14px;background:#fff7ed;border:1.5px dashed #ea580c;border-radius:12px;padding:14px 20px;">
        <div style="font-size:10.5px;color:#9a3412;font-weight:800;margin-bottom:8px;">البيان / ملاحظات وسبب الصرف</div>
        ${g("36px")}
      </div>
    </div>

    <!-- ═══ SIGNATURES ═══ -->
    <div style="border-top:1.5px solid #e2e8f0;padding:20px 30px 24px;background:#fafafa;">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;">
        <div style="text-align:center;">
          <div style="font-size:11.5px;font-weight:800;color:#334155;margin-bottom:50px;">توقيع المستلم (الجهة المدفوع لها)</div>
          <div style="border-top:1.5px dashed #94a3b8;width:160px;margin:0 auto;color:#64748b;font-size:10px;padding-top:5px;">التوقيع / الإسم</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11.5px;font-weight:800;color:#334155;margin-bottom:50px;">توقيع المحاسب / الأمين</div>
          <div style="border-top:1.5px dashed #94a3b8;width:160px;margin:0 auto;color:#64748b;font-size:10px;padding-top:5px;">التوقيع والختم الرسمى</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11.5px;font-weight:800;color:#334155;margin-bottom:50px;">اعتماد المدير العام</div>
          <div style="border-top:1.5px dashed #94a3b8;width:160px;margin:0 auto;color:#64748b;font-size:10px;padding-top:5px;">التوقيع والاعتماد</div>
        </div>
      </div>
    </div>

    <!-- ═══ FOOTER ═══ -->
    <div style="background:#f1f5f9;border-top:1.5px solid #cbd5e1;padding:10px 30px;display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:10.5px;color:#64748b;font-weight:700;">نموذج سند صرف — ${a}</div>
      <div style="font-size:10.5px;color:#94a3b8;font-family:monospace;">BLANK PAYMENT VOUCHER TEMPLATE</div>
    </div>

  </div>`,l=window.open("","_blank","width=900,height=700");l.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>سند صرف فارغ — ${a}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4 portrait; margin: 8mm; }
    body { font-family:'Cairo',sans-serif; direction:rtl; color:#1a1a2e; background:#fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @media print {
      body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      .header-container { background:linear-gradient(135deg, #450a0a 0%, #1c1917 50%, #7c2d12 100%) !important; }
    }
  </style>
</head>
<body>${f}</body>
</html>`),l.document.close(),setTimeout(()=>{l.focus(),l.print(),l.close()},600)};window.editExpense=e=>{const a=R.find(i=>i.id===e);if(!a)return;G=e;const o=document.getElementById("expense-modal-title");o&&(o.textContent=`تعديل سند الصرف (#${e.substring(0,6).toUpperCase()})`),document.getElementById("exp-date").value=a.date,document.getElementById("exp-amount").value=a.amount,document.getElementById("exp-entity-type").value=a.entityType,window.onEntityTypeChange(),document.getElementById("exp-target-entity").value=a.targetId,document.getElementById("exp-pay-method").value=a.method,window.togglePaySource(),document.getElementById("exp-source").value=a.sourceId,document.getElementById("exp-notes").value=a.notes||"";const s=document.getElementById("exp-cc-sel");s&&(s.value=a.costCenterId||""),document.getElementById("exp-error").classList.add("hidden"),openModal("expense-modal")};window.deleteExpense=async e=>{if(await window.showConfirm?.("هل أنت متأكد من رغبتك في حذف سند الصرف هذا؟ سيتم إرجاع المبالغ للصندوق/البنك وعكس القيود المحاسبية بالكامل.","حذف سند الصرف"))try{const{doc:o,getDoc:s,updateDoc:i,deleteDoc:d,getDocs:r,query:g,where:f,collection:l,serverTimestamp:y}=await T(async()=>{const{doc:m,getDoc:k,updateDoc:$,deleteDoc:U,getDocs:M,query:t,where:v,collection:N,serverTimestamp:C}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:m,getDoc:k,updateDoc:$,deleteDoc:U,getDocs:M,query:t,where:v,collection:N,serverTimestamp:C}},[]),{db:p,COMPANY_ID:b}=await T(async()=>{const{db:m,COMPANY_ID:k}=await import("./index-CF9GFeRJ.js").then($=>$.S);return{db:m,COMPANY_ID:k}},__vite__mapDeps([0,1])),{deleteJournalEntry:u}=await T(async()=>{const{deleteJournalEntry:m}=await import("./index-CF9GFeRJ.js").then(k=>k.T);return{deleteJournalEntry:m}},__vite__mapDeps([0,1])),P=o(p,`companies/${b}/expenses`,e),S=await s(P);if(!S.exists()){window.showToast("سند الصرف غير موجود","error");return}const B=S.data(),D=o(p,`companies/${b}/${B.method==="cash"?"cashBoxes":"bankAccounts"}`,B.sourceId),_=await s(D);if(_.exists()){const m=parseFloat(_.data().balance||0);await i(D,{balance:m+B.amount,updatedAt:y()})}if(B.entityType==="cash_box"&&B.targetId){const m=o(p,`companies/${b}/cashBoxes`,B.targetId),k=await s(m);if(k.exists()){const $=parseFloat(k.data().balance||0);await i(m,{balance:$-B.amount,updatedAt:y()})}}const E=g(l(p,`companies/${b}/journalEntries`),f("sourceId","==",e),f("sourceType","==","expense")),I=await r(E);I.empty||await u(I.docs[0].id);try{const m=g(l(p,`companies/${b}/cashTransactions`),f("sourceId","==",e)),k=await r(m);for(const $ of k.docs)await d($.ref)}catch(m){console.warn("Could not clean up associated cashTransactions:",m)}await d(P);const{clearERPCache:A}=await T(async()=>{const{clearERPCache:m}=await import("./index-CF9GFeRJ.js").then(k=>k.T);return{clearERPCache:m}},__vite__mapDeps([0,1]));A(`companies/${b}/expenses`),A(`companies/${b}/cashBoxes`),A(`companies/${b}/cashTransactions`),A(`companies/${b}/bankAccounts`),A(`companies/${b}/bankTransactions`),A(`companies/${b}/chartOfAccounts`),A(`companies/${b}/journalEntries`),window.showToast("تم حذف سند الصرف وعكس القيود المحاسبية بنجاح","success"),await Q(),B.entityType==="customer"?T(()=>import("./balance-sync-CUiyFg8g.js"),__vite__mapDeps([2,0,1])).then(m=>m.recalculateCustomerBalance(B.targetId)).catch(m=>console.warn(m)):B.entityType==="supplier"&&T(()=>import("./balance-sync-CUiyFg8g.js"),__vite__mapDeps([2,0,1])).then(m=>m.recalculateSupplierBalance(B.targetId)).catch(m=>console.warn(m))}catch(o){console.error(o),window.showToast("خطأ في حذف سند الصرف: "+o.message,"error")}};function pe(e,a,o){const s=e.displayCode||fe(e,a,"PV"),i={expense:"مصروف",supplier:"مورد",customer:"عميل",cash_box:"تحويل لصندوق / تغذية عهدة",other:"حساب عام"},d={cash:"💵 نقدي",bank:"🏦 تحويل بنكي"},r=we(e.amount||0),g=o.name||o.companyName||"شركة نظم الإمداد المتطورة",f=[o.address,o.city,o.zip,o.country].filter(Boolean).join("، ")||"ينبع، المملكة العربية السعودية",l=o.phone||o.mobile||"0549141648";o.email;const y=o.vatNumber||o.vat||o.taxNumber||"314996148100003",p=o.crNumber||o.cr||"7054969006",b=o.logoUrl||o.logoBase64||o.logo||"";return`
  <div style="font-family:'Cairo',Arial,sans-serif;direction:rtl;max-width:850px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.1);border:1px solid #cbd5e1;">

    <!-- ═══ ELEGANT BRAND TOP HEADER ═══ -->
    <div class="header-container" style="background:linear-gradient(135deg, #450a0a 0%, #1c1917 50%, #7c2d12 100%) !important;padding:26px 36px;position:relative;-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        
        <!-- Right: Company Logo + Name & Official Numbers -->
        <div style="display:flex;align-items:center;gap:20px;">
          ${b?`<img src="${b}" style="height:80px;width:80px;object-fit:contain;background:#ffffff;border-radius:14px;padding:6px;box-shadow:0 4px 12px rgba(0,0,0,0.25);" />`:'<div style="width:80px;height:80px;background:rgba(255,255,255,0.18);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:38px;color:#ffffff;">💸</div>'}
          <div>
            <div style="font-size:25px;font-weight:900;color:#ffffff !important;line-height:1.2;letter-spacing:0.3px;margin-bottom:6px;text-shadow:0 1px 2px rgba(0,0,0,0.3);">${g}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.92) !important;margin-bottom:6px;font-weight:600;">📍 ${f}</div>
            
            <!-- Clean Inline Official Badges (No ugly dark boxes) -->
            <div style="display:flex;flex-wrap:wrap;gap:6px 10px;font-size:11.5px;color:rgba(255,255,255,0.95) !important;">
              ${`<span style="background:rgba(255,255,255,0.15) !important;padding:3px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">🔢 الرقم الضريبي: <span dir="ltr" style="font-family:monospace;">${y}</span></span>`}
              ${`<span style="background:rgba(255,255,255,0.15) !important;padding:3px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📋 السجل التجاري: <span dir="ltr" style="font-family:monospace;">${p}</span></span>`}
              ${`<span style="background:rgba(255,255,255,0.15) !important;padding:3px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📞 هاتف: <span dir="ltr" style="font-family:monospace;">${l}</span></span>`}
            </div>
          </div>
        </div>

        <!-- Left: Official Certificate Title Badge -->
        <div style="text-align:center;">
          <div style="background:rgba(255,255,255,0.15) !important;backdrop-filter:blur(10px);border:2px solid rgba(255,255,255,0.35) !important;border-radius:16px;padding:14px 28px;box-shadow:0 4px 15px rgba(0,0,0,0.15);-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;">
            <div style="font-size:28px;font-weight:900;color:#ffffff !important;letter-spacing:1.5px;line-height:1;">سـنـد صـرف</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.88) !important;letter-spacing:3px;font-weight:800;margin-top:5px;text-transform:uppercase;">PAYMENT VOUCHER</div>
          </div>
        </div>

      </div>
      
      <!-- Warm Orange Accent Divider Ribbon -->
      <div style="height:5px;background:linear-gradient(90deg, #ea580c 0%, #f59e0b 50%, #ea580c 100%) !important;-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;margin-top:18px;border-radius:3px;"></div>
    </div>

    <!-- ═══ VOUCHER SERIAL & META BAR ═══ -->
    <div style="background:#fff7ed;border-bottom:1.5px solid #fed7aa;padding:18px 28px;display:grid;grid-template-columns:1fr 1.1fr 1fr 1.2fr;gap:14px;align-items:center;">
      
      <!-- Voucher Number -->
      <div style="text-align:center;border-left:1.5px solid #fed7aa;padding-left:8px;">
        <div style="font-size:11px;color:#7c2d12;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">رقم السند المتسلسل</div>
        <div dir="ltr" style="display:inline-block;direction:ltr;font-size:20px;font-weight:900;color:#9a3412;font-family:'Courier New',Consolas,monospace;background:#ffedd5;padding:3px 12px;border-radius:8px;border:1px solid #fed7aa;">${s}</div>
      </div>

      <!-- Journal Entry Number -->
      <div style="text-align:center;border-left:1.5px solid #fed7aa;padding-left:8px;">
        <div style="font-size:11px;color:#1e40af;font-weight:800;letter-spacing:0.05em;margin-bottom:4px;">القيد المحاسبي الآلي</div>
        <div dir="ltr" style="display:inline-block;direction:ltr;font-size:18px;font-weight:900;color:#1d4ed8;font-family:'Courier New',Consolas,monospace;background:#eff6ff;padding:3px 10px;border-radius:8px;border:1px solid #bfdbfe;">${e.journalEntryCode||"قيد آلي مسجل"}</div>
        <div style="font-size:10.5px;color:#059669;font-weight:700;margin-top:2px;">مرحل آلياً للشجرة ✅</div>
      </div>

      <!-- Voucher Date -->
      <div style="text-align:center;border-left:1.5px solid #fed7aa;padding-left:8px;">
        <div style="font-size:11px;color:#7c2d12;font-weight:800;letter-spacing:0.05em;margin-bottom:4px;">تاريخ التحرير</div>
        <div style="font-size:17px;font-weight:900;color:#0f172a;font-family:'Courier New',Consolas,monospace;">${e.date||"—"}</div>
      </div>

      <!-- Payment Method -->
      <div style="text-align:center;">
        <div style="font-size:11px;color:#7c2d12;font-weight:800;letter-spacing:0.05em;margin-bottom:4px;">طريقة الدفع / الحساب</div>
        <div style="font-size:15px;font-weight:900;color:#c2410c;">${d[e.method]||e.method}</div>
        <div style="font-size:12px;color:#475569;font-weight:700;margin-top:2px;">${e.sourceName||"الصندوق الرئيسي"}</div>
      </div>

    </div>

    <!-- ═══ AMOUNT BOX (المبلغ) ═══ -->
    <div style="padding:24px 36px 18px;">
      <div style="background:linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);border:2px solid #ef4444;border-radius:18px;padding:22px 30px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 3px 12px rgba(239,68,68,0.08);">
        
        <div>
          <div style="font-size:12px;color:#991b1b;font-weight:800;margin-bottom:6px;letter-spacing:0.04em;">📤 المبلغ المدفوع بالأرقام</div>
          <div style="font-size:40px;font-weight:900;color:#7f1d1d;font-family:'Courier New',Consolas,monospace;line-height:1;">${J(e.amount||0)}</div>
        </div>

        <div style="text-align:right;background:#ffffff;border:1.5px solid #fca5a5;border-radius:14px;padding:14px 22px;max-width:380px;box-shadow:0 2px 6px rgba(0,0,0,0.03);">
          <div style="font-size:11px;color:#991b1b;font-weight:800;margin-bottom:4px;">المبلغ كتابةً (تفقيط)</div>
          <div style="font-size:15px;color:#7f1d1d;font-weight:900;line-height:1.5;">فقط ${r} لا غير</div>
        </div>

      </div>
    </div>

    <!-- ═══ DETAILS GRID & STATEMENT ═══ -->
    <div style="padding:0 36px 24px;">
      <table style="width:100%;border-collapse:separate;border-spacing:0;border:1.5px solid #cbd5e1;border-radius:14px;overflow:hidden;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:13px 18px;font-size:12.5px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;text-align:right;">المدفوع له (جهة الصرف / الحساب المدين)</th>
            <th style="padding:13px 18px;font-size:12.5px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;border-right:1.5px solid #cbd5e1;text-align:right;width:140px;">نوع الجهة</th>
            <th style="padding:13px 18px;font-size:12.5px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;border-right:1.5px solid #cbd5e1;text-align:right;width:200px;">مركز التكلفة</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:16px 18px;font-size:16px;font-weight:900;color:#991b1b;">${e.accountName||e.targetName||e.supplierName||e.category||"مصروف"}</td>
            <td style="padding:16px 18px;border-right:1.5px solid #cbd5e1;">
              <span style="background:#fee2e2;color:#991b1b;padding:5px 14px;border-radius:20px;font-size:12.5px;font-weight:800;border:1px solid #fca5a5;">${i[e.entityType]||"مصروف"}</span>
            </td>
            <td style="padding:16px 18px;font-size:13.5px;font-weight:700;color:#475569;border-right:1.5px solid #cbd5e1;">${e.costCenterName||"بدون مركز تكلفة"}</td>
          </tr>
        </tbody>
      </table>

      <!-- Statement / Notes Box -->
      <div style="margin-top:18px;background:#fff7ed;border:1.5px dashed #ea580c;border-radius:14px;padding:18px 24px;">
        <div style="font-size:11.5px;color:#9a3412;font-weight:800;margin-bottom:6px;text-transform:uppercase;">البيان / ملاحظات الصرف</div>
        <div style="font-size:15px;color:#0f172a;font-weight:800;line-height:1.6;">${e.notes||e.description||"—"}</div>
      </div>
    </div>

    <!-- ═══ SIGNATURES ═══ -->
    <div style="border-top:1.5px solid #e2e8f0;padding:28px 36px 32px;background:#fafafa;">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:28px;">
        <div style="text-align:center;">
          <div style="font-size:12.5px;font-weight:800;color:#334155;margin-bottom:45px;">توقيع المستلم (الجهة المدفوع لها)</div>
          <div style="border-top:1.5px dashed #94a3b8;width:160px;margin:0 auto;color:#64748b;font-size:11px;padding-top:5px;">التوقيع / الإسم</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:12.5px;font-weight:800;color:#334155;margin-bottom:45px;">توقيع المحاسب / الأمين</div>
          <div style="border-top:1.5px dashed #94a3b8;width:160px;margin:0 auto;color:#64748b;font-size:11px;padding-top:5px;">التوقيع والختم الرسمى</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:12.5px;font-weight:800;color:#334155;margin-bottom:45px;">اعتماد المدير العام</div>
          <div style="border-top:1.5px dashed #94a3b8;width:160px;margin:0 auto;color:#64748b;font-size:11px;padding-top:5px;">التوقيع والاعتماد</div>
        </div>
      </div>
    </div>

    <!-- ═══ FOOTER ═══ -->
    <div style="background:#f1f5f9;border-top:1.5px solid #cbd5e1;padding:14px 36px;display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:11px;color:#64748b;font-weight:700;">طُبع من نظام شركة نظم الإمداد المتطورة بتاريخ: ${new Date().toLocaleString("ar-SA")}</div>
      <div dir="ltr" style="display:inline-block;direction:ltr;font-size:11px;color:#334155;font-family:monospace;font-weight:800;">REF: ${s}</div>
    </div>

  </div>`}function we(e){if(!e||isNaN(e))return"صفر";const a=Math.floor(e),o=Math.round((e-a)*100),s=["","واحد","اثنان","ثلاثة","أربعة","خمسة","ستة","سبعة","ثمانية","تسعة","عشرة","أحد عشر","اثنا عشر","ثلاثة عشر","أربعة عشر","خمسة عشر","ستة عشر","سبعة عشر","ثمانية عشر","تسعة عشر"],i=["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"],d=["","مائة","مائتان","ثلاثمائة","أربعمائة","خمسمائة","ستمائة","سبعمائة","ثمانيمائة","تسعمائة"];function r(f){return f===0?"":f<20?s[f]:f<100?i[Math.floor(f/10)]+(f%10?" و"+s[f%10]:""):d[Math.floor(f/100)]+(f%100?" و"+r(f%100):"")}let g="";return a>=1e6&&(g+=r(Math.floor(a/1e6))+" مليون "),a>=1e3&&(g+=r(Math.floor(a%1e6/1e3))+" ألف "),g+=r(a%1e3),g=g.trim()+" ريال سعودي",o>0&&(g+=` و ${r(o)} هللة`),g}export{Te as render};
