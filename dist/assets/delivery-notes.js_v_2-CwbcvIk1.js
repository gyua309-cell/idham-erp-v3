const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/balance-sync-CUiyFg8g.js","assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css","assets/accounting-engine-C71tPcGM.js"])))=>i.map(i=>d[i]);
import{t as v,g as I,C as $,e as j,o as h,f as g,x as V,d as R,a as H,b as X,c as rt,u as _,D as Z,_ as A}from"./index-CF9GFeRJ.js";import{e as lt}from"./excel-DM5XZHtQ.js";import{getDoc as tt,doc as et,serverTimestamp as k,query as st,collection as ct,where as pt}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let b=[],z=[],q=[],D=[],P=[],u=[],M=null,O=null;const f=(e,t="info")=>{typeof window.showToast=="function"?window.showToast(e,t):alert(e)};function ot(){let e={name:"شركة نظم الإمداد المتطورة",nameEn:"Advanced Supply Systems Co.",address:"مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414",phone:"0549141648",email:"Nuzmalamdad@gmail.com",vatNumber:"314996148100003",crNumber:"7054969006",logoBase64:"",logoUrl:""};try{const t=localStorage.getItem("idham_company");if(t){const i=JSON.parse(t);e={...e,...i}}else window.ERP_COMPANY&&(e={...e,...window.ERP_COMPANY})}catch{}return e}async function Et(e,t){e.innerHTML=`
    <!-- Top Filter & Action Bar -->
    <div class="filterbar no-print" style="padding:14px 20px; background:var(--bg-card); border-radius:14px; border:1px solid var(--border-soft); margin-bottom:20px; display:flex; flex-wrap:wrap; gap:12px; align-items:flex-end;">
      
      <!-- Live Search -->
      <div class="search-bar" style="min-width:220px; flex:1;">
        <label style="font-size:11px; font-weight:800; margin-bottom:3px; display:block; color:var(--text-2);">🔍 بحث في سندات التسليم</label>
        <input type="text" id="dn-search" class="input font-bold" placeholder="ابحث برقم السند، العميل، المندوب..." oninput="window.filterDeliveryNotes()" style="height:38px;" />
      </div>

      <!-- Customer Filter -->
      <div class="filter-select-group" style="min-width:180px;">
        <label style="font-size:11px; font-weight:800; margin-bottom:3px; display:block; color:var(--text-2);">العميل</label>
        <select id="dn-cust-filter" class="input font-bold" onchange="window.filterDeliveryNotes()" style="height:38px;">
          <option value="">كل العملاء</option>
        </select>
      </div>

      <!-- Sales Rep Filter -->
      <div class="filter-select-group" style="min-width:160px;">
        <label style="font-size:11px; font-weight:800; margin-bottom:3px; display:block; color:var(--text-2);">المندوب</label>
        <select id="dn-rep-filter" class="input font-bold" onchange="window.filterDeliveryNotes()" style="height:38px;">
          <option value="">كل المناديب</option>
        </select>
      </div>

      <!-- Warehouse Filter -->
      <div class="filter-select-group" style="min-width:170px;">
        <label style="font-size:11px; font-weight:800; margin-bottom:3px; display:block; color:var(--text-2);">المستودع / السيارة</label>
        <select id="dn-wh-filter" class="input font-bold" onchange="window.filterDeliveryNotes()" style="height:38px;">
          <option value="">كل المستودعات والسيارات</option>
        </select>
      </div>

      <!-- Status Filter -->
      <div class="filter-select-group" style="min-width:150px;">
        <label style="font-size:11px; font-weight:800; margin-bottom:3px; display:block; color:var(--text-2);">حالة السند</label>
        <select id="dn-status-filter" class="input font-bold" onchange="window.filterDeliveryNotes()" style="height:38px;">
          <option value="">كل الحالات</option>
          <option value="confirmed">🟢 تم التسليم (مؤكد)</option>
          <option value="draft">🟡 مسودة (قيد التحضير)</option>
          <option value="converted_to_invoice">🔵 تم التحويل لفاتورة</option>
          <option value="cancelled">🔴 ملغي</option>
        </select>
      </div>

      <!-- Date Range -->
      <div class="date-range-group" style="display:flex; gap:6px; align-items:flex-end;">
        <div>
          <label style="font-size:11px; font-weight:800; margin-bottom:3px; display:block; color:var(--text-2);">من تاريخ</label>
          <input type="date" id="dn-date-from" class="input font-bold mono" onchange="window.filterDeliveryNotes()" style="height:38px; width:130px;" />
        </div>
        <div>
          <label style="font-size:11px; font-weight:800; margin-bottom:3px; display:block; color:var(--text-2);">إلى تاريخ</label>
          <input type="date" id="dn-date-to" class="input font-bold mono" value="${v()}" onchange="window.filterDeliveryNotes()" style="height:38px; width:130px;" />
        </div>
      </div>

      <!-- Actions -->
      <div style="margin-right:auto; display:flex; gap:8px; align-items:flex-end;">
        <button class="btn btn-secondary" onclick="window.exportDeliveryNotesExcel()" style="height:38px; font-weight:bold;">📊 Excel</button>
        <button class="btn btn-primary" onclick="window.openNewDeliveryNoteModal()" style="height:38px; font-weight:900; background:linear-gradient(135deg, #2563eb, #1d4ed8); display:inline-flex; align-items:center; gap:6px;">
          <span>📦</span> إنشاء سند تسليم بضاعة (DN)
        </button>
      </div>
    </div>

    <div class="page-content">
      
      <!-- KPI Stats -->
      <div class="kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px; border-top:3px solid #2563eb;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي سندات التسليم</div>
          <div class="mono" id="dn-kpi-count" style="font-size:20px; font-weight:900; margin-top:4px; color:#2563eb;">0</div>
          <div style="font-size:9.5px; color:var(--text-3); margin-top:2px;">سندات تسليم مبيعات</div>
        </div>

        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px; border-top:3px solid #10b981;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي قيمة البضاعة المسلمة</div>
          <div class="mono" id="dn-kpi-total-val" style="font-size:20px; font-weight:900; margin-top:4px; color:#10b981;">0.00 ر.س</div>
          <div style="font-size:9.5px; color:var(--text-3); margin-top:2px;">صافي بدون ضريبة مضافة</div>
        </div>

        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px; border-top:3px solid #8b5cf6;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">إجمالي الكميات المسلمة</div>
          <div class="mono" id="dn-kpi-total-qty" style="font-size:20px; font-weight:900; margin-top:4px; color:#8b5cf6;">0</div>
          <div style="font-size:9.5px; color:var(--text-3); margin-top:2px;">كرتون / وحدة مباعة</div>
        </div>

        <div class="kpi-card" style="padding:14px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:12px; border-top:3px solid #f59e0b;">
          <div style="font-size:11px; color:var(--text-2); font-weight:700;">سندات قيد التحضير (مسودات)</div>
          <div class="mono" id="dn-kpi-drafts" style="font-size:20px; font-weight:900; margin-top:4px; color:#f59e0b;">0</div>
          <div style="font-size:9.5px; color:var(--text-3); margin-top:2px;">بانتظار التأكيد والصرف</div>
        </div>
      </div>

      <!-- Main Delivery Notes Table -->
      <div class="card" style="border-radius:14px; border:1px solid var(--border-soft); overflow:hidden;">
        <div class="table-container" style="overflow-x:auto;">
          <table class="data-dense" style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr style="background:var(--bg-2); border-bottom:2px solid var(--border-soft); user-select:none;">
                <th style="padding:10px 8px; width:35px; text-align:center;">#</th>
                <th style="padding:10px 10px; width:120px; text-align:right;">رقم السند</th>
                <th style="padding:10px 10px; width:95px; text-align:center;">التاريخ</th>
                <th style="padding:10px 12px; text-align:right;">العميل المستلم</th>
                <th style="padding:10px 10px; text-align:right;">المندوب</th>
                <th style="padding:10px 10px; text-align:right;">المستودع / السيارة</th>
                <th style="padding:10px 8px; width:75px; text-align:center;">الكمية</th>
                <th style="padding:10px 12px; width:120px; text-align:left;">إجمالي القيمة</th>
                <th style="padding:10px 8px; width:95px; text-align:center;">طريقة الدفع</th>
                <th style="padding:10px 10px; width:130px; text-align:center;">الحالة</th>
                <th style="padding:10px 12px; width:160px; text-align:center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="dn-tbody">
              <tr><td colspan="11" style="text-align:center; padding:40px;"><span class="spin"></span> جارٍ تحميل سندات التسليم...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: NEW / EDIT DELIVERY NOTE ═══ -->
    <div class="modal-overlay" id="dn-modal">
      <div class="modal modal-xl" style="background:var(--bg-card, #ffffff); border-radius:16px; border:1px solid var(--border-soft); width:100%; max-width:1050px; max-height:92vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 60px rgba(0,0,0,0.35);">
        
        <!-- Modal Header -->
        <div class="modal-header" style="padding:16px 22px; background:linear-gradient(135deg, #1e3a8a, #2563eb); color:#fff; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 class="modal-title" id="dn-modal-title" style="margin:0; font-size:16px; font-weight:900; color:#fff;">📦 إنشاء سند تسليم بضاعة مبيعات جديد (DN)</h3>
            <div style="font-size:11px; opacity:0.85; margin-top:2px;">سند تسليم تجاري غير ضريبي — يخصم المخزون ويثبت الاستلام والمديونية فوراً</div>
          </div>
          <button type="button" class="modal-close" onclick="window.closeDeliveryNoteModal()" style="background:none; border:none; color:#fff; font-size:24px; cursor:pointer; line-height:1;">×</button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body" style="padding:18px 22px; overflow-y:auto; flex:1;">
          
          <!-- Top Form Row 1: Document Meta -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:12px; margin-bottom:14px;">
            <div class="form-group">
              <label style="font-size:11px; font-weight:800; margin-bottom:4px; display:block; color:var(--text-1);">رقم سند التسليم</label>
              <input type="text" id="dn-number" class="input mono font-bold" readonly style="height:36px; background:var(--bg-2); color:var(--brand);" />
            </div>

            <div class="form-group">
              <label style="font-size:11px; font-weight:800; margin-bottom:4px; display:block; color:var(--text-1);">التاريخ *</label>
              <input type="date" id="dn-date" class="input mono font-bold" value="${v()}" style="height:36px;" />
            </div>

            <div class="form-group">
              <label style="font-size:11px; font-weight:800; margin-bottom:4px; display:block; color:var(--text-1);">طريقة الدفع *</label>
              <select id="dn-payment-method" class="input font-bold" style="height:36px;">
                <option value="credit">آجل (على حساب العميل)</option>
                <option value="cash">نقدي (تم استلام القيمة)</option>
              </select>
            </div>

            <div class="form-group">
              <label style="font-size:11px; font-weight:800; margin-bottom:4px; display:block; color:var(--text-1);">المستودع / السيارة المصدر *</label>
              <select id="dn-warehouse" class="input font-bold" onchange="window.onDNWarehouseChanged()" style="height:36px;">
                <!-- Warehouses -->
              </select>
            </div>

            <div class="form-group">
              <label style="font-size:11px; font-weight:800; margin-bottom:4px; display:block; color:var(--text-1);">المندوب المسؤول</label>
              <select id="dn-rep" class="input font-bold" style="height:36px;">
                <!-- Reps -->
              </select>
            </div>
          </div>

          <!-- Customer Selection Row -->
          <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:12px; margin-bottom:16px; background:var(--bg-2); padding:12px 16px; border-radius:10px; border:1px solid var(--border-soft);">
            <div style="position:relative;">
              <label style="font-size:11px; font-weight:800; margin-bottom:4px; display:block; color:var(--text-1);">العميل المستلم *</label>
              <input type="text" id="dn-customer-search" class="input font-bold" placeholder="🔍 ابحث عن العميل بالاسم أو رقم الهاتف..." autocomplete="off" style="height:36px;" />
              <div id="dn-customer-results" class="shadow-lg" style="display:none; position:absolute; top:calc(100% + 4px); right:0; left:0; z-index:1050; max-height:220px; overflow-y:auto; background:var(--bg-card, #fff); border:1.5px solid #2563eb; border-radius:8px; padding:4px;"></div>
              <input type="hidden" id="dn-customer-id" />
            </div>

            <div>
              <label style="font-size:11px; font-weight:800; margin-bottom:4px; display:block; color:var(--text-2);">الرصيد الحالي للعميل</label>
              <div id="dn-customer-balance-box" class="mono font-bold" style="height:36px; display:flex; align-items:center; padding:0 10px; background:var(--bg-1); border-radius:6px; border:1px solid var(--border-soft); font-size:13px; color:var(--text-1);">—</div>
            </div>

            <div>
              <label style="font-size:11px; font-weight:800; margin-bottom:4px; display:block; color:var(--text-2);">اسم المستلم / السائق</label>
              <input type="text" id="dn-receiver-name" class="input" placeholder="اسم الشخص المستلم..." style="height:36px;" />
            </div>
          </div>

          <!-- Add Product Autocomplete Row -->
          <div style="display:flex; gap:10px; align-items:flex-end; margin-bottom:12px; background:rgba(37,99,235,0.05); padding:12px 16px; border-radius:10px; border:1px solid rgba(37,99,235,0.2);">
            <div style="position:relative; flex:2;">
              <label style="font-size:11.5px; font-weight:800; margin-bottom:4px; display:block; color:#1e40af;">➕ إضافة صنف لسند التسليم</label>
              <input type="text" id="dn-product-search" class="input font-bold" placeholder="ابحث باسم الصنف، الكود، الباركود..." autocomplete="off" style="height:38px; border-color:#93c5fd;" />
              <div id="dn-product-results" class="shadow-lg" style="display:none; position:absolute; top:calc(100% + 4px); right:0; left:0; z-index:1050; max-height:260px; overflow-y:auto; background:var(--bg-card, #fff); border:1.5px solid #2563eb; border-radius:8px; padding:4px;"></div>
            </div>
            <div style="font-size:11px; color:var(--text-2); padding-bottom:10px;">
              💡 سيتم إظهار الرصيد الفعلي المتوفر في المستودع المختار فوراً لكل صنف
            </div>
          </div>

          <!-- Line Items Table -->
          <div style="border:1px solid var(--border-soft); border-radius:10px; overflow:hidden; margin-bottom:16px;">
            <table style="width:100%; border-collapse:collapse; font-size:12px;">
              <thead>
                <tr style="background:var(--bg-2); border-bottom:1.5px solid var(--border-soft);">
                  <th style="padding:8px 6px; width:30px; text-align:center;">#</th>
                  <th style="padding:8px 10px; text-align:right;">الصنف والوصف</th>
                  <th style="padding:8px 8px; width:90px; text-align:center;">الوحدة</th>
                  <th style="padding:8px 8px; width:130px; text-align:center;">التشغيلة / الصلاحية</th>
                  <th style="padding:8px 8px; width:80px; text-align:center;">الرصيد المتاح</th>
                  <th style="padding:8px 8px; width:85px; text-align:center;">الكمية المسلمة</th>
                  <th style="padding:8px 8px; width:95px; text-align:center;">سعر الوحدة</th>
                  <th style="padding:8px 8px; width:70px; text-align:center;">خصم %</th>
                  <th style="padding:8px 10px; width:105px; text-align:left;">الإجمالي</th>
                  <th style="padding:8px 6px; width:35px; text-align:center;"></th>
                </tr>
              </thead>
              <tbody id="dn-lines-tbody">
                <!-- Lines rendered dynamically -->
              </tbody>
            </table>
          </div>

          <!-- Summary & Totals Bottom Section -->
          <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:16px; align-items:start;">
            
            <!-- Notes & Terms -->
            <div>
              <label style="font-size:11px; font-weight:800; margin-bottom:4px; display:block; color:var(--text-1);">ملاحظات وشروط سند التسليم</label>
              <textarea id="dn-notes" class="input" rows="3" placeholder="أدخل أي ملاحظات خاصة بالتسليم، رقم طلب الشراء، السائق، إلخ..." style="width:100%; resize:vertical; font-size:12px;"></textarea>
            </div>

            <!-- Totals Box (No Tax / Non-VAT) -->
            <div style="background:var(--bg-2); padding:14px 18px; border-radius:10px; border:1px solid var(--border-soft);">
              <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:12px; color:var(--text-2);">
                <span>إجمالي القيمة قبل الخصم:</span>
                <span class="mono font-bold" id="dn-subtotal">0.00 ر.س</span>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:12px; color:#ef4444;">
                <span>إجمالي الخصم:</span>
                <span class="mono font-bold" id="dn-discount">-0.00 ر.س</span>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:11px; color:#10b981; font-weight:700; border-top:1px dashed var(--border-soft); padding-top:6px;">
                <span>ضريبة القيمة المضافة (0% مستند غير ضريبي):</span>
                <span class="mono">0.00 ر.س</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:15px; font-weight:900; color:var(--brand); border-top:2px solid var(--border-soft); padding-top:8px;">
                <span>الصافي النهائي للتسليم:</span>
                <span class="mono" id="dn-grand-total">0.00 ر.س</span>
              </div>
              <div style="font-size:10.5px; color:var(--text-2); margin-top:6px; text-align:left; font-weight:700;" id="dn-tafqeet">
                فقط صفر ريال سعودي لا غير
              </div>
            </div>

          </div>

        </div>

        <!-- Modal Footer -->
        <div class="modal-footer" style="padding:14px 22px; background:var(--bg-1); border-top:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <button type="button" class="btn btn-ghost" onclick="window.closeDeliveryNoteModal()">إلغاء</button>
          
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn btn-secondary" onclick="window.saveDeliveryNote('draft')" style="font-weight:700;">
              📝 حفظ كمسودة
            </button>
            <button type="button" class="btn btn-primary" id="btn-save-dn" onclick="window.saveDeliveryNote('confirmed')" style="font-weight:900; background:linear-gradient(135deg, #16a34a, #15803d);">
              ✅ حفظ وتأكيد التسليم (خصم فوري للمخزون)
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- ═══ MODAL: VIEW & PRINT DELIVERY NOTE ═══ -->
    <div class="modal-overlay" id="dn-view-modal">
      <div class="modal modal-lg" style="background:#fff; border-radius:16px; border:1px solid #cbd5e1; width:100%; max-width:920px; max-height:92vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 60px rgba(0,0,0,0.35);">
        
        <div class="modal-header no-print" style="padding:14px 20px; background:#1e293b; color:#fff; display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0; font-size:15px; font-weight:900; color:#fff;">معاينة وطباعة سند تسليم البضاعة</h3>
          <button type="button" class="modal-close" onclick="window.closeViewDNModal()" style="background:none; border:none; color:#fff; font-size:24px; cursor:pointer;">×</button>
        </div>

        <div class="modal-body" id="dn-view-content" style="padding:24px; overflow-y:auto; flex:1; background:#fff; color:#0f172a;">
          <!-- Printable Sheet Rendered Dynamically -->
        </div>

        <div class="modal-footer no-print" style="padding:12px 20px; background:#f8fafc; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn btn-ghost" onclick="window.closeViewDNModal()">إغلاق</button>
            <button type="button" class="btn btn-secondary" id="btn-convert-dn-to-inv" onclick="window.convertDNToSalesInvoice()" style="font-weight:700; color:#2563eb; border-color:#2563eb;">
              ⚡ تحويل إلى فاتورة ضريبية رسمية (INV)
            </button>
          </div>

          <div style="display:flex; gap:8px;">
            <button type="button" class="btn btn-secondary" onclick="window.printDNThermal()" style="font-weight:700;">
              🧾 طباعة إيصال حراري (80mm)
            </button>
            <button type="button" class="btn btn-primary" onclick="window.printDNA4()" style="font-weight:900; background:#1e3a8a;">
              🖨️ طباعة سند تسليم رسمي (A4)
            </button>
          </div>
        </div>

      </div>
    </div>
  `,await W()}async function W(){try{const[e,t,i,n,d]=await Promise.all([I($.customers()).catch(()=>[]),I($.salesReps()).catch(()=>[]),I($.warehouses()).catch(()=>[]),I($.products()).catch(()=>[]),I($.deliveryNotes()).catch(()=>[])]);z=(e||[]).sort((o,a)=>(o.name||"").localeCompare(a.name||"","ar")),q=(t||[]).sort((o,a)=>(o.name||"").localeCompare(a.name||"","ar")),D=(i||[]).sort((o,a)=>(o.name||"").localeCompare(a.name||"","ar")),P=(n||[]).sort((o,a)=>(o.name||"").localeCompare(a.name||"","ar")),b=(d||[]).sort((o,a)=>(a.date||"").localeCompare(o.date||"")),ut(),nt(b),it(b),xt(),gt()}catch(e){console.error("loadInitialData error:",e),f("خطأ في تحميل بيانات سندات التسليم: "+e.message,"error")}}function ut(){const e=document.getElementById("dn-cust-filter");e&&(e.innerHTML='<option value="">كل العملاء</option>'+z.map(o=>`<option value="${o.id}">${o.name}</option>`).join(""));const t=document.getElementById("dn-rep-filter");t&&(t.innerHTML='<option value="">كل المناديب</option>'+q.map(o=>`<option value="${o.name}">${o.name}</option>`).join(""));const i=document.getElementById("dn-wh-filter");i&&(i.innerHTML='<option value="">كل المستودعات والسيارات</option>'+D.map(o=>`<option value="${o.id}">${o.name}</option>`).join(""));const n=document.getElementById("dn-warehouse");n&&(n.innerHTML=D.map(o=>`<option value="${o.id}">${o.name}</option>`).join(""));const d=document.getElementById("dn-rep");d&&(d.innerHTML='<option value="">بدون مندوب</option>'+q.map(o=>`<option value="${o.name}">${o.name}</option>`).join(""))}window.filterDeliveryNotes=()=>{const e=(document.getElementById("dn-search")?.value||"").trim().toLowerCase(),t=document.getElementById("dn-cust-filter")?.value||"",i=document.getElementById("dn-rep-filter")?.value||"",n=document.getElementById("dn-wh-filter")?.value||"",d=document.getElementById("dn-status-filter")?.value||"",o=document.getElementById("dn-date-from")?.value||"",a=document.getElementById("dn-date-to")?.value||"",r=b.filter(l=>{if(e){const m=(l.number||"").toLowerCase().includes(e),x=(l.customerName||"").toLowerCase().includes(e),y=(l.repName||"").toLowerCase().includes(e),s=(l.lines||[]).some(N=>(N.productName||"").toLowerCase().includes(e));if(!m&&!x&&!y&&!s)return!1}return!(t&&l.customerId!==t||i&&l.repName!==i||n&&l.warehouseId!==n||d&&l.status!==d||o&&(l.date||"")<o||a&&(l.date||"")>a)});nt(r),it(r)};function nt(e){const t=document.getElementById("dn-tbody");if(!t)return;if(!e||e.length===0){t.innerHTML='<tr><td colspan="11" style="text-align:center; padding:40px; color:var(--text-2);">لا توجد سندات تسليم تطابق الفلاتر المحددة</td></tr>';return}const i=n=>n==="confirmed"?'<span style="background:rgba(16,185,129,.12);color:#10b981;padding:3px 8px;border-radius:12px;font-weight:800;font-size:11px;">🟢 تم التسليم</span>':n==="draft"?'<span style="background:rgba(245,158,11,.12);color:#f59e0b;padding:3px 8px;border-radius:12px;font-weight:800;font-size:11px;">🟡 مسودة</span>':n==="converted_to_invoice"?'<span style="background:rgba(59,130,246,.12);color:#3b82f6;padding:3px 8px;border-radius:12px;font-weight:800;font-size:11px;">🔵 تم التحويل لفاتورة</span>':n==="cancelled"?'<span style="background:rgba(239,68,68,.12);color:#ef4444;padding:3px 8px;border-radius:12px;font-weight:800;font-size:11px;">🔴 ملغي</span>':`<span style="background:var(--bg-2);color:var(--text-2);padding:3px 8px;border-radius:12px;font-weight:800;font-size:11px;">${n||"—"}</span>`;t.innerHTML=e.map((n,d)=>{const o=(n.lines||[]).reduce((l,m)=>l+(parseFloat(m.qty)||0),0),a=parseFloat(n.totalAmount||n.grandTotal||n.total||0),r=n.paymentMethod==="cash"?"💵 نقدي":"⏳ آجل";return`
      <tr style="border-bottom:1px solid var(--border-soft); transition:background .15s;" onmouseover="this.style.background='var(--bg-2)'" onmouseout="this.style.background=''">
        <td style="padding:10px 8px; text-align:center; color:var(--text-3); font-family:monospace;">${d+1}</td>
        <td style="padding:10px 10px; font-family:monospace; font-weight:800; color:#2563eb; cursor:pointer;" onclick="window.viewDeliveryNote('${n.id}')">
          ${n.number||"—"}
        </td>
        <td style="padding:10px 10px; text-align:center; font-family:monospace; color:var(--text-2); white-space:nowrap;">${j(n.date)}</td>
        <td style="padding:10px 12px;">
          <div style="font-weight:700; font-size:13px; color:var(--text-0);">${n.customerName||"عميل نقدي"}</div>
          ${n.receiverName?`<div style="font-size:10px; color:var(--text-3);">مستلم: ${n.receiverName}</div>`:""}
        </td>
        <td style="padding:10px 10px; color:var(--text-1); font-size:11.5px;">${n.repName||"—"}</td>
        <td style="padding:10px 10px; color:var(--text-2); font-size:11.5px;">${n.warehouseName||"—"}</td>
        <td style="padding:10px 8px; text-align:center; font-family:monospace; font-weight:700;">${h(o)}</td>
        <td style="padding:10px 12px; text-align:left; font-family:monospace; font-weight:800; color:#10b981;">${g(a)}</td>
        <td style="padding:10px 8px; text-align:center; font-size:11px; font-weight:700;">${r}</td>
        <td style="padding:10px 10px; text-align:center;">${i(n.status)}</td>
        <td style="padding:10px 12px; text-align:center;">
          <div style="display:inline-flex; gap:4px; align-items:center;">
            <button type="button" class="btn btn-sm btn-secondary" onclick="window.viewDeliveryNote('${n.id}')" title="عرض ومعاينة وطباعة" style="padding:3px 7px;">👁️</button>
            <button type="button" class="btn btn-sm btn-secondary" onclick="window.directPrintDNA4('${n.id}')" title="طباعة رسمية A4" style="padding:3px 7px;">🖨️</button>
            ${n.status==="draft"?`
              <button type="button" class="btn btn-sm btn-secondary" onclick="window.editDeliveryNote('${n.id}')" title="تعديل السند" style="padding:3px 7px;">✏️</button>
            `:""}
            ${n.status!=="cancelled"&&n.status!=="converted_to_invoice"?`
              <button type="button" class="btn btn-sm btn-danger" onclick="window.cancelDeliveryNote('${n.id}')" title="إلغاء السند واسترجاع المخزون" style="padding:3px 7px; background:rgba(239,68,68,.1); color:#ef4444; border:1px solid rgba(239,68,68,.2);">❌</button>
            `:""}
          </div>
        </td>
      </tr>
    `}).join("")}function it(e){const t=e.length;let i=0,n=0,d=0;e.forEach(o=>{o.status!=="cancelled"&&(i+=parseFloat(o.totalAmount||o.grandTotal||o.total||0),(o.lines||[]).forEach(a=>{n+=parseFloat(a.qty||0)})),o.status==="draft"&&d++}),document.getElementById("dn-kpi-count").textContent=t,document.getElementById("dn-kpi-total-val").textContent=g(i),document.getElementById("dn-kpi-total-qty").textContent=h(n),document.getElementById("dn-kpi-drafts").textContent=d}async function mt(){try{let e=0;return b.forEach(t=>{const n=(t.number||"").match(/DN-(\d+)/i);if(n){const d=parseInt(n[1],10);d>e&&(e=d)}}),`DN-${String(e+1).padStart(6,"0")}`}catch{return`DN-${Date.now().toString().slice(-6)}`}}window.openNewDeliveryNoteModal=async()=>{O=null,M=null,u=[];const e=document.getElementById("dn-modal-title");e&&(e.textContent="📦 إنشاء سند تسليم بضاعة مبيعات جديد (DN)");const t=document.getElementById("btn-save-dn");t&&(t.textContent="✅ حفظ وتأكيد التسليم (خصم فوري للمخزون)");const i=await mt(),n=document.getElementById("dn-number");n&&(n.value=i);const d=document.getElementById("dn-date");d&&(d.value=v());const o=document.getElementById("dn-customer-search");o&&(o.value="");const a=document.getElementById("dn-customer-id");a&&(a.value="");const r=document.getElementById("dn-customer-balance-box");r&&(r.textContent="—");const l=document.getElementById("dn-receiver-name");l&&(l.value="");const m=document.getElementById("dn-notes");m&&(m.value="");const x=document.getElementById("dn-payment-method");if(x&&(x.value="credit"),B(),T(),typeof window.openModal=="function")window.openModal("dn-modal");else{const y=document.getElementById("dn-modal");y&&(y.classList.add("active"),y.classList.remove("hidden"))}};window.editDeliveryNote=e=>{const t=b.find(s=>s.id===e);if(!t)return;O=t.id,M=z.find(s=>s.id===t.customerId)||null,u=(t.lines||[]).map(s=>({...s}));const i=document.getElementById("dn-modal-title");i&&(i.textContent=`✏️ تعديل سند تسليم رقم ${t.number}`);const n=document.getElementById("btn-save-dn");n&&(n.textContent="✅ حفظ وتأكيد التسليم (خصم فوري للمخزون)");const d=document.getElementById("dn-number");d&&(d.value=t.number||"");const o=document.getElementById("dn-date");o&&(o.value=t.date||v());const a=document.getElementById("dn-customer-search");a&&(a.value=t.customerName||"");const r=document.getElementById("dn-customer-id");r&&(r.value=t.customerId||"");const l=document.getElementById("dn-customer-balance-box");l&&(l.textContent=g(M?.balance||0));const m=document.getElementById("dn-receiver-name");m&&(m.value=t.receiverName||"");const x=document.getElementById("dn-notes");x&&(x.value=t.notes||"");const y=document.getElementById("dn-payment-method");if(y&&(y.value=t.paymentMethod||"credit"),t.warehouseId){const s=document.getElementById("dn-warehouse");s&&(s.value=t.warehouseId)}if(t.repName){const s=document.getElementById("dn-rep");s&&(s.value=t.repName)}if(B(),T(),typeof window.openModal=="function")window.openModal("dn-modal");else{const s=document.getElementById("dn-modal");s&&(s.classList.add("active"),s.classList.remove("hidden"))}};window.closeDeliveryNoteModal=()=>{if(typeof window.closeModal=="function")window.closeModal("dn-modal");else{const e=document.getElementById("dn-modal");e&&e.classList.remove("active")}};function xt(){const e=document.getElementById("dn-customer-search"),t=document.getElementById("dn-customer-results");!e||!t||(e.addEventListener("input",i=>{const n=i.target.value.trim().toLowerCase();if(!n){t.style.display="none";return}const d=z.filter(o=>(o.name||"").toLowerCase().includes(n)||(o.phone||"").includes(n)||(o.code||"").toLowerCase().includes(n)).slice(0,15);if(d.length===0){t.innerHTML='<div style="padding:8px; font-size:11.5px; color:var(--text-3); text-align:center;">لا يوجد عميل مطابق</div>',t.style.display="block";return}t.innerHTML=d.map(o=>`
      <div onclick="window.selectDNCustomer('${o.id}')" style="padding:6px 10px; border-radius:6px; cursor:pointer; font-size:12px; display:flex; justify-content:space-between; align-items:center; transition:background .15s;" onmouseover="this.style.background='var(--bg-2)'" onmouseout="this.style.background=''">
        <div>
          <b>${o.name}</b>
          <span style="font-size:10px; color:var(--text-3); margin-right:6px;">${o.phone||""}</span>
        </div>
        <div style="font-size:11px; font-family:monospace; color:${(o.balance||0)>0?"#ef4444":"#10b981"};">
          رصيد: ${g(o.balance||0)}
        </div>
      </div>
    `).join(""),t.style.display="block"}),document.addEventListener("click",i=>{!e.contains(i.target)&&!t.contains(i.target)&&(t.style.display="none")}))}window.selectDNCustomer=e=>{const t=z.find(i=>i.id===e);if(t){if(M=t,document.getElementById("dn-customer-id").value=t.id,document.getElementById("dn-customer-search").value=t.name,document.getElementById("dn-customer-balance-box").textContent=g(t.balance||0),document.getElementById("dn-customer-balance-box").style.color=(t.balance||0)>0?"#ef4444":"#10b981",t.repName){const i=document.getElementById("dn-rep");i&&(i.value=t.repName)}document.getElementById("dn-customer-results").style.display="none"}};function gt(){const e=document.getElementById("dn-product-search"),t=document.getElementById("dn-product-results");!e||!t||(e.addEventListener("input",async i=>{const n=i.target.value.trim().toLowerCase();if(!n){t.style.display="none";return}const d=P.filter(o=>(o.name||"").toLowerCase().includes(n)||(o.sku||"").toLowerCase().includes(n)||(o.barcode||"").includes(n)).slice(0,20);if(d.length===0){t.innerHTML=`<div style="padding:10px; font-size:12px; color:var(--text-3); text-align:center;">لا يوجد صنف مطابق لـ "${n}"</div>`,t.style.display="block";return}document.getElementById("dn-warehouse")?.value,t.innerHTML=d.map(o=>{const a=parseFloat(o.price||o.salePrice||o.retailPrice||0);return`
        <div onclick="window.addDNProductLine('${o.id}')" style="padding:8px 12px; border-radius:6px; cursor:pointer; font-size:12px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-soft); transition:background .15s;" onmouseover="this.style.background='rgba(37,99,235,0.08)'" onmouseout="this.style.background=''">
          <div>
            <div style="font-weight:700; color:var(--text-0);">${o.name}</div>
            <div style="font-size:10.5px; color:var(--text-3);">كود: <span class="mono">${o.sku||"—"}</span> | الوحدة: ${V(o.unit||"كرتون")}</div>
          </div>
          <div style="text-align:left;">
            <div style="font-weight:800; color:#10b981; font-family:monospace;">${g(a)}</div>
            <div style="font-size:10px; color:#2563eb; font-weight:700;">المخزون الكلي: ${h(o.totalQty||0)}</div>
          </div>
        </div>
      `}).join(""),t.style.display="block"}),document.addEventListener("click",i=>{!e.contains(i.target)&&!t.contains(i.target)&&(t.style.display="none")}))}window.addDNProductLine=async e=>{const t=P.find(o=>o.id===e);if(!t)return;const i=document.getElementById("dn-warehouse")?.value||"";let n=0;try{const o=await tt(et(R,`companies/${H}/stockByWarehouse`,`${i}_${t.id}`));o.exists()&&(n=parseFloat(o.data().qty||0))}catch{}const d=parseFloat(t.price||t.salePrice||t.retailPrice||0);u.push({productId:t.id,productName:t.name,sku:t.sku||"",unit:t.unit||"Carton",basePrice:d,unitPrice:d,qty:1,discountPct:0,availableStock:n,batchNumber:"",expiryDate:""}),document.getElementById("dn-product-search").value="",document.getElementById("dn-product-results").style.display="none",B(),T()};window.onDNWarehouseChanged=async()=>{const e=document.getElementById("dn-warehouse")?.value||"";if(!(!e||u.length===0)){for(const t of u)try{const i=await tt(et(R,`companies/${H}/stockByWarehouse`,`${e}_${t.productId}`));t.availableStock=i.exists()?parseFloat(i.data().qty||0):0}catch{}B()}};function B(){const e=document.getElementById("dn-lines-tbody");if(e){if(u.length===0){e.innerHTML='<tr><td colspan="10" style="text-align:center; padding:25px; color:var(--text-3);">لم تتم إضافة أي أصناف بعد. ابحث عن صنف من الحقل أعلاه لإضافته للسند.</td></tr>';return}e.innerHTML=u.map((t,i)=>{const n=(parseFloat(t.qty)||0)*(parseFloat(t.unitPrice)||0)*(1-(parseFloat(t.discountPct)||0)/100),d=t.availableStock<t.qty;return`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:6px; text-align:center; color:var(--text-3); font-family:monospace;">${i+1}</td>
        <td style="padding:6px 10px;">
          <div style="font-weight:700; font-size:12.5px;">${t.productName}</div>
          <div style="font-size:10px; color:var(--text-3);">كود: <span class="mono">${t.sku||"—"}</span></div>
        </td>
        <td style="padding:6px; text-align:center; font-size:11px; font-weight:700;">
          ${V(t.unit)}
        </td>
        <td style="padding:6px;">
          <input type="text" class="input" placeholder="رقم التشغيلة..." value="${t.batchNumber||""}" onchange="window.updateDNLine(${i}, 'batchNumber', this.value)" style="height:28px; font-size:11px; text-align:center; width:100%; margin-bottom:2px;" />
          <input type="date" class="input mono" value="${t.expiryDate||""}" onchange="window.updateDNLine(${i}, 'expiryDate', this.value)" style="height:26px; font-size:10.5px; width:100%;" />
        </td>
        <td style="padding:6px; text-align:center;">
          <span style="display:inline-block; padding:2px 6px; border-radius:4px; font-size:11px; font-family:monospace; font-weight:800; background:${d?"rgba(239,68,68,.12)":"rgba(16,185,129,.12)"}; color:${d?"#ef4444":"#10b981"};">
            ${h(t.availableStock)}
          </span>
        </td>
        <td style="padding:6px;">
          <input type="number" step="any" min="1" class="input mono font-bold" value="${t.qty}" oninput="window.updateDNLine(${i}, 'qty', this.value)" style="height:30px; font-size:12px; text-align:center; width:100%;" />
        </td>
        <td style="padding:6px;">
          <input type="number" step="0.01" min="0" class="input mono font-bold" value="${t.unitPrice}" oninput="window.updateDNLine(${i}, 'unitPrice', this.value)" style="height:30px; font-size:12px; text-align:center; width:100%;" />
        </td>
        <td style="padding:6px;">
          <input type="number" step="0.5" min="0" max="100" class="input mono" value="${t.discountPct}" oninput="window.updateDNLine(${i}, 'discountPct', this.value)" style="height:30px; font-size:11.5px; text-align:center; width:100%;" />
        </td>
        <td style="padding:6px 10px; text-align:left; font-family:monospace; font-weight:800; color:#2563eb; font-size:12.5px;">
          ${g(n)}
        </td>
        <td style="padding:6px; text-align:center;">
          <button type="button" onclick="window.removeDNLine(${i})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:16px;">🗑️</button>
        </td>
      </tr>
    `}).join("")}}window.updateDNLine=(e,t,i)=>{u[e]&&(t==="qty"||t==="unitPrice"||t==="discountPct"?u[e][t]=parseFloat(i)||0:u[e][t]=i,T())};window.removeDNLine=e=>{u.splice(e,1),B(),T()};function T(){let e=0,t=0;u.forEach(n=>{const d=(parseFloat(n.qty)||0)*(parseFloat(n.unitPrice)||0),o=d*((parseFloat(n.discountPct)||0)/100);e+=d,t+=o});const i=Math.max(0,e-t);document.getElementById("dn-subtotal").textContent=g(e),document.getElementById("dn-discount").textContent=`-${g(t)}`,document.getElementById("dn-grand-total").textContent=g(i),document.getElementById("dn-tafqeet").textContent=X(i)}window.saveDeliveryNote=async(e="confirmed")=>{try{const t=document.getElementById("dn-number")?.value.trim(),i=document.getElementById("dn-date")?.value,n=document.getElementById("dn-customer-id")?.value,d=document.getElementById("dn-customer-search")?.value.trim(),o=document.getElementById("dn-warehouse")?.value,a=document.getElementById("dn-rep")?.value,r=document.getElementById("dn-payment-method")?.value||"credit",l=document.getElementById("dn-receiver-name")?.value.trim(),m=document.getElementById("dn-notes")?.value.trim();if(!t)throw new Error("رقم سند التسليم مطلوب");if(!i)throw new Error("تاريخ التسليم مطلوب");if(!n||!d)throw new Error("يرجى اختيار العميل المستلم");if(!o)throw new Error("يرجى تحديد المستودع أو سيارة المندوب");if(u.length===0)throw new Error("يجب إضافة صنف واحد على الأقل في سند التسليم");const x=D.find(p=>p.id===o),y=x?x.name:o;let s=0,N=0,Y=0;const Q=u.map(p=>{const c=parseFloat(p.qty)||1,L=parseFloat(p.unitPrice)||0,U=parseFloat(p.discountPct)||0,S=c*L,K=S*(U/100),dt=S-K;s+=S,N+=K;const C=(P||[]).find(at=>at.id===p.productId),G=parseFloat(p.costPrice||C?.avgCostPrice||C?.lastPurchasePrice||C?.costPrice||C?.purchasePrice||0);return Y+=c*G,{productId:p.productId,productName:p.productName,sku:p.sku||"",unit:p.unit||"Carton",qty:c,unitPrice:L,costPrice:G,discountPct:U,lineTotal:dt,batchNumber:p.batchNumber||"",expiryDate:p.expiryDate||""}}),J=Math.round((s-N)*100)/100,F={number:t,dnNumber:t,date:i,customerId:n,customerName:d,warehouseId:o,warehouseName:y,repName:a||"بدون مندوب",paymentMethod:r,receiverName:l||"",notes:m||"",lines:Q,subtotal:s,totalDiscount:N,taxAmount:0,vatAmount:0,grandTotal:J,totalAmount:J,totalCost:Math.round(Y*100)/100,status:e,isNonVat:!0,docType:"delivery_note",createdAt:k(),updatedAt:k()};let E=O;if(E?await _("deliveryNotes",E,F):E=(await rt("deliveryNotes",F)).id,e==="confirmed"){const p=Q.map(c=>({warehouseId:o,productId:c.productId,qtyDelta:-parseFloat(c.qty),metadata:{type:"delivery_note",docNum:t,documentNumber:t,sourceId:E,refType:"delivery_note",partyName:d,date:i,batchNumber:c.batchNumber||"",expiryDate:c.expiryDate||"",notes:`سند تسليم بضاعة رقم ${t} للعميل: ${d} (${y})`}}));try{await Z(p)}catch(c){console.error("Stock deduction error:",c),f("تم حفظ السند ولكن حدث تنبيه في المخزون: "+c.message,"warn")}n&&A(()=>import("./balance-sync-CUiyFg8g.js"),__vite__mapDeps([0,1,2])).then(c=>c.recalculateCustomerBalance(n)).catch(console.warn);try{const{autoDeliveryNoteJE:c}=await A(async()=>{const{autoDeliveryNoteJE:L}=await import("./accounting-engine-C71tPcGM.js");return{autoDeliveryNoteJE:L}},__vite__mapDeps([3,1,2]));await c({id:E,...F,number:t},user,D)}catch(c){console.warn("[DeliveryNote] Accounting JE warning:",c)}}f(e==="confirmed"?`✅ تم إصدار سند التسليم رقم ${t} وخصم المخزون بنجاح`:"📝 تم حفظ سند التسليم كمسودة","success"),window.closeDeliveryNoteModal(),await W()}catch(t){console.error("saveDeliveryNote error:",t),f("خطأ: "+t.message,"error")}};let w=null;window.viewDeliveryNote=e=>{const t=b.find(r=>r.id===e);if(!t)return;w=t;const i=ot(),n=document.getElementById("dn-view-modal"),d=document.getElementById("dn-view-content");if(!n||!d)return;const o=(t.lines||[]).reduce((r,l)=>r+(parseFloat(l.qty)||0),0),a=parseFloat(t.totalAmount||t.grandTotal||t.total||0);d.innerHTML=`
    <div style="max-width:820px; margin:0 auto; font-family:'Cairo',sans-serif;">
      
      <!-- High-End Header -->
      <div style="display:grid; grid-template-columns:1fr auto 1fr; gap:16px; align-items:center; border-bottom:2.5px solid #1e3a8a; padding-bottom:14px; margin-bottom:16px;">
        <div>
          <h2 style="margin:0; font-size:18px; font-weight:900; color:#1e3a8a;">${i.name}</h2>
          <div style="font-size:11px; color:#64748b; margin-top:2px;">${i.nameEn||"Foodstuff Trading & Distribution"}</div>
          <div style="font-size:11px; color:#334155; margin-top:4px;">
            السجل التجاري: <b>${i.crNumber||"—"}</b> • هاتف: ${i.phone||"—"}
          </div>
          <div style="font-size:11px; color:#334155;">العنوان: ${i.address||"المملكة العربية السعودية"}</div>
        </div>

        <div style="text-align:center;">
          <div style="display:inline-block; border:2px solid #1e3a8a; border-radius:10px; padding:6px 18px; background:#eff6ff;">
            <h1 style="margin:0; font-size:16px; font-weight:900; color:#1e3a8a;">سند تسليم بضاعة مبيعات</h1>
            <div style="font-size:10.5px; font-weight:800; color:#2563eb; letter-spacing:1px; margin-top:1px;">DELIVERY NOTE (NON-VAT)</div>
          </div>
          <div style="font-size:10px; color:#64748b; margin-top:4px; font-weight:700;">مستند تسليم وإثبات استلام تجاري</div>
        </div>

        <div style="text-align:left;">
          <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:8px 12px; font-size:11px; display:inline-block; text-align:right;">
            <div>رقم السند: <b class="mono" style="color:#1e3a8a; font-size:13px;">${t.number}</b></div>
            <div style="margin-top:2px;">التاريخ: <b class="mono">${j(t.date)}</b></div>
            <div style="margin-top:2px;">طريقة الدفع: <b>${t.paymentMethod==="cash"?"نقدي":"آجل (على الحساب)"}</b></div>
            <div style="margin-top:2px;">الحالة: <b style="color:${t.status==="confirmed"?"#16a34a":"#f59e0b"};">${t.status==="confirmed"?"مؤكد ومسلم":"مسودة"}</b></div>
          </div>
        </div>
      </div>

      <!-- Customer & Route Meta Box -->
      <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:12px; margin-bottom:16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px 16px; font-size:11.5px;">
        <div>
          <div>العميل المستلم: <b style="font-size:13px; color:#0f172a;">${t.customerName}</b></div>
          <div style="margin-top:4px; color:#475569;">المستودع / السيارة المسلِّمة: <b>${t.warehouseName||"—"}</b></div>
          ${t.receiverName?`<div style="margin-top:4px; color:#475569;">الشخص المستلم: <b>${t.receiverName}</b></div>`:""}
        </div>
        <div>
          <div>المندوب المسؤول: <b>${t.repName||"—"}</b></div>
          <div style="margin-top:4px; color:#475569;">تاريخ الطباعة: <b class="mono">${new Date().toLocaleDateString("ar-SA")}</b></div>
          ${t.convertedInvoiceNumber?`<div style="margin-top:4px; color:#2563eb; font-weight:700;">مرتبط بفاتورة ضريبية: ${t.convertedInvoiceNumber}</div>`:""}
        </div>
      </div>

      <!-- Items Table -->
      <table style="width:100%; border-collapse:collapse; font-size:11.5px; margin-bottom:14px;">
        <thead>
          <tr style="background:#f1f5f9; border-bottom:2px solid #cbd5e1;">
            <th style="border:1px solid #cbd5e1; padding:6px 4px; width:30px; text-align:center;">#</th>
            <th style="border:1px solid #cbd5e1; padding:6px 8px; text-align:right;">بيان الصنف والمواصفات</th>
            <th style="border:1px solid #cbd5e1; padding:6px 6px; width:80px; text-align:center;">الكود</th>
            <th style="border:1px solid #cbd5e1; padding:6px 6px; width:70px; text-align:center;">الوحدة</th>
            <th style="border:1px solid #cbd5e1; padding:6px 6px; width:110px; text-align:center;">التشغيلة / الصلاحية</th>
            <th style="border:1px solid #cbd5e1; padding:6px 6px; width:70px; text-align:center;">الكمية</th>
            <th style="border:1px solid #cbd5e1; padding:6px 8px; width:85px; text-align:center;">السعر</th>
            <th style="border:1px solid #cbd5e1; padding:6px 8px; width:95px; text-align:left;">الإجمالي (ر.س)</th>
          </tr>
        </thead>
        <tbody>
          ${(t.lines||[]).map((r,l)=>`
            <tr>
              <td style="border:1px solid #e2e8f0; padding:5px; text-align:center; color:#64748b; font-family:monospace;">${l+1}</td>
              <td style="border:1px solid #e2e8f0; padding:5px 8px; font-weight:700;">${r.productName}</td>
              <td style="border:1px solid #e2e8f0; padding:5px; text-align:center; font-family:monospace; color:#475569;">${r.sku||"—"}</td>
              <td style="border:1px solid #e2e8f0; padding:5px; text-align:center;">${V(r.unit)}</td>
              <td style="border:1px solid #e2e8f0; padding:5px; text-align:center; font-size:10px; font-family:monospace; color:#475569;">
                ${r.batchNumber?`تشغيلة: ${r.batchNumber}`:""} ${r.expiryDate?`<br>انتهاء: ${r.expiryDate}`:"—"}
              </td>
              <td style="border:1px solid #e2e8f0; padding:5px; text-align:center; font-weight:900; font-family:monospace; font-size:12px;">${h(r.qty)}</td>
              <td style="border:1px solid #e2e8f0; padding:5px 8px; text-align:center; font-family:monospace;">${parseFloat(r.unitPrice||0).toFixed(2)}</td>
              <td style="border:1px solid #e2e8f0; padding:5px 8px; text-align:left; font-family:monospace; font-weight:800;">${parseFloat(r.lineTotal||r.qty*r.unitPrice||0).toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr style="background:#f8fafc; font-weight:900;">
            <td colspan="5" style="border:1px solid #cbd5e1; padding:6px 8px; text-align:right;">الإجمالي العام (${(t.lines||[]).length} أصناف)</td>
            <td style="border:1px solid #cbd5e1; padding:6px; text-align:center; font-family:monospace; color:#2563eb; font-size:12.5px;">${h(o)}</td>
            <td style="border:1px solid #cbd5e1; padding:6px 8px; text-align:center;">—</td>
            <td style="border:1px solid #cbd5e1; padding:6px 8px; text-align:left; font-family:monospace; color:#15803d; font-size:13px;">${g(a)}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Amount in Words & Notes -->
      <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:12px; margin-bottom:16px;">
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 12px; font-size:11px;">
          <div style="font-weight:700; color:#334155; margin-bottom:2px;">المبلغ بالحروف:</div>
          <div style="font-weight:800; color:#1e3a8a;">${X(a)}</div>
          ${t.notes?`<div style="margin-top:6px; color:#475569;">ملاحظات: ${t.notes}</div>`:""}
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 12px; font-size:10px; color:#475569; line-height:1.4;">
          <b>📌 إقرار وتعهد الاستلام:</b>
          أقر أنا الموقع أدناه بأنني قد استلمت البضاعة الموضحة أعلاه كاملة وبحالة سليمة ومطابقة للمواصفات المطلوبة، وأتعهد بالالتزام بالقيمة المسجلة.
        </div>
      </div>

      <!-- Triple Signatures Area -->
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; text-align:center; font-size:11px; margin-top:20px; border-top:1px solid #cbd5e1; padding-top:12px;">
        <div style="border:1px dashed #cbd5e1; border-radius:8px; padding:10px;">
          <b>توقيع واستلام العميل (المستلم)</b>
          <div style="height:35px;"></div>
          <div style="border-top:1px solid #94a3b8; font-size:10px; color:#64748b; padding-top:3px;">الاسم والتوقيع والختم</div>
        </div>

        <div style="border:1px dashed #cbd5e1; border-radius:8px; padding:10px;">
          <b>مندوب المبيعات / السائق</b>
          <div style="height:35px;"></div>
          <div style="border-top:1px solid #94a3b8; font-size:10px; color:#64748b; padding-top:3px;">توقيع مندوب التوصيل</div>
        </div>

        <div style="border:1px dashed #cbd5e1; border-radius:8px; padding:10px;">
          <b>أمين المستودع / الاعتماد</b>
          <div style="height:35px;"></div>
          <div style="border-top:1px solid #94a3b8; font-size:10px; color:#64748b; padding-top:3px;">إذن صرف المستودع الرسمي</div>
        </div>
      </div>

    </div>
  `,typeof window.openModal=="function"?window.openModal("dn-view-modal"):(n.classList.add("active"),n.classList.remove("hidden"))};window.closeViewDNModal=()=>{if(typeof window.closeModal=="function")window.closeModal("dn-view-modal");else{const e=document.getElementById("dn-view-modal");e&&e.classList.remove("active")}};window.directPrintDNA4=e=>{window.viewDeliveryNote(e),setTimeout(()=>{window.printDNA4()},200)};window.printDNA4=()=>{const e=document.getElementById("dn-view-content");if(!e)return;const t=window.open("","_blank","width=900,height=800");if(!t){alert("يرجى السماح بالنوافذ المنبثقة للطباعة");return}t.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>سند تسليم بضاعة — ${w?.number||""}</title>
      <style>
        @page { size: A4 portrait; margin: 10mm 12mm; }
        * { box-sizing: border-box; }
        body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; background:#fff; color:#0f172a; margin:0; padding:10px; font-size:11px; }
        .mono { font-family: monospace; }
        table { width:100%; border-collapse:collapse; }
      </style>
    </head>
    <body onload="window.print();">
      ${e.innerHTML}
    </body>
    </html>
  `),t.document.close()};window.printDNThermal=()=>{if(!w)return;const e=w,t=ot(),i=(e.lines||[]).reduce((o,a)=>o+(parseFloat(a.qty)||0),0),n=parseFloat(e.totalAmount||e.grandTotal||e.total||0),d=window.open("","_blank","width=400,height=700");if(!d){alert("يرجى السماح بالنوافذ المنبثقة للطباعة");return}d.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>إيصال تسليم ${e.number}</title>
      <style>
        @page { size: 80mm auto; margin: 2mm; }
        body { font-family: 'Cairo', Tahoma, sans-serif; width: 76mm; margin: 0 auto; padding: 4px; font-size: 11px; line-height: 1.25; color: #000; }
        .text-center { text-align: center; }
        .bold { font-weight: bold; }
        .mono { font-family: monospace; }
        .hr { border-top: 1px dashed #000; margin: 6px 0; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; }
        th, td { padding: 3px 2px; }
      </style>
    </head>
    <body onload="window.print();">
      <div class="text-center">
        <div class="bold" style="font-size:14px;">${t.name}</div>
        <div style="font-size:9.5px;">سند تسليم بضاعة مبيعات</div>
        <div class="bold mono" style="font-size:12px; margin:3px 0;">${e.number}</div>
        <div class="mono" style="font-size:10px;">${j(e.date)}</div>
      </div>
      <div class="hr"></div>
      <div>العميل: <b>${e.customerName}</b></div>
      <div>المندوب: ${e.repName||"—"}</div>
      <div>المستودع: ${e.warehouseName||"—"}</div>
      <div>الدفع: <b>${e.paymentMethod==="cash"?"نقدي":"آجل"}</b></div>
      <div class="hr"></div>
      <table>
        <thead>
          <tr style="border-bottom:1px solid #000;">
            <th style="text-align:right;">الصنف</th>
            <th style="text-align:center; width:30px;">الكمية</th>
            <th style="text-align:center; width:35px;">السعر</th>
            <th style="text-align:left; width:45px;">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${(e.lines||[]).map(o=>`
            <tr>
              <td>${o.productName}</td>
              <td class="mono" style="text-align:center; font-weight:bold;">${o.qty}</td>
              <td class="mono" style="text-align:center;">${parseFloat(o.unitPrice).toFixed(2)}</td>
              <td class="mono" style="text-align:left; font-weight:bold;">${parseFloat(o.lineTotal||o.qty*o.unitPrice).toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div class="hr"></div>
      <div style="display:flex; justify-content:space-between; font-size:11px;">
        <span>إجمالي الكمية:</span>
        <span class="mono bold">${i}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:bold; margin-top:3px;">
        <span>الصافي المطلوب:</span>
        <span class="mono">${g(n)}</span>
      </div>
      <div class="hr"></div>
      <div class="text-center" style="font-size:9.5px;">
        استلمت البضاعة كاملة وبحالة جيدة
        <br><br>
        توقيع المستلم: ___________________
      </div>
    </body>
    </html>
  `),d.document.close()};window.cancelDeliveryNote=async e=>{const t=b.find(i=>i.id===e);if(t&&confirm(`هل أنت متأكد من إلغاء سند التسليم رقم "${t.number}"؟
سيتم استرجاع كميات البضاعة إلى المستودع وإلغاء المديونية.`))try{if(t.status==="confirmed"){const i=(t.lines||[]).map(n=>({warehouseId:t.warehouseId,productId:n.productId,qtyDelta:parseFloat(n.qty||0),metadata:{type:"delivery_cancel",docNum:t.number,documentNumber:t.number,sourceId:t.id,refType:"delivery_cancel",partyName:t.customerName,date:v(),notes:`إلغاء سند تسليم بضاعة رقم ${t.number}`}}));await Z(i),t.customerId&&A(()=>import("./balance-sync-CUiyFg8g.js"),__vite__mapDeps([0,1,2])).then(n=>n.recalculateCustomerBalance(t.customerId)).catch(console.warn);try{const n=await getDocs(st(ct(R,`companies/${H}/journalEntries`),pt("sourceId","==",e)));for(const d of n.docs)await _("journalEntries",d.id,{status:"cancelled",cancelledAt:k()})}catch(n){console.warn("[DeliveryNote] Error cancelling related JEs:",n)}}await _("deliveryNotes",e,{status:"cancelled",cancelledAt:k()}),f(`تم إلغاء سند التسليم رقم ${t.number} واسترجاع المخزون بنجاح`,"success"),await W()}catch(i){console.error("cancelDeliveryNote error:",i),f("خطأ في إلغاء السند: "+i.message,"error")}};window.convertDNToSalesInvoice=async()=>{if(!w)return;const e=w;if(e.status==="converted_to_invoice"){f(`هذا السند تم تحويله مسبقاً إلى فاتورة ضريبية رقم ${e.convertedInvoiceNumber||""}`,"warn");return}if(confirm(`هل ترغب في تحويل سند التسليم "${e.number}" إلى فاتورة ضريبية رسمية (INV)؟`))try{const t={customerId:e.customerId,customerName:e.customerName,warehouseId:e.warehouseId,repName:e.repName,paymentMethod:e.paymentMethod||"credit",notes:`تحويل من سند تسليم بضاعة رقم ${e.number}`,deliveryNoteId:e.id,deliveryNoteNumber:e.number,items:(e.lines||[]).map(i=>({productId:i.productId,productName:i.productName,sku:i.sku,unit:i.unit,qty:i.qty,unitPrice:i.unitPrice,discountPct:i.discountPct||0,batchNumber:i.batchNumber||"",expiryDate:i.expiryDate||""}))};sessionStorage.setItem("convert_quote",JSON.stringify(t)),await _("deliveryNotes",e.id,{status:"converted_to_invoice",convertedAt:k()}),window.closeViewDNModal(),window.navigate?window.navigate("sales-invoices"):location.hash="#sales-invoices"}catch(t){console.error("convertDNToSalesInvoice error:",t),f("خطأ في تحويل السند إلى فاتورة: "+t.message,"error")}};window.exportDeliveryNotesExcel=async()=>{if(!b||b.length===0){f("لا توجد بيانات لتصديرها","warn");return}const e=`سجل سندات تسليم البضاعة (أذون تسليم المبيعات) — ${v()}`,t=["#","رقم السند","التاريخ","العميل","المندوب","المستودع / السيارة","طريقة الدفع","عدد الأصناف","إجمالي الكمية","إجمالي القيمة (ر.س)","الحالة","ملاحظات"],i=[6,16,14,28,18,20,14,12,14,18,16,25],n=b.map((d,o)=>{const a=(d.lines||[]).reduce((m,x)=>m+(parseFloat(x.qty)||0),0),r=parseFloat(d.totalAmount||d.grandTotal||d.total||0),l=d.status==="confirmed"?"تم التسليم":d.status==="draft"?"مسودة":d.status==="converted_to_invoice"?"تم التحويل لفاتورة":"ملغي";return[o+1,d.number||"—",d.date||"—",d.customerName||"—",d.repName||"—",d.warehouseName||"—",d.paymentMethod==="cash"?"نقدي":"آجل",(d.lines||[]).length,a,Math.round(r*100)/100,l,d.notes||""]});try{await lt({title:e,headers:t,rows:n,colWidths:i}),f("تم تصدير ملف Excel بنجاح","success")}catch(d){console.error("Excel export error:",d),f("خطأ في تصدير Excel: "+d.message,"error")}};export{Et as render};
