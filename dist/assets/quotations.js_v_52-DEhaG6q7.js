const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/product-cost-sync-B4nC-ymm.js","assets/index-CnctmNGr.js","assets/index-Dq7oGj9k.css"])))=>i.map(i=>d[i]);
import{t as C,_ as X,d as H,C as U,g as N,a as L,q as et,f as b,z as ot,u as G,o as nt,l as _,r as mt}from"./index-CnctmNGr.js";import{orderBy as A,query as ft,limit as gt,getDocs as xt}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let q=[],S=[],E=[],Z=[],W=[],tt=[],x=[],M=null,it=null,I={retailMargin:10,wholesaleMargin:7,distributorMargin:5};async function bt(){try{const{getDoc:e,doc:t}=await X(async()=>{const{getDoc:i,doc:s}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:i,doc:s}},[]),o=t(H,`companies/${U}/settings`,"priceListMargins"),n=await e(o);if(n.exists()){const i=n.data();i.retailMargin!==void 0&&(I.retailMargin=parseFloat(i.retailMargin)),i.wholesaleMargin!==void 0&&(I.wholesaleMargin=parseFloat(i.wholesaleMargin)),i.distributorMargin!==void 0&&(I.distributorMargin=parseFloat(i.distributorMargin))}}catch(e){console.warn("Failed to load priceListMargins settings:",e)}}function st(e,t){const o=new Date(e);return o.setDate(o.getDate()+t),o.toISOString().split("T")[0]}function F(e){if(!e)return"—";const t=new Date(e);return isNaN(t)?e:t.toLocaleDateString("ar-SA",{year:"numeric",month:"2-digit",day:"2-digit"})}const j={draft:{label:"مسودة",cls:"neutral"},sent:{label:"مُرسَل",cls:"indigo"},accepted:{label:"مقبول",cls:"good"},rejected:{label:"مرفوض",cls:"bad"},expired:{label:"منتهي",cls:"warn"},converted:{label:"مُفوتَر",cls:"teal"}};function K(e){const t=j[e]||{label:e,cls:"neutral"};return`<span class="badge ${t.cls}" style="font-size:10px;">${t.label}</span>`}function at(e,t,o){let n=0,i=0;for(const l of e){const m=(l.qty||0)*(l.unitPrice||0),f=m*(l.discount||0)/100;n+=m,i+=f}const s=n-i;let d=0;const c=parseFloat(o)||0;t==="pct"&&(d=s*c/100),t==="fixed"&&(d=c);const r=Math.max(0,s-d),a=Math.round(r*.15*100)/100,u=Math.round((r+a)*100)/100;return{grossTotal:Math.round(n*100)/100,discountLines:Math.round(i*100)/100,extraDiscount:Math.round(d*100)/100,totalDiscount:Math.round((i+d)*100)/100,subtotal:r,vat:a,grandTotal:u}}async function Dt(e,t){it=t,e.innerHTML=vt(),await bt(),await Promise.all([yt(),rt()]),ht(),wt()}function vt(){const e=C();return`
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
    <input type="date" id="qt-from" value="${e.slice(0,8)+"01"}" onchange="filterQuotes()" />
  </div>
  <div class="date-range-group"><label>إلى</label>
    <input type="date" id="qt-to" value="${e}" onchange="filterQuotes()" />
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
    <button class="btn btn-secondary" onclick="openQuotationImportModal()" style="display:flex; align-items:center; gap:6px; font-weight:700;">📥 استيراد ذكي (Excel / PDF / نسخ)</button>
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
          ${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(9).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
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
          <label>رقم العرض ✏️</label>
          <input type="text" id="qt-number" class="input mono"
            style="font-weight:700;letter-spacing:1px;" placeholder="يُولَّد تلقائياً" title="يمكنك تعديل رقم العرض يدوياً" />
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

      <!-- Product Search & Bulk Actions (Sticky Header) -->
      <div style="background:var(--bg-1);border:1.5px solid var(--border-soft);border-radius:10px;padding:12px 16px;margin-bottom:12px;position:sticky;top:0;z-index:100;box-shadow:0 3px 12px rgba(0,0,0,0.06);">
        <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:flex-end; justify-content:space-between;">
          <div style="display:flex; gap:10px; flex:1; min-width:320px; align-items:flex-end;">
            <div class="form-group" style="margin-bottom:0; width:140px; flex-shrink:0;">
              <label style="font-size:11px; margin-bottom:4px; font-weight:600;">تصفية بالفئة</label>
              <select id="qt-product-category-filter" class="input" style="padding:6px; font-size:12px; height:36px;">
                <option value="">كل الفئات</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom:0; flex:1; position:relative;">
              <label style="font-size:11px; margin-bottom:4px; font-weight:600;">ابحث بالاسم أو الكود للإضافة</label>
              <div class="autocomplete-container">
                <input type="text" id="qt-product-search" class="input" style="padding:6px 12px; font-size:12.5px; height:36px; border-color:var(--brand); font-weight:600;"
                  placeholder="🔍 ابحث بالاسم أو رمز الصنف (SKU) أو الباركود..." autocomplete="off" />
                <div class="autocomplete-results hidden" id="qt-product-results" style="min-width:580px; width:max(100%, 580px); max-width:760px; right:0; left:auto; z-index:9999; box-shadow:0 12px 35px rgba(0,0,0,0.18); border-radius:10px; max-height:360px;"></div>
              </div>
            </div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
            <button type="button" class="btn btn-secondary" onclick="openQuotationImportModal()" style="height:34px;font-size:11.5px;white-space:nowrap;background:rgba(37,99,235,0.12);color:#1d4ed8;border-color:rgba(37,99,235,0.35);font-weight:700;" title="استيراد الأصناف من ملف إكسيل أو PDF أو نسخ مباشر">📥 استيراد من Excel / PDF</button>
            <button type="button" class="btn btn-secondary" onclick="openQuickAddProductModal()" style="height:34px;font-size:11.5px;white-space:nowrap;background:rgba(16,185,129,0.1);color:#059669;border-color:rgba(16,185,129,0.3);font-weight:700;" title="إضافة صنف جديد سريع إلى دليل الأصناف والكتالوج فوراً">➕ صنف جديد سريع</button>
            <button type="button" class="btn btn-secondary" onclick="addCustomQuoteLine()" style="height:34px;font-size:11.5px;white-space:nowrap;background:rgba(245,158,11,0.1);color:#d97706;border-color:rgba(245,158,11,0.3);font-weight:700;" title="إضافة بند حر / صنف مخصص أو خدمة مباشرة في العرض">⚡ + بند حر</button>
            <button class="btn btn-secondary" onclick="addAllProductsToQuote()" style="height:34px;font-size:11.5px;white-space:nowrap;" title="تحميل وإدراج كافة أصناف الكتالوج">📦 إدراج كل الأصناف</button>
            <button class="btn btn-secondary" onclick="refreshQuoteItemCostsFromPurchases(this)" style="height:34px;font-size:11.5px;white-space:nowrap;background:rgba(79,70,229,0.1);color:#4F46E5;border-color:rgba(79,70,229,0.3);font-weight:600;" title="تحديث تكاليف وهوامش بنود العرض الحالية من آخر فواتير الشراء">🔄 تحديث التكاليف</button>
            <button class="btn btn-ghost text-bad" onclick="clearAllQuoteLines()" style="height:34px;font-size:11.5px;white-space:nowrap;" title="مسح كافة البنود">🗑️ تفريغ</button>
          </div>
        </div>
      </div>

      <!-- Line Items Table (Scrollable Viewport with Sticky Header) -->
      <div class="invoice-lines table-container" style="max-height:480px; overflow-y:auto; margin-bottom:16px; margin-top:0; border:1px solid var(--border-soft); border-radius:8px; box-shadow:inset 0 0 4px rgba(0,0,0,0.02);">
        <table style="width:100%;font-size:12.5px;border-collapse:collapse;">
          <thead style="position:sticky; top:0; z-index:10; background:var(--bg-2); box-shadow:0 1px 4px rgba(0,0,0,0.05);">
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
      <button class="btn btn-secondary" id="qt-form-print-btn" style="display:none;" onclick="printQuoteFromForm()">🖨️ طباعة / تصدير PDF</button>
      <button class="btn btn-secondary" onclick="saveQuote('draft')" id="qt-save-draft-btn">💾 حفظ مسودة</button>
      <button class="btn btn-primary" onclick="saveQuote('sent')" id="qt-save-btn">📤 حفظ وإرسال</button>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- SMART QUOTATION IMPORT MODAL (Excel / PDF / Paste)      -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="modal-overlay" id="qt-import-modal">
  <div class="modal modal-xl" style="max-height:92vh; display:flex; flex-direction:column; width:95%; max-width:1180px;">
    <div class="modal-header" style="background:linear-gradient(135deg, #040d1f 0%, #0f2d6b 100%); color:#fff; padding:16px 24px; border-radius:12px 12px 0 0;">
      <div>
        <h3 class="modal-title" style="color:#fff; font-size:16px; font-weight:800; display:flex; align-items:center; gap:8px;">
          <span>📥</span> استيراد عرض سعر ذكي (Excel / PDF / نسخ ولصق مباشر)
        </h3>
        <div style="font-size:11.5px; color:rgba(255,255,255,0.75); margin-top:3px;">
          استخراج فوري للأصناف والكميات والأسعار مع مطابقة الكتالوج لغوياً بدقة 100% دون أخطاء
        </div>
      </div>
      <button class="modal-close" style="color:#fff; opacity:0.8;" onclick="closeModal('qt-import-modal')">×</button>
    </div>

    <div class="modal-body" style="overflow-y:auto; flex:1; padding:20px;">
      
      <!-- Top Options Bar: Source Mode & Tax Interpretation -->
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-2); border:1px solid var(--border-soft); border-radius:10px; padding:10px 16px; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
        <!-- Input Method Tabs -->
        <div style="display:flex; gap:6px;">
          <button type="button" id="tab-btn-file" class="btn btn-sm btn-primary" onclick="switchImportTab('file')" style="border-radius:6px; font-size:12px; font-weight:700;">
            📂 رفع ملف (Excel / CSV / PDF)
          </button>
          <button type="button" id="tab-btn-paste" class="btn btn-sm btn-secondary" onclick="switchImportTab('paste')" style="border-radius:6px; font-size:12px; font-weight:700;">
            📋 نسخ ولصق من Excel (Ctrl+V)
          </button>
        </div>

        <!-- Tax Interpretation Selector -->
        <div style="display:flex; align-items:center; gap:8px;">
          <label style="font-size:11.5px; font-weight:700; color:var(--text-1); white-space:nowrap;">طبيعة السعر بالشيت:</label>
          <select id="qt-import-tax-mode" class="input sm" style="height:32px; font-size:11.5px; font-weight:700;" onchange="reapplyTaxModeToImported()">
            <option value="exclusive" selected>السعر بالشيت غير شامل الضريبة (افتراضي)</option>
            <option value="inclusive">السعر بالشيت شامل ضريبة 15% (سيتم استخراج الصافي تلقائياً)</option>
          </select>
        </div>
      </div>

      <!-- TAB 1: FILE DRAG & DROP -->
      <div id="import-pane-file">
        <div id="qt-import-dropzone" style="border:2.5px dashed var(--border); border-radius:14px; padding:36px 20px; text-align:center; cursor:pointer; background:var(--bg-2); transition:all 0.2s;"
          onclick="document.getElementById('qt-import-file-input').click()"
          ondragover="event.preventDefault(); this.style.borderColor='var(--brand)'; this.style.background='rgba(37,99,235,0.05)';"
          ondragleave="this.style.borderColor='var(--border)'; this.style.background='var(--bg-2)';"
          ondrop="handleQuotationFileDrop(event)">
          <div style="font-size:44px; margin-bottom:8px;">📊 📄</div>
          <div style="font-weight:800; color:var(--text-0); font-size:15px; margin-bottom:4px;">
            اسحب وأفلت ملف الإكسيل (.xlsx / .xls / .csv) أو ملف PDF هنا
          </div>
          <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">أو اضغط لاختيار الملف من جهازك</div>
          <button type="button" class="btn btn-secondary btn-sm" style="pointer-events:none; font-weight:700;">
            📁 تصفح الملفات
          </button>
        </div>
        <input type="file" id="qt-import-file-input" accept=".xlsx,.xls,.csv,.pdf" style="display:none;" onchange="handleQuotationFileInput(event)" />
      </div>

      <!-- TAB 2: DIRECT PASTE TEXTAREA -->
      <div id="import-pane-paste" class="hidden">
        <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:16px;">
          <div style="font-size:12.5px; font-weight:700; color:var(--text-1); margin-bottom:6px;">
            📋 الصق خلايا الإكسيل هنا مباشرة (حدد الجدول في Excel واضغط Ctrl+C ثم اضغط Ctrl+V هنا):
          </div>
          <textarea id="qt-import-paste-area" class="input mono" rows="6" style="width:100%; font-size:11.5px; resize:vertical;"
            placeholder="اسم الصنف	الوحدة	الكمية	السعر قبل الضريبة	الخصم
بن هرري باجبير 5 ك	قطعة	1	185.50	0.00
فستق أمريكي (21/26) مالح 10 كيلو	كرتون	1	572.40	0.00
..."></textarea>
          <div style="display:flex; justify-content:flex-end; margin-top:10px;">
            <button type="button" class="btn btn-primary" onclick="handlePastedQuotationText()" style="font-weight:700; display:flex; align-items:center; gap:6px;">
              <span>⚡</span> تحليل وقراءة البيانات المنسوخة
            </button>
          </div>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div id="qt-import-loading" class="hidden" style="text-align:center; padding:36px;">
        <div class="loading-spinner" style="margin:0 auto 12px auto; width:36px; height:36px;"></div>
        <div style="font-size:13.5px; font-weight:700; color:var(--brand);" id="qt-import-loading-text">جارٍ قراءة البيانات ومطابقة الأصناف لغوياً مع الكتالوج...</div>
      </div>

      <!-- Error Alert -->
      <div id="qt-import-error" class="alert bad hidden" style="margin-top:14px; font-size:12.5px;"></div>

      <!-- PREVIEW PARSED ITEMS AREA -->
      <div id="qt-import-preview-area" class="hidden" style="margin-top:20px;">
        
        <!-- Customer & Stats Header Strip -->
        <div style="background:linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); border:1.5px solid #cbd5e1; border-radius:12px; padding:14px 18px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
            <div style="font-size:18px;">👤</div>
            <div>
              <div style="font-size:11px; color:#64748b; font-weight:700;">العميل المكتشف بالشيت:</div>
              <input type="text" id="qt-import-detected-customer" class="input" style="font-weight:800; font-size:13px; height:32px; width:260px; color:#1e3a8a; border-color:#93c5fd; background:#fff;" placeholder="اسم العميل..." />
            </div>
            <div id="qt-import-customer-status" style="font-size:11px; color:#059669; font-weight:700;"></div>
          </div>

          <!-- Quick Stats Pills -->
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="badge" style="background:#eff6ff; border:1.5px solid #bfdbfe; color:#1e40af; font-size:12px; padding:6px 12px; font-weight:700;" id="qt-stat-total-items">📦 0 صنف (استيراد مباشر بنود حرة)</span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h4 style="color:var(--text-0); font-size:13.5px; font-weight:800; margin:0;">
            📋 تفاصيل الأصناف المستخرجة من الملف (تُستورد كما هي تماماً دون تغيير):
          </h4>
          <div style="font-size:12px; color:var(--text-2);">
            * الأسماء والوحدات والكميات والأسعار مطابقة لملفك بنسبة 100% دون أي ربط بالمخزن أو الكتالوج
          </div>
        </div>

        <div class="table-container" style="max-height:420px; overflow-y:auto; border:1px solid var(--border-soft); border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
          <table class="data-dense" style="width:100%; margin:0; font-size:11.5px;">
            <thead style="position:sticky; top:0; z-index:10; background:var(--bg-2); border-bottom:2px solid var(--border-soft);">
              <tr>
                <th style="width:32px; text-align:center;"><input type="checkbox" id="qt-import-select-all" checked onchange="toggleAllImportedItems(this.checked)" /></th>
                <th style="width:30px; text-align:center;">#</th>
                <th style="min-width:240px;">اسم الصنف بالشيت (كما هو دون تعديل)</th>
                <th style="width:90px; text-align:center;">رقم/كود الصنف</th>
                <th style="width:75px; text-align:center;">الوحدة</th>
                <th style="width:70px; text-align:center;">الكمية</th>
                <th style="width:100px; text-align:left;">السعر (غير شامل)</th>
                <th style="width:100px; text-align:left; color:#1e40af;">شامل 15%</th>
                <th style="width:55px; text-align:center;">خصم%</th>
                <th style="width:110px; text-align:left;">الإجمالي شامل</th>
              </tr>
            </thead>
            <tbody id="qt-import-parsed-tbody"></tbody>
          </table>
        </div>

        <!-- Totals Summary Bar -->
        <div style="display:flex; justify-content:flex-end; margin-top:14px;">
          <div style="background:var(--bg-2); border:1.5px solid var(--border-soft); border-radius:10px; padding:10px 18px; display:flex; gap:24px; align-items:center;">
            <div>
              <span style="font-size:11.5px; color:var(--text-2);">المجموع قبل الضريبة:</span>
              <span class="mono font-bold" id="qt-import-tot-gross" style="margin-right:6px; font-size:12.5px;">0.00 ر.س</span>
            </div>
            <div>
              <span style="font-size:11.5px; color:#b45309; font-weight:700;">ضريبة 15%:</span>
              <span class="mono font-bold" id="qt-import-tot-vat" style="color:#b45309; margin-right:6px; font-size:12.5px;">0.00 ر.س</span>
            </div>
            <div style="border-right:2px solid var(--border-soft); padding-right:16px;">
              <span style="font-size:12.5px; font-weight:800; color:var(--brand);">الإجمالي النهائي المطلوب:</span>
              <span class="mono font-bold text-brand" id="qt-import-tot-grand" style="margin-right:8px; font-size:15px;">0.00 ر.س</span>
            </div>
          </div>
        </div>

      </div>

    </div>

    <div class="modal-footer" style="padding:14px 24px; background:var(--bg-2); border-radius:0 0 12px 12px; display:flex; justify-content:space-between; align-items:center;">
      <button class="btn btn-ghost" onclick="closeModal('qt-import-modal')">إلغاء</button>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-secondary" id="qt-import-reupload-btn" onclick="resetQuotationImport()" style="display:none;">🔄 رفع ملف آخر</button>
        <button class="btn btn-primary" id="qt-import-submit-btn" disabled onclick="submitImportedQuotationItems()" style="background:linear-gradient(135deg,#047857,#059669); border-color:#047857; font-weight:800; padding:9px 24px; font-size:13.5px; box-shadow:0 3px 12px rgba(5,150,105,0.3);">
          ⚡ إنشاء وتعبئة عرض السعر الآن
        </button>
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<!-- QUICK ADD PRODUCT MODAL                                 -->
<!-- ═══════════════════════════════════════════════════════ -->
<div class="modal-overlay" id="qt-quick-product-modal" style="z-index: 1050;">
  <div class="modal modal-md" style="border-radius:12px; max-width:560px;">
    <div class="modal-header" style="background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color:#fff; border-radius:12px 12px 0 0; padding:14px 20px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:18px;">✨</span>
        <h3 class="modal-title" style="color:#fff; font-size:15px; font-weight:700; margin:0;" id="qt-qp-title">إضافة صنف جديد سريع إلى الكتالوج</h3>
      </div>
      <button class="modal-close" style="color:#fff; opacity:0.8;" onclick="closeModal('qt-quick-product-modal')">×</button>
    </div>
    <div class="modal-body" style="padding:20px;">
      <div style="font-size:12px; color:var(--text-2); margin-bottom:14px; line-height:1.5;">
        سيتم حفظ الصنف فوراً في قاعدة بيانات الأصناف (الكتالوج) ليكون متاحاً في المخزن وفواتير الشراء والبيع، مع إدراجه مباشرة في هذا العرض.
      </div>

      <div class="form-group mb-12">
        <label style="font-size:12px; font-weight:600;">اسم الصنف بالعربي *</label>
        <input type="text" id="qt-qp-name" class="input" placeholder="مثال: شوكولاتة كيندر بوينو 43 جم" required />
      </div>

      <div class="grid-2 gap-12 mb-12">
        <div class="form-group mb-0">
          <label style="font-size:12px; font-weight:600;">رمز الصنف (SKU / الكود)</label>
          <input type="text" id="qt-qp-sku" class="input mono" placeholder="يولد تلقائياً" />
        </div>
        <div class="form-group mb-0">
          <label style="font-size:12px; font-weight:600;">الوحدة الأساسية</label>
          <select id="qt-qp-unit" class="input">
            <option value="كرتون" selected>كرتون (Carton)</option>
            <option value="حبة">حبة (Piece)</option>
            <option value="صندوق">صندوق (Box)</option>
            <option value="كيس">كيس (Bag)</option>
            <option value="شد">شد (Pack)</option>
            <option value="شوال">شوال (Sack)</option>
            <option value="علبة">علبة (Can)</option>
            <option value="كيلو">كيلو (Kilogram)</option>
            <option value="درزن">درزن (Dozen)</option>
            <option value="باليت">باليت (Pallet)</option>
          </select>
        </div>
      </div>

      <div class="form-group mb-12">
        <label style="font-size:12px; font-weight:600;">الفئة / التصنيف</label>
        <select id="qt-qp-category" class="input">
          <option value="">(بدون تصنيف)</option>
        </select>
      </div>

      <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:8px; padding:12px; margin-bottom:14px;">
        <div style="font-size:11.5px; font-weight:700; color:var(--text-1); margin-bottom:10px;">التسعير وهوامش الربح:</div>
        <div class="grid-3 gap-10">
          <div class="form-group mb-0">
            <label style="font-size:11px;">سعر التكلفة التقديري</label>
            <input type="number" id="qt-qp-cost" class="input mono" min="0" step="0.01" value="0"
              oninput="calcQuickProductPrice('cost')" placeholder="0.00" />
          </div>
          <div class="form-group mb-0">
            <label style="font-size:11px;">هامش الربح %</label>
            <input type="number" id="qt-qp-margin" class="input mono" min="0" step="0.5" value="10"
              oninput="calcQuickProductPrice('margin')" placeholder="10" />
          </div>
          <div class="form-group mb-0">
            <label style="font-size:11px;">سعر البيع (بدون ضريبة)</label>
            <input type="number" id="qt-qp-price" class="input mono" min="0" step="0.01" value="0"
              oninput="calcQuickProductPrice('price')" placeholder="0.00" />
          </div>
        </div>
        <div id="qt-qp-vat-hint" style="font-size:11px; color:#059669; font-weight:700; margin-top:8px; text-align:left; direction:ltr;">
          السعر شامل الضريبة (15%): 0.00 ر.س
        </div>
      </div>

      <div id="qt-qp-error" class="alert bad hidden" style="font-size:12px; margin-top:8px;"></div>
    </div>
    <div class="modal-footer" style="padding:12px 20px; background:var(--bg-2); border-radius:0 0 12px 12px; gap:8px;">
      <button type="button" class="btn btn-ghost" onclick="closeModal('qt-quick-product-modal')">إلغاء</button>
      <button type="button" class="btn btn-primary" id="qt-qp-save-btn" onclick="saveQuickProduct()" style="background:#059669; border-color:#059669; font-weight:700;">
        ✨ حفظ وإدراج في عرض السعر
      </button>
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
</div>`}async function yt(){try{[S,E,Z,W]=await Promise.all([N(L.customers(),[A("name")]),N(L.products(),[A("name")]),N(L.salesReps(),[A("name")]),N(L.categories(),[A("name")])]);try{tt=await N(L.priceLists())}catch{tt=[]}const e=Z.map(i=>`<option value="${i.id}" data-name="${i.name}">${i.name}</option>`).join(""),t=document.getElementById("qt-rep");t&&(t.innerHTML='<option value="">بدون مندوب</option>'+e);const o=document.getElementById("qt-rep-filter");o&&(o.innerHTML='<option value="">الكل</option>'+e);const n=document.getElementById("qt-product-category-filter");n&&(n.innerHTML='<option value="">كل الفئات</option>'+W.map(i=>`<option value="${i.id}">${i.name}</option>`).join(""))}catch(e){console.error("loadDependencies:",e)}}async function rt(){const e=document.getElementById("qt-tbody");if(e)try{const t=ft(L.quotations(),A("createdAt","desc"),gt(300));q=(await xt(t)).docs.map(n=>({id:n.id,...n.data()})),Y(q)}catch(t){e&&(e.innerHTML=`<tr><td colspan="9" class="text-bad" style="padding:16px;">خطأ: ${t.message}</td></tr>`)}}function Y(e){const t=document.getElementById("qt-tbody");if(!t)return;const o=e.length,n=e.filter(r=>r.status==="accepted").length,i=e.filter(r=>r.status==="draft"||r.status==="sent").length,s=e.filter(r=>r.status==="converted").length,d=o>0?Math.round(s/o*100):0,c=(r,a)=>{const u=document.getElementById(r);u&&(u.textContent=a)};if(c("kpi-qt-total",o),c("kpi-qt-accepted",n),c("kpi-qt-pending",i),c("kpi-qt-conv",d+"%"),c("qt-count-label",o+" عرض"),!e.length){t.innerHTML='<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد عروض أسعار</td></tr>';return}t.innerHTML=e.map(r=>{const a=r.status!=="converted"&&r.status!=="accepted"&&r.expiryDate&&r.expiryDate<C(),u=r.status!=="converted";return`
      <tr class="qt-row" data-id="${r.id}" style="cursor:pointer;">
        <td class="mono text-indigo font-bold">${r.quoteNumber||"—"}</td>
        <td class="dim">${F(r.date)}</td>
        <td><strong>${r.customerName||"—"}</strong></td>
        <td class="dim">${r.repName||"—"}</td>
        <td style="text-align:center;" class="mono">${(r.items||[]).length}</td>
        <td class="mono font-bold">${b(r.grandTotal||0)}</td>
        <td>${K(a?"expired":r.status)}</td>
        <td class="${a?"text-bad":""}">${F(r.expiryDate)}</td>
        <td class="qt-actions-cell">
          <div class="row-actions" style="display:flex;gap:2px;flex-wrap:nowrap;">
            <button class="btn btn-icon sm btn-ghost qt-act" data-action="print" data-id="${r.id}" title="طباعة">🖨️</button>
            ${u?'<button class="btn btn-icon sm btn-ghost qt-act" data-action="convert" data-id="'+r.id+'" style="color:var(--brand);" title="تحويل لفاتورة">🔄</button>':""}
            <button class="btn btn-icon sm btn-ghost qt-act" data-action="dup"  data-id="${r.id}" title="تكرار">📋</button>
            <button class="btn btn-icon sm btn-ghost qt-act" data-action="edit" data-id="${r.id}" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost qt-act text-bad" data-action="del" data-id="${r.id}" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>`}).join(""),t._qtListenerAttached||(t._qtListenerAttached=!0,t.addEventListener("click",function(a){const u=a.target.closest(".qt-act");if(u){a.stopPropagation();const m=u.dataset.id,f=u.dataset.action;if(f==="edit"){const p=q.find(g=>g.id===m);p&&openQuoteForm(p)}else if(f==="del"){const p=q.find(g=>g.id===m);deleteQuote(m,p&&p.quoteNumber||"")}else f==="dup"?q.find(g=>g.id===m)&&duplicateQuote(m):f==="convert"?convertQuoteToInvoice(m):f==="print"&&printQuote(m);return}const l=a.target.closest(".qt-row");l&&!a.target.closest(".qt-actions-cell")&&viewQuote(l.dataset.id,a)}))}window.filterQuotes=()=>{const e=(document.getElementById("qt-search")?.value||"").trim().toLowerCase(),t=document.getElementById("qt-status-filter")?.value||"",o=document.getElementById("qt-from")?.value||"",n=document.getElementById("qt-to")?.value||"",i=document.getElementById("qt-rep-filter")?.value||"",s=q.filter(d=>{if(e&&!((d.quoteNumber||"").toLowerCase().includes(e)||(d.customerName||"").toLowerCase().includes(e))||t&&d.status!==t)return!1;const c=d.date||"";return!(o&&c<o||n&&c>n||i&&d.repId!==i)});Y(s)};window.openQuoteForm=async(e=null)=>{M=e?.id||null,x=e?.items?JSON.parse(JSON.stringify(e.items)).map(c=>{const r=E.find(m=>m.id===c.productId),a=c.cost||r?.lastPurchasePrice||r?.avgCostPrice||r?.purchasePrice||r?.costPrice||r?.averageCost||r?.cost||0,u=c.lastPurchasePrice||r?.lastPurchasePrice||(a>0?a:0);let l=c.margin;return(l===void 0||isNaN(l))&&(l=a>0?Math.round((c.unitPrice/a-1)*100*100)/100:0),{...c,cost:parseFloat(a)||0,lastPurchasePrice:parseFloat(u)||0,margin:parseFloat(l)||0,isCustom:!!c.isCustom||!r||String(c.productId||"").startsWith("adhoc_"),taxCategory:c.taxCategory||r?.taxCategory||"S"}}):[];const t=(c,r)=>{const a=document.getElementById(c);a&&(a.value=r||"")},o=C(),n=document.getElementById("qt-form-title");n&&(n.textContent=e?.id?`تعديل العرض: ${e.quoteNumber}`:"عرض سعر جديد"),t("qt-number",e?.quoteNumber||"جارٍ التوليد…"),t("qt-date",e?.date||o),t("qt-expiry",e?.expiryDate||st(o,30)),t("qt-customer-search",e?.customerName||""),t("qt-customer-id",e?.customerId||""),t("qt-customer-name-val",e?.customerName||""),t("qt-delivery-address",e?.deliveryAddress||""),t("qt-rep",e?.repId||""),t("qt-pricelist",e?.priceList||"standard"),t("qt-payment-terms",e?.paymentTerms||"cash"),t("qt-status",e?.status||"draft"),t("qt-notes",e?.notes||""),t("qt-terms",e?.terms||"صلاحية العرض: 30 يوماً من تاريخه. الأسعار شاملة ضريبة القيمة المضافة 15%. يُعدّ هذا العرض ملزماً عند قبوله."),t("qt-extra-disc-type",e?.extraDiscountType||"none"),t("qt-extra-disc-val",e?.extraDiscountVal||"0");const i=document.getElementById("qt-expiry-warn");i&&(i.style.display="none");const s=document.getElementById("qt-form-error");s&&s.classList.add("hidden");const d=document.getElementById("qt-form-print-btn");d&&(d.style.display=e?.id?"inline-flex":"none"),z(),openModal("qt-form-modal"),e?.id||ot("QT").then(c=>{const r=document.getElementById("qt-number");r&&(r.value=c)}).catch(()=>{})};window.checkExpiryWarn=()=>{const e=document.getElementById("qt-expiry")?.value,t=document.getElementById("qt-expiry-warn");t&&(t.style.display=e&&e<C()?"block":"none")};window.editQuote=e=>{const t=q.find(o=>o.id===e);t&&openQuoteForm(t)};window.duplicateQuote=e=>{const t=q.find(n=>n.id===e);if(!t)return;const o=JSON.parse(JSON.stringify(t));delete o.id,o.quoteNumber=null,o.status="draft",o.date=C(),o.expiryDate=st(C(),30),openQuoteForm(o)};window.onPricelistChange=()=>{const e=document.getElementById("qt-pricelist")?.value||"standard";x=x.map(t=>{const o=E.find(d=>d.id===t.productId);if(!o)return t;const n=o.lastPurchasePrice||o.avgCostPrice||o.costPrice||o.purchasePrice||o.averageCost||0;let i=0;if(e==="wholesale"?i=n>0?n*(1+I.wholesaleMargin/100):0:e==="distributor"?i=n>0?n*(1+I.distributorMargin/100):0:i=n>0?n*(1+I.retailMargin/100):0,i<=0){const d=o.salePrice||o.priceRetail||o.price||0;i=Math.round(d/1.15*100)/100}else i=Math.round(i*100)/100;const s=n>0?Math.round((i/n-1)*100*100)/100:0;return{...t,cost:n,unitPrice:i,margin:s}}),z()};function z(){const e=document.getElementById("qt-lines-tbody");if(e){if(!x.length){e.innerHTML=`<tr><td colspan="12" style="text-align:center;padding:20px;
      color:var(--text-2);font-size:12px;">ابحث عن صنف أعلاه لإضافته</td></tr>`,recalcTotals();return}e.innerHTML=x.map((t,o)=>{const n=(t.qty||0)*(t.unitPrice||0),i=n*(t.discount||0)/100,s=n-i,d=s*.15,c=s+d,r=!!t.isCustom||String(t.productId||"").startsWith("adhoc_");return`
      <tr style="border-bottom:1px solid var(--border-soft); ${r?"background:rgba(245,158,11,0.03);":""}">
        <td style="padding:5px 8px;color:var(--text-2);font-size:11px;">${o+1}</td>
        <td style="padding:5px 8px;">
          ${r?`
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <input type="text" class="input" style="font-size:12px;font-weight:700;flex:1;min-width:180px;height:30px;border-color:#fbbf24;background:#fffdf5;"
                value="${(t.productName||"").replace(/"/g,"&quot;")}"
                placeholder="اكتب اسم الصنف أو البند الحر..."
                onchange="updateQtLine(${o},'productName',this.value)" />
              <span class="badge" style="background:#fef3c7;color:#b45309;font-size:10px;padding:2px 6px;border-radius:4px;white-space:nowrap;">⚡ بند حر</span>
              <button type="button" class="btn btn-ghost btn-sm" style="font-size:10.5px;color:#059669;padding:2px 6px;white-space:nowrap;font-weight:700;"
                title="تسجيل هذا البند كصنف دائم في الكتالوج"
                onclick="registerAdhocProduct(${o})">💾 تسجيل بالكتالوج</button>
            </div>
          `:`
            <div style="font-size:12.5px;font-weight:600;">${t.productName}</div>
            ${t.sku?`<div style="font-size:10px;color:var(--text-2);">${t.sku}</div>`:""}
          `}
        </td>
        <td style="padding:5px 8px;font-size:11px;color:var(--text-2);">
          ${r?`
            <input type="text" class="input" style="width:64px;height:28px;font-size:11px;text-align:center;padding:2px;border-color:#fbbf24;"
              value="${t.unit||"كرتون"}"
              placeholder="الوحدة"
              onchange="updateQtLine(${o},'unit',this.value)" />
          `:t.unit||"PCS"}
        </td>
        <td style="padding:5px 8px;">
          <input type="number" class="input mono qt-line-qty" data-row="${o}" style="width:70px;height:28px;font-size:12px;font-weight:700;"
            value="${t.qty}" min="0.001" step="0.001"
            onchange="updateQtLine(${o},'qty',this.value)"
            onkeydown="if(event.key==='Enter'){event.preventDefault(); const s=document.getElementById('qt-product-search'); if(s){s.focus(); s.select();}}" />
        </td>
        <td class="no-print" style="padding:5px 8px;">
          <div style="display:flex;flex-direction:column;gap:2px;">
            <input type="number" class="input mono" style="width:85px;height:28px;font-size:12px;background:#f9f9ff;border-color:#d0d4f0;"
              value="${t.cost||0}" min="0" step="0.01"
              title="سعر التكلفة (آخر شراء / تقديري)"
              onchange="updateQtLineCost(${o},this.value)" />
            ${t.lastPurchasePrice?`<span style="font-size:9.5px;color:#059669;font-weight:600;" title="آخر سعر شراء مسجل من فواتير الشراء">آخر: ${b(t.lastPurchasePrice)}</span>`:""}
          </div>
        </td>
        <td class="no-print" style="padding:5px 8px;">
          <input type="number" class="input mono" style="width:75px;height:28px;font-size:12px;background:#f9f9ff;border-color:#d0d4f0;"
            value="${t.margin||0}" step="0.1"
            onchange="updateQtLineMargin(${o},this.value)" />
        </td>
        <td style="padding:5px 8px;">
          <input type="number" class="input mono" style="width:100px;height:28px;font-size:12px;font-weight:700;"
            value="${t.unitPrice}" min="0" step="0.01"
            title="السعر غير شامل الضريبة"
            onchange="updateQtLine(${o},'unitPrice',this.value)" />
          <div style="font-size:9.5px;color:#2563eb;font-weight:700;margin-top:2px;white-space:nowrap;" title="السعر شامل 15% ضريبة">
            شامل: ${b(Math.round((parseFloat(t.unitPrice)||0)*1.15*100)/100)}
          </div>
        </td>
        <td style="padding:5px 8px;">
          <input type="number" class="input mono" style="width:64px;height:28px;font-size:12px;"
            value="${t.discount||0}" min="0" max="100" step="0.1"
            onchange="updateQtLine(${o},'discount',this.value)" />
        </td>
        <td style="padding:5px 8px;" class="mono">${b(s)}</td>
        <td style="padding:5px 8px;color:var(--warn);" class="mono">${b(d)}</td>
        <td style="padding:5px 8px;font-weight:700;" class="mono">${b(c)}</td>
        <td style="padding:5px 8px;">
          <button class="btn btn-icon sm btn-ghost" style="color:var(--bad);"
            onclick="removeQtLine(${o})">✕</button>
        </td>
      </tr>`}).join(""),recalcTotals()}}window.refreshQuoteItemCostsFromPurchases=async e=>{e&&(e.disabled=!0,e.innerHTML="<span>⏳</span> جارٍ التحديث…");try{const{syncProductCostsFromPurchaseInvoices:t}=await X(async()=>{const{syncProductCostsFromPurchaseInvoices:s}=await import("./product-cost-sync-B4nC-ymm.js");return{syncProductCostsFromPurchaseInvoices:s}},__vite__mapDeps([0,1,2])),{productsMap:o}=await t(!0);E=await N(L.products());const n=document.getElementById("qt-pricelist")?.value||"standard";let i=0;x.forEach(s=>{const d=E.find(a=>a.id===s.productId),c=o[s.productId],r=c?.lastPurchasePrice||c?.avgCostPrice||d?.lastPurchasePrice||d?.avgCostPrice||d?.costPrice||d?.purchasePrice||0;if(r>0){s.cost=r,s.lastPurchasePrice=c?.lastPurchasePrice||d?.lastPurchasePrice||r;let a=0;n==="wholesale"?a=r*(1+I.wholesaleMargin/100):n==="distributor"?a=r*(1+I.distributorMargin/100):a=r*(1+I.retailMargin/100),s.unitPrice=Math.round(a*100)/100,s.margin=Math.round((s.unitPrice/r-1)*100*100)/100,i++}}),z(),showToast(`تم تحديث تكاليف وهوامش أسعار (${i}) صنف من فواتير الشراء بنجاح ✅`,"success")}catch(t){showToast("فشل تحديث تكاليف عروض الأسعار: "+t.message,"error")}finally{e&&(e.disabled=!1,e.innerHTML="<span>🔄</span> تحديث التكاليف من فواتير الشراء")}};window.updateQtLine=(e,t,o)=>{if(!x[e])return;if(t==="productName"||t==="unit"){x[e][t]=o;return}const n=parseFloat(o)||0;if(x[e][t]=n,t==="unitPrice"){const i=x[e].cost||0;i>0&&(x[e].margin=Math.round((n/i-1)*100*100)/100)}z()};window.updateQtLineCost=(e,t)=>{const o=parseFloat(t)||0;x[e].cost=o;const n=x[e].margin||0;x[e].unitPrice=Math.round(o*(1+n/100)*100)/100,z()};window.updateQtLineMargin=(e,t)=>{const o=parseFloat(t)||0;x[e].margin=o;const n=x[e].cost||0;x[e].unitPrice=Math.round(n*(1+o/100)*100)/100,z()};window.removeQtLine=e=>{x.splice(e,1),z()};window.recalcTotals=()=>{const e=document.getElementById("qt-extra-disc-type")?.value||"none",t=document.getElementById("qt-extra-disc-val")?.value||"0",o=at(x,e,t),n=(i,s)=>{const d=document.getElementById(i);d&&(d.textContent=s)};n("qt-t-gross",b(o.grossTotal)),n("qt-t-disc","- "+b(o.totalDiscount)),n("qt-t-subtotal",b(o.subtotal)),n("qt-t-vat",b(o.vat)),n("qt-t-grand",b(o.grandTotal))};function ht(){const e=document.getElementById("qt-customer-search"),t=document.getElementById("qt-customer-results");if(!e)return;const o=()=>{const n=e.value.trim(),i=document.getElementById("qt-customer-name-val");i&&(i.value=n);const s=document.getElementById("qt-customer-id");if(s)if(!n||n==="عرض سعر عام (عميل عام)")s.value="general";else{const d=S.find(c=>(c.name||"").trim().toLowerCase()===n.toLowerCase());s.value=d?d.id:"adhoc_customer"}};e.addEventListener("input",o),e.addEventListener("change",o),e.addEventListener("input",et(()=>{const n=e.value.trim().toLowerCase();if(!n){t.classList.add("hidden");return}const i=S.filter(s=>(s.name||"").toLowerCase().includes(n)||(s.phone||"").includes(n)).slice(0,10);if(!i.length){const s=n.replace(/'/g,"\\'").replace(/"/g,"&quot;");t.innerHTML=`
        <div style="padding:10px 14px; font-size:11.5px; color:var(--text-2); background:var(--bg-1);">
          عميل جديد / مخصص: <strong style="color:var(--text-1);">${s}</strong>
          <div style="font-size:10.5px; color:#059669; margin-top:2px;">✓ سيتم حفظ هذا العميل مباشرة في عرض السعر</div>
        </div>`,t.classList.remove("hidden");return}t.innerHTML=i.map(s=>`
      <div class="autocomplete-item"
        onclick="selectQtCustomer('${s.id}','${(s.name||"").replace(/'/g,"\\'")}')">
        <div>${s.name}</div>
        <div class="item-code">${s.phone||""} ${s.vatNumber?"| ض: "+s.vatNumber:""}</div>
      </div>`).join(""),t.classList.remove("hidden")},250)),document.addEventListener("click",n=>{!e.contains(n.target)&&!t.contains(n.target)&&t.classList.add("hidden")})}window.selectQtCustomer=(e,t)=>{const o=(i,s)=>{const d=document.getElementById(i);d&&(d.value=s)};o("qt-customer-id",e),o("qt-customer-name-val",t),o("qt-customer-search",t),document.getElementById("qt-customer-results")?.classList.add("hidden");const n=S.find(i=>i.id===e);if(n){const i=document.getElementById("qt-delivery-address");i&&!i.value.trim()&&n.address&&(i.value=n.address)}};function wt(){const e=document.getElementById("qt-product-search"),t=document.getElementById("qt-product-results"),o=document.getElementById("qt-product-category-filter");if(!e)return;const n=()=>{const i=e.value.trim().toLowerCase(),s=o?o.value:"",d=document.getElementById("qt-pricelist")?.value||"standard";if(!i&&!s){t.classList.add("hidden");return}let c=E;s&&(c=c.filter(l=>l.category===s)),i&&(c=c.filter(l=>(l.name||"").toLowerCase().includes(i)||(l.sku||"").toLowerCase().includes(i)||(l.barcode||"").includes(i))),c=c.slice(0,15);const r=(i||"").replace(/'/g,"\\'").replace(/"/g,"&quot;");if(!c.length){t.innerHTML=`
        <div style="padding:14px;text-align:center;background:var(--bg-1);border-radius:8px;">
          <div style="font-size:12px;color:var(--text-2);margin-bottom:10px;">
            الصنف <strong style="color:var(--text-1);">"${r}"</strong> غير موجود في دليل الأصناف الحالي
          </div>
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
            <button type="button" class="btn btn-sm btn-primary" onclick="openQuickAddProductModal('${r}')" style="font-size:11.5px;padding:6px 12px;background:#059669;border-color:#059669;font-weight:700;">
              ➕ تسجيل "${r}" كصنف جديد في الكتالوج
            </button>
            <button type="button" class="btn btn-sm btn-secondary" onclick="addCustomQuoteLine('${r}')" style="font-size:11.5px;padding:6px 12px;color:#d97706;border-color:rgba(245,158,11,0.4);font-weight:700;">
              ⚡ إدراج كبند حر في العرض
            </button>
          </div>
        </div>`,t.classList.remove("hidden");return}const a=c.map(l=>{const m=l.lastPurchasePrice||l.avgCostPrice||l.costPrice||l.purchasePrice||l.averageCost||0;let f=0;if(d==="wholesale"?f=m>0?m*(1+I.wholesaleMargin/100):0:d==="distributor"?f=m>0?m*(1+I.distributorMargin/100):0:f=m>0?m*(1+I.retailMargin/100):0,f<=0){const v=l.salePrice||l.priceRetail||l.price||0;f=Math.round(v/1.15*100)/100}else f=Math.round(f*100)/100;const p=f*1.15,g=(l.name||"").replace(/'/g,"\\'"),w=(l.sku||"").replace(/'/g,"\\'");return`
        <div class="autocomplete-item" style="padding:10px 14px; cursor:pointer;"
          onclick="addQtProduct('${l.id}','${g}',${f},'${l.unit||"PCS"}','${w}', ${m})">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
            <div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;">
              <span style="font-weight:700; color:var(--text-1); font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${l.name}</span>
              ${l.sku?`<span class="badge" style="font-size:10.5px; background:var(--bg-2); color:var(--text-2); padding:1px 6px;">${l.sku}</span>`:""}
              <span class="badge" style="font-size:10.5px; background:rgba(37,99,235,0.08); color:#1d4ed8; padding:1px 6px;">${l.unit||"كرتون"}</span>
            </div>
            <div style="display:flex;align-items:center;gap:12px;flex-shrink:0;">
              <span style="color:#059669; font-weight:600; font-size:11px; background:rgba(16,185,129,0.1); padding:2px 8px; border-radius:4px;">
                🛒 آخر شراء: ${b(l.lastPurchasePrice||m)}
              </span>
              <div style="text-align:left;">
                <span class="mono text-indigo font-bold" style="font-size:13px;" title="سعر البيع المقترح شامل الضريبة">${b(p)}</span>
                <span class="dim" style="font-size:9.5px; display:block;">شامل 15%</span>
              </div>
            </div>
          </div>
        </div>`}).join(""),u=i?`
      <div style="padding:8px 12px;background:var(--bg-2);border-top:1px dashed var(--border-soft);display:flex;justify-content:space-between;align-items:center;font-size:11px;">
        <span style="color:var(--text-2);">لم تجد ما تبحث عنه؟</span>
        <div style="display:flex;gap:6px;">
          <button type="button" class="btn btn-ghost btn-sm" onclick="addCustomQuoteLine('${r}')" style="font-size:11px;color:#d97706;font-weight:700;">⚡ إدراج "${r}" كبند حر</button>
          <button type="button" class="btn btn-ghost btn-sm" onclick="openQuickAddProductModal('${r}')" style="font-size:11px;color:#059669;font-weight:700;">➕ تسجيل صنف جديد</button>
        </div>
      </div>`:"";t.innerHTML=a+u,t.classList.remove("hidden")};e.addEventListener("input",et(n,200)),e.addEventListener("focus",n),o&&o.addEventListener("change",n),document.addEventListener("click",i=>{!e.contains(i.target)&&!t.contains(i.target)&&(!o||!o.contains(i.target))&&t.classList.add("hidden")})}window.addQtProduct=(e,t,o,n,i,s=0)=>{const d=document.getElementById("qt-product-search"),c=document.getElementById("qt-product-results");d&&(d.value=""),c&&c.classList.add("hidden");const r=E.find(m=>m.id===e),a=parseFloat(s)||r?.lastPurchasePrice||r?.avgCostPrice||r?.costPrice||r?.purchasePrice||0,u=r?.lastPurchasePrice||(a>0?a:0),l=x.findIndex(m=>m.productId===e);if(l!==-1){x[l].qty+=1,!x[l].cost&&a>0&&(x[l].cost=a),!x[l].lastPurchasePrice&&u>0&&(x[l].lastPurchasePrice=u);const[m]=x.splice(l,1);x.unshift(m)}else{const m=a,f=m>0?Math.round((o/m-1)*100*100)/100:0;x.unshift({productId:e,productName:t,unitPrice:o,unit:n,sku:i,qty:1,discount:0,cost:m,lastPurchasePrice:u,margin:f})}z(),setTimeout(()=>{const m=document.querySelector("#qt-lines-tbody tr:first-child .qt-line-qty");m&&(m.focus(),m.select())},40)};window.addAllProductsToQuote=()=>{if(!E||E.length===0){showToast("لا توجد أصناف في الكتالوج","warn");return}const e=document.getElementById("qt-product-category-filter")?.value;let t=E;if(e&&(t=E.filter(i=>i.categoryId===e||i.category===e)),!t||t.length===0){showToast("لا توجد أصناف تطابق الفئة المحددة","warn");return}if(!confirm(`هل تريد إدراج جميع أصناف الكتالوج (${t.length} صنف) بداخل عرض السعر؟`))return;const o=document.getElementById("qt-pricelist")?.value||"standard";let n=0;t.forEach(i=>{if(!x.some(s=>s.productId===i.id)){let s=i.salePrice||i.priceRetail||i.sellingPrice||i.price||0;o==="wholesale"&&i.priceWholesale&&(s=i.priceWholesale),o==="distributor"&&i.priceDistributor&&(s=i.priceDistributor),o==="special"&&i.priceSpecial&&(s=i.priceSpecial);const d=i.lastPurchasePrice||i.avgCostPrice||i.costPrice||i.purchasePrice||i.averageCost||i.cost||0,c=i.lastPurchasePrice||(d>0?d:0),r=d>0?Math.round((s/d-1)*100*100)/100:0;x.push({productId:i.id,productName:i.name||i.nameAr||"",sku:i.sku||i.code||"",unit:i.unit||i.unitName||"PCS",cost:d,lastPurchasePrice:c,margin:r,qty:1,unitPrice:s,discount:0}),n++}}),z(),showToast(`تم إدراج ${n} صنف في عرض السعر بنجاح`,"success")};window.clearAllQuoteLines=()=>{x.length!==0&&confirm("هل أنت متأكد من تفريغ كافة بنود عرض السعر؟")&&(x=[],z(),showToast("تم تفريغ كافة الأصناف","info"))};window.saveQuote=async e=>{const t=document.getElementById("qt-form-error");t&&t.classList.add("hidden");const o=document.getElementById("qt-customer-search")?.value.trim()||"",n=document.getElementById("qt-customer-name-val")?.value.trim()||"";let i=o||n||"عرض سعر عام (عميل عام)",s=document.getElementById("qt-customer-id")?.value.trim()||"general";if(i==="عرض سعر عام (عميل عام)")s="general";else{const h=S.find(P=>(P.name||"").trim().toLowerCase()===i.toLowerCase());h?s=h.id:(!s||s==="general")&&(s="adhoc_customer")}const d=document.getElementById("qt-customer-id");d&&(d.value=s);const c=document.getElementById("qt-customer-name-val");c&&(c.value=i);const r=document.getElementById("qt-date")?.value||"",a=document.getElementById("qt-expiry")?.value||"";if(!x.length){t&&(t.textContent="يرجى إضافة صنف واحد على الأقل.",t.classList.remove("hidden"));return}if(!r){t&&(t.textContent="يرجى تحديد تاريخ العرض.",t.classList.remove("hidden"));return}const u=document.getElementById("qt-extra-disc-type")?.value||"none",l=parseFloat(document.getElementById("qt-extra-disc-val")?.value)||0,m=at(x,u,l),f=document.getElementById("qt-rep"),p=f?.value||"",g=f?.options[f?.selectedIndex]?.dataset.name||"",w=e||document.getElementById("qt-status")?.value||"draft",v=document.getElementById("qt-save-draft-btn"),y=document.getElementById("qt-save-btn");v&&(v.disabled=!0),y&&(y.disabled=!0);try{let h=(document.getElementById("qt-number")?.value||"").trim();(!h||h==="جارٍ التوليد…"||h==="يُولَّد تلقائياً")&&(h=await ot("QT"));const P={quoteNumber:h,date:r,expiryDate:a,customerId:s,customerName:i,deliveryAddress:document.getElementById("qt-delivery-address")?.value||"",repId:p,repName:g,priceList:document.getElementById("qt-pricelist")?.value||"standard",paymentTerms:document.getElementById("qt-payment-terms")?.value||"cash",status:w,items:x,grossTotal:m.grossTotal,discountTotal:m.totalDiscount,subtotal:m.subtotal,totalVat:m.vat,grandTotal:m.grandTotal,extraDiscountType:u,extraDiscountVal:l,notes:document.getElementById("qt-notes")?.value||"",terms:document.getElementById("qt-terms")?.value||"",createdBy:it?.uid||"system"};let B=M;if(M){await G("quotations",M,P);const T=q.findIndex(O=>O.id===M);T!==-1&&(q[T]={...q[T],...P,id:M},Y(q)),showToast("تم تحديث عرض السعر بنجاح","success")}else{const T=await nt(L.quotations(),P);B=typeof T=="string"?T:T.id,showToast(`تم حفظ العرض ${h}`,"success")}const D=document.getElementById("qt-file-upload");if(D&&D.files.length>0){const T=D.files[0];window.uploadFileToArchive(T,"quotations",B,`مرفق عرض سعر رقم ${h}`).catch(O=>console.warn(O))}closeModal("qt-form-modal"),await rt()}catch(h){t&&(t.textContent=h.message,t.classList.remove("hidden")),console.error(h)}finally{v&&(v.disabled=!1),y&&(y.disabled=!1)}};window._quoteTaxViewMode=window._quoteTaxViewMode||"detailed";function dt(e,t="detailed"){const o=e.items||[];if(o.length===0)return'<div style="text-align:center;padding:24px;color:var(--text-3);">لا توجد أصناف في عرض السعر</div>';let n="",i="";return t==="inclusive"?(n=`
      <tr>
        <th style="width:36px;text-align:center;">#</th>
        <th>الصنف والوصف</th>
        <th style="text-align:center;width:95px;">الكمية</th>
        <th style="text-align:left;color:var(--brand);font-weight:800;width:150px;">السعر شامل الضريبة (15%)</th>
        <th style="text-align:center;width:70px;">الخصم</th>
        <th style="text-align:left;color:var(--text-good);font-weight:900;width:150px;">الإجمالي شامل الضريبة</th>
      </tr>
    `,i=o.map((s,d)=>{const c=parseFloat(s.qty)||0,r=parseFloat(s.unitPrice)||0,a=s.taxCategory==="E"||s.taxCategory==="Z"?0:.15,u=Math.round(r*(1+a)*100)/100,l=c*r,m=l*(parseFloat(s.discount)||0)/100,f=l-m,p=Math.round(f*(1+a)*100)/100;return`
        <tr>
          <td style="padding:8px 10px;text-align:center;color:var(--text-2);">${d+1}</td>
          <td style="padding:8px 10px;font-weight:700;color:var(--text-1);">
            ${s.productName}
            ${s.sku&&s.sku!=="بند حر"?`<div style="font-size:10px;color:var(--text-3);font-family:monospace;font-weight:normal;">كود: ${s.sku}</div>`:""}
          </td>
          <td style="padding:8px 10px;text-align:center;" class="mono font-semibold">${_(c)} ${s.unit||""}</td>
          <td style="padding:8px 10px;text-align:left;" class="mono font-bold text-brand">
            <span style="background:rgba(37,99,235,0.08);padding:3px 8px;border-radius:6px;display:inline-block;">${b(u)}</span>
          </td>
          <td style="padding:8px 10px;text-align:center;" class="mono">${s.discount?`<span style="color:var(--text-bad);font-weight:700;">${s.discount}%</span>`:"—"}</td>
          <td style="padding:8px 10px;text-align:left;" class="mono font-bold text-good" style="font-size:13px;">${b(p)}</td>
        </tr>
      `}).join("")):t==="exclusive"?(n=`
      <tr>
        <th style="width:36px;text-align:center;">#</th>
        <th>الصنف والوصف</th>
        <th style="text-align:center;width:95px;">الكمية</th>
        <th style="text-align:left;width:130px;">سعر الوحدة (غير شامل)</th>
        <th style="text-align:center;width:70px;">الخصم</th>
        <th style="text-align:left;width:130px;">الإجمالي (غير شامل)</th>
      </tr>
    `,i=o.map((s,d)=>{const c=parseFloat(s.qty)||0,r=parseFloat(s.unitPrice)||0,a=c*r,u=a*(parseFloat(s.discount)||0)/100,l=a-u;return`
        <tr>
          <td style="padding:8px 10px;text-align:center;color:var(--text-2);">${d+1}</td>
          <td style="padding:8px 10px;font-weight:700;color:var(--text-1);">
            ${s.productName}
            ${s.sku&&s.sku!=="بند حر"?`<div style="font-size:10px;color:var(--text-3);font-family:monospace;font-weight:normal;">كود: ${s.sku}</div>`:""}
          </td>
          <td style="padding:8px 10px;text-align:center;" class="mono font-semibold">${_(c)} ${s.unit||""}</td>
          <td style="padding:8px 10px;text-align:left;" class="mono font-bold">${b(r)}</td>
          <td style="padding:8px 10px;text-align:center;" class="mono">${s.discount?`<span style="color:var(--text-bad);font-weight:700;">${s.discount}%</span>`:"—"}</td>
          <td style="padding:8px 10px;text-align:left;" class="mono font-bold text-good">${b(l)}</td>
        </tr>
      `}).join("")):(n=`
      <tr>
        <th style="width:32px;text-align:center;">#</th>
        <th>الصنف والوصف</th>
        <th style="text-align:center;width:80px;">الكمية</th>
        <th style="text-align:left;width:110px;">السعر (غير شامل)</th>
        <th style="text-align:center;width:85px;">الضريبة (15%)</th>
        <th style="text-align:left;width:130px;background:rgba(37,99,235,0.08);color:var(--brand);font-weight:800;">السعر (شامل 15%)</th>
        <th style="text-align:left;width:125px;color:var(--text-good);font-weight:900;">الإجمالي شامل</th>
      </tr>
    `,i=o.map((s,d)=>{const c=parseFloat(s.qty)||0,r=parseFloat(s.unitPrice)||0,a=s.taxCategory==="E"||s.taxCategory==="Z"?0:.15,u=Math.round(r*a*100)/100,l=Math.round((r+u)*100)/100,m=c*r,f=m*(parseFloat(s.discount)||0)/100,p=m-f,g=Math.round(p*a*100)/100,w=Math.round((p+g)*100)/100;return`
        <tr>
          <td style="padding:7px 8px;text-align:center;color:var(--text-2);">${d+1}</td>
          <td style="padding:7px 8px;font-weight:700;color:var(--text-1);">
            ${s.productName}
            ${s.sku&&s.sku!=="بند حر"?`<div style="font-size:10px;color:var(--text-3);font-family:monospace;font-weight:normal;">كود: ${s.sku}</div>`:""}
          </td>
          <td style="padding:7px 8px;text-align:center;" class="mono font-semibold">${_(c)} ${s.unit||""}</td>
          <td style="padding:7px 8px;text-align:left;" class="mono font-bold">${b(r)}</td>
          <td style="padding:7px 8px;text-align:center;" class="mono"><span style="color:#b45309;font-weight:700;">${b(u)}</span></td>
          <td style="padding:7px 8px;text-align:left;background:rgba(37,99,235,0.04);" class="mono font-bold text-brand">
            <span style="background:rgba(37,99,235,0.1);padding:2px 7px;border-radius:6px;display:inline-block;">${b(l)}</span>
          </td>
          <td style="padding:7px 8px;text-align:left;" class="mono font-bold text-good">${b(w)}</td>
        </tr>
      `}).join("")),`
    <table class="data-dense" style="width:100%;border-collapse:collapse;">
      <thead>${n}</thead>
      <tbody>${i}</tbody>
    </table>
    ${t==="inclusive"?'<div style="font-size:11px;color:var(--text-3);margin-top:6px;padding:4px 8px;font-style:italic;">* جميع أسعار الأصناف المعروضة أعلاه شاملة ضريبة القيمة المضافة 15%</div>':""}
  `}window.setQuoteViewTaxMode=e=>{window._quoteTaxViewMode=e;const t=window._currentViewQuote;if(!t)return;const o=document.getElementById("qt-view-table-container");o&&(o.innerHTML=dt(t,e)),document.querySelectorAll(".qt-tax-mode-btn").forEach(i=>{i.classList.remove("btn-primary"),i.classList.add("btn-secondary")});const n=document.getElementById(`qt-tax-btn-${e}`);n&&(n.classList.remove("btn-secondary"),n.classList.add("btn-primary"))};window.viewQuote=(e,t)=>{if(t&&(t.target.closest("button")||t.target.closest(".row-actions")))return;const o=q.find(l=>l.id===e);if(!o)return;const n=document.getElementById("qt-view-title");n&&(n.textContent=`عرض السعر: ${o.quoteNumber||e}`);const i=document.getElementById("qt-view-convert-btn");i&&(i.style.display=o.status==="converted"?"none":"");const s={cash:"نقداً",net30:"30 يوم",net60:"60 يوم",custom:"حسب الاتفاق"},d={standard:"عادي",wholesale:"جملة",distributor:"موزع",special:"خاص"},c=o.expiryDate&&o.expiryDate<C()&&o.status!=="accepted"&&o.status!=="converted",r=Object.entries(j).filter(([l])=>l!=="converted").map(([l,m])=>`<button class="btn btn-sm ${o.status===l?"btn-primary":"btn-secondary"}"
      onclick="updateQuoteStatus('${o.id}','${l}')">${m.label}</button>`).join(""),a=document.getElementById("qt-view-body");if(!a)return;const u=window._quoteTaxViewMode||"detailed";a.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px;margin-bottom:16px;background:var(--bg-2);padding:12px 14px;border-radius:10px;border:1px solid var(--border-soft);">
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">رقم العرض</div>
        <div class="mono text-indigo font-bold" style="font-size:15px;">${o.quoteNumber}</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">الحالة</div>
        ${K(o.status)}
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">التاريخ</div>
        <div style="font-weight:600;">${F(o.date)}</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">تاريخ الصلاحية</div>
        <div class="${c?"text-bad font-bold":""}" style="font-weight:600;">${F(o.expiryDate)}</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">العميل</div>
        <div class="font-semibold" style="font-size:13px;color:var(--text-1);">${o.customerName}</div>
        ${o.deliveryAddress?`<div style="font-size:11px;color:var(--text-2);">📍 ${o.deliveryAddress}</div>`:""}
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">المندوب</div>
        <div style="font-weight:600;">${o.repName||"—"}</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">قائمة الأسعار</div>
        <div style="font-weight:600;">${d[o.priceList]||o.priceList||"—"}</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">شروط الدفع</div>
        <div style="font-weight:600;">${s[o.paymentTerms]||o.paymentTerms||"—"}</div>
      </div>
    </div>

    <!-- ── Mode Selector Bar ── -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
      <div style="font-size:13px;font-weight:800;color:var(--text-1);display:flex;align-items:center;gap:6px;">
        <span>📦 بنود وقائمة أسعار العرض:</span>
        <span style="font-size:11.5px;color:var(--text-2);font-weight:normal;">(${o.items?.length||0} صنف)</span>
      </div>
      <div style="display:flex;align-items:center;gap:4px;background:var(--bg-2);padding:3px;border-radius:99px;border:1px solid var(--border-soft);">
        <button type="button" id="qt-tax-btn-detailed" class="btn btn-xs qt-tax-mode-btn ${u==="detailed"?"btn-primary":"btn-secondary"}" style="border-radius:99px;font-size:11px;padding:4px 10px;" onclick="setQuoteViewTaxMode('detailed')">تفصيلي (قبل وبعد الضريبة)</button>
        <button type="button" id="qt-tax-btn-inclusive" class="btn btn-xs qt-tax-mode-btn ${u==="inclusive"?"btn-primary":"btn-secondary"}" style="border-radius:99px;font-size:11px;padding:4px 10px;" onclick="setQuoteViewTaxMode('inclusive')">شامل الضريبة فقط</button>
        <button type="button" id="qt-tax-btn-exclusive" class="btn btn-xs qt-tax-mode-btn ${u==="exclusive"?"btn-primary":"btn-secondary"}" style="border-radius:99px;font-size:11px;padding:4px 10px;" onclick="setQuoteViewTaxMode('exclusive')">غير شامل فقط</button>
      </div>
    </div>

    <div class="table-container mb-16" id="qt-view-table-container">
      ${dt(o,u)}
    </div>

    <div style="display:flex;justify-content:flex-end;margin-bottom:14px;">
      <div style="width:340px;border:1.5px solid var(--border-soft);border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        <div style="display:flex;justify-content:space-between;padding:8px 14px;border-bottom:1px solid var(--border-soft);background:#fff;">
          <span style="font-size:12px;color:var(--text-2);">المجموع الصافي (غير شامل الضريبة)</span>
          <span class="mono font-bold">${b(o.subtotal||o.grossTotal||0)}</span>
        </div>
        ${o.discountTotal>0?`<div style="display:flex;justify-content:space-between;padding:8px 14px;border-bottom:1px solid var(--border-soft);background:#fff;">
          <span style="font-size:12px;color:var(--text-2);">إجمالي الخصم</span>
          <span class="mono text-bad font-bold">- ${b(o.discountTotal||0)}</span></div>`:""}
        <div style="display:flex;justify-content:space-between;padding:8px 14px;border-bottom:1px solid var(--border-soft);background:rgba(217,119,6,0.06);">
          <span style="font-size:12px;color:#92400e;font-weight:700;">ضريبة القيمة المضافة (15%)</span>
          <span class="mono font-bold" style="color:#b45309;">${b(o.totalVat||0)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:12px 14px;background:var(--bg-2);">
          <span style="font-size:13.5px;font-weight:800;color:var(--text-1);">الإجمالي النهائي (شامل الضريبة)</span>
          <span class="mono text-brand font-bold" style="font-size:16px;">${b(o.grandTotal||0)}</span>
        </div>
      </div>
    </div>

    ${o.notes?`<div style="padding:10px 14px;background:var(--bg-2);border-radius:8px;font-size:12px;color:var(--text-2);margin-bottom:10px;border:1px solid var(--border-soft);">
      <strong>📝 ملاحظات:</strong> ${o.notes}</div>`:""}

    <div style="padding:10px 14px;background:var(--bg-2);border-radius:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;border:1px solid var(--border-soft);">
      <span style="font-size:12px;color:var(--text-2);font-weight:700;">تحديث الحالة:</span>
      ${r}
    </div>`,window._currentViewQuote=o,openModal("qt-view-modal")};window.printQuoteFromView=()=>{window._currentViewQuote&&printQuote(window._currentViewQuote.id)};window.printQuoteFromForm=()=>{M&&printQuote(M)};window.convertQuoteToInvoiceFromView=()=>{window._currentViewQuote&&convertQuoteToInvoice(window._currentViewQuote.id)};window.shareQuoteWhatsApp=()=>{const e=window._currentViewQuote;if(!e)return;const t={cash:"نقداً",net30:"30 يوم",net60:"60 يوم",custom:"حسب الاتفاق"},o=(e.items||[]).map((i,s)=>{const d=parseFloat(i.qty)||0,c=parseFloat(i.unitPrice)||0,r=i.taxCategory==="E"||i.taxCategory==="Z"?0:.15,a=Math.round(c*(1+r)*100)/100,u=d*c,l=u*(parseFloat(i.discount)||0)/100,m=u-l,f=Math.round(m*(1+r)*100)/100;return`${s+1}. *${i.productName}*
   الكمية: ${_(d)} ${i.unit||"كرتون"} × ${b(a)} (شامل 15%) = *${b(f)}*`}).join(`
`),n=["*📋 عرض سعر من إدهام للمواد الغذائية*",`رقم العرض: ${e.quoteNumber}`,`التاريخ: ${F(e.date)}`,`صالح حتى: ${F(e.expiryDate)}`,`العميل: ${e.customerName}`,`شروط الدفع: ${t[e.paymentTerms]||"—"}`,"─────────────────","*📦 تفاصيل الأصناف والأسعار (شاملة الضريبة):*",o,"─────────────────",`المجموع الصافي (غير شامل): ${b(e.subtotal||e.grossTotal||0)}`,e.discountTotal>0?`إجمالي الخصم: - ${b(e.discountTotal||0)}`:"",`ضريبة القيمة المضافة (15%): ${b(e.totalVat||0)}`,`*💰 الإجمالي النهائي المطلوب: ${b(e.grandTotal||0)}*`,"─────────────────",e.notes?`ملاحظات: ${e.notes}
─────────────────`:"","نشكركم لتعاملكم معنا 🙏"].filter(Boolean).join(`
`);window.open(`https://wa.me/?text=${encodeURIComponent(n)}`,"_blank")};window.updateQuoteStatus=async(e,t)=>{const o=j[t]?.label||t;if(await showConfirm(`تغيير حالة العرض إلى "${o}"؟`,"تحديث الحالة"))try{await G("quotations",e,{status:t}),showToast(`تم تحديث الحالة إلى: ${o}`,"success");const n=q.findIndex(i=>i.id===e);n!==-1&&(q[n].status=t),filterQuotes(),window._currentViewQuote?.id===e&&(window._currentViewQuote.status=t,viewQuote(e))}catch(n){showToast(n.message,"error")}};window.deleteQuote=async(e,t)=>{if(await showConfirm(`حذف عرض السعر رقم "${t||e}"؟ لا يمكن التراجع عن هذا الإجراء.`,"تأكيد الحذف"))try{await mt("quotations",e),showToast("تم حذف عرض السعر","success"),q=q.filter(o=>o.id!==e),filterQuotes()}catch(o){showToast(o.message,"error")}};window.convertQuoteToInvoice=async e=>{const t=q.find(o=>o.id===e);if(t){if(t.status==="converted"){showToast("تم تحويل هذا العرض مسبقاً","warn");return}if(await showConfirm(`تحويل العرض "${t.quoteNumber}" إلى فاتورة مبيعات جديدة?
سيُغَيَّر وضع العرض إلى "مُفوتَر".`,"تحويل لفاتورة"))try{sessionStorage.setItem("convert_quote",JSON.stringify({quoteId:t.id,quoteNumber:t.quoteNumber,customerId:t.customerId,customerName:t.customerName,repId:t.repId,repName:t.repName,items:(t.items||[]).map(n=>({productId:n.productId,productName:n.productName,unit:n.unit||"PCS",unitCode:"PCE",taxCategory:"S",qty:n.qty,unitPrice:n.unitPrice,discount:n.discount||0})),notes:t.notes||""})),await G("quotations",e,{status:"converted",convertedAt:new Date().toISOString()});const o=q.findIndex(n=>n.id===e);o!==-1&&(q[o].status="converted"),filterQuotes(),closeModal("qt-view-modal"),showToast("تم التحويل. افتح وحدة فواتير المبيعات لاستكمال الإنشاء.","success"),typeof navigate=="function"&&navigate("sales-invoices")}catch(o){showToast(o.message,"error")}}};window.printQuote=async e=>{const t=q.find(a=>a.id===e);if(!t){showToast("العرض غير موجود","error");return}let o="";const n={name:"شركة نظم الإمداد الحديثة",vatNumber:"310000000000003",address:"المملكة العربية السعودية - ينبع",phone:"0143900000",email:"info@idham-erp.com"};try{const{getDoc:a,doc:u}=await X(async()=>{const{getDoc:g,doc:w}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:g,doc:w}},[]),l=u(H,`companies/${U}/settings`,"company"),m=u(H,`companies/${U}/settings`,"logo"),[f,p]=await Promise.all([a(l),a(m)]);if(f.exists()){const g=f.data();g.name&&(n.name=g.name),g.vatNumber&&(n.vatNumber=g.vatNumber),g.address&&(n.address=g.address),g.phone&&(n.phone=g.phone),g.email&&(n.email=g.email)}p.exists()&&(o=p.data().dataUrl||"")}catch(a){console.warn("Failed to load company settings for print:",a)}const i={cash:"نقداً",net30:"30 يوم",net60:"60 يوم",custom:"حسب الاتفاق"},s={standard:"عادي",wholesale:"جملة",distributor:"موزع",special:"خاص"},d=window._quoteTaxViewMode||"detailed",c=(t.items||[]).map((a,u)=>{const l=parseFloat(a.qty)||0,m=parseFloat(a.unitPrice)||0,f=a.taxCategory==="E"||a.taxCategory==="Z"?0:.15,p=Math.round(m*f*100)/100,g=Math.round((m+p)*100)/100,w=l*m,v=parseFloat(a.discount)||0,y=w*v/100,h=w-y,P=Math.round(h*f*100)/100,B=Math.round((h+P)*100)/100,D=!!a.isCustom||String(a.productId||"").startsWith("adhoc_"),T=a.sku&&a.sku!=="بند حر"&&!a.sku.startsWith("adhoc_")&&!D;return`
      <tr>
        <td style="text-align:center; font-weight:700; color:#475569; font-size:11px;">${u+1}</td>
        <td style="padding:8px 10px;">
          <div style="font-size:12px; font-weight:700; color:#0f172a; line-height:1.4;">${a.productName}</div>
          ${T?`<div style="color:#64748b; font-size:9.5px; font-family:monospace; margin-top:1px;">كود: ${a.sku}</div>`:""}
        </td>
        <td style="text-align:center; font-weight:600; color:#334155; font-size:11px;">${a.unit||"كرتون"}</td>
        <td style="text-align:center; font-weight:800; color:#0f172a; font-size:12px;" class="mono">${_(l)}</td>
        <td style="text-align:left; font-weight:700; color:#0f172a; font-size:11.5px;" class="col-ex-price mono">${b(m)}</td>
        <td style="text-align:center; color:#b45309; font-weight:700; font-size:11.5px;" class="col-vat-amt mono">${b(p)}</td>
        <td style="text-align:left; font-weight:800; font-size:12px;" class="col-inc-price mono">
          <span style="background:rgba(30,58,138,0.08);padding:2px 6px;border-radius:4px;color:#1e3a8a;display:inline-block;">${b(g)}</span>
        </td>
        <td style="text-align:center; color:#64748b; font-size:11px;" class="col-disc mono">${v?`<span style="color:#dc2626;font-weight:700;">${v}%</span>`:"—"}</td>
        <td style="text-align:left; font-weight:800; color:#0f766e; font-size:12px;" class="col-ex-total mono">${b(h)}</td>
        <td style="text-align:left; font-weight:900; color:#0f766e; font-size:12.5px;" class="col-inc-total mono">${b(B)}</td>
      </tr>`}).join(""),r=window.open("","_blank");if(!r){showToast("يرجى السماح بالنوافذ المنبثقة للطباعة","warn");return}r.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>عرض سعر ${t.quoteNumber||""}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'IBM Plex Sans Arabic','Cairo',sans-serif;direction:rtl;color:#1e293b;background:#f1f5f9;font-size:12px;line-height:1.5;}

    /* ─── Toolbar ─── */
    .no-print{display:flex;gap:10px;justify-content:space-between;align-items:center;padding:10px 24px;background:#fff;border-bottom:2px solid #e2e8f0;position:sticky;top:0;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,0.08);flex-wrap:wrap;}
    .toolbar-modes{display:flex;align-items:center;gap:6px;background:#f8fafc;padding:4px 8px;border-radius:10px;border:1px solid #cbd5e1;}
    .toolbar-label{font-size:12px;font-weight:700;color:#334155;margin-left:6px;}
    .btn-mode{background:#fff;color:#475569;border:1px solid #cbd5e1;padding:6px 12px;border-radius:8px;cursor:pointer;font-family:inherit;font-size:12px;font-weight:700;transition:all 0.15s;}
    .btn-mode:hover{background:#f1f5f9;border-color:#94a3b8;}
    .btn-mode.active{background:#1e40af;color:#fff;border-color:#1e40af;box-shadow:0 2px 6px rgba(30,64,175,0.35);}
    .toolbar-actions{display:flex;align-items:center;gap:8px;}
    .btn{padding:8px 18px;border-radius:8px;cursor:pointer;border:none;font-family:inherit;font-size:12.5px;font-weight:700;transition:all 0.2s;display:inline-flex;align-items:center;gap:6px;}
    .btn-blue{background:linear-gradient(135deg,#1e40af,#2563eb);color:#fff;box-shadow:0 3px 10px rgba(37,99,235,0.35);}
    .btn-blue:hover{background:linear-gradient(135deg,#1e3a8a,#1d4ed8);transform:translateY(-1px);}
    .btn-green{background:linear-gradient(135deg,#047857,#059669);color:#fff;box-shadow:0 3px 10px rgba(5,150,105,0.3);}
    .btn-green:hover{transform:translateY(-1px);}
    .btn-gray{background:#64748b;color:#fff;}
    .btn-gray:hover{background:#475569;}

    /* ─── Mode display rules ─── */
    body.mode-detailed .col-ex-price { display: table-cell !important; }
    body.mode-detailed .col-vat-amt  { display: table-cell !important; }
    body.mode-detailed .col-inc-price{ display: table-cell !important; background: rgba(30,58,138,0.04); font-weight: 800; color: #1e3a8a; }
    body.mode-detailed .col-disc     { display: table-cell !important; }
    body.mode-detailed .col-ex-total { display: none !important; }
    body.mode-detailed .col-inc-total{ display: table-cell !important; }
    body.mode-detailed .tax-note-inc { display: none !important; }

    body.mode-inclusive .col-ex-price { display: none !important; }
    body.mode-inclusive .col-vat-amt  { display: none !important; }
    body.mode-inclusive .col-inc-price{ display: table-cell !important; font-weight: 800; color: #1e3a8a; }
    body.mode-inclusive .col-disc     { display: table-cell !important; }
    body.mode-inclusive .col-ex-total { display: none !important; }
    body.mode-inclusive .col-inc-total{ display: table-cell !important; }
    body.mode-inclusive .tax-note-inc { display: block !important; }

    body.mode-exclusive .col-ex-price { display: table-cell !important; }
    body.mode-exclusive .col-vat-amt  { display: none !important; }
    body.mode-exclusive .col-inc-price{ display: none !important; }
    body.mode-exclusive .col-disc     { display: table-cell !important; }
    body.mode-exclusive .col-ex-total { display: table-cell !important; }
    body.mode-exclusive .col-inc-total{ display: none !important; }
    body.mode-exclusive .tax-note-inc { display: none !important; }

    /* ─── Page ─── */
    .page{width:210mm;margin:12px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12);}

    /* ─── Dark Navy Header (matches logo color) ─── */
    .header-band{
      background:linear-gradient(135deg,#040d1f 0%,#0a1d4a 45%,#0f2d6b 100%);
      padding:20px 28px;
      position:relative;
      overflow:hidden;
    }
    .header-band::before{content:"";position:absolute;top:-60px;left:-60px;width:220px;height:220px;background:rgba(255,255,255,0.04);border-radius:50%;}
    .header-band::after{content:"";position:absolute;bottom:-80px;right:30px;width:270px;height:270px;background:rgba(255,255,255,0.03);border-radius:50%;}
    /* 3-column header layout */
    .header-grid{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:20px;position:relative;z-index:1;}
    /* Logo box */
    .logo-box{background:#fff;border-radius:12px;padding:8px 12px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.25);min-width:90px;min-height:80px;}
    .co-logo{max-height:80px;max-width:140px;object-fit:contain;display:block;}
    /* Company info (center) */
    .co-section{text-align:center;}
    .co-name{font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.3px;margin-bottom:6px;text-shadow:0 2px 8px rgba(0,0,0,0.3);}
    .co-line{font-size:10.5px;color:rgba(255,255,255,0.8);margin-bottom:3px;display:flex;align-items:center;justify-content:center;gap:5px;}
    /* Doc details (left in RTL = left side) */
    .doc-section{text-align:center;min-width:160px;}
    .doc-title-badge{
      background:rgba(255,255,255,0.14);
      border:2px solid rgba(255,255,255,0.3);
      border-radius:12px;
      padding:8px 18px;
      margin-bottom:10px;
      backdrop-filter:blur(8px);
    }
    .doc-title-ar{font-size:19px;font-weight:900;color:#fff;letter-spacing:2px;}
    .doc-title-en{font-size:9.5px;color:rgba(255,255,255,0.55);font-weight:400;margin-top:2px;letter-spacing:1.5px;}
    .doc-num-row{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:5px;}
    .doc-num-label{font-size:10px;color:rgba(255,255,255,0.6);}
    .doc-num-val{font-size:17px;font-weight:900;color:#fbbf24;font-family:monospace;letter-spacing:1.5px;}
    .doc-date-row{font-size:10.5px;color:rgba(255,255,255,0.78);text-align:center;margin-bottom:3px;}

    /* ─── Info Cards Strip ─── */
    .info-strip{display:grid;grid-template-columns:repeat(5,1fr);border-bottom:2px solid #e2e8f0;}
    .info-card{padding:10px 14px;border-left:1px solid #e2e8f0;background:#f8fafc;display:flex;align-items:flex-start;gap:8px;}
    .info-card:first-child{border-left:none;}
    .info-card:nth-child(even){background:#eef2ff;}
    .info-icon{font-size:18px;line-height:1;flex-shrink:0;margin-top:1px;}
    .info-label{font-size:9px;color:#64748b;font-weight:700;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.4px;}
    .info-val{font-size:11.5px;font-weight:700;color:#1e293b;}

    /* ─── Content ─── */
    .page-body{padding:16px 20px 14px;}

    /* ─── Table ─── */
    table{width:100%;border-collapse:collapse;font-size:11.5px;border-radius:8px;overflow:hidden;border:1px solid #cbd5e1;}
    thead tr{background:linear-gradient(90deg,#040d1f,#0f2d6b);}
    th{padding:10px 12px;color:#fff;font-weight:700;font-size:11px;text-align:right;border:none;letter-spacing:0.3px;}
    th:first-child{text-align:center;width:40px;}
    tbody tr:nth-child(even) td{background:#f8fafc;}
    tbody tr:nth-child(odd) td{background:#fff;}
    tbody tr:last-child td{border-bottom:none;}
    td{padding:8px 12px;border:none;border-bottom:1px solid #e2e8f0;color:#1e293b;vertical-align:middle;}
    td:first-child{text-align:center;color:#64748b;font-size:11px;}
    .td-num{text-align:left;font-family:monospace;}
    .td-center{text-align:center;}
    .td-net{color:#0f766e;font-weight:700;font-family:monospace;}

    /* ─── Totals ─── */
    .totals-wrap{display:flex;justify-content:flex-end;margin-top:14px;}
    .totals-box{width:320px;border-radius:10px;overflow:hidden;border:1px solid #dde6f0;box-shadow:0 2px 8px rgba(0,0,0,0.07);}
    .tot-row{display:flex;justify-content:space-between;align-items:center;padding:7px 14px;border-bottom:1px solid #e8eef6;background:#fff;}
    .tot-row:nth-child(even){background:#f8fafc;}
    .tot-label{font-size:11px;color:#475569;}
    .tot-val{font-size:12px;font-family:monospace;font-weight:700;color:#1e293b;}
    .tot-row.vat{background:#fffbeb;}
    .tot-row.vat .tot-label{color:#92400e;font-weight:600;}
    .tot-row.vat .tot-val{color:#b45309;}
    .tot-row.grand{background:linear-gradient(90deg,#040d1f,#0f2d6b);border-bottom:none;}
    .tot-row.grand .tot-label{font-size:13px;font-weight:800;color:#fff;}
    .tot-row.grand .tot-val{font-size:16px;font-weight:900;color:#fbbf24;}
    .tot-disc-val{color:#dc2626;font-family:monospace;font-weight:700;font-size:12px;}

    /* ─── Notes & Terms ─── */
    .notes-box{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:9px 14px;margin-top:12px;}
    .notes-title{font-size:10px;color:#92400e;font-weight:800;margin-bottom:3px;}
    .notes-text{font-size:11px;color:#78350f;line-height:1.5;}
    .terms-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:9px 14px;margin-top:8px;}
    .terms-title{font-size:10px;color:#166534;font-weight:800;margin-bottom:3px;}
    .terms-text{font-size:10.5px;color:#166534;line-height:1.5;}

    /* ─── Signatures ─── */
    .sig-section{display:grid;grid-template-columns:1fr auto 1fr;gap:20px;margin-top:18px;align-items:end;}
    .sig-box{text-align:center;}
    .sig-line{border-top:1.5px dashed #94a3b8;padding-top:6px;margin-top:30px;}
    .sig-label{font-size:10.5px;color:#64748b;font-weight:600;}
    .qr-ph{width:64px;height:64px;border:1.5px dashed #cbd5e1;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:8px;background:#f8fafc;margin:0 auto;}
    .qr-label{font-size:8.5px;color:#94a3b8;margin-top:3px;text-align:center;}

    /* ─── Footer ─── */
    .footer-band{
      background:linear-gradient(90deg,#040d1f,#0a1d4a);
      padding:9px 22px;
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-top:16px;
    }
    .footer-text{font-size:10px;color:rgba(255,255,255,0.68);}
    .footer-brand{font-size:11px;font-weight:700;color:rgba(255,255,255,0.9);}

    /* ─── Print ─── */
    @page{size:A4 portrait;margin:5mm 7mm;}
    @media print{
      body{background:#fff!important;}
      .no-print{display:none!important;}
      .page{margin:0!important;border-radius:0!important;box-shadow:none!important;width:100%!important;}
      *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
      tr{page-break-inside:avoid;}
    }
  </style>
</head>
<body class="mode-${d}">
  <div class="no-print">
    <div class="toolbar-modes">
      <span class="toolbar-label">نمط العرض والطباعة:</span>
      <button type="button" id="btn-mode-detailed" class="btn-mode ${d==="detailed"?"active":""}" onclick="setPrintMode('detailed')">تفصيلي (شامل وغير شامل)</button>
      <button type="button" id="btn-mode-inclusive" class="btn-mode ${d==="inclusive"?"active":""}" onclick="setPrintMode('inclusive')">شامل الضريبة فقط (15%)</button>
      <button type="button" id="btn-mode-exclusive" class="btn-mode ${d==="exclusive"?"active":""}" onclick="setPrintMode('exclusive')">غير شامل فقط</button>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-blue" onclick="window.print()">🖨️ طباعة العرض</button>
      <button class="btn btn-green" onclick="window.print()">📥 حفظ PDF</button>
      <button class="btn btn-gray" onclick="window.close()">✕ إغلاق</button>
    </div>
  </div>

  <div class="page">
    <!-- ══ ROYAL BLUE HEADER ══ -->
    <div class="header-band">
      <div class="header-grid">
        ${o?`<div class="logo-box"><img class="co-logo" src="${o}" alt="الشعار"></div>`:'<div class="logo-box" style="font-size:28px;color:#1e3a8a;">🏢</div>'}
        <div class="co-section">
          <div class="co-name">${n.name}</div>
          <div class="co-line">🏠 ${n.address}</div>
          <div class="co-line">📞 ${n.phone} &nbsp;|&nbsp; ✉️ ${n.email}</div>
          <div class="co-line">🧾 الرقم الضريبي: <strong style="color:#fbbf24;margin-right:3px;">${n.vatNumber}</strong></div>
        </div>
        <div class="doc-section">
          <div class="doc-title-badge">
            <div class="doc-title-ar">عـرض سـعـر</div>
            <div class="doc-title-en">PRICE QUOTATION</div>
          </div>
          <div class="doc-num-row">
            <span class="doc-num-label">📋 رقم:</span>
            <span class="doc-num-val">${t.quoteNumber||""}</span>
          </div>
          <div class="doc-date-row">📅 التاريخ: <strong style="color:#fff;">${F(t.date)}</strong></div>
          <div class="doc-date-row" style="margin-top:3px;">✅ صالح حتى: <strong style="color:#fbbf24;">${F(t.expiryDate)}</strong></div>
        </div>
      </div>
    </div>

    <!-- ══ INFO CARDS STRIP ══ -->
    <div class="info-strip">
      <div class="info-card">
        <span class="info-icon">👤</span>
        <div>
          <div class="info-label">العميل</div>
          <div class="info-val">${t.customerName||"—"}</div>
          ${t.deliveryAddress?`<div style="font-size:9.5px;color:#64748b;margin-top:1px;">📍 ${t.deliveryAddress}</div>`:""}
        </div>
      </div>
      <div class="info-card">
        <span class="info-icon">🧑‍💼</span>
        <div>
          <div class="info-label">المندوب</div>
          <div class="info-val">${t.repName||"—"}</div>
        </div>
      </div>
      <div class="info-card">
        <span class="info-icon">💳</span>
        <div>
          <div class="info-label">شروط الدفع</div>
          <div class="info-val">${i[t.paymentTerms]||t.paymentTerms||"—"}</div>
        </div>
      </div>
      <div class="info-card">
        <span class="info-icon">🏷️</span>
        <div>
          <div class="info-label">قائمة الأسعار</div>
          <div class="info-val">${s[t.priceList]||t.priceList||"—"}</div>
        </div>
      </div>
      <div class="info-card">
        <span class="info-icon">📊</span>
        <div>
          <div class="info-label">الحالة</div>
          <div class="info-val" style="color:#1d4ed8;">${j[t.status]?.label||t.status||"—"}</div>
        </div>
      </div>
    </div>

    <!-- ══ TABLE ══ -->
    <div class="page-body">
      <table>
        <thead>
          <tr>
            <th style="width:26px;text-align:center;">#</th>
            <th>الصنف والوصف</th>
            <th style="width:46px;" class="td-center">الوحدة</th>
            <th style="width:50px;" class="td-center">الكمية</th>
            <th style="width:88px;" class="col-ex-price td-num">السعر (غير شامل)</th>
            <th style="width:74px;" class="col-vat-amt td-center">الضريبة (15%)</th>
            <th style="width:105px;" class="col-inc-price td-num">السعر (شامل 15%)</th>
            <th style="width:46px;" class="col-disc td-center">خصم%</th>
            <th style="width:105px;" class="col-ex-total td-num">الإجمالي (غير شامل)</th>
            <th style="width:115px;" class="col-inc-total td-num">الإجمالي شامل الضريبة</th>
          </tr>
        </thead>
        <tbody>${c}</tbody>
      </table>
      <div class="tax-note-inc" style="font-size:10.5px;color:#64748b;margin-top:6px;font-style:italic;">* جميع أسعار الأصناف المعروضة بالجدول أعلاه شاملة ضريبة القيمة المضافة 15%.</div>

      <!-- ══ TOTALS ══ -->
      <div class="totals-wrap">
        <div class="totals-box">
          <div class="tot-row">
            <span class="tot-label">المجموع (غير شامل الضريبة)</span>
            <span class="tot-val">${b(t.grossTotal||t.subtotal||0)}</span>
          </div>
          ${t.discountTotal>0?`
          <div class="tot-row">
            <span class="tot-label">إجمالي الخصم</span>
            <span class="tot-disc-val">- ${b(t.discountTotal||0)}</span>
          </div>
          <div class="tot-row">
            <span class="tot-label">الصافي بعد الخصم</span>
            <span class="tot-val">${b(t.subtotal||0)}</span>
          </div>`:""}
          <div class="tot-row vat">
            <span class="tot-label">⚡ ضريبة القيمة المضافة (15%)</span>
            <span class="tot-val" style="color:#b45309;">${b(t.totalVat||0)}</span>
          </div>
          <div class="tot-row grand">
            <span class="tot-label">💰 الإجمالي النهائي (شامل الضريبة)</span>
            <span class="tot-val">${b(t.grandTotal||0)}</span>
          </div>
        </div>
      </div>

      ${t.notes?`<div class="notes-box"><div class="notes-title">📝 ملاحظات</div><div class="notes-text">${t.notes}</div></div>`:""}
      ${t.terms?`<div class="terms-box"><div class="terms-title">📋 الشروط والأحكام</div><div class="terms-text">${t.terms}</div></div>`:""}

      <!-- ══ SIGNATURES ══ -->
      <div class="sig-section">
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-label">توقيع مُعِدّ العرض</div>
        </div>
        <div style="text-align:center;">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&color=1e3a8a&data=${encodeURIComponent(`${n.name}
هاتف: ${n.phone}
إيميل: ${n.email}
الرقم الضريبي: ${n.vatNumber}
${n.address}`)}"
            alt="QR"
            style="width:90px;height:90px;border-radius:6px;border:2px solid #dde6f0;"
          >
          <div style="font-size:8.5px;color:#64748b;margin-top:4px;">معلومات الشركة</div>
        </div>
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-label">توقيع واعتماد العميل</div>
        </div>
      </div>
    </div>

    <!-- ══ FOOTER BAND ══ -->
    <div class="footer-band">
      <span class="footer-text">نشكركم لتعاملكم معنا — هذا العرض ملزم عند قبوله خطياً أو إلكترونياً.</span>
      <span class="footer-brand">${n.name}</span>
    </div>
  </div>

  <script>
    function setPrintMode(mode) {
      document.body.classList.remove('mode-detailed', 'mode-inclusive', 'mode-exclusive');
      document.body.classList.add('mode-' + mode);
      document.querySelectorAll('.btn-mode').forEach(function(b){ b.classList.remove('active'); });
      var el = document.getElementById('btn-mode-' + mode);
      if (el) el.classList.add('active');
    }
  <\/script>
</body>
</html>`),r.document.close()};window.exportQuotesCSV=()=>{try{const e=[["رقم العرض","التاريخ","الصلاحية","العميل","المندوب","الأصناف","إجمالي قبل خصم","الخصم","ما بعد الخصم","الضريبة","الإجمالي","الحالة"]];for(const n of q)e.push([n.quoteNumber||"",n.date||"",n.expiryDate||"",n.customerName||"",n.repName||"",(n.items||[]).length,n.grossTotal||0,n.discountTotal||0,n.subtotal||0,n.totalVat||0,n.grandTotal||0,j[n.status]?.label||n.status||""]);const t=e.map(n=>n.map(i=>`"${String(i).replace(/"/g,'""')}"`).join(",")).join(`
`),o=document.createElement("a");o.href=URL.createObjectURL(new Blob(["\uFEFF"+t],{type:"text/csv;charset=utf-8;"})),o.download=`quotations_${C()}.csv`,o.click(),showToast("تم تصدير الملف بنجاح","success")}catch(e){showToast(e.message,"error")}};let k=[];window._importedCustomerName="";let lt="file";async function qt(){return window.XLSX?window.XLSX:new Promise((e,t)=>{const o=document.createElement("script");o.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",o.onload=()=>e(window.XLSX),o.onerror=()=>t(new Error("فشل تحميل مكتبة قراءة ملفات Excel")),document.head.appendChild(o)})}async function It(){if(!window.pdfjsLib)return new Promise((e,t)=>{const o=document.createElement("script");o.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js",o.onload=()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js",e()},o.onerror=()=>t(new Error("فشل تحميل مكتبة معالجة الـ PDF")),document.head.appendChild(o)})}function $(e){return e?String(e).trim().replace(/[\u064B-\u065F\u0670]/g,"").replace(/[إأآا]/g,"ا").replace(/ة/g,"ه").replace(/[ىي]/g,"ي").replace(/\bكيلو\b|\bكغ\b/g,"ك").replace(/\bجرام\b|\bغرام\b/g,"جم").replace(/\bقطعة\b|\bقطعه\b/g,"حبة").replace(/[()\[\]{}\-_\/\\.,:;+*="']/g," ").replace(/\s+/g," ").toLowerCase():""}window.switchImportTab=e=>{lt=e;const t=document.getElementById("import-pane-file"),o=document.getElementById("import-pane-paste"),n=document.getElementById("tab-btn-file"),i=document.getElementById("tab-btn-paste");if(e==="file")t&&t.classList.remove("hidden"),o&&o.classList.add("hidden"),n&&(n.classList.remove("btn-secondary"),n.classList.add("btn-primary")),i&&(i.classList.remove("btn-primary"),i.classList.add("btn-secondary"));else{t&&t.classList.add("hidden"),o&&o.classList.remove("hidden"),i&&(i.classList.remove("btn-secondary"),i.classList.add("btn-primary")),n&&(n.classList.remove("btn-primary"),n.classList.add("btn-secondary"));const s=document.getElementById("qt-import-paste-area");s&&setTimeout(()=>s.focus(),100)}};window.openQuotationImportModal=()=>{k=[],window._importedCustomerName="";const e=document.getElementById("qt-import-error"),t=document.getElementById("qt-import-loading"),o=document.getElementById("qt-import-preview-area"),n=document.getElementById("import-pane-file"),i=document.getElementById("qt-import-submit-btn"),s=document.getElementById("qt-import-reupload-btn"),d=document.getElementById("qt-import-file-input"),c=document.getElementById("qt-import-paste-area");e&&e.classList.add("hidden"),t&&t.classList.add("hidden"),o&&o.classList.add("hidden"),n&&n.classList.remove("hidden"),i&&(i.disabled=!0),s&&(s.style.display="none"),d&&(d.value=""),c&&(c.value=""),switchImportTab("file"),openModal("qt-import-modal")};window.openPdfImportModal=window.openQuotationImportModal;window.resetQuotationImport=()=>{k=[];const e=document.getElementById("qt-import-preview-area"),t=document.getElementById("qt-import-reupload-btn"),o=document.getElementById("qt-import-submit-btn"),n=document.getElementById("qt-import-file-input");e&&e.classList.add("hidden"),t&&(t.style.display="none"),o&&(o.disabled=!0),n&&(n.value=""),switchImportTab(lt)};function Q(e){const t=document.getElementById("qt-import-error");t&&(t.textContent=e,t.classList.remove("hidden"));const o=document.getElementById("qt-import-loading");o&&o.classList.add("hidden")}function V(e,t="جارٍ قراءة البيانات ومطابقة الأصناف..."){const o=document.getElementById("qt-import-loading"),n=document.getElementById("qt-import-loading-text"),i=document.getElementById("qt-import-error");i&&i.classList.add("hidden"),o&&(e?o.classList.remove("hidden"):o.classList.add("hidden")),n&&t&&(n.textContent=t)}window.handleQuotationFileDrop=e=>{e.preventDefault();const t=e.dataTransfer.files;t.length>0&&ct(t[0])};window.handleQuotationFileInput=e=>{const t=e.target.files[0];t&&ct(t)};async function ct(e){const t=(e.name||"").toLowerCase(),o=t.endsWith(".pdf")||e.type==="application/pdf",n=t.endsWith(".xlsx")||t.endsWith(".xls")||t.endsWith(".csv")||e.type.includes("sheet")||e.type.includes("excel")||e.type.includes("csv");o?await Pt(e):n?await kt(e):Q("نوع الملف غير مدعوم. يرجى اختيار ملف Excel (.xlsx / .xls / .csv) أو ملف PDF.")}async function kt(e){V(!0,"جارٍ قراءة وتحليل ملف الإكسيل ومطابقة الأصناف لغوياً...");try{const t=await qt(),o=new FileReader;o.onload=async n=>{try{const i=new Uint8Array(n.target.result),s=t.read(i,{type:"array"});if(!s.SheetNames||s.SheetNames.length===0)throw new Error("الملف لا يحتوي على أي صفحات عمل (Sheets).");const d=s.SheetNames[0],c=s.Sheets[d],r=t.utils.sheet_to_json(c,{header:1,defval:""}),a=ut(r);J(a)}catch(i){Q(i.message||"حدث خطأ أثناء قراءة ملف الإكسيل")}},o.readAsArrayBuffer(e)}catch(t){Q(t.message)}}window.handlePastedQuotationText=()=>{const t=(document.getElementById("qt-import-paste-area")?.value||"").trim();if(!t){Q("يرجى لصق بيانات الجدول في المربع أولاً.");return}V(!0,"جارٍ تحليل النصوص المنسوخة ومطابقة الأصناف...");try{const n=t.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).map(s=>s.split("	").map(d=>d.trim())),i=ut(n);J(i)}catch(o){Q(o.message||"حدث خطأ أثناء تحليل البيانات المنسوخة")}};async function Pt(e){V(!0,"جارٍ تحليل وقراءة ملف الـ PDF واستخراج البنود...");try{await It();const t=await e.arrayBuffer(),o=await $t(t);if(!o.items||o.items.length===0)throw new Error("لم نتمكن من استخلاص أي أصناف من جدول عرض السعر في ملف الـ PDF. يرجى التأكد من أن الملف يحتوي على جدول أصناف مقروء.");J(o)}catch(t){Q(t.message)}}async function $t(e){const t=await window.pdfjsLib.getDocument({data:e}).promise,o=[];let n="",i=!1,s=!1;for(let d=1;d<=t.numPages;d++){const a=((await(await t.getPage(d)).getTextContent()).items||[]).filter(f=>f&&typeof f.str=="string"&&f.str.trim().length>0);if(a.length===0)continue;a.sort((f,p)=>p.transform[5]-f.transform[5]);const u=[];let l=null;const m=8;for(const f of a){const p=f.transform[5];!l||Math.abs(l.y-p)>m?(l={y:p,items:[f]},u.push(l)):l.items.push(f)}for(const f of u){const p=[...f.items].sort((v,y)=>y.transform[4]-v.transform[4]),g=p.map(v=>v.str.trim()).filter(Boolean).join(" ");if(!g)continue;if(!i&&!n){if(s){const v=g.match(/^(.+?)(?:\s+(?:السيد|المندوب|حسب|مسودة|نقدي|آجل|قائمة)|$)/i);v&&v[1]&&(n=v[1].trim()),s=!1}else if(g.includes("👤")&&g.includes("العميل")){const v=g.match(/(?:العميل|Customer)\s*[:\-–]\s*([^\n\r]+)/i);if(v&&v[1]&&v[1].trim().length>1){let y=v[1].replace(/(?:المندوب|الدفع|شروط|رشوط|التاريخ|الرقم|الموافق|قائمة|الحالة|ر\.?س|SAR|CR|VAT).*/i,"").trim();y.length>=2&&!y.includes("المندوب")&&(n=y)}else s=!0}else if(g.includes("العميل")||g.includes("السيد")||g.includes("السادة")||g.includes("Customer")){const v=g.match(/(?:العميل|السيد|السادة|المحترم|Customer|Client)\s*[:\-–]?\s*([^\n\r]+)/i);if(v&&v[1]){let y=v[1].replace(/(?:المندوب|الدفع|شروط|رشوط|التاريخ|الرقم|الموافق|قائمة|الحالة|ر\.?س|SAR|CR|VAT).*/i,"").replace(/الرقم\s*الضريبي.*$/i,"").replace(/المنافسين.*$/i,"").replace(/العنوان.*$/i,"").replace(/س\.?ت.*$/i,"").trim();y.length>=2&&!/^(لا\s*يوجد|عام|عميل)$/i.test(y)&&!y.includes("المندوب")&&(n=y)}}}if(Et(g)){i=!0;continue}if(i&&zt(g)){i=!1;continue}if(!i||pt(g)||g.includes("شامل )")||g.includes(")%15("))continue;const w=Tt(p,g);w&&o.push(w)}}return{items:o,detectedCustomer:n}}function Et(e){const t=/البيان|الصنف|الوصف|اسم\s*الصنف|المادة|Description|Item/i.test(e),o=/السعر|الكمية|الوحدة|ر\.?\s*الصنف|الصافي|الإجمالي|Price|Qty|Unit|Total/i.test(e);return t&&o}function zt(e){return/المجموع\s*العام|إجمالي\s*الضريبة|صافي\s*القيمة|المجموع\s*[:\-–\(]|الإجمالي\s*النهائي|اإلجمايل\s*النهايئ|فقط\s*وقدره|توقيع\s*المستلم|ختم\s*الشركة|الشروط\s*والأحكام|الرشوط\s*واألحكام|الأسعار\s*سارية/i.test(e)}function pt(e){if(!e||e.trim().length<2)return!0;const t=e.trim();return!!(/شركة\s+.*التجارية|رشكة\s+.*|Trading\s+Co|Al-Rafada/i.test(t)||/Build\s+\d+|شارع\s+|حي\s+|مبنى|مبىن|Yamaniya|Tabara/i.test(t)||/الرقم\s*الضريبي|الرض\s*يب|Tax\s*Number|السجل\s*التجاري|C\.?R\.?|ص\.?ب|P\.?O\.?\s*Box/i.test(t)||/هاتف|تلفون|جوال|فاكس|Tel\b|Mobile\b|Fax\b/i.test(t)||/عرض\s*سعر\s*مبيعات|عرض\s*بيع/i.test(t)||/المركز\s*الرئيسي|م\.\s*الرئيسي/i.test(t)||/المستودع\s*[:\-]|المندوب\s*[:\-]|التاريخ\s*[:\-]|الموافق\s*[:\-]|الوقت\s*[:\-]|النوع\s*[:\-]|مرجع\s*[:\-]/i.test(t)||/الصفحة\s+\d+\s+من\s+\d+|Page\s+\d+\s+of\s+\d+/i.test(t)||/المنافسين|العنوان\s*[:\-]/i.test(t)||/العميل\s*[:\-]/i.test(t)||/^[\d\s\-\+\(\)\/]{7,}$/.test(t.replace(/\s+/g,"")))}function Tt(e,t){const o=e.map(f=>f.str.trim()).filter(f=>f&&!["ر","س",".","ر.س","—","ر.س.","SAR"].includes(f));if(o.length<2||pt(t))return null;const n=/^(بالة|كيس|كرتون|كرتونة|كرتونه|حبة|حبه|علبة|علبه|كيلو|كجم|كغ|شد|شدة|قطعة|قطعه|بكت|باكت|درزن|صندوق|طبق|طرد|برميل|جالون|لتر|لرت|تنك|طن|رول|شوال|PCS|BOX|CTN|BAG|KG|PAC|BALE)$/i,i=f=>/^[%]?\s*[\d,]+(\.\d+)?\s*[%]?$/.test(f.trim());let s=-1;for(let f=o.length-1;f>=0&&i(o[f]);f--)s=f;let d="حبة",c="",r="",a=1,u=0;if(s!==-1&&s>0){const f=s-1,p=o[f];let g=f;if(n.test(p))d=p;else for(let h=f;h>=Math.max(0,f-2);h--)if(n.test(o[h])){d=o[h],g=h;break}const w=o.slice(0,g);let v=0;w.length>0&&/^\d{1,4}$/.test(w[0])&&(v=1),w.length>v&&/^(\d{2,5}[-\/]\d{2,5}|\d{4,10}|[A-Z0-9]{3,8})$/i.test(w[v])&&(r=w[v],v++),c=w.slice(v).join(" ").trim();const y=[];o.slice(s).forEach(h=>{if(h.includes("%")&&!h.match(/\d+\.\d+/))return;const P=h.replace(/[^\d.]/g,""),B=parseFloat(P);!isNaN(B)&&P.length>0&&P.length<9&&y.push(B)}),y.length>=2?(a=y[0],u=y[1]):y.length===1&&(u=y[0])}else{const f=[],p=[];o.forEach((g,w)=>{const v=g.replace(/[^\d.]/g,""),y=parseFloat(v);!isNaN(y)&&v.length>0&&v.length<9&&/^[\d.%]+$/.test(g)?w===0&&/^\d{1,3}$/.test(v)||p.push(y):n.test(g)?d=g:/^\d{2,5}[-\/]\d{2,5}$/.test(g)?r=g:g.length>1&&!["*","x","-","=","/","+","—","%"].includes(g)&&f.push(g)}),c=f.join(" ").trim(),p.length>=2?(a=p[0],u=p[1]):p.length===1&&(u=p[0])}if(!c||c.length<2||c.includes("شامل )")||c.includes("%15")||!/[\p{L}]/u.test(c)||u<=0||u>1e6)return null;a<=0&&(a=1);const l=document.getElementById("qt-import-tax-mode")?.value||"exclusive";let m=u;return l==="inclusive"&&u>0&&(m=Math.round(u/1.15*100)/100),{included:!0,rawName:c,sku:r,unit:d||"حبة",qty:a,unitPrice:Math.round(m*100)/100,rawExcelPrice:u,discount:0,matchedProductId:"",matchStatus:"adhoc",matchScore:0}}function ut(e){if(!e||e.length===0)throw new Error("الملف أو النص فارغ ولا يحتوي على أي بيانات.");let t="";for(let a=0;a<Math.min(6,e.length);a++){const u=(e[a]||[]).map(l=>String(l||"").trim()).filter(Boolean).join(" ");if(u.includes("عرض سعر")||u.includes("عرض اسعار")||u.includes("العميل")||u.includes("السيد")||u.includes("السادة")){const l=u.match(/(?:عرض\s*سعر|عرض\s*اسعار|العميل|السيد|السادة)\s*[-:\/]?\s*(.+)/i);if(l&&l[1]){let m=l[1].replace(/[-_]/g," ").trim();if(m=m.replace(/^المحترم(ين)?/i,"").replace(/رقم\s*\d+.*$/i,"").trim(),m&&!m.includes("مبيعات")&&!m.includes("تقرير")){t=m;break}}}}let o=-1;const n={name:-1,unit:-1,qty:-1,priceBefore:-1,priceIncl:-1,pricePlain:-1,priceAfterDisc:-1,disc:-1,sku:-1,vat:-1,totalIncl:-1};for(let a=0;a<Math.min(10,e.length);a++){const u=e[a];if(!Array.isArray(u)||u.length<2)continue;const l=u.map(m=>String(m||"").trim().toLowerCase()).join(" ");if((l.includes("اسم")||l.includes("صنف")||l.includes("بيان")||l.includes("وصف")||l.includes("مادة")||l.includes("ماده"))&&(l.includes("سعر")||l.includes("كمي")||l.includes("وحد")||l.includes("إجمالي")||l.includes("اجمالي"))){o=a,u.forEach((m,f)=>{const p=String(m||"").trim().toLowerCase();p&&((p.includes("اسم")||p.includes("صنف")||p.includes("بيان")||p.includes("وصف")||p.includes("مادة")||p.includes("ماده")||p==="item"||p==="product"||p==="description")&&!p.includes("رقم")&&!p.includes("كود")&&!p.includes("رمز")?n.name===-1&&(n.name=f):p.includes("صنف")&&p.includes("رقم")||p.includes("كود")||p.includes("رمز")||p==="sku"||p==="code"?n.sku===-1&&(n.sku=f):p.includes("وحد")||p==="unit"||p==="uom"?n.unit===-1&&(n.unit=f):p.includes("كمي")||p.includes("عدد")||p==="qty"||p==="quantity"?n.qty===-1&&(n.qty=f):p.includes("خصم")||p==="disc"||p==="discount"?n.disc===-1&&(n.disc=f):p.includes("قبل")&&p.includes("ضريب")?n.priceBefore=f:p.includes("شامل")&&p.includes("ضريب")&&!p.includes("إجمالي")&&!p.includes("اجمالي")?n.priceIncl=f:(p.includes("إجمالي")||p.includes("اجمالي"))&&p.includes("شامل")?n.totalIncl=f:p.includes("ضريب")&&!p.includes("سعر")&&!p.includes("قبل")&&!p.includes("شامل")?n.vat=f:p.includes("بعد")&&p.includes("خصم")?n.priceAfterDisc=f:(p.includes("سعر")||p==="price"||p==="rate")&&!p.includes("بعد")&&!p.includes("شامل")&&!p.includes("إجمالي")&&!p.includes("اجمالي")&&!p.includes("قبل")&&n.pricePlain===-1&&(n.pricePlain=f))});break}}let i=-1,s=!1;if(n.priceBefore!==-1?(i=n.priceBefore,s=!1):n.pricePlain!==-1?(i=n.pricePlain,s=!1):n.priceAfterDisc!==-1?(i=n.priceAfterDisc,s=!1):n.priceIncl!==-1&&(i=n.priceIncl,s=!0),o===-1){o=-1;let a=0,u=0;const l=(e[0]||[]).length;for(let m=0;m<l;m++){let f=0,p=0;for(let w=0;w<Math.min(10,e.length);w++){const v=String(e[w][m]||"").trim();isNaN(parseFloat(v))&&v.length>2&&(f+=v.length,p++)}const g=p>0?f/p:0;g>u&&(u=g,a=m)}n.name=a,n.unit=a+1<l?a+1:-1,n.qty=a+2<l?a+2:-1,n.pricePlain=a+3<l?a+3:-1,i=n.pricePlain,s=!1}const d=document.getElementById("qt-import-tax-mode");d&&(d.value=s?"inclusive":"exclusive");const c=[],r=d?.value==="inclusive"||s;for(let a=o+1;a<e.length;a++){const u=e[a];if(!u||u.length===0)continue;const l=n.name!==-1?String(u[n.name]||"").trim():"";if(!l||l.length<2)continue;const m=l.toLowerCase();if(m.includes("اجمالي")||m.includes("إجمالي")||m.includes("مجموع")||m.includes("total")||m.includes("ضريبة")||m.includes("vat")||m.includes("فقط وقدره")||m.includes("الشروط")||m.includes("توقيع"))continue;const f=n.sku!==-1?String(u[n.sku]||"").trim():"",p=n.unit!==-1?String(u[n.unit]||"").trim():"حبة";let g=n.qty!==-1?u[n.qty]:1,w=parseFloat(String(g).replace(/[^\d.]/g,""))||1;w<=0&&(w=1);let v=i!==-1?u[i]:0,y=parseFloat(String(v).replace(/[^\d.]/g,""))||0,h=y;r&&y>0?h=Math.round(y/1.15*100)/100:h=Math.round(y*100)/100;let P=n.disc!==-1?u[n.disc]:0,B=parseFloat(String(P).replace(/[^\d.]/g,""))||0;c.push({included:!0,rawName:l,sku:f,unit:p||"حبة",qty:w,unitPrice:h,rawExcelPrice:y,discount:B,matchedProductId:"",matchStatus:"adhoc",matchScore:0})}if(c.length===0)throw new Error("لم يتم العثور على أسطر أصناف صالحة في الملف أو النص.");return{items:c,detectedCustomer:t}}function Bt(e){e.forEach(t=>{t.matchedProductId="",t.matchStatus="adhoc",t.matchScore=0})}function J(e){k=e.items,Bt(k),V(!1);const t=document.getElementById("import-pane-file"),o=document.getElementById("import-pane-paste"),n=document.getElementById("qt-import-preview-area"),i=document.getElementById("qt-import-submit-btn"),s=document.getElementById("qt-import-reupload-btn"),d=document.getElementById("qt-import-detected-customer"),c=document.getElementById("qt-import-customer-status");if(t&&t.classList.add("hidden"),o&&o.classList.add("hidden"),n&&n.classList.remove("hidden"),i&&(i.disabled=!1),s&&(s.style.display="inline-flex"),window._importedCustomerName=e.detectedCustomer||"",d&&(d.value=window._importedCustomerName),c)if(window._importedCustomerName){const r=window._importedCustomerName.split(" ").reverse().join(" "),a=S.find(u=>$(u.name).includes($(window._importedCustomerName))||$(window._importedCustomerName).includes($(u.name))||$(u.name).includes($(r))||$(r).includes($(u.name)));a?(window._importedCustomerName=a.name,d&&(d.value=a.name),c.innerHTML=`✅ متطابق مع العميل: <strong>${a.name}</strong>`):c.innerHTML="ℹ️ سيتم استخدامه كاسم عميل في العرض"}else c.innerHTML="(يمكنك كتابة اسم العميل أعلاه)";R()}window.reapplyTaxModeToImported=()=>{if(!k||k.length===0)return;const e=document.getElementById("qt-import-tax-mode")?.value==="inclusive";k.forEach(t=>{e&&t.rawExcelPrice>0?t.unitPrice=Math.round(t.rawExcelPrice/1.15*100)/100:t.unitPrice=Math.round(t.rawExcelPrice*100)/100}),R()};function R(){const e=document.getElementById("qt-import-parsed-tbody");e&&(e.innerHTML=k.map((t,o)=>{const n=parseFloat(t.qty)||0,i=parseFloat(t.unitPrice)||0,s=n*i,d=s*(parseFloat(t.discount)||0)/100,c=s-d,r=Math.round(c*.15*100)/100,a=Math.round((c+r)*100)/100,u=Math.round(i*1.15*100)/100;return`
      <tr style="${t.included?"":"opacity:0.45;background:#f8fafc;"}">
        <td style="text-align:center;">
          <input type="checkbox" ${t.included?"checked":""} onchange="toggleImportItemIncluded(${o}, this.checked)" />
        </td>
        <td style="text-align:center;color:var(--text-3);font-size:11px;">${o+1}</td>
        <td>
          <input type="text" class="input sm" style="font-weight:700;color:var(--text-0);font-size:12px;width:100%;"
            value="${(t.rawName||"").replace(/"/g,"&quot;")}" onchange="updateImportItem(${o}, 'rawName', this.value)" />
        </td>
        <td style="text-align:center;">
          <span style="font-family:monospace;font-size:11.5px;color:var(--text-2);">${t.sku||"—"}</span>
        </td>
        <td style="text-align:center;">
          <input type="text" class="input sm" style="width:70px;height:26px;text-align:center;font-size:11px;padding:2px;"
            value="${t.unit||"حبة"}" onchange="updateImportItem(${o}, 'unit', this.value)" />
        </td>
        <td style="text-align:center;">
          <input type="number" class="input sm mono font-bold" style="width:65px;height:26px;text-align:center;font-size:12px;padding:2px;"
            value="${t.qty}" min="0.001" step="0.001" onchange="updateImportItem(${o}, 'qty', this.value)" />
        </td>
        <td>
          <input type="number" class="input sm mono font-bold" style="width:90px;height:26px;font-size:12px;padding:2px;"
            value="${t.unitPrice}" min="0" step="0.01" onchange="updateImportItem(${o}, 'unitPrice', this.value)" />
        </td>
        <td class="mono font-bold" style="color:#1e40af;font-size:11.5px;">
          ${b(u)}
        </td>
        <td style="text-align:center;">
          <input type="number" class="input sm mono" style="width:50px;height:26px;text-align:center;font-size:11px;padding:2px;"
            value="${t.discount||0}" min="0" max="100" step="0.5" onchange="updateImportItem(${o}, 'discount', this.value)" />
        </td>
        <td class="mono font-bold text-good" style="font-size:12.5px;">
          ${b(a)}
        </td>
      </tr>
    `}).join(""),Lt())}window.toggleAllImportedItems=e=>{k.forEach(t=>t.included=e),R()};window.toggleImportItemIncluded=(e,t)=>{k[e]&&(k[e].included=t,R())};window.updateImportItem=(e,t,o)=>{const n=k[e];n&&(t==="rawName"?n.rawName=o:t==="qty"?n.qty=parseFloat(o)||1:t==="unitPrice"?(n.unitPrice=parseFloat(o)||0,n.rawExcelPrice=n.unitPrice):t==="discount"?n.discount=parseFloat(o)||0:t==="unit"&&(n.unit=o),R())};function Lt(){const e=k.length,t=k.filter(a=>a.included);let o=0;t.forEach(a=>{const u=(parseFloat(a.qty)||0)*(parseFloat(a.unitPrice)||0),l=u*(parseFloat(a.discount)||0)/100;o+=u-l});const n=Math.round(o*.15*100)/100,i=Math.round((o+n)*100)/100,s=document.getElementById("qt-stat-total-items");s&&(s.textContent=`📦 ${t.length} من ${e} صنف (استيراد مباشر بنود حرة)`);const d=document.getElementById("qt-import-tot-gross"),c=document.getElementById("qt-import-tot-vat"),r=document.getElementById("qt-import-tot-grand");d&&(d.textContent=b(o)),c&&(c.textContent=b(n)),r&&(r.textContent=b(i))}window.submitImportedQuotationItems=()=>{const e=(k||[]).filter(s=>s.included);if(e.length===0){showToast("يرجى تحديد صنف واحد على الأقل للاستيراد","warn");return}const t=(document.getElementById("qt-import-detected-customer")?.value||"").trim()||window._importedCustomerName||"";let o=null;t&&(o=S.find(s=>$(s.name).includes($(t))||$(t).includes($(s.name))));const n=e.map((s,d)=>{const c=parseFloat(s.qty)||1,r=parseFloat(s.unitPrice)||0,a=parseFloat(s.discount)||0;return{productId:"adhoc_"+Date.now()+"_"+d+"_"+Math.random().toString(36).substring(2,6),productName:s.rawName,sku:s.sku||"",unit:s.unit||"حبة",qty:c,unitPrice:r,discount:a,cost:0,lastPurchasePrice:0,margin:0,isCustom:!0,taxCategory:"S"}});closeModal("qt-import-modal");const i={customerName:o?o.name:t,customerId:o?o.id:t?"adhoc_customer":"",items:n};openQuoteForm(i),showToast(`✨ تم استيراد وتجهيز ${n.length} صنفاً بأسمائها الأصلية بدقة 100%!`,"success")};window._adhocRowToReplaceIndex=null;window.addCustomQuoteLine=(e="")=>{const t=document.getElementById("qt-product-search"),o=document.getElementById("qt-product-results");t&&(t.value=""),o&&o.classList.add("hidden");const n="adhoc_"+Date.now()+"_"+Math.random().toString(36).substring(2,6),i=document.getElementById("qt-pricelist")?.value||"standard";let s=I.retailMargin||10;i==="wholesale"&&(s=I.wholesaleMargin||7),i==="distributor"&&(s=I.distributorMargin||5),x.unshift({productId:n,productName:e||"بند حر جديد",sku:"",unit:"كرتون",qty:1,cost:0,lastPurchasePrice:0,margin:s,unitPrice:0,discount:0,isCustom:!0}),z(),showToast("تمت إضافة بند حر بأعلى الجدول ✨","info"),setTimeout(()=>{const d=document.querySelector("#qt-lines-tbody tr:first-child");if(d)if(e){const c=d.querySelector(".qt-line-qty");c&&(c.focus(),c.select())}else{const c=d.querySelector("input[placeholder*='اسم']");c&&(c.focus(),c.select())}},50)};window.openQuickAddProductModal=(e="",t=null)=>{window._adhocRowToReplaceIndex=t??null;const o=document.getElementById("qt-qp-name"),n=document.getElementById("qt-qp-sku"),i=document.getElementById("qt-qp-unit"),s=document.getElementById("qt-qp-category"),d=document.getElementById("qt-qp-cost"),c=document.getElementById("qt-qp-margin"),r=document.getElementById("qt-qp-price"),a=document.getElementById("qt-qp-error"),u=document.getElementById("qt-qp-title");if(a&&a.classList.add("hidden"),s&&(s.innerHTML='<option value="">(بدون تصنيف)</option>'+W.map(l=>`<option value="${l.id}">${l.name}</option>`).join("")),t!=null&&x[t]){const l=x[t];u&&(u.textContent="تسجيل البند الحر كصنف دائم بالكتالوج"),o&&(o.value=l.productName||""),n&&(n.value="SKU-"+Math.floor(1e5+Math.random()*9e5)),i&&(i.value=l.unit||"كرتون"),d&&(d.value=l.cost||0),c&&(c.value=l.margin||10),r&&(r.value=l.unitPrice||0)}else u&&(u.textContent="إضافة صنف جديد سريع إلى الكتالوج"),o&&(o.value=e||""),n&&(n.value="SKU-"+Math.floor(1e5+Math.random()*9e5)),i&&(i.value="كرتون"),d&&(d.value="0"),c&&(c.value=I.retailMargin||10),r&&(r.value="0");calcQuickProductPrice("cost"),openModal("qt-quick-product-modal"),setTimeout(()=>{o.value?parseFloat(d.value)<=0&&d.focus():o.focus()},150)};window.registerAdhocProduct=e=>{window.openQuickAddProductModal("",e)};window.calcQuickProductPrice=(e="cost")=>{const t=parseFloat(document.getElementById("qt-qp-cost")?.value)||0,o=parseFloat(document.getElementById("qt-qp-margin")?.value)||0,n=document.getElementById("qt-qp-price"),i=document.getElementById("qt-qp-vat-hint");if(e==="price"){const d=parseFloat(n?.value)||0;if(t>0&&n){const c=Math.round((d/t-1)*100*10)/10,r=document.getElementById("qt-qp-margin");r&&(r.value=c)}}else if(n){const d=t>0?Math.round(t*(1+o/100)*100)/100:parseFloat(n.value)||0;n.value=d}const s=parseFloat(n?.value)||0;if(i){const d=Math.round(s*1.15*100)/100;i.textContent=`السعر شامل الضريبة (15%): ${b(d)}`}};window.saveQuickProduct=async()=>{const e=document.getElementById("qt-qp-name")?.value.trim(),t=document.getElementById("qt-qp-error");if(!e){t&&(t.textContent="يرجى كتابة اسم الصنف.",t.classList.remove("hidden"));return}const o=document.getElementById("qt-qp-sku")?.value.trim()||"SKU-"+Date.now().toString().slice(-6),n=document.getElementById("qt-qp-unit")?.value.trim()||"كرتون",i=document.getElementById("qt-qp-category")?.value||"",s=parseFloat(document.getElementById("qt-qp-cost")?.value)||0,d=parseFloat(document.getElementById("qt-qp-price")?.value)||0,c=parseFloat(document.getElementById("qt-qp-margin")?.value)||0,r=document.getElementById("qt-qp-save-btn");r&&(r.disabled=!0);try{const a={name:e,nameAr:e,sku:o,unit:n,category:i,costPrice:s,purchasePrice:s,lastPurchasePrice:s,avgCostPrice:s,salePrice:d,priceRetail:d,priceWholesale:d,priceDistributor:d,taxCategory:"S",createdAt:new Date().toISOString()},u=await nt(L.products(),a),l=typeof u=="string"?u:u?.id||"p_"+Date.now();if(a.id=l,E.push(a),window._adhocRowToReplaceIndex!==null&&window._adhocRowToReplaceIndex!==void 0&&x[window._adhocRowToReplaceIndex]){const p=window._adhocRowToReplaceIndex;x[p].productId=l,x[p].productName=e,x[p].sku=o,x[p].unit=n,x[p].cost=s,x[p].lastPurchasePrice=s,x[p].unitPrice=d,x[p].margin=c,x[p].isCustom=!1,window._adhocRowToReplaceIndex=null}else window.addQtProduct(l,e,d,n,o,s);z(),closeModal("qt-quick-product-modal"),showToast(`تم تسجيل الصنف "${e}" بالكتالوج وإدراجه بنجاح ✨`,"success");const m=document.getElementById("qt-product-search");m&&(m.value="");const f=document.getElementById("qt-product-results");f&&f.classList.add("hidden")}catch(a){t&&(t.textContent="حدث خطأ: "+a.message,t.classList.remove("hidden"))}finally{r&&(r.disabled=!1)}};export{Dt as render};
