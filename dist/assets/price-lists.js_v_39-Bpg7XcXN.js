import{d as v,C as P,g as A,a as C,f as r,_ as z}from"./index-CnctmNGr.js";import{doc as k,getDoc as E,orderBy as I,setDoc as S}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let b=10,u=7,y=5,x=[];async function R(i,t){await B(),i.innerHTML=`
    <!-- Settings Bar for Margins -->
    <div class="filterbar" style="flex-wrap: wrap; gap: 12px; align-items: flex-end;">
      <div class="date-range-group" style="width: 140px;">
        <label>هامش ربح التجزئة (%)</label>
        <input type="number" id="pl-retail-margin" class="input mono" value="${b}" step="0.5" min="0" style="height:34px;" />
      </div>
      <div class="date-range-group" style="width: 140px;">
        <label>هامش ربح الجملة (%)</label>
        <input type="number" id="pl-wholesale-margin" class="input mono" value="${u}" step="0.5" min="0" style="height:34px;" />
      </div>
      <div class="date-range-group" style="width: 140px;">
        <label>هامش ربح التوزيع (%)</label>
        <input type="number" id="pl-distributor-margin" class="input mono" value="${y}" step="0.5" min="0" style="height:34px;" />
      </div>
      <div>
        <button class="btn btn-primary" onclick="saveMargins()" id="save-margins-btn" style="height:34px;">💾 حفظ نسب الأرباح</button>
      </div>
      
      <div style="margin-right:auto; display:flex; gap:8px; align-items:center;">
        <select id="pl-print-type" class="input" style="width: 150px; height: 34px; font-size: 12px; padding: 4px 8px; border-color: var(--brand);">
          <option value="all">كل الأسعار (مقارنة)</option>
          <option value="retail">قائمة التجزئة فقط</option>
          <option value="wholesale">قائمة الجملة فقط</option>
          <option value="distributor">قائمة التوزيع فقط</option>
        </select>
        <button class="btn btn-secondary" onclick="syncAllProductPurchasePrices(this)" title="تحديث أسعار الشراء من الفواتير">🔄 تحديث من الفواتير</button>
        <button class="btn btn-secondary" onclick="selectAllProductsForPrint(true)">☑️ تحديد الكل</button>
        <button class="btn btn-secondary" onclick="selectAllProductsForPrint(false)">⬛ إلغاء التحديد</button>
        <button class="btn btn-lime" onclick="printSelectedPriceList()" style="background:linear-gradient(135deg,#10B981,#059669);color:#fff;font-weight:700;">🖨️ طباعة قائمة الأسعار للأصناف المحددة</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">قوائم الأسعار والتسعير القائم على التكلفة</h1>
        <p class="page-subtitle">تحديد أسعار التجزئة والجملة والتوزيع تلقائياً بناءً على آخر سعر شراء (التكلفة) بالإضافة لهامش الربح والضريبة 15%</p>
      </div>

      <div class="grid-3 gap-16 mb-24" id="pl-grid">
        <!-- Render cards showing active margins -->
        <div class="card" style="padding:20px;">
          <span class="badge neutral">RETAIL</span>
          <h3 style="font-family:var(--font-heading);font-size:16px;margin-top:8px;margin-bottom:6px;">أسعار التجزئة</h3>
          <div class="mono text-indigo font-bold mb-12" style="font-size:14px;">التكلفة + <span id="card-retail-margin">${b}</span>% + 15% ضريبة</div>
          <p class="text-2" style="font-size:12px;line-height:1.5;">سعر البيع الافتراضي للقطاعي والمحلات الصغيرة</p>
        </div>
        <div class="card" style="padding:20px;">
          <span class="badge good">WHOLESALE</span>
          <h3 style="font-family:var(--font-heading);font-size:16px;margin-top:8px;margin-bottom:6px;">أسعار الجملة</h3>
          <div class="mono text-indigo font-bold mb-12" style="font-size:14px;">التكلفة + <span id="card-wholesale-margin">${u}</span>% + 15% ضريبة</div>
          <p class="text-2" style="font-size:12px;line-height:1.5;">سعر بيع الجملة المعتمد للكميات الكبيرة</p>
        </div>
        <div class="card" style="padding:20px;">
          <span class="badge indigo">DISTRIBUTOR</span>
          <h3 style="font-family:var(--font-heading);font-size:16px;margin-top:8px;margin-bottom:6px;">أسعار التوزيع</h3>
          <div class="mono text-indigo font-bold mb-12" style="font-size:14px;">التكلفة + <span id="card-distributor-margin">${y}</span>% + 15% ضريبة</div>
          <p class="text-2" style="font-size:12px;line-height:1.5;">أسعار التوزيع لكبار الموزعين والشركاء</p>
        </div>
      </div>

      <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="font-family:var(--font-heading);font-size:14px;margin:0;">مقارنة قوائم الأسعار عبر الأصناف</h3>
          <span class="text-2" id="pl-selected-count" style="font-size:12px;font-weight:600;color:var(--brand);">0 صنف محدد للطباعة</span>
        </div>
        <div class="table-container">
          <table class="data-dense" id="pl-matrix-table">
            <thead>
              <tr>
                <th style="width:40px; text-align:center;">طباعة</th>
                <th>كود الصنف (SKU)</th>
                <th>اسم الصنف</th>
                <th>سعر التكلفة (قبل الضريبة)</th>
                <th>سعر التجزئة (شامل 15%)</th>
                <th>سعر الجملة (شامل 15%)</th>
                <th>سعر التوزيع (شامل 15%)</th>
              </tr>
            </thead>
            <tbody id="pl-matrix-tbody">
              ${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(7).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,await M()}async function B(){try{const i=k(v,`companies/${P}/settings`,"priceListMargins"),t=await E(i);if(t.exists()){const a=t.data();a.retailMargin!==void 0&&(b=parseFloat(a.retailMargin)),a.wholesaleMargin!==void 0&&(u=parseFloat(a.wholesaleMargin)),a.distributorMargin!==void 0&&(y=parseFloat(a.distributorMargin))}}catch(i){console.error("Failed to load price list margins:",i)}}window.saveMargins=async()=>{const i=document.getElementById("save-margins-btn");i&&(i.disabled=!0);const t=parseFloat(document.getElementById("pl-retail-margin").value)||0,a=parseFloat(document.getElementById("pl-wholesale-margin").value)||0,s=parseFloat(document.getElementById("pl-distributor-margin").value)||0;try{const n=k(v,`companies/${P}/settings`,"priceListMargins");await S(n,{retailMargin:t,wholesaleMargin:a,distributorMargin:s,updatedAt:new Date}),b=t,u=a,y=s;const{updateDoc:g}=await z(async()=>{const{updateDoc:e}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{updateDoc:e}},[]),w=x.map(e=>{const d=e.lastPurchasePrice||e.avgCostPrice||e.purchasePrice||e.costPrice||e.averageCost||0;if(d<=0)return Promise.resolve();const l=Math.round(d*(1+t/100)*1.15*100)/100,m=Math.round(d*(1+a/100)*1.15*100)/100,o=Math.round(d*(1+s/100)*1.15*100)/100,p=k(v,`companies/${P}/products`,e.id);return g(p,{salePrice:l,priceRetail:l,priceWholesale:m,priceDistributor:o,price:l})});await Promise.all(w);const $=document.getElementById("card-retail-margin");$&&($.textContent=t);const c=document.getElementById("card-wholesale-margin");c&&(c.textContent=a);const h=document.getElementById("card-distributor-margin");h&&(h.textContent=s),showToast("تم حفظ نسب الأرباح وتحديث كافة أسعار المنتجات بقاعدة البيانات بنجاح","success"),await M()}catch(n){showToast(n.message,"error")}finally{i&&(i.disabled=!1)}};async function M(){const i=document.getElementById("pl-matrix-tbody");if(i)try{if(x=await A(C.products(),[I("name")]),x.length===0){i.innerHTML='<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد أصناف مسجلة بالنظام</td></tr>';return}i.innerHTML=x.map(t=>{const a=t.lastPurchasePrice||t.avgCostPrice||t.purchasePrice||t.costPrice||t.averageCost||0,s=a*(1+b/100)*1.15,n=a*(1+u/100)*1.15,g=a*(1+y/100)*1.15;return`
        <tr>
          <td style="text-align:center;">
            <input type="checkbox" class="pl-print-check" data-id="${t.id}" checked onchange="updateSelectedCount()" />
          </td>
          <td class="mono text-indigo" style="font-size:11px;">${t.sku||"—"}</td>
          <td class="font-heading font-semibold">${t.name}</td>
          <td class="mono font-bold">${r(a)}</td>
          <td class="mono text-indigo font-bold">${r(s)}</td>
          <td class="mono text-good font-bold">${r(n)}</td>
          <td class="mono text-lime font-bold">${r(g)}</td>
        </tr>`}).join(""),updateSelectedCount()}catch(t){i.innerHTML=`<tr><td colspan="7"><div class="alert bad">${t.message}</div></td></tr>`}}window.updateSelectedCount=()=>{const i=document.querySelectorAll(".pl-print-check:checked"),t=document.getElementById("pl-selected-count");t&&(t.textContent=`${i.length} صنف محدد للطباعة`)};window.selectAllProductsForPrint=i=>{document.querySelectorAll(".pl-print-check").forEach(t=>t.checked=i),updateSelectedCount()};window.printSelectedPriceList=async()=>{const i=document.querySelectorAll(".pl-print-check:checked");let t=Array.from(i).map(e=>e.dataset.id);t.length===0&&(t=x.map(e=>e.id));const a=x.filter(e=>t.includes(e.id));if(a.length===0){showToast("لا توجد أصناف لطباعتها","warn");return}const s=document.getElementById("pl-print-type")?.value||"all";let n={name:"شركة نظم الإمداد الحديثة",vatNumber:"312448150500003",address:"المملكة العربية السعودية",phone:"0549141648",email:"Nuzmalamdad@gmail.com"},g="";try{const{getDoc:e,doc:d}=await z(async()=>{const{getDoc:o,doc:p}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:o,doc:p}},[]),[l,m]=await Promise.all([e(d(v,`companies/${P}/settings`,"company")),e(d(v,`companies/${P}/settings`,"logo"))]);if(l.exists()){const o=l.data();o.name&&(n.name=o.name),o.vatNumber&&(n.vatNumber=o.vatNumber),o.phone&&(n.phone=o.phone),o.email&&(n.email=o.email);const p=o.city||"",f=o.country||"";n.address=[p,f].filter(Boolean).join(" — ")}m.exists()&&(g=m.data().dataUrl||"")}catch(e){console.warn("Failed to load company details for price list print:",e)}const w=window.open("","_blank");if(!w){showToast("يرجى السماح بالنوافذ المنبثقة للطباعة","warn");return}const $=a.map((e,d)=>{const l=e.lastPurchasePrice||e.avgCostPrice||e.purchasePrice||e.costPrice||e.averageCost||0,m=l*(1+b/100)*1.15,o=l*(1+u/100)*1.15,p=l*(1+y/100)*1.15;let f="";return s==="retail"?f=`<td class="mono font-bold" style="text-align:left; width:145px; color:#2563eb; font-size:13.5px;">${r(m)}</td>`:s==="wholesale"?f=`<td class="mono font-bold" style="text-align:left; width:145px; color:#059669; font-size:13.5px;">${r(o)}</td>`:s==="distributor"?f=`<td class="mono font-bold" style="text-align:left; width:145px; color:#7c3aed; font-size:13.5px;">${r(p)}</td>`:f=`
        <td class="mono font-bold" style="text-align:left; width:125px; color:#2563eb;">${r(m)}</td>
        <td class="mono font-bold" style="text-align:left; width:125px; color:#059669;">${r(o)}</td>
        <td class="mono font-bold" style="text-align:left; width:125px; color:#7c3aed;">${r(p)}</td>
      `,`
      <tr>
        <td style="text-align:center; width:45px;">${d+1}</td>
        <td class="mono" style="width:105px;">${e.sku||"—"}</td>
        <td style="text-align:right; font-weight:600; white-space:normal; word-break:break-word; min-width:320px; font-size:13.5px; color:#1e293b;">${e.name}</td>
        <td style="text-align:center; width:90px;">${e.unit||"كارتون"}</td>
        ${f}
      </tr>`}).join("");let c="",h="قائمة الأسعار الرسمية";s==="retail"?(c=`
      <tr>
        <th style="width:45px;">#</th>
        <th style="width:105px;">كود الصنف</th>
        <th style="text-align:right; min-width:320px;">اسم الصنف</th>
        <th style="width:90px;">الوحدة</th>
        <th style="width:145px; text-align:left;">سعر التجزئة</th>
      </tr>`,h="قائمة أسعار التجزئة"):s==="wholesale"?(c=`
      <tr>
        <th style="width:45px;">#</th>
        <th style="width:105px;">كود الصنف</th>
        <th style="text-align:right; min-width:320px;">اسم الصنف</th>
        <th style="width:90px;">الوحدة</th>
        <th style="width:145px; text-align:left;">سعر الجملة</th>
      </tr>`,h="قائمة أسعار الجملة"):s==="distributor"?(c=`
      <tr>
        <th style="width:45px;">#</th>
        <th style="width:105px;">كود الصنف</th>
        <th style="text-align:right; min-width:320px;">اسم الصنف</th>
        <th style="width:90px;">الوحدة</th>
        <th style="width:145px; text-align:left;">سعر التوزيع</th>
      </tr>`,h="قائمة أسعار التوزيع"):c=`
      <tr>
        <th style="width:45px;">#</th>
        <th style="width:105px;">كود الصنف</th>
        <th style="text-align:right; min-width:320px;">اسم الصنف</th>
        <th style="width:90px;">الوحدة</th>
        <th style="width:125px; text-align:left;">سعر التجزئة</th>
        <th style="width:125px; text-align:left;">سعر الجملة</th>
        <th style="width:125px; text-align:left;">سعر التوزيع</th>
      </tr>`,w.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>قائمة الأسعار والتسعير</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'IBM Plex Sans Arabic',sans-serif;direction:rtl;color:#334155;background:#fff;font-size:13px;line-height:1.5;padding:15px;}
    .no-print{display:flex;gap:10px;justify-content:center;padding:12px;border-bottom:1px solid #e2e8f0;background:#f8fafc;margin-bottom:20px;}
    .btn{padding:8px 18px;border-radius:6px;cursor:pointer;border:none;font-family:inherit;font-size:13px;font-weight:600;transition:all 0.15s;}
    .btn-blue{background:#2563eb;color:#fff;}
    .btn-gray{background:#64748b;color:#fff;}
    .page{width:210mm;margin:0 auto;padding:10mm;position:relative;background:#fff;}
    
    /* Elegant Accent frame */
    .page::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 6px;
      background: linear-gradient(90deg, #1e3a8a, #10b981, #7c3aed);
    }

    .header{display:grid;grid-template-columns:1fr auto;gap:20px;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #1e3a8a;margin-top:10px;}
    .co-logo { max-height: 65px; max-width: 140px; object-fit: contain; margin-bottom: 8px; }
    .co-name{font-size:20px;font-weight:800;color:#1e3a8a;margin-bottom:6px;letter-spacing:-0.5px;}
    .co-sub{font-size:12px;color:#64748b;margin-bottom:3px;}
    
    .doc-badge{background:#1e3a8a;color:#fff;padding:6px 18px;border-radius:6px;font-size:15px;font-weight:700;text-align:center;margin-bottom:8px;display:inline-block;}
    .doc-num{font-size:12px;color:#475569;text-align:right;margin-bottom:2px;}
    
    table{width:100%;border-collapse:collapse;margin:10px 0;font-size:12.5px;table-layout:auto;}
    th,td{padding:10px 12px;border:1px solid #cbd5e1;vertical-align:middle;}
    th{background:#1e293b;color:#ffffff;font-weight:700;font-size:12px;}
    td{color:#334155;}
    tr:nth-child(even) td{background:#f8fafc;}
    
    .mono{font-family:monospace;font-size:12px;}
    .font-bold{font-weight:700;}
    .footer{text-align:center;font-size:10px;color:#94a3b8;margin-top:40px;border-top:1px solid #e2e8f0;padding-top:10px;}
    
    @media print{
      .no-print{display:none!important;}
      .page{width:100%;padding:0;margin:0;}
      /* Force colors when printing */
      *{ -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn btn-blue" onclick="window.print()">🖨️ طباعة الآن</button>
    <button class="btn btn-gray" onclick="window.close()">✕ إغلاق</button>
  </div>
  <div class="page">
    <div class="header">
      <div>
        ${g?`<img class="co-logo" src="${g}" alt="الشعار">`:""}
        <div class="co-name">${n.name}</div>
        <div class="co-sub">الرقم الضريبي: ${n.vatNumber}</div>
        <div class="co-sub">${n.address}</div>
        <div class="co-sub">هاتف: ${n.phone} | ${n.email}</div>
      </div>
      <div style="text-align:left; display:flex; flex-direction:column; justify-content:flex-end;">
        <div><span class="doc-badge">${h}</span></div>
        <div class="doc-num">تاريخ الإصدار: <strong>${new Date().toLocaleDateString("ar-SA")}</strong></div>
        <div class="doc-num">عدد الأصناف: <strong>${a.length} صنف</strong></div>
        <div class="doc-num" style="font-size:10px;color:#888;">(الأسعار شاملة ضريبة القيمة المضافة 15%)</div>
      </div>
    </div>

    <table>
      <thead>
        ${c}
      </thead>
      <tbody>
        ${$}
      </tbody>
    </table>

    <div class="footer">
      تخضع هذه الأسعار للتحديثات المستمرة ووفقاً للسياسة الائتمانية والتعاقدية المعتمدة للمؤسسة.
    </div>
  </div>
</body>
</html>`),w.document.close()};export{R as render};
