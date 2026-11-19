const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/debt-acknowledgment.js_v_2-H-BqRKEN.js","assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css","assets/trust-receipts.js_v_2-LckJk5Y_.js"])))=>i.map(i=>d[i]);
import{s as tt,t as U,g as H,C as I,f as k,d as M,a as O,e as G,_ as Z}from"./index-CF9GFeRJ.js";import{orderBy as q,query as v,where as h,limit as w,getDocs as x,collection as F}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function mt(n,i){n.innerHTML=`
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
        <input type="date" id="stmt-from" value="${tt()}" onchange="loadStatement()" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="stmt-to" value="${U()}" onchange="loadStatement()" />
      </div>

      <!-- أزرار التصدير -->
      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn-export" style="background:#4338ca; color:#fff; border-color:#6366f1;" onclick="openDebtAckFromReportStatement()" title="إصدار إقرار مديونية وتعهد سداد"><span>⚖️</span> إقرار مديونية</button>
        <button class="btn-export" style="background:#0369a1; color:#fff; border-color:#0284c7;" onclick="openTrustReceiptFromReportStatement()" title="إصدار سند أمانة وعهدة مالية (م/79)"><span>🛡️</span> سند أمانة</button>
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
    </div>`,await et()}let V=[],Q=[],W=[],f=[],j="",B="customer";async function et(){try{const[n,i,d]=await Promise.all([H(I.customers(),[q("name")]),H(I.suppliers(),[q("name")]),H(I.salesReps(),[q("name")])]);if(V=n,Q=i,W=d,window._preselectedStatementEntity){const a=window._preselectedStatementEntity;window._preselectedStatementEntity=null;const s=document.getElementById("stmt-type-select");s&&(s.value=a.type),B=a.type;const r=(a.type==="customer"?V:a.type==="supplier"?Q:W).find(m=>m.id===a.id);if(r){const m=document.getElementById("stmt-entity-search"),y=document.getElementById("stmt-entity-id");m&&(m.value=r.name),y&&(y.value=r.id),j=r.id,await loadStatement()}}document.addEventListener("click",a=>{const s=document.getElementById("stmt-entity-results"),p=document.getElementById("stmt-entity-search");s&&!s.contains(a.target)&&a.target!==p&&(s.style.display="none")})}catch(n){console.error("Statement init error:",n)}}window.onStatementTypeChange=()=>{B=document.getElementById("stmt-type-select")?.value||"customer",j="";const n=document.getElementById("stmt-entity-label"),i=document.getElementById("stmt-entity-search"),d=document.getElementById("stmt-entity-id"),a=document.getElementById("stmt-entity-results");i&&(i.value=""),d&&(d.value=""),a&&(a.style.display="none"),n&&(n.textContent=B==="customer"?"🔍 ابحث عن العميل":B==="supplier"?"🔍 ابحث عن المورد":"🔍 ابحث عن المندوب"),document.getElementById("stmt-rep-perf-panel")?.classList.add("hidden");const s=document.getElementById("stmt-tbody");s&&(s.innerHTML='<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">حدد الكيان لعرض كشف الحساب</td></tr>'),document.getElementById("stmt-total-debit").textContent="0.00 ر.س",document.getElementById("stmt-total-credit").textContent="0.00 ر.س",document.getElementById("stmt-closing-balance").textContent="0.00 ر.س",document.getElementById("stmt-closing-status-box").style.display="none",document.getElementById("stmt-entity-name").textContent="كشف حساب موحد",document.getElementById("stmt-entity-details").textContent="حدد نوع الحساب والكيان لعرض الحركة التفصيلية"};window.onStmtSearchInput=()=>{const n=(document.getElementById("stmt-entity-search")?.value||"").trim().toLowerCase(),i=document.getElementById("stmt-entity-results");if(!i)return;if(!n){i.style.display="none";return}const a=(B==="customer"?V:B==="supplier"?Q:W).filter(s=>(s.name||"").toLowerCase().includes(n)||(s.code||"").toLowerCase().includes(n)||(s.phone||"").includes(n)).slice(0,15);if(!a.length){i.innerHTML='<div style="padding:12px;text-align:center;color:var(--text-2);font-size:12px;">لا توجد نتائج</div>',i.style.display="block";return}i.innerHTML=a.map(s=>`
    <div onclick="selectStmtEntity('${s.id}')"
      style="padding:10px 14px; border-bottom:1px solid var(--border-soft); cursor:pointer;
             display:flex; justify-content:space-between; align-items:center;
             transition:background .15s;"
      onmouseover="this.style.background='var(--bg-hover)'"
      onmouseout="this.style.background=''">
      <div>
        <div style="font-weight:700; font-size:13px; color:var(--text-0);">${s.name}</div>
        <div style="font-size:11px; color:var(--text-2);">${s.phone||"—"} ${s.code?"• "+s.code:""}</div>
      </div>
      <div style="font-size:11px; color:var(--brand); font-weight:700;">
        ${B==="rep"?s.zone||"":s.phone||""}
      </div>
    </div>
  `).join(""),i.style.display="block"};window.selectStmtEntity=async n=>{j=n;const d=(B==="customer"?V:B==="supplier"?Q:W).find(r=>r.id===n),a=document.getElementById("stmt-entity-search"),s=document.getElementById("stmt-entity-id"),p=document.getElementById("stmt-entity-results");a&&d&&(a.value=d.name),s&&(s.value=n),p&&(p.style.display="none"),await loadStatement()};window.loadStatement=async()=>{const n=document.getElementById("stmt-type-select")?.value||B,i=j||document.getElementById("stmt-entity-id")?.value,d=document.getElementById("stmt-tbody"),a=document.getElementById("stmt-from")?.value,s=document.getElementById("stmt-to")?.value;if(!i){d&&(d.innerHTML='<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">حدد الكيان لعرض كشف الحساب</td></tr>'),document.getElementById("stmt-total-debit").textContent="0.00 ر.س",document.getElementById("stmt-total-credit").textContent="0.00 ر.س",document.getElementById("stmt-closing-balance").textContent="0.00 ر.س",document.getElementById("stmt-closing-status-box").style.display="none",document.getElementById("stmt-entity-name").textContent="كشف حساب موحد";return}d&&(d.innerHTML=`${Array(6).fill(0).map(()=>`
      <tr class="skeleton-row">
        ${Array(7).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
      </tr>`).join("")}`);try{n==="customer"?await ot(i,a,s):n==="supplier"?await at(i,a,s):n==="rep"&&await nt(i,a,s)}catch(p){d&&(d.innerHTML=`<tr><td colspan="7"><div class="alert bad" style="margin:8px;">${p.message}</div></td></tr>`)}};async function ot(n,i,d){const a=V.find(e=>e.id===n);a&&(document.getElementById("stmt-entity-name").textContent=a.name,document.getElementById("stmt-entity-details").textContent=`الهاتف: ${a.phone||"—"} | المنطقة: ${a.zone||"—"} | حد الائتمان: ${k(a.creditLimit||0)}`);const s=v(I.salesInvoices(),h("customerId","==",n),w(500)),r=(await x(s)).docs.map(e=>e.data()),m=v(I.salesReturns(),h("customerId","==",n),w(500)),u=(await x(m)).docs.map(e=>e.data()),C=v(F(M,`companies/${O}/collections`),h("customerId","==",n),w(500)),c=(await x(C)).docs.map(e=>({id:e.id,...e.data()})),A=v(F(M,`companies/${O}/receipts`),h("targetId","==",n),w(500)),_=(await x(A)).docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.entityType==="customer"),$=v(F(M,`companies/${O}/deliveryNotes`),h("customerId","==",n),w(500)),D=(await x($).catch(()=>({docs:[]}))).docs.map(e=>({id:e.id,...e.data()}));let S=[];r.forEach(e=>{if(e.status==="cancelled")return;const l=(e.paymentMethod||"cash").toLowerCase();S.push({date:e.date||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:""),type:"فاتورة مبيعات",docNum:e.number||e.invoiceNumber||"",notes:`مبيعات ${e.lines?.length||0} صنف — ${l==="cash"?"نقدي":"آجل"}`,debit:e.totalWithVat||0,credit:0})}),(D||[]).forEach(e=>{if(e.status==="cancelled"||e.status==="void")return;const l=e.status==="converted_to_invoice",N=parseFloat(e.totalAmount||e.grandTotal||e.total||0),R=(e.paymentMethod||"credit").toLowerCase();S.push({date:e.date||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:""),type:"سند تسليم بضاعة (غير ضريبي)",docNum:e.number||e.dnNumber||`DN-${e.id.slice(0,6)}`,notes:e.notes||(l?"سند تسليم بضاعة (تم إصدار فاتورة ضريبية له)":`تسليم بضاعة ${e.lines?.length||0} صنف — ${R==="cash"?"نقدي":"آجل"}`),debit:l?0:N,credit:0})}),u.forEach(e=>{if(e.status==="cancelled"||e.status==="void")return;const l=e.number||e.creditNoteNumber||e.id||"",N=e.originalInvoiceNumber||e.refInvoice||"",R=parseFloat(e.totalWithVat!==void 0?e.totalWithVat:e.total!==void 0?e.total:e.subtotal||0);S.push({date:e.date||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:""),type:"إشعار دائن (مرتجع شامل الضريبة)",docNum:l,notes:`مردودات فاتورة ${N} — ${e.reason||""}`,debit:0,credit:R})}),c.forEach(e=>{S.push({date:e.date||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:""),type:"سند قبض وتحصيل (مبيعات)",docNum:e.number||`COL-${e.id.slice(0,5)}`,notes:`تحصيل نقدي — طريقة الدفع: ${e.method||"نقدي"} ${e.notes?"— "+e.notes:""}`,debit:0,credit:e.amount||0})}),_.forEach(e=>{S.push({date:e.date||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:""),type:"سند قبض",docNum:`RC-${e.id.substring(0,6).toUpperCase()}`,notes:`سند قبض — طريقة الدفع: ${e.method==="cash"?"نقدي":"تحويل بنكي"} — بيان: ${e.notes||""}`,debit:0,credit:e.amount||0})});try{const e=await x(v(F(M,`companies/${O}/chartOfAccounts`),h("sourceEntityId","==",n))).catch(()=>({docs:[]})),l=new Set,N=new Set;e.docs.forEach(L=>{N.add(L.id),L.data().code&&l.add(L.data().code)}),(await x(v(I.journalEntries(),w(500))).catch(()=>({docs:[]}))).docs.forEach(L=>{const g=L.data();if(g.status==="cancelled"||g.isReversed)return;const t=(g.sourceType||"").toLowerCase(),E=(g.refType||"").toLowerCase(),T=(g.description||"").toLowerCase();t==="salesinvoice"||t==="sales"||t==="receipt"||t==="salesreturn"||t==="sales_return"||t==="deliverynote"||t==="delivery_note"||t==="cogs"||t==="salescogs"||t==="deliverynote_cogs"||t==="collection"||E.includes("sales")||E.includes("receipt")||E.includes("invoice")||E.includes("delivery")||T.includes("مبيعات")||T.includes("فاتورة")||T.includes("سند قبض")||T.includes("سند تسليم")||(g.lines||[]).forEach(z=>{if(z.accountId&&N.has(z.accountId)||z.accountCode&&l.has(z.accountCode)||a&&z.accountName&&z.accountName.trim()===a.name.trim()){const K=parseFloat(z.debit||0),X=parseFloat(z.credit||0);(K>0||X>0)&&S.push({date:g.date||(g.createdAt?.toDate?g.createdAt.toDate().toISOString().split("T")[0]:""),type:"قيد يومية تسوية",docNum:g.entryNumber||g.number||`JE-${L.id.slice(0,6)}`,notes:g.description||z.note||"تسوية محاسبية",debit:K,credit:X})}})})}catch(e){console.warn("Manual JE fetch error:",e)}Y(S,i,d,"balance_due")}async function at(n,i,d){const a=Q.find(o=>o.id===n);a&&(document.getElementById("stmt-entity-name").textContent=a.name,document.getElementById("stmt-entity-details").textContent=`الهاتف: ${a.phone||"—"} | الرقم الضريبي: ${a.vatNumber||"—"}`);const s=v(I.purchaseInvoices(),h("supplierId","==",n),w(500)),r=(await x(s)).docs.map(o=>o.data()),m=v(I.purchaseReturns(),h("supplierId","==",n),w(500)),u=(await x(m)).docs.map(o=>o.data()),C=v(F(M,`companies/${O}/expenses`),h("targetId","==",n),w(500)),c=(await x(C)).docs.map(o=>({id:o.id,...o.data()})).filter(o=>o.entityType==="supplier"),A=v(F(M,`companies/${O}/receipts`),h("targetId","==",n),w(500)),_=(await x(A)).docs.map(o=>({id:o.id,...o.data()})).filter(o=>o.status!=="cancelled"&&(!o.entityType||o.entityType==="supplier"));let $=[];r.forEach(o=>{if(o.status!=="cancelled"&&($.push({date:o.date||(o.createdAt?.toDate?o.createdAt.toDate().toISOString().split("T")[0]:""),type:"فاتورة مشتريات",docNum:o.number,notes:`مشتريات ${o.lines?.length||0} صنف — ${o.paymentMethod==="cash"?"نقدي":"آجل"}`,debit:0,credit:o.totalWithVat||0}),o.paidAmount>0)){const D=o.date||(o.createdAt?.toDate?o.createdAt.toDate().toISOString().split("T")[0]:"");c.some(e=>(e.date||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:""))===D&&Math.abs((e.amount||0)-o.paidAmount)<.01)||$.push({date:D,type:"سداد دفعة للمورد (فاتورة)",docNum:`PAY-${o.number}`,notes:`سداد دفعة عن فاتورة ${o.number}`,debit:o.paidAmount,credit:0})}}),u.forEach(o=>{o.status==="cancelled"||o.status==="void"||$.push({date:o.date||(o.createdAt?.toDate?o.createdAt.toDate().toISOString().split("T")[0]:""),type:"إشعار مدين (مرتجع مشتريات)",docNum:o.number,notes:`مرتجع مشتريات للفاتورة ${o.originalInvoiceNumber||""} — ${o.reason||""}`,debit:o.totalWithVat||0,credit:0})}),c.forEach(o=>{o.status!=="cancelled"&&$.push({date:o.date||(o.createdAt?.toDate?o.createdAt.toDate().toISOString().split("T")[0]:""),type:"سند صرف للمورد",docNum:`PV-${o.id.substring(0,6).toUpperCase()}`,notes:`سند صرف — طريقة الدفع: ${o.method==="cash"?"نقدي":"تحويل بنكي"} — بيان: ${o.notes||""}`,debit:o.amount||0,credit:0})}),_.forEach(o=>{$.push({date:o.date||(o.createdAt?.toDate?o.createdAt.toDate().toISOString().split("T")[0]:""),type:"سند قبض من مورد (استرداد)",docNum:o.number||o.code||`RV-${o.id.substring(0,6).toUpperCase()}`,notes:`سند قبض من مورد — طريقة الاستلام: ${o.method==="cash"?"نقدي":"تحويل بنكي"} — بيان: ${o.notes||""}`,debit:0,credit:o.amount||0})}),Y($,i,d,"liability_due")}async function nt(n,i,d){const a=W.find(t=>t.id===n);a&&(document.getElementById("stmt-entity-name").textContent=a.name,document.getElementById("stmt-entity-details").textContent=`الهاتف: ${a.phone||"—"} | المسار: ${a.zone||"—"} | العمولة: ${a.commissionRate||0}%`),document.getElementById("stmt-rep-perf-panel").classList.remove("hidden");const s=v(I.salesInvoices(),h("repId","==",n),w(500)),r=(await x(s)).docs.map(t=>t.data()),m=v(I.salesReturns(),h("repId","==",n),w(500)),u=(await x(m)).docs.map(t=>t.data()),C=v(F(M,`companies/${O}/collections`),h("repId","==",n),w(500)),c=(await x(C)).docs.map(t=>({id:t.id,...t.data()})),A=v(F(M,`companies/${O}/deliveryNotes`),h("repId","==",n),w(500)),_=(await x(A).catch(()=>({docs:[]}))).docs.map(t=>t.data()),o=(await H(I.cashBoxes())).find(t=>t.keeper?.trim()===a.name.trim()||t.name.includes(a.name));let D=[];if(o){const t=v(I.cashTransactions(),h("cashBoxId","==",o.id),w(1e3));D=(await x(t)).docs.map(T=>T.data())}let S=0,e=0,l=0,N=0;r.forEach(t=>{t.status!=="cancelled"&&(S+=t.totalWithVat||0,t.paidAmount>0&&(l+=t.paidAmount))}),u.forEach(t=>{if(t.status==="cancelled")return;const E=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total!==void 0?t.total:t.subtotal||0);e+=E}),c.forEach(t=>{l+=t.amount||0}),D.forEach(t=>{t.type==="out"&&(N+=t.amount||0)});const R=S*(a.commissionRate||0)/100,L=o?o.balance||0:Math.max(0,l-N);document.getElementById("stmt-rep-sales").textContent=k(S),document.getElementById("stmt-rep-commission").textContent=k(R),document.getElementById("stmt-rep-returns").textContent=k(e),document.getElementById("stmt-rep-collections").textContent=k(l),document.getElementById("stmt-rep-handovers").textContent=k(N),document.getElementById("stmt-rep-vault-balance").textContent=k(L);let g=[];r.forEach(t=>{t.status!=="cancelled"&&g.push({date:t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:""),type:"مبيعات مندوب (فاتورة)",docNum:t.number,notes:`فاتورة مبيعات للعميل ${t.customerName} (${t.lines?.length||0} صنف)`,debit:t.totalWithVat||0,credit:0})}),(_||[]).forEach(t=>{if(t.status==="cancelled"||t.status==="void")return;const E=t.status==="converted_to_invoice",T=parseFloat(t.totalAmount||t.grandTotal||t.total||0);E||g.push({date:t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:""),type:"سند تسليم بضاعة لعملائه",docNum:t.number||t.dnNumber||"",notes:`تسليم بضاعة للعميل ${t.customerName||""} — (${t.lines?.length||0} صنف)`,debit:T,credit:0})}),u.forEach(t=>{if(t.status==="cancelled")return;const E=t.number||t.creditNoteNumber||t.id||"",T=t.originalInvoiceNumber||t.refInvoice||"",J=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total!==void 0?t.total:t.subtotal||0);g.push({date:t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:""),type:"مرتجع مبيعات لعملائه",docNum:E,notes:`مرتجع من العميل ${t.customerName} للفاتورة ${T}`,debit:0,credit:J})}),c.forEach(t=>{g.push({date:t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:""),type:"تحصيل نقدي من عميل",docNum:t.number||`COL-${t.id.slice(0,5)}`,notes:`تحصيل من العميل — طريقة السداد: ${t.method||"نقدي"}`,debit:0,credit:t.amount||0})}),D.forEach(t=>{if(t.type==="out"){const E=t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:"";g.push({date:E||U(),type:"تسليم نقدية للخزينة",docNum:"TRF-MAIN",notes:`توريد المندوب للخزينة: ${t.notes||"تصدير عهدة نقدية"}`,debit:0,credit:t.amount||0})}}),Y(g,i,d,"rep_sales_balance")}function Y(n,i,d,a){const s=document.getElementById("stmt-tbody");n.sort((c,A)=>new Date(c.date)-new Date(A.date)),(i||d)&&(n=n.filter(c=>(!i||c.date>=i)&&(!d||c.date<=d)));let p=0,r=0,m=0;f=n.map(c=>(p+=c.debit,r+=c.credit,m+=c.debit-c.credit,{...c,balance:m})),document.getElementById("stmt-total-debit").textContent=k(p),document.getElementById("stmt-total-credit").textContent=k(r);const y=document.getElementById("stmt-closing-balance");y.textContent=k(m);const u=y.closest(".stmt-kpi-card");u&&(m>0?(u.style.background="linear-gradient(135deg,rgba(239,68,68,.1),rgba(239,68,68,.04))",u.style.borderColor="rgba(239,68,68,.3)",y.style.color="#dc2626",u.querySelector(".kpi-label").style.color="#dc2626"):m<0?(u.style.background="linear-gradient(135deg,rgba(16,185,129,.1),rgba(16,185,129,.04))",u.style.borderColor="rgba(16,185,129,.3)",y.style.color="#059669",u.querySelector(".kpi-label").style.color="#059669"):(u.style.background="linear-gradient(135deg,rgba(100,116,139,.08),rgba(100,116,139,.03))",u.style.borderColor="rgba(100,116,139,.2)",y.style.color="#475569",u.querySelector(".kpi-label").style.color="#475569"));const C=document.getElementById("stmt-closing-status-box"),b=document.getElementById("stmt-closing-status");if(C.style.display="block",a==="balance_due"?m>0?(b.className="badge bad",b.textContent="مستحق عليه (ذمم مدينة)"):m<0?(b.className="badge good",b.textContent="مستحق له (دائن)"):(b.className="badge neutral",b.textContent="حساب متزن"):a==="liability_due"?m>0?(b.className="badge good",b.textContent="مستحق لنا (مدين)"):m<0?(b.className="badge bad",b.textContent="مستحق له (ذمم دائنة)"):(b.className="badge neutral",b.textContent="حساب متزن"):(b.className="badge indigo",b.textContent="رصيد الأنشطة والتحصيل"),f.length===0){s.innerHTML='<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد حركات مالية مسجلة في هذه الفترة</td></tr>';return}s.innerHTML=f.map(c=>`
    <tr>
      <td class="dim">${G(c.date)}</td>
      <td><span class="badge ${c.debit>0?"indigo":"good"}" style="font-size:10.5px;">${c.type}</span></td>
      <td class="mono font-semibold text-indigo">${c.docNum}</td>
      <td>${c.notes}</td>
      <td class="mono ${c.debit>0?"text-indigo font-bold":"dim"}">${c.debit>0?k(c.debit):"—"}</td>
      <td class="mono ${c.credit>0?"text-good font-bold":"dim"}">${c.credit>0?k(c.credit):"—"}</td>
      <td class="mono font-bold ${c.balance>0?"text-bad":"text-good"}">${k(c.balance)}</td>
    </tr>`).join("")}window.exportStatement=()=>{const n=document.getElementById("stmt-entity-name")?.textContent||"Statement",i=[["التاريخ","نوع الحركة","رقم المستند","البيان والملخص","مدين (+)","دائن (-)","الرصيد المترتب"]];f.forEach(s=>i.push([s.date,s.type,s.docNum,s.notes,s.debit,s.credit,s.balance]));const d=i.map(s=>s.map(p=>`"${p}"`).join(",")).join(`
`),a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\uFEFF"+d],{type:"text/csv;charset=utf-8;"})),a.download=`statement_${n.replace(/\s+/g,"_")}_${U()}.csv`,a.click(),showToast("تم تصدير كشف الحساب بنجاح","success")};window.exportStatementPDF=()=>{if(!f||f.length===0){showToast("لا توجد بيانات للطباعة","warning");return}const n=document.getElementById("stmt-entity-name")?.textContent||"",i=document.getElementById("stmt-entity-details")?.textContent||"",d=document.getElementById("stmt-total-debit")?.textContent||"0.00 ر.س",a=document.getElementById("stmt-total-credit")?.textContent||"0.00 ر.س",s=document.getElementById("stmt-closing-balance")?.textContent||"0.00 ر.س",p=document.getElementById("stmt-closing-status")?.textContent||"",r=document.getElementById("stmt-from")?.value||"",m=document.getElementById("stmt-to")?.value||"",y=window.ERP_COMPANY||{},u=y.name||"شركة نظم الإمداد المتطورة",C=y.phone||"",b=y.email||"",c=y.address||"",A=y.vatNumber||"",P=y.logo||"",_=new Date,$=_.toLocaleDateString("ar-SA"),o=_.toLocaleTimeString("ar-SA"),D=f.map(l=>`
    <tr>
      <td>${G(l.date)}</td>
      <td><span class="badge-type ${l.debit>0?"db":"cr"}">${l.type}</span></td>
      <td class="mono">${l.docNum||"—"}</td>
      <td>${l.notes||""}</td>
      <td class="mono amt ${l.debit>0?"clr-db":"dim"}">${l.debit>0?l.debit.toFixed(2):"—"}</td>
      <td class="mono amt ${l.credit>0?"clr-cr":"dim"}">${l.credit>0?l.credit.toFixed(2):"—"}</td>
      <td class="mono amt bold ${l.balance>0?"clr-neg":l.balance<0?"clr-pos":""}">${l.balance.toFixed(2)}</td>
    </tr>`).join(""),S=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>كشف حساب: ${n}</title>
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
      ${P?`<img class="co-logo" src="${P}" alt="">`:""}
      <div>
        <div class="co-name">${u}</div>
        ${c?`<div class="co-line">📍 ${c}</div>`:""}
        ${C?`<div class="co-line">📞 ${C}</div>`:""}
        ${b?`<div class="co-line">✉️ ${b}</div>`:""}
        ${A?`<div class="co-line">🔢 الرقم الضريبي: ${A}</div>`:""}
      </div>
    </div>
    <div class="co-date"><strong>${$}</strong>${o}</div>
  </div>

  <!-- شريط كشف الحساب -->
  <div class="stmt-strip">
    <div>
      <h2>كشف حساب: ${n}</h2>
      <div class="sub">${i}</div>
    </div>
    <div class="period">الفترة: ${r} — ${m} &nbsp;|&nbsp; ${p}</div>
  </div>

  <!-- كروت المدين / الدائن / الرصيد -->
  <div class="kpi-row">
    <div class="kpi-card kpi-db">
      <div class="lbl">📤 إجمالي المدين (+)</div>
      <div class="val">${d}</div>
    </div>
    <div class="kpi-card kpi-cr">
      <div class="lbl">📥 إجمالي الدائن (-)</div>
      <div class="val">${a}</div>
    </div>
    <div class="kpi-card ${f.length&&f[f.length-1].balance>0?"kpi-bal-neg":f.length&&f[f.length-1].balance<0?"kpi-bal-pos":"kpi-bal-zero"}">
      <div class="lbl">⚖️ الرصيد النهائي</div>
      <div class="val">${s}</div>
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
    <tbody>${D}</tbody>
  </table>

  <div class="ftr">
    <span>${u}</span>
    <span>طُبع بتاريخ: ${$} ${o} — عدد الحركات: ${f.length}</span>
  </div>

  <script>window.onload = () => { window.print(); }<\/script>
</body></html>`,e=window.open("","_blank");e.document.write(S),e.document.close()};window.exportStatementExcel=()=>{if(!f||f.length===0){showToast("لا توجد بيانات لتصديرها","warning");return}const n=document.getElementById("stmt-entity-name")?.textContent||"Statement",i=["التاريخ","نوع الحركة","رقم المستند","البيان","مدين (+)","دائن (-)","الرصيد"],d=f.map(a=>[a.date,a.type,a.docNum,a.notes,a.debit||0,a.credit||0,a.balance||0]);window.exportXLSX({filename:`كشف_حساب_${n.replace(/\s+/g,"_")}_${U()}`,headers:i,rows:d,sheetName:"كشف الحساب"})};window.openDebtAckFromReportStatement=async()=>{const i=(document.getElementById("stmt-type-select")?.value||B)==="customer"?j||document.getElementById("stmt-entity-id")?.value:null,d=document.getElementById("stmt-closing-balance");let a=d?d.textContent.replace(/[^\d.-]/g,""):"0";const s=parseFloat(a)||0,p=document.getElementById("stmt-to")?.value||"";try{const{openDebtAcknowledgmentModal:r}=await Z(async()=>{const{openDebtAcknowledgmentModal:m}=await import("./debt-acknowledgment.js_v_2-H-BqRKEN.js");return{openDebtAcknowledgmentModal:m}},__vite__mapDeps([0,1,2]));r(i||null,{amount:s>0?s:void 0,asOfDate:p||void 0})}catch(r){console.error("Failed to open debt acknowledgment modal:",r),alert("تعذر فتح نموذج إقرار المديونية: "+(r.message||r))}};window.openTrustReceiptFromReportStatement=async()=>{const i=(document.getElementById("stmt-type-select")?.value||B)==="customer"?j||document.getElementById("stmt-entity-id")?.value:null,d=document.getElementById("stmt-closing-balance");let a=d?d.textContent.replace(/[^\d.-]/g,""):"0";const s=parseFloat(a)||0;try{const{openTrustReceiptModal:p}=await Z(async()=>{const{openTrustReceiptModal:r}=await import("./trust-receipts.js_v_2-LckJk5Y_.js");return{openTrustReceiptModal:r}},__vite__mapDeps([3,1,2]));p(i||null,{amount:s>0?s:void 0})}catch(p){console.error("Failed to open trust receipt modal:",p),alert("تعذر فتح نموذج سند الأمانة: "+(p.message||p))}};export{mt as render};
