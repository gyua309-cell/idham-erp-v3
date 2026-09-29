import{g as v,a as c,u as h,o as x,r as w,f as E}from"./index-CnctmNGr.js";import{e as I}from"./excel-zCoXiaxq.js";import{orderBy as g}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let d=[],u=[];const r=()=>new Date().toISOString().slice(0,10),p=[{id:"damaged_goods",label:"📦 تلف أو عيب في البضاعة",icon:"📦"},{id:"delivery_delay",label:"🚚 تأخر في موعد التسليم",icon:"🚚"},{id:"invoice_dispute",label:"🧾 خلاف في الفاتورة أو السعر",icon:"🧾"},{id:"missing_items",label:"🔍 نقص في الكميات المسلمة",icon:"🔍"},{id:"rep_behavior",label:"🚗 ملاحظة على تعامل المندوب",icon:"🚗"},{id:"other",label:"📌 أخرى",icon:"📌"}];async function P(o,t){o.innerHTML=`
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:260px;">
        <input type="text" id="cmp-search" class="input" placeholder="🔍 بحث في الشكاوى (الرقم / العميل)..." oninput="window.filterComplaints(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="cmp-status-filter" onchange="window.filterComplaints()">
          <option value="">كل الحالات</option>
          <option value="open">🔴 جديدة (مفتوحة)</option>
          <option value="in_progress">🟡 قيد المعالجة</option>
          <option value="resolved">🟢 تم الحل والتعويض</option>
          <option value="closed">⚪ مغلقة</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>النوع</label>
        <select id="cmp-type-filter" onchange="window.filterComplaints()">
          <option value="">كل الأنواع</option>
          ${p.map(i=>`<option value="${i.id}">${i.label}</option>`).join("")}
        </select>
      </div>
      <div class="filter-select-group">
        <label>الأولوية</label>
        <select id="cmp-priority-filter" onchange="window.filterComplaints()">
          <option value="">كل الأولويات</option>
          <option value="urgent">🔥 عاجلة جداً</option>
          <option value="high">⚡ مرتفعة</option>
          <option value="normal">🔹 عادية</option>
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportComplaintsExcel()">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openComplaintModal()">+ تسجيل شكوى جديدة</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Stats -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي التذاكر</div>
          <div class="mono" id="cmp-kpi-total" style="font-size:20px; font-weight:900; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(239,68,68,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#EF4444; font-weight:700;">شكاوى مفتوحة / عاجلة</div>
          <div class="mono" id="cmp-kpi-open" style="font-size:20px; font-weight:900; color:#EF4444; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#F59E0B; font-weight:700;">قيد المعالجة والتحقيق</div>
          <div class="mono" id="cmp-kpi-progress" style="font-size:20px; font-weight:900; color:#F59E0B; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">تم الحل وإرضاء العميل</div>
          <div class="mono" id="cmp-kpi-resolved" style="font-size:20px; font-weight:900; color:#10B981; margin-top:4px;">0</div>
        </div>
      </div>

      <!-- Complaints Table -->
      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th style="width:100px;">رقم التذكرة</th>
                <th>العميل</th>
                <th style="width:100px;">التاريخ</th>
                <th>نوع الشكوى</th>
                <th style="width:90px; text-align:center;">الأولوية</th>
                <th>تفاصيل المشكلة</th>
                <th style="width:110px; text-align:left;">مبلغ التعويض</th>
                <th style="width:105px; text-align:center;">الحالة</th>
                <th style="width:130px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="cmp-tbody">
              <tr><td colspan="9" style="text-align:center; padding:32px;"><span class="spin"></span> جاري تحميل الشكاوى...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Complaint Modal -->
    <div class="modal-overlay" id="complaint-modal">
      <div class="modal" style="max-width:640px;">
        <div class="modal-header">
          <h3 class="modal-title" id="cmp-modal-title">➕ تسجيل شكوى عميل</h3>
          <button class="modal-close" onclick="closeModal('complaint-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="cmp-edit-id" />
          
          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>العميل صاحب الشكوى *</label>
              <select id="cmp-cust-id" class="input">
                <option value="">-- اختر العميل --</option>
              </select>
            </div>
            <div class="form-group">
              <label>تاريخ الشكوى *</label>
              <input type="date" id="cmp-date" class="input" value="${r()}" />
            </div>
          </div>

          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>نوع الشكوى *</label>
              <select id="cmp-type" class="input">
                ${p.map(i=>`<option value="${i.id}">${i.label}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label>درجة الأولوية</label>
              <select id="cmp-priority" class="input">
                <option value="urgent">🔥 عاجلة جداً</option>
                <option value="high">⚡ مرتفعة</option>
                <option value="normal" selected>🔹 عادية</option>
              </select>
            </div>
            <div class="form-group">
              <label>رقم الفاتورة المرتبطة</label>
              <input type="text" id="cmp-inv-ref" class="input mono" placeholder="INV-00123" />
            </div>
          </div>

          <div class="form-group mb-12">
            <label>تفاصيل الشكوى / اعتراض العميل *</label>
            <textarea id="cmp-details" class="input" rows="3" placeholder="اشرح المشكلة بالتفصيل (مثل: استلم العميل 5 كراتين علب مكسورة)..."></textarea>
          </div>

          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>حالة التذكرة</label>
              <select id="cmp-status" class="input">
                <option value="open">🔴 جديدة (مفتوحة)</option>
                <option value="in_progress">🟡 قيد المعالجة والتحقيق</option>
                <option value="resolved">🟢 تم الحل والتعويض</option>
                <option value="closed">⚪ مغلقة</option>
              </select>
            </div>
            <div class="form-group">
              <label>مبلغ التعويض / الخصم المقترح (ر.س)</label>
              <input type="number" id="cmp-compensation" class="input mono" placeholder="0.00" min="0" step="0.5" />
            </div>
          </div>

          <div class="form-group">
            <label>الإجراء المتخذ والحل النهائي</label>
            <textarea id="cmp-resolution" class="input" rows="2" placeholder="ما تم اتخاذه (مثال: تم إرسال بضاعة بديلة مجانية مع المندوب ومصادقة الحساب)..."></textarea>
          </div>

          <div id="cmp-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('complaint-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveComplaint()">💾 حفظ الشكوى</button>
        </div>
      </div>
    </div>
  `,await m(),k()}async function m(){try{const[o,t]=await Promise.all([v(c.customerComplaints?c.customerComplaints():"customerComplaints",[g("createdAt","desc")]).catch(()=>[]),v(c.customers(),[g("name")]).catch(()=>[])]);d=o,u=t,C(),B(),y()}catch(o){console.warn("Failed to load complaints data:",o)}}function B(){const o=d.filter(e=>e.status==="open"||e.priority==="urgent"),t=d.filter(e=>e.status==="in_progress"),i=d.filter(e=>e.status==="resolved"||e.status==="closed"),l=(e,n)=>{const a=document.getElementById(e);a&&(a.textContent=n)};l("cmp-kpi-total",d.length),l("cmp-kpi-open",o.length),l("cmp-kpi-progress",t.length),l("cmp-kpi-resolved",i.length)}function C(){const o=document.getElementById("cmp-cust-id");o&&(o.innerHTML='<option value="">-- اختر العميل --</option>'+u.map(t=>`<option value="${t.id}">${t.name} (${t.phone||"—"})</option>`).join(""))}function y(o=d){const t=document.getElementById("cmp-tbody");if(!t)return;if(!o.length){t.innerHTML='<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد شكاوى مسجلة</td></tr>';return}const i={urgent:'<span class="badge bad" style="font-weight:800;">🔥 عاجلة</span>',high:'<span class="badge warn" style="font-weight:700;">⚡ مرتفعة</span>',normal:'<span class="badge neutral">عادية</span>'},l={open:'<span class="badge bad">مفتوحة</span>',in_progress:'<span class="badge warn">قيد المعالجة</span>',resolved:'<span class="badge good">تم الحل</span>',closed:'<span class="badge neutral">مغلقة</span>'};t.innerHTML=o.map(e=>{const n=p.find(a=>a.id===e.type);return`
      <tr>
        <td class="mono font-bold" style="color:var(--brand);">${e.ticketNumber||e.number||e.id}</td>
        <td>
          <div style="font-weight:700; color:var(--text-0);">${e.customerName}</div>
          <div style="font-size:11px; color:var(--text-2);">${e.customerPhone||"—"}</div>
        </td>
        <td class="mono dim">${e.date||"—"}</td>
        <td style="font-size:12px; font-weight:600;">${n?n.label:e.type||"عامة"}</td>
        <td style="text-align:center;">${i[e.priority]||i.normal}</td>
        <td style="font-size:12px; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${e.details||""}">
          ${e.details||"—"}
        </td>
        <td class="mono font-bold" style="text-align:left; color:${(e.compensationAmount||0)>0?"#10B981":"var(--text-dim)"};">
          ${(e.compensationAmount||0)>0?E(e.compensationAmount):"—"}
        </td>
        <td style="text-align:center;">${l[e.status]||l.open}</td>
        <td>
          <div class="row-actions" style="justify-content:center;">
            <button class="btn btn-icon sm btn-ghost" onclick="window.editComplaint('${e.id}')" title="تعديل ومعالجة">✏️</button>
            <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deleteComplaint('${e.id}')" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>
    `}).join("")}function k(){window.filterComplaints=()=>{const o=(document.getElementById("cmp-search")?.value||"").trim().toLowerCase(),t=document.getElementById("cmp-status-filter")?.value||"",i=document.getElementById("cmp-priority-filter")?.value||"",l=document.getElementById("cmp-type-filter")?.value||"",e=d.filter(n=>{const a=!o||(n.ticketNumber||"").toLowerCase().includes(o)||(n.customerName||"").toLowerCase().includes(o)||(n.details||"").toLowerCase().includes(o),s=!t||n.status===t,b=!i||n.priority===i,f=!l||n.type===l;return a&&s&&b&&f});y(e)},window.openComplaintModal=()=>{document.getElementById("cmp-edit-id").value="",document.getElementById("cmp-modal-title").textContent="➕ تسجيل شكوى عميل",document.getElementById("cmp-cust-id").value="",document.getElementById("cmp-date").value=r(),document.getElementById("cmp-type").value="damaged_goods",document.getElementById("cmp-priority").value="normal",document.getElementById("cmp-inv-ref").value="",document.getElementById("cmp-details").value="",document.getElementById("cmp-status").value="open",document.getElementById("cmp-compensation").value="",document.getElementById("cmp-resolution").value="",document.getElementById("cmp-modal-err").classList.add("hidden"),openModal("complaint-modal")},window.saveComplaint=async()=>{const o=document.getElementById("cmp-modal-err");o.classList.add("hidden");const t=document.getElementById("cmp-cust-id").value,i=u.find(s=>s.id===t),l=document.getElementById("cmp-details").value.trim(),e=document.getElementById("cmp-edit-id").value;if(!t){o.textContent="يرجى اختيار العميل",o.classList.remove("hidden");return}if(!l){o.textContent="يرجى كتابة تفاصيل الشكوى",o.classList.remove("hidden");return}const n=e?void 0:`TKT-${new Date().getFullYear()}-${String(d.length+1).padStart(4,"0")}`,a={customerId:t,customerName:i?i.name:"عميل",customerPhone:i?i.phone:"",date:document.getElementById("cmp-date").value,type:document.getElementById("cmp-type").value,priority:document.getElementById("cmp-priority").value,invoiceRef:document.getElementById("cmp-inv-ref").value.trim(),details:l,status:document.getElementById("cmp-status").value,compensationAmount:parseFloat(document.getElementById("cmp-compensation").value)||0,resolution:document.getElementById("cmp-resolution").value.trim()};n&&(a.ticketNumber=n);try{e?await h("customerComplaints",e,a):await x("customerComplaints",a),closeModal("complaint-modal"),await m()}catch(s){o.textContent=s.message,o.classList.remove("hidden")}},window.editComplaint=o=>{const t=d.find(i=>i.id===o);t&&(document.getElementById("cmp-edit-id").value=t.id,document.getElementById("cmp-modal-title").textContent="✏️ معالجة الشكوى "+(t.ticketNumber||t.id),document.getElementById("cmp-cust-id").value=t.customerId||"",document.getElementById("cmp-date").value=t.date||r(),document.getElementById("cmp-type").value=t.type||"damaged_goods",document.getElementById("cmp-priority").value=t.priority||"normal",document.getElementById("cmp-inv-ref").value=t.invoiceRef||"",document.getElementById("cmp-details").value=t.details||"",document.getElementById("cmp-status").value=t.status||"open",document.getElementById("cmp-compensation").value=t.compensationAmount||"",document.getElementById("cmp-resolution").value=t.resolution||"",document.getElementById("cmp-modal-err").classList.add("hidden"),openModal("complaint-modal"))},window.deleteComplaint=async o=>{if(confirm("هل أنت متأكد من حذف هذه الشكوى؟"))try{await w("customerComplaints",o),await m()}catch(t){alert("فشل الحذف: "+t.message)}},window.exportComplaintsExcel=()=>{const o=d.map(t=>({"رقم التذكرة":t.ticketNumber||t.id,العميل:t.customerName,الهاتف:t.customerPhone,التاريخ:t.date,النوع:p.find(i=>i.id===t.type)?.label||t.type,الأولوية:t.priority,الحالة:t.status,التفاصيل:t.details,الحل:t.resolution||"—",التعويض:t.compensationAmount||0}));I(o)}}export{P as render};
