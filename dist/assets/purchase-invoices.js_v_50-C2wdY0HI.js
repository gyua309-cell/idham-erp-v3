const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/balance-sync-CUiyFg8g.js","assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css","assets/accounting-engine-C71tPcGM.js"])))=>i.map(i=>d[i]);
import{t as nt,g as R,C as T,B as Lt,w as Kt,f as w,d as q,a as j,e as Xt,i as Yt,j as ge,P as ye,h as Zt,m as mt,u as gt,c as te,z as _t,_ as V,N as Ut,O as Rt,J as xe,K as he,r as fe}from"./index-CF9GFeRJ.js";import{autoPurchaseJE as ee}from"./accounting-engine-C71tPcGM.js";import{ref as be,uploadBytes as ve,getDownloadURL as we}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import{orderBy as at,limit as Mt,where as bt,query as vt,getDocs as wt,getDoc as oe,doc as ne,collection as ae}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";function G(t){return{Piece:"حبة",Carton:"كرتون",Box:"صندوق",Bag:"كيس",Pack:"شد",Sack:"شوال",Bale:"بالة",Barrel:"برميل",Tray:"طبق",Gallon:"جالون",Kilogram:"كيلو",Ton:"طن",Liter:"لتر",Gram:"جرام",Can:"علبة",Bottle:"زجاجة",Meter:"متر",Tank:"تنك",Roll:"رول",Pallet:"باليت",PCS:"حبة"}[t]||t||""}window.translateUnit=G;let h=[],P=null,Ie=new Map,kt=null,$t=[],qt=[],F="date",It=!1;window.sortPurList=t=>{F===t?It=!It:(F=t,It=!(t==="date"||t==="createdAt")),loadPurchaseList()};function Z(t){return F!==t?'<span style="color:var(--text-3); font-size:10px; margin-right:4px;">⇅</span>':It?'<span style="color:var(--brand); font-size:10px; margin-right:4px;">▲</span>':'<span style="color:var(--brand); font-size:10px; margin-right:4px;">▼</span>'}window.getSortArrowPur=Z;async function Le(t,n){t.innerHTML=$e(),setTimeout(()=>{const e=document.getElementById("pur-text-filter");if(e){const a=window.debounce?window.debounce(()=>loadPurchaseList(),300):()=>loadPurchaseList();e.addEventListener("input",a)}},100),await Promise.all([Pe(),Ee(),loadPurchaseList()]),ke(),Te(),Q();const o=sessionStorage.getItem("convert_grpo_to_invoice");if(o){sessionStorage.removeItem("convert_grpo_to_invoice");try{const e=JSON.parse(o);setTimeout(()=>{window.openPurchaseModalFromGRPO(e)},150)}catch(e){console.error(e)}}}function $e(){return`
  <!-- Filter Bar -->
  <div class="filterbar">
    <div class="date-range-group"><label>من</label>
      <input type="date" id="pur-from" value="${new Date(new Date().setDate(1)).toISOString().split("T")[0]}"
        onchange="loadPurchaseList()" />
    </div>
    <div class="date-range-group"><label>إلى</label>
      <input type="date" id="pur-to" value="${nt()}" onchange="loadPurchaseList()" />
    </div>
    <div class="filterbar-divider"></div>
    <div class="filter-select-group"><label>المورد</label>
      <select id="pur-supplier-filter" onchange="loadPurchaseList()">
        <option value="">الكل</option>
      </select>
    </div>
    <div class="filter-select-group"><label>المستودع</label>
      <select id="pur-warehouse-filter" onchange="loadPurchaseList()">
        <option value="">كل المستودعات</option>
      </select>
    </div>
    <div class="filter-select-group"><label>الحالة</label>
      <select id="pur-status-filter" onchange="loadPurchaseList()">
        <option value="">الكل</option>
        <option value="posted">مرحلة</option>
        <option value="paid">مدفوعة</option>
        <option value="partial">جزئي</option>
        <option value="cancelled">ملغاة</option>
      </select>
    </div>
    <div class="filter-select-group"><label>نوع الضريبة</label>
      <select id="pur-tax-type-filter" onchange="loadPurchaseList()">
        <option value="">كل الفواتير</option>
        <option value="taxable">🏢 فواتير ضريبية (15%)</option>
        <option value="non_tax">🟢 فواتير غير ضريبية (0%)</option>
      </select>
    </div>
    <div style="margin-right:auto; display:flex; gap:8px;">
      <button class="btn-export" onclick="exportPagePDF('.data-dense','فواتير_المشتريات')" title="تصدير PDF"><span>📄</span> PDF</button>
      <button class="btn-export excel" onclick="exportPageExcel('.data-dense','فواتير_المشتريات')" title="تصدير Excel"><span>📊</span> Excel</button>
      <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
      <button class="btn btn-warning btn-sm" onclick="generatePurchaseOrder()" title="أمر شراء / طلب عرض سعر" style="background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;box-shadow:0 2px 8px rgba(249,115,22,0.3);">📋 أمر شراء</button>
      <button class="btn btn-primary" onclick="openPurchaseModal()">＋ فاتورة شراء جديدة</button>
    </div>
  </div>

  <div class="page-content">
    <div class="page-header">
      <h1 class="page-title">📦 فواتير المشتريات</h1>
      <p class="page-subtitle" id="pur-count"></p>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid mb-20">
      <div class="kpi-card g-orange">
        <div class="kpi-icon">🛒</div>
        <div class="kpi-content"><div class="kpi-label">إجمالي المشتريات</div>
          <div class="kpi-value mono" id="pur-kpi-total">—</div></div></div>
      <div class="kpi-card g-purple">
        <div class="kpi-icon">⏳</div>
        <div class="kpi-content"><div class="kpi-label">المستحق للموردين</div>
          <div class="kpi-value mono" id="pur-kpi-unpaid">—</div></div></div>
      <div class="kpi-card g-green">
        <div class="kpi-icon">✅</div>
        <div class="kpi-content"><div class="kpi-label">مدفوع</div>
          <div class="kpi-value mono" id="pur-kpi-paid">—</div></div></div>
      <div class="kpi-card g-blue">
        <div class="kpi-icon">🔢</div>
        <div class="kpi-content"><div class="kpi-label">عدد الفواتير</div>
          <div class="kpi-value mono" id="pur-kpi-count">—</div></div></div>
    </div>

    <div class="card">
      <div class="table-container">
        <table class="data-dense">
          <thead><tr>
            <th onclick="sortPurList('number')" style="cursor:pointer; user-select:none;">رقم الفاتورة ${Z("number")}</th>
            <th onclick="sortPurList('date')" style="cursor:pointer; user-select:none;">التاريخ ${Z("date")}</th>
            <th onclick="sortPurList('supplierName')" style="cursor:pointer; user-select:none;">المورد ${Z("supplierName")}</th>
            <th onclick="sortPurList('warehouseName')" style="cursor:pointer; user-select:none;">المخزن ${Z("warehouseName")}</th>
            <th onclick="sortPurList('subtotal')" style="cursor:pointer; user-select:none;">المجموع قبل VAT ${Z("subtotal")}</th>
            <th onclick="sortPurList('totalVat')" style="cursor:pointer; user-select:none;">VAT 15% ${Z("totalVat")}</th>
            <th onclick="sortPurList('totalWithVat')" style="cursor:pointer; user-select:none;">الإجمالي ${Z("totalWithVat")}</th>
            <th onclick="sortPurList('status')" style="cursor:pointer; user-select:none;">الحالة ${Z("status")}</th>
            <th onclick="sortPurList('journalEntryId')" style="cursor:pointer; user-select:none;">قيد ${Z("journalEntryId")}</th>
            <th></th>
          </tr></thead>
          <tbody id="pur-tbody">
            ${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(10).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- ═══════════ NEW PURCHASE INVOICE MODAL (WORLD-CLASS ENTERPRISE) ═══════════ -->
  <!-- ═══════════ NEW PURCHASE INVOICE MODAL (TRUE FULLSCREEN COCKPIT) ═══════════ -->
  <div class="modal-overlay" id="purchase-modal" onclick="if(event.target===this)closeModal('purchase-modal')">
    <style>
      #purchase-modal {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        padding: 0 !important;
        margin: 0 !important;
        background: rgba(15, 23, 42, 0.82) !important;
        z-index: 9999 !important;
        display: flex !important;
        align-items: stretch !important;
        justify-content: stretch !important;
      }
      #purchase-modal .modal-xl {
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
      #purchase-modal .no-spin::-webkit-outer-spin-button,
      #purchase-modal .no-spin::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0 !important;
      }
      #purchase-modal .no-spin {
        -moz-appearance: textfield !important;
      }
      #purchase-modal input:focus, #purchase-modal select:focus {
        outline: 2px solid #2563eb !important;
        outline-offset: -1px !important;
        background-color: #eff6ff !important;
      }
      #pur-lines-tbody tr:hover {
        background-color: #f1f5f9 !important;
      }
      .pur-hud-pill {
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
      .pur-hud-pill b {
        font-family: monospace;
        font-size: 12.5px;
        font-weight: 800;
      }
    </style>
    <div class="modal modal-xl">
      
      <!-- Modal Header (Crisp Light Theme 44px) -->
      <div class="modal-header" style="height:44px; padding:6px 18px; border-bottom:1.5px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; background:#ffffff; color:#0f172a; flex-shrink:0; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:20px;">🏢</span>
          <h3 class="modal-title" id="pur-modal-title" style="margin:0; font-size:15px; font-weight:900; color:#0f172a;">
            فاتورة مشتريات وتوريد بضاعة
          </h3>
          <span class="badge" style="background:#e0e7ff; color:#3730a3; font-weight:800; font-size:10.5px; padding:2px 7px; border:1px solid #c7d2fe;">
            ⛶ شاشة كاملة
          </span>
          <span class="badge" id="pur-live-badge-status" style="background:#dcfce7; color:#15803d; font-weight:800; font-size:11px; padding:2px 8px; border:1px solid #bbf7d0;">
            📝 فاتورة جديدة
          </span>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <!-- Invoice Tax Type Selector -->
          <div style="display:inline-flex; background:#f1f5f9; padding:2px; border-radius:6px; border:1px solid #cbd5e1; gap:2px;">
            <button type="button" id="pur-type-btn-taxable" class="btn btn-sm btn-primary" onclick="setPurchaseInvoiceType('taxable')" style="padding:3px 10px; font-size:11px; font-weight:800; border-radius:4px; display:inline-flex; align-items:center; gap:4px; cursor:pointer;">
              <span>🏢</span> ضريبية (15%)
            </button>
            <button type="button" id="pur-type-btn-nontax" class="btn btn-sm btn-ghost" onclick="setPurchaseInvoiceType('non_tax')" style="padding:3px 10px; font-size:11px; font-weight:800; border-radius:4px; display:inline-flex; align-items:center; gap:4px; color:#059669; cursor:pointer;">
              <span>🟢</span> غير ضريبية (0%)
            </button>
          </div>
          <input type="hidden" id="pur-invoice-type" value="taxable" />

          <button class="modal-close" onclick="closeModal('purchase-modal')" style="color:#64748b; font-size:24px; line-height:1; padding:0 6px; background:transparent; border:none; cursor:pointer; font-weight:700;">×</button>
        </div>
      </div>

      <!-- Modal Body (Flex 1, No outer scroll) -->
      <div class="modal-body" style="padding:8px 12px; overflow:hidden; flex:1 1 0%; min-height:0; display:flex; flex-direction:column; gap:6px; background:#f1f5f9;">
        
        <!-- Pinned Supplier Warning Alert -->
        <div id="sup-warning-alert" class="alert bad hidden" style="margin:0; padding:6px 10px; font-size:11.5px; font-weight:800; border-radius:6px; display:flex; align-items:center; gap:8px;"></div>

        <!-- Section 1: Compact Ergonomic Meta Bar (Single Row ~40px) -->
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:6px 10px; box-shadow:0 1px 3px rgba(0,0,0,0.04); flex-shrink:0;">
          <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
            
            <div style="width:110px;">
              <input type="text" id="pur-inv-number" class="form-control mono font-bold" readonly
                style="background:#f8fafc; color:#4338ca; font-size:11px; height:30px; padding:2px 6px; text-align:center;" placeholder="رقم الفاتورة" title="رقم الفاتورة بالنظام" />
            </div>

            <div style="width:125px;">
              <input type="date" id="pur-inv-date" class="form-control mono font-bold" value="${nt()}"
                style="height:30px; padding:2px 6px; font-size:11.5px; text-align:center;" title="تاريخ الفاتورة *" />
            </div>

            <div style="flex:2; min-width:210px; position:relative;">
              <div class="autocomplete-container">
                <input type="text" id="supplier-search" class="form-control font-bold"
                  placeholder="👤 ابحث بالمورد أو اختر المورد... *" autocomplete="off"
                  style="height:30px; padding:2px 10px; font-size:12px; border-color:#2563eb; background:#fff;" />
                <div class="autocomplete-results hidden" id="supplier-results" style="z-index:99999; max-height:260px; box-shadow:0 8px 24px rgba(0,0,0,0.18);"></div>
                <input type="hidden" id="supplier-id" />
              </div>
            </div>

            <button type="button" id="pur-sup-360-btn" class="btn btn-ghost sm hidden" style="font-size:10.5px; padding:0 5px; height:30px; color:#2563eb; border:1px solid #bfdbfe; background:#eff6ff;" onclick="window.viewSupplierIntelligence360(document.getElementById('supplier-id').value)">👁️ 360°</button>

            <div style="width:130px;">
              <select id="pur-warehouse" class="form-control font-bold" style="height:30px; padding:2px 6px; font-size:11.5px;" title="المخزن المستلم">
                <option value="">المخزن المستلِم *</option>
              </select>
            </div>

            <div style="width:115px;">
              <select id="pur-payment" class="form-control font-bold" style="height:30px; padding:2px 6px; font-size:11.5px;" title="طريقة السداد">
                <option value="credit">آجل (سداد لاحق)</option>
                <option value="cash">نقدي (خزينة)</option>
                <option value="transfer">تحويل بنكي</option>
                <option value="check">شيك مصرفي</option>
              </select>
            </div>

            <div style="width:130px;">
              <input type="text" id="pur-ref-num" class="form-control mono font-bold" placeholder="مرجع ورقي #..." style="height:30px; padding:2px 6px; font-size:11.5px;" title="رقم فاتورة المورد الورقية" />
            </div>

            <button type="button" id="pur-extra-details-btn" class="btn btn-secondary btn-sm" onclick="window.togglePurExtraDetails()" style="height:30px; font-size:11px; padding:0 8px; font-weight:700;" title="إظهار تفاصيل إضافية: استحقاق، ضريبة المورد، مرفق">
              ⚙️ تفاصيل إضافية
            </button>

            <button type="button" id="pur-discount-notes-btn" class="btn btn-secondary btn-sm" onclick="window.togglePurDiscountNotes()" style="height:30px; font-size:11px; padding:0 8px; font-weight:700;" title="إظهار الخصم العام ومصاريف الشحن والملاحظات">
              🏷️ خصم وملاحظات
            </button>

          </div>

          <!-- Secondary Extra Details Drawer -->
          <div id="pur-extra-details-drawer" style="display:none; margin-top:6px; padding-top:6px; border-top:1px dashed #cbd5e1; gap:10px; align-items:center; flex-wrap:wrap;">
            <div style="display:flex; align-items:center; gap:6px;">
              <label style="font-size:11px; font-weight:700; color:#475569; white-space:nowrap;">تاريخ الاستحقاق:</label>
              <input type="date" id="pur-due-date" class="form-control mono" style="height:28px; padding:2px 6px; font-size:11px; width:130px;" />
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <label style="font-size:11px; font-weight:700; color:#475569; white-space:nowrap;">ضريبة المورد (VAT):</label>
              <input type="text" id="pur-supplier-vat" class="form-control mono" placeholder="300000000000003" style="height:28px; padding:2px 6px; font-size:11px; width:140px;" />
            </div>
            <div style="display:flex; align-items:center; gap:6px; flex:1; min-width:200px;">
              <label style="font-size:11px; font-weight:700; color:#475569; white-space:nowrap;">المرفق (صورة/PDF):</label>
              <input type="file" id="pur-attachment" class="form-control" accept="image/*,application/pdf" style="height:28px; padding:1px 4px; font-size:10.5px; flex:1;" />
            </div>
          </div>

          <!-- Secondary Discount & Notes Drawer -->
          <div id="pur-discount-notes-drawer" style="display:none; margin-top:6px; padding-top:6px; border-top:1px dashed #cbd5e1; gap:10px; align-items:center; flex-wrap:wrap;">
            <div style="display:flex; align-items:center; gap:4px;">
              <label style="font-size:11px; font-weight:700; color:#475569; white-space:nowrap;">نوع الخصم:</label>
              <select id="pur-global-discount-type" class="form-control" onchange="window.syncPurGlobalDiscount('drawer')" style="height:28px; padding:2px 6px; font-size:11px; width:110px;">
                <option value="pct">نسبة (%)</option>
                <option value="amount">مبلغ مقطوع (ر.س)</option>
              </select>
              <input type="number" id="pur-global-discount-val" class="form-control mono font-bold no-spin" placeholder="0" min="0" step="0.5" oninput="window.syncPurGlobalDiscount('drawer')" style="height:28px; padding:2px 6px; font-size:11px; width:80px; text-align:center;" />
            </div>
            <div style="display:flex; align-items:center; gap:4px;">
              <label style="font-size:11px; font-weight:700; color:#475569; white-space:nowrap;">مصاريف شحن/نقل:</label>
              <input type="number" id="pur-freight-val" class="form-control mono no-spin" placeholder="0.00" min="0" step="1" oninput="window.recalcPurchaseTotals()" style="height:28px; padding:2px 6px; font-size:11px; width:90px; text-align:center;" />
            </div>
            <div style="display:flex; align-items:center; gap:4px; flex:1; min-width:220px;">
              <label style="font-size:11px; font-weight:700; color:#475569; white-space:nowrap;">ملاحظات:</label>
              <input type="text" id="pur-notes" class="form-control" placeholder="أي شروط سداد أو ملاحظات..." style="height:28px; padding:2px 8px; font-size:11px; flex:1;" />
            </div>
          </div>

        </div>

        <!-- Section 2: Search & Smart Action Toolbar (Compact ~36px) -->
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:4px 8px; box-shadow:0 1px 3px rgba(0,0,0,0.04); flex-shrink:0; display:flex; gap:8px; align-items:center; justify-content:space-between; flex-wrap:wrap;">
          <div style="display:flex; gap:6px; flex:1; min-width:320px; align-items:center;">
            <select id="pur-product-category-filter" class="form-control" style="width:130px; height:32px; font-size:11.5px; padding:2px 6px;">
              <option value="">كل الفئات</option>
            </select>
            <div class="autocomplete-container" style="flex:1; position:relative;">
              <input type="text" id="pur-product-search" class="form-control"
                placeholder="🔍 ابحث بالاسم أو امسح الباركود لإضافة الصنف فوراً... [اضغط Enter للعودة هنا بعد كتابة الكمية]" autocomplete="off"
                style="height:32px; font-size:12.5px; font-weight:700; padding:2px 10px; background:#fff; border-color:#2563eb;" />
              <div class="autocomplete-results hidden" id="pur-product-results" style="z-index:99999; max-height:280px; box-shadow:0 10px 30px rgba(0,0,0,0.18);"></div>
            </div>
            <span class="badge" id="pur-items-badge" style="font-size:11px; background:#e0e7ff; color:#3730a3; font-weight:800; padding:4px 8px; white-space:nowrap;">0 صنف</span>
          </div>

          <div style="display:flex; gap:5px; align-items:center; flex-wrap:wrap;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.openImportPOModal()" title="استيراد من أمر شراء" style="font-size:11px; padding:3px 7px; height:30px;">
              📋 أمر شراء PO
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.openImportQuoteModal()" title="استيراد من عرض سعر مورد" style="font-size:11px; padding:3px 7px; height:30px;">
              📑 عرض سعر
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.openImportDeliveryModal()" title="استيراد من شحنة واردة" style="font-size:11px; padding:3px 7px; height:30px;">
              🚚 شحنة واردة
            </button>
            <button type="button" class="btn btn-secondary btn-sm" style="color:#059669; font-size:11px; padding:3px 8px; height:30px; font-weight:700; background:rgba(16,185,129,0.08); border-color:rgba(16,185,129,0.3);" onclick="window.openQuickProductModal()" title="إضافة صنف جديد سريع">
              + صنف جديد
            </button>
          </div>
        </div>

        <!-- Section 3: THE MAIN ITEMS TABLE (Maximized Screen Real Estate) -->
        <div class="table-container" style="border:1.5px solid #cbd5e1; border-radius:8px; flex:1 1 0%; min-height:0; overflow-y:auto; overflow-x:auto; background:#fff; box-shadow:inset 0 1px 3px rgba(0,0,0,0.04);">
          <table class="data-dense" style="margin:0; font-size:12px; width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:#f8fafc; color:#1e293b; position:sticky; top:0; z-index:10; border-bottom:2px solid #cbd5e1; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <th style="width:30px; text-align:center; padding:8px 4px; color:#475569; font-weight:800;">#</th>
                <th style="width:90px; padding:8px 6px; color:#334155; font-weight:800;">كود الصنف</th>
                <th style="padding:8px 8px; text-align:right; color:#0f172a; font-weight:900; min-width:240px;">اسم الصنف</th>
                <th style="width:105px; padding:8px 4px; text-align:center; color:#334155; font-weight:800;">الوحدة</th>
                <th style="width:85px; text-align:center; padding:8px 4px; color:#0284c7; font-weight:900;">الكمية</th>
                <th style="width:80px; text-align:center; padding:8px 4px; color:#059669; font-weight:900;" title="كميات إضافية مجانية ممنوحة من المورد">🎁 بونص</th>
                <th style="width:95px; text-align:left; padding:8px 4px; color:#334155; font-weight:800;">السعر</th>
                <th style="width:105px; text-align:center; padding:8px 4px; color:#dc2626; font-weight:900;" title="الخصم للبند: نسبة مئوية (%) أو مبلغ نقدي (ر.س)">الخصم</th>
                <th style="width:95px; text-align:left; padding:8px 6px; color:#4338ca; font-weight:900;" title="صافي تكلفة الوحدة بعد الخصم">صافي الوحدة</th>
                <th style="width:90px; padding:8px 4px; color:#334155; font-weight:800;">التشغيلة</th>
                <th style="width:105px; padding:8px 4px; color:#334155; font-weight:800;">الانتهاء</th>
                <th style="width:65px; text-align:center; padding:8px 4px; color:#334155; font-weight:800;">VAT</th>
                <th style="width:110px; text-align:left; padding:8px 8px; color:#1e40af; font-weight:900;">الإجمالي</th>
                <th style="width:36px; padding:8px 2px; text-align:center;"></th>
              </tr>
            </thead>
            <tbody id="pur-lines-tbody"></tbody>
          </table>
        </div>

        <div id="pur-form-error" class="alert bad hidden" style="margin:0; padding:6px 10px; font-size:11.5px;"></div>

      </div>

      <!-- Section 4: FIXED BOTTOM HUD BAR (Crisp High-Contrast Light Theme) -->
      <div class="modal-footer" style="height:54px; padding:0 16px; background:#ffffff; border-top:2px solid #cbd5e1; display:flex; justify-content:space-between; align-items:center; flex-shrink:0; box-shadow:0 -2px 10px rgba(0,0,0,0.04);">
        
        <!-- Live Totals Strip -->
        <div style="display:flex; align-items:center; gap:8px; overflow-x:auto; flex:1; margin-left:12px;">
          
          <div class="pur-hud-pill">
            <span style="color:#64748b;">قبل الخصم:</span>
            <b id="pur-gross-subtotal" style="color:#0f172a;">0.00 ر.س</b>
          </div>

          <div class="pur-hud-pill">
            <span style="color:#dc2626;">خصم البنود:</span>
            <b id="pur-line-discounts" style="color:#dc2626;">- 0.00 ر.س</b>
          </div>

          <div class="pur-hud-pill" style="display:inline-flex; align-items:center; gap:4px; background:#fff1f2; border:1.5px solid #fecdd3; padding:2px 8px; border-radius:6px;" title="خصم إضافي عام على كامل فاتورة الشراء">
            <span style="color:#dc2626; font-weight:800; font-size:11px; white-space:nowrap;">الخصم العام:</span>
            <input type="number" id="pur-hud-discount-val" class="mono font-bold no-spin" step="0.5" min="0" placeholder="0"
              style="width:58px; height:24px; padding:1px 4px; font-size:11.5px; text-align:center; border:1px solid #fda4af; border-radius:4px; background:#ffffff; color:#be123c;"
              oninput="window.syncPurGlobalDiscount('hud')" title="قيمة الخصم العام للفاتورة" />
            <select id="pur-hud-discount-type" style="height:24px; padding:0 2px; font-size:11px; font-weight:bold; border:1px solid #fda4af; border-radius:4px; background:#ffffff; color:#be123c; cursor:pointer;"
              onchange="window.syncPurGlobalDiscount('hud')" title="نوع الخصم: نسبة مئوية (%) أو مبلغ مقطوع (ر.س)">
              <option value="pct">%</option>
              <option value="amount">ر.س</option>
            </select>
            <b id="pur-global-discount-amount" style="color:#dc2626; font-size:11.5px; margin-right:4px; white-space:nowrap;">- 0.00 ر.س</b>
          </div>

          <div class="pur-hud-pill">
            <span style="color:#2563eb;">الوعاء (15%):</span>
            <b id="pur-net-taxable" style="color:#2563eb;">0.00 ر.س</b>
          </div>

          <div class="pur-hud-pill" id="pur-exempt-row">
            <span style="color:#059669;">معفى (0%):</span>
            <b id="pur-net-exempt" style="color:#059669;">0.00 ر.س</b>
          </div>

          <div class="pur-hud-pill">
            <span style="color:#d97706;">الضريبة (15%):</span>
            <b id="pur-vat" style="color:#d97706;">0.00 ر.س</b>
          </div>

          <div class="pur-hud-pill" style="display:none;">
            <b id="pur-freight-label">+ 0.00 ر.س</b>
          </div>

          <!-- Bonus & Savings Banner -->
          <div id="pur-savings-banner" class="pur-hud-pill" style="background:#ecfdf5; border-color:#a7f3d0;">
            <span style="color:#059669; font-weight:800;">🎁 بونص: </span>
            <b id="pur-total-bonus-label" style="color:#059669;">0 مجاني</b>
            <span style="color:#0284c7; font-weight:800; margin-right:4px;">| وفر: </span>
            <b id="pur-total-savings-label" style="color:#0284c7;">0.00 ر.س</b>
          </div>

          <!-- Pinned Grand Total -->
          <div style="display:inline-flex; align-items:center; gap:8px; padding:5px 16px; background:linear-gradient(135deg, #1e40af, #2563eb); border-radius:8px; border:1px solid #1d4ed8; box-shadow:0 2px 6px rgba(37,99,235,0.25);">
            <span style="font-size:12.5px; font-weight:800; color:#dbeafe;">المستحق:</span>
            <span class="mono" style="font-size:18px; font-weight:900; color:#ffffff;" id="pur-grand">0.00 ر.س</span>
          </div>

        </div>

        <!-- Action Buttons -->
        <div style="display:flex; gap:6px; align-items:center; flex-shrink:0;">
          <button class="btn btn-ghost sm" onclick="closeModal('purchase-modal')" style="color:#64748b; height:34px; font-size:12px; font-weight:700;">إلغاء</button>
          <button class="btn btn-secondary sm" onclick="printPurchasePreview()" style="height:34px; font-size:12px; padding:0 12px; background:#f8fafc; border:1.5px solid #cbd5e1; color:#0f172a; font-weight:800;">🖨️ طباعة</button>
          <button class="btn btn-warning sm" onclick="generatePurchaseOrder()" style="height:34px; font-size:12px; padding:0 12px; background:linear-gradient(135deg,#f97316,#ea580c); color:#fff; border:none; font-weight:800;">📋 أمر شراء</button>
          <button class="btn btn-primary" onclick="savePurchase()" id="save-pur-btn" style="height:36px; padding:0 20px; font-weight:900; font-size:13px; background:linear-gradient(135deg,#2563eb,#1d4ed8); box-shadow:0 2px 6px rgba(37,99,235,0.3);">
            💾 حفظ واعتماد الفاتورة
          </button>
        </div>

      </div>

    </div>
  </div>

  <!-- ═══════════ VIEW PURCHASE MODAL ═══════════ -->
  <div class="modal-overlay" id="view-purchase-modal" onclick="if(event.target===this)closeModal('view-purchase-modal')">
    <div class="modal modal-lg">
      <div class="modal-header">
        <h3 class="modal-title" id="view-pur-title">تفاصيل فاتورة الشراء</h3>
        <button class="modal-close" onclick="closeModal('view-purchase-modal')">×</button>
      </div>
      <div class="modal-body" id="view-pur-body" style="padding:20px;"></div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal('view-purchase-modal')">إغلاق</button>
        <button class="btn btn-secondary" onclick="printPurchaseInvoice()">🖨️ طباعة</button>
        <button class="btn btn-lime" id="pur-pay-btn" onclick="registerPayment()">💳 تسجيل دفعة</button>
        <button class="btn btn-warning" id="pur-restock-btn" onclick="reapplyPurchaseStock()" title="إعادة تطبيق المخزون والقيود يدوياً" style="background:linear-gradient(135deg,#7C3AED,#5B21B6);color:#fff;">🔄 تحديث المخزون والقيود</button>
        <button class="btn btn-ghost text-bad" id="pur-cancel-btn" onclick="cancelCurrentPurchase()" style="margin-right:auto;">🚫 إلغاء الفاتورة</button>
      </div>

    </div>
  </div>`}async function Pe(){try{const t=document.getElementById("pur-supplier-filter");if(t){t.innerHTML='<option value="">الكل</option>';const n=await R(T.suppliers());n.sort((o,e)=>(o.name||"").localeCompare(e.name||"")),n.forEach(o=>{t.innerHTML+=`<option value="${o.id}">${o.name}</option>`})}}catch(t){console.error("loadSuppliersDropdown failed:",t)}}async function Ee(){try{const t=await R(T.warehouses());t.sort((e,a)=>(e.name||"").localeCompare(a.name||""));const n=document.getElementById("pur-warehouse");n&&(n.innerHTML='<option value="">اختر المستودع...</option>',t.forEach(e=>n.innerHTML+=`<option value="${e.id}" data-name="${e.name}">${e.name}</option>`));const o=document.getElementById("pur-warehouse-filter");o&&(o.innerHTML='<option value="">كل المستودعات</option>',t.forEach(e=>o.innerHTML+=`<option value="${e.id}">${e.name}</option>`))}catch(t){console.error("loadWarehousesPurchase failed:",t)}try{const t=await Lt("PUR"),n=document.getElementById("pur-inv-number");n&&(n.value=t)}catch{}}window.loadPurchaseList=async()=>{const t=document.getElementById("pur-tbody");if(t){t.innerHTML=`${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(10).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;try{const n=[at("createdAt","desc"),Mt(1e3)],o=document.getElementById("pur-status-filter")?.value;o&&n.unshift(bt("status","==",o));const e=vt(T.purchaseInvoices(),...n);let i=(await wt(e)).docs.map(l=>({id:l.id,...l.data()}));i.forEach(l=>Ie.set(l.id,l));const r=document.getElementById("pur-from")?.value,s=document.getElementById("pur-to")?.value;(r||s)&&(i=i.filter(l=>{const p=l.date||(l.createdAt?.toDate?l.createdAt.toDate().toISOString().split("T")[0]:"");return(!r||p>=r)&&(!s||p<=s)}));const c=document.getElementById("pur-supplier-filter")?.value;c&&(i=i.filter(l=>l.supplierId===c));const f=document.getElementById("pur-warehouse-filter")?.value;f&&(i=i.filter(l=>l.warehouseId===f));const b=document.getElementById("pur-tax-type-filter")?.value;b==="non_tax"?i=i.filter(l=>l.invoiceType==="non_tax"||l.isTaxExempt||l.totalVat===0&&(l.exemptSubtotal>0||l.totalWithVat>0&&l.totalVat===0)):b==="taxable"&&(i=i.filter(l=>l.invoiceType!=="non_tax"&&!l.isTaxExempt&&(l.totalVat>0||!l.exemptSubtotal&&l.taxableSubtotal>0))),F&&i.sort((l,p)=>{let m=l[F],u=p[F];return F==="createdAt"?(m=l.createdAt?.seconds||0,u=p.createdAt?.seconds||0):F==="date"?(m=l.date||(l.createdAt?.toDate?l.createdAt.toDate().toISOString().split("T")[0]:""),u=p.date||(p.createdAt?.toDate?p.createdAt.toDate().toISOString().split("T")[0]:"")):F==="supplierName"?(m=l.supplierName||"",u=p.supplierName||""):F==="warehouseName"?(m=l.warehouseName||"",u=p.warehouseName||""):F==="subtotal"||F==="totalVat"||F==="totalWithVat"?(m=Number(m||0),u=Number(u||0)):F==="number"?(m=l.number||"",u=p.number||""):F==="status"?(m=l.status||"",u=p.status||""):F==="journalEntryId"&&(m=l.journalEntryId?1:0,u=p.journalEntryId?1:0),typeof m=="string"?It?m.localeCompare(u):u.localeCompare(m):It?m-u:u-m});const y=i.filter(l=>l.status!=="cancelled"),g=y.reduce((l,p)=>l+(p.totalWithVat||0),0);let I=0;try{const l=[...new Set(y.map(p=>p.supplierId).filter(Boolean))];if(l.length>0){const m=(await Promise.all(l.map(u=>oe(ne(q,`companies/${j}/suppliers`,u)).then(v=>v.exists()?Math.max(0,v.data().balance||0):0).catch(()=>0)))).reduce((u,v)=>u+v,0);I=Math.min(m,g)}}catch(l){console.warn("[KPI] supplier balance fetch failed, falling back to status:",l.message),I=y.reduce((p,m)=>{const u=(m.status||"").toLowerCase();return u==="paid"||u==="cash"?p:u==="partial"?p+Math.max(0,(m.totalWithVat||0)-(m.paidAmount||0)):p+(m.totalWithVat||0)},0)}const x=Math.max(0,g-I);if(document.getElementById("pur-kpi-total").textContent=w(g),document.getElementById("pur-kpi-unpaid").textContent=w(I),document.getElementById("pur-kpi-paid").textContent=w(x),document.getElementById("pur-kpi-count").textContent=i.length,document.getElementById("pur-count").textContent=`${i.length} فاتورة`,i.length===0){t.innerHTML=`<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--text-2);">
        لا توجد فواتير في الفترة المحددة</td></tr>`;return}t.innerHTML=i.map(l=>{const p=l.invoiceType==="non_tax"||l.isTaxExempt||l.totalVat===0&&(l.exemptSubtotal>0||l.totalWithVat>0&&l.totalVat===0),m=p?'<span class="badge" style="background:rgba(16,185,129,0.12); color:#059669; font-size:10px; font-weight:700; border:1px solid rgba(16,185,129,0.25); display:block; margin-top:3px; width:fit-content;">🟢 غير ضريبية</span>':'<span class="badge" style="background:rgba(99,102,241,0.08); color:var(--brand); font-size:10px; font-weight:700; border:1px solid rgba(99,102,241,0.2); display:block; margin-top:3px; width:fit-content;">🏢 ضريبية</span>';return`
      <tr style="cursor:pointer;" onclick="viewPurchaseInvoice('${l.id}')">
        <td class="mono text-indigo">
          <strong>${l.number||l.id.slice(0,8)}</strong>
          ${m}
        </td>
        <td class="dim">${Xt(l.date||l.createdAt)}</td>
        <td class="font-semibold">${l.supplierName||"—"}</td>
        <td class="dim" style="font-size:11px;">${l.warehouseName||"—"}</td>
        <td class="mono">${w(l.subtotal||0)}</td>
        <td class="mono ${p?"text-good":"text-warn"}">${p?'<span class="dim">0% (معفى)</span>':w(l.totalVat||0)}</td>
        <td class="mono font-bold">${w(l.totalWithVat||0)}</td>
        <td>${Yt(l.status)}</td>
        <td style="font-size:11px;">${l.journalEntryId?'<span class="badge good" style="font-size:10px;">✓ مُرحَّل</span>':'<span class="badge" style="font-size:10px; background:var(--bg-3); color:var(--text-2);">—</span>'}</td>
        <td onclick="event.stopPropagation()">
          <div class="row-actions">
            <button class="btn btn-icon sm btn-ghost" onclick="viewPurchaseInvoice('${l.id}')" title="عرض">👁️</button>
            ${l.status!=="cancelled"?`<button class="btn btn-icon sm btn-ghost" onclick="editPurchaseInvoice('${l.id}')"
                  title="تعديل" style="color:var(--primary);">✏️</button>`:""}
            ${l.status!=="cancelled"&&l.status!=="paid"?`<button class="btn btn-icon sm btn-ghost" onclick="cancelPurchaseInvoice('${l.id}')"
                  title="إلغاء" style="color:var(--bad);">🚫</button>`:""}
            <button class="btn btn-icon sm btn-ghost" onclick="deletePurchaseInvoice('${l.id}','${(l.number||"").replace(/'/g,"\\'")}')"
              title="حذف نهائي" style="color:var(--danger);">🗑️</button>
          </div>
        </td>
      </tr>`}).join("")}catch(n){t.innerHTML=`<tr><td colspan="10">
      <div class="alert bad" style="margin:8px;">${n.message}</div></td></tr>`}}};function ke(){const t=document.getElementById("supplier-search"),n=document.getElementById("supplier-results");t&&(t.addEventListener("input",Kt(async()=>{const o=t.value.trim().toLowerCase();if(o.length<1){n.classList.add("hidden");return}try{(!kt||kt.length===0)&&(kt=await R(T.suppliers(),[at("name")]));const e=kt.filter(a=>(a.name||"").toLowerCase().includes(o)||(a.phone||"").includes(o)).slice(0,15);if(!e.length){n.classList.add("hidden");return}n.innerHTML=e.map(a=>`
        <div class="autocomplete-item" onclick="selectPurSupplier('${a.id}','${(a.name||"").replace(/'/g,"\\'")}','${a.vatNumber||""}')">
          <div>${a.name}</div>
          <div class="item-code">${a.phone||""} ${a.vatNumber?"| VAT: "+a.vatNumber:""}</div>
        </div>`).join(""),n.classList.remove("hidden")}catch(e){console.warn("setupSupplierAC error:",e)}},100)),document.addEventListener("click",o=>{t.contains(o.target)||n.classList.add("hidden")}))}window.selectPurSupplier=(t,n,o)=>{document.getElementById("supplier-id").value=t,document.getElementById("supplier-search").value=n,document.getElementById("supplier-results").classList.add("hidden"),o&&(document.getElementById("pur-supplier-vat").value=o);const e=document.getElementById("sup-warning-alert"),a=(kt||[]).find(i=>i.id===t);a&&a.pinnedWarningNote&&e?(e.innerHTML=`⚠️ <b>تنبيه مثبت:</b> ${a.pinnedWarningNote}`,e.classList.remove("hidden")):e&&e.classList.add("hidden")};window.openNewPurchaseModal=(t,n,o=[])=>{typeof window.openPurchaseModal=="function"&&(window.openPurchaseModal(),t&&window.selectPurSupplier(t,n,""),o&&o.length&&(h=o.map(e=>({productId:e.productId,name:e.productName||e.name,unit:e.unit||"كرتون",qty:parseFloat(e.qty||1),unitPrice:parseFloat(e.unitPrice||0),vatRate:15,total:parseFloat(e.qty||1)*parseFloat(e.unitPrice||0)*1.15})),Q(),typeof recalcPurchaseTotals=="function"&&recalcPurchaseTotals()))};function Te(){const t=document.getElementById("pur-product-search"),n=document.getElementById("pur-product-results"),o=document.getElementById("pur-product-category-filter");if(!t)return;const e=()=>{const a=t.value.trim().toLowerCase(),i=o?o.value:"";if(!a&&!i){n.classList.add("hidden");return}let r=$t;if(i&&(r=r.filter(s=>s.category===i)),a&&(r=r.filter(s=>(s.name||"").toLowerCase().includes(a)||(s.sku||"").toLowerCase().includes(a)||(s.barcode||"").includes(a))),r=r.slice(0,15),!r.length){n.innerHTML='<div style="padding:10px;text-align:center;color:var(--text-2);font-size:12px;">لا توجد نتائج</div>',n.classList.remove("hidden");return}n.innerHTML=r.map(s=>{const c=s.lastPurchasePrice||s.costPrice||s.purchasePrice||0;return`
      <div class="autocomplete-item"
        onclick="addPurLine('${s.id}','${(s.name||"").replace(/'/g,"\\'")}',${c},'${s.unit||"Piece"}','${s.sku||""}','${s.taxCategory||"S"}','${s.altUnit||""}',${s.unitFactor||1})">
        <div class="flex justify-between">
          <span>${s.name}</span>
          <span class="mono text-indigo" title="آخر سعر شراء تم">${w(c)}</span>
        </div>
        <div class="item-code">${s.sku||""} | الوحدة: ${s.unit||""} | <span style="color:#2563eb;font-weight:700;">آخر شراء: ${w(c)}</span>${s.altUnit&&s.unitFactor>1?` | <span style="color:#d97706;font-weight:700;">📦 ${s.unitFactor} ${s.unit} = 1 ${s.altUnit}</span>`:""}</div>
      </div>`}).join(""),n.classList.remove("hidden")};t.addEventListener("input",Kt(e,200)),t.addEventListener("focus",e),o&&o.addEventListener("change",e),document.addEventListener("click",a=>{!t.contains(a.target)&&!n.contains(a.target)&&(!o||!o.contains(a.target))&&n.classList.add("hidden")})}async function ie(){try{if($t.length===0||qt.length===0){const[n,o]=await Promise.all([R(T.products(),[at("name")]),R(T.categories(),[at("name")])]);$t=n,qt=o}const t=document.getElementById("pur-product-category-filter");t&&(t.innerHTML='<option value="">كل الفئات</option>'+qt.map(n=>`<option value="${n.id}">${n.name}</option>`).join(""))}catch(t){console.error("loadProductsAndCategories error:",t)}}window.setPurchaseInvoiceType=t=>{const n=document.getElementById("pur-invoice-type"),o=document.getElementById("pur-type-btn-taxable"),e=document.getElementById("pur-type-btn-nontax");t==="non_tax"?(n&&(n.value="non_tax"),o&&(o.className="btn btn-sm btn-ghost",o.style.background="transparent",o.style.color="var(--text-2)"),e&&(e.className="btn btn-sm btn-primary",e.style.background="#059669",e.style.color="#ffffff"),h.forEach(a=>{a.taxCategory="E"})):(n&&(n.value="taxable"),o&&(o.className="btn btn-sm btn-primary",o.style.background="",o.style.color=""),e&&(e.className="btn btn-sm btn-ghost",e.style.background="transparent",e.style.color="#059669"),h.forEach(a=>{a.taxCategory="S"})),Q(),O()};window.onPurLineKey=(t,n,o)=>{if(t.key==="Enter"){t.preventDefault();const e=document.getElementById("pur-product-search");e&&(e.focus(),e.select())}else if(t.key==="ArrowDown"){const e=document.getElementById(`pur-line-${o}-${n+1}`);e&&(t.preventDefault(),e.focus(),e.select())}else if(t.key==="ArrowUp"){const e=document.getElementById(`pur-line-${o}-${n-1}`);e&&(t.preventDefault(),e.focus(),e.select())}};window.togglePurExtraDetails=()=>{const t=document.getElementById("pur-extra-details-drawer");if(!t)return;const n=t.style.display==="none";t.style.display=n?"flex":"none";const o=document.getElementById("pur-extra-details-btn");o&&(o.style.background=n?"#2563eb":"",o.style.color=n?"#fff":"")};window.togglePurDiscountNotes=()=>{const t=document.getElementById("pur-discount-notes-drawer");if(!t)return;const n=t.style.display==="none";t.style.display=n?"flex":"none";const o=document.getElementById("pur-discount-notes-btn");o&&(o.style.background=n?"#2563eb":"",o.style.color=n?"#fff":"")};window.addPurLine=(t,n,o,e,a,i,r,s)=>{document.getElementById("pur-product-search").value="",document.getElementById("pur-product-results").classList.add("hidden");const c=h.findIndex(b=>b.productId===t);if(c!==-1){const b=h[c],y=`⚠️ تنبيه: الصنف [${n}] مضاف مسبقاً في السطر (${c+1}) بكمية (${b.qty})!
هل أنت متأكد من تكرار إضافته كسطر منفصل بدلاً من تعديل كميته؟`;if(!confirm(y)){const g=document.getElementById(`pur-line-qty-${c}`);g&&(g.scrollIntoView({behavior:"smooth",block:"nearest"}),g.focus(),g.select());return}}const f=document.getElementById("pur-invoice-type")?.value==="non_tax";h.push({productId:t,productName:n,sku:a||"",unit:e||"Piece",altUnit:r||"",unitFactor:parseFloat(s)||1,selectedUnit:r&&parseFloat(s)>1?r:e||"Piece",taxCategory:f?"E":i||"S",qty:1,bonusQty:0,unitPrice:parseFloat(o)||0,discount:0,discountType:"percent",batchNumber:"",expiryDate:""}),Q(),O(),setTimeout(()=>{const b=h.length-1,y=document.getElementById(`pur-line-qty-${b}`);y&&(y.scrollIntoView({behavior:"smooth",block:"nearest"}),y.focus(),y.select())},40)};function Q(){const t=document.getElementById("pur-lines-tbody"),n=document.getElementById("pur-items-badge");if(!t)return;if(n&&(n.textContent=`${h.length} صنف`),!h.length){t.innerHTML=`<tr><td colspan="14" style="text-align:center;padding:24px;color:var(--text-2);">
      لم يتم إضافة أصناف — ابحث وأضف أصناف أعلاه أو استخدم أزرار الاستيراد الذكية</td></tr>`;return}const o=document.getElementById("pur-invoice-type")?.value==="non_tax";t.innerHTML=h.map((e,a)=>{const i=parseFloat(e.qty)||0,r=parseFloat(e.unitPrice)||0,s=parseFloat(e.discount)||0,c=e.discountType||"percent",f=i*r;let b=0;c==="amount"?b=Math.min(f,Math.max(0,s)):b=Math.min(f,Math.max(0,f*(s/100)));const y=Math.max(0,f-b),g=i>0?y/i:r,x=!o&&(e.taxCategory==="S"||e.taxCategory==="standard")?y*.15:0,l=y+x;return`
    <tr id="pur-line-row-${a}" style="border-bottom:1px solid var(--border-soft); background:#fff;">
      <td style="padding:6px 4px; text-align:center; color:var(--text-2); font-size:11px;">${a+1}</td>
      <td style="padding:6px 6px;" class="mono dim" style="font-size:11px;">${e.sku||"—"}</td>
      <td style="padding:6px 6px; font-weight:700; color:var(--text-0);">${e.productName}</td>
      <td style="padding:6px 4px; min-width:90px;">
        ${e.altUnit&&e.unitFactor>1?`<select class="form-control" style="height:28px;font-size:11px;padding:2px 4px;color:var(--brand);font-weight:700;"
               onchange="updatePurLineUnit(${a},this.value)" title="اختر وحدة الإدخال">
               <option value="${e.altUnit}" ${e.selectedUnit===e.altUnit?"selected":""}>${G(e.altUnit)} (كرتون)</option>
               <option value="${e.unit}" ${e.selectedUnit===e.unit?"selected":""}>${G(e.unit)} (حبة)</option>
             </select>
             <div style="font-size:9.5px;color:#64748b;margin-top:2px;text-align:center">
               ${e.selectedUnit===e.altUnit?`1 ${G(e.altUnit)} = ${e.unitFactor} ${G(e.unit)}`:G(e.unit)}
             </div>`:`<span style="font-size:11px;color:var(--text-2)">${G(e.unit||"Piece")}</span>`}
      </td>
      
      <!-- Qty -->
      <td style="padding:6px 4px; width:75px;">
        <input type="number" id="pur-line-qty-${a}" class="form-control mono font-bold no-spin"
          style="width:70px; height:28px; font-size:12px; padding:2px 4px; text-align:center;"
          value="${e.qty}" min="0.001" step="0.001"
          onwheel="this.blur()"
          onkeydown="window.onPurLineKey(event, ${a}, 'qty')"
          oninput="updatePurLine(${a},'qty',this.value)" />
        ${e.altUnit&&e.unitFactor>1&&e.selectedUnit===e.altUnit?`<div style="font-size:9.5px;color:#059669;margin-top:2px;text-align:center;font-weight:700;">= ${(parseFloat(e.qty)||0)*e.unitFactor} ${G(e.unit)}</div>`:""}
      </td>

      <!-- Bonus Qty -->
      <td style="padding:6px 4px; width:75px;">
        <input type="number" id="pur-line-bonus-${a}" class="form-control mono font-bold no-spin"
          style="width:70px; height:28px; font-size:12px; padding:2px 4px; text-align:center; color:#10B981; background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.3);"
          value="${e.bonusQty||""}" placeholder="0" min="0" step="1"
          title="كمية مجانية ممنوحة من المورد (تضاف للمخزون بدون تكلفة)"
          onwheel="this.blur()"
          onkeydown="window.onPurLineKey(event, ${a}, 'bonus')"
          oninput="updatePurLine(${a},'bonusQty',this.value)" />
      </td>

      <!-- Unit Price -->
      <td style="padding:6px 4px; width:95px;">
        <input type="number" id="pur-line-price-${a}" class="form-control mono font-bold no-spin"
          style="width:90px; height:28px; font-size:12px; padding:2px 6px;"
          value="${e.unitPrice}" min="0" step="0.01"
          onwheel="this.blur()"
          onkeydown="window.onPurLineKey(event, ${a}, 'price')"
          oninput="updatePurLine(${a},'unitPrice',this.value)" />
      </td>

      <!-- Line Discount (% or SAR toggle) -->
      <td style="padding:6px 4px; width:105px;">
        <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
          <input type="number" id="pur-line-disc-${a}" class="form-control mono font-bold no-spin"
            style="width:58px; height:28px; font-size:12px; padding:2px 3px; text-align:center; color:#EF4444; border-color:#fca5a5;"
            value="${e.discount??""}" placeholder="0" min="0" ${c==="amount"?"":'max="100"'} step="${c==="amount"?"0.01":"0.5"}"
            onwheel="this.blur()"
            onkeydown="window.onPurLineKey(event, ${a}, 'disc')"
            oninput="updatePurLine(${a},'discount',this.value)" />
          <button type="button" onclick="window.togglePurLineDiscountType(${a})"
            title="تبديل نوع الخصم بين نسبة مئوية (%) ومبلغ نقدي (ر.س)"
            style="border:none; background:${c==="amount"?"#dbeafe":"#fef2f2"}; color:${c==="amount"?"#1d4ed8":"#dc2626"}; font-weight:900; font-size:10px; padding:3px 5px; border-radius:4px; cursor:pointer; white-space:nowrap; height:28px; line-height:1;">
            ${c==="amount"?"ر.س":"%"}
          </button>
        </div>
      </td>

      <!-- Net Unit Price -->
      <td style="padding:6px 6px;" class="mono font-bold pur-line-net-price" style="font-size:12px; color:var(--brand);">
        ${w(g)}
      </td>

      <!-- Batch Number -->
      <td style="padding:6px 4px; width:90px;">
        <input type="text" id="pur-line-batch-${a}" class="form-control mono"
          style="width:85px; height:28px; font-size:11px; padding:2px 4px;"
          value="${e.batchNumber||""}" placeholder="LOT-01"
          onkeydown="window.onPurLineKey(event, ${a}, 'batch')"
          onchange="updatePurLine(${a},'batchNumber',this.value)" />
      </td>

      <!-- Expiry Date -->
      <td style="padding:6px 4px; width:110px;">
        <input type="date" id="pur-line-expiry-${a}" class="form-control mono"
          style="width:105px; height:28px; font-size:10.5px; padding:2px 2px;"
          value="${e.expiryDate||""}"
          onkeydown="window.onPurLineKey(event, ${a}, 'expiry')"
          onchange="updatePurLine(${a},'expiryDate',this.value)" />
      </td>

      <!-- VAT Badge -->
      <td style="padding:6px 4px; text-align:center;">
        ${o?'<span class="badge good" style="font-size:9.5px; padding:2px 6px; user-select:none;" title="فاتورة غير ضريبية (معفاة)">0% معفى</span>':e.taxCategory==="S"?`<span class="badge warn" style="font-size:9.5px; padding:2px 6px; cursor:pointer; user-select:none;" onclick="togglePurLineTax(${a})" title="انقر لتغيير الضريبة (خاضع 15% / معفى 0%)">15% 🔄</span>`:`<span class="badge good" style="font-size:9.5px; padding:2px 6px; cursor:pointer; user-select:none;" onclick="togglePurLineTax(${a})" title="انقر لتغيير الضريبة (خاضع 15% / معفى 0%)">معفى 🔄</span>`}
      </td>

      <!-- Total With VAT -->
      <td style="padding:6px 6px;" class="mono font-bold text-brand pur-line-total-vat" style="font-size:12px;">
        ${w(l)}
      </td>

      <!-- Delete Button -->
      <td style="padding:6px 2px; text-align:center;">
        <button class="btn btn-icon sm btn-ghost" onclick="removePurLine(${a})"
          style="color:var(--bad); font-size:14px; padding:2px 4px;" title="حذف البند">✕</button>
      </td>
    </tr>`}).join("")}window.togglePurLineDiscountType=t=>{h[t]&&(h[t].discountType=h[t].discountType==="amount"?"percent":"amount",Q(),O())};window.togglePurLineTax=t=>{if(!h[t])return;if(document.getElementById("pur-invoice-type")?.value==="non_tax"){h[t].taxCategory="E";return}const o=h[t].taxCategory||"S";h[t].taxCategory=o==="E"||o==="Z"?"S":"E",Q(),O()};window.updatePurLine=(t,n,o)=>{if(!h[t])return;n==="batchNumber"||n==="expiryDate"?h[t][n]=o:h[t][n]=parseFloat(o)||0;const e=h[t],a=parseFloat(e.qty)||0,i=parseFloat(e.unitPrice)||0,r=parseFloat(e.discount)||0,s=e.discountType||"percent",c=a*i;let f=0;s==="amount"?f=Math.min(c,Math.max(0,r)):f=Math.min(c,Math.max(0,c*(r/100)));const b=Math.max(0,c-f),y=a>0?b/a:i,x=!(document.getElementById("pur-invoice-type")?.value==="non_tax")&&(e.taxCategory==="S"||e.taxCategory==="standard")?b*.15:0,l=b+x,p=document.getElementById(`pur-line-row-${t}`);if(p){const m=p.querySelector(".pur-line-net-price"),u=p.querySelector(".pur-line-total-vat");m&&(m.textContent=w(y)),u&&(u.textContent=w(l))}O()};window.removePurLine=t=>{h.splice(t,1),Q(),O()};window.updatePurLineUnit=(t,n)=>{const o=h[t];o&&(o.selectedUnit=n,Q(),O())};function O(){const t=document.getElementById("pur-global-discount-type")?.value||"pct",n=parseFloat(document.getElementById("pur-global-discount-val")?.value)||0,o=parseFloat(document.getElementById("pur-freight-val")?.value)||0,a=(document.getElementById("pur-invoice-type")?.value||"taxable")==="non_tax";let i=0,r=0,s=0,c=0,f=0;h.forEach(S=>{const H=parseFloat(S.qty)||0,pt=parseFloat(S.bonusQty)||0,it=parseFloat(S.unitPrice)||0,ut=parseFloat(S.discount)||0,L=S.discountType||"percent",W=H*it;let U=0;L==="amount"?U=Math.min(W,Math.max(0,ut)):U=Math.min(W,Math.max(0,W*(ut/100)));const st=Math.max(0,W-U);i+=W,r+=U,s+=pt,a?f+=st:S.taxCategory==="S"||S.taxCategory==="standard"||S.vatRate===15||!S.taxCategory&&S.vatRate!==0?c+=st:f+=st});const b=Math.max(0,i-r);let y=0;t==="pct"?y=b*(n/100):y=Math.min(b,n);const g=b>0?y/b:0,I=Math.max(0,c*(1-g)),x=Math.max(0,f*(1-g)),l=I*.15,p=I+x+l+o,m=r+y,u=S=>`${w(S)}`,v=S=>document.getElementById(S);if(v("pur-gross-subtotal")&&(v("pur-gross-subtotal").textContent=u(i)),v("pur-line-discounts")&&(v("pur-line-discounts").textContent=`- ${u(r)}`),v("pur-global-discount-amount")&&(v("pur-global-discount-amount").textContent=`- ${u(y)}`),v("pur-net-taxable")&&(v("pur-net-taxable").textContent=u(I)),v("pur-net-exempt")&&(v("pur-net-exempt").textContent=u(x)),v("pur-vat")&&(v("pur-vat").textContent=u(l)),v("pur-freight-label")&&(v("pur-freight-label").textContent=`+ ${u(o)}`),v("pur-grand")&&(v("pur-grand").textContent=u(p)),v("pur-total-bonus-label")&&(v("pur-total-bonus-label").textContent=`${s} كرتون مجاني`),v("pur-total-savings-label")){const S=i>0?(m/i*100).toFixed(1):0;v("pur-total-savings-label").textContent=`${u(m)} (${S}%)`}}window.recalcPurchaseTotals=O;window.syncPurGlobalDiscount=t=>{const n=document.getElementById("pur-hud-discount-val"),o=document.getElementById("pur-hud-discount-type"),e=document.getElementById("pur-global-discount-val"),a=document.getElementById("pur-global-discount-type");t==="hud"?(e&&n&&(e.value=n.value),a&&o&&(a.value=o.value)):(n&&e&&(n.value=e.value),o&&a&&(o.value=a.value)),O()};window.openPurchaseModal=async()=>{h=[],window._editingPurchaseId=null;const t=document.getElementById("save-pur-btn");t&&(t.textContent="💾 حفظ واعتماد الفاتورة"),["supplier-search","pur-ref-num","pur-notes","pur-supplier-vat","pur-global-discount-val","pur-freight-val","pur-hud-discount-val"].forEach(e=>{const a=document.getElementById(e);a&&(a.value="")}),document.getElementById("pur-global-discount-type")&&(document.getElementById("pur-global-discount-type").value="pct"),document.getElementById("pur-hud-discount-type")&&(document.getElementById("pur-hud-discount-type").value="pct"),document.getElementById("supplier-id").value="",document.getElementById("pur-inv-date").value=nt(),document.getElementById("pur-form-error").classList.add("hidden"),document.getElementById("pur-modal-title").textContent="فاتورة مشتريات وتوريد بضاعة",document.getElementById("pur-inv-number").value="جارِ التوليد...";const n=document.getElementById("pur-sup-360-btn");n&&n.classList.add("hidden");const o=document.getElementById("sup-warning-alert");o&&o.classList.add("hidden"),Q(),O(),typeof window.setPurchaseInvoiceType=="function"&&window.setPurchaseInvoiceType("taxable"),openModal("purchase-modal"),ie();try{const e=await Lt("PUR");document.getElementById("pur-inv-number").value=e}catch{}};async function se(t){if(!t)return;const n=t.id,o=t.number||t.invoiceNumber||"";try{const{getDocs:e,query:a,collection:i,where:r}=await V(async()=>{const{getDocs:y,query:g,collection:I,where:x}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDocs:y,query:g,collection:I,where:x}},[]),s=a(i(q,`companies/${j}/cashTransactions`),r("sourceId","==",n),r("sourceType","==","purchaseInvoice")),c=await e(s);for(const y of c.docs){const g=y.data(),I=g.type==="out"?"in":"out";await Ut({type:I,amount:g.amount,notes:`عكس سداد/تعديل فاتورة مشتريات ${o}`,sourceType:"purchaseInvoice_reverse",sourceId:n,date:t.date||nt()}),console.log(`[Cleanup] Reversed cash transaction of ${g.amount} for purchase invoice ${o}`)}const f=a(i(q,`companies/${j}/bankTransactions`),r("sourceId","==",n),r("sourceType","==","purchaseInvoice")),b=await e(f);for(const y of b.docs){const g=y.data(),I=g.type==="out"?"in":"out";await Rt({type:I,amount:g.amount,notes:`عكس سداد/تعديل فاتورة مشتريات ${o}`,sourceType:"purchaseInvoice_reverse",sourceId:n,date:t.date||nt()}),console.log(`[Cleanup] Reversed bank transaction of ${g.amount} for purchase invoice ${o}`)}}catch(e){console.warn("[Cleanup] Querying and reversing purchase transactions failed:",e.message)}if(t.paymentJournalEntryId)try{await fe("journalEntries",t.paymentJournalEntryId),console.log(`[Cleanup] Deleted payment journal entry ${t.paymentJournalEntryId} for purchase invoice ${o}`)}catch(e){console.warn("[Cleanup] Failed to delete payment JE:",e.message)}}window.savePurchase=async()=>{if(window._isSavingPurchaseInvoice){console.warn("[savePurchase] Save already in progress, ignoring double-click");return}window._isSavingPurchaseInvoice=!0;let t=[];const n=document.getElementById("pur-form-error");n.classList.add("hidden");let o=document.getElementById("supplier-id").value;const e=document.getElementById("supplier-search").value.trim(),a=document.getElementById("pur-warehouse"),i=a.value,r=a.options[a.selectedIndex]?.dataset.name||"",s=document.getElementById("pur-payment").value,c=document.getElementById("pur-inv-date").value,f=document.getElementById("pur-ref-num").value.trim(),b=document.getElementById("pur-due-date").value,y=document.getElementById("pur-notes").value.trim(),g=document.getElementById("pur-supplier-vat").value.trim();if(!o&&e)try{const l=vt(T.suppliers(),at("name"),Mt(20)),m=(await wt(l)).docs.map(u=>({id:u.id,...u.data()})).find(u=>(u.name||"").toLowerCase()===e.toLowerCase());m&&(o=m.id,document.getElementById("supplier-id").value=m.id,!g&&m.vatNumber&&(document.getElementById("pur-supplier-vat").value=m.vatNumber))}catch{}const I=l=>{window._isSavingPurchaseInvoice=!1,n.textContent=l,n.classList.remove("hidden"),n.scrollIntoView({behavior:"smooth",block:"center"})};if(!o){I("⚠️ يرجى اختيار المورد من القائمة");return}if(!i){I("⚠️ يرجى اختيار المخزن المستلِم");return}if(!h.length){I("⚠️ أضف صنفاً واحداً على الأقل");return}const x=document.getElementById("save-pur-btn");x.disabled=!0,x.textContent="⌛ جارٍ الحفظ…";try{if(await ge(c)){I(`⚠️ لا يمكن حفظ الفاتورة لأن تاريخها (${c}) يقع في فترة محاسبية مغلقة ومقفلة نهائياً.`),x.disabled=!1,x.textContent="💾 حفظ واعتماد";return}const l=document.getElementById("pur-global-discount-type")?.value||"pct",p=parseFloat(document.getElementById("pur-global-discount-val")?.value)||0,m=parseFloat(document.getElementById("pur-freight-val")?.value)||0,u=document.getElementById("pur-invoice-type")?.value||"taxable",v=u==="non_tax";let S=0,H=0,pt=0,it=0,ut=0,L=0;h.forEach(d=>{const k=parseFloat(d.qty)||0,E=parseFloat(d.bonusQty)||0,D=parseFloat(d.unitPrice)||0,N=parseFloat(d.discount)||0,A=d.discountType||"percent",$=k*D;let J=0;A==="amount"?J=Math.min($,Math.max(0,N)):J=Math.min($,Math.max(0,$*(N/100)));const ot=Math.max(0,$-J);S+=$,H+=J,it+=k,pt+=E,v?(d.taxCategory="E",L+=ot):d.taxCategory==="S"||d.taxCategory==="standard"||d.vatRate===15||!d.taxCategory&&d.vatRate!==0?ut+=ot:L+=ot});const W=Math.max(0,S-H);let U=0;l==="pct"?U=W*(p/100):U=Math.min(W,p);const st=W>0?U/W:0,rt=Math.max(0,ut*(1-st)),tt=Math.max(0,L*(1-st)),z=rt*.15,_=rt+tt+z+m,K=H+U,B=document.getElementById("pur-inv-number").value,et=document.getElementById("pur-attachment"),X=et?et.files[0]:null;let lt="";if(X){x.textContent="⏳ جارٍ رفع المرفق…";try{const d=be(ye,`companies/${j}/purchases/${B}_${X.name}`),k=await ve(d,X);lt=await we(k.ref)}catch(d){if(console.warn("Storage upload failed, saving without attachment:",d),!confirm("⚠️ فشل رفع المرفق. هل تريد الاستمرار بحفظ الفاتورة بدون مرفق؟")){x.disabled=!1,x.textContent="💾 حفظ وإنشاء قيد";return}}}h.forEach((d,k)=>{if(!d.batchNumber||!d.batchNumber.trim()){const E=(d.sku||d.productId||"P").slice(-4).toUpperCase(),D=(c||nt()).replace(/-/g,"").slice(2);d.batchNumber=`LOT-${D}-${E}-${k+1}`}});const dt={invoiceType:u,isTaxExempt:v,number:B,date:c,dueDate:b||"",refNumber:f,supplierId:o,supplierName:e,supplierVatNumber:g,warehouseId:i,warehouseName:r,lines:h,grossSubtotal:S,subtotal:rt+tt,taxableSubtotal:rt,exemptSubtotal:tt,lineDiscountTotal:H,globalDiscountType:l,globalDiscountVal:p,globalDiscountAmount:U,discountTotal:K,freightCharge:m,totalVat:z,totalWithVat:_,totalBonusQty:pt,totalPurchasedQty:it,paymentMethod:s,status:s==="cash"?"paid":"posted",notes:y,attachmentUrl:lt};let C=window._editingPurchaseId,yt=null;const Tt={};if(C){const d=await Zt("purchaseInvoices",C);if(d){yt=d.supplierId;for(const E of d.lines||[]){if(!E.productId)continue;const D=E.altUnit&&E.unitFactor>1&&E.selectedUnit===E.altUnit&&parseFloat(E.unitFactor)||1,N=(parseFloat(E.qty)||0)*D+(parseFloat(E.bonusQty)||0);Tt[E.productId]=(Tt[E.productId]||0)+N}await se(d);const k=Array.from(new Set([C,d.id,d.invoiceNumber,d.number].filter(Boolean)));for(const E of["purchaseInvoice","purchase","purchaseCOGS"])for(const D of k)try{const N=await wt(vt(ae(q,`companies/${j}/journalEntries`),bt("sourceType","==",E),bt("sourceId","==",D)));for(const A of N.docs)await mt(A.id),console.log(`[purchaseEdit] Deleted JE ${A.id} (${E}) for ${D}`)}catch(N){console.warn(`[purchaseEdit] JE cleanup (${E}/${D}) skipped:`,N.message)}if(d.journalEntryId&&typeof d.journalEntryId=="string")try{await mt(d.journalEntryId)}catch{}}await gt("purchaseInvoices",C,dt)}else{try{(await wt(vt(T.purchaseInvoices(),bt("number","==",B),Mt(1)))).empty||(console.warn(`[savePurchase] Invoice number ${B} already exists! Generating new unique number...`),B=await Lt("PUR"),dt.number=B)}catch(k){console.warn("[savePurchase] Could not verify number uniqueness:",k)}const d=await te(T.purchaseInvoices(),dt);C=typeof d=="string"?d:d.id}X&&window.uploadFileToArchive(X,"purchase_invoices",C,`مرفق فاتورة شراء رقم ${B}`).catch(d=>console.warn(d));let Qt=0,At=0;const Bt={};for(const d of h){if(!d.productId)continue;const k=d.altUnit&&d.unitFactor>1&&d.selectedUnit===d.altUnit&&parseFloat(d.unitFactor)||1,E=(parseFloat(d.qty)||0)*k+(parseFloat(d.bonusQty)||0);Bt[d.productId]=(Bt[d.productId]||0)+E}const re=new Set([...Object.keys(Tt),...Object.keys(Bt)]);for(const d of re){const k=Bt[d]||0,E=Tt[d]||0,D=k-E;if(D===0){console.log(`[adjustStock] ℹ️ Quantity unchanged for product ${d} (Qty: ${k}). Skipping stock delta.`);continue}const N=h.find(A=>A.productId===d)||{};try{const A=Date.now();await _t(i,d,D,{type:D>0?"purchase_in":"purchase_reverse_edit",sourceType:"purchaseInvoice",sourceId:C,txDocId:C?`tx_pur_edit_${C}_${A}_${d}`:void 0,documentNumber:B,invoiceNumber:B,purchasePrice:N.unitPrice||0,batchNumber:N.batchNumber||"",expiryDate:N.expiryDate||"",sku:N.sku||"",productName:N.productName||"",notes:C?`تعديل فاتورة الشراء ${B} (الفارق الصافي: ${D})`:`فاتورة شراء جديدة ${B}`}),Qt++,console.log(`[adjustStock] ✅ Product ${d} net stock delta: ${D>0?"+":""}${D} in ${i}`)}catch(A){At++,console.error(`[adjustStock] ❌ Failed for product ${d}:`,A.message)}}At>0&&window.showToast?.(`⚠️ تحديث المخزون: ${Qt} صنف نجح، ${At} فشل`,"warn");try{const{getDoc:d,updateDoc:k,doc:E,serverTimestamp:D}=await V(async()=>{const{getDoc:$,updateDoc:J,doc:ot,serverTimestamp:Y}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:$,updateDoc:J,doc:ot,serverTimestamp:Y}},[]),N=await R(T.stockByWarehouse()),A={};N.forEach($=>{$.productId&&(A[$.productId]=(A[$.productId]||0)+($.qty||0))}),t=[];for(const $ of h){const J=parseFloat($.qty)||0,ot=parseFloat($.bonusQty)||0,Y=J+ot;if(!(!$.productId||Y<=0||!$.unitPrice))try{const St=E(q,`companies/${j}/products`,$.productId),Ht=await d(St);if(!Ht.exists())continue;const M=Ht.data(),zt=J*$.unitPrice,Jt=parseFloat($.discount)||0,de=$.discountType||"percent";let jt=0;de==="amount"?jt=Math.min(zt,Math.max(0,Jt)):jt=Math.min(zt,Math.max(0,zt*(Jt/100)));const Gt=zt-jt,ce=W>0?Gt/W*U:0,pe=Math.max(0,Gt-ce),xt=Y>0?pe/Y:$.unitPrice,ue=A[$.productId]||0,Ct=Math.max(0,ue-Y),me=Ct+Y,Pt=Number(M.averageCost||M.costPrice||M.lastPurchasePrice||M.avgCostPrice||M.purchasePrice||0);let Dt=xt;C?Dt=Pt>0?Pt:xt:Dt=Ct>0&&Pt>0?(Pt*Ct+xt*Y)/me:xt;const ht=Number(M.lastPurchasePrice||M.purchasePrice||M.costPrice||0),Et=Math.round(xt*100)/100,Vt=Math.round(Dt*100)/100;await k(St,{lastPurchasePrice:Et,lastPurchaseDate:c,lastSupplierName:e||"",avgCostPrice:Vt,averageCost:Vt,costPrice:Vt,updatedAt:D()}),console.log(`[WACC] ${$.productName}: netPrice ${xt.toFixed(2)}, avg ${Pt} → ${Dt.toFixed(2)} (qty ${Ct}+${Y})`);const ft=Number(M.sellingPrice||M.salePrice||M.priceRetail||0);let ct=parseFloat(M.targetMarginPct);const Wt=M.marginType||"markup";if((isNaN(ct)||ct<=0)&&(ft>0&&ht>0?ct=Wt==="margin"?Math.round((ft-ht)/ft*1e3)/10:Math.round((ft-ht)/ht*1e3)/10:ct=15),Math.abs(Et-ht)>=.01||ft<=0){let Nt=0;Wt==="margin"&&ct<100?Nt=Math.round(Et/(1-ct/100)*100)/100:Nt=Math.round(Et*(1+ct/100)*100)/100,t.push({productId:$.productId,productName:$.productName||M.name||M.nameAr||"صنف",sku:M.sku||"",unit:$.unit||M.unit||"Piece",oldCost:ht,newCost:Et,currentSellingPrice:ft,targetMarginPct:ct,marginType:Wt,suggestedSellingPrice:Nt,newSellingPrice:Nt,taxCategory:M.taxCategory||"S",selected:!0})}}catch(St){console.warn(`[WACC] Failed to update costPrice for ${$.productId}:`,St.message)}}}catch(d){console.warn("[WACC] Cost price update block failed:",d.message)}try{const d=await R(T.warehouses()),k=await ee({id:C,invoiceNumber:B,date:c,supplierId:o,supplierName:e,paymentMethod:s,grossSubtotal:S,discountTotal:K,lineDiscountTotal:H,globalDiscountAmount:U,freightCharge:m,subtotal:rt+tt,taxAmount:z,total:_,warehouseId:i},window._purchaseUser||{},d),E=typeof k=="object"&&k&&k.id||String(k);await gt("purchaseInvoices",C,{journalEntryId:E,journalEntryError:null})}catch(d){console.error("[AccountingEngine] Purchase JE failed:",d.message);try{await gt("purchaseInvoices",C,{journalEntryError:d.message,journalEntryId:null})}catch{}window.showToast?.("⚠️ تم حفظ فاتورة الشراء لكن القيد المحاسبي فشل — "+d.message,"warn")}if(s==="cash"||s==="نقدي")try{await Ut({type:"out",amount:_,notes:`شراء نقدي — فاتورة ${B} — ${e}`,sourceType:"purchaseInvoice",sourceId:C,date:c})}catch(d){console.warn("[autoCashTransaction] Cash box update failed:",d.message)}if(["transfer","bank","cheque","check","تحويل","شيك"].includes(s))try{await Rt({type:"out",amount:_,notes:`شراء — فاتورة ${B} — ${e}`,sourceType:"purchaseInvoice",sourceId:C,date:c})}catch(d){console.warn("[autoBankTransaction] Bank update failed:",d.message)}const Ft=_-(s==="cash"?_:0);if(o&&Ft>0)try{const{increment:d,updateDoc:k,doc:E,serverTimestamp:D}=await V(async()=>{const{increment:A,updateDoc:$,doc:J,serverTimestamp:ot}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{increment:A,updateDoc:$,doc:J,serverTimestamp:ot}},[]),N=E(q,`companies/${j}/suppliers`,o);await k(N,{balance:d(Ft),updatedAt:D()}),console.log(`[SupplierBalance] Client-side incremented supplier ${o} balance by +${Ft}`)}catch(d){console.warn("Failed to update supplier balance on client:",d.message)}const le=window._editingPurchaseId?`✅ تم تحديث فاتورة الشراء ${B} بنجاح`:`✅ تم حفظ فاتورة الشراء ${B} وإنشاء القيد المحاسبي`;window._editingPurchaseId=null,window.showToast(le,"success"),closeModal("purchase-modal"),h=[],await loadPurchaseList(),o&&V(()=>import("./balance-sync-CUiyFg8g.js"),__vite__mapDeps([0,1,2])).then(d=>d.recalculateSupplierBalance(o)).catch(d=>console.warn(d)),yt&&yt!==o&&V(()=>import("./balance-sync-CUiyFg8g.js"),__vite__mapDeps([0,1,2])).then(d=>d.recalculateSupplierBalance(yt)).catch(d=>console.warn(d)),t.length>0&&setTimeout(()=>{window.openPriceUpdateWizard(t)},350)}catch(l){n.textContent="خطأ: "+l.message,n.classList.remove("hidden"),console.error(l)}finally{window._isSavingPurchaseInvoice=!1,x.disabled=!1,x.textContent="💾 حفظ وإنشاء قيد"}};window.editPurchaseInvoice=async t=>{try{const n=await Zt("purchaseInvoices",t);if(!n){window.showToast("لم يتم العثور على الفاتورة","error");return}window._editingPurchaseId=t,document.getElementById("pur-inv-number").value=n.number,document.getElementById("pur-ref-num").value=n.refNumber||"",document.getElementById("pur-notes").value=n.notes||"",document.getElementById("pur-supplier-vat").value=n.supplierVatNumber||"",document.getElementById("pur-inv-date").value=n.date||"",document.getElementById("pur-due-date").value=n.dueDate||"",document.getElementById("pur-payment").value=n.paymentMethod||"credit",document.getElementById("supplier-id").value=n.supplierId||"",document.getElementById("supplier-search").value=n.supplierName||"";const o=document.getElementById("pur-warehouse");o&&(o.value=n.warehouseId||"");const e=n.invoiceType||(n.isTaxExempt||n.totalVat===0&&n.exemptSubtotal>0?"non_tax":"taxable");typeof window.setPurchaseInvoiceType=="function"&&window.setPurchaseInvoiceType(e);const a=n.globalDiscountType||n.discountType||(n.discountPercent,"pct");document.getElementById("pur-global-discount-type")&&(document.getElementById("pur-global-discount-type").value=a),document.getElementById("pur-hud-discount-type")&&(document.getElementById("pur-hud-discount-type").value=a);const i=n.globalDiscountVal!==void 0?n.globalDiscountVal:n.discountValue!==void 0?n.discountValue:n.discountPercent!==void 0?n.discountPercent:n.globalDiscountAmount||n.discountTotal||0;document.getElementById("pur-global-discount-val")&&(document.getElementById("pur-global-discount-val").value=i||""),document.getElementById("pur-hud-discount-val")&&(document.getElementById("pur-hud-discount-val").value=i||""),document.getElementById("pur-freight-val")&&(document.getElementById("pur-freight-val").value=n.freightCharge||n.freight||n.freightAmount||""),h=(n.lines||[]).map(s=>({productId:s.productId,productName:s.productName,sku:s.sku||"",unit:s.unit||"PCS",altUnit:s.altUnit||"",unitFactor:parseFloat(s.unitFactor)||1,selectedUnit:s.selectedUnit||s.unit||"PCS",qty:s.qty||0,bonusQty:s.bonusQty||0,unitPrice:s.unitPrice||0,discount:s.discount||0,discountType:s.discountType||"percent",taxCategory:e==="non_tax"?"E":s.taxCategory||"S",batchNumber:s.batchNumber||"",expiryDate:s.expiryDate||""})),Q(),O();const r=document.getElementById("save-pur-btn");r&&(r.textContent="💾 تحديث فاتورة الشراء"),document.getElementById("pur-modal-title").textContent="📦 تعديل فاتورة شراء",openModal("purchase-modal")}catch(n){window.showToast("خطأ: "+n.message,"error")}};window.viewPurchaseInvoice=async t=>{const n=document.getElementById("view-pur-body"),o=document.getElementById("view-pur-title");n.innerHTML='<div class="page-loading" style="min-height:120px;"><div class="loading-spinner"></div></div>',openModal("view-purchase-modal"),P=null;try{const e=ne(q,`companies/${j}/purchaseInvoices`,t),a=await oe(e);if(!a.exists())throw new Error("الفاتورة غير موجودة");const i={id:a.id,...a.data()};P=i;const r=i.invoiceType==="non_tax"||i.isTaxExempt||i.totalVat===0&&(i.exemptSubtotal>0||i.totalWithVat>0&&i.totalVat===0);o.textContent=r?`فاتورة شراء غير ضريبية: ${i.number||t}`:`فاتورة شراء: ${i.number||t}`;const s=document.getElementById("pur-pay-btn"),c=document.getElementById("pur-cancel-btn");s&&(s.style.display=i.status==="paid"||i.status==="cancelled"?"none":""),c&&(c.style.display=i.status==="cancelled"?"none":"");const f=(i.lines||[]).map((g,I)=>{const x=parseFloat(g.discount)||0,l=g.discountType||"percent",p=xe(g.qty,g.unitPrice,x,l),u=!r&&(g.taxCategory==="S"||g.taxCategory==="standard")?p*.15:0,v=l==="amount"?`${w(x)}`:`${x}%`;return`<tr>
        <td style="padding:7px 12px;">${I+1}</td>
        <td style="padding:7px 12px;" class="mono">${g.sku||"—"}</td>
        <td style="padding:7px 12px; font-weight:600;">${g.productName}</td>
        <td style="padding:7px 12px;">${G(g.unit||"—")}</td>
        <td style="padding:7px 12px;" class="mono">${g.qty}</td>
        <td style="padding:7px 12px;" class="mono">${w(g.unitPrice)}</td>
        <td style="padding:7px 12px; color:#dc2626;" class="mono font-bold">${v}</td>
        <td style="padding:7px 12px;" class="mono ${r?"text-good":"text-warn"}">${r?"0% (معفى)":w(u)}</td>
        <td style="padding:7px 12px;" class="mono font-bold">${w(p+u)}</td>
      </tr>`}).join(""),b=parseFloat(i.grossSubtotal||parseFloat(i.subtotal||0)+parseFloat(i.discountTotal||0)),y=parseFloat(i.discountTotal||parseFloat(i.lineDiscountTotal||0)+parseFloat(i.globalDiscountAmount||0)||0);n.innerHTML=`
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
        <div>
          <div class="grid-2 gap-12">
            <div><div class="section-label mb-6">رقم الفاتورة</div><div class="mono text-indigo font-bold text-xl">${i.number}</div></div>
            <div><div class="section-label mb-6">الحالة والنوع</div>
              ${Yt(i.status)}
              ${r?'<span class="badge" style="background:rgba(16,185,129,0.12); color:#059669; font-size:10px; font-weight:700; border:1px solid rgba(16,185,129,0.25); margin-right:4px;">🟢 غير ضريبية</span>':'<span class="badge" style="background:rgba(99,102,241,0.08); color:var(--brand); font-size:10px; font-weight:700; border:1px solid rgba(99,102,241,0.2); margin-right:4px;">🏢 ضريبية 15%</span>'}
            </div>
            <div><div class="section-label mb-6">المورد</div><div class="font-semibold">${i.supplierName}</div></div>
            <div><div class="section-label mb-6">المخزن</div><div>${i.warehouseName||"—"}</div></div>
            <div><div class="section-label mb-6">التاريخ</div><div>${Xt(i.date||i.createdAt)}</div></div>
            <div><div class="section-label mb-6">طريقة الدفع</div><div>${i.paymentMethod==="credit"?"آجل":i.paymentMethod==="cash"?"نقدي":i.paymentMethod}</div></div>
            ${i.refNumber?`<div><div class="section-label mb-6">مرجع المورد</div><div class="mono">${i.refNumber}</div></div>`:""}
            ${i.journalEntryId?`<div><div class="section-label mb-6">رقم القيد</div><span class="badge good" style="font-family:monospace; padding:3px 8px;">✓ قيد مُرحَّل (${i.journalEntryId})</span></div>`:""}
            ${i.attachmentUrl?`<div style="grid-column: span 2;"><div class="section-label mb-6">المرفق (فاتورة المورد)</div><a href="${i.attachmentUrl}" target="_blank" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:6px;width:fit-content;padding:6px 12px;background:var(--primary-dim);color:var(--primary);border-color:var(--primary);">📎 فتح الفاتورة المرفقة</a></div>`:""}
          </div>
        </div>
        <div style="background:var(--bg-2); border-radius:8px; padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div class="invoice-total-row"><span>المجموع قبل الخصم</span><span class="mono">${w(b)}</span></div>
            ${y>.009?`<div class="invoice-total-row"><span style="color:#dc2626; font-weight:700;">خصومات مشتريات (مكتسبة)</span><span class="mono text-bad font-bold">- ${w(y)}</span></div>`:""}
            <div class="invoice-total-row"><span>الصافي الخاضع للضريبة</span><span class="mono font-semibold">${w(i.subtotal||0)}</span></div>
            <div class="invoice-total-row"><span>${r?"ضريبة القيمة المضافة (0% معفى)":"VAT 15%"}</span><span class="mono ${r?"text-good":"text-warn"}">${r?"0.00 ر.س":w(i.totalVat||0)}</span></div>
            ${i.freightCharge>0?`<div class="invoice-total-row"><span>مصاريف شحن ونقل</span><span class="mono">+ ${w(i.freightCharge)}</span></div>`:""}
            <div class="invoice-total-row grand-total"><span>الإجمالي النهائي المستحق</span><span class="mono text-brand font-black" style="font-size:16px;">${w(i.totalWithVat||0)}</span></div>
          </div>
          <div style="margin-top:16px; border-top:1px solid var(--border-soft); padding-top:12px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <div>
              ${i.status==="pending"?`
                <button class="btn btn-sm" onclick="markPurchaseAsPaidManually('${i.id}')" style="background:#047857; color:#fff; border:none; padding:6px 12px; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
                  🟢 تعيين كمدفوعة (مسددة بسند)
                </button>
              `:""}
            </div>
            <div style="display:flex; gap:8px;">
              ${i.status!=="cancelled"?`
                <button class="btn btn-sm btn-secondary" onclick="closeModal('view-purchase-modal'); editPurchaseInvoice('${i.id}')" style="display:inline-flex; align-items:center; gap:6px;">
                  ✏️ تعديل
                </button>
              `:""}
              <button class="btn btn-sm btn-primary" onclick="convertPurchaseToSaleInvoice('${i.id}')" style="background:linear-gradient(135deg,#10B981,#059669); color:#fff; border:none; padding:6px 12px; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
                📄 تحويل لبيع
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="table-container">
        <table class="data-dense">
          <thead><tr>
            <th>#</th><th>الكود</th><th>الصنف</th><th>الوحدة</th>
            <th>الكمية</th><th>السعر</th><th>الخصم</th><th>VAT</th><th>الإجمالي</th>
          </tr></thead>
          <tbody>${f}</tbody>
        </table>
      </div>
      ${i.notes?`<div class="mt-16" style="padding:12px; background:var(--bg-2); border-radius:6px; font-size:13px;"><strong>ملاحظات:</strong> ${i.notes}</div>`:""}
    `}catch(e){n.innerHTML=`<div class="alert bad">${e.message}</div>`}};window.cancelPurchaseInvoice=async t=>{if(await window.showConfirm("إلغاء هذه الفاتورة؟ سيتم عكس حركة المخزون وحذف القيود المحاسبية.","تأكيد الإلغاء"))try{const{getDoc:n,doc:o,collection:e,getDocs:a,query:i,where:r}=await V(async()=>{const{getDoc:x,doc:l,collection:p,getDocs:m,query:u,where:v}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:x,doc:l,collection:p,getDocs:m,query:u,where:v}},[]),s=await n(o(q,`companies/${j}/purchaseInvoices`,t));if(!s.exists()){window.showToast("الفاتورة غير موجودة","error");return}const c=s?.data(),f=c?.supplierId,b=c.invoiceNumber||t,y=c.items||c.lines||[],g=c.warehouseId;if(g&&y.length>0)for(const x of y){const l=x.productId||x.id,p=parseFloat(x.qty||x.quantity||0);if(l&&p>0)try{await _t(g,l,-p,"cancel_purchase",`إلغاء فاتورة مشتريات ${b}`,t)}catch(m){console.warn(`[cancelPurchaseInvoice] Stock reversal failed for ${l}:`,m.message)}}const I=["purchaseInvoice","purchase","purchaseCOGS"];for(const x of I)try{const l=await a(i(e(q,`companies/${j}/journalEntries`),r("sourceType","==",x),r("sourceId","==",b)));for(const p of l.docs)await mt(p.id),console.log(`[cancelPurchaseInvoice] Deleted JE ${p.id} (${x})`);if(b!==t){const p=await a(i(e(q,`companies/${j}/journalEntries`),r("sourceType","==",x),r("sourceId","==",t)));for(const m of p.docs)await mt(m.id)}}catch(l){console.warn(`[cancelPurchaseInvoice] JE cleanup (${x}):`,l.message)}if(c.journalEntryId)try{await mt(c.journalEntryId)}catch{}if(await gt("purchaseInvoices",t,{status:"cancelled",cancelledAt:new Date().toISOString()}),f){const{recalculateSupplierBalance:x}=await V(async()=>{const{recalculateSupplierBalance:l}=await import("./balance-sync-CUiyFg8g.js");return{recalculateSupplierBalance:l}},__vite__mapDeps([0,1,2]));await x(f).catch(()=>{})}window.showToast("✅ تم إلغاء الفاتورة وعكس المخزون والقيود","success"),await loadPurchaseList()}catch(n){window.showToast("خطأ: "+n.message,"error")}};window.deletePurchaseInvoice=async(t,n)=>{if(await window.showConfirm(`هل أنت متأكد من حذف الفاتورة "${n}" نهائياً؟`,"تأكيد الحذف النهائي"))try{const{getById:o,remove:e}=await V(async()=>{const{getById:r,remove:s}=await import("./index-CF9GFeRJ.js").then(c=>c.T);return{getById:r,remove:s}},__vite__mapDeps([1,2])),a=await o("purchaseInvoices",t);if(!a)throw new Error("لم يتم العثور على الفاتورة");if(await se(a),a.lines&&a.warehouseId&&a.status!=="cancelled")for(const r of a.lines)try{await _t(a.warehouseId,r.productId,-+r.qty,{type:"purchase_reverse",refId:a.number,documentNumber:a.number,invoiceNumber:a.number,notes:`حذف فاتورة الشراء ${a.number}`})}catch(s){console.warn("Stock reverse skipped:",r.productId,s.message)}const i=a.invoiceNumber||a.number||t;for(const r of["purchaseInvoice","purchase","purchaseCOGS"])try{const s=await wt(vt(ae(q,`companies/${j}/journalEntries`),bt("sourceType","==",r),bt("sourceId","==",i)));for(const c of s.docs)await mt(c.id),console.log(`[deletePurchaseInvoice] Deleted JE ${c.id} (${r}) for ${i}`)}catch(s){console.warn(`[deletePurchaseInvoice] JE cleanup (${r}) skipped:`,s.message)}if(a.journalEntryId)try{await mt(a.journalEntryId)}catch{}if(await e("purchaseInvoices",t),a.supplierId){const{recalculateSupplierBalance:r}=await V(async()=>{const{recalculateSupplierBalance:s}=await import("./balance-sync-CUiyFg8g.js");return{recalculateSupplierBalance:s}},__vite__mapDeps([0,1,2]));await r(a.supplierId)}window.showToast(`✅ تم حذف الفاتورة ${n} بنجاح`,"success"),await loadPurchaseList()}catch(o){window.showToast("خطأ في الحذف: "+o.message,"error"),console.error("deletePurchaseInvoice error:",o)}};window.reapplyPurchaseStock=async()=>{if(!P){window.showToast("لا توجد فاتورة مفتوحة","error");return}const t=P;if(!t.warehouseId){window.showToast("⚠️ هذه الفاتورة لا تحتوي على مخزن — لا يمكن تحديث المخزون والقيود","warn");return}if(!t.lines||t.lines.length===0){window.showToast("لا توجد بنود في الفاتورة","warn");return}const n=document.getElementById("pur-restock-btn");n&&(n.disabled=!0,n.textContent="⌛ جارٍ التحديث…");let o=0;const e=[];for(const r of t.lines)try{await _t(t.warehouseId,r.productId,+r.qty,{type:"purchase_in",sourceType:"purchaseInvoice",sourceId:t.id,documentNumber:t.number,invoiceNumber:t.number,purchasePrice:r.unitPrice,sku:r.sku||"",productName:r.productName||"",notes:"إعادة تطبيق مخزون "+t.number}),o++}catch(s){console.warn("reapplyStock failed for",r.productName,s.message),e.push(`${r.productName}: ${s.message}`)}let a=null,i="لم يتم إنشاء القيد";try{const r=await R(T.warehouses()),s=parseFloat(t.discountTotal||parseFloat(t.lineDiscountTotal||0)+parseFloat(t.globalDiscountAmount||0)||0),c=parseFloat(t.grossSubtotal||parseFloat(t.subtotal||0)+s);a=await ee({id:t.id,invoiceNumber:t.number||t.invoiceNumber,date:t.date,supplierId:t.supplierId,supplierName:t.supplierName,paymentMethod:t.paymentMethod,grossSubtotal:c,discountTotal:s,lineDiscountTotal:t.lineDiscountTotal||0,globalDiscountAmount:t.globalDiscountAmount||0,freightCharge:t.freightCharge||0,subtotal:t.subtotal,taxAmount:t.totalVat||t.taxAmount||0,total:t.totalWithVat||t.total||0,warehouseId:t.warehouseId},window._purchaseUser||{},r),await gt("purchaseInvoices",t.id,{journalEntryId:a}),t.journalEntryId=a,i=`تم إنشاء القيد بنجاح برقم: ${a}`}catch(r){console.error("[AccountingEngine] Failed to create JE:",r),e.push(`خطأ القيد: ${r.message}`)}n&&(n.disabled=!1,n.textContent="🔄 تحديث المخزون والقيود"),o>0&&a?(window.showToast(`✅ تم تحديث المخزون لـ ${o} أصناف بنجاح. ${i}`,"success"),closeModal("view-purchase-modal"),await loadPurchaseList()):window.showToast(`⚠️ تم تحديث ${o} أصناف. فشل القيد: ${e.join(", ")}`,"warn")};window.cancelCurrentPurchase=async()=>{P&&(closeModal("view-purchase-modal"),await cancelPurchaseInvoice(P.id))};window.registerPayment=async()=>{if(!P)return;const t=prompt(`تسجيل دفعة لفاتورة ${P.number}
المبلغ المستحق: ${w(P.totalWithVat)}

أدخل المبلغ المدفوع:`);if(!t)return;const n=parseFloat(t);if(isNaN(n)||n<=0){alert("مبلغ غير صحيح");return}const o=prompt("اختر طريقة السداد (نقدي / بنك):");if(!o)return;const e=o.includes("نقد")||o.toLowerCase().includes("cash"),a=o.includes("بنك")||o.toLowerCase().includes("bank")||o.toLowerCase().includes("transfer");if(!e&&!a){alert("طريقة دفع غير صالحة. يرجى كتابة 'نقدي' أو 'بنك'.");return}try{const i=n>=P.totalWithVat?"paid":"partial";await gt("purchaseInvoices",P.id,{status:i,paidAmount:n}),e?await Ut({type:"out",amount:n,notes:`سداد فاتورة مشتريات آجل ${P.number} — ${P.supplierName}`,sourceType:"purchaseInvoice",sourceId:P.id,date:P.date||new Date().toISOString().split("T")[0]}):await Rt({type:"out",amount:n,notes:`سداد فاتورة مشتريات آجل ${P.number} — ${P.supplierName}`,sourceType:"purchaseInvoice",sourceId:P.id,date:P.date||new Date().toISOString().split("T")[0]});let r="";try{const{autoSupplierPaymentJE:s}=await V(async()=>{const{autoSupplierPaymentJE:c}=await import("./accounting-engine-C71tPcGM.js");return{autoSupplierPaymentJE:c}},__vite__mapDeps([3,1,2]));r=await s({id:P.id,date:P.date||new Date().toISOString().split("T")[0],amount:n,supplierId:P.supplierId,paymentMethod:e?"cash":"bank",supplierName:P.supplierName,reference:`PAY-${P.number}`},window._purchaseUser||{}),await gt("purchaseInvoices",P.id,{paymentJournalEntryId:r})}catch(s){console.warn("[AccountingEngine] Supplier payment JE failed:",s.message)}if(P.supplierId)try{const{increment:s,updateDoc:c,doc:f,serverTimestamp:b}=await V(async()=>{const{increment:g,updateDoc:I,doc:x,serverTimestamp:l}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{increment:g,updateDoc:I,doc:x,serverTimestamp:l}},[]),y=f(q,`companies/${j}/suppliers`,P.supplierId);await c(y,{balance:s(-n),updatedAt:b()})}catch(s){console.warn("Supplier balance update failed:",s.message)}window.showToast("✅ تم تسجيل السداد وتوليد قيد اليومية وتحديث حساب المورد بنجاح","success"),closeModal("view-purchase-modal"),await loadPurchaseList()}catch(i){window.showToast("خطأ: "+i.message,"error")}};window.printPurchaseInvoice=async()=>{P&&await Ot(P)};window.printPurchasePreview=async()=>{const t={number:document.getElementById("pur-inv-number").value,date:document.getElementById("pur-inv-date").value,supplierName:document.getElementById("supplier-search").value,supplierVat:document.getElementById("pur-supplier-vat").value,warehouseName:document.getElementById("pur-warehouse").selectedOptions?.[0]?.text||"",notes:document.getElementById("pur-notes").value,items:h,...he(h)};await Ot(t)};async function Ot(t,n=!1){let o={};try{o=JSON.parse(localStorage.getItem("idham_company")||"{}")}catch{}try{const{getDoc:z,doc:_}=await V(async()=>{const{getDoc:et,doc:X}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:et,doc:X}},[]),[K,B]=await Promise.all([z(_(q,`companies/${j}/settings`,"company")),z(_(q,`companies/${j}/settings`,"logo"))]);K.exists()&&Object.assign(o,K.data()),B.exists()&&B.data().dataUrl&&(o.logoUrl=B.data().dataUrl)}catch(z){console.warn("Failed to load company details for purchase PDF:",z)}const e=o.name||o.companyName||"إدهام للمواد الغذائية والتوزيع",a=o.vatNumber||o.vat||"",i=o.phone||"",r=o.email||"",s=[o.address,o.city,o.zip,o.country].filter(Boolean).join("، ")||"الرياض، المملكة العربية السعودية",c=o.logoUrl||o.logoBase64||o.logo||"";let f=t.supplierVat||t.supplierVatNumber||"",b=t.supplierPhone||"",y=t.supplierAddress||"";if(t.supplierId)try{const{getById:z}=await V(async()=>{const{getById:K}=await import("./index-CF9GFeRJ.js").then(B=>B.T);return{getById:K}},__vite__mapDeps([1,2])),_=await z("suppliers",t.supplierId);_&&(f=_.vatNumber||_.vat||f,b=_.phone||b,y=_.address||y)}catch(z){console.warn("[generatePurchasePDF] Supplier details lookup failed:",z)}const I=new Date().toLocaleDateString("ar-SA",{year:"numeric",month:"long",day:"numeric"}),x=t.items||t.lines||[];let l="",p=0,m=0,u=0;x.forEach((z,_)=>{const K=parseFloat(z.qty)||0,B=parseFloat(z.unitPrice)||0,et=parseFloat(z.discount)||0,X=z.discountType||"percent",lt=K*B;let dt=0;X==="amount"?dt=Math.min(lt,Math.max(0,et)):dt=Math.min(lt,Math.max(0,lt*(et/100)));const C=Math.max(0,lt-dt);z.taxCategory==="S"&&C*.15,p+=lt,m+=dt,u+=C;const yt=X==="amount"?`${et.toFixed(2)} ر.س`:`${et}%`;l+=`
      <tr>
        <td style="text-align:center;">${_+1}</td>
        <td class="mono">${z.sku||"—"}</td>
        <td style="font-weight:600;">${z.productName||""}</td>
        <td style="text-align:center;">${G(z.unit||"—")}</td>
        <td class="mono" style="text-align:center;">${K}</td>
        <td class="mono">${B.toFixed(2)}</td>
        <td class="mono" style="text-align:center; color:#dc2626;">${yt}</td>
        <td class="mono">${C.toFixed(2)}</td>
      </tr>`});const v=parseFloat(t.globalDiscountAmount||0),S=m+v,H=Math.max(0,u-v),pt=t.totalVat!==void 0?parseFloat(t.totalVat):H*.15,it=parseFloat(t.freightCharge||t.freight||0),ut=t.totalWithVat!==void 0?parseFloat(t.totalWithVat):H+pt+it,L=t.invoiceType==="non_tax"||t.isTaxExempt||t.totalVat===0&&(t.exemptSubtotal>0||t.subtotal>0&&t.totalVat===0),W=n?"أمر شراء / طلب عرض سعر":L?"فاتورة مشتريات (غير ضريبية)":"فاتورة مشتريات ضريبية",U=n?"📋":L?"🟢":"📦",st=n?"Purchase Order / RFQ":L?"Non-Tax Purchase Invoice":"Purchase Invoice",rt=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${W} — ${t.number||""}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4; margin: 15mm; }
    body { font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 11px; color: #000; direction: rtl; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .doc-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 15px; border-bottom: 3px solid ${L?"#059669":"#5B5CEB"}; margin-bottom: 20px; }
    .co-logo { max-height: 60px; max-width: 150px; object-fit: contain; background:#fff; padding:4px; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,0.1); }
    .company-info h1 { font-size: 18px; color: #1a1a2e; margin-bottom: 4px; }
    .company-info p { font-size: 10px; color: #555; line-height: 1.6; }
    .doc-badge { background: ${L?"#059669":"#5B5CEB"} !important; color: #fff !important; padding: 8px 20px; border-radius: 8px; font-size: 14px; font-weight: 700; text-align: center; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .doc-badge small { display: block; font-size: 9px; font-weight: 400; opacity: 0.8; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .info-box { background: #f8f9fc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; }
    .info-box h3 { font-size: 11px; color: ${L?"#059669":"#5B5CEB"}; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    .info-row { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 3px; }
    .info-row .label { color: #666; }
    .info-row .value { font-weight: 600; color: #000; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead th { background: #1a1a2e !important; color: #fff !important; padding: 8px 10px; font-size: 10px; font-weight: 600; text-align: right; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    tbody td { padding: 7px 10px; font-size: 10px; border-bottom: 1px solid #e5e7eb; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    .mono { font-family: 'IBM Plex Mono', monospace; direction: ltr; text-align: left; }
    .totals-box { float: left; width: 250px; background: #f8f9fc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; }
    .total-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; }
    .total-row.grand { border-top: 2px solid ${L?"#059669":"#5B5CEB"}; padding-top: 8px; margin-top: 8px; font-size: 14px; font-weight: 700; color: ${L?"#059669":"#5B5CEB"}; }
    .footer { clear: both; margin-top: 40px; padding-top: 15px; border-top: 1px solid #ddd; }
    .signatures { display: flex; justify-content: space-between; margin-top: 30px; }
    .sig-box { text-align: center; width: 150px; }
    .sig-line { border-top: 1px solid #999; margin-top: 40px; padding-top: 4px; font-size: 9px; color: #666; }
    ${n?".po-note { background: #FFF7ED; border: 1px solid #FDBA74; border-radius: 6px; padding: 10px; font-size: 10px; color: #92400E; margin-bottom: 15px; }":""}
    .terms { font-size: 9px; color: #666; margin-top: 15px; }
    .terms li { margin-bottom: 3px; }

    @media print {
      body { background:#fff; }
      .doc-badge { background: ${L?"#059669":"#5B5CEB"} !important; color: #fff !important; }
      thead th { background: #1a1a2e !important; color: #fff !important; }
    }
  </style>
</head>
<body>
  <div class="doc-header">
    <div style="display:flex; gap:15px; align-items:center;">
      ${c?`<img class="co-logo" src="${c}" alt="الشعار">`:""}
      <div class="company-info">
        <h1>${e}</h1>
        <p>📍 العنوان: <strong>${s}</strong></p>
        ${i?`<p>📞 الهاتف: <strong>${i}</strong></p>`:""}
        ${r?`<p>✉️ البريد: <strong>${r}</strong></p>`:""}
        ${a?`<p>🔢 الرقم الضريبي: <strong>${a}</strong></p>`:""}
      </div>
    </div>
    <div class="doc-badge">
      ${U} ${W}
      <small>${st}</small>
      <div style="font-size:16px; margin-top:4px;">${t.number||"—"}</div>
    </div>
  </div>

  ${n?`<div class="po-note">
    ⚠️ هذا أمر شراء / طلب عرض سعر. يُرجى من المورد المذكور أدناه تأكيد الأسعار والكميات المتاحة والتوقيع والختم وإعادة هذه الوثيقة. صلاحية هذا الطلب <strong>7 أيام عمل</strong> من تاريخه.
  </div>`:""}

  <div class="info-grid">
    <div class="info-box">
      <h3>بيانات ${n?"المورد المطلوب منه":"المورد"}</h3>
      <div class="info-row"><span class="label">اسم المورد:</span><span class="value">${t.supplierName||"—"}</span></div>
      ${f?`<div class="info-row"><span class="label">الرقم الضريبي:</span><span class="value mono">${f}</span></div>`:""}
      ${b?`<div class="info-row"><span class="label">رقم الهاتف:</span><span class="value mono">${b}</span></div>`:""}
      ${y?`<div class="info-row"><span class="label">العنوان:</span><span class="value">${y}</span></div>`:""}
    </div>
    <div class="info-box">
      <h3>بيانات ${n?"الطلب":"الفاتورة"}</h3>
      <div class="info-row"><span class="label">التاريخ:</span><span class="value">${t.date||I}</span></div>
      <div class="info-row"><span class="label">المخزن المستلم:</span><span class="value">${t.warehouseName||"—"}</span></div>
      ${t.refNumber?`<div class="info-row"><span class="label">مرجع المورد:</span><span class="value mono">${t.refNumber}</span></div>`:""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:30px; text-align:center;">#</th>
        <th>الكود</th>
        <th>اسم الصنف</th>
        <th style="text-align:center;">الوحدة</th>
        <th style="text-align:center;">الكمية${n?" المطلوبة":""}</th>
        <th>سعر الوحدة</th>
        <th style="text-align:center;">الخصم</th>
        <th>الصافي</th>
      </tr>
    </thead>
    <tbody>
      ${l}
    </tbody>
  </table>

  <div class="totals-box">
    <div class="total-row"><span>المجموع قبل الخصم</span><span class="mono">${t.grossSubtotal?Number(t.grossSubtotal).toFixed(2):p.toFixed(2)} ر.س</span></div>
    ${S>.009?`
      <div class="total-row" style="color:#dc2626; font-weight:600;"><span>الخصم المكتسب</span><span class="mono">- ${S.toFixed(2)} ر.س</span></div>
    `:""}
    <div class="total-row"><span>الصافي الخاضع</span><span class="mono">${H.toFixed(2)} ر.س</span></div>
    ${L?`
      <div class="total-row"><span>ضريبة القيمة المضافة (0%)</span><span class="mono" style="color:#059669;">0.00 ر.س (معفى)</span></div>
    `:`
      <div class="total-row"><span>ضريبة القيمة المضافة 15%</span><span class="mono">${pt.toFixed(2)} ر.س</span></div>
    `}
    ${it>0?`<div class="total-row"><span>مصاريف الشحن</span><span class="mono">+ ${it.toFixed(2)} ر.س</span></div>`:""}
    <div class="total-row grand"><span>الإجمالي النهائي</span><span class="mono">${ut.toFixed(2)} ر.س</span></div>
  </div>

  ${L?`
    <div style="clear:both; margin-top:14px; padding:8px 12px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; font-size:10px; color:#166534; font-weight:600;">
      ℹ️ فاتورة مشتريات غير خاضعة لضريبة القيمة المضافة (0% VAT) وفقاً للوائح هيئة الزكاة والضريبة والجمارك (ZATCA).
    </div>
  `:""}

  ${t.notes?`<div style="clear:both; padding-top:15px;"><strong>ملاحظات:</strong> ${t.notes}</div>`:'<div style="clear:both;"></div>'}

  ${n?`
  <div class="terms">
    <strong>الشروط والأحكام:</strong>
    <ul>
      <li>يجب تأكيد هذا الطلب خلال 7 أيام عمل من تاريخه.</li>
      <li>يلتزم المورد بتوريد البضاعة وفقاً للمواصفات والكميات المذكورة.</li>
      <li>شروط الدفع: حسب الاتفاق المبرم بين الطرفين.</li>
      <li>أي تغيير في الأسعار أو الكميات يجب إخطارنا به كتابياً قبل التوريد.</li>
      <li>البضاعة المستلمة تخضع للفحص والقبول من قبل إدارة المخازن.</li>
    </ul>
  </div>
  `:""}

  <div class="signatures">
    <div class="sig-box">
      <div class="sig-line">المشتري / ${e}</div>
    </div>
    ${n?`<div class="sig-box">
      <div class="sig-line">تأكيد المورد / الختم</div>
    </div>`:""}
    <div class="sig-box">
      <div class="sig-line">المستلم / أمين المخزن</div>
    </div>
  </div>

  <div class="footer" style="text-align:center; font-size:8px; color:#aaa; margin-top:20px;">
    مُنشأ من نظام إدهام ERP — ${I}
  </div>
</body>
</html>`,tt=window.open("","_blank","width=800,height=1000");tt.document.write(rt),tt.document.close(),tt.onload=()=>setTimeout(()=>tt.print(),500)}window.generatePurchaseOrder=async()=>{const t=document.getElementById("supplier-search")?.value;if(!t&&!h.length){window.showToast("أضف المورد والأصناف أولاً ثم اضغط 'أمر شراء'","info"),openPurchaseModal();return}const n={number:document.getElementById("pur-inv-number")?.value||"PO-"+Date.now(),date:document.getElementById("pur-inv-date")?.value||nt(),supplierName:t||"—",supplierVat:document.getElementById("pur-supplier-vat")?.value||"",warehouseName:document.getElementById("pur-warehouse")?.selectedOptions?.[0]?.text||"",notes:document.getElementById("pur-notes")?.value||"",items:h};await Ot(n,!0)};window.exportPurchaseCSV=async()=>{try{const t=vt(T.purchaseInvoices(),at("createdAt","desc"),Mt(500)),o=(await wt(t)).docs.map(s=>({id:s.id,...s.data()})),e=["رقم الفاتورة","التاريخ","المورد","المخزن","المجموع","VAT","الإجمالي","الحالة"],a=o.map(s=>[s.number,s.date||"",s.supplierName,s.warehouseName,s.subtotal||0,s.totalVat||0,s.totalWithVat||0,s.status]),i="\uFEFF"+[e,...a].map(s=>s.map(c=>`"${c}"`).join(",")).join(`
`),r=document.createElement("a");r.href="data:text/csv;charset=utf-8,"+encodeURIComponent(i),r.download="purchase-invoices.csv",r.click()}catch(t){window.showToast("خطأ: "+t.message,"error")}};window.openPurchaseModalFromGRPO=async t=>{h=(t.items||[]).map(n=>({productId:n.productId,productName:n.productName,sku:n.sku||"",unit:n.unit||"PCS",qty:n.qty||0,unitPrice:n.unitPrice||0,discount:0,taxCategory:"S",batchNumber:n.batchNumber||"",expiryDate:n.expiryDate||""})),Q(),O(),setTimeout(()=>{const n=document.getElementById("supplier-search");n&&(n.value=t.supplierName||"");const o=document.getElementById("supplier-id");o&&(o.value=t.supplierId||"");const e=document.getElementById("pur-ref-num");e&&(e.value=t.grpoNumber?`GRPO-${t.grpoNumber}`:"");const a=document.getElementById("pur-notes");a&&(a.value=`محولة من إذن الاستلام رقم ${t.grpoNumber||""}`);const i=document.getElementById("pur-warehouse");i&&t.warehouseId&&(i.value=t.warehouseId)},300),document.getElementById("pur-inv-date").value=nt(),document.getElementById("pur-form-error").classList.add("hidden"),document.getElementById("pur-modal-title").textContent=`📦 فاتورة شراء من إذن استلام ${t.grpoNumber||""}`,document.getElementById("pur-inv-number").value="جارِ التوليد...",openModal("purchase-modal"),ie();try{const n=await Lt("PUR");document.getElementById("pur-inv-number").value=n}catch{}};window.convertPurchaseToSaleInvoice=async t=>{try{const{getById:n}=await V(async()=>{const{getById:e}=await import("./index-CF9GFeRJ.js").then(a=>a.T);return{getById:e}},__vite__mapDeps([1,2])),o=await n("purchaseInvoices",t);if(!o){showToast("الفاتورة غير موجودة","error");return}sessionStorage.setItem("convert_purchase_to_sale",JSON.stringify({purchaseInvoiceId:o.id,purchaseNumber:o.number,warehouseId:o.warehouseId||"",items:(o.lines||[]).map(e=>({productId:e.productId,productName:e.productName,sku:e.sku||"",unit:e.unit||"PCS",qty:e.qty||0,unitPrice:e.unitPrice||0}))})),closeModal("view-purchase-modal"),showToast("تم نسخ بنود الفاتورة بنجاح. يتم توجيهك الآن للمبيعات...","success"),typeof navigate=="function"&&navigate("sales-invoices")}catch(n){showToast(n.message,"error")}};window.markPurchaseAsPaidManually=async t=>{if(await window.showConfirm("هل تريد تعيين الفاتورة كمدفوعة يدوياً؟ (سيتم تغيير الحالة فقط دون إنشاء قيد سداد مكرر)","تأكيد التغيير"))try{const{update:n}=await V(async()=>{const{update:o}=await import("./index-CF9GFeRJ.js").then(e=>e.T);return{update:o}},__vite__mapDeps([1,2]));await n("purchaseInvoices",t,{status:"paid",paidAmount:P?.totalWithVat||0,manuallyPaid:!0,updatedAt:new Date().toISOString()}),window.showToast("✅ تم تعيين الفاتورة كمدفوعة يدوياً بنجاح","success"),closeModal("view-purchase-modal"),await loadPurchaseList()}catch(n){window.showToast("خطأ: "+n.message,"error")}};window.openImportPOModal=async()=>{try{const n=(await R(T.purchaseOrders?T.purchaseOrders():"purchaseOrders",[at("createdAt","desc")]).catch(()=>[])).filter(e=>e.status!=="received"&&e.status!=="cancelled"),o=document.createElement("div");o.className="modal-overlay active",o.id="import-po-overlay",o.style.zIndex="1200",o.innerHTML=`
      <div class="modal modal-lg" style="max-width:700px; background:var(--bg-1); border-radius:16px;">
        <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <h3 class="modal-title" style="font-size:15px; font-weight:800; color:var(--brand); margin:0;">📋 استيراد بنود من أمر شراء (PO)</h3>
          <button class="modal-close" onclick="document.getElementById('import-po-overlay').remove()">×</button>
        </div>
        <div class="modal-body" style="padding:18px; max-height:60vh; overflow-y:auto;">
          ${n.length?`
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${n.map(e=>`
                <div class="card" style="padding:12px 16px; border:1px solid var(--border-soft); border-radius:10px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="window.applyPOToPurchase('${e.id}')">
                  <div>
                    <div class="font-bold" style="color:var(--brand);">${e.poNumber||e.id} — <span style="color:var(--text-0);">${e.supplierName}</span></div>
                    <div style="font-size:11.5px; color:var(--text-2); margin-top:2px;">التاريخ: ${e.date||"—"} • الأصناف: ${(e.lines||[]).length} • الإجمالي: <b>${w(e.totalAmount||0)}</b></div>
                  </div>
                  <button class="btn btn-secondary btn-sm">استيراد ⬅️</button>
                </div>
              `).join("")}
            </div>
          `:'<div style="text-align:center; padding:30px; color:var(--text-2);">لا توجد أوامر شراء نشطة بانتظار التوريد</div>'}
        </div>
      </div>
    `,document.body.appendChild(o)}catch(t){alert("خطأ: "+t.message)}};window.applyPOToPurchase=async t=>{try{const o=(await R(T.purchaseOrders?T.purchaseOrders():"purchaseOrders")).find(e=>e.id===t);if(!o)return;if(o.supplierId&&window.selectPurSupplier(o.supplierId,o.supplierName,""),o.warehouseId){const e=document.getElementById("pur-warehouse");e&&(e.value=o.warehouseId)}if(o.paymentTerms){const e=document.getElementById("pur-notes");e&&!e.value&&(e.value=`شروط الدفع: ${o.paymentTerms}`)}o.lines&&o.lines.length&&(h=o.lines.map(e=>({productId:e.productId,productName:e.productName||e.name,sku:e.sku||"",unit:e.unit||"كرتون",taxCategory:"S",qty:parseFloat(e.qty||1),bonusQty:0,unitPrice:parseFloat(e.unitPrice||0),discount:0,batchNumber:"",expiryDate:""})),Q(),O()),document.getElementById("import-po-overlay")?.remove(),window.showToast?.("✅ تم استيراد بيانات أمر الشراء بنجاح","success")}catch(n){alert(n.message)}};window.openImportQuoteModal=async()=>{try{const n=(await R(T.supplierQuotations?T.supplierQuotations():"supplierQuotations",[at("createdAt","desc")]).catch(()=>[])).filter(e=>e.status!=="converted"),o=document.createElement("div");o.className="modal-overlay active",o.id="import-quote-overlay",o.style.zIndex="1200",o.innerHTML=`
      <div class="modal modal-lg" style="max-width:700px; background:var(--bg-1); border-radius:16px;">
        <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <h3 class="modal-title" style="font-size:15px; font-weight:800; color:var(--brand); margin:0;">📑 استيراد من عرض سعر مورد (Quotation)</h3>
          <button class="modal-close" onclick="document.getElementById('import-quote-overlay').remove()">×</button>
        </div>
        <div class="modal-body" style="padding:18px; max-height:60vh; overflow-y:auto;">
          ${n.length?`
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${n.map(e=>`
                <div class="card" style="padding:12px 16px; border:1px solid var(--border-soft); border-radius:10px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="window.applyQuoteToPurchase('${e.id}')">
                  <div>
                    <div class="font-bold" style="color:var(--brand);">${e.quoteNumber||e.id} — <span style="color:var(--text-0);">${e.supplierName}</span></div>
                    <div style="font-size:11.5px; color:var(--text-2); margin-top:2px;">التاريخ: ${e.date||"—"} • الأصناف: ${(e.lines||[]).length} • الإجمالي: <b>${w(e.totalAmount||0)}</b></div>
                  </div>
                  <button class="btn btn-secondary btn-sm">استيراد ⬅️</button>
                </div>
              `).join("")}
            </div>
          `:'<div style="text-align:center; padding:30px; color:var(--text-2);">لا توجد عروض أسعار مسجلة</div>'}
        </div>
      </div>
    `,document.body.appendChild(o)}catch(t){alert(t.message)}};window.applyQuoteToPurchase=async t=>{try{const o=(await R(T.supplierQuotations?T.supplierQuotations():"supplierQuotations")).find(e=>e.id===t);if(!o)return;o.supplierId&&window.selectPurSupplier(o.supplierId,o.supplierName,""),o.lines&&o.lines.length&&(h=o.lines.map(e=>({productId:e.productId,productName:e.productName||e.name,sku:e.sku||"",unit:e.unit||"كرتون",taxCategory:"S",qty:parseFloat(e.qty||1),bonusQty:0,unitPrice:parseFloat(e.unitPrice||0),discount:0,batchNumber:"",expiryDate:""})),Q(),O()),document.getElementById("import-quote-overlay")?.remove(),window.showToast?.("✅ تم استيراد عرض السعر بنجاح","success")}catch(n){alert(n.message)}};window.openImportDeliveryModal=async()=>{try{const n=(await R(T.supplierDeliveries?T.supplierDeliveries():"supplierDeliveries",[at("expectedDate","desc")]).catch(()=>[])).filter(e=>e.status!=="received"),o=document.createElement("div");o.className="modal-overlay active",o.id="import-deliv-overlay",o.style.zIndex="1200",o.innerHTML=`
      <div class="modal modal-lg" style="max-width:700px; background:var(--bg-1); border-radius:16px;">
        <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <h3 class="modal-title" style="font-size:15px; font-weight:800; color:var(--brand); margin:0;">🚚 استيراد من شحنة واردة</h3>
          <button class="modal-close" onclick="document.getElementById('import-deliv-overlay').remove()">×</button>
        </div>
        <div class="modal-body" style="padding:18px; max-height:60vh; overflow-y:auto;">
          ${n.length?`
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${n.map(e=>`
                <div class="card" style="padding:12px 16px; border:1px solid var(--border-soft); border-radius:10px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="window.applyDeliveryToPurchase('${e.id}')">
                  <div>
                    <div class="font-bold" style="color:var(--brand);">${e.shipmentNumber||e.id} — <span style="color:var(--text-0);">${e.supplierName}</span></div>
                    <div style="font-size:11.5px; color:var(--text-2); margin-top:2px;">الوصول: ${e.expectedDate||"—"} • الكراتين: ${e.cartonsCount||0} • السائق: ${e.driverName||"—"}</div>
                  </div>
                  <button class="btn btn-secondary btn-sm">استيراد ⬅️</button>
                </div>
              `).join("")}
            </div>
          `:'<div style="text-align:center; padding:30px; color:var(--text-2);">لا توجد شحنات واردة نشطة</div>'}
        </div>
      </div>
    `,document.body.appendChild(o)}catch(t){alert("خطأ: "+t.message)}};window.applyDeliveryToPurchase=async t=>{try{const o=(await R(T.supplierDeliveries?T.supplierDeliveries():"supplierDeliveries")).find(a=>a.id===t);if(!o)return;if(o.supplierId&&window.selectPurSupplier(o.supplierId,o.supplierName,""),o.warehouseId){const a=document.getElementById("pur-warehouse");a&&(a.value=o.warehouseId)}const e=document.getElementById("pur-notes");e&&(e.value=`شحنة رقم: ${o.shipmentNumber||o.id} | السائق: ${o.driverName||""} (${o.driverPhone||""}) | لوحة: ${o.truckPlate||""}`),document.getElementById("import-deliv-overlay")?.remove(),window.showToast?.("✅ تم استيراد بيانات الشحنة بنجاح","success")}catch(n){alert(n.message)}};window.openQuickProductModal=()=>{const t=document.createElement("div");t.className="modal-overlay active",t.id="quick-prod-overlay",t.style.zIndex="1300",t.innerHTML=`
    <div class="modal" style="max-width:520px; background:var(--bg-1); border-radius:16px;">
      <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
        <h3 class="modal-title" style="font-size:15px; font-weight:800; color:var(--brand); margin:0;">➕ إضافة صنف جديد سريع</h3>
        <button class="modal-close" onclick="document.getElementById('quick-prod-overlay').remove()">×</button>
      </div>
      <div class="modal-body" style="padding:20px;">
        <div class="form-group mb-12">
          <label>اسم الصنف والمواصفات *</label>
          <input type="text" id="quick-prod-name" class="input font-bold" placeholder="أرز بسمتي هندي 40 كجم..." />
        </div>
        <div class="grid-2 gap-12 mb-12">
          <div class="form-group">
            <label>الوحدة</label>
            <input type="text" id="quick-prod-unit" class="input" value="كرتون" />
          </div>
          <div class="form-group">
            <label>سعر الشراء التقديري (ر.س)</label>
            <input type="number" id="quick-prod-price" class="input mono font-bold" placeholder="0.00" min="0" step="0.5" />
          </div>
        </div>
        <div class="form-group">
          <label>الباركود (اختياري)</label>
          <input type="text" id="quick-prod-barcode" class="input mono" placeholder="628XXXXXXXXX" />
        </div>
        <div id="quick-prod-err" class="alert bad hidden mt-12"></div>
      </div>
      <div class="modal-footer" style="padding:12px 20px; border-top:1px solid var(--border-soft); display:flex; justify-content:space-between;">
        <button class="btn btn-secondary" onclick="document.getElementById('quick-prod-overlay').remove()">إلغاء</button>
        <button class="btn btn-primary" onclick="window.saveQuickProduct()">💾 حفظ وإضافة للفاتورة</button>
      </div>
    </div>
  `,document.body.appendChild(t)};window.saveQuickProduct=async()=>{const t=document.getElementById("quick-prod-err"),n=document.getElementById("quick-prod-name")?.value.trim(),o=document.getElementById("quick-prod-unit")?.value.trim()||"كرتون",e=parseFloat(document.getElementById("quick-prod-price")?.value)||0,a=document.getElementById("quick-prod-barcode")?.value.trim()||"";if(!n){t&&(t.textContent="يرجى كتابة اسم الصنف",t.classList.remove("hidden"));return}try{const i="PRD-"+Date.now().toString().slice(-5),r={name:n,sku:i,unit:o,costPrice:e,purchasePrice:e,sellingPrice:e*1.15,barcode:a,taxCategory:"S",createdAt:new Date().toISOString()},s=await te(T.products(),r);$t.push({id:s,...r}),window.addPurLine(s,n,e,o,i,"S"),document.getElementById("quick-prod-overlay")?.remove(),window.showToast?.("✅ تم إنشاء الصنف وإضافته للفاتورة","success")}catch(i){t&&(t.textContent=i.message,t.classList.remove("hidden"))}};window._activePriceWizardItems=[];window._activePriceWizardMode="markup";window.openPriceUpdateWizard=t=>{if(!t||t.length===0)return;window._activePriceWizardItems=t,window._activePriceWizardMode="markup";const n=document.getElementById("price-wizard-overlay");n&&n.remove();const o=t.filter(i=>i.newCost>i.oldCost).length,e=t.filter(i=>i.newCost<i.oldCost).length,a=document.createElement("div");a.className="modal-overlay active",a.id="price-wizard-overlay",a.style.cssText="z-index:9999; backdrop-filter:blur(5px); background:rgba(15,23,42,0.75); display:flex; align-items:center; justify-content:center;",a.innerHTML=`
    <div class="modal modal-xl" style="max-width:1100px; width:96vw; height:90vh; max-height:90vh; display:flex; flex-direction:column; border-radius:16px; overflow:hidden; box-shadow:0 25px 60px -15px rgba(0,0,0,0.6); background:var(--bg-1);">
      
      <!-- Wizard Header -->
      <div class="modal-header" style="background:linear-gradient(135deg, #1E1B4B, #3730A3); color:#fff; padding:14px 22px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); flex-shrink:0;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:40px; height:40px; border-radius:10px; background:rgba(255,255,255,0.18); display:flex; align-items:center; justify-content:center; font-size:20px; box-shadow:inset 0 0 10px rgba(255,255,255,0.2);">
            🏷️
          </div>
          <div>
            <h3 style="margin:0; font-size:15px; font-weight:900; color:#fff; display:flex; align-items:center; gap:8px;">
              معالج مراجعة واعتماد أسعار البيع الجديدة
              <span style="font-size:11px; background:#10B981; color:#fff; padding:2px 8px; border-radius:12px; font-weight:700;">تسعير ذكي بناءً على آخر شراء</span>
            </h3>
            <div style="font-size:11.5px; color:rgba(255,255,255,0.8); margin-top:2px;">
              تم رصد تغير في تكلفة شراء أصناف هذه الفاتورة • راجع الأسعار المقترحة واعتمدها بنقرة زر لحماية هامش أرباحك
            </div>
          </div>
        </div>
        <button class="modal-close" onclick="window.closePriceWizard()" style="color:#fff; opacity:0.8; font-size:22px; background:none; border:none; cursor:pointer;">×</button>
      </div>

      <!-- Quick Options & Batch Toolbar -->
      <div style="background:var(--bg-2); padding:10px 18px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; flex-shrink:0;">
        
        <!-- Stats Badges -->
        <div style="display:flex; align-items:center; gap:8px; font-size:12px;">
          <span class="badge" style="background:rgba(99,102,241,0.12); color:var(--brand); font-weight:800; font-size:11.5px; padding:4px 8px;">
            📦 ${t.length} أصناف تغيرت تكلفتها
          </span>
          ${o>0?`<span class="badge" style="background:rgba(239,68,68,0.12); color:#DC2626; font-weight:800; font-size:11.5px; padding:4px 8px;">🔺 ${o} ارتفاع تكلفة</span>`:""}
          ${e>0?`<span class="badge" style="background:rgba(16,185,129,0.12); color:#059669; font-weight:800; font-size:11.5px; padding:4px 8px;">🔻 ${e} انخفاض تكلفة</span>`:""}
        </div>

        <!-- Uniform Margin / Calculation Mode Tools -->
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          
          <div style="display:inline-flex; background:var(--bg-card); padding:2px; border-radius:8px; border:1px solid var(--border-soft); gap:2px;">
            <button type="button" id="wiz-mode-markup" class="btn btn-sm btn-primary" onclick="window.switchWizardMarginType('markup')" style="padding:3px 8px; font-size:11px; font-weight:800;">
              إضافة على التكلفة (Markup)
            </button>
            <button type="button" id="wiz-mode-margin" class="btn btn-sm btn-ghost" onclick="window.switchWizardMarginType('margin')" style="padding:3px 8px; font-size:11px; font-weight:800;">
              هامش من سعر البيع (Margin)
            </button>
          </div>

          <div style="display:flex; align-items:center; gap:6px; background:var(--bg-card); padding:3px 8px; border-radius:8px; border:1px solid var(--border-soft);">
            <span style="font-size:11.5px; font-weight:700; color:var(--text-1);">تطبيق هامش موحد:</span>
            <input type="number" id="wiz-uniform-margin" class="form-control mono font-bold" value="15" min="1" max="500" step="1" style="width:55px; height:26px; padding:2px 4px; font-size:11.5px; text-align:center;" />
            <span style="font-size:11px; color:var(--text-2);">%</span>
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.applyUniformMarginToWizard()" style="padding:2px 8px; font-size:11px;">تطبيق على الكل</button>
          </div>

        </div>

      </div>

      <!-- Table Body -->
      <div class="modal-body" style="padding:12px 18px; flex:1; overflow-y:auto; background:var(--bg-3); display:flex; flex-direction:column;">
        <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px; background:var(--bg-card); flex:1; overflow-y:auto;">
          <table class="data-dense" style="width:100%; margin:0; font-size:12px;">
            <thead>
              <tr style="background:var(--bg-2); position:sticky; top:0; z-index:2; box-shadow:0 1px 2px rgba(0,0,0,0.06);">
                <th style="width:35px; text-align:center;">
                  <input type="checkbox" id="wiz-select-all" checked onchange="window.toggleAllWizardItems(this.checked)" style="cursor:pointer;" />
                </th>
                <th>كود واسم الصنف</th>
                <th style="width:65px; text-align:center;">الوحدة</th>
                <th style="width:95px; text-align:left;">آخر تكلفة سابقة</th>
                <th style="width:115px; text-align:left; color:var(--brand);">آخر تكلفة جديدة</th>
                <th style="width:95px; text-align:left;">سعر البيع الحالي</th>
                <th style="width:95px; text-align:center;">نسبة الربح %</th>
                <th style="width:120px; text-align:left; color:#10B981;">سعر البيع المقترح</th>
                <th style="width:110px; text-align:left; color:var(--text-2);">شامل VAT (15%)</th>
              </tr>
            </thead>
            <tbody id="price-wizard-tbody"></tbody>
          </table>
        </div>
      </div>

      <!-- Footer Action Buttons -->
      <div class="modal-footer" style="padding:12px 20px; border-top:1px solid var(--border-soft); background:var(--bg-card); display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
        <button type="button" class="btn btn-secondary" onclick="window.closePriceWizard()" style="font-size:12px;">
          تخطي والإبقاء على الأسعار السابقة
        </button>
        <div style="display:flex; align-items:center; gap:12px;">
          <span id="wiz-selected-count-label" style="font-size:12px; font-weight:700; color:var(--text-2);">محدد: ${t.length} صنف</span>
          <button type="button" id="wiz-confirm-btn" class="btn btn-primary" onclick="window.confirmPriceWizardUpdates()" style="background:linear-gradient(135deg, #10B981, #059669); border:none; padding:8px 20px; font-weight:800; font-size:12.5px; box-shadow:0 4px 12px rgba(16,185,129,0.3); cursor:pointer;">
            🚀 اعتماد وتحديث أسعار البيع المحددة
          </button>
        </div>
      </div>

    </div>
  `,document.body.appendChild(a),window.renderPriceWizardRows()};window.renderPriceWizardRows=()=>{const t=document.getElementById("price-wizard-tbody");if(!t)return;const n=window._activePriceWizardItems||[];if(n.length===0){t.innerHTML='<tr><td colspan="9" style="text-align:center; padding:20px; color:var(--text-2);">لا توجد أصناف</td></tr>';return}t.innerHTML=n.map((o,e)=>{const a=o.newCost-o.oldCost,i=o.oldCost>0?(a/o.oldCost*100).toFixed(1):"—",r=o.oldCost>0?a>0?`<span style="font-size:10px; color:#DC2626; background:rgba(239,68,68,0.1); padding:1px 4px; border-radius:3px; margin-right:4px;">🔺 +${i}%</span>`:a<0?`<span style="font-size:10px; color:#059669; background:rgba(16,185,129,0.1); padding:1px 4px; border-radius:3px; margin-right:4px;">🔻 ${i}%</span>`:'<span style="font-size:10px; color:var(--text-3); margin-right:4px;">= 0%</span>':'<span style="font-size:10px; color:var(--brand); background:rgba(99,102,241,0.1); padding:1px 4px; border-radius:3px; margin-right:4px;">جديد</span>',s=o.taxCategory==="S"?1.15:1,c=o.newSellingPrice>0?(o.newSellingPrice*s).toFixed(2):"0.00";return`
      <tr style="background:${o.selected?"var(--bg-1)":"rgba(0,0,0,0.02)"}; opacity:${o.selected?"1":"0.55"};">
        <td style="text-align:center;">
          <input type="checkbox" class="wiz-item-check" data-idx="${e}" ${o.selected?"checked":""} onchange="window.toggleWizardItem(${e}, this.checked)" style="cursor:pointer;" />
        </td>
        <td>
          <div style="font-weight:700; color:var(--text-0);">${o.productName}</div>
          <div class="dim mono" style="font-size:10.5px;">${o.sku||"—"}</div>
        </td>
        <td style="text-align:center;">
          <span class="badge neutral" style="font-size:10.5px;">${G(o.unit||"Piece")}</span>
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--text-2);">
          ${w(o.oldCost)}
        </td>
        <td class="mono font-bold" style="text-align:left;">
          <span style="color:var(--brand);">${w(o.newCost)}</span>
          ${r}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--text-1);">
          ${o.currentSellingPrice>0?w(o.currentSellingPrice):'<span class="dim" style="font-size:11px;">غير مسجل</span>'}
        </td>
        <td style="text-align:center;">
          <div style="display:inline-flex; align-items:center; gap:2px;">
            <input type="number" class="form-control mono font-bold" value="${o.targetMarginPct}" min="0" max="500" step="0.5"
              oninput="window.recalcPriceWizardRow(${e}, 'margin', this.value)"
              style="width:55px; height:26px; padding:2px 4px; font-size:11.5px; text-align:center; border:1px solid var(--brand); border-radius:4px;" />
            <span style="font-size:11px; font-weight:700; color:var(--text-2);">%</span>
          </div>
        </td>
        <td style="text-align:left;">
          <input type="number" class="form-control mono font-bold text-good" value="${o.newSellingPrice.toFixed(2)}" min="0" step="0.25"
            oninput="window.recalcPriceWizardRow(${e}, 'price', this.value)"
            style="width:90px; height:26px; padding:2px 6px; font-size:12px; font-weight:800; border:1.5px solid #10B981; border-radius:5px; background:rgba(16,185,129,0.04);" />
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--text-2);" id="wiz-inc-price-${e}">
          ${w(c)}
        </td>
      </tr>
    `}).join(""),window.updateWizardSummaryLabel()};window.recalcPriceWizardRow=(t,n,o)=>{const e=window._activePriceWizardItems[t];if(!e)return;const a=window._activePriceWizardMode||"markup",i=e.taxCategory==="S"?1.15:1;if(n==="margin"){const r=parseFloat(o)||0;e.targetMarginPct=r,e.marginType=a,a==="margin"&&r<100?e.newSellingPrice=Math.round(e.newCost/(1-r/100)*100)/100:e.newSellingPrice=Math.round(e.newCost*(1+r/100)*100)/100;const s=document.getElementById("price-wizard-tbody")?.children[t];if(s){const c=s.querySelector("input[oninput*='price']");c&&(c.value=e.newSellingPrice.toFixed(2));const f=document.getElementById(`wiz-inc-price-${t}`);f&&(f.textContent=w(e.newSellingPrice*i))}}else if(n==="price"){const r=parseFloat(o)||0;e.newSellingPrice=r,e.newCost>0&&r>0?a==="margin"?e.targetMarginPct=Math.round((r-e.newCost)/r*1e3)/10:e.targetMarginPct=Math.round((r-e.newCost)/e.newCost*1e3)/10:e.targetMarginPct=0;const s=document.getElementById("price-wizard-tbody")?.children[t];if(s){const c=s.querySelector("input[oninput*='margin']");c&&(c.value=e.targetMarginPct);const f=document.getElementById(`wiz-inc-price-${t}`);f&&(f.textContent=w(e.newSellingPrice*i))}}};window.applyUniformMarginToWizard=()=>{const t=parseFloat(document.getElementById("wiz-uniform-margin")?.value)||15,n=window._activePriceWizardMode||"markup";(window._activePriceWizardItems||[]).forEach(o=>{o.targetMarginPct=t,o.marginType=n,n==="margin"&&t<100?o.newSellingPrice=Math.round(o.newCost/(1-t/100)*100)/100:o.newSellingPrice=Math.round(o.newCost*(1+t/100)*100)/100}),window.renderPriceWizardRows(),window.showToast?.(`تم تطبيق هامش ${t}% على جميع أصناف المعالج`,"info")};window.switchWizardMarginType=t=>{window._activePriceWizardMode=t;const n=document.getElementById("wiz-mode-markup"),o=document.getElementById("wiz-mode-margin");n&&o&&(t==="markup"?(n.className="btn btn-sm btn-primary",o.className="btn btn-sm btn-ghost"):(n.className="btn btn-sm btn-ghost",o.className="btn btn-sm btn-primary")),(window._activePriceWizardItems||[]).forEach(e=>{e.marginType=t;const a=e.targetMarginPct||15;t==="margin"&&a<100?e.newSellingPrice=Math.round(e.newCost/(1-a/100)*100)/100:e.newSellingPrice=Math.round(e.newCost*(1+a/100)*100)/100}),window.renderPriceWizardRows()};window.toggleAllWizardItems=t=>{(window._activePriceWizardItems||[]).forEach(n=>{n.selected=t}),window.renderPriceWizardRows()};window.toggleWizardItem=(t,n)=>{const o=window._activePriceWizardItems[t];o&&(o.selected=n),window.renderPriceWizardRows()};window.updateWizardSummaryLabel=()=>{const t=(window._activePriceWizardItems||[]).filter(o=>o.selected).length,n=document.getElementById("wiz-selected-count-label");n&&(n.textContent=`محدد: ${t} من ${window._activePriceWizardItems.length} صنف`)};window.confirmPriceWizardUpdates=async()=>{const t=document.getElementById("wiz-confirm-btn");t&&(t.disabled=!0,t.textContent="⏳ جارٍ التحديث...");const n=(window._activePriceWizardItems||[]).filter(e=>e.selected&&e.newSellingPrice>0);if(n.length===0){window.showToast?.("لم يتم تحديد أي صنف للتحديث","warn"),window.closePriceWizard();return}let o=0;try{const{doc:e,updateDoc:a,serverTimestamp:i}=await V(async()=>{const{doc:r,updateDoc:s,serverTimestamp:c}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:r,updateDoc:s,serverTimestamp:c}},[]);await Promise.all(n.map(async r=>{try{const s=e(q,`companies/${j}/products`,r.productId);await a(s,{salePrice:r.newSellingPrice,sellingPrice:r.newSellingPrice,priceRetail:r.newSellingPrice,targetMarginPct:r.targetMarginPct,marginType:r.marginType,lastPriceUpdateDate:nt(),updatedAt:i()}),o++}catch(s){console.warn("[PriceWizard] Failed to update price for",r.productId,s)}})),window.closePriceWizard(),window.showToast?.(`✅ تم بنجاح تحديث أسعار البيع لـ (${o}) صنف وفق آخر أسعار الشراء`,"success"),typeof $t<"u"&&($t=[]),window.loadProducts&&window.loadProducts(!0)}catch(e){console.error("[PriceWizard] Batch update failed:",e),window.showToast?.("حدث خطأ أثناء تحديث الأسعار: "+e.message,"error")}finally{t&&(t.disabled=!1,t.textContent="🚀 اعتماد وتحديث أسعار البيع المحددة")}};window.closePriceWizard=()=>{const t=document.getElementById("price-wizard-overlay");t&&t.remove(),window._activePriceWizardItems=[]};export{Le as render};
