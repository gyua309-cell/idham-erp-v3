// ============================================================
// IDHAM ERP — Customer Account Opening / Update Agreement Module
// اتفاقية فتح / تحديث حساب عميل — نموذج رسمي وقانوني متكامل ومعتمد
// ============================================================

import { getById, getAll, update, COLS } from "../utils/db.js";
import { formatCurrency, todayString } from "../utils/formatters.js";
import { printMasterCustomerAgreement } from "./agreement-print-template.js?v=4.3";

const showToast = (...a) => (window.showToast ? window.showToast(...a) : console.log(...a));

/**
 * دالة مساعدة لحساب التاريخ الهجري التقريبي أو الحالي
 */
function getHijriDate(dateObj = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    return formatter.format(dateObj).replace(/هـ/g, '').trim();
  } catch {
    return "1448";
  }
}

/**
 * جلب إعدادات المنشأة والشعار الرسمي من التخزين المحلي أو Firestore
 */
async function loadCompanySettingsAndLogo() {
  const co = {
    name: "شركة نظم الإمداد المتطورة",
    subNameAr: "تجارة وتوريد المواد الغذائية بالجملة",
    nameEn: "Advanced Supply Systems Co.",
    subNameEn: "Food Wholesale Supply",
    cityAr: "ينبع - المملكة العربية السعودية",
    cityEn: "Yanbu - Kingdom of Saudi Arabia",
    phone: "0549141648",
    email: "Nuzmalamdad@gmail.com",
    web: "www.supplysa.com",
    crNumber: "7054969006",
    vatNumber: "314996148100003",
    district: "حي غرناطة",
    logoUrl: ""
  };

  try {
    const cached = JSON.parse(localStorage.getItem("idham_company") || "{}");
    if (cached.logoBase64) co.logoUrl = cached.logoBase64;
    if (cached.name) co.name = cached.name;
    if (cached.nameEn) co.nameEn = cached.nameEn;
    if (cached.phone) co.phone = cached.phone;
    if (cached.email) co.email = cached.email;
    if (cached.crNumber || cached.cr) co.crNumber = cached.crNumber || cached.cr;
    if (cached.vatNumber) co.vatNumber = cached.vatNumber;
    if (cached.district) co.district = cached.district;
  } catch (_) {}

  // إذا لم يكن الشعار متوفراً في التخزين المؤقت، جلبه مباشرة من إعدادات الشركة بـ Firestore
  if (!co.logoUrl) {
    try {
      const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
      const { db, COMPANY_ID } = await import("../firebase-config.js");
      const [logoSnap, compSnap] = await Promise.all([
        getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "logo")),
        getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company"))
      ]);
      if (logoSnap.exists() && logoSnap.data().dataUrl) {
        co.logoUrl = logoSnap.data().dataUrl;
        try {
          const cached = JSON.parse(localStorage.getItem("idham_company") || "{}");
          cached.logoBase64 = co.logoUrl;
          localStorage.setItem("idham_company", JSON.stringify(cached));
        } catch (_) {}
      }
      if (compSnap.exists()) {
        const cd = compSnap.data();
        if (cd.name) co.name = cd.name;
        if (cd.nameEn) co.nameEn = cd.nameEn;
        if (cd.phone) co.phone = cd.phone;
        if (cd.email) co.email = cd.email;
        if (cd.crNumber || cd.cr) co.crNumber = cd.crNumber || cd.cr;
        if (cd.vatNumber) co.vatNumber = cd.vatNumber;
        if (cd.district) co.district = cd.district;
      }
    } catch (err) {
      console.warn("Could not fetch company logo from settings:", err);
    }
  }

  window._agreementCompanyInfo = co;
  return co;
}

/**
 * فتح نافذة إعداد وطباعة اتفاقية العميل
 * @param {string|object} customerIdOrObj 
 * @param {boolean} isBlank 
 */
