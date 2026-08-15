import{d as C,a as T,t as L,k as f,f as k}from"./index-HrCilPJ3.js";import{getDocs as E,collection as Q}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let g=[],s=[];async function A(o,a){o.innerHTML=`
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
    </div>`,window.loadWarehouseComparison=z,window.filterWarehouseComparison=W,window.exportWarehouseComparisonExcel=B,await z()}async function z(){try{const[o,a,n]=await Promise.all([E(Q(C,`companies/${T}/products`)),E(Q(C,`companies/${T}/warehouses`)),E(Q(C,`companies/${T}/stockByWarehouse`))]),i=o.docs.map(e=>({id:e.id,...e.data()})),h=a.docs.map(e=>({id:e.id,...e.data()})),p=n.docs.map(e=>({id:e.id,...e.data()}));s=h.sort((e,r)=>{if(e.id==="W5uANJjMgfFh2p3xU4bT")return-1;if(r.id==="W5uANJjMgfFh2p3xU4bT")return 1;if(e.id==="Zyltw7uwvd0aKejdeqQq")return-1;if(r.id==="Zyltw7uwvd0aKejdeqQq")return 1;const x=e.name||"",l=r.name||"";return x.indexOf("رئيس")!==-1?-1:l.indexOf("رئيس")!==-1?1:0}),g=i.map(e=>{const r=e.id,x={};let l=0;s.forEach(m=>{const v=p.find(d=>d.productId===r&&d.warehouseId===m.id),t=v?parseFloat(v.qty||0):0;x[m.id]=Math.round(t*100)/100,l+=t}),l=Math.round(l*100)/100;const u=parseFloat(e.averageCost||e.costPrice||e.purchasePrice||0),w=Math.round(l*u*100)/100;return{id:r,sku:e.sku||"-",name:e.name||"صنف بدون اسم",categoryName:e.categoryName||e.category||"عام",unit:e.unit||"حبة",whQuantities:x,totalQty:l,unitCost:u,totalValuation:w}}),W()}catch(o){console.error("Failed to load warehouse comparison:",o),window.showToast?.("خطأ في تحميل بيانات التقرير: "+o.message,"error")}}function W(){const o=(document.getElementById("wc-search")?.value||"").trim().toLowerCase(),a=document.getElementById("wc-hide-zero")?.checked??!0,n=g.filter(i=>{if(o){const h=i.name.toLowerCase().includes(o),p=i.sku.toLowerCase().includes(o);if(!h&&!p)return!1}return!(a&&i.totalQty<=0)});M(n)}function M(o){const a=document.getElementById("wc-thead"),n=document.getElementById("wc-tbody"),i=document.getElementById("wc-tfoot"),h=document.getElementById("wc-displayed-count"),p={};s.forEach(t=>p[t.id]=0);let e=0,r=0;g.forEach(t=>{s.forEach(d=>{p[d.id]+=t.whQuantities[d.id]||0}),e+=t.totalQty,r+=t.totalValuation}),h&&(h.textContent=`${o.length} صنف`);const x=document.getElementById("wc-kpi-banner");if(x){const t=s.map((d,y)=>{const c=["--indigo","--warn","--accent","--good"],b=c[y%c.length],$=p[d.id]||0,S=g.filter(j=>(j.whQuantities[d.id]||0)>0).length;return`
        <div class="card" style="padding:16px; border-right:4px solid var(${b});">
          <div class="text-2 mb-4" style="font-size:12px;">كميات ${d.name}</div>
          <div class="mono font-bold" style="font-size:22px; color:var(${b});">${f($)}</div>
          <div class="text-dim" style="font-size:11px; margin-top:4px;">${S} صنف متوفر</div>
        </div>`}).join("")+`
      <div class="card" style="padding:16px; border-right:4px solid var(--good);">
        <div class="text-2 mb-4" style="font-size:12px;">إجمالي المخزون الشامل</div>
        <div class="mono font-bold text-good" style="font-size:22px;">${f(e)}</div>
        <div class="text-dim" style="font-size:11px; margin-top:4px;">تقييم: ${k(r)}</div>
      </div>`;x.innerHTML=t}const l=s.map((t,d)=>{const y=["background:rgba(91,127,255,0.08); color:var(--indigo);","background:rgba(245,158,11,0.08); color:var(--warn-dark);","background:rgba(16,185,129,0.08); color:var(--good-dark);"];return`<th style="padding:10px 14px; text-align:center; ${y[d%y.length]}">${t.name}</th>`}).join("");if(a.innerHTML=`
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
    </tr>`,!o||o.length===0){n.innerHTML=`
      <tr>
        <td colspan="${5+s.length+3}" style="text-align:center; padding:30px; color:var(--text-2);">
          لا توجد أصناف مطابقة لخيارات الفلترة أو البحث.
        </td>
      </tr>`;return}const u={};s.forEach(t=>u[t.id]=0);let w=0,m=0;n.innerHTML=o.map(t=>{s.forEach(c=>{u[c.id]+=t.whQuantities[c.id]||0}),w+=t.totalQty,m+=t.totalValuation;let d="";t.totalQty>0?d='<span class="badge badge-success">متوفر</span>':d='<span class="badge badge-danger">غير متوفر</span>';const y=s.map((c,b)=>{const $=t.whQuantities[c.id]||0;return`<td style="padding:10px 14px; text-align:center;" class="mono font-bold ${b===0?"text-indigo":b===1?"text-warn":""}">${f($)}</td>`}).join("");return`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:10px 14px;" class="mono">${t.sku}</td>
        <td style="padding:10px 14px; font-weight:bold;">${t.name}</td>
        <td style="padding:10px 14px; color:var(--text-2); font-size:12px;">${t.categoryName}</td>
        <td style="padding:10px 14px; color:var(--text-2); font-size:12px;">${t.unit}</td>
        ${y}
        <td style="padding:10px 14px; text-align:center; background:rgba(16,185,129,0.04);" class="mono font-bold text-good">${f(t.totalQty)}</td>
        <td style="padding:10px 14px; text-align:left;" class="mono">${k(t.unitCost)}</td>
        <td style="padding:10px 14px; text-align:left; font-weight:bold;" class="mono">${k(t.totalValuation)}</td>
        <td style="padding:10px 14px; text-align:center;">${d}</td>
      </tr>`}).join("");const v=s.map(t=>`<td style="padding:12px 14px; text-align:center;" class="mono">${f(u[t.id]||0)}</td>`).join("");i.innerHTML=`
    <tr>
      <td colspan="4" style="padding:12px 14px;">الإجمالي الشامل لمخزون الأصناف المعروضة</td>
      ${v}
      <td style="padding:12px 14px; text-align:center;" class="mono text-good">${f(w)}</td>
      <td></td>
      <td style="padding:12px 14px; text-align:left;" class="mono">${k(m)}</td>
      <td></td>
    </tr>`}function B(){if(!g||g.length===0){window.showToast?.("لا توجد بيانات للتصدير","warn");return}try{const o=g.map(a=>{const n={"كود الصنف (SKU)":a.sku,"اسم الصنف":a.name,التصنيف:a.categoryName,الوحدة:a.unit};return s.forEach(i=>{n[`رصيد ${i.name}`]=a.whQuantities[i.id]||0}),n["إجمالي رصيد الكيان"]=a.totalQty,n["متوسط التكلفة"]=a.unitCost,n["القيمة التراكمية"]=a.totalValuation,n});if(window.XLSX){const a=window.XLSX.utils.json_to_sheet(o),n=window.XLSX.utils.book_new();window.XLSX.utils.book_append_sheet(n,a,"مقارنة أرصدة المستودعات"),window.XLSX.writeFile(n,`تقرير_مقارنة_أرصدة_المستودعات_${L()}.xlsx`),window.showToast?.("تم تصدير ملف الإكسل بنجاح ✅","success")}else window.showToast?.("مكتبة Excel غير مثبتة","error")}catch(o){window.showToast?.("خطأ أثناء التصدير: "+o.message,"error")}}export{A as render};
