const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-DaYejt0r.js","assets/index-Dq7oGj9k.css"])))=>i.map(i=>d[i]);
import{E as F,_ as ct,u as M,o as Z,a as x,r as pt,g as B,f as c,s as mt,t as tt}from"./index-DaYejt0r.js";import{u as ut,s as W,d as gt,m as bt}from"./coa-connector-kkbirhvw.js";import{e as yt,d as vt,i as ft}from"./excel-zCoXiaxq.js";import{s as xt}from"./record-actions-BUPPxq1M.js";import{syncCustomerNameEverywhere as ht,syncCustomerBalanceToCoa as wt}from"./sync-engine-BjikcleC.js";import{o as O}from"./customer-agreement-vdFcFmDg.js";import{orderBy as q,getDocs as z,query as A,where as D,limit as et}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";window.openCustomerAgreement=O;window.openBlankCustomerAgreement=()=>O(null,!0);let y=[],j="desc",P="all";function H(t=0,e=null){const o=Number(t)||0;return e&&e!=="auto"&&["A","B","C","D"].includes(e)?e==="A"?{key:"A",label:"👑 فئة A (VIP)",badgeClass:"tier-badge-a",color:"#D4AF37",bg:"rgba(212,175,55,0.15)",border:"rgba(212,175,55,0.45)",isManual:!0,desc:"كبار الحسابات والشركاء (> 20,000 ر.س)",nextTierText:"أعلى شريحة (VIP) 👑"}:e==="B"?{key:"B",label:"💎 فئة B (مميز)",badgeClass:"tier-badge-b",color:"#818cf8",bg:"rgba(99,102,241,0.15)",border:"rgba(99,102,241,0.45)",isManual:!0,desc:"عملاء رئيسيون (10,001 - 20,000 ر.س)",nextTierText:`متبقي ${Math.max(0,20001-o).toLocaleString()} ر.س للترقية إلى فئة A`}:e==="C"?{key:"C",label:"🚀 فئة C (نمو)",badgeClass:"tier-badge-c",color:"#34d399",bg:"rgba(16,185,129,0.15)",border:"rgba(16,185,129,0.45)",isManual:!0,desc:"عملاء متوسطون (5,001 - 10,000 ر.س)",nextTierText:`متبقي ${Math.max(0,10001-o).toLocaleString()} ر.س للترقية إلى فئة B`}:{key:"D",label:"📦 فئة D (تجزئة)",badgeClass:"tier-badge-d",color:"#fb923c",bg:"rgba(249,115,22,0.15)",border:"rgba(249,115,22,0.45)",isManual:!0,desc:"صغار العملاء (1 - 5,000 ر.س)",nextTierText:`متبقي ${Math.max(0,5001-o).toLocaleString()} ر.س للترقية إلى فئة C`}:o>2e4?{key:"A",label:"👑 فئة A (VIP)",badgeClass:"tier-badge-a",color:"#D4AF37",bg:"rgba(212,175,55,0.15)",border:"rgba(212,175,55,0.45)",isManual:!1,desc:"كبار الحسابات والشركاء (مسحوبات > 20,000 ر.س)",nextTierText:"أعلى شريحة (VIP) 👑"}:o>1e4?{key:"B",label:"💎 فئة B (مميز)",badgeClass:"tier-badge-b",color:"#818cf8",bg:"rgba(99,102,241,0.15)",border:"rgba(99,102,241,0.45)",isManual:!1,desc:"عملاء رئيسيون (10,001 - 20,000 ر.س)",nextTierText:`متبقي ${(20001-o).toLocaleString()} ر.س للترقية إلى فئة A`}:o>5e3?{key:"C",label:"🚀 فئة C (نمو)",badgeClass:"tier-badge-c",color:"#34d399",bg:"rgba(16,185,129,0.15)",border:"rgba(16,185,129,0.45)",isManual:!1,desc:"عملاء متوسطون (5,001 - 10,000 ر.س)",nextTierText:`متبقي ${(10001-o).toLocaleString()} ر.س للترقية إلى فئة B`}:o>0?{key:"D",label:"📦 فئة D (تجزئة)",badgeClass:"tier-badge-d",color:"#fb923c",bg:"rgba(249,115,22,0.15)",border:"rgba(249,115,22,0.45)",isManual:!1,desc:"صغار العملاء (1 - 5,000 ر.س)",nextTierText:`متبقي ${(5001-o).toLocaleString()} ر.س للترقية إلى فئة C`}:{key:"inactive",label:"⚪ غير نشط",badgeClass:"tier-badge-inactive",color:"#94a3b8",bg:"rgba(148,163,184,0.12)",border:"rgba(148,163,184,0.3)",isManual:!1,desc:"بلا مسحوبات خلال آخر 30 يوماً",nextTierText:"يحتاج لشراء 1 ر.س لدخول فئة D"}}function ot(t){if(!t)return"—";if(t.createdAt){if(t.createdAt.toDate)return t.createdAt.toDate().toISOString().split("T")[0];if(t.createdAt.seconds)return new Date(t.createdAt.seconds*1e3).toISOString().split("T")[0];if(typeof t.createdAt=="string")return t.createdAt.slice(0,10)}return t.createdDate?String(t.createdDate).slice(0,10):t.dateAdded?String(t.dateAdded).slice(0,10):t.date?String(t.date).slice(0,10):"—"}function Y(t){if(!t)return 0;if(t.createdAt?.toDate)return t.createdAt.toDate().getTime();if(t.createdAt?.seconds)return t.createdAt.seconds*1e3;if(typeof t.createdAt=="string"){const e=new Date(t.createdAt).getTime();if(!isNaN(e))return e}if(t.createdDate){const e=new Date(t.createdDate).getTime();if(!isNaN(e))return e}if(t.dateAdded){const e=new Date(t.dateAdded).getTime();if(!isNaN(e))return e}if(t.date){const e=new Date(t.date).getTime();if(!isNaN(e))return e}return 0}function It(t){return t.map(e=>{const o=F(e.balance||0,e.creditLimit||0),r=ot(e),i=e.tier||H(e.monthlySales||0,e.tierOverride),p=e.monthlySales||0;return`<tr>
      <td>
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <div class="font-semibold font-heading" 
               style="color:var(--brand); cursor:pointer; text-decoration:underline; font-weight:800;" 
               onclick="window.showCustomerIntelligence('${e.id}', '${e.name.replace(/'/g,"\\'")}')"
               title="🧠 عرض لوحة ذكاء العميل والتحليل الإحصائي">
            ${e.name}
          </div>
          <span class="tier-badge ${i.badgeClass}" title="${i.desc}">
            ${i.label} ${i.isManual?"🔒":""}
          </span>
        </div>
        <div style="font-size:11px;color:var(--text-2);display:flex;align-items:center;gap:6px;margin-top:2px;">
          <span class="mono">${e.code||""}</span>
          ${r!=="—"?`<span style="font-size:10px;color:var(--text-2);background:rgba(0,0,0,0.05);padding:1px 5px;border-radius:4px;" title="تاريخ إضافة العميل">📅 ${r}</span>`:""}
        </div>
      </td>
      <td class="mono dim" style="white-space:nowrap;">
        ${r!=="—"?`<span class="badge neutral mono" style="font-size:11px;font-weight:600;">📅 ${r}</span>`:"—"}
      </td>
      <td style="white-space:nowrap;">
        <div class="mono font-bold" style="color:${i.color}; font-size:12.5px;">
          ${c(p)}
        </div>
        <div class="dim" style="font-size:10px;" title="${i.nextTierText}">
          ${i.nextTierText}
        </div>
      </td>
      <td class="mono dim">${e.phone||"—"}</td>
      <td class="dim">${e.zone||"—"}</td>
      <td class="dim">${e.repName||"—"}</td>
      <td class="mono ${e.balance>0?"text-bad":"text-good"}">${c(e.balance||0)}</td>
      <td class="mono">${c(e.creditLimit||0)}</td>
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
    </tr>`}).join("")}window.viewCustomerStatement=(t,e)=>{window.navigate&&(window.navigate("customer-statement"),setTimeout(()=>{window.selectStmtCustomer&&window.selectStmtCustomer(t)},300))};window.setCustomerTierFilter=t=>{P=t,document.querySelectorAll(".tier-filter-btn").forEach(r=>r.classList.remove("active"));const e=document.getElementById(`tier-btn-${t}`);e&&e.classList.add("active");const o=document.getElementById("cust-tbody");o&&y.length>0&&U(y,o)};function $t(t){const e=t.length,o=t.filter(a=>a.tier?.key==="A").length,r=t.filter(a=>a.tier?.key==="B").length,i=t.filter(a=>a.tier?.key==="C").length,p=t.filter(a=>a.tier?.key==="D").length,l=t.filter(a=>a.tier?.key==="inactive").length,s=(a,m)=>{const h=document.getElementById(a);h&&(h.textContent=m)};s("tcount-all",e),s("tcount-A",o),s("tcount-B",r),s("tcount-C",i),s("tcount-D",p),s("tcount-inactive",l)}async function k(t=!1){const e=document.getElementById("cust-tbody");if(e){y.length===0&&(e.innerHTML=`${Array(5).fill(0).map(()=>`
                  <tr class="skeleton-row">
                    ${Array(11).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                  </tr>
                `).join("")}`);try{const o=[q("name"),et(500)],r=document.getElementById("cust-rep-filter")?.value;r&&o.unshift(D("repId","==",r));const[i,p]=await Promise.all([B(x.customers(),o),B(x.salesInvoices()).catch(()=>[])]),l=new Date(Date.now()-30*864e5).toISOString().slice(0,10),s={};(p||[]).forEach(a=>{if(a.status==="cancelled"||!a.customerId)return;(a.date||(a.createdAt?.toDate?a.createdAt.toDate().toISOString().slice(0,10):typeof a.createdAt=="string"?a.createdAt.slice(0,10):""))>=l&&(s[a.customerId]=(s[a.customerId]||0)+(a.totalWithVat||a.total||0))}),i.forEach(a=>{a.monthlySales=s[a.id]||0,a.tier=H(a.monthlySales,a.tierOverride||a.manualTier)}),y=i,$t(i),U(i,e)}catch(o){e.innerHTML=`<tr><td colspan="11"><div class="alert bad" style="margin:8px;">${o.message}</div></td></tr>`}}}window.refreshCustomers=async()=>{const t=document.getElementById("cust-refresh-btn");if(t&&(t.disabled=!0,t.textContent="⏳ جاري…"),y=[],window.ERP_CACHE)for(const e of Object.keys(window.ERP_CACHE))(e.includes("customers")||e.includes("salesInvoices"))&&delete window.ERP_CACHE[e];await k(),t&&(t.disabled=!1,t.textContent="🔄  تحديث")};window.toggleCustomerDateSort=()=>{j=j==="desc"?"asc":"desc";const t=document.getElementById("cust-date-sort-icon");t&&(t.textContent=j==="desc"?"⬇️ الأحدث":"⬆️ الأقدم");const e=document.getElementById("cust-tbody");e&&y.length>0&&U(y,e)};function U(t,e){let o=[...t];const r=document.getElementById("cust-search")?.value?.toLowerCase().trim();r&&(o=o.filter(s=>s.name?.toLowerCase().includes(r)||s.phone?.includes(r)));const i=document.getElementById("cust-zone-filter")?.value;i&&(o=o.filter(s=>s.zone===i));const p=document.getElementById("cust-credit-filter")?.value;p&&(o=o.filter(s=>F(s.balance||0,s.creditLimit||0).color===p)),P&&P!=="all"&&(o=o.filter(s=>s.tier?.key===P)),o.sort((s,a)=>{const m=Y(s),h=Y(a);return j==="desc"?h-m:m-h});const l=document.getElementById("cust-count");if(l&&(l.textContent=`${o.length} عميل`),o.length===0){e.innerHTML='<tr><td colspan="11" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد نتائج</td></tr>';return}e.innerHTML=It(o)}window.openCustomerModal=(t=null)=>{document.getElementById("cust-edit-id").value=t?.id||"",document.getElementById("cust-modal-title").textContent=t?"تعديل العميل":"إضافة عميل جديد",document.getElementById("cust-name").value=t?.name||"",document.getElementById("cust-code").value=t?.code||"",document.getElementById("cust-phone").value=t?.phone||"",document.getElementById("cust-vat").value=t?.vatNumber||t?.vat||"";const e=t?.nationalId||t?.crNumber||t?.cr||"";if(document.getElementById("cust-national-id").value=e,document.getElementById("cust-zone").value=t?.zone||"",document.getElementById("cust-street").value=t?.street||"",document.getElementById("cust-district").value=t?.district||"",document.getElementById("cust-city").value=t?.city||"",document.getElementById("cust-building-no").value=t?.buildingNo||t?.buildingNumber||"",document.getElementById("cust-postal-code").value=t?.postalCode||t?.zip||"",document.getElementById("cust-additional-no").value=t?.additionalNo||t?.additionalNumber||"",document.getElementById("cust-country").value=t?.country||"المملكة العربية السعودية",!t?.street&&!t?.district&&t?.address){const i=t.address;i.includes("حي")?i.split(/[-—,]/).map(l=>l.trim()).forEach(l=>{l.includes("حي")?document.getElementById("cust-district").value=l:l.includes("شارع")||l.includes("الشارع")?document.getElementById("cust-street").value=l:document.getElementById("cust-street").value||(document.getElementById("cust-street").value=l)}):document.getElementById("cust-street").value=i}document.getElementById("cust-notes").value=t?.notes||"",document.getElementById("cust-delivery-day").value=t?.deliveryDay||"",document.getElementById("cust-route-group").value=t?.routeGroup||"",document.getElementById("cust-maps-url").value=t?.googleMapsUrl||"",document.getElementById("cust-credit-limit").value=t?.creditLimit||"",document.getElementById("cust-credit-days").value=t?.creditDays||"",document.getElementById("cust-rep").value=t?.repId||"",document.getElementById("cust-price-list").value=t?.priceList||"default",document.getElementById("cust-tier-override").value=t?.tierOverride||t?.manualTier||"auto",document.getElementById("cust-form-error").classList.add("hidden");const o=document.getElementById("cust-coa-toggle-wrap"),r=document.getElementById("cust-coa-toggle");t?(o&&(o.style.display="none"),r&&(r.checked=!!t.accountId)):(o&&(o.style.display="flex"),r&&(r.checked=!0)),openModal("customer-modal")};window.editCustomer=t=>{const e=y.find(o=>o.id===t);e?openCustomerModal(e):ct(()=>import("./index-DaYejt0r.js").then(o=>o.T),__vite__mapDeps([0,1])).then(async({getById:o})=>{try{const r=await o("customers",t);r&&openCustomerModal(r)}catch(r){showToast(r.message,"error")}})};window.issuePromissoryNote=async(t,e)=>{window.navigate&&window.navigate("promissory-notes");let o=0;const r=()=>{o++,typeof window.openNewNoteModal=="function"?window.openNewNoteModal(t,e):o<30&&setTimeout(r,300)};setTimeout(r,600)};window.saveCustomer=async()=>{const t=document.getElementById("cust-form-error");t.classList.add("hidden");const e=document.getElementById("cust-edit-id").value,o=document.getElementById("cust-name").value.trim();if(!o){t.textContent="اسم العميل مطلوب",t.classList.remove("hidden");return}const r=document.getElementById("cust-rep"),i=document.getElementById("cust-national-id").value.trim(),p=document.getElementById("cust-street")?.value?.trim()||"",l=document.getElementById("cust-district")?.value?.trim()||"",s=document.getElementById("cust-city")?.value?.trim()||"",a=document.getElementById("cust-building-no")?.value?.trim()||"",m=document.getElementById("cust-postal-code")?.value?.trim()||"",h=document.getElementById("cust-additional-no")?.value?.trim()||"",T=document.getElementById("cust-country")?.value?.trim()||"المملكة العربية السعودية",v=[];a&&v.push(`رقم المبنى: ${a}`),p&&v.push(`الشارع: ${p}`),l&&v.push(`الحي: ${l}`),s&&v.push(`المدينة: ${s}`),m&&v.push(`الرمز البريدي: ${m}`);const $=v.length>0?v.join(" — "):"",g={name:o,code:document.getElementById("cust-code").value.trim(),phone:document.getElementById("cust-phone").value.trim(),vatNumber:document.getElementById("cust-vat").value.trim(),nationalId:i,crNumber:i,zone:document.getElementById("cust-zone").value.trim(),creditLimit:parseFloat(document.getElementById("cust-credit-limit").value)||0,creditDays:parseInt(document.getElementById("cust-credit-days").value)||0,repId:r.value,repName:r.options[r.selectedIndex]?.text||"",priceList:document.getElementById("cust-price-list").value,deliveryDay:document.getElementById("cust-delivery-day").value,tierOverride:document.getElementById("cust-tier-override")?.value||"auto",routeGroup:document.getElementById("cust-route-group").value.trim(),googleMapsUrl:document.getElementById("cust-maps-url").value.trim(),street:p,district:l,city:s,buildingNo:a,buildingNumber:a,postalCode:m,additionalNo:h,additionalNumber:h,country:T,address:$,notes:document.getElementById("cust-notes").value.trim()};e||(g.balance=0);const u=document.getElementById("save-cust-btn");u.disabled=!0;try{if(e){const f=y.find(w=>w.id===e);if(await M("customers",e,g),f){const w=f.name!==o;if(f.accountId)w&&await ut(f.accountId,o);else{const b=await W("customers",e,o);b&&await M("customers",e,b)}w&&ht(e,o).catch(b=>console.warn("[Customers] syncCustomerNameEverywhere error:",b.message)),wt(e).catch(()=>{})}showToast("تم تحديث العميل بنجاح","success")}else{const f=!document.getElementById("cust-coa-toggle").checked,w=await Z(x.customers(),g);if(!f)try{const b=await W("customers",w,o,{repId:g.repId||null});b&&await M("customers",w,b)}catch(b){console.error("Failed to sync customer to COA:",b),showToast(`⚠️ تم حفظ العميل ولكن فشل تكامل شجرة الحسابات: ${b.message}`,"error")}showToast("تمت إضافة العميل بنجاح","success")}closeModal("customer-modal"),await k()}catch(f){t.textContent=f.message,t.classList.remove("hidden")}finally{u.disabled=!1}};window.deleteCustomer=async(t,e)=>{if(await showConfirm(`هل تريد حذف العميل "${e}" نهائياً؟`,"تأكيد الحذف"))try{const o=y.find(r=>r.id===t);if(o&&o.accountId&&(await gt("customers",t,o.accountId)).action==="archived"){showToast("⚠️ العميل لديه معاملات مالية سابقة. تم أرشفته وتجميد حسابه في شجرة الحسابات.","warning"),await k();return}await pt("customers",t),showToast("تم حذف العميل بنجاح","success"),await k()}catch(o){showToast(o.message,"error")}};window.viewCustomerStatement=(t,e)=>{window._preselectedStatementEntity={type:"customer",id:t},navigate("report-customer-statement")};window.exportCustomers=async()=>{window.exportCustomersExcel()};window.exportCustomersExcel=async()=>{try{const t=y.length>0?y:await B(x.customers(),[q("name")]);showToast("جاري تجهيز ملف Excel…","info");const e=t.map(o=>[o.name||"",o.code||"",o.phone||"",o.email||"",o.zone||"",o.repName||"",o.priceList||"",o.balance||0,o.creditLimit||0,o.paymentTerms||"",o.vatNumber||"",o.notes||""]);await yt({title:"العملاء",headers:["اسم العميل*","كود العميل","رقم الهاتف","البريد الإلكتروني","المنطقة","المندوب","قائمة الأسعار","الرصيد الحالي","حد الائتمان","شروط الدفع","الرقم الضريبي","ملاحظات"],rows:e,colWidths:[28,14,14,26,14,18,14,14,14,14,18,26]}),showToast(`تم تصدير ${e.length} عميل ✅`,"success")}catch(t){showToast("خطأ: "+t.message,"error")}};window.openCustomerImportModal=()=>{const t=document.createElement("div");t.className="modal-overlay active",t.id="cust-import-overlay",t.innerHTML=`
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
    </div>`,document.body.appendChild(t)};let at=[],Ct=[];window.downloadCustomerTemplate=async()=>{await vt({title:"العملاء",headers:["اسم العميل*","كود العميل","رقم الهاتف","البريد الإلكتروني","المنطقة","اسم المندوب","قائمة الأسعار","حد الائتمان","شروط الدفع","الرقم الضريبي","ملاحظات"],sampleRows:[["شركة المستقبل","C001","0501234567","info@co.sa","الرياض","أحمد","retail",5e4,"net30","300xxxxxxxxxx","عميل مميز"]],colWidths:[28,14,14,26,14,18,14,14,14,18,26]}),showToast("تم تنزيل النموذج ✅","success")};window.handleCustomerImport=async t=>{if(t)try{const{headers:e,rows:o}=await ft(t);at=o,Ct=e,document.getElementById("cust-import-status").innerHTML=`<div class="alert good">✅ تم قراءة <strong>${o.length}</strong> عميل. اضغط استيراد لتأكيد الحفظ.</div>`;const r=o.slice(0,5).map(i=>`<tr>${Object.values(i).slice(0,5).map(p=>`<td>${p}</td>`).join("")}</tr>`).join("");document.getElementById("cust-import-preview").innerHTML=`<table class="data-dense" style="font-size:11px;"><tbody>${r}</tbody></table>`,document.getElementById("cust-import-btn").style.display=""}catch(e){showToast(e.message,"error")}};window.executeCustImport=async()=>{const t=document.getElementById("cust-import-btn");t.disabled=!0,t.textContent="⏳ جاري...";let e=0,o=0,r=0;const[i,p]=await Promise.all([B(x.customers(),[]),B(x.salesReps(),[])]),l={};i.forEach(a=>{l[a.name?.trim()?.toLowerCase()]=a.id});const s={};p.forEach(a=>{s[a.name?.trim()?.toLowerCase()]=a.id});for(const a of at){const m=String(a["اسم العميل*"]||a.اسم||Object.values(a)[0]||"").trim();if(!m){r++;continue}const h=String(a["اسم المندوب"]||"").trim(),T=s[h.toLowerCase()]||null,v={name:m,code:String(a["كود العميل"]||"").trim()||null,phone:String(a["رقم الهاتف"]||"").trim()||null,email:String(a["البريد الإلكتروني"]||"").trim()||null,zone:String(a.المنطقة||"").trim()||null,repName:h||null,repId:T,priceList:String(a["قائمة الأسعار"]||"retail").trim(),creditLimit:parseFloat(a["حد الائتمان"]||0)||0,paymentTerms:String(a["شروط الدفع"]||"net30").trim(),vatNumber:String(a["الرقم الضريبي"]||"").trim()||null,notes:String(a.ملاحظات||"").trim()||null,updatedAt:new Date().toISOString()};try{const $=l[m.toLowerCase()];if($)await M("customers",$,v),o++;else{v.createdAt=new Date().toISOString(),v.balance=0;const g=await Z(x.customers(),v);W("customers",g,m,{repId:v.repId||null}).then(u=>{u&&M("customers",g,u)}).catch(u=>console.warn(`[Import] COA sync failed for ${m}:`,u.message)),e++}}catch{r++}}document.getElementById("cust-import-overlay").remove(),showToast(`✅ مضاف: ${e} | محدث: ${o} | فاشل: ${r}`,"success"),y=[],await k(!0)};function Et(t){return y.find(e=>e.id===t)||null}function Bt(t){const e=F(t.balance||0,t.creditLimit||0),o=ot(t);return[{heading:"بيانات العميل",rows:[{label:"اسم العميل",value:t.name,bold:!0},{label:"كود العميل",value:t.code,mono:!0},{label:"تاريخ الإضافة",value:o,mono:!0},{label:"رقم الهاتف",value:t.phone,mono:!0},{label:"البريد الإلكتروني",value:t.email},{label:"المنطقة",value:t.zone},{label:"المندوب",value:t.repName},{label:"قائمة الأسعار",value:t.priceList==="wholesale"?"الجملة":t.priceList==="retail"?"التجزئة":"الأساسي"}]},{heading:"بيانات مالية وقانونية",rows:[{label:"الرصيد الحالي",value:c(t.balance||0),mono:!0,bold:!0},{label:"حد الائتمان",value:c(t.creditLimit||0),mono:!0},{label:"نسبة استهلاك الحد",value:t.creditLimit>0?`${e.pct.toFixed(1)}%`:"بلا حد"},{label:"أيام الائتمان (مهلة السداد)",value:t.creditDays?`${t.creditDays} يوم`:"فوري (كاش)"},{label:"الرقم الضريبي",value:t.vatNumber,mono:!0},{label:"الهوية الوطنية / السجل التجاري",value:t.nationalId,mono:!0},{label:"ملاحظات",value:t.notes}]}]}window.previewCustomer=t=>{const e=Et(t);if(!e){showToast("لم يتم إيجاد العميل","error");return}const o=F(e.balance||0,e.creditLimit||0);xt({title:e.name,icon:"👤",badgeText:o.label,badgeColor:o.color==="good"?"good":o.color==="warn"?"warn":"bad",sections:Bt(e),actions:[{icon:"✏️",label:"تعديل",fn:`document.getElementById('record-preview-overlay').remove();editCustomer('${t}')`,style:"background:var(--brand);color:#fff;"},{icon:"📝",label:"اتفاقية الحساب",fn:`document.getElementById('record-preview-overlay').remove();openCustomerAgreement('${t}')`,style:"background:#1E3A8A;color:#fff;"},{icon:"🖨️",label:"طباعة",fn:`printCustomer('${t}')`,style:"background:var(--bg-2);color:var(--text-1);"},{icon:"📄",label:"PDF",fn:`exportCustomerPDF('${t}')`,style:"background:#EF4444;color:#fff;"},{icon:"📊",label:"كشف حساب",fn:`viewCustomerStatement('${t}','${e.name.replace(/'/g,"\\'")}')`,style:"background:#10B981;color:#fff;"}]})};window.printCustomer=t=>{O(t)};window.exportCustomerPDF=t=>{O(t)};window.runCustomerCoaMigration=async()=>{const t=document.getElementById("btn-migrate-coa");if(window.confirm(`⚠️ هذه العملية ستُنشئ حسابات تفصيلية في شجرة الحسابات لكل عميل تحت مندوبه.

