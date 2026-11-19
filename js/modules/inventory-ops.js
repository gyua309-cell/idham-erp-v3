// ============================================================
// IDHAM ERP — Advanced Supply Chain & Warehouse Operations
// إدارة متكاملة وشاملة: دورة المشتريات، الاستلام، الجودة، الصرف، والرقابة المخزنية
// ============================================================
import { COLS, create, update, remove, getAll, query, orderBy, limit, getDocs, doc, getDoc, deleteDoc } from "../utils/db.js";
import { formatCurrency, formatQuantity, todayString } from "../utils/formatters.js";
import { createJournalEntry, adjustStock } from "../utils/db.js";
import { db, COMPANY_ID } from "../firebase-config.js";
import { collection, where } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { exportToExcel } from "../utils/excel.js";

// Global In-Memory Registries
let products = [];
let categories = [];
let warehouses = [];
let allAccounts = [];
let suppliers = [];
let activeSubModule = "request";
let activeListCache = []; // Caches current sub-module data for realtime search and Excel export
let activeDetailDoc = null;

// Sub-module Line Items State
let prItems = [];
let poItems = [];
let activeGRPOPO = null;
let asmComponents = [];
window._editingAdjId = null;
window._adjLines = [];
let dispatchLines = [];
let vehicleLines = [];
let vehicleReturnLines = [];
window.spotCountLines = [];
let activeDetailSC = null;

// ============================================================
// 1. Company Information & Universal Document Printing Engine
// ============================================================

export async function getOpsCompanyInfo() {
  const defaultCo = {
    name: "مؤسسة ادهام للمواد الغذائية",
    legalName: "مؤسسة ادهام للتجارة والتوزيع",
    vatNumber: "314996148100003",
    crNumber: "7054969006",
    phone: "0549141648",
    email: "Nuzmalamdad@gmail.com",
    address: "المملكة العربية السعودية — ينبع الصناعية",
    logoUrl: ""
  };

  try {
    const cached = JSON.parse(localStorage.getItem("idham_company") || "{}");
    if (cached.name || cached.companyName) {
      Object.assign(defaultCo, cached);
      if (cached.companyName) defaultCo.name = cached.companyName;
    }
  } catch (_) {}

  try {
    const [compSnap, logoSnap] = await Promise.all([
      getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company")),
      getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "logo"))
    ]);
    if (compSnap.exists()) {
      const d = compSnap.data();
      defaultCo.name = d.name || d.companyName || defaultCo.name;
      defaultCo.legalName = d.legalName || defaultCo.legalName;
      defaultCo.crNumber = d.crNumber || d.cr || defaultCo.crNumber;
      defaultCo.vatNumber = d.vatNumber || defaultCo.vatNumber;
      defaultCo.phone = d.phone || defaultCo.phone;
      defaultCo.email = d.email || defaultCo.email;
      defaultCo.address = d.address || (d.city ? `${d.city} — ${d.street || ""}` : defaultCo.address);
    }
    if (logoSnap.exists() && logoSnap.data().dataUrl) {
      defaultCo.logoUrl = logoSnap.data().dataUrl;
    }
  } catch (e) {
    console.warn("[getOpsCompanyInfo] Failed to read from Firestore:", e);
  }

  return defaultCo;
}

// Universal Print Launcher (Hidden iframe + Fallback Popup)
window.printOpsDocument = (html, docTitle = "مستند مخزني") => {
  const oldFrame = document.getElementById("_ops_print_frame");
  if (oldFrame) oldFrame.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "_ops_print_frame";
  iframe.style.cssText = "position:fixed;width:0;height:0;border:none;left:-9999px;top:-9999px;";
  document.body.appendChild(iframe);

  const fallbackPopup = () => {
    const w = window.open("", "_blank", "width=1000,height=800");
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => {
        try { w.print(); } catch (_) {}
      }, 350);
    }
  };

  try {
    const iDoc = iframe.contentDocument || iframe.contentWindow.document;
    iDoc.open();
    iDoc.write(html);
    iDoc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        fallbackPopup();
      }
    }, 250);
  } catch (err) {
    fallbackPopup();
  }
};

// Universal Branded Document Template Wrapper
function wrapOpsPrintLayout({ title, docBadge, metaHtml, contentHtml, signaturesHtml, footerNotes }) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
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
      <h1>${title}</h1>
      <p><strong>مؤسسة ادهام للمواد الغذائية — الإدارة التشغيلية وسلاسل الإمداد</strong></p>
      <p>السجل التجاري: 7054969006 | الرقم الضريبي: 314996148100003 | ينبع الصناعية</p>
    </div>
    <div class="doc-headline">
      ${docBadge}
    </div>
  </div>

  <div class="meta-grid">
    ${metaHtml}
  </div>

  ${contentHtml}

  ${footerNotes ? `<div style="margin: 12px 0; padding: 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; font-size: 11px; color: #92400e;"><strong>ملاحظات وشروط:</strong> ${footerNotes}</div>` : ""}

  <div class="signatures">
    ${signaturesHtml}
  </div>

  <div class="print-footer">
    <span>نظام ادهام ERP — إدارة العمليات وسلاسل الإمداد</span>
    <span>تاريخ وتوقيت الطباعة: ${new Date().toLocaleString("ar-SA")}</span>
    <span>صفحة 1 من 1</span>
  </div>
</body>
</html>`;
}


// ============================================================
// 2. Main Page Render Function & UI Shell
// ============================================================

export async function render(container, user) {
  container.innerHTML = `
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
          <div class="form-group"><label>تاريخ الطلب *</label><input type="date" id="pr-date" class="input" value="${todayString()}" /></div>
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
          <div class="form-group"><label>تاريخ الأمر *</label><input type="date" id="po-date" class="input" value="${todayString()}" /></div>
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
          <div class="form-group"><label>تاريخ الاستلام *</label><input type="date" id="grpo-date" class="input" value="${todayString()}" /></div>
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
          <div class="form-group"><label>تاريخ الفحص *</label><input type="date" id="qi-date" class="input" value="${todayString()}" /></div>
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
          <div class="form-group"><label>تاريخ الصرف *</label><input type="date" id="dsp-date" class="input" value="${todayString()}" /></div>
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
          <div class="form-group"><label>تاريخ التحميل *</label><input type="date" id="veh-date" class="input" value="${todayString()}" /></div>
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
          <div class="form-group"><label>تاريخ الاستلام *</label><input type="date" id="vr-date" class="input" value="${todayString()}" /></div>
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
          <div class="form-group"><label>تاريخ العملية</label><input type="date" id="asm-date" class="input" value="${todayString()}" /></div>
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
          <div class="form-group"><label>التاريخ *</label><input type="date" id="adj-date" class="input" value="${todayString()}" /></div>
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
          <div class="form-group"><label>تاريخ الجرد *</label><input type="date" id="sc-date" class="input font-bold" value="${todayString()}" /></div>
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
        <div class="form-group mb-16"><label>تاريخ إعادة التقييم *</label><input type="date" id="rv-date" class="input" value="${todayString()}" /></div>
        <div class="form-group"><label>مبررات وسبب إعادة التقييم *</label><textarea id="rv-notes" class="input" rows="2" placeholder="تغيير سعر السوق، انخفاض القيمة الاستردادية، قرار مالي..."></textarea></div>
        <div id="rv-error" class="alert bad hidden" style="margin-top:12px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('revalue-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="window.saveRevalue()" id="save-rv-btn">💰 تطبيق إعادة التقييم وإنشاء قيد</button>
      </div></div>
    </div>
  `;

  await Promise.all([
    loadDependencies(),
    switchOpsSubModule(activeSubModule)
  ]);
}


// ============================================================
// 3. Data Dependencies & Submodule Navigation Engine
// ============================================================

async function loadDependencies() {
  const [prodsSnap, catsSnap, whsSnap, accsSnap, suppSnap] = await Promise.all([
    getAll(COLS.products(), [orderBy("sku")]),
    getAll(COLS.categories(), [orderBy("name")]),
    getAll(COLS.warehouses(), [orderBy("name")]),
    getAll(COLS.chartOfAccounts(), [orderBy("code")]),
    getAll(COLS.suppliers(), [orderBy("name")]),
  ]);
  products = prodsSnap || [];
  categories = catsSnap || [];
  const seenWhIds = new Set();
  const seenWhNames = new Set();
  warehouses = (whsSnap || []).filter(w => {
    if (!w || !w.id || seenWhIds.has(w.id)) return false;
    seenWhIds.add(w.id);
    if (w.isActive === false) return false;
    const n = (w.name || "").replace(/\s+/g, " ").trim();
    if (!n || seenWhNames.has(n)) return false;
    seenWhNames.add(n);
    w.name = n;
    return true;
  });
  allAccounts = accsSnap || [];
  suppliers = suppSnap || [];

  const safeSet = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };

  // Options strings
  const whOptions = warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join("");
  const prodOptions = '<option value="">اختر الصنف...</option>' + products.map(p => `<option value="${p.id}" data-cost="${p.costPrice||0}">${p.sku} - ${p.name}</option>`).join("");
  const suppOptions = '<option value="">اختر المورد...</option>' + suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  const catOptions = '<option value="">كل الفئات</option>' + categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  const vehicleWhOptions = warehouses.filter(w => w.type === 'Vehicle' || (w.name && w.name.includes('سيارة'))).map(w => `<option value="${w.id}">${w.name}</option>`).join("") || whOptions;

  safeSet("pr-wh", whOptions);
  safeSet("pr-supplier", '<option value="">طلب تسعير عام للموردين</option>' + suppOptions);
  safeSet("pr-item-cat", catOptions);
  safeSet("pr-item-sel", prodOptions);

  safeSet("po-wh", whOptions);
  safeSet("po-supplier", suppOptions);
  safeSet("po-item-cat", catOptions);
  safeSet("po-item-sel", prodOptions);

  safeSet("grpo-wh", whOptions);
  safeSet("qi-wh", whOptions);
  safeSet("qi-product", prodOptions);

  safeSet("dsp-wh", whOptions);
  safeSet("dsp-item-sel", prodOptions);

  safeSet("veh-src-wh", whOptions);
  safeSet("veh-dst-wh", vehicleWhOptions);
  safeSet("veh-item-sel", prodOptions);

  safeSet("vr-src-wh", vehicleWhOptions);
  safeSet("vr-dst-wh", whOptions);
  safeSet("vr-item-sel", prodOptions);

  safeSet("asm-wh", whOptions);
  safeSet("asm-product", prodOptions);
  safeSet("asm-component-sel", prodOptions);

  safeSet("adj-wh", whOptions);
  safeSet("sc-wh", whOptions);
  safeSet("sc-wh2", '<option value="">-- لا يوجد --</option>' + whOptions);

  safeSet("rv-wh", whOptions);
  safeSet("rv-product", prodOptions);

  setupAdjProductAutocomplete();
}

window.filterOpsProducts = (selectId, categoryId) => {
  const select = document.getElementById(selectId);
  if (!select) return;
  const filtered = categoryId 
    ? products.filter(p => p.category === categoryId) 
    : products;
  
  select.innerHTML = '<option value="">اختر الصنف...</option>' + 
    filtered.map(p => `<option value="${p.id}" data-cost="${p.costPrice||0}">${p.sku} - ${p.name}</option>`).join("");
  
  if (selectId === 'po-item-sel') {
    const costInput = document.getElementById("po-item-cost");
    if (costInput) costInput.value = "0.00";
  }
};

window.onRevalueProductChange = (val) => {
  const prod = products.find(p => p.id === val);
  const oldCostInput = document.getElementById("rv-old-cost");
  if (oldCostInput) oldCostInput.value = (prod?.costPrice || 0).toFixed(2);
};

window.switchOpsSubModule = async (val) => {
  activeSubModule = val;
  const select = document.getElementById("ops-submodule-select");
  if (select && select.value !== val) select.value = val;

  const searchInput = document.getElementById("ops-search-input");
  if (searchInput) searchInput.value = "";
  const statusFilter = document.getElementById("ops-status-filter");
  if (statusFilter) statusFilter.value = "";

  const area = document.getElementById("ops-content-area");
  if (!area) return;
  area.innerHTML = `<div class="page-loading"><div class="loading-spinner"></div><p style="margin-top:10px; color:var(--text-2); font-weight:600;">جارٍ تحميل السجلات...</p></div>`;

  try {
    if (val === 'request') {
      const q = query(COLS.purchaseRequests(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      activeListCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderPRList(area, activeListCache);
    } else if (val === 'po') {
      const q = query(COLS.purchaseOrders(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      activeListCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderPOList(area, activeListCache);
    } else if (val === 'grpo') {
      const q = query(COLS.goodsReceiptPOs(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      activeListCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderGRPOList(area, activeListCache);
    } else if (val === 'inspect') {
      const q = query(COLS.qualityInspections(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      activeListCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderQIList(area, activeListCache);
    } else if (val === 'assemble') {
      const q = query(COLS.productAssemblies(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      activeListCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderAssemblyList(area, activeListCache);
    } else if (val === 'adjust') {
      const q = query(COLS.inventoryAdjustments(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      activeListCache = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => !d.opType);
      renderAdjustmentList(area, activeListCache);
    } else if (val === 'dispatch') {
      const q = query(COLS.inventoryAdjustments(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      activeListCache = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.opType === 'dispatch');
      renderDispatchList(area, activeListCache);
    } else if (val === 'vehicle') {
      const q = query(COLS.inventoryAdjustments(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      activeListCache = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.opType === 'vehicle-load');
      renderVehicleList(area, activeListCache);
    } else if (val === 'vehicle-return') {
      const q = query(COLS.inventoryAdjustments(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      activeListCache = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.opType === 'vehicle-return');
      renderVehicleReturnList(area, activeListCache);
    } else if (val === 'spot-count') {
      const q = query(COLS.inventoryAdjustments(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      activeListCache = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.opType === 'spot-count');
      renderSpotCountList(area, activeListCache);
    } else if (val === 'revalue') {
      const q = query(COLS.inventoryAdjustments(), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      activeListCache = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.opType === 'revalue');
      renderRevalueList(area, activeListCache);
    }
  } catch (err) {
    area.innerHTML = `<div class="alert bad" style="padding:20px; font-weight:700;">خطأ أثناء تحميل البيانات: ${err.message}</div>`;
  }
};

window.openOpsModal = async () => {
  if (activeSubModule === 'request') {
    prItems = [];
    document.getElementById("pr-lines-tbody").innerHTML = "";
    document.getElementById("pr-notes").value = "";
    document.getElementById("pr-date").value = todayString();
    openModal("pr-modal");
  } else if (activeSubModule === 'po') {
    poItems = [];
    document.getElementById("po-lines-tbody").innerHTML = "";
    document.getElementById("po-notes").value = "";
    document.getElementById("po-date").value = todayString();
    const lbl = document.getElementById("po-total-cost-label");
    if (lbl) lbl.textContent = "0.00 ر.س";
    openModal("po-modal");
  } else if (activeSubModule === 'grpo') {
    const q = query(COLS.purchaseOrders(), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const activePOs = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.status === 'ordered');

    const sel = document.getElementById("grpo-po-select");
    sel.innerHTML = '<option value="">اختر أمر شراء للتحويل...</option>' +
      activePOs.map(p => `<option value="${p.id}">${p.poNumber || p.id} — ${p.supplierName}</option>`).join("");

    document.getElementById("grpo-lines-tbody").innerHTML = `<tr><td colspan="6" class="dim" style="text-align:center; padding:20px;">يرجى اختيار أمر شراء لاستيراد بنوده</td></tr>`;
    document.getElementById("save-grpo-btn").disabled = true;
    openModal("grpo-modal");
  } else if (activeSubModule === 'inspect') {
    document.getElementById("qi-batch").value = "";
    document.getElementById("qi-temp").value = "";
    document.getElementById("qi-notes").value = "";
    document.getElementById("qi-date").value = todayString();
    openModal("qi-modal");
  } else if (activeSubModule === 'dispatch') {
    dispatchLines = [];
    renderDspLines();
    document.getElementById("dsp-notes").value = "";
    document.getElementById("dsp-date").value = todayString();
    openModal("dispatch-modal");
  } else if (activeSubModule === 'vehicle') {
    vehicleLines = [];
    const tbody = document.getElementById("veh-lines-tbody");
    if (tbody) tbody.innerHTML = "";
    document.getElementById("veh-notes").value = "";
    document.getElementById("veh-date").value = todayString();
    openModal("vehicle-modal");
  } else if (activeSubModule === 'vehicle-return') {
    vehicleReturnLines = [];
    const tbody = document.getElementById("vr-lines-tbody");
    if (tbody) tbody.innerHTML = "";
    document.getElementById("vr-notes").value = "";
    document.getElementById("vr-date").value = todayString();
    openModal("vehicle-return-modal");
  } else if (activeSubModule === 'assemble') {
    asmComponents = [];
    document.getElementById("asm-lines-tbody").innerHTML = "";
    document.getElementById("asm-qty").value = "1";
    document.getElementById("asm-date").value = todayString();
    openModal("asm-modal");
  } else if (activeSubModule === 'adjust') {
    window._editingAdjId = null;
    window._adjLines = [];
    document.getElementById("adj-notes").value = "";
    document.getElementById("adj-date").value = todayString();
    document.getElementById("adj-modal-title").textContent = "⚖️ تسوية وصرف وإهلاك مخزني";
    renderAdjLinesTable();
    openModal("adj-modal");
  } else if (activeSubModule === 'spot-count') {
    window.spotCountLines = [];
    const searchInput = document.getElementById("sc-search-input");
    if (searchInput) searchInput.value = "";
    const filterMode = document.getElementById("sc-filter-mode");
    if (filterMode) filterMode.value = "all";
    const badge = document.getElementById("sc-count-badge");
    if (badge) badge.textContent = "";
    const thead = document.getElementById("sc-table-thead");
    if (thead) {
      thead.innerHTML = `<tr><th>الصنف</th><th>الكمية الدفترية</th><th>الكمية الفعلية</th><th>الفرق</th></tr>`;
    }
    const tbody = document.getElementById("sc-lines-tbody");
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:25px;color:var(--text-2);">اختر المخزن واضغط "تحميل أصناف المخزن" لجلب الأرصدة الفعلية للمطابقة</td></tr>`;
    document.getElementById("save-sc-btn").disabled = true;
    document.getElementById("sc-date").value = todayString();
    openModal("spot-count-modal");
  } else if (activeSubModule === 'revalue') {
    document.getElementById("rv-notes").value = "";
    document.getElementById("rv-new-cost").value = "";
    document.getElementById("rv-date").value = todayString();
    const sel = document.getElementById("rv-product");
    if (sel && sel.value) window.onRevalueProductChange(sel.value);
    openModal("revalue-modal");
  }
};

// ============================================================
// Realtime Instant Search & Table Filter Engine
// ============================================================

window.filterActiveOpsTable = () => {
  const searchInput = document.getElementById("ops-search-input");
  const statusFilter = document.getElementById("ops-status-filter");
  const q = (searchInput?.value || "").trim().toLowerCase();
  const st = (statusFilter?.value || "").trim().toLowerCase();

  const area = document.getElementById("ops-content-area");
  if (!area || !activeListCache) return;

  const filtered = activeListCache.filter(item => {
    // Status check
    if (st) {
      const itemStatus = (item.status || item.type || "").toLowerCase();
      if (!itemStatus.includes(st)) return false;
    }
    // Search query check
    if (!q) return true;
    const str = JSON.stringify(item).toLowerCase();
    return str.includes(q);
  });

  if (activeSubModule === 'request') renderPRList(area, filtered);
  else if (activeSubModule === 'po') renderPOList(area, filtered);
  else if (activeSubModule === 'grpo') renderGRPOList(area, filtered);
  else if (activeSubModule === 'inspect') renderQIList(area, filtered);
  else if (activeSubModule === 'assemble') renderAssemblyList(area, filtered);
  else if (activeSubModule === 'adjust') renderAdjustmentList(area, filtered);
  else if (activeSubModule === 'dispatch') renderDispatchList(area, filtered);
  else if (activeSubModule === 'vehicle') renderVehicleList(area, filtered);
  else if (activeSubModule === 'vehicle-return') renderVehicleReturnList(area, filtered);
  else if (activeSubModule === 'spot-count') renderSpotCountList(area, filtered);
  else if (activeSubModule === 'revalue') renderRevalueList(area, filtered);
};

// ============================================================
// Universal Excel Export for the Active Operational Sub-module
// ============================================================

window.exportActiveOpsSubModuleExcel = async () => {
  if (!activeListCache || activeListCache.length === 0) {
    showToast("لا توجد بيانات متاحة للتصدير", "warning");
    return;
  }

  try {
    let title = "سجلات العمليات المخزنية";
    let headers = [];
    let rows = [];

    if (activeSubModule === 'request') {
      title = "سجل طلبات الشراء وعروض الأسعار";
      headers = ["رقم الطلب", "التاريخ", "المستودع", "المورد / المشروع", "عدد الأصناف", "الحالة", "البيان"];
      rows = activeListCache.map(d => [
        d.rfqNumber || d.number || d.id,
        d.date || d.requestDate || "",
        d.warehouseName || "",
        d.supplierName || d.projectName || "طلب عام",
        (d.items || []).length,
        d.status || "draft",
        d.notes || ""
      ]);
    } else if (activeSubModule === 'po') {
      title = "سجل أوامر الشراء الرسمية";
      headers = ["رقم أمر الشراء", "التاريخ", "المورد", "المستودع", "عدد الأصناف", "الإجمالي المالي (ر.س)", "الحالة", "الملاحظات"];
      rows = activeListCache.map(d => {
        const total = (d.items || []).reduce((s,i) => s + (i.qty * i.unitPrice), 0);
        return [
          d.poNumber || d.id,
          d.date || "",
          d.supplierName || "",
          d.warehouseName || "",
          (d.items || []).length,
          total.toFixed(2),
          d.status || "",
          d.notes || ""
        ];
      });
    } else if (activeSubModule === 'grpo') {
      title = "سجل أذونات استلام البضاعة";
      headers = ["رقم الإذن", "التاريخ", "أمر الشراء", "المورد", "المستودع", "قيمة الاستلام", "الحالة"];
      rows = activeListCache.map(d => [
        d.grpoNumber || d.id,
        d.date || "",
        d.poNumber || "",
        d.supplierName || "",
        d.warehouseName || "",
        (d.totalValue || 0).toFixed(2),
        d.status || ""
      ]);
    } else if (activeSubModule === 'inspect') {
      title = "سجل محاضر فحص الجودة ومطابقة الأغذية";
      headers = ["رقم الفحص", "التاريخ", "الصنف", "التشغيلة", "درجة الحرارة", "المستودع", "النتيجة", "ملاحظات الفحص"];
      rows = activeListCache.map(d => [
        d.inspectionNumber || d.id,
        d.date || "",
        d.productName || "",
        d.batchNumber || "",
        d.temperature || "",
        d.warehouseName || "",
        d.status === 'passed' ? "مطابق ومقبول" : (d.status === 'failed' ? "مرفوض للتلف" : "مقبول مشروط"),
        d.notes || ""
      ]);
    } else if (activeSubModule === 'adjust') {
      title = "سجل تسويات المخزون وإعدام التوالف";
      headers = ["التاريخ", "نوع المعاملة", "المستودع", "عدد الأصناف", "إجمالي التكلفة", "البيان"];
      rows = activeListCache.map(d => [
        d.date || "",
        d.type || "",
        d.warehouseName || "",
        (d.lines || []).length,
        (d.totalCost || 0).toFixed(2),
        d.notes || ""
      ]);
    } else {
      title = `سجل عمليات ${activeSubModule}`;
      headers = ["المعرف", "التاريخ", "المستودع", "البيان"];
      rows = activeListCache.map(d => [
        d.id,
        d.date || "",
        d.warehouseName || "",
        d.notes || ""
      ]);
    }

    await exportToExcel({
      title,
      headers,
      rows,
      user: "مستخدم النظام"
    });
    showToast("تم تصدير الجدول إلى Excel بنجاح", "success");
  } catch (err) {
    showToast(`فشل التصدير: ${err.message}`, "error");
  }
};

