import{d as L,a as C,t as w,g as J,C as I,f as v,o as u,c as _,u as nt,z as D,k as st}from"./index-CF9GFeRJ.js";import{getDoc as j,doc as M,orderBy as q,query as R,getDocs as Q,deleteDoc as dt}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import{e as gt}from"./excel-DM5XZHtQ.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let k=[],ht=[],E=[],T=[],X=[],$="request",b=[],K=[],F=[],O=null,W=[];window._editingAdjId=null;window._adjLines=[];let G=[],Y=[],tt=[];window.spotCountLines=[];let at=null;async function Vt(){const e={name:"مؤسسة ادهام للمواد الغذائية",legalName:"مؤسسة ادهام للتجارة والتوزيع",vatNumber:"314996148100003",crNumber:"7054969006",phone:"0549141648",email:"Nuzmalamdad@gmail.com",address:"المملكة العربية السعودية — ينبع الصناعية",logoUrl:""};try{const t=JSON.parse(localStorage.getItem("idham_company")||"{}");(t.name||t.companyName)&&(Object.assign(e,t),t.companyName&&(e.name=t.companyName))}catch{}try{const[t,o]=await Promise.all([j(M(L,`companies/${C}/settings`,"company")),j(M(L,`companies/${C}/settings`,"logo"))]);if(t.exists()){const s=t.data();e.name=s.name||s.companyName||e.name,e.legalName=s.legalName||e.legalName,e.crNumber=s.crNumber||s.cr||e.crNumber,e.vatNumber=s.vatNumber||e.vatNumber,e.phone=s.phone||e.phone,e.email=s.email||e.email,e.address=s.address||(s.city?`${s.city} — ${s.street||""}`:e.address)}o.exists()&&o.data().dataUrl&&(e.logoUrl=o.data().dataUrl)}catch(t){console.warn("[getOpsCompanyInfo] Failed to read from Firestore:",t)}return e}window.printOpsDocument=(e,t="مستند مخزني")=>{const o=document.getElementById("_ops_print_frame");o&&o.remove();const s=document.createElement("iframe");s.id="_ops_print_frame",s.style.cssText="position:fixed;width:0;height:0;border:none;left:-9999px;top:-9999px;",document.body.appendChild(s);const a=()=>{const n=window.open("","_blank","width=1000,height=800");n&&(n.document.open(),n.document.write(e),n.document.close(),n.focus(),setTimeout(()=>{try{n.print()}catch{}},350))};try{const n=s.contentDocument||s.contentWindow.document;n.open(),n.write(e),n.close(),setTimeout(()=>{try{s.contentWindow.focus(),s.contentWindow.print()}catch{a()}},250)}catch{a()}};function V({title:e,docBadge:t,metaHtml:o,contentHtml:s,signaturesHtml:a,footerNotes:n}){return`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${e}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, 'Cairo', Arial, sans-serif;
      padding: 20px 25px;
      color: #111827;
      font-size: 12px;
      line-height: 1.45;
      direction: rtl;
      background: #ffffff;
      margin: 0;
    }
    @media print {
      body { padding: 10px 15px; }
      .no-print { display: none !important; }
      @page { size: A4; margin: 10mm 8mm; }
    }
    .print-toolbar {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    .btn-print {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
      font-size: 12px;
    }
    .btn-close {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
    }
    .header-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .company-info h1 {
      margin: 0 0 4px 0;
      color: #1e3a8a;
      font-size: 19px;
      font-weight: 800;
    }
    .company-info p {
      margin: 2px 0;
      color: #4b5563;
      font-size: 11px;
    }
    .doc-headline {
      text-align: left;
    }
    .doc-badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 800;
      background: #eff6ff;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }
    .doc-badge.good { background: #ecfdf5; color: #065f46; border-color: #a7f3d0; }
    .doc-badge.warn { background: #fffbeb; color: #92400e; border-color: #fde68a; }
    .doc-badge.bad  { background: #fef2f2; color: #991b1b; border-color: #fecaca; }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
    }
    .meta-item {
      font-size: 11.5px;
    }
    .meta-label {
      color: #64748b;
      margin-bottom: 2px;
      font-size: 10.5px;
    }
    .meta-val {
      font-weight: 700;
      color: #0f172a;
    }

    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 11.5px;
    }
    table.data-table th {
      background: #f1f5f9;
      color: #1e293b;
      font-weight: 700;
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      text-align: right;
    }
    table.data-table td {
      padding: 7px 10px;
      border: 1px solid #e2e8f0;
      text-align: right;
      color: #334155;
    }
    table.data-table tbody tr:nth-child(even) {
      background: #fafafa;
    }
    table.data-table tfoot td {
      background: #f8fafc;
      font-weight: 800;
      border-top: 2px solid #cbd5e1;
      color: #0f172a;
    }

    .signatures {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }
    .sig-box {
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
      padding: 10px;
      text-align: center;
      background: #fafafa;
    }
    .sig-role {
      font-weight: 700;
      color: #1e3a8a;
      font-size: 11px;
      margin-bottom: 30px;
    }
    .sig-name {
      border-top: 1px solid #94a3b8;
      padding-top: 4px;
      font-size: 10.5px;
      color: #64748b;
    }

    .print-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      font-size: 10px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 8px;
    }
    table.data-table td, table.data-table th {
      display: table-cell !important;
      vertical-align: middle;
    }
    .mono { font-family: Consolas, 'Courier New', monospace; direction: ltr; unicode-bidi: embed; }
  </style>
</head>
<body>
  <div class="print-toolbar no-print">
    <button class="btn-print" onclick="window.print()">🖨️ طباعة الآن / حفظ PDF</button>
    <button class="btn-close" onclick="window.close()">❌ إغلاق النافذة</button>
  </div>

  <div class="header-box">
    <div class="company-info">
      <h1>${e}</h1>
      <p><strong>مؤسسة ادهام للمواد الغذائية — الإدارة التشغيلية وسلاسل الإمداد</strong></p>
      <p>السجل التجاري: 7054969006 | الرقم الضريبي: 314996148100003 | ينبع الصناعية</p>
    </div>
    <div class="doc-headline">
      ${t}
    </div>
  </div>

  <div class="meta-grid">
    ${o}
  </div>

  ${s}

  ${n?`<div style="margin: 12px 0; padding: 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; font-size: 11px; color: #92400e;"><strong>ملاحظات وشروط:</strong> ${n}</div>`:""}

  <div class="signatures">
    ${a}
  </div>

  <div class="print-footer">
    <span>نظام ادهام ERP — إدارة العمليات وسلاسل الإمداد</span>
    <span>تاريخ وتوقيت الطباعة: ${new Date().toLocaleString("ar-SA")}</span>
    <span>صفحة 1 من 1</span>
  </div>
</body>
</html>`}async function Wt(e,t){e.innerHTML=`
    <!-- Modern Operations Filter & Action Bar -->
    <div class="filterbar no-print" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; padding:12px 16px; background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft); margin-bottom:16px;">
      <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap; flex:1;">
        <div style="min-width:260px;">
          <label style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:4px;">العملية التشغيلية / المديول الفرعي</label>
          <select id="ops-submodule-select" class="input font-bold" onchange="switchOpsSubModule(this.value)" style="border-color:#3b82f6; background:var(--bg-1);">
            <optgroup label="── دورة المشتريات والاستلام ──">
              <option value="request" selected>📋 طلبات الشراء والتسعير (PR / RFQ)</option>
              <option value="po">📜 أوامر الشراء المالية (Purchase Orders)</option>
              <option value="grpo">📦 أذونات استلام البضاعة (Goods Receipt)</option>
              <option value="inspect">🔬 محاضر فحص الجودة ومطابقة الأغذية (QI)</option>
            </optgroup>
            <optgroup label="── إدارة الحركة والأسطول ──">
              <option value="dispatch">📤 أوامر الصرف المخزني (Stock Dispatch)</option>
              <option value="vehicle">🚐 تحميل سيارات التوزيع (Vehicle Loading)</option>
              <option value="vehicle-return">🔄 استلام مرتجعات السيارات (Vehicle Return)</option>
            </optgroup>
            <optgroup label="── العمليات الصناعية والتسويات ──">
              <option value="assemble">⚙️ تجميع وتفكيك الحزم (Assembly / BOM)</option>
              <option value="adjust">⚖️ تسويات المخزون وإعدام التوالف (Adjustments)</option>
            </optgroup>
            <optgroup label="── الرقابة والجرد والتقييم ──">
              <option value="spot-count">🔢 كشوفات الجرد المفاجئ (Spot Count)</option>
              <option value="revalue">💰 إعادة تقييم المخزون (Stock Revaluation)</option>
            </optgroup>
          </select>
        </div>

        <div style="min-width:220px; flex:1; max-width:320px;">
          <label style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:4px;">بحث فوري ذكي</label>
          <input type="text" id="ops-search-input" class="input" placeholder="🔍 ابحث برقم المستند، الصنف، المورد..." oninput="window.filterActiveOpsTable(this.value)" style="height:36px; font-size:12px;" />
        </div>

        <div style="min-width:160px;">
          <label style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:4px;">تصفية بالحالة</label>
          <select id="ops-status-filter" class="input" onchange="window.filterActiveOpsTable()" style="height:36px; font-size:12px;">
            <option value="">كل الحالات</option>
            <option value="draft">مسودة / قيد الدراسة</option>
            <option value="sent">مرسل</option>
            <option value="pending">قيد الاعتماد</option>
            <option value="approved">معتمد / نشط</option>
            <option value="ordered">أمر شراء</option>
            <option value="received">مستلم / مكتمل</option>
            <option value="cancelled">ملغي / مرفوض</option>
          </select>
        </div>
      </div>

      <div style="display:flex; align-items:center; gap:8px;">
        <button class="btn btn-secondary" onclick="window.exportActiveOpsSubModuleExcel()" title="تصدير بيانات الجدول النشط إلى Excel" style="color:#047857; border-color:#a7f3d0; background:#ecfdf5; font-weight:700; font-size:12px; height:36px;">
          📊 تصدير Excel
        </button>
        <button class="btn btn-secondary" onclick="window.printActiveOpsTable()" title="طباعة كشف المعاملات المعروضة" style="color:#1d4ed8; border-color:#93c5fd; background:#eff6ff; font-weight:700; font-size:12px; height:36px;">
          🖨️ طباعة الجدول
        </button>
        <button class="btn btn-primary" id="ops-new-btn" onclick="window.openOpsModal()" style="font-weight:700; font-size:12px; height:36px;">
          ➕ معاملة جديدة
        </button>
      </div>
    </div>

    <!-- Main Dynamic Content Area -->
    <div class="page-content" id="ops-content-area" style="padding:0;">
       <div class="page-loading"><div class="loading-spinner"></div></div>
    </div>

    <!-- ==================== MODALS ==================== -->

    <!-- 1. Purchase Request (PR) Create Modal -->
    <div class="modal-overlay" id="pr-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title">📋 إنشاء طلب شراء / تسعير جديد (PR / RFQ)</h3><button class="modal-close" onclick="closeModal('pr-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;">
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>تاريخ الطلب *</label><input type="date" id="pr-date" class="input" value="${w()}" /></div>
          <div class="form-group"><label>المستودع المطلوب التوريد له *</label><select id="pr-wh" class="input"></select></div>
          <div class="form-group"><label>المورد المقترح (اختياري)</label><select id="pr-supplier" class="input"><option value="">طلب تسعير عام للموردين</option></select></div>
        </div>

        <div style="border:1px solid var(--border-soft); border-radius:8px; padding:12px; background:var(--bg-2); margin-bottom:16px;">
          <div style="display:grid; grid-template-columns:1fr 2fr 1fr; gap:12px; align-items:end; margin-bottom:8px;">
            <div class="form-group" style="margin-bottom:0;"><label>تصفية بالفئة</label><select id="pr-item-cat" class="input" onchange="window.filterOpsProducts('pr-item-sel', this.value)"><option value="">كل الفئات</option></select></div>
            <div class="form-group" style="margin-bottom:0;"><label>إضافة صنف من الكتالوج</label><select id="pr-item-sel" class="input"><option value="">اختر...</option></select></div>
            <div class="form-group" style="margin-bottom:0;"><label>الكمية المطلوبة</label><input type="number" id="pr-item-qty" class="input mono font-bold" value="1" min="1" /></div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <button class="btn btn-sm btn-secondary" onclick="window.addPRItem()">+ إضافة من الكتالوج</button>
            <div style="display:flex; align-items:center; gap:6px;">
              <input type="text" id="pr-free-name" class="input" placeholder="أو اكتب صنف يدوي (بند حر)..." style="height:32px; font-size:12px; width:220px;" />
              <input type="number" id="pr-free-qty" class="input mono font-bold" value="1" min="1" style="height:32px; font-size:12px; width:65px; text-align:center;" />
              <button class="btn btn-sm btn-primary" onclick="window.addFreePRItem()" style="height:32px; background:#059669; border-color:#059669; font-weight:700; font-size:11.5px; white-space:nowrap;">✍️ إضافة بند حر</button>
            </div>
          </div>
        </div>

        <div class="table-container mb-16">
          <table class="data-dense" style="width:100%;">
            <thead><tr><th>#</th><th>رمز الصنف (SKU)</th><th>اسم الصنف المطلوب</th><th>الكمية</th><th>حذف</th></tr></thead>
            <tbody id="pr-lines-tbody"></tbody>
          </table>
        </div>

        <div class="form-group"><label>البيان / أسباب ومبررات الطلب</label><textarea id="pr-notes" class="input" rows="2" placeholder="اكتب مبررات الشراء أو شروط خاصة..."></textarea></div>
        <div id="pr-error" class="alert bad hidden" style="margin-top:16px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('pr-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="window.savePurchaseRequest()" id="save-pr-btn">💾 حفظ وتقديم طلب الشراء</button>
      </div></div>
    </div>

    <!-- 1B. Purchase Request (PR) Detail Modal -->
    <div class="modal-overlay" id="pr-detail-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title" id="pr-detail-title">📄 تفاصيل طلب الشراء</h3><button class="modal-close" onclick="closeModal('pr-detail-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;" id="pr-detail-body">
        <!-- Rendered dynamically -->
      </div>
      <div class="modal-footer" id="pr-detail-footer" style="display:flex; justify-content:space-between; align-items:center;">
        <button class="btn btn-secondary" onclick="closeModal('pr-detail-modal')">إغلاق</button>
        <div style="display:flex; gap:8px;" id="pr-detail-actions">
          <!-- Dynamic action buttons -->
        </div>
      </div></div>
    </div>

    <!-- 2. Purchase Order (PO) Create Modal -->
    <div class="modal-overlay" id="po-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title">📜 إصدار أمر شراء مالي جديد (PO)</h3><button class="modal-close" onclick="closeModal('po-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;">
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>تاريخ الأمر *</label><input type="date" id="po-date" class="input" value="${w()}" /></div>
          <div class="form-group"><label>المورد المستهدف *</label><select id="po-supplier" class="input font-bold"></select></div>
          <div class="form-group"><label>مستودع الاستلام المتفق عليه *</label><select id="po-wh" class="input"></select></div>
        </div>
        <div style="border:1px solid var(--border-soft); border-radius:8px; padding:12px; background:var(--bg-2); margin-bottom:16px;">
          <div style="display:grid; grid-template-columns:1.2fr 2fr 1fr 1fr; gap:12px; align-items:end; margin-bottom:8px;">
            <div class="form-group" style="margin-bottom:0;"><label>تصفية بالفئة</label><select id="po-item-cat" class="input" onchange="window.filterOpsProducts('po-item-sel', this.value)"><option value="">كل الفئات</option></select></div>
            <div class="form-group" style="margin-bottom:0;"><label>إضافة صنف</label><select id="po-item-sel" class="input" onchange="window.onPOSelItemChange(this.value)"><option value="">اختر...</option></select></div>
            <div class="form-group" style="margin-bottom:0;"><label>سعر التكلفة (ر.س) *</label><input type="number" id="po-item-cost" class="input mono font-bold" step="0.01" value="0.00" /></div>
            <div class="form-group" style="margin-bottom:0;"><label>الكمية المطلوبة *</label><input type="number" id="po-item-qty" class="input mono font-bold" value="1" min="1" /></div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="window.addPOItem()">+ إضافة صنف للأمر</button>
        </div>
        <div class="table-container mb-16">
          <table class="data-dense" style="width:100%;">
            <thead><tr><th>رمز الصنف</th><th>اسم الصنف</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th><th></th></tr></thead>
            <tbody id="po-lines-tbody"></tbody>
            <tfoot>
              <tr style="font-weight:bold; background:var(--bg-hover);">
                <td colspan="4" style="text-align:right;">الإجمالي الكلي لأمر الشراء:</td>
                <td id="po-total-cost-label" class="mono font-bold text-good" style="text-align:left;">0.00 ر.س</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div class="form-group"><label>شروط التوريد وملاحظات الاتفاق</label><textarea id="po-notes" class="input" rows="2" placeholder="مواعيد التوريد، شروط الدفع، موقع التسليم..."></textarea></div>
        <div id="po-error" class="alert bad hidden" style="margin-top:16px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('po-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="window.savePurchaseOrder()" id="save-po-btn">📜 اعتماد وإصدار أمر الشراء</button>
      </div></div>
    </div>

    <!-- 2B. Purchase Order (PO) Detail Modal -->
    <div class="modal-overlay" id="po-detail-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title" id="po-detail-title">📜 تفاصيل أمر الشراء</h3><button class="modal-close" onclick="closeModal('po-detail-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;" id="po-detail-body">
        <!-- Rendered dynamically -->
      </div>
      <div class="modal-footer" id="po-detail-footer" style="display:flex; justify-content:space-between; align-items:center;">
        <button class="btn btn-secondary" onclick="closeModal('po-detail-modal')">إغلاق</button>
        <div style="display:flex; gap:8px;" id="po-detail-actions">
          <!-- Dynamic action buttons -->
        </div>
      </div></div>
    </div>

    <!-- 3. Goods Receipt PO (GRPO) Modal -->
    <div class="modal-overlay" id="grpo-modal">
      <div class="modal modal-lg" style="max-width:950px;"><div class="modal-header"><h3 class="modal-title">📦 إذن استلام بضاعة مخزني (GRPO)</h3><button class="modal-close" onclick="closeModal('grpo-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;">
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>تاريخ الاستلام *</label><input type="date" id="grpo-date" class="input" value="${w()}" /></div>
          <div class="form-group"><label>استيراد من أمر شراء معتمد (PO) *</label><select id="grpo-po-select" class="input font-bold" onchange="window.loadPOToGRPO(this.value)"><option value="">اختر أمر شراء للتحويل...</option></select></div>
          <div class="form-group"><label>مستودع الاستلام الفعلي *</label><select id="grpo-wh" class="input" disabled></select></div>
        </div>
        
        <div class="table-container mb-16">
          <table class="data-dense" style="width:100%;">
            <thead>
              <tr>
                <th>الصنف</th>
                <th style="width:110px;">الكمية بالوحدة</th>
                <th style="width:110px;">الكمية بالأساس</th>
                <th style="width:110px;">التكلفة المالية</th>
                <th style="width:120px;">رقم التشغيلة (Batch)</th>
                <th style="width:120px;">تاريخ الانتهاء</th>
              </tr>
            </thead>
            <tbody id="grpo-lines-tbody">
              <tr><td colspan="6" class="dim" style="text-align:center; padding:20px;">يرجى اختيار أمر شراء لاستيراد بنوده</td></tr>
            </tbody>
          </table>
        </div>

        <div id="grpo-error" class="alert bad hidden" style="margin-top:16px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('grpo-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="window.saveGRPO()" id="save-grpo-btn" disabled>📦 تأكيد الاستلام وإضافة للمخزون</button>
      </div></div>
    </div>

    <!-- 3B. Goods Receipt PO (GRPO) Detail Modal -->
    <div class="modal-overlay" id="grpo-detail-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title" id="grpo-detail-title">📦 تفاصيل إذن الاستلام المخزني</h3><button class="modal-close" onclick="closeModal('grpo-detail-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;" id="grpo-detail-body">
        <!-- Rendered dynamically -->
      </div>
      <div class="modal-footer" id="grpo-detail-footer" style="display:flex; justify-content:space-between; align-items:center;">
        <button class="btn btn-secondary" onclick="closeModal('grpo-detail-modal')">إغلاق</button>
        <div style="display:flex; gap:8px;" id="grpo-detail-actions"></div>
      </div></div>
    </div>

    <!-- 4. Quality Inspection (QI) Modal -->
    <div class="modal-overlay" id="qi-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title">🔬 محضر فحص جودة ومطابقة حرارية للمنتجات الغذائية</h3><button class="modal-close" onclick="closeModal('qi-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;">
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>تاريخ الفحص *</label><input type="date" id="qi-date" class="input" value="${w()}" /></div>
          <div class="form-group"><label>رقم التشغيلة (Batch) *</label><input type="text" id="qi-batch" class="input mono font-bold" placeholder="BATCH-1234" /></div>
          <div class="form-group"><label>درجة الحرارة المستلمة (°م) *</label><input type="number" id="qi-temp" class="input mono font-bold" placeholder="-18 أو 4" /></div>
        </div>
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>الصنف المفحوص *</label><select id="qi-product" class="input"></select></div>
          <div class="form-group"><label>تاريخ الإنتاج *</label><input type="date" id="qi-prod-date" class="input" /></div>
          <div class="form-group"><label>تاريخ انتهاء الصلاحية *</label><input type="date" id="qi-expiry" class="input" /></div>
        </div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>حالة المطابقة الغذائية العامة *</label>
            <select id="qi-status" class="input font-bold">
              <option value="passed">✅ مطابق ومقبول للاستهلاك (Passed)</option>
              <option value="failed">❌ مرفوض للتلف / حرارة غير مطابقة (Failed)</option>
              <option value="conditional">⚠️ مقبول مشروط بالاستهلاك العاجل (Conditional)</option>
            </select>
          </div>
          <div class="form-group"><label>المستودع المستهدف *</label><select id="qi-wh" class="input"></select></div>
        </div>
        <div class="form-group"><label>ملاحظات الفحص المخبري والظاهري (سلامة التغليف، الرائحة، درجة التجمد)</label><textarea id="qi-notes" class="input" rows="2" placeholder="ملاحظات المفتش الصحي ومسؤول الجودة..."></textarea></div>
        <div id="qi-error" class="alert bad hidden" style="margin-top:16px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('qi-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="window.saveQualityInspection()" id="save-qi-btn">🔬 حفظ واعتماد محضر الفحص</button>
      </div></div>
    </div>

    <!-- 4B. Quality Inspection (QI) Detail Modal -->
    <div class="modal-overlay" id="qi-detail-modal">
      <div class="modal modal-md"><div class="modal-header"><h3 class="modal-title" id="qi-detail-title">🔬 تفاصيل محضر فحص الجودة</h3><button class="modal-close" onclick="closeModal('qi-detail-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;" id="qi-detail-body"></div>
      <div class="modal-footer" id="qi-detail-footer" style="display:flex; justify-content:space-between;">
        <button class="btn btn-secondary" onclick="closeModal('qi-detail-modal')">إغلاق</button>
        <div style="display:flex; gap:8px;" id="qi-detail-actions"></div>
      </div></div>
    </div>

    <!-- 5. Stock Dispatch Modal -->
    <div class="modal-overlay" id="dispatch-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title">📤 إنشاء أمر صرف مخزني</h3><button class="modal-close" onclick="closeModal('dispatch-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;">
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>تاريخ الصرف *</label><input type="date" id="dsp-date" class="input" value="${w()}" /></div>
          <div class="form-group"><label>المخزن المصدر *</label><select id="dsp-wh" class="input"></select></div>
          <div class="form-group"><label>الغرض من الصرف *</label>
            <select id="dsp-purpose" class="input font-bold">
              <option value="internal">صرف تشغيلي داخلي</option>
              <option value="production">صرف للتصنيع والتعبئة</option>
              <option value="sales">تسليم مبيعات مباشرة</option>
              <option value="sample">عينات تسويقية وتذوق</option>
              <option value="other">أغراض أخرى</option>
            </select>
          </div>
        </div>
        <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:8px; padding:12px; margin-bottom:16px;">
          <div class="grid-3 gap-12 mb-8">
            <div class="form-group" style="grid-column:span 2;"><label>إضافة صنف</label><select id="dsp-item-sel" class="input"><option value="">اختر…</option></select></div>
            <div class="form-group"><label>الكمية المنصرفة</label><input type="number" id="dsp-item-qty" class="input mono font-bold" value="1" min="1" /></div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="window.addDispatchItem()">+ إضافة للقائمة</button>
        </div>
        <div class="table-container mb-16">
          <table class="data-dense" style="width:100%;">
            <thead><tr><th>رمز الصنف</th><th>اسم الصنف</th><th>الكمية</th><th>التكلفة التقديرية</th><th>الإجمالي</th><th></th></tr></thead>
            <tbody id="dsp-lines-tbody"></tbody>
          </table>
        </div>
        <div class="form-group"><label>البيان / المستلم المسؤول</label><textarea id="dsp-notes" class="input" rows="2" placeholder="الجهة المستلمة، الغرض، المستند المرجعي..."></textarea></div>
        <div id="dsp-error" class="alert bad hidden" style="margin-top:12px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('dispatch-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="window.saveDispatch()" id="save-dsp-btn">📤 تأكيد وتنفيذ الصرف المخزني</button>
      </div></div>
    </div>

    <!-- 5B. Stock Dispatch Detail Modal -->
    <div class="modal-overlay" id="dispatch-detail-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title" id="dispatch-detail-title">📤 تفاصيل إذن الصرف المخزني</h3><button class="modal-close" onclick="closeModal('dispatch-detail-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;" id="dispatch-detail-body"></div>
      <div class="modal-footer" id="dispatch-detail-footer" style="display:flex; justify-content:space-between;">
        <button class="btn btn-secondary" onclick="closeModal('dispatch-detail-modal')">إغلاق</button>
        <div style="display:flex; gap:8px;" id="dispatch-detail-actions"></div>
      </div></div>
    </div>

    <!-- 6. Vehicle Load Modal -->
    <div class="modal-overlay" id="vehicle-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title">🚐 تحميل بضاعة على سيارة التوزيع (مانيفست شحن)</h3><button class="modal-close" onclick="closeModal('vehicle-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;">
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>تاريخ التحميل *</label><input type="date" id="veh-date" class="input" value="${w()}" /></div>
          <div class="form-group"><label>المخزن المصدر *</label><select id="veh-src-wh" class="input"></select></div>
          <div class="form-group"><label>مخزن السيارة (الوجهة) *</label><select id="veh-dst-wh" class="input font-bold"></select></div>
        </div>
        <div class="form-group mb-16"><label>اسم المندوب / السائق المسؤول *</label><input type="text" id="veh-driver" class="input font-bold" placeholder="اسم المندوب أو السائق" /></div>
        <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:8px; padding:12px; margin-bottom:16px;">
          <div class="grid-3 gap-12 mb-8">
            <div class="form-group" style="grid-column:span 2;"><label>إضافة صنف للشحنة</label><select id="veh-item-sel" class="input"><option value="">اختر…</option></select></div>
            <div class="form-group"><label>الكمية المحملة</label><input type="number" id="veh-item-qty" class="input mono font-bold" value="1" min="1" /></div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="window.addVehicleItem()">+ إضافة للمانيفست</button>
        </div>
        <div class="table-container mb-16">
          <table class="data-dense" style="width:100%;">
            <thead><tr><th>رمز الصنف</th><th>اسم الصنف</th><th>الكمية</th><th></th></tr></thead>
            <tbody id="veh-lines-tbody"></tbody>
          </table>
        </div>
        <div class="form-group"><label>ملاحظات خط السير والتحميل</label><textarea id="veh-notes" class="input" rows="2" placeholder="المنطقة المستهدفة، تعليمات الحفظ والتبريد..."></textarea></div>
        <div id="veh-error" class="alert bad hidden" style="margin-top:12px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('vehicle-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="window.saveVehicleLoad()" id="save-veh-btn">🚐 اعتماد المانيفست ونقل العهدة</button>
      </div></div>
    </div>

    <!-- 6B. Vehicle Load Detail Modal -->
    <div class="modal-overlay" id="vehicle-detail-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title" id="vehicle-detail-title">🚐 تفاصيل مانيفست تحميل السيارة</h3><button class="modal-close" onclick="closeModal('vehicle-detail-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;" id="vehicle-detail-body"></div>
      <div class="modal-footer" id="vehicle-detail-footer" style="display:flex; justify-content:space-between;">
        <button class="btn btn-secondary" onclick="closeModal('vehicle-detail-modal')">إغلاق</button>
        <div style="display:flex; gap:8px;" id="vehicle-detail-actions"></div>
      </div></div>
    </div>

    <!-- 7. Vehicle Return Modal -->
    <div class="modal-overlay" id="vehicle-return-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title">🔄 إذن استلام مرتجع بضاعة من سيارة التوزيع</h3><button class="modal-close" onclick="closeModal('vehicle-return-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;">
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>تاريخ الاستلام *</label><input type="date" id="vr-date" class="input" value="${w()}" /></div>
          <div class="form-group"><label>سيارة التوزيع (المصدر) *</label><select id="vr-src-wh" class="input font-bold"></select></div>
          <div class="form-group"><label>المستودع المستقبل *</label><select id="vr-dst-wh" class="input"></select></div>
        </div>
        <div class="form-group mb-16"><label>اسم المندوب / السائق *</label><input type="text" id="vr-driver" class="input font-bold" placeholder="اسم المندوب المسلّم" /></div>
        <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:8px; padding:12px; margin-bottom:16px;">
          <div class="grid-3 gap-12 mb-8">
            <div class="form-group"><label>إضافة صنف مرتجع</label><select id="vr-item-sel" class="input"><option value="">اختر…</option></select></div>
            <div class="form-group"><label>الكمية المرتجعة</label><input type="number" id="vr-item-qty" class="input mono font-bold" value="1" min="1" /></div>
            <div class="form-group"><label>سبب الارتجاع</label>
              <select id="vr-item-reason" class="input">
                <option value="unsold">فائض غير مباع (سليم)</option>
                <option value="cust_return">مرتجع من عميل</option>
                <option value="damaged">تالف أثناء النقل</option>
                <option value="near_expiry">قريب الانتهاء</option>
              </select>
            </div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="window.addVehReturnItem()">+ إضافة للقائمة</button>
        </div>
        <div class="table-container mb-16">
          <table class="data-dense" style="width:100%;">
            <thead><tr><th>رمز الصنف</th><th>اسم الصنف</th><th>الكمية</th><th>سبب الارتجاع</th><th></th></tr></thead>
            <tbody id="vr-lines-tbody"></tbody>
          </table>
        </div>
        <div class="form-group"><label>ملاحظات الاستلام والفحص</label><textarea id="vr-notes" class="input" rows="2" placeholder="حالة البضاعة، رقم فاتورة العميل إن وجد..."></textarea></div>
        <div id="vr-error" class="alert bad hidden" style="margin-top:12px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('vehicle-return-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="window.saveVehicleReturn()" id="save-vr-btn">🔄 تأكيد استلام المرتجع للمستودع</button>
      </div></div>
    </div>

    <!-- 7B. Vehicle Return Detail Modal -->
    <div class="modal-overlay" id="vehicle-return-detail-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title" id="vehicle-return-detail-title">🔄 تفاصيل إذن استلام المرتجع</h3><button class="modal-close" onclick="closeModal('vehicle-return-detail-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;" id="vehicle-return-detail-body"></div>
      <div class="modal-footer" id="vehicle-return-detail-footer" style="display:flex; justify-content:space-between;">
        <button class="btn btn-secondary" onclick="closeModal('vehicle-return-detail-modal')">إغلاق</button>
        <div style="display:flex; gap:8px;" id="vehicle-return-detail-actions"></div>
      </div></div>
    </div>

    <!-- 8. Assembly / Disassembly Modal -->
    <div class="modal-overlay" id="asm-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title">⚙️ تجميع / تفكيك حزم المنتجات (BOM)</h3><button class="modal-close" onclick="closeModal('asm-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;">
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>النوع *</label>
            <select id="asm-type" class="input font-bold">
              <option value="assembly">تجميع حزمة جديدة (Assembly)</option>
              <option value="disassembly">تفكيك حزمة لمكوناتها (Disassembly)</option>
            </select>
          </div>
          <div class="form-group"><label>الصنف الرئيسي (الحزمة) *</label><select id="asm-product" class="input font-bold"></select></div>
          <div class="form-group"><label>الكمية المستهدفة *</label><input type="number" id="asm-qty" class="input mono font-bold" min="1" value="1" /></div>
        </div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>المستودع المنفذ للعملية *</label><select id="asm-wh" class="input"></select></div>
          <div class="form-group"><label>تاريخ العملية</label><input type="date" id="asm-date" class="input" value="${w()}" /></div>
        </div>
        <div style="border:1px solid var(--border-soft); border-radius:8px; padding:12px; background:var(--bg-2); margin-bottom:16px;">
          <div class="grid-3 gap-12 mb-8">
            <div class="form-group" style="grid-column:span 2;"><label>إضافة مكون فرعي</label><select id="asm-component-sel" class="input"><option value="">اختر...</option></select></div>
            <div class="form-group"><label>الكمية لكل حزمة واحدة</label><input type="number" id="asm-component-qty" class="input mono font-bold" value="1" min="1" /></div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="window.addAssemblyComponent()">+ إضافة مكون لقائمة المواد</button>
        </div>
        <div class="table-container mb-16">
          <table class="data-dense" style="width:100%;">
            <thead><tr><th>المكون الفرعي</th><th>الكمية لكل حزمة</th><th>إجمالي الكمية المطلوبة</th><th></th></tr></thead>
            <tbody id="asm-lines-tbody"></tbody>
          </table>
        </div>
        <div id="asm-error" class="alert bad hidden" style="margin-top:16px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('asm-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="window.saveAssembly()" id="save-asm-btn">⚙️ تنفيذ العملية وتحديث الأرصدة</button>
      </div></div>
    </div>

    <!-- 8B. Assembly Detail Modal -->
    <div class="modal-overlay" id="assembly-detail-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title" id="assembly-detail-title">⚙️ تفاصيل أمر التجميع / التفكيك</h3><button class="modal-close" onclick="closeModal('assembly-detail-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;" id="assembly-detail-body"></div>
      <div class="modal-footer" id="assembly-detail-footer" style="display:flex; justify-content:space-between;">
        <button class="btn btn-secondary" onclick="closeModal('assembly-detail-modal')">إغلاق</button>
        <div style="display:flex; gap:8px;" id="assembly-detail-actions"></div>
      </div></div>
    </div>

    <!-- 9. Adjustments / Damage Modal -->
    <div class="modal-overlay" id="adj-modal">
      <div class="modal modal-lg" style="max-width:880px; max-height:90vh; overflow-y:auto;"><div class="modal-header"><h3 class="modal-title" id="adj-modal-title">⚖️ تسوية وصرف وإهلاك مخزني</h3><button class="modal-close" onclick="closeModal('adj-modal')">×</button></div>
      <div class="modal-body" style="padding:20px;">
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group">
            <label>نوع العملية *</label>
            <select id="adj-type" class="input font-bold">
              <option value="damage">إعدام سلع تالفة (Damage Write-off)</option>
              <option value="add">تسوية إضافة (+)</option>
              <option value="deduct">تسوية خصم (-)</option>
              <option value="return-damaged">مرتجع تالف للمورد</option>
              <option value="expired">إعدام منتهي الصلاحية</option>
              <option value="donation">تبرعات وهبات (سلة البركة)</option>
            </select>
          </div>
          <div class="form-group"><label>المستودع المتأثر *</label><select id="adj-wh" class="input"></select></div>
          <div class="form-group"><label>التاريخ *</label><input type="date" id="adj-date" class="input" value="${w()}" /></div>
        </div>

        <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:8px; padding:16px; margin-bottom:16px;">
          <h4 style="margin:0 0 12px 0; font-size:14px; color:var(--text-1);">إضافة صنف للمعاملة</h4>
          <div class="grid-3 gap-12 mb-12">
            <div class="form-group" style="position:relative; margin-bottom:0;">
              <label>الصنف *</label>
              <input type="text" id="adj-product-search" class="input" placeholder="ابحث باسم الصنف أو الباركود..." autocomplete="off" />
              <div class="autocomplete-results hidden" id="adj-product-results" style="position:absolute; width:100%; max-height:200px; overflow-y:auto; background:var(--bg-card); border:1px solid var(--border-soft); z-index:1000; box-shadow:0 4px 6px rgba(0,0,0,0.1);"></div>
              <input type="hidden" id="adj-product" />
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label>الكمية *</label>
              <input type="number" id="adj-qty" class="input mono font-bold" min="0.001" step="0.001" value="1" />
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label>تكلفة الوحدة (ر.س)</label>
              <input type="number" id="adj-cost" class="input mono font-bold" step="0.01" placeholder="0.00" />
            </div>
          </div>
          <div style="text-align:left;">
            <button class="btn btn-sm btn-secondary" onclick="window.addAdjLine()">➕ إضافة صنف للقائمة</button>
          </div>
        </div>

        <div class="table-container mb-16" style="border: 1px solid var(--border-soft); border-radius: 6px;">
          <table class="data-dense" style="width:100%;">
            <thead>
              <tr>
                <th>رمز الصنف (SKU)</th>
                <th>اسم الصنف</th>
                <th style="text-align:center; width:100px;">الكمية</th>
                <th style="text-align:left; width:120px;">تكلفة الوحدة</th>
                <th style="text-align:left; width:120px;">إجمالي التكلفة</th>
                <th style="text-align:center; width:60px;">إجراءات</th>
              </tr>
            </thead>
            <tbody id="adj-items-tbody"></tbody>
            <tfoot>
              <tr style="font-weight:bold; background:var(--bg-hover);">
                <td colspan="4" style="text-align:right;">الإجمالي الكلي لتكلفة التسوية:</td>
                <td id="adj-total-cost-label" class="mono font-bold text-good" style="text-align:left;">0.00 ر.س</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="form-group"><label>البيان / أسباب الإعدام أو التعديل *</label><textarea id="adj-notes" class="input" rows="2" placeholder="يرجى توضيح سبب التسوية أو محضر الإتلاف..."></textarea></div>
        <div id="adj-error" class="alert bad hidden" style="margin-top:16px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('adj-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="window.saveAdjustment()" id="save-adj-btn">💾 حفظ المعاملة وإنشاء قيد محاسبي</button>
      </div></div>
    </div>

    <!-- 9B. Adjustments Detail Modal -->
    <div class="modal-overlay" id="adj-detail-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title" id="adj-detail-title">⚖️ تفاصيل معاملة التسوية المخزنية</h3><button class="modal-close" onclick="closeModal('adj-detail-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;" id="adj-detail-body"></div>
      <div class="modal-footer" id="adj-detail-footer" style="display:flex; justify-content:space-between;">
        <button class="btn btn-secondary" onclick="closeModal('adj-detail-modal')">إغلاق</button>
        <div style="display:flex; gap:8px;" id="adj-detail-actions"></div>
      </div></div>
    </div>

    <!-- 10. Spot Count Modal -->
    <div class="modal-overlay" id="spot-count-modal">
      <div class="modal modal-lg" style="max-width:980px;"><div class="modal-header"><h3 class="modal-title">🔢 جرد مخزني مفاجئ ومطابقة فعلية (Spot Count)</h3><button class="modal-close" onclick="closeModal('spot-count-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;">
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>المخزن الأول (الأساسي) *</label><select id="sc-wh" class="input font-bold" onchange="window.spotCountLines = []; syncCurrentSpotCountLinesFromDOM();"></select></div>
          <div class="form-group"><label>المخزن الثاني (اختياري)</label><select id="sc-wh2" class="input font-bold" onchange="window.spotCountLines = []; syncCurrentSpotCountLinesFromDOM();"><option value="">-- لا يوجد --</option></select></div>
          <div class="form-group"><label>تاريخ الجرد *</label><input type="date" id="sc-date" class="input font-bold" value="${w()}" /></div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:12px; background:var(--bg-2); padding:10px 14px; border-radius:8px; border:1px solid var(--border-soft);">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <input type="text" id="sc-search-input" class="input input-sm mono" placeholder="🔍 بحث بالاسم أو الباركود..." style="width:210px;" oninput="window.filterSpotCountTable(this.value)" />
            <select id="sc-filter-mode" class="input input-sm" style="width:165px;" onchange="window.filterSpotCountTable()">
              <option value="all">كل الأصناف</option>
              <option value="has-stock">أصناف بها رصيد فقط (>0)</option>
              <option value="diff-only">أصناف بها فروقات فقط</option>
            </select>
            <span id="sc-count-badge" class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:700; font-size:11px;"></span>
          </div>
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn btn-sm btn-secondary" onclick="window.printCurrentSpotCountDraft()" title="طباعة مسودة كشف الجرد PDF بكافة الخانات قبل الاعتماد" style="color:#1d4ed8; border-color:#93c5fd; background:#eff6ff; font-weight:700;">
              🖨️ طباعة مسودة كشف الجرد
            </button>
            <button type="button" class="btn btn-sm btn-secondary" onclick="window.exportCurrentSpotCountDraftExcel()" title="تصدير كشف الجرد بكافة الخانات إلى Excel" style="color:#047857; border-color:#a7f3d0; background:#ecfdf5; font-weight:700;">
              📊 تصدير Excel
            </button>
          </div>
        </div>
        <div class="table-container mb-16">
          <table class="data-dense" style="width:100%;">
            <thead id="sc-table-thead"><tr><th>الصنف</th><th>الكمية الدفترية</th><th>الكمية الفعلية</th><th>الفرق</th></tr></thead>
            <tbody id="sc-lines-tbody"><tr><td colspan="7" style="text-align:center;padding:25px;color:var(--text-2);">اختر المخزن واضغط "تحميل أصناف المخزن" للبدء</td></tr></tbody>
          </table>
        </div>
        <div id="sc-error" class="alert bad hidden" style="margin-top:12px;"></div>
      </div>
      <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary" onclick="closeModal('spot-count-modal')">إلغاء</button>
          <button class="btn btn-warning" onclick="window.loadSpotCountItems()" id="load-sc-btn" style="background:#F59E0B;color:#fff; font-weight:700;">📥 تحميل أصناف المخزن</button>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <button type="button" class="btn btn-secondary" onclick="window.printCurrentSpotCountDraft()" style="color:#1d4ed8; border-color:#93c5fd; background:#eff6ff; font-weight:700;">
            🖨️ طباعة PDF
          </button>
          <button type="button" class="btn btn-secondary" onclick="window.exportCurrentSpotCountDraftExcel()" style="color:#047857; border-color:#a7f3d0; background:#ecfdf5; font-weight:700;">
            📊 تصدير Excel
          </button>
          <button class="btn btn-primary" onclick="window.saveSpotCount()" id="save-sc-btn" disabled>✅ اعتماد الجرد وإنشاء تسويات</button>
        </div>
      </div></div>
    </div>

    <!-- 10B. Spot Count Detail Modal -->
    <div class="modal-overlay" id="spot-count-detail-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title">📄 تفاصيل جرد المخزون المفاجئ</h3><button class="modal-close" onclick="closeModal('spot-count-detail-modal')">×</button></div>
      <div class="modal-body" style="max-height:75vh; overflow-y:auto;" id="sc-detail-body"></div>
      <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center;">
        <button class="btn btn-secondary" onclick="closeModal('spot-count-detail-modal')">إغلاق</button>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary btn-sm" onclick="window.exportActiveSpotCountExcel()" style="color:#047857; font-weight:600;">📊 تصدير Excel</button>
          <button class="btn btn-primary btn-sm" onclick="window.printActiveSpotCount()">🖨️ طباعة التقرير</button>
        </div>
      </div></div>
    </div>

    <!-- 11. Revalue Modal -->
    <div class="modal-overlay" id="revalue-modal">
      <div class="modal modal-md"><div class="modal-header"><h3 class="modal-title">💰 إعادة تقييم المخزون وتسجيل فروق التكلفة</h3><button class="modal-close" onclick="closeModal('revalue-modal')">×</button></div>
      <div class="modal-body">
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>المخزن *</label><select id="rv-wh" class="input"></select></div>
          <div class="form-group"><label>الصنف المستهدف *</label><select id="rv-product" class="input font-bold" onchange="window.onRevalueProductChange(this.value)"></select></div>
        </div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>التكلفة الحالية بالدفاتر (ر.س)</label><input type="number" id="rv-old-cost" class="input mono font-bold" readonly placeholder="تلقائي" /></div>
          <div class="form-group"><label>التكلفة الجديدة المعتمدة (ر.س) *</label><input type="number" id="rv-new-cost" class="input mono font-bold" step="0.01" placeholder="0.00" /></div>
        </div>
        <div class="form-group mb-16"><label>تاريخ إعادة التقييم *</label><input type="date" id="rv-date" class="input" value="${w()}" /></div>
        <div class="form-group"><label>مبررات وسبب إعادة التقييم *</label><textarea id="rv-notes" class="input" rows="2" placeholder="تغيير سعر السوق، انخفاض القيمة الاستردادية، قرار مالي..."></textarea></div>
        <div id="rv-error" class="alert bad hidden" style="margin-top:12px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('revalue-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="window.saveRevalue()" id="save-rv-btn">💰 تطبيق إعادة التقييم وإنشاء قيد</button>
      </div></div>
    </div>
  `,await Promise.all([jt(),switchOpsSubModule($)])}async function jt(){const[e,t,o,s,a]=await Promise.all([J(I.products(),[q("sku")]),J(I.categories(),[q("name")]),J(I.warehouses(),[q("name")]),J(I.chartOfAccounts(),[q("code")]),J(I.suppliers(),[q("name")])]);k=e||[],ht=t||[];const n=new Set,i=new Set;E=(o||[]).filter(h=>{if(!h||!h.id||n.has(h.id)||(n.add(h.id),h.isActive===!1))return!1;const f=(h.name||"").replace(/\s+/g," ").trim();return!f||i.has(f)?!1:(i.add(f),h.name=f,!0)}),T=s||[],X=a||[];const d=(h,f)=>{const x=document.getElementById(h);x&&(x.innerHTML=f)},l=E.map(h=>`<option value="${h.id}">${h.name}</option>`).join(""),r='<option value="">اختر الصنف...</option>'+k.map(h=>`<option value="${h.id}" data-cost="${h.costPrice||0}">${h.sku} - ${h.name}</option>`).join(""),m='<option value="">اختر المورد...</option>'+X.map(h=>`<option value="${h.id}">${h.name}</option>`).join(""),c='<option value="">كل الفئات</option>'+ht.map(h=>`<option value="${h.id}">${h.name}</option>`).join(""),g=E.filter(h=>h.type==="Vehicle"||h.name&&h.name.includes("سيارة")).map(h=>`<option value="${h.id}">${h.name}</option>`).join("")||l;d("pr-wh",l),d("pr-supplier",'<option value="">طلب تسعير عام للموردين</option>'+m),d("pr-item-cat",c),d("pr-item-sel",r),d("po-wh",l),d("po-supplier",m),d("po-item-cat",c),d("po-item-sel",r),d("grpo-wh",l),d("qi-wh",l),d("qi-product",r),d("dsp-wh",l),d("dsp-item-sel",r),d("veh-src-wh",l),d("veh-dst-wh",g),d("veh-item-sel",r),d("vr-src-wh",g),d("vr-dst-wh",l),d("vr-item-sel",r),d("asm-wh",l),d("asm-product",r),d("asm-component-sel",r),d("adj-wh",l),d("sc-wh",l),d("sc-wh2",'<option value="">-- لا يوجد --</option>'+l),d("rv-wh",l),d("rv-product",r),St()}window.filterOpsProducts=(e,t)=>{const o=document.getElementById(e);if(!o)return;const s=t?k.filter(a=>a.category===t):k;if(o.innerHTML='<option value="">اختر الصنف...</option>'+s.map(a=>`<option value="${a.id}" data-cost="${a.costPrice||0}">${a.sku} - ${a.name}</option>`).join(""),e==="po-item-sel"){const a=document.getElementById("po-item-cost");a&&(a.value="0.00")}};window.onRevalueProductChange=e=>{const t=k.find(s=>s.id===e),o=document.getElementById("rv-old-cost");o&&(o.value=(t?.costPrice||0).toFixed(2))};window.switchOpsSubModule=async e=>{$=e;const t=document.getElementById("ops-submodule-select");t&&t.value!==e&&(t.value=e);const o=document.getElementById("ops-search-input");o&&(o.value="");const s=document.getElementById("ops-status-filter");s&&(s.value="");const a=document.getElementById("ops-content-area");if(a){a.innerHTML='<div class="page-loading"><div class="loading-spinner"></div><p style="margin-top:10px; color:var(--text-2); font-weight:600;">جارٍ تحميل السجلات...</p></div>';try{if(e==="request"){const n=R(I.purchaseRequests(),q("createdAt","desc"));b=(await Q(n)).docs.map(d=>({id:d.id,...d.data()})),yt(a,b)}else if(e==="po"){const n=R(I.purchaseOrders(),q("createdAt","desc"));b=(await Q(n)).docs.map(d=>({id:d.id,...d.data()})),ft(a,b)}else if(e==="grpo"){const n=R(I.goodsReceiptPOs(),q("createdAt","desc"));b=(await Q(n)).docs.map(d=>({id:d.id,...d.data()})),xt(a,b)}else if(e==="inspect"){const n=R(I.qualityInspections(),q("createdAt","desc"));b=(await Q(n)).docs.map(d=>({id:d.id,...d.data()})),wt(a,b)}else if(e==="assemble"){const n=R(I.productAssemblies(),q("createdAt","desc"));b=(await Q(n)).docs.map(d=>({id:d.id,...d.data()})),Bt(a,b)}else if(e==="adjust"){const n=R(I.inventoryAdjustments(),q("createdAt","desc"));b=(await Q(n)).docs.map(d=>({id:d.id,...d.data()})).filter(d=>!d.opType),Lt(a,b)}else if(e==="dispatch"){const n=R(I.inventoryAdjustments(),q("createdAt","desc"));b=(await Q(n)).docs.map(d=>({id:d.id,...d.data()})).filter(d=>d.opType==="dispatch"),It(a,b)}else if(e==="vehicle"){const n=R(I.inventoryAdjustments(),q("createdAt","desc"));b=(await Q(n)).docs.map(d=>({id:d.id,...d.data()})).filter(d=>d.opType==="vehicle-load"),kt(a,b)}else if(e==="vehicle-return"){const n=R(I.inventoryAdjustments(),q("createdAt","desc"));b=(await Q(n)).docs.map(d=>({id:d.id,...d.data()})).filter(d=>d.opType==="vehicle-return"),Et(a,b)}else if(e==="spot-count"){const n=R(I.inventoryAdjustments(),q("createdAt","desc"));b=(await Q(n)).docs.map(d=>({id:d.id,...d.data()})).filter(d=>d.opType==="spot-count"),Ct(a,b)}else if(e==="revalue"){const n=R(I.inventoryAdjustments(),q("createdAt","desc"));b=(await Q(n)).docs.map(d=>({id:d.id,...d.data()})).filter(d=>d.opType==="revalue"),Mt(a,b)}}catch(n){a.innerHTML=`<div class="alert bad" style="padding:20px; font-weight:700;">خطأ أثناء تحميل البيانات: ${n.message}</div>`}}};window.openOpsModal=async()=>{if($==="request")K=[],document.getElementById("pr-lines-tbody").innerHTML="",document.getElementById("pr-notes").value="",document.getElementById("pr-date").value=w(),openModal("pr-modal");else if($==="po"){F=[],document.getElementById("po-lines-tbody").innerHTML="",document.getElementById("po-notes").value="",document.getElementById("po-date").value=w();const e=document.getElementById("po-total-cost-label");e&&(e.textContent="0.00 ر.س"),openModal("po-modal")}else if($==="grpo"){const e=R(I.purchaseOrders(),q("createdAt","desc")),o=(await Q(e)).docs.map(a=>({id:a.id,...a.data()})).filter(a=>a.status==="ordered"),s=document.getElementById("grpo-po-select");s.innerHTML='<option value="">اختر أمر شراء للتحويل...</option>'+o.map(a=>`<option value="${a.id}">${a.poNumber||a.id} — ${a.supplierName}</option>`).join(""),document.getElementById("grpo-lines-tbody").innerHTML='<tr><td colspan="6" class="dim" style="text-align:center; padding:20px;">يرجى اختيار أمر شراء لاستيراد بنوده</td></tr>',document.getElementById("save-grpo-btn").disabled=!0,openModal("grpo-modal")}else if($==="inspect")document.getElementById("qi-batch").value="",document.getElementById("qi-temp").value="",document.getElementById("qi-notes").value="",document.getElementById("qi-date").value=w(),openModal("qi-modal");else if($==="dispatch")G=[],$t(),document.getElementById("dsp-notes").value="",document.getElementById("dsp-date").value=w(),openModal("dispatch-modal");else if($==="vehicle"){Y=[];const e=document.getElementById("veh-lines-tbody");e&&(e.innerHTML=""),document.getElementById("veh-notes").value="",document.getElementById("veh-date").value=w(),openModal("vehicle-modal")}else if($==="vehicle-return"){tt=[];const e=document.getElementById("vr-lines-tbody");e&&(e.innerHTML=""),document.getElementById("vr-notes").value="",document.getElementById("vr-date").value=w(),openModal("vehicle-return-modal")}else if($==="assemble")W=[],document.getElementById("asm-lines-tbody").innerHTML="",document.getElementById("asm-qty").value="1",document.getElementById("asm-date").value=w(),openModal("asm-modal");else if($==="adjust")window._editingAdjId=null,window._adjLines=[],document.getElementById("adj-notes").value="",document.getElementById("adj-date").value=w(),document.getElementById("adj-modal-title").textContent="⚖️ تسوية وصرف وإهلاك مخزني",lt(),openModal("adj-modal");else if($==="spot-count"){window.spotCountLines=[];const e=document.getElementById("sc-search-input");e&&(e.value="");const t=document.getElementById("sc-filter-mode");t&&(t.value="all");const o=document.getElementById("sc-count-badge");o&&(o.textContent="");const s=document.getElementById("sc-table-thead");s&&(s.innerHTML="<tr><th>الصنف</th><th>الكمية الدفترية</th><th>الكمية الفعلية</th><th>الفرق</th></tr>");const a=document.getElementById("sc-lines-tbody");a&&(a.innerHTML='<tr><td colspan="7" style="text-align:center;padding:25px;color:var(--text-2);">اختر المخزن واضغط "تحميل أصناف المخزن" لجلب الأرصدة الفعلية للمطابقة</td></tr>'),document.getElementById("save-sc-btn").disabled=!0,document.getElementById("sc-date").value=w(),openModal("spot-count-modal")}else if($==="revalue"){document.getElementById("rv-notes").value="",document.getElementById("rv-new-cost").value="",document.getElementById("rv-date").value=w();const e=document.getElementById("rv-product");e&&e.value&&window.onRevalueProductChange(e.value),openModal("revalue-modal")}};window.filterActiveOpsTable=()=>{const e=document.getElementById("ops-search-input"),t=document.getElementById("ops-status-filter"),o=(e?.value||"").trim().toLowerCase(),s=(t?.value||"").trim().toLowerCase(),a=document.getElementById("ops-content-area");if(!a||!b)return;const n=b.filter(i=>s&&!(i.status||i.type||"").toLowerCase().includes(s)?!1:o?JSON.stringify(i).toLowerCase().includes(o):!0);$==="request"?yt(a,n):$==="po"?ft(a,n):$==="grpo"?xt(a,n):$==="inspect"?wt(a,n):$==="assemble"?Bt(a,n):$==="adjust"?Lt(a,n):$==="dispatch"?It(a,n):$==="vehicle"?kt(a,n):$==="vehicle-return"?Et(a,n):$==="spot-count"?Ct(a,n):$==="revalue"&&Mt(a,n)};window.exportActiveOpsSubModuleExcel=async()=>{if(!b||b.length===0){showToast("لا توجد بيانات متاحة للتصدير","warning");return}try{let e="سجلات العمليات المخزنية",t=[],o=[];$==="request"?(e="سجل طلبات الشراء وعروض الأسعار",t=["رقم الطلب","التاريخ","المستودع","المورد / المشروع","عدد الأصناف","الحالة","البيان"],o=b.map(s=>[s.rfqNumber||s.number||s.id,s.date||s.requestDate||"",s.warehouseName||"",s.supplierName||s.projectName||"طلب عام",(s.items||[]).length,s.status||"draft",s.notes||""])):$==="po"?(e="سجل أوامر الشراء الرسمية",t=["رقم أمر الشراء","التاريخ","المورد","المستودع","عدد الأصناف","الإجمالي المالي (ر.س)","الحالة","الملاحظات"],o=b.map(s=>{const a=(s.items||[]).reduce((n,i)=>n+i.qty*i.unitPrice,0);return[s.poNumber||s.id,s.date||"",s.supplierName||"",s.warehouseName||"",(s.items||[]).length,a.toFixed(2),s.status||"",s.notes||""]})):$==="grpo"?(e="سجل أذونات استلام البضاعة",t=["رقم الإذن","التاريخ","أمر الشراء","المورد","المستودع","قيمة الاستلام","الحالة"],o=b.map(s=>[s.grpoNumber||s.id,s.date||"",s.poNumber||"",s.supplierName||"",s.warehouseName||"",(s.totalValue||0).toFixed(2),s.status||""])):$==="inspect"?(e="سجل محاضر فحص الجودة ومطابقة الأغذية",t=["رقم الفحص","التاريخ","الصنف","التشغيلة","درجة الحرارة","المستودع","النتيجة","ملاحظات الفحص"],o=b.map(s=>[s.inspectionNumber||s.id,s.date||"",s.productName||"",s.batchNumber||"",s.temperature||"",s.warehouseName||"",s.status==="passed"?"مطابق ومقبول":s.status==="failed"?"مرفوض للتلف":"مقبول مشروط",s.notes||""])):$==="adjust"?(e="سجل تسويات المخزون وإعدام التوالف",t=["التاريخ","نوع المعاملة","المستودع","عدد الأصناف","إجمالي التكلفة","البيان"],o=b.map(s=>[s.date||"",s.type||"",s.warehouseName||"",(s.lines||[]).length,(s.totalCost||0).toFixed(2),s.notes||""])):(e=`سجل عمليات ${$}`,t=["المعرف","التاريخ","المستودع","البيان"],o=b.map(s=>[s.id,s.date||"",s.warehouseName||"",s.notes||""])),await gt({title:e,headers:t,rows:o,user:"مستخدم النظام"}),showToast("تم تصدير الجدول إلى Excel بنجاح","success")}catch(e){showToast(`فشل التصدير: ${e.message}`,"error")}};window.exportOpsToCSV=window.exportActiveOpsSubModuleExcel;window.printActiveOpsTable=()=>{const e=document.getElementById("ops-content-area");if(!e)return;const t=document.getElementById("ops-submodule-select"),o=t?.options[t.selectedIndex]?.text||"العمليات المخزنية",s=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${o}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; direction: rtl; padding: 20px; font-size: 11px; color: #1e293b; }
    .hdr { border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 12px; display:flex; justify-content:space-between; align-items:center; }
    .hdr h2 { margin:0; color:#1e3a8a; font-size:16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10.5px; }
    th { background: #f1f5f9; padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; }
    td { padding: 6px 8px; border: 1px solid #e2e8f0; text-align: right; }
    .no-print { display: none !important; }
    .badge { font-weight: bold; }
    @media print { @page { size: landscape; margin: 10mm; } }
  </style>
</head>
<body>
  <div class="hdr">
    <div>
      <h2>${o}</h2>
      <p style="margin:2px 0; color:#64748b; font-size:10px;">مؤسسة ادهام للمواد الغذائية — إدارة المستودعات وسلاسل الإمداد</p>
    </div>
    <div style="font-size:10px; color:#64748b;">
      تاريخ الطباعة: ${new Date().toLocaleString("ar-SA")}
    </div>
  </div>
  ${e.innerHTML}
  <script>window.print();<\/script>
</body>
</html>`;window.printOpsDocument(s,o)};window.addPRItem=()=>{const e=document.getElementById("pr-item-sel"),t=parseFloat(document.getElementById("pr-item-qty").value)||0;if(!e.value||t<=0){showToast("يرجى اختيار صنف وتحديد كمية صحيحة","warning");return}const o=k.find(s=>s.id===e.value);if(K.some(s=>s.productId===e.value)){showToast("هذا الصنف مضاف بالفعل للطلب","warning");return}K.push({productId:e.value,name:o?.name||"صنف",productName:o?.name||"صنف",sku:o?.sku||"",unit:o?.unit||"حبة",qty:t,unitPrice:o?.costPrice||0}),ct(),e.value="",document.getElementById("pr-item-qty").value="1"};window.addFreePRItem=()=>{const e=document.getElementById("pr-free-name"),t=document.getElementById("pr-free-qty"),o=e?e.value.trim():"",s=parseFloat(t?t.value:"1")||1;if(!o){showToast("يرجى كتابة اسم الصنف اليدوي أولاً","warning");return}K.push({productId:`custom_${Date.now()}`,name:o,productName:o,sku:"حر",unit:"بند",qty:s,unitPrice:0,isCustom:!0}),e.value="",t&&(t.value="1"),ct(),showToast("تمت إضافة البند الحر بنجاح","success")};function ct(){const e=document.getElementById("pr-lines-tbody");e&&(e.innerHTML=K.map((t,o)=>`
    <tr>
      <td>${o+1}</td>
      <td class="mono font-bold text-dim">${t.sku||"—"}</td>
      <td>
        ${t.isCustom?'<span class="badge" style="background:#dcfce7; color:#166534; font-size:10px; margin-left:6px; padding:1px 5px; border-radius:4px; border:1px solid #86efac;">بند حر ✍️</span>':""}
        <strong>${t.name||t.productName}</strong>
      </td>
      <td class="mono font-bold text-primary" style="font-size:13px;">${u(t.qty)} ${t.unit||""}</td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="window.removePRItem(${o})">✕</button></td>
    </tr>
  `).join(""))}window.removePRItem=e=>{K.splice(e,1),ct()};window.savePurchaseRequest=async()=>{const e=document.getElementById("pr-error");if(e.classList.add("hidden"),!K.length){e.textContent="يرجى إضافة صنف واحد على الأقل للطلب",e.classList.remove("hidden");return}const t=document.getElementById("save-pr-btn");t.disabled=!0;try{const o=document.getElementById("pr-wh").value,s=E.find(l=>l.id===o),a=document.getElementById("pr-supplier").value,n=X.find(l=>l.id===a),i=document.getElementById("pr-date").value||w(),d=`PR-${i.replace(/-/g,"")}-${Math.floor(1e3+Math.random()*9e3)}`;await _(I.purchaseRequests(),{number:d,rfqNumber:d,date:i,warehouseId:o,warehouseName:s?.name||"المستودع الرئيسي",supplierId:a||"general",supplierName:n?.name||"طلب تسعير عام للموردين",items:K,notes:document.getElementById("pr-notes").value.trim(),status:"pending_approval",createdAt:new Date().toISOString()}),showToast("تم حفظ وتقديم طلب الشراء للاعتماد بنجاح","success"),closeModal("pr-modal"),switchOpsSubModule("request")}catch(o){e.textContent=o.message,e.classList.remove("hidden")}finally{t.disabled=!1}};function z(e){if(!e)return"صنف غير محدد";if(e.productName&&e.productName!=="undefined")return e.productName;if(e.name&&e.name!=="undefined")return e.name;if(e.productId){const t=k.find(o=>o.id===e.productId);if(t&&t.name)return t.name}return e.sku||"صنف غير محدد"}function yt(e,t){if(t.length===0){e.innerHTML=`
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">📋</div>
        <div style="font-size:16px; font-weight:700;">لا توجد طلبات شراء مسجلة</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لإنشاء طلب احتياج مخزني أو تسعير</p>
      </div>`;return}e.innerHTML=`
    <div class="card" style="border:1px solid var(--border-soft); border-radius:10px; overflow:hidden;">
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr>
              <th>رقم الطلب / RFQ</th>
              <th>تاريخ الطلب</th>
              <th>المستودع / المشروع</th>
              <th>المورد المستهدف</th>
              <th>الأصناف المطلوبة</th>
              <th>الحالة</th>
              <th class="no-print" style="text-align:center;">إجراءات تشغيلية</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(o=>{const s=o.rfqNumber||o.number||o.requestNo||`PR-${o.id.slice(0,6)}`,a=o.date||o.requestDate||(o.createdAt?o.createdAt.slice(0,10):"—"),n=o.warehouseName||o.warehouseId&&E.find(m=>m.id===o.warehouseId)?.name||"المستودع الرئيسي",i=o.supplierName||o.supplierId&&X.find(m=>m.id===o.supplierId)?.name||o.project||"طلب عام",d=o.items||o.lines||[];let l="—";if(d.length>0){const m=d.slice(0,2).map(c=>`${z(c)} (${u(c.qty)})`).join("، ");l=d.length>2?`${m} <span class="badge font-bold" style="background:#e0e7ff; color:#3730a3; font-size:10.5px;">+${d.length-2} أصناف أخرى</span>`:m}let r="";return o.status==="approved"?r='<span class="badge good font-bold">✅ معتمد</span>':o.status==="rejected"?r='<span class="badge bad font-bold">❌ مرفوض</span>':o.status==="ordered"||o.status==="converted"?r='<span class="badge font-bold" style="background:#e0e7ff; color:#3730a3;">📜 محول لأمر شراء</span>':o.status==="sent"?r='<span class="badge info font-bold">📤 مرسل للموردين</span>':o.status==="draft"?r='<span class="badge font-bold" style="background:#f1f5f9; color:#475569;">📝 مسودة</span>':r='<span class="badge warn font-bold">⏳ قيد الاعتماد</span>',`
                <tr>
                  <td class="mono font-bold text-primary">${s}</td>
                  <td>${a}</td>
                  <td><strong>${n}</strong></td>
                  <td>${i}</td>
                  <td style="max-width:320px;">${l}</td>
                  <td>${r}</td>
                  <td class="no-print" style="text-align:center; white-space:nowrap;">
                    <button class="btn btn-sm btn-ghost text-primary" onclick="window.showPRDetail('${o.id}')" title="معاينة تفاصيل الطلب">👁️ معاينة</button>
                    <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printPRDetail('${o.id}')" title="طباعة طلب الشراء كـ PDF">🖨️ طباعة</button>
                    <button class="btn btn-sm btn-ghost text-good" onclick="window.convertPRToPO('${o.id}')" title="تحويل الطلب فوراً لأمر شراء مالي">📜 تحويل لـ PO</button>
                    ${o.status==="pending_approval"||o.status==="draft"?`
                      <button class="btn btn-sm btn-ghost text-good" onclick="window.approvePR('${o.id}', 'approved')" title="اعتماد الطلب">✔️ اعتماد</button>
                      <button class="btn btn-sm btn-ghost text-bad" onclick="window.approvePR('${o.id}', 'rejected')" title="رفض الطلب">❌ رفض</button>
                    `:""}
                    <button class="btn btn-sm btn-ghost text-bad" onclick="window.deletePR('${o.id}')" title="حذف السجل">🗑️</button>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.showPRDetail=async e=>{const t=b.find(l=>l.id===e)||(await j(M(L,`companies/${C}/purchaseRequests`,e))).data();if(!t){showToast("طلب الشراء غير موجود","error");return}({...t});const o=t.rfqNumber||t.number||t.requestNo||`PR-${e.slice(0,6)}`;document.getElementById("pr-detail-title").textContent=`📋 طلب شراء رقم: ${o}`;const s=t.items||t.lines||[],a=t.warehouseName||t.warehouseId&&E.find(l=>l.id===t.warehouseId)?.name||"المستودع الرئيسي",n=t.supplierName||t.supplierId&&X.find(l=>l.id===t.supplierId)?.name||"طلب تسعير عام",i=document.getElementById("pr-detail-body");i.innerHTML=`
    <div class="grid-3 gap-12 mb-16" style="background:var(--bg-2); padding:12px 16px; border-radius:8px; border:1px solid var(--border-soft);">
      <div><span class="dim" style="font-size:11px;">تاريخ الطلب:</span> <strong class="mono">${t.date||t.requestDate||"—"}</strong></div>
      <div><span class="dim" style="font-size:11px;">المستودع المطلوب:</span> <strong>${a}</strong></div>
      <div><span class="dim" style="font-size:11px;">المورد المقترح:</span> <strong>${n}</strong></div>
      <div><span class="dim" style="font-size:11px;">الحالة:</span> <strong>${t.status||"draft"}</strong></div>
      <div style="grid-column:span 2;"><span class="dim" style="font-size:11px;">البيان / الملاحظات:</span> <strong>${t.notes||"—"}</strong></div>
    </div>

    <h4 style="margin:0 0 10px 0; font-size:13px; font-weight:700;">قائمة الأصناف المطلوبة (${s.length} أصناف):</h4>
    <div class="table-container mb-16" style="border:1px solid var(--border-soft); border-radius:8px;">
      <table class="data-dense" style="width:100%;">
        <thead>
          <tr>
            <th>#</th>
            <th>رمز الصنف (SKU)</th>
            <th>اسم الصنف</th>
            <th>الوحدة</th>
            <th style="text-align:center;">الكمية المطلوبة</th>
            <th style="text-align:left;">السعر التقديري</th>
            <th style="text-align:left;">الإجمالي التقديري</th>
            <th>ملاحظات الصنف</th>
          </tr>
        </thead>
        <tbody>
          ${s.map((l,r)=>{const m=z(l),c=parseFloat(l.offeredPrice||l.unitPrice||0),g=parseFloat(l.qty||0)*c;return`
              <tr>
                <td>${r+1}</td>
                <td class="mono font-bold text-dim">${l.sku||"—"}</td>
                <td><strong>${m}</strong></td>
                <td>${l.unit||"حبة"}</td>
                <td class="mono font-bold text-primary" style="text-align:center; font-size:13px;">${u(l.qty)}</td>
                <td class="mono" style="text-align:left;">${c>0?v(c):"—"}</td>
                <td class="mono font-bold" style="text-align:left;">${g>0?v(g):"—"}</td>
                <td style="font-size:11px; color:var(--text-2);">${l.notes||"—"}</td>
              </tr>
            `}).join("")}
        </tbody>
      </table>
    </div>
  `;const d=document.getElementById("pr-detail-actions");d.innerHTML=`
    <button class="btn btn-secondary" onclick="window.printPRDetail('${e}')">🖨️ طباعة PDF رسمية</button>
    <button class="btn btn-primary" onclick="closeModal('pr-detail-modal'); window.convertPRToPO('${e}')">📜 تحويل لأمر شراء (PO)</button>
  `,openModal("pr-detail-modal")};window.printPRDetail=async e=>{const t=b.find(g=>g.id===e)||(await j(M(L,`companies/${C}/purchaseRequests`,e))).data();if(!t){showToast("طلب الشراء غير موجود للطباعة","error");return}const o=t.rfqNumber||t.number||t.requestNo||`PR-${e.slice(0,6)}`,s=t.date||t.requestDate||(t.createdAt?t.createdAt.slice(0,10):"—"),a=t.warehouseName||t.warehouseId&&E.find(g=>g.id===t.warehouseId)?.name||"المستودع الرئيسي",n=t.supplierName||t.supplierId&&X.find(g=>g.id===t.supplierId)?.name||"طلب تسعير عام للموردين",i=t.items||t.lines||[];let d=0;i.forEach(g=>{const h=parseFloat(g.offeredPrice||g.unitPrice||0);d+=parseFloat(g.qty||0)*h});const l=`
    <div class="meta-item"><div class="meta-label">رقم الطلب / RFQ:</div><div class="meta-val mono font-bold">${o}</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ الطلب:</div><div class="meta-val mono">${s}</div></div>
    <div class="meta-item"><div class="meta-label">مستودع الوجهة:</div><div class="meta-val">${a}</div></div>
    <div class="meta-item"><div class="meta-label">المورد المقترح:</div><div class="meta-val">${n}</div></div>
    <div class="meta-item"><div class="meta-label">حالة الطلب:</div><div class="meta-val">${t.status==="approved"?"معتمد":t.status==="ordered"?"أمر شراء":"قيد الدراسة والاعتماد"}</div></div>
  `,r=`
    <table class="data-table">
      <thead>
        <tr>
          <th style="width:30px;">#</th>
          <th style="width:90px;">الرمز (SKU)</th>
          <th>اسم الصنف والوصف الفني</th>
          <th style="width:70px;">الوحدة</th>
          <th style="width:90px; text-align:center;">الكمية المطلوبة</th>
          <th style="width:110px; text-align:left;">السعر التقديري</th>
          <th style="width:110px; text-align:left;">الإجمالي التقديري</th>
          <th>ملاحظات / أفضل مورد</th>
        </tr>
      </thead>
      <tbody>
        ${i.map((g,h)=>{const f=z(g),x=parseFloat(g.offeredPrice||g.unitPrice||0),p=parseFloat(g.qty||0)*x;return`
            <tr>
              <td style="text-align:center;">${h+1}</td>
              <td class="mono font-bold" style="text-align:center;">${g.sku||"—"}</td>
              <td><strong>${f}</strong></td>
              <td style="text-align:center;">${g.unit||"حبة"}</td>
              <td class="mono font-bold" style="text-align:center; font-size:12px;">${u(g.qty)}</td>
              <td class="mono" style="text-align:left;">${x>0?v(x):"—"}</td>
              <td class="mono font-bold" style="text-align:left;">${p>0?v(p):"—"}</td>
              <td style="font-size:10.5px; color:#64748b;">${g.notes||"—"}</td>
            </tr>
          `}).join("")}
      </tbody>
      ${d>0?`
        <tfoot>
          <tr>
            <td colspan="6" style="text-align:right;">إجمالي التكلفة التقديرية للطلب:</td>
            <td class="mono font-bold" style="text-align:left;">${v(d)}</td>
            <td></td>
          </tr>
        </tfoot>
      `:""}
    </table>
  `,c=V({title:`طلب شراء واحتياج مخزني #${o}`,docBadge:`<span class="doc-badge ${t.status==="approved"?"good":"warn"}">${t.status==="approved"?"طلب معتمد رسمياً":"طلب شراء واحتياج"}</span>`,metaHtml:l,contentHtml:r,signaturesHtml:`
    <div class="sig-box">
      <div class="sig-role">مسؤول الطلب / أمين المستودع</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">مدير المشتريات وسلاسل الإمداد</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">الاعتماد المالي / الإدارة العامة</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
  `,footerNotes:t.notes||"يخضع أمر الشراء لموافقة الإدارة المالية وتأكيد شروط التوريد ومطابقة المواصفات القياسية."});window.printOpsDocument(c,`PR-${o}`)};window.convertPRToPO=async e=>{const t=b.find(i=>i.id===e)||(await j(M(L,`companies/${C}/purchaseRequests`,e))).data();if(!t){showToast("تعذر العثور على طلب الشراء للتحويل","error");return}F=[],(t.items||t.lines||[]).forEach(i=>{const d=k.find(m=>m.id===i.productId)||{},l=parseFloat(i.offeredPrice||i.unitPrice||d.costPrice||0),r=parseFloat(i.qty||1);F.push({productId:i.productId||d.id||"",name:z(i),sku:i.sku||d.sku||"",qty:r,unitPrice:l})});const s=document.getElementById("po-supplier");s&&t.supplierId&&t.supplierId!=="general"&&(s.value=t.supplierId);const a=document.getElementById("po-wh");a&&t.warehouseId&&(a.value=t.warehouseId);const n=document.getElementById("po-notes");n&&(n.value=`تم الإصدار بناءً على طلب الشراء رقم #${t.rfqNumber||t.number||e.slice(0,8)}`),pt(),openModal("po-modal"),showToast(`تم استيراد ${F.length} صنف من طلب الشراء بنجاح إلى أمر الشراء`,"info")};window.approvePR=async(e,t)=>{if(confirm(`هل أنت متأكد من ${t==="approved"?"اعتماد وموافقة على":"رفض"} طلب الشراء هذا؟`))try{await nt("purchaseRequests",e,{status:t}),showToast(`تم تحديث حالة طلب الشراء إلى (${t==="approved"?"معتمد":"مرفوض"})`,"success"),switchOpsSubModule("request")}catch(s){showToast(s.message,"error")}};window.deletePR=async e=>{if(confirm("هل أنت متأكد من حذف طلب الشراء هذا نهائياً؟"))try{await dt(M(L,`companies/${C}/purchaseRequests`,e)),showToast("تم حذف طلب الشراء بنجاح","success"),switchOpsSubModule("request")}catch(t){showToast(t.message,"error")}};window.onPOSelItemChange=e=>{const t=k.find(a=>a.id===e),o=parseFloat(t?.costPrice||0),s=document.getElementById("po-item-cost");s&&(s.value=o.toFixed(2))};window.addPOItem=()=>{const e=document.getElementById("po-item-sel"),t=parseFloat(document.getElementById("po-item-qty").value)||0,o=parseFloat(document.getElementById("po-item-cost").value)||0;if(!e.value||t<=0||o<0){showToast("يرجى اختيار صنف وتحديد كمية وسعر صحيحين","warning");return}const s=k.find(a=>a.id===e.value);if(F.some(a=>a.productId===e.value)){showToast("هذا الصنف مضاف بالفعل للأمر","warning");return}F.push({productId:e.value,name:s?.name||"صنف",sku:s?.sku||"",qty:t,unitPrice:o}),pt(),e.value="",document.getElementById("po-item-cost").value="0.00",document.getElementById("po-item-qty").value="1"};function pt(){const e=document.getElementById("po-lines-tbody");if(!e)return;let t=0;e.innerHTML=F.map((s,a)=>{const n=s.qty*s.unitPrice;return t+=n,`
      <tr>
        <td class="mono font-bold text-dim">${s.sku||"—"}</td>
        <td><strong>${s.name}</strong></td>
        <td class="mono font-bold text-primary">${u(s.qty)}</td>
        <td class="mono">${v(s.unitPrice)}</td>
        <td class="mono font-bold">${v(n)}</td>
        <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="window.removePOItem(${a})">✕</button></td>
      </tr>
    `}).join("");const o=document.getElementById("po-total-cost-label");o&&(o.textContent=v(t))}window.removePOItem=e=>{F.splice(e,1),pt()};window.savePurchaseOrder=async()=>{const e=document.getElementById("po-error");e.classList.add("hidden");const t=document.getElementById("po-supplier").value,o=document.getElementById("po-wh").value;if(!t||!o||!F.length){e.textContent="يرجى اختيار المورد والمستودع وإضافة صنف واحد على الأقل",e.classList.remove("hidden");return}const s=document.getElementById("save-po-btn");s.disabled=!0;try{const a=document.getElementById("po-date").value||w(),n=`PO-${a.replace(/-/g,"")}-${Math.floor(1e3+Math.random()*9e3)}`,i=X.find(r=>r.id===t),d=E.find(r=>r.id===o),l=F.reduce((r,m)=>r+m.qty*m.unitPrice,0);await _(I.purchaseOrders(),{poNumber:n,number:n,date:a,supplierId:t,supplierName:i?.name||"مورد غير محدد",warehouseId:o,warehouseName:d?.name||"المستودع الرئيسي",items:F,totalValue:l,notes:document.getElementById("po-notes").value.trim(),status:"ordered",createdAt:new Date().toISOString()}),showToast("تم إصدار أمر الشراء بنجاح","success"),closeModal("po-modal"),switchOpsSubModule("po")}catch(a){e.textContent=a.message,e.classList.remove("hidden")}finally{s.disabled=!1}};function ft(e,t){if(t.length===0){e.innerHTML=`
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">📜</div>
        <div style="font-size:16px; font-weight:700;">لا توجد أوامر شراء مسجلة</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لإصدار أمر شراء مالي معتمد للمورد</p>
      </div>`;return}e.innerHTML=`
    <div class="card" style="border:1px solid var(--border-soft); border-radius:10px; overflow:hidden;">
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr>
              <th>رقم أمر الشراء</th>
              <th>تاريخ الأمر</th>
              <th>المورد المستهدف</th>
              <th>المستودع المستلم</th>
              <th>عدد الأصناف</th>
              <th>إجمالي القيمة المالية</th>
              <th>الحالة</th>
              <th class="no-print" style="text-align:center;">إجراءات تشغيلية</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(o=>{const s=(o.items||[]).reduce((n,i)=>n+i.qty*i.unitPrice,0);let a="";return o.status==="received"?a='<span class="badge good font-bold">📦 مستلم بالكامل</span>':o.status==="cancelled"?a='<span class="badge bad font-bold">❌ ملغي</span>':a='<span class="badge warn font-bold">⏳ مفتوح / قيد التوريد</span>',`
                <tr>
                  <td class="mono font-bold text-primary">${o.poNumber||o.number||o.id}</td>
                  <td>${o.date}</td>
                  <td><strong>${o.supplierName}</strong></td>
                  <td>${o.warehouseName}</td>
                  <td class="mono font-bold" style="text-align:center;">${(o.items||[]).length}</td>
                  <td class="mono font-bold text-indigo" style="font-size:13px;">${v(s)}</td>
                  <td>${a}</td>
                  <td class="no-print" style="text-align:center; white-space:nowrap;">
                    <button class="btn btn-sm btn-ghost text-primary" onclick="window.showPODetail('${o.id}')" title="معاينة تفاصيل أمر الشراء">👁️ معاينة</button>
                    <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printPODetail('${o.id}')" title="طباعة أمر الشراء المالي">🖨️ طباعة</button>
                    ${o.status==="ordered"?`
                      <button class="btn btn-sm btn-ghost text-good font-bold" onclick="window.convertPOToGRPO('${o.id}')" title="تحويل فوراً إلى إذن استلام بضاعة مخزني">📦 استلام بضاعة</button>
                      <button class="btn btn-sm btn-ghost text-bad" onclick="window.cancelPO('${o.id}')" title="إلغاء أمر الشراء">❌ إلغاء</button>
                    `:""}
                    <button class="btn btn-sm btn-ghost text-bad" onclick="window.deletePO('${o.id}')" title="حذف السجل">🗑️</button>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.showPODetail=async e=>{const t=b.find(i=>i.id===e)||(await j(M(L,`companies/${C}/purchaseOrders`,e))).data();if(!t){showToast("أمر الشراء غير موجود","error");return}({...t},document.getElementById("po-detail-title").textContent=`📜 أمر شراء رقم: ${t.poNumber||e}`);const o=t.items||[],s=o.reduce((i,d)=>i+d.qty*d.unitPrice,0),a=document.getElementById("po-detail-body");a.innerHTML=`
    <div class="grid-3 gap-12 mb-16" style="background:var(--bg-2); padding:12px 16px; border-radius:8px; border:1px solid var(--border-soft);">
      <div><span class="dim" style="font-size:11px;">رقم الأمر:</span> <strong class="mono font-bold text-primary">${t.poNumber||e}</strong></div>
      <div><span class="dim" style="font-size:11px;">تاريخ الأمر:</span> <strong class="mono">${t.date}</strong></div>
      <div><span class="dim" style="font-size:11px;">المورد:</span> <strong>${t.supplierName}</strong></div>
      <div><span class="dim" style="font-size:11px;">المستودع المستلم:</span> <strong>${t.warehouseName}</strong></div>
      <div><span class="dim" style="font-size:11px;">الحالة:</span> <strong>${t.status||"ordered"}</strong></div>
      <div><span class="dim" style="font-size:11px;">الإجمالي المالي:</span> <strong class="mono font-bold text-good">${v(s)}</strong></div>
      <div style="grid-column:span 3;"><span class="dim" style="font-size:11px;">شروط وملاحظات:</span> <strong>${t.notes||"—"}</strong></div>
    </div>

    <h4 style="margin:0 0 10px 0; font-size:13px; font-weight:700;">قائمة الأصناف المطلوبة (${o.length} أصناف):</h4>
    <div class="table-container mb-16" style="border:1px solid var(--border-soft); border-radius:8px;">
      <table class="data-dense" style="width:100%;">
        <thead>
          <tr>
            <th>#</th>
            <th>رمز الصنف (SKU)</th>
            <th>اسم الصنف</th>
            <th style="text-align:center;">الكمية</th>
            <th style="text-align:left;">سعر الوحدة</th>
            <th style="text-align:left;">إجمالي السطر</th>
          </tr>
        </thead>
        <tbody>
          ${o.map((i,d)=>`
            <tr>
              <td>${d+1}</td>
              <td class="mono font-bold text-dim">${i.sku||"—"}</td>
              <td><strong>${i.name}</strong></td>
              <td class="mono font-bold text-primary" style="text-align:center; font-size:13px;">${u(i.qty)}</td>
              <td class="mono" style="text-align:left;">${v(i.unitPrice)}</td>
              <td class="mono font-bold" style="text-align:left;">${v(i.qty*i.unitPrice)}</td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr style="font-weight:bold; background:var(--bg-hover);">
            <td colspan="5" style="text-align:right;">الإجمالي الكلي:</td>
            <td class="mono font-bold text-good" style="text-align:left; font-size:14px;">${v(s)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;const n=document.getElementById("po-detail-actions");n.innerHTML=`
    <button class="btn btn-secondary" onclick="window.printPODetail('${e}')">🖨️ طباعة أمر الشراء</button>
    ${t.status==="ordered"?`
      <button class="btn btn-primary" onclick="closeModal('po-detail-modal'); window.convertPOToGRPO('${e}')">📦 استلام البضاعة (GRPO)</button>
    `:""}
  `,openModal("po-detail-modal")};window.printPODetail=async e=>{const t=b.find(l=>l.id===e)||(await j(M(L,`companies/${C}/purchaseOrders`,e))).data();if(!t){showToast("أمر الشراء غير موجود للطباعة","error");return}const o=t.items||[],s=o.reduce((l,r)=>l+r.qty*r.unitPrice,0),a=`
    <div class="meta-item"><div class="meta-label">رقم أمر الشراء:</div><div class="meta-val mono font-bold text-primary">${t.poNumber||e}</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ الأمر:</div><div class="meta-val mono">${t.date}</div></div>
    <div class="meta-item"><div class="meta-label">المورد المعتمد:</div><div class="meta-val">${t.supplierName}</div></div>
    <div class="meta-item"><div class="meta-label">مستودع الاستلام:</div><div class="meta-val">${t.warehouseName}</div></div>
    <div class="meta-item"><div class="meta-label">إجمالي القيمة:</div><div class="meta-val mono font-bold">${v(s)}</div></div>
    <div class="meta-item"><div class="meta-label">الحالة:</div><div class="meta-val">${t.status==="received"?"مستلم بالكامل":"أمر شراء ملزم"}</div></div>
  `,n=`
    <table class="data-table">
      <thead>
        <tr>
          <th style="width:30px;">#</th>
          <th style="width:90px;">الرمز (SKU)</th>
          <th>اسم الصنف والمواصفات</th>
          <th style="width:90px; text-align:center;">الكمية المتفق عليها</th>
          <th style="width:110px; text-align:left;">سعر الوحدة (ر.س)</th>
          <th style="width:120px; text-align:left;">إجمالي القيمة (ر.س)</th>
        </tr>
      </thead>
      <tbody>
        ${o.map((l,r)=>`
          <tr>
            <td style="text-align:center;">${r+1}</td>
            <td class="mono font-bold" style="text-align:center;">${l.sku||"—"}</td>
            <td><strong>${l.name}</strong></td>
            <td class="mono font-bold" style="text-align:center; font-size:12px;">${u(l.qty)}</td>
            <td class="mono" style="text-align:left;">${v(l.unitPrice)}</td>
            <td class="mono font-bold" style="text-align:left;">${v(l.qty*l.unitPrice)}</td>
          </tr>
        `).join("")}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" style="text-align:right;">الإجمالي المالي العام لأمر الشراء:</td>
          <td class="mono font-bold" style="text-align:left; font-size:13px;">${v(s)}</td>
        </tr>
      </tfoot>
    </table>
  `,d=V({title:`أمر شراء مالي ملزم #${t.poNumber||e}`,docBadge:'<span class="doc-badge good">أمر توريد مالي رسمي</span>',metaHtml:a,contentHtml:n,signaturesHtml:`
    <div class="sig-box">
      <div class="sig-role">إدارة المشتريات والتعاقدات</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">المدير المالي / المشرف العام</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">إقرار وقبول المورد</div>
      <div class="sig-name">الختم والتوقيع: .......................................</div>
    </div>
  `,footerNotes:t.notes||"يلتزم المورد بتسليم الأصناف الموضحة أعلاه مطابقة للمواصفات الغذائية وتواريخ الصلاحية المتفق عليها."});window.printOpsDocument(d,`PO-${t.poNumber||e}`)};window.convertPOToGRPO=async e=>{$="grpo";const t=document.getElementById("ops-submodule-select");t&&(t.value="grpo"),await window.openOpsModal();const o=document.getElementById("grpo-po-select");o&&(o.value=e,await window.loadPOToGRPO(e))};window.cancelPO=async e=>{if(confirm("هل تريد إلغاء أمر الشراء هذا؟"))try{await nt("purchaseOrders",e,{status:"cancelled"}),showToast("تم إلغاء أمر الشراء","success"),switchOpsSubModule("po")}catch(t){showToast(t.message,"error")}};window.deletePO=async e=>{if(confirm("هل أنت متأكد من حذف أمر الشراء نهائياً؟"))try{await dt(M(L,`companies/${C}/purchaseOrders`,e)),showToast("تم حذف أمر الشراء","success"),switchOpsSubModule("po")}catch(t){showToast(t.message,"error")}};window.updateGrpoAltQty=(e,t)=>{const o=document.querySelector(`#grpo-lines-tbody tr[data-idx="${e}"]`);if(!o)return;const s=o.querySelector(".grpo-qty-alt"),a=o.querySelector(".grpo-qty");if(!s||!a)return;const n=parseFloat(s.value)||0;a.value=(n*(t||1)).toFixed(0)};window.updateGrpoBaseQty=(e,t)=>{const o=document.querySelector(`#grpo-lines-tbody tr[data-idx="${e}"]`);if(!o)return;const s=o.querySelector(".grpo-qty-alt"),a=o.querySelector(".grpo-qty");if(!s||!a)return;const n=parseFloat(a.value)||0;s.value=(t&&t>0?n/t:n).toFixed(2)};window.loadPOToGRPO=async e=>{const t=document.getElementById("grpo-lines-tbody"),o=document.getElementById("grpo-wh"),s=document.getElementById("save-grpo-btn");if(!e){t.innerHTML='<tr><td colspan="6" class="dim" style="text-align:center; padding:20px;">يرجى اختيار أمر شراء لاستيراد بنوده</td></tr>',s.disabled=!0;return}try{const a=await j(M(L,`companies/${C}/purchaseOrders`,e));if(!a.exists()){showToast("تعذر العثور على أمر الشراء","error");return}O={id:a.id,...a.data()},o.value=O.warehouseId;const n=O.items||[];if(!n.length){t.innerHTML='<tr><td colspan="6" class="dim" style="text-align:center; padding:20px;">أمر الشراء لا يحتوي على أصناف</td></tr>',s.disabled=!0;return}t.innerHTML=n.map((i,d)=>{const l=k.find(f=>f.id===i.productId)||{},r=l.unit||"حبة",m=l.altUnit||null,c=parseInt(l.unitFactor)||1,g=i.qty||0,h=c>1?(g/c).toFixed(2):g;return`
        <tr data-idx="${d}">
          <td>
            <strong>${i.sku} - ${i.name}</strong>
            <div class="dim" style="font-size:11px;">الكمية بأمر الشراء: ${i.qty} ${r}</div>
          </td>
          <td>
            ${m?`
              <div style="display:flex; align-items:center; gap:4px;">
                <input type="number" class="input mono grpo-qty-alt" value="${h}" step="0.01" min="0" oninput="window.updateGrpoAltQty(${d}, ${c})" style="width:75px;" />
                <span class="dim" style="font-size:11px;">${m}</span>
              </div>
            `:`
              <span class="dim" style="font-size:11px;">—</span>
            `}
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:4px;">
              <input type="number" class="input mono font-bold grpo-qty" value="${g}" min="1" oninput="window.updateGrpoBaseQty(${d}, ${c})" style="width:85px;" />
              <span class="dim" style="font-size:11px;">${r}</span>
            </div>
          </td>
          <td>
            <input type="number" class="input mono grpo-cost" value="${i.unitPrice.toFixed(2)}" step="0.01" style="width:85px;" />
          </td>
          <td>
            <input type="text" class="input mono grpo-batch" placeholder="B-${Date.now().toString().slice(-4)}" style="width:110px;" />
          </td>
          <td>
            <input type="date" class="input grpo-expiry" style="width:130px;" />
          </td>
        </tr>
      `}).join(""),s.disabled=!1}catch(a){showToast(a.message,"error")}};window.saveGRPO=async()=>{const e=document.getElementById("grpo-error");if(e.classList.add("hidden"),!O)return;const t=document.querySelectorAll("#grpo-lines-tbody tr"),o=[];let s=0;for(let n=0;n<t.length;n++){const i=t[n],d=parseInt(i.getAttribute("data-idx")),l=(O.items||[])[d];if(!l)continue;const r=i.querySelector(".grpo-qty"),m=i.querySelector(".grpo-cost"),c=i.querySelector(".grpo-batch"),g=i.querySelector(".grpo-expiry"),h=i.querySelector(".grpo-qty-alt"),f=parseFloat(r?.value)||0,x=parseFloat(m?.value)||0,p=c?.value.trim()||"",y=g?.value||"",S=h&&parseFloat(h.value)||0;if(f<=0||x<=0){e.textContent="يرجى إدخال كميات وتكاليف صحيحة لكافة السطور المستلمة",e.classList.remove("hidden");return}const N=k.find(A=>A.id===l.productId)||{};o.push({productId:l.productId,sku:l.sku,name:l.name,qty:f,unitPrice:x,batchNumber:p||null,expiryDate:y||null,unit:N.unit||"حبة",altUnit:N.altUnit||null,unitFactor:parseInt(N.unitFactor)||1,qtyAlt:S}),s+=f*x}const a=document.getElementById("save-grpo-btn");a.disabled=!0;try{const n=document.getElementById("grpo-date").value||w(),i=`GRPO-${n.replace(/-/g,"")}-${Math.floor(1e3+Math.random()*9e3)}`,d=O.warehouseId,l=await _(I.goodsReceiptPOs(),{grpoNumber:i,number:i,date:n,purchaseOrderId:O.id,poNumber:O.poNumber||O.id,supplierId:O.supplierId,supplierName:O.supplierName,warehouseId:d,warehouseName:O.warehouseName,items:o,totalValue:s,status:"received",createdAt:new Date().toISOString()});for(const c of o)await D(d,c.productId,c.qty,{type:"purchase_in",sourceType:"goodsReceiptPO",sourceId:l,purchasePrice:c.unitPrice,batchNumber:c.batchNumber,expiryDate:c.expiryDate});await nt("purchaseOrders",O.id,{status:"received"});const r=T.find(c=>c.code==="1-1-4-1-01")||T.find(c=>c.code==="1-1-4-1")||{id:"INV_STOCK",code:"1-1-4-1-01",name:"مخزون مستودع المواد الغذائية"},m=T.find(c=>c.code==="2-1-1-1-1")||T.find(c=>c.code==="2-1-1-1")||{id:"AP_SUPPLIERS",code:"2-1-1-1-1",name:"ذمم موردون محليون"};await st({date:n,description:`إذن استلام بضاعة مخزني #${i} لـ ${O.supplierName}`,sourceType:"goodsReceiptPO",sourceId:l,lines:[{accountId:r.id,accountCode:r.code,accountName:r.name,debit:s,credit:0,note:"إثبات استلام مخزون وارد"},{accountId:m.id,accountCode:m.code,accountName:m.name,debit:0,credit:s,note:"إثبات التزام وارد للمورد"}]}),showToast("تم إثبات استلام البضاعة مخزنياً ومحاسبياً بنجاح","success"),closeModal("grpo-modal"),switchOpsSubModule("grpo")}catch(n){e.textContent=n.message,e.classList.remove("hidden")}finally{a.disabled=!1}};function xt(e,t){if(t.length===0){e.innerHTML=`
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">📦</div>
        <div style="font-size:16px; font-weight:700;">لا توجد أذونات استلام مخزنية</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لاستلام شحنة بضاعة قادمة من أمر شراء</p>
      </div>`;return}e.innerHTML=`
    <div class="card" style="border:1px solid var(--border-soft); border-radius:10px; overflow:hidden;">
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr>
              <th>رقم الإذن</th>
              <th>تاريخ الاستلام</th>
              <th>أمر الشراء</th>
              <th>المورد</th>
              <th>المستودع المستلم</th>
              <th>عدد الأصناف</th>
              <th>القيمة المالية</th>
              <th>الحالة</th>
              <th class="no-print" style="text-align:center;">إجراءات تشغيلية</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(o=>`
              <tr>
                <td class="mono font-bold text-primary">${o.grpoNumber||o.number||o.id}</td>
                <td>${o.date}</td>
                <td class="mono font-bold text-dim">${o.poNumber||"—"}</td>
                <td><strong>${o.supplierName}</strong></td>
                <td>${o.warehouseName}</td>
                <td class="mono font-bold" style="text-align:center;">${(o.items||[]).length}</td>
                <td class="mono font-bold text-good" style="font-size:13px;">${v(o.totalValue)}</td>
                <td><span class="badge good font-bold">✅ مستلم بالمخزن</span></td>
                <td class="no-print" style="text-align:center; white-space:nowrap;">
                  <button class="btn btn-sm btn-ghost text-primary" onclick="window.showGRPODetail('${o.id}')" title="معاينة تفاصيل الاستلام">👁️ معاينة</button>
                  <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printGRPODetail('${o.id}')" title="طباعة إذن استلام بضاعة">🖨️ طباعة</button>
                  <button class="btn btn-sm btn-ghost text-indigo font-bold" onclick="window.convertGRPOToInvoice('${o.id}')" title="تحويل فوراً إلى فاتورة مشتريات">🧾 فاتورة مشتريات</button>
                  <button class="btn btn-sm btn-ghost text-warn font-bold" onclick="window.convertGRPOToQI('${o.id}')" title="تحويل لفحص الجودة ومطابقة الأغذية">🔬 فحص جودة</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.showGRPODetail=async e=>{const t=b.find(n=>n.id===e)||(await j(M(L,`companies/${C}/goodsReceiptPOs`,e))).data();if(!t){showToast("إذن الاستلام غير موجود","error");return}({...t},document.getElementById("grpo-detail-title").textContent=`📦 إذن استلام بضاعة: ${t.grpoNumber||e}`);const o=t.items||[],s=document.getElementById("grpo-detail-body");s.innerHTML=`
    <div class="grid-3 gap-12 mb-16" style="background:var(--bg-2); padding:12px 16px; border-radius:8px; border:1px solid var(--border-soft);">
      <div><span class="dim" style="font-size:11px;">رقم الإذن:</span> <strong class="mono font-bold text-primary">${t.grpoNumber||e}</strong></div>
      <div><span class="dim" style="font-size:11px;">تاريخ الاستلام:</span> <strong class="mono">${t.date}</strong></div>
      <div><span class="dim" style="font-size:11px;">أمر الشراء المرجعي:</span> <strong class="mono">${t.poNumber||"—"}</strong></div>
      <div><span class="dim" style="font-size:11px;">المورد:</span> <strong>${t.supplierName}</strong></div>
      <div><span class="dim" style="font-size:11px;">مستودع التخزين:</span> <strong>${t.warehouseName}</strong></div>
      <div><span class="dim" style="font-size:11px;">إجمالي القيمة:</span> <strong class="mono font-bold text-good">${v(t.totalValue)}</strong></div>
    </div>

    <h4 style="margin:0 0 10px 0; font-size:13px; font-weight:700;">الأصناف المستلمة وتفاصيل التشغيلات الصالحة:</h4>
    <div class="table-container mb-16" style="border:1px solid var(--border-soft); border-radius:8px;">
      <table class="data-dense" style="width:100%;">
        <thead>
          <tr>
            <th>#</th>
            <th>رمز الصنف</th>
            <th>اسم الصنف</th>
            <th>الوحدة</th>
            <th style="text-align:center;">الكمية المستلمة</th>
            <th style="text-align:left;">التكلفة</th>
            <th>رقم التشغيلة (Batch)</th>
            <th>تاريخ الانتهاء</th>
          </tr>
        </thead>
        <tbody>
          ${o.map((n,i)=>`
            <tr>
              <td>${i+1}</td>
              <td class="mono font-bold text-dim">${n.sku||"—"}</td>
              <td><strong>${n.name}</strong></td>
              <td>${n.unit||"حبة"}</td>
              <td class="mono font-bold text-primary" style="text-align:center; font-size:13px;">${u(n.qty)}</td>
              <td class="mono" style="text-align:left;">${v(n.unitPrice)}</td>
              <td class="mono font-bold">${n.batchNumber||"—"}</td>
              <td class="mono">${n.expiryDate||"—"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;const a=document.getElementById("grpo-detail-actions");a.innerHTML=`
    <button class="btn btn-secondary" onclick="window.printGRPODetail('${e}')">🖨️ طباعة إذن الاستلام</button>
    <button class="btn btn-primary" onclick="closeModal('grpo-detail-modal'); window.convertGRPOToInvoice('${e}')">🧾 تحويل لفاتورة مشتريات</button>
  `,openModal("grpo-detail-modal")};window.printGRPODetail=async e=>{const t=b.find(d=>d.id===e)||(await j(M(L,`companies/${C}/goodsReceiptPOs`,e))).data();if(!t){showToast("إذن الاستلام غير موجود للطباعة","error");return}const o=t.items||[],s=`
    <div class="meta-item"><div class="meta-label">رقم إذن الاستلام:</div><div class="meta-val mono font-bold text-primary">${t.grpoNumber||e}</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ الاستلام:</div><div class="meta-val mono">${t.date}</div></div>
    <div class="meta-item"><div class="meta-label">أمر الشراء المرجعي:</div><div class="meta-val mono">${t.poNumber||"—"}</div></div>
    <div class="meta-item"><div class="meta-label">المورد:</div><div class="meta-val">${t.supplierName}</div></div>
    <div class="meta-item"><div class="meta-label">مستودع الاستلام:</div><div class="meta-val">${t.warehouseName}</div></div>
    <div class="meta-item"><div class="meta-label">إجمالي القيمة:</div><div class="meta-val mono font-bold">${v(t.totalValue)}</div></div>
  `,a=`
    <table class="data-table">
      <thead>
        <tr>
          <th style="width:30px;">#</th>
          <th style="width:90px;">الرمز (SKU)</th>
          <th>اسم الصنف والوصف</th>
          <th style="width:70px;">الوحدة</th>
          <th style="width:90px; text-align:center;">الكمية الفعلية</th>
          <th style="width:110px;">رقم التشغيلة</th>
          <th style="width:110px;">تاريخ الصلاحية</th>
          <th style="width:110px; text-align:left;">إجمالي القيمة</th>
        </tr>
      </thead>
      <tbody>
        ${o.map((d,l)=>`
          <tr>
            <td style="text-align:center;">${l+1}</td>
            <td class="mono font-bold" style="text-align:center;">${d.sku||"—"}</td>
            <td><strong>${d.name}</strong></td>
            <td style="text-align:center;">${d.unit||"حبة"}</td>
            <td class="mono font-bold" style="text-align:center; font-size:12px;">${u(d.qty)}</td>
            <td class="mono font-bold" style="text-align:center;">${d.batchNumber||"—"}</td>
            <td class="mono" style="text-align:center;">${d.expiryDate||"—"}</td>
            <td class="mono font-bold" style="text-align:left;">${v(d.qty*d.unitPrice)}</td>
          </tr>
        `).join("")}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="7" style="text-align:right;">الإجمالي المالي لبضاعة الاستلام:</td>
          <td class="mono font-bold" style="text-align:left; font-size:13px;">${v(t.totalValue)}</td>
        </tr>
      </tfoot>
    </table>
  `,i=V({title:`إذن استلام بضاعة مخزني معتمد #${t.grpoNumber||e}`,docBadge:'<span class="doc-badge good">إذن استلام بضاعة رسمي</span>',metaHtml:s,contentHtml:a,signaturesHtml:`
    <div class="sig-box">
      <div class="sig-role">أمين المستودع المستلم</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">مسؤول فحص الجودة والمطابقة</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">مندوب التوريد / السائق المسلّم</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
  `,footerNotes:"تم فحص البضاعة ومطابقة الأعداد وتواريخ الصلاحية مع الفاتورة وأمر الشراء المرفق."});window.printOpsDocument(i,`GRPO-${t.grpoNumber||e}`)};window.convertGRPOToInvoice=async e=>{try{const t=await j(M(L,`companies/${C}/goodsReceiptPOs`,e));if(!t.exists()){showToast("إذن الاستلام غير موجود","error");return}const o={id:t.id,...t.data()};sessionStorage.setItem("convert_grpo_to_invoice",JSON.stringify({grpoId:o.id,grpoNumber:o.grpoNumber||o.number||o.id,supplierId:o.supplierId||"",supplierName:o.supplierName||"",warehouseId:o.warehouseId||"",warehouseName:o.warehouseName||"",items:(o.items||[]).map(s=>({productId:s.productId,productName:s.name,sku:s.sku||"",unit:s.unit||"حبة",qty:s.qty||0,unitPrice:s.unitPrice||0,batchNumber:s.batchNumber||"",expiryDate:s.expiryDate||""})),totalValue:o.totalValue})),showToast("تم تجهيز بيانات إذن الاستلام بنجاح، جاري التحويل لشاشة فواتير المشتريات...","success"),typeof navigate=="function"?navigate("purchase-invoices"):window.location.hash="#purchase-invoices"}catch(t){showToast(t.message,"error")}};window.convertGRPOToQI=async e=>{const t=b.find(i=>i.id===e)||(await j(M(L,`companies/${C}/goodsReceiptPOs`,e))).data();if(!t)return;const o=(t.items||[])[0];$="inspect";const s=document.getElementById("ops-submodule-select");if(s&&(s.value="inspect"),await window.openOpsModal(),o){const i=document.getElementById("qi-product");i&&(i.value=o.productId);const d=document.getElementById("qi-batch");d&&(d.value=o.batchNumber||"");const l=document.getElementById("qi-expiry");l&&(l.value=o.expiryDate||"")}const a=document.getElementById("qi-wh");a&&t.warehouseId&&(a.value=t.warehouseId);const n=document.getElementById("qi-notes");n&&(n.value=`فحص استلام البضاعة لإذن رقم #${t.grpoNumber||e}`)};window.saveQualityInspection=async()=>{const e=document.getElementById("qi-error");e.classList.add("hidden");const t=document.getElementById("qi-batch").value.trim().toUpperCase(),o=parseFloat(document.getElementById("qi-temp").value),s=document.getElementById("qi-product").value,a=document.getElementById("qi-wh").value,n=document.getElementById("qi-status").value;if(!t||isNaN(o)||!s||!a){e.textContent="يرجى تعبئة كافة الحقول الإلزامية ودرجة الحرارة المستلمة",e.classList.remove("hidden");return}const i=document.getElementById("save-qi-btn");i.disabled=!0;try{const d=k.find(c=>c.id===s),l=E.find(c=>c.id===a),r=document.getElementById("qi-date").value||w(),m=`QI-${r.replace(/-/g,"")}-${Math.floor(1e3+Math.random()*9e3)}`;await _(I.qualityInspections(),{inspectionNumber:m,number:m,date:r,batchNumber:t,temperature:o,productId:s,productName:d?.name||"صنف",sku:d?.sku||"",productionDate:document.getElementById("qi-prod-date").value||null,expiryDate:document.getElementById("qi-expiry").value||null,warehouseId:a,warehouseName:l?.name||"المستودع الرئيسي",status:n,notes:document.getElementById("qi-notes").value.trim(),createdAt:new Date().toISOString()}),showToast("تم اعتماد محضر فحص الجودة بنجاح","success"),closeModal("qi-modal"),switchOpsSubModule("inspect")}catch(d){e.textContent=d.message,e.classList.remove("hidden")}finally{i.disabled=!1}};function wt(e,t){if(t.length===0){e.innerHTML=`
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">🔬</div>
        <div style="font-size:16px; font-weight:700;">لا توجد محاضر فحص جودة مسجلة</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لتوثيق محضر فحص ومطابقة حرارية للمنتجات الغذائية</p>
      </div>`;return}e.innerHTML=`
    <div class="card" style="border:1px solid var(--border-soft); border-radius:10px; overflow:hidden;">
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr>
              <th>رقم الفحص</th>
              <th>التاريخ</th>
              <th>الصنف المفحوص</th>
              <th>رقم التشغيلة (Batch)</th>
              <th>درجة الحرارة</th>
              <th>تاريخ الانتهاء</th>
              <th>المستودع</th>
              <th>نتيجة الفحص والمطابقة</th>
              <th class="no-print" style="text-align:center;">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(o=>`
              <tr>
                <td class="mono font-bold text-primary">${o.inspectionNumber||o.number||o.id}</td>
                <td>${o.date}</td>
                <td><strong>${o.productName}</strong> <span class="dim mono font-bold">(${o.sku})</span></td>
                <td class="mono font-bold">${o.batchNumber}</td>
                <td class="mono font-bold" style="font-size:13px;">${o.temperature} °م</td>
                <td class="mono">${o.expiryDate||"—"}</td>
                <td>${o.warehouseName}</td>
                <td>
                  <span class="badge ${o.status==="passed"?"good":o.status==="failed"?"bad":"warn"} font-bold">
                    ${o.status==="passed"?"✅ مطابق ومقبول":o.status==="failed"?"❌ مرفوض للتلف":"⚠️ مقبول مشروط"}
                  </span>
                </td>
                <td class="no-print" style="text-align:center; white-space:nowrap;">
                  <button class="btn btn-sm btn-ghost text-primary" onclick="window.showQIDetail('${o.id}')" title="معاينة محضر الفحص">👁️ معاينة</button>
                  <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printQIDetail('${o.id}')" title="طباعة شهادة ومحضر الفحص كـ PDF">🖨️ طباعة</button>
                  <button class="btn btn-sm btn-ghost text-bad" onclick="window.deleteQI('${o.id}')" title="حذف السجل">🗑️</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.showQIDetail=async e=>{const t=b.find(a=>a.id===e)||(await j(M(L,`companies/${C}/qualityInspections`,e))).data();if(!t){showToast("محضر الفحص غير موجود","error");return}({...t},document.getElementById("qi-detail-title").textContent=`🔬 محضر فحص جودة: ${t.inspectionNumber||e}`);const o=document.getElementById("qi-detail-body");o.innerHTML=`
    <div class="grid-2 gap-12 mb-16" style="background:var(--bg-2); padding:16px; border-radius:8px; border:1px solid var(--border-soft);">
      <div><span class="dim" style="font-size:11px;">رقم المحضر:</span> <strong class="mono font-bold text-primary">${t.inspectionNumber||e}</strong></div>
      <div><span class="dim" style="font-size:11px;">تاريخ الفحص:</span> <strong class="mono">${t.date}</strong></div>
      <div><span class="dim" style="font-size:11px;">الصنف:</span> <strong>${t.productName} (${t.sku})</strong></div>
      <div><span class="dim" style="font-size:11px;">التشغيلة:</span> <strong class="mono font-bold">${t.batchNumber}</strong></div>
      <div><span class="dim" style="font-size:11px;">درجة الحرارة:</span> <strong class="mono font-bold" style="font-size:13px;">${t.temperature} °م</strong></div>
      <div><span class="dim" style="font-size:11px;">المستودع المستهدف:</span> <strong>${t.warehouseName}</strong></div>
      <div><span class="dim" style="font-size:11px;">تاريخ الإنتاج:</span> <strong class="mono">${t.productionDate||"—"}</strong></div>
      <div><span class="dim" style="font-size:11px;">تاريخ الانتهاء:</span> <strong class="mono">${t.expiryDate||"—"}</strong></div>
      <div style="grid-column:span 2;"><span class="dim" style="font-size:11px;">النتيجة العامة:</span> <strong class="badge ${t.status==="passed"?"good":t.status==="failed"?"bad":"warn"} font-bold">${t.status==="passed"?"مطابق ومقبول":t.status==="failed"?"مرفوض للتلف":"مقبول مشروط"}</strong></div>
      <div style="grid-column:span 2;"><span class="dim" style="font-size:11px;">ملاحظات الفاحص:</span> <strong>${t.notes||"—"}</strong></div>
    </div>
  `;const s=document.getElementById("qi-detail-actions");s.innerHTML=`
    <button class="btn btn-secondary" onclick="window.printQIDetail('${e}')">🖨️ طباعة شهادة الفحص</button>
  `,openModal("qi-detail-modal")};window.printQIDetail=async e=>{const t=b.find(d=>d.id===e)||(await j(M(L,`companies/${C}/qualityInspections`,e))).data();if(!t)return;const o=`
    <div class="meta-item"><div class="meta-label">رقم محضر الفحص:</div><div class="meta-val mono font-bold text-primary">${t.inspectionNumber||e}</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ الفحص:</div><div class="meta-val mono">${t.date}</div></div>
    <div class="meta-item"><div class="meta-label">الصنف المفحوص:</div><div class="meta-val"><strong>${t.productName} (${t.sku})</strong></div></div>
    <div class="meta-item"><div class="meta-label">رقم التشغيلة (Batch):</div><div class="meta-val mono font-bold">${t.batchNumber}</div></div>
    <div class="meta-item"><div class="meta-label">درجة الحرارة عند الوصول:</div><div class="meta-val mono font-bold">${t.temperature} °م</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ انتهاء الصلاحية:</div><div class="meta-val mono">${t.expiryDate||"—"}</div></div>
  `,s=t.status==="passed",a=`
    <div style="border: 2px solid ${s?"#10b981":"#ef4444"}; border-radius: 8px; padding: 16px; background: ${s?"#ecfdf5":"#fef2f2"}; margin-bottom: 16px;">
      <h3 style="margin:0 0 8px 0; color:${s?"#065f46":"#991b1b"}; font-size:16px;">
        ${s?"✅ تقرير المطابقة: المنتج سليم ومطابق لكافة الاشتراطات الصحية والحرارية":"❌ تقرير عدم المطابقة: المنتج غير مطابق وتم رفض إدخاله للمستودع"}
      </h3>
      <p style="margin:4px 0; font-size:11.5px; color:#374151;">
        <strong>نتائج الفحص المخبري والظاهري:</strong> ${t.notes||"فحص التغليف سليم، الرائحة طبيعية، درجة التجمد/التبريد مطابقة للمعايير المعتمدة."}
      </p>
    </div>
  `,i=V({title:`شهادة ومحضر فحص جودة ومطابقة أغذية #${t.inspectionNumber||e}`,docBadge:`<span class="doc-badge ${s?"good":"bad"}">${s?"معتمد ومطابق صحياً":"مرفوض صحياً"}</span>`,metaHtml:o,contentHtml:a,signaturesHtml:`
    <div class="sig-box">
      <div class="sig-role">مسؤول الرقابة وضبط الجودة</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">المشرف الصحي / مدير المستودع</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">اعتماد الإدارة الفنية</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
  `,footerNotes:"يخضع هذا المحضر للاشتراطات الفنية لهيئة الغذاء والدواء والمعايير القياسية للسلامة الغذائية."});window.printOpsDocument(i,`QI-${t.inspectionNumber||e}`)};window.deleteQI=async e=>{if(confirm("هل تريد حذف محضر فحص الجودة هذا نهائياً؟"))try{await dt(M(L,`companies/${C}/qualityInspections`,e)),showToast("تم حذف محضر الفحص","success"),switchOpsSubModule("inspect")}catch(t){showToast(t.message,"error")}};window.addDispatchItem=()=>{const e=document.getElementById("dsp-item-sel"),t=parseFloat(document.getElementById("dsp-item-qty").value)||0;if(!e.value||t<=0){showToast("اختر صنفاً وحدد كمية صحيحة","warning");return}const o=k.find(a=>a.id===e.value);if(G.some(a=>a.productId===e.value)){showToast("الصنف مضاف بالفعل للقائمة","warning");return}const s=parseFloat(o?.costPrice||0);G.push({productId:e.value,sku:o?.sku||"",name:o?.name||"صنف",qty:t,cost:s,totalCost:t*s}),$t(),e.value="",document.getElementById("dsp-item-qty").value="1"};function $t(){const e=document.getElementById("dsp-lines-tbody");e&&(e.innerHTML=G.map((t,o)=>`
    <tr>
      <td class="mono font-bold text-dim">${t.sku}</td>
      <td><strong>${t.name}</strong></td>
      <td class="mono font-bold text-primary">${u(t.qty)}</td>
      <td class="mono">${v(t.cost)}</td>
      <td class="mono font-bold">${v(t.totalCost)}</td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="dispatchLines.splice(${o},1); renderDspLines();">✕</button></td>
    </tr>
  `).join(""))}window.saveDispatch=async()=>{const e=document.getElementById("dsp-error");e.classList.add("hidden");const t=document.getElementById("dsp-wh").value,o=document.getElementById("dsp-purpose").value,s=document.getElementById("dsp-date").value||w(),a=document.getElementById("dsp-notes").value.trim();if(!t||!G.length){e.textContent="اختر المخزن وأضف صنفاً واحداً على الأقل",e.classList.remove("hidden");return}const n=document.getElementById("save-dsp-btn");n.disabled=!0;try{const i=E.find(m=>m.id===t),d=`DSP-${s.replace(/-/g,"")}-${Math.floor(1e3+Math.random()*9e3)}`,l=G.reduce((m,c)=>m+c.totalCost,0),r=await _(I.inventoryAdjustments(),{opType:"dispatch",dispatchNumber:d,number:d,warehouseId:t,warehouseName:i?.name||"المستودع",purpose:o,date:s,notes:a,lines:G,totalCost:l,createdAt:new Date().toISOString()});for(const m of G)await D(t,m.productId,-m.qty,{type:"dispatch_out",sourceType:"stockDispatch",sourceId:r,note:`صرف مخزني: ${o} - ${a}`});showToast("تم تنفيذ الصرف المخزني وخصم الأرصدة بنجاح","success"),closeModal("dispatch-modal"),switchOpsSubModule("dispatch")}catch(i){e.textContent=i.message,e.classList.remove("hidden")}finally{n.disabled=!1}};function It(e,t){if(!t.length){e.innerHTML=`
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">📤</div>
        <div style="font-size:16px; font-weight:700;">لا توجد عمليات صرف مسجلة</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لإنشاء إذن صرف مخزني معتمد</p>
      </div>`;return}e.innerHTML=`
    <div class="card" style="border:1px solid var(--border-soft); border-radius:10px; overflow:hidden;">
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr>
              <th>رقم الأمر</th>
              <th>التاريخ</th>
              <th>المستودع المصدر</th>
              <th>الغرض من الصرف</th>
              <th>الأصناف المنصرفة</th>
              <th>إجمالي التكلفة</th>
              <th>البيان / المستلم</th>
              <th class="no-print" style="text-align:center;">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(o=>{const a=(o.lines||[]).map(n=>`${z(n)} (${u(n.qty)})`).join("، ");return`
                <tr>
                  <td class="mono font-bold text-primary">${o.dispatchNumber||o.number||o.id}</td>
                  <td>${o.date||"—"}</td>
                  <td><strong>${o.warehouseName}</strong></td>
                  <td><span class="badge info font-bold">${o.purpose||"صرف داخلي"}</span></td>
                  <td style="max-width:280px;">${a||"—"}</td>
                  <td class="mono font-bold text-good">${v(o.totalCost||0)}</td>
                  <td>${o.notes||"—"}</td>
                  <td class="no-print" style="text-align:center; white-space:nowrap;">
                    <button class="btn btn-sm btn-ghost text-primary" onclick="window.showDispatchDetail('${o.id}')">👁️ معاينة</button>
                    <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printDispatchDetail('${o.id}')">🖨️ طباعة</button>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.showDispatchDetail=async e=>{const t=b.find(n=>n.id===e);if(!t)return;document.getElementById("dispatch-detail-title").textContent=`📤 إذن صرف مخزني: ${t.dispatchNumber||e}`;const o=t.lines||[],s=document.getElementById("dispatch-detail-body");s.innerHTML=`
    <div class="grid-3 gap-12 mb-16" style="background:var(--bg-2); padding:12px 16px; border-radius:8px; border:1px solid var(--border-soft);">
      <div><span class="dim" style="font-size:11px;">رقم الإذن:</span> <strong class="mono font-bold text-primary">${t.dispatchNumber||e}</strong></div>
      <div><span class="dim" style="font-size:11px;">تاريخ الصرف:</span> <strong class="mono">${t.date}</strong></div>
      <div><span class="dim" style="font-size:11px;">المستودع المصدر:</span> <strong>${t.warehouseName}</strong></div>
      <div><span class="dim" style="font-size:11px;">الغرض:</span> <strong>${t.purpose||"داخلي"}</strong></div>
      <div><span class="dim" style="font-size:11px;">إجمالي التكلفة:</span> <strong class="mono font-bold text-good">${v(t.totalCost||0)}</strong></div>
      <div><span class="dim" style="font-size:11px;">البيان:</span> <strong>${t.notes||"—"}</strong></div>
    </div>

    <h4 style="margin:0 0 10px 0; font-size:13px; font-weight:700;">الأصناف المنصرفة (${o.length} أصناف):</h4>
    <div class="table-container mb-16" style="border:1px solid var(--border-soft); border-radius:8px;">
      <table class="data-dense" style="width:100%;">
        <thead>
          <tr>
            <th>#</th>
            <th>الرمز</th>
            <th>اسم الصنف</th>
            <th style="text-align:center;">الكمية</th>
            <th style="text-align:left;">التكلفة التقديرية</th>
            <th style="text-align:left;">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${o.map((n,i)=>`
            <tr>
              <td>${i+1}</td>
              <td class="mono font-bold text-dim">${n.sku||"—"}</td>
              <td><strong>${z(n)}</strong></td>
              <td class="mono font-bold text-primary" style="text-align:center; font-size:13px;">${u(n.qty)}</td>
              <td class="mono" style="text-align:left;">${v(n.cost||0)}</td>
              <td class="mono font-bold" style="text-align:left;">${v(n.totalCost||n.qty*(n.cost||0))}</td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr style="font-weight:bold; background:var(--bg-hover);">
            <td colspan="5" style="text-align:right;">الإجمالي:</td>
            <td class="mono font-bold text-good" style="text-align:left;">${v(t.totalCost||0)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;const a=document.getElementById("dispatch-detail-actions");a.innerHTML=`
    <button class="btn btn-secondary" onclick="window.printDispatchDetail('${e}')">🖨️ طباعة إذن الصرف</button>
  `,openModal("dispatch-detail-modal")};window.printDispatchDetail=async e=>{const t=b.find(d=>d.id===e);if(!t)return;const o=t.lines||[],s=`
    <div class="meta-item"><div class="meta-label">رقم إذن الصرف:</div><div class="meta-val mono font-bold text-primary">${t.dispatchNumber||e}</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ الصرف:</div><div class="meta-val mono">${t.date}</div></div>
    <div class="meta-item"><div class="meta-label">المستودع المصدر:</div><div class="meta-val">${t.warehouseName}</div></div>
    <div class="meta-item"><div class="meta-label">الغرض من الصرف:</div><div class="meta-val">${t.purpose||"صرف داخلي"}</div></div>
    <div class="meta-item"><div class="meta-label">إجمالي التكلفة:</div><div class="meta-val mono font-bold">${v(t.totalCost||0)}</div></div>
    <div class="meta-item"><div class="meta-label">البيان / المستلم:</div><div class="meta-val">${t.notes||"—"}</div></div>
  `,a=`
    <table class="data-table">
      <thead>
        <tr>
          <th style="width:30px;">#</th>
          <th style="width:90px;">الرمز</th>
          <th>اسم الصنف المنصرف</th>
          <th style="width:90px; text-align:center;">الكمية المنصرفة</th>
          <th style="width:110px; text-align:left;">تكلفة الوحدة</th>
          <th style="width:120px; text-align:left;">إجمالي القيمة</th>
        </tr>
      </thead>
      <tbody>
        ${o.map((d,l)=>`
          <tr>
            <td style="text-align:center;">${l+1}</td>
            <td class="mono font-bold" style="text-align:center;">${d.sku||"—"}</td>
            <td><strong>${z(d)}</strong></td>
            <td class="mono font-bold" style="text-align:center; font-size:12px;">${u(d.qty)}</td>
            <td class="mono" style="text-align:left;">${v(d.cost||0)}</td>
            <td class="mono font-bold" style="text-align:left;">${v(d.totalCost||d.qty*(d.cost||0))}</td>
          </tr>
        `).join("")}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" style="text-align:right;">الإجمالي العام لقيمة المنصرف:</td>
          <td class="mono font-bold" style="text-align:left;">${v(t.totalCost||0)}</td>
        </tr>
      </tfoot>
    </table>
  `,i=V({title:`إذن صرف مخزني معتمد #${t.dispatchNumber||e}`,docBadge:'<span class="doc-badge good">إذن صرف مخزني رسمي</span>',metaHtml:s,contentHtml:a,signaturesHtml:`
    <div class="sig-box">
      <div class="sig-role">أمين المستودع (المسلّم)</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">المستلم المسؤول / المندوب</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">اعتماد إدارة العمليات</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
  `,footerNotes:"تم تسليم الأصناف أعلاه بالحالة السليمة وتحميلها على ذمة الجهة المستلمة."});window.printOpsDocument(i,`DSP-${t.dispatchNumber||e}`)};window.addVehicleItem=()=>{const e=document.getElementById("veh-item-sel"),t=parseFloat(document.getElementById("veh-item-qty").value)||1;if(!e.value||t<=0){showToast("اختر صنفاً وحدد كمية صحيحة","warning");return}const o=k.find(s=>s.id===e.value);if(Y.some(s=>s.productId===e.value)){showToast("الصنف مضاف بالفعل للشحنة","warning");return}Y.push({productId:e.value,sku:o?.sku||"",name:o?.name||"صنف",qty:t}),Pt(),e.value="",document.getElementById("veh-item-qty").value="1"};function Pt(){const e=document.getElementById("veh-lines-tbody");e&&(e.innerHTML=Y.map((t,o)=>`
    <tr>
      <td class="mono font-bold text-dim">${t.sku}</td>
      <td><strong>${t.name}</strong></td>
      <td class="mono font-bold text-primary">${u(t.qty)}</td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="vehicleLines.splice(${o},1); renderVehLines();">✕</button></td>
    </tr>
  `).join(""))}window.saveVehicleLoad=async()=>{const e=document.getElementById("veh-error");e.classList.add("hidden");const t=document.getElementById("veh-src-wh").value,o=document.getElementById("veh-dst-wh").value,s=document.getElementById("veh-driver").value.trim(),a=document.getElementById("veh-date").value||w(),n=document.getElementById("veh-notes").value.trim();if(!t||!o||!s||!Y.length){e.textContent="حدد المخزن المصدر، مخزن السيارة، اسم السائق، وأضف صنفاً واحداً على الأقل",e.classList.remove("hidden");return}if(t===o){e.textContent="المخزن المصدر ومخزن السيارة يجب أن يكونا مختلفين",e.classList.remove("hidden");return}const i=document.getElementById("save-veh-btn");i.disabled=!0;try{const d=E.find(c=>c.id===t),l=E.find(c=>c.id===o),r=`MAN-${a.replace(/-/g,"")}-${Math.floor(1e3+Math.random()*9e3)}`,m=await _(I.inventoryAdjustments(),{opType:"vehicle-load",manifestNumber:r,number:r,fromWarehouseId:t,fromWarehouseName:d?.name||"المخزن المصدر",toWarehouseId:o,toWarehouseName:l?.name||"سيارة التوزيع",driver:s,date:a,notes:n,lines:Y,createdAt:new Date().toISOString()});for(const c of Y)await D(t,c.productId,-c.qty,{type:"transfer_out",sourceType:"vehicleLoad",sourceId:m,note:`تحميل سيارة: ${l?.name} - المندوب: ${s}`}),await D(o,c.productId,c.qty,{type:"transfer_in",sourceType:"vehicleLoad",sourceId:m,note:`استلام شحنة من ${d?.name} - المندوب: ${s}`});showToast("تم اعتماد مانيفست التحميل ونقل العهدة لسيارة التوزيع بنجاح","success"),closeModal("vehicle-modal"),switchOpsSubModule("vehicle")}catch(d){e.textContent=d.message,e.classList.remove("hidden")}finally{i.disabled=!1}};function kt(e,t){if(!t.length){e.innerHTML=`
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">🚐</div>
        <div style="font-size:16px; font-weight:700;">لا توجد عمليات تحميل سيارات مسجلة</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لإصدار مانيفست شحن بضاعة لسيارة التوزيع</p>
      </div>`;return}e.innerHTML=`
    <div class="card" style="border:1px solid var(--border-soft); border-radius:10px; overflow:hidden;">
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr>
              <th>رقم المانيفست</th>
              <th>التاريخ</th>
              <th>المندوب / السائق</th>
              <th>من مخزن</th>
              <th>إلى سيارة التوزيع</th>
              <th>الأصناف المحملة</th>
              <th>الحالة</th>
              <th class="no-print" style="text-align:center;">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(o=>{const a=(o.lines||[]).map(n=>`${z(n)} (${u(n.qty)})`).join("، ");return`
                <tr>
                  <td class="mono font-bold text-primary">${o.manifestNumber||o.number||o.id}</td>
                  <td>${o.date||"—"}</td>
                  <td><strong>${o.driver||"—"}</strong></td>
                  <td>${o.fromWarehouseName}</td>
                  <td><strong>${o.toWarehouseName}</strong></td>
                  <td style="max-width:300px;">${a||"—"}</td>
                  <td><span class="badge good font-bold">🚐 تم التحميل</span></td>
                  <td class="no-print" style="text-align:center; white-space:nowrap;">
                    <button class="btn btn-sm btn-ghost text-primary" onclick="window.showVehicleDetail('${o.id}')">👁️ معاينة</button>
                    <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printVehicleManifest('${o.id}')">🖨️ طباعة المانيفست</button>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.showVehicleDetail=async e=>{const t=b.find(n=>n.id===e);if(!t)return;document.getElementById("vehicle-detail-title").textContent=`🚐 مانيفست شحن سيارة: ${t.manifestNumber||e}`;const o=t.lines||[],s=document.getElementById("vehicle-detail-body");s.innerHTML=`
    <div class="grid-3 gap-12 mb-16" style="background:var(--bg-2); padding:12px 16px; border-radius:8px; border:1px solid var(--border-soft);">
      <div><span class="dim" style="font-size:11px;">رقم المانيفست:</span> <strong class="mono font-bold text-primary">${t.manifestNumber||e}</strong></div>
      <div><span class="dim" style="font-size:11px;">تاريخ الشحن:</span> <strong class="mono">${t.date}</strong></div>
      <div><span class="dim" style="font-size:11px;">السائق / المندوب:</span> <strong>${t.driver||"—"}</strong></div>
      <div><span class="dim" style="font-size:11px;">المخزن المصدر:</span> <strong>${t.fromWarehouseName}</strong></div>
      <div><span class="dim" style="font-size:11px;">مخزن سيارة التوزيع:</span> <strong>${t.toWarehouseName}</strong></div>
      <div><span class="dim" style="font-size:11px;">ملاحظات:</span> <strong>${t.notes||"—"}</strong></div>
    </div>

    <h4 style="margin:0 0 10px 0; font-size:13px; font-weight:700;">الأصناف المحملة بالعهدة (${o.length} أصناف):</h4>
    <div class="table-container mb-16" style="border:1px solid var(--border-soft); border-radius:8px;">
      <table class="data-dense" style="width:100%;">
        <thead><tr><th>#</th><th>الرمز</th><th>اسم الصنف</th><th style="text-align:center;">الكمية المشحونة</th></tr></thead>
        <tbody>
          ${o.map((n,i)=>`
            <tr>
              <td>${i+1}</td>
              <td class="mono font-bold text-dim">${n.sku||"—"}</td>
              <td><strong>${z(n)}</strong></td>
              <td class="mono font-bold text-primary" style="text-align:center; font-size:13px;">${u(n.qty)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;const a=document.getElementById("vehicle-detail-actions");a.innerHTML=`
    <button class="btn btn-secondary" onclick="window.printVehicleManifest('${e}')">🖨️ طباعة مانيفست الشحن</button>
  `,openModal("vehicle-detail-modal")};window.printVehicleManifest=async e=>{const t=b.find(d=>d.id===e);if(!t)return;const o=t.lines||[],s=`
    <div class="meta-item"><div class="meta-label">رقم مانيفست التحميل:</div><div class="meta-val mono font-bold text-primary">${t.manifestNumber||e}</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ التحميل:</div><div class="meta-val mono">${t.date}</div></div>
    <div class="meta-item"><div class="meta-label">المندوب / السائق المستلم:</div><div class="meta-val"><strong>${t.driver||"—"}</strong></div></div>
    <div class="meta-item"><div class="meta-label">المستودع المصدر:</div><div class="meta-val">${t.fromWarehouseName}</div></div>
    <div class="meta-item"><div class="meta-label">سيارة التوزيع:</div><div class="meta-val"><strong>${t.toWarehouseName}</strong></div></div>
    <div class="meta-item"><div class="meta-label">خط السير / ملاحظات:</div><div class="meta-val">${t.notes||"—"}</div></div>
  `,a=`
    <table class="data-table">
      <thead>
        <tr>
          <th style="width:30px;">#</th>
          <th style="width:90px;">الرمز</th>
          <th>اسم الصنف المحمل والمواصفات</th>
          <th style="width:110px; text-align:center;">الكمية الفعلية المحملة</th>
          <th style="width:140px;">ملاحظات السائق عند التحميل</th>
        </tr>
      </thead>
      <tbody>
        ${o.map((d,l)=>`
          <tr>
            <td style="text-align:center;">${l+1}</td>
            <td class="mono font-bold" style="text-align:center;">${d.sku||"—"}</td>
            <td><strong>${z(d)}</strong></td>
            <td class="mono font-bold" style="text-align:center; font-size:13px;">${u(d.qty)}</td>
            <td style="font-size:10.5px; color:#64748b;">مطابق وسليم</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `,i=V({title:`مانيفست تحميل بضاعة على سيارة التوزيع #${t.manifestNumber||e}`,docBadge:'<span class="doc-badge good">مانيفست شحن رسمي</span>',metaHtml:s,contentHtml:a,signaturesHtml:`
    <div class="sig-box">
      <div class="sig-role">مسؤول التحميل بالمستودع</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">المندوب / السائق (إقرار استلام العهدة)</div>
      <div class="sig-name">التوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">مشرف حركة النقل والتوزيع</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
  `,footerNotes:"أقر أنا المندوب الموضح اسمه أعلاه باستلام كامل البضاعة والكميات المشحونة بحالة ممتازة ومطابقة للمانيفست وتحت مسؤوليتي."});window.printOpsDocument(i,`MAN-${t.manifestNumber||e}`)};window.addVehReturnItem=()=>{const e=document.getElementById("vr-item-sel"),t=parseFloat(document.getElementById("vr-item-qty").value)||1,o=document.getElementById("vr-item-reason").value;if(!e.value||t<=0){showToast("اختر صنفاً وحدد كمية صحيحة","warning");return}const s=k.find(a=>a.id===e.value);tt.push({productId:e.value,sku:s?.sku||"",name:s?.name||"صنف",qty:t,reason:o}),zt(),e.value="",document.getElementById("vr-item-qty").value="1"};function zt(){const e=document.getElementById("vr-lines-tbody");if(!e)return;const t=o=>o==="unsold"?"فائض غير مباع":o==="cust_return"?"مرتجع عميل":o==="damaged"?"تالف":o==="near_expiry"?"قريب الانتهاء":o;e.innerHTML=tt.map((o,s)=>`
    <tr>
      <td class="mono font-bold text-dim">${o.sku}</td>
      <td><strong>${o.name}</strong></td>
      <td class="mono font-bold text-primary">${u(o.qty)}</td>
      <td><span class="badge info font-bold">${t(o.reason)}</span></td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="vehicleReturnLines.splice(${s},1); renderVehReturnLines();">✕</button></td>
    </tr>
  `).join("")}window.saveVehicleReturn=async()=>{const e=document.getElementById("vr-error");e.classList.add("hidden");const t=document.getElementById("vr-src-wh").value,o=document.getElementById("vr-dst-wh").value,s=document.getElementById("vr-driver").value.trim(),a=document.getElementById("vr-date").value||w(),n=document.getElementById("vr-notes").value.trim();if(!t||!o||!s||!tt.length){e.textContent="حدد سيارة التوزيع، المستودع المستقبل، اسم المندوب، وأضف صنفاً واحداً على الأقل",e.classList.remove("hidden");return}if(t===o){e.textContent="سيارة التوزيع والمستودع المستقبل يجب أن يكونا مختلفين",e.classList.remove("hidden");return}const i=document.getElementById("save-vr-btn");i.disabled=!0;try{const d=E.find(c=>c.id===t),l=E.find(c=>c.id===o),r=`VR-${a.replace(/-/g,"")}-${Math.floor(1e3+Math.random()*9e3)}`,m=await _(I.inventoryAdjustments(),{opType:"vehicle-return",returnNumber:r,number:r,fromWarehouseId:t,fromWarehouseName:d?.name||"سيارة التوزيع",toWarehouseId:o,toWarehouseName:l?.name||"المستودع الرئيسي",driver:s,date:a,notes:n,lines:tt,createdAt:new Date().toISOString()});for(const c of tt)await D(t,c.productId,-c.qty,{type:"transfer_out",sourceType:"vehicleReturn",sourceId:m,note:`مرتجع من سيارة: ${d?.name} - المندوب: ${s}`}),await D(o,c.productId,c.qty,{type:"transfer_in",sourceType:"vehicleReturn",sourceId:m,note:`استلام مرتجع من سيارة ${d?.name} للمخزن ${l?.name}`});showToast("تم إثبات استلام المرتجع وتحديث الأرصدة بنجاح","success"),closeModal("vehicle-return-modal"),switchOpsSubModule("vehicle-return")}catch(d){e.textContent=d.message,e.classList.remove("hidden")}finally{i.disabled=!1}};function Et(e,t){if(!t.length){e.innerHTML=`
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">🔄</div>
        <div style="font-size:16px; font-weight:700;">لا توجد عمليات استلام مرتجع مسجلة</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لتسجيل استلام مرتجع من سيارة توزيع للمستودع</p>
      </div>`;return}e.innerHTML=`
    <div class="card" style="border:1px solid var(--border-soft); border-radius:10px; overflow:hidden;">
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr>
              <th>رقم الإذن</th>
              <th>التاريخ</th>
              <th>المندوب / السائق</th>
              <th>سيارة التوزيع (المصدر)</th>
              <th>المستودع المستقبل</th>
              <th>الأصناف المرتجعة</th>
              <th>الحالة</th>
              <th class="no-print" style="text-align:center;">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(o=>{const a=(o.lines||[]).map(n=>`${z(n)} (${u(n.qty)})`).join("، ");return`
                <tr>
                  <td class="mono font-bold text-primary">${o.returnNumber||o.number||o.id}</td>
                  <td>${o.date||"—"}</td>
                  <td><strong>${o.driver||"—"}</strong></td>
                  <td><strong>${o.fromWarehouseName}</strong></td>
                  <td>${o.toWarehouseName}</td>
                  <td style="max-width:300px;">${a||"—"}</td>
                  <td><span class="badge good font-bold">🔄 تم الاستلام بالمخزن</span></td>
                  <td class="no-print" style="text-align:center; white-space:nowrap;">
                    <button class="btn btn-sm btn-ghost text-primary" onclick="window.showVehicleReturnDetail('${o.id}')">👁️ معاينة</button>
                    <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printVehicleReturnDetail('${o.id}')">🖨️ طباعة</button>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.showVehicleReturnDetail=async e=>{const t=b.find(n=>n.id===e);if(!t)return;document.getElementById("vehicle-return-detail-title").textContent=`🔄 إذن استلام مرتجع سيارة: ${t.returnNumber||e}`;const o=t.lines||[],s=document.getElementById("vehicle-return-detail-body");s.innerHTML=`
    <div class="grid-3 gap-12 mb-16" style="background:var(--bg-2); padding:12px 16px; border-radius:8px; border:1px solid var(--border-soft);">
      <div><span class="dim" style="font-size:11px;">رقم السند:</span> <strong class="mono font-bold text-primary">${t.returnNumber||e}</strong></div>
      <div><span class="dim" style="font-size:11px;">تاريخ الاستلام:</span> <strong class="mono">${t.date}</strong></div>
      <div><span class="dim" style="font-size:11px;">السائق / المندوب:</span> <strong>${t.driver||"—"}</strong></div>
      <div><span class="dim" style="font-size:11px;">سيارة التوزيع:</span> <strong>${t.fromWarehouseName}</strong></div>
      <div><span class="dim" style="font-size:11px;">المستودع المستقبل:</span> <strong>${t.toWarehouseName}</strong></div>
      <div><span class="dim" style="font-size:11px;">ملاحظات:</span> <strong>${t.notes||"—"}</strong></div>
    </div>

    <h4 style="margin:0 0 10px 0; font-size:13px; font-weight:700;">الأصناف المرتجعة وأسبابها (${o.length} أصناف):</h4>
    <div class="table-container mb-16" style="border:1px solid var(--border-soft); border-radius:8px;">
      <table class="data-dense" style="width:100%;">
        <thead><tr><th>#</th><th>الرمز</th><th>اسم الصنف</th><th style="text-align:center;">الكمية المرتجعة</th><th>سبب الارتجاع</th></tr></thead>
        <tbody>
          ${o.map((n,i)=>`
            <tr>
              <td>${i+1}</td>
              <td class="mono font-bold text-dim">${n.sku||"—"}</td>
              <td><strong>${z(n)}</strong></td>
              <td class="mono font-bold text-primary" style="text-align:center; font-size:13px;">${u(n.qty)}</td>
              <td><span class="badge info font-bold">${n.reason||"فائض"}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;const a=document.getElementById("vehicle-return-detail-actions");a.innerHTML=`
    <button class="btn btn-secondary" onclick="window.printVehicleReturnDetail('${e}')">🖨️ طباعة إذن الاستلام</button>
  `,openModal("vehicle-return-detail-modal")};window.printVehicleReturnDetail=async e=>{const t=b.find(d=>d.id===e);if(!t)return;const o=t.lines||[],s=`
    <div class="meta-item"><div class="meta-label">رقم إذن استلام المرتجع:</div><div class="meta-val mono font-bold text-primary">${t.returnNumber||e}</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ الاستلام:</div><div class="meta-val mono">${t.date}</div></div>
    <div class="meta-item"><div class="meta-label">المندوب / السائق المسلّم:</div><div class="meta-val"><strong>${t.driver||"—"}</strong></div></div>
    <div class="meta-item"><div class="meta-label">سيارة التوزيع:</div><div class="meta-val">${t.fromWarehouseName}</div></div>
    <div class="meta-item"><div class="meta-label">المستودع المستقبل:</div><div class="meta-val"><strong>${t.toWarehouseName}</strong></div></div>
    <div class="meta-item"><div class="meta-label">البيان:</div><div class="meta-val">${t.notes||"—"}</div></div>
  `,a=`
    <table class="data-table">
      <thead>
        <tr>
          <th style="width:30px;">#</th>
          <th style="width:90px;">الرمز</th>
          <th>اسم الصنف المرتجع</th>
          <th style="width:110px; text-align:center;">الكمية المرتجعة</th>
          <th style="width:140px;">سبب الارتجاع والحالة</th>
        </tr>
      </thead>
      <tbody>
        ${o.map((d,l)=>`
          <tr>
            <td style="text-align:center;">${l+1}</td>
            <td class="mono font-bold" style="text-align:center;">${d.sku||"—"}</td>
            <td><strong>${z(d)}</strong></td>
            <td class="mono font-bold" style="text-align:center; font-size:13px;">${u(d.qty)}</td>
            <td style="font-size:11px;">${d.reason||"فائض سليم"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `,i=V({title:`إذن استلام مرتجع بضاعة من سيارة توزيع #${t.returnNumber||e}`,docBadge:'<span class="doc-badge good">إذن استلام مرتجع رسمي</span>',metaHtml:s,contentHtml:a,signaturesHtml:`
    <div class="sig-box">
      <div class="sig-role">أمين المستودع (المستلم)</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">المندوب / السائق (المسلّم)</div>
      <div class="sig-name">التوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">مسؤول حركة المبيعات</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
  `,footerNotes:"تم فحص المرتجع وإعادته للأرصدة المستودعية الرسمية وتفريغ عهدة السيارة."});window.printOpsDocument(i,`VR-${t.returnNumber||e}`)};window.addAssemblyComponent=()=>{const e=document.getElementById("asm-component-sel"),t=parseFloat(document.getElementById("asm-component-qty").value)||0;if(!e.value||t<=0){showToast("اختر مكوناً وحدد كمية صحيحة","warning");return}const o=k.find(s=>s.id===e.value);if(W.some(s=>s.productId===e.value)){showToast("المكون مضاف بالفعل لقائمة المواد","warning");return}W.push({productId:e.value,sku:o?.sku||"",name:o?.name||"مكون",qtyPerUnit:t}),Nt(),e.value="",document.getElementById("asm-component-qty").value="1"};function Nt(){const e=document.getElementById("asm-lines-tbody");if(!e)return;const t=parseFloat(document.getElementById("asm-qty")?.value)||1;e.innerHTML=W.map((o,s)=>`
    <tr>
      <td><strong>${o.sku} - ${o.name}</strong></td>
      <td class="mono font-bold">${u(o.qtyPerUnit)}</td>
      <td class="mono font-bold text-primary">${u(o.qtyPerUnit*t)}</td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="asmComponents.splice(${s},1); renderAsmLines();">✕</button></td>
    </tr>
  `).join("")}window.removeAsmLine=e=>{W.splice(e,1),Nt()};window.saveAssembly=async()=>{const e=document.getElementById("asm-error");e.classList.add("hidden");const t=document.getElementById("asm-type").value,o=document.getElementById("asm-product").value,s=parseFloat(document.getElementById("asm-qty").value)||0,a=document.getElementById("asm-wh").value,n=document.getElementById("asm-date").value||w();if(!o||s<=0||!a||!W.length){e.textContent="يرجى تعبئة الحقول الإلزامية وإضافة مكون واحد على الأقل",e.classList.remove("hidden");return}const i=document.getElementById("save-asm-btn");i.disabled=!0;try{const d=k.find(c=>c.id===o),l=E.find(c=>c.id===a),r=`ASM-${n.replace(/-/g,"")}-${Math.floor(1e3+Math.random()*9e3)}`,m=await _(I.productAssemblies(),{assemblyNumber:r,number:r,type:t,productId:o,productName:d?.name||"حزمة",sku:d?.sku||"",qty:s,warehouseId:a,warehouseName:l?.name||"المستودع الرئيسي",date:n,components:W.map(c=>({...c,totalQty:c.qtyPerUnit*s})),createdAt:new Date().toISOString()});if(t==="assembly"){for(const c of W)await D(a,c.productId,-(c.qtyPerUnit*s),{type:"assembly_out",sourceType:"productAssembly",sourceId:m,note:`صرف للتجميع: ${d?.name}`});await D(a,o,s,{type:"assembly_in",sourceType:"productAssembly",sourceId:m,note:`وارد إنتاج وتجميع: ${r}`})}else{await D(a,o,-s,{type:"disassembly_out",sourceType:"productAssembly",sourceId:m,note:`صرف للتفكيك: ${r}`});for(const c of W)await D(a,c.productId,c.qtyPerUnit*s,{type:"disassembly_in",sourceType:"productAssembly",sourceId:m,note:`وارد ناتج تفكيك: ${d?.name}`})}showToast("تم تنفيذ وتوثيق عملية التجميع وتحديث الأرصدة بنجاح","success"),closeModal("asm-modal"),switchOpsSubModule("assemble")}catch(d){e.textContent=d.message,e.classList.remove("hidden")}finally{i.disabled=!1}};function Bt(e,t){if(t.length===0){e.innerHTML=`
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">⚙️</div>
        <div style="font-size:16px; font-weight:700;">لا توجد عمليات تجميع أو تفكيك</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لتنفيذ أمر تجميع حزمة أو تفكيكها</p>
      </div>`;return}e.innerHTML=`
    <div class="card" style="border:1px solid var(--border-soft); border-radius:10px; overflow:hidden;">
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr>
              <th>رقم الأمر</th>
              <th>التاريخ</th>
              <th>النوع</th>
              <th>الصنف الرئيسي (الحزمة)</th>
              <th>الكمية المنفذة</th>
              <th>المستودع</th>
              <th>المكونات الفرعية</th>
              <th class="no-print" style="text-align:center;">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(o=>{const a=(o.components||[]).map(n=>`${n.name} (${u(n.totalQty||n.qtyPerUnit)})`).join("، ");return`
                <tr>
                  <td class="mono font-bold text-primary">${o.assemblyNumber||o.number||o.id}</td>
                  <td>${o.date}</td>
                  <td>
                    <span class="badge ${o.type==="assembly"?"good":"warn"} font-bold">
                      ${o.type==="assembly"?"⚙️ تجميع حزمة":"🔧 تفكيك حزمة"}
                    </span>
                  </td>
                  <td><strong>${o.productName}</strong> <span class="mono dim">(${o.sku})</span></td>
                  <td class="mono font-bold text-primary" style="font-size:13px;">${u(o.qty)}</td>
                  <td>${o.warehouseName}</td>
                  <td style="max-width:300px;">${a||"—"}</td>
                  <td class="no-print" style="text-align:center; white-space:nowrap;">
                    <button class="btn btn-sm btn-ghost text-primary" onclick="window.showAssemblyDetail('${o.id}')">👁️ معاينة</button>
                    <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printAssemblyDetail('${o.id}')">🖨️ طباعة</button>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.showAssemblyDetail=async e=>{const t=b.find(n=>n.id===e);if(!t)return;document.getElementById("assembly-detail-title").textContent=`⚙️ أمر تجميع / تفكيك: ${t.assemblyNumber||e}`;const o=t.components||[],s=document.getElementById("assembly-detail-body");s.innerHTML=`
    <div class="grid-3 gap-12 mb-16" style="background:var(--bg-2); padding:12px 16px; border-radius:8px; border:1px solid var(--border-soft);">
      <div><span class="dim" style="font-size:11px;">رقم الأمر:</span> <strong class="mono font-bold text-primary">${t.assemblyNumber||e}</strong></div>
      <div><span class="dim" style="font-size:11px;">تاريخ العملية:</span> <strong class="mono">${t.date}</strong></div>
      <div><span class="dim" style="font-size:11px;">نوع المعاملة:</span> <strong>${t.type==="assembly"?"تجميع حزمة":"تفكيك حزمة"}</strong></div>
      <div><span class="dim" style="font-size:11px;">الصنف الرئيسي:</span> <strong>${t.productName} (${t.sku})</strong></div>
      <div><span class="dim" style="font-size:11px;">الكمية المنتجة:</span> <strong class="mono font-bold text-primary" style="font-size:13px;">${u(t.qty)}</strong></div>
      <div><span class="dim" style="font-size:11px;">المستودع:</span> <strong>${t.warehouseName}</strong></div>
    </div>

    <h4 style="margin:0 0 10px 0; font-size:13px; font-weight:700;">المكونات الفرعية وقائمة المواد (BOM):</h4>
    <div class="table-container mb-16" style="border:1px solid var(--border-soft); border-radius:8px;">
      <table class="data-dense" style="width:100%;">
        <thead><tr><th>#</th><th>رمز المكون</th><th>اسم المكون الفرعي</th><th style="text-align:center;">لكل حزمة</th><th style="text-align:center;">إجمالي المستهلك</th></tr></thead>
        <tbody>
          ${o.map((n,i)=>`
            <tr>
              <td>${i+1}</td>
              <td class="mono font-bold text-dim">${n.sku||"—"}</td>
              <td><strong>${n.name}</strong></td>
              <td class="mono font-bold" style="text-align:center;">${u(n.qtyPerUnit)}</td>
              <td class="mono font-bold text-primary" style="text-align:center; font-size:13px;">${u(n.totalQty||n.qtyPerUnit*t.qty)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;const a=document.getElementById("assembly-detail-actions");a.innerHTML=`
    <button class="btn btn-secondary" onclick="window.printAssemblyDetail('${e}')">🖨️ طباعة أمر التجميع</button>
  `,openModal("assembly-detail-modal")};window.printAssemblyDetail=async e=>{const t=b.find(d=>d.id===e);if(!t)return;const o=t.components||[],s=`
    <div class="meta-item"><div class="meta-label">رقم أمر التشغيل:</div><div class="meta-val mono font-bold text-primary">${t.assemblyNumber||e}</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ التشغيل:</div><div class="meta-val mono">${t.date}</div></div>
    <div class="meta-item"><div class="meta-label">نوع العملية:</div><div class="meta-val">${t.type==="assembly"?"تجميع حزمة جديدة":"تفكيك حزمة لمكوناتها"}</div></div>
    <div class="meta-item"><div class="meta-label">الصنف الرئيسي المستهدف:</div><div class="meta-val"><strong>${t.productName} (${t.sku})</strong></div></div>
    <div class="meta-item"><div class="meta-label">الكمية المنفذة:</div><div class="meta-val mono font-bold">${u(t.qty)}</div></div>
    <div class="meta-item"><div class="meta-label">مستودع التشغيل:</div><div class="meta-val">${t.warehouseName}</div></div>
  `,a=`
    <table class="data-table">
      <thead>
        <tr>
          <th style="width:30px;">#</th>
          <th style="width:90px;">الرمز</th>
          <th>اسم المكون الفرعي</th>
          <th style="width:110px; text-align:center;">المعيار لكل وحدة</th>
          <th style="width:130px; text-align:center;">إجمالي الكمية المصروفة</th>
        </tr>
      </thead>
      <tbody>
        ${o.map((d,l)=>`
          <tr>
            <td style="text-align:center;">${l+1}</td>
            <td class="mono font-bold" style="text-align:center;">${d.sku||"—"}</td>
            <td><strong>${d.name}</strong></td>
            <td class="mono font-bold" style="text-align:center;">${u(d.qtyPerUnit)}</td>
            <td class="mono font-bold" style="text-align:center; font-size:12px;">${u(d.totalQty||d.qtyPerUnit*t.qty)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `,i=V({title:`أمر تشغيل وتجميع منتجات #${t.assemblyNumber||e}`,docBadge:'<span class="doc-badge good">أمر تشغيل معتمد</span>',metaHtml:s,contentHtml:a,signaturesHtml:`
    <div class="sig-box">
      <div class="sig-role">مسؤول التعبئة والإنتاج</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">أمين المستودع</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">اعتماد إدارة العمليات</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
  `,footerNotes:"تم مطابقة مكونات الحزمة والتأكد من مطابقة التغليف لبطاقة المنتج الغذائي."});window.printOpsDocument(i,`ASM-${t.assemblyNumber||e}`)};function St(){const e=document.getElementById("adj-product-search"),t=document.getElementById("adj-product-results");document.getElementById("adj-product"),document.getElementById("adj-cost"),!(!e||!t)&&(e.addEventListener("input",()=>{const o=e.value.trim().toLowerCase();if(o.length===0){t.classList.add("hidden"),t.innerHTML="";return}const s=k.filter(a=>{const n=(a.name||"").toLowerCase(),i=(a.sku||"").toLowerCase(),d=(a.barcode||"").toLowerCase();return n.includes(o)||i.includes(o)||d.includes(o)}).slice(0,10);if(s.length===0){t.innerHTML='<div style="padding:10px; color:var(--text-3); font-size:12px;">لا توجد أصناف مطابقة</div>',t.classList.remove("hidden");return}t.innerHTML=s.map(a=>`
      <div class="autocomplete-item" style="padding:8px 12px; cursor:pointer; border-bottom:1px solid var(--border-soft); font-size:13px;"
           onclick="window.selectAdjProduct('${a.id}', '${a.name.replace(/'/g,"\\'")}', '${a.sku||""}', ${a.costPrice||0})">
        <strong>${a.sku?a.sku+" - ":""}${a.name}</strong>
        <div style="font-size:11px; color:var(--text-3);">التكلفة: ${v(a.costPrice||0)}</div>
      </div>
    `).join(""),t.classList.remove("hidden")}),document.addEventListener("click",o=>{!e.contains(o.target)&&!t.contains(o.target)&&t.classList.add("hidden")}))}window.selectAdjProduct=(e,t,o,s)=>{const a=document.getElementById("adj-product-search"),n=document.getElementById("adj-product"),i=document.getElementById("adj-cost"),d=document.getElementById("adj-product-results");a&&(a.value=`${o?o+" - ":""}${t}`),n&&(n.value=e),i&&(i.value=(s||0).toFixed(2)),d&&d.classList.add("hidden")};window.addAdjLine=()=>{const e=document.getElementById("adj-product"),t=document.getElementById("adj-product-search"),o=document.getElementById("adj-qty"),s=document.getElementById("adj-cost"),a=e?e.value:"",n=parseFloat(o?o.value:0),i=parseFloat(s?s.value:0);if(!a){showToast("يرجى اختيار صنف من نتائج البحث أولاً","warning");return}if(!n||n<=0){showToast("يرجى إدخال كمية صحيحة أكبر من الصفر","warning");return}if(isNaN(i)||i<0){showToast("يرجى إدخال تكلفة وحدة صحيحة","warning");return}const d=k.find(c=>c.id===a),l=d?d.sku:"",r=d?d.name:t.value,m=window._adjLines.findIndex(c=>c.productId===a);m>=0?(window._adjLines[m].qty+=n,window._adjLines[m].totalCost=window._adjLines[m].qty*window._adjLines[m].cost):window._adjLines.push({productId:a,sku:l,name:r,qty:n,cost:i,totalCost:n*i}),e&&(e.value=""),t&&(t.value=""),o&&(o.value="1"),s&&(s.value=""),lt(),showToast("تمت إضافة الصنف لقائمة التسوية","success")};window.removeAdjLine=e=>{window._adjLines.splice(e,1),lt()};function lt(){const e=document.getElementById("adj-items-tbody"),t=document.getElementById("adj-total-cost-label");if(!e)return;if(window._adjLines.length===0){e.innerHTML='<tr><td colspan="6" style="text-align:center; color:var(--text-3); padding:16px;">لم يتم إضافة أي أصناف بعد. ابحث عن صنف أعلاه واضغط "إضافة".</td></tr>',t&&(t.textContent="0.00 ر.س");return}let o=0;e.innerHTML=window._adjLines.map((s,a)=>(o+=s.totalCost,`
      <tr>
        <td class="mono font-bold text-dim">${s.sku||"—"}</td>
        <td><strong>${s.name}</strong></td>
        <td class="mono font-bold text-primary" style="text-align:center;">${u(s.qty)}</td>
        <td class="mono" style="text-align:left;">${v(s.cost)}</td>
        <td class="mono font-bold" style="text-align:left;">${v(s.totalCost)}</td>
        <td style="text-align:center;">
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.removeAdjLine(${a})" title="حذف الصنف">✕</button>
        </td>
      </tr>
    `)).join(""),t&&(t.textContent=v(o))}window.saveAdjustment=async()=>{const e=document.getElementById("adj-error");e.classList.add("hidden");const t=document.getElementById("adj-type").value,o=document.getElementById("adj-wh").value,s=document.getElementById("adj-date").value||w(),a=document.getElementById("adj-notes").value.trim();if(window._adjLines.length===0){e.textContent="يرجى إضافة صنف واحد على الأقل للمعاملة",e.classList.remove("hidden");return}if(!a){e.textContent="يرجى كتابة البيان / أسباب المعاملة بشكل واضح",e.classList.remove("hidden");return}const n=document.getElementById("save-adj-btn");n.disabled=!0;try{const i=!!window._editingAdjId;let d=window._editingAdjId;const l=E.find(g=>g.id===o),r=window._adjLines.reduce((g,h)=>g+h.totalCost,0),c={damage:"إعدام سلع تالفة",add:"تسوية إضافة",deduct:"تسوية خصم","return-damaged":"مرتجع تالف للمورد",expired:"إعدام منتهي الصلاحية",donation:"تبرعات وهبات"}[t]||"تسوية مخزنية";if(i)await nt("inventoryAdjustments",d,{type:t,warehouseId:o,warehouseName:l?l.name:"المستودع",date:s,notes:a,lines:window._adjLines,totalCost:r,updatedAt:new Date().toISOString()}),showToast("تم تحديث بيانات المعاملة بنجاح","success");else{d=await _(I.inventoryAdjustments(),{type:t,warehouseId:o,warehouseName:l?l.name:"المستودع",date:s,notes:a,lines:window._adjLines,totalCost:r,createdAt:new Date().toISOString()});const g=t==="damage"||t==="deduct"||t==="return-damaged"||t==="expired"||t==="donation";for(const x of window._adjLines){const p=g?-x.qty:x.qty;await D(o,x.productId,p,{type:g?"adjustment_out":"adjustment_in",sourceType:"inventoryAdjustment",sourceId:d,note:`${c}: ${a}`})}const h=T.find(x=>x.code==="1-1-4-1-01")||T.find(x=>x.code==="1-1-4-1")||{id:"INV_STOCK",code:"1-1-4-1-01",name:"مخزون مستودع المواد الغذائية"};let f=T.find(x=>x.code==="5-2-2")||T.find(x=>x.code==="5-2")||{id:"DAMAGE_EXPENSE",code:"5-2-2",name:"خسائر وتوالف مخزنية"};g?await st({date:s,description:`${c} لعدد ${window._adjLines.length} أصناف - ${a}`,sourceType:"inventoryAdjustment",sourceId:d,lines:[{accountId:f.id,accountCode:f.code,accountName:f.name,debit:r,credit:0,note:c},{accountId:h.id,accountCode:h.code,accountName:h.name,debit:0,credit:r,note:"تخفيض المخزون"}]}):(f=T.find(x=>x.code==="4-2-1")||T.find(x=>x.code==="4-2")||{id:"SURPLUS_REV",code:"4-2-1",name:"إيرادات فروق وفائض جرد"},await st({date:s,description:`تسوية إضافة لعدد ${window._adjLines.length} أصناف - ${a}`,sourceType:"inventoryAdjustment",sourceId:d,lines:[{accountId:h.id,accountCode:h.code,accountName:h.name,debit:r,credit:0,note:"زيادة المخزون"},{accountId:f.id,accountCode:f.code,accountName:f.name,debit:0,credit:r,note:"فائض تسوية"}]})),showToast("تم حفظ المعاملة وتحديث المخزون وإنشاء القيد المحاسبي بنجاح","success")}closeModal("adj-modal"),switchOpsSubModule("adjust")}catch(i){e.textContent=i.message,e.classList.remove("hidden")}finally{n.disabled=!1}};function Lt(e,t){if(t.length===0){e.innerHTML=`
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">⚖️</div>
        <div style="font-size:16px; font-weight:700;">لا توجد تسويات مسجلة</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لتسجيل تسوية إضافة أو خصم أو إتلاف</p>
      </div>`;return}const o={damage:"إعدام تالف",add:"تسوية إضافة (+)",deduct:"تسوية خصم (-)","return-damaged":"مرتجع تالف للمورد",expired:"إعدام منتهي الصلاحية",donation:"تبرعات وهبات"};e.innerHTML=`
    <div class="card" style="border:1px solid var(--border-soft); border-radius:10px; overflow:hidden;">
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>نوع المعاملة</th>
              <th>الأصناف والتفاصيل</th>
              <th style="text-align:left;">إجمالي التكلفة</th>
              <th>المستودع</th>
              <th>البيان / أسباب العملية</th>
              <th class="no-print" style="text-align:center;">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(s=>{const n=(s.lines||(s.productId?[{productId:s.productId,sku:s.sku||"",name:s.productName||"صنف",qty:s.qty||1,cost:s.costPrice||0,totalCost:(s.qty||1)*(s.costPrice||0)}]:[])).map(d=>`${z(d)} (${u(d.qty)})`).join("، "),i=s.type==="add"?"good":s.type==="damage"||s.type==="expired"?"bad":"warn";return`
                <tr>
                  <td class="mono font-bold">${s.date}</td>
                  <td><span class="badge ${i} font-bold">${o[s.type]||s.type}</span></td>
                  <td style="max-width:300px;">${n||"—"}</td>
                  <td class="mono font-bold text-good" style="text-align:left;">${v(s.totalCost||0)}</td>
                  <td><strong>${s.warehouseName}</strong></td>
                  <td>${s.notes||"—"}</td>
                  <td class="no-print" style="text-align:center; white-space:nowrap;">
                    <button class="btn btn-sm btn-ghost text-primary" onclick="window.showAdjDetail('${s.id}')">👁️ معاينة</button>
                    <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printAdjDetail('${s.id}')">🖨️ طباعة</button>
                    <button class="btn btn-sm btn-ghost text-warn" onclick="window.editAdjustment('${s.id}')">✏️ تعديل</button>
                    <button class="btn btn-sm btn-ghost text-bad" onclick="window.deleteAdjustment('${s.id}')">🗑️ حذف</button>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.showAdjDetail=async e=>{const t=b.find(n=>n.id===e);if(!t)return;document.getElementById("adj-detail-title").textContent=`⚖️ تفاصيل تسوية مخزنية #${e.slice(0,8)}`;const o=t.lines||[],s=document.getElementById("adj-detail-body");s.innerHTML=`
    <div class="grid-3 gap-12 mb-16" style="background:var(--bg-2); padding:12px 16px; border-radius:8px; border:1px solid var(--border-soft);">
      <div><span class="dim" style="font-size:11px;">تاريخ المعاملة:</span> <strong class="mono font-bold text-primary">${t.date}</strong></div>
      <div><span class="dim" style="font-size:11px;">نوع المعاملة:</span> <strong>${t.type}</strong></div>
      <div><span class="dim" style="font-size:11px;">المستودع:</span> <strong>${t.warehouseName}</strong></div>
      <div><span class="dim" style="font-size:11px;">إجمالي التكلفة:</span> <strong class="mono font-bold text-good">${v(t.totalCost||0)}</strong></div>
      <div style="grid-column:span 2;"><span class="dim" style="font-size:11px;">البيان:</span> <strong>${t.notes||"—"}</strong></div>
    </div>

    <h4 style="margin:0 0 10px 0; font-size:13px; font-weight:700;">الأصناف المتأثرة بالتسوية (${o.length} أصناف):</h4>
    <div class="table-container mb-16" style="border:1px solid var(--border-soft); border-radius:8px;">
      <table class="data-dense" style="width:100%;">
        <thead><tr><th>#</th><th>الرمز</th><th>اسم الصنف</th><th style="text-align:center;">الكمية</th><th style="text-align:left;">تكلفة الوحدة</th><th style="text-align:left;">إجمالي التكلفة</th></tr></thead>
        <tbody>
          ${o.map((n,i)=>`
            <tr>
              <td>${i+1}</td>
              <td class="mono font-bold text-dim">${n.sku||"—"}</td>
              <td><strong>${z(n)}</strong></td>
              <td class="mono font-bold text-primary" style="text-align:center; font-size:13px;">${u(n.qty)}</td>
              <td class="mono" style="text-align:left;">${v(n.cost||0)}</td>
              <td class="mono font-bold" style="text-align:left;">${v(n.totalCost||n.qty*(n.cost||0))}</td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr style="font-weight:bold; background:var(--bg-hover);">
            <td colspan="5" style="text-align:right;">الإجمالي الكلي:</td>
            <td class="mono font-bold text-good" style="text-align:left;">${v(t.totalCost||0)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;const a=document.getElementById("adj-detail-actions");a.innerHTML=`
    <button class="btn btn-secondary" onclick="window.printAdjDetail('${e}')">🖨️ طباعة سند التسوية</button>
  `,openModal("adj-detail-modal")};window.printAdjDetail=async e=>{const t=b.find(d=>d.id===e)||(await j(M(L,`companies/${C}/inventoryAdjustments`,e))).data();if(!t)return;const o=t.lines||[],s=`
    <div class="meta-item"><div class="meta-label">رقم سند التسوية:</div><div class="meta-val mono font-bold text-primary">ADJ-${e.slice(0,8)}</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ التسوية:</div><div class="meta-val mono">${t.date}</div></div>
    <div class="meta-item"><div class="meta-label">نوع العملية:</div><div class="meta-val">${t.type}</div></div>
    <div class="meta-item"><div class="meta-label">المستودع المتأثر:</div><div class="meta-val">${t.warehouseName}</div></div>
    <div class="meta-item"><div class="meta-label">إجمالي التكلفة المالية:</div><div class="meta-val mono font-bold">${v(t.totalCost||0)}</div></div>
    <div class="meta-item"><div class="meta-label">البيان والأسباب:</div><div class="meta-val">${t.notes||"—"}</div></div>
  `,a=`
    <table class="data-table">
      <thead>
        <tr>
          <th style="width:30px;">#</th>
          <th style="width:90px;">الرمز</th>
          <th>اسم الصنف</th>
          <th style="width:90px; text-align:center;">كمية التسوية</th>
          <th style="width:110px; text-align:left;">تكلفة الوحدة</th>
          <th style="width:120px; text-align:left;">إجمالي القيمة</th>
        </tr>
      </thead>
      <tbody>
        ${o.map((d,l)=>`
          <tr>
            <td style="text-align:center;">${l+1}</td>
            <td class="mono font-bold" style="text-align:center;">${d.sku||"—"}</td>
            <td><strong>${z(d)}</strong></td>
            <td class="mono font-bold" style="text-align:center; font-size:12px;">${u(d.qty)}</td>
            <td class="mono" style="text-align:left;">${v(d.cost||0)}</td>
            <td class="mono font-bold" style="text-align:left;">${v(d.totalCost||d.qty*(d.cost||0))}</td>
          </tr>
        `).join("")}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" style="text-align:right;">الإجمالي العام لسند التسوية:</td>
          <td class="mono font-bold" style="text-align:left;">${v(t.totalCost||0)}</td>
        </tr>
      </tfoot>
    </table>
  `,i=V({title:`سند تسوية وإهلاك مخزني رسمي #ADJ-${e.slice(0,8)}`,docBadge:'<span class="doc-badge warn">سند تسوية معتمد</span>',metaHtml:s,contentHtml:a,signaturesHtml:`
    <div class="sig-box">
      <div class="sig-role">أمين المستودع المسؤول</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">لجنة الفحص والإتلاف</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">اعتماد الإدارة المالية</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
  `,footerNotes:t.notes||"تمت التسوية بناءً على محضر الجرد الفعلي وقرار اللجنة المختصة."});window.printOpsDocument(i,`ADJ-${e.slice(0,8)}`)};window.editAdjustment=async e=>{const t=b.find(s=>s.id===e);if(!t)return;window._editingAdjId=e,document.getElementById("adj-type").value=t.type||"damage",document.getElementById("adj-wh").value=t.warehouseId||"",document.getElementById("adj-date").value=t.date||w(),document.getElementById("adj-notes").value=t.notes||"",document.getElementById("adj-modal-title").textContent="✏️ تعديل معاملة التسوية المخزنية",t.lines&&Array.isArray(t.lines)?window._adjLines=t.lines.map(s=>({...s})):t.productId?window._adjLines=[{productId:t.productId,sku:t.sku||"",name:t.productName||"صنف",qty:t.qty||1,cost:t.costPrice||0,totalCost:(t.qty||1)*(t.costPrice||0)}]:window._adjLines=[],lt();const o=document.getElementById("save-adj-btn");o&&(o.textContent="💾 تحديث بيانات المعاملة"),openModal("adj-modal")};window.deleteAdjustment=async e=>{if(confirm("تحذير: هل أنت متأكد من حذف هذه التسوية نهائياً؟"))try{await dt(M(L,`companies/${C}/inventoryAdjustments`,e)),showToast("تم حذف التسوية بنجاح","success"),switchOpsSubModule("adjust")}catch(t){showToast(t.message,"error")}};function mt(){const e=document.getElementById("sc-lines-tbody");if(!e||!window.spotCountLines||!window.spotCountLines.length)return;e.querySelectorAll("tr[data-idx]").forEach(o=>{const s=parseInt(o.getAttribute("data-idx"),10);if(isNaN(s)||!window.spotCountLines[s])return;const a=o.querySelectorAll("input.sc-actual");a.length===1?(window.spotCountLines[s].actualQty1=parseFloat(a[0].value)||0,window.spotCountLines[s].diffQty1=window.spotCountLines[s].actualQty1-window.spotCountLines[s].bookQty1):a.length>=2&&(window.spotCountLines[s].actualQty1=parseFloat(a[0].value)||0,window.spotCountLines[s].diffQty1=window.spotCountLines[s].actualQty1-window.spotCountLines[s].bookQty1,window.spotCountLines[s].actualQty2=parseFloat(a[1].value)||0,window.spotCountLines[s].diffQty2=window.spotCountLines[s].actualQty2-window.spotCountLines[s].bookQty2)})}window.filterSpotCountTable=e=>{const t=(e!==void 0?e:document.getElementById("sc-search-input")?.value||"").trim().toLowerCase(),o=document.getElementById("sc-filter-mode")?.value||"all",s=document.getElementById("sc-lines-tbody");if(!s)return;const a=s.querySelectorAll("tr[data-idx]");let n=0;a.forEach(d=>{const l=parseInt(d.getAttribute("data-idx"),10),r=window.spotCountLines[l];if(!r)return;const m=!t||(r.productName||"").toLowerCase().includes(t)||(r.sku||"").toLowerCase().includes(t);let c=!0;o==="has-stock"?c=r.bookQty1>0||r.bookQty2>0:o==="diff-only"&&(c=r.diffQty1!==0||r.diffQty2!==0),m&&c?(d.style.display="",n++):d.style.display="none"});const i=document.getElementById("sc-count-badge");i&&(i.textContent=`المعروض: ${n} من ${window.spotCountLines.length}`)};window.loadSpotCountItems=async()=>{const e=document.getElementById("sc-wh")?.value,t=document.getElementById("sc-wh2")?.value;if(!e){showToast("يرجى اختيار المخزن أولاً","warning");return}const o=document.getElementById("load-sc-btn");o&&(o.disabled=!0,o.innerHTML="⏳ جاري تحميل الأرصدة...");try{(!k||!k.length)&&(k=await J(I.products())),(!E||!E.length)&&(E=await J(I.warehouses()));const s=await Q(I.stockByWarehouse()),a={},n={};s.docs.forEach(p=>{const y=p.data()||{},S=p.id||"",N=parseFloat(y.qty!==void 0?y.qty:y.quantity!==void 0?y.quantity:y.totalQty)||0;if(y.warehouseId===e||S.startsWith(`${e}_`)){const A=y.productId||S.replace(`${e}_`,"");A&&(a[A]=N)}if(t&&(y.warehouseId===t||S.startsWith(`${t}_`))){const A=y.productId||S.replace(`${t}_`,"");A&&(n[A]=N)}});const i=E.find(p=>p.id===e);(i?.type==="Main"||i?.name?.includes("رئيس")||i?.name?.includes("الرئيسي")||i?.name?.includes("الرئيسى"))&&k.forEach(p=>{if(a[p.id]===void 0){const y=parseFloat(p.stockQty!==void 0?p.stockQty:p.totalQty!==void 0?p.totalQty:p.quantity!==void 0?p.quantity:p.stock!==void 0?p.stock:0)||0;y>0&&(a[p.id]=y)}});const l=t?E.find(p=>p.id===t):null;l&&(l.type==="Main"||l.name?.includes("رئيس")||l.name?.includes("الرئيسي")||l.name?.includes("الرئيسى"))&&k.forEach(p=>{if(n[p.id]===void 0){const y=parseFloat(p.stockQty!==void 0?p.stockQty:p.totalQty!==void 0?p.totalQty:p.quantity!==void 0?p.quantity:p.stock!==void 0?p.stock:0)||0;y>0&&(n[p.id]=y)}});const m=document.getElementById("sc-table-thead"),c=document.getElementById("sc-lines-tbody"),g=i?.name||"المخزن 1",h=l?l.name:"",f=k.filter(p=>p&&(p.name||p.sku)&&(!p.archived||(a[p.id]||0)>0||t&&(n[p.id]||0)>0)).sort((p,y)=>(p.sku||p.name||"").localeCompare(y.sku||y.name||"",void 0,{numeric:!0}));window.spotCountLines=f.map(p=>{const y=parseFloat(a[p.id])||0,S=t&&parseFloat(n[p.id])||0;return{productId:p.id,productName:p.name||p.nameAr||"صنف غير مسمى",sku:p.sku||"",unit:p.unit||"حبة",costPrice:parseFloat(p.costPrice||p.averageCost||p.purchasePrice)||0,bookQty1:y,actualQty1:y,diffQty1:0,bookQty2:S,actualQty2:S,diffQty2:0}}),t?(m.innerHTML=`
        <tr>
          <th>الصنف</th>
          <th colspan="3" style="text-align:center;background:#eff6ff;border-bottom:2px solid #3b82f6;">${g}</th>
          <th colspan="3" style="text-align:center;background:#f0fdf4;border-bottom:2px solid #22c55e;">${h}</th>
        </tr>
        <tr>
          <th>الاسم (الرمز)</th>
          <th style="background:#eff6ff;text-align:center;">دفتري</th>
          <th style="background:#eff6ff;text-align:center;">فعلي</th>
          <th style="background:#eff6ff;text-align:center;">الفرق</th>
          <th style="background:#f0fdf4;text-align:center;">دفتري</th>
          <th style="background:#f0fdf4;text-align:center;">فعلي</th>
          <th style="background:#f0fdf4;text-align:center;">الفرق</th>
        </tr>`,c.innerHTML=window.spotCountLines.map((p,y)=>`<tr data-idx="${y}">
        <td><strong>${p.productName}</strong> <span class="mono dim">(${p.sku||"—"})</span></td>
        <td class="mono font-bold" style="background:#eff6ff;text-align:center;">${u(p.bookQty1)}</td>
        <td style="background:#eff6ff;text-align:center;">
          <input type="number" step="any" class="input mono sm sc-actual" style="width:85px;font-weight:bold;text-align:center;" value="${p.actualQty1}"
            oninput="window.spotCountLines[${y}].actualQty1=parseFloat(this.value)||0; window.updateSCDiff1(${y}, this)" />
        </td>
        <td class="mono font-bold sc-diff-1" style="background:#eff6ff;text-align:center;">0</td>
        <td class="mono font-bold" style="background:#f0fdf4;text-align:center;">${u(p.bookQty2)}</td>
        <td style="background:#f0fdf4;text-align:center;">
          <input type="number" step="any" class="input mono sm sc-actual" style="width:85px;font-weight:bold;text-align:center;" value="${p.actualQty2}"
            oninput="window.spotCountLines[${y}].actualQty2=parseFloat(this.value)||0; window.updateSCDiff2(${y}, this)" />
        </td>
        <td class="mono font-bold sc-diff-2" style="background:#f0fdf4;text-align:center;">0</td>
      </tr>`).join("")):(m.innerHTML=`
        <tr>
          <th>الصنف</th>
          <th style="text-align:center;">الكمية الدفترية</th>
          <th style="text-align:center;">الكمية الفعلية</th>
          <th style="text-align:center;">الفرق</th>
        </tr>`,c.innerHTML=window.spotCountLines.map((p,y)=>`<tr data-idx="${y}">
        <td><strong>${p.productName}</strong> <span class="mono dim">(${p.sku||"—"})</span></td>
        <td class="mono font-bold" style="text-align:center;">${u(p.bookQty1)}</td>
        <td style="text-align:center;">
          <input type="number" step="any" class="input mono sm sc-actual" style="width:95px;font-weight:bold;text-align:center;" value="${p.actualQty1}"
            oninput="window.spotCountLines[${y}].actualQty1=parseFloat(this.value)||0; window.updateSCDiff1(${y}, this)" />
        </td>
        <td class="mono font-bold sc-diff-1" style="text-align:center;">0</td>
      </tr>`).join(""));const x=document.getElementById("save-sc-btn");x&&(x.disabled=!1),window.filterSpotCountTable(),showToast(`تم تحميل ${window.spotCountLines.length} صنف بأرصدتها الدفترية الحقيقية بنجاح`,"success")}catch(s){console.error("Error loading spot count items:",s),showToast("خطأ في تحميل أصناف المخزن: "+s.message,"error")}finally{o&&(o.disabled=!1,o.innerHTML="📥 تحميل أصناف المخزن")}};window.updateSCDiff1=(e,t)=>{const o=window.spotCountLines[e];if(!o)return;const s=o.actualQty1-o.bookQty1;o.diffQty1=s;const a=t.closest("tr").querySelector(".sc-diff-1");a&&(a.textContent=s!==0?s>0?`+${u(s)}`:u(s):"0",a.className=`mono font-bold sc-diff-1 ${s<0?"text-bad":s>0?"text-good":""}`)};window.updateSCDiff2=(e,t)=>{const o=window.spotCountLines[e];if(!o)return;const s=o.actualQty2-o.bookQty2;o.diffQty2=s;const a=t.closest("tr").querySelector(".sc-diff-2");a&&(a.textContent=s!==0?s>0?`+${u(s)}`:u(s):"0",a.className=`mono font-bold sc-diff-2 ${s<0?"text-bad":s>0?"text-good":""}`)};window.printCurrentSpotCountDraft=async()=>{mt();const e=document.getElementById("sc-wh")?.value,t=document.getElementById("sc-wh2")?.value||"",o=document.getElementById("sc-date")?.value||w();if(!e){showToast("يرجى اختيار المخزن أولاً","warning");return}if((!window.spotCountLines||window.spotCountLines.length===0)&&await window.loadSpotCountItems(),!window.spotCountLines||window.spotCountLines.length===0){showToast("لا توجد أصناف في هذا المخزن للطباعة","warning");return}const s=E.find(i=>i.id===e),a=t?E.find(i=>i.id===t):null,n={id:"draft-"+Date.now(),isDraft:!0,warehouseId:e,warehouseName:s?.name||"المخزن 1",warehouseId2:t,warehouseName2:a?a.name:"",date:o,lines:window.spotCountLines};window._doPrintSpotCount(n)};window.exportCurrentSpotCountDraftExcel=async()=>{mt();const e=document.getElementById("sc-wh")?.value,t=document.getElementById("sc-wh2")?.value||"";if(document.getElementById("sc-date")?.value||w(),!e){showToast("يرجى اختيار المخزن أولاً","warning");return}if((!window.spotCountLines||window.spotCountLines.length===0)&&await window.loadSpotCountItems(),!window.spotCountLines||window.spotCountLines.length===0){showToast("لا توجد أصناف في هذا المخزن للتصدير","warning");return}const o=E.find(n=>n.id===e),s=t?E.find(n=>n.id===t):null,a={warehouseName:o?.name||"المخزن 1",warehouseId2:t,warehouseName2:s?s.name:"",lines:window.spotCountLines};await ut(a)};window.saveSpotCount=async()=>{mt();const e=document.getElementById("sc-wh").value,t=document.getElementById("sc-wh2").value,o=document.getElementById("sc-date").value||w();if(!e||!o||!window.spotCountLines.length){showToast("يرجى ملء الحقول الإلزامية وتحميل الأصناف","warning");return}const s=document.getElementById("save-sc-btn");s.disabled=!0;try{const a=E.find(l=>l.id===e),n=t?E.find(l=>l.id===t):null,i=window.spotCountLines.filter(l=>l.actualQty1!==l.bookQty1);for(const l of i){const r=l.actualQty1-l.bookQty1;await D(e,l.productId,r,{type:r>0?"spot_count_surplus":"spot_count_shortage",sourceType:"spotCount",note:`جرد مفاجئ (${a?.name}) فرق: ${r}`})}if(t){const l=window.spotCountLines.filter(r=>r.actualQty2!==r.bookQty2);for(const r of l){const m=r.actualQty2-r.bookQty2;await D(t,r.productId,m,{type:m>0?"spot_count_surplus":"spot_count_shortage",sourceType:"spotCount",note:`جرد مفاجئ (${n?.name}) فرق: ${m}`})}}const d=await _(I.inventoryAdjustments(),{opType:"spot-count",warehouseId:e,warehouseName:a?.name||"المخزن الأول",warehouseId2:t||null,warehouseName2:n?n.name:null,date:o,lines:window.spotCountLines,createdAt:new Date().toISOString()});showToast("تم اعتماد الجرد وإنشاء التسويات بنجاح","success"),closeModal("spot-count-modal"),window.spotCountLines=[],switchOpsSubModule("spot-count")}catch(a){showToast(a.message,"error")}finally{s.disabled=!1}};function Ct(e,t){if(!t.length){e.innerHTML=`
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">🔢</div>
        <div style="font-size:16px; font-weight:700;">لا توجد عمليات جرد مفاجئ مسجلة</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لبدء كشف جرد مفاجئ للمستودعات</p>
      </div>`;return}e.innerHTML=`
    <div class="card" style="border:1px solid var(--border-soft); border-radius:10px; overflow:hidden;">
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>المخزن 1</th>
              <th>المخزن 2</th>
              <th>الأصناف المجرودة</th>
              <th>أصناف بها فروقات</th>
              <th class="no-print" style="text-align:center;">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(o=>{const s=o.lines||[],a=s.filter(n=>n.actualQty1!==n.bookQty1||o.warehouseId2&&n.actualQty2!==n.bookQty2).length;return`
                <tr>
                  <td class="mono font-bold">${o.date||"—"}</td>
                  <td><strong>${o.warehouseName}</strong></td>
                  <td>${o.warehouseName2?`<strong>${o.warehouseName2}</strong>`:'<span class="dim">—</span>'}</td>
                  <td class="mono font-bold text-primary">${s.length} صنف</td>
                  <td class="mono font-bold ${a>0?"text-bad":"text-good"}">${a} صنف</td>
                  <td class="no-print" style="text-align:center; white-space:nowrap;">
                    <button class="btn btn-sm btn-ghost text-primary" onclick="window.showSpotCountDetail('${o.id}')">👁️ معاينة وتفاصيل</button>
                    <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printSpotCountById('${o.id}')">🖨️ طباعة</button>
                    <button class="btn btn-sm btn-ghost text-good" onclick="window.exportSpotCountByIdExcel('${o.id}')">📊 Excel</button>
                    <button class="btn btn-sm btn-ghost text-bad" onclick="window.deleteSpotCount('${o.id}')">❌ حذف وتراجع</button>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.showSpotCountDetail=async e=>{const t=b.find(n=>n.id===e);if(!t)return;at=t;const o=!!t.warehouseId2,s=t.lines||[],a=document.getElementById("sc-detail-body");a.innerHTML=`
    <div class="grid-3 gap-12 mb-16" style="background:var(--bg-2); padding:12px 16px; border-radius:8px; border:1px solid var(--border-soft);">
      <div><span class="dim" style="font-size:11px;">تاريخ الجرد:</span> <strong class="mono">${t.date}</strong></div>
      <div><span class="dim" style="font-size:11px;">المستودع الأول:</span> <strong>${t.warehouseName}</strong></div>
      <div><span class="dim" style="font-size:11px;">المستودع الثاني:</span> <strong>${t.warehouseName2||"—"}</strong></div>
    </div>

    <div class="table-container mb-16" style="border:1px solid var(--border-soft); border-radius:8px;">
      <table class="data-dense" style="width:100%;">
        <thead>
          <tr>
            <th>الصنف</th>
            <th>الدفترى (1)</th>
            <th>الفعلى (1)</th>
            <th>الفرق (1)</th>
            ${o?"<th>الدفترى (2)</th><th>الفعلى (2)</th><th>الفرق (2)</th>":""}
          </tr>
        </thead>
        <tbody>
          ${s.map(n=>{const i=n.actualQty1-n.bookQty1,d=o?n.actualQty2-n.bookQty2:0;return`
              <tr>
                <td><strong>${n.productName}</strong> <span class="mono dim">(${n.sku})</span></td>
                <td class="mono">${u(n.bookQty1)}</td>
                <td class="mono font-bold">${u(n.actualQty1)}</td>
                <td class="mono font-bold ${i<0?"text-bad":i>0?"text-good":""}">${i}</td>
                ${o?`
                  <td class="mono">${u(n.bookQty2)}</td>
                  <td class="mono font-bold">${u(n.actualQty2)}</td>
                  <td class="mono font-bold ${d<0?"text-bad":d>0?"text-good":""}">${d}</td>
                `:""}
              </tr>
            `}).join("")}
        </tbody>
      </table>
    </div>
  `,openModal("spot-count-detail-modal")};async function ut(e){const t=!!e.warehouseId2,o=t?["#","الصنف","الرمز","الوحدة","دفترى (1)","فعلى (1)","فرق (1)","دفترى (2)","فعلى (2)","فرق (2)"]:["#","الصنف","الرمز","الوحدة","الكمية الدفترية","الكمية الفعلية","فرق الجرد"],s=(e.lines||[]).map((a,n)=>{const i=a.actualQty1-a.bookQty1,d=a.unit||k.find(l=>l.id===a.productId)?.unit||"حبة";if(t){const l=a.actualQty2-a.bookQty2;return[n+1,a.productName,a.sku,d,a.bookQty1,a.actualQty1,i,a.bookQty2,a.actualQty2,l]}return[n+1,a.productName,a.sku,d,a.bookQty1,a.actualQty1,i]});await gt({title:`كشف جرد مفاجئ - ${e.warehouseName}`,headers:o,rows:s})}window.exportSpotCountByIdExcel=async e=>{const t=b.find(o=>o.id===e);t&&await ut(t)};window.exportActiveSpotCountExcel=async()=>{at&&await ut(at)};window.printActiveSpotCount=()=>{at&&window._doPrintSpotCount(at)};window.printSpotCountById=async e=>{const t=b.find(o=>o.id===e);t&&window._doPrintSpotCount(t)};window.deleteSpotCount=async e=>{if(confirm("تحذير: هل أنت متأكد من حذف هذا الجرد والتراجع عن التسويات المخزنية الناتجة عنه؟"))try{const t=await j(M(L,`companies/${C}/inventoryAdjustments`,e));if(!t.exists())return;const o=t.data();for(const s of o.lines||[]){const a=s.actualQty1-s.bookQty1;if(a!==0&&await D(o.warehouseId,s.productId,-a,{type:"spot_count_reversal",note:"تراجع عن تسوية الجرد المفاجئ"}),o.warehouseId2){const n=s.actualQty2-s.bookQty2;n!==0&&await D(o.warehouseId2,s.productId,-n,{type:"spot_count_reversal",note:"تراجع عن تسوية الجرد المفاجئ"})}}await dt(M(L,`companies/${C}/inventoryAdjustments`,e)),showToast("تم حذف الجرد والتراجع عن كافة التسويات بنجاح","success"),switchOpsSubModule("spot-count")}catch(t){showToast(t.message,"error")}};function Dt(e){const t=!!(e.warehouseId2&&e.warehouseId2!==""),o=e.warehouseName||"المستودع الأول",s=e.warehouseName2||(t?"المستودع الثاني":""),a=!!e.isDraft,n=e.lines||[],i=n.length;let d=0,l=0,r=0,m=0,c=0,g=0,h=0,f=0,x=0;n.forEach(B=>{const et=parseFloat(B.bookQty1!==void 0?B.bookQty1:B.bookQty??0)||0,Z=parseFloat(B.actualQty1!==void 0?B.actualQty1:B.actualQty??0)||0,U=Z-et;d+=et,l+=Z,r+=U;let P=0;if(t){const ot=parseFloat(B.bookQty2??0)||0,H=parseFloat(B.actualQty2??0)||0;P=H-ot,m+=ot,c+=H,g+=P}U!==0||t&&P!==0?U<0||t&&P<0?f++:(U>0||t&&P>0)&&x++:h++});const p=a?"كشف جرد مفاجئ (مسودة تدقيق قبل الاعتماد)":"محضر جرد مفاجئ معتمد رسمياً",y=a?"مسودة جرد تدقيق":"محضر جرد معتمد",S=a?"badge-warn":"badge-good",N=new Date().toLocaleString("ar-SA",{dateStyle:"full",timeStyle:"short"}),A=n.map((B,et)=>{const Z=parseFloat(B.bookQty1!==void 0?B.bookQty1:B.bookQty??0)||0,U=parseFloat(B.actualQty1!==void 0?B.actualQty1:B.actualQty??0)||0,P=U-Z,rt=t&&parseFloat(B.bookQty2??0)||0,ot=t&&parseFloat(B.actualQty2??0)||0,H=t?ot-rt:0;let it="";P<0||t&&H<0?it="row-deficit":(P>0||t&&H>0)&&(it="row-surplus");const bt=P!==0?P>0?`+${u(P)}`:u(P):"0",qt=H!==0?H>0?`+${u(H)}`:u(H):"0",vt=B.unit||k.find(Tt=>Tt.id===B.productId)?.unit||"حبة";return t?`
        <tr class="${it}">
          <td style="text-align:center; font-weight:700; color:#64748b;">${et+1}</td>
          <td class="mono font-bold" style="text-align:center;">${B.sku||"—"}</td>
          <td style="font-weight:600; color:#1e293b;">${B.productName}</td>
          <td style="text-align:center; color:#64748b; font-size:10px;">${vt}</td>
          <td class="mono" style="text-align:center;">${u(Z)}</td>
          <td style="text-align:center;"><span class="actual-box mono">${u(U)}</span></td>
          <td class="mono ${P<0?"text-bad":P>0?"text-good":""}" style="text-align:center;">${bt}</td>
          <td class="mono" style="text-align:center;">${u(rt)}</td>
          <td style="text-align:center;"><span class="actual-box mono">${u(ot)}</span></td>
          <td class="mono ${H<0?"text-bad":H>0?"text-good":""}" style="text-align:center;">${qt}</td>
          <td style="font-size:10px; color:#64748b;">${B.notes||""}</td>
        </tr>
      `:`
        <tr class="${it}">
          <td style="text-align:center; font-weight:700; color:#64748b;">${et+1}</td>
          <td class="mono font-bold" style="text-align:center;">${B.sku||"—"}</td>
          <td style="font-weight:600; color:#1e293b;">${B.productName}</td>
          <td style="text-align:center; color:#64748b; font-size:10px;">${vt}</td>
          <td class="mono" style="text-align:center;">${u(Z)}</td>
          <td style="text-align:center;"><span class="actual-box mono">${u(U)}</span></td>
          <td class="mono ${P<0?"text-bad":P>0?"text-good":""}" style="text-align:center;">${bt}</td>
          <td style="font-size:10px; color:#64748b;">${B.notes||""}</td>
        </tr>
      `}).join("");return`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${p} - ${e.date||""}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, 'Cairo', Arial, sans-serif;
      padding: 16px 20px;
      color: #0f172a;
      font-size: 11px;
      line-height: 1.4;
      direction: rtl;
      background: #ffffff;
      margin: 0;
    }
    @media print {
      body { padding: 6px 8px; }
      .no-print { display: none !important; }
      @page {
        size: ${t?"A4 landscape":"A4 portrait"};
        margin: 8mm 6mm;
      }
    }
    .print-toolbar {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .btn-action {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 7px 16px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
      font-size: 11.5px;
    }
    .btn-secondary {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
      padding: 7px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 11.5px;
      font-weight: 600;
    }
    .header-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .company-title h1 {
      margin: 0 0 3px 0;
      color: #1e3a8a;
      font-size: 18px;
      font-weight: 800;
    }
    .company-title p {
      margin: 2px 0;
      color: #475569;
      font-size: 10.5px;
    }
    .doc-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 800;
      border: 1px solid;
    }
    .badge-warn { background: #fffbeb; color: #b45309; border-color: #fde68a; }
    .badge-good { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 12px;
    }
    .meta-item { font-size: 11px; }
    .meta-label { color: #64748b; margin-bottom: 2px; font-size: 10px; }
    .meta-val { font-weight: 700; color: #0f172a; }

    .stats-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 14px;
    }
    .stat-card {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px;
      text-align: center;
      background: #ffffff;
    }
    .stat-card.good { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
    .stat-card.bad  { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
    .stat-card.warn { background: #fffbeb; border-color: #fde68a; color: #92400e; }
    .stat-val { font-size: 18px; font-weight: 800; line-height: 1.2; }
    .stat-lbl { font-size: 10px; margin-top: 2px; font-weight: 600; }

    table.spot-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 10.5px;
    }
    table.spot-table th, table.spot-table td {
      display: table-cell !important;
      border: 1px solid #cbd5e1;
      padding: 5px 6px;
      vertical-align: middle;
    }
    table.spot-table thead {
      display: table-header-group;
    }
    table.spot-table tfoot {
      display: table-footer-group;
    }
    table.spot-table tr {
      page-break-inside: avoid;
    }
    table.spot-table th {
      background: #f1f5f9;
      color: #1e293b;
      font-weight: 700;
    }
    table.spot-table th.col-wh1-group {
      background: #dbeafe !important;
      color: #1e40af;
      font-size: 11px;
    }
    table.spot-table th.col-wh2-group {
      background: #dcfce7 !important;
      color: #166534;
      font-size: 11px;
    }
    table.spot-table th.col-wh1 {
      background: #eff6ff !important;
    }
    table.spot-table th.col-wh2 {
      background: #f0fdf4 !important;
    }
    table.spot-table tbody tr:nth-child(even) td {
      background: #f8fafc;
    }
    table.spot-table tbody tr.row-deficit td {
      background: #fef2f2 !important;
    }
    table.spot-table tbody tr.row-surplus td {
      background: #f0fdf4 !important;
    }
    table.spot-table tfoot td {
      background: #f1f5f9;
      font-weight: 800;
      border-top: 2px solid #94a3b8;
    }

    .actual-box {
      display: inline-block;
      min-width: 44px;
      padding: 1px 4px;
      font-weight: 800;
      font-size: 11px;
      background: #ffffff;
      border: 1px solid #94a3b8;
      border-radius: 4px;
      text-align: center;
    }
    .text-bad { color: #dc2626 !important; font-weight: 800; }
    .text-good { color: #16a34a !important; font-weight: 800; }
    .mono { font-family: Consolas, 'Courier New', monospace; direction: ltr; unicode-bidi: embed; }

    .signatures {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-top: 20px;
      padding-top: 14px;
      border-top: 1px solid #cbd5e1;
      page-break-inside: avoid;
    }
    .sig-box {
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
      padding: 8px 12px;
      text-align: center;
      background: #fafafa;
    }
    .sig-role {
      font-weight: 700;
      color: #1e3a8a;
      font-size: 10.5px;
      margin-bottom: 25px;
    }
    .sig-name {
      border-top: 1px solid #94a3b8;
      padding-top: 3px;
      font-size: 10px;
      color: #64748b;
    }

    .print-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 14px;
      font-size: 9.5px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 6px;
      page-break-inside: avoid;
    }
  </style>
  <script>
    function toggleOrientation() {
      const isLandscape = document.body.classList.toggle('force-portrait');
      const style = document.getElementById('dynamic-page-style');
      if (style) {
        style.innerHTML = isLandscape 
          ? '@page { size: A4 portrait; margin: 8mm 6mm; }' 
          : '@page { size: ${t?"A4 landscape":"A4 portrait"}; margin: 8mm 6mm; }';
      }
    }
  <\/script>
  <style id="dynamic-page-style">
    @page { size: ${t?"A4 landscape":"A4 portrait"}; margin: 8mm 6mm; }
  </style>
</head>
<body>
  <div class="print-toolbar no-print">
    <button class="btn-action" onclick="window.print()">🖨️ طباعة الآن / حفظ PDF</button>
    <button class="btn-secondary" onclick="toggleOrientation()">📄 تبديل اتجاه الصفحة (أفقي / طولي)</button>
    <button class="btn-secondary" onclick="window.close()">❌ إغلاق النافذة</button>
  </div>

  <div class="header-box">
    <div class="company-title">
      <h1>${p}</h1>
      <p><strong>مؤسسة ادهام للمواد الغذائية — الإدارة التشغيلية وسلاسل الإمداد</strong></p>
      <p>السجل التجاري: 7054969006 | الرقم الضريبي: 314996148100003 | ينبع الصناعية</p>
    </div>
    <div>
      <span class="doc-badge ${S}">${y}</span>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item"><div class="meta-label">تاريخ الجرد:</div><div class="meta-val mono">${e.date||""}</div></div>
    <div class="meta-item"><div class="meta-label">المستودع الأول (الرئيسي):</div><div class="meta-val">🏢 ${o}</div></div>
    ${t?`<div class="meta-item"><div class="meta-label">المستودع الثاني (المقارن):</div><div class="meta-val">🚐 ${s}</div></div>`:'<div class="meta-item"><div class="meta-label">المستودع المقارن:</div><div class="meta-val dim">غير محدد</div></div>'}
    <div class="meta-item"><div class="meta-label">إجمالي الأصناف بالكشف:</div><div class="meta-val mono font-bold">${i} صنف</div></div>
  </div>

  <div class="stats-bar">
    <div class="stat-card">
      <div class="stat-val mono">${i}</div>
      <div class="stat-lbl">إجمالي الأصناف</div>
    </div>
    <div class="stat-card good">
      <div class="stat-val mono">${h}</div>
      <div class="stat-lbl">أصناف متطابقة (0 فرق)</div>
    </div>
    <div class="stat-card ${f>0?"bad":""}">
      <div class="stat-val mono">${f}</div>
      <div class="stat-lbl">أصناف بها عجز (نقص)</div>
    </div>
    <div class="stat-card ${x>0?"warn":""}">
      <div class="stat-val mono">${x}</div>
      <div class="stat-lbl">أصناف بها فائض (زيادة)</div>
    </div>
  </div>

  <table class="spot-table">
    <thead>
      ${t?`
        <tr>
          <th rowspan="2" style="width:30px; text-align:center;">#</th>
          <th rowspan="2" style="width:75px; text-align:center;">رمز الصنف</th>
          <th rowspan="2" style="text-align:right;">اسم الصنف والوصف</th>
          <th rowspan="2" style="width:55px; text-align:center;">الوحدة</th>
          <th colspan="3" class="col-wh1-group" style="text-align:center;">🏢 ${o}</th>
          <th colspan="3" class="col-wh2-group" style="text-align:center;">🚐 ${s}</th>
          <th rowspan="2" style="width:110px; text-align:center;">ملاحظات التدقيق</th>
        </tr>
        <tr>
          <th class="col-wh1" style="width:65px; text-align:center;">الدفترى</th>
          <th class="col-wh1" style="width:70px; text-align:center;">الفعلى</th>
          <th class="col-wh1" style="width:65px; text-align:center;">الفرق</th>
          <th class="col-wh2" style="width:65px; text-align:center;">الدفترى</th>
          <th class="col-wh2" style="width:70px; text-align:center;">الفعلى</th>
          <th class="col-wh2" style="width:65px; text-align:center;">الفرق</th>
        </tr>
      `:`
        <tr>
          <th style="width:30px; text-align:center;">#</th>
          <th style="width:85px; text-align:center;">رمز الصنف</th>
          <th style="text-align:right;">اسم الصنف والوصف</th>
          <th style="width:65px; text-align:center;">الوحدة</th>
          <th class="col-wh1" style="width:80px; text-align:center;">الكمية الدفترية</th>
          <th class="col-wh1" style="width:90px; text-align:center;">الكمية الفعلية</th>
          <th class="col-wh1" style="width:80px; text-align:center;">فارق الجرد</th>
          <th style="width:130px; text-align:center;">ملاحظات التدقيق الميداني</th>
        </tr>
      `}
    </thead>
    <tbody>
      ${A}
    </tbody>
    <tfoot>
      ${t?`
        <tr>
          <td colspan="4" style="text-align:center;">الإجمالي العام لكافة الكميات</td>
          <td class="mono font-bold" style="text-align:center;">${u(d)}</td>
          <td class="mono font-bold" style="text-align:center;">${u(l)}</td>
          <td class="mono font-bold ${r<0?"text-bad":r>0?"text-good":""}" style="text-align:center;">
            ${r>0?"+":""}${u(r)}
          </td>
          <td class="mono font-bold" style="text-align:center;">${u(m)}</td>
          <td class="mono font-bold" style="text-align:center;">${u(c)}</td>
          <td class="mono font-bold ${g<0?"text-bad":g>0?"text-good":""}" style="text-align:center;">
            ${g>0?"+":""}${u(g)}
          </td>
          <td></td>
        </tr>
      `:`
        <tr>
          <td colspan="4" style="text-align:center;">الإجمالي العام للكميات</td>
          <td class="mono font-bold" style="text-align:center;">${u(d)}</td>
          <td class="mono font-bold" style="text-align:center;">${u(l)}</td>
          <td class="mono font-bold ${r<0?"text-bad":r>0?"text-good":""}" style="text-align:center;">
            ${r>0?"+":""}${u(r)}
          </td>
          <td></td>
        </tr>
      `}
    </tfoot>
  </table>

  <div class="signatures">
    <div class="sig-box">
      <div class="sig-role">مسؤول الجرد الميداني</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">أمين المستودع / العهدة المسؤول</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">المدير المالي / المشرف العام</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
  </div>

  <div class="print-footer">
    <span>تاريخ ووقت الطباعة: ${N}</span>
    <span>إدهام ERP — نظام الرقابة على المخزون وسلاسل الإمداد</span>
    <span>${a?"مسودة غير معتمدة لأغراض التدقيق الميداني":"مستند رسمي معتمد"}</span>
  </div>
</body>
</html>`}window._doPrintSpotCount=e=>{const t=Dt(e);window.printOpsDocument(t,e.isDraft?"مسودة كشف الجرد المفاجئ":"محضر جرد مخزني معتمد")};window.saveRevalue=async()=>{const e=document.getElementById("rv-error");e.classList.add("hidden");const t=document.getElementById("rv-wh").value,o=document.getElementById("rv-product").value,s=parseFloat(document.getElementById("rv-old-cost").value)||0,a=parseFloat(document.getElementById("rv-new-cost").value),n=document.getElementById("rv-date").value||w(),i=document.getElementById("rv-notes").value.trim();if(!t||!o||isNaN(a)||a<0||!i){e.textContent="يرجى اختيار المخزن والصنف وإدخال التكلفة الجديدة والسبب",e.classList.remove("hidden");return}const d=document.getElementById("save-rv-btn");d.disabled=!0;try{const l=k.find(N=>N.id===o),r=E.find(N=>N.id===t),m=`${t}_${o}`,c=await j(M(L,`companies/${C}/stockByWarehouse`,m));let g=c.exists()&&parseFloat(c.data().qty)||0;c.exists()||(r?.type==="Main"||r?.name?.includes("رئيس")||r?.name?.includes("الرئيسي")||r?.name?.includes("الرئيسى"))&&(g=parseFloat(l?.stockQty!==void 0?l.stockQty:l?.totalQty!==void 0?l.totalQty:0)||0);const h=a-s,f=g*h,x=`RV-${n.replace(/-/g,"")}-${Math.floor(1e3+Math.random()*9e3)}`,p=await _(I.inventoryAdjustments(),{opType:"revalue",revalueNumber:x,number:x,warehouseId:t,warehouseName:r?.name||"المستودع",productId:o,productName:l?.name||"صنف",sku:l?.sku||"",oldCost:s,newCost:a,diffPerUnit:h,currentQty:g,totalDiff:f,date:n,notes:i,createdAt:new Date().toISOString()});await nt("products",o,{costPrice:a});const y=T.find(N=>N.code==="1-1-4-1-01")||T.find(N=>N.code==="1-1-4-1")||{id:"INV_STOCK",code:"1-1-4-1-01",name:"مخزون مستودع المواد الغذائية"},S=T.find(N=>N.code==="5-2-3")||T.find(N=>N.code==="5-2")||{id:"REVAL_LOSS",code:"5-2-3",name:"خسائر إعادة تقييم المخزون"};if(f!==0)if(f<0)await st({date:n,description:`إعادة تقييم مخزون: خفض تكلفة ${l?.name} - ${i}`,sourceType:"stockRevaluation",sourceId:p,lines:[{accountId:S.id,accountCode:S.code,accountName:S.name,debit:Math.abs(f),credit:0,note:"خسارة إعادة تقييم"},{accountId:y.id,accountCode:y.code,accountName:y.name,debit:0,credit:Math.abs(f),note:"تخفيض قيمة المخزون"}]});else{const N=T.find(A=>A.code==="4-2-2")||T.find(A=>A.code==="4-2")||{id:"REVAL_GAIN",code:"4-2-2",name:"أرباح إعادة تقييم المخزون"};await st({date:n,description:`إعادة تقييم مخزون: زيادة تكلفة ${l?.name} - ${i}`,sourceType:"stockRevaluation",sourceId:p,lines:[{accountId:y.id,accountCode:y.code,accountName:y.name,debit:f,credit:0,note:"زيادة قيمة المخزون"},{accountId:N.id,accountCode:N.code,accountName:N.name,debit:0,credit:f,note:"أرباح تقييم"}]})}showToast("تم تطبيق إعادة التقييم وتحديث تكلفة الصنف بنجاح","success"),closeModal("revalue-modal"),switchOpsSubModule("revalue")}catch(l){e.textContent=l.message,e.classList.remove("hidden")}finally{d.disabled=!1}};function Mt(e,t){if(!t.length){e.innerHTML=`
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">💰</div>
        <div style="font-size:16px; font-weight:700;">لا توجد عمليات إعادة تقييم مسجلة</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لتعديل تكلفة صنف بالدفاتر وتسجيل فروق التقييم</p>
      </div>`;return}e.innerHTML=`
    <div class="card" style="border:1px solid var(--border-soft); border-radius:10px; overflow:hidden;">
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>المستودع</th>
              <th>الصنف</th>
              <th>التكلفة السابقة</th>
              <th>التكلفة الجديدة</th>
              <th>فارق التكلفة للوحدة</th>
              <th>إجمالي الفارق المالي</th>
              <th>السبب والمبررات</th>
              <th class="no-print" style="text-align:center;">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(o=>{const s=(o.newCost||0)-(o.oldCost||0);return`
                <tr>
                  <td class="mono font-bold">${o.date||"—"}</td>
                  <td><strong>${o.warehouseName}</strong></td>
                  <td><strong>${o.productName}</strong> <span class="mono dim">(${o.sku})</span></td>
                  <td class="mono">${v(o.oldCost||0)}</td>
                  <td class="mono font-bold">${v(o.newCost||0)}</td>
                  <td class="mono font-bold ${s<0?"text-bad":"text-good"}">${s>0?"+":""}${v(s)}</td>
                  <td class="mono font-bold ${(o.totalDiff||0)<0?"text-bad":"text-good"}">${v(o.totalDiff||0)}</td>
                  <td>${o.notes||"—"}</td>
                  <td class="no-print" style="text-align:center;">
                    <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printRevalueDetail('${o.id}')">🖨️ طباعة</button>
                  </td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.printRevalueDetail=async e=>{const t=b.find(d=>d.id===e);if(!t)return;const o=(t.newCost||0)-(t.oldCost||0),s=`
    <div class="meta-item"><div class="meta-label">رقم سند إعادة التقييم:</div><div class="meta-val mono font-bold text-primary">${t.revalueNumber||e}</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ العملية:</div><div class="meta-val mono">${t.date}</div></div>
    <div class="meta-item"><div class="meta-label">المستودع:</div><div class="meta-val"><strong>${t.warehouseName}</strong></div></div>
    <div class="meta-item"><div class="meta-label">الصنف المعاد تقييمه:</div><div class="meta-val"><strong>${t.productName} (${t.sku})</strong></div></div>
    <div class="meta-item"><div class="meta-label">التكلفة السابقة:</div><div class="meta-val mono">${v(t.oldCost||0)}</div></div>
    <div class="meta-item"><div class="meta-label">التكلفة الجديدة المعتمدة:</div><div class="meta-val mono font-bold">${v(t.newCost||0)}</div></div>
  `,a=`
    <table class="data-table">
      <thead>
        <tr>
          <th>الصنف والرمز</th>
          <th style="text-align:center;">الكمية المتوفرة بالمخزن</th>
          <th style="text-align:left;">التكلفة القديمة</th>
          <th style="text-align:left;">التكلفة الجديدة</th>
          <th style="text-align:left;">فارق الوحدة</th>
          <th style="text-align:left;">إجمالي الأثر المالي</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>${t.productName}</strong> <span class="mono">(${t.sku})</span></td>
          <td class="mono font-bold" style="text-align:center;">${u(t.currentQty||0)}</td>
          <td class="mono" style="text-align:left;">${v(t.oldCost||0)}</td>
          <td class="mono font-bold" style="text-align:left;">${v(t.newCost||0)}</td>
          <td class="mono font-bold" style="text-align:left; color:${o<0?"#dc2626":"#16a34a"};">${o>0?"+":""}${v(o)}</td>
          <td class="mono font-bold" style="text-align:left; color:${(t.totalDiff||0)<0?"#dc2626":"#16a34a"};">${v(t.totalDiff||0)}</td>
        </tr>
      </tbody>
    </table>
  `,i=V({title:`سند إعادة تقييم مخزون رسمي #${t.revalueNumber||e}`,docBadge:'<span class="doc-badge good">سند إعادة تقييم مالي</span>',metaHtml:s,contentHtml:a,signaturesHtml:`
    <div class="sig-box">
      <div class="sig-role">مسؤول التكاليف والمخزون</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">المدير المالي</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
    <div class="sig-box">
      <div class="sig-role">اعتماد الإدارة العامة</div>
      <div class="sig-name">الاسم والتوقيع: .......................................</div>
    </div>
  `,footerNotes:t.notes||"تم تعديل تكلفة الصنف بالدفاتر وتسجيل القيد المحاسبي لفارق التقييم."});window.printOpsDocument(i,`RV-${t.revalueNumber||e}`)};export{Vt as getOpsCompanyInfo,Wt as render};
