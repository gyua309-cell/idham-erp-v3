import{g as v,a as u,u as I,o as B,f as c,r as E}from"./index-_yt5fKo2.js";import{e as k}from"./excel-zCoXiaxq.js";import{orderBy as b}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let s=[],x=[],g=[],$=[],d=[];const h=()=>new Date().toISOString().slice(0,10),w=()=>{const e=new Date;return e.setDate(e.getDate()+7),e.toISOString().slice(0,10)};async function j(e,t){e.innerHTML=`
    <div class="filterbar no-print">
      <div class="search-bar" style="max-width:260px;">
        <input type="text" id="po-search" class="input" placeholder="🔍 بحث في أوامر الشراء (PO)..." oninput="window.filterPOs(this.value)" />
      </div>
      <div class="filter-select-group">
        <label>المورد</label>
        <select id="po-sup-filter" onchange="window.filterPOs()">
          <option value="">كل الموردين</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="po-status-filter" onchange="window.filterPOs()">
          <option value="">كل الحالات</option>
          <option value="sent">📨 تم الإرسال للمورد</option>
          <option value="draft">📝 مسودة</option>
          <option value="received">✅ تم الاستلام والفوترة</option>
          <option value="cancelled">❌ ملغي</option>
        </select>
      </div>

      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportPOsExcel()">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openPOModal()">+ إنشاء أمر شراء رسمي (PO)</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPI Stats -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي أوامر الشراء</div>
          <div class="mono" id="po-kpi-total" style="font-size:20px; font-weight:900; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(59,130,246,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#3B82F6; font-weight:700;">أوامر مرسلة بانتظار التوريد</div>
          <div class="mono" id="po-kpi-sent" style="font-size:20px; font-weight:900; color:#3B82F6; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.2); border-radius:12px;">
          <div style="font-size:11px; color:#10B981; font-weight:700;">تم استلامها وفلترتها</div>
          <div class="mono" id="po-kpi-received" style="font-size:20px; font-weight:900; color:#10B981; margin-top:4px;">0</div>
        </div>
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid rgba(99,102,241,0.2); border-radius:12px;">
          <div style="font-size:11px; color:var(--brand); font-weight:700;">إجمالي قيمة الأوامر النشطة</div>
          <div class="mono" id="po-kpi-val" style="font-size:18px; font-weight:900; color:var(--brand); margin-top:4px;">0 ر.س</div>
        </div>
      </div>

      <!-- PO Table -->
      <div class="card">
        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th style="width:110px;">رقم الأمر (PO)</th>
                <th>المورد</th>
                <th style="width:95px;">تاريخ الطلب</th>
                <th style="width:95px;">تاريخ التوريد المتوقع</th>
                <th>المستودع المستلم</th>
                <th style="width:70px; text-align:center;">الأصناف</th>
                <th style="width:120px; text-align:left;">إجمالي القيمة</th>
                <th style="width:105px; text-align:center;">الحالة</th>
                <th style="width:150px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="po-tbody">
              <tr><td colspan="9" style="text-align:center; padding:32px;"><span class="spin"></span> جاري تحميل أوامر الشراء...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- PO Modal -->
    <div class="modal-overlay" id="po-modal">
      <div class="modal modal-lg" style="max-width:900px;">
        <div class="modal-header">
          <h3 class="modal-title" id="po-modal-title">➕ إنشاء أمر شراء رسمي (PO)</h3>
          <button class="modal-close" onclick="closeModal('po-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <input type="hidden" id="po-edit-id" />
          
          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>المورد المستهدف *</label>
              <select id="po-sup-id" class="input">
                <option value="">-- اختر المورد --</option>
              </select>
            </div>
            <div class="form-group">
              <label>تاريخ أمر الشراء *</label>
              <input type="date" id="po-date" class="input" value="${h()}" />
            </div>
            <div class="form-group">
              <label>تاريخ التوريد المطلوب</label>
              <input type="date" id="po-delivery-date" class="input" value="${w()}" />
            </div>
          </div>

          <div class="grid-3 gap-12 mb-12">
            <div class="form-group">
              <label>المستودع المستلِم *</label>
              <select id="po-wh-id" class="input">
                <option value="">-- اختر المستودع --</option>
              </select>
            </div>
            <div class="form-group">
              <label>شروط الدفع</label>
              <input type="text" id="po-terms" class="input" placeholder="آجل 30 يوم / نقدي عند الاستلام" />
            </div>
            <div class="form-group">
              <label>حالة أمر الشراء</label>
              <select id="po-status" class="input">
                <option value="sent">📨 مرسل للمورد بانتظار التوريد</option>
                <option value="draft">📝 مسودة</option>
                <option value="received">✅ تم الاستلام والفوترة</option>
                <option value="cancelled">❌ ملغي</option>
              </select>
            </div>
          </div>

          <!-- Product Lines -->
          <div style="margin:16px 0 8px; display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight:800; font-size:13px; color:var(--text-0);">📦 الأصناف والكميات المطلوبة:</div>
            <button class="btn btn-secondary btn-sm" onclick="window.addPOLine()">+ إضافة صنف</button>
          </div>

          <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px; max-height:220px; overflow-y:auto; margin-bottom:12px;">
            <table class="data-dense" style="margin:0;">
              <thead>
                <tr>
                  <th>الصنف *</th>
                  <th style="width:100px;">الوحدة</th>
                  <th style="width:100px;">الكمية</th>
                  <th style="width:110px;">السعر التقديري</th>
                  <th style="width:110px; text-align:left;">الإجمالي</th>
                  <th style="width:40px;"></th>
                </tr>
              </thead>
              <tbody id="po-lines-tbody"></tbody>
            </table>
          </div>

          <div class="form-group">
            <label>ملاحظات التوريد والاشتراطات</label>
            <input type="text" id="po-notes" class="input" placeholder="اشتراطات درجة حرارة النقل، وقت وصول الشاحنة، اشتراطات التحميل..." />
          </div>

          <div id="po-modal-err" class="alert bad hidden mt-12"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('po-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="window.savePO()">💾 حفظ أمر الشراء</button>
        </div>
      </div>
    </div>
  `,await f(),D()}async function f(){try{const[e,t,n,o]=await Promise.all([v(u.purchaseOrders?u.purchaseOrders():"purchaseOrders",[b("createdAt","desc")]).catch(()=>[]),v(u.suppliers(),[b("name")]).catch(()=>[]),v(u.warehouses?u.warehouses():"warehouses",[b("name")]).catch(()=>[]),v(u.products(),[b("name")]).catch(()=>[])]);s=e,x=t,g=n,$=o,L(),N(),O()}catch(e){console.warn("Error loading purchase orders data:",e)}}function N(){const e=s.filter(i=>i.status==="sent"),t=s.filter(i=>i.status==="received"),n=e.reduce((i,a)=>i+(parseFloat(a.totalAmount)||0),0),o=(i,a)=>{const r=document.getElementById(i);r&&(r.textContent=a)};o("po-kpi-total",s.length),o("po-kpi-sent",e.length),o("po-kpi-received",t.length),o("po-kpi-val",c(n))}function L(){const e=document.getElementById("po-sup-filter"),t=document.getElementById("po-sup-id"),n=document.getElementById("po-wh-id"),o=x.map(i=>`<option value="${i.id}">${i.name}</option>`).join("");e&&(e.innerHTML='<option value="">كل الموردين</option>'+o),t&&(t.innerHTML='<option value="">-- اختر المورد --</option>'+o),n&&(n.innerHTML='<option value="">-- اختر المستودع --</option>'+g.map(i=>`<option value="${i.id}">${i.name}</option>`).join(""))}function O(e=s){const t=document.getElementById("po-tbody");if(!t)return;if(!e.length){t.innerHTML='<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد أوامر شراء مسجلة</td></tr>';return}const n={sent:'<span class="badge" style="background:rgba(59,130,246,0.15); color:#3B82F6; font-weight:700;">📨 مرسل للمورد</span>',draft:'<span class="badge neutral">مسودة</span>',received:'<span class="badge good">✅ تم الاستلام</span>',cancelled:'<span class="badge bad">ملغي</span>'};t.innerHTML=e.map(o=>`
    <tr>
      <td class="mono font-bold" style="color:var(--brand);">${o.poNumber||o.id}</td>
      <td class="font-bold">${o.supplierName}</td>
      <td class="mono dim">${o.date||"—"}</td>
      <td class="mono dim">${o.expectedDeliveryDate||"—"}</td>
      <td>${o.warehouseName||"المستودع الرئيسي"}</td>
      <td class="mono" style="text-align:center;">${(o.lines||[]).length}</td>
      <td class="mono font-bold" style="text-align:left; color:var(--brand); font-size:13px;">${c(o.totalAmount||0)}</td>
      <td style="text-align:center;">${n[o.status]||n.draft}</td>
      <td>
        <div class="row-actions" style="justify-content:center;">
          <button class="btn btn-icon sm btn-ghost" onclick="window.printOfficialPO('${o.id}')" title="طباعة أمر الشراء">🖨️</button>
          <button class="btn btn-icon sm btn-ghost" style="color:#25D366;" onclick="window.sharePOWhatsApp('${o.id}')" title="إرسال عبر واتساب">💬</button>
          ${o.status!=="received"?`
            <button class="btn btn-icon sm" style="color:#10B981;" onclick="window.convertPOToPurchaseInvoice('${o.id}')" title="⚡ تحويل لفاتورة مشتريات واستلام">⚡</button>
          `:""}
          <button class="btn btn-icon sm btn-ghost" onclick="window.editPO('${o.id}')" title="تعديل">✏️</button>
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.deletePO('${o.id}')" title="حذف">🗑️</button>
        </div>
      </td>
    </tr>
  `).join("")}function m(){const e=document.getElementById("po-lines-tbody");if(e){if(!d.length){e.innerHTML='<tr><td colspan="6" style="text-align:center; padding:16px; color:var(--text-3);">لا توجد أصناف. انقر على "+ إضافة صنف"</td></tr>';return}e.innerHTML=d.map((t,n)=>`
    <tr>
      <td>
        <select class="input" style="height:32px; font-size:12px;" onchange="window.updatePOLine(${n}, 'productId', this.value)">
          <option value="">-- اختر الصنف --</option>
          ${$.map(o=>`<option value="${o.id}" ${o.id===t.productId?"selected":""}>${o.name}</option>`).join("")}
        </select>
      </td>
      <td>
        <input type="text" class="input" style="height:32px; font-size:12px;" value="${t.unit||"كرتون"}" onchange="window.updatePOLine(${n}, 'unit', this.value)" />
      </td>
      <td>
        <input type="number" class="input mono" style="height:32px; font-size:12px;" value="${t.qty||""}" placeholder="100" min="1" oninput="window.updatePOLine(${n}, 'qty', this.value)" />
      </td>
      <td>
        <input type="number" class="input mono" style="height:32px; font-size:12px;" value="${t.unitPrice||""}" placeholder="0.00" min="0" step="0.5" oninput="window.updatePOLine(${n}, 'unitPrice', this.value)" />
      </td>
      <td class="mono font-bold" style="text-align:left;">
        ${c((t.unitPrice||0)*(t.qty||0))}
      </td>
      <td style="text-align:center;">
        <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.removePOLine(${n})">✕</button>
      </td>
    </tr>
  `).join("")}}function D(){window.filterPOs=()=>{const e=(document.getElementById("po-search")?.value||"").trim().toLowerCase(),t=document.getElementById("po-sup-filter")?.value||"",n=document.getElementById("po-status-filter")?.value||"",o=s.filter(i=>{const a=!e||(i.poNumber||"").toLowerCase().includes(e)||(i.supplierName||"").toLowerCase().includes(e),r=!t||i.supplierId===t,l=!n||i.status===n;return a&&r&&l});O(o)},window.openPOModal=()=>{document.getElementById("po-edit-id").value="",document.getElementById("po-modal-title").textContent="➕ إنشاء أمر شراء رسمي (PO)",document.getElementById("po-sup-id").value="",document.getElementById("po-date").value=h(),document.getElementById("po-delivery-date").value=w(),document.getElementById("po-wh-id").value=g[0]?.id||"",document.getElementById("po-terms").value="آجل 30 يوم",document.getElementById("po-status").value="sent",document.getElementById("po-notes").value="",document.getElementById("po-modal-err").classList.add("hidden"),d=[],m(),openModal("po-modal")},window.addPOLine=()=>{d.push({productId:"",productName:"",unit:"كرتون",qty:100,unitPrice:0}),m()},window.updatePOLine=(e,t,n)=>{if(d[e]){if(t==="productId"){const o=$.find(i=>i.id===n);d[e].productId=n,d[e].productName=o?o.name:"",d[e].unit=o&&o.unit||"كرتون",d[e].unitPrice=o&&(o.costPrice||o.purchasePrice)||0}else t==="unitPrice"||t==="qty"?d[e][t]=parseFloat(n)||0:d[e][t]=n;m()}},window.removePOLine=e=>{d.splice(e,1),m()},window.savePO=async()=>{const e=document.getElementById("po-modal-err");e.classList.add("hidden");const t=document.getElementById("po-sup-id").value,n=x.find(p=>p.id===t),o=document.getElementById("po-wh-id").value,i=g.find(p=>p.id===o),a=document.getElementById("po-edit-id").value;if(!t){e.textContent="يرجى اختيار المورد",e.classList.remove("hidden");return}if(!d.length){e.textContent="يرجى إضافة صنف واحد على الأقل",e.classList.remove("hidden");return}const r=a?void 0:`PO-${new Date().getFullYear()}-${String(s.length+1).padStart(4,"0")}`,l=d.reduce((p,P)=>p+(P.unitPrice||0)*(P.qty||0),0),y={supplierId:t,supplierName:n?n.name:"مورد",supplierPhone:n?n.phone:"",date:document.getElementById("po-date").value,expectedDeliveryDate:document.getElementById("po-delivery-date").value,warehouseId:o||null,warehouseName:i?i.name:"المستودع الرئيسي",paymentTerms:document.getElementById("po-terms").value.trim(),status:document.getElementById("po-status").value,notes:document.getElementById("po-notes").value.trim(),totalAmount:l,lines:d};r&&(y.poNumber=r);try{a?await I("purchaseOrders",a,y):await B("purchaseOrders",y),closeModal("po-modal"),await f()}catch(p){e.textContent=p.message,e.classList.remove("hidden")}},window.editPO=e=>{const t=s.find(n=>n.id===e);t&&(document.getElementById("po-edit-id").value=t.id,document.getElementById("po-modal-title").textContent="✏️ تعديل أمر الشراء: "+(t.poNumber||t.id),document.getElementById("po-sup-id").value=t.supplierId||"",document.getElementById("po-date").value=t.date||h(),document.getElementById("po-delivery-date").value=t.expectedDeliveryDate||w(),document.getElementById("po-wh-id").value=t.warehouseId||"",document.getElementById("po-terms").value=t.paymentTerms||"",document.getElementById("po-status").value=t.status||"sent",document.getElementById("po-notes").value=t.notes||"",d=t.lines||[],m(),openModal("po-modal"))},window.convertPOToPurchaseInvoice=async e=>{const t=s.find(n=>n.id===e);t&&confirm(`هل تريد تحويل أمر الشراء "${t.poNumber||t.id}" إلى فاتورة مشتريات معتمدة بعد استلام الشحنة؟`)&&(await I("purchaseOrders",e,{status:"received"}).catch(()=>{}),window.navigate&&(window.navigate("purchase-invoices"),setTimeout(()=>{typeof window.openNewPurchaseModal=="function"&&window.openNewPurchaseModal(t.supplierId,t.supplierName,t.lines)},350)))},window.sharePOWhatsApp=e=>{const t=s.find(l=>l.id===e);if(!t)return;const n=(t.supplierPhone||"").replace(/[^0-9]/g,""),o=n.startsWith("0")?"966"+n.slice(1):n.startsWith("966")?n:"966"+n,i=window.ERP_COMPANY?.name||"مؤسسة إدهام للمواد الغذائية",a=(t.lines||[]).map(l=>`• ${l.productName||l.name}: ${l.qty} ${l.unit||"كرتون"}`).join(`
`),r=`السادة المحترمون / ${t.supplierName}
تحية طيبة من ${i} 🌿

نرفق لكم أمر الشراء الرسمي رقم (${t.poNumber||t.id}):
• تاريخ التوريد المطلوب: ${t.expectedDeliveryDate||"عاجل"}
• المستودع المستلم: ${t.warehouseName||"المستودع الرئيسي"}
• إجمالي القيمة: ${c(t.totalAmount)}

الأصناف المطلوبة:
${a}

نرجو تأكيد الاستلام وموعد خروج الشاحنة.`;window.open(`https://api.whatsapp.com/send?phone=${o}&text=${encodeURIComponent(r)}`,"_blank")},window.printOfficialPO=e=>{const t=s.find(i=>i.id===e);if(!t)return;const n=window.ERP_COMPANY||{name:"مؤسسة إدهام للمواد الغذائية",crNumber:"1010000000",vatNumber:"310000000000003"},o=window.open("","_blank");o.document.write(`
      <html dir="rtl">
        <head>
          <title>أمر شراء رسمي - ${t.poNumber||t.id}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #111; line-height: 1.8; text-align: right; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 24px; }
            .box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin-bottom: 16px; font-size: 13.5px; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: right; }
            th { background: #f1f5f9; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; text-align: center; }
            .sig-line { border-top: 1px dashed #475569; margin-top: 50px; padding-top: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin:0;">${n.name}</h2>
            <div style="font-size:12px; color:#666;">س.ت: ${n.crNumber||"—"} | الرقم الضريبي: ${n.vatNumber||"—"}</div>
            <h3 style="margin-top:12px; color:#4338CA;">أمر شراء رسمي (Purchase Order)</h3>
            <div style="font-size:13px; font-weight:bold;">رقم الأمر: ${t.poNumber||t.id} | التاريخ: ${t.date||h()}</div>
          </div>

          <div class="box">
            <b>السادة / شركة:</b> ${t.supplierName}<br>
            <b>المستودع المستلم:</b> ${t.warehouseName||"المستودع الرئيسي"}<br>
            <b>تاريخ التوريد المتوقع:</b> ${t.expectedDeliveryDate||"—"}<br>
            <b>شروط السداد:</b> ${t.paymentTerms||"آجل"}
          </div>

          <table>
            <thead>
              <tr>
                <th>م</th>
                <th>الصنف والمواصفات</th>
                <th>الوحدة</th>
                <th style="text-align:center;">الكمية المطلوبة</th>
                <th style="text-align:left;">السعر المتفق عليه</th>
                <th style="text-align:left;">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${(t.lines||[]).map((i,a)=>`
                <tr>
                  <td>${a+1}</td>
                  <td><b>${i.productName||i.name}</b></td>
                  <td>${i.unit||"كرتون"}</td>
                  <td style="text-align:center;"><b>${i.qty}</b></td>
                  <td style="text-align:left;">${c(i.unitPrice||0)}</td>
                  <td style="text-align:left;"><b>${c((i.unitPrice||0)*(i.qty||0))}</b></td>
                </tr>
              `).join("")}
              <tr style="background:#f1f5f9; font-weight:bold;">
                <td colspan="5" style="text-align:center;">إجمالي أمر الشراء</td>
                <td style="text-align:left; color:#4338CA; font-size:14px;">${c(t.totalAmount)}</td>
              </tr>
            </tbody>
          </table>

          ${t.notes?`<p><b>ملاحظات التوريد:</b> ${t.notes}</p>`:""}

          <div class="signatures">
            <div>
              <div>إدارة المشتريات / ${n.name}</div>
              <div class="sig-line">الاعتماد والتوقيع</div>
            </div>
            <div>
              <div>موافقة وتأكيد المورد / ${t.supplierName}</div>
              <div class="sig-line">الختم وتاريخ التوريد</div>
            </div>
          </div>

          <script>window.onload = () => { window.print(); };<\/script>
        </body>
      </html>
    `),o.document.close()},window.deletePO=async e=>{if(confirm("هل أنت متأكد من حذف أمر الشراء هذا؟"))try{await E("purchaseOrders",e),await f()}catch(t){alert("فشل الحذف: "+t.message)}},window.exportPOsExcel=()=>{const e=s.map(t=>({"رقم الأمر":t.poNumber||t.id,المورد:t.supplierName,"تاريخ الطلب":t.date,"تاريخ التوريد المتوقع":t.expectedDeliveryDate,المستودع:t.warehouseName,الحالة:t.status,القيمة:t.totalAmount||0}));k(e)}}export{j as render};
