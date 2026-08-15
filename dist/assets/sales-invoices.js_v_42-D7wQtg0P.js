const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-HrCilPJ3.js","assets/index-BTgEPYae.css","assets/balance-sync-B0nwXHmR.js","assets/sync-engine-CjRafMpJ.js"])))=>i.map(i=>d[i]);
import{t as et,g as R,C as D,f as I,b as At,c as Dt,x as jt,p as Mt,a as T,A as qt,B as zt,i as te,D as It,d as N,E as ee,F as oe,v as wt,G as nt,u as xt,n as ne,_ as z,H as Rt,I as Ft,r as Ot}from"./index-HrCilPJ3.js";import{autoSalesJE as ae}from"./accounting-engine-BmLox5ep.js";import{e as se}from"./excel-zCoXiaxq.js";import{orderBy as J,getDocs as Q,getDoc as dt,doc as at,query as X,collection as tt,where as M,updateDoc as ie,serverTimestamp as ce,increment as re}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";function mt(t,e){const a=new TextEncoder().encode(e),n=new Uint8Array(2+a.length);return n[0]=t,n[1]=a.length,n.set(a,2),n}function de(t){const e=t.reduce((n,s)=>n+s.length,0),o=new Uint8Array(e);let a=0;for(const n of t)o.set(n,a),a+=n.length;return o}function le(t){let e="";for(let o=0;o<t.length;o++)e+=String.fromCharCode(t[o]);return btoa(e)}function ue(t){const{sellerName:e,vatNumber:o,timestamp:a,totalWithVat:n,vatAmount:s}=t,c=[mt(1,e),mt(2,o),mt(3,a),mt(4,Number(n).toFixed(2)),mt(5,Number(s).toFixed(2))];return le(de(c))}async function pe(t,e,o=120){if(!window.QRCode){console.warn("QRCode.js not loaded");return}e.innerHTML="";try{const a=document.createElement("canvas");e.appendChild(a),await QRCode.toCanvas(a,t,{width:o,margin:1,color:{dark:"#000000",light:"#FFFFFF"},errorCorrectionLevel:"M"})}catch(a){console.error("QR generation failed:",a),e.innerHTML='<div class="alert warn" style="font-size:11px;">تعذر توليد QR</div>'}}let k=[],V=null,vt=[],yt=[],lt=null,bt=null;const S=(t,e="info")=>{window.showToast?window.showToast(t,e):console.log(`[Toast Fallback - ${e}]:`,t)};function _t(t){const e=document.getElementById("inv-form-error");e?(e.textContent=t,e.classList.remove("hidden")):alert(t)}async function Vt(){if(bt)return bt;try{const t=await dt(at(N,`companies/${T}/settings`,"system"));t.exists()&&(bt=t.data())}catch(t){console.error("Failed to load pricing settings:",t)}return bt||{}}async function $e(t,e){t.innerHTML=ve(),window._salesUser=e,document.getElementById("inv-from").addEventListener("change",()=>loadInvoicesList()),document.getElementById("inv-to").addEventListener("change",()=>loadInvoicesList()),document.getElementById("inv-status-filter").addEventListener("change",()=>loadInvoicesList()),document.getElementById("inv-zatca-filter").addEventListener("change",()=>loadInvoicesList());const o=document.getElementById("inv-text-filter");o&&o.addEventListener("input",(window.debounce||(n=>n))(()=>loadInvoicesList(),300)),await Promise.all([me(),loadInvoicesList()]);const a=sessionStorage.getItem("convert_purchase_to_sale");if(a){sessionStorage.removeItem("convert_purchase_to_sale");try{const n=JSON.parse(a);setTimeout(()=>{window.openSalesInvoiceFromPurchase(n)},200)}catch(n){console.error(n)}}}async function me(){try{const[t,e,o]=await Promise.all([R(D.customers(),[J("name")]),R(D.salesReps(),[J("name")]),R(D.warehouses(),[J("name")])]);O=t,Y=e,j=o;const a=document.getElementById("inv-customer-filter");a&&(a.innerHTML='<option value="">كل العملاء</option>'+t.map(c=>`<option value="${c.id}">${c.name}</option>`).join(""));const n=document.getElementById("inv-rep-filter");if(n){const c=[],v=new Set;e.forEach(f=>{const y=(f.name||"").trim();y&&!v.has(y)&&(v.add(y),c.push(f))}),n.innerHTML='<option value="">كل المناديب</option>'+c.map(f=>`<option value="${f.id}">${f.name}</option>`).join("")}const s=document.getElementById("inv-warehouse-filter");s&&(s.innerHTML='<option value="">كل المستودعات</option>'+o.map(c=>`<option value="${c.id}">${c.name}</option>`).join(""))}catch(t){console.warn("Failed to load list filters dropdowns:",t)}}function ve(){return`
    <!-- Filter Bar -->
    <div class="filterbar" style="flex-wrap: wrap; gap: 8px; align-items: flex-end;">
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="inv-from" value="${new Date(new Date().setDate(1)).toISOString().split("T")[0]}" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="inv-to" value="${et()}" />
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
              <input type="date" id="inv-date" class="input" value="${et()}" />
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
              <select id="inv-warehouse" onchange="renderInvoiceLines(); window.autoSelectCostCenter && window.autoSelectCostCenter();">
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
    </div>`}let Et=null,rt=0,ft=new Map,Y=null,j=null,O=null;window.loadInvoicesList=async()=>{Et=null,rt=0,await Bt()};window.invPage=async t=>{t==="next"&&Et&&(rt++,await Bt()),t==="prev"&&rt>0&&(rt--,Et=null,await Bt())};async function Bt(){const t=document.getElementById("inv-tbody");if(t){t.innerHTML=`${Array(8).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(11).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}`;try{let o=(await Q(D.salesInvoices())).docs.map(i=>({id:i.id,...i.data()}));o.forEach(i=>ft.set(i.id,i));const a=document.getElementById("inv-from")?.value,n=document.getElementById("inv-to")?.value;(a||n)&&(o=o.filter(i=>{const p=i.date||"";return(!a||p>=a)&&(!n||p<=n)}));const s=document.getElementById("inv-status-filter")?.value;s&&(o=o.filter(i=>i.status===s));const c=document.getElementById("inv-customer-filter")?.value;c&&(o=o.filter(i=>i.customerId===c||i.customerName===O?.find(p=>p.id===c)?.name));const v=document.getElementById("inv-rep-filter")?.value,f=v?Y?.find(i=>i.id===v)?.name:null;v&&(o=o.filter(i=>i.repId===v||f&&i.repName===f||i.repName&&i.repName.includes("مصطفى")));const y=document.getElementById("inv-warehouse-filter")?.value;y&&(o=o.filter(i=>i.warehouseId===y)),o.sort((i,p)=>{const m=i.date||"",g=p.date||"";if(m!==g)return g.localeCompare(m);const E=i.number||i.invoiceNumber||i.id||"";return(p.number||p.invoiceNumber||p.id||"").localeCompare(E)});const l=!1;Et=null;const r=o.filter(i=>i.status!=="cancelled"),u=r.reduce((i,p)=>i+(p.totalWithVat||p.grandTotal||p.total||0),0);let h=0;try{const i=await Q(D.receipts()),p=document.getElementById("inv-from")?.value,m=document.getElementById("inv-to")?.value;h=i.docs.map(x=>({id:x.id,...x.data()})).filter(x=>{const F=x.date||(x.createdAt?.toDate?x.createdAt.toDate().toISOString().slice(0,10):"");if(!((!p||F>=p)&&(!m||F<=m))||c&&x.customerId!==c&&x.targetId!==c)return!1;if(v){const H=x.repId===v,G=f&&(x.repName===f||x.salesRepName===f),gt=r.some(Z=>Z.customerId===x.customerId||Z.customerId===x.targetId||Z.customerName===x.customerName||Z.customerName===x.targetName);if(!H&&!G&&!gt)return!1}return!0}).reduce((x,F)=>x+parseFloat(F.amount||0),0)}catch{h=r.reduce((p,m)=>p+parseFloat(m.amountPaid||m.paidAmount||0),0)}let w=Math.max(0,u-h);if(v){const p=(O?.filter(m=>m.repId===v||m.repName===f||f&&m.repName?.includes("مصطفى"))||[]).reduce((m,g)=>m+parseFloat(g.balance||0),0);p>0&&(w=p)}const b=o.filter(i=>i.zatcaStatus==="reported").length;document.getElementById("kpi-total").textContent=I(u),document.getElementById("kpi-paid").textContent=I(h),document.getElementById("kpi-unpaid").textContent=I(w),document.getElementById("kpi-zatca").textContent=`${b} / ${o.length}`,document.getElementById("inv-count-label").textContent=`${o.length} فاتورة`,o.length===0?t.innerHTML='<tr><td colspan="11" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد فواتير</td></tr>':t.innerHTML=o.map(i=>`
        <tr style="cursor:pointer;" onclick="viewInvoice('${i.id}')">
          <td class="mono text-indigo">${i.number||i.invoiceNumber||i.id.slice(0,8)}</td>
          <td class="dim">${At(i.date)}</td>
          <td class="font-semibold">${O&&O.find(p=>p.id===i.customerId)?.name||i.customerName||"—"}</td>
          <td class="dim">${i.repName||"—"}</td>
          <td class="dim" style="font-size:11px;">${i.warehouseName||j&&j.find(p=>p.id===i.warehouseId)?.name||"—"}</td>
          <td class="mono font-bold">${I(i.subtotal)}</td>
          <td class="mono text-warn">${I(i.totalVat||i.vatAmount||0)}</td>
          <td class="mono">${I(i.totalWithVat||i.total||0)}</td>
          <td>${Dt(i.status)}</td>
          <td>${i.zatcaStatus==="reported"?'<span class="zatca-stamp reported">✓ مُرسلة</span>':'<span class="zatca-stamp pending">معلقة</span>'}</td>
          <td style="font-size:11px;">${i.journalEntryId?'<span class="badge good" style="font-size:10px;">✓ مُرحَّل</span>':'<span class="badge" style="font-size:10px; background:var(--bg-3); color:var(--text-2);">—</span>'}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-icon sm btn-ghost" onclick="event.stopPropagation();viewInvoice('${i.id}')" title="عرض">👁️</button>
              ${i.status!=="cancelled"?`<button class="btn btn-icon sm btn-ghost" onclick="event.stopPropagation();editInvoice('${i.id}')" title="تعديل">✏️</button>`:""}
              ${i.status!=="cancelled"?`<button class="btn btn-icon sm btn-ghost" onclick="event.stopPropagation();cancelInvoice('${i.id}')" title="إلغاء" style="color:var(--bad);">🚫</button>`:""}
              <button class="btn btn-icon sm btn-ghost text-bad" onclick="event.stopPropagation();deleteInvoice('${i.id}','${i.number}')" title="حذف">🗑️</button>
            </div>
          </td>
        </tr>`).join(""),document.getElementById("inv-next")?.toggleAttribute("disabled",!l),document.getElementById("inv-prev")?.toggleAttribute("disabled",rt===0),document.getElementById("inv-page-info").textContent=`صفحة ${rt+1}`}catch(e){console.error(e),t.innerHTML=`<tr><td colspan="11"><div class="alert bad" style="margin:8px;">${e.message}</div></td></tr>`}}}window.invFilterRange=t=>{const e=et();t==="today"?(document.getElementById("inv-from").value=e,document.getElementById("inv-to").value=e):t==="month"&&(document.getElementById("inv-from").value=new Date(new Date().setDate(1)).toISOString().split("T")[0],document.getElementById("inv-to").value=e),document.querySelectorAll(".quick-filter-btn").forEach(o=>o.classList.remove("active")),event.target.classList.add("active"),loadInvoicesList()};window.openNewInvoice=()=>{k=[],V=null,window._editingInvoiceId=null;const t=document.getElementById("save-inv-btn");t&&(t.textContent="💾 حفظ وإصدار الفاتورة"),document.getElementById("inv-number").value="جارٍ التوليد…",document.getElementById("customer-search").value="",document.getElementById("customer-id").value="",document.getElementById("inv-date").value=et(),document.getElementById("inv-payment").value="credit",document.getElementById("inv-paid-amount").value="",document.getElementById("inv-notes").value="",document.getElementById("credit-status-bar").classList.add("hidden"),document.getElementById("inv-form-error").classList.add("hidden"),ot(),ut(),Nt(),Lt(),openModal("new-invoice-modal"),kt(),Tt(),Wt(),jt("INV").then(e=>{const o=document.getElementById("inv-number");o&&(o.value=e)}).catch(()=>{})};async function kt(){const t=document.getElementById("inv-rep");if(t){if(Y){t.innerHTML='<option value="">بيع مباشر (بدون مندوب)</option>'+Y.map(e=>`<option value="${e.id}" data-name="${e.name}">${e.name}</option>`).join("");return}try{Y=await R(D.salesReps(),[J("name")]),t.innerHTML='<option value="">بيع مباشر (بدون مندوب)</option>'+Y.map(e=>`<option value="${e.id}" data-name="${e.name}">${e.name}</option>`).join("")}catch{}}}async function Tt(){const t=document.getElementById("inv-warehouse");if(!t)return;const e=()=>{t.innerHTML='<option value="">اختر المخزن</option>'+j.map(o=>`<option value="${o.id}" data-name="${o.name}">${o.name}</option>`).join(""),!t.value&&j.length>0&&(t.value=j[0].id),ot()};if(t._whChangeListenerAttached||(t.addEventListener("change",()=>ot()),t._whChangeListenerAttached=!0),j){e();return}try{j=await R(D.warehouses(),[J("name")]),e()}catch{}}let Ct=null;async function Ht(){const t=document.getElementById("inv-cost-center");if(t)try{Ct||(Ct=(await R(D.costCenters()).catch(()=>[])).sort((o,a)=>(o.code||"").localeCompare(a.code||""))),t.innerHTML='<option value="">بدون مركز تكلفة</option>'+Ct.map(e=>`<option value="${e.id}" data-name="${e.name}">${e.code||""} — ${e.name}</option>`).join("")}catch(e){console.warn("Failed to load cost centers dropdown:",e)}}window.autoSelectCostCenter=()=>{const t=document.getElementById("inv-cost-center");if(!t)return;const e=document.getElementById("inv-warehouse")?.value,o=document.getElementById("inv-rep")?.value;if(e&&j){const a=j.find(n=>n.id===e);if(a&&(a.costCenterId||a.costCenter)){t.value=a.costCenterId||a.costCenter;return}}if(o&&Y){const a=Y.find(n=>n.id===o);if(a&&a.assignedWarehouseId&&j){const n=j.find(s=>s.id===a.assignedWarehouseId);n&&(n.costCenterId||n.costCenter)&&(t.value=n.costCenterId||n.costCenter)}}};function Nt(){const t=document.getElementById("customer-search"),e=document.getElementById("customer-results");t&&(t.addEventListener("input",Mt(async()=>{const o=t.value.trim().toLowerCase();if(!o){e.classList.add("hidden");return}try{(!O||O.length===0)&&(O=await R(D.customers(),[J("name")]));const a=O.filter(n=>(n.name||"").toLowerCase().includes(o)||(n.phone||"").includes(o)).slice(0,15);if(a.length===0){e.classList.add("hidden");return}e.innerHTML=a.map(n=>`
        <div class="autocomplete-item" onclick="selectCustomer('${n.id}','${n.name.replace(/'/g,"\\'")}',${n.creditLimit||0},${n.balance||0})">
          <div>${n.name}</div>
          <div class="item-code">${n.phone||""} | حد: ${I(n.creditLimit||0)}</div>
        </div>`).join(""),e.classList.remove("hidden")}catch(a){console.warn("setupCustomerAutocomplete error:",a)}},100)),document.addEventListener("click",o=>{t.contains(o.target)||e.classList.add("hidden")}))}window.selectCustomer=(t,e,o,a)=>{if(V={id:t,name:e,creditLimit:o,balance:a},document.getElementById("customer-search").value=e,document.getElementById("customer-id").value=t,document.getElementById("customer-results").classList.add("hidden"),o>0){const n=Math.min(a/o*100,100),s=document.getElementById("credit-status-bar"),c=document.getElementById("credit-fill"),v=document.getElementById("credit-numbers"),f=document.getElementById("credit-label");s.classList.remove("hidden"),c.style.width=n+"%",v.textContent=`${I(a)} / ${I(o)}`,n>=100?(c.className="fill bad",f.textContent="⚠️ تجاوز حد الائتمان"):n>=80?(c.className="fill warn",f.textContent="⚠️ قارب حد الائتمان"):(c.className="fill good",f.textContent="الرصيد المستخدم")}};function Lt(){const t=document.getElementById("product-search-input"),e=document.getElementById("product-search-results"),o=document.getElementById("inv-product-category-filter");if(!t)return;const a=()=>{const n=t.value.trim().toLowerCase(),s=o?o.value:"";if(!n&&!s){e.classList.add("hidden");return}let c=vt;if(s&&(c=c.filter(r=>r.category===s)),n&&(c=c.filter(r=>(r.name||"").toLowerCase().includes(n)||(r.sku||"").toLowerCase().includes(n)||(r.barcode||"").includes(n))),c=c.slice(0,15),!c.length){e.innerHTML='<div style="padding:10px;text-align:center;color:var(--text-2);font-size:12px;">لا توجد نتائج</div>',e.classList.remove("hidden");return}const v=document.getElementById("inv-warehouse")?.value,f=`companies/${T}/stockByWarehouse`,y=window.ERP_CACHE[f];let l=[];y&&(Array.isArray(y.data)?l=y.data:Array.isArray(y)&&(l=y)),e.innerHTML=c.map(r=>{const u=v?l.find(g=>g.productId===r.id&&g.warehouseId===v)?.qty||0:l.filter(g=>g.productId===r.id).reduce((g,E)=>g+(E.qty||0),0),h=u>0?"badge good":"badge bad",w=(r.name||"").replace(/'/g,"’"),b=(r.unit||"PCS").replace(/'/g,"’"),i=r.taxCategory||"S",p=r.salePrice||0,m=r.averageCost||r.costPrice||r.purchasePrice||0;return`
        <div class="autocomplete-item" onclick="addProductLine('${r.id}','${w}',${p},'${b}','${i}',${m})">
          <div class="flex justify-between">
            <span>${r.name}</span>
            <div>
              <span class="mono text-indigo" style="margin-left:12px;">${I(r.salePrice)}</span>
              <span class="${h}" style="font-size:10px;">المتاح: ${u}</span>
            </div>
          </div>
          <div class="item-code">${r.sku||""} | ${r.unit||""}</div>
        </div>`}).join(""),e.classList.remove("hidden")};t.addEventListener("input",Mt(a,200)),t.addEventListener("focus",a),o&&o.addEventListener("change",a),document.addEventListener("click",n=>{!t.contains(n.target)&&!e.contains(n.target)&&(!o||!o.contains(n.target))&&e.classList.add("hidden")})}async function Wt(){try{const t=`companies/${T}/stockByWarehouse`,[e,o,a]=await Promise.all([vt.length===0?R(D.products(),[J("name")]):Promise.resolve(vt),yt.length===0?R(D.categories(),[J("name")]):Promise.resolve(yt),R(D.stockByWarehouse())]);vt=e,yt=o,window.ERP_CACHE[t]=a||[];const n=document.getElementById("inv-product-category-filter");n&&(n.innerHTML='<option value="">كل الفئات</option>'+yt.map(s=>`<option value="${s.id}">${s.name}</option>`).join(""))}catch(t){console.error("loadProductsAndCategories error:",t)}}window.addProductLine=(t,e,o,a,n,s=0)=>{document.getElementById("product-search-input").value="",document.getElementById("product-search-results").classList.add("hidden"),k.push({productId:t,productName:e,unit:a,unitCode:{Carton:"CTN",كرتون:"CTN",Piece:"PCE",حبة:"PCE",Box:"BOX",صندوق:"BOX",Bag:"BAG",كيس:"BAG",Bale:"BL",بالة:"BL",Barrel:"BLL",برميل:"BLL",Pack:"PK","شد / ربطة":"PK",Sack:"SA",شوال:"SA",Tray:"TY",طبق:"TY",Gallon:"GLI",جالون:"GLI",Kilogram:"KGM",كجم:"KGM",Ton:"TNE",طن:"TNE",Liter:"LTR",لتر:"LTR"}[a]||"PCE",taxCategory:n||"S",qty:1,unitPrice:o,discount:0,costPrice:s||0}),ot(),ut()};function ot(){const t=document.getElementById("invoice-lines-tbody");if(!t)return;if(k.length===0){t.innerHTML='<tr><td colspan="9" style="text-align:center;padding:16px;color:var(--text-2);font-size:12px;">لم يتم إضافة أصناف بعد</td></tr>';return}const e=document.getElementById("inv-warehouse")?.value,o=`companies/${T}/stockByWarehouse`,a=window.ERP_CACHE[o];let n=[];a&&(Array.isArray(a.data)?n=a.data:Array.isArray(a)&&(n=a)),t.innerHTML=k.map((s,c)=>{const v=qt(s.qty,s.unitPrice,s.discount),f=s.taxCategory==="S"?v*.15:0;let y=0;if(e){const r=n.find(u=>u.productId===s.productId&&u.warehouseId===e);y=r&&r.qty||0}else y=n.filter(r=>r.productId===s.productId).reduce((r,u)=>r+(u.qty||0),0);const l=s.qty>y;return`<tr style="border-bottom:1px solid var(--border-soft);">
      <td style="padding:6px 10px;color:var(--text-2);width:30px;">${c+1}</td>
      <td style="padding:6px 10px;"><span style="font-family:var(--font-heading);font-size:12.5px;">${s.productName}</span></td>
      <td style="padding:6px 10px;font-size:11px;color:var(--text-2);">${s.unit}</td>
      <td style="padding:6px 10px;width:80px;">
        <input type="number" class="input mono" style="width:70px;height:30px;font-size:12px;${l?"border-color:var(--bad);background-color:rgba(239,68,68,0.05);":""}"
          value="${s.qty}" min="0.001" step="0.001"
          onchange="updateLine(${c},'qty',this.value)" />
        <div style="font-size:9.5px;margin-top:2px;white-space:nowrap;color:${l?"var(--bad)":"var(--text-dim)"};font-weight:${l?"700":"normal"};">
          المتاح: ${y}
        </div>
      </td>
      <td style="padding:6px 10px;width:110px;">
        <input type="number" class="input mono" style="width:100px;height:30px;font-size:12px;"
          value="${s.unitPrice}" min="0" step="0.01"
          onchange="updateLine(${c},'unitPrice',this.value)" />
      </td>
      <td style="padding:6px 10px;width:70px;">
        <input type="number" class="input mono" style="width:60px;height:30px;font-size:12px;"
          value="${s.discount}" min="0" max="100" step="0.1"
          onchange="updateLine(${c},'discount',this.value)" />
      </td>
      <td style="padding:6px 10px;font-size:11px;">
        ${s.taxCategory==="S"?`<span class="badge warn" style="font-size:11px; font-weight:700;">${I(f)}</span>`:'<span class="badge good" style="font-size:10px;">0%</span>'}
      </td>
      <td style="padding:6px 10px;" class="mono font-bold">${I(v)}</td>
      <td style="padding:6px 10px;">
        <button class="btn btn-icon sm btn-ghost" onclick="removeLine(${c})" style="color:var(--bad);">✕</button>
      </td>
    </tr>`}).join("")}window.updateLine=(t,e,o)=>{k[t][e]=parseFloat(o)||0,ot(),ut()};window.removeLine=t=>{k.splice(t,1),ot(),ut()};async function ut(){const t=await Vt(),e=document.getElementById("inv-payment")?.value||"credit",o=document.getElementById("inv-paid-amount");e==="credit"&&window.event&&window.event.type==="change"?o&&(o.value="0"):e==="cash"&&window.event&&window.event.type==="change"&&o&&(o.value="");const a=zt(k);let n=0;t.enableCashDiscount&&(e==="cash"||e==="transfer")&&(n+=t.cashDiscountRate||0);const s=k.reduce((m,g)=>m+(g.qty||0),0);t.enableVolumeDiscount&&s>=(t.volumeDiscountThreshold||50)&&(n+=t.volumeDiscountRate||0);let c=0;n>0&&(c=Math.round(a.subtotal*(n/100)*100)/100);const v=Math.max(0,a.subtotal-c),f=Math.round(v*.15*100)/100,y=v+f,l=m=>`${I(m)}`;document.getElementById("total-subtotal").textContent=l(a.subtotal+a.discountTotal);const r=a.discountTotal+c;document.getElementById("total-discount").textContent=`- ${l(r)}`,document.getElementById("total-vat").textContent=l(f),document.getElementById("total-grand").textContent=l(y);const u=k.reduce((m,g)=>{const E=g.averageCost||g.costPrice||0;return m+E*(g.qty||0)},0),h=v,w=h-u,b=h>0?w/h*100:0,i=document.getElementById("total-profit"),p=document.getElementById("total-margin");i&&(i.textContent=l(w),w>0?i.className="mono font-bold text-good":i.className="mono font-bold text-bad"),p&&(p.textContent=`${b.toFixed(1)}%`,b>0?p.className="mono font-bold text-good":p.className="mono font-bold text-bad"),window._autoDiscountAmount=c,window._autoDiscountRate=n}async function Jt(t){if(!t)return;const e=t.id,o=t.number||t.invoiceNumber||"",a=parseFloat(t.paidAmount)||0,n=parseFloat(t.totalWithVat)||parseFloat(t.total)||0;if((t.paymentMethod==="cash"||t.paymentMethod==="نقدي")&&a>0)try{await Rt({type:"out",amount:a,notes:`عكس/تعديل سداد الفاتورة ${o}`,sourceType:"salesInvoice_reverse",sourceId:e,date:t.date||et(),cashBoxId:t.repId?`cashBox_${t.repId}`:null}),console.log(`[Cleanup] Reversed cash transaction of ${a} for invoice ${o}`)}catch(s){console.warn("[Cleanup] Cash reversal failed:",s.message)}if(["transfer","network","bank","cheque","check","تحويل","شبكة","شيك"].includes(t.paymentMethod)&&n>0)try{await Ft({type:"out",amount:n,notes:`عكس/تعديل سداد الفاتورة ${o}`,sourceType:"salesInvoice_reverse",sourceId:e,date:t.date||et()}),console.log(`[Cleanup] Reversed bank transaction of ${n} for invoice ${o}`)}catch(s){console.warn("[Cleanup] Bank reversal failed:",s.message)}try{const s=[];e&&s.push(X(tt(N,`companies/${T}/receipts`),M("sourceInvoiceId","==",e))),o&&s.push(X(tt(N,`companies/${T}/receipts`),M("sourceInvoiceId","==",o)));for(const c of s){const v=await Q(c);for(const f of v.docs){const y=f.id;for(const l of["pos","receipt","salesInvoice","customerPayment"])try{const r=await Q(X(tt(N,`companies/${T}/journalEntries`),M("sourceType","==",l),M("sourceId","==",y)));for(const u of r.docs)await nt(u.id),console.log(`[Cleanup] Deleted JE ${u.id} (${l}) for receipt ${y}`)}catch(r){console.warn(`[Cleanup] JE delete (${l}) for receipt ${y}:`,r.message)}await Ot("receipts",y),console.log(`[Cleanup] Deleted receipt voucher ${y} linked to invoice ${o}`)}}}catch(s){console.warn("[Cleanup] Receipts cleanup failed:",s.message)}}window.saveInvoice=async(t="pending")=>{const e=document.getElementById("inv-form-error");e.classList.add("hidden");const o=document.getElementById("customer-id").value,a=document.getElementById("customer-search").value.trim(),n=document.getElementById("inv-rep"),s=n.value||"",c=s?n.options[n.selectedIndex]?.dataset.name||"":"بدون مندوب",v=document.getElementById("inv-warehouse"),f=v.value,y=v.options[v.selectedIndex]?.dataset.name||"",l=document.getElementById("inv-cost-center"),r=l?.value||null,u=l&&r&&l.options[l.selectedIndex]?l.options[l.selectedIndex].dataset.name||l.options[l.selectedIndex].text:null;document.getElementById("inv-date").value;const h=document.getElementById("inv-payment").value;let w=parseFloat(document.getElementById("inv-paid-amount").value)||0;(h==="credit"||h==="deferred"||h==="آجل")&&(w=0);const b=document.getElementById("inv-notes").value.trim(),i=document.getElementById("inv-type").value;if(!o&&i==="standard"){e.textContent="يرجى اختيار العميل",e.classList.remove("hidden");return}if(!f){e.textContent="يرجى اختيار المخزن",e.classList.remove("hidden");return}if(k.length===0){e.textContent="يرجى إضافة صنف واحد على الأقل",e.classList.remove("hidden");return}if(window._isSavingInvoice)return;window._isSavingInvoice=!0;const p=document.getElementById("save-inv-btn");p&&(p.disabled=!0,p.textContent="جارٍ التحقق…");const m=await Vt(),g=zt(k),E=window._autoDiscountAmount||0,x=Math.max(0,g.subtotal-E),F=g.discountTotal+E,U=Math.round(x*.15*100)/100,H=x+U,G=Math.max(0,H-w);let gt=!1;if(k.forEach(_=>{_.discount>(m.maxRepDiscount??3)&&(gt=!0)}),gt&&prompt(`⚠️ لقد تجاوزت الحد الأقصى المسموح لخصم المندوب (${m.maxRepDiscount??3}%).