window.exportOpsToCSV = window.exportActiveOpsSubModuleExcel;

// Universal Print List for Active Operational Sub-module
window.printActiveOpsTable = () => {
  const content = document.getElementById("ops-content-area");
  if (!content) return;
  const select = document.getElementById("ops-submodule-select");
  const subName = select?.options[select.selectedIndex]?.text || "العمليات المخزنية";

  const printHtml = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${subName}</title>
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
      <h2>${subName}</h2>
      <p style="margin:2px 0; color:#64748b; font-size:10px;">مؤسسة ادهام للمواد الغذائية — إدارة المستودعات وسلاسل الإمداد</p>
    </div>
    <div style="font-size:10px; color:#64748b;">
      تاريخ الطباعة: ${new Date().toLocaleString("ar-SA")}
    </div>
  </div>
  ${content.innerHTML}
  <script>window.print();</script>
</body>
</html>`;

  window.printOpsDocument(printHtml, subName);
};


// ============================================================
// 4. Purchase Request (PR / RFQ) Subsystem
// ============================================================

window.addPRItem = () => {
  const sel = document.getElementById("pr-item-sel");
  const qty = parseFloat(document.getElementById("pr-item-qty").value) || 0;
  if (!sel.value || qty <= 0) {
    showToast("يرجى اختيار صنف وتحديد كمية صحيحة", "warning");
    return;
  }

  const prod = products.find(p => p.id === sel.value);
  if (prItems.some(i => i.productId === sel.value)) {
    showToast("هذا الصنف مضاف بالفعل للطلب", "warning");
    return;
  }
  prItems.push({
    productId: sel.value,
    name: prod?.name || "صنف",
    productName: prod?.name || "صنف",
    sku: prod?.sku || "",
    unit: prod?.unit || "حبة",
    qty: qty,
    unitPrice: prod?.costPrice || 0
  });
  renderPRLines();
  sel.value = "";
  document.getElementById("pr-item-qty").value = "1";
};

window.addFreePRItem = () => {
  const nameInput = document.getElementById("pr-free-name");
  const qtyInput = document.getElementById("pr-free-qty");
  const name = nameInput ? nameInput.value.trim() : "";
  const qty = parseFloat(qtyInput ? qtyInput.value : "1") || 1;
  if (!name) {
    showToast("يرجى كتابة اسم الصنف اليدوي أولاً", "warning");
    return;
  }
  prItems.push({
    productId: `custom_${Date.now()}`,
    name,
    productName: name,
    sku: "حر",
    unit: "بند",
    qty,
    unitPrice: 0,
    isCustom: true
  });
  nameInput.value = "";
  if (qtyInput) qtyInput.value = "1";
  renderPRLines();
  showToast("تمت إضافة البند الحر بنجاح", "success");
};

function renderPRLines() {
  const tbody = document.getElementById("pr-lines-tbody");
  if (!tbody) return;
  tbody.innerHTML = prItems.map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td class="mono font-bold text-dim">${item.sku || "—"}</td>
      <td>
        ${item.isCustom ? '<span class="badge" style="background:#dcfce7; color:#166534; font-size:10px; margin-left:6px; padding:1px 5px; border-radius:4px; border:1px solid #86efac;">بند حر ✍️</span>' : ''}
        <strong>${item.name || item.productName}</strong>
      </td>
      <td class="mono font-bold text-primary" style="font-size:13px;">${formatQuantity(item.qty)} ${item.unit || ""}</td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="window.removePRItem(${idx})">✕</button></td>
    </tr>
  `).join("");
}

window.removePRItem = (idx) => {
  prItems.splice(idx, 1);
  renderPRLines();
};

window.savePurchaseRequest = async () => {
  const errEl = document.getElementById("pr-error");
  errEl.classList.add("hidden");

  if (!prItems.length) {
    errEl.textContent = "يرجى إضافة صنف واحد على الأقل للطلب";
    errEl.classList.remove("hidden");
    return;
  }

  const btn = document.getElementById("save-pr-btn");
  btn.disabled = true;

  try {
    const whId = document.getElementById("pr-wh").value;
    const wh = warehouses.find(w => w.id === whId);
    const suppId = document.getElementById("pr-supplier").value;
    const supp = suppliers.find(s => s.id === suppId);
    const date = document.getElementById("pr-date").value || todayString();
    const reqNum = `PR-${date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    await create(COLS.purchaseRequests(), {
      number: reqNum,
      rfqNumber: reqNum,
      date: date,
      warehouseId: whId,
      warehouseName: wh?.name || "المستودع الرئيسي",
      supplierId: suppId || "general",
      supplierName: supp?.name || "طلب تسعير عام للموردين",
      items: prItems,
      notes: document.getElementById("pr-notes").value.trim(),
      status: "pending_approval",
      createdAt: new Date().toISOString()
    });

    showToast("تم حفظ وتقديم طلب الشراء للاعتماد بنجاح", "success");
    closeModal("pr-modal");
    switchOpsSubModule("request");
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

function resolveItemName(item) {
  if (!item) return "صنف غير محدد";
  if (item.productName && item.productName !== "undefined") return item.productName;
  if (item.name && item.name !== "undefined") return item.name;
  if (item.productId) {
    const p = products.find(x => x.id === item.productId);
    if (p && p.name) return p.name;
  }
  return item.sku || "صنف غير محدد";
}

function renderPRList(container, prs) {
  if (prs.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">📋</div>
        <div style="font-size:16px; font-weight:700;">لا توجد طلبات شراء مسجلة</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لإنشاء طلب احتياج مخزني أو تسعير</p>
      </div>`;
    return;
  }

  container.innerHTML = `
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
            ${prs.map(p => {
              const docNum = p.rfqNumber || p.number || p.requestNo || `PR-${p.id.slice(0, 6)}`;
              const docDate = p.date || p.requestDate || (p.createdAt ? p.createdAt.slice(0, 10) : "—");
              const whName = p.warehouseName || (p.warehouseId && warehouses.find(w => w.id === p.warehouseId)?.name) || "المستودع الرئيسي";
              const suppName = p.supplierName || (p.supplierId && suppliers.find(s => s.id === p.supplierId)?.name) || p.project || "طلب عام";

              const itemsList = p.items || p.lines || [];
              let itemsSummary = "—";
              if (itemsList.length > 0) {
                const firstTwo = itemsList.slice(0, 2).map(it => `${resolveItemName(it)} (${formatQuantity(it.qty)})`).join("، ");
                itemsSummary = itemsList.length > 2 
                  ? `${firstTwo} <span class="badge font-bold" style="background:#e0e7ff; color:#3730a3; font-size:10.5px;">+${itemsList.length - 2} أصناف أخرى</span>`
                  : firstTwo;
              }

              let statusBadge = "";
              if (p.status === 'approved') statusBadge = '<span class="badge good font-bold">✅ معتمد</span>';
              else if (p.status === 'rejected') statusBadge = '<span class="badge bad font-bold">❌ مرفوض</span>';
              else if (p.status === 'ordered' || p.status === 'converted') statusBadge = '<span class="badge font-bold" style="background:#e0e7ff; color:#3730a3;">📜 محول لأمر شراء</span>';
              else if (p.status === 'sent') statusBadge = '<span class="badge info font-bold">📤 مرسل للموردين</span>';
              else if (p.status === 'draft') statusBadge = '<span class="badge font-bold" style="background:#f1f5f9; color:#475569;">📝 مسودة</span>';
              else statusBadge = '<span class="badge warn font-bold">⏳ قيد الاعتماد</span>';

              return `
                <tr>
                  <td class="mono font-bold text-primary">${docNum}</td>
                  <td>${docDate}</td>
                  <td><strong>${whName}</strong></td>
                  <td>${suppName}</td>
                  <td style="max-width:320px;">${itemsSummary}</td>
                  <td>${statusBadge}</td>
                  <td class="no-print" style="text-align:center; white-space:nowrap;">
                    <button class="btn btn-sm btn-ghost text-primary" onclick="window.showPRDetail('${p.id}')" title="معاينة تفاصيل الطلب">👁️ معاينة</button>
                    <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printPRDetail('${p.id}')" title="طباعة طلب الشراء كـ PDF">🖨️ طباعة</button>
                    <button class="btn btn-sm btn-ghost text-good" onclick="window.convertPRToPO('${p.id}')" title="تحويل الطلب فوراً لأمر شراء مالي">📜 تحويل لـ PO</button>
                    ${(p.status === 'pending_approval' || p.status === 'draft') ? `
                      <button class="btn btn-sm btn-ghost text-good" onclick="window.approvePR('${p.id}', 'approved')" title="اعتماد الطلب">✔️ اعتماد</button>
                      <button class="btn btn-sm btn-ghost text-bad" onclick="window.approvePR('${p.id}', 'rejected')" title="رفض الطلب">❌ رفض</button>
                    ` : ''}
                    <button class="btn btn-sm btn-ghost text-bad" onclick="window.deletePR('${p.id}')" title="حذف السجل">🗑️</button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.showPRDetail = async (id) => {
  const pr = activeListCache.find(x => x.id === id) || (await getDoc(doc(db, `companies/${COMPANY_ID}/purchaseRequests`, id))).data();
  if (!pr) {
    showToast("طلب الشراء غير موجود", "error");
    return;
  }
  activeDetailDoc = { id, ...pr };

  const docNum = pr.rfqNumber || pr.number || pr.requestNo || `PR-${id.slice(0, 6)}`;
  document.getElementById("pr-detail-title").textContent = `📋 طلب شراء رقم: ${docNum}`;

  const itemsList = pr.items || pr.lines || [];
  const whName = pr.warehouseName || (pr.warehouseId && warehouses.find(w => w.id === pr.warehouseId)?.name) || "المستودع الرئيسي";
  const suppName = pr.supplierName || (pr.supplierId && suppliers.find(s => s.id === pr.supplierId)?.name) || "طلب تسعير عام";

  const bodyEl = document.getElementById("pr-detail-body");
  bodyEl.innerHTML = `
    <div class="grid-3 gap-12 mb-16" style="background:var(--bg-2); padding:12px 16px; border-radius:8px; border:1px solid var(--border-soft);">
      <div><span class="dim" style="font-size:11px;">تاريخ الطلب:</span> <strong class="mono">${pr.date || pr.requestDate || "—"}</strong></div>
      <div><span class="dim" style="font-size:11px;">المستودع المطلوب:</span> <strong>${whName}</strong></div>
      <div><span class="dim" style="font-size:11px;">المورد المقترح:</span> <strong>${suppName}</strong></div>
      <div><span class="dim" style="font-size:11px;">الحالة:</span> <strong>${pr.status || "draft"}</strong></div>
      <div style="grid-column:span 2;"><span class="dim" style="font-size:11px;">البيان / الملاحظات:</span> <strong>${pr.notes || "—"}</strong></div>
    </div>

    <h4 style="margin:0 0 10px 0; font-size:13px; font-weight:700;">قائمة الأصناف المطلوبة (${itemsList.length} أصناف):</h4>
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
          ${itemsList.map((it, idx) => {
            const name = resolveItemName(it);
            const price = parseFloat(it.offeredPrice || it.unitPrice || 0);
            const total = (parseFloat(it.qty || 0) * price);
            return `
              <tr>
                <td>${idx + 1}</td>
                <td class="mono font-bold text-dim">${it.sku || "—"}</td>
                <td><strong>${name}</strong></td>
                <td>${it.unit || "حبة"}</td>
                <td class="mono font-bold text-primary" style="text-align:center; font-size:13px;">${formatQuantity(it.qty)}</td>
                <td class="mono" style="text-align:left;">${price > 0 ? formatCurrency(price) : "—"}</td>
                <td class="mono font-bold" style="text-align:left;">${total > 0 ? formatCurrency(total) : "—"}</td>
                <td style="font-size:11px; color:var(--text-2);">${it.notes || "—"}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;

  const actionsEl = document.getElementById("pr-detail-actions");
  actionsEl.innerHTML = `
    <button class="btn btn-secondary" onclick="window.printPRDetail('${id}')">🖨️ طباعة PDF رسمية</button>
    <button class="btn btn-primary" onclick="closeModal('pr-detail-modal'); window.convertPRToPO('${id}')">📜 تحويل لأمر شراء (PO)</button>
  `;

  openModal("pr-detail-modal");
};

window.printPRDetail = async (id) => {
  const pr = activeListCache.find(x => x.id === id) || (await getDoc(doc(db, `companies/${COMPANY_ID}/purchaseRequests`, id))).data();
  if (!pr) {
    showToast("طلب الشراء غير موجود للطباعة", "error");
    return;
  }

  const docNum = pr.rfqNumber || pr.number || pr.requestNo || `PR-${id.slice(0, 6)}`;
  const docDate = pr.date || pr.requestDate || (pr.createdAt ? pr.createdAt.slice(0, 10) : "—");
  const whName = pr.warehouseName || (pr.warehouseId && warehouses.find(w => w.id === pr.warehouseId)?.name) || "المستودع الرئيسي";
  const suppName = pr.supplierName || (pr.supplierId && suppliers.find(s => s.id === pr.supplierId)?.name) || "طلب تسعير عام للموردين";
  const itemsList = pr.items || pr.lines || [];

  let totalEstimatedValue = 0;
  itemsList.forEach(it => {
    const p = parseFloat(it.offeredPrice || it.unitPrice || 0);
    totalEstimatedValue += (parseFloat(it.qty || 0) * p);
  });

  const metaHtml = `
    <div class="meta-item"><div class="meta-label">رقم الطلب / RFQ:</div><div class="meta-val mono font-bold">${docNum}</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ الطلب:</div><div class="meta-val mono">${docDate}</div></div>
    <div class="meta-item"><div class="meta-label">مستودع الوجهة:</div><div class="meta-val">${whName}</div></div>
    <div class="meta-item"><div class="meta-label">المورد المقترح:</div><div class="meta-val">${suppName}</div></div>
    <div class="meta-item"><div class="meta-label">حالة الطلب:</div><div class="meta-val">${pr.status === 'approved' ? "معتمد" : (pr.status === 'ordered' ? "أمر شراء" : "قيد الدراسة والاعتماد")}</div></div>
  `;

  const contentHtml = `
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
        ${itemsList.map((it, idx) => {
          const name = resolveItemName(it);
          const price = parseFloat(it.offeredPrice || it.unitPrice || 0);
          const total = (parseFloat(it.qty || 0) * price);
          return `
            <tr>
              <td style="text-align:center;">${idx + 1}</td>
              <td class="mono font-bold" style="text-align:center;">${it.sku || "—"}</td>
              <td><strong>${name}</strong></td>
              <td style="text-align:center;">${it.unit || "حبة"}</td>
              <td class="mono font-bold" style="text-align:center; font-size:12px;">${formatQuantity(it.qty)}</td>
              <td class="mono" style="text-align:left;">${price > 0 ? formatCurrency(price) : "—"}</td>
              <td class="mono font-bold" style="text-align:left;">${total > 0 ? formatCurrency(total) : "—"}</td>
              <td style="font-size:10.5px; color:#64748b;">${it.notes || "—"}</td>
            </tr>
          `;
        }).join("")}
      </tbody>
      ${totalEstimatedValue > 0 ? `
        <tfoot>
          <tr>
            <td colspan="6" style="text-align:right;">إجمالي التكلفة التقديرية للطلب:</td>
            <td class="mono font-bold" style="text-align:left;">${formatCurrency(totalEstimatedValue)}</td>
            <td></td>
          </tr>
        </tfoot>
      ` : ""}
    </table>
  `;

  const signaturesHtml = `
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
  `;

  const html = wrapOpsPrintLayout({
    title: `طلب شراء واحتياج مخزني #${docNum}`,
    docBadge: `<span class="doc-badge ${pr.status === 'approved' ? 'good' : 'warn'}">${pr.status === 'approved' ? 'طلب معتمد رسمياً' : 'طلب شراء واحتياج'}</span>`,
    metaHtml,
    contentHtml,
    signaturesHtml,
    footerNotes: pr.notes || "يخضع أمر الشراء لموافقة الإدارة المالية وتأكيد شروط التوريد ومطابقة المواصفات القياسية."
  });

  window.printOpsDocument(html, `PR-${docNum}`);
};

window.convertPRToPO = async (prId) => {
  const pr = activeListCache.find(x => x.id === prId) || (await getDoc(doc(db, `companies/${COMPANY_ID}/purchaseRequests`, prId))).data();
  if (!pr) {
    showToast("تعذر العثور على طلب الشراء للتحويل", "error");
    return;
  }

  poItems = [];
  const itemsList = pr.items || pr.lines || [];

  itemsList.forEach(it => {
    const prod = products.find(p => p.id === it.productId) || {};
    const cost = parseFloat(it.offeredPrice || it.unitPrice || prod.costPrice || 0);
    const qty = parseFloat(it.qty || 1);
    poItems.push({
      productId: it.productId || prod.id || "",
      name: resolveItemName(it),
      sku: it.sku || prod.sku || "",
      qty: qty,
      unitPrice: cost
    });
  });

  const suppSelect = document.getElementById("po-supplier");
  if (suppSelect && pr.supplierId && pr.supplierId !== "general") {
    suppSelect.value = pr.supplierId;
  }

  const whSelect = document.getElementById("po-wh");
  if (whSelect && pr.warehouseId) {
    whSelect.value = pr.warehouseId;
  }

  const notesEl = document.getElementById("po-notes");
  if (notesEl) {
    notesEl.value = `تم الإصدار بناءً على طلب الشراء رقم #${pr.rfqNumber || pr.number || prId.slice(0, 8)}`;
  }

  renderPOLines();
  openModal("po-modal");
  showToast(`تم استيراد ${poItems.length} صنف من طلب الشراء بنجاح إلى أمر الشراء`, "info");
};

window.approvePR = async (id, status) => {
  const actionText = status === 'approved' ? 'اعتماد وموافقة على' : 'رفض';
  if (confirm(`هل أنت متأكد من ${actionText} طلب الشراء هذا؟`)) {
    try {
      await update("purchaseRequests", id, { status });
      showToast(`تم تحديث حالة طلب الشراء إلى (${status === 'approved' ? 'معتمد' : 'مرفوض'})`, "success");
      switchOpsSubModule("request");
    } catch (err) {
      showToast(err.message, "error");
    }
  }
};

window.deletePR = async (id) => {
  if (confirm("هل أنت متأكد من حذف طلب الشراء هذا نهائياً؟")) {
    try {
      await deleteDoc(doc(db, `companies/${COMPANY_ID}/purchaseRequests`, id));
      showToast("تم حذف طلب الشراء بنجاح", "success");
      switchOpsSubModule("request");
    } catch (err) {
      showToast(err.message, "error");
    }
  }
};

// ============================================================
// 5. Purchase Order (PO) Subsystem
// ============================================================

window.onPOSelItemChange = (val) => {
  const prod = products.find(p => p.id === val);
  const cost = parseFloat(prod?.costPrice || 0);
  const costInput = document.getElementById("po-item-cost");
  if (costInput) costInput.value = cost.toFixed(2);
};

window.addPOItem = () => {
  const sel = document.getElementById("po-item-sel");
  const qty = parseFloat(document.getElementById("po-item-qty").value) || 0;
  const cost = parseFloat(document.getElementById("po-item-cost").value) || 0;
  if (!sel.value || qty <= 0 || cost < 0) {
    showToast("يرجى اختيار صنف وتحديد كمية وسعر صحيحين", "warning");
    return;
  }

  const prod = products.find(p => p.id === sel.value);
  if (poItems.some(i => i.productId === sel.value)) {
    showToast("هذا الصنف مضاف بالفعل للأمر", "warning");
    return;
  }

  poItems.push({
    productId: sel.value,
    name: prod?.name || "صنف",
    sku: prod?.sku || "",
    qty: qty,
    unitPrice: cost
  });

  renderPOLines();
  sel.value = "";
  document.getElementById("po-item-cost").value = "0.00";
  document.getElementById("po-item-qty").value = "1";
};

function renderPOLines() {
  const tbody = document.getElementById("po-lines-tbody");
  if (!tbody) return;

  let totalCost = 0;
  tbody.innerHTML = poItems.map((item, idx) => {
    const lineTotal = item.qty * item.unitPrice;
    totalCost += lineTotal;
    return `
      <tr>
        <td class="mono font-bold text-dim">${item.sku || "—"}</td>
        <td><strong>${item.name}</strong></td>
        <td class="mono font-bold text-primary">${formatQuantity(item.qty)}</td>
        <td class="mono">${formatCurrency(item.unitPrice)}</td>
        <td class="mono font-bold">${formatCurrency(lineTotal)}</td>
        <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="window.removePOItem(${idx})">✕</button></td>
      </tr>
    `;
  }).join("");

  const label = document.getElementById("po-total-cost-label");
  if (label) label.textContent = formatCurrency(totalCost);
}

window.removePOItem = (idx) => {
  poItems.splice(idx, 1);
  renderPOLines();
};

window.savePurchaseOrder = async () => {
  const errEl = document.getElementById("po-error");
  errEl.classList.add("hidden");

  const suppId = document.getElementById("po-supplier").value;
  const whId = document.getElementById("po-wh").value;

  if (!suppId || !whId || !poItems.length) {
    errEl.textContent = "يرجى اختيار المورد والمستودع وإضافة صنف واحد على الأقل";
    errEl.classList.remove("hidden");
    return;
  }

  const btn = document.getElementById("save-po-btn");
  btn.disabled = true;

  try {
    const date = document.getElementById("po-date").value || todayString();
    const poNum = `PO-${date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const supp = suppliers.find(s => s.id === suppId);
    const wh = warehouses.find(w => w.id === whId);
    const total = poItems.reduce((s, i) => s + (i.qty * i.unitPrice), 0);

    await create(COLS.purchaseOrders(), {
      poNumber: poNum,
      number: poNum,
      date: date,
      supplierId: suppId,
      supplierName: supp?.name || "مورد غير محدد",
      warehouseId: whId,
      warehouseName: wh?.name || "المستودع الرئيسي",
      items: poItems,
      totalValue: total,
      notes: document.getElementById("po-notes").value.trim(),
      status: "ordered",
      createdAt: new Date().toISOString()
    });

    showToast("تم إصدار أمر الشراء بنجاح", "success");
    closeModal("po-modal");
    switchOpsSubModule("po");
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

function renderPOList(container, pos) {
  if (pos.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">📜</div>
        <div style="font-size:16px; font-weight:700;">لا توجد أوامر شراء مسجلة</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لإصدار أمر شراء مالي معتمد للمورد</p>
      </div>`;
    return;
  }

  container.innerHTML = `
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
            ${pos.map(p => {
              const total = (p.items || []).reduce((s, i) => s + (i.qty * i.unitPrice), 0);
              let statusBadge = "";
              if (p.status === 'received') statusBadge = '<span class="badge good font-bold">📦 مستلم بالكامل</span>';
              else if (p.status === 'cancelled') statusBadge = '<span class="badge bad font-bold">❌ ملغي</span>';
              else statusBadge = '<span class="badge warn font-bold">⏳ مفتوح / قيد التوريد</span>';

              return `
                <tr>
                  <td class="mono font-bold text-primary">${p.poNumber || p.number || p.id}</td>
                  <td>${p.date}</td>
                  <td><strong>${p.supplierName}</strong></td>
                  <td>${p.warehouseName}</td>
                  <td class="mono font-bold" style="text-align:center;">${(p.items || []).length}</td>
                  <td class="mono font-bold text-indigo" style="font-size:13px;">${formatCurrency(total)}</td>
                  <td>${statusBadge}</td>
                  <td class="no-print" style="text-align:center; white-space:nowrap;">
                    <button class="btn btn-sm btn-ghost text-primary" onclick="window.showPODetail('${p.id}')" title="معاينة تفاصيل أمر الشراء">👁️ معاينة</button>
                    <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printPODetail('${p.id}')" title="طباعة أمر الشراء المالي">🖨️ طباعة</button>
                    ${p.status === 'ordered' ? `
                      <button class="btn btn-sm btn-ghost text-good font-bold" onclick="window.convertPOToGRPO('${p.id}')" title="تحويل فوراً إلى إذن استلام بضاعة مخزني">📦 استلام بضاعة</button>
                      <button class="btn btn-sm btn-ghost text-bad" onclick="window.cancelPO('${p.id}')" title="إلغاء أمر الشراء">❌ إلغاء</button>
                    ` : ''}
                    <button class="btn btn-sm btn-ghost text-bad" onclick="window.deletePO('${p.id}')" title="حذف السجل">🗑️</button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.showPODetail = async (id) => {
  const po = activeListCache.find(x => x.id === id) || (await getDoc(doc(db, `companies/${COMPANY_ID}/purchaseOrders`, id))).data();
  if (!po) {
    showToast("أمر الشراء غير موجود", "error");
    return;
  }

  activeDetailDoc = { id, ...po };
  document.getElementById("po-detail-title").textContent = `📜 أمر شراء رقم: ${po.poNumber || id}`;

  const itemsList = po.items || [];
  const total = itemsList.reduce((s, i) => s + (i.qty * i.unitPrice), 0);

  const bodyEl = document.getElementById("po-detail-body");
  bodyEl.innerHTML = `
    <div class="grid-3 gap-12 mb-16" style="background:var(--bg-2); padding:12px 16px; border-radius:8px; border:1px solid var(--border-soft);">
      <div><span class="dim" style="font-size:11px;">رقم الأمر:</span> <strong class="mono font-bold text-primary">${po.poNumber || id}</strong></div>
      <div><span class="dim" style="font-size:11px;">تاريخ الأمر:</span> <strong class="mono">${po.date}</strong></div>
      <div><span class="dim" style="font-size:11px;">المورد:</span> <strong>${po.supplierName}</strong></div>
      <div><span class="dim" style="font-size:11px;">المستودع المستلم:</span> <strong>${po.warehouseName}</strong></div>
      <div><span class="dim" style="font-size:11px;">الحالة:</span> <strong>${po.status || "ordered"}</strong></div>
      <div><span class="dim" style="font-size:11px;">الإجمالي المالي:</span> <strong class="mono font-bold text-good">${formatCurrency(total)}</strong></div>
      <div style="grid-column:span 3;"><span class="dim" style="font-size:11px;">شروط وملاحظات:</span> <strong>${po.notes || "—"}</strong></div>
    </div>

    <h4 style="margin:0 0 10px 0; font-size:13px; font-weight:700;">قائمة الأصناف المطلوبة (${itemsList.length} أصناف):</h4>
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
          ${itemsList.map((it, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td class="mono font-bold text-dim">${it.sku || "—"}</td>
              <td><strong>${it.name}</strong></td>
              <td class="mono font-bold text-primary" style="text-align:center; font-size:13px;">${formatQuantity(it.qty)}</td>
              <td class="mono" style="text-align:left;">${formatCurrency(it.unitPrice)}</td>
              <td class="mono font-bold" style="text-align:left;">${formatCurrency(it.qty * it.unitPrice)}</td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr style="font-weight:bold; background:var(--bg-hover);">
            <td colspan="5" style="text-align:right;">الإجمالي الكلي:</td>
            <td class="mono font-bold text-good" style="text-align:left; font-size:14px;">${formatCurrency(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  const actionsEl = document.getElementById("po-detail-actions");
  actionsEl.innerHTML = `
    <button class="btn btn-secondary" onclick="window.printPODetail('${id}')">🖨️ طباعة أمر الشراء</button>
    ${po.status === 'ordered' ? `
      <button class="btn btn-primary" onclick="closeModal('po-detail-modal'); window.convertPOToGRPO('${id}')">📦 استلام البضاعة (GRPO)</button>
    ` : ''}
  `;

  openModal("po-detail-modal");
};

window.printPODetail = async (id) => {
  const po = activeListCache.find(x => x.id === id) || (await getDoc(doc(db, `companies/${COMPANY_ID}/purchaseOrders`, id))).data();
  if (!po) {
    showToast("أمر الشراء غير موجود للطباعة", "error");
    return;
  }

  const itemsList = po.items || [];
  const total = itemsList.reduce((s, i) => s + (i.qty * i.unitPrice), 0);

  const metaHtml = `
    <div class="meta-item"><div class="meta-label">رقم أمر الشراء:</div><div class="meta-val mono font-bold text-primary">${po.poNumber || id}</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ الأمر:</div><div class="meta-val mono">${po.date}</div></div>
    <div class="meta-item"><div class="meta-label">المورد المعتمد:</div><div class="meta-val">${po.supplierName}</div></div>
    <div class="meta-item"><div class="meta-label">مستودع الاستلام:</div><div class="meta-val">${po.warehouseName}</div></div>
    <div class="meta-item"><div class="meta-label">إجمالي القيمة:</div><div class="meta-val mono font-bold">${formatCurrency(total)}</div></div>
    <div class="meta-item"><div class="meta-label">الحالة:</div><div class="meta-val">${po.status === 'received' ? "مستلم بالكامل" : "أمر شراء ملزم"}</div></div>
  `;

  const contentHtml = `
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
        ${itemsList.map((it, idx) => `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td class="mono font-bold" style="text-align:center;">${it.sku || "—"}</td>
            <td><strong>${it.name}</strong></td>
            <td class="mono font-bold" style="text-align:center; font-size:12px;">${formatQuantity(it.qty)}</td>
            <td class="mono" style="text-align:left;">${formatCurrency(it.unitPrice)}</td>
            <td class="mono font-bold" style="text-align:left;">${formatCurrency(it.qty * it.unitPrice)}</td>
          </tr>
        `).join("")}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" style="text-align:right;">الإجمالي المالي العام لأمر الشراء:</td>
          <td class="mono font-bold" style="text-align:left; font-size:13px;">${formatCurrency(total)}</td>
        </tr>
      </tfoot>
    </table>
  `;

  const signaturesHtml = `
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
  `;

  const html = wrapOpsPrintLayout({
    title: `أمر شراء مالي ملزم #${po.poNumber || id}`,
    docBadge: `<span class="doc-badge good">أمر توريد مالي رسمي</span>`,
    metaHtml,
    contentHtml,
    signaturesHtml,
    footerNotes: po.notes || "يلتزم المورد بتسليم الأصناف الموضحة أعلاه مطابقة للمواصفات الغذائية وتواريخ الصلاحية المتفق عليها."
  });

  window.printOpsDocument(html, `PO-${po.poNumber || id}`);
};

