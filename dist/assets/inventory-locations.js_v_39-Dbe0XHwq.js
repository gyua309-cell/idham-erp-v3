import{g as u,C as i,r as p,u as v,n as f}from"./index-HrCilPJ3.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let r=[],s=[],n=null;async function k(l,o){l.innerHTML=`
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">📍 مواقع ورفوف وأدراج التخزين</h1>
        <p class="page-subtitle">إدارة التخطيط الداخلي للمخازن (Zone → Aisle → Rack → Bin)</p>
      </div>

      <div class="filterbar" style="margin-bottom:16px;">
        <button class="btn btn-primary" onclick="INV_LOC.openModal()">
          ➕ إضافة موقع جديد
        </button>
        <div style="flex:1;"></div>
        <label style="font-size:12px; color:var(--text-2);">المخزن:</label>
        <select id="loc-filter-wh" class="form-control" style="width:200px; height:36px;" onchange="INV_LOC.filterByWarehouse()">
          <option value="">جميع المخازن</option>
        </select>
        <input id="loc-search" type="text" class="form-control" placeholder="🔍 بحث بالكود أو الاسم..." style="width:220px; height:36px;" oninput="INV_LOC.filterList()">
      </div>

      <!-- KPI Row -->
      <div class="kpi-grid mb-24" style="grid-template-columns: repeat(4, 1fr);">
        <div class="kpi-card">
          <div class="status-bar indigo"></div>
          <div class="kpi-content">
            <div class="kpi-label">إجمالي المواقع</div>
            <div class="kpi-value mono text-indigo" id="loc-kpi-total">—</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="status-bar good"></div>
          <div class="kpi-content">
            <div class="kpi-label">مواقع نشطة</div>
            <div class="kpi-value mono text-good" id="loc-kpi-active">—</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="status-bar warn"></div>
          <div class="kpi-content">
            <div class="kpi-label">مواقع ممتلئة</div>
            <div class="kpi-value mono text-warn" id="loc-kpi-full">—</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="status-bar bad"></div>
          <div class="kpi-content">
            <div class="kpi-label">مواقع معطّلة</div>
            <div class="kpi-value mono text-bad" id="loc-kpi-disabled">—</div>
          </div>
        </div>
      </div>

      <div id="loc-loading" class="page-loading" style="min-height:200px;">
        <div class="loading-spinner"></div>
      </div>

      <div id="loc-list-wrap" class="hidden">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>الكود</th>
                <th>اسم الموقع</th>
                <th>المخزن</th>
                <th>المنطقة</th>
                <th>الممر</th>
                <th>الرف</th>
                <th>الدرج</th>
                <th>الحالة</th>
                <th>الطاقة الاستيعابية</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody id="loc-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div id="loc-modal" class="modal-overlay hidden" onclick="if(event.target===this) INV_LOC.closeModal()">
      <div class="modal" style="max-width:600px;">
        <div class="modal-header">
          <h2 class="modal-title" id="loc-modal-title">إضافة موقع تخزين</h2>
          <button class="modal-close" onclick="INV_LOC.closeModal()">✕</button>
        </div>
        <div class="modal-body" style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <div class="form-group">
            <label class="form-label">كود الموقع <span class="text-bad">*</span></label>
            <input id="loc-f-code" type="text" class="form-control" placeholder="مثال: A-01-R02-B03" />
          </div>
          <div class="form-group">
            <label class="form-label">اسم الموقع <span class="text-bad">*</span></label>
            <input id="loc-f-name" type="text" class="form-control" placeholder="وصف تعريفي" />
          </div>
          <div class="form-group">
            <label class="form-label">المخزن <span class="text-bad">*</span></label>
            <select id="loc-f-wh" class="form-control"></select>
          </div>
          <div class="form-group">
            <label class="form-label">المنطقة (Zone)</label>
            <input id="loc-f-zone" type="text" class="form-control" placeholder="مثال: A - مبرد / B - جاف" />
          </div>
          <div class="form-group">
            <label class="form-label">الممر (Aisle)</label>
            <input id="loc-f-aisle" type="text" class="form-control" placeholder="مثال: 01 / 02" />
          </div>
          <div class="form-group">
            <label class="form-label">الرف (Rack)</label>
            <input id="loc-f-rack" type="text" class="form-control" placeholder="مثال: R01 / R02" />
          </div>
          <div class="form-group">
            <label class="form-label">الدرج (Bin / Level)</label>
            <input id="loc-f-bin" type="text" class="form-control" placeholder="مثال: B1 / B2 / Top" />
          </div>
          <div class="form-group">
            <label class="form-label">نوع الموقع</label>
            <select id="loc-f-type" class="form-control">
              <option value="storage">تخزين عادي</option>
              <option value="receiving">استقبال بضاعة</option>
              <option value="picking">منطقة التجهيز</option>
              <option value="quarantine">حجر صحي</option>
              <option value="cold">مبرد</option>
              <option value="hazmat">مواد خطرة</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">الطاقة الاستيعابية (وحدة)</label>
            <input id="loc-f-capacity" type="number" class="form-control" placeholder="0 = غير محدودة" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">درجة الحرارة (°C) - اختياري</label>
            <input id="loc-f-temp" type="text" class="form-control" placeholder="مثال: 2-8 أو -18" />
          </div>
          <div class="form-group" style="grid-column:span 2;">
            <label class="form-label">الحالة</label>
            <select id="loc-f-status" class="form-control">
              <option value="active">نشط</option>
              <option value="full">ممتلئ</option>
              <option value="disabled">معطّل</option>
            </select>
          </div>
          <div class="form-group" style="grid-column:span 2;">
            <label class="form-label">ملاحظات</label>
            <textarea id="loc-f-notes" class="form-control" rows="2" placeholder="ملاحظات إضافية..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="INV_LOC.closeModal()">إلغاء</button>
          <button class="btn btn-primary" onclick="INV_LOC.save()">💾 حفظ</button>
        </div>
      </div>
    </div>
  `,await b()}async function b(){try{[r,s]=await Promise.all([u(i.warehouses()),u(i.locations())]);const l=r.map(t=>`<option value="${t.id}">${t.name}</option>`).join(""),o=document.getElementById("loc-filter-wh"),a=document.getElementById("loc-f-wh");o&&(o.innerHTML='<option value="">جميع المخازن</option>'+l),a&&(a.innerHTML=l),c(s),m(s),document.getElementById("loc-loading")?.classList.add("hidden"),document.getElementById("loc-list-wrap")?.classList.remove("hidden")}catch(l){const o=document.getElementById("loc-loading");o&&(o.innerHTML=`<div class="alert bad">${l.message}</div>`)}}function c(l){const o={};r.forEach(e=>o[e.id]=e.name);const a={active:'<span class="badge good">نشط</span>',full:'<span class="badge warn">ممتلئ</span>',disabled:'<span class="badge bad">معطّل</span>'},t=document.getElementById("loc-tbody");if(t){if(l.length===0){t.innerHTML='<tr><td colspan="10" class="dim" style="text-align:center; padding:40px;">لا توجد مواقع مسجلة — اضغط "إضافة موقع جديد"</td></tr>';return}t.innerHTML=l.map(e=>`
    <tr>
      <td class="mono font-bold">${e.code||"—"}</td>
      <td><strong>${e.name||"—"}</strong></td>
      <td>${o[e.warehouseId]||"—"}</td>
      <td class="mono">${e.zone||"—"}</td>
      <td class="mono">${e.aisle||"—"}</td>
      <td class="mono">${e.rack||"—"}</td>
      <td class="mono">${e.bin||"—"}</td>
      <td>${a[e.status]||e.status||"—"}</td>
      <td class="mono">${e.capacity>0?e.capacity+" وحدة":"∞ غير محدودة"}</td>
      <td class="row-actions">
        <button class="btn btn-sm btn-ghost" onclick="INV_LOC.openModal('${e.id}')">✏️</button>
        <button class="btn btn-sm btn-ghost text-bad" onclick="INV_LOC.del('${e.id}', '${(e.name||"").replace(/'/g,"")}')">🗑️</button>
      </td>
    </tr>
  `).join("")}}function m(l){const o=a=>document.getElementById(a);o("loc-kpi-total")&&(o("loc-kpi-total").textContent=l.length,o("loc-kpi-active").textContent=l.filter(a=>a.status==="active").length,o("loc-kpi-full").textContent=l.filter(a=>a.status==="full").length,o("loc-kpi-disabled").textContent=l.filter(a=>a.status==="disabled").length)}window.INV_LOC={openModal(l=null){n=l;const o=document.getElementById("loc-modal"),a=document.getElementById("loc-modal-title");if(o){if(["loc-f-code","loc-f-name","loc-f-zone","loc-f-aisle","loc-f-rack","loc-f-bin","loc-f-capacity","loc-f-temp","loc-f-notes"].forEach(t=>{const e=document.getElementById(t);e&&(e.value="")}),document.getElementById("loc-f-type").value="storage",document.getElementById("loc-f-status").value="active",document.getElementById("loc-f-capacity").value="0",l){const t=s.find(e=>e.id===l);if(!t)return;a.textContent="تعديل موقع التخزين",document.getElementById("loc-f-code").value=t.code||"",document.getElementById("loc-f-name").value=t.name||"",document.getElementById("loc-f-wh").value=t.warehouseId||"",document.getElementById("loc-f-zone").value=t.zone||"",document.getElementById("loc-f-aisle").value=t.aisle||"",document.getElementById("loc-f-rack").value=t.rack||"",document.getElementById("loc-f-bin").value=t.bin||"",document.getElementById("loc-f-type").value=t.type||"storage",document.getElementById("loc-f-capacity").value=t.capacity||"0",document.getElementById("loc-f-temp").value=t.tempRange||"",document.getElementById("loc-f-status").value=t.status||"active",document.getElementById("loc-f-notes").value=t.notes||""}else a.textContent="إضافة موقع تخزين جديد";o.classList.remove("hidden")}},closeModal(){document.getElementById("loc-modal")?.classList.add("hidden"),n=null},async save(){const l=document.getElementById("loc-f-code").value.trim(),o=document.getElementById("loc-f-name").value.trim(),a=document.getElementById("loc-f-wh").value;if(!l||!o||!a){alert("الكود والاسم والمخزن حقول إلزامية");return}const t={code:l,name:o,warehouseId:a,zone:document.getElementById("loc-f-zone").value.trim(),aisle:document.getElementById("loc-f-aisle").value.trim(),rack:document.getElementById("loc-f-rack").value.trim(),bin:document.getElementById("loc-f-bin").value.trim(),type:document.getElementById("loc-f-type").value,capacity:parseInt(document.getElementById("loc-f-capacity").value)||0,tempRange:document.getElementById("loc-f-temp").value.trim(),status:document.getElementById("loc-f-status").value,notes:document.getElementById("loc-f-notes").value.trim()};try{if(n){await v("locations",n,t);const e=s.findIndex(d=>d.id===n);e>-1&&(s[e]={...s[e],...t})}else{const e=await f(i.locations(),t);s.push({id:e.id,...t})}this.closeModal(),c(s),m(s)}catch(e){alert("خطأ: "+e.message)}},async del(l,o){if(confirm(`حذف الموقع "${o}"؟ تأكد أنه لا توجد أصناف مخصصة له.`))try{await p("locations",l),s=s.filter(a=>a.id!==l),c(s),m(s)}catch(a){alert("خطأ في الحذف: "+a.message)}},filterByWarehouse(){const l=document.getElementById("loc-filter-wh").value,o=document.getElementById("loc-search").value.toLowerCase(),a=s.filter(t=>{const e=!l||t.warehouseId===l,d=!o||(t.code||"").toLowerCase().includes(o)||(t.name||"").toLowerCase().includes(o);return e&&d});c(a)},filterList(){this.filterByWarehouse()}};export{k as render};
