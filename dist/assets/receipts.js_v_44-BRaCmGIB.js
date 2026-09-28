import{s as ft,t as Y,g as B,a as T,f as R,i as xt,h as $,C as l,d as u,e as ot,_ as yt,j as ht}from"./index-DZSjEJ7g.js";import{runTransaction as X,doc as b,collection as _,serverTimestamp as w,getDoc as h,query as it,where as at,getDocs as nt,writeBatch as vt}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import{recalculateCustomerBalance as dt,recalculateSupplierBalance as st}from"./balance-sync-DYJH_MMr.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let q=[],f=[],z=[],S=[],Q=[],Z=[],G=null;async function wt(){q=(await B(T.costCenters()).catch(()=>[])).sort((n,i)=>(n.code||"").localeCompare(i.code||""));const o=document.getElementById("rcpt-cc-sel");o&&(o.innerHTML='<option value="">بدون مركز تكلفة</option>'+q.map(n=>`<option value="${n.id}">${n.code} — ${n.name}</option>`).join(""));const e=document.getElementById("rcpt-cc-filter");e&&(e.innerHTML='<option value="">كل المراكز</option>'+q.map(n=>`<option value="${n.id}">${n.name}</option>`).join(""))}window.filterReceiptsByCard=t=>{const o=document.getElementById("rcpt-method-filter");o&&(o.value=t==="all"?"":t,M())};async function Mt(t,o){t.innerHTML=`
    <!-- ═══ FILTER BAR ═══ -->
    <div class="filterbar" style="flex-wrap:wrap;gap:10px;align-items:flex-end;background:var(--bg-1);padding:14px 18px;border-radius:14px;border:1px solid var(--border-soft);margin-bottom:20px;box-shadow:var(--shadow-sm);">
      <div class="form-group" style="margin:0;flex:1;min-width:200px;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">🔍 بحث سريع بالسندات</label>
        <input type="text" id="rcpt-search" class="input" placeholder="اسم الجهة، رقم السند، البيان، الصندوق..." oninput="loadReceipts()" />
      </div>
      <div class="date-range-group" style="margin:0;">
        <label style="font-size:11px;font-weight:700;margin-bottom:4px;display:block;">من تاريخ</label>
        <input type="date" id="rcpt-from" class="input" value="${ft()}" onchange="loadReceipts()" />
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
  `;const e=t.querySelector("#rcpt-from"),n=t.querySelector("#rcpt-to");e&&e.addEventListener("change",M),n&&n.addEventListener("change",M),await Promise.all([rt(),wt(),M()])}async function rt(){[f,z,S,Q,Z]=await Promise.all([B(T.chartOfAccounts()),B(T.cashBoxes()),B(T.bankAccounts()),B(T.suppliers()),B(T.customers())]),onReceiptEntityTypeChange(),toggleReceiptPaySource()}let J=[];function K(t,o,e=""){if(!t)return;let n='<option value="">اختر...</option>';o&&o.length?n+=o.map(i=>`<option value="${i.id}">${i.text}</option>`).join(""):n=`<option value="">🔍 لا يوجد حساب يطابق "${e}"</option>`,t.innerHTML=n}window.onReceiptEntityTypeChange=()=>{const t=document.getElementById("rcpt-entity-type").value,o=document.getElementById("rcpt-entity-label"),e=document.getElementById("rcpt-target-entity"),n=document.getElementById("rcpt-target-search");n&&(n.value="");let i=[];t==="customer"?(o.textContent="العميل المستهدف *",i=Z.map(d=>({id:d.id,text:d.name}))):t==="supplier"?(o.textContent="المورد المستهدف *",i=Q.map(d=>({id:d.id,text:d.name}))):t==="revenue"?(o.textContent="بند الإيراد (الحساب) *",i=f.filter(d=>d.type==="revenue").map(d=>({id:d.id,text:`${d.code} - ${d.name}`}))):(o.textContent="الحساب الدائن (دليل الحسابات) *",i=f.map(d=>({id:d.id,text:`${d.code} - ${d.name}`}))),J=i,K(e,i)};window.filterReceiptTargetEntity=()=>{const t=(document.getElementById("rcpt-target-search")?.value||"").trim().toLowerCase(),o=document.getElementById("rcpt-target-entity");if(!t){K(o,J);return}const e=J.filter(n=>n.text.toLowerCase().includes(t));K(o,e,t),e.length===1&&o&&(o.value=e[0].id)};window.toggleReceiptPaySource=()=>{const t=document.getElementById("rcpt-pay-method")?.value||"cash",o=document.getElementById("rcpt-source-label"),e=document.getElementById("rcpt-source");if(e)if(e.innerHTML='<option value="">اختر...</option>',t==="cash"){o&&(o.textContent="صندوق الاستلام *");let n=z&&z.length>0?z:[];n.length===0&&f&&f.length>0&&(n=f.filter(i=>i.code?.startsWith("1-1-1-1")||i.code?.startsWith("1-1-1-2")||i.name?.includes("صندوق")||i.code==="1-1-1-1-3")),e.innerHTML+=n.map(i=>`<option value="${i.id}">${i.name||i.accountName||i.code}</option>`).join("")}else{o&&(o.textContent="الحساب البنكي المودع به *");let n=S&&S.length>0?S:[];n.length===0&&f&&f.length>0&&(n=f.filter(i=>i.code?.startsWith("1-1-1-3")||i.name?.includes("بنك")||i.name?.includes("الراجح")||i.name?.includes("الجزير"))),e.innerHTML+=n.map(i=>{const d=i.name||i.bankName||i.accountName||"حساب بنكي",s=i.accountNumber?` (${i.accountNumber})`:i.accountCode?` [${i.accountCode}]`:"";return`<option value="${i.id}">${d}${s}</option>`}).join("")}};window.openReceiptModal=async(t=null)=>{(!z.length||!S.length||!f.length)&&await rt(),G=t?t.id:null;const o=document.getElementById("rcpt-modal-title"),e=document.getElementById("rcpt-file-group");t?(o.textContent=`تعديل سند القبض — #${t.id.substring(0,6).toUpperCase()}`,e&&(e.style.display="none")):(o.textContent="سند قبض جديد (Receipt Voucher)",e&&(e.style.display="")),document.getElementById("rcpt-date").value=t?.date||Y(),document.getElementById("rcpt-amount").value=t?.amount||"",document.getElementById("rcpt-notes").value=t?.notes||"";const n=document.getElementById("rcpt-entity-type");n.value=t?.entityType||"customer",onReceiptEntityTypeChange();const i=document.getElementById("rcpt-target-entity");t?.targetId&&(i.value=t.targetId);const d=document.getElementById("rcpt-pay-method");d.value=t?.method||"cash",toggleReceiptPaySource();const s=document.getElementById("rcpt-source");t?.sourceId&&(s.value=t.sourceId);const c=document.getElementById("rcpt-cc-sel");c&&t?.costCenterId&&(c.value=t.costCenterId),document.getElementById("rcpt-error").classList.add("hidden"),openModal("receipt-modal")};window.saveReceipt=async()=>{const t=document.getElementById("rcpt-error");t.classList.add("hidden");const o=document.getElementById("rcpt-date").value,e=parseFloat(document.getElementById("rcpt-amount").value),n=document.getElementById("rcpt-entity-type").value,i=document.getElementById("rcpt-target-entity").value,d=document.getElementById("rcpt-pay-method").value,s=document.getElementById("rcpt-source").value,c=document.getElementById("rcpt-notes").value.trim(),r=document.getElementById("rcpt-cc-sel")?.value||null;if(!o||!e||e<=0||!i||!s||!c){t.textContent="الرجاء تعبئة جميع الحقول المطلوبة وكتابة بيان صحيح",t.classList.remove("hidden");return}const m=document.getElementById("save-rcpt-btn");m.disabled=!0,m.textContent=G?"جاري التعديل...":"جاري الحفظ...";try{if(await xt(o)){t.textContent=`⚠️ لا يمكن الحفظ لأن تاريخ (${o}) يقع في فترة محاسبية مغلقة.`,t.classList.remove("hidden");return}const{creditAccId:y,creditAccCode:g,creditAccName:C,destinationName:p}=$t(n,i),{debitAccId:v,debitAccCode:L,debitAccName:j,sourceDocRef:U}=Et(d,s),P=d==="cash"?z.find(k=>k.id===s)?.name:S.find(k=>k.id===s)?.name,V=q.find(k=>k.id===r)?.name||null;if(G)await Ct({id:G,date:o,amount:e,entityType:n,targetId:i,accountName:p||"إيراد",method:d,sourceId:s,sourceName:P,notes:c,ccId:r,ccName:V,debitAccId:v,debitAccCode:L,debitAccName:j,creditAccId:y,creditAccCode:g,creditAccName:C,sourceDocRef:U}),showToast("تم تعديل سند القبض وتحديث القيود","success");else{await kt({date:o,amount:e,entityType:n,targetId:i,accountName:p||"إيراد",method:d,sourceId:s,sourceName:P,notes:c,ccId:r,ccName:V,debitAccId:v,debitAccCode:L,debitAccName:j,creditAccId:y,creditAccCode:g,creditAccName:C,sourceDocRef:U});const k=document.getElementById("rcpt-file-upload");k?.files?.length>0&&window.uploadFileToArchive(k.files[0],"bank_transfers","new",`مرفق سند قبض — ${c}`).catch(D=>console.warn(D)),showToast("تم حفظ سند القبض واعتماده","success")}n==="customer"?await dt(i).catch(()=>{}):n==="supplier"&&await st(i).catch(()=>{}),$(`companies/${l}/receipts`),$(`companies/${l}/chartOfAccounts`),$(`companies/${l}/journalEntries`),$(`companies/${l}/customers`),$(`companies/${l}/suppliers`),closeModal("receipt-modal"),await M()}catch(y){t.textContent=y.message,t.classList.remove("hidden")}finally{m.disabled=!1,m.textContent="حفظ واعتماد"}};async function kt(t){let o="";return await X(u,async e=>{let n=0;if(t.sourceDocRef){const m=await e.get(t.sourceDocRef);m.exists()&&(n=parseFloat(m.data().balance||0))}const i=n+t.amount,d=b(_(u,`companies/${l}/receipts`));o=d.id,e.set(d,{date:t.date,amount:t.amount,entityType:t.entityType,targetId:t.targetId,accountName:t.accountName,method:t.method,sourceId:t.sourceId,sourceName:t.sourceName,notes:t.notes,costCenterId:t.ccId,costCenterName:t.ccName,createdAt:w(),updatedAt:w()}),t.sourceDocRef&&e.update(t.sourceDocRef,{balance:i,updatedAt:w()});const s=t.method==="cash"?`companies/${l}/cashTransactions`:`companies/${l}/bankTransactions`,c=b(_(u,s)),r=t.method==="cash"?{cashBoxId:t.sourceId,type:"in",amount:t.amount,balanceAfter:i,sourceType:"receipt",sourceId:o,date:t.date,notes:`سند قبض — ${t.notes}`,userName:"النظام",createdAt:w()}:{bankAccountId:t.sourceId,type:"in",amount:t.amount,balanceAfter:i,sourceType:"receipt",sourceId:o,date:t.date,refNumber:`RV-${o.substring(0,6).toUpperCase()}`,notes:`سند قبض — ${t.notes}`,userName:"النظام",createdAt:w()};e.set(c,r)}),await ot({date:t.date,description:`سند قبض رقم #${o.substring(0,6).toUpperCase()} - ${t.notes}`,sourceType:"receipt",sourceId:o,lines:[{accountId:t.debitAccId,accountCode:t.debitAccCode,accountName:t.debitAccName,debit:t.amount,credit:0,note:t.notes,costCenterId:t.ccId},{accountId:t.creditAccId,accountCode:t.creditAccCode,accountName:t.creditAccName,debit:0,credit:t.amount,note:"تحصيل سند قبض",costCenterId:t.ccId}]}),o}async function Ct(t){const o=await h(b(u,`companies/${l}/receipts`,t.id));if(!o.exists())throw new Error("سند القبض غير موجود");const e={id:t.id,...o.data()},n=e.method==="cash"?"cashBoxes":"bankAccounts",i=b(u,`companies/${l}/${n}`,e.sourceId),d=t.method==="cash"?"cashBoxes":"bankAccounts",s=b(u,`companies/${l}/${d}`,t.sourceId);let c=0;await X(u,async g=>{const C=await g.get(i),p=parseFloat(C.data()?.balance||0);let v;if(e.sourceId===t.sourceId)v=p-e.amount+t.amount,g.update(i,{balance:v,updatedAt:w()}),c=v;else{const L=await g.get(s),j=parseFloat(L.data()?.balance||0);g.update(i,{balance:p-e.amount,updatedAt:w()}),v=j+t.amount,g.update(s,{balance:v,updatedAt:w()}),c=v}g.update(b(u,`companies/${l}/receipts`,t.id),{date:t.date,amount:t.amount,entityType:t.entityType,targetId:t.targetId,accountName:t.accountName,method:t.method,sourceId:t.sourceId,sourceName:t.sourceName,notes:t.notes,costCenterId:t.ccId,costCenterName:t.ccName,updatedAt:w()})}),await lt(t.id),await pt(t.id,e.method),await ot({date:t.date,description:`سند قبض رقم #${t.id.substring(0,6).toUpperCase()} - ${t.notes}`,sourceType:"receipt",sourceId:t.id,lines:[{accountId:t.debitAccId,accountCode:t.debitAccCode,accountName:t.debitAccName,debit:t.amount,credit:0,note:t.notes,costCenterId:t.ccId},{accountId:t.creditAccId,accountCode:t.creditAccCode,accountName:t.creditAccName,debit:0,credit:t.amount,note:"تحصيل سند قبض",costCenterId:t.ccId}]});const r=t.method==="cash"?`companies/${l}/cashTransactions`:`companies/${l}/bankTransactions`;b(_(u,r));const m=t.method==="cash"?{cashBoxId:t.sourceId,type:"in",amount:t.amount,balanceAfter:c,sourceType:"receipt",sourceId:t.id,date:t.date,notes:`سند قبض — ${t.notes}`,userName:"النظام",createdAt:w()}:{bankAccountId:t.sourceId,type:"in",amount:t.amount,balanceAfter:c,sourceType:"receipt",sourceId:t.id,date:t.date,refNumber:`RV-${t.id.substring(0,6).toUpperCase()}`,notes:`سند قبض — ${t.notes}`,userName:"النظام",createdAt:w()},{addDoc:y}=await yt(async()=>{const{addDoc:g}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{addDoc:g}},[]);await y(_(u,r),m)}let A=null;window.confirmDeleteReceiptModal=async t=>{A=t;const o=await h(b(u,`companies/${l}/receipts`,t));if(!o.exists()){showToast("السند غير موجود","error");return}const e=o.data();document.getElementById("rcpt-delete-info").innerHTML=`
    <div>📅 التاريخ: <strong>${e.date}</strong></div>
    <div>🔢 رقم السند: <strong>${t.substring(0,6).toUpperCase()}</strong></div>
    <div>👤 الجهة: <strong>${e.accountName}</strong></div>
    <div>💰 المبلغ: <strong>${R(e.amount)}</strong></div>
    <div>📝 البيان: <strong>${e.notes}</strong></div>
  `,openModal("rcpt-delete-modal")};window.confirmDeleteReceipt=async()=>{if(!A)return;const t=document.getElementById("rcpt-confirm-delete-btn");t.disabled=!0,t.textContent="جاري الحذف...";try{const o=await h(b(u,`companies/${l}/receipts`,A));if(!o.exists())throw new Error("السند غير موجود");const e=o.data(),n=e.method==="cash"?"cashBoxes":"bankAccounts",i=b(u,`companies/${l}/${n}`,e.sourceId);await X(u,async d=>{const s=await d.get(i);if(s.exists()){const c=parseFloat(s.data().balance||0);d.update(i,{balance:Math.max(0,c-e.amount),updatedAt:w()})}d.delete(b(u,`companies/${l}/receipts`,A))}),await lt(A),await pt(A,e.method),e.entityType==="customer"?await dt(e.targetId).catch(()=>{}):e.entityType==="supplier"&&await st(e.targetId).catch(()=>{}),$(`companies/${l}/receipts`),$(`companies/${l}/journalEntries`),$(`companies/${l}/chartOfAccounts`),$(`companies/${l}/customers`),$(`companies/${l}/suppliers`),showToast("تم حذف السند وجميع القيود والحركات المرتبطة به","success"),closeModal("rcpt-delete-modal"),await M()}catch(o){showToast("خطأ: "+o.message,"error")}finally{t.disabled=!1,t.textContent="🗑️ حذف نهائياً",A=null}};function ct(t,o,e){if(t&&t.displayCode)return t.displayCode;if(t&&(t.number||t.seqNo)){const d=t.number||t.seqNo;return`${e}-${String(d).padStart(5,"0")}`}if(typeof E<"u"&&E.length){const d=E.findIndex(s=>s.id===o);if(d!==-1)return`${e}-${String(d+101).padStart(5,"0")}`}let n=0;for(let d=0;d<o.length;d++)n=(n<<5)-n+o.charCodeAt(d),n|=0;const i=Math.abs(n%8999)+101;return`${e}-${String(i).padStart(5,"0")}`}window.previewReceipt=async t=>{let o=(typeof E<"u"?E:[]).find(i=>i.id===t);if(!o)try{const i=await h(b(u,`companies/${l}/receipts`,t));i.exists()&&(o={id:i.id,...i.data()})}catch{}if(!o){showToast("السند غير موجود","error");return}o.displayCode=ct(o,t,"RV");let e={};try{const[i,d]=await Promise.all([h(b(u,`companies/${l}/settings`,"company")),h(b(u,`companies/${l}/settings`,"logo"))]);if(i.exists())e=i.data();else{const s=await h(b(u,`companies/${l}`));s.exists()&&(e=s.data())}d.exists()&&d.data().dataUrl&&(e.logoUrl=d.data().dataUrl)}catch{}const n=document.getElementById("receipt-preview-body");n.setAttribute("data-receipt-id",t),n.innerHTML=tt(o,t,e),openModal("receipt-preview-modal")};window.printReceiptVoucher=()=>{const o=document.getElementById("receipt-preview-body").innerHTML,e=window.open("","_blank","width=850,height=700");e.document.write(`<!DOCTYPE html>
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
</html>`),e.document.close(),setTimeout(()=>{e.focus(),e.print(),e.close()},600)};function tt(t,o,e){const n=t.displayCode||ct(t,o,"RV"),i={customer:"عميل",supplier:"مورد",revenue:"إيراد مباشر",other:"حساب عام"},d={cash:"💵 نقدي",bank:"🏦 تحويل بنكي"},s=It(t.amount),c=e.name||e.companyName||"شركة نظم الإمداد الحديثة",r=[e.address,e.city,e.zip,e.country].filter(Boolean).join("، ")||"ينبع، المملكة العربية السعودية",m=e.phone||e.mobile||"0549141648";e.email;const y=e.vatNumber||e.vat||e.taxNumber||"312448150500003",g=e.crNumber||e.cr||"4700123180",C=e.logoUrl||e.logoBase64||e.logo||"";return`
  <div style="font-family:'Cairo',Arial,sans-serif;direction:rtl;max-width:850px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.1);border:1px solid #cbd5e1;">

    <!-- ═══ ELEGANT BRAND TOP HEADER ═══ -->
    <div class="header-container" style="background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0369a1 100%) !important;padding:26px 36px;position:relative;-webkit-print-color-adjust: exact !important;print-color-adjust: exact !important;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        
        <!-- Right: Company Logo + Name & Official Numbers -->
        <div style="display:flex;align-items:center;gap:20px;">
          ${C?`<img src="${C}" style="height:80px;width:80px;object-fit:contain;background:#ffffff;border-radius:14px;padding:6px;box-shadow:0 4px 12px rgba(0,0,0,0.25);" />`:'<div style="width:80px;height:80px;background:rgba(255,255,255,0.18);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:38px;color:#ffffff;">🏢</div>'}
          <div>
            <div style="font-size:25px;font-weight:900;color:#ffffff !important;line-height:1.2;letter-spacing:0.3px;margin-bottom:6px;text-shadow:0 1px 2px rgba(0,0,0,0.3);">${c}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.92) !important;margin-bottom:6px;font-weight:600;">📍 ${r}</div>
            
            <!-- Clean Inline Official Badges (No ugly dark boxes) -->
            <div style="display:flex;flex-wrap:wrap;gap:6px 10px;font-size:11.5px;color:rgba(255,255,255,0.95) !important;">
              ${y?`<span style="background:rgba(255,255,255,0.15) !important;padding:3px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">🔢 الرقم الضريبي: <span dir="ltr" style="font-family:monospace;">${y}</span></span>`:""}
              ${g?`<span style="background:rgba(255,255,255,0.15) !important;padding:3px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📋 السجل التجاري: <span dir="ltr" style="font-family:monospace;">${g}</span></span>`:""}
              ${m?`<span style="background:rgba(255,255,255,0.15) !important;padding:3px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📞 هاتف: <span dir="ltr" style="font-family:monospace;">${m}</span></span>`:""}
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
        <div dir="ltr" style="display:inline-block;direction:ltr;font-size:22px;font-weight:900;color:#1e3a8a;font-family:'Courier New',Consolas,monospace;background:#e0e7ff;padding:3px 14px;border-radius:8px;border:1px solid #c7d2fe;">${n}</div>
      </div>

      <!-- Voucher Date -->
      <div style="text-align:center;border-left:1.5px solid #cbd5e1;padding-left:12px;">
        <div style="font-size:11px;color:#64748b;font-weight:800;letter-spacing:0.05em;margin-bottom:4px;">تاريخ التحرير</div>
        <div style="font-size:18px;font-weight:900;color:#0f172a;font-family:'Courier New',Consolas,monospace;">${t.date}</div>
      </div>

      <!-- Payment/Receipt Method -->
      <div style="text-align:center;">
        <div style="font-size:11px;color:#64748b;font-weight:800;letter-spacing:0.05em;margin-bottom:4px;">طريقة القبض / الحساب</div>
        <div style="font-size:15px;font-weight:900;color:#047857;">${d[t.method]||t.method}</div>
        <div style="font-size:12.5px;color:#475569;font-weight:700;margin-top:2px;">${t.sourceName||"الصندوق الرئيسي"}</div>
      </div>

    </div>

    <!-- ═══ AMOUNT BOX (المبلغ) ═══ -->
    <div style="padding:24px 36px 18px;">
      <div style="background:linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);border:2px solid #059669;border-radius:18px;padding:22px 30px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 3px 12px rgba(5,150,105,0.08);">
        
        <div>
          <div style="font-size:12px;color:#065f46;font-weight:800;margin-bottom:6px;letter-spacing:0.04em;">💰 المبلغ المستلم بالأرقام</div>
          <div style="font-size:40px;font-weight:900;color:#064e3b;font-family:'Courier New',Consolas,monospace;line-height:1;">${R(t.amount)}</div>
        </div>

        <div style="text-align:right;background:#ffffff;border:1.5px solid #6ee7b7;border-radius:14px;padding:14px 22px;max-width:380px;box-shadow:0 2px 6px rgba(0,0,0,0.03);">
          <div style="font-size:11px;color:#047857;font-weight:800;margin-bottom:4px;">المبلغ كتابةً (تفقيط)</div>
          <div style="font-size:15px;color:#064e3b;font-weight:900;line-height:1.5;">فقط ${s} لا غير</div>
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
              <span style="background:#dbeafe;color:#1e40af;padding:5px 14px;border-radius:20px;font-size:12.5px;font-weight:800;border:1px solid #93c5fd;">${i[t.entityType]||t.entityType}</span>
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
      <div style="font-size:11px;color:#64748b;font-weight:700;">طُبع من نظام شركة نظم الإمداد الحديثة بتاريخ: ${new Date().toLocaleString("ar-SA")}</div>
      <div dir="ltr" style="display:inline-block;direction:ltr;font-size:11px;color:#334155;font-family:monospace;font-weight:800;">REF: ${n}</div>
    </div>

  </div>`}window.printSingleReceiptVoucher=async t=>{let o=(typeof E<"u"?E:[]).find(d=>d.id===t);if(!o)try{const d=await h(b(u,`companies/${l}/receipts`,t));d.exists()&&(o={id:d.id,...d.data()})}catch{}if(!o){showToast("السند غير موجود","error");return}let e={};try{const[d,s]=await Promise.all([h(b(u,`companies/${l}/settings`,"company")),h(b(u,`companies/${l}/settings`,"logo"))]);d.exists()&&(e=d.data()),s.exists()&&s.data().dataUrl&&(e.logoUrl=s.data().dataUrl)}catch{}const n=tt(o,t,e),i=window.open("","_blank","width=850,height=700");i.document.write(`<!DOCTYPE html>
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
<body>${n}</body>
</html>`),i.document.close(),setTimeout(()=>{i.focus(),i.print(),i.close()},600)};window.printAllReceiptVouchers=async()=>{const t=typeof E<"u"?E:[];if(!t.length){showToast("لا توجد سندات قبض للطباعة في القائمة الحالية","warning");return}let o={};try{const[i,d]=await Promise.all([h(b(u,`companies/${l}/settings`,"company")),h(b(u,`companies/${l}/settings`,"logo"))]);i.exists()&&(o=i.data()),d.exists()&&d.data().dataUrl&&(o.logoUrl=d.data().dataUrl)}catch{}const e=t.map((i,d)=>`<div style="${d===t.length-1?"":"page-break-after:always;"}">${tt(i,i.id,o)}</div>`).join(""),n=window.open("","_blank","width=900,height=700");n.document.write(`<!DOCTYPE html>
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
</html>`),n.document.close(),setTimeout(()=>{n.focus(),n.print(),n.close()},800)};window.printBlankReceiptVoucher=async()=>{let t={};try{const[y,g]=await Promise.all([h(b(u,`companies/${l}/settings`,"company")),h(b(u,`companies/${l}/settings`,"logo"))]);y.exists()&&(t=y.data()),g.exists()&&g.data().dataUrl&&(t.logoUrl=g.data().dataUrl)}catch{}const o=t.name||t.companyName||"شركة نظم الإمداد الحديثة",e=[t.address,t.city,t.zip,t.country].filter(Boolean).join("، ")||"ينبع، المملكة العربية السعودية",n=t.phone||t.mobile||"",i=t.vatNumber||t.vat||t.taxNumber||"",d=t.crNumber||t.cr||"",s=t.logoUrl||t.logoBase64||t.logo||"",c=(y="48px")=>`<div style="border:1.5px dashed #94a3b8;border-radius:8px;height:${y};width:100%;"></div>`,r=`
  <div style="font-family:'Cairo',Arial,sans-serif;direction:rtl;max-width:820px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.08);border:1px solid #cbd5e1;">

    <!-- ═══ ROYAL HEADER ═══ -->
    <div class="header-container" style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#0369a1 100%) !important;padding:20px 30px;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="display:flex;align-items:center;gap:16px;">
          ${s?`<img src="${s}" style="height:70px;width:70px;object-fit:contain;background:#fff;border-radius:12px;padding:5px;box-shadow:0 3px 10px rgba(0,0,0,0.2);" />`:'<div style="width:70px;height:70px;background:rgba(255,255,255,0.15);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:32px;">🏢</div>'}
          <div>
            <div style="font-size:22px;font-weight:900;color:#fff !important;margin-bottom:5px;text-shadow:0 1px 2px rgba(0,0,0,0.3);">${o}</div>
            <div style="font-size:11.5px;color:rgba(255,255,255,0.9) !important;margin-bottom:5px;">📍 ${e}</div>
            <div style="display:flex;flex-wrap:wrap;gap:5px 8px;font-size:11px;color:rgba(255,255,255,0.95) !important;">
              ${i?`<span style="background:rgba(255,255,255,0.15) !important;padding:2px 9px;border-radius:7px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">🔢 الرقم الضريبي: <span dir="ltr">${i}</span></span>`:""}
              ${d?`<span style="background:rgba(255,255,255,0.15) !important;padding:2px 9px;border-radius:7px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📋 السجل التجاري: <span dir="ltr">${d}</span></span>`:""}
              ${n?`<span style="background:rgba(255,255,255,0.15) !important;padding:2px 9px;border-radius:7px;border:1px solid rgba(255,255,255,0.25);font-weight:700;">📞 <span dir="ltr">${n}</span></span>`:""}
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

  </div>`,m=window.open("","_blank","width=900,height=700");m.document.write(`<!DOCTYPE html>
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
</html>`),m.document.close(),setTimeout(()=>{m.focus(),m.print(),m.close()},600)};let E=[];async function M(){const t=document.getElementById("rcpt-from"),o=document.getElementById("rcpt-to"),e=document.getElementById("rcpt-search"),n=document.getElementById("rcpt-entity-type-filter"),i=document.getElementById("rcpt-method-filter"),d=document.getElementById("rcpt-cc-filter"),s=document.getElementById("rcpt-tbody");if(!s)return;const c=t?.value||"",r=o?.value||"",m=(e?.value||"").trim().toLowerCase(),y=n?.value||"",g=i?.value||"",C=d?.value||"";try{let p=await B(T.receipts()).catch(()=>[]);p.sort((a,x)=>{const I=(a.date||"").localeCompare(x.date||"");if(I!==0)return I;const N=a.createdAt?.seconds||a.createdAt||0,H=x.createdAt?.seconds||x.createdAt||0;return N-H}),p.forEach((a,x)=>{!a.number&&!a.seqNo?a.displayCode=`RV-${String(x+101).padStart(5,"0")}`:a.displayCode=`RV-${String(a.number||a.seqNo).padStart(5,"0")}`}),p.sort((a,x)=>{const I=(x.date||"").localeCompare(a.date||"");if(I!==0)return I;const N=a.createdAt?.seconds||a.createdAt||0;return(x.createdAt?.seconds||x.createdAt||0)-N}),E=p,c&&(p=p.filter(a=>a.date&&a.date>=c)),r&&(p=p.filter(a=>a.date&&a.date<=r)),g==="cash"?p=p.filter(a=>a.method==="cash"||a.sourceName&&a.sourceName.includes("صندوق")):g==="bank"&&(p=p.filter(a=>a.method==="bank"||a.method==="transfer"||a.method==="bank_transfer"||a.method==="network"||a.method==="cheque"||a.sourceName&&(a.sourceName.includes("بنك")||a.sourceName.includes("مصرف")||a.sourceName.includes("الراجحى")||a.sourceName.includes("الاهلي")))),y&&(p=p.filter(a=>a.entityType===y)),C&&(p=p.filter(a=>a.costCenterId===C)),m&&(p=p.filter(a=>{const x=(a.id||"").toLowerCase(),I=(a.displayCode||"").toLowerCase(),N=x.substring(0,6),H=(a.accountName||"").toLowerCase(),ut=(a.notes||"").toLowerCase(),gt=(a.sourceName||"").toLowerCase(),bt=(a.costCenterName||"").toLowerCase();return x.includes(m)||I.includes(m)||N.includes(m)||H.includes(m)||ut.includes(m)||gt.includes(m)||bt.includes(m)}));const v=p.reduce((a,x)=>a+(x.amount||0),0),L=p.filter(a=>a.method==="cash"||a.sourceName&&a.sourceName.includes("صندوق")).reduce((a,x)=>a+(x.amount||0),0),j=p.filter(a=>a.method==="bank"||a.method==="transfer"||a.method==="bank_transfer"||a.sourceName&&(a.sourceName.includes("بنك")||a.sourceName.includes("مصرف")||a.sourceName.includes("الراجحى"))).reduce((a,x)=>a+(x.amount||0),0),U=document.getElementById("kpi-rcpt-total"),P=document.getElementById("kpi-rcpt-cash"),V=document.getElementById("kpi-rcpt-bank"),k=document.getElementById("kpi-rcpt-count"),D=document.getElementById("rcpt-count");U&&(U.textContent=R(v)),P&&(P.textContent=R(L)),V&&(V.textContent=R(j)),k&&(k.textContent=`${p.length} سند`),D&&(D.textContent=`مستندات القبض المفلترة: ${p.length} سند — إجمالي المقبوضات: ${R(v)}`);const W=document.getElementById("kpi-badge-all"),F=document.getElementById("kpi-badge-cash"),O=document.getElementById("kpi-badge-bank");if(W&&(W.style.background=g===""?"var(--brand)":"rgba(91,127,255,0.15)",W.textContent=g===""?"نشط 🎯":"الكل 🔍"),F&&(F.style.background=g==="cash"?"#059669":"rgba(16,185,129,0.15)",F.style.color=g==="cash"?"#fff":"#059669",F.textContent=g==="cash"?"نشط 🎯":"تصفية 🔍"),O&&(O.style.background=g==="bank"?"#1d4ed8":"rgba(37,99,235,0.15)",O.style.color=g==="bank"?"#fff":"#1d4ed8",O.textContent=g==="bank"?"نشط 🎯":"تصفية 🔍"),!p.length){s.innerHTML='<tr><td colspan="9" style="text-align:center;padding:36px;color:var(--text-3);font-weight:700;">🔍 لا توجد سندات قبض ضمن التصفية الفعالة حالياً</td></tr>';return}const mt={customer:"عميل",supplier:"مورد",revenue:"إيراد مباشر",other:"حساب عام"},et={customer:"background:rgba(16,185,129,0.12);color:#059669;border:1px solid rgba(16,185,129,0.25);",supplier:"background:rgba(99,102,241,0.12);color:#4f46e5;border:1px solid rgba(99,102,241,0.25);",revenue:"background:rgba(37,99,235,0.12);color:#2563eb;border:1px solid rgba(37,99,235,0.25);",other:"background:rgba(107,114,128,0.12);color:#4b5563;border:1px solid rgba(107,114,128,0.25);"};s.innerHTML=p.map(a=>{const x=a.method==="bank"||a.method==="transfer"||a.method==="bank_transfer"||a.sourceName&&(a.sourceName.includes("بنك")||a.sourceName.includes("مصرف")||a.sourceName.includes("الراجحى")),I=x?"background:rgba(37,99,235,0.06);border-bottom:1px solid rgba(37,99,235,0.12);":"background:rgba(16,185,129,0.02);border-bottom:1px solid var(--border-soft);",N=x?`<span class="badge" style="background:#eff6ff;color:#1d4ed8;border:1.5px solid #93c5fd;font-weight:800;padding:4px 10px;border-radius:8px;box-shadow:0 1px 3px rgba(37,99,235,0.12);">🏦 تحويل بنكي — ${a.sourceName||"بنك"}</span>`:`<span class="badge" style="background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;font-weight:700;padding:4px 10px;border-radius:8px;">💵 نقدي — ${a.sourceName||"صندوق"}</span>`;return`
        <tr style="${I}transition:all 0.15s ease;">
          <td class="mono font-bold" style="font-size:12.5px;">${a.date}</td>
          <td class="mono" style="font-size:12px;"><span dir="ltr" style="display:inline-block;direction:ltr;background:var(--bg-2);padding:3px 10px;border-radius:6px;font-weight:900;color:var(--brand);font-family:monospace;">${a.displayCode}</span></td>
          <td><strong style="font-size:13.5px;color:var(--text-1);">${a.accountName}</strong></td>
          <td><span class="badge" style="${et[a.entityType]||et.other}font-size:11px;font-weight:700;">${mt[a.entityType]||"عميل"}</span></td>
          <td><small style="color:var(--text-2);font-size:12px;font-weight:600;">${a.notes||"—"}</small></td>
          <td>${N}</td>
          <td>${a.costCenterName?`<span style="font-size:11px;background:rgba(91,127,255,0.1);padding:3px 10px;border-radius:12px;color:var(--brand);font-weight:700;">${a.costCenterName}</span>`:"—"}</td>
          <td style="text-align:left;" class="mono font-bold text-ok" style="font-size:14px;">${R(a.amount)}</td>
          <td style="text-align:center;white-space:nowrap;">
            <div style="display:flex;gap:4px;justify-content:center;">
              <button class="btn btn-icon sm btn-ghost text-brand" onclick="previewReceipt('${a.id}')" title="معاينة السند">👁️</button>
              <button class="btn btn-icon sm btn-ghost text-ok" onclick='openReceiptModal(${JSON.stringify({...a,id:a.id})})' title="تعديل السند">✏️</button>
              <button class="btn btn-icon sm btn-ghost text-warning" onclick="printSingleReceiptVoucher('${a.id}')" title="طباعة سند آلي">🖨️</button>
              <button class="btn btn-icon sm btn-ghost text-bad" onclick="confirmDeleteReceiptModal('${a.id}')" title="حذف نهائي">🗑️</button>
            </div>
          </td>
        </tr>
      `}).join("")}catch(p){console.error(p),s.innerHTML=`<tr><td colspan="9" class="text-bad" style="text-align:center;">خطأ في تحميل بيانات السندات: ${p.message}</td></tr>`}}window.loadReceipts=M;async function lt(t){const o=it(_(u,`companies/${l}/journalEntries`),at("sourceId","==",t)),e=await nt(o);if(!e.empty)for(const n of e.docs)await ht(n.id)}async function pt(t,o){const e=o==="cash"?`companies/${l}/cashTransactions`:`companies/${l}/bankTransactions`,n=it(_(u,e),at("sourceId","==",t)),i=await nt(n);if(i.empty)return;const d=vt(u);i.docs.forEach(s=>d.delete(s.ref)),await d.commit()}function $t(t,o){let e=null,n=null,i=null,d=null;if(t==="customer"){const s=Z.find(r=>r.id===o);d=s?.name||null;const c=f.find(r=>r.sourceEntityId===o&&r.sourceModule==="customers")||f.find(r=>r.name&&s?.name&&r.name.includes(s.name))||f.find(r=>r.code==="1-1-2-1-1");e=c?.id||null,n=c?.code||null,i=c?.name||"ذمم العملاء"}else if(t==="supplier"){const s=Q.find(r=>r.id===o);d=s?.name||null;const c=f.find(r=>r.sourceEntityId===o&&r.sourceModule==="suppliers")||f.find(r=>r.name&&s?.name&&r.name.includes(s.name))||f.find(r=>r.code==="2-1-1-1-1");e=c?.id||null,n=c?.code||null,i=c?.name||"ذمم الموردين"}else{const s=f.find(c=>c.id===o);e=o||null,n=s?.code||null,i=s?.name||null,d=s?.name||null}return{creditAccId:e,creditAccCode:n,creditAccName:i,destinationName:d}}function Et(t,o){let e=null,n=null,i=null,d=null;if(t==="cash"){const s=z.find(r=>r.id===o);e=s?.accountId||null;const c=f.find(r=>r.id===s?.accountId||s?.accountCode&&r.code===s.accountCode||r.id===o||r.code===o);e=e||c?.id||null,n=c?.code||s?.accountCode||s?.code||null,i=c?.name||s?.name||null,d=b(u,`companies/${l}/cashBoxes`,o)}else{const s=S.find(r=>r.id===o);e=s?.accountId||null;let c=f.find(r=>r.id===s?.accountId||s?.accountCode&&r.code===s.accountCode||r.id===o||r.code===o);if(!c&&s?.name){const r=s.name.replace(/[\s\-_]/g,"").toLowerCase();c=f.find(m=>m.parentCode==="1-1-1-3"&&(m.name?.replace(/[\s\-_]/g,"").toLowerCase().includes(r)||r.includes((m.name||"").replace(/[\s\-_]/g,"").toLowerCase())))}e=e||c?.id||null,n=c?.code||s?.accountCode||s?.code||null,i=c?.name||s?.name||null,d=b(u,`companies/${l}/bankAccounts`,o)}if(!e){const s=f.find(c=>c.code===(t==="cash"?"1-1-1-1-3":"1-1-1-3-02"))||t!=="cash"&&f.find(c=>c.code?.startsWith("1-1-1-3"))||f.find(c=>c.code==="1-1-1-1-3");e=s?.id||null,n=s?.code||null,i=s?.name||null}return{debitAccId:e,debitAccCode:n,debitAccName:i,sourceDocRef:d}}function It(t){if(!t||isNaN(t))return"صفر ريال سعودي";const o=Math.floor(t),e=Math.round((t-o)*100),n=["","واحد","اثنان","ثلاثة","أربعة","خمسة","ستة","سبعة","ثمانية","تسعة","عشرة","أحد عشر","اثنا عشر","ثلاثة عشر","أربعة عشر","خمسة عشر","ستة عشر","سبعة عشر","ثمانية عشر","تسعة عشر"],i=["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"],d=["","مائة","مئتان","ثلاثمائة","أربعمائة","خمسمائة","ستمائة","سبعمائة","ثمانمائة","تسعمائة"];function s(r){return r===0?"":r<20?n[r]:r<100?i[Math.floor(r/10)]+(r%10?" و"+n[r%10]:""):d[Math.floor(r/100)]+(r%100?" و"+s(r%100):"")}let c="";return o>=1e6&&(c+=s(Math.floor(o/1e6))+" مليون "),o>=1e3&&(c+=s(Math.floor(o%1e6/1e3))+" ألف "),c+=s(o%1e3),c=c.trim()+" ريال سعودي",e>0&&(c+=` و${s(e)} هللة`),c}export{Mt as render};
