// ============================================================
// IDHAM ERP — ZATCA Settings Control Panel
// ============================================================

import { db, COMPANY_ID } from "../firebase-config.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { formatCurrency } from "../utils/formatters.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";
import { app } from "../firebase-config.js";

// Instantiating functions for the 'me-west1' region as deployed in our backend
const meFunctions = getFunctions(app, "me-west1");
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  const { connectFunctionsEmulator } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js");
  connectFunctionsEmulator(meFunctions, "localhost", 5001);
}

export async function render(container, user) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">⚙️ إعدادات الربط والامتثال الإلكتروني (ZATCA e-Invoicing)</h1>
        <p class="page-subtitle" style="color:var(--text-2); font-size:13px;">تفعيل الفوترة الإلكترونية المرحلة الثانية (الربط والتكامل) لشركة إدهام</p>
      </div>
      <div id="zatca-status-badge-container">
        <span class="badge neutral" style="font-size:12px; padding:6px 12px;">⏳ جاري جلب الحالة...</span>
      </div>
    </div>

    <div class="page-content">
      <!-- Grid Layout -->
      <div class="content-grid-sidebar mb-24" style="grid-template-columns: 1fr 340px;">
        
        <!-- Onboarding Wizard Steps -->
        <div class="card" style="padding: 24px;">
          <h3 style="margin-bottom: 20px; font-size:16px; font-family:var(--font-heading);">🗺️ معالج تسجيل الجهاز والربط الفني</h3>
          
          <!-- Step 1 -->
          <div class="onboarding-step" style="border-right: 3px solid var(--border); padding-right: 20px; margin-bottom: 30px; position:relative;">
            <div class="step-num" style="position:absolute; right:-14px; top:0; width:24px; height:24px; border-radius:50%; background:var(--bg-3); color:var(--text-0); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700;">1</div>
            <h4 style="font-size:14px; margin-bottom:12px;">توليد ملف طلب توقيع الشهادة (CSR)</h4>
            <p class="text-2" style="font-size:12px; margin-bottom:14px;">توليد زوج مفاتيح التشفير ECDSA secp256r1 وملف الـ CSR المشفر المطلوب لتسجيل الجهاز.</p>
            
            <div class="grid-2 mb-12">
              <div class="form-group">
                <label>الرقم الضريبي (VAT Number)</label>
                <input type="text" id="zatca-vat" class="input mono" value="300000000000003" placeholder="أدخل الرقم الضريبي المكون من 15 خانة" />
              </div>
              <div class="form-group">
                <label>اسم المنشأة التجاري (Company Name)</label>
                <input type="text" id="zatca-name" class="input" value="إدهام للمواد الغذائية" placeholder="اسم المنشأة كما هو مسجل في الزكاة" />
              </div>
            </div>

            <button class="btn btn-primary" id="btn-generate-csr" onclick="ZatcaSettings.generateCSR()">⚙️ توليد الـ CSR وحفظ المفتاح الخاص</button>

            <div class="form-group mt-12 hidden" id="csr-output-container">
              <label>ملف الـ CSR المولد (انسخ الكود بالكامل واستخدمه في بوابة فاتورة):</label>
              <textarea id="zatca-csr-txt" class="input mono" rows="4" readonly style="font-size:11px; direction:ltr; text-align:left; background:var(--bg-2);"></textarea>
              <button class="btn btn-secondary btn-sm mt-8" onclick="ZatcaSettings.copyCSR()">📋 نسخ كود الـ CSR</button>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="onboarding-step" style="border-right: 3px solid var(--border); padding-right: 20px; margin-bottom: 30px; position:relative;">
            <div class="step-num" style="position:absolute; right:-14px; top:0; width:24px; height:24px; border-radius:50%; background:var(--bg-3); color:var(--text-0); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700;">2</div>
            <h4 style="font-size:14px; margin-bottom:12px;">توليد شهادة الامتثال المؤقتة (Compliance CSID)</h4>
            <p class="text-2" style="font-size:12px; margin-bottom:14px;">أدخل رمز التحقق (OTP) المولد من بوابة فاتورة لإصدار الشهادة المشفرة المؤقتة الخاصة بـ Sandbox.</p>
            
            <div class="form-group" style="max-width:300px; margin-bottom:12px;">
              <label>رمز الـ OTP (مكون من 6 أرقام)</label>
              <input type="text" id="zatca-otp" class="input mono" placeholder="مثال: 123456" maxlength="6" />
            </div>

            <button class="btn btn-primary" id="btn-request-csid" onclick="ZatcaSettings.requestCSID()" disabled>🔑 طلب شهادة الامتثال CSID</button>
          </div>

          <!-- Step 3 -->
          <div class="onboarding-step" style="border-right: 3px solid var(--border); padding-right: 20px; margin-bottom: 30px; position:relative;">
            <div class="step-num" style="position:absolute; right:-14px; top:0; width:24px; height:24px; border-radius:50%; background:var(--bg-3); color:var(--text-0); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700;">3</div>
            <h4 style="font-size:14px; margin-bottom:12px;">فحص ومطابقة الفواتير النموذجية (Compliance Check)</h4>
            <p class="text-2" style="font-size:12px; margin-bottom:14px;">إرسال الفواتير الاختبارية النموذجية لهيئة الزكاة لاختبار مدى تطابق النظام واعتماد عملية التسجيل.</p>
            
            <button class="btn btn-primary" id="btn-compliance-check" onclick="ZatcaSettings.checkCompliance()" disabled>🧪 بدء فحص مطابقة الفواتير</button>
            <div id="compliance-results-container" class="mt-12"></div>
          </div>

          <!-- Step 4 -->
          <div class="onboarding-step" style="border-right: 3px solid var(--border); padding-right: 20px; position:relative;">
            <div class="step-num" style="position:absolute; right:-14px; top:0; width:24px; height:24px; border-radius:50%; background:var(--bg-3); color:var(--text-0); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700;">4</div>
            <h4 style="font-size:14px; margin-bottom:12px;">إصدار شهادة الإنتاج النهائية (Production CSID)</h4>
            <p class="text-2" style="font-size:12px; margin-bottom:14px;">بعد اجتياز كافة فحوصات المطابقة، قم بترقية شهادة جهازك للحصول على شهادة الإنتاج الرسمية لبدء الفوترة الحية.</p>
            
            <button class="btn btn-primary" id="btn-request-pcsid" onclick="ZatcaSettings.requestProductionCSID()" disabled>🚀 ترقية وإصدار شهادة الإنتاج PCSID</button>
          </div>

        </div>

        <!-- Sidebar Info Card -->
        <div class="card" style="padding: 24px; display:flex; flex-direction:column; gap:20px;">
          <div>
            <h3 style="font-size:15px; font-family:var(--font-heading); margin-bottom:6px;">🔌 فحص وصلاحية الاتصال</h3>
            <p class="text-2" style="font-size:12px;">تأكد من فاعلية شهادات الربط والاتصال مع الهيئة في أي وقت.</p>
          </div>

          <button class="btn btn-secondary" onclick="ZatcaSettings.testConnection()">🔄 فحص واختبار الاتصال</button>

          <hr style="border:none; border-top:1px solid var(--border-soft); margin:0;" />

          <div>
            <h4 style="font-size:13px; margin-bottom:6px; color:var(--text-1);">📋 تفاصيل الترخيص الحالي</h4>
            <div style="font-size:12px; display:flex; flex-direction:column; gap:8px;" class="text-2">
              <div class="flex justify-between"><span>البيئة:</span> <strong id="info-env">—</strong></div>
              <div class="flex justify-between"><span>الرقم الضريبي:</span> <strong id="info-vat" class="mono">—</strong></div>
              <div class="flex justify-between"><span>اسم المنشأة:</span> <strong id="info-name">—</strong></div>
              <div class="flex justify-between"><span>حالة التسجيل:</span> <strong id="info-status">—</strong></div>
              <div class="flex justify-between"><span>تاريخ التحديث:</span> <strong id="info-date" class="mono">—</strong></div>
            </div>
          </div>

          <hr style="border:none; border-top:1px solid var(--border-soft); margin:0;" />

          <button class="btn btn-secondary btn-sm text-bad" onclick="ZatcaSettings.resetOnboarding()" style="background:rgba(239, 68, 68, 0.05); border-color:rgba(239, 68, 68, 0.2);">
            ⚠️ إعادة تهيئة إعدادات الربط
          </button>
        </div>

      </div>
    </div>
  `;

  // Fetch current settings to render current state
  await ZatcaSettings.loadCurrentConfig();
}

// Global UI handler namespace
window.ZatcaSettings = {
  async loadCurrentConfig() {
    try {
      const docRef = doc(db, `companies/${COMPANY_ID}/settings/zatca`);
      const snap = await getDoc(docRef);

      const statusBadge = document.getElementById("zatca-status-badge-container");
      const btnCsid = document.getElementById("btn-request-csid");
      const btnComp = document.getElementById("btn-compliance-check");
      const btnPcsid = document.getElementById("btn-request-pcsid");
      
      const infoEnv = document.getElementById("info-env");
      const infoVat = document.getElementById("info-vat");
      const infoName = document.getElementById("info-name");
      const infoStatus = document.getElementById("info-status");
      const infoDate = document.getElementById("info-date");

      if (snap.exists()) {
        const data = snap.data();
        
        // Populate inputs if values exist
        if (data.vatNumber) document.getElementById("zatca-vat").value = data.vatNumber;
        if (data.companyName) document.getElementById("zatca-name").value = data.companyName;

        // Render CSR output if generated
        if (data.csr) {
          const csrCont = document.getElementById("csr-output-container");
          const csrTxt = document.getElementById("zatca-csr-txt");
          if (csrCont && csrTxt) {
            csrCont.classList.remove("hidden");
            csrTxt.value = data.csr;
          }
          btnCsid.disabled = false;
        }

        // Enable buttons based on status
        if (data.complianceCSID) {
          btnComp.disabled = false;
        }
        if (data.status === "compliance_checked_passed") {
          btnPcsid.disabled = false;
        }

        // Render side panel info
        infoEnv.textContent = data.environment === "production" ? "البيئة الإنتاجية الفعلية" : "بيئة الامتثال التجريبية Sandbox";
        infoVat.textContent = data.vatNumber || "—";
        infoName.textContent = data.companyName || "—";
        infoDate.textContent = data.updatedAt?.toDate ? data.updatedAt.toDate().toLocaleString("ar-SA") : "—";

        // Status badges mappings
        let badgeHtml = "";
        let statusText = "—";
        if (data.status === "production_ready") {
          badgeHtml = `<span class="badge good" style="font-size:12px; padding:6px 12px; box-shadow:0 0 10px rgba(16,185,129,0.3);">✅ مفعّل - بيئة الإنتاج الفعلية</span>`;
          statusText = "جاهز للفوترة الفعلية";
        } else if (data.status === "compliance_checked_passed" || data.status === "compliance_csid_obtained") {
          badgeHtml = `<span class="badge warn" style="font-size:12px; padding:6px 12px;">🧪 بيئة الامتثال التجريبية Sandbox</span>`;
          statusText = "شهادة الامتثال نشطة";
        } else if (data.status === "csr_generated") {
          badgeHtml = `<span class="badge info" style="font-size:12px; padding:6px 12px;">📋 تم توليد ملف الـ CSR</span>`;
          statusText = "بانتظار التحقق";
        } else {
          badgeHtml = `<span class="badge neutral" style="font-size:12px; padding:6px 12px;">❌ غير مفعّل</span>`;
          statusText = "غير مفعل";
        }
        statusBadge.innerHTML = badgeHtml;
        infoStatus.textContent = statusText;

      } else {
        statusBadge.innerHTML = `<span class="badge neutral" style="font-size:12px; padding:6px 12px;">❌ غير مفعّل</span>`;
        infoStatus.textContent = "غير مفعل";
      }

    } catch (e) {
      console.error("Load ZATCA config error", e);
    }
  },

  async generateCSR() {
    const vatNumber = document.getElementById("zatca-vat").value.trim();
    const companyName = document.getElementById("zatca-name").value.trim();
    const btn = document.getElementById("btn-generate-csr");

    if (!vatNumber || vatNumber.length < 15) {
      window.showToast?.("الرجاء إدخال رقم ضريبي صحيح مكون من 15 خانة", "error");
      return;
    }

    btn.disabled = true;
    btn.textContent = "⏳ جاري توليد المفاتيح والملفات...";

    try {
      const generateCSRApi = httpsCallable(meFunctions, "generateCSR");
      const result = await generateCSRApi({ vatNumber, companyName });
      
      if (result.data.success) {
        window.showToast?.("تم توليد ملف طلب توقيع الشهادة (CSR) بنجاح وحفظ المفاتيح بأمان", "success");
        await this.loadCurrentConfig();
      }
    } catch (e) {
      window.showToast?.(`فشل التوليد: ${e.message}`, "error");
      btn.disabled = false;
      btn.textContent = "⚙️ توليد الـ CSR وحفظ المفتاح الخاص";
    }
  },

  copyCSR() {
    const csrTxt = document.getElementById("zatca-csr-txt");
    if (csrTxt) {
      csrTxt.select();
      document.execCommand("copy");
      window.showToast?.("تم نسخ كود الـ CSR للحافظة بنجاح", "success");
    }
  },

  async requestCSID() {
    const otp = document.getElementById("zatca-otp").value.trim();
    const btn = document.getElementById("btn-request-csid");

    if (!otp || otp.length < 6) {
      window.showToast?.("الرجاء إدخال رمز OTP المكون من 6 أرقام", "error");
      return;
    }

    btn.disabled = true;
    btn.textContent = "⏳ جاري الاتصال بهيئة الزكاة...";

    try {
      const requestComplianceCSID = httpsCallable(meFunctions, "requestComplianceCSID");
      const result = await requestComplianceCSID({ otp });

      if (result.data.success) {
        window.showToast?.("تم إصدار وتخزين شهادة الامتثال (Compliance CSID) بنجاح", "success");
        await this.loadCurrentConfig();
      }
    } catch (e) {
      window.showToast?.(`فشل استلام الشهادة: ${e.message}`, "error");
      btn.disabled = false;
      btn.textContent = "🔑 طلب شهادة الامتثال CSID";
    }
  },

  async checkCompliance() {
    const btn = document.getElementById("btn-compliance-check");
    const resContainer = document.getElementById("compliance-results-container");

    btn.disabled = true;
    btn.textContent = "⏳ جاري إرسال فواتير الاختبار ومطابقتها...";
    resContainer.innerHTML = `<span style="font-size:12px; color:var(--text-2);">⏳ جاري الفحص والمطابقة...</span>`;

    try {
      const complianceCheck = httpsCallable(meFunctions, "complianceCheck");
      const result = await complianceCheck();

      if (result.data.success) {
        window.showToast?.("اجتاز النظام اختبار المطابقة والامتثال للفواتير النموذجية بنجاح!", "success");
        resContainer.innerHTML = `
          <div class="alert good" style="margin:0; font-size:12px;">
            <strong>النتيجة: PASS ✅</strong><br/>
            تم اختبار الفواتير والمردودات وتم قبولها بالكامل من بيئة الزكاة المرجعية.
          </div>
        `;
        await this.loadCurrentConfig();
      }
    } catch (e) {
      window.showToast?.(`فشل اختبار المطابقة: ${e.message}`, "error");
      resContainer.innerHTML = `
        <div class="alert bad" style="margin:0; font-size:12px;">
          <strong>النتيجة: FAILED ❌</strong><br/>
          سبب الرفض: ${e.message}
        </div>
      `;
      btn.disabled = false;
      btn.textContent = "🧪 بدء فحص مطابقة الفواتير";
    }
  },

  async requestProductionCSID() {
    const btn = document.getElementById("btn-request-pcsid");
    btn.disabled = true;
    btn.textContent = "⏳ جاري ترقية وإصدار شهادة الإنتاج الرسمية...";

    try {
      const requestProductionCSID = httpsCallable(meFunctions, "requestProductionCSID");
      const result = await requestProductionCSID();

      if (result.data.success) {
        window.showToast?.("تهانينا! تم تفعيل الربط النهائي بالبيئة الإنتاجية الرسمية لـ ZATCA بنجاح ✅", "success");
        await this.loadCurrentConfig();
      }
    } catch (e) {
      window.showToast?.(`فشل الترقية للإنتاج: ${e.message}`, "error");
      btn.disabled = false;
      btn.textContent = "🚀 ترقية وإصدار شهادة الإنتاج PCSID";
    }
  },

  async testConnection() {
    try {
      const testZATCAConnection = httpsCallable(meFunctions, "testZATCAConnection");
      const result = await testZATCAConnection();
      
      if (result.data.success) {
        window.showToast?.(`حالة الاتصال: ${result.data.message} (${result.data.environment})`, "success");
      } else {
        window.showToast?.(`حالة الاتصال: ${result.data.message}`, "warn");
      }
    } catch (e) {
      window.showToast?.(`فشل فحص الاتصال: ${e.message}`, "error");
    }
  },

  async resetOnboarding() {
    if (!confirm("⚠️ هل أنت متأكد من رغبتك في إعادة تهيئة وإلغاء الربط الحالي؟ سيؤدي ذلك لمسح الشهادات الحالية وبدء التسجيل من جديد.")) {
      return;
    }

    try {
      // Clear settings doc in Firestore
      await setDoc(doc(db, `companies/${COMPANY_ID}/settings/zatca`), {
        status: "inactive",
        environment: "simulation",
        updatedAt: new Date()
      });

      window.showToast?.("تمت إعادة تهيئة إعدادات الربط بنجاح", "success");
      location.reload();
    } catch (e) {
      window.showToast?.(`فشل إعادة التهيئة: ${e.message}`, "error");
    }
  }
};
