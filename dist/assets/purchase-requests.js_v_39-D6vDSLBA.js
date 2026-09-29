import{t as B,g as I,a as q,f as x,z as Q,u as M,o as j,r as A}from"./index-3Bsn2yrt.js";import{orderBy as L}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let u=[],R=[],C=[],w=new Map,v=null,c=[];async function X(o,t){o.innerHTML=`
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
                <div class="autocomplete-container" style="width:320px;">
                  <input type="text" id="rfq-product-search" class="form-control" placeholder="+ أضف صنفاً… (بالاسم أو الكود)" autocomplete="off" style="height:34px; font-size:12px;" />
                  <div class="autocomplete-results hidden" id="rfq-product-results"></div>
                </div>
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
  `,document.getElementById("rfq-search").addEventListener("input",k),document.getElementById("rfq-status-filter").addEventListener("change",k),document.getElementById("rfq-from")?.addEventListener("change",k),document.getElementById("rfq-to")?.addEventListener("change",k),document.getElementById("rfq-supplier-filter")?.addEventListener("change",k),_(),J(),await Promise.all([F(),D(),H()])}async function F(){try{const o=await I(q.purchaseRequests(),[L("createdAt","desc")]);w.clear(),o.forEach(t=>w.set(t.id,t)),z(o),O(o)}catch(o){console.error("Error loading RFQs:",o)}}async function D(){try{R=await I(q.suppliers(),[L("name")]);const o=document.getElementById("rfq-supplier-filter");o&&(o.innerHTML='<option value="">كل الموردين</option>'+R.map(t=>`<option value="${t.id}">${t.name}</option>`).join(""))}catch{}}async function H(){try{const[o,t]=await Promise.all([I(q.products(),[L("name")]),I(q.categories(),[L("name")])]);u=o,C=t;const e=document.getElementById("rfq-product-category-filter");e&&(e.innerHTML='<option value="">كل الفئات</option>'+C.map(n=>`<option value="${n.id}">${n.name}</option>`).join(""))}catch(o){console.error("loadProducts error:",o)}}function z(o){const t=document.getElementById("rfq-tbody");if(t){if(!o.length){t.innerHTML='<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-3);">لا توجد طلبات أسعار مسجلة حالياً</td></tr>';return}t.innerHTML=o.map(e=>{let n="gray",d="مسودة";return e.status==="sent"?(n="blue",d="تم الإرسال"):e.status==="completed"&&(n="good",d="مكتمل (مُسعّر)"),`
      <tr>
        <td class="mono font-bold">${e.number||"—"}</td>
        <td>${e.date||"—"}</td>
        <td><strong>${e.supplierName||"—"}</strong></td>
        <td>${e.lines?e.lines.length:0} أصناف</td>
        <td><span class="badge ${n}">${d}</span></td>
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
    `}).join("")}}function O(o){const t=o.length,e=o.filter(a=>a.status!=="completed").length,n=o.filter(a=>a.status==="completed").length;document.getElementById("rfq-stat-total").textContent=t,document.getElementById("rfq-stat-pending").textContent=e,document.getElementById("rfq-stat-completed").textContent=n;let d=0;o.filter(a=>a.status==="completed").forEach(a=>{a.lines.forEach(i=>{const s=parseFloat(i.offeredPrice||0),l=u.find(f=>f.id===i.productId),r=parseFloat(l?.costPrice||0);s>0&&r>0&&(d+=(r-s)*parseFloat(i.qty||0))})}),document.getElementById("rfq-stat-savings").textContent=x(d)}function k(){const o=document.getElementById("rfq-search").value.trim().toLowerCase(),t=document.getElementById("rfq-status-filter").value,e=document.getElementById("rfq-from")?.value||"",n=document.getElementById("rfq-to")?.value||"",d=document.getElementById("rfq-supplier-filter")?.value||"";let a=Array.from(w.values());t&&(a=a.filter(i=>i.status===t)),o&&(a=a.filter(i=>(i.number||"").toLowerCase().includes(o)||(i.supplierName||"").toLowerCase().includes(o))),e&&(a=a.filter(i=>i.date>=e)),n&&(a=a.filter(i=>i.date<=n)),d&&(a=a.filter(i=>i.supplierId===d)),z(a)}function _(){const o=document.getElementById("rfq-supplier-search"),t=document.getElementById("rfq-supplier-results");o&&(o.addEventListener("input",()=>{const e=o.value.trim().toLowerCase();if(!e){t.classList.add("hidden");return}const n=R.filter(d=>(d.name||"").toLowerCase().includes(e)||(d.phone||"").toLowerCase().includes(e));if(!n.length){t.classList.add("hidden");return}t.innerHTML=n.map(d=>`
      <div class="autocomplete-item" onclick="selectRfqSupplier('${d.id}','${d.name.replace(/'/g,"\\'")}')">
        <div>${d.name}</div>
        <div class="item-code">${d.phone||""}</div>
      </div>
    `).join(""),t.classList.remove("hidden")}),document.addEventListener("click",e=>{o.contains(e.target)||t.classList.add("hidden")}))}window.selectRfqSupplier=(o,t)=>{document.getElementById("rfq-supplier-id").value=o,document.getElementById("rfq-supplier-search").value=t,document.getElementById("rfq-supplier-results").classList.add("hidden")};function J(){const o=document.getElementById("rfq-product-search"),t=document.getElementById("rfq-product-results"),e=document.getElementById("rfq-product-category-filter");if(!o)return;const n=()=>{const d=o.value.trim().toLowerCase(),a=e?e.value:"";if(!d&&!a){t.classList.add("hidden");return}let i=u;if(a&&(i=i.filter(s=>s.category===a)),d&&(i=i.filter(s=>(s.name||"").toLowerCase().includes(d)||(s.sku||"").toLowerCase().includes(d)||(s.barcode||"").toLowerCase().includes(d))),i=i.slice(0,15),!i.length){t.innerHTML='<div style="padding:10px;text-align:center;color:var(--text-3);">لا توجد نتائج</div>',t.classList.remove("hidden");return}t.innerHTML=i.map(s=>`
      <div class="autocomplete-item" onclick="addRfqLine('${s.id}', '${s.name.replace(/'/g,"\\'")}', '${s.unit||"حبة"}', '${s.sku||""}')">
        <div class="flex justify-between">
          <span>${s.name}</span>
          <span class="mono text-dim" style="font-size:11px;">التكلفة: ${x(s.costPrice||0)}</span>
        </div>
        <div class="item-code">${s.sku||""} | الوحدة: ${s.unit||""}</div>
      </div>
    `).join(""),t.classList.remove("hidden")};o.addEventListener("input",n),o.addEventListener("focus",n),e&&e.addEventListener("change",n),document.addEventListener("click",d=>{!o.contains(d.target)&&!t.contains(d.target)&&(!e||!e.contains(d.target))&&t.classList.add("hidden")})}window.openNewRfqModal=()=>{v=null,c=[],document.getElementById("rfq-modal-title").textContent="📨 طلب عروض أسعار جديد",document.getElementById("rfq-date").value=B(),document.getElementById("rfq-target-date").value="",document.getElementById("rfq-supplier-search").value="",document.getElementById("rfq-supplier-id").value="",document.getElementById("rfq-notes").value="",document.getElementById("rfq-lines-tbody").innerHTML="",document.getElementById("rfq-number").value="جارِ التوليد...",openModal("rfq-modal"),Q("RFQ").then(o=>{const t=document.getElementById("rfq-number");t&&(t.value=o)}).catch(o=>{const t=document.getElementById("rfq-number"),e=Date.now().toString(36).toUpperCase();t&&(t.value=`RFQ-T${e}`),console.warn("[RFQ] Counter fallback used:",o?.message)})};window.openEditRfqModal=o=>{const t=w.get(o);t&&(v=t,c=JSON.parse(JSON.stringify(t.lines||[])),document.getElementById("rfq-modal-title").textContent=`📨 تعديل طلب عروض الأسعار: ${t.number}`,document.getElementById("rfq-number").value=t.number,document.getElementById("rfq-date").value=t.date,document.getElementById("rfq-target-date").value=t.targetDate||"",document.getElementById("rfq-supplier-search").value=t.supplierName||"",document.getElementById("rfq-supplier-id").value=t.supplierId||"",document.getElementById("rfq-notes").value=t.notes||"",$(),openModal("rfq-modal"))};window.closeRfqModal=()=>{closeModal("rfq-modal")};window.addRfqLine=(o,t,e,n)=>{if(c.some(d=>d.productId===o)){p("هذا الصنف مضاف بالفعل للطلب","warning");return}c.push({productId:o,productName:t,unit:e,sku:n,qty:1,packQty:1,notes:"",offeredPrice:0}),document.getElementById("rfq-product-search").value="",document.getElementById("rfq-product-results").classList.add("hidden"),$()};function $(){const o=document.getElementById("rfq-lines-tbody");o.innerHTML=c.map((t,e)=>`
    <tr style="border-bottom:1px solid var(--border-soft);">
      <td style="padding:6px 10px;">${e+1}</td>
      <td style="padding:6px 10px;" class="mono">${t.sku||"—"}</td>
      <td style="padding:6px 10px; font-weight:600;">${t.productName}</td>
      <td style="padding:6px 10px;">${t.unit}</td>
      <td style="padding:6px 10px;">
        <input type="number" class="form-control mono" style="width:75px; height:28px; font-size:11px; padding:2px 6px;" value="${t.qty}" min="1" step="1" onchange="updateRfqLineField(${e}, 'qty', this.value)" />
      </td>
      <td style="padding:6px 10px;">
        <input type="number" class="form-control mono" style="width:75px; height:28px; font-size:11px; padding:2px 6px;" value="${t.packQty}" min="1" step="1" onchange="updateRfqLineField(${e}, 'packQty', this.value)" />
      </td>
      <td style="padding:6px 10px;">
        <input type="text" class="form-control" style="height:28px; font-size:11px; padding:2px 6px;" value="${t.notes}" placeholder="مواصفات توريد..." onchange="updateRfqLineField(${e}, 'notes', this.value)" />
      </td>
      <td style="padding:6px 10px;">
        <button class="btn btn-ghost btn-sm text-bad" onclick="removeRfqLine(${e})">×</button>
      </td>
    </tr>
  `).join("")}window.updateRfqLineField=(o,t,e)=>{t==="qty"||t==="packQty"?c[o][t]=parseFloat(e)||1:c[o][t]=e};window.removeRfqLine=o=>{c.splice(o,1),$()};window.addAllProductsToRfq=()=>{if(!u||u.length===0){p("لا توجد أصناف في الكتالوج","warning");return}const o=document.getElementById("rfq-product-category-filter")?.value;let t=u;if(o&&(t=u.filter(n=>n.category===o||n.categoryId===o)),!t.length){p("لا توجد أصناف تطابق الفئة المحددة","warning");return}if(!confirm(`هل تريد إدراج جميع أصناف الكتالوج (${t.length} صنف) في طلب الأسعار؟`))return;let e=0;t.forEach(n=>{c.some(d=>d.productId===n.id)||(c.push({productId:n.id,productName:n.name,unit:n.unit||"حبة",sku:n.sku||"",qty:1,packQty:1,notes:"",offeredPrice:0}),e++)}),$(),p(`✅ تم إدراج ${e} صنف في الطلب`,"success")};window.addLowStockProductsToRfq=()=>{if(!u||u.length===0){p("لا توجد أصناف مسجلة","warning");return}const o=u.filter(e=>{const n=parseFloat(e.totalQty||e.stockQty||0),d=parseFloat(e.reorderLevel||0);return n<=d});if(!o.length){p("لا توجد أصناف وصلت للحد الأدنى للمخزون حالياً","info");return}if(!confirm(`تم العثور على (${o.length}) صنف وصل للحد الأدنى (نواقص مخزن). هل تريد إدراجها بالطلب؟`))return;let t=0;o.forEach(e=>{if(!c.some(n=>n.productId===e.id)){const n=parseFloat(e.totalQty||e.stockQty||0),d=parseFloat(e.reorderLevel||10),a=Math.max(1,d*2-n);c.push({productId:e.id,productName:e.name,unit:e.unit||"حبة",sku:e.sku||"",qty:a,packQty:1,notes:`نواقص مخزن (الرصيد الحالي: ${n})`,offeredPrice:0}),t++}}),$(),p(`✅ تم إدراج ${t} صنف من نواقص المخزن`,"success")};window.clearAllRfqLines=()=>{c.length&&confirm("هل تريد تفريغ ومسح كافة البنود من الطلب؟")&&(c=[],$(),p("تم تفريغ البنود","info"))};const p=(o,t="info")=>{typeof window.showToast=="function"?window.showToast(o,t):(console.log(`[Toast ${t}]`,o),alert(o))};window.saveRfq=async()=>{const o=document.getElementById("rfq-date")?.value||B(),t=document.getElementById("rfq-number")?.value||"RFQ-000001";let e=document.getElementById("rfq-supplier-id")?.value,n=document.getElementById("rfq-supplier-search")?.value?.trim()||"";const d=document.getElementById("rfq-target-date")?.value||"",a=document.getElementById("rfq-notes")?.value?.trim()||"";if(!e&&n){const s=R.find(l=>l.name?.trim().toLowerCase()===n.toLowerCase());s?(e=s.id,n=s.name):e="custom"}if(n||(n="طلب تسعير عام (لكافة الموردين)",e="general"),!c||!c.length){p("يرجى إضافة صنف واحد على الأقل للطلب","warning");return}const i=document.getElementById("rfq-save-btn");i&&(i.disabled=!0,i.textContent="⏳ جارٍ الحفظ...");try{const s=c.map(r=>({productId:r.productId||"",productName:r.productName||"",unit:r.unit||"حبة",sku:r.sku||"",qty:parseFloat(r.qty)||1,packQty:parseFloat(r.packQty)||1,notes:r.notes||"",offeredPrice:parseFloat(r.offeredPrice)||0})),l={number:t,date:o,supplierId:e||"general",supplierName:n||"طلب تسعير عام",targetDate:d||"",notes:a||"",lines:s,itemCount:s.length,status:v&&v.status||"sent"};v&&v.id?(await M(q.purchaseRequests(),v.id,l),p("تم تحديث طلب عروض الأسعار بنجاح ✅","success")):(await j(q.purchaseRequests(),l),p("تم حفظ طلب عروض الأسعار بنجاح ✅","success")),closeModal("rfq-modal"),await F()}catch(s){console.error("Save RFQ Error:",s),p("حدث خطأ أثناء حفظ طلب الأسعار: "+s.message,"danger")}finally{i&&(i.disabled=!1,i.textContent="حفظ الطلب")}};let S=null,E=[];window.openEnterPricesModal=o=>{S=o;const t=w.get(o);if(!t)return;document.getElementById("rfq-p-supplier-name").textContent=t.supplierName||"",document.getElementById("rfq-p-number").textContent=t.number||"",E=JSON.parse(JSON.stringify(t.lines||[]));const e=document.getElementById("rfq-prices-tbody");e.innerHTML=E.map((n,d)=>`
    <tr style="border-bottom:1px solid var(--border-soft);">
      <td style="padding:6px 10px;">${d+1}</td>
      <td style="padding:6px 10px; font-weight:600;">${n.productName}</td>
      <td style="padding:6px 10px;">${n.unit}</td>
      <td style="padding:6px 10px;" class="mono">${n.qty}</td>
      <td style="padding:6px 10px;">
        <input type="number" class="form-control mono" style="width:110px; height:30px; font-size:12px; padding:2px 8px; border-color:var(--brand) !important;" value="${n.offeredPrice||""}" min="0" step="0.01" placeholder="0.00" onchange="updateOfferedPrice(${d}, this.value)" />
      </td>
      <td style="padding:6px 10px;">
        <input type="text" class="form-control" style="height:30px; font-size:12px; padding:2px 8px;" value="${n.supplyNotes||""}" placeholder="مثال: جاهز للتوصيل فوراً..." onchange="updateSupplyNotes(${d}, this.value)" />
      </td>
    </tr>
  `).join(""),openModal("rfq-prices-modal")};window.updateOfferedPrice=(o,t)=>{E[o].offeredPrice=parseFloat(t)||0};window.updateSupplyNotes=(o,t)=>{E[o].supplyNotes=t};window.saveRfqPrices=async()=>{const o=document.getElementById("rfq-prices-save-btn");o.disabled=!0;try{await M("purchaseRequests",S,{lines:E,status:"completed"}),p("تم إدخال الأسعار وحفظ العرض بنجاح","success"),closeModal("rfq-prices-modal"),await F()}catch{p("خطأ أثناء حفظ الأسعار","danger")}finally{o.disabled=!1}};let h=null;window.openCompareModal=o=>{const t=w.get(o);if(!t)return;h=t,document.getElementById("rfq-comp-supplier").textContent=t.supplierName||"",document.getElementById("rfq-comp-number").textContent=t.number||"",document.getElementById("rfq-comp-date").textContent=t.date||"";const e=document.getElementById("rfq-compare-tbody");e.innerHTML="";let n=0;t.lines.forEach((d,a)=>{const i=u.find(T=>T.id===d.productId),s=i?parseFloat(i.costPrice||0):0,l=i?parseFloat(i.salePrice||0):0,r=parseFloat(d.offeredPrice||0),f=parseFloat(d.qty||0),g=r-s,y=s>0?g/s*100:0;r>0&&s>0&&(n+=(s-r)*f);let m="—",b="mono";g<0?(m=`توفير ${x(Math.abs(g))} (${Math.abs(y).toFixed(1)}%)`,b="mono text-good"):g>0?(m=`زيادة ${x(g)} (${y.toFixed(1)}%)`,b="mono text-bad"):r>0&&s>0&&(m="متطابق",b="mono text-dim");const P=l>0?(l-s)/l*100:0,N=l>0?(l-r)/l*100:0;e.innerHTML+=`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:8px; text-align:right;">${a+1}</td>
        <td style="padding:8px; font-weight:600;">${d.productName}</td>
        <td style="padding:8px; text-align:center;" class="mono">${f}</td>
        <td style="padding:8px; text-align:left; font-weight:700;" class="mono text-indigo">${x(r)}</td>
        <td style="padding:8px; text-align:left;" class="mono">${x(s)}</td>
        <td style="padding:8px; text-align:left;" class="${b}">${m}</td>
        <td style="padding:8px; text-align:left;" class="mono">${x(l)}</td>
        <td style="padding:8px; text-align:center;" class="mono text-indigo font-bold">${N.toFixed(1)}%</td>
        <td style="padding:8px; text-align:center;" class="mono">${P.toFixed(1)}%</td>
      </tr>
    `}),document.getElementById("rfq-comp-totalsavings").textContent=x(n),openModal("rfq-compare-modal")};window.exportComparisonCSV=()=>{if(!h)return;let o=`\uFEFF#;الصنف;الكمية;سعر المورد المقترح;تكلفة الشراء الحالية عندنا;الفرق المالي;سعر البيع الحالي;هامش ربح العرض;هامش الربح الحالي
`;h.lines.forEach((n,d)=>{const a=u.find(y=>y.id===n.productId),i=a?parseFloat(a.costPrice||0):0,s=a?parseFloat(a.salePrice||0):0,l=parseFloat(n.offeredPrice||0),r=s>0?(s-i)/s*100:0,f=s>0?(s-l)/s*100:0,g=l-i;o+=`${d+1};"${n.productName}";${n.qty};${l};${i};${g};${s};${f.toFixed(2)}%;${r.toFixed(2)}%
`});const t=new Blob([o],{type:"text/csv;charset=utf-8;"}),e=document.createElement("a");e.href=URL.createObjectURL(t),e.setAttribute("download",`مقارنة_أسعار_طلب_${h.number}.csv`),document.body.appendChild(e),e.click(),document.body.removeChild(e)};window.printRfqForSupplier=o=>{const t=w.get(o);if(!t)return;let e={};try{e=JSON.parse(localStorage.getItem("idham_company")||"{}")}catch{}const n=e.name||"شركتنا",d=[e.address,e.city,e.country].filter(Boolean).join("، "),a=e.phone||"",i=e.vatNumber||"",s=e.crNumber||"",l=e.email||"",r=e.logoBase64||"",f=e.primaryColor||"#4f46e5",g=t.lines.map((b,P)=>`
    <tr>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; text-align:center; width:30px;">${P+1}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; font-family:monospace; font-size:11px;">${b.sku||"—"}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; font-weight:600;">${b.productName}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; text-align:center;">${b.unit}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; text-align:center; font-family:monospace;">${b.qty}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; text-align:center; font-family:monospace;">${b.packQty||1}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; background:#fefce8;"></td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; color:#94a3b8; font-style:italic; font-size:11px;">${b.notes||""}</td>
    </tr>`).join(""),y=`<!DOCTYPE html>
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
      background: ${f}; color: #fff;
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
    .ftr { margin-top:12px; padding-top:8px; border-top:2px solid ${f};
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
      ${r?`<img class="co-logo" src="${r}" alt="شعار الشركة">`:""}
      <div>
        <div class="co-name">${n}</div>
        <div class="co-info">
          ${d?`📍 ${d}<br>`:""}
          ${a?`📞 ${a}`:""}${l?`   ✉️ ${l}`:""}${a||l?"<br>":""}
          ${i?`الرقم الضريبي: ${i}`:""}${i&&s?"   |   ":""}${s?`س.ت: ${s}`:""}
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
    <tbody>${g}</tbody>
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
</html>`,m=window.open("","_blank","width=900,height=700");if(!m){p("يُرجى السماح بالنوافذ المنبثقة للطباعة","warning");return}m.document.write(y),m.document.close(),m.onload=()=>setTimeout(()=>m.print(),700),p("جاري تحضير المستند للطباعة...","info")};window.printRfqComparison=()=>{if(!h)return;const o=document.getElementById("rfq-print-area");let t=0;const e=h.lines.map((n,d)=>{const a=u.find(m=>m.id===n.productId),i=a?parseFloat(a.costPrice||0):0,s=a?parseFloat(a.salePrice||0):0,l=parseFloat(n.offeredPrice||0),r=parseFloat(n.qty||0),f=l-i,g=i>0?f/i*100:0;l>0&&i>0&&(t+=(i-l)*r);let y="متطابق";return f<0?y=`توفير ${Math.abs(f).toFixed(2)} ر.س (${Math.abs(g).toFixed(1)}%)`:f>0&&(y=`زيادة ${f.toFixed(2)} ر.س (${g.toFixed(1)}%)`),`
      <tr style="border-bottom:1px solid #cbd5e1;">
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:right;">${d+1}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold;">${n.productName}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:center;" class="mono">${r}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:left; font-weight:bold;" class="mono">${x(l)}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:left;" class="mono">${x(i)}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:left;" class="mono">${y}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:left;" class="mono">${x(s)}</td>
      </tr>
    `}).join("");o.innerHTML=`
    <div style="direction:rtl; text-align:right; font-family:'IBM Plex Sans Arabic', sans-serif; padding:40px; color:#000; background:#fff;">
      <h2 style="margin:0 0 5px 0; font-size:22px; color:#1e293b;">تقرير مقارنة عروض الأسعار ونسب الأرباح</h2>
      <p style="margin:0 0 20px 0; font-size:12px; color:#64748b;">تاريخ التقرير: ${B()}</p>

      <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:16px; border-radius:6px; margin-bottom:24px; font-size:13px; line-height:1.6;">
        <p><strong>المورد:</strong> ${h.supplierName}</p>
        <p><strong>رقم العرض المرجعي:</strong> ${h.number}</p>
        <p><strong>إجمالي القيمة التوفيرية للعرض:</strong> <span style="font-size:15px; font-weight:bold; color:#10b981;">${x(t)}</span></p>
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
  `,window.print()};window.exportRFQsListPDF=()=>{typeof exportPagePDF=="function"?exportPagePDF("#rfqs-main-table","سجل_طلبات_عروض_الأسعار_RFQ","قائمة طلبات عروض أسعار الموردين والعهد"):window.print()};window.deleteRfq=async o=>{if(confirm("هل أنت متأكد من حذف طلب عروض الأسعار هذا؟"))try{await A("purchaseRequests",o),p("تم حذف طلب الأسعار بنجاح","success"),await F()}catch{p("حدث خطأ أثناء الحذف","danger")}};export{X as render};
