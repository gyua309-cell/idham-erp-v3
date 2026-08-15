import{g as A,C as h,p as q,f as I,u as k,n as z,r as L,d as F,a as H,k as D}from"./index-HrCilPJ3.js";import{orderBy as g,query as T,collection as P,where as M,limit as j,getDocs as W}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import{s as C,u as O,d as V}from"./coa-connector-Bwq94sQ7.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let u=[],x=[],S="cards",w="",E="active",b="";const v={Main:{label:"رئيسي",icon:"🏭",color:"#5B7FFF",bg:"#5B7FFF18"},Branch:{label:"فرع",icon:"🏪",color:"#22C55E",bg:"#22C55E18"},Distribution:{label:"توزيع",icon:"🚛",color:"#F59E0B",bg:"#F59E0B18"},Transit:{label:"بضاعة في الطريق",icon:"🔄",color:"#8B5CF6",bg:"#8B5CF618"},Returns:{label:"مرتجعات",icon:"↩️",color:"#EF4444",bg:"#EF444418"},Damaged:{label:"تالف / منتهي",icon:"⚠️",color:"#DC2626",bg:"#DC262618"},Consignment:{label:"أمانات",icon:"🤝",color:"#06B6D4",bg:"#06B6D418"},Frozen:{label:"مجمدات",icon:"❄️",color:"#3B82F6",bg:"#3B82F618"},Chilled:{label:"مبردات",icon:"🌡️",color:"#0EA5E9",bg:"#0EA5E918"},Dry:{label:"مواد جافة",icon:"📦",color:"#92400E",bg:"#92400E18"},Vehicle:{label:"سيارة توزيع",icon:"🚐",color:"#059669",bg:"#05966918"},Virtual:{label:"افتراضي",icon:"☁️",color:"#6B7280",bg:"#6B728018"}},N={ambient:"درجة الغرفة (Ambient)",chilled:"تبريد +1°م إلى +4°م",frozen:"تجميد −18°م وأقل"};async function ae(e,a){e.innerHTML=R(),await Promise.all([U(),B()]),Q()}function R(){return`
  <!-- ── Filter Bar ── -->
  <div class="filterbar no-print">
    <div class="search-bar" style="max-width:260px;">
      <input type="text" id="wh-search" class="input" placeholder="🔍 بحث بالاسم أو الكود…" />
    </div>
    <div class="filterbar-divider"></div>
    <div class="filter-select-group">
      <label>النوع</label>
      <select id="wh-type-filter" class="input" onchange="filterWarehouses()">
        <option value="">جميع الأنواع</option>
        ${Object.entries(v).map(([a,o])=>`<option value="${a}">${o.icon} ${o.label}</option>`).join("")}
      </select>
    </div>
    <div class="filter-select-group">
      <label>الحالة</label>
      <select id="wh-status-filter" class="input" onchange="filterWarehouses()">
        <option value="active">نشطة</option>
        <option value="">الكل</option>
        <option value="inactive">معطلة</option>
      </select>
    </div>
    <div style="margin-right:auto; display:flex; gap:10px; align-items:center;">
      <div class="view-toggle">
        <button id="btn-view-cards" class="btn btn-sm btn-secondary active-view" onclick="setWhView('cards')">⊞ بطاقات</button>
        <button id="btn-view-table" class="btn btn-sm btn-secondary" onclick="setWhView('table')">☰ جدول</button>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="exportWarehouses()">📤 تصدير</button>
      <button class="btn btn-primary" onclick="openWarehouseModal()">＋ مخزن جديد</button>
    </div>
  </div>

  <!-- ── Stats Bar ── -->
  <div id="wh-stats-bar" style="display:grid; grid-template-columns:repeat(4,1fr); gap:14px; padding:16px 20px 0; direction:rtl;">
    <div class="stat-mini-card" style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:16px; text-align:center;">
      <div style="font-size:24px; font-weight:700; color:var(--brand);" id="stat-total-wh">—</div>
      <div style="font-size:12px; color:var(--text-2);">إجمالي المخازن</div>
    </div>
    <div class="stat-mini-card" style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:16px; text-align:center;">
      <div style="font-size:24px; font-weight:700; color:#22C55E;" id="stat-active-wh">—</div>
      <div style="font-size:12px; color:var(--text-2);">مخازن نشطة</div>
    </div>
    <div class="stat-mini-card" style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:16px; text-align:center;">
      <div style="font-size:20px; font-weight:700; color:#F59E0B;" id="stat-total-value">—</div>
      <div style="font-size:12px; color:var(--text-2);">إجمالي قيمة المخزون (ر.س)</div>
    </div>
    <div class="stat-mini-card" style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:16px; text-align:center;">
      <div style="font-size:20px; font-weight:700; color:#8B5CF6;" id="stat-locations">—</div>
      <div style="font-size:12px; color:var(--text-2);">مواقع تخزين داخلية</div>
    </div>
  </div>

  <!-- ── Content Area ── -->
  <div class="page-content" id="wh-content-area" style="padding:16px 20px;">
    <div class="page-loading"><div class="loading-spinner"></div></div>
  </div>

  <!-- ═══════════════════ WAREHOUSE MODAL ═══════════════════ -->
  <div class="modal-overlay" id="wh-modal">
    <div class="modal" style="max-width:780px; max-height:90vh; overflow-y:auto;">
      <div class="modal-header">
        <h3 class="modal-title" id="wh-modal-title">🏭 إضافة مخزن جديد</h3>
        <button class="modal-close" onclick="closeModal('wh-modal')">×</button>
      </div>
      <div class="modal-body" style="padding:24px;">
        <input type="hidden" id="wh-edit-id" />

        <!-- Section 1: Basic Info -->
        <div class="wh-section-title">📋 المعلومات الأساسية</div>
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group">
            <label>كود المخزن (Prefix) <span class="req">*</span></label>
            <input type="text" id="wh-prefix" class="input mono" placeholder="WH-MAIN" style="text-transform:uppercase;" />
          </div>
          <div class="form-group" style="grid-column:span 2;">
            <label>اسم المخزن <span class="req">*</span></label>
            <input type="text" id="wh-name" class="input" placeholder="المستودع الرئيسي للمواد الجافة" />
          </div>
        </div>

        <div class="grid-3 gap-16 mb-16">
          <div class="form-group">
            <label>نوع المخزن <span class="req">*</span></label>
            <select id="wh-type" class="input">
              ${Object.entries(v).map(([a,o])=>`<option value="${a}">${o.icon} ${o.label}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>التحكم بالحرارة <span class="req">*</span></label>
            <select id="wh-temp" class="input">
              <option value="ambient">🌡️ درجة الغرفة (Ambient)</option>
              <option value="chilled">❄️ تبريد (+1 إلى +4°م)</option>
              <option value="frozen">🧊 تجميد (−18°م وأقل)</option>
            </select>
          </div>
          <div class="form-group">
            <label>الحالة</label>
            <select id="wh-active" class="input">
              <option value="1">✅ نشط</option>
              <option value="0">⛔ معطل</option>
            </select>
          </div>
        </div>

        <!-- Section 2: Location & People -->
        <div class="wh-section-title">📍 الموقع والمسؤولون</div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group">
            <label>أمين المستودع (المسؤول)</label>
            <input type="text" id="wh-manager" class="input" placeholder="اسم أمين المخزن" />
          </div>
          <div class="form-group">
            <label>رقم الهاتف</label>
            <input type="text" id="wh-phone" class="input mono" placeholder="05xxxxxxxx" />
          </div>
        </div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group">
            <label>الموقع / العنوان</label>
            <input type="text" id="wh-location" class="input" placeholder="المنطقة الصناعية، الرياض" />
          </div>
          <div class="form-group">
            <label>ساعات العمل</label>
            <input type="text" id="wh-hours" class="input" placeholder="8:00 صباحاً — 5:00 مساءً" />
          </div>
        </div>

        <!-- Section 3: Capacity -->
        <div class="wh-section-title">📐 الطاقة الاستيعابية</div>
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group">
            <label>السعة الكلية (م³)</label>
            <input type="number" id="wh-capacity" class="input mono" placeholder="5000" />
          </div>
          <div class="form-group">
            <label>عدد الأرفف</label>
            <input type="number" id="wh-shelves" class="input mono" placeholder="50" />
          </div>
          <div class="form-group">
            <label>عدد الممرات</label>
            <input type="number" id="wh-aisles" class="input mono" placeholder="10" />
          </div>
        </div>

        <!-- Section 4: Accounting -->
        <div class="wh-section-title">💼 الربط المحاسبي</div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group">
            <label>حساب المخزون <span class="req">*</span></label>
            <select id="wh-acc-inv" class="input"><option value="">اختر الحساب…</option></select>
          </div>
          <div class="form-group">
            <label>حساب تسويات الفروق</label>
            <select id="wh-acc-var" class="input"><option value="">اختر الحساب…</option></select>
          </div>
        </div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group">
            <label>مركز التكلفة</label>
            <input type="text" id="wh-cost-center" class="input mono" placeholder="CC-MAIN-01" />
          </div>
          <div class="form-group">
            <label>ملاحظات</label>
            <input type="text" id="wh-notes" class="input" placeholder="أي ملاحظات إضافية…" />
          </div>
        </div>

        <!-- Section 5: Business Rules -->
        <div class="wh-section-title">⚙️ قواعد العمل</div>
        <div class="grid-2 gap-16 mb-16">
          <label class="checkbox-label">
            <input type="checkbox" id="wh-allow-negative" />
            <span>السماح بمخزون سالب (غير مُوصى به)</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="wh-require-serial" />
            <span>إلزامية إدخال الأرقام التسلسلية</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="wh-require-batch" checked />
            <span>إلزامية إدخال رقم الدفعة</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="wh-require-expiry" checked />
            <span>إلزامية إدخال تاريخ الانتهاء</span>
          </label>
        </div>

        <div id="wh-error" class="alert bad hidden" style="margin-top:16px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('wh-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="saveWarehouse()" id="save-wh-btn">💾 حفظ المخزن</button>
      </div>
    </div>
  </div>

  <!-- ═══════════════════ LOCATIONS MODAL ═══════════════════ -->
  <div class="modal-overlay" id="wh-locations-modal">
    <div class="modal" style="max-width:700px; max-height:90vh; overflow-y:auto;">
      <div class="modal-header">
        <h3 class="modal-title" id="wh-loc-title">📍 مواقع التخزين الداخلية</h3>
        <button class="modal-close" onclick="closeModal('wh-locations-modal')">×</button>
      </div>
      <div class="modal-body" style="padding:20px;">
        <input type="hidden" id="wh-loc-warehouse-id" />
        <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:10px; padding:16px; margin-bottom:16px;">
          <div class="grid-4 gap-12 mb-12">
            <div class="form-group">
              <label>المنطقة (Zone)</label>
              <input type="text" id="loc-zone" class="input" placeholder="A, B, C…" />
            </div>
            <div class="form-group">
              <label>الممر (Aisle)</label>
              <input type="text" id="loc-aisle" class="input mono" placeholder="01" />
            </div>
            <div class="form-group">
              <label>الرف (Shelf)</label>
              <input type="text" id="loc-shelf" class="input mono" placeholder="03" />
            </div>
            <div class="form-group">
              <label>المستوى (Level)</label>
              <input type="text" id="loc-level" class="input mono" placeholder="01" />
            </div>
          </div>
          <div class="grid-2 gap-12">
            <div class="form-group">
              <label>اسم الموقع (مخصص)</label>
              <input type="text" id="loc-name" class="input" placeholder="مثال: منطقة أ — رف 3 مستوى 1" />
            </div>
            <div class="form-group">
              <label>النوع</label>
              <select id="loc-type" class="input">
                <option value="shelf">رف (Shelf)</option>
                <option value="zone">منطقة (Zone)</option>
                <option value="aisle">ممر (Aisle)</option>
                <option value="bin">خانة (Bin)</option>
                <option value="floor">أرضية (Floor)</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="addLocation()" style="margin-top:12px;">＋ إضافة موقع</button>
        </div>
        <div class="table-container">
          <table class="data-dense">
            <thead><tr>
              <th>كود الموقع</th><th>الاسم</th><th>المنطقة</th><th>الممر</th><th>الرف</th><th>المستوى</th><th>النوع</th><th></th>
            </tr></thead>
            <tbody id="wh-locations-tbody">
              <tr><td colspan="8" style="text-align:center;padding:20px;color:var(--text-2);">لا توجد مواقع محددة بعد</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══════════════════ WAREHOUSE DETAILS MODAL ═══════════════════ -->
  <div class="modal-overlay" id="wh-detail-modal">
    <div class="modal" style="max-width:860px; max-height:90vh; overflow-y:auto;">
      <div class="modal-header">
        <h3 class="modal-title" id="wh-detail-title">تفاصيل المخزن</h3>
        <button class="modal-close" onclick="closeModal('wh-detail-modal')">×</button>
      </div>
      <div class="modal-body" id="wh-detail-body" style="padding:24px;">
        <div class="page-loading"><div class="loading-spinner"></div></div>
      </div>
    </div>
  </div>
`}async function U(){try{x=await A(h.chartOfAccounts(),[g("code")]);const e=x.filter(t=>t.type==="asset"||t.type==="assets"),a=document.getElementById("wh-acc-inv"),o=document.getElementById("wh-acc-var");a&&(a.innerHTML='<option value="">اختر حساب المخزون…</option>'+e.map(t=>`<option value="${t.accountId||t.id}">${t.code} — ${t.name}</option>`).join("")),o&&(o.innerHTML='<option value="">اختر حساب التسويات…</option>'+x.map(t=>`<option value="${t.accountId||t.id}">${t.code} — ${t.name}</option>`).join(""))}catch{}}async function B(){const e=document.getElementById("wh-content-area");if(e)try{u=await A(h.warehouses(),[g("barcodePrefix")]),_(),y()}catch(a){e.innerHTML=`<div class="alert bad">${a.message}</div>`}}function _(){const e=u.filter(o=>o.isActive!==!1);document.getElementById("stat-total-wh").textContent=u.length,document.getElementById("stat-active-wh").textContent=e.length;const a=u.reduce((o,t)=>o+(t.stockValue||0),0);document.getElementById("stat-total-value").textContent=a>0?I(a):"—",document.getElementById("stat-locations").textContent=u.reduce((o,t)=>o+(t.locationCount||0),0)||"—"}function y(){const e=document.getElementById("wh-content-area");if(!e)return;let a=u.filter(o=>{const t=E==="active"?o.isActive!==!1:E==="inactive"?o.isActive===!1:!0,i=!w||o.type===w,r=!b||(o.name||"").includes(b)||(o.barcodePrefix||"").toLowerCase().includes(b.toLowerCase());return t&&i&&r});if(a.length===0){e.innerHTML=`<div style="text-align:center; padding:60px; color:var(--text-2);">
      <div style="font-size:48px; margin-bottom:12px;">🏭</div>
      <div style="font-size:18px; font-weight:600; margin-bottom:8px;">لا توجد مخازن مطابقة</div>
      <div style="font-size:13px; margin-bottom:20px;">أضف مخزنك الأول لبدء إدارة المخزون</div>
      <button class="btn btn-primary" onclick="openWarehouseModal()">＋ إضافة مخزن جديد</button>
    </div>`;return}S==="cards"?e.innerHTML=`<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:18px; direction:rtl;">
      ${a.map(o=>Y(o)).join("")}
    </div>`:e.innerHTML=K(a)}function Y(e){const a=v[e.type]||v.Virtual,o=e.isActive!==!1,t=e.storageTemperature==="frozen"?"🧊":e.storageTemperature==="chilled"?"❄️":"🌡️";return N[e.storageTemperature],`
  <div class="wh-card" style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:16px; overflow:hidden; transition:box-shadow .2s, transform .2s; cursor:pointer;"
       onmouseenter="this.style.boxShadow='0 8px 32px rgba(0,0,0,.18)'; this.style.transform='translateY(-2px)'"
       onmouseleave="this.style.boxShadow=''; this.style.transform=''">
    <!-- Header -->
    <div style="background:${a.bg}; border-bottom:1px solid ${a.color}22; padding:16px 18px; display:flex; align-items:center; justify-content:space-between;">
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="width:44px; height:44px; background:${a.color}22; border:2px solid ${a.color}44; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px;">${a.icon}</div>
        <div>
          <div style="font-weight:700; font-size:15px; color:var(--text-1);">${e.name}</div>
          <div style="font-size:11px; color:${a.color}; font-family:'IBM Plex Mono',monospace; font-weight:600;">${e.barcodePrefix||"—"}</div>
        </div>
      </div>
      <span class="badge" style="background:${a.color}22; color:${a.color}; border:1px solid ${a.color}44; font-size:10px;">${a.label}</span>
    </div>
    <!-- Body -->
    <div style="padding:16px 18px;">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
        <div style="background:var(--bg-3); border-radius:8px; padding:10px;">
          <div style="font-size:10px; color:var(--text-2); margin-bottom:3px;">المسؤول</div>
          <div style="font-size:13px; font-weight:600;">${e.manager||"—"}</div>
        </div>
        <div style="background:var(--bg-3); border-radius:8px; padding:10px;">
          <div style="font-size:10px; color:var(--text-2); margin-bottom:3px;">${t} درجة الحرارة</div>
          <div style="font-size:12px; font-weight:600;">${e.storageTemperature==="frozen"?"تجميد −18°م":e.storageTemperature==="chilled"?"تبريد +1→+4°م":"درجة الغرفة"}</div>
        </div>
        <div style="background:var(--bg-3); border-radius:8px; padding:10px;">
          <div style="font-size:10px; color:var(--text-2); margin-bottom:3px;">📍 الموقع</div>
          <div style="font-size:12px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${e.location||"—"}</div>
        </div>
        <div style="background:var(--bg-3); border-radius:8px; padding:10px;">
          <div style="font-size:10px; color:var(--text-2); margin-bottom:3px;">📐 الطاقة</div>
          <div style="font-size:13px; font-weight:600;">${e.capacity?e.capacity+" م³":"—"}</div>
        </div>
      </div>
      <!-- KPIs if available -->
      ${e.stockValue||e.itemCount?`
      <div style="border-top:1px solid var(--border-soft); padding-top:12px; margin-bottom:12px; display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div style="text-align:center;">
          <div style="font-size:14px; font-weight:700; color:var(--brand);">${I(e.stockValue||0)}</div>
          <div style="font-size:10px; color:var(--text-2);">قيمة المخزون</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:14px; font-weight:700; color:#22C55E;">${e.itemCount||0}</div>
          <div style="font-size:10px; color:var(--text-2);">صنف</div>
        </div>
      </div>`:""}
      <!-- Footer -->
      <div style="display:flex; align-items:center; justify-content:space-between; padding-top:4px;">
        <span class="badge ${o?"good":"bad"}" style="font-size:10px;">${o?"✅ نشط":"⛔ معطل"}</span>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); openWhDetails('${e.id}')" title="التفاصيل">🔍</button>
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); openWhLocations('${e.id}','${m(e.name)}')" title="المواقع الداخلية">📍</button>
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); editWarehouse('${e.id}')" title="تعديل">✏️</button>
          <button class="btn btn-sm btn-ghost text-bad" onclick="event.stopPropagation(); deleteWarehouse('${e.id}','${m(e.name)}')" title="حذف">🗑️</button>
        </div>
      </div>
    </div>
  </div>`}function K(e){return`<div class="card"><div class="table-container"><table class="data-dense">
    <thead><tr>
      <th>الكود</th><th>اسم المخزن</th><th>النوع</th><th>الحرارة</th><th>المسؤول</th>
      <th>السعة</th><th>مركز التكلفة</th><th>ساعات العمل</th><th>الحالة</th><th style="width:120px;"></th>
    </tr></thead>
    <tbody>${e.map(o=>{const t=v[o.type]||v.Virtual,i=o.isActive!==!1;return`<tr>
      <td class="mono font-bold" style="color:${t.color};">${o.barcodePrefix||"—"}</td>
      <td><div style="display:flex;align-items:center;gap:8px;"><span style="font-size:18px;">${t.icon}</span><div><div style="font-weight:600;">${o.name}</div><div style="font-size:11px;color:var(--text-2);">${o.location||""}</div></div></div></td>
      <td><span class="badge" style="background:${t.bg};color:${t.color};border:1px solid ${t.color}33;font-size:10px;">${t.label}</span></td>
      <td>${o.storageTemperature==="frozen"?"🧊 تجميد":o.storageTemperature==="chilled"?"❄️ تبريد":"🌡️ جاف"}</td>
      <td>${o.manager||"—"}</td>
      <td class="mono">${o.capacity?o.capacity+" م³":"—"}</td>
      <td class="mono dim">${o.costCenter||"—"}</td>
      <td>${o.workingHours||"—"}</td>
      <td><span class="badge ${i?"good":"bad"}" style="font-size:10px;">${i?"نشط":"معطل"}</span></td>
      <td>
        <div class="row-actions">
          <button class="btn btn-icon sm btn-ghost" onclick="openWhDetails('${o.id}')" title="تفاصيل">🔍</button>
          <button class="btn btn-icon sm btn-ghost" onclick="openWhLocations('${o.id}','${m(o.name)}')" title="مواقع">📍</button>
          <button class="btn btn-icon sm btn-ghost" onclick="editWarehouse('${o.id}')" title="تعديل">✏️</button>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteWarehouse('${o.id}','${m(o.name)}')" title="حذف">🗑️</button>
        </div>
      </td>
    </tr>`}).join("")}</tbody>
  </table></div></div>`}function m(e){return(e||"").replace(/'/g,"\\'")}function Q(){const e=document.getElementById("wh-search");e&&e.addEventListener("input",q(()=>{b=e.value.trim(),y()},250))}window.setWhView=e=>{S=e,document.querySelectorAll(".active-view").forEach(a=>a.classList.remove("active-view")),document.getElementById("btn-view-"+e)?.classList.add("active-view"),y()};window.filterWarehouses=()=>{w=document.getElementById("wh-type-filter")?.value||"",E=document.getElementById("wh-status-filter")?.value||"",y()};window.openWarehouseModal=(e=null)=>{const a=!!e;document.getElementById("wh-edit-id").value=e?.id||"",document.getElementById("wh-modal-title").textContent=a?"✏️ تعديل مخزن":"🏭 إضافة مخزن جديد",document.getElementById("wh-prefix").value=e?.barcodePrefix||"",document.getElementById("wh-name").value=e?.name||"",document.getElementById("wh-type").value=e?.type||"Main",document.getElementById("wh-temp").value=e?.storageTemperature||"ambient",document.getElementById("wh-active").value=e?.isActive===!1?"0":"1",document.getElementById("wh-manager").value=e?.manager||"",document.getElementById("wh-phone").value=e?.phone||"",document.getElementById("wh-location").value=e?.location||"",document.getElementById("wh-hours").value=e?.workingHours||"",document.getElementById("wh-capacity").value=e?.capacity||"",document.getElementById("wh-shelves").value=e?.shelves||"",document.getElementById("wh-aisles").value=e?.aisles||"",document.getElementById("wh-acc-inv").value=e?.accountId||"",document.getElementById("wh-acc-var").value=e?.varianceAccountId||"",document.getElementById("wh-cost-center").value=e?.costCenter||"",document.getElementById("wh-notes").value=e?.notes||"",document.getElementById("wh-allow-negative").checked=e?.allowNegative||!1,document.getElementById("wh-require-serial").checked=e?.requireSerial||!1,document.getElementById("wh-require-batch").checked=e?.requireBatch!==!1,document.getElementById("wh-require-expiry").checked=e?.requireExpiry!==!1,document.getElementById("wh-error").classList.add("hidden"),openModal("wh-modal")};window.editWarehouse=e=>{const a=u.find(o=>o.id===e);a&&openWarehouseModal(a)};window.saveWarehouse=async()=>{const e=document.getElementById("wh-error");e.classList.add("hidden");const a=document.getElementById("wh-edit-id").value,o=document.getElementById("wh-prefix").value.trim().toUpperCase(),t=document.getElementById("wh-name").value.trim(),i=document.getElementById("wh-type").value,r=document.getElementById("wh-acc-inv").value;if(!o){e.textContent="يرجى إدخال كود المخزن",e.classList.remove("hidden");return}if(!t){e.textContent="يرجى إدخال اسم المخزن",e.classList.remove("hidden");return}if(!i){e.textContent="يرجى تحديد نوع المخزن",e.classList.remove("hidden");return}const d={barcodePrefix:o,name:t,type:i,storageTemperature:document.getElementById("wh-temp").value,isActive:document.getElementById("wh-active").value==="1",manager:document.getElementById("wh-manager").value.trim(),phone:document.getElementById("wh-phone").value.trim(),location:document.getElementById("wh-location").value.trim(),workingHours:document.getElementById("wh-hours").value.trim(),capacity:parseFloat(document.getElementById("wh-capacity").value)||null,shelves:parseInt(document.getElementById("wh-shelves").value)||null,aisles:parseInt(document.getElementById("wh-aisles").value)||null,accountId:r,varianceAccountId:document.getElementById("wh-acc-var").value,costCenter:document.getElementById("wh-cost-center").value.trim(),notes:document.getElementById("wh-notes").value.trim(),allowNegative:document.getElementById("wh-allow-negative").checked,requireSerial:document.getElementById("wh-require-serial").checked,requireBatch:document.getElementById("wh-require-batch").checked,requireExpiry:document.getElementById("wh-require-expiry").checked},p=document.getElementById("save-wh-btn");p.disabled=!0,p.textContent="جارٍ الحفظ…";try{if(a){const l=u.find(n=>n.id===a);let c=r||l?.accountId,s=l?.accountCode||null;if(c)l&&l.name!==t&&c===l.accountId&&await O(c,t);else{const n=await C("warehouses",a,t,{type:i});n&&(c=n.accountId,s=n.accountCode)}d.accountId=c,d.inventoryAccountId=c,s&&(d.accountCode=s,d.inventoryAccountCode=s),await k("warehouses",a,d),window.showToast("✅ تم تحديث المخزن بنجاح","success")}else{const l=await z(h.warehouses(),d);let c=r,s=null;if(!c){const n=await C("warehouses",l,t,{type:i});n&&(c=n.accountId,s=n.accountCode,await k("warehouses",l,{accountId:c,accountCode:s,inventoryAccountId:c,inventoryAccountCode:s}))}window.showToast("✅ تم إضافة المخزن بنجاح","success")}closeModal("wh-modal"),await B()}catch(l){e.textContent=l.message,e.classList.remove("hidden")}finally{p.disabled=!1,p.textContent="💾 حفظ المخزن"}};window.deleteWarehouse=async(e,a)=>{if(await window.showConfirm(`هل أنت متأكد من حذف المخزن "${a}"؟
تأكد أنه لا توجد حركات مرتبطة به.`,"حذف المخزن"))try{const o=u.find(t=>t.id===e);o&&o.accountId&&await V("warehouses",e,o.accountId),await L("warehouses",e),window.showToast("تم الحذف بنجاح","success"),await B()}catch(o){window.showToast(o.message,"error")}};window.openWhDetails=async e=>{const a=document.getElementById("wh-detail-body"),o=document.getElementById("wh-detail-title");a.innerHTML='<div class="page-loading"><div class="loading-spinner"></div></div>',openModal("wh-detail-modal");const t=u.find(d=>d.id===e);if(!t){a.innerHTML='<div class="alert bad">المخزن غير موجود</div>';return}const i=v[t.type]||v.Virtual;o.innerHTML=`${i.icon} ${t.name} <span class="mono" style="font-size:13px;color:${i.color};">(${t.barcodePrefix})</span>`;let r="";try{const d=T(P(F,`companies/${H}/stockLedger`),M("warehouseId","==",e),g("productName"),j(100)),p=await W(d),l={};p.docs.forEach(s=>{const n=s.data();l[n.productId]||(l[n.productId]={name:n.productName,sku:n.sku,qty:0,val:0}),l[n.productId].qty+=(n.type==="in"?1:-1)*(n.qty||0),l[n.productId].val+=(n.type==="in"?1:-1)*(n.qty||0)*(n.cost||0)});const c=Object.values(l).filter(s=>s.qty!==0);r=c.length?c.map(s=>`<tr>
      <td class="mono dim">${s.sku||"—"}</td>
      <td>${s.name}</td>
      <td class="mono ${s.qty<0?"text-bad":""}">${D(s.qty)}</td>
      <td class="mono">${I(Math.max(0,s.val))}</td>
    </tr>`).join(""):'<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-2);">لا توجد حركات مسجلة</td></tr>'}catch{r='<tr><td colspan="4" class="text-bad" style="text-align:center;">تعذّر تحميل البيانات</td></tr>'}a.innerHTML=`
    <!-- Info Grid -->
    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:24px;">
      ${[["النوع",i.label,i.color],["درجة الحرارة",t.storageTemperature==="frozen"?"🧊 تجميد":t.storageTemperature==="chilled"?"❄️ تبريد":"🌡️ جاف","#0EA5E9"],["الحالة",t.isActive!==!1?"✅ نشط":"⛔ معطل",t.isActive!==!1?"#22C55E":"#EF4444"],["المسؤول",t.manager||"—","#8B5CF6"],["الموقع",t.location||"—","#F59E0B"],["ساعات العمل",t.workingHours||"—","#6B7280"],["الطاقة الاستيعابية",t.capacity?t.capacity+" م³":"—","#5B7FFF"],["عدد الأرفف",t.shelves||"—","#059669"],["مركز التكلفة",t.costCenter||"—","#92400E"]].map(([d,p,l])=>`
        <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:10px; padding:14px;">
          <div style="font-size:11px; color:var(--text-2); margin-bottom:4px;">${d}</div>
          <div style="font-weight:600; color:${l}; font-size:14px;">${p}</div>
        </div>`).join("")}
    </div>

    <!-- Stock Table -->
    <div class="wh-section-title" style="margin-bottom:12px;">📦 المخزون الحالي في هذا المخزن</div>
    <div class="table-container">
      <table class="data-dense">
        <thead><tr><th>SKU</th><th>الصنف</th><th>الكمية</th><th>القيمة (ر.س)</th></tr></thead>
        <tbody>${r}</tbody>
      </table>
    </div>
    <div style="margin-top:16px; display:flex; gap:10px;">
      <button class="btn btn-secondary btn-sm" onclick="openWhLocations('${e}','${m(t.name)}')">📍 المواقع الداخلية</button>
      <button class="btn btn-secondary btn-sm" onclick="editWarehouse('${e}'); closeModal('wh-detail-modal')">✏️ تعديل المخزن</button>
    </div>
  `};let f=[];window.openWhLocations=async(e,a)=>{document.getElementById("wh-loc-warehouse-id").value=e,document.getElementById("wh-loc-title").textContent=`📍 مواقع التخزين — ${a}`,["loc-zone","loc-aisle","loc-shelf","loc-level","loc-name"].forEach(o=>{const t=document.getElementById(o);t&&(t.value="")}),openModal("wh-locations-modal"),await $(e)};async function $(e){const a=document.getElementById("wh-locations-tbody");if(a)try{const o=T(h.inventoryLocations(),M("warehouseId","==",e),g("code"));if(f=(await W(o)).docs.map(i=>({id:i.id,...i.data()})),!f.length){a.innerHTML='<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--text-2);">لا توجد مواقع محددة — أضف موقعاً جديداً</td></tr>';return}a.innerHTML=f.map(i=>`<tr>
      <td class="mono font-bold">${i.code||"—"}</td>
      <td>${i.name||"—"}</td>
      <td>${i.zone||"—"}</td>
      <td>${i.aisle||"—"}</td>
      <td>${i.shelf||"—"}</td>
      <td>${i.level||"—"}</td>
      <td><span class="badge neutral" style="font-size:10px;">${i.type||"shelf"}</span></td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteLocation('${i.id}')">🗑️</button></td>
    </tr>`).join("")}catch(o){a.innerHTML=`<tr><td colspan="8" class="text-bad">${o.message}</td></tr>`}}window.addLocation=async()=>{const e=document.getElementById("wh-loc-warehouse-id").value,a=document.getElementById("loc-zone").value.trim().toUpperCase(),o=document.getElementById("loc-aisle").value.trim().padStart(2,"0"),t=document.getElementById("loc-shelf").value.trim().padStart(2,"0"),i=document.getElementById("loc-level").value.trim().padStart(2,"0"),r=document.getElementById("loc-name").value.trim(),d=document.getElementById("loc-type").value,p=[a,o,t,i].filter(Boolean).join("-")||r;if(!p){window.showToast("يرجى إدخال بيانات الموقع","error");return}try{await z(h.inventoryLocations(),{warehouseId:e,code:p,name:r||p,zone:a,aisle:o,shelf:t,level:i,type:d,isActive:!0}),window.showToast("✅ تم إضافة الموقع","success"),await $(e)}catch(l){window.showToast(l.message,"error")}};window.deleteLocation=async e=>{const a=document.getElementById("wh-loc-warehouse-id").value;if(await window.showConfirm("هل تريد حذف هذا الموقع؟","حذف موقع"))try{await L("inventoryLocations",e),window.showToast("تم الحذف","success"),await $(a)}catch(o){window.showToast(o.message,"error")}};window.exportWarehouses=()=>{const e=[["الكود","الاسم","النوع","الحرارة","المسؤول","الموقع","الطاقة","مركز التكلفة","الحالة"]];u.forEach(t=>{const i=v[t.type]||{};e.push([t.barcodePrefix,t.name,i.label||t.type,t.storageTemperature,t.manager||"",t.location||"",t.capacity||"",t.costCenter||"",t.isActive!==!1?"نشط":"معطل"])});const a=e.map(t=>t.map(i=>`"${i}"`).join(",")).join(`
`),o=document.createElement("a");o.href="data:text/csv;charset=utf-8,\uFEFF"+encodeURIComponent(a),o.download=`warehouses_${new Date().toISOString().slice(0,10)}.csv`,o.click()};export{ae as render};
