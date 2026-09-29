import{g as u,a as v,l as f}from"./index-CnctmNGr.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let p=[],y=[],m=[];async function B(i,t){i.innerHTML=`
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">⏰ تتبع تواريخ انتهاء الصلاحية</h1>
        <p class="page-subtitle">مراقبة تواريخ انتهاء صلاحية الدفعات — تنبيهات مسبقة 30 / 60 / 90 يوم</p>
      </div>

      <div class="filterbar" style="margin-bottom:16px;">
        <select id="exp-filter-days" class="form-control" style="width:200px; height:36px;" onchange="EXP_TRACK.applyFilter()">
          <option value="30">⏰ ستنتهي خلال 30 يوم</option>
          <option value="60">⚠️ ستنتهي خلال 60 يوم</option>
          <option value="90">📅 ستنتهي خلال 90 يوم</option>
          <option value="-1">🔴 منتهية الصلاحية بالفعل</option>
          <option value="0">📋 جميع الدفعات</option>
        </select>
        <input id="exp-search" type="text" class="form-control" placeholder="🔍 بحث بالصنف أو رقم الدفعة..." style="width:240px; height:36px;" oninput="EXP_TRACK.applyFilter()">
        <div style="flex:1;"></div>
        <button class="btn btn-secondary" onclick="EXP_TRACK.printReport()">🖨️ طباعة التقرير</button>
        <button class="btn btn-primary" onclick="EXP_TRACK.exportCSV()">📥 تصدير Excel</button>
      </div>

      <!-- KPI Row -->
      <div class="kpi-grid mb-24" style="grid-template-columns: repeat(5, 1fr);">
        <div class="kpi-card" style="cursor:pointer;" onclick="document.getElementById('exp-filter-days').value='-1'; EXP_TRACK.applyFilter()">
          <div class="status-bar bad"></div>
          <div class="kpi-content">
            <div class="kpi-label">منتهية الصلاحية 🔴</div>
            <div class="kpi-value mono text-bad" id="exp-kpi-expired">—</div>
          </div>
        </div>
        <div class="kpi-card" style="cursor:pointer;" onclick="document.getElementById('exp-filter-days').value='30'; EXP_TRACK.applyFilter()">
          <div class="status-bar bad"></div>
          <div class="kpi-content">
            <div class="kpi-label">تنتهي خلال 30 يوم</div>
            <div class="kpi-value mono text-bad" id="exp-kpi-30">—</div>
          </div>
        </div>
        <div class="kpi-card" style="cursor:pointer;" onclick="document.getElementById('exp-filter-days').value='60'; EXP_TRACK.applyFilter()">
          <div class="status-bar warn"></div>
          <div class="kpi-content">
            <div class="kpi-label">تنتهي خلال 60 يوم</div>
            <div class="kpi-value mono text-warn" id="exp-kpi-60">—</div>
          </div>
        </div>
        <div class="kpi-card" style="cursor:pointer;" onclick="document.getElementById('exp-filter-days').value='90'; EXP_TRACK.applyFilter()">
          <div class="status-bar warn"></div>
          <div class="kpi-content">
            <div class="kpi-label">تنتهي خلال 90 يوم</div>
            <div class="kpi-value mono text-warn" id="exp-kpi-90">—</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="status-bar good"></div>
          <div class="kpi-content">
            <div class="kpi-label">دفعات سليمة</div>
            <div class="kpi-value mono text-good" id="exp-kpi-ok">—</div>
          </div>
        </div>
      </div>

      <div id="exp-loading" class="page-loading" style="min-height:200px;"><div class="loading-spinner"></div></div>

      <div id="exp-wrap" class="hidden">
        <!-- Timeline / Alerts Banner -->
        <div id="exp-alert-banner" style="margin-bottom:16px;"></div>

        <div class="card" style="padding:0;">
          <div class="table-container">
            <table class="data-table" id="exp-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الصنف</th>
                  <th>رقم الدفعة</th>
                  <th>تاريخ الإنتاج</th>
                  <th>تاريخ الانتهاء</th>
                  <th>الأيام المتبقية</th>
                  <th>الكمية المتاحة</th>
                  <th>المخزن / الموقع</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody id="exp-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,await x()}let r=[];async function x(){try{[p,y,m]=await Promise.all([u(v.products()),u(v.stockByWarehouse()),u(v.stockTransactions())]);const i={};m.forEach(t=>{if(!t.batchNumber||!t.expiryDate)return;const a=`${t.productId}_${t.batchNumber}`;i[a]||(i[a]={productId:t.productId,productName:t.productName||g(t.productId),sku:t.sku||b(t.productId),batchNumber:t.batchNumber,productionDate:t.productionDate||"",expiryDate:t.expiryDate,warehouseId:t.warehouseId||"",warehouseName:t.warehouseName||"",location:t.location||"",qty:0}),t.type==="in"||t.type==="purchase"||t.type==="transfer_in"||t.type==="adjustment_in"?i[a].qty+=t.qty||0:i[a].qty-=t.qty||0}),r=Object.values(i).filter(t=>t.qty>0),p.forEach(t=>{if(!t.expiryDate)return;if(!r.some(s=>s.productId===t.id)){const s=y.filter(e=>e.productId===t.id).reduce((e,n)=>e+(n.qty||0),0);s>0&&r.push({productId:t.id,productName:t.name,sku:t.sku,batchNumber:"—",productionDate:"",expiryDate:t.expiryDate,warehouseId:"",warehouseName:"",location:"",qty:s})}}),k(),h(),document.getElementById("exp-loading")?.classList.add("hidden"),document.getElementById("exp-wrap")?.classList.remove("hidden")}catch(i){const t=document.getElementById("exp-loading");t&&(t.innerHTML=`<div class="alert bad">${i.message}</div>`)}}function g(i){return p.find(t=>t.id===i)?.name||"—"}function b(i){return p.find(t=>t.id===i)?.sku||"—"}function l(i){if(!i)return null;const t=new Date;t.setHours(0,0,0,0);const a=new Date(i);return a.setHours(0,0,0,0),Math.floor((a-t)/864e5)}function k(){const i=o=>document.getElementById(o);if(!i("exp-kpi-expired"))return;new Date().setHours(0,0,0,0);let a=0,s=0,e=0,n=0,d=0;r.forEach(o=>{const c=l(o.expiryDate);c!==null&&(c<0?a++:c<=30?s++:c<=60?e++:c<=90?n++:d++)}),i("exp-kpi-expired").textContent=a,i("exp-kpi-30").textContent=s,i("exp-kpi-60").textContent=e,i("exp-kpi-90").textContent=n,i("exp-kpi-ok").textContent=d}function h(){const i=parseInt(document.getElementById("exp-filter-days")?.value??"30"),t=(document.getElementById("exp-search")?.value||"").toLowerCase();let a=[...r];i===-1?a=a.filter(s=>{const e=l(s.expiryDate);return e!==null&&e<0}):i>0&&(a=a.filter(s=>{const e=l(s.expiryDate);return e!==null&&e>=0&&e<=i})),t&&(a=a.filter(s=>(s.productName||"").toLowerCase().includes(t)||(s.sku||"").toLowerCase().includes(t)||(s.batchNumber||"").toLowerCase().includes(t))),a.sort((s,e)=>new Date(s.expiryDate)-new Date(e.expiryDate)),w(a),E(a)}function w(i){const t=document.getElementById("exp-tbody");if(t){if(i.length===0){t.innerHTML='<tr><td colspan="9" class="dim" style="text-align:center; padding:40px;">لا توجد دفعات بالمعايير المحددة</td></tr>';return}t.innerHTML=i.map((a,s)=>{const e=l(a.expiryDate);let n="—",d="",o="";return e!==null&&(e<0?(n=`<span class="text-bad font-bold">${Math.abs(e)} يوم منذ الانتهاء</span>`,d="row-highlight-bad",o='<span class="badge bad">🔴 منتهية</span>'):e===0?(n='<span class="text-bad font-bold">ينتهي اليوم!</span>',d="row-highlight-bad",o='<span class="badge bad">🔴 اليوم</span>'):e<=7?(n=`<span class="text-bad font-bold">${e} يوم</span>`,d="row-highlight-bad",o='<span class="badge bad">🔴 عاجل</span>'):e<=30?(n=`<span class="text-warn font-bold">${e} يوم</span>`,d="row-highlight-warn",o='<span class="badge warn">🟡 قريب</span>'):e<=60?(n=`<span class="text-warn">${e} يوم</span>`,o='<span class="badge warn">🟡 تحذير</span>'):(n=`${e} يوم`,o='<span class="badge good">🟢 سليم</span>')),`
      <tr class="${d}">
        <td class="mono">${s+1}</td>
        <td>
          <div style="font-weight:600;">${a.productName}</div>
          <div class="mono" style="font-size:11px; color:var(--text-2);">${a.sku}</div>
        </td>
        <td class="mono font-bold">${a.batchNumber}</td>
        <td class="mono">${a.productionDate||"—"}</td>
        <td class="mono font-bold">${a.expiryDate}</td>
        <td>${n}</td>
        <td class="mono font-bold">${f(a.qty)}</td>
        <td>
          <div style="font-size:12px;">${a.warehouseName||"—"}</div>
          ${a.location?`<div class="mono" style="font-size:11px; color:var(--text-2);">${a.location}</div>`:""}
        </td>
        <td>${o}</td>
      </tr>
    `}).join("")}}function E(i){const t=document.getElementById("exp-alert-banner");if(!t)return;const a=i.filter(n=>l(n.expiryDate)<0),s=i.filter(n=>{const d=l(n.expiryDate);return d!==null&&d>=0&&d<=7});if(a.length===0&&s.length===0){t.innerHTML="";return}let e="";a.length>0&&(e+=`<div class="alert bad" style="margin-bottom:8px;">🚨 <strong>${a.length} دفعة منتهية الصلاحية</strong> — يجب إخراجها فوراً من المخزن!</div>`),s.length>0&&(e+=`<div class="alert warn" style="margin-bottom:8px;">⚠️ <strong>${s.length} دفعة</strong> ستنتهي خلال 7 أيام — يجب التصرف العاجل!</div>`),t.innerHTML=e}window.EXP_TRACK={applyFilter:h,exportCSV(){const i=["الصنف","كود الصنف","رقم الدفعة","تاريخ الإنتاج","تاريخ الانتهاء","الأيام المتبقية","الكمية","المخزن","الموقع"],t=r.map(e=>[e.productName,e.sku,e.batchNumber,e.productionDate||"",e.expiryDate,l(e.expiryDate)??"—",e.qty,e.warehouseName||"",e.location||""]),a="\uFEFF"+[i,...t].map(e=>e.map(n=>`"${n}"`).join(",")).join(`
`),s=document.createElement("a");s.href="data:text/csv;charset=utf-8,"+encodeURIComponent(a),s.download="expiry-tracking.csv",s.click()},printReport(){window.print()}};export{B as render};
