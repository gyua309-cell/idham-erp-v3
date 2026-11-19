const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css","assets/trust-receipts.js_v_2-C9I3kW4K.js","assets/debt-acknowledgment.js_v_2-H-BqRKEN.js","assets/coa-connector-9pNG4b1x.js"])))=>i.map(i=>d[i]);
import{G as K,_ as S,u as U,c as pt,C as w,r as St,g as L,f as y,s as Tt,t as mt}from"./index-CF9GFeRJ.js";import{updateEntityInCoa as Dt,syncEntityToCoa as at,deleteEntityInCoa as zt,migrateCustomerCoa as Mt}from"./coa-connector-9pNG4b1x.js";import{e as Lt,d as _t,i as Nt}from"./excel-DM5XZHtQ.js";import{s as Pt}from"./record-actions-BUPPxq1M.js";import{syncCustomerNameEverywhere as Ft,syncCustomerBalanceToCoa as Ot}from"./sync-engine-B3XmYvGy.js";import{o as tt}from"./customer-agreement.js_v_4-BRC8KxgR.js";import{orderBy as it,getDocs as j,query as V,where as F,limit as gt}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";window.openCustomerAgreement=tt;window.openBlankCustomerAgreement=()=>tt(null,!0);let g=[],Z=[],st="",X="desc",M="all",q="all",bt="last30",ft="",yt="";function ct(t){return t?String(t).trim().replace(/[\u064B-\u065F\u0670]/g,"").replace(/[إأآا]/g,"ا").replace(/ة/g,"ه").replace(/[ىي]/g,"ي").replace(/[()\[\]{}\-_\/\\.,:;+*="']/g," ").replace(/\s+/g," ").toLowerCase():""}function Q(t,e){if(!e)return!0;const o=ct(t),r=ct(e);return o.includes(r)?!0:r.split(" ").filter(Boolean).every(i=>{if(o.includes(i))return!0;if(i.startsWith("ال")&&i.length>3){const c=i.slice(2);if(o.includes(c))return!0}return!1})}function W(t){const e=(t||"").toLowerCase().replace(/[\u064B-\u065F\u0670]/g,"").replace(/[إأآا]/g,"ا").replace(/[ىي]/g,"ي").replace(/ة/g,"ه");return/مطعم|شواي|مشوي|وجبات|برجر|بخاري|مندي|فطائر|فطاير|اسماك|سمك|حلواني|مطبخ|كبس|شاورما|بيتزا|اكلات|طباخ|اعاش|إعاش/.test(e)?{key:"restaurant",label:"مطاعم وإعاشة",icon:"🍽️",color:"#ea580c",bg:"rgba(234,88,12,0.1)"}:/تموين|ماركت|اسواق|سوبرماركت/.test(e)?{key:"catering",label:"تموينات وأسواق",icon:"🏪",color:"#0284c7",bg:"rgba(2,132,199,0.1)"}:/بقال|دكان/.test(e)?{key:"grocery",label:"بقالات",icon:"🛒",color:"#16a34a",bg:"rgba(22,163,74,0.1)"}:/فندق|فنادق|منتجع|ايواء|شقق|نزل|سياحي|اجنح|شاليه/.test(e)?{key:"hotel",label:"فنادق وإيواء",icon:"🏨",color:"#7c3aed",bg:"rgba(124,58,237,0.1)"}:/كافيه|مقهى|مقهي|كوفي|شاي|عصير|عصائر/.test(e)?{key:"cafe",label:"كافيهات ومقاهي",icon:"☕",color:"#b45309",bg:"rgba(180,83,9,0.1)"}:{key:"other",label:"تجارية وأخرى",icon:"🏢",color:"#64748b",bg:"rgba(100,116,139,0.1)"}}function Rt(t,e="",o=""){const r=new Date,s=r.toISOString().slice(0,10),i=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],c=i[r.getMonth()],u=new Date(r.getFullYear(),r.getMonth()-1,1),n=i[u.getMonth()];if(t==="currentMonth")return{from:`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,"0")}-01`,to:s,label:`مسحوبات الشهر الحالي (${c})`,shortLabel:`الشهر الحالي (${c})`,curMonthName:c,prevMonthName:n};if(t==="lastMonth"){const l=`${u.getFullYear()}-${String(u.getMonth()+1).padStart(2,"0")}-01`,b=new Date(r.getFullYear(),r.getMonth(),0),p=`${b.getFullYear()}-${String(b.getMonth()+1).padStart(2,"0")}-${String(b.getDate()).padStart(2,"0")}`;return{from:l,to:p,label:`مسحوبات الشهر السابق (${n})`,shortLabel:`الشهر السابق (${n})`,curMonthName:c,prevMonthName:n}}return t==="allTime"?{from:"2000-01-01",to:"9999-12-31",label:"إجمالي المسحوبات (كامل الفترة)",shortLabel:"كامل الفترة",curMonthName:c,prevMonthName:n}:t==="custom"&&e?{from:e,to:o||s,label:`مسحوبات الفترة (${e} إلى ${o||s})`,shortLabel:"فترة مخصصة",curMonthName:c,prevMonthName:n}:{from:new Date(Date.now()-30*864e5).toISOString().slice(0,10),to:s,label:"مسحوبات الشهر (آخر ٣٠ يوماً)",shortLabel:"آخر ٣٠ يوماً",curMonthName:c,prevMonthName:n}}async function J(t,e="",o=""){bt=t,ft=e,yt=o;const r=Rt(t,e,o);if(r.from&&r.from<st)try{const n=r.from==="2000-01-01"?[]:[F("date",">=",r.from)];Z=await L(w.salesInvoices(),n)||[],st=r.from}catch{}const s={};(Z||[]).forEach(n=>{if(n.status==="cancelled"||!n.customerId)return;const d=n.date||(n.createdAt?.toDate?n.createdAt.toDate().toISOString().slice(0,10):typeof n.createdAt=="string"?n.createdAt.slice(0,10):"");d>=r.from&&d<=r.to&&(s[n.customerId]=(s[n.customerId]||0)+(n.totalWithVat||n.total||0))}),g.forEach(n=>{n.monthlySales=s[n.id]||0,n.tier=et(n.monthlySales,n.tierOverride||n.manualTier)});const i=document.getElementById("th-sales-period");i&&(i.textContent=r.label);const c=document.getElementById("tier-filter-title");c&&(c.textContent=`🎯 تصنيف العملاء (حسب ${r.shortLabel}):`),xt(g),ht(g);const u=document.getElementById("cust-tbody");u&&ot(g,u)}function et(t=0,e=null){const o=Number(t)||0;return e&&e!=="auto"&&["A","B","C","D"].includes(e)?e==="A"?{key:"A",label:"👑 فئة A (VIP)",badgeClass:"tier-badge-a",color:"#D4AF37",bg:"rgba(212,175,55,0.15)",border:"rgba(212,175,55,0.45)",isManual:!0,desc:"كبار الحسابات والشركاء (> 20,000 ر.س)",nextTierText:"أعلى شريحة (VIP) 👑"}:e==="B"?{key:"B",label:"💎 فئة B (مميز)",badgeClass:"tier-badge-b",color:"#818cf8",bg:"rgba(99,102,241,0.15)",border:"rgba(99,102,241,0.45)",isManual:!0,desc:"عملاء رئيسيون (10,001 - 20,000 ر.س)",nextTierText:`متبقي ${Math.max(0,20001-o).toLocaleString()} ر.س للترقية إلى فئة A`}:e==="C"?{key:"C",label:"🚀 فئة C (نمو)",badgeClass:"tier-badge-c",color:"#34d399",bg:"rgba(16,185,129,0.15)",border:"rgba(16,185,129,0.45)",isManual:!0,desc:"عملاء متوسطون (5,001 - 10,000 ر.س)",nextTierText:`متبقي ${Math.max(0,10001-o).toLocaleString()} ر.س للترقية إلى فئة B`}:{key:"D",label:"📦 فئة D (تجزئة)",badgeClass:"tier-badge-d",color:"#fb923c",bg:"rgba(249,115,22,0.15)",border:"rgba(249,115,22,0.45)",isManual:!0,desc:"صغار العملاء (1 - 5,000 ر.س)",nextTierText:`متبقي ${Math.max(0,5001-o).toLocaleString()} ر.س للترقية إلى فئة C`}:o>2e4?{key:"A",label:"👑 فئة A (VIP)",badgeClass:"tier-badge-a",color:"#D4AF37",bg:"rgba(212,175,55,0.15)",border:"rgba(212,175,55,0.45)",isManual:!1,desc:"كبار الحسابات والشركاء (مسحوبات > 20,000 ر.س)",nextTierText:"أعلى شريحة (VIP) 👑"}:o>1e4?{key:"B",label:"💎 فئة B (مميز)",badgeClass:"tier-badge-b",color:"#818cf8",bg:"rgba(99,102,241,0.15)",border:"rgba(99,102,241,0.45)",isManual:!1,desc:"عملاء رئيسيون (10,001 - 20,000 ر.س)",nextTierText:`متبقي ${(20001-o).toLocaleString()} ر.س للترقية إلى فئة A`}:o>5e3?{key:"C",label:"🚀 فئة C (نمو)",badgeClass:"tier-badge-c",color:"#34d399",bg:"rgba(16,185,129,0.15)",border:"rgba(16,185,129,0.45)",isManual:!1,desc:"عملاء متوسطون (5,001 - 10,000 ر.س)",nextTierText:`متبقي ${(10001-o).toLocaleString()} ر.س للترقية إلى فئة B`}:o>0?{key:"D",label:"📦 فئة D (تجزئة)",badgeClass:"tier-badge-d",color:"#fb923c",bg:"rgba(249,115,22,0.15)",border:"rgba(249,115,22,0.45)",isManual:!1,desc:"صغار العملاء (1 - 5,000 ر.س)",nextTierText:`متبقي ${(5001-o).toLocaleString()} ر.س للترقية إلى فئة C`}:{key:"inactive",label:"⚪ غير نشط",badgeClass:"tier-badge-inactive",color:"#94a3b8",bg:"rgba(148,163,184,0.12)",border:"rgba(148,163,184,0.3)",isManual:!1,desc:"بلا مسحوبات خلال آخر 30 يوماً",nextTierText:"يحتاج لشراء 1 ر.س لدخول فئة D"}}function vt(t){if(!t)return"—";if(t.createdAt){if(t.createdAt.toDate)return t.createdAt.toDate().toISOString().split("T")[0];if(t.createdAt.seconds)return new Date(t.createdAt.seconds*1e3).toISOString().split("T")[0];if(typeof t.createdAt=="string")return t.createdAt.slice(0,10)}return t.createdDate?String(t.createdDate).slice(0,10):t.dateAdded?String(t.dateAdded).slice(0,10):t.date?String(t.date).slice(0,10):"—"}function ut(t){if(!t)return 0;if(t.createdAt?.toDate)return t.createdAt.toDate().getTime();if(t.createdAt?.seconds)return t.createdAt.seconds*1e3;if(typeof t.createdAt=="string"){const e=new Date(t.createdAt).getTime();if(!isNaN(e))return e}if(t.createdDate){const e=new Date(t.createdDate).getTime();if(!isNaN(e))return e}if(t.dateAdded){const e=new Date(t.dateAdded).getTime();if(!isNaN(e))return e}if(t.date){const e=new Date(t.date).getTime();if(!isNaN(e))return e}return 0}function jt(t){return t.map(e=>{const o=K(e.balance||0,e.creditLimit||0),r=vt(e),s=e.tier||et(e.monthlySales||0,e.tierOverride),i=W(e.name),c=e.monthlySales||0;return`<tr>
      <td>
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <div class="font-semibold font-heading" 
               style="color:var(--brand); cursor:pointer; text-decoration:underline; font-weight:800;" 
               onclick="window.showCustomerIntelligence('${e.id}', '${e.name.replace(/'/g,"\\'")}')"
               title="🧠 عرض لوحة ذكاء العميل والتحليل الإحصائي">
            ${e.name}
          </div>
          <span class="activity-badge" style="background:${i.bg}; color:${i.color}; border:1px solid ${i.color}45; padding:2px 7px; border-radius:6px; font-size:10px; font-weight:700;" title="النشاط المقدر من الاسم: ${i.label}">
            ${i.icon} ${i.label}
          </span>
          <span class="tier-badge ${s.badgeClass}" title="${s.desc}">
            ${s.label} ${s.isManual?"🔒":""}
          </span>
        </div>
        <div style="font-size:11px;color:var(--text-2);display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-top:2px;">
          <span class="mono">${e.code||""}</span>
          ${r!=="—"?`<span style="font-size:10px;color:var(--text-2);background:rgba(0,0,0,0.05);padding:1px 5px;border-radius:4px;" title="تاريخ إضافة العميل">📅 ${r}</span>`:""}
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
        ${r!=="—"?`<span class="badge neutral mono" style="font-size:11px;font-weight:600;">📅 ${r}</span>`:"—"}
      </td>
      <td style="white-space:nowrap;">
        <div class="mono font-bold" style="color:${s.color}; font-size:12.5px;">
          ${y(c)}
        </div>
        <div class="dim" style="font-size:10px;" title="${s.nextTierText}">
          ${s.nextTierText}
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
    </tr>`}).join("")}window.viewCustomerStatement=(t,e)=>{window.navigate&&(window.navigate("customer-statement"),setTimeout(()=>{window.selectStmtCustomer&&window.selectStmtCustomer(t)},300))};window.setCustomerTierFilter=t=>{M=t,document.querySelectorAll(".tier-filter-btn").forEach(r=>r.classList.remove("active"));const e=document.getElementById(`tier-btn-${t}`);e&&e.classList.add("active");const o=document.getElementById("cust-tbody");o&&g.length>0&&ot(g,o)};function xt(t){const e=t.length,o=t.filter(l=>l.tier?.key==="A").length,r=t.filter(l=>l.tier?.key==="B").length,s=t.filter(l=>l.tier?.key==="C").length,i=t.filter(l=>l.tier?.key==="D").length,c=t.filter(l=>l.tier?.key==="inactive").length,u=t.filter(l=>l.status==="pending_approval"||l.approvalStatus==="pending").length,n=t.filter(l=>Array.isArray(l.attachments)&&l.attachments.length>0).length,d=(l,b)=>{const p=document.getElementById(l);p&&(p.textContent=b)};d("tcount-all",e),d("tcount-pending",u),d("tcount-kyc",n),d("tcount-A",o),d("tcount-B",r),d("tcount-C",s),d("tcount-D",i),d("tcount-inactive",c)}function ht(t){const e=t||g||[],o={all:e.length,restaurant:0,catering:0,grocery:0,hotel:0,cafe:0,other:0};e.forEach(s=>{const i=W(s.name);o[i.key]!==void 0?o[i.key]++:o.other++});const r=(s,i)=>{const c=document.getElementById(s);c&&(c.textContent=i)};r("acount-all",o.all),r("acount-restaurant",o.restaurant),r("acount-catering",o.catering),r("acount-grocery",o.grocery),r("acount-hotel",o.hotel),r("acount-cafe",o.cafe),r("acount-other",o.other)}async function T(t=!1){const e=document.getElementById("cust-tbody");if(e){g.length===0&&(e.innerHTML=`${Array(5).fill(0).map(()=>`
                  <tr class="skeleton-row">
                    ${Array(11).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                  </tr>
                `).join("")}`);try{const o=new Date(Date.now()-3024e6).toISOString().slice(0,10);st=o;const[r,s]=await Promise.all([L(w.customers(),[it("name"),gt(1e3)]),L(w.salesInvoices(),[F("date",">=",o)]).catch(()=>[])]);g=r||[],Z=s||[];const i=document.getElementById("cust-zone-filter");if(i&&i.options.length<=1){const c=i.value;[...new Set(g.map(n=>(n.zone||"").trim()).filter(Boolean))].sort().forEach(n=>{i.innerHTML+=`<option value="${n}">${n}</option>`}),c&&(i.value=c)}J(bt,ft,yt)}catch(o){console.error("loadCustomers error:",o),e.innerHTML=`<tr><td colspan="11"><div class="alert bad" style="margin:8px;">${o.message}</div></td></tr>`}}}window.changeCustomerSalesPeriod=t=>{const e=document.getElementById("cust-custom-dates");if(t==="custom"){e&&(e.style.display="inline-flex");const o=document.getElementById("cust-from-date")?.value||"",r=document.getElementById("cust-to-date")?.value||"";o&&J("custom",o,r)}else e&&(e.style.display="none"),J(t)};window.recalcCustomerPeriodSales=()=>{const t=document.getElementById("cust-from-date")?.value||"",e=document.getElementById("cust-to-date")?.value||"";t&&J("custom",t,e)};window.setCustomerActivityFilter=t=>{q=t,document.querySelectorAll(".activity-filter-btn").forEach(r=>r.classList.remove("active"));const e=document.getElementById(`act-btn-${t}`);e&&e.classList.add("active");const o=document.getElementById("cust-activity-filter");o&&(o.value=t),filterCustomersList()};window.onCustomerActivitySelectChange=t=>{q=t,document.querySelectorAll(".activity-filter-btn").forEach(o=>o.classList.remove("active"));const e=document.getElementById(`act-btn-${t}`);e&&e.classList.add("active"),filterCustomersList()};window.setCustomerTierFilter=t=>{M=t,document.querySelectorAll(".tier-filter-btn").forEach(o=>o.classList.remove("active"));const e=document.getElementById(`tier-btn-${t}`);e&&e.classList.add("active"),filterCustomersList()};window.filterCustomersList=()=>{const t=document.getElementById("cust-tbody");if(t){if(!g||g.length===0){T();return}ot(g,t)}};window.refreshCustomers=async()=>{const t=document.getElementById("cust-refresh-btn");if(t&&(t.disabled=!0,t.textContent="⏳ جاري…"),g=[],Z=[],window.ERP_CACHE)for(const e of Object.keys(window.ERP_CACHE))(e.includes("customers")||e.includes("salesInvoices"))&&delete window.ERP_CACHE[e];await T(!0),t&&(t.disabled=!1,t.textContent="🔄  تحديث")};window.toggleCustomerDateSort=()=>{X=X==="desc"?"asc":"desc";const t=document.getElementById("cust-date-sort-icon");t&&(t.textContent=X==="desc"?"⬇️ الأحدث":"⬆️ الأقدم");const e=document.getElementById("cust-tbody");e&&g.length>0&&ot(g,e)};function ot(t,e){if(e||(e=document.getElementById("cust-tbody")),!e)return;let o=[...t||g||[]];const r=document.getElementById("cust-search")?.value?.trim();r&&(o=o.filter(n=>{const d=W(n.name);return Q(n.name||"",r)||(n.code||"").toLowerCase().includes(r.toLowerCase())||Q(n.repName||"",r)||Q(n.zone||"",r)||(n.phone||"").includes(r)||(n.vatNumber||"").includes(r)||(n.nationalId||n.crNumber||"").includes(r)||Q(d.label||"",r)}));const s=document.getElementById("cust-zone-filter")?.value;s&&(o=o.filter(n=>n.zone===s));const i=document.getElementById("cust-rep-filter")?.value;if(i){const n=document.getElementById("cust-rep-filter"),d=n?.options[n.selectedIndex]?.text?.trim();o=o.filter(l=>!!(l.repId===i||l.salesRepId===i||l.assignedRepId===i||d&&(l.repName===d||l.salesRepName===d)))}const c=document.getElementById("cust-credit-filter")?.value;c&&(o=o.filter(n=>K(n.balance||0,n.creditLimit||0).color===c)),q&&q!=="all"&&(o=o.filter(n=>W(n.name).key===q)),xt(o),ht(o),M&&M!=="all"&&(M==="pending"?o=o.filter(n=>n.status==="pending_approval"||n.approvalStatus==="pending"):M==="kyc"?o=o.filter(n=>Array.isArray(n.attachments)&&n.attachments.length>0):o=o.filter(n=>n.tier?.key===M)),o.sort((n,d)=>{const l=ut(n),b=ut(d);return X==="desc"?b-l:l-b});const u=document.getElementById("cust-count");if(u&&(u.textContent=`${o.length} عميل`),o.length===0){e.innerHTML='<tr><td colspan="11" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد نتائج تطابق خيارات البحث والتصفية</td></tr>';return}e.innerHTML=jt(o)}window.openCustomerModal=(t=null)=>{document.getElementById("cust-edit-id").value=t?.id||"",document.getElementById("cust-modal-title").textContent=t?"تعديل العميل":"إضافة عميل جديد",document.getElementById("cust-name").value=t?.name||"",document.getElementById("cust-code").value=t?.code||"",document.getElementById("cust-phone").value=t?.phone||"",document.getElementById("cust-vat").value=t?.vatNumber||t?.vat||"";const e=t?.nationalId||t?.crNumber||t?.cr||"";if(document.getElementById("cust-national-id").value=e,document.getElementById("cust-zone").value=t?.zone||"",document.getElementById("cust-street").value=t?.street||"",document.getElementById("cust-district").value=t?.district||"",document.getElementById("cust-city").value=t?.city||"",document.getElementById("cust-building-no").value=t?.buildingNo||t?.buildingNumber||"",document.getElementById("cust-postal-code").value=t?.postalCode||t?.zip||"",document.getElementById("cust-additional-no").value=t?.additionalNo||t?.additionalNumber||"",document.getElementById("cust-country").value=t?.country||"المملكة العربية السعودية",!t?.street&&!t?.district&&t?.address){const l=t.address;l.includes("حي")?l.split(/[-—,]/).map(p=>p.trim()).forEach(p=>{p.includes("حي")?document.getElementById("cust-district").value=p:p.includes("شارع")||p.includes("الشارع")?document.getElementById("cust-street").value=p:document.getElementById("cust-street").value||(document.getElementById("cust-street").value=p)}):document.getElementById("cust-street").value=l}document.getElementById("cust-notes").value=t?.notes||"",document.getElementById("cust-delivery-day").value=t?.deliveryDay||"",document.getElementById("cust-route-group").value=t?.routeGroup||"",document.getElementById("cust-maps-url").value=t?.googleMapsUrl||"",document.getElementById("cust-credit-limit").value=t?.creditLimit||"",document.getElementById("cust-credit-days").value=t?.creditDays||"",document.getElementById("cust-rep").value=t?.repId||"",document.getElementById("cust-price-list").value=t?.priceList||"default",document.getElementById("cust-tier-override").value=t?.tierOverride||t?.manualTier||"auto",document.getElementById("cust-form-error").classList.add("hidden");const o=!!t?.hasBrokerCommission,r=document.getElementById("cust-has-broker");r&&(r.checked=o);const s=document.getElementById("cust-broker-fields");s&&(s.style.display=o?"grid":"none");const i=document.getElementById("cust-broker-name");i&&(i.value=t?.brokerName||"زياد");const c=document.getElementById("cust-broker-rate");c&&(c.value=t?.brokerRate!==void 0?t.brokerRate:"1.0");const u=document.getElementById("cust-broker-trigger");u&&(u.value=t?.brokerTrigger||"on_invoice");const n=document.getElementById("cust-coa-toggle-wrap"),d=document.getElementById("cust-coa-toggle");t?(n&&(n.style.display="none"),d&&(d.checked=!!t.accountId)):(n&&(n.style.display="flex"),d&&(d.checked=!0)),openModal("customer-modal")};window.toggleBrokerFields=t=>{const e=document.getElementById("cust-broker-fields");e&&(e.style.display=t?"grid":"none")};window.editCustomer=t=>{const e=g.find(o=>o.id===t);e?openCustomerModal(e):S(()=>import("./index-CF9GFeRJ.js").then(o=>o.T),__vite__mapDeps([0,1])).then(async({getById:o})=>{try{const r=await o("customers",t);r&&openCustomerModal(r)}catch(r){showToast(r.message,"error")}})};window.issueTrustReceiptFromCustomers=async t=>{const{openTrustReceiptModal:e}=await S(async()=>{const{openTrustReceiptModal:o}=await import("./trust-receipts.js_v_2-C9I3kW4K.js");return{openTrustReceiptModal:o}},__vite__mapDeps([2,0,1]));e(t)};window.issueDebtAckFromCustomers=async t=>{const{openDebtAcknowledgmentModal:e}=await S(async()=>{const{openDebtAcknowledgmentModal:o}=await import("./debt-acknowledgment.js_v_2-H-BqRKEN.js");return{openDebtAcknowledgmentModal:o}},__vite__mapDeps([3,0,1]));e(t)};window.issuePromissoryNote=async(t,e)=>{window.navigate&&window.navigate("promissory-notes");let o=0;const r=()=>{o++,typeof window.openNewNoteModal=="function"?window.openNewNoteModal(t,e):o<30&&setTimeout(r,300)};setTimeout(r,600)};window.saveCustomer=async()=>{const t=document.getElementById("cust-form-error");t.classList.add("hidden");const e=document.getElementById("cust-edit-id").value,o=document.getElementById("cust-name").value.trim();if(!o){t.textContent="اسم العميل مطلوب",t.classList.remove("hidden");return}const r=document.getElementById("cust-rep"),s=document.getElementById("cust-national-id").value.trim(),i=document.getElementById("cust-street")?.value?.trim()||"",c=document.getElementById("cust-district")?.value?.trim()||"",u=document.getElementById("cust-city")?.value?.trim()||"",n=document.getElementById("cust-building-no")?.value?.trim()||"",d=document.getElementById("cust-postal-code")?.value?.trim()||"",l=document.getElementById("cust-additional-no")?.value?.trim()||"",b=document.getElementById("cust-country")?.value?.trim()||"المملكة العربية السعودية",p=[];n&&p.push(`رقم المبنى: ${n}`),i&&p.push(`الشارع: ${i}`),c&&p.push(`الحي: ${c}`),u&&p.push(`المدينة: ${u}`),d&&p.push(`الرمز البريدي: ${d}`);const x=p.length>0?p.join(" — "):"",v=document.getElementById("cust-has-broker")?.checked||!1,f=document.getElementById("cust-broker-name")?.value?.trim()||"زياد",k=parseFloat(document.getElementById("cust-broker-rate")?.value)||1,E=document.getElementById("cust-broker-trigger")?.value||"on_invoice",B={name:o,code:document.getElementById("cust-code").value.trim(),phone:document.getElementById("cust-phone").value.trim(),vatNumber:document.getElementById("cust-vat").value.trim(),nationalId:s,crNumber:s,zone:document.getElementById("cust-zone").value.trim(),creditLimit:parseFloat(document.getElementById("cust-credit-limit").value)||0,creditDays:parseInt(document.getElementById("cust-credit-days").value)||0,repId:r.value,assignedRepId:r.value,repName:r.options[r.selectedIndex]?.text||"",priceList:document.getElementById("cust-price-list").value,deliveryDay:document.getElementById("cust-delivery-day").value,tierOverride:document.getElementById("cust-tier-override")?.value||"auto",routeGroup:document.getElementById("cust-route-group").value.trim(),googleMapsUrl:document.getElementById("cust-maps-url").value.trim(),hasBrokerCommission:v,brokerName:f,brokerRate:k,brokerTrigger:E,brokerAccountCode:"2-1-4-2",brokerExpenseCode:"5-4-10",street:i,district:c,city:u,buildingNo:n,buildingNumber:n,postalCode:d,additionalNo:l,additionalNumber:l,country:b,address:x,notes:document.getElementById("cust-notes").value.trim()};e||(B.balance=0);const O=document.getElementById("save-cust-btn");O.disabled=!0;try{if(e){const C=g.find(A=>A.id===e);if(await U("customers",e,B),C){const A=C.name!==o;if(C.accountId)A&&await Dt(C.accountId,o);else{const $=await at("customers",e,o);if($){const{id:Y,..._}=$;await U("customers",e,_)}}A&&Ft(e,o).catch($=>console.warn("[Customers] syncCustomerNameEverywhere error:",$.message)),Ot(e).catch(()=>{})}showToast("تم تحديث العميل بنجاح","success")}else{const C=!document.getElementById("cust-coa-toggle").checked,A=await pt(w.customers(),B);if(!C)try{const $=await at("customers",A,o,{repId:B.repId||null});if($){const{id:Y,..._}=$;await U("customers",A,_)}}catch($){console.error("Failed to sync customer to COA:",$),showToast(`⚠️ تم حفظ العميل ولكن فشل تكامل شجرة الحسابات: ${$.message}`,"error")}showToast("تمت إضافة العميل بنجاح","success")}closeModal("customer-modal"),await T()}catch(C){t.textContent=C.message,t.classList.remove("hidden")}finally{O.disabled=!1}};window.deleteCustomer=async(t,e)=>{if(await showConfirm(`هل تريد حذف العميل "${e}" نهائياً؟`,"تأكيد الحذف"))try{const o=g.find(r=>r.id===t);if(o&&o.accountId&&(await zt("customers",t,o.accountId)).action==="archived"){showToast("⚠️ العميل لديه معاملات مالية سابقة. تم أرشفته وتجميد حسابه في شجرة الحسابات.","warning"),await T();return}await St("customers",t),showToast("تم حذف العميل بنجاح","success"),await T()}catch(o){showToast(o.message,"error")}};window.viewCustomerStatement=(t,e)=>{window._preselectedStatementEntity={type:"customer",id:t},navigate("report-customer-statement")};window.exportCustomers=async()=>{window.exportCustomersExcel()};window.exportCustomersExcel=async()=>{try{const t=g.length>0?g:await L(w.customers(),[it("name")]);showToast("جاري تجهيز ملف Excel…","info");const e=t.map(o=>[o.name||"",o.code||"",W(o.name).label,o.phone||"",o.email||"",o.zone||"",o.repName||"",o.priceList||"",o.balance||0,o.creditLimit||0,o.paymentTerms||"",o.vatNumber||"",o.notes||""]);await Lt({title:"العملاء",headers:["اسم العميل*","كود العميل","نشاط العميل","رقم الهاتف","البريد الإلكتروني","المنطقة","المندوب","قائمة الأسعار","الرصيد الحالي","حد الائتمان","شروط الدفع","الرقم الضريبي","ملاحظات"],rows:e,colWidths:[28,14,18,14,26,14,18,14,14,14,14,18,26]}),showToast(`تم تصدير ${e.length} عميل ✅`,"success")}catch(t){showToast("خطأ: "+t.message,"error")}};window.openCustomerImportModal=()=>{const t=document.createElement("div");t.className="modal-overlay active",t.id="cust-import-overlay",t.innerHTML=`
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
    </div>`,document.body.appendChild(t)};let wt=[],Vt=[];window.downloadCustomerTemplate=async()=>{await _t({title:"العملاء",headers:["اسم العميل*","كود العميل","رقم الهاتف","البريد الإلكتروني","المنطقة","اسم المندوب","قائمة الأسعار","حد الائتمان","شروط الدفع","الرقم الضريبي","ملاحظات"],sampleRows:[["شركة المستقبل","C001","0501234567","info@co.sa","الرياض","أحمد","retail",5e4,"net30","300xxxxxxxxxx","عميل مميز"]],colWidths:[28,14,14,26,14,18,14,14,14,18,26]}),showToast("تم تنزيل النموذج ✅","success")};window.handleCustomerImport=async t=>{if(t)try{const{headers:e,rows:o}=await Nt(t);wt=o,Vt=e,document.getElementById("cust-import-status").innerHTML=`<div class="alert good">✅ تم قراءة <strong>${o.length}</strong> عميل. اضغط استيراد لتأكيد الحفظ.</div>`;const r=o.slice(0,5).map(s=>`<tr>${Object.values(s).slice(0,5).map(i=>`<td>${i}</td>`).join("")}</tr>`).join("");document.getElementById("cust-import-preview").innerHTML=`<table class="data-dense" style="font-size:11px;"><tbody>${r}</tbody></table>`,document.getElementById("cust-import-btn").style.display=""}catch(e){showToast(e.message,"error")}};window.executeCustImport=async()=>{const t=document.getElementById("cust-import-btn");t.disabled=!0,t.textContent="⏳ جاري...";let e=0,o=0,r=0;const[s,i]=await Promise.all([L(w.customers(),[]),L(w.salesReps(),[])]),c={};s.forEach(n=>{c[n.name?.trim()?.toLowerCase()]=n.id});const u={};i.forEach(n=>{u[n.name?.trim()?.toLowerCase()]=n.id});for(const n of wt){const d=String(n["اسم العميل*"]||n.اسم||Object.values(n)[0]||"").trim();if(!d){r++;continue}const l=String(n["اسم المندوب"]||"").trim(),b=u[l.toLowerCase()]||null,p={name:d,code:String(n["كود العميل"]||"").trim()||null,phone:String(n["رقم الهاتف"]||"").trim()||null,email:String(n["البريد الإلكتروني"]||"").trim()||null,zone:String(n.المنطقة||"").trim()||null,repName:l||null,repId:b,priceList:String(n["قائمة الأسعار"]||"retail").trim(),creditLimit:parseFloat(n["حد الائتمان"]||0)||0,paymentTerms:String(n["شروط الدفع"]||"net30").trim(),vatNumber:String(n["الرقم الضريبي"]||"").trim()||null,notes:String(n.ملاحظات||"").trim()||null,updatedAt:new Date().toISOString()};try{const x=c[d.toLowerCase()];if(x)await U("customers",x,p),o++;else{p.createdAt=new Date().toISOString(),p.balance=0;const v=await pt(w.customers(),p);at("customers",v,d,{repId:p.repId||null}).then(f=>{f&&U("customers",v,f)}).catch(f=>console.warn(`[Import] COA sync failed for ${d}:`,f.message)),e++}}catch{r++}}document.getElementById("cust-import-overlay").remove(),showToast(`✅ مضاف: ${e} | محدث: ${o} | فاشل: ${r}`,"success"),g=[],await T(!0)};function Ht(t){return g.find(e=>e.id===t)||null}function Ut(t){const e=K(t.balance||0,t.creditLimit||0),o=vt(t);return[{heading:"بيانات العميل",rows:[{label:"اسم العميل",value:t.name,bold:!0},{label:"كود العميل",value:t.code,mono:!0},{label:"تاريخ الإضافة",value:o,mono:!0},{label:"رقم الهاتف",value:t.phone,mono:!0},{label:"البريد الإلكتروني",value:t.email},{label:"المنطقة",value:t.zone},{label:"المندوب",value:t.repName},{label:"قائمة الأسعار",value:t.priceList==="wholesale"?"الجملة":t.priceList==="retail"?"التجزئة":"الأساسي"}]},{heading:"بيانات مالية وقانونية",rows:[{label:"الرصيد الحالي",value:y(t.balance||0),mono:!0,bold:!0},{label:"حد الائتمان",value:y(t.creditLimit||0),mono:!0},{label:"نسبة استهلاك الحد",value:t.creditLimit>0?`${e.pct.toFixed(1)}%`:"بلا حد"},{label:"أيام الائتمان (مهلة السداد)",value:t.creditDays?`${t.creditDays} يوم`:"فوري (كاش)"},{label:"الرقم الضريبي",value:t.vatNumber,mono:!0},{label:"السجل التجاري",value:t.crNumber||t.nationalId,mono:!0},{label:"مصدر التسجيل",value:t.source==="sales_manager_portal"?"💼 بوابة مدير المبيعات الميدانية":"الإدارة العامة"},{label:"ملاحظات",value:t.notes}]},{heading:`الأوراق والمستندات الرسمية (KYC) — (${(t.attachments||[]).length} مستند)`,rows:[{label:"حالة المستندات المرفوعة",value:Array.isArray(t.attachments)&&t.attachments.length>0?t.attachments.map(r=>`📄 ${r.title||r.fileName||"مستند"}`).join(" &nbsp;|&nbsp; "):'<span style="color:#f59e0b; font-weight:700;">لا توجد مستندات مرفوعة بعد</span>'},t.signatureDataUrl?{label:"التوقيع الحي المعتمد",value:"✍️ تم التوقيع الرقمي بنجاح وموثق بالاتفاقية"}:null,{label:"عرض وفحص الملفات",value:`<button class="btn btn-sm" style="background:#0284c7;color:#fff;border:none;padding:4px 12px;border-radius:6px;font-weight:bold;cursor:pointer;" onclick="document.getElementById('record-preview-overlay')?.remove(); window.openCustomerAttachmentsModal('${t.id}')">📁 فتح ملف المستندات والصور (KYC)</button>`}].filter(Boolean)}]}window.previewCustomer=t=>{const e=Ht(t);if(!e){showToast("لم يتم إيجاد العميل","error");return}const o=K(e.balance||0,e.creditLimit||0),r=(e.attachments||[]).length;Pt({title:e.name,icon:"👤",badgeText:o.label,badgeColor:o.color==="good"?"good":o.color==="warn"?"warn":"bad",sections:Ut(e),actions:[{icon:"📁",label:`المستندات الرسمية (${r})`,fn:`document.getElementById('record-preview-overlay')?.remove(); window.openCustomerAttachmentsModal('${t}')`,style:"background:#0284c7;color:#fff;font-weight:bold;"},{icon:"✏️",label:"تعديل",fn:`document.getElementById('record-preview-overlay').remove();editCustomer('${t}')`,style:"background:var(--brand);color:#fff;"},{icon:"📝",label:"اتفاقية الحساب",fn:`document.getElementById('record-preview-overlay').remove();openCustomerAgreement('${t}')`,style:"background:#1E3A8A;color:#fff;"},{icon:"🛡️",label:"سند أمانة وعهدة مالية",fn:`document.getElementById('record-preview-overlay').remove();issueTrustReceiptFromCustomers('${t}')`,style:"background:#0369A1;color:#fff;"},{icon:"⚖️",label:"إقرار مديونية وتعهد سداد",fn:`document.getElementById('record-preview-overlay').remove();issueDebtAckFromCustomers('${t}')`,style:"background:#DC2626;color:#fff;"},{icon:"🖨️",label:"طباعة",fn:`printCustomer('${t}')`,style:"background:var(--bg-2);color:var(--text-1);"},{icon:"📄",label:"PDF",fn:`exportCustomerPDF('${t}')`,style:"background:#EF4444;color:#fff;"},{icon:"📊",label:"كشف حساب",fn:`viewCustomerStatement('${t}','${e.name.replace(/'/g,"\\'")}')`,style:"background:#10B981;color:#fff;"}]})};window.printCustomer=t=>{tt(t)};window.exportCustomerPDF=t=>{tt(t)};window.approveSalesManagerCustomer=async(t,e)=>{const o=g.find(s=>s.id===t);if(!o){showToast("لم يتم العثور على بيانات العميل","error");return}if(window.confirm(`هل تريد اعتماد العميل: "${e}" وتفعيل حسابه رسمياً في النظام؟

