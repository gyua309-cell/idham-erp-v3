import{g as c,a as r,u as f,o as q,r as I,f as y}from"./index-_yt5fKo2.js";import{e as B}from"./excel-zCoXiaxq.js";import{orderBy as m}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let s=[],b=[],h=[],i=[];const g=()=>new Date().toISOString().slice(0,10);async function T(e,t){e.innerHTML=`
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:260px;">
        <input type="text" id="sup-q-search" class="input" placeholder="🔍 بحث في عروض الأسعار..." oninput="window.filterSupplierQuotes(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>المورد</label>
        <select id="sup-q-sup-filter" onchange="window.filterSupplierQuotes()">
          <option value="">كل الموردين</option>
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportSupplierQuotesExcel()">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openSupplierQuoteModal()">+ تسجيل عرض سعر مورد جديد</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Stats -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي عروض الأسعار</div>
          <div class="mono" id="sq-kpi-total" style="font-size:20px; font-weight:900; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">عروض معتمدة ومقبولة</div>
          <div class="mono" id="sq-kpi-accepted" style="font-size:20px; font-weight:900; color:#10B981; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#F59E0B; font-weight:700;">قيد المراجعة والمقارنة</div>
          <div class="mono" id="sq-kpi-pending" style="font-size:20px; font-weight:900; color:#F59E0B; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(99,102,241,0.2); border-radius:12px;">
          <div style="font-size:11px; color:var(--brand); font-weight:700;">متوسط إجمالي العرض</div>
          <div class="mono" id="sq-kpi-avg" style="font-size:18px; font-weight:900; color:var(--brand); margin-top:4px;">0 ر.س</div>
        </div>
      </div>

      <!-- Quotations Table -->
      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th style="width:110px;">رقم العرض</th>
                <th>المورد</th>
                <th style="width:95px;">التاريخ</th>
                <th style="width:95px;">تاريخ الصلاحية</th>
                <th>شروط الدفع والتسليم</th>
                <th style="width:70px; text-align:center;">الأصناف</th>
                <th style="width:115px; text-align:left;">إجمالي العرض</th>
                <th style="width:95px; text-align:center;">الحالة</th>
                <th style="width:140px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="sq-tbody">
              <tr><td colspan="9" style="text-align:center; padding:32px;"><span class="spin"></span> جاري تحميل عروض الأسعار...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Quotation Modal -->
    <div class="modal-overlay" id="sup-quote-modal">
      <div class="modal modal-lg" style="max-width:850px;">
        <div class="modal-header">
          <h3 class="modal-title" id="sup-q-modal-title">➕ تسجيل عرض سعر مورد</h3>
          <button class="modal-close" onclick="closeModal('sup-quote-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="sup-q-edit-id" />
          
          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>المورد صاحب العرض *</label>
              <select id="sup-q-sup-id" class="input">
                <option value="">-- اختر المورد --</option>
              </select>
            </div>
            <div class="form-group">
              <label>تاريخ العرض *</label>
              <input type="date" id="sup-q-date" class="input" value="${g()}" />
            </div>
            <div class="form-group">
              <label>صالح حتى تاريخ</label>
              <input type="date" id="sup-q-expiry" class="input" />
            </div>
          </div>

          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>شروط الدفع والتسليم</label>
              <input type="text" id="sup-q-terms" class="input" placeholder="آجل 30 يوم — تسليم مستودع ينبع" />
            </div>
            <div class="form-group">
              <label>حالة العرض</label>
              <select id="sup-q-status" class="input">
                <option value="pending">🟡 قيد المراجعة والمقارنة</option>
                <option value="accepted">🟢 معتمد وفائز (الأفضل)</option>
                <option value="rejected">🔴 مرفوض / سعر مرتفع</option>
              </select>
            </div>
          </div>

          <!-- Product Quotation Lines -->
          <div style="margin:16px 0 8px; display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight:800; font-size:13px; color:var(--text-0);">📦 الأصناف وأسعار التوريد المقدمة:</div>
            <button class="btn btn-secondary btn-sm" onclick="window.addSupplierQuoteLine()">+ إضافة صنف</button>
          </div>

          <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px; max-height:220px; overflow-y:auto; margin-bottom:12px;">
            <table class="data-dense" style="margin:0;">
              <thead>
                <tr>
                  <th>الصنف *</th>
                  <th style="width:100px;">الوحدة</th>
                  <th style="width:100px;">الكمية المطلوبة</th>
                  <th style="width:110px;">سعر الوحدة المقترح</th>
                  <th style="width:110px; text-align:left;">الإجمالي</th>
                  <th style="width:40px;"></th>
                </tr>
              </thead>
              <tbody id="sup-q-lines-tbody"></tbody>
            </table>
          </div>

          <div class="form-group">
            <label>ملاحظات إضافية</label>
            <input type="text" id="sup-q-notes" class="input" placeholder="ملاحظات حول صلاحية العرض أو توفر البضاعة..." />
          </div>

          <div id="sup-q-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('sup-quote-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveSupplierQuote()">💾 حفظ عرض السعر</button>
        </div>
      </div>
    </div>
  `,await v(),S()}async function v(){try{const[e,t,n]=await Promise.all([c(r.supplierQuotations?r.supplierQuotations():"supplierQuotations",[m("createdAt","desc")]).catch(()=>[]),c(r.suppliers(),[m("name")]).catch(()=>[]),c(r.products(),[m("name")]).catch(()=>[])]);s=e,b=t,h=n,Q(),E(),w()}catch(e){console.warn("Error loading supplier quotes:",e)}}function E(){const e=s.filter(a=>a.status==="accepted"),t=s.filter(a=>a.status==="pending"),n=s.reduce((a,p)=>a+(parseFloat(p.totalAmount)||0),0),o=s.length?n/s.length:0,d=(a,p)=>{const l=document.getElementById(a);l&&(l.textContent=p)};d("sq-kpi-total",s.length),d("sq-kpi-accepted",e.length),d("sq-kpi-pending",t.length),d("sq-kpi-avg",y(o))}function Q(){const e=document.getElementById("sup-q-sup-filter"),t=document.getElementById("sup-q-sup-id"),n=b.map(o=>`<option value="${o.id}">${o.name}</option>`).join("");e&&(e.innerHTML='<option value="">كل الموردين</option>'+n),t&&(t.innerHTML='<option value="">-- اختر المورد --</option>'+n)}function w(e=s){const t=document.getElementById("sq-tbody");if(!t)return;if(!e.length){t.innerHTML='<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد عروض أسعار مسجلة بعد</td></tr>';return}const n={pending:'<span class="badge warn">قيد المقارنة</span>',accepted:'<span class="badge good">معتمد وفائز</span>',rejected:'<span class="badge bad">مرفوض</span>'};t.innerHTML=e.map(o=>`
    <tr>
      <td class="mono font-bold" style="color:var(--brand);">${o.quoteNumber||o.id}</td>
      <td class="font-bold">${o.supplierName}</td>
      <td class="mono dim">${o.date||"—"}</td>
      <td class="mono dim">${o.expiryDate||"—"}</td>
      <td style="font-size:12px;">${o.terms||"—"}</td>
      <td class="mono" style="text-align:center;">${(o.lines||[]).length}</td>
      <td class="mono font-bold" style="text-align:left; color:var(--brand); font-size:13px;">${y(o.totalAmount||0)}</td>
      <td style="text-align:center;">${n[o.status]||n.pending}</td>
      <td>
        <div class="row-actions" style="justify-content:center;">
          <button class="btn btn-icon sm" style="color:#10B981;" onclick="window.convertQuoteToPurchaseInvoice('${o.id}')" title="⚡ تحويل لفاتورة شراء">⚡</button>
          <button class="btn btn-icon sm btn-ghost" onclick="window.editSupplierQuote('${o.id}')" title="تعديل">✏️</button>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deleteSupplierQuote('${o.id}')" title="حذف">🗑️</button>
        </div>
      </td>
    </tr>
  `).join("")}function u(){const e=document.getElementById("sup-q-lines-tbody");if(e){if(!i.length){e.innerHTML='<tr><td colspan="6" style="text-align:center; padding:16px; color:var(--text-3);">لا توجد أصناف. انقر على "+ إضافة صنف"</td></tr>';return}e.innerHTML=i.map((t,n)=>`
    <tr>
      <td>
        <select class="input" style="height:32px; font-size:12px;" onchange="window.updateSupplierQuoteLine(${n}, 'productId', this.value)">
          <option value="">-- اختر الصنف --</option>
          ${h.map(o=>`<option value="${o.id}" ${o.id===t.productId?"selected":""}>${o.name}</option>`).join("")}
        </select>
      </td>
      <td>
        <input type="text" class="input" style="height:32px; font-size:12px;" value="${t.unit||"كرتون"}" onchange="window.updateSupplierQuoteLine(${n}, 'unit', this.value)" />
      </td>
      <td>
        <input type="number" class="input mono" style="height:32px; font-size:12px;" value="${t.qty||""}" placeholder="50" min="1" oninput="window.updateSupplierQuoteLine(${n}, 'qty', this.value)" />
      </td>
      <td>
        <input type="number" class="input mono" style="height:32px; font-size:12px;" value="${t.unitPrice||""}" placeholder="0.00" min="0" step="0.5" oninput="window.updateSupplierQuoteLine(${n}, 'unitPrice', this.value)" />
      </td>
      <td class="mono font-bold" style="text-align:left;">
        ${y((t.unitPrice||0)*(t.qty||0))}
      </td>
      <td style="text-align:center;">
        <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.removeSupplierQuoteLine(${n})">✕</button>
      </td>
    </tr>
  `).join("")}}function S(){window.filterSupplierQuotes=()=>{const e=(document.getElementById("sup-q-search")?.value||"").trim().toLowerCase(),t=document.getElementById("sup-q-sup-filter")?.value||"",n=s.filter(o=>{const d=!e||(o.quoteNumber||"").toLowerCase().includes(e)||(o.supplierName||"").toLowerCase().includes(e),a=!t||o.supplierId===t;return d&&a});w(n)},window.openSupplierQuoteModal=()=>{document.getElementById("sup-q-edit-id").value="",document.getElementById("sup-q-modal-title").textContent="➕ تسجيل عرض سعر مورد",document.getElementById("sup-q-sup-id").value="",document.getElementById("sup-q-date").value=g(),document.getElementById("sup-q-expiry").value="",document.getElementById("sup-q-terms").value="آجل 30 يوم — تسليم مستودع ينبع",document.getElementById("sup-q-status").value="pending",document.getElementById("sup-q-notes").value="",document.getElementById("sup-q-modal-err").classList.add("hidden"),i=[],u(),openModal("sup-quote-modal")},window.addSupplierQuoteLine=()=>{i.push({productId:"",productName:"",unit:"كرتون",qty:50,unitPrice:0}),u()},window.updateSupplierQuoteLine=(e,t,n)=>{if(i[e]){if(t==="productId"){const o=h.find(d=>d.id===n);i[e].productId=n,i[e].productName=o?o.name:"",i[e].unit=o&&o.unit||"كرتون",i[e].unitPrice=o&&o.costPrice||0}else t==="unitPrice"||t==="qty"?i[e][t]=parseFloat(n)||0:i[e][t]=n;u()}},window.removeSupplierQuoteLine=e=>{i.splice(e,1),u()},window.saveSupplierQuote=async()=>{const e=document.getElementById("sup-q-modal-err");e.classList.add("hidden");const t=document.getElementById("sup-q-sup-id").value,n=b.find(l=>l.id===t),o=document.getElementById("sup-q-edit-id").value;if(!t){e.textContent="يرجى اختيار المورد",e.classList.remove("hidden");return}if(!i.length){e.textContent="يرجى إضافة صنف واحد على الأقل",e.classList.remove("hidden");return}const d=o?void 0:`SQ-${new Date().getFullYear()}-${String(s.length+1).padStart(4,"0")}`,a=i.reduce((l,x)=>l+(x.unitPrice||0)*(x.qty||0),0),p={supplierId:t,supplierName:n?n.name:"مورد",date:document.getElementById("sup-q-date").value,expiryDate:document.getElementById("sup-q-expiry").value,terms:document.getElementById("sup-q-terms").value.trim(),status:document.getElementById("sup-q-status").value,notes:document.getElementById("sup-q-notes").value.trim(),totalAmount:a,lines:i};d&&(p.quoteNumber=d);try{o?await f("supplierQuotations",o,p):await q("supplierQuotations",p),closeModal("sup-quote-modal"),await v()}catch(l){e.textContent=l.message,e.classList.remove("hidden")}},window.editSupplierQuote=e=>{const t=s.find(n=>n.id===e);t&&(document.getElementById("sup-q-edit-id").value=t.id,document.getElementById("sup-q-modal-title").textContent="✏️ تعديل عرض السعر: "+(t.quoteNumber||t.id),document.getElementById("sup-q-sup-id").value=t.supplierId||"",document.getElementById("sup-q-date").value=t.date||g(),document.getElementById("sup-q-expiry").value=t.expiryDate||"",document.getElementById("sup-q-terms").value=t.terms||"",document.getElementById("sup-q-status").value=t.status||"pending",document.getElementById("sup-q-notes").value=t.notes||"",i=t.lines||[],u(),openModal("sup-quote-modal"))},window.convertQuoteToPurchaseInvoice=e=>{const t=s.find(n=>n.id===e);t&&confirm(`هل تريد تحويل عرض السعر "${t.quoteNumber||t.id}" إلى فاتورة مشتريات فوراً؟`)&&window.navigate&&(window.navigate("purchase-invoices"),setTimeout(()=>{typeof window.openNewPurchaseModal=="function"&&window.openNewPurchaseModal(t.supplierId,t.supplierName,t.lines)},350))},window.deleteSupplierQuote=async e=>{if(confirm("هل أنت متأكد من حذف هذا العرض؟"))try{await I("supplierQuotations",e),await v()}catch(t){alert("فشل الحذف: "+t.message)}},window.exportSupplierQuotesExcel=()=>{const e=s.map(t=>({"رقم العرض":t.quoteNumber||t.id,"اسم المورد":t.supplierName,التاريخ:t.date,"صالح حتى":t.expiryDate||"—",الشروط:t.terms,الحالة:t.status,"إجمالي العرض":t.totalAmount||0}));B(e)}}export{T as render};
