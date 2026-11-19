// ============================================================
// IDHAM ERP — Sales Manager Onboarding & Legal Agreement App
// بوابة مدير المبيعات — تسجيل العملاء والاتفاقيات القانونية
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { printMasterCustomerAgreement } from "../modules/agreement-print-template.js?v=4.2";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY",
  authDomain: "idham-b3a7e.firebaseapp.com",
  projectId: "idham-b3a7e"
};

const app = initializeApp(firebaseConfig, "sales-mgr-app");
const db = getFirestore(app);
const COMPANY_ID = "idham-main";

// State
let _company = {
  name: "شركة نظم الإمداد المتطورة",
  nameEn: "Advanced Supply Systems Co.",
  subNameAr: "تجارة وتوريد المواد الغذائية بالجملة",
  cityAr: "ينبع - المملكة العربية السعودية",
  phone: "0549141648",
  email: "Nuzmalamdad@gmail.com",
  crNumber: "7054969006",
  vatNumber: "314996148100003",
  logoUrl: ""
};

let _salesReps = [];
let _allCustomers = [];
let _filteredCustomers = [];
let _currentCustomerData = null;
let _sigCanvas = null;
let _sigCtx = null;
let _isDrawing = false;
let _currentStep = 1;

let _warehouses = [];
let _products = [];
let _dnLines = [];
let _dnSigCanvas = null;
let _dnSigCtx = null;
let _isDnDrawing = false;

// Document definitions for attachments
const ATTACHMENT_DEFS = [
  { id: "cr_doc", title: "السجل التجاري", icon: "📜", desc: "ساري المفعول ومحدث" },
  { id: "vat_doc", title: "شهادة ضريبة القيمة المضافة (ZATCA)", icon: "🏷️", desc: "شهادة التسجيل الرسمية 15 رقماً" },
  { id: "license_doc", title: "رخصة البلدية / النشاط", icon: "🏢", desc: "رخصة فتح المحل أو المستودع" },
  { id: "owner_id_doc", title: "الهوية الوطنية لمالك المنشأة (الكفيل)", icon: "🪪", desc: "صورة واضحة من الوجهين" },
  { id: "signatory_id_doc", title: "هوية المفوض بالتوقيع (الكفيل الغارم)", icon: "🆔", desc: "صورة هوية أو إقامة المفوض بالتوقيع" },
  { id: "lease_doc", title: "عقد الإيجار أو صك الملكية", icon: "📑", desc: "إثبات موقع المنشأة" },
  { id: "iban_doc", title: "شهادة الحساب البنكي (IBAN)", icon: "🏦", desc: "مختومة من البنك باسم المنشأة" }
];

let _attachmentsState = {};

/**
 * Toast notifications
 */
function showToast(msg, type = "info") {
  const t = document.createElement("div");
  t.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: ${type === "error" ? "#dc2626" : type === "success" ? "#059669" : "#0f172a"};
    color: #fff; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 13.5px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.25); z-index: 99999; display: flex; align-items: center; gap: 8px;
    font-family: inherit; transition: opacity 0.3s;
  `;
  t.innerHTML = `<span>${type === "error" ? "⚠️" : type === "success" ? "✅" : "ℹ️"}</span><span>${msg}</span>`;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0";
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

/**
 * Currency Formatter
 */
function formatCurrency(val) {
  const n = Number(val) || 0;
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ر.س";
}

/**
 * Initialize Application
 */
window.addEventListener("DOMContentLoaded", async () => {
  await loadCompanyInfo();
  await loadSalesReps();
  loadWarehouses();
  loadProducts();
  await loadCustomers();
  setupEventListeners();
});

/**
 * Load Company Profile & Logo
 */
async function loadCompanyInfo() {
  try {
    const [logoSnap, compSnap] = await Promise.all([
      getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "logo")),
      getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company"))
    ]);
    if (logoSnap.exists() && logoSnap.data().dataUrl) {
      _company.logoUrl = logoSnap.data().dataUrl;
    }
    if (compSnap.exists()) {
      const cd = compSnap.data();
      if (cd.name) _company.name = cd.name;
      if (cd.nameEn) _company.nameEn = cd.nameEn;
      if (cd.phone) _company.phone = cd.phone;
      if (cd.email) _company.email = cd.email;
      if (cd.crNumber || cd.cr) _company.crNumber = cd.crNumber || cd.cr;
      if (cd.vatNumber) _company.vatNumber = cd.vatNumber;
      if (cd.cityAr) _company.cityAr = cd.cityAr;
    }
  } catch (e) {
    console.warn("Could not load company info:", e);
  }
}

/**
 * Load Sales Reps
 */
async function loadSalesReps() {
  try {
    const snap = await getDocs(collection(db, `companies/${COMPANY_ID}/salesReps`));
    _salesReps = [];
    snap.forEach(d => {
      const r = d.data();
      if (r.active !== false && r.status !== "inactive") {
        _salesReps.push({ id: d.id, name: r.name, phone: r.phone || "" });
      }
    });
  } catch (e) {
    console.warn("Could not load sales reps:", e);
  }
}

/**
 * Load Warehouses & Delivery Vans
 */
async function loadWarehouses() {
  try {
    const snap = await getDocs(collection(db, `companies/${COMPANY_ID}/warehouses`));
    _warehouses = [];
    snap.forEach(d => {
      const data = d.data();
      if (data.status !== "inactive") {
        _warehouses.push({ id: d.id, name: data.name || "مستودع" });
      }
    });
  } catch (e) {
    console.warn("Could not load warehouses:", e);
  }
}

/**
 * Load Products for Delivery Notes
 */
async function loadProducts() {
  try {
    const snap = await getDocs(collection(db, `companies/${COMPANY_ID}/products`));
    _products = [];
    snap.forEach(d => {
      const p = d.data();
      if (p.name || p.sku) {
        _products.push({
          id: d.id,
          name: p.name || "صنف",
          sku: p.sku || "",
          unit: p.unit || "Piece"
        });
      }
    });
  } catch (e) {
    console.warn("Could not load products:", e);
  }
}

/**
 * Load Customers from Firestore
 */
async function loadCustomers() {
  const grid = document.getElementById("clients-grid-container");
  if (grid) {
    grid.innerHTML = `
      <div style="text-align:center; padding:40px; color:var(--text-muted);">
        <div style="font-size:24px; margin-bottom:8px;">⏳</div>
        <div style="font-weight:700;">جاري تحميل سجل العملاء...</div>
      </div>
    `;
  }

  try {
    const snap = await getDocs(collection(db, `companies/${COMPANY_ID}/customers`));
    _allCustomers = [];
    snap.forEach(d => {
      const c = d.data();
      _allCustomers.push({ id: d.id, ...c });
    });

    // Sort by createdAt descending
    _allCustomers.sort((a, b) => {
      const tA = a.createdAt?.seconds || 0;
      const tB = b.createdAt?.seconds || 0;
      return tB - tA;
    });

    _filteredCustomers = [..._allCustomers];
    renderStats();
    renderClientsList();
  } catch (e) {
    console.error("Error loading customers:", e);
    if (grid) {
      grid.innerHTML = `<div style="text-align:center; padding:20px; color:var(--danger); font-weight:bold;">حدث خطأ أثناء تحميل العملاء</div>`;
    }
  }
}

/**
 * Render Quick KPI Stats
 */
function renderStats() {
  const total = _allCustomers.length;
  const pending = _allCustomers.filter(c => c.status === "pending_approval" || c.approvalStatus === "pending").length;
  const approved = total - pending;
  const withAgreements = _allCustomers.filter(c => c.hasAgreement || c.agreementData || c.signatureDataUrl).length;

  document.getElementById("stat-total-clients").textContent = total;
  document.getElementById("stat-pending-clients").textContent = pending;
  document.getElementById("stat-approved-clients").textContent = approved;
  document.getElementById("stat-agreements-clients").textContent = withAgreements;
}

/**
 * Render Clients List
 */
function renderClientsList() {
  const container = document.getElementById("clients-grid-container");
  if (!container) return;

  if (_filteredCustomers.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:48px 20px; background:#fff; border-radius:14px; border:1px dashed var(--border);">
        <div style="font-size:36px; margin-bottom:10px;">📋</div>
        <h4 style="font-size:16px; font-weight:800; color:#334155; margin-bottom:4px;">لا يوجد عملاء مطابقين للبحث</h4>
        <p style="font-size:12.5px; color:var(--text-muted);">انقر على زر «تسجيل عميل جديد» لإضافة عميل وتوثيق المستندات والاتفاقية</p>
      </div>
    `;
    return;
  }

  container.innerHTML = _filteredCustomers.map(c => {
    const isPending = c.status === "pending_approval" || c.approvalStatus === "pending";
    const statusBadge = isPending
      ? `<span class="badge badge-pending">🟡 قيد الاعتماد</span>`
      : `<span class="badge badge-active">🟢 معتمد ونشط</span>`;

    const attachCount = Array.isArray(c.attachments) ? c.attachments.length : 0;
    const hasSig = !!c.signatureDataUrl;

    return `
      <div class="client-card">
        <div class="client-name-row">
          <div class="client-avatar">
            ${(c.name || "ع").charAt(0)}
          </div>
          <div class="client-title">
            <div style="display:flex; align-items:center; gap:8px;">
              <h4>${c.name || "بدون اسم"}</h4>
              ${statusBadge}
            </div>
            <div class="client-meta">
              <span>🏷️ كود: <strong style="font-family:monospace; color:#004d80;">${c.code || "—"}</strong></span>
              <span>📞 ${c.phone || c.mobile || "—"}</span>
              ${c.crNumber ? `<span>📜 س.ت: <strong style="font-family:monospace;">${c.crNumber}</strong></span>` : ""}
              ${c.vatNumber ? `<span>🏢 ر.ض: <strong style="font-family:monospace;">${c.vatNumber}</strong></span>` : ""}
              <span>📍 ${c.city || "ينبع"}</span>
              <span>👤 المندوب: ${c.repName || "غير محدد"}</span>
            </div>
            <div style="display:flex; gap:10px; margin-top:6px; font-size:11.5px; font-weight:700;">
              <span style="color:${attachCount > 0 ? '#059669' : '#94a3b8'};">📎 المستندات: ${attachCount} مرفق</span>
              <span style="color:${hasSig ? '#0284c7' : '#94a3b8'};">✍️ التوقيع: ${hasSig ? 'موقع إلكترونياً' : 'غير موقع'}</span>
              ${c.creditLimit ? `<span style="color:#d97706;">💳 حد الائتمان: ${formatCurrency(c.creditLimit)}</span>` : ""}
            </div>
          </div>
        </div>

        <div class="card-actions-grid">
          <button class="btn btn-primary btn-sm" onclick="window.printAgreementForCustomer('${c.id}')" title="طباعة الاتفاقية القانونية الرسمية A4">
            🖨️ الاتفاقية
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.openCustomerDetailsModal('${c.id}')" title="عرض الملف والمستندات">
            📂 المستندات (${attachCount})
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.downloadCustomerAttachmentsLocal('${c.id}')" style="color:#059669; border-color:#86efac; font-weight:800;" title="تنزيل حزمة مستندات العميل محلياً على جهازك لتخفيف السيرفر">
            📥 تنزيل محلي
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.openDeliveryNoteModal('${c.id}')" style="color:#2563eb; border-color:#bfdbfe; font-weight:800;" title="إصدار سند / إذن تسليم بضاعة للعميل">
            🚚 سند تسليم
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.editCustomerModal('${c.id}')" title="تعديل أو استكمال البيانات والمرفقات">
            ✏️ تعديل
          </button>
        </div>
      </div>
    `;
  }).join("");
}

