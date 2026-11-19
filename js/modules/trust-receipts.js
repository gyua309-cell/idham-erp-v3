// ============================================================
// IDHAM ERP — Trust Receipts & Fiduciary Custody Module
// سندات الاستلام على سبيل الأمانة والعهدة المالية المعتمدة
// وفقاً لنظام مكافحة الاحتيال المالي وخيانة الأمانة (المرسوم الملكي م/79)
// ونظام المعاملات المدنية (م/191) ونظام الإثبات (م/43) السعودي
// ============================================================

import { COLS, getAll, create, update, db, COMPANY_ID, doc, getDoc, getDocs } from "../utils/db.js";
import { formatCurrency, formatDate, todayString, tafqeetArabic } from "../utils/formatters.js";

const showToast = (...a) => (window.showToast ? window.showToast(...a) : console.log(...a));

/**
 * حساب التاريخ الهجري بدقة
 */
function getHijriDate(dateObj = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return formatter.format(dateObj).replace(/هـ/g, '').trim() + ' هـ';
  } catch {
    return "";
  }
}

/**
 * توليد رقم تسلسلي فريد لسند الأمانة
 */
async function generateTrustReceiptNumber() {
  const year = new Date().getFullYear();
  let seq = 1;
  try {
    const existing = await getAll(COLS.trustReceipts());
    const yearNotes = existing.filter(n => (n.receiptNumber || "").startsWith(`TR-${year}`));
    if (yearNotes.length > 0) {
      const nums = yearNotes.map(n => {
        const parts = (n.receiptNumber || "").split("-");
        return parseInt(parts[parts.length - 1] || "0", 10);
      }).filter(n => !isNaN(n));
      if (nums.length > 0) seq = Math.max(...nums) + 1;
    }
  } catch (_) {
    seq = Math.floor(1000 + Math.random() * 9000);
  }
  return `TR-${year}-${String(seq).padStart(4, "0")}`;
}

/**
 * فتح نافذة إنشاء وتخصيص سند أمانة (لعميل مسجل أو عميل جديد تماماً)
 * مع واجهة مستخدم تنفيذية مطورة وفائقة الأناقة
 * @param {string|object|null} customerIdOrObj 
 * @param {object} options { amount, notes, dueDate, nature }
 */
