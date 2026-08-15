const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/balance-sync-B0nwXHmR.js","assets/index-HrCilPJ3.js","assets/index-BTgEPYae.css","assets/sync-engine-CjRafMpJ.js","assets/accounting-engine-BmLox5ep.js"])))=>i.map(i=>d[i]);
import{t as F,g as D,C as N,x as X,p as st,A as it,f as $,d as _,a as B,b as rt,c as ct,B as Z,i as yt,J as bt,D as dt,v as J,G as M,u as V,n as ft,H as tt,I as et,_ as T,r as wt}from"./index-HrCilPJ3.js";import{autoPurchaseJE as lt}from"./accounting-engine-BmLox5ep.js";import{ref as xt,uploadBytes as It,getDownloadURL as $t}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import{orderBy as A,limit as at,where as q,query as H,getDocs as U,collection as ot,doc as Et,getDoc as Pt}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let x=[],m=null,kt=new Map,K=null,Y=[],Q=[];async function Ft(e,t){e.innerHTML=Bt(),setTimeout(()=>{const n=document.getElementById("pur-text-filter");if(n){const o=window.debounce?window.debounce(()=>loadPurchaseList(),300):()=>loadPurchaseList();n.addEventListener("input",o)}},100),await Promise.all([Tt(),_t(),loadPurchaseList()]),St(),Nt(),z();const a=sessionStorage.getItem("convert_grpo_to_invoice");if(a){sessionStorage.removeItem("convert_grpo_to_invoice");try{const n=JSON.parse(a);setTimeout(()=>{window.openPurchaseModalFromGRPO(n)},150)}catch(n){console.error(n)}}}function Bt(){return`
  <!-- Filter Bar -->
  <div class="filterbar">
    <div class="date-range-group"><label>من</label>
      <input type="date" id="pur-from" value="${new Date(new Date().setDate(1)).toISOString().split("T")[0]}"
        onchange="loadPurchaseList()" />
    </div>
    <div class="date-range-group"><label>إلى</label>
      <input type="date" id="pur-to" value="${F()}" onchange="loadPurchaseList()" />
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
        <option value="pending">معلقة</option>
        <option value="paid">مدفوعة</option>
        <option value="partial">جزئي</option>
        <option value="cancelled">ملغاة</option>
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
            <th>رقم الفاتورة</th><th>التاريخ</th><th>المورد</th>
            <th>المخزن</th><th>المجموع قبل VAT</th><th>VAT 15%</th>
            <th>الإجمالي</th><th>الحالة</th><th>قيد</th><th></th>
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

  <!-- ═══════════ NEW PURCHASE INVOICE MODAL ═══════════ -->
  <div class="modal-overlay" id="purchase-modal" onclick="if(event.target===this)closeModal('purchase-modal')">
    <div class="modal modal-xl">
      <div class="modal-header">
        <h3 class="modal-title" id="pur-modal-title">📦 فاتورة شراء جديدة</h3>
        <button class="modal-close" onclick="closeModal('purchase-modal')">×</button>
      </div>
      <div class="modal-body" style="padding:20px; overflow-y:auto; max-height:75vh;">

        <!-- Row 1: Basic Info -->
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group">
            <label class="form-label">رقم الفاتورة</label>
            <input type="text" id="pur-inv-number" class="form-control mono" readonly
              placeholder="يُولَّد تلقائياً" />
          </div>
          <div class="form-group">
            <label class="form-label">تاريخ الفاتورة <span class="text-bad">*</span></label>
            <input type="date" id="pur-inv-date" class="form-control" value="${F()}" />
          </div>
          <div class="form-group">
            <label class="form-label">رقم فاتورة المورد (مرجع)</label>
            <input type="text" id="pur-ref-num" class="form-control mono" placeholder="INV-SUPP-001" />
          </div>
        </div>

        <!-- Row 2: Supplier / Warehouse / Payment -->
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group">
            <label class="form-label">المورد <span class="text-bad">*</span></label>
            <div class="autocomplete-container">
              <input type="text" id="supplier-search" class="form-control"
                placeholder="ابحث باسم المورد…" autocomplete="off" />
              <div class="autocomplete-results hidden" id="supplier-results"></div>
              <input type="hidden" id="supplier-id" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">المخزن المستلِم <span class="text-bad">*</span></label>
            <select id="pur-warehouse" class="form-control">
              <option value="">اختر المخزن</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">طريقة الدفع</label>
            <select id="pur-payment" class="form-control">
              <option value="credit">آجل</option>
              <option value="cash">نقدي فوري</option>
              <option value="transfer">تحويل بنكي</option>
              <option value="check">شيك</option>
            </select>
          </div>
        </div>

        <!-- Row 3: Due Date / VAT Reg / Attachment -->
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group">
            <label class="form-label">تاريخ الاستحقاق</label>
            <input type="date" id="pur-due-date" class="form-control" />
          </div>
          <div class="form-group">
            <label class="form-label">رقم VAT للمورد</label>
            <input type="text" id="pur-supplier-vat" class="form-control mono"
              placeholder="300000000000003" />
          </div>
          <div class="form-group">
            <label class="form-label">مرفق الفاتورة الأصلية (صورة/PDF)</label>
            <input type="file" id="pur-attachment" class="form-control" accept="image/*,application/pdf" />
          </div>
        </div>

        <!-- Row 4: Notes -->
        <div class="grid-1 gap-16 mb-16">
          <div class="form-group">
            <label class="form-label">ملاحظات</label>
            <input type="text" id="pur-notes" class="form-control"
              placeholder="أي ملاحظة إضافية…" />
          </div>
        </div>

        <!-- Items Section -->
        <div style="background:var(--bg-2); border-radius:8px; padding:12px; margin-bottom:12px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; flex-wrap:wrap; gap:10px;">
            <strong style="font-size:13px; color:var(--brand);">📋 بنود الفاتورة</strong>
            <div style="display:flex; gap:8px; align-items:center;">
              <select id="pur-product-category-filter" class="form-control" style="width:160px; height:34px; font-size:12px; padding:4px 8px;">
                <option value="">كل الفئات</option>
              </select>
              <div class="autocomplete-container" style="width:480px;">
                <input type="text" id="pur-product-search" class="form-control"
                  placeholder="+ أضف صنفاً... (بالاسم أو الكود) [F8 للبحث المتقدم]" autocomplete="off"
                  style="height:34px; font-size:12px;" />
                <div class="autocomplete-results hidden" id="pur-product-results"></div>
              </div>
            </div>
          </div>
          <div class="invoice-lines" style="max-height:260px; overflow-y:auto; margin-top: 0;">
            <table style="width:100%; font-size:12px; border-collapse:collapse;">
              <thead>
                <tr style="background:var(--bg-3); position:sticky; top:0; z-index:1;">
                  <th style="padding:8px 10px; text-align:right;">#</th>
                  <th style="padding:8px 10px; text-align:right;">كود الصنف</th>
                  <th style="padding:8px 10px; text-align:right;">اسم الصنف</th>
                  <th style="padding:8px 10px; text-align:right;">الوحدة</th>
                  <th style="padding:8px 10px; text-align:right;">الكمية</th>
                  <th style="padding:8px 10px; text-align:right;">سعر الوحدة</th>
                  <th style="padding:8px 10px; text-align:right;">خصم%</th>
                  <th style="padding:8px 10px; text-align:right;">VAT</th>
                  <th style="padding:8px 10px; text-align:right; color:var(--brand);">الإجمالي</th>
                  <th style="padding:8px 6px;"></th>
                </tr>
              </thead>
              <tbody id="pur-lines-tbody"></tbody>
            </table>
          </div>
        </div>

        <!-- Totals -->
        <div style="display:flex; justify-content:flex-end; margin-top:12px;">
          <div style="width:320px; background:var(--bg-2); border-radius:8px; padding:16px;">
            <div class="invoice-total-row">
              <span>المجموع قبل الضريبة</span>
              <span class="mono" id="pur-subtotal">0.00 ر.س</span>
            </div>
            <div class="invoice-total-row">
              <span>إجمالي الخصومات</span>
              <span class="mono text-bad" id="pur-discount">- 0.00 ر.س</span>
            </div>
            <div class="invoice-total-row">
              <span>ضريبة القيمة المضافة (15%)</span>
              <span class="mono text-warn" id="pur-vat">0.00 ر.س</span>
            </div>
            <div class="invoice-total-row grand-total"
              style="border-top:2px solid var(--brand); margin-top:8px; padding-top:8px;">
              <span style="font-size:15px;">الإجمالي النهائي</span>
              <span class="mono" style="font-size:18px; color:var(--brand);" id="pur-grand">0.00 ر.س</span>
            </div>
          </div>
        </div>

        <div id="pur-form-error" class="alert bad hidden" style="margin-top:12px;"></div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal('purchase-modal')">إلغاء</button>
        <button class="btn btn-secondary" onclick="printPurchasePreview()">🖨️ معاينة</button>
        <button class="btn btn-warning" onclick="generatePurchaseOrder()" style="background:linear-gradient(135deg,#F97316,#EA580C);color:#fff;">📋 أمر شراء / عرض سعر</button>
        <button class="btn btn-primary" onclick="savePurchase()" id="save-pur-btn">
          💾 حفظ وإنشاء قيد
        </button>
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
  </div>`}async function Tt(){try{const e=await D(N.suppliers(),[A("name")]),t=document.getElementById("pur-supplier-filter");t&&e.forEach(a=>t.innerHTML+=`<option value="${a.id}">${a.name}</option>`)}catch{}}async function _t(){try{const e=await D(N.warehouses(),[A("name")]),t=document.getElementById("pur-warehouse");t&&e.forEach(n=>t.innerHTML+=`<option value="${n.id}" data-name="${n.name}">${n.name}</option>`);const a=document.getElementById("pur-warehouse-filter");a&&(a.innerHTML='<option value="">كل المستودعات</option>',e.forEach(n=>a.innerHTML+=`<option value="${n.id}">${n.name}</option>`))}catch{}try{const e=await X("PUR"),t=document.getElementById("pur-inv-number");t&&(t.value=e)}catch{}}window.loadPurchaseList=async()=>{const e=document.getElementById("pur-tbody");if(e){e.innerHTML=`${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(10).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;try{const t=[A("createdAt","desc"),at(100)],a=document.getElementById("pur-status-filter")?.value;a&&t.unshift(q("status","==",a));const n=H(N.purchaseInvoices(),...t);let s=(await U(n)).docs.map(d=>({id:d.id,...d.data()}));s.forEach(d=>kt.set(d.id,d));const r=document.getElementById("pur-from")?.value,i=document.getElementById("pur-to")?.value;(r||i)&&(s=s.filter(d=>{const E=d.date||(d.createdAt?.toDate?d.createdAt.toDate().toISOString().split("T")[0]:"");return(!r||E>=r)&&(!i||E<=i)}));const p=document.getElementById("pur-supplier-filter")?.value;p&&(s=s.filter(d=>d.supplierId===p));const h=document.getElementById("pur-warehouse-filter")?.value;h&&(s=s.filter(d=>d.warehouseId===h));const g=s.filter(d=>d.status!=="cancelled").reduce((d,E)=>d+(E.totalWithVat||0),0);let v=await D(ot(_,`companies/${B}/expenses`),[q("entityType","==","supplier")]);(r||i)&&(v=v.filter(d=>{const E=d.date||(d.createdAt?.toDate?d.createdAt.toDate().toISOString().split("T")[0]:"");return(!r||E>=r)&&(!i||E<=i)})),p&&(v=v.filter(d=>d.targetId===p));const u=v.reduce((d,E)=>d+(E.amount||0),0),b=Math.max(0,g-u);if(document.getElementById("pur-kpi-total").textContent=$(g),document.getElementById("pur-kpi-paid").textContent=$(u),document.getElementById("pur-kpi-unpaid").textContent=$(b),document.getElementById("pur-kpi-count").textContent=s.length,document.getElementById("pur-count").textContent=`${s.length} فاتورة`,s.length===0){e.innerHTML=`<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--text-2);">
        لا توجد فواتير في الفترة المحددة</td></tr>`;return}e.innerHTML=s.map(d=>`
      <tr style="cursor:pointer;" onclick="viewPurchaseInvoice('${d.id}')">
        <td class="mono text-indigo">${d.number||d.id.slice(0,8)}</td>
        <td class="dim">${rt(d.createdAt||d.date)}</td>
        <td class="font-semibold">${d.supplierName||"—"}</td>
        <td class="dim" style="font-size:11px;">${d.warehouseName||"—"}</td>
        <td class="mono">${$(d.subtotal||0)}</td>
        <td class="mono text-warn">${$(d.totalVat||0)}</td>
        <td class="mono font-bold">${$(d.totalWithVat||0)}</td>
        <td>${ct(d.status)}</td>
        <td style="font-size:11px;">${d.journalEntryId?'<span class="badge good" style="font-size:10px;">✓ مُرحَّل</span>':'<span class="badge" style="font-size:10px; background:var(--bg-3); color:var(--text-2);">—</span>'}</td>
        <td onclick="event.stopPropagation()">
          <div class="row-actions">
            <button class="btn btn-icon sm btn-ghost" onclick="viewPurchaseInvoice('${d.id}')" title="عرض">👁️</button>
            ${d.status!=="cancelled"?`<button class="btn btn-icon sm btn-ghost" onclick="editPurchaseInvoice('${d.id}')"
                  title="تعديل" style="color:var(--primary);">✏️</button>`:""}
            ${d.status!=="cancelled"&&d.status!=="paid"?`<button class="btn btn-icon sm btn-ghost" onclick="cancelPurchaseInvoice('${d.id}')"
                  title="إلغاء" style="color:var(--bad);">🚫</button>`:""}
            <button class="btn btn-icon sm btn-ghost" onclick="deletePurchaseInvoice('${d.id}','${(d.number||"").replace(/'/g,"\\'")}')"
              title="حذف نهائي" style="color:var(--danger);">🗑️</button>
          </div>
        </td>
      </tr>`).join("")}catch(t){e.innerHTML=`<tr><td colspan="10">
      <div class="alert bad" style="margin:8px;">${t.message}</div></td></tr>`}}};function St(){const e=document.getElementById("supplier-search"),t=document.getElementById("supplier-results");e&&(e.addEventListener("input",st(async()=>{const a=e.value.trim().toLowerCase();if(a.length<1){t.classList.add("hidden");return}try{(!K||K.length===0)&&(K=await D(N.suppliers(),[A("name")]));const n=K.filter(o=>(o.name||"").toLowerCase().includes(a)||(o.phone||"").includes(a)).slice(0,15);if(!n.length){t.classList.add("hidden");return}t.innerHTML=n.map(o=>`
        <div class="autocomplete-item" onclick="selectPurSupplier('${o.id}','${(o.name||"").replace(/'/g,"\\'")}','${o.vatNumber||""}')">
          <div>${o.name}</div>
          <div class="item-code">${o.phone||""} ${o.vatNumber?"| VAT: "+o.vatNumber:""}</div>
        </div>`).join(""),t.classList.remove("hidden")}catch(n){console.warn("setupSupplierAC error:",n)}},100)),document.addEventListener("click",a=>{e.contains(a.target)||t.classList.add("hidden")}))}window.selectPurSupplier=(e,t,a)=>{document.getElementById("supplier-id").value=e,document.getElementById("supplier-search").value=t,document.getElementById("supplier-results").classList.add("hidden"),a&&(document.getElementById("pur-supplier-vat").value=a)};function Nt(){const e=document.getElementById("pur-product-search"),t=document.getElementById("pur-product-results"),a=document.getElementById("pur-product-category-filter");if(!e)return;const n=()=>{const o=e.value.trim().toLowerCase(),s=a?a.value:"";if(!o&&!s){t.classList.add("hidden");return}let r=Y;if(s&&(r=r.filter(i=>i.category===s)),o&&(r=r.filter(i=>(i.name||"").toLowerCase().includes(o)||(i.sku||"").toLowerCase().includes(o)||(i.barcode||"").includes(o))),r=r.slice(0,15),!r.length){t.innerHTML='<div style="padding:10px;text-align:center;color:var(--text-2);font-size:12px;">لا توجد نتائج</div>',t.classList.remove("hidden");return}t.innerHTML=r.map(i=>`
      <div class="autocomplete-item"
        onclick="addPurLine('${i.id}','${(i.name||"").replace(/'/g,"\\'")}',${i.costPrice||0},'${i.unit||"PCS"}','${i.sku||""}','${i.taxCategory||"S"}')">
        <div class="flex justify-between">
          <span>${i.name}</span>
          <span class="mono text-indigo">${$(i.costPrice||0)}</span>
        </div>
        <div class="item-code">${i.sku||""} | الوحدة: ${i.unit||""}</div>
      </div>`).join(""),t.classList.remove("hidden")};e.addEventListener("input",st(n,200)),e.addEventListener("focus",n),a&&a.addEventListener("change",n),document.addEventListener("click",o=>{!e.contains(o.target)&&!t.contains(o.target)&&(!a||!a.contains(o.target))&&t.classList.add("hidden")})}async function pt(){try{if(Y.length===0||Q.length===0){const[t,a]=await Promise.all([D(N.products(),[A("name")]),D(N.categories(),[A("name")])]);Y=t,Q=a}const e=document.getElementById("pur-product-category-filter");e&&(e.innerHTML='<option value="">كل الفئات</option>'+Q.map(t=>`<option value="${t.id}">${t.name}</option>`).join(""))}catch(e){console.error("loadProductsAndCategories error:",e)}}window.addPurLine=(e,t,a,n,o,s)=>{document.getElementById("pur-product-search").value="",document.getElementById("pur-product-results").classList.add("hidden"),x.push({productId:e,productName:t,sku:o,unit:n,taxCategory:s||"S",qty:1,unitPrice:a,discount:0,batchNumber:"",expiryDate:""}),z(),O()};function z(){const e=document.getElementById("pur-lines-tbody");if(e){if(!x.length){e.innerHTML=`<tr><td colspan="10" style="text-align:center;padding:20px;color:var(--text-2);">
      لم يتم إضافة أصناف — ابحث وأضف أصناف أعلاه</td></tr>`;return}e.innerHTML=x.map((t,a)=>{const n=it(t.qty,t.unitPrice,t.discount),o=t.taxCategory==="S"?n*.15:0;return`
    <tr style="border-bottom:1px solid var(--border-soft);">
      <td style="padding:5px 8px; color:var(--text-2);">${a+1}</td>
      <td style="padding:5px 8px;" class="mono" style="font-size:11px;">${t.sku||"—"}</td>
      <td style="padding:5px 8px; font-weight:600;">${t.productName}</td>
      <td style="padding:5px 8px; color:var(--text-2);">${t.unit}</td>
      <td style="padding:5px 8px; width:80px;">
        <input type="number" class="form-control mono"
          style="width:70px;height:28px;font-size:11px;padding:2px 6px;"
          value="${t.qty}" min="0.001" step="0.001"
          onchange="updatePurLine(${a},'qty',this.value)" />
      </td>
      <td style="padding:5px 8px; width:110px;">
        <input type="number" class="form-control mono"
          style="width:100px;height:28px;font-size:11px;padding:2px 6px;"
          value="${t.unitPrice}" min="0" step="0.01"
          onchange="updatePurLine(${a},'unitPrice',this.value)" />
      </td>
      <td style="padding:5px 8px; width:65px;">
        <input type="number" class="form-control mono"
          style="width:55px;height:28px;font-size:11px;padding:2px 6px;"
          value="${t.discount}" min="0" max="100"
          onchange="updatePurLine(${a},'discount',this.value)" />
      </td>
      <td style="padding:5px 8px;">
        ${t.taxCategory==="S"?'<span class="badge warn" style="font-size:10px;">15%</span>':'<span class="badge good" style="font-size:10px;">معفى</span>'}
      </td>
      <td style="padding:5px 8px;" class="mono font-bold text-indigo">
        ${$(n+o)}
      </td>
      <td style="padding:5px 4px;">
        <button class="btn btn-icon sm btn-ghost" onclick="removePurLine(${a})"
          style="color:var(--bad); font-size:16px; padding:2px 6px;">✕</button>
      </td>
    </tr>`}).join("")}}window.updatePurLine=(e,t,a)=>{x[e][t]=parseFloat(a)||0,z(),O()};window.removePurLine=e=>{x.splice(e,1),z(),O()};function O(){const e=Z(x),t=n=>`${$(n)}`,a=n=>document.getElementById(n);a("pur-subtotal")&&(a("pur-subtotal").textContent=t(e.subtotal+e.discountTotal),a("pur-discount").textContent=`- ${t(e.discountTotal)}`,a("pur-vat").textContent=t(e.vatTotal),a("pur-grand").textContent=t(e.grandTotal))}window.openPurchaseModal=async()=>{x=[],window._editingPurchaseId=null;const e=document.getElementById("save-pur-btn");e&&(e.textContent="💾 حفظ وإنشاء قيد"),z(),O(),["supplier-search","pur-ref-num","pur-notes","pur-supplier-vat"].forEach(t=>{const a=document.getElementById(t);a&&(a.value="")}),document.getElementById("supplier-id").value="",document.getElementById("pur-inv-date").value=F(),document.getElementById("pur-form-error").classList.add("hidden"),document.getElementById("pur-modal-title").textContent="📦 فاتورة شراء جديدة",document.getElementById("pur-inv-number").value="جارِ التوليد...",openModal("purchase-modal"),pt();try{const t=await X("PUR");document.getElementById("pur-inv-number").value=t}catch{}};async function ut(e){if(!e)return;const t=e.id,a=e.number||e.invoiceNumber||"";try{const{getDocs:n,query:o,collection:s,where:r}=await T(async()=>{const{getDocs:g,query:y,collection:v,where:l}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDocs:g,query:y,collection:v,where:l}},[]),i=o(s(_,`companies/${B}/cashTransactions`),r("sourceId","==",t),r("sourceType","==","purchaseInvoice")),p=await n(i);for(const g of p.docs){const y=g.data(),v=y.type==="out"?"in":"out";await tt({type:v,amount:y.amount,notes:`عكس سداد/تعديل فاتورة مشتريات ${a}`,sourceType:"purchaseInvoice_reverse",sourceId:t,date:e.date||F()}),console.log(`[Cleanup] Reversed cash transaction of ${y.amount} for purchase invoice ${a}`)}const h=o(s(_,`companies/${B}/bankTransactions`),r("sourceId","==",t),r("sourceType","==","purchaseInvoice")),I=await n(h);for(const g of I.docs){const y=g.data(),v=y.type==="out"?"in":"out";await et({type:v,amount:y.amount,notes:`عكس سداد/تعديل فاتورة مشتريات ${a}`,sourceType:"purchaseInvoice_reverse",sourceId:t,date:e.date||F()}),console.log(`[Cleanup] Reversed bank transaction of ${y.amount} for purchase invoice ${a}`)}}catch(n){console.warn("[Cleanup] Querying and reversing purchase transactions failed:",n.message)}if(e.paymentJournalEntryId)try{await wt("journalEntries",e.paymentJournalEntryId),console.log(`[Cleanup] Deleted payment journal entry ${e.paymentJournalEntryId} for purchase invoice ${a}`)}catch(n){console.warn("[Cleanup] Failed to delete payment JE:",n.message)}}window.savePurchase=async()=>{const e=document.getElementById("pur-form-error");e.classList.add("hidden");let t=document.getElementById("supplier-id").value;const a=document.getElementById("supplier-search").value.trim(),n=document.getElementById("pur-warehouse"),o=n.value,s=n.options[n.selectedIndex]?.dataset.name||"",r=document.getElementById("pur-payment").value,i=document.getElementById("pur-inv-date").value,p=document.getElementById("pur-ref-num").value.trim(),h=document.getElementById("pur-due-date").value,I=document.getElementById("pur-notes").value.trim(),g=document.getElementById("pur-supplier-vat").value.trim();if(!t&&a)try{const l=H(N.suppliers(),A("name"),at(20)),b=(await U(l)).docs.map(d=>({id:d.id,...d.data()})).find(d=>(d.name||"").toLowerCase()===a.toLowerCase());b&&(t=b.id,document.getElementById("supplier-id").value=b.id,!g&&b.vatNumber&&(document.getElementById("pur-supplier-vat").value=b.vatNumber))}catch{}const y=l=>{e.textContent=l,e.classList.remove("hidden"),e.scrollIntoView({behavior:"smooth",block:"center"})};if(!t){y("⚠️ يرجى اختيار المورد من القائمة");return}if(!o){y("⚠️ يرجى اختيار المخزن المستلِم");return}if(!x.length){y("⚠️ أضف صنفاً واحداً على الأقل");return}const v=document.getElementById("save-pur-btn");v.disabled=!0,v.textContent="⌛ جارٍ الحفظ…";try{if(await yt(i)){y(`⚠️ لا يمكن حفظ الفاتورة لأن تاريخها (${i}) يقع في فترة محاسبية مغلقة ومقفلة نهائياً.`),v.disabled=!1,v.textContent="💾 حفظ واعتماد";return}const l=Z(x),u=document.getElementById("pur-inv-number").value,b=document.getElementById("pur-attachment"),d=b?b.files[0]:null;let E="";if(d){v.textContent="⏳ جارٍ رفع المرفق…";try{const c=xt(bt,`companies/${B}/purchases/${u}_${d.name}`),w=await It(c,d);E=await $t(w.ref)}catch(c){if(console.warn("Storage upload failed, saving without attachment:",c),!confirm("⚠️ فشل رفع المرفق. هل تريد الاستمرار بحفظ الفاتورة بدون مرفق؟")){v.disabled=!1,v.textContent="💾 حفظ وإنشاء قيد";return}}}const j={number:u,date:i,dueDate:h||"",refNumber:p,supplierId:t,supplierName:a,supplierVatNumber:g,warehouseId:o,warehouseName:s,lines:x,subtotal:l.subtotal,discountTotal:l.discountTotal,totalVat:l.vatTotal,totalWithVat:l.grandTotal,paymentMethod:r,status:r==="cash"?"paid":"posted",notes:I,attachmentUrl:E};let P=window._editingPurchaseId,R=null;if(P){const c=await dt("purchaseInvoices",P);if(c){R=c.supplierId;for(const k of c.lines||[])if(!(!k.productId||!k.qty))try{await J(c.warehouseId,k.productId,-k.qty,{type:"purchase_reverse_edit",refId:c.number,documentNumber:c.number,invoiceNumber:c.number,notes:`تعديل فاتورة الشراء ${c.number} (عكس الكمية القديمة)`})}catch(L){console.warn("Stock reversal failed on edit:",k.productId,L.message)}await ut(c);const w=c.invoiceNumber||c.number||P;for(const k of["purchaseInvoice","purchase","purchaseCOGS"])try{const L=await U(H(ot(_,`companies/${B}/journalEntries`),q("sourceType","==",k),q("sourceId","==",w)));for(const G of L.docs)await M(G.id),console.log(`[purchaseEdit] Deleted JE ${G.id} (${k}) for ${w}`)}catch(L){console.warn(`[purchaseEdit] JE cleanup (${k}) skipped:`,L.message)}if(c.journalEntryId)try{await M(c.journalEntryId)}catch{}}await V("purchaseInvoices",P,j)}else{const c=await ft(N.purchaseInvoices(),j);P=typeof c=="string"?c:c.id}d&&window.uploadFileToArchive(d,"purchase_invoices",P,`مرفق فاتورة شراء رقم ${u}`).catch(c=>console.warn(c));let W=0,C=0;for(const c of x){if(!c.productId||!c.qty){console.warn("[adjustStock] Skipping line — missing productId or qty:",c);continue}try{await J(o,c.productId,+c.qty,{type:"purchase_in",sourceType:"purchaseInvoice",sourceId:P,documentNumber:u,invoiceNumber:u,purchasePrice:c.unitPrice,batchNumber:c.batchNumber||"",expiryDate:c.expiryDate||"",sku:c.sku||"",productName:c.productName||""}),W++,console.log(`[adjustStock] ✅ ${c.productName} +${c.qty} in ${o}`)}catch(w){C++,console.error(`[adjustStock] ❌ Failed for ${c.productName} (${c.productId}):`,w.message)}}C>0&&window.showToast?.(`⚠️ تحديث المخزون: ${W} صنف نجح، ${C} فشل`,"warn");try{const c=await D(N.warehouses()),w=await lt({id:P,invoiceNumber:u,date:i,supplierId:t,supplierName:a,paymentMethod:r,subtotal:l.subtotal,taxAmount:l.vatTotal,total:l.grandTotal,warehouseId:o},window._purchaseUser||{},c);await V("purchaseInvoices",P,{journalEntryId:w})}catch(c){console.error("[AccountingEngine] Purchase JE failed:",c.message);try{await V("purchaseInvoices",P,{journalEntryError:c.message,journalEntryId:null})}catch{}window.showToast?.("⚠️ تم حفظ فاتورة الشراء لكن القيد المحاسبي فشل — "+c.message,"warn")}if(r==="cash"||r==="نقدي")try{await tt({type:"out",amount:l.grandTotal,notes:`شراء نقدي — فاتورة ${u} — ${a}`,sourceType:"purchaseInvoice",sourceId:P,date:i})}catch(c){console.warn("[autoCashTransaction] Cash box update failed:",c.message)}if(["transfer","bank","cheque","check","تحويل","شيك"].includes(r))try{await et({type:"out",amount:l.grandTotal,notes:`شراء — فاتورة ${u} — ${a}`,sourceType:"purchaseInvoice",sourceId:P,date:i})}catch(c){console.warn("[autoBankTransaction] Bank update failed:",c.message)}const f=l.grandTotal-(r==="cash"?l.grandTotal:0);if(t&&f>0)try{const{increment:c,updateDoc:w,doc:k,serverTimestamp:L}=await T(async()=>{const{increment:mt,updateDoc:vt,doc:ht,serverTimestamp:gt}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{increment:mt,updateDoc:vt,doc:ht,serverTimestamp:gt}},[]),G=k(_,`companies/${B}/suppliers`,t);await w(G,{balance:c(f),updatedAt:L()}),console.log(`[SupplierBalance] Client-side incremented supplier ${t} balance by +${f}`)}catch(c){console.warn("Failed to update supplier balance on client:",c.message)}const S=window._editingPurchaseId?`✅ تم تحديث فاتورة الشراء ${u} بنجاح`:`✅ تم حفظ فاتورة الشراء ${u} وإنشاء القيد المحاسبي`;window._editingPurchaseId=null,window.showToast(S,"success"),closeModal("purchase-modal"),x=[],await loadPurchaseList(),t&&T(()=>import("./balance-sync-B0nwXHmR.js"),__vite__mapDeps([0,1,2,3])).then(c=>c.recalculateSupplierBalance(t)).catch(c=>console.warn(c)),R&&R!==t&&T(()=>import("./balance-sync-B0nwXHmR.js"),__vite__mapDeps([0,1,2,3])).then(c=>c.recalculateSupplierBalance(R)).catch(c=>console.warn(c))}catch(l){e.textContent="خطأ: "+l.message,e.classList.remove("hidden"),console.error(l)}finally{v.disabled=!1,v.textContent="💾 حفظ وإنشاء قيد"}};window.editPurchaseInvoice=async e=>{try{const t=await dt("purchaseInvoices",e);if(!t){window.showToast("لم يتم العثور على الفاتورة","error");return}window._editingPurchaseId=e,document.getElementById("pur-inv-number").value=t.number,document.getElementById("pur-ref-num").value=t.refNumber||"",document.getElementById("pur-notes").value=t.notes||"",document.getElementById("pur-supplier-vat").value=t.supplierVatNumber||"",document.getElementById("pur-inv-date").value=t.date||"",document.getElementById("pur-due-date").value=t.dueDate||"",document.getElementById("pur-payment").value=t.paymentMethod||"credit",document.getElementById("supplier-id").value=t.supplierId||"",document.getElementById("supplier-search").value=t.supplierName||"";const a=document.getElementById("pur-warehouse");a&&(a.value=t.warehouseId||""),x=(t.lines||[]).map(o=>({productId:o.productId,productName:o.productName,sku:o.sku||"",unit:o.unit||"PCS",qty:o.qty||0,unitPrice:o.unitPrice||0,discount:o.discount||0,taxCategory:o.taxCategory||"S",batchNumber:o.batchNumber||"",expiryDate:o.expiryDate||""})),z(),O();const n=document.getElementById("save-pur-btn");n&&(n.textContent="💾 تحديث فاتورة الشراء"),document.getElementById("pur-modal-title").textContent="📦 تعديل فاتورة شراء",openModal("purchase-modal")}catch(t){window.showToast("خطأ: "+t.message,"error")}};window.viewPurchaseInvoice=async e=>{const t=document.getElementById("view-pur-body"),a=document.getElementById("view-pur-title");t.innerHTML='<div class="page-loading" style="min-height:120px;"><div class="loading-spinner"></div></div>',openModal("view-purchase-modal"),m=null;try{const n=Et(_,`companies/${B}/purchaseInvoices`,e),o=await Pt(n);if(!o.exists())throw new Error("الفاتورة غير موجودة");const s={id:o.id,...o.data()};m=s,a.textContent=`فاتورة شراء: ${s.number||e}`;const r=document.getElementById("pur-pay-btn"),i=document.getElementById("pur-cancel-btn");r&&(r.style.display=s.status==="paid"||s.status==="cancelled"?"none":""),i&&(i.style.display=s.status==="cancelled"?"none":"");const p=(s.lines||[]).map((h,I)=>{const g=it(h.qty,h.unitPrice,h.discount),y=h.taxCategory==="S"?g*.15:0;return`<tr>
        <td style="padding:7px 12px;">${I+1}</td>
        <td style="padding:7px 12px;" class="mono">${h.sku||"—"}</td>
        <td style="padding:7px 12px; font-weight:600;">${h.productName}</td>
        <td style="padding:7px 12px;">${h.unit||"—"}</td>
        <td style="padding:7px 12px;" class="mono">${h.qty}</td>
        <td style="padding:7px 12px;" class="mono">${$(h.unitPrice)}</td>
        <td style="padding:7px 12px;" class="mono">${h.discount||0}%</td>
        <td style="padding:7px 12px;" class="mono text-warn">${$(y)}</td>
        <td style="padding:7px 12px;" class="mono font-bold">${$(g+y)}</td>
      </tr>`}).join("");t.innerHTML=`
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
        <div>
          <div class="grid-2 gap-12">
            <div><div class="section-label mb-6">رقم الفاتورة</div><div class="mono text-indigo font-bold text-xl">${s.number}</div></div>
            <div><div class="section-label mb-6">الحالة</div>${ct(s.status)}</div>
            <div><div class="section-label mb-6">المورد</div><div class="font-semibold">${s.supplierName}</div></div>
            <div><div class="section-label mb-6">المخزن</div><div>${s.warehouseName||"—"}</div></div>
            <div><div class="section-label mb-6">التاريخ</div><div>${rt(s.createdAt||s.date)}</div></div>
            <div><div class="section-label mb-6">طريقة الدفع</div><div>${s.paymentMethod==="credit"?"آجل":s.paymentMethod==="cash"?"نقدي":s.paymentMethod}</div></div>
            ${s.refNumber?`<div><div class="section-label mb-6">مرجع المورد</div><div class="mono">${s.refNumber}</div></div>`:""}
            ${s.journalEntryId?'<div><div class="section-label mb-6">رقم القيد</div><span class="badge good">✓ مُرحَّل</span></div>':""}
            ${s.attachmentUrl?`<div style="grid-column: span 2;"><div class="section-label mb-6">المرفق (فاتورة المورد)</div><a href="${s.attachmentUrl}" target="_blank" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:6px;width:fit-content;padding:6px 12px;background:var(--primary-dim);color:var(--primary);border-color:var(--primary);">📎 فتح الفاتورة المرفقة</a></div>`:""}
          </div>
        </div>
        <div style="background:var(--bg-2); border-radius:8px; padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div class="invoice-total-row"><span>المجموع قبل الضريبة</span><span class="mono">${$(s.subtotal||0)}</span></div>
            ${s.discountTotal>0?`<div class="invoice-total-row"><span>الخصومات</span><span class="mono text-bad">- ${$(s.discountTotal)}</span></div>`:""}
            <div class="invoice-total-row"><span>VAT 15%</span><span class="mono text-warn">${$(s.totalVat||0)}</span></div>
            <div class="invoice-total-row grand-total"><span>الإجمالي</span><span class="mono text-brand">${$(s.totalWithVat||0)}</span></div>
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
          <tbody>${p}</tbody>
        </table>
      </div>
      ${s.notes?`<div class="mt-16" style="padding:12px; background:var(--bg-2); border-radius:6px; font-size:13px;"><strong>ملاحظات:</strong> ${s.notes}</div>`:""}
    `}catch(n){t.innerHTML=`<div class="alert bad">${n.message}</div>`}};window.cancelPurchaseInvoice=async e=>{if(await window.showConfirm("إلغاء هذه الفاتورة؟ سيتم عكس حركة المخزون وحذف القيود المحاسبية.","تأكيد الإلغاء"))try{const{getDoc:t,doc:a,collection:n,getDocs:o,query:s,where:r}=await T(async()=>{const{getDoc:l,doc:u,collection:b,getDocs:d,query:E,where:j}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:l,doc:u,collection:b,getDocs:d,query:E,where:j}},[]),i=await t(a(_,`companies/${B}/purchaseInvoices`,e));if(!i.exists()){window.showToast("الفاتورة غير موجودة","error");return}const p=i?.data(),h=p?.supplierId,I=p.invoiceNumber||e,g=p.items||p.lines||[],y=p.warehouseId;if(y&&g.length>0)for(const l of g){const u=l.productId||l.id,b=parseFloat(l.qty||l.quantity||0);if(u&&b>0)try{await J(y,u,-b,"cancel_purchase",`إلغاء فاتورة مشتريات ${I}`,e)}catch(d){console.warn(`[cancelPurchaseInvoice] Stock reversal failed for ${u}:`,d.message)}}const v=["purchaseInvoice","purchase","purchaseCOGS"];for(const l of v)try{const u=await o(s(n(_,`companies/${B}/journalEntries`),r("sourceType","==",l),r("sourceId","==",I)));for(const b of u.docs)await M(b.id),console.log(`[cancelPurchaseInvoice] Deleted JE ${b.id} (${l})`);if(I!==e){const b=await o(s(n(_,`companies/${B}/journalEntries`),r("sourceType","==",l),r("sourceId","==",e)));for(const d of b.docs)await M(d.id)}}catch(u){console.warn(`[cancelPurchaseInvoice] JE cleanup (${l}):`,u.message)}if(p.journalEntryId)try{await M(p.journalEntryId)}catch{}if(await V("purchaseInvoices",e,{status:"cancelled",cancelledAt:new Date().toISOString()}),h){const{recalculateSupplierBalance:l}=await T(async()=>{const{recalculateSupplierBalance:u}=await import("./balance-sync-B0nwXHmR.js");return{recalculateSupplierBalance:u}},__vite__mapDeps([0,1,2,3]));await l(h).catch(()=>{})}window.showToast("✅ تم إلغاء الفاتورة وعكس المخزون والقيود","success"),await loadPurchaseList()}catch(t){window.showToast("خطأ: "+t.message,"error")}};window.deletePurchaseInvoice=async(e,t)=>{if(await window.showConfirm(`هل أنت متأكد من حذف الفاتورة "${t}" نهائياً؟`,"تأكيد الحذف النهائي"))try{const{getById:a,remove:n}=await T(async()=>{const{getById:r,remove:i}=await import("./index-HrCilPJ3.js").then(p=>p.N);return{getById:r,remove:i}},__vite__mapDeps([1,2])),o=await a("purchaseInvoices",e);if(!o)throw new Error("لم يتم العثور على الفاتورة");if(await ut(o),o.lines&&o.warehouseId&&o.status!=="cancelled")for(const r of o.lines)try{await J(o.warehouseId,r.productId,-+r.qty,{type:"purchase_reverse",refId:o.number,documentNumber:o.number,invoiceNumber:o.number,notes:`حذف فاتورة الشراء ${o.number}`})}catch(i){console.warn("Stock reverse skipped:",r.productId,i.message)}const s=o.invoiceNumber||o.number||e;for(const r of["purchaseInvoice","purchase","purchaseCOGS"])try{const i=await U(H(ot(_,`companies/${B}/journalEntries`),q("sourceType","==",r),q("sourceId","==",s)));for(const p of i.docs)await M(p.id),console.log(`[deletePurchaseInvoice] Deleted JE ${p.id} (${r}) for ${s}`)}catch(i){console.warn(`[deletePurchaseInvoice] JE cleanup (${r}) skipped:`,i.message)}if(o.journalEntryId)try{await M(o.journalEntryId)}catch{}if(await n("purchaseInvoices",e),o.supplierId){const{recalculateSupplierBalance:r}=await T(async()=>{const{recalculateSupplierBalance:i}=await import("./balance-sync-B0nwXHmR.js");return{recalculateSupplierBalance:i}},__vite__mapDeps([0,1,2,3]));await r(o.supplierId)}window.showToast(`✅ تم حذف الفاتورة ${t} بنجاح`,"success"),await loadPurchaseList()}catch(a){window.showToast("خطأ في الحذف: "+a.message,"error"),console.error("deletePurchaseInvoice error:",a)}};window.reapplyPurchaseStock=async()=>{if(!m){window.showToast("لا توجد فاتورة مفتوحة","error");return}const e=m;if(!e.warehouseId){window.showToast("⚠️ هذه الفاتورة لا تحتوي على مخزن — لا يمكن تحديث المخزون والقيود","warn");return}if(!e.lines||e.lines.length===0){window.showToast("لا توجد بنود في الفاتورة","warn");return}const t=document.getElementById("pur-restock-btn");t&&(t.disabled=!0,t.textContent="⌛ جارٍ التحديث…");let a=0;const n=[];for(const r of e.lines)try{await J(e.warehouseId,r.productId,+r.qty,{type:"purchase_in",sourceType:"purchaseInvoice",sourceId:e.id,documentNumber:e.number,invoiceNumber:e.number,purchasePrice:r.unitPrice,sku:r.sku||"",productName:r.productName||"",notes:"إعادة تطبيق مخزون "+e.number}),a++}catch(i){console.warn("reapplyStock failed for",r.productName,i.message),n.push(`${r.productName}: ${i.message}`)}let o=null,s="لم يتم إنشاء القيد";try{const r=await D(N.warehouses());o=await lt({id:e.id,invoiceNumber:e.number,date:e.date,supplierId:e.supplierId,supplierName:e.supplierName,paymentMethod:e.paymentMethod,subtotal:e.subtotal,taxAmount:e.totalVat||e.taxAmount||0,total:e.totalWithVat||e.total||0,warehouseId:e.warehouseId},window._purchaseUser||{},r),await V("purchaseInvoices",e.id,{journalEntryId:o}),e.journalEntryId=o,s=`تم إنشاء القيد بنجاح برقم: ${o}`}catch(r){console.error("[AccountingEngine] Failed to create JE:",r),n.push(`خطأ القيد: ${r.message}`)}t&&(t.disabled=!1,t.textContent="🔄 تحديث المخزون والقيود"),a>0&&o?(window.showToast(`✅ تم تحديث المخزون لـ ${a} أصناف بنجاح. ${s}`,"success"),closeModal("view-purchase-modal"),await loadPurchaseList()):window.showToast(`⚠️ تم تحديث ${a} أصناف. فشل القيد: ${n.join(", ")}`,"warn")};window.cancelCurrentPurchase=async()=>{m&&(closeModal("view-purchase-modal"),await cancelPurchaseInvoice(m.id))};window.registerPayment=async()=>{if(!m)return;const e=prompt(`تسجيل دفعة لفاتورة ${m.number}
