const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css","assets/balance-sync-CUiyFg8g.js","assets/goods-receipt-ack.js_v_1-CJv8-FcM.js"])))=>i.map(i=>d[i]);
import{t as ht,g as nt,C as H,f as _,e as me,i as fe,B as ge,w as be,a as M,J as ve,K as he,_ as gt,d as O,j as Fe,h as Gt,L as De,M as Le,D as Zt,m as Tt,u as Rt,c as Ae,k as ze,N as xe,O as ye,b as ue,r as we}from"./index-CF9GFeRJ.js";import{g as Me,r as qe}from"./zatca-qr-BvSwEdXN.js";import{autoSalesJE as Ue}from"./accounting-engine-C71tPcGM.js";import{e as Re}from"./excel-DM5XZHtQ.js";import{recalculateCustomerBalance as ie}from"./balance-sync-CUiyFg8g.js";import{orderBy as bt,where as W,limit as Dt,query as lt,getDocs as vt,getDoc as Et,doc as It,collection as yt,updateDoc as je,serverTimestamp as Oe,increment as Ve}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";function rt(e){return{Piece:"حبة",Carton:"كرتون",Box:"بوكس",Bag:"كيس",Pack:"شد",Sack:"شوال",Bale:"بالة",Barrel:"برميل",Tray:"طبق",Gallon:"جالون",Kilogram:"كيلو",Ton:"طن",Liter:"لتر",Gram:"جرام",Can:"علبة",Bottle:"زجاجة",Meter:"متر",Tank:"تنك",Roll:"رول",Pallet:"باليت",PCS:"حبة"}[e]||e||""}let I=[],b=null,ft=[],Qt=[],Ot=null,Ht=null;const K=(e,t="info")=>{window.showToast?window.showToast(e,t):console.log(`[Toast Fallback - ${t}]: ${e}`)};function Nt(e){const t=document.getElementById("inv-form-error");t?(t.textContent=e,t.classList.remove("hidden")):alert(e)}async function Ie(){if(Ht)return Ht;try{const e=await Et(It(O,`companies/${M}/settings`,"system"));e.exists()&&(Ht=e.data())}catch(e){console.error("Failed to load pricing settings:",e)}return Ht||{}}async function no(e,t){e.innerHTML=Qe(),window._salesUser=t,document.getElementById("inv-from").addEventListener("change",()=>loadInvoicesList()),document.getElementById("inv-to").addEventListener("change",()=>loadInvoicesList()),document.getElementById("inv-status-filter").addEventListener("change",()=>loadInvoicesList()),document.getElementById("inv-zatca-filter").addEventListener("change",()=>loadInvoicesList());const o=document.getElementById("inv-text-filter");o&&o.addEventListener("input",(window.debounce||(s=>s))(()=>loadInvoicesList(),250));const a=document.getElementById("inv-customer-search-input");a&&a.addEventListener("input",(window.debounce||(s=>s))(()=>{const s=a.value.trim(),p=document.getElementById("inv-customer-clear-btn");p&&(p.style.display=s?"block":"none");const l=J?.find(u=>(u.name||"").trim().toLowerCase()===s.toLowerCase()),c=document.getElementById("inv-customer-filter");c&&(c.value=l?l.id:""),loadInvoicesList()},200)),We().catch(s=>console.warn("Filters load:",s)),loadInvoicesList().catch(s=>console.warn("Invoices load:",s));const i=sessionStorage.getItem("convert_purchase_to_sale");if(i){sessionStorage.removeItem("convert_purchase_to_sale");try{const s=JSON.parse(i);setTimeout(()=>{window.openSalesInvoiceFromPurchase(s)},200)}catch(s){console.error(s)}}const n=sessionStorage.getItem("convert_quote");if(n){sessionStorage.removeItem("convert_quote");try{const s=JSON.parse(n);setTimeout(()=>{window.openSalesInvoiceFromQuote(s)},200)}catch(s){console.error(s)}}}async function We(){try{const[e,t,o]=await Promise.all([nt(H.customers(),[bt("name")]),nt(H.salesReps(),[bt("name")]),nt(H.warehouses(),[bt("name")])]);J=e,kt=t,dt=o;const a=document.getElementById("inv-customer-filter");a&&(a.innerHTML='<option value="">كل العملاء</option>'+e.map(p=>`<option value="${p.id}">${p.name}</option>`).join(""));const i=document.getElementById("inv-customers-datalist");i&&(i.innerHTML=e.map(p=>`<option value="${p.name}">${p.code?`[${p.code}] `:""}${p.phone||""}</option>`).join(""));const n=document.getElementById("inv-rep-filter");if(n){const p=[],l=new Set;t.forEach(c=>{const u=(c.name||"").trim();u&&!l.has(u)&&(l.add(u),p.push(c))}),n.innerHTML='<option value="">كل المناديب</option>'+p.map(c=>`<option value="${c.id}">${c.name}</option>`).join("")}const s=document.getElementById("inv-warehouse-filter");s&&(s.innerHTML='<option value="">كل المستودعات</option>'+o.map(p=>`<option value="${p.id}">${p.name}</option>`).join(""))}catch(e){console.warn("Failed to load list filters dropdowns:",e)}}function Qe(){return`
    <!-- Filter Bar -->
    <div class="filterbar" style="flex-wrap: wrap; gap: 8px; align-items: flex-end;">
      <!-- Search Input for Invoices & Customers -->
      <div class="search-bar" style="min-width:240px; flex:1; max-width:300px;">
        <input type="text" id="inv-text-filter" class="input" placeholder="🔍 بحث سريع باسم العميل أو الفاتورة…" autocomplete="off" />
      </div>

      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="inv-from" value="${new Date(new Date().setDate(1)).toISOString().split("T")[0]}" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="inv-to" value="${ht()}" />
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="inv-status-filter" onchange="loadInvoicesList()">
          <option value="">الكل</option>
          <option value="posted">مرحلة</option>
          <option value="pending">معلقة</option>
          <option value="paid">مدفوعة</option>
          <option value="partial">جزئي</option>
          <option value="overdue">متأخرة</option>
          <option value="cancelled">ملغاة</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>ZATCA</label>
        <select id="inv-zatca-filter" onchange="loadInvoicesList()">
          <option value="">الكل</option>
          <option value="reported">مُرسلة</option>
          <option value="pending">لم تُرسل</option>
        </select>
      </div>
      <div class="filter-select-group" style="position:relative;">
        <label>العميل (بحث بالاسم)</label>
        <div style="display:flex; align-items:center; position:relative; min-width:190px;">
          <input type="text" id="inv-customer-search-input" list="inv-customers-datalist" class="input" placeholder="🔍 اكتب أو اختر العميل…" style="padding-left:24px; font-size:12px; width:100%;" autocomplete="off" />
          <datalist id="inv-customers-datalist"></datalist>
          <button type="button" id="inv-customer-clear-btn" style="position:absolute; left:6px; background:none; border:none; color:var(--text-3); cursor:pointer; font-size:12px; font-weight:bold; display:none;" onclick="window.clearInvoiceCustomerFilter()" title="إلغاء التصفية بالعميل">✕</button>
          <select id="inv-customer-filter" onchange="window.onCustomerSelectChange()" style="display:none;">
            <option value="">كل العملاء</option>
          </select>
        </div>
      </div>
      <div class="filter-select-group">
        <label>المندوب</label>
        <select id="inv-rep-filter" onchange="loadInvoicesList()">
          <option value="">كل المناديب</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>المستودع</label>
        <select id="inv-warehouse-filter" onchange="loadInvoicesList()">
          <option value="">كل المستودعات</option>
        </select>
      </div>
      <div class="quick-filters">
        <button class="quick-filter-btn" id="qf-today" onclick="invFilterRange('today')">اليوم</button>
        <button class="quick-filter-btn active" id="qf-month" onclick="invFilterRange('month')">هذا الشهر</button>
        <button class="quick-filter-btn" id="qf-all" onclick="invFilterRange('all')">كل الفترات</button>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn-export" onclick="exportPagePDF('.data-dense','فواتير_المبيعات')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportInvoicesExcel()" title="تصدير Excel بجميع البيانات"><span>📊</span> تصدير Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
        <button class="btn btn-primary" onclick="openNewInvoice()">+ فاتورة مبيعات</button>
      </div>
    </div>

    <div class="page-content">
      <!-- KPIs -->
      <div class="kpi-grid mb-20" id="inv-kpis">
        <div class="kpi-card g-blue">
          <div class="kpi-icon">🧾</div>
          <div class="kpi-content"><div class="kpi-label">إجمالي المبيعات</div>
            <div class="kpi-value mono" id="kpi-total">—</div></div></div>
        <div class="kpi-card g-green">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content"><div class="kpi-label">المحصّل</div>
            <div class="kpi-value mono" id="kpi-paid">—</div></div></div>
        <div class="kpi-card g-orange">
          <div class="kpi-icon">⏳</div>
          <div class="kpi-content"><div class="kpi-label">المتبقي</div>
            <div class="kpi-value mono" id="kpi-unpaid">—</div></div></div>
        <div class="kpi-card g-purple">
          <div class="kpi-icon">⚡</div>
          <div class="kpi-content"><div class="kpi-label">مُرسلة لـ ZATCA</div>
            <div class="kpi-value mono" id="kpi-zatca">—</div></div></div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 style="font-family:var(--font-heading);font-size:14px;">قائمة فواتير المبيعات</h3>
          <span id="inv-count-label" class="text-2" style="font-size:12px;"></span>
        </div>
        <div class="table-container">
          <table class="data-dense" id="inv-table">
            <thead><tr>
              <th>رقم الفاتورة</th><th>التاريخ</th><th>العميل</th>
              <th>المندوب</th><th>المخزن</th><th>الصافي</th>
              <th>VAT</th><th>الإجمالي</th><th>الحالة</th><th>ZATCA</th><th>قيد</th><th></th>
            </tr></thead>
            <tbody id="inv-tbody">
              ${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(11).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        <div style="padding:12px 16px;border-top:1px solid var(--border-soft);display:flex;justify-content:flex-end;gap:8px;">
          <button class="btn btn-sm btn-secondary" id="inv-prev" onclick="invPage('prev')" disabled>السابق</button>
          <span class="text-2 mono" style="font-size:12px;" id="inv-page-info"></span>
          <button class="btn btn-sm btn-secondary" id="inv-next" onclick="invPage('next')">التالي</button>
        </div>
      </div>
    </div>

    <!-- New/Edit Invoice Modal (True Fullscreen Cockpit - Identical Ergonomics to Purchase Invoices) -->
    <div class="modal-overlay" id="new-invoice-modal" onclick="if(event.target===this)closeModal('new-invoice-modal')">
      <style>
        #new-invoice-modal {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          padding: 0 !important;
          margin: 0 !important;
          background: rgba(15, 23, 42, 0.85) !important;
          z-index: 9999 !important;
          display: flex !important;
          align-items: stretch !important;
          justify-content: stretch !important;
        }
        #new-invoice-modal .modal-xl {
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          border-radius: 0 !important;
          margin: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
          border: none !important;
          background: #f8fafc !important;
        }
        #new-invoice-modal .form-control {
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          background: #ffffff;
          color: #0f172a;
          box-sizing: border-box;
        }
        #new-invoice-modal .no-spin::-webkit-outer-spin-button,
        #new-invoice-modal .no-spin::-webkit-inner-spin-button {
          -webkit-appearance: none !important;
          margin: 0 !important;
        }
        #new-invoice-modal .no-spin {
          -moz-appearance: textfield !important;
        }
        #new-invoice-modal input:focus, #new-invoice-modal select:focus {
          outline: 2px solid #2563eb !important;
          outline-offset: -1px !important;
          background-color: #eff6ff !important;
        }
        #invoice-lines-tbody tr:hover {
          background-color: #f1f5f9 !important;
        }
        .sale-hud-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 6px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          font-size: 11.5px;
          font-weight: 700;
          color: #334155;
          white-space: nowrap;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        .sale-hud-pill b {
          font-family: monospace;
          font-size: 12.5px;
          font-weight: 800;
        }
      </style>
      <div class="modal modal-xl">
        
        <!-- Header (Crisp Light Theme 44px) -->
        <div class="modal-header" style="height:44px; padding:6px 18px; border-bottom:1.5px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; background:#ffffff; color:#0f172a; flex-shrink:0; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:20px;">📄</span>
            <h3 class="modal-title" id="invoice-modal-title" style="margin:0; font-size:15px; font-weight:900; color:#0f172a;">
              فاتورة مبيعات جديدة
            </h3>
            <span class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:800; font-size:10.5px; padding:2px 7px; border:1px solid #c7d2fe;">
              ⛶ شاشة كاملة
            </span>
          </div>

          <div style="display:flex; align-items:center; gap:8px;">
            <select id="inv-type" class="form-control font-bold" style="height:30px; font-size:11.5px; padding:2px 8px;" title="نوع الفاتورة">
              <option value="standard">فاتورة ضريبية (B2B)</option>
              <option value="simplified">فاتورة مبسطة (B2C)</option>
            </select>
            <button class="modal-close" onclick="closeModal('new-invoice-modal')" style="color:#64748b; font-size:24px; line-height:1; padding:0 6px; background:transparent; border:none; cursor:pointer; font-weight:700;">×</button>
          </div>
        </div>

        <!-- Body (Flex 1, No outer scroll, pure ergonomics like purchase invoices) -->
        <div class="modal-body" style="padding:8px 12px; overflow:hidden; flex:1 1 0%; min-height:0; display:flex; flex-direction:column; gap:6px; background:#f1f5f9;">

          <!-- Section 1: Compact Ergonomic Meta Bar (Single Row ~40px) -->
          <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:6px 10px; box-shadow:0 1px 3px rgba(0,0,0,0.04); flex-shrink:0;">
            <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
              
              <div style="width:115px;">
                <input type="text" id="inv-number" class="form-control mono font-bold" readonly
                  style="background:#f8fafc; color:#4338ca; font-size:11.5px; height:30px; padding:2px 6px; text-align:center;" placeholder="رقم الفاتورة" title="رقم الفاتورة بالنظام" />
              </div>

              <div style="width:125px;">
                <input type="date" id="inv-date" class="form-control mono font-bold" value="${ht()}"
                  style="height:30px; padding:2px 6px; font-size:11.5px; text-align:center;" title="تاريخ الفاتورة *" />
              </div>

              <div style="flex:2; min-width:220px; position:relative;">
                <div class="autocomplete-container" id="customer-ac-wrap">
                  <input type="text" id="customer-search" class="form-control font-bold"
                    placeholder="👤 ابحث باسم العميل أو اختر العميل... *" autocomplete="off"
                    style="height:30px; padding:2px 10px; font-size:12px; border-color:#2563eb; background:#fff;" />
                  <div class="autocomplete-results hidden" id="customer-results" style="z-index:99999; max-height:260px; box-shadow:0 8px 24px rgba(0,0,0,0.18);"></div>
                  <input type="hidden" id="customer-id" />
                </div>
              </div>

              <div style="width:130px;">
                <select id="inv-warehouse" class="form-control font-bold" style="height:30px; padding:2px 6px; font-size:11.5px;" title="المخزن المستخرج منه" onchange="window.resolveAllLineBatches(); renderInvoiceLines(); window.autoSelectCostCenter && window.autoSelectCostCenter();">
                  <option value="">المخزن *</option>
                </select>
              </div>

              <div style="width:130px;">
                <select id="inv-rep" class="form-control font-bold" style="height:30px; padding:2px 6px; font-size:11.5px;" title="المندوب (اختياري)" onchange="window.autoSelectCostCenter && window.autoSelectCostCenter()">
                  <option value="">بيع مباشر (بدون مندوب)</option>
                </select>
              </div>

              <div style="width:115px;">
                <select id="inv-payment" class="form-control font-bold" style="height:30px; padding:2px 6px; font-size:11.5px;" title="طريقة الدفع" onchange="updateInvoiceTotals()">
                  <option value="credit">آجل (سداد لاحق)</option>
                  <option value="cash">نقدي (خزينة)</option>
                  <option value="transfer">تحويل بنكي</option>
                  <option value="check">شيك مصرفي</option>
                </select>
              </div>

              <div style="width:105px;">
                <input type="number" id="inv-paid-amount" class="form-control mono font-bold no-spin" step="0.01" min="0" placeholder="0.00" style="height:30px; padding:2px 6px; font-size:11.5px; text-align:center;" title="المبلغ المدفوع (ر.س)" />
              </div>

              <button type="button" class="btn btn-secondary btn-sm" onclick="window.toggleSaleExtraDetails()" style="height:30px; font-size:11px; padding:0 8px; font-weight:700;" title="إظهار مركز التكلفة، الملاحظات، والمرفقات">
                ⚙️ تفاصيل إضافية
              </button>

            </div>

            <!-- Secondary Extra Details Drawer -->
            <div id="sale-extra-details-drawer" style="display:none; margin-top:6px; padding-top:6px; border-top:1px dashed #cbd5e1; gap:10px; align-items:center; flex-wrap:wrap;">
              <div style="display:flex; align-items:center; gap:6px;">
                <label style="font-size:11px; font-weight:700; color:#475569; white-space:nowrap;">🏷️ مركز التكلفة:</label>
                <select id="inv-cost-center" class="form-control" style="height:28px; padding:2px 6px; font-size:11px; width:150px;">
                  <option value="">بدون مركز تكلفة</option>
                </select>
              </div>
              <div style="display:flex; align-items:center; gap:6px; flex:1; min-width:220px;">
                <label style="font-size:11px; font-weight:700; color:#475569; white-space:nowrap;">ملاحظات:</label>
                <input type="text" id="inv-notes" class="form-control" placeholder="ملاحظات اختيارية على الفاتورة..." style="height:28px; padding:2px 8px; font-size:11px; flex:1;" />
              </div>
              <div style="display:flex; align-items:center; gap:6px; min-width:220px;">
                <label style="font-size:11px; font-weight:700; color:#475569; white-space:nowrap;">📁 إرفاق مستند:</label>
                <input type="file" id="inv-file-upload" class="form-control" accept="image/*,application/pdf" style="height:28px; padding:1px 4px; font-size:10.5px;" />
              </div>
            </div>

            <!-- Customer Alerts (Donation / Broker / Credit) -->
            <div id="donation-badge" class="alert info hidden" style="margin-top:6px; padding:4px 10px; font-size:11px; font-weight:bold;"></div>
            <div id="inv-broker-alert" style="display:none; margin-top:6px; padding:4px 10px; font-size:11.5px; font-weight:800; border-left:3px solid #0284c7; background:rgba(2,132,199,0.08); color:#0369a1; border-radius:6px;"></div>
            <div id="credit-status-bar" class="hidden" style="margin-top:6px;">
              <div class="credit-meter">
                <div class="meter-label">
                  <span id="credit-label">الرصيد المتاح</span>
                  <span id="credit-numbers" class="mono"></span>
                </div>
                <div class="progress-bar">
                  <div class="fill" id="credit-fill" style="width:0%;"></div>
                </div>
              </div>
            </div>
            <div id="inv-aging-alert" class="hidden" style="margin-top:6px; padding:6px 12px; font-size:11.5px; font-weight:800; border-radius:8px;"></div>

          </div>

          <!-- Section 2: Search & Smart Action Toolbar (Directly Above Table, exactly like Purchase Invoices) -->
          <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:4px 8px; box-shadow:0 1px 3px rgba(0,0,0,0.04); flex-shrink:0; display:flex; gap:8px; align-items:center; justify-content:space-between; flex-wrap:wrap;">
            <div style="display:flex; gap:6px; flex:1; min-width:320px; align-items:center;">
              <select id="inv-product-category-filter" class="form-control" style="width:130px; height:32px; font-size:11.5px; padding:2px 6px;">
                <option value="">كل الفئات</option>
              </select>
              <div class="autocomplete-container" style="flex:1; position:relative;">
                <input type="text" id="product-search-input" class="form-control"
                  placeholder="🔍 ابحث باسم الصنف أو امسح الباركود لإضافة الصنف فوراً... [F8 للبحث المتقدم]" autocomplete="off"
                  style="height:32px; font-size:12.5px; font-weight:700; padding:2px 10px; background:#fff; border-color:#2563eb;" />
                <div class="autocomplete-results hidden" id="product-search-results" style="z-index:99999; max-height:280px; box-shadow:0 10px 30px rgba(0,0,0,0.18);"></div>
              </div>
              <span class="badge" id="inv-items-badge" style="font-size:11px; background:#e0e7ff; color:#3730a3; font-weight:800; padding:4px 8px; white-space:nowrap;">0 صنف</span>
              <button type="button" class="btn sm" onclick="window.refreshInvoiceCostsFromCatalog()" style="height:30px; font-size:11px; padding:2px 8px; white-space:nowrap; background:#f0f9ff; border:1px solid #bae6fd; color:#0369a1; font-weight:700; border-radius:6px; cursor:pointer;" title="تحديث تكاليف البنود في الفاتورة وفق أحدث أسعار وتكاليف المخزون الحالية">
                🔄 تحديث التكاليف من المخزن
              </button>
            </div>
          </div>

          <!-- Section 3: THE MAIN ITEMS TABLE (Maximized Screen Real Estate) -->
          <div class="table-container" style="border:1.5px solid #cbd5e1; border-radius:8px; flex:1 1 0%; min-height:0; overflow-y:auto; overflow-x:auto; background:#fff; box-shadow:inset 0 1px 3px rgba(0,0,0,0.04);">
            <table class="data-dense" style="margin:0; font-size:12px; width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:#f8fafc; color:#1e293b; position:sticky; top:0; z-index:10; border-bottom:2px solid #cbd5e1; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                  <th style="width:30px; text-align:center; padding:8px 4px; color:#475569; font-weight:800;">#</th>
                  <th style="padding:8px 8px; text-align:right; color:#0f172a; font-weight:900; min-width:240px;">الصنف</th>
                  <th style="width:105px; padding:8px 4px; text-align:center; color:#334155; font-weight:800;">الوحدة</th>
                  <th style="width:85px; text-align:center; padding:8px 4px; color:#0284c7; font-weight:900;">الكمية</th>
                  <th style="width:95px; text-align:left; padding:8px 4px; color:#334155; font-weight:800;">سعر الوحدة</th>
                  <th style="width:110px; text-align:center; padding:8px 4px; color:#dc2626; font-weight:900;">الخصم ✂️</th>
                  <th style="width:95px; text-align:center; padding:8px 4px; color:#0369a1; background:#f0f9ff; font-weight:800;" title="متوسط التكلفة المرجح للصنف (WAC)">متوسط التكلفة ⚖️</th>
                  <th style="width:85px; text-align:center; padding:8px 4px; color:#047857; background:#ecfdf5; font-weight:900;" title="نسبة هامش الربح للسطر وفق المتوسط المرجح">هامش الربح % 📈</th>
                  <th style="width:110px; padding:8px 4px; color:#334155; font-weight:800;">التشغيلة</th>
                  <th style="width:100px; padding:8px 4px; color:#334155; font-weight:800;">الانتهاء</th>
                  <th style="width:65px; text-align:center; padding:8px 4px; color:#334155; font-weight:800;">VAT</th>
                  <th style="width:110px; text-align:left; padding:8px 8px; color:#1e40af; font-weight:900;">الإجمالي</th>
                  <th style="width:36px; padding:8px 2px; text-align:center;"></th>
                </tr>
              </thead>
              <tbody id="invoice-lines-tbody"></tbody>
            </table>
          </div>

          <div id="inv-form-error" class="alert bad hidden" style="margin:0; padding:6px 10px; font-size:11.5px;"></div>

        </div>

        <!-- Section 4: FIXED BOTTOM HUD BAR (Crisp High-Contrast Light Theme) -->
        <div class="modal-footer" style="height:54px; padding:0 16px; background:#ffffff; border-top:2px solid #cbd5e1; display:flex; justify-content:space-between; align-items:center; flex-shrink:0; box-shadow:0 -2px 10px rgba(0,0,0,0.04);">
          
          <!-- Live Totals Strip -->
          <div style="display:flex; align-items:center; gap:8px; overflow-x:auto; flex:1; margin-left:12px;">
            
            <div class="sale-hud-pill">
              <span style="color:#64748b;">المجموع الفرعي:</span>
              <b id="total-subtotal" style="color:#0f172a;">0.00 ر.س</b>
            </div>

            <div class="sale-hud-pill" style="display:inline-flex; align-items:center; gap:4px; background:#fff1f2; border:1px solid #fecdd3; padding:2px 8px; border-radius:6px;" title="خصم إضافي على إجمالي الفاتورة (مبلغ أو نسبة)">
              <span style="color:#dc2626; font-weight:800; font-size:11px; white-space:nowrap;">خصم إضافي:</span>
              <input type="number" id="inv-global-discount-val" class="mono font-bold no-spin" step="0.01" min="0" value="0" placeholder="0" style="width:55px; height:24px; padding:1px 4px; font-size:11.5px; text-align:center; border:1px solid #fda4af; border-radius:4px; background:#ffffff; color:#be123c;" oninput="window.onGlobalDiscountChanged()" title="أدخل قيمة الخصم الإضافي" />
              <select id="inv-global-discount-type" style="height:24px; padding:0 2px; font-size:11px; font-weight:bold; border:1px solid #fda4af; border-radius:4px; background:#ffffff; color:#be123c; cursor:pointer;" onchange="window.onGlobalDiscountChanged()" title="نوع الخصم: مبلغ (ر.س) أو نسبة مئوية (%)">
                <option value="amount">ر.س</option>
                <option value="percent">%</option>
              </select>
              <b id="total-discount" style="color:#dc2626; font-size:11.5px; margin-right:4px; white-space:nowrap;">- 0.00 ر.س</b>
            </div>

            <div class="sale-hud-pill">
              <span style="color:#d97706;">الضريبة (15%):</span>
              <b id="total-vat" style="color:#d97706;">0.00 ر.س</b>
            </div>

            <div class="sale-hud-pill" title="تكلفة البضاعة المباعة وفق المتوسط المرجح">
              <span style="color:#64748b;">التكلفة (WAC):</span>
              <b id="inv-hud-cost" style="color:#64748b;">0.00 ر.س</b>
            </div>

            <div class="sale-hud-pill" title="صافي ربح الفاتورة التقديري">
              <span style="color:#16a34a;">الربح التقديري:</span>
              <b id="total-profit" style="color:#16a34a;">0.00 ر.س</b>
            </div>

            <div class="sale-hud-pill" id="inv-hud-margin-pill" style="background:#ecfdf5; border-color:#6ee7b7;" title="نسبة هامش الربح للفاتورة">
              <span style="color:#065f46;">🎯 هامش الربح:</span>
              <b id="total-margin" style="color:#059669; font-size:12.5px;">0.0%</b>
            </div>

            <!-- Pinned Grand Total -->
            <div style="display:inline-flex; align-items:center; gap:8px; padding:5px 16px; background:linear-gradient(135deg, #1e40af, #2563eb); border-radius:8px; border:1px solid #1d4ed8; box-shadow:0 2px 6px rgba(37,99,235,0.25);">
              <span style="font-size:12.5px; font-weight:800; color:#dbeafe;">المستحق:</span>
              <span class="mono" style="font-size:18px; font-weight:900; color:#ffffff;" id="total-grand">0.00 ر.س</span>
            </div>

          </div>

          <!-- Action Buttons -->
          <div style="display:flex; gap:6px; align-items:center; flex-shrink:0;">
            <button class="btn btn-ghost sm" onclick="closeModal('new-invoice-modal')" style="color:#64748b; height:34px; font-size:12px; font-weight:700;">إلغاء</button>
            <button class="btn btn-secondary sm" onclick="saveInvoice('draft')" style="height:34px; font-size:12px; padding:0 12px; background:#f8fafc; border:1.5px solid #cbd5e1; color:#0f172a; font-weight:800;">حفظ مسودة</button>
            <button class="btn btn-primary" onclick="saveInvoice('pending')" id="save-inv-btn" style="height:36px; padding:0 20px; font-weight:900; font-size:13px; background:linear-gradient(135deg,#2563eb,#1d4ed8); box-shadow:0 2px 6px rgba(37,99,235,0.3);">
              💾 حفظ وإصدار الفاتورة
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- View Invoice Modal -->
    <div class="modal-overlay" id="view-invoice-modal">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 class="modal-title" id="view-inv-title">تفاصيل الفاتورة</h3>
          <button class="modal-close" onclick="closeModal('view-invoice-modal')">×</button>
        </div>
        <div class="modal-body" id="view-inv-body"></div>
         <div class="modal-footer" id="view-inv-footer"></div>
      </div>
    </div>`}let Kt=null,Lt=0,jt=new Map,kt=null,dt=null,J=null;window.loadInvoicesList=async()=>{Kt=null,Lt=0,await re()};window.invPage=async e=>{e==="next"&&Kt&&(Lt++,await re()),e==="prev"&&Lt>0&&(Lt--,Kt=null,await re())};async function re(){const e=document.getElementById("inv-tbody");if(e){e.innerHTML=`${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(11).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;try{const t=document.getElementById("inv-from")?.value,o=document.getElementById("inv-to")?.value,a=(document.getElementById("inv-text-filter")?.value||"").trim().toLowerCase(),i=(document.getElementById("inv-customer-search-input")?.value||"").trim().toLowerCase(),n=document.getElementById("inv-customer-filter")?.value;let s=H.salesInvoices();const p=[];t&&p.push(W("date",">=",t)),o&&p.push(W("date","<=",o));const l=[...p,bt("date","desc")];!t&&!o&&!n&&!i&&!a?l.push(Dt(100)):l.push(Dt(500));let c=await nt(H.salesInvoices(),l);c.forEach(r=>jt.set(r.id,r));const u=document.getElementById("inv-status-filter")?.value;if(u&&(c=c.filter(r=>r.status===u)),a&&(c=c.filter(r=>{const x=(J&&J.find(g=>g.id===r.customerId)?.name||r.customerName||"").toLowerCase(),L=(r.number||r.invoiceNumber||r.id||"").toLowerCase(),V=(r.repName||"").toLowerCase(),ot=(r.customerPhone||"").toLowerCase(),at=(r.notes||"").toLowerCase();return x.includes(a)||L.includes(a)||V.includes(a)||ot.includes(a)||at.includes(a)})),n){const r=(J?.find(x=>x.id===n)?.name||"").toLowerCase();c=c.filter(x=>x.customerId===n||r&&(x.customerName||"").toLowerCase()===r)}else i&&(c=c.filter(r=>(J&&J.find(L=>L.id===r.customerId)?.name||r.customerName||"").toLowerCase().includes(i)));const m=document.getElementById("inv-rep-filter")?.value,E=m?kt?.find(r=>r.id===m)?.name:null;m&&(c=c.filter(r=>r.repId===m||E&&r.repName===E));const w=document.getElementById("inv-warehouse-filter")?.value;w&&(c=c.filter(r=>r.warehouseId===w||r.sourceWarehouseId===w)),c.sort((r,x)=>{const L=r.date||"",V=x.date||"";if(L!==V)return V.localeCompare(L);const ot=r.number||r.invoiceNumber||r.id||"";return(x.number||x.invoiceNumber||x.id||"").localeCompare(ot)});const C=!1;Kt=null;const y=c.filter(r=>r.status!=="cancelled"),B=y.reduce((r,x)=>r+(x.totalWithVat||x.grandTotal||x.total||0),0);let $=0;try{const r=document.getElementById("inv-from")?.value,x=document.getElementById("inv-to")?.value;let L=H.receipts();const V=[];r&&V.push(W("date",">=",r)),x&&V.push(W("date","<=",x));const ot=[...V,bt("date","desc")];!r&&!x&&!n?ot.push(Dt(100)):ot.push(Dt(300)),$=(await nt(H.receipts(),ot)).filter(d=>{const T=d.date||(d.createdAt?.toDate?d.createdAt.toDate().toISOString().slice(0,10):"");if(!((!r||T>=r)&&(!x||T<=x))||n&&d.customerId!==n&&d.targetId!==n)return!1;if(m){const A=d.repId===m,U=E&&(d.repName===E||d.salesRepName===E),X=y.some(tt=>tt.customerId===d.customerId||tt.customerId===d.targetId||tt.customerName===d.customerName||tt.customerName===d.targetName);if(!A&&!U&&!X)return!1}return!0}).reduce((d,T)=>d+parseFloat(T.amount||0),0)}catch{$=y.reduce((x,L)=>x+parseFloat(L.amountPaid||L.paidAmount||0),0)}const h=Math.max(0,B-$),N=c.filter(r=>r.zatcaStatus==="reported").length;if(document.getElementById("kpi-total").textContent=_(B),document.getElementById("kpi-paid").textContent=_($),document.getElementById("kpi-unpaid").textContent=_(h),document.getElementById("kpi-zatca").textContent=`${N} / ${c.length}`,document.getElementById("inv-count-label").textContent=`${c.length} فاتورة`,c.length===0){const r=t||o,x=a||i||n;e.innerHTML=`<tr><td colspan="12" style="text-align:center;padding:36px;color:var(--text-2);">
        <div style="font-size:15px;font-weight:700;margin-bottom:6px;">لا توجد فواتير تطابق شروط البحث والتصفية</div>
        ${r&&x?`
          <div style="margin-top:10px;">
            <button class="btn btn-sm btn-secondary" onclick="window.invFilterRange('all')" style="border:1.5px solid var(--brand);color:var(--brand);font-weight:700;">
              📅 البحث في جميع الفترات والتواريخ
            </button>
          </div>`:""}
      </td></tr>`}else e.innerHTML=c.map(r=>`
        <tr style="cursor:pointer;" onclick="viewInvoice('${r.id}')">
          <td class="mono text-indigo">${r.number||r.invoiceNumber||r.id.slice(0,8)}</td>
          <td class="dim">${me(r.date)}</td>
          <td class="font-semibold">${J&&J.find(x=>x.id===r.customerId)?.name||r.customerName||"—"}</td>
          <td class="dim">${r.repName||"—"}</td>
          <td class="dim" style="font-size:11px;">${r.warehouseName||dt&&dt.find(x=>x.id===r.warehouseId)?.name||"—"}</td>
          <td class="mono font-bold">${_(r.subtotal)}</td>
          <td class="mono text-warn">${_(r.totalVat||r.vatAmount||0)}</td>
          <td class="mono">${_(r.totalWithVat||r.total||0)}</td>
          <td>${fe(r.status)}</td>
          <td>${r.zatcaStatus==="reported"?'<span class="zatca-stamp reported">✓ مُرسلة</span>':'<span class="zatca-stamp pending">معلقة</span>'}</td>
          <td style="font-size:11px;">${r.journalEntryId?'<span class="badge good" style="font-size:10px;">✓ مُرحَّل</span>':'<span class="badge" style="font-size:10px; background:var(--bg-3); color:var(--text-2);">—</span>'}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-icon sm btn-ghost" onclick="event.stopPropagation();viewInvoice('${r.id}')" title="عرض">👁️</button>
              ${r.status!=="cancelled"?`<button class="btn btn-icon sm btn-ghost" onclick="event.stopPropagation();editInvoice('${r.id}')" title="تعديل">✏️</button>`:""}
              ${r.status!=="cancelled"?`<button class="btn btn-icon sm btn-ghost" onclick="event.stopPropagation();cancelInvoice('${r.id}')" title="إلغاء" style="color:var(--bad);">🚫</button>`:""}
              <button class="btn btn-icon sm btn-ghost text-bad" onclick="event.stopPropagation();deleteInvoice('${r.id}','${r.number}')" title="حذف">🗑️</button>
            </div>
          </td>
        </tr>`).join("");document.getElementById("inv-next")?.toggleAttribute("disabled",!C),document.getElementById("inv-prev")?.toggleAttribute("disabled",Lt===0),document.getElementById("inv-page-info").textContent=`صفحة ${Lt+1}`}catch(t){console.error(t),e.innerHTML=`<tr><td colspan="12"><div class="alert bad" style="margin:8px;">${t.message}</div></td></tr>`}}}window.clearInvoiceCustomerFilter=()=>{const e=document.getElementById("inv-customer-search-input");e&&(e.value="");const t=document.getElementById("inv-customer-filter");t&&(t.value="");const o=document.getElementById("inv-customer-clear-btn");o&&(o.style.display="none"),loadInvoicesList()};window.onCustomerSelectChange=()=>{const e=document.getElementById("inv-customer-filter"),t=document.getElementById("inv-customer-search-input"),o=document.getElementById("inv-customer-clear-btn");if(e&&t){const a=e.options[e.selectedIndex];e.value?(t.value=a?a.text:"",o&&(o.style.display="block")):(t.value="",o&&(o.style.display="none"))}loadInvoicesList()};window.invFilterRange=e=>{const t=ht();e==="today"?(document.getElementById("inv-from").value=t,document.getElementById("inv-to").value=t):e==="month"?(document.getElementById("inv-from").value=new Date(new Date().setDate(1)).toISOString().split("T")[0],document.getElementById("inv-to").value=t):e==="all"&&(document.getElementById("inv-from").value="",document.getElementById("inv-to").value=""),document.querySelectorAll(".quick-filter-btn").forEach(a=>a.classList.remove("active"));const o=document.getElementById(`qf-${e}`);o&&o.classList.add("active"),loadInvoicesList()};window.openNewInvoice=()=>{I=[],b=null,window._editingInvoiceId=null,window._editingInvoiceVersion=null,window._editingOldInvoice=null,window._editingOldLines=null;const e=document.getElementById("save-inv-btn");e&&(e.textContent="💾 حفظ وإصدار الفاتورة"),document.getElementById("inv-number").value="جارٍ التوليد…",document.getElementById("customer-search").value="",document.getElementById("customer-id").value="",document.getElementById("inv-date").value=ht(),document.getElementById("inv-payment").value="credit",document.getElementById("inv-paid-amount").value="",document.getElementById("inv-notes").value="",document.getElementById("credit-status-bar").classList.add("hidden"),document.getElementById("inv-aging-alert")?.classList.add("hidden"),document.getElementById("donation-badge")?.classList.add("hidden"),document.getElementById("inv-form-error").classList.add("hidden");const t=document.getElementById("inv-global-discount-val"),o=document.getElementById("inv-global-discount-type");t&&(t.value="0"),o&&(o.value="amount"),Y(),pt(),Xt(),te(),openModal("new-invoice-modal"),Yt(),de(),ee(),ge("INV").then(a=>{const i=document.getElementById("inv-number");i&&(i.value=a)}).catch(()=>{})};async function Yt(){const e=document.getElementById("inv-rep");if(e){if(kt){e.innerHTML='<option value="">بيع مباشر (بدون مندوب)</option>'+kt.map(t=>`<option value="${t.id}" data-name="${t.name}">${t.name}</option>`).join("");return}try{kt=await nt(H.salesReps(),[bt("name")]),e.innerHTML='<option value="">بيع مباشر (بدون مندوب)</option>'+kt.map(t=>`<option value="${t.id}" data-name="${t.name}">${t.name}</option>`).join("")}catch{}}}async function de(){const e=document.getElementById("inv-warehouse");if(!e)return;const t=()=>{e.innerHTML='<option value="">اختر المخزن</option>'+dt.map(o=>`<option value="${o.id}" data-name="${o.name}">${o.name}</option>`).join(""),!e.value&&dt.length>0&&(e.value=dt[0].id),Y()};if(e._whChangeListenerAttached||(e.addEventListener("change",()=>Y()),e._whChangeListenerAttached=!0),dt){t();return}try{dt=await nt(H.warehouses(),[bt("name")]),t()}catch{}}let se=null;async function Ce(){const e=document.getElementById("inv-cost-center");if(e)try{se||(se=(await nt(H.costCenters()).catch(()=>[])).sort((o,a)=>(o.code||"").localeCompare(a.code||""))),e.innerHTML='<option value="">بدون مركز تكلفة</option>'+se.map(t=>`<option value="${t.id}" data-name="${t.name}">${t.code||""} — ${t.name}</option>`).join("")}catch(t){console.warn("Failed to load cost centers dropdown:",t)}}window.autoSelectCostCenter=()=>{const e=document.getElementById("inv-cost-center");if(!e)return;const t=document.getElementById("inv-warehouse")?.value,o=document.getElementById("inv-rep")?.value;if(t&&dt){const a=dt.find(i=>i.id===t);if(a&&(a.costCenterId||a.costCenter)){e.value=a.costCenterId||a.costCenter;return}}if(o&&kt){const a=kt.find(i=>i.id===o);if(a&&a.assignedWarehouseId&&dt){const i=dt.find(n=>n.id===a.assignedWarehouseId);i&&(i.costCenterId||i.costCenter)&&(e.value=i.costCenterId||i.costCenter)}}id&&I.length>0&&Be(id)};function Xt(){const e=document.getElementById("customer-search"),t=document.getElementById("customer-results");e&&(e.addEventListener("input",be(async()=>{const o=e.value.trim().toLowerCase();if(!o){t.classList.add("hidden");return}try{(!J||J.length===0)&&(J=await nt(H.customers(),[bt("name")]));const a=J.filter(i=>(i.name||"").toLowerCase().includes(o)||(i.phone||"").includes(o)).slice(0,15);if(a.length===0){t.classList.add("hidden");return}t.innerHTML=a.map(i=>`
        <div class="autocomplete-item" onclick="selectCustomer('${i.id}','${i.name.replace(/'/g,"\\'")}',${i.creditLimit||0},${i.balance||0})">
          <div>${i.name}</div>
          <div class="item-code">${i.phone||""} | حد: ${_(i.creditLimit||0)}</div>
        </div>`).join(""),t.classList.remove("hidden")}catch(a){console.warn("setupCustomerAutocomplete error:",a)}},100)),document.addEventListener("click",o=>{e.contains(o.target)||t.classList.add("hidden")}))}const Jt={};async function $e(e){if(!e)return[];if(Jt[e])return Jt[e];try{const t=lt(H.salesInvoices(),W("customerId","==",e),bt("date","desc"),Dt(40)),a=(await vt(t)).docs.map(i=>({id:i.id,...i.data()}));return Jt[e]=a,a}catch{try{const o=lt(H.salesInvoices(),W("customerId","==",e),Dt(50)),i=(await vt(o)).docs.map(n=>({id:n.id,...n.data()}));return i.sort((n,s)=>String(s.date||"").localeCompare(String(n.date||""))),Jt[e]=i,i}catch(o){return console.warn("Could not fetch customer invoices for price history:",o),[]}}}function Ee(e,t,o=null){if(!e||!e.length||!t)return null;for(const a of e){if(a.status==="cancelled"||a.status==="draft")continue;const n=(a.lines||a.items||[]).find(s=>(s.productId===t||s.id===t)&&o&&(s.selectedUnit===o||s.unit===o));if(n&&n.unitPrice!==void 0)return{price:parseFloat(n.unitPrice)||0,invoiceNumber:a.number||a.invoiceNumber||a.id,date:a.date||"",unit:n.selectedUnit||n.unit||o,qty:n.qty||1}}for(const a of e){if(a.status==="cancelled"||a.status==="draft")continue;const n=(a.lines||a.items||[]).find(s=>s.productId===t||s.id===t);if(n&&n.unitPrice!==void 0)return{price:parseFloat(n.unitPrice)||0,invoiceNumber:a.number||a.invoiceNumber||a.id,date:a.date||"",unit:n.selectedUnit||n.unit||"",qty:n.qty||1}}return null}async function ke(e,t,o,a){if(!o)return;const i=I[e];if(i&&t){const n=await $e(t),s=Ee(n,o,a);i&&i.productId===o&&(s?(i.lastCustomerPrice=s.price,i.lastCustomerInvoiceNumber=s.invoiceNumber,i.lastCustomerInvoiceDate=s.date,i.lastCustomerUnit=s.unit,i.isFirstTimeForCustomer=!1):(i.lastCustomerPrice=null,i.isFirstTimeForCustomer=!0),Y())}}async function Be(e){if(!e||I.length===0)return;const t=await $e(e);for(let o=0;o<I.length;o++){const a=I[o];if(a&&a.productId){const i=Ee(t,a.productId,a.selectedUnit||a.unit);i?(a.lastCustomerPrice=i.price,a.lastCustomerInvoiceNumber=i.invoiceNumber,a.lastCustomerInvoiceDate=i.date,a.lastCustomerUnit=i.unit,a.isFirstTimeForCustomer=!1):(a.lastCustomerPrice=null,a.isFirstTimeForCustomer=!0)}}Y()}window.applyLastCustomerPrice=e=>{const t=I[e];if(!t||t.lastCustomerPrice===void 0||t.lastCustomerPrice===null)return;const o=parseFloat(t.lastCustomerPrice)||0;if(b?.hasBrokerCommission&&b?.brokerRate>0){const a=parseFloat(b.brokerRate)||1;t.basePrice=o,t.unitPrice=parseFloat((o*(1+a/100)).toFixed(2)),t.brokerCommissionPerUnit=parseFloat((t.unitPrice-t.basePrice).toFixed(2)),t.brokerCommissionTotal=parseFloat((t.brokerCommissionPerUnit*(parseFloat(t.qty)||0)).toFixed(2))}else t.unitPrice=o,t.basePrice=o;Y(),pt(),window.showToast&&window.showToast("✅ تم تطبيق آخر سعر بيع للعميل ("+_(o)+") على صنف: "+t.productName,"success",2500)};window.selectCustomer=(e,t,o,a)=>{b={id:e,name:t,creditLimit:o,balance:a},document.getElementById("customer-search").value=t,document.getElementById("customer-id").value=e,document.getElementById("customer-results").classList.add("hidden");const i=(J||[]).find(l=>l.id===e),n=document.getElementById("inv-broker-alert");i?.hasBrokerCommission&&parseFloat(i?.brokerRate)>0?(b.hasBrokerCommission=!0,b.brokerName=i.brokerName||"زياد",b.brokerRate=parseFloat(i.brokerRate)||1,b.brokerTrigger=i.brokerTrigger||"on_payment",b.brokerAccountCode=i.brokerAccountCode||"2-1-4-2",b.brokerExpenseCode=i.brokerExpenseCode||"5-4-10",n&&(n.style.display="block",n.innerHTML=`💼 <strong>عميل مرتبط بعمولة وسيط (${b.brokerName}):</strong> يتم إضافة نسبة (+${b.brokerRate}%) آلياً على أي سعر أساسي تدخله قبل الضريبة (الاستحقاق: عند سداد الفاتورة).`)):(b.hasBrokerCommission=!1,n&&(n.style.display="none"));const s=document.getElementById("donation-badge");if(e==="005"||t.includes("سلة البركة"))s&&(s.textContent="🎁 عميل تبرعات (معفى من الضريبة وتكلفتها مصروف تبرعات)",s.classList.remove("hidden")),document.getElementById("credit-status-bar")?.classList.add("hidden"),document.getElementById("inv-aging-alert")?.classList.add("hidden");else{if(s&&s.classList.add("hidden"),o>0){const c=Math.min(a/o*100,100),u=document.getElementById("credit-status-bar"),m=document.getElementById("credit-fill"),E=document.getElementById("credit-numbers"),w=document.getElementById("credit-label");u.classList.remove("hidden"),m.style.width=c+"%",E.textContent=`${_(a)} / ${_(o)}`,c>=100?(m.className="fill bad",w.textContent="⚠️ تجاوز حد الائتمان"):c>=80?(m.className="fill warn",w.textContent="⚠️ قارب حد الائتمان"):(m.className="fill good",w.textContent="الرصيد المستخدم")}else document.getElementById("credit-status-bar")?.classList.add("hidden"),document.getElementById("inv-aging-alert")?.classList.add("hidden");const l=document.getElementById("inv-aging-alert");if(l)if(a>0){l.classList.remove("hidden");const c=i?.creditDays||0;c>0?(l.style.background="#fff7ed",l.style.border="1px solid #fed7aa",l.style.color="#c2410c",l.innerHTML=`⚠️ <b>تنبيه ائتماني:</b> العميل عليه مديونية سابقة بقيمة <b>${_(a)}</b> (مهلة السداد: ${c} يوماً). يرجى التأكد من التزام العميل قبل تسليم بضاعة جديدة.`):(l.style.background="#fef2f2",l.style.border="1px solid #fecaca",l.style.color="#b91c1c",l.innerHTML=`⚠️ <b>تنبيه مديونية:</b> العميل عليه مديونية قائمة بقيمة <b>${_(a)}</b> بدون مهلة ائتمانية (حساب فوري/نقدي).`)}else l.classList.remove("hidden"),l.style.background="#f0fdf4",l.style.border="1px solid #bbf7d0",l.style.color="#15803d",l.innerHTML="✅ <b>الوضع الائتماني:</b> رصيد العميل 0.00 ر.س (لا توجد مديونيات سابقة معلقة)."}e&&I.length>0&&Be(e)};function te(){const e=document.getElementById("product-search-input"),t=document.getElementById("product-search-results"),o=document.getElementById("inv-product-category-filter");if(!e)return;const a=()=>{const i=e.value.trim().toLowerCase(),n=o?o.value:"";if(!i&&!n){t.classList.add("hidden");return}let s=ft;if(n&&(s=s.filter(m=>m.category===n)),i&&(s=s.filter(m=>(m.name||"").toLowerCase().includes(i)||(m.sku||"").toLowerCase().includes(i)||(m.barcode||"").includes(i))),s=s.slice(0,15),!s.length){t.innerHTML='<div style="padding:10px;text-align:center;color:var(--text-2);font-size:12px;">لا توجد نتائج</div>',t.classList.remove("hidden");return}const p=document.getElementById("inv-warehouse")?.value,l=`companies/${M}/stockByWarehouse`,c=window.ERP_CACHE[l];let u=[];c&&(Array.isArray(c.data)?u=c.data:Array.isArray(c)&&(u=c)),t.innerHTML=s.map(m=>{const E=p?u.find(L=>L.productId===m.id&&L.warehouseId===p)?.qty||0:u.filter(L=>L.productId===m.id).reduce((L,V)=>L+(V.qty||0),0),w=E>0?"badge good":"badge bad",C=(m.name||"").replace(/'/g,"’"),y=(m.unit||"PCS").replace(/'/g,"’"),B=m.taxCategory||"S",$=m.salePrice||0,h=m.averageCost||m.costPrice||m.lastPurchasePrice||m.avgCostPrice||m.purchasePrice||0,N=(m.altUnit||"").replace(/'/g,"&#39;"),r=parseFloat(m.unitFactor)||1,x=$>0?(($-h)/$*100).toFixed(1):0;return`
        <div class="autocomplete-item" onclick="addProductLine('${m.id}','${C}',${$},'${y}','${B}',${h},'${N}',${r})">
          <div class="flex justify-between">
            <span style="font-weight:700;">${m.name}</span>
            <div>
              <span class="mono text-indigo font-bold" style="margin-left:12px;">${_(m.salePrice)}</span>
              <span class="${w}" style="font-size:10px;">المتاح: ${E}</span>
            </div>
          </div>
          <div class="item-code" style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
            <span>${m.sku||""} | ${rt(m.unit)||""}
              ${m.altUnit&&m.unitFactor>1?`<span style="color:#d97706;font-weight:700;"> 📦 ${m.unitFactor} ${rt(m.unit)} = 1 ${rt(m.altUnit)}</span>`:""}
            </span>
            <span style="font-size:10.5px; color:#475569;">
              متوسط التكلفة: <b style="color:#0f172a;">${_(h)}</b>
              <span class="badge ${x>=0?"good":"bad"}" style="font-size:9.5px; padding:1px 5px; margin-right:4px;">هامش: ${x}%</span>
            </span>
          </div>
        </div>`}).join(""),t.classList.remove("hidden")};e.addEventListener("input",be(a,200)),e.addEventListener("focus",a),o&&o.addEventListener("change",a),document.addEventListener("click",i=>{!e.contains(i.target)&&!t.contains(i.target)&&(!o||!o.contains(i.target))&&t.classList.add("hidden")})}async function ee(){try{const e=`companies/${M}/stockByWarehouse`,[t,o,a]=await Promise.all([ft.length===0?nt(H.products(),[bt("name")]):Promise.resolve(ft),Qt.length===0?nt(H.categories(),[bt("name")]):Promise.resolve(Qt),nt(H.stockByWarehouse())]);ft=t,Qt=o,window.ERP_CACHE[e]=a||[];const i=document.getElementById("inv-product-category-filter");i&&(i.innerHTML='<option value="">كل الفئات</option>'+Qt.map(n=>`<option value="${n.id}">${n.name}</option>`).join(""))}catch(e){console.error("loadProductsAndCategories error:",e)}}window.addProductLine=(e,t,o,a,i,n=0,s="",p=1)=>{document.getElementById("product-search-input").value="",document.getElementById("product-search-results").classList.add("hidden");const l=parseFloat(p)||1,c=!!(s&&l>1),u=parseFloat(o)||0,m=c?u:l>1?parseFloat((u/l).toFixed(4)):u,E=c?s:a;let w=m,C=m,y=0;if(b?.hasBrokerCommission&&b?.brokerRate>0){const h=parseFloat(b.brokerRate)||1;w=parseFloat((m*(1+h/100)).toFixed(2)),C=m,y=parseFloat((w-C).toFixed(2))}const B=I.findIndex(h=>h.productId===e&&(h.selectedUnit||h.unit)===E&&!h.isCustom&&!String(h.productId||"").startsWith("adhoc_"));if(B!==-1){const h=I[B];h.qty=(parseFloat(h.qty)||0)+1,Y(),pt(),window.resolveLineBatches(B),window.showToast&&window.showToast(`تمت زيادة كمية (${t}) إلى ${h.qty} في السطر (${B+1}) بدلاً من تكرار الصنف`,"info",3e3),setTimeout(()=>{const r=document.getElementById("invoice-lines-tbody")?.children[B];r&&(r.style.transition="background-color 0.4s ease",r.style.backgroundColor="rgba(16, 185, 129, 0.25)",r.scrollIntoView({behavior:"smooth",block:"nearest"}),setTimeout(()=>{r.style.backgroundColor=""},1500))},50);return}I.push({productId:e,productName:t,unit:a,altUnit:s||"",unitFactor:l,selectedUnit:c?s:a,basePricePerUnit:u,unitCode:{Carton:"CTN",كرتون:"CTN",Piece:"PCE",حبة:"PCE",Box:"BOX",صندوق:"BOX",Bag:"BAG",كيس:"BAG",Bale:"BL",بالة:"BL",Barrel:"BLL",برميل:"BLL",Pack:"PK","شد / ربطة":"PK",Sack:"SA",شوال:"SA",Tray:"TY",طبق:"TY",Gallon:"GLI",جالون:"GLI",Kilogram:"KGM",كجم:"KGM",Ton:"TNE",طن:"TNE",Liter:"LTR",لتر:"LTR"}[a]||"PCE",taxCategory:i||"S",qty:1,unitPrice:typeof w<"u"?w:m,basePrice:typeof C<"u"?C:m,brokerCommissionPerUnit:typeof y<"u"?y:0,brokerCommissionTotal:typeof y<"u"?y:0,discount:0,discountType:"percent",costPrice:n||0,averageCost:n||0,batchNumber:"",expiryDate:"",availableBatches:[]});const $=I.length-1;Y(),pt(),window.resolveLineBatches($),b?.id&&ke($,b.id,e,E)};function Y(){const e=document.getElementById("invoice-lines-tbody");if(!e)return;if(I.length===0){e.innerHTML='<tr><td colspan="13" style="text-align:center;padding:16px;color:var(--text-2);font-size:12px;">لم يتم إضافة أصناف بعد</td></tr>';return}const t=document.getElementById("inv-warehouse")?.value,o=`companies/${M}/stockByWarehouse`,a=window.ERP_CACHE[o];let i=[];a&&(Array.isArray(a.data)?i=a.data:Array.isArray(a)&&(i=a)),e.innerHTML=I.map((n,s)=>{const p=ve(n.qty,n.unitPrice,n.discount,n.discountType||"percent"),l=n.taxCategory==="S"?p*.15:0;let c=0;if(t){const C=i.find(y=>y.productId===n.productId&&y.warehouseId===t);c=C&&C.qty||0}else c=i.filter(C=>C.productId===n.productId).reduce((C,y)=>C+(y.qty||0),0);let u=0;if(window._editingInvoiceId&&window._editingOldLines&&window._editingOldInvoice){const C=window._editingOldInvoice.warehouseId;(!t||t===C)&&(u=window._editingOldLines.filter(y=>y.productId===n.productId).reduce((y,B)=>{const $=B.altUnit&&B.unitFactor>1&&B.selectedUnit===B.altUnit&&parseFloat(B.unitFactor)||1;return y+(parseFloat(B.qty)||0)*$},0))}const m=c+u,E=(parseFloat(n.qty)||0)*(n.altUnit&&n.unitFactor>1&&n.selectedUnit===n.altUnit&&parseFloat(n.unitFactor)||1),w=!n.isCustom&&!String(n.productId||"").startsWith("adhoc_")&&E>u&&E-u>c;return`<tr style="border-bottom:1px solid var(--border-soft);">
      <td style="padding:6px 10px;color:var(--text-2);width:30px;">${s+1}</td>
      <td style="padding:6px 10px;"><span style="font-family:var(--font-heading);font-size:12.5px;">${n.productName}</span></td>
      <td style="padding:6px 6px;min-width:90px;">
        ${n.altUnit&&n.unitFactor>1?`<select class="input" style="height:30px;font-size:11px;padding:2px 4px;color:var(--brand);font-weight:700;"
               onchange="updateSalesLineUnit(${s},this.value)">
               <option value="${n.altUnit}" ${n.selectedUnit===n.altUnit?"selected":""}>${rt(n.altUnit)}</option>
               <option value="${n.unit}" ${n.selectedUnit===n.unit?"selected":""}>${rt(n.unit)}</option>
             </select>
             <div style="font-size:9.5px;color:#64748b;margin-top:2px;text-align:center">
               ${n.selectedUnit===n.altUnit?`1 ${rt(n.altUnit)} = ${n.unitFactor} ${rt(n.unit)}`:rt(n.unit)}
             </div>`:`<span style="font-size:11px;color:var(--text-2)">${rt(n.unit||"Piece")}</span>`}
      </td>
      <td style="padding:6px 10px;width:80px;">
        <input type="number" class="input mono" style="width:70px;height:30px;font-size:12px;${w?"border-color:var(--bad);background-color:rgba(239,68,68,0.05);":""}"
          value="${n.qty}" min="0.001" step="0.001"
          onchange="updateLine(${s},'qty',this.value)" />
        <div style="font-size:9.5px;margin-top:2px;white-space:nowrap;color:${w?"var(--bad)":"var(--text-dim)"};font-weight:${w?"700":"normal"};">
          ${n.altUnit&&n.unitFactor>1?`متاح: ${Math.floor(m/n.unitFactor)} ${rt(n.altUnit)} + ${m%n.unitFactor} ${rt(n.unit)}`:`المتاح: ${m}`}
        </div>
        ${n.altUnit&&n.unitFactor>1&&n.selectedUnit===n.altUnit?`<div style="font-size:9.5px;color:#059669;margin-top:2px;text-align:center;font-weight:700;">
               = ${(parseFloat(n.qty)||0)*n.unitFactor} ${rt(n.unit)}
             </div>`:""}
      </td>
      <td style="padding:6px 8px; width:${b?.hasBrokerCommission?"145px":"125px"};">
        <input type="number" class="input mono" style="width:105px; height:30px; font-size:12px; font-weight:bold;"
          value="${b?.hasBrokerCommission&&n.basePrice!==void 0?n.basePrice:n.unitPrice}" min="0" step="0.01"
          title="${b?.hasBrokerCommission?"أدخل سعر الاتفاق الأساسي وسيضاف عليه الـ 1% تلقائياً":"سعر الوحدة"}"
          onchange="updateLine(${s},'unitPrice',this.value)" />
        ${b?.hasBrokerCommission?`
          <div style="font-size:9.5px; color:#0284c7; font-weight:800; margin-top:2px; white-space:nowrap;">
            سعر الفاتورة: <strong>${n.unitPrice}</strong> <span style="font-size:8.5px; color:#059669;">(+${b.brokerRate}%)</span>
          </div>
        `:""}
        ${n.lastCustomerPrice!==void 0&&n.lastCustomerPrice!==null?`
          <div style="margin-top:3px; display:inline-flex; align-items:center; gap:3px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:4px; padding:1px 5px; font-size:10px; color:#1e40af; white-space:nowrap; box-shadow:0 1px 2px rgba(0,0,0,0.03);"
               title="آخر بيع لهذا العميل: فاتورة #${n.lastCustomerInvoiceNumber||""} بتاريخ ${n.lastCustomerInvoiceDate||""}">
            <span>🏷️ آخر بيع: <strong>${n.lastCustomerPrice}</strong>${n.lastCustomerUnit&&n.lastCustomerUnit!==n.selectedUnit?` (${rt(n.lastCustomerUnit)})`:""}</span>
            ${Number(n.lastCustomerPrice)!==Number(n.unitPrice)?`
              <button type="button" onclick="window.applyLastCustomerPrice(${s})" 
                      style="border:none; background:#2563eb; color:#fff; font-size:9.5px; font-weight:800; padding:1px 5px; border-radius:3px; cursor:pointer; line-height:1.2;"
                      title="تطبيق آخر سعر بيع (${n.lastCustomerPrice} ر.س)">
                تطبيق
              </button>
            `:'<span style="color:#059669; font-weight:800; font-size:9px;">(مطابق)</span>'}
          </div>
        `:b?.id&&n.isFirstTimeForCustomer?`
          <div style="margin-top:3px; display:inline-flex; align-items:center; gap:2px; background:#f1f5f9; border:1px dashed #94a3b8; border-radius:4px; padding:1px 5px; font-size:9.5px; color:#475569; white-space:nowrap;" title="لم يسبق بيع هذا الصنف لهذا العميل من قبل">
            <span>ℹ️ أول بيع للعميل</span>
          </div>
        `:""}
      </td>
      <td style="padding:6px 6px; width:110px; text-align:center;">
        <div style="display:inline-flex; align-items:center; gap:2px; background:#fff; border:1px solid #cbd5e1; border-radius:6px; padding:1px 2px;">
          <input type="number" class="input mono font-bold no-spin" style="width:52px; height:26px; font-size:11.5px; text-align:center; padding:1px 3px; border:none; background:transparent; color:#be123c;"
            value="${n.discount||0}" min="0" ${n.discountType==="amount"?"":'max="100"'} step="${n.discountType==="amount"?"0.01":"1"}"
            placeholder="0"
            onchange="updateLine(${s},'discount',this.value)" />
          <button type="button" onclick="window.toggleLineDiscountType(${s})" 
            title="تبديل نوع الخصم بين نسبة مئوية (%) ومبلغ نقدي (ر.س)"
            style="border:none; background:${n.discountType==="amount"?"#dbeafe":"#fef2f2"}; color:${n.discountType==="amount"?"#1d4ed8":"#dc2626"}; font-weight:900; font-size:10px; padding:2px 5px; border-radius:4px; cursor:pointer; white-space:nowrap; transition:all 0.15s;">
            ${n.discountType==="amount"?"ر.س":"%"}
          </button>
        </div>
      </td>
      <td style="padding:6px 8px; text-align:center; white-space:nowrap; background:#f0f9ff;">
        <span class="mono font-bold" style="font-size:11.5px; color:#0369a1;" title="متوسط التكلفة المرجح للصنف (WAC)">${_(parseFloat(n.averageCost||n.costPrice||0))}</span>
      </td>
      <td style="padding:6px 8px; text-align:center; white-space:nowrap; background:#ecfdf5;">
        ${(()=>{const C=parseFloat(n.qty)||1,y=(parseFloat(n.qty)||0)*(parseFloat(n.unitPrice)||0);let B=0;n.discountType==="amount"?B=Math.min(y,Math.max(0,parseFloat(n.discount||0))):B=Math.min(y,Math.max(0,y*(parseFloat(n.discount||0)/100)));const $=Math.max(0,y-B),h=C>0?$/C:0,N=parseFloat(n.averageCost||n.costPrice||0),r=h>0?(h-N)/h*100:0;return`<span class="badge ${r>=0?"good":"bad"}" style="font-size:11px; font-weight:800; padding:2px 7px;" title="هامش ربح الصنف وفق المتوسط المرجح: ${r.toFixed(1)}% ${r<0?"⚠️ بيع بأقل من التكلفة":""}">
            ${r>=0?"+":""}${r.toFixed(1)}%
          </span>`})()}
      </td>
      <td style="padding:6px 10px;width:120px;">
        <select class="input mono" style="width:110px;height:30px;font-size:11px;padding:2px 6px;"
          onchange="window.selectLineBatch(${s}, this.value)">
          <option value="">-- افتراضي --</option>
          ${(n.availableBatches||[]).map(C=>`
            <option value="${C.number}" ${n.batchNumber===C.number?"selected":""}>
              ${C.number} (${C.qty})
            </option>
          `).join("")}
        </select>
      </td>
      <td style="padding:6px 10px;width:110px;">
        <input type="text" class="input mono" style="width:100px;height:30px;font-size:11px;"
          value="${n.expiryDate||""}" disabled placeholder="—" />
      </td>
      <td style="padding:6px 10px;font-size:11px;">
        ${n.taxCategory==="S"?`<span class="badge warn" style="font-size:11px; font-weight:700;">${_(l)}</span>`:'<span class="badge good" style="font-size:10px;">0%</span>'}
      </td>
      <td style="padding:6px 10px;" class="mono font-bold">${_(p)}</td>
      <td style="padding:6px 10px;">
        <button class="btn btn-icon sm btn-ghost" onclick="removeLine(${s})" style="color:var(--bad);">✕</button>
      </td>
    </tr>`}).join("")}window.resolveLineBatches=async e=>{const t=I[e];if(!t||!t.productId)return;const o=document.getElementById("inv-warehouse")?.value||"";try{const a=lt(H.stockTransactions(),W("productId","==",t.productId)),n=(await vt(a)).docs.map(l=>l.data()),s={};n.forEach(l=>{o&&l.warehouseId!==o||l.batchNumber&&(s[l.batchNumber]||(s[l.batchNumber]={qty:0,expiryDate:l.expiryDate||""}),s[l.batchNumber].qty+=l.qtyChange||0)});const p=Object.keys(s).map(l=>({number:l,...s[l]})).filter(l=>l.qty>.001).sort((l,c)=>l.expiryDate?c.expiryDate?new Date(l.expiryDate)-new Date(c.expiryDate):-1:1);t.availableBatches=p,p.length>0?t.batchNumber||(t.batchNumber=p[0].number,t.expiryDate=p[0].expiryDate):(t.batchNumber="",t.expiryDate="")}catch(a){console.error("resolveLineBatches error:",a)}Y()};window.resolveAllLineBatches=()=>{I.forEach((e,t)=>{window.resolveLineBatches(t)})};window.selectLineBatch=(e,t)=>{const o=I[e];if(!o)return;o.batchNumber=t;const a=(o.availableBatches||[]).find(i=>i.number===t);o.expiryDate=a?a.expiryDate:"",Y()};window.updateLine=(e,t,o)=>{const a=I[e];if(!a)return;const i=parseFloat(o)||0;if(t==="unitPrice"&&b?.hasBrokerCommission&&b?.brokerRate>0){const n=parseFloat(b.brokerRate)||1,s=i,p=parseFloat((s*(1+n/100)).toFixed(2));a.basePrice=s,a.unitPrice=p,a.brokerCommissionPerUnit=parseFloat((p-s).toFixed(2)),a.brokerCommissionTotal=parseFloat((a.brokerCommissionPerUnit*(parseFloat(a.qty)||0)).toFixed(2))}else a[t]=i,t==="qty"&&b?.hasBrokerCommission&&a.brokerCommissionPerUnit&&(a.brokerCommissionTotal=parseFloat((a.brokerCommissionPerUnit*i).toFixed(2)));Y(),pt()};window.updateSalesLineUnit=(e,t)=>{const o=I[e];if(!o)return;o.selectedUnit,o.selectedUnit=t;const a=parseFloat(o.unitFactor)||1,i=parseFloat(o.basePricePerUnit)||0;a>1&&i>0&&(t===o.altUnit?o.unitPrice=i:o.unitPrice=parseFloat((i/a).toFixed(4))),Y(),pt(),b?.id&&o.productId&&ke(e,b.id,o.productId,t)};window.removeLine=e=>{I.splice(e,1),Y(),pt()};window.toggleLineDiscountType=e=>{const t=I[e];t&&(t.discountType=t.discountType==="amount"?"percent":"amount",Y(),pt())};window.onGlobalDiscountChanged=()=>{pt()};async function pt(){const e=await Ie(),t=document.getElementById("inv-payment")?.value||"credit",o=document.getElementById("inv-paid-amount");t==="credit"&&window.event&&window.event.type==="change"?o&&(o.value="0"):t==="cash"&&window.event&&window.event.type==="change"&&o&&(o.value="");const a=b?.id==="005"||(b?.name||"").includes("سلة البركة");a&&I.forEach(A=>{A.taxCategory="E"});const i=he(I);let n=0;e.enableCashDiscount&&(t==="cash"||t==="transfer")&&(n+=e.cashDiscountRate||0);const s=I.reduce((A,U)=>A+(U.qty||0),0);e.enableVolumeDiscount&&s>=(e.volumeDiscountThreshold||50)&&(n+=e.volumeDiscountRate||0);let p=0;n>0&&(p=Math.round(i.subtotal*(n/100)*100)/100);const l=parseFloat(document.getElementById("inv-global-discount-val")?.value)||0,c=document.getElementById("inv-global-discount-type")?.value||"amount";let u=0;c==="percent"?u=Math.round(i.subtotal*(Math.min(100,Math.max(0,l))/100)*100)/100:u=Math.min(i.subtotal,Math.max(0,l));const m=u+p,E=a?0:Math.max(0,i.subtotal-m),w=i.subtotal>0?m/i.subtotal:0,C=a?0:Math.round(i.vatTotal*(1-w)*100)/100,y=Math.round((E+C)*100)/100,B=A=>`${_(A)}`;document.getElementById("total-subtotal").textContent=B(i.subtotal+i.discountTotal);const $=i.discountTotal+m;document.getElementById("total-discount").textContent=`- ${B($)}`,document.getElementById("total-vat").textContent=B(C),document.getElementById("total-grand").textContent=B(y);const h=I.reduce((A,U)=>{const X=U.averageCost||U.costPrice||0;return A+X*(U.qty||0)},0),N=E,r=N-h,x=N>0?r/N*100:0,L=document.getElementById("total-profit"),V=document.getElementById("total-margin");L&&(L.textContent=B(r),r>0?L.className="mono font-bold text-good":L.className="mono font-bold text-bad"),V&&(V.textContent=`${x.toFixed(1)}%`,x>0?V.className="mono font-bold text-good":V.className="mono font-bold text-bad");const ot=document.getElementById("inv-hud-lines-count"),at=document.getElementById("inv-hud-subtotal"),g=document.getElementById("inv-hud-cost"),d=document.getElementById("inv-hud-profit"),T=document.getElementById("inv-hud-margin");ot&&(ot.textContent=I.length);const G=document.getElementById("inv-items-badge");if(G&&(G.textContent=`${I.length} صنف`),at&&(at.textContent=B(E)),g&&(g.textContent=B(h)),d&&(d.textContent=`${r>=0?"+":""}${B(r)}`,d.style.color=r>=0?"#16a34a":"#dc2626"),T){T.textContent=`${x>=0?"+":""}${x.toFixed(1)}%`,T.style.color=x>=0?"#059669":"#dc2626";const A=document.getElementById("inv-hud-margin-pill");A&&(A.style.background=x>=0?"#ecfdf5":"#fef2f2",A.style.borderColor=x>=0?"#6ee7b7":"#fca5a5")}window._autoDiscountAmount=p,window._autoDiscountRate=n,window._globalDiscountAmount=u,window._globalDiscountValue=l,window._globalDiscountType=c}async function _e(e){if(!e)return;const t=e.id,o=e.number||e.invoiceNumber||"",a=parseFloat(e.paidAmount)||0,i=parseFloat(e.totalWithVat)||parseFloat(e.total)||0;if((e.paymentMethod==="cash"||e.paymentMethod==="نقدي")&&a>0)try{await xe({type:"out",amount:a,notes:`عكس/تعديل سداد الفاتورة ${o}`,sourceType:"salesInvoice_reverse",sourceId:t,date:e.date||ht(),cashBoxId:e.repId?`cashBox_${e.repId}`:null}),console.log(`[Cleanup] Reversed cash transaction of ${a} for invoice ${o}`)}catch(n){console.warn("[Cleanup] Cash reversal failed:",n.message)}if(["transfer","network","bank","cheque","check","تحويل","شبكة","شيك"].includes(e.paymentMethod)&&i>0)try{await ye({type:"out",amount:i,notes:`عكس/تعديل سداد الفاتورة ${o}`,sourceType:"salesInvoice_reverse",sourceId:t,date:e.date||ht()}),console.log(`[Cleanup] Reversed bank transaction of ${i} for invoice ${o}`)}catch(n){console.warn("[Cleanup] Bank reversal failed:",n.message)}try{const n=[];t&&n.push(lt(yt(O,`companies/${M}/receipts`),W("sourceInvoiceId","==",t))),o&&n.push(lt(yt(O,`companies/${M}/receipts`),W("sourceInvoiceId","==",o)));for(const s of n){const p=await vt(s);for(const l of p.docs){const c=l.id;for(const u of["pos","receipt","salesInvoice","customerPayment"])try{const m=await vt(lt(yt(O,`companies/${M}/journalEntries`),W("sourceType","==",u),W("sourceId","==",c)));for(const E of m.docs)await Tt(E.id),console.log(`[Cleanup] Deleted JE ${E.id} (${u}) for receipt ${c}`)}catch(m){console.warn(`[Cleanup] JE delete (${u}) for receipt ${c}:`,m.message)}await we("receipts",c),console.log(`[Cleanup] Deleted receipt voucher ${c} linked to invoice ${o}`)}}}catch(n){console.warn("[Cleanup] Receipts cleanup failed:",n.message)}}window.saveInvoice=async(e="pending")=>{const t=document.getElementById("inv-form-error");t.classList.add("hidden");const o=document.getElementById("customer-id").value,a=document.getElementById("customer-search").value.trim(),i=document.getElementById("inv-rep"),n=i.value||"",s=n?i.options[i.selectedIndex]?.dataset.name||"":"بدون مندوب",p=document.getElementById("inv-warehouse"),l=p.value,c=p.options[p.selectedIndex]?.dataset.name||"",u=document.getElementById("inv-cost-center"),m=u?.value||null,E=u&&m&&u.options[u.selectedIndex]?u.options[u.selectedIndex].dataset.name||u.options[u.selectedIndex].text:null;document.getElementById("inv-date").value;const w=document.getElementById("inv-payment").value;let C=parseFloat(document.getElementById("inv-paid-amount").value)||0;(w==="credit"||w==="deferred"||w==="آجل")&&(C=0);const y=document.getElementById("inv-notes").value.trim(),B=document.getElementById("inv-type").value;if(!o&&B==="standard"){t.textContent="يرجى اختيار العميل",t.classList.remove("hidden");return}if(!l){t.textContent="يرجى اختيار المخزن",t.classList.remove("hidden");return}if(I.length===0){t.textContent="يرجى إضافة صنف واحد على الأقل",t.classList.remove("hidden");return}if(window._isSavingInvoice)return;window._isSavingInvoice=!0;const $=document.getElementById("save-inv-btn");$&&($.disabled=!0,$.textContent="جارٍ التحقق…");const h=await Ie(),N=b?.id==="005"||(b?.name||"").includes("سلة البركة");N&&I.forEach(F=>{F.taxCategory="E"});const r=he(I),x=window._autoDiscountAmount||0,L=parseFloat(document.getElementById("inv-global-discount-val")?.value)||0,V=document.getElementById("inv-global-discount-type")?.value||"amount";let ot=0;V==="percent"?ot=Math.round(r.subtotal*(Math.min(100,Math.max(0,L))/100)*100)/100:ot=Math.min(r.subtotal,Math.max(0,L));const at=ot+x,g=Math.round((r.subtotal+r.discountTotal)*100)/100,d=N?0:Math.max(0,r.subtotal-at),T=Math.round((r.discountTotal+at)*100)/100,G=r.subtotal>0?at/r.subtotal:0,A=N?0:Math.round(r.vatTotal*(1-G)*100)/100,U=Math.round((d+A)*100)/100,X=Math.max(0,U-C);let tt=!1;I.forEach(F=>{let q=0;if(F.discountType==="amount"){const it=(parseFloat(F.qty)||1)*(parseFloat(F.unitPrice)||1);q=it>0?(parseFloat(F.discount)||0)/it*100:0}else q=parseFloat(F.discount)||0;q>(h.maxRepDiscount??3)&&(tt=!0)}),V==="percent"&&L>(h.maxRepDiscount??3)&&(tt=!0);const ut=()=>{window._isSavingInvoice=!1,$&&($.disabled=!1,$.textContent="💾 حفظ وإصدار")};if(tt&&prompt(`⚠️ لقد تجاوزت الحد الأقصى المسموح لخصم المندوب (${h.maxRepDiscount??3}%).
يرجى إدخال رمز أمان المشرف (Supervisor PIN) للمتابعة:`)!==(h.supervisorPIN||"1234")){alert("❌ رمز الأمان غير صحيح. تم رفض الحفظ."),ut();return}const ct=h.creditBlockPolicy||"block_with_pin";if(ct!=="allow_all"&&b?.creditLimit>0&&w==="credit"){const F=(b.balance||0)+U;if(F>b.creditLimit){if(ct==="warn"){if(!confirm(`⚠️ تجاوز حد ائتمان العميل: ${_(F)} > ${_(b.creditLimit)}
هل تريد المتابعة وتجاوز الحد؟`)){ut();return}}else if(ct==="block_with_pin"&&prompt(`⚠️ تجاوز حد ائتمان العميل: ${_(F)} > ${_(b.creditLimit)}
يتطلب هذا الإجراء صلاحية المدير.
يرجى إدخال رمز تجاوز المدير (Supervisor PIN):`)!==(h.supervisorPIN||"1234")){alert("❌ رمز تجاوز غير صحيح! تم رفض المعاملة."),ut();return}}}if(ct!=="allow_all"&&b?.creditDays>0&&w==="credit")try{const{getDocs:F,query:q,collection:it,where:wt}=await gt(async()=>{const{getDocs:Pt,query:Ct,collection:St,where:zt}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDocs:Pt,query:Ct,collection:St,where:zt}},[]),S=it(O,`companies/${M}/salesInvoices`),Bt=q(S,wt("customerId","==",o),wt("status","in",["pending","posted","partial"]),wt("payment","==","credit")),oe=await F(Bt),ce=new Date;let At=!1,Z=0;if(oe.forEach(Pt=>{const Ct=Pt.data();if((Ct.remainingAmount||0)>0&&Ct.date){const St=new Date(Ct.date),zt=ce-St;Math.floor(zt/(1e3*60*60*24))>b.creditDays&&(At=!0,Z+=Ct.remainingAmount||0)}}),At){if(ct==="warn"){if(!confirm(`⚠️ العميل لديه فواتير متأخرة عن مهلة السداد (${b.creditDays} يوم) بقيمة إجمالية ${_(Z)}!
هل تريد تجاوز التنبيه والمتابعة؟`)){ut();return}}else if(ct==="block_with_pin"&&prompt(`⚠️ العميل لديه فواتير متأخرة عن مهلة السداد (${b.creditDays} يوم) بقيمة إجمالية ${_(Z)}!
يتطلب هذا الإجراء صلاحية المدير لتجاوز الحظر الائتماني.
يرجى إدخال رمز تجاوز المدير (Supervisor PIN):`)!==(h.supervisorPIN||"1234")){alert("❌ رمز تجاوز غير صحيح! تم رفض المعاملة."),ut();return}}}catch(F){console.warn("Failed to check overdue customer invoices:",F)}$&&($.disabled=!0,$.textContent="جارٍ الحفظ…");try{const F=document.getElementById("inv-date")?.value||ht();if(await Fe(F)){Nt(`⚠️ لا يمكن حفظ الفاتورة لأن تاريخها (${F}) يقع في فترة محاسبية مغلقة ومقفلة نهائياً.`),$.disabled=!1,$.textContent="💾 حفظ وإصدار";return}const q=new Map,it=[];let wt=0;for(const f of I){if(!f.productId||f.isCustom||String(f.productId).startsWith("adhoc_")){it.push(f);continue}const v=(f.selectedUnit||f.unit||"CTN").trim().toLowerCase(),z=`${f.productId}_${v}`;if(q.has(z)){const R=q.get(z),Q=parseFloat(R.qty)||0,et=parseFloat(f.qty)||0;R.qty=Q+et,wt++}else q.set(z,f),it.push(f)}wt>0&&(I=it,Y(),pt(),window.showToast&&window.showToast(`تم دمج ${wt} بنود مكررة تلقائياً لضبط كميات الفاتورة والمخزون`,"info",3500));let S=null,Bt={};if(window._editingInvoiceId)try{S=window._editingOldInvoice||await Gt("salesInvoices",window._editingInvoiceId);const f=S?S.lines||S.items||[]:[];S&&f.length>0&&(S.warehouseId===l||!l)&&f.forEach(v=>{if(v.productId){const z=v.altUnit&&v.unitFactor>1&&v.selectedUnit===v.altUnit&&parseFloat(v.unitFactor)||1,R=(parseFloat(v.qty)||0)*z;Bt[v.productId]=(Bt[v.productId]||0)+R}})}catch(f){console.warn("Failed to load old invoice for stock validation:",f)}const oe=I.map(async f=>{if(!f.productId||!f.qty||String(f.productId).startsWith("adhoc_")||f.isCustom)return null;try{const v=(parseFloat(f.qty)||0)*(f.altUnit&&f.unitFactor>1&&f.selectedUnit===f.altUnit&&parseFloat(f.unitFactor)||1),z=Bt[f.productId]||0,R=v-z;if(R<=0)return null;const Q=`${l}_${f.productId}`,et=await Et(It(O,`companies/${M}/stockByWarehouse`,Q));let $t=et.exists()&&et.data().qty||0;if($t<R)return`⚠️ الكمية الإضافية المطلوبة من الصنف "${f.productName||f.productId}" (${R} ${rt(f.unit||"Piece")}) تتجاوز المتوفر في المخزن (${$t})`}catch(v){console.warn(`Stock check failed for product ${f.productId}:`,v)}return null}),At=(await Promise.all(oe)).find(f=>f!==null);if(At){Nt(At),window._isSavingInvoice=!1,$.disabled=!1,$.textContent=window._editingInvoiceId?"💾 تحديث الفاتورة":"💾 حفظ وإصدار";return}const Z=document.getElementById("inv-number").value,Pt=De(new Date),Ct=Le(),St=(()=>{try{return JSON.parse(localStorage.getItem("idham_company")||"{}")}catch{return{}}})(),zt=Me({sellerName:St.name||window.ERP_COMPANY?.name||"مؤسسة إدهام للمواد الغذائية",vatNumber:St.vatNumber||window.ERP_COMPANY?.vatNumber||"",timestamp:Pt,totalWithVat:U,vatAmount:A}),le=e==="draft"?"draft":X>0?"posted":"paid",P={number:Z,invoiceNumber:Z,uuid:Ct,date:F,invoiceType:B,customerId:o||null,customerName:a||"عميل نقدي",repId:n,repName:s,warehouseId:l,warehouseName:c,costCenterId:m||null,costCenterName:E||null,lines:I,items:I,subtotal:d,grossSubtotal:g,discountTotal:T,globalDiscountValue:L,globalDiscountType:V,globalDiscountAmount:ot,totalVat:A,vatAmount:A,total:U,totalWithVat:U,paymentMethod:w,paidAmount:C,remainingAmount:X,notes:y,status:le,zatcaStatus:"pending",qrBase64:zt,createdBy:window._salesUser?.uid||"system",autoDiscountAmount:x,autoDiscountRate:window._autoDiscountRate||0,stockStatus:"pending_deduction",hasBrokerCommission:!!b?.hasBrokerCommission,brokerName:b?.brokerName||"",brokerRate:parseFloat(b?.brokerRate)||0,brokerTrigger:b?.brokerTrigger||"on_payment",brokerAccountCode:b?.brokerAccountCode||"2-1-4-2",brokerExpenseCode:b?.brokerExpenseCode||"5-4-10",brokerCommissionTotal:b?.hasBrokerCommission?Math.round(I.reduce((f,v)=>f+(parseFloat(v.brokerCommissionTotal)||(v.unitPrice?(v.unitPrice-(v.basePrice||v.unitPrice/1.01))*(parseFloat(v.qty)||0):0)),0)*100)/100||Math.round(d*(parseFloat(b.brokerRate||1)/100)*100)/100:0,brokerCommissionStatus:b?.hasBrokerCommission?w==="cash"?"earned":"pending_payment":"none",brokerCommissionEarned:b?.hasBrokerCommission&&w==="cash"?Math.round(d*(parseFloat(b.brokerRate||1)/100)*100)/100:0};let j=window._editingInvoiceId;const Vt=!!j;if(Vt){if(S||(S=await Gt("salesInvoices",j)),S&&S.version&&window._editingInvoiceVersion&&window._editingInvoiceVersion!==S.version){Nt("⚠️ تم تعديل هذه الفاتورة مسبقاً من جلسة أخرى. يرجى إغلاق الفاتورة وإعادة فتحها لتجنب تضارب البيانات."),$.disabled=!1,$.textContent="💾 تحديث الفاتورة",window._isSavingInvoice=!1;return}P.version=(S?.version||1)+1;const f=S?S.lines||S.items||[]:[],v=S&&S.status!=="draft"&&S.status!=="cancelled"&&S.stockStatus!=="draft",z=[],R=Date.now(),Q=S?.warehouseId||l,et=l,$t=Q===et;if(v)if(!$t)f.forEach((k,st)=>{if(!k.productId||String(k.productId).startsWith("adhoc_")||k.isCustom)return;const mt=k.altUnit&&k.unitFactor>1&&k.selectedUnit===k.altUnit&&parseFloat(k.unitFactor)||1,xt=(parseFloat(k.qty)||0)*mt;xt>0&&z.push({warehouseId:Q,productId:k.productId,qtyDelta:xt,metadata:{type:"sale_reverse_edit",txDocId:`tx_rev_edit_${j}_${R}_${st}_${k.productId}`,documentNumber:P.number,invoiceNumber:P.number,allowNegative:!1,date:P.date||new Date().toISOString().split("T")[0],productName:k.productName||k.name||"",notes:`تعديل الفاتورة ${P.number} (نقل للمخزن الجديد)`}})}),I.forEach((k,st)=>{if(!k.productId||!k.qty||String(k.productId).startsWith("adhoc_")||k.isCustom)return;const mt=k.altUnit&&k.unitFactor>1&&k.selectedUnit===k.altUnit&&parseFloat(k.unitFactor)||1,xt=(parseFloat(k.qty)||0)*mt;xt>0&&z.push({warehouseId:et,productId:k.productId,qtyDelta:-xt,metadata:{type:"sale_out",sourceType:"salesInvoice",sourceId:j,txDocId:`tx_sale_out_edit_${j}_${R}_${st}_${k.productId}`,documentNumber:P.number,invoiceNumber:P.number,allowNegative:!1,date:P.date||new Date().toISOString().split("T")[0],productName:k.productName||k.name||"",notes:`فاتورة بيع ${P.number} (معدلة)`}})});else{const k={};f.forEach(D=>{if(!D.productId||String(D.productId).startsWith("adhoc_")||D.isCustom)return;const Mt=D.altUnit&&D.unitFactor>1&&D.selectedUnit===D.altUnit&&parseFloat(D.unitFactor)||1,qt=(parseFloat(D.qty)||0)*Mt;k[D.productId]=(k[D.productId]||0)+qt});const st={},mt={};I.forEach((D,Mt)=>{if(!D.productId||String(D.productId).startsWith("adhoc_")||D.isCustom)return;const qt=D.altUnit&&D.unitFactor>1&&D.selectedUnit===D.altUnit&&parseFloat(D.unitFactor)||1,_t=(parseFloat(D.qty)||0)*qt;st[D.productId]=(st[D.productId]||0)+_t,mt[D.productId]={...D,lineIdx:Mt}});const xt=new Set([...Object.keys(k),...Object.keys(st)]);for(const D of xt){const Mt=k[D]||0,qt=st[D]||0,_t=Math.round((qt-Mt)*1e3)/1e3;if(_t>0){const Ut=mt[D]||{};z.push({warehouseId:et,productId:D,qtyDelta:-_t,metadata:{type:"sale_out",sourceType:"salesInvoice",sourceId:j,txDocId:`tx_sale_out_delta_${j}_v${P.version}_${D}`,documentNumber:P.number,invoiceNumber:P.number,allowNegative:!1,date:P.date||new Date().toISOString().split("T")[0],productName:Ut.productName||Ut.name||"",notes:`فاتورة بيع ${P.number} (زيادة كمية بعد التعديل: +${_t})`}})}else if(_t<0){const Ut=mt[D]||f.find(Se=>Se.productId===D)||{},pe=Math.abs(_t);z.push({warehouseId:et,productId:D,qtyDelta:pe,metadata:{type:"sale_reverse_edit",txDocId:`tx_rev_edit_delta_${j}_v${P.version}_${D}`,refId:P.number,documentNumber:P.number,invoiceNumber:P.number,allowNegative:!1,date:P.date||new Date().toISOString().split("T")[0],productName:Ut.productName||Ut.name||"",notes:`تعديل الفاتورة ${P.number} (إنقاص كمية: -${pe})`}})}}}if(z.length>0)try{await Zt(z),P.stockStatus="completed",P.stockError=""}catch(k){console.error("[adjustStockBulk] ❌ Edit adjust stock failed:",k.message);const st=(k?.message||"").includes("Quota exceeded")||k?.code==="resource-exhausted"||(k?.message||"").includes("429");Nt(st?"🚨 تنبيه حصة السيرفر (Firebase Quota Exceeded): تم استهلاك الحد الأقصى اليومي المجاني لقراءات فايربيز (50,000 عملية). يتجدد العداد تلقائياً عند منتصف الليل UTC (3:00 فجراً بتوقيت السعودية)، أو يمكن ترقية المشروع إلى باقة (Blaze Plan) لمنع التوقف نهائياً.":`❌ تعذر تحديث المخزون: ${k.message}`),window._isSavingInvoice=!1,$.disabled=!1,$.textContent="💾 تحديث الفاتورة";return}else P.stockStatus="completed";S&&await _e(S);const ae=S?.invoiceNumber||S?.number||j,Pe=["salesInvoice","sales","salesCOGS","salesInvoice_cogs","salesReturnCOGS","posCOGS","broker_commission"];for(const k of Pe)try{const st=await vt(lt(yt(O,`companies/${M}/journalEntries`),W("sourceType","==",k),W("sourceId","==",ae)));for(const mt of st.docs)await Tt(mt.id),console.log(`[saveInvoice-edit] Deleted old JE ${mt.id} (${k}) for ${ae}`);if(ae!==j){const mt=await vt(lt(yt(O,`companies/${M}/journalEntries`),W("sourceType","==",k),W("sourceId","==",j)));for(const xt of mt.docs)await Tt(xt.id),console.log(`[saveInvoice-edit] Deleted old JE ${xt.id} (${k}) for raw id ${j}`)}}catch(st){console.warn(`[saveInvoice-edit] JE cleanup (${k}) skipped:`,st.message)}if(S?.journalEntryId)try{await Tt(S.journalEntryId)}catch{}await Rt("salesInvoices",j,P)}else{const f=I.filter(v=>v.productId&&!String(v.productId).startsWith("adhoc_")&&!v.isCustom).map(v=>({warehouseId:l,productId:v.productId,qtyDelta:-((parseFloat(v.qty)||0)*(v.altUnit&&v.unitFactor>1&&v.selectedUnit===v.altUnit&&parseFloat(v.unitFactor)||1)),metadata:{type:"sale_out",sourceType:"salesInvoice",sourceId:P.number,documentNumber:P.number,invoiceNumber:P.number,allowNegative:!1,date:P.date||new Date().toISOString().split("T")[0],productName:v.productName||v.name||"",userId:window._salesUser?.uid,createdByName:window._salesUser?.displayName||window._salesUser?.email||"النظام",batchNumber:v.batchNumber||"",expiryDate:v.expiryDate||"",notes:`فاتورة بيع ${P.number}`}}));if(f.length>0)try{await Zt(f),P.stockStatus="completed",P.stockError=""}catch(v){console.error("[adjustStockBulk] ❌ Create adjust stock failed:",v.message);const z=(v?.message||"").includes("Quota exceeded")||v?.code==="resource-exhausted"||(v?.message||"").includes("429");Nt(z?"🚨 تنبيه حصة السيرفر (Firebase Quota Exceeded): تم استهلاك الحد الأقصى اليومي المجاني لقراءات فايربيز (50,000 عملية). يتجدد العداد تلقائياً عند منتصف الليل UTC (3:00 فجراً بتوقيت السعودية)، أو يمكن ترقية المشروع إلى باقة (Blaze Plan) لمنع التوقف نهائياً.":`❌ تعذر خصم المخزون وحفظ الفاتورة: ${v.message}`),window._isSavingInvoice=!1,$.disabled=!1,$.textContent="💾 حفظ وإصدار";return}else P.stockStatus="completed";j=await Ae(H.salesInvoices(),P)}let Wt=I.reduce((f,v)=>{const z=v.averageCost||v.costPrice||v.lastPurchasePrice||v.avgCostPrice||v.purchasePrice||0;return f+(parseFloat(v.qty)||0)*z},0);if(Wt<.01&&I.length>0)try{const f=I.map(async R=>{if(!R.productId)return 0;try{const Q=await Et(It(O,`companies/${M}/products`,R.productId));if(Q.exists()){const et=Q.data(),$t=et.averageCost||et.costPrice||et.lastPurchasePrice||et.avgCostPrice||et.purchasePrice||0;return R.averageCost=$t,R.costPrice=$t,(parseFloat(R.qty)||0)*$t}}catch(Q){console.warn(`[COGS] Failed to fetch cost for product ${R.productId}:`,Q.message)}return 0}),z=(await Promise.all(f)).reduce((R,Q)=>R+Q,0);z>.01&&(Wt=z)}catch(f){console.warn("[COGS] Failed to fetch product costs:",f.message)}try{const f=await nt(H.warehouses());if(Vt)try{const{deleteJournalEntry:z}=await gt(async()=>{const{deleteJournalEntry:Q}=await import("./index-CF9GFeRJ.js").then(et=>et.T);return{deleteJournalEntry:Q}},__vite__mapDeps([0,1])),R=await vt(lt(yt(O,`companies/${M}/journalEntries`),W("sourceId","in",[j,Z])));for(const Q of R.docs)await z(Q.id),console.log(`[Edit] Deleted old JE ${Q.id} for invoice ${Z}`)}catch(z){console.warn("[Edit] Failed to cleanup old JEs:",z.message)}const v=await Ue({id:j,invoiceNumber:Z,date:F,customerName:a||"عميل نقدي",customerType:b?.type||"retail",paymentMethod:w,subtotal:d,grossSubtotal:g,discountTotal:T,taxAmount:A,total:U,paidAmount:C,remainingAmount:X,totalCost:Wt,warehouseId:l,warehouseName:c,costCenterId:m,costCenterName:E,sourceType:"salesInvoice",customerId:o,lines:I,items:I,repId:n},window._salesUser||{},f);await Rt("salesInvoices",j,{journalEntryId:v,totalCost:Math.round(Wt*100)/100})}catch(f){console.error("[AccountingEngine] Sales JE failed:",f.message);try{await Rt("salesInvoices",j,{journalEntryError:f.message,journalEntryId:null})}catch{}window.showToast?.("⚠️ تم حفظ الفاتورة لكن القيد المحاسبي فشل — "+f.message,"warn")}const Ft=parseFloat(P.brokerCommissionTotal)||0,Ne=P.brokerTrigger||"on_invoice";if(P.hasBrokerCommission&&Ft>.01&&(Ne==="on_invoice"||w==="cash"||w==="نقدي"))try{const f=P.brokerAccountCode||"2-1-4-2",v=P.brokerExpenseCode||"5-4-10",z=P.brokerName||"زياد",R=[{accountCode:v,accountName:"مصروفات عمولات وسيط",debit:Ft,credit:0,note:`استحقاق عمولة الوسيط (${z}) عن فاتورة ${Z}`},{accountCode:f,accountName:`مستحقات عمولات الوسطاء - ${z}`,debit:0,credit:Ft,note:`استحقاق عمولة الوسيط (${z}) عن فاتورة ${Z}`}],Q=await ze({date:F||ht(),sourceType:"broker_commission",sourceId:j,description:`قيد استحقاق عمولة الوسيط ${z} (${Ft} ر.س) عن مبيعات فاتورة ${Z} — ${a||"عميل"}`,lines:R});await Rt("salesInvoices",j,{brokerCommissionStatus:"earned",brokerCommissionEarned:Ft,brokerJournalEntryId:Q}),console.log(`[BrokerCommission] Auto accrued ${Ft} SAR via JE ${Q} for invoice ${Z}`)}catch(f){console.warn("[BrokerCommission] Accrual JE failed:",f.message)}if(w==="cash"||w==="نقدي")try{await xe({type:"in",amount:C,notes:`مبيعات نقدية — فاتورة ${Z} — ${a||"عميل"}`,sourceType:"salesInvoice",sourceId:j,date:F})}catch(f){console.warn("[autoCashTransaction] Cash box update failed:",f.message)}if(["transfer","network","bank","cheque","check","تحويل","شبكة","شيك"].includes(w))try{await ye({type:"in",amount:U,notes:`مبيعات — فاتورة ${Z} — ${a||"عميل"}`,sourceType:"salesInvoice",sourceId:j,date:F})}catch(f){console.warn("[autoBankTransaction] Bank update failed:",f.message)}if(Vt)o&&await ie(o).catch(f=>console.warn(f)),S?.customerId&&S.customerId!==o&&await ie(S.customerId).catch(f=>console.warn(f));else{if(o&&X>0)try{const f=It(O,`companies/${M}/customers`,o);await je(f,{balance:Ve(X),updatedAt:Oe()}),console.log(`[CustomerBalance] Client-side incremented customer ${o} balance by +${X}`)}catch(f){console.warn("Failed to update customer balance on client:",f.message)}o&&ie(o).catch(f=>console.warn(f))}const Te=Vt?`تم تحديث الفاتورة ${Z} بنجاح`:`تم إنشاء الفاتورة ${Z} بنجاح`;window._editingInvoiceId=null,window._editingOldInvoice=null,window._editingOldLines=null,K(Te,"success");const ne=document.getElementById("inv-file-upload");if(ne&&ne.files.length>0){const f=ne.files[0];window.uploadFileToArchive(f,"sales_invoices",j,`مرفق فاتورة مبيعات رقم ${Z}`).catch(v=>console.warn(v))}closeModal("new-invoice-modal"),await loadInvoicesList()}catch(F){t.textContent=F.message,t.classList.remove("hidden"),console.error(F)}finally{window._isSavingInvoice=!1,$.disabled=!1,$.textContent="💾 حفظ وإصدار"}};window.viewInvoice=async e=>{const t=document.getElementById("view-inv-body"),o=document.getElementById("view-inv-title");openModal("view-invoice-modal"),Ot=null;const a=i=>{Ot=i;const n=i.number||i.invoiceNumber||e;o.textContent=`فاتورة: ${n}`;const s=(i.lines||i.items||[]).map((y,B)=>{const $=y.productName||y.name||"",h=y.qty||0,N=y.unitPrice!==void 0?y.unitPrice:y.price||0,r=y.discount||0,x=ve(h,N,r);return`<tr>
        <td style="padding:7px 12px;">${B+1}</td>
        <td style="padding:7px 12px;">${$}</td>
        <td style="padding:7px 12px;" class="mono">${h}</td>
        <td style="padding:7px 12px;" class="mono">${_(N)}</td>
        <td style="padding:7px 12px;" class="mono">${r}%</td>
        <td style="padding:7px 12px;" class="mono font-bold">${_(x)}</td>
      </tr>`}).join(""),p=i.subtotal||0,l=i.totalVat||i.vatAmount||0,c=i.totalWithVat||i.total||0,u=i.paidAmount!==void 0?i.paidAmount:i.paymentMethod==="cash"||i.status==="paid"?c:0,m=i.remainingAmount!==void 0?i.remainingAmount:i.status!=="paid"&&i.paymentMethod!=="cash"?Math.max(0,c-u):0,E=i.warehouseName||dt&&dt.find(y=>y.id===i.warehouseId)?.name||"—";t.innerHTML=`
      <div style="display:grid;grid-template-columns:1fr 160px;gap:20px;margin-bottom:20px;">
        <div>
          <div class="grid-3 gap-12 mb-12">
            <div><div class="section-label mb-8">رقم الفاتورة</div><div class="mono text-indigo font-bold">${n}</div></div>
            <div><div class="section-label mb-8">التاريخ</div><div>${me(i.date)}</div></div>
            <div><div class="section-label mb-8">الحالة</div>${fe(i.status)}</div>
            <div><div class="section-label mb-8">العميل</div><div class="font-semibold">${J&&J.find(y=>y.id===i.customerId)?.name||i.customerName}</div></div>
            <div><div class="section-label mb-8">المندوب</div><div>${i.repName||"—"}</div></div>
            <div><div class="section-label mb-8">المخزن</div><div>${E}</div></div>
            <div><div class="section-label mb-8">مركز التكلفة</div><div class="font-semibold text-warn">${i.costCenterName||"—"}</div></div>
          </div>
        </div>
        <!-- QR Code -->
        <div class="qr-container" id="inv-qr-container">
          <div style="font-size:10px;color:var(--text-2);text-align:center;">QR ZATCA</div>
        </div>
      </div>

      <div class="table-container mb-16">
        <table class="data-dense">
          <thead><tr>
            <th>#</th><th>الصنف</th><th>الكمية</th><th>سعر الوحدة</th><th>خصم</th><th>الإجمالي</th>
          </tr></thead>
          <tbody>${s}</tbody>
        </table>
      </div>

      <div style="display:flex;justify-content:flex-end;">
        <div class="invoice-totals" style="width:260px;">
          <div class="invoice-total-row"><span>المجموع قبل الضريبة</span><span class="mono">${_(p)}</span></div>
          <div class="invoice-total-row"><span>ضريبة القيمة المضافة</span><span class="mono text-warn">${_(l)}</span></div>
          <div class="invoice-total-row grand-total"><span>الإجمالي النهائي</span><span class="mono">${_(c)}</span></div>
          <div class="invoice-total-row"><span>المدفوع</span><span class="mono text-good">${_(u)}</span></div>
          <div class="invoice-total-row"><span>المتبقي</span><span class="mono text-bad">${_(m)}</span></div>
        </div>
      </div>`;const w=i.qrBase64||i.qrCodeData||i.zatcaQr||i.qr;w&&setTimeout(()=>qe("inv-qr-container",w),50);const C=document.getElementById("view-inv-footer");C&&(C.innerHTML=`
        <button class="btn btn-ghost" onclick="closeModal('view-invoice-modal')">إغلاق</button>
        ${i.status!=="paid"&&i.status!=="cancelled"?`<button class="btn" style="background:#16a34a;color:#fff;" onclick="markSalesAsPaidManually('${i.id}')">💵 تعيين كمدفوعة (مسددة بسند)</button>`:""}
        <button class="btn btn-secondary" onclick="window.openGoodsReceiptAckForInvoice('${i.id}')" style="background:#0284c7;color:#fff;border-color:#0284c7;font-weight:700;"><span style="margin-left:4px;">📜</span> إقرار استلام وسند لأمر</button>
        <button class="btn btn-secondary" onclick="printInvoice()">🖨️ طباعة</button>
        <button class="btn btn-lime" onclick="sendToZATCA()" id="zatca-send-btn">⚡ إرسال ZATCA</button>
      `)};if(jt.has(e)){a(jt.get(e));return}t.innerHTML='<div class="page-loading" style="min-height:150px;"><div class="loading-spinner"></div></div>';try{const i=It(O,`companies/${M}/salesInvoices`,e),n=await Et(i);if(!n.exists())throw new Error("الفاتورة غير موجودة");const s={id:n.id,...n.data()};jt.set(e,s),a(s)}catch(i){t.innerHTML=`<div class="alert bad">${i.message}</div>`}};window.markSalesAsPaidManually=async e=>{if(await showConfirm("هل تريد تعيين الفاتورة كمدفوعة يدوياً؟ (سيتم تغيير الحالة فقط دون إنشاء قيد سداد مكرر)","تأكيد التغيير"))try{const{update:t}=await gt(async()=>{const{update:i}=await import("./index-CF9GFeRJ.js").then(n=>n.T);return{update:i}},__vite__mapDeps([0,1]));await t("salesInvoices",e,{status:"paid",remainingAmount:0,manuallyPaid:!0,updatedAt:new Date().toISOString()}),jt.delete(e);const{clearERPCache:o,COMPANY_ID:a}=await gt(async()=>{const{clearERPCache:i,COMPANY_ID:n}=await import("./index-CF9GFeRJ.js").then(s=>s.T);return{clearERPCache:i,COMPANY_ID:n}},__vite__mapDeps([0,1]));o(`companies/${a}/salesInvoices`),K("✅ تم تعيين الفاتورة كمدفوعة يدوياً بنجاح","success"),closeModal("view-invoice-modal"),await loadInvoicesList()}catch(t){K("خطأ: "+t.message,"error")}};window.cancelInvoice=async e=>{if(await showConfirm("هل تريد إلغاء هذه الفاتورة؟ سيتم عكس حركة المخزون وحذف القيود المحاسبية.","إلغاء الفاتورة"))try{const{getDoc:t,doc:o,collection:a,getDocs:i,query:n,where:s}=await gt(async()=>{const{getDoc:h,doc:N,collection:r,getDocs:x,query:L,where:V}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:h,doc:N,collection:r,getDocs:x,query:L,where:V}},[]),{deleteJournalEntry:p,COMPANY_ID:l}=await gt(async()=>{const{deleteJournalEntry:h,COMPANY_ID:N}=await import("./index-CF9GFeRJ.js").then(r=>r.T);return{deleteJournalEntry:h,COMPANY_ID:N}},__vite__mapDeps([0,1])),{recalculateCustomerBalance:c}=await gt(async()=>{const{recalculateCustomerBalance:h}=await import("./balance-sync-CUiyFg8g.js");return{recalculateCustomerBalance:h}},__vite__mapDeps([2,0,1])),{adjustStock:u}=await gt(async()=>{const{adjustStock:h}=await import("./index-CF9GFeRJ.js").then(N=>N.T);return{adjustStock:h}},__vite__mapDeps([0,1])),m=await t(o(O,`companies/${M}/salesInvoices`,e));if(!m.exists()){K("الفاتورة غير موجودة","error");return}const E=m.data(),w=E?.customerId,C=E.invoiceNumber||e,y=E.lines||E.items||[],B=E.warehouseId||E.sourceWarehouseId;if(B&&y.length>0){const h=[];for(const N of y){const r=N.productId||N.id,x=N.altUnit&&N.unitFactor>1&&N.selectedUnit===N.altUnit&&parseFloat(N.unitFactor)||1,L=parseFloat(N.quantity||N.qty||0)*x;r&&L>0&&h.push({warehouseId:B,productId:r,qtyDelta:L,metadata:{type:"cancel_sale",sourceType:"salesInvoice",sourceId:e,documentNumber:C,notes:`إلغاء فاتورة ${C}`}})}if(h.length>0)try{await Zt(h)}catch(N){console.warn("[cancelInvoice] Bulk stock reversal failed:",N.message)}}const $=["salesInvoice","sales","salesCOGS","salesInvoice_cogs","salesReturnCOGS","posCOGS"];for(const h of $)try{const N=await i(n(a(O,`companies/${M}/journalEntries`),s("sourceType","==",h),s("sourceId","==",C)));for(const r of N.docs)await p(r.id),console.log(`[cancelInvoice] Deleted JE ${r.id} (${h})`);if(C!==e){const r=await i(n(a(O,`companies/${M}/journalEntries`),s("sourceType","==",h),s("sourceId","==",e)));for(const x of r.docs)await p(x.id)}}catch(N){console.warn(`[cancelInvoice] JE cleanup (${h}) skipped:`,N.message)}if(E.journalEntryId)try{await p(E.journalEntryId)}catch{}await Rt("salesInvoices",e,{status:"cancelled"}),w&&await c(w).catch(()=>{}),K("✅ تم إلغاء الفاتورة وعكس المخزون والقيود","success"),await loadInvoicesList()}catch(t){K(t.message,"error")}};window.sendToZATCA=async()=>{if(Ot){K("جارٍ التوقيع والإرسال لهيئة ZATCA...","info");try{const{getFunctions:e,httpsCallable:t,connectFunctionsEmulator:o}=await gt(async()=>{const{getFunctions:p,httpsCallable:l,connectFunctionsEmulator:c}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js");return{getFunctions:p,httpsCallable:l,connectFunctionsEmulator:c}},[]),{app:a}=await gt(async()=>{const{app:p}=await import("./firebase-config.js_v_41-OnbKYOT6.js");return{app:p}},[]),i=e(a,"me-west1");(location.hostname==="localhost"||location.hostname==="127.0.0.1")&&o(i,"localhost",5001);const s=await t(i,"submitInvoiceToZATCA")({invoiceId:Ot.id});s.data.success?(K("تم توقيع الفاتورة وإرسالها إلى ZATCA بنجاح ✅","success"),closeModal("view-invoice-modal"),await loadInvoicesList()):K("فشل الربط: "+s.data.message,"error")}catch(e){K("تعذر الإرسال: "+e.message,"error")}}};window.printInvoice=async e=>{try{let l=function(g,d,T,G,A){function U(F,q){const it=new TextEncoder().encode(q);return new Uint8Array([F,it.length,...it])}const X=T?new Date(T).toISOString():new Date().toISOString(),tt=[U(1,g),U(2,d||""),U(3,X),U(4,String(G?.toFixed(2)||"0.00")),U(5,String(A?.toFixed(2)||"0.00"))],ut=new Uint8Array(tt.reduce((F,q)=>F+q.length,0));let ct=0;return tt.forEach(F=>{ut.set(F,ct),ct+=F.length}),btoa(String.fromCharCode(...ut))},t=typeof e=="object"&&e!==null?e:Ot;if(!t&&typeof e=="string"){const g=await Et(It(O,`companies/${M}/salesInvoices`,e));g.exists()&&(t={id:g.id,...g.data()})}if(!t){window.showToast&&window.showToast("يرجى اختيار الفاتورة للطباعة","warning");return}let o={name:"شركة نظم الإمداد المتطورة",vatNumber:"314996148100003",crNumber:"7054969006",phone:"0549141648",email:"Nuzmalamdad@gmail.com",logoUrl:"",street:"ينبع  الصناعية 2179",district:"حي غرناطة",city:"ينبع",buildingNo:"7689",zip:"46414",additionalNo:"2811",country:"المملكة العربية السعودية"};try{const g=JSON.parse(localStorage.getItem("idham_company")||"{}");g.name&&Object.assign(o,g)}catch{}try{const[g,d]=await Promise.all([Et(It(O,`companies/${M}/settings`,"company")),Et(It(O,`companies/${M}/settings`,"logo"))]);if(g.exists()){const T=g.data(),G=T.crNumber||T.cr||T.commercialRegistration||"";T.crNumber=G&&(G.startsWith("70")||G.startsWith("47")||G.length>=7)?G:o.crNumber||"7054969006",T.vatNumber=T.vatNumber||o.vatNumber||"314996148100003",T.name=T.name||o.name||"شركة نظم الإمداد المتطورة",Object.assign(o,T);const A=JSON.parse(localStorage.getItem("idham_company")||"{}");localStorage.setItem("idham_company",JSON.stringify({...A,...T,crNumber:o.crNumber,vatNumber:o.vatNumber,name:o.name}))}d.exists()&&d.data().dataUrl&&(o.logoUrl=d.data().dataUrl)}catch(g){console.warn("Failed to load company settings from Firestore:",g)}let a={name:t.customerName||"—",vatNumber:t.customerVat||"",phone:t.customerPhone||"",crNumber:t.customerCr||"",email:"",street:"",district:"",city:"",buildingNo:"",postalCode:"",additionalNo:"",country:"المملكة العربية السعودية",address:"",balance:0};if(t.customerId||t.customerName)try{let g=null;if(t.customerId&&(g=await Et(It(O,`companies/${M}/customers`,t.customerId)),!g.exists())){const d=lt(yt(O,`companies/${M}/customers`),W("accountId","==",t.customerId)),T=await vt(d);T.empty||(g=T.docs[0])}if((!g||!g.exists())&&t.customerName){const d=lt(yt(O,`companies/${M}/customers`),W("name","==",t.customerName)),T=await vt(d);T.empty||(g=T.docs[0])}if(g&&g.exists()){const d=g.data();Object.assign(a,d),d.name&&(a.name=d.name),(d.vatNumber||d.vat||d.taxNumber||d.taxNo||d.taxId)&&(a.vatNumber=d.vatNumber||d.vat||d.taxNumber||d.taxNo||d.taxId),(d.nationalId||d.crNumber||d.cr||d.commercialRegistration||d.idNumber)&&(a.crNumber=d.nationalId||d.crNumber||d.cr||d.commercialRegistration||d.idNumber),(d.buildingNo||d.buildingNumber)&&(a.buildingNo=d.buildingNo||d.buildingNumber),(d.additionalNo||d.additionalNumber)&&(a.additionalNo=d.additionalNo||d.additionalNumber),(d.postalCode||d.zip||d.zipCode)&&(a.postalCode=d.postalCode||d.zip||d.zipCode),(d.city||d.zone)&&(a.city=d.city||d.zone),d.street&&(a.street=d.street),d.district&&(a.district=d.district),d.balance!==void 0&&(a.balance=parseFloat(d.balance)||0)}}catch(g){console.warn("Failed to load customer data:",g)}if(a.address){const g=a.address;if(!a.buildingNo){const d=g.match(/(?:المبنى|رقم المبنى)\s*:\s*([^—\-\n,]+)/i);d&&d[1]&&(a.buildingNo=d[1].trim())}if(!a.street){const d=g.match(/(?:الشارع|شارع)\s*:\s*([^—\-\n,]+)/i);d&&d[1]&&(a.street=d[1].trim())}if(!a.district){const d=g.match(/(?:الحي|حي)\s*:\s*([^—\-\n,]+)/i);d&&d[1]&&(a.district=d[1].trim())}if(!a.city){const d=g.match(/(?:المدينة|مدينة)\s*:\s*([^—\-\n,]+)/i);d&&d[1]&&(a.city=d[1].trim())}if(!a.postalCode){const d=g.match(/(?:الرمز البريدي|الرمز|البريدي)\s*:\s*([^—\-\n,]+)/i);d&&d[1]&&(a.postalCode=d[1].trim())}if(!a.additionalNo){const d=g.match(/(?:الرقم الإضافي|الرقم الاضافي|الإضافي|الاضافي)\s*:\s*([^—\-\n,]+)/i);d&&d[1]&&(a.additionalNo=d[1].trim())}}if(!a.district&&(a.street||a.address)){const g=a.street||a.address||"";if(g.includes("حي")){const d=g.match(/(?:-|—|,|\/)?\s*(حي\s+[^,-—\/]+)/);d&&d[1]&&(a.district=d[1].trim(),a.street&&a.street.includes(d[0])&&(a.street=a.street.replace(d[0],"").trim()))}}const i=!!(a.vatNumber&&a.vatNumber.trim().length>=10),n=i?"فاتورة ضريبية":"فاتورة ضريبية مبسطة",s=i?"TAX INVOICE":"SIMPLIFIED TAX INVOICE",p=i?"فاتورة ضريبية قياسية (B2B)":"فاتورة ضريبية مبسطة (B2C)",c=l(o.name||"شركة نظم الإمداد المتطورة",o.vatNumber||"314996148100003",t.date,t.totalWithVat,t.totalVat)||t.zatcaQr||t.qrBase64||t.qrCodeData||t.qr;let u="";if(c)try{if(typeof window.QRCode<"u"){const g=document.createElement("div");new window.QRCode(g,{text:c,width:90,height:90,correctLevel:window.QRCode.CorrectLevel?window.QRCode.CorrectLevel.M:0});const d=g.querySelector("canvas"),T=g.querySelector("img");d?u=d.toDataURL("image/png"):T&&T.src&&(u=T.src)}}catch(g){console.warn("QR pre-generation error:",g)}let m=0,E=0,w=0,C=0,y=0,B=0;if(!ft||ft.length===0)try{ft=await nt(H.products())}catch{}const $=new Map((ft||[]).map(g=>[g.id,g])),h=(t.lines||t.items||[]).map((g,d)=>{const T=parseFloat(g.qty||0),G=parseFloat(g.unitPrice||g.price||0),A=parseFloat(g.discount||0),U=g.discountType||"percent";let X=0;U==="amount"?X=Math.min(T*G,Math.max(0,A)):X=T*G*(A/100);const tt=Math.max(0,T*G-X),ut=g.taxCategory==="E"||g.taxCategory==="Z"?0:15,ct=tt*(ut/100),F=tt+ct;m++,E+=T,w+=X,ut>0?C+=tt:y+=tt,B+=ct;let q=g.unit;const it=g.productName||g.name||"";if(!q||q==="Piece"||q==="PCS"||q==="حبة"){const S=g.productId?$.get(g.productId):(ft||[]).find(Bt=>Bt.name===it);S&&S.unit&&S.unit!=="Piece"&&S.unit!=="PCS"&&(q=S.unit)}const wt=!q||q==="Piece"||q==="PCS"||q==="حبة"?"كرتون":q;return`
        <tr>
          <td class="mono font-bold" style="color:#6366f1;">${d+1}</td>
          <td class="desc">
            <div class="font-bold" style="font-size:11px; color:#1e1b4b;">${it}</div>
            <div style="font-size:9px; color:#64748b;">الوحدة: <b style="color:#1e1b4b;">${wt}</b></div>
          </td>
          <td class="mono font-bold" style="font-size:11.5px;">${T}</td>
          <td class="mono">${_(G)}</td>
          <td class="mono" style="color:${A>0?"#dc2626":"#9ca3af"};">${A>0?U==="amount"?`${A} ر.س`:`${A}%`:"—"}</td>
          <td class="mono font-bold">${_(tt)}</td>
          <td class="mono" style="font-size:10px;">${ut}%</td>
          <td class="mono">${_(ct)}</td>
          <td class="mono font-bold" style="color:#1e1b4b; font-size:11.5px;">${_(F)}</td>
        </tr>
      `}).join(""),N=typeof ue=="function"?ue(t.totalWithVat||0):"",r=o.logoUrl?`<div class="logo-circle"><img src="${o.logoUrl}" alt="شعار المؤسسة" /></div>`:'<div class="logo-circle"><span class="default-logo">🏢</span></div>',x=t.number||t.invoiceNumber||t.id||"—",L=typeof JsBarcode<"u"?(()=>{const g=document.createElementNS("http://www.w3.org/2000/svg","svg");try{return JsBarcode(g,x,{format:"CODE128",width:1.2,height:32,displayValue:!1,margin:0}),g.outerHTML}catch{return""}})():"",ot=(t.items||t.lines||[]).length<=4,at=window.open("","_blank");if(!at){window.showToast&&window.showToast("يرجى السماح بالنوافذ المنبثقة للطباعة","warning");return}at.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>فاتورة ضريبية — ${x}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@500;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Cairo', system-ui, -apple-system, sans-serif; background: #f3f4f6; color: #1e293b; padding: 20px; line-height: 1.35; font-size: 11.5px; }
    
    .no-print { margin-bottom: 12px; display: flex; gap: 8px; justify-content: flex-end; }
    .btn { padding: 6px 14px; border-radius: 6px; font-family: 'Cairo', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; border: none; }
    
    .invoice-container { max-width: 210mm; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
    
    /* Top Header Bar */
    .top-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e1b4b; padding-bottom: 6px; margin-bottom: 8px; }
    .title-box h1 { font-size: 19px; font-weight: 900; color: #1e1b4b; line-height: 1.1; margin-bottom: 1px; }
    .title-box h2 { font-size: 11px; font-weight: 700; color: #6366f1; letter-spacing: 0.5px; }
    .doc-badge { display: inline-block; background: #eef2ff; color: #3730a3; border: 1px solid #c7d2fe; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-top: 3px; }
    
    /* Purple Header Banner */
    .company-banner { background: #1e1b4b !important; color: #fff !important; border-radius: 8px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .banner-meta { display: flex; flex-direction: column; gap: 2px; }
    .banner-meta .meta-line { font-size: 10.5px; display: flex; gap: 5px; color: rgba(255,255,255,0.95); }
    .banner-meta .m-lbl { opacity: 0.85; font-size: 10px; }
    .banner-meta .m-val { color: #fff; font-weight: 800; }
    
    .banner-co { text-align: left; direction: ltr; }
    .banner-co h2 { font-size: 14.5px; font-weight: 900; color: #fff !important; margin-bottom: 3px; direction: rtl; text-align: right; }
    .co-id-row { display: flex; gap: 6px; flex-wrap: wrap; direction: rtl; }
    .co-pill { background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); padding: 1px 6px; border-radius: 4px; font-size: 10px; color: #fff !important; display: inline-flex; align-items: center; gap: 4px; }
    .co-pill strong { color: #fff !important; font-size: 10.5px; }
    
    .logo-circle { width: 56px; height: 56px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 3px; border: 2px solid #6366f1; box-shadow: 0 2px 6px rgba(0,0,0,0.15); flex-shrink: 0; margin: 0 10px; }
    .logo-circle img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .logo-circle .default-logo { font-size: 24px; }
    
    /* ZATCA National Address Grid (Compact & Elegant Horizontal Layout) */
    .parties-container { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
    .party-card { border: 1.2px solid #cbd5e1; border-radius: 6px; background: #f8fafc; padding: 6px 10px; font-size: 10.5px; }
    .party-card.seller { border-color: #a5b4fc; background: #fdfcff; }
    .party-card.buyer { border-color: #cbd5e1; background: #f8fafc; }
    
    .party-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px; }
    .party-title { font-weight: 800; color: #3730a3; font-size: 11px; }
    .party-name { font-size: 12.5px; font-weight: 800; color: #0f172a; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    
    /* Dedicated Party ID Badges (CR & VAT) */
    .party-ids-row { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 4px; }
    .id-badge { background: #fff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 6px; display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; }
    .id-badge.vat-badge { border-color: #818cf8; background: #fdfcff; }
    .id-lbl { color: #475569; font-weight: 700; }
    .id-val { font-weight: 800; color: #1e1b4b; font-size: 10.5px; }
    
    .badge-vat { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 4px; }
    .badge-novat { background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 4px; }

    /* Compact Horizontal Address Matrix */
    .addr-compact-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px 6px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 4px 6px;
    }
    .addr-line-item {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 9.5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .addr-line-item .lbl { color: #64748b; font-weight: 700; }
    .addr-line-item .val { color: #1e293b; font-weight: 800; }
    .addr-line-item.full { grid-column: span 3; }
    
    /* Table Styling */
    .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; border: 1.5px solid #1e1b4b; border-radius: 6px; overflow: hidden; }
    .invoice-table thead tr { background: #1e1b4b !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .invoice-table thead th { color: #fff !important; font-size: 9.5px; font-weight: 700; padding: 5px 3px; text-align: center; border: 1px solid rgba(255,255,255,0.2); }
    .invoice-table tbody tr { border-bottom: 1px solid #e2e8f0; }
    .invoice-table tbody tr:nth-child(even) { background: #fdfcff; }
    .invoice-table tbody td { padding: 5px 4px; font-size: 10px; text-align: center; border: 1px solid #e2e8f0; color: #1f2937; }
    .invoice-table tbody td.desc { text-align: right; }
    .mono { font-family: 'IBM Plex Mono', 'Courier New', monospace; }
    .font-bold { font-weight: 700; }
    
    /* Tafqeet Amount Strip */
    .tafqeet-strip { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 6px; padding: 5px 10px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; }
    .tafqeet-text { font-weight: 800; color: #3730a3; }
    .packages-count { font-size: 10px; color: #4b5563; font-weight: 600; }
    
    /* Totals & QR Section */
    .bottom-layout { display: grid; grid-template-columns: 105px 1fr 275px; gap: 8px; margin-bottom: 8px; align-items: stretch; margin-top: 10px; }
    
    .qr-box { border: 1.2px solid #cbd5e1; border-radius: 6px; padding: 4px; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    .qr-box span { font-size: 8px; color: #64748b; margin-top: 3px; font-weight: 700; }
    
    .notes-box { border: 1.2px solid #cbd5e1; border-radius: 6px; padding: 6px 8px; background: #fff; font-size: 9.5px; display: flex; flex-direction: column; justify-content: space-between; }
    .notes-title { font-weight: 800; color: #1e1b4b; margin-bottom: 2px; font-size: 10px; }
    .notes-body { color: #475569; line-height: 1.3; }
    .official-receipt-notice { margin-top: 3px; background: #fef2f2; border: 1px dashed #ef4444; border-radius: 4px; padding: 2px 5px; }
    .notice-ar { font-weight: 800; color: #991b1b; font-size: 9px; }
    .notice-en { font-size: 7.5px; color: #7f1d1d; font-weight: 600; direction: ltr; text-align: right; }
    .meta-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
    .meta-pill { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 1px 6px; font-size: 9px; font-weight: 600; }
    
    /* Totals Table - Zero Collision */
    .totals-table-wrap { border: 1.5px solid #1e1b4b; border-radius: 6px; overflow: hidden; background: #fff; }
    .totals-table { width: 100%; border-collapse: collapse; }
    .totals-table tr td { padding: 4px 8px; font-size: 10px; border-bottom: 1px solid #f1f5f9; }
    .totals-table tr td.lbl { text-align: right; color: #475569; font-weight: 600; }
    .totals-table tr td.val { text-align: left; font-family: 'IBM Plex Mono', monospace; font-weight: 700; direction: ltr; white-space: nowrap; }
    .totals-table tr.grand td { background: #1e1b4b !important; color: #fff !important; font-weight: 800; font-size: 12px; border-bottom: none; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .totals-table tr.grand td.val { color: #fff !important; }
    .totals-table tr.balance-row td { background: #f8fafc; font-size: 9.5px; color: #64748b; }
    .totals-table tr.due-row td { background: #fdfcff; font-weight: 800; color: #1e1b4b; font-size: 10.5px; }
    
    /* Signatures Section */
    .signatures-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; border-top: 1px dashed #cbd5e1; padding-top: 6px; margin-top: 4px; }
    .sig-box { border: 1px dashed #cbd5e1; border-radius: 5px; padding: 6px 10px; background: #fafafa; font-size: 9.5px; }
    .sig-title { font-weight: 800; color: #334155; margin-bottom: 14px; }
    .sig-line { border-top: 1px solid #94a3b8; padding-top: 3px; display: flex; justify-content: space-between; font-size: 9px; color: #64748b; }
    
    /* Footer */
    .footer-bar { text-align: center; padding-top: 6px; font-size: 9.5px; color: #64748b; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; margin-top: 6px; }
    
    @page { size: A4; margin: 4mm 6mm 4mm 6mm; }
    @media print {
      html, body {
        background: #fff !important;
        padding: 0 !important;
        margin: 0 !important;
        height: 100% !important;
        font-size: 10px !important;
      }
      .no-print, .toolbar { display: none !important; }
      .invoice-container {
        box-shadow: none !important;
        margin: 0 !important;
        border-radius: 0 !important;
        border: 1px solid #1e1b4b !important;
        padding: 5px 8px !important;
        max-width: 100% !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .top-header { padding-bottom: 3px !important; margin-bottom: 4px !important; }
      .title-box h1 { font-size: 16px !important; }
      .company-banner { padding: 4px 8px !important; margin-bottom: 4px !important; border-radius: 6px !important; }
      .company-banner h2 { font-size: 13px !important; }
      .logo-circle { width: 42px !important; height: 42px !important; margin: 0 4px !important; }
      .parties-container { gap: 4px !important; margin-bottom: 4px !important; }
      .party-card { padding: 3px 5px !important; font-size: 8.5px !important; }
      .party-ids-row { gap: 2px !important; margin-bottom: 2px !important; }
      .id-badge { padding: 1px 3px !important; font-size: 8px !important; }
      .addr-compact-grid { padding: 2px 4px !important; }
      .addr-line-item { font-size: 8px !important; }
      .invoice-table { margin-bottom: 4px !important; }
      .invoice-table thead th { padding: 3px 2px !important; font-size: 8.5px !important; }
      .invoice-table tbody td { padding: 2px 2px !important; font-size: 8.5px !important; }
      .tafqeet-strip { padding: 2px 5px !important; margin-bottom: 4px !important; font-size: 8.5px !important; }
      .bottom-layout { gap: 5px !important; margin-bottom: 4px !important; grid-template-columns: 80px 1fr 230px !important; }
      .qr-box { padding: 2px !important; }
      .qr-box svg, .qr-box img { max-width: 70px !important; max-height: 70px !important; }
      .notes-box { padding: 3px 5px !important; font-size: 8px !important; }
      .totals-table tr td { padding: 2px 5px !important; font-size: 8.5px !important; }
      .totals-table tr.grand td { font-size: 10px !important; padding: 2.5px 5px !important; }
      .signatures-grid { gap: 6px !important; margin-top: 3px !important; padding-top: 3px !important; }
      .sig-box { padding: 3px 5px !important; font-size: 8px !important; }
      .sig-title { margin-bottom: 6px !important; font-size: 8px !important; }
      .footer-bar { margin-top: 3px !important; padding-top: 2px !important; font-size: 8px !important; }
    }
      .no-print { display: none !important; }
      .invoice-container { max-width: 100%; box-shadow: none; border-radius: 0; border: 1px solid #1e1b4b; padding: 8px; }
      .company-banner { background: #1e1b4b !important; color: #fff !important; }
      .invoice-table thead tr { background: #1e1b4b !important; color: #fff !important; }
      .totals-table tr.grand td { background: #1e1b4b !important; color: #fff !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn" style="background:#1e1b4b;color:#fff;" onclick="window.print()">🖨️ طباعة الفاتورة A4</button>
    <button class="btn" style="background:#334155;color:#fff;" onclick="window.close()">✕ إغلاق النافذة</button>
  </div>

  <div class="invoice-container">
    <!-- Top Header with Barcode & Title -->
    <div class="top-header">
      <div class="title-box">
        <h1>${n}</h1>
        <h2>${s}</h2>
        <span class="doc-badge">${p}</span>
      </div>
      <div>
        ${L}
      </div>
    </div>

    <!-- Purple Header Banner -->
    <div class="company-banner">
      <div class="banner-meta">
        <div class="meta-line"><span class="m-lbl">رقم الفاتورة / Inv No:</span> <strong class="m-val mono">${x}</strong></div>
        <div class="meta-line"><span class="m-lbl">تاريخ الإصدار / Date:</span> <strong class="m-val mono">${t.date||"—"}</strong></div>
        <div class="meta-line"><span class="m-lbl">طريقة الدفع / Terms:</span> <strong class="m-val">${t.paymentMethod==="cash"?"نقدي (Cash)":"آجل (Credit)"}</strong></div>
        ${t.dueDate?`<div class="meta-line"><span class="m-lbl">الاستحقاق / Due:</span> <strong class="m-val mono">${t.dueDate}</strong></div>`:""}
      </div>
      ${r}
      <div class="banner-co">
        <h2>${o.name}</h2>
        <div class="co-id-row">
          <span class="co-pill">الرقم الضريبي (VAT): <strong class="mono">${o.vatNumber||"314996148100003"}</strong></span>
          <span class="co-pill">السجل التجاري (CR): <strong class="mono">${o.crNumber||"7054969006"}</strong></span>
        </div>
      </div>
    </div>

    <!-- ZATCA National Address Tabs/Cards for Seller & Buyer -->
    <div class="parties-container">
      <!-- Seller Box -->
      <div class="party-card seller">
        <div class="party-head">
          <span class="party-title">🏢 بيانات المورد / البائع (Seller)</span>
        </div>
        <div class="party-name">${o.name}</div>
        <div class="party-ids-row">
          <div class="id-badge">
            <span class="id-lbl">السجل التجاري (CR):</span>
            <span class="id-val mono">${o.crNumber||"7054969006"}</span>
          </div>
          <div class="id-badge vat-badge">
            <span class="id-lbl">الرقم الضريبي (VAT):</span>
            <span class="id-val mono">${o.vatNumber||"314996148100003"}</span>
          </div>
        </div>
        <div class="addr-compact-grid">
          <div class="addr-line-item"><span class="lbl">المدينة:</span> <span class="val">${o.city||"ينبع"}</span></div>
          <div class="addr-line-item"><span class="lbl">الحي:</span> <span class="val">${o.district||"حي النزهة"}</span></div>
          <div class="addr-line-item"><span class="lbl">الشارع:</span> <span class="val">${o.street||"عامر الشعبي"}</span></div>
          <div class="addr-line-item"><span class="lbl">المبنى:</span> <span class="val mono">${o.buildingNo||"7480"}</span></div>
          <div class="addr-line-item"><span class="lbl">الرمز البريدي:</span> <span class="val mono">${o.zip||o.postalCode||"46424"}</span></div>
          <div class="addr-line-item"><span class="lbl">الرقم الإضافي:</span> <span class="val mono">${o.additionalNo||"3180"}</span></div>
          <div class="addr-line-item full"><span class="lbl">الدولة:</span> <span class="val">${o.country||"المملكة العربية السعودية"}</span></div>
        </div>
      </div>

      <!-- Buyer Box -->
      <div class="party-card buyer">
        <div class="party-head">
          <span class="party-title">👤 بيانات العميل / المشتري (Buyer)</span>
          <span class="${a.vatNumber?"badge-vat":"badge-novat"}">${a.vatNumber?"مسجل ضريبياً":"غير مسجل"}</span>
        </div>
        <div class="party-name">${a.name}</div>
        <div class="party-ids-row">
          <div class="id-badge">
            <span class="id-lbl">السجل / الهوية:</span>
            <span class="id-val mono">${a.crNumber||"—"}</span>
          </div>
          <div class="id-badge vat-badge">
            <span class="id-lbl">الرقم الضريبي (VAT):</span>
            <span class="id-val mono" style="color:${a.vatNumber?"#1e1b4b":"#6b7280"};">${a.vatNumber||"غير مسجل"}</span>
          </div>
        </div>
        <div class="addr-compact-grid">
          <div class="addr-line-item"><span class="lbl">المدينة:</span> <span class="val">${a.city||"—"}</span></div>
          <div class="addr-line-item"><span class="lbl">الحي:</span> <span class="val">${a.district||"—"}</span></div>
          <div class="addr-line-item"><span class="lbl">الشارع:</span> <span class="val">${a.street||"—"}</span></div>
          <div class="addr-line-item"><span class="lbl">المبنى:</span> <span class="val mono">${a.buildingNo||"—"}</span></div>
          <div class="addr-line-item"><span class="lbl">الرمز البريدي:</span> <span class="val mono">${a.postalCode||"—"}</span></div>
          <div class="addr-line-item"><span class="lbl">الرقم الإضافي:</span> <span class="val mono">${a.additionalNo||"—"}</span></div>
          <div class="addr-line-item full"><span class="lbl">الدولة:</span> <span class="val">${a.country||"المملكة العربية السعودية"}</span></div>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="invoice-table">
      <thead>
        <tr>
          <th style="width:30px;">م<br><span style="font-size:7.5px;">#</span></th>
          <th>الصنف والبيان<br><span style="font-size:7.5px;">Description & Packaging</span></th>
          <th style="width:50px;">الكمية<br><span style="font-size:7.5px;">Qty</span></th>
          <th style="width:70px;">سعر الوحدة<br><span style="font-size:7.5px;">Unit Price</span></th>
          <th style="width:55px;">الخصم<br><span style="font-size:7.5px;">Discount</span></th>
          <th style="width:75px;">الخاضع<br><span style="font-size:7.5px;">Taxable Base</span></th>
          <th style="width:45px;">النسبة<br><span style="font-size:7.5px;">Rate</span></th>
          <th style="width:70px;">الضريبة<br><span style="font-size:7.5px;">VAT (15%)</span></th>
          <th style="width:80px;">الإجمالي<br><span style="font-size:7.5px;">Total (Inc. VAT)</span></th>
        </tr>
      </thead>
      <tbody>
        ${h}
      </tbody>
    </table>

    <!-- Tafqeet (Amount in words) & Packaging Bar -->
    <div class="tafqeet-strip">
      <div class="tafqeet-text">
        <span>✍️ المبلغ بالحروف:</span> ${N}
      </div>
      <div class="packages-count">
        📦 إجمالي الكمية: <b class="mono">${E}</b> | عدد البنود: <b class="mono">${m}</b> صنف
      </div>
    </div>

    <!-- Bottom Layout: QR + Notes + Totals -->
    <div class="bottom-layout">
      <!-- QR Code -->
      <div class="qr-box">
        ${u?`<img src="${u}" width="86" height="86" style="display:block;margin:0 auto;border-radius:4px;" alt="ZATCA QR" />`:'<div id="qrcode-container" style="width:86px;height:86px;border:1px dashed #cbd5e1;display:flex;align-items:center;justify-content:center;font-size:9px;color:#94a3b8;">ZATCA QR</div>'}
        <span>ZATCA</span>
      </div>

      <!-- Notes & Metadata -->
      <div class="notes-box">
        <div>
          <div class="notes-title">📌 شروط وملاحظات / Notes & Terms:</div>
          <div class="notes-body">
            <div>${t.notes||"البضاعة المباعة لا ترد ولا تستبدل إلا بموجب الفاتورة الأصلية وخلال المدة النظامية."}</div>
            <div class="official-receipt-notice">
              <div class="notice-ar">⚠️ لا تعتبر هذه الفاتورة محصلة إلا بموجب سند قبض رسمي</div>
              <div class="notice-en">The invoice is not considered collected except with an official receipt</div>
            </div>
          </div>
        </div>
        <div class="meta-tags">
          ${t.repName?`<span class="meta-pill">👤 المندوب: <b>${t.repName}</b></span>`:""}
          ${t.warehouseName?`<span class="meta-pill">🏢 المستودع: <b>${t.warehouseName}</b></span>`:""}
          <span class="meta-pill">🕒 وقت الطباعة: <b>${new Date().toLocaleTimeString("ar-SA")}</b></span>
        </div>
      </div>

      <!-- Totals Box (Zero Overlap Guaranteed) -->
      <div class="totals-table-wrap">
        <table class="totals-table">
          ${y>0?`
          <tr>
            <td class="lbl">الخاضع للضريبة (15%):</td>
            <td class="val">${_(C)}</td>
          </tr>
          <tr>
            <td class="lbl" style="color:#059669;">معفى / غير خاضع (0%):</td>
            <td class="val" style="color:#059669;">${_(y)}</td>
          </tr>
          <tr>
            <td class="lbl">المجموع قبل الضريبة (Subtotal):</td>
            <td class="val">${_(t.subtotal||C+y)}</td>
          </tr>`:`
          <tr>
            <td class="lbl">المجموع قبل الضريبة (Taxable):</td>
            <td class="val">${_(t.subtotal||0)}</td>
          </tr>`}
          ${(t.discountTotal||w)>0?`
          <tr>
            <td class="lbl" style="color:#dc2626;">إجمالي الخصم (Discount):</td>
            <td class="val" style="color:#dc2626;">- ${_(t.discountTotal||w)}</td>
          </tr>`:""}
          <tr>
            <td class="lbl">ضريبة القيمة المضافة (15% VAT):</td>
            <td class="val">${_(t.totalVat!==void 0?t.totalVat:t.vatAmount!==void 0?t.vatAmount:B)}</td>
          </tr>
          <tr class="grand">
            <td class="lbl">الإجمالي شامل الضريبة (Grand Total):</td>
            <td class="val font-bold">${_(t.totalWithVat!==void 0?t.totalWithVat:t.total||0)}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Signatures & Acceptance Strip -->
    <div class="signatures-grid">
      <div class="sig-box">
        <div class="sig-title">✍️ استلام واعتماد العميل (Received & Accepted By):</div>
        <div class="sig-line">
          <span>اسم المستلم: ______________________</span>
          <span>التوقيع والختم: ________________</span>
        </div>
      </div>
      <div class="sig-box">
        <div class="sig-title">🚚 تسليم المندوب / السائق (Delivered By):</div>
        <div class="sig-line">
          <span>المندوب: <b>${t.repName||"سائق المؤسسة"}</b></span>
          <span>التوقيع: ____________________</span>
        </div>
      </div>
    </div>

    <!-- Footer Bar -->
    <div class="footer-bar">
      <div>📞 الهاتف: <b>${o.phone||"0549141648"}</b> | ✉️ البريد: <b>${o.email||"Nuzmalamdad@gmail.com"}</b></div>
      <div>شكراً لتعاملكم معنا — ${o.name}</div>
    </div>
  </div>
</body>
</html>`),at.document.close()}catch(t){console.error("[printInvoice] Error:",t),window.showToast&&window.showToast("خطأ أثناء الطباعة: "+t.message,"error")}};window.exportInvoices=async()=>{window.exportInvoicesExcel()};window.exportInvoicesExcel=async()=>{try{K("جاري تجهيز ملف Excel…","info");const t=(await nt(H.salesInvoices(),[bt("createdAt","desc")])).map(o=>[o.number||"",o.date||"",o.customerName||"",o.repName||"",o.paymentMethod||"",o.subtotal||0,o.discountTotal||0,o.totalVat||0,o.totalWithVat||0,o.status||"",o.notes||""]);await Re({title:"فواتير_المبيعات",headers:["رقم الفاتورة","التاريخ","العميل","المندوب","طريقة الدفع","المجموع قبل الخصم","إجمالي الخصم","ضريبة 15%","الإجمالي شامل الضريبة","الحالة","ملاحظات"],rows:t,colWidths:[18,14,26,18,14,16,16,14,18,12,28]}),K(`تم تصدير ${t.length} فاتورة ✅`,"success")}catch(e){K("خطأ: "+e.message,"error")}};window.editInvoice=async e=>{try{const t=await Gt("salesInvoices",e);if(!t){K("لم يتم العثور على الفاتورة","error");return}const o=t.lines||t.items||[];window._editingInvoiceId=e,window._editingInvoiceVersion=t.version||1,window._editingOldInvoice=t,window._editingOldLines=JSON.parse(JSON.stringify(o)),await ee(),document.getElementById("inv-number").value=t.number||t.invoiceNumber||"",document.getElementById("customer-search").value=t.customerName||"",document.getElementById("customer-id").value=t.customerId||"",document.getElementById("inv-date").value=t.date||ht(),document.getElementById("inv-payment").value=t.paymentMethod||"credit",document.getElementById("inv-paid-amount").value=t.paidAmount!==void 0?t.paidAmount:"",document.getElementById("inv-notes").value=t.notes||"",document.getElementById("inv-type").value=t.invoiceType||"standard",document.getElementById("inv-form-error")?.classList.add("hidden");const a=document.getElementById("inv-global-discount-val"),i=document.getElementById("inv-global-discount-type");if(a&&(a.value=t.globalDiscountValue||(t.globalDiscountAmount?t.globalDiscountAmount:"0")),i&&(i.value=t.globalDiscountType||"amount"),b=t.customerId?{id:t.customerId,name:t.customerName,type:t.customerType||"retail"}:null,t.customerId&&J){const c=J.find(u=>u.id===t.customerId);c&&(b={...c,...b})}const n=document.getElementById("donation-badge");t.customerId==="005"||(t.customerName||"").includes("سلة البركة")?(n&&(n.textContent="🎁 عميل تبرعات (معفى من الضريبة وتكلفتها مصروف تبرعات)",n.classList.remove("hidden")),document.getElementById("credit-status-bar")?.classList.add("hidden"),document.getElementById("inv-aging-alert")?.classList.add("hidden")):n&&n.classList.add("hidden"),await Yt(),document.getElementById("inv-rep").value=t.repId||"",await de(),document.getElementById("inv-warehouse").value=t.warehouseId||"",await Ce();const p=document.getElementById("inv-cost-center");p&&(p.value=t.costCenterId||"",p.value||window.autoSelectCostCenter()),I=o.map(c=>{const u=ft.find($=>$.id===c.productId),m=c.unit||u?.unit||"PCS",E=c.altUnit||u?.altUnit||"",w=parseFloat(c.unitFactor||u?.unitFactor)||1,C=c.selectedUnit||m,y=c.unitPrice!==void 0?parseFloat(c.unitPrice):parseFloat(c.price)||0,B=c.basePricePerUnit||(C===E?y:w>1?parseFloat((y*w).toFixed(4)):y);return{productId:c.productId,productName:c.productName||c.name||u?.name||"",qty:parseFloat(c.qty)||1,unit:m,altUnit:E,unitFactor:w,selectedUnit:C,basePricePerUnit:B,unitCode:c.unitCode||"PCE",unitPrice:y,discount:parseFloat(c.discount)||0,discountType:c.discountType||"percent",taxCategory:c.taxCategory||"S",sku:c.sku||u?.sku||"",costPrice:u&&(u.averageCost||u.costPrice||u.lastPurchasePrice||u.avgCostPrice)?u.averageCost||u.costPrice||u.lastPurchasePrice||u.avgCostPrice:c.averageCost||c.costPrice||0,averageCost:u&&(u.averageCost||u.costPrice||u.lastPurchasePrice||u.avgCostPrice)?u.averageCost||u.costPrice||u.lastPurchasePrice||u.avgCostPrice:c.averageCost||c.costPrice||0,batchNumber:c.batchNumber||"",expiryDate:c.expiryDate||"",availableBatches:[],isCustom:!!c.isCustom||String(c.productId||"").startsWith("adhoc_")}}),I.forEach((c,u)=>{window.resolveLineBatches(u)}),Y(),pt(),Xt(),te();const l=document.getElementById("save-inv-btn");l&&(l.textContent="💾 تحديث الفاتورة"),openModal("new-invoice-modal")}catch(t){K(t.message,"error")}};window.deleteInvoice=async(e,t)=>{if(await showConfirm(`هل أنت متأكد من حذف الفاتورة "${t}" نهائياً؟`,"تأكيد حذف الفاتورة"))try{const o=await Gt("salesInvoices",e);if(!o)throw new Error("لم يتم العثور على الفاتورة");await _e(o);const a=o.lines||o.items||[];if(a.length>0&&o.warehouseId&&o.status!=="cancelled"){const s=a.map(p=>{const l=(parseFloat(p.qty)||0)*(p.altUnit&&p.unitFactor>1&&p.selectedUnit===p.altUnit&&parseFloat(p.unitFactor)||1);return{warehouseId:o.warehouseId,productId:p.productId,qtyDelta:l,metadata:{type:"sale_reverse",refId:o.number||o.invoiceNumber||e,documentNumber:o.number||o.invoiceNumber||e,invoiceNumber:o.number||o.invoiceNumber||e,notes:`حذف الفاتورة ${o.number||o.invoiceNumber||e}`,batchNumber:p.batchNumber||"",expiryDate:p.expiryDate||""}}});if(s.length>0)try{await Zt(s)}catch(p){console.warn("Stock reversal failed on delete:",p.message)}}const i=o.invoiceNumber||o.number||e,n=["salesInvoice","sales","salesCOGS","salesInvoice_cogs","salesReturnCOGS","posCOGS"];for(const s of n)try{const p=await vt(lt(yt(O,`companies/${M}/journalEntries`),W("sourceType","==",s),W("sourceId","==",i)));for(const l of p.docs)await Tt(l.id),console.log(`[deleteInvoice] Deleted JE ${l.id} (${s}) for ${i}`);if(i!==e){const l=await vt(lt(yt(O,`companies/${M}/journalEntries`),W("sourceType","==",s),W("sourceId","==",e)));for(const c of l.docs)await Tt(c.id),console.log(`[deleteInvoice] Deleted JE ${c.id} (${s}) for raw id ${e}`)}}catch(p){console.warn(`[deleteInvoice] JE cleanup (${s}) skipped:`,p.message)}if(o.journalEntryId)try{await Tt(o.journalEntryId)}catch{}if(await we("salesInvoices",e),o.customerId){const{recalculateCustomerBalance:s}=await gt(async()=>{const{recalculateCustomerBalance:p}=await import("./balance-sync-CUiyFg8g.js");return{recalculateCustomerBalance:p}},__vite__mapDeps([2,0,1]));await s(o.customerId)}K(`✅ تم حذف الفاتورة ${t} بنجاح`,"success"),loadInvoicesList()}catch(o){K("خطأ في الحذف: "+o.message,"error"),console.error("deleteInvoice error:",o)}};window.openSalesInvoiceFromQuote=async e=>{await ee(),I=[];for(const i of e.items||[]){const n=ft.find(w=>w.id===i.productId),s=parseFloat(i.unitPrice)||0,p=parseFloat(i.qty)||1,l=parseFloat(i.discount)||0,c=i.unit||n?.unit||"كرتون",u=n?.altUnit||"",m=parseFloat(n?.unitFactor)||1,E=!!i.isCustom||String(i.productId||"").startsWith("adhoc_");I.push({productId:i.productId,productName:i.productName,sku:i.sku||n?.sku||(E?"بند حر":""),unit:c,altUnit:u,unitFactor:m,selectedUnit:c,basePricePerUnit:s,qty:p,unitPrice:s,discount:l,taxCategory:i.taxCategory||"S",costPrice:i.cost||n?.averageCost||n?.costPrice||n?.lastPurchasePrice||0,isCustom:E})}if(b=null,window._editingInvoiceId=null,e.customerId&&e.customerId!=="general"){const i=(J||[]).find(n=>n.id===e.customerId);i?b=i:b={id:e.customerId,name:e.customerName}}const t=document.getElementById("save-inv-btn");t&&(t.textContent="💾 حفظ وإصدار الفاتورة"),document.getElementById("inv-number").value="جارٍ التوليد…",document.getElementById("customer-search").value=e.customerName||"",document.getElementById("customer-id").value=e.customerId&&e.customerId!=="general"?e.customerId:"",document.getElementById("inv-date").value=ht(),document.getElementById("inv-payment").value="credit",document.getElementById("inv-paid-amount").value="",document.getElementById("credit-status-bar").classList.add("hidden"),document.getElementById("inv-aging-alert")?.classList.add("hidden"),document.getElementById("donation-badge")?.classList.add("hidden"),document.getElementById("inv-form-error").classList.add("hidden");const o=document.getElementById("inv-global-discount-val"),a=document.getElementById("inv-global-discount-type");o&&(o.value="0"),a&&(a.value="amount"),Xt(),te(),Y(),pt(),setTimeout(()=>{const i=document.getElementById("inv-notes");i&&(i.value=`محولة من عرض سعر رقم ${e.quoteNumber||""}${e.notes?" | "+e.notes:""}`)},300),openModal("new-invoice-modal"),Yt(),K(`تم استيراد بنود عرض السعر ${e.quoteNumber||""} بنجاح`,"success")};window.openSalesInvoiceFromPurchase=async e=>{await ee(),I=[];for(const n of e.items||[]){const s=ft.find(l=>l.id===n.productId);let p=0;s?(p=s.salePrice||s.priceRetail||0,p||(p=(s.purchasePrice||s.costPrice||s.averageCost||0)*1.1*1.15)):p=n.unitPrice*1.1*1.15,I.push({productId:n.productId,productName:n.productName,sku:n.sku||"",unit:n.unit||"PCS",qty:n.qty||0,unitPrice:parseFloat(p)||0,discount:0,taxCategory:"S"})}b=null,window._editingInvoiceId=null;const t=document.getElementById("save-inv-btn");t&&(t.textContent="💾 حفظ وإصدار الفاتورة"),document.getElementById("inv-number").value="جارٍ التوليد…",document.getElementById("customer-search").value="",document.getElementById("customer-id").value="",document.getElementById("inv-date").value=ht(),document.getElementById("inv-payment").value="credit",document.getElementById("inv-paid-amount").value="",document.getElementById("credit-status-bar").classList.add("hidden"),document.getElementById("inv-aging-alert")?.classList.add("hidden"),document.getElementById("donation-badge")?.classList.add("hidden"),document.getElementById("inv-form-error").classList.add("hidden");const o=document.getElementById("inv-global-discount-val"),a=document.getElementById("inv-global-discount-type");o&&(o.value="0"),a&&(a.value="amount"),Xt(),te();const i=document.getElementById("inv-warehouse");i&&e.warehouseId&&(i.value=e.warehouseId),Y(),pt(),setTimeout(()=>{const n=document.getElementById("inv-notes");n&&(n.value=`محولة من فاتورة مشتريات رقم ${e.purchaseNumber||""}`)},300),openModal("new-invoice-modal"),Yt(),de(),Ce();try{const n=await ge("INV");document.getElementById("inv-number").value=n}catch{}};window.openGoodsReceiptAckForInvoice=async e=>{typeof window.openGoodsReceiptAckModal=="function"?window.openGoodsReceiptAckModal({invoiceId:e}):(await gt(()=>import("./goods-receipt-ack.js_v_1-CJv8-FcM.js"),__vite__mapDeps([3,0,1]))).openGoodsReceiptAckModal({invoiceId:e})};export{no as render};