export async function openTrustReceiptModal(customerIdOrObj = null, options = {}) {
  let cust = null;

  if (typeof customerIdOrObj === "object" && customerIdOrObj !== null) {
    cust = customerIdOrObj;
  } else if (typeof customerIdOrObj === "string" && customerIdOrObj) {
    try {
      const allCusts = await getAll(COLS.customers());
      cust = allCusts.find(c => c.id === customerIdOrObj) || null;
    } catch (e) {
      console.warn("Failed to fetch customer for trust receipt:", e);
    }
  }

  // Remove existing modal if already open
  const existing = document.getElementById("tr-modal-overlay");
  if (existing) existing.remove();

  const today = todayString();
  const defaultAmount = options.amount !== undefined ? parseFloat(options.amount) : (cust ? parseFloat(cust.balance || 0) : 0);
  const defaultDueDate = options.dueDate || "";

  // Load Company Defaults
  let co = {
    name: "شركة نظم الإمداد المتطورة",
    crNumber: "7054969006",
    vatNumber: "314996148100003",
    city: "ينبع",
    phone: "0549141648",
    address: "مبنى 7689 — شارع ينبع الصناعية 2179 — حي غرناطة — ينبع — رمز 46414"
  };
  try {
    const cachedCo = window.ERP_COMPANY || JSON.parse(localStorage.getItem("idham_company") || "{}");
    if (cachedCo.name) Object.assign(co, cachedCo);
    if (cachedCo.logoBase64) co.logoUrl = cachedCo.logoBase64;
    if (cachedCo.logoUrl) co.logoUrl = cachedCo.logoUrl;
    const [snap, logoSnap] = await Promise.all([
      getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company")),
      getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "logo"))
    ]);
    if (snap.exists()) Object.assign(co, snap.data());
    if (logoSnap.exists()) {
      const ld = logoSnap.data();
      co.logoUrl = ld.dataUrl || ld.logoBase64 || ld.url || ld.logoUrl || "";
    }
  } catch (_) {}

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "tr-modal-overlay";
  overlay.style.zIndex = "9999";

  overlay.innerHTML = `
    <style>
      #tr-modal-container {
        max-width: 890px;
        width: 95%;
        max-height: 92vh;
        display: flex;
        flex-direction: column;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1);
        background: var(--bg-card, #111827);
        border: 1px solid var(--border, #374151);
        font-family: var(--font-body, 'IBM Plex Sans Arabic', -apple-system, sans-serif);
      }
      .tr-header-gradient {
        background: linear-gradient(135deg, #09122c 0%, #172554 45%, #1e3a8a 100%);
        color: #fff;
        padding: 20px 26px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid rgba(212, 175, 55, 0.4);
        position: relative;
      }
      .tr-header-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(212, 175, 55, 0.15);
        border: 1px solid rgba(212, 175, 55, 0.4);
        color: #fde047;
        padding: 3px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
      }
      .tr-segmented-control {
        display: flex;
        background: var(--bg-2, #1f2937);
        padding: 4px;
        border-radius: 12px;
        gap: 6px;
        border: 1px solid var(--border-soft, #374151);
      }
      .tr-seg-btn {
        flex: 1;
        padding: 9px 16px;
        border-radius: 9px;
        border: none;
        background: transparent;
        color: var(--text-2, #9ca3af);
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s ease;
      }
      .tr-seg-btn.active {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: #fff;
        box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      }
      .tr-card {
        background: var(--bg-2, rgba(30, 41, 59, 0.5));
        border: 1px solid var(--border-soft, rgba(148, 163, 184, 0.2));
        border-radius: 14px;
        padding: 16px 20px;
        transition: border-color 0.2s ease;
      }
      .tr-card:hover {
        border-color: rgba(99, 102, 241, 0.35);
      }
      .tr-card-title {
        font-size: 13px;
        font-weight: 900;
        color: var(--text-0, #f8fafc);
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }
      .tr-input-box {
        background: var(--bg-1, #0f172a);
        border: 1px solid var(--border, #334155);
        color: var(--text-0, #f8fafc);
        border-radius: 10px;
        padding: 10px 14px;
        font-size: 13.5px;
        width: 100%;
        box-sizing: border-box;
        transition: all 0.2s;
        font-family: inherit;
      }
      .tr-input-box:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        background: var(--bg-card, #1e293b);
      }
      .tr-amount-vault {
        background: linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(15, 23, 42, 0.45) 100%);
        border: 1.5px solid rgba(59, 130, 246, 0.35);
        border-radius: 14px;
        padding: 18px 20px;
        position: relative;
        overflow: hidden;
      }
      .tr-amount-vault::before {
        content: "";
        position: absolute;
        top: 0; right: 0; width: 90px; height: 90px;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
        pointer-events: none;
      }
      .tr-tafqeet-ribbon {
        background: rgba(245, 158, 11, 0.08);
        border: 1px solid rgba(245, 158, 11, 0.3);
        border-radius: 10px;
        padding: 9px 14px;
        color: #fde047;
        font-size: 13px;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 10px;
      }
      .tr-tag-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 11.5px;
        font-weight: 600;
        background: var(--bg-card, #1e293b);
        border: 1px solid var(--border-soft, #334155);
        color: var(--text-1, #cbd5e1);
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .tr-tag-pill:hover, .tr-tag-pill.active {
        background: rgba(59, 130, 246, 0.15);
        border-color: #3b82f6;
        color: #93c5fd;
      }
    </style>

    <div id="tr-modal-container">
      
      <!-- Executive Modal Header -->
      <div class="tr-header-gradient">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:46px; height:46px; border-radius:12px; background:linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.05)); border:1px solid rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center; font-size:24px; box-shadow:0 6px 16px rgba(0,0,0,0.3);">🛡️</div>
          <div>
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
              <h3 style="margin:0; font-size:18px; font-weight:900; letter-spacing:0.3px; color:#fff;">سند استلام على سبيل الأمانة والعهدة المالية</h3>
              <span class="tr-header-badge">⚖️ نظام مكافحة الاحتيال المالي (م/79)</span>
            </div>
            <div style="font-size:12px; color:#bae6fd; margin-top:3px; opacity:0.9;">
              سند رسمي ملزم لحفظ الحقوق والتوريدات — كتابة حرة لعميل جديد أو اختيار عميل مسجل
            </div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button type="button" class="btn btn-secondary sm" onclick="window.switchToGoodsReceiptAckModal()" style="font-size:12px; background:rgba(255,255,255,0.15); color:#fff; border:1px solid rgba(255,255,255,0.3); font-weight:700;">
            📜 إقرار استلام بضاعة وسند لأمر
          </button>
          <button class="btn btn-icon sm btn-ghost" onclick="document.getElementById('tr-modal-overlay').remove()" style="color:#fff; font-size:24px; line-height:1; border:none; background:transparent; cursor:pointer;" title="إغلاق">✕</button>
        </div>
      </div>

      <!-- Modal Body (Scrollable & Responsive) -->
      <div class="modal-body" style="padding:22px 26px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:18px;">
        
        <!-- Section 1: Citizen / Trustee Identity Card (Direct & Uncoupled) -->
        <div class="tr-card" id="tr-customer-card">
          <div class="tr-card-title">
            <span>👤</span> <span>بيانات المواطن / المستلم الأمين (المقر بالاستلام)</span>
          </div>

          <!-- Citizen Full Name -->
          <div style="margin-bottom:12px;">
            <label style="font-size:11.5px; font-weight:800; color:var(--text-1, #cbd5e1); display:block; margin-bottom:4px;">
              اسم المواطن / المستلم الرباعي *
            </label>
            <input type="text" id="tr-cust-name" class="tr-input-box" 
                   value="${cust ? cust.name : ''}" 
                   placeholder="اكتب اسم المواطن أو المستلم الرباعي..." 
                   autocomplete="off" 
                   style="height:44px; font-size:14.5px; font-weight:800; padding-right:14px;" required />
          </div>
          <input type="hidden" id="tr-cust-id" value="${cust ? cust.id : ''}" />

          <!-- Identity Grid -->
          <div style="display:grid; grid-template-columns:1.2fr 1.2fr 1fr; gap:12px;">
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2, #94a3b8); display:block; margin-bottom:4px;">
                🪪 رقم الهوية الوطنية / الإقامة *
              </label>
              <input type="text" id="tr-cust-id-num" class="tr-input-box" style="font-family:'IBM Plex Mono', monospace; font-weight:700;" value="${cust ? (cust.idNumber || cust.nationalId || cust.crNumber || '') : ''}" placeholder="10xxxxxxxx أو 20xxxxxxxx" required />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2, #94a3b8); display:block; margin-bottom:4px;">
                📱 رقم الجوال المعتمد *
              </label>
              <input type="text" id="tr-cust-phone" class="tr-input-box" style="font-family:'IBM Plex Mono', monospace; font-weight:700;" value="${cust ? (cust.phone || cust.mobile || '') : ''}" placeholder="05xxxxxxxx" required />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:var(--text-2, #94a3b8); display:block; margin-bottom:4px;">
                💼 اسم المفوض بالاستلام (إن وجد)
              </label>
              <input type="text" id="tr-cust-resp" class="tr-input-box" value="${cust ? (cust.ownerName || cust.contactPerson || cust.managerName || cust.responsiblePerson || '') : ''}" placeholder="اختياري — في حال وجود مفوض..." />
            </div>
            <div style="grid-column:1/-1;">
              <label style="font-size:11px; font-weight:700; color:var(--text-2, #94a3b8); display:block; margin-bottom:4px;">
                📍 العنوان الوطني / المدينة المعتمدة للتبليغ القضائي
              </label>
              <input type="text" id="tr-cust-address" class="tr-input-box" value="${cust ? ([cust.address, cust.street, cust.district, cust.city, cust.postalCode].filter(Boolean).join(' — ') || cust.city || '') : 'ينبع — المملكة العربية السعودية'}" placeholder="ينبع — شارع … — حي …" />
            </div>
          </div>
        </div>

        <!-- Section 2: Financial Vault & Amount Details -->
        <div class="tr-amount-vault">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="font-size:14px; font-weight:900; color:#38bdf8; display:flex; align-items:center; gap:8px;">
              <span>💰</span> <span>القيمة المالية ومبلغ الأمانة والعهدة</span>
            </div>
            <span style="font-size:11px; color:#93c5fd; background:rgba(59, 130, 246, 0.15); padding:2px 10px; border-radius:12px; border:1px solid rgba(59, 130, 246, 0.3);">
              واجب الرد والسداد
            </span>
          </div>

          <div style="display:grid; grid-template-columns:1.4fr 1fr; gap:14px; align-items:start;">
            
            <!-- Amount Input with Currency Badge -->
            <div>
              <label style="font-size:11.5px; font-weight:800; color:var(--text-1, #cbd5e1); display:block; margin-bottom:4px;">
                مبلغ الأمانة والعهدة بالريال السعودي *
              </label>
              <div style="position:relative; display:flex; align-items:center;">
                <input type="number" id="tr-amount" class="tr-input-box" 
                       value="${defaultAmount > 0 ? defaultAmount : ''}" 
                       placeholder="0.00" step="0.01" min="0.01" required
                       style="font-size:22px; font-weight:900; color:#10b981; font-family:'IBM Plex Mono', monospace; height:50px; padding-left:70px;" 
                       oninput="window.updateTrTafqeet(this.value)" />
                <span style="position:absolute; left:12px; font-size:13px; font-weight:900; color:#10b981; background:rgba(16, 185, 129, 0.12); padding:4px 10px; border-radius:8px; pointer-events:none;">
                  ر.س SAR
                </span>
              </div>
            </div>

            <!-- Receipt Date -->
            <div>
              <label style="font-size:11.5px; font-weight:800; color:var(--text-1, #cbd5e1); display:block; margin-bottom:4px;">
                تاريخ الاستلام والتحرير *
              </label>
              <input type="date" id="tr-receipt-date" class="tr-input-box" value="${today}" style="height:50px; font-weight:700;" />
            </div>

          </div>

          <!-- Live Tafqeet Ribbon -->
          <div class="tr-tafqeet-ribbon">
            <span style="font-size:15px;">✍️</span>
            <span>المبلغ كتابة وتفقيطاً:</span>
            <strong id="tr-tafqeet-text" style="color:#fff; letter-spacing:0.3px;">
              ${defaultAmount > 0 ? tafqeetArabic(defaultAmount) : 'اكتب المبلغ لتفقيطه تلقائياً بالريال والهللات'}
            </strong>
          </div>
          <input type="hidden" id="tr-amount-words" value="${defaultAmount > 0 ? tafqeetArabic(defaultAmount) : ''}" />

          <!-- Trust Nature & Quick Selectors -->
          <div style="margin-top:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <label style="font-size:11.5px; font-weight:800; color:var(--text-1, #cbd5e1);">
                طبيعة وموضوع الأمانة المسلمة تحت يد المستلم *
              </label>
              <span style="font-size:11px; color:var(--text-2, #94a3b8);">(انقر للتعبئة السريعة)</span>
            </div>

            <!-- Quick Nature Pills -->
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px;">
              <span class="tr-tag-pill active" onclick="window.setTrNature(this, 'مبلغ مالي نقدي مستلم على سبيل الأمانة والعهدة التامة لتوريد مواد غذائية')">💵 نقد عهدة للتوريد</span>
              <span class="tr-tag-pill" onclick="window.setTrNature(this, 'بضائع ومواد غذائية مستلمة برسم البيع والأمانة موضوعة تحت يدي كأمانة تامة')">📦 بضاعة برسم البيع</span>
              <span class="tr-tag-pill" onclick="window.setTrNature(this, 'شيك مصرفي مودع ومسلّم على سبيل الأمانة والضمان المالي')">💳 شيك أمانة وضمان</span>
              <span class="tr-tag-pill" onclick="window.setTrNature(this, 'قيمة بضاعة مسلمة تحت الحساب والأمانة لحين إجراء المحاسبة والمطابقة')">⚖️ عهدة تحت الحساب</span>
            </div>

            <textarea id="tr-nature" class="tr-input-box" rows="2" style="font-weight:700; font-size:12.5px; resize:vertical;">مبلغ مالي نقدي مستلم على سبيل الأمانة والعهدة التامة لتوريد مواد غذائية</textarea>
          </div>

          <!-- Due Date / Term Toggle -->
          <div style="margin-top:14px; background:rgba(15, 23, 42, 0.4); padding:12px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);">
            <label style="font-size:12px; font-weight:800; color:#38bdf8; margin-bottom:8px; display:block;">
              موعد رد وتسليم الأمانة إلى شركة نظم الإمداد المتطورة *
            </label>
            <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:700; font-size:12.5px; color:var(--text-0, #fff);">
                <input type="radio" name="tr-due-type" value="on_demand" checked onchange="window.toggleTrDueDate(false)" style="width:16px; height:16px;" />
                <span>⚡ فور طلب الشركة الدائنة في أي وقت دون قيد أو شرط (الخيار القانوني الأقوى)</span>
              </label>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:700; font-size:12.5px; color:var(--text-1, #cbd5e1);">
                <input type="radio" name="tr-due-type" value="specific_date" onchange="window.toggleTrDueDate(true)" style="width:16px; height:16px;" />
                <span>📅 في تاريخ محدد أقصاه:</span>
              </label>
              <input type="date" id="tr-due-date" class="tr-input-box" value="${defaultDueDate}" style="max-width:180px; height:36px; display:none; padding:4px 10px;" />
            </div>
          </div>

        </div>

        <!-- Section 3: Guarantor Card (Optional) -->
        <div class="tr-card" style="background:rgba(99, 102, 241, 0.04); border-color:rgba(99, 102, 241, 0.25);">
          <div class="tr-card-title" style="color:#818cf8;">
            <span>🤝</span> <span>بيانات الكفيل الغارم المتضامن (اختياري لتعزيز التحصيل والضمان الشخصي)</span>
          </div>
          <div style="display:grid; grid-template-columns:1.4fr 1fr 1fr; gap:10px;">
            <input type="text" id="tr-guar-name" class="tr-input-box" value="${cust ? (cust.guarantor || cust.guarantorName || '') : ''}" placeholder="اسم الكفيل الغارم الرباعي" style="font-size:12.5px;" />
            <input type="text" id="tr-guar-id" class="tr-input-box mono font-bold" value="${cust ? (cust.guarantorId || '') : ''}" placeholder="رقم هوية الكفيل" style="font-size:12.5px;" />
            <input type="text" id="tr-guar-phone" class="tr-input-box mono font-bold" value="${cust ? (cust.guarantorPhone || '') : ''}" placeholder="جوال الكفيل" style="font-size:12.5px;" />
          </div>
        </div>

        <!-- Section 4: Notes & Document references -->
        <div>
          <label style="font-size:11.5px; font-weight:700; color:var(--text-2, #94a3b8); display:block; margin-bottom:4px;">
            📝 بيانات إضافية / أرقام فواتير / رقم شاحنة أو سندات تسليم
          </label>
          <input type="text" id="tr-notes" class="tr-input-box" value="${options.notes || ''}" placeholder="سند تسليم رقم... فاتورة مبيعات... أو تفاصيل إضافية" />
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="modal-footer" style="padding:16px 26px; background:var(--bg-card, #111827); border-top:1px solid var(--border-soft, #374151); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('tr-modal-overlay').remove()" style="padding:10px 20px; font-weight:700;">
          ✕ إلغاء
        </button>
        
        <div style="display:flex; gap:12px;">
          <button type="button" class="btn btn-secondary" onclick="window.submitTrustReceipt(false)" style="border-color:#0284c7; color:#38bdf8; font-weight:800; padding:10px 20px; display:inline-flex; align-items:center; gap:8px;">
            <span>🖨️</span> <span>طباعة السند فوراً (بدون حفظ)</span>
          </button>
          
          <button type="button" class="btn btn-primary" onclick="window.submitTrustReceipt(true)" style="padding:10px 26px; font-weight:900; font-size:14px; background:linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); border:none; box-shadow:0 6px 18px rgba(37, 99, 235, 0.45); display:inline-flex; align-items:center; gap:8px;">
            <span>💾</span> <span>حفظ في السجلات والطباعة الرسمية</span>
          </button>
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(overlay);

  // Setup Mode Switcher
  window.setTrCustomerMode = (mode) => {
    const btnNew = document.getElementById("tr-btn-mode-new");
    const btnReg = document.getElementById("tr-btn-mode-reg");
    const label = document.getElementById("tr-cust-name-label");
    const inp = document.getElementById("tr-cust-name");
    const chk = document.getElementById("tr-save-new-cust");

    if (mode === "new") {
      if (btnNew) btnNew.classList.add("active");
      if (btnReg) btnReg.classList.remove("active");
      if (label) label.textContent = "الاسم التجاري الكامل للعميل / المنشأة الجديدة *";
      if (inp) {
        inp.placeholder = "اكتب اسم العميل أو المؤسسة يدوياً...";
        inp.value = "";
      }
      document.getElementById("tr-cust-id").value = "";
      document.getElementById("tr-cust-id-num").value = "";
      document.getElementById("tr-cust-phone").value = "";
      document.getElementById("tr-cust-resp").value = "";
      document.getElementById("tr-cust-address").value = "";
      if (chk) chk.checked = true;
    } else {
      if (btnReg) btnReg.classList.add("active");
      if (btnNew) btnNew.classList.remove("active");
      if (label) label.textContent = "ابحث واختر العميل المسجل من القائمة *";
      if (inp) {
        inp.placeholder = "🔍 اكتب اسم العميل المسجل للبحث...";
        inp.focus();
      }
      if (chk) chk.checked = false;
    }
  };

  // Helper for Nature tags
  window.setTrNature = (el, text) => {
    document.querySelectorAll(".tr-tag-pill").forEach(p => p.classList.remove("active"));
    if (el) el.classList.add("active");
    const textarea = document.getElementById("tr-nature");
    if (textarea) textarea.value = text;
  };

  // Setup live handlers
  window.updateTrTafqeet = (val) => {
    const num = parseFloat(val);
    const words = (num && !isNaN(num) && num > 0) ? tafqeetArabic(num) : "";
    const elInput = document.getElementById("tr-amount-words");
    const elText = document.getElementById("tr-tafqeet-text");
    if (elInput) elInput.value = words;
    if (elText) {
      elText.textContent = words ? `فقط [ ${words} ]` : 'اكتب المبلغ لتفقيطه تلقائياً بالريال والهللات';
    }
  };

  window.toggleTrDueDate = (isSpecific) => {
    const dInp = document.getElementById("tr-due-date");
    if (dInp) {
      dInp.style.display = isSpecific ? "inline-block" : "none";
      if (isSpecific && !dInp.value) {
        const d = new Date();
        d.setDate(d.getDate() + 15);
        dInp.value = d.toISOString().slice(0, 10);
      }
    }
  };

  window.searchTrCustomer = async (term) => {
    const dd = document.getElementById("tr-cust-dropdown");
    if (!dd) return;
    const q = (term || "").trim().toLowerCase();
    try {
      const custs = await getAll(COLS.customers());
      const matches = custs.filter(c => !q || 
        (c.name || "").toLowerCase().includes(q) || 
        (c.phone || "").includes(q) || 
        (c.idNumber || "").includes(q) || 
        (c.crNumber || "").includes(q)
      ).slice(0, 8);

      if (!matches.length) {
        dd.innerHTML = `<div style="padding:12px; text-align:center; color:var(--text-2, #94a3b8); font-size:12px;">عميل غير مسجل — يمكنك متابعة كتابة بياناته يدوياً بكل حرية</div>`;
        dd.style.display = "block";
        return;
      }

      dd.innerHTML = matches.map(c => {
        const nameSafe = (c.name || "").replace(/'/g, "\\'");
        const addrSafe = ([c.address, c.street, c.district, c.city].filter(Boolean).join(" — ")).replace(/'/g, "\\'");
        const idNum = c.idNumber || c.crNumber || "";
        const phone = c.phone || c.mobile || "";
        const resp = (c.ownerName || c.contactPerson || c.managerName || c.responsiblePerson || c.name || "").replace(/'/g, "\\'");
        const guarName = (c.guarantor || c.guarantorName || "").replace(/'/g, "\\'");
        const guarId = (c.guarantorId || "").replace(/'/g, "\\'");
        const guarPhone = (c.guarantorPhone || "").replace(/'/g, "\\'");

        return `
          <div class="autocomplete-item" 
               onclick="window.selectTrCustomer('${c.id}', '${nameSafe}', '${idNum}', '${phone}', '${resp}', '${addrSafe}', ${c.balance || 0}, '${guarName}', '${guarId}', '${guarPhone}')"
               style="padding:11px 16px; cursor:pointer; border-bottom:1px solid var(--border-soft, #334155); display:flex; justify-content:space-between; align-items:center; transition:background 0.15s ease;">
            <div>
              <strong style="color:var(--text-0, #fff); font-size:13.5px;">${c.name}</strong>
              <div style="font-size:11px; color:var(--text-2, #94a3b8); margin-top:2px;">${idNum ? 'سجل/هوية: ' + idNum : ''} ${phone ? ' | هاتف: ' + phone : ''}</div>
            </div>
            <div class="mono font-bold" style="font-size:12.5px; color:${(c.balance||0) > 0 ? '#ef4444' : '#10b981'};">
              ${formatCurrency(c.balance || 0)}
            </div>
          </div>
        `;
      }).join("");
      dd.style.display = "block";
    } catch (_) {}
  };

  window.selectTrCustomer = (id, name, idNum, phone, resp, addr, bal, guarName, guarId, guarPhone) => {
    document.getElementById("tr-cust-name").value = name;
    document.getElementById("tr-cust-id").value = id;
    if (document.getElementById("tr-cust-id-num")) document.getElementById("tr-cust-id-num").value = idNum;
    if (document.getElementById("tr-cust-phone")) document.getElementById("tr-cust-phone").value = phone;
    if (document.getElementById("tr-cust-resp")) document.getElementById("tr-cust-resp").value = resp;
    if (document.getElementById("tr-cust-address")) document.getElementById("tr-cust-address").value = addr;
    if (document.getElementById("tr-guar-name")) document.getElementById("tr-guar-name").value = guarName || "";
    if (document.getElementById("tr-guar-id")) document.getElementById("tr-guar-id").value = guarId || "";
    if (document.getElementById("tr-guar-phone")) document.getElementById("tr-guar-phone").value = guarPhone || "";

    const amtInput = document.getElementById("tr-amount");
    if (amtInput && (!amtInput.value || parseFloat(amtInput.value) <= 0)) {
      if (bal > 0) {
        amtInput.value = bal;
        window.updateTrTafqeet(bal);
      }
    }
    const dd = document.getElementById("tr-cust-dropdown");
    if (dd) dd.style.display = "none";
  };

  // Close dropdown on outside click
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#tr-cust-name") && !e.target.closest("#tr-cust-dropdown")) {
      const dd = document.getElementById("tr-cust-dropdown");
      if (dd) dd.style.display = "none";
    }
  });

  window.submitTrustReceipt = async (shouldSave = true) => {
    if (window._trSavingInProgress) return;

    const custName = document.getElementById("tr-cust-name")?.value.trim();
    if (!custName) {
      showToast("يرجى كتابة اسم المواطن / المستلم الرباعي", "warning");
      document.getElementById("tr-cust-name")?.focus();
      return;
    }
    const amount = parseFloat(document.getElementById("tr-amount")?.value || 0);
    if (!amount || isNaN(amount) || amount <= 0) {
      showToast("يرجى إدخال مبلغ صحيح للأمانة", "warning");
      document.getElementById("tr-amount")?.focus();
      return;
    }

    window._trSavingInProgress = true;
    const saveBtn = document.querySelector("#tr-modal-overlay button.btn-primary");
    const origBtnText = saveBtn ? saveBtn.innerHTML : "";
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<span>⏳</span> <span>جارٍ الحفظ والطباعة...</span>`;
    }

    try {
      const custIdNum = document.getElementById("tr-cust-id-num")?.value.trim() || "";
      const custPhone = document.getElementById("tr-cust-phone")?.value.trim() || "";
      const custResp = document.getElementById("tr-cust-resp")?.value.trim() || "";
      const custAddress = document.getElementById("tr-cust-address")?.value.trim() || "ينبع — المملكة العربية السعودية";
      const receiptDate = document.getElementById("tr-receipt-date")?.value || todayString();
      
      const dueType = document.querySelector("input[name='tr-due-type']:checked")?.value || "on_demand";
      const dueDate = dueType === "specific_date" ? (document.getElementById("tr-due-date")?.value || receiptDate) : "فور الطلب من الشركة";

      const nature = document.getElementById("tr-nature")?.value || "مبلغ مالي مستلم على سبيل الأمانة والعهدة";
      const guarName = document.getElementById("tr-guar-name")?.value.trim() || "";
      const guarId = document.getElementById("tr-guar-id")?.value.trim() || "";
      const guarPhone = document.getElementById("tr-guar-phone")?.value.trim() || "";
      const notes = document.getElementById("tr-notes")?.value.trim() || "";
      let custId = document.getElementById("tr-cust-id")?.value || "";

      const receiptNumber = await generateTrustReceiptNumber();

      const data = {
        receiptNumber,
        custName,
        custId,
        custIdNum,
        custPhone,
        custResp,
        custAddress,
        amount,
        amountWords: document.getElementById("tr-amount-words")?.value || tafqeetArabic(amount),
        receiptDate,
        dueDate,
        dueType,
        nature,
        guarName,
        guarId,
        guarPhone,
        notes,
        co,
        status: "active",
        createdAt: new Date().toISOString()
      };

      if (shouldSave) {
        try {
          // Save standalone trust receipt in Firestore
          await create(COLS.trustReceipts(), data);
          showToast("تم حفظ سند الأمانة برقم: " + receiptNumber, "success");
          if (typeof window.loadTrustReceipts === "function") {
            await window.loadTrustReceipts();
          }
        } catch (saveErr) {
          console.error("Failed to save trust receipt to DB:", saveErr);
          showToast("تعذر الحفظ في قاعدة البيانات ولكن سيتم المتابعة للطباعة", "warning");
        }
      }

      // Close the modal so it exits immediately
      document.getElementById("tr-modal-overlay")?.remove();

      // Print the formal document
      await generateAndPrintTrustReceipt(data);
    } catch (err) {
      console.error("[submitTrustReceipt] Error:", err);
      showToast("حدث خطأ: " + err.message, "error");
    } finally {
      window._trSavingInProgress = false;
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = origBtnText;
      }
    }
  };

  window.switchToGoodsReceiptAckModal = async () => {
    const custName = document.getElementById("tr-cust-name")?.value;
    const custId = document.getElementById("tr-cust-id")?.value;
    const custIdNum = document.getElementById("tr-cust-id-num")?.value;
    const custPhone = document.getElementById("tr-cust-phone")?.value;
    const custAddress = document.getElementById("tr-cust-address")?.value;
    const custResp = document.getElementById("tr-cust-resp")?.value;

    document.getElementById("tr-modal-overlay")?.remove();
    if (typeof window.openGoodsReceiptAckModal === "function") {
      window.openGoodsReceiptAckModal({
        customerId: custId,
        customerObj: { id: custId, name: custName, idNumber: custIdNum, phone: custPhone, address: custAddress, contactPerson: custResp }
      });
    } else {
      const mod = await import("./goods-receipt-ack.js?v=1.0");
      mod.openGoodsReceiptAckModal({
        customerId: custId,
        customerObj: { id: custId, name: custName, idNumber: custIdNum, phone: custPhone, address: custAddress, contactPerson: custResp }
      });
    }
  };
}

