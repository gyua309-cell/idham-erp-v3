// ============================================================
// IDHAM ERP — Quotations Module v2 (عروض الأسعار)
// ============================================================
import {
  COLS, create, update, remove, getAll,
  query, orderBy, limit, getDocs, where
} from "../utils/db.js";
import { generateInvoiceNumber } from "../utils/db.js";
import { formatCurrency, formatQuantity, todayString, debounce } from "../utils/formatters.js";
import { db, COMPANY_ID } from "../firebase-config.js";

// ── State ────────────────────────────────────────────────────
let quotations  = [];
let customers   = [];
let products    = [];
let salesReps   = [];
let categories  = [];
let priceLists  = [];
let quoteItems  = [];
let activeQuoteId = null;
let _quotesUser = null;

let plMargins = { retailMargin: 10, wholesaleMargin: 7, distributorMargin: 5 };

async function loadPriceListMargins() {
  try {
    const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const docRef = doc(db, `companies/${COMPANY_ID}/settings`, "priceListMargins");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.retailMargin !== undefined) plMargins.retailMargin = parseFloat(data.retailMargin);
      if (data.wholesaleMargin !== undefined) plMargins.wholesaleMargin = parseFloat(data.wholesaleMargin);
      if (data.distributorMargin !== undefined) plMargins.distributorMargin = parseFloat(data.distributorMargin);
    }
  } catch (e) {
    console.warn("Failed to load priceListMargins settings:", e);
  }
}

// ── Helpers ──────────────────────────────────────────────────
function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function isoToDisplay(str) {
  if (!str) return "—";
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString("ar-SA", { year: "numeric", month: "2-digit", day: "2-digit" });
}

const STATUS_MAP = {
  draft:     { label: "مسودة",   cls: "neutral" },
  sent:      { label: "مُرسَل",   cls: "indigo"  },
  accepted:  { label: "مقبول",   cls: "good"    },
  rejected:  { label: "مرفوض",  cls: "bad"     },
  expired:   { label: "منتهي",  cls: "warn"    },
  converted: { label: "مُفوتَر", cls: "teal"    },
};

function statusBadge(status) {
  const s = STATUS_MAP[status] || { label: status, cls: "neutral" };
  return `<span class="badge ${s.cls}" style="font-size:10px;">${s.label}</span>`;
}

function calcQuoteTotals(lines, edType, edVal) {
  let grossTotal = 0, discountLines = 0;
  for (const l of lines) {
    const gross = (l.qty || 0) * (l.unitPrice || 0);
    const disc  = gross * (l.discount || 0) / 100;
    grossTotal   += gross;
    discountLines += disc;
  }
  const afterLineDisc = grossTotal - discountLines;
  let extraDiscount = 0;
  const ev = parseFloat(edVal) || 0;
  if (edType === "pct")   extraDiscount = afterLineDisc * ev / 100;
  if (edType === "fixed") extraDiscount = ev;
  const subtotal   = Math.max(0, afterLineDisc - extraDiscount);
  const vat        = Math.round(subtotal * 0.15 * 100) / 100;
  const grandTotal = Math.round((subtotal + vat) * 100) / 100;
  return {
    grossTotal:    Math.round(grossTotal * 100) / 100,
    discountLines: Math.round(discountLines * 100) / 100,
    extraDiscount: Math.round(extraDiscount * 100) / 100,
    totalDiscount: Math.round((discountLines + extraDiscount) * 100) / 100,
    subtotal, vat, grandTotal,
  };
}

// ============================================================
// ENTRY POINT
// ============================================================
export async function render(container, user) {
  _quotesUser = user;
  container.innerHTML = buildPage();
  await loadPriceListMargins();
  await Promise.all([loadDependencies(), loadQuotesList()]);
  setupCustomerAutocomplete();
  setupProductAutocomplete();
}

