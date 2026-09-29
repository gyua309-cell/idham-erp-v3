const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-ClmVJz2W.js","assets/index-Dq7oGj9k.css"])))=>i.map(i=>d[i]);
import{q as lt,E as P,f as g,g as B,a as w,_ as dt,u as z,o as K,r as ct}from"./index-ClmVJz2W.js";import{u as pt,s as V,d as ut,m as mt}from"./coa-connector-CiOVXnId.js";import{e as gt,d as bt,i as vt}from"./excel-zCoXiaxq.js";import{s as xt}from"./record-actions-BUPPxq1M.js";import{syncCustomerNameEverywhere as ft,syncCustomerBalanceToCoa as yt}from"./sync-engine-DvRXEJYD.js";import{o as j}from"./customer-agreement-BhqsNFvU.js";import{orderBy as _,limit as ht,where as D,getDocs as L,query as N}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";window.openCustomerAgreement=j;window.openBlankCustomerAgreement=()=>j(null,!0);let u=[],S="desc",F="all";function R(t=0,e=null){const o=Number(t)||0;return e&&e!=="auto"&&["A","B","C","D"].includes(e)?e==="A"?{key:"A",label:"👑 فئة A (VIP)",badgeClass:"tier-badge-a",color:"#D4AF37",bg:"rgba(212,175,55,0.15)",border:"rgba(212,175,55,0.45)",isManual:!0,desc:"كبار الحسابات والشركاء (> 20,000 ر.س)",nextTierText:"أعلى شريحة (VIP) 👑"}:e==="B"?{key:"B",label:"💎 فئة B (مميز)",badgeClass:"tier-badge-b",color:"#818cf8",bg:"rgba(99,102,241,0.15)",border:"rgba(99,102,241,0.45)",isManual:!0,desc:"عملاء رئيسيون (10,001 - 20,000 ر.س)",nextTierText:`متبقي ${Math.max(0,20001-o).toLocaleString()} ر.س للترقية إلى فئة A`}:e==="C"?{key:"C",label:"🚀 فئة C (نمو)",badgeClass:"tier-badge-c",color:"#34d399",bg:"rgba(16,185,129,0.15)",border:"rgba(16,185,129,0.45)",isManual:!0,desc:"عملاء متوسطون (5,001 - 10,000 ر.س)",nextTierText:`متبقي ${Math.max(0,10001-o).toLocaleString()} ر.س للترقية إلى فئة B`}:{key:"D",label:"📦 فئة D (تجزئة)",badgeClass:"tier-badge-d",color:"#fb923c",bg:"rgba(249,115,22,0.15)",border:"rgba(249,115,22,0.45)",isManual:!0,desc:"صغار العملاء (1 - 5,000 ر.س)",nextTierText:`متبقي ${Math.max(0,5001-o).toLocaleString()} ر.س للترقية إلى فئة C`}:o>2e4?{key:"A",label:"👑 فئة A (VIP)",badgeClass:"tier-badge-a",color:"#D4AF37",bg:"rgba(212,175,55,0.15)",border:"rgba(212,175,55,0.45)",isManual:!1,desc:"كبار الحسابات والشركاء (مسحوبات > 20,000 ر.س)",nextTierText:"أعلى شريحة (VIP) 👑"}:o>1e4?{key:"B",label:"💎 فئة B (مميز)",badgeClass:"tier-badge-b",color:"#818cf8",bg:"rgba(99,102,241,0.15)",border:"rgba(99,102,241,0.45)",isManual:!1,desc:"عملاء رئيسيون (10,001 - 20,000 ر.س)",nextTierText:`متبقي ${(20001-o).toLocaleString()} ر.س للترقية إلى فئة A`}:o>5e3?{key:"C",label:"🚀 فئة C (نمو)",badgeClass:"tier-badge-c",color:"#34d399",bg:"rgba(16,185,129,0.15)",border:"rgba(16,185,129,0.45)",isManual:!1,desc:"عملاء متوسطون (5,001 - 10,000 ر.س)",nextTierText:`متبقي ${(10001-o).toLocaleString()} ر.س للترقية إلى فئة B`}:o>0?{key:"D",label:"📦 فئة D (تجزئة)",badgeClass:"tier-badge-d",color:"#fb923c",bg:"rgba(249,115,22,0.15)",border:"rgba(249,115,22,0.45)",isManual:!1,desc:"صغار العملاء (1 - 5,000 ر.س)",nextTierText:`متبقي ${(5001-o).toLocaleString()} ر.س للترقية إلى فئة C`}:{key:"inactive",label:"⚪ غير نشط",badgeClass:"tier-badge-inactive",color:"#94a3b8",bg:"rgba(148,163,184,0.12)",border:"rgba(148,163,184,0.3)",isManual:!1,desc:"بلا مسحوبات خلال آخر 30 يوماً",nextTierText:"يحتاج لشراء 1 ر.س لدخول فئة D"}}function Y(t){if(!t)return"—";if(t.createdAt){if(t.createdAt.toDate)return t.createdAt.toDate().toISOString().split("T")[0];if(t.createdAt.seconds)return new Date(t.createdAt.seconds*1e3).toISOString().split("T")[0];if(typeof t.createdAt=="string")return t.createdAt.slice(0,10)}return t.createdDate?String(t.createdDate).slice(0,10):t.dateAdded?String(t.dateAdded).slice(0,10):t.date?String(t.date).slice(0,10):"—"}function J(t){if(!t)return 0;if(t.createdAt?.toDate)return t.createdAt.toDate().getTime();if(t.createdAt?.seconds)return t.createdAt.seconds*1e3;if(typeof t.createdAt=="string"){const e=new Date(t.createdAt).getTime();if(!isNaN(e))return e}if(t.createdDate){const e=new Date(t.createdDate).getTime();if(!isNaN(e))return e}if(t.dateAdded){const e=new Date(t.dateAdded).getTime();if(!isNaN(e))return e}if(t.date){const e=new Date(t.date).getTime();if(!isNaN(e))return e}return 0}function tt(t){return t.map(e=>{const o=P(e.balance||0,e.creditLimit||0),n=Y(e),s=e.tier||R(e.monthlySales||0,e.tierOverride),p=e.monthlySales||0;return`<tr>
      <td>
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <div class="font-semibold font-heading" 
               style="color:var(--brand); cursor:pointer; text-decoration:underline; font-weight:800;" 
               onclick="window.showCustomerIntelligence('${e.id}', '${e.name.replace(/'/g,"\\'")}')"
               title="🧠 عرض لوحة ذكاء العميل والتحليل الإحصائي">
            ${e.name}
          </div>
          <span class="tier-badge ${s.badgeClass}" title="${s.desc}">
            ${s.label} ${s.isManual?"🔒":""}
          </span>
        </div>
        <div style="font-size:11px;color:var(--text-2);display:flex;align-items:center;gap:6px;margin-top:2px;">
          <span class="mono">${e.code||""}</span>
          ${n!=="—"?`<span style="font-size:10px;color:var(--text-2);background:rgba(0,0,0,0.05);padding:1px 5px;border-radius:4px;" title="تاريخ إضافة العميل">📅 ${n}</span>`:""}
        </div>
      </td>
      <td class="mono dim" style="white-space:nowrap;">
        ${n!=="—"?`<span class="badge neutral mono" style="font-size:11px;font-weight:600;">📅 ${n}</span>`:"—"}
      </td>
      <td style="white-space:nowrap;">
        <div class="mono font-bold" style="color:${s.color}; font-size:12.5px;">
          ${g(p)}
        </div>
        <div class="dim" style="font-size:10px;" title="${s.nextTierText}">
          ${s.nextTierText}
        </div>
      </td>
      <td class="mono dim">${e.phone||"—"}</td>
      <td class="dim">${e.zone||"—"}</td>
      <td class="dim">${e.repName||"—"}</td>
      <td class="mono ${e.balance>0?"text-bad":"text-good"}">${g(e.balance||0)}</td>
      <td class="mono">${g(e.creditLimit||0)}</td>
      <td style="min-width:110px;">
        ${e.creditLimit>0?`
        <div class="credit-meter">
          <div class="meter-label">
            <span style="font-size:10px;" class="text-${o.color}">${o.label}</span>
            <span style="font-size:10px;" class="mono">${o.pct.toFixed(0)}%</span>
          </div>
          <div class="progress-bar">
            <div class="fill ${o.color}" style="width:${o.pct}%;"></div>
          </div>
        </div>`:'<span class="text-2" style="font-size:11px;">بلا حد</span>'}
      </td>
      <td><span class="badge neutral" style="font-size:10px;">${e.priceList==="wholesale"?"الجملة":e.priceList==="retail"?"التجزئة":"الأساسي"}</span></td>
      <td>
        <div class="row-actions">
          <button class="btn btn-icon sm btn-ghost" onclick="previewCustomer('${e.id}')" title="معاينة">👁️</button>
          <button class="btn btn-icon sm btn-ghost" onclick="editCustomer('${e.id}')" title="تعديل">✏️</button>
          <button class="btn btn-icon sm" style="background:rgba(30,58,138,.12);color:#1E3A8A;border:1px solid rgba(30,58,138,.3);" onclick="openCustomerAgreement('${e.id}')" title="اتفاقية فتح / تحديث حساب">📝</button>
          <button class="btn btn-icon sm btn-ghost" onclick="printCustomer('${e.id}')" title="طباعة">🖨️</button>
          <button class="btn btn-icon sm btn-ghost" onclick="exportCustomerPDF('${e.id}')" title="PDF">📄</button>
          <button class="btn btn-icon sm btn-ghost" onclick="viewCustomerStatement('${e.id}','${e.name.replace(/'/g,"\\'")}')" title="كشف حساب">📊</button>
          <button class="btn btn-icon sm" style="background:rgba(124,58,237,.10);color:#7C3AED;border:1px solid rgba(124,58,237,.2);" onclick="issuePromissoryNote('${e.id}','${e.name.replace(/'/g,"\\'")}')" title="إصدار سند أمر">📜</button>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteCustomer('${e.id}','${e.name.replace(/'/g,"\\'")}')" title="حذف">🗑️</button>
        </div>
      </td>
    </tr>`}).join("")}window.viewCustomerStatement=(t,e)=>{window.navigate&&(window.navigate("customer-statement"),setTimeout(()=>{window.selectStmtCustomer&&window.selectStmtCustomer(t)},300))};window.setCustomerTierFilter=t=>{F=t,document.querySelectorAll(".tier-filter-btn").forEach(n=>n.classList.remove("active"));const e=document.getElementById(`tier-btn-${t}`);e&&e.classList.add("active");const o=document.getElementById("cust-tbody");o&&u.length>0&&q(u,o)};async function Pt(t,e){const o=u&&u.length>0;t.innerHTML=`
    <style>
      .tier-badge {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 2px 7px; border-radius: 6px; font-size: 11px; font-weight: 700;
        white-space: nowrap; line-height: 1.2;
      }
      .tier-badge-a { background: linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(245,215,110,0.1) 100%); color: #F5D76E; border: 1px solid rgba(212,175,55,0.45); box-shadow: 0 0 8px rgba(212,175,55,0.2); }
      .tier-badge-b { background: linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(129,140,248,0.1) 100%); color: #A5B4FC; border: 1px solid rgba(99,102,241,0.45); }
      .tier-badge-c { background: linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(52,211,153,0.1) 100%); color: #6EE7B7; border: 1px solid rgba(16,185,129,0.45); }
      .tier-badge-d { background: linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(251,146,60,0.1) 100%); color: #FDBA74; border: 1px solid rgba(249,115,22,0.45); }
      .tier-badge-inactive { background: rgba(148,163,184,0.12); color: #94A3B8; border: 1px solid rgba(148,163,184,0.3); }

      .tier-filter-btn {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 5px 12px; border-radius: 20px; font-size: 11.5px; font-weight: 700;
        border: 1px solid var(--border-soft); background: var(--bg-1); color: var(--text-2);
        cursor: pointer; transition: all 0.2s ease;
      }
      .tier-filter-btn:hover { background: var(--bg-3); color: var(--text-1); }
      .tier-filter-btn.active { background: var(--brand); color: #fff !important; border-color: var(--brand) !important; box-shadow: 0 2px 8px rgba(37,99,235,0.3); }
    </style>

    <div class="filterbar">
      <div class="search-bar" style="max-width:280px;">
        <input type="text" id="cust-search" class="input" placeholder="🔍  بحث في العملاء…" />
      </div>
      <div class="filter-select-group">
        <label>المنطقة</label>
        <select id="cust-zone-filter" onchange="loadCustomers(true)">
          <option value="">الكل</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>المندوب</label>
        <select id="cust-rep-filter" onchange="loadCustomers(true)">
          <option value="">الكل</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>الائتمان</label>
        <select id="cust-credit-filter" onchange="loadCustomers(true)">
          <option value="">الكل</option>
          <option value="ok">طبيعي</option>
          <option value="warn">قارب الحد</option>
          <option value="bad">تجاوز</option>
        </select>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn-export" style="background:#1e3a8a;color:#fff;" onclick="window.openBlankCustomerAgreement()" title="طباعة نموذج اتفاقية فتح حساب رسمي فارغ"><span>📑</span> اتفاقية فارغة</button>
        <button class="btn-export" onclick="exportPagePDF('.data-dense','العملاء')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportCustomersExcel()" title="تصدير Excel بجميع البيانات"><span>📊</span> تصدير Excel</button>
        <button class="btn-export" style="background:#10B981;color:#fff;" onclick="openCustomerImportModal()" title="استيراد من Excel"><span>📤</span> استيراد Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn-export" style="background:#7C3AED;color:#fff;" onclick="runCustomerCoaMigration()" title="ربط العملاء بشجرة الحسابات حسب مندوبيهم (مرة واحدة فقط)" id="btn-migrate-coa"><span>🔗</span> ترحيل ذمم العملاء</button>
        <button class="btn btn-primary" onclick="openCustomerModal()">+ إضافة عميل</button>
      </div>
    </div>

    <div class="page-content">
      <!-- Tier Quick Filter Pills -->
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-bottom:14px; background:var(--bg-2); padding:10px 14px; border-radius:12px; border:1px solid var(--border-soft);">
        <span style="font-weight:800; font-size:12px; color:var(--text-1); margin-left:4px;">🎯 تصنيف العملاء (حسب مسحوبات ٣٠ يوماً):</span>
        <button class="tier-filter-btn active" id="tier-btn-all" onclick="window.setCustomerTierFilter('all')">🌟 الكل (<span id="tcount-all">0</span>)</button>
        <button class="tier-filter-btn" id="tier-btn-A" onclick="window.setCustomerTierFilter('A')" style="border-color:rgba(212,175,55,0.4); color:#D4AF37;">👑 فئة A (> 20 ألف) (<span id="tcount-A">0</span>)</button>
        <button class="tier-filter-btn" id="tier-btn-B" onclick="window.setCustomerTierFilter('B')" style="border-color:rgba(99,102,241,0.4); color:#818CF8;">💎 فئة B (10 - 20 ألف) (<span id="tcount-B">0</span>)</button>
        <button class="tier-filter-btn" id="tier-btn-C" onclick="window.setCustomerTierFilter('C')" style="border-color:rgba(16,185,129,0.4); color:#34D399;">🚀 فئة C (5 - 10 آلاف) (<span id="tcount-C">0</span>)</button>
        <button class="tier-filter-btn" id="tier-btn-D" onclick="window.setCustomerTierFilter('D')" style="border-color:rgba(249,115,22,0.4); color:#FB923C;">📦 فئة D (1 - 5 آلاف) (<span id="tcount-D">0</span>)</button>
        <button class="tier-filter-btn" id="tier-btn-inactive" onclick="window.setCustomerTierFilter('inactive')" style="color:#94A3B8;">⚪ غير نشط (0) (<span id="tcount-inactive">0</span>)</button>
      </div>

      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">العملاء</h1>
          <p class="page-subtitle" id="cust-count">${o?`${u.length} عميل`:""}</p>
        </div>
        <div style="margin-right:auto;display:flex;gap:8px;align-items:center;">
          <button class="btn btn-secondary btn-icon sm" id="cust-refresh-btn" onclick="refreshCustomers()" title="تحديث البيانات" style="font-size:13px;padding:6px 12px;">🔄  تحديث</button>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead><tr>
              <th>اسم العميل والشريحة</th>
              <th style="cursor:pointer; user-select:none; white-space:nowrap;" onclick="window.toggleCustomerDateSort()" title="اضغط للترتيب حسب تاريخ الإضافة">
                <div style="display:inline-flex; align-items:center; gap:6px; color:var(--brand); font-weight:700;">
                  <span>تاريخ الإضافة</span>
                  <span id="cust-date-sort-icon" style="font-size:11px; background:rgba(59,130,246,0.12); color:#2563EB; padding:1px 6px; border-radius:4px; border:1px solid rgba(59,130,246,0.25);">
                    ${S==="desc"?"⬇️ الأحدث":"⬆️ الأقدم"}
                  </span>
                </div>
              </th>
              <th>مسحوبات الشهر (30 يوم)</th>
              <th>الهاتف</th><th>المنطقة</th>
              <th>المندوب</th><th>الرصيد الحالي</th><th>حد الائتمان</th>
              <th>استخدام الائتمان</th><th>قائمة الأسعار</th><th></th>
            </tr></thead>
            <tbody id="cust-tbody">
              ${o?tt(u):`
                <tr class="skeleton-row">
                  ${Array(11).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
                <tr class="skeleton-row">
                  ${Array(11).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
                <tr class="skeleton-row">
                  ${Array(11).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Customer Modal -->
    <div class="modal-overlay" id="customer-modal">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 class="modal-title" id="cust-modal-title">إضافة عميل جديد</h3>
          <button class="modal-close" onclick="closeModal('customer-modal')">×</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="cust-edit-id" />
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group" style="grid-column:span 2;">
              <label>اسم العميل *</label>
              <input type="text" id="cust-name" class="input" />
            </div>
            <div class="form-group">
              <label>كود العميل</label>
              <input type="text" id="cust-code" class="input mono" placeholder="CUST-001" />
            </div>
          </div>
          <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:16px;">
            <div class="form-group">
              <label>الهاتف</label>
              <input type="tel" id="cust-phone" class="input mono" placeholder="05XXXXXXXX" />
            </div>
            <div class="form-group">
              <label>الرقم الضريبي (VAT)</label>
              <input type="text" id="cust-vat" class="input mono" placeholder="300000000000003" />
            </div>
            <div class="form-group">
              <label>الهوية الوطنية / السجل</label>
              <input type="text" id="cust-national-id" class="input mono" placeholder="1XXXXXXXXX" />
            </div>
            <div class="form-group">
              <label>المنطقة/المسار</label>
              <input type="text" id="cust-zone" class="input" placeholder="الرياض — شمال" />
            </div>
          </div>
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group">
              <label>حد الائتمان (ر.س)</label>
              <input type="number" id="cust-credit-limit" class="input mono" step="100" min="0" placeholder="0" />
            </div>
            <div class="form-group">
              <label>أيام الائتمان (مهلة السداد)</label>
              <input type="number" id="cust-credit-days" class="input mono" min="0" placeholder="30" />
            </div>
            <div class="form-group">
              <label>المندوب المسؤول</label>
              <select id="cust-rep">
                <option value="">اختر المندوب</option>
              </select>
            </div>
          </div>
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group">
              <label>قائمة الأسعار</label>
              <select id="cust-price-list">
                <option value="default">السعر الأساسي</option>
                <option value="wholesale">الجملة</option>
                <option value="retail">التجزئة</option>
              </select>
            </div>
            <div class="form-group">
              <label>تصنيف الشريحة (يدوي / تلقائي)</label>
              <select id="cust-tier-override" class="input">
                <option value="auto">تلقائي (حسب المسحوبات الشهرية)</option>
                <option value="A">👑 فئة A (VIP — أكثر من 20,000 ر.س)</option>
                <option value="B">💎 فئة B (مميز — 10,001 إلى 20,000 ر.س)</option>
                <option value="C">🚀 فئة C (نمو — 5,001 إلى 10,000 ر.س)</option>
                <option value="D">📦 فئة D (تجزئة — 1 إلى 5,000 ر.س)</option>
              </select>
            </div>
            <div class="form-group">
              <label>يوم التوزيع المعتاد</label>
              <select id="cust-delivery-day" class="input">
                <option value="">-- اختر اليوم --</option>
                <option value="السبت">السبت</option>
                <option value="الأحد">الأحد</option>
                <option value="الاثنين">الاثنين</option>
                <option value="الثلاثاء">الثلاثاء</option>
                <option value="الأربعاء">الأربعاء</option>
                <option value="الخميس">الخميس</option>
              </select>
            </div>
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>خط السير / المسار</label>
              <input type="text" id="cust-route-group" class="input" placeholder="مسار ينبع الصناعية" />
            </div>
            <div class="form-group">
              <label>رابط موقع العميل على خرائط جوجل (Google Maps URL)</label>
              <input type="url" id="cust-maps-url" class="input mono" placeholder="https://maps.google.com/?q=..." />
            </div>
          </div>

          <!-- Saudi National Address Section (مطابقة هيئة الزكاة والضريبة) -->
          <div style="background:var(--bg-2); border:1.5px solid var(--border-soft); border-radius:10px; padding:14px; margin-bottom:16px;">
            <div style="font-weight:800; font-size:13px; color:var(--brand); margin-bottom:12px; display:flex; align-items:center; gap:6px;">
              <span>📍 العنوان الوطني المعتمد للعميل (ZATCA National Address):</span>
            </div>
            <div class="grid-3 gap-12 mb-12">
              <div class="form-group">
                <label>اسم الشارع (Street Name)</label>
                <input type="text" id="cust-street" class="input" placeholder="الامير مقرن بن عبد العزيز" />
              </div>
              <div class="form-group">
                <label>الحي (District)</label>
                <input type="text" id="cust-district" class="input" placeholder="حي العقيق" />
              </div>
              <div class="form-group">
                <label>المدينة (City)</label>
                <input type="text" id="cust-city" class="input" placeholder="الرياض / ينبع / المدينة" />
              </div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:12px;">
              <div class="form-group">
                <label>رقم المبنى (Building No)</label>
                <input type="text" id="cust-building-no" class="input mono" placeholder="7480" maxlength="8" />
              </div>
              <div class="form-group">
                <label>الرمز البريدي (Postal Code)</label>
                <input type="text" id="cust-postal-code" class="input mono" placeholder="12345" maxlength="5" />
              </div>
              <div class="form-group">
                <label>الرقم الإضافي (Additional No)</label>
                <input type="text" id="cust-additional-no" class="input mono" placeholder="3180" maxlength="4" />
              </div>
              <div class="form-group">
                <label>الدولة (Country)</label>
                <input type="text" id="cust-country" class="input" value="المملكة العربية السعودية" />
              </div>
            </div>
          </div>

          <div class="form-group mb-16" id="cust-coa-toggle-wrap" style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="cust-coa-toggle" checked style="width:16px;height:16px;cursor:pointer;" />
            <label for="cust-coa-toggle" style="margin-bottom:0;cursor:pointer;font-weight:bold;">إنشاء حساب مستقل في شجرة الحسابات</label>
          </div>
          <div class="form-group">
            <label>ملاحظات</label>
            <textarea id="cust-notes" class="input" rows="2"></textarea>
          </div>
          <div id="cust-form-error" class="alert bad hidden" style="margin-top:8px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('customer-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveCustomer()" id="save-cust-btn">حفظ</button>
        </div>
      </div>
    </div>`;const n=t.querySelector("#cust-search");n&&n.addEventListener("input",lt(()=>k(!0),350)),await Promise.all([wt(),k()])}async function wt(){try{const t=await B(w.salesReps(),[_("name")]),e=document.getElementById("cust-rep-filter"),o=document.getElementById("cust-rep");t.forEach(n=>{e&&(e.innerHTML+=`<option value="${n.id}">${n.name}</option>`),o&&(o.innerHTML+=`<option value="${n.id}">${n.name}</option>`)})}catch{}}function Ct(t){const e=t.length,o=t.filter(i=>i.tier?.key==="A").length,n=t.filter(i=>i.tier?.key==="B").length,s=t.filter(i=>i.tier?.key==="C").length,p=t.filter(i=>i.tier?.key==="D").length,d=t.filter(i=>i.tier?.key==="inactive").length,r=(i,b)=>{const y=document.getElementById(i);y&&(y.textContent=b)};r("tcount-all",e),r("tcount-A",o),r("tcount-B",n),r("tcount-C",s),r("tcount-D",p),r("tcount-inactive",d)}async function k(t=!1){const e=document.getElementById("cust-tbody");if(e){u.length===0&&(e.innerHTML=`${Array(5).fill(0).map(()=>`
                  <tr class="skeleton-row">
                    ${Array(11).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                  </tr>
                `).join("")}`);try{const o=[_("name"),ht(500)],n=document.getElementById("cust-rep-filter")?.value;n&&o.unshift(D("repId","==",n));const[s,p]=await Promise.all([B(w.customers(),o),B(w.salesInvoices()).catch(()=>[])]),d=new Date(Date.now()-30*864e5).toISOString().slice(0,10),r={};(p||[]).forEach(i=>{if(i.status==="cancelled"||!i.customerId)return;(i.date||(i.createdAt?.toDate?i.createdAt.toDate().toISOString().slice(0,10):typeof i.createdAt=="string"?i.createdAt.slice(0,10):""))>=d&&(r[i.customerId]=(r[i.customerId]||0)+(i.totalWithVat||i.total||0))}),s.forEach(i=>{i.monthlySales=r[i.id]||0,i.tier=R(i.monthlySales,i.tierOverride||i.manualTier)}),u=s,Ct(s),q(s,e)}catch(o){e.innerHTML=`<tr><td colspan="11"><div class="alert bad" style="margin:8px;">${o.message}</div></td></tr>`}}}window.refreshCustomers=async()=>{const t=document.getElementById("cust-refresh-btn");if(t&&(t.disabled=!0,t.textContent="⏳ جاري…"),u=[],window.ERP_CACHE)for(const e of Object.keys(window.ERP_CACHE))(e.includes("customers")||e.includes("salesInvoices"))&&delete window.ERP_CACHE[e];await k(),t&&(t.disabled=!1,t.textContent="🔄  تحديث")};window.toggleCustomerDateSort=()=>{S=S==="desc"?"asc":"desc";const t=document.getElementById("cust-date-sort-icon");t&&(t.textContent=S==="desc"?"⬇️ الأحدث":"⬆️ الأقدم");const e=document.getElementById("cust-tbody");e&&u.length>0&&q(u,e)};function q(t,e){let o=[...t];const n=document.getElementById("cust-search")?.value?.toLowerCase().trim();n&&(o=o.filter(r=>r.name?.toLowerCase().includes(n)||r.phone?.includes(n)));const s=document.getElementById("cust-zone-filter")?.value;s&&(o=o.filter(r=>r.zone===s));const p=document.getElementById("cust-credit-filter")?.value;p&&(o=o.filter(r=>P(r.balance||0,r.creditLimit||0).color===p)),F&&F!=="all"&&(o=o.filter(r=>r.tier?.key===F)),o.sort((r,i)=>{const b=J(r),y=J(i);return S==="desc"?y-b:b-y});const d=document.getElementById("cust-count");if(d&&(d.textContent=`${o.length} عميل`),o.length===0){e.innerHTML='<tr><td colspan="11" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد نتائج</td></tr>';return}e.innerHTML=tt(o)}window.openCustomerModal=(t=null)=>{document.getElementById("cust-edit-id").value=t?.id||"",document.getElementById("cust-modal-title").textContent=t?"تعديل العميل":"إضافة عميل جديد",document.getElementById("cust-name").value=t?.name||"",document.getElementById("cust-code").value=t?.code||"",document.getElementById("cust-phone").value=t?.phone||"",document.getElementById("cust-vat").value=t?.vatNumber||t?.vat||"";const e=t?.nationalId||t?.crNumber||t?.cr||"";if(document.getElementById("cust-national-id").value=e,document.getElementById("cust-zone").value=t?.zone||"",document.getElementById("cust-street").value=t?.street||"",document.getElementById("cust-district").value=t?.district||"",document.getElementById("cust-city").value=t?.city||"",document.getElementById("cust-building-no").value=t?.buildingNo||t?.buildingNumber||"",document.getElementById("cust-postal-code").value=t?.postalCode||t?.zip||"",document.getElementById("cust-additional-no").value=t?.additionalNo||t?.additionalNumber||"",document.getElementById("cust-country").value=t?.country||"المملكة العربية السعودية",!t?.street&&!t?.district&&t?.address){const s=t.address;s.includes("حي")?s.split(/[-—,]/).map(d=>d.trim()).forEach(d=>{d.includes("حي")?document.getElementById("cust-district").value=d:d.includes("شارع")||d.includes("الشارع")?document.getElementById("cust-street").value=d:document.getElementById("cust-street").value||(document.getElementById("cust-street").value=d)}):document.getElementById("cust-street").value=s}document.getElementById("cust-notes").value=t?.notes||"",document.getElementById("cust-delivery-day").value=t?.deliveryDay||"",document.getElementById("cust-route-group").value=t?.routeGroup||"",document.getElementById("cust-maps-url").value=t?.googleMapsUrl||"",document.getElementById("cust-credit-limit").value=t?.creditLimit||"",document.getElementById("cust-credit-days").value=t?.creditDays||"",document.getElementById("cust-rep").value=t?.repId||"",document.getElementById("cust-price-list").value=t?.priceList||"default",document.getElementById("cust-tier-override").value=t?.tierOverride||t?.manualTier||"auto",document.getElementById("cust-form-error").classList.add("hidden");const o=document.getElementById("cust-coa-toggle-wrap"),n=document.getElementById("cust-coa-toggle");t?(o&&(o.style.display="none"),n&&(n.checked=!!t.accountId)):(o&&(o.style.display="flex"),n&&(n.checked=!0)),openModal("customer-modal")};window.editCustomer=t=>{const e=u.find(o=>o.id===t);e?openCustomerModal(e):dt(()=>import("./index-ClmVJz2W.js").then(o=>o.T),__vite__mapDeps([0,1])).then(async({getById:o})=>{try{const n=await o("customers",t);n&&openCustomerModal(n)}catch(n){showToast(n.message,"error")}})};window.issuePromissoryNote=async(t,e)=>{window.navigate&&window.navigate("promissory-notes");let o=0;const n=()=>{o++,typeof window.openNewNoteModal=="function"?window.openNewNoteModal(t,e):o<30&&setTimeout(n,300)};setTimeout(n,600)};window.saveCustomer=async()=>{const t=document.getElementById("cust-form-error");t.classList.add("hidden");const e=document.getElementById("cust-edit-id").value,o=document.getElementById("cust-name").value.trim();if(!o){t.textContent="اسم العميل مطلوب",t.classList.remove("hidden");return}const n=document.getElementById("cust-rep"),s=document.getElementById("cust-national-id").value.trim(),p=document.getElementById("cust-street")?.value?.trim()||"",d=document.getElementById("cust-district")?.value?.trim()||"",r=document.getElementById("cust-city")?.value?.trim()||"",i=document.getElementById("cust-building-no")?.value?.trim()||"",b=document.getElementById("cust-postal-code")?.value?.trim()||"",y=document.getElementById("cust-additional-no")?.value?.trim()||"",T=document.getElementById("cust-country")?.value?.trim()||"المملكة العربية السعودية",x=[];i&&x.push(`رقم المبنى: ${i}`),p&&x.push(`الشارع: ${p}`),d&&x.push(`الحي: ${d}`),r&&x.push(`المدينة: ${r}`),b&&x.push(`الرمز البريدي: ${b}`);const I=x.length>0?x.join(" — "):"",m={name:o,code:document.getElementById("cust-code").value.trim(),phone:document.getElementById("cust-phone").value.trim(),vatNumber:document.getElementById("cust-vat").value.trim(),nationalId:s,crNumber:s,zone:document.getElementById("cust-zone").value.trim(),creditLimit:parseFloat(document.getElementById("cust-credit-limit").value)||0,creditDays:parseInt(document.getElementById("cust-credit-days").value)||0,repId:n.value,repName:n.options[n.selectedIndex]?.text||"",priceList:document.getElementById("cust-price-list").value,deliveryDay:document.getElementById("cust-delivery-day").value,tierOverride:document.getElementById("cust-tier-override")?.value||"auto",routeGroup:document.getElementById("cust-route-group").value.trim(),googleMapsUrl:document.getElementById("cust-maps-url").value.trim(),street:p,district:d,city:r,buildingNo:i,buildingNumber:i,postalCode:b,additionalNo:y,additionalNumber:y,country:T,address:I,notes:document.getElementById("cust-notes").value.trim()};e||(m.balance=0);const c=document.getElementById("save-cust-btn");c.disabled=!0;try{if(e){const f=u.find(h=>h.id===e);if(await z("customers",e,m),f){const h=f.name!==o;if(f.accountId)h&&await pt(f.accountId,o);else{const v=await V("customers",e,o);v&&await z("customers",e,v)}h&&ft(e,o).catch(v=>console.warn("[Customers] syncCustomerNameEverywhere error:",v.message)),yt(e).catch(()=>{})}showToast("تم تحديث العميل بنجاح","success")}else{const f=!document.getElementById("cust-coa-toggle").checked,h=await K(w.customers(),m);if(!f)try{const v=await V("customers",h,o,{repId:m.repId||null});v&&await z("customers",h,v)}catch(v){console.error("Failed to sync customer to COA:",v),showToast(`⚠️ تم حفظ العميل ولكن فشل تكامل شجرة الحسابات: ${v.message}`,"error")}showToast("تمت إضافة العميل بنجاح","success")}closeModal("customer-modal"),await k()}catch(f){t.textContent=f.message,t.classList.remove("hidden")}finally{c.disabled=!1}};window.deleteCustomer=async(t,e)=>{if(await showConfirm(`هل تريد حذف العميل "${e}" نهائياً؟`,"تأكيد الحذف"))try{const o=u.find(n=>n.id===t);if(o&&o.accountId&&(await ut("customers",t,o.accountId)).action==="archived"){showToast("⚠️ العميل لديه معاملات مالية سابقة. تم أرشفته وتجميد حسابه في شجرة الحسابات.","warning"),await k();return}await ct("customers",t),showToast("تم حذف العميل بنجاح","success"),await k()}catch(o){showToast(o.message,"error")}};window.viewCustomerStatement=(t,e)=>{window._preselectedStatementEntity={type:"customer",id:t},navigate("report-customer-statement")};window.exportCustomers=async()=>{window.exportCustomersExcel()};window.exportCustomersExcel=async()=>{try{const t=u.length>0?u:await B(w.customers(),[_("name")]);showToast("جاري تجهيز ملف Excel…","info");const e=t.map(o=>[o.name||"",o.code||"",o.phone||"",o.email||"",o.zone||"",o.repName||"",o.priceList||"",o.balance||0,o.creditLimit||0,o.paymentTerms||"",o.vatNumber||"",o.notes||""]);await gt({title:"العملاء",headers:["اسم العميل*","كود العميل","رقم الهاتف","البريد الإلكتروني","المنطقة","المندوب","قائمة الأسعار","الرصيد الحالي","حد الائتمان","شروط الدفع","الرقم الضريبي","ملاحظات"],rows:e,colWidths:[28,14,14,26,14,18,14,14,14,14,18,26]}),showToast(`تم تصدير ${e.length} عميل ✅`,"success")}catch(t){showToast("خطأ: "+t.message,"error")}};window.openCustomerImportModal=()=>{const t=document.createElement("div");t.className="modal-overlay active",t.id="cust-import-overlay",t.innerHTML=`
    <div class="modal" style="max-width:680px;width:95%;">
      <div class="modal-header">
        <h3 class="modal-title">📤 استيراد العملاء من Excel</h3>
        <button class="modal-close" onclick="document.getElementById('cust-import-overlay').remove()">×</button>
      </div>
      <div class="modal-body">
        <div style="background:var(--bg-2);border-radius:10px;padding:16px;margin-bottom:16px;font-size:12px;color:var(--text-2);line-height:1.8;">
          <strong style="color:var(--text-1);">الأعمدة المطلوبة:</strong> اسم العميل(*), كود العميل, رقم الهاتف, البريد الإلكتروني, المنطقة, المندوب, قائمة الأسعار, حد الائتمان, شروط الدفع, الرقم الضريبي, ملاحظات
        </div>
        <div id="cust-drop-zone" style="border:2px dashed var(--border-soft);border-radius:12px;padding:36px;text-align:center;cursor:pointer;"
          onclick="document.getElementById('cust-file-inp').click()"
          ondragover="event.preventDefault();this.style.borderColor='var(--brand)';"
          ondragleave="this.style.borderColor='var(--border-soft)';"
          ondrop="event.preventDefault();this.style.borderColor='var(--border-soft)';handleCustomerImport(event.dataTransfer.files[0]);">
          <div style="font-size:40px;margin-bottom:8px;">📊</div>
          <div style="font-weight:600;">اسحب ملف Excel أو انقر للاختيار</div>
          <input type="file" id="cust-file-inp" accept=".xlsx,.xls,.csv" style="display:none" onchange="handleCustomerImport(this.files[0])">
        </div>
        <div id="cust-import-status" style="margin-top:12px;"></div>
        <div id="cust-import-preview" style="max-height:200px;overflow:auto;margin-top:8px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="document.getElementById('cust-import-overlay').remove()">إلغاء</button>
        <button class="btn" style="background:var(--bg-2);" onclick="downloadCustomerTemplate()">📥 نموذج</button>
        <button class="btn btn-primary" id="cust-import-btn" style="display:none;" onclick="executeCustImport()">✅ استيراد</button>
      </div>
    </div>`,document.body.appendChild(t)};let et=[],It=[];window.downloadCustomerTemplate=async()=>{await bt({title:"العملاء",headers:["اسم العميل*","كود العميل","رقم الهاتف","البريد الإلكتروني","المنطقة","اسم المندوب","قائمة الأسعار","حد الائتمان","شروط الدفع","الرقم الضريبي","ملاحظات"],sampleRows:[["شركة المستقبل","C001","0501234567","info@co.sa","الرياض","أحمد","retail",5e4,"net30","300xxxxxxxxxx","عميل مميز"]],colWidths:[28,14,14,26,14,18,14,14,14,18,26]}),showToast("تم تنزيل النموذج ✅","success")};window.handleCustomerImport=async t=>{if(t)try{const{headers:e,rows:o}=await vt(t);et=o,It=e,document.getElementById("cust-import-status").innerHTML=`<div class="alert good">✅ تم قراءة <strong>${o.length}</strong> عميل. اضغط استيراد لتأكيد الحفظ.</div>`;const n=o.slice(0,5).map(s=>`<tr>${Object.values(s).slice(0,5).map(p=>`<td>${p}</td>`).join("")}</tr>`).join("");document.getElementById("cust-import-preview").innerHTML=`<table class="data-dense" style="font-size:11px;"><tbody>${n}</tbody></table>`,document.getElementById("cust-import-btn").style.display=""}catch(e){showToast(e.message,"error")}};window.executeCustImport=async()=>{const t=document.getElementById("cust-import-btn");t.disabled=!0,t.textContent="⏳ جاري...";let e=0,o=0,n=0;const[s,p]=await Promise.all([B(w.customers(),[]),B(w.salesReps(),[])]),d={};s.forEach(i=>{d[i.name?.trim()?.toLowerCase()]=i.id});const r={};p.forEach(i=>{r[i.name?.trim()?.toLowerCase()]=i.id});for(const i of et){const b=String(i["اسم العميل*"]||i.اسم||Object.values(i)[0]||"").trim();if(!b){n++;continue}const y=String(i["اسم المندوب"]||"").trim(),T=r[y.toLowerCase()]||null,x={name:b,code:String(i["كود العميل"]||"").trim()||null,phone:String(i["رقم الهاتف"]||"").trim()||null,email:String(i["البريد الإلكتروني"]||"").trim()||null,zone:String(i.المنطقة||"").trim()||null,repName:y||null,repId:T,priceList:String(i["قائمة الأسعار"]||"retail").trim(),creditLimit:parseFloat(i["حد الائتمان"]||0)||0,paymentTerms:String(i["شروط الدفع"]||"net30").trim(),vatNumber:String(i["الرقم الضريبي"]||"").trim()||null,notes:String(i.ملاحظات||"").trim()||null,updatedAt:new Date().toISOString()};try{const I=d[b.toLowerCase()];if(I)await z("customers",I,x),o++;else{x.createdAt=new Date().toISOString(),x.balance=0;const m=await K(w.customers(),x);V("customers",m,b,{repId:x.repId||null}).then(c=>{c&&z("customers",m,c)}).catch(c=>console.warn(`[Import] COA sync failed for ${b}:`,c.message)),e++}}catch{n++}}document.getElementById("cust-import-overlay").remove(),showToast(`✅ مضاف: ${e} | محدث: ${o} | فاشل: ${n}`,"success"),u=[],await k(!0)};function $t(t){return u.find(e=>e.id===t)||null}function kt(t){const e=P(t.balance||0,t.creditLimit||0),o=Y(t);return[{heading:"بيانات العميل",rows:[{label:"اسم العميل",value:t.name,bold:!0},{label:"كود العميل",value:t.code,mono:!0},{label:"تاريخ الإضافة",value:o,mono:!0},{label:"رقم الهاتف",value:t.phone,mono:!0},{label:"البريد الإلكتروني",value:t.email},{label:"المنطقة",value:t.zone},{label:"المندوب",value:t.repName},{label:"قائمة الأسعار",value:t.priceList==="wholesale"?"الجملة":t.priceList==="retail"?"التجزئة":"الأساسي"}]},{heading:"بيانات مالية وقانونية",rows:[{label:"الرصيد الحالي",value:g(t.balance||0),mono:!0,bold:!0},{label:"حد الائتمان",value:g(t.creditLimit||0),mono:!0},{label:"نسبة استهلاك الحد",value:t.creditLimit>0?`${e.pct.toFixed(1)}%`:"بلا حد"},{label:"أيام الائتمان (مهلة السداد)",value:t.creditDays?`${t.creditDays} يوم`:"فوري (كاش)"},{label:"الرقم الضريبي",value:t.vatNumber,mono:!0},{label:"الهوية الوطنية / السجل التجاري",value:t.nationalId,mono:!0},{label:"ملاحظات",value:t.notes}]}]}window.previewCustomer=t=>{const e=$t(t);if(!e){showToast("لم يتم إيجاد العميل","error");return}const o=P(e.balance||0,e.creditLimit||0);xt({title:e.name,icon:"👤",badgeText:o.label,badgeColor:o.color==="good"?"good":o.color==="warn"?"warn":"bad",sections:kt(e),actions:[{icon:"✏️",label:"تعديل",fn:`document.getElementById('record-preview-overlay').remove();editCustomer('${t}')`,style:"background:var(--brand);color:#fff;"},{icon:"📝",label:"اتفاقية الحساب",fn:`document.getElementById('record-preview-overlay').remove();openCustomerAgreement('${t}')`,style:"background:#1E3A8A;color:#fff;"},{icon:"🖨️",label:"طباعة",fn:`printCustomer('${t}')`,style:"background:var(--bg-2);color:var(--text-1);"},{icon:"📄",label:"PDF",fn:`exportCustomerPDF('${t}')`,style:"background:#EF4444;color:#fff;"},{icon:"📊",label:"كشف حساب",fn:`viewCustomerStatement('${t}','${e.name.replace(/'/g,"\\'")}')`,style:"background:#10B981;color:#fff;"}]})};window.printCustomer=t=>{j(t)};window.exportCustomerPDF=t=>{j(t)};window.runCustomerCoaMigration=async()=>{const t=document.getElementById("btn-migrate-coa");if(window.confirm(`⚠️ هذه العملية ستُنشئ حسابات تفصيلية في شجرة الحسابات لكل عميل تحت مندوبه.

• العملاء التابعون لمندوب → تحت حساب المندوب (1-1-2-1-2-X)
• العملاء التجاريون المباشرون → تحت (1-1-2-1-1)

العملاء المرتبطون مسبقاً سيُتخطّوا تلقائياً.

هل تريد المتابعة؟`)){t&&(t.disabled=!0,t.textContent="⏳ جاري الترحيل...");try{const o=await mt(),n=[`✅ تم ترحيل: ${o.migrated.length} عميل`,`⏭️ تم تخطّي: ${o.skipped.length} عميل (مرتبط مسبقاً)`,o.errors.length>0?`❌ أخطاء: ${o.errors.join(", ")}`:""].filter(Boolean).join(`
`);o.migrated.length>0&&console.table(o.migrated),window.alert(n),await k()}catch(o){window.alert("❌ خطأ أثناء الترحيل: "+o.message),console.error("Customer COA Migration Error:",o)}finally{t&&(t.disabled=!1,t.innerHTML="<span>🔗</span> ترحيل ذمم العملاء")}}};window.showCustomerIntelligence=async(t,e)=>{const o=document.createElement("div");o.className="modal-overlay active",o.id="cust-intelligence-overlay",o.style.zIndex="1100",o.innerHTML=`
    <div class="modal" style="max-width:1150px; width:95%; max-height:92vh; display:flex; flex-direction:column; padding:0; overflow:hidden; border-radius:16px; background:var(--bg-1); border:1px solid var(--border-soft); box-shadow:0 24px 48px rgba(0,0,0,0.15);">
      <div class="modal-header" style="padding:20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; direction:rtl;">
        <h3 class="modal-title" style="display:flex; align-items:center; gap:8px; font-size:16px; font-weight:800; color:var(--brand); margin:0;">
          🧠 لوحة ذكاء العميل والتحليل الإحصائي: <span style="color:var(--text-1);">${e}</span>
        </h3>
        <div style="display:flex; gap:12px; align-items:center;">
          <button class="btn btn-secondary sm" onclick="window.printCustomerIntelligence()" style="display:flex; align-items:center; gap:6px; font-size:12px; padding:6px 12px;">
            🖨️ طباعة التحليل
          </button>
          <button class="modal-close" onclick="document.getElementById('cust-intelligence-overlay').remove()" style="font-size:24px; color:var(--text-3); background:none; border:none; cursor:pointer;">×</button>
        </div>
      </div>
      <div class="modal-body" id="cust-intel-body" style="padding:24px; overflow-y:auto; flex:1; display:flex; align-items:center; justify-content:center; min-height:350px; background:var(--bg-3);">
        <div class="loading-spinner"></div>
      </div>
    </div>
  `,document.body.appendChild(o);try{const[n,s,p,d]=await Promise.all([L(N(w.salesInvoices(),D("customerId","==",t))).catch(()=>({docs:[]})),L(N(w.receipts(),D("targetId","==",t))).catch(()=>({docs:[]})),L(N(w.customerContracts(),D("customerId","==",t))).catch(()=>({docs:[]})),L(N(w.customerComplaints(),D("customerId","==",t))).catch(()=>({docs:[]}))]),r=n.docs.map(a=>a.data()).filter(a=>a.status!=="cancelled"),i=s.docs.map(a=>a.data()).sort((a,l)=>(l.date||"").localeCompare(a.date||"")),b=p.docs.map(a=>a.data()),y=d.docs.map(a=>a.data()),T=new Date(Date.now()-30*864e5).toISOString().slice(0,10),I=r.filter(a=>(a.date||"").slice(0,10)>=T).reduce((a,l)=>a+(l.totalWithVat||l.total||0),0),m=u.find(a=>a.id===t)||{},c=R(I,m.tierOverride||m.manualTier),f=r.length,h=r.reduce((a,l)=>a+(l.subtotal||0),0),v=r.reduce((a,l)=>a+(l.totalWithVat||0),0),ot=r.reduce((a,l)=>a+(l.totalCost||0),0),W=h-ot,at=h>0?W/h*100:0,U=m&&m.balance||0,G=parseInt(m.loyaltyPoints)||0,Q=m.pinnedWarningNote||"",it=Math.max(0,v-U),nt=v>0?it/v*100:100;let O="—";if(f>1){const a=r.map($=>new Date($.date)).sort(($,X)=>$-X),A=(a[a.length-1]-a[0])/(1e3*60*60*24)/(f-1);O=A<=1?"يومي تقريباً":`كل ${A.toFixed(1)} يوم`}else f===1&&(O="فاتورة واحدة فقط");let Z="لا يوجد مدفوعات مسجلة";if(i.length>0){const a=i[0];Z=`${g(a.amount||0)} بتاريخ ${a.date||(a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:"—")}`}const rt=[...r].sort((a,l)=>(l.date||"").localeCompare(a.date||"")),E=[];rt.forEach(a=>{E.length>=5||(a.lines||[]).forEach(l=>{E.length>=5||E.some(C=>C.productId===l.productId)||E.push({productId:l.productId,name:l.productName,qty:l.qty||l.quantity||1,unit:l.unit&&l.unit!=="undefined"?l.unit:l.unitCode||"",price:l.unitPrice||l.price||0,date:a.date})})});const H=[...r].sort((a,l)=>(a.date||"").localeCompare(l.date||"")).slice(-10),st=Math.max(...H.map(a=>(a.subtotal||0)-(a.totalCost||0)),1),M=document.getElementById("cust-intel-body");if(!M)return;M.style.display="block",window.printCustomerIntelligence=()=>{const a=window.open("","_blank");a.document.write(`
        <html>
          <head>
            <title>لوحة ذكاء العميل - ${e}</title>
            <style>
              body {
                direction: rtl;
                text-align: right;
                font-family: system-ui, -apple-system, sans-serif;
                padding: 30px;
                background: #fff;
                color: #000;
              }
              h2, h3 { text-align: center; margin-bottom: 10px; color: #7C3AED; }
              .kpi-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
                margin-bottom: 24px;
              }
              .kpi-card {
                padding: 16px;
                border-radius: 12px;
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                position: relative;
              }
              .kpi-label { font-size: 11px; color: #6b7280; font-weight: 600; }
              .kpi-value { font-size: 20px; font-weight: 800; color: #111827; margin-top: 6px; }
              .mono { font-family: monospace; }
              .card {
                padding: 20px;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
                background: #fff;
                margin-bottom: 24px;
              }
              h4 { font-size: 13px; font-weight: 700; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 12px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: right; font-size: 11px; }
              th { background: #f3f4f6; }
              .badge {
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                display: inline-block;
              }
              .badge.good { background: #d1fae5; color: #065f46; }
              .badge.bad { background: #fee2e2; color: #991b1b; }
            </style>
          </head>
          <body>
            <h2>🧠 لوحة ذكاء العميل والتحليل الإحصائي</h2>
            <h3 style="color:#374151;">العميل: ${e}</h3>
            ${M.innerHTML}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 500);
              };
            <\/script>
          </body>
        </html>
      `),a.document.close()},M.innerHTML=`
      <div style="width:100%; display:flex; flex-direction:column; gap:20px; direction:rtl; text-align:right;">
        
        <!-- Action Toolbar -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; background:var(--bg-card); padding:12px 16px; border-radius:12px; border:1px solid var(--border-soft);">
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" onclick="window.viewCustomerStatement('${t}', '${e.replace(/'/g,"\\'")}')">📊 كشف حساب تفصيلي</button>
            ${m.phone?`
              <button class="btn btn-secondary btn-sm" style="color:#25D366;" onclick="window.open('https://api.whatsapp.com/send?phone=${m.phone.replace(/[^0-9]/g,"")}', '_blank')">💬 محادثة واتساب</button>
            `:""}
            ${m.googleMapsUrl?`
              <a href="${m.googleMapsUrl}" target="_blank" class="btn btn-secondary btn-sm" style="color:var(--brand); text-decoration:none;">📍 فتح في خرائط جوجل</a>
            `:""}
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <span class="badge" style="background:rgba(99,102,241,0.1); color:var(--brand); font-weight:800;">
              🎁 نقاط الولاء: ${G} نقطة (${g(G*.5)})
            </span>
            <span class="badge" style="background:rgba(16,185,129,0.1); color:#10B981; font-weight:800;">
              📜 العقود: ${b.length} عقد
            </span>
          </div>
        </div>

        <!-- Customer Tier & Volume Intelligence Banner -->
        <div style="background:linear-gradient(135deg, ${c.bg} 0%, var(--bg-card) 100%); padding:18px 20px; border-radius:14px; border:1px solid ${c.border}; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div style="font-size:36px; line-height:1;">
              ${c.key==="A"?"👑":c.key==="B"?"💎":c.key==="C"?"🚀":c.key==="D"?"📦":"⚪"}
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:18px; font-weight:800; color:${c.color}; font-family:var(--font-heading);">
                  ${c.label}
                </span>
                ${c.isManual?'<span class="badge neutral" style="font-size:10px;">🔒 تثبيت يدوي</span>':'<span class="badge neutral" style="font-size:10px;">⚡ تصنيف ديناميكي</span>'}
              </div>
              <div style="font-size:12px; color:var(--text-2); margin-top:3px;">
                ${c.desc}
              </div>
            </div>
          </div>
          <div style="text-align:left; min-width:200px;">
            <div style="font-size:11px; color:var(--text-3); font-weight:600;">مسحوبات آخر ٣٠ يوماً</div>
            <div class="mono" style="font-size:20px; font-weight:800; color:${c.color}; margin-top:2px;">
              ${g(I)}
            </div>
            <div style="font-size:11px; color:var(--text-2); margin-top:3px;">
              🎯 ${c.nextTierText}
            </div>
          </div>
        </div>

        ${Q?`
          <div class="alert bad" style="padding:12px 16px; font-weight:800; font-size:13px; border-radius:10px; display:flex; align-items:center; gap:8px;">
            <span>⚠️</span> <span><b>تحذير ائتماني مثبت للعميل:</b> ${Q}</span>
          </div>
        `:""}

        <div class="kpi-grid" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px;">
          <div class="kpi-card" style="padding:16px; border-radius:12px; background:var(--bg-2); border:1px solid var(--border-soft); position:relative;">
            <div style="background:var(--brand); height:4px; border-radius:4px 4px 0 0; position:absolute; top:0; left:0; right:0;"></div>
            <div style="font-size:12px; color:var(--text-3); font-weight:600;">📊 نشاط الفواتير</div>
            <div class="mono" style="font-size:22px; font-weight:800; color:var(--brand); margin-top:8px;">${f} <span style="font-size:12px; font-weight:500;">فاتورة</span></div>
            <div style="font-size:11px; color:var(--text-2); margin-top:4px;">متوسط الشراء: ${O}</div>
          </div>
          <div class="kpi-card" style="padding:16px; border-radius:12px; background:var(--bg-2); border:1px solid var(--border-soft); position:relative;">
            <div style="background:var(--indigo); height:4px; border-radius:4px 4px 0 0; position:absolute; top:0; left:0; right:0;"></div>
            <div style="font-size:12px; color:var(--text-3); font-weight:600;">💰 حجم المبيعات</div>
            <div class="mono" style="font-size:22px; font-weight:800; color:var(--indigo); margin-top:8px;">${g(h)}</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:4px;">شامل الضريبة: ${g(v)}</div>
          </div>
          <div class="kpi-card" style="padding:16px; border-radius:12px; background:var(--bg-2); border:1px solid var(--border-soft); position:relative;">
            <div style="background:var(--good); height:4px; border-radius:4px 4px 0 0; position:absolute; top:0; left:0; right:0;"></div>
            <div style="font-size:12px; color:var(--text-3); font-weight:600;">📈 صافي الربح</div>
            <div class="mono" style="font-size:22px; font-weight:800; color:var(--good); margin-top:8px;">${g(W)}</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:4px;">هامش الربح: ${at.toFixed(1)}%</div>
          </div>
          <div class="kpi-card" style="padding:16px; border-radius:12px; background:var(--bg-2); border:1px solid var(--border-soft); position:relative;">
            <div style="background:var(--warn); height:4px; border-radius:4px 4px 0 0; position:absolute; top:0; left:0; right:0;"></div>
            <div style="font-size:12px; color:var(--text-3); font-weight:600;">⏳ نسبة التحصيل</div>
            <div class="mono" style="font-size:22px; font-weight:800; color:var(--warn); margin-top:8px;">${nt.toFixed(1)}%</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:4px;">الرصيد: ${g(U)}</div>
          </div>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
          <div class="card" style="margin:0; padding:20px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
            <h4 style="font-size:14px; font-weight:700; color:var(--text-1); margin-bottom:16px;">📥 آخر السدادات</h4>
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${i.slice(0,5).map(a=>`
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-radius:8px; background:var(--bg-3); border:1px solid var(--border-soft);">
                  <div><div style="font-weight:600; font-size:12.5px;">سند رقم ${a.number||"—"}</div></div>
                  <div style="text-align:left;"><div class="font-bold text-good" style="font-size:13.5px;">+ ${g(a.amount||0)}</div><div style="font-size:11px; color:var(--text-3);">${a.date||"—"}</div></div>
                </div>`).join("")}
            </div>
            <div style="font-size:12px; font-weight:700; color:var(--brand); margin-top:16px; border-top:1px solid var(--border-soft); padding-top:12px;">آخر دفعة: ${Z}</div>
          </div>
          <div class="card" style="margin:0; padding:20px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
            <h4 style="font-size:14px; font-weight:700; color:var(--text-1); margin-bottom:16px;">📦 آخر بضائع مشتراة</h4>
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${E.map(a=>`
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-radius:8px; background:var(--bg-3); border:1px solid var(--border-soft);">
                  <div>
                    <div style="font-weight:600; font-size:12.5px;">${a.name}</div>
                    <div style="font-size:11px; color:var(--text-3); margin-top:2px;">التاريخ: ${a.date||"—"}</div>
                  </div>
                  <div style="text-align:left;">
                    <div class="mono font-bold" style="font-size:13px; color:var(--text-1);">${a.qty} ${a.unit||"حبة"}</div>
                    <div style="font-size:11px; color:var(--text-3); margin-top:2px;">سعر الوحدة: ${g(a.price)}</div>
                  </div>
                </div>
              `).join("")}
              ${E.length===0?`
                <div style="text-align:center; padding:40px; color:var(--text-3); font-size:12.5px;">لا توجد مشتريات بضائع مسجلة.</div>
              `:""}
            </div>
          </div>
        </div>

        <!-- Row 3: Sales Invoices & Detailed Profits Table -->
        <div class="card" style="margin:0; padding:20px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
          <h4 style="font-size:14px; font-weight:700; color:var(--text-1); margin-bottom:16px; display:flex; align-items:center; gap:8px;">
            📄 فواتير مبيعات العميل وأرباحها التفصيلية
          </h4>
          <div style="max-height:220px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:8px;">
            <table class="data-dense" style="width:100%; border-collapse:collapse; text-align:right; font-size:12px;">
              <thead style="position:sticky; top:0; background:var(--bg-2); border-bottom:2px solid var(--border-soft); z-index:1;">
                <tr>
                  <th style="padding:10px;">رقم الفاتورة</th>
                  <th style="padding:10px;">التاريخ</th>
                  <th style="padding:10px;">قيمة الفاتورة (شامل)</th>
                  <th style="padding:10px;">قيمة المبيعات (خارج)</th>
                  <th style="padding:10px;">تكلفة البضاعة (COGS)</th>
                  <th style="padding:10px;">صافي الربح</th>
                  <th style="padding:10px;">هامش الربح %</th>
                </tr>
              </thead>
              <tbody>
                ${r.map(a=>{const l=a.totalWithVat||0,C=a.subtotal||0,A=a.totalCost||0,$=C-A,X=C>0?$/C*100:0;return`
                    <tr style="border-bottom:1px solid var(--border-soft);">
                      <td style="padding:10px; font-weight:600; color:var(--brand);">${a.number||a.invoiceNumber||a.id}</td>
                      <td style="padding:10px; color:var(--text-3);">${a.date||"—"}</td>
                      <td style="padding:10px;" class="mono">${g(l)}</td>
                      <td style="padding:10px;" class="mono">${g(C)}</td>
                      <td style="padding:10px; color:var(--text-3);" class="mono">${g(A)}</td>
                      <td style="padding:10px; font-weight:600; color:${$>=0?"var(--good)":"var(--bad)"}" class="mono">${g($)}</td>
                      <td style="padding:10px;" class="mono"><span class="badge ${$>=0?"good":"bad"}" style="font-size:11px; padding:2px 8px;">${X.toFixed(1)}%</span></td>
                    </tr>
                  `}).join("")}
                ${r.length===0?`
                  <tr>
                    <td colspan="7" style="text-align:center; padding:30px; color:var(--text-3);">لا توجد فواتير مبيعات مسجلة لهذا العميل.</td>
                  </tr>
                `:""}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Row 4: CSS Bar Graph representing Profitability per Invoice (last 10 invoices) -->
        ${H.length>0?`
          <div class="card" style="margin:0; padding:20px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
            <h4 style="font-size:14px; font-weight:700; color:var(--text-1); margin-bottom:24px;">
              📈 رسم بياني لحجم الأرباح من آخر 10 فواتير للعميل
            </h4>
            <div style="display:flex; height:150px; align-items:end; gap:20px; padding:0 20px; position:relative; border-bottom:1px solid var(--border);">
              ${H.map(a=>{const l=(a.subtotal||0)-(a.totalCost||0),C=l/st*100;return`
                  <div style="flex:1; display:flex; flex-direction:column; align-items:center; height:100%; justify-content:end; position:relative;">
                    <div class="mono" style="font-size:9.5px; font-weight:700; color:var(--good); margin-bottom:4px; position:absolute; bottom:${C+4}%;">
                      ${Math.round(l)}
                    </div>
                    <div style="width:24px; height:${C}%; background:linear-gradient(to top, var(--good-soft), var(--good)); border-radius:4px 4px 0 0; transition:height 0.3s ease;"></div>
                    <div class="mono" style="font-size:9px; color:var(--text-3); margin-top:8px; white-space:nowrap; transform:rotate(-20deg); transform-origin:top right; margin-right:-10px;">
                      ${a.number||a.id.slice(0,8)}
                    </div>
                  </div>
                `}).join("")}
            </div>
          </div>
        `:""}
      </div>
    `}catch(n){const s=document.getElementById("cust-intel-body");s&&(s.innerHTML=`<div class="alert bad">${n.message}</div>`)}};export{R as getCustomerTierInfo,Pt as render};