• العملاء التابعون لمندوب → تحت حساب المندوب (1-1-2-1-2-X)
• العملاء التجاريون المباشرون → تحت (1-1-2-1-1)

العملاء المرتبطون مسبقاً سيُتخطّوا تلقائياً.

هل تريد المتابعة؟`)){t&&(t.disabled=!0,t.textContent="⏳ جاري الترحيل...");try{const o=await bt(),r=[`✅ تم ترحيل: ${o.migrated.length} عميل`,`⏭️ تم تخطّي: ${o.skipped.length} عميل (مرتبط مسبقاً)`,o.errors.length>0?`❌ أخطاء: ${o.errors.join(", ")}`:""].filter(Boolean).join(`
`);o.migrated.length>0&&console.table(o.migrated),window.alert(r),await k()}catch(o){window.alert("❌ خطأ أثناء الترحيل: "+o.message),console.error("Customer COA Migration Error:",o)}finally{t&&(t.disabled=!1,t.innerHTML="<span>🔗</span> ترحيل ذمم العملاء")}}};window.showCustomerIntelligence=async(t,e)=>{const o=document.createElement("div");o.className="modal-overlay active",o.id="cust-intelligence-overlay",o.style.zIndex="1100",o.innerHTML=`
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
  `,document.body.appendChild(o);try{const[r,i,p,l]=await Promise.all([z(A(x.salesInvoices(),D("customerId","==",t))).catch(()=>({docs:[]})),z(A(x.receipts(),D("targetId","==",t))).catch(()=>({docs:[]})),z(A(x.customerContracts(),D("customerId","==",t))).catch(()=>({docs:[]})),z(A(x.customerComplaints(),D("customerId","==",t))).catch(()=>({docs:[]}))]),s=r.docs.map(n=>n.data()).filter(n=>n.status!=="cancelled"),a=i.docs.map(n=>n.data()).sort((n,d)=>(d.date||"").localeCompare(n.date||"")),m=p.docs.map(n=>n.data()),h=l.docs.map(n=>n.data()),T=new Date(Date.now()-30*864e5).toISOString().slice(0,10),$=s.filter(n=>(n.date||"").slice(0,10)>=T).reduce((n,d)=>n+(d.totalWithVat||d.total||0),0),g=y.find(n=>n.id===t)||{},u=H($,g.tierOverride||g.manualTier),f=s.length,w=s.reduce((n,d)=>n+(d.subtotal||0),0),b=s.reduce((n,d)=>n+(d.totalWithVat||0),0),nt=s.reduce((n,d)=>n+(d.totalCost||0),0),G=w-nt,rt=w>0?G/w*100:0,X=g&&g.balance||0,J=parseInt(g.loyaltyPoints)||0,K=g.pinnedWarningNote||"",st=Math.max(0,b-X),it=b>0?st/b*100:100;let _="—";if(f>1){const n=s.map(C=>new Date(C.date)).sort((C,R)=>C-R),S=(n[n.length-1]-n[0])/(1e3*60*60*24)/(f-1);_=S<=1?"يومي تقريباً":`كل ${S.toFixed(1)} يوم`}else f===1&&(_="فاتورة واحدة فقط");let Q="لا يوجد مدفوعات مسجلة";if(a.length>0){const n=a[0];Q=`${c(n.amount||0)} بتاريخ ${n.date||(n.createdAt?.toDate?n.createdAt.toDate().toISOString().split("T")[0]:"—")}`}const dt=[...s].sort((n,d)=>(d.date||"").localeCompare(n.date||"")),E=[];dt.forEach(n=>{E.length>=5||(n.lines||[]).forEach(d=>{E.length>=5||E.some(I=>I.productId===d.productId)||E.push({productId:d.productId,name:d.productName,qty:d.qty||d.quantity||1,unit:d.unit&&d.unit!=="undefined"?d.unit:d.unitCode||"",price:d.unitPrice||d.price||0,date:n.date})})});const V=[...s].sort((n,d)=>(n.date||"").localeCompare(d.date||"")).slice(-10),lt=Math.max(...V.map(n=>(n.subtotal||0)-(n.totalCost||0)),1),N=document.getElementById("cust-intel-body");if(!N)return;N.style.display="block",window.printCustomerIntelligence=()=>{const n=window.open("","_blank");n.document.write(`
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
            ${N.innerHTML}
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
      `),n.document.close()},N.innerHTML=`
      <div style="width:100%; display:flex; flex-direction:column; gap:20px; direction:rtl; text-align:right;">
        
        <!-- Action Toolbar -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; background:var(--bg-card); padding:12px 16px; border-radius:12px; border:1px solid var(--border-soft);">
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" onclick="window.viewCustomerStatement('${t}', '${e.replace(/'/g,"\\'")}')">📊 كشف حساب تفصيلي</button>
            ${g.phone?`
              <button class="btn btn-secondary btn-sm" style="color:#25D366;" onclick="window.open('https://api.whatsapp.com/send?phone=${g.phone.replace(/[^0-9]/g,"")}', '_blank')">💬 محادثة واتساب</button>
            `:""}
            ${g.googleMapsUrl?`
              <a href="${g.googleMapsUrl}" target="_blank" class="btn btn-secondary btn-sm" style="color:var(--brand); text-decoration:none;">📍 فتح في خرائط جوجل</a>
            `:""}
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <span class="badge" style="background:rgba(99,102,241,0.1); color:var(--brand); font-weight:800;">
              🎁 نقاط الولاء: ${J} نقطة (${c(J*.5)})
            </span>
            <span class="badge" style="background:rgba(16,185,129,0.1); color:#10B981; font-weight:800;">
              📜 العقود: ${m.length} عقد
            </span>
          </div>
        </div>

        <!-- Customer Tier & Volume Intelligence Banner -->
        <div style="background:linear-gradient(135deg, ${u.bg} 0%, var(--bg-card) 100%); padding:18px 20px; border-radius:14px; border:1px solid ${u.border}; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div style="font-size:36px; line-height:1;">
              ${u.key==="A"?"👑":u.key==="B"?"💎":u.key==="C"?"🚀":u.key==="D"?"📦":"⚪"}
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:18px; font-weight:800; color:${u.color}; font-family:var(--font-heading);">
                  ${u.label}
                </span>
                ${u.isManual?'<span class="badge neutral" style="font-size:10px;">🔒 تثبيت يدوي</span>':'<span class="badge neutral" style="font-size:10px;">⚡ تصنيف ديناميكي</span>'}
              </div>
              <div style="font-size:12px; color:var(--text-2); margin-top:3px;">
                ${u.desc}
              </div>
            </div>
          </div>
          <div style="text-align:left; min-width:200px;">
            <div style="font-size:11px; color:var(--text-3); font-weight:600;">مسحوبات آخر ٣٠ يوماً</div>
            <div class="mono" style="font-size:20px; font-weight:800; color:${u.color}; margin-top:2px;">
              ${c($)}
            </div>
            <div style="font-size:11px; color:var(--text-2); margin-top:3px;">
              🎯 ${u.nextTierText}
            </div>
          </div>
        </div>

        ${K?`
          <div class="alert bad" style="padding:12px 16px; font-weight:800; font-size:13px; border-radius:10px; display:flex; align-items:center; gap:8px;">
            <span>⚠️</span> <span><b>تحذير ائتماني مثبت للعميل:</b> ${K}</span>
          </div>
        `:""}

        <div class="kpi-grid" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px;">
          <div class="kpi-card" style="padding:16px; border-radius:12px; background:var(--bg-2); border:1px solid var(--border-soft); position:relative;">
            <div style="background:var(--brand); height:4px; border-radius:4px 4px 0 0; position:absolute; top:0; left:0; right:0;"></div>
            <div style="font-size:12px; color:var(--text-3); font-weight:600;">📊 نشاط الفواتير</div>
            <div class="mono" style="font-size:22px; font-weight:800; color:var(--brand); margin-top:8px;">${f} <span style="font-size:12px; font-weight:500;">فاتورة</span></div>
            <div style="font-size:11px; color:var(--text-2); margin-top:4px;">متوسط الشراء: ${_}</div>
          </div>
          <div class="kpi-card" style="padding:16px; border-radius:12px; background:var(--bg-2); border:1px solid var(--border-soft); position:relative;">
            <div style="background:var(--indigo); height:4px; border-radius:4px 4px 0 0; position:absolute; top:0; left:0; right:0;"></div>
            <div style="font-size:12px; color:var(--text-3); font-weight:600;">💰 حجم المبيعات</div>
            <div class="mono" style="font-size:22px; font-weight:800; color:var(--indigo); margin-top:8px;">${c(w)}</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:4px;">شامل الضريبة: ${c(b)}</div>
          </div>
          <div class="kpi-card" style="padding:16px; border-radius:12px; background:var(--bg-2); border:1px solid var(--border-soft); position:relative;">
            <div style="background:var(--good); height:4px; border-radius:4px 4px 0 0; position:absolute; top:0; left:0; right:0;"></div>
            <div style="font-size:12px; color:var(--text-3); font-weight:600;">📈 صافي الربح</div>
            <div class="mono" style="font-size:22px; font-weight:800; color:var(--good); margin-top:8px;">${c(G)}</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:4px;">هامش الربح: ${rt.toFixed(1)}%</div>
          </div>
          <div class="kpi-card" style="padding:16px; border-radius:12px; background:var(--bg-2); border:1px solid var(--border-soft); position:relative;">
            <div style="background:var(--warn); height:4px; border-radius:4px 4px 0 0; position:absolute; top:0; left:0; right:0;"></div>
            <div style="font-size:12px; color:var(--text-3); font-weight:600;">⏳ نسبة التحصيل</div>
            <div class="mono" style="font-size:22px; font-weight:800; color:var(--warn); margin-top:8px;">${it.toFixed(1)}%</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:4px;">الرصيد: ${c(X)}</div>
          </div>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
          <div class="card" style="margin:0; padding:20px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
            <h4 style="font-size:14px; font-weight:700; color:var(--text-1); margin-bottom:16px;">📥 آخر السدادات</h4>
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${a.slice(0,5).map(n=>`
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-radius:8px; background:var(--bg-3); border:1px solid var(--border-soft);">
                  <div><div style="font-weight:600; font-size:12.5px;">سند رقم ${n.number||"—"}</div></div>
                  <div style="text-align:left;"><div class="font-bold text-good" style="font-size:13.5px;">+ ${c(n.amount||0)}</div><div style="font-size:11px; color:var(--text-3);">${n.date||"—"}</div></div>
                </div>`).join("")}
            </div>
            <div style="font-size:12px; font-weight:700; color:var(--brand); margin-top:16px; border-top:1px solid var(--border-soft); padding-top:12px;">آخر دفعة: ${Q}</div>
          </div>
          <div class="card" style="margin:0; padding:20px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
            <h4 style="font-size:14px; font-weight:700; color:var(--text-1); margin-bottom:16px;">📦 آخر بضائع مشتراة</h4>
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${E.map(n=>`
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-radius:8px; background:var(--bg-3); border:1px solid var(--border-soft);">
                  <div>
                    <div style="font-weight:600; font-size:12.5px;">${n.name}</div>
                    <div style="font-size:11px; color:var(--text-3); margin-top:2px;">التاريخ: ${n.date||"—"}</div>
                  </div>
                  <div style="text-align:left;">
                    <div class="mono font-bold" style="font-size:13px; color:var(--text-1);">${n.qty} ${n.unit||"حبة"}</div>
                    <div style="font-size:11px; color:var(--text-3); margin-top:2px;">سعر الوحدة: ${c(n.price)}</div>
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
                ${s.map(n=>{const d=n.totalWithVat||0,I=n.subtotal||0,S=n.totalCost||0,C=I-S,R=I>0?C/I*100:0;return`
                    <tr style="border-bottom:1px solid var(--border-soft);">
                      <td style="padding:10px; font-weight:600; color:var(--brand);">${n.number||n.invoiceNumber||n.id}</td>
                      <td style="padding:10px; color:var(--text-3);">${n.date||"—"}</td>
                      <td style="padding:10px;" class="mono">${c(d)}</td>
                      <td style="padding:10px;" class="mono">${c(I)}</td>
                      <td style="padding:10px; color:var(--text-3);" class="mono">${c(S)}</td>
                      <td style="padding:10px; font-weight:600; color:${C>=0?"var(--good)":"var(--bad)"}" class="mono">${c(C)}</td>
                      <td style="padding:10px;" class="mono"><span class="badge ${C>=0?"good":"bad"}" style="font-size:11px; padding:2px 8px;">${R.toFixed(1)}%</span></td>
                    </tr>
                  `}).join("")}
                ${s.length===0?`
                  <tr>
                    <td colspan="7" style="text-align:center; padding:30px; color:var(--text-3);">لا توجد فواتير مبيعات مسجلة لهذا العميل.</td>
                  </tr>
                `:""}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Row 4: CSS Bar Graph representing Profitability per Invoice (last 10 invoices) -->
        ${V.length>0?`
          <div class="card" style="margin:0; padding:20px; border-radius:12px; border:1px solid var(--border-soft); background:var(--bg-1);">
            <h4 style="font-size:14px; font-weight:700; color:var(--text-1); margin-bottom:24px;">
              📈 رسم بياني لحجم الأرباح من آخر 10 فواتير للعميل
            </h4>
            <div style="display:flex; height:150px; align-items:end; gap:20px; padding:0 20px; position:relative; border-bottom:1px solid var(--border);">
              ${V.map(n=>{const d=(n.subtotal||0)-(n.totalCost||0),I=d/lt*100;return`
                  <div style="flex:1; display:flex; flex-direction:column; align-items:center; height:100%; justify-content:end; position:relative;">
                    <div class="mono" style="font-size:9.5px; font-weight:700; color:var(--good); margin-bottom:4px; position:absolute; bottom:${I+4}%;">
                      ${Math.round(d)}
                    </div>
                    <div style="width:24px; height:${I}%; background:linear-gradient(to top, var(--good-soft), var(--good)); border-radius:4px 4px 0 0; transition:height 0.3s ease;"></div>
                    <div class="mono" style="font-size:9px; color:var(--text-3); margin-top:8px; white-space:nowrap; transform:rotate(-20deg); transform-origin:top right; margin-right:-10px;">
                      ${n.number||n.id.slice(0,8)}
                    </div>
                  </div>
                `}).join("")}
            </div>
          </div>
        `:""}
      </div>
    `}catch(r){const i=document.getElementById("cust-intel-body");i&&(i.innerHTML=`<div class="alert bad">${r.message}</div>`)}};async function Ot(t,e){t.innerHTML=`
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
        <input type="date" id="rsc-from" value="${mt()}" onchange="loadSalesByCustomer()" /></div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="rsc-to" value="${tt()}" onchange="loadSalesByCustomer()" /></div>
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
    </div>`,await kt()}let L=[];async function kt(){const t=document.getElementById("rsc-tbody"),e=document.getElementById("rsc-from")?.value,o=document.getElementById("rsc-to")?.value;document.getElementById("rsc-period").textContent=`الفترة: ${e} — ${o}`,t&&(t.innerHTML=`${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(8).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`);try{const r=await B(x.customers(),[q("name")]),i=A(x.salesInvoices(),et(2e3)),l=(await z(i)).docs.map(a=>a.data()).filter(a=>{const m=a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:a.date||"";return m>=e&&m<=o&&a.status!=="cancelled"}),s={};if(r.forEach(a=>{s[a.id]={id:a.id,name:a.name,zone:a.zone||"—",repName:a.repName||"—",balance:a.balance||0,creditLimit:a.creditLimit||0,tierOverride:a.tierOverride||a.manualTier,invCount:0,totalSales:0}}),l.forEach(a=>{!a.customerId||!s[a.customerId]||(s[a.customerId].invCount++,s[a.customerId].totalSales+=a.totalWithVat||0)}),L=Object.values(s).filter(a=>a.totalSales>0||a.balance>0),L.forEach(a=>{a.tier=H(a.totalSales,a.tierOverride)}),L.length===0){t.innerHTML='<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد حركات مبيعات عملاء في هذه الفترة</td></tr>';return}t.innerHTML=L.map(a=>`
      <tr>
        <td class="font-heading font-semibold">${a.name}</td>
        <td>
          <span class="tier-badge ${a.tier.badgeClass}">
            ${a.tier.label} ${a.tier.isManual?"🔒":""}
          </span>
        </td>
        <td class="dim">${a.zone}</td>
        <td class="dim">${a.repName}</td>
        <td class="mono">${a.invCount}</td>
        <td class="mono font-bold text-indigo">${c(a.totalSales)}</td>
        <td class="mono font-bold ${a.balance>0?"text-bad":"text-good"}">${c(a.balance)}</td>
        <td class="mono dim">${c(a.creditLimit)}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="navigate('report-customer-statement')">📄 كشف حساب</button>
        </td>
      </tr>`).join("")}catch(r){t.innerHTML=`<tr><td colspan="9"><div class="alert bad" style="margin:8px;">${r.message}</div></td></tr>`}}window.exportSalesByCustomer=()=>{const t=[["العميل","المنطقة","المندوب","الفواتير","المشتروات","الرصيد المدين","حد الائتمان"]];L.forEach(r=>t.push([r.name,r.zone,r.repName,r.invCount,r.totalSales,r.balance,r.creditLimit]));const e=t.map(r=>r.map(i=>`"${i}"`).join(",")).join(`
`),o=document.createElement("a");o.href=URL.createObjectURL(new Blob(["\uFEFF"+e],{type:"text/csv"})),o.download=`sales_by_customer_${tt()}.csv`,o.click(),showToast("تم التصدير","success")};export{Ot as render};
