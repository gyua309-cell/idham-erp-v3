const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-_yt5fKo2.js","assets/index-Dq7oGj9k.css","assets/balance-sync-C_YRmGhd.js"])))=>i.map(i=>d[i]);
import{s as ue,t as ae,g as Y,a as q,f as K,i as fe,_ as k,e as be}from"./index-_yt5fKo2.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let te=[],w=[],V=[],J=[],de=[],re=[],R=[],W=null;async function ye(){te=(await Y(q.costCenters()).catch(()=>[])).sort((s,a)=>(s.code||"").localeCompare(a.code||""));const n=document.getElementById("exp-cc-sel");n&&(n.innerHTML='<option value="">بدون مركز تكلفة</option>'+te.map(s=>`<option value="${s.id}">${s.code} — ${s.name}</option>`).join(""));const o=document.getElementById("exp-cc-filter");o&&(o.innerHTML='<option value="">كل المراكز</option>'+te.map(s=>`<option value="${s.id}">${s.name}</option>`).join(""))}window.filterExpensesByCard=e=>{const n=document.getElementById("exp-method-filter");n&&(n.value=e==="all"?"":e,G())};async function $e(e,n){e.innerHTML=`
    <!-- ═══ FILTER BAR ═══ -->
    <div class="filterbar" style="flex-wrap:wrap;gap:10px;align-items:flex-end;background:var(--bg-1);padding:14px 18px;border-radius:14px;border:1px solid var(--border-soft);margin-bottom:20px;box-shadow:var(--shadow-sm);">
      <div class="form-group" style="margin:0;flex:1;min-width:200px;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">🔍 بحث سريع بالسندات</label>
        <input type="text" id="exp-search" class="input" placeholder="اسم الجهة، رقم السند، البيان، الصندوق..." oninput="loadExpenses()" />
      </div>
      <div class="date-range-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">من تاريخ</label>
        <input type="date" id="exp-from" class="input" value="${ue()}" onchange="loadExpenses()" />
      </div>
      <div class="date-range-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">إلى تاريخ</label>
        <input type="date" id="exp-to" class="input" value="${ae()}" onchange="loadExpenses()" />
      </div>
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">نوع الجهة</label>
        <select id="exp-entity-type-filter" class="input" onchange="loadExpenses()">
          <option value="">كل الجهات</option>
          <option value="expense">مصروف</option>
          <option value="supplier">مورد</option>
          <option value="customer">عميل</option>
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
                <th style="width:110px;">رقم السند</th>
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
              <input type="date" id="exp-date" class="input" value="${ae()}" />
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
  `;const o=e.querySelector("#exp-from"),s=e.querySelector("#exp-to");o&&o.addEventListener("change",G),s&&s.addEventListener("change",G),await Promise.all([ge(),ye(),G()])}async function ge(){w=await Y(q.chartOfAccounts()),V=await Y(q.cashBoxes()),J=await Y(q.bankAccounts()),de=await Y(q.suppliers()),re=await Y(q.customers()),onEntityTypeChange(),togglePaySource()}let ie=[];function se(e,n,o=""){if(!e)return;let s='<option value="">اختر...</option>';n&&n.length?s+=n.map(a=>`<option value="${a.id}">${a.text}</option>`).join(""):s=`<option value="">🔍 لا يوجد حساب يطابق "${o}"</option>`,e.innerHTML=s}window.onEntityTypeChange=()=>{const e=document.getElementById("exp-entity-type").value,n=document.getElementById("exp-entity-label"),o=document.getElementById("exp-target-entity"),s=document.getElementById("exp-target-search");s&&(s.value="");let a=[];e==="expense"?(n.textContent="بند المصروف (الحساب) *",a=w.filter(d=>d.type==="expense").map(d=>({id:d.id,text:`${d.code} - ${d.name}`}))):e==="supplier"?(n.textContent="المورد المستهدف *",a=de.map(d=>({id:d.id,text:d.name}))):e==="customer"?(n.textContent="العميل المستهدف *",a=re.map(d=>({id:d.id,text:d.name}))):(n.textContent="الحساب المستهدف (دليل الحسابات) *",a=w.map(d=>({id:d.id,text:`${d.code} - ${d.name}`}))),ie=a,se(o,a)};window.filterExpenseTargetEntity=()=>{const e=(document.getElementById("exp-target-search")?.value||"").trim().toLowerCase(),n=document.getElementById("exp-target-entity");if(!e){se(n,ie);return}const o=ie.filter(s=>s.text.toLowerCase().includes(e));se(n,o,e),o.length===1&&n&&(n.value=o[0].id)};window.togglePaySource=()=>{const e=document.getElementById("exp-pay-method")?.value||"cash",n=document.getElementById("exp-source-label"),o=document.getElementById("exp-source");if(o)if(o.innerHTML='<option value="">اختر...</option>',e==="cash"){n&&(n.textContent="صندوق الصرف *");let s=V&&V.length>0?V:[];s.length===0&&w&&w.length>0&&(s=w.filter(a=>a.code?.startsWith("1-1-1-1")||a.code?.startsWith("1-1-1-2")||a.name?.includes("صندوق")||a.code==="1-1-1-1-3")),o.innerHTML+=s.map(a=>`<option value="${a.id}">${a.name||a.accountName||a.code}</option>`).join("")}else{n&&(n.textContent="الحساب البنكي المخصوم منه *");let s=J&&J.length>0?J:[];s.length===0&&w&&w.length>0&&(s=w.filter(a=>a.code?.startsWith("1-1-1-3")||a.name?.includes("بنك")||a.name?.includes("الراجح")||a.name?.includes("الجزير"))),o.innerHTML+=s.map(a=>{const d=a.name||a.bankName||a.accountName||"حساب بنكي",l=a.accountNumber?` (${a.accountNumber})`:a.accountCode?` [${a.accountCode}]`:"";return`<option value="${a.id}">${d}${l}</option>`}).join("")}};window.openExpenseModal=async()=>{(!V.length||!J.length||!w.length)&&await ge(),W=null;const e=document.getElementById("expense-modal-title");e&&(e.textContent="سند صرف جديد (Payment Voucher)"),document.getElementById("exp-date").value=ae(),document.getElementById("exp-amount").value="",document.getElementById("exp-entity-type").value="expense",onEntityTypeChange();const n=document.getElementById("exp-pay-method");n&&(n.value="cash"),togglePaySource(),document.getElementById("exp-notes").value="";const o=document.getElementById("exp-cc-sel");o&&(o.value=""),document.getElementById("exp-error").classList.add("hidden"),openModal("expense-modal")};window.saveExpense=async()=>{const e=document.getElementById("exp-error");e.classList.add("hidden");const n=document.getElementById("exp-date").value,o=parseFloat(document.getElementById("exp-amount").value),s=document.getElementById("exp-entity-type").value,a=document.getElementById("exp-target-entity").value,d=document.getElementById("exp-pay-method").value,l=document.getElementById("exp-source").value,x=document.getElementById("exp-notes").value.trim();if(!n||!o||o<=0||!a||!l||!x){e.textContent="الرجاء تعبئة جميع الحقول المطلوبة وكتابة بيان صحيح",e.classList.remove("hidden");return}const u=document.getElementById("save-exp-btn");u.disabled=!0;try{if(await fe(n)){e.textContent=`⚠️ لا يمكن حفظ سند الصرف لأن تاريخه (${n}) يقع في فترة محاسبية مغلقة ومقفلة نهائياً.`,e.classList.remove("hidden"),u.disabled=!1;return}const{doc:c,runTransaction:f,serverTimestamp:p,collection:y,getDoc:m,getDocs:P,query:S,where:B,updateDoc:D}=await k(async()=>{const{doc:i,runTransaction:g,serverTimestamp:r,collection:b,getDoc:z,getDocs:F,query:Z,where:H,updateDoc:O}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:i,runTransaction:g,serverTimestamp:r,collection:b,getDoc:z,getDocs:F,query:Z,where:H,updateDoc:O}},[]),{db:E,COMPANY_ID:C}=await k(async()=>{const{db:i,COMPANY_ID:g}=await import("./index-_yt5fKo2.js").then(r=>r.S);return{db:i,COMPANY_ID:g}},__vite__mapDeps([0,1]));if(W){const i=c(E,`companies/${C}/expenses`,W),g=await m(i);if(g.exists()){const r=g.data(),b=c(E,`companies/${C}/${r.method==="cash"?"cashBoxes":"bankAccounts"}`,r.sourceId),z=await m(b);if(z.exists()){const O=parseFloat(z.data().balance||0);await D(b,{balance:O+r.amount,updatedAt:p()})}const{deleteJournalEntry:F}=await k(async()=>{const{deleteJournalEntry:O}=await import("./index-_yt5fKo2.js").then(oe=>oe.T);return{deleteJournalEntry:O}},__vite__mapDeps([0,1])),Z=S(y(E,`companies/${C}/journalEntries`),B("sourceId","==",W),B("sourceType","==","expense")),H=await P(Z);H.empty||await F(H.docs[0].id)}}let _="",N="",h="",A="";if(s==="expense"){const i=w.find(g=>g.id===a);_=a,N=i?.code,h=i?.name,A=i?.name}else if(s==="supplier"){const i=de.find(r=>r.id===a);A=i?.name;const g="2-1-1-1-1";if(i?.accountId){const r=w.find(b=>b.id===i.accountId);r&&(_=r.id,N=r.code,h=r.name)}if(!_){const r=w.find(b=>b.sourceEntityId===a);r&&(_=r.id,N=r.code,h=r.name)}if(!_&&i?.name){const r=i.name.trim().toLowerCase(),b=w.find(z=>z.name&&(z.name.trim().toLowerCase()===r||z.name.includes(i.name)||i.name.includes(z.name)));_=b?.id||w.find(z=>z.code===g)?.id,N=b?.code||g,h=b?.name||"ذمم الموردين"}}else if(s==="customer"){const i=re.find(r=>r.id===a);A=i?.name;const g="1-1-2-1-1";for(const r in w){const b=w[r];if(b.sourceEntityId===a&&b.sourceModule==="customers"){_=b.id,N=b.code,h=b.name;break}}if(!_){const r=w.find(b=>b.name.includes(i?.name));_=r?.id||w.find(b=>b.code===g)?.id,N=r?.code||g,h=r?.name||"ذمم العملاء"}}else{const i=w.find(g=>g.id===a);_=a,N=i?.code,h=i?.name,A=i?.name}let $="",j="",M="",t=null;if(d==="cash"){const i=V.find(r=>r.id===l);$=i?.accountId||null;const g=w.find(r=>r.id===i?.accountId||i?.accountCode&&r.code===i.accountCode||r.id===l||r.code===l);$=$||g?.id||null,j=g?.code||i?.accountCode||i?.code||null,M=g?.name||i?.name||null,t=c(E,`companies/${C}/cashBoxes`,l)}else{const i=J.find(r=>r.id===l);$=i?.accountId||null;let g=w.find(r=>r.id===i?.accountId||i?.accountCode&&r.code===i.accountCode||r.id===l||r.code===l);if(!g&&i?.name){const r=i.name.replace(/[\s\-_]/g,"").toLowerCase();g=w.find(b=>b.parentCode==="1-1-1-3"&&(b.name?.replace(/[\s\-_]/g,"").toLowerCase().includes(r)||r.includes((b.name||"").replace(/[\s\-_]/g,"").toLowerCase())))}$=$||g?.id||null,j=g?.code||i?.accountCode||i?.code||null,M=g?.name||i?.name||null,t=c(E,`companies/${C}/bankAccounts`,l)}if(!$){const i=w.find(g=>g.code===(d==="cash"?"1-1-1-1-3":"1-1-1-3-02"))||d!=="cash"&&w.find(g=>g.code?.startsWith("1-1-1-3"))||w.find(g=>g.code==="1-1-1-1-3");$=i?.id||null,j=i?.code||null,M=i?.name||null}const v=V.find(i=>i.accountId===_||i.id===a||i.accountCode===N);let T=null;v&&(T=c(E,`companies/${C}/cashBoxes`,v.id));let I="";await f(E,async i=>{let g=0,r=null;t&&(r=await i.get(t),r.exists()&&(g=parseFloat(r.data().balance||0)));let b=null,z=0;T&&(b=await i.get(T),b.exists()&&(z=parseFloat(b.data().balance||0)));let F=null,Z=0,H=null;$&&(H=c(E,`companies/${C}/chartOfAccounts`,$),F=await i.get(H),F.exists()&&(Z=parseFloat(F.data().balance||0)));let O=null,oe=0,ce=null;_&&(ce=c(E,`companies/${C}/chartOfAccounts`,_),O=await i.get(ce),O.exists()&&(oe=parseFloat(O.data().balance||0)));const ne=g-o,pe=z+o;t&&i.update(t,{balance:ne,updatedAt:p()}),T&&b&&b.exists()&&i.update(T,{balance:pe,updatedAt:p()});const xe=W?c(E,`companies/${C}/expenses`,W):c(y(E,`companies/${C}/expenses`));if(I=xe.id,i.set(xe,{date:n,amount:o,entityType:s,targetId:a,accountName:A||"مصروف",method:d,sourceId:l,sourceName:d==="cash"?V.find(L=>L.id===l)?.name:J.find(L=>L.id===l)?.name,notes:x,costCenterId:document.getElementById("exp-cc-sel")?.value||null,costCenterName:te.find(L=>L.id===document.getElementById("exp-cc-sel")?.value)?.name||null,createdAt:p(),updatedAt:p()}),d==="cash"){const L=c(y(E,`companies/${C}/cashTransactions`));i.set(L,{cashBoxId:l,type:"out",amount:o,balanceAfter:ne,notes:`سند صرف رقم ${I.substring(0,6).toUpperCase()} — ${x}`,userName:"المستخدم",createdAt:p()})}else{const L=c(y(E,`companies/${C}/bankTransactions`));i.set(L,{bankAccountId:l,type:"out",amount:o,balanceAfter:ne,notes:`سند صرف رقم ${I.substring(0,6).toUpperCase()} — ${x}`,refNumber:`PV-${I.substring(0,6).toUpperCase()}`,createdAt:p()})}if(v&&b&&b.exists()){const L=c(y(E,`companies/${C}/cashTransactions`));i.set(L,{cashBoxId:v.id,type:"in",amount:o,balanceAfter:pe,notes:`توريد واستلام من سند صرف رقم ${I.substring(0,6).toUpperCase()} — ${x}`,userName:"المستخدم",createdAt:p()})}});const U=w.find(i=>i.id===_),ee=w.find(i=>i.id===$);await be({date:n,description:`سند صرف رقم #${I.substring(0,6).toUpperCase()} - ${x}`,sourceType:"expense",sourceId:I,lines:[{accountId:_,accountCode:N||U?.code||"",accountName:h||U?.name||"",debit:o,credit:0,note:x,costCenterId:document.getElementById("exp-cc-sel")?.value||null},{accountId:$,accountCode:j||ee?.code||"",accountName:M||ee?.name||"",debit:0,credit:o,note:"سداد سند صرف",costCenterId:document.getElementById("exp-cc-sel")?.value||null}]});const{clearERPCache:Q}=await k(async()=>{const{clearERPCache:i}=await import("./index-_yt5fKo2.js").then(g=>g.T);return{clearERPCache:i}},__vite__mapDeps([0,1]));Q(`companies/${C}/expenses`),Q(`companies/${C}/chartOfAccounts`),Q(`companies/${C}/journalEntries`),showToast("تم حفظ سند الصرف واعتماده","success");const X=document.getElementById("exp-file-upload");if(X&&X.files.length>0){const i=X.files[0];window.uploadFileToArchive(i,"expenses",I,`مرفق سند صرف رقم PV-${I.substring(0,6).toUpperCase()}: ${x}`).catch(g=>console.warn(g))}closeModal("expense-modal"),await G(),s==="customer"?k(()=>import("./balance-sync-C_YRmGhd.js"),__vite__mapDeps([2,0,1])).then(i=>i.recalculateCustomerBalance(a)).catch(i=>console.warn(i)):s==="supplier"&&k(()=>import("./balance-sync-C_YRmGhd.js"),__vite__mapDeps([2,0,1])).then(i=>i.recalculateSupplierBalance(a)).catch(i=>console.warn(i))}catch(c){e.textContent=c.message,e.classList.remove("hidden")}finally{u.disabled=!1}};window.printSingleExpenseVoucher=async e=>{let n=R.find(d=>d.id===e);if(!n)try{const{doc:d,getDoc:l}=await k(async()=>{const{doc:f,getDoc:p}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:f,getDoc:p}},[]),{db:x,COMPANY_ID:u}=await k(async()=>{const{db:f,COMPANY_ID:p}=await import("./index-_yt5fKo2.js").then(y=>y.S);return{db:f,COMPANY_ID:p}},__vite__mapDeps([0,1])),c=await l(d(x,`companies/${u}/expenses`,e));c.exists()&&(n={id:c.id,...c.data()})}catch{}if(!n){showToast("سند الصرف غير موجود","error");return}let o={};try{const{doc:d,getDoc:l}=await k(async()=>{const{doc:p,getDoc:y}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:p,getDoc:y}},[]),{db:x,COMPANY_ID:u}=await k(async()=>{const{db:p,COMPANY_ID:y}=await import("./index-_yt5fKo2.js").then(m=>m.S);return{db:p,COMPANY_ID:y}},__vite__mapDeps([0,1])),[c,f]=await Promise.all([l(d(x,`companies/${u}/settings/company`)),l(d(x,`companies/${u}/settings/logo`))]);c.exists()&&(o=c.data()),f.exists()&&(o.logoUrl=f.data().dataUrl||f.data().logoUrl||"")}catch{}const s=le(n,e,o),a=window.open("","_blank","width=850,height=700");a.document.write(`<!DOCTYPE html>
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
</html>`),a.document.close(),setTimeout(()=>{a.focus(),a.print(),a.close()},600)};async function G(){const e=document.getElementById("exp-from"),n=document.getElementById("exp-to"),o=document.getElementById("exp-search"),s=document.getElementById("exp-entity-type-filter"),a=document.getElementById("exp-method-filter"),d=document.getElementById("exp-cc-filter"),l=document.getElementById("exp-tbody");if(!l)return;const x=e?e.value:"",u=n?n.value:"",c=(o?.value||"").trim().toLowerCase(),f=s?.value||"",p=a?.value||"",y=d?.value||"";try{let m=await Y(q.expenses()).catch(()=>[]);m.sort((t,v)=>{const T=(t.date||"").localeCompare(v.date||"");if(T!==0)return T;const I=t.createdAt?.seconds||t.createdAt||0,U=v.createdAt?.seconds||v.createdAt||0;return I-U}),m.forEach((t,v)=>{!t.number&&!t.seqNo?t.displayCode=`PV-${String(v+101).padStart(5,"0")}`:t.displayCode=`PV-${String(t.number||t.seqNo).padStart(5,"0")}`}),m.sort((t,v)=>{const T=(v.date||"").localeCompare(t.date||"");if(T!==0)return T;const I=t.createdAt?.seconds||t.createdAt||0;return(v.createdAt?.seconds||v.createdAt||0)-I}),R=m,x&&(m=m.filter(t=>t.date&&t.date>=x)),u&&(m=m.filter(t=>t.date&&t.date<=u)),p==="cash"?m=m.filter(t=>t.method==="cash"||t.sourceName&&t.sourceName.includes("صندوق")):p==="bank"&&(m=m.filter(t=>t.method==="bank"||t.method==="transfer"||t.method==="bank_transfer"||t.method==="network"||t.method==="cheque"||t.sourceName&&(t.sourceName.includes("بنك")||t.sourceName.includes("مصرف")||t.sourceName.includes("الراجحى")||t.sourceName.includes("الاهلي")))),f&&(m=m.filter(t=>t.entityType===f)),y&&(m=m.filter(t=>t.costCenterId===y)),c&&(m=m.filter(t=>{const v=(t.id||"").toLowerCase(),T=(t.number||"").toLowerCase(),I=(t.displayCode||"").toLowerCase(),U=v.substring(0,6),ee=(t.accountName||t.targetName||t.supplierName||t.category||"").toLowerCase(),Q=(t.notes||t.description||"").toLowerCase(),X=(t.sourceName||"").toLowerCase(),i=(t.costCenterName||"").toLowerCase();return v.includes(c)||T.includes(c)||I.includes(c)||U.includes(c)||ee.includes(c)||Q.includes(c)||X.includes(c)||i.includes(c)}));const P=m.reduce((t,v)=>t+(v.amount||0),0),S=m.filter(t=>t.method==="cash"||t.sourceName&&t.sourceName.includes("صندوق")).reduce((t,v)=>t+(v.amount||0),0),B=m.filter(t=>t.method==="bank"||t.method==="transfer"||t.method==="bank_transfer"||t.sourceName&&(t.sourceName.includes("بنك")||t.sourceName.includes("مصرف")||t.sourceName.includes("الراجحى"))).reduce((t,v)=>t+(v.amount||0),0),D=document.getElementById("kpi-exp-total"),E=document.getElementById("kpi-exp-cash"),C=document.getElementById("kpi-exp-bank"),_=document.getElementById("kpi-exp-count"),N=document.getElementById("exp-count");D&&(D.textContent=K(P)),E&&(E.textContent=K(S)),C&&(C.textContent=K(B)),_&&(_.textContent=`${m.length} سند`),N&&(N.textContent=`مستندات الصرف المفلترة: ${m.length} سند — إجمالي المدفوعات: ${K(P)}`);const h=document.getElementById("kpi-exp-badge-all"),A=document.getElementById("kpi-exp-badge-cash"),$=document.getElementById("kpi-exp-badge-bank");if(h&&(h.style.background=p===""?"#ef4444":"rgba(239,68,68,0.15)",h.textContent=p===""?"نشط 🎯":"الكل 🔍"),A&&(A.style.background=p==="cash"?"#d97706":"rgba(245,158,11,0.15)",A.style.color=p==="cash"?"#fff":"#d97706",A.textContent=p==="cash"?"نشط 🎯":"تصفية 🔍"),$&&($.style.background=p==="bank"?"#1d4ed8":"rgba(37,99,235,0.15)",$.style.color=p==="bank"?"#fff":"#1d4ed8",$.textContent=p==="bank"?"نشط 🎯":"تصفية 🔍"),!m.length){l.innerHTML='<tr><td colspan="9" style="text-align:center;padding:36px;color:var(--text-3);font-weight:700;">🔍 لا توجد سندات صرف ضمن التصفية الفعالة حالياً</td></tr>';return}const j={expense:"مصروف",supplier:"مورد",customer:"عميل",other:"حساب عام"},M={expense:"background:rgba(239,68,68,0.12);color:#ef4444;border:1px solid rgba(239,68,68,0.25);",supplier:"background:rgba(99,102,241,0.12);color:#4f46e5;border:1px solid rgba(99,102,241,0.25);",customer:"background:rgba(16,185,129,0.12);color:#059669;border:1px solid rgba(16,185,129,0.25);",other:"background:rgba(107,114,128,0.12);color:#4b5563;border:1px solid rgba(107,114,128,0.25);"};l.innerHTML=m.map(t=>{const v=t.method==="bank"||t.method==="transfer"||t.method==="bank_transfer"||t.sourceName&&(t.sourceName.includes("بنك")||t.sourceName.includes("مصرف")||t.sourceName.includes("الراجحى")),T=v?"background:rgba(37,99,235,0.06);border-bottom:1px solid rgba(37,99,235,0.12);":"background:rgba(239,68,68,0.02);border-bottom:1px solid var(--border-soft);",I=v?`<span class="badge" style="background:#eff6ff;color:#1d4ed8;border:1.5px solid #93c5fd;font-weight:800;padding:4px 10px;border-radius:8px;box-shadow:0 1px 3px rgba(37,99,235,0.12);">🏦 تحويل بنكي — ${t.sourceName||"بنك"}</span>`:`<span class="badge" style="background:#fff7ed;color:#c2410c;border:1px solid #ffedd5;font-weight:700;padding:4px 10px;border-radius:8px;">💵 نقدي — ${t.sourceName||"صندوق"}</span>`;return`
        <tr style="${T}transition:all 0.15s ease;">
          <td class="mono font-bold" style="font-size:12.5px;">${t.date||"—"}</td>
          <td class="mono" style="font-size:12px;"><span dir="ltr" style="display:inline-block;direction:ltr;background:var(--bg-2);padding:3px 10px;border-radius:6px;font-weight:900;color:#c2410c;font-family:monospace;">${t.displayCode}</span></td>
          <td><strong style="font-size:13.5px;color:var(--text-1);">${t.accountName||t.targetName||t.supplierName||t.category||t.description||"—"}</strong></td>
          <td><span class="badge" style="${M[t.entityType]||M.expense}font-size:11px;font-weight:700;">${j[t.entityType]||"مصروف"}</span></td>
          <td><small style="color:var(--text-2);font-size:12px;font-weight:600;">${t.notes||t.description||"—"}</small></td>
          <td>${I}</td>
          <td>${t.costCenterName?`<span style="font-size:11px;background:rgba(249,115,22,0.1);padding:3px 10px;border-radius:12px;color:#c2410c;font-weight:700;">${t.costCenterName}</span>`:"—"}</td>
          <td style="text-align:left;" class="mono font-bold text-bad" style="font-size:14px;">${K(t.amount||0)}</td>
          <td style="text-align:center;" class="no-print">
            <div style="display:flex;gap:4px;justify-content:center;">
              <button class="btn btn-icon sm btn-ghost text-brand" onclick="previewExpense('${t.id}')" title="معاينة السند">👁️</button>
              <button class="btn btn-icon sm btn-ghost text-ok" onclick="editExpense('${t.id}')" title="تعديل السند">✏️</button>
              <button class="btn btn-icon sm btn-ghost text-warning" onclick="printSingleExpenseVoucher('${t.id}')" title="طباعة سند آلي">🖨️</button>
              <button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteExpense('${t.id}')" title="حذف نهائي">🗑️</button>
            </div>
          </td>
        </tr>
      `}).join("")}catch(m){console.error(m),l.innerHTML=`<tr><td colspan="9" class="text-bad" style="text-align:center;">خطأ في تحميل المصروفات: ${m.message}</td></tr>`}}window.loadExpenses=G;function me(e,n,o){if(e&&e.displayCode)return e.displayCode;if(e&&(e.number||e.seqNo)){const d=e.number||e.seqNo;return`${o}-${String(d).padStart(5,"0")}`}if(typeof R<"u"&&R.length){const d=R.findIndex(l=>l.id===n);if(d!==-1)return`${o}-${String(d+101).padStart(5,"0")}`}let s=0;for(let d=0;d<n.length;d++)s=(s<<5)-s+n.charCodeAt(d),s|=0;const a=Math.abs(s%8999)+101;return`${o}-${String(a).padStart(5,"0")}`}window.previewExpense=async e=>{let n=(typeof R<"u"?R:[]).find(s=>s.id===e);const o=document.getElementById("expense-preview-body");if(o){o.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-3);"><i class="fas fa-spinner fa-spin fa-2x"></i><br><br>جارٍ تحميل بيانات الشركة والشعار...</div>',openModal("expense-preview-modal");try{const{doc:s,getDoc:a}=await k(async()=>{const{doc:f,getDoc:p}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:f,getDoc:p}},[]),{db:d,COMPANY_ID:l}=await k(async()=>{const{db:f,COMPANY_ID:p}=await import("./index-_yt5fKo2.js").then(y=>y.S);return{db:f,COMPANY_ID:p}},__vite__mapDeps([0,1]));if(!n){const f=await a(s(d,`companies/${l}/expenses`,e));f.exists()&&(n={id:f.id,...f.data()})}if(!n){o.innerHTML='<div style="padding:30px;text-align:center;color:var(--bad);">سند الصرف غير موجود</div>';return}n.displayCode=me(n,e,"PV");const[x,u]=await Promise.all([a(s(d,`companies/${l}/settings/company`)),a(s(d,`companies/${l}/settings/logo`))]),c=x.exists()?x.data():{};u.exists()&&(c.logoUrl=u.data().dataUrl||u.data().logoUrl||""),o.innerHTML=le(n,e,c)}catch(s){console.error(s),o.innerHTML=`<div style="padding:40px;text-align:center;color:var(--bad);">خطأ في تحميل بيانات المعاينة: ${s.message}</div>`}}};window.printExpenseVoucher=()=>{const e=document.getElementById("expense-preview-body");if(!e)return;const n=e.innerHTML,o=window.open("","_blank","width=850,height=700");o.document.write(`<!DOCTYPE html>
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
<body>${n}</body>
</html>`),o.document.close(),setTimeout(()=>{o.focus(),o.print(),o.close()},600)};window.printAllExpenseVouchers=async()=>{const e=typeof R<"u"?R:[];if(!e.length){window.showToast("لا توجد سندات صرف للطباعة في القائمة الحالية","warning");return}let n={};try{const{doc:a,getDoc:d}=await k(async()=>{const{doc:f,getDoc:p}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:f,getDoc:p}},[]),{db:l,COMPANY_ID:x}=await k(async()=>{const{db:f,COMPANY_ID:p}=await import("./index-_yt5fKo2.js").then(y=>y.S);return{db:f,COMPANY_ID:p}},__vite__mapDeps([0,1])),[u,c]=await Promise.all([d(a(l,`companies/${x}/settings/company`)),d(a(l,`companies/${x}/settings/logo`))]);u.exists()&&(n=u.data()),c.exists()&&(n.logoUrl=c.data().dataUrl||c.data().logoUrl||"")}catch{}const o=e.map((a,d)=>`<div style="${d===e.length-1?"":"page-break-after:always;"}">${le(a,a.id,n)}</div>`).join(""),s=window.open("","_blank","width=900,height=700");s.document.write(`<!DOCTYPE html>
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
</html>`),s.document.close(),setTimeout(()=>{s.focus(),s.print(),s.close()},800)};window.printBlankExpenseVoucher=async()=>{let e={};try{const{doc:f,getDoc:p}=await k(async()=>{const{doc:B,getDoc:D}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:B,getDoc:D}},[]),{db:y,COMPANY_ID:m}=await k(async()=>{const{db:B,COMPANY_ID:D}=await import("./index-_yt5fKo2.js").then(E=>E.S);return{db:B,COMPANY_ID:D}},__vite__mapDeps([0,1])),[P,S]=await Promise.all([p(f(y,`companies/${m}/settings/company`)),p(f(y,`companies/${m}/settings/logo`))]);P.exists()&&(e=P.data()),S.exists()&&(e.logoUrl=S.data().dataUrl||S.data().logoUrl||"")}catch{}const n=e.name||e.companyName||"شركة نظم الإمداد الحديثة",o=[e.address,e.city,e.zip,e.country].filter(Boolean).join("، ")||"ينبع، المملكة العربية السعودية",s=e.phone||e.mobile||"",a=e.vatNumber||e.vat||e.taxNumber||"",d=e.crNumber||e.cr||"",l=e.logoUrl||e.logoBase64||e.logo||"",x=(f="48px")=>`<div style="border:1.5px dashed #d1d5db;border-radius:8px;height:${f};width:100%;"></div>`,u=`
  <div style="font-family:'Cairo',Arial,sans-serif;direction:rtl;max-width:820px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.08);border:1px solid #cbd5e1;">

    <!-- ═══ ROYAL HEADER (Red/Brown Payment Theme) ═══ -->
    <div class="header-container" style="background:linear-gradient(135deg,#450a0a 0%,#1c1917 50%,#7c2d12 100%) !important;padding:20px 30px;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="display:flex;align-items:center;gap:16px;">
          ${l?`<img src="${l}" style="height:70px;width:70px;object-fit:contain;background:#fff;border-radius:12px;padding:5px;box-shadow:0 3px 10px rgba(0,0,0,0.2);" />`:'<div style="width:70px;height:70px;background:rgba(255,255,255,0.15);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:32px;">🏢</div>'}
          <div>
            <div style="font-size:22px;font-weight:900;color:#fff !important;margin-bottom:5px;text-shadow:0 1px 2px rgba(0,0,0,0.3);">${n}</div>
            <div style="font-size:11.5px;color:rgba(255,255,255,0.9) !important;margin-bottom:5px;">📍 ${o}</div>
            <div style="display:flex;flex-wrap:wrap;gap:5px 8px;font-size:11px;color:rgba(255,255,255,0.95) !important;">
              ${a?`<span style="background:rgba(255,255,255,0.15) !important;padding:2px 9px;border-radius:7px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">🔢 الرقم الضريبي: <span dir="ltr">${a}</span></span>`:""}
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
          <div style="font-size:13px;color:#7f1d1d;font-weight:700;">فقط ${x("24px")} لا غير</div>
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
            <td style="padding:14px 16px;">${x("32px")}</td>
            <td style="padding:14px 16px;border-right:1.5px solid #cbd5e1;">
              <div style="display:flex;flex-direction:column;gap:6px;font-size:12px;font-weight:700;color:#334155;">
                <label style="display:flex;align-items:center;gap:5px;"><span style="width:13px;height:13px;border:1.5px solid #c2410c;border-radius:50%;display:inline-block;"></span> مصروف</label>
                <label style="display:flex;align-items:center;gap:5px;"><span style="width:13px;height:13px;border:1.5px solid #c2410c;border-radius:50%;display:inline-block;"></span> مورد</label>
                <label style="display:flex;align-items:center;gap:5px;"><span style="width:13px;height:13px;border:1.5px solid #c2410c;border-radius:50%;display:inline-block;"></span> عميل / أخرى</label>
              </div>
            </td>
            <td style="padding:14px 16px;border-right:1.5px solid #cbd5e1;">${x("32px")}</td>
          </tr>
        </tbody>
      </table>

      <!-- Notes -->
      <div style="margin-top:14px;background:#fff7ed;border:1.5px dashed #ea580c;border-radius:12px;padding:14px 20px;">
        <div style="font-size:10.5px;color:#9a3412;font-weight:800;margin-bottom:8px;">البيان / ملاحظات وسبب الصرف</div>
        ${x("36px")}
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
      <div style="font-size:10.5px;color:#64748b;font-weight:700;">نموذج سند صرف — ${n}</div>
      <div style="font-size:10.5px;color:#94a3b8;font-family:monospace;">BLANK PAYMENT VOUCHER TEMPLATE</div>
    </div>

  </div>`,c=window.open("","_blank","width=900,height=700");c.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>سند صرف فارغ — ${n}</title>
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
<body>${u}</body>
</html>`),c.document.close(),setTimeout(()=>{c.focus(),c.print(),c.close()},600)};window.editExpense=e=>{const n=R.find(a=>a.id===e);if(!n)return;W=e;const o=document.getElementById("expense-modal-title");o&&(o.textContent=`تعديل سند الصرف (#${e.substring(0,6).toUpperCase()})`),document.getElementById("exp-date").value=n.date,document.getElementById("exp-amount").value=n.amount,document.getElementById("exp-entity-type").value=n.entityType,window.onEntityTypeChange(),document.getElementById("exp-target-entity").value=n.targetId,document.getElementById("exp-pay-method").value=n.method,window.togglePaySource(),document.getElementById("exp-source").value=n.sourceId,document.getElementById("exp-notes").value=n.notes||"";const s=document.getElementById("exp-cc-sel");s&&(s.value=n.costCenterId||""),document.getElementById("exp-error").classList.add("hidden"),openModal("expense-modal")};window.deleteExpense=async e=>{if(await window.showConfirm?.("هل أنت متأكد من رغبتك في حذف سند الصرف هذا؟ سيتم إرجاع المبالغ للصندوق/البنك وعكس القيود المحاسبية بالكامل.","حذف سند الصرف"))try{const{doc:o,getDoc:s,updateDoc:a,deleteDoc:d,getDocs:l,query:x,where:u,collection:c,serverTimestamp:f}=await k(async()=>{const{doc:h,getDoc:A,updateDoc:$,deleteDoc:j,getDocs:M,query:t,where:v,collection:T,serverTimestamp:I}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:h,getDoc:A,updateDoc:$,deleteDoc:j,getDocs:M,query:t,where:v,collection:T,serverTimestamp:I}},[]),{db:p,COMPANY_ID:y}=await k(async()=>{const{db:h,COMPANY_ID:A}=await import("./index-_yt5fKo2.js").then($=>$.S);return{db:h,COMPANY_ID:A}},__vite__mapDeps([0,1])),{deleteJournalEntry:m}=await k(async()=>{const{deleteJournalEntry:h}=await import("./index-_yt5fKo2.js").then(A=>A.T);return{deleteJournalEntry:h}},__vite__mapDeps([0,1])),P=o(p,`companies/${y}/expenses`,e),S=await s(P);if(!S.exists()){window.showToast("سند الصرف غير موجود","error");return}const B=S.data(),D=o(p,`companies/${y}/${B.method==="cash"?"cashBoxes":"bankAccounts"}`,B.sourceId),E=await s(D);if(E.exists()){const h=parseFloat(E.data().balance||0);await a(D,{balance:h+B.amount,updatedAt:f()})}const C=x(c(p,`companies/${y}/journalEntries`),u("sourceId","==",e),u("sourceType","==","expense")),_=await l(C);_.empty||await m(_.docs[0].id),await d(P);const{clearERPCache:N}=await k(async()=>{const{clearERPCache:h}=await import("./index-_yt5fKo2.js").then(A=>A.T);return{clearERPCache:h}},__vite__mapDeps([0,1]));N(`companies/${y}/expenses`),N(`companies/${y}/chartOfAccounts`),N(`companies/${y}/journalEntries`),window.showToast("تم حذف سند الصرف وعكس القيود المحاسبية بنجاح","success"),await G(),B.entityType==="customer"?k(()=>import("./balance-sync-C_YRmGhd.js"),__vite__mapDeps([2,0,1])).then(h=>h.recalculateCustomerBalance(B.targetId)).catch(h=>console.warn(h)):B.entityType==="supplier"&&k(()=>import("./balance-sync-C_YRmGhd.js"),__vite__mapDeps([2,0,1])).then(h=>h.recalculateSupplierBalance(B.targetId)).catch(h=>console.warn(h))}catch(o){console.error(o),window.showToast("خطأ في حذف سند الصرف: "+o.message,"error")}};function le(e,n,o){const s=e.displayCode||me(e,n,"PV"),a={expense:"مصروف",supplier:"مورد",customer:"عميل",other:"حساب عام"},d={cash:"💵 نقدي",bank:"🏦 تحويل بنكي"},l=he(e.amount||0),x=o.name||o.companyName||"شركة نظم الإمداد الحديثة",u=[o.address,o.city,o.zip,o.country].filter(Boolean).join("، ")||"ينبع، المملكة العربية السعودية",c=o.phone||o.mobile||"0549141648";o.email;const f=o.vatNumber||o.vat||o.taxNumber||"312448150500003",p=o.crNumber||o.cr||"4700123180",y=o.logoUrl||o.logoBase64||o.logo||"";return`
  <div style="font-family:'Cairo',Arial,sans-serif;direction:rtl;max-width:850px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.1);border:1px solid #cbd5e1;">

    <!-- ═══ ELEGANT BRAND TOP HEADER ═══ -->
    <div class="header-container" style="background:linear-gradient(135deg, #450a0a 0%, #1c1917 50%, #7c2d12 100%) !important;padding:26px 36px;position:relative;-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        
        <!-- Right: Company Logo + Name & Official Numbers -->
        <div style="display:flex;align-items:center;gap:20px;">
          ${y?`<img src="${y}" style="height:80px;width:80px;object-fit:contain;background:#ffffff;border-radius:14px;padding:6px;box-shadow:0 4px 12px rgba(0,0,0,0.25);" />`:'<div style="width:80px;height:80px;background:rgba(255,255,255,0.18);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:38px;color:#ffffff;">💸</div>'}
          <div>
            <div style="font-size:25px;font-weight:900;color:#ffffff !important;line-height:1.2;letter-spacing:0.3px;margin-bottom:6px;text-shadow:0 1px 2px rgba(0,0,0,0.3);">${x}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.92) !important;margin-bottom:6px;font-weight:600;">📍 ${u}</div>
            
            <!-- Clean Inline Official Badges (No ugly dark boxes) -->
            <div style="display:flex;flex-wrap:wrap;gap:6px 10px;font-size:11.5px;color:rgba(255,255,255,0.95) !important;">
              ${`<span style="background:rgba(255,255,255,0.15) !important;padding:3px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">🔢 الرقم الضريبي: <span dir="ltr" style="font-family:monospace;">${f}</span></span>`}
              ${`<span style="background:rgba(255,255,255,0.15) !important;padding:3px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📋 السجل التجاري: <span dir="ltr" style="font-family:monospace;">${p}</span></span>`}
              ${`<span style="background:rgba(255,255,255,0.15) !important;padding:3px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📞 هاتف: <span dir="ltr" style="font-family:monospace;">${c}</span></span>`}
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
    <div style="background:#fff7ed;border-bottom:1.5px solid #fed7aa;padding:18px 36px;display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:20px;align-items:center;">
      
      <!-- Voucher Number -->
      <div style="text-align:center;border-left:1.5px solid #fed7aa;padding-left:12px;">
        <div style="font-size:11px;color:#7c2d12;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">رقم السند المتسلسل</div>
        <div dir="ltr" style="display:inline-block;direction:ltr;font-size:22px;font-weight:900;color:#9a3412;font-family:'Courier New',Consolas,monospace;background:#ffedd5;padding:3px 14px;border-radius:8px;border:1px solid #fed7aa;">${s}</div>
      </div>

      <!-- Voucher Date -->
      <div style="text-align:center;border-left:1.5px solid #fed7aa;padding-left:12px;">
        <div style="font-size:11px;color:#7c2d12;font-weight:800;letter-spacing:0.05em;margin-bottom:4px;">تاريخ التحرير</div>
        <div style="font-size:18px;font-weight:900;color:#0f172a;font-family:'Courier New',Consolas,monospace;">${e.date||"—"}</div>
      </div>

      <!-- Payment Method -->
      <div style="text-align:center;">
        <div style="font-size:11px;color:#7c2d12;font-weight:800;letter-spacing:0.05em;margin-bottom:4px;">طريقة الدفع / الحساب</div>
        <div style="font-size:15px;font-weight:900;color:#c2410c;">${d[e.method]||e.method}</div>
        <div style="font-size:12.5px;color:#475569;font-weight:700;margin-top:2px;">${e.sourceName||"الصندوق الرئيسي"}</div>
      </div>

    </div>

    <!-- ═══ AMOUNT BOX (المبلغ) ═══ -->
    <div style="padding:24px 36px 18px;">
      <div style="background:linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);border:2px solid #ef4444;border-radius:18px;padding:22px 30px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 3px 12px rgba(239,68,68,0.08);">
        
        <div>
          <div style="font-size:12px;color:#991b1b;font-weight:800;margin-bottom:6px;letter-spacing:0.04em;">📤 المبلغ المدفوع بالأرقام</div>
          <div style="font-size:40px;font-weight:900;color:#7f1d1d;font-family:'Courier New',Consolas,monospace;line-height:1;">${K(e.amount||0)}</div>
        </div>

        <div style="text-align:right;background:#ffffff;border:1.5px solid #fca5a5;border-radius:14px;padding:14px 22px;max-width:380px;box-shadow:0 2px 6px rgba(0,0,0,0.03);">
          <div style="font-size:11px;color:#991b1b;font-weight:800;margin-bottom:4px;">المبلغ كتابةً (تفقيط)</div>
          <div style="font-size:15px;color:#7f1d1d;font-weight:900;line-height:1.5;">فقط ${l} لا غير</div>
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
              <span style="background:#fee2e2;color:#991b1b;padding:5px 14px;border-radius:20px;font-size:12.5px;font-weight:800;border:1px solid #fca5a5;">${a[e.entityType]||"مصروف"}</span>
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
      <div style="font-size:11px;color:#64748b;font-weight:700;">طُبع من نظام شركة نظم الإمداد الحديثة بتاريخ: ${new Date().toLocaleString("ar-SA")}</div>
      <div dir="ltr" style="display:inline-block;direction:ltr;font-size:11px;color:#334155;font-family:monospace;font-weight:800;">REF: ${s}</div>
    </div>

  </div>`}function he(e){if(!e||isNaN(e))return"صفر";const n=Math.floor(e),o=Math.round((e-n)*100),s=["","واحد","اثنان","ثلاثة","أربعة","خمسة","ستة","سبعة","ثمانية","تسعة","عشرة","أحد عشر","اثنا عشر","ثلاثة عشر","أربعة عشر","خمسة عشر","ستة عشر","سبعة عشر","ثمانية عشر","تسعة عشر"],a=["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"],d=["","مائة","مائتان","ثلاثمائة","أربعمائة","خمسمائة","ستمائة","سبعمائة","ثمانيمائة","تسعمائة"];function l(u){return u===0?"":u<20?s[u]:u<100?a[Math.floor(u/10)]+(u%10?" و"+s[u%10]:""):d[Math.floor(u/100)]+(u%100?" و"+l(u%100):"")}let x="";return n>=1e6&&(x+=l(Math.floor(n/1e6))+" مليون "),n>=1e3&&(x+=l(Math.floor(n%1e6/1e3))+" ألف "),x+=l(n%1e3),x=x.trim()+" ريال سعودي",o>0&&(x+=` و ${l(o)} هللة`),x}export{$e as render};
