import{t as w,_ as O,d as C,a as j,g as P,C as I,p as H,f as u,x as R,u as F,n as ot,k as U,r as nt}from"./index-HrCilPJ3.js";import{orderBy as z,query as st,limit as at,getDocs as it}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let x=[],J=[],$=[],_=[],D=[],V=[],f=[],B=null,W=null,y={retailMargin:10,wholesaleMargin:7,distributorMargin:5};async function dt(){try{const{getDoc:e,doc:t}=await O(async()=>{const{getDoc:s,doc:c}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:s,doc:c}},[]),o=t(C,`companies/${j}/settings`,"priceListMargins"),n=await e(o);if(n.exists()){const s=n.data();s.retailMargin!==void 0&&(y.retailMargin=parseFloat(s.retailMargin)),s.wholesaleMargin!==void 0&&(y.wholesaleMargin=parseFloat(s.wholesaleMargin)),s.distributorMargin!==void 0&&(y.distributorMargin=parseFloat(s.distributorMargin))}}catch(e){console.warn("Failed to load priceListMargins settings:",e)}}function Y(e,t){const o=new Date(e);return o.setDate(o.getDate()+t),o.toISOString().split("T")[0]}function q(e){if(!e)return"—";const t=new Date(e);return isNaN(t)?e:t.toLocaleDateString("ar-SA",{year:"numeric",month:"2-digit",day:"2-digit"})}const T={draft:{label:"مسودة",cls:"neutral"},sent:{label:"مُرسَل",cls:"indigo"},accepted:{label:"مقبول",cls:"good"},rejected:{label:"مرفوض",cls:"bad"},expired:{label:"منتهي",cls:"warn"},converted:{label:"مُفوتَر",cls:"teal"}};function Q(e){const t=T[e]||{label:e,cls:"neutral"};return`<span class="badge ${t.cls}" style="font-size:10px;">${t.label}</span>`}function G(e,t,o){let n=0,s=0;for(const p of e){const g=(p.qty||0)*(p.unitPrice||0),m=g*(p.discount||0)/100;n+=g,s+=m}const c=n-s;let r=0;const i=parseFloat(o)||0;t==="pct"&&(r=c*i/100),t==="fixed"&&(r=i);const a=Math.max(0,c-r),d=Math.round(a*.15*100)/100,l=Math.round((a+d)*100)/100;return{grossTotal:Math.round(n*100)/100,discountLines:Math.round(s*100)/100,extraDiscount:Math.round(r*100)/100,totalDiscount:Math.round((s+r)*100)/100,subtotal:a,vat:d,grandTotal:l}}async function qt(e,t){W=t,e.innerHTML=rt(),await dt(),await Promise.all([lt(),K()]),ct(),pt()}function rt(){const e=w();return`
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
</div>`}async function lt(){try{[J,$,_,D]=await Promise.all([P(I.customers(),[z("name")]),P(I.products(),[z("name")]),P(I.salesReps(),[z("name")]),P(I.categories(),[z("name")])]);try{V=await P(I.priceLists())}catch{V=[]}const e=_.map(s=>`<option value="${s.id}" data-name="${s.name}">${s.name}</option>`).join(""),t=document.getElementById("qt-rep");t&&(t.innerHTML='<option value="">بدون مندوب</option>'+e);const o=document.getElementById("qt-rep-filter");o&&(o.innerHTML='<option value="">الكل</option>'+e);const n=document.getElementById("qt-product-category-filter");n&&(n.innerHTML='<option value="">كل الفئات</option>'+D.map(s=>`<option value="${s.id}">${s.name}</option>`).join(""))}catch(e){console.error("loadDependencies:",e)}}async function K(){const e=document.getElementById("qt-tbody");if(e)try{const t=st(I.quotations(),z("createdAt","desc"),at(300));x=(await it(t)).docs.map(n=>({id:n.id,...n.data()})),Z(x)}catch(t){e&&(e.innerHTML=`<tr><td colspan="9" class="text-bad" style="padding:16px;">خطأ: ${t.message}</td></tr>`)}}function Z(e){const t=document.getElementById("qt-tbody");if(!t)return;const o=e.length,n=e.filter(a=>a.status==="accepted").length,s=e.filter(a=>a.status==="draft"||a.status==="sent").length,c=e.filter(a=>a.status==="converted").length,r=o>0?Math.round(c/o*100):0,i=(a,d)=>{const l=document.getElementById(a);l&&(l.textContent=d)};if(i("kpi-qt-total",o),i("kpi-qt-accepted",n),i("kpi-qt-pending",s),i("kpi-qt-conv",r+"%"),i("qt-count-label",o+" عرض"),!e.length){t.innerHTML='<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد عروض أسعار</td></tr>';return}t.innerHTML=e.map(a=>{const d=a.status!=="converted"&&a.status!=="accepted"&&a.expiryDate&&a.expiryDate<w(),l=a.status!=="converted";return`
      <tr class="qt-row" data-id="${a.id}" style="cursor:pointer;">
        <td class="mono text-indigo font-bold">${a.quoteNumber||"—"}</td>
        <td class="dim">${q(a.date)}</td>
        <td><strong>${a.customerName||"—"}</strong></td>
        <td class="dim">${a.repName||"—"}</td>
        <td style="text-align:center;" class="mono">${(a.items||[]).length}</td>
        <td class="mono font-bold">${u(a.grandTotal||0)}</td>
        <td>${Q(d?"expired":a.status)}</td>
        <td class="${d?"text-bad":""}">${q(a.expiryDate)}</td>
        <td class="qt-actions-cell">
          <div class="row-actions" style="display:flex;gap:2px;flex-wrap:nowrap;">
            <button class="btn btn-icon sm btn-ghost qt-act" data-action="print" data-id="${a.id}" title="طباعة">🖨️</button>
            ${l?'<button class="btn btn-icon sm btn-ghost qt-act" data-action="convert" data-id="'+a.id+'" style="color:var(--brand);" title="تحويل لفاتورة">🔄</button>':""}
            <button class="btn btn-icon sm btn-ghost qt-act" data-action="dup"  data-id="${a.id}" title="تكرار">📋</button>
            <button class="btn btn-icon sm btn-ghost qt-act" data-action="edit" data-id="${a.id}" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost qt-act text-bad" data-action="del" data-id="${a.id}" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>`}).join(""),t._qtListenerAttached||(t._qtListenerAttached=!0,t.addEventListener("click",function(d){const l=d.target.closest(".qt-act");if(l){d.stopPropagation();const g=l.dataset.id,m=l.dataset.action;if(m==="edit"){const b=x.find(v=>v.id===g);b&&openQuoteForm(b)}else if(m==="del"){const b=x.find(v=>v.id===g);deleteQuote(g,b&&b.quoteNumber||"")}else m==="dup"?x.find(v=>v.id===g)&&duplicateQuote(g):m==="convert"?convertQuoteToInvoice(g):m==="print"&&printQuote(g);return}const p=d.target.closest(".qt-row");p&&!d.target.closest(".qt-actions-cell")&&viewQuote(p.dataset.id,d)}))}window.filterQuotes=()=>{const e=(document.getElementById("qt-search")?.value||"").trim().toLowerCase(),t=document.getElementById("qt-status-filter")?.value||"",o=document.getElementById("qt-from")?.value||"",n=document.getElementById("qt-to")?.value||"",s=document.getElementById("qt-rep-filter")?.value||"",c=x.filter(r=>{if(e&&!((r.quoteNumber||"").toLowerCase().includes(e)||(r.customerName||"").toLowerCase().includes(e))||t&&r.status!==t)return!1;const i=r.date||"";return!(o&&i<o||n&&i>n||s&&r.repId!==s)});Z(c)};window.openQuoteForm=async(e=null)=>{B=e?.id||null,f=e?.items?JSON.parse(JSON.stringify(e.items)).map(r=>{const i=$.find(l=>l.id===r.productId),a=r.cost||i?.purchasePrice||i?.costPrice||i?.averageCost||i?.cost||0;let d=r.margin;return d===void 0&&(d=a>0?Math.round((r.unitPrice/a-1)*100*100)/100:0),{...r,cost:a,margin:d}}):[];const t=(r,i)=>{const a=document.getElementById(r);a&&(a.value=i||"")},o=w(),n=document.getElementById("qt-form-title");n&&(n.textContent=e?`تعديل العرض: ${e.quoteNumber}`:"عرض سعر جديد"),t("qt-number",e?.quoteNumber||"جارٍ التوليد…"),t("qt-date",e?.date||o),t("qt-expiry",e?.expiryDate||Y(o,30)),t("qt-customer-search",e?.customerName||""),t("qt-customer-id",e?.customerId||""),t("qt-customer-name-val",e?.customerName||""),t("qt-delivery-address",e?.deliveryAddress||""),t("qt-rep",e?.repId||""),t("qt-pricelist",e?.priceList||"standard"),t("qt-payment-terms",e?.paymentTerms||"cash"),t("qt-status",e?.status||"draft"),t("qt-notes",e?.notes||""),t("qt-terms",e?.terms||"صلاحية العرض: 30 يوماً من تاريخه. الأسعار شاملة ضريبة القيمة المضافة 15%. يُعدّ هذا العرض ملزماً عند قبوله."),t("qt-extra-disc-type",e?.extraDiscountType||"none"),t("qt-extra-disc-val",e?.extraDiscountVal||"0");const s=document.getElementById("qt-expiry-warn");s&&(s.style.display="none");const c=document.getElementById("qt-form-error");c&&c.classList.add("hidden"),k(),openModal("qt-form-modal"),e||R("QT").then(r=>{const i=document.getElementById("qt-number");i&&(i.value=r)}).catch(()=>{})};window.checkExpiryWarn=()=>{const e=document.getElementById("qt-expiry")?.value,t=document.getElementById("qt-expiry-warn");t&&(t.style.display=e&&e<w()?"block":"none")};window.editQuote=e=>{const t=x.find(o=>o.id===e);t&&openQuoteForm(t)};window.duplicateQuote=e=>{const t=x.find(n=>n.id===e);if(!t)return;const o=JSON.parse(JSON.stringify(t));delete o.id,o.quoteNumber=null,o.status="draft",o.date=w(),o.expiryDate=Y(w(),30),openQuoteForm(o)};window.onPricelistChange=()=>{const e=document.getElementById("qt-pricelist")?.value||"standard";f=f.map(t=>{const o=$.find(r=>r.id===t.productId);if(!o)return t;const n=o.purchasePrice||o.costPrice||o.averageCost||0;let s=0;if(e==="wholesale"?s=n>0?n*(1+y.wholesaleMargin/100):0:e==="distributor"?s=n>0?n*(1+y.distributorMargin/100):0:s=n>0?n*(1+y.retailMargin/100):0,s<=0){const r=o.salePrice||o.priceRetail||o.price||0;s=Math.round(r/1.15*100)/100}else s=Math.round(s*100)/100;const c=n>0?Math.round((s/n-1)*100*100)/100:0;return{...t,cost:n,unitPrice:s,margin:c}}),k()};function k(){const e=document.getElementById("qt-lines-tbody");if(e){if(!f.length){e.innerHTML=`<tr><td colspan="12" style="text-align:center;padding:20px;
      color:var(--text-2);font-size:12px;">ابحث عن صنف أعلاه لإضافته</td></tr>`,recalcTotals();return}e.innerHTML=f.map((t,o)=>{const n=(t.qty||0)*(t.unitPrice||0),s=n*(t.discount||0)/100,c=n-s,r=c*.15,i=c+r;return`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:5px 8px;color:var(--text-2);font-size:11px;">${o+1}</td>
        <td style="padding:5px 8px;">
          <div style="font-size:12.5px;font-weight:600;">${t.productName}</div>
          ${t.sku?`<div style="font-size:10px;color:var(--text-2);">${t.sku}</div>`:""}
        </td>
        <td style="padding:5px 8px;font-size:11px;color:var(--text-2);">${t.unit||"PCS"}</td>
        <td style="padding:5px 8px;">
          <input type="number" class="input mono" style="width:70px;height:28px;font-size:12px;"
            value="${t.qty}" min="0.001" step="0.001"
            onchange="updateQtLine(${o},'qty',this.value)" />
        </td>
        <td class="no-print" style="padding:5px 8px;">
          <input type="number" class="input mono" style="width:85px;height:28px;font-size:12px;background:#f9f9ff;border-color:#d0d4f0;"
            value="${t.cost||0}" min="0" step="0.01"
            onchange="updateQtLineCost(${o},this.value)" />
        </td>
        <td class="no-print" style="padding:5px 8px;">
          <input type="number" class="input mono" style="width:75px;height:28px;font-size:12px;background:#f9f9ff;border-color:#d0d4f0;"
            value="${t.margin||0}" step="0.1"
            onchange="updateQtLineMargin(${o},this.value)" />
        </td>
        <td style="padding:5px 8px;">
          <input type="number" class="input mono" style="width:100px;height:28px;font-size:12px;"
            value="${t.unitPrice}" min="0" step="0.01"
            onchange="updateQtLine(${o},'unitPrice',this.value)" />
        </td>
        <td style="padding:5px 8px;">
          <input type="number" class="input mono" style="width:64px;height:28px;font-size:12px;"
            value="${t.discount||0}" min="0" max="100" step="0.1"
            onchange="updateQtLine(${o},'discount',this.value)" />
        </td>
        <td style="padding:5px 8px;" class="mono">${u(c)}</td>
        <td style="padding:5px 8px;color:var(--warn);" class="mono">${u(r)}</td>
        <td style="padding:5px 8px;font-weight:700;" class="mono">${u(i)}</td>
        <td style="padding:5px 8px;">
          <button class="btn btn-icon sm btn-ghost" style="color:var(--bad);"
            onclick="removeQtLine(${o})">✕</button>
        </td>
      </tr>`}).join(""),recalcTotals()}}window.updateQtLine=(e,t,o)=>{const n=parseFloat(o)||0;if(f[e][t]=n,t==="unitPrice"){const s=f[e].cost||0;s>0&&(f[e].margin=Math.round((n/s-1)*100*100)/100)}k()};window.updateQtLineCost=(e,t)=>{const o=parseFloat(t)||0;f[e].cost=o;const n=f[e].margin||0;f[e].unitPrice=Math.round(o*(1+n/100)*100)/100,k()};window.updateQtLineMargin=(e,t)=>{const o=parseFloat(t)||0;f[e].margin=o;const n=f[e].cost||0;f[e].unitPrice=Math.round(n*(1+o/100)*100)/100,k()};window.removeQtLine=e=>{f.splice(e,1),k()};window.recalcTotals=()=>{const e=document.getElementById("qt-extra-disc-type")?.value||"none",t=document.getElementById("qt-extra-disc-val")?.value||"0",o=G(f,e,t),n=(s,c)=>{const r=document.getElementById(s);r&&(r.textContent=c)};n("qt-t-gross",u(o.grossTotal)),n("qt-t-disc","- "+u(o.totalDiscount)),n("qt-t-subtotal",u(o.subtotal)),n("qt-t-vat",u(o.vat)),n("qt-t-grand",u(o.grandTotal))};function ct(){const e=document.getElementById("qt-customer-search"),t=document.getElementById("qt-customer-results");e&&(e.addEventListener("input",H(()=>{const o=e.value.trim().toLowerCase();if(!o){t.classList.add("hidden");return}const n=J.filter(s=>(s.name||"").toLowerCase().includes(o)||(s.phone||"").includes(o)).slice(0,10);if(!n.length){t.classList.add("hidden");return}t.innerHTML=n.map(s=>`
      <div class="autocomplete-item"
        onclick="selectQtCustomer('${s.id}','${(s.name||"").replace(/'/g,"\\'")}')">
        <div>${s.name}</div>
        <div class="item-code">${s.phone||""} ${s.vatNumber?"| ض: "+s.vatNumber:""}</div>
      </div>`).join(""),t.classList.remove("hidden")},250)),document.addEventListener("click",o=>{!e.contains(o.target)&&!t.contains(o.target)&&t.classList.add("hidden")}))}window.selectQtCustomer=(e,t)=>{const o=(n,s)=>{const c=document.getElementById(n);c&&(c.value=s)};o("qt-customer-id",e),o("qt-customer-name-val",t),o("qt-customer-search",t),document.getElementById("qt-customer-results")?.classList.add("hidden")};function pt(){const e=document.getElementById("qt-product-search"),t=document.getElementById("qt-product-results"),o=document.getElementById("qt-product-category-filter");if(!e)return;const n=()=>{const s=e.value.trim().toLowerCase(),c=o?o.value:"",r=document.getElementById("qt-pricelist")?.value||"standard";if(!s&&!c){t.classList.add("hidden");return}let i=$;if(c&&(i=i.filter(a=>a.category===c)),s&&(i=i.filter(a=>(a.name||"").toLowerCase().includes(s)||(a.sku||"").toLowerCase().includes(s)||(a.barcode||"").includes(s))),i=i.slice(0,15),!i.length){t.innerHTML='<div style="padding:10px;text-align:center;color:var(--text-2);font-size:12px;">لا توجد نتائج</div>',t.classList.remove("hidden");return}t.innerHTML=i.map(a=>{const d=a.purchasePrice||a.costPrice||a.averageCost||0;let l=0;if(r==="wholesale"?l=d>0?d*(1+y.wholesaleMargin/100):0:r==="distributor"?l=d>0?d*(1+y.distributorMargin/100):0:l=d>0?d*(1+y.retailMargin/100):0,l<=0){const b=a.salePrice||a.priceRetail||a.price||0;l=Math.round(b/1.15*100)/100}else l=Math.round(l*100)/100;const p=l*1.15,g=(a.name||"").replace(/'/g,"\\'"),m=(a.sku||"").replace(/'/g,"\\'");return`
        <div class="autocomplete-item"
          onclick="addQtProduct('${a.id}','${g}',${l},'${a.unit||"PCS"}','${m}', ${d})">
          <div style="display:flex;justify-content:space-between;">
            <span style="font-weight:600;">${a.name}</span>
            <span class="mono text-indigo">${u(p)}</span>
          </div>
          <div class="item-code">${a.sku||""} | ${a.unit||""} (تكلفة: ${u(d)})</div>
        </div>`}).join(""),t.classList.remove("hidden")};e.addEventListener("input",H(n,200)),e.addEventListener("focus",n),o&&o.addEventListener("change",n),document.addEventListener("click",s=>{!e.contains(s.target)&&!t.contains(s.target)&&(!o||!o.contains(s.target))&&t.classList.add("hidden")})}window.addQtProduct=(e,t,o,n,s,c=0)=>{const r=document.getElementById("qt-product-search"),i=document.getElementById("qt-product-results");r&&(r.value=""),i&&i.classList.add("hidden");const a=f.find(d=>d.productId===e);if(a)a.qty+=1;else{const d=parseFloat(c)||0,l=d>0?Math.round((o/d-1)*100*100)/100:0;f.push({productId:e,productName:t,unitPrice:o,unit:n,sku:s,qty:1,discount:0,cost:d,margin:l})}k()};window.saveQuote=async e=>{const t=document.getElementById("qt-form-error");t&&t.classList.add("hidden");const o=document.getElementById("qt-customer-id")?.value.trim()||"",n=document.getElementById("qt-customer-name-val")?.value.trim()||document.getElementById("qt-customer-search")?.value.trim()||"",s=document.getElementById("qt-date")?.value||"",c=document.getElementById("qt-expiry")?.value||"";if(!o||!n){t&&(t.textContent="يرجى اختيار العميل أولاً.",t.classList.remove("hidden"));return}if(!f.length){t&&(t.textContent="يرجى إضافة صنف واحد على الأقل.",t.classList.remove("hidden"));return}if(!s){t&&(t.textContent="يرجى تحديد تاريخ العرض.",t.classList.remove("hidden"));return}const r=document.getElementById("qt-extra-disc-type")?.value||"none",i=parseFloat(document.getElementById("qt-extra-disc-val")?.value)||0,a=G(f,r,i),d=document.getElementById("qt-rep"),l=d?.value||"",p=d?.options[d?.selectedIndex]?.dataset.name||"",g=e||document.getElementById("qt-status")?.value||"draft",m=document.getElementById("qt-save-draft-btn"),b=document.getElementById("qt-save-btn");m&&(m.disabled=!0),b&&(b.disabled=!0);try{let v=document.getElementById("qt-number")?.value||"";(!v||v==="جارٍ التوليد…")&&(v=await R("QT"));const E={quoteNumber:v,date:s,expiryDate:c,customerId:o,customerName:n,deliveryAddress:document.getElementById("qt-delivery-address")?.value||"",repId:l,repName:p,priceList:document.getElementById("qt-pricelist")?.value||"standard",paymentTerms:document.getElementById("qt-payment-terms")?.value||"cash",status:g,items:f,grossTotal:a.grossTotal,discountTotal:a.totalDiscount,subtotal:a.subtotal,totalVat:a.vat,grandTotal:a.grandTotal,extraDiscountType:r,extraDiscountVal:i,notes:document.getElementById("qt-notes")?.value||"",terms:document.getElementById("qt-terms")?.value||"",createdBy:W?.uid||"system"};let M=B;if(B)await F("quotations",B,E),showToast("تم تحديث عرض السعر بنجاح","success");else{const L=await ot(I.quotations(),E);M=typeof L=="string"?L:L.id,showToast(`تم حفظ العرض ${v}`,"success")}const N=document.getElementById("qt-file-upload");if(N&&N.files.length>0){const L=N.files[0];window.uploadFileToArchive(L,"quotations",M,`مرفق عرض سعر رقم ${v}`).catch(et=>console.warn(et))}closeModal("qt-form-modal"),await K()}catch(v){t&&(t.textContent=v.message,t.classList.remove("hidden")),console.error(v)}finally{m&&(m.disabled=!1),b&&(b.disabled=!1)}};window.viewQuote=(e,t)=>{if(t&&(t.target.closest("button")||t.target.closest(".row-actions")))return;const o=x.find(p=>p.id===e);if(!o)return;const n=document.getElementById("qt-view-title");n&&(n.textContent=`عرض السعر: ${o.quoteNumber||e}`);const s=document.getElementById("qt-view-convert-btn");s&&(s.style.display=o.status==="converted"?"none":"");const c={cash:"نقداً",net30:"30 يوم",net60:"60 يوم",custom:"حسب الاتفاق"},r={standard:"عادي",wholesale:"جملة",distributor:"موزع",special:"خاص"},i=(o.items||[]).map((p,g)=>{const m=(p.qty||0)*(p.unitPrice||0),b=m*(p.discount||0)/100,v=m-b,E=v*.15,M=v+E;return`
      <tr>
        <td style="padding:7px 10px;">${g+1}</td>
        <td style="padding:7px 10px;">${p.productName}</td>
        <td style="padding:7px 10px;" class="mono">${U(p.qty)} ${p.unit||""}</td>
        <td style="padding:7px 10px;" class="mono">${u(p.unitPrice)}</td>
        <td style="padding:7px 10px;" class="mono">${p.discount||0}%</td>
        <td style="padding:7px 10px;" class="mono">${u(v)}</td>
        <td style="padding:7px 10px;" class="mono text-warn">${u(E)}</td>
        <td style="padding:7px 10px;" class="mono font-bold">${u(M)}</td>
      </tr>`}).join(""),a=o.expiryDate&&o.expiryDate<w()&&o.status!=="accepted"&&o.status!=="converted",d=Object.entries(T).filter(([p])=>p!=="converted").map(([p,g])=>`<button class="btn btn-sm ${o.status===p?"btn-primary":"btn-secondary"}"
      onclick="updateQuoteStatus('${o.id}','${p}')">${g.label}</button>`).join(""),l=document.getElementById("qt-view-body");l&&(l.innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px;">
      <div><div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">رقم العرض</div>
        <div class="mono text-indigo font-bold">${o.quoteNumber}</div></div>
      <div><div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">الحالة</div>
        ${Q(o.status)}</div>
      <div><div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">التاريخ</div>
        <div>${q(o.date)}</div></div>
      <div><div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">تاريخ الصلاحية</div>
        <div class="${a?"text-bad":""}">${q(o.expiryDate)}</div></div>
      <div><div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">العميل</div>
        <div class="font-semibold">${o.customerName}</div>
        ${o.deliveryAddress?`<div style="font-size:11px;color:var(--text-2);">${o.deliveryAddress}</div>`:""}</div>
      <div><div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">المندوب</div>
        <div>${o.repName||"—"}</div></div>
      <div><div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">قائمة الأسعار</div>
        <div>${r[o.priceList]||o.priceList||"—"}</div></div>
      <div><div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">شروط الدفع</div>
        <div>${c[o.paymentTerms]||o.paymentTerms||"—"}</div></div>
    </div>

    <div class="table-container mb-16">
      <table class="data-dense">
        <thead><tr>
          <th>#</th><th>الصنف</th><th>الكمية</th><th>سعر الوحدة</th>
          <th>خصم</th><th>صافي</th><th>ضريبة</th><th>الإجمالي</th>
        </tr></thead>
        <tbody>${i}</tbody>
      </table>
    </div>

    <div style="display:flex;justify-content:flex-end;margin-bottom:14px;">
      <div style="width:268px;border:1px solid var(--border-soft);border-radius:8px;overflow:hidden;">
        <div style="display:flex;justify-content:space-between;padding:7px 12px;border-bottom:1px solid var(--border-soft);">
          <span style="font-size:12px;color:var(--text-2);">المجموع قبل الخصم</span>
          <span class="mono">${u(o.grossTotal||0)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:7px 12px;border-bottom:1px solid var(--border-soft);">
          <span style="font-size:12px;color:var(--text-2);">إجمالي الخصم</span>
          <span class="mono text-bad">- ${u(o.discountTotal||0)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:7px 12px;border-bottom:1px solid var(--border-soft);">
          <span style="font-size:12px;color:var(--text-2);">ضريبة 15%</span>
          <span class="mono text-warn">${u(o.totalVat||0)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 12px;background:var(--bg-2);">
          <span style="font-size:14px;font-weight:700;">الإجمالي النهائي</span>
          <span class="mono" style="font-size:15px;font-weight:800;">${u(o.grandTotal||0)}</span></div>
      </div>
    </div>

    ${o.notes?`<div style="padding:10px 14px;background:var(--bg-2);border-radius:8px;font-size:12px;color:var(--text-2);margin-bottom:10px;">
      <strong>ملاحظات:</strong> ${o.notes}</div>`:""}

    <div style="padding:10px 14px;background:var(--bg-2);border-radius:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
      <span style="font-size:12px;color:var(--text-2);font-weight:600;">تحديث الحالة:</span>
      ${d}
    </div>`,window._currentViewQuote=o,openModal("qt-view-modal"))};window.printQuoteFromView=()=>{window._currentViewQuote&&printQuote(window._currentViewQuote.id)};window.convertQuoteToInvoiceFromView=()=>{window._currentViewQuote&&convertQuoteToInvoice(window._currentViewQuote.id)};window.shareQuoteWhatsApp=()=>{const e=window._currentViewQuote;if(!e)return;const t={cash:"نقداً",net30:"30 يوم",net60:"60 يوم",custom:"حسب الاتفاق"},o=(e.items||[]).map((s,c)=>`${c+1}. ${s.productName} — الكمية: ${s.qty} × ${u(s.unitPrice)}`).join(`
`),n=["*عرض سعر من إدهام للمواد الغذائية*",`رقم العرض: ${e.quoteNumber}`,`التاريخ: ${q(e.date)}`,`الصلاحية: ${q(e.expiryDate)}`,`العميل: ${e.customerName}`,`شروط الدفع: ${t[e.paymentTerms]||"—"}`,"","*الأصناف:*",o,"",`المجموع قبل الخصم: ${u(e.grossTotal||0)}`,`إجمالي الخصم: ${u(e.discountTotal||0)}`,`ضريبة القيمة المضافة (15%): ${u(e.totalVat||0)}`,`*الإجمالي النهائي: ${u(e.grandTotal||0)}*`,"",e.notes?`ملاحظات: ${e.notes}`:"","نشكركم لتعاملكم معنا 🙏"].filter(Boolean).join(`
`);window.open(`https://wa.me/?text=${encodeURIComponent(n)}`,"_blank")};window.updateQuoteStatus=async(e,t)=>{const o=T[t]?.label||t;if(await showConfirm(`تغيير حالة العرض إلى "${o}"؟`,"تحديث الحالة"))try{await F("quotations",e,{status:t}),showToast(`تم تحديث الحالة إلى: ${o}`,"success");const n=x.findIndex(s=>s.id===e);n!==-1&&(x[n].status=t),filterQuotes(),window._currentViewQuote?.id===e&&(window._currentViewQuote.status=t,viewQuote(e))}catch(n){showToast(n.message,"error")}};window.deleteQuote=async(e,t)=>{if(await showConfirm(`حذف عرض السعر رقم "${t||e}"؟ لا يمكن التراجع عن هذا الإجراء.`,"تأكيد الحذف"))try{await nt("quotations",e),showToast("تم حذف عرض السعر","success"),x=x.filter(o=>o.id!==e),filterQuotes()}catch(o){showToast(o.message,"error")}};window.convertQuoteToInvoice=async e=>{const t=x.find(o=>o.id===e);if(t){if(t.status==="converted"){showToast("تم تحويل هذا العرض مسبقاً","warn");return}if(await showConfirm(`تحويل العرض "${t.quoteNumber}" إلى فاتورة مبيعات جديدة?
سيُغَيَّر وضع العرض إلى "مُفوتَر".`,"تحويل لفاتورة"))try{sessionStorage.setItem("convert_quote",JSON.stringify({quoteId:t.id,quoteNumber:t.quoteNumber,customerId:t.customerId,customerName:t.customerName,repId:t.repId,repName:t.repName,items:(t.items||[]).map(n=>({productId:n.productId,productName:n.productName,unit:n.unit||"PCS",unitCode:"PCE",taxCategory:"S",qty:n.qty,unitPrice:n.unitPrice,discount:n.discount||0})),notes:t.notes||""})),await F("quotations",e,{status:"converted",convertedAt:new Date().toISOString()});const o=x.findIndex(n=>n.id===e);o!==-1&&(x[o].status="converted"),filterQuotes(),closeModal("qt-view-modal"),showToast("تم التحويل. افتح وحدة فواتير المبيعات لاستكمال الإنشاء.","success"),typeof navigate=="function"&&navigate("sales-invoices")}catch(o){showToast(o.message,"error")}}};window.printQuote=async e=>{const t=x.find(i=>i.id===e);if(!t){showToast("العرض غير موجود","error");return}let o="";try{const{getDoc:i,doc:a}=await O(async()=>{const{getDoc:m,doc:b}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:m,doc:b}},[]),d=a(C,`companies/${j}/settings`,"company"),l=a(C,`companies/${j}/settings`,"logo"),[p,g]=await Promise.all([i(d),i(l)]);if(p.exists()){const m=p.data();m.name&&(co.name=m.name),m.vatNumber&&(co.vatNumber=m.vatNumber),m.address&&(co.address=m.address),m.phone&&(co.phone=m.phone),m.email&&(co.email=m.email)}g.exists()&&(o=g.data().dataUrl||"")}catch(i){console.warn("Failed to load company settings for print:",i)}const n={cash:"نقداً",net30:"30 يوم",net60:"60 يوم",custom:"حسب الاتفاق"},s={standard:"عادي",wholesale:"جملة",distributor:"موزع",special:"خاص"},c=(t.items||[]).map((i,a)=>{const d=(i.qty||0)*(i.unitPrice||0),l=d*(i.discount||0)/100,p=d-l,g=p*.15,m=p+g;return`
      <tr>
        <td style="text-align:center;">${a+1}</td>
        <td>${i.productName}${i.sku?`<br><small style="color:#888;">${i.sku}</small>`:""}</td>
        <td style="text-align:center;">${i.unit||"PCS"}</td>
        <td style="text-align:center;" class="mono">${U(i.qty)}</td>
        <td style="text-align:left;" class="mono">${u(i.unitPrice)}</td>
        <td style="text-align:center;" class="mono">${i.discount||0}%</td>
        <td style="text-align:left;" class="mono">${u(p)}</td>
        <td style="text-align:left;" class="mono">${u(g)}</td>
        <td style="text-align:left;" class="mono font-bold">${u(m)}</td>
      </tr>`}).join(""),r=window.open("","_blank");if(!r){showToast("يرجى السماح بالنوافذ المنبثقة للطباعة","warn");return}r.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>عرض سعر ${t.quoteNumber||""}</title>
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
        ${o?`<img class="co-logo" src="${o}" alt="الشعار">`:""}
        <div class="co-name">${co.name}</div>
        <div class="co-sub">الرقم الضريبي: ${co.vatNumber}</div>
        <div class="co-sub">${co.address}</div>
        <div class="co-sub">هاتف: ${co.phone} | ${co.email}</div>
      </div>
      <div style="text-align:center;">
        <div class="doc-badge">عرض سعر</div>
        <div class="doc-num">رقم: <strong>${t.quoteNumber||""}</strong></div>
        <div class="doc-num">التاريخ: ${q(t.date)}</div>
        <div class="doc-num">صالح حتى: <strong>${q(t.expiryDate)}</strong></div>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <div class="meta-label">تفاصيل العميل</div>
        <div class="meta-val">${t.customerName}</div>
        ${t.deliveryAddress?`<div style="font-size:11px;color:#555;margin-top:3px;">${t.deliveryAddress}</div>`:""}
      </div>
      <div class="meta-box">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div><div class="meta-label">المندوب</div><div class="meta-val">${t.repName||"—"}</div></div>
          <div><div class="meta-label">شروط الدفع</div><div class="meta-val">${n[t.paymentTerms]||"—"}</div></div>
          <div><div class="meta-label">قائمة الأسعار</div><div class="meta-val">${s[t.priceList]||"—"}</div></div>
          <div><div class="meta-label">الحالة</div><div class="meta-val">${T[t.status]?.label||t.status}</div></div>
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
      <tbody>${c}</tbody>
    </table>

    <div class="totals">
      <div class="totals-inner">
        <div class="tot-row"><span>المجموع قبل الخصم</span><span>${u(t.grossTotal||0)}</span></div>
        <div class="tot-row"><span>إجمالي الخصم</span><span style="color:#e53e3e;">- ${u(t.discountTotal||0)}</span></div>
        <div class="tot-row"><span>المجموع بعد الخصم</span><span>${u(t.subtotal||0)}</span></div>
        <div class="tot-row"><span>ضريبة القيمة المضافة (15%)</span><span style="color:#d97706;">${u(t.totalVat||0)}</span></div>
        <div class="tot-row grand"><span>الإجمالي النهائي</span><span>${u(t.grandTotal||0)}</span></div>
      </div>
    </div>

    ${t.notes?`<div class="notes-box"><strong>ملاحظات:</strong> ${t.notes}</div>`:""}
    ${t.terms?`<div class="terms-box"><strong>الشروط والأحكام:</strong><br>${t.terms}</div>`:""}

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
</html>`),r.document.close()};window.exportQuotesCSV=()=>{try{const e=[["رقم العرض","التاريخ","الصلاحية","العميل","المندوب","الأصناف","إجمالي قبل خصم","الخصم","ما بعد الخصم","الضريبة","الإجمالي","الحالة"]];for(const n of x)e.push([n.quoteNumber||"",n.date||"",n.expiryDate||"",n.customerName||"",n.repName||"",(n.items||[]).length,n.grossTotal||0,n.discountTotal||0,n.subtotal||0,n.totalVat||0,n.grandTotal||0,T[n.status]?.label||n.status||""]);const t=e.map(n=>n.map(s=>`"${String(s).replace(/"/g,'""')}"`).join(",")).join(`
`),o=document.createElement("a");o.href=URL.createObjectURL(new Blob(["\uFEFF"+t],{type:"text/csv;charset=utf-8;"})),o.download=`quotations_${w()}.csv`,o.click(),showToast("تم تصدير الملف بنجاح","success")}catch(e){showToast(e.message,"error")}};let h=[];async function ut(){if(!window.pdfjsLib)return new Promise((e,t)=>{const o=document.createElement("script");o.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js",o.onload=()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js",e()},o.onerror=()=>t(new Error("فشل تحميل مكتبة معالجة الـ PDF")),document.head.appendChild(o)})}window.openPdfImportModal=()=>{h=[],document.getElementById("qt-pdf-error").classList.add("hidden"),document.getElementById("qt-pdf-loading").classList.add("hidden"),document.getElementById("qt-pdf-preview-area").classList.add("hidden"),document.getElementById("qt-pdf-dropzone").classList.remove("hidden"),document.getElementById("qt-pdf-submit-btn").disabled=!0,document.getElementById("qt-pdf-file-input").value="",openModal("qt-pdf-modal")};window.handlePdfDrop=e=>{e.preventDefault();const t=e.dataTransfer.files;t.length>0&&t[0].type==="application/pdf"?X(t[0]):S("الرجاء سحب ملف PDF فقط")};window.handlePdfFile=e=>{const t=e.target.files[0];t&&X(t)};function S(e){const t=document.getElementById("qt-pdf-error");t.textContent=e,t.classList.remove("hidden"),document.getElementById("qt-pdf-loading").classList.add("hidden")}async function X(e){document.getElementById("qt-pdf-error").classList.add("hidden"),document.getElementById("qt-pdf-dropzone").classList.add("hidden"),document.getElementById("qt-pdf-loading").classList.remove("hidden");try{await ut();const t=new FileReader;t.onload=async o=>{try{const n=o.target.result,s=await mt(n),c=gt(s);if(c.length===0)throw new Error("لم نتمكن من استخلاص أي أصناف من ملف الـ PDF. تأكد من أن الملف مقروء ويحتوي على أسطر الأصناف والأسعار.");h=c,ft(h),A(),document.getElementById("qt-pdf-loading").classList.add("hidden"),document.getElementById("qt-pdf-preview-area").classList.remove("hidden"),document.getElementById("qt-pdf-submit-btn").disabled=!1}catch(n){S(n.message),document.getElementById("qt-pdf-dropzone").classList.remove("hidden")}},t.readAsArrayBuffer(e)}catch(t){S(t.message),document.getElementById("qt-pdf-dropzone").classList.remove("hidden")}}async function mt(e){const t=await window.pdfjsLib.getDocument({data:e}).promise,o=[];for(let n=1;n<=t.numPages;n++){const r=(await(await t.getPage(n)).getTextContent()).items,i={};r.forEach(d=>{if(!d.str.trim())return;const l=Math.round(d.transform[5]);i[l]||(i[l]=[]),i[l].push(d)}),Object.keys(i).map(Number).sort((d,l)=>l-d).forEach(d=>{const p=i[d].sort((g,m)=>g.transform[4]-m.transform[4]).map(g=>g.str).join(" ").trim();p&&o.push(p)})}return o}function gt(e){const t=[];return e.forEach(o=>{if(o.toLowerCase().includes("page")||o.toLowerCase().includes("invoice")||o.toLowerCase().includes("total")||o.includes("المجموع")||o.includes("ضريبة")||o.includes("صفحة")||o.includes("رقم السجل"))return;const n=o.split(/\s+/);if(n.length<2)return;const s=[],c=[];if(n.forEach(d=>{const l=d.replace(/[^\d\.]/g,""),p=parseFloat(l);!isNaN(p)&&l.length>0?l.length<9&&s.push({raw:d,val:p,isDecimal:l.includes(".")}):d.trim().length>1&&!["*","x","-","=","/","+","—"].includes(d.trim())&&c.push(d)}),c.length===0||s.length===0)return;const r=c.join(" ");let i=1,a=0;if(s.length===1)a=s[0].val;else if(s.length>=2){const d=s.find(l=>l.isDecimal);if(d){a=d.val;const l=s.find(p=>p!==d);i=l?Math.round(l.val):1}else{const l=[...s].sort((p,g)=>p.val-g.val);i=Math.round(l[0].val),a=l[1].val}}i<=0&&(i=1),!(a<=0)&&t.push({included:!0,rawName:r,qty:i,cost:a,matchedProductId:"",margin:10,suggestedSalePrice:Math.round(a*1.1*100)/100})}),t}function ft(e){e.forEach(t=>{const o=t.rawName.toLowerCase(),n=$.find(s=>o.includes((s.name||"").toLowerCase())||s.sku&&o.includes(s.sku.toLowerCase())||s.name&&(s.name.toLowerCase().includes(o)||o.includes(s.name.toLowerCase())));if(n){t.matchedProductId=n.id;const s=D.find(c=>c.id===n.category);if(s){const r=JSON.parse(localStorage.getItem("idham_company")||"{}").pricing||{};s.velocity==="fast"?t.margin=r.marginFast??5:s.velocity==="medium"?t.margin=r.marginMedium??10:s.velocity==="slow"&&(t.margin=r.marginSlow??15)}t.suggestedSalePrice=Math.round(t.cost*(1+t.margin/100)*100)/100}})}function A(){const e=document.getElementById("qt-pdf-parsed-tbody");e&&(e.innerHTML=h.map((t,o)=>`
    <tr>
      <td><input type="checkbox" ${t.included?"checked":""} onchange="importedPdfItems[${o}].included = this.checked" /></td>
      <td><strong>${t.rawName}</strong></td>
      <td><input type="number" class="input sm mono" style="width:60px; height:26px; padding:2px;" value="${t.qty}" min="1" oninput="importedPdfItems[${o}].qty = parseInt(this.value) || 1" /></td>
      <td class="mono font-bold">${u(t.cost)}</td>
      <td>
        <select class="input sm" style="font-size:12px; height:26px; padding:2px;" onchange="onMatchedProductChange(${o}, this.value)">
          <option value="">-- اختر صنف للربط --</option>
          ${$.map(n=>`<option value="${n.id}" ${t.matchedProductId===n.id?"selected":""}>${n.sku} - ${n.name}</option>`).join("")}
        </select>
      </td>
      <td>
        <input type="number" class="input sm mono" style="width:70px; height:26px; padding:2px;" value="${t.margin}" step="0.5" oninput="onItemMarginChange(${o}, this.value)" />
      </td>
      <td class="mono font-bold text-indigo" id="suggested-sale-price-${o}">${u(t.suggestedSalePrice)}</td>
    </tr>
  `).join(""))}window.toggleAllPdfItems=e=>{h.forEach(t=>t.included=e),A()};window.onMatchedProductChange=(e,t)=>{h[e].matchedProductId=t;const o=$.find(n=>n.id===t);if(o){const n=D.find(s=>s.id===o.category);if(n){const c=JSON.parse(localStorage.getItem("idham_company")||"{}").pricing||{};n.velocity==="fast"?h[e].margin=c.marginFast??5:n.velocity==="medium"?h[e].margin=c.marginMedium??10:n.velocity==="slow"&&(h[e].margin=c.marginSlow??15)}}tt(e),A()};window.onItemMarginChange=(e,t)=>{h[e].margin=parseFloat(t)||0,tt(e)};function tt(e){const t=h[e];t.suggestedSalePrice=Math.round(t.cost*(1+t.margin/100)*100)/100;const o=document.getElementById(`suggested-sale-price-${e}`);o&&(o.textContent=u(t.suggestedSalePrice))}window.submitImportedPdfItems=()=>{const e=h.filter(t=>t.included&&t.matchedProductId);if(e.length===0){alert("يرجى تحديد عنصر واحد على الأقل وربطه بصنف من النظام للاستيراد");return}f=e.map(t=>{const o=$.find(n=>n.id===t.matchedProductId);return{productId:t.matchedProductId,sku:o?.sku||"SKU",name:o?.name||"Product Name",unit:o?.unit||"حبة",qty:t.qty,unitPrice:t.suggestedSalePrice,discount:0,taxCategory:o?.taxCategory||"S"}}),closeModal("qt-pdf-modal"),window.openQuoteForm()};export{qt as render};
