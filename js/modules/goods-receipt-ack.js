// ============================================================
// IDHAM ERP — Goods Receipt & Promissory Note Debt Acknowledgment Module
// إقرار استلام بضاعة عينية وإقرار بمديونية ثمنها مرتبط بسند لأمر
// سند مركب لحماية مبيعات الأجل وإثبات واقعة التسليم وربط السند لأمر التنفيذي
// وفقاً لنظام الإثبات (م/43)، نظام المعاملات المدنية، ونظام الأوراق التجارية السعودي
// ============================================================

import { COLS, getAll, getById, create, update, db, COMPANY_ID, doc, getDoc, getDocs, collection, query, where, orderBy, limit } from "../utils/db.js";
import { formatCurrency, formatDate, todayString, tafqeetArabic } from "../utils/formatters.js";

const showToast = (...a) => (window.showToast ? window.showToast(...a) : console.log(...a));

/**
 * حساب إجمالي السطر شاملاً ضريبة القيمة المضافة بدقة لجميع أنواع المستندات
 * يدعم فواتير المبيعات وعروض الأسعار مع مراعاة الكمية، سعر الوحدة، الخصم، ونسبة الضريبة
 */
export function calculateItemLineTotal(it) {
  if (!it) return 0;

  // 1. إذا كان إجمالي السطر بالضريبة محسوباً ومخزناً بالفعل (مثل بعض عروض الأسعار)
  if (it.grandTotal !== undefined && !isNaN(parseFloat(it.grandTotal)) && parseFloat(it.grandTotal) > 0) {
    return Math.round(parseFloat(it.grandTotal) * 100) / 100;
  }
  if (it.totalWithVat !== undefined && !isNaN(parseFloat(it.totalWithVat)) && parseFloat(it.totalWithVat) > 0) {
    return Math.round(parseFloat(it.totalWithVat) * 100) / 100;
  }
  if (it.lineTotalWithVat !== undefined && !isNaN(parseFloat(it.lineTotalWithVat)) && parseFloat(it.lineTotalWithVat) > 0) {
    return Math.round(parseFloat(it.lineTotalWithVat) * 100) / 100;
  }

  // 2. إذا كان السطر من إقرار محفوظ سابقاً تم إدخال إجماليه يدوياً دون سعر وحدة
  if (it.unitPrice === undefined && it.price === undefined && it.salePrice === undefined && it.total !== undefined && !isNaN(parseFloat(it.total))) {
    return Math.round(parseFloat(it.total) * 100) / 100;
  }

  // 3. حساب القيمة بناءً على الكمية وسعر الوحدة والخصم والضريبة
  const qty = parseFloat(it.qty !== undefined ? it.qty : (it.quantity || 1)) || 0;
  const unitPrice = parseFloat(
    it.unitPrice !== undefined ? it.unitPrice :
    (it.price !== undefined ? it.price :
    (it.salePrice !== undefined ? it.salePrice : 0))
  ) || 0;

  // حساب مبلغ الخصم (نسبة مئوية أو مبلغ مقطوع)
  let discountAmt = 0;
  if (it.discount !== undefined && it.discount !== null && !isNaN(parseFloat(it.discount))) {
    const d = parseFloat(it.discount);
    if (d > 0 && d <= 100) {
      discountAmt = (qty * unitPrice * d) / 100;
    } else if (d > 100) {
      discountAmt = d;
    }
  }

  // القيمة بعد الخصم وقبل الضريبة
  let baseAmount = Math.max(0, (qty * unitPrice) - discountAmt);
  if (baseAmount === 0 && it.total && !isNaN(parseFloat(it.total))) {
    baseAmount = parseFloat(it.total);
  }

  // إذا كانت قيمة الضريبة مخزنة مسبقاً كمبلغ محدد
  if (it.vat !== undefined && !isNaN(parseFloat(it.vat)) && parseFloat(it.vat) > 0) {
    return Math.round((baseAmount + parseFloat(it.vat)) * 100) / 100;
  }

  // تحديد نسبة الضريبة (الافتراضي 15% إلا إذا كانت معفاة E أو خاضعة للصفر Z)
  let vatRate = 0.15;
  if (it.taxCategory === "E" || it.taxCategory === "Z" || it.taxRate === 0) {
    vatRate = 0;
  } else if (it.taxRate !== undefined && it.taxRate !== null && !isNaN(parseFloat(it.taxRate))) {
    vatRate = parseFloat(it.taxRate) / 100;
  }

  const lineTotal = baseAmount * (1 + vatRate);
  return Math.round(lineTotal * 100) / 100;
}

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
 * توليد رقم تسلسلي فريد لإقرار استلام البضاعة
 */
export async function generateGoodsReceiptAckNumber() {
  const year = new Date().getFullYear();
  let seq = 1;
  try {
    const existing = await getAll(COLS.goodsReceiptAcks());
    const yearNotes = existing.filter(n => (n.docNumber || "").startsWith(`GRA-${year}`));
    if (yearNotes.length > 0) {
      const nums = yearNotes.map(n => {
        const parts = (n.docNumber || "").split("-");
        return parseInt(parts[parts.length - 1] || "0", 10);
      }).filter(n => !isNaN(n));
      if (nums.length > 0) seq = Math.max(...nums) + 1;
    }
  } catch (_) {
    seq = Math.floor(1000 + Math.random() * 9000);
  }
  return `GRA-${year}-${String(seq).padStart(4, "0")}`;
}

/**
 * فتح نافذة إنشاء وتخصيص إقرار استلام بضاعة عينية مرتبط بسند لأمر
 * @param {object} options { customerId, customerObj, invoiceId, invoiceObj, promissoryNoteId }
 */