let _activeStatusFilter = "all";

/**
 * Filter customers by status pill
 */
window.setFilterStatus = (status) => {
  _activeStatusFilter = status;
  document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
  const btn = document.getElementById(`filter-status-${status}`);
  if (btn) btn.classList.add("active");

  const searchInput = document.getElementById("search-clients-input");
  window.filterClients(searchInput?.value || "");
};

/**
 * Filter customers by search term & active status
 */
window.filterClients = (query) => {
  const q = (query || "").trim().toLowerCase();
  let list = [..._allCustomers];

  if (_activeStatusFilter === "pending") {
    list = list.filter(c => c.status === "pending_approval" || c.approvalStatus === "pending");
  } else if (_activeStatusFilter === "approved") {
    list = list.filter(c => c.status !== "pending_approval" && c.approvalStatus !== "pending");
  } else if (_activeStatusFilter === "signed") {
    list = list.filter(c => !!c.signatureDataUrl);
  }

  if (q) {
    list = list.filter(c =>
      (c.name || "").toLowerCase().includes(q) ||
      (c.code || "").toLowerCase().includes(q) ||
      (c.phone || "").toLowerCase().includes(q) ||
      (c.crNumber || "").toLowerCase().includes(q) ||
      (c.vatNumber || "").toLowerCase().includes(q) ||
      (c.repName || "").toLowerCase().includes(q)
    );
  }

  _filteredCustomers = list;
  renderClientsList();
};

/**
 * Open Stepper Modal for Editing Existing Customer
 */
window.editCustomerModal = (customerId) => {
  const c = _allCustomers.find(x => x.id === customerId);
  if (!c) return;

  _currentCustomerData = {
    id: c.id,
    name: c.name || "",
    code: c.code || "",
    legalForm: c.legalForm || "مؤسسة فردية",
    activityType: c.activityType || "",
    crNumber: c.crNumber || "",
    crDate: c.crDate || "",
    crSource: c.crSource || "ينبع",
    vatNumber: c.vatNumber || "",
    phone: c.phone || c.mobile || "",
    mobile: c.mobile || c.phone || "",
    email: c.email || "",
    city: c.city || "ينبع",
    district: c.district || "",
    street: c.street || "",
    postalCode: c.postalCode || "",
    googleMapsUrl: c.googleMapsUrl || "",
    repId: c.repId || c.assignedRepId || "",
    repName: c.repName || "",
    creditLimit: c.creditLimit || 0,
    creditDays: c.creditDays || 30,
    paymentMethod: c.paymentMethod || "credit",
    signatoryRole: c.signatoryRole || "مالك المنشأة",
    ownerName: c.ownerName || "",
    ownerId: c.ownerId || "",
    ownerPhone: c.ownerPhone || "",
    purchaserName: c.purchaserName || "",
    purchaserPhone: c.purchaserPhone || "",
    receiverName: c.receiverName || "",
    receiverPhone: c.receiverPhone || "",
    signatureDataUrl: c.signatureDataUrl || "",
    createdAt: c.createdAt || null
  };

  _attachmentsState = {};
  ATTACHMENT_DEFS.forEach(d => {
    const existing = (c.attachments || []).find(a => a.docId === d.id);
    _attachmentsState[d.id] = existing || null;
  });

  _currentStep = 1;
  renderModalHTML();
};

/**
 * Open Stepper Modal for New Customer Onboarding
 */
window.openNewCustomerModal = () => {
  _currentCustomerData = {
    id: "",
    name: "",
    code: "CUST-" + Math.floor(10000 + Math.random() * 90000),
    legalForm: "مؤسسة فردية",
    activityType: "مطعم وإعاشة",
    crNumber: "",
    crDate: "",
    crSource: "ينبع",
    vatNumber: "",
    phone: "",
    mobile: "",
    email: "",
    city: "ينبع",
    district: "",
    street: "",
    postalCode: "",
    googleMapsUrl: "",
    repId: _salesReps[0]?.id || "",
    repName: _salesReps[0]?.name || "",
    creditLimit: 15000,
    creditDays: 30,
    paymentMethod: "credit",
    signatoryRole: "مالك المنشأة",
    ownerName: "",
    ownerId: "",
    ownerIdDate: "",
    ownerIdSource: "",
    ownerPhone: "",
    ownerAddress: "",
    purchaserName: "",
    purchaserPhone: "",
    receiverName: "",
    receiverPhone: "",
    managerName: "",
    managerId: "",
    managerPhone: "",
    signatureDataUrl: ""
  };

  _attachmentsState = {};
  ATTACHMENT_DEFS.forEach(d => {
    _attachmentsState[d.id] = null;
  });

  _currentStep = 1;
  renderModalHTML();
};

/**
 * Render Modal HTML
 */
