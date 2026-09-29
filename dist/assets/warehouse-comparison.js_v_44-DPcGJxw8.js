import{d as $,C,t as I,l as f,f as v}from"./index-ClmVJz2W.js";import{getDocs as T,collection as E}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let h=[],s=[];async function N(o,n){o.innerHTML=`
    <div class="filterbar no-print flex flex-wrap gap-12 items-center" style="padding:14px 20px; background:var(--bg-1); border-bottom:1px solid var(--border-soft);">
      <!-- Quick Search -->
      <div style="min-width:260px;">
        <label style="font-size:11px; font-weight:bold; color:var(--text-2); margin-bottom:4px; display:block;">بحث عن صنف</label>
        <input type="text" id="wc-search" class="form-control" placeholder="🔍 ابحث باسم الصنف أو الكود..." oninput="filterWarehouseComparison()" />
      </div>

      <!-- Hide Zero Stock Toggle -->
      <div style="display:flex; align-items:center; gap:6px; margin-top:16px;">
        <input type="checkbox" id="wc-hide-zero" onchange="filterWarehouseComparison()" checked />
        <label for="wc-hide-zero" style="font-size:12px; cursor:pointer;">إخفاء الأصناف غير المتوفرة (رصيد صفر)</label>
      </div>

      <!-- Export & Actions -->
      <div style="margin-right:auto; display:flex; gap:8px; align-items:flex-end;">
        <button class="btn btn-secondary btn-sm" onclick="exportWarehouseComparisonExcel()" title="تصدير إكسل">📊 تصدير إكسل</button>
        <button class="btn btn-secondary btn-sm" onclick="window.print()" title="طباعة">🖨️ طباعة</button>
        <button class="btn btn-primary btn-sm" onclick="loadWarehouseComparison()" title="تحديث البيانات">🔄 تحديث البيانات</button>
      </div>
    </div>

    <div class="page-content" style="padding:20px;">
      <!-- Dynamic KPI Banner Container -->
      <div class="grid-4 gap-16 mb-20" id="wc-kpi-banner">
        <div class="card" style="padding:16px;"><div class="sk" style="height:40px;"></div></div>
        <div class="card" style="padding:16px;"><div class="sk" style="height:40px;"></div></div>
        <div class="card" style="padding:16px;"><div class="sk" style="height:40px;"></div></div>
        <div class="card" style="padding:16px;"><div class="sk" style="height:40px;"></div></div>
      </div>

      <!-- Main Data Table Card -->
      <div class="card">
        <div class="card-header flex justify-between items-center" style="padding:16px 20px; border-bottom:1px solid var(--border-soft);">
          <div>
            <h2 style="font-family:var(--font-heading); font-size:16px; margin:0;">تقرير مقارنة أرصدة المستودعات والسيارات التفصيلي</h2>
            <div class="text-dim" style="font-size:12px; margin-top:2px;">مقارنة أرصدة كل صنف بالمستودع الرئيسي وسيارة مصطفى وسائر المستودعات لحظياً</div>
          </div>
          <div class="badge badge-info" id="wc-displayed-count" style="font-size:12px; padding:4px 10px;">0 صنف</div>
        </div>

        <div class="table-container">
          <table class="data-dense" id="wc-table" style="width:100%; border-collapse:collapse;">
            <thead id="wc-thead">
              <tr style="background:var(--bg-2); text-align:right;">
                <th style="padding:10px 14px;">كود الصنف (SKU)</th>
                <th style="padding:10px 14px;">اسم الصنف</th>
                <th style="padding:10px 14px;">التصنيف</th>
                <th style="padding:10px 14px;">الوحدة</th>
                <th style="padding:10px 14px; text-align:center;">المستودع الرئيسي</th>
                <th style="padding:10px 14px; text-align:center;">سيارة مصطفى</th>
                <th style="padding:10px 14px; text-align:center;">إجمالي الرصيد</th>
                <th style="padding:10px 14px; text-align:left;">متوسط التكلفة</th>
                <th style="padding:10px 14px; text-align:left;">القيمة التراكمية</th>
                <th style="padding:10px 14px; text-align:center;">الحالة</th>
              </tr>
            </thead>
            <tbody id="wc-tbody">
              ${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(10).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:14px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
            <tfoot id="wc-tfoot" style="background:var(--bg-2); font-weight:bold; border-top:2px solid var(--border-soft);">
            </tfoot>
          </table>
        </div>
      </div>
    </div>`,window.loadWarehouseComparison=z,window.filterWarehouseComparison=W,window.exportWarehouseComparisonExcel=M,await z()}async function z(){try{const[o,n,d]=await Promise.all([T(E($,`companies/${C}/products`)),T(E($,`companies/${C}/warehouses`)),T(E($,`companies/${C}/stockByWarehouse`))]),i=o.docs.map(e=>({id:e.id,...e.data()})),u=n.docs.map(e=>({id:e.id,...e.data()})),x=d.docs.map(e=>({id:e.id,...e.data()}));s=u.sort((e,r)=>{if(e.id==="W5uANJjMgfFh2p3xU4bT")return-1;if(r.id==="W5uANJjMgfFh2p3xU4bT")return 1;if(e.id==="Zyltw7uwvd0aKejdeqQq")return-1;if(r.id==="Zyltw7uwvd0aKejdeqQq")return 1;const g=e.name||"",l=r.name||"";return g.indexOf("رئيس")!==-1?-1:l.indexOf("رئيس")!==-1?1:0}),h=i.map(e=>{const r=e.id,g={};let l=0;s.forEach(m=>{const t=x.filter(a=>(a.warehouseId===m.id||a.warehouseId==m.id)&&(a.productId===r||a.productId==r)).reduce((a,c)=>a+parseFloat(c.qty||0),0);g[m.id]=Math.round(t*100)/100,l+=t}),l=Math.round(l*100)/100;const y=parseFloat(e.averageCost||e.costPrice||e.purchasePrice||0),w=Math.round(l*y*100)/100;return{id:r,sku:e.sku||"-",name:e.name||"صنف بدون اسم",categoryName:e.categoryName||e.category||"عام",unit:e.unit||"حبة",whQuantities:g,totalQty:l,unitCost:y,totalValuation:w}}),W()}catch(o){console.error("Failed to load warehouse comparison:",o),window.showToast?.("خطأ في تحميل بيانات التقرير: "+o.message,"error")}}function W(){const o=(document.getElementById("wc-search")?.value||"").trim().toLowerCase(),n=document.getElementById("wc-hide-zero")?.checked??!0,d=h.filter(i=>{if(o){const u=i.name.toLowerCase().includes(o),x=i.sku.toLowerCase().includes(o);if(!u&&!x)return!1}return!(n&&i.totalQty<=0)});L(d)}function L(o){const n=document.getElementById("wc-thead"),d=document.getElementById("wc-tbody"),i=document.getElementById("wc-tfoot"),u=document.getElementById("wc-displayed-count"),x={};s.forEach(t=>x[t.id]=0);let e=0,r=0;h.forEach(t=>{s.forEach(a=>{x[a.id]+=t.whQuantities[a.id]||0}),e+=t.totalQty,r+=t.totalValuation}),u&&(u.textContent=`${o.length} صنف`);const g=document.getElementById("wc-kpi-banner");if(g){const t=s.map((a,c)=>{const p=["--indigo","--warn","--accent","--good"],b=p[c%p.length],k=x[a.id]||0,S=h.filter(j=>(j.whQuantities[a.id]||0)>0).length;return`
        <div class="card" style="padding:16px; border-right:4px solid var(${b});">
          <div class="text-2 mb-4" style="font-size:12px;">كميات ${a.name}</div>
          <div class="mono font-bold" style="font-size:22px; color:var(${b});">${f(k)}</div>
          <div class="text-dim" style="font-size:11px; margin-top:4px;">${S} صنف متوفر</div>
        </div>`}).join("")+`
      <div class="card" style="padding:16px; border-right:4px solid var(--good);">
        <div class="text-2 mb-4" style="font-size:12px;">إجمالي المخزون الشامل</div>
        <div class="mono font-bold text-good" style="font-size:22px;">${f(e)}</div>
        <div class="text-dim" style="font-size:11px; margin-top:4px;">تقييم: ${v(r)}</div>
      </div>`;g.innerHTML=t}const l=s.map((t,a)=>{const c=["background:rgba(91,127,255,0.08); color:var(--indigo);","background:rgba(245,158,11,0.08); color:var(--warn-dark);","background:rgba(16,185,129,0.08); color:var(--good-dark);"];return`<th style="padding:10px 14px; text-align:center; ${c[a%c.length]}">${t.name}</th>`}).join("");if(n.innerHTML=`
    <tr style="background:var(--bg-2); text-align:right;">
      <th style="padding:10px 14px;">كود الصنف (SKU)</th>
      <th style="padding:10px 14px;">اسم الصنف</th>
      <th style="padding:10px 14px;">التصنيف</th>
      <th style="padding:10px 14px;">الوحدة</th>
      ${l}
      <th style="padding:10px 14px; text-align:center; background:rgba(16,185,129,0.12); color:var(--good-dark);">إجمالي الرصيد</th>
      <th style="padding:10px 14px; text-align:left;">متوسط التكلفة</th>
      <th style="padding:10px 14px; text-align:left;">القيمة التراكمية</th>
      <th style="padding:10px 14px; text-align:center;">الحالة</th>
    </tr>`,!o||o.length===0){d.innerHTML=`
      <tr>
        <td colspan="${5+s.length+3}" style="text-align:center; padding:30px; color:var(--text-2);">
          لا توجد أصناف مطابقة لخيارات الفلترة أو البحث.
        </td>
      </tr>`;return}const y={};s.forEach(t=>y[t.id]=0);let w=0,m=0;d.innerHTML=o.map(t=>{s.forEach(p=>{y[p.id]+=t.whQuantities[p.id]||0}),w+=t.totalQty,m+=t.totalValuation;let a="";t.totalQty>0?a='<span class="badge badge-success">متوفر</span>':a='<span class="badge badge-danger">غير متوفر</span>';const c=s.map((p,b)=>{const k=t.whQuantities[p.id]||0;return`<td style="padding:10px 14px; text-align:center;" class="mono font-bold ${b===0?"text-indigo":b===1?"text-warn":""}">${f(k)}</td>`}).join("");return`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:10px 14px;" class="mono">${t.sku}</td>
        <td style="padding:10px 14px; font-weight:bold;">${t.name}</td>
        <td style="padding:10px 14px; color:var(--text-2); font-size:12px;">${t.categoryName}</td>
        <td style="padding:10px 14px; color:var(--text-2); font-size:12px;">${t.unit}</td>
        ${c}
        <td style="padding:10px 14px; text-align:center; background:rgba(16,185,129,0.04);" class="mono font-bold text-good">${f(t.totalQty)}</td>
        <td style="padding:10px 14px; text-align:left;" class="mono">${v(t.unitCost)}</td>
        <td style="padding:10px 14px; text-align:left; font-weight:bold;" class="mono">${v(t.totalValuation)}</td>
        <td style="padding:10px 14px; text-align:center;">${a}</td>
      </tr>`}).join("");const Q=s.map(t=>`<td style="padding:12px 14px; text-align:center;" class="mono">${f(y[t.id]||0)}</td>`).join("");i.innerHTML=`
    <tr>
      <td colspan="4" style="padding:12px 14px;">الإجمالي الشامل لمخزون الأصناف المعروضة</td>
      ${Q}
      <td style="padding:12px 14px; text-align:center;" class="mono text-good">${f(w)}</td>
      <td></td>
      <td style="padding:12px 14px; text-align:left;" class="mono">${v(m)}</td>
      <td></td>
    </tr>`}function M(){if(!h||h.length===0){window.showToast?.("لا توجد بيانات للتصدير","warn");return}try{const o=h.map(n=>{const d={"كود الصنف (SKU)":n.sku,"اسم الصنف":n.name,التصنيف:n.categoryName,الوحدة:n.unit};return s.forEach(i=>{d[`رصيد ${i.name}`]=n.whQuantities[i.id]||0}),d["إجمالي رصيد الكيان"]=n.totalQty,d["متوسط التكلفة"]=n.unitCost,d["القيمة التراكمية"]=n.totalValuation,d});if(window.XLSX){const n=window.XLSX.utils.json_to_sheet(o),d=window.XLSX.utils.book_new();window.XLSX.utils.book_append_sheet(d,n,"مقارنة أرصدة المستودعات"),window.XLSX.writeFile(d,`تقرير_مقارنة_أرصدة_المستودعات_${I()}.xlsx`),window.showToast?.("تم تصدير ملف الإكسل بنجاح ✅","success")}else window.showToast?.("مكتبة Excel غير مثبتة","error")}catch(o){window.showToast?.("خطأ أثناء التصدير: "+o.message,"error")}}export{N as render};
