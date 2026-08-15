import{t as z,g as C,C as _,p as M,f as b,k as y}from"./index-HrCilPJ3.js";import{orderBy as D,query as O,where as j,getDocs as N}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let T=[],E=[],c=null,L=[];async function K(a,s){a.innerHTML=`
    <!-- Top Filter Bar -->
    <div class="filterbar no-print">
      <div class="form-group" style="width:280px; margin:0;">
        <label style="font-size:11px; margin-bottom:4px; font-weight:bold;">الصنف المطلوب *</label>
        <div class="autocomplete-container" style="position:relative;">
          <input type="text" id="sc-product-search" class="input" placeholder="🔍 ابحث بالاسم، الكود، الباركود..." autocomplete="off" />
          <div class="autocomplete-results hidden" id="sc-product-results" style="position:absolute; width:100%; z-index:999; max-height:200px; overflow-y:auto; background:var(--bg-1); border:1.5px solid var(--border-soft); border-radius:8px; box-shadow:var(--shadow);"></div>
          <input type="hidden" id="sc-product-id" />
        </div>
      </div>

      <div class="filter-select-group">
        <label>المستودع</label>
        <select id="sc-wh-filter" class="input">
          <option value="">جميع المستودعات</option>
        </select>
      </div>

      <div class="filter-select-group">
        <label>نوع العملية</label>
        <select id="sc-type-filter" class="input">
          <option value="">جميع العمليات</option>
          <option value="sales">مبيعات</option>
          <option value="purchases">مشتريات</option>
          <option value="transfers">تحويل مخزني</option>
          <option value="adjustments">تسويات وإتلاف</option>
        </select>
      </div>

      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="sc-date-from" value="${new Date(new Date().setDate(1)).toISOString().split("T")[0]}" />
      </div>

      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="sc-date-to" value="${z()}" />
      </div>

      <div style="margin-right:auto; display:flex; gap:8px; align-items:flex-end;">
        <button class="btn btn-primary" onclick="loadStockCardReport()">🔍 عرض الحركة</button>
        <button class="btn-export" onclick="exportPagePDF('.data-dense','كرت_الصنف')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportPageExcel('.data-dense','كرت_الصنف')" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
      </div>
    </div>

    <!-- Page Content -->
    <div class="page-content">
      <!-- Title -->
      <div class="page-header flex justify-between items-center">
        <div>
          <h1 class="page-title">دفتر الأستاذ التفصيلي للمخزون (كرت الصنف)</h1>
          <p class="page-subtitle" id="sc-subtitle">يرجى اختيار صنف لعرض سجل الحركات وكميات المخازن التفصيلية</p>
        </div>
        <div class="no-print">
          <span id="sc-zatca-badge" class="badge good hidden">مطابق لمتطلبات هيئة الزكاة والضريبة والجمارك</span>
        </div>
      </div>

      <!-- Item Profile Card -->
      <div id="sc-profile-wrapper" class="hidden">
        <div class="grid-4 gap-16 mb-24">
          <div class="kpi-card">
            <div class="status-bar indigo"></div>
            <div class="kpi-content">
              <div class="kpi-label">إجمالي الوارد (Inbound)</div>
              <div class="kpi-value mono text-good" id="sc-total-in">0</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="status-bar warn"></div>
            <div class="kpi-content">
              <div class="kpi-label">إجمالي الصادر (Outbound)</div>
              <div class="kpi-value mono text-bad" id="sc-total-out">0</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="status-bar good"></div>
            <div class="kpi-content">
              <div class="kpi-label">الرصيد الفعلي الحالي</div>
              <div class="kpi-value mono text-indigo" id="sc-current-balance">0</div>
            </div>
          </div>
          <div class="kpi-card">
            <div class="status-bar neutral"></div>
            <div class="kpi-content">
              <div class="kpi-label">متوسط التكلفة / القيمة الكلية</div>
              <div class="kpi-value mono" id="sc-total-valuation" style="font-size:14px; font-weight:bold;">—</div>
            </div>
          </div>
        </div>

        <!-- Detailed Movements Ledger Card -->
        <div class="card">
          <h3 style="padding:16px 20px; border-bottom:1.5px solid var(--border-soft); font-family:var(--font-heading); display:flex; justify-between; align-items:center;">
            <span>📋 حركة كرت الصنف التفصيلية</span>
            <span class="mono font-semibold" style="font-size:12px; color:var(--text-2);" id="sc-meta-info"></span>
          </h3>

          <div class="table-container">
            <table class="data-dense" id="sc-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>نوع الحركة</th>
                  <th>رقم المستند</th>
                  <th>المستودع</th>
                  <th>التشغيلة / الصلاحية</th>
                  <th style="text-align:left; color:var(--good-dark);">وارد (+)</th>
                  <th style="text-align:left; color:var(--bad-dark);">صادر (-)</th>
                  <th style="text-align:left;">الرصيد بعد</th>
                  <th style="text-align:left;">تكلفة الحركة</th>
                  <th style="text-align:left;">المتوسط المرجح</th>
                  <th style="text-align:left;">القيمة التراكمية</th>
                  <th>البيان / ملاحظات</th>
                </tr>
              </thead>
              <tbody id="sc-tbody">
                <tr><td colspan="12" class="dim" style="text-align:center; padding:32px;">يرجى اختيار الصنف من شريط البحث بالأعلى ثم الضغط على "عرض الحركة"</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Welcome Placeholder -->
      <div id="sc-placeholder" class="empty-state" style="padding:60px 20px;">
        <div class="empty-icon" style="font-size:48px;">📊</div>
        <h3>استخراج كرت حركة الصنف</h3>
        <p class="dim" style="max-width:400px; margin:0 auto 16px auto;">اختر الصنف والمستودع والتواريخ لتتبع دوران الصنف ومتوسطات التكلفة والكميات الواردة والصادرة آلياً بمستوى SAP/NetSuite.</p>
      </div>

    </div>
  `,await Promise.all([H(),F()]),R()}async function H(){try{T=await C(_.warehouses(),[D("name")]);const a=document.getElementById("sc-wh-filter");a&&(a.innerHTML='<option value="">جميع المستودعات</option>'+T.map(s=>`<option value="${s.id}">${s.name}</option>`).join(""))}catch(a){showToast(a.message,"error")}}async function F(){try{E=await C(_.products(),[D("sku")])}catch(a){showToast(a.message,"error")}}function R(){const a=document.getElementById("sc-product-search"),s=document.getElementById("sc-product-results"),g=document.getElementById("sc-product-id");if(!a||!s)return;const v=()=>{const i=a.value.trim().toLowerCase();if(!i){s.innerHTML="",s.classList.add("hidden");return}const e=E.filter(n=>n.sku?.toLowerCase().includes(i)||n.name?.toLowerCase().includes(i)||n.barcode?.includes(i)).slice(0,15);e.length===0?s.innerHTML='<div style="padding:8px 12px; color:var(--text-3); font-size:12px;">لا توجد أصناف مطابقة</div>':s.innerHTML=e.map(n=>`
        <div class="search-item" data-id="${n.id}" data-sku="${n.sku}" data-name="${n.name}" style="padding:8px 12px; cursor:pointer; font-size:12px; border-bottom:1px solid var(--border-soft); display:flex; flex-direction:column;">
          <strong style="color:var(--text-0);">${n.sku} - ${n.name}</strong>
          <span class="dim" style="font-size:10px;">الباركود: ${n.barcode||"—"} | متوسط التكلفة: ${b(n.averageCost||n.costPrice||0)}</span>
        </div>
      `).join(""),s.classList.remove("hidden")};a.addEventListener("input",M(v,300)),a.addEventListener("focus",v),document.addEventListener("click",i=>{i.target.closest(".autocomplete-container")||s.classList.add("hidden")}),s.addEventListener("click",i=>{const e=i.target.closest(".search-item");if(e){const n=e.dataset.id,$=e.dataset.sku,r=e.dataset.name;a.value=`${$} - ${r}`,g.value=n,c=E.find(x=>x.id===n),s.classList.add("hidden")}})}window.loadStockCardReport=async()=>{const a=document.getElementById("sc-product-id")?.value,s=document.getElementById("sc-wh-filter")?.value,g=document.getElementById("sc-date-from")?.value,v=document.getElementById("sc-date-to")?.value;if(!a||!c){showToast("يرجى اختيار صنف صحيح من القائمة المنسدلة أولاً","warning");return}document.getElementById("sc-placeholder").classList.add("hidden"),document.getElementById("sc-profile-wrapper").classList.remove("hidden");const i=document.getElementById("sc-tbody");i.innerHTML=`${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(12).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;try{const e=O(_.stockTransactions(),j("productId","==",a));let $=(await N(e)).docs.map(t=>({id:t.id,...t.data()}));$.sort((t,d)=>{const l=h=>{if(h.date)return h.date;let B=h.createdAt?.seconds||h.createdAt?._seconds;return B?new Date(B*1e3).toISOString().split("T")[0]:h.createdAt?.toDate?h.createdAt.toDate().toISOString().split("T")[0]:"2026-07-20"},f=l(t),u=l(d);if(f!==u)return f.localeCompare(u);const m={purchase_in:1,transfer_in:1,sale_cancel:2,sale_out:3,transfer_out:4,purchase_return:4},I=m[t.type]||5,o=m[d.type]||5;if(I!==o)return I-o;const k=t.createdAt?.seconds||t.createdAt?._seconds||0,q=d.createdAt?.seconds||d.createdAt?._seconds||0;return k-q});let r=0,x=0,p=c.costPrice||0,A=0,S=0;const w=[];if($.forEach(t=>{let d=t.date||"";if(!d&&t.createdAt)try{let o=t.createdAt.seconds||t.createdAt._seconds;if(o)d=new Date(o*1e3).toISOString().split("T")[0];else if(t.createdAt.toDate)d=t.createdAt.toDate().toISOString().split("T")[0];else if(typeof t.createdAt=="string")d=t.createdAt.split("T")[0];else{const k=new Date(t.createdAt);isNaN(k.getTime())||(d=k.toISOString().split("T")[0])}}catch{d=""}if(s&&t.warehouseId!==s)return;const l=t.qtyChange||0,f=t.costPrice||t.purchasePrice||p||0;l>0?(r+l>0?p=(r*p+l*f)/(r+l):p=f,r+=l,x=r*p,A+=l):l<0&&(r+=l,x=r*p,S+=Math.abs(l));const u=document.getElementById("sc-type-filter")?.value||"";let m=!0;if(u){const o=t.type||"";u==="sales"?m=o==="sales_invoice"||o==="sale_out"||o==="sale_cancel":u==="purchases"?m=o==="purchase_invoice"||o==="purchase_in":u==="transfers"?m=o==="transfer_out"||o==="transfer_in"||o==="transfer_cancel":u==="adjustments"&&(m=o==="adjustment"||o==="damage")}(!g||d>=g)&&(!v||d<=v)&&m&&w.push({...t,dateStr:d,qtyIn:l>0?l:0,qtyOut:l<0?Math.abs(l):0,qtyAfter:r,txCost:f,runningWAC:p,runningValuation:x,wName:T.find(o=>o.id===t.warehouseId)?.name||t.warehouseId||"—"})}),L=w,document.getElementById("sc-total-in").textContent=y(A),document.getElementById("sc-total-out").textContent=y(S),document.getElementById("sc-current-balance").textContent=y(r),document.getElementById("sc-total-valuation").innerHTML=`
      <div style="font-weight:bold; color:var(--brand);">${b(p)} <span style="font-size:10px; color:var(--text-3); font-weight:normal;">(متوسط)</span></div>
      <div class="dim" style="font-size:11px; margin-top:2px;">القيمة: ${b(r*p)}</div>
    `,document.getElementById("sc-subtitle").innerHTML=`
      بطاقة الصنف: <strong class="text-indigo">${c.name}</strong> | الكود: <strong class="mono">${c.sku}</strong> 
      | الباركود الأساسي: <strong class="mono">${c.barcode||"—"}</strong> 
      | طريقة التخزين: <strong>${c.storageTemperature==="dry"?"جاف":c.storageTemperature==="chilled"?"مبرد (1-4م)":"مجمد (-18م)"}</strong>
    `,document.getElementById("sc-meta-info").textContent=`إجمالي الحركات المفحوصة: ${w.length}`,w.length===0){i.innerHTML='<tr><td colspan="12" class="dim" style="text-align:center; padding:32px;">لا توجد حركات مسجلة للصنف خلال الفترة المحددة</td></tr>';return}const P={purchase_invoice:"فاتورة شراء (وارد)",purchase_in:"فاتورة شراء (وارد)",sales_invoice:"فاتورة بيع (صادر)",sale_out:"فاتورة بيع (صادر)",sale_cancel:"تعديل/إلغاء مبيعات",transfer_out:"تحويل صادر (-)",transfer_in:"تحويل وارد (+)",transfer_cancel:"إلغاء تحويل (+)",adjustment:"تسوية مخزنية",damage:"إتلاف مواد تالفة",assembly:"تجميع منتج (+)",disassembly:"تفكيك منتج (-)"};i.innerHTML=w.map(t=>{const d=t.expiryDate&&new Date(t.expiryDate)<new Date;return`
        <tr>
          <td class="mono dim">${t.dateStr}</td>
          <td><span class="badge neutral" style="font-size:11px;">${P[t.type]||t.type||"تسوية"}</span></td>
          <td class="mono font-bold">${t.documentNumber||t.invoiceNumber||"—"}</td>
          <td><strong>${t.wName}</strong></td>
          <td class="mono">
            ${t.batchNumber?`
              <div style="font-size:11px; font-weight:bold;">Bat: ${t.batchNumber}</div>
              <div class="${d?"text-bad":"dim"}" style="font-size:9px;">Exp: ${t.expiryDate||"—"}</div>
            `:"—"}
          </td>
          <td class="mono text-good font-bold" style="text-align:left;">${t.qtyIn?`+${y(t.qtyIn)}`:"—"}</td>
          <td class="mono text-bad font-bold" style="text-align:left;">${t.qtyOut?`-${y(t.qtyOut)}`:"—"}</td>
          <td class="mono font-bold" style="text-align:left;">${y(t.qtyAfter)}</td>
          <td class="mono" style="text-align:left;">${b(t.txCost)}</td>
          <td class="mono text-indigo font-semibold" style="text-align:left;">${b(t.runningWAC)}</td>
          <td class="mono" style="text-align:left;">${b(t.runningValuation)}</td>
          <td class="dim" style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${t.notes||""}">
            ${t.notes||"—"}
          </td>
        </tr>
      `}).join(""),c.tracking==="batch"?document.getElementById("sc-zatca-badge").classList.remove("hidden"):document.getElementById("sc-zatca-badge").classList.add("hidden")}catch(e){console.error(e),i.innerHTML=`<tr><td colspan="12" class="text-bad" style="text-align:center; padding:32px;">حدث خطأ: ${e.message}</td></tr>`}};window.exportStockCardCSV=()=>{if(!L.length||!c){showToast("يرجى جلب تقرير كرت الصنف أولاً لتصديره","warning");return}showToast("جارٍ التصدير...","info");const s=[["التاريخ","نوع الحركة","رقم المستند","المستودع","التشغيلة","وارد (+)","صادر (-)","الرصيد بعد","تكلفة الحركة","المتوسط المرجح","القيمة التراكمية","البيان"]];L.forEach(e=>{s.push([e.dateStr,e.type,e.documentNumber||e.invoiceNumber||"",e.wName,e.batchNumber||"",e.qtyIn||0,e.qtyOut||0,e.qtyAfter||0,e.txCost||0,e.runningWAC||0,e.runningValuation||0,e.notes||""])});const g=s.map(e=>e.map(n=>`"${n}"`).join(",")).join(`
`),v=new Blob(["\uFEFF"+g],{type:"text/csv;charset=utf-8;"}),i=document.createElement("a");i.href=URL.createObjectURL(v),i.download=`stock_card_${c.sku}_${new Date().toISOString().split("T")[0]}.csv`,i.click(),showToast("تم تصدير الملف بنجاح","success")};export{K as render};