function renderModalHTML() {
  let overlay = document.getElementById("sales-mgr-modal-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "sales-mgr-modal-overlay";
    overlay.className = "modal-overlay";
    document.body.appendChild(overlay);
  }

  const repsOptions = _salesReps.map(r => `
    <option value="${r.id}" ${r.id === _currentCustomerData.repId ? 'selected' : ''}>${r.name}</option>
  `).join("");

  overlay.innerHTML = `
    <div class="modal-window">
      <!-- Modal Header -->
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:22px;">💼</span>
          <div>
            <h3>تسجيل عميل جديد وتوثيق الاتفاقية الائتمانية</h3>
            <p style="font-size:11px; opacity:0.85; margin:0;">نموذج الحوكمة الميدانية وحفظ حقوق المنشأة</p>
          </div>
        </div>
        <button class="modal-close-btn" onclick="window.closeModal()">✕</button>
      </div>

      <!-- Stepper Nav -->
      <div class="stepper-nav">
        <div class="step-tab ${_currentStep === 1 ? 'active' : ''}" onclick="window.switchStep(1)">
          <span class="step-num">1</span>
          <span>بيانات المنشأة والتواصل</span>
        </div>
        <div class="step-tab ${_currentStep === 2 ? 'active' : ''}" onclick="window.switchStep(2)">
          <span class="step-num">2</span>
          <span>المستندات القانونية (KYC)</span>
        </div>
        <div class="step-tab ${_currentStep === 3 ? 'active' : ''}" onclick="window.switchStep(3)">
          <span class="step-num">3</span>
          <span>الاتفاقية والتوقيع والطباعة</span>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        
        <!-- STEP 1: Basic & Commercial Info -->
        <div id="step-1-container" style="display:${_currentStep === 1 ? 'block' : 'none'};">
          <div style="background:#f0f9ff; border:1px solid #bae6fd; padding:10px 14px; border-radius:10px; margin-bottom:16px; font-size:12px; color:#0369a1; font-weight:700;">
            ℹ️ يرجى تسجيل بيانات المنشأة بدقة طبقاً للسجل التجاري أو رخصة البلدية لتسهيل مطابقتها نظامياً.
          </div>

          <div class="form-grid">
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">الاسم التجاري للمنشأة <span class="req">*</span></label>
              <input type="text" id="cust-name" class="form-input" value="${_currentCustomerData.name}" placeholder="مثال: مؤسسة قمة البركة لتقديم الوجبات" />
            </div>

            <div class="form-group">
              <label class="form-label">رقم السجل التجاري (10 أرقام)</label>
              <input type="text" id="cust-cr" class="form-input mono" value="${_currentCustomerData.crNumber}" placeholder="70xxxxxxxx / 10xxxxxxxx" maxlength="10" />
            </div>

            <div class="form-group">
              <label class="form-label">تاريخ السجل ومصدره</label>
              <div style="display:flex; gap:6px;">
                <input type="date" id="cust-cr-date" class="form-input mono" value="${_currentCustomerData.crDate}" style="flex:1;" />
                <input type="text" id="cust-cr-source" class="form-input" value="${_currentCustomerData.crSource}" placeholder="ينبع" style="width:100px;" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">الرقم الضريبي (15 رقماً ZATCA)</label>
              <input type="text" id="cust-vat" class="form-input mono" value="${_currentCustomerData.vatNumber}" placeholder="3xxxxxxxxxxxxxx" maxlength="15" />
            </div>

            <div class="form-group">
              <label class="form-label">الشكل القانوني للمنشأة</label>
              <select id="cust-legal-form" class="form-input">
                <option value="مؤسسة فردية" ${_currentCustomerData.legalForm === 'مؤسسة فردية' ? 'selected' : ''}>مؤسسة فردية</option>
                <option value="شركة ذات مسؤولية محدودة" ${_currentCustomerData.legalForm === 'شركة ذات مسؤولية محدودة' ? 'selected' : ''}>شركة ذات مسؤولية محدودة</option>
                <option value="شركة مساهمة مبسطة" ${_currentCustomerData.legalForm === 'شركة مساهمة مبسطة' ? 'selected' : ''}>شركة مساهمة مبسطة</option>
                <option value="فرع لشركة أجنبية" ${_currentCustomerData.legalForm === 'فرع لشركة أجنبية' ? 'selected' : ''}>فرع لشركة أجنبية</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">نوع النشاط</label>
              <input type="text" id="cust-activity" class="form-input" value="${_currentCustomerData.activityType}" placeholder="مطعم، كافيه، بوفيه، إعاشة، تموينات..." />
            </div>

            <div class="form-group">
              <label class="form-label">رقم الجوال الأساسي للتواصل <span class="req">*</span></label>
              <input type="tel" id="cust-phone" class="form-input mono" value="${_currentCustomerData.phone}" placeholder="05xxxxxxxx" />
            </div>

            <div class="form-group">
              <label class="form-label">البريد الإلكتروني</label>
              <input type="email" id="cust-email" class="form-input mono" value="${_currentCustomerData.email}" placeholder="info@example.com" />
            </div>

            <div class="form-group">
              <label class="form-label">المدينة والحي</label>
              <div style="display:flex; gap:6px;">
                <input type="text" id="cust-city" class="form-input" value="${_currentCustomerData.city}" placeholder="المدينة" style="flex:1;" />
                <input type="text" id="cust-district" class="form-input" value="${_currentCustomerData.district}" placeholder="الحي" style="flex:1;" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">الشارع والرمز البريدي</label>
              <div style="display:flex; gap:6px;">
                <input type="text" id="cust-street" class="form-input" value="${_currentCustomerData.street}" placeholder="الشارع" style="flex:1;" />
                <input type="text" id="cust-postal" class="form-input mono" value="${_currentCustomerData.postalCode}" placeholder="الرمز 12345" style="width:110px;" />
              </div>
            </div>

            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">الموقع الجغرافي الميداني (GPS)</label>
              <div style="display:flex; gap:8px;">
                <input type="text" id="cust-gps-url" class="form-input mono" value="${_currentCustomerData.googleMapsUrl}" placeholder="رابط خرائط جوجل أو إحداثيات الموقع" style="flex:1;" />
                <button type="button" class="btn btn-secondary" onclick="window.captureCurrentGPS()" style="background:#e0f2fe; color:#0284c7; border-color:#bae6fd;">
                  📍 التقاط موقعي الآن
                </button>
              </div>
            </div>

            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">المندوب الميداني المسؤول عن التوزيع</label>
              <select id="cust-rep-select" class="form-input" onchange="window.onRepChanged(this.value)">
                ${repsOptions}
              </select>
            </div>
          </div>
        </div>

        <!-- STEP 2: Legal KYC Attachments -->
        <div id="step-2-container" style="display:${_currentStep === 2 ? 'block' : 'none'};">
          <div style="background:#fefce8; border:1px solid #fef08a; padding:10px 14px; border-radius:10px; margin-bottom:16px; font-size:12px; color:#854d0e; font-weight:700;">
            📎 يمكنك التقاط الصور مباشرة عبر كاميرا الجوال أو إرفاق ملفات المستندات. يتم حفظ كافة المرفقات في ملف العميل.
          </div>

          <div class="attach-grid">
            ${ATTACHMENT_DEFS.map(d => {
              const fileData = _attachmentsState[d.id];
              const hasFile = !!fileData;
              return `
                <div class="attach-card ${hasFile ? 'has-file' : ''}" onclick="window.triggerFileInput('${d.id}')">
                  <div class="attach-icon">${d.icon}</div>
                  <div class="attach-title">${d.title}</div>
                  <div class="attach-desc">${d.desc}</div>
                  
                  ${hasFile ? `
                    <div style="margin-top:8px;">
                      <span class="badge badge-active" style="font-size:10.5px;">✓ تم الإرفاق</span>
                      <button type="button" class="btn btn-sm" onclick="event.stopPropagation(); window.removeAttachment('${d.id}')" style="background:#fee2e2; color:#dc2626; border:none; margin-right:4px;">حذف</button>
                    </div>
                  ` : `
                    <button type="button" class="btn btn-secondary btn-sm" style="margin-top:10px; pointer-events:none;">
                      📷 تصوير / رفع
                    </button>
                  `}
                  <input type="file" id="input-file-${d.id}" accept="image/*,application/pdf" capture="environment" style="display:none;" onchange="window.handleAttachmentUpload('${d.id}', this)" />
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- STEP 3: Credit Terms, Agreement & Digital Signature -->
        <div id="step-3-container" style="display:${_currentStep === 3 ? 'block' : 'none'};">
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:10px 14px; border-radius:10px; margin-bottom:14px; font-size:12px; color:#166534; font-weight:700;">
            ⚖️ الاتفاقية القانونية المعتمدة: تتضمن بنود حماية حقوق المنشأة، الكفالة الغارمة، وسقوط الآجال وفق الأنظمة السعودية.
          </div>

          <!-- ⚡ حاسبة الحد الائتماني الذكية وتقييم المخاطر (100 نقطة) -->
          <div class="credit-calc-card">
            <div class="credit-calc-title">
              <span>⚡ حاسبة الحد الائتماني الذكية (وفق سياسة نظم الإمداد)</span>
              <span style="font-size:11px; background:#bbf7d0; color:#14532d; padding:2px 8px; border-radius:12px; font-weight:800;">معادلة المسحوبات</span>
            </div>
            <div class="credit-calc-grid">
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:11px;">متوسط المسحوبات الشهرية (ر.س):</label>
                <input type="number" id="calc-monthly-spend" class="form-input mono" placeholder="مثال: 60000" oninput="window.recalcCreditLimitFormula()" />
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:11px;">فترة السداد المقترحة (أيام):</label>
                <select id="calc-credit-days" class="form-input" onchange="window.recalcCreditLimitFormula()">
                  <option value="7">7 أيام (عميل مجرب)</option>
                  <option value="14" selected>14 يوماً (عميل منتظم)</option>
                  <option value="21">21 يوماً (عميل قوي)</option>
                  <option value="30">30 يوماً (استثناء معتمد)</option>
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:11px;">معامل الذروة التذبذبي:</label>
                <select id="calc-peak-factor" class="form-input" onchange="window.recalcCreditLimitFormula()">
                  <option value="1.0">1.0 (مسحوبات ثابتة)</option>
                  <option value="1.1">1.1 (تذبذب طفيف)</option>
                  <option value="1.2" selected>1.2 (تذبذب موسمي / ذروة)</option>
                </select>
              </div>
            </div>
            <div class="credit-calc-result">
              <div>
                <span style="font-size:11.5px; color:#166534; font-weight:700;">الاحتياج الائتماني المحسوب:</span>
                <strong id="calc-result-display" style="font-family:monospace; font-size:14px; color:#004d80; margin-right:6px;">0.00 ر.س</strong>
              </div>
              <button type="button" class="btn btn-success btn-sm" onclick="window.applyCalculatedCreditLimit()" style="font-size:11px; padding:6px 12px; font-weight:800;">
                ✅ اعتماد هذا الحد في الاتفاقية
              </button>
            </div>

            <!-- 100-Point Scoring Engine -->
            <div style="margin-top:12px; border-top:1px dashed #86efac; padding-top:10px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:12px; font-weight:800; color:#166534;">📋 تقييم المخاطر الميداني (نظام الـ 100 نقطة):</span>
                <span id="scoring-total-badge" style="font-size:11.5px; font-weight:900; background:#fff; padding:3px 10px; border-radius:12px; border:1px solid #86efac; color:#166534;">0 / 100 نقطة</span>
              </div>
              <div class="scoring-checklist">
                <label class="scoring-item">
                  <span>⭐ انتظام السداد والمراجع الموثوقة للموردين</span>
                  <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-size:10.5px; color:#64748b;">(30 نقطة)</span>
                    <input type="checkbox" id="score-regularity" value="30" onchange="window.recalcScoringEngine()" />
                  </div>
                </label>
                <label class="scoring-item">
                  <span>💰 القدرة المالية والملاءة والسيولة النقدية</span>
                  <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-size:10.5px; color:#64748b;">(25 نقطة)</span>
                    <input type="checkbox" id="score-liquidity" value="25" onchange="window.recalcScoringEngine()" />
                  </div>
                </label>
                <label class="scoring-item">
                  <span>📍 استقرار النشاط وتوثيق وزيارة موقع النشاط ميدانياً</span>
                  <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-size:10.5px; color:#64748b;">(15 نقطة)</span>
                    <input type="checkbox" id="score-site" value="15" onchange="window.recalcScoringEngine()" />
                  </div>
                </label>
                <label class="scoring-item">
                  <span>📑 اكتمال المستندات والتفويضات والقنوات المعتمدة</span>
                  <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-size:10.5px; color:#64748b;">(15 نقطة)</span>
                    <input type="checkbox" id="score-docs" value="15" onchange="window.recalcScoringEngine()" />
                  </div>
                </label>
                <label class="scoring-item">
                  <span>⚖️ الضمانات المعتمدة (سند لأمر نافذ / كفالة غارمة متضامنة)</span>
                  <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-size:10.5px; color:#64748b;">(15 نقطة)</span>
                    <input type="checkbox" id="score-guarantee" value="15" onchange="window.recalcScoringEngine()" />
                  </div>
                </label>
              </div>
              <div id="scoring-recommendation-box" style="margin-top:8px; font-size:11.5px; font-weight:700; color:#1e3a8a; background:#eff6ff; padding:8px 12px; border-radius:8px; border:1px solid #bfdbfe;">
                توصية الائتمان: يرجى تحديد معايير التقييم لإظهار المدة المقترحة
              </div>
            </div>
          </div>

          <div class="form-grid" style="margin-bottom:16px;">
            <div class="form-group">
              <label class="form-label">نوع التسهيلات وطريقة السداد</label>
              <select id="cust-payment-method" class="form-input">
                <option value="credit">آجل بفترة سماح (تسهيلات ائتمانية)</option>
                <option value="cash">نقدي فور الاستلام</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">الحد الائتماني المقترح (ر.س)</label>
              <input type="number" id="cust-credit-limit" class="form-input mono" value="${_currentCustomerData.creditLimit}" step="500" />
            </div>

            <div class="form-group">
              <label class="form-label">فترة السماح بالسداد (بالأيام)</label>
              <select id="cust-credit-days" class="form-input">
                <option value="7" ${_currentCustomerData.creditDays == 7 ? 'selected' : ''}>7 أيام</option>
                <option value="15" ${_currentCustomerData.creditDays == 15 ? 'selected' : ''}>15 يوماً</option>
                <option value="20" ${_currentCustomerData.creditDays == 20 ? 'selected' : ''}>20 يوماً</option>
                <option value="30" ${_currentCustomerData.creditDays == 30 ? 'selected' : ''}>30 يوماً (شهر)</option>
                <option value="45" ${_currentCustomerData.creditDays == 45 ? 'selected' : ''}>45 يوماً</option>
                <option value="60" ${_currentCustomerData.creditDays == 60 ? 'selected' : ''}>60 يوماً</option>
              </select>
            </div>
          </div>

          <!-- بيانات المفوض بالتوقيع والالتزام المالي (الكفيل الغارم شخصياً) -->
          <div style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:12px; padding:14px; margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <h4 style="font-size:13px; font-weight:900; color:#004d80; margin:0;">
                👤 المفوض بالتوقيع والالتزام المالي (الكفيل الغارم شخصياً):
              </h4>
              <span style="font-size:11px; background:#e0f2fe; color:#004d80; padding:2px 8px; border-radius:10px; font-weight:800;">
                يلزم المنشأة ويسقط التجريد
              </span>
            </div>
            
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">صفة المفوض النظامية <span class="req">*</span></label>
                <select id="cust-signatory-role" class="form-input">
                  <option value="مالك المنشأة" ${_currentCustomerData.signatoryRole === 'مالك المنشأة' ? 'selected' : ''}>مالك المنشأة</option>
                  <option value="المدير العام / شريك مدير" ${_currentCustomerData.signatoryRole === 'المدير العام / شريك مدير' ? 'selected' : ''}>المدير العام / شريك مدير</option>
                  <option value="وكيل شرعي بموجب وكالة" ${_currentCustomerData.signatoryRole === 'وكيل شرعي بموجب وكالة' ? 'selected' : ''}>وكيل شرعي بموجب وكالة</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">اسم المفوض رباعياً <span class="req">*</span></label>
                <input type="text" id="cust-owner-name" class="form-input" value="${_currentCustomerData.ownerName}" placeholder="الاسم الرباعي كما في الهوية" />
              </div>

              <div class="form-group">
                <label class="form-label">رقم الهوية الوطنية / الإقامة <span class="req">*</span></label>
                <input type="text" id="cust-owner-id" class="form-input mono" value="${_currentCustomerData.ownerId}" placeholder="10xxxxxxxx" maxlength="10" />
              </div>

              <div class="form-group">
                <label class="form-label">رقم جوال المفوض المعتمد <span class="req">*</span></label>
                <input type="tel" id="cust-owner-phone" class="form-input mono" value="${_currentCustomerData.ownerPhone}" placeholder="05xxxxxxxx" />
              </div>
            </div>
          </div>

          <!-- فصل الصلاحيات التشغيلية (طلب البضاعة واستلامها) -->
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:14px; margin-bottom:14px;">
            <div style="margin-bottom:8px;">
              <h4 style="font-size:12.5px; font-weight:900; color:#166534; margin:0;">
                📦 فصل الصلاحيات التشغيلية (المشتريات والاستلام بالموقع):
              </h4>
              <p style="font-size:10.5px; color:#475569; margin:2px 0 0;">
                * تنبيه نظامي: المفوض باستلام البضاعة بالموقع لا يملك صلاحية توقيع اتفاقيات ائتمانية أو سندات لأمر.
              </p>
            </div>
            
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">المفوض بطلب البضاعة (المشتريات)</label>
                <input type="text" id="cust-purchaser-name" class="form-input" value="${_currentCustomerData.purchaserName || ''}" placeholder="اسم مسؤول المشتريات" />
              </div>
              <div class="form-group">
                <label class="form-label">جوال مسؤول المشتريات</label>
                <input type="tel" id="cust-purchaser-phone" class="form-input mono" value="${_currentCustomerData.purchaserPhone || ''}" placeholder="05xxxxxxxx" />
              </div>
              <div class="form-group">
                <label class="form-label">المفوض باستلام البضاعة بالموقع</label>
                <input type="text" id="cust-receiver-name" class="form-input" value="${_currentCustomerData.receiverName || ''}" placeholder="اسم مستلم البضاعة بالموقع" />
              </div>
              <div class="form-group">
                <label class="form-label">جوال مستلم البضاعة بالموقع</label>
                <input type="tel" id="cust-receiver-phone" class="form-input mono" value="${_currentCustomerData.receiverPhone || ''}" placeholder="05xxxxxxxx" />
              </div>
            </div>
          </div>

          <!-- Digital Signature Pad -->
          <div style="margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <label class="form-label" style="font-size:13px; font-weight:900; color:#0f172a;">
                ✍️ توقيع المالك / المفوض الإلكتروني الحي على الشاشة:
              </label>
              <button type="button" class="btn btn-secondary btn-sm" onclick="window.clearSignature()" style="font-size:11px;">
                مسح التوقيع 🔄
              </button>
            </div>
            <div class="sig-container">
              <canvas id="sig-pad-canvas" class="sig-canvas"></canvas>
            </div>
            <div style="font-size:11px; color:#64748b; margin-top:4px;">
              * يتم حفظ التوقيع كصورة رقمية مشفرة وتضمينها تلقائياً بالاتفاقية الرسمية.
            </div>
          </div>

          <!-- Print Preview Button -->
          <div style="background:#eff6ff; border:1px dashed #38bdf8; border-radius:10px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div>
              <div style="font-weight:900; color:#004d80; font-size:13px;">معاينة وطباعة الاتفاقية القانونية الرسمية A4</div>
              <div style="font-size:11px; color:#475569;">توليد الوثيقة الرسمية فوراً متضمنة الشروط الـ 8 والتوقيع والختم</div>
            </div>
            <button type="button" class="btn btn-primary btn-sm" onclick="window.previewAndPrintAgreement()" style="background:#0284c7;">
              🖨️ طباعة الاتفاقية الآن
            </button>
          </div>

        </div>

      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <div>
          ${_currentStep > 1 ? `
            <button type="button" class="btn btn-secondary" onclick="window.switchStep(${_currentStep - 1})">
              السابق ⬅️
            </button>
          ` : `
            <button type="button" class="btn btn-secondary" onclick="window.closeModal()">
              إلغاء
            </button>
          `}
        </div>

        <div style="display:flex; gap:8px;">
          ${_currentStep < 3 ? `
            <button type="button" class="btn btn-primary" onclick="window.switchStep(${_currentStep + 1})">
              التالي (الخطوة ${_currentStep + 1}) ➡️
            </button>
          ` : `
            <button type="button" class="btn btn-success" id="btn-save-customer" onclick="window.saveCustomerToSystem()">
              💾 حفظ العميل واعتماد الاتفاقية
            </button>
          `}
        </div>
      </div>
    </div>
  `;

  if (_currentStep === 3) {
    setTimeout(initSignaturePad, 100);
  }
}

/**
 * Switch Stepper Step
 */
window.switchStep = (step) => {
  saveCurrentFormValues();
  _currentStep = step;
  renderModalHTML();
};

/**
 * Save form values to memory
 */
function saveCurrentFormValues() {
  if (!_currentCustomerData) return;
  const g = (id) => document.getElementById(id)?.value?.trim() || "";

  if (document.getElementById("cust-name")) {
    _currentCustomerData.name = g("cust-name");
    _currentCustomerData.crNumber = g("cust-cr");
    _currentCustomerData.crDate = g("cust-cr-date");
    _currentCustomerData.crSource = g("cust-cr-source");
    _currentCustomerData.vatNumber = g("cust-vat");
    _currentCustomerData.legalForm = g("cust-legal-form") || "مؤسسة فردية";
    _currentCustomerData.activityType = g("cust-activity");
    _currentCustomerData.phone = g("cust-phone");
    _currentCustomerData.email = g("cust-email");
    _currentCustomerData.city = g("cust-city");
    _currentCustomerData.district = g("cust-district");
    _currentCustomerData.street = g("cust-street");
    _currentCustomerData.postalCode = g("cust-postal");
    _currentCustomerData.googleMapsUrl = g("cust-gps-url");
  }

  if (document.getElementById("cust-credit-limit")) {
    _currentCustomerData.paymentMethod = g("cust-payment-method");
    _currentCustomerData.creditLimit = parseFloat(g("cust-credit-limit")) || 0;
    _currentCustomerData.creditDays = parseInt(g("cust-credit-days")) || 30;
    _currentCustomerData.signatoryRole = g("cust-signatory-role") || "مالك المنشأة";
    _currentCustomerData.ownerName = g("cust-owner-name");
    _currentCustomerData.ownerId = g("cust-owner-id");
    _currentCustomerData.ownerPhone = g("cust-owner-phone");
    _currentCustomerData.purchaserName = g("cust-purchaser-name");
    _currentCustomerData.purchaserPhone = g("cust-purchaser-phone");
    _currentCustomerData.receiverName = g("cust-receiver-name");
    _currentCustomerData.receiverPhone = g("cust-receiver-phone");
  }

  // Save signature if drawn
  if (_sigCanvas && !_isCanvasBlank(_sigCanvas)) {
    _currentCustomerData.signatureDataUrl = _sigCanvas.toDataURL("image/png");
  }
}

/**
 * Handle Rep Change
 */
window.onRepChanged = (repId) => {
  const r = _salesReps.find(x => x.id === repId);
  if (r) {
    _currentCustomerData.repId = r.id;
    _currentCustomerData.repName = r.name;
  }
};

/**
 * Capture current GPS position
 */
window.captureCurrentGPS = () => {
  if (!navigator.geolocation) {
    showToast("متصفحك لا يدعم تحديد الموقع الجغرافي", "error");
    return;
  }
  showToast("جاري التقاط إحداثيات موقعك عبر الأقمار الصناعية...", "info");
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const url = `https://maps.google.com/?q=${lat},${lng}`;
      const input = document.getElementById("cust-gps-url");
      if (input) input.value = url;
      _currentCustomerData.googleMapsUrl = url;
      showToast("✅ تم التقاط الموقع بنجاح!", "success");
    },
    err => {
      console.warn("GPS error:", err);
      showToast("تعذر التقاط الموقع. يرجى تفعيل إذن الـ GPS في الجوال.", "error");
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
};