window.convertPOToGRPO = async (poId) => {
  activeSubModule = "grpo";
  const select = document.getElementById("ops-submodule-select");
  if (select) select.value = "grpo";

  // Open GRPO modal and select the PO
  await window.openOpsModal();
  const poSelect = document.getElementById("grpo-po-select");
  if (poSelect) {
    poSelect.value = poId;
    await window.loadPOToGRPO(poId);
  }
};

window.cancelPO = async (id) => {
  if (confirm("هل تريد إلغاء أمر الشراء هذا؟")) {
    try {
      await update("purchaseOrders", id, { status: "cancelled" });
      showToast("تم إلغاء أمر الشراء", "success");
      switchOpsSubModule("po");
    } catch(err) {
      showToast(err.message, "error");
    }
  }
};

window.deletePO = async (id) => {
  if (confirm("هل أنت متأكد من حذف أمر الشراء نهائياً؟")) {
    try {
      await deleteDoc(doc(db, `companies/${COMPANY_ID}/purchaseOrders`, id));
      showToast("تم حذف أمر الشراء", "success");
      switchOpsSubModule("po");
    } catch(err) {
      showToast(err.message, "error");
    }
  }
};


// ============================================================
// 6. Goods Receipt PO (GRPO) Subsystem
// ============================================================

window.updateGrpoAltQty = (idx, factor) => {
  const row = document.querySelector(`#grpo-lines-tbody tr[data-idx="${idx}"]`);
  if (!row) return;
  const altInput = row.querySelector(".grpo-qty-alt");
  const baseInput = row.querySelector(".grpo-qty");
  if (!altInput || !baseInput) return;
  const altVal = parseFloat(altInput.value) || 0;
  baseInput.value = (altVal * (factor || 1)).toFixed(0);
};

window.updateGrpoBaseQty = (idx, factor) => {
  const row = document.querySelector(`#grpo-lines-tbody tr[data-idx="${idx}"]`);
  if (!row) return;
  const altInput = row.querySelector(".grpo-qty-alt");
  const baseInput = row.querySelector(".grpo-qty");
  if (!altInput || !baseInput) return;
  const baseVal = parseFloat(baseInput.value) || 0;
  altInput.value = ((factor && factor > 0) ? (baseVal / factor) : baseVal).toFixed(2);
};