• الحد الائتماني: ${y(o.creditLimit||0)}
• المندوب المسؤول: ${o.repName||"غير محدد"}
• سيتم ربطه تلقائياً بشجرة الحسابات (COA) ليصبح متاحاً للبيع فوراً.`))try{showToast("جاري اعتماد العميل وربطه بالشجرة...","info");const{doc:s,updateDoc:i,serverTimestamp:c}=await S(async()=>{const{doc:b,updateDoc:p,serverTimestamp:x}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:b,updateDoc:p,serverTimestamp:x}},[]),{db:u,COMPANY_ID:n}=await S(async()=>{const{db:b,COMPANY_ID:p}=await import("./index-CF9GFeRJ.js").then(x=>x.S);return{db:b,COMPANY_ID:p}},__vite__mapDeps([0,1])),{syncEntityToCoa:d}=await S(async()=>{const{syncEntityToCoa:b}=await import("./coa-connector-9pNG4b1x.js");return{syncEntityToCoa:b}},__vite__mapDeps([4,0,1])),l=s(u,`companies/${n}/customers`,t);await i(l,{status:"active",approvalStatus:"approved",approvedAt:c()});try{await d("customers",t,o.name,{repId:o.repId||o.assignedRepId})}catch(b){console.warn("COA sync warning:",b)}showToast(`✅ تم اعتماد العميل "${e}" وتفعيل حسابه بنجاح!`,"success"),await T()}catch(s){console.error("Approval error:",s),showToast("حدث خطأ أثناء اعتماد العميل: "+s.message,"error")}};window.openCustomerAttachmentsModal=t=>{const e=g.find(s=>s.id===t);if(!e)return;const o=document.createElement("div");o.className="modal-overlay active",o.id="cust-kyc-overlay",o.style.zIndex="1200";const r=Array.isArray(e.attachments)?e.attachments:[];o.innerHTML=`
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

        <h4 style="font-size:13px; font-weight:800; margin-bottom:10px; color:#004d80;">المستندات والملفات المرفوعة (${r.length}):</h4>
        ${r.length===0?`
          <div style="text-align:center; padding:32px; color:var(--text-muted); border:1px dashed #cbd5e1; border-radius:10px;">
            لا توجد مستندات قانونية مرفقة لهذا العميل حتى الآن.
          </div>
        `:`
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(190px, 1fr)); gap:12px;">
            ${r.map(s=>`
              <div style="border:1.5px solid #e2e8f0; border-radius:10px; padding:10px; background:#fff; text-align:center;">
                <div style="font-size:11.5px; font-weight:800; color:#0f172a; margin-bottom:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${s.title||s.fileName}">
                  ${s.title||s.fileName||"مستند قانوني"}
                </div>
                ${s.dataUrl?.startsWith("data:image")?`
                  <a href="${s.dataUrl}" target="_blank" title="اضغط للتكبير وعرض الصورة">
                    <img src="${s.dataUrl}" style="width:100%; height:110px; object-fit:cover; border-radius:6px; border:1px solid #cbd5e1;" />
                  </a>
                `:`
                  <div style="padding:20px; background:#f1f5f9; border-radius:6px; margin-bottom:6px; font-size:24px;">📄</div>
                  <a href="${s.dataUrl}" target="_blank" class="btn btn-secondary btn-sm" style="font-size:11px;">عرض الملف / PDF</a>
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
  `,document.body.appendChild(o)};window.uploadNewCustomerKycDoc=async(t,e)=>{const o=e?.files?.[0];if(!o)return;const r=prompt("أدخل اسم / نوع المستند المرفوع (مثلاً: رخصة البلدية، عقد الإيجار، السجل التجاري):",o.name)||o.name;try{showToast("جاري معالجة ورفع المستند...","info");const s=new FileReader;s.onload=async i=>{const c=i.target.result,{doc:u,updateDoc:n,arrayUnion:d}=await S(async()=>{const{doc:f,updateDoc:k,arrayUnion:E}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:f,updateDoc:k,arrayUnion:E}},[]),{db:l,COMPANY_ID:b}=await S(async()=>{const{db:f,COMPANY_ID:k}=await import("./index-CF9GFeRJ.js").then(E=>E.S);return{db:f,COMPANY_ID:k}},__vite__mapDeps([0,1])),p={docId:"doc_"+Date.now(),title:r,fileName:o.name,dataUrl:c,uploadedAt:new Date().toISOString()},x=u(l,`companies/${b}/customers`,t);await n(x,{attachments:d(p)});const v=g.find(f=>f.id===t);v&&(Array.isArray(v.attachments)||(v.attachments=[]),v.attachments.push(p)),showToast("✅ تم رفع المستند وحفظه بملف العميل بنجاح!","success"),document.getElementById("cust-kyc-overlay")?.remove(),window.openCustomerAttachmentsModal(t)},s.readAsDataURL(o)}catch(s){console.error("Upload error:",s),showToast("حدث خطأ أثناء رفع المستند: "+s.message,"error")}};window.runCustomerCoaMigration=async()=>{const t=document.getElementById("btn-migrate-coa");if(window.confirm(`⚠️ هذه العملية ستُنشئ حسابات تفصيلية في شجرة الحسابات لكل عميل تحت مندوبه.

• العملاء التابعون لمندوب → تحت حساب المندوب (1-1-2-1-2-X)
• العملاء التجاريون المباشرون → تحت (1-1-2-1-1)

العملاء المرتبطون مسبقاً سيُتخطّوا تلقائياً.

هل تريد المتابعة؟`)){t&&(t.disabled=!0,t.textContent="⏳ جاري الترحيل...");try{const o=await Mt(),r=[`✅ تم ترحيل: ${o.migrated.length} عميل`,`⏭️ تم تخطّي: ${o.skipped.length} عميل (مرتبط مسبقاً)`,o.errors.length>0?`❌ أخطاء: ${o.errors.join(", ")}`:""].filter(Boolean).join(`
`);o.migrated.length>0&&console.table(o.migrated),window.alert(r),await T()}catch(o){window.alert("❌ خطأ أثناء الترحيل: "+o.message),console.error("Customer COA Migration Error:",o)}finally{t&&(t.disabled=!1,t.innerHTML="<span>🔗</span> ترحيل ذمم العملاء")}}};window.showCustomerIntelligence=async(t,e)=>{const o=document.createElement("div");o.className="modal-overlay active",o.id="cust-intelligence-overlay",o.style.zIndex="1100",o.innerHTML=`
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
  `,document.body.appendChild(o);try{const[r,s,i,c]=await Promise.all([j(V(w.salesInvoices(),F("customerId","==",t))).catch(()=>({docs:[]})),j(V(w.receipts(),F("targetId","==",t))).catch(()=>({docs:[]})),j(V(w.customerContracts(),F("customerId","==",t))).catch(()=>({docs:[]})),j(V(w.customerComplaints(),F("customerId","==",t))).catch(()=>({docs:[]}))]),u=r.docs.map(a=>a.data()).filter(a=>a.status!=="cancelled"),n=s.docs.map(a=>a.data()).sort((a,m)=>(m.date||"").localeCompare(a.date||"")),d=i.docs.map(a=>a.data()),l=c.docs.map(a=>a.data()),b=new Date(Date.now()-30*864e5).toISOString().slice(0,10),x=u.filter(a=>(a.date||"").slice(0,10)>=b).reduce((a,m)=>a+(m.totalWithVat||m.total||0),0),v=g.find(a=>a.id===t)||{},f=et(x,v.tierOverride||v.manualTier),k=u.length,E=u.reduce((a,m)=>a+(m.subtotal||0),0),B=u.reduce((a,m)=>a+(m.totalWithVat||0),0);let O=0;u.forEach(a=>{const I=(a.lines||a.items||[]).reduce((R,h)=>{const P=parseFloat(h.qty||h.quantity||1)||0,D=parseFloat(h.costPrice!==void 0?h.costPrice:h.purchasePrice!==void 0?h.purchasePrice:h.unitCost||0)||0;return R+P*D},0);O+=I>0?I:parseFloat(a.totalCost)||0});const C=E-O,A=E>0?C/E*100:0,$=v&&v.balance||0,Y=parseInt(v.loyaltyPoints)||0,_=v.pinnedWarningNote||"",$t=Math.max(0,B-$),It=B>0?$t/B*100:100;let nt="—";if(k>1){const a=u.map(h=>new Date(h.date)).sort((h,P)=>h-P),R=(a[a.length-1]-a[0])/(1e3*60*60*24)/(k-1);nt=R<=1?"يومي تقريباً":`كل ${R.toFixed(1)} يوم`}else k===1&&(nt="فاتورة واحدة فقط");let dt="لا يوجد مدفوعات مسجلة";if(n.length>0){const a=n[0];dt=`${y(a.amount||0)} بتاريخ ${a.date||(a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:"—")}`}const Ct=[...u].sort((a,m)=>(m.date||"").localeCompare(a.date||"")),N=[];Ct.forEach(a=>{N.length>=5||(a.lines||[]).forEach(m=>{N.length>=5||N.some(I=>I.productId===m.productId)||N.push({productId:m.productId,name:m.productName,qty:m.qty||m.quantity||1,unit:m.unit&&m.unit!=="undefined"?m.unit:m.unitCode||"",price:m.unitPrice||m.price||0,date:a.date})})});const rt=[...u].sort((a,m)=>(a.date||"").localeCompare(m.date||"")).slice(-10),kt=Math.max(...rt.map(a=>(a.subtotal||0)-(a.totalCost||0)),1),G=document.getElementById("cust-intel-body");if(!G)return;G.style.display="block",window.printCustomerIntelligence=()=>{const a=window.open("","_blank");a.document.write(`
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
            ${G.innerHTML}
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
      `),a.document.close()},G.innerHTML=`
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
              🎁 نقاط الولاء: ${Y} نقطة (${y(Y*.5)})
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

        ${_?`
          <div class="alert bad" style="padding:12px 16px; font-weight:800; font-size:13px; border-radius:10px; display:flex; align-items:center; gap:8px;">
            <span>⚠️</span> <span><b>تحذير ائتماني مثبت للعميل:</b> ${_}</span>
          </div>
        `:""}

        <div class="kpi-grid" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px;">
          <div class="kpi-card" style="padding:16px; border-radius:12px; background:var(--bg-2); border:1px solid var(--border-soft); position:relative;">
            <div style="background:var(--brand); height:4px; border-radius:4px 4px 0 0; position:absolute; top:0; left:0; right:0;"></div>
            <div style="font-size:12px; color:var(--text-3); font-weight:600;">📊 نشاط الفواتير</div>
            <div class="mono" style="font-size:22px; font-weight:800; color:var(--brand); margin-top:8px;">${k} <span style="font-size:12px; font-weight:500;">فاتورة</span></div>
            <div style="font-size:11px; color:var(--text-2); margin-top:4px;">متوسط الشراء: ${nt}</div>
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
            <div class="mono" style="font-size:22px; font-weight:800; color:var(--good); margin-top:8px;">${y(C)}</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:4px;">هامش الربح: ${A.toFixed(1)}%</div>
          </div>
          <div class="kpi-card" style="padding:16px; border-radius:12px; background:var(--bg-2); border:1px solid var(--border-soft); position:relative;">
            <div style="background:var(--warn); height:4px; border-radius:4px 4px 0 0; position:absolute; top:0; left:0; right:0;"></div>
            <div style="font-size:12px; color:var(--text-3); font-weight:600;">⏳ نسبة التحصيل</div>
            <div class="mono" style="font-size:22px; font-weight:800; color:var(--warn); margin-top:8px;">${It.toFixed(1)}%</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:4px;">الرصيد: ${y($)}</div>
          </div>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
          <div class="card" style="margin:0; padding:20px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
            <h4 style="font-size:14px; font-weight:700; color:var(--text-1); margin-bottom:16px;">📥 آخر السدادات</h4>
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${n.slice(0,5).map(a=>`
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-radius:8px; background:var(--bg-3); border:1px solid var(--border-soft);">
                  <div><div style="font-weight:600; font-size:12.5px;">سند رقم ${a.number||"—"}</div></div>
                  <div style="text-align:left;"><div class="font-bold text-good" style="font-size:13.5px;">+ ${y(a.amount||0)}</div><div style="font-size:11px; color:var(--text-3);">${a.date||"—"}</div></div>
                </div>`).join("")}
            </div>
            <div style="font-size:12px; font-weight:700; color:var(--brand); margin-top:16px; border-top:1px solid var(--border-soft); padding-top:12px;">آخر دفعة: ${dt}</div>
          </div>
          <div class="card" style="margin:0; padding:20px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
            <h4 style="font-size:14px; font-weight:700; color:var(--text-1); margin-bottom:16px;">📦 آخر بضائع مشتراة</h4>
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${N.map(a=>`
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-radius:8px; background:var(--bg-3); border:1px solid var(--border-soft);">
                  <div>
                    <div style="font-weight:600; font-size:12.5px;">${a.name}</div>
                    <div style="font-size:11px; color:var(--text-3); margin-top:2px;">التاريخ: ${a.date||"—"}</div>
                  </div>
                  <div style="text-align:left;">
                    <div class="mono font-bold" style="font-size:13px; color:var(--text-1);">${a.qty} ${a.unit||"حبة"}</div>
                    <div style="font-size:11px; color:var(--text-3); margin-top:2px;">سعر الوحدة: ${y(a.price)}</div>
                  </div>
                </div>
              `).join("")}
              ${N.length===0?`
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
                ${u.map(a=>{const m=a.totalWithVat||0,I=a.subtotal||0,h=(a.lines||a.items||[]).reduce((Et,z)=>{const Bt=parseFloat(z.qty||z.quantity||1)||0,At=parseFloat(z.costPrice!==void 0?z.costPrice:z.purchasePrice!==void 0?z.purchasePrice:z.unitCost||0)||0;return Et+Bt*At},0),P=h>0?h:parseFloat(a.totalCost)||0,D=I-P,lt=I>0?D/I*100:0;return`
                    <tr style="border-bottom:1px solid var(--border-soft);">
                      <td style="padding:10px; font-weight:600; color:var(--brand);">${a.number||a.invoiceNumber||a.id}</td>
                      <td style="padding:10px; color:var(--text-3);">${a.date||"—"}</td>
                      <td style="padding:10px;" class="mono">${y(m)}</td>
                      <td style="padding:10px;" class="mono">${y(I)}</td>
                      <td style="padding:10px; color:var(--text-3);" class="mono">${y(P)}</td>
                      <td style="padding:10px; font-weight:600; color:${D>=0?"var(--good)":"var(--bad)"}" class="mono">${D>=0?"+":""}${y(D)}</td>
                      <td style="padding:10px;" class="mono"><span class="badge ${D>=0?"good":"bad"}" style="font-size:11px; padding:2px 8px;">${lt>=0?"+":""}${lt.toFixed(1)}%</span></td>
                    </tr>
                  `}).join("")}
                ${u.length===0?`
                  <tr>
                    <td colspan="7" style="text-align:center; padding:30px; color:var(--text-3);">لا توجد فواتير مبيعات مسجلة لهذا العميل.</td>
                  </tr>
                `:""}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Row 4: CSS Bar Graph representing Profitability per Invoice (last 10 invoices) -->
        ${rt.length>0?`
          <div class="card" style="margin:0; padding:20px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
            <h4 style="font-size:14px; font-weight:700; color:var(--text-1); margin-bottom:24px;">
              📈 رسم بياني لحجم الأرباح من آخر 10 فواتير للعميل
            </h4>
            <div style="display:flex; height:150px; align-items:end; gap:20px; padding:0 20px; position:relative; border-bottom:1px solid var(--border);">
              ${rt.map(a=>{const m=(a.subtotal||0)-(a.totalCost||0),I=m/kt*100;return`
                  <div style="flex:1; display:flex; flex-direction:column; align-items:center; height:100%; justify-content:end; position:relative;">
                    <div class="mono" style="font-size:9.5px; font-weight:700; color:var(--good); margin-bottom:4px; position:absolute; bottom:${I+4}%;">
                      ${Math.round(m)}
                    </div>
                    <div style="width:24px; height:${I}%; background:linear-gradient(to top, var(--good-soft), var(--good)); border-radius:4px 4px 0 0; transition:height 0.3s ease;"></div>
                    <div class="mono" style="font-size:9px; color:var(--text-3); margin-top:8px; white-space:nowrap; transform:rotate(-20deg); transform-origin:top right; margin-right:-10px;">
                      ${a.number||a.id.slice(0,8)}
                    </div>
                  </div>
                `}).join("")}
            </div>
          </div>
        `:""}
      </div>
    `}catch(r){const s=document.getElementById("cust-intel-body");s&&(s.innerHTML=`<div class="alert bad">${r.message}</div>`)}};async function ne(t,e){t.innerHTML=`
    <style>
      .tier-badge {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 2px 7px; border-radius: 6px; font-size: 11px; font-weight: 700;
        white-space: nowrap; line-height: 1.2;
      }
      .tier-badge-a { background: linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(245,215,110,0.1) 100%); color: #F5D76E; border: 1px solid rgba(212,175,55,0.45); }
      .tier-badge-b { background: linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(129,140,248,0.1) 100%); color: #A5B4FC; border: 1px solid rgba(99,102,241,0.45); }
      .tier-badge-c { background: linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(52,211,153,0.1) 100%); color: #6EE7B7; border: 1px solid rgba(16,185,129,0.45); }
      .tier-badge-d { background: linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(251,146,60,0.1) 100%); color: #FDBA74; border: 1px solid rgba(249,115,22,0.45); }
      .tier-badge-inactive { background: rgba(148,163,184,0.12); color: #94A3B8; border: 1px solid rgba(148,163,184,0.3); }
    </style>

    <div class="filterbar">
      <div class="date-range-group"><label>من</label>
        <input type="date" id="rsc-from" value="${Tt()}" onchange="loadSalesByCustomer()" /></div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="rsc-to" value="${mt()}" onchange="loadSalesByCustomer()" /></div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="exportSalesByCustomer()">📤 CSV</button>
        <button class="btn btn-secondary btn-sm" onclick="loadSalesByCustomer()">🔄 تحديث</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">تقرير مبيعات العملاء وديونهم</h1>
        <p class="page-subtitle" id="rsc-period"></p>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>اسم العميل</th>
                <th>الشريحة</th>
                <th>المنطقة</th>
                <th>المندوب</th>
                <th>عدد الفواتير</th>
                <th>إجمالي المشتروات</th>
                <th>الرصيد المدين الحالي</th>
                <th>حد الائتمان</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="rsc-tbody">
              ${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>`,await qt()}let H=[];async function qt(){const t=document.getElementById("rsc-tbody"),e=document.getElementById("rsc-from")?.value,o=document.getElementById("rsc-to")?.value;document.getElementById("rsc-period").textContent=`الفترة: ${e} — ${o}`,t&&(t.innerHTML=`${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`);try{const r=await L(w.customers(),[it("name")]),s=V(w.salesInvoices(),gt(2e3)),c=(await j(s)).docs.map(n=>n.data()).filter(n=>{const d=n.createdAt?.toDate?n.createdAt.toDate().toISOString().split("T")[0]:n.date||"";return d>=e&&d<=o&&n.status!=="cancelled"}),u={};if(r.forEach(n=>{u[n.id]={id:n.id,name:n.name,zone:n.zone||"—",repName:n.repName||"—",balance:n.balance||0,creditLimit:n.creditLimit||0,tierOverride:n.tierOverride||n.manualTier,invCount:0,totalSales:0}}),c.forEach(n=>{!n.customerId||!u[n.customerId]||(u[n.customerId].invCount++,u[n.customerId].totalSales+=n.totalWithVat||0)}),H=Object.values(u).filter(n=>n.totalSales>0||n.balance>0),H.forEach(n=>{n.tier=et(n.totalSales,n.tierOverride)}),H.length===0){t.innerHTML='<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد حركات مبيعات عملاء في هذه الفترة</td></tr>';return}t.innerHTML=H.map(n=>`
      <tr>
        <td class="font-heading font-semibold">${n.name}</td>
        <td>
          <span class="tier-badge ${n.tier.badgeClass}">
            ${n.tier.label} ${n.tier.isManual?"🔒":""}
          </span>
        </td>
        <td class="dim">${n.zone}</td>
        <td class="dim">${n.repName}</td>
        <td class="mono">${n.invCount}</td>
        <td class="mono font-bold text-indigo">${y(n.totalSales)}</td>
        <td class="mono font-bold ${n.balance>0?"text-bad":"text-good"}">${y(n.balance)}</td>
        <td class="mono dim">${y(n.creditLimit)}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="navigate('report-customer-statement')">📄 كشف حساب</button>
        </td>
      </tr>`).join("")}catch(r){t.innerHTML=`<tr><td colspan="9"><div class="alert bad" style="margin:8px;">${r.message}</div></td></tr>`}}window.exportSalesByCustomer=()=>{const t=[["العميل","المنطقة","المندوب","الفواتير","المشتروات","الرصيد المدين","حد الائتمان"]];H.forEach(r=>t.push([r.name,r.zone,r.repName,r.invCount,r.totalSales,r.balance,r.creditLimit]));const e=t.map(r=>r.map(s=>`"${s}"`).join(",")).join(`
`),o=document.createElement("a");o.href=URL.createObjectURL(new Blob(["\uFEFF"+e],{type:"text/csv"})),o.download=`sales_by_customer_${mt()}.csv`,o.click(),showToast("تم التصدير","success")};export{ne as render};