export async function openCustomerAgreementModal(customerIdOrObj, isBlank = false) {
  let cust = null;

  // جلب إعدادات الشركة والشعار في الخلفية لضمان سرعة الطباعة
  loadCompanySettingsAndLogo().catch(() => {});

  // جلب كافة العملاء لتفعيل الربط والاختيار التلقائي السريع
  let allCustomers = [];
  try {
    allCustomers = await getAll("customers");
    allCustomers.sort((a, b) => (a.name || "").localeCompare(b.name || "", "ar"));
  } catch (err) {
    console.warn("Could not preload customers list:", err);
  }
  window._agreementCustomersList = allCustomers;

  if (isBlank) {
    cust = {
      id: "",
      name: "",
      code: "",
      crNumber: "",
      crDate: "",
      crSource: "",
      vatNumber: "",
      phone: "",
      mobile: "",
      email: "",
      city: "ينبع",
      district: "",
      street: "",
      postalCode: "",
      legalForm: "مؤسسة فردية",
      activityType: "تجارة وتوريد مواد غذائية",
      branchCount: "1",
      fax: "",
      poBox: "",
      ownerName: "",
      ownerId: "",
      ownerIdDate: "",
      ownerIdSource: "",
      ownerPhone: "",
      ownerAddress: "",
      ownerEmail: "",
      managerName: "",
      managerId: "",
      managerIdDate: "",
      managerIdSource: "",
      managerPhone: "",
      managerEmail: "",
      creditLimit: 0,
      creditDays: 30,
      repName: "",
      requestType: "open"
    };
  } else if (typeof customerIdOrObj === "object" && customerIdOrObj !== null) {
    cust = customerIdOrObj;
  } else if (typeof customerIdOrObj === "string") {
    try {
      cust = await getById("customers", customerIdOrObj);
    } catch (e) {
      console.warn("Failed to fetch customer by ID:", e);
    }
  }

  // إذا لم يتم تمرير عميل أو تعذر إيجاده
  if (!cust) {
    cust = {
      id: "",
      name: "",
      code: "",
      crNumber: "",
      crDate: "",
      crSource: "",
      vatNumber: "",
      phone: "",
      mobile: "",
      email: "",
      city: "ينبع",
      district: "",
      street: "",
      postalCode: "",
      legalForm: "مؤسسة فردية",
      activityType: "تجارة وتوريد مواد غذائية",
      branchCount: "1",
      fax: "",
      poBox: "",
      ownerName: "",
      ownerId: "",
      ownerIdDate: "",
      ownerIdSource: "",
      ownerPhone: "",
      ownerAddress: "",
      ownerEmail: "",
      managerName: "",
      managerId: "",
      managerIdDate: "",
      managerIdSource: "",
      managerPhone: "",
      managerEmail: "",
      creditLimit: 0,
      creditDays: 30,
      repName: "",
      requestType: "open"
    };
  }

  // إزالة أي نافذة مفتوحة مسبقاً
  const existing = document.getElementById("cust-agreement-modal-overlay");
  if (existing) existing.remove();

  window._currentAgreementSignatureUrl = cust.signatureDataUrl || "";
  window._currentAgreementAttachments = Array.isArray(cust.attachments) ? cust.attachments : [];

  const today = todayString();

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "cust-agreement-modal-overlay";
  overlay.style.zIndex = "9999";

  const customerOptionsHtml = allCustomers.map(c => {
    const isSelected = cust.id && cust.id === c.id ? "selected" : "";
    const codePart = c.code ? `[كود: ${c.code}]` : "";
    const crPart = (c.crNumber || c.nationalId) ? `[س.ت: ${c.crNumber || c.nationalId}]` : "";
    const phonePart = (c.mobile || c.phone) ? `[📱 ${c.mobile || c.phone}]` : "";
    return `<option value="${c.id}" ${isSelected} data-name="${(c.name || '').toLowerCase()}" data-code="${(c.code || '').toLowerCase()}" data-cr="${(c.crNumber || c.nationalId || '')}" data-phone="${(c.mobile || c.phone || '')}">
      ${c.name} ${codePart} ${phonePart} ${crPart}
    </option>`;
  }).join("");

  overlay.innerHTML = `
    <div class="modal" style="max-width:960px; width:95%; max-height:94vh; display:flex; flex-direction:column; border-radius:18px; overflow:hidden; background:var(--bg-1); box-shadow:0 20px 60px rgba(0,0,0,0.35);">
      <!-- Header -->
      <div class="modal-header" style="background:linear-gradient(135deg, #004d80 0%, #006699 60%, #0284c7 100%); color:#fff; padding:16px 24px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="background:rgba(255,255,255,0.18); width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:24px; backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.25);">
            📑
          </div>
          <div>
            <h3 style="margin:0; font-size:17.5px; font-weight:900; color:#fff; letter-spacing:-0.3px;">اتفاقية فتح / تحديث حساب عميل</h3>
            <p id="ag-modal-subtitle" style="margin:2px 0 0; font-size:12px; color:rgba(255,255,255,0.88);">
              ${cust.id ? `النموذج الرسمي المعتمد للعميل: <strong style="color:#fef08a;">${cust.name || "—"}</strong>` : "طباعة النموذج الرسمي المعتمد فارغاً أو اختيار عميل مسجل"}
            </p>
          </div>
        </div>
        <button class="modal-close" style="color:#fff; font-size:24px; opacity:0.9;" onclick="document.getElementById('cust-agreement-modal-overlay').remove()">×</button>
      </div>

      <!-- Body -->
      <div class="modal-body" style="flex:1; overflow-y:auto; padding:20px 24px; background:var(--bg-2);">
        <input type="hidden" id="ag-cust-id" value="${cust.id || ""}" />

        <!-- بطاقة اختيار وربط عميل مسجل (ميزة التعبئة التلقائية الفورية) -->
        <div class="card" style="padding:14px 18px; margin-bottom:14px; border-radius:14px; background:linear-gradient(135deg, rgba(0,77,128,0.06), rgba(2,132,199,0.08)); border:1.8px solid #0284c7; box-shadow:0 3px 12px rgba(2,132,199,0.1);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:19px;">🤝</span>
              <span style="font-weight:900; font-size:13.5px; color:#004d80;">ربط الاتفاقية بعميل مسجل وتعبئة البيانات تلقائياً:</span>
            </div>
            <div style="display:flex; gap:8px;">
              <button type="button" class="btn btn-secondary sm" onclick="window.clearAgreementCustomerSelection()" title="تفريغ الحقول لطلب فتح حساب جديد أو تعبئة يدوية" style="font-size:11.5px; font-weight:800; padding:5px 12px; background:#fff; border-color:#cbd5e1; color:#475569;">
                🔄 تفريغ النموذج (حساب جديد)
              </button>
            </div>
          </div>
          
          <div style="display:grid; grid-template-columns:1.3fr 2fr; gap:10px; align-items:center;">
            <div>
              <input type="text" id="ag-search-customer-input" class="input font-bold" placeholder="🔍 فلترة سريعة بالاسم، الكود، الجوال، أو السجل..." style="font-size:12px; height:38px; background:#fff; border-color:#0284c7; border-radius:9px;" oninput="window.filterAgreementCustomerOptions(this.value)" />
            </div>
            <div>
              <select id="ag-customer-selector" class="input font-bold" style="font-size:12.5px; height:38px; background:#fff; border-color:#0284c7; border-radius:9px; color:#004d80;" onchange="window.onAgreementCustomerSelected(this.value)">
                <option value="">-- اختر عميلاً للتعبئة التلقائية (${allCustomers.length} عميل مسجل) --</option>
                ${customerOptionsHtml}
              </select>
            </div>
          </div>

          <!-- شريط معلومات العميل المختار -->
          <div id="ag-customer-info-badge" style="display:${cust.id ? 'flex' : 'none'}; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-top:12px; padding:8px 14px; background:#fff; border-radius:10px; border:1px solid rgba(2,132,199,0.35); font-size:11.5px; color:#004d80;">
            <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
              <span>🏢 <strong>${cust.name || "—"}</strong></span>
              <span>🏷️ الكود: <strong>${cust.code || "—"}</strong></span>
              <span>💳 الرصيد الحالي: <strong style="color:${(cust.balance || 0) > 0 ? '#dc2626' : '#16a34a'};">${formatCurrency(cust.balance || 0)}</strong></span>
              <span>🛡️ حد الائتمان: <strong>${formatCurrency(cust.creditLimit || 0)}</strong></span>
              <span>⏱️ الأيام: <strong>${cust.creditDays || 30} يوم</strong></span>
            </div>
            <div style="font-size:11px; color:#0284c7; font-weight:800;">
              ✓ تم جلب البيانات تلقائياً
            </div>
          </div>

          <!-- زر ومعلومات المرفقات القانونية (KYC) -->
          <div id="ag-attachments-badge" style="display:${(cust.attachments && cust.attachments.length > 0) ? 'flex' : 'none'}; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-top:10px; padding:8px 14px; background:#eff6ff; border-radius:10px; border:1px solid #bae6fd; font-size:12px; color:#0369a1;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:18px;">📂</span>
              <span>يتوفر لهذا العميل عدد <strong id="ag-attachments-count" style="color:#0284c7;">${(cust.attachments || []).length}</strong> مستندات رسمية مرفوعة (KYC)</span>
            </div>
            <button type="button" class="btn btn-sm btn-primary" onclick="window.openCustomerAttachmentsModal(document.getElementById('ag-cust-id').value)" style="background:#0284c7; font-weight:800; font-size:11.5px; padding:4px 12px; border-radius:6px; cursor:pointer;">
              📁 عرض وفحص المستندات الرسمية
            </button>
          </div>
        </div>

        <!-- خيارات ونوع المعاملة والتاريخ -->
        <div class="card" style="padding:14px 18px; margin-bottom:14px; border-radius:14px; background:var(--bg-card); border:1.5px solid rgba(2,132,199,0.25);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
            <div style="display:flex; align-items:center; gap:18px;">
              <span style="font-weight:900; font-size:13px; color:#004d80;">نوع الطلب:</span>
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:13px; font-weight:800; color:var(--text-0);">
                <input type="radio" name="ag-request-type" id="ag-type-open" value="open" ${cust.id ? "" : "checked"} style="width:16px;height:16px;" />
                <span>طلب فتح حساب جديد</span>
              </label>
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:13px; font-weight:800; color:var(--text-0);">
                <input type="radio" name="ag-request-type" id="ag-type-update" value="update" ${cust.id ? "checked" : ""} style="width:16px;height:16px;" />
                <span>طلب تحديث حساب قائم</span>
              </label>
            </div>

            <div style="display:flex; gap:10px; align-items:center;">
              <div class="form-group" style="margin:0;">
                <label style="font-size:11px; font-weight:800; color:#004d80;">تاريخ الطلب (ميلادي)</label>
                <input type="date" id="ag-date-greg" class="input mono font-bold" value="${today}" style="padding:5px 10px; height:34px; border-radius:8px;" />
              </div>
            </div>
          </div>
        </div>

        <!-- أولاً: بيانات المنشأة -->
        <div class="card" style="padding:16px 18px; margin-bottom:14px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft);">
          <div style="font-size:13.5px; font-weight:900; color:#004d80; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
            <span style="background:#004d80; color:#fff; width:24px; height:24px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; font-size:12px;">١</span>
            <span>بيانات المنشأة التجارية</span>
          </div>

          <div style="display:grid; grid-template-columns:2fr 1.2fr 1fr 1fr; gap:12px; margin-bottom:12px;">
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">الاسم التجاري للمنشأة *</label>
              <input type="text" id="ag-name" class="input font-bold" value="${cust.name || ""}" placeholder="اسم المحل / المؤسسة" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">رقم السجل التجاري</label>
              <input type="text" id="ag-cr" class="input mono font-bold" value="${cust.crNumber || cust.nationalId || ""}" placeholder="1010XXXXXX" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">تاريخ السجل</label>
              <input type="text" id="ag-cr-date" class="input mono" value="${cust.crDate || ""}" placeholder="1445/01/01" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">مصدر السجل</label>
              <input type="text" id="ag-cr-source" class="input" value="${cust.crSource || cust.city || "ينبع"}" placeholder="ينبع / الرياض" />
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1.5fr 1fr; gap:12px; margin-bottom:12px;">
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">المدينة</label>
              <input type="text" id="ag-city" class="input" value="${cust.city || "ينبع"}" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">الحي</label>
              <input type="text" id="ag-district" class="input" value="${cust.district || ""}" placeholder="اسم الحي" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">الشارع</label>
              <input type="text" id="ag-street" class="input" value="${cust.street || ""}" placeholder="اسم الشارع الرئيسي" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">الرمز البريدي</label>
              <input type="text" id="ag-postal" class="input mono" value="${cust.postalCode || ""}" placeholder="12345" />
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1.2fr 1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">الشكل القانوني</label>
              <select id="ag-legal-form" class="input">
                <option value="مؤسسة فردية" ${cust.legalForm === "مؤسسة فردية" ? "selected" : ""}>مؤسسة فردية</option>
                <option value="شركة ذات مسؤولية محدودة" ${cust.legalForm === "شركة ذات مسؤولية محدودة" ? "selected" : ""}>شركة ذات مسؤولية محدودة</option>
                <option value="شركة مساهمة مبسطة" ${cust.legalForm === "شركة مساهمة مبسطة" ? "selected" : ""}>شركة مساهمة مبسطة</option>
                <option value="شركة تضامنية" ${cust.legalForm === "شركة تضامنية" ? "selected" : ""}>شركة تضامنية</option>
              </select>
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">نوع النشاط</label>
              <input type="text" id="ag-activity" class="input" value="${cust.activityType || "تجارة المواد الغذائية والتموينات"}" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">هاتف المنشأة</label>
              <input type="tel" id="ag-phone" class="input mono" value="${cust.phone || ""}" placeholder="014XXXXXXX" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">رقم الجوال *</label>
              <input type="tel" id="ag-mobile" class="input mono font-bold" value="${cust.mobile || cust.phone || ""}" placeholder="05XXXXXXXX" />
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr; gap:12px;">
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">البريد الإلكتروني للمنشأة</label>
              <input type="email" id="ag-email" class="input mono" value="${cust.email || ""}" placeholder="store@example.com" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">الرقم الضريبي (VAT)</label>
              <input type="text" id="ag-vat" class="input mono font-bold" value="${cust.vatNumber || ""}" placeholder="300XXXXXXXXXXXX" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">عدد الفروع</label>
              <input type="number" id="ag-branches" class="input mono" value="${cust.branchCount || "1"}" min="1" />
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">صندوق البريد</label>
              <input type="text" id="ag-pobox" class="input mono" value="${cust.poBox || ""}" placeholder="ص.ب 1234" />
            </div>
          </div>
        </div>

        <!-- ثانياً: بيانات مالك المنشأة والمسؤول المفوض -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px;">
          <!-- مالك المنشأة -->
          <div class="card" style="padding:16px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft);">
            <div style="font-size:13px; font-weight:900; color:#004d80; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
              <span style="background:#004d80; color:#fff; width:22px; height:22px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; font-size:11px;">٢</span>
              <span>بيانات مالك المنشأة (الكفيل الغارم)</span>
            </div>

            <div class="form-group mb-8">
              <label style="font-size:11px; font-weight:800;">اسم المالك رباعياً *</label>
              <input type="text" id="ag-owner-name" class="input font-bold" value="${cust.ownerName || cust.name || ""}" placeholder="الاسم الكامل كما في الهوية" />
            </div>
            <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:8px; margin-bottom:8px;">
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">رقم الهوية الوطنية</label>
                <input type="text" id="ag-owner-id" class="input mono font-bold" value="${cust.ownerId || cust.nationalId || ""}" placeholder="10XXXXXXXX" />
              </div>
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">تاريخها ومصدرها</label>
                <input type="text" id="ag-owner-id-source" class="input" value="${cust.ownerIdSource || "ينبع"}" placeholder="أحوال ينبع" />
              </div>
            </div>
            <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:8px; margin-bottom:8px;">
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">رقم جوال المالك</label>
                <input type="tel" id="ag-owner-phone" class="input mono font-bold" value="${cust.ownerPhone || cust.mobile || cust.phone || ""}" placeholder="05XXXXXXXX" />
              </div>
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">البريد الإلكتروني</label>
                <input type="email" id="ag-owner-email" class="input mono" value="${cust.ownerEmail || cust.email || ""}" placeholder="owner@..." />
              </div>
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">عنوان المالك (العنوان الوطني)</label>
              <input type="text" id="ag-owner-address" class="input" value="${cust.ownerAddress || cust.address || (cust.city ? (cust.city + (cust.district ? " - " + cust.district : "")) : "")}" placeholder="المدينة، الحي، رقم المبنى" />
            </div>
          </div>

          <!-- المدير المسؤول -->
          <div class="card" style="padding:16px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft);">
            <div style="font-size:13px; font-weight:900; color:#004d80; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
              <span style="background:#004d80; color:#fff; width:22px; height:22px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; font-size:11px;">٣</span>
              <span>بيانات المسؤول المفوض (إذا كان غير المالك)</span>
            </div>

            <div class="form-group mb-8">
              <label style="font-size:11px; font-weight:800;">اسم المسؤول رباعياً</label>
              <input type="text" id="ag-mgr-name" class="input" value="${cust.managerName || ""}" placeholder="اسم المدير / المشرف المفوض" />
            </div>
            <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:8px; margin-bottom:8px;">
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">رقم الهوية / الإقامة</label>
                <input type="text" id="ag-mgr-id" class="input mono" value="${cust.managerId || ""}" placeholder="2XXXXXXXXX" />
              </div>
              <div class="form-group">
                <label style="font-size:11px; font-weight:800;">رقم الجوال</label>
                <input type="tel" id="ag-mgr-phone" class="input mono" value="${cust.managerPhone || ""}" placeholder="05XXXXXXXX" />
              </div>
            </div>
            <div class="form-group">
              <label style="font-size:11px; font-weight:800;">البريد الإلكتروني للمسؤول</label>
              <input type="email" id="ag-mgr-email" class="input mono" value="${cust.managerEmail || ""}" placeholder="manager@..." />
            </div>
            <div style="margin-top:14px; padding:8px 10px; background:rgba(2,132,199,0.06); border-radius:8px; font-size:11px; color:#004d80;">
              ℹ️ يلزم إرفاق صورة الوكالة الشرعية أو التفويض الرسمي وتصديق الغرفة التجارية في حال كان المسؤول غير المالك.
            </div>
          </div>
        </div>

        <!-- رابعاً: شروط الائتمان والاعتماد الرسمي -->
        <div class="card" style="padding:16px 18px; margin-bottom:14px; border-radius:14px; background:linear-gradient(135deg, rgba(0,77,128,0.06), rgba(2,132,199,0.04)); border:1.5px solid rgba(2,132,199,0.3);">
          <div style="font-size:13.5px; font-weight:900; color:#004d80; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
            <span style="background:#004d80; color:#fff; width:24px; height:24px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; font-size:12px;">٤</span>
            <span>شروط التسهيل الائتماني والاعتمادات الرسمية</span>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1.5fr; gap:14px;">
            <div class="form-group">
              <label style="font-size:11.5px; font-weight:800; color:#004d80;">مبلغ الائتمان المعتمد (ريال سعودي) *</label>
              <input type="number" id="ag-credit-limit" class="input mono font-bold" style="font-size:16px; color:#004d80; border-color:#0284c7; background:#fff;" value="${cust.creditLimit || 0}" step="500" min="0" />
            </div>
            <div class="form-group">
              <label style="font-size:11.5px; font-weight:800; color:#004d80;">فترة الائتمان المسموح بها (بالأيام) *</label>
              <input type="number" id="ag-credit-days" class="input mono font-bold" style="font-size:16px; color:#004d80; border-color:#0284c7; background:#fff;" value="${cust.creditDays || 30}" min="0" />
              <div style="display:flex; gap:4px; margin-top:5px; flex-wrap:wrap;">
                <button type="button" class="btn btn-sm" onclick="document.getElementById('ag-credit-days').value=7" style="padding:2px 7px; font-size:11px; background:#f1f5f9;">7 أيام</button>
                <button type="button" class="btn btn-sm" onclick="document.getElementById('ag-credit-days').value=15" style="padding:2px 7px; font-size:11px; background:#f1f5f9;">15 يوماً</button>
                <button type="button" class="btn btn-sm" onclick="document.getElementById('ag-credit-days').value=20" style="padding:2px 7px; font-size:11px; background:#e0f2fe; color:#0369a1; font-weight:800; border:1px solid #7dd3fc;">20 يوماً</button>
                <button type="button" class="btn btn-sm" onclick="document.getElementById('ag-credit-days').value=30" style="padding:2px 7px; font-size:11px; background:#f1f5f9;">30 يوماً</button>
                <button type="button" class="btn btn-sm" onclick="document.getElementById('ag-credit-days').value=45" style="padding:2px 7px; font-size:11px; background:#f1f5f9;">45 يوماً</button>
              </div>
            </div>
            <div class="form-group">
              <label style="font-size:11.5px; font-weight:800; color:var(--text-1);">مدير المبيعات</label>
              <input type="text" id="ag-rep-name" class="input font-bold" value="${cust.repName || ""}" placeholder="اسم مدير المبيعات" />
            </div>
          </div>
        </div>

        <!-- خامساً: الشروط والالتزامات القانونية المعتمدة (معاينة بنود الحماية والتحصيل) -->
        <div class="card" style="padding:14px 18px; margin-bottom:14px; border-radius:14px; background:var(--bg-card); border:1.5px solid #0284c7;">
          <div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="window.toggleAgreementLegalClauses()">
            <div style="font-size:13px; font-weight:900; color:#004d80; display:flex; align-items:center; gap:8px;">
              <span style="background:#004d80; color:#fff; width:22px; height:22px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; font-size:11px;">⚖️</span>
              <span>البنود والالتزامات القانونية المعتمدة (8 بنود نظامية لحماية الشركة والتحصيل)</span>
            </div>
            <span id="ag-legal-toggle-icon" style="font-size:13px; color:#0284c7; font-weight:900;">▼ عرض البنود القانونية</span>
          </div>
          
          <div id="ag-legal-clauses-content" style="display:none; margin-top:14px; border-top:1px solid rgba(2,132,199,0.2); padding-top:12px; font-size:12px; line-height:1.6; color:var(--text-0);">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div style="background:rgba(2,132,199,0.05); padding:10px 12px; border-radius:10px; border-right:3px solid #004d80;">
                <strong style="color:#004d80;">١. صحة الأهلية وسريان السجل:</strong> إقرار بكامل الأهلية وصحة وسريان السجل التجاري والتراخيص، والتعهد بإخطار الشركة كتابياً بأي تعديل خلال 3 أيام عمل.
              </div>
              <div style="background:rgba(2,132,199,0.05); padding:10px 12px; border-radius:10px; border-right:3px solid #004d80;">
                <strong style="color:#004d80;">٢. سداد الفواتير وحجية القيود:</strong> التزام بالسداد بالأجل المحدد، وتعتبر كشوف الحساب والفواتير الإلكترونية الصادرة بينة قاطعة ومثبتة للمديونية وفق نظام الإثبات.
              </div>
              <div style="background:rgba(2,132,199,0.05); padding:10px 12px; border-radius:10px; border-right:3px solid #004d80;">
                <strong style="color:#004d80;">٣. حجية الفواتير وسندات التسليم:</strong> الفواتير الإلكترونية (ZATCA) وسندات التسليم الموقعة من العميل أو عماله بالموقع حجة باتة على الاستلام وسلامة البضائع.
              </div>
              <div style="background:rgba(2,132,199,0.05); padding:10px 12px; border-radius:10px; border-right:3px solid #004d80;">
                <strong style="color:#004d80;">٤. سقوط الآجال وحلول المديونية:</strong> تسقط جميع الآجال وتستحق كامل المديونية فوراً عند تأخر أي فاتورة، أو بيع المنشأة أو إشهار الإفلاس أو الحجز.
              </div>
              <div style="background:rgba(2,132,199,0.05); padding:10px 12px; border-radius:10px; border-right:3px solid #004d80;">
                <strong style="color:#004d80;">٥. فحص البضائع ومسؤولية التخزين:</strong> فحص البضائع فوراً وسقوط حق الاعتراض بعد 24 ساعة، وتحمل مسؤولية التخزين دون رجوع على الشركة لكون المواد سريعة التلف.
              </div>
              <div style="background:rgba(2,132,199,0.05); padding:10px 12px; border-radius:10px; border-right:3px solid #004d80;">
                <strong style="color:#004d80;">٦. إسقاط الخصومات عند التأخير:</strong> التأخر في السداد يسقط تلقائياً كافة الخصومات والتسهيلات والعروض الممنوحة، وتستحق الفواتير بقيمتها الأصلية دون خصم.
              </div>
              <div style="background:rgba(2,132,199,0.05); padding:10px 12px; border-radius:10px; border-right:3px solid #004d80;">
                <strong style="color:#004d80;">٧. الضمان التنفيذي والكفالة الغارمة:</strong> إصدار سند لأمر عبر منصة نافذ، واعتبار الموقع كفيلاً غارماً متضامناً بصفته الشخصية مع إسقاط الدفع بالتجريد.
              </div>
              <div style="background:rgba(2,132,199,0.05); padding:10px 12px; border-radius:10px; border-right:3px solid #004d80;">
                <strong style="color:#004d80;">٨. الموطن المختار والاختصاص القضائي:</strong> العناوين الموضحة موطن رسمي للتبليغات، وينعقد الاختصاص لمحاكم ينبع التجارية مع تحمل أتعاب المحاماة والتحصيل.
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer Actions -->
      <div class="modal-footer" style="padding:14px 24px; background:var(--bg-card); border-top:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <button class="btn btn-secondary" onclick="document.getElementById('cust-agreement-modal-overlay').remove()">إغلاق</button>
        
        <div style="display:flex; gap:10px; align-items:center;">
          <button id="ag-save-cust-btn" class="btn btn-secondary font-bold" onclick="window.saveAgreementDataOnly()" title="حفظ البيانات المدخلة في ملف العميل مباشرة" style="display:${cust.id ? 'inline-flex' : 'none'};">
            💾 حفظ في ملف العميل
          </button>
          <button id="ag-issue-note-btn" class="btn btn-secondary font-bold" style="display:${cust.id ? 'inline-flex' : 'none'}; background:rgba(124,58,237,0.1); color:#7C3AED; border-color:rgba(124,58,237,0.3);" onclick="window.issuePromissoryNoteFromAgreement('${cust.id || ""}', '${(cust.name||"").replace(/'/g, "\\'")}')" title="الانتقال لإصدار سند لأمر نافذ">
            📜 إصدار سند لأمر
          </button>
          <button class="btn btn-primary" onclick="window.generateAndPrintCustomerAgreement()" style="padding:10px 26px; font-weight:900; font-size:13.5px; background:linear-gradient(135deg, #004d80, #006699, #0284c7); box-shadow:0 4px 16px rgba(2,132,199,0.35);">
            🖨️ طباعة الاتفاقية الرسمية (صفحة واحدة)
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

/**
 * تبديل إظهار / إخفاء البنود القانونية في الواجهة
 */
window.toggleAgreementLegalClauses = () => {
  const content = document.getElementById("ag-legal-clauses-content");
  const icon = document.getElementById("ag-legal-toggle-icon");
  if (!content) return;
  const isHidden = content.style.display === "none";
  content.style.display = isHidden ? "block" : "none";
  if (icon) icon.textContent = isHidden ? "▲ إخفاء البنود القانونية" : "▼ عرض البنود القانونية";
};

/**
 * فلترة قائمة العملاء في مربع الاختيار بالبحث الفوري
 */
window.filterAgreementCustomerOptions = (query) => {
  const q = (query || "").trim().toLowerCase();
  const select = document.getElementById("ag-customer-selector");
  if (!select) return;

  const options = Array.from(select.options);
  let visibleCount = 0;

  for (let i = 1; i < options.length; i++) {
    const opt = options[i];
    const name = opt.getAttribute("data-name") || "";
    const code = opt.getAttribute("data-code") || "";
    const cr = opt.getAttribute("data-cr") || "";
    const phone = opt.getAttribute("data-phone") || "";

    const match = !q || name.includes(q) || code.includes(q) || cr.includes(q) || phone.includes(q);
    opt.style.display = match ? "" : "none";
    if (match) visibleCount++;
  }

  // إذا تم العثور على خيار واحد فقط وضغط المستخدم، يمكن تحديده
  if (visibleCount === 1 && q.length >= 3) {
    const matched = options.find((opt, idx) => idx > 0 && opt.style.display !== "none");
    if (matched && select.value !== matched.value) {
      select.value = matched.value;
      window.onAgreementCustomerSelected(matched.value);
    }
  }
};

/**
 * عند اختيار عميل مسجل من القائمة المنسدلة: تعبئة تلقائية فورية لكافة الحقول
 */
window.onAgreementCustomerSelected = (customerId) => {
  if (!customerId) {
    window.clearAgreementCustomerSelection();
    return;
  }

  const cust = (window._agreementCustomersList || []).find(c => c.id === customerId);
  if (!cust) return;

  // تعيين معرّف العميل المخفي
  const custIdEl = document.getElementById("ag-cust-id");
  if (custIdEl) custIdEl.value = cust.id;

  // تحويل نوع الطلب تلقائياً إلى "طلب تحديث حساب قائم"
  const typeUpdateRadio = document.getElementById("ag-type-update");
  if (typeUpdateRadio) typeUpdateRadio.checked = true;

  // تحديث العنوان الفرعي
  const subTitleEl = document.getElementById("ag-modal-subtitle");
  if (subTitleEl) {
    subTitleEl.innerHTML = `النموذج الرسمي المعتمد للعميل: <strong style="color:#fef08a;">${cust.name || "—"}</strong> (كود: ${cust.code || "—"})`;
  }

  // تعبئة بيانات المنشأة
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val ?? "";
  };

  setVal("ag-name", cust.name || "");
  setVal("ag-cr", cust.crNumber || cust.nationalId || "");
  setVal("ag-cr-date", cust.crDate || "");
  setVal("ag-cr-source", cust.crSource || cust.city || "ينبع");
  setVal("ag-city", cust.city || "ينبع");
  setVal("ag-district", cust.district || "");
  setVal("ag-street", cust.street || "");
  setVal("ag-postal", cust.postalCode || cust.zip || "");
  setVal("ag-legal-form", cust.legalForm || "مؤسسة فردية");
  setVal("ag-activity", cust.activityType || "تجارة المواد الغذائية والتموينات");
  setVal("ag-phone", cust.phone || "");
  setVal("ag-mobile", cust.mobile || cust.phone || "");
  setVal("ag-email", cust.email || "");
  setVal("ag-vat", cust.vatNumber || cust.vat || "");
  setVal("ag-branches", cust.branchCount || "1");
  setVal("ag-pobox", cust.poBox || "");

  // تعبئة بيانات المالك
  setVal("ag-owner-name", cust.ownerName || cust.name || "");
  setVal("ag-owner-id", cust.ownerId || cust.nationalId || "");
  setVal("ag-owner-id-source", cust.ownerIdSource || "ينبع");
  setVal("ag-owner-phone", cust.ownerPhone || cust.mobile || cust.phone || "");
  setVal("ag-owner-email", cust.ownerEmail || cust.email || "");
  
  // العنوان الوطني للمالك
  const ownerAddr = cust.ownerAddress || cust.address || (cust.city ? (cust.city + (cust.district ? " - " + cust.district : "")) : "");
  setVal("ag-owner-address", ownerAddr);

  // تعبئة بيانات المسؤول المفوض
  setVal("ag-mgr-name", cust.managerName || "");
  setVal("ag-mgr-id", cust.managerId || "");
  setVal("ag-mgr-phone", cust.managerPhone || "");
  setVal("ag-mgr-email", cust.managerEmail || "");

  // تعبئة شروط الائتمان
  setVal("ag-credit-limit", cust.creditLimit || 0);
  setVal("ag-credit-days", cust.creditDays || 30);
  setVal("ag-rep-name", cust.repName || "");

  // إظهار شريط معلومات العميل مع الأرصدة
  window._currentAgreementSignatureUrl = cust.signatureDataUrl || "";
  window._currentAgreementAttachments = Array.isArray(cust.attachments) ? cust.attachments : [];

  const attBadge = document.getElementById("ag-attachments-badge");
  const attCount = document.getElementById("ag-attachments-count");
  if (attBadge && attCount) {
    if (window._currentAgreementAttachments.length > 0) {
      attCount.textContent = window._currentAgreementAttachments.length;
      attBadge.style.display = "flex";
    } else {
      attBadge.style.display = "none";
    }
  }

  const badge = document.getElementById("ag-customer-info-badge");
  if (badge) {
    badge.style.display = "flex";
    badge.innerHTML = `
      <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
        <span>🏢 <strong>${cust.name || "—"}</strong></span>
        <span>🏷️ الكود: <strong>${cust.code || "—"}</strong></span>
        <span>💳 الرصيد الحالي: <strong style="color:${(cust.balance || 0) > 0 ? '#dc2626' : '#16a34a'};">${formatCurrency(cust.balance || 0)}</strong></span>
        <span>🛡️ حد الائتمان: <strong>${formatCurrency(cust.creditLimit || 0)}</strong></span>
        <span>⏱️ الأيام: <strong>${cust.creditDays || 30} يوم</strong></span>
      </div>
      <div style="font-size:11px; color:#0284c7; font-weight:800;">
        ✓ تم جلب البيانات تلقائياً
      </div>
    `;
  }

  // إظهار أزرار الحفظ في ملف العميل وإصدار سند لأمر
  const saveBtn = document.getElementById("ag-save-cust-btn");
  if (saveBtn) saveBtn.style.display = "inline-flex";

  const noteBtn = document.getElementById("ag-issue-note-btn");
  if (noteBtn) {
    noteBtn.style.display = "inline-flex";
    noteBtn.onclick = () => window.issuePromissoryNoteFromAgreement(cust.id, cust.name);
  }

  showToast(`✅ تم جلب وتعبئة بيانات العميل (${cust.name}) بنجاح`, "success");
};

/**
 * تفريغ الحقول لإعداد نموذج رسمي فارغ جديد
 */
window.clearAgreementCustomerSelection = () => {
  window._currentAgreementSignatureUrl = "";
  window._currentAgreementAttachments = [];
  const attBadge = document.getElementById("ag-attachments-badge");
  if (attBadge) attBadge.style.display = "none";

  const custIdEl = document.getElementById("ag-cust-id");
  if (custIdEl) custIdEl.value = "";

  const select = document.getElementById("ag-customer-selector");
  if (select) select.value = "";

  const searchInput = document.getElementById("ag-search-customer-input");
  if (searchInput) searchInput.value = "";

  // إعادة إظهار كافة الخيارات
  window.filterAgreementCustomerOptions("");

  const subTitleEl = document.getElementById("ag-modal-subtitle");
  if (subTitleEl) subTitleEl.textContent = "طباعة النموذج الرسمي المعتمد فارغاً للتعبئة الورقية";

  const typeOpenRadio = document.getElementById("ag-type-open");
  if (typeOpenRadio) typeOpenRadio.checked = true;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val ?? "";
  };

  setVal("ag-name", "");
  setVal("ag-cr", "");
  setVal("ag-cr-date", "");
  setVal("ag-cr-source", "ينبع");
  setVal("ag-city", "ينبع");
  setVal("ag-district", "");
  setVal("ag-street", "");
  setVal("ag-postal", "");
  setVal("ag-legal-form", "مؤسسة فردية");
  setVal("ag-activity", "تجارة وتوريد مواد غذائية");
  setVal("ag-phone", "");
  setVal("ag-mobile", "");
  setVal("ag-email", "");
  setVal("ag-vat", "");
  setVal("ag-branches", "1");
  setVal("ag-pobox", "");

  setVal("ag-owner-name", "");
  setVal("ag-owner-id", "");
  setVal("ag-owner-id-source", "ينبع");
  setVal("ag-owner-phone", "");
  setVal("ag-owner-email", "");
  setVal("ag-owner-address", "");

  setVal("ag-mgr-name", "");
  setVal("ag-mgr-id", "");
  setVal("ag-mgr-phone", "");
  setVal("ag-mgr-email", "");

  setVal("ag-credit-limit", 0);
  setVal("ag-credit-days", 30);
  setVal("ag-rep-name", "");

  const badge = document.getElementById("ag-customer-info-badge");
  if (badge) badge.style.display = "none";

  const saveBtn = document.getElementById("ag-save-cust-btn");
  if (saveBtn) saveBtn.style.display = "none";

  const noteBtn = document.getElementById("ag-issue-note-btn");
  if (noteBtn) noteBtn.style.display = "none";

  showToast("تم تفريغ الحقول لإعداد نموذج فارغ", "info");
};

/**
 * جمع البيانات الحالية من حقول النافذة
 */
function collectAgreementFormData() {
  const isUpdate = document.getElementById("ag-type-update")?.checked;
  const custId = document.getElementById("ag-cust-id")?.value || "";

  return {
    id: custId,
    requestType: isUpdate ? "update" : "open",
    requestTypeLabel: isUpdate ? "طلب تحديث حساب" : "طلب فتح حساب",
    dateGreg: document.getElementById("ag-date-greg")?.value || todayString(),
    dateHijri: getHijriDate(),
    
    // منشأة
    name: document.getElementById("ag-name")?.value.trim() || "",
    crNumber: document.getElementById("ag-cr")?.value.trim() || "",
    crDate: document.getElementById("ag-cr-date")?.value.trim() || "",
    crSource: document.getElementById("ag-cr-source")?.value.trim() || "",
    city: document.getElementById("ag-city")?.value.trim() || "",
    district: document.getElementById("ag-district")?.value.trim() || "",
    street: document.getElementById("ag-street")?.value.trim() || "",
    postalCode: document.getElementById("ag-postal")?.value.trim() || "",
    legalForm: document.getElementById("ag-legal-form")?.value || "مؤسسة فردية",
    activityType: document.getElementById("ag-activity")?.value.trim() || "",
    phone: document.getElementById("ag-phone")?.value.trim() || "",
    mobile: document.getElementById("ag-mobile")?.value.trim() || "",
    email: document.getElementById("ag-email")?.value.trim() || "",
    vatNumber: document.getElementById("ag-vat")?.value.trim() || "",
    branchCount: document.getElementById("ag-branches")?.value || "1",
    poBox: document.getElementById("ag-pobox")?.value.trim() || "",

    // مالك
    ownerName: document.getElementById("ag-owner-name")?.value.trim() || "",
    ownerId: document.getElementById("ag-owner-id")?.value.trim() || "",
    ownerIdDate: document.getElementById("ag-owner-id-date")?.value.trim() || "",
    ownerIdSource: document.getElementById("ag-owner-id-source")?.value.trim() || "",
    ownerPhone: document.getElementById("ag-owner-phone")?.value.trim() || "",
    ownerAddress: document.getElementById("ag-owner-address")?.value.trim() || "",
    ownerEmail: document.getElementById("ag-owner-email")?.value.trim() || "",

    // مسؤول
    managerName: document.getElementById("ag-mgr-name")?.value.trim() || "",
    managerId: document.getElementById("ag-mgr-id")?.value.trim() || "",
    managerPhone: document.getElementById("ag-mgr-phone")?.value.trim() || "",
    managerEmail: document.getElementById("ag-mgr-email")?.value.trim() || "",

    // شروط الائتمان
    creditLimit: parseFloat(document.getElementById("ag-credit-limit")?.value) || 0,
    creditDays: parseInt(document.getElementById("ag-credit-days")?.value) || 0,
    repName: document.getElementById("ag-rep-name")?.value.trim() || ""
  };
}

/**
 * حفظ البيانات المعدلة في ملف العميل في Firestore
 */
window.saveAgreementDataOnly = async () => {
  const data = collectAgreementFormData();
  if (!data.id) {
    showToast("يرجى اختيار عميل مسجل لحفظ البيانات في ملفه", "warning");
    return;
  }

  try {
    await update("customers", data.id, {
      name: data.name,
      crNumber: data.crNumber,
      nationalId: data.crNumber,
      crDate: data.crDate,
      crSource: data.crSource,
      vatNumber: data.vatNumber,
      city: data.city,
      district: data.district,
      street: data.street,
      postalCode: data.postalCode,
      phone: data.phone,
      mobile: data.mobile,
      email: data.email,
      creditLimit: data.creditLimit,
      creditDays: data.creditDays,
      ownerName: data.ownerName,
      ownerId: data.ownerId,
      ownerPhone: data.ownerPhone,
      ownerAddress: data.ownerAddress,
      ownerEmail: data.ownerEmail,
      managerName: data.managerName,
      managerId: data.managerId,
      managerPhone: data.managerPhone,
      managerEmail: data.managerEmail,
      legalForm: data.legalForm,
      activityType: data.activityType,
      branchCount: data.branchCount,
      repName: data.repName,
      updatedAt: new Date().toISOString()
    });
    showToast("✅ تم حفظ وتحديث بيانات الاتفاقية في ملف العميل بنجاح", "success");
  } catch (err) {
    showToast("خطأ في حفظ البيانات: " + err.message, "error");
  }
};

/**
 * إصدار سند لأمر مرتبط بالاتفاقية
 */
window.issuePromissoryNoteFromAgreement = (customerId, customerName) => {
  const overlay = document.getElementById("cust-agreement-modal-overlay");
  if (overlay) overlay.remove();
  if (typeof window.issuePromissoryNote === "function") {
    window.issuePromissoryNote(customerId, customerName);
  }
};

/**
 * توليد وطباعة الاتفاقية الرسمية — معتمدة ومطابقة لنموذج A4 الملكي الموحد بنسبة 100%
 */
window.generateAndPrintCustomerAgreement = async () => {
  const d = collectAgreementFormData();
  d.signatureDataUrl = window._currentAgreementSignatureUrl || "";
  d.attachments = window._currentAgreementAttachments || [];

  // التأكد من تحميل إعدادات الشركة والشعار الرسمي
  let co = window._agreementCompanyInfo;
  if (!co || !co.logoUrl) {
    co = await loadCompanySettingsAndLogo();
  }

  printMasterCustomerAgreement(d, co);
};