export async function openGoodsReceiptAckModal(options = {}) {
  // Remove existing modal if already open
  const existing = document.getElementById("gra-modal-overlay");
  if (existing) existing.remove();

  const today = todayString();

  // 1. Company Defaults
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

  // 2. Fetch Customers, Invoices, and Quotations
  let allCustomers = [];
  let currentCust = null;
  let targetInvoice = options.invoiceObj || null;
  let targetQuote = options.quoteObj || null;

  try {
    allCustomers = await getAll(COLS.customers());
    if (options.customerId) {
      currentCust = allCustomers.find(c => c.id === options.customerId) || null;
    } else if (options.customerObj) {
      currentCust = options.customerObj;
    }
    if (!targetInvoice && options.invoiceId) {
      targetInvoice = await getById("salesInvoices", options.invoiceId);
    }
    if (!targetQuote && options.quoteId) {
      targetQuote = await getById("quotations", options.quoteId);
    }
  } catch (err) {
    console.warn("[GoodsReceiptAck] Preload error:", err);
  }

  if (targetInvoice && !currentCust) {
    currentCust = allCustomers.find(c => c.id === targetInvoice.customerId || c.name === targetInvoice.customerName) || {
      id: targetInvoice.customerId,
      name: targetInvoice.customerName,
      phone: targetInvoice.customerPhone,
      crNumber: targetInvoice.customerTaxNumber || targetInvoice.customerCr
    };
  } else if (targetQuote && !currentCust) {
    currentCust = allCustomers.find(c => c.id === targetQuote.customerId || c.name === targetQuote.customerName) || {
      id: targetQuote.customerId,
      name: targetQuote.customerName,
      phone: targetQuote.customerPhone,
      crNumber: targetQuote.customerCr || targetQuote.customerTaxNumber
    };
  }

  // Pre-fill initial items from invoice or quotation if available
  let initialItems = [];
  const sourceItems = targetInvoice ? (targetInvoice.items || targetInvoice.lines || []) : (targetQuote ? (targetQuote.items || []) : []);
  if (sourceItems.length > 0) {
    initialItems = sourceItems.map((it, idx) => ({
      index: idx + 1,
      name: it.productName || it.name || it.description || "",
      unit: it.unit || it.unitName || "كرتون",
      qty: parseFloat(it.qty !== undefined ? it.qty : (it.quantity || 1)) || 1,
      total: calculateItemLineTotal(it)
    }));
  } else {
    initialItems = [
      { index: 1, name: "", unit: "كرتون", qty: "", total: "" },
      { index: 2, name: "", unit: "كرتون", qty: "", total: "" },
      { index: 3, name: "", unit: "كرتون", qty: "", total: "" }
    ];
  }

  const defaultDocNumber = await generateGoodsReceiptAckNumber();
  const calculatedItemsTotal = initialItems.reduce((acc, it) => acc + (parseFloat(it.total) || 0), 0);

  let defaultTotal = 0;
  let defaultPaid = 0;
  if (targetInvoice) {
    defaultTotal = parseFloat(targetInvoice.total || targetInvoice.totalWithVat || targetInvoice.netTotal || 0) || calculatedItemsTotal;
    defaultPaid = parseFloat(targetInvoice.paidAmount || (targetInvoice.paymentMethod === "cash" ? defaultTotal : 0));
  } else if (targetQuote) {
    defaultTotal = parseFloat(targetQuote.grandTotal || targetQuote.total || 0) || calculatedItemsTotal;
    defaultPaid = 0;
  } else {
    defaultTotal = calculatedItemsTotal;
  }
  const defaultRemaining = Math.max(0, defaultTotal - defaultPaid);

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "gra-modal-overlay";
  overlay.style.zIndex = "9999";

  overlay.innerHTML = `
    <style>
      #gra-modal-container {
        max-width: 990px;
        width: 96%;
        max-height: 94vh;
        display: flex;
        flex-direction: column;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 30px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.1);
        background: var(--bg-card, #111827);
        border: 1px solid var(--border, #374151);
        font-family: var(--font-body, 'IBM Plex Sans Arabic', -apple-system, sans-serif);
      }
      .gra-header {
        background: linear-gradient(135deg, #09122c 0%, #0369a1 50%, #0284c7 100%);
        color: #fff;
        padding: 18px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid #38bdf8;
        flex-shrink: 0;
      }
      .gra-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: #f0f9ff;
        padding: 3px 12px;
        border-radius: 20px;
        font-size: 11.5px;
        font-weight: 700;
      }
      .gra-section-box {
        background: var(--bg-2, rgba(30, 41, 59, 0.45));
        border: 1px solid var(--border-soft, rgba(148, 163, 184, 0.2));
        border-radius: 14px;
        padding: 16px 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .gra-section-title {
        font-size: 13.5px;
        font-weight: 900;
        color: #38bdf8;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(56, 189, 248, 0.2);
        padding-bottom: 8px;
        margin-bottom: 2px;
      }
      .gra-input {
        background: var(--bg-1, #0f172a);
        border: 1px solid var(--border, #334155);
        color: var(--text-0, #f8fafc);
        border-radius: 10px;
        padding: 9px 12px;
        font-size: 13px;
        width: 100%;
        box-sizing: border-box;
        transition: all 0.2s;
        font-family: inherit;
      }
      .gra-input:focus {
        outline: none;
        border-color: #38bdf8;
        box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.25);
        background: var(--bg-card, #1e293b);
      }
      .gra-items-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12.5px;
      }
      .gra-items-table th {
        background: rgba(15, 23, 42, 0.7);
        color: #94a3b8;
        font-weight: 800;
        padding: 8px 10px;
        border: 1px solid #334155;
        text-align: right;
      }
      .gra-items-table td {
        padding: 5px;
        border: 1px solid #334155;
      }
      .gra-items-table input {
        background: transparent;
        border: 1px solid transparent;
        color: #fff;
        padding: 6px 8px;
        width: 100%;
        box-sizing: border-box;
        border-radius: 6px;
        font-size: 13px;
      }
      .gra-items-table input:focus {
        background: #0f172a;
        border-color: #38bdf8;
        outline: none;
      }
      .gra-legal-preview {
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid #334155;
        border-right: 4px solid #38bdf8;
        border-radius: 10px;
        padding: 14px 18px;
        font-size: 12px;
        line-height: 1.7;
        color: #cbd5e1;
      }
      .gra-legal-clause {
        margin-bottom: 8px;
      }
      .gra-legal-clause strong {
        color: #38bdf8;
      }
    </style>

    <div id="gra-modal-container">
      
      <!-- Executive Header -->
      <div class="gra-header">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:46px; height:46px; border-radius:12px; background:rgba(255,255,255,0.18); border:1px solid rgba(255,255,255,0.3); display:flex; align-items:center; justify-content:center; font-size:24px; box-shadow:0 6px 16px rgba(0,0,0,0.3);">📜</div>
          <div>
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
              <h3 style="margin:0; font-size:17.5px; font-weight:900; letter-spacing:0.3px; color:#fff;">إقرار استلام بضاعة عينية وإقرار بمديونية ثمنها مرتبط بسند لأمر</h3>
              <span class="gra-badge">⚖️ نظام الإثبات ونظام الأوراق التجارية</span>
            </div>
            <div style="font-size:11.5px; color:#e0f2fe; margin-top:3px; opacity:0.95;">
              وثيقة إثبات استلام عيني ملزمة تفصل بين المنشأة والمستلم المفوض لمنع دعاوى الصورية ومنازعات التنفيذ
            </div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn btn-secondary sm" onclick="window.switchToTrustReceiptModal()" style="font-size:12px; background:rgba(255,255,255,0.12); color:#fff; border:1px solid rgba(255,255,255,0.25);">
            🛡️ التبديل لسند الأمانة النقدي
          </button>
          <button class="btn btn-icon sm btn-ghost" onclick="document.getElementById('gra-modal-overlay').remove()" style="color:#fff; font-size:22px; border:none; background:transparent; cursor:pointer;" title="إغلاق">✕</button>
        </div>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="modal-body" style="padding:22px 26px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:18px;">
        
        <!-- Document Meta Ribbon -->
        <div style="display:grid; grid-template-columns:1.2fr 1.2fr 1.6fr; gap:12px; background:rgba(15, 23, 42, 0.45); padding:12px 16px; border-radius:12px; border:1px solid rgba(148, 163, 184, 0.15);">
          <div>
            <label style="font-size:11px; font-weight:800; color:#94a3b8; display:block; margin-bottom:4px;">رقم المستند *</label>
            <input type="text" id="gra-doc-number" class="gra-input mono" style="font-weight:800; color:#38bdf8;" value="${defaultDocNumber}" />
          </div>
          <div>
            <label style="font-size:11px; font-weight:800; color:#94a3b8; display:block; margin-bottom:4px;">تاريخ التحرير *</label>
            <input type="date" id="gra-doc-date" class="gra-input" style="font-weight:700;" value="${today}" />
          </div>
          <div>
            <label style="font-size:11px; font-weight:800; color:#94a3b8; display:block; margin-bottom:4px;">مكان التحرير *</label>
            <input type="text" id="gra-doc-place" class="gra-input" value="ينبع الصناعية — المملكة العربية السعودية" />
          </div>
        </div>

        <!-- Section 1 & 2: Parties Data Grid -->
        <div style="display:grid; grid-template-columns:1fr 1.35fr; gap:16px;">
          
          <!-- First: Seller (Creditor) -->
          <div class="gra-section-box">
            <div class="gra-section-title">
              <span>🏢 أولاً: بيانات البائع «الدائن»</span>
              <span style="font-size:11px; color:#94a3b8;">(الطرف الأول)</span>
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">الاسم / اسم المنشأة</label>
              <input type="text" id="gra-seller-name" class="gra-input font-bold" value="${co.name}" />
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">السجل التجاري</label>
                <input type="text" id="gra-seller-cr" class="gra-input mono" value="${co.crNumber}" />
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">الرقم الضريبي</label>
                <input type="text" id="gra-seller-vat" class="gra-input mono" value="${co.vatNumber}" />
              </div>
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">العنوان الرسمي</label>
              <input type="text" id="gra-seller-address" class="gra-input" value="${co.address}" />
            </div>
          </div>

          <!-- Second: Buyer (Debtor) & Authorized Representative -->
          <div class="gra-section-box">
            <div class="gra-section-title">
              <span>👤 ثانياً: بيانات المشتري «المدين» والمستلم المفوض</span>
              <span style="font-size:11px; color:#38bdf8;">(الفاتورة + المفوض الفعلي)</span>
            </div>

            <!-- Customer Quick Selector (Establishment) -->
            <div style="display:grid; grid-template-columns:1.4fr 1fr; gap:8px;">
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">اسم المنشأة / المشتري (الفاتورة باسمه) *</label>
                <input type="text" id="gra-buyer-name" class="gra-input font-bold" value="${currentCust ? currentCust.name : ''}" placeholder="اسم المنشأة أو العميل..." list="gra-cust-datalist" onchange="window.handleGraCustomerSelect(this.value)" />
                <datalist id="gra-cust-datalist">
                  ${allCustomers.map(c => `<option value="${c.name}">${c.name} — س.ت/هوية: ${c.crNumber || c.idNumber || ''}</option>`).join("")}
                </datalist>
                <input type="hidden" id="gra-buyer-id" value="${currentCust ? currentCust.id : ''}" />
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">سجل تجاري / رقم هوية المنشأة</label>
                <input type="text" id="gra-buyer-idnum" class="gra-input mono" value="${currentCust ? (currentCust.crNumber || currentCust.idNumber || currentCust.nationalId || '') : ''}" placeholder="70xxxxxxxx أو 10xxxxxxxx" />
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">هاتف / جوال المنشأة</label>
                <input type="text" id="gra-buyer-phone" class="gra-input mono" value="${currentCust ? (currentCust.phone || currentCust.mobile || '') : ''}" placeholder="05xxxxxxxx" />
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">العنوان الوطني للمنشأة</label>
                <input type="text" id="gra-buyer-address" class="gra-input" value="${currentCust ? ([currentCust.address, currentCust.city].filter(Boolean).join(' — ') || currentCust.city || 'ينبع — المملكة العربية السعودية') : 'ينبع — المملكة العربية السعودية'}" />
              </div>
            </div>

            <!-- Receiver / Authorized Person Explicit Block -->
            <div style="background:rgba(15, 23, 42, 0.6); border:1px solid #3b82f6; border-radius:10px; padding:10px 12px; margin-top:4px;">
              <div style="font-size:11.5px; font-weight:800; color:#60a5fa; margin-bottom:8px; display:flex; justify-content:space-between;">
                <span>✍️ بيانات الشخص الطبيعي المستلم الفعلي (المفوض بالاستلام والتوقيع):</span>
                <span style="font-size:10px; color:#94a3b8;">(اتركه فارغاً ليكتب باليد عند التسليم)</span>
              </div>
              
              <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:8px; margin-bottom:6px;">
                <div>
                  <label style="font-size:10.5px; font-weight:700; color:#cbd5e1; display:block; margin-bottom:2px;">اسم المستلم / المفوض الرباعي</label>
                  <input type="text" id="gra-rep-name" class="gra-input" value="${currentCust ? (currentCust.contactPerson || currentCust.managerName || '') : ''}" placeholder="اكتب اسم المستلم أو اتركه فارغاً..." />
                </div>
                <div>
                  <label style="font-size:10.5px; font-weight:700; color:#cbd5e1; display:block; margin-bottom:2px;">الصفة وسند التفويض</label>
                  <input type="text" id="gra-rep-title" class="gra-input" value="${currentCust?.contactPerson ? 'مفوض بالاستلام' : ''}" placeholder="مدير فرع / أمين مستودع / مفوض..." />
                </div>
              </div>

              <div style="display:grid; grid-template-columns:1.2fr 1fr 1fr; gap:8px;">
                <div>
                  <label style="font-size:10.5px; font-weight:700; color:#cbd5e1; display:block; margin-bottom:2px;">رقم هوية / إقامة المستلم</label>
                  <input type="text" id="gra-rep-id" class="gra-input mono" placeholder="10xxxxxxxx أو 20xxxxxxxx" />
                </div>
                <div>
                  <label style="font-size:10.5px; font-weight:700; color:#cbd5e1; display:block; margin-bottom:2px;">جنسية المستلم</label>
                  <input type="text" id="gra-rep-nationality" class="gra-input" placeholder="سعودي / مصري / يمني..." />
                </div>
                <div>
                  <label style="font-size:10.5px; font-weight:700; color:#cbd5e1; display:block; margin-bottom:2px;">رقم جوال المستلم</label>
                  <input type="text" id="gra-rep-phone" class="gra-input mono" placeholder="05xxxxxxxx" />
                </div>
              </div>
            </div>

          </div>

        </div>

        <!-- Section 3: Goods Delivered (Table & Details) -->
        <div class="gra-section-box">
          <div class="gra-section-title">
            <span>📦 ثالثاً: بيانات البضاعة المستلمة</span>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button type="button" class="btn btn-secondary sm" onclick="window.promptImportInvoiceToGra()" style="font-size:11px; background:#0284c7; color:#fff; border:none; display:inline-flex; align-items:center; gap:5px;">
                📥 استيراد من فاتورة مبيعات
              </button>
              <button type="button" class="btn btn-secondary sm" onclick="window.promptImportQuoteToGra()" style="font-size:11px; background:#059669; color:#fff; border:none; display:inline-flex; align-items:center; gap:5px;">
                📑 استيراد من عرض سعر
              </button>
              <button type="button" class="btn btn-ghost sm" onclick="window.addGraItemRow()" style="font-size:11px; border:1px solid #475569;">
                ➕ إضافة صنف
              </button>
              <button type="button" class="btn btn-ghost sm" onclick="window.addGra5EmptyRows()" style="font-size:11px; border:1px solid #475569;">
                ➕ إضافة 5 أسطر
              </button>
            </div>
          </div>

          <!-- Items Table Container -->
          <div style="max-height:280px; overflow-y:auto; border:1px solid #334155; border-radius:10px;">
            <table class="gra-items-table" id="gra-table-items">
              <thead>
                <tr>
                  <th style="width:40px; text-align:center;">م</th>
                  <th>الصنف ووصفه</th>
                  <th style="width:110px;">الوحدة</th>
                  <th style="width:90px;">الكمية</th>
                  <th style="width:140px;">إجمالي القيمة بالريال</th>
                  <th style="width:40px; text-align:center;">إجراء</th>
                </tr>
              </thead>
              <tbody id="gra-items-tbody">
                ${initialItems.map((it, idx) => `
                  <tr data-row-idx="${idx + 1}">
                    <td style="text-align:center; font-family:'IBM Plex Mono',monospace; font-weight:700; color:#94a3b8;">${idx + 1}</td>
                    <td><input type="text" class="gra-it-name" value="${it.name || ''}" placeholder="اسم الصنف والوصف..." /></td>
                    <td><input type="text" class="gra-it-unit" value="${it.unit || 'كرتون'}" placeholder="كرتون / حبة..." /></td>
                    <td><input type="number" step="any" class="gra-it-qty mono" value="${it.qty || ''}" placeholder="0" oninput="window.calcGraTotals()" /></td>
                    <td><input type="number" step="0.01" class="gra-it-total mono font-bold" value="${it.total || ''}" placeholder="0.00" oninput="window.calcGraTotals()" /></td>
                    <td style="text-align:center;">
                      <button type="button" class="btn btn-icon sm btn-ghost" onclick="this.closest('tr').remove(); window.reindexGraRows(); window.calcGraTotals();" style="color:#ef4444;" title="حذف">✕</button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>

          <!-- Totals & Tafqeet Vault -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; background:rgba(15, 23, 42, 0.6); padding:14px 18px; border-radius:12px; border:1px solid #334155; align-items:center;">
            <div>
              <label style="font-size:11.5px; font-weight:800; color:#38bdf8; display:block; margin-bottom:4px;">
                إجمالي قيمة البضاعة شامل الضريبة (إن انطبقت) بالريال *
              </label>
              <div style="display:flex; align-items:center; gap:8px;">
                <input type="number" id="gra-total-goods" class="gra-input mono font-bold" style="font-size:20px; color:#10b981; height:46px;" value="${defaultTotal > 0 ? defaultTotal : ''}" oninput="window.calcGraTotalsManually()" placeholder="0.00" />
                <span style="font-size:12px; font-weight:800; color:#10b981; background:rgba(16, 185, 129, 0.15); padding:8px 12px; border-radius:8px;">ر.س SAR</span>
              </div>
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:4px;">المبلغ كتابة وتفقيطاً:</label>
              <div id="gra-tafqeet-goods" style="font-size:13px; font-weight:800; color:#fde047; background:rgba(245, 158, 11, 0.1); border:1px solid rgba(245, 158, 11, 0.3); padding:10px 14px; border-radius:10px;">
                ${defaultTotal > 0 ? tafqeetArabic(defaultTotal) + ' فقط لا غير' : 'يتم التفقيط آلياً...'}
              </div>
              <input type="hidden" id="gra-tafqeet-words" value="${defaultTotal > 0 ? tafqeetArabic(defaultTotal) + ' فقط لا غير' : ''}" />
            </div>
          </div>

          <!-- Goods Logistics Meta Grid -->
          <div style="display:grid; grid-template-columns:1.2fr 1fr 1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">أرقام الفواتير وتواريخها</label>
              <input type="text" id="gra-invoices-ref" class="gra-input" value="${targetInvoice ? ((targetInvoice.invoiceNumber || targetInvoice.id) + ' بتاريخ ' + formatDate(targetInvoice.date)) : (targetQuote ? ('عرض سعر رقم ' + (targetQuote.quoteNumber || targetQuote.id) + (targetQuote.date ? ' بتاريخ ' + formatDate(targetQuote.date) : '')) : '')}" placeholder="فاتورة رقم … أو عرض سعر رقم …" />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">رقم إذن الصرف وتاريخه</label>
              <input type="text" id="gra-dispatch-ref" class="gra-input" value="${targetInvoice ? ('إذن صرف ' + (targetInvoice.invoiceNumber || targetInvoice.id)) : (targetQuote ? ('إذن صرف بضاعة لعرض سعر ' + (targetQuote.quoteNumber || targetQuote.id)) : '')}" placeholder="إذن صرف رقم …" />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">المخزن المسلم منه</label>
              <input type="text" id="gra-warehouse-name" class="gra-input" value="${targetInvoice ? (targetInvoice.warehouseName || targetInvoice.warehouse || 'المستودع الرئيسي') : 'المستودع الرئيسي'}" />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">تاريخ الاستلام الفعلي *</label>
              <input type="date" id="gra-actual-date" class="gra-input" value="${today}" />
            </div>
          </div>

        </div>

        <!-- Section 4: Acknowledgment & Promissory Note Linking -->
        <div class="gra-section-box">
          <div class="gra-section-title">
            <span>⚖️ رابعاً: الإقرار بالاستلام والمديونية وارتباط السند لأمر</span>
            <span style="font-size:11.5px; color:#38bdf8;">(حماية تنفيذية وقضائية كاملة)</span>
          </div>

          <!-- Amounts Breakdown Ribbon -->
          <div style="display:grid; grid-template-columns:1fr 1fr 1.3fr; gap:12px; background:rgba(30, 58, 138, 0.2); border:1px solid rgba(59, 130, 246, 0.3); border-radius:12px; padding:12px 16px;">
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">قيمة البضاعة المستلمة:</label>
              <input type="number" id="gra-val-received" class="gra-input mono font-bold" value="${defaultTotal > 0 ? defaultTotal : ''}" oninput="window.calcGraBalance()" placeholder="0.00" />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">سُدد من ثمنها:</label>
              <input type="number" id="gra-val-paid" class="gra-input mono" value="${defaultPaid > 0 ? defaultPaid : '0.00'}" oninput="window.calcGraBalance()" placeholder="0.00" />
            </div>
            <div>
              <label style="font-size:11px; font-weight:800; color:#ef4444; display:block; margin-bottom:3px;">بقي في ذمة المشتري (المتبقي الآجل) *:</label>
              <input type="number" id="gra-val-remaining" class="gra-input mono font-bold" style="color:#ef4444; font-size:16px;" value="${defaultRemaining > 0 ? defaultRemaining : ''}" placeholder="0.00" />
            </div>
            <div style="grid-column:1/-1;">
              <div style="font-size:11.5px; color:#e2e8f0;">
                المبلغ المتبقي كتابةً: <strong id="gra-tafqeet-remaining" style="color:#fde047;">${defaultRemaining > 0 ? tafqeetArabic(defaultRemaining) + ' ريال سعودي فقط لا غير' : '...'}</strong>
              </div>
            </div>
          </div>

          <!-- Promissory Note Linked Data (البند 3) -->
          <div style="background:rgba(15, 23, 42, 0.7); border:1.5px solid #38bdf8; border-radius:12px; padding:14px 18px;">
            <div style="font-size:12.5px; font-weight:900; color:#38bdf8; margin-bottom:10px; display:flex; align-items:center; gap:8px;">
              <span>🔗</span> <span>بيانات السند لأمر المرتبط بذات الدين والمستلم مقابله البضاعة:</span>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:8px;">
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">اسم محرر السند (المفوض أو المشتري)</label>
                <input type="text" id="gra-pn-issuer" class="gra-input font-bold" value="" placeholder="اتركه فارغاً ليكتب باليد بالقلم أو اكتب الاسم..." />
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">لصالح المستفيد (الدائن/البائع) *</label>
                <input type="text" id="gra-pn-beneficiary" class="gra-input font-bold" value="${co.name}" />
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1.2fr 1fr 1fr 1fr; gap:10px;">
              <div>
                <label style="font-size:11px; font-weight:800; color:#fde047; display:block; margin-bottom:3px;">رقم السند لأمر / رقمه الإلكتروني (نافذ)</label>
                <input type="text" id="gra-pn-number" class="gra-input mono font-bold" value="" placeholder="اتركه فارغاً للتعبئة باليد أو اكتب الرقم..." />
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">تاريخ إنشائه</label>
                <input type="date" id="gra-pn-date" class="gra-input" value="${today}" />
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">تاريخ استحقاقه</label>
                <input type="date" id="gra-pn-due-date" class="gra-input" value="" placeholder="تاريخ الاستحقاق..." />
              </div>
              <div>
                <label style="font-size:11px; font-weight:800; color:#10b981; display:block; margin-bottom:3px;">قيمته بالريال *</label>
                <input type="number" id="gra-pn-amount" class="gra-input mono font-bold" style="color:#10b981;" value="${defaultRemaining > 0 ? defaultRemaining : ''}" placeholder="0.00" />
              </div>
            </div>

          </div>

          <!-- Full Legal Clauses Display -->
          <div class="gra-legal-preview">
            <div style="font-weight:900; color:#f8fafc; margin-bottom:8px; font-size:13px;">
              📜 نصوص الإقرار القانونية الستة (المدونة بالكامل في الوثيقة المطبوعة دون اختصار):
            </div>
            <div class="gra-legal-clause">
              <strong>1. الاستلام الفعلي:</strong> استلمت فعليًا من البائع البضاعة المبينة بهذا المستند والفواتير وإذن الصرف المشار إليها، وذلك على سبيل الشراء بالأجل، وتسلمتها بالكميات والأوصاف المثبتة، بعد فحصها ظاهرًا، مع إثبات أي نقص أو تحفظ في خانة الملاحظات أدناه، ودون إخلال بالحقوق المتعلقة بالعيوب الخفية وفقًا للنظام.
            </div>
            <div class="gra-legal-clause">
              <strong>2. إثبات المديونية:</strong> بلغت قيمة البضاعة المستلمة مبلغًا قدره الموضح أعلاه، وسُدد منه المبلغ الموضح، وبقي في ذمة المشتري لصالح البائع المبلغ المتبقي المثبت تفقيطاً.
            </div>
            <div class="gra-legal-clause">
              <strong>3. الربط بالسند لأمر:</strong> أقر بأن المبلغ المتبقي المذكور أعلاه يمثل ثمن بضاعة تم استلامها فعلًا، وأنه الدين ذاته المثبت بالسند لأمر المحرر أعلاه برقم وتاريخ واستحقاق محددين.
            </div>
            <div class="gra-legal-clause">
              <strong>4. نفي استلام النقد (سبب الدين عيني):</strong> أقر بأن سبب تحرير السند لأمر المشار إليه هو المديونية الناشئة عن شراء واستلام البضاعة المبينة أعلاه، وأن هذا الإقرار يثبت استلام البضاعة التي نشأت عنها المديونية، ولا يتضمن إقرارًا باستلام مبلغ نقدي.
            </div>
            <div class="gra-legal-clause">
              <strong>5. عدم ازدواجية المطالبة:</strong> لا يُعد توقيع هذا المستند سدادًا للسند لأمر أو إبراءً من الدين، كما لا ينشئ دينًا إضافيًا مستقلًا عن الدين المثبت بالسند. ويُخصم من الرصيد المستحق كل سداد فعلي أو تسوية ثابتة بين الطرفين، ولا يجوز استيفاء الدين ذاته أكثر من مرة.
            </div>
            <div class="gra-legal-clause">
              <strong>6. حجية المرفقات:</strong> تعد الفواتير وإذن الصرف وكشف الأصناف المرفقة، المحددة أرقامها أعلاه والموقعة من المستلم، مكملة لهذا الإقرار.
            </div>
          </div>

        </div>

        <!-- Section 5: Notes & Signatures -->
        <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:14px;">
          
          <div class="gra-section-box">
            <div class="gra-section-title">
              <span>📝 الملاحظات والتحفظات</span>
            </div>
            <textarea id="gra-notes" class="gra-input" rows="3" placeholder="اكتب أي ملاحظات أو تحفظات على حالة البضاعة أو التسليم إن وجدت..."></textarea>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px;">
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">المرفقات (عدد المستندات)</label>
                <input type="text" id="gra-attachments-count" class="gra-input" value="1 (فاتورة وكشف أصناف وإذن صرف)" />
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">إجمالي الصفحات</label>
                <input type="text" id="gra-total-pages" class="gra-input" value="2" />
              </div>
            </div>
          </div>

          <div class="gra-section-box">
            <div class="gra-section-title">
              <span>✍️ أسماء الموقعين والمعتمدين</span>
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">اسم المستلم / المفوض بالتوقيع</label>
              <input type="text" id="gra-sig-buyer" class="gra-input font-bold" value="" placeholder="اتركه فارغاً ليكتب باليد بالقلم..." />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">اسم مسؤول التسليم من المخزن</label>
              <input type="text" id="gra-sig-warehouse" class="gra-input" value="${window._salesUser?.displayName || window._salesUser?.name || 'أمين المستودع'}" />
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:3px;">اعتماد البائع (الاسم والصفة)</label>
              <input type="text" id="gra-sig-seller" class="gra-input" value="المدير العام / المفوض بالتوقيع" />
            </div>
          </div>

        </div>

      </div>

      <!-- Executive Footer Actions -->
      <div style="background:var(--bg-2, #1f2937); padding:16px 24px; border-top:1px solid var(--border, #374151); display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
        <div style="font-size:12px; color:#94a3b8;">
          💡 يدعم المستند أكثر من 20 صنفاً مع التقسيم التلقائي للصفحات وتوقيع كشف الأصناف وختم المنشأة.
        </div>
        <div style="display:flex; gap:10px;">
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('gra-modal-overlay').remove()">
            إلغاء
          </button>
          <button type="button" class="btn btn-primary" id="btn-save-print-gra" onclick="window.submitGoodsReceiptAck(true)" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%); border:none; padding:10px 22px; font-weight:900; font-size:14px; box-shadow:0 4px 14px rgba(2, 132, 199, 0.4);">
            🖨️ حفظ وطباعة الوثيقة الرسمية
          </button>
          <button type="button" class="btn btn-ghost" onclick="window.submitGoodsReceiptAck(false)" style="border:1px solid #475569; color:#cbd5e1;">
            معاينة وطباعة دون حفظ
          </button>
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(overlay);

  // Setup Global Helpers for Modal
  window.reindexGraRows = () => {
    document.querySelectorAll("#gra-items-tbody tr").forEach((tr, idx) => {
      tr.setAttribute("data-row-idx", idx + 1);
      const td0 = tr.querySelector("td");
      if (td0) td0.textContent = idx + 1;
    });
  };

  window.addGraItemRow = (name = "", unit = "كرتون", qty = "", total = "") => {
    const tbody = document.getElementById("gra-items-tbody");
    if (!tbody) return;
    const newIdx = tbody.querySelectorAll("tr").length + 1;
    const tr = document.createElement("tr");
    tr.setAttribute("data-row-idx", newIdx);
    tr.innerHTML = `
      <td style="text-align:center; font-family:'IBM Plex Mono',monospace; font-weight:700; color:#94a3b8;">${newIdx}</td>
      <td><input type="text" class="gra-it-name" value="${name}" placeholder="اسم الصنف والوصف..." /></td>
      <td><input type="text" class="gra-it-unit" value="${unit}" placeholder="كرتون / حبة..." /></td>
      <td><input type="number" step="any" class="gra-it-qty mono" value="${qty}" placeholder="0" oninput="window.calcGraTotals()" /></td>
      <td><input type="number" step="0.01" class="gra-it-total mono font-bold" value="${total}" placeholder="0.00" oninput="window.calcGraTotals()" /></td>
      <td style="text-align:center;">
        <button type="button" class="btn btn-icon sm btn-ghost" onclick="this.closest('tr').remove(); window.reindexGraRows(); window.calcGraTotals();" style="color:#ef4444;" title="حذف">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  };

  window.addGra5EmptyRows = () => {
    for (let i = 0; i < 5; i++) {
      window.addGraItemRow();
    }
  };

  window.calcGraTotals = () => {
    let sum = 0;
    document.querySelectorAll(".gra-it-total").forEach(inp => {
      const val = parseFloat(inp.value || 0);
      if (!isNaN(val)) sum += val;
    });

    const totEl = document.getElementById("gra-total-goods");
    if (totEl) totEl.value = sum > 0 ? sum.toFixed(2) : "";

    const tafEl = document.getElementById("gra-tafqeet-goods");
    const tafWords = document.getElementById("gra-tafqeet-words");
    const words = sum > 0 ? (tafqeetArabic(sum) + " فقط لا غير") : "يتم التفقيط آلياً...";
    if (tafEl) tafEl.textContent = words;
    if (tafWords) tafWords.value = words;

    const recEl = document.getElementById("gra-val-received");
    if (recEl) recEl.value = sum > 0 ? sum.toFixed(2) : "";
    window.calcGraBalance();
  };

  window.calcGraTotalsManually = () => {
    const sum = parseFloat(document.getElementById("gra-total-goods")?.value || 0);
    const tafEl = document.getElementById("gra-tafqeet-goods");
    const tafWords = document.getElementById("gra-tafqeet-words");
    const words = sum > 0 ? (tafqeetArabic(sum) + " فقط لا غير") : "يتم التفقيط آلياً...";
    if (tafEl) tafEl.textContent = words;
    if (tafWords) tafWords.value = words;

    const recEl = document.getElementById("gra-val-received");
    if (recEl) recEl.value = sum > 0 ? sum.toFixed(2) : "";
    window.calcGraBalance();
  };

  window.calcGraBalance = () => {
    const received = parseFloat(document.getElementById("gra-val-received")?.value || 0);
    const paid = parseFloat(document.getElementById("gra-val-paid")?.value || 0);
    const remaining = Math.max(0, received - paid);

    const remEl = document.getElementById("gra-val-remaining");
    if (remEl) remEl.value = remaining > 0 ? remaining.toFixed(2) : "0.00";

    const tafRemEl = document.getElementById("gra-tafqeet-remaining");
    if (tafRemEl) {
      tafRemEl.textContent = remaining > 0 ? (tafqeetArabic(remaining) + " ريال سعودي فقط لا غير") : "صفر ريال سعودي";
    }

    const pnAmtEl = document.getElementById("gra-pn-amount");
    if (pnAmtEl && (!pnAmtEl.value || parseFloat(pnAmtEl.value) === 0)) {
      pnAmtEl.value = remaining > 0 ? remaining.toFixed(2) : "";
    }
  };

  window.handleGraCustomerSelect = (custName) => {
    const matched = allCustomers.find(c => c.name === custName);
    if (!matched) return;
    document.getElementById("gra-buyer-id").value = matched.id;
    document.getElementById("gra-buyer-idnum").value = matched.crNumber || matched.idNumber || matched.nationalId || "";
    document.getElementById("gra-buyer-phone").value = matched.phone || matched.mobile || "";
    document.getElementById("gra-buyer-address").value = [matched.address, matched.city].filter(Boolean).join(" — ") || "ينبع — المملكة العربية السعودية";
    
    // Auto populate representative if customer has contactPerson
    if (matched.contactPerson) {
      document.getElementById("gra-rep-name").value = matched.contactPerson;
      document.getElementById("gra-rep-title").value = matched.managerName || "مفوض بالاستلام";
    }
  };

  window.switchToTrustReceiptModal = () => {
    document.getElementById("gra-modal-overlay")?.remove();
    if (typeof window.openTrustReceiptModal === "function") {
      window.openTrustReceiptModal(currentCust);
    }
  };

  window.promptImportInvoiceToGra = async () => {
    const custId = document.getElementById("gra-buyer-id")?.value;
    const custName = document.getElementById("gra-buyer-name")?.value;

    let custInvoices = [];
    let allInvs = [];
    try {
      showToast("جاري البحث عن فواتير العميل...", "info");
      allInvs = await getAll(COLS.salesInvoices());
      if (custId || custName) {
        custInvoices = allInvs.filter(inv => 
          (custId && inv.customerId === custId) || 
          (custName && inv.customerName && inv.customerName.trim().toLowerCase() === custName.trim().toLowerCase())
        ).sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 20);
      }
    } catch (e) {
      console.warn("Could not load invoices:", e);
    }

    const showManualInvoiceSearch = () => {
      const invNum = prompt("أدخل رقم الفاتورة للبحث المباشر عنها في النظام (مثال: INV-042050):");
      if (!invNum) return;
      const term = invNum.trim().toLowerCase();
      const found = allInvs.find(i => 
        (i.invoiceNumber || "").toLowerCase().includes(term) || 
        (i.id || "").toLowerCase().includes(term)
      );
      if (found) {
        window.applyInvoiceToGra(found);
      } else {
        showToast("لم يتم العثور على الفاتورة المطلوبة: " + invNum, "error");
      }
    };

    if (!custInvoices.length) {
      showManualInvoiceSearch();
      return;
    }

    // Modal popup to pick invoice
    const pickOverlay = document.createElement("div");
    pickOverlay.className = "modal-overlay active";
    pickOverlay.id = "gra-pick-inv-overlay";
    pickOverlay.style.zIndex = "10005";
    pickOverlay.innerHTML = `
      <div class="modal-box" style="max-width:560px; background:var(--bg-card, #111827); border-radius:14px; padding:20px; border:1px solid var(--border, #374151); box-shadow:0 20px 50px rgba(0,0,0,0.6);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h4 style="margin:0; color:#38bdf8; font-size:15px; font-weight:800; display:flex; align-items:center; gap:6px;">
            <span>📥</span> <span>اختر فاتورة المبيعات لاستيراد أصنافها وبياناتها:</span>
          </h4>
          <button class="btn btn-icon sm btn-ghost" onclick="document.getElementById('gra-pick-inv-overlay').remove()" style="color:#94a3b8; font-size:18px;">✕</button>
        </div>
        <div style="font-size:12px; color:#94a3b8; margin-bottom:12px;">
          فواتير المبيعات المسجلة باسم <strong>${custName || 'العميل المحدد'}</strong> (${custInvoices.length} فاتورة):
        </div>
        <div style="max-height:320px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
          ${custInvoices.map(inv => `
            <div style="padding:11px 14px; background:var(--bg-1, #0f172a); border:1px solid var(--border, #334155); border-radius:10px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:all 0.2s;" 
                 onmouseover="this.style.borderColor='#38bdf8'; this.style.background='rgba(2, 132, 199, 0.1)';"
                 onmouseout="this.style.borderColor='var(--border, #334155)'; this.style.background='var(--bg-1, #0f172a)';"
                 onclick="window.applyInvoiceToGraById('${inv.id}')">
              <div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <strong style="color:#fff; font-size:13.5px; font-family:'IBM Plex Mono',monospace;">${inv.invoiceNumber || inv.id}</strong>
                  <span style="font-size:10px; padding:2px 7px; border-radius:6px; background:rgba(56, 189, 248, 0.15); color:#38bdf8; font-weight:700;">${inv.status === 'paid' ? 'مدفوعة' : (inv.status === 'posted' ? 'مرحلة' : (inv.status || 'معتمدة'))}</span>
                </div>
                <div style="font-size:11px; color:#94a3b8; margin-top:3px;">
                  تاريخ: ${formatDate(inv.date)} — ${(inv.items || inv.lines || []).length} صنف — ${inv.customerName || ''}
                </div>
              </div>
              <div class="mono font-bold" style="color:#10b981; font-size:14px; text-align:left; direction:ltr;">
                ${formatCurrency(inv.total || inv.totalWithVat || inv.netTotal || 0)}
              </div>
            </div>
          `).join("")}
        </div>
        <div style="margin-top:14px; display:flex; justify-content:space-between; align-items:center;">
          <button class="btn btn-secondary sm" onclick="document.getElementById('gra-pick-inv-overlay').remove()">إلغاء</button>
          <button class="btn btn-ghost sm" id="gra-inv-manual-btn" style="color:#38bdf8; font-size:11.5px; border:1px solid #334155;">
            🔍 أو البحث برقم فاتورة أخرى...
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(pickOverlay);

    document.getElementById("gra-inv-manual-btn")?.addEventListener("click", () => {
      document.getElementById("gra-pick-inv-overlay")?.remove();
      showManualInvoiceSearch();
    });

    window.applyInvoiceToGraById = (invId) => {
      document.getElementById("gra-pick-inv-overlay")?.remove();
      const inv = allInvs.find(i => i.id === invId) || custInvoices.find(i => i.id === invId);
      if (inv) {
        window.applyInvoiceToGra(inv);
      }
    };
  };

  window.applyInvoiceToGra = (inv) => {
    if (!inv) return;
    const tbody = document.getElementById("gra-items-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const items = inv.items || inv.lines || [];
    if (items.length > 0) {
      items.forEach((it, idx) => {
        const lineTotal = calculateItemLineTotal(it);
        window.addGraItemRow(
          it.productName || it.name || it.description || "",
          it.unit || it.unitName || "كرتون",
          it.qty !== undefined ? it.qty : (it.quantity || 1),
          lineTotal.toFixed(2)
        );
      });
    } else {
      window.addGraItemRow("بضائع ومواد غذائية متنوعة", "شحنة", 1, parseFloat(inv.total || inv.totalWithVat || 0).toFixed(2));
    }

    document.getElementById("gra-invoices-ref").value = (inv.invoiceNumber || inv.id) + " بتاريخ " + formatDate(inv.date);
    document.getElementById("gra-dispatch-ref").value = "إذن صرف " + (inv.invoiceNumber || inv.id);
    document.getElementById("gra-warehouse-name").value = inv.warehouseName || inv.warehouse || "المستودع الرئيسي";

    // Auto-fill customer if available
    if (inv.customerName && (!document.getElementById("gra-buyer-name")?.value || document.getElementById("gra-buyer-name")?.value === "عميل نقدي")) {
      document.getElementById("gra-buyer-name").value = inv.customerName;
      if (typeof window.handleGraCustomerSelect === "function") {
        window.handleGraCustomerSelect(inv.customerName);
      }
    }

    let invTot = parseFloat(inv.total || inv.totalWithVat || inv.netTotal || 0);
    if (invTot <= 0) {
      let sum = 0;
      document.querySelectorAll(".gra-it-total").forEach(inp => {
        const val = parseFloat(inp.value || 0);
        if (!isNaN(val)) sum += val;
      });
      invTot = sum;
    }

    const invPaid = parseFloat(inv.paidAmount || (inv.paymentMethod === "cash" ? invTot : 0));
    const invRem = Math.max(0, invTot - invPaid);

    document.getElementById("gra-total-goods").value = invTot.toFixed(2);
    document.getElementById("gra-val-received").value = invTot.toFixed(2);
    document.getElementById("gra-val-paid").value = invPaid.toFixed(2);
    document.getElementById("gra-val-remaining").value = invRem.toFixed(2);
    document.getElementById("gra-pn-amount").value = invRem.toFixed(2);

    window.calcGraTotals();
    showToast(`تم استيراد أصناف وبيانات الفاتورة ${inv.invoiceNumber || inv.id} بنجاح`, "success");
  };

  window.promptImportQuoteToGra = async () => {
    const custId = document.getElementById("gra-buyer-id")?.value;
    const custName = document.getElementById("gra-buyer-name")?.value;

    let custQuotes = [];
    let allQuotes = [];
    try {
      showToast("جاري البحث في عروض الأسعار...", "info");
      allQuotes = await getAll(COLS.quotations());
      if (custId || custName) {
        custQuotes = allQuotes.filter(q => 
          (custId && q.customerId === custId) || 
          (custName && q.customerName && q.customerName.trim().toLowerCase() === custName.trim().toLowerCase())
        ).sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 20);
      }
    } catch (e) {
      console.warn("Could not load quotations:", e);
      try {
        const snap = await getDocs(collection(db, `companies/${COMPANY_ID}/quotations`));
        allQuotes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (custId || custName) {
          custQuotes = allQuotes.filter(q => 
            (custId && q.customerId === custId) || 
            (custName && q.customerName && q.customerName.trim().toLowerCase() === custName.trim().toLowerCase())
          ).sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 20);
        }
      } catch (_) {}
    }

    const showManualQuoteSearch = () => {
      const qNum = prompt("أدخل رقم عرض السعر للبحث المباشر عنه في النظام (مثال: QT-005101):");
      if (!qNum) return;
      const term = qNum.trim().toLowerCase();
      const found = allQuotes.find(q => 
        (q.quoteNumber || "").toLowerCase().includes(term) || 
        (q.id || "").toLowerCase().includes(term) ||
        (q.customerName || "").toLowerCase().includes(term)
      );
      if (found) {
        window.applyQuoteToGra(found);
      } else {
        showToast("لم يتم العثور على عرض السعر المطلوب: " + qNum, "error");
      }
    };

    if (!custQuotes.length) {
      showManualQuoteSearch();
      return;
    }

    // Modal popup to pick quotation
    const pickOverlay = document.createElement("div");
    pickOverlay.className = "modal-overlay active";
    pickOverlay.id = "gra-pick-quote-overlay";
    pickOverlay.style.zIndex = "10005";
    pickOverlay.innerHTML = `
      <div class="modal-box" style="max-width:560px; background:var(--bg-card, #111827); border-radius:14px; padding:20px; border:1px solid var(--border, #374151); box-shadow:0 20px 50px rgba(0,0,0,0.6);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h4 style="margin:0; color:#34d399; font-size:15px; font-weight:800; display:flex; align-items:center; gap:6px;">
            <span>📑</span> <span>اختر عرض السعر لاستيراد أصنافه وبياناته:</span>
          </h4>
          <button class="btn btn-icon sm btn-ghost" onclick="document.getElementById('gra-pick-quote-overlay').remove()" style="color:#94a3b8; font-size:18px;">✕</button>
        </div>
        <div style="font-size:12px; color:#94a3b8; margin-bottom:12px;">
          عروض الأسعار المسجلة باسم <strong>${custName || 'العميل المحدد'}</strong> (${custQuotes.length} عرض):
        </div>
        <div style="max-height:320px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
          ${custQuotes.map(q => `
            <div style="padding:11px 14px; background:var(--bg-1, #0f172a); border:1px solid var(--border, #334155); border-radius:10px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:all 0.2s;" 
                 onmouseover="this.style.borderColor='#34d399'; this.style.background='rgba(5, 150, 105, 0.1)';"
                 onmouseout="this.style.borderColor='var(--border, #334155)'; this.style.background='var(--bg-1, #0f172a)';"
                 onclick="window.applyQuoteToGraById('${q.id}')">
              <div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <strong style="color:#fff; font-size:13.5px; font-family:'IBM Plex Mono',monospace;">${q.quoteNumber || q.id}</strong>
                  <span style="font-size:10px; padding:2px 7px; border-radius:6px; background:rgba(52, 211, 153, 0.15); color:#34d399; font-weight:700;">${q.status || 'معتمد'}</span>
                </div>
                <div style="font-size:11px; color:#94a3b8; margin-top:3px;">
                  تاريخ: ${formatDate(q.date)} — ${(q.items || []).length} صنف — ${q.customerName || ''}
                </div>
              </div>
              <div class="mono font-bold" style="color:#34d399; font-size:14px; text-align:left; direction:ltr;">
                ${formatCurrency(q.grandTotal || q.total || 0)}
              </div>
            </div>
          `).join("")}
        </div>
        <div style="margin-top:14px; display:flex; justify-content:space-between; align-items:center;">
          <button class="btn btn-secondary sm" onclick="document.getElementById('gra-pick-quote-overlay').remove()">إلغاء</button>
          <button class="btn btn-ghost sm" id="gra-quote-manual-btn" style="color:#38bdf8; font-size:11.5px; border:1px solid #334155;">
            🔍 أو البحث برقم عرض سعر آخر...
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(pickOverlay);

    document.getElementById("gra-quote-manual-btn")?.addEventListener("click", () => {
      document.getElementById("gra-pick-quote-overlay")?.remove();
      showManualQuoteSearch();
    });

    window.applyQuoteToGraById = (quoteId) => {
      document.getElementById("gra-pick-quote-overlay")?.remove();
      const quote = allQuotes.find(q => q.id === quoteId) || custQuotes.find(q => q.id === quoteId);
      if (quote) {
        window.applyQuoteToGra(quote);
      }
    };
  };

  window.applyQuoteToGra = (quote) => {
    if (!quote) return;
    const tbody = document.getElementById("gra-items-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const items = quote.items || [];
    if (items.length > 0) {
      items.forEach((it, idx) => {
        const lineTotal = calculateItemLineTotal(it);
        window.addGraItemRow(
          it.productName || it.name || it.description || "",
          it.unit || it.unitName || "كرتون",
          it.qty !== undefined ? it.qty : (it.quantity || 1),
          lineTotal.toFixed(2)
        );
      });
    } else {
      window.addGraItemRow("بضائع ومواد غذائية (حسب عرض السعر)", "شحنة", 1, parseFloat(quote.grandTotal || quote.total || 0).toFixed(2));
    }

    const qNum = quote.quoteNumber || quote.id;
    document.getElementById("gra-invoices-ref").value = "عرض سعر رقم " + qNum + (quote.date ? " بتاريخ " + formatDate(quote.date) : "");
    document.getElementById("gra-dispatch-ref").value = "إذن صرف بضاعة لعرض سعر " + qNum;
    document.getElementById("gra-warehouse-name").value = "المستودع الرئيسي";

    // Auto-fill customer if available
    if (quote.customerName && (!document.getElementById("gra-buyer-name")?.value || document.getElementById("gra-buyer-name")?.value === "عميل نقدي")) {
      document.getElementById("gra-buyer-name").value = quote.customerName;
      if (typeof window.handleGraCustomerSelect === "function") {
        window.handleGraCustomerSelect(quote.customerName);
      }
    }

    let quoteTot = parseFloat(quote.grandTotal || quote.total || 0);
    if (quoteTot <= 0) {
      let sum = 0;
      document.querySelectorAll(".gra-it-total").forEach(inp => {
        const val = parseFloat(inp.value || 0);
        if (!isNaN(val)) sum += val;
      });
      quoteTot = sum;
    }

    document.getElementById("gra-total-goods").value = quoteTot.toFixed(2);
    document.getElementById("gra-val-received").value = quoteTot.toFixed(2);
    document.getElementById("gra-val-paid").value = "0.00";
    document.getElementById("gra-val-remaining").value = quoteTot.toFixed(2);
    document.getElementById("gra-pn-amount").value = quoteTot.toFixed(2);

    window.calcGraTotals();
    showToast(`تم استيراد أصناف وبيانات عرض السعر ${qNum} بنجاح`, "success");
  };

  // Submit Handler
  window.submitGoodsReceiptAck = async (shouldSave = true) => {
    const docNumber = document.getElementById("gra-doc-number")?.value.trim() || defaultDocNumber;
    const docDate = document.getElementById("gra-doc-date")?.value || today;
    const docPlace = document.getElementById("gra-doc-place")?.value.trim() || "ينبع الصناعية";

    const sellerName = document.getElementById("gra-seller-name")?.value.trim() || co.name;
    const sellerCr = document.getElementById("gra-seller-cr")?.value.trim() || co.crNumber;
    const sellerVat = document.getElementById("gra-seller-vat")?.value.trim() || co.vatNumber;
    const sellerAddress = document.getElementById("gra-seller-address")?.value.trim() || co.address;

    const buyerName = document.getElementById("gra-buyer-name")?.value.trim() || "";
    if (!buyerName) {
      showToast("يرجى كتابة أو اختيار اسم المنشأة / المشتري", "warning");
      document.getElementById("gra-buyer-name")?.focus();
      return;
    }

    const buyerIdNum = document.getElementById("gra-buyer-idnum")?.value.trim() || "";
    const buyerPhone = document.getElementById("gra-buyer-phone")?.value.trim() || "";
    const buyerAddress = document.getElementById("gra-buyer-address")?.value.trim() || "";
    const buyerId = document.getElementById("gra-buyer-id")?.value.trim() || "";

    // Representative details (Physical receiver)
    const repName = document.getElementById("gra-rep-name")?.value.trim() || "";
    const repTitle = document.getElementById("gra-rep-title")?.value.trim() || "";
    const repId = document.getElementById("gra-rep-id")?.value.trim() || "";
    const repNationality = document.getElementById("gra-rep-nationality")?.value.trim() || "";
    const repPhone = document.getElementById("gra-rep-phone")?.value.trim() || "";

    // Items list
    const items = [];
    document.querySelectorAll("#gra-items-tbody tr").forEach((tr, idx) => {
      const name = tr.querySelector(".gra-it-name")?.value.trim();
      const unit = tr.querySelector(".gra-it-unit")?.value.trim() || "كرتون";
      const qty = parseFloat(tr.querySelector(".gra-it-qty")?.value || 0);
      const total = parseFloat(tr.querySelector(".gra-it-total")?.value || 0);
      if (name || qty > 0 || total > 0) {
        items.push({ index: idx + 1, name: name || "صنف بدون وصف", unit, qty, total });
      }
    });

    const totalGoods = parseFloat(document.getElementById("gra-total-goods")?.value || 0);
    const totalWords = document.getElementById("gra-tafqeet-words")?.value || (tafqeetArabic(totalGoods) + " فقط لا غير");

    const invoicesRef = document.getElementById("gra-invoices-ref")?.value.trim() || "";
    const dispatchRef = document.getElementById("gra-dispatch-ref")?.value.trim() || "";
    const warehouseName = document.getElementById("gra-warehouse-name")?.value.trim() || "المستودع الرئيسي";
    const actualDate = document.getElementById("gra-actual-date")?.value || docDate;

    const valReceived = parseFloat(document.getElementById("gra-val-received")?.value || totalGoods);
    const valPaid = parseFloat(document.getElementById("gra-val-paid")?.value || 0);
    const valRemaining = parseFloat(document.getElementById("gra-val-remaining")?.value || Math.max(0, valReceived - valPaid));
    const wordsRemaining = document.getElementById("gra-tafqeet-remaining")?.textContent || (tafqeetArabic(valRemaining) + " ريال سعودي فقط لا غير");

    // Promissory note issuer: DO NOT force establishment name
    const pnIssuer = document.getElementById("gra-pn-issuer")?.value.trim() || "";
    const pnBeneficiary = document.getElementById("gra-pn-beneficiary")?.value.trim() || sellerName;
    const pnNumber = document.getElementById("gra-pn-number")?.value.trim() || "";
    const pnDate = document.getElementById("gra-pn-date")?.value || docDate;
    const pnDueDate = document.getElementById("gra-pn-due-date")?.value || "";
    const pnAmount = parseFloat(document.getElementById("gra-pn-amount")?.value || valRemaining);

    const notes = document.getElementById("gra-notes")?.value.trim() || "";
    const attachmentsCount = document.getElementById("gra-attachments-count")?.value.trim() || "1";
    const totalPages = document.getElementById("gra-total-pages")?.value.trim() || "2";

    // Signatures: DO NOT force establishment name on buyer signature
    const sigBuyer = document.getElementById("gra-sig-buyer")?.value.trim() || repName || "";
    const sigWarehouse = document.getElementById("gra-sig-warehouse")?.value.trim() || "أمين المستودع";
    const sigSeller = document.getElementById("gra-sig-seller")?.value.trim() || "المفوض بالتوقيع";

    const record = {
      docNumber,
      docDate,
      docPlace,
      seller: { name: sellerName, crNumber: sellerCr, vatNumber: sellerVat, address: sellerAddress, phone: co.phone },
      buyer: { 
        id: buyerId, 
        name: buyerName, 
        idNumber: buyerIdNum, 
        phone: buyerPhone, 
        address: buyerAddress,
        repName,
        representative: repTitle,
        repId,
        repNationality,
        repPhone
      },
      items,
      totalGoods,
      totalWords,
      logistics: { invoicesRef, dispatchRef, warehouseName, actualDate },
      debt: { valReceived, valPaid, valRemaining, wordsRemaining },
      promissoryNote: { issuer: pnIssuer, beneficiary: pnBeneficiary, number: pnNumber, date: pnDate, dueDate: pnDueDate, amount: pnAmount },
      notes,
      attachmentsCount,
      totalPages,
      signatures: { buyer: sigBuyer, warehouse: sigWarehouse, seller: sigSeller },
      co,
      type: "goods_receipt_ack",
      status: "active",
      createdAt: new Date().toISOString()
    };

    if (shouldSave) {
      try {
        await create(COLS.goodsReceiptAcks(), record);
        showToast("تم حفظ إقرار استلام البضاعة برقم: " + docNumber, "success");
      } catch (err) {
        console.warn("Could not save to goodsReceiptAcks, trying trustReceipts:", err);
        try {
          await create(COLS.trustReceipts(), record);
          showToast("تم حفظ الإقرار في سجل المستندات", "success");
        } catch (e2) {
          console.error("Save failed:", e2);
        }
      }
    }

    document.getElementById("gra-modal-overlay")?.remove();
    await generateAndPrintGoodsReceiptAck(record);
  };
}

/**
 * توليد وطباعة وثيقة إقرار استلام البضاعة العينية وسند لأمر الرسمية A4
 * بنظام التقسيم الصفحي النظيف الداعم لأكثر من 20 صنفاً دون تداخل نصوص
 */
export async function generateAndPrintGoodsReceiptAck(data) {
  const {
    docNumber, docDate, docPlace,
    seller, buyer, items, totalGoods, totalWords,
    logistics, debt, promissoryNote,
    notes, attachmentsCount, signatures, co
  } = data;

  const coName = seller?.name || co?.name || "شركة نظم الإمداد المتطورة";
  const coCR = seller?.crNumber || co?.crNumber || "7054969006";
  const coVat = seller?.vatNumber || co?.vatNumber || "314996148100003";
  const coAddress = seller?.address || co?.address || "مبنى 7689 — شارع ينبع الصناعية 2179 — حي غرناطة — ينبع — رمز 46414";
  const coPhone = seller?.phone || co?.phone || "0549141648";

  // Pre-load company LOGO
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

  // Pre-load company STAMP
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

  const dateHijri = getHijriDate(new Date(docDate));

  // Determine pagination:
  // Split items across pages (15 items per page)
  const itemsCount = (items || []).length;
  const itemsPerPage = 15;
  const itemPages = [];
  if (itemsCount === 0) {
    itemPages.push([]);
  } else {
    for (let i = 0; i < itemsCount; i += itemsPerPage) {
      itemPages.push(items.slice(i, i + itemsPerPage));
    }
  }

  const totalCalculatedPages = itemPages.length + 1; // Item pages + 1 Final Legal/Signatures page

  const win = window.open("", "_blank", "width=960,height=1000");
  if (!win) {
    showToast("يرجى السماح بالنوافذ المنبثقة للطباعة", "error");
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>إقرار استلام بضاعة عينية مرتبط بسند لأمر — ${buyer?.name || ''}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @page {
      size: A4 portrait;
      margin: 8mm 10mm 10mm 10mm;
    }
    body {
      font-family: 'Cairo', -apple-system, BlinkMacSystemFont, Tahoma, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      color: #0f172a;
      background: #f8fafc;
      direction: rtl;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-page {
      width: 100%;
      max-width: 194mm;
      min-height: 275mm;
      margin: 0 auto 15mm auto;
      background: #fff;
      border: 2px solid #0f172a;
      outline: 1.5px solid #0284c7;
      outline-offset: -5px;
      padding: 14px 18px;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      box-sizing: border-box;
    }
    .print-page:last-child {
      page-break-after: auto;
      margin-bottom: 0;
    }

    /* Watermark */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 44px;
      font-weight: 900;
      color: rgba(15, 23, 42, 0.035);
      white-space: nowrap;
      pointer-events: none;
      letter-spacing: 3px;
      z-index: 1;
    }

    /* Header */
    .header-table {
      width: 100%;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 6px;
      margin-bottom: 8px;
      position: relative;
      z-index: 2;
    }
    .co-title {
      font-size: 14.5px;
      font-weight: 900;
      color: #0f172a;
      white-space: nowrap;
    }
    .co-meta {
      font-size: 9px;
      color: #334155;
      font-weight: 600;
      margin-top: 1px;
    }
    .doc-center-badge {
      text-align: center;
      background: #ffffff !important;
      color: #0f172a !important;
      padding: 5px 12px;
      border-radius: 8px;
      border: 2px solid #0f172a;
    }
    .doc-royal-title {
      font-size: 13.5px;
      font-weight: 900;
      letter-spacing: 0.3px;
      color: #0f172a !important;
      white-space: nowrap;
    }
    .doc-sub-badge {
      font-size: 8.5px;
      font-weight: 800;
      color: #0369a1;
      margin-top: 2px;
    }
    .serial-box {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11px;
      font-weight: 900;
      color: #000000 !important;
      margin-top: 3px;
      padding: 2px 8px;
      background: #f8fafc;
      border: 1px solid #0f172a;
      border-radius: 4px;
      display: inline-block;
    }

    /* Meta Bar */
    .meta-bar {
      display: flex;
      justify-content: space-between;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 9.5px;
      font-weight: 700;
      margin-bottom: 8px;
      z-index: 2;
      position: relative;
    }

    /* Section Header */
    .sec-header {
      font-size: 10.5px;
      font-weight: 900;
      color: #0f172a;
      background: #e2e8f0;
      padding: 4px 8px;
      border-right: 4px solid #0284c7;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Data Tables */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
      z-index: 2;
      position: relative;
    }
    .data-table th, .data-table td {
      border: 1px solid #94a3b8;
      padding: 4px 8px;
      font-size: 9.5px;
    }
    .data-table th {
      background: #f8fafc;
      font-weight: 800;
      color: #1e293b;
      width: 22%;
    }

    /* Items Table */
    .items-print-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
      z-index: 2;
      position: relative;
    }
    .items-print-table th {
      background: #0f172a;
      color: #fff;
      font-size: 9.5px;
      font-weight: 800;
      padding: 5px 6px;
      border: 1px solid #0f172a;
      text-align: center;
    }
    .items-print-table td {
      border: 1px solid #cbd5e1;
      padding: 4px 6px;
      font-size: 9px;
      color: #0f172a;
    }
    .items-print-table tr:nth-child(even) {
      background: #f8fafc;
    }

    /* Amount Highlight Box */
    .amount-highlight {
      background: #f8fafc;
      border: 1.5px solid #0f172a;
      border-radius: 6px;
      padding: 6px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      z-index: 2;
      position: relative;
    }
    .amount-digits {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 15px;
      font-weight: 900;
      color: #0f172a;
      white-space: nowrap;
    }

    /* Legal Clauses Box */
    .clauses-container {
      border: 1px solid #cbd5e1;
      background: #ffffff;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 8px;
      z-index: 2;
      position: relative;
    }
    .clause-row {
      margin-bottom: 6px;
      font-size: 9.2px;
      line-height: 1.55;
      color: #1e293b;
      text-align: justify;
    }
    .clause-row strong {
      color: #0f172a;
    }

    /* Promissory Note Box */
    .pn-linked-box {
      border: 2px solid #0284c7;
      background: #f0f9ff;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 8px;
      z-index: 2;
      position: relative;
    }
    .pn-title {
      font-size: 10px;
      font-weight: 900;
      color: #0369a1;
      margin-bottom: 6px;
      border-bottom: 1px dashed #7dd3fc;
      padding-bottom: 3px;
    }

    /* Dotted line for handwriting */
    .write-dot-line {
      border-bottom: 1px dotted #475569;
      display: inline-block;
      min-width: 140px;
      height: 12px;
      vertical-align: middle;
    }

    /* Signatures Section */
    .sig-grid {
      display: grid;
      grid-template-columns: 1.35fr 1fr 1fr;
      gap: 8px;
      margin-top: 4px;
      z-index: 2;
      position: relative;
      page-break-inside: avoid;
    }
    .sig-box {
      border: 1.5px solid #0f172a;
      border-radius: 6px;
      padding: 6px 8px;
      background: #fff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 155px;
    }
    .sig-title {
      font-size: 10px;
      font-weight: 900;
      color: #0f172a;
      border-bottom: 1.5px solid #0f172a;
      padding-bottom: 3px;
      margin-bottom: 5px;
      text-align: center;
      background: #f8fafc;
      border-radius: 4px 4px 0 0;
    }
    .sig-lines {
      font-size: 9px;
      line-height: 2.1;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .sig-row {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }
    .sig-row .lbl {
      font-weight: 800;
      color: #0f172a;
      white-space: nowrap;
      min-width: 65px;
    }
    .sig-row .val {
      font-weight: 800;
      color: #0f172a;
    }
    .sig-row .dots {
      flex: 1;
      border-bottom: 1px dotted #64748b;
      height: 13px;
      display: inline-block;
    }
    .stamp-box-dashed {
      border: 1.5px dashed #94a3b8;
      border-radius: 4px;
      height: 44px;
      margin-top: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      font-weight: 800;
      color: #64748b;
      background: #f8fafc;
      text-align: center;
    }
    .stamp-cell {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 95px;
    }
    .stamp-cell img {
      max-height: 90px;
      max-width: 145px;
      object-fit: contain;
      mix-blend-mode: multiply;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
    }

    /* Page Footer */
    .page-footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 4px;
      margin-top: 6px;
      font-size: 8px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      z-index: 2;
      position: relative;
    }

    /* Page-break signature ribbon */
    .page-intermediate-ack {
      border: 1.5px dashed #0284c7;
      background: #f0f9ff;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 9px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      z-index: 2;
      position: relative;
    }
  </style>
</head>
<body onload="window.print()">

  <!-- ═════════════════════════════════════════════════════════ -->
  <!-- ITEM PAGES (PAGES 1 to N-1) -->
  <!-- ═════════════════════════════════════════════════════════ -->
  ${itemPages.map((pageItems, pIdx) => {
    const pageNum = pIdx + 1;
    const isFirstPage = (pageNum === 1);

    return `
    <div class="print-page">
      <div class="watermark">إقرار استلام بضاعة وسند لأمر</div>

      <div>
        <!-- Header -->
        <table class="header-table">
          <tr>
            <td style="width:28%; vertical-align:middle; text-align:right;">
              ${logoUrl ? `
                <img src="${logoUrl}" style="max-height:75px; max-width:160px; object-fit:contain;" alt="شعار الشركة"/>
              ` : `
                <div style="width:65px; height:65px; border-radius:10px; background:#0f172a; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; font-size:16px;">نظم الإمداد</div>
              `}
            </td>
            <td style="width:42%; text-align:center; vertical-align:middle;">
              <div class="doc-center-badge">
                <div class="doc-royal-title">إقرار استلام بضاعة عينية وإقرار بمديونية ثمنها</div>
                <div class="doc-sub-badge">مرتبط بسند لأمر تنفيذي — حماية معتمدة لمبيعات الأجل</div>
                <div class="serial-box">رقم المستند: ${docNumber}</div>
              </div>
            </td>
            <td style="width:30%; text-align:left; vertical-align:middle; direction:rtl;">
              <div class="co-title">${coName}</div>
              <div class="co-meta">س.ت: <strong style="font-family:'IBM Plex Mono',monospace;">${coCR}</strong></div>
              <div class="co-meta">الرقم الضريبي: <strong style="font-family:'IBM Plex Mono',monospace;">${coVat}</strong></div>
              <div class="co-meta">هاتف: ${coPhone}</div>
              <div class="co-meta">التاريخ: ${docDate} م (${dateHijri})</div>
            </td>
          </tr>
        </table>

        <!-- Meta Bar -->
        <div class="meta-bar">
          <span><strong>رقم المستند:</strong> <span style="font-family:'IBM Plex Mono',monospace;">${docNumber}</span></span>
          <span><strong>تاريخ التحرير:</strong> ${docDate} م (${dateHijri})</span>
          <span><strong>مكان التحرير:</strong> ${docPlace || 'ينبع الصناعية'}</span>
          <span><strong>صفحة:</strong> ${pageNum} من ${totalCalculatedPages}</span>
        </div>

        ${isFirstPage ? `
        <!-- Section 1: Seller & Section 2: Buyer & Receiver -->
        <div style="margin-bottom:8px;">
          
          <!-- Parties Comprehensive Table -->
          <table class="data-table" style="margin-bottom:6px;">
            <tr>
              <th colspan="4" style="background:#0f172a; color:#fff; text-align:right; font-size:10px;">
                🏢 أولاً: بيانات البائع «الدائن»:
              </th>
            </tr>
            <tr>
              <th>الاسم / اسم المنشأة:</th>
              <td><strong>${coName}</strong></td>
              <th>السجل التجاري والضريبي:</th>
              <td>س.ت: <strong style="font-family:'IBM Plex Mono',monospace;">${coCR}</strong> — ضريبي: <strong style="font-family:'IBM Plex Mono',monospace;">${coVat}</strong></td>
            </tr>
            <tr>
              <th>العنوان الرسمي:</th>
              <td colspan="3">${coAddress} — هاتف: ${coPhone}</td>
            </tr>

            <tr>
              <th colspan="4" style="background:#0284c7; color:#fff; text-align:right; font-size:10px;">
                👤 ثانياً: بيانات المشتري «المدين» والمستلم المفوض (المقر بالاستلام):
              </th>
            </tr>
            <tr>
              <th>اسم المنشأة / المشتري:</th>
              <td><strong style="font-size:11px; color:#0f172a;">${buyer?.name || '—'}</strong></td>
              <th>السجل التجاري / الهوية:</th>
              <td><span style="font-family:'IBM Plex Mono',monospace; font-weight:700;">${buyer?.idNumber || '—'}</span></td>
            </tr>
            <tr>
              <th>العنوان الوطني المعتمد:</th>
              <td>${buyer?.address || 'ينبع — المملكة العربية السعودية'}</td>
              <th>هاتف / جوال المنشأة:</th>
              <td><span style="font-family:'IBM Plex Mono',monospace;">${buyer?.phone || '—'}</span></td>
            </tr>
            <tr style="background:#f8fafc;">
              <th style="color:#0369a1;">اسم المستلم / المفوض الفعلي:</th>
              <td>${buyer?.repName ? `<strong>${buyer.repName}</strong>` : '<span class="write-dot-line" style="width:100%;"></span>'}</td>
              <th style="color:#0369a1;">الصفة وسند التفويض:</th>
              <td>${buyer?.representative ? `<strong>${buyer.representative}</strong>` : '<span class="write-dot-line" style="width:100%;"></span>'}</td>
            </tr>
            <tr style="background:#f8fafc;">
              <th style="color:#0369a1;">رقم هوية / إقامة المستلم:</th>
              <td>${buyer?.repId ? `<strong style="font-family:'IBM Plex Mono',monospace;">${buyer.repId}</strong>` : '<span class="write-dot-line" style="width:100%;"></span>'}</td>
              <th style="color:#0369a1;">جنسية المستلم ورقم جواله:</th>
              <td>
                جنسية: ${buyer?.repNationality ? `<strong>${buyer.repNationality}</strong>` : '<span class="write-dot-line" style="min-width:60px;"></span>'}
                — جوال: ${buyer?.repPhone ? `<strong style="font-family:'IBM Plex Mono',monospace;">${buyer.repPhone}</strong>` : '<span class="write-dot-line" style="min-width:80px;"></span>'}
              </td>
            </tr>
          </table>

        </div>
        ` : ''}

        <!-- Section 3: Goods Delivered Table -->
        <div class="sec-header">
          <span>📦 ثالثاً: كشف بيانات البضاعة المستلمة ${itemPages.length > 1 ? `(جزء ${pageNum} من ${itemPages.length})` : ''}</span>
          <span style="font-size:9px; font-weight:700;">إجمالي الأصناف بالكشف: ${itemsCount} صنف</span>
        </div>

        <table class="items-print-table">
          <thead>
            <tr>
              <th style="width:32px;">م</th>
              <th>الصنف ووصفه</th>
              <th style="width:75px;">الوحدة</th>
              <th style="width:65px;">الكمية</th>
              <th style="width:115px;">إجمالي القيمة بالريال</th>
            </tr>
          </thead>
          <tbody>
            ${pageItems.map(it => `
              <tr>
                <td style="text-align:center; font-family:'IBM Plex Mono',monospace; font-weight:700;">${it.index}</td>
                <td><strong style="font-size:9.5px;">${it.name || ''}</strong></td>
                <td style="text-align:center;">${it.unit || 'كرتون'}</td>
                <td style="text-align:center; font-family:'IBM Plex Mono',monospace; font-weight:700;">${it.qty || 0}</td>
                <td style="text-align:left; font-family:'IBM Plex Mono',monospace; font-weight:800; direction:ltr; padding-left:8px;">${formatCurrency(it.total || 0)}</td>
              </tr>
            `).join("")}
            ${pageItems.length === 0 ? `
              <tr>
                <td colspan="5" style="text-align:center; padding:15px; color:#64748b;">
                  بضائع ومواد غذائية متنوعة وفقاً لكشف الفواتير وإذن الصرف المرفق والموقع عليه.
                </td>
              </tr>
            ` : ''}
          </tbody>
        </table>

        <!-- Totals & Logistics on last item page -->
        ${pageNum === itemPages.length ? `
        <div class="amount-highlight">
          <div>
            <div style="font-size:9.5px; font-weight:800; color:#0f172a;">إجمالي قيمة البضاعة شامل ضريبة القيمة المضافة (إن انطبقت):</div>
            <div style="font-size:10px; font-weight:800; color:#0369a1; margin-top:2px;">المبلغ كتابةً: [ ${totalWords} ]</div>
          </div>
          <div class="amount-digits">${formatCurrency(totalGoods)}</div>
        </div>

        <table class="data-table" style="margin-bottom:6px;">
          <tr>
            <th>أرقام الفواتير وتواريخها:</th>
            <td><strong>${logistics?.invoicesRef || '—'}</strong></td>
            <th>رقم إذن الصرف وتاريخه:</th>
            <td><strong>${logistics?.dispatchRef || '—'}</strong></td>
          </tr>
          <tr>
            <th>المخزن الذي تم التسليم منه:</th>
            <td>${logistics?.warehouseName || 'المستودع الرئيسي'}</td>
            <th>تاريخ الاستلام الفعلي:</th>
            <td><strong style="color:#0f172a;">${logistics?.actualDate || docDate}</strong></td>
          </tr>
        </table>
        ` : ''}

      </div>

      <!-- Intermediate Acknowledgment Line on items pages -->
      <div class="page-intermediate-ack">
        <div>
          ✍️ <strong>إقرار وتوقيع المستلم المفوض على صحة كشف البضاعة أعلاه:</strong> ..............................................................
        </div>
        <div>
          الصفة / الختم: ..............................................................
        </div>
      </div>

      <!-- Page Footer -->
      <div class="page-footer">
        <span>مستند إقرار استلام بضاعة وسند لأمر رقم: <strong style="font-family:'IBM Plex Mono',monospace;">${docNumber}</strong></span>
        <span>صفحة ${pageNum} من ${totalCalculatedPages}</span>
        <span>تعد هذه الصفحة كشفاً مكملاً وجزءاً لا يتجزأ من الإقرار القانوني الرسمي</span>
      </div>

    </div>
    `;
  }).join("")}

  <!-- ═════════════════════════════════════════════════════════ -->
  <!-- FINAL PAGE: LEGAL CLAUSES, PROMISSORY NOTE, SIGNATURES -->
  <!-- ═════════════════════════════════════════════════════════ -->
  <div class="print-page">
    <div class="watermark">إقرار استلام بضاعة وسند لأمر</div>

    <div>
      <!-- Header -->
      <table class="header-table">
        <tr>
          <td style="width:28%; vertical-align:middle; text-align:right;">
            ${logoUrl ? `
              <img src="${logoUrl}" style="max-height:75px; max-width:160px; object-fit:contain;" alt="شعار الشركة"/>
            ` : `
              <div style="width:65px; height:65px; border-radius:10px; background:#0f172a; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; font-size:16px;">نظم الإمداد</div>
            `}
          </td>
          <td style="width:42%; text-align:center; vertical-align:middle;">
            <div class="doc-center-badge">
              <div class="doc-royal-title">رابعاً: الإقرار بالاستلام والمديونية والارتباط بالسند لأمر</div>
              <div class="doc-sub-badge">إقرار قضائي بات وملزم — نافٍ للجهالة ومثبت لسبب الدين العيني</div>
              <div class="serial-box">تابع للمستند: ${docNumber}</div>
            </div>
          </td>
          <td style="width:30%; text-align:left; vertical-align:middle; direction:rtl;">
            <div class="co-title">${coName}</div>
            <div class="co-meta">س.ت: <strong style="font-family:'IBM Plex Mono',monospace;">${coCR}</strong></div>
            <div class="co-meta">المنشأة: <strong style="color:#0f172a;">${buyer?.name || ''}</strong></div>
            <div class="co-meta">تاريخ التحرير: ${docDate} م</div>
          </td>
        </tr>
      </table>

      <!-- Meta Bar -->
      <div class="meta-bar">
        <span><strong>رقم المستند:</strong> <span style="font-family:'IBM Plex Mono',monospace;">${docNumber}</span></span>
        <span><strong>مكان وتاريخ التحرير:</strong> ${docPlace || 'ينبع الصناعية'} في ${docDate} م (${dateHijri})</span>
        <span><strong>صفحة:</strong> ${totalCalculatedPages} من ${totalCalculatedPages} (صفحة الإقرار والاعتمادات)</span>
      </div>

      <!-- Pre-amble -->
      <div style="font-size:9.5px; font-weight:800; color:#0f172a; margin-bottom:6px; line-height:1.5; background:#f1f5f9; padding:5px 8px; border-radius:4px; border-right:3px solid #0f172a;">
        أقر أنا المشتري الموضحة بياناتي أعلاه، أصالةً عن نفسي / بصفتي ممثلًا مفوضًا عن المشتري المذكور، بكامل الأهلية المعتبرة شرعًا ونظامًا، بما يأتي:
      </div>

      <!-- Legal Clauses 1 to 6 (Full Exact Text) -->
      <div class="clauses-container">
        
        <div class="clause-row">
          <strong>1.</strong> استلمت فعليًا من البائع البضاعة المبينة بهذا المستند والفواتير وإذن الصرف المشار إليها، وذلك على سبيل الشراء بالأجل، وتسلمتها بالكميات والأوصاف المثبتة، بعد فحصها ظاهرًا، مع إثبات أي نقص أو تحفظ في خانة الملاحظات أدناه، ودون إخلال بالحقوق المتعلقة بالعيوب الخفية وفقًا للنظام.
        </div>

        <div class="clause-row" style="background:#f8fafc; padding:4px 8px; border-radius:4px; border:1px solid #e2e8f0;">
          <strong>2.</strong> بلغت قيمة البضاعة المستلمة مبلغًا قدره (<strong style="font-family:'IBM Plex Mono',monospace;">${formatCurrency(debt?.valReceived || totalGoods)}</strong>) ريال سعودي، وسُدد من ثمنها مبلغ قدره (<strong style="font-family:'IBM Plex Mono',monospace;">${formatCurrency(debt?.valPaid || 0)}</strong>) ريال سعودي، وبقي في ذمة المشتري لصالح البائع مبلغ قدره (<strong style="font-family:'IBM Plex Mono',monospace; color:#b91c1c;">${formatCurrency(debt?.valRemaining || totalGoods)}</strong>) ريال سعودي، كتابةً: [ <strong style="color:#0369a1;">${debt?.wordsRemaining || (tafqeetArabic(debt?.valRemaining || totalGoods) + ' ريال سعودي فقط لا غير')}</strong> ].
        </div>

        <div class="clause-row">
          <strong>3.</strong> أقر بأن المبلغ المتبقي المذكور أعلاه يمثل ثمن بضاعة تم استلامها فعلًا، وأنه الدين ذاته المثبت بالسند لأمر المحرر من:
        </div>

        <!-- Promissory Note Details Table (Never fills establishment name, leaves blank line for handwriting) -->
        <div class="pn-linked-box">
          <div class="pn-title">🔗 السند لأمر التنفيذي المحرر وفاءً لثمن هذه البضاعة المستلمة:</div>
          <table style="width:100%; border-collapse:collapse; font-size:9.5px;">
            <tr>
              <td style="padding:3px 6px; width:50%;">
                <strong>اسم محرر السند:</strong> 
                ${promissoryNote?.issuer ? `<strong>${promissoryNote.issuer}</strong>` : `<span class="write-dot-line" style="min-width:180px;"></span>`}
              </td>
              <td style="padding:3px 6px; width:50%;">
                <strong>لصالح المستفيد:</strong> <strong>${promissoryNote?.beneficiary || coName}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:3px 6px;">
                <strong>رقم السند لأمر / رقمه الإلكتروني (نافذ):</strong> 
                ${promissoryNote?.number ? `<strong style="font-family:'IBM Plex Mono',monospace; color:#0369a1; font-size:11px;">${promissoryNote.number}</strong>` : `<span class="write-dot-line" style="min-width:160px;"></span>`}
              </td>
              <td style="padding:3px 6px;">
                <strong>قيمته بالريال:</strong> <strong style="font-family:'IBM Plex Mono',monospace; color:#b91c1c; font-size:11px;">${formatCurrency(promissoryNote?.amount || debt?.valRemaining || totalGoods)}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:3px 6px;">
                <strong>تاريخ إنشائه:</strong> ${promissoryNote?.date || docDate} م
              </td>
              <td style="padding:3px 6px;">
                <strong>تاريخ استحقاقه:</strong> <strong style="color:#b91c1c;">${promissoryNote?.dueDate ? formatDate(promissoryNote.dueDate) : 'فور الطلب / عند الاطلاع'}</strong>
              </td>
            </tr>
          </table>
        </div>

        <div class="clause-row">
          <strong>4.</strong> أقر بأن سبب تحرير السند لأمر المشار إليه هو المديونية الناشئة عن شراء واستلام البضاعة المبينة أعلاه، وأن هذا الإقرار يثبت استلام البضاعة التي نشأت عنها المديونية، ولا يتضمن إقرارًا باستلام مبلغ نقدي.
        </div>

        <div class="clause-row">
          <strong>5.</strong> لا يُعد توقيع هذا المستند سدادًا للسند لأمر أو إبراءً من الدين، كما لا ينشئ دينًا إضافيًا مستقلًا عن الدين المثبت بالسند. ويُخصم من الرصيد المستحق كل سداد فعلي أو تسوية ثابتة بين الطرفين، ولا يجوز استيفاء الدين ذاته أكثر من مرة.
        </div>

        <div class="clause-row">
          <strong>6.</strong> تعد الفواتير وإذن الصرف وكشف الأصناف المرفقة، المحددة أرقامها أعلاه والموقعة من المستلم، مكملة لهذا الإقرار.
        </div>

        <div style="font-size:9.5px; font-weight:800; color:#0f172a; margin-top:4px;">
          وقد وقعت هذا الإقرار بعد الاطلاع على بياناته ومرفقاته والتحقق من مطابقتها لواقعة الاستلام الفعلية.
        </div>

      </div>

      <!-- Notes & Reservations -->
      <table class="data-table" style="margin-bottom:6px;">
        <tr>
          <th style="width:18%;">الملاحظات والتحفظات:</th>
          <td>${notes || 'لا توجد ملاحظات أو تحفظات — البضاعة مستلمة بحالة ممتازة ومطابقة للمواصفات.'}</td>
        </tr>
      </table>

      <!-- Signatures Grid (Completely clean and un-crossed) -->
      <div class="sig-grid">
        
        <!-- Buyer / Receiver Signature Card -->
        <div class="sig-box">
          <div class="sig-title">المشتري / المستلم المفوض</div>
          <div class="sig-lines">
            <div class="sig-row">
              <span class="lbl">اسم المستلم:</span>
              ${signatures?.buyer ? `<span class="val">${signatures.buyer}</span>` : '<span class="dots"></span>'}
            </div>
            <div class="sig-row">
              <span class="lbl">الصفة:</span>
              ${buyer?.representative ? `<span class="val">${buyer.representative}</span>` : '<span class="dots"></span>'}
            </div>
            <div class="sig-row">
              <span class="lbl">الهوية/الإقامة:</span>
              ${buyer?.repId ? `<span class="val" style="font-family:'IBM Plex Mono',monospace;">${buyer.repId}</span>` : '<span class="dots"></span>'}
              <span style="font-weight:800; color:#0f172a; margin-right:4px;">الجنسية:</span>
              ${buyer?.repNationality ? `<span class="val">${buyer.repNationality}</span>` : '<span class="dots" style="max-width:45px;"></span>'}
            </div>
            <div class="sig-row">
              <span class="lbl">رقم الجوال:</span>
              ${buyer?.repPhone ? `<span class="val" style="font-family:'IBM Plex Mono',monospace;">${buyer.repPhone}</span>` : '<span class="dots"></span>'}
            </div>
            <div class="sig-row">
              <span class="lbl">التوقيع:</span>
              <span class="dots"></span>
            </div>
          </div>
          <div class="stamp-box-dashed">
            محل ختم المنشأة (المشتري)
          </div>
        </div>

        <!-- Warehouse Officer -->
        <div class="sig-box">
          <div class="sig-title">مسؤول التسليم من المخزن</div>
          <div class="sig-lines">
            <div class="sig-row">
              <span class="lbl">الاسم:</span>
              <span class="val">${signatures?.warehouse || 'أمين المستودع'}</span>
            </div>
            <div class="sig-row">
              <span class="lbl">المخزن:</span>
              <span class="val">${logistics?.warehouseName || 'المستودع الرئيسي'}</span>
            </div>
            <div class="sig-row" style="margin-top:8px;">
              <span class="lbl">التوقيع:</span>
              <span class="dots"></span>
            </div>
          </div>
          <div style="height:44px; margin-top:4px;"></div>
        </div>

        <!-- Creditor / Seller Stamp -->
        <div class="sig-box" style="border-color:#0284c7; background:#f0f9ff;">
          <div class="sig-title" style="color:#0369a1;">اعتماد البائع</div>
          <div class="sig-lines">
            <div class="sig-row">
              <span class="lbl" style="min-width:75px;">الاسم والصفة:</span>
              <span class="val">${signatures?.seller || 'المفوض بالتوقيع'}</span>
            </div>
          </div>
          <div class="stamp-cell">
            ${stampB64 ? `<img src="${stampB64}" alt="ختم البائع"/>` : `<div style="font-size:9px; color:#0369a1; font-weight:800;">التوقيع والختم المعتمد</div>`}
          </div>
        </div>

      </div>

    </div>

    <!-- Page Footer & Attachments -->
    <div>
      <div style="font-size:8.5px; font-weight:700; color:#334155; margin-bottom:4px; background:#f1f5f9; padding:4px 8px; border-radius:4px; display:flex; justify-content:space-between;">
        <span><strong>المرفقات:</strong> ${attachmentsCount || '1'} مستندات، بإجمالي (${totalCalculatedPages}) صفحات.</span>
        <span>وثيقة ملزمة نظامياً وفقاً لنظام الإثبات ونظام المعاملات المدنية بالمملكة العربية السعودية</span>
      </div>
      <div class="page-footer">
        <span>مستند إقرار استلام بضاعة وسند لأمر رقم: <strong style="font-family:'IBM Plex Mono',monospace;">${docNumber}</strong></span>
        <span>صفحة ${totalCalculatedPages} من ${totalCalculatedPages}</span>
        <span>تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA")} م</span>
      </div>
    </div>

  </div>

</body>
</html>`;

  win.document.write(html);
  win.document.close();
}

// Global exposure
if (typeof window !== "undefined") {
  window.openGoodsReceiptAckModal = openGoodsReceiptAckModal;
  window.generateAndPrintGoodsReceiptAck = generateAndPrintGoodsReceiptAck;
}