المبلغ المستحق: ${$(m.totalWithVat)}

أدخل المبلغ المدفوع:`);if(!e)return;const t=parseFloat(e);if(isNaN(t)||t<=0){alert("مبلغ غير صحيح");return}const a=prompt("اختر طريقة السداد (نقدي / بنك):");if(!a)return;const n=a.includes("نقد")||a.toLowerCase().includes("cash"),o=a.includes("بنك")||a.toLowerCase().includes("bank")||a.toLowerCase().includes("transfer");if(!n&&!o){alert("طريقة دفع غير صالحة. يرجى كتابة 'نقدي' أو 'بنك'.");return}try{const s=t>=m.totalWithVat?"paid":"partial";await V("purchaseInvoices",m.id,{status:s,paidAmount:t}),n?await tt({type:"out",amount:t,notes:`سداد فاتورة مشتريات آجل ${m.number} — ${m.supplierName}`,sourceType:"purchaseInvoice",sourceId:m.id,date:m.date||new Date().toISOString().split("T")[0]}):await et({type:"out",amount:t,notes:`سداد فاتورة مشتريات آجل ${m.number} — ${m.supplierName}`,sourceType:"purchaseInvoice",sourceId:m.id,date:m.date||new Date().toISOString().split("T")[0]});let r="";try{const{autoSupplierPaymentJE:i}=await T(async()=>{const{autoSupplierPaymentJE:p}=await import("./accounting-engine-BmLox5ep.js");return{autoSupplierPaymentJE:p}},__vite__mapDeps([4,1,2]));r=await i({id:m.id,date:m.date||new Date().toISOString().split("T")[0],amount:t,supplierId:m.supplierId,paymentMethod:n?"cash":"bank",supplierName:m.supplierName,reference:`PAY-${m.number}`},window._purchaseUser||{}),await V("purchaseInvoices",m.id,{paymentJournalEntryId:r})}catch(i){console.warn("[AccountingEngine] Supplier payment JE failed:",i.message)}if(m.supplierId)try{const{increment:i,updateDoc:p,doc:h,serverTimestamp:I}=await T(async()=>{const{increment:y,updateDoc:v,doc:l,serverTimestamp:u}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{increment:y,updateDoc:v,doc:l,serverTimestamp:u}},[]),g=h(_,`companies/${B}/suppliers`,m.supplierId);await p(g,{balance:i(-t),updatedAt:I()})}catch(i){console.warn("Supplier balance update failed:",i.message)}window.showToast("✅ تم تسجيل السداد وتوليد قيد اليومية وتحديث حساب المورد بنجاح","success"),closeModal("view-purchase-modal"),await loadPurchaseList()}catch(s){window.showToast("خطأ: "+s.message,"error")}};window.printPurchaseInvoice=async()=>{m&&await nt(m)};window.printPurchasePreview=async()=>{const e={number:document.getElementById("pur-inv-number").value,date:document.getElementById("pur-inv-date").value,supplierName:document.getElementById("supplier-search").value,supplierVat:document.getElementById("pur-supplier-vat").value,warehouseName:document.getElementById("pur-warehouse").selectedOptions?.[0]?.text||"",notes:document.getElementById("pur-notes").value,items:x,...Z(x)};await nt(e)};async function nt(e,t=!1){let a={};try{a=JSON.parse(localStorage.getItem("idham_company")||"{}")}catch{}try{const{getDoc:f,doc:S}=await T(async()=>{const{getDoc:k,doc:L}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:k,doc:L}},[]),[c,w]=await Promise.all([f(S(_,`companies/${B}/settings`,"company")),f(S(_,`companies/${B}/settings`,"logo"))]);c.exists()&&Object.assign(a,c.data()),w.exists()&&w.data().dataUrl&&(a.logoUrl=w.data().dataUrl)}catch(f){console.warn("Failed to load company details for purchase PDF:",f)}const n=a.name||a.companyName||"إدهام للمواد الغذائية والتوزيع",o=a.vatNumber||a.vat||"",s=a.phone||"",r=a.email||"",i=[a.address,a.city,a.zip,a.country].filter(Boolean).join("، ")||"الرياض، المملكة العربية السعودية",p=a.logoUrl||a.logoBase64||a.logo||"";let h=e.supplierVat||e.supplierVatNumber||"",I=e.supplierPhone||"",g=e.supplierAddress||"";if(e.supplierId)try{const{getById:f}=await T(async()=>{const{getById:c}=await import("./index-HrCilPJ3.js").then(w=>w.N);return{getById:c}},__vite__mapDeps([1,2])),S=await f("suppliers",e.supplierId);S&&(h=S.vatNumber||S.vat||h,I=S.phone||I,g=S.address||g)}catch(f){console.warn("[generatePurchasePDF] Supplier details lookup failed:",f)}const v=new Date().toLocaleDateString("ar-SA",{year:"numeric",month:"long",day:"numeric"}),l=e.items||e.lines||[];let u="",b=0,d=0;l.forEach((f,S)=>{const c=(f.qty||0)*(f.unitPrice||0)*(1-(f.discount||0)/100),w=f.taxCategory==="S"?c*.15:0;b+=c,d+=w,u+=`
      <tr>
        <td style="text-align:center;">${S+1}</td>
        <td class="mono">${f.sku||"—"}</td>
        <td style="font-weight:600;">${f.productName||""}</td>
        <td style="text-align:center;">${f.unit||"—"}</td>
        <td class="mono" style="text-align:center;">${f.qty}</td>
        <td class="mono">${Number(f.unitPrice||0).toFixed(2)}</td>
        <td class="mono" style="text-align:center;">${f.discount||0}%</td>
        <td class="mono">${c.toFixed(2)}</td>
      </tr>`});const E=b+d,j=t?"أمر شراء / طلب عرض سعر":"فاتورة شراء",P=t?"📋":"📦",R=t?"Purchase Order / RFQ":"Purchase Invoice",W=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${j} — ${e.number||""}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4; margin: 15mm; }
    body { font-family: 'IBM Plex Sans Arabic', sans-serif; font-size: 11px; color: #000; direction: rtl; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .doc-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 15px; border-bottom: 3px solid #5B5CEB; margin-bottom: 20px; }
    .co-logo { max-height: 60px; max-width: 150px; object-fit: contain; background:#fff; padding:4px; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,0.1); }
    .company-info h1 { font-size: 18px; color: #1a1a2e; margin-bottom: 4px; }
    .company-info p { font-size: 10px; color: #555; line-height: 1.6; }
    .doc-badge { background: #5B5CEB !important; color: #fff !important; padding: 8px 20px; border-radius: 8px; font-size: 14px; font-weight: 700; text-align: center; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .doc-badge small { display: block; font-size: 9px; font-weight: 400; opacity: 0.8; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .info-box { background: #f8f9fc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; }
    .info-box h3 { font-size: 11px; color: #5B5CEB; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
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
    .total-row.grand { border-top: 2px solid #5B5CEB; padding-top: 8px; margin-top: 8px; font-size: 14px; font-weight: 700; color: #5B5CEB; }
    .footer { clear: both; margin-top: 40px; padding-top: 15px; border-top: 1px solid #ddd; }
    .signatures { display: flex; justify-content: space-between; margin-top: 30px; }
    .sig-box { text-align: center; width: 150px; }
    .sig-line { border-top: 1px solid #999; margin-top: 40px; padding-top: 4px; font-size: 9px; color: #666; }
    ${t?".po-note { background: #FFF7ED; border: 1px solid #FDBA74; border-radius: 6px; padding: 10px; font-size: 10px; color: #92400E; margin-bottom: 15px; }":""}
    .terms { font-size: 9px; color: #666; margin-top: 15px; }
    .terms li { margin-bottom: 3px; }

    @media print {
      body { background:#fff; }
      .doc-badge { background: #5B5CEB !important; color: #fff !important; }
      thead th { background: #1a1a2e !important; color: #fff !important; }
    }
  </style>
</head>
<body>
  <div class="doc-header">
    <div style="display:flex; gap:15px; align-items:center;">
      ${p?`<img class="co-logo" src="${p}" alt="الشعار">`:""}
      <div class="company-info">
        <h1>${n}</h1>
        <p>📍 العنوان: <strong>${i}</strong></p>
        ${s?`<p>📞 الهاتف: <strong>${s}</strong></p>`:""}
        ${r?`<p>✉️ البريد: <strong>${r}</strong></p>`:""}
        ${o?`<p>🔢 الرقم الضريبي: <strong>${o}</strong></p>`:""}
      </div>
    </div>
    <div class="doc-badge">
      ${P} ${j}
      <small>${R}</small>
      <div style="font-size:16px; margin-top:4px;">${e.number||"—"}</div>
    </div>
  </div>

  ${t?`<div class="po-note">
    ⚠️ هذا أمر شراء / طلب عرض سعر. يُرجى من المورد المذكور أدناه تأكيد الأسعار والكميات المتاحة والتوقيع والختم وإعادة هذه الوثيقة. صلاحية هذا الطلب <strong>7 أيام عمل</strong> من تاريخه.
  </div>`:""}

  <div class="info-grid">
    <div class="info-box">
      <h3>بيانات ${t?"المورد المطلوب منه":"المورد"}</h3>
      <div class="info-row"><span class="label">اسم المورد:</span><span class="value">${e.supplierName||"—"}</span></div>
      ${h?`<div class="info-row"><span class="label">الرقم الضريبي:</span><span class="value mono">${h}</span></div>`:""}
      ${I?`<div class="info-row"><span class="label">رقم الهاتف:</span><span class="value mono">${I}</span></div>`:""}
      ${g?`<div class="info-row"><span class="label">العنوان:</span><span class="value">${g}</span></div>`:""}
    </div>
    <div class="info-box">
      <h3>بيانات ${t?"الطلب":"الفاتورة"}</h3>
      <div class="info-row"><span class="label">التاريخ:</span><span class="value">${e.date||v}</span></div>
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
        <th style="text-align:center;">الكمية${t?" المطلوبة":""}</th>
        <th>سعر الوحدة</th>
        <th style="text-align:center;">خصم%</th>
        <th>الصافي</th>
      </tr>
    </thead>
    <tbody>
      ${u}
    </tbody>
  </table>

  <div class="totals-box">
    <div class="total-row"><span>المجموع قبل الضريبة</span><span class="mono">${b.toFixed(2)} ر.س</span></div>
    <div class="total-row"><span>ضريبة القيمة المضافة 15%</span><span class="mono">${d.toFixed(2)} ر.س</span></div>
    <div class="total-row grand"><span>الإجمالي</span><span class="mono">${E.toFixed(2)} ر.س</span></div>
  </div>

  ${e.notes?`<div style="clear:both; padding-top:15px;"><strong>ملاحظات:</strong> ${e.notes}</div>`:'<div style="clear:both;"></div>'}

  ${t?`
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
      <div class="sig-line">المشتري / ${n}</div>
    </div>
    ${t?`<div class="sig-box">
      <div class="sig-line">تأكيد المورد / الختم</div>
    </div>`:""}
    <div class="sig-box">
      <div class="sig-line">المستلم / أمين المخزن</div>
    </div>
  </div>

  <div class="footer" style="text-align:center; font-size:8px; color:#aaa; margin-top:20px;">
    مُنشأ من نظام إدهام ERP — ${v}
  </div>
