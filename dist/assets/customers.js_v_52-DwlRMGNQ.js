const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css","assets/trust-receipts.js_v_2-C9I3kW4K.js","assets/debt-acknowledgment.js_v_2-H-BqRKEN.js","assets/coa-connector-9pNG4b1x.js"])))=>i.map(i=>d[i]);
import{g as L,C,w as Bt,G as K,f as y,_ as D,u as j,c as pt,r as At}from"./index-CF9GFeRJ.js";import{updateEntityInCoa as Tt,syncEntityToCoa as nt,deleteEntityInCoa as Dt,migrateCustomerCoa as St}from"./coa-connector-9pNG4b1x.js";import{e as zt,d as Mt,i as Lt}from"./excel-DM5XZHtQ.js";import{s as Ft}from"./record-actions-BUPPxq1M.js";import{syncCustomerNameEverywhere as _t,syncCustomerBalanceToCoa as Nt}from"./sync-engine-B3XmYvGy.js";import{o as J}from"./customer-agreement.js_v_4-BRC8KxgR.js";import{where as P,orderBy as rt,limit as Pt,getDocs as Y,query as W}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";window.openCustomerAgreement=J;window.openBlankCustomerAgreement=()=>J(null,!0);let m=[],Q=[],at="",V="desc",M="all",H="all",ut="last30",mt="",gt="";function dt(t){return t?String(t).trim().replace(/[\u064B-\u065F\u0670]/g,"").replace(/[إأآا]/g,"ا").replace(/ة/g,"ه").replace(/[ىي]/g,"ي").replace(/[()\[\]{}\-_\/\\.,:;+*="']/g," ").replace(/\s+/g," ").toLowerCase():""}function G(t,e){if(!e)return!0;const o=dt(t),n=dt(e);return o.includes(n)?!0:n.split(" ").filter(Boolean).every(s=>{if(o.includes(s))return!0;if(s.startsWith("ال")&&s.length>3){const c=s.slice(2);if(o.includes(c))return!0}return!1})}function U(t){const e=(t||"").toLowerCase().replace(/[\u064B-\u065F\u0670]/g,"").replace(/[إأآا]/g,"ا").replace(/[ىي]/g,"ي").replace(/ة/g,"ه");return/مطعم|شواي|مشوي|وجبات|برجر|بخاري|مندي|فطائر|فطاير|اسماك|سمك|حلواني|مطبخ|كبس|شاورما|بيتزا|اكلات|طباخ|اعاش|إعاش/.test(e)?{key:"restaurant",label:"مطاعم وإعاشة",icon:"🍽️",color:"#ea580c",bg:"rgba(234,88,12,0.1)"}:/تموين|ماركت|اسواق|سوبرماركت/.test(e)?{key:"catering",label:"تموينات وأسواق",icon:"🏪",color:"#0284c7",bg:"rgba(2,132,199,0.1)"}:/بقال|دكان/.test(e)?{key:"grocery",label:"بقالات",icon:"🛒",color:"#16a34a",bg:"rgba(22,163,74,0.1)"}:/فندق|فنادق|منتجع|ايواء|شقق|نزل|سياحي|اجنح|شاليه/.test(e)?{key:"hotel",label:"فنادق وإيواء",icon:"🏨",color:"#7c3aed",bg:"rgba(124,58,237,0.1)"}:/كافيه|مقهى|مقهي|كوفي|شاي|عصير|عصائر/.test(e)?{key:"cafe",label:"كافيهات ومقاهي",icon:"☕",color:"#b45309",bg:"rgba(180,83,9,0.1)"}:{key:"other",label:"تجارية وأخرى",icon:"🏢",color:"#64748b",bg:"rgba(100,116,139,0.1)"}}function Rt(t,e="",o=""){const n=new Date,i=n.toISOString().slice(0,10),s=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],c=s[n.getMonth()],p=new Date(n.getFullYear(),n.getMonth()-1,1),a=s[p.getMonth()];if(t==="currentMonth")return{from:`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-01`,to:i,label:`مسحوبات الشهر الحالي (${c})`,shortLabel:`الشهر الحالي (${c})`,curMonthName:c,prevMonthName:a};if(t==="lastMonth"){const l=`${p.getFullYear()}-${String(p.getMonth()+1).padStart(2,"0")}-01`,b=new Date(n.getFullYear(),n.getMonth(),0),u=`${b.getFullYear()}-${String(b.getMonth()+1).padStart(2,"0")}-${String(b.getDate()).padStart(2,"0")}`;return{from:l,to:u,label:`مسحوبات الشهر السابق (${a})`,shortLabel:`الشهر السابق (${a})`,curMonthName:c,prevMonthName:a}}return t==="allTime"?{from:"2000-01-01",to:"9999-12-31",label:"إجمالي المسحوبات (كامل الفترة)",shortLabel:"كامل الفترة",curMonthName:c,prevMonthName:a}:t==="custom"&&e?{from:e,to:o||i,label:`مسحوبات الفترة (${e} إلى ${o||i})`,shortLabel:"فترة مخصصة",curMonthName:c,prevMonthName:a}:{from:new Date(Date.now()-30*864e5).toISOString().slice(0,10),to:i,label:"مسحوبات الشهر (آخر ٣٠ يوماً)",shortLabel:"آخر ٣٠ يوماً",curMonthName:c,prevMonthName:a}}async function Z(t,e="",o=""){ut=t,mt=e,gt=o;const n=Rt(t,e,o);if(n.from&&n.from<at)try{const a=n.from==="2000-01-01"?[]:[P("date",">=",n.from)];Q=await L(C.salesInvoices(),a)||[],at=n.from}catch{}const i={};(Q||[]).forEach(a=>{if(a.status==="cancelled"||!a.customerId)return;const d=a.date||(a.createdAt?.toDate?a.createdAt.toDate().toISOString().slice(0,10):typeof a.createdAt=="string"?a.createdAt.slice(0,10):"");d>=n.from&&d<=n.to&&(i[a.customerId]=(i[a.customerId]||0)+(a.totalWithVat||a.total||0))}),m.forEach(a=>{a.monthlySales=i[a.id]||0,a.tier=it(a.monthlySales,a.tierOverride||a.manualTier)});const s=document.getElementById("th-sales-period");s&&(s.textContent=n.label);const c=document.getElementById("tier-filter-title");c&&(c.textContent=`🎯 تصنيف العملاء (حسب ${n.shortLabel}):`),vt(m),yt(m);const p=document.getElementById("cust-tbody");p&&tt(m,p)}function it(t=0,e=null){const o=Number(t)||0;return e&&e!=="auto"&&["A","B","C","D"].includes(e)?e==="A"?{key:"A",label:"👑 فئة A (VIP)",badgeClass:"tier-badge-a",color:"#D4AF37",bg:"rgba(212,175,55,0.15)",border:"rgba(212,175,55,0.45)",isManual:!0,desc:"كبار الحسابات والشركاء (> 20,000 ر.س)",nextTierText:"أعلى شريحة (VIP) 👑"}:e==="B"?{key:"B",label:"💎 فئة B (مميز)",badgeClass:"tier-badge-b",color:"#818cf8",bg:"rgba(99,102,241,0.15)",border:"rgba(99,102,241,0.45)",isManual:!0,desc:"عملاء رئيسيون (10,001 - 20,000 ر.س)",nextTierText:`متبقي ${Math.max(0,20001-o).toLocaleString()} ر.س للترقية إلى فئة A`}:e==="C"?{key:"C",label:"🚀 فئة C (نمو)",badgeClass:"tier-badge-c",color:"#34d399",bg:"rgba(16,185,129,0.15)",border:"rgba(16,185,129,0.45)",isManual:!0,desc:"عملاء متوسطون (5,001 - 10,000 ر.س)",nextTierText:`متبقي ${Math.max(0,10001-o).toLocaleString()} ر.س للترقية إلى فئة B`}:{key:"D",label:"📦 فئة D (تجزئة)",badgeClass:"tier-badge-d",color:"#fb923c",bg:"rgba(249,115,22,0.15)",border:"rgba(249,115,22,0.45)",isManual:!0,desc:"صغار العملاء (1 - 5,000 ر.س)",nextTierText:`متبقي ${Math.max(0,5001-o).toLocaleString()} ر.س للترقية إلى فئة C`}:o>2e4?{key:"A",label:"👑 فئة A (VIP)",badgeClass:"tier-badge-a",color:"#D4AF37",bg:"rgba(212,175,55,0.15)",border:"rgba(212,175,55,0.45)",isManual:!1,desc:"كبار الحسابات والشركاء (مسحوبات > 20,000 ر.س)",nextTierText:"أعلى شريحة (VIP) 👑"}:o>1e4?{key:"B",label:"💎 فئة B (مميز)",badgeClass:"tier-badge-b",color:"#818cf8",bg:"rgba(99,102,241,0.15)",border:"rgba(99,102,241,0.45)",isManual:!1,desc:"عملاء رئيسيون (10,001 - 20,000 ر.س)",nextTierText:`متبقي ${(20001-o).toLocaleString()} ر.س للترقية إلى فئة A`}:o>5e3?{key:"C",label:"🚀 فئة C (نمو)",badgeClass:"tier-badge-c",color:"#34d399",bg:"rgba(16,185,129,0.15)",border:"rgba(16,185,129,0.45)",isManual:!1,desc:"عملاء متوسطون (5,001 - 10,000 ر.س)",nextTierText:`متبقي ${(10001-o).toLocaleString()} ر.س للترقية إلى فئة B`}:o>0?{key:"D",label:"📦 فئة D (تجزئة)",badgeClass:"tier-badge-d",color:"#fb923c",bg:"rgba(249,115,22,0.15)",border:"rgba(249,115,22,0.45)",isManual:!1,desc:"صغار العملاء (1 - 5,000 ر.س)",nextTierText:`متبقي ${(5001-o).toLocaleString()} ر.س للترقية إلى فئة C`}:{key:"inactive",label:"⚪ غير نشط",badgeClass:"tier-badge-inactive",color:"#94a3b8",bg:"rgba(148,163,184,0.12)",border:"rgba(148,163,184,0.3)",isManual:!1,desc:"بلا مسحوبات خلال آخر 30 يوماً",nextTierText:"يحتاج لشراء 1 ر.س لدخول فئة D"}}function bt(t){if(!t)return"—";if(t.createdAt){if(t.createdAt.toDate)return t.createdAt.toDate().toISOString().split("T")[0];if(t.createdAt.seconds)return new Date(t.createdAt.seconds*1e3).toISOString().split("T")[0];if(typeof t.createdAt=="string")return t.createdAt.slice(0,10)}return t.createdDate?String(t.createdDate).slice(0,10):t.dateAdded?String(t.dateAdded).slice(0,10):t.date?String(t.date).slice(0,10):"—"}function ct(t){if(!t)return 0;if(t.createdAt?.toDate)return t.createdAt.toDate().getTime();if(t.createdAt?.seconds)return t.createdAt.seconds*1e3;if(typeof t.createdAt=="string"){const e=new Date(t.createdAt).getTime();if(!isNaN(e))return e}if(t.createdDate){const e=new Date(t.createdDate).getTime();if(!isNaN(e))return e}if(t.dateAdded){const e=new Date(t.dateAdded).getTime();if(!isNaN(e))return e}if(t.date){const e=new Date(t.date).getTime();if(!isNaN(e))return e}return 0}function ft(t){return t.map(e=>{const o=K(e.balance||0,e.creditLimit||0),n=bt(e),i=e.tier||it(e.monthlySales||0,e.tierOverride),s=U(e.name),c=e.monthlySales||0;return`<tr>
      <td>
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <div class="font-semibold font-heading" 
               style="color:var(--brand); cursor:pointer; text-decoration:underline; font-weight:800;" 
               onclick="window.showCustomerIntelligence('${e.id}', '${e.name.replace(/'/g,"\\'")}')"
               title="🧠 عرض لوحة ذكاء العميل والتحليل الإحصائي">
            ${e.name}
          </div>
          <span class="activity-badge" style="background:${s.bg}; color:${s.color}; border:1px solid ${s.color}45; padding:2px 7px; border-radius:6px; font-size:10px; font-weight:700;" title="النشاط المقدر من الاسم: ${s.label}">
            ${s.icon} ${s.label}
          </span>
          <span class="tier-badge ${i.badgeClass}" title="${i.desc}">
            ${i.label} ${i.isManual?"🔒":""}
          </span>
        </div>
        <div style="font-size:11px;color:var(--text-2);display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-top:2px;">
          <span class="mono">${e.code||""}</span>
          ${n!=="—"?`<span style="font-size:10px;color:var(--text-2);background:rgba(0,0,0,0.05);padding:1px 5px;border-radius:4px;" title="تاريخ إضافة العميل">📅 ${n}</span>`:""}
          ${e.hasBrokerCommission?`<span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:800; font-size:10px; cursor:pointer;" onclick="event.stopPropagation(); navigate('broker-statement');" title="كشف حساب الوسيط">💼 وسيط: ${e.brokerName||"زياد"} (${e.brokerRate||1}%)</span>`:""}
          ${e.status==="pending_approval"||e.approvalStatus==="pending"?'<span class="badge" style="background:#fffbeb; color:#d97706; border:1px solid #fde68a; font-weight:800; font-size:10px;">🟡 بانتظار الاعتماد المالي</span>':""}
          ${Array.isArray(e.attachments)&&e.attachments.length>0?`
            <button type="button" class="btn btn-sm" style="background:#0284c7; color:#fff; border:none; padding:2px 8px; border-radius:6px; font-weight:800; font-size:10.5px; cursor:pointer; display:inline-flex; align-items:center; gap:4px; box-shadow:0 1px 4px rgba(2,132,199,0.35);" onclick="window.openCustomerAttachmentsModal('${e.id}')" title="عرض وفحص المستندات الرسمية المرفوعة للعميل">
              📁 المستندات (${e.attachments.length})
            </button>
          `:""}
        </div>
      </td>
      <td class="mono dim" style="white-space:nowrap;">
        ${n!=="—"?`<span class="badge neutral mono" style="font-size:11px;font-weight:600;">📅 ${n}</span>`:"—"}
      </td>
      <td style="white-space:nowrap;">
        <div class="mono font-bold" style="color:${i.color}; font-size:12.5px;">
          ${y(c)}
        </div>
        <div class="dim" style="font-size:10px;" title="${i.nextTierText}">
          ${i.nextTierText}
        </div>
      </td>
      <td class="mono dim">${e.phone||"—"}</td>
      <td class="dim">${e.zone||"—"}</td>
      <td class="dim">${e.repName||"—"}</td>
      <td class="mono ${e.balance>0?"text-bad":"text-good"}">${y(e.balance||0)}</td>
      <td class="mono">${y(e.creditLimit||0)}</td>
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
          ${e.status==="pending_approval"||e.approvalStatus==="pending"?`<button class="btn btn-icon sm" style="background:#059669; color:#fff; font-weight:bold; box-shadow:0 2px 8px rgba(5,150,105,0.4);" onclick="window.approveSalesManagerCustomer('${e.id}', '${e.name.replace(/'/g,"\\'")}')" title="اعتماد العميل وتفعيل حسابه بالشجرة">✅</button>`:""}
          ${Array.isArray(e.attachments)&&e.attachments.length>0?`<button class="btn btn-icon sm" style="background:#0284c7; color:#fff; border:1px solid #0369a1; font-weight:bold; box-shadow:0 1px 4px rgba(2,132,199,0.3);" onclick="window.openCustomerAttachmentsModal('${e.id}')" title="عرض الأوراق والمستندات الرسمية (KYC)">📁</button>`:""}
          <button class="btn btn-icon sm btn-ghost" onclick="previewCustomer('${e.id}')" title="معاينة">👁️</button>
          <button class="btn btn-icon sm btn-ghost" onclick="editCustomer('${e.id}')" title="تعديل">✏️</button>
          <button class="btn btn-icon sm" style="background:rgba(30,58,138,.12);color:#1E3A8A;border:1px solid rgba(30,58,138,.3);" onclick="openCustomerAgreement('${e.id}')" title="اتفاقية فتح / تحديث حساب">📝</button>
          <button class="btn btn-icon sm btn-ghost" onclick="printCustomer('${e.id}')" title="طباعة">🖨️</button>
          <button class="btn btn-icon sm btn-ghost" onclick="exportCustomerPDF('${e.id}')" title="PDF">📄</button>
          <button class="btn btn-icon sm btn-ghost" onclick="viewCustomerStatement('${e.id}','${e.name.replace(/'/g,"\\'")}')" title="كشف حساب">📊</button>
          ${e.hasBrokerCommission?`<button class="btn btn-icon sm" style="background:rgba(2,132,199,.15);color:#0284c7;border:1px solid rgba(2,132,199,.35);" onclick="navigate('broker-statement')" title="كشف حساب عمولات الوسيط (${e.brokerName||"زياد"})">💼</button>`:""}
          <button class="btn btn-icon sm" style="background:rgba(3,105,161,.12);color:#0284c7;border:1px solid rgba(3,105,161,.3);" onclick="issueTrustReceiptFromCustomers('${e.id}')" title="إصدار سند أمانة وعهدة مالية (م/79)">🛡️</button>
          <button class="btn btn-icon sm" style="background:rgba(220,38,38,.10);color:#DC2626;border:1px solid rgba(220,38,38,.25);" onclick="issueDebtAckFromCustomers('${e.id}')" title="إقرار مديونية وتعهد سداد">⚖️</button>
          <button class="btn btn-icon sm" style="background:rgba(124,58,237,.10);color:#7C3AED;border:1px solid rgba(124,58,237,.2);" onclick="issuePromissoryNote('${e.id}','${e.name.replace(/'/g,"\\'")}')" title="إصدار سند أمر">📜</button>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteCustomer('${e.id}','${e.name.replace(/'/g,"\\'")}')" title="حذف">🗑️</button>
        </div>
      </td>
    </tr>`}).join("")}window.viewCustomerStatement=(t,e)=>{window.navigate&&(window.navigate("customer-statement"),setTimeout(()=>{window.selectStmtCustomer&&window.selectStmtCustomer(t)},300))};window.setCustomerTierFilter=t=>{M=t,document.querySelectorAll(".tier-filter-btn").forEach(n=>n.classList.remove("active"));const e=document.getElementById(`tier-btn-${t}`);e&&e.classList.add("active");const o=document.getElementById("cust-tbody");o&&m.length>0&&tt(m,o)};async function ee(t,e){const o=m&&m.length>0;t.innerHTML=`
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

      .activity-filter-btn {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 5px 12px; border-radius: 20px; font-size: 11.5px; font-weight: 700;
        border: 1px solid var(--border-soft); background: var(--bg-1); color: var(--text-2);
        cursor: pointer; transition: all 0.2s ease;
      }
      .activity-filter-btn:hover { background: var(--bg-3); color: var(--text-1); }
      .activity-filter-btn.active { background: #0284c7; color: #fff !important; border-color: #0284c7 !important; box-shadow: 0 2px 8px rgba(2,132,199,0.3); }
    </style>

    <div class="filterbar">
      <div class="search-bar" style="max-width:280px;">
        <input type="text" id="cust-search" class="input" placeholder="🔍  بحث في العملاء والأنشطة…" />
      </div>
      <div class="filter-select-group">
        <label>فترة المسحوبات</label>
        <select id="cust-period-filter" onchange="window.changeCustomerSalesPeriod(this.value)">
          <option value="last30" selected>آخر ٣٠ يوماً</option>
          <option value="currentMonth">الشهر الحالي (أكتوبر)</option>
          <option value="lastMonth">الشهر السابق (سبتمبر)</option>
          <option value="allTime">كامل الفترة (كل المبيعات)</option>
          <option value="custom">📅 فترة مخصصة…</option>
        </select>
      </div>
      <div class="filter-select-group" id="cust-custom-dates" style="display:none; flex-direction:row; align-items:flex-end; gap:6px;">
        <div>
          <label style="font-size:10px;">من تاريخ</label>
          <input type="date" id="cust-from-date" class="input sm" style="font-size:11px; padding:3px 6px;" onchange="window.recalcCustomerPeriodSales()" />
        </div>
        <div>
          <label style="font-size:10px;">إلى تاريخ</label>
          <input type="date" id="cust-to-date" class="input sm" style="font-size:11px; padding:3px 6px;" onchange="window.recalcCustomerPeriodSales()" />
        </div>
      </div>
      <div class="filter-select-group">
        <label>نشاط العميل</label>
        <select id="cust-activity-filter" onchange="window.onCustomerActivitySelectChange(this.value)">
          <option value="all">كل الأنشطة</option>
          <option value="restaurant">🍽️ مطاعم وإعاشة</option>
          <option value="catering">🏪 تموينات وأسواق</option>
          <option value="grocery">🛒 بقالات</option>
          <option value="hotel">🏨 فنادق وإيواء</option>
          <option value="cafe">☕ كافيهات ومقاهي</option>
          <option value="other">🏢 تجارية وأخرى</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>المنطقة</label>
        <select id="cust-zone-filter" onchange="window.filterCustomersList()">
          <option value="">الكل</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>المندوب</label>
        <select id="cust-rep-filter" onchange="window.filterCustomersList()">
          <option value="">الكل</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>الائتمان</label>
        <select id="cust-credit-filter" onchange="window.filterCustomersList()">
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
        <a href="sales-manager.html" target="_blank" class="btn-export" style="background:#0284c7;color:#fff;text-decoration:none;" title="فتح بوابة مدير المبيعات الميدانية"><span>💼</span> بوابة مدير المبيعات</a>
        <button class="btn btn-primary" onclick="openCustomerModal()">+ إضافة عميل</button>
      </div>
    </div>

    <div class="page-content">
      <!-- Business Activity Quick Filter Pills -->
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-bottom:10px; background:var(--bg-1); padding:10px 14px; border-radius:12px; border:1px solid var(--border-soft);">
        <span style="font-weight:800; font-size:12px; color:var(--text-1); margin-left:4px;">🏢 نشاط العميل (مشتق من الاسم):</span>
        <button class="activity-filter-btn active" id="act-btn-all" onclick="window.setCustomerActivityFilter('all')">🌟 كل الأنشطة (<span id="acount-all">0</span>)</button>
        <button class="activity-filter-btn" id="act-btn-restaurant" onclick="window.setCustomerActivityFilter('restaurant')" style="border-color:rgba(234,88,12,0.3); color:#ea580c;">🍽️ مطاعم وإعاشة (<span id="acount-restaurant">0</span>)</button>
        <button class="activity-filter-btn" id="act-btn-catering" onclick="window.setCustomerActivityFilter('catering')" style="border-color:rgba(2,132,199,0.3); color:#0284c7;">🏪 تموينات وأسواق (<span id="acount-catering">0</span>)</button>
        <button class="activity-filter-btn" id="act-btn-grocery" onclick="window.setCustomerActivityFilter('grocery')" style="border-color:rgba(22,163,74,0.3); color:#16a34a;">🛒 بقالات (<span id="acount-grocery">0</span>)</button>
        <button class="activity-filter-btn" id="act-btn-hotel" onclick="window.setCustomerActivityFilter('hotel')" style="border-color:rgba(124,58,237,0.3); color:#7c3aed;">🏨 فنادق وإيواء (<span id="acount-hotel">0</span>)</button>
        <button class="activity-filter-btn" id="act-btn-cafe" onclick="window.setCustomerActivityFilter('cafe')" style="border-color:rgba(180,83,9,0.3); color:#b45309;">☕ كافيهات ومقاهي (<span id="acount-cafe">0</span>)</button>
        <button class="activity-filter-btn" id="act-btn-other" onclick="window.setCustomerActivityFilter('other')" style="color:#64748b;">🏢 تجارية وأخرى (<span id="acount-other">0</span>)</button>
      </div>

      <!-- Tier Quick Filter Pills -->
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-bottom:14px; background:var(--bg-2); padding:10px 14px; border-radius:12px; border:1px solid var(--border-soft);">
        <span style="font-weight:800; font-size:12px; color:var(--text-1); margin-left:4px;" id="tier-filter-title">🎯 تصنيف العملاء (حسب مسحوبات ٣٠ يوماً):</span>
        <button class="tier-filter-btn active" id="tier-btn-all" onclick="window.setCustomerTierFilter('all')">🌟 الكل (<span id="tcount-all">0</span>)</button>
        <button class="tier-filter-btn" id="tier-btn-pending" onclick="window.setCustomerTierFilter('pending')" style="border-color:#f59e0b; color:#d97706; background:#fffbeb;">🟡 بانتظار الاعتماد (<span id="tcount-pending">0</span>)</button>
        <button class="tier-filter-btn" id="tier-btn-kyc" onclick="window.setCustomerTierFilter('kyc')" style="border-color:#0284c7; color:#0284c7; background:#f0f9ff; font-weight:800;">📁 بمرفقات KYC (<span id="tcount-kyc">0</span>)</button>
        <button class="tier-filter-btn" id="tier-btn-A" onclick="window.setCustomerTierFilter('A')" style="border-color:rgba(212,175,55,0.4); color:#D4AF37;">👑 فئة A (> 20 ألف) (<span id="tcount-A">0</span>)</button>
        <button class="tier-filter-btn" id="tier-btn-B" onclick="window.setCustomerTierFilter('B')" style="border-color:rgba(99,102,241,0.4); color:#818CF8;">💎 فئة B (10 - 20 ألف) (<span id="tcount-B">0</span>)</button>
        <button class="tier-filter-btn" id="tier-btn-C" onclick="window.setCustomerTierFilter('C')" style="border-color:rgba(16,185,129,0.4); color:#34D399;">🚀 فئة C (5 - 10 آلاف) (<span id="tcount-C">0</span>)</button>
        <button class="tier-filter-btn" id="tier-btn-D" onclick="window.setCustomerTierFilter('D')" style="border-color:rgba(249,115,22,0.4); color:#FB923C;">📦 فئة D (1 - 5 آلاف) (<span id="tcount-D">0</span>)</button>
        <button class="tier-filter-btn" id="tier-btn-inactive" onclick="window.setCustomerTierFilter('inactive')" style="color:#94A3B8;">⚪ غير نشط (0) (<span id="tcount-inactive">0</span>)</button>
      </div>

      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">العملاء</h1>
          <p class="page-subtitle" id="cust-count">${o?`${m.length} عميل`:""}</p>
        </div>
        <div style="margin-right:auto;display:flex;gap:8px;align-items:center;">
          <button class="btn btn-secondary btn-icon sm" id="cust-refresh-btn" onclick="refreshCustomers()" title="تحديث البيانات" style="font-size:13px;padding:6px 12px;">🔄  تحديث</button>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead><tr>
              <th>اسم العميل والنشاط والشريحة</th>
              <th style="cursor:pointer; user-select:none; white-space:nowrap;" onclick="window.toggleCustomerDateSort()" title="اضغط للترتيب حسب تاريخ الإضافة">
                <div style="display:inline-flex; align-items:center; gap:6px; color:var(--brand); font-weight:700;">
                  <span>تاريخ الإضافة</span>
                  <span id="cust-date-sort-icon" style="font-size:11px; background:rgba(59,130,246,0.12); color:#2563EB; padding:1px 6px; border-radius:4px; border:1px solid rgba(59,130,246,0.25);">
                    ${V==="desc"?"⬇️ الأحدث":"⬆️ الأقدم"}
                  </span>
                </div>
              </th>
              <th id="th-sales-period">مسحوبات (آخر ٣٠ يوماً)</th>
              <th>الهاتف</th><th>المنطقة</th>
              <th>المندوب</th><th>الرصيد الحالي</th><th>حد الائتمان</th>
              <th>استخدام الائتمان</th><th>قائمة الأسعار</th><th></th>
            </tr></thead>
            <tbody id="cust-tbody">
              ${o?ft(m):`
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

          <!-- عمولة الوسيط والمندوب الخارجي (اختياري) -->
          <div class="card mb-16" style="padding:12px 14px; background:rgba(2,132,199,0.04); border:1.2px solid rgba(2,132,199,0.25); border-radius:10px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
              <div style="font-size:12.5px; font-weight:900; color:#0284c7; display:flex; align-items:center; gap:6px;">
                <span>💼</span>
                <span>عمولة الوسيط التجاري / المندوب الخارجي (اختياري)</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <input type="checkbox" id="cust-has-broker" onchange="window.toggleBrokerFields(this.checked)" style="width:16px;height:16px;cursor:pointer;" />
                <label for="cust-has-broker" style="margin-bottom:0; cursor:pointer; font-weight:800; font-size:12px; color:#004d80;">تفعيل عمولة وسيط لهذا العميل</label>
              </div>
            </div>
            <div id="cust-broker-fields" style="display:none; grid-template-columns:1.5fr 1fr 1.5fr; gap:10px; margin-top:8px;">
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">اسم الوسيط / المستفيد *</label>
                <input type="text" id="cust-broker-name" class="input font-bold" placeholder="مثال: زياد" value="زياد" />
              </div>
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">نسبة العمولة المضافة (%) *</label>
                <input type="number" id="cust-broker-rate" class="input mono font-bold" value="1.0" step="0.1" min="0" max="50" />
              </div>
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">شرط الاستحقاق والترحيل *</label>
                <select id="cust-broker-trigger" class="input">
                  <option value="on_invoice" selected>فور إصدار الفاتورة (الاستحقاق الفوري المباشر)</option>
                  <option value="on_payment">عند سداد العميل للفاتورة</option>
                </select>
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
    </div>`;const n=t.querySelector("#cust-search");n&&n.addEventListener("input",Bt(()=>window.filterCustomersList(),200)),await Promise.all([Ot(),T()])}async function Ot(){try{const t=await L(C.salesReps(),[rt("name")]),e=document.getElementById("cust-rep-filter"),o=document.getElementById("cust-rep");t.forEach(n=>{e&&(e.innerHTML+=`<option value="${n.id}">${n.name}</option>`),o&&(o.innerHTML+=`<option value="${n.id}">${n.name}</option>`)})}catch{}}function vt(t){const e=t.length,o=t.filter(l=>l.tier?.key==="A").length,n=t.filter(l=>l.tier?.key==="B").length,i=t.filter(l=>l.tier?.key==="C").length,s=t.filter(l=>l.tier?.key==="D").length,c=t.filter(l=>l.tier?.key==="inactive").length,p=t.filter(l=>l.status==="pending_approval"||l.approvalStatus==="pending").length,a=t.filter(l=>Array.isArray(l.attachments)&&l.attachments.length>0).length,d=(l,b)=>{const u=document.getElementById(l);u&&(u.textContent=b)};d("tcount-all",e),d("tcount-pending",p),d("tcount-kyc",a),d("tcount-A",o),d("tcount-B",n),d("tcount-C",i),d("tcount-D",s),d("tcount-inactive",c)}function yt(t){const e=t||m||[],o={all:e.length,restaurant:0,catering:0,grocery:0,hotel:0,cafe:0,other:0};e.forEach(i=>{const s=U(i.name);o[s.key]!==void 0?o[s.key]++:o.other++});const n=(i,s)=>{const c=document.getElementById(i);c&&(c.textContent=s)};n("acount-all",o.all),n("acount-restaurant",o.restaurant),n("acount-catering",o.catering),n("acount-grocery",o.grocery),n("acount-hotel",o.hotel),n("acount-cafe",o.cafe),n("acount-other",o.other)}async function T(t=!1){const e=document.getElementById("cust-tbody");if(e){m.length===0&&(e.innerHTML=`${Array(5).fill(0).map(()=>`
                  <tr class="skeleton-row">
                    ${Array(11).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                  </tr>
                `).join("")}`);try{const o=new Date(Date.now()-3024e6).toISOString().slice(0,10);at=o;const[n,i]=await Promise.all([L(C.customers(),[rt("name"),Pt(1e3)]),L(C.salesInvoices(),[P("date",">=",o)]).catch(()=>[])]);m=n||[],Q=i||[];const s=document.getElementById("cust-zone-filter");if(s&&s.options.length<=1){const c=s.value;[...new Set(m.map(a=>(a.zone||"").trim()).filter(Boolean))].sort().forEach(a=>{s.innerHTML+=`<option value="${a}">${a}</option>`}),c&&(s.value=c)}Z(ut,mt,gt)}catch(o){console.error("loadCustomers error:",o),e.innerHTML=`<tr><td colspan="11"><div class="alert bad" style="margin:8px;">${o.message}</div></td></tr>`}}}window.changeCustomerSalesPeriod=t=>{const e=document.getElementById("cust-custom-dates");if(t==="custom"){e&&(e.style.display="inline-flex");const o=document.getElementById("cust-from-date")?.value||"",n=document.getElementById("cust-to-date")?.value||"";o&&Z("custom",o,n)}else e&&(e.style.display="none"),Z(t)};window.recalcCustomerPeriodSales=()=>{const t=document.getElementById("cust-from-date")?.value||"",e=document.getElementById("cust-to-date")?.value||"";t&&Z("custom",t,e)};window.setCustomerActivityFilter=t=>{H=t,document.querySelectorAll(".activity-filter-btn").forEach(n=>n.classList.remove("active"));const e=document.getElementById(`act-btn-${t}`);e&&e.classList.add("active");const o=document.getElementById("cust-activity-filter");o&&(o.value=t),filterCustomersList()};window.onCustomerActivitySelectChange=t=>{H=t,document.querySelectorAll(".activity-filter-btn").forEach(o=>o.classList.remove("active"));const e=document.getElementById(`act-btn-${t}`);e&&e.classList.add("active"),filterCustomersList()};window.setCustomerTierFilter=t=>{M=t,document.querySelectorAll(".tier-filter-btn").forEach(o=>o.classList.remove("active"));const e=document.getElementById(`tier-btn-${t}`);e&&e.classList.add("active"),filterCustomersList()};window.filterCustomersList=()=>{const t=document.getElementById("cust-tbody");if(t){if(!m||m.length===0){T();return}tt(m,t)}};window.refreshCustomers=async()=>{const t=document.getElementById("cust-refresh-btn");if(t&&(t.disabled=!0,t.textContent="⏳ جاري…"),m=[],Q=[],window.ERP_CACHE)for(const e of Object.keys(window.ERP_CACHE))(e.includes("customers")||e.includes("salesInvoices"))&&delete window.ERP_CACHE[e];await T(!0),t&&(t.disabled=!1,t.textContent="🔄  تحديث")};window.toggleCustomerDateSort=()=>{V=V==="desc"?"asc":"desc";const t=document.getElementById("cust-date-sort-icon");t&&(t.textContent=V==="desc"?"⬇️ الأحدث":"⬆️ الأقدم");const e=document.getElementById("cust-tbody");e&&m.length>0&&tt(m,e)};function tt(t,e){if(e||(e=document.getElementById("cust-tbody")),!e)return;let o=[...t||m||[]];const n=document.getElementById("cust-search")?.value?.trim();n&&(o=o.filter(a=>{const d=U(a.name);return G(a.name||"",n)||(a.code||"").toLowerCase().includes(n.toLowerCase())||G(a.repName||"",n)||G(a.zone||"",n)||(a.phone||"").includes(n)||(a.vatNumber||"").includes(n)||(a.nationalId||a.crNumber||"").includes(n)||G(d.label||"",n)}));const i=document.getElementById("cust-zone-filter")?.value;i&&(o=o.filter(a=>a.zone===i));const s=document.getElementById("cust-rep-filter")?.value;if(s){const a=document.getElementById("cust-rep-filter"),d=a?.options[a.selectedIndex]?.text?.trim();o=o.filter(l=>!!(l.repId===s||l.salesRepId===s||l.assignedRepId===s||d&&(l.repName===d||l.salesRepName===d)))}const c=document.getElementById("cust-credit-filter")?.value;c&&(o=o.filter(a=>K(a.balance||0,a.creditLimit||0).color===c)),H&&H!=="all"&&(o=o.filter(a=>U(a.name).key===H)),vt(o),yt(o),M&&M!=="all"&&(M==="pending"?o=o.filter(a=>a.status==="pending_approval"||a.approvalStatus==="pending"):M==="kyc"?o=o.filter(a=>Array.isArray(a.attachments)&&a.attachments.length>0):o=o.filter(a=>a.tier?.key===M)),o.sort((a,d)=>{const l=ct(a),b=ct(d);return V==="desc"?b-l:l-b});const p=document.getElementById("cust-count");if(p&&(p.textContent=`${o.length} عميل`),o.length===0){e.innerHTML='<tr><td colspan="11" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد نتائج تطابق خيارات البحث والتصفية</td></tr>';return}e.innerHTML=ft(o)}window.openCustomerModal=(t=null)=>{document.getElementById("cust-edit-id").value=t?.id||"",document.getElementById("cust-modal-title").textContent=t?"تعديل العميل":"إضافة عميل جديد",document.getElementById("cust-name").value=t?.name||"",document.getElementById("cust-code").value=t?.code||"",document.getElementById("cust-phone").value=t?.phone||"",document.getElementById("cust-vat").value=t?.vatNumber||t?.vat||"";const e=t?.nationalId||t?.crNumber||t?.cr||"";if(document.getElementById("cust-national-id").value=e,document.getElementById("cust-zone").value=t?.zone||"",document.getElementById("cust-street").value=t?.street||"",document.getElementById("cust-district").value=t?.district||"",document.getElementById("cust-city").value=t?.city||"",document.getElementById("cust-building-no").value=t?.buildingNo||t?.buildingNumber||"",document.getElementById("cust-postal-code").value=t?.postalCode||t?.zip||"",document.getElementById("cust-additional-no").value=t?.additionalNo||t?.additionalNumber||"",document.getElementById("cust-country").value=t?.country||"المملكة العربية السعودية",!t?.street&&!t?.district&&t?.address){const l=t.address;l.includes("حي")?l.split(/[-—,]/).map(u=>u.trim()).forEach(u=>{u.includes("حي")?document.getElementById("cust-district").value=u:u.includes("شارع")||u.includes("الشارع")?document.getElementById("cust-street").value=u:document.getElementById("cust-street").value||(document.getElementById("cust-street").value=u)}):document.getElementById("cust-street").value=l}document.getElementById("cust-notes").value=t?.notes||"",document.getElementById("cust-delivery-day").value=t?.deliveryDay||"",document.getElementById("cust-route-group").value=t?.routeGroup||"",document.getElementById("cust-maps-url").value=t?.googleMapsUrl||"",document.getElementById("cust-credit-limit").value=t?.creditLimit||"",document.getElementById("cust-credit-days").value=t?.creditDays||"",document.getElementById("cust-rep").value=t?.repId||"",document.getElementById("cust-price-list").value=t?.priceList||"default",document.getElementById("cust-tier-override").value=t?.tierOverride||t?.manualTier||"auto",document.getElementById("cust-form-error").classList.add("hidden");const o=!!t?.hasBrokerCommission,n=document.getElementById("cust-has-broker");n&&(n.checked=o);const i=document.getElementById("cust-broker-fields");i&&(i.style.display=o?"grid":"none");const s=document.getElementById("cust-broker-name");s&&(s.value=t?.brokerName||"زياد");const c=document.getElementById("cust-broker-rate");c&&(c.value=t?.brokerRate!==void 0?t.brokerRate:"1.0");const p=document.getElementById("cust-broker-trigger");p&&(p.value=t?.brokerTrigger||"on_invoice");const a=document.getElementById("cust-coa-toggle-wrap"),d=document.getElementById("cust-coa-toggle");t?(a&&(a.style.display="none"),d&&(d.checked=!!t.accountId)):(a&&(a.style.display="flex"),d&&(d.checked=!0)),openModal("customer-modal")};window.toggleBrokerFields=t=>{const e=document.getElementById("cust-broker-fields");e&&(e.style.display=t?"grid":"none")};window.editCustomer=t=>{const e=m.find(o=>o.id===t);e?openCustomerModal(e):D(()=>import("./index-CF9GFeRJ.js").then(o=>o.T),__vite__mapDeps([0,1])).then(async({getById:o})=>{try{const n=await o("customers",t);n&&openCustomerModal(n)}catch(n){showToast(n.message,"error")}})};window.issueTrustReceiptFromCustomers=async t=>{const{openTrustReceiptModal:e}=await D(async()=>{const{openTrustReceiptModal:o}=await import("./trust-receipts.js_v_2-C9I3kW4K.js");return{openTrustReceiptModal:o}},__vite__mapDeps([2,0,1]));e(t)};window.issueDebtAckFromCustomers=async t=>{const{openDebtAcknowledgmentModal:e}=await D(async()=>{const{openDebtAcknowledgmentModal:o}=await import("./debt-acknowledgment.js_v_2-H-BqRKEN.js");return{openDebtAcknowledgmentModal:o}},__vite__mapDeps([3,0,1]));e(t)};window.issuePromissoryNote=async(t,e)=>{window.navigate&&window.navigate("promissory-notes");let o=0;const n=()=>{o++,typeof window.openNewNoteModal=="function"?window.openNewNoteModal(t,e):o<30&&setTimeout(n,300)};setTimeout(n,600)};window.saveCustomer=async()=>{const t=document.getElementById("cust-form-error");t.classList.add("hidden");const e=document.getElementById("cust-edit-id").value,o=document.getElementById("cust-name").value.trim();if(!o){t.textContent="اسم العميل مطلوب",t.classList.remove("hidden");return}const n=document.getElementById("cust-rep"),i=document.getElementById("cust-national-id").value.trim(),s=document.getElementById("cust-street")?.value?.trim()||"",c=document.getElementById("cust-district")?.value?.trim()||"",p=document.getElementById("cust-city")?.value?.trim()||"",a=document.getElementById("cust-building-no")?.value?.trim()||"",d=document.getElementById("cust-postal-code")?.value?.trim()||"",l=document.getElementById("cust-additional-no")?.value?.trim()||"",b=document.getElementById("cust-country")?.value?.trim()||"المملكة العربية السعودية",u=[];a&&u.push(`رقم المبنى: ${a}`),s&&u.push(`الشارع: ${s}`),c&&u.push(`الحي: ${c}`),p&&u.push(`المدينة: ${p}`),d&&u.push(`الرمز البريدي: ${d}`);const x=u.length>0?u.join(" — "):"",v=document.getElementById("cust-has-broker")?.checked||!1,f=document.getElementById("cust-broker-name")?.value?.trim()||"زياد",I=parseFloat(document.getElementById("cust-broker-rate")?.value)||1,E=document.getElementById("cust-broker-trigger")?.value||"on_invoice",B={name:o,code:document.getElementById("cust-code").value.trim(),phone:document.getElementById("cust-phone").value.trim(),vatNumber:document.getElementById("cust-vat").value.trim(),nationalId:i,crNumber:i,zone:document.getElementById("cust-zone").value.trim(),creditLimit:parseFloat(document.getElementById("cust-credit-limit").value)||0,creditDays:parseInt(document.getElementById("cust-credit-days").value)||0,repId:n.value,assignedRepId:n.value,repName:n.options[n.selectedIndex]?.text||"",priceList:document.getElementById("cust-price-list").value,deliveryDay:document.getElementById("cust-delivery-day").value,tierOverride:document.getElementById("cust-tier-override")?.value||"auto",routeGroup:document.getElementById("cust-route-group").value.trim(),googleMapsUrl:document.getElementById("cust-maps-url").value.trim(),hasBrokerCommission:v,brokerName:f,brokerRate:I,brokerTrigger:E,brokerAccountCode:"2-1-4-2",brokerExpenseCode:"5-4-10",street:s,district:c,city:p,buildingNo:a,buildingNumber:a,postalCode:d,additionalNo:l,additionalNumber:l,country:b,address:x,notes:document.getElementById("cust-notes").value.trim()};e||(B.balance=0);const R=document.getElementById("save-cust-btn");R.disabled=!0;try{if(e){const $=m.find(A=>A.id===e);if(await j("customers",e,B),$){const A=$.name!==o;if($.accountId)A&&await Tt($.accountId,o);else{const w=await nt("customers",e,o);if(w){const{id:X,...F}=w;await j("customers",e,F)}}A&&_t(e,o).catch(w=>console.warn("[Customers] syncCustomerNameEverywhere error:",w.message)),Nt(e).catch(()=>{})}showToast("تم تحديث العميل بنجاح","success")}else{const $=!document.getElementById("cust-coa-toggle").checked,A=await pt(C.customers(),B);if(!$)try{const w=await nt("customers",A,o,{repId:B.repId||null});if(w){const{id:X,...F}=w;await j("customers",A,F)}}catch(w){console.error("Failed to sync customer to COA:",w),showToast(`⚠️ تم حفظ العميل ولكن فشل تكامل شجرة الحسابات: ${w.message}`,"error")}showToast("تمت إضافة العميل بنجاح","success")}closeModal("customer-modal"),await T()}catch($){t.textContent=$.message,t.classList.remove("hidden")}finally{R.disabled=!1}};window.deleteCustomer=async(t,e)=>{if(await showConfirm(`هل تريد حذف العميل "${e}" نهائياً؟`,"تأكيد الحذف"))try{const o=m.find(n=>n.id===t);if(o&&o.accountId&&(await Dt("customers",t,o.accountId)).action==="archived"){showToast("⚠️ العميل لديه معاملات مالية سابقة. تم أرشفته وتجميد حسابه في شجرة الحسابات.","warning"),await T();return}await At("customers",t),showToast("تم حذف العميل بنجاح","success"),await T()}catch(o){showToast(o.message,"error")}};window.viewCustomerStatement=(t,e)=>{window._preselectedStatementEntity={type:"customer",id:t},navigate("report-customer-statement")};window.exportCustomers=async()=>{window.exportCustomersExcel()};window.exportCustomersExcel=async()=>{try{const t=m.length>0?m:await L(C.customers(),[rt("name")]);showToast("جاري تجهيز ملف Excel…","info");const e=t.map(o=>[o.name||"",o.code||"",U(o.name).label,o.phone||"",o.email||"",o.zone||"",o.repName||"",o.priceList||"",o.balance||0,o.creditLimit||0,o.paymentTerms||"",o.vatNumber||"",o.notes||""]);await zt({title:"العملاء",headers:["اسم العميل*","كود العميل","نشاط العميل","رقم الهاتف","البريد الإلكتروني","المنطقة","المندوب","قائمة الأسعار","الرصيد الحالي","حد الائتمان","شروط الدفع","الرقم الضريبي","ملاحظات"],rows:e,colWidths:[28,14,18,14,26,14,18,14,14,14,14,18,26]}),showToast(`تم تصدير ${e.length} عميل ✅`,"success")}catch(t){showToast("خطأ: "+t.message,"error")}};window.openCustomerImportModal=()=>{const t=document.createElement("div");t.className="modal-overlay active",t.id="cust-import-overlay",t.innerHTML=`
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
    </div>`,document.body.appendChild(t)};let xt=[],jt=[];window.downloadCustomerTemplate=async()=>{await Mt({title:"العملاء",headers:["اسم العميل*","كود العميل","رقم الهاتف","البريد الإلكتروني","المنطقة","اسم المندوب","قائمة الأسعار","حد الائتمان","شروط الدفع","الرقم الضريبي","ملاحظات"],sampleRows:[["شركة المستقبل","C001","0501234567","info@co.sa","الرياض","أحمد","retail",5e4,"net30","300xxxxxxxxxx","عميل مميز"]],colWidths:[28,14,14,26,14,18,14,14,14,18,26]}),showToast("تم تنزيل النموذج ✅","success")};window.handleCustomerImport=async t=>{if(t)try{const{headers:e,rows:o}=await Lt(t);xt=o,jt=e,document.getElementById("cust-import-status").innerHTML=`<div class="alert good">✅ تم قراءة <strong>${o.length}</strong> عميل. اضغط استيراد لتأكيد الحفظ.</div>`;const n=o.slice(0,5).map(i=>`<tr>${Object.values(i).slice(0,5).map(s=>`<td>${s}</td>`).join("")}</tr>`).join("");document.getElementById("cust-import-preview").innerHTML=`<table class="data-dense" style="font-size:11px;"><tbody>${n}</tbody></table>`,document.getElementById("cust-import-btn").style.display=""}catch(e){showToast(e.message,"error")}};window.executeCustImport=async()=>{const t=document.getElementById("cust-import-btn");t.disabled=!0,t.textContent="⏳ جاري...";let e=0,o=0,n=0;const[i,s]=await Promise.all([L(C.customers(),[]),L(C.salesReps(),[])]),c={};i.forEach(a=>{c[a.name?.trim()?.toLowerCase()]=a.id});const p={};s.forEach(a=>{p[a.name?.trim()?.toLowerCase()]=a.id});for(const a of xt){const d=String(a["اسم العميل*"]||a.اسم||Object.values(a)[0]||"").trim();if(!d){n++;continue}const l=String(a["اسم المندوب"]||"").trim(),b=p[l.toLowerCase()]||null,u={name:d,code:String(a["كود العميل"]||"").trim()||null,phone:String(a["رقم الهاتف"]||"").trim()||null,email:String(a["البريد الإلكتروني"]||"").trim()||null,zone:String(a.المنطقة||"").trim()||null,repName:l||null,repId:b,priceList:String(a["قائمة الأسعار"]||"retail").trim(),creditLimit:parseFloat(a["حد الائتمان"]||0)||0,paymentTerms:String(a["شروط الدفع"]||"net30").trim(),vatNumber:String(a["الرقم الضريبي"]||"").trim()||null,notes:String(a.ملاحظات||"").trim()||null,updatedAt:new Date().toISOString()};try{const x=c[d.toLowerCase()];if(x)await j("customers",x,u),o++;else{u.createdAt=new Date().toISOString(),u.balance=0;const v=await pt(C.customers(),u);nt("customers",v,d,{repId:u.repId||null}).then(f=>{f&&j("customers",v,f)}).catch(f=>console.warn(`[Import] COA sync failed for ${d}:`,f.message)),e++}}catch{n++}}document.getElementById("cust-import-overlay").remove(),showToast(`✅ مضاف: ${e} | محدث: ${o} | فاشل: ${n}`,"success"),m=[],await T(!0)};function Vt(t){return m.find(e=>e.id===t)||null}function Ht(t){const e=K(t.balance||0,t.creditLimit||0),o=bt(t);return[{heading:"بيانات العميل",rows:[{label:"اسم العميل",value:t.name,bold:!0},{label:"كود العميل",value:t.code,mono:!0},{label:"تاريخ الإضافة",value:o,mono:!0},{label:"رقم الهاتف",value:t.phone,mono:!0},{label:"البريد الإلكتروني",value:t.email},{label:"المنطقة",value:t.zone},{label:"المندوب",value:t.repName},{label:"قائمة الأسعار",value:t.priceList==="wholesale"?"الجملة":t.priceList==="retail"?"التجزئة":"الأساسي"}]},{heading:"بيانات مالية وقانونية",rows:[{label:"الرصيد الحالي",value:y(t.balance||0),mono:!0,bold:!0},{label:"حد الائتمان",value:y(t.creditLimit||0),mono:!0},{label:"نسبة استهلاك الحد",value:t.creditLimit>0?`${e.pct.toFixed(1)}%`:"بلا حد"},{label:"أيام الائتمان (مهلة السداد)",value:t.creditDays?`${t.creditDays} يوم`:"فوري (كاش)"},{label:"الرقم الضريبي",value:t.vatNumber,mono:!0},{label:"السجل التجاري",value:t.crNumber||t.nationalId,mono:!0},{label:"مصدر التسجيل",value:t.source==="sales_manager_portal"?"💼 بوابة مدير المبيعات الميدانية":"الإدارة العامة"},{label:"ملاحظات",value:t.notes}]},{heading:`الأوراق والمستندات الرسمية (KYC) — (${(t.attachments||[]).length} مستند)`,rows:[{label:"حالة المستندات المرفوعة",value:Array.isArray(t.attachments)&&t.attachments.length>0?t.attachments.map(n=>`📄 ${n.title||n.fileName||"مستند"}`).join(" &nbsp;|&nbsp; "):'<span style="color:#f59e0b; font-weight:700;">لا توجد مستندات مرفوعة بعد</span>'},t.signatureDataUrl?{label:"التوقيع الحي المعتمد",value:"✍️ تم التوقيع الرقمي بنجاح وموثق بالاتفاقية"}:null,{label:"عرض وفحص الملفات",value:`<button class="btn btn-sm" style="background:#0284c7;color:#fff;border:none;padding:4px 12px;border-radius:6px;font-weight:bold;cursor:pointer;" onclick="document.getElementById('record-preview-overlay')?.remove(); window.openCustomerAttachmentsModal('${t.id}')">📁 فتح ملف المستندات والصور (KYC)</button>`}].filter(Boolean)}]}window.previewCustomer=t=>{const e=Vt(t);if(!e){showToast("لم يتم إيجاد العميل","error");return}const o=K(e.balance||0,e.creditLimit||0),n=(e.attachments||[]).length;Ft({title:e.name,icon:"👤",badgeText:o.label,badgeColor:o.color==="good"?"good":o.color==="warn"?"warn":"bad",sections:Ht(e),actions:[{icon:"📁",label:`المستندات الرسمية (${n})`,fn:`document.getElementById('record-preview-overlay')?.remove(); window.openCustomerAttachmentsModal('${t}')`,style:"background:#0284c7;color:#fff;font-weight:bold;"},{icon:"✏️",label:"تعديل",fn:`document.getElementById('record-preview-overlay').remove();editCustomer('${t}')`,style:"background:var(--brand);color:#fff;"},{icon:"📝",label:"اتفاقية الحساب",fn:`document.getElementById('record-preview-overlay').remove();openCustomerAgreement('${t}')`,style:"background:#1E3A8A;color:#fff;"},{icon:"🛡️",label:"سند أمانة وعهدة مالية",fn:`document.getElementById('record-preview-overlay').remove();issueTrustReceiptFromCustomers('${t}')`,style:"background:#0369A1;color:#fff;"},{icon:"⚖️",label:"إقرار مديونية وتعهد سداد",fn:`document.getElementById('record-preview-overlay').remove();issueDebtAckFromCustomers('${t}')`,style:"background:#DC2626;color:#fff;"},{icon:"🖨️",label:"طباعة",fn:`printCustomer('${t}')`,style:"background:var(--bg-2);color:var(--text-1);"},{icon:"📄",label:"PDF",fn:`exportCustomerPDF('${t}')`,style:"background:#EF4444;color:#fff;"},{icon:"📊",label:"كشف حساب",fn:`viewCustomerStatement('${t}','${e.name.replace(/'/g,"\\'")}')`,style:"background:#10B981;color:#fff;"}]})};window.printCustomer=t=>{J(t)};window.exportCustomerPDF=t=>{J(t)};window.approveSalesManagerCustomer=async(t,e)=>{const o=m.find(i=>i.id===t);if(!o){showToast("لم يتم العثور على بيانات العميل","error");return}if(window.confirm(`هل تريد اعتماد العميل: "${e}" وتفعيل حسابه رسمياً في النظام؟

• الحد الائتماني: ${y(o.creditLimit||0)}
• المندوب المسؤول: ${o.repName||"غير محدد"}
• سيتم ربطه تلقائياً بشجرة الحسابات (COA) ليصبح متاحاً للبيع فوراً.`))try{showToast("جاري اعتماد العميل وربطه بالشجرة...","info");const{doc:i,updateDoc:s,serverTimestamp:c}=await D(async()=>{const{doc:b,updateDoc:u,serverTimestamp:x}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:b,updateDoc:u,serverTimestamp:x}},[]),{db:p,COMPANY_ID:a}=await D(async()=>{const{db:b,COMPANY_ID:u}=await import("./index-CF9GFeRJ.js").then(x=>x.S);return{db:b,COMPANY_ID:u}},__vite__mapDeps([0,1])),{syncEntityToCoa:d}=await D(async()=>{const{syncEntityToCoa:b}=await import("./coa-connector-9pNG4b1x.js");return{syncEntityToCoa:b}},__vite__mapDeps([4,0,1])),l=i(p,`companies/${a}/customers`,t);await s(l,{status:"active",approvalStatus:"approved",approvedAt:c()});try{await d("customers",t,o.name,{repId:o.repId||o.assignedRepId})}catch(b){console.warn("COA sync warning:",b)}showToast(`✅ تم اعتماد العميل "${e}" وتفعيل حسابه بنجاح!`,"success"),await T()}catch(i){console.error("Approval error:",i),showToast("حدث خطأ أثناء اعتماد العميل: "+i.message,"error")}};window.openCustomerAttachmentsModal=t=>{const e=m.find(i=>i.id===t);if(!e)return;const o=document.createElement("div");o.className="modal-overlay active",o.id="cust-kyc-overlay",o.style.zIndex="1200";const n=Array.isArray(e.attachments)?e.attachments:[];o.innerHTML=`
    <div class="modal-window" style="max-width:720px; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.3); font-family:var(--font-body,'Cairo',sans-serif); direction:rtl; text-align:right;">
      <div style="background:linear-gradient(135deg, #004d80, #0284c7); color:#fff; padding:16px 20px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:22px;">📂</span>
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:800;">الأوراق والمستندات القانونية (KYC) — ${e.name}</h3>
            <div style="font-size:11px; opacity:0.85;">كود العميل: ${e.code||"—"} &nbsp;|&nbsp; المندوب: ${e.repName||"—"}</div>
          </div>
        </div>
        <button class="modal-close-btn" style="background:rgba(255,255,255,0.18); border:none; color:#fff; width:30px; height:30px; border-radius:50%; cursor:pointer; font-size:16px;" onclick="document.getElementById('cust-kyc-overlay').remove()">✕</button>
      </div>

      <div style="padding:20px; max-height:75vh; overflow-y:auto;">
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px; margin-bottom:16px; font-size:12px; display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:8px;">
          <div>📜 السجل التجاري: <strong class="mono">${e.crNumber||"غير مدون"}</strong></div>
          <div>🏢 الرقم الضريبي: <strong class="mono">${e.vatNumber||"غير مدون"}</strong></div>
          <div>📞 الجوال: <strong class="mono">${e.phone||e.mobile||"—"}</strong></div>
          <div>💳 التسهيلات المقررة: <strong>${y(e.creditLimit||0)}</strong> (${e.creditDays||30} يوماً)</div>
          ${e.googleMapsUrl?`<div style="grid-column:1/-1;"><a href="${e.googleMapsUrl}" target="_blank" style="color:#0284c7; font-weight:bold;">📍 فتح موقع المنشأة الميداني على خرائط جوجل</a></div>`:""}
        </div>

        <h4 style="font-size:13px; font-weight:800; margin-bottom:10px; color:#004d80;">المستندات والملفات المرفوعة (${n.length}):</h4>
        ${n.length===0?`
          <div style="text-align:center; padding:32px; color:var(--text-muted); border:1px dashed #cbd5e1; border-radius:10px;">
            لا توجد مستندات قانونية مرفقة لهذا العميل حتى الآن.
          </div>
        `:`
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(190px, 1fr)); gap:12px;">
            ${n.map(i=>`
              <div style="border:1.5px solid #e2e8f0; border-radius:10px; padding:10px; background:#fff; text-align:center;">
                <div style="font-size:11.5px; font-weight:800; color:#0f172a; margin-bottom:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${i.title||i.fileName}">
                  ${i.title||i.fileName||"مستند قانوني"}
                </div>
                ${i.dataUrl?.startsWith("data:image")?`
                  <a href="${i.dataUrl}" target="_blank" title="اضغط للتكبير وعرض الصورة">
                    <img src="${i.dataUrl}" style="width:100%; height:110px; object-fit:cover; border-radius:6px; border:1px solid #cbd5e1;" />
                  </a>
                `:`
                  <div style="padding:20px; background:#f1f5f9; border-radius:6px; margin-bottom:6px; font-size:24px;">📄</div>
                  <a href="${i.dataUrl}" target="_blank" class="btn btn-secondary btn-sm" style="font-size:11px;">عرض الملف / PDF</a>
                `}
              </div>
            `).join("")}
          </div>
        `}

        ${e.signatureDataUrl?`
          <div style="margin-top:16px; padding:12px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:12px; font-weight:800; color:#004d80;">✍️ نموذج توقيع العميل الحي على الاتفاقية:</div>
              <div style="font-size:10.5px; color:#475569;">موثق إلكترونياً ومربوط بالاتفاقية الائتمانية الرسمية</div>
            </div>
            <img src="${e.signatureDataUrl}" style="max-height:55px; background:#fff; padding:4px; border:1px solid #cbd5e1; border-radius:6px;" />
          </div>
        `:""}
        <!-- خانة رفع مستند جديد مباشرة من البرنامج الرئيسي -->
        <div style="margin-top:16px; padding:12px; background:#f8fafc; border:1.5px dashed #cbd5e1; border-radius:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <div style="font-size:12px; font-weight:800; color:#0f172a;">➕ إرفاق مستند أو وثيقة رسمية للملف:</div>
            <div style="font-size:10.5px; color:#64748b;">سجل تجاري، شهادة ضريبية، رخصة، هوية، عقد إيجار، آيبان (صور أو PDF)</div>
          </div>
          <div>
            <input type="file" id="cust-upload-kyc-input" accept="image/*,.pdf" style="display:none;" onchange="window.uploadNewCustomerKycDoc('${e.id}', this)" />
            <button type="button" class="btn btn-primary sm" onclick="document.getElementById('cust-upload-kyc-input').click()" style="background:#0284c7; font-weight:800; font-size:11.5px; padding:6px 14px; border-radius:6px; cursor:pointer;">
              📤 رفع مستند جديد
            </button>
          </div>
        </div>
      </div>

      <div style="padding:12px 20px; border-top:1px solid #e2e8f0; background:#f8fafc; display:flex; justify-content:space-between; align-items:center;">
        <button class="btn btn-secondary" onclick="document.getElementById('cust-kyc-overlay').remove()">إغلاق</button>
        <button class="btn btn-primary" onclick="document.getElementById('cust-kyc-overlay').remove(); openCustomerAgreement('${e.id}')" style="background:#0284c7;">
          🖨️ طباعة الاتفاقية القانونية A4
        </button>
      </div>
    </div>
  `,document.body.appendChild(o)};window.uploadNewCustomerKycDoc=async(t,e)=>{const o=e?.files?.[0];if(!o)return;const n=prompt("أدخل اسم / نوع المستند المرفوع (مثلاً: رخصة البلدية، عقد الإيجار، السجل التجاري):",o.name)||o.name;try{showToast("جاري معالجة ورفع المستند...","info");const i=new FileReader;i.onload=async s=>{const c=s.target.result,{doc:p,updateDoc:a,arrayUnion:d}=await D(async()=>{const{doc:f,updateDoc:I,arrayUnion:E}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:f,updateDoc:I,arrayUnion:E}},[]),{db:l,COMPANY_ID:b}=await D(async()=>{const{db:f,COMPANY_ID:I}=await import("./index-CF9GFeRJ.js").then(E=>E.S);return{db:f,COMPANY_ID:I}},__vite__mapDeps([0,1])),u={docId:"doc_"+Date.now(),title:n,fileName:o.name,dataUrl:c,uploadedAt:new Date().toISOString()},x=p(l,`companies/${b}/customers`,t);await a(x,{attachments:d(u)});const v=m.find(f=>f.id===t);v&&(Array.isArray(v.attachments)||(v.attachments=[]),v.attachments.push(u)),showToast("✅ تم رفع المستند وحفظه بملف العميل بنجاح!","success"),document.getElementById("cust-kyc-overlay")?.remove(),window.openCustomerAttachmentsModal(t)},i.readAsDataURL(o)}catch(i){console.error("Upload error:",i),showToast("حدث خطأ أثناء رفع المستند: "+i.message,"error")}};window.runCustomerCoaMigration=async()=>{const t=document.getElementById("btn-migrate-coa");if(window.confirm(`⚠️ هذه العملية ستُنشئ حسابات تفصيلية في شجرة الحسابات لكل عميل تحت مندوبه.

• العملاء التابعون لمندوب → تحت حساب المندوب (1-1-2-1-2-X)
• العملاء التجاريون المباشرون → تحت (1-1-2-1-1)

العملاء المرتبطون مسبقاً سيُتخطّوا تلقائياً.

هل تريد المتابعة؟`)){t&&(t.disabled=!0,t.textContent="⏳ جاري الترحيل...");try{const o=await St(),n=[`✅ تم ترحيل: ${o.migrated.length} عميل`,`⏭️ تم تخطّي: ${o.skipped.length} عميل (مرتبط مسبقاً)`,o.errors.length>0?`❌ أخطاء: ${o.errors.join(", ")}`:""].filter(Boolean).join(`
`);o.migrated.length>0&&console.table(o.migrated),window.alert(n),await T()}catch(o){window.alert("❌ خطأ أثناء الترحيل: "+o.message),console.error("Customer COA Migration Error:",o)}finally{t&&(t.disabled=!1,t.innerHTML="<span>🔗</span> ترحيل ذمم العملاء")}}};window.showCustomerIntelligence=async(t,e)=>{const o=document.createElement("div");o.className="modal-overlay active",o.id="cust-intelligence-overlay",o.style.zIndex="1100",o.innerHTML=`
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
  `,document.body.appendChild(o);try{const[n,i,s,c]=await Promise.all([Y(W(C.salesInvoices(),P("customerId","==",t))).catch(()=>({docs:[]})),Y(W(C.receipts(),P("targetId","==",t))).catch(()=>({docs:[]})),Y(W(C.customerContracts(),P("customerId","==",t))).catch(()=>({docs:[]})),Y(W(C.customerComplaints(),P("customerId","==",t))).catch(()=>({docs:[]}))]),p=n.docs.map(r=>r.data()).filter(r=>r.status!=="cancelled"),a=i.docs.map(r=>r.data()).sort((r,g)=>(g.date||"").localeCompare(r.date||"")),d=s.docs.map(r=>r.data()),l=c.docs.map(r=>r.data()),b=new Date(Date.now()-30*864e5).toISOString().slice(0,10),x=p.filter(r=>(r.date||"").slice(0,10)>=b).reduce((r,g)=>r+(g.totalWithVat||g.total||0),0),v=m.find(r=>r.id===t)||{},f=it(x,v.tierOverride||v.manualTier),I=p.length,E=p.reduce((r,g)=>r+(g.subtotal||0),0),B=p.reduce((r,g)=>r+(g.totalWithVat||0),0);let R=0;p.forEach(r=>{const k=(r.lines||r.items||[]).reduce((O,h)=>{const N=parseFloat(h.qty||h.quantity||1)||0,S=parseFloat(h.costPrice!==void 0?h.costPrice:h.purchasePrice!==void 0?h.purchasePrice:h.unitCost||0)||0;return O+N*S},0);R+=k>0?k:parseFloat(r.totalCost)||0});const $=E-R,A=E>0?$/E*100:0,w=v&&v.balance||0,X=parseInt(v.loyaltyPoints)||0,F=v.pinnedWarningNote||"",ht=Math.max(0,B-w),wt=B>0?ht/B*100:100;let et="—";if(I>1){const r=p.map(h=>new Date(h.date)).sort((h,N)=>h-N),O=(r[r.length-1]-r[0])/(1e3*60*60*24)/(I-1);et=O<=1?"يومي تقريباً":`كل ${O.toFixed(1)} يوم`}else I===1&&(et="فاتورة واحدة فقط");let st="لا يوجد مدفوعات مسجلة";if(a.length>0){const r=a[0];st=`${y(r.amount||0)} بتاريخ ${r.date||(r.createdAt?.toDate?r.createdAt.toDate().toISOString().split("T")[0]:"—")}`}const kt=[...p].sort((r,g)=>(g.date||"").localeCompare(r.date||"")),_=[];kt.forEach(r=>{_.length>=5||(r.lines||[]).forEach(g=>{_.length>=5||_.some(k=>k.productId===g.productId)||_.push({productId:g.productId,name:g.productName,qty:g.qty||g.quantity||1,unit:g.unit&&g.unit!=="undefined"?g.unit:g.unitCode||"",price:g.unitPrice||g.price||0,date:r.date})})});const ot=[...p].sort((r,g)=>(r.date||"").localeCompare(g.date||"")).slice(-10),Ct=Math.max(...ot.map(r=>(r.subtotal||0)-(r.totalCost||0)),1),q=document.getElementById("cust-intel-body");if(!q)return;q.style.display="block",window.printCustomerIntelligence=()=>{const r=window.open("","_blank");r.document.write(`
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
            ${q.innerHTML}
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
      `),r.document.close()},q.innerHTML=`
      <div style="width:100%; display:flex; flex-direction:column; gap:20px; direction:rtl; text-align:right;">
        
        <!-- Action Toolbar -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; background:var(--bg-card); padding:12px 16px; border-radius:12px; border:1px solid var(--border-soft);">
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" onclick="window.viewCustomerStatement('${t}', '${e.replace(/'/g,"\\'")}')">📊 كشف حساب تفصيلي</button>
            ${v.phone?`
              <button class="btn btn-secondary btn-sm" style="color:#25D366;" onclick="window.open('https://api.whatsapp.com/send?phone=${v.phone.replace(/[^0-9]/g,"")}', '_blank')">💬 محادثة واتساب</button>
            `:""}
            ${v.googleMapsUrl?`
              <a href="${v.googleMapsUrl}" target="_blank" class="btn btn-secondary btn-sm" style="color:var(--brand); text-decoration:none;">📍 فتح في خرائط جوجل</a>
            `:""}
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <span class="badge" style="background:rgba(99,102,241,0.1); color:var(--brand); font-weight:800;">
              🎁 نقاط الولاء: ${X} نقطة (${y(X*.5)})
            </span>
            <span class="badge" style="background:rgba(16,185,129,0.1); color:#10B981; font-weight:800;">
              📜 العقود: ${d.length} عقد
            </span>
          </div>
        </div>

        <!-- Customer Tier & Volume Intelligence Banner -->
        <div style="background:linear-gradient(135deg, ${f.bg} 0%, var(--bg-card) 100%); padding:18px 20px; border-radius:14px; border:1px solid ${f.border}; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div style="font-size:36px; line-height:1;">
              ${f.key==="A"?"👑":f.key==="B"?"💎":f.key==="C"?"🚀":f.key==="D"?"📦":"⚪"}
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:18px; font-weight:800; color:${f.color}; font-family:var(--font-heading);">
                  ${f.label}
                </span>
                ${f.isManual?'<span class="badge neutral" style="font-size:10px;">🔒 تثبيت يدوي</span>':'<span class="badge neutral" style="font-size:10px;">⚡ تصنيف ديناميكي</span>'}
              </div>
              <div style="font-size:12px; color:var(--text-2); margin-top:3px;">
                ${f.desc}
              </div>
            </div>
          </div>
          <div style="text-align:left; min-width:200px;">
            <div style="font-size:11px; color:var(--text-3); font-weight:600;">مسحوبات آخر ٣٠ يوماً</div>
            <div class="mono" style="font-size:20px; font-weight:800; color:${f.color}; margin-top:2px;">
              ${y(x)}
            </div>
            <div style="font-size:11px; color:var(--text-2); margin-top:3px;">
              🎯 ${f.nextTierText}
            </div>
          </div>
        </div>

        ${F?`
          <div class="alert bad" style="padding:12px 16px; font-weight:800; font-size:13px; border-radius:10px; display:flex; align-items:center; gap:8px;">
            <span>⚠️</span> <span><b>تحذير ائتماني مثبت للعميل:</b> ${F}</span>
          </div>
        `:""}

        <div class="kpi-grid" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px;">
          <div class="kpi-card" style="padding:16px; border-radius:12px; background:var(--bg-2); border:1px solid var(--border-soft); position:relative;">
            <div style="background:var(--brand); height:4px; border-radius:4px 4px 0 0; position:absolute; top:0; left:0; right:0;"></div>
            <div style="font-size:12px; color:var(--text-3); font-weight:600;">📊 نشاط الفواتير</div>
            <div class="mono" style="font-size:22px; font-weight:800; color:var(--brand); margin-top:8px;">${I} <span style="font-size:12px; font-weight:500;">فاتورة</span></div>
            <div style="font-size:11px; color:var(--text-2); margin-top:4px;">متوسط الشراء: ${et}</div>
          </div>
          <div class="kpi-card" style="padding:16px; border-radius:12px; background:var(--bg-2); border:1px solid var(--border-soft); position:relative;">
            <div style="background:var(--indigo); height:4px; border-radius:4px 4px 0 0; position:absolute; top:0; left:0; right:0;"></div>
            <div style="font-size:12px; color:var(--text-3); font-weight:600;">💰 حجم المبيعات</div>
            <div class="mono" style="font-size:22px; font-weight:800; color:var(--indigo); margin-top:8px;">${y(E)}</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:4px;">شامل الضريبة: ${y(B)}</div>
          </div>
          <div class="kpi-card" style="padding:16px; border-radius:12px; background:var(--bg-2); border:1px solid var(--border-soft); position:relative;">
            <div style="background:var(--good); height:4px; border-radius:4px 4px 0 0; position:absolute; top:0; left:0; right:0;"></div>
            <div style="font-size:12px; color:var(--text-3); font-weight:600;">📈 صافي الربح</div>
            <div class="mono" style="font-size:22px; font-weight:800; color:var(--good); margin-top:8px;">${y($)}</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:4px;">هامش الربح: ${A.toFixed(1)}%</div>
          </div>
          <div class="kpi-card" style="padding:16px; border-radius:12px; background:var(--bg-2); border:1px solid var(--border-soft); position:relative;">
            <div style="background:var(--warn); height:4px; border-radius:4px 4px 0 0; position:absolute; top:0; left:0; right:0;"></div>
            <div style="font-size:12px; color:var(--text-3); font-weight:600;">⏳ نسبة التحصيل</div>
            <div class="mono" style="font-size:22px; font-weight:800; color:var(--warn); margin-top:8px;">${wt.toFixed(1)}%</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:4px;">الرصيد: ${y(w)}</div>
          </div>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
          <div class="card" style="margin:0; padding:20px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
            <h4 style="font-size:14px; font-weight:700; color:var(--text-1); margin-bottom:16px;">📥 آخر السدادات</h4>
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${a.slice(0,5).map(r=>`
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-radius:8px; background:var(--bg-3); border:1px solid var(--border-soft);">
                  <div><div style="font-weight:600; font-size:12.5px;">سند رقم ${r.number||"—"}</div></div>
                  <div style="text-align:left;"><div class="font-bold text-good" style="font-size:13.5px;">+ ${y(r.amount||0)}</div><div style="font-size:11px; color:var(--text-3);">${r.date||"—"}</div></div>
                </div>`).join("")}
            </div>
            <div style="font-size:12px; font-weight:700; color:var(--brand); margin-top:16px; border-top:1px solid var(--border-soft); padding-top:12px;">آخر دفعة: ${st}</div>
          </div>
          <div class="card" style="margin:0; padding:20px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
            <h4 style="font-size:14px; font-weight:700; color:var(--text-1); margin-bottom:16px;">📦 آخر بضائع مشتراة</h4>
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${_.map(r=>`
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-radius:8px; background:var(--bg-3); border:1px solid var(--border-soft);">
                  <div>
                    <div style="font-weight:600; font-size:12.5px;">${r.name}</div>
                    <div style="font-size:11px; color:var(--text-3); margin-top:2px;">التاريخ: ${r.date||"—"}</div>
                  </div>
                  <div style="text-align:left;">
                    <div class="mono font-bold" style="font-size:13px; color:var(--text-1);">${r.qty} ${r.unit||"حبة"}</div>
                    <div style="font-size:11px; color:var(--text-3); margin-top:2px;">سعر الوحدة: ${y(r.price)}</div>
                  </div>
                </div>
              `).join("")}
              ${_.length===0?`
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
                ${p.map(r=>{const g=r.totalWithVat||0,k=r.subtotal||0,h=(r.lines||r.items||[]).reduce(($t,z)=>{const It=parseFloat(z.qty||z.quantity||1)||0,Et=parseFloat(z.costPrice!==void 0?z.costPrice:z.purchasePrice!==void 0?z.purchasePrice:z.unitCost||0)||0;return $t+It*Et},0),N=h>0?h:parseFloat(r.totalCost)||0,S=k-N,lt=k>0?S/k*100:0;return`
                    <tr style="border-bottom:1px solid var(--border-soft);">
                      <td style="padding:10px; font-weight:600; color:var(--brand);">${r.number||r.invoiceNumber||r.id}</td>
                      <td style="padding:10px; color:var(--text-3);">${r.date||"—"}</td>
                      <td style="padding:10px;" class="mono">${y(g)}</td>
                      <td style="padding:10px;" class="mono">${y(k)}</td>
                      <td style="padding:10px; color:var(--text-3);" class="mono">${y(N)}</td>
                      <td style="padding:10px; font-weight:600; color:${S>=0?"var(--good)":"var(--bad)"}" class="mono">${S>=0?"+":""}${y(S)}</td>
                      <td style="padding:10px;" class="mono"><span class="badge ${S>=0?"good":"bad"}" style="font-size:11px; padding:2px 8px;">${lt>=0?"+":""}${lt.toFixed(1)}%</span></td>
                    </tr>
                  `}).join("")}
                ${p.length===0?`
                  <tr>
                    <td colspan="7" style="text-align:center; padding:30px; color:var(--text-3);">لا توجد فواتير مبيعات مسجلة لهذا العميل.</td>
                  </tr>
                `:""}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Row 4: CSS Bar Graph representing Profitability per Invoice (last 10 invoices) -->
        ${ot.length>0?`
          <div class="card" style="margin:0; padding:20px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
            <h4 style="font-size:14px; font-weight:700; color:var(--text-1); margin-bottom:24px;">
              📈 رسم بياني لحجم الأرباح من آخر 10 فواتير للعميل
            </h4>
            <div style="display:flex; height:150px; align-items:end; gap:20px; padding:0 20px; position:relative; border-bottom:1px solid var(--border);">
              ${ot.map(r=>{const g=(r.subtotal||0)-(r.totalCost||0),k=g/Ct*100;return`
                  <div style="flex:1; display:flex; flex-direction:column; align-items:center; height:100%; justify-content:end; position:relative;">
                    <div class="mono" style="font-size:9.5px; font-weight:700; color:var(--good); margin-bottom:4px; position:absolute; bottom:${k+4}%;">
                      ${Math.round(g)}
                    </div>
                    <div style="width:24px; height:${k}%; background:linear-gradient(to top, var(--good-soft), var(--good)); border-radius:4px 4px 0 0; transition:height 0.3s ease;"></div>
                    <div class="mono" style="font-size:9px; color:var(--text-3); margin-top:8px; white-space:nowrap; transform:rotate(-20deg); transform-origin:top right; margin-right:-10px;">
                      ${r.number||r.id.slice(0,8)}
                    </div>
                  </div>
                `}).join("")}
            </div>
          </div>
        `:""}
      </div>
    `}catch(n){const i=document.getElementById("cust-intel-body");i&&(i.innerHTML=`<div class="alert bad">${n.message}</div>`)}};export{Z as applyCustomerSalesPeriod,U as getCustomerActivityInfo,it as getCustomerTierInfo,Rt as getPeriodDateBounds,G as matchArabicSearch,dt as normalizeArabicText,ee as render};
