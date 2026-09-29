import{g,a as m,f as h,o as C,u as B,r as k}from"./index-DgsnACKa.js";import{e as M}from"./excel-zCoXiaxq.js";import{orderBy as f}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let l=[],I=[],w=[],_=[],N=[],c=[];const b=()=>new Date().toISOString().slice(0,10),$=()=>{const d=new Date;return d.setFullYear(d.getFullYear()+1),d.toISOString().slice(0,10)};async function H(d,o){d.innerHTML=`
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:280px;">
        <input type="text" id="ctr-search" class="input" placeholder="🔍 بحث في العقود (الرقم / العميل)..." oninput="window.filterContracts(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="ctr-status-filter" onchange="window.filterContracts()">
          <option value="">كل الحالات</option>
          <option value="active">🟢 نشط وساري</option>
          <option value="expiring">⏳ ينتهي قريباً (30 يوم)</option>
          <option value="expired">🔴 منتهي الصلاحية</option>
          <option value="draft">📝 مسودة</option>
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.openImportQuoteModal()">📑 تحويل عرض سعر إلى عقد</button>
        <button class="btn btn-secondary" onclick="window.exportContractsExcel()">📊 تصدير Excel</button>
        <button class="btn btn-primary" onclick="window.openContractModal()">+ إنشاء عقد جديد</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Stats Strip -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px; margin-bottom:20px;">
        <div class="kpi-card" style="padding:16px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي العقود</div>
          <div class="mono" id="ctr-kpi-total" style="font-size:22px; font-weight:900; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:16px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">العقود السارية النشطة</div>
          <div class="mono" id="ctr-kpi-active" style="font-size:22px; font-weight:900; color:#10B981; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:16px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#F59E0B; font-weight:700;">تنتهي قريباً (30 يوم)</div>
          <div class="mono" id="ctr-kpi-expiring" style="font-size:22px; font-weight:900; color:#F59E0B; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:16px; background:var(--bg-card); border:1px solid rgba(99,102,241,0.2); border-radius:12px;">
          <div style="font-size:11px; color:var(--brand); font-weight:700;">القيمة التقديرية للتعاقدات</div>
          <div class="mono" id="ctr-kpi-val" style="font-size:20px; font-weight:900; color:var(--brand); margin-top:4px;">0 ر.س</div>
        </div>
      </div>

      <!-- Contracts Table -->
      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th style="width:110px;">رقم العقد</th>
                <th>العميل والمنشأة</th>
                <th style="width:105px;">تاريخ البدء</th>
                <th style="width:105px;">تاريخ الانتهاء</th>
                <th style="width:100px;">المدة المتبقية</th>
                <th style="width:110px;">شروط الدفع</th>
                <th style="width:110px; text-align:left;">القيمة التقديرية</th>
                <th style="width:90px; text-align:center;">الحالة</th>
                <th style="width:140px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="ctr-tbody">
              <tr><td colspan="9" style="text-align:center; padding:32px;"><span class="spin"></span> جاري تحميل العقود...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Contract Modal -->
    <div class="modal-overlay" id="contract-modal">
      <div class="modal modal-lg" style="max-width:850px; max-height:90vh; display:flex; flex-direction:column;">
        <div class="modal-header">
          <h3 class="modal-title" id="ctr-modal-title">➕ إنشاء عقد توريد جديد</h3>
          <button class="modal-close" onclick="closeModal('contract-modal')">×</button>
        </div>
        <div class="modal-body" style="flex:1; overflow-y:auto; padding:20px;">
          <input type="hidden" id="ctr-edit-id" />
          
          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>رقم العقد *</label>
              <input type="text" id="ctr-num" class="input mono" placeholder="CTR-2026-001" />
            </div>
            <div class="form-group" style="grid-column:span 2;">
              <label>العميل المتعاقد معه *</label>
              <select id="ctr-cust-id" class="input">
                <option value="">-- اختر العميل --</option>
              </select>
            </div>
          </div>

          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>تاريخ سريان العقد *</label>
              <input type="date" id="ctr-start" class="input" value="${b()}" />
            </div>
            <div class="form-group">
              <label>تاريخ انتهاء العقد *</label>
              <input type="date" id="ctr-end" class="input" value="${$()}" />
            </div>
            <div class="form-group">
              <label>شروط وضوابط السداد</label>
              <select id="ctr-terms" class="input">
                <option value="cash_on_delivery">نقدي عند الاستلام (COD)</option>
                <option value="credit_15">آجل 15 يوماً من الفاتورة</option>
                <option value="credit_30" selected>آجل 30 يوماً من الفاتورة</option>
                <option value="end_of_month">سداد نهاية كل شهر ميلادي</option>
                <option value="custom">شروط خاصة (حسب الملاحظات)</option>
              </select>
            </div>
          </div>

          <!-- Contract Items Section -->
          <div style="border-top:1px dashed var(--border); padding-top:14px; margin-top:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <div style="font-weight:800; font-size:13px; color:var(--text-0);">📦 الأصناف والأسعار المتفق عليها:</div>
              <button class="btn btn-secondary btn-sm" onclick="window.addContractLine()">+ إضافة صنف</button>
            </div>
            <div class="table-container" style="max-height:220px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:8px;">
              <table class="data-dense" style="margin:0;">
                <thead>
                  <tr>
                    <th>الصنف</th>
                    <th style="width:80px;">الوحدة</th>
                    <th style="width:100px;">سعر التوريد</th>
                    <th style="width:90px;">الكمية التقديرية</th>
                    <th style="width:110px;">الإجمالي التقديري</th>
                    <th style="width:40px;"></th>
                  </tr>
                </thead>
                <tbody id="ctr-lines-tbody"></tbody>
              </table>
            </div>
          </div>

          <div class="form-group mt-12">
            <label>بنود وشروط خاصة بالعقد (ملاحظات)</label>
            <textarea id="ctr-notes" class="input" rows="3" placeholder="مثال: يلتزم الطرف الأول بتوريد البضاعة خلال 24 ساعة من استلام أمر الشراء، ويلتزم الطرف الثاني بالسداد في الموعد المحدد..."></textarea>
          </div>

          <div id="ctr-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('contract-modal')">إلغاء</button>
          <button class="btn btn-primary" id="ctr-save-btn" onclick="window.saveContract()">💾 حفظ العقد</button>
        </div>
      </div>
    </div>

    <!-- Import Quotation Modal -->
    <div class="modal-overlay" id="import-quote-modal">
      <div class="modal" style="max-width:550px;">
        <div class="modal-header">
          <h3 class="modal-title">📑 تحويل عرض سعر إلى عقد رسمي</h3>
          <button class="modal-close" onclick="closeModal('import-quote-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <p style="font-size:12.5px; color:var(--text-2); margin-bottom:12px;">اختر عرض السعر المعتمد لنقل بنوده وأسعاره وتفاصيل العميل مباشرة إلى عقد جديد:</p>
          <div class="form-group mb-12">
            <label>عرض السعر *</label>
            <select id="import-quote-sel" class="input">
              <option value="">-- اختر عرض السعر --</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('import-quote-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.confirmImportQuote()">✨ تحويل لعقد الآن</button>
        </div>
      </div>
    </div>
  `,await y(),P()}async function y(){try{const[d,o,t,e,n]=await Promise.all([g(m.customerContracts?m.customerContracts():"customerContracts").catch(()=>[]),g(m.customers(),[f("name")]).catch(()=>[]),g(m.products(),[f("name")]).catch(()=>[]),g(m.quotations?m.quotations():"quotations",[f("date","desc")]).catch(()=>[]),g(m.salesInvoices()).catch(()=>[])]);l=d,I=o,w=t,_=e,N=n,D(),L(),S()}catch(d){console.warn("Failed to load contracts data:",d)}}function L(){const d=b(),o=new Date;o.setDate(o.getDate()+30);const t=o.toISOString().slice(0,10),e=l.filter(a=>a.status!=="expired"&&a.status!=="draft"&&(!a.endDate||a.endDate>=d)),n=e.filter(a=>a.endDate&&a.endDate<=t),i=e.reduce((a,p)=>a+(parseFloat(p.totalValue)||0),0),r=(a,p)=>{const s=document.getElementById(a);s&&(s.textContent=p)};r("ctr-kpi-total",l.length),r("ctr-kpi-active",e.length),r("ctr-kpi-expiring",n.length),r("ctr-kpi-val",h(i))}function S(){const d=document.getElementById("ctr-cust-id");d&&(d.innerHTML='<option value="">-- اختر العميل --</option>'+I.map(o=>`<option value="${o.id}">${o.name} (${o.phone||"—"})</option>`).join(""))}function D(d=l){const o=document.getElementById("ctr-tbody");if(!o)return;if(!d.length){o.innerHTML='<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد عقود مسجلة بعد</td></tr>';return}const t=new Date;o.innerHTML=d.map(e=>{let n="—",i=!1,r=!1;if(e.endDate){const x=new Date(e.endDate)-t,u=Math.ceil(x/(1e3*60*60*24));u<0?(n=`<span style="color:var(--bad); font-weight:700;">منتهي (${Math.abs(u)} يوم)</span>`,r=!0):u<=30?(n=`<span style="color:#F59E0B; font-weight:700;">${u} يوم ⏳</span>`,i=!0):n=`${u} يوم`}const a=r?'<span class="badge bad">منتهي</span>':i?'<span class="badge warn">قارب الانتهاء</span>':e.status==="draft"?'<span class="badge neutral">مسودة</span>':'<span class="badge good">نشط وساري</span>',p={cash_on_delivery:"نقدي (COD)",credit_15:"آجل 15 يوم",credit_30:"آجل 30 يوم",end_of_month:"نهاية الشهر",custom:"شروط خاصة"};return`
      <tr>
        <td class="mono font-bold" style="color:var(--brand);">${e.contractNumber||e.number||e.id}</td>
        <td>
          <div style="font-weight:700; color:var(--text-0);">${e.customerName}</div>
          <div style="font-size:11px; color:var(--text-2);">${e.customerPhone||"—"}</div>
        </td>
        <td class="mono dim">${e.startDate||"—"}</td>
        <td class="mono font-semibold">${e.endDate||"—"}</td>
        <td style="font-size:12px;">${n}</td>
        <td style="font-size:11.5px;">${p[e.paymentTerms]||e.paymentTerms||"آجل 30 يوم"}</td>
        <td class="mono font-bold" style="text-align:left;">${h(e.totalValue||0)}</td>
        <td style="text-align:center;">${a}</td>
        <td>
          <div class="row-actions" style="justify-content:center;">
            <button class="btn btn-icon sm btn-ghost" onclick="window.printContract('${e.id}')" title="طباعة العقد الرسمي">🖨️</button>
            <button class="btn btn-icon sm btn-ghost" onclick="window.renewContract('${e.id}')" title="تجديد العقد لسنة جديدة">🔄</button>
            <button class="btn btn-icon sm btn-ghost" onclick="window.editContract('${e.id}')" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deleteContract('${e.id}')" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>
    `}).join("")}function P(){window.filterContracts=()=>{const o=(document.getElementById("ctr-search")?.value||"").trim().toLowerCase(),t=document.getElementById("ctr-status-filter")?.value||"",e=b(),n=new Date;n.setDate(n.getDate()+30);const i=n.toISOString().slice(0,10),r=l.filter(a=>{const p=!o||(a.contractNumber||"").toLowerCase().includes(o)||(a.customerName||"").toLowerCase().includes(o);let s=!0;return t==="active"?s=(!a.endDate||a.endDate>=e)&&a.status!=="draft":t==="expiring"?s=a.endDate&&a.endDate>=e&&a.endDate<=i:t==="expired"?s=a.endDate&&a.endDate<e:t==="draft"&&(s=a.status==="draft"),p&&s});D(r)},window.openContractModal=()=>{document.getElementById("ctr-edit-id").value="",document.getElementById("ctr-modal-title").textContent="➕ إنشاء عقد توريد جديد",document.getElementById("ctr-num").value=`CTR-${new Date().getFullYear()}-${String(l.length+1).padStart(3,"0")}`,document.getElementById("ctr-cust-id").value="",document.getElementById("ctr-start").value=b(),document.getElementById("ctr-end").value=$(),document.getElementById("ctr-terms").value="credit_30",document.getElementById("ctr-notes").value="",document.getElementById("ctr-modal-err").classList.add("hidden"),c=[],d(),openModal("contract-modal")},window.openImportQuoteModal=()=>{const o=document.getElementById("import-quote-sel");o&&(o.innerHTML='<option value="">-- اختر عرض السعر --</option>'+_.map(t=>`<option value="${t.id}">عرض #${t.number||t.id} — ${t.customerName||t.clientName} (${h(t.totalWithVat||t.total||0)})</option>`).join(""),openModal("import-quote-modal"))},window.confirmImportQuote=()=>{const o=document.getElementById("import-quote-sel")?.value,t=_.find(e=>e.id===o);t&&(closeModal("import-quote-modal"),window.openContractModal(),document.getElementById("ctr-cust-id").value=t.customerId||"",document.getElementById("ctr-notes").value=`تم إنشاء العقد بناءً على عرض السعر رقم #${t.number||t.id}. ${t.notes||""}`,c=(t.lines||t.items||[]).map(e=>({productId:e.productId||e.id,productName:e.name||e.productName,unit:e.unit||"حبة",unitPrice:parseFloat(e.unitPrice||e.price||0),qty:parseFloat(e.qty||e.quantity||100),total:parseFloat(e.unitPrice||e.price||0)*parseFloat(e.qty||e.quantity||100)})),d())},window.renewContract=async o=>{const t=l.find(a=>a.id===o);if(!t||!confirm(`هل تريد تجديد العقد "${t.contractNumber||t.id}" لمدة سنة إضافية؟`))return;const e=t.endDate||b(),n=new Date(e);n.setFullYear(n.getFullYear()+1);const i=n.toISOString().slice(0,10),r={...t,contractNumber:`CTR-${new Date().getFullYear()}-${String(l.length+1).padStart(3,"0")}`,number:`CTR-${new Date().getFullYear()}-${String(l.length+1).padStart(3,"0")}`,startDate:e,endDate:i,status:"active",notes:`تجديد للعقد السابق (${t.contractNumber||t.id}). ${t.notes||""}`};delete r.id;try{await C("customerContracts",r),alert("✅ تم تجديد العقد بنجاح!"),await y()}catch(a){alert("فشل التجديد: "+a.message)}},window.addContractLine=(o="",t=0,e=100)=>{c.push({productId:o,productName:"",unit:"حبة",unitPrice:t,qty:e,total:t*e}),d()},window.removeContractLine=o=>{c.splice(o,1),d()},window.updateContractLine=(o,t,e)=>{const n=c[o];if(n){if(t==="productId"){n.productId=e;const i=w.find(r=>r.id===e);i&&(n.productName=i.name,n.unit=i.unit||"حبة",n.unitPrice=i.salePrice||i.price||0,n.total=n.unitPrice*n.qty)}else t==="unitPrice"?(n.unitPrice=parseFloat(e)||0,n.total=n.unitPrice*n.qty):t==="qty"&&(n.qty=parseFloat(e)||0,n.total=n.unitPrice*n.qty);d()}};function d(){const o=document.getElementById("ctr-lines-tbody");if(o){if(!c.length){o.innerHTML='<tr><td colspan="6" style="text-align:center; padding:16px; color:var(--text-2); font-size:12px;">لم يتم إضافة أصناف للعقد بعد</td></tr>';return}o.innerHTML=c.map((t,e)=>`
      <tr>
        <td>
          <select class="input" style="height:32px; font-size:12px; padding:2px 8px;" onchange="window.updateContractLine(${e}, 'productId', this.value)">
            <option value="">-- اختر الصنف --</option>
            ${w.map(n=>`<option value="${n.id}" ${n.id===t.productId?"selected":""}>${n.name}</option>`).join("")}
          </select>
        </td>
        <td style="font-size:11px; color:var(--text-2); text-align:center;">${t.unit||"حبة"}</td>
        <td>
          <input type="number" class="input mono" style="height:32px; font-size:12px; width:90px;" value="${t.unitPrice}" min="0" step="0.1" onchange="window.updateContractLine(${e}, 'unitPrice', this.value)" />
        </td>
        <td>
          <input type="number" class="input mono" style="height:32px; font-size:12px; width:80px;" value="${t.qty}" min="1" onchange="window.updateContractLine(${e}, 'qty', this.value)" />
        </td>
        <td class="mono font-bold">${h(t.total||0)}</td>
        <td>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.removeContractLine(${e})">✕</button>
        </td>
      </tr>
    `).join("")}}window.saveContract=async()=>{const o=document.getElementById("ctr-modal-err");o.classList.add("hidden");const t=document.getElementById("ctr-cust-id").value,e=I.find(v=>v.id===t),n=document.getElementById("ctr-num").value.trim(),i=document.getElementById("ctr-start").value,r=document.getElementById("ctr-end").value,a=document.getElementById("ctr-terms").value,p=document.getElementById("ctr-notes").value.trim(),s=document.getElementById("ctr-edit-id").value;if(!t){o.textContent="يرجى اختيار العميل",o.classList.remove("hidden");return}if(!n){o.textContent="يرجى كتابة رقم العقد",o.classList.remove("hidden");return}const x=c.reduce((v,E)=>v+(E.total||0),0),u={contractNumber:n,number:n,customerId:t,customerName:e?e.name:"عميل",customerPhone:e?e.phone:"",customerCr:e&&(e.crNumber||e.vatNumber)||"",startDate:i,endDate:r,paymentTerms:a,notes:p,lines:c,totalValue:x,status:"active"};try{s?await B("customerContracts",s,u):await C("customerContracts",u),closeModal("contract-modal"),await y()}catch(v){o.textContent=v.message,o.classList.remove("hidden")}},window.editContract=o=>{const t=l.find(e=>e.id===o);t&&(document.getElementById("ctr-edit-id").value=t.id,document.getElementById("ctr-modal-title").textContent="✏️ تعديل العقد "+(t.contractNumber||t.id),document.getElementById("ctr-num").value=t.contractNumber||t.number||"",document.getElementById("ctr-cust-id").value=t.customerId||"",document.getElementById("ctr-start").value=t.startDate||b(),document.getElementById("ctr-end").value=t.endDate||$(),document.getElementById("ctr-terms").value=t.paymentTerms||"credit_30",document.getElementById("ctr-notes").value=t.notes||"",c=t.lines||[],d(),openModal("contract-modal"))},window.deleteContract=async o=>{if(confirm("هل أنت متأكد من حذف هذا العقد نهائياً؟"))try{await k("customerContracts",o),await y()}catch(t){alert("فشل الحذف: "+t.message)}},window.printContract=o=>{const t=l.find(i=>i.id===o);if(!t)return;const e=window.ERP_COMPANY||{name:"مؤسسة إدهام للمواد الغذائية",crNumber:"1010000000",vatNumber:"300000000000003"},n=window.open("","_blank");n.document.write(`
      <html dir="rtl">
      <head>
        <title>عقد توريد مواد غذائية — ${t.customerName}</title>
        <style>
          body { font-family:'Cairo',sans-serif; padding:40px; line-height:1.8; color:#1e293b; font-size:13.5px; }
          .header { text-align:center; border-bottom:2px solid #0f172a; padding-bottom:16px; margin-bottom:24px; }
          .contract-title { font-size:20px; font-weight:800; color:#0f172a; margin-top:6px; }
          .parties { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin-bottom:20px; }
          table { width:100%; border-collapse:collapse; margin:20px 0; font-size:12.5px; }
          th, td { border:1px solid #cbd5e1; padding:8px 12px; text-align:right; }
          th { background:#f1f5f9; }
          .signatures { display:flex; justify-content:space-between; margin-top:60px; padding:0 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${e.name}</h2>
          <div class="contract-title">عقد اتفاق وتوريد مواد غذائية</div>
          <div style="font-size:12px; color:#64748b;">رقم العقد: ${t.contractNumber||t.number} | التاريخ: ${t.startDate}</div>
        </div>

        <div class="parties">
          <p><b>الطرف الأول (المورّد):</b> ${e.name} — س.ت: ${e.crNumber||"—"} — الرقم الضريبي: ${e.vatNumber||"—"}</p>
          <p><b>الطرف الثاني (العميل):</b> ${t.customerName} — الجوال: ${t.customerPhone||"—"} — س.ت / ضريبي: ${t.customerCr||"—"}</p>
        </div>

        <p><b>تمهيد:</b> حيث أن الطرف الأول مؤسسة متخصصة في توريد وتوزيع المواد الغذائية، ورغب الطرف الثاني في التعاقد لتوريد احتياجاته وفق البنود التالية:</p>

        <h4>البند الأول: موضوع العقد والأسعار</h4>
        <p>يلتزم الطرف الأول بتوريد الأصناف الموضحة أدناه للطرف الثاني بالأسعار المتفق عليها طوال فترة سريان العقد:</p>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>الصنف والمواصفات</th>
              <th>الوحدة</th>
              <th>سعر التوريد المعتمد (ر.س)</th>
              <th>الكمية التقديرية</th>
            </tr>
          </thead>
          <tbody>
            ${(t.lines||[]).map((i,r)=>`
              <tr>
                <td>${r+1}</td>
                <td><b>${i.productName}</b></td>
                <td>${i.unit||"حبة"}</td>
                <td>${h(i.unitPrice)}</td>
                <td>${i.qty||"—"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <h4>البند الثاني: مدة العقد والسريان</h4>
        <p>يسري هذا العقد اعتباراً من تاريخ <b>${t.startDate}</b> وحتى تاريخ <b>${t.endDate}</b> ويجدد تلقائياً باتفاق الطرفين كتابياً.</p>

        <h4>البند الثالث: شروط وضوابط السداد</h4>
        <p>اتفق الطرفان على أن تكون طريقة السداد: <b>${t.paymentTerms==="cash_on_delivery"?"نقداً عند الاستلام":t.paymentTerms==="credit_15"?"آجل 15 يوماً من إصدار الفاتورة":"آجل 30 يوماً من إصدار الفاتورة"}</b>.</p>

        ${t.notes?`<h4>البند الرابع: شروط خاصة</h4><p>${t.notes}</p>`:""}

        <div class="signatures">
          <div>
            <b>الطرف الأول (المورّد)</b><br>
            الاسم: ____________________<br>
            التوقيع والختم: ______________
          </div>
          <div>
            <b>الطرف الثاني (العميل)</b><br>
            الاسم: ____________________<br>
            التوقيع والختم: ______________
          </div>
        </div>

        <script>window.onload = () => window.print();<\/script>
      </body>
      </html>
    `),n.document.close()},window.exportContractsExcel=()=>{const o=l.map(t=>({"رقم العقد":t.contractNumber||t.number,العميل:t.customerName,الهاتف:t.customerPhone,"تاريخ البدء":t.startDate,"تاريخ الانتهاء":t.endDate,"شروط السداد":t.paymentTerms,"القيمة التقديرية":t.totalValue||0,الحالة:t.status}));M(o)}}export{H as render};
