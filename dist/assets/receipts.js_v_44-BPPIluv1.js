import{s as xt,t as Y,g as _,C as P,f as S,j as yt,l as x,a as l,d as g,k as tt,_ as ht,m as vt}from"./index-CF9GFeRJ.js";import{runTransaction as et,doc as f,collection as O,serverTimestamp as C,query as ot,where as K,getDocs as at,writeBatch as dt,getDoc as k}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import{recalculateCustomerBalance as rt,recalculateSupplierBalance as ct}from"./balance-sync-CUiyFg8g.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let G=[],h=[],U=[],F=[],nt=[],it=[],J=null;async function wt(){G=(await _(P.costCenters()).catch(()=>[])).sort((s,a)=>(s.code||"").localeCompare(a.code||""));const o=document.getElementById("rcpt-cc-sel");o&&(o.innerHTML='<option value="">بدون مركز تكلفة</option>'+G.map(s=>`<option value="${s.id}">${s.code} — ${s.name}</option>`).join(""));const e=document.getElementById("rcpt-cc-filter");e&&(e.innerHTML='<option value="">كل المراكز</option>'+G.map(s=>`<option value="${s.id}">${s.name}</option>`).join(""))}window.filterReceiptsByCard=t=>{const o=document.getElementById("rcpt-method-filter");o&&(o.value=t==="all"?"":t,V())};async function jt(t,o){t.innerHTML=`
    <!-- ═══ FILTER BAR ═══ -->
    <div class="filterbar" style="flex-wrap:wrap;gap:10px;align-items:flex-end;background:var(--bg-1);padding:14px 18px;border-radius:14px;border:1px solid var(--border-soft);margin-bottom:20px;box-shadow:var(--shadow-sm);">
      <div class="form-group" style="margin:0;flex:1;min-width:200px;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">🔍 بحث سريع بالسندات</label>
        <input type="text" id="rcpt-search" class="input" placeholder="اسم الجهة، رقم السند، البيان، الصندوق..." oninput="loadReceipts()" />
      </div>
      <div class="date-range-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">من تاريخ</label>
        <input type="date" id="rcpt-from" class="input" value="${xt()}" onchange="loadReceipts()" />
      </div>
      <div class="date-range-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">إلى تاريخ</label>
        <input type="date" id="rcpt-to" class="input" value="${Y()}" onchange="loadReceipts()" />
      </div>
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">نوع الجهة</label>
        <select id="rcpt-entity-type-filter" class="input" onchange="loadReceipts()">
          <option value="">كل الجهات</option>
          <option value="customer">عملاء</option>
          <option value="supplier">موردين</option>
          <option value="revenue">إيراد مباشر</option>
          <option value="other">حساب عام</option>
        </select>
      </div>
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">طريقة القبض</label>
        <select id="rcpt-method-filter" class="input" onchange="loadReceipts()">
          <option value="">كل الطرق</option>
          <option value="cash">💵 نقدي</option>
          <option value="bank">🏦 تحويل بنكي</option>
        </select>
      </div>
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">مركز التكلفة</label>
        <select id="rcpt-cc-filter" class="input" onchange="loadReceipts()">
          <option value="">كل المراكز</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="exportPagePDF('.data-dense','سندات_القبض')" title="تصدير PDF">📄 PDF</button>
        <button class="btn btn-secondary btn-sm" onclick="exportPageExcel('.data-dense','سندات_القبض')" title="تصدير Excel">📊 Excel</button>
        <button class="btn btn-secondary btn-sm" onclick="printAllReceiptVouchers()" title="طباعة جميع السندات المعروضة">🖨️ طباعة الكل</button>
        <button class="btn btn-secondary btn-sm" onclick="printBlankReceiptVoucher()" title="طباعة سند قبض فارغ للتعبئة اليدوية" style="background:rgba(245,158,11,0.1);border-color:rgba(245,158,11,0.4);color:#b45309;">📝 سند فارغ</button>
        <button class="btn btn-primary" onclick="openReceiptModal()">+ سند قبض جديد</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header" style="margin-bottom:16px;">
        <h1 class="page-title" style="font-size:22px;font-weight:900;">💳 سجل سندات القبض (Receipt Vouchers)</h1>
        <p class="page-subtitle" id="rcpt-count" style="color:var(--text-3);font-size:13px;">سجل سندات القبض النقدية والبنكية للعملاء والموردين والإيرادات</p>
      </div>

      <!-- ═══ RICH INTERACTIVE KPI CARDS ═══ -->
      <div class="grid-4 gap-16 mb-20" id="rcpt-kpi-grid">
        <div class="stats-card kpi-interactive" id="kpi-rcpt-card-all" onclick="filterReceiptsByCard('all')" style="cursor:pointer;background:linear-gradient(135deg, rgba(91,127,255,0.08), rgba(91,127,255,0.02));border:1.5px solid rgba(91,127,255,0.3);border-radius:16px;padding:18px;transition:all 0.2s ease;" title="انقر لتصفية كافة المقبوضات">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span class="stats-title" style="font-weight:800;color:var(--brand);">💰 إجمالي المقبوضات المعروضة</span>
            <span class="badge sm" id="kpi-badge-all" style="font-size:10px;background:var(--brand);color:#fff;">الكل 🎯</span>
          </div>
          <span class="stats-val text-brand" id="kpi-rcpt-total" style="font-size:22px;font-weight:900;">0.00 ر.س</span>
        </div>

        <div class="stats-card kpi-interactive" id="kpi-rcpt-card-cash" onclick="filterReceiptsByCard('cash')" style="cursor:pointer;background:linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02));border:1.5px solid rgba(16,185,129,0.3);border-radius:16px;padding:18px;transition:all 0.2s ease;" title="انقر لتصفية المقبوضات النقدية فقط">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span class="stats-title" style="font-weight:800;color:#059669;">💵 المقبوضات النقدية (صناديق)</span>
            <span class="badge sm" id="kpi-badge-cash" style="font-size:10px;background:rgba(16,185,129,0.15);color:#059669;">تصفية 🔍</span>
          </div>
          <span class="stats-val text-ok" id="kpi-rcpt-cash" style="font-size:22px;font-weight:900;">0.00 ر.س</span>
        </div>

        <div class="stats-card kpi-interactive" id="kpi-rcpt-card-bank" onclick="filterReceiptsByCard('bank')" style="cursor:pointer;background:linear-gradient(135deg, rgba(37,99,235,0.08), rgba(37,99,235,0.02));border:1.5px solid rgba(37,99,235,0.3);border-radius:16px;padding:18px;transition:all 0.2s ease;" title="انقر لتصفية المقبوضات البنكية فقط">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span class="stats-title" style="font-weight:800;color:#1d4ed8;">🏦 المقبوضات البنكية والتحويلات</span>
            <span class="badge sm" id="kpi-badge-bank" style="font-size:10px;background:rgba(37,99,235,0.15);color:#1d4ed8;">تصفية 🔍</span>
          </div>
          <span class="stats-val text-brand" id="kpi-rcpt-bank" style="font-size:22px;font-weight:900;color:#1d4ed8;">0.00 ر.س</span>
        </div>

        <div class="stats-card" style="background:linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02));border:1.5px solid rgba(245,158,11,0.3);border-radius:16px;padding:18px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span class="stats-title" style="font-weight:800;color:#d97706;">🔢 عدد السندات المحررة</span>
            <span class="badge sm" style="font-size:10px;background:rgba(245,158,11,0.15);color:#d97706;">عدد 📋</span>
          </div>
          <span class="stats-val text-warning" id="kpi-rcpt-count" style="font-size:22px;font-weight:900;">0 سند</span>
        </div>
      </div>

      <div class="card" style="border-radius:16px;box-shadow:var(--shadow-sm);overflow:hidden;">
        <div class="table-container">
          <table class="data-dense" style="margin:0;">
            <thead>
              <tr style="background:var(--bg-2);">
                <th style="width:100px;">التاريخ</th>
                <th style="width:110px;">رقم السند</th>
                <th>جهة القبض</th>
                <th style="width:100px;">نوع الجهة</th>
                <th>البيان والملاحظات</th>
                <th>طريقة القبض والصندوق</th>
                <th>مركز التكلفة</th>
                <th style="text-align:left;width:120px;">المبلغ</th>
                <th style="text-align:center;width:150px;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="rcpt-tbody">
              ${Array(6).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(9).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px;height:14px;margin:4px 0;"></div></td>`).join("")}
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
              <input type="date" id="rcpt-date" class="input" value="${Y()}" />
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
              <div style="display:flex;gap:6px;flex-direction:column;">
                <input type="text" id="rcpt-target-search" class="input" placeholder="🔍 ابحث بجزء من اسم الحساب أو الكود..." oninput="filterReceiptTargetEntity()" style="font-size:12.5px;padding:6px 12px;background:var(--bg-2);border-radius:8px;" />
                <select id="rcpt-target-entity" class="input">
                  <option value="">اختر...</option>
                </select>
              </div>
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
  `;const e=t.querySelector("#rcpt-from"),s=t.querySelector("#rcpt-to");e&&e.addEventListener("change",V),s&&s.addEventListener("change",V),await Promise.all([lt(),wt(),V()])}async function lt(){[h,U,F,nt,it]=await Promise.all([_(P.chartOfAccounts()),_(P.cashBoxes()),_(P.bankAccounts()),_(P.suppliers()),_(P.customers())]),onReceiptEntityTypeChange(),toggleReceiptPaySource()}let Q=[];function Z(t,o,e=""){if(!t)return;let s='<option value="">اختر...</option>';o&&o.length?s+=o.map(a=>`<option value="${a.id}">${a.text}</option>`).join(""):s=`<option value="">🔍 لا يوجد حساب يطابق "${e}"</option>`,t.innerHTML=s}window.onReceiptEntityTypeChange=()=>{const t=document.getElementById("rcpt-entity-type").value,o=document.getElementById("rcpt-entity-label"),e=document.getElementById("rcpt-target-entity"),s=document.getElementById("rcpt-target-search");s&&(s.value="");let a=[];t==="customer"?(o.textContent="العميل المستهدف *",a=it.map(i=>({id:i.id,text:i.name}))):t==="supplier"?(o.textContent="المورد المستهدف *",a=nt.map(i=>({id:i.id,text:i.name}))):t==="revenue"?(o.textContent="بند الإيراد (الحساب) *",a=h.filter(i=>i.type==="revenue").map(i=>({id:i.id,text:`${i.code} - ${i.name}`}))):(o.textContent="الحساب الدائن (دليل الحسابات) *",a=h.map(i=>({id:i.id,text:`${i.code} - ${i.name}`}))),Q=a,Z(e,a)};window.filterReceiptTargetEntity=()=>{const t=(document.getElementById("rcpt-target-search")?.value||"").trim().toLowerCase(),o=document.getElementById("rcpt-target-entity");if(!t){Z(o,Q);return}const e=Q.filter(s=>s.text.toLowerCase().includes(t));Z(o,e,t),e.length===1&&o&&(o.value=e[0].id)};window.toggleReceiptPaySource=()=>{const t=document.getElementById("rcpt-pay-method")?.value||"cash",o=document.getElementById("rcpt-source-label"),e=document.getElementById("rcpt-source");if(e)if(e.innerHTML='<option value="">اختر...</option>',t==="cash"){o&&(o.textContent="صندوق الاستلام *");let s=U&&U.length>0?U:[];s.length===0&&h&&h.length>0&&(s=h.filter(a=>a.code?.startsWith("1-1-1-1")||a.code?.startsWith("1-1-1-2")||a.name?.includes("صندوق")||a.code==="1-1-1-1-3")),e.innerHTML+=s.map(a=>`<option value="${a.id}">${a.name||a.accountName||a.code}</option>`).join("")}else{o&&(o.textContent="الحساب البنكي المودع به *");let s=F&&F.length>0?F:[];s.length===0&&h&&h.length>0&&(s=h.filter(a=>a.code?.startsWith("1-1-1-3")||a.name?.includes("بنك")||a.name?.includes("الراجح")||a.name?.includes("الجزير"))),e.innerHTML+=s.map(a=>{const i=a.name||a.bankName||a.accountName||"حساب بنكي",d=a.accountNumber?` (${a.accountNumber})`:a.accountCode?` [${a.accountCode}]`:"";return`<option value="${a.id}">${i}${d}</option>`}).join("")}};window.openReceiptModal=async(t=null)=>{(!U.length||!F.length||!h.length)&&await lt(),J=t?t.id:null;const o=document.getElementById("rcpt-modal-title"),e=document.getElementById("rcpt-file-group");t?(o.textContent=`تعديل سند القبض — #${t.id.substring(0,6).toUpperCase()}`,e&&(e.style.display="none")):(o.textContent="سند قبض جديد (Receipt Voucher)",e&&(e.style.display="")),document.getElementById("rcpt-date").value=t?.date||Y(),document.getElementById("rcpt-amount").value=t?.amount||"",document.getElementById("rcpt-notes").value=t?.notes||"";const s=document.getElementById("rcpt-entity-type");s.value=t?.entityType||"customer",onReceiptEntityTypeChange();const a=document.getElementById("rcpt-target-entity");t?.targetId&&(a.value=t.targetId);const i=document.getElementById("rcpt-pay-method");i.value=t?.method||"cash",toggleReceiptPaySource();const d=document.getElementById("rcpt-source");t?.sourceId&&(d.value=t.sourceId);const c=document.getElementById("rcpt-cc-sel");c&&t?.costCenterId&&(c.value=t.costCenterId),document.getElementById("rcpt-error").classList.add("hidden"),openModal("receipt-modal")};window.saveReceipt=async()=>{const t=document.getElementById("rcpt-error");t.classList.add("hidden");const o=document.getElementById("rcpt-date").value,e=parseFloat(document.getElementById("rcpt-amount").value),s=document.getElementById("rcpt-entity-type").value,a=document.getElementById("rcpt-target-entity").value,i=document.getElementById("rcpt-pay-method").value,d=document.getElementById("rcpt-source").value,c=document.getElementById("rcpt-notes").value.trim(),r=document.getElementById("rcpt-cc-sel")?.value||null;if(!o||!e||e<=0||!a||!d||!c){t.textContent="الرجاء تعبئة جميع الحقول المطلوبة وكتابة بيان صحيح",t.classList.remove("hidden");return}const p=document.getElementById("save-rcpt-btn");p.disabled=!0,p.textContent=J?"جاري التعديل...":"جاري الحفظ...";try{if(await yt(o)){t.textContent=`⚠️ لا يمكن الحفظ لأن تاريخ (${o}) يقع في فترة محاسبية مغلقة.`,t.classList.remove("hidden");return}const{creditAccId:b,creditAccCode:u,creditAccName:$,destinationName:m}=Et(s,a),{debitAccId:w,debitAccCode:N,debitAccName:B,sourceDocRef:R}=It(i,d),z=i==="cash"?U.find(v=>v.id===d)?.name:F.find(v=>v.id===d)?.name,M=G.find(v=>v.id===r)?.name||null;if(J)await Ct({id:J,date:o,amount:e,entityType:s,targetId:a,accountName:m||"إيراد",method:i,sourceId:d,sourceName:z,notes:c,ccId:r,ccName:M,debitAccId:w,debitAccCode:N,debitAccName:B,creditAccId:b,creditAccCode:u,creditAccName:$,sourceDocRef:R}),showToast("تم تعديل سند القبض وتحديث القيود","success");else{await kt({date:o,amount:e,entityType:s,targetId:a,accountName:m||"إيراد",method:i,sourceId:d,sourceName:z,notes:c,ccId:r,ccName:M,debitAccId:w,debitAccCode:N,debitAccName:B,creditAccId:b,creditAccCode:u,creditAccName:$,sourceDocRef:R});const v=document.getElementById("rcpt-file-upload");v?.files?.length>0&&window.uploadFileToArchive(v.files[0],"bank_transfers","new",`مرفق سند قبض — ${c}`).catch(D=>console.warn(D)),showToast("تم حفظ سند القبض واعتماده","success")}s==="customer"?await rt(a).catch(()=>{}):s==="supplier"&&await ct(a).catch(()=>{}),x(`companies/${l}/receipts`),x(`companies/${l}/cashBoxes`),x(`companies/${l}/cashTransactions`),x(`companies/${l}/bankAccounts`),x(`companies/${l}/bankTransactions`),x(`companies/${l}/chartOfAccounts`),x(`companies/${l}/journalEntries`),x(`companies/${l}/customers`),x(`companies/${l}/suppliers`),closeModal("receipt-modal"),await V()}catch(b){t.textContent=b.message,t.classList.remove("hidden")}finally{p.disabled=!1,p.textContent="حفظ واعتماد"}};async function kt(t){let o="";if(await et(g,async e=>{let s=0;if(t.sourceDocRef){const p=await e.get(t.sourceDocRef);p.exists()&&(s=parseFloat(p.data().balance||0))}const a=s+t.amount,i=f(O(g,`companies/${l}/receipts`));o=i.id,e.set(i,{date:t.date,amount:t.amount,entityType:t.entityType,targetId:t.targetId,accountName:t.accountName,method:t.method,sourceId:t.sourceId,sourceName:t.sourceName,notes:t.notes,costCenterId:t.ccId,costCenterName:t.ccName,createdAt:C(),updatedAt:C()}),t.sourceDocRef&&e.update(t.sourceDocRef,{balance:a,updatedAt:C()});const d=t.method==="cash"?`companies/${l}/cashTransactions`:`companies/${l}/bankTransactions`,c=f(O(g,d)),r=t.method==="cash"?{cashBoxId:t.sourceId,type:"in",amount:t.amount,balanceAfter:a,sourceType:"receipt",sourceId:o,date:t.date,notes:`سند قبض — ${t.notes}`,userName:"النظام",createdAt:C()}:{bankAccountId:t.sourceId,type:"in",amount:t.amount,balanceAfter:a,sourceType:"receipt",sourceId:o,date:t.date,refNumber:`RV-${o.substring(0,6).toUpperCase()}`,notes:`سند قبض — ${t.notes}`,userName:"النظام",createdAt:C()};e.set(c,r)}),await tt({date:t.date,description:`سند قبض رقم #${o.substring(0,6).toUpperCase()} - ${t.notes}`,sourceType:"receipt",sourceId:o,lines:[{accountId:t.debitAccId,accountCode:t.debitAccCode,accountName:t.debitAccName,debit:t.amount,credit:0,note:t.notes,costCenterId:t.ccId},{accountId:t.creditAccId,accountCode:t.creditAccCode,accountName:t.creditAccName,debit:0,credit:t.amount,note:"تحصيل سند قبض",costCenterId:t.ccId}]}),t.entityType==="customer"&&t.targetId)try{await $t(t.targetId,t.amount,o,t.date,t.notes)}catch(e){console.warn("[BrokerCommission] Auto release on receipt failed:",e)}return o}async function $t(t,o,e,s,a){try{const i=O(g,`companies/${l}/salesInvoices`),d=ot(i,K("customerId","==",t),K("hasBrokerCommission","==",!0)),c=await at(d);if(c.empty)return;let r=parseFloat(o)||0;for(const p of c.docs){if(r<=0)break;const b=p.data();if(b.brokerCommissionStatus==="earned"&&(b.brokerCommissionEarned||0)>=(b.brokerCommissionTotal||0))continue;const u=parseFloat(b.totalWithVat||0),$=parseFloat(b.brokerCommissionEarned||0),m=parseFloat(b.brokerRate)||1,w=parseFloat(b.brokerCommissionTotal)||Math.round(parseFloat(b.subtotal||0)*(m/100)*100)/100,N=Math.max(0,w-$);if(N<=.01)continue;const B=parseFloat(b.paidAmount||0),R=Math.max(0,u-B),z=Math.min(r,R>0?R:u),M=u>0?Math.min(1,z/u):1,v=Math.min(N,Math.round(w*M*100)/100);if(v>.01){r-=z;const D=b.brokerAccountCode||"2-1-4-2",H=b.brokerExpenseCode||"5-4-10",I=b.brokerName||"زياد",T=b.number||p.id,X=[{accountCode:H,accountName:"مصروفات عمولات وسيط",debit:v,credit:0,note:`استحقاق عمولة الوسيط (${I}) لسداد فاتورة ${T}`},{accountCode:D,accountName:`مستحقات عمولات الوسطاء - ${I}`,debit:0,credit:v,note:`استحقاق عمولة الوسيط (${I}) لسداد فاتورة ${T}`}],q=await tt({date:s||Y(),sourceType:"broker_commission",sourceId:p.id,description:`قيد آلي: استحقاق عمولة الوسيط ${I} (${v} ر.س) لتحصيل فاتورة ${T} بموجب سند قبض #${e.substring(0,6).toUpperCase()}`,lines:X}),n=Math.round(($+v)*100)/100,y=n>=w-.05?"earned":"partial_earned",E=dt(g);E.update(f(g,`companies/${l}/salesInvoices`,p.id),{brokerCommissionEarned:n,brokerCommissionStatus:y,lastBrokerJeId:q||"",updatedAt:C()}),await E.commit(),console.log(`[BrokerCommission] Auto-released ${v} SAR for broker ${I} on invoice ${T}. JE: ${q}`),window.showToast&&window.showToast(`✅ تم إثبات استحقاق عمولة الوسيط (${I}: ${S(v)}) بقيد آلي فور تحصيل الفاتورة`,"success",5e3)}}}catch(i){console.error("[BrokerCommission] Release error:",i)}}async function Ct(t){const o=await k(f(g,`companies/${l}/receipts`,t.id));if(!o.exists())throw new Error("سند القبض غير موجود");const e={id:t.id,...o.data()},s=e.method==="cash"?"cashBoxes":"bankAccounts",a=f(g,`companies/${l}/${s}`,e.sourceId),i=t.method==="cash"?"cashBoxes":"bankAccounts",d=f(g,`companies/${l}/${i}`,t.sourceId);let c=0;await et(g,async u=>{const $=await u.get(a),m=parseFloat($.data()?.balance||0);let w;if(e.sourceId===t.sourceId)w=m-e.amount+t.amount,u.update(a,{balance:w,updatedAt:C()}),c=w;else{const N=await u.get(d),B=parseFloat(N.data()?.balance||0);u.update(a,{balance:m-e.amount,updatedAt:C()}),w=B+t.amount,u.update(d,{balance:w,updatedAt:C()}),c=w}u.update(f(g,`companies/${l}/receipts`,t.id),{date:t.date,amount:t.amount,entityType:t.entityType,targetId:t.targetId,accountName:t.accountName,method:t.method,sourceId:t.sourceId,sourceName:t.sourceName,notes:t.notes,costCenterId:t.ccId,costCenterName:t.ccName,updatedAt:C()})}),await mt(t.id),await ut(t.id,e.method),await tt({date:t.date,description:`سند قبض رقم #${t.id.substring(0,6).toUpperCase()} - ${t.notes}`,sourceType:"receipt",sourceId:t.id,lines:[{accountId:t.debitAccId,accountCode:t.debitAccCode,accountName:t.debitAccName,debit:t.amount,credit:0,note:t.notes,costCenterId:t.ccId},{accountId:t.creditAccId,accountCode:t.creditAccCode,accountName:t.creditAccName,debit:0,credit:t.amount,note:"تحصيل سند قبض",costCenterId:t.ccId}]});const r=t.method==="cash"?`companies/${l}/cashTransactions`:`companies/${l}/bankTransactions`;f(O(g,r));const p=t.method==="cash"?{cashBoxId:t.sourceId,type:"in",amount:t.amount,balanceAfter:c,sourceType:"receipt",sourceId:t.id,date:t.date,notes:`سند قبض — ${t.notes}`,userName:"النظام",createdAt:C()}:{bankAccountId:t.sourceId,type:"in",amount:t.amount,balanceAfter:c,sourceType:"receipt",sourceId:t.id,date:t.date,refNumber:`RV-${t.id.substring(0,6).toUpperCase()}`,notes:`سند قبض — ${t.notes}`,userName:"النظام",createdAt:C()},{addDoc:b}=await ht(async()=>{const{addDoc:u}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{addDoc:u}},[]);await b(O(g,r),p),x(`companies/${l}/cashBoxes`),x(`companies/${l}/cashTransactions`),x(`companies/${l}/bankAccounts`),x(`companies/${l}/bankTransactions`),x(`companies/${l}/chartOfAccounts`),x(`companies/${l}/journalEntries`)}let L=null;window.confirmDeleteReceiptModal=async t=>{L=t;const o=await k(f(g,`companies/${l}/receipts`,t));if(!o.exists()){showToast("السند غير موجود","error");return}const e=o.data();document.getElementById("rcpt-delete-info").innerHTML=`
    <div>📅 التاريخ: <strong>${e.date}</strong></div>
    <div>🔢 رقم السند: <strong>${t.substring(0,6).toUpperCase()}</strong></div>
    <div>👤 الجهة: <strong>${e.accountName}</strong></div>
    <div>💰 المبلغ: <strong>${S(e.amount)}</strong></div>
    <div>📝 البيان: <strong>${e.notes}</strong></div>
  `,openModal("rcpt-delete-modal")};window.confirmDeleteReceipt=async()=>{if(!L)return;const t=document.getElementById("rcpt-confirm-delete-btn");t.disabled=!0,t.textContent="جاري الحذف...";try{const o=await k(f(g,`companies/${l}/receipts`,L));if(!o.exists())throw new Error("السند غير موجود");const e=o.data(),s=e.method==="cash"?"cashBoxes":"bankAccounts",a=f(g,`companies/${l}/${s}`,e.sourceId);await et(g,async i=>{const d=await i.get(a);if(d.exists()){const c=parseFloat(d.data().balance||0);i.update(a,{balance:Math.max(0,c-e.amount),updatedAt:C()})}i.delete(f(g,`companies/${l}/receipts`,L))}),await mt(L),await ut(L,e.method),e.entityType==="customer"?await rt(e.targetId).catch(()=>{}):e.entityType==="supplier"&&await ct(e.targetId).catch(()=>{}),x(`companies/${l}/receipts`),x(`companies/${l}/cashBoxes`),x(`companies/${l}/cashTransactions`),x(`companies/${l}/bankAccounts`),x(`companies/${l}/bankTransactions`),x(`companies/${l}/journalEntries`),x(`companies/${l}/chartOfAccounts`),x(`companies/${l}/customers`),x(`companies/${l}/suppliers`),showToast("تم حذف السند وجميع القيود والحركات المرتبطة به","success"),closeModal("rcpt-delete-modal"),await V()}catch(o){showToast("خطأ: "+o.message,"error")}finally{t.disabled=!1,t.textContent="🗑️ حذف نهائياً",L=null}};function pt(t,o,e){if(t&&t.displayCode)return t.displayCode;if(t&&(t.number||t.seqNo)){const i=t.number||t.seqNo;return`${e}-${String(i).padStart(5,"0")}`}if(typeof A<"u"&&A.length){const i=A.findIndex(d=>d.id===o);if(i!==-1)return`${e}-${String(i+101).padStart(5,"0")}`}let s=0;for(let i=0;i<o.length;i++)s=(s<<5)-s+o.charCodeAt(i),s|=0;const a=Math.abs(s%8999)+101;return`${e}-${String(a).padStart(5,"0")}`}window.previewReceipt=async t=>{let o=(typeof A<"u"?A:[]).find(a=>a.id===t);if(!o)try{const a=await k(f(g,`companies/${l}/receipts`,t));a.exists()&&(o={id:a.id,...a.data()})}catch{}if(!o){showToast("السند غير موجود","error");return}o.displayCode=pt(o,t,"RV");let e={};try{const[a,i]=await Promise.all([k(f(g,`companies/${l}/settings`,"company")),k(f(g,`companies/${l}/settings`,"logo"))]);if(a.exists())e=a.data();else{const d=await k(f(g,`companies/${l}`));d.exists()&&(e=d.data())}i.exists()&&i.data().dataUrl&&(e.logoUrl=i.data().dataUrl)}catch{}const s=document.getElementById("receipt-preview-body");s.setAttribute("data-receipt-id",t),s.innerHTML=st(o,t,e),openModal("receipt-preview-modal")};window.printReceiptVoucher=()=>{const o=document.getElementById("receipt-preview-body").innerHTML,e=window.open("","_blank","width=850,height=700");e.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>سند قبض</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4 portrait; margin: 8mm; }
    body { font-family:'Cairo',sans-serif; direction:rtl; color:#1a1a2e; background:#fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @media print {
      body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      .header-container { background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0369a1 100%) !important; }
    }
  </style>
</head>
<body>${o}</body>
</html>`),e.document.close(),setTimeout(()=>{e.focus(),e.print(),e.close()},600)};function st(t,o,e){const s=t.displayCode||pt(t,o,"RV"),a={customer:"عميل",supplier:"مورد",revenue:"إيراد مباشر",other:"حساب عام"},i={cash:"💵 نقدي",bank:"🏦 تحويل بنكي"},d=At(t.amount),c=e.name||e.companyName||"شركة نظم الإمداد المتطورة",r=[e.address,e.city,e.zip,e.country].filter(Boolean).join("، ")||"ينبع، المملكة العربية السعودية",p=e.phone||e.mobile||"0549141648";e.email;const b=e.vatNumber||e.vat||e.taxNumber||"314996148100003",u=e.crNumber||e.cr||"7054969006",$=e.logoUrl||e.logoBase64||e.logo||"";return`
  <div style="font-family:'Cairo',Arial,sans-serif;direction:rtl;max-width:850px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.1);border:1px solid #cbd5e1;">

    <!-- ═══ ELEGANT BRAND TOP HEADER ═══ -->
    <div class="header-container" style="background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0369a1 100%) !important;padding:26px 36px;position:relative;-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        
        <!-- Right: Company Logo + Name & Official Numbers -->
        <div style="display:flex;align-items:center;gap:20px;">
          ${$?`<img src="${$}" style="height:80px;width:80px;object-fit:contain;background:#ffffff;border-radius:14px;padding:6px;box-shadow:0 4px 12px rgba(0,0,0,0.25);" />`:'<div style="width:80px;height:80px;background:rgba(255,255,255,0.18);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:38px;color:#ffffff;">🏢</div>'}
          <div>
            <div style="font-size:25px;font-weight:900;color:#ffffff !important;line-height:1.2;letter-spacing:0.3px;margin-bottom:6px;text-shadow:0 1px 2px rgba(0,0,0,0.3);">${c}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.92) !important;margin-bottom:6px;font-weight:600;">📍 ${r}</div>
            
            <!-- Clean Inline Official Badges (No ugly dark boxes) -->
            <div style="display:flex;flex-wrap:wrap;gap:6px 10px;font-size:11.5px;color:rgba(255,255,255,0.95) !important;">
              ${b?`<span style="background:rgba(255,255,255,0.15) !important;padding:3px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">🔢 الرقم الضريبي: <span dir="ltr" style="font-family:monospace;">${b}</span></span>`:""}
              ${u?`<span style="background:rgba(255,255,255,0.15) !important;padding:3px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📋 السجل التجاري: <span dir="ltr" style="font-family:monospace;">${u}</span></span>`:""}
              ${p?`<span style="background:rgba(255,255,255,0.15) !important;padding:3px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📞 هاتف: <span dir="ltr" style="font-family:monospace;">${p}</span></span>`:""}
            </div>
          </div>
        </div>

        <!-- Left: Official Certificate Title Badge -->
        <div style="text-align:center;">
          <div style="background:rgba(255,255,255,0.15) !important;backdrop-filter:blur(10px);border:2px solid rgba(255,255,255,0.35) !important;border-radius:16px;padding:14px 28px;box-shadow:0 4px 15px rgba(0,0,0,0.15);-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;">
            <div style="font-size:28px;font-weight:900;color:#ffffff !important;letter-spacing:1.5px;line-height:1;">سـنـد قـبـض</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.88) !important;letter-spacing:3px;font-weight:800;margin-top:5px;text-transform:uppercase;">RECEIPT VOUCHER</div>
          </div>
        </div>

      </div>
      
      <!-- Gold Accent Divider Ribbon -->
      <div style="height:5px;background:linear-gradient(90deg, #b45309 0%, #f59e0b 50%, #b45309 100%) !important;-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;margin-top:18px;border-radius:3px;"></div>
    </div>

    <!-- ═══ VOUCHER SERIAL & META BAR ═══ -->
    <div style="background:#f8fafc;border-bottom:1.5px solid #e2e8f0;padding:18px 36px;display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:20px;align-items:center;">
      
      <!-- Voucher Number -->
      <div style="text-align:center;border-left:1.5px solid #cbd5e1;padding-left:12px;">
        <div style="font-size:11px;color:#64748b;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">رقم السند المتسلسل</div>
        <div dir="ltr" style="display:inline-block;direction:ltr;font-size:22px;font-weight:900;color:#1e3a8a;font-family:'Courier New',Consolas,monospace;background:#e0e7ff;padding:3px 14px;border-radius:8px;border:1px solid #c7d2fe;">${s}</div>
      </div>

      <!-- Voucher Date -->
      <div style="text-align:center;border-left:1.5px solid #cbd5e1;padding-left:12px;">
        <div style="font-size:11px;color:#64748b;font-weight:800;letter-spacing:0.05em;margin-bottom:4px;">تاريخ التحرير</div>
        <div style="font-size:18px;font-weight:900;color:#0f172a;font-family:'Courier New',Consolas,monospace;">${t.date}</div>
      </div>

      <!-- Payment/Receipt Method -->
      <div style="text-align:center;">
        <div style="font-size:11px;color:#64748b;font-weight:800;letter-spacing:0.05em;margin-bottom:4px;">طريقة القبض / الحساب</div>
        <div style="font-size:15px;font-weight:900;color:#047857;">${i[t.method]||t.method}</div>
        <div style="font-size:12.5px;color:#475569;font-weight:700;margin-top:2px;">${t.sourceName||"الصندوق الرئيسي"}</div>
      </div>

    </div>

    <!-- ═══ AMOUNT BOX (المبلغ) ═══ -->
    <div style="padding:24px 36px 18px;">
      <div style="background:linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);border:2px solid #059669;border-radius:18px;padding:22px 30px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 3px 12px rgba(5,150,105,0.08);">
        
        <div>
          <div style="font-size:12px;color:#065f46;font-weight:800;margin-bottom:6px;letter-spacing:0.04em;">💰 المبلغ المستلم بالأرقام</div>
          <div style="font-size:40px;font-weight:900;color:#064e3b;font-family:'Courier New',Consolas,monospace;line-height:1;">${S(t.amount)}</div>
        </div>

        <div style="text-align:right;background:#ffffff;border:1.5px solid #6ee7b7;border-radius:14px;padding:14px 22px;max-width:380px;box-shadow:0 2px 6px rgba(0,0,0,0.03);">
          <div style="font-size:11px;color:#047857;font-weight:800;margin-bottom:4px;">المبلغ كتابةً (تفقيط)</div>
          <div style="font-size:15px;color:#064e3b;font-weight:900;line-height:1.5;">فقط ${d} لا غير</div>
        </div>

      </div>
    </div>

    <!-- ═══ DETAILS GRID & STATEMENT ═══ -->
    <div style="padding:0 36px 24px;">
      <table style="width:100%;border-collapse:separate;border-spacing:0;border:1.5px solid #cbd5e1;border-radius:14px;overflow:hidden;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:13px 18px;font-size:12.5px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;text-align:right;">استلمنا من (جهة القبض / الحساب الدائن)</th>
            <th style="padding:13px 18px;font-size:12.5px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;border-right:1.5px solid #cbd5e1;text-align:right;width:140px;">نوع الجهة</th>
            <th style="padding:13px 18px;font-size:12.5px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;border-right:1.5px solid #cbd5e1;text-align:right;width:200px;">مركز التكلفة</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:16px 18px;font-size:16px;font-weight:900;color:#1e3a8a;">${t.accountName}</td>
            <td style="padding:16px 18px;border-right:1.5px solid #cbd5e1;">
              <span style="background:#dbeafe;color:#1e40af;padding:5px 14px;border-radius:20px;font-size:12.5px;font-weight:800;border:1px solid #93c5fd;">${a[t.entityType]||t.entityType}</span>
            </td>
            <td style="padding:16px 18px;font-size:13.5px;font-weight:700;color:#475569;border-right:1.5px solid #cbd5e1;">${t.costCenterName||"بدون مركز تكلفة"}</td>
          </tr>
        </tbody>
      </table>

      <!-- Statement / Notes Box -->
      <div style="margin-top:18px;background:#f8fafc;border:1.5px dashed #94a3b8;border-radius:14px;padding:18px 24px;">
        <div style="font-size:11.5px;color:#64748b;font-weight:800;margin-bottom:6px;text-transform:uppercase;">البيان / ملاحظات وسبب القبض</div>
        <div style="font-size:15px;color:#0f172a;font-weight:800;line-height:1.6;">${t.notes||"—"}</div>
      </div>
    </div>

    <!-- ═══ SIGNATURES ═══ -->
    <div style="border-top:1.5px solid #e2e8f0;padding:28px 36px 32px;background:#fafafa;">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:28px;">
        <div style="text-align:center;">
          <div style="font-size:12.5px;font-weight:800;color:#334155;margin-bottom:45px;">توقيع المستلم (الجهة الدائنة)</div>
          <div style="border-top:1.5px dashed #94a3b8;width:160px;margin:0 auto;color:#64748b;font-size:11px;padding-top:5px;">التوقيع / الإسم</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:12.5px;font-weight:800;color:#334155;margin-bottom:45px;">توقيع المحاسب / الأمين</div>
          <div style="border-top:1.5px dashed #94a3b8;width:160px;margin:0 auto;color:#64748b;font-size:11px;padding-top:5px;">التوقيع والختم الرسمى</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:12.5px;font-weight:800;color:#334155;margin-bottom:45px;">اعتماد المدير المالي</div>
          <div style="border-top:1.5px dashed #94a3b8;width:160px;margin:0 auto;color:#64748b;font-size:11px;padding-top:5px;">التوقيع والاعتماد</div>
        </div>
      </div>
    </div>

    <!-- ═══ FOOTER ═══ -->
    <div style="background:#f1f5f9;border-top:1.5px solid #cbd5e1;padding:14px 36px;display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:11px;color:#64748b;font-weight:700;">طُبع من نظام شركة نظم الإمداد المتطورة بتاريخ: ${new Date().toLocaleString("ar-SA")}</div>
      <div dir="ltr" style="display:inline-block;direction:ltr;font-size:11px;color:#334155;font-family:monospace;font-weight:800;">REF: ${s}</div>
    </div>

  </div>`}window.printSingleReceiptVoucher=async t=>{let o=(typeof A<"u"?A:[]).find(i=>i.id===t);if(!o)try{const i=await k(f(g,`companies/${l}/receipts`,t));i.exists()&&(o={id:i.id,...i.data()})}catch{}if(!o){showToast("السند غير موجود","error");return}let e={};try{const[i,d]=await Promise.all([k(f(g,`companies/${l}/settings`,"company")),k(f(g,`companies/${l}/settings`,"logo"))]);i.exists()&&(e=i.data()),d.exists()&&d.data().dataUrl&&(e.logoUrl=d.data().dataUrl)}catch{}const s=st(o,t,e),a=window.open("","_blank","width=850,height=700");a.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>سند قبض — ${o.displayCode||"RV-"+t.substring(0,6).toUpperCase()}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4 portrait; margin: 8mm; }
    body { font-family:'Cairo',sans-serif; direction:rtl; color:#1a1a2e; background:#fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @media print {
      body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      .header-container { background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0369a1 100%) !important; }
    }
  </style>
</head>
<body>${s}</body>
</html>`),a.document.close(),setTimeout(()=>{a.focus(),a.print(),a.close()},600)};window.printAllReceiptVouchers=async()=>{const t=typeof A<"u"?A:[];if(!t.length){showToast("لا توجد سندات قبض للطباعة في القائمة الحالية","warning");return}let o={};try{const[a,i]=await Promise.all([k(f(g,`companies/${l}/settings`,"company")),k(f(g,`companies/${l}/settings`,"logo"))]);a.exists()&&(o=a.data()),i.exists()&&i.data().dataUrl&&(o.logoUrl=i.data().dataUrl)}catch{}const e=t.map((a,i)=>`<div style="${i===t.length-1?"":"page-break-after:always;"}">${st(a,a.id,o)}</div>`).join(""),s=window.open("","_blank","width=900,height=700");s.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>طباعة جميع سندات القبض (${t.length} سند)</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4 portrait; margin: 8mm; }
    body { font-family:'Cairo',sans-serif; direction:rtl; color:#1a1a2e; background:#fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @media print {
      body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      .header-container { background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0369a1 100%) !important; }
    }
  </style>