/**
 * Trigger file upload input
 */
window.triggerFileInput = (docId) => {
  const el = document.getElementById(`input-file-${docId}`);
  if (el) el.click();
};

/**
 * Handle attachment upload & compress image
 */
window.handleAttachmentUpload = (docId, input) => {
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const rawData = e.target.result;
    
    // If image, compress it to keep Firestore documents lean and fast
    if (file.type.startsWith("image/")) {
      compressImage(rawData, 1200, 0.75, (compressed) => {
        _attachmentsState[docId] = {
          docId,
          fileName: file.name,
          type: file.type,
          dataUrl: compressed,
          uploadedAt: new Date().toISOString()
        };
        showToast(`تم إرفاق: ${file.name}`, "success");
        renderModalHTML();
      });
    } else {
      _attachmentsState[docId] = {
        docId,
        fileName: file.name,
        type: file.type,
        dataUrl: rawData,
        uploadedAt: new Date().toISOString()
      };
      showToast(`تم إرفاق: ${file.name}`, "success");
      renderModalHTML();
    }
  };
  reader.readAsDataURL(file);
};

/**
 * Compress image helper
 */
function compressImage(src, maxWidth, quality, callback) {
  const img = new Image();
  img.onload = () => {
    let width = img.width;
    let height = img.height;
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    callback(canvas.toDataURL("image/jpeg", quality));
  };
  img.src = src;
}

/**
 * Remove attachment
 */
window.removeAttachment = (docId) => {
  _attachmentsState[docId] = null;
  renderModalHTML();
  showToast("تم حذف المرفق", "info");
};

/**
 * Setup Digital Signature Pad
 */
function initSignaturePad() {
  _sigCanvas = document.getElementById("sig-pad-canvas");
  if (!_sigCanvas) return;

  _sigCtx = _sigCanvas.getContext("2d");
  const rect = _sigCanvas.getBoundingClientRect();
  _sigCanvas.width = rect.width || 600;
  _sigCanvas.height = 160;

  _sigCtx.lineWidth = 2.5;
  _sigCtx.lineCap = "round";
  _sigCtx.lineJoin = "round";
  _sigCtx.strokeStyle = "#004d80";

  // If previous signature exists, restore it
  if (_currentCustomerData.signatureDataUrl) {
    const img = new Image();
    img.onload = () => _sigCtx.drawImage(img, 0, 0);
    img.src = _currentCustomerData.signatureDataUrl;
  }

  // Pointer events (Mobile Touch + Mouse)
  const getPos = (e) => {
    const r = _sigCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - r.left) * (_sigCanvas.width / r.width),
      y: (clientY - r.top) * (_sigCanvas.height / r.height)
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    _isDrawing = true;
    const pos = getPos(e);
    _sigCtx.beginPath();
    _sigCtx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!_isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    _sigCtx.lineTo(pos.x, pos.y);
    _sigCtx.stroke();
  };

  const stopDraw = () => {
    if (_isDrawing) {
      _isDrawing = false;
      _sigCtx.closePath();
      _currentCustomerData.signatureDataUrl = _sigCanvas.toDataURL("image/png");
    }
  };

  _sigCanvas.addEventListener("mousedown", startDraw);
  _sigCanvas.addEventListener("mousemove", draw);
  window.addEventListener("mouseup", stopDraw);

  _sigCanvas.addEventListener("touchstart", startDraw, { passive: false });
  _sigCanvas.addEventListener("touchmove", draw, { passive: false });
  _sigCanvas.addEventListener("touchend", stopDraw);
}

/**
 * Clear Signature
 */
window.clearSignature = () => {
  if (_sigCanvas && _sigCtx) {
    _sigCtx.clearRect(0, 0, _sigCanvas.width, _sigCanvas.height);
    _currentCustomerData.signatureDataUrl = "";
  }
};

function _isCanvasBlank(canvas) {
  const context = canvas.getContext('2d');
  const pixelBuffer = new Uint32Array(
    context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
  );
  return !pixelBuffer.some(color => color !== 0);
}

/**
 * Close Modal
 */
window.closeModal = () => {
  const overlay = document.getElementById("sales-mgr-modal-overlay");
  if (overlay) overlay.remove();
};

/**
 * Save Customer to System (Firestore)
 */
