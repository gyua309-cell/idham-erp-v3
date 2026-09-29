import{g as v,a as m,u as w,o as x,r as I,f as b}from"./index-BgjRa7f-.js";import{e as E}from"./excel-zCoXiaxq.js";import{orderBy as g}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let d=[],u=[];const r=()=>new Date().toISOString().slice(0,10),c=[{id:"damaged_goods",label:"📦 توالف وكسور عند استلام البضاعة",icon:"📦"},{id:"qty_shortage",label:"🔍 نقص وعجز في عدد الكراتين المستلمة",icon:"🔍"},{id:"price_dispute",label:"🧾 اختلاف سعر الفاتورة عن المتفق عليه",icon:"🧾"},{id:"near_expiry",label:"⏳ بضاعة قريبة أو منتهية الصلاحية",icon:"⏳"},{id:"wrong_item",label:"❌ استلام صنف خاطئ ومختلف",icon:"❌"},{id:"other",label:"📌 أخرى",icon:"📌"}];async function A(t,e){t.innerHTML=`
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:260px;">
        <input type="text" id="sup-clm-search" class="input" placeholder="🔍 بحث في المطالبات..." oninput="window.filterClaims(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>المورد</label>
        <select id="sup-clm-sup-filter" onchange="window.filterClaims()">
          <option value="">كل الموردين</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="sup-clm-status-filter" onchange="window.filterClaims()">
          <option value="">كل الحالات</option>
          <option value="open">🔴 جديدة (مفتوحة)</option>
          <option value="under_review">🟡 قيد المراجعة مع المورد</option>
          <option value="debit_note_issued">🟢 تم إصدار إشعار مدين</option>
          <option value="replaced">📦 تم استبدال البضاعة</option>
          <option value="closed">⚪ مغلقة</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>نوع المطالبة</label>
        <select id="sup-clm-type-filter" onchange="window.filterClaims()">
          <option value="">كل الأنواع</option>
          ${c.map(i=>`<option value="${i.id}">${i.label}</option>`).join("")}
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportClaimsExcel()">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openClaimModal()">+ تسجيل مطالبة مورد جديدة</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Stats -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي المطالبات</div>
          <div class="mono" id="clm-kpi-total" style="font-size:20px; font-weight:900; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(239,68,68,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#EF4444; font-weight:700;">مطالبات مفتوحة وعاجلة</div>
          <div class="mono" id="clm-kpi-open" style="font-size:20px; font-weight:900; color:#EF4444; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#F59E0B; font-weight:700;">قيد المراجعة والفحص</div>
          <div class="mono" id="clm-kpi-review" style="font-size:20px; font-weight:900; color:#F59E0B; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">إجمالي مبالغ التعويض / الخصم</div>
          <div class="mono" id="clm-kpi-val" style="font-size:18px; font-weight:900; color:#10B981; margin-top:4px;">0 ر.س</div>
        </div>
      </div>

      <!-- Claims Table -->
      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th style="width:105px;">رقم المطالبة</th>
                <th>المورد</th>
                <th style="width:95px;">التاريخ</th>
                <th>نوع المطالبة</th>
                <th style="width:100px;">رقم الفاتورة</th>
                <th>تفاصيل العيب / العجز</th>
                <th style="width:110px; text-align:left;">مبلغ التعويض</th>
                <th style="width:115px; text-align:center;">الحالة</th>
                <th style="width:110px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="clm-tbody">
              <tr><td colspan="9" style="text-align:center; padding:32px;"><span class="spin"></span> جاري تحميل مطالبات الموردين...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Claim Modal -->
    <div class="modal-overlay" id="claim-modal">
      <div class="modal modal-lg" style="max-width:700px;">
        <div class="modal-header">
          <h3 class="modal-title" id="clm-modal-title">➕ تسجيل مطالبة مورد جديدة</h3>
          <button class="modal-close" onclick="closeModal('claim-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="clm-edit-id" />
          
          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>المورد المعني بالمطالبة *</label>
              <select id="clm-sup-id" class="input">
                <option value="">-- اختر المورد --</option>
              </select>
            </div>
            <div class="form-group">
              <label>تاريخ تسجيل المطالبة *</label>
              <input type="date" id="clm-date" class="input" value="${r()}" />
            </div>
          </div>

          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>نوع المطالبة *</label>
              <select id="clm-type" class="input">
                ${c.map(i=>`<option value="${i.id}">${i.label}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label>رقم فاتورة الشراء المرتبطة</label>
              <input type="text" id="clm-inv-ref" class="input mono" placeholder="PINV-00123" />
            </div>
            <div class="form-group">
              <label>مبلغ التعويض / الخصم المطالب به (ر.س)</label>
              <input type="number" id="clm-amount" class="input mono" placeholder="500.00" min="0" step="0.5" />
            </div>
          </div>

          <div class="form-group mb-12">
            <label>تفاصيل المشكلة والعجز أو التوالف *</label>
            <textarea id="clm-details" class="input" rows="3" placeholder="مثال: تم استلام الشحنة وتبيّن وجود 10 كراتين زيت مسكوبة ومبللة بالكامل في قاع الشاحنة..."></textarea>
          </div>

          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>حالة المطالبة</label>
              <select id="clm-status" class="input">
                <option value="open">🔴 جديدة (مفتوحة)</option>
                <option value="under_review">🟡 قيد المراجعة والفحص مع المورد</option>
                <option value="debit_note_issued">🟢 تم إصدار إشعار مدين / خصم من الرصيد</option>
                <option value="replaced">📦 تم استلام بضاعة بديلة سليمة</option>
                <option value="closed">⚪ مغلقة</option>
              </select>
            </div>
            <div class="form-group">
              <label>الإجراء المتخذ والحل النهائي</label>
              <input type="text" id="clm-resolution" class="input" placeholder="مثال: وافق المندوب على خصم 450 ريال في الفاتورة القادمة..." />
            </div>
          </div>

          <div id="clm-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('claim-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveClaim()">💾 حفظ المطالبة</button>
        </div>
      </div>
    </div>
  `,await p(),k()}async function p(){try{const[t,e]=await Promise.all([v(m.supplierClaims?m.supplierClaims():"supplierClaims",[g("createdAt","desc")]).catch(()=>[]),v(m.suppliers(),[g("name")]).catch(()=>[])]);d=t,u=e,C(),B(),y()}catch(t){console.warn("Error loading supplier claims:",t)}}function B(){const t=d.filter(o=>o.status==="open"),e=d.filter(o=>o.status==="under_review"),i=d.reduce((o,a)=>o+(parseFloat(a.claimedAmount)||0),0),l=(o,a)=>{const n=document.getElementById(o);n&&(n.textContent=a)};l("clm-kpi-total",d.length),l("clm-kpi-open",t.length),l("clm-kpi-review",e.length),l("clm-kpi-val",b(i))}function C(){const t=document.getElementById("sup-clm-sup-filter"),e=document.getElementById("clm-sup-id"),i=u.map(l=>`<option value="${l.id}">${l.name}</option>`).join("");t&&(t.innerHTML='<option value="">كل الموردين</option>'+i),e&&(e.innerHTML='<option value="">-- اختر المورد --</option>'+i)}function y(t=d){const e=document.getElementById("clm-tbody");if(!e)return;if(!t.length){e.innerHTML='<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد مطالبات مسجلة</td></tr>';return}const i={open:'<span class="badge bad">مفتوحة</span>',under_review:'<span class="badge warn">قيد المراجعة</span>',debit_note_issued:'<span class="badge good">إشعار مدين</span>',replaced:'<span class="badge" style="background:rgba(99,102,241,0.15); color:var(--brand); font-weight:700;">تم الاستبدال</span>',closed:'<span class="badge neutral">مغلقة</span>'};e.innerHTML=t.map(l=>{const o=c.find(a=>a.id===l.type);return`
      <tr>
        <td class="mono font-bold" style="color:var(--brand);">${l.claimNumber||l.id}</td>
        <td class="font-bold">${l.supplierName}</td>
        <td class="mono dim">${l.date||"—"}</td>
        <td style="font-size:12px; font-weight:600;">${o?o.label:l.type||"عامة"}</td>
        <td class="mono font-bold">${l.invoiceRef||"—"}</td>
        <td style="font-size:12px; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${l.details||""}">
          ${l.details||"—"}
        </td>
        <td class="mono font-bold" style="text-align:left; color:${(l.claimedAmount||0)>0?"#10B981":"var(--text-dim)"};">
          ${(l.claimedAmount||0)>0?b(l.claimedAmount):"—"}
        </td>
        <td style="text-align:center;">${i[l.status]||i.open}</td>
        <td>
          <div class="row-actions" style="justify-content:center;">
            <button class="btn btn-icon sm btn-ghost" onclick="window.editClaim('${l.id}')" title="تعديل ومعالجة">✏️</button>
            <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deleteClaim('${l.id}')" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>
    `}).join("")}function k(){window.filterClaims=()=>{const t=(document.getElementById("sup-clm-search")?.value||"").trim().toLowerCase(),e=document.getElementById("sup-clm-sup-filter")?.value||"",i=document.getElementById("sup-clm-status-filter")?.value||"",l=document.getElementById("sup-clm-type-filter")?.value||"",o=d.filter(a=>{const n=!t||(a.claimNumber||"").toLowerCase().includes(t)||(a.supplierName||"").toLowerCase().includes(t)||(a.details||"").toLowerCase().includes(t),s=!e||a.supplierId===e,f=!i||a.status===i,h=!l||a.type===l;return n&&s&&f&&h});y(o)},window.openClaimModal=()=>{document.getElementById("clm-edit-id").value="",document.getElementById("clm-modal-title").textContent="➕ تسجيل مطالبة مورد جديدة",document.getElementById("clm-sup-id").value="",document.getElementById("clm-date").value=r(),document.getElementById("clm-type").value="damaged_goods",document.getElementById("clm-inv-ref").value="",document.getElementById("clm-amount").value="",document.getElementById("clm-details").value="",document.getElementById("clm-status").value="open",document.getElementById("clm-resolution").value="",document.getElementById("clm-modal-err").classList.add("hidden"),openModal("claim-modal")},window.saveClaim=async()=>{const t=document.getElementById("clm-modal-err");t.classList.add("hidden");const e=document.getElementById("clm-sup-id").value,i=u.find(s=>s.id===e),l=document.getElementById("clm-details").value.trim(),o=document.getElementById("clm-edit-id").value;if(!e){t.textContent="يرجى اختيار المورد",t.classList.remove("hidden");return}if(!l){t.textContent="يرجى كتابة تفاصيل المشكلة أو العجز",t.classList.remove("hidden");return}const a=o?void 0:`CLM-${new Date().getFullYear()}-${String(d.length+1).padStart(4,"0")}`,n={supplierId:e,supplierName:i?i.name:"مورد",date:document.getElementById("clm-date").value,type:document.getElementById("clm-type").value,invoiceRef:document.getElementById("clm-inv-ref").value.trim(),claimedAmount:parseFloat(document.getElementById("clm-amount").value)||0,details:l,status:document.getElementById("clm-status").value,resolution:document.getElementById("clm-resolution").value.trim()};a&&(n.claimNumber=a);try{o?await w("supplierClaims",o,n):await x("supplierClaims",n),closeModal("claim-modal"),await p()}catch(s){t.textContent=s.message,t.classList.remove("hidden")}},window.editClaim=t=>{const e=d.find(i=>i.id===t);e&&(document.getElementById("clm-edit-id").value=e.id,document.getElementById("clm-modal-title").textContent="✏️ معالجة المطالبة: "+(e.claimNumber||e.id),document.getElementById("clm-sup-id").value=e.supplierId||"",document.getElementById("clm-date").value=e.date||r(),document.getElementById("clm-type").value=e.type||"damaged_goods",document.getElementById("clm-inv-ref").value=e.invoiceRef||"",document.getElementById("clm-amount").value=e.claimedAmount||"",document.getElementById("clm-details").value=e.details||"",document.getElementById("clm-status").value=e.status||"open",document.getElementById("clm-resolution").value=e.resolution||"",document.getElementById("clm-modal-err").classList.add("hidden"),openModal("claim-modal"))},window.deleteClaim=async t=>{if(confirm("هل أنت متأكد من حذف هذه المطالبة؟"))try{await I("supplierClaims",t),await p()}catch(e){alert("فشل الحذف: "+e.message)}},window.exportClaimsExcel=()=>{const t=d.map(e=>({"رقم المطالبة":e.claimNumber||e.id,"اسم المورد":e.supplierName,التاريخ:e.date,النوع:c.find(i=>i.id===e.type)?.label||e.type,"رقم الفاتورة":e.invoiceRef||"—",المبلغ:e.claimedAmount||0,الحالة:e.status,التفاصيل:e.details,"الحل المتخذ":e.resolution||"—"}));E(t)}}export{A as render};
