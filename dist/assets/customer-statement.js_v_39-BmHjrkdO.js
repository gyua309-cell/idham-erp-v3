import{s as W,t as z,g as D,C as y,f as p,d as T,a as A,b as F}from"./index-HrCilPJ3.js";import{orderBy as M,query as g,where as b,limit as x,getDocs as v,collection as N}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function et(o,l){o.innerHTML=`
    <div class="filterbar no-print">
      <!-- Entity Type Selector -->
      <div class="filter-select-group" style="min-width:160px;">
        <label>نوع الحساب</label>
        <select id="stmt-type-select" onchange="onStatementTypeChange()">
          <option value="customer">عميل (Customer)</option>
          <option value="supplier">مورد (Supplier)</option>
          <option value="rep">مندوب مبيعات (Sales Rep)</option>
        </select>
      </div>
      
      <!-- Entity Selector -->
      <div class="filter-select-group" style="min-width:240px;">
        <label id="stmt-entity-label">اختر العميل</label>
        <select id="stmt-entity-select" onchange="loadStatement()">
          <option value="">اختر...</option>
        </select>
      </div>
      
      <!-- Date Range Filters -->
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="stmt-from" value="${W()}" onchange="loadStatement()" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="stmt-to" value="${z()}" onchange="loadStatement()" />
      </div>
      
      <!-- Export Buttons -->
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn-export" onclick="exportStatementPDF()" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportStatementExcel()" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة كشف الحساب"><span>🖨️</span> طباعة</button>
      </div>
    </div>

    <div class="page-content">
      <!-- Summary stat cards banner -->
      <div class="grid-3 gap-16 mb-20" id="stmt-summary-cards">
        <!-- Stat 1: Total Debit -->
        <div class="card" style="padding:16px;">
          <div class="text-2 mb-4" style="font-size:12px;">إجمالي المدين (+)</div>
          <div class="mono font-bold text-indigo" style="font-size:22px;" id="stmt-total-debit">0.00 ر.س</div>
        </div>
        <!-- Stat 2: Total Credit -->
        <div class="card" style="padding:16px;">
          <div class="text-2 mb-4" style="font-size:12px;">إجمالي الدائن (-)</div>
          <div class="mono font-bold text-good" style="font-size:22px;" id="stmt-total-credit">0.00 ر.س</div>
        </div>
        <!-- Stat 3: Closing Balance -->
        <div class="card" style="padding:16px;">
          <div class="text-2 mb-4" style="font-size:12px;">الرصيد النهائي (الصافي)</div>
          <div class="mono font-bold text-bad" style="font-size:22px;" id="stmt-closing-balance">0.00 ر.س</div>
        </div>
      </div>

      <!-- Header Banner -->
      <div class="card mb-20" id="stmt-header-card">
        <div class="card-body" style="padding:24px;">
          <div class="flex justify-between items-center">
            <div>
              <h2 style="font-family:var(--font-heading);font-size:20px;margin-bottom:4px;" id="stmt-entity-name">كشف حساب موحد</h2>
              <div class="text-2" style="font-size:12px;" id="stmt-entity-details">حدد نوع الحساب والكيان لعرض الحركة التفصيلية</div>
            </div>
            <div class="text-left" style="display:none;" id="stmt-closing-status-box">
              <span class="badge" id="stmt-closing-status" style="font-size:13px; padding:6px 14px;">—</span>
            </div>
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
    </div>`,await j()}let _=[],O=[],k=[],h=[];async function j(){try{const[o,l,s]=await Promise.all([D(y.customers(),[M("name")]),D(y.suppliers(),[M("name")]),D(y.salesReps(),[M("name")])]);if(_=o,O=l,k=s,window._preselectedStatementEntity){const a=window._preselectedStatementEntity;window._preselectedStatementEntity=null;const d=document.getElementById("stmt-type-select");if(d){d.value=a.type,await onStatementTypeChange();const c=document.getElementById("stmt-entity-select");c&&(c.value=a.id,await loadStatement())}}else await onStatementTypeChange()}catch(o){console.error("Statement init error:",o)}}window.onStatementTypeChange=async()=>{const o=document.getElementById("stmt-type-select").value,l=document.getElementById("stmt-entity-label"),s=document.getElementById("stmt-entity-select"),a=document.getElementById("stmt-rep-perf-panel");if(!s||!l)return;s.innerHTML='<option value="">اختر...</option>',a?.classList.add("hidden"),o==="customer"?(l.textContent="اختر العميل",_.forEach(c=>{s.innerHTML+=`<option value="${c.id}">${c.name} (${c.phone||"بلا هاتف"})</option>`})):o==="supplier"?(l.textContent="اختر المورد",O.forEach(c=>{s.innerHTML+=`<option value="${c.id}">${c.name} (${c.phone||"بلا هاتف"})</option>`})):o==="rep"&&(l.textContent="اختر المندوب",k.forEach(c=>{s.innerHTML+=`<option value="${c.id}">${c.name} (${c.zone||"بلا مسار"})</option>`}));const d=document.getElementById("stmt-tbody");d&&(d.innerHTML='<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">حدد الكيان لعرض كشف الحساب</td></tr>'),document.getElementById("stmt-total-debit").textContent="0.00 ر.س",document.getElementById("stmt-total-credit").textContent="0.00 ر.س",document.getElementById("stmt-closing-balance").textContent="0.00 ر.س",document.getElementById("stmt-closing-status-box").style.display="none",document.getElementById("stmt-entity-name").textContent="كشف حساب موحد",document.getElementById("stmt-entity-details").textContent="حدد نوع الحساب والكيان لعرض الحركة التفصيلية"};window.loadStatement=async()=>{const o=document.getElementById("stmt-type-select")?.value,l=document.getElementById("stmt-entity-select")?.value,s=document.getElementById("stmt-tbody"),a=document.getElementById("stmt-from")?.value,d=document.getElementById("stmt-to")?.value;if(!l){s&&(s.innerHTML='<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">حدد الكيان لعرض كشف الحساب</td></tr>'),document.getElementById("stmt-total-debit").textContent="0.00 ر.س",document.getElementById("stmt-total-credit").textContent="0.00 ر.س",document.getElementById("stmt-closing-balance").textContent="0.00 ر.س",document.getElementById("stmt-closing-status-box").style.display="none",document.getElementById("stmt-entity-name").textContent="كشف حساب موحد";return}s&&(s.innerHTML=`${Array(6).fill(0).map(()=>`
      <tr class="skeleton-row">
        ${Array(7).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
      </tr>`).join("")}`);try{o==="customer"?await U(l,a,d):o==="supplier"?await X(l,a,d):o==="rep"&&await Y(l,a,d)}catch(c){s&&(s.innerHTML=`<tr><td colspan="7"><div class="alert bad" style="margin:8px;">${c.message}</div></td></tr>`)}};async function U(o,l,s){const a=_.find(t=>t.id===o);a&&(document.getElementById("stmt-entity-name").textContent=a.name,document.getElementById("stmt-entity-details").textContent=`الهاتف: ${a.phone||"—"} | المنطقة: ${a.zone||"—"} | حد الائتمان: ${p(a.creditLimit||0)}`);const d=g(y.salesInvoices(),b("customerId","==",o),x(500)),m=(await v(d)).docs.map(t=>t.data()),u=g(y.salesReturns(),b("customerId","==",o),x(500)),r=(await v(u)).docs.map(t=>t.data()),i=g(N(T,`companies/${A}/collections`),b("customerId","==",o),x(500)),I=(await v(i)).docs.map(t=>({id:t.id,...t.data()})),S=g(N(T,`companies/${A}/receipts`),b("targetId","==",o),x(500)),E=(await v(S)).docs.map(t=>({id:t.id,...t.data()})).filter(t=>t.entityType==="customer");let f=[];m.forEach(t=>{if(t.status==="cancelled")return;const $=(t.paymentMethod||"cash").toLowerCase();f.push({date:t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:""),type:"فاتورة مبيعات",docNum:t.number||t.invoiceNumber||"",notes:`مبيعات ${t.lines?.length||0} صنف — ${$==="cash"?"نقدي":"آجل"}`,debit:t.totalWithVat||0,credit:0})}),r.forEach(t=>{t.status==="cancelled"||t.status==="void"||f.push({date:t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:""),type:"إشعار دائن (مرتجع)",docNum:t.number,notes:`مردودات فاتورة ${t.originalInvoiceNumber||""} — ${t.reason||""}`,debit:0,credit:t.totalWithVat||0})}),I.forEach(t=>{f.push({date:t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:""),type:"سند قبض وتحصيل (مبيعات)",docNum:t.number||`COL-${t.id.slice(0,5)}`,notes:`تحصيل نقدي — طريقة الدفع: ${t.method||"نقدي"} ${t.notes?"— "+t.notes:""}`,debit:0,credit:t.amount||0})}),E.forEach(t=>{f.push({date:t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:""),type:"سند قبض",docNum:`RC-${t.id.substring(0,6).toUpperCase()}`,notes:`سند قبض — طريقة الدفع: ${t.method==="cash"?"نقدي":"تحويل بنكي"} — بيان: ${t.notes||""}`,debit:0,credit:t.amount||0})}),R(f,l,s,"balance_due")}async function X(o,l,s){const a=O.find(n=>n.id===o);a&&(document.getElementById("stmt-entity-name").textContent=a.name,document.getElementById("stmt-entity-details").textContent=`الهاتف: ${a.phone||"—"} | الرقم الضريبي: ${a.vatNumber||"—"}`);const d=g(y.purchaseInvoices(),b("supplierId","==",o),x(500)),m=(await v(d)).docs.map(n=>n.data()),u=g(y.purchaseReturns(),b("supplierId","==",o),x(500)),r=(await v(u)).docs.map(n=>n.data()),i=g(N(T,`companies/${A}/expenses`),b("targetId","==",o),x(500)),I=(await v(i)).docs.map(n=>({id:n.id,...n.data()})).filter(n=>n.entityType==="supplier");let S=[];m.forEach(n=>{if(n.status!=="cancelled"&&(S.push({date:n.date||(n.createdAt?.toDate?n.createdAt.toDate().toISOString().split("T")[0]:""),type:"فاتورة مشتريات",docNum:n.number,notes:`مشتريات ${n.lines?.length||0} صنف — ${n.paymentMethod==="cash"?"نقدي":"آجل"}`,debit:0,credit:n.totalWithVat||0}),n.paidAmount>0)){const E=n.date||(n.createdAt?.toDate?n.createdAt.toDate().toISOString().split("T")[0]:"");I.some(t=>(t.date||(t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:""))===E&&Math.abs((t.amount||0)-n.paidAmount)<.01)||S.push({date:E,type:"سداد دفعة للمورد (فاتورة)",docNum:`PAY-${n.number}`,notes:`سداد دفعة عن فاتورة ${n.number}`,debit:n.paidAmount,credit:0})}}),r.forEach(n=>{n.status==="cancelled"||n.status==="void"||S.push({date:n.date||(n.createdAt?.toDate?n.createdAt.toDate().toISOString().split("T")[0]:""),type:"إشعار مدين (مرتجع مشتريات)",docNum:n.number,notes:`مرتجع مشتريات للفاتورة ${n.originalInvoiceNumber||""} — ${n.reason||""}`,debit:n.totalWithVat||0,credit:0})}),I.forEach(n=>{S.push({date:n.date||(n.createdAt?.toDate?n.createdAt.toDate().toISOString().split("T")[0]:""),type:"سند صرف للمورد",docNum:`PV-${n.id.substring(0,6).toUpperCase()}`,notes:`سند صرف — طريقة الدفع: ${n.method==="cash"?"نقدي":"تحويل بنكي"} — بيان: ${n.notes||""}`,debit:n.amount||0,credit:0})}),R(S,l,s,"liability_due")}async function Y(o,l,s){const a=k.find(e=>e.id===o);a&&(document.getElementById("stmt-entity-name").textContent=a.name,document.getElementById("stmt-entity-details").textContent=`الهاتف: ${a.phone||"—"} | المسار: ${a.zone||"—"} | العمولة: ${a.commissionRate||0}%`),document.getElementById("stmt-rep-perf-panel").classList.remove("hidden");const d=g(y.salesInvoices(),b("repId","==",o),x(500)),m=(await v(d)).docs.map(e=>e.data()),u=g(y.salesReturns(),b("repId","==",o),x(500)),r=(await v(u)).docs.map(e=>e.data()),i=g(N(T,`companies/${A}/collections`),b("repId","==",o),x(500)),I=(await v(i)).docs.map(e=>({id:e.id,...e.data()})),n=(await D(y.cashBoxes())).find(e=>e.keeper?.trim()===a.name.trim()||e.name.includes(a.name));let E=[];if(n){const e=g(y.cashTransactions(),b("cashBoxId","==",n.id),x(1e3));E=(await v(e)).docs.map(V=>V.data())}let f=0,t=0,$=0,L=0;m.forEach(e=>{e.status!=="cancelled"&&(f+=e.totalWithVat||0,e.paidAmount>0&&($+=e.paidAmount))}),r.forEach(e=>{e.status!=="cancelled"&&(t+=e.totalWithVat||0)}),I.forEach(e=>{$+=e.amount||0}),E.forEach(e=>{e.type==="out"&&(L+=e.amount||0)});const P=f*(a.commissionRate||0)/100,Q=n?n.balance||0:Math.max(0,$-L);document.getElementById("stmt-rep-sales").textContent=p(f),document.getElementById("stmt-rep-commission").textContent=p(P),document.getElementById("stmt-rep-returns").textContent=p(t),document.getElementById("stmt-rep-collections").textContent=p($),document.getElementById("stmt-rep-handovers").textContent=p(L),document.getElementById("stmt-rep-vault-balance").textContent=p(Q);let w=[];m.forEach(e=>{e.status!=="cancelled"&&w.push({date:e.date||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:""),type:"مبيعات مندوب (فاتورة)",docNum:e.number,notes:`فاتورة مبيعات للعميل ${e.customerName} (${e.lines?.length||0} صنف)`,debit:e.totalWithVat||0,credit:0})}),r.forEach(e=>{e.status!=="cancelled"&&w.push({date:e.date||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:""),type:"مرتجع مبيعات لعملائه",docNum:e.number,notes:`مرتجع من العميل ${e.customerName} للفاتورة ${e.originalInvoiceNumber}`,debit:0,credit:e.totalWithVat||0})}),I.forEach(e=>{w.push({date:e.date||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:""),type:"تحصيل نقدي من عميل",docNum:e.number||`COL-${e.id.slice(0,5)}`,notes:`تحصيل من العميل — طريقة السداد: ${e.method||"نقدي"}`,debit:0,credit:e.amount||0})}),E.forEach(e=>{if(e.type==="out"){const H=e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:"";w.push({date:H||z(),type:"تسليم نقدية للخزينة",docNum:"TRF-MAIN",notes:`توريد المندوب للخزينة: ${e.notes||"تصدير عهدة نقدية"}`,debit:0,credit:e.amount||0})}}),R(w,l,s,"rep_sales_balance")}function R(o,l,s,a){const d=document.getElementById("stmt-tbody");o.sort((i,C)=>new Date(i.date)-new Date(C.date)),(l||s)&&(o=o.filter(i=>(!l||i.date>=l)&&(!s||i.date<=s)));let c=0,m=0,u=0;h=o.map(i=>(c+=i.debit,m+=i.credit,u+=i.debit-i.credit,{...i,balance:u})),document.getElementById("stmt-total-debit").textContent=p(c),document.getElementById("stmt-total-credit").textContent=p(m),document.getElementById("stmt-closing-balance").textContent=p(u);const B=document.getElementById("stmt-closing-status-box"),r=document.getElementById("stmt-closing-status");if(B.style.display="block",a==="balance_due"?u>0?(r.className="badge bad",r.textContent="مستحق عليه (ذمم مدينة)"):u<0?(r.className="badge good",r.textContent="مستحق له (دائن)"):(r.className="badge neutral",r.textContent="حساب متزن"):a==="liability_due"?u>0?(r.className="badge good",r.textContent="مستحق لنا (مدين)"):u<0?(r.className="badge bad",r.textContent="مستحق له (ذمم دائنة)"):(r.className="badge neutral",r.textContent="حساب متزن"):(r.className="badge indigo",r.textContent="رصيد الأنشطة والتحصيل"),h.length===0){d.innerHTML='<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد حركات مالية مسجلة في هذه الفترة</td></tr>';return}d.innerHTML=h.map(i=>`
    <tr>
      <td class="dim">${F(i.date)}</td>
      <td><span class="badge ${i.debit>0?"indigo":"good"}" style="font-size:10.5px;">${i.type}</span></td>
      <td class="mono font-semibold text-indigo">${i.docNum}</td>
      <td>${i.notes}</td>
      <td class="mono ${i.debit>0?"text-indigo font-bold":"dim"}">${i.debit>0?p(i.debit):"—"}</td>
      <td class="mono ${i.credit>0?"text-good font-bold":"dim"}">${i.credit>0?p(i.credit):"—"}</td>
      <td class="mono font-bold ${i.balance>0?"text-bad":"text-good"}">${p(i.balance)}</td>
    </tr>`).join("")}window.exportStatement=()=>{const o=document.getElementById("stmt-entity-name")?.textContent||"Statement",l=[["التاريخ","نوع الحركة","رقم المستند","البيان والملخص","مدين (+)","دائن (-)","الرصيد المترتب"]];h.forEach(d=>l.push([d.date,d.type,d.docNum,d.notes,d.debit,d.credit,d.balance]));const s=l.map(d=>d.map(c=>`"${c}"`).join(",")).join(`
`),a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\uFEFF"+s],{type:"text/csv;charset=utf-8;"})),a.download=`statement_${o.replace(/\s+/g,"_")}_${z()}.csv`,a.click(),showToast("تم تصدير كشف الحساب بنجاح","success")};window.exportStatementPDF=()=>{if(!h||h.length===0){showToast("لا توجد بيانات لتصديرها","warning");return}const o=document.getElementById("stmt-entity-name")?.textContent||"",l=parseFloat(document.getElementById("stmt-total-debit")?.textContent)||0,s=parseFloat(document.getElementById("stmt-total-credit")?.textContent)||0,a=document.getElementById("stmt-final-balance")?.textContent||"",d=["التاريخ","نوع الحركة","رقم المستند","البيان","مدين (+)","دائن (-)","الرصيد"],c=h.map(m=>[F(m.date),m.type,m.docNum,m.notes,m.debit>0?p(m.debit):"—",m.credit>0?p(m.credit):"—",p(m.balance)]);window.exportPDF({title:`كشف حساب: ${o}`,subtitle:`${document.getElementById("stmt-from")?.value||""} — ${document.getElementById("stmt-to")?.value||""}`,headers:d,rows:c,filename:`كشف_حساب_${(o||"").replace(/\s+/g,"_")}`,summary:{"إجمالي المدين":p(l),"إجمالي الدائن":p(s),"الرصيد الختامي":a},orientation:"landscape"})};window.exportStatementExcel=()=>{if(!h||h.length===0){showToast("لا توجد بيانات لتصديرها","warning");return}const o=document.getElementById("stmt-entity-name")?.textContent||"Statement",l=["التاريخ","نوع الحركة","رقم المستند","البيان","مدين (+)","دائن (-)","الرصيد"],s=h.map(a=>[a.date,a.type,a.docNum,a.notes,a.debit||0,a.credit||0,a.balance||0]);window.exportXLSX({filename:`كشف_حساب_${o.replace(/\s+/g,"_")}_${z()}`,headers:l,rows:s,sheetName:"كشف الحساب"})};export{et as render};
