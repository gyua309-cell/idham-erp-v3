import{g as v,a as m,l as x,u as w}from"./index-BfKDPs3D.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let y=[],f=[],k=[],c=100;async function q(e,t){e.innerHTML=`
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">🔔 نقاط إعادة الطلب ومخزون الأمان</h1>
        <p class="page-subtitle">إدارة حدود الطلب التلقائي (Reorder Point) ومخزون الأمان (Safety Stock) لكل صنف</p>
      </div>

      <div class="filterbar" style="margin-bottom:16px;">
        <select id="rop-filter-wh" class="form-control" style="width:200px; height:36px;" onchange="ROP.load()">
          <option value="">جميع المخازن</option>
        </select>
        <select id="rop-filter-status" class="form-control" style="width:180px; height:36px;" onchange="ROP.applyFilter()">
          <option value="">جميع الحالات</option>
          <option value="critical">🔴 حرج (أقل من الحد)</option>
          <option value="warning">🟡 تحذير (قريب من الحد)</option>
          <option value="ok">🟢 طبيعي</option>
          <option value="nodata">⚪ بدون حدود محددة</option>
        </select>
        <input id="rop-search" type="text" class="form-control" placeholder="🔍 بحث بالكود أو الاسم..." style="width:220px; height:36px;" oninput="ROP.applyFilter()">
        <div style="flex:1"></div>
        <button class="btn btn-primary" onclick="ROP.saveAll()">💾 حفظ التغييرات</button>
        <button class="btn btn-secondary" onclick="ROP.exportCSV()">📥 تصدير CSV</button>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid mb-24" style="grid-template-columns: repeat(5, 1fr);">
        <div class="kpi-card g-blue">
          <div class="kpi-content">
            <div class="kpi-label">إجمالي الأصناف</div>
            <div class="kpi-value mono" id="rop-kpi-total">—</div>
          </div>
        </div>
        <div class="kpi-card g-orange">
          <div class="kpi-content">
            <div class="kpi-label">حرجة (تحت الحد)</div>
            <div class="kpi-value mono" id="rop-kpi-critical">—</div>
          </div>
        </div>
        <div class="kpi-card g-purple">
          <div class="kpi-content">
            <div class="kpi-label">تحذير (قريب من الحد)</div>
            <div class="kpi-value mono" id="rop-kpi-warning">—</div>
          </div>
        </div>
        <div class="kpi-card g-green">
          <div class="kpi-content">
            <div class="kpi-label">بمستوى طبيعي</div>
            <div class="kpi-value mono" id="rop-kpi-ok">—</div>
          </div>
        </div>
        <div class="kpi-card g-teal">
          <div class="kpi-content">
            <div class="kpi-label">بدون حدود</div>
            <div class="kpi-value mono" id="rop-kpi-nodata">—</div>
          </div>
        </div>
      </div>

      <div id="rop-loading" class="page-loading" style="min-height:200px;"><div class="loading-spinner"></div></div>

      <div id="rop-wrap" class="hidden">
        <div class="card" style="padding:12px 0;">
          <div style="padding:8px 16px; font-size:12px; color:var(--text-2); border-bottom:1px solid var(--border-soft); margin-bottom:4px;">
            💡 يمكنك تعديل الحدود مباشرة في الجدول ثم الضغط على "حفظ التغييرات"
          </div>
          <div class="table-container" style="max-height:70vh; overflow-y:auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>اسم الصنف</th>
                  <th>الوحدة</th>
                  <th>المخزون الحالي</th>
                  <th>حد إعادة الطلب (ROP)</th>
                  <th>مخزون الأمان</th>
                  <th>الحد الأقصى</th>
                  <th>الكمية الاقتصادية (EOQ)</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody id="rop-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,await $()}let s=[];async function $(){try{[y,f,k]=await Promise.all([v(m.products()),v(m.warehouses()),v(m.stockByWarehouse())]);const e=document.getElementById("rop-filter-wh");e&&(e.innerHTML='<option value="">جميع المخازن</option>'+f.map(t=>`<option value="${t.id}">${t.name}</option>`).join("")),g(),u(),h(),document.getElementById("rop-loading")?.classList.add("hidden"),document.getElementById("rop-wrap")?.classList.remove("hidden")}catch(e){const t=document.getElementById("rop-loading");t&&(t.innerHTML=`<div class="alert bad">${e.message}</div>`)}}function g(){const e=document.getElementById("rop-filter-wh")?.value||"",t={};k.forEach(o=>{e&&o.warehouseId!==e||(t[o.productId]=(t[o.productId]||0)+(o.qty||0))}),s=y.map(o=>{const n=t[o.id]||0,d=o.reorderLevel||0,i=o.safetyStock||0,r=o.maxStock||0,a=o.eoq||0;let l="nodata";return d>0&&(n<=0||n<=d?l="critical":n<=d*1.25?l="warning":l="ok"),{product:o,qty:n,rop:d,safety:i,maxStock:r,eoq:a,status:l}})}function u(){const e=document.getElementById("rop-tbody");if(!e)return;const t=document.getElementById("rop-search")?.value.toLowerCase()||"",o=document.getElementById("rop-filter-status")?.value||"",n=s.filter(a=>{const l=!t||(a.product.sku||"").toLowerCase().includes(t)||(a.product.name||"").toLowerCase().includes(t),b=!o||a.status===o;return l&&b});if(n.length===0){e.innerHTML='<tr><td colspan="9" class="dim" style="text-align:center; padding:30px;">لا توجد نتائج</td></tr>';return}const d={critical:'<span class="badge bad">🔴 حرج</span>',warning:'<span class="badge warn">🟡 تحذير</span>',ok:'<span class="badge good">🟢 طبيعي</span>',nodata:'<span class="badge" style="background:var(--bg-3); color:var(--text-2);">⚪ غير محدد</span>'};let r=n.slice(0,c).map(a=>`
    <tr data-pid="${a.product.id}" class="${a.status==="critical"?"row-highlight-bad":a.status==="warning"?"row-highlight-warn":""}">
      <td class="mono font-bold">${a.product.sku||"—"}</td>
      <td><strong>${a.product.name||"—"}</strong></td>
      <td class="mono">${a.product.unit||"—"}</td>
      <td class="mono font-bold ${a.qty<=0?"text-bad":a.status==="warning"?"text-warn":""}">${x(a.qty)}</td>
      <td><input type="number" class="form-control mono" style="width:90px; padding:4px 8px; text-align:center;" value="${a.rop}" data-field="reorderLevel" min="0" onchange="ROP.markDirty('${a.product.id}')"></td>
      <td><input type="number" class="form-control mono" style="width:90px; padding:4px 8px; text-align:center;" value="${a.safety}" data-field="safetyStock" min="0" onchange="ROP.markDirty('${a.product.id}')"></td>
      <td><input type="number" class="form-control mono" style="width:90px; padding:4px 8px; text-align:center;" value="${a.maxStock}" data-field="maxStock" min="0" onchange="ROP.markDirty('${a.product.id}')"></td>
      <td><input type="number" class="form-control mono" style="width:90px; padding:4px 8px; text-align:center;" value="${a.eoq}" data-field="eoq" min="0" onchange="ROP.markDirty('${a.product.id}')"></td>
      <td>${d[a.status]||"—"}</td>
    </tr>
  `).join("");if(n.length>c){const a=n.length-c;r+=`
      <tr>
        <td colspan="9" style="text-align:center; padding:12px; background:var(--bg-2);">
          <button class="btn btn-secondary btn-sm" onclick="ROP.loadMore()" style="width:240px; font-weight:600;">
             ➕ عرض المزيد (المتبقي ${a} صنف)
          </button>
        </td>
      </tr>
    `}e.innerHTML=r}function h(){const e=t=>document.getElementById(t);e("rop-kpi-total")&&(e("rop-kpi-total").textContent=s.length,e("rop-kpi-critical").textContent=s.filter(t=>t.status==="critical").length,e("rop-kpi-warning").textContent=s.filter(t=>t.status==="warning").length,e("rop-kpi-ok").textContent=s.filter(t=>t.status==="ok").length,e("rop-kpi-nodata").textContent=s.filter(t=>t.status==="nodata").length)}const p=new Set;window.ROP={markDirty(e){p.add(e)},applyFilter(){c=100,u()},async load(){c=100,g(),u(),h()},loadMore(){c+=100,u()},async saveAll(){if(p.size===0){alert("لا توجد تغييرات للحفظ");return}const e=document.querySelectorAll("#rop-tbody tr[data-pid]"),t=[];e.forEach(o=>{const n=o.dataset.pid;if(!p.has(n))return;const d={};o.querySelectorAll("input[data-field]").forEach(i=>{d[i.dataset.field]=parseFloat(i.value)||0}),t.push(w("products",n,d))});try{await Promise.all(t),e.forEach(o=>{const n=o.dataset.pid;if(!p.has(n))return;const d=y.find(i=>i.id===n);d&&o.querySelectorAll("input[data-field]").forEach(i=>{d[i.dataset.field]=parseFloat(i.value)||0})}),p.clear(),g(),u(),h(),alert(`✅ تم حفظ ${t.length} أصناف بنجاح`)}catch(o){alert("خطأ في الحفظ: "+o.message)}},exportCSV(){const e=["الكود","الاسم","الوحدة","المخزون","حد الطلب","مخزون الأمان","الحد الأقصى","EOQ","الحالة"],t={critical:"حرج",warning:"تحذير",ok:"طبيعي",nodata:"غير محدد"},o=s.map(i=>[i.product.sku,i.product.name,i.product.unit,i.qty,i.rop,i.safety,i.maxStock,i.eoq,t[i.status]||i.status]),n="\uFEFF"+[e,...o].map(i=>i.map(r=>`"${r}"`).join(",")).join(`
`),d=document.createElement("a");d.href="data:text/csv;charset=utf-8,"+encodeURIComponent(n),d.download="reorder-points.csv",d.click()}};export{q as render};
