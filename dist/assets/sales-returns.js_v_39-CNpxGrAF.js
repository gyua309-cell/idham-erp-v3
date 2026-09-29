const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/balance-sync-C_YRmGhd.js","assets/index-_yt5fKo2.js","assets/index-Dq7oGj9k.css"])))=>i.map(i=>d[i]);
import{s as J,t as T,a as $,g as A,q as G,f as g,b as F,d as R,C as k,J as O,z as K,o as X,x as tt,_ as L,O as et}from"./index-_yt5fKo2.js";import{autoSalesReturnJE as ot}from"./accounting-engine-YVsNezXc.js";import{e as nt}from"./excel-zCoXiaxq.js";import{query as D,orderBy as S,limit as U,getDocs as j,where as W,doc as at,getDoc as st}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let y=[],l=null,B=[],E=[],V=[],M=[],_=[];async function vt(e,t){const o=J(),s=T();e.innerHTML=`
    <!-- Top Action & Filter Bar -->
    <div class="filterbar no-print" style="flex-wrap:wrap; gap:10px; align-items:flex-end; background:var(--bg-1); padding:14px 18px; border-radius:12px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); margin-bottom:16px;">
      
      <!-- Date Filter -->
      <div class="date-range-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">من</label>
        <input type="date" id="sr-from" value="${o}" style="padding:6px 10px; border:1px solid var(--border); border-radius:6px; background:var(--bg-card); color:var(--text-1); font-size:12.5px;" />
      </div>
      <div class="date-range-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">إلى</label>
        <input type="date" id="sr-to" value="${s}" style="padding:6px 10px; border:1px solid var(--border); border-radius:6px; background:var(--bg-card); color:var(--text-1); font-size:12.5px;" />
      </div>

      <!-- Quick Date Presets -->
      <div style="display:flex; gap:4px; align-items:center;">
        <button class="btn btn-sm btn-ghost" onclick="setSRDatePreset('today')" style="font-size:11px; padding:5px 8px;">اليوم</button>
        <button class="btn btn-sm btn-ghost" onclick="setSRDatePreset('thisMonth')" style="font-size:11px; padding:5px 8px;">هذا الشهر</button>
        <button class="btn btn-sm btn-ghost" onclick="setSRDatePreset('lastMonth')" style="font-size:11px; padding:5px 8px;">الشهر السابق</button>
        <button class="btn btn-sm btn-ghost" onclick="setSRDatePreset('all')" style="font-size:11px; padding:5px 8px;">الكل</button>
      </div>

      <!-- Customer Filter -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">العميل</label>
        <select id="sr-customer-filter" onchange="applySRFilters()" style="min-width:160px; padding:6px 10px; border:1px solid var(--border); border-radius:6px; background:var(--bg-card); color:var(--text-1); font-size:12px;">
          <option value="">كل العملاء</option>
        </select>
      </div>

      <!-- Warehouse Filter -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">المستودع / السيارة</label>
        <select id="sr-warehouse-filter" onchange="applySRFilters()" style="min-width:150px; padding:6px 10px; border:1px solid var(--border); border-radius:6px; background:var(--bg-card); color:var(--text-1); font-size:12px;">
          <option value="">كل المستودعات</option>
        </select>
      </div>

      <!-- Rep Filter -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">المندوب</label>
        <select id="sr-rep-filter" onchange="applySRFilters()" style="min-width:130px; padding:6px 10px; border:1px solid var(--border); border-radius:6px; background:var(--bg-card); color:var(--text-1); font-size:12px;">
          <option value="">كل المناديب</option>
        </select>
      </div>

      <!-- Search Input -->
      <div style="flex:1; min-width:180px;">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">بحث سريع</label>
        <input type="text" id="sr-search-input" placeholder="رقم الإشعار، الفاتورة، العميل..." oninput="applySRFilters()" style="width:100%; padding:6px 12px; border:1px solid var(--border); border-radius:6px; background:var(--bg-card); color:var(--text-1); font-size:12px;" />
      </div>

      <!-- Action Buttons -->
      <div style="margin-right:auto; display:flex; gap:8px; align-items:center;">
        <button class="btn btn-secondary btn-sm" onclick="exportSRExcel()" style="font-weight:700; display:inline-flex; align-items:center; gap:6px;">
          <span>📊</span> Excel
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.print()" style="font-weight:700; display:inline-flex; align-items:center; gap:6px;">
          <span>🖨️</span> طباعة
        </button>
        <button class="btn btn-primary btn-sm" onclick="openSalesReturnModal()" style="font-weight:800; background:linear-gradient(135deg,#dc2626,#b91c1c); border:none; box-shadow:0 2px 6px rgba(220,38,38,0.3); display:inline-flex; align-items:center; gap:6px;">
          <span>+</span> مردود مبيعات جديد (إشعار دائن)
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="page-content" style="padding:0 4px;">
      
      <!-- Top Title Header -->
      <div class="page-header" style="margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h1 class="page-title" style="font-size:20px; font-weight:900; color:var(--text-1); margin-bottom:2px;">
            ↩️ مردودات المبيعات والإشعارات الدائنة (Credit Notes)
          </h1>
          <p class="page-subtitle" style="font-size:12px; color:var(--text-3);">
            إرجاع البضائع للمخازن والسيارات وإصدار إشعارات دائنة معتمدة ومتوافقة مع هيئة الزكاة والضريبة والجمارك (ZATCA)
          </p>
        </div>
      </div>

      <!-- ═══ KPI SUMMARY CARDS ═══ -->
      <div class="grid-4 gap-16 mb-20" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-bottom:18px;">
        
        <!-- Total Returns Count -->
        <div class="card" style="background:linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02)); border:1.5px solid rgba(239,68,68,0.25); border-radius:12px; padding:14px 16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-size:12px; font-weight:800; color:#b91c1c;">📋 عدد الإشعارات الدائنة</span>
            <span style="font-size:18px;">📑</span>
          </div>
          <div style="font-size:22px; font-weight:900; color:#b91c1c; font-family:'IBM Plex Mono', monospace;" id="kpi-sr-count">
            0
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:2px;">إجمالي الإشعارات بالفترة المحددة</div>
        </div>

        <!-- Subtotal Before VAT -->
        <div class="card" style="background:linear-gradient(135deg, rgba(217,119,6,0.08), rgba(217,119,6,0.02)); border:1.5px solid rgba(217,119,6,0.25); border-radius:12px; padding:14px 16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-size:12px; font-weight:800; color:#b45309;">💰 إجمالي المردود (قبل الضريبة)</span>
            <span style="font-size:18px;">🏷️</span>
          </div>
          <div style="font-size:22px; font-weight:900; color:#b45309; font-family:'IBM Plex Mono', monospace;" id="kpi-sr-subtotal">
            0.00 ر.س
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:2px;">قيمة البضاعة المرجعة الصافية</div>
        </div>

        <!-- VAT 15% -->
        <div class="card" style="background:linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02)); border:1.5px solid rgba(99,102,241,0.25); border-radius:12px; padding:14px 16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-size:12px; font-weight:800; color:#4338ca;">🏛️ ضريبة القيمة المضافة (15%)</span>
            <span style="font-size:18px;">📊</span>
          </div>
          <div style="font-size:22px; font-weight:900; color:#4338ca; font-family:'IBM Plex Mono', monospace;" id="kpi-sr-vat">
            0.00 ر.س
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:2px;">الضريبة المستردة لصالح العميل</div>
        </div>

        <!-- Total with VAT -->
        <div class="card" style="background:linear-gradient(135deg, rgba(220,38,38,0.12), rgba(220,38,38,0.03)); border:1.5px solid #dc2626; border-radius:12px; padding:14px 16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-size:12px; font-weight:800; color:#991b1b;">💵 الصافي الإجمالي (شامل الضريبة)</span>
            <span style="font-size:18px;">💳</span>
          </div>
          <div style="font-size:22px; font-weight:900; color:#991b1b; font-family:'IBM Plex Mono', monospace;" id="kpi-sr-grand">
            0.00 ر.س
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:2px;">المبلغ الإجمالي المخصوم من رصيد العميل</div>
        </div>

      </div>

      <!-- Main Table Card -->
      <div class="card" style="border-radius:14px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); overflow:hidden;">
        <div class="table-container">
          <table class="data-dense" style="width:100%;">
            <thead>
              <tr style="background:var(--bg-2); border-bottom:1.5px solid var(--border-soft);">
                <th style="width:120px;">رقم الإشعار</th>
                <th style="width:95px;">التاريخ</th>
                <th style="width:120px;">الفاتورة الأصلية</th>
                <th>العميل</th>
                <th style="width:140px;">المستودع / السيارة</th>
                <th style="width:110px;">المندوب</th>
                <th style="text-align:left; width:110px;">المبلغ قبل الضريبة</th>
                <th style="text-align:left; width:100px;">الضريبة 15%</th>
                <th style="text-align:left; width:120px;">الإجمالي شامل</th>
                <th style="text-align:center; width:90px;">ZATCA</th>
                <th style="text-align:center; width:140px;">إجراءات / طباعة</th>
              </tr>
            </thead>
            <tbody id="sr-tbody">
              ${Array(6).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(11).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*70|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Sales Return Creation Modal -->
    <div class="modal-overlay" id="sr-modal">
      <div class="modal modal-xl" style="max-width:960px;">
        <div class="modal-header" style="background:linear-gradient(135deg, #991b1b, #7f1d1d); color:#fff; padding:14px 20px;">
          <h3 class="modal-title" style="color:#fff; font-size:16px; font-weight:800;">↩️ إصدار إشعار دائن جديد (مردود مبيعات)</h3>
          <button class="modal-close" onclick="closeModal('sr-modal')" style="color:#fff;">×</button>
        </div>
        <div class="modal-body" style="padding:20px;">
          
          <div class="grid-3 gap-16 mb-16" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:14px; margin-bottom:14px;">
            <div class="form-group">
              <label style="font-weight:700; font-size:12px;">رقم الفاتورة الأصلية *</label>
              <div class="autocomplete-container" style="position:relative;">
                <input type="text" id="sr-inv-search" class="input mono" placeholder="ابحث برقم الفاتورة أو العميل..." autocomplete="off" style="font-weight:700;" />
                <div class="autocomplete-results hidden" id="sr-inv-results" style="position:absolute; top:100%; left:0; right:0; z-index:100; max-height:220px; overflow-y:auto; background:var(--bg-card); border:1px solid var(--border); border-radius:8px; box-shadow:var(--shadow-md);"></div>
              </div>
            </div>
            <div class="form-group">
              <label style="font-weight:700; font-size:12px;">رقم الإشعار الدائن</label>
              <input type="text" id="sr-number" class="input mono" readonly placeholder="يُولّد تلقائياً..." style="background:var(--bg-2); font-weight:800; color:#b91c1c;" />
            </div>
            <div class="form-group">
              <label style="font-weight:700; font-size:12px;">تاريخ الإرجاع *</label>
              <input type="date" id="sr-date" class="input" value="${T()}" style="font-weight:700;" />
            </div>
          </div>

          <div class="grid-3 gap-16 mb-16" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:14px; margin-bottom:14px;">
            <div class="form-group">
              <label style="font-weight:700; font-size:12px;">العميل</label>
              <input type="text" id="sr-cust-name" class="input" readonly placeholder="يتم تحديده تلقائياً من الفاتورة" style="background:var(--bg-2); font-weight:700;" />
            </div>
            <div class="form-group">
              <label style="font-weight:700; font-size:12px;">المخزن المستلم للبضاعة المرجعة *</label>
              <select id="sr-warehouse" style="font-weight:700;"><option value="">اختر المخزن المستلم</option></select>
            </div>
            <div class="form-group">
              <label style="font-weight:700; font-size:12px;">المندوب</label>
              <input type="text" id="sr-rep-name" class="input" readonly placeholder="مندوب الفاتورة" style="background:var(--bg-2);" />
            </div>
          </div>

          <div class="form-group mb-16" style="margin-bottom:14px;">
            <label style="font-weight:700; font-size:12px;">سبب الإرجاع *</label>
            <input type="text" id="sr-reason" class="input" placeholder="مثال: تلف بالعبوة، زيادة بالطلب، انتهاء صلاحية، خطأ بالطلب..." />
          </div>

          <div class="divider-label" style="font-weight:800; font-size:13px; color:var(--text-1); border-bottom:2px solid #b91c1c; padding-bottom:4px; margin-bottom:10px;">
            📦 أصناف وبنود الفاتورة المرجعة
          </div>

          <div class="invoice-lines" style="border:1px solid var(--border-soft); border-radius:8px; overflow:hidden; margin-bottom:14px;">
            <table style="width:100%; font-size:12.5px; border-collapse:collapse;">
              <thead>
                <tr style="background:var(--bg-2); border-bottom:1px solid var(--border-soft);">
                  <th style="padding:8px 10px; width:30px;">#</th>
                  <th style="padding:8px 10px;">اسم الصنف</th>
                  <th style="padding:8px 10px; width:90px; text-align:center;">الكمية الأصلية</th>
                  <th style="padding:8px 10px; width:130px; text-align:center;">الكمية المرجعة</th>
                  <th style="padding:8px 10px; width:110px; text-align:left;">السعر (قبل الضريبة)</th>
                  <th style="padding:8px 10px; width:100px; text-align:left;">الضريبة (15%)</th>
                  <th style="padding:8px 10px; width:120px; text-align:left;">الإجمالي شامل الضريبة</th>
                </tr>
              </thead>
              <tbody id="sr-lines-tbody">
                <tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-3);">حدد الفاتورة الأصلية أولاً من خانة البحث بالأعلى</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Bottom Totals & Info -->
          <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:12px;">
            <div style="font-size:12px; color:var(--text-2); background:rgba(220,38,38,0.06); padding:10px 14px; border-radius:8px; border:1px solid rgba(220,38,38,0.2); max-width:440px;">
              💡 <strong>إشعار دائن ضريبي معتمد (ZATCA):</strong> يتم إرجاع الكميات للمخزن المختار، وتخفيض مبيعات الفترة والضريبة المستحقة، وتخفيض مديونية العميل بالقيمة الإجمالية شاملة الضريبة.
            </div>
            <div class="invoice-totals" style="width:320px; background:var(--bg-2); padding:12px 16px; border-radius:10px; border:1px solid var(--border-soft);">
              <div class="invoice-total-row" style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span>المجموع قبل الضريبة:</span>
                <span class="mono font-bold" id="sr-subtotal">0.00 ر.س</span>
              </div>
              <div class="invoice-total-row" style="display:flex; justify-content:space-between; margin-bottom:6px; color:#d97706;">
                <span>ضريبة القيمة المضافة (15%):</span>
                <span class="mono font-bold" id="sr-vat">0.00 ر.س</span>
              </div>
              <div class="invoice-total-row grand-total" style="display:flex; justify-content:space-between; padding-top:8px; border-top:1.5px solid var(--border); font-size:14px; font-weight:900; color:#dc2626;">
                <span>إجمالي الإشعار (شامل الضريبة):</span>
                <span class="mono" id="sr-grand">0.00 ر.س</span>
              </div>
            </div>
          </div>

          <div id="sr-error" class="alert bad hidden" style="margin-top:12px;"></div>
        </div>
        <div class="modal-footer" style="padding:14px 20px; background:var(--bg-2); border-top:1px solid var(--border-soft); display:flex; justify-content:flex-end; gap:10px;">
          <button class="btn btn-ghost" onclick="closeModal('sr-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveSalesReturn()" id="save-sr-btn" style="background:#dc2626; font-weight:800;">
            💾 حفظ واعتماد الإشعار الدائن
          </button>
        </div>
      </div>
    </div>
  `,document.getElementById("sr-from")?.addEventListener("change",()=>z()),document.getElementById("sr-to")?.addEventListener("change",()=>z()),await Promise.all([it(),rt(),dt()]),await z(),lt()}window.setSRDatePreset=e=>{const t=document.getElementById("sr-from"),o=document.getElementById("sr-to");if(!t||!o)return;const s=new Date,r=n=>String(n).padStart(2,"0"),i=n=>`${n.getFullYear()}-${r(n.getMonth()+1)}-${r(n.getDate())}`;if(e==="today")t.value=i(s),o.value=i(s);else if(e==="thisMonth")t.value=`${s.getFullYear()}-${r(s.getMonth()+1)}-01`,o.value=i(s);else if(e==="lastMonth"){const n=new Date(s.getFullYear(),s.getMonth()-1,1),d=new Date(s.getFullYear(),s.getMonth(),0);t.value=i(n),o.value=i(d)}else e==="all"&&(t.value="2026-01-01",o.value=i(s));z()};async function it(){try{V=await A($.customers(),[S("name")]);const e=document.getElementById("sr-customer-filter");e&&(e.innerHTML='<option value="">كل العملاء</option>'+V.map(t=>`<option value="${t.id}">${t.name}</option>`).join(""))}catch{}}async function rt(){try{M=await A($.warehouses(),[S("name")]);const e=document.getElementById("sr-warehouse");e&&(e.innerHTML='<option value="">اختر المخزن المستلم</option>'+M.map(o=>`<option value="${o.id}" data-name="${o.name}">${o.name}</option>`).join(""));const t=document.getElementById("sr-warehouse-filter");t&&(t.innerHTML='<option value="">كل المستودعات والسيارات</option>'+M.map(o=>`<option value="${o.id}">${o.name}</option>`).join(""))}catch{}}async function dt(){try{_=await A($.users(),[W("role","==","rep")]);const e=document.getElementById("sr-rep-filter");e&&(e.innerHTML='<option value="">كل المناديب</option>'+_.map(t=>`<option value="${t.name||t.id}">${t.name||t.id}</option>`).join(""))}catch{}}async function z(){const e=document.getElementById("sr-tbody");if(e){e.innerHTML=`${Array(6).fill(0).map(()=>`
    <tr class="skeleton-row">
      ${Array(11).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*70|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
    </tr>
  `).join("")}`;try{const t=D($.salesReturns(),S("date","desc"),U(250));let s=(await j(t)).docs.map(r=>({id:r.id,...r.data()}));s.sort((r,i)=>{const n=r.date||(r.createdAt?.toDate?r.createdAt.toDate().toISOString():"")||"";return(i.date||(i.createdAt?.toDate?i.createdAt.toDate().toISOString():"")||"").localeCompare(n)}),B=s,applySRFilters()}catch(t){e.innerHTML=`<tr><td colspan="11"><div class="alert bad" style="margin:8px;">${t.message}</div></td></tr>`}}}window.applySRFilters=()=>{const e=document.getElementById("sr-tbody");if(!e)return;let t=[...B];const o=document.getElementById("sr-from")?.value,s=document.getElementById("sr-to")?.value;(o||s)&&(t=t.filter(a=>{const b=a.date||(a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:"");return(!o||b>=o)&&(!s||b<=s)}));const r=document.getElementById("sr-customer-filter")?.value;r&&(t=t.filter(a=>a.customerId===r));const i=document.getElementById("sr-warehouse-filter")?.value;i&&(t=t.filter(a=>a.warehouseId===i));const n=document.getElementById("sr-rep-filter")?.value;n&&(t=t.filter(a=>(a.repName||"")===n||(a.repId||"")===n));const d=document.getElementById("sr-search-input")?.value?.trim().toLowerCase();d&&(t=t.filter(a=>{const b=(a.number||a.creditNoteNumber||a.id||"").toLowerCase(),w=(a.originalInvoiceNumber||a.refInvoice||"").toLowerCase(),v=(a.customerName||"").toLowerCase(),I=(a.warehouseName||"").toLowerCase(),N=(a.repName||"").toLowerCase();return b.includes(d)||w.includes(d)||v.includes(d)||I.includes(d)||N.includes(d)})),E=t;let u=0,x=0,f=0;t.forEach(a=>{const b=parseFloat(a.subtotal||0),w=parseFloat(a.totalVat!==void 0?a.totalVat:a.vatAmount!==void 0?a.vatAmount:b*.15),v=parseFloat(a.totalWithVat!==void 0?a.totalWithVat:a.total!==void 0?a.total:b+w);u+=b,x+=w,f+=v});const m=document.getElementById("kpi-sr-count"),c=document.getElementById("kpi-sr-subtotal"),p=document.getElementById("kpi-sr-vat"),h=document.getElementById("kpi-sr-grand");if(m&&(m.textContent=t.length),c&&(c.textContent=g(u)),p&&(p.textContent=g(x)),h&&(h.textContent=g(f)),t.length===0){e.innerHTML='<tr><td colspan="11" style="text-align:center; padding:32px; color:var(--text-3); font-weight:700;">لا توجد مردودات مبيعات تطابق الفلاتر المحددة</td></tr>';return}e.innerHTML=t.map(a=>{const b=a.number||a.creditNoteNumber||a.id||"—",w=a.originalInvoiceNumber||a.refInvoice||"—",v=parseFloat(a.subtotal||0),I=parseFloat(a.totalVat!==void 0?a.totalVat:a.vatAmount!==void 0?a.vatAmount:v*.15),N=parseFloat(a.totalWithVat!==void 0?a.totalWithVat:a.total!==void 0?a.total:v+I),C=a.date||(a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:"");return`
    <tr style="border-bottom:1px solid var(--border-soft);">
      <td class="mono font-bold" style="color:#b91c1c;">${b}</td>
      <td class="dim" style="font-size:12px;">${F(C)}</td>
      <td class="mono font-bold text-indigo" style="font-size:12px;">${w}</td>
      <td class="font-bold" style="color:var(--text-1);">${a.customerName||"عميل نقدي"}</td>
      <td class="dim" style="font-size:12px;">${a.warehouseName||"—"}</td>
      <td style="font-size:12px; color:var(--text-2);">${a.repName||"—"}</td>
      <td class="mono font-bold" style="text-align:left;" dir="ltr">${g(v)}</td>
      <td class="mono font-bold text-warn" style="text-align:left;" dir="ltr">${g(I)}</td>
      <td class="mono font-bold" style="text-align:left; color:#b91c1c; font-size:13.5px;" dir="ltr">${g(N)}</td>
      <td style="text-align:center;"><span class="zatca-stamp reported" style="font-size:10px; padding:2px 6px;">✓ ZATCA</span></td>
      <td style="text-align:center; white-space:nowrap;">
        <button class="btn btn-sm btn-ghost" onclick="printSalesReturn('${a.id}')" title="طباعة إشعار دائن A4 رسمي" style="font-weight:700; color:#b91c1c; padding:4px 8px;">
          📄 A4
        </button>
        <button class="btn btn-sm btn-ghost" onclick="printSalesReturnThermal('${a.id}')" title="طباعة إشعار دائن حراري 80mm" style="font-weight:700; color:var(--text-2); padding:4px 8px;">
          🧾 حراري
        </button>
      </td>
    </tr>`}).join("")};window.exportSRExcel=()=>{if(!E||E.length===0){showToast("لا توجد بيانات لتصديرها","warn");return}const e=[];e.push(["تقرير مردودات المبيعات والإشعارات الدائنة — شركة نظم الإمداد الحديثة"]),e.push([`تاريخ التصدير: ${T()}`]),e.push([]),e.push(["رقم الإشعار الدائن","التاريخ","الفاتورة الأصلية","اسم العميل","المستودع / المخزن","المندوب","المبلغ قبل الضريبة (ر.س)","ضريبة القيمة المضافة 15% (ر.س)","الإجمالي شامل الضريبة (ر.س)","سبب الإرجاع","حالة ZATCA"]),E.forEach(t=>{const o=parseFloat(t.subtotal||0),s=parseFloat(t.totalVat!==void 0?t.totalVat:t.vatAmount!==void 0?t.vatAmount:o*.15),r=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total!==void 0?t.total:o+s);e.push([t.number||t.creditNoteNumber||t.id,t.date||"",t.originalInvoiceNumber||t.refInvoice||"",t.customerName||"عميل نقدي",t.warehouseName||"",t.repName||"",o,s,r,t.reason||"","معتمد ZATCA"])}),nt(e,`مردودات_المبيعات_${T()}`)};function lt(){const e=document.getElementById("sr-inv-search"),t=document.getElementById("sr-inv-results");e&&e.addEventListener("input",G(async()=>{const o=e.value.trim().toLowerCase();if(!o){t.classList.add("hidden");return}const s=D($.salesInvoices(),S("date","desc"),U(150)),i=(await j(s)).docs.map(n=>({id:n.id,...n.data()})).filter(n=>(n.number||n.invoiceNumber||"").toLowerCase().includes(o)||(n.customerName||"").toLowerCase().includes(o));if(i.length===0){t.classList.add("hidden");return}t.innerHTML=i.slice(0,8).map(n=>`
      <div class="autocomplete-item" onclick="selectOriginalInvoice('${n.id}')" style="padding:8px 12px; cursor:pointer; border-bottom:1px solid var(--border-soft);">
        <div style="display:flex; justify-content:space-between; font-weight:700;">
          <span style="color:#2563eb;">${n.number||n.invoiceNumber}</span>
          <span class="mono">${g(n.totalWithVat||n.total||0)}</span>
        </div>
        <div style="font-size:11px; color:var(--text-3);">${n.customerName} | ${F(n.date||n.createdAt)}</div>
      </div>`).join(""),t.classList.remove("hidden")},300))}window.selectOriginalInvoice=async e=>{try{const t=at(R,`companies/${k}/salesInvoices`,e),o=await st(t);if(!o.exists())return;if(l={id:o.id,...o.data()},document.getElementById("sr-inv-search").value=l.number||l.invoiceNumber||o.id,document.getElementById("sr-cust-name").value=l.customerName||"عميل نقدي",document.getElementById("sr-rep-name").value=l.repName||"—",document.getElementById("sr-inv-results").classList.add("hidden"),l.warehouseId){const n=document.getElementById("sr-warehouse");n&&(n.value=l.warehouseId)}const s={},r=D($.salesReturns(),W("originalInvoiceId","==",l.id));(await j(r)).docs.forEach(n=>{const d=n.data();d.status!=="cancelled"&&(d.lines||[]).forEach(u=>{s[u.productId]=(s[u.productId]||0)+(u.qty||0)})}),y=(l.lines||[]).map(n=>{const d=s[n.productId]||0,u=Math.max(0,(n.qty||0)-d);return{...n,originalQty:n.qty,alreadyReturned:d,maxReturnable:u,qty:0}}),P(),q()}catch(t){showToast(t.message,"error")}};function P(){const e=document.getElementById("sr-lines-tbody");if(e){if(y.length===0){e.innerHTML='<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-3);">لا توجد أصناف في هذه الفاتورة</td></tr>';return}e.innerHTML=y.map((t,o)=>{const s=parseFloat(t.unitPrice!==void 0?t.unitPrice:t.price!==void 0?t.price:0)||0,r=t.qty*s*(1-(t.discount||0)/100),i=r*.15,n=r+i,d=s*(1-(t.discount||0)/100)*1.15;return`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td style="padding:6px 10px; text-align:center;">${o+1}</td>
        <td style="padding:6px 10px; font-weight:700; color:var(--text-1);">${t.productName||t.name}</td>
        <td style="padding:6px 10px; text-align:center;" class="mono dim">${t.originalQty}</td>
        <td style="padding:6px 10px; width:130px; text-align:center;">
          <input type="number" class="input mono font-bold text-warn" style="width:85px; height:32px; font-size:12.5px; text-align:center;"
            value="${t.qty}" min="0" max="${t.maxReturnable}" step="0.001"
            onchange="updateReturnQty(${o}, this.value)" />
          <div style="font-size:9.5px; color:var(--text-3); margin-top:2px;">المتاح: ${t.maxReturnable} (سابق: ${t.alreadyReturned})</div>
        </td>
        <td style="padding:6px 10px; text-align:left;" class="mono" dir="ltr">
          ${g(s)}
          <div style="font-size:9.5px; color:var(--text-3);">${g(d)} شامل</div>
        </td>
        <td style="padding:6px 10px; text-align:left;" class="mono text-warn" dir="ltr">${g(i)}</td>
        <td style="padding:6px 10px; text-align:left;" class="mono font-bold text-good" dir="ltr">${g(n)}</td>
      </tr>`}).join("")}}window.updateReturnQty=(e,t)=>{const o=parseFloat(t)||0;o>y[e].maxReturnable?(showToast(`الكمية المرجعة لا يمكن أن تزيد عن الكمية المتاحة للإرجاع (${y[e].maxReturnable})`,"warning"),y[e].qty=y[e].maxReturnable):o<0?y[e].qty=0:y[e].qty=o,P(),q()};function q(){const e=y.filter(i=>i.qty>0),t=O(e),o=document.getElementById("sr-subtotal"),s=document.getElementById("sr-vat"),r=document.getElementById("sr-grand");o&&(o.textContent=g(t.subtotal)),s&&(s.textContent=g(t.vatTotal)),r&&(r.textContent=g(t.grandTotal))}window.openSalesReturnModal=()=>{y=[],l=null;const e=document.getElementById("sr-inv-search"),t=document.getElementById("sr-cust-name"),o=document.getElementById("sr-reason"),s=document.getElementById("sr-rep-name"),r=document.getElementById("sr-number"),i=document.getElementById("sr-error");e&&(e.value=""),t&&(t.value=""),o&&(o.value=""),s&&(s.value=""),i&&i.classList.add("hidden"),r&&(r.value="جارِ التوليد..."),P(),q(),openModal("sr-modal"),K("CN").then(n=>{r&&(r.value=n)}).catch(()=>{})};window.saveSalesReturn=async()=>{const e=document.getElementById("sr-error");if(e.classList.add("hidden"),!l){e.textContent="يرجى اختيار الفاتورة الأصلية أولاً",e.classList.remove("hidden");return}const t=y.filter(d=>d.qty>0);if(t.length===0){e.textContent="حدد كمية مرجعة لصنف واحد على الأقل",e.classList.remove("hidden");return}const o=document.getElementById("sr-warehouse"),s=o.value,r=o.options[o.selectedIndex]?.dataset.name||o.options[o.selectedIndex]?.text||"",i=document.getElementById("sr-reason").value.trim();if(!s){e.textContent="يرجى اختيار المخزن المستلم للبضاعة المرجعة",e.classList.remove("hidden");return}if(!i){e.textContent="يرجى إدخال سبب الإرجاع",e.classList.remove("hidden");return}const n=document.getElementById("save-sr-btn");n.disabled=!0;try{const d=O(t),u=document.getElementById("sr-number").value,x=document.getElementById("sr-date").value||T(),f={number:u,creditNoteNumber:u,date:x,originalInvoiceId:l.id,originalInvoiceNumber:l.number||l.invoiceNumber,customerId:l.customerId,customerName:l.customerName,repId:l.repId||l.salesRepId||null,repName:l.repName||"",warehouseId:s,warehouseName:r,lines:t,subtotal:d.subtotal,totalVat:d.vatTotal,vatAmount:d.vatTotal,totalWithVat:d.grandTotal,total:d.grandTotal,reason:i,status:"posted",zatcaStatus:"reported",createdAt:new Date},m=await X($.salesReturns(),f);for(const c of t)await tt(s,c.productId,+c.qty,{type:"return_in",sourceType:"salesReturn",sourceId:m,documentNumber:u,invoiceNumber:u});try{const c=await A($.warehouses()),p=t.reduce((h,a)=>h+(a.costPrice||a.purchasePrice||a.averageCost||0)*(a.qty||0),0);await ot({id:m,returnNumber:u,date:x,customerId:l.customerId||null,repId:l.repId||l.salesRepId||null,customerName:l.customerName,customerType:l.customerType||"retail",paymentMethod:l.paymentMethod||"credit",subtotal:d.subtotal,taxAmount:d.vatTotal,total:d.grandTotal,totalCost:p,warehouseId:s},{},c)}catch(c){console.warn("[AccountingEngine] Sales Return JE failed:",c.message)}if(l.customerId&&d.grandTotal>0)try{const{increment:c,updateDoc:p,doc:h,serverTimestamp:a}=await L(async()=>{const{increment:w,updateDoc:v,doc:I,serverTimestamp:N}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{increment:w,updateDoc:v,doc:I,serverTimestamp:N}},[]),b=h(R,`companies/${k}/customers`,l.customerId);await p(b,{balance:c(-d.grandTotal),updatedAt:a()})}catch(c){console.warn("Failed to update customer balance on return:",c.message)}showToast(`✅ تم إصدار الإشعار الدائن ${u} بنجاح`,"success"),closeModal("sr-modal"),await z(),l.customerId&&L(()=>import("./balance-sync-C_YRmGhd.js"),__vite__mapDeps([0,1,2])).then(c=>c.recalculateCustomerBalance(l.customerId)).catch(c=>console.warn(c))}catch(d){e.textContent=d.message,e.classList.remove("hidden")}finally{n.disabled=!1}};async function H(){const e={name:"شركة نظم الإمداد الحديثة",vatNumber:"312448150500003",crNumber:"4700123180",address:"7480 - الشارع: عامر الشعبي، ينبع",phone:"0549141648",email:"Nuzmalamdad@gmail.com",logoUrl:""};try{const t=JSON.parse(localStorage.getItem("idham_company")||"{}");t.name&&Object.assign(e,t),t.cr&&(e.crNumber=t.cr),t.crNumber&&(e.crNumber=t.crNumber),t.logoBase64&&(e.logoUrl=t.logoBase64),t.logoUrl&&(e.logoUrl=t.logoUrl)}catch{}try{const{doc:t,getDoc:o}=await L(async()=>{const{doc:i,getDoc:n}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:i,getDoc:n}},[]),[s,r]=await Promise.all([o(t(R,`companies/${k}/settings`,"company")),o(t(R,`companies/${k}/settings`,"logo"))]);if(s.exists()){const i=s.data(),n=i.crNumber||i.cr||i.commercialRegistration||"";i.crNumber=n&&n.startsWith("47")?n:"4700123180",i.vatNumber=i.vatNumber||"312448150500003",i.name=i.name||"شركة نظم الإمداد الحديثة",Object.assign(e,i)}if(r.exists()){const i=r.data(),n=i.dataUrl||i.logoBase64||i.url||i.logoUrl||"";n&&(e.logoUrl=n)}}catch(t){console.warn("Could not load fresh company settings:",t)}return e}function Q(e,t,o,s,r){function i(m,c){const p=new TextEncoder().encode(c);return new Uint8Array([m,p.length,...p])}const n=o?new Date(o).toISOString():new Date().toISOString(),d=[i(1,e||"شركة نظم الإمداد الحديثة"),i(2,t||"312448150500003"),i(3,n),i(4,String(Number(s||0).toFixed(2))),i(5,String(Number(r||0).toFixed(2)))],u=d.reduce((m,c)=>m+c.length,0),x=new Uint8Array(u);let f=0;return d.forEach(m=>{x.set(m,f),f+=m.length}),btoa(String.fromCharCode(...x))}function Z(e){if(!e||typeof window.QRCode>"u")return"";try{const t=document.createElement("div");new window.QRCode(t,{text:e,width:100,height:100,correctLevel:window.QRCode.CorrectLevel?window.QRCode.CorrectLevel.M:0});const o=t.querySelector("canvas");if(o)return o.toDataURL("image/png");const s=t.querySelector("img");if(s&&s.src)return s.src}catch(t){console.warn("QR pre-generation error:",t)}return""}window.printSalesReturn=async e=>{const t=B.find(p=>p.id===e||p.number===e||p.creditNoteNumber===e);if(!t){showToast("الإشعار الدائن غير موجود","error");return}const o=await H(),s=parseFloat(t.subtotal||0),r=parseFloat(t.totalVat!==void 0?t.totalVat:t.vatAmount!==void 0?t.vatAmount:s*.15),i=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total!==void 0?t.total:s+r),n=t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:T()),d=Q(o.name,o.vatNumber,n,i,r),u=Z(d),x=et(i),f=(t.lines||[]).map((p,h)=>{const a=parseFloat(p.unitPrice!==void 0?p.unitPrice:p.price!==void 0?p.price:0)||0,b=parseFloat(p.qty||0),w=parseFloat(p.discount||0),v=b*a*(1-w/100),I=v*.15,N=v+I,C=p.productName||p.name||"",Y=p.unit||"حبة / كرتون";return`
      <tr>
        <td style="text-align:center; font-weight:700;">${h+1}</td>
        <td style="font-weight:700;">${C}${p.sku?`<br><span style="font-size:10px; color:#64748b;">${p.sku}</span>`:""}</td>
        <td style="text-align:center;">${Y}</td>
        <td style="text-align:center; font-family:'IBM Plex Mono',monospace; font-weight:800; color:#b91c1c;">${b}</td>
        <td style="text-align:left; font-family:'IBM Plex Mono',monospace;" dir="ltr">${g(a)}</td>
        <td style="text-align:left; font-family:'IBM Plex Mono',monospace; font-weight:700;" dir="ltr">${g(v)}</td>
        <td style="text-align:left; font-family:'IBM Plex Mono',monospace; color:#d97706;" dir="ltr">${g(I)}</td>
        <td style="text-align:left; font-family:'IBM Plex Mono',monospace; font-weight:800; color:#1e293b;" dir="ltr">${g(N)}</td>
      </tr>`}).join(""),m=o.logoUrl?`<div class="logo-circle"><img src="${o.logoUrl}" alt="Logo" /></div>`:'<div class="logo-circle"><span style="font-size:28px;">🏢</span></div>',c=window.open("","_blank");if(!c){showToast("يرجى السماح بالنوافذ المنبثقة للطباعة","warn");return}c.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>إشعار دائن ضريبي ${t.number||t.creditNoteNumber||t.id}</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;600;700&display=swap" rel="stylesheet"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'IBM Plex Sans Arabic', sans-serif; direction: rtl; color: #1e293b; background: #f8fafc; padding: 12px; }
    .no-print { background: #1e293b; padding: 10px; display: flex; gap: 10px; justify-content: center; margin-bottom: 12px; border-radius: 8px; }
    .btn { padding: 8px 18px; border-radius: 6px; cursor: pointer; border: none; font-family: inherit; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; }
    .btn-red { background: #dc2626; color: #fff; }
    .btn-gray { background: #475569; color: #fff; }
    
    .report-container { background: #fff; max-width: 210mm; margin: 0 auto; padding: 18px 22px; border: 1.5px solid #dc2626; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    
    /* Top Header Banner */
    .top-title { text-align: center; margin-bottom: 12px; }
    .top-title h1 { font-size: 20px; color: #b91c1c; font-weight: 800; margin-bottom: 2px; }
    .top-title h2 { font-size: 10px; color: #b91c1c; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
    
    .company-banner { background: #b91c1c !important; color: #fff !important; border-radius: 8px; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .banner-left { text-align: right; font-size: 11.5px; line-height: 1.5; color: #fff !important; }
    .banner-left div { color: #fff !important; }
    .banner-left strong { color: #fff !important; }
    .banner-right { text-align: left; line-height: 1.4; color: #fff !important; }
    .banner-right h2 { font-size: 16px; font-weight: 800; margin-bottom: 3px; color: #fff !important; }
    .banner-right div { font-size: 11.5px; color: #fff !important; }
    .logo-circle { width: 68px; height: 68px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 4px; border: 1.5px solid #b91c1c; box-shadow: 0 2px 6px rgba(0,0,0,0.12); flex-shrink: 0; }
    .logo-circle img { max-width: 100%; max-height: 100%; object-fit: contain; }
    
    /* Meta Box Grid */
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
    .meta-box { background: #fdf2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px 14px; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; }
    .meta-row:last-child { margin-bottom: 0; }
    .meta-lbl { color: #64748b; font-weight: 600; }
    .meta-val { color: #0f172a; font-weight: 800; }
    
    /* Table */
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11.5px; border: 1px solid #cbd5e1; }
    thead tr { background: #991b1b !important; color: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    thead th { padding: 7px 8px; color: #ffffff !important; font-weight: 700; text-align: right; }
    tbody tr { border-bottom: 1px solid #e2e8f0; }
    tbody tr:nth-child(even) { background: #fcfcfd; }
    tbody td { padding: 7px 8px; color: #1e293b; }
    
    /* Totals & QR */
    .totals-wrapper { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; margin-bottom: 14px; gap: 16px; }
    .qr-box { display: flex; align-items: center; gap: 10px; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 8px; background: #fff; }
    .qr-box img { width: 95px; height: 95px; object-fit: contain; }
    .qr-info { font-size: 10px; color: #64748b; line-height: 1.4; }
    
    .totals-box { width: 320px; background: #fdf2f2; border: 1.5px solid #f87171; border-radius: 8px; padding: 10px 14px; }
    .tot-line { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
    .tot-line.grand { border-top: 1.5px solid #dc2626; padding-top: 6px; margin-top: 6px; font-size: 14px; font-weight: 900; color: #991b1b; }
    
    /* Tafqeet */
    .tafqeet-strip { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 6px 12px; font-size: 11.5px; font-weight: 800; color: #991b1b; margin-bottom: 14px; }
    
    /* Reason */
    .reason-box { background: #fff; border: 1px dashed #ef4444; border-radius: 6px; padding: 8px 12px; font-size: 11px; color: #991b1b; margin-bottom: 16px; }
    
    /* Signatures */
    .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px; padding-top: 12px; border-top: 1px dashed #cbd5e1; text-align: center; }
    .signatures .role { font-size: 11px; font-weight: 800; color: #334155; margin-bottom: 35px; }
    .signatures .line { border-top: 1px dotted #94a3b8; width: 110px; margin: 0 auto; font-size: 10px; color: #64748b; padding-top: 3px; }
    
    @page { size: A4; margin: 8mm 10mm 8mm 10mm; }
    @media print {
      body { background: #fff; padding: 0; }
      .no-print { display: none !important; }
      .report-container { max-width: 100%; box-shadow: none; border-radius: 0; border: none; padding: 4px; }
      .company-banner { background: #b91c1c !important; color: #fff !important; }
      thead tr { background: #991b1b !important; color: #fff !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn btn-red" onclick="window.print()">🖨️ طباعة الإشعار الدائن</button>
    <button class="btn btn-gray" onclick="window.close()">✕ إغلاق</button>
  </div>

  <div class="report-container">
    <!-- Top Title -->
    <div class="top-title">
      <h1>إشعار دائن ضريبي (مردود مبيعات)</h1>
      <h2>TAX CREDIT NOTE (SALES RETURN) — ZATCA COMPLIANT</h2>
    </div>

    <!-- Purple/Red Company Banner -->
    <div class="company-banner">
      <div class="banner-left">
        <div>رقم الإشعار: <strong>${t.number||t.creditNoteNumber||t.id}</strong></div>
        <div>تاريخ الإصدار: <strong>${F(n)}</strong></div>
        <div>الفاتورة الأصلية: <strong>${t.originalInvoiceNumber||t.refInvoice||"—"}</strong></div>
      </div>
      ${m}
      <div class="banner-right">
        <h2>${o.name}</h2>
        <div>الرقم الضريبي: <strong>${o.vatNumber}</strong></div>
        <div>السجل التجاري: <strong>${o.crNumber}</strong></div>
        <div>الهاتف: <strong>${o.phone}</strong></div>
      </div>
    </div>

    <!-- Meta Grid -->
    <div class="meta-grid">
      <div class="meta-box">
        <div class="meta-row"><span class="meta-lbl">العميل:</span><span class="meta-val">${t.customerName||"عميل نقدي"}</span></div>
        <div class="meta-row"><span class="meta-lbl">المستودع المستلم:</span><span class="meta-val">${t.warehouseName||"—"}</span></div>
      </div>
      <div class="meta-box">
        <div class="meta-row"><span class="meta-lbl">المندوب:</span><span class="meta-val">${t.repName||"—"}</span></div>
        <div class="meta-row"><span class="meta-lbl">حالة الاعتماد:</span><span class="meta-val" style="color:#059669;">✓ موثق ومعتمد ZATCA</span></div>
      </div>
    </div>

    <!-- Line Items Table -->
    <table>
      <thead>
        <tr>
          <th style="width:28px; text-align:center;">#</th>
          <th>الصنف المرجع والبيان</th>
          <th style="width:70px; text-align:center;">الوحدة</th>
          <th style="width:60px; text-align:center;">الكمية</th>
          <th style="width:90px; text-align:left;">السعر الأصلي</th>
          <th style="width:95px; text-align:left;">المبلغ قبل الضريبة</th>
          <th style="width:80px; text-align:left;">ضريبة 15%</th>
          <th style="width:105px; text-align:left;">الإجمالي شامل الضريبة</th>
        </tr>
      </thead>
      <tbody>${f}</tbody>
    </table>

    <!-- Totals & QR Section -->
    <div class="totals-wrapper">
      <div class="qr-box">
        ${u?`<img src="${u}" alt="ZATCA QR" />`:'<div style="width:95px; height:95px; display:flex; align-items:center; justify-content:center; background:#eee; font-size:10px;">QR ZATCA</div>'}
        <div class="qr-info">
          <strong>رمز الاستجابة السريعة (ZATCA QR)</strong><br>
          متوافق مع المرحلة الثانية للفوترة الإلكترونية<br>
          المنشأة: ${o.name}<br>
          الرقم الضريبي: ${o.vatNumber}
        </div>
      </div>
      <div class="totals-box">
        <div class="tot-line"><span>المجموع قبل الضريبة:</span><span class="mono font-bold" dir="ltr">${g(s)}</span></div>
        <div class="tot-line" style="color:#d97706;"><span>ضريبة القيمة المضافة (15%):</span><span class="mono font-bold" dir="ltr">${g(r)}</span></div>
        <div class="tot-line grand"><span>إجمالي الإشعار الدائن:</span><span class="mono" dir="ltr">${g(i)}</span></div>
      </div>
    </div>

    <!-- Tafqeet Strip -->
    ${x?`<div class="tafqeet-strip">المبلغ بالحروف: فقط ${x} لا غير</div>`:""}

    <!-- Reason Box -->
    ${t.reason?`<div class="reason-box"><strong>سبب الإرجاع:</strong> ${t.reason}</div>`:""}

    <!-- Signatures -->
    <div class="signatures">
      <div>
        <div class="role">أمين المخزن المستلم</div>
        <div class="line">التوقيع والختم</div>
      </div>
      <div>
        <div class="role">مندوب المبيعات / السائق</div>
        <div class="line">التوقيع</div>
      </div>
      <div>
        <div class="role">اعتماد العميل والمستلم</div>
        <div class="line">التوقيع والختم</div>
      </div>
    </div>

  </div>
</body>
</html>`),c.document.close()};window.printSalesReturnThermal=async e=>{const t=B.find(m=>m.id===e||m.number===e||m.creditNoteNumber===e);if(!t){showToast("الإشعار الدائن غير موجود","error");return}const o=await H(),s=parseFloat(t.subtotal||0),r=parseFloat(t.totalVat!==void 0?t.totalVat:t.vatAmount!==void 0?t.vatAmount:s*.15),i=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total!==void 0?t.total:s+r),n=t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:T()),d=Q(o.name,o.vatNumber,n,i,r),u=Z(d),x=(t.lines||[]).map(m=>{const c=parseFloat(m.unitPrice!==void 0?m.unitPrice:m.price!==void 0?m.price:0)||0,p=parseFloat(m.qty||0),h=p*c*1.15;return`
      <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:11px;">
        <div style="font-weight:700;">${m.productName||m.name} (${p} x ${c.toFixed(2)})</div>
        <div style="font-family:monospace; font-weight:700;">${h.toFixed(2)}</div>
      </div>`}).join(""),f=window.open("","_blank");if(!f){showToast("يرجى السماح بالنوافذ المنبثقة","warn");return}f.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>إشعار دائن حراري ${t.number||t.creditNoteNumber||t.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: sans-serif; width: 78mm; margin: 0 auto; padding: 6px; font-size: 11px; line-height: 1.4; }
    .center { text-align: center; }
    .border-b { border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px; }
    .bold { font-weight: bold; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body onload="window.print()">
  <div class="center border-b">
    <div class="bold" style="font-size:13px;">${o.name}</div>
    <div>الرقم الضريبي: ${o.vatNumber}</div>
    <div class="bold" style="font-size:12px; margin-top:4px;">إشعار دائن (مردود مبيعات)</div>
    <div>رقم الإشعار: ${t.number||t.creditNoteNumber||t.id}</div>
    <div>التاريخ: ${n}</div>
    <div>الفاتورة الأصلية: ${t.originalInvoiceNumber||t.refInvoice||"—"}</div>
    <div>العميل: ${t.customerName||"عميل نقدي"}</div>
    <div>المستودع: ${t.warehouseName||"—"}</div>
  </div>

  <div class="border-b">
    <div class="bold" style="margin-bottom:4px;">الأصناف المرجعة:</div>
    ${x}
  </div>

  <div class="border-b">
    <div style="display:flex; justify-content:space-between;"><span>المجموع قبل الضريبة:</span><span>${s.toFixed(2)} ر.س</span></div>
    <div style="display:flex; justify-content:space-between;"><span>ضريبة 15%:</span><span>${r.toFixed(2)} ر.س</span></div>
    <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:12px; margin-top:4px;"><span>الإجمالي الصافي:</span><span>${i.toFixed(2)} ر.س</span></div>
  </div>

  ${u?`<div class="center" style="margin:10px 0;"><img src="${u}" width="100" height="100" /></div>`:""}

  <div class="center" style="font-size:10px;">
    <div>شكراً لتعاملكم معنا</div>
  </div>
</body>
</html>`),f.document.close()};export{vt as render};
