import{u as h,o as y,a as p,r as w,g as f}from"./index-DaYejt0r.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let u=[],s=[],c=null;async function T(o,a){o.innerHTML=`
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">📍 مواقع ورفوف وأدراج التخزين</h1>
        <p class="page-subtitle">إدارة التخطيط الداخلي للمخازن (Zone → Aisle → Rack → Bin)</p>
      </div>

      <div class="filterbar" style="margin-bottom:16px;">
        <button class="btn btn-primary" id="btn-add-location">
          ➕ إضافة موقع جديد
        </button>
        <div style="flex:1;"></div>
        <label style="font-size:12px; color:var(--text-2);">المخزن:</label>
        <select id="loc-filter-wh" class="form-control" style="width:200px; height:36px;">
          <option value="">جميع المخازن</option>
        </select>
        <input id="loc-search" type="text" class="form-control" placeholder="🔍 بحث بالكود أو الاسم..." style="width:220px; height:36px;">
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
    <div id="loc-modal" class="modal-overlay hidden">
      <div class="modal" style="max-width:600px;">
        <div class="modal-header">
          <h2 class="modal-title" id="loc-modal-title">إضافة موقع تخزين</h2>
          <button class="modal-close" id="btn-close-modal">✕</button>
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
          <button class="btn btn-ghost" id="btn-cancel-modal">إلغاء</button>
          <button class="btn btn-primary" id="btn-save-location">💾 حفظ</button>
        </div>
      </div>
    </div>
  `,document.getElementById("btn-add-location").addEventListener("click",()=>b(null)),document.getElementById("btn-close-modal").addEventListener("click",i),document.getElementById("btn-cancel-modal").addEventListener("click",i),document.getElementById("btn-save-location").addEventListener("click",g),document.getElementById("loc-modal").addEventListener("click",l=>{l.target===l.currentTarget&&i()}),document.getElementById("loc-filter-wh").addEventListener("change",r),document.getElementById("loc-search").addEventListener("input",r),window.INV_LOC={openModal:(l=null)=>b(l),closeModal:i,save:g,del:I,filterByWarehouse:r,filterList:r},await k()}function b(o=null){c=o;const a=document.getElementById("loc-modal");if(!a){console.error("[INV_LOC] Modal element not found!");return}const l=document.getElementById("loc-modal-title"),e=(t,n)=>{const d=document.getElementById(t);d&&(d.value=n)};if(e("loc-f-code",""),e("loc-f-name",""),e("loc-f-zone",""),e("loc-f-aisle",""),e("loc-f-rack",""),e("loc-f-bin",""),e("loc-f-capacity","0"),e("loc-f-temp",""),e("loc-f-notes",""),e("loc-f-type","storage"),e("loc-f-status","active"),o){const t=s.find(n=>n.id===o);if(!t)return;l&&(l.textContent="تعديل موقع التخزين"),e("loc-f-code",t.code||""),e("loc-f-name",t.name||""),e("loc-f-wh",t.warehouseId||""),e("loc-f-zone",t.zone||""),e("loc-f-aisle",t.aisle||""),e("loc-f-rack",t.rack||""),e("loc-f-bin",t.bin||""),e("loc-f-type",t.type||"storage"),e("loc-f-capacity",t.capacity||"0"),e("loc-f-temp",t.tempRange||""),e("loc-f-status",t.status||"active"),e("loc-f-notes",t.notes||"")}else l&&(l.textContent="إضافة موقع تخزين جديد");a.classList.remove("hidden")}function i(){document.getElementById("loc-modal")?.classList.add("hidden"),c=null}async function g(){const o=document.getElementById("loc-f-code")?.value.trim()||"",a=document.getElementById("loc-f-name")?.value.trim()||"",l=document.getElementById("loc-f-wh")?.value||"";if(!o||!a||!l){window.showToast?.("الكود والاسم والمخزن حقول إلزامية","error");return}const e={code:o,name:a,warehouseId:l,zone:document.getElementById("loc-f-zone")?.value.trim()||"",aisle:document.getElementById("loc-f-aisle")?.value.trim()||"",rack:document.getElementById("loc-f-rack")?.value.trim()||"",bin:document.getElementById("loc-f-bin")?.value.trim()||"",type:document.getElementById("loc-f-type")?.value||"storage",capacity:parseInt(document.getElementById("loc-f-capacity")?.value)||0,tempRange:document.getElementById("loc-f-temp")?.value.trim()||"",status:document.getElementById("loc-f-status")?.value||"active",notes:document.getElementById("loc-f-notes")?.value.trim()||""},t=document.getElementById("btn-save-location");t&&(t.disabled=!0,t.textContent="⏳ جارٍ الحفظ...");try{if(c){await h("locations",c,e);const n=s.findIndex(d=>d.id===c);n>-1&&(s[n]={...s[n],...e}),window.showToast?.("تم تحديث الموقع بنجاح ✅","success")}else{const n=await y(p.locations(),e);s.push({id:n.id,...e}),window.showToast?.("تم إضافة الموقع بنجاح ✅","success")}i(),m(s),v(s)}catch(n){window.showToast?.("خطأ: "+n.message,"error"),console.error("[INV_LOC] Save error:",n)}finally{t&&(t.disabled=!1,t.textContent="💾 حفظ")}}async function I(o,a){if(confirm(`حذف الموقع "${a}"؟ تأكد أنه لا توجد أصناف مخصصة له.`))try{await w("locations",o),s=s.filter(l=>l.id!==o),m(s),v(s),window.showToast?.("تم حذف الموقع ✅","success")}catch(l){window.showToast?.("خطأ في الحذف: "+l.message,"error")}}function r(){const o=document.getElementById("loc-filter-wh")?.value||"",a=(document.getElementById("loc-search")?.value||"").toLowerCase(),l=s.filter(e=>{const t=!o||e.warehouseId===o,n=!a||(e.code||"").toLowerCase().includes(a)||(e.name||"").toLowerCase().includes(a);return t&&n});m(l)}async function k(){try{[u,s]=await Promise.all([f(p.warehouses()),f(p.locations())]);const o=u.map(e=>`<option value="${e.id}">${e.name}</option>`).join(""),a=document.getElementById("loc-filter-wh"),l=document.getElementById("loc-f-wh");a&&(a.innerHTML='<option value="">جميع المخازن</option>'+o),l&&(l.innerHTML=o),m(s),v(s),document.getElementById("loc-loading")?.classList.add("hidden"),document.getElementById("loc-list-wrap")?.classList.remove("hidden")}catch(o){console.error("[INV_LOC] Load error:",o);const a=document.getElementById("loc-loading");a&&(a.innerHTML=`<div class="alert bad">خطأ في تحميل البيانات: ${o.message}</div>`)}}function m(o){const a={};u.forEach(t=>a[t.id]=t.name);const l={active:'<span class="badge good">نشط</span>',full:'<span class="badge warn">ممتلئ</span>',disabled:'<span class="badge bad">معطّل</span>'},e=document.getElementById("loc-tbody");if(e){if(o.length===0){e.innerHTML='<tr><td colspan="10" class="dim" style="text-align:center; padding:40px;">لا توجد مواقع مسجلة — اضغط "إضافة موقع جديد"</td></tr>';return}e.innerHTML=o.map(t=>`
    <tr>
      <td class="mono font-bold">${t.code||"—"}</td>
      <td><strong>${t.name||"—"}</strong></td>
      <td>${a[t.warehouseId]||"—"}</td>
      <td class="mono">${t.zone||"—"}</td>
      <td class="mono">${t.aisle||"—"}</td>
      <td class="mono">${t.rack||"—"}</td>
      <td class="mono">${t.bin||"—"}</td>
      <td>${l[t.status]||t.status||"—"}</td>
      <td class="mono">${t.capacity>0?t.capacity+" وحدة":"∞ غير محدودة"}</td>
      <td class="row-actions">
        <button class="btn btn-sm btn-ghost" onclick="INV_LOC.openModal('${t.id}')">✏️</button>
        <button class="btn btn-sm btn-ghost text-bad" onclick="INV_LOC.del('${t.id}', '${(t.name||"").replace(/'/g,"")}')">🗑️</button>
      </td>
    </tr>
  `).join("")}}function v(o){const a=l=>document.getElementById(l);a("loc-kpi-total")&&(a("loc-kpi-total").textContent=o.length,a("loc-kpi-active").textContent=o.filter(l=>l.status==="active").length,a("loc-kpi-full").textContent=o.filter(l=>l.status==="full").length,a("loc-kpi-disabled").textContent=o.filter(l=>l.status==="disabled").length)}export{T as render};