يرجى إدخال رمز أمان المشرف (Supervisor PIN) للمتابعة:`)!==(m.supervisorPIN||"1234")){alert("❌ رمز الأمان غير صحيح. تم رفض الحفظ.");return}const Z=m.creditBlockPolicy||"block_with_pin";if(Z!=="allow_all"&&V?.creditLimit>0&&h==="credit"){const _=(V.balance||0)+H;if(_>V.creditLimit){if(Z==="warn"){if(!confirm(`⚠️ تجاوز حد ائتمان العميل: ${I(_)} > ${I(V.creditLimit)}
هل تريد المتابعة وتجاوز الحد؟`))return}else if(Z==="block_with_pin"&&prompt(`⚠️ تجاوز حد ائتمان العميل: ${I(_)} > ${I(V.creditLimit)}
يتطلب هذا الإجراء صلاحية المدير.
يرجى إدخال رمز تجاوز المدير (Supervisor PIN):`)!==(m.supervisorPIN||"1234")){alert("❌ رمز تجاوز غير صحيح! تم رفض المعاملة.");return}}}p&&(p.disabled=!0,p.textContent="جارٍ الحفظ…");try{const _=document.getElementById("inv-date")?.value||et();if(await te(_)){_t(`⚠️ لا يمكن حفظ الفاتورة لأن تاريخها (${_}) يقع في فترة محاسبية مغلقة ومقفلة نهائياً.`),p.disabled=!1,p.textContent="💾 حفظ وإصدار";return}let st=null,ht={};if(window._editingInvoiceId)try{st=await It("salesInvoices",window._editingInvoiceId),st&&st.lines&&st.warehouseId===f&&st.lines.forEach(d=>{d.productId&&(ht[d.productId]=(ht[d.productId]||0)+(d.qty||0))})}catch(d){console.warn("Failed to load old invoice for stock validation:",d)}const Qt=k.map(async d=>{if(!d.productId||!d.qty)return null;try{const $=`${f}_${d.productId}`,A=await dt(at(N,`companies/${T}/stockByWarehouse`,$));let B=A.exists()&&A.data().qty||0;if(ht[d.productId]&&(B+=ht[d.productId]),B<d.qty)return`⚠️ الكمية المطلوبة من الصنف "${d.productName||d.productId}" (${d.qty}) تتجاوز المتوفر في هذا المخزن (${B})`}catch($){console.warn(`Stock check failed for product ${d.productId}:`,$)}return null}),Pt=(await Promise.all(Qt)).find(d=>d!==null);if(Pt){_t(Pt),p.disabled=!1,p.textContent="💾 حفظ وإصدار";return}const W=document.getElementById("inv-number").value,Ut=ee(new Date),Gt=oe(),St=(()=>{try{return JSON.parse(localStorage.getItem("idham_company")||"{}")}catch{return{}}})(),Zt=ue({sellerName:St.name||window.ERP_COMPANY?.name||"مؤسسة إدهام للمواد الغذائية",vatNumber:St.vatNumber||window.ERP_COMPANY?.vatNumber||"",timestamp:Ut,totalWithVat:H,vatAmount:U}),Kt=t==="draft"?"draft":G>0?"posted":"paid",it={number:W,uuid:Gt,date:_,invoiceType:i,customerId:o||null,customerName:a||"عميل نقدي",repId:s,repName:c,warehouseId:f,warehouseName:y,costCenterId:r||null,costCenterName:u||null,lines:k,subtotal:x,discountTotal:F,totalVat:U,vatAmount:U,total:H,totalWithVat:H,paymentMethod:h,paidAmount:w,remainingAmount:G,notes:b,status:Kt,zatcaStatus:"pending",qrBase64:Zt,createdBy:window._salesUser?.uid||"system",autoDiscountAmount:E,autoDiscountRate:window._autoDiscountRate||0};let P=window._editingInvoiceId;if(P){const d=await It("salesInvoices",P);if(d){const B={};d.lines&&d.lines.forEach(C=>{B[C.productId]={qty:C.qty,warehouseId:d.warehouseId}});const L={};k.forEach(C=>{L[C.productId]={qty:C.qty,warehouseId:f}});for(const[C,K]of Object.entries(B)){const ct=L[C];if(!ct||ct.qty!==K.qty||ct.warehouseId!==K.warehouseId)try{await wt(K.warehouseId,C,K.qty,{type:"sale_reverse_edit",refId:d.number,documentNumber:d.number,invoiceNumber:d.number,notes:`تعديل الفاتورة ${d.number} (عكس الكمية القديمة)`})}catch(Xt){console.warn("Stock reversal failed on edit:",C,Xt.message)}}const q=k.map(async C=>{if(!C.productId||!C.qty)return;const K=B[C.productId];if(!K||K.qty!==C.qty||K.warehouseId!==f)try{await wt(f,C.productId,-C.qty,{type:"sale_out",sourceType:"salesInvoice",sourceId:P,documentNumber:it.number,invoiceNumber:it.number,userId:window._salesUser?.uid})}catch(ct){console.error(`[adjustStock] ❌ Sale failed for ${C.productName||C.productId}:`,ct.message),ct.message.includes("رصيد")&&window.showToast?.(`⚠️ رصيد غير كافٍ للصنف: ${C.productName}`,"warn")}});await Promise.all(q)}d&&await Jt(d);const $=d?.invoiceNumber||d?.number||P,A=["salesInvoice","sales","salesCOGS"];for(const B of A)try{const L=await Q(X(tt(N,`companies/${T}/journalEntries`),M("sourceType","==",B),M("sourceId","==",$)));for(const q of L.docs)await nt(q.id),console.log(`[saveInvoice-edit] Deleted old JE ${q.id} (${B}) for ${$}`);if($!==P){const q=await Q(X(tt(N,`companies/${T}/journalEntries`),M("sourceType","==",B),M("sourceId","==",P)));for(const C of q.docs)await nt(C.id),console.log(`[saveInvoice-edit] Deleted old JE ${C.id} (${B}) for raw id ${P}`)}}catch(L){console.warn(`[saveInvoice-edit] JE cleanup (${B}) skipped:`,L.message)}if(d?.journalEntryId)try{await nt(d.journalEntryId)}catch{}await xt("salesInvoices",P,it)}else{P=await ne(D.salesInvoices(),it);const d=k.map(async $=>{if(!(!$.productId||!$.qty))try{await wt(f,$.productId,-$.qty,{type:"sale_out",sourceType:"salesInvoice",sourceId:P,documentNumber:it.number,invoiceNumber:it.number,userId:window._salesUser?.uid})}catch(A){console.error(`[adjustStock] ❌ Sale failed for ${$.productName||$.productId}:`,A.message),A.message.includes("رصيد")&&window.showToast?.(`⚠️ رصيد غير كافٍ للصنف: ${$.productName}`,"warn")}});await Promise.all(d)}let pt=k.reduce((d,$)=>{const A=$.averageCost||$.costPrice||$.purchasePrice||0;return d+A*($.qty||0)},0);if(pt<.01&&k.length>0)try{const d=k.map(async B=>{if(!B.productId)return 0;try{const L=await dt(at(N,`companies/${T}/products`,B.productId));if(L.exists()){const q=L.data(),C=q.averageCost||q.costPrice||q.purchasePrice||0;return B.averageCost=C,B.costPrice=C,C*(B.qty||0)}}catch(L){console.warn(`[COGS] Failed to fetch cost for product ${B.productId}:`,L.message)}return 0}),A=(await Promise.all(d)).reduce((B,L)=>B+L,0);A>.01&&(pt=A,console.log(`[COGS] Fetched from Firestore in parallel: ${pt}`))}catch(d){console.warn("[COGS] Failed to fetch product costs:",d.message)}try{const d=await R(D.warehouses());if(window._editingInvoiceId)try{const{deleteJournalEntry:A}=await z(async()=>{const{deleteJournalEntry:L}=await import("./index-HrCilPJ3.js").then(q=>q.N);return{deleteJournalEntry:L}},__vite__mapDeps([0,1])),B=await Q(X(tt(N,`companies/${T}/journalEntries`),M("sourceId","in",[P,W])));for(const L of B.docs)await A(L.id),console.log(`[Edit] Deleted old JE ${L.id} for invoice ${W}`)}catch(A){console.warn("[Edit] Failed to cleanup old JEs:",A.message)}const $=await ae({id:P,invoiceNumber:W,date:_,customerName:a||"عميل نقدي",customerType:V?.type||"retail",paymentMethod:h,subtotal:x,taxAmount:U,total:H,paidAmount:w,remainingAmount:G,totalCost:pt,warehouseId:f,costCenterId:r,sourceType:"salesInvoice",customerId:o},window._salesUser||{},d);await xt("salesInvoices",P,{journalEntryId:$,totalCost:Math.round(pt*100)/100})}catch(d){console.error("[AccountingEngine] Sales JE failed:",d.message);try{await xt("salesInvoices",P,{journalEntryError:d.message,journalEntryId:null})}catch{}window.showToast?.("⚠️ تم حفظ الفاتورة لكن القيد المحاسبي فشل — "+d.message,"warn")}if(h==="cash"||h==="نقدي")try{await Rt({type:"in",amount:w,notes:`مبيعات نقدية — فاتورة ${W} — ${a||"عميل"}`,sourceType:"salesInvoice",sourceId:P,date:_})}catch(d){console.warn("[autoCashTransaction] Cash box update failed:",d.message)}if(["transfer","network","bank","cheque","check","تحويل","شبكة","شيك"].includes(h))try{await Ft({type:"in",amount:H,notes:`مبيعات — فاتورة ${W} — ${a||"عميل"}`,sourceType:"salesInvoice",sourceId:P,date:_})}catch(d){console.warn("[autoBankTransaction] Bank update failed:",d.message)}if(o&&G>0)try{const d=at(N,`companies/${T}/customers`,o);await ie(d,{balance:re(G),updatedAt:ce()}),console.log(`[CustomerBalance] Client-side incremented customer ${o} balance by +${G}`)}catch(d){console.warn("Failed to update customer balance on client:",d.message)}const Yt=window._editingInvoiceId?`تم تحديث الفاتورة ${W} بنجاح`:`تم إنشاء الفاتورة ${W} بنجاح`;window._editingInvoiceId=null,S(Yt,"success");const $t=document.getElementById("inv-file-upload");if($t&&$t.files.length>0){const d=$t.files[0];window.uploadFileToArchive(d,"sales_invoices",P,`مرفق فاتورة مبيعات رقم ${W}`).catch($=>console.warn($))}closeModal("new-invoice-modal"),await loadInvoicesList(),o&&z(()=>import("./balance-sync-B0nwXHmR.js"),__vite__mapDeps([2,0,1,3])).then(d=>d.recalculateCustomerBalance(o)).catch(d=>console.warn(d))}catch(_){e.textContent=_.message,e.classList.remove("hidden"),console.error(_)}finally{window._isSavingInvoice=!1,p.disabled=!1,p.textContent="💾 حفظ وإصدار"}};window.viewInvoice=async t=>{const e=document.getElementById("view-inv-body"),o=document.getElementById("view-inv-title");openModal("view-invoice-modal"),lt=null;const a=n=>{lt=n;const s=n.number||n.invoiceNumber||t;o.textContent=`فاتورة: ${s}`;const c=(n.lines||[]).map((b,i)=>{const p=b.productName||b.name||"",m=b.qty||0,g=b.unitPrice!==void 0?b.unitPrice:b.price||0,E=b.discount||0,x=qt(m,g,E);return`<tr>
        <td style="padding:7px 12px;">${i+1}</td>
        <td style="padding:7px 12px;">${p}</td>
        <td style="padding:7px 12px;" class="mono">${m}</td>
        <td style="padding:7px 12px;" class="mono">${I(g)}</td>
        <td style="padding:7px 12px;" class="mono">${E}%</td>
        <td style="padding:7px 12px;" class="mono font-bold">${I(x)}</td>
      </tr>`}).join(""),v=n.subtotal||0,f=n.totalVat||n.vatAmount||0,y=n.totalWithVat||n.total||0,l=n.paidAmount!==void 0?n.paidAmount:n.paymentMethod==="cash"||n.status==="paid"?y:0,r=n.remainingAmount!==void 0?n.remainingAmount:n.status!=="paid"&&n.paymentMethod!=="cash"?Math.max(0,y-l):0,u=n.warehouseName||j&&j.find(b=>b.id===n.warehouseId)?.name||"—";e.innerHTML=`
      <div style="display:grid;grid-template-columns:1fr 160px;gap:20px;margin-bottom:20px;">
        <div>
          <div class="grid-3 gap-12 mb-12">
            <div><div class="section-label mb-8">رقم الفاتورة</div><div class="mono text-indigo font-bold">${s}</div></div>
            <div><div class="section-label mb-8">التاريخ</div><div>${At(n.date)}</div></div>
            <div><div class="section-label mb-8">الحالة</div>${Dt(n.status)}</div>
            <div><div class="section-label mb-8">العميل</div><div class="font-semibold">${O&&O.find(b=>b.id===n.customerId)?.name||n.customerName}</div></div>
            <div><div class="section-label mb-8">المندوب</div><div>${n.repName||"—"}</div></div>
            <div><div class="section-label mb-8">المخزن</div><div>${u}</div></div>
            <div><div class="section-label mb-8">مركز التكلفة</div><div class="font-semibold text-warn">${n.costCenterName||"—"}</div></div>
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
          <tbody>${c}</tbody>
        </table>
      </div>

      <div style="display:flex;justify-content:flex-end;">
        <div class="invoice-totals" style="width:260px;">
          <div class="invoice-total-row"><span>المجموع قبل الضريبة</span><span class="mono">${I(v)}</span></div>
          <div class="invoice-total-row"><span>ضريبة القيمة المضافة</span><span class="mono text-warn">${I(f)}</span></div>
          <div class="invoice-total-row grand-total"><span>الإجمالي النهائي</span><span class="mono">${I(y)}</span></div>
          <div class="invoice-total-row"><span>المدفوع</span><span class="mono text-good">${I(l)}</span></div>
          <div class="invoice-total-row"><span>المتبقي</span><span class="mono text-bad">${I(r)}</span></div>
        </div>
      </div>`;const h=n.qrBase64||n.qrCodeData||n.zatcaQr||n.qr;h&&setTimeout(()=>pe("inv-qr-container",h),50);const w=document.getElementById("view-inv-footer");w&&(w.innerHTML=`
        <button class="btn btn-ghost" onclick="closeModal('view-invoice-modal')">إغلاق</button>
        ${n.status!=="paid"&&n.status!=="cancelled"?`<button class="btn" style="background:#16a34a;color:#fff;" onclick="markSalesAsPaidManually('${n.id}')">💵 تعيين كمدفوعة (مسددة بسند)</button>`:""}
        <button class="btn btn-secondary" onclick="printInvoice()">🖨️ طباعة</button>
        <button class="btn btn-lime" onclick="sendToZATCA()" id="zatca-send-btn">⚡ إرسال ZATCA</button>
      `)};if(ft.has(t)){a(ft.get(t));return}e.innerHTML='<div class="page-loading" style="min-height:150px;"><div class="loading-spinner"></div></div>';try{const n=at(N,`companies/${T}/salesInvoices`,t),s=await dt(n);if(!s.exists())throw new Error("الفاتورة غير موجودة");const c={id:s.id,...s.data()};ft.set(t,c),a(c)}catch(n){e.innerHTML=`<div class="alert bad">${n.message}</div>`}};window.markSalesAsPaidManually=async t=>{if(await showConfirm("هل تريد تعيين الفاتورة كمدفوعة يدوياً؟ (سيتم تغيير الحالة فقط دون إنشاء قيد سداد مكرر)","تأكيد التغيير"))try{const{update:e}=await z(async()=>{const{update:n}=await import("./index-HrCilPJ3.js").then(s=>s.N);return{update:n}},__vite__mapDeps([0,1]));await e("salesInvoices",t,{status:"paid",remainingAmount:0,manuallyPaid:!0,updatedAt:new Date().toISOString()}),ft.delete(t);const{clearERPCache:o,COMPANY_ID:a}=await z(async()=>{const{clearERPCache:n,COMPANY_ID:s}=await import("./index-HrCilPJ3.js").then(c=>c.N);return{clearERPCache:n,COMPANY_ID:s}},__vite__mapDeps([0,1]));o(`companies/${a}/salesInvoices`),S("✅ تم تعيين الفاتورة كمدفوعة يدوياً بنجاح","success"),closeModal("view-invoice-modal"),await loadInvoicesList()}catch(e){S("خطأ: "+e.message,"error")}};window.cancelInvoice=async t=>{if(await showConfirm("هل تريد إلغاء هذه الفاتورة؟ سيتم عكس حركة المخزون وحذف القيود المحاسبية.","إلغاء الفاتورة"))try{const{getDoc:e,doc:o,collection:a,getDocs:n,query:s,where:c}=await z(async()=>{const{getDoc:m,doc:g,collection:E,getDocs:x,query:F,where:U}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:m,doc:g,collection:E,getDocs:x,query:F,where:U}},[]),{deleteJournalEntry:v,COMPANY_ID:f}=await z(async()=>{const{deleteJournalEntry:m,COMPANY_ID:g}=await import("./index-HrCilPJ3.js").then(E=>E.N);return{deleteJournalEntry:m,COMPANY_ID:g}},__vite__mapDeps([0,1])),{recalculateCustomerBalance:y}=await z(async()=>{const{recalculateCustomerBalance:m}=await import("./balance-sync-B0nwXHmR.js");return{recalculateCustomerBalance:m}},__vite__mapDeps([2,0,1,3])),{adjustStock:l}=await z(async()=>{const{adjustStock:m}=await import("./index-HrCilPJ3.js").then(g=>g.N);return{adjustStock:m}},__vite__mapDeps([0,1])),r=await e(o(N,`companies/${T}/salesInvoices`,t));if(!r.exists()){S("الفاتورة غير موجودة","error");return}const u=r.data(),h=u?.customerId,w=u.invoiceNumber||t,b=u.items||u.lines||[],i=u.warehouseId||u.sourceWarehouseId;if(i&&b.length>0)for(const m of b){const g=m.productId||m.id,E=parseFloat(m.quantity||m.qty||0);if(g&&E>0)try{await l(i,g,E,"cancel_sale",`إلغاء فاتورة ${w}`,t)}catch(x){console.warn(`[cancelInvoice] Stock reversal failed for ${g}:`,x.message)}}const p=["salesInvoice","sales","salesCOGS"];for(const m of p)try{const g=await n(s(a(N,`companies/${T}/journalEntries`),c("sourceType","==",m),c("sourceId","==",w)));for(const E of g.docs)await v(E.id),console.log(`[cancelInvoice] Deleted JE ${E.id} (${m})`);if(w!==t){const E=await n(s(a(N,`companies/${T}/journalEntries`),c("sourceType","==",m),c("sourceId","==",t)));for(const x of E.docs)await v(x.id)}}catch(g){console.warn(`[cancelInvoice] JE cleanup (${m}) skipped:`,g.message)}if(u.journalEntryId)try{await v(u.journalEntryId)}catch{}await xt("salesInvoices",t,{status:"cancelled"}),h&&await y(h).catch(()=>{}),S("✅ تم إلغاء الفاتورة وعكس المخزون والقيود","success"),await loadInvoicesList()}catch(e){S(e.message,"error")}};window.sendToZATCA=async()=>{if(lt){S("جارٍ التوقيع والإرسال لهيئة ZATCA...","info");try{const{getFunctions:t,httpsCallable:e,connectFunctionsEmulator:o}=await z(async()=>{const{getFunctions:v,httpsCallable:f,connectFunctionsEmulator:y}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js");return{getFunctions:v,httpsCallable:f,connectFunctionsEmulator:y}},[]),{app:a}=await z(async()=>{const{app:v}=await import("./firebase-config.js_v_41-E9G1UPrX.js");return{app:v}},[]),n=t(a,"me-west1");(location.hostname==="localhost"||location.hostname==="127.0.0.1")&&o(n,"localhost",5001);const c=await e(n,"submitInvoiceToZATCA")({invoiceId:lt.id});c.data.success?(S("تم توقيع الفاتورة وإرسالها إلى ZATCA بنجاح ✅","success"),closeModal("view-invoice-modal"),await loadInvoicesList()):S("فشل الربط: "+c.data.message,"error")}catch(t){S("تعذر الإرسال: "+t.message,"error")}}};window.printInvoice=async()=>{if(!lt)return;const t=lt;let e={name:"مؤسسة إدهام للمواد الغذائية",vatNumber:"300987654300003",address:"الرياض، المملكة العربية السعودية",phone:"",email:"",logoUrl:"",crNumber:""};try{const l=JSON.parse(localStorage.getItem("idham_company")||"{}");l.name&&Object.assign(e,l)}catch{}try{const[l,r]=await Promise.all([dt(at(N,`companies/${T}/settings`,"company")),dt(at(N,`companies/${T}/settings`,"logo"))]);if(l.exists()){const u=l.data();u.cr&&!u.crNumber&&(u.crNumber=u.cr),Object.assign(e,u);const h=JSON.parse(localStorage.getItem("idham_company")||"{}");localStorage.setItem("idham_company",JSON.stringify({...h,...u,crNumber:u.crNumber||u.cr||""}))}r.exists()&&r.data().dataUrl&&(e.logoUrl=r.data().dataUrl)}catch(l){console.warn("Failed to load company settings from Firestore:",l)}let o={name:t.customerName||"—",vatNumber:"",phone:t.customerPhone||"",address:"",crNumber:"",email:""};if(t.customerId)try{const{getDoc:l,doc:r}=await z(async()=>{const{getDoc:h,doc:w}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:h,doc:w}},[]),u=await l(r(N,`companies/${T}/customers`,t.customerId));u.exists()&&(Object.assign(o,u.data()),u.data().name&&(o.name=u.data().name))}catch(l){console.warn("Failed to load customer data:",l)}function a(l,r,u,h,w){function b(E,x){const F=new TextEncoder().encode(x);return new Uint8Array([E,F.length,...F])}const i=u?new Date(u).toISOString():new Date().toISOString(),p=[b(1,l),b(2,r||""),b(3,i),b(4,String(h?.toFixed(2)||"0.00")),b(5,String(w?.toFixed(2)||"0.00"))],m=new Uint8Array(p.reduce((E,x)=>E+x.length,0));let g=0;return p.forEach(E=>{m.set(E,g),g+=E.length}),btoa(String.fromCharCode(...m))}const n=a(e.name||"مؤسسة إدهام للمواد الغذائية",e.vatNumber||e.crNumber||"",t.date,t.totalWithVat,t.totalVat)||t.zatcaQr||t.qrBase64||t.qrCodeData||t.qr,s=(t.lines||[]).map((l,r)=>{const u=parseFloat(l.qty||0),h=parseFloat(l.unitPrice||0),w=parseFloat(l.discount||0),b=u*h*(1-w/100),i=l.taxCategory==="E"||l.taxCategory==="Z"?0:15,p=b*(i/100),m=b+p;return`
      <tr>
        <td>${r+1}</td>
        <td class="desc">${l.productName||""}<br><span style="font-size:9px;color:#6b7280;">الواحدة: ${l.unit||"حبة"}</span></td>
        <td>${u}</td>
        <td class="mono">${I(h)}</td>
        <td class="mono">${I(b)}</td>
        <td>${i}%</td>
        <td class="mono">${I(p)}</td>
        <td class="mono" style="font-weight:700;">${I(m)}</td>
      </tr>`}).join(""),c=e.logoUrl||e.logoBase64||e.logo||"",v=c?`<div class="logo-circle"><img src="${c}" alt="شعار" /></div>`:'<div class="logo-circle"><div class="default-logo">🏢</div></div>',f=(()=>{const l=t.number.replace(/[^a-zA-Z0-9]/g,"");let r='<svg width="140" height="36" viewBox="0 0 140 36" xmlns="http://www.w3.org/2000/svg">',u=12,h=5381;for(let w=0;w<l.length;w++)h=(h<<5)+h+l.charCodeAt(w);r+='<rect x="'+u+'" y="2" width="2" height="20" fill="#000" />',u+=3,r+='<rect x="'+u+'" y="2" width="1" height="20" fill="#000" />',u+=2;for(let w=0;w<18;w++){const b=Math.abs(h)>>w&1?2.5:1;r+='<rect x="'+u+'" y="2" width="'+b+'" height="20" fill="#000" />',u+=b+1.5}return r+='<rect x="'+u+'" y="2" width="1" height="20" fill="#000" />',u+=2,r+='<rect x="'+u+'" y="2" width="2" height="20" fill="#000" />',r+='<text x="70" y="32" font-family="monospace" font-size="8" text-anchor="middle" fill="#000">'+t.number+"</text>",r+="</svg>",r})(),y=window.open("","_blank");y.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>فاتورة ضريبية مبسطة #${t.number}</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'IBM Plex Sans Arabic', sans-serif; direction: rtl; color: #1f2937; background: #f3f4f6; padding: 10px; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    
    .no-print { background: #1f2937; padding: 10px; display: flex; gap: 10px; justify-content: center; margin-bottom: 10px; border-radius: 8px; }
    .btn { padding: 8px 18px; font-weight: 600; border-radius: 8px; cursor: pointer; border: none; font-size: 13px; font-family: inherit; }
    
    .invoice-container { background: #fff; max-width: 210mm; margin: 0 auto; padding: 15px; border: 1.5px solid #5b3ec2; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    
    /* Top Barcode and Title */
    .top-row { display: flex; justify-content: center; align-items: center; margin-bottom: 12px; position: relative; }
    .title-box { text-align: center; }
    .title-box h1 { font-size: 22px; color: #5b3ec2; font-weight: 800; margin-bottom: 2px; }
    .title-box h2 { font-size: 10px; color: #5b3ec2; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
    
    /* Purple Company Banner */
    .company-banner { background: #5b3ec2 !important; color: #fff !important; border-radius: 8px; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .banner-left { text-align: right; font-size: 12px; font-weight: 500; line-height: 1.5; color: #fff !important; }
    .banner-left div { color: #fff !important; }
    .banner-left strong { color: #fff !important; }
    .banner-right { text-align: left; line-height: 1.4; color: #fff !important; }
    .banner-right h2 { font-size: 17px; font-weight: 800; margin-bottom: 4px; color: #fff !important; }
    .banner-right div { font-size: 12px; color: #fff !important; }
    .banner-right strong { color: #fff !important; }
    .logo-circle { width: 70px; height: 70px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 4px; border: 1.5px solid #5b3ec2; box-shadow: 0 3px 6px rgba(0,0,0,0.1); }
    .logo-circle img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .logo-circle .default-logo { font-size: 30px; }
    
    /* Info Strips */
    .info-strip { border: 1px solid #5b3ec2; border-radius: 6px; padding: 6px 12px; font-size: 10.5px; background: #fdfcff; margin-bottom: 8px; display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
    .info-strip span { color: #1f2937; }
    .info-strip strong { color: #5b3ec2; }
    
    /* Table Styling */
    .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #5b3ec2; border-radius: 8px; overflow: hidden; }
    .invoice-table thead tr { background: #5b3ec2 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .invoice-table thead th { color: #fff !important; font-size: 10.5px; font-weight: 700; padding: 8px 4px; text-align: center; border: 1px solid rgba(255,255,255,0.15); }
    .invoice-table tbody tr { border-bottom: 1px solid #5b3ec2; }
    .invoice-table tbody tr:nth-child(even) { background: #fdfcff; }
    .invoice-table tbody tr:last-child { border-bottom: none; }
    .invoice-table tbody td { padding: 8px 4px; font-size: 11px; text-align: center; border: 1px solid #e5e7eb; color: #1f2937; white-space: nowrap; }
    .invoice-table tbody td.desc { text-align: right; font-weight: 700; white-space: normal; }
    .invoice-table tbody td.mono { font-family: 'IBM Plex Mono', 'Courier New', monospace; font-weight: 500; }
    
    /* Totals section */
    .totals-section { display: flex; justify-content: space-between; align-items: stretch; gap: 15px; margin-top: 10px; }
    .left-footer-box { width: 52%; display: flex; gap: 10px; align-items: stretch; }
    .qr-wrapper { border: 1px solid #5b3ec2; border-radius: 8px; padding: 6px; background: #fff; display: flex; align-items: center; justify-content: center; width: 90px; flex-shrink: 0; }
    .notes-box { flex-grow: 1; font-size: 10.5px; color: #4b5563; border: 1px solid #5b3ec2; border-radius: 8px; padding: 10px; background: #fff; }
    .notes-box h4 { color: #5b3ec2; font-weight: 700; margin-bottom: 4px; font-size: 11px; }
    .notes-content { line-height: 1.4; color: #4b5563; }
    
    .totals-box { width: 44%; border: 1px solid #5b3ec2; border-radius: 8px; overflow: hidden; background: #fff; display: flex; flex-direction: column; justify-content: space-between; }
    .totals-row { display: flex; justify-content: space-between; padding: 7px 10px; font-size: 11px; border-bottom: 1px solid #e5e7eb; color: #4b5563; }
    .totals-row:last-child { border-bottom: none; }
    .totals-row.grand-total { background: #5b3ec2 !important; color: #fff !important; font-weight: 800; font-size: 13.5px; border-bottom: none; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .totals-row.grand-total span { color: #fff !important; }
    .totals-row span.val { font-family: 'IBM Plex Mono', 'Courier New', monospace; font-weight: 700; }
    .totals-row.discount { color: #dc2626; }
    
    .thank-you { text-align: center; padding: 10px; font-size: 11px; color: #6b7280; font-weight: 500; border-top: 1px dashed #5b3ec2; margin-top: 15px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
    
    @page {
      size: A4;
      margin: 8mm 10mm 8mm 10mm;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .no-print { display: none !important; }
      .invoice-container { max-width: 100%; box-shadow: none; border-radius: 0; border: 1px solid #5b3ec2; padding: 12px; }
      .company-banner { background: #5b3ec2 !important; color: #fff !important; }
      .invoice-table thead tr { background: #5b3ec2 !important; }
      .totals-row.grand-total { background: #5b3ec2 !important; color: #fff !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn" style="background:#5b3ec2;color:#fff;" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
    <button class="btn" style="background:#374151;color:#fff;" onclick="window.close()">✕ إغلاق</button>
  </div>

  <div class="invoice-container">
    <!-- Top Barcode and Title -->
    <div class="top-row">
      <div class="title-box">
        <h1>فاتورة ضريبية مبسطة</h1>
        <h2>SIMPLIFIED TAX INVOICE</h2>
      </div>
    </div>

    <!-- Purple Company Banner -->
    <div class="company-banner">
      <div class="banner-left">
        <div>رقم الفاتورة / Invoice No: <strong>${t.number}</strong></div>
        <div>تاريخ الفاتورة / Date: <strong>${t.date||"—"}</strong></div>
        <div>طريقة الدفع / Payment: <strong>${t.paymentMethod==="cash"?"نقدي":"آجل"}</strong></div>
      </div>
      ${v}
      <div class="banner-right">
        <h2>${e.name}</h2>
        ${e.vatNumber?`<div>الرقم الضريبي: <strong>${e.vatNumber}</strong></div>`:""}
        ${e.crNumber?`<div>السجل التجاري: <strong>${e.crNumber}</strong></div>`:""}
      </div>
    </div>

    <!-- Seller Info Strip -->
    <div class="info-strip">
      <span><strong>بيانات البائع / Seller:</strong> ${e.name}</span>
      <span><strong>الرقم الضريبي:</strong> ${e.vatNumber||"—"}</span>
      <span><strong>السجل التجاري:</strong> ${e.crNumber||"—"}</span>
      <span><strong>العنوان:</strong> ${e.address||"المملكة العربية السعودية"}</span>
    </div>

    <!-- Client Info Strip -->
    <div class="info-strip">
      <span><strong>بيانات المشتري / Client:</strong> ${o.name}</span>
      <span><strong>الرقم الضريبي:</strong> ${o.vatNumber||"—"}</span>
      <span><strong>السجل التجاري:</strong> ${o.crNumber||"—"}</span>
      <span><strong>العنوان:</strong> ${o.address||"—"}</span>
    </div>

    <!-- Items Table -->
    <table class="invoice-table">
      <thead>
        <tr>
          <th style="width:36px;">م / SR</th>
          <th>الصنف والبيان / Description</th>
          <th style="width:55px;">الكمية / Qty</th>
          <th style="width:80px;">السعر / Price</th>
          <th style="width:85px;">الخاضع / Taxable</th>
          <th style="width:55px;">النسبة / Rate</th>
          <th style="width:80px;">الضريبة / VAT</th>
          <th style="width:90px;">الإجمالي / Total</th>
        </tr>
      </thead>
      <tbody>
        ${s}
      </tbody>
    </table>

    <!-- Totals Section -->
    <div class="totals-section">
      <!-- Left Side: QR Code + Notes -->
      <div class="left-footer-box">
        <div class="qr-wrapper">
          <div id="qrcode-container"></div>
        </div>
        <div class="notes-box">
          <h4>شروط وملاحظات / Notes</h4>
          <div class="notes-content">
            ${t.notes||"شكراً لتعاملكم معنا."}
            ${t.repName?`<br><span style="font-weight:700; color:#5b3ec2;">المندوب: ${t.repName}</span>`:""}
            ${t.warehouseName?` | <span>المستودع: ${t.warehouseName}</span>`:""}
          </div>
        </div>
      </div>

      <!-- Right Side: Totals -->
      <div class="totals-box">
        <div class="totals-row"><span>المجموع الخاضع للضريبة / Taxable Amount:</span><span class="val">${I(t.subtotal||0)}</span></div>
        ${(t.discountTotal||0)>0?`<div class="totals-row discount"><span>إجمالي الخصم / Discount:</span><span class="val">- ${I(t.discountTotal)}</span></div>`:""}
        <div class="totals-row"><span>ضريبة القيمة المضافة / VAT (15%):</span><span class="val">${I(t.totalVat||0)}</span></div>
        <div class="totals-row grand-total">
          <span>الإجمالي شامل الضريبة / Grand Total:</span>
          <span class="val">${I(t.totalWithVat||0)} ر.س</span>
        </div>
        ${t.paymentMethod==="credit"||(o.balance||0)>0?`
        <div class="totals-row" style="margin-top:2px; border-top:1px dashed #d1d5db; padding-top:2px; font-size:10px; color:#6b7280;">
          <span>الرصيد السابق للعميل:</span>
          <span class="val">${I((o.balance||0)-(t.remainingAmount||0))} ر.س</span>
        </div>
        <div class="totals-row" style="font-weight:700; color:#5b3ec2; font-size:11.5px; padding-top:2px;">
          <span>إجمالي الرصيد المستحق:</span>
          <span class="val">${I(o.balance||0)} ر.س</span>
        </div>
        `:""}
      </div>
    </div>

    <!-- Thank you footer -->
    <div class="thank-you">
      <div>
        شكراً لتعاملكم معنا — ${e.name}
        ${e.phone?`| 📞 الهاتف: ${e.phone}`:""}
        ${e.email?`| ✉️ البريد: ${e.email}`:""}
      </div>
      <div style="margin-top: 5px;">
        ${f}
      </div>
    </div>
  </div>

  <script src="js/utils/qrcode.min.js"><\/script>
  <script>
    const qrData = "${n.replace(/"/g,'\\"')}";
    if (qrData) {
      try {
        new QRCode(document.getElementById("qrcode-container"), {
          text: qrData,
          width: 80,
          height: 80,
          correctLevel: QRCode.CorrectLevel.M
        });
      } catch(e) {
        document.getElementById("qrcode-container").innerHTML = '<p style="font-size:9px;color:#9ca3af;">تعذر توليد QR</p>';
      }
    }
  <\/script>
</body>
</html>`),y.document.close()};window.exportInvoices=async()=>{window.exportInvoicesExcel()};window.exportInvoicesExcel=async()=>{try{S("جاري تجهيز ملف Excel…","info");const e=(await R(D.salesInvoices(),[J("createdAt","desc")])).map(o=>[o.number||"",o.date||"",o.customerName||"",o.repName||"",o.paymentMethod||"",o.subtotal||0,o.discountTotal||0,o.totalVat||0,o.totalWithVat||0,o.status||"",o.notes||""]);await se({title:"فواتير_المبيعات",headers:["رقم الفاتورة","التاريخ","العميل","المندوب","طريقة الدفع","المجموع قبل الخصم","إجمالي الخصم","ضريبة 15%","الإجمالي شامل الضريبة","الحالة","ملاحظات"],rows:e,colWidths:[18,14,26,18,14,16,16,14,18,12,28]}),S(`تم تصدير ${e.length} فاتورة ✅`,"success")}catch(t){S("خطأ: "+t.message,"error")}};window.editInvoice=async t=>{try{const e=await It("salesInvoices",t);if(!e){S("لم يتم العثور على الفاتورة","error");return}window._editingInvoiceId=t,document.getElementById("inv-number").value=e.number,document.getElementById("customer-search").value=e.customerName||"",document.getElementById("customer-id").value=e.customerId||"",document.getElementById("inv-date").value=e.date||"",document.getElementById("inv-payment").value=e.paymentMethod||"credit",document.getElementById("inv-paid-amount").value=e.paidAmount||"",document.getElementById("inv-notes").value=e.notes||"",document.getElementById("inv-type").value=e.invoiceType||"B2C",V=e.customerId?{id:e.customerId,name:e.customerName,type:e.customerType||"retail"}:null,await kt(),document.getElementById("inv-rep").value=e.repId||"",await Tt(),document.getElementById("inv-warehouse").value=e.warehouseId||"",await Ht();const o=document.getElementById("inv-cost-center");o&&(o.value=e.costCenterId||"",o.value||window.autoSelectCostCenter()),k=(e.lines||[]).map(n=>({productId:n.productId,productName:n.productName,qty:n.qty||1,unit:n.unit||"PCS",unitCode:n.unitCode||"PCE",unitPrice:n.unitPrice||n.price||0,discount:n.discount||0,taxCategory:n.taxCategory||"S",sku:n.sku||"",costPrice:n.costPrice||0})),ot(),ut(),Nt(),Lt();const a=document.getElementById("save-inv-btn");a&&(a.textContent="💾 تحديث الفاتورة"),openModal("new-invoice-modal")}catch(e){S(e.message,"error")}};window.deleteInvoice=async(t,e)=>{if(await showConfirm(`هل أنت متأكد من حذف الفاتورة "${e}" نهائياً؟`,"تأكيد حذف الفاتورة"))try{const o=await It("salesInvoices",t);if(!o)throw new Error("لم يتم العثور على الفاتورة");if(await Jt(o),o.lines&&o.warehouseId&&o.status!=="cancelled")for(const s of o.lines)try{await wt(o.warehouseId,s.productId,s.qty,{type:"sale_reverse",refId:o.number,documentNumber:o.number,invoiceNumber:o.number,notes:`حذف الفاتورة ${o.number}`})}catch(c){console.warn("Stock reversal skipped for line:",s.productId,c.message)}const a=o.invoiceNumber||o.number||t,n=["salesInvoice","sales","salesCOGS"];for(const s of n)try{const c=await Q(X(tt(N,`companies/${T}/journalEntries`),M("sourceType","==",s),M("sourceId","==",a)));for(const v of c.docs)await nt(v.id),console.log(`[deleteInvoice] Deleted JE ${v.id} (${s}) for ${a}`);if(a!==t){const v=await Q(X(tt(N,`companies/${T}/journalEntries`),M("sourceType","==",s),M("sourceId","==",t)));for(const f of v.docs)await nt(f.id),console.log(`[deleteInvoice] Deleted JE ${f.id} (${s}) for raw id ${t}`)}}catch(c){console.warn(`[deleteInvoice] JE cleanup (${s}) skipped:`,c.message)}if(o.journalEntryId)try{await nt(o.journalEntryId)}catch{}if(await Ot("salesInvoices",t),o.customerId){const{recalculateCustomerBalance:s}=await z(async()=>{const{recalculateCustomerBalance:c}=await import("./balance-sync-B0nwXHmR.js");return{recalculateCustomerBalance:c}},__vite__mapDeps([2,0,1,3]));await s(o.customerId)}S(`✅ تم حذف الفاتورة ${e} بنجاح`,"success"),loadInvoicesList()}catch(o){S("خطأ في الحذف: "+o.message,"error"),console.error("deleteInvoice error:",o)}};window.openSalesInvoiceFromPurchase=async t=>{await Wt(),k=[];for(const a of t.items||[]){const n=vt.find(c=>c.id===a.productId);let s=0;n?(s=n.salePrice||n.priceRetail||0,s||(s=(n.purchasePrice||n.costPrice||n.averageCost||0)*1.1*1.15)):s=a.unitPrice*1.1*1.15,k.push({productId:a.productId,productName:a.productName,sku:a.sku||"",unit:a.unit||"PCS",qty:a.qty||0,unitPrice:parseFloat(s)||0,discount:0,taxCategory:"S"})}V=null,window._editingInvoiceId=null;const e=document.getElementById("save-inv-btn");e&&(e.textContent="💾 حفظ وإصدار الفاتورة"),document.getElementById("inv-number").value="جارٍ التوليد…",document.getElementById("customer-search").value="",document.getElementById("customer-id").value="",document.getElementById("inv-date").value=et(),document.getElementById("inv-payment").value="credit",document.getElementById("inv-paid-amount").value="",document.getElementById("credit-status-bar").classList.add("hidden"),document.getElementById("inv-form-error").classList.add("hidden"),Nt(),Lt();const o=document.getElementById("inv-warehouse");o&&t.warehouseId&&(o.value=t.warehouseId),ot(),ut(),setTimeout(()=>{const a=document.getElementById("inv-notes");a&&(a.value=`محولة من فاتورة مشتريات رقم ${t.purchaseNumber||""}`)},300),openModal("new-invoice-modal"),kt(),Tt(),Ht();try{const a=await jt("INV");document.getElementById("inv-number").value=a}catch{}};export{$e as render};