window.saveCustomerToSystem = async () => {
  saveCurrentFormValues();

  if (!_currentCustomerData.name) {
    showToast("يرجى إدخال اسم المنشأة التجاري أولاً", "error");
    window.switchStep(1);
    return;
  }

  if (!_currentCustomerData.phone) {
    showToast("يرجى إدخال رقم جوال للتواصل", "error");
    window.switchStep(1);
    return;
  }

  const btn = document.getElementById("btn-save-customer");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>⏳ جاري الحفظ وتوثيق الاتفاقية...</span>`;
  }

  try {
    // Collect non-empty attachments
    const attachmentsList = [];
    Object.values(_attachmentsState).forEach(a => {
      if (a && a.dataUrl) {
        attachmentsList.push(a);
      }
    });

    const docId = _currentCustomerData.id || "cust_" + Date.now();
    const custDocRef = doc(db, `companies/${COMPANY_ID}/customers`, docId);

    const payload = {
      name: _currentCustomerData.name,
      code: _currentCustomerData.code || ("02" + Math.floor(100 + Math.random() * 900)),
      legalForm: _currentCustomerData.legalForm || "مؤسسة فردية",
      activityType: _currentCustomerData.activityType || "",
      crNumber: _currentCustomerData.crNumber || "",
      crDate: _currentCustomerData.crDate || "",
      crSource: _currentCustomerData.crSource || "",
      vatNumber: _currentCustomerData.vatNumber || "",
      phone: _currentCustomerData.phone || "",
      mobile: _currentCustomerData.phone || "",
      email: _currentCustomerData.email || "",
      city: _currentCustomerData.city || "ينبع",
      district: _currentCustomerData.district || "",
      street: _currentCustomerData.street || "",
      postalCode: _currentCustomerData.postalCode || "",
      address: `${_currentCustomerData.city || 'ينبع'} - ${_currentCustomerData.district || ''} - ${_currentCustomerData.street || ''}`.trim(),
      googleMapsUrl: _currentCustomerData.googleMapsUrl || "",
      repId: _currentCustomerData.repId || "",
      repName: _currentCustomerData.repName || "",
      assignedRepId: _currentCustomerData.repId || "",
      creditLimit: _currentCustomerData.creditLimit || 0,
      creditDays: _currentCustomerData.creditDays || 30,
      paymentMethod: _currentCustomerData.paymentMethod || "credit",
      signatoryRole: _currentCustomerData.signatoryRole || "مالك المنشأة",
      ownerName: _currentCustomerData.ownerName || "",
      ownerId: _currentCustomerData.ownerId || "",
      ownerPhone: _currentCustomerData.ownerPhone || "",
      purchaserName: _currentCustomerData.purchaserName || "",
      purchaserPhone: _currentCustomerData.purchaserPhone || "",
      receiverName: _currentCustomerData.receiverName || "",
      receiverPhone: _currentCustomerData.receiverPhone || "",
      signatureDataUrl: _currentCustomerData.signatureDataUrl || "",
      attachments: attachmentsList,
      hasAgreement: true,
      approvalStatus: "pending",
      status: "pending_approval",
      source: "sales_manager_portal",
      balance: 0,
      currentBalance: 0,
      priceList: "default",
      updatedAt: serverTimestamp(),
      createdAt: _currentCustomerData.createdAt || serverTimestamp()
    };

    await setDoc(custDocRef, payload, { merge: true });

    showToast("✅ تم حفظ العميل والاتفاقية والمستندات بنجاح!", "success");
    window.closeModal();
    await loadCustomers();
  } catch (err) {
    console.error("Save error:", err);
    showToast("حدث خطأ أثناء حفظ العميل: " + err.message, "error");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "💾 حفظ العميل واعتماد الاتفاقية";
    }
  }
};

/**
 * Preview and Print Legal Agreement A4
 */
window.previewAndPrintAgreement = () => {
  saveCurrentFormValues();
  printLegalAgreementA4(_currentCustomerData);
};

window.printAgreementForCustomer = (customerId) => {
  const c = _allCustomers.find(x => x.id === customerId);
  if (!c) {
    showToast("لم يتم العثور على بيانات العميل", "error");
    return;
  }
  printLegalAgreementA4(c);
};

/**
 * Open Customer Details & Attachments Modal
 */
window.openCustomerDetailsModal = (customerId) => {
  const c = _allCustomers.find(x => x.id === customerId);
  if (!c) return;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "cust-details-overlay";

  const attachments = Array.isArray(c.attachments) ? c.attachments : [];

  overlay.innerHTML = `
    <div class="modal-window" style="max-width:680px;">
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span>📂</span>
          <h3>ملف العميل والمستندات — ${c.name}</h3>
        </div>
        <button class="modal-close-btn" onclick="document.getElementById('cust-details-overlay').remove()">✕</button>
      </div>
      <div class="modal-body">
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px; margin-bottom:14px; font-size:12.5px;">
          <div>🏢 المنشأة: <strong>${c.name}</strong> (${c.code || '—'})</div>
          <div>📜 السجل التجاري: <strong style="font-family:monospace;">${c.crNumber || 'غير مدون'}</strong> &nbsp;|&nbsp; الضريبة: <strong style="font-family:monospace;">${c.vatNumber || 'غير مدون'}</strong></div>
          <div>📞 الجوال: <strong style="font-family:monospace;">${c.phone || c.mobile || '—'}</strong> &nbsp;|&nbsp; المندوب: <strong>${c.repName || '—'}</strong></div>
          <div>💳 التسهيلات: <strong>${formatCurrency(c.creditLimit)}</strong> (${c.creditDays || 30} يوماً)</div>
          ${c.googleMapsUrl ? `<div style="margin-top:4px;"><a href="${c.googleMapsUrl}" target="_blank" style="color:#0284c7; font-weight:bold;">📍 فتح الموقع على خرائط جوجل</a></div>` : ''}
        </div>

        <h4 style="font-size:13px; font-weight:800; margin-bottom:10px; color:#004d80;">المستندات القانونية المرفقة (${attachments.length}):</h4>
        ${attachments.length === 0 ? `
          <div style="text-align:center; padding:24px; color:var(--text-muted); border:1px dashed #cbd5e1; border-radius:8px;">لا توجد مستندات مرفقة لهذا العميل</div>
        ` : `
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:10px;">
            ${attachments.map(a => `
              <div style="border:1px solid #cbd5e1; border-radius:8px; padding:8px; background:#fff; text-align:center;">
                <div style="font-size:11.5px; font-weight:800; color:#0f172a; margin-bottom:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${a.fileName || a.docId || 'مستند'}</div>
                ${a.dataUrl?.startsWith('data:image') ? `
                  <a href="${a.dataUrl}" target="_blank">
                    <img src="${a.dataUrl}" style="width:100%; height:90px; object-fit:cover; border-radius:6px;" />
                  </a>
                ` : `
                  <a href="${a.dataUrl}" target="_blank" class="btn btn-secondary btn-sm" style="font-size:11px;">عرض الملف 📄</a>
                `}
              </div>
            `).join('')}
          </div>
        `}

        ${c.signatureDataUrl ? `
          <div style="margin-top:14px; padding:10px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px;">
            <div style="font-size:12px; font-weight:800; color:#004d80; margin-bottom:4px;">توقيع العميل المعتمد:</div>
            <img src="${c.signatureDataUrl}" style="max-height:60px; background:#fff; padding:4px; border:1px solid #cbd5e1; border-radius:6px;" />
          </div>
        ` : ''}
      </div>
      <div class="modal-footer" style="flex-wrap:wrap; gap:8px;">
        <button class="btn btn-secondary" onclick="document.getElementById('cust-details-overlay').remove()">إغلاق</button>
        <button class="btn btn-secondary" onclick="window.downloadCustomerAttachmentsLocal('${c.id}')" style="color:#059669; border-color:#86efac; font-weight:800;">
          📥 تنزيل حزمة المستندات محلياً
        </button>
        <button class="btn btn-primary" onclick="window.printAgreementForCustomer('${c.id}')">🖨️ طباعة الاتفاقية القانونية</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
};

/**
 * Generate & Print Exact Legally Binding Agreement (A4 Single Page)
 */
function printLegalAgreementA4(d) {
  printMasterCustomerAgreement(d, _company);
}

/**
 * Global Event Listeners
 */
function setupEventListeners() {
  const searchInput = document.getElementById("search-clients-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => window.filterClients(e.target.value));
  }
}

// ============================================================
// 1. Credit Limit Calculator & 100-Point Risk Scoring Engine
// ============================================================

/**
 * Live Recalculate Credit Limit Requirement Formula
 * الاحتياج الائتماني = (متوسط المسحوبات الشهرية ÷ 30) × أيام الائتمان × معامل الذروة
 */
window.recalcCreditLimitFormula = () => {
  const monthly = parseFloat(document.getElementById("calc-monthly-spend")?.value) || 0;
  const days = parseFloat(document.getElementById("calc-credit-days")?.value) || 14;
  const peak = parseFloat(document.getElementById("calc-peak-factor")?.value) || 1.2;

  const result = Math.round((monthly / 30) * days * peak);
  const display = document.getElementById("calc-result-display");
  if (display) {
    display.textContent = formatCurrency(result);
  }
};

/**
 * Apply Calculated Credit Limit to the main Customer Form
 */
window.applyCalculatedCreditLimit = () => {
  const monthly = parseFloat(document.getElementById("calc-monthly-spend")?.value) || 0;
  const days = parseFloat(document.getElementById("calc-credit-days")?.value) || 14;
  const peak = parseFloat(document.getElementById("calc-peak-factor")?.value) || 1.2;

  const result = Math.round((monthly / 30) * days * peak);
  if (result <= 0) {
    showToast("يرجى إدخال متوسط المسحوبات الشهرية أولاً", "error");
    return;
  }

  const limitInput = document.getElementById("cust-credit-limit");
  if (limitInput) limitInput.value = result;

  const daysSelect = document.getElementById("cust-credit-days");
  if (daysSelect) daysSelect.value = String(days);

  showToast(`تم اعتماد حد ائتماني (${formatCurrency(result)}) وسماح (${days}) يوماً في الاتفاقية!`, "success");
};

/**
 * Recalculate 100-Point Risk Scoring Engine
 */
window.recalcScoringEngine = () => {
  const ids = ["score-regularity", "score-liquidity", "score-site", "score-docs", "score-guarantee"];
  let totalScore = 0;
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.checked) {
      totalScore += parseInt(el.value, 10) || 0;
    }
  });

  const badge = document.getElementById("scoring-total-badge");
  const recBox = document.getElementById("scoring-recommendation-box");

  if (badge) {
    badge.textContent = `${totalScore} / 100 نقطة`;
    if (totalScore >= 80) {
      badge.style.color = "#059669";
      badge.style.borderColor = "#a7f3d0";
    } else if (totalScore >= 60) {
      badge.style.color = "#d97706";
      badge.style.borderColor = "#fde68a";
    } else {
      badge.style.color = "#dc2626";
      badge.style.borderColor = "#fca5a5";
    }
  }

  if (recBox) {
    if (totalScore >= 80) {
      recBox.style.background = "#ecfdf5";
      recBox.style.borderColor = "#a7f3d0";
      recBox.style.color = "#065f46";
      recBox.innerHTML = `<strong>🟢 تصنيف ائتماني ممتاز (سقف مخاطر منخفض):</strong> مؤهل لمنح تسهيلات 14–30 يوماً بحد ائتماني كامل وسحب معتمد.`;
    } else if (totalScore >= 60) {
      recBox.style.background = "#fffbeb";
      recBox.style.borderColor = "#fde68a";
      recBox.style.color = "#92400e";
      recBox.innerHTML = `<strong>🟡 تصنيف ائتماني متوسط (سقف مخاطر معتدل):</strong> ينصح بفترة سماح 7–14 يوماً مع اشتراط سند لأمر نافذ معتمد.`;
    } else {
      recBox.style.background = "#fef2f2";
      recBox.style.borderColor = "#fca5a5";
      recBox.style.color = "#991b1b";
      recBox.innerHTML = `<strong>🔴 تصنيف ائتماني مقيد (سقف مخاطر عالي):</strong> ينصح بالتعامل النقدي الفوري أو دفعات مقدمة لأول 3–5 تعاملات.`;
    }
  }
};