// ============================================================
// PAGE HTML
// ============================================================
function buildPage() {
  const today = todayString();
  const firstDay = today.slice(0, 8) + "01";
  return `
<div class="filterbar">
  <input type="text" id="qt-search" class="input" style="width:200px;"
    placeholder="بحث برقم العرض أو العميل" oninput="filterQuotes()" />
  <div class="filter-select-group">
    <label>الحالة</label>
    <select id="qt-status-filter" onchange="filterQuotes()">
      <option value="">الكل</option>
      <option value="draft">مسودة</option>
      <option value="sent">مُرسَل</option>
      <option value="accepted">مقبول</option>
      <option value="rejected">مرفوض</option>
      <option value="expired">منتهي</option>
      <option value="converted">مُفوتَر</option>
    </select>
  </div>
  <div class="date-range-group"><label>من</label>
    <input type="date" id="qt-from" value="${firstDay}" onchange="filterQuotes()" />
  </div>
  <div class="date-range-group"><label>إلى</label>
    <input type="date" id="qt-to" value="${today}" onchange="filterQuotes()" />
  </div>
  <div class="filter-select-group">
    <label>المندوب</label>
    <select id="qt-rep-filter" onchange="filterQuotes()">
      <option value="">الكل</option>
    </select>
  </div>
  <div style="margin-right:auto;display:flex;gap:8px;">
    <button class="btn-export" onclick="exportPagePDF('.data-dense','عروض_الأسعار')" title="تصدير PDF"><span>📄</span> PDF</button>
    <button class="btn-export excel" onclick="exportPageExcel('.data-dense','عروض_الأسعار')" title="تصدير Excel"><span>📊</span> Excel</button>
    <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
    <button class="btn btn-secondary" onclick="openPdfImportModal()" style="display:flex; align-items:center; gap:6px;">📥 استيراد من عرض سعر PDF</button>
    <button class="btn btn-primary" onclick="openQuoteForm()">+ عرض سعر جديد</button>
  </div>
</div>

<div class="page-content">
  <div class="kpi-grid mb-20">
    <div class="kpi-card g-blue">
      <div class="kpi-icon">📋</div>
      <div class="kpi-content"><div class="kpi-label">إجمالي العروض</div>
        <div class="kpi-value mono" id="kpi-qt-total">—</div></div></div>
    <div class="kpi-card g-green">
      <div class="kpi-icon">✅</div>
      <div class="kpi-content"><div class="kpi-label">عروض مقبولة</div>
        <div class="kpi-value mono" id="kpi-qt-accepted">—</div></div></div>
    <div class="kpi-card g-orange">
      <div class="kpi-icon">⏳</div>
      <div class="kpi-content"><div class="kpi-label">عروض منتظرة</div>
        <div class="kpi-value mono" id="kpi-qt-pending">—</div></div></div>
    <div class="kpi-card g-purple">
      <div class="kpi-icon">🔄</div>
      <div class="kpi-content"><div class="kpi-label">نسبة التحويل</div>
        <div class="kpi-value mono" id="kpi-qt-conv">—</div></div></div>
  </div>

  <div class="card">
    <div class="card-header">
      <h3 style="font-family:var(--font-heading);font-size:14px;">قائمة عروض الأسعار</h3>
      <span id="qt-count-label" class="text-2" style="font-size:12px;"></span>
    </div>
    <div class="table-container">
      <table class="data-dense">
        <thead><tr>
          <th>رقم العرض</th><th>التاريخ</th><th>العميل</th>
          <th>المندوب</th><th style="text-align:center;">الأصناف</th>
          <th>الإجمالي</th><th>الحالة</th><th>الصلاحية</th>
          <th style="width:160px;">إجراءات</th>
        </tr></thead>
        <tbody id="qt-tbody">
          ${Array(8).fill(0).map(() => `
                <tr class="skeleton-row">
                  ${Array(9).fill(0).map(() => `<td><div class="sk" style="width:${40 + Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- QUOTE FORM MODAL                                        -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="modal-overlay" id="qt-form-modal">
  <div class="modal modal-xl">
    <div class="modal-header">
      <h3 class="modal-title" id="qt-form-title">عرض سعر جديد</h3>
      <button class="modal-close" onclick="closeModal('qt-form-modal')">×</button>
    </div>
    <div class="modal-body">

      <div class="grid-3 gap-16 mb-16">
        <div class="form-group">
          <label>رقم العرض</label>
          <input type="text" id="qt-number" class="input mono" readonly
            style="background:var(--bg-2);color:var(--text-2);" placeholder="يُولَّد تلقائياً" />
        </div>
        <div class="form-group">
          <label>التاريخ *</label>
          <input type="date" id="qt-date" class="input" />
        </div>
        <div class="form-group">
          <label>تاريخ الصلاحية *</label>
          <input type="date" id="qt-expiry" class="input" onchange="checkExpiryWarn()" />
          <div id="qt-expiry-warn" style="font-size:11px;color:var(--bad);display:none;margin-top:4px;">⚠️ التاريخ في الماضي</div>
        </div>
      </div>

      <div class="grid-3 gap-16 mb-16">
        <div class="form-group">
          <label>العميل *</label>
          <div class="autocomplete-container">
            <input type="text" id="qt-customer-search" class="input"
              placeholder="ابحث باسم العميل…" autocomplete="off" />
            <div class="autocomplete-results hidden" id="qt-customer-results"></div>
            <input type="hidden" id="qt-customer-id" />
            <input type="hidden" id="qt-customer-name-val" />
          </div>
        </div>
        <div class="form-group">
          <label>عنوان التسليم</label>
          <input type="text" id="qt-delivery-address" class="input" placeholder="عنوان التسليم (اختياري)" />
        </div>
        <div class="form-group">
          <label>المندوب</label>
          <select id="qt-rep" class="input"><option value="">بدون مندوب</option></select>
        </div>
      </div>

      <div class="grid-3 gap-16 mb-16">
        <div class="form-group">
          <label>قائمة الأسعار</label>
          <select id="qt-pricelist" class="input" onchange="onPricelistChange()">
            <option value="standard">عادي (Standard)</option>
            <option value="wholesale">جملة (Wholesale)</option>
            <option value="distributor">موزع (Distributor)</option>
            <option value="special">خاص (Special)</option>
          </select>
        </div>
        <div class="form-group">
          <label>شروط الدفع</label>
          <select id="qt-payment-terms" class="input">
            <option value="cash">نقداً</option>
            <option value="net30">30 يوم</option>
            <option value="net60">60 يوم</option>
            <option value="custom">حسب الاتفاق</option>
          </select>
        </div>
        <div class="form-group">
          <label>حالة العرض</label>
          <select id="qt-status" class="input">
            <option value="draft">مسودة</option>
            <option value="sent">مُرسَل</option>
            <option value="accepted">مقبول</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>
      </div>

      <!-- Product Search -->
      <div style="background:var(--bg-2);border:1px solid var(--border-soft);border-radius:8px;padding:12px;margin-bottom:12px;">
        <div style="display:grid; grid-template-columns:160px 1fr; gap:12px; align-items:end;">
          <div class="form-group" style="margin-bottom:0;">
            <label style="font-size:11px; margin-bottom:4px;">تصفية بالفئة</label>
            <select id="qt-product-category-filter" class="input" style="padding:6px; font-size:12px; height:34px;">
              <option value="">كل الفئات</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label style="font-size:11px; margin-bottom:4px;">ابحث بالاسم أو الكود للإضافة</label>
            <div class="autocomplete-container">
              <input type="text" id="qt-product-search" class="input" style="padding:6px; font-size:12px; height:34px;"
                placeholder="ابحث بالاسم أو رمز الصنف (SKU)... [F8 للبحث المتقدم]" autocomplete="off" />
              <div class="autocomplete-results hidden" id="qt-product-results"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Line Items Table -->
      <div class="invoice-lines" style="margin-bottom:16px; margin-top: 0;">
        <table style="width:100%;font-size:12.5px;border-collapse:collapse;">
          <thead>
            <tr style="background:var(--bg-2);border-bottom:2px solid var(--border-soft);">
              <th style="padding:8px 8px;text-align:right;font-size:11px;color:var(--text-2);width:32px;">#</th>
              <th style="padding:8px 8px;text-align:right;font-size:11px;color:var(--text-2);min-width:320px !important;">الصنف</th>
              <th style="padding:8px 8px;text-align:right;font-size:11px;color:var(--text-2);width:60px;">الوحدة</th>
              <th style="padding:8px 8px;text-align:right;font-size:11px;color:var(--text-2);width:82px;">الكمية</th>
              <th class="no-print" style="padding:8px 8px;text-align:right;font-size:11px;color:var(--text-2);width:95px;">سعر التكلفة</th>
              <th class="no-print" style="padding:8px 8px;text-align:right;font-size:11px;color:var(--text-2);width:85px;">هامش ربح%</th>
              <th style="padding:8px 8px;text-align:right;font-size:11px;color:var(--text-2);width:110px;">سعر الوحدة</th>
              <th style="padding:8px 8px;text-align:right;font-size:11px;color:var(--text-2);width:72px;">خصم %</th>
              <th style="padding:8px 8px;text-align:right;font-size:11px;color:var(--text-2);width:105px;">صافي</th>
              <th style="padding:8px 8px;text-align:right;font-size:11px;color:var(--text-2);width:85px;">ضريبة 15%</th>
              <th style="padding:8px 8px;text-align:right;font-size:11px;color:var(--text-2);width:105px;">الإجمالي</th>
              <th style="width:34px;"></th>
            </tr>
          </thead>
          <tbody id="qt-lines-tbody"></tbody>
        </table>
      </div>

      <!-- Totals + Notes -->
      <div style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap;">
        <div style="flex:1;min-width:250px;display:flex;flex-direction:column;gap:12px;">
          <div class="form-group">
            <label>ملاحظات</label>
            <textarea id="qt-notes" class="input" rows="3"
              placeholder="ملاحظات عامة للعميل…" style="resize:vertical;"></textarea>
          </div>
          <div class="form-group">
            <label>الشروط والأحكام</label>
            <textarea id="qt-terms" class="input" rows="3"
              style="resize:vertical;">صلاحية العرض: 30 يوماً من تاريخه. الأسعار شاملة ضريبة القيمة المضافة 15%. يُعدّ هذا العرض ملزماً عند قبوله.</textarea>
          </div>
        </div>

        <div style="width:310px;flex-shrink:0;">
          <!-- Extra Discount -->
          <div style="background:var(--bg-2);border:1px solid var(--border-soft);border-radius:8px;padding:10px;margin-bottom:10px;">
            <div style="font-size:12px;font-weight:600;color:var(--text-2);margin-bottom:8px;">خصم إضافي</div>
            <div style="display:flex;gap:8px;align-items:center;">
              <select id="qt-extra-disc-type" class="input"
                style="width:95px;height:30px;font-size:12px;" onchange="recalcTotals()">
                <option value="none">لا يوجد</option>
                <option value="pct">نسبة %</option>
                <option value="fixed">مبلغ ثابت</option>
              </select>
              <input type="number" id="qt-extra-disc-val" class="input mono"
                style="width:100px;height:30px;font-size:12px;" min="0" step="0.01"
                value="0" oninput="recalcTotals()" />
            </div>
          </div>
          <!-- Totals Box -->
          <div style="background:var(--bg-1);border:1px solid var(--border-soft);border-radius:8px;overflow:hidden;">
            <div style="display:flex;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--border-soft);">
              <span style="font-size:12px;color:var(--text-2);">المجموع قبل الخصم</span>
              <span class="mono" id="qt-t-gross" style="font-size:12px;">0.00 ر.س</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--border-soft);">
              <span style="font-size:12px;color:var(--text-2);">إجمالي الخصم</span>
              <span class="mono" id="qt-t-disc" style="font-size:12px;color:var(--bad);">0.00 ر.س</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--border-soft);">
              <span style="font-size:12px;color:var(--text-2);">المجموع بعد الخصم</span>
              <span class="mono" id="qt-t-subtotal" style="font-size:12px;">0.00 ر.س</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--border-soft);">
              <span style="font-size:12px;color:var(--text-2);">ضريبة القيمة المضافة (15%)</span>
              <span class="mono" id="qt-t-vat" style="font-size:12px;color:var(--warn);">0.00 ر.س</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:12px 14px;background:var(--brand);">
              <span style="font-size:15px;font-weight:700;color:#fff;">الإجمالي النهائي</span>
              <span class="mono" id="qt-t-grand" style="font-size:18px;font-weight:800;color:#fff;">0.00 ر.س</span>
            </div>
          </div>
        </div>
      </div>

        <div class="form-group mb-16" style="margin-top: 16px;">
          <label>📁 إرفاق ملف عرض السعر (أتمتة الأرشيف)</label>
          <input type="file" id="qt-file-upload" class="input" accept="image/*,application/pdf" />
        </div>

        <div id="qt-form-error" class="alert bad hidden" style="margin-top:14px;"></div>
    </div>

    <div class="modal-footer" style="gap:10px;">
      <button class="btn btn-ghost" onclick="closeModal('qt-form-modal')">إلغاء</button>
      <button class="btn btn-secondary" onclick="saveQuote('draft')" id="qt-save-draft-btn">💾 حفظ مسودة</button>
      <button class="btn btn-primary" onclick="saveQuote('sent')" id="qt-save-btn">📤 حفظ وإرسال</button>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- PDF IMPORT MODAL                                       -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="modal-overlay" id="qt-pdf-modal">
  <div class="modal modal-xl" style="max-height:85vh; display:flex; flex-direction:column;">
    <div class="modal-header">
      <h3 class="modal-title">📤 استيراد أصناف من عرض سعر PDF</h3>
      <button class="modal-close" onclick="closeModal('qt-pdf-modal')">×</button>
    </div>
    <div class="modal-body" style="overflow-y:auto; flex:1; padding:24px;">
      
      <!-- Drag & Drop Zone -->
      <div id="qt-pdf-dropzone" style="border:3px dashed var(--border); border-radius:14px; padding:32px; text-align:center; cursor:pointer; background:var(--bg-2); transition:all 0.2s;"
        onclick="document.getElementById('qt-pdf-file-input').click()"
        ondragover="event.preventDefault(); this.style.borderColor='var(--brand)'; this.style.background='var(--brand-glow)';"
        ondragleave="this.style.borderColor='var(--border)'; this.style.background='var(--bg-2)';"
        ondrop="handlePdfDrop(event)">
        <div style="font-size:48px; margin-bottom:8px;">📄</div>
        <div style="font-weight:700; color:var(--text-0); font-size:15px; margin-bottom:4px;">اسحب وأفلت ملف عرض سعر المورد (PDF) هنا</div>
        <div style="font-size:12px; color:var(--text-muted);">أو اضغط لاختيار الملف من جهازك</div>
      </div>
      <input type="file" id="qt-pdf-file-input" accept=".pdf" style="display:none;" onchange="handlePdfFile(event)" />

      <!-- Loading Spinner -->
      <div id="qt-pdf-loading" class="hidden" style="text-align:center; padding:32px;">
        <div class="loading-spinner" style="margin:0 auto 12px auto;"></div>
        <div style="font-size:13px; color:var(--text-dim);">جارٍ تحليل وقراءة ملف الـ PDF واستخراج البنود...</div>
      </div>

      <!-- Error alert -->
      <div id="qt-pdf-error" class="alert bad hidden" style="margin-top:16px;"></div>

      <!-- Preview Parsed Items -->
      <div id="qt-pdf-preview-area" class="hidden" style="margin-top:20px;">
        <h4 style="color:var(--primary); font-family:var(--font-heading); font-size:14px; font-weight:700; margin-bottom:12px;">📋 البنود المستخرجة من الملف (حدد هوامش الربح وقم بمطابقة الأصناف)</h4>
        
        <div class="table-container" style="max-height:300px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:8px;">
          <table class="data-dense" style="width:100%; margin:0;">
            <thead>
              <tr style="position:sticky; top:0; background:var(--bg-2); z-index:10;">
                <th style="width:30px;"><input type="checkbox" id="qt-pdf-select-all" checked onchange="toggleAllPdfItems(this.checked)" /></th>
                <th>الصنف المستخرج من الملف</th>
                <th style="width:60px;">الكمية</th>
                <th style="width:90px;">التكلفة (المورد)</th>
                <th style="width:180px;">مطابقة مع أصناف النظام</th>
                <th style="width:90px;">هامش ربحك (%)</th>
                <th style="width:90px;">سعر البيع المقترح</th>
              </tr>
            </thead>
            <tbody id="qt-pdf-parsed-tbody"></tbody>
          </table>
        </div>
      </div>

    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('qt-pdf-modal')">إلغاء</button>
      <button class="btn btn-primary" id="qt-pdf-submit-btn" disabled onclick="submitImportedPdfItems()">⚡ تحويل لعرض سعر العميل</button>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- VIEW MODAL                                              -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="modal-overlay" id="qt-view-modal">
  <div class="modal modal-lg">
    <div class="modal-header">
      <h3 class="modal-title" id="qt-view-title">تفاصيل عرض السعر</h3>
      <button class="modal-close" onclick="closeModal('qt-view-modal')">×</button>
    </div>
    <div class="modal-body" id="qt-view-body" style="max-height:70vh;overflow-y:auto;"></div>
    <div class="modal-footer" style="gap:8px;flex-wrap:wrap;">
      <button class="btn btn-ghost" onclick="closeModal('qt-view-modal')">إغلاق</button>
      <button class="btn btn-secondary" onclick="printQuoteFromView()">🖨️ طباعة</button>
      <button class="btn" style="background:var(--good);color:#fff;" onclick="shareQuoteWhatsApp()">📱 واتساب</button>
      <button class="btn btn-primary" id="qt-view-convert-btn" onclick="convertQuoteToInvoiceFromView()">🔄 تحويل لفاتورة</button>
    </div>
  </div>
</div>`;
}

// ============================================================
// LOAD DATA
// ============================================================
async function loadDependencies() {
  try {
    [customers, products, salesReps, categories] = await Promise.all([
      getAll(COLS.customers(),  [orderBy("name")]),
      getAll(COLS.products(),   [orderBy("name")]),
      getAll(COLS.salesReps(),  [orderBy("name")]),
      getAll(COLS.categories(), [orderBy("name")]),
    ]);
    try { priceLists = await getAll(COLS.priceLists()); } catch { priceLists = []; }

    const repOpts = salesReps.map(r =>
      `<option value="${r.id}" data-name="${r.name}">${r.name}</option>`).join("");
    const repSel = document.getElementById("qt-rep");
    if (repSel) repSel.innerHTML = '<option value="">بدون مندوب</option>' + repOpts;
    const repFilter = document.getElementById("qt-rep-filter");
    if (repFilter) repFilter.innerHTML = '<option value="">الكل</option>' + repOpts;

    // Populate category filter in Quote form
    const catFilter = document.getElementById("qt-product-category-filter");
    if (catFilter) {
      catFilter.innerHTML = '<option value="">كل الفئات</option>' + 
        categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    }
  } catch (err) {
    console.error("loadDependencies:", err);
  }
}

async function loadQuotesList() {
  const tbody = document.getElementById("qt-tbody");
  if (!tbody) return;
  try {
    const q = query(COLS.quotations(), orderBy("createdAt", "desc"), limit(300));
    const snap = await getDocs(q);
    quotations = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderQuotesList(quotations);
  } catch (err) {
    if (tbody) tbody.innerHTML =
      `<tr><td colspan="9" class="text-bad" style="padding:16px;">خطأ: ${err.message}</td></tr>`;
  }
}

function renderQuotesList(list) {
  const tbody = document.getElementById("qt-tbody");
  if (!tbody) return;

  const total     = list.length;
  const accepted  = list.filter(q => q.status === "accepted").length;
  const pending   = list.filter(q => q.status === "draft" || q.status === "sent").length;
  const converted = list.filter(q => q.status === "converted").length;
  const convPct   = total > 0 ? Math.round(converted / total * 100) : 0;

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl("kpi-qt-total",    total);
  setEl("kpi-qt-accepted", accepted);
  setEl("kpi-qt-pending",  pending);
  setEl("kpi-qt-conv",     convPct + "%");
  setEl("qt-count-label",  total + " عرض");

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد عروض أسعار</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(q => {
    const isExpired = q.status !== 'converted' && q.status !== 'accepted'
      && q.expiryDate && q.expiryDate < todayString();
    const canConvert = q.status !== 'converted';
    return `
      <tr class="qt-row" data-id="${q.id}" style="cursor:pointer;">
        <td class="mono text-indigo font-bold">${q.quoteNumber || '—'}</td>
        <td class="dim">${isoToDisplay(q.date)}</td>
        <td><strong>${q.customerName || '—'}</strong></td>
        <td class="dim">${q.repName || '—'}</td>
        <td style="text-align:center;" class="mono">${(q.items||[]).length}</td>
        <td class="mono font-bold">${formatCurrency(q.grandTotal || 0)}</td>
        <td>${isExpired ? statusBadge('expired') : statusBadge(q.status)}</td>
        <td class="${isExpired ? 'text-bad' : ''}">${isoToDisplay(q.expiryDate)}</td>
        <td class="qt-actions-cell">
          <div class="row-actions" style="display:flex;gap:2px;flex-wrap:nowrap;">
            <button class="btn btn-icon sm btn-ghost qt-act" data-action="print" data-id="${q.id}" title="طباعة">🖨️</button>
            ${canConvert ? '<button class="btn btn-icon sm btn-ghost qt-act" data-action="convert" data-id="' + q.id + '" style="color:var(--brand);" title="تحويل لفاتورة">🔄</button>' : ''}
            <button class="btn btn-icon sm btn-ghost qt-act" data-action="dup"  data-id="${q.id}" title="تكرار">📋</button>
            <button class="btn btn-icon sm btn-ghost qt-act" data-action="edit" data-id="${q.id}" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost qt-act text-bad" data-action="del" data-id="${q.id}" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>`;
  }).join('');

  // Delegated event listener — replaces all inline onclick handlers
  // This avoids ID-escaping bugs and event propagation issues
  if (!tbody._qtListenerAttached) {
    tbody._qtListenerAttached = true;
    tbody.addEventListener('click', function qtHandler(e) {
      const actBtn = e.target.closest('.qt-act');
      if (actBtn) {
        e.stopPropagation();
        const id     = actBtn.dataset.id;
        const action = actBtn.dataset.action;
        if      (action === 'edit')    { const q = quotations.find(x => x.id === id); if (q) openQuoteForm(q); }
        else if (action === 'del')     { const q = quotations.find(x => x.id === id); deleteQuote(id, q ? q.quoteNumber || '' : ''); }
        else if (action === 'dup')     { const q = quotations.find(x => x.id === id); if (q) duplicateQuote(id); }
        else if (action === 'convert') { convertQuoteToInvoice(id); }
        else if (action === 'print')   { printQuote(id); }
        return;
      }
      const row = e.target.closest('.qt-row');
      if (row && !e.target.closest('.qt-actions-cell')) {
        viewQuote(row.dataset.id, e);
      }
    });
  }
}

// ── Client-side filter ───────────────────────────────────────
window.filterQuotes = () => {
  const search = (document.getElementById("qt-search")?.value || "").trim().toLowerCase();
  const status = document.getElementById("qt-status-filter")?.value || "";
  const from   = document.getElementById("qt-from")?.value   || "";
  const to     = document.getElementById("qt-to")?.value     || "";
  const repId  = document.getElementById("qt-rep-filter")?.value || "";

  const filtered = quotations.filter(q => {
    if (search && !(
      (q.quoteNumber||"").toLowerCase().includes(search) ||
      (q.customerName||"").toLowerCase().includes(search)
    )) return false;
    if (status && q.status !== status) return false;
    const d = q.date || "";
    if (from && d < from) return false;
    if (to   && d > to)   return false;
    if (repId && q.repId !== repId) return false;
    return true;
  });
  renderQuotesList(filtered);
};

// ============================================================
// QUOTE FORM
// ============================================================
window.openQuoteForm = async (existingQuote = null) => {
  activeQuoteId = existingQuote?.id || null;
  quoteItems    = existingQuote?.items
    ? JSON.parse(JSON.stringify(existingQuote.items)).map(item => {
        const prod = products.find(p => p.id === item.productId);
        const cost = item.cost || prod?.purchasePrice || prod?.costPrice || prod?.averageCost || prod?.cost || 0;
        let margin = item.margin;
        if (margin === undefined) {
          margin = cost > 0 ? Math.round(((item.unitPrice / cost) - 1) * 100 * 100) / 100 : 0;
        }
        return { ...item, cost, margin };
      })
    : [];

  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
  const today  = todayString();

  const titleEl = document.getElementById("qt-form-title");
  if (titleEl) titleEl.textContent = existingQuote
    ? `تعديل العرض: ${existingQuote.quoteNumber}` : "عرض سعر جديد";

  setVal("qt-number",           existingQuote?.quoteNumber || "جارٍ التوليد…");
  setVal("qt-date",             existingQuote?.date        || today);
  setVal("qt-expiry",           existingQuote?.expiryDate  || addDays(today, 30));
  setVal("qt-customer-search",  existingQuote?.customerName || "");
  setVal("qt-customer-id",      existingQuote?.customerId   || "");
  setVal("qt-customer-name-val",existingQuote?.customerName || "");
  setVal("qt-delivery-address", existingQuote?.deliveryAddress || "");
  setVal("qt-rep",              existingQuote?.repId        || "");
  setVal("qt-pricelist",        existingQuote?.priceList    || "standard");
  setVal("qt-payment-terms",    existingQuote?.paymentTerms || "cash");
  setVal("qt-status",           existingQuote?.status       || "draft");
  setVal("qt-notes",            existingQuote?.notes        || "");
  setVal("qt-terms",            existingQuote?.terms        || "صلاحية العرض: 30 يوماً من تاريخه. الأسعار شاملة ضريبة القيمة المضافة 15%. يُعدّ هذا العرض ملزماً عند قبوله.");
  setVal("qt-extra-disc-type",  existingQuote?.extraDiscountType || "none");
  setVal("qt-extra-disc-val",   existingQuote?.extraDiscountVal  || "0");

  const warnEl = document.getElementById("qt-expiry-warn");
  if (warnEl) warnEl.style.display = "none";
  const errEl = document.getElementById("qt-form-error");
  if (errEl) errEl.classList.add("hidden");

  renderQuoteLines();
  openModal("qt-form-modal");

  if (!existingQuote) {
    generateInvoiceNumber("QT").then(num => {
      const el = document.getElementById("qt-number");
      if (el) el.value = num;
    }).catch(() => {});
  }
};

window.checkExpiryWarn = () => {
  const v    = document.getElementById("qt-expiry")?.value;
  const warn = document.getElementById("qt-expiry-warn");
  if (warn) warn.style.display = (v && v < todayString()) ? "block" : "none";
};

window.editQuote = (id) => {
  const q = quotations.find(x => x.id === id);
  if (q) openQuoteForm(q);
};

window.duplicateQuote = (id) => {
  const q = quotations.find(x => x.id === id);
  if (!q) return;
  const clone = JSON.parse(JSON.stringify(q));
  delete clone.id;
  clone.quoteNumber    = null;
  clone.status         = "draft";
  clone.date           = todayString();
  clone.expiryDate     = addDays(todayString(), 30);
  openQuoteForm(clone);
};

window.onPricelistChange = () => {
  const pl = document.getElementById("qt-pricelist")?.value || "standard";
  quoteItems = quoteItems.map(item => {
    const prod = products.find(p => p.id === item.productId);
    if (!prod) return item;
    
    // Cost price basis
    const cost = prod.purchasePrice || prod.costPrice || prod.averageCost || 0;
    
    let price = 0;
    if (pl === "wholesale") {
      price = cost > 0 ? (cost * (1 + plMargins.wholesaleMargin / 100)) : 0;
    } else if (pl === "distributor") {
      price = cost > 0 ? (cost * (1 + plMargins.distributorMargin / 100)) : 0;
    } else {
      // standard / retail
      price = cost > 0 ? (cost * (1 + plMargins.retailMargin / 100)) : 0;
    }

    // Fallback if price is 0 (or cost is 0), divide selling price by 1.15 to get pre-tax
    if (price <= 0) {
      const saleBase = prod.salePrice || prod.priceRetail || prod.price || 0;
      price = Math.round((saleBase / 1.15) * 100) / 100;
    } else {
      price = Math.round(price * 100) / 100;
    }

    // Update margin percentage locally
    const margin = cost > 0 ? Math.round(((price / cost) - 1) * 100 * 100) / 100 : 0;

    return { ...item, cost, unitPrice: price, margin };
  });
  renderQuoteLines();
};

// ── Lines ────────────────────────────────────────────────────
function renderQuoteLines() {
  const tbody = document.getElementById("qt-lines-tbody");
  if (!tbody) return;

  if (!quoteItems.length) {
    tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;padding:20px;
      color:var(--text-2);font-size:12px;">ابحث عن صنف أعلاه لإضافته</td></tr>`;
    recalcTotals();
    return;
  }

  tbody.innerHTML = quoteItems.map((line, i) => {
    const gross   = (line.qty || 0) * (line.unitPrice || 0);
    const disc    = gross * (line.discount || 0) / 100;
    const net     = gross - disc;
    const vat     = net * 0.15;
    const total   = net + vat;
    return `
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:5px 8px;color:var(--text-2);font-size:11px;">${i+1}</td>
        <td style="padding:5px 8px;">
          <div style="font-size:12.5px;font-weight:600;">${line.productName}</div>
          ${line.sku ? `<div style="font-size:10px;color:var(--text-2);">${line.sku}</div>` : ""}
        </td>
        <td style="padding:5px 8px;font-size:11px;color:var(--text-2);">${line.unit || "PCS"}</td>
        <td style="padding:5px 8px;">
          <input type="number" class="input mono" style="width:70px;height:28px;font-size:12px;"
            value="${line.qty}" min="0.001" step="0.001"
            onchange="updateQtLine(${i},'qty',this.value)" />
        </td>
        <td class="no-print" style="padding:5px 8px;">
          <input type="number" class="input mono" style="width:85px;height:28px;font-size:12px;background:#f9f9ff;border-color:#d0d4f0;"
            value="${line.cost || 0}" min="0" step="0.01"
            onchange="updateQtLineCost(${i},this.value)" />
        </td>
        <td class="no-print" style="padding:5px 8px;">
          <input type="number" class="input mono" style="width:75px;height:28px;font-size:12px;background:#f9f9ff;border-color:#d0d4f0;"
            value="${line.margin || 0}" step="0.1"
            onchange="updateQtLineMargin(${i},this.value)" />
        </td>
        <td style="padding:5px 8px;">
          <input type="number" class="input mono" style="width:100px;height:28px;font-size:12px;"
            value="${line.unitPrice}" min="0" step="0.01"
            onchange="updateQtLine(${i},'unitPrice',this.value)" />
        </td>
        <td style="padding:5px 8px;">
          <input type="number" class="input mono" style="width:64px;height:28px;font-size:12px;"
            value="${line.discount || 0}" min="0" max="100" step="0.1"
            onchange="updateQtLine(${i},'discount',this.value)" />
        </td>
        <td style="padding:5px 8px;" class="mono">${formatCurrency(net)}</td>
        <td style="padding:5px 8px;color:var(--warn);" class="mono">${formatCurrency(vat)}</td>
        <td style="padding:5px 8px;font-weight:700;" class="mono">${formatCurrency(total)}</td>
        <td style="padding:5px 8px;">
          <button class="btn btn-icon sm btn-ghost" style="color:var(--bad);"
            onclick="removeQtLine(${i})">✕</button>
        </td>
      </tr>`;
  }).join("");

  recalcTotals();
}

window.updateQtLine = (idx, field, val) => {
  const numericVal = parseFloat(val) || 0;
  quoteItems[idx][field] = numericVal;
  if (field === 'unitPrice') {
    const cost = quoteItems[idx].cost || 0;
    if (cost > 0) {
      quoteItems[idx].margin = Math.round(((numericVal / cost) - 1) * 100 * 100) / 100;
    }
  }
  renderQuoteLines();
};

window.updateQtLineCost = (idx, val) => {
  const cost = parseFloat(val) || 0;
  quoteItems[idx].cost = cost;
  const margin = quoteItems[idx].margin || 0;
  quoteItems[idx].unitPrice = Math.round(cost * (1 + margin / 100) * 100) / 100;
  renderQuoteLines();
};

window.updateQtLineMargin = (idx, val) => {
  const margin = parseFloat(val) || 0;
  quoteItems[idx].margin = margin;
  const cost = quoteItems[idx].cost || 0;
  quoteItems[idx].unitPrice = Math.round(cost * (1 + margin / 100) * 100) / 100;
  renderQuoteLines();
};

window.removeQtLine = (idx) => {
  quoteItems.splice(idx, 1);
  renderQuoteLines();
};

window.recalcTotals = () => {
  const edType = document.getElementById("qt-extra-disc-type")?.value || "none";
  const edVal  = document.getElementById("qt-extra-disc-val")?.value  || "0";
  const t = calcQuoteTotals(quoteItems, edType, edVal);
  const s = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  s("qt-t-gross",    formatCurrency(t.grossTotal));
  s("qt-t-disc",     "- " + formatCurrency(t.totalDiscount));
  s("qt-t-subtotal", formatCurrency(t.subtotal));
  s("qt-t-vat",      formatCurrency(t.vat));
  s("qt-t-grand",    formatCurrency(t.grandTotal));
};

// ── Autocompletes ─────────────────────────────────────────────
function setupCustomerAutocomplete() {
  const input   = document.getElementById("qt-customer-search");
  const results = document.getElementById("qt-customer-results");
  if (!input) return;

  input.addEventListener("input", debounce(() => {
    const term = input.value.trim().toLowerCase();
    if (!term) { results.classList.add("hidden"); return; }
    const matched = customers.filter(c =>
      (c.name||"").toLowerCase().includes(term) || (c.phone||"").includes(term)
    ).slice(0, 10);
    if (!matched.length) { results.classList.add("hidden"); return; }
    results.innerHTML = matched.map(c => `
      <div class="autocomplete-item"
        onclick="selectQtCustomer('${c.id}','${(c.name||"").replace(/'/g,"\\'")}')">
        <div>${c.name}</div>
        <div class="item-code">${c.phone || ""} ${c.vatNumber ? "| ض: " + c.vatNumber : ""}</div>
      </div>`).join("");
    results.classList.remove("hidden");
  }, 250));

  document.addEventListener("click", e => {
    if (!input.contains(e.target) && !results.contains(e.target))
      results.classList.add("hidden");
  });
}

window.selectQtCustomer = (id, name) => {
  const s = (elId, v) => { const el = document.getElementById(elId); if (el) el.value = v; };
  s("qt-customer-id",       id);
  s("qt-customer-name-val", name);
  s("qt-customer-search",   name);
  document.getElementById("qt-customer-results")?.classList.add("hidden");
};

function setupProductAutocomplete() {
  const input   = document.getElementById("qt-product-search");
  const results = document.getElementById("qt-product-results");
  const catFilter = document.getElementById("qt-product-category-filter");
  if (!input) return;

  const performSearch = () => {
    const term = input.value.trim().toLowerCase();
    const catId = catFilter ? catFilter.value : "";
    const pl = document.getElementById("qt-pricelist")?.value || "standard";

    // If no term and no category, hide and return
    if (!term && !catId) {
      results.classList.add("hidden");
      return;
    }

    let matched = products;
    if (catId) {
      matched = matched.filter(p => p.category === catId);
    }
    if (term) {
      matched = matched.filter(p =>
        (p.name||"").toLowerCase().includes(term) ||
        (p.sku||"").toLowerCase().includes(term)  ||
        (p.barcode||"").includes(term)
      );
    }

    matched = matched.slice(0, 15);

    if (!matched.length) {
      results.innerHTML = `<div style="padding:10px;text-align:center;color:var(--text-2);font-size:12px;">لا توجد نتائج</div>`;
      results.classList.remove("hidden");
      return;
    }

    results.innerHTML = matched.map(p => {
      const cost = p.purchasePrice || p.costPrice || p.averageCost || 0;
      let price = 0;
      if (pl === "wholesale") {
        price = cost > 0 ? (cost * (1 + plMargins.wholesaleMargin / 100)) : 0;
      } else if (pl === "distributor") {
        price = cost > 0 ? (cost * (1 + plMargins.distributorMargin / 100)) : 0;
      } else {
        price = cost > 0 ? (cost * (1 + plMargins.retailMargin / 100)) : 0;
      }

      // Fallback to salePrice / 1.15 if cost is 0
      if (price <= 0) {
        const saleBase = p.salePrice || p.priceRetail || p.price || 0;
        price = Math.round((saleBase / 1.15) * 100) / 100;
      } else {
        price = Math.round(price * 100) / 100;
      }

      // Display the final customer price (inclusive of 15% VAT) on the autocomplete item search results
      const displayPrice = price * 1.15;

      const safeName = (p.name||"").replace(/'/g, "\\'");
      const safeSku  = (p.sku||"").replace(/'/g, "\\'");
      return `
        <div class="autocomplete-item"
          onclick="addQtProduct('${p.id}','${safeName}',${price},'${p.unit||"PCS"}','${safeSku}', ${cost})">
          <div style="display:flex;justify-content:space-between;">
            <span style="font-weight:600;">${p.name}</span>
            <span class="mono text-indigo">${formatCurrency(displayPrice)}</span>
          </div>
          <div class="item-code">${p.sku||""} | ${p.unit||""} (تكلفة: ${formatCurrency(cost)})</div>
        </div>`;
    }).join("");
    results.classList.remove("hidden");
  };

  input.addEventListener("input", debounce(performSearch, 200));
  input.addEventListener("focus", performSearch);
  if (catFilter) {
    catFilter.addEventListener("change", performSearch);
  }

  document.addEventListener("click", e => {
    if (!input.contains(e.target) && !results.contains(e.target) && (!catFilter || !catFilter.contains(e.target)))
      results.classList.add("hidden");
  });
}

window.addQtProduct = (productId, productName, unitPrice, unit, sku, cost = 0) => {
  const input   = document.getElementById("qt-product-search");
  const results = document.getElementById("qt-product-results");
  if (input)   input.value = "";
  if (results) results.classList.add("hidden");

  const existing = quoteItems.find(l => l.productId === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    const baseCost = parseFloat(cost) || 0;
    const margin = baseCost > 0 ? Math.round(((unitPrice / baseCost) - 1) * 100 * 100) / 100 : 0;
    quoteItems.push({
      productId,
      productName,
      unitPrice,
      unit,
      sku,
      qty: 1,
      discount: 0,
      cost: baseCost,
      margin: margin
    });
  }
  renderQuoteLines();
};

// ============================================================
// SAVE QUOTE
// ============================================================
window.saveQuote = async (statusOverride) => {
  const errEl = document.getElementById("qt-form-error");
  if (errEl) errEl.classList.add("hidden");

  const customerId   = document.getElementById("qt-customer-id")?.value.trim()       || "";
  const customerName = document.getElementById("qt-customer-name-val")?.value.trim() ||
                       document.getElementById("qt-customer-search")?.value.trim()   || "";
  const date         = document.getElementById("qt-date")?.value       || "";
  const expiryDate   = document.getElementById("qt-expiry")?.value     || "";

  if (!customerId || !customerName) {
    if (errEl) { errEl.textContent = "يرجى اختيار العميل أولاً."; errEl.classList.remove("hidden"); }
    return;
  }
  if (!quoteItems.length) {
    if (errEl) { errEl.textContent = "يرجى إضافة صنف واحد على الأقل."; errEl.classList.remove("hidden"); }
    return;
  }
  if (!date) {
    if (errEl) { errEl.textContent = "يرجى تحديد تاريخ العرض."; errEl.classList.remove("hidden"); }
    return;
  }

  const edType  = document.getElementById("qt-extra-disc-type")?.value || "none";
  const edVal   = parseFloat(document.getElementById("qt-extra-disc-val")?.value) || 0;
  const totals  = calcQuoteTotals(quoteItems, edType, edVal);
  const repEl   = document.getElementById("qt-rep");
  const repId   = repEl?.value   || "";
  const repName = repEl?.options[repEl?.selectedIndex]?.dataset.name || "";
  const status  = statusOverride || document.getElementById("qt-status")?.value || "draft";

  const draftBtn = document.getElementById("qt-save-draft-btn");
  const sendBtn  = document.getElementById("qt-save-btn");
  if (draftBtn) draftBtn.disabled = true;
  if (sendBtn)  sendBtn.disabled  = true;

  try {
    let quoteNumber = document.getElementById("qt-number")?.value || "";
    if (!quoteNumber || quoteNumber === "جارٍ التوليد…") {
      quoteNumber = await generateInvoiceNumber("QT");
    }

    const data = {
      quoteNumber,
      date,
      expiryDate,
      customerId,
      customerName,
      deliveryAddress:   document.getElementById("qt-delivery-address")?.value  || "",
      repId,
      repName,
      priceList:         document.getElementById("qt-pricelist")?.value          || "standard",
      paymentTerms:      document.getElementById("qt-payment-terms")?.value      || "cash",
      status,
      items:             quoteItems,
      grossTotal:        totals.grossTotal,
      discountTotal:     totals.totalDiscount,
      subtotal:          totals.subtotal,
      totalVat:          totals.vat,
      grandTotal:        totals.grandTotal,
      extraDiscountType: edType,
      extraDiscountVal:  edVal,
      notes:             document.getElementById("qt-notes")?.value  || "",
      terms:             document.getElementById("qt-terms")?.value  || "",
      createdBy:         _quotesUser?.uid || "system",
    };

    let quoteId = activeQuoteId;
    if (activeQuoteId) {
      await update("quotations", activeQuoteId, data);
      showToast("تم تحديث عرض السعر بنجاح", "success");
    } else {
      const res = await create(COLS.quotations(), data);
      quoteId = typeof res === "string" ? res : res.id;
      showToast(`تم حفظ العرض ${quoteNumber}`, "success");
    }

    const fileInput = document.getElementById("qt-file-upload");
    if (fileInput && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      window.uploadFileToArchive(file, "quotations", quoteId, `مرفق عرض سعر رقم ${quoteNumber}`).catch(e => console.warn(e));
    }

    closeModal("qt-form-modal");
    await loadQuotesList();
  } catch (err) {
    if (errEl) { errEl.textContent = err.message; errEl.classList.remove("hidden"); }
    console.error(err);
  } finally {
    if (draftBtn) draftBtn.disabled = false;
    if (sendBtn)  sendBtn.disabled  = false;
  }
};

// ============================================================
// VIEW MODAL
// ============================================================
window.viewQuote = (id, event) => {
  if (event && (event.target.closest("button") || event.target.closest(".row-actions"))) {
    return;
  }
  const q = quotations.find(x => x.id === id);
  if (!q) return;

  const titleEl = document.getElementById("qt-view-title");
  if (titleEl) titleEl.textContent = `عرض السعر: ${q.quoteNumber || id}`;

  const convBtn = document.getElementById("qt-view-convert-btn");
  if (convBtn) convBtn.style.display = q.status === "converted" ? "none" : "";

  const pTerms = { cash:"نقداً", net30:"30 يوم", net60:"60 يوم", custom:"حسب الاتفاق" };
  const pList  = { standard:"عادي", wholesale:"جملة", distributor:"موزع", special:"خاص" };

  const linesHtml = (q.items||[]).map((l, i) => {
    const gross = (l.qty||0) * (l.unitPrice||0);
    const disc  = gross * (l.discount||0) / 100;
    const net   = gross - disc;
    const vat   = net * 0.15;
    const tot   = net + vat;
    return `
      <tr>
        <td style="padding:7px 10px;">${i+1}</td>
        <td style="padding:7px 10px;">${l.productName}</td>
        <td style="padding:7px 10px;" class="mono">${formatQuantity(l.qty)} ${l.unit||""}</td>
        <td style="padding:7px 10px;" class="mono">${formatCurrency(l.unitPrice)}</td>
        <td style="padding:7px 10px;" class="mono">${l.discount||0}%</td>
        <td style="padding:7px 10px;" class="mono">${formatCurrency(net)}</td>
        <td style="padding:7px 10px;" class="mono text-warn">${formatCurrency(vat)}</td>
        <td style="padding:7px 10px;" class="mono font-bold">${formatCurrency(tot)}</td>
      </tr>`;
  }).join("");

  const isExpiry = q.expiryDate && q.expiryDate < todayString()
    && q.status !== "accepted" && q.status !== "converted";

  const statusButtons = Object.entries(STATUS_MAP)
    .filter(([k]) => k !== "converted")
    .map(([k, v]) => `<button class="btn btn-sm ${q.status === k ? "btn-primary" : "btn-secondary"}"
      onclick="updateQuoteStatus('${q.id}','${k}')">${v.label}</button>`).join("");

  const bodyEl = document.getElementById("qt-view-body");
  if (!bodyEl) return;

  bodyEl.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px;">
      <div><div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">رقم العرض</div>
        <div class="mono text-indigo font-bold">${q.quoteNumber}</div></div>
      <div><div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">الحالة</div>
        ${statusBadge(q.status)}</div>
      <div><div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">التاريخ</div>
        <div>${isoToDisplay(q.date)}</div></div>
      <div><div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">تاريخ الصلاحية</div>
        <div class="${isExpiry ? "text-bad" : ""}">${isoToDisplay(q.expiryDate)}</div></div>
      <div><div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">العميل</div>
        <div class="font-semibold">${q.customerName}</div>
        ${q.deliveryAddress ? `<div style="font-size:11px;color:var(--text-2);">${q.deliveryAddress}</div>` : ""}</div>
      <div><div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">المندوب</div>
        <div>${q.repName || "—"}</div></div>
      <div><div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">قائمة الأسعار</div>
        <div>${pList[q.priceList] || q.priceList || "—"}</div></div>
      <div><div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">شروط الدفع</div>
        <div>${pTerms[q.paymentTerms] || q.paymentTerms || "—"}</div></div>
    </div>

    <div class="table-container mb-16">
      <table class="data-dense">
        <thead><tr>
          <th>#</th><th>الصنف</th><th>الكمية</th><th>سعر الوحدة</th>
          <th>خصم</th><th>صافي</th><th>ضريبة</th><th>الإجمالي</th>
        </tr></thead>
        <tbody>${linesHtml}</tbody>
      </table>
    </div>

    <div style="display:flex;justify-content:flex-end;margin-bottom:14px;">
      <div style="width:268px;border:1px solid var(--border-soft);border-radius:8px;overflow:hidden;">
        <div style="display:flex;justify-content:space-between;padding:7px 12px;border-bottom:1px solid var(--border-soft);">
          <span style="font-size:12px;color:var(--text-2);">المجموع قبل الخصم</span>
          <span class="mono">${formatCurrency(q.grossTotal||0)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:7px 12px;border-bottom:1px solid var(--border-soft);">
          <span style="font-size:12px;color:var(--text-2);">إجمالي الخصم</span>
          <span class="mono text-bad">- ${formatCurrency(q.discountTotal||0)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:7px 12px;border-bottom:1px solid var(--border-soft);">
          <span style="font-size:12px;color:var(--text-2);">ضريبة 15%</span>
          <span class="mono text-warn">${formatCurrency(q.totalVat||0)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 12px;background:var(--bg-2);">
          <span style="font-size:14px;font-weight:700;">الإجمالي النهائي</span>
          <span class="mono" style="font-size:15px;font-weight:800;">${formatCurrency(q.grandTotal||0)}</span></div>
      </div>
    </div>

    ${q.notes ? `<div style="padding:10px 14px;background:var(--bg-2);border-radius:8px;font-size:12px;color:var(--text-2);margin-bottom:10px;">
      <strong>ملاحظات:</strong> ${q.notes}</div>` : ""}

    <div style="padding:10px 14px;background:var(--bg-2);border-radius:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
      <span style="font-size:12px;color:var(--text-2);font-weight:600;">تحديث الحالة:</span>
      ${statusButtons}
    </div>`;

  window._currentViewQuote = q;
  openModal("qt-view-modal");
};

window.printQuoteFromView      = () => { if (window._currentViewQuote) printQuote(window._currentViewQuote.id); };
window.convertQuoteToInvoiceFromView = () => { if (window._currentViewQuote) convertQuoteToInvoice(window._currentViewQuote.id); };

// ── WhatsApp Share ────────────────────────────────────────────
window.shareQuoteWhatsApp = () => {
  const q = window._currentViewQuote;
  if (!q) return;
  const pTerms = { cash:"نقداً", net30:"30 يوم", net60:"60 يوم", custom:"حسب الاتفاق" };
  const itemsText = (q.items||[]).map((l, i) =>
    `${i+1}. ${l.productName} — الكمية: ${l.qty} × ${formatCurrency(l.unitPrice)}`
  ).join("\n");
  const msg = [
    "*عرض سعر من إدهام للمواد الغذائية*",
    `رقم العرض: ${q.quoteNumber}`,
    `التاريخ: ${isoToDisplay(q.date)}`,
    `الصلاحية: ${isoToDisplay(q.expiryDate)}`,
    `العميل: ${q.customerName}`,
    `شروط الدفع: ${pTerms[q.paymentTerms] || "—"}`,
    "",
    "*الأصناف:*",
    itemsText,
    "",
    `المجموع قبل الخصم: ${formatCurrency(q.grossTotal||0)}`,
    `إجمالي الخصم: ${formatCurrency(q.discountTotal||0)}`,
    `ضريبة القيمة المضافة (15%): ${formatCurrency(q.totalVat||0)}`,
    `*الإجمالي النهائي: ${formatCurrency(q.grandTotal||0)}*`,
    "",
    q.notes ? `ملاحظات: ${q.notes}` : "",
    "نشكركم لتعاملكم معنا 🙏",
  ].filter(Boolean).join("\n");
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
};

// ============================================================
// STATUS UPDATE
// ============================================================
window.updateQuoteStatus = async (id, status) => {
  const label = STATUS_MAP[status]?.label || status;
  if (!await showConfirm(`تغيير حالة العرض إلى "${label}"؟`, "تحديث الحالة")) return;
  try {
    await update("quotations", id, { status });
    showToast(`تم تحديث الحالة إلى: ${label}`, "success");
    // Update in-memory list
    const idx = quotations.findIndex(q => q.id === id);
    if (idx !== -1) quotations[idx].status = status;
    filterQuotes();
    // Refresh view modal if same quote is open
    if (window._currentViewQuote?.id === id) {
      window._currentViewQuote.status = status;
      viewQuote(id);
    }
  } catch (err) { showToast(err.message, "error"); }
};

// ============================================================
// DELETE QUOTE
// ============================================================
window.deleteQuote = async (id, num) => {
  if (!await showConfirm(
    `حذف عرض السعر رقم "${num || id}"؟ لا يمكن التراجع عن هذا الإجراء.`,
    "تأكيد الحذف"
  )) return;
  try {
    await remove("quotations", id);
    showToast("تم حذف عرض السعر", "success");
    quotations = quotations.filter(q => q.id !== id);
    filterQuotes();
  } catch (err) { showToast(err.message, "error"); }
};

// ============================================================
// CONVERT TO INVOICE
// ============================================================
window.convertQuoteToInvoice = async (id) => {
  const q = quotations.find(x => x.id === id);
  if (!q) return;
  if (q.status === "converted") {
    showToast("تم تحويل هذا العرض مسبقاً", "warn");
    return;
  }
  if (!await showConfirm(
    `تحويل العرض "${q.quoteNumber}" إلى فاتورة مبيعات جديدة?\nسيُغَيَّر وضع العرض إلى "مُفوتَر".`,
    "تحويل لفاتورة"
  )) return;

  try {
    sessionStorage.setItem("convert_quote", JSON.stringify({
      quoteId:      q.id,
      quoteNumber:  q.quoteNumber,
      customerId:   q.customerId,
      customerName: q.customerName,
      repId:        q.repId,
      repName:      q.repName,
      items: (q.items||[]).map(l => ({
        productId:   l.productId,
        productName: l.productName,
        unit:        l.unit || "PCS",
        unitCode:    "PCE",
        taxCategory: "S",
        qty:         l.qty,
        unitPrice:   l.unitPrice,
        discount:    l.discount || 0,
      })),
      notes: q.notes || "",
    }));

    await update("quotations", id, {
      status:      "converted",
      convertedAt: new Date().toISOString(),
    });

    const idx = quotations.findIndex(x => x.id === id);
    if (idx !== -1) quotations[idx].status = "converted";
    filterQuotes();
    closeModal("qt-view-modal");
    showToast("تم التحويل. افتح وحدة فواتير المبيعات لاستكمال الإنشاء.", "success");

    if (typeof navigate === "function") navigate("sales-invoices");
  } catch (err) { showToast(err.message, "error"); }
};

// ============================================================
// PRINT QUOTE (A4)
// ============================================================
window.printQuote = async (id) => {
  const q = quotations.find(x => x.id === id);
  if (!q) { showToast("العرض غير موجود", "error"); return; }

  let companyLogo = "";
  try {
    const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const settingsRef = doc(db, `companies/${COMPANY_ID}/settings`, "company");
    const logoRef = doc(db, `companies/${COMPANY_ID}/settings`, "logo");
    const [settingsSnap, logoSnap] = await Promise.all([
      getDoc(settingsRef),
      getDoc(logoRef)
    ]);
    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      if (data.name) co.name = data.name;
      if (data.vatNumber) co.vatNumber = data.vatNumber;
      if (data.address) co.address = data.address;
      if (data.phone) co.phone = data.phone;
      if (data.email) co.email = data.email;
    }
    if (logoSnap.exists()) {
      companyLogo = logoSnap.data().dataUrl || "";
    }
  } catch (e) {
    console.warn("Failed to load company settings for print:", e);
  }

  const pTerms = { cash:"نقداً", net30:"30 يوم", net60:"60 يوم", custom:"حسب الاتفاق" };
  const pList  = { standard:"عادي", wholesale:"جملة", distributor:"موزع", special:"خاص" };

  const linesHtml = (q.items||[]).map((l, i) => {
    const gross = (l.qty||0)*(l.unitPrice||0);
    const disc  = gross*(l.discount||0)/100;
    const net   = gross - disc;
    const vat   = net*0.15;
    const tot   = net + vat;
    return `
      <tr>
        <td style="text-align:center;">${i+1}</td>
        <td>${l.productName}${l.sku?`<br><small style="color:#888;">${l.sku}</small>`:""}</td>
        <td style="text-align:center;">${l.unit||"PCS"}</td>
        <td style="text-align:center;" class="mono">${formatQuantity(l.qty)}</td>
        <td style="text-align:left;" class="mono">${formatCurrency(l.unitPrice)}</td>
        <td style="text-align:center;" class="mono">${l.discount||0}%</td>
        <td style="text-align:left;" class="mono">${formatCurrency(net)}</td>
        <td style="text-align:left;" class="mono">${formatCurrency(vat)}</td>
        <td style="text-align:left;" class="mono font-bold">${formatCurrency(tot)}</td>
      </tr>`;
  }).join("");

  const pw = window.open("", "_blank");
  if (!pw) { showToast("يرجى السماح بالنوافذ المنبثقة للطباعة", "warn"); return; }
  pw.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>عرض سعر ${q.quoteNumber||""}</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'IBM Plex Sans Arabic',sans-serif;direction:rtl;color:#334155;background:#fff;font-size:13px;line-height:1.5;}
    .no-print{display:flex;gap:10px;justify-content:center;padding:12px;border-bottom:1px solid #e2e8f0;background:#f8fafc;}
    .btn{padding:8px 18px;border-radius:6px;cursor:pointer;border:none;font-family:inherit;font-size:13px;font-weight:600;transition:all 0.15s;}
    .btn-blue{background:#2563eb;color:#fff;box-shadow:0 2px 4px rgba(37,99,235,0.2);}
    .btn-blue:hover{background:#1d4ed8;}
    .btn-gray{background:#64748b;color:#fff;}
    .btn-gray:hover{background:#475569;}
    .page{width:210mm;margin:0 auto;padding:20mm 15mm;position:relative;background:#fff;}
    
    /* Elegant Accent frame */
    .page::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 6px;
      background: linear-gradient(90deg, #1e3a8a, #3b82f6, #60a5fa);
    }
    
    .header{display:grid;grid-template-columns:1fr auto;gap:20px;margin-bottom:28px;padding-bottom:16px;border-bottom:1px solid #e2e8f0;}
    .co-name{font-size:22px;font-weight:800;color:#1e3a8a;margin-bottom:6px;letter-spacing:-0.5px;}
    .co-sub{font-size:12px;color:#64748b;margin-bottom:3px;}
    .doc-badge{background:#1e3a8a;color:#fff;padding:6px 18px;border-radius:6px;font-size:16px;font-weight:700;text-align:center;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;}
    .doc-num{font-size:12px;color:#475569;text-align:center;margin-bottom:2px;}
    
    .meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;}
    .meta-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.02);}
    .meta-label{font-size:11px;color:#94a3b8;margin-bottom:4px;font-weight:600;}
    .meta-val{font-size:14px;font-weight:700;color:#1e293b;}
    .co-logo { max-height: 60px; max-width: 135px; object-fit: contain; margin-bottom: 8px; }
    .header{display:grid;grid-template-columns:1fr auto;gap:20px;margin-bottom:28px;padding-bottom:16px;border-bottom:1px solid #e2e8f0;margin-top:10px;}
    .co-name{font-size:22px;font-weight:800;color:#1e3a8a;margin-bottom:6px;letter-spacing:-0.5px;}
    .co-sub{font-size:12px;color:#64748b;margin-bottom:3px;}
    .doc-badge{background:#1e3a8a;color:#fff;padding:6px 18px;border-radius:6px;font-size:16px;font-weight:700;text-align:center;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;}
    .doc-num{font-size:12px;color:#475569;text-align:center;margin-bottom:2px;}
    
    .meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;}
    .meta-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.02);}
    .meta-label{font-size:11px;color:#94a3b8;margin-bottom:4px;font-weight:600;}
    .meta-val{font-size:14px;font-weight:700;color:#1e293b;}
    
    table{width:100%;border-collapse:collapse;margin:20px 0;font-size:12px;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;}
    th,td{padding:10px 12px;border:1px solid #e2e8f0;}
    th{background:#1e293b;color:#ffffff;font-weight:700;font-size:11.5px;text-transform:uppercase;border:none;}
    td{color:#334155;}
    tr:nth-child(even) td{background:#f8fafc;}
    
    .mono{font-family:monospace;font-size:12px;}
    .font-bold{font-weight:700;}
    .totals{display:flex;justify-content:flex-end;margin-top:16px;}
    .totals-inner{width:300px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 16px;}
    .tot-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#475569;border-bottom:1px dashed #e2e8f0;}
    .tot-row:last-child{border-bottom:none;}
    .tot-row.grand{font-size:16px;font-weight:800;color:#1e3a8a;border-bottom:none;border-top:2px solid #1e3a8a;padding-top:10px;margin-top:6px;}
    
    .notes-box{background:#fffbeb;border:1px solid #fef3c7;border-radius:10px;padding:12px 16px;margin-top:16px;font-size:12.5px;color:#78350f;line-height:1.6;}
    .terms-box{background:#f0fdf4;border:1px solid #dcfce7;border-radius:10px;padding:12px 16px;margin-top:12px;font-size:11.5px;color:#166534;line-height:1.6;}
    .sig-row{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:48px;}
    .sig-box{border-top:1px dashed #cbd5e1;padding-top:10px;text-align:center;font-size:12px;color:#64748b;font-weight:500;}
    .qr-ph{width:86px;height:86px;border:1px dashed #cbd5e1;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:9px;text-align:center;background:#f8fafc;}
    .footer{text-align:center;font-size:11px;color:#94a3b8;margin-top:28px;border-top:1px solid #e2e8f0;padding-top:12px;}
    @media print{
      .no-print{display:none!important;}
      .page{width:100%;padding:0;margin:0;border:none;}
      .page::before{display:none;}
      *{ -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn btn-blue" onclick="window.print()">🖨️ طباعة الآن</button>
    <button class="btn btn-gray" onclick="window.close()">✕ إغلاق</button>
  </div>
  <div class="page">
    <div class="header">
      <div>
        ${companyLogo ? `<img class="co-logo" src="${companyLogo}" alt="الشعار">` : ""}
        <div class="co-name">${co.name}</div>
        <div class="co-sub">الرقم الضريبي: ${co.vatNumber}</div>
        <div class="co-sub">${co.address}</div>
        <div class="co-sub">هاتف: ${co.phone} | ${co.email}</div>
      </div>
      <div style="text-align:center;">
        <div class="doc-badge">عرض سعر</div>
        <div class="doc-num">رقم: <strong>${q.quoteNumber||""}</strong></div>
        <div class="doc-num">التاريخ: ${isoToDisplay(q.date)}</div>
        <div class="doc-num">صالح حتى: <strong>${isoToDisplay(q.expiryDate)}</strong></div>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <div class="meta-label">تفاصيل العميل</div>
        <div class="meta-val">${q.customerName}</div>
        ${q.deliveryAddress ? `<div style="font-size:11px;color:#555;margin-top:3px;">${q.deliveryAddress}</div>` : ""}
      </div>
      <div class="meta-box">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div><div class="meta-label">المندوب</div><div class="meta-val">${q.repName||"—"}</div></div>
          <div><div class="meta-label">شروط الدفع</div><div class="meta-val">${pTerms[q.paymentTerms]||"—"}</div></div>
          <div><div class="meta-label">قائمة الأسعار</div><div class="meta-val">${pList[q.priceList]||"—"}</div></div>
          <div><div class="meta-label">الحالة</div><div class="meta-val">${STATUS_MAP[q.status]?.label||q.status}</div></div>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:28px;">#</th>
          <th>الصنف</th>
          <th style="width:50px;text-align:center;">الوحدة</th>
          <th style="width:56px;text-align:center;">الكمية</th>
          <th style="width:90px;text-align:left;">سعر الوحدة</th>
          <th style="width:52px;text-align:center;">خصم%</th>
          <th style="width:90px;text-align:left;">صافي</th>
          <th style="width:76px;text-align:left;">ضريبة</th>
          <th style="width:95px;text-align:left;">الإجمالي</th>
        </tr>
      </thead>
      <tbody>${linesHtml}</tbody>
    </table>

    <div class="totals">
      <div class="totals-inner">
        <div class="tot-row"><span>المجموع قبل الخصم</span><span>${formatCurrency(q.grossTotal||0)}</span></div>
        <div class="tot-row"><span>إجمالي الخصم</span><span style="color:#e53e3e;">- ${formatCurrency(q.discountTotal||0)}</span></div>
        <div class="tot-row"><span>المجموع بعد الخصم</span><span>${formatCurrency(q.subtotal||0)}</span></div>
        <div class="tot-row"><span>ضريبة القيمة المضافة (15%)</span><span style="color:#d97706;">${formatCurrency(q.totalVat||0)}</span></div>
        <div class="tot-row grand"><span>الإجمالي النهائي</span><span>${formatCurrency(q.grandTotal||0)}</span></div>
      </div>
    </div>

    ${q.notes ? `<div class="notes-box"><strong>ملاحظات:</strong> ${q.notes}</div>` : ""}
    ${q.terms ? `<div class="terms-box"><strong>الشروط والأحكام:</strong><br>${q.terms}</div>` : ""}

    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:28px;">
      <div class="sig-row" style="flex:1;">
        <div class="sig-box">توقيع مُعِدّ العرض</div>
        <div class="sig-box">توقيع واعتماد العميل</div>
      </div>
      <div style="margin-right:20px;text-align:center;">
        <div class="qr-ph">QR<br>Code</div>
        <div style="font-size:9px;color:#bbb;margin-top:3px;">رمز التحقق</div>
      </div>
    </div>

    <div class="footer">نشكركم لتعاملكم معنا — هذا العرض ملزم عند قبوله خطياً أو إلكترونياً.</div>
  </div>
</body>
</html>`);
  pw.document.close();
};

// ============================================================
// CSV EXPORT
// ============================================================
window.exportQuotesCSV = () => {
  try {
    const rows = [
      ["رقم العرض","التاريخ","الصلاحية","العميل","المندوب",
       "الأصناف","إجمالي قبل خصم","الخصم","ما بعد الخصم",
       "الضريبة","الإجمالي","الحالة"]
    ];
    for (const q of quotations) {
      rows.push([
        q.quoteNumber||"", q.date||"", q.expiryDate||"",
        q.customerName||"", q.repName||"",
        (q.items||[]).length,
        q.grossTotal||0, q.discountTotal||0,
        q.subtotal||0, q.totalVat||0, q.grandTotal||0,
        STATUS_MAP[q.status]?.label || q.status || "",
      ]);
    }
    const csv = rows.map(r =>
      r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    const a   = document.createElement("a");
    a.href    = URL.createObjectURL(new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8;"}));
    a.download = `quotations_${todayString()}.csv`;
    a.click();
    showToast("تم تصدير الملف بنجاح", "success");
  } catch (err) { showToast(err.message, "error"); }
};

// ============================================================
// PDF QUOTATION IMPORT FEATURE (سحب وإفلات وتحليل عرض السعر)
// ============================================================
let importedPdfItems = [];

async function ensurePdfJsLoaded() {
  if (window.pdfjsLib) return;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
      resolve();
    };
    script.onerror = () => reject(new Error("فشل تحميل مكتبة معالجة الـ PDF"));
    document.head.appendChild(script);
  });
}

window.openPdfImportModal = () => {
  importedPdfItems = [];
  document.getElementById("qt-pdf-error").classList.add("hidden");
  document.getElementById("qt-pdf-loading").classList.add("hidden");
  document.getElementById("qt-pdf-preview-area").classList.add("hidden");
  document.getElementById("qt-pdf-dropzone").classList.remove("hidden");
  document.getElementById("qt-pdf-submit-btn").disabled = true;
  document.getElementById("qt-pdf-file-input").value = "";
  openModal("qt-pdf-modal");
};

window.handlePdfDrop = (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  if (files.length > 0 && files[0].type === "application/pdf") {
    processPdfFile(files[0]);
  } else {
    showPdfError("الرجاء سحب ملف PDF فقط");
  }
};

window.handlePdfFile = (e) => {
  const file = e.target.files[0];
  if (file) processPdfFile(file);
};

function showPdfError(msg) {
  const errEl = document.getElementById("qt-pdf-error");
  errEl.textContent = msg;
  errEl.classList.remove("hidden");
  document.getElementById("qt-pdf-loading").classList.add("hidden");
}

async function processPdfFile(file) {
  document.getElementById("qt-pdf-error").classList.add("hidden");
  document.getElementById("qt-pdf-dropzone").classList.add("hidden");
  document.getElementById("qt-pdf-loading").classList.remove("hidden");

  try {
    await ensurePdfJsLoaded();
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const lines = await extractLinesFromPdf(arrayBuffer);
        const parsed = parseQuotationLines(lines);
        
        if (parsed.length === 0) {
          throw new Error("لم نتمكن من استخلاص أي أصناف من ملف الـ PDF. تأكد من أن الملف مقروء ويحتوي على أسطر الأصناف والأسعار.");
        }

        importedPdfItems = parsed;
        matchProductsForImportedItems(importedPdfItems);
        renderParsedPdfItems();
        
        document.getElementById("qt-pdf-loading").classList.add("hidden");
        document.getElementById("qt-pdf-preview-area").classList.remove("hidden");
        document.getElementById("qt-pdf-submit-btn").disabled = false;
      } catch (err) {
        showPdfError(err.message);
        document.getElementById("qt-pdf-dropzone").classList.remove("hidden");
      }
    };
    reader.readAsArrayBuffer(file);
  } catch (err) {
    showPdfError(err.message);
    document.getElementById("qt-pdf-dropzone").classList.remove("hidden");
  }
}

async function extractLinesFromPdf(arrayBuffer) {
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const lines = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    
    // Group text items by Y coordinate (rounded)
    const items = content.items;
    const yGroups = {};
    items.forEach(item => {
      if (!item.str.trim()) return;
      const y = Math.round(item.transform[5]);
      if (!yGroups[y]) yGroups[y] = [];
      yGroups[y].push(item);
    });

    // Sort Y coordinates in descending order (top to bottom)
    const sortedYs = Object.keys(yGroups).map(Number).sort((a, b) => b - a);
    
    sortedYs.forEach(y => {
      // Sort items on the same line by X coordinate (left to right)
      const lineItems = yGroups[y].sort((a, b) => a.transform[4] - b.transform[4]);
      const lineText = lineItems.map(item => item.str).join(" ").trim();
      if (lineText) lines.push(lineText);
    });
  }
  return lines;
}

function parseQuotationLines(lines) {
  const parsedItems = [];
  lines.forEach(line => {
    if (line.toLowerCase().includes("page") || line.toLowerCase().includes("invoice") || 
        line.toLowerCase().includes("total") || line.includes("المجموع") || 
        line.includes("ضريبة") || line.includes("صفحة") || line.includes("رقم السجل")) {
      return;
    }

    const tokens = line.split(/\s+/);
    if (tokens.length < 2) return;

    const numbers = [];
    const textParts = [];
    
    tokens.forEach(tok => {
      const clean = tok.replace(/[^\d\.]/g, "");
      const num = parseFloat(clean);
      if (!isNaN(num) && clean.length > 0) {
        if (clean.length < 9) {
          numbers.push({ raw: tok, val: num, isDecimal: clean.includes(".") });
        }
      } else {
        if (tok.trim().length > 1 && !["*","x","-","=","/","+","—"].includes(tok.trim())) {
          textParts.push(tok);
        }
      }
    });

    if (textParts.length === 0 || numbers.length === 0) return;
    const descName = textParts.join(" ");
    
    let qty = 1;
    let cost = 0;
    
    if (numbers.length === 1) {
      cost = numbers[0].val;
    } else if (numbers.length >= 2) {
      const decimalNum = numbers.find(n => n.isDecimal);
      if (decimalNum) {
        cost = decimalNum.val;
        const other = numbers.find(n => n !== decimalNum);
        qty = other ? Math.round(other.val) : 1;
      } else {
        const sorted = [...numbers].sort((a,b) => a.val - b.val);
        qty = Math.round(sorted[0].val);
        cost = sorted[1].val;
      }
    }

    if (qty <= 0) qty = 1;
    if (cost <= 0) return;

    parsedItems.push({
      included: true,
      rawName: descName,
      qty,
      cost,
      matchedProductId: "",
      margin: 10,
      suggestedSalePrice: Math.round(cost * 1.10 * 100) / 100
    });
  });
  return parsedItems;
}

function matchProductsForImportedItems(parsedItems) {
  parsedItems.forEach(item => {
    const cleanRaw = item.rawName.toLowerCase();
    const match = products.find(p => 
      cleanRaw.includes((p.name || "").toLowerCase()) ||
      (p.sku && cleanRaw.includes(p.sku.toLowerCase())) ||
      (p.name && (p.name.toLowerCase().includes(cleanRaw) || cleanRaw.includes(p.name.toLowerCase())))
    );
    if (match) {
      item.matchedProductId = match.id;
      // Fetch pricing margin if possible
      const cat = categories.find(c => c.id === match.category);
      if (cat) {
        // Fallback to loaded ERP_COMPANY pricing policies if available
        const cached = JSON.parse(localStorage.getItem("idham_company") || "{}");
        const pricing = cached.pricing || {};
        if (cat.velocity === "fast") item.margin = pricing.marginFast ?? 5;
        else if (cat.velocity === "medium") item.margin = pricing.marginMedium ?? 10;
        else if (cat.velocity === "slow") item.margin = pricing.marginSlow ?? 15;
      }
      item.suggestedSalePrice = Math.round(item.cost * (1 + item.margin / 100) * 100) / 100;
    }
  });
}

function renderParsedPdfItems() {
  const tbody = document.getElementById("qt-pdf-parsed-tbody");
  if (!tbody) return;

  tbody.innerHTML = importedPdfItems.map((item, idx) => `
    <tr>
      <td><input type="checkbox" ${item.included ? 'checked' : ''} onchange="importedPdfItems[${idx}].included = this.checked" /></td>
      <td><strong>${item.rawName}</strong></td>
      <td><input type="number" class="input sm mono" style="width:60px; height:26px; padding:2px;" value="${item.qty}" min="1" oninput="importedPdfItems[${idx}].qty = parseInt(this.value) || 1" /></td>
      <td class="mono font-bold">${formatCurrency(item.cost)}</td>
      <td>
        <select class="input sm" style="font-size:12px; height:26px; padding:2px;" onchange="onMatchedProductChange(${idx}, this.value)">
          <option value="">-- اختر صنف للربط --</option>
          ${products.map(p => `<option value="${p.id}" ${item.matchedProductId === p.id ? 'selected' : ''}>${p.sku} - ${p.name}</option>`).join("")}
        </select>
      </td>
      <td>
        <input type="number" class="input sm mono" style="width:70px; height:26px; padding:2px;" value="${item.margin}" step="0.5" oninput="onItemMarginChange(${idx}, this.value)" />
      </td>
      <td class="mono font-bold text-indigo" id="suggested-sale-price-${idx}">${formatCurrency(item.suggestedSalePrice)}</td>
    </tr>
  `).join("");
}

window.toggleAllPdfItems = (checked) => {
  importedPdfItems.forEach(item => item.included = checked);
  renderParsedPdfItems();
};

window.onMatchedProductChange = (idx, prodId) => {
  importedPdfItems[idx].matchedProductId = prodId;
  const prod = products.find(p => p.id === prodId);
  if (prod) {
    const cat = categories.find(c => c.id === prod.category);
    if (cat) {
      const cached = JSON.parse(localStorage.getItem("idham_company") || "{}");
      const pricing = cached.pricing || {};
      if (cat.velocity === "fast") importedPdfItems[idx].margin = pricing.marginFast ?? 5;
      else if (cat.velocity === "medium") importedPdfItems[idx].margin = pricing.marginMedium ?? 10;
      else if (cat.velocity === "slow") importedPdfItems[idx].margin = pricing.marginSlow ?? 15;
    }
  }
  updateSuggestedPdfPrice(idx);
  renderParsedPdfItems();
};

window.onItemMarginChange = (idx, marginVal) => {
  importedPdfItems[idx].margin = parseFloat(marginVal) || 0;
  updateSuggestedPdfPrice(idx);
};

function updateSuggestedPdfPrice(idx) {
  const item = importedPdfItems[idx];
  item.suggestedSalePrice = Math.round(item.cost * (1 + item.margin / 100) * 100) / 100;
  const label = document.getElementById(`suggested-sale-price-${idx}`);
  if (label) label.textContent = formatCurrency(item.suggestedSalePrice);
}

window.submitImportedPdfItems = () => {
  const activeItems = importedPdfItems.filter(item => item.included && item.matchedProductId);
  if (activeItems.length === 0) {
    alert("يرجى تحديد عنصر واحد على الأقل وربطه بصنف من النظام للاستيراد");
    return;
  }

  // Pre-fill quotations edit form
  quoteItems = activeItems.map(item => {
    const prod = products.find(p => p.id === item.matchedProductId);
    return {
      productId:   item.matchedProductId,
      sku:         prod?.sku || "SKU",
      name:        prod?.name || "Product Name",
      unit:        prod?.unit || "حبة",
      qty:         item.qty,
      unitPrice:   item.suggestedSalePrice,
      discount:    0,
      taxCategory: prod?.taxCategory || "S"
    };
  });

  closeModal("qt-pdf-modal");
  
  // Open Quote Form and populate
  window.openQuoteForm();
};
