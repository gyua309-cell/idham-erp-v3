import{t as B,g as E,C as $,f as b,B as Q,u as z,c as A,r as D}from"./index-CF9GFeRJ.js";import{orderBy as L}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let h=[],R=[],P=[],w=new Map,v=null,u=[];async function X(o,t){o.innerHTML=`
    <div class="filterbar no-print" style="flex-wrap: wrap; gap: 8px; align-items: flex-end;">
      <div class="date-range-group">
        <label>بحث</label>
        <input type="text" id="rfq-search" class="form-control" placeholder="رقم الطلب أو المورد..." style="width:160px; height:34px; font-size:12.5px;" />
      </div>
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="rfq-from" class="form-control" style="width:130px; height:34px; font-size:12.5px;" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="rfq-to" class="form-control" style="width:130px; height:34px; font-size:12.5px;" />
      </div>
      <div class="date-range-group">
        <label>المورد</label>
        <select id="rfq-supplier-filter" class="form-control" style="width:160px; height:34px; font-size:12.5px;">
          <option value="">كل الموردين</option>
        </select>
      </div>
      <div class="date-range-group">
        <label>الحالة</label>
        <select id="rfq-status-filter" class="form-control" style="width:120px; height:34px; font-size:12.5px;">
          <option value="">كل الحالات</option>
          <option value="draft">مسودة</option>
          <option value="sent">تم الإرسال</option>
          <option value="completed">مكتمل (مُسعّر)</option>
        </select>
      </div>
      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="exportRFQsListPDF()">PDF تصدير القائمة 📄</button>
        <button class="btn btn-primary" onclick="openNewRfqModal()">+ طلب أسعار جديد</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header no-print">
        <h1 class="page-title">طلبات أسعار الموردين (RFQ)</h1>
        <p class="page-subtitle">إنشاء طلبات تسعير للموردين ومقارنة العروض المستلمة بأسعار التكلفة الحالية</p>
      </div>

      <!-- Stat Cards -->
      <div class="grid-4 gap-16 mb-24 no-print">
        <div class="kpi-card purchases">
          <div class="kpi-header-row">
            <div class="kpi-icon-glass">📋</div>
          </div>
          <div>
            <div class="kpi-label" style="margin-bottom:4px; font-size:14px; color:var(--text-2);">إجمالي الطلبات</div>
            <div class="kpi-value mono" id="rfq-stat-total" style="color:var(--text-0);">0</div>
            <div class="kpi-sub" style="font-size:11px; color:var(--text-dim);">طلبات مسجلة بالنظام</div>
          </div>
        </div>
        <div class="kpi-card invoices">
          <div class="kpi-header-row">
            <div class="kpi-icon-glass">⏳</div>
          </div>
          <div>
            <div class="kpi-label" style="margin-bottom:4px; font-size:14px; color:var(--text-2);">طلبات معلقة</div>
            <div class="kpi-value mono" id="rfq-stat-pending" style="color:var(--text-0);">0</div>
            <div class="kpi-sub" style="font-size:11px; color:var(--text-dim);">بانتظار أسعار الموردين</div>
          </div>
        </div>
        <div class="kpi-card receipts">
          <div class="kpi-header-row">
            <div class="kpi-icon-glass">✅</div>
          </div>
          <div>
            <div class="kpi-label" style="margin-bottom:4px; font-size:14px; color:var(--text-2);">عروض مسعّرة</div>
            <div class="kpi-value mono" id="rfq-stat-completed" style="color:var(--text-0);">0</div>
            <div class="kpi-sub" style="font-size:11px; color:var(--text-dim);">تم إدخال أسعارها بنجاح</div>
          </div>
        </div>
        <div class="kpi-card sales">
          <div class="kpi-header-row">
            <div class="kpi-icon-glass">📈</div>
          </div>
          <div>
            <div class="kpi-label" style="margin-bottom:4px; font-size:14px; color:var(--text-2);">متوسط التوفير</div>
            <div class="kpi-value mono" id="rfq-stat-savings" style="color:var(--text-0);">0.00 ر.س</div>
            <div class="kpi-sub" style="font-size:11px; color:var(--text-dim);">مقارنةً بأسعار التكلفة الحالية</div>
          </div>
        </div>
      </div>

      <!-- Main RFQ List Table -->
      <div class="card no-print">
        <div class="table-container">
          <table class="data-dense" id="rfqs-main-table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>التاريخ</th>
                <th>المورد المستهدف</th>
                <th>عدد الأصناف</th>
                <th>الحالة</th>
                <th>تاريخ الاستجابة المتوقع</th>
                <th style="text-align:left;">العمليات</th>
              </tr>
            </thead>
            <tbody id="rfq-tbody">
              <tr class="skeleton-row">
                <td colspan="7"><div class="sk" style="height:12px; margin:4px 0;"></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Print Container (Hidden by default, shown in print mode) -->
      <div id="rfq-print-area" class="print-only"></div>
    </div>

    <!-- ═══════════ MODAL 1: NEW/EDIT RFQ ═══════════ -->
    <div class="modal-overlay no-print" id="rfq-modal" onclick="if(event.target===this)closeRfqModal()">
      <div class="modal modal-xl">
        <div class="modal-header">
          <h3 class="modal-title" id="rfq-modal-title">📨 طلب عروض أسعار جديد</h3>
          <button class="modal-close" onclick="closeRfqModal()">×</button>
        </div>
        <div class="modal-body" style="padding:20px; overflow-y:auto; max-height:75vh;">
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group">
              <label class="form-label">رقم الطلب</label>
              <input type="text" id="rfq-number" class="form-control mono" readonly placeholder="يُولَّد تلقائياً" />
            </div>
            <div class="form-group">
              <label class="form-label">التاريخ <span class="text-bad">*</span></label>
              <input type="date" id="rfq-date" class="form-control" value="${B()}" />
            </div>
            <div class="form-group">
              <label class="form-label">تاريخ الاستجابة المتوقع</label>
              <input type="date" id="rfq-target-date" class="form-control" />
            </div>
          </div>

          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label class="form-label">المورد المستهدف <span class="text-bad">*</span></label>
              <div class="autocomplete-container">
                <input type="text" id="rfq-supplier-search" class="form-control" placeholder="ابحث باسم المورد…" autocomplete="off" />
                <div class="autocomplete-results hidden" id="rfq-supplier-results"></div>
                <input type="hidden" id="rfq-supplier-id" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">ملاحظات موجهة للمورد</label>
              <input type="text" id="rfq-notes" class="form-control" placeholder="مثال: يرجى تقديم السعر شامل التوصيل لمخازننا..." />
            </div>
          </div>

          <!-- Items Table inside RFQ -->
          <div style="background:var(--bg-2); border-radius:8px; padding:12px; margin-bottom:12px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; flex-wrap:wrap; gap:10px;">
              <strong style="font-size:13px; color:var(--brand);">📋 بنود الطلب</strong>
              <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                <select id="rfq-product-category-filter" class="form-control" style="width:130px; height:34px; font-size:12px; padding:4px 8px;">
                  <option value="">كل الفئات</option>
                </select>
                <div class="autocomplete-container" style="width:280px;">
                  <input type="text" id="rfq-product-search" class="form-control" placeholder="+ أضف صنفاً… (بالاسم أو الكود)" autocomplete="off" style="height:34px; font-size:12px;" />
                  <div class="autocomplete-results hidden" id="rfq-product-results"></div>
                </div>
                <button type="button" class="btn btn-primary btn-sm" onclick="addCustomRfqLine()" style="height:34px; font-size:11.5px; white-space:nowrap; background:#059669; border-color:#059669; display:inline-flex; align-items:center; gap:5px; font-weight:700;" title="إضافة بند حر يدوي غير مسجل بالكتالوج">
                  <span>✍️</span> <span>إضافة صنف يدوي</span>
                </button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="addAllProductsToRfq()" style="height:34px; font-size:11.5px; white-space:nowrap;" title="إدراج جميع الأصناف أو أصناف الفئة المحددة">📦 إدراج كل الأصناف</button>
                <button type="button" class="btn btn-warning btn-sm" onclick="addLowStockProductsToRfq()" style="height:34px; font-size:11.5px; white-space:nowrap; background:rgba(245,158,11,0.12); color:#D97706; border:1px solid rgba(245,158,11,0.35); font-weight:700;" title="إدراج الأصناف التي وصلت للحد الأدنى لنواقص المخزن">⚠️ جلب النواقص</button>
                <button type="button" class="btn btn-ghost btn-sm text-bad" onclick="clearAllRfqLines()" style="height:34px; font-size:11.5px; white-space:nowrap;" title="تفريغ كافة البنود">🗑️ تفريغ</button>
              </div>
            </div>
            <div class="invoice-lines" style="max-height:260px; overflow-y:auto; margin-top:0;">
              <table style="width:100%; font-size:12px; border-collapse:collapse;">
                <thead>
                  <tr style="background:var(--bg-3); position:sticky; top:0; z-index:1;">
                    <th style="padding:8px 10px; text-align:right; width:30px;">#</th>
                    <th style="padding:8px 10px; text-align:right; width:100px;">كود الصنف</th>
                    <th style="padding:8px 10px; text-align:right;">اسم الصنف</th>
                    <th style="padding:8px 10px; text-align:right; width:90px;">الوحدة</th>
                    <th style="padding:8px 10px; text-align:right; width:90px;">الكمية المطلوبة</th>
                    <th style="padding:8px 10px; text-align:right; width:90px;">العدد (كرتون)</th>
                    <th style="padding:8px 10px; text-align:right;">ملاحظات البند</th>
                    <th style="padding:8px 6px; width:30px;"></th>
                  </tr>
                </thead>
                <tbody id="rfq-lines-tbody"></tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeRfqModal()">إلغاء</button>
          <button class="btn btn-primary" onclick="saveRfq()" id="rfq-save-btn">حفظ الطلب</button>
        </div>
      </div>
    </div>

    <!-- ═══════════ MODAL 2: ENTER SUPPLIER PRICES ═══════════ -->
    <div class="modal-overlay no-print" id="rfq-prices-modal" onclick="if(event.target===this)closeModal('rfq-prices-modal')">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">💵 إدخال أسعار المورد لعرض السعر</h3>
          <button class="modal-close" onclick="closeModal('rfq-prices-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px; overflow-y:auto; max-height:70vh;">
          <div class="mb-16" style="background:var(--bg-2); padding:12px; border-radius:6px; font-size:12.5px;">
            <p><strong>المورد:</strong> <span id="rfq-p-supplier-name"></span></p>
            <p><strong>رقم الطلب:</strong> <span id="rfq-p-number" class="mono"></span></p>
          </div>
          <div class="invoice-lines" style="margin-top:0;">
            <table style="width:100%; font-size:12.5px; border-collapse:collapse;">
              <thead>
                <tr style="background:var(--bg-3);">
                  <th style="padding:8px 10px;">#</th>
                  <th style="padding:8px 10px;">اسم الصنف</th>
                  <th style="padding:8px 10px; width:80px;">الوحدة</th>
                  <th style="padding:8px 10px; width:80px;">الكمية</th>
                  <th style="padding:8px 10px; width:130px; color:var(--brand);">السعر المقترح للمفرد</th>
                  <th style="padding:8px 10px;">ملاحظة التوريد</th>
                </tr>
              </thead>
              <tbody id="rfq-prices-tbody"></tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('rfq-prices-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveRfqPrices()" id="rfq-prices-save-btn">حفظ وتأكيد الأسعار</button>
        </div>
      </div>
    </div>

    <!-- ═══════════ MODAL 3: PRICE COMPARISON VIEW ═══════════ -->
    <div class="modal-overlay no-print" id="rfq-compare-modal" onclick="if(event.target===this)closeModal('rfq-compare-modal')">
      <div class="modal modal-xl">
        <div class="modal-header">
          <h3 class="modal-title">📊 تحليل ومقارنة أسعار عرض المورد</h3>
          <button class="modal-close" onclick="closeModal('rfq-compare-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px; overflow-y:auto; max-height:75vh;">
          <div class="mb-16 grid-3 gap-12" style="background:var(--bg-2); padding:16px; border-radius:6px; font-size:13px; line-height:1.6;">
            <div>
              <p><strong>المورد:</strong> <span id="rfq-comp-supplier"></span></p>
              <p><strong>رقم الطلب:</strong> <span id="rfq-comp-number" class="mono"></span></p>
            </div>
            <div>
              <p><strong>تاريخ الطلب:</strong> <span id="rfq-comp-date"></span></p>
              <p><strong>إجمالي التوفير في هذا العرض:</strong> <span id="rfq-comp-totalsavings" class="mono font-bold text-good">0.00 ر.س</span></p>
            </div>
            <div style="display:flex; justify-content:flex-end; align-items:center; gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="exportComparisonCSV()">CSV 📊</button>
              <button class="btn btn-primary btn-sm" onclick="printRfqComparison()">طباعة المقارنة 🖨️</button>
            </div>
          </div>
          <div class="invoice-lines" style="margin-top:0;">
            <table id="rfq-compare-table" style="width:100%; font-size:12px; border-collapse:collapse;">
              <thead>
                <tr style="background:var(--bg-3);">
                  <th style="padding:8px 8px; text-align:right;">#</th>
                  <th style="padding:8px 8px; text-align:right;">اسم الصنف</th>
                  <th style="padding:8px 8px; text-align:center;">الكمية</th>
                  <th style="padding:8px 8px; text-align:left; color:var(--brand);">السعر المعروض من المورد</th>
                  <th style="padding:8px 8px; text-align:left;">سعر التكلفة الحالية عندنا</th>
                  <th style="padding:8px 8px; text-align:left;">الفرق المالي والمئوي</th>
                  <th style="padding:8px 8px; text-align:left;">سعر البيع الحالي (تجزئة)</th>
                  <th style="padding:8px 8px; text-align:center;">هامش ربح العرض</th>
                  <th style="padding:8px 8px; text-align:center;">هامش الربح الحالي</th>
                </tr>
              </thead>
              <tbody id="rfq-compare-tbody"></tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('rfq-compare-modal')">إغلاق</button>
        </div>
      </div>
    </div>
  `,document.getElementById("rfq-search").addEventListener("input",k),document.getElementById("rfq-status-filter").addEventListener("change",k),document.getElementById("rfq-from")?.addEventListener("change",k),document.getElementById("rfq-to")?.addEventListener("change",k),document.getElementById("rfq-supplier-filter")?.addEventListener("change",k),O(),V(),await Promise.all([C(),j(),H()])}async function C(){try{const o=await E($.purchaseRequests(),[L("createdAt","desc")]);w.clear(),o.forEach(t=>w.set(t.id,t)),M(o),_(o)}catch(o){console.error("Error loading RFQs:",o)}}async function j(){try{R=await E($.suppliers(),[L("name")]);const o=document.getElementById("rfq-supplier-filter");o&&(o.innerHTML='<option value="">كل الموردين</option>'+R.map(t=>`<option value="${t.id}">${t.name}</option>`).join(""))}catch{}}async function H(){try{const[o,t]=await Promise.all([E($.products(),[L("name")]),E($.categories(),[L("name")])]);h=o,P=t;const e=document.getElementById("rfq-product-category-filter");e&&(e.innerHTML='<option value="">كل الفئات</option>'+P.map(n=>`<option value="${n.id}">${n.name}</option>`).join(""))}catch(o){console.error("loadProducts error:",o)}}function M(o){const t=document.getElementById("rfq-tbody");if(t){if(!o.length){t.innerHTML='<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-3);">لا توجد طلبات أسعار مسجلة حالياً</td></tr>';return}t.innerHTML=o.map(e=>{let n="gray",s="مسودة";return e.status==="sent"?(n="blue",s="تم الإرسال"):e.status==="completed"&&(n="good",s="مكتمل (مُسعّر)"),`
      <tr>
        <td class="mono font-bold">${e.number||"—"}</td>
        <td>${e.date||"—"}</td>
        <td><strong>${e.supplierName||"—"}</strong></td>
        <td>${e.lines?e.lines.length:0} أصناف</td>
        <td><span class="badge ${n}">${s}</span></td>
        <td>${e.targetDate||"—"}</td>
        <td style="text-align:left;">
          <div style="display:flex; gap:6px; justify-content:flex-end;">
            <button class="btn btn-secondary btn-sm" onclick="printRfqForSupplier('${e.id}')">طباعة للطلب 🖨️</button>
            <button class="btn btn-secondary btn-sm" onclick="openEnterPricesModal('${e.id}')">💵 إدخال الأسعار</button>
            ${e.status==="completed"?`<button class="btn btn-secondary btn-sm" onclick="openCompareModal('${e.id}')">📊 المقارنة والربح</button>`:""}
            <button class="btn btn-secondary btn-sm" onclick="openEditRfqModal('${e.id}')">تعديل ✏️</button>
            <button class="btn btn-ghost btn-sm text-bad" onclick="deleteRfq('${e.id}')">حذف 🗑️</button>
          </div>
        </td>
      </tr>
    `}).join("")}}function _(o){const t=o.length,e=o.filter(d=>d.status!=="completed").length,n=o.filter(d=>d.status==="completed").length;document.getElementById("rfq-stat-total").textContent=t,document.getElementById("rfq-stat-pending").textContent=e,document.getElementById("rfq-stat-completed").textContent=n;let s=0;o.filter(d=>d.status==="completed").forEach(d=>{d.lines.forEach(a=>{const i=parseFloat(a.offeredPrice||0),r=h.find(c=>c.id===a.productId),l=parseFloat(r?.costPrice||0);i>0&&l>0&&(s+=(l-i)*parseFloat(a.qty||0))})}),document.getElementById("rfq-stat-savings").textContent=b(s)}function k(){const o=document.getElementById("rfq-search").value.trim().toLowerCase(),t=document.getElementById("rfq-status-filter").value,e=document.getElementById("rfq-from")?.value||"",n=document.getElementById("rfq-to")?.value||"",s=document.getElementById("rfq-supplier-filter")?.value||"";let d=Array.from(w.values());t&&(d=d.filter(a=>a.status===t)),o&&(d=d.filter(a=>(a.number||"").toLowerCase().includes(o)||(a.supplierName||"").toLowerCase().includes(o))),e&&(d=d.filter(a=>a.date>=e)),n&&(d=d.filter(a=>a.date<=n)),s&&(d=d.filter(a=>a.supplierId===s)),M(d)}function O(){const o=document.getElementById("rfq-supplier-search"),t=document.getElementById("rfq-supplier-results");o&&(o.addEventListener("input",()=>{const e=o.value.trim().toLowerCase();if(!e){t.classList.add("hidden");return}const n=R.filter(s=>(s.name||"").toLowerCase().includes(e)||(s.phone||"").toLowerCase().includes(e));if(!n.length){t.classList.add("hidden");return}t.innerHTML=n.map(s=>`
      <div class="autocomplete-item" onclick="selectRfqSupplier('${s.id}','${s.name.replace(/'/g,"\\'")}')">
        <div>${s.name}</div>
        <div class="item-code">${s.phone||""}</div>
      </div>
    `).join(""),t.classList.remove("hidden")}),document.addEventListener("click",e=>{o.contains(e.target)||t.classList.add("hidden")}))}window.selectRfqSupplier=(o,t)=>{document.getElementById("rfq-supplier-id").value=o,document.getElementById("rfq-supplier-search").value=t,document.getElementById("rfq-supplier-results").classList.add("hidden")};function V(){const o=document.getElementById("rfq-product-search"),t=document.getElementById("rfq-product-results"),e=document.getElementById("rfq-product-category-filter");if(!o)return;const n=()=>{const s=o.value.trim(),d=s.toLowerCase(),a=e?e.value:"";if(!d&&!a){t.classList.add("hidden");return}let i=h;a&&(i=i.filter(l=>l.category===a)),d&&(i=i.filter(l=>(l.name||"").toLowerCase().includes(d)||(l.sku||"").toLowerCase().includes(d)||(l.barcode||"").toLowerCase().includes(d))),i=i.slice(0,15);let r="";i.length?r+=i.map(l=>{const c=u.some(p=>p.productId&&p.productId===l.id||p.sku&&l.sku&&p.sku===l.sku||p.productName&&l.name&&p.productName.trim()===l.name.trim());return`
          <div class="autocomplete-item ${c?"already-added":""}" 
               style="${c?"background:#fefce8; border-right:3px solid #eab308; cursor:pointer;":"cursor:pointer;"}" 
               onclick="addRfqLine('${l.id}')">
            <div class="flex justify-between" style="align-items:center;">
              <span style="font-weight:700;">${l.name}</span>
              ${c?`
                <span class="badge" style="background:#fef08a; color:#854d0e; font-size:10.5px; padding:2px 7px; border:1px solid #fde047; font-weight:800;">
                  ⚠️ مضاف مسبقاً بالطلب
                </span>
              `:`
                <span class="mono text-dim" style="font-size:11px;">التكلفة: ${b(l.costPrice||0)}</span>
              `}
            </div>
            <div class="item-code">${l.sku||""} | الوحدة: ${l.unit||""}</div>
          </div>
        `}).join(""):r+='<div style="padding:10px;text-align:center;color:var(--text-3); font-size:11.5px;">لا توجد أصناف مطابقة بالكتالوج</div>',s&&(r+=`
        <div class="autocomplete-item" style="background:#f0fdf4; border-top:1.5px dashed #86efac; color:#166534; font-weight:800; display:flex; align-items:center; gap:6px; cursor:pointer;" onclick="addCustomRfqLine('${s.replace(/'/g,"\\'")}')">
          <span>✍️</span>
          <span>إضافة "<b>${s}</b>" كصنف يدوي / بند حر جديد</span>
        </div>
      `),t.innerHTML=r,t.classList.remove("hidden")};o.addEventListener("input",n),o.addEventListener("focus",n),e&&e.addEventListener("change",n),o.addEventListener("keydown",s=>{if(s.key==="Enter"){s.preventDefault();const d=o.value.trim();if(d){const a=h.find(i=>i.name.trim().toLowerCase()===d.toLowerCase()||i.sku&&i.sku.trim().toLowerCase()===d.toLowerCase());a?addRfqLine(a.id):addCustomRfqLine(d)}}}),document.addEventListener("click",s=>{!o.contains(s.target)&&!t.contains(s.target)&&(!e||!e.contains(s.target))&&t.classList.add("hidden")})}window.openNewRfqModal=()=>{v=null,u=[],document.getElementById("rfq-modal-title").textContent="📨 طلب عروض أسعار جديد",document.getElementById("rfq-date").value=B(),document.getElementById("rfq-target-date").value="",document.getElementById("rfq-supplier-search").value="",document.getElementById("rfq-supplier-id").value="",document.getElementById("rfq-notes").value="",document.getElementById("rfq-lines-tbody").innerHTML="",document.getElementById("rfq-number").value="جارِ التوليد...",openModal("rfq-modal"),Q("RFQ").then(o=>{const t=document.getElementById("rfq-number");t&&(t.value=o)}).catch(o=>{const t=document.getElementById("rfq-number"),e=Date.now().toString(36).toUpperCase();t&&(t.value=`RFQ-T${e}`),console.warn("[RFQ] Counter fallback used:",o?.message)})};window.openEditRfqModal=o=>{const t=w.get(o);t&&(v=t,u=JSON.parse(JSON.stringify(t.lines||[])),document.getElementById("rfq-modal-title").textContent=`📨 تعديل طلب عروض الأسعار: ${t.number}`,document.getElementById("rfq-number").value=t.number,document.getElementById("rfq-date").value=t.date,document.getElementById("rfq-target-date").value=t.targetDate||"",document.getElementById("rfq-supplier-search").value=t.supplierName||"",document.getElementById("rfq-supplier-id").value=t.supplierId||"",document.getElementById("rfq-notes").value=t.notes||"",q(),openModal("rfq-modal"))};window.closeRfqModal=()=>{closeModal("rfq-modal")};window.addRfqLine=(o,t,e,n)=>{const s=h.find(p=>p.id===o),d=s?s.name:t||"",a=s?s.unit||"كرتون":e||"كرتون",i=s?s.sku||"":n||"",r=u.findIndex(p=>o&&p.productId===o||i&&p.sku&&p.sku===i||d&&p.productName&&p.productName.trim()===d.trim());if(r!==-1){const p=document.getElementById("rfq-product-search");p&&(p.value="");const m=document.getElementById("rfq-product-results");m&&m.classList.add("hidden");const f=document.getElementById(`rfq-line-row-${r}`);if(f){f.scrollIntoView({behavior:"smooth",block:"center"}),f.style.transition="background 0.3s ease",f.style.background="#fef08a",setTimeout(()=>{f.style.background=""},2500);const x=f.querySelector('input[type="number"]');x&&(x.focus(),x.select())}window.showToast?window.showToast(`⚠️ الصنف [${d}] مضاف بالفعل في السطر (#${r+1}) — تم الانتقال إليه لتعديل كميته`,"warning",5e3):alert(`⚠️ هذا الصنف [${d}] مضاف بالفعل في السطر (#${r+1}) في هذا الطلب.`);return}u.push({productId:o||`custom_${Date.now()}`,productName:d,unit:a,sku:i||"",qty:1,packQty:1,notes:"",offeredPrice:0,isCustom:!1});const l=document.getElementById("rfq-product-search");l&&(l.value="");const c=document.getElementById("rfq-product-results");c&&c.classList.add("hidden"),q(),setTimeout(()=>{const p=u.length-1,m=document.getElementById(`rfq-line-row-${p}`);if(m){m.scrollIntoView({behavior:"smooth",block:"center"}),m.style.transition="background 0.3s ease",m.style.background="#bbf7d0",setTimeout(()=>{m.style.background=""},1800);const f=m.querySelector('input[type="number"]');f&&(f.focus(),f.select())}},100),window.showToast&&window.showToast(`✅ تم إدراج الصنف [${d}] بنجاح في الطلب`,"success",3e3)};window.addCustomRfqLine=(o="")=>{const t=`custom_${Date.now()}_${Math.floor(Math.random()*1e3)}`,e=(typeof o=="string"?o.trim():"")||"";u.push({productId:t,productName:e,unit:"كرتون",sku:"حر",qty:1,packQty:1,notes:"",offeredPrice:0,isCustom:!0});const n=document.getElementById("rfq-product-search");n&&(n.value="");const s=document.getElementById("rfq-product-results");s&&s.classList.add("hidden"),q(),window.showToast&&window.showToast("✅ تمت إضافة سطر صنف يدوي (بند حر) — يمكنك كتابة الاسم والوحدة مباشرة","info"),setTimeout(()=>{const d=u.length-1,a=document.getElementById(`rfq-line-row-${d}`);if(a){a.scrollIntoView({behavior:"smooth",block:"center"});const i=a.querySelector(".rfq-custom-name-input");i&&(i.focus(),i.select())}},100)};function q(){const o=document.getElementById("rfq-lines-tbody");o&&(o.innerHTML=u.map((t,e)=>{const n=t.isCustom||!t.productId||String(t.productId).startsWith("custom_");return`
      <tr id="rfq-line-row-${e}" style="border-bottom:1px solid var(--border-soft); ${n?"background:rgba(16, 185, 129, 0.05);":""}">
        <td style="padding:6px 10px; font-weight:700; color:var(--text-2); text-align:center;">${e+1}</td>
        
        <!-- SKU -->
        <td style="padding:6px 10px;" class="mono">
          ${n?`
            <input type="text" class="form-control mono" style="width:80px; height:28px; font-size:11px; padding:2px 6px; border:1px dashed #cbd5e1;" 
                   value="${t.sku||""}" placeholder="كود اختياري" onchange="updateRfqLineField(${e}, 'sku', this.value)" />
          `:`<span class="mono">${t.sku||"—"}</span>`}
        </td>

        <!-- Product Name -->
        <td style="padding:6px 10px;">
          ${n?`
            <div style="display:flex; align-items:center; gap:6px;">
              <input type="text" class="form-control rfq-custom-name-input" 
                     style="font-weight:700; font-size:12px; height:28px; padding:2px 8px; border:1.5px solid #059669; background:#fff; width:100%; min-width:180px;" 
                     value="${t.productName||""}" placeholder="اكتب اسم الصنف هنا يدوي..." 
                     oninput="updateRfqLineField(${e}, 'productName', this.value)" />
              <span class="badge" style="background:#dcfce7; color:#166534; font-size:10px; padding:2px 6px; border:1px solid #86efac; white-space:nowrap;">بند حر ✍️</span>
            </div>
          `:`
            <div style="font-weight:600; font-size:12px; color:var(--text-0);">${t.productName}</div>
          `}
        </td>

        <!-- Unit -->
        <td style="padding:6px 10px;">
          ${n?`
            <input type="text" class="form-control" style="width:75px; height:28px; font-size:11px; padding:2px 6px; text-align:center; border:1px dashed #cbd5e1;" 
                   value="${t.unit||"كرتون"}" placeholder="الوحدة" onchange="updateRfqLineField(${e}, 'unit', this.value)" />
          `:`
            <span>${t.unit||"كرتون"}</span>
          `}
        </td>

        <!-- Quantity -->
        <td style="padding:6px 10px;">
          <input type="number" class="form-control mono" style="width:75px; height:28px; font-size:11px; padding:2px 6px; font-weight:700; color:var(--brand);" 
                 value="${t.qty}" min="1" step="1" onchange="updateRfqLineField(${e}, 'qty', this.value)" />
        </td>

        <!-- Pack Qty -->
        <td style="padding:6px 10px;">
          <input type="number" class="form-control mono" style="width:75px; height:28px; font-size:11px; padding:2px 6px;" 
                 value="${t.packQty||1}" min="1" step="1" onchange="updateRfqLineField(${e}, 'packQty', this.value)" />
        </td>

        <!-- Notes -->
        <td style="padding:6px 10px;">
          <input type="text" class="form-control" style="height:28px; font-size:11px; padding:2px 6px;" 
                 value="${t.notes||""}" placeholder="مواصفات توريد..." onchange="updateRfqLineField(${e}, 'notes', this.value)" />
        </td>

        <!-- Delete -->
        <td style="padding:6px 10px; text-align:center;">
          <button class="btn btn-ghost btn-sm text-bad" onclick="removeRfqLine(${e})" style="font-size:14px; cursor:pointer;" title="حذف البند">×</button>
        </td>
      </tr>
    `}).join(""))}window.updateRfqLineField=(o,t,e)=>{u[o]&&(t==="qty"||t==="packQty"?u[o][t]=Math.max(1,parseFloat(e)||1):u[o][t]=e)};window.removeRfqLine=o=>{u.splice(o,1),q()};window.addAllProductsToRfq=()=>{if(!h||h.length===0){g("لا توجد أصناف في الكتالوج","warning");return}const o=document.getElementById("rfq-product-category-filter")?.value;let t=h;if(o&&(t=h.filter(n=>n.category===o||n.categoryId===o)),!t.length){g("لا توجد أصناف تطابق الفئة المحددة","warning");return}if(!confirm(`هل تريد إدراج جميع أصناف الكتالوج (${t.length} صنف) في طلب الأسعار؟`))return;let e=0;t.forEach(n=>{u.some(s=>s.productId===n.id)||(u.push({productId:n.id,productName:n.name,unit:n.unit||"حبة",sku:n.sku||"",qty:1,packQty:1,notes:"",offeredPrice:0}),e++)}),q(),g(`✅ تم إدراج ${e} صنف في الطلب`,"success")};window.addLowStockProductsToRfq=()=>{if(!h||h.length===0){g("لا توجد أصناف مسجلة","warning");return}const o=h.filter(e=>{const n=parseFloat(e.totalQty||e.stockQty||0),s=parseFloat(e.reorderLevel||0);return n<=s});if(!o.length){g("لا توجد أصناف وصلت للحد الأدنى للمخزون حالياً","info");return}if(!confirm(`تم العثور على (${o.length}) صنف وصل للحد الأدنى (نواقص مخزن). هل تريد إدراجها بالطلب؟`))return;let t=0;o.forEach(e=>{if(!u.some(n=>n.productId===e.id)){const n=parseFloat(e.totalQty||e.stockQty||0),s=parseFloat(e.reorderLevel||10),d=Math.max(1,s*2-n);u.push({productId:e.id,productName:e.name,unit:e.unit||"حبة",sku:e.sku||"",qty:d,packQty:1,notes:`نواقص مخزن (الرصيد الحالي: ${n})`,offeredPrice:0}),t++}}),q(),g(`✅ تم إدراج ${t} صنف من نواقص المخزن`,"success")};window.clearAllRfqLines=()=>{u.length&&confirm("هل تريد تفريغ ومسح كافة البنود من الطلب؟")&&(u=[],q(),g("تم تفريغ البنود","info"))};const g=(o,t="info")=>{typeof window.showToast=="function"?window.showToast(o,t):(console.log(`[Toast ${t}]`,o),alert(o))};window.saveRfq=async()=>{const o=document.getElementById("rfq-date")?.value||B(),t=document.getElementById("rfq-number")?.value||"RFQ-000001";let e=document.getElementById("rfq-supplier-id")?.value,n=document.getElementById("rfq-supplier-search")?.value?.trim()||"";const s=document.getElementById("rfq-target-date")?.value||"",d=document.getElementById("rfq-notes")?.value?.trim()||"";if(!e&&n){const r=R.find(l=>l.name?.trim().toLowerCase()===n.toLowerCase());r?(e=r.id,n=r.name):e="custom"}if(n||(n="طلب تسعير عام (لكافة الموردين)",e="general"),!u||!u.length){g("يرجى إضافة صنف واحد على الأقل للطلب","warning");return}if(u.find(r=>!r.productName||!r.productName.trim())){g("يرجى كتابة اسم الصنف للبند اليدوي قبل الحفظ","warning");return}const i=document.getElementById("rfq-save-btn");i&&(i.disabled=!0,i.textContent="⏳ جارٍ الحفظ...");try{const r=u.map(c=>({productId:c.productId||`custom_${Date.now()}_${Math.floor(Math.random()*1e3)}`,productName:(c.productName||"").trim(),unit:(c.unit||"كرتون").trim(),sku:c.sku||"",qty:parseFloat(c.qty)||1,packQty:parseFloat(c.packQty)||1,notes:c.notes||"",offeredPrice:parseFloat(c.offeredPrice)||0,isCustom:!!(c.isCustom||!c.productId||String(c.productId).startsWith("custom_"))})),l={number:t,date:o,supplierId:e||"general",supplierName:n||"طلب تسعير عام",targetDate:s||"",notes:d||"",lines:r,itemCount:r.length,status:v&&v.status||"sent"};v&&v.id?(await z($.purchaseRequests(),v.id,l),g("تم تحديث طلب عروض الأسعار بنجاح ✅","success")):(await A($.purchaseRequests(),l),g("تم حفظ طلب عروض الأسعار بنجاح ✅","success")),closeModal("rfq-modal"),await C()}catch(r){console.error("Save RFQ Error:",r),g("حدث خطأ أثناء حفظ طلب الأسعار: "+r.message,"danger")}finally{i&&(i.disabled=!1,i.textContent="حفظ الطلب")}};let N=null,I=[];window.openEnterPricesModal=o=>{N=o;const t=w.get(o);if(!t)return;document.getElementById("rfq-p-supplier-name").textContent=t.supplierName||"",document.getElementById("rfq-p-number").textContent=t.number||"",I=JSON.parse(JSON.stringify(t.lines||[]));const e=document.getElementById("rfq-prices-tbody");e.innerHTML=I.map((n,s)=>`
    <tr style="border-bottom:1px solid var(--border-soft);">
      <td style="padding:6px 10px;">${s+1}</td>
      <td style="padding:6px 10px; font-weight:600;">${n.productName}</td>
      <td style="padding:6px 10px;">${n.unit}</td>
      <td style="padding:6px 10px;" class="mono">${n.qty}</td>
      <td style="padding:6px 10px;">
        <input type="number" class="form-control mono" style="width:110px; height:30px; font-size:12px; padding:2px 8px; border-color:var(--brand) !important;" value="${n.offeredPrice||""}" min="0" step="0.01" placeholder="0.00" onchange="updateOfferedPrice(${s}, this.value)" />
      </td>
      <td style="padding:6px 10px;">
        <input type="text" class="form-control" style="height:30px; font-size:12px; padding:2px 8px;" value="${n.supplyNotes||""}" placeholder="مثال: جاهز للتوصيل فوراً..." onchange="updateSupplyNotes(${s}, this.value)" />
      </td>
    </tr>
  `).join(""),openModal("rfq-prices-modal")};window.updateOfferedPrice=(o,t)=>{I[o].offeredPrice=parseFloat(t)||0};window.updateSupplyNotes=(o,t)=>{I[o].supplyNotes=t};window.saveRfqPrices=async()=>{const o=document.getElementById("rfq-prices-save-btn");o.disabled=!0;try{await z("purchaseRequests",N,{lines:I,status:"completed"}),g("تم إدخال الأسعار وحفظ العرض بنجاح","success"),closeModal("rfq-prices-modal"),await C()}catch{g("خطأ أثناء حفظ الأسعار","danger")}finally{o.disabled=!1}};let y=null;window.openCompareModal=o=>{const t=w.get(o);if(!t)return;y=t,document.getElementById("rfq-comp-supplier").textContent=t.supplierName||"",document.getElementById("rfq-comp-number").textContent=t.number||"",document.getElementById("rfq-comp-date").textContent=t.date||"";const e=document.getElementById("rfq-compare-tbody");e.innerHTML="";let n=0;t.lines.forEach((s,d)=>{const a=h.find(T=>T.id===s.productId),i=a?parseFloat(a.costPrice||0):0,r=a?parseFloat(a.salePrice||0):0,l=parseFloat(s.offeredPrice||0),c=parseFloat(s.qty||0),p=l-i,m=i>0?p/i*100:0;l>0&&i>0&&(n+=(i-l)*c);let f="—",x="mono";p<0?(f=`توفير ${b(Math.abs(p))} (${Math.abs(m).toFixed(1)}%)`,x="mono text-good"):p>0?(f=`زيادة ${b(p)} (${m.toFixed(1)}%)`,x="mono text-bad"):l>0&&i>0&&(f="متطابق",x="mono text-dim");const F=r>0?(r-i)/r*100:0,S=r>0?(r-l)/r*100:0;e.innerHTML+=`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:8px; text-align:right;">${d+1}</td>
        <td style="padding:8px; font-weight:600;">${s.productName}</td>
        <td style="padding:8px; text-align:center;" class="mono">${c}</td>
        <td style="padding:8px; text-align:left; font-weight:700;" class="mono text-indigo">${b(l)}</td>
        <td style="padding:8px; text-align:left;" class="mono">${b(i)}</td>
        <td style="padding:8px; text-align:left;" class="${x}">${f}</td>
        <td style="padding:8px; text-align:left;" class="mono">${b(r)}</td>
        <td style="padding:8px; text-align:center;" class="mono text-indigo font-bold">${S.toFixed(1)}%</td>
        <td style="padding:8px; text-align:center;" class="mono">${F.toFixed(1)}%</td>
      </tr>
    `}),document.getElementById("rfq-comp-totalsavings").textContent=b(n),openModal("rfq-compare-modal")};window.exportComparisonCSV=()=>{if(!y)return;let o=`\uFEFF#;الصنف;الكمية;سعر المورد المقترح;تكلفة الشراء الحالية عندنا;الفرق المالي;سعر البيع الحالي;هامش ربح العرض;هامش الربح الحالي
`;y.lines.forEach((n,s)=>{const d=h.find(m=>m.id===n.productId),a=d?parseFloat(d.costPrice||0):0,i=d?parseFloat(d.salePrice||0):0,r=parseFloat(n.offeredPrice||0),l=i>0?(i-a)/i*100:0,c=i>0?(i-r)/i*100:0,p=r-a;o+=`${s+1};"${n.productName}";${n.qty};${r};${a};${p};${i};${c.toFixed(2)}%;${l.toFixed(2)}%
`});const t=new Blob([o],{type:"text/csv;charset=utf-8;"}),e=document.createElement("a");e.href=URL.createObjectURL(t),e.setAttribute("download",`مقارنة_أسعار_طلب_${y.number}.csv`),document.body.appendChild(e),e.click(),document.body.removeChild(e)};window.printRfqForSupplier=o=>{const t=w.get(o);if(!t)return;let e={};try{e=JSON.parse(localStorage.getItem("idham_company")||"{}")}catch{}const n=e.name||e.nameAr||"شركة نظم الإمداد المتطوره",s=[e.address,e.city,e.country].filter(Boolean).join("، ")||"ينبع الصناعية — حي غرناطة",d=e.phone||"0549141648",a=e.vatNumber||"314996148100003",i=e.crNumber||"7054969006",r=e.email||"Nuzmalamdad@gmail.com",l=e.logoBase64||"",c=e.primaryColor||"#4f46e5",p=t.lines.map((x,F)=>`
    <tr>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; text-align:center; width:30px;">${F+1}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; font-family:monospace; font-size:11px;">${x.sku||"—"}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; font-weight:600;">${x.productName}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; text-align:center;">${x.unit}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; text-align:center; font-family:monospace;">${x.qty}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; text-align:center; font-family:monospace;">${x.packQty||1}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; background:#fefce8;"></td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; color:#94a3b8; font-style:italic; font-size:11px;">${x.notes||""}</td>
    </tr>`).join(""),m=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${n} — طلب عرض أسعار ${t.number}</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    @page { size: A4; margin: 8mm 10mm; }
    body {
      font-family: 'IBM Plex Sans Arabic', Tahoma, sans-serif;
      font-size: 11px; color: #111; direction: rtl;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    /* Header */
    .hdr {
      display: flex; justify-content: space-between; align-items: center;
      background: ${c}; color: #fff;
      padding: 12px 16px; border-radius: 8px 8px 0 0;
      margin-bottom: 0;
    }
    .hdr-left { display:flex; align-items:center; gap:12px; }
    .co-logo { max-height:52px; max-width:110px; object-fit:contain;
               background:#fff; padding:4px; border-radius:5px; }
    .co-name { font-size:17px; font-weight:800; color:#fff; margin-bottom:3px; }
    .co-info { font-size:9px; color:rgba(255,255,255,0.85); line-height:1.7; }
    /* Doc strip */
    .doc-strip {
      background:#1a1a2e; color:#fff;
      display:flex; justify-content:space-between; align-items:center;
      padding:8px 16px; margin-bottom:12px;
    }
    .doc-title { font-size:14px; font-weight:700; }
    .doc-meta  { font-size:10px; color:rgba(255,255,255,0.8); text-align:left; }
    /* Recipient box */
    .recip-box {
      background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px;
      padding:10px 14px; margin-bottom:10px; font-size:12px; line-height:1.8;
    }
    /* Table */
    table { width:100%; border-collapse:collapse; font-size:11px; margin-bottom:12px; }
    thead tr { background:#1a1a2e; color:#fff; }
    thead th { padding:8px 6px; text-align:right; border:1px solid #334155; font-size:10px; white-space:nowrap; }
    tbody tr:nth-child(even) { background:#f8fafc; }
    /* Signature */
    .sig-row { display:flex; justify-content:space-between; margin-top:16px; }
    .sig-box { text-align:center; width:200px; font-size:11px; }
    .sig-line { border-top:1px solid #999; margin-top:40px; padding-top:4px; }
    /* Footer */
    .ftr { margin-top:12px; padding-top:8px; border-top:2px solid ${c};
           display:flex; justify-content:space-between; font-size:9px; color:#666; }
    @media print {
      body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    }
  </style>
</head>
<body>

  <!-- Company Header -->
  <div class="hdr">
    <div class="hdr-left">
      ${l?`<img class="co-logo" src="${l}" alt="شعار الشركة">`:""}
      <div>
        <div class="co-name">${n}</div>
        <div class="co-info">
          ${`📍 ${s}<br>`}
          ${`📞 ${d}`}${`   ✉️ ${r}`}<br>
          ${`الرقم الضريبي: ${a}`}   |   ${`س.ت: ${i}`}
        </div>
      </div>
    </div>
    <div style="text-align:left; color:rgba(255,255,255,0.85);">
      <div style="font-size:11px; font-weight:700; color:#fff;">طلب عرض أسعار (RFQ)</div>
      <div style="font-size:10px; margin-top:4px;">رقم الطلب: <strong style="color:#fff; font-family:monospace;">${t.number}</strong></div>
      <div style="font-size:10px;">التاريخ: ${t.date}</div>
    </div>
  </div>

  <!-- Doc strip -->
  <div class="doc-strip">
    <div class="doc-title">طلب عرض أسعار (Request for Quotation)</div>
    <div class="doc-meta">الحالة: ${t.status==="sent"?"تم الإرسال":t.status==="completed"?"مكتمل":"مسودة"}</div>
  </div>

  <!-- Recipient -->
  <div class="recip-box">
    <p><strong>موجه للسيد / الموقر:</strong> <span style="font-size:13px; font-weight:700; color:#1e293b;">${t.supplierName}</span></p>
    <p><strong>تاريخ الاستجابة وتقديم السعر المأمول:</strong> ${t.targetDate||"—"}</p>
    ${t.notes?`<p><strong>ملاحظات وشروط إضافية:</strong> ${t.notes}</p>`:""}
  </div>

  <p style="font-size:12px; margin-bottom:10px; color:#334155;">
    السادة الموردين الكرام، نرجو التكرم بتعبئة الأسعار المقترحة للكميات المذكورة أدناه وإعادة إرسال المستند إلينا:
  </p>

  <!-- Items Table -->
  <table>
    <thead>
      <tr>
        <th style="width:30px; text-align:center;">#</th>
        <th style="width:110px;">كود الصنف</th>
        <th>اسم الصنف والمواصفات</th>
        <th style="width:70px;">الوحدة</th>
        <th style="width:60px; text-align:center;">الكمية</th>
        <th style="width:70px; text-align:center;">الكراتين</th>
        <th style="width:120px; color:#fcd34d;">سعر المفرد المقترح</th>
        <th style="width:150px;">ملاحظات المورد</th>
      </tr>
    </thead>
    <tbody>${p}</tbody>
  </table>

  <!-- Signatures -->
  <div class="sig-row">
    <div class="sig-box">
      <strong>توقيع وختم إدارة المشتريات</strong>
      <div class="sig-line">${n}</div>
    </div>
    <div class="sig-box">
      <strong>اعتماد وتوقيع المورد المستجيب</strong>
      <div class="sig-line">${t.supplierName}</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="ftr">
    <span style="font-weight:600;">${n}</span>
    <span>${t.number} — ${t.date}</span>
  </div>

</body>
</html>`,f=window.open("","_blank","width=900,height=700");if(!f){g("يُرجى السماح بالنوافذ المنبثقة للطباعة","warning");return}f.document.write(m),f.document.close(),f.onload=()=>setTimeout(()=>f.print(),700),g("جاري تحضير المستند للطباعة...","info")};window.printRfqComparison=()=>{if(!y)return;const o=document.getElementById("rfq-print-area");let t=0;const e=y.lines.map((n,s)=>{const d=h.find(f=>f.id===n.productId),a=d?parseFloat(d.costPrice||0):0,i=d?parseFloat(d.salePrice||0):0,r=parseFloat(n.offeredPrice||0),l=parseFloat(n.qty||0),c=r-a,p=a>0?c/a*100:0;r>0&&a>0&&(t+=(a-r)*l);let m="متطابق";return c<0?m=`توفير ${Math.abs(c).toFixed(2)} ر.س (${Math.abs(p).toFixed(1)}%)`:c>0&&(m=`زيادة ${c.toFixed(2)} ر.س (${p.toFixed(1)}%)`),`
      <tr style="border-bottom:1px solid #cbd5e1;">
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:right;">${s+1}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold;">${n.productName}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:center;" class="mono">${l}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:left; font-weight:bold;" class="mono">${b(r)}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:left;" class="mono">${b(a)}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:left;" class="mono">${m}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:left;" class="mono">${b(i)}</td>
      </tr>
    `}).join("");o.innerHTML=`
    <div style="direction:rtl; text-align:right; font-family:'IBM Plex Sans Arabic', sans-serif; padding:40px; color:#000; background:#fff;">
      <h2 style="margin:0 0 5px 0; font-size:22px; color:#1e293b;">تقرير مقارنة عروض الأسعار ونسب الأرباح</h2>
      <p style="margin:0 0 20px 0; font-size:12px; color:#64748b;">تاريخ التقرير: ${B()}</p>

      <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:16px; border-radius:6px; margin-bottom:24px; font-size:13px; line-height:1.6;">
        <p><strong>المورد:</strong> ${y.supplierName}</p>
        <p><strong>رقم العرض المرجعي:</strong> ${y.number}</p>
        <p><strong>إجمالي القيمة التوفيرية للعرض:</strong> <span style="font-size:15px; font-weight:bold; color:#10b981;">${b(t)}</span></p>
      </div>

      <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:30px;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="padding:8px; border:1px solid #cbd5e1; text-align:right; width:30px;">#</th>
            <th style="padding:8px; border:1px solid #cbd5e1; text-align:right;">اسم الصنف</th>
            <th style="padding:8px; border:1px solid #cbd5e1; text-align:center; width:50px;">الكمية</th>
            <th style="padding:8px; border:1px solid #cbd5e1; text-align:left; width:90px;">عرض المورد</th>
            <th style="padding:8px; border:1px solid #cbd5e1; text-align:left; width:90px;">التكلفة الحالية</th>
            <th style="padding:8px; border:1px solid #cbd5e1; text-align:left; width:130px;">الفرق التقديري</th>
            <th style="padding:8px; border:1px solid #cbd5e1; text-align:left; width:90px;">سعر البيع</th>
          </tr>
        </thead>
        <tbody>
          ${e}
        </tbody>
      </table>
    </div>
  `,window.print()};window.exportRFQsListPDF=()=>{typeof exportPagePDF=="function"?exportPagePDF("#rfqs-main-table","سجل_طلبات_عروض_الأسعار_RFQ","قائمة طلبات عروض أسعار الموردين والعهد"):window.print()};window.deleteRfq=async o=>{if(confirm("هل أنت متأكد من حذف طلب عروض الأسعار هذا؟"))try{await D("purchaseRequests",o),g("تم حذف طلب الأسعار بنجاح","success"),await C()}catch{g("حدث خطأ أثناء الحذف","danger")}};export{X as render};
