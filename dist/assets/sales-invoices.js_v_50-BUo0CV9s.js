const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-T8P1GM2w.js","assets/index-Dq7oGj9k.css","assets/balance-sync-D_Qo7lf4.js"])))=>i.map(i=>d[i]);
import{t as ut,g as tt,a as O,f as $,b as Ht,c as Wt,z as Jt,q as Gt,C as D,I as Zt,J as Kt,_ as at,d as z,i as se,F as Dt,K as ie,L as de,A as Lt,j as xt,u as yt,o as re,M as Yt,N as Xt,O as Ot,r as te}from"./index-T8P1GM2w.js";import{autoSalesJE as ce}from"./accounting-engine-BP8YIZdW.js";import{e as le}from"./excel-zCoXiaxq.js";import{orderBy as Y,where as M,query as X,limit as Vt,getDocs as rt,getDoc as vt,doc as pt,collection as gt,updateDoc as pe,serverTimestamp as ue,increment as me}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";function Bt(o,t){const n=new TextEncoder().encode(t),a=new Uint8Array(2+n.length);return a[0]=o,a[1]=n.length,a.set(n,2),a}function ve(o){const t=o.reduce((a,s)=>a+s.length,0),e=new Uint8Array(t);let n=0;for(const a of o)e.set(a,n),n+=a.length;return e}function fe(o){let t="";for(let e=0;e<o.length;e++)t+=String.fromCharCode(o[e]);return btoa(t)}function ge(o){const{sellerName:t,vatNumber:e,timestamp:n,totalWithVat:a,vatAmount:s}=o,i=[Bt(1,t),Bt(2,e),Bt(3,n),Bt(4,Number(a).toFixed(2)),Bt(5,Number(s).toFixed(2))];return fe(ve(i))}async function be(o,t,e=120){if(typeof t=="string"&&(t=document.getElementById(t)),!!t){if(t.innerHTML="",typeof window.QRCode>"u"){console.warn("QRCode.js not loaded"),t.innerHTML='<div style="font-size:10px;color:#9ca3af;text-align:center;">QR ZATCA</div>';return}try{if(typeof QRCode.toCanvas=="function"){const n=document.createElement("canvas");t.appendChild(n),await QRCode.toCanvas(n,o,{width:e,margin:1,color:{dark:"#000000",light:"#FFFFFF"},errorCorrectionLevel:"M"})}else new QRCode(t,{text:o,width:e,height:e,correctLevel:QRCode.CorrectLevel?QRCode.CorrectLevel.M:0})}catch(n){console.error("QR generation failed:",n),t.innerHTML='<div class="alert warn" style="font-size:10px;">تعذر توليد QR</div>'}}}function ot(o){return{Piece:"حبة",Carton:"كرتون",Box:"بوكس",Bag:"كيس",Pack:"شد",Sack:"شوال",Bale:"بالة",Barrel:"برميل",Tray:"طبق",Gallon:"جالون",Kilogram:"كيلو",Ton:"طن",Liter:"لتر",Gram:"جرام",Can:"علبة",Bottle:"زجاجة",Meter:"متر",Tank:"تنك",Roll:"رول",Pallet:"باليت",PCS:"حبة"}[o]||o||""}let E=[],A=null,it=[],Tt=[],_t=null,St=null;const R=(o,t="info")=>{window.showToast?window.showToast(o,t):console.log(`[Toast Fallback - ${t}]: ${o}`)};function Qt(o){const t=document.getElementById("inv-form-error");t?(t.textContent=o,t.classList.remove("hidden")):alert(o)}async function ee(){if(St)return St;try{const o=await vt(pt(z,`companies/${D}/settings`,"system"));o.exists()&&(St=o.data())}catch(o){console.error("Failed to load pricing settings:",o)}return St||{}}async function _e(o,t){o.innerHTML=ye(),window._salesUser=t,document.getElementById("inv-from").addEventListener("change",()=>loadInvoicesList()),document.getElementById("inv-to").addEventListener("change",()=>loadInvoicesList()),document.getElementById("inv-status-filter").addEventListener("change",()=>loadInvoicesList()),document.getElementById("inv-zatca-filter").addEventListener("change",()=>loadInvoicesList());const e=document.getElementById("inv-text-filter");e&&e.addEventListener("input",(window.debounce||(s=>s))(()=>loadInvoicesList(),300)),await Promise.all([he(),loadInvoicesList()]);const n=sessionStorage.getItem("convert_purchase_to_sale");if(n){sessionStorage.removeItem("convert_purchase_to_sale");try{const s=JSON.parse(n);setTimeout(()=>{window.openSalesInvoiceFromPurchase(s)},200)}catch(s){console.error(s)}}const a=sessionStorage.getItem("convert_quote");if(a){sessionStorage.removeItem("convert_quote");try{const s=JSON.parse(a);setTimeout(()=>{window.openSalesInvoiceFromQuote(s)},200)}catch(s){console.error(s)}}}async function he(){try{const[o,t,e]=await Promise.all([tt(O.customers(),[Y("name")]),tt(O.salesReps(),[Y("name")]),tt(O.warehouses(),[Y("name")])]);dt=o,ft=t,Z=e;const n=document.getElementById("inv-customer-filter");n&&(n.innerHTML='<option value="">كل العملاء</option>'+o.map(i=>`<option value="${i.id}">${i.name}</option>`).join(""));const a=document.getElementById("inv-rep-filter");if(a){const i=[],v=new Set;t.forEach(r=>{const u=(r.name||"").trim();u&&!v.has(u)&&(v.add(u),i.push(r))}),a.innerHTML='<option value="">كل المناديب</option>'+i.map(r=>`<option value="${r.id}">${r.name}</option>`).join("")}const s=document.getElementById("inv-warehouse-filter");s&&(s.innerHTML='<option value="">كل المستودعات</option>'+e.map(i=>`<option value="${i.id}">${i.name}</option>`).join(""))}catch(o){console.warn("Failed to load list filters dropdowns:",o)}}function ye(){return`
    <!-- Filter Bar -->
    <div class="filterbar" style="flex-wrap: wrap; gap: 8px; align-items: flex-end;">
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="inv-from" value="${new Date(new Date().setDate(1)).toISOString().split("T")[0]}" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="inv-to" value="${ut()}" />
      </div>
      <div class="filter-select-group">
        <label>الحالة</label>
        <select id="inv-status-filter">
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
        <select id="inv-zatca-filter">
          <option value="">الكل</option>
          <option value="reported">مُرسلة</option>
          <option value="pending">لم تُرسل</option>
        </select>
      </div>
      <div class="filter-select-group">
        <label>العميل</label>
        <select id="inv-customer-filter" onchange="loadInvoicesList()">
          <option value="">كل العملاء</option>
        </select>
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
        <button class="quick-filter-btn" onclick="invFilterRange('today')">اليوم</button>
        <button class="quick-filter-btn active" onclick="invFilterRange('month')">هذا الشهر</button>
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

    <!-- New/Edit Invoice Modal -->
    <div class="modal-overlay" id="new-invoice-modal">
      <div class="modal modal-xl">
        <div class="modal-header">
          <h3 class="modal-title" id="invoice-modal-title">فاتورة مبيعات جديدة</h3>
          <button class="modal-close" onclick="closeModal('new-invoice-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <!-- Header Fields -->
          <div class="grid-3 gap-16 mb-16">
            <div class="form-group">
              <label>رقم الفاتورة</label>
              <input type="text" id="inv-number" class="input mono" readonly placeholder="يُولَّد تلقائياً" />
            </div>
            <div class="form-group">
              <label>التاريخ *</label>
              <input type="date" id="inv-date" class="input" value="${ut()}" />
            </div>
            <div class="form-group">
              <label>نوع الفاتورة</label>
              <select id="inv-type">
                <option value="standard">فاتورة ضريبية (B2B)</option>
                <option value="simplified">فاتورة مبسطة (B2C)</option>
              </select>
            </div>
          </div>

          <div class="grid-3 gap-16 mb-16">
            <!-- Customer -->
            <div class="form-group">
              <label>العميل *</label>
              <div class="autocomplete-container" id="customer-ac-wrap">
                <input type="text" id="customer-search" class="input" placeholder="ابحث باسم العميل…" autocomplete="off" />
                <div class="autocomplete-results hidden" id="customer-results"></div>
                <input type="hidden" id="customer-id" />
              </div>
              <div id="donation-badge" class="alert info hidden" style="margin-top:8px; padding: 6px 12px; font-size:11px; font-weight: bold; border-left: 3px solid var(--info, #3b82f6); background: rgba(59,130,246,0.1); color: #3b82f6;"></div>
              <!-- Credit Status -->
              <div id="credit-status-bar" class="hidden" style="margin-top:8px;">
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
            </div>

            <!-- Sales Rep -->
            <div class="form-group">
              <label>المندوب (اختياري)</label>
              <select id="inv-rep" onchange="window.autoSelectCostCenter && window.autoSelectCostCenter()">
                <option value="">بيع مباشر (بدون مندوب)</option>
              </select>
            </div>

            <!-- Warehouse -->
            <div class="form-group">
              <label>المخزن *</label>
              <select id="inv-warehouse" onchange="window.resolveAllLineBatches(); renderInvoiceLines(); window.autoSelectCostCenter && window.autoSelectCostCenter();">
                <option value="">اختر المخزن</option>
              </select>
            </div>

            <!-- Cost Center -->
            <div class="form-group">
              <label>🏷️ مركز التكلفة (اختياري)</label>
              <select id="inv-cost-center">
                <option value="">بدون مركز تكلفة</option>
              </select>
            </div>
          </div>

          <div class="grid-3 gap-16 mb-16">
            <div class="form-group">
              <label>طريقة الدفع</label>
              <select id="inv-payment" onchange="updateInvoiceTotals()">
                <option value="cash">نقدي</option>
                <option value="credit">آجل</option>
                <option value="transfer">تحويل بنكي</option>
                <option value="check">شيك</option>
              </select>
            </div>
            <div class="form-group">
              <label>المبلغ المدفوع (ر.س)</label>
              <input type="number" id="inv-paid-amount" class="input mono" step="0.01" min="0" placeholder="0.00" />
            </div>
            <div class="form-group">
              <label>ملاحظات</label>
              <input type="text" id="inv-notes" class="input" placeholder="ملاحظة اختيارية" />
            </div>
          </div>

          <div class="divider-label">بنود الفاتورة</div>

          <!-- Line Items -->
          <div class="invoice-lines">
            <table style="width:100%;font-size:12.5px;">
              <thead>
                <tr style="background:var(--bg-2);border-bottom:1px solid var(--border);">
                  <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-2);">#</th>
                  <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-2);">الصنف</th>
                  <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-2);">الوحدة</th>
                  <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-2);">الكمية</th>
                  <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-2);">سعر الوحدة</th>
                  <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-2);">خصم%</th>
                  <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-2);">رقم التشغيلة</th>
                  <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-2);">تاريخ الانتهاء</th>
                  <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-2);">ض.ق.م</th>
                  <th style="padding:8px 10px;text-align:right;font-size:11px;color:var(--text-2);">الإجمالي</th>
                  <th style="width:36px;"></th>
                </tr>
              </thead>
              <tbody id="invoice-lines-tbody"></tbody>
            </table>
          </div>

          <div class="grid-2 gap-16" style="margin-top:16px; align-items:start;">
            <!-- Add Product & Search -->
            <div>
              <div style="display:grid; grid-template-columns:160px 1fr; gap:12px; align-items:end;">
                <div class="form-group" style="margin-bottom:0;">
                  <label style="font-size:11px; margin-bottom:4px;">تصفية بالفئة</label>
                  <select id="inv-product-category-filter" class="input" style="padding:6px; font-size:12px; height:34px;">
                    <option value="">كل الفئات</option>
                  </select>
                </div>
                <div class="form-group" style="margin-bottom:0;">
                  <label style="font-size:11px; margin-bottom:4px;">إضافة صنف للفاتورة</label>
                  <div class="autocomplete-container">
                    <input type="text" id="product-search-input" class="input" style="padding:6px; font-size:12px; height:34px;" placeholder="🔍 ابحث باسم الصنف أو الكود للإضافة... [F8 للبحث المتقدم]" autocomplete="off" />
                    <div class="autocomplete-results hidden" id="product-search-results"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Totals -->
            <div style="display:flex; justify-content:flex-end;">
              <div class="invoice-totals" style="width:100%; max-width:320px;">
                <div class="invoice-total-row">
                  <span>المجموع الفرعي</span>
                  <span class="mono" id="total-subtotal">0.00 ر.س</span>
                </div>
                <div class="invoice-total-row">
                  <span>الخصم الإجمالي</span>
                  <span class="mono text-bad" id="total-discount">0.00 ر.س</span>
                </div>
                <div class="invoice-total-row">
                  <span>ضريبة القيمة المضافة (15%)</span>
                  <span class="mono text-warn" id="total-vat">0.00 ر.س</span>
                </div>
                <div class="invoice-total-row grand-total">
                  <span>الإجمالي النهائي</span>
                  <span class="mono" id="total-grand">0.00 ر.س</span>
                </div>
                <div class="invoice-total-row" style="border-top:1px dashed var(--border-soft); margin-top:8px; padding-top:8px;">
                  <span style="font-weight:bold;color:var(--good);">الربح التقديري (صافي)</span>
                  <span class="mono font-bold text-good" id="total-profit">0.00 ر.س</span>
                </div>
                <div class="invoice-total-row">
                  <span style="font-weight:bold;color:var(--good);">نسبة الهامش التقديرية</span>
                  <span class="mono font-bold text-good" id="total-margin">0.0%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group mb-16" style="margin-top: 16px;">
            <label>📁 إرفاق مستند / سند تسليم الفاتورة (أتمتة الأرشيف)</label>
            <input type="file" id="inv-file-upload" class="input" accept="image/*,application/pdf" />
          </div>

          <div id="inv-form-error" class="alert bad hidden" style="margin-top:12px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="closeModal('new-invoice-modal')">إلغاء</button>
          <button class="btn btn-secondary" onclick="saveInvoice('draft')">حفظ مسودة</button>
          <button class="btn btn-primary" onclick="saveInvoice('pending')" id="save-inv-btn">💾 حفظ وإصدار</button>
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
    </div>`}let Pt=null,Et=0,Nt=new Map,ft=null,Z=null,dt=null;window.loadInvoicesList=async()=>{Pt=null,Et=0,await Mt()};window.invPage=async o=>{o==="next"&&Pt&&(Et++,await Mt()),o==="prev"&&Et>0&&(Et--,Pt=null,await Mt())};async function Mt(){const o=document.getElementById("inv-tbody");if(o){o.innerHTML=`${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(11).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;try{const t=document.getElementById("inv-from")?.value,e=document.getElementById("inv-to")?.value;let n=O.salesInvoices();const a=[];t&&a.push(M("date",">=",t)),e&&a.push(M("date","<=",e)),!t&&!e?n=X(n,...a,Y("date","desc"),Vt(100)):n=X(n,...a,Y("date","desc"));let i=(await rt(n)).docs.map(d=>({id:d.id,...d.data()}));i.forEach(d=>Nt.set(d.id,d));const v=document.getElementById("inv-status-filter")?.value;v&&(i=i.filter(d=>d.status===v));const r=document.getElementById("inv-customer-filter")?.value;r&&(i=i.filter(d=>d.customerId===r||d.customerName===dt?.find(p=>p.id===r)?.name));const u=document.getElementById("inv-rep-filter")?.value,b=u?ft?.find(d=>d.id===u)?.name:null;u&&(i=i.filter(d=>d.repId===u||b&&d.repName===b));const l=document.getElementById("inv-warehouse-filter")?.value;l&&(i=i.filter(d=>d.warehouseId===l||d.sourceWarehouseId===l)),i.sort((d,p)=>{const w=d.date||"",N=p.date||"";if(w!==N)return N.localeCompare(w);const H=d.number||d.invoiceNumber||d.id||"";return(p.number||p.invoiceNumber||p.id||"").localeCompare(H)});const x=!1;Pt=null;const I=i.filter(d=>d.status!=="cancelled"),T=I.reduce((d,p)=>d+(p.totalWithVat||p.grandTotal||p.total||0),0);let k=0;try{const d=document.getElementById("inv-from")?.value,p=document.getElementById("inv-to")?.value;let w=O.receipts();const N=[];d&&N.push(M("date",">=",d)),p&&N.push(M("date","<=",p)),!d&&!p&&!r?w=X(w,...N,Y("date","desc"),Vt(100)):w=X(w,...N,Y("date","desc")),k=(await rt(w)).docs.map(g=>({id:g.id,...g.data()})).filter(g=>{const P=g.date||(g.createdAt?.toDate?g.createdAt.toDate().toISOString().slice(0,10):"");if(!((!d||P>=d)&&(!p||P<=p))||r&&g.customerId!==r&&g.targetId!==r)return!1;if(u){const Q=g.repId===u,G=b&&(g.repName===b||g.salesRepName===b),_=I.some(F=>F.customerId===g.customerId||F.customerId===g.targetId||F.customerName===g.customerName||F.customerName===g.targetName);if(!Q&&!G&&!_)return!1}return!0}).reduce((g,P)=>g+parseFloat(P.amount||0),0)}catch{k=I.reduce((p,w)=>p+parseFloat(w.amountPaid||w.paidAmount||0),0)}const V=Math.max(0,T-k),B=i.filter(d=>d.zatcaStatus==="reported").length;document.getElementById("kpi-total").textContent=$(T),document.getElementById("kpi-paid").textContent=$(k),document.getElementById("kpi-unpaid").textContent=$(V),document.getElementById("kpi-zatca").textContent=`${B} / ${i.length}`,document.getElementById("inv-count-label").textContent=`${i.length} فاتورة`,i.length===0?o.innerHTML='<tr><td colspan="11" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد فواتير</td></tr>':o.innerHTML=i.map(d=>`
        <tr style="cursor:pointer;" onclick="viewInvoice('${d.id}')">
          <td class="mono text-indigo">${d.number||d.invoiceNumber||d.id.slice(0,8)}</td>
          <td class="dim">${Ht(d.date)}</td>
          <td class="font-semibold">${dt&&dt.find(p=>p.id===d.customerId)?.name||d.customerName||"—"}</td>
          <td class="dim">${d.repName||"—"}</td>
          <td class="dim" style="font-size:11px;">${d.warehouseName||Z&&Z.find(p=>p.id===d.warehouseId)?.name||"—"}</td>
          <td class="mono font-bold">${$(d.subtotal)}</td>
          <td class="mono text-warn">${$(d.totalVat||d.vatAmount||0)}</td>
          <td class="mono">${$(d.totalWithVat||d.total||0)}</td>
          <td>${Wt(d.status)}</td>
          <td>${d.zatcaStatus==="reported"?'<span class="zatca-stamp reported">✓ مُرسلة</span>':'<span class="zatca-stamp pending">معلقة</span>'}</td>
          <td style="font-size:11px;">${d.journalEntryId?'<span class="badge good" style="font-size:10px;">✓ مُرحَّل</span>':'<span class="badge" style="font-size:10px; background:var(--bg-3); color:var(--text-2);">—</span>'}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-icon sm btn-ghost" onclick="event.stopPropagation();viewInvoice('${d.id}')" title="عرض">👁️</button>
              ${d.status!=="cancelled"?`<button class="btn btn-icon sm btn-ghost" onclick="event.stopPropagation();editInvoice('${d.id}')" title="تعديل">✏️</button>`:""}
              ${d.status!=="cancelled"?`<button class="btn btn-icon sm btn-ghost" onclick="event.stopPropagation();cancelInvoice('${d.id}')" title="إلغاء" style="color:var(--bad);">🚫</button>`:""}
              <button class="btn btn-icon sm btn-ghost text-bad" onclick="event.stopPropagation();deleteInvoice('${d.id}','${d.number}')" title="حذف">🗑️</button>
            </div>
          </td>
        </tr>`).join(""),document.getElementById("inv-next")?.toggleAttribute("disabled",!x),document.getElementById("inv-prev")?.toggleAttribute("disabled",Et===0),document.getElementById("inv-page-info").textContent=`صفحة ${Et+1}`}catch(t){console.error(t),o.innerHTML=`<tr><td colspan="11"><div class="alert bad" style="margin:8px;">${t.message}</div></td></tr>`}}}window.invFilterRange=o=>{const t=ut();o==="today"?(document.getElementById("inv-from").value=t,document.getElementById("inv-to").value=t):o==="month"&&(document.getElementById("inv-from").value=new Date(new Date().setDate(1)).toISOString().split("T")[0],document.getElementById("inv-to").value=t),document.querySelectorAll(".quick-filter-btn").forEach(e=>e.classList.remove("active")),event.target.classList.add("active"),loadInvoicesList()};window.openNewInvoice=()=>{E=[],A=null,window._editingInvoiceId=null;const o=document.getElementById("save-inv-btn");o&&(o.textContent="💾 حفظ وإصدار الفاتورة"),document.getElementById("inv-number").value="جارٍ التوليد…",document.getElementById("customer-search").value="",document.getElementById("customer-id").value="",document.getElementById("inv-date").value=ut(),document.getElementById("inv-payment").value="credit",document.getElementById("inv-paid-amount").value="",document.getElementById("inv-notes").value="",document.getElementById("credit-status-bar").classList.add("hidden"),document.getElementById("donation-badge")?.classList.add("hidden"),document.getElementById("inv-form-error").classList.add("hidden"),nt(),bt(),zt(),Ft(),openModal("new-invoice-modal"),At(),Rt(),Ut(),Jt("INV").then(t=>{const e=document.getElementById("inv-number");e&&(e.value=t)}).catch(()=>{})};async function At(){const o=document.getElementById("inv-rep");if(o){if(ft){o.innerHTML='<option value="">بيع مباشر (بدون مندوب)</option>'+ft.map(t=>`<option value="${t.id}" data-name="${t.name}">${t.name}</option>`).join("");return}try{ft=await tt(O.salesReps(),[Y("name")]),o.innerHTML='<option value="">بيع مباشر (بدون مندوب)</option>'+ft.map(t=>`<option value="${t.id}" data-name="${t.name}">${t.name}</option>`).join("")}catch{}}}async function Rt(){const o=document.getElementById("inv-warehouse");if(!o)return;const t=()=>{o.innerHTML='<option value="">اختر المخزن</option>'+Z.map(e=>`<option value="${e.id}" data-name="${e.name}">${e.name}</option>`).join(""),!o.value&&Z.length>0&&(o.value=Z[0].id),nt()};if(o._whChangeListenerAttached||(o.addEventListener("change",()=>nt()),o._whChangeListenerAttached=!0),Z){t();return}try{Z=await tt(O.warehouses(),[Y("name")]),t()}catch{}}let jt=null;async function oe(){const o=document.getElementById("inv-cost-center");if(o)try{jt||(jt=(await tt(O.costCenters()).catch(()=>[])).sort((e,n)=>(e.code||"").localeCompare(n.code||""))),o.innerHTML='<option value="">بدون مركز تكلفة</option>'+jt.map(t=>`<option value="${t.id}" data-name="${t.name}">${t.code||""} — ${t.name}</option>`).join("")}catch(t){console.warn("Failed to load cost centers dropdown:",t)}}window.autoSelectCostCenter=()=>{const o=document.getElementById("inv-cost-center");if(!o)return;const t=document.getElementById("inv-warehouse")?.value,e=document.getElementById("inv-rep")?.value;if(t&&Z){const n=Z.find(a=>a.id===t);if(n&&(n.costCenterId||n.costCenter)){o.value=n.costCenterId||n.costCenter;return}}if(e&&ft){const n=ft.find(a=>a.id===e);if(n&&n.assignedWarehouseId&&Z){const a=Z.find(s=>s.id===n.assignedWarehouseId);a&&(a.costCenterId||a.costCenter)&&(o.value=a.costCenterId||a.costCenter)}}};function zt(){const o=document.getElementById("customer-search"),t=document.getElementById("customer-results");o&&(o.addEventListener("input",Gt(async()=>{const e=o.value.trim().toLowerCase();if(!e){t.classList.add("hidden");return}try{(!dt||dt.length===0)&&(dt=await tt(O.customers(),[Y("name")]));const n=dt.filter(a=>(a.name||"").toLowerCase().includes(e)||(a.phone||"").includes(e)).slice(0,15);if(n.length===0){t.classList.add("hidden");return}t.innerHTML=n.map(a=>`
        <div class="autocomplete-item" onclick="selectCustomer('${a.id}','${a.name.replace(/'/g,"\\'")}',${a.creditLimit||0},${a.balance||0})">
          <div>${a.name}</div>
          <div class="item-code">${a.phone||""} | حد: ${$(a.creditLimit||0)}</div>
        </div>`).join(""),t.classList.remove("hidden")}catch(n){console.warn("setupCustomerAutocomplete error:",n)}},100)),document.addEventListener("click",e=>{o.contains(e.target)||t.classList.add("hidden")}))}window.selectCustomer=(o,t,e,n)=>{A={id:o,name:t,creditLimit:e,balance:n},document.getElementById("customer-search").value=t,document.getElementById("customer-id").value=o,document.getElementById("customer-results").classList.add("hidden");const a=document.getElementById("donation-badge");if(o==="005"||t.includes("سلة البركة"))a&&(a.textContent="🎁 عميل تبرعات (معفى من الضريبة وتكلفتها مصروف تبرعات)",a.classList.remove("hidden")),document.getElementById("credit-status-bar")?.classList.add("hidden");else if(a&&a.classList.add("hidden"),e>0){const i=Math.min(n/e*100,100),v=document.getElementById("credit-status-bar"),r=document.getElementById("credit-fill"),u=document.getElementById("credit-numbers"),b=document.getElementById("credit-label");v.classList.remove("hidden"),r.style.width=i+"%",u.textContent=`${$(n)} / ${$(e)}`,i>=100?(r.className="fill bad",b.textContent="⚠️ تجاوز حد الائتمان"):i>=80?(r.className="fill warn",b.textContent="⚠️ قارب حد الائتمان"):(r.className="fill good",b.textContent="الرصيد المستخدم")}else document.getElementById("credit-status-bar")?.classList.add("hidden")};function Ft(){const o=document.getElementById("product-search-input"),t=document.getElementById("product-search-results"),e=document.getElementById("inv-product-category-filter");if(!o)return;const n=()=>{const a=o.value.trim().toLowerCase(),s=e?e.value:"";if(!a&&!s){t.classList.add("hidden");return}let i=it;if(s&&(i=i.filter(l=>l.category===s)),a&&(i=i.filter(l=>(l.name||"").toLowerCase().includes(a)||(l.sku||"").toLowerCase().includes(a)||(l.barcode||"").includes(a))),i=i.slice(0,15),!i.length){t.innerHTML='<div style="padding:10px;text-align:center;color:var(--text-2);font-size:12px;">لا توجد نتائج</div>',t.classList.remove("hidden");return}const v=document.getElementById("inv-warehouse")?.value,r=`companies/${D}/stockByWarehouse`,u=window.ERP_CACHE[r];let b=[];u&&(Array.isArray(u.data)?b=u.data:Array.isArray(u)&&(b=u)),t.innerHTML=i.map(l=>{const x=v?b.find(N=>N.productId===l.id&&N.warehouseId===v)?.qty||0:b.filter(N=>N.productId===l.id).reduce((N,H)=>N+(H.qty||0),0),I=x>0?"badge good":"badge bad",T=(l.name||"").replace(/'/g,"’"),k=(l.unit||"PCS").replace(/'/g,"’"),V=l.taxCategory||"S",B=l.salePrice||0,d=l.averageCost||l.costPrice||l.purchasePrice||0,p=(l.altUnit||"").replace(/'/g,"&#39;"),w=parseFloat(l.unitFactor)||1;return`
        <div class="autocomplete-item" onclick="addProductLine('${l.id}','${T}',${B},'${k}','${V}',${d},'${p}',${w})">
          <div class="flex justify-between">
            <span>${l.name}</span>
            <div>
              <span class="mono text-indigo" style="margin-left:12px;">${$(l.salePrice)}</span>
              <span class="${I}" style="font-size:10px;">المتاح: ${x}</span>
            </div>
          </div>
          <div class="item-code">${l.sku||""} | ${ot(l.unit)||""}
            ${l.altUnit&&l.unitFactor>1?`<span style="color:#d97706;font-weight:700;"> ð¦ ${l.unitFactor} ${ot(l.unit)} = 1 ${ot(l.altUnit)}</span>`:""}
          </div>
        </div>`}).join(""),t.classList.remove("hidden")};o.addEventListener("input",Gt(n,200)),o.addEventListener("focus",n),e&&e.addEventListener("change",n),document.addEventListener("click",a=>{!o.contains(a.target)&&!t.contains(a.target)&&(!e||!e.contains(a.target))&&t.classList.add("hidden")})}async function Ut(){try{const o=`companies/${D}/stockByWarehouse`,[t,e,n]=await Promise.all([it.length===0?tt(O.products(),[Y("name")]):Promise.resolve(it),Tt.length===0?tt(O.categories(),[Y("name")]):Promise.resolve(Tt),tt(O.stockByWarehouse())]);it=t,Tt=e,window.ERP_CACHE[o]=n||[];const a=document.getElementById("inv-product-category-filter");a&&(a.innerHTML='<option value="">كل الفئات</option>'+Tt.map(s=>`<option value="${s.id}">${s.name}</option>`).join(""))}catch(o){console.error("loadProductsAndCategories error:",o)}}window.addProductLine=(o,t,e,n,a,s=0,i="",v=1)=>{document.getElementById("product-search-input").value="",document.getElementById("product-search-results").classList.add("hidden");const r=parseFloat(v)||1,u=!!(i&&r>1),b=parseFloat(e)||0,l=u?b:r>1?parseFloat((b/r).toFixed(4)):b;E.push({productId:o,productName:t,unit:n,altUnit:i||"",unitFactor:r,selectedUnit:u?i:n,basePricePerUnit:b,unitCode:{Carton:"CTN",كرتون:"CTN",Piece:"PCE",حبة:"PCE",Box:"BOX",صندوق:"BOX",Bag:"BAG",كيس:"BAG",Bale:"BL",بالة:"BL",Barrel:"BLL",برميل:"BLL",Pack:"PK","شد / ربطة":"PK",Sack:"SA",شوال:"SA",Tray:"TY",طبق:"TY",Gallon:"GLI",جالون:"GLI",Kilogram:"KGM",كجم:"KGM",Ton:"TNE",طن:"TNE",Liter:"LTR",لتر:"LTR"}[n]||"PCE",taxCategory:a||"S",qty:1,unitPrice:l,discount:0,costPrice:s||0,batchNumber:"",expiryDate:"",availableBatches:[]});const x=E.length-1;nt(),bt(),window.resolveLineBatches(x)};function nt(){const o=document.getElementById("invoice-lines-tbody");if(!o)return;if(E.length===0){o.innerHTML='<tr><td colspan="11" style="text-align:center;padding:16px;color:var(--text-2);font-size:12px;">لم يتم إضافة أصناف بعد</td></tr>';return}const t=document.getElementById("inv-warehouse")?.value,e=`companies/${D}/stockByWarehouse`,n=window.ERP_CACHE[e];let a=[];n&&(Array.isArray(n.data)?a=n.data:Array.isArray(n)&&(a=n)),o.innerHTML=E.map((s,i)=>{const v=Zt(s.qty,s.unitPrice,s.discount),r=s.taxCategory==="S"?v*.15:0;let u=0;if(t){const x=a.find(I=>I.productId===s.productId&&I.warehouseId===t);u=x&&x.qty||0}else u=a.filter(x=>x.productId===s.productId).reduce((x,I)=>x+(I.qty||0),0);const l=(parseFloat(s.qty)||0)*(s.altUnit&&s.unitFactor>1&&s.selectedUnit===s.altUnit&&parseFloat(s.unitFactor)||1)>u;return`<tr style="border-bottom:1px solid var(--border-soft);">
      <td style="padding:6px 10px;color:var(--text-2);width:30px;">${i+1}</td>
      <td style="padding:6px 10px;"><span style="font-family:var(--font-heading);font-size:12.5px;">${s.productName}</span></td>
      <td style="padding:6px 6px;min-width:90px;">
        ${s.altUnit&&s.unitFactor>1?`<select class="input" style="height:30px;font-size:11px;padding:2px 4px;color:var(--brand);font-weight:700;"
               onchange="updateSalesLineUnit(${i},this.value)">
               <option value="${s.altUnit}" ${s.selectedUnit===s.altUnit?"selected":""}>${ot(s.altUnit)}</option>
               <option value="${s.unit}" ${s.selectedUnit===s.unit?"selected":""}>${ot(s.unit)}</option>
             </select>
             <div style="font-size:9.5px;color:#64748b;margin-top:2px;text-align:center">
               ${s.selectedUnit===s.altUnit?`1 ${ot(s.altUnit)} = ${s.unitFactor} ${ot(s.unit)}`:ot(s.unit)}
             </div>`:`<span style="font-size:11px;color:var(--text-2)">${ot(s.unit||"Piece")}</span>`}
      </td>
      <td style="padding:6px 10px;width:80px;">
        <input type="number" class="input mono" style="width:70px;height:30px;font-size:12px;${l?"border-color:var(--bad);background-color:rgba(239,68,68,0.05);":""}"
          value="${s.qty}" min="0.001" step="0.001"
          onchange="updateLine(${i},'qty',this.value)" />
        <div style="font-size:9.5px;margin-top:2px;white-space:nowrap;color:${l?"var(--bad)":"var(--text-dim)"};font-weight:${l?"700":"normal"};">
          ${s.altUnit&&s.unitFactor>1?`متاح: ${Math.floor(u/s.unitFactor)} ${ot(s.altUnit)} + ${u%s.unitFactor} ${ot(s.unit)}`:`المتاح: ${u}`}
        </div>
        ${s.altUnit&&s.unitFactor>1&&s.selectedUnit===s.altUnit?`<div style="font-size:9.5px;color:#059669;margin-top:2px;text-align:center;font-weight:700;">
               = ${(parseFloat(s.qty)||0)*s.unitFactor} ${ot(s.unit)}
             </div>`:""}
      </td>
      <td style="padding:6px 10px;width:110px;">
        <input type="number" class="input mono" style="width:100px;height:30px;font-size:12px;"
          value="${s.unitPrice}" min="0" step="0.01"
          onchange="updateLine(${i},'unitPrice',this.value)" />
      </td>
      <td style="padding:6px 10px;width:70px;">
        <input type="number" class="input mono" style="width:60px;height:30px;font-size:12px;"
          value="${s.discount}" min="0" max="100" step="0.1"
          onchange="updateLine(${i},'discount',this.value)" />
      </td>
      <td style="padding:6px 10px;width:120px;">
        <select class="input mono" style="width:110px;height:30px;font-size:11px;padding:2px 6px;"
          onchange="window.selectLineBatch(${i}, this.value)">
          <option value="">-- افتراضي --</option>
          ${(s.availableBatches||[]).map(x=>`
            <option value="${x.number}" ${s.batchNumber===x.number?"selected":""}>
              ${x.number} (${x.qty})
            </option>
          `).join("")}
        </select>
      </td>
      <td style="padding:6px 10px;width:110px;">
        <input type="text" class="input mono" style="width:100px;height:30px;font-size:11px;"
          value="${s.expiryDate||""}" disabled placeholder="—" />
      </td>
      <td style="padding:6px 10px;font-size:11px;">
        ${s.taxCategory==="S"?`<span class="badge warn" style="font-size:11px; font-weight:700;">${$(r)}</span>`:'<span class="badge good" style="font-size:10px;">0%</span>'}
      </td>
      <td style="padding:6px 10px;" class="mono font-bold">${$(v)}</td>
      <td style="padding:6px 10px;">
        <button class="btn btn-icon sm btn-ghost" onclick="removeLine(${i})" style="color:var(--bad);">✕</button>
      </td>
    </tr>`}).join("")}window.resolveLineBatches=async o=>{const t=E[o];if(!t||!t.productId)return;const e=document.getElementById("inv-warehouse")?.value||"";try{const n=X(O.stockTransactions(),M("productId","==",t.productId)),s=(await rt(n)).docs.map(r=>r.data()),i={};s.forEach(r=>{e&&r.warehouseId!==e||r.batchNumber&&(i[r.batchNumber]||(i[r.batchNumber]={qty:0,expiryDate:r.expiryDate||""}),i[r.batchNumber].qty+=r.qtyChange||0)});const v=Object.keys(i).map(r=>({number:r,...i[r]})).filter(r=>r.qty>.001).sort((r,u)=>r.expiryDate?u.expiryDate?new Date(r.expiryDate)-new Date(u.expiryDate):-1:1);t.availableBatches=v,v.length>0?t.batchNumber||(t.batchNumber=v[0].number,t.expiryDate=v[0].expiryDate):(t.batchNumber="",t.expiryDate="")}catch(n){console.error("resolveLineBatches error:",n)}nt()};window.resolveAllLineBatches=()=>{E.forEach((o,t)=>{window.resolveLineBatches(t)})};window.selectLineBatch=(o,t)=>{const e=E[o];if(!e)return;e.batchNumber=t;const n=(e.availableBatches||[]).find(a=>a.number===t);e.expiryDate=n?n.expiryDate:"",nt()};window.updateLine=(o,t,e)=>{E[o][t]=parseFloat(e)||0,nt(),bt()};window.updateSalesLineUnit=(o,t)=>{const e=E[o];if(!e)return;e.selectedUnit,e.selectedUnit=t;const n=parseFloat(e.unitFactor)||1,a=parseFloat(e.basePricePerUnit)||0;n>1&&a>0&&(t===e.altUnit?e.unitPrice=a:e.unitPrice=parseFloat((a/n).toFixed(4))),nt(),bt()};window.removeLine=o=>{E.splice(o,1),nt(),bt()};async function bt(){const o=await ee(),t=document.getElementById("inv-payment")?.value||"credit",e=document.getElementById("inv-paid-amount");t==="credit"&&window.event&&window.event.type==="change"?e&&(e.value="0"):t==="cash"&&window.event&&window.event.type==="change"&&e&&(e.value="");const n=Kt(E);let a=0;o.enableCashDiscount&&(t==="cash"||t==="transfer")&&(a+=o.cashDiscountRate||0);const s=E.reduce((p,w)=>p+(w.qty||0),0);o.enableVolumeDiscount&&s>=(o.volumeDiscountThreshold||50)&&(a+=o.volumeDiscountRate||0);let i=0;a>0&&(i=Math.round(n.subtotal*(a/100)*100)/100);const v=A?.id==="005"||(A?.name||"").includes("سلة البركة");v&&E.forEach(p=>{p.taxCategory="E"});const r=v?0:Math.max(0,n.subtotal-i),u=v?0:Math.round(r*.15*100)/100,b=r+u,l=p=>`${$(p)}`;document.getElementById("total-subtotal").textContent=l(n.subtotal+n.discountTotal);const x=n.discountTotal+i;document.getElementById("total-discount").textContent=`- ${l(x)}`,document.getElementById("total-vat").textContent=l(u),document.getElementById("total-grand").textContent=l(b);const I=E.reduce((p,w)=>{const N=w.averageCost||w.costPrice||0;return p+N*(w.qty||0)},0),T=r,k=T-I,V=T>0?k/T*100:0,B=document.getElementById("total-profit"),d=document.getElementById("total-margin");B&&(B.textContent=l(k),k>0?B.className="mono font-bold text-good":B.className="mono font-bold text-bad"),d&&(d.textContent=`${V.toFixed(1)}%`,V>0?d.className="mono font-bold text-good":d.className="mono font-bold text-bad"),window._autoDiscountAmount=i,window._autoDiscountRate=a}async function ae(o){if(!o)return;const t=o.id,e=o.number||o.invoiceNumber||"",n=parseFloat(o.paidAmount)||0,a=parseFloat(o.totalWithVat)||parseFloat(o.total)||0;if((o.paymentMethod==="cash"||o.paymentMethod==="نقدي")&&n>0)try{await Yt({type:"out",amount:n,notes:`عكس/تعديل سداد الفاتورة ${e}`,sourceType:"salesInvoice_reverse",sourceId:t,date:o.date||ut(),cashBoxId:o.repId?`cashBox_${o.repId}`:null}),console.log(`[Cleanup] Reversed cash transaction of ${n} for invoice ${e}`)}catch(s){console.warn("[Cleanup] Cash reversal failed:",s.message)}if(["transfer","network","bank","cheque","check","تحويل","شبكة","شيك"].includes(o.paymentMethod)&&a>0)try{await Xt({type:"out",amount:a,notes:`عكس/تعديل سداد الفاتورة ${e}`,sourceType:"salesInvoice_reverse",sourceId:t,date:o.date||ut()}),console.log(`[Cleanup] Reversed bank transaction of ${a} for invoice ${e}`)}catch(s){console.warn("[Cleanup] Bank reversal failed:",s.message)}try{const s=[];t&&s.push(X(gt(z,`companies/${D}/receipts`),M("sourceInvoiceId","==",t))),e&&s.push(X(gt(z,`companies/${D}/receipts`),M("sourceInvoiceId","==",e)));for(const i of s){const v=await rt(i);for(const r of v.docs){const u=r.id;for(const b of["pos","receipt","salesInvoice","customerPayment"])try{const l=await rt(X(gt(z,`companies/${D}/journalEntries`),M("sourceType","==",b),M("sourceId","==",u)));for(const x of l.docs)await xt(x.id),console.log(`[Cleanup] Deleted JE ${x.id} (${b}) for receipt ${u}`)}catch(l){console.warn(`[Cleanup] JE delete (${b}) for receipt ${u}:`,l.message)}await te("receipts",u),console.log(`[Cleanup] Deleted receipt voucher ${u} linked to invoice ${e}`)}}}catch(s){console.warn("[Cleanup] Receipts cleanup failed:",s.message)}}window.saveInvoice=async(o="pending")=>{const t=document.getElementById("inv-form-error");t.classList.add("hidden");const e=document.getElementById("customer-id").value,n=document.getElementById("customer-search").value.trim(),a=document.getElementById("inv-rep"),s=a.value||"",i=s?a.options[a.selectedIndex]?.dataset.name||"":"بدون مندوب",v=document.getElementById("inv-warehouse"),r=v.value,u=v.options[v.selectedIndex]?.dataset.name||"",b=document.getElementById("inv-cost-center"),l=b?.value||null,x=b&&l&&b.options[b.selectedIndex]?b.options[b.selectedIndex].dataset.name||b.options[b.selectedIndex].text:null;document.getElementById("inv-date").value;const I=document.getElementById("inv-payment").value;let T=parseFloat(document.getElementById("inv-paid-amount").value)||0;(I==="credit"||I==="deferred"||I==="آجل")&&(T=0);const k=document.getElementById("inv-notes").value.trim(),V=document.getElementById("inv-type").value;if(!e&&V==="standard"){t.textContent="يرجى اختيار العميل",t.classList.remove("hidden");return}if(!r){t.textContent="يرجى اختيار المخزن",t.classList.remove("hidden");return}if(E.length===0){t.textContent="يرجى إضافة صنف واحد على الأقل",t.classList.remove("hidden");return}if(window._isSavingInvoice)return;window._isSavingInvoice=!0;const B=document.getElementById("save-inv-btn");B&&(B.disabled=!0,B.textContent="جارٍ التحقق…");const d=await ee(),p=A?.id==="005"||(A?.name||"").includes("سلة البركة");p&&E.forEach(_=>{_.taxCategory="E"});const w=Kt(E),N=window._autoDiscountAmount||0,H=p?0:Math.max(0,w.subtotal-N),m=w.discountTotal+N,f=p?0:Math.round(H*.15*100)/100,g=H+f,P=Math.max(0,g-T);let et=!1;E.forEach(_=>{_.discount>(d.maxRepDiscount??3)&&(et=!0)});const Q=()=>{window._isSavingInvoice=!1,B&&(B.disabled=!1,B.textContent="💾 حفظ وإصدار")};if(et&&prompt(`⚠️ لقد تجاوزت الحد الأقصى المسموح لخصم المندوب (${d.maxRepDiscount??3}%).
يرجى إدخال رمز أمان المشرف (Supervisor PIN) للمتابعة:`)!==(d.supervisorPIN||"1234")){alert("❌ رمز الأمان غير صحيح. تم رفض الحفظ."),Q();return}const G=d.creditBlockPolicy||"block_with_pin";if(G!=="allow_all"&&A?.creditLimit>0&&I==="credit"){const _=(A.balance||0)+g;if(_>A.creditLimit){if(G==="warn"){if(!confirm(`⚠️ تجاوز حد ائتمان العميل: ${$(_)} > ${$(A.creditLimit)}
هل تريد المتابعة وتجاوز الحد؟`)){Q();return}}else if(G==="block_with_pin"&&prompt(`⚠️ تجاوز حد ائتمان العميل: ${$(_)} > ${$(A.creditLimit)}
يتطلب هذا الإجراء صلاحية المدير.
يرجى إدخال رمز تجاوز المدير (Supervisor PIN):`)!==(d.supervisorPIN||"1234")){alert("❌ رمز تجاوز غير صحيح! تم رفض المعاملة."),Q();return}}}if(G!=="allow_all"&&A?.creditDays>0&&I==="credit")try{const{getDocs:_,query:F,collection:st,where:L}=await at(async()=>{const{getDocs:It,query:mt,collection:q,where:S}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDocs:It,query:mt,collection:q,where:S}},[]),ct=st(z,`companies/${D}/salesInvoices`),lt=F(ct,L("customerId","==",e),L("status","in",["pending","posted","partial"]),L("payment","==","credit")),U=await _(lt),Ct=new Date;let kt=!1,wt=0;if(U.forEach(It=>{const mt=It.data();if((mt.remainingAmount||0)>0&&mt.date){const q=new Date(mt.date),S=Ct-q;Math.floor(S/(1e3*60*60*24))>A.creditDays&&(kt=!0,wt+=mt.remainingAmount||0)}}),kt){if(G==="warn"){if(!confirm(`⚠️ العميل لديه فواتير متأخرة عن مهلة السداد (${A.creditDays} يوم) بقيمة إجمالية ${$(wt)}!
هل تريد تجاوز التنبيه والمتابعة؟`)){Q();return}}else if(G==="block_with_pin"&&prompt(`⚠️ العميل لديه فواتير متأخرة عن مهلة السداد (${A.creditDays} يوم) بقيمة إجمالية ${$(wt)}!
يتطلب هذا الإجراء صلاحية المدير لتجاوز الحظر الائتماني.
يرجى إدخال رمز تجاوز المدير (Supervisor PIN):`)!==(d.supervisorPIN||"1234")){alert("❌ رمز تجاوز غير صحيح! تم رفض المعاملة."),Q();return}}}catch(_){console.warn("Failed to check overdue customer invoices:",_)}B&&(B.disabled=!0,B.textContent="جارٍ الحفظ…");try{const _=document.getElementById("inv-date")?.value||ut();if(await se(_)){Qt(`⚠️ لا يمكن حفظ الفاتورة لأن تاريخها (${_}) يقع في فترة محاسبية مغلقة ومقفلة نهائياً.`),B.disabled=!1,B.textContent="💾 حفظ وإصدار";return}let F=null,st={};if(window._editingInvoiceId)try{F=await Dt("salesInvoices",window._editingInvoiceId),F&&F.lines&&F.warehouseId===r&&F.lines.forEach(c=>{c.productId&&(st[c.productId]=(st[c.productId]||0)+(c.qty||0))})}catch(c){console.warn("Failed to load old invoice for stock validation:",c)}const L=E.map(async c=>{if(!c.productId||!c.qty)return null;try{const y=`${r}_${c.productId}`,K=await vt(pt(z,`companies/${D}/stockByWarehouse`,y));let C=K.exists()&&K.data().qty||0;if(st[c.productId]&&(C+=st[c.productId]),C<c.qty)return`⚠️ الكمية المطلوبة من الصنف "${c.productName||c.productId}" (${c.qty}) تتجاوز المتوفر في هذا المخزن (${C})`}catch(y){console.warn(`Stock check failed for product ${c.productId}:`,y)}return null}),lt=(await Promise.all(L)).find(c=>c!==null);if(lt){Qt(lt),B.disabled=!1,B.textContent="💾 حفظ وإصدار";return}const U=document.getElementById("inv-number").value,Ct=ie(new Date),kt=de(),wt=(()=>{try{return JSON.parse(localStorage.getItem("idham_company")||"{}")}catch{return{}}})(),It=ge({sellerName:wt.name||window.ERP_COMPANY?.name||"مؤسسة إدهام للمواد الغذائية",vatNumber:wt.vatNumber||window.ERP_COMPANY?.vatNumber||"",timestamp:Ct,totalWithVat:g,vatAmount:f}),mt=o==="draft"?"draft":P>0?"posted":"paid",q={number:U,uuid:kt,date:_,invoiceType:V,customerId:e||null,customerName:n||"عميل نقدي",repId:s,repName:i,warehouseId:r,warehouseName:u,costCenterId:l||null,costCenterName:x||null,lines:E,subtotal:H,discountTotal:m,totalVat:f,vatAmount:f,total:g,totalWithVat:g,paymentMethod:I,paidAmount:T,remainingAmount:P,notes:k,status:mt,zatcaStatus:"pending",qrBase64:It,createdBy:window._salesUser?.uid||"system",autoDiscountAmount:N,autoDiscountRate:window._autoDiscountRate||0,stockStatus:"pending_deduction"};let S=window._editingInvoiceId;if(S){const c=await Dt("salesInvoices",S);if(c){const C={};c.lines&&c.lines.forEach(h=>{const J=`${h.productId}_${h.batchNumber||""}`;C[J]={productId:h.productId,qty:h.qty,warehouseId:c.warehouseId,batchNumber:h.batchNumber||"",expiryDate:h.expiryDate||""}});const j={};E.forEach(h=>{const J=`${h.productId}_${h.batchNumber||""}`;j[J]={productId:h.productId,qty:h.qty,warehouseId:r,batchNumber:h.batchNumber||"",expiryDate:h.expiryDate||""}});const W=[];for(const[h,J]of Object.entries(C)){const ht=j[h];(!ht||ht.qty!==J.qty||ht.warehouseId!==J.warehouseId)&&W.push({warehouseId:J.warehouseId,productId:J.productId,qtyDelta:J.qty,metadata:{type:"sale_reverse_edit",refId:c.number,documentNumber:c.number,invoiceNumber:c.number,batchNumber:J.batchNumber||"",expiryDate:J.expiryDate||"",notes:`تعديل الفاتورة ${c.number} (عكس الكمية القديمة)`}})}if(E.forEach(h=>{if(!h.productId||!h.qty||String(h.productId).startsWith("adhoc_")||h.isCustom)return;const J=`${h.productId}_${h.batchNumber||""}`,ht=C[J];(!ht||ht.qty!==h.qty||ht.warehouseId!==r)&&W.push({warehouseId:r,productId:h.productId,qtyDelta:-((parseFloat(h.qty)||0)*(h.altUnit&&h.unitFactor>1&&h.selectedUnit===h.altUnit&&parseFloat(h.unitFactor)||1)),metadata:{type:"sale_out",sourceType:"salesInvoice",sourceId:S,documentNumber:q.number,invoiceNumber:q.number,date:q.date||new Date().toISOString().split("T")[0],productName:h.productName||h.name||"",userId:window._salesUser?.uid,createdByName:window._salesUser?.displayName||window._salesUser?.email||"النظام",batchNumber:h.batchNumber||"",expiryDate:h.expiryDate||"",notes:`فاتورة بيع ${q.number}`}})}),W.length>0)try{await Lt(W),q.stockStatus="completed"}catch(h){console.error("[adjustStockBulk] ❌ Edit adjust stock failed:",h.message),q.stockStatus="pending_deduction",q.stockError=h.message,h.message.includes("رصيد")&&window.showToast?.("⚠️ رصيد غير كافٍ لبعض الأصناف","warn")}else q.stockStatus="completed"}c&&await ae(c);const y=c?.invoiceNumber||c?.number||S,K=["salesInvoice","sales","salesCOGS","salesInvoice_cogs","salesReturnCOGS","posCOGS"];for(const C of K)try{const j=await rt(X(gt(z,`companies/${D}/journalEntries`),M("sourceType","==",C),M("sourceId","==",y)));for(const W of j.docs)await xt(W.id),console.log(`[saveInvoice-edit] Deleted old JE ${W.id} (${C}) for ${y}`);if(y!==S){const W=await rt(X(gt(z,`companies/${D}/journalEntries`),M("sourceType","==",C),M("sourceId","==",S)));for(const h of W.docs)await xt(h.id),console.log(`[saveInvoice-edit] Deleted old JE ${h.id} (${C}) for raw id ${S}`)}}catch(j){console.warn(`[saveInvoice-edit] JE cleanup (${C}) skipped:`,j.message)}if(c?.journalEntryId)try{await xt(c.journalEntryId)}catch{}await yt("salesInvoices",S,q)}else{S=await re(O.salesInvoices(),q);const c=E.filter(y=>y.productId&&!String(y.productId).startsWith("adhoc_")&&!y.isCustom).map(y=>({warehouseId:r,productId:y.productId,qtyDelta:-((parseFloat(y.qty)||0)*(y.altUnit&&y.unitFactor>1&&y.selectedUnit===y.altUnit&&parseFloat(y.unitFactor)||1)),metadata:{type:"sale_out",sourceType:"salesInvoice",sourceId:S,documentNumber:q.number,invoiceNumber:q.number,date:q.date||new Date().toISOString().split("T")[0],productName:y.productName||y.name||"",userId:window._salesUser?.uid,createdByName:window._salesUser?.displayName||window._salesUser?.email||"النظام",batchNumber:y.batchNumber||"",expiryDate:y.expiryDate||"",notes:`فاتورة بيع ${q.number}`}}));if(c.length>0)try{await Lt(c),await yt("salesInvoices",S,{stockStatus:"completed"})}catch(y){console.error("[adjustStockBulk] ❌ Create adjust stock failed:",y.message),await yt("salesInvoices",S,{stockStatus:"pending_deduction",stockError:y.message||"Bulk adjustment failed"}),y.message.includes("رصيد")&&window.showToast?.("⚠️ رصيد غير كافٍ لبعض الأصناف","warn")}else await yt("salesInvoices",S,{stockStatus:"completed"})}let $t=E.reduce((c,y)=>{const K=y.averageCost||y.costPrice||y.purchasePrice||0,C=(y.qty||0)*(y.altUnit&&y.unitFactor>1&&y.selectedUnit===y.altUnit&&parseFloat(y.unitFactor)||1);return c+K*C},0);if($t<.01&&E.length>0)try{const c=E.map(async C=>{if(!C.productId)return 0;try{const j=await vt(pt(z,`companies/${D}/products`,C.productId));if(j.exists()){const W=j.data(),h=W.averageCost||W.costPrice||W.purchasePrice||0;C.averageCost=h,C.costPrice=h;const J=(C.qty||0)*(C.altUnit&&C.unitFactor>1&&C.selectedUnit===C.altUnit&&parseFloat(C.unitFactor)||1);return h*J}}catch(j){console.warn(`[COGS] Failed to fetch cost for product ${C.productId}:`,j.message)}return 0}),K=(await Promise.all(c)).reduce((C,j)=>C+j,0);K>.01&&($t=K,console.log(`[COGS] Fetched from Firestore in parallel: ${$t}`))}catch(c){console.warn("[COGS] Failed to fetch product costs:",c.message)}try{const c=await tt(O.warehouses());if(window._editingInvoiceId)try{const{deleteJournalEntry:K}=await at(async()=>{const{deleteJournalEntry:j}=await import("./index-T8P1GM2w.js").then(W=>W.T);return{deleteJournalEntry:j}},__vite__mapDeps([0,1])),C=await rt(X(gt(z,`companies/${D}/journalEntries`),M("sourceId","in",[S,U])));for(const j of C.docs)await K(j.id),console.log(`[Edit] Deleted old JE ${j.id} for invoice ${U}`)}catch(K){console.warn("[Edit] Failed to cleanup old JEs:",K.message)}const y=await ce({id:S,invoiceNumber:U,date:_,customerName:n||"عميل نقدي",customerType:A?.type||"retail",paymentMethod:I,subtotal:H,taxAmount:f,total:g,paidAmount:T,remainingAmount:P,totalCost:$t,warehouseId:r,warehouseName:u,costCenterId:l,sourceType:"salesInvoice",customerId:e},window._salesUser||{},c);await yt("salesInvoices",S,{journalEntryId:y,totalCost:Math.round($t*100)/100})}catch(c){console.error("[AccountingEngine] Sales JE failed:",c.message);try{await yt("salesInvoices",S,{journalEntryError:c.message,journalEntryId:null})}catch{}window.showToast?.("⚠️ تم حفظ الفاتورة لكن القيد المحاسبي فشل — "+c.message,"warn")}if(I==="cash"||I==="نقدي")try{await Yt({type:"in",amount:T,notes:`مبيعات نقدية — فاتورة ${U} — ${n||"عميل"}`,sourceType:"salesInvoice",sourceId:S,date:_})}catch(c){console.warn("[autoCashTransaction] Cash box update failed:",c.message)}if(["transfer","network","bank","cheque","check","تحويل","شبكة","شيك"].includes(I))try{await Xt({type:"in",amount:g,notes:`مبيعات — فاتورة ${U} — ${n||"عميل"}`,sourceType:"salesInvoice",sourceId:S,date:_})}catch(c){console.warn("[autoBankTransaction] Bank update failed:",c.message)}if(e&&P>0)try{const c=pt(z,`companies/${D}/customers`,e);await pe(c,{balance:me(P),updatedAt:ue()}),console.log(`[CustomerBalance] Client-side incremented customer ${e} balance by +${P}`)}catch(c){console.warn("Failed to update customer balance on client:",c.message)}const ne=window._editingInvoiceId?`تم تحديث الفاتورة ${U} بنجاح`:`تم إنشاء الفاتورة ${U} بنجاح`;window._editingInvoiceId=null,R(ne,"success");const qt=document.getElementById("inv-file-upload");if(qt&&qt.files.length>0){const c=qt.files[0];window.uploadFileToArchive(c,"sales_invoices",S,`مرفق فاتورة مبيعات رقم ${U}`).catch(y=>console.warn(y))}closeModal("new-invoice-modal"),await loadInvoicesList(),e&&at(()=>import("./balance-sync-D_Qo7lf4.js"),__vite__mapDeps([2,0,1])).then(c=>c.recalculateCustomerBalance(e)).catch(c=>console.warn(c))}catch(_){t.textContent=_.message,t.classList.remove("hidden"),console.error(_)}finally{window._isSavingInvoice=!1,B.disabled=!1,B.textContent="💾 حفظ وإصدار"}};window.viewInvoice=async o=>{const t=document.getElementById("view-inv-body"),e=document.getElementById("view-inv-title");openModal("view-invoice-modal"),_t=null;const n=a=>{_t=a;const s=a.number||a.invoiceNumber||o;e.textContent=`فاتورة: ${s}`;const i=(a.lines||[]).map((k,V)=>{const B=k.productName||k.name||"",d=k.qty||0,p=k.unitPrice!==void 0?k.unitPrice:k.price||0,w=k.discount||0,N=Zt(d,p,w);return`<tr>
        <td style="padding:7px 12px;">${V+1}</td>
        <td style="padding:7px 12px;">${B}</td>
        <td style="padding:7px 12px;" class="mono">${d}</td>
        <td style="padding:7px 12px;" class="mono">${$(p)}</td>
        <td style="padding:7px 12px;" class="mono">${w}%</td>
        <td style="padding:7px 12px;" class="mono font-bold">${$(N)}</td>
      </tr>`}).join(""),v=a.subtotal||0,r=a.totalVat||a.vatAmount||0,u=a.totalWithVat||a.total||0,b=a.paidAmount!==void 0?a.paidAmount:a.paymentMethod==="cash"||a.status==="paid"?u:0,l=a.remainingAmount!==void 0?a.remainingAmount:a.status!=="paid"&&a.paymentMethod!=="cash"?Math.max(0,u-b):0,x=a.warehouseName||Z&&Z.find(k=>k.id===a.warehouseId)?.name||"—";t.innerHTML=`
      <div style="display:grid;grid-template-columns:1fr 160px;gap:20px;margin-bottom:20px;">
        <div>
          <div class="grid-3 gap-12 mb-12">
            <div><div class="section-label mb-8">رقم الفاتورة</div><div class="mono text-indigo font-bold">${s}</div></div>
            <div><div class="section-label mb-8">التاريخ</div><div>${Ht(a.date)}</div></div>
            <div><div class="section-label mb-8">الحالة</div>${Wt(a.status)}</div>
            <div><div class="section-label mb-8">العميل</div><div class="font-semibold">${dt&&dt.find(k=>k.id===a.customerId)?.name||a.customerName}</div></div>
            <div><div class="section-label mb-8">المندوب</div><div>${a.repName||"—"}</div></div>
            <div><div class="section-label mb-8">المخزن</div><div>${x}</div></div>
            <div><div class="section-label mb-8">مركز التكلفة</div><div class="font-semibold text-warn">${a.costCenterName||"—"}</div></div>
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
          <tbody>${i}</tbody>
        </table>
      </div>

      <div style="display:flex;justify-content:flex-end;">
        <div class="invoice-totals" style="width:260px;">
          <div class="invoice-total-row"><span>المجموع قبل الضريبة</span><span class="mono">${$(v)}</span></div>
          <div class="invoice-total-row"><span>ضريبة القيمة المضافة</span><span class="mono text-warn">${$(r)}</span></div>
          <div class="invoice-total-row grand-total"><span>الإجمالي النهائي</span><span class="mono">${$(u)}</span></div>
          <div class="invoice-total-row"><span>المدفوع</span><span class="mono text-good">${$(b)}</span></div>
          <div class="invoice-total-row"><span>المتبقي</span><span class="mono text-bad">${$(l)}</span></div>
        </div>
      </div>`;const I=a.qrBase64||a.qrCodeData||a.zatcaQr||a.qr;I&&setTimeout(()=>be("inv-qr-container",I),50);const T=document.getElementById("view-inv-footer");T&&(T.innerHTML=`
        <button class="btn btn-ghost" onclick="closeModal('view-invoice-modal')">إغلاق</button>
        ${a.status!=="paid"&&a.status!=="cancelled"?`<button class="btn" style="background:#16a34a;color:#fff;" onclick="markSalesAsPaidManually('${a.id}')">💵 تعيين كمدفوعة (مسددة بسند)</button>`:""}
        <button class="btn btn-secondary" onclick="printInvoice()">🖨️ طباعة</button>
        <button class="btn btn-lime" onclick="sendToZATCA()" id="zatca-send-btn">⚡ إرسال ZATCA</button>
      `)};if(Nt.has(o)){n(Nt.get(o));return}t.innerHTML='<div class="page-loading" style="min-height:150px;"><div class="loading-spinner"></div></div>';try{const a=pt(z,`companies/${D}/salesInvoices`,o),s=await vt(a);if(!s.exists())throw new Error("الفاتورة غير موجودة");const i={id:s.id,...s.data()};Nt.set(o,i),n(i)}catch(a){t.innerHTML=`<div class="alert bad">${a.message}</div>`}};window.markSalesAsPaidManually=async o=>{if(await showConfirm("هل تريد تعيين الفاتورة كمدفوعة يدوياً؟ (سيتم تغيير الحالة فقط دون إنشاء قيد سداد مكرر)","تأكيد التغيير"))try{const{update:t}=await at(async()=>{const{update:a}=await import("./index-T8P1GM2w.js").then(s=>s.T);return{update:a}},__vite__mapDeps([0,1]));await t("salesInvoices",o,{status:"paid",remainingAmount:0,manuallyPaid:!0,updatedAt:new Date().toISOString()}),Nt.delete(o);const{clearERPCache:e,COMPANY_ID:n}=await at(async()=>{const{clearERPCache:a,COMPANY_ID:s}=await import("./index-T8P1GM2w.js").then(i=>i.T);return{clearERPCache:a,COMPANY_ID:s}},__vite__mapDeps([0,1]));e(`companies/${n}/salesInvoices`),R("✅ تم تعيين الفاتورة كمدفوعة يدوياً بنجاح","success"),closeModal("view-invoice-modal"),await loadInvoicesList()}catch(t){R("خطأ: "+t.message,"error")}};window.cancelInvoice=async o=>{if(await showConfirm("هل تريد إلغاء هذه الفاتورة؟ سيتم عكس حركة المخزون وحذف القيود المحاسبية.","إلغاء الفاتورة"))try{const{getDoc:t,doc:e,collection:n,getDocs:a,query:s,where:i}=await at(async()=>{const{getDoc:d,doc:p,collection:w,getDocs:N,query:H,where:m}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:d,doc:p,collection:w,getDocs:N,query:H,where:m}},[]),{deleteJournalEntry:v,COMPANY_ID:r}=await at(async()=>{const{deleteJournalEntry:d,COMPANY_ID:p}=await import("./index-T8P1GM2w.js").then(w=>w.T);return{deleteJournalEntry:d,COMPANY_ID:p}},__vite__mapDeps([0,1])),{recalculateCustomerBalance:u}=await at(async()=>{const{recalculateCustomerBalance:d}=await import("./balance-sync-D_Qo7lf4.js");return{recalculateCustomerBalance:d}},__vite__mapDeps([2,0,1])),{adjustStock:b}=await at(async()=>{const{adjustStock:d}=await import("./index-T8P1GM2w.js").then(p=>p.T);return{adjustStock:d}},__vite__mapDeps([0,1])),l=await t(e(z,`companies/${D}/salesInvoices`,o));if(!l.exists()){R("الفاتورة غير موجودة","error");return}const x=l.data(),I=x?.customerId,T=x.invoiceNumber||o,k=x.items||x.lines||[],V=x.warehouseId||x.sourceWarehouseId;if(V&&k.length>0){const d=[];for(const p of k){const w=p.productId||p.id,N=parseFloat(p.quantity||p.qty||0);w&&N>0&&d.push({warehouseId:V,productId:w,qtyDelta:N,metadata:{type:"cancel_sale",sourceType:"salesInvoice",sourceId:o,documentNumber:T,notes:`إلغاء فاتورة ${T}`}})}if(d.length>0)try{await Lt(d)}catch(p){console.warn("[cancelInvoice] Bulk stock reversal failed:",p.message)}}const B=["salesInvoice","sales","salesCOGS","salesInvoice_cogs","salesReturnCOGS","posCOGS"];for(const d of B)try{const p=await a(s(n(z,`companies/${D}/journalEntries`),i("sourceType","==",d),i("sourceId","==",T)));for(const w of p.docs)await v(w.id),console.log(`[cancelInvoice] Deleted JE ${w.id} (${d})`);if(T!==o){const w=await a(s(n(z,`companies/${D}/journalEntries`),i("sourceType","==",d),i("sourceId","==",o)));for(const N of w.docs)await v(N.id)}}catch(p){console.warn(`[cancelInvoice] JE cleanup (${d}) skipped:`,p.message)}if(x.journalEntryId)try{await v(x.journalEntryId)}catch{}await yt("salesInvoices",o,{status:"cancelled"}),I&&await u(I).catch(()=>{}),R("✅ تم إلغاء الفاتورة وعكس المخزون والقيود","success"),await loadInvoicesList()}catch(t){R(t.message,"error")}};window.sendToZATCA=async()=>{if(_t){R("جارٍ التوقيع والإرسال لهيئة ZATCA...","info");try{const{getFunctions:o,httpsCallable:t,connectFunctionsEmulator:e}=await at(async()=>{const{getFunctions:v,httpsCallable:r,connectFunctionsEmulator:u}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js");return{getFunctions:v,httpsCallable:r,connectFunctionsEmulator:u}},[]),{app:n}=await at(async()=>{const{app:v}=await import("./firebase-config.js_v_41-OnbKYOT6.js");return{app:v}},[]),a=o(n,"me-west1");(location.hostname==="localhost"||location.hostname==="127.0.0.1")&&e(a,"localhost",5001);const i=await t(a,"submitInvoiceToZATCA")({invoiceId:_t.id});i.data.success?(R("تم توقيع الفاتورة وإرسالها إلى ZATCA بنجاح ✅","success"),closeModal("view-invoice-modal"),await loadInvoicesList()):R("فشل الربط: "+i.data.message,"error")}catch(o){R("تعذر الإرسال: "+o.message,"error")}}};window.printInvoice=async o=>{try{let r=function(m,f,g,P,et){function Q(L,ct){const lt=new TextEncoder().encode(ct);return new Uint8Array([L,lt.length,...lt])}const G=g?new Date(g).toISOString():new Date().toISOString(),_=[Q(1,m),Q(2,f||""),Q(3,G),Q(4,String(P?.toFixed(2)||"0.00")),Q(5,String(et?.toFixed(2)||"0.00"))],F=new Uint8Array(_.reduce((L,ct)=>L+ct.length,0));let st=0;return _.forEach(L=>{F.set(L,st),st+=L.length}),btoa(String.fromCharCode(...F))},t=typeof o=="object"&&o!==null?o:_t;if(!t&&typeof o=="string"){const m=await vt(pt(z,`companies/${D}/salesInvoices`,o));m.exists()&&(t={id:m.id,...m.data()})}if(!t){window.showToast&&window.showToast("يرجى اختيار الفاتورة للطباعة","warning");return}let e={name:"شركة نظم الإمداد الحديثة",vatNumber:"312448150500003",crNumber:"4700123180",phone:"0549141648",email:"Nuzmalamdad@gmail.com",logoUrl:"",street:"عامر الشعبي",district:"حي النزهة",city:"ينبع",buildingNo:"7480",zip:"46424",additionalNo:"3180",country:"المملكة العربية السعودية"};try{const m=JSON.parse(localStorage.getItem("idham_company")||"{}");m.name&&Object.assign(e,m)}catch{}try{const[m,f]=await Promise.all([vt(pt(z,`companies/${D}/settings`,"company")),vt(pt(z,`companies/${D}/settings`,"logo"))]);if(m.exists()){const g=m.data(),P=g.crNumber||g.cr||g.commercialRegistration||"";g.crNumber=P&&P.startsWith("47")?P:e.crNumber||"4700123180",g.vatNumber=g.vatNumber||e.vatNumber||"312448150500003",g.name=g.name||e.name||"شركة نظم الإمداد الحديثة",Object.assign(e,g);const et=JSON.parse(localStorage.getItem("idham_company")||"{}");localStorage.setItem("idham_company",JSON.stringify({...et,...g,crNumber:e.crNumber,vatNumber:e.vatNumber,name:e.name}))}f.exists()&&f.data().dataUrl&&(e.logoUrl=f.data().dataUrl)}catch(m){console.warn("Failed to load company settings from Firestore:",m)}let n={name:t.customerName||"—",vatNumber:t.customerVat||"",phone:t.customerPhone||"",crNumber:"",email:"",street:"",district:"",city:"",buildingNo:"",postalCode:"",additionalNo:"",country:"المملكة العربية السعودية",address:"",balance:0};if(t.customerId)try{const m=await vt(pt(z,`companies/${D}/customers`,t.customerId));if(m.exists()){const f=m.data();Object.assign(n,f),f.name&&(n.name=f.name),(f.vatNumber||f.vat)&&(n.vatNumber=f.vatNumber||f.vat),(f.nationalId||f.crNumber||f.cr)&&(n.crNumber=f.nationalId||f.crNumber||f.cr),(f.buildingNo||f.buildingNumber)&&(n.buildingNo=f.buildingNo||f.buildingNumber),(f.additionalNo||f.additionalNumber)&&(n.additionalNo=f.additionalNo||f.additionalNumber),(f.postalCode||f.zip)&&(n.postalCode=f.postalCode||f.zip),f.balance!==void 0&&(n.balance=parseFloat(f.balance)||0)}}catch(m){console.warn("Failed to load customer data:",m)}if(!n.district&&(n.street||n.address)){const m=n.street||n.address||"";if(m.includes("حي")){const f=m.match(/(?:-|—|,|\/)?\s*(حي\s+[^,-—\/]+)/);f&&f[1]&&(n.district=f[1].trim(),n.street=m.replace(f[0],"").trim())}}const a=!!(n.vatNumber&&n.vatNumber.trim().length>=10),s=a?"فاتورة ضريبية":"فاتورة ضريبية مبسطة",i=a?"TAX INVOICE":"SIMPLIFIED TAX INVOICE",v=a?"فاتورة ضريبية قياسية (B2B)":"فاتورة ضريبية مبسطة (B2C)",u=r(e.name||"شركة نظم الإمداد الحديثة",e.vatNumber||"312448150500003",t.date,t.totalWithVat,t.totalVat)||t.zatcaQr||t.qrBase64||t.qrCodeData||t.qr;let b="";if(u)try{if(typeof window.QRCode<"u"){const m=document.createElement("div");new window.QRCode(m,{text:u,width:90,height:90,correctLevel:window.QRCode.CorrectLevel?window.QRCode.CorrectLevel.M:0});const f=m.querySelector("canvas"),g=m.querySelector("img");f?b=f.toDataURL("image/png"):g&&g.src&&(b=g.src)}}catch(m){console.warn("QR pre-generation error:",m)}let l=0,x=0,I=0;if(!it||it.length===0)try{it=await tt(O.products())}catch{}const T=new Map((it||[]).map(m=>[m.id,m])),k=(t.lines||[]).map((m,f)=>{const g=parseFloat(m.qty||0),P=parseFloat(m.unitPrice||m.price||0),et=parseFloat(m.discount||0),Q=g*P*(et/100),G=g*P-Q,_=m.taxCategory==="E"||m.taxCategory==="Z"?0:15,F=G*(_/100),st=G+F;l++,x+=g,I+=Q;let L=m.unit;const ct=m.productName||m.name||"";if(!L||L==="Piece"||L==="PCS"||L==="حبة"){const U=m.productId?T.get(m.productId):(it||[]).find(Ct=>Ct.name===ct);U&&U.unit&&U.unit!=="Piece"&&U.unit!=="PCS"&&(L=U.unit)}const lt=!L||L==="Piece"||L==="PCS"||L==="حبة"?"كرتون":L;return`
        <tr>
          <td class="mono font-bold" style="color:#6366f1;">${f+1}</td>
          <td class="desc">
            <div class="font-bold" style="font-size:11px; color:#1e1b4b;">${ct}</div>
            <div style="font-size:9px; color:#64748b;">الوحدة: <b style="color:#1e1b4b;">${lt}</b></div>
          </td>
          <td class="mono font-bold" style="font-size:11.5px;">${g}</td>
          <td class="mono">${$(P)}</td>
          <td class="mono" style="color:${et>0?"#dc2626":"#9ca3af"};">${et>0?`${et}%`:"—"}</td>
          <td class="mono font-bold">${$(G)}</td>
          <td class="mono" style="font-size:10px;">${_}%</td>
          <td class="mono">${$(F)}</td>
          <td class="mono font-bold" style="color:#1e1b4b; font-size:11.5px;">${$(st)}</td>
        </tr>
      `}).join(""),V=typeof Ot=="function"?Ot(t.totalWithVat||0):"",B=e.logoUrl?`<div class="logo-circle"><img src="${e.logoUrl}" alt="شعار المؤسسة" /></div>`:'<div class="logo-circle"><span class="default-logo">🏢</span></div>',d=t.number||t.invoiceNumber||t.id||"—",p=typeof JsBarcode<"u"?(()=>{const m=document.createElementNS("http://www.w3.org/2000/svg","svg");try{return JsBarcode(m,d,{format:"CODE128",width:1.2,height:32,displayValue:!1,margin:0}),m.outerHTML}catch{return""}})():"",N=(t.items||t.lines||[]).length<=4,H=window.open("","_blank");if(!H){window.showToast&&window.showToast("يرجى السماح بالنوافذ المنبثقة للطباعة","warning");return}H.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>فاتورة ضريبية — ${d}</title>
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
        <h1>${s}</h1>
        <h2>${i}</h2>
        <span class="doc-badge">${v}</span>
      </div>
      <div>
        ${p}
      </div>
    </div>

    <!-- Purple Header Banner -->
    <div class="company-banner">
      <div class="banner-meta">
        <div class="meta-line"><span class="m-lbl">رقم الفاتورة / Inv No:</span> <strong class="m-val mono">${d}</strong></div>
        <div class="meta-line"><span class="m-lbl">تاريخ الإصدار / Date:</span> <strong class="m-val mono">${t.date||"—"}</strong></div>
        <div class="meta-line"><span class="m-lbl">طريقة الدفع / Terms:</span> <strong class="m-val">${t.paymentMethod==="cash"?"نقدي (Cash)":"آجل (Credit)"}</strong></div>
        ${t.dueDate?`<div class="meta-line"><span class="m-lbl">الاستحقاق / Due:</span> <strong class="m-val mono">${t.dueDate}</strong></div>`:""}
      </div>
      ${B}
      <div class="banner-co">
        <h2>${e.name}</h2>
        <div class="co-id-row">
          <span class="co-pill">الرقم الضريبي (VAT): <strong class="mono">${e.vatNumber||"312448150500003"}</strong></span>
          <span class="co-pill">السجل التجاري (CR): <strong class="mono">${e.crNumber||"4700123180"}</strong></span>
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
        <div class="party-name">${e.name}</div>
        <div class="party-ids-row">
          <div class="id-badge">
            <span class="id-lbl">السجل التجاري (CR):</span>
            <span class="id-val mono">${e.crNumber||"4700123180"}</span>
          </div>
          <div class="id-badge vat-badge">
            <span class="id-lbl">الرقم الضريبي (VAT):</span>
            <span class="id-val mono">${e.vatNumber||"312448150500003"}</span>
          </div>
        </div>
        <div class="addr-compact-grid">
          <div class="addr-line-item"><span class="lbl">المدينة:</span> <span class="val">${e.city||"ينبع"}</span></div>
          <div class="addr-line-item"><span class="lbl">الحي:</span> <span class="val">${e.district||"حي النزهة"}</span></div>
          <div class="addr-line-item"><span class="lbl">الشارع:</span> <span class="val">${e.street||"عامر الشعبي"}</span></div>
          <div class="addr-line-item"><span class="lbl">المبنى:</span> <span class="val mono">${e.buildingNo||"7480"}</span></div>
          <div class="addr-line-item"><span class="lbl">الرمز البريدي:</span> <span class="val mono">${e.zip||e.postalCode||"46424"}</span></div>
          <div class="addr-line-item"><span class="lbl">الرقم الإضافي:</span> <span class="val mono">${e.additionalNo||"3180"}</span></div>
          <div class="addr-line-item full"><span class="lbl">الدولة:</span> <span class="val">${e.country||"المملكة العربية السعودية"}</span></div>
        </div>
      </div>

      <!-- Buyer Box -->
      <div class="party-card buyer">
        <div class="party-head">
          <span class="party-title">👤 بيانات العميل / المشتري (Buyer)</span>
          <span class="${n.vatNumber?"badge-vat":"badge-novat"}">${n.vatNumber?"مسجل ضريبياً":"غير مسجل"}</span>
        </div>
        <div class="party-name">${n.name}</div>
        <div class="party-ids-row">
          <div class="id-badge">
            <span class="id-lbl">السجل / الهوية:</span>
            <span class="id-val mono">${n.crNumber||"—"}</span>
          </div>
          <div class="id-badge vat-badge">
            <span class="id-lbl">الرقم الضريبي (VAT):</span>
            <span class="id-val mono" style="color:${n.vatNumber?"#1e1b4b":"#6b7280"};">${n.vatNumber||"غير مسجل"}</span>
          </div>
        </div>
        <div class="addr-compact-grid">
          <div class="addr-line-item"><span class="lbl">المدينة:</span> <span class="val">${n.city||"—"}</span></div>
          <div class="addr-line-item"><span class="lbl">الحي:</span> <span class="val">${n.district||"—"}</span></div>
          <div class="addr-line-item"><span class="lbl">الشارع:</span> <span class="val">${n.street||"—"}</span></div>
          <div class="addr-line-item"><span class="lbl">المبنى:</span> <span class="val mono">${n.buildingNo||"—"}</span></div>
          <div class="addr-line-item"><span class="lbl">الرمز البريدي:</span> <span class="val mono">${n.postalCode||"—"}</span></div>
          <div class="addr-line-item"><span class="lbl">الرقم الإضافي:</span> <span class="val mono">${n.additionalNo||"—"}</span></div>
          <div class="addr-line-item full"><span class="lbl">الدولة:</span> <span class="val">${n.country||"المملكة العربية السعودية"}</span></div>
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
        ${k}
      </tbody>
    </table>

    <!-- Tafqeet (Amount in words) & Packaging Bar -->
    <div class="tafqeet-strip">
      <div class="tafqeet-text">
        <span>✍️ المبلغ بالحروف:</span> ${V}
      </div>
      <div class="packages-count">
        📦 إجمالي الكمية: <b class="mono">${x}</b> | عدد البنود: <b class="mono">${l}</b> صنف
      </div>
    </div>

    <!-- Bottom Layout: QR + Notes + Totals -->
    <div class="bottom-layout">
      <!-- QR Code -->
      <div class="qr-box">
        ${b?`<img src="${b}" width="86" height="86" style="display:block;margin:0 auto;border-radius:4px;" alt="ZATCA QR" />`:'<div id="qrcode-container" style="width:86px;height:86px;border:1px dashed #cbd5e1;display:flex;align-items:center;justify-content:center;font-size:9px;color:#94a3b8;">ZATCA QR</div>'}
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
          <tr>
            <td class="lbl">المجموع قبل الضريبة (Taxable):</td>
            <td class="val">${$(t.subtotal||0)}</td>
          </tr>
          ${(t.discountTotal||I)>0?`
          <tr>
            <td class="lbl" style="color:#dc2626;">إجمالي الخصم (Discount):</td>
            <td class="val" style="color:#dc2626;">- ${$(t.discountTotal||I)}</td>
          </tr>`:""}
          <tr>
            <td class="lbl">ضريبة القيمة المضافة (15% VAT):</td>
            <td class="val">${$(t.totalVat||0)}</td>
          </tr>
          <tr class="grand">
            <td class="lbl">الإجمالي شامل الضريبة (Grand Total):</td>
            <td class="val font-bold">${$(t.totalWithVat||0)}</td>
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
      <div>📞 الهاتف: <b>${e.phone||"0549141648"}</b> | ✉️ البريد: <b>${e.email||"Nuzmalamdad@gmail.com"}</b></div>
      <div>شكراً لتعاملكم معنا — ${e.name}</div>
    </div>
  </div>
</body>
</html>`),H.document.close()}catch(t){console.error("[printInvoice] Error:",t),window.showToast&&window.showToast("خطأ أثناء الطباعة: "+t.message,"error")}};window.exportInvoices=async()=>{window.exportInvoicesExcel()};window.exportInvoicesExcel=async()=>{try{R("جاري تجهيز ملف Excel…","info");const t=(await tt(O.salesInvoices(),[Y("createdAt","desc")])).map(e=>[e.number||"",e.date||"",e.customerName||"",e.repName||"",e.paymentMethod||"",e.subtotal||0,e.discountTotal||0,e.totalVat||0,e.totalWithVat||0,e.status||"",e.notes||""]);await le({title:"فواتير_المبيعات",headers:["رقم الفاتورة","التاريخ","العميل","المندوب","طريقة الدفع","المجموع قبل الخصم","إجمالي الخصم","ضريبة 15%","الإجمالي شامل الضريبة","الحالة","ملاحظات"],rows:t,colWidths:[18,14,26,18,14,16,16,14,18,12,28]}),R(`تم تصدير ${t.length} فاتورة ✅`,"success")}catch(o){R("خطأ: "+o.message,"error")}};window.editInvoice=async o=>{try{const t=await Dt("salesInvoices",o);if(!t){R("لم يتم العثور على الفاتورة","error");return}window._editingInvoiceId=o,document.getElementById("inv-number").value=t.number,document.getElementById("customer-search").value=t.customerName||"",document.getElementById("customer-id").value=t.customerId||"",document.getElementById("inv-date").value=t.date||"",document.getElementById("inv-payment").value=t.paymentMethod||"credit",document.getElementById("inv-paid-amount").value=t.paidAmount||"",document.getElementById("inv-notes").value=t.notes||"",document.getElementById("inv-type").value=t.invoiceType||"B2C",A=t.customerId?{id:t.customerId,name:t.customerName,type:t.customerType||"retail"}:null;const e=document.getElementById("donation-badge");t.customerId==="005"||(t.customerName||"").includes("سلة البركة")?(e&&(e.textContent="🎁 عميل تبرعات (معفى من الضريبة وتكلفتها مصروف تبرعات)",e.classList.remove("hidden")),document.getElementById("credit-status-bar")?.classList.add("hidden")):e&&e.classList.add("hidden"),await At(),document.getElementById("inv-rep").value=t.repId||"",await Rt(),document.getElementById("inv-warehouse").value=t.warehouseId||"",await oe();const a=document.getElementById("inv-cost-center");a&&(a.value=t.costCenterId||"",a.value||window.autoSelectCostCenter()),E=(t.lines||[]).map(i=>({productId:i.productId,productName:i.productName,qty:i.qty||1,unit:i.unit||"PCS",altUnit:i.altUnit||"",unitFactor:parseFloat(i.unitFactor)||1,selectedUnit:i.selectedUnit||i.unit||"PCS",unitCode:i.unitCode||"PCE",unitPrice:i.unitPrice||i.price||0,discount:i.discount||0,taxCategory:i.taxCategory||"S",sku:i.sku||"",costPrice:i.costPrice||0,batchNumber:i.batchNumber||"",expiryDate:i.expiryDate||"",availableBatches:[]})),E.forEach((i,v)=>{window.resolveLineBatches(v)}),nt(),bt(),zt(),Ft();const s=document.getElementById("save-inv-btn");s&&(s.textContent="💾 تحديث الفاتورة"),openModal("new-invoice-modal")}catch(t){R(t.message,"error")}};window.deleteInvoice=async(o,t)=>{if(await showConfirm(`هل أنت متأكد من حذف الفاتورة "${t}" نهائياً؟`,"تأكيد حذف الفاتورة"))try{const e=await Dt("salesInvoices",o);if(!e)throw new Error("لم يتم العثور على الفاتورة");if(await ae(e),e.lines&&e.warehouseId&&e.status!=="cancelled"){const s=e.lines.map(i=>({warehouseId:e.warehouseId,productId:i.productId,qtyDelta:i.qty,metadata:{type:"sale_reverse",refId:e.number,documentNumber:e.number,invoiceNumber:e.number,notes:`حذف الفاتورة ${e.number}`,batchNumber:i.batchNumber||"",expiryDate:i.expiryDate||""}}));if(s.length>0)try{await Lt(s)}catch(i){console.warn("Stock reversal failed on delete:",i.message)}}const n=e.invoiceNumber||e.number||o,a=["salesInvoice","sales","salesCOGS","salesInvoice_cogs","salesReturnCOGS","posCOGS"];for(const s of a)try{const i=await rt(X(gt(z,`companies/${D}/journalEntries`),M("sourceType","==",s),M("sourceId","==",n)));for(const v of i.docs)await xt(v.id),console.log(`[deleteInvoice] Deleted JE ${v.id} (${s}) for ${n}`);if(n!==o){const v=await rt(X(gt(z,`companies/${D}/journalEntries`),M("sourceType","==",s),M("sourceId","==",o)));for(const r of v.docs)await xt(r.id),console.log(`[deleteInvoice] Deleted JE ${r.id} (${s}) for raw id ${o}`)}}catch(i){console.warn(`[deleteInvoice] JE cleanup (${s}) skipped:`,i.message)}if(e.journalEntryId)try{await xt(e.journalEntryId)}catch{}if(await te("salesInvoices",o),e.customerId){const{recalculateCustomerBalance:s}=await at(async()=>{const{recalculateCustomerBalance:i}=await import("./balance-sync-D_Qo7lf4.js");return{recalculateCustomerBalance:i}},__vite__mapDeps([2,0,1]));await s(e.customerId)}R(`✅ تم حذف الفاتورة ${t} بنجاح`,"success"),loadInvoicesList()}catch(e){R("خطأ في الحذف: "+e.message,"error"),console.error("deleteInvoice error:",e)}};window.openSalesInvoiceFromQuote=async o=>{await Ut(),E=[];for(const e of o.items||[]){const n=it.find(l=>l.id===e.productId),a=parseFloat(e.unitPrice)||0,s=parseFloat(e.qty)||1,i=parseFloat(e.discount)||0,v=e.unit||n?.unit||"كرتون",r=n?.altUnit||"",u=parseFloat(n?.unitFactor)||1,b=!!e.isCustom||String(e.productId||"").startsWith("adhoc_");E.push({productId:e.productId,productName:e.productName,sku:e.sku||n?.sku||(b?"بند حر":""),unit:v,altUnit:r,unitFactor:u,selectedUnit:v,basePricePerUnit:a,qty:s,unitPrice:a,discount:i,taxCategory:e.taxCategory||"S",costPrice:e.cost||n?.lastPurchasePrice||n?.costPrice||0,isCustom:b})}if(A=null,window._editingInvoiceId=null,o.customerId&&o.customerId!=="general"){const e=(dt||[]).find(n=>n.id===o.customerId);e?A=e:A={id:o.customerId,name:o.customerName}}const t=document.getElementById("save-inv-btn");t&&(t.textContent="💾 حفظ وإصدار الفاتورة"),document.getElementById("inv-number").value="جارٍ التوليد…",document.getElementById("customer-search").value=o.customerName||"",document.getElementById("customer-id").value=o.customerId&&o.customerId!=="general"?o.customerId:"",document.getElementById("inv-date").value=ut(),document.getElementById("inv-payment").value="credit",document.getElementById("inv-paid-amount").value="",document.getElementById("credit-status-bar").classList.add("hidden"),document.getElementById("donation-badge")?.classList.add("hidden"),document.getElementById("inv-form-error").classList.add("hidden"),zt(),Ft(),nt(),bt(),setTimeout(()=>{const e=document.getElementById("inv-notes");e&&(e.value=`محولة من عرض سعر رقم ${o.quoteNumber||""}${o.notes?" | "+o.notes:""}`)},300),openModal("new-invoice-modal"),At(),R(`تم استيراد بنود عرض السعر ${o.quoteNumber||""} بنجاح`,"success")};window.openSalesInvoiceFromPurchase=async o=>{await Ut(),E=[];for(const n of o.items||[]){const a=it.find(i=>i.id===n.productId);let s=0;a?(s=a.salePrice||a.priceRetail||0,s||(s=(a.purchasePrice||a.costPrice||a.averageCost||0)*1.1*1.15)):s=n.unitPrice*1.1*1.15,E.push({productId:n.productId,productName:n.productName,sku:n.sku||"",unit:n.unit||"PCS",qty:n.qty||0,unitPrice:parseFloat(s)||0,discount:0,taxCategory:"S"})}A=null,window._editingInvoiceId=null;const t=document.getElementById("save-inv-btn");t&&(t.textContent="💾 حفظ وإصدار الفاتورة"),document.getElementById("inv-number").value="جارٍ التوليد…",document.getElementById("customer-search").value="",document.getElementById("customer-id").value="",document.getElementById("inv-date").value=ut(),document.getElementById("inv-payment").value="credit",document.getElementById("inv-paid-amount").value="",document.getElementById("credit-status-bar").classList.add("hidden"),document.getElementById("donation-badge")?.classList.add("hidden"),document.getElementById("inv-form-error").classList.add("hidden"),zt(),Ft();const e=document.getElementById("inv-warehouse");e&&o.warehouseId&&(e.value=o.warehouseId),nt(),bt(),setTimeout(()=>{const n=document.getElementById("inv-notes");n&&(n.value=`محولة من فاتورة مشتريات رقم ${o.purchaseNumber||""}`)},300),openModal("new-invoice-modal"),At(),Rt(),oe();try{const n=await Jt("INV");document.getElementById("inv-number").value=n}catch{}};export{_e as render};
