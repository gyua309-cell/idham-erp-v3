const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/goods-receipt-ack.js_v_2-bBvN1RRa.js","assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css","assets/product-cost-sync-DM1NFvQW.js"])))=>i.map(i=>d[i]);
import{t as U,_ as mt,d as et,a as ot,g as K,C as j,w as Ut,f as w,B as Kt,u as Bt,c as wt,o as O,r as Gt,e as Rt}from"./index-CF9GFeRJ.js";import{e as xe}from"./excel-DM5XZHtQ.js";import{orderBy as st,getDocs as Nt,query as jt,limit as Vt,collection as be}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let C=[],dt=[],S=[],Ht=[],Tt=[],qt=[],H=[],Ot=[],ct=[],pt=[],tt={},v=[],rt=null,Ct=null;function Xt(){tt={},(pt||[]).forEach(t=>{const n=q(t.qty,0),e=t.productId,o=t.warehouseId;e&&o&&(tt[`${o}_${e}`]=n),e&&(tt[`total_${e}`]=(tt[`total_${e}`]||0)+n)})}function kt(t,n=null){if(!t)return 0;const e=n!==null?n:document.getElementById("qt-warehouse")?.value||"";if(e){const o=`${e}_${t}`;if(tt[o]!==void 0)return tt[o];const s=(pt||[]).find(i=>i.productId===t&&i.warehouseId===e);return q(s?.qty,0)}return tt[`total_${t}`]!==void 0?tt[`total_${t}`]:(pt||[]).filter(o=>o.productId===t).reduce((o,s)=>o+q(s.qty,0),0)}function Yt(t){if(!t||!ct.length)return"";const n=[];return ct.forEach(e=>{const o=`${e.id}_${t}`,s=tt[o]!==void 0?tt[o]:q(pt.find(i=>i.productId===t&&i.warehouseId===e.id)?.qty,0);s>0&&n.push(`${e.name}: ${s}`)}),n.length>0?`المتوفر بالمخازن: ${n.join(" | ")}`:"لا يوجد رصيد في أي مستودع (الرصيد 0)"}function Jt(t=""){const n=document.getElementById("qt-warehouse");if(!n)return;let e=(ct||[]).find(i=>i.isMain||(i.name||"").includes("الرئيس"))||ct?.[0];const o=t!==void 0&&t!==""?t:e?.id||"",s=(ct||[]).map(i=>{const a=i.isMain?"🏢":i.type==="Vehicle"||(i.name||"").includes("سيار")?"🚐":"🏬",c=i.id===o?"selected":"";return`<option value="${i.id}" ${c}>${a} ${i.name}</option>`}).join("");n.innerHTML='<option value="">🏢 كل المخازن (رصيد إجمالي)</option>'+s,o&&(n.value=o)}window.onQtWarehouseChange=()=>{Q();const t=document.getElementById("qt-product-search");t&&t.value.trim()&&t.dispatchEvent(new Event("input"))};async function ye(){try{pt=await K(j.stockByWarehouse()),Xt()}catch(t){console.warn("refreshStockByWarehouse error:",t)}}let F={retailMargin:10,wholesaleMargin:7,distributorMargin:5},A={basic:4,medium:8,high:13};async function he(){try{const{getDoc:t,doc:n}=await mt(async()=>{const{getDoc:s,doc:i}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:s,doc:i}},[]),e=n(et,`companies/${ot}/settings`,"priceListMargins"),o=await t(e);if(o.exists()){const s=o.data();s.retailMargin!==void 0&&(F.retailMargin=parseFloat(s.retailMargin)),s.wholesaleMargin!==void 0&&(F.wholesaleMargin=parseFloat(s.wholesaleMargin)),s.distributorMargin!==void 0&&(F.distributorMargin=parseFloat(s.distributorMargin)),s.tier1Basic!==void 0&&(A.basic=parseFloat(s.tier1Basic)),s.tier1Medium!==void 0&&(A.medium=parseFloat(s.tier1Medium)),s.tier1High!==void 0&&(A.high=parseFloat(s.tier1High))}try{const s=n(et,`companies/${ot}/settings`,"tier1Margins"),i=await t(s);if(i.exists()){const a=i.data();a.basic!==void 0&&(A.basic=parseFloat(a.basic)),a.medium!==void 0&&(A.medium=parseFloat(a.medium)),a.high!==void 0&&(A.high=parseFloat(a.high))}}catch{}}catch(t){console.warn("Failed to load priceListMargins settings:",t)}}function Lt(t){if(!t)return"medium";const n=String(t.category||"").toLowerCase().trim(),e=String(t.name||t.nameAr||t.productName||"").toLowerCase().trim();return["oils","rice_grains","dry_goods","dairy","egg","water","meat_poultry"].includes(n)||e.includes("زيت")||e.includes("أرز")||e.includes("ارز")||e.includes("سمن")||e.includes("سكر")||e.includes("دقيق")||e.includes("طحين")||e.includes("حليب")||e.includes("لبن")||e.includes("بيض")||e.includes("مياه")||e.includes("ماء")?"basic":e.includes("اندومي")||e.includes("إندومي")||e.includes("نودلز")||e.includes("صلصة")||e.includes("صلصه")||e.includes("طماطم")||e.includes("مكرونة")||e.includes("معكرونة")||e.includes("تونة")||e.includes("تونه")||e.includes("شاي")||e.includes("قهوة")||e.includes("بسكويت")||n==="pasta"||n==="canned"||n==="coffee_tea"||n==="biscuits"||n==="confectionery"||n==="spices"?"medium":["plastics","cleaning","disposables","personal_care"].includes(n)||e.includes("منظف")||e.includes("مطهر")||e.includes("صابون")||e.includes("كلور")||e.includes("فيري")||e.includes("ديتول")||e.includes("بلاستيك")||e.includes("سفره")||e.includes("سفرة")||e.includes("أكياس")||e.includes("اكياس")||e.includes("كيس نفايات")||e.includes("كيس قمامة")||e.includes("كيس بلاستيك")||e.includes("تغليف")||e.includes("قصدير")||e.includes("أكواب")||e.includes("اكواب")||e.includes("مناديل")||e.includes("ورق قصدير")||e.includes("ورق مطبخ")||e.includes("شامبو")||e.includes("معطر")||e.includes("إسفنج")||e.includes("اسفنج")||e.includes("قفاز")?"high":"medium"}function lt(t){const n=Lt(t);return n==="basic"?A.basic:n==="high"?A.high:A.medium}function Zt(t){return t?t.tier==="A"||t.manualTier==="A"||t.tier==="tier1"||t.category==="tier1"||t.category==="فئة أولى"||t.tier==="فئة أولى"||t.priceList==="tier1"||t.priceList==="distributor":!1}function It(){const t=document.getElementById("qt-pricelist")?.value,n=document.getElementById("qt-tier1-indicator");if(n)if(t==="tier1"){n.style.display="flex";const e=document.getElementById("qt-t1-b-pct"),o=document.getElementById("qt-t1-m-pct"),s=document.getElementById("qt-t1-h-pct");e&&(e.textContent=A.basic),o&&(o.textContent=A.medium),s&&(s.textContent=A.high)}else n.style.display="none"}function te(t,n){const e=new Date(t);return e.setDate(e.getDate()+n),e.toISOString().split("T")[0]}function V(t){if(!t)return"—";const n=new Date(t);return isNaN(n)?t:n.toLocaleDateString("ar-SA",{year:"numeric",month:"2-digit",day:"2-digit"})}const ht={draft:{label:"مسودة",cls:"neutral"},sent:{label:"مُرسَل",cls:"indigo"},accepted:{label:"مقبول",cls:"good"},rejected:{label:"مرفوض",cls:"bad"},expired:{label:"منتهي",cls:"warn"},converted:{label:"مُفوتَر",cls:"teal"}};function Pt(t){const n=ht[t]||{label:t,cls:"neutral"};return`<span class="badge ${n.cls}" style="font-size:10px;">${n.label}</span>`}function q(t,n=0){if(t==null)return n;if(typeof t=="number")return isNaN(t)?n:t;let e=String(t).trim();if(!e)return n;e=e.replace(/[٠-٩]/g,s=>"٠١٢٣٤٥٦٧٨٩".indexOf(s)).replace(/[۰-۹]/g,s=>"۰۱۲۳۴۵۶۷۸۹".indexOf(s)).replace(/٫/g,".").replace(/,/g,"");const o=parseFloat(e);return isNaN(o)?n:o}function ee(t,n="standard"){if(!t)return{cost:0,margin:0,lastPurchasePrice:0};let e=q(t.cost||t.unitCost||t.costPrice||t.purchasePrice||t.averageCost,0),o=q(t.lastPurchasePrice,0);const s=q(t.unitPrice!==void 0?t.unitPrice:t.price,0);let i=t.margin!==void 0&&t.margin!==null&&t.margin!==""?q(t.margin,null):null;if(e>0)return i===null||isNaN(i)?i=s>0?Math.round((s/e-1)*100*100)/100:0:i=Math.round(i*100)/100,{cost:Math.round(e*100)/100,margin:i,lastPurchasePrice:Math.round((o||e)*100)/100};if(o>0)return e=o,i===null||isNaN(i)?i=s>0?Math.round((s/e-1)*100*100)/100:0:i=Math.round(i*100)/100,{cost:Math.round(e*100)/100,margin:i,lastPurchasePrice:Math.round(o*100)/100};if(typeof S<"u"&&Array.isArray(S)&&S.length>0){let a=S.find(c=>c.id===t.productId);if(!a&&t.productName){const c=typeof z=="function"?z(t.productName.trim().toLowerCase()):t.productName.trim().toLowerCase();a=S.find(r=>{const u=r.name||r.nameAr||"",g=typeof z=="function"?z(u.trim().toLowerCase()):u.trim().toLowerCase();return g===c||g.includes(c)||c.includes(g)})}if(a){const c=q(a.averageCost||a.costPrice||a.lastPurchasePrice||a.avgCostPrice||a.purchasePrice||a.cost,0);if(c>0)return e=c,o=q(a.lastPurchasePrice,c),i===null||isNaN(i)?i=s>0?Math.round((s/e-1)*100*100)/100:0:i=Math.round(i*100)/100,{cost:Math.round(e*100)/100,margin:i,lastPurchasePrice:Math.round(o*100)/100}}}if(t.productName&&typeof yt=="function")try{const a=yt(t.productName);if(a&&a.length>0&&a[0].costPrice>0)return e=q(a[0].costPrice,0),o=e,i===null||isNaN(i)?i=s>0?Math.round((s/e-1)*100*100)/100:0:i=Math.round(i*100)/100,{cost:Math.round(e*100)/100,margin:i,lastPurchasePrice:Math.round(o*100)/100}}catch{}if(t.productName&&typeof bt=="function")try{const c=bt(t.productName).find(r=>q(r.cost,0)>0);if(c)return e=q(c.cost,0),o=e,i===null||isNaN(i)?i=s>0?Math.round((s/e-1)*100*100)/100:q(c.margin,0):i=Math.round(i*100)/100,{cost:Math.round(e*100)/100,margin:i,lastPurchasePrice:Math.round(o*100)/100}}catch{}if(s>0&&i!==null&&!isNaN(i)&&i>0)return e=Math.round(s/(1+i/100)*100)/100,{cost:e,margin:Math.round(i*100)/100,lastPurchasePrice:e};if(s>0){let a=F?.retailMargin||10;if(n==="tier1"){const c=typeof S<"u"&&Array.isArray(S)?S.find(r=>r.id===t.productId):null;a=lt(c||t)}else n==="wholesale"?a=F?.wholesaleMargin||7:n==="distributor"&&(a=F?.distributorMargin||5);return i=a,e=Math.round(s/(1+i/100)*100)/100,{cost:e,margin:Math.round(i*100)/100,lastPurchasePrice:e}}return{cost:0,margin:0,lastPurchasePrice:0}}function Et(t,n,e){let o=0,s=0,i=0;const a=document.getElementById("qt-pricelist")?.value||"standard";for(const b of t||[]){const k=q(b.qty,0),E=q(b.unitPrice!==void 0?b.unitPrice:b.price,0),N=q(b.discount,0);let $=q(b.cost||b.unitCost||b.costPrice||b.purchasePrice||b.averageCost,0);if($<=0){const M=ee(b,a);$=M.cost,b.cost!==void 0&&$>0&&(b.cost=$),b.margin!==void 0&&M.margin>0&&(!b.margin||b.margin===0)&&(b.margin=M.margin)}const P=k*E,I=P*N/100;o+=P,s+=I,i+=k*$}const c=o-s;let r=0;const u=q(e,0);n==="pct"&&(r=c*u/100),n==="fixed"&&(r=u);const g=Math.max(0,c-r),p=Math.round(g*.15*100)/100,m=Math.round((g+p)*100)/100;i=Math.round(i*100)/100;const x=Math.round((g-i)*100)/100,f=g>0?Math.round(x/g*100*100)/100:0,d=i>0?Math.round(x/i*100*100)/100:0;let l=0,h=0;(t||[]).forEach(b=>{b.margin!==void 0&&b.margin!==null&&!isNaN(b.margin)&&(l+=q(b.margin,0),h++)});const y=h>0?Math.round(l/h*100)/100:d;return{grossTotal:Math.round(o*100)/100,discountLines:Math.round(s*100)/100,extraDiscount:Math.round(r*100)/100,totalDiscount:Math.round((s+r)*100)/100,subtotal:Math.round(g*100)/100,vat:p,grandTotal:m,totalCost:i,totalProfit:x,marginPct:f,markupPct:d,avgMarginPct:y}}async function Ue(t,n){Ct=n,t.innerHTML=ve(),await he(),await Promise.all([we(),oe()]),qe(),ke();try{sessionStorage.getItem("idham_prefilled_quote_lines")&&setTimeout(()=>{typeof window.openQuoteForm=="function"&&window.openQuoteForm()},350)}catch(e){console.warn("Error checking prefilled quote lines:",e)}}function ve(){const t=U();return`
<div class="filterbar">
  <input type="text" id="qt-search" class="input" style="width:200px;"
    placeholder="بحث برقم العرض أو العميل" oninput="filterQuotes()" />
  <div class="filter-select-group">
    <label>الحالة</label>
    <select id="qt-status-filter" onchange="filterQuotes()">
      <option value="">الكل</option>
      <option value="draft">مسودة</option>
      <option value="sent">مُرسَل</option>
      <option value="accepted">مقبول</option>
      <option value="rejected">مرفوض</option>
      <option value="expired">منتهي</option>
      <option value="converted">مُفوتَر</option>
    </select>
  </div>
  <div class="date-range-group"><label>من</label>
    <input type="date" id="qt-from" value="${t.slice(0,8)+"01"}" onchange="filterQuotes()" />
  </div>
  <div class="date-range-group"><label>إلى</label>
    <input type="date" id="qt-to" value="${t}" onchange="filterQuotes()" />
  </div>
  <div class="filter-select-group">
    <label>المندوب</label>
    <select id="qt-rep-filter" onchange="filterQuotes()">
      <option value="">الكل</option>
    </select>
  </div>
  <div style="margin-right:auto;display:flex;gap:8px;">
    <button class="btn-export" onclick="exportPagePDF('.data-dense','عروض_الأسعار')" title="تصدير PDF"><span>📄</span> PDF</button>
    <button class="btn-export excel" onclick="exportPageExcel('.data-dense','عروض_الأسعار')" title="تصدير Excel"><span>📊</span> Excel</button>
    <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
    <button class="btn btn-secondary" id="qt-top-demand-btn" onclick="toggleQuotationsTab()" style="display:flex; align-items:center; gap:6px; font-weight:800; background:linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color:#e0e7ff; border-color:#4338ca; box-shadow:0 2px 8px rgba(49,46,129,0.25);" title="تحليل أكثر الأصناف طلباً في عروض الأسعار والعملاء الطالبين"><span id="qt-top-demand-icon">🏆</span> <span id="qt-top-demand-text">أكثر الأصناف طلباً</span></button>
    <button class="btn btn-secondary" onclick="openTier1MarginsModal()" style="display:flex; align-items:center; gap:6px; font-weight:700; background:rgba(5,150,105,0.08); color:#047857; border-color:rgba(5,150,105,0.3);" title="ضبط وتعديل نسب وهوامش ربح الفئة الأولى"><span>⚙️</span> نسب الفئة الأولى</button>
    <button class="btn btn-secondary" onclick="openSupplierPriceBankModal()" style="display:flex; align-items:center; gap:6px; font-weight:700; background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color:#38bdf8; border-color:#334155;" title="استيراد وبنك عروض أسعار الموردين (PDF / Excel)"><span>🏢</span> بنك أسعار الموردين</button>
    <button class="btn btn-secondary" onclick="openQuotationImportModal()" style="display:flex; align-items:center; gap:6px; font-weight:700;">📥 استيراد ذكي (Excel / PDF / نسخ)</button>
    <button class="btn btn-primary" onclick="openQuoteForm()">+ عرض سعر جديد</button>
  </div>
</div>

<div class="page-content">
  <div class="kpi-grid mb-20">
    <div class="kpi-card g-blue">
      <div class="kpi-icon">📋</div>
      <div class="kpi-content"><div class="kpi-label">إجمالي العروض</div>
        <div class="kpi-value mono" id="kpi-qt-total">—</div></div></div>
    <div class="kpi-card g-green">
      <div class="kpi-icon">✅</div>
      <div class="kpi-content"><div class="kpi-label">عروض مقبولة</div>
        <div class="kpi-value mono" id="kpi-qt-accepted">—</div></div></div>
    <div class="kpi-card g-orange">
      <div class="kpi-icon">⏳</div>
      <div class="kpi-content"><div class="kpi-label">عروض منتظرة</div>
        <div class="kpi-value mono" id="kpi-qt-pending">—</div></div></div>
    <div class="kpi-card g-purple">
      <div class="kpi-icon">🔄</div>
      <div class="kpi-content"><div class="kpi-label">نسبة التحويل</div>
        <div class="kpi-value mono" id="kpi-qt-conv">—</div></div></div>
  </div>

  <!-- ═══ NAVIGATION TABS (عروض الأسعار vs أكثر الأصناف طلباً) ═══ -->
  <div style="display:flex; gap:8px; margin-bottom:16px; border-bottom:2px solid #cbd5e1; padding-bottom:0;">
    <button type="button" id="qt-tab-btn-quotes" class="btn btn-primary" onclick="switchQuotationsTab('quotes')" style="display:inline-flex; align-items:center; gap:8px; font-weight:800; font-size:13px; border-radius:10px 10px 0 0; padding:10px 22px; cursor:pointer;">
      <span>📋</span> قائمة عروض الأسعار
      <span id="qt-quotes-count-badge" style="background:#2563eb; color:#ffffff; font-size:11px; padding:2px 8px; border-radius:12px; font-weight:900;">${C.length||0} عرض</span>
    </button>
    <button type="button" id="qt-tab-btn-demand" class="btn btn-secondary" onclick="switchQuotationsTab('demand')" style="display:inline-flex; align-items:center; gap:8px; font-weight:800; font-size:13px; border-radius:10px 10px 0 0; padding:10px 22px; background:#f8fafc; color:#334155; border:1.5px solid #cbd5e1; border-bottom:none; cursor:pointer;">
      <span>🏆</span> أكثر الأصناف طلباً في العروض والعملاء
      <span id="qt-demand-count-badge" style="background:#4338ca; color:#ffffff; font-size:11px; padding:2px 8px; border-radius:12px; font-weight:900;">0 صنف</span>
    </button>
  </div>

  <!-- ═══ TAB 1: QUOTATIONS LIST ═══ -->
  <div id="qt-view-quotes-section">
    <div class="card">
      <div class="card-header">
        <h3 style="font-family:var(--font-heading);font-size:14px;">قائمة عروض الأسعار</h3>
        <span id="qt-count-label" class="text-2" style="font-size:12px;"></span>
      </div>
      <div class="table-container">
        <table class="data-dense">
          <thead><tr>
            <th>رقم العرض</th><th>التاريخ</th><th>العميل</th>
            <th>المندوب</th><th style="text-align:center;">الأصناف</th>
            <th>الإجمالي</th><th>الحالة</th><th>الصلاحية</th>
            <th style="width:160px;">إجراءات</th>
          </tr></thead>
          <tbody id="qt-tbody">
            ${Array(8).fill(0).map(()=>`
                  <tr class="skeleton-row">
                    ${Array(9).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                  </tr>
                `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- ═══ TAB 2: DEMAND & TOP REQUESTED PRODUCTS ANALYSIS ═══ -->
  <div id="qt-view-demand-section" style="display:none;">
    
    <!-- Demand Summary KPIs -->
    <div class="kpi-grid mb-20">
      <div class="kpi-card g-blue" style="border-right:4px solid #3b82f6;">
        <div class="kpi-icon">📦</div>
        <div class="kpi-content">
          <div class="kpi-label">عدد الأصناف المطلوبة</div>
          <div class="kpi-value mono" id="kpi-demand-prod-count">0 صنف</div>
        </div>
      </div>
      <div class="kpi-card g-purple" style="border-right:4px solid #8b5cf6;">
        <div class="kpi-icon">🔁</div>
        <div class="kpi-content">
          <div class="kpi-label">إجمالي مرات طلب الأصناف</div>
          <div class="kpi-value mono" id="kpi-demand-req-count">0 طلب</div>
        </div>
      </div>
      <div class="kpi-card g-orange" style="border-right:4px solid #f97316;">
        <div class="kpi-icon">⚖️</div>
        <div class="kpi-content">
          <div class="kpi-label">إجمالي الكميات المسعرة</div>
          <div class="kpi-value mono" id="kpi-demand-total-qty">0</div>
        </div>
      </div>
      <div class="kpi-card g-green" style="border-right:4px solid #10b981;">
        <div class="kpi-icon">👥</div>
        <div class="kpi-content">
          <div class="kpi-label">العملاء المستفسرين</div>
          <div class="kpi-value mono" id="kpi-demand-cust-count">0 عميل</div>
        </div>
      </div>
    </div>

    <!-- Demand Controls Bar -->
    <div class="card mb-16" style="padding:14px 18px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:12px;">
      <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between;">
        
        <!-- Search & Filters -->
        <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center;">
          <input type="text" id="qt-demand-search" class="input" placeholder="🔍 ابحث باسم الصنف أو العميل..." oninput="renderTopRequestedProducts()" style="width:230px; font-size:12.5px; font-weight:600;" />
          
          <div class="filter-select-group">
            <label style="font-size:11px; font-weight:700;">الترتيب حسب</label>
            <select id="qt-demand-sort" class="input" onchange="renderTopRequestedProducts()" style="font-size:12px; font-weight:700;">
              <option value="count">🔥 الأكثر طلباً (عدد مرات العرض)</option>
              <option value="qty">📦 الأكثر كمية مطلوبة</option>
              <option value="value">💰 الأعلى قيمة مسعرة</option>
              <option value="customers">👥 الأكثر تنوعاً في العملاء</option>
            </select>
          </div>

          <div class="filter-select-group">
            <label style="font-size:11px; font-weight:700;">حالة العرض</label>
            <select id="qt-demand-status" class="input" onchange="renderTopRequestedProducts()" style="font-size:12px; font-weight:700;">
              <option value="">جميع الحالات</option>
              <option value="converted">مبيعات محققة (مُفوتَر / مقبول)</option>
              <option value="pending">قيد الدراسة (مسودة / مرسل)</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>

          <div class="date-range-group">
            <label style="font-size:11px; font-weight:700;">من</label>
            <input type="date" id="qt-demand-from" class="input" onchange="renderTopRequestedProducts()" style="font-size:12px;" />
          </div>
          <div class="date-range-group">
            <label style="font-size:11px; font-weight:700;">إلى</label>
            <input type="date" id="qt-demand-to" class="input" onchange="renderTopRequestedProducts()" style="font-size:12px;" />
          </div>

          <button type="button" class="btn btn-secondary btn-sm" onclick="setDemandDatePreset('all')" style="font-size:11px; font-weight:800; padding:4px 10px;">كل الفترات</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="setDemandDatePreset('month')" style="font-size:11px; font-weight:800; padding:4px 10px;">هذا الشهر</button>
        </div>

        <!-- Action Buttons (Print & Excel) -->
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="exportTopRequestedProductsExcel()" style="display:inline-flex; align-items:center; gap:5px; font-weight:800; font-size:12px; background:#f0fdf4; color:#15803d; border:1px solid #86efac;">
            <span>📊</span> تصدير Excel
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="printTopRequestedProductsReport()" style="display:inline-flex; align-items:center; gap:5px; font-weight:800; font-size:12px; background:#eff6ff; color:#1d4ed8; border:1px solid #93c5fd;">
            <span>🖨️</span> طباعة التقرير
          </button>
        </div>

      </div>
    </div>

    <!-- Demand Results Table Card -->
    <div class="card">
      <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h3 style="font-family:var(--font-heading);font-size:15px; font-weight:900; color:#0f172a; display:flex; align-items:center; gap:8px;">
            <span>🏆</span> تحليل الأصناف الأكثر طلباً في عروض الأسعار والعملاء الطالبين
          </h3>
          <span class="text-2" id="qt-demand-subtitle" style="font-size:11.5px; font-weight:600;">يُظهر ترتيب الأصناف حسب تكرار طلبها في العروض، إجمالي الكميات، وقائمة كل عميل طلب الصنف</span>
        </div>
        <div id="qt-demand-stat-badge" class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:800; font-size:12px; padding:4px 12px; border-radius:10px;">0 صنف مسعر</div>
      </div>

      <div class="table-container">
        <table class="data-dense" id="qt-demand-table" style="width:100%; font-size:12.5px;">
          <thead>
            <tr style="background:#1e293b; color:#ffffff;">
              <th style="padding:10px 12px; width:55px; text-align:center;">#</th>
              <th style="padding:10px 12px; width:220px;">اسم الصنف والوحدة</th>
              <th style="padding:10px 12px; width:160px; text-align:center;">كم مرة طُلب؟ (تكرار العروض)</th>
              <th style="padding:10px 12px; width:130px; text-align:left;">إجمالي الكمية المطلوبة</th>
              <th style="padding:10px 12px; width:115px; text-align:left;">متوسط السعر</th>
              <th style="padding:10px 12px; width:125px; text-align:left;">إجمالي القيمة</th>
              <th style="padding:10px 12px; width:110px; text-align:center;">العملاء (من من؟)</th>
              <th style="padding:10px 12px; width:100px; text-align:center;">نسبة النجاح</th>
              <th style="padding:10px 12px; width:130px; text-align:center;">تفاصيل العملاء</th>
            </tr>
          </thead>
          <tbody id="qt-demand-tbody">
            <tr><td colspan="9" style="text-align:center; padding:30px; color:var(--text-3); font-weight:700;">جاري تحليل وتجميع بيانات الطلب...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- QUOTE FORM MODAL                                        -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="modal-overlay" id="qt-form-modal">
  <style>
    /* Scoped Quotation Fullscreen Cockpit */
    #qt-form-modal {
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      padding: 0 !important;
      margin: 0 !important;
      background: rgba(15, 23, 42, 0.85) !important;
      z-index: 9999 !important;
      display: flex !important;
      align-items: stretch !important;
      justify-content: stretch !important;
    }
    #qt-form-modal .modal-xl {
      width: 100vw !important;
      height: 100vh !important;
      max-width: 100vw !important;
      max-height: 100vh !important;
      border-radius: 0 !important;
      margin: 0 !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
      border: none !important;
      background: #f8fafc !important;
    }
    #qt-form-modal input[type="number"]::-webkit-outer-spin-button,
    #qt-form-modal input[type="number"]::-webkit-inner-spin-button,
    #qt-form-modal .no-spin::-webkit-outer-spin-button,
    #qt-form-modal .no-spin::-webkit-inner-spin-button {
      -webkit-appearance: none !important;
      margin: 0 !important;
    }
    #qt-form-modal input[type="number"],
    #qt-form-modal .no-spin {
      -moz-appearance: textfield !important;
    }
    #qt-form-modal input:focus, #qt-form-modal select:focus, #qt-form-modal textarea:focus {
      outline: 2px solid #2563eb !important;
      outline-offset: -1px !important;
      background-color: #eff6ff !important;
    }
    #qt-lines-tbody tr:hover {
      background: rgba(59, 130, 246, 0.04) !important;
    }
    .qt-hud-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 6px;
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      font-size: 11.5px;
      font-weight: 700;
      color: #334155;
      white-space: nowrap;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }
    .qt-hud-pill b {
      font-family: monospace;
      font-size: 12.5px;
      font-weight: 800;
    }
  </style>
  <div class="modal modal-xl">
    
    <!-- Modal Header (Crisp Light Theme 44px) -->
    <div class="modal-header" style="height:44px; background:#ffffff; color:#0f172a; padding:6px 18px; border-bottom:1.5px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; flex-shrink:0; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:20px;">📝</span>
        <h3 class="modal-title" id="qt-form-title" style="color:#0f172a; font-size:15px; font-weight:900; margin:0;">عرض سعر جديد</h3>
        <span class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:800; font-size:10.5px; padding:2px 7px; border:1px solid #c7d2fe;">
          ⛶ شاشة كاملة
        </span>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <button class="modal-close" style="color:#64748b; font-size:24px; line-height:1; padding:0 6px; background:transparent; border:none; cursor:pointer; font-weight:700;" onclick="closeModal('qt-form-modal')">×</button>
      </div>
    </div>

    <!-- Modal Body (Flex 1, No Outer Scroll) -->
    <div class="modal-body" style="padding:8px 12px; overflow:hidden; flex:1 1 0%; min-height:0; display:flex; flex-direction:column; gap:6px; background:#f1f5f9;">

      <!-- Quotation Meta Info Bar (Compact Single Row ~40px) -->
      <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:6px 10px; box-shadow:0 1px 3px rgba(0,0,0,0.04); flex-shrink:0;">
        <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
          
          <div style="flex:2; min-width:230px; position:relative;">
            <div class="autocomplete-container">
              <input type="text" id="qt-customer-search" class="input font-bold"
                style="height:30px; font-size:12px; padding:2px 10px; border-color:#2563eb; background:#fff; width:100%;"
                placeholder="👤 ابحث بالعميل أو اختر... *" autocomplete="off" />
              <div class="autocomplete-results hidden" id="qt-customer-results" style="z-index:99999; max-height:280px; box-shadow:0 10px 30px rgba(0,0,0,0.18);"></div>
              <input type="hidden" id="qt-customer-id" />
              <input type="hidden" id="qt-customer-name-val" />
              <div id="qt-tier1-indicator" style="display:none; margin-top:4px; font-size:10px; font-weight:700; color:#065f46; background:rgba(16,185,129,0.12); padding:2px 6px; border-radius:4px; border:1px solid rgba(16,185,129,0.3); align-items:center; justify-content:space-between;">
                <span>💎 <strong>فئة أولى:</strong> أساسي <span id="qt-t1-b-pct">${A.basic}</span>% | متوسط <span id="qt-t1-m-pct">${A.medium}</span>% | تغليف <span id="qt-t1-h-pct">${A.high}</span>%</span>
                <a href="javascript:void(0)" onclick="openTier1MarginsModal()" style="color:#047857; text-decoration:underline; font-size:9.5px; margin-right:4px;">تعديل ⚙️</a>
              </div>
            </div>
          </div>

          <div style="width:110px;">
            <input type="text" id="qt-number" class="input mono font-bold"
              style="height:30px; font-size:11px; padding:2px 6px; text-align:center; font-weight:800;" placeholder="رقم العرض" title="رقم العرض (تلقائي / قابل للتعديل)" />
          </div>

          <div style="width:125px;">
            <input type="date" id="qt-date" class="input font-bold" style="height:30px; font-size:11.5px; padding:2px 6px; text-align:center;" title="تاريخ العرض *" />
          </div>

          <div style="width:125px;">
            <input type="date" id="qt-expiry" class="input font-bold" style="height:30px; font-size:11.5px; padding:2px 6px; text-align:center;" onchange="checkExpiryWarn()" title="تاريخ الصلاحية *" />
            <div id="qt-expiry-warn" style="font-size:9px; color:var(--bad); display:none; margin-top:1px;">⚠️ منتهي</div>
          </div>

          <div style="width:120px;">
            <select id="qt-rep" class="input" style="height:30px; font-size:11px; padding:2px 4px;"><option value="">بدون مندوب</option></select>
          </div>

          <div style="width:140px;">
            <select id="qt-warehouse" class="input font-bold" onchange="window.onQtWarehouseChange()" style="height:30px; font-size:11px; padding:2px 4px; border-color:#0284c7; color:#0369a1; background:#f0f9ff;" title="المستودع لحساب وتحديد رصيد المخزون المتوفر">
              <option value="">🏢 كل المخازن (رصيد إجمالي)</option>
            </select>
          </div>

          <div style="width:145px;">
            <select id="qt-pricelist" class="input font-bold" onchange="onPricelistChange()" style="height:30px; font-size:11px; padding:2px 4px; border-color:#059669; color:#065f46;">
              <option value="standard">عادي (Standard)</option>
              <option value="wholesale">جملة (Wholesale)</option>
              <option value="distributor">موزع (Distributor)</option>
              <option value="tier1">💎 عميل فئة أولى (هوامش)</option>
              <option value="special">خاص (Special)</option>
            </select>
          </div>

          <div style="width:95px;">
            <select id="qt-payment-terms" class="input" style="height:30px; font-size:11px; padding:2px 4px;">
              <option value="cash">نقداً</option>
              <option value="net30">30 يوم</option>
              <option value="net60">60 يوم</option>
              <option value="custom">بالاتفاق</option>
            </select>
          </div>

          <div style="width:90px;">
            <select id="qt-status" class="input font-bold" style="height:30px; font-size:11px; padding:2px 4px;">
              <option value="draft">مسودة</option>
              <option value="sent">مُرسَل</option>
              <option value="accepted">مقبول</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>

          <button type="button" id="qt-extra-details-btn" class="btn btn-secondary btn-sm" onclick="window.toggleQtExtraDetails()" style="height:30px; font-size:11px; padding:0 8px; font-weight:700;" title="إظهار تفاصيل إضافية: عنوان التسليم، ملاحظات، خصم إضافي">
            ⚙️ تفاصيل وشروط
          </button>

        </div>

        <!-- Secondary Extra Details Drawer -->
        <div id="qt-extra-details-drawer" style="display:none; margin-top:6px; padding-top:6px; border-top:1px dashed #cbd5e1; gap:10px; align-items:flex-start; flex-wrap:wrap;">
          <div style="flex:1; min-width:200px;">
            <label style="font-size:10.5px; font-weight:700; color:#475569; margin-bottom:2px; display:block;">عنوان التسليم:</label>
            <input type="text" id="qt-delivery-address" class="input" placeholder="عنوان التسليم..." style="height:28px; font-size:11px; padding:2px 6px; width:100%;" />
          </div>
          <div style="flex:1.5; min-width:220px;">
            <label style="font-size:10.5px; font-weight:700; color:#475569; margin-bottom:2px; display:block;">ملاحظات للعميل:</label>
            <textarea id="qt-notes" class="input" rows="1" placeholder="ملاحظات تظهر للعميل في العرض المطبوع..." style="resize:vertical; font-size:11px; padding:3px 6px; height:28px; min-height:28px; width:100%;"></textarea>
          </div>
          <div style="flex:1.5; min-width:220px;">
            <label style="font-size:10.5px; font-weight:700; color:#475569; margin-bottom:2px; display:block;">الشروط والأحكام:</label>
            <textarea id="qt-terms" class="input" rows="1" style="resize:vertical; font-size:11px; padding:3px 6px; height:28px; min-height:28px; width:100%;">صلاحية العرض: 30 يوماً من تاريخه. الأسعار شاملة ضريبة القيمة المضافة 15%. يُعدّ هذا العرض ملزماً عند قبوله.</textarea>
          </div>
          <div style="width:160px;">
            <label style="font-size:10.5px; font-weight:700; color:#475569; margin-bottom:2px; display:block;">إرفاق ملف:</label>
            <input type="file" id="qt-file-upload" class="input" style="height:28px; font-size:10px; padding:1px 4px; width:100%;" accept="image/*,application/pdf" />
          </div>
          <div style="display:flex; align-items:center; gap:4px; align-self:flex-end;">
            <label style="font-size:10.5px; font-weight:700; color:#475569; white-space:nowrap;">خصم إضافي:</label>
            <select id="qt-extra-disc-type" class="input" style="width:80px; height:28px; font-size:10.5px; padding:2px 4px;" onchange="recalcTotals()">
              <option value="none">لا يوجد</option>
              <option value="pct">نسبة %</option>
              <option value="fixed">مبلغ ثابت</option>
            </select>
            <input type="number" id="qt-extra-disc-val" class="input mono no-spin" style="width:65px; height:28px; font-size:11px; text-align:center; padding:2px 4px;" min="0" step="0.01" value="0" onwheel="this.blur()" oninput="recalcTotals()" />
          </div>
        </div>

      </div>

      <!-- Product Search & Quick Actions Toolbar (Compact ~36px) -->
      <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:4px 8px; box-shadow:0 1px 3px rgba(0,0,0,0.04); flex-shrink:0; display:flex; gap:8px; align-items:center; justify-content:space-between; flex-wrap:wrap;">
        <div style="display:flex; gap:6px; flex:1; min-width:320px; align-items:center;">
          <select id="qt-product-category-filter" class="input" style="width:130px; height:32px; font-size:11.5px; padding:2px 6px;">
            <option value="">كل الفئات</option>
          </select>
          <div class="autocomplete-container" style="flex:1; position:relative;">
            <input type="text" id="qt-product-search" class="input font-bold"
              placeholder="🔍 ابحث بالاسم أو رمز الصنف (SKU) أو الباركود لإضافة الصنف فوراً... [اضغط Enter للعودة هنا بعد كتابة الكمية]" autocomplete="off"
              style="height:32px; font-size:12.5px; padding:2px 10px; background:#fff; border-color:#2563eb; width:100%;" />
            <div class="autocomplete-results hidden" id="qt-product-results" style="min-width:600px; width:max(100%, 600px); max-width:800px; right:0; left:auto; z-index:99999; box-shadow:0 12px 35px rgba(0,0,0,0.18); border-radius:10px; max-height:360px;"></div>
          </div>
        </div>

        <div style="display:flex; gap:5px; align-items:center; flex-wrap:wrap;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="openSupplierPriceBankModal()" style="height:30px; font-size:11px; padding:3px 7px; background:rgba(15,23,42,0.06); color:#0f172a; font-weight:700;" title="فتح بنك أسعار الموردين">🏢 عروض الموردين</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="openQuotationImportModal()" style="height:30px; font-size:11px; padding:3px 7px; background:rgba(37,99,235,0.08); color:#1d4ed8; font-weight:700;" title="استيراد من Excel أو PDF">📥 استيراد Excel/PDF</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="openQuickAddProductModal()" style="height:30px; font-size:11px; padding:3px 7px; background:rgba(16,185,129,0.08); color:#059669; font-weight:700;" title="إضافة صنف جديد سريع">➕ صنف جديد</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="addCustomQuoteLine()" style="height:30px; font-size:11px; padding:3px 7px; background:rgba(245,158,11,0.08); color:#d97706; font-weight:700;" title="إضافة بند حر مباشر">⚡ بند حر</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="addAllProductsToQuote()" style="height:30px; font-size:11px; padding:3px 7px;" title="إدراج جميع أصناف الكتالوج">📦 إدراج الكل</button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="refreshQuoteItemCostsFromPurchases(this)" style="height:30px; font-size:11px; padding:3px 7px; background:rgba(79,70,229,0.08); color:#4F46E5; font-weight:600;" title="تحديث التكاليف من المشتريات">🔄 التكاليف</button>
          <button type="button" class="btn btn-ghost text-bad btn-sm" onclick="clearAllQuoteLines()" style="height:30px; font-size:11px; padding:3px 6px;" title="مسح كافة البنود">🗑️ تفريغ</button>
        </div>
      </div>

      <!-- Line Items Table (Spacious Fullscreen Viewport) -->
      <div class="invoice-lines table-container qt-lines-scroll-area" style="border:1.5px solid #cbd5e1; border-radius:8px; flex:1 1 0%; min-height:0; overflow-y:auto; overflow-x:auto; background:#fff; box-shadow:inset 0 1px 3px rgba(0,0,0,0.04);">
        <table style="width:100%; min-width:1160px; font-size:12px; border-collapse:collapse;">
          <thead style="position:sticky; top:0; z-index:10; background:#f8fafc; color:#1e293b; border-bottom:2px solid #cbd5e1; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
            <tr>
              <th style="padding:8px 4px; text-align:center; font-size:11px; font-weight:800; color:#475569; width:34px;">#</th>
              <th style="padding:8px 8px; text-align:right; font-size:11.5px; font-weight:900; color:#0f172a; min-width:300px;">الصنف</th>
              <th style="padding:8px 4px; text-align:center; font-size:11.5px; font-weight:800; color:#334155; width:75px;">الوحدة</th>
              <th style="padding:8px 4px; text-align:center; font-size:11.5px; font-weight:900; color:#0284c7; width:85px;">الكمية</th>
              <th class="no-print" style="padding:8px 4px; text-align:center; font-size:11.5px; font-weight:800; color:#475569; width:95px;">سعر التكلفة</th>
              <th class="no-print" style="padding:8px 4px; text-align:center; font-size:11.5px; font-weight:900; color:#059669; width:85px;">هامش ربح%</th>
              <th style="padding:8px 4px; text-align:center; font-size:11.5px; font-weight:900; color:#1e40af; width:110px;">سعر الوحدة</th>
              <th style="padding:8px 4px; text-align:center; font-size:11.5px; font-weight:900; color:#dc2626; width:75px;">خصم %</th>
              <th style="padding:8px 6px; text-align:left; font-size:11.5px; font-weight:800; color:#334155; width:100px;">صافي</th>
              <th style="padding:8px 6px; text-align:left; font-size:11.5px; font-weight:900; color:#d97706; width:90px;">ضريبة 15%</th>
              <th style="padding:8px 8px; text-align:left; font-size:12px; font-weight:900; color:#1e40af; width:115px;">الإجمالي</th>
              <th style="width:34px; text-align:center; padding:8px 2px;"></th>
            </tr>
          </thead>
          <tbody id="qt-lines-tbody"></tbody>
        </table>
      </div>

      <div id="qt-form-error" class="alert bad hidden" style="margin:0; padding:6px 10px; font-size:11.5px;"></div>

    </div>

    <!-- Fixed Bottom HUD Bar (Crisp High-Contrast Light Theme) -->
    <div class="modal-footer" style="height:54px; padding:0 16px; background:#ffffff; border-top:2px solid #cbd5e1; display:flex; justify-content:space-between; align-items:center; flex-shrink:0; box-shadow:0 -2px 10px rgba(0,0,0,0.04);">
      
      <!-- Live Totals Strip -->
      <div style="display:flex; align-items:center; gap:8px; overflow-x:auto; flex:1; margin-left:12px;">
        
        <div class="qt-hud-pill">
          <span style="color:#64748b;">قبل الخصم:</span>
          <b id="qt-t-gross" style="color:#0f172a;">0.00 ر.س</b>
        </div>

        <div class="qt-hud-pill">
          <span style="color:#dc2626;">الخصم:</span>
          <b id="qt-t-disc" style="color:#dc2626;">- 0.00 ر.س</b>
        </div>

        <div class="qt-hud-pill">
          <span style="color:#2563eb;">الخاضع للضريبة:</span>
          <b id="qt-t-subtotal" style="color:#2563eb;">0.00 ر.س</b>
        </div>

        <div class="qt-hud-pill">
          <span style="color:#d97706;">الضريبة (15%):</span>
          <b id="qt-t-vat" style="color:#d97706;">0.00 ر.س</b>
        </div>

        <!-- Profit / Margin Pill (Internal - No print) -->
        <div class="qt-hud-pill no-print" style="background:#ecfdf5; border-color:#a7f3d0;">
          <span style="color:#059669; font-weight:800;">📊 الربح:</span>
          <b id="qt-t-profit" style="color:#059669;">0.00 ر.س</b>
          <span style="color:#0284c7; font-weight:800; margin-right:4px;">| هامش:</span>
          <span id="qt-t-margin-badge" class="badge" style="background:#10b981; color:#fff; font-weight:800; font-size:10.5px; padding:2px 6px; border-radius:4px; font-family:monospace;">0.00%</span>
          <span style="display:none;" id="qt-t-cost">0.00 ر.س</span>
          <span style="display:none;" id="qt-t-margin">0.00%</span>
          <span style="display:none;" id="qt-t-margin-sales">0.00%</span>
          <span style="display:none;" id="qt-t-avg-margin">0.00%</span>
          <span style="display:none;" id="qt-t-profit-row"></span>
        </div>

        <!-- Pinned Grand Total -->
        <div style="display:inline-flex; align-items:center; gap:8px; padding:5px 16px; background:linear-gradient(135deg, #1e40af, #2563eb); border-radius:8px; border:1px solid #1d4ed8; box-shadow:0 2px 6px rgba(37,99,235,0.25);">
          <span style="font-size:12.5px; font-weight:800; color:#dbeafe;">الإجمالي النهائي:</span>
          <span class="mono" style="font-size:18px; font-weight:900; color:#ffffff;" id="qt-t-grand">0.00 ر.س</span>
        </div>

      </div>

      <!-- Action Buttons -->
      <div style="display:flex; gap:6px; align-items:center; flex-shrink:0;">
        <button class="btn btn-ghost sm" onclick="closeModal('qt-form-modal')" style="color:#64748b; height:34px; font-size:12px; font-weight:700;">إلغاء</button>
        <button class="btn btn-secondary sm" id="qt-form-print-btn" style="display:inline-flex; height:34px; font-size:12px; padding:0 12px; background:#f8fafc; border:1.5px solid #cbd5e1; color:#0f172a; font-weight:800;" onclick="printQuoteFromForm()">🖨️ طباعة / PDF</button>
        <button class="btn btn-secondary sm" onclick="saveQuote('draft')" id="qt-save-draft-btn" style="height:34px; font-size:12px; padding:0 12px; background:#f8fafc; border:1.5px solid #cbd5e1; color:#0f172a; font-weight:800;">💾 مسودة</button>
        <button class="btn btn-primary" onclick="saveQuote('sent')" id="qt-save-btn" style="height:36px; padding:0 20px; font-weight:900; font-size:13px; background:linear-gradient(135deg,#2563eb,#1d4ed8); box-shadow:0 2px 6px rgba(37,99,235,0.3);">
          📤 حفظ وإرسال
        </button>
      </div>

    </div>

  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- SMART QUOTATION IMPORT MODAL (Excel / PDF / Paste)      -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="modal-overlay" id="qt-import-modal">
  <div class="modal modal-xl" style="max-height:92vh; display:flex; flex-direction:column; width:95%; max-width:1180px;">
    <div class="modal-header" style="background:linear-gradient(135deg, #040d1f 0%, #0f2d6b 100%); color:#fff; padding:16px 24px; border-radius:12px 12px 0 0;">
      <div>
        <h3 class="modal-title" style="color:#fff; font-size:16px; font-weight:800; display:flex; align-items:center; gap:8px;">
          <span>📥</span> استيراد عرض سعر ذكي (Excel / PDF / نسخ ولصق مباشر)
        </h3>
        <div style="font-size:11.5px; color:rgba(255,255,255,0.75); margin-top:3px;">
          استخراج فوري للأصناف والكميات والأسعار مع مطابقة الكتالوج لغوياً بدقة 100% دون أخطاء
        </div>
      </div>
      <button class="modal-close" style="color:#fff; opacity:0.8;" onclick="closeModal('qt-import-modal')">×</button>
    </div>

    <div class="modal-body" style="overflow-y:auto; flex:1; padding:20px;">
      
      <!-- Top Options Bar: Source Mode, Price Type & Tax & Profit Margin -->
      <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:12px 16px; margin-bottom:16px; display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <!-- Input Method Tabs -->
          <div style="display:flex; gap:6px;">
            <button type="button" id="tab-btn-file" class="btn btn-sm btn-primary" onclick="switchImportTab('file')" style="border-radius:6px; font-size:12px; font-weight:700;">
              📂 رفع ملف (Excel / CSV / PDF)
            </button>
            <button type="button" id="tab-btn-paste" class="btn btn-sm btn-secondary" onclick="switchImportTab('paste')" style="border-radius:6px; font-size:12px; font-weight:700;">
              📋 نسخ ولصق من Excel (Ctrl+V)
            </button>
          </div>

          <!-- Price Type & Tax Mode Options -->
          <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
            <div style="display:flex; align-items:center; gap:6px;">
              <label style="font-size:11.5px; font-weight:700; color:var(--text-1); white-space:nowrap;">نوع أسعار الشيت:</label>
              <select id="qt-import-price-type" class="input sm" style="height:32px; font-size:11.5px; font-weight:700; background:#f0fdf4; border-color:#86efac; color:#166534;" onchange="onImportPriceTypeChange()">
                <option value="cost" selected>💵 أسعار تكلفة شراء من مورد (إضافة هامش ربح لحساب سعر البيع)</option>
                <option value="sale">🏷️ أسعار بيع جاهزة للعميل (استخدامها كسعر بيع مباشر)</option>
              </select>
            </div>

            <div style="display:flex; align-items:center; gap:6px;">
              <label style="font-size:11.5px; font-weight:700; color:var(--text-1); white-space:nowrap;">طبيعة السعر بالشيت:</label>
              <select id="qt-import-tax-mode" class="input sm" style="height:32px; font-size:11.5px; font-weight:700;" onchange="reapplyTaxModeToImported()">
                <option value="exclusive" selected>غير شامل الضريبة (افتراضي)</option>
                <option value="inclusive">شامل ضريبة 15% (استخراج الصافي)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Margin Quick Control Bar (Visible when in Cost Mode) -->
        <div id="qt-import-margin-bar" style="display:flex; align-items:center; justify-content:space-between; background:linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%); border:1px solid #bfdbfe; border-radius:8px; padding:8px 14px; flex-wrap:wrap; gap:10px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:16px;">📈</span>
            <span style="font-size:12px; font-weight:700; color:#1e40af;">تحديد هامش الربح المطلوب على أسعار التكلفة:</span>
            <div style="display:flex; align-items:center; gap:4px;">
              <input type="number" id="qt-import-default-margin" class="input sm mono font-bold" value="10" min="0" max="500" step="0.5" style="width:75px; height:28px; text-align:center; font-size:13px; border-color:#3b82f6; background:#fff;" onchange="applyGlobalImportMargin(this.value)" />
              <span style="font-weight:700; color:#1e40af; font-size:13px;">%</span>
            </div>
            <button type="button" class="btn btn-sm btn-primary" onclick="applyGlobalImportMargin(document.getElementById('qt-import-default-margin').value)" style="height:28px; font-size:11.5px; font-weight:700; padding:0 12px;">
              ⚡ تطبيق على جميع الأصناف
            </button>
          </div>
          <!-- Quick Presets -->
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:11px; color:#64748b; font-weight:600;">نسب سريعة:</span>
            <button type="button" class="btn btn-sm btn-ghost" onclick="applyGlobalImportMargin(5)" style="height:26px; padding:0 8px; font-size:11px; font-weight:700; border:1px solid #cbd5e1; background:#fff;">+5%</button>
            <button type="button" class="btn btn-sm btn-ghost" onclick="applyGlobalImportMargin(10)" style="height:26px; padding:0 8px; font-size:11px; font-weight:700; border:1px solid #cbd5e1; background:#fff;">+10%</button>
            <button type="button" class="btn btn-sm btn-ghost" onclick="applyGlobalImportMargin(15)" style="height:26px; padding:0 8px; font-size:11px; font-weight:700; border:1px solid #cbd5e1; background:#fff;">+15%</button>
            <button type="button" class="btn btn-sm btn-ghost" onclick="applyGlobalImportMargin(20)" style="height:26px; padding:0 8px; font-size:11px; font-weight:700; border:1px solid #cbd5e1; background:#fff;">+20%</button>
            <button type="button" class="btn btn-sm btn-ghost" onclick="applyGlobalImportMargin(25)" style="height:26px; padding:0 8px; font-size:11px; font-weight:700; border:1px solid #cbd5e1; background:#fff;">+25%</button>
          </div>
        </div>
      </div>

      <!-- TAB 1: FILE DRAG & DROP -->
      <div id="import-pane-file">
        <div id="qt-import-dropzone" style="border:2.5px dashed var(--border); border-radius:14px; padding:36px 20px; text-align:center; cursor:pointer; background:var(--bg-2); transition:all 0.2s;"
          onclick="document.getElementById('qt-import-file-input').click()"
          ondragover="event.preventDefault(); this.style.borderColor='var(--brand)'; this.style.background='rgba(37,99,235,0.05)';"
          ondragleave="this.style.borderColor='var(--border)'; this.style.background='var(--bg-2)';"
          ondrop="handleQuotationFileDrop(event)">
          <div style="font-size:44px; margin-bottom:8px;">📊 📄</div>
          <div style="font-weight:800; color:var(--text-0); font-size:15px; margin-bottom:4px;">
            اسحب وأفلت ملف الإكسيل (.xlsx / .xls / .csv) أو ملف PDF هنا
          </div>
          <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">أو اضغط لاختيار الملف من جهازك</div>
          <button type="button" class="btn btn-secondary btn-sm" style="pointer-events:none; font-weight:700;">
            📁 تصفح الملفات
          </button>
        </div>
        <input type="file" id="qt-import-file-input" accept=".xlsx,.xls,.csv,.pdf" style="display:none;" onchange="handleQuotationFileInput(event)" />
      </div>

      <!-- TAB 2: DIRECT PASTE TEXTAREA -->
      <div id="import-pane-paste" class="hidden">
        <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:16px;">
          <div style="font-size:12.5px; font-weight:700; color:var(--text-1); margin-bottom:6px;">
            📋 الصق خلايا الإكسيل هنا مباشرة (حدد الجدول في Excel واضغط Ctrl+C ثم اضغط Ctrl+V هنا):
          </div>
          <textarea id="qt-import-paste-area" class="input mono" rows="6" style="width:100%; font-size:11.5px; resize:vertical;"
            placeholder="اسم الصنف	الوحدة	الكمية	السعر قبل الضريبة	الخصم
بن هرري باجبير 5 ك	قطعة	1	185.50	0.00
فستق أمريكي (21/26) مالح 10 كيلو	كرتون	1	572.40	0.00
..."></textarea>
          <div style="display:flex; justify-content:flex-end; margin-top:10px;">
            <button type="button" class="btn btn-primary" onclick="handlePastedQuotationText()" style="font-weight:700; display:flex; align-items:center; gap:6px;">
              <span>⚡</span> تحليل وقراءة البيانات المنسوخة
            </button>
          </div>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div id="qt-import-loading" class="hidden" style="text-align:center; padding:36px;">
        <div class="loading-spinner" style="margin:0 auto 12px auto; width:36px; height:36px;"></div>
        <div style="font-size:13.5px; font-weight:700; color:var(--brand);" id="qt-import-loading-text">جارٍ قراءة البيانات ومطابقة الأصناف لغوياً مع الكتالوج...</div>
      </div>

      <!-- Error Alert -->
      <div id="qt-import-error" class="alert bad hidden" style="margin-top:14px; font-size:12.5px;"></div>

      <!-- PREVIEW PARSED ITEMS AREA -->
      <div id="qt-import-preview-area" class="hidden" style="margin-top:20px;">
        
        <!-- Customer & Stats Header Strip -->
        <div style="background:linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); border:1.5px solid #cbd5e1; border-radius:12px; padding:14px 18px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
            <div style="font-size:18px;">👤</div>
            <div>
              <div style="font-size:11px; color:#64748b; font-weight:700;">العميل المكتشف بالشيت:</div>
              <input type="text" id="qt-import-detected-customer" class="input" style="font-weight:800; font-size:13px; height:32px; width:260px; color:#1e3a8a; border-color:#93c5fd; background:#fff;" placeholder="اسم العميل..." />
            </div>
            <div id="qt-import-customer-status" style="font-size:11px; color:#059669; font-weight:700;"></div>
          </div>

          <!-- Quick Stats Pills -->
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="badge" style="background:#eff6ff; border:1.5px solid #bfdbfe; color:#1e40af; font-size:12px; padding:6px 12px; font-weight:700;" id="qt-stat-total-items">📦 0 صنف</span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
          <h4 style="color:var(--text-0); font-size:13.5px; font-weight:800; margin:0;">
            📋 تفاصيل الأصناف المستخرجة والأسعار وهوامش الربح:
          </h4>
          <div style="display:flex; align-items:center; gap:10px;">
            <button type="button" class="btn btn-sm btn-ghost" onclick="toggleQuotationExtractedDirection()" style="font-size:11.5px; font-weight:700; border:1px solid #cbd5e1; background:#fff; color:#1e40af;">🔀 عكس / تعديل اتجاه النص العربي</button>
            <div style="font-size:12px; color:var(--text-2);">
              * يمكنك تعديل أي تكلفة أو نسبة ربح أو سعر بيع مباشرة في الجدول
            </div>
          </div>
        </div>

        <div class="table-container" style="max-height:420px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
          <table class="data-dense" style="width:100%; margin:0; font-size:11.5px;">
            <thead style="position:sticky; top:0; z-index:10; background:var(--bg-2); border-bottom:2px solid var(--border-soft);">
              <tr>
                <th style="width:32px; text-align:center;"><input type="checkbox" id="qt-import-select-all" checked onchange="toggleAllImportedItems(this.checked)" /></th>
                <th style="width:30px; text-align:center;">#</th>
                <th style="min-width:210px;">اسم الصنف بالشيت</th>
                <th style="width:85px; text-align:center;">رقم/كود الصنف</th>
                <th style="width:70px; text-align:center;">الوحدة</th>
                <th style="width:65px; text-align:center;">الكمية</th>
                <th style="width:85px; text-align:left; color:#166534;" id="qt-th-cost">سعر التكلفة</th>
                <th style="width:65px; text-align:center; color:#1e40af;" id="qt-th-margin">الربح %</th>
                <th style="width:90px; text-align:left; color:#1e3a8a;" id="qt-th-price">سعر البيع (غير شامل)</th>
                <th style="width:85px; text-align:left; color:#0284c7;">شامل 15%</th>
                <th style="width:50px; text-align:center;">خصم%</th>
                <th style="width:105px; text-align:left;">الإجمالي شامل</th>
              </tr>
            </thead>
            <tbody id="qt-import-parsed-tbody"></tbody>
          </table>
        </div>

        <!-- Totals Summary Bar -->
        <div style="display:flex; justify-content:flex-end; margin-top:14px;">
          <div style="background:var(--bg-2); border:1.5px solid var(--border-soft); border-radius:10px; padding:10px 18px; display:flex; gap:20px; align-items:center; flex-wrap:wrap;">
            <div id="qt-import-cost-summary-box">
              <span style="font-size:11.5px; color:#166534; font-weight:700;">إجمالي التكلفة:</span>
              <span class="mono font-bold" id="qt-import-tot-cost" style="margin-right:6px; font-size:12.5px; color:#166534;">0.00 ر.س</span>
            </div>
            <div id="qt-import-profit-summary-box">
              <span style="font-size:11.5px; color:#1e40af; font-weight:700;">صافي الربح المتوقع:</span>
              <span class="mono font-bold" id="qt-import-tot-profit" style="margin-right:6px; font-size:12.5px; color:#1e40af;">+0.00 ر.س (0%)</span>
            </div>
            <div style="border-right:1.5px solid var(--border-soft); padding-right:14px;">
              <span style="font-size:11.5px; color:var(--text-2);">البيع قبل الضريبة:</span>
              <span class="mono font-bold" id="qt-import-tot-gross" style="margin-right:6px; font-size:12.5px;">0.00 ر.س</span>
            </div>
            <div>
              <span style="font-size:11.5px; color:#b45309; font-weight:700;">ضريبة 15%:</span>
              <span class="mono font-bold" id="qt-import-tot-vat" style="color:#b45309; margin-right:6px; font-size:12.5px;">0.00 ر.س</span>
            </div>
            <div style="border-right:2px solid var(--border-soft); padding-right:16px;">
              <span style="font-size:12.5px; font-weight:800; color:var(--brand);">الإجمالي النهائي المطلوب:</span>
              <span class="mono font-bold text-brand" id="qt-import-tot-grand" style="margin-right:8px; font-size:15px;">0.00 ر.س</span>
            </div>
          </div>
        </div>

      </div>

    </div>

    <div class="modal-footer" style="padding:14px 24px; background:var(--bg-2); border-radius:0 0 12px 12px; display:flex; justify-content:space-between; align-items:center;">
      <button class="btn btn-ghost" onclick="closeModal('qt-import-modal')">إلغاء</button>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-secondary" id="qt-import-reupload-btn" onclick="resetQuotationImport()" style="display:none;">🔄 رفع ملف آخر</button>
        <button class="btn btn-primary" id="qt-import-submit-btn" disabled onclick="submitImportedQuotationItems()" style="background:linear-gradient(135deg,#047857,#059669); border-color:#047857; font-weight:800; padding:9px 24px; font-size:13.5px; box-shadow:0 3px 12px rgba(5,150,105,0.3);">
          ⚡ إنشاء وتعبئة عرض السعر الآن
        </button>
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- QUICK ADD PRODUCT MODAL                                 -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="modal-overlay" id="qt-quick-product-modal" style="z-index: 1050;">
  <div class="modal modal-md" style="border-radius:12px; max-width:560px;">
    <div class="modal-header" style="background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color:#fff; border-radius:12px 12px 0 0; padding:14px 20px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:18px;">✨</span>
        <h3 class="modal-title" style="color:#fff; font-size:15px; font-weight:700; margin:0;" id="qt-qp-title">إضافة صنف جديد سريع إلى الكتالوج</h3>
      </div>
      <button class="modal-close" style="color:#fff; opacity:0.8;" onclick="closeModal('qt-quick-product-modal')">×</button>
    </div>
    <div class="modal-body" style="padding:20px;">
      <div style="font-size:12px; color:var(--text-2); margin-bottom:14px; line-height:1.5;">
        سيتم حفظ الصنف فوراً في قاعدة بيانات الأصناف (الكتالوج) ليكون متاحاً في المخزن وفواتير الشراء والبيع، مع إدراجه مباشرة في هذا العرض.
      </div>

      <div class="form-group mb-12">
        <label style="font-size:12px; font-weight:600;">اسم الصنف بالعربي *</label>
        <input type="text" id="qt-qp-name" class="input" placeholder="مثال: شوكولاتة كيندر بوينو 43 جم" required />
      </div>

      <div class="grid-2 gap-12 mb-12">
        <div class="form-group mb-0">
          <label style="font-size:12px; font-weight:600;">رمز الصنف (SKU / الكود)</label>
          <input type="text" id="qt-qp-sku" class="input mono" placeholder="يولد تلقائياً" />
        </div>
        <div class="form-group mb-0">
          <label style="font-size:12px; font-weight:600;">الوحدة الأساسية</label>
          <select id="qt-qp-unit" class="input">
            <option value="كرتون" selected>كرتون (Carton)</option>
            <option value="حبة">حبة (Piece)</option>
            <option value="صندوق">صندوق (Box)</option>
            <option value="كيس">كيس (Bag)</option>
            <option value="شد">شد (Pack)</option>
            <option value="شوال">شوال (Sack)</option>
            <option value="علبة">علبة (Can)</option>
            <option value="كيلو">كيلو (Kilogram)</option>
            <option value="درزن">درزن (Dozen)</option>
            <option value="باليت">باليت (Pallet)</option>
          </select>
        </div>
      </div>

      <div class="form-group mb-12">
        <label style="font-size:12px; font-weight:600;">الفئة / التصنيف</label>
        <select id="qt-qp-category" class="input">
          <option value="">(بدون تصنيف)</option>
        </select>
      </div>

      <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:8px; padding:12px; margin-bottom:14px;">
        <div style="font-size:11.5px; font-weight:700; color:var(--text-1); margin-bottom:10px;">التسعير وهوامش الربح:</div>
        <div class="grid-3 gap-10">
          <div class="form-group mb-0">
            <label style="font-size:11px;">سعر التكلفة التقديري</label>
            <input type="number" id="qt-qp-cost" class="input mono" min="0" step="0.01" value="0"
              oninput="calcQuickProductPrice('cost')" placeholder="0.00" />
          </div>
          <div class="form-group mb-0">
            <label style="font-size:11px;">هامش الربح %</label>
            <input type="number" id="qt-qp-margin" class="input mono" min="0" step="0.5" value="10"
              oninput="calcQuickProductPrice('margin')" placeholder="10" />
          </div>
          <div class="form-group mb-0">
            <label style="font-size:11px;">سعر البيع (بدون ضريبة)</label>
            <input type="number" id="qt-qp-price" class="input mono" min="0" step="0.01" value="0"
              oninput="calcQuickProductPrice('price')" placeholder="0.00" />
          </div>
        </div>
        <div id="qt-qp-vat-hint" style="font-size:11px; color:#059669; font-weight:700; margin-top:8px; text-align:left; direction:ltr;">
          السعر شامل الضريبة (15%): 0.00 ر.س
        </div>
      </div>

      <div id="qt-qp-error" class="alert bad hidden" style="font-size:12px; margin-top:8px;"></div>
    </div>
    <div class="modal-footer" style="padding:12px 20px; background:var(--bg-2); border-radius:0 0 12px 12px; gap:8px;">
      <button type="button" class="btn btn-ghost" onclick="closeModal('qt-quick-product-modal')">إلغاء</button>
      <button type="button" class="btn btn-primary" id="qt-qp-save-btn" onclick="saveQuickProduct()" style="background:#059669; border-color:#059669; font-weight:700;">
        ✨ حفظ وإدراج في عرض السعر
      </button>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- PRICE HISTORY MODAL (سجل وتاريخ أسعار البند)             -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="modal-overlay" id="qt-price-history-modal" style="z-index: 1060;">
  <div class="modal modal-lg" style="border-radius:14px; max-width:860px; box-shadow:0 20px 40px rgba(0,0,0,0.2);">
    <div class="modal-header" style="background:linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); color:#fff; border-radius:14px 14px 0 0; padding:16px 22px;">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:22px;">🕒</span>
        <div>
          <h3 class="modal-title" style="color:#fff; font-size:16px; font-weight:700; margin:0;" id="qt-ph-title">سجل أسعار الصنف في عروض الأسعار السابقة</h3>
          <div style="font-size:11.5px; color:#c7d2fe; margin-top:3px;" id="qt-ph-subtitle">...</div>
        </div>
      </div>
      <button class="modal-close" style="color:#fff; opacity:0.8; font-size:20px;" onclick="closeModal('qt-price-history-modal')">×</button>
    </div>
    <div class="modal-body" style="padding:20px; max-height:72vh; overflow-y:auto;">
      <!-- Stats KPIs Cards -->
      <div class="grid-4 gap-10 mb-16" id="qt-ph-stats">
        <!-- Filled dynamically -->
      </div>

      <!-- Filter tabs: All vs Current Customer -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
        <div class="tab-group" style="margin-bottom:0; display:flex; gap:6px;">
          <button type="button" class="btn btn-sm btn-secondary active" id="qt-ph-tab-all" onclick="switchPriceHistoryTab('all')" style="font-weight:700; border-radius:6px;">📋 جميع العملاء</button>
          <button type="button" class="btn btn-sm btn-secondary" id="qt-ph-tab-cust" onclick="switchPriceHistoryTab('cust')" style="font-weight:700; border-radius:6px;">👤 العميل المحدد فقط</button>
        </div>
        <div style="font-size:12px; color:var(--text-2); font-weight:600;" id="qt-ph-count-hint"></div>
      </div>

      <!-- Table of previous quotation entries -->
      <div style="border:1px solid var(--border-soft); border-radius:10px; overflow:hidden; background:var(--bg-1);">
        <table class="table" style="width:100%; margin:0; font-size:12px;">
          <thead style="background:var(--bg-2); border-bottom:1px solid var(--border-soft);">
            <tr>
              <th style="padding:10px 12px; text-align:right;">رقم العرض</th>
              <th style="padding:10px 12px; text-align:right;">التاريخ</th>
              <th style="padding:10px 12px; text-align:right;">العميل</th>
              <th style="padding:10px 12px; text-align:center;">الوحدة والكمية</th>
              <th style="padding:10px 12px; text-align:center;">التكلفة / الهامش</th>
              <th style="padding:10px 12px; text-align:right;">السعر (بدون ضريبة)</th>
              <th style="padding:10px 12px; text-align:right;">شامل 15%</th>
              <th style="padding:10px 12px; text-align:center;">الإجراء</th>
            </tr>
          </thead>
          <tbody id="qt-ph-tbody">
            <!-- Rows filled dynamically -->
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer" style="padding:14px 22px; background:var(--bg-2); border-radius:0 0 14px 14px; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:12px; color:var(--text-2);">
        💡 اضغط على <strong>"استخدام هذا السعر 🎯"</strong> لنقل بيانات السعر والتكلفة مباشرة لسطر العرض الحالي.
      </div>
      <button type="button" class="btn btn-ghost" onclick="closeModal('qt-price-history-modal')">إغلاق</button>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- SUPPLIER PRICE BANK & BATCH IMPORTER MODAL              -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="modal-overlay" id="qt-supplier-price-bank-modal" style="z-index: 1070;">
  <div class="modal modal-xl" style="max-height:94vh; display:flex; flex-direction:column; width:96%; max-width:1200px; border-radius:14px; box-shadow:0 25px 50px rgba(0,0,0,0.25);">
    <div class="modal-header" style="background:linear-gradient(135deg, #0b132b 0%, #1c2541 50%, #3a506b 100%); color:#fff; padding:16px 24px; border-radius:14px 14px 0 0;">
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-size:26px;">🏢</span>
        <div>
          <h3 class="modal-title" style="color:#fff; font-size:16.5px; font-weight:800; margin:0;">
            بنك أسعار وقوائم الموردين الذكي (استيراد وإدارة عروض أسعار الموردين)
          </h3>
          <div style="font-size:11.5px; color:#cbd5e1; margin-top:3px;">
            استيراد عروض أسعار وقوائم الموردين (PDF / Excel) وبناء قاعدة بيانات تكاليف الشراء للربط الفوري في عروض الأسعار
          </div>
        </div>
      </div>
      <button class="modal-close" style="color:#fff; opacity:0.8; font-size:22px;" onclick="closeModal('qt-supplier-price-bank-modal')">×</button>
    </div>

    <!-- Navigation Tabs -->
    <div style="padding:10px 24px; background:var(--bg-2); border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div class="tab-group" style="margin-bottom:0; display:flex; gap:6px;">
        <button type="button" id="tab-btn-sup-import" class="btn btn-sm btn-primary active" onclick="switchSupplierBankTab('import')" style="font-weight:700; border-radius:6px;">
          📥 استيراد ملفات عروض الموردين (PDF / Excel / نسخ)
        </button>
        <button type="button" id="tab-btn-sup-search" class="btn btn-sm btn-secondary" onclick="switchSupplierBankTab('search')" style="font-weight:700; border-radius:6px;">
          🔍 استعراض وبحث في أسعار الموردين المسجلة
        </button>
        <button type="button" id="tab-btn-sup-lists" class="btn btn-sm btn-secondary" onclick="switchSupplierBankTab('lists')" style="font-weight:700; border-radius:6px;">
          📋 قوائم وملفات الموردين المحفوظة (<span id="qt-sup-lists-count">0</span>)
        </button>
      </div>
      <div id="qt-sup-bank-stats-badge" style="font-size:12px; font-weight:700; color:#059669; background:rgba(16,185,129,0.1); padding:4px 10px; border-radius:6px;">
        📦 إجمالي الأصناف المسجلة: <span id="qt-sup-total-items-badge">0</span> صنف
      </div>
    </div>

    <div class="modal-body" style="overflow-y:auto; flex:1; padding:20px;">
      
      <!-- TAB 1: IMPORT SUPPLIER QUOTATION (PDF / EXCEL / PASTE) -->
      <div id="sup-bank-pane-import">
        
        <!-- Supplier & File Meta Configuration Box -->
        <div style="background:linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border:1.5px solid #cbd5e1; border-radius:12px; padding:16px 20px; margin-bottom:16px;">
          <div class="grid-3 gap-14 mb-12">
            
            <!-- Supplier Selector or New Name -->
            <div class="form-group mb-0">
              <label style="font-size:12px; font-weight:700; color:#1e293b; display:flex; justify-content:space-between;">
                <span>المورد صاحب العرض / القائمة *</span>
                <span style="font-size:10.5px; color:#2563eb; font-weight:600;">(اختر أو اكتب جديد)</span>
              </label>
              <div style="display:flex; gap:6px;">
                <input type="text" id="qt-sup-import-name" class="input" style="font-weight:700; font-size:13px; border-color:#94a3b8; background:#fff;"
                  placeholder="مثال: شركة البركة للمواد الغذائية..." list="qt-sup-import-datalist" />
                <datalist id="qt-sup-import-datalist"></datalist>
              </div>
            </div>

            <!-- Quote Date -->
            <div class="form-group mb-0">
              <label style="font-size:12px; font-weight:700; color:#1e293b;">تاريخ عرض السعر / القائمة *</label>
              <input type="date" id="qt-sup-import-date" class="input font-bold" style="background:#fff; border-color:#94a3b8;" />
            </div>

            <!-- Tax Mode of Supplier File -->
            <div class="form-group mb-0">
              <label style="font-size:12px; font-weight:700; color:#1e293b;">طبيعة أسعار المورد بالملف:</label>
              <select id="qt-sup-import-tax-mode" class="input font-bold" style="background:#fff; border-color:#94a3b8;" onchange="reapplySupplierTaxMode()">
                <option value="exclusive" selected>💵 أسعار صافية غير شاملة الضريبة (افتراضي)</option>
                <option value="inclusive">🏷️ أسعار شاملة ضريبة 15% (استخراج الصافي تلقائياً)</option>
              </select>
            </div>
          </div>

          <!-- Method Tabs (Upload File vs Direct Paste) -->
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #cbd5e1; padding-top:12px; margin-top:10px; flex-wrap:wrap; gap:10px;">
            <div style="display:flex; gap:8px;">
              <button type="button" id="tab-btn-sup-subfile" class="btn btn-sm btn-primary" onclick="switchSupplierSubTab('file')" style="border-radius:6px; font-size:11.5px; font-weight:700;">
                📂 رفع ملف (Excel / PDF)
              </button>
              <button type="button" id="tab-btn-sup-subpaste" class="btn btn-sm btn-secondary" onclick="switchSupplierSubTab('paste')" style="border-radius:6px; font-size:11.5px; font-weight:700;">
                📋 نسخ ولصق مباشر (Ctrl+V)
              </button>
            </div>
            <div style="font-size:11.5px; color:#64748b;">
              💡 يدعم قراءة كافة ملفات الإكسيل (.xlsx / .xls / .csv) وملفات الـ PDF مع استخراج الأسماء والوحدات والأسعار بدقة 100%.
            </div>
          </div>
        </div>

        <!-- File Drag & Drop Area -->
        <div id="sup-subpane-file">
          <div id="qt-sup-dropzone" style="border:2.5px dashed #94a3b8; border-radius:14px; padding:32px 20px; text-align:center; cursor:pointer; background:var(--bg-2); transition:all 0.2s;"
            onclick="document.getElementById('qt-sup-file-input').click()"
            ondragover="event.preventDefault(); this.style.borderColor='var(--brand)'; this.style.background='rgba(37,99,235,0.05)';"
            ondragleave="this.style.borderColor='#94a3b8'; this.style.background='var(--bg-2)';"
            ondrop="handleSupplierFileDrop(event)">
            <div style="font-size:40px; margin-bottom:6px;">🏢 📊 📄</div>
            <div style="font-weight:800; color:var(--text-0); font-size:15px; margin-bottom:4px;">
              اسحب وأفلت ملف عرض سعر المورد (Excel أو PDF) هنا
            </div>
            <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">أو اضغط لاختيار الملف من جهازك</div>
            <button type="button" class="btn btn-secondary btn-sm" style="pointer-events:none; font-weight:700;">
              📁 تصفح واختيار الملف
            </button>
          </div>
          <input type="file" id="qt-sup-file-input" accept=".xlsx,.xls,.csv,.pdf" style="display:none;" onchange="handleSupplierFileInput(event)" />
        </div>

        <!-- Direct Paste Area -->
        <div id="sup-subpane-paste" class="hidden">
          <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:16px;">
            <div style="font-size:12.5px; font-weight:700; color:var(--text-1); margin-bottom:6px;">
              📋 الصق جدول أسعار المورد هنا (حدد البيانات في Excel واضغط Ctrl+C ثم اضغط Ctrl+V هنا):
            </div>
            <textarea id="qt-sup-paste-area" class="input mono" rows="5" style="width:100%; font-size:11.5px; resize:vertical;"
              placeholder="اسم الصنف	الوحدة	سعر التكلفة (قبل الضريبة)
زيت شيف 1.5 لتر	كرتون	95.00
أرز بسمتي الشعلان 10 ك	شوال	84.50
..."></textarea>
            <div style="display:flex; justify-content:flex-end; margin-top:10px;">
              <button type="button" class="btn btn-primary" onclick="handlePastedSupplierText()" style="font-weight:700; display:flex; align-items:center; gap:6px;">
                <span>⚡</span> تحليل وقراءة البيانات المنسوخة
              </button>
            </div>
          </div>
        </div>

        <!-- Loading Spinner -->
        <div id="qt-sup-import-loading" class="hidden" style="text-align:center; padding:32px;">
          <div class="loading-spinner" style="margin:0 auto 12px auto; width:36px; height:36px;"></div>
          <div style="font-size:13.5px; font-weight:700; color:var(--brand);" id="qt-sup-import-loading-text">جارٍ تحليل ملف المورد واستخراج بنود الأسعار...</div>
        </div>

        <!-- Error Alert -->
        <div id="qt-sup-import-error" class="alert bad hidden" style="margin-top:14px; font-size:12.5px;"></div>

        <!-- PREVIEW PARSED SUPPLIER ITEMS AREA -->
        <div id="qt-sup-preview-area" class="hidden" style="margin-top:18px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <h4 style="color:var(--text-0); font-size:14px; font-weight:800; margin:0;">
                📋 مراجعة الأصناف والأسعار المستخرجة من عرض المورد:
              </h4>
              <span class="badge" style="background:#eff6ff; border:1px solid #bfdbfe; color:#1e40af; font-weight:700; font-size:11.5px;" id="qt-sup-stat-count">0 صنف</span>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <button type="button" class="btn btn-sm btn-ghost" onclick="toggleSupplierExtractedDirection()" style="font-size:11.5px; font-weight:700; border:1px solid #cbd5e1; background:#fff; color:#1e40af;">🔀 عكس / تعديل اتجاه النص العربي</button>
              <button type="button" class="btn btn-sm btn-ghost text-bad" onclick="clearExtractedSupplierItems()" style="font-size:11px; font-weight:700;">🗑️ مسح الكل</button>
              <button type="button" class="btn btn-sm btn-secondary" onclick="addManualSupplierItemRow()" style="font-size:11px; font-weight:700;">➕ إضافة سطر يدوياً</button>
            </div>
          </div>

          <div class="table-container" style="max-height:380px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:10px;">
            <table class="data-dense" style="width:100%; margin:0; font-size:12px;">
              <thead style="position:sticky; top:0; z-index:10; background:var(--bg-2); border-bottom:2px solid var(--border-soft);">
                <tr>
                  <th style="width:32px; text-align:center;"><input type="checkbox" id="qt-sup-select-all" checked onchange="toggleAllSupplierImportItems(this.checked)" /></th>
                  <th style="width:30px; text-align:center;">#</th>
                  <th style="min-width:260px;">اسم الصنف عند المورد *</th>
                  <th style="width:90px; text-align:center;">الكود / SKU</th>
                  <th style="width:85px; text-align:center;">الوحدة</th>
                  <th style="width:110px; text-align:left; color:#166534;">السعر قبل الضريبة (ر.س) *</th>
                  <th style="width:100px; text-align:left; color:#0284c7;">شامل 15%</th>
                  <th style="width:120px;">ملاحظات</th>
                  <th style="width:36px; text-align:center;"></th>
                </tr>
              </thead>
              <tbody id="qt-sup-parsed-tbody"></tbody>
            </table>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; background:var(--bg-2); border:1px solid var(--border-soft); border-radius:10px; padding:12px 18px; flex-wrap:wrap; gap:10px;">
            <div style="font-size:12px; color:var(--text-2);">
              💡 يمكنك تعديل أي اسم أو وحدة أو سعر مباشرة في الجدول قبل الحفظ.
            </div>
            <div style="display:flex; gap:8px;">
              <button type="button" class="btn btn-ghost" onclick="resetSupplierImport()">🔄 اختيار ملف آخر</button>
              <button type="button" class="btn btn-primary" id="qt-sup-save-bank-btn" onclick="saveExtractedSupplierPricesToBank()" style="background:linear-gradient(135deg,#059669,#047857); border-color:#047857; font-weight:800; padding:8px 22px; font-size:13px; box-shadow:0 3px 10px rgba(5,150,105,0.25);">
                ✨ حفظ وتثبيت أسعار هذا المورد في قاعدة البيانات
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- TAB 2: SEARCH & BROWSE ALL SUPPLIER PRICES -->
      <div id="sup-bank-pane-search" class="hidden">
        <div style="display:flex; gap:12px; margin-bottom:14px; flex-wrap:wrap; align-items:flex-end;">
          <div class="form-group mb-0" style="flex:1; min-width:280px;">
            <label style="font-size:11.5px; font-weight:700;">بحث سريع باسم الصنف لمعرفة أسعار الموردين:</label>
            <input type="text" id="qt-sup-search-input" class="input" style="font-size:12.5px; height:36px; font-weight:700;"
              placeholder="🔍 اكتب اسم الصنف للبحث والمقارنة الفورية..." oninput="renderSupplierBankSearchTable()" />
          </div>
          <div class="form-group mb-0" style="width:200px;">
            <label style="font-size:11.5px; font-weight:700;">تصفية بالمورد:</label>
            <select id="qt-sup-filter-supplier" class="input" style="height:36px; font-size:12px;" onchange="renderSupplierBankSearchTable()">
              <option value="">جميع الموردين</option>
            </select>
          </div>
        </div>

        <div class="table-container" style="max-height:480px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:10px;">
          <table class="data-dense" style="width:100%; margin:0; font-size:12px;">
            <thead style="position:sticky; top:0; z-index:10; background:var(--bg-2); border-bottom:2px solid var(--border-soft);">
              <tr>
                <th style="min-width:220px;">اسم الصنف</th>
                <th style="min-width:180px;">المورد صاحب العرض</th>
                <th style="width:95px; text-align:center;">تاريخ التسعير</th>
                <th style="width:75px; text-align:center;">الوحدة</th>
                <th style="width:110px; text-align:left; color:#166534;">السعر قبل الضريبة</th>
                <th style="width:95px; text-align:left; color:#0284c7;">شامل 15%</th>
                <th style="width:130px; text-align:center;">الإجراء</th>
              </tr>
            </thead>
            <tbody id="qt-sup-search-tbody">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 3: UPLOADED SUPPLIER PRICE LISTS MANAGEMENT -->
      <div id="sup-bank-pane-lists" class="hidden">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h4 style="margin:0; font-size:13.5px; font-weight:800;">📋 كافة عروض وقوائم أسعار الموردين المحفوظة بالبرنامج:</h4>
        </div>
        <div class="table-container" style="max-height:480px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:10px;">
          <table class="data-dense" style="width:100%; margin:0; font-size:12px;">
            <thead style="position:sticky; top:0; z-index:10; background:var(--bg-2); border-bottom:2px solid var(--border-soft);">
              <tr>
                <th style="width:30px; text-align:center;">#</th>
                <th style="min-width:200px;">المورد</th>
                <th style="min-width:180px;">اسم الملف المرفوع</th>
                <th style="width:100px; text-align:center;">تاريخ العرض</th>
                <th style="width:85px; text-align:center;">عدد الأصناف</th>
                <th style="width:110px; text-align:center;">تاريخ الحفظ</th>
                <th style="width:120px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="qt-sup-lists-tbody">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <div class="modal-footer" style="padding:14px 24px; background:var(--bg-2); border-radius:0 0 14px 14px; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:12px; color:var(--text-2);">
        💡 كافة الأسعار المسجلة في بنك الموردين تظهر تلقائياً أثناء كتابة أو اختيار أي صنف في عروض أسعار العملاء.
      </div>
      <button type="button" class="btn btn-ghost" onclick="closeModal('qt-supplier-price-bank-modal')">إغلاق</button>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- SUPPLIER COST COMPARISON MODAL FOR QUOTATION ITEM        -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="modal-overlay" id="qt-supplier-compare-modal" style="z-index: 1080;">
  <div class="modal modal-lg" style="border-radius:14px; max-width:880px; box-shadow:0 20px 45px rgba(0,0,0,0.22);">
    <div class="modal-header" style="background:linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%); color:#fff; border-radius:14px 14px 0 0; padding:16px 22px;">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:24px;">🏢</span>
        <div>
          <h3 class="modal-title" style="color:#fff; font-size:16px; font-weight:800; margin:0;" id="qt-sc-title">مقارنة عروض وأسعار الموردين للصنف</h3>
          <div style="font-size:11.5px; color:#a7f3d0; margin-top:3px;" id="qt-sc-subtitle">...</div>
        </div>
      </div>
      <button class="modal-close" style="color:#fff; opacity:0.8; font-size:20px;" onclick="closeModal('qt-supplier-compare-modal')">×</button>
    </div>
    <div class="modal-body" style="padding:20px; max-height:72vh; overflow-y:auto;">
      <!-- KPIs: Lowest Price, Highest Price, Average, Suppliers Count -->
      <div class="grid-4 gap-10 mb-16" id="qt-sc-stats">
        <!-- Filled dynamically -->
      </div>

      <!-- Table of Suppliers Offering This Product -->
      <div style="border:1px solid var(--border-soft); border-radius:10px; overflow:hidden; background:var(--bg-1);">
        <table class="table" style="width:100%; margin:0; font-size:12px;">
          <thead style="background:var(--bg-2); border-bottom:1px solid var(--border-soft);">
            <tr>
              <th style="padding:10px 12px; text-align:right;">اسم المورد</th>
              <th style="padding:10px 12px; text-align:center;">تاريخ التسعير</th>
              <th style="padding:10px 12px; text-align:center;">الوحدة</th>
              <th style="padding:10px 12px; text-align:left; color:#166534;">السعر قبل الضريبة (التكلفة)</th>
              <th style="padding:10px 12px; text-align:left; color:#0284c7;">شامل 15%</th>
              <th style="padding:10px 12px; text-align:center;">مصدر العرض / الملف</th>
              <th style="padding:10px 12px; text-align:center;">الإجراء</th>
            </tr>
          </thead>
          <tbody id="qt-sc-tbody">
            <!-- Filled dynamically -->
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer" style="padding:14px 22px; background:var(--bg-2); border-radius:0 0 14px 14px; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:12px; color:var(--text-2);">
        💡 اضغط على <strong>"اعتماد تكلفة هذا المورد 🎯"</strong> لنقل التكلفة مباشرة إلى سطر العرض وإعادة احتساب سعر البيع تلقائياً.
      </div>
      <button type="button" class="btn btn-ghost" onclick="closeModal('qt-supplier-compare-modal')">إغلاق</button>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- VIEW MODAL                                              -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="modal-overlay" id="qt-view-modal">
  <div class="modal modal-lg">
    <div class="modal-header">
      <h3 class="modal-title" id="qt-view-title">تفاصيل عرض السعر</h3>
      <button class="modal-close" onclick="closeModal('qt-view-modal')">×</button>
    </div>
    <div class="modal-body" id="qt-view-body" style="max-height:70vh;overflow-y:auto;"></div>
    <div class="modal-footer" style="gap:8px;flex-wrap:wrap;">
      <button class="btn btn-ghost" onclick="closeModal('qt-view-modal')">إغلاق</button>
      <button class="btn btn-secondary" onclick="printQuoteFromView()">🖨️ طباعة</button>
      <button class="btn" style="background:var(--good);color:#fff;" onclick="shareQuoteWhatsApp()">📱 واتساب</button>
      <button class="btn" style="background:#0284c7;color:#fff;font-weight:700;" onclick="window.openGoodsReceiptAckModal ? window.openGoodsReceiptAckModal({ quoteObj: window._currentViewQuote }) : import('./goods-receipt-ack.js?v=2.2').then(m => m.openGoodsReceiptAckModal({ quoteObj: window._currentViewQuote }))">📜 إقرار استلام وسند لأمر</button>
      <button class="btn btn-primary" id="qt-view-convert-btn" onclick="convertQuoteToInvoiceFromView()">🔄 تحويل لفاتورة</button>
    </div>
  </div>
</div>`}async function we(){try{[dt,S,Ht,Tt,qt,H,ct,pt]=await Promise.all([K(j.customers(),[st("name")]),K(j.products(),[st("name")]),K(j.salesReps(),[st("name")]),K(j.categories(),[st("name")]),K(j.suppliers(),[st("name")]).catch(()=>[]),K(j.supplierPriceLists(),[st("createdAt","desc")]).catch(()=>[]),K(j.warehouses(),[st("name")]).catch(()=>[]),K(j.stockByWarehouse()).catch(()=>[])]),Xt(),Jt();try{Ot=await K(j.priceLists())}catch{Ot=[]}const t=Ht.map(s=>`<option value="${s.id}" data-name="${s.name}">${s.name}</option>`).join(""),n=document.getElementById("qt-rep");n&&(n.innerHTML='<option value="">بدون مندوب</option>'+t);const e=document.getElementById("qt-rep-filter");e&&(e.innerHTML='<option value="">الكل</option>'+t);const o=document.getElementById("qt-product-category-filter");o&&(o.innerHTML='<option value="">كل الفئات</option>'+Tt.map(s=>`<option value="${s.id}">${s.name}</option>`).join("")),zt()}catch(t){console.error("loadDependencies:",t)}}async function oe(){const t=document.getElementById("qt-tbody");if(t)try{let n;try{n=await Nt(jt(j.quotations(),st("createdAt","desc"),Vt(500)))}catch{n=await Nt(jt(j.quotations(),Vt(500)))}if((!n||n.empty)&&et&&ot)try{n=await Nt(be(et,`companies/${ot}/quotations`))}catch{}C=n&&n.docs?n.docs.map(e=>({id:e.id,...e.data()})):[],C.sort((e,o)=>{const s=e.createdAt?.seconds||(e.date?new Date(e.date).getTime()/1e3:0);return(o.createdAt?.seconds||(o.date?new Date(o.date).getTime()/1e3:0))-s}),St(C),Qe(),ne()}catch(n){console.error("loadQuotesList error:",n),t&&(t.innerHTML=`<tr><td colspan="9" class="text-bad" style="padding:16px;">خطأ: ${n.message}</td></tr>`)}}function ne(){const t=document.getElementById("qt-quotes-count-badge");t&&(t.textContent=`${C.length} عرض`)}function St(t){const n=document.getElementById("qt-tbody");if(!n)return;const e=t.length,o=t.filter(r=>r.status==="accepted").length,s=t.filter(r=>r.status==="draft"||r.status==="sent").length,i=t.filter(r=>r.status==="converted").length,a=e>0?Math.round(i/e*100):0,c=(r,u)=>{const g=document.getElementById(r);g&&(g.textContent=u)};if(c("kpi-qt-total",e),c("kpi-qt-accepted",o),c("kpi-qt-pending",s),c("kpi-qt-conv",a+"%"),c("qt-count-label",e+" عرض"),ne(),!t.length){n.innerHTML='<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد عروض أسعار</td></tr>';return}n.innerHTML=t.map(r=>{const u=r.status!=="converted"&&r.status!=="accepted"&&r.expiryDate&&r.expiryDate<U(),g=r.status!=="converted";let p="";const m=r.markupPct!==void 0&&r.markupPct!==null?parseFloat(r.markupPct):r.totalCost>0&&r.subtotal?Math.round((r.subtotal-r.totalCost)/r.totalCost*100*100)/100:r.marginPct!==void 0&&r.marginPct!==null?parseFloat(r.marginPct):null;if(m!==null&&!isNaN(m)){const x=m>=0;p=`<div style="font-size:10px;font-weight:700;color:${x?"#059669":"#dc2626"};margin-top:2px;" title="نسبة هامش الربح الإجمالي على التكلفة">هامش: ${x?"+":""}${m.toFixed(1)}%</div>`}return`
      <tr class="qt-row" data-id="${r.id}" style="cursor:pointer;">
        <td class="mono text-indigo font-bold">${r.quoteNumber||"—"}</td>
        <td class="dim">${V(r.date)}</td>
        <td><strong>${r.customerName||"—"}</strong></td>
        <td class="dim">${r.repName||"—"}</td>
        <td style="text-align:center;" class="mono">${(r.items||[]).length}</td>
        <td class="mono font-bold">
          ${w(r.grandTotal||0)}
          ${p}
        </td>
        <td>${Pt(u?"expired":r.status)}</td>
        <td class="${u?"text-bad":""}">${V(r.expiryDate)}</td>
        <td class="qt-actions-cell">
          <div class="row-actions" style="display:flex;gap:2px;flex-wrap:nowrap;">
            <button class="btn btn-icon sm btn-ghost qt-act" data-action="print" data-id="${r.id}" title="طباعة">🖨️</button>
            <button class="btn btn-icon sm btn-ghost qt-act" data-action="gra" data-id="${r.id}" style="color:#0284c7;" title="إقرار استلام بضاعة وسند لأمر">📜</button>
            ${g?'<button class="btn btn-icon sm btn-ghost qt-act" data-action="convert" data-id="'+r.id+'" style="color:var(--brand);" title="تحويل لفاتورة">🔄</button>':""}
            <button class="btn btn-icon sm btn-ghost qt-act" data-action="dup"  data-id="${r.id}" title="تكرار">📋</button>
            <button class="btn btn-icon sm btn-ghost qt-act" data-action="edit" data-id="${r.id}" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost qt-act text-bad" data-action="del" data-id="${r.id}" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>`}).join(""),n._qtListenerAttached||(n._qtListenerAttached=!0,n.addEventListener("click",function(u){const g=u.target.closest(".qt-act");if(g){u.stopPropagation();const m=g.dataset.id,x=g.dataset.action;if(x==="edit"){const f=C.find(d=>d.id===m);f&&openQuoteForm(f)}else if(x==="del"){const f=C.find(d=>d.id===m);deleteQuote(m,f&&f.quoteNumber||"")}else if(x==="dup")C.find(d=>d.id===m)&&duplicateQuote(m);else if(x==="convert")convertQuoteToInvoice(m);else if(x==="print")printQuote(m);else if(x==="gra"){const f=C.find(d=>d.id===m);f&&(typeof window.openGoodsReceiptAckModal=="function"?window.openGoodsReceiptAckModal({quoteObj:f}):mt(()=>import("./goods-receipt-ack.js_v_2-bBvN1RRa.js"),__vite__mapDeps([0,1,2])).then(d=>d.openGoodsReceiptAckModal({quoteObj:f})))}return}const p=u.target.closest(".qt-row");p&&!u.target.closest(".qt-actions-cell")&&viewQuote(p.dataset.id,u)}))}window.filterQuotes=()=>{const t=(document.getElementById("qt-search")?.value||"").trim().toLowerCase(),n=document.getElementById("qt-status-filter")?.value||"",e=document.getElementById("qt-from")?.value||"",o=document.getElementById("qt-to")?.value||"",s=document.getElementById("qt-rep-filter")?.value||"",i=C.filter(a=>{if(t&&!((a.quoteNumber||"").toLowerCase().includes(t)||(a.customerName||"").toLowerCase().includes(t))||n&&a.status!==n)return!1;const c=a.date||"";return!(e&&c<e||o&&c>o||s&&a.repId!==s)});St(i)};window.openQuoteForm=async(t=null)=>{rt=t?.id||null;let n=t?.items;if(!n)try{const u=sessionStorage.getItem("idham_prefilled_quote_lines");if(u){sessionStorage.removeItem("idham_prefilled_quote_lines");const g=JSON.parse(u);Array.isArray(g)&&g.length>0&&(n=g)}}catch(u){console.warn("Error reading prefilled quote items:",u)}const e=t?.priceList||"standard";v=n?JSON.parse(JSON.stringify(n)).map(u=>{const g=typeof S<"u"&&Array.isArray(S)?S.find(E=>E.id===u.productId):null,p=q(u.unitPrice!==void 0?u.unitPrice:u.price!==void 0?u.price:g?.price,0);let m=q(u.cost||u.unitCost||u.costPrice||u.purchasePrice||u.averageCost,0),x=q(u.lastPurchasePrice,0),f=u.margin!==void 0&&u.margin!==null&&u.margin!==""?q(u.margin,null):null;if(m<=0){const E=ee({...u,unitPrice:p,margin:f},e);m=E.cost||0,x=E.lastPurchasePrice||(m>0?m:0),(f===null||isNaN(f))&&(f=E.margin||0)}x<=0&&m>0&&(x=m),f===null||isNaN(f)?f=m>0&&p>0?Math.round((p/m-1)*100*100)/100:0:f=Math.round(f*100)/100;const d=q(u.qty,1),l=q(u.discount,0),h=d*p,y=h*l/100,b=Math.max(0,h-y),k=Math.round(b*.15*100)/100;return{id:u.id||u.productId||"custom_"+Math.random().toString(36).slice(2,7),productId:u.productId||"",productName:u.productName||g?.name||"",unit:u.unit||g?.unit||"Carton",qty:d,unitPrice:Math.round(p*100)/100,price:Math.round(p*100)/100,cost:Math.round(m*100)/100,lastPurchasePrice:Math.round(x*100)/100,margin:f,discount:l,total:Math.round(b*100)/100,vat:k,grandTotal:Math.round((b+k)*100)/100,isCustom:!!u.isCustom||!g||String(u.productId||"").startsWith("adhoc_"),taxCategory:u.taxCategory||g?.taxCategory||"S"}}):[];const o=(u,g)=>{const p=document.getElementById(u);p&&(p.value=g||"")},s=U(),i=document.getElementById("qt-form-title");i&&(i.textContent=t?.id?`تعديل العرض: ${t.quoteNumber}`:"عرض سعر جديد"),o("qt-number",t?.quoteNumber||"جارٍ التوليد…"),o("qt-date",t?.date||s),o("qt-expiry",t?.expiryDate||te(s,30)),o("qt-customer-search",t?.customerName||""),o("qt-customer-id",t?.customerId||""),o("qt-customer-name-val",t?.customerName||""),o("qt-delivery-address",t?.deliveryAddress||""),o("qt-rep",t?.repId||""),o("qt-pricelist",t?.priceList||"standard"),It(),o("qt-payment-terms",t?.paymentTerms||"cash"),o("qt-status",t?.status||"draft"),o("qt-notes",t?.notes||""),o("qt-terms",t?.terms||"صلاحية العرض: 30 يوماً من تاريخه. الأسعار شاملة ضريبة القيمة المضافة 15%. يُعدّ هذا العرض ملزماً عند قبوله."),o("qt-extra-disc-type",t?.extraDiscountType||"none"),o("qt-extra-disc-val",t?.extraDiscountVal||"0");const a=document.getElementById("qt-expiry-warn");a&&(a.style.display="none");const c=document.getElementById("qt-form-error");c&&c.classList.add("hidden");const r=document.getElementById("qt-form-print-btn");r&&(r.style.display="inline-flex"),Jt(t?.warehouseId||""),Q(),openModal("qt-form-modal"),ye().then(()=>Q()),t?.id||Kt("QT").then(u=>{const g=document.getElementById("qt-number");g&&(g.value=u)}).catch(()=>{})};window.checkExpiryWarn=()=>{const t=document.getElementById("qt-expiry")?.value,n=document.getElementById("qt-expiry-warn");n&&(n.style.display=t&&t<U()?"block":"none")};window.editQuote=t=>{const n=C.find(e=>e.id===t);n&&openQuoteForm(n)};window.duplicateQuote=t=>{const n=C.find(o=>o.id===t);if(!n)return;const e=JSON.parse(JSON.stringify(n));delete e.id,e.quoteNumber=null,e.status="draft",e.date=U(),e.expiryDate=te(U(),30),openQuoteForm(e)};window.onPricelistChange=()=>{const t=document.getElementById("qt-pricelist")?.value||"standard";It(),v=v.map(n=>{const e=S.find(a=>a.id===n.productId);if(!e)return n;const o=e.averageCost||e.costPrice||e.lastPurchasePrice||e.avgCostPrice||e.purchasePrice||0;let s=0;if(t==="tier1"){const a=lt(e);s=o>0?o*(1+a/100):0}else t==="wholesale"?s=o>0?o*(1+F.wholesaleMargin/100):0:t==="distributor"?s=o>0?o*(1+F.distributorMargin/100):0:s=o>0?o*(1+F.retailMargin/100):0;if(s<=0){const a=e.salePrice||e.priceRetail||e.price||0;s=Math.round(a/1.15*100)/100}else s=Math.round(s*100)/100;const i=o>0?Math.round((s/o-1)*100*100)/100:0;return{...n,cost:o,unitPrice:s,margin:i}}),Q()};window.onQtRowKey=(t,n,e)=>{if(t.key==="Enter"){t.preventDefault();const o=document.getElementById("qt-product-search");o&&(o.focus(),o.select())}else if(t.key==="ArrowDown"){const o=document.getElementById(`qt-row-${e}-${n+1}`);o&&(t.preventDefault(),o.focus(),o.select())}else if(t.key==="ArrowUp"){const o=document.getElementById(`qt-row-${e}-${n-1}`);o&&(t.preventDefault(),o.focus(),o.select())}};window.toggleQtExtraDetails=()=>{const t=document.getElementById("qt-extra-details-drawer");if(!t)return;const n=t.style.display==="none";t.style.display=n?"flex":"none";const e=document.getElementById("qt-extra-details-btn");e&&(e.style.background=n?"#2563eb":"",e.style.color=n?"#fff":"")};function Q(){const t=document.getElementById("qt-lines-tbody");if(!t)return;if(!v.length){t.innerHTML=`<tr><td colspan="12" style="text-align:center;padding:20px;
      color:var(--text-2);font-size:12px;">ابحث عن صنف أعلاه لإضافته</td></tr>`,recalcTotals();return}const n=document.getElementById("qt-customer-id")?.value;t.innerHTML=v.map((e,o)=>{const s=q(e.qty,0),i=q(e.unitPrice!==void 0?e.unitPrice:e.price,0),a=q(e.cost,0);let c=e.margin!==void 0&&e.margin!==null&&e.margin!==""?q(e.margin,null):null;c===null||isNaN(c)?c=a>0&&i>0?Math.round((i/a-1)*100*100)/100:0:c=Math.round(c*100)/100;const r=q(e.discount,0),u=s*i,g=u*r/100,p=u-g,m=Math.round(p*.15*100)/100,x=Math.round((p+m)*100)/100,f=!!e.isCustom||String(e.productId||"").startsWith("adhoc_"),d=e.productName&&e.productName.trim().length>=2?bt(e.productName):[],l=d.length>0?d[0]:null,h=n&&d.length>0?d.find(L=>L.customerId===n):null,y=e.productName&&e.productName.trim().length>=2?yt(e.productName):[],b=y.length>0?y[0]:null;let k="";l&&(k=`
        <div style="margin-top:4px; font-size:10.5px; display:inline-flex; align-items:center; gap:6px; flex-wrap:wrap; background:rgba(99,102,241,0.06); padding:3px 8px; border-radius:5px; border:1px dashed rgba(99,102,241,0.35);">
          <span style="color:#4338ca; font-weight:700;">🕒 آخر تسعير سابق:</span>
          <span class="mono" style="font-weight:800; color:#1e1b4b;">${w(l.unitPrice)}</span>
          <span style="color:var(--text-2); font-size:10px;">(${l.customerName||"عميل"} — ${V(l.date)})</span>
          ${h&&h.quoteNumber!==l.quoteNumber?`
            <span style="color:#059669; font-weight:700; margin-right:4px; font-size:10px;">| لنفس العميل: ${w(h.unitPrice)}</span>
          `:""}
          <button type="button" class="btn btn-ghost btn-sm" style="font-size:10px; color:#059669; padding:0 5px; font-weight:800; height:20px; background:rgba(16,185,129,0.1); border-radius:3px;"
            onclick="applyInlineHistoryPrice(${o})" title="تطبيق هذا السعر (${l.unitPrice} ر.س) والتكلفة مباشرة على السطر">
            ⚡ تطبيق السعر
          </button>
        </div>
      `);let E="";b&&(E=`
        <div style="margin-top:3px; font-size:10.5px; display:inline-flex; align-items:center; gap:6px; flex-wrap:wrap; background:rgba(16,185,129,0.07); padding:3px 8px; border-radius:5px; border:1px dashed rgba(16,185,129,0.45);">
          <span style="color:#065f46; font-weight:700;">🏢 تكلفة الموردين:</span>
          <span style="color:#047857; font-weight:800;">⭐ ${b.supplierName}: <span class="mono">${w(b.costPrice)}</span></span>
          <span style="color:var(--text-2); font-size:10px;">(قبل الضريبة — ${V(b.quoteDate)})</span>
          ${y.length>1?`<span style="color:#0369a1; font-weight:700; font-size:10px;">| (${y.length} موردين)</span>`:""}
          <button type="button" class="btn btn-ghost btn-sm" style="font-size:10px; color:#059669; padding:0 6px; font-weight:800; height:20px; background:rgba(16,185,129,0.15); border-radius:3px;"
            onclick="applyCheapestSupplierCost(${o})" title="اعتماد سعر هذا المورد (${b.costPrice} ر.س) كتكلفة لهذا السطر مع احتساب هامش الربح">
            ⚡ اعتماد تكلفة ${b.supplierName.slice(0,15)} (${w(b.costPrice)})
          </button>
          <button type="button" class="btn btn-ghost btn-sm" style="font-size:10px; color:#4338ca; padding:0 6px; font-weight:700; height:20px; background:rgba(99,102,241,0.08); border-radius:3px;"
            onclick="openSupplierCompareModal(${o})" title="مقارنة كافة أسعار الموردين لهذا الصنف">
            🔍 مقارنة الموردين (${y.length})
          </button>
        </div>
      `);const N=document.getElementById("qt-warehouse")?.value||"",$=e.productId&&!f?kt(e.productId,N):null,P=e.productId&&!f?kt(e.productId,null):null,I=e.productId&&!f?Yt(e.productId):"";let M="";$!==null&&($>0?M=`
          <span class="badge" style="background:rgba(16,185,129,0.14); color:#047857; font-size:10.5px; font-weight:800; padding:2px 7px; border-radius:4px; border:1px solid rgba(16,185,129,0.3); display:inline-flex; align-items:center; gap:3px;" title="${I}">
            📦 الرصيد بالمخزن: <strong>${$}</strong> ${e.unit||""}
            ${N&&P!==$?`<span style="opacity:0.8; font-size:9.5px;">(إجمالي: ${P})</span>`:""}
          </span>
        `:M=`
          <span class="badge" style="background:rgba(239,68,68,0.12); color:#dc2626; font-size:10.5px; font-weight:800; padding:2px 7px; border-radius:4px; border:1px solid rgba(239,68,68,0.25); display:inline-flex; align-items:center; gap:3px;" title="${I}">
            ⚠️ الرصيد بالمخزن: 0 ${e.unit||""}
            ${P>0?`<span style="color:#059669; font-size:9.5px; font-weight:700;">(متوفر ${P} بمخازن أخرى)</span>`:""}
          </span>
        `);let T="";return $!==null&&(s>$&&$>=0?T=`<div style="font-size:9.5px; color:#dc2626; font-weight:800; margin-top:2px; text-align:center; white-space:nowrap;" title="الكمية المطلوبة تتجاوز الرصيد الحالي بالمخزن">⚠️ الرصيد ${$} فقط</div>`:$>0&&(T=`<div style="font-size:9.5px; color:#059669; font-weight:700; margin-top:2px; text-align:center; white-space:nowrap;">✓ متاح بالمخزن (${$})</div>`)),`
      <tr id="qt-tr-${o}" style="border-bottom:1px solid var(--border-soft); ${f?"background:rgba(245,158,11,0.03);":""}">
        <td style="padding:5px 8px;color:var(--text-2);font-size:11px;">${o+1}</td>
        <td style="padding:5px 8px;">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <input type="text" class="input" style="font-size:12.5px;font-weight:700;flex:1;min-width:180px;height:30px;${f?"border-color:#fbbf24;background:#fffdf5;":""}"
              value="${(e.productName||"").replace(/"/g,"&quot;")}"
              placeholder="اكتب اسم الصنف..."
              oninput="onQtRowInput(${o},'productName',this.value)"
              onchange="updateQtLine(${o},'productName',this.value)" />
            ${f?'<span class="badge" style="background:#fef3c7;color:#b45309;font-size:10px;padding:2px 6px;border-radius:4px;white-space:nowrap;">⚡ بند حر</span>':e.sku?`<span style="font-size:10px;color:var(--text-2);font-family:monospace;">${e.sku}</span>`:""}
            ${M}
            ${(()=>{if(document.getElementById("qt-pricelist")?.value==="tier1"){const _=typeof S<"u"&&Array.isArray(S)?S.find(W=>W.id===e.productId):null,Y=Lt(_||e),J=lt(_||e);return`<span class="badge" style="background:rgba(5,150,105,0.12);color:#047857;font-size:10px;padding:2px 6px;border-radius:4px;white-space:nowrap;font-weight:700;">${Y==="basic"?`🌾 أساسي (${J}%)`:Y==="high"?`📦 تغليف (${J}%)`:`🥫 متوسط (${J}%)`}</span>`}return""})()}
            <button type="button" class="btn btn-ghost btn-sm" style="font-size:10.5px;color:#047857;padding:2px 6px;white-space:nowrap;font-weight:700;background:rgba(16,185,129,0.08);border-radius:4px;"
              title="عرض ومقارنة عروض أسعار الموردين لهذا الصنف"
              onclick="openSupplierCompareModal(${o})">🏢 أسعار الموردين (${y.length})</button>
            <button type="button" class="btn btn-ghost btn-sm" style="font-size:10.5px;color:#4f46e5;padding:2px 6px;white-space:nowrap;font-weight:700;background:rgba(99,102,241,0.08);border-radius:4px;"
              title="عرض سجل عروض الأسعار السابقة لهذا البند"
              onclick="openPriceHistoryModal(${o})">🕒 سجل الأسعار (${d.length})</button>
            ${f?`<button type="button" class="btn btn-ghost btn-sm" style="font-size:10.5px;color:#059669;padding:2px 6px;white-space:nowrap;font-weight:700;"
              title="تسجيل هذا البند كصنف دائم في الكتالوج"
              onclick="registerAdhocProduct(${o})">💾 تسجيل بالكتالوج</button>`:""}
          </div>
          ${E}
          ${k}
        </td>
        <td style="padding:6px 8px;">
          <input type="text" class="input" style="width:72px;height:32px;font-size:11.5px;text-align:center;padding:2px;font-weight:600;${f?"border-color:#fbbf24;":""}"
            value="${e.unit||"كرتون"}"
            placeholder="الوحدة"
            oninput="onQtRowInput(${o},'unit',this.value)"
            onchange="updateQtLine(${o},'unit',this.value)" />
        </td>
        <td style="padding:6px 8px;">
          <input type="number" id="qt-row-qty-${o}" class="input mono qt-line-qty no-spin" data-row="${o}" style="width:85px;height:32px;font-size:12.5px;font-weight:800;text-align:center;${$!==null&&s>$?"border-color:#ef4444;background:#fff5f5;":""}"
            value="${e.qty}" min="0.001" step="0.001"
            onwheel="this.blur()"
            oninput="onQtRowInput(${o},'qty',this.value)"
            onchange="updateQtLine(${o},'qty',this.value)"
            onkeydown="window.onQtRowKey(event, ${o}, 'qty')" />
          ${T}
        </td>
        <td class="no-print" style="padding:6px 8px;">
          <div style="display:flex;flex-direction:column;gap:2px;">
            <input type="number" id="qt-row-cost-${o}" class="input mono no-spin" style="width:95px;height:32px;font-size:12px;font-weight:700;text-align:center;background:#f9f9ff;border-color:#d0d4f0;"
              value="${a>0?Number(a.toFixed(2)):0}" min="0" step="0.01"
              onwheel="this.blur()"
              title="سعر التكلفة (آخر شراء / تقديري)"
              oninput="onQtRowInput(${o},'cost',this.value)"
              onchange="updateQtLineCost(${o},this.value)"
              onkeydown="window.onQtRowKey(event, ${o}, 'cost')" />
            ${e.lastPurchasePrice?`<span style="font-size:9.5px;color:#059669;font-weight:600;text-align:center;" title="آخر سعر شراء مسجل من فواتير الشراء">آخر: ${w(e.lastPurchasePrice)}</span>`:""}
          </div>
        </td>
        <td class="no-print" style="padding:6px 8px;">
          <input type="number" id="qt-row-margin-${o}" class="input mono no-spin" style="width:85px;height:32px;font-size:12px;font-weight:700;text-align:center;background:#f0fdf4;border-color:#86efac;color:#166534;"
            value="${c!=null&&!isNaN(c)?Number(c.toFixed(2)):0}" step="0.1"
            onwheel="this.blur()"
            title="نسبة هامش الربح %"
            oninput="onQtRowInput(${o},'margin',this.value)"
            onchange="updateQtLineMargin(${o},this.value)"
            onkeydown="window.onQtRowKey(event, ${o}, 'margin')" />
        </td>
        <td style="padding:6px 8px;">
          <input type="number" id="qt-row-price-${o}" class="input mono no-spin" style="width:115px;height:32px;font-size:12.5px;font-weight:800;text-align:center;background:#eff6ff;border-color:#3b82f6;color:#1e3a8a;"
            value="${i>0?Number(i.toFixed(2)):0}" min="0" step="0.01"
            onwheel="this.blur()"
            title="السعر غير شامل الضريبة"
            oninput="onQtRowInput(${o},'unitPrice',this.value)"
            onchange="updateQtLine(${o},'unitPrice',this.value)"
            onkeydown="window.onQtRowKey(event, ${o}, 'price')" />
          <div id="qt-row-inc-${o}" style="font-size:9.5px;color:#2563eb;font-weight:700;margin-top:2px;text-align:center;white-space:nowrap;" title="السعر شامل 15% ضريبة">
            شامل: ${w(Math.round(i*1.15*100)/100)}
          </div>
        </td>
        <td style="padding:6px 8px;">
          <input type="number" id="qt-row-disc-${o}" class="input mono no-spin" style="width:72px;height:32px;font-size:12px;text-align:center;"
            value="${r||0}" min="0" max="100" step="0.1"
            onwheel="this.blur()"
            oninput="onQtRowInput(${o},'discount',this.value)"
            onchange="updateQtLine(${o},'discount',this.value)"
            onkeydown="window.onQtRowKey(event, ${o}, 'disc')" />
        </td>
        <td style="padding:5px 8px;" class="mono font-semibold" id="qt-row-net-${o}">${w(p)}</td>
        <td style="padding:5px 8px;color:var(--warn);" class="mono" id="qt-row-vat-${o}">${w(m)}</td>
        <td style="padding:5px 8px;font-weight:700;" class="mono" id="qt-row-total-${o}">${w(x)}</td>
        <td style="padding:5px 8px;">
          <button class="btn btn-icon sm btn-ghost" style="color:var(--bad);"
            onclick="removeQtLine(${o})">✕</button>
        </td>
      </tr>`}).join(""),recalcTotals()}window.onQtRowInput=(t,n,e)=>{if(!v[t])return;if(n==="productName"||n==="unit"){v[t][n]=e;return}const o=q(e,0);v[t][n]=o;let s=q(v[t].cost,0),i=q(v[t].margin,0),a=q(v[t].unitPrice,0),c=q(v[t].qty,0),r=q(v[t].discount,0);if(n==="unitPrice"){if(s>0){i=Math.round((o/s-1)*100*100)/100,v[t].margin=i;const y=document.getElementById(`qt-row-margin-${t}`);y&&(y.value=Number(i.toFixed(2)))}else if(o>0&&i>0){s=Math.round(o/(1+i/100)*100)/100,v[t].cost=s;const y=document.getElementById(`qt-row-cost-${t}`);y&&(y.value=Number(s.toFixed(2)))}}else if(n==="margin"){if(s>0){a=Math.round(s*(1+o/100)*100)/100,v[t].unitPrice=a;const y=document.getElementById(`qt-row-price-${t}`);y&&(y.value=Number(a.toFixed(2)))}else if(a>0&&o>0){s=Math.round(a/(1+o/100)*100)/100,v[t].cost=s;const y=document.getElementById(`qt-row-cost-${t}`);y&&(y.value=Number(s.toFixed(2)))}}else if(n==="cost"){if(s>0&&a>0){i=Math.round((a/s-1)*100*100)/100,v[t].margin=i;const y=document.getElementById(`qt-row-margin-${t}`);y&&(y.value=Number(i.toFixed(2)))}else if(s>0&&i>0){a=Math.round(s*(1+i/100)*100)/100,v[t].unitPrice=a;const y=document.getElementById(`qt-row-price-${t}`);y&&(y.value=Number(a.toFixed(2)))}}const u=c*v[t].unitPrice,g=u*r/100,p=u-g,m=Math.round(p*.15*100)/100,x=Math.round((p+m)*100)/100,f=document.getElementById(`qt-row-inc-${t}`);f&&(f.textContent=`شامل: ${w(Math.round(v[t].unitPrice*1.15*100)/100)}`);const d=document.getElementById(`qt-row-net-${t}`);d&&(d.textContent=w(p));const l=document.getElementById(`qt-row-vat-${t}`);l&&(l.textContent=w(m));const h=document.getElementById(`qt-row-total-${t}`);h&&(h.textContent=w(x)),recalcTotals()};window.refreshQuoteItemCostsFromPurchases=async t=>{t&&(t.disabled=!0,t.innerHTML="<span>⏳</span> جارٍ التحديث…");try{const{syncProductCostsFromPurchaseInvoices:n}=await mt(async()=>{const{syncProductCostsFromPurchaseInvoices:i}=await import("./product-cost-sync-DM1NFvQW.js");return{syncProductCostsFromPurchaseInvoices:i}},__vite__mapDeps([3,1,2])),{productsMap:e}=await n(!0);S=await K(j.products());const o=document.getElementById("qt-pricelist")?.value||"standard";let s=0;v.forEach(i=>{const a=S.find(u=>u.id===i.productId),c=e[i.productId],r=c?.averageCost||c?.costPrice||c?.lastPurchasePrice||c?.avgCostPrice||a?.averageCost||a?.costPrice||a?.lastPurchasePrice||a?.avgCostPrice||a?.purchasePrice||0;if(r>0){i.cost=r,i.lastPurchasePrice=c?.lastPurchasePrice||a?.lastPurchasePrice||r;let u=0;if(o==="tier1"){const g=lt(a||i);u=r*(1+g/100)}else o==="wholesale"?u=r*(1+(F?.wholesaleMargin||7)/100):o==="distributor"?u=r*(1+(F?.distributorMargin||5)/100):u=r*(1+(F?.retailMargin||10)/100);i.unitPrice=Math.round(u*100)/100,i.margin=Math.round((i.unitPrice/r-1)*100*100)/100,s++}}),Q(),showToast(`تم تحديث تكاليف وهوامش أسعار (${s}) صنف من فواتير الشراء بنجاح ✅`,"success")}catch(n){showToast("فشل تحديث تكاليف عروض الأسعار: "+n.message,"error")}finally{t&&(t.disabled=!1,t.innerHTML="<span>🔄</span> تحديث التكاليف من فواتير الشراء")}};window.updateQtLine=(t,n,e)=>{if(!v[t])return;if(n==="productName"||n==="unit"){v[t][n]=e;return}const o=q(e,0);if(v[t][n]=o,n==="unitPrice"){let s=q(v[t].cost,0);const i=q(v[t].margin,0);s>0?v[t].margin=Math.round((o/s-1)*100*100)/100:o>0&&i>0&&(v[t].cost=Math.round(o/(1+i/100)*100)/100)}Q()};window.updateQtLineCost=(t,n)=>{const e=q(n,0);v[t].cost=Math.round(e*100)/100;const o=q(v[t].unitPrice,0),s=q(v[t].margin,0);e>0&&o>0?v[t].margin=Math.round((o/e-1)*100*100)/100:e>0&&s>0&&(v[t].unitPrice=Math.round(e*(1+s/100)*100)/100),Q()};window.updateQtLineMargin=(t,n)=>{const e=q(n,0);v[t].margin=Math.round(e*100)/100;let o=q(v[t].cost,0);const s=q(v[t].unitPrice,0);o>0?v[t].unitPrice=Math.round(o*(1+e/100)*100)/100:s>0&&e>0&&(v[t].cost=Math.round(s/(1+e/100)*100)/100),Q()};window.removeQtLine=t=>{v.splice(t,1),Q()};window.recalcTotals=()=>{const t=document.getElementById("qt-extra-disc-type")?.value||"none",n=document.getElementById("qt-extra-disc-val")?.value||"0",e=Et(v,t,n),o=(m,x)=>{const f=document.getElementById(m);f&&(f.textContent=x)};o("qt-t-gross",w(e.grossTotal)),o("qt-t-disc","- "+w(e.totalDiscount)),o("qt-t-subtotal",w(e.subtotal)),o("qt-t-vat",w(e.vat)),o("qt-t-grand",w(e.grandTotal)),o("qt-t-cost",w(e.totalCost)),o("qt-t-profit",w(e.totalProfit));const i=`${e.markupPct>=0?"+":""}${e.markupPct.toFixed(2)}%`;o("qt-t-margin",i),o("qt-t-margin-badge",i);const a=e.marginPct>=0?"+":"";o("qt-t-margin-sales",`${a}${e.marginPct.toFixed(2)}%`);const c=e.avgMarginPct>=0?"+":"";o("qt-t-avg-margin",`${c}${e.avgMarginPct.toFixed(2)}%`);const r=e.totalProfit>=0,u=document.getElementById("qt-t-margin-badge");u&&(u.style.background=r?"#059669":"#dc2626");const g=document.getElementById("qt-t-profit-row");g&&(g.style.color=r?"#059669":"#dc2626");const p=document.getElementById("qt-t-margin");p&&(p.style.color=r?"#059669":"#dc2626")};function qe(){const t=document.getElementById("qt-customer-search"),n=document.getElementById("qt-customer-results");if(!t)return;const e=()=>{const o=t.value.trim(),s=document.getElementById("qt-customer-name-val");s&&(s.value=o);const i=document.getElementById("qt-customer-id");if(i)if(!o||o==="عرض سعر عام (عميل عام)")i.value="general";else{const a=dt.find(c=>(c.name||"").trim().toLowerCase()===o.toLowerCase());i.value=a?a.id:"adhoc_customer"}};t.addEventListener("input",e),t.addEventListener("change",e),t.addEventListener("input",Ut(()=>{const o=t.value.trim().toLowerCase();if(!o){n.classList.add("hidden");return}const s=dt.filter(i=>(i.name||"").toLowerCase().includes(o)||(i.phone||"").includes(o)).slice(0,10);if(!s.length){const i=o.replace(/'/g,"\\'").replace(/"/g,"&quot;");n.innerHTML=`
        <div style="padding:10px 14px; font-size:11.5px; color:var(--text-2); background:var(--bg-1);">
          عميل جديد / مخصص: <strong style="color:var(--text-1);">${i}</strong>
          <div style="font-size:10.5px; color:#059669; margin-top:2px;">✓ سيتم حفظ هذا العميل مباشرة في عرض السعر</div>
        </div>`,n.classList.remove("hidden");return}n.innerHTML=s.map(i=>{const c=Zt(i)?'<span class="badge" style="background:#059669;color:#fff;font-size:10px;padding:1px 6px;margin-right:6px;">💎 فئة أولى</span>':"";return`
      <div class="autocomplete-item"
        onclick="selectQtCustomer('${i.id}','${(i.name||"").replace(/'/g,"\\'")}')">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="font-weight:700;">${i.name} ${c}</div>
          <div class="item-code">${i.phone||""} ${i.vatNumber?"| ض: "+i.vatNumber:""}</div>
        </div>
      </div>`}).join(""),n.classList.remove("hidden")},250)),document.addEventListener("click",o=>{!t.contains(o.target)&&!n.contains(o.target)&&n.classList.add("hidden")})}window.selectQtCustomer=(t,n)=>{const e=(s,i)=>{const a=document.getElementById(s);a&&(a.value=i)};e("qt-customer-id",t),e("qt-customer-name-val",n),e("qt-customer-search",n),document.getElementById("qt-customer-results")?.classList.add("hidden");const o=dt.find(s=>s.id===t);if(o){const s=document.getElementById("qt-delivery-address");s&&!s.value.trim()&&o.address&&(s.value=o.address);const i=document.getElementById("qt-pricelist");Zt(o)?i&&i.value!=="tier1"&&(i.value="tier1",onPricelistChange()):i&&i.value==="tier1"&&(i.value=o.priceList||"standard",onPricelistChange())}It()};function ke(){const t=document.getElementById("qt-product-search"),n=document.getElementById("qt-product-results"),e=document.getElementById("qt-product-category-filter");if(!t)return;const o=()=>{const s=t.value.trim(),i=s.toLowerCase(),a=e?e.value:"",c=document.getElementById("qt-pricelist")?.value||"standard";if(!i&&!a){n.classList.add("hidden");return}let r=S;a&&(r=r.filter(l=>l.category===a)),i&&(r=r.filter(l=>(l.name||"").toLowerCase().includes(i)||(l.sku||"").toLowerCase().includes(i)||(l.barcode||"").includes(i))),r=r.slice(0,15);const u=i?Se(i):[],g=i?Ae(i):[],p=(s||"").replace(/'/g,"\\'").replace(/"/g,"&quot;");if(!r.length&&!u.length&&!g.length){n.innerHTML=`
        <div style="padding:14px;text-align:center;background:var(--bg-1);border-radius:8px;">
          <div style="font-size:12px;color:var(--text-2);margin-bottom:10px;">
            الصنف <strong style="color:var(--text-1);">"${p}"</strong> غير موجود في دليل الأصناف أو عروض الأسعار أو قوائم الموردين
          </div>
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
            <button type="button" class="btn btn-sm btn-primary" onclick="openQuickAddProductModal('${p}')" style="font-size:11.5px;padding:6px 12px;background:#059669;border-color:#059669;font-weight:700;">
              ➕ تسجيل "${p}" كصنف جديد في الكتالوج
            </button>
            <button type="button" class="btn btn-sm btn-secondary" onclick="addCustomQuoteLine('${p}')" style="font-size:11.5px;padding:6px 12px;color:#d97706;border-color:rgba(245,158,11,0.4);font-weight:700;">
              ⚡ إدراج كبند حر في العرض
            </button>
          </div>
        </div>`,n.classList.remove("hidden");return}const m=r.map(l=>{const h=l.averageCost||l.costPrice||l.lastPurchasePrice||l.avgCostPrice||l.purchasePrice||0;let y=0,b="";if(c==="tier1"){const L=lt(l),_=Lt(l);b=`<span class="badge" style="background:rgba(5,150,105,0.12);color:#047857;font-size:10px;padding:1px 6px;">${_==="basic"?"🌾 أساسي":_==="high"?"📦 تغليف ومنظفات":"🥫 متوسط"} (+${L}%)</span>`,y=h>0?h*(1+L/100):0}else c==="wholesale"?y=h>0?h*(1+F.wholesaleMargin/100):0:c==="distributor"?y=h>0?h*(1+F.distributorMargin/100):0:y=h>0?h*(1+F.retailMargin/100):0;if(y<=0){const L=l.salePrice||l.priceRetail||l.price||0;y=Math.round(L/1.15*100)/100}else y=Math.round(y*100)/100;const k=y*1.15,E=document.getElementById("qt-warehouse")?.value||"",N=kt(l.id,E),$=kt(l.id,null),P=Yt(l.id);let I="";N>0?I=`
          <span class="badge" style="background:rgba(16,185,129,0.15); color:#047857; font-size:11px; font-weight:800; padding:2px 8px; border-radius:5px; border:1px solid rgba(16,185,129,0.3); display:inline-flex; align-items:center; gap:4px;" title="${P}">
            📦 متوفر بالمخزن: <strong>${N}</strong> ${l.unit||"كرتون"}
            ${E&&$!==N?`<small style="opacity:0.8; font-weight:600;">(إجمالي: ${$})</small>`:""}
          </span>
        `:I=`
          <span class="badge" style="background:rgba(239,68,68,0.12); color:#dc2626; font-size:11px; font-weight:800; padding:2px 8px; border-radius:5px; border:1px solid rgba(239,68,68,0.25); display:inline-flex; align-items:center; gap:4px;" title="${P}">
            ⚠️ الرصيد بالمخزن: 0 ${l.unit||"كرتون"}
            ${$>0?`<small style="color:#059669; font-weight:700;">(متوفر ${$} بمخازن أخرى)</small>`:""}
          </span>
        `;const M=(l.name||"").replace(/'/g,"\\'"),T=(l.sku||"").replace(/'/g,"\\'");return`
        <div class="autocomplete-item" style="padding:10px 14px; cursor:pointer;"
          onclick="addQtProduct('${l.id}','${M}',${y},'${l.unit||"PCS"}','${T}', ${h})">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
            <div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;flex-wrap:wrap;">
              <span style="font-weight:700; color:var(--text-1); font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${l.name}</span>
              ${l.sku?`<span class="badge" style="font-size:10.5px; background:var(--bg-2); color:var(--text-2); padding:1px 6px;">${l.sku}</span>`:""}
              <span class="badge" style="font-size:10.5px; background:rgba(37,99,235,0.08); color:#1d4ed8; padding:1px 6px;">${l.unit||"كرتون"}</span>
              ${I}
              ${b}
            </div>
            <div style="display:flex;align-items:center;gap:12px;flex-shrink:0;">
              <span style="color:#059669; font-weight:600; font-size:11px; background:rgba(16,185,129,0.1); padding:2px 8px; border-radius:4px;">
                🛒 آخر شراء: ${w(l.lastPurchasePrice||h)}
              </span>
              <div style="text-align:left;">
                <span class="mono text-indigo font-bold" style="font-size:13px;" title="سعر البيع المقترح شامل الضريبة">${w(k)}</span>
                <span class="dim" style="font-size:9.5px; display:block;">شامل 15%</span>
              </div>
            </div>
          </div>
        </div>`}).join("");let x="";g.length>0&&(x=`
        <div style="padding:6px 14px; background:rgba(6,78,59,0.08); border-top:1px solid rgba(6,78,59,0.2); border-bottom:1px solid rgba(6,78,59,0.2); font-size:11px; font-weight:800; color:#065f46; display:flex; align-items:center; justify-content:space-between;">
          <span>🏢 أصناف متوفرة في عروض أسعار الموردين (اضغط للإدراج مع التكلفة):</span>
          <span style="font-size:10px; color:#047857; font-weight:600;">(قوائم الموردين)</span>
        </div>
      `+g.map(l=>{const h=l.costPrice||0;let y=h>0?h*(1+(F.retailMargin||10)/100):0;y=Math.round(y*100)/100;const b=y*1.15,k=(l.productName||"").replace(/'/g,"\\'"),E=(l.unit||"كرتون").replace(/'/g,"\\'");return`
          <div class="autocomplete-item" style="padding:9px 14px; cursor:pointer; background:#f0fdf4;"
            onclick="addCustomQuoteLineWithData('${k}', '${E}', ${h}, ${F.retailMargin||10}, ${y}, '')">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
              <div style="display:flex; align-items:center; gap:8px; min-width:0; flex:1;">
                <span class="badge" style="font-size:10px; background:#dcfce7; color:#15803d; padding:2px 6px; font-weight:800;">🏢 مورد</span>
                <span style="font-weight:700; color:var(--text-1); font-size:12.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${l.productName}</span>
                <span class="badge" style="font-size:10px; background:rgba(37,99,235,0.08); color:#1d4ed8; padding:1px 6px;">${l.unit||"كرتون"}</span>
                <span style="font-size:10.5px; color:#047857; font-weight:600;">(${l.supplierName} — ${V(l.quoteDate)})</span>
              </div>
              <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
                <span style="color:#059669; font-weight:700; font-size:11px; background:rgba(16,185,129,0.12); padding:2px 6px; border-radius:4px;">
                  🛒 تكلفة المورد: ${w(h)}
                </span>
                <div style="text-align:left;">
                  <span class="mono text-indigo font-bold" style="font-size:12.5px;" title="سعر البيع المقترح شامل الضريبة">${w(b)}</span>
                  <span class="dim" style="font-size:9px; display:block;">شامل 15%</span>
                </div>
              </div>
            </div>
          </div>`}).join(""));let f="";u.length>0&&(f=`
        <div style="padding:6px 14px; background:rgba(245,158,11,0.08); border-top:1px solid rgba(245,158,11,0.2); border-bottom:1px solid rgba(245,158,11,0.2); font-size:11px; font-weight:800; color:#b45309; display:flex; align-items:center; justify-content:space-between;">
          <span>🕒 بنود حرة مُسعّرة سابقاً في عروض الأسعار:</span>
          <span style="font-size:10px; color:#92400e; font-weight:600;">(اضغط للإدراج بنفس السعر والتكلفة)</span>
        </div>
      `+u.map(l=>{const h=(l.unitPrice||0)*1.15,y=(l.productName||"").replace(/'/g,"\\'"),b=(l.unit||"كرتون").replace(/'/g,"\\'"),k=(l.sku||"").replace(/'/g,"\\'");return`
          <div class="autocomplete-item" style="padding:9px 14px; cursor:pointer; background:#fffdf8;"
            onclick="addCustomQuoteLineWithData('${y}', '${b}', ${l.cost||0}, ${l.margin||0}, ${l.unitPrice||0}, '${k}')">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
              <div style="display:flex; align-items:center; gap:8px; min-width:0; flex:1;">
                <span class="badge" style="font-size:10px; background:#fef3c7; color:#b45309; padding:2px 6px; font-weight:800;">⚡ بند حر سابق</span>
                <span style="font-weight:700; color:var(--text-1); font-size:12.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${l.productName}</span>
                <span class="badge" style="font-size:10px; background:rgba(37,99,235,0.08); color:#1d4ed8; padding:1px 6px;">${l.unit||"كرتون"}</span>
                <span style="font-size:10.5px; color:var(--text-2);">(${l.lastCustomerName||"عميل"} — ${V(l.lastQuotedDate)})</span>
              </div>
              <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
                ${l.cost>0?`<span style="color:#059669; font-weight:600; font-size:10.5px; background:rgba(16,185,129,0.08); padding:2px 6px; border-radius:4px;">تكلفة: ${w(l.cost)}</span>`:""}
                <div style="text-align:left;">
                  <span class="mono text-indigo font-bold" style="font-size:12.5px;" title="السعر المسعر سابقاً شامل الضريبة">${w(h)}</span>
                  <span class="dim" style="font-size:9px; display:block;">شامل 15%</span>
                </div>
              </div>
            </div>
          </div>`}).join(""));const d=i?`
      <div style="padding:8px 12px;background:var(--bg-2);border-top:1px dashed var(--border-soft);display:flex;justify-content:space-between;align-items:center;font-size:11px;">
        <span style="color:var(--text-2);">لم تجد ما تبحث عنه؟</span>
        <div style="display:flex;gap:6px;">
          <button type="button" class="btn btn-ghost btn-sm" onclick="addCustomQuoteLine('${p}')" style="font-size:11px;color:#d97706;font-weight:700;">⚡ إدراج "${p}" كبند حر جديد</button>
          <button type="button" class="btn btn-ghost btn-sm" onclick="openQuickAddProductModal('${p}')" style="font-size:11px;color:#059669;font-weight:700;">➕ تسجيل صنف جديد</button>
        </div>
      </div>`:"";n.innerHTML=m+x+f+d,n.classList.remove("hidden")};t.addEventListener("input",Ut(o,200)),t.addEventListener("focus",o),e&&e.addEventListener("change",o),document.addEventListener("click",s=>{!t.contains(s.target)&&!n.contains(s.target)&&(!e||!e.contains(s.target))&&n.classList.add("hidden")})}window.addQtProduct=(t,n,e,o,s,i=0)=>{const a=document.getElementById("qt-product-search"),c=document.getElementById("qt-product-results");a&&(a.value=""),c&&c.classList.add("hidden");const r=S.find(x=>x.id===t),u=q(e,0),g=q(i,0)||q(r?.averageCost||r?.costPrice||r?.lastPurchasePrice||r?.avgCostPrice||r?.purchasePrice,0),p=q(r?.lastPurchasePrice,g>0?g:0),m=v.findIndex(x=>x.productId===t);if(m!==-1){v[m].qty+=1,!v[m].cost&&g>0&&(v[m].cost=Math.round(g*100)/100),!v[m].lastPurchasePrice&&p>0&&(v[m].lastPurchasePrice=Math.round(p*100)/100);const[x]=v.splice(m,1);v.unshift(x)}else{const x=Math.round(g*100)/100,f=x>0?Math.round((u/x-1)*100*100)/100:0;v.unshift({productId:t,productName:n,unitPrice:Math.round(u*100)/100,unit:o,sku:s,qty:1,discount:0,cost:x,lastPurchasePrice:Math.round(p*100)/100,margin:f})}Q(),setTimeout(()=>{const x=document.querySelector("#qt-lines-tbody tr:first-child .qt-line-qty");x&&(x.scrollIntoView({behavior:"smooth",block:"nearest"}),x.focus(),x.select())},40)};window.addAllProductsToQuote=()=>{if(!S||S.length===0){showToast("لا توجد أصناف في الكتالوج","warn");return}const t=document.getElementById("qt-product-category-filter")?.value;let n=S;if(t&&(n=S.filter(s=>s.categoryId===t||s.category===t)),!n||n.length===0){showToast("لا توجد أصناف تطابق الفئة المحددة","warn");return}if(!confirm(`هل تريد إدراج جميع أصناف الكتالوج (${n.length} صنف) بداخل عرض السعر؟`))return;const e=document.getElementById("qt-pricelist")?.value||"standard";let o=0;n.forEach(s=>{if(!v.some(i=>i.productId===s.id)){let i=q(s.salePrice||s.priceRetail||s.sellingPrice||s.price,0);const a=q(s.averageCost||s.costPrice||s.lastPurchasePrice||s.avgCostPrice||s.purchasePrice||s.cost,0);if(e==="tier1"){const u=lt(s);a>0&&(i=a*(1+u/100))}else e==="wholesale"&&s.priceWholesale?i=q(s.priceWholesale,i):e==="distributor"&&s.priceDistributor?i=q(s.priceDistributor,i):e==="special"&&s.priceSpecial&&(i=q(s.priceSpecial,i));const c=q(s.lastPurchasePrice,a>0?a:0),r=a>0?Math.round((i/a-1)*100*100)/100:0;v.push({productId:s.id,productName:s.name||s.nameAr||"",sku:s.sku||s.code||"",unit:s.unit||s.unitName||"PCS",cost:Math.round(a*100)/100,lastPurchasePrice:Math.round(c*100)/100,margin:r,qty:1,unitPrice:Math.round(i*100)/100,discount:0}),o++}}),Q(),showToast(`تم إدراج ${o} صنف في عرض السعر بنجاح`,"success")};window.clearAllQuoteLines=()=>{v.length!==0&&confirm("هل أنت متأكد من تفريغ كافة بنود عرض السعر؟")&&(v=[],Q(),showToast("تم تفريغ كافة الأصناف","info"))};window.saveQuote=async t=>{const n=document.getElementById("qt-form-error");n&&n.classList.add("hidden");const e=document.getElementById("qt-customer-search")?.value.trim()||"",o=document.getElementById("qt-customer-name-val")?.value.trim()||"";let s=e||o||"عرض سعر عام (عميل عام)",i=document.getElementById("qt-customer-id")?.value.trim()||"general";if(s==="عرض سعر عام (عميل عام)")i="general";else{const b=dt.find(k=>(k.name||"").trim().toLowerCase()===s.toLowerCase());b?i=b.id:(!i||i==="general")&&(i="adhoc_customer")}const a=document.getElementById("qt-customer-id");a&&(a.value=i);const c=document.getElementById("qt-customer-name-val");c&&(c.value=s);const r=document.getElementById("qt-date")?.value||"",u=document.getElementById("qt-expiry")?.value||"";if(!v.length){n&&(n.textContent="يرجى إضافة صنف واحد على الأقل.",n.classList.remove("hidden"));return}if(!r){n&&(n.textContent="يرجى تحديد تاريخ العرض.",n.classList.remove("hidden"));return}const g=document.getElementById("qt-extra-disc-type")?.value||"none",p=parseFloat(document.getElementById("qt-extra-disc-val")?.value)||0,m=Et(v,g,p),x=document.getElementById("qt-rep"),f=x?.value||"",d=x?.options[x?.selectedIndex]?.dataset.name||"",l=t||document.getElementById("qt-status")?.value||"draft",h=document.getElementById("qt-save-draft-btn"),y=document.getElementById("qt-save-btn");h&&(h.disabled=!0),y&&(y.disabled=!0);try{let b=(document.getElementById("qt-number")?.value||"").trim();(!b||b==="جارٍ التوليد…"||b==="يُولَّد تلقائياً")&&(b=await Kt("QT"));const k=(v||[]).map(P=>{const I=q(P.qty,1),M=q(P.unitPrice!==void 0?P.unitPrice:P.price,0),T=q(P.cost,0);let L=P.margin!==void 0&&P.margin!==null&&P.margin!==""?q(P.margin,null):null;L===null||isNaN(L)?L=T>0&&M>0?Math.round((M/T-1)*100*100)/100:0:L=Math.round(L*100)/100;const _=q(P.discount,0),Y=I*M,J=Y*_/100,Z=Math.max(0,Y-J),W=Math.round(Z*.15*100)/100;return{...P,qty:I,unitPrice:Math.round(M*100)/100,price:Math.round(M*100)/100,cost:Math.round(T*100)/100,lastPurchasePrice:Math.round(q(P.lastPurchasePrice||T,0)*100)/100,margin:L,discount:_,total:Math.round(Z*100)/100,vat:W,grandTotal:Math.round((Z+W)*100)/100}});v=k;const E={quoteNumber:b,date:r,expiryDate:u,customerId:i,customerName:s,deliveryAddress:document.getElementById("qt-delivery-address")?.value||"",repId:f,repName:d,warehouseId:document.getElementById("qt-warehouse")?.value||"",warehouseName:document.getElementById("qt-warehouse")?.options?.[document.getElementById("qt-warehouse")?.selectedIndex]?.text||"",priceList:document.getElementById("qt-pricelist")?.value||"standard",paymentTerms:document.getElementById("qt-payment-terms")?.value||"cash",status:l,items:k,grossTotal:m.grossTotal,discountTotal:m.totalDiscount,subtotal:m.subtotal,totalVat:m.vat,grandTotal:m.grandTotal,totalCost:m.totalCost,totalProfit:m.totalProfit,marginPct:m.marginPct,profitMargin:m.markupPct,markupPct:m.markupPct,avgMarginPct:m.avgMarginPct,extraDiscountType:g,extraDiscountVal:p,notes:document.getElementById("qt-notes")?.value||"",terms:document.getElementById("qt-terms")?.value||"",createdBy:Ct?.uid||"system"};let N=rt;if(rt){await Bt("quotations",rt,E);const P=C.findIndex(I=>I.id===rt);P!==-1&&(C[P]={...C[P],...E,id:rt},St(C)),showToast("تم تحديث عرض السعر بنجاح","success")}else{const P=await wt(j.quotations(),E);N=typeof P=="string"?P:P.id,showToast(`تم حفظ العرض ${b}`,"success")}const $=document.getElementById("qt-file-upload");if($&&$.files.length>0){const P=$.files[0];window.uploadFileToArchive(P,"quotations",N,`مرفق عرض سعر رقم ${b}`).catch(I=>console.warn(I))}closeModal("qt-form-modal"),await oe()}catch(b){n&&(n.textContent=b.message,n.classList.remove("hidden")),console.error(b)}finally{h&&(h.disabled=!1),y&&(y.disabled=!1)}};window._quoteTaxViewMode=window._quoteTaxViewMode||"detailed";function ie(t,n="detailed"){const e=t.items||[];if(e.length===0)return'<div style="text-align:center;padding:24px;color:var(--text-3);">لا توجد أصناف في عرض السعر</div>';let o="",s="";return n==="inclusive"?(o=`
      <tr>
        <th style="width:36px;text-align:center;">#</th>
        <th>الصنف والوصف</th>
        <th style="text-align:center;width:95px;">الكمية</th>
        <th style="text-align:left;color:var(--brand);font-weight:800;width:150px;">السعر شامل الضريبة (15%)</th>
        <th style="text-align:center;width:70px;">الخصم</th>
        <th style="text-align:left;color:var(--text-good);font-weight:900;width:150px;">الإجمالي شامل الضريبة</th>
      </tr>
    `,s=e.map((i,a)=>{const c=parseFloat(i.qty)||0,r=parseFloat(i.unitPrice)||0,u=i.taxCategory==="E"||i.taxCategory==="Z"?0:.15,g=Math.round(r*(1+u)*100)/100,p=c*r,m=p*(parseFloat(i.discount)||0)/100,x=p-m,f=Math.round(x*(1+u)*100)/100;return`
        <tr>
          <td style="padding:8px 10px;text-align:center;color:var(--text-2);">${a+1}</td>
          <td style="padding:8px 10px;font-weight:700;color:var(--text-1);">
            ${i.productName}
            ${i.sku&&i.sku!=="بند حر"?`<div style="font-size:10px;color:var(--text-3);font-family:monospace;font-weight:normal;">كود: ${i.sku}</div>`:""}
          </td>
          <td style="padding:8px 10px;text-align:center;" class="mono font-semibold">${O(c)} ${i.unit||""}</td>
          <td style="padding:8px 10px;text-align:left;" class="mono font-bold text-brand">
            <span style="background:rgba(37,99,235,0.08);padding:3px 8px;border-radius:6px;display:inline-block;">${w(g)}</span>
          </td>
          <td style="padding:8px 10px;text-align:center;" class="mono">${i.discount?`<span style="color:var(--text-bad);font-weight:700;">${i.discount}%</span>`:"—"}</td>
          <td style="padding:8px 10px;text-align:left;" class="mono font-bold text-good" style="font-size:13px;">${w(f)}</td>
        </tr>
      `}).join("")):n==="exclusive"?(o=`
      <tr>
        <th style="width:36px;text-align:center;">#</th>
        <th>الصنف والوصف</th>
        <th style="text-align:center;width:95px;">الكمية</th>
        <th style="text-align:left;width:130px;">سعر الوحدة (غير شامل)</th>
        <th style="text-align:center;width:70px;">الخصم</th>
        <th style="text-align:left;width:130px;">الإجمالي (غير شامل)</th>
      </tr>
    `,s=e.map((i,a)=>{const c=parseFloat(i.qty)||0,r=parseFloat(i.unitPrice)||0,u=c*r,g=u*(parseFloat(i.discount)||0)/100,p=u-g;return`
        <tr>
          <td style="padding:8px 10px;text-align:center;color:var(--text-2);">${a+1}</td>
          <td style="padding:8px 10px;font-weight:700;color:var(--text-1);">
            ${i.productName}
            ${i.sku&&i.sku!=="بند حر"?`<div style="font-size:10px;color:var(--text-3);font-family:monospace;font-weight:normal;">كود: ${i.sku}</div>`:""}
          </td>
          <td style="padding:8px 10px;text-align:center;" class="mono font-semibold">${O(c)} ${i.unit||""}</td>
          <td style="padding:8px 10px;text-align:left;" class="mono font-bold">${w(r)}</td>
          <td style="padding:8px 10px;text-align:center;" class="mono">${i.discount?`<span style="color:var(--text-bad);font-weight:700;">${i.discount}%</span>`:"—"}</td>
          <td style="padding:8px 10px;text-align:left;" class="mono font-bold text-good">${w(p)}</td>
        </tr>
      `}).join("")):(o=`
      <tr>
        <th style="width:32px;text-align:center;">#</th>
        <th>الصنف والوصف</th>
        <th style="text-align:center;width:80px;">الكمية</th>
        <th style="text-align:left;width:110px;">السعر (غير شامل)</th>
        <th style="text-align:center;width:85px;">الضريبة (15%)</th>
        <th style="text-align:left;width:130px;background:rgba(37,99,235,0.08);color:var(--brand);font-weight:800;">السعر (شامل 15%)</th>
        <th style="text-align:left;width:125px;color:var(--text-good);font-weight:900;">الإجمالي شامل</th>
      </tr>
    `,s=e.map((i,a)=>{const c=parseFloat(i.qty)||0,r=parseFloat(i.unitPrice)||0,u=i.taxCategory==="E"||i.taxCategory==="Z"?0:.15,g=Math.round(r*u*100)/100,p=Math.round((r+g)*100)/100,m=c*r,x=m*(parseFloat(i.discount)||0)/100,f=m-x,d=Math.round(f*u*100)/100,l=Math.round((f+d)*100)/100;return`
        <tr>
          <td style="padding:7px 8px;text-align:center;color:var(--text-2);">${a+1}</td>
          <td style="padding:7px 8px;font-weight:700;color:var(--text-1);">
            ${i.productName}
            ${i.sku&&i.sku!=="بند حر"?`<div style="font-size:10px;color:var(--text-3);font-family:monospace;font-weight:normal;">كود: ${i.sku}</div>`:""}
          </td>
          <td style="padding:7px 8px;text-align:center;" class="mono font-semibold">${O(c)} ${i.unit||""}</td>
          <td style="padding:7px 8px;text-align:left;" class="mono font-bold">${w(r)}</td>
          <td style="padding:7px 8px;text-align:center;" class="mono"><span style="color:#b45309;font-weight:700;">${w(g)}</span></td>
          <td style="padding:7px 8px;text-align:left;background:rgba(37,99,235,0.04);" class="mono font-bold text-brand">
            <span style="background:rgba(37,99,235,0.1);padding:2px 7px;border-radius:6px;display:inline-block;">${w(p)}</span>
          </td>
          <td style="padding:7px 8px;text-align:left;" class="mono font-bold text-good">${w(l)}</td>
        </tr>
      `}).join("")),`
    <table class="data-dense" style="width:100%;border-collapse:collapse;">
      <thead>${o}</thead>
      <tbody>${s}</tbody>
    </table>
    ${n==="inclusive"?'<div style="font-size:11px;color:var(--text-3);margin-top:6px;padding:4px 8px;font-style:italic;">* جميع أسعار الأصناف المعروضة أعلاه شاملة ضريبة القيمة المضافة 15%</div>':""}
  `}window.setQuoteViewTaxMode=t=>{window._quoteTaxViewMode=t;const n=window._currentViewQuote;if(!n)return;const e=document.getElementById("qt-view-table-container");e&&(e.innerHTML=ie(n,t)),document.querySelectorAll(".qt-tax-mode-btn").forEach(s=>{s.classList.remove("btn-primary"),s.classList.add("btn-secondary")});const o=document.getElementById(`qt-tax-btn-${t}`);o&&(o.classList.remove("btn-secondary"),o.classList.add("btn-primary"))};window.viewQuote=(t,n)=>{if(n&&(n.target.closest("button")||n.target.closest(".row-actions")))return;const e=C.find(h=>h.id===t);if(!e)return;const o=document.getElementById("qt-view-title");o&&(o.textContent=`عرض السعر: ${e.quoteNumber||t}`);const s=document.getElementById("qt-view-convert-btn");s&&(s.style.display=e.status==="converted"?"none":"");const i={cash:"نقداً",net30:"30 يوم",net60:"60 يوم",custom:"حسب الاتفاق"},a={standard:"عادي",wholesale:"جملة",distributor:"موزع",special:"خاص",tier1:"عميل فئة أولى"},c=e.expiryDate&&e.expiryDate<U()&&e.status!=="accepted"&&e.status!=="converted",r=Object.entries(ht).filter(([h])=>h!=="converted").map(([h,y])=>`<button class="btn btn-sm ${e.status===h?"btn-primary":"btn-secondary"}"
      onclick="updateQuoteStatus('${e.id}','${h}')">${y.label}</button>`).join(""),u=document.getElementById("qt-view-body");if(!u)return;const g=window._quoteTaxViewMode||"detailed",p=Et(e.items||[],e.extraDiscountType,e.extraDiscountVal),m=e.markupPct!==void 0&&e.markupPct!==null?parseFloat(e.markupPct):p.markupPct,x=e.marginPct!==void 0&&e.marginPct!==null?parseFloat(e.marginPct):p.marginPct,f=e.totalCost!==void 0&&e.totalCost!==null?parseFloat(e.totalCost):p.totalCost,d=e.totalProfit!==void 0&&e.totalProfit!==null?parseFloat(e.totalProfit):p.totalProfit,l=d>=0;u.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px;margin-bottom:16px;background:var(--bg-2);padding:12px 14px;border-radius:10px;border:1px solid var(--border-soft);">
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">رقم العرض</div>
        <div class="mono text-indigo font-bold" style="font-size:15px;">${e.quoteNumber}</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">الحالة</div>
        ${Pt(e.status)}
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">التاريخ</div>
        <div style="font-weight:600;">${V(e.date)}</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">تاريخ الصلاحية</div>
        <div class="${c?"text-bad font-bold":""}" style="font-weight:600;">${V(e.expiryDate)}</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">العميل</div>
        <div class="font-semibold" style="font-size:13px;color:var(--text-1);">${e.customerName}</div>
        ${e.deliveryAddress?`<div style="font-size:11px;color:var(--text-2);">📍 ${e.deliveryAddress}</div>`:""}
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">المندوب</div>
        <div style="font-weight:600;">${e.repName||"—"}</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">قائمة الأسعار</div>
        <div style="font-weight:600;">${a[e.priceList]||e.priceList||"—"}</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">شروط الدفع</div>
        <div style="font-weight:600;">${i[e.paymentTerms]||e.paymentTerms||"—"}</div>
      </div>
    </div>

    <!-- ── Mode Selector Bar ── -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
      <div style="font-size:13px;font-weight:800;color:var(--text-1);display:flex;align-items:center;gap:6px;">
        <span>📦 بنود وقائمة أسعار العرض:</span>
        <span style="font-size:11.5px;color:var(--text-2);font-weight:normal;">(${e.items?.length||0} صنف)</span>
      </div>
      <div style="display:flex;align-items:center;gap:4px;background:var(--bg-2);padding:3px;border-radius:99px;border:1px solid var(--border-soft);">
        <button type="button" id="qt-tax-btn-detailed" class="btn btn-xs qt-tax-mode-btn ${g==="detailed"?"btn-primary":"btn-secondary"}" style="border-radius:99px;font-size:11px;padding:4px 10px;" onclick="setQuoteViewTaxMode('detailed')">تفصيلي (قبل وبعد الضريبة)</button>
        <button type="button" id="qt-tax-btn-inclusive" class="btn btn-xs qt-tax-mode-btn ${g==="inclusive"?"btn-primary":"btn-secondary"}" style="border-radius:99px;font-size:11px;padding:4px 10px;" onclick="setQuoteViewTaxMode('inclusive')">شامل الضريبة فقط</button>
        <button type="button" id="qt-tax-btn-exclusive" class="btn btn-xs qt-tax-mode-btn ${g==="exclusive"?"btn-primary":"btn-secondary"}" style="border-radius:99px;font-size:11px;padding:4px 10px;" onclick="setQuoteViewTaxMode('exclusive')">غير شامل فقط</button>
      </div>
    </div>

    <div class="table-container mb-16" id="qt-view-table-container">
      ${ie(e,g)}
    </div>

    <div style="display:flex;justify-content:flex-end;gap:14px;margin-bottom:14px;flex-wrap:wrap;">
      <!-- Internal Profitability Analysis (Management Only - No Print) -->
      <div class="no-print" style="width:340px;border:1.5px solid rgba(16,185,129,0.35);background:linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(59,130,246,0.05) 100%);border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px dashed rgba(16,185,129,0.3);background:rgba(16,185,129,0.08);">
          <span style="font-size:12px;font-weight:800;color:#047857;display:flex;align-items:center;gap:5px;">
            <span>📊</span> مؤشرات الربحية (خاص بالإدارة - لا يُطبع)
          </span>
          <span class="badge" style="background:${l?"#059669":"#dc2626"};color:#fff;font-weight:800;font-size:11.5px;padding:3px 8px;border-radius:6px;font-family:monospace;">
            ${m>=0?"+":""}${m.toFixed(2)}%
          </span>
        </div>
        <div style="padding:10px 14px;display:flex;flex-direction:column;gap:7px;">
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;">
            <span style="color:var(--text-2);">إجمالي التكلفة التقديرية:</span>
            <span class="mono font-semibold" style="color:var(--text-1);">${w(f)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:700;color:${l?"#059669":"#dc2626"};">
            <span>إجمالي الربح قبل الضريبة:</span>
            <span class="mono font-bold" style="font-size:13px;">${w(d)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:800;color:${l?"#047857":"#dc2626"};padding-top:6px;border-top:1px solid rgba(16,185,129,0.2);">
            <span title="نسبة الربح المجمع قبل الضريبة على التكلفة = (إجمالي الربح قبل الضريبة ÷ إجمالي التكلفة) × 100">هامش الربح الإجمالي قبل الضريبة (على التكلفة):</span>
            <span class="mono font-black" style="font-size:13.5px;">${m>=0?"+":""}${m.toFixed(2)}%</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--text-2);">
            <span title="نسبة الربح قبل الضريبة من إجمالي المبيعات = (إجمالي الربح قبل الضريبة ÷ المجموع الفرعي) × 100">نسبة الهامش قبل الضريبة (من المبيعات):</span>
            <span class="mono font-bold">${x>=0?"+":""}${x.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <!-- Customer Document Totals Box -->
      <div style="width:340px;border:1.5px solid var(--border-soft);border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        <div style="display:flex;justify-content:space-between;padding:8px 14px;border-bottom:1px solid var(--border-soft);background:#fff;">
          <span style="font-size:12px;color:var(--text-2);">المجموع الصافي (غير شامل الضريبة)</span>
          <span class="mono font-bold">${w(e.subtotal||e.grossTotal||0)}</span>
        </div>
        ${e.discountTotal>0?`<div style="display:flex;justify-content:space-between;padding:8px 14px;border-bottom:1px solid var(--border-soft);background:#fff;">
          <span style="font-size:12px;color:var(--text-2);">إجمالي الخصم</span>
          <span class="mono text-bad font-bold">- ${w(e.discountTotal||0)}</span></div>`:""}
        <div style="display:flex;justify-content:space-between;padding:8px 14px;border-bottom:1px solid var(--border-soft);background:rgba(217,119,6,0.06);">
          <span style="font-size:12px;color:#92400e;font-weight:700;">ضريبة القيمة المضافة (15%)</span>
          <span class="mono font-bold" style="color:#b45309;">${w(e.totalVat||0)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:12px 14px;background:var(--bg-2);">
          <span style="font-size:13.5px;font-weight:800;color:var(--text-1);">الإجمالي النهائي (شامل الضريبة)</span>
          <span class="mono text-brand font-bold" style="font-size:16px;">${w(e.grandTotal||0)}</span>
        </div>
      </div>
    </div>

    ${e.notes?`<div style="padding:10px 14px;background:var(--bg-2);border-radius:8px;font-size:12px;color:var(--text-2);margin-bottom:10px;border:1px solid var(--border-soft);">
      <strong>📝 ملاحظات:</strong> ${e.notes}</div>`:""}

    <div style="padding:10px 14px;background:var(--bg-2);border-radius:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;border:1px solid var(--border-soft);">
      <span style="font-size:12px;color:var(--text-2);font-weight:700;">تحديث الحالة:</span>
      ${r}
    </div>`,window._currentViewQuote=e,openModal("qt-view-modal")};window.printQuoteFromView=()=>{window._currentViewQuote&&printQuote(window._currentViewQuote.id)};window.printQuoteFromForm=async()=>{if(!v||!v.length){showToast("⚠️ أضف صنفاً واحداً على الأقل لمعاينة الطباعة","warn");return}const t=document.getElementById("qt-extra-disc-type")?.value||"none",n=parseFloat(document.getElementById("qt-extra-disc-val")?.value)||0,e=Et(v,t,n),o=document.getElementById("qt-rep"),s={id:rt||"temp_preview",quoteNumber:(document.getElementById("qt-number")?.value||"").trim()||"مسودة",date:document.getElementById("qt-date")?.value||U(),expiryDate:document.getElementById("qt-expiry")?.value||"",customerName:document.getElementById("qt-customer-search")?.value||document.getElementById("qt-customer-name-val")?.value||"عميل عام",customerId:document.getElementById("qt-customer-id")?.value||"general",deliveryAddress:document.getElementById("qt-delivery-address")?.value||"",repName:o?.options[o?.selectedIndex]?.dataset?.name||"",paymentTerms:document.getElementById("qt-payment-terms")?.value||"cash",priceList:document.getElementById("qt-pricelist")?.value||"standard",notes:document.getElementById("qt-notes")?.value||"",terms:document.getElementById("qt-terms")?.value||"صلاحية العرض: 30 يوماً من تاريخه. الأسعار شاملة ضريبة القيمة المضافة 15%. يُعدّ هذا العرض ملزماً عند قبوله.",items:v,grossTotal:e.grossTotal,discountTotal:e.totalDiscount,subtotal:e.subtotal,totalVat:e.vat,grandTotal:e.grandTotal};return window.printQuoteObject(s)};window.convertQuoteToInvoiceFromView=()=>{window._currentViewQuote&&convertQuoteToInvoice(window._currentViewQuote.id)};window.shareQuoteWhatsApp=()=>{const t=window._currentViewQuote;if(!t)return;const n={cash:"نقداً",net30:"30 يوم",net60:"60 يوم",custom:"حسب الاتفاق"},e=(t.items||[]).map((s,i)=>{const a=parseFloat(s.qty)||0,c=parseFloat(s.unitPrice)||0,r=s.taxCategory==="E"||s.taxCategory==="Z"?0:.15,u=Math.round(c*(1+r)*100)/100,g=a*c,p=g*(parseFloat(s.discount)||0)/100,m=g-p,x=Math.round(m*(1+r)*100)/100;return`${i+1}. *${s.productName}*
   الكمية: ${O(a)} ${s.unit||"كرتون"} × ${w(u)} (شامل 15%) = *${w(x)}*`}).join(`
`),o=["*📋 عرض سعر من إدهام للمواد الغذائية*",`رقم العرض: ${t.quoteNumber}`,`التاريخ: ${V(t.date)}`,`صالح حتى: ${V(t.expiryDate)}`,`العميل: ${t.customerName}`,`شروط الدفع: ${n[t.paymentTerms]||"—"}`,"─────────────────","*📦 تفاصيل الأصناف والأسعار (شاملة الضريبة):*",e,"─────────────────",`المجموع الصافي (غير شامل): ${w(t.subtotal||t.grossTotal||0)}`,t.discountTotal>0?`إجمالي الخصم: - ${w(t.discountTotal||0)}`:"",`ضريبة القيمة المضافة (15%): ${w(t.totalVat||0)}`,`*💰 الإجمالي النهائي المطلوب: ${w(t.grandTotal||0)}*`,"─────────────────",t.notes?`ملاحظات: ${t.notes}
─────────────────`:"","نشكركم لتعاملكم معنا 🙏"].filter(Boolean).join(`
`);window.open(`https://wa.me/?text=${encodeURIComponent(o)}`,"_blank")};window.updateQuoteStatus=async(t,n)=>{const e=ht[n]?.label||n;if(await showConfirm(`تغيير حالة العرض إلى "${e}"؟`,"تحديث الحالة"))try{await Bt("quotations",t,{status:n}),showToast(`تم تحديث الحالة إلى: ${e}`,"success");const o=C.findIndex(s=>s.id===t);o!==-1&&(C[o].status=n),filterQuotes(),window._currentViewQuote?.id===t&&(window._currentViewQuote.status=n,viewQuote(t))}catch(o){showToast(o.message,"error")}};window.deleteQuote=async(t,n)=>{if(await showConfirm(`حذف عرض السعر رقم "${n||t}"؟ لا يمكن التراجع عن هذا الإجراء.`,"تأكيد الحذف"))try{await Gt("quotations",t),showToast("تم حذف عرض السعر","success"),C=C.filter(e=>e.id!==t),filterQuotes()}catch(e){showToast(e.message,"error")}};window.convertQuoteToInvoice=async t=>{const n=C.find(e=>e.id===t);if(n){if(n.status==="converted"){showToast("تم تحويل هذا العرض مسبقاً","warn");return}if(await showConfirm(`تحويل العرض "${n.quoteNumber}" إلى فاتورة مبيعات جديدة?
سيُغَيَّر وضع العرض إلى "مُفوتَر".`,"تحويل لفاتورة"))try{sessionStorage.setItem("convert_quote",JSON.stringify({quoteId:n.id,quoteNumber:n.quoteNumber,customerId:n.customerId,customerName:n.customerName,repId:n.repId,repName:n.repName,warehouseId:n.warehouseId||"",items:(n.items||[]).map(o=>({productId:o.productId,productName:o.productName,unit:o.unit||"PCS",unitCode:"PCE",taxCategory:"S",qty:o.qty,unitPrice:o.unitPrice,discount:o.discount||0})),notes:n.notes||""})),await Bt("quotations",t,{status:"converted",convertedAt:new Date().toISOString()});const e=C.findIndex(o=>o.id===t);e!==-1&&(C[e].status="converted"),filterQuotes(),closeModal("qt-view-modal"),showToast("تم التحويل. افتح وحدة فواتير المبيعات لاستكمال الإنشاء.","success"),typeof navigate=="function"&&navigate("sales-invoices")}catch(e){showToast(e.message,"error")}}};window.printQuote=async t=>{const n=C.find(e=>e.id===t);if(!n){showToast("العرض غير موجود","error");return}return window.printQuoteObject(n)};window.printQuoteObject=async t=>{if(!t)return;let n="";const e={name:"شركة نظم الإمداد المتطورة",vatNumber:"314996148100003",address:"مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414",phone:"0549141648",email:"Nuzmalamdad@gmail.com"};try{const{getDoc:r,doc:u}=await mt(async()=>{const{getDoc:f,doc:d}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:f,doc:d}},[]),g=u(et,`companies/${ot}/settings`,"company"),p=u(et,`companies/${ot}/settings`,"logo"),[m,x]=await Promise.all([r(g),r(p)]);if(m.exists()){const f=m.data();f.name&&(e.name=f.name),f.vatNumber&&(e.vatNumber=f.vatNumber),f.address&&(e.address=f.address),f.phone&&(e.phone=f.phone),f.email&&(e.email=f.email)}x.exists()&&(n=x.data().dataUrl||"")}catch(r){console.warn("Failed to load company settings for print:",r)}const o={cash:"نقداً",net30:"30 يوم",net60:"60 يوم",custom:"حسب الاتفاق"},s={standard:"عادي",wholesale:"جملة",distributor:"موزع",special:"خاص",tier1:"عميل فئة أولى"},i=window._quoteTaxViewMode||"detailed",a=(t.items||[]).map((r,u)=>{const g=parseFloat(r.qty)||0,p=parseFloat(r.unitPrice)||0,m=r.taxCategory==="E"||r.taxCategory==="Z"?0:.15,x=Math.round(p*m*100)/100,f=Math.round((p+x)*100)/100,d=g*p,l=parseFloat(r.discount)||0,h=d*l/100,y=d-h,b=Math.round(y*m*100)/100,k=Math.round((y+b)*100)/100,E=!!r.isCustom||String(r.productId||"").startsWith("adhoc_"),N=r.sku&&r.sku!=="بند حر"&&!r.sku.startsWith("adhoc_")&&!E;return`
      <tr>
        <td style="text-align:center; font-weight:700; color:#475569; font-size:11px;">${u+1}</td>
        <td style="padding:8px 10px;">
          <div style="font-size:12px; font-weight:700; color:#0f172a; line-height:1.4;">${r.productName}</div>
          ${N?`<div style="color:#64748b; font-size:9.5px; font-family:monospace; margin-top:1px;">كود: ${r.sku}</div>`:""}
        </td>
        <td style="text-align:center; font-weight:600; color:#334155; font-size:11px;">${r.unit||"كرتون"}</td>
        <td style="text-align:center; font-weight:800; color:#0f172a; font-size:12px;" class="mono">${O(g)}</td>
        <td style="text-align:left; font-weight:700; color:#0f172a; font-size:11.5px;" class="col-ex-price mono">${w(p)}</td>
        <td style="text-align:center; color:#b45309; font-weight:700; font-size:11.5px;" class="col-vat-amt mono">${w(x)}</td>
        <td style="text-align:left; font-weight:800; font-size:12px;" class="col-inc-price mono">
          <span style="background:rgba(30,58,138,0.08);padding:2px 6px;border-radius:4px;color:#1e3a8a;display:inline-block;">${w(f)}</span>
        </td>
        <td style="text-align:center; color:#64748b; font-size:11px;" class="col-disc mono">${l?`<span style="color:#dc2626;font-weight:700;">${l}%</span>`:"—"}</td>
        <td style="text-align:left; font-weight:800; color:#0f766e; font-size:12px;" class="col-ex-total mono">${w(y)}</td>
        <td style="text-align:left; font-weight:900; color:#0f766e; font-size:12.5px;" class="col-inc-total mono">${w(k)}</td>
      </tr>`}).join(""),c=window.open("","_blank");if(!c){showToast("يرجى السماح بالنوافذ المنبثقة للطباعة","warn");return}c.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>عرض سعر ${t.quoteNumber||""}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'IBM Plex Sans Arabic','Cairo',sans-serif;direction:rtl;color:#1e293b;background:#f1f5f9;font-size:12px;line-height:1.5;}

    /* ─── Toolbar ─── */
    .no-print{display:flex;gap:10px;justify-content:space-between;align-items:center;padding:10px 24px;background:#fff;border-bottom:2px solid #e2e8f0;position:sticky;top:0;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,0.08);flex-wrap:wrap;}
    .toolbar-modes{display:flex;align-items:center;gap:6px;background:#f8fafc;padding:4px 8px;border-radius:10px;border:1px solid #cbd5e1;}
    .toolbar-label{font-size:12px;font-weight:700;color:#334155;margin-left:6px;}
    .btn-mode{background:#fff;color:#475569;border:1px solid #cbd5e1;padding:6px 12px;border-radius:8px;cursor:pointer;font-family:inherit;font-size:12px;font-weight:700;transition:all 0.15s;}
    .btn-mode:hover{background:#f1f5f9;border-color:#94a3b8;}
    .btn-mode.active{background:#1e40af;color:#fff;border-color:#1e40af;box-shadow:0 2px 6px rgba(30,64,175,0.35);}
    .toolbar-actions{display:flex;align-items:center;gap:8px;}
    .btn{padding:8px 18px;border-radius:8px;cursor:pointer;border:none;font-family:inherit;font-size:12.5px;font-weight:700;transition:all 0.2s;display:inline-flex;align-items:center;gap:6px;}
    .btn-blue{background:linear-gradient(135deg,#1e40af,#2563eb);color:#fff;box-shadow:0 3px 10px rgba(37,99,235,0.35);}
    .btn-blue:hover{background:linear-gradient(135deg,#1e3a8a,#1d4ed8);transform:translateY(-1px);}
    .btn-green{background:linear-gradient(135deg,#047857,#059669);color:#fff;box-shadow:0 3px 10px rgba(5,150,105,0.3);}
    .btn-green:hover{transform:translateY(-1px);}
    .btn-gray{background:#64748b;color:#fff;}
    .btn-gray:hover{background:#475569;}

    /* ─── Mode display rules ─── */
    body.mode-detailed .col-ex-price { display: table-cell !important; }
    body.mode-detailed .col-vat-amt  { display: table-cell !important; }
    body.mode-detailed .col-inc-price{ display: table-cell !important; background: rgba(30,58,138,0.04); font-weight: 800; color: #1e3a8a; }
    body.mode-detailed .col-disc     { display: table-cell !important; }
    body.mode-detailed .col-ex-total { display: none !important; }
    body.mode-detailed .col-inc-total{ display: table-cell !important; }
    body.mode-detailed .tax-note-inc { display: none !important; }

    body.mode-inclusive .col-ex-price { display: none !important; }
    body.mode-inclusive .col-vat-amt  { display: none !important; }
    body.mode-inclusive .col-inc-price{ display: table-cell !important; font-weight: 800; color: #1e3a8a; }
    body.mode-inclusive .col-disc     { display: table-cell !important; }
    body.mode-inclusive .col-ex-total { display: none !important; }
    body.mode-inclusive .col-inc-total{ display: table-cell !important; }
    body.mode-inclusive .tax-note-inc { display: block !important; }

    body.mode-exclusive .col-ex-price { display: table-cell !important; }
    body.mode-exclusive .col-vat-amt  { display: none !important; }
    body.mode-exclusive .col-inc-price{ display: none !important; }
    body.mode-exclusive .col-disc     { display: table-cell !important; }
    body.mode-exclusive .col-ex-total { display: table-cell !important; }
    body.mode-exclusive .col-inc-total{ display: none !important; }
    body.mode-exclusive .tax-note-inc { display: none !important; }

    /* ─── Page ─── */
    .page{width:210mm;margin:12px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12);}

    /* ─── Dark Navy Header (matches logo color) ─── */
    .header-band{
      background:linear-gradient(135deg,#040d1f 0%,#0a1d4a 45%,#0f2d6b 100%);
      padding:20px 28px;
      position:relative;
      overflow:hidden;
    }
    .header-band::before{content:"";position:absolute;top:-60px;left:-60px;width:220px;height:220px;background:rgba(255,255,255,0.04);border-radius:50%;}
    .header-band::after{content:"";position:absolute;bottom:-80px;right:30px;width:270px;height:270px;background:rgba(255,255,255,0.03);border-radius:50%;}
    /* 3-column header layout */
    .header-grid{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:20px;position:relative;z-index:1;}
    /* Logo box */
    .logo-box{background:#fff;border-radius:12px;padding:8px 12px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.25);min-width:90px;min-height:80px;}
    .co-logo{max-height:80px;max-width:140px;object-fit:contain;display:block;}
    /* Company info (center) */
    .co-section{text-align:center;}
    .co-name{font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.3px;margin-bottom:6px;text-shadow:0 2px 8px rgba(0,0,0,0.3);}
    .co-line{font-size:10.5px;color:rgba(255,255,255,0.8);margin-bottom:3px;display:flex;align-items:center;justify-content:center;gap:5px;}
    /* Doc details (left in RTL = left side) */
    .doc-section{text-align:center;min-width:160px;}
    .doc-title-badge{
      background:rgba(255,255,255,0.14);
      border:2px solid rgba(255,255,255,0.3);
      border-radius:12px;
      padding:8px 18px;
      margin-bottom:10px;
      backdrop-filter:blur(8px);
    }
    .doc-title-ar{font-size:19px;font-weight:900;color:#fff;letter-spacing:2px;}
    .doc-title-en{font-size:9.5px;color:rgba(255,255,255,0.55);font-weight:400;margin-top:2px;letter-spacing:1.5px;}
    .doc-num-row{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:5px;}
    .doc-num-label{font-size:10px;color:rgba(255,255,255,0.6);}
    .doc-num-val{font-size:17px;font-weight:900;color:#fbbf24;font-family:monospace;letter-spacing:1.5px;}
    .doc-date-row{font-size:10.5px;color:rgba(255,255,255,0.78);text-align:center;margin-bottom:3px;}

    /* ─── Info Cards Strip ─── */
    .info-strip{display:grid;grid-template-columns:repeat(5,1fr);border-bottom:2px solid #e2e8f0;}
    .info-card{padding:10px 14px;border-left:1px solid #e2e8f0;background:#f8fafc;display:flex;align-items:flex-start;gap:8px;}
    .info-card:first-child{border-left:none;}
    .info-card:nth-child(even){background:#eef2ff;}
    .info-icon{font-size:18px;line-height:1;flex-shrink:0;margin-top:1px;}
    .info-label{font-size:9px;color:#64748b;font-weight:700;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.4px;}
    .info-val{font-size:11.5px;font-weight:700;color:#1e293b;}

    /* ─── Content ─── */
    .page-body{padding:16px 20px 14px;}

    /* ─── Table ─── */
    table{width:100%;border-collapse:collapse;font-size:11.5px;border-radius:8px;overflow:hidden;border:1px solid #cbd5e1;}
    thead tr{background:linear-gradient(90deg,#040d1f,#0f2d6b);}
    th{padding:10px 12px;color:#fff;font-weight:700;font-size:11px;text-align:right;border:none;letter-spacing:0.3px;}
    th:first-child{text-align:center;width:40px;}
    tbody tr:nth-child(even) td{background:#f8fafc;}
    tbody tr:nth-child(odd) td{background:#fff;}
    tbody tr:last-child td{border-bottom:none;}
    td{padding:8px 12px;border:none;border-bottom:1px solid #e2e8f0;color:#1e293b;vertical-align:middle;}
    td:first-child{text-align:center;color:#64748b;font-size:11px;}
    .td-num{text-align:left;font-family:monospace;}
    .td-center{text-align:center;}
    .td-net{color:#0f766e;font-weight:700;font-family:monospace;}

    /* ─── Totals ─── */
    .totals-wrap{display:flex;justify-content:flex-end;margin-top:14px;}
    .totals-box{width:320px;border-radius:10px;overflow:hidden;border:1px solid #dde6f0;box-shadow:0 2px 8px rgba(0,0,0,0.07);}
    .tot-row{display:flex;justify-content:space-between;align-items:center;padding:7px 14px;border-bottom:1px solid #e8eef6;background:#fff;}
    .tot-row:nth-child(even){background:#f8fafc;}
    .tot-label{font-size:11px;color:#475569;}
    .tot-val{font-size:12px;font-family:monospace;font-weight:700;color:#1e293b;}
    .tot-row.vat{background:#fffbeb;}
    .tot-row.vat .tot-label{color:#92400e;font-weight:600;}
    .tot-row.vat .tot-val{color:#b45309;}
    .tot-row.grand{background:linear-gradient(90deg,#040d1f,#0f2d6b);border-bottom:none;}
    .tot-row.grand .tot-label{font-size:13px;font-weight:800;color:#fff;}
    .tot-row.grand .tot-val{font-size:16px;font-weight:900;color:#fbbf24;}
    .tot-disc-val{color:#dc2626;font-family:monospace;font-weight:700;font-size:12px;}

    /* ─── Notes & Terms ─── */
    .notes-box{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:9px 14px;margin-top:12px;}
    .notes-title{font-size:10px;color:#92400e;font-weight:800;margin-bottom:3px;}
    .notes-text{font-size:11px;color:#78350f;line-height:1.5;}
    .terms-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:9px 14px;margin-top:8px;}
    .terms-title{font-size:10px;color:#166534;font-weight:800;margin-bottom:3px;}
    .terms-text{font-size:10.5px;color:#166534;line-height:1.5;}

    /* ─── Signatures ─── */
    .sig-section{display:grid;grid-template-columns:1fr auto 1fr;gap:20px;margin-top:18px;align-items:end;}
    .sig-box{text-align:center;}
    .sig-line{border-top:1.5px dashed #94a3b8;padding-top:6px;margin-top:30px;}
    .sig-label{font-size:10.5px;color:#64748b;font-weight:600;}
    .qr-ph{width:64px;height:64px;border:1.5px dashed #cbd5e1;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:8px;background:#f8fafc;margin:0 auto;}
    .qr-label{font-size:8.5px;color:#94a3b8;margin-top:3px;text-align:center;}

    /* ─── Footer ─── */
    .footer-band{
      background:linear-gradient(90deg,#040d1f,#0a1d4a);
      padding:9px 22px;
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-top:16px;
    }
    .footer-text{font-size:10px;color:rgba(255,255,255,0.68);}
    .footer-brand{font-size:11px;font-weight:700;color:rgba(255,255,255,0.9);}

    /* ─── Print ─── */
    @page{size:A4 portrait;margin:5mm 7mm;}
    @media print{
      body{background:#fff!important;}
      .no-print{display:none!important;}
      .page{margin:0!important;border-radius:0!important;box-shadow:none!important;width:100%!important;}
      *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
      tr{page-break-inside:avoid;}
    }
  </style>
</head>
<body class="mode-${i}">
  <div class="no-print">
    <div class="toolbar-modes">
      <span class="toolbar-label">نمط العرض والطباعة:</span>
      <button type="button" id="btn-mode-detailed" class="btn-mode ${i==="detailed"?"active":""}" onclick="setPrintMode('detailed')">تفصيلي (شامل وغير شامل)</button>
      <button type="button" id="btn-mode-inclusive" class="btn-mode ${i==="inclusive"?"active":""}" onclick="setPrintMode('inclusive')">شامل الضريبة فقط (15%)</button>
      <button type="button" id="btn-mode-exclusive" class="btn-mode ${i==="exclusive"?"active":""}" onclick="setPrintMode('exclusive')">غير شامل فقط</button>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-blue" onclick="window.print()">🖨️ طباعة العرض</button>
      <button class="btn btn-green" onclick="window.print()">📥 حفظ PDF</button>
      <button class="btn btn-gray" onclick="window.close()">✕ إغلاق</button>
    </div>
  </div>

  <div class="page">
    <!-- ══ ROYAL BLUE HEADER ══ -->
    <div class="header-band">
      <div class="header-grid">
        ${n?`<div class="logo-box"><img class="co-logo" src="${n}" alt="الشعار"></div>`:'<div class="logo-box" style="font-size:28px;color:#1e3a8a;">🏢</div>'}
        <div class="co-section">
          <div class="co-name">${e.name}</div>
          <div class="co-line">🏠 ${e.address}</div>
          <div class="co-line">📞 ${e.phone} &nbsp;|&nbsp; ✉️ ${e.email}</div>
          <div class="co-line">🧾 الرقم الضريبي: <strong style="color:#fbbf24;margin-right:3px;">${e.vatNumber}</strong></div>
        </div>
        <div class="doc-section">
          <div class="doc-title-badge">
            <div class="doc-title-ar">عـرض سـعـر</div>
            <div class="doc-title-en">PRICE QUOTATION</div>
          </div>
          <div class="doc-num-row">
            <span class="doc-num-label">📋 رقم:</span>
            <span class="doc-num-val">${t.quoteNumber||""}</span>
          </div>
          <div class="doc-date-row">📅 التاريخ: <strong style="color:#fff;">${V(t.date)}</strong></div>
          <div class="doc-date-row" style="margin-top:3px;">✅ صالح حتى: <strong style="color:#fbbf24;">${V(t.expiryDate)}</strong></div>
        </div>
      </div>
    </div>

    <!-- ══ INFO CARDS STRIP ══ -->
    <div class="info-strip">
      <div class="info-card">
        <span class="info-icon">👤</span>
        <div>
          <div class="info-label">العميل</div>
          <div class="info-val">${t.customerName||"—"}</div>
          ${t.deliveryAddress?`<div style="font-size:9.5px;color:#64748b;margin-top:1px;">📍 ${t.deliveryAddress}</div>`:""}
        </div>
      </div>
      <div class="info-card">
        <span class="info-icon">🧑‍💼</span>
        <div>
          <div class="info-label">المندوب</div>
          <div class="info-val">${t.repName||"—"}</div>
        </div>
      </div>
      <div class="info-card">
        <span class="info-icon">💳</span>
        <div>
          <div class="info-label">شروط الدفع</div>
          <div class="info-val">${o[t.paymentTerms]||t.paymentTerms||"—"}</div>
        </div>
      </div>
      <div class="info-card">
        <span class="info-icon">🏷️</span>
        <div>
          <div class="info-label">قائمة الأسعار</div>
          <div class="info-val">${s[t.priceList]||t.priceList||"—"}</div>
        </div>
      </div>
      <div class="info-card">
        <span class="info-icon">📊</span>
        <div>
          <div class="info-label">الحالة</div>
          <div class="info-val" style="color:#1d4ed8;">${ht[t.status]?.label||t.status||"—"}</div>
        </div>
      </div>
    </div>

    <!-- ══ TABLE ══ -->
    <div class="page-body">
      <table>
        <thead>
          <tr>
            <th style="width:26px;text-align:center;">#</th>
            <th>الصنف والوصف</th>
            <th style="width:46px;" class="td-center">الوحدة</th>
            <th style="width:50px;" class="td-center">الكمية</th>
            <th style="width:88px;" class="col-ex-price td-num">السعر (غير شامل)</th>
            <th style="width:74px;" class="col-vat-amt td-center">الضريبة (15%)</th>
            <th style="width:105px;" class="col-inc-price td-num">السعر (شامل 15%)</th>
            <th style="width:46px;" class="col-disc td-center">خصم%</th>
            <th style="width:105px;" class="col-ex-total td-num">الإجمالي (غير شامل)</th>
            <th style="width:115px;" class="col-inc-total td-num">الإجمالي شامل الضريبة</th>
          </tr>
        </thead>
        <tbody>${a}</tbody>
      </table>
      <div class="tax-note-inc" style="font-size:10.5px;color:#64748b;margin-top:6px;font-style:italic;">* جميع أسعار الأصناف المعروضة بالجدول أعلاه شاملة ضريبة القيمة المضافة 15%.</div>

      <!-- ══ TOTALS ══ -->
      <div class="totals-wrap">
        <div class="totals-box">
          <div class="tot-row">
            <span class="tot-label">المجموع (غير شامل الضريبة)</span>
            <span class="tot-val">${w(t.grossTotal||t.subtotal||0)}</span>
          </div>
          ${t.discountTotal>0?`
          <div class="tot-row">
            <span class="tot-label">إجمالي الخصم</span>
            <span class="tot-disc-val">- ${w(t.discountTotal||0)}</span>
          </div>
          <div class="tot-row">
            <span class="tot-label">الصافي بعد الخصم</span>
            <span class="tot-val">${w(t.subtotal||0)}</span>
          </div>`:""}
          <div class="tot-row vat">
            <span class="tot-label">⚡ ضريبة القيمة المضافة (15%)</span>
            <span class="tot-val" style="color:#b45309;">${w(t.totalVat||0)}</span>
          </div>
          <div class="tot-row grand">
            <span class="tot-label">💰 الإجمالي النهائي (شامل الضريبة)</span>
            <span class="tot-val">${w(t.grandTotal||0)}</span>
          </div>
        </div>
      </div>

      ${t.notes?`<div class="notes-box"><div class="notes-title">📝 ملاحظات</div><div class="notes-text">${t.notes}</div></div>`:""}
      ${t.terms?`<div class="terms-box"><div class="terms-title">📋 الشروط والأحكام</div><div class="terms-text">${t.terms}</div></div>`:""}

      <!-- ══ SIGNATURES ══ -->
      <div class="sig-section">
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-label">توقيع مُعِدّ العرض</div>
        </div>
        <div style="text-align:center;">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&color=1e3a8a&data=${encodeURIComponent(`${e.name}
هاتف: ${e.phone}
إيميل: ${e.email}
الرقم الضريبي: ${e.vatNumber}
${e.address}`)}"
            alt="QR"
            style="width:90px;height:90px;border-radius:6px;border:2px solid #dde6f0;"
          >
          <div style="font-size:8.5px;color:#64748b;margin-top:4px;">معلومات الشركة</div>
        </div>
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-label">توقيع واعتماد العميل</div>
        </div>
      </div>
    </div>

    <!-- ══ FOOTER BAND ══ -->
    <div class="footer-band">
      <span class="footer-text">نشكركم لتعاملكم معنا — هذا العرض ملزم عند قبوله خطياً أو إلكترونياً.</span>
      <span class="footer-brand">${e.name}</span>
    </div>
  </div>

  <script>
    function setPrintMode(mode) {
      document.body.classList.remove('mode-detailed', 'mode-inclusive', 'mode-exclusive');
      document.body.classList.add('mode-' + mode);
      document.querySelectorAll('.btn-mode').forEach(function(b){ b.classList.remove('active'); });
      var el = document.getElementById('btn-mode-' + mode);
      if (el) el.classList.add('active');
    }
  <\/script>
</body>
</html>`),c.document.close()};window.exportQuotesCSV=()=>{try{const t=[["رقم العرض","التاريخ","الصلاحية","العميل","المندوب","الأصناف","إجمالي قبل خصم","الخصم","ما بعد الخصم","الضريبة","الإجمالي","الحالة"]];for(const o of C)t.push([o.quoteNumber||"",o.date||"",o.expiryDate||"",o.customerName||"",o.repName||"",(o.items||[]).length,o.grossTotal||0,o.discountTotal||0,o.subtotal||0,o.totalVat||0,o.grandTotal||0,ht[o.status]?.label||o.status||""]);const n=t.map(o=>o.map(s=>`"${String(s).replace(/"/g,'""')}"`).join(",")).join(`
`),e=document.createElement("a");e.href=URL.createObjectURL(new Blob(["\uFEFF"+n],{type:"text/csv;charset=utf-8;"})),e.download=`quotations_${U()}.csv`,e.click(),showToast("تم تصدير الملف بنجاح","success")}catch(t){showToast(t.message,"error")}};let R=[];window._importedCustomerName="";let se="file";async function ae(){return window.XLSX?window.XLSX:new Promise((t,n)=>{const e=document.createElement("script");e.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",e.onload=()=>t(window.XLSX),e.onerror=()=>n(new Error("فشل تحميل مكتبة قراءة ملفات Excel")),document.head.appendChild(e)})}async function re(){if(!window.pdfjsLib)return new Promise((t,n)=>{const e=document.createElement("script");e.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js",e.onload=()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js",t()},e.onerror=()=>n(new Error("فشل تحميل مكتبة معالجة الـ PDF")),document.head.appendChild(e)})}function z(t){return t?String(t).trim().replace(/[\u064B-\u065F\u0670]/g,"").replace(/[إأآا]/g,"ا").replace(/ة/g,"ه").replace(/[ىي]/g,"ي").replace(/\bكيلو\b|\bكغ\b/g,"ك").replace(/\bجرام\b|\bغرام\b/g,"جم").replace(/\bقطعة\b|\bقطعه\b/g,"حبة").replace(/[()\[\]{}\-_\/\\.,:;+*="']/g," ").replace(/\s+/g," ").toLowerCase():""}function ut(t){return t?String(t).normalize("NFKC").replace(/[\u0640]/g,""):""}const Pe=[["كرتون",/^(?:كرتون|كرتونه|نوترك|نوترک|نوﺗرك|نوترن|نوترق|نوتر|نووﺗرك|نوﺗرقك|نوسﺗركيك|نوﺗرهكروراق)/],["بالة",/^(?:بالة|باله|ةلاب|هلاب|ةلاﺑ|ﻪلاﺑ)/],["كيس",/^(?:كيس|سيك)/],["تنكة",/^(?:تنكة|تنكه|ﻚنﺗ|ﻪﻜنﺗ|ةﻜنﺗ|تنك)/],["حبة",/^(?:حبة|حبه|هبح|ةبح|ﻪبح|بح)/],["قطعة",/^(?:قطعة|قطعه|عطق|ةعطق|عطقه)/],["بكت",/^(?:بكت|باكت|تﻜﺑ|تكب)/],["علبة",/^(?:علبة|علبه|ةبلع|بلع)/],["جالون",/^(?:جالون|نولاج|ولاج)/],["درزن",/^(?:درزن|نزرد)/]],Wt={بالة:"بالة",باله:"بالة",ةلاب:"بالة",هلاب:"بالة",ةلاﺑ:"بالة",ﻪلاﺑ:"بالة",كرتون:"كرتون",كرتونه:"كرتون",نوترك:"كرتون",نوترک:"كرتون",نوﺗرك:"كرتون",نوترن:"كرتون",نوترق:"كرتون",نوتر:"كرتون",كيس:"كيس",سيك:"كيس",حبة:"حبة",حبه:"حبة",هبح:"حبة",ةبح:"حبة",ﻪبح:"حبة",قطعة:"قطعة",قطعه:"قطعة",عطق:"قطعة",ةعطق:"قطعة",عطقه:"قطعة",شد:"شد",شدة:"شد",دش:"شد",ردشد:"شد",بكت:"بكت",باكت:"بكت",تﻜﺑ:"بكت",تكب:"بكت",علبة:"علبة",علبه:"علبة",ةبلع:"علبة",جالون:"جالون",نولاج:"جالون",درزن:"درزن",نزرد:"درزن"},$e=new Set(["زر","ةزم","هزم","ةميلولا","نوترك","نوترک","نوترك","نوترن","نوترق","نوتر","ةلاب","هلاب","ةلاﺑ","ﻪلاﺑ","سيك","هبح","ةبح","ﻪبح","عطق","ةعطق","عطقه","انوﺗ","انوتا","انوتر","ريبك","ريغص","مارج","دلوق","ةفاكسن","ةفاﻜسن","ةقرم","دش","ردشد","تيزلاب","ضيبا","ضي race","يساورلا","بديهملا","يباجنب","ي race","يﺑاجنﺑ","يرواشب","يرواشﺑ","ةلئاعلا","ساك","وبلا","وبا","و race","وﺑا","يدنه","ىدنه","ابهذ","وكاموا","رئازجلا","ةياف","يرام","يحارلا","ةفايضلا","يلع","وباو","يئاطلا","ةماخفلا","نيهاش","لفاح","زميلب","اينروفلاك","انيردنت","يدوق","ليتس","لياتس","طسو","دوق","فوم","ليك","مارج","ات","ةبلع","بكت"]);function xt(t){if(!t)return!1;const e=ut(t).trim().split(/\s+/);for(const o of e)if(/^[ةـ][\u0621-\u064A]/u.test(o)||/[لا|لإ|لأ|لآ]$/u.test(o)||$e.has(o))return!0;return!1}function Ie(t){if(!t)return"";const n=ut(t).trim();if(!n)return"";if(/^[\d.*xX×\-\/\+()]+$/.test(n))return n;let e=n.split("").reverse().join("");const o={"(":")",")":"(","[":"]","]":"[","{":"}","}":"{","<":">",">":"<","«":"»","»":"«"};return e=e.split("").map(s=>o[s]||s).join(""),e=e.replace(/\d+(\.\d+)?/g,s=>s.split("").reverse().join("")),e}function X(t){if(!t)return"";let n=ut(t).trim();n=n.replace(/\b([تةسهرمول])\s+([^\s\d]+)/gu,"$2$1"),n=n.replace(/([^\s\d]+)\s+([تةسهرمول])\b/gu,"$1$2");let s=n.split(/\s+/).filter(Boolean).map(a=>Ie(a)).join(" ");s=s.replace(/\s*([*xX×])\s*/g," * "),s=s.replace(/\s+/g," ").trim();const i=[[/(?<![\p{L}\p{N}])االسرة(?![\p{L}\p{N}])/gu,"الأسرة"],[/(?<![\p{L}\p{N}])ااسرة(?![\p{L}\p{N}])/gu,"الأسرة"],[/(?<![\p{L}\p{N}])نسكافة(?![\p{L}\p{N}])/gu,"نسكافيه"],[/(?<![\p{L}\p{N}])نوتيال(?![\p{L}\p{N}])/gu,"نوتيلا"],[/(?<![\p{L}\p{N}])كالسيك(?![\p{L}\p{N}])/gu,"كلاسيك"],[/(?<![\p{L}\p{N}])كالفورنيا(?![\p{L}\p{N}])/gu,"كاليفورنيا"],[/(?<![\p{L}\p{N}])المكال(?![\p{L}\p{N}])/gu,"المكلا"],[/(?<![\p{L}\p{N}])نموتو(?![\p{L}\p{N}])/gu,"أجينوموتو"],[/(?<![\p{L}\p{N}])اجي(?![\p{L}\p{N}])/gu,"أجي"],[/(?<![\p{L}\p{N}])اكياس(?![\p{L}\p{N}])/gu,"أكياس"],[/(?<![\p{L}\p{N}])ابيض(?![\p{L}\p{N}])/gu,"أبيض"],[/(?<![\p{L}\p{N}])ابو(?![\p{L}\p{N}])/gu,"أبو"],[/(?<![\p{L}\p{N}])قواريرالوزير(?![\p{L}\p{N}])/gu,"قوارير الوزير"],[/(?<![\p{L}\p{N}])صغيرتايلندي(?![\p{L}\p{N}])/gu,"صغير تايلندي"],[/(?<![\p{L}\p{N}])كبيرتايلندي(?![\p{L}\p{N}])/gu,"كبير تايلندي"],[/(?<![\p{L}\p{N}])(ليك\s*و|ليكو|كيل\s*و|وليك)(?![\p{L}\p{N}])/gu,"كيلو"],[/(?<![\p{L}\p{N}])(جرا\s*م|جرام|مارج)(?![\p{L}\p{N}])/gu,"جرام"],[/(?<![\p{L}\p{N}])(لت\s*ر|لتر|رتل)(?![\p{L}\p{N}])/gu,"لتر"],[/(?<![\p{L}\p{N}])(علب\s*ة|علبة|ةبلع|بلعة)(?![\p{L}\p{N}])/gu,"علبة"],[/(?<![\p{L}\p{N}])(حب\s*ة|حبة|ةبح|هبح|بهح)(?![\p{L}\p{N}])/gu,"حبة"],[/(?<![\p{L}\p{N}])(تنك\s*ه|تنكة|ةكنت|هكنت)(?![\p{L}\p{N}])/gu,"تنكة"],[/(?<![\p{L}\p{N}])(قارور\s*ه|قارورة|هروراق|ةروراق)(?![\p{L}\p{N}])/gu,"قارورة"],[/(?<![\p{L}\p{N}])دلوق(?![\p{L}\p{N}])/gu,"قولد"],[/(?<![\p{L}\p{N}])لياتس(?![\p{L}\p{N}])/gu,"ستايل"],[/(?<![\p{L}\p{N}])تاتكب(?![\p{L}\p{N}])/gu,"بكتات"],[/(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*كيل\s*و(?![\p{L}\p{N}])/gu,"$1 كيلو"],[/(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*لت\s*ر(?![\p{L}\p{N}])/gu,"$1 لتر"],[/(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*علب\s*ة(?![\p{L}\p{N}])/gu,"$1 علبة"],[/(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*حب\s*ة(?![\p{L}\p{N}])/gu,"$1 حبة"],[/(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*بك\s*ت(?![\p{L}\p{N}])/gu,"$1 بكت"],[/(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*كي\s*س(?![\p{L}\p{N}])/gu,"$1 كيس"],[/(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*جرا\s*م(?![\p{L}\p{N}])/gu,"$1 جرام"],[/(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*قارور\s*(?:ك|ه|ة)(?![\p{L}\p{N}])/gu,"$1 قارورة"],[/(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*سط\s*ل(?![\p{L}\p{N}])/gu,"$1 سطل"],[/(?<![\p{L}\p{N}])(\d+(?:\.\d+)?)\s*جالو\s*ن(?![\p{L}\p{N}])/gu,"$1 جالون"],[/(?<![\p{L}\p{N}])فاخر1كيلو(?![\p{L}\p{N}])/gu,"فاخر 1 كيلو"],[/(?<![\p{L}\p{N}])ساسا700(?![\p{L}\p{N}])/gu,"ساسا 700 "],[/(?<![\p{L}\p{N}])كب(?![\p{L}\p{N}])/gu,"بكت"]];for(const[a,c]of i)s=s.replace(a,c);return s.replace(/\s+/gu," ").trim()}window.toggleQuotationExtractedDirection=()=>{Array.isArray(_importParsedItems)&&_importParsedItems.length>0&&(_importParsedItems.forEach(t=>{t.rawName&&(t.rawName=X(t.rawName))}),renderParsedItemsTable(),showToast("تم عكس وتعديل اتجاه نصوص الأصناف بنجاح","info"))};window.toggleSupplierExtractedDirection=()=>{Array.isArray(D)&&D.length>0&&(D.forEach(t=>{t.productName&&(t.productName=X(t.productName))}),nt(),showToast("تم عكس وتعديل اتجاه نصوص الأصناف بنجاح","info"))};window.switchImportTab=t=>{se=t;const n=document.getElementById("import-pane-file"),e=document.getElementById("import-pane-paste"),o=document.getElementById("tab-btn-file"),s=document.getElementById("tab-btn-paste");if(t==="file")n&&n.classList.remove("hidden"),e&&e.classList.add("hidden"),o&&(o.classList.remove("btn-secondary"),o.classList.add("btn-primary")),s&&(s.classList.remove("btn-primary"),s.classList.add("btn-secondary"));else{n&&n.classList.add("hidden"),e&&e.classList.remove("hidden"),s&&(s.classList.remove("btn-secondary"),s.classList.add("btn-primary")),o&&(o.classList.remove("btn-primary"),o.classList.add("btn-secondary"));const i=document.getElementById("qt-import-paste-area");i&&setTimeout(()=>i.focus(),100)}};window.openQuotationImportModal=()=>{R=[],window._importedCustomerName="";const t=document.getElementById("qt-import-error"),n=document.getElementById("qt-import-loading"),e=document.getElementById("qt-import-preview-area"),o=document.getElementById("import-pane-file"),s=document.getElementById("qt-import-submit-btn"),i=document.getElementById("qt-import-reupload-btn"),a=document.getElementById("qt-import-file-input"),c=document.getElementById("qt-import-paste-area");t&&t.classList.add("hidden"),n&&n.classList.add("hidden"),e&&e.classList.add("hidden"),o&&o.classList.remove("hidden"),s&&(s.disabled=!0),i&&(i.style.display="none"),a&&(a.value=""),c&&(c.value="");const r=document.getElementById("qt-import-price-type");r&&(r.value="cost");const u=document.getElementById("qt-import-default-margin");u&&(!u.value||u.value==="0")&&(u.value="10");const g=document.getElementById("qt-import-tax-mode");g&&(g.value="exclusive"),typeof onImportPriceTypeChange=="function"&&onImportPriceTypeChange(!1),switchImportTab("file"),openModal("qt-import-modal")};window.openPdfImportModal=window.openQuotationImportModal;window.resetQuotationImport=()=>{R=[];const t=document.getElementById("qt-import-preview-area"),n=document.getElementById("qt-import-reupload-btn"),e=document.getElementById("qt-import-submit-btn"),o=document.getElementById("qt-import-file-input");t&&t.classList.add("hidden"),n&&(n.style.display="none"),e&&(e.disabled=!0),o&&(o.value=""),switchImportTab(se)};function ft(t){const n=document.getElementById("qt-import-error");n&&(n.textContent=t,n.classList.remove("hidden"));const e=document.getElementById("qt-import-loading");e&&e.classList.add("hidden")}function Mt(t,n="جارٍ قراءة البيانات ومطابقة الأصناف..."){const e=document.getElementById("qt-import-loading"),o=document.getElementById("qt-import-loading-text"),s=document.getElementById("qt-import-error");s&&s.classList.add("hidden"),e&&(t?e.classList.remove("hidden"):e.classList.add("hidden")),o&&n&&(o.textContent=n)}window.handleQuotationFileDrop=t=>{t.preventDefault();const n=t.dataTransfer.files;n.length>0&&de(n[0])};window.handleQuotationFileInput=t=>{const n=t.target.files[0];n&&de(n)};async function de(t){const n=(t.name||"").toLowerCase(),e=n.endsWith(".pdf")||t.type==="application/pdf",o=n.endsWith(".xlsx")||n.endsWith(".xls")||n.endsWith(".csv")||t.type.includes("sheet")||t.type.includes("excel")||t.type.includes("csv");e?await Me(t):o?await Ee(t):ft("نوع الملف غير مدعوم. يرجى اختيار ملف Excel (.xlsx / .xls / .csv) أو ملف PDF.")}async function Ee(t){Mt(!0,"جارٍ قراءة وتحليل ملف الإكسيل ومطابقة الأصناف لغوياً...");try{const n=await ae(),e=new FileReader;e.onload=async o=>{try{const s=new Uint8Array(o.target.result),i=n.read(s,{type:"array"});if(!i.SheetNames||i.SheetNames.length===0)throw new Error("الملف لا يحتوي على أي صفحات عمل (Sheets).");const a=i.SheetNames[0],c=i.Sheets[a],r=n.utils.sheet_to_json(c,{header:1,defval:""}),u=ce(r);At(u)}catch(s){ft(s.message||"حدث خطأ أثناء قراءة ملف الإكسيل")}},e.readAsArrayBuffer(t)}catch(n){ft(n.message)}}window.handlePastedQuotationText=()=>{const n=(document.getElementById("qt-import-paste-area")?.value||"").trim();if(!n){ft("يرجى لصق بيانات الجدول في المربع أولاً.");return}Mt(!0,"جارٍ تحليل النصوص المنسوخة ومطابقة الأصناف...");try{const o=n.split(/\r?\n/).map(i=>i.trim()).filter(Boolean).map(i=>i.split("	").map(a=>a.trim())),s=ce(o);At(s)}catch(e){ft(e.message||"حدث خطأ أثناء تحليل البيانات المنسوخة")}};async function Me(t){Mt(!0,"جارٍ تحليل وقراءة ملف الـ PDF واستخراج البنود...");try{await re();const n=await t.arrayBuffer(),e=await ze(n);if(!e.items||e.items.length===0)throw new Error("لم نتمكن من استخلاص أي أصناف من جدول عرض السعر في ملف الـ PDF. يرجى التأكد من أن الملف يحتوي على جدول أصناف مقروء.");At(e)}catch(n){ft(n.message)}}async function ze(t){const n=await window.pdfjsLib.getDocument({data:t}).promise,e=[];let o="",s=!1,i=!1,a=!1;for(let c=1;c<=n.numPages;c++){const g=((await(await n.getPage(c)).getTextContent()).items||[]).filter(f=>f&&typeof f.str=="string"&&f.str.trim().length>0).map(f=>({...f,str:ut(f.str)}));if(g.length===0)continue;for(const f of g)xt(f.str)&&(a=!0);g.sort((f,d)=>d.transform[5]-f.transform[5]);const p=[];let m=null;const x=8;for(const f of g){const d=f.transform[5];!m||Math.abs(m.y-d)>x?(m={y:d,items:[f]},p.push(m)):m.items.push(f)}for(const f of p){const d=[...f.items].sort((y,b)=>b.transform[4]-y.transform[4]),l=d.map(y=>y.str.trim()).filter(Boolean).join(" ");if(!l)continue;if(!s&&!o){const y=a?X(l):l;if(i){const b=y.match(/^(.+?)(?:\s+(?:السيد|المندوب|حسب|مسودة|نقدي|آجل|قائمة)|$)/i);b&&b[1]&&(o=b[1].trim()),i=!1}else if(y.includes("👤")&&(y.includes("العميل")||y.includes("Customer"))){const b=y.match(/(?:العميل|Customer)\s*[:\-–]\s*([^\n\r]+)/i);if(b&&b[1]&&b[1].trim().length>1){let k=b[1].replace(/(?:المندوب|الدفع|شروط|رشوط|التاريخ|الرقم|الموافق|قائمة|الحالة|ر\.?س|SAR|CR|VAT).*/i,"").trim();k.length>=2&&!k.includes("المندوب")&&(o=k)}else i=!0}else if(y.includes("العميل")||y.includes("السيد")||y.includes("السادة")||y.includes("Customer")){const b=y.match(/(?:العميل|السيد|السادة|المحترم|Customer|Client)\s*[:\-–]?\s*([^\n\r]+)/i);if(b&&b[1]){let k=b[1].replace(/(?:المندوب|الدفع|شروط|رشوط|التاريخ|الرقم|الموافق|قائمة|الحالة|ر\.?س|SAR|CR|VAT).*/i,"").replace(/الرقم\s*الضريبي.*$/i,"").replace(/المنافسين.*$/i,"").replace(/العنوان.*$/i,"").replace(/س\.?ت.*$/i,"").trim();k.length>=2&&!/^(لا\s*يوجد|عام|عميل)$/i.test(k)&&!k.includes("المندوب")&&(o=k)}}}if(Ne(l)){s=!0;continue}if(s&&Te(l)){s=!1;continue}if(!s||le(l)||l.includes("شامل )")||l.includes(")%15("))continue;const h=Be(d,l,a);h&&e.push(h)}}return{items:e,detectedCustomer:o}}function Ne(t){const n=X(t),e=/البيان|الصنف|الوصف|اسم\s*الصنف|المادة|Description|Item/i.test(t)||/البيان|الصنف|الوصف|اسم\s*الصنف|المادة|Description|Item/i.test(n),o=/السعر|الكمية|الوحدة|ر\.?\s*الصنف|الصافي|الإجمالي|Price|Qty|Unit|Total/i.test(t)||/السعر|الكمية|الوحدة|ر\.?\s*الصنف|الصافي|الإجمالي|Price|Qty|Unit|Total/i.test(n);return e&&o}function Te(t){return/المجموع\s*العام|إجمالي\s*الضريبة|صافي\s*القيمة|المجموع\s*[:\-–\(]|الإجمالي\s*النهائي|اإلجمايل\s*النهايئ|فقط\s*وقدره|توقيع\s*المستلم|ختم\s*الشركة|الشروط\s*والأحكام|الرشوط\s*واألحكام|الأسعار\s*سارية/i.test(t)}function le(t){if(!t||t.trim().length<2)return!0;const n=t.trim();return!!(/شركة\s+.*التجارية|رشكة\s+.*|Trading\s+Co|Al-Rafada/i.test(n)||/Build\s+\d+|شارع\s+|حي\s+|مبنى|مبىن|Yamaniya|Tabara/i.test(n)||/الرقم\s*الضريبي|الرض\s*يب|Tax\s*Number|السجل\s*التجاري|C\.?R\.?|ص\.?ب|P\.?O\.?\s*Box/i.test(n)||/هاتف|تلفون|جوال|فاكس|Tel\b|Mobile\b|Fax\b/i.test(n)||/عرض\s*سعر\s*مبيعات|عرض\s*بيع/i.test(n)||/المركز\s*الرئيسي|م\.\s*الرئيسي/i.test(n)||/المستودع\s*[:\-]|المندوب\s*[:\-]|التاريخ\s*[:\-]|الموافق\s*[:\-]|الوقت\s*[:\-]|النوع\s*[:\-]|مرجع\s*[:\-]/i.test(n)||/الصفحة\s+\d+\s+من\s+\d+|Page\s+\d+\s+of\s+\d+/i.test(n)||/المنافسين|العنوان\s*[:\-]/i.test(n)||/العميل\s*[:\-]/i.test(n)||/^[\d\s\-\+\(\)\/]{7,}$/.test(n.replace(/\s+/g,"")))}function Be(t,n,e=!1){const o=t.map(b=>b.str.trim()).filter(b=>b&&!["ر","س",".","ر.س","—","ر.س.","SAR"].includes(b));if(o.length<2||le(n))return null;const s=/^(بالة|كيس|كرتون|كرتونة|كرتونه|حبة|حبه|علبة|علبه|كيلو|كجم|كغ|شد|شدة|قطعة|قطعه|بكت|باكت|درزن|صندوق|طبق|طرد|برميل|جالون|لتر|لرت|تنك|طن|رول|شوال|PCS|BOX|CTN|BAG|KG|PAC|BALE)$/i,i=b=>/^[%]?\s*[\d,]+(\.\d+)?\s*[%]?$/.test(b.trim());let a=-1;for(let b=o.length-1;b>=0&&i(o[b]);b--)a=b;let c="حبة",r="",u="",g=1,p=0;if(a!==-1&&a>0){const b=a-1,k=o[b];let E=b;if(s.test(k))c=k;else for(let I=b;I>=Math.max(0,b-2);I--)if(s.test(o[I])){c=o[I],E=I;break}const N=o.slice(0,E);let $=0;N.length>0&&/^\d{1,4}$/.test(N[0])&&($=1),N.length>$&&/^(\d{2,5}[-\/]\d{2,5}|\d{4,10}|[A-Z0-9]{3,8})$/i.test(N[$])&&(u=N[$],$++),r=N.slice($).join(" ").trim();const P=[];o.slice(a).forEach(I=>{if(I.includes("%")&&!I.match(/\d+\.\d+/))return;const M=I.replace(/[^\d.]/g,""),T=parseFloat(M);!isNaN(T)&&M.length>0&&M.length<9&&P.push(T)}),P.length>=2?(g=P[0],p=P[1]):P.length===1&&(p=P[0])}else{const b=[],k=[];o.forEach((E,N)=>{const $=E.replace(/[^\d.]/g,""),P=parseFloat($);!isNaN(P)&&$.length>0&&$.length<9&&/^[\d.%]+$/.test(E)?N===0&&/^\d{1,3}$/.test($)||k.push(P):s.test(E)?c=E:/^\d{2,5}[-\/]\d{2,5}$/.test(E)?u=E:E.length>1&&!["*","x","-","=","/","+","—","%"].includes(E)&&b.push(E)}),r=b.join(" ").trim(),k.length>=2?(g=k[0],p=k[1]):k.length===1&&(p=k[0])}if((e||xt(r))&&(r=X(r)),(e||xt(c))&&(c=X(c)),!r||r.length<2||r.includes("شامل )")||r.includes("%15")||!/[\p{L}]/u.test(r)||p<=0||p>1e6)return null;g<=0&&(g=1);const m=document.getElementById("qt-import-tax-mode")?.value||"exclusive",x=document.getElementById("qt-import-price-type")?.value||"cost",f=parseFloat(document.getElementById("qt-import-default-margin")?.value)||10;let d=p;m==="inclusive"&&p>0&&(d=Math.round(p/1.15*100)/100);let l=0,h=0,y=d;return x==="cost"&&(l=d,h=f,y=Math.round(d*(1+f/100)*100)/100),{included:!0,rawName:r,sku:u,unit:c||"حبة",qty:g,rawExcelPrice:p,rawPreTaxPrice:d,unitCost:l,profitMargin:h,unitPrice:y,discount:0,matchedProductId:"",matchStatus:"adhoc",matchScore:0}}function ce(t){if(!t||t.length===0)throw new Error("الملف أو النص فارغ ولا يحتوي على أي بيانات.");let n="";for(let p=0;p<Math.min(6,t.length);p++){const m=(t[p]||[]).map(x=>String(x||"").trim()).filter(Boolean).join(" ");if(m.includes("عرض سعر")||m.includes("عرض اسعار")||m.includes("العميل")||m.includes("السيد")||m.includes("السادة")){const x=m.match(/(?:عرض\s*سعر|عرض\s*اسعار|العميل|السيد|السادة)\s*[-:\/]?\s*(.+)/i);if(x&&x[1]){let f=x[1].replace(/[-_]/g," ").trim();if(f=f.replace(/^المحترم(ين)?/i,"").replace(/رقم\s*\d+.*$/i,"").trim(),f&&!f.includes("مبيعات")&&!f.includes("تقرير")){n=f;break}}}}let e=-1;const o={name:-1,unit:-1,qty:-1,priceBefore:-1,priceIncl:-1,pricePlain:-1,priceAfterDisc:-1,disc:-1,sku:-1,vat:-1,totalIncl:-1};for(let p=0;p<Math.min(10,t.length);p++){const m=t[p];if(!Array.isArray(m)||m.length<2)continue;const x=m.map(f=>String(f||"").trim().toLowerCase()).join(" ");if((x.includes("اسم")||x.includes("صنف")||x.includes("بيان")||x.includes("وصف")||x.includes("مادة")||x.includes("ماده"))&&(x.includes("سعر")||x.includes("كمي")||x.includes("وحد")||x.includes("إجمالي")||x.includes("اجمالي"))){e=p,m.forEach((f,d)=>{const l=String(f||"").trim().toLowerCase();l&&((l.includes("اسم")||l.includes("صنف")||l.includes("بيان")||l.includes("وصف")||l.includes("مادة")||l.includes("ماده")||l==="item"||l==="product"||l==="description")&&!l.includes("رقم")&&!l.includes("كود")&&!l.includes("رمز")?o.name===-1&&(o.name=d):l.includes("صنف")&&l.includes("رقم")||l.includes("كود")||l.includes("رمز")||l==="sku"||l==="code"?o.sku===-1&&(o.sku=d):l.includes("وحد")||l==="unit"||l==="uom"?o.unit===-1&&(o.unit=d):l.includes("كمي")||l.includes("عدد")||l==="qty"||l==="quantity"?o.qty===-1&&(o.qty=d):l.includes("خصم")||l==="disc"||l==="discount"?o.disc===-1&&(o.disc=d):l.includes("قبل")&&l.includes("ضريب")?o.priceBefore=d:l.includes("شامل")&&l.includes("ضريب")&&!l.includes("إجمالي")&&!l.includes("اجمالي")?o.priceIncl=d:(l.includes("إجمالي")||l.includes("اجمالي"))&&l.includes("شامل")?o.totalIncl=d:l.includes("ضريب")&&!l.includes("سعر")&&!l.includes("قبل")&&!l.includes("شامل")?o.vat=d:l.includes("بعد")&&l.includes("خصم")?o.priceAfterDisc=d:(l.includes("سعر")||l==="price"||l==="rate")&&!l.includes("بعد")&&!l.includes("شامل")&&!l.includes("إجمالي")&&!l.includes("اجمالي")&&!l.includes("قبل")&&o.pricePlain===-1&&(o.pricePlain=d))});break}}let s=-1,i=!1;if(o.priceBefore!==-1?(s=o.priceBefore,i=!1):o.pricePlain!==-1?(s=o.pricePlain,i=!1):o.priceAfterDisc!==-1?(s=o.priceAfterDisc,i=!1):o.priceIncl!==-1&&(s=o.priceIncl,i=!0),e===-1){e=-1;let p=0,m=0;const x=(t[0]||[]).length;for(let f=0;f<x;f++){let d=0,l=0;for(let y=0;y<Math.min(10,t.length);y++){const b=String(t[y][f]||"").trim();isNaN(parseFloat(b))&&b.length>2&&(d+=b.length,l++)}const h=l>0?d/l:0;h>m&&(m=h,p=f)}o.name=p,o.unit=p+1<x?p+1:-1,o.qty=p+2<x?p+2:-1,o.pricePlain=p+3<x?p+3:-1,s=o.pricePlain,i=!1}const a=document.getElementById("qt-import-tax-mode");a&&(a.value=i?"inclusive":"exclusive");const c=[],r=a?.value==="inclusive"||i,u=document.getElementById("qt-import-price-type")?.value||"cost",g=parseFloat(document.getElementById("qt-import-default-margin")?.value)||10;for(let p=e+1;p<t.length;p++){const m=t[p];if(!m||m.length===0)continue;const x=o.name!==-1?String(m[o.name]||"").trim():"";if(!x||x.length<2)continue;const f=x.toLowerCase();if(f.includes("اجمالي")||f.includes("إجمالي")||f.includes("مجموع")||f.includes("total")||f.includes("ضريبة")||f.includes("vat")||f.includes("فقط وقدره")||f.includes("الشروط")||f.includes("توقيع"))continue;const d=o.sku!==-1?String(m[o.sku]||"").trim():"",l=o.unit!==-1?String(m[o.unit]||"").trim():"حبة";let h=o.qty!==-1?m[o.qty]:1,y=parseFloat(String(h).replace(/[^\d.]/g,""))||1;y<=0&&(y=1);let b=s!==-1?m[s]:0,k=parseFloat(String(b).replace(/[^\d.]/g,""))||0;const E=r&&k>0?Math.round(k/1.15*100)/100:Math.round(k*100)/100;let N=0,$=0,P=E;u==="cost"&&(N=E,$=g,P=Math.round(E*(1+g/100)*100)/100);let I=o.disc!==-1?m[o.disc]:0,M=parseFloat(String(I).replace(/[^\d.]/g,""))||0;c.push({included:!0,rawName:x,sku:d,unit:l||"حبة",qty:y,rawExcelPrice:k,rawPreTaxPrice:E,unitCost:N,profitMargin:$,unitPrice:P,discount:M,matchedProductId:"",matchStatus:"adhoc",matchScore:0})}if(c.length===0)throw new Error("لم يتم العثور على أسطر أصناف صالحة في الملف أو النص.");return{items:c,detectedCustomer:n}}function Ce(t){t.forEach(n=>{n.matchedProductId="",n.matchStatus="adhoc",n.matchScore=0})}function At(t){R=t.items,Ce(R),Mt(!1);const n=document.getElementById("import-pane-file"),e=document.getElementById("import-pane-paste"),o=document.getElementById("qt-import-preview-area"),s=document.getElementById("qt-import-submit-btn"),i=document.getElementById("qt-import-reupload-btn"),a=document.getElementById("qt-import-detected-customer"),c=document.getElementById("qt-import-customer-status");if(n&&n.classList.add("hidden"),e&&e.classList.add("hidden"),o&&o.classList.remove("hidden"),s&&(s.disabled=!1),i&&(i.style.display="inline-flex"),window._importedCustomerName=t.detectedCustomer||"",a&&(a.value=window._importedCustomerName),c)if(window._importedCustomerName){const r=window._importedCustomerName.split(" ").reverse().join(" "),u=dt.find(g=>z(g.name).includes(z(window._importedCustomerName))||z(window._importedCustomerName).includes(z(g.name))||z(g.name).includes(z(r))||z(r).includes(z(g.name)));u?(window._importedCustomerName=u.name,a&&(a.value=u.name),c.innerHTML=`✅ متطابق مع العميل: <strong>${u.name}</strong>`):c.innerHTML="ℹ️ سيتم استخدامه كاسم عميل في العرض"}else c.innerHTML="(يمكنك كتابة اسم العميل أعلاه)";window.onImportPriceTypeChange(!1)}window.onImportPriceTypeChange=(t=!0)=>{const n=document.getElementById("qt-import-price-type")?.value||"cost",e=document.getElementById("qt-import-margin-bar"),o=document.getElementById("qt-import-cost-summary-box"),s=document.getElementById("qt-import-profit-summary-box"),i=document.getElementById("qt-th-cost"),a=document.getElementById("qt-th-margin"),c=document.getElementById("qt-th-price");if(n==="cost"?(e&&(e.style.display="flex"),o&&(o.style.display="block"),s&&(s.style.display="block"),i&&(i.textContent="سعر التكلفة"),a&&(a.style.display=""),c&&(c.textContent="سعر البيع (غير شامل)")):(e&&(e.style.display="none"),o&&(o.style.display="none"),s&&(s.style.display="none"),i&&(i.textContent="سعر البيع المباشر"),a&&(a.style.display="none"),c&&(c.textContent="السعر بعد التعديل")),t&&R&&R.length>0){const r=parseFloat(document.getElementById("qt-import-default-margin")?.value)||10,u=document.getElementById("qt-import-tax-mode")?.value==="inclusive";R.forEach(g=>{const p=g.rawExcelPrice>0?g.rawExcelPrice:g.rawPreTaxPrice||g.unitCost||g.unitPrice||0,m=u&&p>0?Math.round(p/1.15*100)/100:Math.round(p*100)/100;g.rawPreTaxPrice=m,n==="cost"?(g.unitCost=m,g.profitMargin=g.profitMargin!==void 0&&g.profitMargin!==0?g.profitMargin:r,g.unitPrice=Math.round(g.unitCost*(1+g.profitMargin/100)*100)/100):(g.unitCost=0,g.profitMargin=0,g.unitPrice=m)})}gt()};window.applyGlobalImportMargin=t=>{const n=parseFloat(t)||0,e=document.getElementById("qt-import-default-margin");e&&(e.value=n);const o=document.getElementById("qt-import-price-type");o&&o.value!=="cost"&&(o.value="cost",onImportPriceTypeChange(!1)),R.forEach(s=>{s.profitMargin=n;const i=s.unitCost>0?s.unitCost:s.rawPreTaxPrice||s.rawExcelPrice||0;s.unitCost=i,s.unitPrice=i>0?Math.round(i*(1+n/100)*100)/100:s.unitPrice}),gt(),showToast(`تم تطبيق هامش ربح ${n}% على جميع الأصناف بنجاح ⚡`,"info")};window.reapplyTaxModeToImported=()=>{if(!R||R.length===0)return;const t=document.getElementById("qt-import-tax-mode")?.value==="inclusive",n=(document.getElementById("qt-import-price-type")?.value||"cost")==="cost",e=parseFloat(document.getElementById("qt-import-default-margin")?.value)||10;R.forEach(o=>{const s=o.rawExcelPrice>0?o.rawExcelPrice:o.rawPreTaxPrice||o.unitCost||o.unitPrice||0,i=t&&s>0?Math.round(s/1.15*100)/100:Math.round(s*100)/100;if(o.rawPreTaxPrice=i,n){o.unitCost=i;const a=o.profitMargin!==void 0?o.profitMargin:e;o.profitMargin=a,o.unitPrice=Math.round(i*(1+a/100)*100)/100}else o.unitCost=0,o.profitMargin=0,o.unitPrice=i}),gt()};function gt(){const t=document.getElementById("qt-import-parsed-tbody");if(!t)return;const n=(document.getElementById("qt-import-price-type")?.value||"cost")==="cost";t.innerHTML=R.map((e,o)=>{const s=parseFloat(e.qty)||0,i=parseFloat(e.unitCost)||0,a=parseFloat(e.profitMargin)||0,c=parseFloat(e.unitPrice)||0,r=s*c,u=r*(parseFloat(e.discount)||0)/100,g=r-u,p=Math.round(g*.15*100)/100,m=Math.round((g+p)*100)/100,x=Math.round(c*1.15*100)/100;return`
      <tr style="${e.included?"":"opacity:0.45;background:#f8fafc;"}">
        <td style="text-align:center;">
          <input type="checkbox" ${e.included?"checked":""} onchange="toggleImportItemIncluded(${o}, this.checked)" />
        </td>
        <td style="text-align:center;color:var(--text-3);font-size:11px;">${o+1}</td>
        <td>
          <input type="text" class="input sm" style="font-weight:700;color:var(--text-0);font-size:12px;width:100%;"
            value="${(e.rawName||"").replace(/"/g,"&quot;")}" onchange="updateImportItem(${o}, 'rawName', this.value)" />
        </td>
        <td style="text-align:center;">
          <span style="font-family:monospace;font-size:11.5px;color:var(--text-2);">${e.sku||"—"}</span>
        </td>
        <td style="text-align:center;">
          <input type="text" class="input sm" style="width:65px;height:26px;text-align:center;font-size:11px;padding:2px;"
            value="${e.unit||"حبة"}" onchange="updateImportItem(${o}, 'unit', this.value)" />
        </td>
        <td style="text-align:center;">
          <input type="number" class="input sm mono font-bold" style="width:60px;height:26px;text-align:center;font-size:12px;padding:2px;"
            value="${e.qty}" min="0.001" step="0.001" onchange="updateImportItem(${o}, 'qty', this.value)" />
        </td>
        <td>
          <input type="number" class="input sm mono font-bold" style="width:85px;height:26px;font-size:12px;padding:2px;background:#f0fdf4;border-color:#86efac;color:#166534;"
            value="${n?i:c}" min="0" step="0.01" title="${n?"سعر التكلفة من المورد":"سعر البيع المباشر"}"
            onchange="updateImportItem(${o}, '${n?"unitCost":"unitPrice"}', this.value)" />
        </td>
        ${n?`
        <td style="text-align:center;">
          <input type="number" class="input sm mono font-bold" style="width:60px;height:26px;text-align:center;font-size:12px;padding:2px;background:#eff6ff;border-color:#93c5fd;color:#1e40af;"
            value="${a}" step="0.5" title="نسبة هامش الربح %"
            onchange="updateImportItem(${o}, 'profitMargin', this.value)" />
        </td>
        `:'<td style="display:none;"></td>'}
        <td>
          <input type="number" class="input sm mono font-bold" style="width:88px;height:26px;font-size:12px;padding:2px;border-color:#bfdbfe;"
            value="${c}" min="0" step="0.01" title="سعر البيع المقترح للعميل"
            onchange="updateImportItem(${o}, 'unitPrice', this.value)" />
        </td>
        <td class="mono font-bold" style="color:#0284c7;font-size:11.5px;">
          ${w(x)}
        </td>
        <td style="text-align:center;">
          <input type="number" class="input sm mono" style="width:46px;height:26px;text-align:center;font-size:11px;padding:2px;"
            value="${e.discount||0}" min="0" max="100" step="0.5" onchange="updateImportItem(${o}, 'discount', this.value)" />
        </td>
        <td class="mono font-bold text-good" style="font-size:12.5px;">
          ${w(m)}
        </td>
      </tr>
    `}).join(""),Le()}window.toggleAllImportedItems=t=>{R.forEach(n=>n.included=t),gt()};window.toggleImportItemIncluded=(t,n)=>{R[t]&&(R[t].included=n,gt())};window.updateImportItem=(t,n,e)=>{const o=R[t];if(o){if(n==="rawName")o.rawName=e;else if(n==="sku")o.sku=e;else if(n==="unit")o.unit=e;else if(n==="qty")o.qty=parseFloat(e)||1;else if(n==="unitCost"){const s=parseFloat(e)||0;o.unitCost=s,o.rawPreTaxPrice=s;const i=parseFloat(o.profitMargin)||0;o.unitPrice=Math.round(s*(1+i/100)*100)/100}else if(n==="profitMargin"){const s=parseFloat(e)||0;o.profitMargin=s;const i=parseFloat(o.unitCost)||0;o.unitPrice=i>0?Math.round(i*(1+s/100)*100)/100:o.unitPrice}else if(n==="unitPrice"){const s=parseFloat(e)||0;o.unitPrice=s;const i=parseFloat(o.unitCost)||0;i>0&&(o.profitMargin=Math.round((s/i-1)*100*10)/10)}else n==="discount"&&(o.discount=parseFloat(e)||0);gt()}};function Le(){const t=R.length,n=R.filter(d=>d.included),e=(document.getElementById("qt-import-price-type")?.value||"cost")==="cost";let o=0,s=0;n.forEach(d=>{const l=parseFloat(d.qty)||0,h=parseFloat(d.unitCost)||0,y=parseFloat(d.unitPrice)||0,b=l*y*(parseFloat(d.discount)||0)/100;o+=l*h,s+=l*y-b});const i=s-o,a=o>0?Math.round(i/o*1e3)/10:0,c=Math.round(s*.15*100)/100,r=Math.round((s+c)*100)/100,u=document.getElementById("qt-stat-total-items");u&&(u.textContent=`📦 ${n.length} من ${t} صنف (${e?"حساب أسعار بهامش ربح":"استيراد بيع مباشر"})`);const g=document.getElementById("qt-import-tot-cost"),p=document.getElementById("qt-import-tot-profit"),m=document.getElementById("qt-import-tot-gross"),x=document.getElementById("qt-import-tot-vat"),f=document.getElementById("qt-import-tot-grand");if(g&&(g.textContent=w(o)),p){const d=i>=0?"+":"";p.textContent=`${d}${w(i)} (${d}${a}%)`,p.style.color=i>=0?"#166534":"#dc2626"}m&&(m.textContent=w(s)),x&&(x.textContent=w(c)),f&&(f.textContent=w(r))}window.submitImportedQuotationItems=()=>{const t=(R||[]).filter(i=>i.included);if(t.length===0){showToast("يرجى تحديد صنف واحد على الأقل للاستيراد","warn");return}const n=(document.getElementById("qt-import-detected-customer")?.value||"").trim()||window._importedCustomerName||"";let e=null;n&&(e=dt.find(i=>z(i.name).includes(z(n))||z(n).includes(z(i.name))));const o=t.map((i,a)=>{const c=parseFloat(i.qty)||1,r=parseFloat(i.unitCost)||0,u=parseFloat(i.profitMargin)||0,g=parseFloat(i.unitPrice)||(r>0?Math.round(r*(1+u/100)*100)/100:0),p=parseFloat(i.discount)||0;return{productId:"adhoc_"+Date.now()+"_"+a+"_"+Math.random().toString(36).substring(2,6),productName:i.rawName,sku:i.sku||"",unit:i.unit||"حبة",qty:c,cost:r,lastPurchasePrice:r,margin:u,unitPrice:g,discount:p,isCustom:!0,taxCategory:"S"}});closeModal("qt-import-modal");const s={customerName:e?e.name:n,customerId:e?e.id:n?"adhoc_customer":"",items:o};openQuoteForm(s),showToast(`✨ تم استيراد وتجهيز ${o.length} صنفاً بحساب التكلفة وهوامش الربح بدقة 100%!`,"success")};window._adhocRowToReplaceIndex=null;window.addCustomQuoteLine=(t="")=>{const n=document.getElementById("qt-product-search"),e=document.getElementById("qt-product-results");n&&(n.value=""),e&&e.classList.add("hidden");const o="adhoc_"+Date.now()+"_"+Math.random().toString(36).substring(2,6),s=document.getElementById("qt-pricelist")?.value||"standard";let i=F.retailMargin||10;s==="tier1"?i=lt({name:t}):s==="wholesale"?i=F.wholesaleMargin||7:s==="distributor"&&(i=F.distributorMargin||5),v.unshift({productId:o,productName:t||"بند حر جديد",sku:"",unit:"كرتون",qty:1,cost:0,lastPurchasePrice:0,margin:i,unitPrice:0,discount:0,isCustom:!0}),Q(),showToast("تمت إضافة بند حر بأعلى الجدول ✨","info"),setTimeout(()=>{const a=document.querySelector("#qt-lines-tbody tr:first-child");if(a)if(t){const c=a.querySelector(".qt-line-qty");c&&(c.focus(),c.select())}else{const c=a.querySelector("input[placeholder*='اسم']");c&&(c.focus(),c.select())}},50)};window.openQuickAddProductModal=(t="",n=null)=>{window._adhocRowToReplaceIndex=n??null;const e=document.getElementById("qt-qp-name"),o=document.getElementById("qt-qp-sku"),s=document.getElementById("qt-qp-unit"),i=document.getElementById("qt-qp-category"),a=document.getElementById("qt-qp-cost"),c=document.getElementById("qt-qp-margin"),r=document.getElementById("qt-qp-price"),u=document.getElementById("qt-qp-error"),g=document.getElementById("qt-qp-title");if(u&&u.classList.add("hidden"),i&&(i.innerHTML='<option value="">(بدون تصنيف)</option>'+Tt.map(p=>`<option value="${p.id}">${p.name}</option>`).join("")),n!=null&&v[n]){const p=v[n];g&&(g.textContent="تسجيل البند الحر كصنف دائم بالكتالوج"),e&&(e.value=p.productName||""),o&&(o.value="SKU-"+Math.floor(1e5+Math.random()*9e5)),s&&(s.value=p.unit||"كرتون"),a&&(a.value=p.cost?Number(q(p.cost).toFixed(2)):0),c&&(c.value=p.margin!==void 0&&p.margin!==null?Number(q(p.margin).toFixed(2)):10),r&&(r.value=p.unitPrice?Number(q(p.unitPrice).toFixed(2)):0)}else g&&(g.textContent="إضافة صنف جديد سريع إلى الكتالوج"),e&&(e.value=t||""),o&&(o.value="SKU-"+Math.floor(1e5+Math.random()*9e5)),s&&(s.value="كرتون"),a&&(a.value="0"),c&&(c.value=F.retailMargin||10),r&&(r.value="0");calcQuickProductPrice("cost"),openModal("qt-quick-product-modal"),setTimeout(()=>{e.value?parseFloat(a.value)<=0&&a.focus():e.focus()},150)};window.registerAdhocProduct=t=>{window.openQuickAddProductModal("",t)};window.calcQuickProductPrice=(t="cost")=>{const n=q(document.getElementById("qt-qp-cost")?.value,0),e=q(document.getElementById("qt-qp-margin")?.value,0),o=document.getElementById("qt-qp-price"),s=document.getElementById("qt-qp-vat-hint");if(t==="price"){const a=q(o?.value,0);if(n>0&&o){const c=Math.round((a/n-1)*100*100)/100,r=document.getElementById("qt-qp-margin");r&&(r.value=Number(c.toFixed(2)))}}else if(o){const a=n>0?Math.round(n*(1+e/100)*100)/100:q(o.value,0);o.value=Number(a.toFixed(2))}const i=q(o?.value,0);if(s){const a=Math.round(i*1.15*100)/100;s.textContent=`السعر شامل الضريبة (15%): ${w(a)}`}};window.saveQuickProduct=async()=>{const t=document.getElementById("qt-qp-name")?.value.trim(),n=document.getElementById("qt-qp-error");if(!t){n&&(n.textContent="يرجى كتابة اسم الصنف.",n.classList.remove("hidden"));return}const e=document.getElementById("qt-qp-sku")?.value.trim()||"SKU-"+Date.now().toString().slice(-6),o=document.getElementById("qt-qp-unit")?.value.trim()||"كرتون",s=Math.round(q(document.getElementById("qt-qp-cost")?.value,0)*100)/100,i=Math.round(q(document.getElementById("qt-qp-price")?.value,0)*100)/100;let a=q(document.getElementById("qt-qp-margin")?.value,null);a===null&&s>0&&i>0?a=Math.round((i/s-1)*100*100)/100:a!==null?a=Math.round(a*100)/100:a=0;const c=document.getElementById("qt-qp-save-btn");c&&(c.disabled=!0);try{const r={name:t,nameAr:t,sku:e,unit:o,category,costPrice:s,purchasePrice:s,lastPurchasePrice:s,avgCostPrice:s,salePrice:i,priceRetail:i,priceWholesale:i,priceDistributor:i,taxCategory:"S",createdAt:new Date().toISOString()},u=await wt(j.products(),r),g=typeof u=="string"?u:u?.id||"p_"+Date.now();if(r.id=g,S.push(r),window._adhocRowToReplaceIndex!==null&&window._adhocRowToReplaceIndex!==void 0&&v[window._adhocRowToReplaceIndex]){const x=window._adhocRowToReplaceIndex;v[x].productId=g,v[x].productName=t,v[x].sku=e,v[x].unit=o,v[x].cost=s,v[x].lastPurchasePrice=s,v[x].unitPrice=i,v[x].margin=a,v[x].isCustom=!1,window._adhocRowToReplaceIndex=null}else window.addQtProduct(g,t,i,o,e,s);Q(),closeModal("qt-quick-product-modal"),showToast(`تم تسجيل الصنف "${t}" بالكتالوج وإدراجه بنجاح ✨`,"success");const p=document.getElementById("qt-product-search");p&&(p.value="");const m=document.getElementById("qt-product-results");m&&m.classList.add("hidden")}catch(r){n&&(n.textContent="حدث خطأ: "+r.message,n.classList.remove("hidden"))}finally{c&&(c.disabled=!1)}};function bt(t){if(!t||typeof t!="string")return[];const n=z(t);if(!n||n.length<2)return[];const e=[],o=Array.isArray(C)?C:[];for(const s of o)if(!(!s||!Array.isArray(s.items)))for(const i of s.items){if(!i||!i.productName)continue;const a=z(i.productName);if(!a)continue;(a===n||a.includes(n)||n.includes(a))&&e.push({quoteId:s.id,quoteNumber:s.quoteNumber||"—",date:s.date||s.createdAt||"",customerId:s.customerId||"",customerName:s.customerName||"عميل عام",repName:s.repName||"",status:s.status||"draft",productName:i.productName,sku:i.sku||"",unit:i.unit||"كرتون",qty:i.qty||1,cost:parseFloat(i.cost)||0,margin:parseFloat(i.margin)||0,unitPrice:parseFloat(i.unitPrice)||0,discount:parseFloat(i.discount)||0,isCustom:!!i.isCustom||String(i.productId||"").startsWith("adhoc_")})}return e.sort((s,i)=>(i.date||"").localeCompare(s.date||"")),e}function Se(t){const n=z(t),e=Array.isArray(C)?C:[],o=new Map;for(const s of e)if(!(!s||!Array.isArray(s.items)))for(const i of s.items){if(!i||!i.productName||!(i.isCustom||String(i.productId||"").startsWith("adhoc_")||!S.some(r=>r.id===i.productId||z(r.name)===z(i.productName))))continue;const c=z(i.productName);if(!(n&&!c.includes(n)))if(!o.has(c))o.set(c,{productName:i.productName,unit:i.unit||"كرتون",unitPrice:parseFloat(i.unitPrice)||0,cost:parseFloat(i.cost)||0,margin:parseFloat(i.margin)||0,sku:i.sku||"",lastQuotedDate:s.date||"",lastCustomerName:s.customerName||"عميل عام",quoteNumber:s.quoteNumber||"—",count:1});else{const r=o.get(c);r.count+=1,(s.date||"")>(r.lastQuotedDate||"")&&(r.unitPrice=parseFloat(i.unitPrice)||r.unitPrice,r.cost=parseFloat(i.cost)||r.cost,r.margin=parseFloat(i.margin)||r.margin,r.unit=i.unit||r.unit,r.lastQuotedDate=s.date,r.lastCustomerName=s.customerName||r.lastCustomerName,r.quoteNumber=s.quoteNumber||r.quoteNumber)}}return Array.from(o.values()).slice(0,10)}window._activeHistoryRowIndex=null;window._activeHistoryItemName="";window._currentPriceHistoryTab="all";window.openPriceHistoryModal=(t,n="")=>{window._activeHistoryRowIndex=t??null;let e=n;if(t!=null&&v[t]&&(e=v[t].productName||""),e=(e||"").trim(),!e){showToast("يرجى كتابة اسم الصنف أولاً للبحث في سجل الأسعار","warn");return}window._activeHistoryItemName=e,window._currentPriceHistoryTab="all";const o=document.getElementById("qt-ph-title"),s=document.getElementById("qt-ph-subtitle");o&&(o.textContent=`سجل أسعار: "${e}" في عروض الأسعار`),s&&(s.textContent="مقارنة الأسعار السابقة وهوامش الربح والتواريخ لكافة العملاء"),pe(),openModal("qt-price-history-modal")};function pe(){const t=window._activeHistoryItemName,n=bt(t),e=document.getElementById("qt-customer-id")?.value,o=document.getElementById("qt-customer-search")?.value||"",s=window._currentPriceHistoryTab==="cust",i=s?n.filter(p=>e&&p.customerId===e||o&&z(p.customerName)===z(o)):n,a=document.getElementById("qt-ph-tab-all"),c=document.getElementById("qt-ph-tab-cust");if(a&&(a.className=s?"btn btn-sm btn-secondary":"btn btn-sm btn-primary active"),c){c.className=s?"btn btn-sm btn-primary active":"btn btn-sm btn-secondary";const p=n.filter(m=>e&&m.customerId===e||o&&z(m.customerName)===z(o)).length;c.textContent=`👤 ${o?o.slice(0,18):"العميل المحدد"} (${p})`}const r=document.getElementById("qt-ph-count-hint");r&&(r.textContent=`عدد عروض الأسعار المسجلة: ${i.length} من أصل ${n.length}`);const u=document.getElementById("qt-ph-stats");if(u)if(!n.length)u.innerHTML=`
        <div style="grid-column: 1 / -1; padding:12px; background:var(--bg-2); border-radius:8px; text-align:center; color:var(--text-2); font-size:12px;">
          لا يوجد تسعير سابق مسجل لهذا البند حتى الآن.
        </div>
      `;else{const p=n.map(l=>l.unitPrice).filter(l=>l>0),m=p.length?Math.max(...p):0,x=p.length?Math.min(...p):0,f=p.length?p.reduce((l,h)=>l+h,0)/p.length:0,d=n[0];u.innerHTML=`
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:10px 14px; text-align:center;">
          <div style="font-size:10.5px; color:#1e40af; font-weight:700;">🕒 آخر سعر مسعر</div>
          <div class="mono" style="font-size:16px; font-weight:800; color:#1e3a8a; margin:2px 0;">${w(d.unitPrice)}</div>
          <div style="font-size:9.5px; color:#60a5fa;">${V(d.date)}</div>
        </div>
        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:10px 14px; text-align:center;">
          <div style="font-size:10.5px; color:#166534; font-weight:700;">📈 أعلى سعر مسعر</div>
          <div class="mono" style="font-size:16px; font-weight:800; color:#15803d; margin:2px 0;">${w(m)}</div>
          <div style="font-size:9.5px; color:#4ade80;">شامل 15%: ${w(m*1.15)}</div>
        </div>
        <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:10px 14px; text-align:center;">
          <div style="font-size:10.5px; color:#991b1b; font-weight:700;">📉 أدنى سعر مسعر</div>
          <div class="mono" style="font-size:16px; font-weight:800; color:#b91c1c; margin:2px 0;">${w(x)}</div>
          <div style="font-size:9.5px; color:#f87171;">شامل 15%: ${w(x*1.15)}</div>
        </div>
        <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:10px; padding:10px 14px; text-align:center;">
          <div style="font-size:10.5px; color:#6b21a8; font-weight:700;">⚖️ متوسط الأسعار</div>
          <div class="mono" style="font-size:16px; font-weight:800; color:#7e22ce; margin:2px 0;">${w(Math.round(f*100)/100)}</div>
          <div style="font-size:9.5px; color:#c084fc;">إجمالي (${p.length}) عروض</div>
        </div>
      `}const g=document.getElementById("qt-ph-tbody");if(g){if(!i.length){g.innerHTML='<tr><td colspan="8" style="text-align:center; padding:24px; color:var(--text-2);">لا توجد نتائج تطابق العرض المحدد</td></tr>';return}g.innerHTML=i.map(p=>{const m=Math.round(p.unitPrice*1.15*100)/100,x=e&&p.customerId===e;return`
        <tr style="border-bottom:1px solid var(--border-soft); ${x?"background:rgba(16,185,129,0.04);":""}">
          <td style="padding:8px 12px; font-weight:700; color:var(--brand);" class="mono">${p.quoteNumber}</td>
          <td style="padding:8px 12px; font-size:11.5px; color:var(--text-2);">${V(p.date)}</td>
          <td style="padding:8px 12px;">
            <div style="font-weight:700; font-size:12px;">${p.customerName}</div>
            ${x?'<span class="badge" style="font-size:9.5px; background:#dcfce7; color:#15803d; padding:1px 5px;">العميل الحالي</span>':""}
          </td>
          <td style="padding:8px 12px; text-align:center;">
            <span class="badge" style="font-size:10px; background:var(--bg-2); color:var(--text-2);">${p.qty} ${p.unit}</span>
          </td>
          <td style="padding:8px 12px; text-align:center; font-size:11px;">
            ${p.cost>0?`<div class="mono" style="color:#059669; font-weight:700;">ت: ${w(p.cost)}</div>`:'<span style="color:var(--text-2);">—</span>'}
            ${p.margin?`<div style="font-size:10px; color:#4338ca; font-weight:600;">+${p.margin}%</div>`:""}
          </td>
          <td style="padding:8px 12px; text-align:right; font-weight:800; font-size:12.5px;" class="mono text-indigo">${w(p.unitPrice)}</td>
          <td style="padding:8px 12px; text-align:right; font-weight:700; font-size:12px; color:#0284c7;" class="mono">${w(m)}</td>
          <td style="padding:8px 12px; text-align:center;">
            <button type="button" class="btn btn-sm btn-primary" style="font-size:11px; padding:3px 10px; font-weight:700; background:#059669; border-color:#059669; border-radius:5px;"
              onclick="applyHistoryPriceToRow(${p.unitPrice}, ${p.cost||0}, ${p.margin||0}, '${(p.unit||"كرتون").replace(/'/g,"\\'")}')">
              استخدام هذا السعر 🎯
            </button>
          </td>
        </tr>
      `}).join("")}}window.switchPriceHistoryTab=t=>{window._currentPriceHistoryTab=t,pe()};window.applyHistoryPriceToRow=(t,n,e,o)=>{const s=window._activeHistoryRowIndex,i=q(t,0),a=q(n,0);let c=q(e,null);c===null&&a>0&&i>0&&(c=Math.round((i/a-1)*100*100)/100),s!=null&&v[s]?(v[s].unitPrice=Math.round(i*100)/100,a>0&&(v[s].cost=Math.round(a*100)/100),c!==null&&(v[s].margin=Math.round(c*100)/100),o&&(v[s].unit=o),Q(),closeModal("qt-price-history-modal"),showToast(`تم تطبيق السعر (${w(i)}) بنجاح 🎯`,"success")):(window.addCustomQuoteLineWithData(window._activeHistoryItemName,o,a,c||0,i,""),closeModal("qt-price-history-modal"))};window.applyInlineHistoryPrice=t=>{if(!v[t])return;const n=bt(v[t].productName);if(!n||!n.length)return;const e=n[0],o=q(e.unitPrice,0),s=q(e.cost,0);let i=q(e.margin,null);i===null&&s>0&&o>0&&(i=Math.round((o/s-1)*100*100)/100),v[t].unitPrice=Math.round(o*100)/100,s>0&&(v[t].cost=Math.round(s*100)/100),i!==null&&(v[t].margin=Math.round(i*100)/100),e.unit&&(v[t].unit=e.unit),Q(),showToast(`تم تطبيق آخر تسعير سابق (${w(o)}) بنجاح ⚡`,"success")};window.addCustomQuoteLineWithData=(t,n,e,o,s,i="")=>{const a=document.getElementById("qt-product-search"),c=document.getElementById("qt-product-results");a&&(a.value=""),c&&c.classList.add("hidden");const r="adhoc_"+Date.now()+"_"+Math.random().toString(36).substring(2,6),u=q(e,0),g=q(s,0);let p=q(o,null);p===null&&u>0&&g>0?p=Math.round((g/u-1)*100*100)/100:p!==null&&(p=Math.round(p*100)/100),v.unshift({productId:r,productName:t||"بند حر مسعر",sku:i||"",unit:n||"كرتون",qty:1,cost:Math.round(u*100)/100,lastPurchasePrice:Math.round(u*100)/100,margin:p||0,unitPrice:Math.round(g*100)/100,discount:0,isCustom:!0}),Q(),showToast(`تم إدراج البند المسعر سابقاً "${t}" بسعر ${w(g)} 🎯`,"success"),setTimeout(()=>{const m=document.querySelector("#qt-lines-tbody tr:first-child");if(m){const x=m.querySelector(".qt-line-qty");x&&(x.focus(),x.select())}},50)};let D=[];function zt(){const t=document.getElementById("qt-sup-import-datalist"),n=document.getElementById("qt-sup-filter-supplier"),e=document.getElementById("qt-sup-lists-count"),o=document.getElementById("qt-sup-total-items-badge"),s=new Set;(qt||[]).forEach(r=>{r.name&&s.add(r.name.trim())}),(H||[]).forEach(r=>{r.supplierName&&s.add(r.supplierName.trim())});const i=Array.from(s).sort((r,u)=>r.localeCompare(u,"ar"));t&&(t.innerHTML=i.map(r=>`<option value="${r}"></option>`).join("")),n&&(n.innerHTML='<option value="">جميع الموردين</option>'+i.map(r=>`<option value="${r}">${r}</option>`).join(""));const a=(H||[]).length;let c=0;(H||[]).forEach(r=>{c+=(r.items||[]).length}),e&&(e.textContent=a),o&&(o.textContent=c)}function yt(t){if(!t||typeof t!="string")return[];const n=z(t);if(!n||n.length<2)return[];const e=[],o=Array.isArray(H)?H:[];for(const s of o)if(!(!s||!Array.isArray(s.items)))for(const i of s.items){if(!i||!i.productName)continue;const a=z(i.productName);if(!a)continue;if(a===n||a.includes(n)||n.includes(a)){const r=parseFloat(i.costPrice)||0,u=parseFloat(i.costPriceWithVat)||Math.round(r*1.15*100)/100;e.push({supplierId:s.supplierId||"",supplierName:s.supplierName||"مورد عام",supplierPhone:s.supplierPhone||"",quoteDate:s.quoteDate||s.createdAt||"",fileName:s.fileName||"",productName:i.productName,sku:i.sku||"",unit:i.unit||"كرتون",costPrice:r,costPriceWithVat:u,notes:i.notes||""})}}return e.sort((s,i)=>s.costPrice-i.costPrice),e}function Ae(t){const n=z(t),e=Array.isArray(H)?H:[],o=new Map;for(const s of e)if(!(!s||!Array.isArray(s.items)))for(const i of s.items){if(!i||!i.productName)continue;const a=z(i.productName);if(n&&!a.includes(n))continue;const c=a+"_"+(s.supplierName||"");o.has(c)||o.set(c,{productName:i.productName,supplierName:s.supplierName||"مورد عام",supplierId:s.supplierId||"",quoteDate:s.quoteDate||"",unit:i.unit||"كرتون",costPrice:parseFloat(i.costPrice)||0,costPriceWithVat:parseFloat(i.costPriceWithVat)||(parseFloat(i.costPrice)||0)*1.15,sku:i.sku||""})}return Array.from(o.values()).slice(0,10)}window.openSupplierPriceBankModal=(t="import")=>{const n=document.getElementById("qt-sup-import-date");n&&!n.value&&(n.value=U()),zt(),switchSupplierBankTab(t),openModal("qt-supplier-price-bank-modal")};window.switchSupplierBankTab=t=>{const n=document.getElementById("sup-bank-pane-import"),e=document.getElementById("sup-bank-pane-search"),o=document.getElementById("sup-bank-pane-lists"),s=document.getElementById("tab-btn-sup-import"),i=document.getElementById("tab-btn-sup-search"),a=document.getElementById("tab-btn-sup-lists");n&&n.classList.toggle("hidden",t!=="import"),e&&e.classList.toggle("hidden",t!=="search"),o&&o.classList.toggle("hidden",t!=="lists"),s&&(s.className=t==="import"?"btn btn-sm btn-primary active":"btn btn-sm btn-secondary"),i&&(i.className=t==="search"?"btn btn-sm btn-primary active":"btn btn-sm btn-secondary"),a&&(a.className=t==="lists"?"btn btn-sm btn-primary active":"btn btn-sm btn-secondary"),t==="search"?(fe(),setTimeout(()=>document.getElementById("qt-sup-search-input")?.focus(),100)):t==="lists"&&me()};window.switchSupplierSubTab=t=>{const n=document.getElementById("sup-subpane-file"),e=document.getElementById("sup-subpane-paste"),o=document.getElementById("tab-btn-sup-subfile"),s=document.getElementById("tab-btn-sup-subpaste");t==="file"?(n&&n.classList.remove("hidden"),e&&e.classList.add("hidden"),o&&(o.classList.remove("btn-secondary"),o.classList.add("btn-primary")),s&&(s.classList.remove("btn-primary"),s.classList.add("btn-secondary"))):(n&&n.classList.add("hidden"),e&&e.classList.remove("hidden"),s&&(s.classList.remove("btn-secondary"),s.classList.add("btn-primary")),o&&(o.classList.remove("btn-primary"),o.classList.add("btn-secondary")),setTimeout(()=>document.getElementById("qt-sup-paste-area")?.focus(),100))};window.handleSupplierFileDrop=t=>{t.preventDefault();const n=t.dataTransfer.files;n.length>0&&ue(n[0])};window.handleSupplierFileInput=t=>{const n=t.target.files[0];n&&ue(n)};async function ue(t){const n=(t.name||"").toLowerCase(),e=n.endsWith(".pdf")||t.type==="application/pdf",o=n.endsWith(".xlsx")||n.endsWith(".xls")||n.endsWith(".csv")||t.type.includes("sheet")||t.type.includes("excel")||t.type.includes("csv");window._supplierCurrentFileName=t.name||"ملف_عرض_سعر_مورد",e?await De(t):o?await Fe(t):it("نوع الملف غير مدعوم. يرجى اختيار ملف Excel (.xlsx / .xls / .csv) أو ملف PDF.")}async function Fe(t){$t(!0,"جارٍ قراءة وتحليل ملف الإكسيل واستخراج أسعار المورد...");try{const n=await ae(),e=new FileReader;e.onload=async o=>{try{const s=new Uint8Array(o.target.result),i=n.read(s,{type:"array"});if(!i.SheetNames||i.SheetNames.length===0)throw new Error("الملف لا يحتوي على أي صفحات عمل (Sheets).");const a=i.SheetNames[0],c=i.Sheets[a],r=n.utils.sheet_to_json(c,{header:1,defval:""});Ft(r,t.name)}catch(s){it(s.message||"حدث خطأ أثناء قراءة ملف الإكسيل")}},e.readAsArrayBuffer(t)}catch(n){it(n.message)}}async function De(t){$t(!0,"جارٍ تحليل وقراءة ملف الـ PDF واستخراج قائمة أسعار المورد...");try{await re();const n=await t.arrayBuffer(),e=await window.pdfjsLib.getDocument({data:n}).promise,o=[];let s="",i="",a="",c=!1;for(let p=1;p<=e.numPages;p++){$t(!0,`جارٍ قراءة صفحة (${p} من ${e.numPages}) من عرض السعر...`);const m=await e.getPage(p),x=m.getViewport({scale:1}),l=((await m.getTextContent()).items||[]).filter(h=>h&&typeof h.str=="string"&&h.str.trim().length>0).map(h=>{const y=h.transform[4],b=h.transform[5],k=x.height-b;return{str:ut(h.str),x:y,y:b,top:k,width:h.width,height:h.height}});o.push({pageNum:p,pageItems:l,width:x.width,height:x.height});for(const h of l)xt(h.str)&&(c=!0)}if(o.length>0){const p=o[0],m=p.pageItems.filter(d=>d.top<p.height*.35);m.sort((d,l)=>d.top-l.top);const x=[];let f=null;for(const d of m)!f||Math.abs(f.top-d.top)>5.5?(f={top:d.top,items:[d]},x.push(f)):f.items.push(d);for(const d of x){const h=[...d.items].sort((b,k)=>k.x-b.x).map(b=>b.str).join(" ").trim(),y=X(h);if(!s&&d.top<110){if(/Al-Rafada|Al-?Arabia/i.test(h)||/الرفادة/i.test(y))s="شركة الرفادة العربية التجارية";else if(/شركة|مؤسسة|مصنع|Trading|Company|مجموعة/i.test(y)&&!y.includes("Customer")&&!y.includes("العميل")){const b=y.match(/((?:شركة|مؤسسة|مصنع|مجموعة)\s+[^\n\r,]+?(?:التجارية|المحدودة|للتجارة|للصناعة|للأغذية|للمواد الغذائية)?)/);b&&b[1].length>4?s=b[1].trim():y.length>4&&(s=y.trim())}}if(!i){const b=h.match(/\b(202\d[-/]\d{1,2}[-/]\d{1,2})\b/);b&&(i=b[1].replace(/\//g,"-"))}if(!a){const b=h.match(/(?:الرقم|مـــقرلا|Number|Quote\s*#)\s*[:\-–]?\s*(\d{4,8})/i);b&&(a=b[1])}}}const r=[],g=(document.getElementById("qt-sup-import-tax-mode")?.value||"exclusive")==="inclusive";for(const p of o){const m=p.pageItems;m.sort((d,l)=>d.top-l.top);const x=[];let f=null;for(const d of m)!f||Math.abs(f.top-d.top)>4.5?(f={top:d.top,items:[d]},x.push(f)):f.items.push(d);for(const d of x){const l=d.items,h=l.filter(B=>B.x>=550),y=l.filter(B=>B.x>=505&&B.x<550),b=l.filter(B=>B.x>=358&&B.x<505),k=l.filter(B=>B.x>=315&&B.x<358),E=l.filter(B=>B.x>=195&&B.x<250),N=l.filter(B=>B.x>=15&&B.x<85);if(h.length===0)continue;const $=h.map(B=>B.str).join("").trim();if(!/^\d{1,4}$/.test($)||E.length===0)continue;const P=E.map(B=>B.str).join("").replace(/,/g,"").trim(),I=parseFloat(P);if(isNaN(I)||I<=0)continue;const M=y.map(B=>B.str).join("").trim();let T="كرتون",L="";const _=ut(k.map(B=>B.str).join(" ")).trim();if(_){let B=!1;for(const[at,vt]of Pe)if(vt.test(_)){T=at,B=!0;const _t=_.replace(vt,"").trim();_t&&(L=_t);break}!B&&_.length<=10&&(T=X(_))}let J=[...b].sort((B,at)=>at.x-B.x).map(B=>B.str.trim()).filter(Boolean);L&&J.push(L);const Z=J.join(" ");if(!Z||Z.length<2)continue;const W=X(Z);if(!W||W.length<2)continue;let Dt=g?Math.round(I/1.15*100)/100:I,Qt=Math.round(Dt*1.15*100)/100;if(!g&&N.length>0){const B=N.map(vt=>vt.str).join("").replace(/,/g,"").trim(),at=parseFloat(B);!isNaN(at)&&at>0&&(Qt=at)}r.push({selected:!0,rowNum:parseInt($,10),productName:W,sku:M,unit:T,costPrice:Dt,costPriceWithVat:Qt,notes:a?`عرض رقم ${a}`:""})}}if(r.length===0){const p=[];for(const m of o){const x=m.pageItems;x.sort((l,h)=>l.top-h.top);const f=[];let d=null;for(const l of x)!d||Math.abs(d.top-l.top)>6?(d={top:l.top,items:[l]},f.push(d)):d.items.push(l);for(const l of f){const h=l.items.map(y=>c?X(y.str):y.str.trim()).filter(Boolean);h.length>=2&&p.push(h)}}Ft(p,t.name);return}if(s){const p=document.getElementById("qt-sup-import-name");p&&(p.value=s)}if(i){const p=document.getElementById("qt-sup-import-date");p&&(p.value=i)}D=r,nt(),showToast(`تم استخراج (${r.length}) صنف من عرض أسعار المورد "${s||"المورد"}" بنجاح ✨`,"success")}catch(n){it(n.message||"حدث خطأ أثناء معالجة ملف الـ PDF")}}window.handlePastedSupplierText=()=>{const n=(document.getElementById("qt-sup-paste-area")?.value||"").trim();if(!n){it("يرجى لصق بيانات الجدول في المربع أولاً.");return}$t(!0,"جارٍ تحليل النصوص المنسوخة واستخراج أصناف المورد...");try{const o=n.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).map(s=>s.split("	").map(i=>i.trim()));Ft(o,"بيانات_منسوخة")}catch(e){it(e.message||"حدث خطأ أثناء تحليل البيانات المنسوخة")}};function Ft(t,n){if(!t||t.length===0)throw new Error("الملف لا يحتوي على أي صفوف أو بيانات.");let e=-1,o={name:-1,unit:-1,price:-1,sku:-1,notes:-1};for(let r=0;r<Math.min(t.length,15);r++){const u=t[r].map(m=>String(m||"").trim().toLowerCase());let g=!1,p=!1;for(let m=0;m<u.length;m++){const x=u[m];x&&(/اسم\s*(الصنف|المنتج|المادة)|البيان|الوصف|الصنف|المنتج|المادة|description|product|item\s*name/i.test(x)?(o.name=m,g=!0):/الوحدة|نوع\s*الوحدة|العبوة|unit|uom|pack/i.test(x)?o.unit=m:/سعر\s*(التكلفة|الشراء|الوحدة|الصنف|الافرادي)?|السعر|التكلفة|price|cost|rate|unit\s*price/i.test(x)&&!/إجمالي|الاجمالي|total/i.test(x)?(o.price=m,p=!0):/الكود|الرمز|الباركود|sku|code|barcode/i.test(x)?o.sku=m:/ملاحظات|notes|remarks/i.test(x)&&(o.notes=m))}if(g&&p){e=r;break}}if(e===-1||o.name===-1||o.price===-1){let r=-1;for(let u=0;u<Math.min(t.length,10);u++){const g=t[u];let p=0,m=0;g.forEach((x,f)=>{const d=String(x).replace(/[^\d.]/g,"");d&&!isNaN(parseFloat(d))?m++:String(x).trim().length>2&&p++}),p>=1&&m>=1&&p+m>r&&(r=p+m,e=u>0?u-1:0,g.forEach((x,f)=>{const d=String(x).replace(/[^\d.]/g,"");d&&!isNaN(parseFloat(d))&&o.price===-1?o.price=f:String(x).trim().length>2&&o.name===-1&&(o.name=f)}))}}o.name===-1&&(o.name=0),o.price===-1&&(o.price=1);const i=(document.getElementById("qt-sup-import-tax-mode")?.value||"exclusive")==="inclusive",a=[],c=e>=0?e+1:0;for(let r=c;r<t.length;r++){const u=t[r];if(!u||u.length===0)continue;let g=String(u[o.name]||"").trim();if(!g||g.length<2||/^(الاجمالي|المجموع|إجمالي|صافي|total|subtotal|grand\s*total|vat|الضريبة)$/i.test(g))continue;xt(g)&&(g=X(g));const p=String(u[o.price]||"").replace(/[^\d.]/g,"");let m=parseFloat(p)||0;if(m<=0)continue;let x=i?Math.round(m/1.15*100)/100:m,f=Math.round(x*1.15*100)/100,d=o.unit>=0&&u[o.unit]?String(u[o.unit]).trim():"كرتون";Wt[d]&&(d=Wt[d]),(!d||d.length>20)&&(d="كرتون");const l=o.sku>=0&&u[o.sku]?String(u[o.sku]).trim():"",h=o.notes>=0&&u[o.notes]?String(u[o.notes]).trim():"";a.push({selected:!0,productName:g,sku:l,unit:d,costPrice:x,costPriceWithVat:f,notes:h})}if(a.length===0)throw new Error("لم نتمكن من استخراج أصناف وأسعار صالحة من الملف. يرجى التأكد من احتواء الملف على أعمدة (اسم الصنف والسعر).");D=a,nt()}function nt(){const t=document.getElementById("qt-sup-parsed-tbody"),n=document.getElementById("qt-sup-stat-count"),e=document.getElementById("qt-sup-preview-area");document.getElementById("sup-subpane-file"),document.getElementById("sup-subpane-paste");const o=document.getElementById("qt-sup-import-loading"),s=document.getElementById("qt-sup-import-error");o&&o.classList.add("hidden"),s&&s.classList.add("hidden"),e&&e.classList.remove("hidden"),n&&(n.textContent=`${D.length} صنف مستخرج`),t&&(t.innerHTML=D.map((i,a)=>`
    <tr style="border-bottom:1px solid var(--border-soft); ${i.selected?"":"opacity:0.4; background:var(--bg-2);"}">
      <td style="text-align:center; padding:6px;">
        <input type="checkbox" ${i.selected?"checked":""} onchange="toggleSupplierImportRow(${a}, this.checked)" />
      </td>
      <td style="text-align:center; font-size:11px; color:var(--text-2); padding:6px;">${a+1}</td>
      <td style="padding:6px;">
        <input type="text" class="input font-bold" style="font-size:12px; height:30px; width:100%; border-color:#cbd5e1;"
          value="${(i.productName||"").replace(/"/g,"&quot;")}"
          onchange="updateSupplierImportItem(${a}, 'productName', this.value)" />
      </td>
      <td style="padding:6px;">
        <input type="text" class="input mono" style="font-size:11px; height:30px; width:100%; text-align:center;"
          value="${(i.sku||"").replace(/"/g,"&quot;")}" placeholder="—"
          onchange="updateSupplierImportItem(${a}, 'sku', this.value)" />
      </td>
      <td style="padding:6px;">
        <input type="text" class="input" style="font-size:11.5px; height:30px; width:100%; text-align:center;"
          value="${(i.unit||"كرتون").replace(/"/g,"&quot;")}"
          onchange="updateSupplierImportItem(${a}, 'unit', this.value)" />
      </td>
      <td style="padding:6px;">
        <input type="number" class="input mono font-bold" style="font-size:12.5px; height:30px; width:100%; color:#166534; background:#f0fdf4; border-color:#86efac;"
          value="${i.costPrice}" min="0" step="0.01"
          onchange="updateSupplierImportItem(${a}, 'costPrice', this.value)" />
      </td>
      <td style="padding:6px; font-weight:700; color:#0284c7; font-size:12px;" class="mono">
        ${w(i.costPriceWithVat)}
      </td>
      <td style="padding:6px;">
        <input type="text" class="input" style="font-size:11px; height:30px; width:100%;"
          value="${(i.notes||"").replace(/"/g,"&quot;")}" placeholder="اختياري"
          onchange="updateSupplierImportItem(${a}, 'notes', this.value)" />
      </td>
      <td style="padding:6px; text-align:center;">
        <button type="button" class="btn btn-icon sm btn-ghost text-bad" onclick="removeSupplierImportRow(${a})">✕</button>
      </td>
    </tr>
  `).join(""))}window.toggleAllSupplierImportItems=t=>{D.forEach(n=>n.selected=t),nt()};window.toggleSupplierImportRow=(t,n)=>{D[t]&&(D[t].selected=n,nt())};window.updateSupplierImportItem=(t,n,e)=>{if(D[t]){if(n==="costPrice"){const o=parseFloat(e)||0;D[t].costPrice=o,D[t].costPriceWithVat=Math.round(o*1.15*100)/100}else D[t][n]=e;nt()}};window.removeSupplierImportRow=t=>{D.splice(t,1),nt()};window.clearExtractedSupplierItems=()=>{D.length&&confirm("هل تريد تفريغ كافة الأصناف المستخرجة؟")&&(D=[],nt())};window.addManualSupplierItemRow=()=>{D.unshift({selected:!0,productName:"صنف جديد لدى المورد",sku:"",unit:"كرتون",costPrice:0,costPriceWithVat:0,notes:""}),nt()};window.reapplySupplierTaxMode=()=>{const n=(document.getElementById("qt-sup-import-tax-mode")?.value||"exclusive")==="inclusive";D.forEach(e=>{n&&(e.costPrice=Math.round(e.costPrice/1.15*100)/100),e.costPriceWithVat=Math.round(e.costPrice*1.15*100)/100}),nt()};window.resetSupplierImport=()=>{D=[];const t=document.getElementById("qt-sup-preview-area"),n=document.getElementById("qt-sup-file-input"),e=document.getElementById("qt-sup-paste-area"),o=document.getElementById("qt-sup-import-error");t&&t.classList.add("hidden"),n&&(n.value=""),e&&(e.value=""),o&&o.classList.add("hidden")};function it(t){const n=document.getElementById("qt-sup-import-error"),e=document.getElementById("qt-sup-import-loading");n&&(n.textContent=t,n.classList.remove("hidden")),e&&e.classList.add("hidden")}function $t(t,n=""){const e=document.getElementById("qt-sup-import-loading"),o=document.getElementById("qt-sup-import-loading-text"),s=document.getElementById("qt-sup-import-error");s&&s.classList.add("hidden"),e&&e.classList.remove("hidden"),o&&n&&(o.textContent=n)}window.saveExtractedSupplierPricesToBank=async()=>{const t=document.getElementById("qt-sup-import-name"),n=t?.value.trim(),e=document.getElementById("qt-sup-import-date")?.value||U(),o=document.getElementById("qt-sup-save-bank-btn");if(!n){it("يرجى كتابة أو اختيار اسم المورد صاحب العرض أولاً."),t&&t.focus();return}const s=D.filter(i=>i.selected&&i.productName&&i.costPrice>0);if(!s.length){it("يرجى تحديد صنف واحد على الأقل يحتوي على اسم وسعر تكلفة أكبر من الصفر.");return}o&&(o.disabled=!0,o.innerHTML="<span>⏳</span> جارٍ الحفظ في بنك الموردين…");try{let i="sup_"+Date.now();const a=(qt||[]).find(u=>z(u.name)===z(n));if(a)i=a.id;else try{const u=await wt(j.suppliers(),{name:n,nameAr:n,createdAt:new Date().toISOString()});u&&u.id&&(i=u.id),qt.push({id:i,name:n})}catch(u){console.warn("Auto-create supplier note:",u)}const c={supplierId:i,supplierName:n,quoteDate:e,fileName:window._supplierCurrentFileName||"قائمة_أسعار_مورد",totalItems:s.length,items:s.map(u=>({productName:u.productName.trim(),sku:u.sku||"",unit:u.unit||"كرتون",costPrice:parseFloat(u.costPrice)||0,costPriceWithVat:parseFloat(u.costPriceWithVat)||Math.round((parseFloat(u.costPrice)||0)*1.15*100)/100,notes:u.notes||""})),createdAt:new Date().toISOString()},r=await wt(j.supplierPriceLists(),c);c.id=typeof r=="string"?r:r?.id||"spl_"+Date.now(),H.unshift(c),showToast(`تم حفظ وتثبيت (${s.length}) صنف من أسعار المورد "${n}" بنجاح ✨`,"success"),resetSupplierImport(),zt(),Q(),switchSupplierBankTab("search")}catch(i){it("حدث خطأ أثناء الحفظ: "+i.message)}finally{o&&(o.disabled=!1,o.innerHTML="✨ حفظ وتثبيت أسعار هذا المورد في قاعدة البيانات")}};window.deleteSupplierPriceListFromBank=async t=>{if(!t)return;const n=(H||[]).find(o=>o.id===t),e=n?`${n.supplierName} (${n.quoteDate})`:"هذه القائمة";if(confirm(`هل أنت متأكد من حذف قائمة أسعار المورد "${e}" من قاعدة البيانات؟`))try{await Gt(j.supplierPriceLists(),t),H=(H||[]).filter(o=>o.id!==t),zt(),me(),fe(),Q(),showToast("تم حذف قائمة أسعار المورد بنجاح 🗑️","info")}catch(o){showToast("فشل الحذف: "+o.message,"error")}};function fe(){const t=document.getElementById("qt-sup-search-tbody");if(!t)return;const n=(document.getElementById("qt-sup-search-input")?.value||"").trim(),e=z(n),o=document.getElementById("qt-sup-filter-supplier")?.value||"",s=[];if((H||[]).forEach(i=>{o&&i.supplierName!==o||(i.items||[]).forEach(a=>{e&&!z(a.productName).includes(e)||s.push({listId:i.id,supplierName:i.supplierName,quoteDate:i.quoteDate,productName:a.productName,unit:a.unit||"كرتون",costPrice:a.costPrice||0,costPriceWithVat:a.costPriceWithVat||a.costPrice*1.15})})}),!s.length){t.innerHTML='<tr><td colspan="7" style="text-align:center; padding:28px; color:var(--text-2);">لا توجد أصناف تطابق معايير البحث</td></tr>';return}t.innerHTML=s.slice(0,50).map(i=>{const a=(i.productName||"").replace(/'/g,"\\'"),c=(i.unit||"كرتون").replace(/'/g,"\\'");(i.supplierName||"").replace(/'/g,"\\'");const r=F.retailMargin||10,u=Math.round(i.costPrice*(1+r/100)*100)/100;return`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:8px 12px; font-weight:700; font-size:12.5px;">${i.productName}</td>
        <td style="padding:8px 12px;">
          <span class="badge" style="background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; font-size:11px; font-weight:700;">🏢 ${i.supplierName}</span>
        </td>
        <td style="padding:8px 12px; text-align:center; font-size:11.5px; color:var(--text-2);">${V(i.quoteDate)}</td>
        <td style="padding:8px 12px; text-align:center;">
          <span class="badge" style="background:var(--bg-2); font-size:10.5px;">${i.unit}</span>
        </td>
        <td style="padding:8px 12px; text-align:left; font-weight:800; font-size:12.5px; color:#166534;" class="mono">${w(i.costPrice)}</td>
        <td style="padding:8px 12px; text-align:left; font-weight:700; font-size:11.5px; color:#0284c7;" class="mono">${w(i.costPriceWithVat)}</td>
        <td style="padding:8px 12px; text-align:center;">
          <button type="button" class="btn btn-sm btn-primary" style="font-size:11px; padding:3px 10px; font-weight:700; background:#059669; border-color:#059669;"
            onclick="addCustomQuoteLineWithData('${a}', '${c}', ${i.costPrice}, ${r}, ${u}, ''); closeModal('qt-supplier-price-bank-modal');">
            ⚡ إدراج في العرض 🎯
          </button>
        </td>
      </tr>
    `}).join("")}function me(){const t=document.getElementById("qt-sup-lists-tbody");if(t){if(!H||!H.length){t.innerHTML='<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد قوائم أسعار موردين محفوظة حتى الآن</td></tr>';return}t.innerHTML=H.map((n,e)=>`
    <tr style="border-bottom:1px solid var(--border-soft);">
      <td style="text-align:center; font-size:11px; color:var(--text-2); padding:10px;">${e+1}</td>
      <td style="padding:10px; font-weight:800; font-size:13px; color:#1e293b;">🏢 ${n.supplierName}</td>
      <td style="padding:10px; font-size:11.5px; color:var(--text-2);"><span class="mono">${n.fileName||"—"}</span></td>
      <td style="padding:10px; text-align:center; font-size:12px; font-weight:700;">${V(n.quoteDate)}</td>
      <td style="padding:10px; text-align:center;">
        <span class="badge" style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; font-weight:800; font-size:11.5px;">📦 ${(n.items||[]).length} صنف</span>
      </td>
      <td style="padding:10px; text-align:center; font-size:11px; color:var(--text-2);">${V(n.createdAt)}</td>
      <td style="padding:10px; text-align:center;">
        <div style="display:flex; gap:6px; justify-content:center;">
          <button type="button" class="btn btn-sm btn-ghost" style="font-size:11px; font-weight:700; color:#2563eb;"
            onclick="document.getElementById('qt-sup-filter-supplier').value='${(n.supplierName||"").replace(/'/g,"\\'")}'; switchSupplierBankTab('search');">
            🔍 عرض الأصناف
          </button>
          <button type="button" class="btn btn-sm btn-ghost text-bad" style="font-size:11px; font-weight:700;"
            onclick="deleteSupplierPriceListFromBank('${n.id}')">
            🗑️ حذف
          </button>
        </div>
      </td>
    </tr>
  `).join("")}}window.openSupplierCompareModal=(t,n="")=>{window._supplierCompareTargetRowIndex=t??null;let e=n;if(t!=null&&v[t]&&(e=v[t].productName||""),e=(e||"").trim(),!e){showToast("يرجى كتابة اسم الصنف أولاً لمقارنة أسعار الموردين","warn");return}window._supplierCompareTargetItemName=e;const o=document.getElementById("qt-sc-title"),s=document.getElementById("qt-sc-subtitle");o&&(o.textContent=`مقارنة عروض وأسعار الموردين للصنف: "${e}"`),s&&(s.textContent="مقارنة الأسعار المقدمة من مختلف الموردين وتواريخها لاختيار أفضل تكلفة شراء");const i=yt(e),a=document.getElementById("qt-sc-stats");if(a)if(!i.length)a.innerHTML=`
        <div style="grid-column: 1 / -1; padding:12px; background:var(--bg-2); border-radius:8px; text-align:center; color:var(--text-2); font-size:12px;">
          لا توجد عروض أسعار مسجلة من الموردين لهذا الصنف في قاعدة البيانات حتى الآن.
        </div>
      `;else{const r=i.map(m=>m.costPrice).filter(m=>m>0);r.length&&Math.min(...r);const u=r.length?Math.max(...r):0,g=r.length?r.reduce((m,x)=>m+x,0)/r.length:0,p=i[0];a.innerHTML=`
        <div style="background:#f0fdf4; border:1.5px solid #86efac; border-radius:10px; padding:10px 14px; text-align:center;">
          <div style="font-size:10.5px; color:#166534; font-weight:700;">⭐ أرخص وأفضل مورد</div>
          <div class="mono" style="font-size:16px; font-weight:900; color:#15803d; margin:2px 0;">${w(p.costPrice)}</div>
          <div style="font-size:10px; color:#166534; font-weight:700;">${p.supplierName.slice(0,16)}</div>
        </div>
        <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:10px 14px; text-align:center;">
          <div style="font-size:10.5px; color:#991b1b; font-weight:700;">📈 أعلى سعر معروض</div>
          <div class="mono" style="font-size:16px; font-weight:800; color:#b91c1c; margin:2px 0;">${w(u)}</div>
          <div style="font-size:9.5px; color:#f87171;">شامل 15%: ${w(u*1.15)}</div>
        </div>
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:10px 14px; text-align:center;">
          <div style="font-size:10.5px; color:#1e40af; font-weight:700;">⚖️ متوسط تكلفة الشراء</div>
          <div class="mono" style="font-size:16px; font-weight:800; color:#1e3a8a; margin:2px 0;">${w(Math.round(g*100)/100)}</div>
          <div style="font-size:9.5px; color:#60a5fa;">من أصل (${r.length}) موردين</div>
        </div>
        <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:10px; padding:10px 14px; text-align:center;">
          <div style="font-size:10.5px; color:#6b21a8; font-weight:700;">🏢 الموردين المتوفر لديهم</div>
          <div class="mono" style="font-size:16px; font-weight:800; color:#7e22ce; margin:2px 0;">${i.length} مورد</div>
          <div style="font-size:9.5px; color:#c084fc;">جاهز للطلب المباشر</div>
        </div>
      `}const c=document.getElementById("qt-sc-tbody");c&&(i.length?c.innerHTML=i.map((r,u)=>{const g=u===0,p=(r.supplierName||"").replace(/'/g,"\\'"),m=(r.unit||"كرتون").replace(/'/g,"\\'");return`
          <tr style="border-bottom:1px solid var(--border-soft); ${g?"background:rgba(16,185,129,0.06);":""}">
            <td style="padding:10px 12px;">
              <div style="font-weight:800; font-size:12.5px; color:#1e293b;">${r.supplierName}</div>
              ${g?'<span class="badge" style="font-size:9.5px; background:#dcfce7; color:#15803d; padding:1px 6px; font-weight:800;">⭐ الأرخص والأفضل</span>':""}
            </td>
            <td style="padding:10px 12px; text-align:center; font-size:11.5px; color:var(--text-2);">${V(r.quoteDate)}</td>
            <td style="padding:10px 12px; text-align:center;">
              <span class="badge" style="font-size:10px; background:var(--bg-2);">${r.unit}</span>
            </td>
            <td style="padding:10px 12px; text-align:left; font-weight:900; font-size:13px; color:#166534;" class="mono">
              ${w(r.costPrice)}
            </td>
            <td style="padding:10px 12px; text-align:left; font-weight:700; font-size:12px; color:#0284c7;" class="mono">
              ${w(r.costPriceWithVat)}
            </td>
            <td style="padding:10px 12px; text-align:center; font-size:11px; color:var(--text-2);">
              ${r.fileName||"قائمة أسعار"}
            </td>
            <td style="padding:10px 12px; text-align:center;">
              <button type="button" class="btn btn-sm btn-primary" style="font-size:11px; padding:4px 12px; font-weight:800; background:#059669; border-color:#059669;"
                onclick="applySelectedSupplierCost(${r.costPrice}, '${p}', '${m}')">
                اعتماد تكلفة هذا المورد 🎯
              </button>
            </td>
          </tr>
        `}).join(""):c.innerHTML='<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-2);">لم يتم العثور على هذا الصنف في قوائم الموردين المسجلة</td></tr>'),openModal("qt-supplier-compare-modal")};window.applySelectedSupplierCost=(t,n,e)=>{const o=window._supplierCompareTargetRowIndex,s=q(t,0);if(o!=null&&v[o]){v[o].cost=Math.round(s*100)/100,v[o].lastPurchasePrice=Math.round(s*100)/100,e&&(v[o].unit=e);const i=q(v[o].margin,10);v[o].unitPrice=Math.round(s*(1+i/100)*100)/100,Q(),closeModal("qt-supplier-compare-modal"),showToast(`تم اعتماد تكلفة المورد "${n}" (${w(s)}) بنجاح 🎯`,"success")}else{const i=F.retailMargin||10,a=Math.round(s*(1+i/100)*100)/100;window.addCustomQuoteLineWithData(window._supplierCompareTargetItemName,e,s,i,a,""),closeModal("qt-supplier-compare-modal")}};window.applyCheapestSupplierCost=t=>{if(!v[t])return;const n=yt(v[t].productName);if(!n||!n.length)return;const e=n[0],o=q(e.costPrice,0);v[t].cost=Math.round(o*100)/100,v[t].lastPurchasePrice=Math.round(o*100)/100,e.unit&&(v[t].unit=e.unit);const s=q(v[t].margin,10);v[t].unitPrice=Math.round(o*(1+s/100)*100)/100,Q(),showToast(`تم تطبيق تكلفة ${e.supplierName} (${w(o)}) بنجاح ⚡`,"success")};let G=[];window.toggleQuotationsTab=()=>{const t=document.getElementById("qt-view-demand-section"),n=t&&t.style.display!=="none";window.switchQuotationsTab(n?"quotes":"demand")};window.switchQuotationsTab=t=>{const n=document.getElementById("qt-tab-btn-quotes"),e=document.getElementById("qt-tab-btn-demand"),o=document.getElementById("qt-view-quotes-section"),s=document.getElementById("qt-view-demand-section"),i=document.getElementById("qt-top-demand-text"),a=document.getElementById("qt-top-demand-icon"),c=document.getElementById("qt-top-demand-btn");t==="demand"?(n&&(n.className="btn btn-secondary",n.style.background="#f8fafc",n.style.color="#334155",n.style.border="1.5px solid #cbd5e1",n.style.borderBottom="none"),e&&(e.className="btn btn-primary",e.style.background="linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",e.style.color="#ffffff",e.style.border="none"),c&&(c.style.background="#2563eb",c.style.color="#ffffff",c.style.borderColor="#1d4ed8"),a&&(a.textContent="📋"),i&&(i.textContent="الرجوع لعروض الأسعار"),o&&(o.style.display="none"),s&&(s.style.display="block"),renderTopRequestedProducts()):(n&&(n.className="btn btn-primary",n.style.background="",n.style.color="",n.style.border=""),e&&(e.className="btn btn-secondary",e.style.background="#f8fafc",e.style.color="#334155",e.style.border="1.5px solid #cbd5e1",e.style.borderBottom="none"),c&&(c.style.background="linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",c.style.color="#e0e7ff",c.style.borderColor="#4338ca"),a&&(a.textContent="🏆"),i&&(i.textContent="أكثر الأصناف طلباً"),o&&(o.style.display="block"),s&&(s.style.display="none"))};window.openTopRequestedProductsModal=()=>{window.switchQuotationsTab("demand");const t=document.getElementById("qt-view-demand-section");t&&t.scrollIntoView({behavior:"smooth"})};window.setDemandDatePreset=t=>{const n=document.getElementById("qt-demand-from"),e=document.getElementById("qt-demand-to");if(!n||!e)return;const o=U();t==="month"?(n.value=o.slice(0,8)+"01",e.value=o):t==="all"&&(n.value="",e.value=""),renderTopRequestedProducts()};function Qe(){const t=document.getElementById("qt-demand-count-badge");if(!t)return;const n=ge({});t.textContent=`${n.length} صنف`}function ge(t={}){const n=Array.isArray(C)?C:[],e=t.from||"",o=t.to||"",s=t.status||"",i=(t.search||"").trim().toLowerCase(),a=typeof z=="function"?z(i):i;function c(d){const l=(d.customerName||"").trim(),h=(d.customerId||"").trim(),y=!h||["adhoc_customer","general","walkin","cash","null","undefined"].includes(h.toLowerCase());return l&&l.length>1?typeof z=="function"?z(l):l.toLowerCase():y?"عميل عام":h}const r=[...n].sort((d,l)=>{const h=d.updatedAt?.seconds||d.createdAt?.seconds||(d.date?new Date(d.date).getTime()/1e3:0),y=l.updatedAt?.seconds||l.createdAt?.seconds||(l.date?new Date(l.date).getTime()/1e3:0);return h-y}),u=new Map;for(const d of r){if(!d)continue;const l=c(d),h=(d.quoteNumber||d.id||"").trim().toUpperCase(),y=`${l}___${h}`;u.set(y,d)}const p=Array.from(u.values()).filter(d=>{if(!d)return!1;const l=d.date||(d.createdAt?.toDate?d.createdAt.toDate().toISOString().slice(0,10):d.createdAt?String(d.createdAt).slice(0,10):"");if(e&&l&&l<e||o&&l&&l>o)return!1;if(s==="converted"){if(d.status!=="converted"&&d.status!=="accepted")return!1}else if(s==="pending"){if(d.status!=="draft"&&d.status!=="sent")return!1}else if(s&&d.status!==s)return!1;return!0}),m=new Map;for(const d of p){const l=Array.isArray(d.items)?d.items:Array.isArray(d.lines)?d.lines:[],h=d.customerId||"",y=(d.customerName||"").trim()||"عميل عام",b=c(d),k=d.repName||"—",E=d.date||(d.createdAt?.toDate?d.createdAt.toDate().toISOString().slice(0,10):d.createdAt?String(d.createdAt).slice(0,10):""),N=d.status==="converted"||d.status==="accepted",$=`${b}___${(d.quoteNumber||d.id||"").trim().toUpperCase()}`,P=new Map;for(const I of l){if(!I)continue;const M=(I.productName||I.name||I.description||"").trim();if(!M||M.length<2)continue;const T=typeof z=="function"?z(M):M.toLowerCase(),L=parseFloat(I.qty||I.quantity)||0,_=parseFloat(I.unitPrice||I.price)||0,Y=parseFloat(I.total||I.lineTotal)||L*_,J=I.unit||"حبة",Z=I.sku||I.barcode||"";if(!P.has(T))P.set(T,{rawName:M,unit:J,sku:Z,qty:L,unitPrice:_,lineTotal:Y});else{const W=P.get(T);W.qty+=L,W.lineTotal+=Y,_>0&&(W.unitPrice=_)}}for(const[I,M]of P.entries()){m.has(I)||m.set(I,{key:I,productName:M.rawName,sku:M.sku,unit:M.unit,quoteCount:0,totalQty:0,totalValue:0,prices:[],convertedCount:0,seenQuoteKeys:new Set,customersMap:new Map});const T=m.get(I);T.seenQuoteKeys.has($)||(T.seenQuoteKeys.add($),T.quoteCount++,N&&T.convertedCount++),T.totalQty+=M.qty,T.totalValue+=M.lineTotal,M.unitPrice>0&&T.prices.push(M.unitPrice),!T.sku&&M.sku&&(T.sku=M.sku),T.customersMap.has(b)||T.customersMap.set(b,{customerId:h,customerName:y,requestCount:0,totalQty:0,totalValue:0,seenQuotes:new Set,quotes:[]});const L=T.customersMap.get(b);L.seenQuotes.has($)||(L.seenQuotes.add($),L.requestCount++),L.totalQty+=M.qty,L.totalValue+=M.lineTotal,L.quotes.push({quoteId:d.id,quoteNumber:d.quoteNumber||"—",date:E,qty:M.qty,unit:M.unit,unitPrice:M.unitPrice,lineTotal:M.lineTotal,status:d.status||"draft",repName:k})}}let x=[];for(const d of m.values()){const l=Array.from(d.customersMap.values());l.sort((E,N)=>N.requestCount-E.requestCount||N.totalQty-E.totalQty);const h=d.totalQty>0?d.totalValue/d.totalQty:d.prices.length>0?d.prices.reduce((E,N)=>E+N,0)/d.prices.length:0,y=d.prices.length>0?Math.min(...d.prices):0,b=d.prices.length>0?Math.max(...d.prices):0,k=d.quoteCount>0?Math.round(d.convertedCount/d.quoteCount*100):0;if(i){const N=(typeof z=="function"?z(d.productName):d.productName.toLowerCase()).includes(a)||d.sku.toLowerCase().includes(i),$=l.some(P=>(typeof z=="function"?z(P.customerName):P.customerName.toLowerCase()).includes(a));if(!N&&!$)continue}x.push({key:d.key,productName:d.productName,sku:d.sku,unit:d.unit,quoteCount:d.quoteCount,totalQty:Math.round(d.totalQty*100)/100,totalValue:Math.round(d.totalValue*100)/100,avgPrice:Math.round(h*100)/100,minPrice:Math.round(y*100)/100,maxPrice:Math.round(b*100)/100,customerCount:l.length,convertedCount:d.convertedCount,conversionRate:k,customers:l})}const f=t.sortBy||"count";return f==="count"?x.sort((d,l)=>l.quoteCount-d.quoteCount||l.totalQty-d.totalQty):f==="qty"?x.sort((d,l)=>l.totalQty-d.totalQty||l.quoteCount-d.quoteCount):f==="value"?x.sort((d,l)=>l.totalValue-d.totalValue||l.quoteCount-d.quoteCount):f==="customers"&&x.sort((d,l)=>l.customerCount-d.customerCount||l.quoteCount-d.quoteCount),x}window.renderTopRequestedProducts=()=>{const t=document.getElementById("qt-demand-tbody");if(!t)return;const n=document.getElementById("qt-demand-search")?.value||"",e=document.getElementById("qt-demand-from")?.value||"",o=document.getElementById("qt-demand-to")?.value||"",s=document.getElementById("qt-demand-status")?.value||"",i=document.getElementById("qt-demand-sort")?.value||"count",a=ge({search:n,from:e,to:o,status:s,sortBy:i});G=a;const c=a.length,r=a.reduce((f,d)=>f+d.quoteCount,0),u=a.reduce((f,d)=>f+d.totalQty,0),g=new Set;a.forEach(f=>f.customers.forEach(d=>g.add(d.customerId||d.customerName)));const p=g.size,m=(f,d)=>{const l=document.getElementById(f);l&&(l.textContent=d)};m("kpi-demand-prod-count",`${c} صنف`),m("kpi-demand-req-count",`${r} طلب`),m("kpi-demand-total-qty",O(u)),m("kpi-demand-cust-count",`${p} عميل`),m("qt-demand-stat-badge",`${c} صنف مسعر`);const x=a.length>0?Math.max(...a.map(f=>f.quoteCount)):1;if(!a.length){t.innerHTML=`<tr><td colspan="9" style="text-align:center; padding:36px; color:var(--text-2); font-weight:700;">
      🔍 لا توجد أصناف مطابقة للبحث أو التصفية المختارة في عروض الأسعار
    </td></tr>`;return}t.innerHTML=a.map((f,d)=>{let l=`<span class="mono font-bold" style="color:#64748b; font-size:12px;">#${d+1}</span>`,h=d%2===0?"#ffffff":"#f8fafc";d===0?(l='<span style="font-size:16px;" title="المركز الأول">🥇 1</span>',h="#fffbeb"):d===1?l='<span style="font-size:16px;" title="المركز الثاني">🥈 2</span>':d===2&&(l='<span style="font-size:16px;" title="المركز الثالث">🥉 3</span>');const y=x>0?Math.min(100,Math.round(f.quoteCount/x*100)):10;return`
      <tr style="background:${h}; border-bottom:1px solid #e2e8f0; transition:all 0.15s ease;">
        <td style="text-align:center; padding:10px 8px; font-weight:800;">${l}</td>
        
        <td style="padding:10px 12px;">
          <strong style="color:var(--text-1); font-size:13.5px;">${f.productName}</strong>
          <div style="font-size:11px; color:#64748b; margin-top:2px;">
            الوحدة: <strong style="color:#0f172a;">${f.unit}</strong>
            ${f.sku?` | كود: <span class="mono" style="background:#f1f5f9; padding:1px 5px; border-radius:4px;">${f.sku}</span>`:""}
          </div>
        </td>

        <td style="text-align:center; padding:10px 12px;">
          <div style="font-weight:900; font-size:14px; color:#312e81;">${f.quoteCount} مرة</div>
          <div style="background:#e0e7ff; border-radius:4px; height:5px; width:90px; margin:4px auto 0; overflow:hidden;">
            <div style="background:#4338ca; height:100%; width:${y}%;"></div>
          </div>
        </td>

        <td class="mono font-bold" style="text-align:left; font-size:13.5px; padding:10px 12px; color:#0f172a;">
          ${O(f.totalQty)} <small style="color:#64748b; font-weight:600;">${f.unit}</small>
        </td>

        <td class="mono font-bold" style="text-align:left; font-size:13px; padding:10px 12px; color:#0369a1;">
          ${w(f.avgPrice)}
          <div style="font-size:9.5px; color:#64748b; font-weight:600;">(من ${w(f.minPrice)} إلى ${w(f.maxPrice)})</div>
        </td>

        <td class="mono font-bold text-ok" style="text-align:left; font-size:13.5px; padding:10px 12px;">
          ${w(f.totalValue)}
        </td>

        <td style="text-align:center; padding:10px 8px;">
          <span class="badge" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; font-weight:800; font-size:11.5px; padding:4px 9px; border-radius:8px;">
            👥 ${f.customerCount} عميل
          </span>
        </td>

        <td style="text-align:center; padding:10px 8px;">
          <span class="badge" style="background:${f.conversionRate>0?"#ecfdf5":"#f8fafc"}; color:${f.conversionRate>0?"#047857":"#64748b"}; border:1px solid ${f.conversionRate>0?"#a7f3d0":"#e2e8f0"}; font-weight:800; font-size:11px; padding:3px 8px; border-radius:8px;">
            ${f.conversionRate}% (${f.convertedCount} بيع)
          </span>
        </td>

        <td style="text-align:center; padding:10px 8px;">
          <button type="button" class="btn btn-sm" id="btn-toggle-demand-${d}" onclick="toggleDemandCustomerRow(${d})"
            style="background:#f1f5f9; color:#1e1b4b; border:1.5px solid #cbd5e1; font-weight:800; font-size:11.5px; padding:5px 11px; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:all 0.15s;">
            <span>👥 من هم العملاء؟</span> <span id="caret-demand-${d}">▼</span>
          </button>
        </td>
      </tr>

      <!-- Sub-row: Customer Breakdown (ومن من؟) -->
      <tr id="demand-cust-subrow-${d}" style="display:none; background:#f8fafc; border-top:1.5px dashed #cbd5e1; border-bottom:2px solid #cbd5e1;">
        <td colspan="9" style="padding:14px 20px;">
          <div style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:12px; padding:16px; box-shadow:0 4px 14px rgba(0,0,0,0.03);">
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1.5px solid #f1f5f9; padding-bottom:8px;">
              <div style="font-weight:900; font-size:13.5px; color:#1e1b4b; display:flex; align-items:center; gap:8px;">
                <span>👥</span> قائمة العملاء الذين طلبوا صنف «${f.productName}» (${f.customers.length} عميل):
              </div>
              <div style="font-size:11.5px; color:#64748b; font-weight:700;">
                إجمالي مرات الطلب: <strong style="color:#4338ca;">${f.quoteCount} مرة</strong> | إجمالي الكمية: <strong style="color:#047857;">${O(f.totalQty)} ${f.unit}</strong>
              </div>
            </div>

            <!-- Customer Breakdown Table -->
            <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:4px;">
              <thead>
                <tr style="background:#f1f5f9; color:#334155; border-bottom:1.5px solid #cbd5e1;">
                  <th style="padding:8px 10px; text-align:right;">العميل (من من؟)</th>
                  <th style="padding:8px 10px; text-align:center; width:120px;">مرات الطلب</th>
                  <th style="padding:8px 10px; text-align:left; width:130px;">الكمية المطلوبة</th>
                  <th style="padding:8px 10px; text-align:left; width:130px;">إجمالي القيمة</th>
                  <th style="padding:8px 10px; text-align:right;">عروض الأسعار والتواريخ والأسعار</th>
                </tr>
              </thead>
              <tbody>
                ${f.customers.map(b=>`
                  <tr style="border-bottom:1px solid #e2e8f0;">
                    <td style="padding:9px 10px;">
                      <strong style="color:#0f172a; font-size:13px;">👤 ${b.customerName}</strong>
                    </td>
                    <td style="padding:9px 10px; text-align:center;">
                      <span class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:900; font-size:11px; padding:2px 8px; border-radius:6px;">${b.requestCount} مرة</span>
                    </td>
                    <td class="mono font-bold" style="padding:9px 10px; text-align:left; color:#0f172a;">
                      ${O(b.totalQty)} <small style="font-weight:600; color:#64748b;">${f.unit}</small>
                    </td>
                    <td class="mono font-bold" style="padding:9px 10px; text-align:left; color:#047857;">
                      ${w(b.totalValue)}
                    </td>
                    <td style="padding:9px 10px;">
                      <div style="display:flex; flex-wrap:wrap; gap:6px;">
                        ${b.quotes.map(k=>`
                          <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:4px 8px; font-size:11px; display:inline-flex; align-items:center; gap:6px;">
                            <span style="font-weight:900; color:#1e1b4b; cursor:pointer;" onclick="viewQuote('${k.quoteId}')" title="معاينة عرض السعر">📄 ${k.quoteNumber}</span>
                            <span style="color:#64748b;">📅 ${k.date||"—"}</span>
                            <span style="color:#047857; font-weight:800;">📦 ${O(k.qty)} ${k.unit}</span>
                            <span class="mono" style="font-weight:800; color:#0369a1;">💰 ${w(k.unitPrice)}</span>
                            ${Pt(k.status)}
                            ${k.repName&&k.repName!=="—"?`<span style="color:#64748b; font-size:10px;">👤 ${k.repName}</span>`:""}
                          </div>
                        `).join("")}
                      </div>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>

          </div>
        </td>
      </tr>`}).join("")};window.toggleDemandCustomerRow=t=>{const n=document.getElementById(`demand-cust-subrow-${t}`),e=document.getElementById(`caret-demand-${t}`),o=document.getElementById(`btn-toggle-demand-${t}`);if(!n)return;const s=n.style.display==="none";n.style.display=s?"table-row":"none",e&&(e.textContent=s?"▲":"▼"),o&&(o.style.background=s?"#1e1b4b":"#f1f5f9",o.style.color=s?"#ffffff":"#1e1b4b")};window.exportTopRequestedProductsExcel=async()=>{if(!G||!G.length){showToast("لا توجد بيانات أصناف للتصدير في العرض الحالي","warning");return}const t=["الترتيب","اسم الصنف","كود الصنف","الوحدة","كم مرة طُلب (تكرار العروض)","إجمالي الكمية المطلوبة","متوسط السعر المعروض (ر.س)","أدنى سعر معروض (ر.س)","أقصى سعر معروض (ر.س)","إجمالي القيمة التقديرية (ر.س)","عدد العملاء الطالبين","نسبة التحويل للبيع %","قائمة العملاء الطالبين وتفاصيل طلباتهم"],n=G.map((o,s)=>{const i=o.customers.map(a=>`${a.customerName} (${a.requestCount} مرة - ${O(a.totalQty)} ${o.unit})`).join(" | ");return[s+1,o.productName,o.sku||"",o.unit,o.quoteCount,o.totalQty,o.avgPrice,o.minPrice,o.maxPrice,o.totalValue,o.customerCount,`${o.conversionRate}%`,i]}),e=[8,30,14,10,16,16,16,14,14,18,14,14,50];try{await xe({title:"أكثر_الأصناف_طلباً_في_عروض_الأسعار",headers:t,rows:n,colWidths:e,user:Ct?.displayName||"مبيعات إدهام"}),showToast("تم تصدير ملف Excel بنجاح","success")}catch(o){showToast(`فشل تصدير Excel: ${o.message}`,"error")}};window.printTopRequestedProductsReport=async()=>{if(!G||!G.length){showToast("لا توجد بيانات أصناف للطباعة","warning");return}let t={};try{const{getDoc:f,doc:d}=await mt(async()=>{const{getDoc:y,doc:b}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:y,doc:b}},[]),[l,h]=await Promise.all([f(d(et,`companies/${ot}/settings`,"company")),f(d(et,`companies/${ot}/settings`,"logo"))]);l.exists()&&(t=l.data()),h.exists()&&(t.logoUrl=h.data().dataUrl||h.data().logoUrl||"")}catch{}const n=t.name||t.companyName||"مؤسسة إدهام للمواد الغذائية",e=[t.address,t.city,t.zip,t.country].filter(Boolean).join("، ")||"المملكة العربية السعودية",o=t.phone||t.mobile||"",s=t.vatNumber||t.vat||t.taxNumber||"";t.crNumber||t.cr;const i=t.logoUrl||"",a=document.getElementById("qt-demand-from")?.value||"",c=document.getElementById("qt-demand-to")?.value||"",r=G.length,u=G.reduce((f,d)=>f+d.quoteCount,0),g=G.reduce((f,d)=>f+d.totalQty,0),p=G.reduce((f,d)=>f+d.totalValue,0),m=G.map((f,d)=>`
    <tr>
      <td style="text-align:center;font-weight:800;">${d+1}</td>
      <td><strong>${f.productName}</strong> <small style="color:#64748b;">(${f.unit})</small></td>
      <td style="text-align:center;font-weight:900;color:#312e81;">${f.quoteCount} مرة</td>
      <td style="text-align:left;" class="mono">${O(f.totalQty)}</td>
      <td style="text-align:left;" class="mono">${w(f.avgPrice)}</td>
      <td style="text-align:left;" class="mono font-bold">${w(f.totalValue)}</td>
      <td>
        <div style="font-size:10.5px;color:#0f172a;line-height:1.6;">
          ${f.customers.map(l=>`• <strong>${l.customerName}</strong> (${l.requestCount} مرة — ${O(l.totalQty)} ${f.unit})`).join("<br>")}
        </div>
      </td>
    </tr>
  `).join(""),x=window.open("","_blank","width=1000,height=850");x.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>تقرير أكثر الأصناف طلباً في عروض الأسعار — ${n}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4 landscape; margin: 8mm; }
    body { font-family:'Cairo',Arial,sans-serif; direction:rtl; padding:18px; color:#0f172a; background:#fff; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
    table { width:100%; border-collapse:collapse; font-size:11px; margin-top:12px; }
    th { background:#1e293b; color:#fff !important; padding:8px 10px; font-weight:800; border:1px solid #cbd5e1; }
    td { padding:8px 10px; border:1px solid #cbd5e1; }
    .mono { font-family:monospace; }
    @media print {
      body { padding:0; }
      .no-print { display:none; }
    }
  </style>
</head>
<body>
  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2.5px solid #0f172a; padding-bottom:12px; margin-bottom:14px;">
    <div style="display:flex; align-items:center; gap:14px;">
      ${i?`<img src="${i}" style="height:65px; width:65px; object-fit:contain;" />`:""}
      <div>
        <h1 style="font-size:20px; font-weight:900; color:#0f172a; margin-bottom:3px;">${n}</h1>
        <div style="font-size:11px; color:#475569;">📍 ${e} ${o?`| 📞 ${o}`:""} ${s?`| الرقم الضريبي: ${s}`:""}</div>
      </div>
    </div>
    <div style="text-align:left;">
      <div style="background:#f1f5f9; padding:8px 16px; border-radius:8px; border:1.5px solid #cbd5e1;">
        <div style="font-size:14px; font-weight:900; color:#1e1b4b;">تقرير أكثر الأصناف طلباً في عروض الأسعار والعملاء</div>
        <div style="font-size:10.5px; color:#64748b; margin-top:2px;">الفترة: ${a?Rt(a):"البداية"} إلى ${c?Rt(c):"اليوم"} | تاريخ الاستخراج: ${new Date().toLocaleDateString("ar-SA")}</div>
      </div>
    </div>
  </div>

  <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:12px;">
    <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:8px 12px; text-align:center;">
      <div style="font-size:10px; color:#64748b;">الأصناف المسعرة</div>
      <div style="font-size:15px; font-weight:900; color:#0f172a;">${r} صنف</div>
    </div>
    <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:8px 12px; text-align:center;">
      <div style="font-size:10px; color:#64748b;">إجمالي مرات طلب الأصناف</div>
      <div style="font-size:15px; font-weight:900; color:#312e81;">${u} طلب</div>
    </div>
    <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:8px 12px; text-align:center;">
      <div style="font-size:10px; color:#64748b;">إجمالي الكميات المسعرة</div>
      <div style="font-size:15px; font-weight:900; color:#0f172a;">${O(g)}</div>
    </div>
    <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:8px 12px; text-align:center;">
      <div style="font-size:10px; color:#64748b;">إجمالي القيمة التقديرية</div>
      <div style="font-size:15px; font-weight:900; color:#047857;">${w(p)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:40px;">#</th>
        <th>اسم الصنف والوحدة</th>
        <th style="width:110px;text-align:center;">كم مرة طُلب؟</th>
        <th style="width:110px;text-align:left;">إجمالي الكمية</th>
        <th style="width:110px;text-align:left;">متوسط السعر</th>
        <th style="width:120px;text-align:left;">إجمالي القيمة</th>
        <th>العملاء الطالبون للصنف وتفاصيل طلباتهم (من من؟)</th>
      </tr>
    </thead>
    <tbody>
      ${m}
    </tbody>
  </table>

  <div style="margin-top:30px; display:flex; justify-content:space-between; font-size:11px; color:#475569; border-top:1px dashed #cbd5e1; padding-top:12px;">
    <div><strong>إعداد مسؤول المبيعات:</strong> .....................................</div>
    <div><strong>مراجعة الإدارة المالية:</strong> .....................................</div>
    <div><strong>اعتماد المدير العام:</strong> .....................................</div>
  </div>
</body>
</html>`),x.document.close(),setTimeout(()=>{x.focus(),x.print()},700)};window.openTier1MarginsModal=()=>{let t=document.getElementById("qt-tier1-margins-modal");if(!t)t=document.createElement("div"),t.id="qt-tier1-margins-modal",t.className="modal-backdrop hidden",t.innerHTML=`
      <div class="modal-card" style="max-width:500px; width:92%; border-radius:12px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.25); background:#fff;">
        <div class="modal-header" style="background:linear-gradient(135deg,#065f46,#047857); color:#fff; padding:14px 18px; display:flex; justify-content:space-between; align-items:center;">
          <div style="font-weight:800; font-size:14px; display:flex; align-items:center; gap:8px;">
            <span>⚙️</span> ضبط هوامش أرباح السلع (فئة أولى)
          </div>
          <button type="button" class="btn btn-ghost btn-sm" onclick="closeModal('qt-tier1-margins-modal')" style="color:#fff; font-size:16px; padding:0 6px;">✕</button>
        </div>
        <div class="modal-body" style="padding:16px 20px; background:#fff; display:flex; flex-direction:column; gap:12px;">
          <p style="font-size:12px; color:var(--text-2); margin:0; line-height:1.6;">
            تُطبق هذه النسب تلقائياً فوق سعر التكلفة عند إنشاء عرض سعر لعميل <strong>فئة أولى</strong> (دون التأثير على أي عميل آخر أو على باقي البرنامج):
          </p>

          <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px 14px;">
            <label style="font-size:12px; font-weight:700; color:#065f46; display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
              <span>🌾 سلع استراتيجية أساسية (زيوت، أرز، سكر، دقيق، حليب)</span>
              <span style="font-size:10.5px; color:#047857; font-weight:600;">(النطاق: 3% - 5%)</span>
            </label>
            <div style="display:flex; align-items:center; gap:8px;">
              <input type="number" id="t1-margin-basic" class="input mono" style="font-size:14px; font-weight:800; height:36px; border-color:#86efac;" step="0.5" min="0" max="100" value="${A.basic}" />
              <span style="font-size:13px; font-weight:700; color:#065f46;">%</span>
            </div>
          </div>

          <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:10px 14px;">
            <label style="font-size:12px; font-weight:700; color:#1e40af; display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
              <span>🥫 سلع استهلاكية متوسطة (صلصة، إندومي، معلبات، مكرونة)</span>
              <span style="font-size:10.5px; color:#2563eb; font-weight:600;">(النطاق: 6% - 10%)</span>
            </label>
            <div style="display:flex; align-items:center; gap:8px;">
              <input type="number" id="t1-margin-medium" class="input mono" style="font-size:14px; font-weight:800; height:36px; border-color:#93c5fd;" step="0.5" min="0" max="100" value="${A.medium}" />
              <span style="font-size:13px; font-weight:700; color:#1e40af;">%</span>
            </div>
          </div>

          <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:8px; padding:10px 14px;">
            <label style="font-size:12px; font-weight:700; color:#6b21a8; display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
              <span>📦 أدوات التغليف والمنظفات والبلاستيك (سفرة، أكياس، صابون)</span>
              <span style="font-size:10.5px; color:#7c3aed; font-weight:600;">(النطاق: 11% - 15%)</span>
            </label>
            <div style="display:flex; align-items:center; gap:8px;">
              <input type="number" id="t1-margin-high" class="input mono" style="font-size:14px; font-weight:800; height:36px; border-color:#d8b4fe;" step="0.5" min="0" max="100" value="${A.high}" />
              <span style="font-size:13px; font-weight:700; color:#6b21a8;">%</span>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="padding:12px 18px; background:#f8fafc; border-top:1px solid #e2e8f0; display:flex; justify-content:flex-end; gap:8px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('qt-tier1-margins-modal')">إلغاء</button>
          <button type="button" class="btn btn-primary" id="save-t1-margins-btn" onclick="saveTier1Margins()" style="background:#059669; border-color:#059669; font-weight:700;">💾 حفظ واعتماد النسب</button>
        </div>
      </div>
    `,document.body.appendChild(t);else{const n=document.getElementById("t1-margin-basic"),e=document.getElementById("t1-margin-medium"),o=document.getElementById("t1-margin-high");n&&(n.value=A.basic),e&&(e.value=A.medium),o&&(o.value=A.high)}openModal("qt-tier1-margins-modal")};window.saveTier1Margins=async()=>{const t=document.getElementById("save-t1-margins-btn");t&&(t.disabled=!0,t.textContent="جارٍ الحفظ…");const n=parseFloat(document.getElementById("t1-margin-basic")?.value)||0,e=parseFloat(document.getElementById("t1-margin-medium")?.value)||0,o=parseFloat(document.getElementById("t1-margin-high")?.value)||0;A.basic=n,A.medium=e,A.high=o;try{const{doc:s,setDoc:i}=await mt(async()=>{const{doc:u,setDoc:g}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:u,setDoc:g}},[]),a=s(et,`companies/${ot}/settings`,"tier1Margins");await i(a,{basic:n,medium:e,high:o,updatedAt:new Date},{merge:!0});const c=s(et,`companies/${ot}/settings`,"priceListMargins");await i(c,{tier1Basic:n,tier1Medium:e,tier1High:o},{merge:!0}),showToast("تم حفظ وتحديث نسب هوامش الفئة الأولى بنجاح ✅","success"),closeModal("qt-tier1-margins-modal"),It(),document.getElementById("qt-pricelist")?.value==="tier1"&&onPricelistChange()}catch(s){showToast("خطأ في حفظ النسب: "+s.message,"error")}finally{t&&(t.disabled=!1,t.textContent="💾 حفظ واعتماد النسب")}};export{Lt as getProductTier1Group,lt as getTier1MarginForProduct,Zt as isCustomerTier1,Ue as render,It as updateTier1UI};
