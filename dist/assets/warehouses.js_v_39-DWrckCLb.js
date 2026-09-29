import{g as h,a as u,q as W,f as I,u as C,o as z,r as L,w as S,l as q}from"./index-ClmVJz2W.js";import{orderBy as B,query as F,where as P,getDocs as H}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import{s as A,u as D,d as j}from"./coa-connector-CiOVXnId.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let v=[],x=[],T="cards",w="",E="active",g="";const m={Main:{label:"رئيسي",icon:"🏭",color:"#5B7FFF",bg:"#5B7FFF18"},Branch:{label:"فرع",icon:"🏪",color:"#22C55E",bg:"#22C55E18"},Distribution:{label:"توزيع",icon:"🚛",color:"#F59E0B",bg:"#F59E0B18"},Transit:{label:"بضاعة في الطريق",icon:"🔄",color:"#8B5CF6",bg:"#8B5CF618"},Returns:{label:"مرتجعات",icon:"↩️",color:"#EF4444",bg:"#EF444418"},Damaged:{label:"تالف / منتهي",icon:"⚠️",color:"#DC2626",bg:"#DC262618"},Consignment:{label:"أمانات",icon:"🤝",color:"#06B6D4",bg:"#06B6D418"},Frozen:{label:"مجمدات",icon:"❄️",color:"#3B82F6",bg:"#3B82F618"},Chilled:{label:"مبردات",icon:"🌡️",color:"#0EA5E9",bg:"#0EA5E918"},Dry:{label:"مواد جافة",icon:"📦",color:"#92400E",bg:"#92400E18"},Vehicle:{label:"سيارة توزيع",icon:"🚐",color:"#059669",bg:"#05966918"},Virtual:{label:"افتراضي",icon:"☁️",color:"#6B7280",bg:"#6B728018"}},O={ambient:"درجة الغرفة (Ambient)",chilled:"تبريد +1°م إلى +4°م",frozen:"تجميد −18°م وأقل"};async function te(e,a){e.innerHTML=V(),await Promise.all([R(),$()]),K()}function V(){return`
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
        ${Object.entries(m).map(([a,o])=>`<option value="${a}">${o.icon} ${o.label}</option>`).join("")}
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
              ${Object.entries(m).map(([a,o])=>`<option value="${a}">${o.icon} ${o.label}</option>`).join("")}
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
`}async function R(){try{x=await h(u.chartOfAccounts(),[B("code")]);const e=x.filter(t=>t.type==="asset"||t.type==="assets"),a=document.getElementById("wh-acc-inv"),o=document.getElementById("wh-acc-var");a&&(a.innerHTML='<option value="">اختر حساب المخزون…</option>'+e.map(t=>`<option value="${t.accountId||t.id}">${t.code} — ${t.name}</option>`).join("")),o&&(o.innerHTML='<option value="">اختر حساب التسويات…</option>'+x.map(t=>`<option value="${t.accountId||t.id}">${t.code} — ${t.name}</option>`).join(""))}catch{}}async function $(){const e=document.getElementById("wh-content-area");if(e)try{const[a,o,t,i]=await Promise.all([h(u.warehouses(),[B("barcodePrefix")]),h(u.stockByWarehouse()),h(u.products()),h(u.locations())]);v=a;const c={};t.forEach(n=>{c[n.id]=n.costPrice||n.avgCost||n.purchasePrice||0});let s=0;o.forEach(n=>{(n.qty||0)>0&&(s+=(n.qty||0)*(c[n.productId]||0))});const r=i.filter(n=>n.isActive!==!1).length;U(s,r),y()}catch(a){e.innerHTML=`<div class="alert bad">${a.message}</div>`}}function U(e=0,a=0){const o=v.filter(t=>t.isActive!==!1);document.getElementById("stat-total-wh").textContent=v.length,document.getElementById("stat-active-wh").textContent=o.length,document.getElementById("stat-total-value").textContent=I(e),document.getElementById("stat-locations").textContent=a}function y(){const e=document.getElementById("wh-content-area");if(!e)return;let a=v.filter(o=>{const t=E==="active"?o.isActive!==!1:E==="inactive"?o.isActive===!1:!0,i=!w||o.type===w,c=!g||(o.name||"").includes(g)||(o.barcodePrefix||"").toLowerCase().includes(g.toLowerCase());return t&&i&&c});if(a.length===0){e.innerHTML=`<div style="text-align:center; padding:60px; color:var(--text-2);">
      <div style="font-size:48px; margin-bottom:12px;">🏭</div>
      <div style="font-size:18px; font-weight:600; margin-bottom:8px;">لا توجد مخازن مطابقة</div>
      <div style="font-size:13px; margin-bottom:20px;">أضف مخزنك الأول لبدء إدارة المخزون</div>
      <button class="btn btn-primary" onclick="openWarehouseModal()">＋ إضافة مخزن جديد</button>
    </div>`;return}T==="cards"?e.innerHTML=`<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:18px; direction:rtl;">
      ${a.map(o=>N(o)).join("")}
    </div>`:e.innerHTML=_(a)}function N(e){const a=m[e.type]||m.Virtual,o=e.isActive!==!1,t=e.storageTemperature==="frozen"?"🧊":e.storageTemperature==="chilled"?"❄️":"🌡️";return O[e.storageTemperature],`
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
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); openWhLocations('${e.id}','${b(e.name)}')" title="المواقع الداخلية">📍</button>
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); editWarehouse('${e.id}')" title="تعديل">✏️</button>
          <button class="btn btn-sm btn-ghost text-bad" onclick="event.stopPropagation(); deleteWarehouse('${e.id}','${b(e.name)}')" title="حذف">🗑️</button>
        </div>
      </div>
    </div>
  </div>`}function _(e){return`<div class="card"><div class="table-container"><table class="data-dense">
    <thead><tr>
      <th>الكود</th><th>اسم المخزن</th><th>النوع</th><th>الحرارة</th><th>المسؤول</th>
      <th>السعة</th><th>مركز التكلفة</th><th>ساعات العمل</th><th>الحالة</th><th style="width:120px;"></th>
    </tr></thead>
    <tbody>${e.map(o=>{const t=m[o.type]||m.Virtual,i=o.isActive!==!1;return`<tr>
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
          <button class="btn btn-icon sm btn-ghost" onclick="openWhLocations('${o.id}','${b(o.name)}')" title="مواقع">📍</button>
          <button class="btn btn-icon sm btn-ghost" onclick="editWarehouse('${o.id}')" title="تعديل">✏️</button>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteWarehouse('${o.id}','${b(o.name)}')" title="حذف">🗑️</button>
        </div>
      </td>
    </tr>`}).join("")}</tbody>
  </table></div></div>`}function b(e){return(e||"").replace(/'/g,"\\'")}function K(){const e=document.getElementById("wh-search");e&&e.addEventListener("input",W(()=>{g=e.value.trim(),y()},250))}window.setWhView=e=>{T=e,document.querySelectorAll(".active-view").forEach(a=>a.classList.remove("active-view")),document.getElementById("btn-view-"+e)?.classList.add("active-view"),y()};window.filterWarehouses=()=>{w=document.getElementById("wh-type-filter")?.value||"",E=document.getElementById("wh-status-filter")?.value||"",y()};window.openWarehouseModal=(e=null)=>{const a=!!e;document.getElementById("wh-edit-id").value=e?.id||"",document.getElementById("wh-modal-title").textContent=a?"✏️ تعديل مخزن":"🏭 إضافة مخزن جديد",document.getElementById("wh-prefix").value=e?.barcodePrefix||"",document.getElementById("wh-name").value=e?.name||"",document.getElementById("wh-type").value=e?.type||"Main",document.getElementById("wh-temp").value=e?.storageTemperature||"ambient",document.getElementById("wh-active").value=e?.isActive===!1?"0":"1",document.getElementById("wh-manager").value=e?.manager||"",document.getElementById("wh-phone").value=e?.phone||"",document.getElementById("wh-location").value=e?.location||"",document.getElementById("wh-hours").value=e?.workingHours||"",document.getElementById("wh-capacity").value=e?.capacity||"",document.getElementById("wh-shelves").value=e?.shelves||"",document.getElementById("wh-aisles").value=e?.aisles||"",document.getElementById("wh-acc-inv").value=e?.accountId||"",document.getElementById("wh-acc-var").value=e?.varianceAccountId||"",document.getElementById("wh-cost-center").value=e?.costCenter||"",document.getElementById("wh-notes").value=e?.notes||"",document.getElementById("wh-allow-negative").checked=e?.allowNegative||!1,document.getElementById("wh-require-serial").checked=e?.requireSerial||!1,document.getElementById("wh-require-batch").checked=e?.requireBatch!==!1,document.getElementById("wh-require-expiry").checked=e?.requireExpiry!==!1,document.getElementById("wh-error").classList.add("hidden"),openModal("wh-modal")};window.editWarehouse=e=>{const a=v.find(o=>o.id===e);a&&openWarehouseModal(a)};window.saveWarehouse=async()=>{const e=document.getElementById("wh-error");e.classList.add("hidden");const a=document.getElementById("wh-edit-id").value,o=document.getElementById("wh-prefix").value.trim().toUpperCase(),t=document.getElementById("wh-name").value.trim(),i=document.getElementById("wh-type").value,c=document.getElementById("wh-acc-inv").value;if(!o){e.textContent="يرجى إدخال كود المخزن",e.classList.remove("hidden");return}if(!t){e.textContent="يرجى إدخال اسم المخزن",e.classList.remove("hidden");return}if(!i){e.textContent="يرجى تحديد نوع المخزن",e.classList.remove("hidden");return}const s={barcodePrefix:o,name:t,type:i,storageTemperature:document.getElementById("wh-temp").value,isActive:document.getElementById("wh-active").value==="1",manager:document.getElementById("wh-manager").value.trim(),phone:document.getElementById("wh-phone").value.trim(),location:document.getElementById("wh-location").value.trim(),workingHours:document.getElementById("wh-hours").value.trim(),capacity:parseFloat(document.getElementById("wh-capacity").value)||null,shelves:parseInt(document.getElementById("wh-shelves").value)||null,aisles:parseInt(document.getElementById("wh-aisles").value)||null,accountId:c,varianceAccountId:document.getElementById("wh-acc-var").value,costCenter:document.getElementById("wh-cost-center").value.trim(),notes:document.getElementById("wh-notes").value.trim(),allowNegative:document.getElementById("wh-allow-negative").checked,requireSerial:document.getElementById("wh-require-serial").checked,requireBatch:document.getElementById("wh-require-batch").checked,requireExpiry:document.getElementById("wh-require-expiry").checked},r=document.getElementById("save-wh-btn");r.disabled=!0,r.textContent="جارٍ الحفظ…";try{if(a){const n=v.find(d=>d.id===a);let p=c||n?.accountId,l=n?.accountCode||null;if(p)n&&n.name!==t&&p===n.accountId&&await D(p,t);else{const d=await A("warehouses",a,t,{type:i});d&&(p=d.accountId,l=d.accountCode)}s.accountId=p,s.inventoryAccountId=p,l&&(s.accountCode=l,s.inventoryAccountCode=l),await C("warehouses",a,s),window.showToast("✅ تم تحديث المخزن بنجاح","success")}else{const n=await z(u.warehouses(),s);let p=c,l=null;if(!p){const d=await A("warehouses",n,t,{type:i});d&&(p=d.accountId,l=d.accountCode,await C("warehouses",n,{accountId:p,accountCode:l,inventoryAccountId:p,inventoryAccountCode:l}))}window.showToast("✅ تم إضافة المخزن بنجاح","success")}closeModal("wh-modal"),await $()}catch(n){e.textContent=n.message,e.classList.remove("hidden")}finally{r.disabled=!1,r.textContent="💾 حفظ المخزن"}};window.deleteWarehouse=async(e,a)=>{if(await window.showConfirm(`هل أنت متأكد من حذف المخزن "${a}"؟
