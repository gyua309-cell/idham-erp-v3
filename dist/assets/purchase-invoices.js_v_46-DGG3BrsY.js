const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/balance-sync-D_Qo7lf4.js","assets/index-T8P1GM2w.js","assets/index-Dq7oGj9k.css","assets/accounting-engine-BP8YIZdW.js"])))=>i.map(i=>d[i]);
import{t as X,g as W,a as T,z as Nt,q as Qt,f as E,d as j,C as L,b as Ht,c as Jt,i as ce,P as pe,F as Gt,j as tt,u as et,o as Xt,x as kt,_ as A,M as Dt,N as Mt,I as ue,J as me,r as ge}from"./index-T8P1GM2w.js";import{autoPurchaseJE as Kt}from"./accounting-engine-BP8YIZdW.js";import{ref as ye,uploadBytes as be,getDownloadURL as xe}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import{orderBy as K,limit as _t,where as bt,query as xt,getDocs as vt,getDoc as Yt,doc as Zt,collection as te}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";function G(e){return{Piece:"حبة",Carton:"كرتون",Box:"صندوق",Bag:"كيس",Pack:"شد",Sack:"شوال",Bale:"بالة",Barrel:"برميل",Tray:"طبق",Gallon:"جالون",Kilogram:"كيلو",Ton:"طن",Liter:"لتر",Gram:"جرام",Can:"علبة",Bottle:"زجاجة",Meter:"متر",Tank:"تنك",Roll:"رول",Pallet:"باليت",PCS:"حبة"}[e]||e||""}window.translateUnit=G;let v=[],P=null,ve=new Map,yt=null,pt=[],Ct=[],_="date",ct=!1;window.sortPurList=e=>{_===e?ct=!ct:(_=e,ct=!(e==="date"||e==="createdAt")),loadPurchaseList()};function J(e){return _!==e?'<span style="color:var(--text-3); font-size:10px; margin-right:4px;">⇅</span>':ct?'<span style="color:var(--brand); font-size:10px; margin-right:4px;">▲</span>':'<span style="color:var(--brand); font-size:10px; margin-right:4px;">▼</span>'}window.getSortArrowPur=J;async function Ce(e,a){e.innerHTML=he(),setTimeout(()=>{const t=document.getElementById("pur-text-filter");if(t){const n=window.debounce?window.debounce(()=>loadPurchaseList(),300):()=>loadPurchaseList();t.addEventListener("input",n)}},100),await Promise.all([fe(),we(),loadPurchaseList()]),Ie(),Pe(),U();const o=sessionStorage.getItem("convert_grpo_to_invoice");if(o){sessionStorage.removeItem("convert_grpo_to_invoice");try{const t=JSON.parse(o);setTimeout(()=>{window.openPurchaseModalFromGRPO(t)},150)}catch(t){console.error(t)}}}function he(){return`
  <!-- Filter Bar -->
  <div class="filterbar">
    <div class="date-range-group"><label>من</label>
      <input type="date" id="pur-from" value="${new Date(new Date().setDate(1)).toISOString().split("T")[0]}"
        onchange="loadPurchaseList()" />
    </div>
    <div class="date-range-group"><label>إلى</label>
      <input type="date" id="pur-to" value="${X()}" onchange="loadPurchaseList()" />
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
            <th onclick="sortPurList('number')" style="cursor:pointer; user-select:none;">رقم الفاتورة ${J("number")}</th>
            <th onclick="sortPurList('date')" style="cursor:pointer; user-select:none;">التاريخ ${J("date")}</th>
            <th onclick="sortPurList('supplierName')" style="cursor:pointer; user-select:none;">المورد ${J("supplierName")}</th>
            <th onclick="sortPurList('warehouseName')" style="cursor:pointer; user-select:none;">المخزن ${J("warehouseName")}</th>
            <th onclick="sortPurList('subtotal')" style="cursor:pointer; user-select:none;">المجموع قبل VAT ${J("subtotal")}</th>
            <th onclick="sortPurList('totalVat')" style="cursor:pointer; user-select:none;">VAT 15% ${J("totalVat")}</th>
            <th onclick="sortPurList('totalWithVat')" style="cursor:pointer; user-select:none;">الإجمالي ${J("totalWithVat")}</th>
            <th onclick="sortPurList('status')" style="cursor:pointer; user-select:none;">الحالة ${J("status")}</th>
            <th onclick="sortPurList('journalEntryId')" style="cursor:pointer; user-select:none;">قيد ${J("journalEntryId")}</th>
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
  <div class="modal-overlay" id="purchase-modal" onclick="if(event.target===this)closeModal('purchase-modal')">
    <div class="modal modal-xl" style="max-width:98vw; width:98vw; height:96vh; max-height:96vh; display:flex; flex-direction:column; padding:0; overflow:hidden; border-radius:16px; background:var(--bg-1); box-shadow:0 25px 60px -15px rgba(0,0,0,0.5);">
      
      <!-- Modal Header -->
      <div class="modal-header" style="padding:12px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); flex-shrink:0;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:34px; height:34px; border-radius:8px; background:linear-gradient(135deg, #6366F1, #4F46E5); display:flex; align-items:center; justify-content:center; color:#fff; font-size:16px;">
            🏢
          </div>
          <div>
            <h3 class="modal-title" id="pur-modal-title" style="margin:0; font-size:15px; font-weight:900; color:var(--text-0);">
              فاتورة مشتريات وتوريد بضاعة
            </h3>
            <div style="font-size:11px; color:var(--text-2); margin-top:1px;">
              توثيق الشراء • الخصومات التجارية • البونص المجاني • تحديث تكلفة الأصناف
            </div>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
          <!-- Invoice Tax Type Selector (Standard Tax vs Non-Tax) -->
          <div style="display:inline-flex; background:var(--bg-2); padding:3px; border-radius:8px; border:1px solid var(--border-soft); gap:3px;">
            <button type="button" id="pur-type-btn-taxable" class="btn btn-sm btn-primary" onclick="setPurchaseInvoiceType('taxable')" style="padding:4px 10px; font-size:11.5px; font-weight:800; border-radius:6px; display:inline-flex; align-items:center; gap:4px; cursor:pointer;">
              <span>🏢</span> فاتورة ضريبية (15%)
            </button>
            <button type="button" id="pur-type-btn-nontax" class="btn btn-sm btn-ghost" onclick="setPurchaseInvoiceType('non_tax')" style="padding:4px 10px; font-size:11.5px; font-weight:800; border-radius:6px; display:inline-flex; align-items:center; gap:4px; color:#059669; cursor:pointer;">
              <span>🟢</span> غير ضريبية (0%)
            </button>
          </div>
          <input type="hidden" id="pur-invoice-type" value="taxable" />

          <span class="badge" id="pur-live-badge-status" style="background:rgba(99,102,241,0.12); color:var(--brand); font-weight:800; font-size:11px; padding:4px 8px;">
            📝 فاتورة جديدة
          </span>
          <button class="modal-close" onclick="closeModal('purchase-modal')" style="font-size:20px; line-height:1;">×</button>
        </div>
      </div>

      <!-- Modal Body (Optimized Clean Workspace) -->
      <div class="modal-body" style="padding:14px 18px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:10px; background:var(--bg-3);">
        
        <!-- Pinned Supplier Warning Alert -->
        <div id="sup-warning-alert" class="alert bad hidden" style="margin-bottom:6px; padding:8px 12px; font-size:12px; font-weight:800; border-radius:8px; display:flex; align-items:center; gap:8px;"></div>

        <!-- Section 1: Compact Ergonomic Header Grid (2 Rows Only) -->
        <div class="card" style="padding:10px 14px; border-radius:10px; background:var(--bg-card); border:1px solid var(--border-soft); flex-shrink:0;">
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:10px 14px; align-items:center;">
            
            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-weight:700; font-size:11px; margin-bottom:2px;">رقم الفاتورة (System)</label>
              <input type="text" id="pur-inv-number" class="form-control mono font-bold" readonly
                style="background:var(--bg-2); color:var(--brand); font-size:12px; height:32px; padding:4px 8px;" placeholder="يُولَّد تلقائياً" />
            </div>

            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-weight:700; font-size:11px; margin-bottom:2px;">تاريخ الفاتورة <span class="text-bad">*</span></label>
              <input type="date" id="pur-inv-date" class="form-control mono font-bold" value="${X()}" style="height:32px; padding:4px 8px; font-size:12px;" />
            </div>

            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-weight:700; font-size:11px; margin-bottom:2px;">فاتورة المورد الورقية / المرجع</label>
              <input type="text" id="pur-ref-num" class="form-control mono font-bold" placeholder="INV-SUPP-00123" style="height:32px; padding:4px 8px; font-size:12px;" />
            </div>

            <div class="form-group" style="margin:0; min-width:210px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                <label class="form-label" style="font-weight:700; font-size:11px; margin:0;">المورد <span class="text-bad">*</span></label>
                <button type="button" id="pur-sup-360-btn" class="btn btn-ghost sm hidden" style="font-size:10px; padding:0 3px; color:var(--brand);" onclick="window.viewSupplierIntelligence360(document.getElementById('supplier-id').value)">👁️ 360°</button>
              </div>
              <div class="autocomplete-container">
                <input type="text" id="supplier-search" class="form-control font-bold"
                  placeholder="ابحث باسم المورد…" autocomplete="off" style="height:32px; padding:4px 8px; font-size:12px;" />
                <div class="autocomplete-results hidden" id="supplier-results"></div>
                <input type="hidden" id="supplier-id" />
              </div>
            </div>

            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-weight:700; font-size:11px; margin-bottom:2px;">المخزن المستلِم <span class="text-bad">*</span></label>
              <select id="pur-warehouse" class="form-control font-bold" style="height:32px; padding:4px 8px; font-size:12px;">
                <option value="">اختر المستودع</option>
              </select>
            </div>

            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-weight:700; font-size:11px; margin-bottom:2px;">طريقة السداد</label>
              <select id="pur-payment" class="form-control font-bold" style="height:32px; padding:4px 8px; font-size:12px;">
                <option value="credit">آجل (سداد لاحق)</option>
                <option value="cash">نقدي فوري (من الخزينة)</option>
                <option value="transfer">تحويل بنكي</option>
                <option value="check">شيك مصرفي</option>
              </select>
            </div>

            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-weight:700; font-size:11px; margin-bottom:2px;">الاستحقاق (Due Date)</label>
              <input type="date" id="pur-due-date" class="form-control mono" style="height:32px; padding:4px 8px; font-size:11.5px;" />
            </div>

            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-weight:700; font-size:11px; margin-bottom:2px;">ضريبة المورد (VAT)</label>
              <input type="text" id="pur-supplier-vat" class="form-control mono" placeholder="300000000000003" style="height:32px; padding:4px 8px; font-size:11.5px;" />
            </div>

            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-weight:700; font-size:11px; margin-bottom:2px;">المرفق (صورة/PDF)</label>
              <input type="file" id="pur-attachment" class="form-control" accept="image/*,application/pdf" style="height:32px; padding:2px 4px; font-size:11px;" />
            </div>

          </div>
        </div>

        <!-- Section 2: Huge Items Workspace (المساحة الكبرى للأصناف) -->
        <div class="card" style="padding:12px 14px; border-radius:10px; background:var(--bg-card); border:1px solid var(--border-soft); flex:1; display:flex; flex-direction:column; min-height:420px;">
          
          <!-- Smart Action Toolbar -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <strong style="font-size:13.5px; color:var(--text-0);">📋 بنود وأصناف الفاتورة</strong>
              <span class="badge" id="pur-items-badge" style="font-size:11px; background:var(--bg-2);">0 صنف</span>
            </div>

            <!-- Smart Import Buttons -->
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <button type="button" class="btn btn-secondary btn-sm" onclick="window.openImportPOModal()" title="استيراد من أمر شراء" style="font-size:11px; padding:4px 8px;">
                📋 استيراد من PO
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="window.openImportQuoteModal()" title="استيراد من عرض سعر مورد" style="font-size:11px; padding:4px 8px;">
                📑 استيراد عرض سعر
              </button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="window.openImportDeliveryModal()" title="استيراد من شحنة واردة" style="font-size:11px; padding:4px 8px;">
                🚚 استيراد شحنة
              </button>
              <button type="button" class="btn btn-secondary btn-sm" style="color:var(--brand); font-size:11px; padding:4px 8px;" onclick="window.openQuickProductModal()" title="إضافة صنف جديد سريع">
                + صنف جديد
              </button>
            </div>
          </div>

          <!-- Search & Add Product Row -->
          <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px; background:var(--bg-2); padding:6px 10px; border-radius:8px;">
            <select id="pur-product-category-filter" class="form-control" style="width:160px; height:34px; font-size:12px;">
              <option value="">كل الفئات</option>
            </select>
            <div class="autocomplete-container" style="flex:1;">
              <input type="text" id="pur-product-search" class="form-control"
                placeholder="🔍 ابحث بالاسم، الكود، أو امسح الباركود لإضافة الصنف مباشرة للفاتورة... [F8 للبحث المتقدم]" autocomplete="off"
                style="height:34px; font-size:13px; font-weight:600; padding:6px 12px; background:var(--bg-card);" />
              <div class="autocomplete-results hidden" id="pur-product-results"></div>
            </div>
          </div>

          <!-- Lines Table (Expanded Height Workspace) -->
          <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px; flex:1; min-height:300px; max-height:calc(100vh - 430px); overflow-y:auto; background:var(--bg-1);">
            <table class="data-dense" style="margin:0; font-size:12px; width:100%;">
              <thead>
                <tr style="background:var(--bg-3); position:sticky; top:0; z-index:2; box-shadow:0 1px 2px rgba(0,0,0,0.06);">
                  <th style="width:30px; text-align:center;">#</th>
                  <th style="width:90px;">كود الصنف</th>
                  <th>اسم الصنف</th>
                  <th style="width:80px;">الوحدة</th>
                  <th style="width:85px; text-align:center;">الكمية</th>
                  <th style="width:85px; text-align:center; color:#10B981;" title="كميات إضافية مجانية ممنوحة من المورد">🎁 بونص</th>
                  <th style="width:100px; text-align:left;">السعر</th>
                  <th style="width:80px; text-align:center;" title="نسبة الخصم الخاصة بالبند %">خصم%</th>
                  <th style="width:100px; text-align:left; color:var(--brand);" title="صافي تكلفة الوحدة بعد الخصم">صافي الوحدة</th>
                  <th style="width:100px;">التشغيلة (Lot)</th>
                  <th style="width:115px;">الانتهاء</th>
                  <th style="width:55px; text-align:center;">VAT</th>
                  <th style="width:110px; text-align:left; color:var(--brand);">الإجمالي</th>
                  <th style="width:35px;"></th>
                </tr>
              </thead>
              <tbody id="pur-lines-tbody"></tbody>
            </table>
          </div>
        </div>

        <!-- Section 3: Docked Financial Summary & Notes -->
        <div style="display:grid; grid-template-columns: 1fr 1.1fr; gap:12px; flex-shrink:0;">
          
          <!-- Left Box: Global Discount & Notes -->
          <div class="card" style="padding:10px 14px; border-radius:10px; background:var(--bg-card); border:1px solid var(--border-soft); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div class="grid-2 gap-10 mb-8">
                <div class="form-group" style="margin:0;">
                  <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:2px;">نوع الخصم العام</label>
                  <select id="pur-global-discount-type" class="form-control" onchange="window.recalcPurchaseTotals()" style="height:30px; padding:3px 8px; font-size:11.5px;">
                    <option value="pct">نسبة مئوية (%)</option>
                    <option value="amount">مبلغ مقطوع (ر.س)</option>
                  </select>
                </div>
                <div class="form-group" style="margin:0;">
                  <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:2px;">قيمة الخصم العام</label>
                  <input type="number" id="pur-global-discount-val" class="form-control mono font-bold" placeholder="0.00" min="0" step="0.5" oninput="window.recalcPurchaseTotals()" style="height:30px; padding:3px 8px; font-size:12px;" />
                </div>
              </div>

              <div class="grid-2 gap-10 mb-8">
                <div class="form-group" style="margin:0;">
                  <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:2px;">مصاريف شحن/نقل (Freight)</label>
                  <input type="number" id="pur-freight-val" class="form-control mono" placeholder="0.00" min="0" step="1" oninput="window.recalcPurchaseTotals()" style="height:30px; padding:3px 8px; font-size:12px;" />
                </div>
                <div class="form-group" style="margin:0;">
                  <label style="font-size:11px; font-weight:700; color:var(--text-2); margin-bottom:2px;">شروط وملاحظات التوريد</label>
                  <input type="text" id="pur-notes" class="form-control" placeholder="أي ملاحظة أو شروط سداد إضافية…" style="height:30px; padding:3px 8px; font-size:11.5px;" />
                </div>
              </div>
            </div>

            <!-- Savings & Bonus Summary Banner -->
            <div id="pur-savings-banner" style="background:rgba(16,185,129,0.06); border:1px dashed rgba(16,185,129,0.3); padding:6px 12px; border-radius:8px; font-size:11.5px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span style="color:#10B981; font-weight:800;">🎁 إجمالي البونص: </span>
                <b id="pur-total-bonus-label" class="mono font-bold">0 كرتون مجاني</b>
              </div>
              <div>
                <span style="color:var(--brand); font-weight:800;">💰 إجمالي الوفر: </span>
                <b id="pur-total-savings-label" class="mono font-bold text-good">0.00 ر.س</b>
              </div>
            </div>
          </div>

          <!-- Right Box: Financial Totals Breakdown -->
          <div class="card" style="padding:10px 14px; border-radius:10px; background:var(--bg-card); border:1.5px solid var(--border-soft); display:flex; flex-direction:column; justify-content:space-between;">
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:4px 12px; font-size:12px;">
              
              <div class="invoice-total-row" style="display:flex; justify-content:space-between; padding:2px 0;">
                <span style="color:var(--text-2);">قبل الخصم:</span>
                <span class="mono font-bold" id="pur-gross-subtotal">0.00 ر.س</span>
              </div>

              <div class="invoice-total-row" style="display:flex; justify-content:space-between; padding:2px 0;">
                <span style="color:var(--text-2);">خصومات البنود:</span>
                <span class="mono font-bold text-bad" id="pur-line-discounts">- 0.00 ر.س</span>
              </div>

              <div class="invoice-total-row" style="display:flex; justify-content:space-between; padding:2px 0;">
                <span style="color:var(--text-2);">الخصم العام:</span>
                <span class="mono font-bold text-bad" id="pur-global-discount-amount">- 0.00 ر.س</span>
              </div>

              <div class="invoice-total-row" style="display:flex; justify-content:space-between; padding:2px 0;">
                <span style="color:var(--text-1); font-weight:700;">صافي الوعاء (15%):</span>
                <span class="mono font-bold text-brand" id="pur-net-taxable">0.00 ر.س</span>
              </div>

              <div class="invoice-total-row" id="pur-exempt-row" style="display:flex; justify-content:space-between; padding:2px 0;">
                <span style="color:var(--text-2);">معفاة (0%):</span>
                <span class="mono font-bold text-good" id="pur-net-exempt">0.00 ر.س</span>
              </div>

              <div class="invoice-total-row" style="display:flex; justify-content:space-between; padding:2px 0;">
                <span style="color:var(--text-2);">ضريبة (15% VAT):</span>
                <span class="mono font-bold text-warn" id="pur-vat">0.00 ر.س</span>
              </div>

              <div class="invoice-total-row" style="display:flex; justify-content:space-between; padding:2px 0;">
                <span style="color:var(--text-2);">الشحن والنقل:</span>
                <span class="mono font-bold" id="pur-freight-label">+ 0.00 ر.س</span>
              </div>

            </div>

            <div class="invoice-total-row grand-total"
              style="border-top:2px solid var(--brand); margin-top:6px; padding-top:6px; display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:14px; font-weight:900; color:var(--text-0);">الإجمالي النهائي المستحق:</span>
              <span class="mono" style="font-size:18px; font-weight:900; color:var(--brand);" id="pur-grand">0.00 ر.س</span>
            </div>
          </div>

        </div>

        <div id="pur-form-error" class="alert bad hidden" style="margin-top:6px;"></div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer" style="padding:10px 20px; background:var(--bg-card); border-top:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
        <button class="btn btn-ghost" onclick="closeModal('purchase-modal')">إلغاء</button>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary" onclick="printPurchasePreview()">🖨️ معاينة وطباعة</button>
          <button class="btn btn-warning" onclick="generatePurchaseOrder()" style="background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;">📋 أمر شراء / عرض سعر</button>
          <button class="btn btn-primary" onclick="savePurchase()" id="save-pur-btn" style="padding:7px 22px; font-weight:800; font-size:13px;">
            💾 حفظ واعتماد الفاتورة
          </button>
        </div>
      </div>
    </div>
  </div>

      <!-- Modal Footer -->
      <div class="modal-footer" style="padding:14px 24px; background:var(--bg-card); border-top:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
        <button class="btn btn-ghost" onclick="closeModal('purchase-modal')">إلغاء</button>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary" onclick="printPurchasePreview()">🖨️ معاينة وطباعة</button>
          <button class="btn btn-warning" onclick="generatePurchaseOrder()" style="background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;">📋 أمر شراء / عرض سعر</button>
          <button class="btn btn-primary" onclick="savePurchase()" id="save-pur-btn" style="padding:8px 20px; font-weight:800;">
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
  </div>`}async function fe(){try{const e=document.getElementById("pur-supplier-filter");if(e){e.innerHTML='<option value="">الكل</option>';const a=await W(T.suppliers());a.sort((o,t)=>(o.name||"").localeCompare(t.name||"")),a.forEach(o=>{e.innerHTML+=`<option value="${o.id}">${o.name}</option>`})}}catch(e){console.error("loadSuppliersDropdown failed:",e)}}async function we(){try{const e=await W(T.warehouses());e.sort((t,n)=>(t.name||"").localeCompare(n.name||""));const a=document.getElementById("pur-warehouse");a&&(a.innerHTML='<option value="">اختر المستودع...</option>',e.forEach(t=>a.innerHTML+=`<option value="${t.id}" data-name="${t.name}">${t.name}</option>`));const o=document.getElementById("pur-warehouse-filter");o&&(o.innerHTML='<option value="">كل المستودعات</option>',e.forEach(t=>o.innerHTML+=`<option value="${t.id}">${t.name}</option>`))}catch(e){console.error("loadWarehousesPurchase failed:",e)}try{const e=await Nt("PUR"),a=document.getElementById("pur-inv-number");a&&(a.value=e)}catch{}}window.loadPurchaseList=async()=>{const e=document.getElementById("pur-tbody");if(e){e.innerHTML=`${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(10).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;try{const a=[K("createdAt","desc"),_t(1e3)],o=document.getElementById("pur-status-filter")?.value;o&&a.unshift(bt("status","==",o));const t=xt(T.purchaseInvoices(),...a);let s=(await vt(t)).docs.map(l=>({id:l.id,...l.data()}));s.forEach(l=>ve.set(l.id,l));const i=document.getElementById("pur-from")?.value,r=document.getElementById("pur-to")?.value;(i||r)&&(s=s.filter(l=>{const c=l.date||(l.createdAt?.toDate?l.createdAt.toDate().toISOString().split("T")[0]:"");return(!i||c>=i)&&(!r||c<=r)}));const p=document.getElementById("pur-supplier-filter")?.value;p&&(s=s.filter(l=>l.supplierId===p));const h=document.getElementById("pur-warehouse-filter")?.value;h&&(s=s.filter(l=>l.warehouseId===h));const y=document.getElementById("pur-tax-type-filter")?.value;y==="non_tax"?s=s.filter(l=>l.invoiceType==="non_tax"||l.isTaxExempt||l.totalVat===0&&(l.exemptSubtotal>0||l.totalWithVat>0&&l.totalVat===0)):y==="taxable"&&(s=s.filter(l=>l.invoiceType!=="non_tax"&&!l.isTaxExempt&&(l.totalVat>0||!l.exemptSubtotal&&l.taxableSubtotal>0))),_&&s.sort((l,c)=>{let u=l[_],b=c[_];return _==="createdAt"?(u=l.createdAt?.seconds||0,b=c.createdAt?.seconds||0):_==="date"?(u=l.date||(l.createdAt?.toDate?l.createdAt.toDate().toISOString().split("T")[0]:""),b=c.date||(c.createdAt?.toDate?c.createdAt.toDate().toISOString().split("T")[0]:"")):_==="supplierName"?(u=l.supplierName||"",b=c.supplierName||""):_==="warehouseName"?(u=l.warehouseName||"",b=c.warehouseName||""):_==="subtotal"||_==="totalVat"||_==="totalWithVat"?(u=Number(u||0),b=Number(b||0)):_==="number"?(u=l.number||"",b=c.number||""):_==="status"?(u=l.status||"",b=c.status||""):_==="journalEntryId"&&(u=l.journalEntryId?1:0,b=c.journalEntryId?1:0),typeof u=="string"?ct?u.localeCompare(b):b.localeCompare(u):ct?u-b:b-u});const f=s.filter(l=>l.status!=="cancelled"),w=f.reduce((l,c)=>l+(c.totalWithVat||0),0);let x=0;try{const l=[...new Set(f.map(c=>c.supplierId).filter(Boolean))];if(l.length>0){const u=(await Promise.all(l.map(b=>Yt(Zt(j,`companies/${L}/suppliers`,b)).then(m=>m.exists()?Math.max(0,m.data().balance||0):0).catch(()=>0)))).reduce((b,m)=>b+m,0);x=Math.min(u,w)}}catch(l){console.warn("[KPI] supplier balance fetch failed, falling back to status:",l.message),x=f.reduce((c,u)=>{const b=(u.status||"").toLowerCase();return b==="paid"||b==="cash"?c:b==="partial"?c+Math.max(0,(u.totalWithVat||0)-(u.paidAmount||0)):c+(u.totalWithVat||0)},0)}const g=Math.max(0,w-x);if(document.getElementById("pur-kpi-total").textContent=E(w),document.getElementById("pur-kpi-unpaid").textContent=E(x),document.getElementById("pur-kpi-paid").textContent=E(g),document.getElementById("pur-kpi-count").textContent=s.length,document.getElementById("pur-count").textContent=`${s.length} فاتورة`,s.length===0){e.innerHTML=`<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--text-2);">
        لا توجد فواتير في الفترة المحددة</td></tr>`;return}e.innerHTML=s.map(l=>{const c=l.invoiceType==="non_tax"||l.isTaxExempt||l.totalVat===0&&(l.exemptSubtotal>0||l.totalWithVat>0&&l.totalVat===0),u=c?'<span class="badge" style="background:rgba(16,185,129,0.12); color:#059669; font-size:10px; font-weight:700; border:1px solid rgba(16,185,129,0.25); display:block; margin-top:3px; width:fit-content;">🟢 غير ضريبية</span>':'<span class="badge" style="background:rgba(99,102,241,0.08); color:var(--brand); font-size:10px; font-weight:700; border:1px solid rgba(99,102,241,0.2); display:block; margin-top:3px; width:fit-content;">🏢 ضريبية</span>';return`
      <tr style="cursor:pointer;" onclick="viewPurchaseInvoice('${l.id}')">
        <td class="mono text-indigo">
          <strong>${l.number||l.id.slice(0,8)}</strong>
          ${u}
        </td>
        <td class="dim">${Ht(l.date||l.createdAt)}</td>
        <td class="font-semibold">${l.supplierName||"—"}</td>
        <td class="dim" style="font-size:11px;">${l.warehouseName||"—"}</td>
        <td class="mono">${E(l.subtotal||0)}</td>
        <td class="mono ${c?"text-good":"text-warn"}">${c?'<span class="dim">0% (معفى)</span>':E(l.totalVat||0)}</td>
        <td class="mono font-bold">${E(l.totalWithVat||0)}</td>
        <td>${Jt(l.status)}</td>
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
      </tr>`}).join("")}catch(a){e.innerHTML=`<tr><td colspan="10">
      <div class="alert bad" style="margin:8px;">${a.message}</div></td></tr>`}}};function Ie(){const e=document.getElementById("supplier-search"),a=document.getElementById("supplier-results");e&&(e.addEventListener("input",Qt(async()=>{const o=e.value.trim().toLowerCase();if(o.length<1){a.classList.add("hidden");return}try{(!yt||yt.length===0)&&(yt=await W(T.suppliers(),[K("name")]));const t=yt.filter(n=>(n.name||"").toLowerCase().includes(o)||(n.phone||"").includes(o)).slice(0,15);if(!t.length){a.classList.add("hidden");return}a.innerHTML=t.map(n=>`
        <div class="autocomplete-item" onclick="selectPurSupplier('${n.id}','${(n.name||"").replace(/'/g,"\\'")}','${n.vatNumber||""}')">
          <div>${n.name}</div>
          <div class="item-code">${n.phone||""} ${n.vatNumber?"| VAT: "+n.vatNumber:""}</div>
        </div>`).join(""),a.classList.remove("hidden")}catch(t){console.warn("setupSupplierAC error:",t)}},100)),document.addEventListener("click",o=>{e.contains(o.target)||a.classList.add("hidden")}))}window.selectPurSupplier=(e,a,o)=>{document.getElementById("supplier-id").value=e,document.getElementById("supplier-search").value=a,document.getElementById("supplier-results").classList.add("hidden"),o&&(document.getElementById("pur-supplier-vat").value=o);const t=document.getElementById("sup-warning-alert"),n=(yt||[]).find(s=>s.id===e);n&&n.pinnedWarningNote&&t?(t.innerHTML=`⚠️ <b>تنبيه مثبت:</b> ${n.pinnedWarningNote}`,t.classList.remove("hidden")):t&&t.classList.add("hidden")};window.openNewPurchaseModal=(e,a,o=[])=>{typeof window.openPurchaseModal=="function"&&(window.openPurchaseModal(),e&&window.selectPurSupplier(e,a,""),o&&o.length&&(v=o.map(t=>({productId:t.productId,name:t.productName||t.name,unit:t.unit||"كرتون",qty:parseFloat(t.qty||1),unitPrice:parseFloat(t.unitPrice||0),vatRate:15,total:parseFloat(t.qty||1)*parseFloat(t.unitPrice||0)*1.15})),U(),typeof recalcPurchaseTotals=="function"&&recalcPurchaseTotals()))};function Pe(){const e=document.getElementById("pur-product-search"),a=document.getElementById("pur-product-results"),o=document.getElementById("pur-product-category-filter");if(!e)return;const t=()=>{const n=e.value.trim().toLowerCase(),s=o?o.value:"";if(!n&&!s){a.classList.add("hidden");return}let i=pt;if(s&&(i=i.filter(r=>r.category===s)),n&&(i=i.filter(r=>(r.name||"").toLowerCase().includes(n)||(r.sku||"").toLowerCase().includes(n)||(r.barcode||"").includes(n))),i=i.slice(0,15),!i.length){a.innerHTML='<div style="padding:10px;text-align:center;color:var(--text-2);font-size:12px;">لا توجد نتائج</div>',a.classList.remove("hidden");return}a.innerHTML=i.map(r=>`
      <div class="autocomplete-item"
        onclick="addPurLine('${r.id}','${(r.name||"").replace(/'/g,"\\'")}',${r.costPrice||0},'${r.unit||"Piece"}','${r.sku||""}','${r.taxCategory||"S"}','${r.altUnit||""}',${r.unitFactor||1})">
        <div class="flex justify-between">
          <span>${r.name}</span>
          <span class="mono text-indigo">${E(r.costPrice||0)}</span>
        </div>
        <div class="item-code">${r.sku||""} | الوحدة: ${r.unit||""}${r.altUnit&&r.unitFactor>1?` | <span style="color:#d97706;font-weight:700;">📦 ${r.unitFactor} ${r.unit} = 1 ${r.altUnit}</span>`:""}</div>
      </div>`).join(""),a.classList.remove("hidden")};e.addEventListener("input",Qt(t,200)),e.addEventListener("focus",t),o&&o.addEventListener("change",t),document.addEventListener("click",n=>{!e.contains(n.target)&&!a.contains(n.target)&&(!o||!o.contains(n.target))&&a.classList.add("hidden")})}async function ee(){try{if(pt.length===0||Ct.length===0){const[a,o]=await Promise.all([W(T.products(),[K("name")]),W(T.categories(),[K("name")])]);pt=a,Ct=o}const e=document.getElementById("pur-product-category-filter");e&&(e.innerHTML='<option value="">كل الفئات</option>'+Ct.map(a=>`<option value="${a.id}">${a.name}</option>`).join(""))}catch(e){console.error("loadProductsAndCategories error:",e)}}window.setPurchaseInvoiceType=e=>{const a=document.getElementById("pur-invoice-type"),o=document.getElementById("pur-type-btn-taxable"),t=document.getElementById("pur-type-btn-nontax");e==="non_tax"?(a&&(a.value="non_tax"),o&&(o.className="btn btn-sm btn-ghost",o.style.background="transparent",o.style.color="var(--text-2)"),t&&(t.className="btn btn-sm btn-primary",t.style.background="#059669",t.style.color="#ffffff"),v.forEach(n=>{n.taxCategory="E"})):(a&&(a.value="taxable"),o&&(o.className="btn btn-sm btn-primary",o.style.background="",o.style.color=""),t&&(t.className="btn btn-sm btn-ghost",t.style.background="transparent",t.style.color="#059669"),v.forEach(n=>{n.taxCategory="S"})),U(),Q()};window.addPurLine=(e,a,o,t,n,s,i,r)=>{document.getElementById("pur-product-search").value="",document.getElementById("pur-product-results").classList.add("hidden");const p=document.getElementById("pur-invoice-type")?.value==="non_tax";v.push({productId:e,productName:a,sku:n||"",unit:t||"Piece",altUnit:i||"",unitFactor:parseFloat(r)||1,selectedUnit:i&&parseFloat(r)>1?i:t||"Piece",taxCategory:p?"E":s||"S",qty:1,bonusQty:0,unitPrice:parseFloat(o)||0,discount:0,batchNumber:"",expiryDate:""}),U(),Q()};function U(){const e=document.getElementById("pur-lines-tbody"),a=document.getElementById("pur-items-badge");if(!e)return;if(a&&(a.textContent=`${v.length} صنف`),!v.length){e.innerHTML=`<tr><td colspan="14" style="text-align:center;padding:24px;color:var(--text-2);">
      لم يتم إضافة أصناف — ابحث وأضف أصناف أعلاه أو استخدم أزرار الاستيراد الذكية</td></tr>`;return}const o=document.getElementById("pur-invoice-type")?.value==="non_tax";e.innerHTML=v.map((t,n)=>{const s=parseFloat(t.qty)||0,i=parseFloat(t.unitPrice)||0,r=parseFloat(t.discount)||0,p=s*i,h=p*(r/100),y=Math.max(0,p-h),f=s>0?y/s:i,x=!o&&(t.taxCategory==="S"||t.taxCategory==="standard")?y*.15:0,g=y+x;return`
    <tr id="pur-line-row-${n}" style="border-bottom:1px solid var(--border-soft); background:var(--bg-card);">
      <td style="padding:6px 4px; text-align:center; color:var(--text-2); font-size:11px;">${n+1}</td>
      <td style="padding:6px 6px;" class="mono dim" style="font-size:11px;">${t.sku||"—"}</td>
      <td style="padding:6px 6px; font-weight:700; color:var(--text-0);">${t.productName}</td>
      <td style="padding:6px 4px; min-width:90px;">
        ${t.altUnit&&t.unitFactor>1?`<select class="form-control" style="height:28px;font-size:11px;padding:2px 4px;color:var(--brand);font-weight:700;"
               onchange="updatePurLineUnit(${n},this.value)" title="اختر وحدة الإدخال">
               <option value="${t.altUnit}" ${t.selectedUnit===t.altUnit?"selected":""}>${G(t.altUnit)} (كرتون)</option>
               <option value="${t.unit}" ${t.selectedUnit===t.unit?"selected":""}>${G(t.unit)} (حبة)</option>
             </select>
             <div style="font-size:9.5px;color:#64748b;margin-top:2px;text-align:center">
               ${t.selectedUnit===t.altUnit?`1 ${G(t.altUnit)} = ${t.unitFactor} ${G(t.unit)}`:G(t.unit)}
             </div>`:`<span style="font-size:11px;color:var(--text-2)">${G(t.unit||"Piece")}</span>`}
      </td>
      
      <!-- Qty -->
      <td style="padding:6px 4px; width:75px;">
        <input type="number" class="form-control mono font-bold"
          style="width:70px; height:28px; font-size:11.5px; padding:2px 4px; text-align:center;"
          value="${t.qty}" min="0.001" step="0.001"
          oninput="updatePurLine(${n},'qty',this.value)" />
        ${t.altUnit&&t.unitFactor>1&&t.selectedUnit===t.altUnit?`<div style="font-size:9.5px;color:#059669;margin-top:2px;text-align:center;font-weight:700;">= ${(parseFloat(t.qty)||0)*t.unitFactor} ${G(t.unit)}</div>`:""}
      </td>

      <!-- Bonus Qty -->
      <td style="padding:6px 4px; width:75px;">
        <input type="number" class="form-control mono font-bold"
          style="width:70px; height:28px; font-size:11.5px; padding:2px 4px; text-align:center; color:#10B981; background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.3);"
          value="${t.bonusQty||""}" placeholder="0" min="0" step="1"
          title="كمية مجانية ممنوحة من المورد (تضاف للمخزون بدون تكلفة)"
          oninput="updatePurLine(${n},'bonusQty',this.value)" />
      </td>

      <!-- Unit Price -->
      <td style="padding:6px 4px; width:95px;">
        <input type="number" class="form-control mono font-bold"
          style="width:90px; height:28px; font-size:11.5px; padding:2px 6px;"
          value="${t.unitPrice}" min="0" step="0.01"
          oninput="updatePurLine(${n},'unitPrice',this.value)" />
      </td>

      <!-- Line Discount % -->
      <td style="padding:6px 4px; width:70px;">
        <input type="number" class="form-control mono font-bold"
          style="width:65px; height:28px; font-size:11.5px; padding:2px 4px; text-align:center; color:#EF4444;"
          value="${t.discount||""}" placeholder="0%" min="0" max="100" step="0.5"
          oninput="updatePurLine(${n},'discount',this.value)" />
      </td>

      <!-- Net Unit Price -->
      <td style="padding:6px 6px;" class="mono font-bold pur-line-net-price" style="font-size:12px; color:var(--brand);">
        ${E(f)}
      </td>

      <!-- Batch Number -->
      <td style="padding:6px 4px; width:90px;">
        <input type="text" class="form-control mono"
          style="width:85px; height:28px; font-size:11px; padding:2px 4px;"
          value="${t.batchNumber||""}" placeholder="LOT-01"
          onchange="updatePurLine(${n},'batchNumber',this.value)" />
      </td>

      <!-- Expiry Date -->
      <td style="padding:6px 4px; width:110px;">
        <input type="date" class="form-control mono"
          style="width:105px; height:28px; font-size:10.5px; padding:2px 2px;"
          value="${t.expiryDate||""}"
          onchange="updatePurLine(${n},'expiryDate',this.value)" />
      </td>

      <!-- VAT Badge -->
      <td style="padding:6px 4px; text-align:center;">
        ${o?'<span class="badge good" style="font-size:9.5px; padding:2px 6px; user-select:none;" title="فاتورة غير ضريبية (معفاة)">0% معفى</span>':t.taxCategory==="S"?`<span class="badge warn" style="font-size:9.5px; padding:2px 6px; cursor:pointer; user-select:none;" onclick="togglePurLineTax(${n})" title="انقر لتغيير الضريبة (خاضع 15% / معفى 0%)">15% 🔄</span>`:`<span class="badge good" style="font-size:9.5px; padding:2px 6px; cursor:pointer; user-select:none;" onclick="togglePurLineTax(${n})" title="انقر لتغيير الضريبة (خاضع 15% / معفى 0%)">معفى 🔄</span>`}
      </td>

      <!-- Total With VAT -->
      <td style="padding:6px 6px;" class="mono font-bold text-brand pur-line-total-vat" style="font-size:12px;">
        ${E(g)}
      </td>

      <!-- Delete Button -->
      <td style="padding:6px 2px; text-align:center;">
        <button class="btn btn-icon sm btn-ghost" onclick="removePurLine(${n})"
          style="color:var(--bad); font-size:14px; padding:2px 4px;" title="حذف البند">✕</button>
      </td>
    </tr>`}).join("")}window.togglePurLineTax=e=>{if(!v[e])return;if(document.getElementById("pur-invoice-type")?.value==="non_tax"){v[e].taxCategory="E";return}const o=v[e].taxCategory||"S";v[e].taxCategory=o==="E"||o==="Z"?"S":"E",U(),Q()};window.updatePurLine=(e,a,o)=>{if(!v[e])return;a==="batchNumber"||a==="expiryDate"?v[e][a]=o:v[e][a]=parseFloat(o)||0;const t=v[e],n=parseFloat(t.qty)||0,s=parseFloat(t.unitPrice)||0,i=parseFloat(t.discount)||0,r=n*s,p=r*(i/100),h=Math.max(0,r-p),y=n>0?h/n:s,x=!(document.getElementById("pur-invoice-type")?.value==="non_tax")&&(t.taxCategory==="S"||t.taxCategory==="standard")?h*.15:0,g=h+x,l=document.getElementById(`pur-line-row-${e}`);if(l){const c=l.querySelector(".pur-line-net-price"),u=l.querySelector(".pur-line-total-vat");c&&(c.textContent=E(y)),u&&(u.textContent=E(g))}Q()};window.removePurLine=e=>{v.splice(e,1),U(),Q()};window.updatePurLineUnit=(e,a)=>{const o=v[e];o&&(o.selectedUnit=a,U(),Q())};function Q(){const e=document.getElementById("pur-global-discount-type")?.value||"pct",a=parseFloat(document.getElementById("pur-global-discount-val")?.value)||0,o=parseFloat(document.getElementById("pur-freight-val")?.value)||0,n=(document.getElementById("pur-invoice-type")?.value||"taxable")==="non_tax";let s=0,i=0,r=0,p=0,h=0;v.forEach(z=>{const ot=parseFloat(z.qty)||0,at=parseFloat(z.bonusQty)||0,nt=parseFloat(z.unitPrice)||0,H=parseFloat(z.discount)||0,I=ot*nt,S=I*(H/100),F=Math.max(0,I-S);s+=I,i+=S,r+=at,n?h+=F:z.taxCategory==="S"||z.taxCategory==="standard"||z.vatRate===15||!z.taxCategory&&z.vatRate!==0?p+=F:h+=F});const y=Math.max(0,s-i);let f=0;e==="pct"?f=y*(a/100):f=Math.min(y,a);const w=y>0?f/y:0,x=Math.max(0,p*(1-w)),g=Math.max(0,h*(1-w)),l=x*.15,c=x+g+l+o,u=i+f,b=z=>`${E(z)}`,m=z=>document.getElementById(z);if(m("pur-gross-subtotal")&&(m("pur-gross-subtotal").textContent=b(s)),m("pur-line-discounts")&&(m("pur-line-discounts").textContent=`- ${b(i)}`),m("pur-global-discount-amount")&&(m("pur-global-discount-amount").textContent=`- ${b(f)}`),m("pur-net-taxable")&&(m("pur-net-taxable").textContent=b(x)),m("pur-net-exempt")&&(m("pur-net-exempt").textContent=b(g)),m("pur-vat")&&(m("pur-vat").textContent=b(l)),m("pur-freight-label")&&(m("pur-freight-label").textContent=`+ ${b(o)}`),m("pur-grand")&&(m("pur-grand").textContent=b(c)),m("pur-total-bonus-label")&&(m("pur-total-bonus-label").textContent=`${r} كرتون مجاني`),m("pur-total-savings-label")){const z=s>0?(u/s*100).toFixed(1):0;m("pur-total-savings-label").textContent=`${b(u)} (${z}%)`}}window.recalcPurchaseTotals=Q;window.openPurchaseModal=async()=>{v=[],window._editingPurchaseId=null;const e=document.getElementById("save-pur-btn");e&&(e.textContent="💾 حفظ واعتماد الفاتورة"),["supplier-search","pur-ref-num","pur-notes","pur-supplier-vat","pur-global-discount-val","pur-freight-val"].forEach(t=>{const n=document.getElementById(t);n&&(n.value="")}),document.getElementById("pur-global-discount-type")&&(document.getElementById("pur-global-discount-type").value="pct"),document.getElementById("supplier-id").value="",document.getElementById("pur-inv-date").value=X(),document.getElementById("pur-form-error").classList.add("hidden"),document.getElementById("pur-modal-title").textContent="فاتورة مشتريات وتوريد بضاعة",document.getElementById("pur-inv-number").value="جارِ التوليد...";const a=document.getElementById("pur-sup-360-btn");a&&a.classList.add("hidden");const o=document.getElementById("sup-warning-alert");o&&o.classList.add("hidden"),U(),Q(),typeof window.setPurchaseInvoiceType=="function"&&window.setPurchaseInvoiceType("taxable"),openModal("purchase-modal"),ee();try{const t=await Nt("PUR");document.getElementById("pur-inv-number").value=t}catch{}};async function oe(e){if(!e)return;const a=e.id,o=e.number||e.invoiceNumber||"";try{const{getDocs:t,query:n,collection:s,where:i}=await A(async()=>{const{getDocs:f,query:w,collection:x,where:g}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDocs:f,query:w,collection:x,where:g}},[]),r=n(s(j,`companies/${L}/cashTransactions`),i("sourceId","==",a),i("sourceType","==","purchaseInvoice")),p=await t(r);for(const f of p.docs){const w=f.data(),x=w.type==="out"?"in":"out";await Dt({type:x,amount:w.amount,notes:`عكس سداد/تعديل فاتورة مشتريات ${o}`,sourceType:"purchaseInvoice_reverse",sourceId:a,date:e.date||X()}),console.log(`[Cleanup] Reversed cash transaction of ${w.amount} for purchase invoice ${o}`)}const h=n(s(j,`companies/${L}/bankTransactions`),i("sourceId","==",a),i("sourceType","==","purchaseInvoice")),y=await t(h);for(const f of y.docs){const w=f.data(),x=w.type==="out"?"in":"out";await Mt({type:x,amount:w.amount,notes:`عكس سداد/تعديل فاتورة مشتريات ${o}`,sourceType:"purchaseInvoice_reverse",sourceId:a,date:e.date||X()}),console.log(`[Cleanup] Reversed bank transaction of ${w.amount} for purchase invoice ${o}`)}}catch(t){console.warn("[Cleanup] Querying and reversing purchase transactions failed:",t.message)}if(e.paymentJournalEntryId)try{await ge("journalEntries",e.paymentJournalEntryId),console.log(`[Cleanup] Deleted payment journal entry ${e.paymentJournalEntryId} for purchase invoice ${o}`)}catch(t){console.warn("[Cleanup] Failed to delete payment JE:",t.message)}}window.savePurchase=async()=>{const e=document.getElementById("pur-form-error");e.classList.add("hidden");let a=document.getElementById("supplier-id").value;const o=document.getElementById("supplier-search").value.trim(),t=document.getElementById("pur-warehouse"),n=t.value,s=t.options[t.selectedIndex]?.dataset.name||"",i=document.getElementById("pur-payment").value,r=document.getElementById("pur-inv-date").value,p=document.getElementById("pur-ref-num").value.trim(),h=document.getElementById("pur-due-date").value,y=document.getElementById("pur-notes").value.trim(),f=document.getElementById("pur-supplier-vat").value.trim();if(!a&&o)try{const g=xt(T.suppliers(),K("name"),_t(20)),c=(await vt(g)).docs.map(u=>({id:u.id,...u.data()})).find(u=>(u.name||"").toLowerCase()===o.toLowerCase());c&&(a=c.id,document.getElementById("supplier-id").value=c.id,!f&&c.vatNumber&&(document.getElementById("pur-supplier-vat").value=c.vatNumber))}catch{}const w=g=>{e.textContent=g,e.classList.remove("hidden"),e.scrollIntoView({behavior:"smooth",block:"center"})};if(!a){w("⚠️ يرجى اختيار المورد من القائمة");return}if(!n){w("⚠️ يرجى اختيار المخزن المستلِم");return}if(!v.length){w("⚠️ أضف صنفاً واحداً على الأقل");return}const x=document.getElementById("save-pur-btn");x.disabled=!0,x.textContent="⌛ جارٍ الحفظ…";try{if(await ce(r)){w(`⚠️ لا يمكن حفظ الفاتورة لأن تاريخها (${r}) يقع في فترة محاسبية مغلقة ومقفلة نهائياً.`),x.disabled=!1,x.textContent="💾 حفظ واعتماد";return}const g=document.getElementById("pur-global-discount-type")?.value||"pct",l=parseFloat(document.getElementById("pur-global-discount-val")?.value)||0,c=parseFloat(document.getElementById("pur-freight-val")?.value)||0,u=document.getElementById("pur-invoice-type")?.value||"taxable",b=u==="non_tax";let m=0,z=0,ot=0,at=0,nt=0,H=0;v.forEach(d=>{const B=parseFloat(d.qty)||0,$=parseFloat(d.bonusQty)||0,C=parseFloat(d.unitPrice)||0,N=parseFloat(d.discount)||0,D=B*C,rt=D*(N/100),k=Math.max(0,D-rt);m+=D,z+=rt,at+=B,ot+=$,b?(d.taxCategory="E",H+=k):d.taxCategory==="S"||d.taxCategory==="standard"||d.vatRate===15||!d.taxCategory&&d.vatRate!==0?nt+=k:H+=k});const I=Math.max(0,m-z);let S=0;g==="pct"?S=I*(l/100):S=Math.min(I,l);const F=I>0?S/I:0,V=Math.max(0,nt*(1-F)),st=Math.max(0,H*(1-F)),ut=V*.15,it=V+st+ut+c,ae=z+S,O=document.getElementById("pur-inv-number").value,At=document.getElementById("pur-attachment"),mt=At?At.files[0]:null;let Ft="";if(mt){x.textContent="⏳ جارٍ رفع المرفق…";try{const d=ye(pe,`companies/${L}/purchases/${O}_${mt.name}`),B=await be(d,mt);Ft=await xe(B.ref)}catch(d){if(console.warn("Storage upload failed, saving without attachment:",d),!confirm("⚠️ فشل رفع المرفق. هل تريد الاستمرار بحفظ الفاتورة بدون مرفق؟")){x.disabled=!1,x.textContent="💾 حفظ وإنشاء قيد";return}}}v.forEach((d,B)=>{if(!d.batchNumber||!d.batchNumber.trim()){const $=(d.sku||d.productId||"P").slice(-4).toUpperCase(),C=(r||X()).replace(/-/g,"").slice(2);d.batchNumber=`LOT-${C}-${$}-${B+1}`}});const jt={invoiceType:u,isTaxExempt:b,number:O,date:r,dueDate:h||"",refNumber:p,supplierId:a,supplierName:o,supplierVatNumber:f,warehouseId:n,warehouseName:s,lines:v,grossSubtotal:m,subtotal:V+st,taxableSubtotal:V,exemptSubtotal:st,lineDiscountTotal:z,globalDiscountType:g,globalDiscountVal:l,globalDiscountAmount:S,discountTotal:ae,freightCharge:c,totalVat:ut,totalWithVat:it,totalBonusQty:ot,totalPurchasedQty:at,paymentMethod:i,status:i==="cash"?"paid":"posted",notes:y,attachmentUrl:Ft};let q=window._editingPurchaseId,ht=null;const ft={};if(q){const d=await Gt("purchaseInvoices",q);if(d){ht=d.supplierId;for(const $ of d.lines||[]){if(!$.productId)continue;const C=$.altUnit&&$.unitFactor>1&&$.selectedUnit===$.altUnit&&parseFloat($.unitFactor)||1,N=(parseFloat($.qty)||0)*C+(parseFloat($.bonusQty)||0);ft[$.productId]=(ft[$.productId]||0)+N}await oe(d);const B=Array.from(new Set([q,d.id,d.invoiceNumber,d.number].filter(Boolean)));for(const $ of["purchaseInvoice","purchase","purchaseCOGS"])for(const C of B)try{const N=await vt(xt(te(j,`companies/${L}/journalEntries`),bt("sourceType","==",$),bt("sourceId","==",C)));for(const D of N.docs)await tt(D.id),console.log(`[purchaseEdit] Deleted JE ${D.id} (${$}) for ${C}`)}catch(N){console.warn(`[purchaseEdit] JE cleanup (${$}/${C}) skipped:`,N.message)}if(d.journalEntryId&&typeof d.journalEntryId=="string")try{await tt(d.journalEntryId)}catch{}}await et("purchaseInvoices",q,jt)}else{const d=await Xt(T.purchaseInvoices(),jt);q=typeof d=="string"?d:d.id}mt&&window.uploadFileToArchive(mt,"purchase_invoices",q,`مرفق فاتورة شراء رقم ${O}`).catch(d=>console.warn(d));let Vt=0,Tt=0;const wt={};for(const d of v){if(!d.productId)continue;const B=d.altUnit&&d.unitFactor>1&&d.selectedUnit===d.altUnit&&parseFloat(d.unitFactor)||1,$=(parseFloat(d.qty)||0)*B+(parseFloat(d.bonusQty)||0);wt[d.productId]=(wt[d.productId]||0)+$}const ne=new Set([...Object.keys(ft),...Object.keys(wt)]);for(const d of ne){const B=wt[d]||0,$=ft[d]||0,C=B-$;if(C===0){console.log(`[adjustStock] ℹ️ Quantity unchanged for product ${d} (Qty: ${B}). Skipping stock delta.`);continue}const N=v.find(D=>D.productId===d)||{};try{await kt(n,d,C,{type:C>0?"purchase_in":"purchase_reverse_edit",sourceType:"purchaseInvoice",sourceId:q,documentNumber:O,invoiceNumber:O,purchasePrice:N.unitPrice||0,batchNumber:N.batchNumber||"",expiryDate:N.expiryDate||"",sku:N.sku||"",productName:N.productName||"",notes:q?`تعديل فاتورة الشراء ${O} (الفارق الصافي: ${C})`:`فاتورة شراء جديدة ${O}`}),Vt++,console.log(`[adjustStock] ✅ Product ${d} net stock delta: ${C>0?"+":""}${C} in ${n}`)}catch(D){Tt++,console.error(`[adjustStock] ❌ Failed for product ${d}:`,D.message)}}Tt>0&&window.showToast?.(`⚠️ تحديث المخزون: ${Vt} صنف نجح، ${Tt} فشل`,"warn");try{const{getDoc:d,updateDoc:B,doc:$,serverTimestamp:C}=await A(async()=>{const{getDoc:k,updateDoc:Z,doc:zt,serverTimestamp:R}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:k,updateDoc:Z,doc:zt,serverTimestamp:R}},[]),N=await W(T.stockByWarehouse()),D={};N.forEach(k=>{k.productId&&(D[k.productId]=(D[k.productId]||0)+(k.qty||0))});const rt=[];for(const k of v){const Z=parseFloat(k.qty)||0,zt=parseFloat(k.bonusQty)||0,R=Z+zt;if(!(!k.productId||R<=0||!k.unitPrice))try{const It=$(j,`companies/${L}/products`,k.productId),Wt=await d(It);if(!Wt.exists())continue;const M=Wt.data(),qt=Z*k.unitPrice,ie=qt*((parseFloat(k.discount)||0)/100),Ot=qt-ie,re=I>0?Ot/I*S:0,le=Math.max(0,Ot-re),Pt=R>0?le/R:k.unitPrice,de=Math.max(R,(D[k.productId]||0)+R),$t=Math.max(0,de-R),Rt=Number(M.avgCostPrice||M.costPrice||M.purchasePrice||0),Ut=$t+R>0?(Rt*$t+Pt*R)/($t+R):Pt,lt=Number(M.lastPurchasePrice||M.purchasePrice||M.costPrice||0),gt=Math.round(Pt*100)/100;await B(It,{lastPurchasePrice:gt,lastPurchaseDate:r,lastSupplierName:o||"",avgCostPrice:Math.round(Ut*100)/100,updatedAt:C()}),console.log(`[WACC] ${k.productName}: netPrice ${Pt.toFixed(2)}, avg ${Rt} → ${Ut.toFixed(2)} (qty ${$t}+${R})`);const dt=Number(M.sellingPrice||M.salePrice||M.priceRetail||0);let Y=parseFloat(M.targetMarginPct);const St=M.marginType||"markup";if((isNaN(Y)||Y<=0)&&(dt>0&&lt>0?Y=St==="margin"?Math.round((dt-lt)/dt*1e3)/10:Math.round((dt-lt)/lt*1e3)/10:Y=15),Math.abs(gt-lt)>=.01||dt<=0){let Et=0;St==="margin"&&Y<100?Et=Math.round(gt/(1-Y/100)*100)/100:Et=Math.round(gt*(1+Y/100)*100)/100,rt.push({productId:k.productId,productName:k.productName||M.name||M.nameAr||"صنف",sku:M.sku||"",unit:k.unit||M.unit||"Piece",oldCost:lt,newCost:gt,currentSellingPrice:dt,targetMarginPct:Y,marginType:St,suggestedSellingPrice:Et,newSellingPrice:Et,taxCategory:M.taxCategory||"S",selected:!0})}}catch(It){console.warn(`[WACC] Failed to update costPrice for ${k.productId}:`,It.message)}}}catch(d){console.warn("[WACC] Cost price update block failed:",d.message)}try{const d=await W(T.warehouses()),B=await Kt({id:q,invoiceNumber:O,date:r,supplierId:a,supplierName:o,paymentMethod:i,subtotal:V+st,taxAmount:ut,total:it,warehouseId:n},window._purchaseUser||{},d),$=typeof B=="object"&&B&&B.id||String(B);await et("purchaseInvoices",q,{journalEntryId:$,journalEntryError:null})}catch(d){console.error("[AccountingEngine] Purchase JE failed:",d.message);try{await et("purchaseInvoices",q,{journalEntryError:d.message,journalEntryId:null})}catch{}window.showToast?.("⚠️ تم حفظ فاتورة الشراء لكن القيد المحاسبي فشل — "+d.message,"warn")}if(i==="cash"||i==="نقدي")try{await Dt({type:"out",amount:it,notes:`شراء نقدي — فاتورة ${O} — ${o}`,sourceType:"purchaseInvoice",sourceId:q,date:r})}catch(d){console.warn("[autoCashTransaction] Cash box update failed:",d.message)}if(["transfer","bank","cheque","check","تحويل","شيك"].includes(i))try{await Mt({type:"out",amount:it,notes:`شراء — فاتورة ${O} — ${o}`,sourceType:"purchaseInvoice",sourceId:q,date:r})}catch(d){console.warn("[autoBankTransaction] Bank update failed:",d.message)}const Bt=it-(i==="cash"?it:0);if(a&&Bt>0)try{const{increment:d,updateDoc:B,doc:$,serverTimestamp:C}=await A(async()=>{const{increment:D,updateDoc:rt,doc:k,serverTimestamp:Z}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{increment:D,updateDoc:rt,doc:k,serverTimestamp:Z}},[]),N=$(j,`companies/${L}/suppliers`,a);await B(N,{balance:d(Bt),updatedAt:C()}),console.log(`[SupplierBalance] Client-side incremented supplier ${a} balance by +${Bt}`)}catch(d){console.warn("Failed to update supplier balance on client:",d.message)}const se=window._editingPurchaseId?`✅ تم تحديث فاتورة الشراء ${O} بنجاح`:`✅ تم حفظ فاتورة الشراء ${O} وإنشاء القيد المحاسبي`;window._editingPurchaseId=null,window.showToast(se,"success"),closeModal("purchase-modal"),v=[],await loadPurchaseList(),a&&A(()=>import("./balance-sync-D_Qo7lf4.js"),__vite__mapDeps([0,1,2])).then(d=>d.recalculateSupplierBalance(a)).catch(d=>console.warn(d)),ht&&ht!==a&&A(()=>import("./balance-sync-D_Qo7lf4.js"),__vite__mapDeps([0,1,2])).then(d=>d.recalculateSupplierBalance(ht)).catch(d=>console.warn(d)),priceChangeItems.length>0&&setTimeout(()=>{window.openPriceUpdateWizard(priceChangeItems)},350)}catch(g){e.textContent="خطأ: "+g.message,e.classList.remove("hidden"),console.error(g)}finally{x.disabled=!1,x.textContent="💾 حفظ وإنشاء قيد"}};window.editPurchaseInvoice=async e=>{try{const a=await Gt("purchaseInvoices",e);if(!a){window.showToast("لم يتم العثور على الفاتورة","error");return}window._editingPurchaseId=e,document.getElementById("pur-inv-number").value=a.number,document.getElementById("pur-ref-num").value=a.refNumber||"",document.getElementById("pur-notes").value=a.notes||"",document.getElementById("pur-supplier-vat").value=a.supplierVatNumber||"",document.getElementById("pur-inv-date").value=a.date||"",document.getElementById("pur-due-date").value=a.dueDate||"",document.getElementById("pur-payment").value=a.paymentMethod||"credit",document.getElementById("supplier-id").value=a.supplierId||"",document.getElementById("supplier-search").value=a.supplierName||"";const o=document.getElementById("pur-warehouse");o&&(o.value=a.warehouseId||"");const t=a.invoiceType||(a.isTaxExempt||a.totalVat===0&&a.exemptSubtotal>0?"non_tax":"taxable");if(typeof window.setPurchaseInvoiceType=="function"&&window.setPurchaseInvoiceType(t),document.getElementById("pur-global-discount-type")&&(document.getElementById("pur-global-discount-type").value=a.globalDiscountType||a.discountType||(a.discountPercent,"pct")),document.getElementById("pur-global-discount-val")){const s=a.globalDiscountVal!==void 0?a.globalDiscountVal:a.discountValue!==void 0?a.discountValue:a.discountPercent!==void 0?a.discountPercent:a.globalDiscountAmount||a.discountTotal||0;document.getElementById("pur-global-discount-val").value=s||""}document.getElementById("pur-freight-val")&&(document.getElementById("pur-freight-val").value=a.freightCharge||a.freight||a.freightAmount||""),v=(a.lines||[]).map(s=>({productId:s.productId,productName:s.productName,sku:s.sku||"",unit:s.unit||"PCS",qty:s.qty||0,bonusQty:s.bonusQty||0,unitPrice:s.unitPrice||0,discount:s.discount||0,taxCategory:t==="non_tax"?"E":s.taxCategory||"S",batchNumber:s.batchNumber||"",expiryDate:s.expiryDate||""})),U(),Q();const n=document.getElementById("save-pur-btn");n&&(n.textContent="💾 تحديث فاتورة الشراء"),document.getElementById("pur-modal-title").textContent="📦 تعديل فاتورة شراء",openModal("purchase-modal")}catch(a){window.showToast("خطأ: "+a.message,"error")}};window.viewPurchaseInvoice=async e=>{const a=document.getElementById("view-pur-body"),o=document.getElementById("view-pur-title");a.innerHTML='<div class="page-loading" style="min-height:120px;"><div class="loading-spinner"></div></div>',openModal("view-purchase-modal"),P=null;try{const t=Zt(j,`companies/${L}/purchaseInvoices`,e),n=await Yt(t);if(!n.exists())throw new Error("الفاتورة غير موجودة");const s={id:n.id,...n.data()};P=s;const i=s.invoiceType==="non_tax"||s.isTaxExempt||s.totalVat===0&&(s.exemptSubtotal>0||s.totalWithVat>0&&s.totalVat===0);o.textContent=i?`فاتورة شراء غير ضريبية: ${s.number||e}`:`فاتورة شراء: ${s.number||e}`;const r=document.getElementById("pur-pay-btn"),p=document.getElementById("pur-cancel-btn");r&&(r.style.display=s.status==="paid"||s.status==="cancelled"?"none":""),p&&(p.style.display=s.status==="cancelled"?"none":"");const h=(s.lines||[]).map((y,f)=>{const w=ue(y.qty,y.unitPrice,y.discount),g=!i&&(y.taxCategory==="S"||y.taxCategory==="standard")?w*.15:0;return`<tr>
        <td style="padding:7px 12px;">${f+1}</td>
        <td style="padding:7px 12px;" class="mono">${y.sku||"—"}</td>
        <td style="padding:7px 12px; font-weight:600;">${y.productName}</td>
        <td style="padding:7px 12px;">${y.unit||"—"}</td>
        <td style="padding:7px 12px;" class="mono">${y.qty}</td>
        <td style="padding:7px 12px;" class="mono">${E(y.unitPrice)}</td>
        <td style="padding:7px 12px;" class="mono">${y.discount||0}%</td>
        <td style="padding:7px 12px;" class="mono ${i?"text-good":"text-warn"}">${i?"0% (معفى)":E(g)}</td>
        <td style="padding:7px 12px;" class="mono font-bold">${E(w+g)}</td>
      </tr>`}).join("");a.innerHTML=`
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
        <div>
          <div class="grid-2 gap-12">
            <div><div class="section-label mb-6">رقم الفاتورة</div><div class="mono text-indigo font-bold text-xl">${s.number}</div></div>
            <div><div class="section-label mb-6">الحالة والنوع</div>
              ${Jt(s.status)}
              ${i?'<span class="badge" style="background:rgba(16,185,129,0.12); color:#059669; font-size:10px; font-weight:700; border:1px solid rgba(16,185,129,0.25); margin-right:4px;">🟢 غير ضريبية</span>':'<span class="badge" style="background:rgba(99,102,241,0.08); color:var(--brand); font-size:10px; font-weight:700; border:1px solid rgba(99,102,241,0.2); margin-right:4px;">🏢 ضريبية 15%</span>'}
            </div>
            <div><div class="section-label mb-6">المورد</div><div class="font-semibold">${s.supplierName}</div></div>
            <div><div class="section-label mb-6">المخزن</div><div>${s.warehouseName||"—"}</div></div>
            <div><div class="section-label mb-6">التاريخ</div><div>${Ht(s.date||s.createdAt)}</div></div>
            <div><div class="section-label mb-6">طريقة الدفع</div><div>${s.paymentMethod==="credit"?"آجل":s.paymentMethod==="cash"?"نقدي":s.paymentMethod}</div></div>
            ${s.refNumber?`<div><div class="section-label mb-6">مرجع المورد</div><div class="mono">${s.refNumber}</div></div>`:""}
            ${s.journalEntryId?'<div><div class="section-label mb-6">رقم القيد</div><span class="badge good">✓ مُرحَّل</span></div>':""}
            ${s.attachmentUrl?`<div style="grid-column: span 2;"><div class="section-label mb-6">المرفق (فاتورة المورد)</div><a href="${s.attachmentUrl}" target="_blank" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:6px;width:fit-content;padding:6px 12px;background:var(--primary-dim);color:var(--primary);border-color:var(--primary);">📎 فتح الفاتورة المرفقة</a></div>`:""}
          </div>
        </div>
        <div style="background:var(--bg-2); border-radius:8px; padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div class="invoice-total-row"><span>المجموع قبل الضريبة</span><span class="mono">${E(s.subtotal||0)}</span></div>
            ${s.discountTotal>0?`<div class="invoice-total-row"><span>الخصومات</span><span class="mono text-bad">- ${E(s.discountTotal)}</span></div>`:""}
            <div class="invoice-total-row"><span>${i?"ضريبة القيمة المضافة (0% معفى)":"VAT 15%"}</span><span class="mono ${i?"text-good":"text-warn"}">${i?"0.00 ر.س":E(s.totalVat||0)}</span></div>
            <div class="invoice-total-row grand-total"><span>الإجمالي</span><span class="mono text-brand">${E(s.totalWithVat||0)}</span></div>
          </div>
          <div style="margin-top:16px; border-top:1px solid var(--border-soft); padding-top:12px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <div>
              ${s.status==="pending"?`
                <button class="btn btn-sm" onclick="markPurchaseAsPaidManually('${s.id}')" style="background:#047857; color:#fff; border:none; padding:6px 12px; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
                  🟢 تعيين كمدفوعة (مسددة بسند)
                </button>
              `:""}
            </div>
            <div style="display:flex; gap:8px;">
              ${s.status!=="cancelled"?`
                <button class="btn btn-sm btn-secondary" onclick="closeModal('view-purchase-modal'); editPurchaseInvoice('${s.id}')" style="display:inline-flex; align-items:center; gap:6px;">
                  ✏️ تعديل
                </button>
              `:""}
              <button class="btn btn-sm btn-primary" onclick="convertPurchaseToSaleInvoice('${s.id}')" style="background:linear-gradient(135deg,#10B981,#059669); color:#fff; border:none; padding:6px 12px; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
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
            <th>الكمية</th><th>السعر</th><th>خصم%</th><th>VAT</th><th>الإجمالي</th>
          </tr></thead>
          <tbody>${h}</tbody>
        </table>
      </div>
      ${s.notes?`<div class="mt-16" style="padding:12px; background:var(--bg-2); border-radius:6px; font-size:13px;"><strong>ملاحظات:</strong> ${s.notes}</div>`:""}
    `}catch(t){a.innerHTML=`<div class="alert bad">${t.message}</div>`}};window.cancelPurchaseInvoice=async e=>{if(await window.showConfirm("إلغاء هذه الفاتورة؟ سيتم عكس حركة المخزون وحذف القيود المحاسبية.","تأكيد الإلغاء"))try{const{getDoc:a,doc:o,collection:t,getDocs:n,query:s,where:i}=await A(async()=>{const{getDoc:g,doc:l,collection:c,getDocs:u,query:b,where:m}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:g,doc:l,collection:c,getDocs:u,query:b,where:m}},[]),r=await a(o(j,`companies/${L}/purchaseInvoices`,e));if(!r.exists()){window.showToast("الفاتورة غير موجودة","error");return}const p=r?.data(),h=p?.supplierId,y=p.invoiceNumber||e,f=p.items||p.lines||[],w=p.warehouseId;if(w&&f.length>0)for(const g of f){const l=g.productId||g.id,c=parseFloat(g.qty||g.quantity||0);if(l&&c>0)try{await kt(w,l,-c,"cancel_purchase",`إلغاء فاتورة مشتريات ${y}`,e)}catch(u){console.warn(`[cancelPurchaseInvoice] Stock reversal failed for ${l}:`,u.message)}}const x=["purchaseInvoice","purchase","purchaseCOGS"];for(const g of x)try{const l=await n(s(t(j,`companies/${L}/journalEntries`),i("sourceType","==",g),i("sourceId","==",y)));for(const c of l.docs)await tt(c.id),console.log(`[cancelPurchaseInvoice] Deleted JE ${c.id} (${g})`);if(y!==e){const c=await n(s(t(j,`companies/${L}/journalEntries`),i("sourceType","==",g),i("sourceId","==",e)));for(const u of c.docs)await tt(u.id)}}catch(l){console.warn(`[cancelPurchaseInvoice] JE cleanup (${g}):`,l.message)}if(p.journalEntryId)try{await tt(p.journalEntryId)}catch{}if(await et("purchaseInvoices",e,{status:"cancelled",cancelledAt:new Date().toISOString()}),h){const{recalculateSupplierBalance:g}=await A(async()=>{const{recalculateSupplierBalance:l}=await import("./balance-sync-D_Qo7lf4.js");return{recalculateSupplierBalance:l}},__vite__mapDeps([0,1,2]));await g(h).catch(()=>{})}window.showToast("✅ تم إلغاء الفاتورة وعكس المخزون والقيود","success"),await loadPurchaseList()}catch(a){window.showToast("خطأ: "+a.message,"error")}};window.deletePurchaseInvoice=async(e,a)=>{if(await window.showConfirm(`هل أنت متأكد من حذف الفاتورة "${a}" نهائياً؟`,"تأكيد الحذف النهائي"))try{const{getById:o,remove:t}=await A(async()=>{const{getById:i,remove:r}=await import("./index-T8P1GM2w.js").then(p=>p.T);return{getById:i,remove:r}},__vite__mapDeps([1,2])),n=await o("purchaseInvoices",e);if(!n)throw new Error("لم يتم العثور على الفاتورة");if(await oe(n),n.lines&&n.warehouseId&&n.status!=="cancelled")for(const i of n.lines)try{await kt(n.warehouseId,i.productId,-+i.qty,{type:"purchase_reverse",refId:n.number,documentNumber:n.number,invoiceNumber:n.number,notes:`حذف فاتورة الشراء ${n.number}`})}catch(r){console.warn("Stock reverse skipped:",i.productId,r.message)}const s=n.invoiceNumber||n.number||e;for(const i of["purchaseInvoice","purchase","purchaseCOGS"])try{const r=await vt(xt(te(j,`companies/${L}/journalEntries`),bt("sourceType","==",i),bt("sourceId","==",s)));for(const p of r.docs)await tt(p.id),console.log(`[deletePurchaseInvoice] Deleted JE ${p.id} (${i}) for ${s}`)}catch(r){console.warn(`[deletePurchaseInvoice] JE cleanup (${i}) skipped:`,r.message)}if(n.journalEntryId)try{await tt(n.journalEntryId)}catch{}if(await t("purchaseInvoices",e),n.supplierId){const{recalculateSupplierBalance:i}=await A(async()=>{const{recalculateSupplierBalance:r}=await import("./balance-sync-D_Qo7lf4.js");return{recalculateSupplierBalance:r}},__vite__mapDeps([0,1,2]));await i(n.supplierId)}window.showToast(`✅ تم حذف الفاتورة ${a} بنجاح`,"success"),await loadPurchaseList()}catch(o){window.showToast("خطأ في الحذف: "+o.message,"error"),console.error("deletePurchaseInvoice error:",o)}};window.reapplyPurchaseStock=async()=>{if(!P){window.showToast("لا توجد فاتورة مفتوحة","error");return}const e=P;if(!e.warehouseId){window.showToast("⚠️ هذه الفاتورة لا تحتوي على مخزن — لا يمكن تحديث المخزون والقيود","warn");return}if(!e.lines||e.lines.length===0){window.showToast("لا توجد بنود في الفاتورة","warn");return}const a=document.getElementById("pur-restock-btn");a&&(a.disabled=!0,a.textContent="⌛ جارٍ التحديث…");let o=0;const t=[];for(const i of e.lines)try{await kt(e.warehouseId,i.productId,+i.qty,{type:"purchase_in",sourceType:"purchaseInvoice",sourceId:e.id,documentNumber:e.number,invoiceNumber:e.number,purchasePrice:i.unitPrice,sku:i.sku||"",productName:i.productName||"",notes:"إعادة تطبيق مخزون "+e.number}),o++}catch(r){console.warn("reapplyStock failed for",i.productName,r.message),t.push(`${i.productName}: ${r.message}`)}let n=null,s="لم يتم إنشاء القيد";try{const i=await W(T.warehouses());n=await Kt({id:e.id,invoiceNumber:e.number,date:e.date,supplierId:e.supplierId,supplierName:e.supplierName,paymentMethod:e.paymentMethod,subtotal:e.subtotal,taxAmount:e.totalVat||e.taxAmount||0,total:e.totalWithVat||e.total||0,warehouseId:e.warehouseId},window._purchaseUser||{},i),await et("purchaseInvoices",e.id,{journalEntryId:n}),e.journalEntryId=n,s=`تم إنشاء القيد بنجاح برقم: ${n}`}catch(i){console.error("[AccountingEngine] Failed to create JE:",i),t.push(`خطأ القيد: ${i.message}`)}a&&(a.disabled=!1,a.textContent="🔄 تحديث المخزون والقيود"),o>0&&n?(window.showToast(`✅ تم تحديث المخزون لـ ${o} أصناف بنجاح. ${s}`,"success"),closeModal("view-purchase-modal"),await loadPurchaseList()):window.showToast(`⚠️ تم تحديث ${o} أصناف. فشل القيد: ${t.join(", ")}`,"warn")};window.cancelCurrentPurchase=async()=>{P&&(closeModal("view-purchase-modal"),await cancelPurchaseInvoice(P.id))};window.registerPayment=async()=>{if(!P)return;const e=prompt(`تسجيل دفعة لفاتورة ${P.number}
المبلغ المستحق: ${E(P.totalWithVat)}

أدخل المبلغ المدفوع:`);if(!e)return;const a=parseFloat(e);if(isNaN(a)||a<=0){alert("مبلغ غير صحيح");return}const o=prompt("اختر طريقة السداد (نقدي / بنك):");if(!o)return;const t=o.includes("نقد")||o.toLowerCase().includes("cash"),n=o.includes("بنك")||o.toLowerCase().includes("bank")||o.toLowerCase().includes("transfer");if(!t&&!n){alert("طريقة دفع غير صالحة. يرجى كتابة 'نقدي' أو 'بنك'.");return}try{const s=a>=P.totalWithVat?"paid":"partial";await et("purchaseInvoices",P.id,{status:s,paidAmount:a}),t?await Dt({type:"out",amount:a,notes:`سداد فاتورة مشتريات آجل ${P.number} — ${P.supplierName}`,sourceType:"purchaseInvoice",sourceId:P.id,date:P.date||new Date().toISOString().split("T")[0]}):await Mt({type:"out",amount:a,notes:`سداد فاتورة مشتريات آجل ${P.number} — ${P.supplierName}`,sourceType:"purchaseInvoice",sourceId:P.id,date:P.date||new Date().toISOString().split("T")[0]});let i="";try{const{autoSupplierPaymentJE:r}=await A(async()=>{const{autoSupplierPaymentJE:p}=await import("./accounting-engine-BP8YIZdW.js");return{autoSupplierPaymentJE:p}},__vite__mapDeps([3,1,2]));i=await r({id:P.id,date:P.date||new Date().toISOString().split("T")[0],amount:a,supplierId:P.supplierId,paymentMethod:t?"cash":"bank",supplierName:P.supplierName,reference:`PAY-${P.number}`},window._purchaseUser||{}),await et("purchaseInvoices",P.id,{paymentJournalEntryId:i})}catch(r){console.warn("[AccountingEngine] Supplier payment JE failed:",r.message)}if(P.supplierId)try{const{increment:r,updateDoc:p,doc:h,serverTimestamp:y}=await A(async()=>{const{increment:w,updateDoc:x,doc:g,serverTimestamp:l}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{increment:w,updateDoc:x,doc:g,serverTimestamp:l}},[]),f=h(j,`companies/${L}/suppliers`,P.supplierId);await p(f,{balance:r(-a),updatedAt:y()})}catch(r){console.warn("Supplier balance update failed:",r.message)}window.showToast("✅ تم تسجيل السداد وتوليد قيد اليومية وتحديث حساب المورد بنجاح","success"),closeModal("view-purchase-modal"),await loadPurchaseList()}catch(s){window.showToast("خطأ: "+s.message,"error")}};window.printPurchaseInvoice=async()=>{P&&await Lt(P)};window.printPurchasePreview=async()=>{const e={number:document.getElementById("pur-inv-number").value,date:document.getElementById("pur-inv-date").value,supplierName:document.getElementById("supplier-search").value,supplierVat:document.getElementById("pur-supplier-vat").value,warehouseName:document.getElementById("pur-warehouse").selectedOptions?.[0]?.text||"",notes:document.getElementById("pur-notes").value,items:v,...me(v)};await Lt(e)};async function Lt(e,a=!1){let o={};try{o=JSON.parse(localStorage.getItem("idham_company")||"{}")}catch{}try{const{getDoc:I,doc:S}=await A(async()=>{const{getDoc:st,doc:ut}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:st,doc:ut}},[]),[F,V]=await Promise.all([I(S(j,`companies/${L}/settings`,"company")),I(S(j,`companies/${L}/settings`,"logo"))]);F.exists()&&Object.assign(o,F.data()),V.exists()&&V.data().dataUrl&&(o.logoUrl=V.data().dataUrl)}catch(I){console.warn("Failed to load company details for purchase PDF:",I)}const t=o.name||o.companyName||"إدهام للمواد الغذائية والتوزيع",n=o.vatNumber||o.vat||"",s=o.phone||"",i=o.email||"",r=[o.address,o.city,o.zip,o.country].filter(Boolean).join("، ")||"الرياض، المملكة العربية السعودية",p=o.logoUrl||o.logoBase64||o.logo||"";let h=e.supplierVat||e.supplierVatNumber||"",y=e.supplierPhone||"",f=e.supplierAddress||"";if(e.supplierId)try{const{getById:I}=await A(async()=>{const{getById:F}=await import("./index-T8P1GM2w.js").then(V=>V.T);return{getById:F}},__vite__mapDeps([1,2])),S=await I("suppliers",e.supplierId);S&&(h=S.vatNumber||S.vat||h,y=S.phone||y,f=S.address||f)}catch(I){console.warn("[generatePurchasePDF] Supplier details lookup failed:",I)}const x=new Date().toLocaleDateString("ar-SA",{year:"numeric",month:"long",day:"numeric"}),g=e.items||e.lines||[];let l="",c=0,u=0;g.forEach((I,S)=>{const F=(I.qty||0)*(I.unitPrice||0)*(1-(I.discount||0)/100),V=I.taxCategory==="S"?F*.15:0;c+=F,u+=V,l+=`
      <tr>
        <td style="text-align:center;">${S+1}</td>
        <td class="mono">${I.sku||"—"}</td>
        <td style="font-weight:600;">${I.productName||""}</td>
        <td style="text-align:center;">${I.unit||"—"}</td>
        <td class="mono" style="text-align:center;">${I.qty}</td>
        <td class="mono">${Number(I.unitPrice||0).toFixed(2)}</td>
        <td class="mono" style="text-align:center;">${I.discount||0}%</td>
        <td class="mono">${F.toFixed(2)}</td>
      </tr>`});const b=c+u,m=e.invoiceType==="non_tax"||e.isTaxExempt||e.totalVat===0&&(e.exemptSubtotal>0||e.subtotal>0&&e.totalVat===0),z=a?"أمر شراء / طلب عرض سعر":m?"فاتورة مشتريات (غير ضريبية)":"فاتورة مشتريات ضريبية",ot=a?"📋":m?"🟢":"📦",at=a?"Purchase Order / RFQ":m?"Non-Tax Purchase Invoice":"Purchase Invoice",nt=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${z} — ${e.number||""}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4; margin: 15mm; }
    body { font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 11px; color: #000; direction: rtl; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .doc-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 15px; border-bottom: 3px solid ${m?"#059669":"#5B5CEB"}; margin-bottom: 20px; }
    .co-logo { max-height: 60px; max-width: 150px; object-fit: contain; background:#fff; padding:4px; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,0.1); }
    .company-info h1 { font-size: 18px; color: #1a1a2e; margin-bottom: 4px; }
    .company-info p { font-size: 10px; color: #555; line-height: 1.6; }
    .doc-badge { background: ${m?"#059669":"#5B5CEB"} !important; color: #fff !important; padding: 8px 20px; border-radius: 8px; font-size: 14px; font-weight: 700; text-align: center; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .doc-badge small { display: block; font-size: 9px; font-weight: 400; opacity: 0.8; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .info-box { background: #f8f9fc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; }
    .info-box h3 { font-size: 11px; color: ${m?"#059669":"#5B5CEB"}; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
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
    .total-row.grand { border-top: 2px solid ${m?"#059669":"#5B5CEB"}; padding-top: 8px; margin-top: 8px; font-size: 14px; font-weight: 700; color: ${m?"#059669":"#5B5CEB"}; }
    .footer { clear: both; margin-top: 40px; padding-top: 15px; border-top: 1px solid #ddd; }
    .signatures { display: flex; justify-content: space-between; margin-top: 30px; }
    .sig-box { text-align: center; width: 150px; }
    .sig-line { border-top: 1px solid #999; margin-top: 40px; padding-top: 4px; font-size: 9px; color: #666; }
    ${a?".po-note { background: #FFF7ED; border: 1px solid #FDBA74; border-radius: 6px; padding: 10px; font-size: 10px; color: #92400E; margin-bottom: 15px; }":""}
    .terms { font-size: 9px; color: #666; margin-top: 15px; }
    .terms li { margin-bottom: 3px; }

    @media print {
      body { background:#fff; }
      .doc-badge { background: ${m?"#059669":"#5B5CEB"} !important; color: #fff !important; }
      thead th { background: #1a1a2e !important; color: #fff !important; }
    }
  </style>
</head>
<body>
  <div class="doc-header">
    <div style="display:flex; gap:15px; align-items:center;">
      ${p?`<img class="co-logo" src="${p}" alt="الشعار">`:""}
      <div class="company-info">
        <h1>${t}</h1>
        <p>📍 العنوان: <strong>${r}</strong></p>
        ${s?`<p>📞 الهاتف: <strong>${s}</strong></p>`:""}
        ${i?`<p>✉️ البريد: <strong>${i}</strong></p>`:""}
        ${n?`<p>🔢 الرقم الضريبي: <strong>${n}</strong></p>`:""}
      </div>
    </div>
    <div class="doc-badge">
      ${ot} ${z}
      <small>${at}</small>
      <div style="font-size:16px; margin-top:4px;">${e.number||"—"}</div>
    </div>
  </div>

  ${a?`<div class="po-note">
    ⚠️ هذا أمر شراء / طلب عرض سعر. يُرجى من المورد المذكور أدناه تأكيد الأسعار والكميات المتاحة والتوقيع والختم وإعادة هذه الوثيقة. صلاحية هذا الطلب <strong>7 أيام عمل</strong> من تاريخه.
  </div>`:""}

  <div class="info-grid">
    <div class="info-box">
      <h3>بيانات ${a?"المورد المطلوب منه":"المورد"}</h3>
      <div class="info-row"><span class="label">اسم المورد:</span><span class="value">${e.supplierName||"—"}</span></div>
      ${h?`<div class="info-row"><span class="label">الرقم الضريبي:</span><span class="value mono">${h}</span></div>`:""}
      ${y?`<div class="info-row"><span class="label">رقم الهاتف:</span><span class="value mono">${y}</span></div>`:""}
      ${f?`<div class="info-row"><span class="label">العنوان:</span><span class="value">${f}</span></div>`:""}
    </div>
    <div class="info-box">
      <h3>بيانات ${a?"الطلب":"الفاتورة"}</h3>
      <div class="info-row"><span class="label">التاريخ:</span><span class="value">${e.date||x}</span></div>
      <div class="info-row"><span class="label">المخزن المستلم:</span><span class="value">${e.warehouseName||"—"}</span></div>
      ${e.refNumber?`<div class="info-row"><span class="label">مرجع المورد:</span><span class="value mono">${e.refNumber}</span></div>`:""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:30px; text-align:center;">#</th>
        <th>الكود</th>
        <th>اسم الصنف</th>
        <th style="text-align:center;">الوحدة</th>
        <th style="text-align:center;">الكمية${a?" المطلوبة":""}</th>
        <th>سعر الوحدة</th>
        <th style="text-align:center;">خصم%</th>
        <th>الصافي</th>
      </tr>
    </thead>
    <tbody>
      ${l}
    </tbody>
  </table>

  <div class="totals-box">
    <div class="total-row"><span>المجموع قبل الضريبة</span><span class="mono">${c.toFixed(2)} ر.س</span></div>
    ${m?`
      <div class="total-row"><span>ضريبة القيمة المضافة (0%)</span><span class="mono" style="color:#059669;">0.00 ر.س (معفى)</span></div>
    `:`
      <div class="total-row"><span>ضريبة القيمة المضافة 15%</span><span class="mono">${u.toFixed(2)} ر.س</span></div>
    `}
    <div class="total-row grand"><span>الإجمالي النهائي</span><span class="mono">${b.toFixed(2)} ر.س</span></div>
  </div>

  ${m?`
    <div style="clear:both; margin-top:14px; padding:8px 12px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; font-size:10px; color:#166534; font-weight:600;">
      ℹ️ فاتورة مشتريات غير خاضعة لضريبة القيمة المضافة (0% VAT) وفقاً للوائح هيئة الزكاة والضريبة والجمارك (ZATCA).
    </div>
  `:""}

  ${e.notes?`<div style="clear:both; padding-top:15px;"><strong>ملاحظات:</strong> ${e.notes}</div>`:'<div style="clear:both;"></div>'}

  ${a?`
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
      <div class="sig-line">المشتري / ${t}</div>
    </div>
    ${a?`<div class="sig-box">
      <div class="sig-line">تأكيد المورد / الختم</div>
    </div>`:""}
    <div class="sig-box">
      <div class="sig-line">المستلم / أمين المخزن</div>
    </div>
  </div>

  <div class="footer" style="text-align:center; font-size:8px; color:#aaa; margin-top:20px;">
    مُنشأ من نظام إدهام ERP — ${x}
  </div>
</body>
</html>`,H=window.open("","_blank","width=800,height=1000");H.document.write(nt),H.document.close(),H.onload=()=>setTimeout(()=>H.print(),500)}window.generatePurchaseOrder=async()=>{const e=document.getElementById("supplier-search")?.value;if(!e&&!v.length){window.showToast("أضف المورد والأصناف أولاً ثم اضغط 'أمر شراء'","info"),openPurchaseModal();return}const a={number:document.getElementById("pur-inv-number")?.value||"PO-"+Date.now(),date:document.getElementById("pur-inv-date")?.value||X(),supplierName:e||"—",supplierVat:document.getElementById("pur-supplier-vat")?.value||"",warehouseName:document.getElementById("pur-warehouse")?.selectedOptions?.[0]?.text||"",notes:document.getElementById("pur-notes")?.value||"",items:v};await Lt(a,!0)};window.exportPurchaseCSV=async()=>{try{const e=xt(T.purchaseInvoices(),K("createdAt","desc"),_t(500)),o=(await vt(e)).docs.map(r=>({id:r.id,...r.data()})),t=["رقم الفاتورة","التاريخ","المورد","المخزن","المجموع","VAT","الإجمالي","الحالة"],n=o.map(r=>[r.number,r.date||"",r.supplierName,r.warehouseName,r.subtotal||0,r.totalVat||0,r.totalWithVat||0,r.status]),s="\uFEFF"+[t,...n].map(r=>r.map(p=>`"${p}"`).join(",")).join(`
`),i=document.createElement("a");i.href="data:text/csv;charset=utf-8,"+encodeURIComponent(s),i.download="purchase-invoices.csv",i.click()}catch(e){window.showToast("خطأ: "+e.message,"error")}};window.openPurchaseModalFromGRPO=async e=>{v=(e.items||[]).map(a=>({productId:a.productId,productName:a.productName,sku:a.sku||"",unit:a.unit||"PCS",qty:a.qty||0,unitPrice:a.unitPrice||0,discount:0,taxCategory:"S",batchNumber:a.batchNumber||"",expiryDate:a.expiryDate||""})),U(),Q(),setTimeout(()=>{const a=document.getElementById("supplier-search");a&&(a.value=e.supplierName||"");const o=document.getElementById("supplier-id");o&&(o.value=e.supplierId||"");const t=document.getElementById("pur-ref-num");t&&(t.value=e.grpoNumber?`GRPO-${e.grpoNumber}`:"");const n=document.getElementById("pur-notes");n&&(n.value=`محولة من إذن الاستلام رقم ${e.grpoNumber||""}`);const s=document.getElementById("pur-warehouse");s&&e.warehouseId&&(s.value=e.warehouseId)},300),document.getElementById("pur-inv-date").value=X(),document.getElementById("pur-form-error").classList.add("hidden"),document.getElementById("pur-modal-title").textContent=`📦 فاتورة شراء من إذن استلام ${e.grpoNumber||""}`,document.getElementById("pur-inv-number").value="جارِ التوليد...",openModal("purchase-modal"),ee();try{const a=await Nt("PUR");document.getElementById("pur-inv-number").value=a}catch{}};window.convertPurchaseToSaleInvoice=async e=>{try{const{getById:a}=await A(async()=>{const{getById:t}=await import("./index-T8P1GM2w.js").then(n=>n.T);return{getById:t}},__vite__mapDeps([1,2])),o=await a("purchaseInvoices",e);if(!o){showToast("الفاتورة غير موجودة","error");return}sessionStorage.setItem("convert_purchase_to_sale",JSON.stringify({purchaseInvoiceId:o.id,purchaseNumber:o.number,warehouseId:o.warehouseId||"",items:(o.lines||[]).map(t=>({productId:t.productId,productName:t.productName,sku:t.sku||"",unit:t.unit||"PCS",qty:t.qty||0,unitPrice:t.unitPrice||0}))})),closeModal("view-purchase-modal"),showToast("تم نسخ بنود الفاتورة بنجاح. يتم توجيهك الآن للمبيعات...","success"),typeof navigate=="function"&&navigate("sales-invoices")}catch(a){showToast(a.message,"error")}};window.markPurchaseAsPaidManually=async e=>{if(await window.showConfirm("هل تريد تعيين الفاتورة كمدفوعة يدوياً؟ (سيتم تغيير الحالة فقط دون إنشاء قيد سداد مكرر)","تأكيد التغيير"))try{const{update:a}=await A(async()=>{const{update:o}=await import("./index-T8P1GM2w.js").then(t=>t.T);return{update:o}},__vite__mapDeps([1,2]));await a("purchaseInvoices",e,{status:"paid",paidAmount:P?.totalWithVat||0,manuallyPaid:!0,updatedAt:new Date().toISOString()}),window.showToast("✅ تم تعيين الفاتورة كمدفوعة يدوياً بنجاح","success"),closeModal("view-purchase-modal"),await loadPurchaseList()}catch(a){window.showToast("خطأ: "+a.message,"error")}};window.openImportPOModal=async()=>{try{const a=(await W(T.purchaseOrders?T.purchaseOrders():"purchaseOrders",[K("createdAt","desc")]).catch(()=>[])).filter(t=>t.status!=="received"&&t.status!=="cancelled"),o=document.createElement("div");o.className="modal-overlay active",o.id="import-po-overlay",o.style.zIndex="1200",o.innerHTML=`
      <div class="modal modal-lg" style="max-width:700px; background:var(--bg-1); border-radius:16px;">
        <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <h3 class="modal-title" style="font-size:15px; font-weight:800; color:var(--brand); margin:0;">📋 استيراد بنود من أمر شراء (PO)</h3>
          <button class="modal-close" onclick="document.getElementById('import-po-overlay').remove()">×</button>
        </div>
        <div class="modal-body" style="padding:18px; max-height:60vh; overflow-y:auto;">
          ${a.length?`
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${a.map(t=>`
                <div class="card" style="padding:12px 16px; border:1px solid var(--border-soft); border-radius:10px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="window.applyPOToPurchase('${t.id}')">
                  <div>
                    <div class="font-bold" style="color:var(--brand);">${t.poNumber||t.id} — <span style="color:var(--text-0);">${t.supplierName}</span></div>
                    <div style="font-size:11.5px; color:var(--text-2); margin-top:2px;">التاريخ: ${t.date||"—"} • الأصناف: ${(t.lines||[]).length} • الإجمالي: <b>${E(t.totalAmount||0)}</b></div>
                  </div>
                  <button class="btn btn-secondary btn-sm">استيراد ⬅️</button>
                </div>
              `).join("")}
            </div>
          `:'<div style="text-align:center; padding:30px; color:var(--text-2);">لا توجد أوامر شراء نشطة بانتظار التوريد</div>'}
        </div>
      </div>
    `,document.body.appendChild(o)}catch(e){alert("خطأ: "+e.message)}};window.applyPOToPurchase=async e=>{try{const o=(await W(T.purchaseOrders?T.purchaseOrders():"purchaseOrders")).find(t=>t.id===e);if(!o)return;if(o.supplierId&&window.selectPurSupplier(o.supplierId,o.supplierName,""),o.warehouseId){const t=document.getElementById("pur-warehouse");t&&(t.value=o.warehouseId)}if(o.paymentTerms){const t=document.getElementById("pur-notes");t&&!t.value&&(t.value=`شروط الدفع: ${o.paymentTerms}`)}o.lines&&o.lines.length&&(v=o.lines.map(t=>({productId:t.productId,productName:t.productName||t.name,sku:t.sku||"",unit:t.unit||"كرتون",taxCategory:"S",qty:parseFloat(t.qty||1),bonusQty:0,unitPrice:parseFloat(t.unitPrice||0),discount:0,batchNumber:"",expiryDate:""})),U(),Q()),document.getElementById("import-po-overlay")?.remove(),window.showToast?.("✅ تم استيراد بيانات أمر الشراء بنجاح","success")}catch(a){alert(a.message)}};window.openImportQuoteModal=async()=>{try{const a=(await W(T.supplierQuotations?T.supplierQuotations():"supplierQuotations",[K("createdAt","desc")]).catch(()=>[])).filter(t=>t.status!=="converted"),o=document.createElement("div");o.className="modal-overlay active",o.id="import-quote-overlay",o.style.zIndex="1200",o.innerHTML=`
      <div class="modal modal-lg" style="max-width:700px; background:var(--bg-1); border-radius:16px;">
        <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <h3 class="modal-title" style="font-size:15px; font-weight:800; color:var(--brand); margin:0;">📑 استيراد من عرض سعر مورد (Quotation)</h3>
          <button class="modal-close" onclick="document.getElementById('import-quote-overlay').remove()">×</button>
        </div>
        <div class="modal-body" style="padding:18px; max-height:60vh; overflow-y:auto;">
          ${a.length?`
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${a.map(t=>`
                <div class="card" style="padding:12px 16px; border:1px solid var(--border-soft); border-radius:10px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="window.applyQuoteToPurchase('${t.id}')">
                  <div>
                    <div class="font-bold" style="color:var(--brand);">${t.quoteNumber||t.id} — <span style="color:var(--text-0);">${t.supplierName}</span></div>
                    <div style="font-size:11.5px; color:var(--text-2); margin-top:2px;">التاريخ: ${t.date||"—"} • الأصناف: ${(t.lines||[]).length} • الإجمالي: <b>${E(t.totalAmount||0)}</b></div>
                  </div>
                  <button class="btn btn-secondary btn-sm">استيراد ⬅️</button>
                </div>
              `).join("")}
            </div>
          `:'<div style="text-align:center; padding:30px; color:var(--text-2);">لا توجد عروض أسعار مسجلة</div>'}
        </div>
      </div>
    `,document.body.appendChild(o)}catch(e){alert(e.message)}};window.applyQuoteToPurchase=async e=>{try{const o=(await W(T.supplierQuotations?T.supplierQuotations():"supplierQuotations")).find(t=>t.id===e);if(!o)return;o.supplierId&&window.selectPurSupplier(o.supplierId,o.supplierName,""),o.lines&&o.lines.length&&(v=o.lines.map(t=>({productId:t.productId,productName:t.productName||t.name,sku:t.sku||"",unit:t.unit||"كرتون",taxCategory:"S",qty:parseFloat(t.qty||1),bonusQty:0,unitPrice:parseFloat(t.unitPrice||0),discount:0,batchNumber:"",expiryDate:""})),U(),Q()),document.getElementById("import-quote-overlay")?.remove(),window.showToast?.("✅ تم استيراد عرض السعر بنجاح","success")}catch(a){alert(a.message)}};window.openImportDeliveryModal=async()=>{try{const a=(await W(T.supplierDeliveries?T.supplierDeliveries():"supplierDeliveries",[K("expectedDate","desc")]).catch(()=>[])).filter(t=>t.status!=="received"),o=document.createElement("div");o.className="modal-overlay active",o.id="import-deliv-overlay",o.style.zIndex="1200",o.innerHTML=`
      <div class="modal modal-lg" style="max-width:700px; background:var(--bg-1); border-radius:16px;">
        <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <h3 class="modal-title" style="font-size:15px; font-weight:800; color:var(--brand); margin:0;">🚚 استيراد من شحنة واردة</h3>
          <button class="modal-close" onclick="document.getElementById('import-deliv-overlay').remove()">×</button>
        </div>
        <div class="modal-body" style="padding:18px; max-height:60vh; overflow-y:auto;">
          ${a.length?`
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${a.map(t=>`
                <div class="card" style="padding:12px 16px; border:1px solid var(--border-soft); border-radius:10px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="window.applyDeliveryToPurchase('${t.id}')">
                  <div>
                    <div class="font-bold" style="color:var(--brand);">${t.shipmentNumber||t.id} — <span style="color:var(--text-0);">${t.supplierName}</span></div>
                    <div style="font-size:11.5px; color:var(--text-2); margin-top:2px;">الوصول: ${t.expectedDate||"—"} • الكراتين: ${t.cartonsCount||0} • السائق: ${t.driverName||"—"}</div>
                  </div>
                  <button class="btn btn-secondary btn-sm">استيراد ⬅️</button>
                </div>
              `).join("")}
            </div>
          `:'<div style="text-align:center; padding:30px; color:var(--text-2);">لا توجد شحنات واردة نشطة</div>'}
        </div>
      </div>
    `,document.body.appendChild(o)}catch(e){alert("خطأ: "+e.message)}};window.applyDeliveryToPurchase=async e=>{try{const o=(await W(T.supplierDeliveries?T.supplierDeliveries():"supplierDeliveries")).find(n=>n.id===e);if(!o)return;if(o.supplierId&&window.selectPurSupplier(o.supplierId,o.supplierName,""),o.warehouseId){const n=document.getElementById("pur-warehouse");n&&(n.value=o.warehouseId)}const t=document.getElementById("pur-notes");t&&(t.value=`شحنة رقم: ${o.shipmentNumber||o.id} | السائق: ${o.driverName||""} (${o.driverPhone||""}) | لوحة: ${o.truckPlate||""}`),document.getElementById("import-deliv-overlay")?.remove(),window.showToast?.("✅ تم استيراد بيانات الشحنة بنجاح","success")}catch(a){alert(a.message)}};window.openQuickProductModal=()=>{const e=document.createElement("div");e.className="modal-overlay active",e.id="quick-prod-overlay",e.style.zIndex="1300",e.innerHTML=`
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
  `,document.body.appendChild(e)};window.saveQuickProduct=async()=>{const e=document.getElementById("quick-prod-err"),a=document.getElementById("quick-prod-name")?.value.trim(),o=document.getElementById("quick-prod-unit")?.value.trim()||"كرتون",t=parseFloat(document.getElementById("quick-prod-price")?.value)||0,n=document.getElementById("quick-prod-barcode")?.value.trim()||"";if(!a){e&&(e.textContent="يرجى كتابة اسم الصنف",e.classList.remove("hidden"));return}try{const s="PRD-"+Date.now().toString().slice(-5),i={name:a,sku:s,unit:o,costPrice:t,purchasePrice:t,sellingPrice:t*1.15,barcode:n,taxCategory:"S",createdAt:new Date().toISOString()},r=await Xt(T.products(),i);pt.push({id:r,...i}),window.addPurLine(r,a,t,o,s,"S"),document.getElementById("quick-prod-overlay")?.remove(),window.showToast?.("✅ تم إنشاء الصنف وإضافته للفاتورة","success")}catch(s){e&&(e.textContent=s.message,e.classList.remove("hidden"))}};window._activePriceWizardItems=[];window._activePriceWizardMode="markup";window.openPriceUpdateWizard=e=>{if(!e||e.length===0)return;window._activePriceWizardItems=e,window._activePriceWizardMode="markup";const a=document.getElementById("price-wizard-overlay");a&&a.remove();const o=e.filter(s=>s.newCost>s.oldCost).length,t=e.filter(s=>s.newCost<s.oldCost).length,n=document.createElement("div");n.className="modal-overlay active",n.id="price-wizard-overlay",n.style.cssText="z-index:9999; backdrop-filter:blur(5px); background:rgba(15,23,42,0.75); display:flex; align-items:center; justify-content:center;",n.innerHTML=`
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
            📦 ${e.length} أصناف تغيرت تكلفتها
          </span>
          ${o>0?`<span class="badge" style="background:rgba(239,68,68,0.12); color:#DC2626; font-weight:800; font-size:11.5px; padding:4px 8px;">🔺 ${o} ارتفاع تكلفة</span>`:""}
          ${t>0?`<span class="badge" style="background:rgba(16,185,129,0.12); color:#059669; font-weight:800; font-size:11.5px; padding:4px 8px;">🔻 ${t} انخفاض تكلفة</span>`:""}
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
          <span id="wiz-selected-count-label" style="font-size:12px; font-weight:700; color:var(--text-2);">محدد: ${e.length} صنف</span>
          <button type="button" id="wiz-confirm-btn" class="btn btn-primary" onclick="window.confirmPriceWizardUpdates()" style="background:linear-gradient(135deg, #10B981, #059669); border:none; padding:8px 20px; font-weight:800; font-size:12.5px; box-shadow:0 4px 12px rgba(16,185,129,0.3); cursor:pointer;">
            🚀 اعتماد وتحديث أسعار البيع المحددة
          </button>
        </div>
      </div>

    </div>
  `,document.body.appendChild(n),window.renderPriceWizardRows()};window.renderPriceWizardRows=()=>{const e=document.getElementById("price-wizard-tbody");if(!e)return;const a=window._activePriceWizardItems||[];if(a.length===0){e.innerHTML='<tr><td colspan="9" style="text-align:center; padding:20px; color:var(--text-2);">لا توجد أصناف</td></tr>';return}e.innerHTML=a.map((o,t)=>{const n=o.newCost-o.oldCost,s=o.oldCost>0?(n/o.oldCost*100).toFixed(1):"—",i=o.oldCost>0?n>0?`<span style="font-size:10px; color:#DC2626; background:rgba(239,68,68,0.1); padding:1px 4px; border-radius:3px; margin-right:4px;">🔺 +${s}%</span>`:n<0?`<span style="font-size:10px; color:#059669; background:rgba(16,185,129,0.1); padding:1px 4px; border-radius:3px; margin-right:4px;">🔻 ${s}%</span>`:'<span style="font-size:10px; color:var(--text-3); margin-right:4px;">= 0%</span>':'<span style="font-size:10px; color:var(--brand); background:rgba(99,102,241,0.1); padding:1px 4px; border-radius:3px; margin-right:4px;">جديد</span>',r=o.taxCategory==="S"?1.15:1,p=o.newSellingPrice>0?(o.newSellingPrice*r).toFixed(2):"0.00";return`
      <tr style="background:${o.selected?"var(--bg-1)":"rgba(0,0,0,0.02)"}; opacity:${o.selected?"1":"0.55"};">
        <td style="text-align:center;">
          <input type="checkbox" class="wiz-item-check" data-idx="${t}" ${o.selected?"checked":""} onchange="window.toggleWizardItem(${t}, this.checked)" style="cursor:pointer;" />
        </td>
        <td>
          <div style="font-weight:700; color:var(--text-0);">${o.productName}</div>
          <div class="dim mono" style="font-size:10.5px;">${o.sku||"—"}</div>
        </td>
        <td style="text-align:center;">
          <span class="badge neutral" style="font-size:10.5px;">${G(o.unit||"Piece")}</span>
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--text-2);">
          ${E(o.oldCost)}
        </td>
        <td class="mono font-bold" style="text-align:left;">
          <span style="color:var(--brand);">${E(o.newCost)}</span>
          ${i}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--text-1);">
          ${o.currentSellingPrice>0?E(o.currentSellingPrice):'<span class="dim" style="font-size:11px;">غير مسجل</span>'}
        </td>
        <td style="text-align:center;">
          <div style="display:inline-flex; align-items:center; gap:2px;">
            <input type="number" class="form-control mono font-bold" value="${o.targetMarginPct}" min="0" max="500" step="0.5"
              oninput="window.recalcPriceWizardRow(${t}, 'margin', this.value)"
              style="width:55px; height:26px; padding:2px 4px; font-size:11.5px; text-align:center; border:1px solid var(--brand); border-radius:4px;" />
            <span style="font-size:11px; font-weight:700; color:var(--text-2);">%</span>
          </div>
        </td>
        <td style="text-align:left;">
          <input type="number" class="form-control mono font-bold text-good" value="${o.newSellingPrice.toFixed(2)}" min="0" step="0.25"
            oninput="window.recalcPriceWizardRow(${t}, 'price', this.value)"
            style="width:90px; height:26px; padding:2px 6px; font-size:12px; font-weight:800; border:1.5px solid #10B981; border-radius:5px; background:rgba(16,185,129,0.04);" />
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--text-2);" id="wiz-inc-price-${t}">
          ${E(p)}
        </td>
      </tr>
    `}).join(""),window.updateWizardSummaryLabel()};window.recalcPriceWizardRow=(e,a,o)=>{const t=window._activePriceWizardItems[e];if(!t)return;const n=window._activePriceWizardMode||"markup",s=t.taxCategory==="S"?1.15:1;if(a==="margin"){const i=parseFloat(o)||0;t.targetMarginPct=i,t.marginType=n,n==="margin"&&i<100?t.newSellingPrice=Math.round(t.newCost/(1-i/100)*100)/100:t.newSellingPrice=Math.round(t.newCost*(1+i/100)*100)/100;const r=document.getElementById("price-wizard-tbody")?.children[e];if(r){const p=r.querySelector("input[oninput*='price']");p&&(p.value=t.newSellingPrice.toFixed(2));const h=document.getElementById(`wiz-inc-price-${e}`);h&&(h.textContent=E(t.newSellingPrice*s))}}else if(a==="price"){const i=parseFloat(o)||0;t.newSellingPrice=i,t.newCost>0&&i>0?n==="margin"?t.targetMarginPct=Math.round((i-t.newCost)/i*1e3)/10:t.targetMarginPct=Math.round((i-t.newCost)/t.newCost*1e3)/10:t.targetMarginPct=0;const r=document.getElementById("price-wizard-tbody")?.children[e];if(r){const p=r.querySelector("input[oninput*='margin']");p&&(p.value=t.targetMarginPct);const h=document.getElementById(`wiz-inc-price-${e}`);h&&(h.textContent=E(t.newSellingPrice*s))}}};window.applyUniformMarginToWizard=()=>{const e=parseFloat(document.getElementById("wiz-uniform-margin")?.value)||15,a=window._activePriceWizardMode||"markup";(window._activePriceWizardItems||[]).forEach(o=>{o.targetMarginPct=e,o.marginType=a,a==="margin"&&e<100?o.newSellingPrice=Math.round(o.newCost/(1-e/100)*100)/100:o.newSellingPrice=Math.round(o.newCost*(1+e/100)*100)/100}),window.renderPriceWizardRows(),window.showToast?.(`تم تطبيق هامش ${e}% على جميع أصناف المعالج`,"info")};window.switchWizardMarginType=e=>{window._activePriceWizardMode=e;const a=document.getElementById("wiz-mode-markup"),o=document.getElementById("wiz-mode-margin");a&&o&&(e==="markup"?(a.className="btn btn-sm btn-primary",o.className="btn btn-sm btn-ghost"):(a.className="btn btn-sm btn-ghost",o.className="btn btn-sm btn-primary")),(window._activePriceWizardItems||[]).forEach(t=>{t.marginType=e;const n=t.targetMarginPct||15;e==="margin"&&n<100?t.newSellingPrice=Math.round(t.newCost/(1-n/100)*100)/100:t.newSellingPrice=Math.round(t.newCost*(1+n/100)*100)/100}),window.renderPriceWizardRows()};window.toggleAllWizardItems=e=>{(window._activePriceWizardItems||[]).forEach(a=>{a.selected=e}),window.renderPriceWizardRows()};window.toggleWizardItem=(e,a)=>{const o=window._activePriceWizardItems[e];o&&(o.selected=a),window.renderPriceWizardRows()};window.updateWizardSummaryLabel=()=>{const e=(window._activePriceWizardItems||[]).filter(o=>o.selected).length,a=document.getElementById("wiz-selected-count-label");a&&(a.textContent=`محدد: ${e} من ${window._activePriceWizardItems.length} صنف`)};window.confirmPriceWizardUpdates=async()=>{const e=document.getElementById("wiz-confirm-btn");e&&(e.disabled=!0,e.textContent="⏳ جارٍ التحديث...");const a=(window._activePriceWizardItems||[]).filter(t=>t.selected&&t.newSellingPrice>0);if(a.length===0){window.showToast?.("لم يتم تحديد أي صنف للتحديث","warn"),window.closePriceWizard();return}let o=0;try{const{doc:t,updateDoc:n,serverTimestamp:s}=await A(async()=>{const{doc:i,updateDoc:r,serverTimestamp:p}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:i,updateDoc:r,serverTimestamp:p}},[]);await Promise.all(a.map(async i=>{try{const r=t(j,`companies/${L}/products`,i.productId);await n(r,{salePrice:i.newSellingPrice,sellingPrice:i.newSellingPrice,priceRetail:i.newSellingPrice,targetMarginPct:i.targetMarginPct,marginType:i.marginType,lastPriceUpdateDate:X(),updatedAt:s()}),o++}catch(r){console.warn("[PriceWizard] Failed to update price for",i.productId,r)}})),window.closePriceWizard(),window.showToast?.(`✅ تم بنجاح تحديث أسعار البيع لـ (${o}) صنف وفق آخر أسعار الشراء`,"success"),typeof pt<"u"&&(pt=[]),window.loadProducts&&window.loadProducts(!0)}catch(t){console.error("[PriceWizard] Batch update failed:",t),window.showToast?.("حدث خطأ أثناء تحديث الأسعار: "+t.message,"error")}finally{e&&(e.disabled=!1,e.textContent="🚀 اعتماد وتحديث أسعار البيع المحددة")}};window.closePriceWizard=()=>{const e=document.getElementById("price-wizard-overlay");e&&e.remove(),window._activePriceWizardItems=[]};export{Ce as render};