</head>
<body>${e}</body>
</html>`),s.document.close(),setTimeout(()=>{s.focus(),s.print(),s.close()},800)};window.printBlankReceiptVoucher=async()=>{let t={};try{const[b,u]=await Promise.all([k(f(g,`companies/${l}/settings`,"company")),k(f(g,`companies/${l}/settings`,"logo"))]);b.exists()&&(t=b.data()),u.exists()&&u.data().dataUrl&&(t.logoUrl=u.data().dataUrl)}catch{}const o=t.name||t.companyName||"شركة نظم الإمداد المتطورة",e=[t.address,t.city,t.zip,t.country].filter(Boolean).join("، ")||"ينبع، المملكة العربية السعودية",s=t.phone||t.mobile||"",a=t.vatNumber||t.vat||t.taxNumber||"",i=t.crNumber||t.cr||"",d=t.logoUrl||t.logoBase64||t.logo||"",c=(b="48px")=>`<div style="border:1.5px dashed #94a3b8;border-radius:8px;height:${b};width:100%;"></div>`,r=`
  <div style="font-family:'Cairo',Arial,sans-serif;direction:rtl;max-width:820px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.08);border:1px solid #cbd5e1;">

    <!-- ═══ ROYAL HEADER ═══ -->
    <div class="header-container" style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#0369a1 100%) !important;padding:20px 30px;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="display:flex;align-items:center;gap:16px;">
          ${d?`<img src="${d}" style="height:70px;width:70px;object-fit:contain;background:#fff;border-radius:12px;padding:5px;box-shadow:0 3px 10px rgba(0,0,0,0.2);" />`:'<div style="width:70px;height:70px;background:rgba(255,255,255,0.15);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:32px;">🏢</div>'}
          <div>
            <div style="font-size:22px;font-weight:900;color:#fff !important;margin-bottom:5px;text-shadow:0 1px 2px rgba(0,0,0,0.3);">${o}</div>
            <div style="font-size:11.5px;color:rgba(255,255,255,0.9) !important;margin-bottom:5px;">📍 ${e}</div>
            <div style="display:flex;flex-wrap:wrap;gap:5px 8px;font-size:11px;color:rgba(255,255,255,0.95) !important;">
              ${a?`<span style="background:rgba(255,255,255,0.15) !important;padding:2px 9px;border-radius:7px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">🔢 الرقم الضريبي: <span dir="ltr">${a}</span></span>`:""}
              ${i?`<span style="background:rgba(255,255,255,0.15) !important;padding:2px 9px;border-radius:7px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📋 السجل التجاري: <span dir="ltr">${i}</span></span>`:""}
              ${s?`<span style="background:rgba(255,255,255,0.15) !important;padding:2px 9px;border-radius:7px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📞 <span dir="ltr">${s}</span></span>`:""}
            </div>
          </div>
        </div>
        <div style="text-align:center;">
          <div style="background:rgba(255,255,255,0.15) !important;border:2px solid rgba(255,255,255,0.4) !important;border-radius:14px;padding:12px 24px;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;">
            <div style="font-size:26px;font-weight:900;color:#fff !important;letter-spacing:1.5px;">سـنـد قـبـض</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.85) !important;letter-spacing:3px;font-weight:800;margin-top:4px;text-transform:uppercase;">RECEIPT VOUCHER</div>
          </div>
        </div>
      </div>
      <div style="height:4px;background:linear-gradient(90deg,#b45309 0%,#f59e0b 50%,#b45309 100%) !important;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;margin-top:14px;border-radius:3px;"></div>
    </div>

    <!-- ═══ META BAR (رقم السند + التاريخ + طريقة القبض) ═══ -->
    <div style="background:#f8fafc;border-bottom:1.5px solid #e2e8f0;padding:14px 30px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;align-items:center;">
      <div style="text-align:center;border-left:1.5px solid #cbd5e1;padding-left:10px;">
        <div style="font-size:10.5px;color:#64748b;font-weight:800;margin-bottom:6px;text-transform:uppercase;">رقم السند</div>
        <div style="background:#e0e7ff;border-radius:8px;border:1px solid #c7d2fe;padding:4px 10px;font-size:18px;font-weight:900;color:#1e3a8a;font-family:monospace;min-width:130px;min-height:32px;display:inline-block;"></div>
      </div>
      <div style="text-align:center;border-left:1.5px solid #cbd5e1;padding-left:10px;">
        <div style="font-size:10.5px;color:#64748b;font-weight:800;margin-bottom:6px;">التاريخ</div>
        <div style="font-size:14px;font-weight:900;color:#0f172a;"> &nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
        <div style="border-bottom:1.5px solid #94a3b8;width:140px;margin:4px auto 0;"></div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:10.5px;color:#64748b;font-weight:800;margin-bottom:6px;">طريقة القبض</div>
        <div style="display:flex;justify-content:center;gap:14px;font-size:13px;font-weight:800;color:#334155;">
          <label style="display:flex;align-items:center;gap:4px;cursor:pointer;"><span style="width:15px;height:15px;border:2px solid #64748b;border-radius:3px;display:inline-block;"></span> نقدي</label>
          <label style="display:flex;align-items:center;gap:4px;cursor:pointer;"><span style="width:15px;height:15px;border:2px solid #64748b;border-radius:3px;display:inline-block;"></span> تحويل بنكي</label>
        </div>
      </div>
    </div>

    <!-- ═══ AMOUNT BOX ═══ -->
    <div style="padding:18px 30px 14px;">
      <div style="background:linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%);border:2px solid #059669;border-radius:14px;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;gap:16px;">
        <div style="flex:0 0 auto;">
          <div style="font-size:11px;color:#065f46;font-weight:800;margin-bottom:6px;">💰 المبلغ بالأرقام (ر.س)</div>
          <div style="border-bottom:2px solid #059669;width:190px;height:38px;font-size:26px;font-weight:900;color:#064e3b;font-family:monospace;"></div>
        </div>
        <div style="flex:1;background:#fff;border:1.5px solid #6ee7b7;border-radius:10px;padding:12px 18px;">
          <div style="font-size:10.5px;color:#047857;font-weight:800;margin-bottom:8px;">المبلغ كتابةً (تفقيط)</div>
          <div style="font-size:13px;color:#064e3b;font-weight:700;">فقط ${c("24px")} لا غير</div>
        </div>
      </div>
    </div>

    <!-- ═══ DETAILS TABLE ═══ -->
    <div style="padding:0 30px 16px;">
      <table style="width:100%;border-collapse:separate;border-spacing:0;border:1.5px solid #cbd5e1;border-radius:12px;overflow:hidden;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:11px 16px;font-size:12px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;text-align:right;">استلمنا من (جهة القبض / الحساب الدائن)</th>
            <th style="padding:11px 16px;font-size:12px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;border-right:1.5px solid #cbd5e1;text-align:right;width:130px;">نوع الجهة</th>
            <th style="padding:11px 16px;font-size:12px;color:#334155;font-weight:800;border-bottom:1.5px solid #cbd5e1;border-right:1.5px solid #cbd5e1;text-align:right;width:180px;">مركز التكلفة</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:14px 16px;">${c("32px")}</td>
            <td style="padding:14px 16px;border-right:1.5px solid #cbd5e1;">
              <div style="display:flex;flex-direction:column;gap:6px;font-size:12px;font-weight:700;color:#334155;">
                <label style="display:flex;align-items:center;gap:5px;"><span style="width:13px;height:13px;border:1.5px solid #64748b;border-radius:50%;display:inline-block;"></span> عميل</label>
                <label style="display:flex;align-items:center;gap:5px;"><span style="width:13px;height:13px;border:1.5px solid #64748b;border-radius:50%;display:inline-block;"></span> مورد</label>
                <label style="display:flex;align-items:center;gap:5px;"><span style="width:13px;height:13px;border:1.5px solid #64748b;border-radius:50%;display:inline-block;"></span> إيراد مباشر</label>
              </div>
            </td>
            <td style="padding:14px 16px;border-right:1.5px solid #cbd5e1;">${c("32px")}</td>
          </tr>
        </tbody>
      </table>

      <!-- Notes -->
      <div style="margin-top:14px;background:#f8fafc;border:1.5px dashed #94a3b8;border-radius:12px;padding:14px 20px;">
        <div style="font-size:10.5px;color:#64748b;font-weight:800;margin-bottom:8px;">البيان / ملاحظات وسبب القبض</div>
        ${c("36px")}
      </div>
    </div>

    <!-- ═══ SIGNATURES ═══ -->
    <div style="border-top:1.5px solid #e2e8f0;padding:20px 30px 24px;background:#fafafa;">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;">
        <div style="text-align:center;">
          <div style="font-size:11.5px;font-weight:800;color:#334155;margin-bottom:50px;">توقيع المستلم (الجهة الدائنة)</div>
          <div style="border-top:1.5px dashed #94a3b8;width:160px;margin:0 auto;color:#64748b;font-size:10px;padding-top:5px;">التوقيع / الإسم</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11.5px;font-weight:800;color:#334155;margin-bottom:50px;">توقيع المحاسب / الأمين</div>
          <div style="border-top:1.5px dashed #94a3b8;width:160px;margin:0 auto;color:#64748b;font-size:10px;padding-top:5px;">التوقيع والختم الرسمى</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11.5px;font-weight:800;color:#334155;margin-bottom:50px;">اعتماد المدير المالي</div>
          <div style="border-top:1.5px dashed #94a3b8;width:160px;margin:0 auto;color:#64748b;font-size:10px;padding-top:5px;">التوقيع والاعتماد</div>
        </div>
      </div>
    </div>

    <!-- ═══ FOOTER ═══ -->
    <div style="background:#f1f5f9;border-top:1.5px solid #cbd5e1;padding:10px 30px;display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:10.5px;color:#64748b;font-weight:700;">نموذج سند قبض — ${o}</div>
      <div style="font-size:10.5px;color:#94a3b8;font-family:monospace;">BLANK RECEIPT VOUCHER TEMPLATE</div>
    </div>

  </div>`,p=window.open("","_blank","width=900,height=700");p.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>سند قبض فارغ — ${o}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4 portrait; margin: 8mm; }
    body { font-family:'Cairo',sans-serif; direction:rtl; color:#1a1a2e; background:#fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @media print {
      body { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      .header-container { background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0369a1 100%) !important; }
    }
  </style>
</head>
<body>${r}</body>
</html>`),p.document.close(),setTimeout(()=>{p.focus(),p.print(),p.close()},600)};let A=[];async function V(){const t=document.getElementById("rcpt-from"),o=document.getElementById("rcpt-to"),e=document.getElementById("rcpt-search"),s=document.getElementById("rcpt-entity-type-filter"),a=document.getElementById("rcpt-method-filter"),i=document.getElementById("rcpt-cc-filter"),d=document.getElementById("rcpt-tbody");if(!d)return;const c=t?.value||"",r=o?.value||"",p=(e?.value||"").trim().toLowerCase(),b=s?.value||"",u=a?.value||"",$=i?.value||"";try{let m=await _(P.receipts()).catch(()=>[]);m.sort((n,y)=>{const E=(n.date||"").localeCompare(y.date||"");if(E!==0)return E;const j=n.createdAt?.seconds||n.createdAt||0,W=y.createdAt?.seconds||y.createdAt||0;return j-W}),m.forEach((n,y)=>{!n.number&&!n.seqNo?n.displayCode=`RV-${String(y+101).padStart(5,"0")}`:n.displayCode=`RV-${String(n.number||n.seqNo).padStart(5,"0")}`}),m.sort((n,y)=>{const E=(y.date||"").localeCompare(n.date||"");if(E!==0)return E;const j=n.createdAt?.seconds||n.createdAt||0;return(y.createdAt?.seconds||y.createdAt||0)-j}),A=m,c&&(m=m.filter(n=>n.date&&n.date>=c)),r&&(m=m.filter(n=>n.date&&n.date<=r)),u==="cash"?m=m.filter(n=>n.method==="cash"||n.sourceName&&n.sourceName.includes("صندوق")):u==="bank"&&(m=m.filter(n=>n.method==="bank"||n.method==="transfer"||n.method==="bank_transfer"||n.method==="network"||n.method==="cheque"||n.sourceName&&(n.sourceName.includes("بنك")||n.sourceName.includes("مصرف")||n.sourceName.includes("الراجحى")||n.sourceName.includes("الاهلي")))),b&&(m=m.filter(n=>n.entityType===b)),$&&(m=m.filter(n=>n.costCenterId===$)),p&&(m=m.filter(n=>{const y=(n.id||"").toLowerCase(),E=(n.displayCode||"").toLowerCase(),j=y.substring(0,6),W=(n.accountName||"").toLowerCase(),gt=(n.notes||"").toLowerCase(),bt=(n.sourceName||"").toLowerCase(),ft=(n.costCenterName||"").toLowerCase();return y.includes(p)||E.includes(p)||j.includes(p)||W.includes(p)||gt.includes(p)||bt.includes(p)||ft.includes(p)}));const w=m.reduce((n,y)=>n+(y.amount||0),0),N=m.filter(n=>n.method==="cash"||n.sourceName&&n.sourceName.includes("صندوق")).reduce((n,y)=>n+(y.amount||0),0),B=m.filter(n=>n.method==="bank"||n.method==="transfer"||n.method==="bank_transfer"||n.sourceName&&(n.sourceName.includes("بنك")||n.sourceName.includes("مصرف")||n.sourceName.includes("الراجحى"))).reduce((n,y)=>n+(y.amount||0),0),R=document.getElementById("kpi-rcpt-total"),z=document.getElementById("kpi-rcpt-cash"),M=document.getElementById("kpi-rcpt-bank"),v=document.getElementById("kpi-rcpt-count"),D=document.getElementById("rcpt-count");R&&(R.textContent=S(w)),z&&(z.textContent=S(N)),M&&(M.textContent=S(B)),v&&(v.textContent=`${m.length} سند`),D&&(D.textContent=`مستندات القبض المفلترة: ${m.length} سند — إجمالي المقبوضات: ${S(w)}`);const H=document.getElementById("kpi-badge-all"),I=document.getElementById("kpi-badge-cash"),T=document.getElementById("kpi-badge-bank");if(H&&(H.style.background=u===""?"var(--brand)":"rgba(91,127,255,0.15)",H.textContent=u===""?"نشط 🎯":"الكل 🔍"),I&&(I.style.background=u==="cash"?"#059669":"rgba(16,185,129,0.15)",I.style.color=u==="cash"?"#fff":"#059669",I.textContent=u==="cash"?"نشط 🎯":"تصفية 🔍"),T&&(T.style.background=u==="bank"?"#1d4ed8":"rgba(37,99,235,0.15)",T.style.color=u==="bank"?"#fff":"#1d4ed8",T.textContent=u==="bank"?"نشط 🎯":"تصفية 🔍"),!m.length){d.innerHTML='<tr><td colspan="9" style="text-align:center;padding:36px;color:var(--text-3);font-weight:700;">🔍 لا توجد سندات قبض ضمن التصفية الفعالة حالياً</td></tr>';return}const X={customer:"عميل",supplier:"مورد",revenue:"إيراد مباشر",other:"حساب عام"},q={customer:"background:rgba(16,185,129,0.12);color:#059669;border:1px solid rgba(16,185,129,0.25);",supplier:"background:rgba(99,102,241,0.12);color:#4f46e5;border:1px solid rgba(99,102,241,0.25);",revenue:"background:rgba(37,99,235,0.12);color:#2563eb;border:1px solid rgba(37,99,235,0.25);",other:"background:rgba(107,114,128,0.12);color:#4b5563;border:1px solid rgba(107,114,128,0.25);"};d.innerHTML=m.map(n=>{const y=n.method==="bank"||n.method==="transfer"||n.method==="bank_transfer"||n.sourceName&&(n.sourceName.includes("بنك")||n.sourceName.includes("مصرف")||n.sourceName.includes("الراجحى")),E=y?"background:rgba(37,99,235,0.06);border-bottom:1px solid rgba(37,99,235,0.12);":"background:rgba(16,185,129,0.02);border-bottom:1px solid var(--border-soft);",j=y?`<span class="badge" style="background:#eff6ff;color:#1d4ed8;border:1.5px solid #93c5fd;font-weight:800;padding:4px 10px;border-radius:8px;box-shadow:0 1px 3px rgba(37,99,235,0.12);">🏦 تحويل بنكي — ${n.sourceName||"بنك"}</span>`:`<span class="badge" style="background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;font-weight:700;padding:4px 10px;border-radius:8px;">💵 نقدي — ${n.sourceName||"صندوق"}</span>`;return`
        <tr style="${E}transition:all 0.15s ease;">
          <td class="mono font-bold" style="font-size:12.5px;">${n.date}</td>
          <td class="mono" style="font-size:12px;"><span dir="ltr" style="display:inline-block;direction:ltr;background:var(--bg-2);padding:3px 10px;border-radius:6px;font-weight:900;color:var(--brand);font-family:monospace;">${n.displayCode}</span></td>
          <td><strong style="font-size:13.5px;color:var(--text-1);">${n.accountName}</strong></td>
          <td><span class="badge" style="${q[n.entityType]||q.other}font-size:11px;font-weight:700;">${X[n.entityType]||"عميل"}</span></td>
          <td><small style="color:var(--text-2);font-size:12px;font-weight:600;">${n.notes||"—"}</small></td>
          <td>${j}</td>
          <td>${n.costCenterName?`<span style="font-size:11px;background:rgba(91,127,255,0.1);padding:3px 10px;border-radius:12px;color:var(--brand);font-weight:700;">${n.costCenterName}</span>`:"—"}</td>
          <td style="text-align:left;" class="mono font-bold text-ok" style="font-size:14px;">${S(n.amount)}</td>
          <td style="text-align:center;white-space:nowrap;">
            <div style="display:flex;gap:4px;justify-content:center;">
              <button class="btn btn-icon sm btn-ghost text-brand" onclick="previewReceipt('${n.id}')" title="معاينة السند">👁️</button>
              <button class="btn btn-icon sm btn-ghost text-ok" onclick='openReceiptModal(${JSON.stringify({...n,id:n.id})})' title="تعديل السند">✏️</button>
              <button class="btn btn-icon sm btn-ghost text-warning" onclick="printSingleReceiptVoucher('${n.id}')" title="طباعة سند آلي">🖨️</button>
              <button class="btn btn-icon sm btn-ghost text-bad" onclick="confirmDeleteReceiptModal('${n.id}')" title="حذف نهائي">🗑️</button>
            </div>
          </td>
        </tr>
      `}).join("")}catch(m){console.error(m),d.innerHTML=`<tr><td colspan="9" class="text-bad" style="text-align:center;">خطأ في تحميل بيانات السندات: ${m.message}</td></tr>`}}window.loadReceipts=V;async function mt(t){const o=ot(O(g,`companies/${l}/journalEntries`),K("sourceId","==",t)),e=await at(o);if(!e.empty)for(const s of e.docs)await vt(s.id)}async function ut(t,o){const e=o==="cash"?`companies/${l}/cashTransactions`:`companies/${l}/bankTransactions`,s=ot(O(g,e),K("sourceId","==",t)),a=await at(s);if(a.empty)return;const i=dt(g);a.docs.forEach(d=>i.delete(d.ref)),await i.commit()}function Et(t,o){let e=null,s=null,a=null,i=null;if(t==="customer"){const d=it.find(r=>r.id===o);i=d?.name||null;const c=h.find(r=>r.sourceEntityId===o&&r.sourceModule==="customers")||h.find(r=>r.name&&d?.name&&r.name.includes(d.name))||h.find(r=>r.code==="1-1-2-1-1");e=c?.id||null,s=c?.code||null,a=c?.name||"ذمم العملاء"}else if(t==="supplier"){const d=nt.find(r=>r.id===o);i=d?.name||null;const c=h.find(r=>r.sourceEntityId===o&&r.sourceModule==="suppliers")||h.find(r=>r.name&&d?.name&&r.name.includes(d.name))||h.find(r=>r.code==="2-1-1-1-1");e=c?.id||null,s=c?.code||null,a=c?.name||"ذمم الموردين"}else{const d=h.find(c=>c.id===o);e=o||null,s=d?.code||null,a=d?.name||null,i=d?.name||null}return{creditAccId:e,creditAccCode:s,creditAccName:a,destinationName:i}}function It(t,o){let e=null,s=null,a=null,i=null;if(t==="cash"){const d=U.find(r=>r.id===o);e=d?.accountId||null;const c=h.find(r=>r.id===d?.accountId||d?.accountCode&&r.code===d.accountCode||r.id===o||r.code===o);e=e||c?.id||null,s=c?.code||d?.accountCode||d?.code||null,a=c?.name||d?.name||null,i=f(g,`companies/${l}/cashBoxes`,o)}else{const d=F.find(r=>r.id===o);e=d?.accountId||null;let c=h.find(r=>r.id===d?.accountId||d?.accountCode&&r.code===d.accountCode||r.id===o||r.code===o);if(!c&&d?.name){const r=d.name.replace(/[\s\-_]/g,"").toLowerCase();c=h.find(p=>p.parentCode==="1-1-1-3"&&(p.name?.replace(/[\s\-_]/g,"").toLowerCase().includes(r)||r.includes((p.name||"").replace(/[\s\-_]/g,"").toLowerCase())))}e=e||c?.id||null,s=c?.code||d?.accountCode||d?.code||null,a=c?.name||d?.name||null,i=f(g,`companies/${l}/bankAccounts`,o)}if(!e){const d=h.find(c=>c.code===(t==="cash"?"1-1-1-1-3":"1-1-1-3-02"))||t!=="cash"&&h.find(c=>c.code?.startsWith("1-1-1-3"))||h.find(c=>c.code==="1-1-1-1-3");e=d?.id||null,s=d?.code||null,a=d?.name||null}return{debitAccId:e,debitAccCode:s,debitAccName:a,sourceDocRef:i}}function At(t){if(!t||isNaN(t))return"صفر ريال سعودي";const o=Math.floor(t),e=Math.round((t-o)*100),s=["","واحد","اثنان","ثلاثة","أربعة","خمسة","ستة","سبعة","ثمانية","تسعة","عشرة","أحد عشر","اثنا عشر","ثلاثة عشر","أربعة عشر","خمسة عشر","ستة عشر","سبعة عشر","ثمانية عشر","تسعة عشر"],a=["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"],i=["","مائة","مئتان","ثلاثمائة","أربعمائة","خمسمائة","ستمائة","سبعمائة","ثمانمائة","تسعمائة"];function d(r){return r===0?"":r<20?s[r]:r<100?a[Math.floor(r/10)]+(r%10?" و"+s[r%10]:""):i[Math.floor(r/100)]+(r%100?" و"+d(r%100):"")}let c="";return o>=1e6&&(c+=d(Math.floor(o/1e6))+" مليون "),o>=1e3&&(c+=d(Math.floor(o%1e6/1e3))+" ألف "),c+=d(o%1e3),c=c.trim()+" ريال سعودي",e>0&&(c+=` و${d(e)} هللة`),c}export{jt as render};
