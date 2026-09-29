import{s as q,t as V,g as P,a as S,f,d as T,C as L,b as H}from"./index-BgjRa7f-.js";import{orderBy as Q,query as v,where as h,limit as w,getDocs as k,collection as O}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function nt(a,i){a.innerHTML=`
    <div class="filterbar no-print">
      <!-- نوع الحساب -->
      <div class="filter-select-group" style="min-width:150px;">
        <label>نوع الحساب</label>
        <select id="stmt-type-select" onchange="onStatementTypeChange()">
          <option value="customer">عميل</option>
          <option value="supplier">مورد</option>
          <option value="rep">مندوب مبيعات</option>
        </select>
      </div>

      <!-- بحث بالاسم / الكود / الهاتف -->
      <div style="position:relative; min-width:300px; flex:1; max-width:420px;">
        <label id="stmt-entity-label" style="font-size:11px; font-weight:700; color:var(--text-2); display:block; margin-bottom:4px;">🔍 ابحث بالاسم أو الهاتف أو الكود</label>
        <input type="text" id="stmt-entity-search"
          class="input"
          placeholder="اكتب للبحث..."
          autocomplete="off"
          style="width:100%; padding-left:14px;"
          oninput="onStmtSearchInput()" />
        <div id="stmt-entity-results"
          style="position:absolute; top:100%; right:0; left:0; z-index:9999; max-height:280px; overflow-y:auto;
                 background:var(--bg-card); border:1px solid var(--border); border-radius:10px;
                 box-shadow:0 8px 32px rgba(0,0,0,.15); display:none;">
        </div>
        <!-- hidden value holder -->
        <input type="hidden" id="stmt-entity-id" value="" />
      </div>

      <!-- تواريخ -->
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="stmt-from" value="${q()}" onchange="loadStatement()" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="stmt-to" value="${V()}" onchange="loadStatement()" />
      </div>

      <!-- أزرار التصدير -->
      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn-export" onclick="exportStatementPDF()" title="طباعة / PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportStatementExcel()" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="exportStatementPDF()" title="طباعة كشف الحساب"><span>🖨️</span> طباعة</button>
      </div>
    </div>


    <style>
      /* ── كروت المدين/الدائن/الرصيد ─────────────── */
      .stmt-kpi-card {
        border-radius: 14px;
        padding: 18px 20px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        border: 1px solid transparent;
        position: relative;
        overflow: hidden;
      }
      .stmt-kpi-card::before {
        content: "";
        position: absolute;
        top: 0; right: 0;
        width: 60px; height: 60px;
        border-radius: 50%;
        opacity: .08;
      }
      .stmt-kpi-card .kpi-icon { font-size: 22px; }
      .stmt-kpi-card .kpi-label { font-size: 11.5px; font-weight: 700; opacity: .75; }
      .stmt-kpi-card .kpi-value { font-size: 24px; font-weight: 900; font-family: monospace; }

      /* الهيدر الملكي الأزرق */
      #stmt-header-card {
        background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 55%, #2563eb 100%) !important;
        border: none !important;
        border-radius: 16px !important;
        box-shadow: 0 8px 32px rgba(29,78,216,.35) !important;
      }
      #stmt-entity-name  { color: #fff !important; font-size: 22px !important; font-weight: 900 !important; }
      #stmt-entity-details { color: rgba(255,255,255,.75) !important; }
      #stmt-closing-status { background: rgba(255,255,255,.18) !important; color: #fff !important; border: 1px solid rgba(255,255,255,.3) !important; }
      #stmt-closing-status-box { display: block !important; }

      @media print {
        /* إخفاء الهيدر الأخضر العام عند طباعة كشف الحساب */
        .print-header,
        .company-header,
        header.main-header,
        .sidebar,
        .topbar,
        .app-topbar,
        .filterbar,
        .no-print,
        .btn,
        .btn-export,
        nav { display: none !important; }

        /* ظهور الهيدر الأزرق الملكي في الطباعة */
        #stmt-header-card {
          background: linear-gradient(135deg, #1e3a8a, #2563eb) !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          border-radius: 12px !important;
          padding: 16px 24px !important;
          margin-bottom: 12px !important;
        }
        #stmt-entity-name   { color: #fff !important; font-size: 18px !important; }
        #stmt-entity-details { color: rgba(255,255,255,.8) !important; font-size: 11px !important; }
        #stmt-closing-status { background: rgba(255,255,255,.15) !important; color: #fff !important; }

        /* كروت الـ KPI في الطباعة */
        .stmt-kpi-card {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* الجدول */
        table { font-size: 11px !important; }
        .page-content { padding: 0 !important; }
        body { margin: 0 !important; }
      }
    </style>


    <div class="page-content">

      <!-- ── كروت KPI المدين / الدائن / الرصيد ── -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:14px; margin-bottom:20px;" id="stmt-summary-cards">

        <!-- المدين -->
        <div class="stmt-kpi-card" style="background:linear-gradient(135deg,rgba(29,78,216,.08),rgba(29,78,216,.03)); border-color:rgba(29,78,216,.2);">
          <div class="kpi-icon">📤</div>
          <div class="kpi-label" style="color:#1d4ed8;">إجمالي المدين (+)</div>
          <div class="kpi-value" id="stmt-total-debit" style="color:#1d4ed8;">0.00 ر.س</div>
        </div>

        <!-- الدائن -->
        <div class="stmt-kpi-card" style="background:linear-gradient(135deg,rgba(16,185,129,.08),rgba(16,185,129,.03)); border-color:rgba(16,185,129,.2);">
          <div class="kpi-icon">📥</div>
          <div class="kpi-label" style="color:#059669;">إجمالي الدائن (-)</div>
          <div class="kpi-value" id="stmt-total-credit" style="color:#059669;">0.00 ر.س</div>
        </div>

        <!-- الرصيد -->
        <div class="stmt-kpi-card" style="background:linear-gradient(135deg,rgba(239,68,68,.08),rgba(239,68,68,.03)); border-color:rgba(239,68,68,.2);">
          <div class="kpi-icon">⚖️</div>
          <div class="kpi-label" style="color:#dc2626;">الرصيد النهائي (الصافي)</div>
          <div class="kpi-value" id="stmt-closing-balance" style="color:#dc2626;">0.00 ر.س</div>
        </div>

      </div>

      <!-- ── الهيدر الملكي الأزرق ── -->
      <div class="mb-20" id="stmt-header-card" style="border-radius:16px; padding:22px 28px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <h2 style="margin:0 0 4px;" id="stmt-entity-name">كشف حساب موحد</h2>
            <div id="stmt-entity-details">حدد نوع الحساب والكيان لعرض الحركة التفصيلية</div>
          </div>
          <div id="stmt-closing-status-box" style="display:none;">
            <span class="badge" id="stmt-closing-status" style="font-size:13px; padding:6px 14px;">—</span>
          </div>
        </div>
      </div>

      <!-- Sales Rep Performance Summary Panel (Conditionally visible) -->
      <div class="card mb-20 hidden" id="stmt-rep-perf-panel" style="background:var(--bg-1); border-right:4px solid var(--indigo); overflow:hidden;">
        <div class="card-header" style="padding:12px 20px; border-bottom:1px solid var(--border-soft); background:rgba(91,127,255,0.03);">
          <h3 style="font-family:var(--font-heading);font-size:14px;color:var(--indigo);margin:0;"><i class="fas fa-chart-line"></i> ملخص أداء المندوب خلال الفترة</h3>
        </div>
        <div class="card-body" style="padding:20px;">
          <div class="grid-3 gap-16">
            <div style="background:var(--bg-2); padding:12px; border-radius:8px; border:1px solid var(--border-soft);">
              <div class="text-2 mb-4" style="font-size:11px;">إجمالي المبيعات (نقدي + آجل)</div>
              <div class="mono font-bold text-indigo" style="font-size:18px;" id="stmt-rep-sales">0.00 ر.س</div>
            </div>
            <div style="background:var(--bg-2); padding:12px; border-radius:8px; border:1px solid var(--border-soft);">
              <div class="text-2 mb-4" style="font-size:11px;">العمولة المستحقة</div>
              <div class="mono font-bold text-warn" style="font-size:18px;" id="stmt-rep-commission">0.00 ر.س</div>
            </div>
            <div style="background:var(--bg-2); padding:12px; border-radius:8px; border:1px solid var(--border-soft);">
              <div class="text-2 mb-4" style="font-size:11px;">إجمالي مرتجعات عملائه</div>
              <div class="mono font-bold text-bad" style="font-size:18px;" id="stmt-rep-returns">0.00 ر.س</div>
            </div>
          </div>
          <div class="grid-3 gap-16" style="margin-top:16px;">
            <div style="background:var(--bg-2); padding:12px; border-radius:8px; border:1px solid var(--border-soft);">
              <div class="text-2 mb-4" style="font-size:11px;">النقدية المحصلة بطرفه (العهد المستلمة)</div>
              <div class="mono font-bold text-good" style="font-size:18px;" id="stmt-rep-collections">0.00 ر.س</div>
            </div>
            <div style="background:var(--bg-2); padding:12px; border-radius:8px; border:1px solid var(--border-soft);">
              <div class="text-2 mb-4" style="font-size:11px;">المبالغ الموردة والمسلَّمة للخزينة</div>
              <div class="mono font-bold text-good" style="font-size:18px;" id="stmt-rep-handovers">0.00 ر.س</div>
            </div>
            <div style="background:var(--bg-2); padding:12px; border-radius:8px; border:1px solid var(--border-soft);">
              <div class="text-2 mb-4" style="font-size:11px;">الرصيد النقدي المتبقي بحوزته (المحفظة)</div>
              <div class="mono font-bold text-bad" style="font-size:18px;" id="stmt-rep-vault-balance">0.00 ر.س</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statement Ledger Table -->
      <div class="card">
        <div class="table-container">
          <table class="data-dense" id="stmt-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>نوع الحركة</th>
                <th>رقم المستند</th>
                <th>البيان / ملاحظات</th>
                <th class="text-indigo">مدين (+)</th>
                <th class="text-lime">دائن (-)</th>
                <th>الرصيد المترتب</th>
              </tr>
            </thead>
            <tbody id="stmt-tbody">
              <tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">اختر نوع الحساب ثم الكيان لعرض كشف الحساب</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>`,await Y()}let M=[],_=[],j=[],y=[],R="",B="customer";async function Y(){try{const[a,i,d]=await Promise.all([P(S.customers(),[Q("name")]),P(S.suppliers(),[Q("name")]),P(S.salesReps(),[Q("name")])]);if(M=a,_=i,j=d,window._preselectedStatementEntity){const o=window._preselectedStatementEntity;window._preselectedStatementEntity=null;const n=document.getElementById("stmt-type-select");n&&(n.value=o.type),B=o.type;const m=(o.type==="customer"?M:o.type==="supplier"?_:j).find(l=>l.id===o.id);if(m){const l=document.getElementById("stmt-entity-search"),b=document.getElementById("stmt-entity-id");l&&(l.value=m.name),b&&(b.value=m.id),R=m.id,await loadStatement()}}document.addEventListener("click",o=>{const n=document.getElementById("stmt-entity-results"),g=document.getElementById("stmt-entity-search");n&&!n.contains(o.target)&&o.target!==g&&(n.style.display="none")})}catch(a){console.error("Statement init error:",a)}}window.onStatementTypeChange=()=>{B=document.getElementById("stmt-type-select")?.value||"customer",R="";const a=document.getElementById("stmt-entity-label"),i=document.getElementById("stmt-entity-search"),d=document.getElementById("stmt-entity-id"),o=document.getElementById("stmt-entity-results");i&&(i.value=""),d&&(d.value=""),o&&(o.style.display="none"),a&&(a.textContent=B==="customer"?"🔍 ابحث عن العميل":B==="supplier"?"🔍 ابحث عن المورد":"🔍 ابحث عن المندوب"),document.getElementById("stmt-rep-perf-panel")?.classList.add("hidden");const n=document.getElementById("stmt-tbody");n&&(n.innerHTML='<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">حدد الكيان لعرض كشف الحساب</td></tr>'),document.getElementById("stmt-total-debit").textContent="0.00 ر.س",document.getElementById("stmt-total-credit").textContent="0.00 ر.س",document.getElementById("stmt-closing-balance").textContent="0.00 ر.س",document.getElementById("stmt-closing-status-box").style.display="none",document.getElementById("stmt-entity-name").textContent="كشف حساب موحد",document.getElementById("stmt-entity-details").textContent="حدد نوع الحساب والكيان لعرض الحركة التفصيلية"};window.onStmtSearchInput=()=>{const a=(document.getElementById("stmt-entity-search")?.value||"").trim().toLowerCase(),i=document.getElementById("stmt-entity-results");if(!i)return;if(!a){i.style.display="none";return}const o=(B==="customer"?M:B==="supplier"?_:j).filter(n=>(n.name||"").toLowerCase().includes(a)||(n.code||"").toLowerCase().includes(a)||(n.phone||"").includes(a)).slice(0,15);if(!o.length){i.innerHTML='<div style="padding:12px;text-align:center;color:var(--text-2);font-size:12px;">لا توجد نتائج</div>',i.style.display="block";return}i.innerHTML=o.map(n=>`
    <div onclick="selectStmtEntity('${n.id}')"
      style="padding:10px 14px; border-bottom:1px solid var(--border-soft); cursor:pointer;
             display:flex; justify-content:space-between; align-items:center;
             transition:background .15s;"
      onmouseover="this.style.background='var(--bg-hover)'"
      onmouseout="this.style.background=''">
      <div>
        <div style="font-weight:700; font-size:13px; color:var(--text-0);">${n.name}</div>
        <div style="font-size:11px; color:var(--text-2);">${n.phone||"—"} ${n.code?"• "+n.code:""}</div>
      </div>
      <div style="font-size:11px; color:var(--brand); font-weight:700;">
        ${B==="rep"?n.zone||"":n.phone||""}
      </div>
    </div>
  `).join(""),i.style.display="block"};window.selectStmtEntity=async a=>{R=a;const d=(B==="customer"?M:B==="supplier"?_:j).find(m=>m.id===a),o=document.getElementById("stmt-entity-search"),n=document.getElementById("stmt-entity-id"),g=document.getElementById("stmt-entity-results");o&&d&&(o.value=d.name),n&&(n.value=a),g&&(g.style.display="none"),await loadStatement()};window.loadStatement=async()=>{const a=document.getElementById("stmt-type-select")?.value||B,i=R||document.getElementById("stmt-entity-id")?.value,d=document.getElementById("stmt-tbody"),o=document.getElementById("stmt-from")?.value,n=document.getElementById("stmt-to")?.value;if(!i){d&&(d.innerHTML='<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">حدد الكيان لعرض كشف الحساب</td></tr>'),document.getElementById("stmt-total-debit").textContent="0.00 ر.س",document.getElementById("stmt-total-credit").textContent="0.00 ر.س",document.getElementById("stmt-closing-balance").textContent="0.00 ر.س",document.getElementById("stmt-closing-status-box").style.display="none",document.getElementById("stmt-entity-name").textContent="كشف حساب موحد";return}d&&(d.innerHTML=`${Array(6).fill(0).map(()=>`
      <tr class="skeleton-row">
        ${Array(7).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
      </tr>`).join("")}`);try{a==="customer"?await K(i,o,n):a==="supplier"?await X(i,o,n):a==="rep"&&await G(i,o,n)}catch(g){d&&(d.innerHTML=`<tr><td colspan="7"><div class="alert bad" style="margin:8px;">${g.message}</div></td></tr>`)}};async function K(a,i,d){const o=M.find(t=>t.id===a);o&&(document.getElementById("stmt-entity-name").textContent=o.name,document.getElementById("stmt-entity-details").textContent=`الهاتف: ${o.phone||"—"} | المنطقة: ${o.zone||"—"} | حد الائتمان: ${f(o.creditLimit||0)}`);const n=v(S.salesInvoices(),h("customerId","==",a),w(500)),m=(await k(n)).docs.map(t=>t.data()),l=v(S.salesReturns(),h("customerId","==",a),w(500)),r=(await k(l)).docs.map(t=>t.data()),E=v(O(T,`companies/${L}/collections`),h("customerId","==",a),w(500)),s=(await k(E)).docs.map(t=>({id:t.id,...t.data()})),C=v(O(T,`companies/${L}/receipts`),h("targetId","==",a),w(500)),I=(await k(C)).docs.map(t=>({id:t.id,...t.data()})).filter(t=>t.entityType==="customer");let p=[];m.forEach(t=>{if(t.status==="cancelled")return;const x=(t.paymentMethod||"cash").toLowerCase();p.push({date:t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:""),type:"فاتورة مبيعات",docNum:t.number||t.invoiceNumber||"",notes:`مبيعات ${t.lines?.length||0} صنف — ${x==="cash"?"نقدي":"آجل"}`,debit:t.totalWithVat||0,credit:0})}),r.forEach(t=>{if(t.status==="cancelled"||t.status==="void")return;const x=t.number||t.creditNoteNumber||t.id||"",D=t.originalInvoiceNumber||t.refInvoice||"",$=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total!==void 0?t.total:t.subtotal||0);p.push({date:t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:""),type:"إشعار دائن (مرتجع شامل الضريبة)",docNum:x,notes:`مردودات فاتورة ${D} — ${t.reason||""}`,debit:0,credit:$})}),s.forEach(t=>{p.push({date:t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:""),type:"سند قبض وتحصيل (مبيعات)",docNum:t.number||`COL-${t.id.slice(0,5)}`,notes:`تحصيل نقدي — طريقة الدفع: ${t.method||"نقدي"} ${t.notes?"— "+t.notes:""}`,debit:0,credit:t.amount||0})}),I.forEach(t=>{p.push({date:t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:""),type:"سند قبض",docNum:`RC-${t.id.substring(0,6).toUpperCase()}`,notes:`سند قبض — طريقة الدفع: ${t.method==="cash"?"نقدي":"تحويل بنكي"} — بيان: ${t.notes||""}`,debit:0,credit:t.amount||0})}),W(p,i,d,"balance_due")}async function X(a,i,d){const o=_.find(t=>t.id===a);o&&(document.getElementById("stmt-entity-name").textContent=o.name,document.getElementById("stmt-entity-details").textContent=`الهاتف: ${o.phone||"—"} | الرقم الضريبي: ${o.vatNumber||"—"}`);const n=v(S.purchaseInvoices(),h("supplierId","==",a),w(500)),m=(await k(n)).docs.map(t=>t.data()),l=v(S.purchaseReturns(),h("supplierId","==",a),w(500)),r=(await k(l)).docs.map(t=>t.data()),E=v(O(T,`companies/${L}/expenses`),h("targetId","==",a),w(500)),s=(await k(E)).docs.map(t=>({id:t.id,...t.data()})).filter(t=>t.entityType==="supplier"),C=v(O(T,`companies/${L}/receipts`),h("targetId","==",a),w(500)),I=(await k(C)).docs.map(t=>({id:t.id,...t.data()})).filter(t=>t.status!=="cancelled"&&(!t.entityType||t.entityType==="supplier"));let p=[];m.forEach(t=>{if(t.status!=="cancelled"&&(p.push({date:t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:""),type:"فاتورة مشتريات",docNum:t.number,notes:`مشتريات ${t.lines?.length||0} صنف — ${t.paymentMethod==="cash"?"نقدي":"آجل"}`,debit:0,credit:t.totalWithVat||0}),t.paidAmount>0)){const x=t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:"");s.some($=>($.date||($.createdAt?.toDate?$.createdAt.toDate().toISOString().split("T")[0]:""))===x&&Math.abs(($.amount||0)-t.paidAmount)<.01)||p.push({date:x,type:"سداد دفعة للمورد (فاتورة)",docNum:`PAY-${t.number}`,notes:`سداد دفعة عن فاتورة ${t.number}`,debit:t.paidAmount,credit:0})}}),r.forEach(t=>{t.status==="cancelled"||t.status==="void"||p.push({date:t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:""),type:"إشعار مدين (مرتجع مشتريات)",docNum:t.number,notes:`مرتجع مشتريات للفاتورة ${t.originalInvoiceNumber||""} — ${t.reason||""}`,debit:t.totalWithVat||0,credit:0})}),s.forEach(t=>{t.status!=="cancelled"&&p.push({date:t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:""),type:"سند صرف للمورد",docNum:`PV-${t.id.substring(0,6).toUpperCase()}`,notes:`سند صرف — طريقة الدفع: ${t.method==="cash"?"نقدي":"تحويل بنكي"} — بيان: ${t.notes||""}`,debit:t.amount||0,credit:0})}),I.forEach(t=>{p.push({date:t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:""),type:"سند قبض من مورد (استرداد)",docNum:t.number||t.code||`RV-${t.id.substring(0,6).toUpperCase()}`,notes:`سند قبض من مورد — طريقة الاستلام: ${t.method==="cash"?"نقدي":"تحويل بنكي"} — بيان: ${t.notes||""}`,debit:0,credit:t.amount||0})}),W(p,i,d,"liability_due")}async function G(a,i,d){const o=j.find(e=>e.id===a);o&&(document.getElementById("stmt-entity-name").textContent=o.name,document.getElementById("stmt-entity-details").textContent=`الهاتف: ${o.phone||"—"} | المسار: ${o.zone||"—"} | العمولة: ${o.commissionRate||0}%`),document.getElementById("stmt-rep-perf-panel").classList.remove("hidden");const n=v(S.salesInvoices(),h("repId","==",a),w(500)),m=(await k(n)).docs.map(e=>e.data()),l=v(S.salesReturns(),h("repId","==",a),w(500)),r=(await k(l)).docs.map(e=>e.data()),E=v(O(T,`companies/${L}/collections`),h("repId","==",a),w(500)),s=(await k(E)).docs.map(e=>({id:e.id,...e.data()})),z=(await P(S.cashBoxes())).find(e=>e.keeper?.trim()===o.name.trim()||e.name.includes(o.name));let I=[];if(z){const e=v(S.cashTransactions(),h("cashBoxId","==",z.id),w(1e3));I=(await k(e)).docs.map(F=>F.data())}let p=0,t=0,x=0,D=0;m.forEach(e=>{e.status!=="cancelled"&&(p+=e.totalWithVat||0,e.paidAmount>0&&(x+=e.paidAmount))}),r.forEach(e=>{if(e.status==="cancelled")return;const A=parseFloat(e.totalWithVat!==void 0?e.totalWithVat:e.total!==void 0?e.total:e.subtotal||0);t+=A}),s.forEach(e=>{x+=e.amount||0}),I.forEach(e=>{e.type==="out"&&(D+=e.amount||0)});const $=p*(o.commissionRate||0)/100,u=z?z.balance||0:Math.max(0,x-D);document.getElementById("stmt-rep-sales").textContent=f(p),document.getElementById("stmt-rep-commission").textContent=f($),document.getElementById("stmt-rep-returns").textContent=f(t),document.getElementById("stmt-rep-collections").textContent=f(x),document.getElementById("stmt-rep-handovers").textContent=f(D),document.getElementById("stmt-rep-vault-balance").textContent=f(u);let N=[];m.forEach(e=>{e.status!=="cancelled"&&N.push({date:e.date||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:""),type:"مبيعات مندوب (فاتورة)",docNum:e.number,notes:`فاتورة مبيعات للعميل ${e.customerName} (${e.lines?.length||0} صنف)`,debit:e.totalWithVat||0,credit:0})}),r.forEach(e=>{if(e.status==="cancelled")return;const A=e.number||e.creditNoteNumber||e.id||"",F=e.originalInvoiceNumber||e.refInvoice||"",U=parseFloat(e.totalWithVat!==void 0?e.totalWithVat:e.total!==void 0?e.total:e.subtotal||0);N.push({date:e.date||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:""),type:"مرتجع مبيعات لعملائه",docNum:A,notes:`مرتجع من العميل ${e.customerName} للفاتورة ${F}`,debit:0,credit:U})}),s.forEach(e=>{N.push({date:e.date||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:""),type:"تحصيل نقدي من عميل",docNum:e.number||`COL-${e.id.slice(0,5)}`,notes:`تحصيل من العميل — طريقة السداد: ${e.method||"نقدي"}`,debit:0,credit:e.amount||0})}),I.forEach(e=>{if(e.type==="out"){const A=e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:"";N.push({date:A||V(),type:"تسليم نقدية للخزينة",docNum:"TRF-MAIN",notes:`توريد المندوب للخزينة: ${e.notes||"تصدير عهدة نقدية"}`,debit:0,credit:e.amount||0})}}),W(N,i,d,"rep_sales_balance")}function W(a,i,d,o){const n=document.getElementById("stmt-tbody");a.sort((s,C)=>new Date(s.date)-new Date(C.date)),(i||d)&&(a=a.filter(s=>(!i||s.date>=i)&&(!d||s.date<=d)));let g=0,m=0,l=0;y=a.map(s=>(g+=s.debit,m+=s.credit,l+=s.debit-s.credit,{...s,balance:l})),document.getElementById("stmt-total-debit").textContent=f(g),document.getElementById("stmt-total-credit").textContent=f(m);const b=document.getElementById("stmt-closing-balance");b.textContent=f(l);const r=b.closest(".stmt-kpi-card");r&&(l>0?(r.style.background="linear-gradient(135deg,rgba(239,68,68,.1),rgba(239,68,68,.04))",r.style.borderColor="rgba(239,68,68,.3)",b.style.color="#dc2626",r.querySelector(".kpi-label").style.color="#dc2626"):l<0?(r.style.background="linear-gradient(135deg,rgba(16,185,129,.1),rgba(16,185,129,.04))",r.style.borderColor="rgba(16,185,129,.3)",b.style.color="#059669",r.querySelector(".kpi-label").style.color="#059669"):(r.style.background="linear-gradient(135deg,rgba(100,116,139,.08),rgba(100,116,139,.03))",r.style.borderColor="rgba(100,116,139,.2)",b.style.color="#475569",r.querySelector(".kpi-label").style.color="#475569"));const E=document.getElementById("stmt-closing-status-box"),c=document.getElementById("stmt-closing-status");if(E.style.display="block",o==="balance_due"?l>0?(c.className="badge bad",c.textContent="مستحق عليه (ذمم مدينة)"):l<0?(c.className="badge good",c.textContent="مستحق له (دائن)"):(c.className="badge neutral",c.textContent="حساب متزن"):o==="liability_due"?l>0?(c.className="badge good",c.textContent="مستحق لنا (مدين)"):l<0?(c.className="badge bad",c.textContent="مستحق له (ذمم دائنة)"):(c.className="badge neutral",c.textContent="حساب متزن"):(c.className="badge indigo",c.textContent="رصيد الأنشطة والتحصيل"),y.length===0){n.innerHTML='<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد حركات مالية مسجلة في هذه الفترة</td></tr>';return}n.innerHTML=y.map(s=>`
    <tr>
      <td class="dim">${H(s.date)}</td>
      <td><span class="badge ${s.debit>0?"indigo":"good"}" style="font-size:10.5px;">${s.type}</span></td>
      <td class="mono font-semibold text-indigo">${s.docNum}</td>
      <td>${s.notes}</td>
      <td class="mono ${s.debit>0?"text-indigo font-bold":"dim"}">${s.debit>0?f(s.debit):"—"}</td>
      <td class="mono ${s.credit>0?"text-good font-bold":"dim"}">${s.credit>0?f(s.credit):"—"}</td>
      <td class="mono font-bold ${s.balance>0?"text-bad":"text-good"}">${f(s.balance)}</td>
    </tr>`).join("")}window.exportStatement=()=>{const a=document.getElementById("stmt-entity-name")?.textContent||"Statement",i=[["التاريخ","نوع الحركة","رقم المستند","البيان والملخص","مدين (+)","دائن (-)","الرصيد المترتب"]];y.forEach(n=>i.push([n.date,n.type,n.docNum,n.notes,n.debit,n.credit,n.balance]));const d=i.map(n=>n.map(g=>`"${g}"`).join(",")).join(`
`),o=document.createElement("a");o.href=URL.createObjectURL(new Blob(["\uFEFF"+d],{type:"text/csv;charset=utf-8;"})),o.download=`statement_${a.replace(/\s+/g,"_")}_${V()}.csv`,o.click(),showToast("تم تصدير كشف الحساب بنجاح","success")};window.exportStatementPDF=()=>{if(!y||y.length===0){showToast("لا توجد بيانات للطباعة","warning");return}const a=document.getElementById("stmt-entity-name")?.textContent||"",i=document.getElementById("stmt-entity-details")?.textContent||"",d=document.getElementById("stmt-total-debit")?.textContent||"0.00 ر.س",o=document.getElementById("stmt-total-credit")?.textContent||"0.00 ر.س",n=document.getElementById("stmt-closing-balance")?.textContent||"0.00 ر.س",g=document.getElementById("stmt-closing-status")?.textContent||"",m=document.getElementById("stmt-from")?.value||"",l=document.getElementById("stmt-to")?.value||"",b=window.ERP_COMPANY||{},r=b.name||"مؤسسة إدهام للمواد الغذائية",E=b.phone||"",c=b.email||"",s=b.address||"",C=b.vatNumber||"",z=b.logo||"",I=new Date,p=I.toLocaleDateString("ar-SA"),t=I.toLocaleTimeString("ar-SA"),x=y.map(u=>`
    <tr>
      <td>${H(u.date)}</td>
      <td><span class="badge-type ${u.debit>0?"db":"cr"}">${u.type}</span></td>
      <td class="mono">${u.docNum||"—"}</td>
      <td>${u.notes||""}</td>
      <td class="mono amt ${u.debit>0?"clr-db":"dim"}">${u.debit>0?u.debit.toFixed(2):"—"}</td>
      <td class="mono amt ${u.credit>0?"clr-cr":"dim"}">${u.credit>0?u.credit.toFixed(2):"—"}</td>
      <td class="mono amt bold ${u.balance>0?"clr-neg":u.balance<0?"clr-pos":""}">${u.balance.toFixed(2)}</td>
    </tr>`).join(""),D=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>كشف حساب: ${a}</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    @page{size:A4 landscape;margin:8mm 10mm}
    body{font-family:'IBM Plex Sans Arabic',Tahoma,sans-serif;font-size:9.5px;color:#111;direction:rtl;
         -webkit-print-color-adjust:exact;print-color-adjust:exact}

    /* ── هيدر الشركة الأزرق الملكي ── */
    .co-header{
      background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 55%,#2563eb 100%);
      color:#fff;padding:14px 18px;border-radius:10px 10px 0 0;
      display:flex;justify-content:space-between;align-items:flex-start;
    }
    .co-left{display:flex;align-items:center;gap:12px}
    .co-logo{max-height:54px;max-width:100px;object-fit:contain;background:#fff;padding:4px;border-radius:6px}
    .co-name{font-size:17px;font-weight:800;margin-bottom:4px}
    .co-line{font-size:8.5px;color:rgba(255,255,255,.8);margin-bottom:2px}
    .co-date{text-align:left;font-size:8.5px;color:rgba(255,255,255,.8)}
    .co-date strong{font-size:11px;color:#fff;display:block;margin-bottom:2px}

    /* ── شريط كشف الحساب ── */
    .stmt-strip{background:#1a1a2e;color:#fff;padding:9px 18px;display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
    .stmt-strip h2{font-size:13px;font-weight:800}
    .stmt-strip .sub{font-size:8px;color:rgba(255,255,255,.7);margin-top:2px}
    .stmt-strip .period{font-size:8.5px;color:rgba(255,255,255,.75)}

    /* ── كروت المدين / الدائن / الرصيد ── */
    .kpi-row{display:flex;gap:8px;margin-bottom:10px}
    .kpi-card{flex:1;padding:8px 12px;border-radius:8px;border:1px solid transparent}
    .kpi-card .lbl{font-size:8px;font-weight:700;margin-bottom:3px}
    .kpi-card .val{font-size:14px;font-weight:900;font-family:monospace}
    .kpi-db{background:rgba(29,78,216,.08);border-color:rgba(29,78,216,.2)}
    .kpi-db .lbl,.kpi-db .val{color:#1d4ed8}
    .kpi-cr{background:rgba(16,185,129,.08);border-color:rgba(16,185,129,.2)}
    .kpi-cr .lbl,.kpi-cr .val{color:#059669}
    .kpi-bal-neg{background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.2)}
    .kpi-bal-neg .lbl,.kpi-bal-neg .val{color:#dc2626}
    .kpi-bal-pos{background:rgba(16,185,129,.08);border-color:rgba(16,185,129,.2)}
    .kpi-bal-pos .lbl,.kpi-bal-pos .val{color:#059669}
    .kpi-bal-zero{background:rgba(100,116,139,.08);border-color:rgba(100,116,139,.2)}
    .kpi-bal-zero .lbl,.kpi-bal-zero .val{color:#475569}

    /* ── الجدول ── */
    table{width:100%;border-collapse:collapse}
    thead th{background:#1a1a2e;color:#fff;padding:6px 8px;font-size:8.5px;font-weight:700;text-align:right;white-space:nowrap}
    tbody td{padding:5px 8px;font-size:8.5px;border-bottom:1px solid #eee;text-align:right}
    tbody tr:nth-child(even){background:#f8f9ff}
    .mono{font-variant-numeric:tabular-nums;direction:ltr;text-align:left}
    .amt{text-align:left}
    .bold{font-weight:700}
    .dim{color:#94a3b8}
    .clr-db{color:#1d4ed8;font-weight:700}
    .clr-cr{color:#059669;font-weight:700}
    .clr-neg{color:#dc2626}
    .clr-pos{color:#059669}
    .badge-type{display:inline-block;padding:2px 6px;border-radius:4px;font-size:8px;font-weight:700}
    .badge-type.db{background:rgba(29,78,216,.1);color:#1d4ed8}
    .badge-type.cr{background:rgba(16,185,129,.1);color:#059669}

    /* ── فوتر ── */
    .ftr{margin-top:12px;padding-top:8px;border-top:2px solid #1d4ed8;display:flex;justify-content:space-between;font-size:8px;color:#666}
  </style>
</head>
<body>

  <!-- هيدر الشركة الأزرق -->
  <div class="co-header">
    <div class="co-left">
      ${z?`<img class="co-logo" src="${z}" alt="">`:""}
      <div>
        <div class="co-name">${r}</div>
        ${s?`<div class="co-line">📍 ${s}</div>`:""}
        ${E?`<div class="co-line">📞 ${E}</div>`:""}
        ${c?`<div class="co-line">✉️ ${c}</div>`:""}
        ${C?`<div class="co-line">🔢 الرقم الضريبي: ${C}</div>`:""}
      </div>
    </div>
    <div class="co-date"><strong>${p}</strong>${t}</div>
  </div>

  <!-- شريط كشف الحساب -->
  <div class="stmt-strip">
    <div>
      <h2>كشف حساب: ${a}</h2>
      <div class="sub">${i}</div>
    </div>
    <div class="period">الفترة: ${m} — ${l} &nbsp;|&nbsp; ${g}</div>
  </div>

  <!-- كروت المدين / الدائن / الرصيد -->
  <div class="kpi-row">
    <div class="kpi-card kpi-db">
      <div class="lbl">📤 إجمالي المدين (+)</div>
      <div class="val">${d}</div>
    </div>
    <div class="kpi-card kpi-cr">
      <div class="lbl">📥 إجمالي الدائن (-)</div>
      <div class="val">${o}</div>
    </div>
    <div class="kpi-card ${y.length&&y[y.length-1].balance>0?"kpi-bal-neg":y.length&&y[y.length-1].balance<0?"kpi-bal-pos":"kpi-bal-zero"}">
      <div class="lbl">⚖️ الرصيد النهائي</div>
      <div class="val">${n}</div>
    </div>
  </div>

  <!-- الجدول -->
  <table>
    <thead>
      <tr>
        <th>التاريخ</th>
        <th>نوع الحركة</th>
        <th>رقم المستند</th>
        <th>البيان / ملاحظات</th>
        <th>مدين (+)</th>
        <th>دائن (-)</th>
        <th>الرصيد المترتب</th>
      </tr>
    </thead>
    <tbody>${x}</tbody>
  </table>

  <div class="ftr">
    <span>${r}</span>
    <span>طُبع بتاريخ: ${p} ${t} — عدد الحركات: ${y.length}</span>
  </div>

  <script>window.onload = () => { window.print(); }<\/script>
</body></html>`,$=window.open("","_blank");$.document.write(D),$.document.close()};window.exportStatementExcel=()=>{if(!y||y.length===0){showToast("لا توجد بيانات لتصديرها","warning");return}const a=document.getElementById("stmt-entity-name")?.textContent||"Statement",i=["التاريخ","نوع الحركة","رقم المستند","البيان","مدين (+)","دائن (-)","الرصيد"],d=y.map(o=>[o.date,o.type,o.docNum,o.notes,o.debit||0,o.credit||0,o.balance||0]);window.exportXLSX({filename:`كشف_حساب_${a.replace(/\s+/g,"_")}_${V()}`,headers:i,rows:d,sheetName:"كشف الحساب"})};export{nt as render};