/**
 * توليد وطباعة وثيقة سند الأمانة والعهدة الرسمية A4
 * مصممة كـ وثيقة قضائية ملكية مذهبة (Executive Sovereign Bond Layout)
 */
export async function generateAndPrintTrustReceipt(data) {
  const {
    receiptNumber, custName, custIdNum, custPhone, custResp, custAddress,
    amount, amountWords, receiptDate, dueDate, nature,
    guarName, guarId, guarPhone, notes, co
  } = data;

  const coName = co?.name || "شركة نظم الإمداد المتطورة";
  const coCR = co?.crNumber || co?.cr || "7054969006";
  const coVat = co?.vatNumber || "314996148100003";
  const coPhone = co?.phone || "0549141648";
  const coAddress = co?.address || "مبنى 7689 — شارع ينبع الصناعية 2179 — حي غرناطة — ينبع — رمز 46414";

  // 1. Pre-load company LOGO (شعار الشركة الرسمي من الإعدادات / التقارير)
  let logoUrl = co?.logoUrl || "";
  if (!logoUrl) {
    try {
      const cached = JSON.parse(localStorage.getItem("idham_company") || "{}");
      logoUrl = cached.logoUrl || cached.logoBase64 || cached.dataUrl || "";
    } catch (_) {}
  }
  if (!logoUrl) {
    try {
      const logoSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "logo"));
      if (logoSnap.exists()) {
        const ld = logoSnap.data();
        logoUrl = ld.dataUrl || ld.logoBase64 || ld.url || ld.logoUrl || "";
      }
    } catch (e) {
      console.warn("Could not fetch company logo:", e);
    }
  }

  // 2. Pre-load company STAMP (خاتم الشركة للاعتماد والتوقيع فقط في الأسفل)
  let stampB64 = "";
  try {
    const r = await fetch("/icons/company-stamp.png?t=" + Date.now());
    const blob = await r.blob();
    stampB64 = await new Promise(res => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (_) {}

  const dateHijri = getHijriDate(new Date(receiptDate));
  const dueDisplay = dueDate === "فور الطلب من الشركة" 
    ? "فور طلب شركة نظم الإمداد المتطورة في أي وقت دون قيد أو شرط" 
    : `في موعد أقصاه تاريخ: ${formatDate(dueDate)}`;

  const win = window.open("", "_blank", "width=920,height=990");
  if (!win) {
    showToast("يرجى السماح بالنوافذ المنبثقة للطباعة", "error");
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>سند أمانة وعهدة مالية — ${custName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4 portrait; margin: 8mm 10mm; }
    body {
      font-family: 'Cairo', -apple-system, BlinkMacSystemFont, Tahoma, sans-serif;
      font-size: 11px;
      line-height: 1.55;
      color: #0f172a;
      background: #f8fafc;
      direction: rtl;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page-container {
      width: 100%;
      max-width: 194mm;
      margin: 0 auto;
      background: #fff;
      border: 3px double #0f172a;
      outline: 1.5px solid #d97706;
      outline-offset: -6px;
      padding: 16px 20px;
      position: relative;
    }
    /* Corner Ornaments */
    .corner-decor {
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid #d97706;
    }
    .c-tl { top: 9px; right: 9px; border-bottom: none; border-left: none; }
    .c-tr { top: 9px; left: 9px; border-bottom: none; border-right: none; }
    .c-bl { bottom: 9px; right: 9px; border-top: none; border-left: none; }
    .c-br { bottom: 9px; left: 9px; border-top: none; border-right: none; }

    /* Security Watermark */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 52px;
      font-weight: 900;
      color: rgba(15, 23, 42, 0.035);
      white-space: nowrap;
      pointer-events: none;
      letter-spacing: 4px;
      z-index: 1;
    }

    /* Header */
    .header-table {
      width: 100%;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 10px;
      margin-bottom: 10px;
      position: relative;
      z-index: 2;
    }
    .co-title {
      font-size: 15px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 0.3px;
      white-space: nowrap;
    }
    .co-meta {
      font-size: 9.5px;
      color: #334155;
      font-weight: 600;
      margin-top: 1px;
    }
    .doc-center-badge {
      text-align: center;
      background: #ffffff !important;
      color: #0f172a !important;
      padding: 6px 14px;
      border-radius: 8px;
      border: 2px solid #0f172a;
    }
    .doc-royal-title {
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.5px;
      color: #0f172a !important;
    }
    .doc-en-title {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #475569 !important;
      margin-top: 1px;
    }
    .serial-box {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 12px;
      font-weight: 900;
      color: #000000 !important;
      margin-top: 4px;
      padding: 3px 10px;
      background: #f8fafc;
      border: 1.5px solid #0f172a;
      border-radius: 4px;
      display: inline-block;
      letter-spacing: 0.5px;
    }

    /* Legal Banner */
    .legal-cite-banner {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-right: 4px solid #b45309;
      padding: 6px 12px;
      font-size: 9.5px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 10px;
      line-height: 1.5;
      text-align: justify;
      position: relative;
      z-index: 2;
    }

    /* Parties Data Table */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      position: relative;
      z-index: 2;
    }
    .data-table th, .data-table td {
      border: 1px solid #94a3b8;
      padding: 6px 10px;
      font-size: 11px;
      vertical-align: middle;
    }
    .data-table th {
      background: #f8fafc;
      color: #0f172a;
      font-weight: 800;
      text-align: right;
      width: 25%;
      white-space: nowrap;
    }
    .data-table td {
      background: #fff;
      color: #0f172a;
      width: 75%;
    }

    /* Amount Vault Highlight */
    .amount-highlight {
      background: linear-gradient(135deg, #fffbeb 0%, #fef2f2 100%) !important;
      border: 2px solid #b45309 !important;
      padding: 8px 14px;
      margin-bottom: 10px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 2;
    }
    .amount-digits {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 18px;
      font-weight: 900;
      color: #b91c1c;
      direction: ltr;
    }
    .amount-words {
      font-size: 11.5px;
      font-weight: 800;
      color: #1e293b;
      margin-top: 2px;
    }

    /* Clauses */
    .clauses-box {
      border: 1px solid #cbd5e1;
      background: #fafafa;
      padding: 8px 12px;
      border-radius: 8px;
      margin-bottom: 10px;
      position: relative;
      z-index: 2;
    }
    .clauses-title {
      font-size: 11px;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 5px;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 3px;
    }
    .clause-item {
      font-size: 9.5px;
      line-height: 1.5;
      color: #1e293b;
      margin-bottom: 4px;
      text-align: justify;
    }
    .clause-item strong {
      color: #b91c1c;
    }

    /* Security Signatures Grid */
    .sig-section {
      display: grid;
      grid-template-columns: 1.25fr 1fr;
      gap: 10px;
      margin-top: 6px;
      page-break-inside: avoid;
      position: relative;
      z-index: 2;
    }
    .sig-card {
      border: 1.5px solid #0f172a;
      border-radius: 8px;
      padding: 8px 10px;
      background: #fff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 165px;
    }
    .sig-card-title {
      font-size: 11px;
      font-weight: 900;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 3px;
      margin-bottom: 5px;
      text-align: center;
    }
    .sig-fields {
      font-size: 9.5px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .thumb-and-sign {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 6px;
      gap: 8px;
    }
    .thumb-box {
      width: 78px;
      height: 78px;
      border: 1.5px dashed #0f172a;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      font-weight: 800;
      color: #475569;
      background: #f8fafc;
      flex-shrink: 0;
      text-align: center;
    }
    .stamp-container {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 125px;
      margin: 4px auto 0;
    }
    .stamp-img {
      max-height: 120px;
      max-width: 160px;
      width: 120px;
      height: 120px;
      object-fit: contain;
      mix-blend-mode: multiply;
      filter: drop-shadow(0 2px 5px rgba(0,0,0,0.14));
    }
    .footer-bar {
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px solid #cbd5e1;
      font-size: 8.5px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      position: relative;
      z-index: 2;
    }
  </style>
</head>
<body onload="window.print()">

<div class="page-container">
  <div class="corner-decor c-tl"></div>
  <div class="corner-decor c-tr"></div>
  <div class="corner-decor c-bl"></div>
  <div class="corner-decor c-br"></div>
  <div class="watermark">نظم الإمداد المتطورة — عهدة وأمانة</div>

  <!-- Header -->
  <!-- Header -->
  <table class="header-table">
    <tr>
      <td style="width:28%; vertical-align:middle; text-align:right;">
        ${logoUrl ? `
          <img src="${logoUrl}" style="max-height:80px; max-width:165px; object-fit:contain;" alt="شعار الشركة"/>
        ` : `
          <div style="width:68px; height:68px; border-radius:10px; background:linear-gradient(135deg, #09122c, #1e3a8a); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; font-size:18px;">نظم الإمداد</div>
        `}
      </td>
      <td style="width:38%; text-align:center; vertical-align:middle;">
        <div class="doc-center-badge">
          <div class="doc-royal-title" style="white-space:nowrap;">سـنـد اسـتـلام عـلـى سـبـيـل الأمـانـة والـعـهـدة</div>
          <div class="doc-en-title">FIDUCIARY TRUST & CUSTODY BOND</div>
          <div class="serial-box">رقم السند: ${receiptNumber}</div>
        </div>
      </td>
      <td style="width:34%; text-align:left; vertical-align:middle; direction:rtl;">
        <div class="co-title" style="white-space:nowrap;">${coName}</div>
        <div class="co-meta">س.ت: <strong style="font-family:'IBM Plex Mono',monospace;">${coCR}</strong></div>
        <div class="co-meta">الرقم الضريبي: <strong style="font-family:'IBM Plex Mono',monospace;">${coVat}</strong></div>
        <div class="co-meta">ينبع الصناعية — هاتف: ${coPhone}</div>
        <div class="co-meta">التاريخ: ${receiptDate} م (${dateHijri})</div>
      </td>
    </tr>
  </table>

  <!-- Legal Citation Banner -->
  <div class="legal-cite-banner">
    ⚖️ <strong>السند النظامي والجزائي:</strong> يحرر هذا السند كوثيقة استلام على سبيل الأمانة والعهدة التامة الخالصة، ويخضع لأحكام <strong>نظام مكافحة الاحتيال المالي وخيانة الأمانة</strong> الصادر بالمرسوم الملكي رقم (م/79) وتاريخ 10/09/1442هـ وأحكام عقد الوديعة بنظام المعاملات المدنية، ويعد أي امتناع أو تأخير أو تصرف في هذه الأمانة جريمة خيانة أمانة موجبة للمساءلة الجنائية والمنع من السفر والعقوبات المقررة نظاماً.
  </div>

  <!-- Parties Data Table (كل بيان على سطر واحد مستقل بعمودين متناسقين) -->
  <table class="data-table">
    <tr>
      <th>المستلم الأمين:</th>
      <td><strong style="font-size:12px; color:#0f172a;">${custName}</strong></td>
    </tr>
    <tr>
      <th>رقم الهوية الوطنية / الإقامة:</th>
      <td style="font-family:'IBM Plex Mono',monospace; font-weight:700; font-size:11.5px;">${custIdNum || "—"}</td>
    </tr>
    <tr>
      <th>رقم الجوال:</th>
      <td style="font-family:'IBM Plex Mono',monospace; font-weight:700; font-size:11.5px;">${custPhone || "—"}</td>
    </tr>
    ${(custResp && custResp.trim() && custResp.trim() !== custName && custResp.trim() !== 'الأمين المستلم') ? `
    <tr>
      <th>المفوض بالاستلام:</th>
      <td><strong>${custResp}</strong></td>
    </tr>
    ` : ''}
    <tr>
      <th>العنوان الوطني للتبليغ:</th>
      <td>${custAddress || "ينبع — المملكة العربية السعودية"}</td>
    </tr>
    <tr>
      <th>الجهة المودعة (صاحب الأمانة):</th>
      <td><strong>${coName}</strong> — سجل تجاري: <span style="font-family:'IBM Plex Mono',monospace; font-weight:700;">${coCR}</span> — الرقم الضريبي: <span style="font-family:'IBM Plex Mono',monospace; font-weight:700;">${coVat}</span></td>
    </tr>
    <tr>
      <th>طبيعة وموضوع الأمانة:</th>
      <td><strong>${nature}</strong></td>
    </tr>
    <tr>
      <th>موعد رد الأمانة / الاستحقاق:</th>
      <td><strong style="color:#b91c1c;">${dueDisplay}</strong></td>
    </tr>
    ${notes ? `<tr><th>ملاحظات المستند:</th><td>${notes}</td></tr>` : ''}
  </table>

  <!-- Amount Highlight Vault -->
  <div class="amount-highlight">
    <div>
      <div style="font-size:10px; font-weight:800; color:#991b1b;">مبلغ وقيمة الأمانة والعهدة المقر باستلامها:</div>
      <div class="amount-words">فقط وقدره: [ ${amountWords} ]</div>
    </div>
    <div class="amount-digits">${formatCurrency(amount)}</div>
  </div>

  <!-- Legal Undertakings & Clauses -->
  <div class="clauses-box">
    <div class="clauses-title">📜 إقرار وتعهدات المستلم الأمين القانونية المشددة:</div>
    <div class="clause-item">
      <strong>1. الإقرار بالقبض والصفة:</strong> أقر وأعترف بكامل أهليتي المعتبرة شرعاً ونظاماً بأنني قد استلمت من شركة نظم الإمداد المتطورة المبلغ/الأعيان الموضحة أعلاه على سبيل <strong>الأمانة والعهدة التامة والوديعة الشرعية</strong>، وليست ملكاً لي ولا جزءاً من ذمتي المالية الخاصة.
    </div>
    <div class="clause-item">
      <strong>2. الالتزام بالحفظ والرد الفوري:</strong> أتعهد وألتزم بالمحافظة على هذه الأمانة ورعايتها وردها وتسليمها بالكامل نقداً أو بحساب الشركة البنكي <strong>فور طلب الشركة الدائنة في أي وقت</strong> أو في موعد أقصاه التاريخ المحدد أعلاه دون أدنى تأخير أو مماطلة أو قيد أو شرط.
    </div>
    <div class="clause-item">
      <strong>3. المسؤولية الجنائية الصارمة:</strong> أقر بعلمي التام بأن التصرف في هذا المبلغ أو استهلاكه أو إنكاره أو التأخر في تسليمه فور الطلب يشكل <strong>جريمة خيانة أمانة مكتملة الأركان</strong> بموجب المادة الثانية من نظام مكافحة الاحتيال المالي وخيانة الأمانة (المرسوم الملكي م/79) وتعاقب بالسجن والغرامة والمنع من السفر، مع تحملي لكافة التعويضات وأتعاب المحاماة.
    </div>
    <div class="clause-item">
      <strong>4. الإخطار والاختصاص:</strong> أقر بصحة العنوان الوطني ورقم الجوال المدونين أعلاه، وأعتبرهما موطناً صالحاً لإبلاغي بكافة الإخطارات القضائية، وتختص محاكم المملكة بنظر أي نزاع.
    </div>
  </div>

  <!-- Signatures Grid -->
  <div class="sig-section">
    
    <!-- Trustee Signature (فقط اسم المستلم ورقم الهوية ورقم الجوال والتوقيع لكتابتها يدوي) -->
    <div class="sig-card">
      <div class="sig-card-title">إقرار وتوقيع</div>
      <div class="sig-fields" style="font-size:11.5px; line-height:2.4; margin-top:6px;">
        <div style="display:flex; align-items:flex-end; gap:6px;">
          <span style="font-weight:800; color:#0f172a; white-space:nowrap;">اسم المستلم:</span>
          <span style="flex:1; border-bottom:1.5px dotted #64748b; height:18px;"></span>
        </div>
        <div style="display:flex; align-items:flex-end; gap:6px;">
          <span style="font-weight:800; color:#0f172a; white-space:nowrap;">رقم الهوية:</span>
          <span style="flex:1; border-bottom:1.5px dotted #64748b; height:18px;"></span>
        </div>
        <div style="display:flex; align-items:flex-end; gap:6px;">
          <span style="font-weight:800; color:#0f172a; white-space:nowrap;">رقم الجوال:</span>
          <span style="flex:1; border-bottom:1.5px dotted #64748b; height:18px;"></span>
        </div>
        <div style="display:flex; align-items:flex-end; gap:6px; margin-top:10px;">
          <span style="font-weight:800; color:#0f172a; white-space:nowrap;">التوقيع:</span>
          <span style="flex:1; border-bottom:1.5px solid #0f172a; height:18px;"></span>
        </div>
      </div>
    </div>

    <!-- Solidary Guarantor OR Creditor Stamp -->
    ${guarName ? `
    <div class="sig-card">
      <div class="sig-card-title">الكفيل الغارم المتضامن</div>
      <div class="sig-fields" style="font-size:11.5px; line-height:2.4; margin-top:6px;">
        <div style="display:flex; align-items:flex-end; gap:6px;">
          <span style="font-weight:800; color:#0f172a; white-space:nowrap;">اسم الكفيل:</span>
          <span style="flex:1; border-bottom:1.5px dotted #64748b; height:18px;"></span>
        </div>
        <div style="display:flex; align-items:flex-end; gap:6px;">
          <span style="font-weight:800; color:#0f172a; white-space:nowrap;">رقم الهوية:</span>
          <span style="flex:1; border-bottom:1.5px dotted #64748b; height:18px;"></span>
        </div>
        <div style="display:flex; align-items:flex-end; gap:6px;">
          <span style="font-weight:800; color:#0f172a; white-space:nowrap;">رقم الجوال:</span>
          <span style="flex:1; border-bottom:1.5px dotted #64748b; height:18px;"></span>
        </div>
        <div style="display:flex; align-items:flex-end; gap:6px; margin-top:10px;">
          <span style="font-weight:800; color:#0f172a; white-space:nowrap;">التوقيع:</span>
          <span style="flex:1; border-bottom:1.5px solid #0f172a; height:18px;"></span>
        </div>
      </div>
    </div>
    ` : `
    <div class="sig-card" style="border-color:#0284c7; background:#f8fafc;">
      <div class="sig-card-title" style="color:#0369a1;">اعتماد وخاتم المودع (${coName})</div>
      <div class="sig-fields" style="font-size:11px; line-height:1.9;">
        <div>المنشأة: <strong>${coName}</strong></div>
        <div>السجل التجاري: <span style="font-family:'IBM Plex Mono',monospace; font-weight:700; font-size:11.5px;">${coCR}</span></div>
      </div>
      <div class="stamp-container" style="margin-top:4px;">
        ${stampB64 ? `<img src="${stampB64}" class="stamp-img" alt="ختم الشركة"/>` : `<div style="height:60px;"></div>`}
      </div>
    </div>
    `}

  </div>

  ${guarName ? `
  <!-- If guarantor exists, add company stamp below full width -->
  <div style="margin-top:8px; border:1px solid #cbd5e1; border-radius:6px; padding:6px 14px; display:flex; justify-content:space-between; align-items:center; background:#f8fafc; z-index:2; position:relative;">
    <div>
      <div style="font-size:10.5px; font-weight:800; color:#0f172a;">اعتماد المودع: ${coName} (سجل: ${coCR})</div>
      <div style="font-size:8.5px; color:#64748b;">تاريخ التحرير: ${receiptDate} م — وثيقة أمانة وعهدة رسمية معتمدة</div>
    </div>
    <div>
      ${stampB64 ? `<img src="${stampB64}" style="max-height:75px; max-width:140px; object-fit:contain; mix-blend-mode:multiply; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.12));" alt="ختم الشركة"/>` : ''}
    </div>
  </div>
  ` : ''}

  <!-- Footer -->
  <div class="footer-bar">
    <span>سند أمانة وعهدة مالية رقم: <strong style="font-family:'IBM Plex Mono',monospace; color:#0f172a;">${receiptNumber}</strong></span>
    <span>تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA")} م</span>
    <span>وثيقة رسمية يعتد بها في الإثبات القضائي والملاحقة الجزائية بالمملكة العربية السعودية</span>
  </div>

</div>

</body>
</html>`;

  win.document.write(html);
  win.document.close();
}

/**
 * شاشة إدارة واستعراض سندات الأمانة والعهدة
 */
export async function render(container, user) {
  container.innerHTML = `
    <div class="filterbar" style="flex-wrap:wrap; gap:8px;">
      <div class="search-bar" style="max-width:280px;">
        <input type="text" id="tr-filter-search" class="input" placeholder="🔍  بحث بالعميل أو رقم السند أو الهوية…" oninput="window.filterTrustReceipts()"/>
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="tr-filter-status" onchange="window.filterTrustReceipts()">
          <option value="">الكل</option>
          <option value="active">قائم (تحت يد المستلم)</option>
          <option value="returned">تم رد الأمانة (مغلق)</option>
          <option value="breached">متأخر / مطالب به قضائياً</option>
          <option value="cancelled">ملغي</option>
        </select>
      </div>
      <div style="margin-right:auto; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn btn-secondary" onclick="window.print()">🖨️ طباعة القائمة</button>
        <button class="btn btn-secondary" onclick="window.openGoodsReceiptAckModal ? window.openGoodsReceiptAckModal() : import('./goods-receipt-ack.js?v=1.0').then(m => m.openGoodsReceiptAckModal())" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color:#fff; border:none; box-shadow:0 4px 12px rgba(2,132,199,0.35); font-weight:800;">
          📜 + إقرار استلام بضاعة وسند لأمر
        </button>
        <button class="btn btn-primary" onclick="window.openTrustReceiptModal()" style="background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); border:none; box-shadow:0 4px 12px rgba(30,58,138,0.35);">
          🛡️ + إصدار سند أمانة جديد
        </button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header" style="margin-bottom:16px;">
        <div class="page-header-left">
          <h1 class="page-title" style="display:flex; align-items:center; gap:8px;">
            <span>🛡️</span> <span>سندات الأمانة والعهدة المالية</span>
          </h1>
          <p class="page-subtitle" id="tr-count">جاري التحميل…</p>
        </div>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid" id="tr-kpis" style="margin-bottom:20px; display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px;"></div>

      <!-- Table Card -->
      <div class="card">
        <div class="table-container">
          <table class="data-dense" id="tr-table">
            <thead>
              <tr>
                <th>رقم السند</th>
                <th>العميل المستلم (الأمين)</th>
                <th>رقم الهوية / السجل</th>
                <th>رقم الجوال</th>
                <th>المبلغ</th>
                <th>تاريخ الاستلام</th>
                <th>موعد الرد</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody id="tr-tbody">
              <tr><td colspan="9" style="text-align:center; padding:30px; color:var(--text-2);">جاري تحميل السجلات…</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  let cachedReceipts = [];

  window.renderTrustReceiptsList = (list) => {
    const tbody = document.getElementById("tr-tbody");
    const countEl = document.getElementById("tr-count");
    const kpiEl = document.getElementById("tr-kpis");

    if (countEl) countEl.textContent = `إجمالي السندات: ${list.length} سند`;

    // Calculate KPIs
    let totalAmt = 0;
    let activeAmt = 0;
    let returnedAmt = 0;
    list.forEach(r => {
      const a = parseFloat(r.amount || 0);
      totalAmt += a;
      if (r.status === "returned") returnedAmt += a;
      else if (r.status !== "cancelled") activeAmt += a;
    });

    if (kpiEl) {
      kpiEl.innerHTML = `
        <div class="kpi-card" style="border-right:4px solid #3b82f6;">
          <div class="kpi-label">إجمالي مبالغ الأمانات</div>
          <div class="kpi-value mono">${formatCurrency(totalAmt)}</div>
          <div class="kpi-sub">${list.length} سند مسجل</div>
        </div>
        <div class="kpi-card" style="border-right:4px solid #ef4444;">
          <div class="kpi-label">أمانات قائمة تحت يد المستلمين</div>
          <div class="kpi-value mono" style="color:#ef4444;">${formatCurrency(activeAmt)}</div>
          <div class="kpi-sub">${list.filter(r => r.status === 'active' || !r.status).length} سند قائم</div>
        </div>
        <div class="kpi-card" style="border-right:4px solid #10b981;">
          <div class="kpi-label">أمانات تم استردادها وتسويتها</div>
          <div class="kpi-value mono" style="color:#10b981;">${formatCurrency(returnedAmt)}</div>
          <div class="kpi-sub">${list.filter(r => r.status === 'returned').length} سند مسدد ومبرأ</div>
        </div>
      `;
    }

    if (!tbody) return;

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:35px; color:var(--text-2);">لا توجد سندات أمانة مسجلة بعد. اضغط على "+ إصدار سند أمانة جديد" لإصدار أول سند.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(r => {
      const isReturned = r.status === "returned";
      const isCancelled = r.status === "cancelled";
      const statusLabel = isReturned ? "✅ تم الاسترداد" : isCancelled ? "⛔ ملغي" : "🟢 قائم تحت اليد";
      const statusClass = isReturned ? "good" : isCancelled ? "neutral" : "bad";

      return `
        <tr>
          <td class="mono font-bold" style="color:var(--brand);">${r.receiptNumber || "—"}</td>
          <td><strong>${r.custName}</strong></td>
          <td class="mono">${r.custIdNum || "—"}</td>
          <td class="mono">${r.custPhone || "—"}</td>
          <td class="mono font-bold" style="color:#b91c1c;">${formatCurrency(r.amount || 0)}</td>
          <td>${formatDate(r.receiptDate)}</td>
          <td style="font-size:11px;">${r.dueDate === "فور الطلب من الشركة" ? '<span class="badge badge-warning">فور الطلب</span>' : formatDate(r.dueDate)}</td>
          <td><span class="badge badge-${statusClass}">${statusLabel}</span></td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-icon sm" onclick="window.reprintTrustReceipt('${r.id}')" title="طباعة السند">🖨️</button>
              ${!isReturned && !isCancelled ? `
                <button class="btn btn-icon sm" style="color:#10b981;" onclick="window.markTrustReceiptReturned('${r.id}')" title="إثبات استرداد الأمانة وإبراء الذمة">✅</button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join("");
  };

  window.loadTrustReceipts = async () => {
    try {
      // 2.5 second timeout safeguard so UI never hangs
      const timeoutPromise = new Promise((_, rej) => setTimeout(() => rej(new Error("Timeout")), 2500));
      const fetchPromise = getAll(COLS.trustReceipts());
      
      const records = await Promise.race([fetchPromise, timeoutPromise]).catch(async (err) => {
        console.warn("[TrustReceipts] Fast fetch timeout or error, checking local db:", err.message);
        try {
          const snap = await getDocs(COLS.trustReceipts());
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (_) {
          return [];
        }
      });

      cachedReceipts = Array.isArray(records) ? records : [];
      cachedReceipts.sort((a, b) => new Date(b.createdAt || b.receiptDate || 0) - new Date(a.createdAt || a.receiptDate || 0));
      window.renderTrustReceiptsList(cachedReceipts);
    } catch (e) {
      console.error("Error loading trust receipts:", e);
      cachedReceipts = [];
      window.renderTrustReceiptsList([]);
    }
  };

  window.filterTrustReceipts = () => {
    const q = (document.getElementById("tr-filter-search")?.value || "").trim().toLowerCase();
    const st = document.getElementById("tr-filter-status")?.value || "";

    const filtered = cachedReceipts.filter(r => {
      const matchQ = !q || 
        (r.custName || "").toLowerCase().includes(q) ||
        (r.receiptNumber || "").toLowerCase().includes(q) ||
        (r.custIdNum || "").includes(q) ||
        (r.custPhone || "").includes(q);
      const matchSt = !st || r.status === st;
      return matchQ && matchSt;
    });

    window.renderTrustReceiptsList(filtered);
  };

  window.reprintTrustReceipt = (id) => {
    const r = cachedReceipts.find(x => x.id === id);
    if (!r) return;
    generateAndPrintTrustReceipt(r);
  };

  window.markTrustReceiptReturned = async (id) => {
    if (!confirm("هل أنت متأكد من إثبات استرداد هذه الأمانة بالكامل وإبراء ذمة المستلم؟")) return;
    try {
      await update(COLS.trustReceipts(), id, {
        status: "returned",
        returnedAt: new Date().toISOString()
      });
      showToast("تم تحديث حالة السند إلى (تم الاسترداد)", "success");
      await window.loadTrustReceipts();
    } catch (e) {
      showToast("حدث خطأ أثناء التحديث", "error");
    }
  };

  // Render initial zero state immediately for instant feedback
  window.renderTrustReceiptsList([]);

  // Fetch real data asynchronously (non-blocking for 0ms router speed)
  window.loadTrustReceipts().catch(console.warn);

  return () => {
    // Cleanup if needed
  };
}

// Global exposure
if (typeof window !== "undefined") {
  window.openTrustReceiptModal = openTrustReceiptModal;
  window.generateAndPrintTrustReceipt = generateAndPrintTrustReceipt;
}
