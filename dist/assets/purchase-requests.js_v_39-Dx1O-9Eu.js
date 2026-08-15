import{t as R,g as E,C as q,f as m,x as N,u as C,n as j,r as A}from"./index-HrCilPJ3.js";import{orderBy as k}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let v=[],L=[],P=[],h=new Map,y=null,x=[];async function K(e,t){e.innerHTML=`
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
              <input type="date" id="rfq-date" class="form-control" value="${R()}" />
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
              <div style="display:flex; gap:8px; align-items:center;">
                <select id="rfq-product-category-filter" class="form-control" style="width:160px; height:34px; font-size:12px; padding:4px 8px;">
                  <option value="">كل الفئات</option>
                </select>
                <div class="autocomplete-container" style="width:480px;">
                  <input type="text" id="rfq-product-search" class="form-control" placeholder="+ أضف صنفاً… (بالاسم أو الكود)" autocomplete="off" style="height:34px; font-size:12px;" />
                  <div class="autocomplete-results hidden" id="rfq-product-results"></div>
                </div>
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
  `,document.getElementById("rfq-search").addEventListener("input",w),document.getElementById("rfq-status-filter").addEventListener("change",w),document.getElementById("rfq-from")?.addEventListener("change",w),document.getElementById("rfq-to")?.addEventListener("change",w),document.getElementById("rfq-supplier-filter")?.addEventListener("change",w),O(),_(),await Promise.all([I(),D(),Q()])}async function I(){try{const e=await E(q.purchaseRequests(),[k("createdAt","desc")]);h.clear(),e.forEach(t=>h.set(t.id,t)),M(e),H(e)}catch(e){console.error("Error loading RFQs:",e)}}async function D(){try{L=await E(q.suppliers(),[k("name")]);const e=document.getElementById("rfq-supplier-filter");e&&(e.innerHTML='<option value="">كل الموردين</option>'+L.map(t=>`<option value="${t.id}">${t.name}</option>`).join(""))}catch{}}async function Q(){try{const[e,t]=await Promise.all([E(q.products(),[k("name")]),E(q.categories(),[k("name")])]);v=e,P=t;const o=document.getElementById("rfq-product-category-filter");o&&(o.innerHTML='<option value="">كل الفئات</option>'+P.map(n=>`<option value="${n.id}">${n.name}</option>`).join(""))}catch(e){console.error("loadProducts error:",e)}}function M(e){const t=document.getElementById("rfq-tbody");if(t){if(!e.length){t.innerHTML='<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-3);">لا توجد طلبات أسعار مسجلة حالياً</td></tr>';return}t.innerHTML=e.map(o=>{let n="gray",d="مسودة";return o.status==="sent"?(n="blue",d="تم الإرسال"):o.status==="completed"&&(n="good",d="مكتمل (مُسعّر)"),`
      <tr>
        <td class="mono font-bold">${o.number||"—"}</td>
        <td>${o.date||"—"}</td>
        <td><strong>${o.supplierName||"—"}</strong></td>
        <td>${o.lines?o.lines.length:0} أصناف</td>
        <td><span class="badge ${n}">${d}</span></td>
        <td>${o.targetDate||"—"}</td>
        <td style="text-align:left;">
          <div style="display:flex; gap:6px; justify-content:flex-end;">
            <button class="btn btn-secondary btn-sm" onclick="printRfqForSupplier('${o.id}')">طباعة للطلب 🖨️</button>
            <button class="btn btn-secondary btn-sm" onclick="openEnterPricesModal('${o.id}')">💵 إدخال الأسعار</button>
            ${o.status==="completed"?`<button class="btn btn-secondary btn-sm" onclick="openCompareModal('${o.id}')">📊 المقارنة والربح</button>`:""}
            <button class="btn btn-secondary btn-sm" onclick="openEditRfqModal('${o.id}')">تعديل ✏️</button>
            <button class="btn btn-ghost btn-sm text-bad" onclick="deleteRfq('${o.id}')">حذف 🗑️</button>
          </div>
        </td>
      </tr>
    `}).join("")}}function H(e){const t=e.length,o=e.filter(a=>a.status!=="completed").length,n=e.filter(a=>a.status==="completed").length;document.getElementById("rfq-stat-total").textContent=t,document.getElementById("rfq-stat-pending").textContent=o,document.getElementById("rfq-stat-completed").textContent=n;let d=0;e.filter(a=>a.status==="completed").forEach(a=>{a.lines.forEach(i=>{const s=parseFloat(i.offeredPrice||0),l=v.find(p=>p.id===i.productId),r=parseFloat(l?.costPrice||0);s>0&&r>0&&(d+=(r-s)*parseFloat(i.qty||0))})}),document.getElementById("rfq-stat-savings").textContent=m(d)}function w(){const e=document.getElementById("rfq-search").value.trim().toLowerCase(),t=document.getElementById("rfq-status-filter").value,o=document.getElementById("rfq-from")?.value||"",n=document.getElementById("rfq-to")?.value||"",d=document.getElementById("rfq-supplier-filter")?.value||"";let a=Array.from(h.values());t&&(a=a.filter(i=>i.status===t)),e&&(a=a.filter(i=>(i.number||"").toLowerCase().includes(e)||(i.supplierName||"").toLowerCase().includes(e))),o&&(a=a.filter(i=>i.date>=o)),n&&(a=a.filter(i=>i.date<=n)),d&&(a=a.filter(i=>i.supplierId===d)),M(a)}function O(){const e=document.getElementById("rfq-supplier-search"),t=document.getElementById("rfq-supplier-results");e&&(e.addEventListener("input",()=>{const o=e.value.trim().toLowerCase();if(!o){t.classList.add("hidden");return}const n=L.filter(d=>(d.name||"").toLowerCase().includes(o)||(d.phone||"").toLowerCase().includes(o));if(!n.length){t.classList.add("hidden");return}t.innerHTML=n.map(d=>`
      <div class="autocomplete-item" onclick="selectRfqSupplier('${d.id}','${d.name.replace(/'/g,"\\'")}')">
        <div>${d.name}</div>
        <div class="item-code">${d.phone||""}</div>
      </div>
    `).join(""),t.classList.remove("hidden")}),document.addEventListener("click",o=>{e.contains(o.target)||t.classList.add("hidden")}))}window.selectRfqSupplier=(e,t)=>{document.getElementById("rfq-supplier-id").value=e,document.getElementById("rfq-supplier-search").value=t,document.getElementById("rfq-supplier-results").classList.add("hidden")};function _(){const e=document.getElementById("rfq-product-search"),t=document.getElementById("rfq-product-results"),o=document.getElementById("rfq-product-category-filter");if(!e)return;const n=()=>{const d=e.value.trim().toLowerCase(),a=o?o.value:"";if(!d&&!a){t.classList.add("hidden");return}let i=v;if(a&&(i=i.filter(s=>s.category===a)),d&&(i=i.filter(s=>(s.name||"").toLowerCase().includes(d)||(s.sku||"").toLowerCase().includes(d)||(s.barcode||"").toLowerCase().includes(d))),i=i.slice(0,15),!i.length){t.innerHTML='<div style="padding:10px;text-align:center;color:var(--text-3);">لا توجد نتائج</div>',t.classList.remove("hidden");return}t.innerHTML=i.map(s=>`
      <div class="autocomplete-item" onclick="addRfqLine('${s.id}', '${s.name.replace(/'/g,"\\'")}', '${s.unit||"حبة"}', '${s.sku||""}')">
        <div class="flex justify-between">
          <span>${s.name}</span>
          <span class="mono text-dim" style="font-size:11px;">التكلفة: ${m(s.costPrice||0)}</span>
        </div>
        <div class="item-code">${s.sku||""} | الوحدة: ${s.unit||""}</div>
      </div>
    `).join(""),t.classList.remove("hidden")};e.addEventListener("input",n),e.addEventListener("focus",n),o&&o.addEventListener("change",n),document.addEventListener("click",d=>{!e.contains(d.target)&&!t.contains(d.target)&&(!o||!o.contains(d.target))&&t.classList.add("hidden")})}window.openNewRfqModal=()=>{y=null,x=[],document.getElementById("rfq-modal-title").textContent="📨 طلب عروض أسعار جديد",document.getElementById("rfq-date").value=R(),document.getElementById("rfq-target-date").value="",document.getElementById("rfq-supplier-search").value="",document.getElementById("rfq-supplier-id").value="",document.getElementById("rfq-notes").value="",document.getElementById("rfq-lines-tbody").innerHTML="",document.getElementById("rfq-number").value="جارِ التوليد...",openModal("rfq-modal"),N("RFQ").then(e=>{const t=document.getElementById("rfq-number");t&&(t.value=e)}).catch(e=>{const t=document.getElementById("rfq-number"),o=Date.now().toString(36).toUpperCase();t&&(t.value=`RFQ-T${o}`),console.warn("[RFQ] Counter fallback used:",e?.message)})};window.openEditRfqModal=e=>{const t=h.get(e);t&&(y=t,x=JSON.parse(JSON.stringify(t.lines||[])),document.getElementById("rfq-modal-title").textContent=`📨 تعديل طلب عروض الأسعار: ${t.number}`,document.getElementById("rfq-number").value=t.number,document.getElementById("rfq-date").value=t.date,document.getElementById("rfq-target-date").value=t.targetDate||"",document.getElementById("rfq-supplier-search").value=t.supplierName||"",document.getElementById("rfq-supplier-id").value=t.supplierId||"",document.getElementById("rfq-notes").value=t.notes||"",F(),openModal("rfq-modal"))};window.closeRfqModal=()=>{closeModal("rfq-modal")};window.addRfqLine=(e,t,o,n)=>{if(x.some(d=>d.productId===e)){showToast("هذا الصنف مضاف بالفعل للطلب","warning");return}x.push({productId:e,productName:t,unit:o,sku:n,qty:1,packQty:1,notes:"",offeredPrice:0}),document.getElementById("rfq-product-search").value="",document.getElementById("rfq-product-results").classList.add("hidden"),F()};function F(){const e=document.getElementById("rfq-lines-tbody");e.innerHTML=x.map((t,o)=>`
    <tr style="border-bottom:1px solid var(--border-soft);">
      <td style="padding:6px 10px;">${o+1}</td>
      <td style="padding:6px 10px;" class="mono">${t.sku||"—"}</td>
      <td style="padding:6px 10px; font-weight:600;">${t.productName}</td>
      <td style="padding:6px 10px;">${t.unit}</td>
      <td style="padding:6px 10px;">
        <input type="number" class="form-control mono" style="width:75px; height:28px; font-size:11px; padding:2px 6px;" value="${t.qty}" min="1" step="1" onchange="updateRfqLineField(${o}, 'qty', this.value)" />
      </td>
      <td style="padding:6px 10px;">
        <input type="number" class="form-control mono" style="width:75px; height:28px; font-size:11px; padding:2px 6px;" value="${t.packQty}" min="1" step="1" onchange="updateRfqLineField(${o}, 'packQty', this.value)" />
      </td>
      <td style="padding:6px 10px;">
        <input type="text" class="form-control" style="height:28px; font-size:11px; padding:2px 6px;" value="${t.notes}" placeholder="مواصفات توريد..." onchange="updateRfqLineField(${o}, 'notes', this.value)" />
      </td>
      <td style="padding:6px 10px;">
        <button class="btn btn-ghost btn-sm text-bad" onclick="removeRfqLine(${o})">×</button>
      </td>
    </tr>
  `).join("")}window.updateRfqLineField=(e,t,o)=>{t==="qty"||t==="packQty"?x[e][t]=parseFloat(o)||1:x[e][t]=o};window.removeRfqLine=e=>{x.splice(e,1),F()};window.saveRfq=async()=>{const e=document.getElementById("rfq-date").value,t=document.getElementById("rfq-number").value,o=document.getElementById("rfq-supplier-id").value,n=document.getElementById("rfq-supplier-search").value,d=document.getElementById("rfq-target-date").value,a=document.getElementById("rfq-notes").value.trim();if(!o||!e){showToast("يرجى تعبئة التاريخ واختيار المورد","warning");return}if(!x.length){showToast("يرجى إضافة صنف واحد على الأقل للطلب","warning");return}const i=document.getElementById("rfq-save-btn");i.disabled=!0;try{const s={number:t,date:e,supplierId:o,supplierName:n,targetDate:d,notes:a,lines:x,status:y?y.status:"sent",updatedAt:new Date};y?(await C("purchaseRequests",y.id,s),showToast("تم تحديث طلب عروض الأسعار بنجاح","success")):(s.createdAt=new Date,await j(q.purchaseRequests(),s),showToast("تم حفظ طلب عروض الأسعار بنجاح","success")),closeRfqModal(),await I()}catch(s){console.error("Save RFQ Error:",s),showToast("حدث خطأ أثناء حفظ طلب الأسعار","danger")}finally{i.disabled=!1}};let z=null,$=[];window.openEnterPricesModal=e=>{z=e;const t=h.get(e);if(!t)return;document.getElementById("rfq-p-supplier-name").textContent=t.supplierName||"",document.getElementById("rfq-p-number").textContent=t.number||"",$=JSON.parse(JSON.stringify(t.lines||[]));const o=document.getElementById("rfq-prices-tbody");o.innerHTML=$.map((n,d)=>`
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
  `).join(""),openModal("rfq-prices-modal")};window.updateOfferedPrice=(e,t)=>{$[e].offeredPrice=parseFloat(t)||0};window.updateSupplyNotes=(e,t)=>{$[e].supplyNotes=t};window.saveRfqPrices=async()=>{const e=document.getElementById("rfq-prices-save-btn");e.disabled=!0;try{await C("purchaseRequests",z,{lines:$,status:"completed"}),showToast("تم إدخال الأسعار وحفظ العرض بنجاح","success"),closeModal("rfq-prices-modal"),await I()}catch{showToast("خطأ أثناء حفظ الأسعار","danger")}finally{e.disabled=!1}};let b=null;window.openCompareModal=e=>{const t=h.get(e);if(!t)return;b=t,document.getElementById("rfq-comp-supplier").textContent=t.supplierName||"",document.getElementById("rfq-comp-number").textContent=t.number||"",document.getElementById("rfq-comp-date").textContent=t.date||"";const o=document.getElementById("rfq-compare-tbody");o.innerHTML="";let n=0;t.lines.forEach((d,a)=>{const i=v.find(T=>T.id===d.productId),s=i?parseFloat(i.costPrice||0):0,l=i?parseFloat(i.salePrice||0):0,r=parseFloat(d.offeredPrice||0),p=parseFloat(d.qty||0),c=r-s,u=s>0?c/s*100:0;r>0&&s>0&&(n+=(s-r)*p);let f="—",g="mono";c<0?(f=`توفير ${m(Math.abs(c))} (${Math.abs(u).toFixed(1)}%)`,g="mono text-good"):c>0?(f=`زيادة ${m(c)} (${u.toFixed(1)}%)`,g="mono text-bad"):r>0&&s>0&&(f="متطابق",g="mono text-dim");const B=l>0?(l-s)/l*100:0,S=l>0?(l-r)/l*100:0;o.innerHTML+=`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:8px; text-align:right;">${a+1}</td>
        <td style="padding:8px; font-weight:600;">${d.productName}</td>
        <td style="padding:8px; text-align:center;" class="mono">${p}</td>
        <td style="padding:8px; text-align:left; font-weight:700;" class="mono text-indigo">${m(r)}</td>
        <td style="padding:8px; text-align:left;" class="mono">${m(s)}</td>
        <td style="padding:8px; text-align:left;" class="${g}">${f}</td>
        <td style="padding:8px; text-align:left;" class="mono">${m(l)}</td>
        <td style="padding:8px; text-align:center;" class="mono text-indigo font-bold">${S.toFixed(1)}%</td>
        <td style="padding:8px; text-align:center;" class="mono">${B.toFixed(1)}%</td>
      </tr>
    `}),document.getElementById("rfq-comp-totalsavings").textContent=m(n),openModal("rfq-compare-modal")};window.exportComparisonCSV=()=>{if(!b)return;let e=`\uFEFF#;الصنف;الكمية;سعر المورد المقترح;تكلفة الشراء الحالية عندنا;الفرق المالي;سعر البيع الحالي;هامش ربح العرض;هامش الربح الحالي
`;b.lines.forEach((n,d)=>{const a=v.find(u=>u.id===n.productId),i=a?parseFloat(a.costPrice||0):0,s=a?parseFloat(a.salePrice||0):0,l=parseFloat(n.offeredPrice||0),r=s>0?(s-i)/s*100:0,p=s>0?(s-l)/s*100:0,c=l-i;e+=`${d+1};"${n.productName}";${n.qty};${l};${i};${c};${s};${p.toFixed(2)}%;${r.toFixed(2)}%
`});const t=new Blob([e],{type:"text/csv;charset=utf-8;"}),o=document.createElement("a");o.href=URL.createObjectURL(t),o.setAttribute("download",`مقارنة_أسعار_طلب_${b.number}.csv`),document.body.appendChild(o),o.click(),document.body.removeChild(o)};window.printRfqForSupplier=e=>{const t=h.get(e);if(!t)return;let o={};try{o=JSON.parse(localStorage.getItem("idham_company")||"{}")}catch{}const n=o.name||"شركتنا",d=[o.address,o.city,o.country].filter(Boolean).join("، "),a=o.phone||"",i=o.vatNumber||"",s=o.crNumber||"",l=o.email||"",r=o.logoBase64||"",p=o.primaryColor||"#4f46e5",c=t.lines.map((g,B)=>`
    <tr>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; text-align:center; width:30px;">${B+1}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; font-family:monospace; font-size:11px;">${g.sku||"—"}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; font-weight:600;">${g.productName}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; text-align:center;">${g.unit}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; text-align:center; font-family:monospace;">${g.qty}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; text-align:center; font-family:monospace;">${g.packQty||1}</td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; background:#fefce8;"></td>
      <td style="padding:8px 6px; border:1px solid #cbd5e1; color:#94a3b8; font-style:italic; font-size:11px;">${g.notes||""}</td>
    </tr>`).join(""),u=`<!DOCTYPE html>
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
      background: ${p}; color: #fff;
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
    .ftr { margin-top:12px; padding-top:8px; border-top:2px solid ${p};
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
    <tbody>${c}</tbody>
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
</html>`,f=window.open("","_blank","width=900,height=700");if(!f){showToast("يُرجى السماح بالنوافذ المنبثقة للطباعة","warning");return}f.document.write(u),f.document.close(),f.onload=()=>setTimeout(()=>f.print(),700),showToast("جاري تحضير المستند للطباعة...","info")};window.printRfqComparison=()=>{if(!b)return;const e=document.getElementById("rfq-print-area");let t=0;const o=b.lines.map((n,d)=>{const a=v.find(f=>f.id===n.productId),i=a?parseFloat(a.costPrice||0):0,s=a?parseFloat(a.salePrice||0):0,l=parseFloat(n.offeredPrice||0),r=parseFloat(n.qty||0),p=l-i,c=i>0?p/i*100:0;l>0&&i>0&&(t+=(i-l)*r);let u="متطابق";return p<0?u=`توفير ${Math.abs(p).toFixed(2)} ر.س (${Math.abs(c).toFixed(1)}%)`:p>0&&(u=`زيادة ${p.toFixed(2)} ر.س (${c.toFixed(1)}%)`),`
      <tr style="border-bottom:1px solid #cbd5e1;">
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:right;">${d+1}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold;">${n.productName}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:center;" class="mono">${r}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:left; font-weight:bold;" class="mono">${m(l)}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:left;" class="mono">${m(i)}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:left;" class="mono">${u}</td>
        <td style="padding:8px; border:1px solid #cbd5e1; text-align:left;" class="mono">${m(s)}</td>
      </tr>
    `}).join("");e.innerHTML=`
    <div style="direction:rtl; text-align:right; font-family:'IBM Plex Sans Arabic', sans-serif; padding:40px; color:#000; background:#fff;">
      <h2 style="margin:0 0 5px 0; font-size:22px; color:#1e293b;">تقرير مقارنة عروض الأسعار ونسب الأرباح</h2>
      <p style="margin:0 0 20px 0; font-size:12px; color:#64748b;">تاريخ التقرير: ${R()}</p>

      <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:16px; border-radius:6px; margin-bottom:24px; font-size:13px; line-height:1.6;">
        <p><strong>المورد:</strong> ${b.supplierName}</p>
        <p><strong>رقم العرض المرجعي:</strong> ${b.number}</p>
        <p><strong>إجمالي القيمة التوفيرية للعرض:</strong> <span style="font-size:15px; font-weight:bold; color:#10b981;">${m(t)}</span></p>
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
          ${o}
        </tbody>
      </table>
    </div>
  `,window.print()};window.exportRFQsListPDF=()=>{typeof exportPagePDF=="function"?exportPagePDF("#rfqs-main-table","سجل_طلبات_عروض_الأسعار_RFQ","قائمة طلبات عروض أسعار الموردين والعهد"):window.print()};window.deleteRfq=async e=>{if(confirm("هل أنت متأكد من حذف طلب عروض الأسعار هذا؟"))try{await A("purchaseRequests",e),showToast("تم حذف طلب الأسعار بنجاح","success"),await I()}catch{showToast("حدث خطأ أثناء الحذف","danger")}};export{K as render};
