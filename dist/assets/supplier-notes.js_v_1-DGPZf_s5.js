import{g as b,a as c,u as g,o as x,r as f}from"./index-BgjRa7f-.js";import{e as h}from"./excel-zCoXiaxq.js";import{orderBy as y}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let s=[],m=[];const r=()=>new Date().toISOString().slice(0,10),p=[{id:"bank_account",label:"🏦 حساب بنكي وآيبان معتمد للتحويل",color:"#3B82F6",icon:"🏦"},{id:"pinned_warning",label:"⚠️ تنبيه وتحذير مالي مثبت",color:"#EF4444",icon:"⚠️"},{id:"cash_discount",label:"💰 شروط خصم السداد النقدي المبكر",color:"#10B981",icon:"💰"},{id:"receiving_terms",label:"📦 اشتراطات تفريغ واستلام المستودع",color:"#F59E0B",icon:"📦"},{id:"general",label:"📌 ملاحظة وتفاهم عام",color:"#6B7280",icon:"📌"}];async function M(t,e){t.innerHTML=`
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:260px;">
        <input type="text" id="sup-note-search" class="input" placeholder="🔍 بحث في الملاحظات والآيبان..." oninput="window.filterSupplierNotes(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>المورد</label>
        <select id="sup-note-sup-filter" onchange="window.filterSupplierNotes()">
          <option value="">كل الموردين</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>النوع</label>
        <select id="sup-note-type-filter" onchange="window.filterSupplierNotes()">
          <option value="">كل الأنواع</option>
          ${p.map(n=>`<option value="${n.id}">${n.label}</option>`).join("")}
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportSupplierNotesExcel()">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openSupplierNoteModal()">+ إضافة حساب بنكي / ملاحظة</button>
      </div>
    </div>

    <div class="page-content">
      <!-- Pinned Bank & Warning Strip -->
      <div id="sup-pinned-notes-container" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:12px; margin-bottom:16px;"></div>

      <!-- Notes Table -->
      <div class="card">
        <div class="card-header" style="padding:14px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0; font-size:15px; font-weight:800; color:var(--text-0);">📝 سجل الحسابات البنكية والملاحظات الموثقة</h3>
          <span class="badge" id="sup-notes-count">0 سجل</span>
        </div>
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th style="width:95px;">التاريخ</th>
                <th>المورد</th>
                <th style="width:130px;">النوع</th>
                <th>تفاصيل الحساب / الملاحظة</th>
                <th style="width:180px;">رقم الآيبان (IBAN)</th>
                <th style="width:80px; text-align:center;">مثبتة</th>
                <th style="width:110px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="sup-notes-tbody">
              <tr><td colspan="7" style="text-align:center; padding:32px;"><span class="spin"></span> جاري تحميل الملاحظات...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Note Modal -->
    <div class="modal-overlay" id="sup-note-modal">
      <div class="modal" style="max-width:640px;">
        <div class="modal-header">
          <h3 class="modal-title" id="sup-note-modal-title">➕ إضافة حساب بنكي / ملاحظة مورد</h3>
          <button class="modal-close" onclick="closeModal('sup-note-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="sup-note-edit-id" />
          
          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>المورد *</label>
              <select id="sup-note-sup-id" class="input">
                <option value="">-- اختر المورد --</option>
              </select>
            </div>
            <div class="form-group">
              <label>تاريخ التسجيل *</label>
              <input type="date" id="sup-note-date" class="input" value="${r()}" />
            </div>
          </div>

          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>نوع السجل *</label>
              <select id="sup-note-type" class="input" onchange="window.onNoteTypeChange(this.value)">
                ${p.map(n=>`<option value="${n.id}">${n.label}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label>اسم البنك (إن وجد)</label>
              <input type="text" id="sup-note-bank" class="input" placeholder="مصرف الراجحي / الأهلي..." />
            </div>
          </div>

          <div class="form-group mb-12" id="sup-note-iban-wrap">
            <label>رقم الآيبان الدولي (IBAN) المعتمد للتحويلات</label>
            <input type="text" id="sup-note-iban" class="input mono" placeholder="SA0000000000000000000000" style="letter-spacing:1px;" />
          </div>

          <div class="form-group mb-12">
            <label>نص الملاحظة / شروط السداد والخصم *</label>
            <textarea id="sup-note-content" class="input" rows="3" placeholder="اكتب الملاحظة بالتفصيل أو شروط الخصم (مثال: خصم 2% في حال السداد خلال 10 أيام)..."></textarea>
          </div>

          <div class="form-group mb-12" style="display:flex; align-items:center; gap:8px; background:rgba(239,68,68,0.06); padding:10px 14px; border-radius:8px; border:1px solid rgba(239,68,68,0.2);">
            <input type="checkbox" id="sup-note-pinned" style="width:18px; height:18px; cursor:pointer;" />
            <label for="sup-note-pinned" style="margin:0; cursor:pointer; font-weight:800; color:#EF4444;">
              📌 تثبيت كتنبيه تحذيري يظهر تلقائياً في فواتير الشراء وسندات الصرف
            </label>
          </div>

          <div id="sup-note-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('sup-note-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveSupplierNote()">💾 حفظ البيانات</button>
        </div>
      </div>
    </div>
  `,await u(),E()}async function u(){try{const[t,e]=await Promise.all([b(c.supplierNotes?c.supplierNotes():"supplierNotes",[y("createdAt","desc")]).catch(()=>[]),b(c.suppliers(),[y("name")]).catch(()=>[])]);s=t,m=e,w(),B(),v()}catch(t){console.warn("Error loading supplier notes data:",t)}}function w(){const t=document.getElementById("sup-note-sup-filter"),e=document.getElementById("sup-note-sup-id"),n=m.map(o=>`<option value="${o.id}">${o.name}</option>`).join("");t&&(t.innerHTML='<option value="">كل الموردين</option>'+n),e&&(e.innerHTML='<option value="">-- اختر المورد --</option>'+n)}function B(){const t=document.getElementById("sup-pinned-notes-container");if(!t)return;const e=s.filter(n=>n.isPinned||n.type==="pinned_warning"||n.type==="bank_account");if(!e.length){t.innerHTML="";return}t.innerHTML=e.slice(0,4).map(n=>{const o=n.type==="bank_account"||!!n.iban,i=o?"#3B82F6":"#EF4444";return`
      <div class="card" style="padding:14px; border:1.5px solid ${i}40; background:${o?"rgba(59,130,246,0.06)":"rgba(239,68,68,0.06)"}; border-radius:12px;">
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:6px;">
          <div style="font-weight:800; font-size:13.5px; color:var(--text-0);">${n.supplierName}</div>
          <span class="badge" style="background:${i}20; color:${i}; font-weight:800; font-size:10.5px;">
            ${o?"🏦 حساب بنكي":"⚠️ تنبيه مثبت"}
          </span>
        </div>

        ${n.iban?`
          <div style="background:var(--bg-card); padding:8px 10px; border-radius:6px; border:1px solid var(--border-soft); margin:6px 0; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:10.5px; color:var(--text-3); font-weight:700;">${n.bankName||"البنك"}:</div>
              <div class="mono font-bold" style="font-size:12.5px; color:var(--brand);">${n.iban}</div>
            </div>
            <button class="btn btn-secondary btn-sm" style="font-size:11px; padding:2px 8px;" onclick="window.copyIBAN('${n.iban}')">📋 نسخ</button>
          </div>
        `:""}

        <div style="font-size:12px; color:var(--text-1); margin-top:6px; line-height:1.4;">${n.content}</div>
      </div>
    `}).join("")}function v(t=s){const e=document.getElementById("sup-notes-tbody"),n=document.getElementById("sup-notes-count");if(e){if(n&&(n.textContent=`${t.length} سجل`),!t.length){e.innerHTML='<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد ملاحظات أو حسابات مسجلة</td></tr>';return}e.innerHTML=t.map(o=>{const i=p.find(a=>a.id===o.type)||p[4];return`
      <tr>
        <td class="mono dim">${o.date||"—"}</td>
        <td class="font-bold">${o.supplierName}</td>
        <td>
          <span class="badge" style="background:${i.color}15; color:${i.color}; font-weight:700; font-size:11px;">
            ${i.label}
          </span>
        </td>
        <td style="font-size:12px; max-width:240px;">
          ${o.bankName?`<b>[${o.bankName}]</b> `:""}${o.content||"—"}
        </td>
        <td class="mono font-bold" style="color:var(--brand); font-size:12px;">
          ${o.iban?`
            <div style="display:flex; align-items:center; gap:6px;">
              <span>${o.iban}</span>
              <button class="btn btn-icon sm btn-ghost" onclick="window.copyIBAN('${o.iban}')" title="نسخ الآيبان">📋</button>
            </div>
          `:"—"}
        </td>
        <td style="text-align:center;">
          ${o.isPinned?'<span class="badge bad" style="font-weight:800;">📌 نعم</span>':'<span class="dim">—</span>'}
        </td>
        <td>
          <div class="row-actions" style="justify-content:center;">
            <button class="btn btn-icon sm btn-ghost" onclick="window.editSupplierNote('${o.id}')" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deleteSupplierNote('${o.id}')" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>
    `}).join("")}}function E(){window.filterSupplierNotes=()=>{const t=(document.getElementById("sup-note-search")?.value||"").trim().toLowerCase(),e=document.getElementById("sup-note-sup-filter")?.value||"",n=document.getElementById("sup-note-type-filter")?.value||"",o=s.filter(i=>{const a=!t||(i.supplierName||"").toLowerCase().includes(t)||(i.content||"").toLowerCase().includes(t)||(i.iban||"").toLowerCase().includes(t),d=!e||i.supplierId===e,l=!n||i.type===n;return a&&d&&l});v(o)},window.copyIBAN=t=>{navigator.clipboard.writeText(t),alert(`✅ تم نسخ الآيبان إلى الحافظة:
${t}`)},window.onNoteTypeChange=t=>{const e=document.getElementById("sup-note-iban-wrap");e&&(e.style.display="block")},window.openSupplierNoteModal=()=>{document.getElementById("sup-note-edit-id").value="",document.getElementById("sup-note-modal-title").textContent="➕ إضافة حساب بنكي / ملاحظة مورد",document.getElementById("sup-note-sup-id").value="",document.getElementById("sup-note-date").value=r(),document.getElementById("sup-note-type").value="bank_account",document.getElementById("sup-note-bank").value="",document.getElementById("sup-note-iban").value="",document.getElementById("sup-note-content").value="",document.getElementById("sup-note-pinned").checked=!1,document.getElementById("sup-note-modal-err").classList.add("hidden"),openModal("sup-note-modal")},window.saveSupplierNote=async()=>{const t=document.getElementById("sup-note-modal-err");t.classList.add("hidden");const e=document.getElementById("sup-note-sup-id").value,n=m.find(l=>l.id===e),o=document.getElementById("sup-note-content").value.trim(),i=document.getElementById("sup-note-pinned").checked,a=document.getElementById("sup-note-edit-id").value;if(!e){t.textContent="يرجى اختيار المورد",t.classList.remove("hidden");return}if(!o&&!document.getElementById("sup-note-iban").value){t.textContent="يرجى كتابة نص الملاحظة أو الآيبان",t.classList.remove("hidden");return}const d={supplierId:e,supplierName:n?n.name:"مورد",date:document.getElementById("sup-note-date").value,type:document.getElementById("sup-note-type").value,bankName:document.getElementById("sup-note-bank").value.trim(),iban:document.getElementById("sup-note-iban").value.trim(),content:o,isPinned:i};try{a?await g("supplierNotes",a,d):await x("supplierNotes",d),i&&d.type==="pinned_warning"&&await g("customers",e,{pinnedWarningNote:o}).catch(()=>{}),closeModal("sup-note-modal"),await u()}catch(l){t.textContent=l.message,t.classList.remove("hidden")}},window.editSupplierNote=t=>{const e=s.find(n=>n.id===t);e&&(document.getElementById("sup-note-edit-id").value=e.id,document.getElementById("sup-note-modal-title").textContent="✏️ تعديل السجل — "+e.supplierName,document.getElementById("sup-note-sup-id").value=e.supplierId||"",document.getElementById("sup-note-date").value=e.date||r(),document.getElementById("sup-note-type").value=e.type||"bank_account",document.getElementById("sup-note-bank").value=e.bankName||"",document.getElementById("sup-note-iban").value=e.iban||"",document.getElementById("sup-note-content").value=e.content||"",document.getElementById("sup-note-pinned").checked=!!e.isPinned,document.getElementById("sup-note-modal-err").classList.add("hidden"),openModal("sup-note-modal"))},window.deleteSupplierNote=async t=>{if(confirm("هل أنت متأكد من حذف هذا السجل؟"))try{await f("supplierNotes",t),await u()}catch(e){alert("فشل الحذف: "+e.message)}},window.exportSupplierNotesExcel=()=>{const t=s.map(e=>({المورد:e.supplierName,التاريخ:e.date,النوع:p.find(n=>n.id===e.type)?.label||e.type,البنك:e.bankName||"—",الآيبان:e.iban||"—","الملاحظة / الشروط":e.content,مثبتة:e.isPinned?"نعم":"لا"}));h(t)}}export{M as render};
