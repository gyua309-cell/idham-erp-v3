import{g as p,a as v,u as h,o as x,r as f}from"./index-ClmVJz2W.js";import{e as w}from"./excel-zCoXiaxq.js";import{orderBy as m}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let n=[],y=[],u=[];const c=()=>new Date().toISOString().slice(0,10);async function T(t,e){t.innerHTML=`
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:260px;">
        <input type="text" id="deliv-search" class="input" placeholder="🔍 بحث في الشحنات (المورد/السائق)..." oninput="window.filterDeliveries(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>المورد</label>
        <select id="deliv-sup-filter" onchange="window.filterDeliveries()">
          <option value="">كل الموردين</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="deliv-status-filter" onchange="window.filterDeliveries()">
          <option value="">كل الحالات</option>
          <option value="today">🚚 شحنات اليوم</option>
          <option value="in_transit">🚛 في الطريق للمستودع</option>
          <option value="unloading">📦 قيد التفريغ والاستلام</option>
          <option value="scheduled">📅 مجدولة قادمة</option>
          <option value="received">✅ تم الاستلام بالكامل</option>
          <option value="delayed">⚠️ متأخرة</option>
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportDeliveriesExcel()">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openDeliveryModal()">+ جدولة شحنة مورد جديدة</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Stats -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي الشحنات المجدولة</div>
          <div class="mono" id="deliv-kpi-total" style="font-size:20px; font-weight:900; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1.5px solid rgba(59,130,246,0.3); border-radius:12px;">
          <div style="font-size:11px; color:#3B82F6; font-weight:700;">🚚 شحنات متوقع وصولها اليوم</div>
          <div class="mono" id="deliv-kpi-today" style="font-size:20px; font-weight:900; color:#3B82F6; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#F59E0B; font-weight:700;">🚛 في الطريق / قيد التفريغ</div>
          <div class="mono" id="deliv-kpi-transit" style="font-size:20px; font-weight:900; color:#F59E0B; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">إجمالي الكراتين المتوقعة</div>
          <div class="mono" id="deliv-kpi-cartons" style="font-size:20px; font-weight:900; color:#10B981; margin-top:4px;">0 كرتون</div>
        </div>
      </div>

      <!-- Deliveries Table -->
      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th style="width:105px;">رقم الشحنة</th>
                <th>المورد</th>
                <th style="width:95px;">تاريخ الوصول</th>
                <th style="width:85px;">الوقت</th>
                <th>المستودع المستلم</th>
                <th>الأصناف والكراتين</th>
                <th>بيانات السائق والشاحنة</th>
                <th style="width:115px; text-align:center;">الحالة</th>
                <th style="width:120px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="deliv-tbody">
              <tr><td colspan="9" style="text-align:center; padding:32px;"><span class="spin"></span> جاري تحميل جدول شحنات الموردين...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Delivery Modal -->
    <div class="modal-overlay" id="deliv-modal">
      <div class="modal modal-lg" style="max-width:700px;">
        <div class="modal-header">
          <h3 class="modal-title" id="deliv-modal-title">➕ جدولة شحنة مورد جديدة</h3>
          <button class="modal-close" onclick="closeModal('deliv-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="deliv-edit-id" />
          
          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>المورد صاحب الشحنة *</label>
              <select id="deliv-sup-id" class="input">
                <option value="">-- اختر المورد --</option>
              </select>
            </div>
            <div class="form-group">
              <label>تاريخ الوصول المتوقع *</label>
              <input type="date" id="deliv-date" class="input" value="${c()}" />
            </div>
            <div class="form-group">
              <label>الوقت التقريبي</label>
              <input type="time" id="deliv-time" class="input" value="10:00" />
            </div>
          </div>

          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>المستودع المستلم *</label>
              <select id="deliv-wh-id" class="input">
                <option value="">-- اختر المستودع --</option>
              </select>
            </div>
            <div class="form-group">
              <label>عدد الكراتين / الطبالي التقديري</label>
              <input type="number" id="deliv-cartons" class="input mono" placeholder="500" min="1" />
            </div>
            <div class="form-group">
              <label>حالة الشحنة</label>
              <select id="deliv-status" class="input">
                <option value="scheduled">📅 مجدولة قادمة</option>
                <option value="in_transit">🚛 في الطريق للمستودع</option>
                <option value="unloading">📦 قيد التفريغ والفحص</option>
                <option value="received">✅ تم الاستلام والتخزين</option>
                <option value="delayed">⚠️ متأخرة</option>
              </select>
            </div>
          </div>

          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>اسم السائق</label>
              <input type="text" id="deliv-driver-name" class="input" placeholder="محمد السائق" />
            </div>
            <div class="form-group">
              <label>جوال السائق</label>
              <input type="text" id="deliv-driver-phone" class="input mono" placeholder="05XXXXXXXX" />
            </div>
            <div class="form-group">
              <label>رقم لوحة الشاحنة</label>
              <input type="text" id="deliv-truck-plate" class="input mono" placeholder="أ ب ج 1234" />
            </div>
          </div>

          <div class="form-group mb-12">
            <label>بيان الأصناف المشحونة</label>
            <input type="text" id="deliv-items" class="input" placeholder="مثال: 300 كرتون أرز بنجابي، 200 كرتون زيت ذرة..." />
          </div>

          <div class="form-group">
            <label>ملاحظات المستودع وتجهيز العمالة</label>
            <textarea id="deliv-notes" class="input" rows="2" placeholder="تجهيز رافعة شوكية، تفريغ في المستودع باحة B..."></textarea>
          </div>

          <div id="deliv-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('deliv-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveDelivery()">💾 حفظ الشحنة</button>
        </div>
      </div>
    </div>
  `,await g(),E()}async function g(){try{const[t,e,o]=await Promise.all([p(v.supplierDeliveries?v.supplierDeliveries():"supplierDeliveries",[m("expectedDate","desc")]).catch(()=>[]),p(v.suppliers(),[m("name")]).catch(()=>[]),p(v.warehouses?v.warehouses():"warehouses",[m("name")]).catch(()=>[])]);n=t,y=e,u=o,B(),I(),b()}catch(t){console.warn("Error loading supplier deliveries:",t)}}function I(){const t=c(),e=n.filter(l=>l.expectedDate===t&&l.status!=="received"),o=n.filter(l=>l.status==="in_transit"||l.status==="unloading"),i=n.filter(l=>l.status!=="received").reduce((l,s)=>l+(parseInt(s.cartonsCount)||0),0),d=(l,s)=>{const r=document.getElementById(l);r&&(r.textContent=s)};d("deliv-kpi-total",n.length),d("deliv-kpi-today",e.length),d("deliv-kpi-transit",o.length),d("deliv-kpi-cartons",`${i} كرتون`)}function B(){const t=document.getElementById("deliv-sup-filter"),e=document.getElementById("deliv-sup-id"),o=document.getElementById("deliv-wh-id"),i=y.map(d=>`<option value="${d.id}">${d.name}</option>`).join("");t&&(t.innerHTML='<option value="">كل الموردين</option>'+i),e&&(e.innerHTML='<option value="">-- اختر المورد --</option>'+i),o&&(o.innerHTML='<option value="">-- اختر المستودع --</option>'+u.map(d=>`<option value="${d.id}">${d.name}</option>`).join(""))}function b(t=n){const e=document.getElementById("deliv-tbody");if(!e)return;if(!t.length){e.innerHTML='<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد شحنات مجدولة مسجلة</td></tr>';return}const o={scheduled:'<span class="badge neutral">📅 مجدولة</span>',in_transit:'<span class="badge warn">🚛 في الطريق</span>',unloading:'<span class="badge" style="background:rgba(99,102,241,0.15); color:var(--brand); font-weight:700;">📦 قيد التفريغ</span>',received:'<span class="badge good">✅ تم الاستلام</span>',delayed:'<span class="badge bad">⚠️ متأخرة</span>'};e.innerHTML=t.map(i=>{const d=i.expectedDate===c();return`
      <tr style="${d&&i.status!=="received"?"background:rgba(59,130,246,0.04);":""}">
        <td class="mono font-bold" style="color:var(--brand);">${i.shipmentNumber||i.id}</td>
        <td class="font-bold">${i.supplierName}</td>
        <td class="mono ${d?"font-bold text-brand":"dim"}">${i.expectedDate||"—"}${d?" (اليوم)":""}</td>
        <td class="mono dim">${i.expectedTime||"—"}</td>
        <td>${i.warehouseName||"المستودع الرئيسي"}</td>
        <td style="font-size:12px;">
          <div><b>${i.cartonsCount||0}</b> كرتون</div>
          <div style="font-size:11px; color:var(--text-2);">${i.itemsSummary||"—"}</div>
        </td>
        <td style="font-size:12px;">
          <div>👤 ${i.driverName||"—"} ${i.driverPhone?`<a href="tel:${i.driverPhone}" style="color:var(--brand); text-decoration:none;">(${i.driverPhone})</a>`:""}</div>
          <div style="font-size:11px; color:var(--text-3);">🚛 لوحة: <b>${i.truckPlate||"—"}</b></div>
        </td>
        <td style="text-align:center;">${o[i.status]||o.scheduled}</td>
        <td>
          <div class="row-actions" style="justify-content:center;">
            ${i.driverPhone?`
              <button class="btn btn-icon sm" style="color:#25D366;" onclick="window.open('https://api.whatsapp.com/send?phone=${i.driverPhone.replace(/[^0-9]/g,"")}', '_blank')" title="واتساب السائق">💬</button>
            `:""}
            <button class="btn btn-icon sm btn-ghost" onclick="window.editDelivery('${i.id}')" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deleteDelivery('${i.id}')" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>
    `}).join("")}function E(){window.filterDeliveries=()=>{const t=(document.getElementById("deliv-search")?.value||"").trim().toLowerCase(),e=document.getElementById("deliv-sup-filter")?.value||"",o=document.getElementById("deliv-status-filter")?.value||"",i=c(),d=n.filter(l=>{const s=!t||(l.shipmentNumber||"").toLowerCase().includes(t)||(l.supplierName||"").toLowerCase().includes(t)||(l.driverName||"").toLowerCase().includes(t)||(l.truckPlate||"").toLowerCase().includes(t),r=!e||l.supplierId===e;let a=!0;return o==="today"?a=l.expectedDate===i:o&&(a=l.status===o),s&&r&&a});b(d)},window.openDeliveryModal=()=>{document.getElementById("deliv-edit-id").value="",document.getElementById("deliv-modal-title").textContent="➕ جدولة شحنة مورد جديدة",document.getElementById("deliv-sup-id").value="",document.getElementById("deliv-date").value=c(),document.getElementById("deliv-time").value="10:00",document.getElementById("deliv-wh-id").value=u[0]?.id||"",document.getElementById("deliv-cartons").value="300",document.getElementById("deliv-status").value="scheduled",document.getElementById("deliv-driver-name").value="",document.getElementById("deliv-driver-phone").value="",document.getElementById("deliv-truck-plate").value="",document.getElementById("deliv-items").value="",document.getElementById("deliv-notes").value="",document.getElementById("deliv-modal-err").classList.add("hidden"),openModal("deliv-modal")},window.saveDelivery=async()=>{const t=document.getElementById("deliv-modal-err");t.classList.add("hidden");const e=document.getElementById("deliv-sup-id").value,o=y.find(a=>a.id===e),i=document.getElementById("deliv-wh-id").value,d=u.find(a=>a.id===i),l=document.getElementById("deliv-edit-id").value;if(!e){t.textContent="يرجى اختيار المورد",t.classList.remove("hidden");return}const s=l?void 0:`SHP-${new Date().getFullYear()}-${String(n.length+1).padStart(4,"0")}`,r={supplierId:e,supplierName:o?o.name:"مورد",expectedDate:document.getElementById("deliv-date").value,expectedTime:document.getElementById("deliv-time").value,warehouseId:i||null,warehouseName:d?d.name:"المستودع الرئيسي",cartonsCount:parseInt(document.getElementById("deliv-cartons").value)||0,status:document.getElementById("deliv-status").value,driverName:document.getElementById("deliv-driver-name").value.trim(),driverPhone:document.getElementById("deliv-driver-phone").value.trim(),truckPlate:document.getElementById("deliv-truck-plate").value.trim(),itemsSummary:document.getElementById("deliv-items").value.trim(),notes:document.getElementById("deliv-notes").value.trim()};s&&(r.shipmentNumber=s);try{l?await h("supplierDeliveries",l,r):await x("supplierDeliveries",r),closeModal("deliv-modal"),await g()}catch(a){t.textContent=a.message,t.classList.remove("hidden")}},window.editDelivery=t=>{const e=n.find(o=>o.id===t);e&&(document.getElementById("deliv-edit-id").value=e.id,document.getElementById("deliv-modal-title").textContent="✏️ تعديل شحنة المورد: "+(e.shipmentNumber||e.id),document.getElementById("deliv-sup-id").value=e.supplierId||"",document.getElementById("deliv-date").value=e.expectedDate||c(),document.getElementById("deliv-time").value=e.expectedTime||"10:00",document.getElementById("deliv-wh-id").value=e.warehouseId||"",document.getElementById("deliv-cartons").value=e.cartonsCount||"",document.getElementById("deliv-status").value=e.status||"scheduled",document.getElementById("deliv-driver-name").value=e.driverName||"",document.getElementById("deliv-driver-phone").value=e.driverPhone||"",document.getElementById("deliv-truck-plate").value=e.truckPlate||"",document.getElementById("deliv-items").value=e.itemsSummary||"",document.getElementById("deliv-notes").value=e.notes||"",document.getElementById("deliv-modal-err").classList.add("hidden"),openModal("deliv-modal"))},window.deleteDelivery=async t=>{if(confirm("هل أنت متأكد من حذف هذه الشحنة؟"))try{await f("supplierDeliveries",t),await g()}catch(e){alert("فشل الحذف: "+e.message)}},window.exportDeliveriesExcel=()=>{const t=n.map(e=>({"رقم الشحنة":e.shipmentNumber||e.id,المورد:e.supplierName,"تاريخ الوصول":e.expectedDate,الوقت:e.expectedTime,المستودع:e.warehouseName,الكراتين:e.cartonsCount,السائق:e.driverName,الجوال:e.driverPhone,اللوحة:e.truckPlate,الحالة:e.status}));w(t)}}export{T as render};
