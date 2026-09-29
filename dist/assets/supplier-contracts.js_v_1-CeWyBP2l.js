import{g,a as m,u as C,o as w,r as I,f as c}from"./index-BgjRa7f-.js";import{e as E}from"./excel-zCoXiaxq.js";import{orderBy as y}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let d=[],h=[],x=[],a=[];const p=()=>new Date().toISOString().slice(0,10),b=()=>{const e=new Date;return e.setFullYear(e.getFullYear()+1),e.toISOString().slice(0,10)};async function F(e,t){e.innerHTML=`
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:260px;">
        <input type="text" id="sup-con-search" class="input" placeholder="🔍 بحث في العقود (الرقم / المورد)..." oninput="window.filterSupplierContracts(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>المورد</label>
        <select id="sup-con-sup-filter" onchange="window.filterSupplierContracts()">
          <option value="">كل الموردين</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="sup-con-status-filter" onchange="window.filterSupplierContracts()">
          <option value="">كل الحالات</option>
          <option value="active">🟢 ساري ونشط</option>
          <option value="expiring_soon">🟡 قارب على الانتهاء</option>
          <option value="expired">🔴 منتهي</option>
          <option value="terminated">⚪ ملغي</option>
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportSupplierContractsExcel()">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openSupplierContractModal()">+ إنشاء عقد توريد جديد</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Cards -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي العقود الموثقة</div>
          <div class="mono" id="sup-con-kpi-total" style="font-size:20px; font-weight:900; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">عقود سارية ونشطة</div>
          <div class="mono" id="sup-con-kpi-active" style="font-size:20px; font-weight:900; color:#10B981; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#F59E0B; font-weight:700;">قاربت على الانتهاء (30 يوم)</div>
          <div class="mono" id="sup-con-kpi-expiring" style="font-size:20px; font-weight:900; color:#F59E0B; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(99,102,241,0.2); border-radius:12px;">
          <div style="font-size:11px; color:var(--brand); font-weight:700;">إجمالي القيمة التقديرية</div>
          <div class="mono" id="sup-con-kpi-val" style="font-size:18px; font-weight:900; color:var(--brand); margin-top:4px;">0 ر.س</div>
        </div>
      </div>

      <!-- Contracts Table -->
      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th style="width:110px;">رقم العقد</th>
                <th>اسم المورد</th>
                <th style="width:95px;">تاريخ البدء</th>
                <th style="width:95px;">تاريخ الانتهاء</th>
                <th style="width:110px;">شروط السداد</th>
                <th style="width:110px; text-align:left;">الحد الائتماني</th>
                <th style="width:110px; text-align:left;">حافز الهدف %</th>
                <th style="width:95px; text-align:center;">الحالة</th>
                <th style="width:140px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="sup-con-tbody">
              <tr><td colspan="9" style="text-align:center; padding:32px;"><span class="spin"></span> جاري تحميل عقود الموردين...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Contract Modal -->
    <div class="modal-overlay" id="sup-contract-modal">
      <div class="modal modal-lg" style="max-width:900px;">
        <div class="modal-header">
          <h3 class="modal-title" id="sup-con-modal-title">➕ إنشاء عقد توريد جديد</h3>
          <button class="modal-close" onclick="closeModal('sup-contract-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="sup-con-edit-id" />
          
          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>المورد المتعاقد معه *</label>
              <select id="sup-con-sup-id" class="input">
                <option value="">-- اختر المورد --</option>
              </select>
            </div>
            <div class="form-group">
              <label>تاريخ بداية العقد *</label>
              <input type="date" id="sup-con-start" class="input" value="${p()}" />
            </div>
            <div class="form-group">
              <label>تاريخ نهاية العقد *</label>
              <input type="date" id="sup-con-end" class="input" value="${b()}" />
            </div>
          </div>

          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>شروط السداد المتفق عليها</label>
              <select id="sup-con-terms" class="input">
                <option value="آجل 30 يوم">آجل 30 يوم</option>
                <option value="آجل 45 يوم">آجل 45 يوم</option>
                <option value="آجل 60 يوم">آجل 60 يوم</option>
                <option value="نقدي عند الاستلام (COD)">نقدي عند الاستلام (COD)</option>
                <option value="دفعات ميسرة">دفعات ميسرة</option>
              </select>
            </div>
            <div class="form-group">
              <label>الحد الائتماني الممنوح (ر.س)</label>
              <input type="number" id="sup-con-credit-limit" class="input mono" placeholder="50000" min="0" />
            </div>
            <div class="form-group">
              <label>نسبة بونص تحقيق الهدف السنوي (Rebate %)</label>
              <input type="number" id="sup-con-rebate" class="input mono" placeholder="2.5" min="0" max="20" step="0.1" />
            </div>
          </div>

          <!-- Product Price Matrix -->
          <div style="margin:16px 0 8px; display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight:800; font-size:13px; color:var(--text-0);">📦 جدول الأصناف والأسعار المعتمدة بالعقد:</div>
            <button class="btn btn-secondary btn-sm" onclick="window.addSupplierContractLine()">+ إضافة صنف للعقد</button>
          </div>

          <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px; max-height:220px; overflow-y:auto; margin-bottom:12px;">
            <table class="data-dense" style="margin:0;">
              <thead>
                <tr>
                  <th>الصنف *</th>
                  <th style="width:100px;">الوحدة</th>
                  <th style="width:110px;">سعر التوريد المتفق</th>
                  <th style="width:100px;">الكمية التقديرية</th>
                  <th style="width:110px; text-align:left;">الإجمالي التقديري</th>
                  <th style="width:40px;"></th>
                </tr>
              </thead>
              <tbody id="sup-con-lines-tbody"></tbody>
            </table>
          </div>

          <div class="grid-2 gap-12 mb-12">
            <div class="form-group">
              <label>حالة العقد</label>
              <select id="sup-con-status" class="input">
                <option value="active">🟢 ساري ونشط</option>
                <option value="expiring_soon">🟡 قارب على الانتهاء</option>
                <option value="expired">🔴 منتهي</option>
                <option value="terminated">⚪ ملغي</option>
              </select>
            </div>
            <div class="form-group">
              <label>ملاحظات وشروط خاصة</label>
              <input type="text" id="sup-con-notes" class="input" placeholder="شروط التسليم للمستودع، فترات السماح، شروط التحميل..." />
            </div>
          </div>

          <div id="sup-con-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('sup-contract-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveSupplierContract()">💾 حفظ العقد</button>
        </div>
      </div>
    </div>
  `,await v(),L()}async function v(){try{const[e,t,o]=await Promise.all([g(m.supplierContracts?m.supplierContracts():"supplierContracts",[y("createdAt","desc")]).catch(()=>[]),g(m.suppliers(),[y("name")]).catch(()=>[]),g(m.products(),[y("name")]).catch(()=>[])]);d=e,h=t,x=o,S(),B(),$()}catch(e){console.warn("Error loading supplier contracts data:",e)}}function B(){const e=d.filter(i=>i.status==="active"),t=d.filter(i=>{if(i.status!=="active")return!1;const l=(new Date(i.endDate)-new Date)/(1e3*60*60*24);return l<=30&&l>=0}),o=d.reduce((i,s)=>i+(parseFloat(s.totalEstimatedValue)||0),0),n=(i,s)=>{const l=document.getElementById(i);l&&(l.textContent=s)};n("sup-con-kpi-total",d.length),n("sup-con-kpi-active",e.length),n("sup-con-kpi-expiring",t.length),n("sup-con-kpi-val",c(o))}function S(){const e=document.getElementById("sup-con-sup-filter"),t=document.getElementById("sup-con-sup-id"),o=h.map(n=>`<option value="${n.id}">${n.name}</option>`).join("");e&&(e.innerHTML='<option value="">كل الموردين</option>'+o),t&&(t.innerHTML='<option value="">-- اختر المورد --</option>'+o)}function $(e=d){const t=document.getElementById("sup-con-tbody");if(!t)return;if(!e.length){t.innerHTML='<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد عقود توريد مسجلة</td></tr>';return}const o={active:'<span class="badge good">ساري</span>',expiring_soon:'<span class="badge warn">قارب الانتهاء</span>',expired:'<span class="badge bad">منتهي</span>',terminated:'<span class="badge neutral">ملغي</span>'};t.innerHTML=e.map(n=>`
    <tr>
      <td class="mono font-bold" style="color:var(--brand);">${n.contractNumber||n.number||n.id}</td>
      <td class="font-bold">${n.supplierName}</td>
      <td class="mono dim">${n.startDate||"—"}</td>
      <td class="mono dim">${n.endDate||"—"}</td>
      <td><span class="badge neutral">${n.paymentTerms||"آجل 30 يوم"}</span></td>
      <td class="mono font-bold" style="text-align:left;">${(n.creditLimit||0)>0?c(n.creditLimit):"—"}</td>
      <td class="mono font-bold" style="text-align:left; color:#10B981;">${(n.rebatePct||0)>0?`${n.rebatePct}%`:"—"}</td>
      <td style="text-align:center;">${o[n.status]||o.active}</td>
      <td>
        <div class="row-actions" style="justify-content:center;">
          <button class="btn btn-icon sm btn-ghost" onclick="window.printOfficialSupplierContract('${n.id}')" title="طباعة العقد الرسمي">🖨️</button>
          <button class="btn btn-icon sm btn-ghost" onclick="window.renewSupplierContract('${n.id}')" title="تجديد لسنة جديدة">🔄</button>
          <button class="btn btn-icon sm btn-ghost" onclick="window.editSupplierContract('${n.id}')" title="تعديل">✏️</button>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deleteSupplierContract('${n.id}')" title="حذف">🗑️</button>
        </div>
      </td>
    </tr>
  `).join("")}function u(){const e=document.getElementById("sup-con-lines-tbody");if(e){if(!a.length){e.innerHTML='<tr><td colspan="6" style="text-align:center; padding:16px; color:var(--text-3);">لا توجد أصناف مضافة للعقد بعد. انقر على "+ إضافة صنف للعقد"</td></tr>';return}e.innerHTML=a.map((t,o)=>`
    <tr>
      <td>
        <select class="input" style="height:32px; font-size:12px;" onchange="window.updateSupplierContractLine(${o}, 'productId', this.value)">
          <option value="">-- اختر الصنف --</option>
          ${x.map(n=>`<option value="${n.id}" ${n.id===t.productId?"selected":""}>${n.name}</option>`).join("")}
        </select>
      </td>
      <td>
        <input type="text" class="input" style="height:32px; font-size:12px;" value="${t.unit||"كرتون"}" onchange="window.updateSupplierContractLine(${o}, 'unit', this.value)" />
      </td>
      <td>
        <input type="number" class="input mono" style="height:32px; font-size:12px;" value="${t.unitPrice||""}" placeholder="0.00" min="0" step="0.5" oninput="window.updateSupplierContractLine(${o}, 'unitPrice', this.value)" />
      </td>
      <td>
        <input type="number" class="input mono" style="height:32px; font-size:12px;" value="${t.qty||""}" placeholder="100" min="1" oninput="window.updateSupplierContractLine(${o}, 'qty', this.value)" />
      </td>
      <td class="mono font-bold" style="text-align:left;">
        ${c((t.unitPrice||0)*(t.qty||0))}
      </td>
      <td style="text-align:center;">
        <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.removeSupplierContractLine(${o})">✕</button>
      </td>
    </tr>
  `).join("")}}function L(){window.filterSupplierContracts=()=>{const e=(document.getElementById("sup-con-search")?.value||"").trim().toLowerCase(),t=document.getElementById("sup-con-sup-filter")?.value||"",o=document.getElementById("sup-con-status-filter")?.value||"",n=d.filter(i=>{const s=!e||(i.contractNumber||"").toLowerCase().includes(e)||(i.supplierName||"").toLowerCase().includes(e),l=!t||i.supplierId===t,r=!o||i.status===o;return s&&l&&r});$(n)},window.openSupplierContractModal=()=>{document.getElementById("sup-con-edit-id").value="",document.getElementById("sup-con-modal-title").textContent="➕ إنشاء عقد توريد جديد",document.getElementById("sup-con-sup-id").value="",document.getElementById("sup-con-start").value=p(),document.getElementById("sup-con-end").value=b(),document.getElementById("sup-con-terms").value="آجل 30 يوم",document.getElementById("sup-con-credit-limit").value="",document.getElementById("sup-con-rebate").value="",document.getElementById("sup-con-status").value="active",document.getElementById("sup-con-notes").value="",document.getElementById("sup-con-modal-err").classList.add("hidden"),a=[],u(),openModal("sup-contract-modal")},window.addSupplierContractLine=()=>{a.push({productId:"",productName:"",unit:"كرتون",unitPrice:0,qty:100}),u()},window.updateSupplierContractLine=(e,t,o)=>{if(a[e]){if(t==="productId"){const n=x.find(i=>i.id===o);a[e].productId=o,a[e].productName=n?n.name:"",a[e].unit=n&&n.unit||"كرتون",a[e].unitPrice=n&&(n.costPrice||n.purchasePrice)||0}else t==="unitPrice"||t==="qty"?a[e][t]=parseFloat(o)||0:a[e][t]=o;u()}},window.removeSupplierContractLine=e=>{a.splice(e,1),u()},window.saveSupplierContract=async()=>{const e=document.getElementById("sup-con-modal-err");e.classList.add("hidden");const t=document.getElementById("sup-con-sup-id").value,o=h.find(r=>r.id===t),n=document.getElementById("sup-con-edit-id").value;if(!t){e.textContent="يرجى اختيار المورد المتعاقد معه",e.classList.remove("hidden");return}const i=n?void 0:`SCNT-${new Date().getFullYear()}-${String(d.length+1).padStart(4,"0")}`,s=a.reduce((r,f)=>r+(f.unitPrice||0)*(f.qty||0),0),l={supplierId:t,supplierName:o?o.name:"مورد",startDate:document.getElementById("sup-con-start").value,endDate:document.getElementById("sup-con-end").value,paymentTerms:document.getElementById("sup-con-terms").value,creditLimit:parseFloat(document.getElementById("sup-con-credit-limit").value)||0,rebatePct:parseFloat(document.getElementById("sup-con-rebate").value)||0,status:document.getElementById("sup-con-status").value,notes:document.getElementById("sup-con-notes").value.trim(),totalEstimatedValue:s,lines:a};i&&(l.contractNumber=i);try{n?await C("supplierContracts",n,l):await w("supplierContracts",l),closeModal("sup-contract-modal"),await v()}catch(r){e.textContent=r.message,e.classList.remove("hidden")}},window.editSupplierContract=e=>{const t=d.find(o=>o.id===e);t&&(document.getElementById("sup-con-edit-id").value=t.id,document.getElementById("sup-con-modal-title").textContent="✏️ تعديل عقد التوريد: "+(t.contractNumber||t.id),document.getElementById("sup-con-sup-id").value=t.supplierId||"",document.getElementById("sup-con-start").value=t.startDate||p(),document.getElementById("sup-con-end").value=t.endDate||b(),document.getElementById("sup-con-terms").value=t.paymentTerms||"آجل 30 يوم",document.getElementById("sup-con-credit-limit").value=t.creditLimit||"",document.getElementById("sup-con-rebate").value=t.rebatePct||"",document.getElementById("sup-con-status").value=t.status||"active",document.getElementById("sup-con-notes").value=t.notes||"",a=t.lines||[],u(),openModal("sup-contract-modal"))},window.renewSupplierContract=async e=>{const t=d.find(o=>o.id===e);if(t&&confirm(`هل تريد تجديد عقد المورد "${t.supplierName}" لسنة ميلادية جديدة؟`))try{const o=p(),n=b(),i=`SCNT-${new Date().getFullYear()}-${String(d.length+1).padStart(4,"0")}`,s={...t,contractNumber:i,startDate:o,endDate:n,status:"active",notes:`تجديد للعقد السابق (${t.contractNumber||t.id})`};delete s.id,await w("supplierContracts",s),await v(),alert("✅ تم تجديد العقد بنجاح برقم: "+i)}catch(o){alert("فشل التجديد: "+o.message)}},window.deleteSupplierContract=async e=>{if(confirm("هل أنت متأكد من حذف هذا العقد؟"))try{await I("supplierContracts",e),await v()}catch(t){alert("فشل الحذف: "+t.message)}},window.printOfficialSupplierContract=e=>{const t=d.find(i=>i.id===e);if(!t)return;const o=window.ERP_COMPANY||{name:"مؤسسة إدهام للمواد الغذائية",crNumber:"1010000000",vatNumber:"310000000000003"},n=window.open("","_blank");n.document.write(`
      <html dir="rtl">
        <head>
          <title>عقد توريد مواد غذائية - ${t.contractNumber||t.id}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #111; line-height: 1.8; text-align: right; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .party-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 16px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: right; }
            th { background: #f1f5f9; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 60px; text-align: center; }
            .sig-line { border-top: 1px dashed #475569; margin-top: 60px; padding-top: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin:0;">عقد اتفاق وتوريد مواد غذائية</h2>
            <div style="font-size:13px; color:#475569; margin-top:6px;">رقم العقد: <b>${t.contractNumber||t.id}</b> | التاريخ: ${t.startDate||p()}</div>
          </div>

          <p>إنه في يوم الموافق <b>${t.startDate||p()}</b> تم الاتفاق والتراضي بين كل من:</p>

          <div class="party-box">
            <b>الطرف الأول (المشتري):</b> ${o.name} — س.ت: ${o.crNumber||"—"} — ر.ض: ${o.vatNumber||"—"}<br>
            <b>الطرف الثاني (المورد):</b> ${t.supplierName}
          </div>

          <h4>البند الأول: موضوع العقد والأسعار المعتمدة</h4>
          <p>يلتزم الطرف الثاني بتوريد الأصناف والمواد الغذائية للطرف الأول وفقاً للأسعار والمواصفات المحددة في الجدول التالي:</p>

          <table>
            <thead>
              <tr>
                <th>م</th>
                <th>اسم الصنف</th>
                <th>الوحدة</th>
                <th>سعر التوريد المعتمد</th>
                <th>الكمية التقديرية</th>
                <th>الإجمالي التقديري</th>
              </tr>
            </thead>
            <tbody>
              ${(t.lines||[]).map((i,s)=>`
                <tr>
                  <td>${s+1}</td>
                  <td><b>${i.productName||i.name}</b></td>
                  <td>${i.unit||"كرتون"}</td>
                  <td>${c(i.unitPrice||0)}</td>
                  <td>${i.qty||"—"}</td>
                  <td>${c((i.unitPrice||0)*(i.qty||0))}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <h4>البند الثاني: مدة العقد وشروط السداد</h4>
          <p>• مدة هذا العقد سنة ميلادية تبدأ من <b>${t.startDate}</b> وتنتهي في <b>${t.endDate}</b> وتجدد باتفاق الطرفين.</p>
          <p>• شروط السداد المتفق عليها: <b>${t.paymentTerms||"آجل 30 يوم"}</b> مع حد ائتماني قدره <b>${c(t.creditLimit||0)}</b>.</p>
          ${t.rebatePct?`<p>• يمنح الطرف الثاني الطرف الأول بونص وحافز تحقيق هدف سنوي بنسبة <b>${t.rebatePct}%</b> عند تحقيق المستهدف.</p>`:""}

          <div class="signatures">
            <div>
              <div>عن الطرف الأول (المشتري)</div>
              <div><b>${o.name}</b></div>
              <div class="sig-line">الختم والتوقيع المعتمد</div>
            </div>
            <div>
              <div>عن الطرف الثاني (المورد)</div>
              <div><b>${t.supplierName}</b></div>
              <div class="sig-line">الختم والتوقيع المعتمد</div>
            </div>
          </div>

          <script>window.onload = () => { window.print(); };<\/script>
        </body>
      </html>
    `),n.document.close()},window.exportSupplierContractsExcel=()=>{const e=d.map(t=>({"رقم العقد":t.contractNumber||t.id,"اسم المورد":t.supplierName,"تاريخ البدء":t.startDate,"تاريخ الانتهاء":t.endDate,"شروط السداد":t.paymentTerms,"الحد الائتماني":t.creditLimit||0,"حافز الهدف %":t.rebatePct||0,الحالة:t.status,"القيمة التقديرية":t.totalEstimatedValue||0}));E(e)}}export{F as render};