</body>
</html>`,C=window.open("","_blank","width=800,height=1000");C.document.write(W),C.document.close(),C.onload=()=>setTimeout(()=>C.print(),500)}window.generatePurchaseOrder=async()=>{const e=document.getElementById("supplier-search")?.value;if(!e&&!x.length){window.showToast("أضف المورد والأصناف أولاً ثم اضغط 'أمر شراء'","info"),openPurchaseModal();return}const t={number:document.getElementById("pur-inv-number")?.value||"PO-"+Date.now(),date:document.getElementById("pur-inv-date")?.value||F(),supplierName:e||"—",supplierVat:document.getElementById("pur-supplier-vat")?.value||"",warehouseName:document.getElementById("pur-warehouse")?.selectedOptions?.[0]?.text||"",notes:document.getElementById("pur-notes")?.value||"",items:x};await nt(t,!0)};window.exportPurchaseCSV=async()=>{try{const e=H(N.purchaseInvoices(),A("createdAt","desc"),at(500)),a=(await U(e)).docs.map(i=>({id:i.id,...i.data()})),n=["رقم الفاتورة","التاريخ","المورد","المخزن","المجموع","VAT","الإجمالي","الحالة"],o=a.map(i=>[i.number,i.date||"",i.supplierName,i.warehouseName,i.subtotal||0,i.totalVat||0,i.totalWithVat||0,i.status]),s="\uFEFF"+[n,...o].map(i=>i.map(p=>`"${p}"`).join(",")).join(`
`),r=document.createElement("a");r.href="data:text/csv;charset=utf-8,"+encodeURIComponent(s),r.download="purchase-invoices.csv",r.click()}catch(e){window.showToast("خطأ: "+e.message,"error")}};window.openPurchaseModalFromGRPO=async e=>{x=(e.items||[]).map(t=>({productId:t.productId,productName:t.productName,sku:t.sku||"",unit:t.unit||"PCS",qty:t.qty||0,unitPrice:t.unitPrice||0,discount:0,taxCategory:"S",batchNumber:t.batchNumber||"",expiryDate:t.expiryDate||""})),z(),O(),setTimeout(()=>{const t=document.getElementById("supplier-search");t&&(t.value=e.supplierName||"");const a=document.getElementById("supplier-id");a&&(a.value=e.supplierId||"");const n=document.getElementById("pur-ref-num");n&&(n.value=e.grpoNumber?`GRPO-${e.grpoNumber}`:"");const o=document.getElementById("pur-notes");o&&(o.value=`محولة من إذن الاستلام رقم ${e.grpoNumber||""}`);const s=document.getElementById("pur-warehouse");s&&e.warehouseId&&(s.value=e.warehouseId)},300),document.getElementById("pur-inv-date").value=F(),document.getElementById("pur-form-error").classList.add("hidden"),document.getElementById("pur-modal-title").textContent=`📦 فاتورة شراء من إذن استلام ${e.grpoNumber||""}`,document.getElementById("pur-inv-number").value="جارِ التوليد...",openModal("purchase-modal"),pt();try{const t=await X("PUR");document.getElementById("pur-inv-number").value=t}catch{}};window.convertPurchaseToSaleInvoice=async e=>{try{const{getById:t}=await T(async()=>{const{getById:n}=await import("./index-HrCilPJ3.js").then(o=>o.N);return{getById:n}},__vite__mapDeps([1,2])),a=await t("purchaseInvoices",e);if(!a){showToast("الفاتورة غير موجودة","error");return}sessionStorage.setItem("convert_purchase_to_sale",JSON.stringify({purchaseInvoiceId:a.id,purchaseNumber:a.number,warehouseId:a.warehouseId||"",items:(a.lines||[]).map(n=>({productId:n.productId,productName:n.productName,sku:n.sku||"",unit:n.unit||"PCS",qty:n.qty||0,unitPrice:n.unitPrice||0}))})),closeModal("view-purchase-modal"),showToast("تم نسخ بنود الفاتورة بنجاح. يتم توجيهك الآن للمبيعات...","success"),typeof navigate=="function"&&navigate("sales-invoices")}catch(t){showToast(t.message,"error")}};window.markPurchaseAsPaidManually=async e=>{if(await window.showConfirm("هل تريد تعيين الفاتورة كمدفوعة يدوياً؟ (سيتم تغيير الحالة فقط دون إنشاء قيد سداد مكرر)","تأكيد التغيير"))try{const{update:t}=await T(async()=>{const{update:a}=await import("./index-HrCilPJ3.js").then(n=>n.N);return{update:a}},__vite__mapDeps([1,2]));await t("purchaseInvoices",e,{status:"paid",paidAmount:m?.totalWithVat||0,manuallyPaid:!0,updatedAt:new Date().toISOString()}),window.showToast("✅ تم تعيين الفاتورة كمدفوعة يدوياً بنجاح","success"),closeModal("view-purchase-modal"),await loadPurchaseList()}catch(t){window.showToast("خطأ: "+t.message,"error")}};export{Ft as render};
