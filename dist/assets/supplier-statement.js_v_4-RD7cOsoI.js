const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css"])))=>i.map(i=>d[i]);
import{g as Z,C as $,f as l,w as tt,h as et,_ as nt}from"./index-CF9GFeRJ.js";import{e as ot}from"./excel-DM5XZHtQ.js";import{orderBy as it,getDocs as E,query as C,where as N}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let I=[],k=null,c=null,z=null;const w=()=>new Date().toISOString().slice(0,10),at=()=>{const t=new Date;return t.setMonth(t.getMonth()-3),t.toISOString().slice(0,10)},K=()=>`${new Date().getFullYear()}-01-01`;function U(t){return t?String(t).trim().toLowerCase().replace(/[أإآء]/g,"ا").replace(/[ة]/g,"ه").replace(/[ى]/g,"ي").replace(/[\u064B-\u065F]/g,"").replace(/[\s\-_/.]/g,""):""}async function vt(t,a){t.innerHTML=`
    <!-- Top Filter Bar -->
    <div class="filterbar no-print" style="gap:10px; align-items:flex-end; flex-wrap:wrap; background:var(--bg-card); padding:14px 18px; border-radius:12px; margin-bottom:16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm);">
      
      <!-- 1. Smart Autocomplete Search by Supplier Name / Code / Phone / VAT -->
      <div style="position:relative; min-width:280px; flex:1; max-width:360px;">
        <label style="font-size:11px; font-weight:800; color:var(--text-1); display:flex; align-items:center; gap:5px; margin-bottom:5px;">
          <span>🔍</span> <span>بحث باسم المورد / الكود / الجوال:</span>
        </label>
        <div style="position:relative;">
          <input type="text" id="stmt-sup-search" class="input" placeholder="اكتب اسم المورد، الكود، الجوال أو الضريبي..." autocomplete="off" style="padding-left:30px; font-weight:600;" />
          <button type="button" id="stmt-sup-clear" onclick="window.clearSupplierSearch()" title="مسح البحث" style="position:absolute; left:8px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text-3); cursor:pointer; font-size:14px; display:none;">✕</button>
        </div>
        <div id="stmt-sup-results" class="autocomplete-dropdown hidden" style="position:absolute; top:calc(100% + 4px); left:0; right:0; z-index:9999; max-height:290px; overflow-y:auto; background:var(--bg-card); border:1px solid var(--border); border-radius:10px; box-shadow:0 12px 30px rgba(0,0,0,0.2);"></div>
      </div>

      <!-- 2. Dropdown Selector (Synchronized with search) -->
      <div class="filter-select-group" style="min-width:240px; flex:1; max-width:320px;">
        <label style="font-size:11px; font-weight:800; color:var(--text-1); display:flex; align-items:center; gap:5px; margin-bottom:5px;">
          <span>🏢</span> <span>أو اختر المورد من القائمة:</span>
        </label>
        <select id="stmt-sup-select" class="input" onchange="window.onSupplierSelectChange(this.value)" style="font-weight:600;">
          <option value="">-- اختر المورد لعرض الكشف --</option>
        </select>
      </div>

      <!-- 3. Date Range -->
      <div class="filter-date-group">
        <label style="font-size:11px; font-weight:800; color:var(--text-1); margin-bottom:5px; display:block;">من تاريخ</label>
        <input type="date" id="stmt-sup-from" class="input" value="${K()}" style="width:138px;" onchange="window.onSupplierDateChange()" />
      </div>

      <div class="filter-date-group">
        <label style="font-size:11px; font-weight:800; color:var(--text-1); margin-bottom:5px; display:block;">إلى تاريخ</label>
        <input type="date" id="stmt-sup-to" class="input" value="${w()}" style="width:138px;" onchange="window.onSupplierDateChange()" />
      </div>

      <!-- 4. Quick Period Filter Buttons -->
      <div style="display:flex; flex-direction:column; gap:5px;">
        <label style="font-size:11px; font-weight:800; color:var(--text-1); margin-bottom:0;">فترات سريعة:</label>
        <div style="display:flex; gap:4px;">
          <button class="btn btn-secondary btn-sm" id="btn-p-month" onclick="window.setSupplierPeriod('month')" title="الشهر الحالي">الشهر</button>
          <button class="btn btn-secondary btn-sm" id="btn-p-last-month" onclick="window.setSupplierPeriod('last_month')" title="الشهر السابق">السابق</button>
          <button class="btn btn-secondary btn-sm" id="btn-p-quarter" onclick="window.setSupplierPeriod('quarter')" title="آخر 3 أشهر">الربع</button>
          <button class="btn btn-primary btn-sm" id="btn-p-year" onclick="window.setSupplierPeriod('year')" title="من بداية السنة">السنة</button>
          <button class="btn btn-secondary btn-sm" id="btn-p-all" onclick="window.setSupplierPeriod('all')" title="كامل الفترة">شامل</button>
        </div>
      </div>

      <!-- 5. Actions Group -->
      <div style="margin-right:auto; display:flex; gap:6px; flex-wrap:wrap;">
        <button class="btn btn-secondary" id="stmt-btn-print" onclick="window.printSupplierStatement()" disabled title="طباعة كشف الحساب A4">🖨️ طباعة</button>
        <button class="btn btn-secondary" id="stmt-btn-excel" onclick="window.exportSupplierStatementExcel()" disabled title="تصدير جدول الحركات إلى ملف Excel">📊 Excel</button>
        <button class="btn btn-secondary" id="stmt-btn-wa" style="color:#25D366; border-color:rgba(37,211,102,0.4);" onclick="window.shareSupplierStatementWhatsApp()" disabled title="إرسال ملخص الحساب عبر واتساب">💬 واتساب</button>
        <button class="btn btn-secondary" id="stmt-btn-confirm" style="color:#6366f1; border-color:rgba(99,102,241,0.4);" onclick="window.printSupplierConfirmationLetter()" disabled title="خطاب مطابقة ومصادقة رصيد المورد">📑 مصادقة رصيد</button>
      </div>
    </div>

    <!-- Movement Type Filter Pills Bar (shown once a supplier is selected) -->
    <div id="stmt-sup-type-bar" class="no-print mb-16" style="display:none; align-items:center; gap:8px; flex-wrap:wrap; background:var(--bg-card); padding:10px 16px; border-radius:10px; border:1px solid var(--border-soft);">
      <span style="font-size:12px; font-weight:800; color:var(--text-1);">تصفية الحركات:</span>
      <button class="btn btn-primary btn-sm" id="btn-flt-all" onclick="window.filterSupplierStatementType('all')">🌟 كل الحركات (<span id="cnt-all">0</span>)</button>
      <button class="btn btn-secondary btn-sm" id="btn-flt-purchase" onclick="window.filterSupplierStatementType('purchase')">🏢 مشتريات (<span id="cnt-purchase">0</span>)</button>
      <button class="btn btn-secondary btn-sm" id="btn-flt-payment" onclick="window.filterSupplierStatementType('payment')">💵 سندات صرف (<span id="cnt-payment">0</span>)</button>
      <button class="btn btn-secondary btn-sm" id="btn-flt-receipt" onclick="window.filterSupplierStatementType('receipt')">📥 قبض واسترداد (<span id="cnt-receipt">0</span>)</button>
      <button class="btn btn-secondary btn-sm" id="btn-flt-return" onclick="window.filterSupplierStatementType('return')">↩️ مردودات شراء (<span id="cnt-return">0</span>)</button>
      <button class="btn btn-secondary btn-sm" id="btn-flt-journal" onclick="window.filterSupplierStatementType('journal')">⚖️ قيود وتسويات (<span id="cnt-journal">0</span>)</button>
    </div>

    <!-- Page Content Container -->
    <div class="page-content" id="supplier-statement-content">
      <div class="card" style="padding:56px 24px; text-align:center; color:var(--text-2); border-radius:14px; background:var(--bg-card); border:1px dashed var(--border);" id="stmt-sup-empty-placeholder">
        <div style="font-size:52px; margin-bottom:14px; animation:pulse 2s infinite;">📊</div>
        <div style="font-size:18px; font-weight:800; color:var(--text-0);">يرجى البحث عن المورد أو اختياره من القائمة أعلاه</div>
        <div style="font-size:13px; color:var(--text-2); margin-top:6px; max-width:540px; margin-left:auto; margin-right:auto;">
          يمكنك البحث باسم المورد، كود المورد، رقم الهاتف أو الرقم الضريبي. سيتم جلب كافة فواتير المشتريات، سندات الصرف، سندات الاسترداد، المردودات، والقيود اليومية التلقائية والافتتاحية بدقة متناهية.
        </div>
      </div>
    </div>

    <!-- Drill-down Document Preview Modal -->
    <div class="modal-overlay" id="doc-sup-preview-modal">
      <div class="modal modal-lg" style="max-width:760px; width:95%; border-radius:14px;">
        <div class="modal-header" style="padding:16px 22px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <h3 class="modal-title" id="doc-sup-modal-title" style="margin:0; font-size:16px; font-weight:800; color:var(--text-0);">تفاصيل المستند</h3>
          <button class="modal-close" onclick="closeModal('doc-sup-preview-modal')">×</button>
        </div>
        <div class="modal-body" id="doc-sup-modal-body" style="padding:22px; max-height:calc(85vh - 140px); overflow-y:auto;"></div>
        <div class="modal-footer" style="padding:14px 22px; border-top:1px solid var(--border-soft); display:flex; justify-content:flex-end;">
          <button class="btn btn-secondary" onclick="closeModal('doc-sup-preview-modal')">إغلاق</button>
        </div>
      </div>
    </div>
  `,await st(),rt(),lt()}async function st(){try{I=await Z($.suppliers(),[it("name")]);const t=document.getElementById("stmt-sup-select");if(!t)return;if(t.innerHTML='<option value="">-- اختر المورد لعرض الكشف --</option>'+I.map(a=>{const o=parseFloat(a.balance||0),i=o!==0?` (${l(Math.abs(o))} ${o>0?"دائن":"مدين"})`:"";return`<option value="${a.id}">${a.name}${a.code?" ["+a.code+"]":""}${i}</option>`}).join(""),k){t.value=k;const a=I.find(o=>o.id===k);if(a){const o=document.getElementById("stmt-sup-search");o&&(o.value=a.name)}await window.reloadSupplierStatement()}}catch(t){console.warn("Error loading suppliers for statement:",t)}}function rt(){const t=document.getElementById("stmt-sup-search"),a=document.getElementById("stmt-sup-results"),o=document.getElementById("stmt-sup-clear");!t||!a||(t.addEventListener("input",tt(()=>{const i=t.value.trim();if(o&&(o.style.display=i?"block":"none"),!i){a.classList.add("hidden");return}const s=U(i),d=i.toLowerCase(),u=i.replace(/[^0-9]/g,""),b=I.filter(r=>{const f=U(r.name),S=(r.code||"").toLowerCase(),y=(r.phone||"").replace(/[^0-9]/g,""),B=(r.vatNumber||"").replace(/[^0-9]/g,""),p=(r.address||"").toLowerCase();return f.includes(s)||S.includes(d)||u&&(y.includes(u)||B.includes(u))||p.includes(d)}).slice(0,15);if(!b.length){a.innerHTML=`
        <div style="padding:16px; text-align:center; color:var(--text-2); font-size:12.5px;">
          <span>🔍 لا يوجد مورد مطابق لـ: <b>"${i}"</b></span>
        </div>
      `,a.classList.remove("hidden");return}a.innerHTML=b.map(r=>{const f=parseFloat(r.balance||0),S=f>0,y=f<0,B=S?`<span class="badge" style="background:rgba(239,68,68,0.12); color:#dc2626; font-weight:800; font-size:11px;">مستحق له: ${l(f)}</span>`:y?`<span class="badge" style="background:rgba(16,185,129,0.12); color:#059669; font-weight:800; font-size:11px;">مدين لنا: ${l(Math.abs(f))}</span>`:'<span class="badge" style="background:rgba(100,116,139,0.12); color:var(--text-2); font-weight:700; font-size:11px;">متزن: 0.00</span>';return`
        <div class="autocomplete-item" onclick="window.selectSupplierForStmt('${r.id}')" style="padding:10px 14px; border-bottom:1px solid var(--border-soft); cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:background 0.15s ease;" onmouseover="this.style.background='var(--bg-2)'" onmouseout="this.style.background='transparent'">
          <div>
            <div style="font-weight:800; font-size:13.5px; color:var(--text-0);">${r.name}</div>
            <div style="font-size:11px; color:var(--text-2); margin-top:2px; display:flex; gap:10px;">
              <span>كود: <b>${r.code||"—"}</b></span>
              ${r.phone?`<span>هاتف: <span class="mono">${r.phone}</span></span>`:""}
              ${r.vatNumber?`<span>ضريبي: <span class="mono">${r.vatNumber}</span></span>`:""}
            </div>
          </div>
          <div style="text-align:left;">
            ${B}
          </div>
        </div>
      `}).join(""),a.classList.remove("hidden")},150)),document.addEventListener("click",i=>{!t.contains(i.target)&&!a.contains(i.target)&&a.classList.add("hidden")}))}async function dt(t,a,o){const i=I.find(n=>n.id===t)||await et("suppliers",t).catch(()=>null);if(z=i,!i)return null;const s=(i.name||"").trim().toLowerCase(),d=await E(C($.chartOfAccounts(),N("sourceEntityId","==",t))).catch(()=>({docs:[]})),u=new Set,b=new Set;d.docs.forEach(n=>{b.add(n.id),n.data().code&&u.add(n.data().code)});const[r,f,S,y,B]=await Promise.all([E(C($.purchaseInvoices(),N("supplierId","==",t))).catch(()=>({docs:[]})),E(C($.expenses?$.expenses():"expenses",N("targetId","==",t))).catch(()=>({docs:[]})),E(C($.receipts?$.receipts():"receipts",N("targetId","==",t))).catch(()=>({docs:[]})),E(C($.purchaseReturns?$.purchaseReturns():"purchaseReturns",N("supplierId","==",t))).catch(()=>({docs:[]})),E($.journalEntries()).catch(()=>({docs:[]}))]);let p=[];const L=f.docs.map(n=>({id:n.id,...n.data()})).filter(n=>n.status!=="cancelled");r.docs.forEach(n=>{const e=n.data();if(e.status==="cancelled")return;const g=e.date||e.invoiceDate||"",x=parseFloat(e.totalWithVat||e.grandTotal||e.total||0);p.push({id:n.id,docNumber:e.number||e.invoiceNumber||n.id.slice(0,8),date:g,type:"purchase",typeLabel:"فاتورة مشتريات",typeBadge:'<span class="badge" style="background:rgba(99,102,241,0.12); color:#4f46e5; border:1px solid rgba(99,102,241,0.3); font-weight:800;">🏢 فاتورة مشتريات</span>',description:e.notes||`شراء بضاعة ومواد غذائية (فاتورة ${e.number||""})`,debit:0,credit:x,raw:e});const h=parseFloat(e.paidAmount||0);if(h>0){const j=g||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:"");L.some(m=>(m.date||(m.createdAt?.toDate?m.createdAt.toDate().toISOString().split("T")[0]:""))===j&&Math.abs((m.amount||0)-h)<.01)||p.push({id:`${n.id}_paid`,docNumber:`PAY-${e.number||n.id.slice(0,6)}`,date:g,type:"payment",typeLabel:"سداد فوري مع الفاتورة",typeBadge:'<span class="badge good" style="font-weight:800;">💵 سداد فوري مع الشراء</span>',description:`دفعة نقدية مسددة فوراً مع فاتورة المشتريات رقم ${e.number||""}`,debit:h,credit:0,raw:{...e,voucherType:"direct_purchase_payment",amount:h}})}}),f.docs.forEach(n=>{const e=n.data();if(e.status==="cancelled")return;const g=e.date||"",x=parseFloat(e.amount||0);p.push({id:n.id,docNumber:e.number||e.voucherNumber||n.id.slice(0,8),date:g,type:"payment",typeLabel:"سند صرف",typeBadge:'<span class="badge good" style="font-weight:800;">💵 سند صرف للمورد</span>',description:e.notes||e.description||`سداد دفعة من الحساب (${e.paymentMethod||"تحويل بنكي / نقدي"})`,debit:x,credit:0,raw:e})}),S.docs.forEach(n=>{const e=n.data();if(e.status==="cancelled"||e.entityType&&e.entityType!=="supplier")return;const g=e.date||"",x=parseFloat(e.amount||0);p.push({id:n.id,docNumber:e.number||e.voucherNumber||`RV-${n.id.slice(0,6).toUpperCase()}`,date:g,type:"receipt",typeLabel:"سند قبض من مورد",typeBadge:'<span class="badge" style="background:rgba(16,185,129,0.12); color:#059669; border:1px solid rgba(16,185,129,0.3); font-weight:800;">📥 قبض واسترداد من مورد</span>',description:e.notes?`سند قبض من المورد — ${e.notes} (${e.sourceName||(e.method==="cash"?"نقدي":"بنكي")})`:`قبض/استرداد دفعة من المورد (${e.sourceName||"نقدي/بنكي"})`,debit:0,credit:x,raw:e})}),y.docs.forEach(n=>{const e=n.data();if(e.status==="cancelled"||e.status==="void")return;const g=e.date||"",x=parseFloat(e.totalWithVat||e.total||0);p.push({id:n.id,docNumber:e.number||e.returnNumber||n.id.slice(0,8),date:g,type:"return",typeLabel:"مردودات شراء",typeBadge:'<span class="badge warn" style="font-weight:800;">↩️ مردود شراء</span>',description:e.reason||e.notes||"مرتجع بضاعة ومواد غذائية للمورد",debit:x,credit:0,raw:e})}),B.docs.forEach(n=>{const e=n.data();if(e.status==="cancelled"||e.isReversed)return;const g=(e.sourceType||"").toLowerCase(),x=(e.refType||"").toLowerCase(),h=(e.description||"").toLowerCase(),j=e.auto===!0||g==="purchase"||g==="purchaseinvoice"||g==="purchase_invoice"||g==="expense"||g==="supplierpayment"||g==="purchase_return"||g==="purchasereturn"||g==="sales"||g==="salesinvoice"||g==="receipt"||g==="salesreturn"||x.includes("purchase")||x.includes("invoice")||x.includes("expense")||x.includes("return")||x.includes("receipt")||h.includes("فاتورة")||h.includes("مشتريات")||h.includes("سند صرف")||h.includes("سند قبض")||h.includes("مرتجع")||e.sourceId&&(r.docs.some(m=>m.id===e.sourceId)||f.docs.some(m=>m.id===e.sourceId)||S.docs.some(m=>m.id===e.sourceId)),O=h.includes("افتتاحي")||g==="opening"||x==="opening";j&&!O||(e.lines||[]).forEach((m,q)=>{const R=m.accountId,Y=m.accountCode,A=(m.accountName||"").trim().toLowerCase();if(R&&b.has(R)||Y&&u.has(Y)||s&&A&&(A===s||A.includes(s)||s.includes(A))){const H=parseFloat(m.debit||0),V=parseFloat(m.credit||0);if(H===0&&V===0)return;const W=(e.description||"").includes("افتتاحي")||(m.note||"").includes("افتتاحي")||e.sourceType==="opening";p.push({id:`${n.id}_${q}`,docNumber:e.entryNumber||e.number||n.id.slice(0,8),date:e.date||"",type:"journal",typeLabel:W?"قيد رصيد افتتاحي":"قيد يومية",typeBadge:W?'<span class="badge" style="background:#fef3c7; color:#b45309; border:1px solid rgba(180,83,9,0.3); font-weight:800;">⚖️ قيد افتتاحى</span>':'<span class="badge" style="background:#f3e8ff; color:#7e22ce; border:1px solid rgba(126,34,206,0.3); font-weight:800;">📝 قيد تسوية/يومية</span>',description:e.description||m.note||m.accountName||"قيد محاسبي مرحل",debit:H,credit:V,raw:e})}})}),p.sort((n,e)=>(n.date||"").localeCompare(e.date||""));let M=0;const v=[];p.forEach(n=>{a&&n.date<a?M+=n.credit-n.debit:(!o||n.date<=o)&&v.push(n)});let _=M;v.forEach(n=>{_+=n.credit-n.debit,n.balanceAfter=_});const Q=p.filter(n=>n.type==="purchase"||n.type==="journal"&&n.credit>0).map(n=>({date:n.date,amount:n.credit,remaining:n.credit})).reverse();let T=Math.max(0,_),D={d0_30:0,d31_60:0,d61_90:0,d90_plus:0};const J=new Date;for(const n of Q){if(T<=0)break;const e=Math.min(T,n.remaining),g=new Date(n.date||w()),x=Math.max(0,Math.floor((J-g)/(1e3*60*60*24)));x<=30?D.d0_30+=e:x<=60?D.d31_60+=e:x<=90?D.d61_90+=e:D.d90_plus+=e,T-=e}let F=0;p.forEach(n=>{F+=n.credit-n.debit});const P=Math.round(F*100)/100;i.id&&Math.abs((i.balance||0)-P)>.009&&(nt(async()=>{const{update:n}=await import("./index-CF9GFeRJ.js").then(e=>e.T);return{update:n}},__vite__mapDeps([0,1])).then(({update:n})=>{n("suppliers",i.id,{balance:P}).catch(()=>{})}),i.balance=P);const X={all:v.length,purchase:v.filter(n=>n.type==="purchase").length,payment:v.filter(n=>n.type==="payment").length,receipt:v.filter(n=>n.type==="receipt").length,return:v.filter(n=>n.type==="return").length,journal:v.filter(n=>n.type==="journal").length};return{supplier:i,fromDate:a,toDate:o,openingBalance:M,closingBalance:_,transactions:v,allFiltered:v,totalDebit:v.reduce((n,e)=>n+e.debit,0),totalCredit:v.reduce((n,e)=>n+e.credit,0),aging:D,counts:X}}function G(t){const a=document.getElementById("supplier-statement-content");if(!a||!t)return;const o=t.supplier,i=t.closingBalance>.009,s=t.closingBalance<-.009,d=document.getElementById("stmt-sup-type-bar");d&&(d.style.display="flex",document.getElementById("cnt-all").textContent=t.counts.all||0,document.getElementById("cnt-purchase").textContent=t.counts.purchase||0,document.getElementById("cnt-payment").textContent=t.counts.payment||0,document.getElementById("cnt-receipt").textContent=t.counts.receipt||0,document.getElementById("cnt-return").textContent=t.counts.return||0,document.getElementById("cnt-journal").textContent=t.counts.journal||0);const u=t.aging.d0_30+t.aging.d31_60+t.aging.d61_90+t.aging.d90_plus,b=u>0?t.aging.d0_30/u*100:0,r=u>0?t.aging.d31_60/u*100:0,f=u>0?t.aging.d61_90/u*100:0,S=u>0?t.aging.d90_plus/u*100:0,y=(o.phone||"").replace(/[^0-9]/g,""),B=y.startsWith("0")?"966"+y.slice(1):y.startsWith("966")?y:"966"+y;a.innerHTML=`
    <!-- Print-only official letterhead -->
    <div class="print-only" style="display:none; margin-bottom:18px; border-bottom:2px solid #1e293b; padding-bottom:14px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <h2 style="margin:0; font-size:20px; font-weight:900; color:#1e1b4b;">${window.ERP_COMPANY?.name||"مؤسسة إدهام للمواد الغذائية"}</h2>
          <div style="font-size:12px; color:#475569; margin-top:3px;">تجارة الجملة والتجزئة في المواد الغذائية والمشروبات</div>
          <div style="font-size:12px; color:#475569;">الرقم الضريبي: <b>${window.ERP_COMPANY?.vatNumber||"310000000000003"}</b></div>
        </div>
        <div style="text-align:left;">
          <h3 style="margin:0; font-size:18px; color:#4338ca;">كشف حساب مورد تفصيلي</h3>
          <div style="font-size:11.5px; color:#475569; margin-top:3px;">تاريخ الطباعة: <b>${new Date().toLocaleString("ar-SA")}</b></div>
          <div style="font-size:11.5px; color:#475569;">الفترة: من <b>${t.fromDate||"البداية"}</b> إلى <b>${t.toDate||w()}</b></div>
        </div>
      </div>
      <div style="margin-top:12px; padding:10px; background:#f8fafc; border-radius:6px; border:1px solid #cbd5e1; display:flex; justify-content:space-between; font-size:12px;">
        <div>اسم المورد: <b>${o.name}</b></div>
        <div>كود المورد: <b>${o.code||"—"}</b></div>
        <div>الهاتف: <b class="mono">${o.phone||"—"}</b></div>
        <div>الرقم الضريبي: <b class="mono">${o.vatNumber||"—"}</b></div>
      </div>
    </div>

    <!-- 1. Rich Supplier Profile Header Card -->
    <div class="card mb-16 no-print" style="padding:16px 20px; background:linear-gradient(135deg, var(--bg-card), rgba(99,102,241,0.04)); border:1px solid var(--border-soft); border-radius:14px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:52px; height:52px; border-radius:14px; background:linear-gradient(135deg, #4f46e5, #6366f1); color:#fff; display:flex; align-items:center; justify-content:center; font-size:26px; box-shadow:0 6px 14px rgba(79,70,229,0.25);">
            🏢
          </div>
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <h2 style="margin:0; font-size:19px; font-weight:800; color:var(--text-0);">${o.name}</h2>
              <span class="badge" style="background:rgba(99,102,241,0.12); color:#4f46e5; font-weight:700;">كود: ${o.code||"—"}</span>
            </div>
            <div style="display:flex; align-items:center; gap:14px; font-size:12px; color:var(--text-2); margin-top:5px; flex-wrap:wrap;">
              ${o.phone?`
                <a href="https://api.whatsapp.com/send?phone=${B}" target="_blank" style="color:var(--text-1); text-decoration:none; display:flex; align-items:center; gap:4px; font-weight:600;">
                  <span>📞</span> <span class="mono">${o.phone}</span>
                </a>
              `:"<span>📞 غير محدد</span>"}
              <span>الرقم الضريبي: <b class="mono">${o.vatNumber||"—"}</b></span>
              ${o.city||o.address?`<span>📍 ${o.city||o.address}</span>`:""}
            </div>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <div style="text-align:left; background:var(--bg-2); padding:8px 14px; border-radius:10px; border:1px solid var(--border-soft);">
            <div style="font-size:11px; color:var(--text-2); font-weight:700;">حالة الرصيد المالي</div>
            <div style="font-size:14px; font-weight:800; color:${i?"#ef4444":s?"#10b981":"#64748b"};">
              ${i?"🔴 مستحق للمورد (دائن)":s?"🟢 رصيد لصالحنا (مدين)":"🔵 رصيد متزن ومطابق"}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Top Summary KPI Cards -->
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:16px;">
      
      <div class="card" style="padding:14px 16px; background:var(--bg-card); border-radius:12px; border:1px solid var(--border-soft);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:11.5px; color:var(--text-2); font-weight:700;">الرصيد الافتتاحي السابق</div>
          <span style="font-size:16px;">📅</span>
        </div>
        <div class="mono" style="font-size:18px; font-weight:800; margin-top:6px; color:var(--text-0);">${l(t.openingBalance)}</div>
        <div style="font-size:11px; color:var(--text-3); margin-top:2px;">قبل تاريخ ${t.fromDate||"البداية"}</div>
      </div>

      <div class="card" style="padding:14px 16px; background:var(--bg-card); border-radius:12px; border:1px solid rgba(99,102,241,0.25);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:11.5px; color:#4f46e5; font-weight:800;">إجمالي المشتريات (دائن)</div>
          <span class="badge" style="background:rgba(99,102,241,0.1); color:#4f46e5; font-weight:700;">${t.counts.purchase} فاتورة</span>
        </div>
        <div class="mono font-bold" style="font-size:19px; color:#4f46e5; margin-top:6px;">+ ${l(t.totalCredit)}</div>
        <div style="font-size:11px; color:var(--text-3); margin-top:2px;">مشتريات وبضاعة مستلمة</div>
      </div>

      <div class="card" style="padding:14px 16px; background:var(--bg-card); border-radius:12px; border:1px solid rgba(16,185,129,0.25);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:11.5px; color:#059669; font-weight:800;">إجمالي المدفوعات (مدين)</div>
          <span class="badge" style="background:rgba(16,185,129,0.1); color:#059669; font-weight:700;">${t.counts.payment+t.counts.return} حركة</span>
        </div>
        <div class="mono font-bold" style="font-size:19px; color:#059669; margin-top:6px;">- ${l(t.totalDebit)}</div>
        <div style="font-size:11px; color:var(--text-3); margin-top:2px;">سدادات نقدية/بنكية ومردودات</div>
      </div>

      <div class="card" style="padding:14px 16px; background:${i?"rgba(239,68,68,0.06)":s?"rgba(16,185,129,0.06)":"var(--bg-card)"}; border:1.5px solid ${i?"#ef4444":s?"#10b981":"var(--border-soft)"}; border-radius:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:11.5px; color:${i?"#ef4444":s?"#059669":"var(--text-1)"}; font-weight:900;">
            ${i?"المستحق النهائي للمورد (دائن)":s?"رصيد المورد (مدين لصالحنا)":"صافي الرصيد الختامي"}
          </div>
          <span style="font-size:16px;">${i?"🔴":s?"🟢":"⚖️"}</span>
        </div>
        <div class="mono font-bold" style="font-size:22px; color:${i?"#dc2626":s?"#059669":"var(--text-0)"}; margin-top:6px;">
          ${s?`(${l(Math.abs(t.closingBalance))}) مدين`:l(t.closingBalance)}
        </div>
        <div style="font-size:11px; color:${i?"#ef4444":s?"#059669":"var(--text-2)"}; margin-top:2px; font-weight:700;">
          ${i?"⚠️ يستلزم جدولة سداد":s?"✓ رصيد متبقي لصالح المؤسسة":"✓ الحساب متزن تماماً"}
        </div>
      </div>

    </div>

    <!-- 3. Aging of Payables Bar (تحليل أعمار المستحقات) -->
    <div class="card mb-16" style="padding:16px 20px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:16px;">⏳</span>
          <span style="font-weight:800; font-size:14px; color:var(--text-0);">تحليل أعمار مستحقات المورد (Payables Aging Analysis):</span>
        </div>
        <div style="font-size:11px; color:var(--text-2); background:var(--bg-2); padding:3px 10px; border-radius:6px;">
          محسوبة بنظام الوارد أولاً يصرف أولاً FIFO
        </div>
      </div>

      <!-- Visual Multi-segment Progress Bar -->
      ${u>0?`
        <div style="height:10px; border-radius:5px; overflow:hidden; display:flex; margin-bottom:14px; background:var(--bg-2);">
          <div style="width:${b}%; background:#10b981;" title="0 - 30 يوم: ${b.toFixed(1)}%"></div>
          <div style="width:${r}%; background:#f59e0b;" title="31 - 60 يوم: ${r.toFixed(1)}%"></div>
          <div style="width:${f}%; background:#f97316;" title="61 - 90 يوم: ${f.toFixed(1)}%"></div>
          <div style="width:${S}%; background:#ef4444;" title="+90 يوم: ${S.toFixed(1)}%"></div>
        </div>
      `:""}

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:10px;">
        <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:10px; padding:12px; text-align:center;">
          <div style="font-size:11.5px; color:#10b981; font-weight:800;">🟢 جارية (0 - 30 يوم)</div>
          <div class="mono font-bold" style="font-size:16px; margin-top:4px; color:#10b981;">${l(t.aging.d0_30)}</div>
        </div>
        <div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:10px; padding:12px; text-align:center;">
          <div style="font-size:11.5px; color:#f59e0b; font-weight:800;">🟡 معتدلة (31 - 60 يوم)</div>
          <div class="mono font-bold" style="font-size:16px; margin-top:4px; color:#f59e0b;">${l(t.aging.d31_60)}</div>
        </div>
        <div style="background:rgba(249,115,22,0.08); border:1px solid rgba(249,115,22,0.25); border-radius:10px; padding:12px; text-align:center;">
          <div style="font-size:11.5px; color:#f97316; font-weight:800;">🟠 متأخرة (61 - 90 يوم)</div>
          <div class="mono font-bold" style="font-size:16px; margin-top:4px; color:#f97316;">${l(t.aging.d61_90)}</div>
        </div>
        <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); border-radius:10px; padding:12px; text-align:center;">
          <div style="font-size:11.5px; color:#ef4444; font-weight:800;">🔴 مستحقة فوراً (+90 يوم)</div>
          <div class="mono font-bold" style="font-size:16px; margin-top:4px; color:#ef4444;">${l(t.aging.d90_plus)}</div>
        </div>
      </div>
    </div>

    <!-- 4. Statement Movements Ledger Table -->
    <div class="card" style="border-radius:14px; overflow:hidden; border:1px solid var(--border-soft);">
      <div class="card-header no-print" style="padding:14px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); flex-wrap:wrap; gap:10px;">
        <div>
          <h3 style="margin:0; font-size:15px; font-weight:800; color:var(--text-0); display:flex; align-items:center; gap:8px;">
            <span>📑</span> <span>حركات كشف حساب: ${o.name}</span>
          </h3>
          <div style="font-size:11.5px; color:var(--text-2); margin-top:3px;">
            الفترة من <b>${t.fromDate||"البداية"}</b> إلى <b>${t.toDate||w()}</b>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="badge" style="font-size:12px; font-weight:700;">المعروض: ${t.transactions.length} حركة</span>
        </div>
      </div>

      <div class="table-container">
        <table class="data-dense" id="stmt-sup-table" style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:var(--bg-2); border-bottom:2px solid var(--border-soft);">
              <th style="width:40px; text-align:center;">#</th>
              <th style="width:95px;">التاريخ</th>
              <th style="width:130px;">نوع الحركة</th>
              <th style="width:115px;">رقم المستند</th>
              <th>البيان والتفاصيل</th>
              <th style="width:115px; text-align:left;">مدين (سداد/مرتجع)</th>
              <th style="width:115px; text-align:left;">دائن (مشتريات/استرداد)</th>
              <th style="width:125px; text-align:left;">الرصيد التراكمي</th>
              <th style="width:55px; text-align:center;" class="no-print">معاينة</th>
            </tr>
          </thead>
          <tbody>
            <!-- Opening balance row -->
            <tr style="background:rgba(99,102,241,0.03); font-weight:700; border-bottom:1px solid var(--border-soft);">
              <td style="text-align:center; color:var(--text-3); font-size:11px;">—</td>
              <td class="mono font-bold">${t.fromDate||"—"}</td>
              <td><span class="badge neutral" style="font-weight:700;">📌 رصيد سابق</span></td>
              <td class="mono" style="color:var(--text-3);">—</td>
              <td style="font-weight:700; color:var(--text-1);">رصيد ما قبل فترة الكشف المحددة</td>
              <td class="mono" style="text-align:left; color:var(--text-dim);">—</td>
              <td class="mono" style="text-align:left; color:var(--text-dim);">—</td>
              <td class="mono font-bold" style="text-align:left; color:${t.openingBalance>0?"#ef4444":t.openingBalance<0?"#10b981":"var(--text-1)"}; font-size:13.5px;">
                ${t.openingBalance<0?`(${l(Math.abs(t.openingBalance))}) مدين`:l(t.openingBalance)}
              </td>
              <td style="text-align:center;" class="no-print">—</td>
            </tr>

            ${t.transactions.length===0?`
              <tr>
                <td colspan="9" style="text-align:center; padding:36px; color:var(--text-2);">
                  <div style="font-size:24px; margin-bottom:6px;">📭</div>
                  <div>لا توجد حركات مسجلة للمورد خلال هذه الفترة المحددة</div>
                </td>
              </tr>
            `:t.transactions.map((p,L)=>`
              <tr style="border-bottom:1px solid var(--border-soft); transition:background 0.1s ease;">
                <td style="text-align:center; color:var(--text-3); font-size:11px;" class="mono">${L+1}</td>
                <td class="mono dim">${p.date||"—"}</td>
                <td>${p.typeBadge}</td>
                <td class="mono font-bold" style="color:var(--brand); cursor:pointer;" onclick="window.previewSupplierDoc('${p.type}', '${p.id}')" title="عرض تفاصيل المستند">
                  ${p.docNumber}
                </td>
                <td style="font-size:12.5px; line-height:1.4;">${p.description}</td>
                <td class="mono font-bold" style="text-align:left; color:${p.debit>0?"#059669":"var(--text-dim)"};">
                  ${p.debit>0?l(p.debit):"—"}
                </td>
                <td class="mono font-bold" style="text-align:left; color:${p.credit>0?"#4f46e5":"var(--text-dim)"};">
                  ${p.credit>0?l(p.credit):"—"}
                </td>
                <td class="mono font-bold" style="text-align:left; color:${p.balanceAfter>0?"#dc2626":p.balanceAfter<0?"#059669":"var(--text-1)"}; font-size:13px;">
                  ${p.balanceAfter<0?`(${l(Math.abs(p.balanceAfter))}) مدين`:l(p.balanceAfter)}
                </td>
                <td style="text-align:center;" class="no-print">
                  <button class="btn btn-icon sm btn-ghost" onclick="window.previewSupplierDoc('${p.type}', '${p.id}')" title="معاينة تفاصيل المستند">👁️</button>
                </td>
              </tr>
            `).join("")}

            <!-- Summary Totals Row -->
            <tr style="background:var(--bg-2); font-weight:800; border-top:2px solid var(--border-soft);">
              <td colspan="5" style="text-align:center; font-size:13.5px; color:var(--text-0);">
                الإجمالي الكلي للحركات والرصيد الختامي المستحق
              </td>
              <td class="mono font-bold" style="text-align:left; color:#059669; font-size:14px;">
                ${l(t.totalDebit)}
              </td>
              <td class="mono font-bold" style="text-align:left; color:#4f46e5; font-size:14px;">
                ${l(t.totalCredit)}
              </td>
              <td class="mono font-bold" style="text-align:left; color:${i?"#dc2626":s?"#059669":"var(--text-0)"}; font-size:15px;">
                ${t.closingBalance<0?`(${l(Math.abs(t.closingBalance))}) مدين`:l(t.closingBalance)}
              </td>
              <td class="no-print"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Official Signatures Block (printed or at bottom) -->
    <div class="print-only" style="display:none; margin-top:36px; padding-top:20px; border-top:1.5px dashed #94a3b8;">
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; text-align:center; font-size:12px;">
        <div>
          <div style="font-weight:bold; margin-bottom:45px;">إعداد المحاسب المسؤول</div>
          <div style="border-top:1px solid #64748b; padding-top:4px;">التوقيع: ............................</div>
        </div>
        <div>
          <div style="font-weight:bold; margin-bottom:45px;">اعتماد الإدارة المالية</div>
          <div style="border-top:1px solid #64748b; padding-top:4px;">التوقيع: ............................</div>
        </div>
        <div>
          <div style="font-weight:bold; margin-bottom:45px;">ختم ومصادقة المورد</div>
          <div style="border-top:1px solid #64748b; padding-top:4px;">الختم والتوقيع: ....................</div>
        </div>
      </div>
    </div>
  `}function lt(){window.selectSupplierForStmt=async t=>{document.getElementById("stmt-sup-results")?.classList.add("hidden"),k=t;const a=document.getElementById("stmt-sup-select");a&&(a.value=t);const o=I.find(i=>i.id===t);if(o){const i=document.getElementById("stmt-sup-search");i&&(i.value=o.name);const s=document.getElementById("stmt-sup-clear");s&&(s.style.display="block")}["stmt-btn-print","stmt-btn-excel","stmt-btn-wa","stmt-btn-confirm"].forEach(i=>{const s=document.getElementById(i);s&&(s.disabled=!1)}),await window.reloadSupplierStatement()},window.onSupplierSelectChange=async t=>{if(!t){window.clearSupplierSearch();return}await window.selectSupplierForStmt(t)},window.clearSupplierSearch=()=>{k=null,c=null,z=null;const t=document.getElementById("stmt-sup-search");t&&(t.value="");const a=document.getElementById("stmt-sup-clear");a&&(a.style.display="none");const o=document.getElementById("stmt-sup-select");o&&(o.value="");const i=document.getElementById("stmt-sup-type-bar");i&&(i.style.display="none"),["stmt-btn-print","stmt-btn-excel","stmt-btn-wa","stmt-btn-confirm"].forEach(d=>{const u=document.getElementById(d);u&&(u.disabled=!0)});const s=document.getElementById("supplier-statement-content");s&&(s.innerHTML=`
        <div class="card" style="padding:56px 24px; text-align:center; color:var(--text-2); border-radius:14px; background:var(--bg-card); border:1px dashed var(--border);">
          <div style="font-size:52px; margin-bottom:14px;">📊</div>
          <div style="font-size:18px; font-weight:800; color:var(--text-0);">يرجى البحث عن المورد أو اختياره من القائمة أعلاه</div>
          <div style="font-size:13px; color:var(--text-2); margin-top:6px; max-width:540px; margin-left:auto; margin-right:auto;">
            يمكنك كتابة اسم المورد، كود المورد، رقم الهاتف أو الرقم الضريبي لبدء التحليل الفوري لكشف الحساب.
          </div>
        </div>
      `)},window.onSupplierDateChange=async()=>{k&&await window.reloadSupplierStatement()},window.setSupplierPeriod=async t=>{const a=document.getElementById("stmt-sup-from"),o=document.getElementById("stmt-sup-to");if(!a||!o)return;["month","last_month","quarter","year","all"].forEach(s=>{const d=document.getElementById(`btn-p-${s==="last_month"?"last-month":s}`);d&&(s===t?d.className="btn btn-primary btn-sm":d.className="btn btn-secondary btn-sm")});const i=new Date;if(t==="month"){const s=new Date(i.getFullYear(),i.getMonth(),1).toISOString().slice(0,10);a.value=s,o.value=w()}else if(t==="last_month"){const s=new Date(i.getFullYear(),i.getMonth()-1,1).toISOString().slice(0,10),d=new Date(i.getFullYear(),i.getMonth(),0).toISOString().slice(0,10);a.value=s,o.value=d}else t==="quarter"?(a.value=at(),o.value=w()):t==="year"?(a.value=K(),o.value=w()):t==="all"&&(a.value="",o.value=w());k&&await window.reloadSupplierStatement()},window.reloadSupplierStatement=async()=>{const t=k||document.getElementById("stmt-sup-select")?.value;if(!t){window.clearSupplierSearch();return}const a=document.getElementById("stmt-sup-from")?.value||"",o=document.getElementById("stmt-sup-to")?.value||"",i=document.getElementById("supplier-statement-content");i&&(i.innerHTML=`
        <div style="text-align:center; padding:70px; color:var(--text-2);">
          <div class="spin" style="width:36px; height:36px; border:3px solid rgba(99,102,241,0.2); border-top-color:#4f46e5; border-radius:50%; margin:0 auto 16px auto;"></div>
          <div style="font-weight:800; font-size:16px; color:var(--text-0);">جاري جلب وفحص حركات المورد والمطابقة المحاسبية...</div>
          <div style="font-size:12px; margin-top:4px;">تتم مراجعة فواتير المشتريات، سندات الصرف، القيود ومردودات الشراء</div>
        </div>
      `);const s=await dt(t,a,o);c=s,G(s)},window.filterSupplierStatementType=t=>{c&&(["all","purchase","payment","receipt","return","journal"].forEach(a=>{const o=document.getElementById(`btn-flt-${a}`);o&&(a===t?o.className="btn btn-primary btn-sm":o.className="btn btn-secondary btn-sm")}),t==="all"?c.transactions=c.allFiltered:c.transactions=c.allFiltered.filter(a=>a.type===t),G(c))},window.previewSupplierDoc=(t,a)=>{const o=c?.allFiltered?.find(b=>b.id===a);if(!o)return;const i=document.getElementById("doc-sup-modal-title"),s=document.getElementById("doc-sup-modal-body");i.textContent=`${o.typeLabel} — ${o.docNumber}`;const d=o.raw||{};let u=`
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:18px; background:var(--bg-2); padding:14px; border-radius:10px; font-size:13px; border:1px solid var(--border-soft);">
        <div><span style="color:var(--text-3);">التاريخ:</span> <b class="mono">${o.date||"—"}</b></div>
        <div><span style="color:var(--text-3);">المورد:</span> <b>${z?.name||"—"}</b></div>
        <div><span style="color:var(--text-3);">المبلغ:</span> <b class="mono font-bold text-brand" style="font-size:15px;">${l(o.debit||o.credit)}</b></div>
        <div><span style="color:var(--text-3);">نوع الحركة:</span> <span>${o.typeLabel}</span></div>
        <div style="grid-column:1 / -1;"><span style="color:var(--text-3);">البيان:</span> <span>${o.description}</span></div>
      </div>
    `;if(t==="purchase"&&(d.lines||d.items)){const b=d.lines||d.items||[];u+=`
        <div style="font-weight:800; font-size:13.5px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
          <span>📦 الأصناف المشتراة بالفاتورة:</span>
          <span class="badge" style="font-size:11.5px;">${b.length} صنف</span>
        </div>
        <div class="table-container" style="max-height:280px; overflow-y:auto; border-radius:8px; border:1px solid var(--border-soft);">
          <table class="data-dense" style="margin:0; width:100%;">
            <thead>
              <tr style="background:var(--bg-2);">
                <th>الصنف</th>
                <th style="width:75px; text-align:center;">الكمية</th>
                <th style="width:95px; text-align:left;">سعر الوحدة</th>
                <th style="width:95px; text-align:left;">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${b.map(r=>`
                <tr>
                  <td><b>${r.productName||r.name||"صنف غذائي"}</b></td>
                  <td class="mono font-bold" style="text-align:center;">${r.qty||r.quantity||1} ${r.unit||""}</td>
                  <td class="mono" style="text-align:left;">${l(r.unitPrice||r.price||0)}</td>
                  <td class="mono font-bold" style="text-align:left; color:var(--brand);">${l(r.total||(r.qty||1)*(r.unitPrice||0))}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `}else if(t==="payment")u+=`
        <div style="padding:14px; background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.2); border-radius:8px; font-size:13px;">
          <div style="font-weight:800; color:#059669; margin-bottom:8px;">تفاصيل سند الصرف:</div>
          <div>طريقة الدفع: <b>${d.paymentMethod||d.method||"تحويل بنكي / نقدي"}</b></div>
          ${d.sourceName?`<div>الحساب / الخزينة: <b>${d.sourceName}</b></div>`:""}
          ${d.beneficiary?`<div>المستفيد: <b>${d.beneficiary}</b></div>`:""}
          ${d.referenceNo?`<div>الرقم المرجعي: <b class="mono">${d.referenceNo}</b></div>`:""}
        </div>
      `;else if(t==="receipt")u+=`
        <div style="padding:14px; background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.2); border-radius:8px; font-size:13px;">
          <div style="font-weight:800; color:#059669; margin-bottom:8px;">تفاصيل سند القبض / الاسترداد:</div>
          <div>طريقة القبض: <b>${d.paymentMethod||d.method||"نقدي / بنكي"}</b></div>
          ${d.sourceName?`<div>الخزينة / الحساب المودع فيه: <b>${d.sourceName}</b></div>`:""}
          ${d.referenceNo?`<div>الرقم المرجعي: <b class="mono">${d.referenceNo}</b></div>`:""}
        </div>
      `;else if(t==="return"&&(d.items||d.lines)){const b=d.items||d.lines||[];u+=`
        <div style="font-weight:800; font-size:13.5px; margin-bottom:10px;">↩️ الأصناف المرتجعة للمورد:</div>
        <div class="table-container" style="max-height:280px; overflow-y:auto; border-radius:8px; border:1px solid var(--border-soft);">
          <table class="data-dense" style="margin:0; width:100%;">
            <thead>
              <tr style="background:var(--bg-2);">
                <th>الصنف</th>
                <th style="width:75px; text-align:center;">الكمية</th>
                <th style="width:95px; text-align:left;">السعر</th>
                <th style="width:95px; text-align:left;">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${b.map(r=>`
                <tr>
                  <td><b>${r.productName||r.name}</b></td>
                  <td class="mono font-bold" style="text-align:center;">${r.qty||r.quantity||1} ${r.unit||""}</td>
                  <td class="mono" style="text-align:left;">${l(r.unitPrice||r.price||0)}</td>
                  <td class="mono font-bold" style="text-align:left; color:#f97316;">${l(r.total||(r.qty||1)*(r.unitPrice||0))}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `}else t==="journal"&&d.lines&&(u+=`
        <div style="font-weight:800; font-size:13.5px; margin-bottom:10px;">⚖️ بنود وسطور القيد المحاسبي:</div>
        <div class="table-container" style="max-height:280px; overflow-y:auto; border-radius:8px; border:1px solid var(--border-soft);">
          <table class="data-dense" style="margin:0; width:100%;">
            <thead>
              <tr style="background:var(--bg-2);">
                <th>الحساب</th>
                <th style="width:110px; text-align:left;">مدين</th>
                <th style="width:110px; text-align:left;">دائن</th>
                <th>البيان الفرعي</th>
              </tr>
            </thead>
            <tbody>
              ${(d.lines||[]).map(b=>`
                <tr>
                  <td><b>${b.accountCode?`<span class="mono" style="color:#6366f1;">${b.accountCode}</span> `:""}${b.accountName||"—"}</b></td>
                  <td class="mono font-bold" style="text-align:left; color:${b.debit>0?"#10B981":"var(--text-dim)"};">${b.debit>0?l(b.debit):"—"}</td>
                  <td class="mono font-bold" style="text-align:left; color:${b.credit>0?"var(--brand)":"var(--text-dim)"};">${b.credit>0?l(b.credit):"—"}</td>
                  <td style="font-size:11.5px; color:var(--text-2);">${b.note||b.subDescription||"—"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `);s.innerHTML=u,openModal("doc-sup-preview-modal")},window.shareSupplierStatementWhatsApp=()=>{if(!c||!z){alert("يرجى اختيار المورد أولاً");return}const t=z,a=(t.phone||"").replace(/[^0-9]/g,""),o=a.startsWith("0")?"966"+a.slice(1):a.startsWith("966")?a:"966"+a,i=window.ERP_COMPANY?.name||"مؤسسة إدهام للمواد الغذائية",s=`سعادة المورد المحترم / ${t.name}
تحية طيبة من ${i} 🌿

نرفق لكم ملخص كشف الحساب:
• الفترة: من ${c.fromDate||"البداية"} إلى ${c.toDate||w()}
• الرصيد السابق: ${l(c.openingBalance)}
• إجمالي المشتريات: ${l(c.totalCredit)}
• إجمالي المسدد: ${l(c.totalDebit)}
• صافي الرصيد المستحق لكم: ${l(c.closingBalance)}

شاكرين ومقدرين حسن تعاونكم معنا!`;window.open(`https://api.whatsapp.com/send?phone=${o}&text=${encodeURIComponent(s)}`,"_blank")},window.printSupplierConfirmationLetter=()=>{if(!c||!z){alert("يرجى اختيار المورد أولاً");return}const t=z,a=window.ERP_COMPANY||{name:"مؤسسة إدهام للمواد الغذائية",vatNumber:"310000000000003"},o=window.open("","_blank");o.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>خطاب مصادقة ومطابقة رصيد مورد - ${t.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, system-ui, sans-serif; padding: 40px; color: #111; line-height: 1.8; text-align: right; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .box { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 20px; margin: 20px 0; font-size: 14px; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 60px; text-align: center; }
            .sig-line { border-top: 1px dashed #475569; margin-top: 60px; padding-top: 8px; font-weight: bold; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin:0; font-size:22px;">${a.name}</h2>
            <div style="font-size:12px; color:#666;">الرقم الضريبي: ${a.vatNumber||"—"}</div>
            <h3 style="margin-top:15px; color:#4338CA; font-size:18px;">خطاب مصادقة ومطابقة رصيد مورد</h3>
          </div>

          <p><b>السادة المحترمون / شركة: ${t.name}</b></p>
          <p>تحية طيبة وبعد،،،</p>
          <p>
            في إطار المراجعة الدورية للحسابات والمطابقة المحاسبية بين الطرفين، نرجو التكرم بالإحاطة بأن رصيد حسابكم المسجل في دفاترنا كما في تاريخ <b>${c.toDate||w()}</b> هو كالتالي:
          </p>

          <div class="box">
            <div>• الرصيد المستحق لكم في دفاترنا: <b style="font-size:16px; color:#4338ca;">${l(c.closingBalance)}</b></div>
            <div>• إجمالي مسحوبات ومشتريات الفترة: <b>${l(c.totalCredit)}</b></div>
            <div>• إجمالي السدادات والحوالات المنفذة: <b>${l(c.totalDebit)}</b></div>
            <div>• الرصيد الافتتاحي السابق: <b>${l(c.openingBalance)}</b></div>
          </div>

          <p>نرجو التكرم بمطابقة الرصيد مع دفاتركم وإعادة توقيع وختم هذا الخطاب بالمصادقة أو إشعارنا بأي فروقات إن وجدت.</p>

          <div class="signatures">
            <div>
              <div>عن / ${a.name}</div>
              <div class="sig-line">الختم والتوقيع المعتمد</div>
            </div>
            <div>
              <div>عن / ${t.name} (المورد)</div>
              <div class="sig-line">المصادقة والختم الرسمي</div>
            </div>
          </div>

          <script>window.onload = () => { window.print(); };<\/script>
        </body>
      </html>
    `),o.document.close()},window.printSupplierStatement=()=>{c&&window.print()},window.exportSupplierStatementExcel=()=>{if(!c||!z)return;const t=z,a=[{التاريخ:c.fromDate||"—","نوع الحركة":"رصيد سابق","رقم المستند":"—",البيان:"رصيد ما قبل فترة الكشف المحددة","مدين (سداد)":0,"دائن (مشتريات)":0,"الرصيد التراكمي":c.openingBalance},...c.transactions.map(i=>({التاريخ:i.date,"نوع الحركة":i.typeLabel,"رقم المستند":i.docNumber,البيان:i.description,"مدين (سداد)":i.debit,"دائن (مشتريات)":i.credit,"الرصيد التراكمي":i.balanceAfter})),{التاريخ:"الإجمالي","نوع الحركة":"الرصيد الختامي","رقم المستند":"—",البيان:"إجمالي حركات الفترة والرصيد النهائي المستحق","مدين (سداد)":c.totalDebit,"دائن (مشتريات)":c.totalCredit,"الرصيد التراكمي":c.closingBalance}],o=(t.name||"مورد").replace(/[/\\?%*:|"<>]/g,"_");ot(a,`كشف_حساب_مورد_${o}_${w()}`)}}export{vt as render};