// ============================================================
// 2. Local Document Bulk Downloader (تنزيل المستندات محلياً على الجهاز)
// ============================================================

/**
 * Download Customer KYC Documents Locally to User's Machine (PC / Phone)
 * يقوم بتنزيل ملفات العميل مباشرة لمجلد التنزيلات على الكمبيوتر لتخفيف الضغط على السيرفر
 */
window.downloadCustomerAttachmentsLocal = (customerId) => {
  const c = _allCustomers.find(item => item.id === customerId);
  if (!c) return;

  const attachments = Array.isArray(c.attachments) ? c.attachments : [];
  if (attachments.length === 0) {
    showToast("لا توجد مستندات قانونية مرفقة لهذا العميل حتى الآن.", "info");
    return;
  }

  const safeClientCode = c.code || "CUST";
  const safeClientName = (c.name || "عميل").replace(/[/\\?%*:|"<>]/g, "_").trim();

  let count = 0;
  attachments.forEach((a, idx) => {
    if (!a.dataUrl) return;
    try {
      const link = document.createElement("a");
      link.href = a.dataUrl;
      const ext = a.type?.includes("pdf") ? "pdf" : (a.type?.includes("png") ? "png" : "jpg");
      const docLabel = (a.fileName || a.docId || `مستند_${idx + 1}`).replace(/[/\\?%*:|"<>]/g, "_");
      link.download = `${safeClientCode}_${safeClientName}_${docLabel}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      count++;
    } catch (e) {
      console.warn("Local download failed for doc:", e);
    }
  });

  showToast(`✅ تم تنزيل (${count}) مستند محلياً إلى مجلد التنزيلات بجهازك.`, "success");
};

// ============================================================
// 3. Delivery Notes (سندات تسليم البضاعة وإثبات الاستلام الميداني)
// ============================================================

/**
 * Open Delivery Note Modal for Customer
 */
window.openDeliveryNoteModal = (customerId) => {
  const c = _allCustomers.find(item => item.id === customerId);
  if (!c) return;

  _dnLines = [];
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "dn-modal-overlay";

  const whOptions = _warehouses.length > 0
    ? _warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join("")
    : `<option value="main">المستودع الرئيسي</option>`;

  const prodOptions = _products.slice(0, 100).map(p =>
    `<option value="${p.id}" data-name="${p.name}" data-sku="${p.sku}" data-unit="${p.unit}">${p.sku ? `[${p.sku}] ` : ""}${p.name}</option>`
  ).join("");

  const today = new Date().toISOString().split("T")[0];

  overlay.innerHTML = `
    <div class="modal-window" style="max-width:760px;">
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span>🚚</span>
          <div>
            <h3 style="font-size:15px; margin:0;">إصدار سند تسليم بضاعة (إذن تسليم مبيعات رسمي)</h3>
            <span style="font-size:11px; opacity:0.85;">العميل: ${c.name} (${c.code || '—'})</span>
          </div>
        </div>
        <button class="modal-close-btn" onclick="document.getElementById('dn-modal-overlay').remove()">✕</button>
      </div>

      <div class="modal-body">
        <!-- تنبيه أمان المخزون وعدم الخصم إلا بعد الفاتورة -->
        <div style="background:#f0fdf4; border:1.5px solid #86efac; border-radius:10px; padding:10px 14px; margin-bottom:12px; display:flex; align-items:center; gap:10px;">
          <span style="font-size:22px;">🛡️</span>
          <div style="font-size:11.5px; color:#166534; font-weight:700; line-height:1.45;">
            <strong>ضمان أمان المخزون:</strong> سند التسليم وثيقة إثبات استلام ميدانية فقط، 
            <u style="color:#15803d; font-weight:900;">ولا يخصم أي كميات من رصيد المستودع إطلاقاً</u>. 
            يتم خصم المخزن والتأثير المالي فقط عند تحويل السند إلى فاتورة مبيعات معتمدة.
          </div>
        </div>

        <!-- بيانات التسليم الأساسية -->
        <div class="form-grid" style="margin-bottom:12px;">
          <div class="form-group">
            <label class="form-label">مستودع الصرف / سيارة المندوب <span class="req">*</span></label>
            <select id="dn-warehouse" class="form-input">
              ${whOptions}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">تاريخ التسليم الفعلي <span class="req">*</span></label>
            <input type="date" id="dn-date" class="form-input mono" value="${today}" />
          </div>
          <div class="form-group">
            <label class="form-label">رقم أمر الشراء / المرجع (PO)</label>
            <input type="text" id="dn-po-ref" class="form-input mono" placeholder="أمر شراء العميل إن وجد" />
          </div>
        </div>

        <div class="form-grid" style="margin-bottom:14px;">
          <div class="form-group">
            <label class="form-label">المندوب / السائق الناقل</label>
            <input type="text" id="dn-driver" class="form-input" value="${c.repName || ''}" placeholder="اسم الناقل" />
          </div>
          <div class="form-group">
            <label class="form-label">اسم المستلم الميداني المفوض <span class="req">*</span></label>
            <input type="text" id="dn-receiver-name" class="form-input" value="${c.receiverName || ''}" placeholder="اسم المستلم الفعلي بالمحل/المستودع" required />
          </div>
          <div class="form-group">
            <label class="form-label">رقم جوال المستلم</label>
            <input type="tel" id="dn-receiver-phone" class="form-input mono" value="${c.receiverPhone || ''}" placeholder="05xxxxxxxx" />
          </div>
        </div>

        <!-- إضافة أصناف البضاعة والبحث السريع -->
        <div class="dn-product-picker" style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:12px; padding:12px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:13px; font-weight:900; color:#004d80;">📦 إضافة أصناف البضاعة المسلّمة:</span>
            <span id="dn-prod-count-badge" style="font-size:11px; color:#475569; font-weight:700;">(إجمالي الأصناف بالمستودع: ${_products.length})</span>
          </div>

          <!-- شريط البحث الفوري بالاسم أو الكود أو الباركود -->
          <div style="position:relative; margin-bottom:10px;">
            <label class="form-label" style="font-size:11px; font-weight:800; color:#004d80; margin-bottom:4px;">
              🔍 البحث السريع عن الصنف (بالاسم، الكود SKU، أو الباركود):
            </label>
            <div style="position:relative;">
              <input type="text" id="dn-prod-search" class="form-input" 
                placeholder="اكتب اسم الصنف للبحث الفوري (مثال: بيض، سكر، زيت...) أو أدخل الكود..." 
                autocomplete="off" 
                oninput="window.filterDnProducts(this.value)"
                onkeydown="if(event.key==='Enter'){event.preventDefault(); window.selectFirstDnProduct();}"
                style="padding-right:34px; font-size:13px; font-weight:700; border:2px solid #0284c7; background:#ffffff; box-shadow:0 1px 3px rgba(2,132,199,0.12);" />
              <span style="position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:15px; pointer-events:none;">🔎</span>
            </div>
            <!-- قائمة اقتراحات البحث السريعة المنسدلة -->
            <div id="dn-prod-suggestions" style="display:none; position:absolute; top:100%; right:0; left:0; z-index:1000; background:#fff; border:2px solid #0284c7; border-top:none; border-radius:0 0 10px 10px; box-shadow:0 12px 30px rgba(0,0,0,0.18); max-height:220px; overflow-y:auto;"></div>
          </div>

          <div style="display:grid; grid-template-columns: 2.3fr 1fr auto; gap:8px; align-items:flex-end;">
            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-size:11px;">الصنف المختار:</label>
              <select id="dn-prod-select" class="form-input" onchange="window.onDnProductSelected()">
                <option value="">-- اختر الصنف من القائمة أو بالبحث أعلاه --</option>
                ${prodOptions}
              </select>
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-size:11px;">الكمية المسلّمة:</label>
              <input type="number" id="dn-prod-qty" class="form-input mono" value="1" min="0.1" step="any" onkeydown="if(event.key==='Enter'){event.preventDefault(); window.addDeliveryNoteLine();}" />
            </div>
            <button type="button" class="btn btn-primary btn-sm" onclick="window.addDeliveryNoteLine()" style="height:38px; padding:0 16px; font-weight:800; background:linear-gradient(135deg, #0284c7, #004d80);">
              ➕ إضافة للسند
            </button>
          </div>

          <!-- جدول الأصناف المضافة -->
          <div style="overflow-x:auto; margin-top:10px;">
            <table class="dn-lines-table">
              <thead>
                <tr>
                  <th style="width:30px;">#</th>
                  <th>اسم الصنف</th>
                  <th style="width:80px;">الكمية</th>
                  <th style="width:80px;">الوحدة</th>
                  <th style="width:50px;">حذف</th>
                </tr>
              </thead>
              <tbody id="dn-lines-tbody">
                <tr><td colspan="5" style="text-align:center; color:#94a3b8; padding:16px;">لم يتم إضافة أصناف بعد، يرجى اختيار الصنف والكمية والضغط على «إضافة»</td></tr>
              </tbody>
            </table>
          </div>
          <div style="text-align:left; font-size:12px; font-weight:800; color:#004d80; margin-top:8px;">
            إجمالي عدد القطع / الطرود: <span id="dn-total-qty" class="mono" style="font-size:14px; color:#059669;">0</span>
          </div>
        </div>

        <!-- إقرار وتعهد الاستلام النظامي -->
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:10px 12px; margin-bottom:12px;">
          <div style="font-size:11.5px; font-weight:700; color:#1e3a8a; line-height:1.5;">
            ⚖️ <strong>إقرار وتعهد الاستلام النظامي:</strong> يقر المستلم المذكور أعلاه باستلام البضائع المبينة في هذا السند كاملة وبحالة جيدة ومطابقة للمواصفات والأوزان، ويعتبر التوقيع أو الختم أدناه حجة قطعية باتة بالاستلام وإثبات واقعة التسليم وفق نظام الإثبات ونظام المحاكم التجارية السعودي.
          </div>
        </div>

        <!-- Signature Pad for Receiver -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label class="form-label" style="font-size:12px; font-weight:800; color:#0f172a; margin:0;">
              ✍️ توقيع المستلم الميداني الحي على شاشة الجوال / الكمبيوتر:
            </label>
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.clearDnSignature()" style="font-size:10.5px; padding:3px 8px;">
              مسح التوقيع 🔄
            </button>
          </div>
          <canvas id="dn-sig-canvas" class="sig-canvas" style="height:120px;"></canvas>
        </div>
      </div>

      <div class="modal-footer" style="flex-wrap:wrap; gap:8px;">
        <button class="btn btn-secondary" onclick="document.getElementById('dn-modal-overlay').remove()">إلغاء</button>
        <button class="btn btn-primary" onclick="window.saveAndPrintDeliveryNote('${c.id}')" style="background:linear-gradient(135deg, #0284c7, #0369a1); font-weight:800;">
          💾 حفظ وإصدار سند التسليم (A4) 🖨️
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  setTimeout(initDnSignaturePad, 100);
};

/**
 * Setup Delivery Note Touch Signature Pad
 */
function initDnSignaturePad() {
  _dnSigCanvas = document.getElementById("dn-sig-canvas");
  if (!_dnSigCanvas) return;

  const rect = _dnSigCanvas.getBoundingClientRect();
  _dnSigCanvas.width = rect.width || 600;
  _dnSigCanvas.height = rect.height || 120;
  _dnSigCtx = _dnSigCanvas.getContext("2d");
  _dnSigCtx.strokeStyle = "#1e3a8a";
  _dnSigCtx.lineWidth = 2.5;
  _dnSigCtx.lineCap = "round";
  _dnSigCtx.lineJoin = "round";

  const getPos = (e) => {
    const r = _dnSigCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - r.left, y: clientY - r.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    _isDnDrawing = true;
    const pos = getPos(e);
    _dnSigCtx.beginPath();
    _dnSigCtx.moveTo(pos.x, pos.y);
  };

  const moveDraw = (e) => {
    if (!_isDnDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    _dnSigCtx.lineTo(pos.x, pos.y);
    _dnSigCtx.stroke();
  };

  const endDraw = () => { _isDnDrawing = false; };

  _dnSigCanvas.addEventListener("mousedown", startDraw);
  _dnSigCanvas.addEventListener("mousemove", moveDraw);
  _dnSigCanvas.addEventListener("mouseup", endDraw);
  _dnSigCanvas.addEventListener("mouseleave", endDraw);

  _dnSigCanvas.addEventListener("touchstart", startDraw, { passive: false });
  _dnSigCanvas.addEventListener("touchmove", moveDraw, { passive: false });
  _dnSigCanvas.addEventListener("touchend", endDraw);
}

/**
 * Clear Delivery Note Signature
 */
window.clearDnSignature = () => {
  if (_dnSigCtx && _dnSigCanvas) {
    _dnSigCtx.clearRect(0, 0, _dnSigCanvas.width, _dnSigCanvas.height);
  }
};

/**
 * Filter Delivery Note Products by Search Query
 */
window.filterDnProducts = (query) => {
  const q = (query || "").trim().toLowerCase();
  const select = document.getElementById("dn-prod-select");
  const suggestionsBox = document.getElementById("dn-prod-suggestions");
  if (!select) return;

  const matched = _products.filter(p => {
    if (!q) return true;
    const n = (p.name || "").toLowerCase();
    const s = (p.sku || "").toLowerCase();
    const b = (p.barcode || "").toLowerCase();
    return n.includes(q) || s.includes(q) || b.includes(q);
  });

  // تحديث قائمة الاختيار (بحد أقصى 150 صنف لتفادي ثقل المتصفح)
  const limited = matched.slice(0, 150);
  select.innerHTML = `
    <option value="">-- ${matched.length === 0 ? "لا يوجد أصناف مطابقة" : "اختر الصنف (" + matched.length + " متاح)"} --</option>
    ${limited.map(p => `
      <option value="${p.id}" data-name="${p.name}" data-sku="${p.sku}" data-unit="${p.unit || 'حبة'}">
        ${p.sku ? `[${p.sku}] ` : ""}${p.name}
      </option>
    `).join("")}
  `;

  // إظهار صندوق الاقتراحات السريعة
  if (suggestionsBox) {
    if (q.length > 0 && matched.length > 0) {
      suggestionsBox.style.display = "block";
      suggestionsBox.innerHTML = matched.slice(0, 10).map((p, idx) => `
        <div class="dn-sugg-item" onclick="window.selectDnProductFromSuggestion('${p.id}')" 
             style="padding:9px 12px; border-bottom:1px solid #f1f5f9; cursor:pointer; display:flex; justify-content:space-between; align-items:center; ${idx === 0 ? 'background:#eff6ff;' : ''}">
          <div>
            <strong style="color:#004d80; font-size:12.5px;">${p.name}</strong>
            ${p.sku ? `<span style="font-family:monospace; font-size:11px; color:#64748b; margin-right:6px;">كود: ${p.sku}</span>` : ''}
          </div>
          <span style="font-size:11px; background:#e0f2fe; color:#0284c7; padding:2px 8px; border-radius:10px; font-weight:700;">${p.unit || 'حبة'}</span>
        </div>
      `).join("");
    } else {
      suggestionsBox.style.display = "none";
      suggestionsBox.innerHTML = "";
    }
  }

  // إذا كانت نتيجة واحدة فقط، اختيارها تلقائياً
  if (matched.length === 1) {
    select.value = matched[0].id;
  }
};

/**
 * Select Product from Suggestion Dropdown
 */
window.selectDnProductFromSuggestion = (prodId) => {
  const select = document.getElementById("dn-prod-select");
  const suggestionsBox = document.getElementById("dn-prod-suggestions");
  const searchInput = document.getElementById("dn-prod-search");
  const qtyInput = document.getElementById("dn-prod-qty");

  const p = _products.find(x => x.id === prodId);
  if (p && select) {
    if (!select.querySelector(`option[value="${p.id}"]`)) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.setAttribute("data-name", p.name);
      opt.setAttribute("data-sku", p.sku);
      opt.setAttribute("data-unit", p.unit || "حبة");
      opt.textContent = `${p.sku ? `[${p.sku}] ` : ""}${p.name}`;
      select.appendChild(opt);
    }
    select.value = p.id;
    if (searchInput) searchInput.value = p.name;
    if (suggestionsBox) {
      suggestionsBox.style.display = "none";
      suggestionsBox.innerHTML = "";
    }
    if (qtyInput) {
      qtyInput.focus();
      qtyInput.select();
    }
  }
};

/**
 * Select First Filtered Product on Enter
 */
window.selectFirstDnProduct = () => {
  const select = document.getElementById("dn-prod-select");
  if (select && select.options.length > 1) {
    select.selectedIndex = 1;
    const suggestionsBox = document.getElementById("dn-prod-suggestions");
    if (suggestionsBox) suggestionsBox.style.display = "none";
    const qtyInput = document.getElementById("dn-prod-qty");
    if (qtyInput) {
      qtyInput.focus();
      qtyInput.select();
    }
  }
};

/**
 * Handle manual select change
 */
window.onDnProductSelected = () => {
  const suggestionsBox = document.getElementById("dn-prod-suggestions");
  if (suggestionsBox) suggestionsBox.style.display = "none";
  const qtyInput = document.getElementById("dn-prod-qty");
  if (qtyInput) {
    qtyInput.focus();
    qtyInput.select();
  }
};

// إغلاق قائمة اقتراحات الأصناف عند النقر خارجها
if (typeof document !== "undefined") {
  document.addEventListener("click", (e) => {
    const suggestionsBox = document.getElementById("dn-prod-suggestions");
    if (suggestionsBox && !e.target.closest("#dn-prod-suggestions") && e.target.id !== "dn-prod-search") {
      suggestionsBox.style.display = "none";
    }
  });
}

/**
 * Add Line Item to Delivery Note
 */
window.addDeliveryNoteLine = () => {
  const sel = document.getElementById("dn-prod-select");
  const qtyInput = document.getElementById("dn-prod-qty");
  if (!sel || !qtyInput) return;

  const prodId = sel.value;
  const qty = parseFloat(qtyInput.value) || 0;
  if (!prodId || qty <= 0) {
    showToast("يرجى اختيار الصنف وإدخال كمية صحيحة", "error");
    return;
  }

  const opt = sel.options[sel.selectedIndex];
  const prodName = opt.getAttribute("data-name") || opt.text;
  const prodSku = opt.getAttribute("data-sku") || "";
  const prodUnit = opt.getAttribute("data-unit") || "حبة";

  _dnLines.push({
    productId: prodId,
    productName: prodName,
    sku: prodSku,
    qty,
    unit: prodUnit
  });

  renderDnLinesTable();
  qtyInput.value = "1";

  // إعادة تركيز وتفريغ البحث لإضافة الصنف التالي بسرعة
  const searchInput = document.getElementById("dn-prod-search");
  if (searchInput) {
    searchInput.value = "";
    searchInput.focus();
  }
  const suggestionsBox = document.getElementById("dn-prod-suggestions");
  if (suggestionsBox) {
    suggestionsBox.style.display = "none";
    suggestionsBox.innerHTML = "";
  }
  window.filterDnProducts("");
};

/**
 * Remove Line Item from Delivery Note
 */
window.removeDeliveryNoteLine = (idx) => {
  _dnLines.splice(idx, 1);
  renderDnLinesTable();
};

/**
 * Render Delivery Note Lines Table
 */
function renderDnLinesTable() {
  const tbody = document.getElementById("dn-lines-tbody");
  const totalSpan = document.getElementById("dn-total-qty");
  if (!tbody) return;

  if (_dnLines.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94a3b8; padding:16px;">لم يتم إضافة أصناف بعد، يرجى اختيار الصنف والكمية والضغط على «إضافة»</td></tr>`;
    if (totalSpan) totalSpan.textContent = "0";
    return;
  }

  let totalQty = 0;
  tbody.innerHTML = _dnLines.map((line, idx) => {
    totalQty += line.qty;
    return `
      <tr>
        <td class="mono" style="font-weight:700;">${idx + 1}</td>
        <td style="font-weight:700; color:#0f172a;">${line.sku ? `[${line.sku}] ` : ""}${line.productName}</td>
        <td class="mono" style="font-weight:800; color:#004d80;">${line.qty}</td>
        <td>${line.unit}</td>
        <td>
          <button type="button" onclick="window.removeDeliveryNoteLine(${idx})" style="background:#fee2e2; color:#dc2626; border:none; padding:2px 6px; border-radius:4px; font-size:11px; cursor:pointer;">✕</button>
        </td>
      </tr>
    `;
  }).join("");

  if (totalSpan) totalSpan.textContent = totalQty.toLocaleString("en-US");
}

/**
 * Save and Print Delivery Note
 */
window.saveAndPrintDeliveryNote = async (customerId) => {
  const c = _allCustomers.find(item => item.id === customerId);
  if (!c) return;

  if (_dnLines.length === 0) {
    showToast("يرجى إضافة صنف واحد على الأقل في سند التسليم", "error");
    return;
  }

  const receiverName = document.getElementById("dn-receiver-name")?.value.trim();
  if (!receiverName) {
    showToast("يرجى إدخال اسم المستلم الميداني المفوض", "error");
    document.getElementById("dn-receiver-name")?.focus();
    return;
  }

  const whSelect = document.getElementById("dn-warehouse");
  const whId = whSelect?.value || "main";
  const whName = whSelect?.options[whSelect.selectedIndex]?.text || "المستودع الرئيسي";
  const deliveryDate = document.getElementById("dn-date")?.value || new Date().toISOString().split("T")[0];
  const poRef = document.getElementById("dn-po-ref")?.value.trim() || "";
  const driverName = document.getElementById("dn-driver")?.value.trim() || c.repName || "";
  const receiverPhone = document.getElementById("dn-receiver-phone")?.value.trim() || "";

  // Signature
  let sigUrl = null;
  if (_dnSigCanvas && !_isCanvasBlank(_dnSigCanvas)) {
    sigUrl = _dnSigCanvas.toDataURL("image/png");
  }

  const dnDocNumber = `DN-${Date.now().toString().slice(-6)}`;
  const totalQty = _dnLines.reduce((s, l) => s + l.qty, 0);

  const dnData = {
    number: dnDocNumber,
    date: deliveryDate,
    customerId: c.id,
    customerName: c.name,
    customerCode: c.code || "",
    customerPhone: c.phone || c.mobile || "",
    customerAddress: `${c.city || 'ينبع'} ${c.district ? ' - ' + c.district : ''}`,
    warehouseId: whId,
    warehouseName: whName,
    driverName,
    receiverName,
    receiverPhone,
    poNumber: poRef,
    lines: _dnLines,
    totalQty,
    receiverSignature: sigUrl,
    status: "delivered",
    inventoryDeducted: false,
    invoiceStatus: "pending_invoice",
    note: "سند تسليم بضاعة ميداني — لا يخصم المخزن إلا بعد اعتماد الفاتورة",
    createdAt: new Date().toISOString()
  };

  try {
    await addDoc(collection(db, `companies/${COMPANY_ID}/deliveryNotes`), dnData);
    showToast(`✅ تم حفظ سند التسليم بنجاح برقم (${dnDocNumber})`, "success");
    document.getElementById("dn-modal-overlay")?.remove();
    printMasterDeliveryNote(dnData, _company);
  } catch (e) {
    console.error("Save delivery note error:", e);
    showToast("حدث خطأ أثناء حفظ سند التسليم، يرجى المحاولة ثانية", "error");
  }
};

/**
 * Print Master Delivery Note (Official A4 Format)
 */
function printMasterDeliveryNote(dn, co) {
  const win = window.open("", "_blank", "width=900,height=800");
  if (!win) {
    alert("يرجى السماح بالنوافذ المنبثقة لطباعة سند التسليم");
    return;
  }

  const linesHtml = (dn.lines || []).map((l, i) => `
    <tr>
      <td style="text-align:center; font-family:monospace; font-weight:bold; border:1px solid #000; padding:6px 8px;">${i + 1}</td>
      <td style="text-align:center; font-family:monospace; border:1px solid #000; padding:6px 8px;">${l.sku || "—"}</td>
      <td style="font-weight:bold; border:1px solid #000; padding:6px 8px;">${l.productName}</td>
      <td style="text-align:center; font-family:monospace; font-weight:bold; font-size:12pt; border:1px solid #000; padding:6px 8px;">${l.qty}</td>
      <td style="text-align:center; border:1px solid #000; padding:6px 8px;">${l.unit || "حبة"}</td>
    </tr>
  `).join("");

  const sigImgHtml = dn.receiverSignature
    ? `<img src="${dn.receiverSignature}" style="max-height:60px; max-width:180px; display:block; margin:auto;" />`
    : `<div style="height:50px;"></div>`;

  const logoHtml = co.logoUrl
    ? `<img src="${co.logoUrl}" style="max-height:65px; max-width:140px; object-fit:contain;" />`
    : `<div style="font-size:28px;">📦</div>`;

  win.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>سند تسليم بضاعة — ${dn.number}</title>
      <style>
        @page { size: A4 portrait; margin: 10mm 12mm; }
        * { box-sizing: border-box; }
        body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; background:#fff; color:#000; margin:0; padding:10px; font-size:11pt; line-height:1.4; }
        .mono { font-family: monospace; }
        table { width:100%; border-collapse:collapse; }
      </style>
    </head>
    <body onload="window.print();">
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2.5px solid #000; padding-bottom:8px; margin-bottom:12px;">
        <div style="flex:1;">
          <h2 style="margin:0; font-size:16pt; font-weight:900;">${co.name}</h2>
          <div style="font-size:10pt; font-weight:bold;">${co.subNameAr || "تجارة وتوريد المواد الغذائية بالجملة"}</div>
          <div style="font-size:9pt; font-family:monospace;">س.ت: ${co.crNumber} | ر.ض: ${co.vatNumber}</div>
        </div>
        <div style="text-align:center;">
          ${logoHtml}
        </div>
        <div style="flex:1; text-align:left;">
          <div style="border:2px solid #004d80; padding:6px 12px; display:inline-block; border-radius:6px; text-align:center;">
            <div style="font-size:13pt; font-weight:900; color:#004d80;">سند تسليم بضاعة</div>
            <div style="font-size:8.5pt; color:#166534; font-weight:bold;">بانتظار الفاتورة الرسمية (لا يخصم المخزن)</div>
            <div class="mono" style="font-size:12pt; font-weight:bold; color:#004d80;">${dn.number}</div>
          </div>
        </div>
      </div>

      <!-- Details Grid -->
      <table style="margin-bottom:12px; font-size:10pt;">
        <tr>
          <th style="border:1px solid #000; background:#f1f5f9; padding:5px 8px; width:15%; text-align:right;">اسم المنشأة / العميل:</th>
          <td style="border:1px solid #000; padding:5px 8px; font-weight:bold; width:35%;">${dn.customerName}</td>
          <th style="border:1px solid #000; background:#f1f5f9; padding:5px 8px; width:15%; text-align:right;">تاريخ التسليم:</th>
          <td style="border:1px solid #000; padding:5px 8px; font-family:monospace; width:35%;">${dn.date}</td>
        </tr>
        <tr>
          <th style="border:1px solid #000; background:#f1f5f9; padding:5px 8px; text-align:right;">كود العميل:</th>
          <td style="border:1px solid #000; padding:5px 8px; font-family:monospace;">${dn.customerCode || '—'}</td>
          <th style="border:1px solid #000; background:#f1f5f9; padding:5px 8px; text-align:right;">مستودع الصرف:</th>
          <td style="border:1px solid #000; padding:5px 8px;">${dn.warehouseName}</td>
        </tr>
        <tr>
          <th style="border:1px solid #000; background:#f1f5f9; padding:5px 8px; text-align:right;">رقم أمر الشراء (PO):</th>
          <td style="border:1px solid #000; padding:5px 8px; font-family:monospace;">${dn.poNumber || '—'}</td>
          <th style="border:1px solid #000; background:#f1f5f9; padding:5px 8px; text-align:right;">المندوب / السائق:</th>
          <td style="border:1px solid #000; padding:5px 8px;">${dn.driverName || '—'}</td>
        </tr>
        <tr>
          <th style="border:1px solid #000; background:#f1f5f9; padding:5px 8px; text-align:right;">المستلم المفوض:</th>
          <td style="border:1px solid #000; padding:5px 8px; font-weight:bold;">${dn.receiverName}</td>
          <th style="border:1px solid #000; background:#f1f5f9; padding:5px 8px; text-align:right;">جوال المستلم:</th>
          <td style="border:1px solid #000; padding:5px 8px; font-family:monospace;">${dn.receiverPhone || '—'}</td>
        </tr>
      </table>

      <!-- Items Table -->
      <table style="margin-bottom:14px;">
        <thead>
          <tr style="background:#004d80; color:#fff;">
            <th style="border:1px solid #000; padding:6px; width:40px;">#</th>
            <th style="border:1px solid #000; padding:6px; width:100px;">رمز الصنف</th>
            <th style="border:1px solid #000; padding:6px; text-align:right;">بيان الصنف والمواصفات</th>
            <th style="border:1px solid #000; padding:6px; width:90px;">الكمية المسلّمة</th>
            <th style="border:1px solid #000; padding:6px; width:80px;">الوحدة</th>
          </tr>
        </thead>
        <tbody>
          ${linesHtml}
        </tbody>
        <tfoot>
          <tr style="background:#f8fafc; font-weight:bold;">
            <td colspan="3" style="border:1px solid #000; padding:6px 8px; text-align:right;">إجمالي الكميات المسلّمة:</td>
            <td style="border:1px solid #000; padding:6px 8px; text-align:center; font-family:monospace; font-size:12pt; color:#004d80;">${dn.totalQty}</td>
            <td style="border:1px solid #000; padding:6px 8px; text-align:center;">طرد / حبة</td>
          </tr>
        </tfoot>
      </table>

      <!-- Legal Declaration -->
      <div style="border:1.5px solid #000; padding:8px 12px; margin-bottom:16px; font-size:9.5pt; line-height:1.5;">
        <strong>إقرار الاستلام النظامي وحجية التسليم:</strong>
        أقر أنا المستلم الموضح اسمي وتوقيعي أدناه، بصفتي ممثلاً مفوضاً عن المنشأة المذكورة، بأنني عاينت واستلمت كافة البضائع والأصناف والكميات المبينة في هذا السند كاملة وبحالة جيدة ومطابقة لكافة المواصفات وخالية من أي تلف، ويعد هذا السند حجة قطعية باتة بالاستلام وإثبات تسليم المبيعات وفق نظام الإثبات ونظام المحاكم التجارية بالمملكة العربية السعودية.
      </div>

      <!-- Signatures Grid -->
      <div style="display:flex; justify-content:space-between; gap:14px; text-align:center;">
        <div style="flex:1; border:1px solid #000; padding:8px; border-radius:4px;">
          <div style="font-weight:bold; font-size:10pt; margin-bottom:4px;">أمين المستودع / السائق الناقل</div>
          <div style="height:50px; display:flex; align-items:center; justify-content:center; font-weight:bold;">${dn.driverName || 'نظم الإمداد'}</div>
          <div style="font-size:8.5pt; border-top:1px dashed #ccc; padding-top:2px;">التوقيع: .....................</div>
        </div>

        <div style="flex:1; border:1.5px solid #000; padding:8px; border-radius:4px; background:#fafafa;">
          <div style="font-weight:bold; font-size:10pt; margin-bottom:4px;">المستلم المفوض عن العميل</div>
          <div style="height:50px; display:flex; align-items:center; justify-content:center;">${sigImgHtml}</div>
          <div style="font-size:8.5pt; border-top:1px dashed #000; padding-top:2px; font-weight:bold;">الاسم: ${dn.receiverName}</div>
        </div>

        <div style="flex:1; border:1px solid #000; padding:8px; border-radius:4px;">
          <div style="font-weight:bold; font-size:10pt; margin-bottom:4px;">ختم المنشأة المستلمة</div>
          <div style="height:50px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:9pt; border:1px dashed #cbd5e1; margin:4px 10px;">مكان الختم الرسمي</div>
          <div style="font-size:8.5pt; border-top:1px dashed #ccc; padding-top:2px;">التاريخ: ${dn.date}</div>
        </div>
      </div>

      <!-- Footer Note -->
      <div style="margin-top:12px; font-size:8pt; text-align:center; color:#475569; border-top:1px solid #e2e8f0; padding-top:4px;">
        نظام إدهام لإدارة موارد المؤسسات — وثيقة تسليم بضاعة رسمية صادرة آلياً وموثقة نظاماً (يتم خصم المخزن والتأثير المالي عند تحويل السند إلى فاتورة رسمية).
      </div>
    </body>
    </html>
  `);
  win.document.close();
}