تأكد أنه لا توجد حركات مرتبطة به.`,"حذف المخزن"))try{const o=v.find(t=>t.id===e);o&&o.accountId&&await j("warehouses",e,o.accountId),await L("warehouses",e),window.showToast("تم الحذف بنجاح","success"),await $()}catch(o){window.showToast(o.message,"error")}};window.openWhDetails=async e=>{const a=document.getElementById("wh-detail-body"),o=document.getElementById("wh-detail-title");a.innerHTML='<div class="page-loading"><div class="loading-spinner"></div></div>',openModal("wh-detail-modal");const t=v.find(s=>s.id===e);if(!t){a.innerHTML='<div class="alert bad">المخزن غير موجود</div>';return}const i=m[t.type]||m.Virtual;o.innerHTML=`${i.icon} ${t.name} <span class="mono" style="font-size:13px;color:${i.color};">(${t.barcodePrefix})</span>`;let c="";try{const[s,r]=await Promise.all([S(e),h(u.products())]),n={};r.forEach(l=>{n[l.id]=l});const p=s.filter(l=>(l.qty||0)!==0).map(l=>{const d=n[l.productId]||{},M=d.costPrice||d.avgCost||d.purchasePrice||0;return{sku:d.sku||d.barcode||"—",name:d.name||d.productName||l.productId||"—",qty:l.qty||0,val:Math.max(0,(l.qty||0)*M)}}).sort((l,d)=>l.name.localeCompare(d.name,"ar"));p.length===0?c='<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--text-2);">لا يوجد مخزون حالي في هذا المخزن</td></tr>':c=p.map(l=>`<tr>
        <td class="mono dim">${l.sku}</td>
        <td>${l.name}</td>
        <td class="mono ${l.qty<0?"text-bad":""}">${q(l.qty)}</td>
        <td class="mono">${I(l.val)}</td>
      </tr>`).join("")}catch(s){console.error("[WH] Stock load error:",s),c=`<tr><td colspan="4" style="text-align:center;padding:16px;"><span class="text-bad">تعذّر تحميل البيانات</span><br><small style="color:var(--text-2);">${s.message}</small></td></tr>`}a.innerHTML=`
    <!-- Info Grid -->
    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:24px;">
      ${[["النوع",i.label,i.color],["درجة الحرارة",t.storageTemperature==="frozen"?"🧊 تجميد":t.storageTemperature==="chilled"?"❄️ تبريد":"🌡️ جاف","#0EA5E9"],["الحالة",t.isActive!==!1?"✅ نشط":"⛔ معطل",t.isActive!==!1?"#22C55E":"#EF4444"],["المسؤول",t.manager||"—","#8B5CF6"],["الموقع",t.location||"—","#F59E0B"],["ساعات العمل",t.workingHours||"—","#6B7280"],["الطاقة الاستيعابية",t.capacity?t.capacity+" م³":"—","#5B7FFF"],["عدد الأرفف",t.shelves||"—","#059669"],["مركز التكلفة",t.costCenter||"—","#92400E"]].map(([s,r,n])=>`
        <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:10px; padding:14px;">
          <div style="font-size:11px; color:var(--text-2); margin-bottom:4px;">${s}</div>
          <div style="font-weight:600; color:${n}; font-size:14px;">${r}</div>
        </div>`).join("")}
    </div>

    <!-- Stock Table -->
    <div class="wh-section-title" style="margin-bottom:12px;">📦 المخزون الحالي في هذا المخزن</div>
    <div class="table-container">
      <table class="data-dense">
        <thead><tr><th>SKU</th><th>الصنف</th><th>الكمية</th><th>القيمة (ر.س)</th></tr></thead>
        <tbody>${c}</tbody>
      </table>
    </div>
    <div style="margin-top:16px; display:flex; gap:10px;">
      <button class="btn btn-secondary btn-sm" onclick="openWhLocations('${e}','${b(t.name)}')">📍 المواقع الداخلية</button>
      <button class="btn btn-secondary btn-sm" onclick="editWarehouse('${e}'); closeModal('wh-detail-modal')">✏️ تعديل المخزن</button>
    </div>
  `};let f=[];window.openWhLocations=async(e,a)=>{document.getElementById("wh-loc-warehouse-id").value=e,document.getElementById("wh-loc-title").textContent=`📍 مواقع التخزين — ${a}`,["loc-zone","loc-aisle","loc-shelf","loc-level","loc-name"].forEach(o=>{const t=document.getElementById(o);t&&(t.value="")}),openModal("wh-locations-modal"),await k(e)};async function k(e){const a=document.getElementById("wh-locations-tbody");if(a)try{const o=F(u.inventoryLocations(),P("warehouseId","==",e),B("code"));if(f=(await H(o)).docs.map(i=>({id:i.id,...i.data()})),!f.length){a.innerHTML='<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--text-2);">لا توجد مواقع محددة — أضف موقعاً جديداً</td></tr>';return}a.innerHTML=f.map(i=>`<tr>
      <td class="mono font-bold">${i.code||"—"}</td>
      <td>${i.name||"—"}</td>
      <td>${i.zone||"—"}</td>
      <td>${i.aisle||"—"}</td>
      <td>${i.shelf||"—"}</td>
      <td>${i.level||"—"}</td>
      <td><span class="badge neutral" style="font-size:10px;">${i.type||"shelf"}</span></td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteLocation('${i.id}')">🗑️</button></td>
    </tr>`).join("")}catch(o){a.innerHTML=`<tr><td colspan="8" class="text-bad">${o.message}</td></tr>`}}window.addLocation=async()=>{const e=document.getElementById("wh-loc-warehouse-id").value,a=document.getElementById("loc-zone").value.trim().toUpperCase(),o=document.getElementById("loc-aisle").value.trim().padStart(2,"0"),t=document.getElementById("loc-shelf").value.trim().padStart(2,"0"),i=document.getElementById("loc-level").value.trim().padStart(2,"0"),c=document.getElementById("loc-name").value.trim(),s=document.getElementById("loc-type").value,r=[a,o,t,i].filter(Boolean).join("-")||c;if(!r){window.showToast("يرجى إدخال بيانات الموقع","error");return}try{await z(u.inventoryLocations(),{warehouseId:e,code:r,name:c||r,zone:a,aisle:o,shelf:t,level:i,type:s,isActive:!0}),window.showToast("✅ تم إضافة الموقع","success"),await k(e)}catch(n){window.showToast(n.message,"error")}};window.deleteLocation=async e=>{const a=document.getElementById("wh-loc-warehouse-id").value;if(await window.showConfirm("هل تريد حذف هذا الموقع؟","حذف موقع"))try{await L("inventoryLocations",e),window.showToast("تم الحذف","success"),await k(a)}catch(o){window.showToast(o.message,"error")}};window.exportWarehouses=()=>{const e=[["الكود","الاسم","النوع","الحرارة","المسؤول","الموقع","الطاقة","مركز التكلفة","الحالة"]];v.forEach(t=>{const i=m[t.type]||{};e.push([t.barcodePrefix,t.name,i.label||t.type,t.storageTemperature,t.manager||"",t.location||"",t.capacity||"",t.costCenter||"",t.isActive!==!1?"نشط":"معطل"])});const a=e.map(t=>t.map(i=>`"${i}"`).join(",")).join(`
`),o=document.createElement("a");o.href="data:text/csv;charset=utf-8,\uFEFF"+encodeURIComponent(a),o.download=`warehouses_${new Date().toISOString().slice(0,10)}.csv`,o.click()};export{te as render};