window.loadPOToGRPO = async (poId) => {
  const tbody = document.getElementById("grpo-lines-tbody");
  const whSelect = document.getElementById("grpo-wh");
  const saveBtn = document.getElementById("save-grpo-btn");
  if (!poId) {
    tbody.innerHTML = `<tr><td colspan="6" class="dim" style="text-align:center; padding:20px;">يرجى اختيار أمر شراء لاستيراد بنوده</td></tr>`;
    saveBtn.disabled = true;
    return;
  }

  try {
    const snap = await getDoc(doc(db, `companies/${COMPANY_ID}/purchaseOrders`, poId));
    if (!snap.exists()) {
      showToast("تعذر العثور على أمر الشراء", "error");
      return;
    }
    activeGRPOPO = { id: snap.id, ...snap.data() };
    whSelect.value = activeGRPOPO.warehouseId;

    const items = activeGRPOPO.items || [];
    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="dim" style="text-align:center; padding:20px;">أمر الشراء لا يحتوي على أصناف</td></tr>`;
      saveBtn.disabled = true;
      return;
    }

    tbody.innerHTML = items.map((item, idx) => {
      const prod = products.find(p => p.id === item.productId) || {};
      const unit = prod.unit || "حبة";
      const altUnit = prod.altUnit || null;
      const factor = parseInt(prod.unitFactor) || 1;
      const baseQty = item.qty || 0;
      const altQty = (factor > 1) ? (baseQty / factor).toFixed(2) : baseQty;

      return `
        <tr data-idx="${idx}">
          <td>
            <strong>${item.sku} - ${item.name}</strong>
            <div class="dim" style="font-size:11px;">الكمية بأمر الشراء: ${item.qty} ${unit}</div>
          </td>
          <td>
            ${altUnit ? `
              <div style="display:flex; align-items:center; gap:4px;">
                <input type="number" class="input mono grpo-qty-alt" value="${altQty}" step="0.01" min="0" oninput="window.updateGrpoAltQty(${idx}, ${factor})" style="width:75px;" />
                <span class="dim" style="font-size:11px;">${altUnit}</span>
              </div>
            ` : `
              <span class="dim" style="font-size:11px;">—</span>
            `}
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:4px;">
              <input type="number" class="input mono font-bold grpo-qty" value="${baseQty}" min="1" oninput="window.updateGrpoBaseQty(${idx}, ${factor})" style="width:85px;" />
              <span class="dim" style="font-size:11px;">${unit}</span>
            </div>
          </td>
          <td>
            <input type="number" class="input mono grpo-cost" value="${item.unitPrice.toFixed(2)}" step="0.01" style="width:85px;" />
          </td>
          <td>
            <input type="text" class="input mono grpo-batch" placeholder="B-${Date.now().toString().slice(-4)}" style="width:110px;" />
          </td>
          <td>
            <input type="date" class="input grpo-expiry" style="width:130px;" />
          </td>
        </tr>
      `;
    }).join("");

    saveBtn.disabled = false;
  } catch(err) {
    showToast(err.message, "error");
  }
};

window.saveGRPO = async () => {
  const errEl = document.getElementById("grpo-error");
  errEl.classList.add("hidden");
  if (!activeGRPOPO) return;

  const rows = document.querySelectorAll("#grpo-lines-tbody tr");
  const lines = [];
  let totalValue = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const idx = parseInt(row.getAttribute("data-idx"));
    const originalItem = (activeGRPOPO.items || [])[idx];
    if (!originalItem) continue;

    const qtyInput = row.querySelector(".grpo-qty");
    const costInput = row.querySelector(".grpo-cost");
    const batchInput = row.querySelector(".grpo-batch");
    const expiryInput = row.querySelector(".grpo-expiry");
    const altInput = row.querySelector(".grpo-qty-alt");

    const qty = parseFloat(qtyInput?.value) || 0;
    const cost = parseFloat(costInput?.value) || 0;
    const batch = batchInput?.value.trim() || "";
    const expiry = expiryInput?.value || "";
    const qtyAlt = altInput ? parseFloat(altInput.value) || 0 : 0;

    if (qty <= 0 || cost <= 0) {
      errEl.textContent = "يرجى إدخال كميات وتكاليف صحيحة لكافة السطور المستلمة";
      errEl.classList.remove("hidden");
      return;
    }

    const prod = products.find(p => p.id === originalItem.productId) || {};

    lines.push({
      productId: originalItem.productId,
      sku: originalItem.sku,
      name: originalItem.name,
      qty,
      unitPrice: cost,
      batchNumber: batch || null,
      expiryDate: expiry || null,
      unit: prod.unit || "حبة",
      altUnit: prod.altUnit || null,
      unitFactor: parseInt(prod.unitFactor) || 1,
      qtyAlt: qtyAlt
    });
    totalValue += qty * cost;
  }

  const btn = document.getElementById("save-grpo-btn");
  btn.disabled = true;

  try {
    const date = document.getElementById("grpo-date").value || todayString();
    const grpoNum = `GRPO-${date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const whId = activeGRPOPO.warehouseId;

    const grpoId = await create(COLS.goodsReceiptPOs(), {
      grpoNumber: grpoNum,
      number: grpoNum,
      date,
      purchaseOrderId: activeGRPOPO.id,
      poNumber: activeGRPOPO.poNumber || activeGRPOPO.id,
      supplierId: activeGRPOPO.supplierId,
      supplierName: activeGRPOPO.supplierName,
      warehouseId: whId,
      warehouseName: activeGRPOPO.warehouseName,
      items: lines,
      totalValue,
      status: "received",
      createdAt: new Date().toISOString()
    });

    // Update stock levels and write inventory audit trails
    for (const line of lines) {
      await adjustStock(whId, line.productId, line.qty, {
        type: "purchase_in",
        sourceType: "goodsReceiptPO",
        sourceId: grpoId,
        purchasePrice: line.unitPrice,
        batchNumber: line.batchNumber,
        expiryDate: line.expiryDate
      });
    }

    // Update PO status
    await update("purchaseOrders", activeGRPOPO.id, { status: "received" });

    // Create Balanced Financial Journal Entry
    const invAccObj = allAccounts.find(a => a.code === "1-1-4-1-01") || allAccounts.find(a => a.code === "1-1-4-1") || { id: "INV_STOCK", code: "1-1-4-1-01", name: "مخزون مستودع المواد الغذائية" };
    const apAccObj  = allAccounts.find(a => a.code === "2-1-1-1-1")   || allAccounts.find(a => a.code === "2-1-1-1") || { id: "AP_SUPPLIERS", code: "2-1-1-1-1", name: "ذمم موردون محليون" };

    await createJournalEntry({
      date,
      description: `إذن استلام بضاعة مخزني #${grpoNum} لـ ${activeGRPOPO.supplierName}`,
      sourceType: "goodsReceiptPO",
      sourceId: grpoId,
      lines: [
        { accountId: invAccObj.id, accountCode: invAccObj.code, accountName: invAccObj.name, debit: totalValue, credit: 0, note: "إثبات استلام مخزون وارد" },
        { accountId: apAccObj.id,  accountCode: apAccObj.code,  accountName: apAccObj.name,  debit: 0, credit: totalValue, note: "إثبات التزام وارد للمورد" }
      ]
    });

    showToast("تم إثبات استلام البضاعة مخزنياً ومحاسبياً بنجاح", "success");
    closeModal("grpo-modal");
    switchOpsSubModule("grpo");
  } catch(err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

function renderGRPOList(container, grpos) {
  if (grpos.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">📦</div>
        <div style="font-size:16px; font-weight:700;">لا توجد أذونات استلام مخزنية</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لاستلام شحنة بضاعة قادمة من أمر شراء</p>
      </div>`;
    return;
  }

  container.innerHTML = `
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
            ${grpos.map(g => `
              <tr>
                <td class="mono font-bold text-primary">${g.grpoNumber || g.number || g.id}</td>
                <td>${g.date}</td>
                <td class="mono font-bold text-dim">${g.poNumber || "—"}</td>
                <td><strong>${g.supplierName}</strong></td>
                <td>${g.warehouseName}</td>
                <td class="mono font-bold" style="text-align:center;">${(g.items || []).length}</td>
                <td class="mono font-bold text-good" style="font-size:13px;">${formatCurrency(g.totalValue)}</td>
                <td><span class="badge good font-bold">✅ مستلم بالمخزن</span></td>
                <td class="no-print" style="text-align:center; white-space:nowrap;">
                  <button class="btn btn-sm btn-ghost text-primary" onclick="window.showGRPODetail('${g.id}')" title="معاينة تفاصيل الاستلام">👁️ معاينة</button>
                  <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printGRPODetail('${g.id}')" title="طباعة إذن استلام بضاعة">🖨️ طباعة</button>
                  <button class="btn btn-sm btn-ghost text-indigo font-bold" onclick="window.convertGRPOToInvoice('${g.id}')" title="تحويل فوراً إلى فاتورة مشتريات">🧾 فاتورة مشتريات</button>
                  <button class="btn btn-sm btn-ghost text-warn font-bold" onclick="window.convertGRPOToQI('${g.id}')" title="تحويل لفحص الجودة ومطابقة الأغذية">🔬 فحص جودة</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.showGRPODetail = async (id) => {
  const grpo = activeListCache.find(x => x.id === id) || (await getDoc(doc(db, `companies/${COMPANY_ID}/goodsReceiptPOs`, id))).data();
  if (!grpo) {
    showToast("إذن الاستلام غير موجود", "error");
    return;
  }

  activeDetailDoc = { id, ...grpo };
  document.getElementById("grpo-detail-title").textContent = `📦 إذن استلام بضاعة: ${grpo.grpoNumber || id}`;

  const itemsList = grpo.items || [];
  const bodyEl = document.getElementById("grpo-detail-body");
  bodyEl.innerHTML = `
    <div class="grid-3 gap-12 mb-16" style="background:var(--bg-2); padding:12px 16px; border-radius:8px; border:1px solid var(--border-soft);">
      <div><span class="dim" style="font-size:11px;">رقم الإذن:</span> <strong class="mono font-bold text-primary">${grpo.grpoNumber || id}</strong></div>
      <div><span class="dim" style="font-size:11px;">تاريخ الاستلام:</span> <strong class="mono">${grpo.date}</strong></div>
      <div><span class="dim" style="font-size:11px;">أمر الشراء المرجعي:</span> <strong class="mono">${grpo.poNumber || "—"}</strong></div>
      <div><span class="dim" style="font-size:11px;">المورد:</span> <strong>${grpo.supplierName}</strong></div>
      <div><span class="dim" style="font-size:11px;">مستودع التخزين:</span> <strong>${grpo.warehouseName}</strong></div>
      <div><span class="dim" style="font-size:11px;">إجمالي القيمة:</span> <strong class="mono font-bold text-good">${formatCurrency(grpo.totalValue)}</strong></div>
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
          ${itemsList.map((it, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td class="mono font-bold text-dim">${it.sku || "—"}</td>
              <td><strong>${it.name}</strong></td>
              <td>${it.unit || "حبة"}</td>
              <td class="mono font-bold text-primary" style="text-align:center; font-size:13px;">${formatQuantity(it.qty)}</td>
              <td class="mono" style="text-align:left;">${formatCurrency(it.unitPrice)}</td>
              <td class="mono font-bold">${it.batchNumber || "—"}</td>
              <td class="mono">${it.expiryDate || "—"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  const actionsEl = document.getElementById("grpo-detail-actions");
  actionsEl.innerHTML = `
    <button class="btn btn-secondary" onclick="window.printGRPODetail('${id}')">🖨️ طباعة إذن الاستلام</button>
    <button class="btn btn-primary" onclick="closeModal('grpo-detail-modal'); window.convertGRPOToInvoice('${id}')">🧾 تحويل لفاتورة مشتريات</button>
  `;

  openModal("grpo-detail-modal");
};

window.printGRPODetail = async (id) => {
  const grpo = activeListCache.find(x => x.id === id) || (await getDoc(doc(db, `companies/${COMPANY_ID}/goodsReceiptPOs`, id))).data();
  if (!grpo) {
    showToast("إذن الاستلام غير موجود للطباعة", "error");
    return;
  }

  const itemsList = grpo.items || [];
  const metaHtml = `
    <div class="meta-item"><div class="meta-label">رقم إذن الاستلام:</div><div class="meta-val mono font-bold text-primary">${grpo.grpoNumber || id}</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ الاستلام:</div><div class="meta-val mono">${grpo.date}</div></div>
    <div class="meta-item"><div class="meta-label">أمر الشراء المرجعي:</div><div class="meta-val mono">${grpo.poNumber || "—"}</div></div>
    <div class="meta-item"><div class="meta-label">المورد:</div><div class="meta-val">${grpo.supplierName}</div></div>
    <div class="meta-item"><div class="meta-label">مستودع الاستلام:</div><div class="meta-val">${grpo.warehouseName}</div></div>
    <div class="meta-item"><div class="meta-label">إجمالي القيمة:</div><div class="meta-val mono font-bold">${formatCurrency(grpo.totalValue)}</div></div>
  `;

  const contentHtml = `
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
        ${itemsList.map((it, idx) => `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td class="mono font-bold" style="text-align:center;">${it.sku || "—"}</td>
            <td><strong>${it.name}</strong></td>
            <td style="text-align:center;">${it.unit || "حبة"}</td>
            <td class="mono font-bold" style="text-align:center; font-size:12px;">${formatQuantity(it.qty)}</td>
            <td class="mono font-bold" style="text-align:center;">${it.batchNumber || "—"}</td>
            <td class="mono" style="text-align:center;">${it.expiryDate || "—"}</td>
            <td class="mono font-bold" style="text-align:left;">${formatCurrency(it.qty * it.unitPrice)}</td>
          </tr>
        `).join("")}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="7" style="text-align:right;">الإجمالي المالي لبضاعة الاستلام:</td>
          <td class="mono font-bold" style="text-align:left; font-size:13px;">${formatCurrency(grpo.totalValue)}</td>
        </tr>
      </tfoot>
    </table>
  `;

  const signaturesHtml = `
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
  `;

  const html = wrapOpsPrintLayout({
    title: `إذن استلام بضاعة مخزني معتمد #${grpo.grpoNumber || id}`,
    docBadge: `<span class="doc-badge good">إذن استلام بضاعة رسمي</span>`,
    metaHtml,
    contentHtml,
    signaturesHtml,
    footerNotes: "تم فحص البضاعة ومطابقة الأعداد وتواريخ الصلاحية مع الفاتورة وأمر الشراء المرفق."
  });

  window.printOpsDocument(html, `GRPO-${grpo.grpoNumber || id}`);
};

window.convertGRPOToInvoice = async (id) => {
  try {
    const snap = await getDoc(doc(db, `companies/${COMPANY_ID}/goodsReceiptPOs`, id));
    if (!snap.exists()) { showToast("إذن الاستلام غير موجود", "error"); return; }
    const g = { id: snap.id, ...snap.data() };

    sessionStorage.setItem("convert_grpo_to_invoice", JSON.stringify({
      grpoId:        g.id,
      grpoNumber:    g.grpoNumber || g.number || g.id,
      supplierId:    g.supplierId || "",
      supplierName:  g.supplierName || "",
      warehouseId:   g.warehouseId || "",
      warehouseName: g.warehouseName || "",
      items: (g.items || []).map(item => ({
        productId:   item.productId,
        productName: item.name,
        sku:         item.sku || "",
        unit:        item.unit || "حبة",
        qty:         item.qty || 0,
        unitPrice:   item.unitPrice || 0,
        batchNumber: item.batchNumber || "",
        expiryDate:  item.expiryDate || ""
      })),
      totalValue:    g.totalValue
    }));

    showToast("تم تجهيز بيانات إذن الاستلام بنجاح، جاري التحويل لشاشة فواتير المشتريات...", "success");
    if (typeof navigate === "function") {
      navigate("purchase-invoices");
    } else {
      window.location.hash = "#purchase-invoices";
    }
  } catch (err) {
    showToast(err.message, "error");
  }
};

window.convertGRPOToQI = async (grpoId) => {
  const grpo = activeListCache.find(x => x.id === grpoId) || (await getDoc(doc(db, `companies/${COMPANY_ID}/goodsReceiptPOs`, grpoId))).data();
  if (!grpo) return;

  const firstItem = (grpo.items || [])[0];
  activeSubModule = "inspect";
  const select = document.getElementById("ops-submodule-select");
  if (select) select.value = "inspect";

  await window.openOpsModal();
  if (firstItem) {
    const prodSelect = document.getElementById("qi-product");
    if (prodSelect) prodSelect.value = firstItem.productId;
    const batchInput = document.getElementById("qi-batch");
    if (batchInput) batchInput.value = firstItem.batchNumber || "";
    const expiryInput = document.getElementById("qi-expiry");
    if (expiryInput) expiryInput.value = firstItem.expiryDate || "";
  }
  const whSelect = document.getElementById("qi-wh");
  if (whSelect && grpo.warehouseId) whSelect.value = grpo.warehouseId;
  const notesInput = document.getElementById("qi-notes");
  if (notesInput) notesInput.value = `فحص استلام البضاعة لإذن رقم #${grpo.grpoNumber || grpoId}`;
};

// ============================================================
// 7. Quality Inspection (QI) Subsystem
// ============================================================

window.saveQualityInspection = async () => {
  const errEl = document.getElementById("qi-error");
  errEl.classList.add("hidden");

  const batch = document.getElementById("qi-batch").value.trim().toUpperCase();
  const temp = parseFloat(document.getElementById("qi-temp").value);
  const prodId = document.getElementById("qi-product").value;
  const whId = document.getElementById("qi-wh").value;
  const status = document.getElementById("qi-status").value;

  if (!batch || isNaN(temp) || !prodId || !whId) {
    errEl.textContent = "يرجى تعبئة كافة الحقول الإلزامية ودرجة الحرارة المستلمة";
    errEl.classList.remove("hidden");
    return;
  }

  const btn = document.getElementById("save-qi-btn");
  btn.disabled = true;

  try {
    const prod = products.find(p => p.id === prodId);
    const wh = warehouses.find(w => w.id === whId);
    const date = document.getElementById("qi-date").value || todayString();
    const qiNum = `QI-${date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    await create(COLS.qualityInspections(), {
      inspectionNumber: qiNum,
      number: qiNum,
      date,
      batchNumber: batch,
      temperature: temp,
      productId: prodId,
      productName: prod?.name || "صنف",
      sku: prod?.sku || "",
      productionDate: document.getElementById("qi-prod-date").value || null,
      expiryDate: document.getElementById("qi-expiry").value || null,
      warehouseId: whId,
      warehouseName: wh?.name || "المستودع الرئيسي",
      status,
      notes: document.getElementById("qi-notes").value.trim(),
      createdAt: new Date().toISOString()
    });

    showToast("تم اعتماد محضر فحص الجودة بنجاح", "success");
    closeModal("qi-modal");
    switchOpsSubModule("inspect");
  } catch(err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

function renderQIList(container, qis) {
  if (qis.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">🔬</div>
        <div style="font-size:16px; font-weight:700;">لا توجد محاضر فحص جودة مسجلة</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لتوثيق محضر فحص ومطابقة حرارية للمنتجات الغذائية</p>
      </div>`;
    return;
  }

  container.innerHTML = `
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
            ${qis.map(q => `
              <tr>
                <td class="mono font-bold text-primary">${q.inspectionNumber || q.number || q.id}</td>
                <td>${q.date}</td>
                <td><strong>${q.productName}</strong> <span class="dim mono font-bold">(${q.sku})</span></td>
                <td class="mono font-bold">${q.batchNumber}</td>
                <td class="mono font-bold" style="font-size:13px;">${q.temperature} °م</td>
                <td class="mono">${q.expiryDate || "—"}</td>
                <td>${q.warehouseName}</td>
                <td>
                  <span class="badge ${q.status === 'passed' ? 'good' : (q.status === 'failed' ? 'bad' : 'warn')} font-bold">
                    ${q.status === 'passed' ? '✅ مطابق ومقبول' : (q.status === 'failed' ? '❌ مرفوض للتلف' : '⚠️ مقبول مشروط')}
                  </span>
                </td>
                <td class="no-print" style="text-align:center; white-space:nowrap;">
                  <button class="btn btn-sm btn-ghost text-primary" onclick="window.showQIDetail('${q.id}')" title="معاينة محضر الفحص">👁️ معاينة</button>
                  <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printQIDetail('${q.id}')" title="طباعة شهادة ومحضر الفحص كـ PDF">🖨️ طباعة</button>
                  <button class="btn btn-sm btn-ghost text-bad" onclick="window.deleteQI('${q.id}')" title="حذف السجل">🗑️</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.showQIDetail = async (id) => {
  const qi = activeListCache.find(x => x.id === id) || (await getDoc(doc(db, `companies/${COMPANY_ID}/qualityInspections`, id))).data();
  if (!qi) {
    showToast("محضر الفحص غير موجود", "error");
    return;
  }

  activeDetailDoc = { id, ...qi };
  document.getElementById("qi-detail-title").textContent = `🔬 محضر فحص جودة: ${qi.inspectionNumber || id}`;

  const bodyEl = document.getElementById("qi-detail-body");
  bodyEl.innerHTML = `
    <div class="grid-2 gap-12 mb-16" style="background:var(--bg-2); padding:16px; border-radius:8px; border:1px solid var(--border-soft);">
      <div><span class="dim" style="font-size:11px;">رقم المحضر:</span> <strong class="mono font-bold text-primary">${qi.inspectionNumber || id}</strong></div>
      <div><span class="dim" style="font-size:11px;">تاريخ الفحص:</span> <strong class="mono">${qi.date}</strong></div>
      <div><span class="dim" style="font-size:11px;">الصنف:</span> <strong>${qi.productName} (${qi.sku})</strong></div>
      <div><span class="dim" style="font-size:11px;">التشغيلة:</span> <strong class="mono font-bold">${qi.batchNumber}</strong></div>
      <div><span class="dim" style="font-size:11px;">درجة الحرارة:</span> <strong class="mono font-bold" style="font-size:13px;">${qi.temperature} °م</strong></div>
      <div><span class="dim" style="font-size:11px;">المستودع المستهدف:</span> <strong>${qi.warehouseName}</strong></div>
      <div><span class="dim" style="font-size:11px;">تاريخ الإنتاج:</span> <strong class="mono">${qi.productionDate || "—"}</strong></div>
      <div><span class="dim" style="font-size:11px;">تاريخ الانتهاء:</span> <strong class="mono">${qi.expiryDate || "—"}</strong></div>
      <div style="grid-column:span 2;"><span class="dim" style="font-size:11px;">النتيجة العامة:</span> <strong class="badge ${qi.status === 'passed' ? 'good' : (qi.status === 'failed' ? 'bad' : 'warn')} font-bold">${qi.status === 'passed' ? 'مطابق ومقبول' : (qi.status === 'failed' ? 'مرفوض للتلف' : 'مقبول مشروط')}</strong></div>
      <div style="grid-column:span 2;"><span class="dim" style="font-size:11px;">ملاحظات الفاحص:</span> <strong>${qi.notes || "—"}</strong></div>
    </div>
  `;

  const actionsEl = document.getElementById("qi-detail-actions");
  actionsEl.innerHTML = `
    <button class="btn btn-secondary" onclick="window.printQIDetail('${id}')">🖨️ طباعة شهادة الفحص</button>
  `;

  openModal("qi-detail-modal");
};

window.printQIDetail = async (id) => {
  const qi = activeListCache.find(x => x.id === id) || (await getDoc(doc(db, `companies/${COMPANY_ID}/qualityInspections`, id))).data();
  if (!qi) return;

  const metaHtml = `
    <div class="meta-item"><div class="meta-label">رقم محضر الفحص:</div><div class="meta-val mono font-bold text-primary">${qi.inspectionNumber || id}</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ الفحص:</div><div class="meta-val mono">${qi.date}</div></div>
    <div class="meta-item"><div class="meta-label">الصنف المفحوص:</div><div class="meta-val"><strong>${qi.productName} (${qi.sku})</strong></div></div>
    <div class="meta-item"><div class="meta-label">رقم التشغيلة (Batch):</div><div class="meta-val mono font-bold">${qi.batchNumber}</div></div>
    <div class="meta-item"><div class="meta-label">درجة الحرارة عند الوصول:</div><div class="meta-val mono font-bold">${qi.temperature} °م</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ انتهاء الصلاحية:</div><div class="meta-val mono">${qi.expiryDate || "—"}</div></div>
  `;

  const isPassed = qi.status === 'passed';
  const contentHtml = `
    <div style="border: 2px solid ${isPassed ? '#10b981' : '#ef4444'}; border-radius: 8px; padding: 16px; background: ${isPassed ? '#ecfdf5' : '#fef2f2'}; margin-bottom: 16px;">
      <h3 style="margin:0 0 8px 0; color:${isPassed ? '#065f46' : '#991b1b'}; font-size:16px;">
        ${isPassed ? '✅ تقرير المطابقة: المنتج سليم ومطابق لكافة الاشتراطات الصحية والحرارية' : '❌ تقرير عدم المطابقة: المنتج غير مطابق وتم رفض إدخاله للمستودع'}
      </h3>
      <p style="margin:4px 0; font-size:11.5px; color:#374151;">
        <strong>نتائج الفحص المخبري والظاهري:</strong> ${qi.notes || "فحص التغليف سليم، الرائحة طبيعية، درجة التجمد/التبريد مطابقة للمعايير المعتمدة."}
      </p>
    </div>
  `;

  const signaturesHtml = `
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
  `;

  const html = wrapOpsPrintLayout({
    title: `شهادة ومحضر فحص جودة ومطابقة أغذية #${qi.inspectionNumber || id}`,
    docBadge: `<span class="doc-badge ${isPassed ? 'good' : 'bad'}">${isPassed ? 'معتمد ومطابق صحياً' : 'مرفوض صحياً'}</span>`,
    metaHtml,
    contentHtml,
    signaturesHtml,
    footerNotes: "يخضع هذا المحضر للاشتراطات الفنية لهيئة الغذاء والدواء والمعايير القياسية للسلامة الغذائية."
  });

  window.printOpsDocument(html, `QI-${qi.inspectionNumber || id}`);
};

window.deleteQI = async (id) => {
  if (confirm("هل تريد حذف محضر فحص الجودة هذا نهائياً؟")) {
    try {
      await deleteDoc(doc(db, `companies/${COMPANY_ID}/qualityInspections`, id));
      showToast("تم حذف محضر الفحص", "success");
      switchOpsSubModule("inspect");
    } catch(err) {
      showToast(err.message, "error");
    }
  }
};


// ============================================================
// 8. Stock Dispatch (صرف مخزني) Subsystem
// ============================================================

window.addDispatchItem = () => {
  const sel = document.getElementById("dsp-item-sel");
  const qty = parseFloat(document.getElementById("dsp-item-qty").value) || 0;
  if (!sel.value || qty <= 0) {
    showToast("اختر صنفاً وحدد كمية صحيحة", "warning");
    return;
  }
  const prod = products.find(p => p.id === sel.value);
  if (dispatchLines.some(i => i.productId === sel.value)) {
    showToast("الصنف مضاف بالفعل للقائمة", "warning");
    return;
  }
  const cost = parseFloat(prod?.costPrice || 0);
  dispatchLines.push({
    productId: sel.value,
    sku: prod?.sku || "",
    name: prod?.name || "صنف",
    qty,
    cost,
    totalCost: qty * cost
  });
  renderDspLines();
  sel.value = "";
  document.getElementById("dsp-item-qty").value = "1";
};

function renderDspLines() {
  const tbody = document.getElementById("dsp-lines-tbody");
  if (!tbody) return;
  tbody.innerHTML = dispatchLines.map((l, i) => `
    <tr>
      <td class="mono font-bold text-dim">${l.sku}</td>
      <td><strong>${l.name}</strong></td>
      <td class="mono font-bold text-primary">${formatQuantity(l.qty)}</td>
      <td class="mono">${formatCurrency(l.cost)}</td>
      <td class="mono font-bold">${formatCurrency(l.totalCost)}</td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="dispatchLines.splice(${i},1); renderDspLines();">✕</button></td>
    </tr>
  `).join("");
}

window.saveDispatch = async () => {
  const errEl = document.getElementById("dsp-error");
  errEl.classList.add("hidden");
  const whId = document.getElementById("dsp-wh").value;
  const purpose = document.getElementById("dsp-purpose").value;
  const date = document.getElementById("dsp-date").value || todayString();
  const notes = document.getElementById("dsp-notes").value.trim();

  if (!whId || !dispatchLines.length) {
    errEl.textContent = "اختر المخزن وأضف صنفاً واحداً على الأقل";
    errEl.classList.remove("hidden");
    return;
  }

  const btn = document.getElementById("save-dsp-btn");
  btn.disabled = true;

  try {
    const wh = warehouses.find(w => w.id === whId);
    const dspNum = `DSP-${date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalCost = dispatchLines.reduce((s, l) => s + l.totalCost, 0);

    const docRef = await create(COLS.inventoryAdjustments(), {
      opType: "dispatch",
      dispatchNumber: dspNum,
      number: dspNum,
      warehouseId: whId,
      warehouseName: wh?.name || "المستودع",
      purpose,
      date,
      notes,
      lines: dispatchLines,
      totalCost,
      createdAt: new Date().toISOString()
    });

    for (const l of dispatchLines) {
      await adjustStock(whId, l.productId, -l.qty, {
        type: "dispatch_out",
        sourceType: "stockDispatch",
        sourceId: docRef,
        note: `صرف مخزني: ${purpose} - ${notes}`
      });
    }

    showToast("تم تنفيذ الصرف المخزني وخصم الأرصدة بنجاح", "success");
    closeModal("dispatch-modal");
    switchOpsSubModule("dispatch");
  } catch(err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

function renderDispatchList(area, list) {
  if (!list.length) {
    area.innerHTML = `
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">📤</div>
        <div style="font-size:16px; font-weight:700;">لا توجد عمليات صرف مسجلة</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لإنشاء إذن صرف مخزني معتمد</p>
      </div>`;
    return;
  }

  area.innerHTML = `
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
            ${list.map(d => {
              const lines = d.lines || [];
              const itemsSummary = lines.map(l => `${resolveItemName(l)} (${formatQuantity(l.qty)})`).join("، ");
              return `
                <tr>
                  <td class="mono font-bold text-primary">${d.dispatchNumber || d.number || d.id}</td>
                  <td>${d.date || "—"}</td>
                  <td><strong>${d.warehouseName}</strong></td>
                  <td><span class="badge info font-bold">${d.purpose || "صرف داخلي"}</span></td>
                  <td style="max-width:280px;">${itemsSummary || "—"}</td>
                  <td class="mono font-bold text-good">${formatCurrency(d.totalCost || 0)}</td>
                  <td>${d.notes || "—"}</td>
                  <td class="no-print" style="text-align:center; white-space:nowrap;">
                    <button class="btn btn-sm btn-ghost text-primary" onclick="window.showDispatchDetail('${d.id}')">👁️ معاينة</button>
                    <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printDispatchDetail('${d.id}')">🖨️ طباعة</button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.showDispatchDetail = async (id) => {
  const d = activeListCache.find(x => x.id === id);
  if (!d) return;

  activeDetailDoc = d;
  document.getElementById("dispatch-detail-title").textContent = `📤 إذن صرف مخزني: ${d.dispatchNumber || id}`;

  const lines = d.lines || [];
  const bodyEl = document.getElementById("dispatch-detail-body");
  bodyEl.innerHTML = `
    <div class="grid-3 gap-12 mb-16" style="background:var(--bg-2); padding:12px 16px; border-radius:8px; border:1px solid var(--border-soft);">
      <div><span class="dim" style="font-size:11px;">رقم الإذن:</span> <strong class="mono font-bold text-primary">${d.dispatchNumber || id}</strong></div>
      <div><span class="dim" style="font-size:11px;">تاريخ الصرف:</span> <strong class="mono">${d.date}</strong></div>
      <div><span class="dim" style="font-size:11px;">المستودع المصدر:</span> <strong>${d.warehouseName}</strong></div>
      <div><span class="dim" style="font-size:11px;">الغرض:</span> <strong>${d.purpose || "داخلي"}</strong></div>
      <div><span class="dim" style="font-size:11px;">إجمالي التكلفة:</span> <strong class="mono font-bold text-good">${formatCurrency(d.totalCost || 0)}</strong></div>
      <div><span class="dim" style="font-size:11px;">البيان:</span> <strong>${d.notes || "—"}</strong></div>
    </div>

    <h4 style="margin:0 0 10px 0; font-size:13px; font-weight:700;">الأصناف المنصرفة (${lines.length} أصناف):</h4>
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
          ${lines.map((l, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td class="mono font-bold text-dim">${l.sku || "—"}</td>
              <td><strong>${resolveItemName(l)}</strong></td>
              <td class="mono font-bold text-primary" style="text-align:center; font-size:13px;">${formatQuantity(l.qty)}</td>
              <td class="mono" style="text-align:left;">${formatCurrency(l.cost || 0)}</td>
              <td class="mono font-bold" style="text-align:left;">${formatCurrency(l.totalCost || (l.qty * (l.cost || 0)))}</td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr style="font-weight:bold; background:var(--bg-hover);">
            <td colspan="5" style="text-align:right;">الإجمالي:</td>
            <td class="mono font-bold text-good" style="text-align:left;">${formatCurrency(d.totalCost || 0)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  const actionsEl = document.getElementById("dispatch-detail-actions");
  actionsEl.innerHTML = `
    <button class="btn btn-secondary" onclick="window.printDispatchDetail('${id}')">🖨️ طباعة إذن الصرف</button>
  `;

  openModal("dispatch-detail-modal");
};

window.printDispatchDetail = async (id) => {
  const d = activeListCache.find(x => x.id === id);
  if (!d) return;

  const lines = d.lines || [];
  const metaHtml = `
    <div class="meta-item"><div class="meta-label">رقم إذن الصرف:</div><div class="meta-val mono font-bold text-primary">${d.dispatchNumber || id}</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ الصرف:</div><div class="meta-val mono">${d.date}</div></div>
    <div class="meta-item"><div class="meta-label">المستودع المصدر:</div><div class="meta-val">${d.warehouseName}</div></div>
    <div class="meta-item"><div class="meta-label">الغرض من الصرف:</div><div class="meta-val">${d.purpose || "صرف داخلي"}</div></div>
    <div class="meta-item"><div class="meta-label">إجمالي التكلفة:</div><div class="meta-val mono font-bold">${formatCurrency(d.totalCost || 0)}</div></div>
    <div class="meta-item"><div class="meta-label">البيان / المستلم:</div><div class="meta-val">${d.notes || "—"}</div></div>
  `;

  const contentHtml = `
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
        ${lines.map((l, idx) => `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td class="mono font-bold" style="text-align:center;">${l.sku || "—"}</td>
            <td><strong>${resolveItemName(l)}</strong></td>
            <td class="mono font-bold" style="text-align:center; font-size:12px;">${formatQuantity(l.qty)}</td>
            <td class="mono" style="text-align:left;">${formatCurrency(l.cost || 0)}</td>
            <td class="mono font-bold" style="text-align:left;">${formatCurrency(l.totalCost || (l.qty * (l.cost || 0)))}</td>
          </tr>
        `).join("")}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" style="text-align:right;">الإجمالي العام لقيمة المنصرف:</td>
          <td class="mono font-bold" style="text-align:left;">${formatCurrency(d.totalCost || 0)}</td>
        </tr>
      </tfoot>
    </table>
  `;

  const signaturesHtml = `
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
  `;

  const html = wrapOpsPrintLayout({
    title: `إذن صرف مخزني معتمد #${d.dispatchNumber || id}`,
    docBadge: `<span class="doc-badge good">إذن صرف مخزني رسمي</span>`,
    metaHtml,
    contentHtml,
    signaturesHtml,
    footerNotes: "تم تسليم الأصناف أعلاه بالحالة السليمة وتحميلها على ذمة الجهة المستلمة."
  });

  window.printOpsDocument(html, `DSP-${d.dispatchNumber || id}`);
};

// ============================================================
// 9. Vehicle Loading & Vehicle Returns Subsystems
// ============================================================

window.addVehicleItem = () => {
  const sel = document.getElementById("veh-item-sel");
  const qty = parseFloat(document.getElementById("veh-item-qty").value) || 1;
  if (!sel.value || qty <= 0) {
    showToast("اختر صنفاً وحدد كمية صحيحة", "warning");
    return;
  }
  const prod = products.find(p => p.id === sel.value);
  if (vehicleLines.some(i => i.productId === sel.value)) {
    showToast("الصنف مضاف بالفعل للشحنة", "warning");
    return;
  }
  vehicleLines.push({
    productId: sel.value,
    sku: prod?.sku || "",
    name: prod?.name || "صنف",
    qty
  });

  renderVehLines();
  sel.value = "";
  document.getElementById("veh-item-qty").value = "1";
};

function renderVehLines() {
  const tbody = document.getElementById("veh-lines-tbody");
  if (!tbody) return;
  tbody.innerHTML = vehicleLines.map((l, i) => `
    <tr>
      <td class="mono font-bold text-dim">${l.sku}</td>
      <td><strong>${l.name}</strong></td>
      <td class="mono font-bold text-primary">${formatQuantity(l.qty)}</td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="vehicleLines.splice(${i},1); renderVehLines();">✕</button></td>
    </tr>
  `).join("");
}

window.saveVehicleLoad = async () => {
  const errEl = document.getElementById("veh-error");
  errEl.classList.add("hidden");
  const srcWh = document.getElementById("veh-src-wh").value;
  const dstWh = document.getElementById("veh-dst-wh").value;
  const driver = document.getElementById("veh-driver").value.trim();
  const date = document.getElementById("veh-date").value || todayString();
  const notes = document.getElementById("veh-notes").value.trim();

  if (!srcWh || !dstWh || !driver || !vehicleLines.length) {
    errEl.textContent = "حدد المخزن المصدر، مخزن السيارة، اسم السائق، وأضف صنفاً واحداً على الأقل";
    errEl.classList.remove("hidden");
    return;
  }
  if (srcWh === dstWh) {
    errEl.textContent = "المخزن المصدر ومخزن السيارة يجب أن يكونا مختلفين";
    errEl.classList.remove("hidden");
    return;
  }

  const btn = document.getElementById("save-veh-btn");
  btn.disabled = true;

  try {
    const src = warehouses.find(w => w.id === srcWh);
    const dst = warehouses.find(w => w.id === dstWh);
    const manifestNum = `MAN-${date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const docRef = await create(COLS.inventoryAdjustments(), {
      opType: "vehicle-load",
      manifestNumber: manifestNum,
      number: manifestNum,
      fromWarehouseId: srcWh,
      fromWarehouseName: src?.name || "المخزن المصدر",
      toWarehouseId: dstWh,
      toWarehouseName: dst?.name || "سيارة التوزيع",
      driver,
      date,
      notes,
      lines: vehicleLines,
      createdAt: new Date().toISOString()
    });

    for (const l of vehicleLines) {
      await adjustStock(srcWh, l.productId, -l.qty, {
        type: "transfer_out",
        sourceType: "vehicleLoad",
        sourceId: docRef,
        note: `تحميل سيارة: ${dst?.name} - المندوب: ${driver}`
      });
      await adjustStock(dstWh, l.productId, l.qty, {
        type: "transfer_in",
        sourceType: "vehicleLoad",
        sourceId: docRef,
        note: `استلام شحنة من ${src?.name} - المندوب: ${driver}`
      });
    }

    showToast("تم اعتماد مانيفست التحميل ونقل العهدة لسيارة التوزيع بنجاح", "success");
    closeModal("vehicle-modal");
    switchOpsSubModule("vehicle");
  } catch(err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

function renderVehicleList(area, list) {
  if (!list.length) {
    area.innerHTML = `
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">🚐</div>
        <div style="font-size:16px; font-weight:700;">لا توجد عمليات تحميل سيارات مسجلة</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لإصدار مانيفست شحن بضاعة لسيارة التوزيع</p>
      </div>`;
    return;
  }

  area.innerHTML = `
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
            ${list.map(d => {
              const lines = d.lines || [];
              const itemsSummary = lines.map(l => `${resolveItemName(l)} (${formatQuantity(l.qty)})`).join("، ");
              return `
                <tr>
                  <td class="mono font-bold text-primary">${d.manifestNumber || d.number || d.id}</td>
                  <td>${d.date || "—"}</td>
                  <td><strong>${d.driver || "—"}</strong></td>
                  <td>${d.fromWarehouseName}</td>
                  <td><strong>${d.toWarehouseName}</strong></td>
                  <td style="max-width:300px;">${itemsSummary || "—"}</td>
                  <td><span class="badge good font-bold">🚐 تم التحميل</span></td>
                  <td class="no-print" style="text-align:center; white-space:nowrap;">
                    <button class="btn btn-sm btn-ghost text-primary" onclick="window.showVehicleDetail('${d.id}')">👁️ معاينة</button>
                    <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printVehicleManifest('${d.id}')">🖨️ طباعة المانيفست</button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.showVehicleDetail = async (id) => {
  const d = activeListCache.find(x => x.id === id);
  if (!d) return;

  activeDetailDoc = d;
  document.getElementById("vehicle-detail-title").textContent = `🚐 مانيفست شحن سيارة: ${d.manifestNumber || id}`;

  const lines = d.lines || [];
  const bodyEl = document.getElementById("vehicle-detail-body");
  bodyEl.innerHTML = `
    <div class="grid-3 gap-12 mb-16" style="background:var(--bg-2); padding:12px 16px; border-radius:8px; border:1px solid var(--border-soft);">
      <div><span class="dim" style="font-size:11px;">رقم المانيفست:</span> <strong class="mono font-bold text-primary">${d.manifestNumber || id}</strong></div>
      <div><span class="dim" style="font-size:11px;">تاريخ الشحن:</span> <strong class="mono">${d.date}</strong></div>
      <div><span class="dim" style="font-size:11px;">السائق / المندوب:</span> <strong>${d.driver || "—"}</strong></div>
      <div><span class="dim" style="font-size:11px;">المخزن المصدر:</span> <strong>${d.fromWarehouseName}</strong></div>
      <div><span class="dim" style="font-size:11px;">مخزن سيارة التوزيع:</span> <strong>${d.toWarehouseName}</strong></div>
      <div><span class="dim" style="font-size:11px;">ملاحظات:</span> <strong>${d.notes || "—"}</strong></div>
    </div>

    <h4 style="margin:0 0 10px 0; font-size:13px; font-weight:700;">الأصناف المحملة بالعهدة (${lines.length} أصناف):</h4>
    <div class="table-container mb-16" style="border:1px solid var(--border-soft); border-radius:8px;">
      <table class="data-dense" style="width:100%;">
        <thead><tr><th>#</th><th>الرمز</th><th>اسم الصنف</th><th style="text-align:center;">الكمية المشحونة</th></tr></thead>
        <tbody>
          ${lines.map((l, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td class="mono font-bold text-dim">${l.sku || "—"}</td>
              <td><strong>${resolveItemName(l)}</strong></td>
              <td class="mono font-bold text-primary" style="text-align:center; font-size:13px;">${formatQuantity(l.qty)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  const actionsEl = document.getElementById("vehicle-detail-actions");
  actionsEl.innerHTML = `
    <button class="btn btn-secondary" onclick="window.printVehicleManifest('${id}')">🖨️ طباعة مانيفست الشحن</button>
  `;

  openModal("vehicle-detail-modal");
};

window.printVehicleManifest = async (id) => {
  const d = activeListCache.find(x => x.id === id);
  if (!d) return;

  const lines = d.lines || [];
  const metaHtml = `
    <div class="meta-item"><div class="meta-label">رقم مانيفست التحميل:</div><div class="meta-val mono font-bold text-primary">${d.manifestNumber || id}</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ التحميل:</div><div class="meta-val mono">${d.date}</div></div>
    <div class="meta-item"><div class="meta-label">المندوب / السائق المستلم:</div><div class="meta-val"><strong>${d.driver || "—"}</strong></div></div>
    <div class="meta-item"><div class="meta-label">المستودع المصدر:</div><div class="meta-val">${d.fromWarehouseName}</div></div>
    <div class="meta-item"><div class="meta-label">سيارة التوزيع:</div><div class="meta-val"><strong>${d.toWarehouseName}</strong></div></div>
    <div class="meta-item"><div class="meta-label">خط السير / ملاحظات:</div><div class="meta-val">${d.notes || "—"}</div></div>
  `;

  const contentHtml = `
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
        ${lines.map((l, idx) => `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td class="mono font-bold" style="text-align:center;">${l.sku || "—"}</td>
            <td><strong>${resolveItemName(l)}</strong></td>
            <td class="mono font-bold" style="text-align:center; font-size:13px;">${formatQuantity(l.qty)}</td>
            <td style="font-size:10.5px; color:#64748b;">مطابق وسليم</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  const signaturesHtml = `
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
  `;

  const html = wrapOpsPrintLayout({
    title: `مانيفست تحميل بضاعة على سيارة التوزيع #${d.manifestNumber || id}`,
    docBadge: `<span class="doc-badge good">مانيفست شحن رسمي</span>`,
    metaHtml,
    contentHtml,
    signaturesHtml,
    footerNotes: "أقر أنا المندوب الموضح اسمه أعلاه باستلام كامل البضاعة والكميات المشحونة بحالة ممتازة ومطابقة للمانيفست وتحت مسؤوليتي."
  });

  window.printOpsDocument(html, `MAN-${d.manifestNumber || id}`);
};

// ── Vehicle Returns Subsystem ──
window.addVehReturnItem = () => {
  const sel = document.getElementById("vr-item-sel");
  const qty = parseFloat(document.getElementById("vr-item-qty").value) || 1;
  const reason = document.getElementById("vr-item-reason").value;
  if (!sel.value || qty <= 0) {
    showToast("اختر صنفاً وحدد كمية صحيحة", "warning");
    return;
  }
  const prod = products.find(p => p.id === sel.value);
  vehicleReturnLines.push({
    productId: sel.value,
    sku: prod?.sku || "",
    name: prod?.name || "صنف",
    qty,
    reason
  });

  renderVehReturnLines();
  sel.value = "";
  document.getElementById("vr-item-qty").value = "1";
};

function renderVehReturnLines() {
  const tbody = document.getElementById("vr-lines-tbody");
  if (!tbody) return;
  const reasonText = (r) => {
    if (r === 'unsold') return 'فائض غير مباع';
    if (r === 'cust_return') return 'مرتجع عميل';
    if (r === 'damaged') return 'تالف';
    if (r === 'near_expiry') return 'قريب الانتهاء';
    return r;
  };
  tbody.innerHTML = vehicleReturnLines.map((l, i) => `
    <tr>
      <td class="mono font-bold text-dim">${l.sku}</td>
      <td><strong>${l.name}</strong></td>
      <td class="mono font-bold text-primary">${formatQuantity(l.qty)}</td>
      <td><span class="badge info font-bold">${reasonText(l.reason)}</span></td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="vehicleReturnLines.splice(${i},1); renderVehReturnLines();">✕</button></td>
    </tr>
  `).join("");
}

window.saveVehicleReturn = async () => {
  const errEl = document.getElementById("vr-error");
  errEl.classList.add("hidden");
  const srcWh = document.getElementById("vr-src-wh").value;
  const dstWh = document.getElementById("vr-dst-wh").value;
  const driver = document.getElementById("vr-driver").value.trim();
  const date = document.getElementById("vr-date").value || todayString();
  const notes = document.getElementById("vr-notes").value.trim();

  if (!srcWh || !dstWh || !driver || !vehicleReturnLines.length) {
    errEl.textContent = "حدد سيارة التوزيع، المستودع المستقبل، اسم المندوب، وأضف صنفاً واحداً على الأقل";
    errEl.classList.remove("hidden");
    return;
  }
  if (srcWh === dstWh) {
    errEl.textContent = "سيارة التوزيع والمستودع المستقبل يجب أن يكونا مختلفين";
    errEl.classList.remove("hidden");
    return;
  }

  const btn = document.getElementById("save-vr-btn");
  btn.disabled = true;

  try {
    const src = warehouses.find(w => w.id === srcWh);
    const dst = warehouses.find(w => w.id === dstWh);
    const retNum = `VR-${date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const docRef = await create(COLS.inventoryAdjustments(), {
      opType: "vehicle-return",
      returnNumber: retNum,
      number: retNum,
      fromWarehouseId: srcWh,
      fromWarehouseName: src?.name || "سيارة التوزيع",
      toWarehouseId: dstWh,
      toWarehouseName: dst?.name || "المستودع الرئيسي",
      driver,
      date,
      notes,
      lines: vehicleReturnLines,
      createdAt: new Date().toISOString()
    });

    for (const l of vehicleReturnLines) {
      await adjustStock(srcWh, l.productId, -l.qty, {
        type: "transfer_out",
        sourceType: "vehicleReturn",
        sourceId: docRef,
        note: `مرتجع من سيارة: ${src?.name} - المندوب: ${driver}`
      });
      await adjustStock(dstWh, l.productId, l.qty, {
        type: "transfer_in",
        sourceType: "vehicleReturn",
        sourceId: docRef,
        note: `استلام مرتجع من سيارة ${src?.name} للمخزن ${dst?.name}`
      });
    }

    showToast("تم إثبات استلام المرتجع وتحديث الأرصدة بنجاح", "success");
    closeModal("vehicle-return-modal");
    switchOpsSubModule("vehicle-return");
  } catch(err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

function renderVehicleReturnList(area, list) {
  if (!list.length) {
    area.innerHTML = `
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">🔄</div>
        <div style="font-size:16px; font-weight:700;">لا توجد عمليات استلام مرتجع مسجلة</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لتسجيل استلام مرتجع من سيارة توزيع للمستودع</p>
      </div>`;
    return;
  }

  area.innerHTML = `
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
            ${list.map(d => {
              const lines = d.lines || [];
              const itemsSummary = lines.map(l => `${resolveItemName(l)} (${formatQuantity(l.qty)})`).join("، ");
              return `
                <tr>
                  <td class="mono font-bold text-primary">${d.returnNumber || d.number || d.id}</td>
                  <td>${d.date || "—"}</td>
                  <td><strong>${d.driver || "—"}</strong></td>
                  <td><strong>${d.fromWarehouseName}</strong></td>
                  <td>${d.toWarehouseName}</td>
                  <td style="max-width:300px;">${itemsSummary || "—"}</td>
                  <td><span class="badge good font-bold">🔄 تم الاستلام بالمخزن</span></td>
                  <td class="no-print" style="text-align:center; white-space:nowrap;">
                    <button class="btn btn-sm btn-ghost text-primary" onclick="window.showVehicleReturnDetail('${d.id}')">👁️ معاينة</button>
                    <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printVehicleReturnDetail('${d.id}')">🖨️ طباعة</button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.showVehicleReturnDetail = async (id) => {
  const d = activeListCache.find(x => x.id === id);
  if (!d) return;

  activeDetailDoc = d;
  document.getElementById("vehicle-return-detail-title").textContent = `🔄 إذن استلام مرتجع سيارة: ${d.returnNumber || id}`;

  const lines = d.lines || [];
  const bodyEl = document.getElementById("vehicle-return-detail-body");
  bodyEl.innerHTML = `
    <div class="grid-3 gap-12 mb-16" style="background:var(--bg-2); padding:12px 16px; border-radius:8px; border:1px solid var(--border-soft);">
      <div><span class="dim" style="font-size:11px;">رقم السند:</span> <strong class="mono font-bold text-primary">${d.returnNumber || id}</strong></div>
      <div><span class="dim" style="font-size:11px;">تاريخ الاستلام:</span> <strong class="mono">${d.date}</strong></div>
      <div><span class="dim" style="font-size:11px;">السائق / المندوب:</span> <strong>${d.driver || "—"}</strong></div>
      <div><span class="dim" style="font-size:11px;">سيارة التوزيع:</span> <strong>${d.fromWarehouseName}</strong></div>
      <div><span class="dim" style="font-size:11px;">المستودع المستقبل:</span> <strong>${d.toWarehouseName}</strong></div>
      <div><span class="dim" style="font-size:11px;">ملاحظات:</span> <strong>${d.notes || "—"}</strong></div>
    </div>

    <h4 style="margin:0 0 10px 0; font-size:13px; font-weight:700;">الأصناف المرتجعة وأسبابها (${lines.length} أصناف):</h4>
    <div class="table-container mb-16" style="border:1px solid var(--border-soft); border-radius:8px;">
      <table class="data-dense" style="width:100%;">
        <thead><tr><th>#</th><th>الرمز</th><th>اسم الصنف</th><th style="text-align:center;">الكمية المرتجعة</th><th>سبب الارتجاع</th></tr></thead>
        <tbody>
          ${lines.map((l, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td class="mono font-bold text-dim">${l.sku || "—"}</td>
              <td><strong>${resolveItemName(l)}</strong></td>
              <td class="mono font-bold text-primary" style="text-align:center; font-size:13px;">${formatQuantity(l.qty)}</td>
              <td><span class="badge info font-bold">${l.reason || "فائض"}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  const actionsEl = document.getElementById("vehicle-return-detail-actions");
  actionsEl.innerHTML = `
    <button class="btn btn-secondary" onclick="window.printVehicleReturnDetail('${id}')">🖨️ طباعة إذن الاستلام</button>
  `;

  openModal("vehicle-return-detail-modal");
};

window.printVehicleReturnDetail = async (id) => {
  const d = activeListCache.find(x => x.id === id);
  if (!d) return;

  const lines = d.lines || [];
  const metaHtml = `
    <div class="meta-item"><div class="meta-label">رقم إذن استلام المرتجع:</div><div class="meta-val mono font-bold text-primary">${d.returnNumber || id}</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ الاستلام:</div><div class="meta-val mono">${d.date}</div></div>
    <div class="meta-item"><div class="meta-label">المندوب / السائق المسلّم:</div><div class="meta-val"><strong>${d.driver || "—"}</strong></div></div>
    <div class="meta-item"><div class="meta-label">سيارة التوزيع:</div><div class="meta-val">${d.fromWarehouseName}</div></div>
    <div class="meta-item"><div class="meta-label">المستودع المستقبل:</div><div class="meta-val"><strong>${d.toWarehouseName}</strong></div></div>
    <div class="meta-item"><div class="meta-label">البيان:</div><div class="meta-val">${d.notes || "—"}</div></div>
  `;

  const contentHtml = `
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
        ${lines.map((l, idx) => `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td class="mono font-bold" style="text-align:center;">${l.sku || "—"}</td>
            <td><strong>${resolveItemName(l)}</strong></td>
            <td class="mono font-bold" style="text-align:center; font-size:13px;">${formatQuantity(l.qty)}</td>
            <td style="font-size:11px;">${l.reason || "فائض سليم"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  const signaturesHtml = `
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
  `;

  const html = wrapOpsPrintLayout({
    title: `إذن استلام مرتجع بضاعة من سيارة توزيع #${d.returnNumber || id}`,
    docBadge: `<span class="doc-badge good">إذن استلام مرتجع رسمي</span>`,
    metaHtml,
    contentHtml,
    signaturesHtml,
    footerNotes: "تم فحص المرتجع وإعادته للأرصدة المستودعية الرسمية وتفريغ عهدة السيارة."
  });

  window.printOpsDocument(html, `VR-${d.returnNumber || id}`);
};

// ============================================================
// 10. Product Assembly / Disassembly Subsystem
// ============================================================

window.addAssemblyComponent = () => {
  const sel = document.getElementById("asm-component-sel");
  const qty = parseFloat(document.getElementById("asm-component-qty").value) || 0;
  if (!sel.value || qty <= 0) {
    showToast("اختر مكوناً وحدد كمية صحيحة", "warning");
    return;
  }
  const prod = products.find(p => p.id === sel.value);
  if (asmComponents.some(i => i.productId === sel.value)) {
    showToast("المكون مضاف بالفعل لقائمة المواد", "warning");
    return;
  }
  asmComponents.push({
    productId: sel.value,
    sku: prod?.sku || "",
    name: prod?.name || "مكون",
    qtyPerUnit: qty
  });

  renderAsmLines();
  sel.value = "";
  document.getElementById("asm-component-qty").value = "1";
};

function renderAsmLines() {
  const tbody = document.getElementById("asm-lines-tbody");
  if (!tbody) return;
  const targetQty = parseFloat(document.getElementById("asm-qty")?.value) || 1;
  tbody.innerHTML = asmComponents.map((c, i) => `
    <tr>
      <td><strong>${c.sku} - ${c.name}</strong></td>
      <td class="mono font-bold">${formatQuantity(c.qtyPerUnit)}</td>
      <td class="mono font-bold text-primary">${formatQuantity(c.qtyPerUnit * targetQty)}</td>
      <td><button class="btn btn-icon sm btn-ghost text-bad" onclick="asmComponents.splice(${i},1); renderAsmLines();">✕</button></td>
    </tr>
  `).join("");
}

window.removeAsmLine = (idx) => {
  asmComponents.splice(idx, 1);
  renderAsmLines();
};

window.saveAssembly = async () => {
  const errEl = document.getElementById("asm-error");
  errEl.classList.add("hidden");

  const type = document.getElementById("asm-type").value;
  const prodId = document.getElementById("asm-product").value;
  const qty = parseFloat(document.getElementById("asm-qty").value) || 0;
  const whId = document.getElementById("asm-wh").value;
  const date = document.getElementById("asm-date").value || todayString();

  if (!prodId || qty <= 0 || !whId || !asmComponents.length) {
    errEl.textContent = "يرجى تعبئة الحقول الإلزامية وإضافة مكون واحد على الأقل";
    errEl.classList.remove("hidden");
    return;
  }

  const btn = document.getElementById("save-asm-btn");
  btn.disabled = true;

  try {
    const parentProd = products.find(p => p.id === prodId);
    const wh = warehouses.find(w => w.id === whId);
    const asmNum = `ASM-${date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const docRef = await create(COLS.productAssemblies(), {
      assemblyNumber: asmNum,
      number: asmNum,
      type,
      productId: prodId,
      productName: parentProd?.name || "حزمة",
      sku: parentProd?.sku || "",
      qty,
      warehouseId: whId,
      warehouseName: wh?.name || "المستودع الرئيسي",
      date,
      components: asmComponents.map(c => ({
        ...c,
        totalQty: c.qtyPerUnit * qty
      })),
      createdAt: new Date().toISOString()
    });

    // Update stock levels
    if (type === 'assembly') {
      // Deduct components, Add parent
      for (const comp of asmComponents) {
        await adjustStock(whId, comp.productId, -(comp.qtyPerUnit * qty), {
          type: "assembly_out",
          sourceType: "productAssembly",
          sourceId: docRef,
          note: `صرف للتجميع: ${parentProd?.name}`
        });
      }
      await adjustStock(whId, prodId, qty, {
        type: "assembly_in",
        sourceType: "productAssembly",
        sourceId: docRef,
        note: `وارد إنتاج وتجميع: ${asmNum}`
      });
    } else {
      // Disassembly: Deduct parent, Add components
      await adjustStock(whId, prodId, -qty, {
        type: "disassembly_out",
        sourceType: "productAssembly",
        sourceId: docRef,
        note: `صرف للتفكيك: ${asmNum}`
      });
      for (const comp of asmComponents) {
        await adjustStock(whId, comp.productId, (comp.qtyPerUnit * qty), {
          type: "disassembly_in",
          sourceType: "productAssembly",
          sourceId: docRef,
          note: `وارد ناتج تفكيك: ${parentProd?.name}`
        });
      }
    }

    showToast("تم تنفيذ وتوثيق عملية التجميع وتحديث الأرصدة بنجاح", "success");
    closeModal("asm-modal");
    switchOpsSubModule("assemble");
  } catch(err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

function renderAssemblyList(container, asms) {
  if (asms.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">⚙️</div>
        <div style="font-size:16px; font-weight:700;">لا توجد عمليات تجميع أو تفكيك</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لتنفيذ أمر تجميع حزمة أو تفكيكها</p>
      </div>`;
    return;
  }

  container.innerHTML = `
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
            ${asms.map(a => {
              const comps = a.components || [];
              const compsSummary = comps.map(c => `${c.name} (${formatQuantity(c.totalQty || c.qtyPerUnit)})`).join("، ");
              return `
                <tr>
                  <td class="mono font-bold text-primary">${a.assemblyNumber || a.number || a.id}</td>
                  <td>${a.date}</td>
                  <td>
                    <span class="badge ${a.type === 'assembly' ? 'good' : 'warn'} font-bold">
                      ${a.type === 'assembly' ? '⚙️ تجميع حزمة' : '🔧 تفكيك حزمة'}
                    </span>
                  </td>
                  <td><strong>${a.productName}</strong> <span class="mono dim">(${a.sku})</span></td>
                  <td class="mono font-bold text-primary" style="font-size:13px;">${formatQuantity(a.qty)}</td>
                  <td>${a.warehouseName}</td>
                  <td style="max-width:300px;">${compsSummary || "—"}</td>
                  <td class="no-print" style="text-align:center; white-space:nowrap;">
                    <button class="btn btn-sm btn-ghost text-primary" onclick="window.showAssemblyDetail('${a.id}')">👁️ معاينة</button>
                    <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printAssemblyDetail('${a.id}')">🖨️ طباعة</button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.showAssemblyDetail = async (id) => {
  const a = activeListCache.find(x => x.id === id);
  if (!a) return;

  activeDetailDoc = a;
  document.getElementById("assembly-detail-title").textContent = `⚙️ أمر تجميع / تفكيك: ${a.assemblyNumber || id}`;

  const comps = a.components || [];
  const bodyEl = document.getElementById("assembly-detail-body");
  bodyEl.innerHTML = `
    <div class="grid-3 gap-12 mb-16" style="background:var(--bg-2); padding:12px 16px; border-radius:8px; border:1px solid var(--border-soft);">
      <div><span class="dim" style="font-size:11px;">رقم الأمر:</span> <strong class="mono font-bold text-primary">${a.assemblyNumber || id}</strong></div>
      <div><span class="dim" style="font-size:11px;">تاريخ العملية:</span> <strong class="mono">${a.date}</strong></div>
      <div><span class="dim" style="font-size:11px;">نوع المعاملة:</span> <strong>${a.type === 'assembly' ? "تجميع حزمة" : "تفكيك حزمة"}</strong></div>
      <div><span class="dim" style="font-size:11px;">الصنف الرئيسي:</span> <strong>${a.productName} (${a.sku})</strong></div>
      <div><span class="dim" style="font-size:11px;">الكمية المنتجة:</span> <strong class="mono font-bold text-primary" style="font-size:13px;">${formatQuantity(a.qty)}</strong></div>
      <div><span class="dim" style="font-size:11px;">المستودع:</span> <strong>${a.warehouseName}</strong></div>
    </div>

    <h4 style="margin:0 0 10px 0; font-size:13px; font-weight:700;">المكونات الفرعية وقائمة المواد (BOM):</h4>
    <div class="table-container mb-16" style="border:1px solid var(--border-soft); border-radius:8px;">
      <table class="data-dense" style="width:100%;">
        <thead><tr><th>#</th><th>رمز المكون</th><th>اسم المكون الفرعي</th><th style="text-align:center;">لكل حزمة</th><th style="text-align:center;">إجمالي المستهلك</th></tr></thead>
        <tbody>
          ${comps.map((c, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td class="mono font-bold text-dim">${c.sku || "—"}</td>
              <td><strong>${c.name}</strong></td>
              <td class="mono font-bold" style="text-align:center;">${formatQuantity(c.qtyPerUnit)}</td>
              <td class="mono font-bold text-primary" style="text-align:center; font-size:13px;">${formatQuantity(c.totalQty || (c.qtyPerUnit * a.qty))}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  const actionsEl = document.getElementById("assembly-detail-actions");
  actionsEl.innerHTML = `
    <button class="btn btn-secondary" onclick="window.printAssemblyDetail('${id}')">🖨️ طباعة أمر التجميع</button>
  `;

  openModal("assembly-detail-modal");
};

window.printAssemblyDetail = async (id) => {
  const a = activeListCache.find(x => x.id === id);
  if (!a) return;

  const comps = a.components || [];
  const metaHtml = `
    <div class="meta-item"><div class="meta-label">رقم أمر التشغيل:</div><div class="meta-val mono font-bold text-primary">${a.assemblyNumber || id}</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ التشغيل:</div><div class="meta-val mono">${a.date}</div></div>
    <div class="meta-item"><div class="meta-label">نوع العملية:</div><div class="meta-val">${a.type === 'assembly' ? "تجميع حزمة جديدة" : "تفكيك حزمة لمكوناتها"}</div></div>
    <div class="meta-item"><div class="meta-label">الصنف الرئيسي المستهدف:</div><div class="meta-val"><strong>${a.productName} (${a.sku})</strong></div></div>
    <div class="meta-item"><div class="meta-label">الكمية المنفذة:</div><div class="meta-val mono font-bold">${formatQuantity(a.qty)}</div></div>
    <div class="meta-item"><div class="meta-label">مستودع التشغيل:</div><div class="meta-val">${a.warehouseName}</div></div>
  `;

  const contentHtml = `
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
        ${comps.map((c, idx) => `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td class="mono font-bold" style="text-align:center;">${c.sku || "—"}</td>
            <td><strong>${c.name}</strong></td>
            <td class="mono font-bold" style="text-align:center;">${formatQuantity(c.qtyPerUnit)}</td>
            <td class="mono font-bold" style="text-align:center; font-size:12px;">${formatQuantity(c.totalQty || (c.qtyPerUnit * a.qty))}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  const signaturesHtml = `
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
  `;

  const html = wrapOpsPrintLayout({
    title: `أمر تشغيل وتجميع منتجات #${a.assemblyNumber || id}`,
    docBadge: `<span class="doc-badge good">أمر تشغيل معتمد</span>`,
    metaHtml,
    contentHtml,
    signaturesHtml,
    footerNotes: "تم مطابقة مكونات الحزمة والتأكد من مطابقة التغليف لبطاقة المنتج الغذائي."
  });

  window.printOpsDocument(html, `ASM-${a.assemblyNumber || id}`);
};


// ============================================================
// 11. Inventory Adjustment & Damage Subsystem
// ============================================================

function setupAdjProductAutocomplete() {
  const searchInput = document.getElementById("adj-product-search");
  const resultsDiv = document.getElementById("adj-product-results");
  const hiddenInput = document.getElementById("adj-product");
  const costInput = document.getElementById("adj-cost");

  if (!searchInput || !resultsDiv) return;

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query.length === 0) {
      resultsDiv.classList.add("hidden");
      resultsDiv.innerHTML = "";
      return;
    }

    const matches = products.filter(p => {
      const name = (p.name || "").toLowerCase();
      const sku = (p.sku || "").toLowerCase();
      const barcode = (p.barcode || "").toLowerCase();
      return name.includes(query) || sku.includes(query) || barcode.includes(query);
    }).slice(0, 10);

    if (matches.length === 0) {
      resultsDiv.innerHTML = '<div style="padding:10px; color:var(--text-3); font-size:12px;">لا توجد أصناف مطابقة</div>';
      resultsDiv.classList.remove("hidden");
      return;
    }

    resultsDiv.innerHTML = matches.map(p => `
      <div class="autocomplete-item" style="padding:8px 12px; cursor:pointer; border-bottom:1px solid var(--border-soft); font-size:13px;"
           onclick="window.selectAdjProduct('${p.id}', '${p.name.replace(/'/g, "\\'")}', '${p.sku || ""}', ${p.costPrice || 0})">
        <strong>${p.sku ? p.sku + ' - ' : ''}${p.name}</strong>
        <div style="font-size:11px; color:var(--text-3);">التكلفة: ${formatCurrency(p.costPrice || 0)}</div>
      </div>
    `).join("");
    resultsDiv.classList.remove("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
      resultsDiv.classList.add("hidden");
    }
  });
}

window.selectAdjProduct = (id, name, sku, costPrice) => {
  const searchInput = document.getElementById("adj-product-search");
  const hiddenInput = document.getElementById("adj-product");
  const costInput = document.getElementById("adj-cost");
  const resultsDiv = document.getElementById("adj-product-results");

  if (searchInput) searchInput.value = `${sku ? sku + ' - ' : ''}${name}`;
  if (hiddenInput) hiddenInput.value = id;
  if (costInput) costInput.value = (costPrice || 0).toFixed(2);
  if (resultsDiv) resultsDiv.classList.add("hidden");
};

window.addAdjLine = () => {
  const hiddenInput = document.getElementById("adj-product");
  const searchInput = document.getElementById("adj-product-search");
  const qtyInput = document.getElementById("adj-qty");
  const costInput = document.getElementById("adj-cost");

  const productId = hiddenInput ? hiddenInput.value : "";
  const qty = parseFloat(qtyInput ? qtyInput.value : 0);
  const cost = parseFloat(costInput ? costInput.value : 0);

  if (!productId) {
    showToast("يرجى اختيار صنف من نتائج البحث أولاً", "warning");
    return;
  }
  if (!qty || qty <= 0) {
    showToast("يرجى إدخال كمية صحيحة أكبر من الصفر", "warning");
    return;
  }
  if (isNaN(cost) || cost < 0) {
    showToast("يرجى إدخال تكلفة وحدة صحيحة", "warning");
    return;
  }

  const prod = products.find(p => p.id === productId);
  const sku = prod ? prod.sku : "";
  const name = prod ? prod.name : searchInput.value;

  const existingIdx = window._adjLines.findIndex(l => l.productId === productId);
  if (existingIdx >= 0) {
    window._adjLines[existingIdx].qty += qty;
    window._adjLines[existingIdx].totalCost = window._adjLines[existingIdx].qty * window._adjLines[existingIdx].cost;
  } else {
    window._adjLines.push({
      productId,
      sku,
      name,
      qty,
      cost,
      totalCost: qty * cost
    });
  }

  if (hiddenInput) hiddenInput.value = "";
  if (searchInput) searchInput.value = "";
  if (qtyInput) qtyInput.value = "1";
  if (costInput) costInput.value = "";

  renderAdjLinesTable();
  showToast("تمت إضافة الصنف لقائمة التسوية", "success");
};

window.removeAdjLine = (index) => {
  window._adjLines.splice(index, 1);
  renderAdjLinesTable();
};

function renderAdjLinesTable() {
  const tbody = document.getElementById("adj-items-tbody");
  const totalCostLabel = document.getElementById("adj-total-cost-label");
  if (!tbody) return;

  if (window._adjLines.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-3); padding:16px;">لم يتم إضافة أي أصناف بعد. ابحث عن صنف أعلاه واضغط "إضافة".</td></tr>';
    if (totalCostLabel) totalCostLabel.textContent = "0.00 ر.س";
    return;
  }

  let grandTotal = 0;
  tbody.innerHTML = window._adjLines.map((l, i) => {
    grandTotal += l.totalCost;
    return `
      <tr>
        <td class="mono font-bold text-dim">${l.sku || "—"}</td>
        <td><strong>${l.name}</strong></td>
        <td class="mono font-bold text-primary" style="text-align:center;">${formatQuantity(l.qty)}</td>
        <td class="mono" style="text-align:left;">${formatCurrency(l.cost)}</td>
        <td class="mono font-bold" style="text-align:left;">${formatCurrency(l.totalCost)}</td>
        <td style="text-align:center;">
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="window.removeAdjLine(${i})" title="حذف الصنف">✕</button>
        </td>
      </tr>
    `;
  }).join("");

  if (totalCostLabel) {
    totalCostLabel.textContent = formatCurrency(grandTotal);
  }
}

window.saveAdjustment = async () => {
  const errEl = document.getElementById("adj-error");
  errEl.classList.add("hidden");

  const type = document.getElementById("adj-type").value;
  const whId = document.getElementById("adj-wh").value;
  const date = document.getElementById("adj-date").value || todayString();
  const notes = document.getElementById("adj-notes").value.trim();

  if (window._adjLines.length === 0) {
    errEl.textContent = "يرجى إضافة صنف واحد على الأقل للمعاملة";
    errEl.classList.remove("hidden");
    return;
  }

  if (!notes) {
    errEl.textContent = "يرجى كتابة البيان / أسباب المعاملة بشكل واضح";
    errEl.classList.remove("hidden");
    return;
  }

  const btn = document.getElementById("save-adj-btn");
  btn.disabled = true;

  try {
    const isEdit = !!window._editingAdjId;
    let adjId = window._editingAdjId;
    const wh = warehouses.find(w => w.id === whId);
    const totalCost = window._adjLines.reduce((s, l) => s + l.totalCost, 0);

    const typeLabels = {
      "damage": "إعدام سلع تالفة",
      "add": "تسوية إضافة",
      "deduct": "تسوية خصم",
      "return-damaged": "مرتجع تالف للمورد",
      "expired": "إعدام منتهي الصلاحية",
      "donation": "تبرعات وهبات"
    };
    const typeText = typeLabels[type] || "تسوية مخزنية";

    if (isEdit) {
      await update("inventoryAdjustments", adjId, {
        type,
        warehouseId: whId,
        warehouseName: wh ? wh.name : "المستودع",
        date,
        notes,
        lines: window._adjLines,
        totalCost,
        updatedAt: new Date().toISOString()
      });
      showToast("تم تحديث بيانات المعاملة بنجاح", "success");
    } else {
      adjId = await create(COLS.inventoryAdjustments(), {
        type,
        warehouseId: whId,
        warehouseName: wh ? wh.name : "المستودع",
        date,
        notes,
        lines: window._adjLines,
        totalCost,
        createdAt: new Date().toISOString()
      });

      // Stock adjustment & JE
      const isDeduction = (type === "damage" || type === "deduct" || type === "return-damaged" || type === "expired" || type === "donation");

      for (const l of window._adjLines) {
        const delta = isDeduction ? -l.qty : l.qty;
        await adjustStock(whId, l.productId, delta, {
          type: isDeduction ? "adjustment_out" : "adjustment_in",
          sourceType: "inventoryAdjustment",
          sourceId: adjId,
          note: `${typeText}: ${notes}`
        });
      }

      const invAcc = allAccounts.find(a => a.code === "1-1-4-1-01") || allAccounts.find(a => a.code === "1-1-4-1") || { id: "INV_STOCK", code: "1-1-4-1-01", name: "مخزون مستودع المواد الغذائية" };
      let offsetAcc = allAccounts.find(a => a.code === "5-2-2") || allAccounts.find(a => a.code === "5-2") || { id: "DAMAGE_EXPENSE", code: "5-2-2", name: "خسائر وتوالف مخزنية" };

      if (isDeduction) {
        await createJournalEntry({
          date,
          description: `${typeText} لعدد ${window._adjLines.length} أصناف - ${notes}`,
          sourceType: "inventoryAdjustment",
          sourceId: adjId,
          lines: [
            { accountId: offsetAcc.id, accountCode: offsetAcc.code, accountName: offsetAcc.name, debit: totalCost, credit: 0, note: typeText },
            { accountId: invAcc.id,    accountCode: invAcc.code,    accountName: invAcc.name,    debit: 0, credit: totalCost, note: "تخفيض المخزون" }
          ]
        });
      } else {
        offsetAcc = allAccounts.find(a => a.code === "4-2-1") || allAccounts.find(a => a.code === "4-2") || { id: "SURPLUS_REV", code: "4-2-1", name: "إيرادات فروق وفائض جرد" };
        await createJournalEntry({
          date,
          description: `تسوية إضافة لعدد ${window._adjLines.length} أصناف - ${notes}`,
          sourceType: "inventoryAdjustment",
          sourceId: adjId,
          lines: [
            { accountId: invAcc.id,    accountCode: invAcc.code,    accountName: invAcc.name,    debit: totalCost, credit: 0, note: "زيادة المخزون" },
            { accountId: offsetAcc.id, accountCode: offsetAcc.code, accountName: offsetAcc.name, debit: 0, credit: totalCost, note: "فائض تسوية" }
          ]
        });
      }

      showToast("تم حفظ المعاملة وتحديث المخزون وإنشاء القيد المحاسبي بنجاح", "success");
    }

    closeModal("adj-modal");
    switchOpsSubModule("adjust");
  } catch(err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

function renderAdjustmentList(container, adjs) {
  if (adjs.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">⚖️</div>
        <div style="font-size:16px; font-weight:700;">لا توجد تسويات مسجلة</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لتسجيل تسوية إضافة أو خصم أو إتلاف</p>
      </div>`;
    return;
  }

  const typeLabels = {
    "damage": "إعدام تالف",
    "add": "تسوية إضافة (+)",
    "deduct": "تسوية خصم (-)",
    "return-damaged": "مرتجع تالف للمورد",
    "expired": "إعدام منتهي الصلاحية",
    "donation": "تبرعات وهبات"
  };

  container.innerHTML = `
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
            ${adjs.map(a => {
              const lines = a.lines || (a.productId ? [{
                productId: a.productId,
                sku: a.sku || "",
                name: a.productName || "صنف",
                qty: a.qty || 1,
                cost: a.costPrice || 0,
                totalCost: (a.qty || 1) * (a.costPrice || 0)
              }] : []);

              const itemsSummary = lines.map(l => `${resolveItemName(l)} (${formatQuantity(l.qty)})`).join("، ");
              const typeBadgeClass = (a.type === 'add') ? 'good' : ((a.type === 'damage' || a.type === 'expired') ? 'bad' : 'warn');

              return `
                <tr>
                  <td class="mono font-bold">${a.date}</td>
                  <td><span class="badge ${typeBadgeClass} font-bold">${typeLabels[a.type] || a.type}</span></td>
                  <td style="max-width:300px;">${itemsSummary || "—"}</td>
                  <td class="mono font-bold text-good" style="text-align:left;">${formatCurrency(a.totalCost || 0)}</td>
                  <td><strong>${a.warehouseName}</strong></td>
                  <td>${a.notes || "—"}</td>
                  <td class="no-print" style="text-align:center; white-space:nowrap;">
                    <button class="btn btn-sm btn-ghost text-primary" onclick="window.showAdjDetail('${a.id}')">👁️ معاينة</button>
                    <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printAdjDetail('${a.id}')">🖨️ طباعة</button>
                    <button class="btn btn-sm btn-ghost text-warn" onclick="window.editAdjustment('${a.id}')">✏️ تعديل</button>
                    <button class="btn btn-sm btn-ghost text-bad" onclick="window.deleteAdjustment('${a.id}')">🗑️ حذف</button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.showAdjDetail = async (id) => {
  const a = activeListCache.find(x => x.id === id);
  if (!a) return;

  activeDetailDoc = a;
  document.getElementById("adj-detail-title").textContent = `⚖️ تفاصيل تسوية مخزنية #${id.slice(0, 8)}`;

  const lines = a.lines || [];
  const bodyEl = document.getElementById("adj-detail-body");
  bodyEl.innerHTML = `
    <div class="grid-3 gap-12 mb-16" style="background:var(--bg-2); padding:12px 16px; border-radius:8px; border:1px solid var(--border-soft);">
      <div><span class="dim" style="font-size:11px;">تاريخ المعاملة:</span> <strong class="mono font-bold text-primary">${a.date}</strong></div>
      <div><span class="dim" style="font-size:11px;">نوع المعاملة:</span> <strong>${a.type}</strong></div>
      <div><span class="dim" style="font-size:11px;">المستودع:</span> <strong>${a.warehouseName}</strong></div>
      <div><span class="dim" style="font-size:11px;">إجمالي التكلفة:</span> <strong class="mono font-bold text-good">${formatCurrency(a.totalCost || 0)}</strong></div>
      <div style="grid-column:span 2;"><span class="dim" style="font-size:11px;">البيان:</span> <strong>${a.notes || "—"}</strong></div>
    </div>

    <h4 style="margin:0 0 10px 0; font-size:13px; font-weight:700;">الأصناف المتأثرة بالتسوية (${lines.length} أصناف):</h4>
    <div class="table-container mb-16" style="border:1px solid var(--border-soft); border-radius:8px;">
      <table class="data-dense" style="width:100%;">
        <thead><tr><th>#</th><th>الرمز</th><th>اسم الصنف</th><th style="text-align:center;">الكمية</th><th style="text-align:left;">تكلفة الوحدة</th><th style="text-align:left;">إجمالي التكلفة</th></tr></thead>
        <tbody>
          ${lines.map((l, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td class="mono font-bold text-dim">${l.sku || "—"}</td>
              <td><strong>${resolveItemName(l)}</strong></td>
              <td class="mono font-bold text-primary" style="text-align:center; font-size:13px;">${formatQuantity(l.qty)}</td>
              <td class="mono" style="text-align:left;">${formatCurrency(l.cost || 0)}</td>
              <td class="mono font-bold" style="text-align:left;">${formatCurrency(l.totalCost || (l.qty * (l.cost || 0)))}</td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr style="font-weight:bold; background:var(--bg-hover);">
            <td colspan="5" style="text-align:right;">الإجمالي الكلي:</td>
            <td class="mono font-bold text-good" style="text-align:left;">${formatCurrency(a.totalCost || 0)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  const actionsEl = document.getElementById("adj-detail-actions");
  actionsEl.innerHTML = `
    <button class="btn btn-secondary" onclick="window.printAdjDetail('${id}')">🖨️ طباعة سند التسوية</button>
  `;

  openModal("adj-detail-modal");
};

window.printAdjDetail = async (id) => {
  const adj = activeListCache.find(x => x.id === id) || (await getDoc(doc(db, `companies/${COMPANY_ID}/inventoryAdjustments`, id))).data();
  if (!adj) return;

  const lines = adj.lines || [];
  const metaHtml = `
    <div class="meta-item"><div class="meta-label">رقم سند التسوية:</div><div class="meta-val mono font-bold text-primary">ADJ-${id.slice(0, 8)}</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ التسوية:</div><div class="meta-val mono">${adj.date}</div></div>
    <div class="meta-item"><div class="meta-label">نوع العملية:</div><div class="meta-val">${adj.type}</div></div>
    <div class="meta-item"><div class="meta-label">المستودع المتأثر:</div><div class="meta-val">${adj.warehouseName}</div></div>
    <div class="meta-item"><div class="meta-label">إجمالي التكلفة المالية:</div><div class="meta-val mono font-bold">${formatCurrency(adj.totalCost || 0)}</div></div>
    <div class="meta-item"><div class="meta-label">البيان والأسباب:</div><div class="meta-val">${adj.notes || "—"}</div></div>
  `;

  const contentHtml = `
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
        ${lines.map((l, idx) => `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td class="mono font-bold" style="text-align:center;">${l.sku || "—"}</td>
            <td><strong>${resolveItemName(l)}</strong></td>
            <td class="mono font-bold" style="text-align:center; font-size:12px;">${formatQuantity(l.qty)}</td>
            <td class="mono" style="text-align:left;">${formatCurrency(l.cost || 0)}</td>
            <td class="mono font-bold" style="text-align:left;">${formatCurrency(l.totalCost || (l.qty * (l.cost || 0)))}</td>
          </tr>
        `).join("")}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" style="text-align:right;">الإجمالي العام لسند التسوية:</td>
          <td class="mono font-bold" style="text-align:left;">${formatCurrency(adj.totalCost || 0)}</td>
        </tr>
      </tfoot>
    </table>
  `;

  const signaturesHtml = `
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
  `;

  const html = wrapOpsPrintLayout({
    title: `سند تسوية وإهلاك مخزني رسمي #ADJ-${id.slice(0, 8)}`,
    docBadge: `<span class="doc-badge warn">سند تسوية معتمد</span>`,
    metaHtml,
    contentHtml,
    signaturesHtml,
    footerNotes: adj.notes || "تمت التسوية بناءً على محضر الجرد الفعلي وقرار اللجنة المختصة."
  });

  window.printOpsDocument(html, `ADJ-${id.slice(0, 8)}`);
};

window.editAdjustment = async (id) => {
  const adj = activeListCache.find(x => x.id === id);
  if (!adj) return;

  window._editingAdjId = id;
  document.getElementById("adj-type").value = adj.type || "damage";
  document.getElementById("adj-wh").value = adj.warehouseId || "";
  document.getElementById("adj-date").value = adj.date || todayString();
  document.getElementById("adj-notes").value = adj.notes || "";
  document.getElementById("adj-modal-title").textContent = "✏️ تعديل معاملة التسوية المخزنية";

  if (adj.lines && Array.isArray(adj.lines)) {
    window._adjLines = adj.lines.map(l => ({ ...l }));
  } else if (adj.productId) {
    window._adjLines = [{
      productId: adj.productId,
      sku: adj.sku || "",
      name: adj.productName || "صنف",
      qty: adj.qty || 1,
      cost: adj.costPrice || 0,
      totalCost: (adj.qty || 1) * (adj.costPrice || 0)
    }];
  } else {
    window._adjLines = [];
  }

  renderAdjLinesTable();
  const btn = document.getElementById("save-adj-btn");
  if (btn) btn.textContent = "💾 تحديث بيانات المعاملة";
  openModal("adj-modal");
};

window.deleteAdjustment = async (id) => {
  if (confirm("تحذير: هل أنت متأكد من حذف هذه التسوية نهائياً؟")) {
    try {
      await deleteDoc(doc(db, `companies/${COMPANY_ID}/inventoryAdjustments`, id));
      showToast("تم حذف التسوية بنجاح", "success");
      switchOpsSubModule("adjust");
    } catch(err) {
      showToast(err.message, "error");
    }
  }
};

// ============================================================
// 12. Spot Count (الجرد المفاجئ) Subsystem
// ============================================================

function syncCurrentSpotCountLinesFromDOM() {
  const tbody = document.getElementById("sc-lines-tbody");
  if (!tbody || !window.spotCountLines || !window.spotCountLines.length) return;
  const rows = tbody.querySelectorAll("tr[data-idx]");
  rows.forEach(r => {
    const idx = parseInt(r.getAttribute("data-idx"), 10);
    if (isNaN(idx) || !window.spotCountLines[idx]) return;
    const inputs = r.querySelectorAll("input.sc-actual");
    if (inputs.length === 1) {
      window.spotCountLines[idx].actualQty1 = parseFloat(inputs[0].value) || 0;
      window.spotCountLines[idx].diffQty1 = window.spotCountLines[idx].actualQty1 - window.spotCountLines[idx].bookQty1;
    } else if (inputs.length >= 2) {
      window.spotCountLines[idx].actualQty1 = parseFloat(inputs[0].value) || 0;
      window.spotCountLines[idx].diffQty1 = window.spotCountLines[idx].actualQty1 - window.spotCountLines[idx].bookQty1;
      window.spotCountLines[idx].actualQty2 = parseFloat(inputs[1].value) || 0;
      window.spotCountLines[idx].diffQty2 = window.spotCountLines[idx].actualQty2 - window.spotCountLines[idx].bookQty2;
    }
  });
}

window.filterSpotCountTable = (queryStr) => {
  const q = (queryStr !== undefined ? queryStr : (document.getElementById("sc-search-input")?.value || "")).trim().toLowerCase();
  const mode = document.getElementById("sc-filter-mode")?.value || "all";
  const tbody = document.getElementById("sc-lines-tbody");
  if (!tbody) return;
  const rows = tbody.querySelectorAll("tr[data-idx]");
  let visibleCount = 0;

  rows.forEach(r => {
    const idx = parseInt(r.getAttribute("data-idx"), 10);
    const line = window.spotCountLines[idx];
    if (!line) return;

    const matchSearch = !q || 
      (line.productName || "").toLowerCase().includes(q) || 
      (line.sku || "").toLowerCase().includes(q);
    
    let matchMode = true;
    if (mode === "has-stock") {
      matchMode = (line.bookQty1 > 0 || line.bookQty2 > 0);
    } else if (mode === "diff-only") {
      matchMode = (line.diffQty1 !== 0 || line.diffQty2 !== 0);
    }

    if (matchSearch && matchMode) {
      r.style.display = "";
      visibleCount++;
    } else {
      r.style.display = "none";
    }
  });

  const badge = document.getElementById("sc-count-badge");
  if (badge) {
    badge.textContent = `المعروض: ${visibleCount} من ${window.spotCountLines.length}`;
  }
};

window.loadSpotCountItems = async () => {
  const whId1 = document.getElementById("sc-wh")?.value;
  const whId2 = document.getElementById("sc-wh2")?.value;
  if (!whId1) {
    showToast("يرجى اختيار المخزن أولاً", "warning");
    return;
  }
  const loadBtn = document.getElementById("load-sc-btn");
  if (loadBtn) {
    loadBtn.disabled = true;
    loadBtn.innerHTML = `⏳ جاري تحميل الأرصدة...`;
  }

  try {
    // 1. Ensure products and warehouses are populated
    if (!products || !products.length) {
      products = await getAll(COLS.products());
    }
    if (!warehouses || !warehouses.length) {
      warehouses = await getAll(COLS.warehouses());
    }

    // 2. Fetch live stock from stockByWarehouse collection (700+ real records)
    const stockSnap = await getDocs(COLS.stockByWarehouse());
    const stockMap1 = {};
    const stockMap2 = {};

    stockSnap.docs.forEach(docSnap => {
      const d = docSnap.data() || {};
      const docId = docSnap.id || "";
      const qty = parseFloat(d.qty !== undefined ? d.qty : (d.quantity !== undefined ? d.quantity : d.totalQty)) || 0;

      // Warehouse 1 match
      if (d.warehouseId === whId1 || docId.startsWith(`${whId1}_`)) {
        const pId = d.productId || docId.replace(`${whId1}_`, "");
        if (pId) stockMap1[pId] = qty;
      }

      // Warehouse 2 match (if selected)
      if (whId2 && (d.warehouseId === whId2 || docId.startsWith(`${whId2}_`))) {
        const pId = d.productId || docId.replace(`${whId2}_`, "");
        if (pId) stockMap2[pId] = qty;
      }
    });

    // 3. Fallback for Main Warehouse if an active product has stock stored directly on product record
    const wh1Obj = warehouses.find(w => w.id === whId1);
    const isMainWh1 = wh1Obj?.type === "Main" || wh1Obj?.name?.includes("رئيس") || wh1Obj?.name?.includes("الرئيسي") || wh1Obj?.name?.includes("الرئيسى");
    if (isMainWh1) {
      products.forEach(p => {
        if (stockMap1[p.id] === undefined) {
          const fallbackQty = parseFloat(p.stockQty !== undefined ? p.stockQty : (p.totalQty !== undefined ? p.totalQty : (p.quantity !== undefined ? p.quantity : (p.stock !== undefined ? p.stock : 0)))) || 0;
          if (fallbackQty > 0) stockMap1[p.id] = fallbackQty;
        }
      });
    }

    const wh2Obj = whId2 ? warehouses.find(w => w.id === whId2) : null;
    const isMainWh2 = wh2Obj && (wh2Obj.type === "Main" || wh2Obj.name?.includes("رئيس") || wh2Obj.name?.includes("الرئيسي") || wh2Obj.name?.includes("الرئيسى"));
    if (isMainWh2) {
      products.forEach(p => {
        if (stockMap2[p.id] === undefined) {
          const fallbackQty = parseFloat(p.stockQty !== undefined ? p.stockQty : (p.totalQty !== undefined ? p.totalQty : (p.quantity !== undefined ? p.quantity : (p.stock !== undefined ? p.stock : 0)))) || 0;
          if (fallbackQty > 0) stockMap2[p.id] = fallbackQty;
        }
      });
    }

    const thead = document.getElementById("sc-table-thead");
    const tbody = document.getElementById("sc-lines-tbody");
    const wh1Name = wh1Obj?.name || "المخزن 1";
    const wh2Name = wh2Obj ? wh2Obj.name : "";

    // Show products: active unarchived products or products with positive stock in either warehouse
    const prodsList = products
      .filter(p => p && (p.name || p.sku) && (!p.archived || (stockMap1[p.id] || 0) > 0 || (whId2 && (stockMap2[p.id] || 0) > 0)))
      .sort((a, b) => (a.sku || a.name || "").localeCompare(b.sku || b.name || "", undefined, { numeric: true }));

    window.spotCountLines = prodsList.map(p => {
      const b1 = parseFloat(stockMap1[p.id]) || 0;
      const b2 = whId2 ? (parseFloat(stockMap2[p.id]) || 0) : 0;
      return {
        productId: p.id,
        productName: p.name || p.nameAr || "صنف غير مسمى",
        sku: p.sku || "",
        unit: p.unit || "حبة",
        costPrice: parseFloat(p.costPrice || p.averageCost || p.purchasePrice) || 0,
        bookQty1: b1,
        actualQty1: b1,
        diffQty1: 0,
        bookQty2: b2,
        actualQty2: b2,
        diffQty2: 0
      };
    });

    if (whId2) {
      thead.innerHTML = `
        <tr>
          <th>الصنف</th>
          <th colspan="3" style="text-align:center;background:#eff6ff;border-bottom:2px solid #3b82f6;">${wh1Name}</th>
          <th colspan="3" style="text-align:center;background:#f0fdf4;border-bottom:2px solid #22c55e;">${wh2Name}</th>
        </tr>
        <tr>
          <th>الاسم (الرمز)</th>
          <th style="background:#eff6ff;text-align:center;">دفتري</th>
          <th style="background:#eff6ff;text-align:center;">فعلي</th>
          <th style="background:#eff6ff;text-align:center;">الفرق</th>
          <th style="background:#f0fdf4;text-align:center;">دفتري</th>
          <th style="background:#f0fdf4;text-align:center;">فعلي</th>
          <th style="background:#f0fdf4;text-align:center;">الفرق</th>
        </tr>`;

      tbody.innerHTML = window.spotCountLines.map((l, i) => `<tr data-idx="${i}">
        <td><strong>${l.productName}</strong> <span class="mono dim">(${l.sku || '—'})</span></td>
        <td class="mono font-bold" style="background:#eff6ff;text-align:center;">${formatQuantity(l.bookQty1)}</td>
        <td style="background:#eff6ff;text-align:center;">
          <input type="number" step="any" class="input mono sm sc-actual" style="width:85px;font-weight:bold;text-align:center;" value="${l.actualQty1}"
            oninput="window.spotCountLines[${i}].actualQty1=parseFloat(this.value)||0; window.updateSCDiff1(${i}, this)" />
        </td>
        <td class="mono font-bold sc-diff-1" style="background:#eff6ff;text-align:center;">0</td>
        <td class="mono font-bold" style="background:#f0fdf4;text-align:center;">${formatQuantity(l.bookQty2)}</td>
        <td style="background:#f0fdf4;text-align:center;">
          <input type="number" step="any" class="input mono sm sc-actual" style="width:85px;font-weight:bold;text-align:center;" value="${l.actualQty2}"
            oninput="window.spotCountLines[${i}].actualQty2=parseFloat(this.value)||0; window.updateSCDiff2(${i}, this)" />
        </td>
        <td class="mono font-bold sc-diff-2" style="background:#f0fdf4;text-align:center;">0</td>
      </tr>`).join("");
    } else {
      thead.innerHTML = `
        <tr>
          <th>الصنف</th>
          <th style="text-align:center;">الكمية الدفترية</th>
          <th style="text-align:center;">الكمية الفعلية</th>
          <th style="text-align:center;">الفرق</th>
        </tr>`;

      tbody.innerHTML = window.spotCountLines.map((l, i) => `<tr data-idx="${i}">
        <td><strong>${l.productName}</strong> <span class="mono dim">(${l.sku || '—'})</span></td>
        <td class="mono font-bold" style="text-align:center;">${formatQuantity(l.bookQty1)}</td>
        <td style="text-align:center;">
          <input type="number" step="any" class="input mono sm sc-actual" style="width:95px;font-weight:bold;text-align:center;" value="${l.actualQty1}"
            oninput="window.spotCountLines[${i}].actualQty1=parseFloat(this.value)||0; window.updateSCDiff1(${i}, this)" />
        </td>
        <td class="mono font-bold sc-diff-1" style="text-align:center;">0</td>
      </tr>`).join("");
    }

    const saveBtn = document.getElementById("save-sc-btn");
    if (saveBtn) saveBtn.disabled = false;

    window.filterSpotCountTable();
    showToast(`تم تحميل ${window.spotCountLines.length} صنف بأرصدتها الدفترية الحقيقية بنجاح`, "success");
  } catch(err) {
    console.error("Error loading spot count items:", err);
    showToast("خطأ في تحميل أصناف المخزن: " + err.message, "error");
  } finally {
    if (loadBtn) {
      loadBtn.disabled = false;
      loadBtn.innerHTML = `📥 تحميل أصناف المخزن`;
    }
  }
};

window.updateSCDiff1 = (i, input) => {
  const line = window.spotCountLines[i];
  if (!line) return;
  const diff = line.actualQty1 - line.bookQty1;
  line.diffQty1 = diff;
  const cell = input.closest("tr").querySelector(".sc-diff-1");
  if (cell) {
    cell.textContent = diff !== 0 ? (diff > 0 ? `+${formatQuantity(diff)}` : formatQuantity(diff)) : "0";
    cell.className = `mono font-bold sc-diff-1 ${diff < 0 ? 'text-bad' : (diff > 0 ? 'text-good' : '')}`;
  }
};

window.updateSCDiff2 = (i, input) => {
  const line = window.spotCountLines[i];
  if (!line) return;
  const diff = line.actualQty2 - line.bookQty2;
  line.diffQty2 = diff;
  const cell = input.closest("tr").querySelector(".sc-diff-2");
  if (cell) {
    cell.textContent = diff !== 0 ? (diff > 0 ? `+${formatQuantity(diff)}` : formatQuantity(diff)) : "0";
    cell.className = `mono font-bold sc-diff-2 ${diff < 0 ? 'text-bad' : (diff > 0 ? 'text-good' : '')}`;
  }
};

window.printCurrentSpotCountDraft = async () => {
  syncCurrentSpotCountLinesFromDOM();
  const whId1 = document.getElementById("sc-wh")?.value;
  const whId2 = document.getElementById("sc-wh2")?.value || "";
  const date = document.getElementById("sc-date")?.value || todayString();

  if (!whId1) {
    showToast("يرجى اختيار المخزن أولاً", "warning");
    return;
  }

  if (!window.spotCountLines || window.spotCountLines.length === 0) {
    await window.loadSpotCountItems();
  }

  if (!window.spotCountLines || window.spotCountLines.length === 0) {
    showToast("لا توجد أصناف في هذا المخزن للطباعة", "warning");
    return;
  }

  const wh1 = warehouses.find(w => w.id === whId1);
  const wh2 = whId2 ? warehouses.find(w => w.id === whId2) : null;

  const draftSC = {
    id: "draft-" + Date.now(),
    isDraft: true,
    warehouseId: whId1,
    warehouseName: wh1?.name || "المخزن 1",
    warehouseId2: whId2,
    warehouseName2: wh2 ? wh2.name : "",
    date,
    lines: window.spotCountLines
  };

  window._doPrintSpotCount(draftSC);
};

window.exportCurrentSpotCountDraftExcel = async () => {
  syncCurrentSpotCountLinesFromDOM();
  const whId1 = document.getElementById("sc-wh")?.value;
  const whId2 = document.getElementById("sc-wh2")?.value || "";
  const date = document.getElementById("sc-date")?.value || todayString();

  if (!whId1) {
    showToast("يرجى اختيار المخزن أولاً", "warning");
    return;
  }

  if (!window.spotCountLines || window.spotCountLines.length === 0) {
    await window.loadSpotCountItems();
  }

  if (!window.spotCountLines || window.spotCountLines.length === 0) {
    showToast("لا توجد أصناف في هذا المخزن للتصدير", "warning");
    return;
  }

  const wh1 = warehouses.find(w => w.id === whId1);
  const wh2 = whId2 ? warehouses.find(w => w.id === whId2) : null;

  const draftSC = {
    id: "draft-" + Date.now(),
    isDraft: true,
    warehouseId: whId1,
    warehouseName: wh1?.name || "المخزن 1",
    warehouseId2: whId2,
    warehouseName2: wh2 ? wh2.name : "",
    date,
    lines: window.spotCountLines
  };

  await exportSpotCountObjectToExcel(draftSC);
};

window.saveSpotCount = async () => {
  syncCurrentSpotCountLinesFromDOM();
  const whId1 = document.getElementById("sc-wh").value;
  const whId2 = document.getElementById("sc-wh2").value;
  const date = document.getElementById("sc-date").value || todayString();

  if (!whId1 || !date || !window.spotCountLines.length) {
    showToast("يرجى ملء الحقول الإلزامية وتحميل الأصناف", "warning");
    return;
  }

  const btn = document.getElementById("save-sc-btn");
  btn.disabled = true;

  try {
    const wh1 = warehouses.find(w => w.id === whId1);
    const wh2 = whId2 ? warehouses.find(w => w.id === whId2) : null;
    const linesWithDiff1 = window.spotCountLines.filter(l => l.actualQty1 !== l.bookQty1);

    for (const l of linesWithDiff1) {
      const diff = l.actualQty1 - l.bookQty1;
      await adjustStock(whId1, l.productId, diff, {
        type: diff > 0 ? "spot_count_surplus" : "spot_count_shortage",
        sourceType: "spotCount",
        note: `جرد مفاجئ (${wh1?.name}) فرق: ${diff}`
      });
    }

    if (whId2) {
      const linesWithDiff2 = window.spotCountLines.filter(l => l.actualQty2 !== l.bookQty2);
      for (const l of linesWithDiff2) {
        const diff = l.actualQty2 - l.bookQty2;
        await adjustStock(whId2, l.productId, diff, {
          type: diff > 0 ? "spot_count_surplus" : "spot_count_shortage",
          sourceType: "spotCount",
          note: `جرد مفاجئ (${wh2?.name}) فرق: ${diff}`
        });
      }
    }

    const docId = await create(COLS.inventoryAdjustments(), {
      opType: "spot-count",
      warehouseId: whId1,
      warehouseName: wh1?.name || "المخزن الأول",
      warehouseId2: whId2 || null,
      warehouseName2: wh2 ? wh2.name : null,
      date,
      lines: window.spotCountLines,
      createdAt: new Date().toISOString()
    });

    showToast("تم اعتماد الجرد وإنشاء التسويات بنجاح", "success");
    closeModal("spot-count-modal");
    window.spotCountLines = [];
    switchOpsSubModule("spot-count");
  } catch(err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
  }
};

function renderSpotCountList(area, list) {
  if (!list.length) {
    area.innerHTML = `
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">🔢</div>
        <div style="font-size:16px; font-weight:700;">لا توجد عمليات جرد مفاجئ مسجلة</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لبدء كشف جرد مفاجئ للمستودعات</p>
      </div>`;
    return;
  }

  area.innerHTML = `
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
            ${list.map(d => {
              const lines = d.lines || [];
              const diffCount = lines.filter(l => (l.actualQty1 !== l.bookQty1) || (d.warehouseId2 && l.actualQty2 !== l.bookQty2)).length;
              return `
                <tr>
                  <td class="mono font-bold">${d.date || "—"}</td>
                  <td><strong>${d.warehouseName}</strong></td>
                  <td>${d.warehouseName2 ? `<strong>${d.warehouseName2}</strong>` : '<span class="dim">—</span>'}</td>
                  <td class="mono font-bold text-primary">${lines.length} صنف</td>
                  <td class="mono font-bold ${diffCount > 0 ? 'text-bad' : 'text-good'}">${diffCount} صنف</td>
                  <td class="no-print" style="text-align:center; white-space:nowrap;">
                    <button class="btn btn-sm btn-ghost text-primary" onclick="window.showSpotCountDetail('${d.id}')">👁️ معاينة وتفاصيل</button>
                    <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printSpotCountById('${d.id}')">🖨️ طباعة</button>
                    <button class="btn btn-sm btn-ghost text-good" onclick="window.exportSpotCountByIdExcel('${d.id}')">📊 Excel</button>
                    <button class="btn btn-sm btn-ghost text-bad" onclick="window.deleteSpotCount('${d.id}')">❌ حذف وتراجع</button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.showSpotCountDetail = async (id) => {
  const sc = activeListCache.find(x => x.id === id);
  if (!sc) return;

  activeDetailSC = sc;
  const hasWh2 = Boolean(sc.warehouseId2);
  const lines = sc.lines || [];
  const bodyEl = document.getElementById("sc-detail-body");

  bodyEl.innerHTML = `
    <div class="grid-3 gap-12 mb-16" style="background:var(--bg-2); padding:12px 16px; border-radius:8px; border:1px solid var(--border-soft);">
      <div><span class="dim" style="font-size:11px;">تاريخ الجرد:</span> <strong class="mono">${sc.date}</strong></div>
      <div><span class="dim" style="font-size:11px;">المستودع الأول:</span> <strong>${sc.warehouseName}</strong></div>
      <div><span class="dim" style="font-size:11px;">المستودع الثاني:</span> <strong>${sc.warehouseName2 || "—"}</strong></div>
    </div>

    <div class="table-container mb-16" style="border:1px solid var(--border-soft); border-radius:8px;">
      <table class="data-dense" style="width:100%;">
        <thead>
          <tr>
            <th>الصنف</th>
            <th>الدفترى (1)</th>
            <th>الفعلى (1)</th>
            <th>الفرق (1)</th>
            ${hasWh2 ? '<th>الدفترى (2)</th><th>الفعلى (2)</th><th>الفرق (2)</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${lines.map(l => {
            const d1 = l.actualQty1 - l.bookQty1;
            const d2 = hasWh2 ? (l.actualQty2 - l.bookQty2) : 0;
            return `
              <tr>
                <td><strong>${l.productName}</strong> <span class="mono dim">(${l.sku})</span></td>
                <td class="mono">${formatQuantity(l.bookQty1)}</td>
                <td class="mono font-bold">${formatQuantity(l.actualQty1)}</td>
                <td class="mono font-bold ${d1 < 0 ? 'text-bad' : (d1 > 0 ? 'text-good' : '')}">${d1}</td>
                ${hasWh2 ? `
                  <td class="mono">${formatQuantity(l.bookQty2)}</td>
                  <td class="mono font-bold">${formatQuantity(l.actualQty2)}</td>
                  <td class="mono font-bold ${d2 < 0 ? 'text-bad' : (d2 > 0 ? 'text-good' : '')}">${d2}</td>
                ` : ''}
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;

  openModal("spot-count-detail-modal");
};

async function exportSpotCountObjectToExcel(sc) {
  const hasWh2 = Boolean(sc.warehouseId2);
  const headers = hasWh2 
    ? ["#", "الصنف", "الرمز", "الوحدة", "دفترى (1)", "فعلى (1)", "فرق (1)", "دفترى (2)", "فعلى (2)", "فرق (2)"]
    : ["#", "الصنف", "الرمز", "الوحدة", "الكمية الدفترية", "الكمية الفعلية", "فرق الجرد"];

  const rows = (sc.lines || []).map((l, i) => {
    const d1 = l.actualQty1 - l.bookQty1;
    const unit = l.unit || (products.find(p => p.id === l.productId)?.unit) || "حبة";
    if (hasWh2) {
      const d2 = l.actualQty2 - l.bookQty2;
      return [i + 1, l.productName, l.sku, unit, l.bookQty1, l.actualQty1, d1, l.bookQty2, l.actualQty2, d2];
    }
    return [i + 1, l.productName, l.sku, unit, l.bookQty1, l.actualQty1, d1];
  });

  await exportToExcel({
    title: `كشف جرد مفاجئ - ${sc.warehouseName}`,
    headers,
    rows
  });
}

window.exportSpotCountByIdExcel = async (id) => {
  const sc = activeListCache.find(x => x.id === id);
  if (sc) await exportSpotCountObjectToExcel(sc);
};

window.exportActiveSpotCountExcel = async () => {
  if (activeDetailSC) await exportSpotCountObjectToExcel(activeDetailSC);
};

window.printActiveSpotCount = () => {
  if (activeDetailSC) window._doPrintSpotCount(activeDetailSC);
};

window.printSpotCountById = async (id) => {
  const sc = activeListCache.find(x => x.id === id);
  if (sc) window._doPrintSpotCount(sc);
};

window.deleteSpotCount = async (id) => {
  if (confirm("تحذير: هل أنت متأكد من حذف هذا الجرد والتراجع عن التسويات المخزنية الناتجة عنه؟")) {
    try {
      const snap = await getDoc(doc(db, `companies/${COMPANY_ID}/inventoryAdjustments`, id));
      if (!snap.exists()) return;
      const sc = snap.data();

      for (const l of (sc.lines || [])) {
        const d1 = l.actualQty1 - l.bookQty1;
        if (d1 !== 0) {
          await adjustStock(sc.warehouseId, l.productId, -d1, {
            type: "spot_count_reversal",
            note: "تراجع عن تسوية الجرد المفاجئ"
          });
        }
        if (sc.warehouseId2) {
          const d2 = l.actualQty2 - l.bookQty2;
          if (d2 !== 0) {
            await adjustStock(sc.warehouseId2, l.productId, -d2, {
              type: "spot_count_reversal",
              note: "تراجع عن تسوية الجرد المفاجئ"
            });
          }
        }
      }

      await deleteDoc(doc(db, `companies/${COMPANY_ID}/inventoryAdjustments`, id));
      showToast("تم حذف الجرد والتراجع عن كافة التسويات بنجاح", "success");
      switchOpsSubModule("spot-count");
    } catch(err) {
      showToast(err.message, "error");
    }
  }
};

// Specialized High-End Spot Count Print Builder
function buildSpotCountPrintHTML(sc) {
  const hasWh2 = Boolean(sc.warehouseId2 && sc.warehouseId2 !== "");
  const whName1 = sc.warehouseName || "المستودع الأول";
  const whName2 = sc.warehouseName2 || (hasWh2 ? "المستودع الثاني" : "");
  const isDraft = Boolean(sc.isDraft);
  const lines = sc.lines || [];
  const totalItems = lines.length;

  let totalBook1 = 0, totalActual1 = 0, totalDiff1 = 0;
  let totalBook2 = 0, totalActual2 = 0, totalDiff2 = 0;
  let matchedCount = 0;
  let shortageCount = 0;
  let surplusCount = 0;

  lines.forEach(l => {
    const b1 = parseFloat(l.bookQty1 !== undefined ? l.bookQty1 : (l.bookQty ?? 0)) || 0;
    const a1 = parseFloat(l.actualQty1 !== undefined ? l.actualQty1 : (l.actualQty ?? 0)) || 0;
    const d1 = a1 - b1;
    totalBook1 += b1;
    totalActual1 += a1;
    totalDiff1 += d1;

    let d2 = 0;
    if (hasWh2) {
      const b2 = parseFloat(l.bookQty2 ?? 0) || 0;
      const a2 = parseFloat(l.actualQty2 ?? 0) || 0;
      d2 = a2 - b2;
      totalBook2 += b2;
      totalActual2 += a2;
      totalDiff2 += d2;
    }

    const hasAnyDiff = (d1 !== 0) || (hasWh2 && d2 !== 0);
    if (!hasAnyDiff) {
      matchedCount++;
    } else {
      if (d1 < 0 || (hasWh2 && d2 < 0)) shortageCount++;
      else if (d1 > 0 || (hasWh2 && d2 > 0)) surplusCount++;
    }
  });

  const docTitle = isDraft ? "كشف جرد مفاجئ (مسودة تدقيق قبل الاعتماد)" : "محضر جرد مفاجئ معتمد رسمياً";
  const badgeText = isDraft ? "مسودة جرد تدقيق" : "محضر جرد معتمد";
  const badgeClass = isDraft ? "badge-warn" : "badge-good";
  const printTimestamp = new Date().toLocaleString("ar-SA", { dateStyle: "full", timeStyle: "short" });

  const rowsHtml = lines.map((l, i) => {
    const b1 = parseFloat(l.bookQty1 !== undefined ? l.bookQty1 : (l.bookQty ?? 0)) || 0;
    const a1 = parseFloat(l.actualQty1 !== undefined ? l.actualQty1 : (l.actualQty ?? 0)) || 0;
    const d1 = a1 - b1;

    const b2 = hasWh2 ? (parseFloat(l.bookQty2 ?? 0) || 0) : 0;
    const a2 = hasWh2 ? (parseFloat(l.actualQty2 ?? 0) || 0) : 0;
    const d2 = hasWh2 ? (a2 - b2) : 0;

    let rowClass = "";
    if (d1 < 0 || (hasWh2 && d2 < 0)) rowClass = "row-deficit";
    else if (d1 > 0 || (hasWh2 && d2 > 0)) rowClass = "row-surplus";

    const d1Str = d1 !== 0 ? (d1 > 0 ? `+${formatQuantity(d1)}` : formatQuantity(d1)) : "0";
    const d2Str = d2 !== 0 ? (d2 > 0 ? `+${formatQuantity(d2)}` : formatQuantity(d2)) : "0";
    const unit = l.unit || (products.find(p => p.id === l.productId)?.unit) || "حبة";

    if (hasWh2) {
      return `
        <tr class="${rowClass}">
          <td style="text-align:center; font-weight:700; color:#64748b;">${i + 1}</td>
          <td class="mono font-bold" style="text-align:center;">${l.sku || "—"}</td>
          <td style="font-weight:600; color:#1e293b;">${l.productName}</td>
          <td style="text-align:center; color:#64748b; font-size:10px;">${unit}</td>
          <td class="mono" style="text-align:center;">${formatQuantity(b1)}</td>
          <td style="text-align:center;"><span class="actual-box mono">${formatQuantity(a1)}</span></td>
          <td class="mono ${d1 < 0 ? 'text-bad' : (d1 > 0 ? 'text-good' : '')}" style="text-align:center;">${d1Str}</td>
          <td class="mono" style="text-align:center;">${formatQuantity(b2)}</td>
          <td style="text-align:center;"><span class="actual-box mono">${formatQuantity(a2)}</span></td>
          <td class="mono ${d2 < 0 ? 'text-bad' : (d2 > 0 ? 'text-good' : '')}" style="text-align:center;">${d2Str}</td>
          <td style="font-size:10px; color:#64748b;">${l.notes || ""}</td>
        </tr>
      `;
    } else {
      return `
        <tr class="${rowClass}">
          <td style="text-align:center; font-weight:700; color:#64748b;">${i + 1}</td>
          <td class="mono font-bold" style="text-align:center;">${l.sku || "—"}</td>
          <td style="font-weight:600; color:#1e293b;">${l.productName}</td>
          <td style="text-align:center; color:#64748b; font-size:10px;">${unit}</td>
          <td class="mono" style="text-align:center;">${formatQuantity(b1)}</td>
          <td style="text-align:center;"><span class="actual-box mono">${formatQuantity(a1)}</span></td>
          <td class="mono ${d1 < 0 ? 'text-bad' : (d1 > 0 ? 'text-good' : '')}" style="text-align:center;">${d1Str}</td>
          <td style="font-size:10px; color:#64748b;">${l.notes || ""}</td>
        </tr>
      `;
    }
  }).join("");

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${docTitle} - ${sc.date || ""}</title>
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
        size: ${hasWh2 ? "A4 landscape" : "A4 portrait"};
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
          : '@page { size: ${hasWh2 ? "A4 landscape" : "A4 portrait"}; margin: 8mm 6mm; }';
      }
    }
  </script>
  <style id="dynamic-page-style">
    @page { size: ${hasWh2 ? "A4 landscape" : "A4 portrait"}; margin: 8mm 6mm; }
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
      <h1>${docTitle}</h1>
      <p><strong>مؤسسة ادهام للمواد الغذائية — الإدارة التشغيلية وسلاسل الإمداد</strong></p>
      <p>السجل التجاري: 7054969006 | الرقم الضريبي: 314996148100003 | ينبع الصناعية</p>
    </div>
    <div>
      <span class="doc-badge ${badgeClass}">${badgeText}</span>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item"><div class="meta-label">تاريخ الجرد:</div><div class="meta-val mono">${sc.date || ""}</div></div>
    <div class="meta-item"><div class="meta-label">المستودع الأول (الرئيسي):</div><div class="meta-val">🏢 ${whName1}</div></div>
    ${hasWh2 ? `<div class="meta-item"><div class="meta-label">المستودع الثاني (المقارن):</div><div class="meta-val">🚐 ${whName2}</div></div>` : `<div class="meta-item"><div class="meta-label">المستودع المقارن:</div><div class="meta-val dim">غير محدد</div></div>`}
    <div class="meta-item"><div class="meta-label">إجمالي الأصناف بالكشف:</div><div class="meta-val mono font-bold">${totalItems} صنف</div></div>
  </div>

  <div class="stats-bar">
    <div class="stat-card">
      <div class="stat-val mono">${totalItems}</div>
      <div class="stat-lbl">إجمالي الأصناف</div>
    </div>
    <div class="stat-card good">
      <div class="stat-val mono">${matchedCount}</div>
      <div class="stat-lbl">أصناف متطابقة (0 فرق)</div>
    </div>
    <div class="stat-card ${shortageCount > 0 ? 'bad' : ''}">
      <div class="stat-val mono">${shortageCount}</div>
      <div class="stat-lbl">أصناف بها عجز (نقص)</div>
    </div>
    <div class="stat-card ${surplusCount > 0 ? 'warn' : ''}">
      <div class="stat-val mono">${surplusCount}</div>
      <div class="stat-lbl">أصناف بها فائض (زيادة)</div>
    </div>
  </div>

  <table class="spot-table">
    <thead>
      ${hasWh2 ? `
        <tr>
          <th rowspan="2" style="width:30px; text-align:center;">#</th>
          <th rowspan="2" style="width:75px; text-align:center;">رمز الصنف</th>
          <th rowspan="2" style="text-align:right;">اسم الصنف والوصف</th>
          <th rowspan="2" style="width:55px; text-align:center;">الوحدة</th>
          <th colspan="3" class="col-wh1-group" style="text-align:center;">🏢 ${whName1}</th>
          <th colspan="3" class="col-wh2-group" style="text-align:center;">🚐 ${whName2}</th>
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
      ` : `
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
      ${rowsHtml}
    </tbody>
    <tfoot>
      ${hasWh2 ? `
        <tr>
          <td colspan="4" style="text-align:center;">الإجمالي العام لكافة الكميات</td>
          <td class="mono font-bold" style="text-align:center;">${formatQuantity(totalBook1)}</td>
          <td class="mono font-bold" style="text-align:center;">${formatQuantity(totalActual1)}</td>
          <td class="mono font-bold ${totalDiff1 < 0 ? 'text-bad' : (totalDiff1 > 0 ? 'text-good' : '')}" style="text-align:center;">
            ${totalDiff1 > 0 ? '+' : ''}${formatQuantity(totalDiff1)}
          </td>
          <td class="mono font-bold" style="text-align:center;">${formatQuantity(totalBook2)}</td>
          <td class="mono font-bold" style="text-align:center;">${formatQuantity(totalActual2)}</td>
          <td class="mono font-bold ${totalDiff2 < 0 ? 'text-bad' : (totalDiff2 > 0 ? 'text-good' : '')}" style="text-align:center;">
            ${totalDiff2 > 0 ? '+' : ''}${formatQuantity(totalDiff2)}
          </td>
          <td></td>
        </tr>
      ` : `
        <tr>
          <td colspan="4" style="text-align:center;">الإجمالي العام للكميات</td>
          <td class="mono font-bold" style="text-align:center;">${formatQuantity(totalBook1)}</td>
          <td class="mono font-bold" style="text-align:center;">${formatQuantity(totalActual1)}</td>
          <td class="mono font-bold ${totalDiff1 < 0 ? 'text-bad' : (totalDiff1 > 0 ? 'text-good' : '')}" style="text-align:center;">
            ${totalDiff1 > 0 ? '+' : ''}${formatQuantity(totalDiff1)}
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
    <span>تاريخ ووقت الطباعة: ${printTimestamp}</span>
    <span>إدهام ERP — نظام الرقابة على المخزون وسلاسل الإمداد</span>
    <span>${isDraft ? "مسودة غير معتمدة لأغراض التدقيق الميداني" : "مستند رسمي معتمد"}</span>
  </div>
</body>
</html>`;
}

window._doPrintSpotCount = (sc) => {
  const html = buildSpotCountPrintHTML(sc);
  window.printOpsDocument(html, sc.isDraft ? "مسودة كشف الجرد المفاجئ" : "محضر جرد مخزني معتمد");
};
// ============================================================
// 13. Stock Revaluation Subsystem
// ============================================================

window.saveRevalue = async () => {
  const errEl = document.getElementById("rv-error");
  errEl.classList.add("hidden");
  const whId = document.getElementById("rv-wh").value;
  const prodId = document.getElementById("rv-product").value;
  const oldCost = parseFloat(document.getElementById("rv-old-cost").value) || 0;
  const newCost = parseFloat(document.getElementById("rv-new-cost").value);
  const date = document.getElementById("rv-date").value || todayString();
  const notes = document.getElementById("rv-notes").value.trim();

  if (!whId || !prodId || isNaN(newCost) || newCost < 0 || !notes) {
    errEl.textContent = "يرجى اختيار المخزن والصنف وإدخال التكلفة الجديدة والسبب";
    errEl.classList.remove("hidden");
    return;
  }

  const btn = document.getElementById("save-rv-btn");
  btn.disabled = true;

  try {
    const prod = products.find(p => p.id === prodId);
    const wh = warehouses.find(w => w.id === whId);

    const stockDocId = `${whId}_${prodId}`;
    const invDoc = await getDoc(doc(db, `companies/${COMPANY_ID}/stockByWarehouse`, stockDocId));
    let currentQty = invDoc.exists() ? (parseFloat(invDoc.data().qty) || 0) : 0;
    if (!invDoc.exists()) {
      const isMainWh = wh?.type === "Main" || wh?.name?.includes("رئيس") || wh?.name?.includes("الرئيسي") || wh?.name?.includes("الرئيسى");
      if (isMainWh) {
        currentQty = parseFloat(prod?.stockQty !== undefined ? prod.stockQty : (prod?.totalQty !== undefined ? prod.totalQty : 0)) || 0;
      }
    }
    const diffPerUnit = newCost - oldCost;
    const totalDiff = currentQty * diffPerUnit;

    const rvNum = `RV-${date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const docRef = await create(COLS.inventoryAdjustments(), {
      opType: "revalue",
      revalueNumber: rvNum,
      number: rvNum,
      warehouseId: whId,
      warehouseName: wh?.name || "المستودع",
      productId: prodId,
      productName: prod?.name || "صنف",
      sku: prod?.sku || "",
      oldCost,
      newCost,
      diffPerUnit,
      currentQty,
      totalDiff,
      date,
      notes,
      createdAt: new Date().toISOString()
    });

    await update("products", prodId, { costPrice: newCost });

    const invAcc = allAccounts.find(a => a.code === "1-1-4-1-01") || allAccounts.find(a => a.code === "1-1-4-1") || { id: "INV_STOCK", code: "1-1-4-1-01", name: "مخزون مستودع المواد الغذائية" };
    const revLossAcc = allAccounts.find(a => a.code === "5-2-3") || allAccounts.find(a => a.code === "5-2") || { id: "REVAL_LOSS", code: "5-2-3", name: "خسائر إعادة تقييم المخزون" };

    if (totalDiff !== 0) {
      if (totalDiff < 0) {
        await createJournalEntry({
          date,
          description: `إعادة تقييم مخزون: خفض تكلفة ${prod?.name} - ${notes}`,
          sourceType: "stockRevaluation",
          sourceId: docRef,
          lines: [
            { accountId: revLossAcc.id, accountCode: revLossAcc.code, accountName: revLossAcc.name, debit: Math.abs(totalDiff), credit: 0, note: "خسارة إعادة تقييم" },
            { accountId: invAcc.id,     accountCode: invAcc.code,     accountName: invAcc.name,     debit: 0, credit: Math.abs(totalDiff), note: "تخفيض قيمة المخزون" }
          ]
        });
      } else {
        const revGainAcc = allAccounts.find(a => a.code === "4-2-2") || allAccounts.find(a => a.code === "4-2") || { id: "REVAL_GAIN", code: "4-2-2", name: "أرباح إعادة تقييم المخزون" };
        await createJournalEntry({
          date,
          description: `إعادة تقييم مخزون: زيادة تكلفة ${prod?.name} - ${notes}`,
          sourceType: "stockRevaluation",
          sourceId: docRef,
          lines: [
            { accountId: invAcc.id,     accountCode: invAcc.code,     accountName: invAcc.name,     debit: totalDiff, credit: 0, note: "زيادة قيمة المخزون" },
            { accountId: revGainAcc.id, accountCode: revGainAcc.code, accountName: revGainAcc.name, debit: 0, credit: totalDiff, note: "أرباح تقييم" }
          ]
        });
      }
    }

    showToast("تم تطبيق إعادة التقييم وتحديث تكلفة الصنف بنجاح", "success");
    closeModal("revalue-modal");
    switchOpsSubModule("revalue");
  } catch(err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

function renderRevalueList(area, list) {
  if (!list.length) {
    area.innerHTML = `
      <div class="empty-state" style="padding:60px 20px; text-align:center; color:var(--text-2); background:var(--bg-card); border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:48px; margin-bottom:12px;">💰</div>
        <div style="font-size:16px; font-weight:700;">لا توجد عمليات إعادة تقييم مسجلة</div>
        <p style="font-size:13px; margin-top:6px;">اضغط "+ معاملة جديدة" لتعديل تكلفة صنف بالدفاتر وتسجيل فروق التقييم</p>
      </div>`;
    return;
  }

  area.innerHTML = `
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
            ${list.map(d => {
              const diff = (d.newCost || 0) - (d.oldCost || 0);
              return `
                <tr>
                  <td class="mono font-bold">${d.date || "—"}</td>
                  <td><strong>${d.warehouseName}</strong></td>
                  <td><strong>${d.productName}</strong> <span class="mono dim">(${d.sku})</span></td>
                  <td class="mono">${formatCurrency(d.oldCost || 0)}</td>
                  <td class="mono font-bold">${formatCurrency(d.newCost || 0)}</td>
                  <td class="mono font-bold ${diff < 0 ? 'text-bad' : 'text-good'}">${diff > 0 ? '+' : ''}${formatCurrency(diff)}</td>
                  <td class="mono font-bold ${(d.totalDiff || 0) < 0 ? 'text-bad' : 'text-good'}">${formatCurrency(d.totalDiff || 0)}</td>
                  <td>${d.notes || "—"}</td>
                  <td class="no-print" style="text-align:center;">
                    <button class="btn btn-sm btn-ghost text-secondary" onclick="window.printRevalueDetail('${d.id}')">🖨️ طباعة</button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.printRevalueDetail = async (id) => {
  const d = activeListCache.find(x => x.id === id);
  if (!d) return;

  const diff = (d.newCost || 0) - (d.oldCost || 0);
  const metaHtml = `
    <div class="meta-item"><div class="meta-label">رقم سند إعادة التقييم:</div><div class="meta-val mono font-bold text-primary">${d.revalueNumber || id}</div></div>
    <div class="meta-item"><div class="meta-label">تاريخ العملية:</div><div class="meta-val mono">${d.date}</div></div>
    <div class="meta-item"><div class="meta-label">المستودع:</div><div class="meta-val"><strong>${d.warehouseName}</strong></div></div>
    <div class="meta-item"><div class="meta-label">الصنف المعاد تقييمه:</div><div class="meta-val"><strong>${d.productName} (${d.sku})</strong></div></div>
    <div class="meta-item"><div class="meta-label">التكلفة السابقة:</div><div class="meta-val mono">${formatCurrency(d.oldCost || 0)}</div></div>
    <div class="meta-item"><div class="meta-label">التكلفة الجديدة المعتمدة:</div><div class="meta-val mono font-bold">${formatCurrency(d.newCost || 0)}</div></div>
  `;

  const contentHtml = `
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
          <td><strong>${d.productName}</strong> <span class="mono">(${d.sku})</span></td>
          <td class="mono font-bold" style="text-align:center;">${formatQuantity(d.currentQty || 0)}</td>
          <td class="mono" style="text-align:left;">${formatCurrency(d.oldCost || 0)}</td>
          <td class="mono font-bold" style="text-align:left;">${formatCurrency(d.newCost || 0)}</td>
          <td class="mono font-bold" style="text-align:left; color:${diff < 0 ? '#dc2626' : '#16a34a'};">${diff > 0 ? '+' : ''}${formatCurrency(diff)}</td>
          <td class="mono font-bold" style="text-align:left; color:${(d.totalDiff || 0) < 0 ? '#dc2626' : '#16a34a'};">${formatCurrency(d.totalDiff || 0)}</td>
        </tr>
      </tbody>
    </table>
  `;

  const signaturesHtml = `
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
  `;

  const html = wrapOpsPrintLayout({
    title: `سند إعادة تقييم مخزون رسمي #${d.revalueNumber || id}`,
    docBadge: `<span class="doc-badge good">سند إعادة تقييم مالي</span>`,
    metaHtml,
    contentHtml,
    signaturesHtml,
    footerNotes: d.notes || "تم تعديل تكلفة الصنف بالدفاتر وتسجيل القيد المحاسبي لفارق التقييم."
  });

  window.printOpsDocument(html, `RV-${d.revalueNumber || id}`);
};

