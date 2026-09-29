import{g as E,a as _,q as V,f as r}from"./index-3Bsn2yrt.js";import{e as G}from"./excel-zCoXiaxq.js";import{orderBy as Y,where as I}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let T=[],a=null,x=[],k={debit:0,credit:0,balance:0},m="",u="",N="all";const v=()=>new Date().toISOString().slice(0,10),O=()=>{const n=new Date;return n.setMonth(n.getMonth()-1),n.toISOString().slice(0,10)},J=()=>`${new Date().getFullYear()}-01-01`;async function rt(n,e){m=O(),u=v(),n.innerHTML=`
    <div class="filterbar no-print">
      <div style="position:relative; min-width:280px; flex:1; max-width:360px;">
        <input type="text" id="stmt-cust-search" class="input" placeholder="🔍 ابحث عن العميل (الاسم / الهاتف / الكود)..." autocomplete="off" />
        <div id="stmt-cust-results" class="autocomplete-dropdown hidden" style="position:absolute; top:100%; left:0; right:0; z-index:999; max-height:260px; overflow-y:auto; background:var(--bg-card); border:1px solid var(--border); border-radius:8px; box-shadow:var(--shadow-lg);"></div>
      </div>
      
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="stmt-from" class="input" value="${m}" style="width:135px;" onchange="window.onStmtDateChange()" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="stmt-to" class="input" value="${u}" style="width:135px;" onchange="window.onStmtDateChange()" />
      </div>

      <div style="display:flex; gap:4px;">
        <button class="btn btn-secondary btn-sm" onclick="window.setStmtPeriod('month')">الشهر</button>
        <button class="btn btn-secondary btn-sm" onclick="window.setStmtPeriod('quarter')">الربع</button>
        <button class="btn btn-secondary btn-sm" onclick="window.setStmtPeriod('year')">السنة</button>
        <button class="btn btn-secondary btn-sm" onclick="window.setStmtPeriod('all')">شامل</button>
      </div>

      <div style="margin-right:auto; display:flex; gap:6px; flex-wrap:wrap;">
        <button class="btn btn-secondary" onclick="window.printCustomerStatement()" id="stmt-print-btn" disabled>🖨️ طباعة</button>
        <button class="btn btn-secondary" onclick="window.exportCustomerStatementPDF()" id="stmt-pdf-btn" disabled>📄 تصدير PDF</button>
        <button class="btn btn-secondary" onclick="window.exportCustomerStatementExcel()" id="stmt-excel-btn" disabled>📊 Excel</button>
        <button class="btn btn-primary" style="background:#25D366; border-color:#25D366;" onclick="window.shareCustomerStatementWhatsApp()" id="stmt-wa-btn" disabled>💬 واتساب</button>
        <button class="btn btn-secondary" style="background:rgba(124,58,237,.1); color:#7C3AED; border-color:rgba(124,58,237,.3);" onclick="window.printBalanceConfirmation()" id="stmt-confirm-btn" disabled>📑 مصادقة رصيد</button>
      </div>
    </div>

    <div class="page-content">
      <!-- Customer Info Header Card -->
      <div id="stmt-cust-header" class="card mb-16" style="padding:16px 20px; background:linear-gradient(135deg, var(--bg-card), rgba(99,102,241,0.03)); border:1px solid var(--border-soft);">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:48px; height:48px; border-radius:12px; background:rgba(99,102,241,0.1); color:var(--brand); display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:800;">👤</div>
            <div>
              <h2 id="stmt-cust-name" style="margin:0; font-size:18px; font-weight:800; color:var(--text-0);">اختر عميلاً لعرض كشف الحساب</h2>
              <div id="stmt-cust-sub" style="font-size:12px; color:var(--text-2); margin-top:2px;">قم بالبحث عن العميل بالأعلى لبدء استعراض الحركات المالية وأعمار الديون</div>
            </div>
          </div>
          <div id="stmt-kpi-strip" style="display:flex; gap:12px; flex-wrap:wrap;"></div>
        </div>
      </div>

      <!-- Aging of Receivables (أعمار الديون) Strip -->
      <div id="stmt-aging-strip" class="mb-16" style="display:none;">
        <div style="font-size:12px; font-weight:800; color:var(--text-2); margin-bottom:8px; display:flex; align-items:center; gap:6px;">
          <span>⏳ تحليل أعمار الديون والمستحقات (Aging Analysis):</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px;">
          <div style="padding:12px 14px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.25); border-radius:10px;">
            <div style="font-size:11px; color:#10B981; font-weight:700;">🟢 جارية (0 - 30 يوم)</div>
            <div class="mono" id="aging-current" style="font-size:16px; font-weight:900; color:#10B981; margin-top:3px;">0.00 ر.س</div>
          </div>
          <div style="padding:12px 14px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.25); border-radius:10px;">
            <div style="font-size:11px; color:#F59E0B; font-weight:700;">🟡 معتدلة (31 - 60 يوم)</div>
            <div class="mono" id="aging-30" style="font-size:16px; font-weight:900; color:#F59E0B; margin-top:3px;">0.00 ر.س</div>
          </div>
          <div style="padding:12px 14px; background:var(--bg-card); border:1px solid rgba(249,115,22,0.25); border-radius:10px;">
            <div style="font-size:11px; color:#F97316; font-weight:700;">🟠 متأخرة (61 - 90 يوم)</div>
            <div class="mono" id="aging-60" style="font-size:16px; font-weight:900; color:#F97316; margin-top:3px;">0.00 ر.س</div>
          </div>
          <div style="padding:12px 14px; background:var(--bg-card); border:1px solid rgba(239,68,68,0.25); border-radius:10px;">
            <div style="font-size:11px; color:#EF4444; font-weight:700;">🔴 متعثرة (+90 يوم)</div>
            <div class="mono" id="aging-90" style="font-size:16px; font-weight:900; color:#EF4444; margin-top:3px;">0.00 ر.س</div>
          </div>
        </div>
      </div>

      <!-- Quick Type Filter Buttons -->
      <div id="stmt-type-bar" class="mb-12 no-print" style="display:none; align-items:center; gap:8px;">
        <span style="font-size:12px; font-weight:700; color:var(--text-2);">نوع الحركة:</span>
        <button class="btn btn-primary btn-sm" id="btn-flt-all" onclick="window.setStmtTypeFilter('all')">الكل</button>
        <button class="btn btn-secondary btn-sm" id="btn-flt-inv" onclick="window.setStmtTypeFilter('invoice')">🧾 فواتير فقط</button>
        <button class="btn btn-secondary btn-sm" id="btn-flt-rcpt" onclick="window.setStmtTypeFilter('receipt')">💵 سندات قبض فقط</button>
        <button class="btn btn-secondary btn-sm" id="btn-flt-ret" onclick="window.setStmtTypeFilter('return')">↩️ مردودات فقط</button>
      </div>

      <!-- Statement Ledger Table -->
      <div class="card" id="stmt-table-card">
        <div class="table-container">
          <table class="data-dense" id="stmt-table">
            <thead>
              <tr>
                <th style="width:105px;">التاريخ</th>
                <th style="width:115px;">نوع الحركة</th>
                <th style="width:125px;">رقم المرجع</th>
                <th>البيان والتفاصيل</th>
                <th style="width:115px; text-align:left;">مدين (+)</th>
                <th style="width:115px; text-align:left;">دائن (-)</th>
                <th style="width:125px; text-align:left;">الرصيد المستحق</th>
                <th style="width:50px; text-align:center;" class="no-print">تفاصيل</th>
              </tr>
            </thead>
            <tbody id="stmt-tbody">
              <tr>
                <td colspan="8" style="text-align:center; padding:48px; color:var(--text-2);">
                  <div style="font-size:36px; margin-bottom:8px;">📊</div>
                  <div style="font-size:15px; font-weight:700;">الرجاء اختيار العميل من شريط البحث أعلاه</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Drill-down Details Modal -->
    <div class="modal-overlay" id="stmt-detail-modal">
      <div class="modal modal-lg" style="max-width:700px;">
        <div class="modal-header">
          <h3 class="modal-title" id="stmt-detail-title">تفاصيل المستند</h3>
          <button class="modal-close" onclick="closeModal('stmt-detail-modal')">×</button>
        </div>
        <div class="modal-body" id="stmt-detail-body" style="padding:20px;"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('stmt-detail-modal')">إغلاق</button>
        </div>
      </div>
    </div>
  `,await K(),Q(),U()}async function K(){try{T=await E(_.customers(),[Y("name")])}catch(n){console.warn("Failed to load customers for statement:",n)}}function Q(){const n=document.getElementById("stmt-cust-search"),e=document.getElementById("stmt-cust-results");!n||!e||(n.addEventListener("input",V(()=>{const o=n.value.trim().toLowerCase();if(!o){e.classList.add("hidden");return}const s=T.filter(i=>(i.name||"").toLowerCase().includes(o)||(i.code||"").toLowerCase().includes(o)||(i.phone||"").includes(o)).slice(0,15);if(!s.length){e.innerHTML='<div style="padding:12px; text-align:center; color:var(--text-2); font-size:12px;">لا يوجد نتائج</div>',e.classList.remove("hidden");return}e.innerHTML=s.map(i=>`
      <div class="autocomplete-item" onclick="window.selectStmtCustomer('${i.id}')" style="padding:10px 14px; border-bottom:1px solid var(--border-soft); cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:700; font-size:13px; color:var(--text-0);">${i.name}</div>
          <div style="font-size:11px; color:var(--text-2);">${i.phone||"—"} • كود: ${i.code||"—"}</div>
        </div>
        <div class="mono" style="font-weight:800; font-size:13px; color:${(i.balance||0)>0?"var(--bad)":"var(--good)"};">
          ${r(i.balance||0)}
        </div>
      </div>
    `).join(""),e.classList.remove("hidden")},200)),document.addEventListener("click",o=>{!n.contains(o.target)&&!e.contains(o.target)&&e.classList.add("hidden")}))}function U(){window.selectStmtCustomer=async n=>{if(document.getElementById("stmt-cust-results")?.classList.add("hidden"),a=T.find(i=>i.id===n),!a)return;const e=document.getElementById("stmt-cust-search");e&&(e.value=a.name),["stmt-print-btn","stmt-pdf-btn","stmt-excel-btn","stmt-wa-btn","stmt-confirm-btn"].forEach(i=>{const g=document.getElementById(i);g&&(g.disabled=!1)});const o=document.getElementById("stmt-aging-strip"),s=document.getElementById("stmt-type-bar");o&&(o.style.display="block"),s&&(s.style.display="flex"),await F()},window.onStmtDateChange=async()=>{m=document.getElementById("stmt-from")?.value||"",u=document.getElementById("stmt-to")?.value||"",a&&await F()},window.setStmtPeriod=async n=>{if(n==="month")m=O(),u=v();else if(n==="quarter"){const e=new Date;e.setMonth(e.getMonth()-3),m=e.toISOString().slice(0,10),u=v()}else n==="year"?(m=J(),u=v()):n==="all"&&(m="2020-01-01",u=v());document.getElementById("stmt-from").value=m,document.getElementById("stmt-to").value=u,a&&await F()},window.setStmtTypeFilter=n=>{N=n,["all","inv","rcpt","ret"].forEach(e=>{const o=document.getElementById(`btn-flt-${e}`);if(o){const s=e==="all"&&n==="all"||e==="inv"&&n==="invoice"||e==="rcpt"&&n==="receipt"||e==="ret"&&n==="return";o.className=s?"btn btn-primary btn-sm":"btn btn-secondary btn-sm"}}),W()},window.previewDocDetail=n=>{const e=x[n];if(!e||!e.raw)return;const o=document.getElementById("stmt-detail-title"),s=document.getElementById("stmt-detail-body");if(o.textContent=`${e.typeLabel} — ${e.refNo}`,e.type==="invoice"){const i=e.raw,g=i.lines||i.items||[];s.innerHTML=`
        <div class="grid-3 gap-12 mb-16" style="background:var(--bg-card); padding:12px; border-radius:8px; border:1px solid var(--border-soft);">
          <div><span style="color:var(--text-2); font-size:11px;">رقم الفاتورة:</span> <b class="mono">${i.number||i.invoiceNumber}</b></div>
          <div><span style="color:var(--text-2); font-size:11px;">التاريخ:</span> <b class="mono">${i.date}</b></div>
          <div><span style="color:var(--text-2); font-size:11px;">الإجمالي مع الضريبة:</span> <b class="mono font-bold" style="color:var(--brand);">${r(i.totalWithVat||i.total||0)}</b></div>
        </div>
        <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px;">
          <table class="data-dense" style="margin:0;">
            <thead>
              <tr><th>الصنف</th><th style="width:70px;">الكمية</th><th style="width:90px;">السعر</th><th style="width:100px;">الإجمالي</th></tr>
            </thead>
            <tbody>
              ${g.map(l=>`
                <tr>
                  <td><b>${l.name||l.productName}</b></td>
                  <td class="mono">${l.qty||l.quantity}</td>
                  <td class="mono">${r(l.unitPrice||l.price||0)}</td>
                  <td class="mono font-bold">${r((l.qty||l.quantity||1)*(l.unitPrice||l.price||0))}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `}else if(e.type==="receipt"){const i=e.raw;s.innerHTML=`
        <div style="background:var(--bg-card); padding:16px; border-radius:8px; border:1px solid var(--border-soft); line-height:2;">
          <div><span style="color:var(--text-2);">رقم السند:</span> <b class="mono">${i.number||i.code||i.id}</b></div>
          <div><span style="color:var(--text-2);">التاريخ:</span> <b class="mono">${i.date}</b></div>
          <div><span style="color:var(--text-2);">المبلغ المقبوض:</span> <b class="mono font-bold" style="color:var(--good); font-size:16px;">${r(i.amount||0)}</b></div>
          <div><span style="color:var(--text-2);">طريقة الدفع:</span> <b>${i.method==="cash"?"نقدي":"تحويل بنكي"}</b></div>
          <div><span style="color:var(--text-2);">البيان:</span> <b>${i.notes||"—"}</b></div>
        </div>
      `}else s.innerHTML=`<pre style="background:var(--bg-2); padding:12px; border-radius:8px;">${JSON.stringify(e.raw,null,2)}</pre>`;openModal("stmt-detail-modal")},window.printCustomerStatement=()=>{a&&window.print()},window.exportCustomerStatementPDF=()=>{a&&window.print()},window.exportCustomerStatementExcel=()=>{if(!a||!x.length)return;const n=x.map(e=>({التاريخ:e.date,"نوع الحركة":e.typeLabel,"رقم المرجع":e.refNo,البيان:e.notes,مدين:e.debit||0,دائن:e.credit||0,الرصيد:e.runningBalance}));G(n,`كشف_حساب_${a.name.replace(/\s+/g,"_")}`)},window.shareCustomerStatementWhatsApp=()=>{if(!a)return;const n=(a.phone||"").replace(/[^0-9]/g,""),e=n.startsWith("0")?"966"+n.slice(1):n.startsWith("966")?n:"966"+n,o=`مرحباً ${a.name}،
مرفق ملخص كشف الحساب الخاص بكم لدى ${window.ERP_COMPANY?.name||"مؤسسة إدهام للمواد الغذائية"}:

📅 الفترة: من ${m} إلى ${u}
💵 إجمالي المسحوبات (مدين): ${r(k.debit)}
💳 إجمالي المدفوعات (دائن): ${r(k.credit)}
💰 الرصيد الحالي المستحق: ${r(k.balance)}

شاكرين ومقدرين تعاملكم معنا!`,s=`https://api.whatsapp.com/send?phone=${e}&text=${encodeURIComponent(o)}`;window.open(s,"_blank")},window.printBalanceConfirmation=()=>{if(!a)return;const n=window.open("","_blank"),e=window.ERP_COMPANY?.name||"مؤسسة إدهام للمواد الغذائية";n.document.write(`
      <html dir="rtl">
      <head>
        <title>خطاب مصادقة رصيد — ${a.name}</title>
        <style>
          body { font-family:'Cairo',sans-serif; padding:40px; line-height:1.8; color:#1e293b; }
          .header { text-align:center; border-bottom:2px solid #334155; padding-bottom:20px; margin-bottom:30px; }
          .box { border:1px solid #cbd5e1; padding:20px; border-radius:8px; margin:20px 0; background:#f8fafc; }
          .signatures { display:flex; justify-content:space-between; margin-top:80px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${e}</h2>
          <h3>خطاب مصادقة رصيد (Balance Confirmation)</h3>
        </div>
        <p>التاريخ: <b>${v()}</b></p>
        <p>السادة / <b>${a.name}</b> المحترمين</p>
        <p>تحية طيبة وبعد،،،</p>
        <p>يرجى التكرم بمطابقة رصيد حسابكم المسجل بدفاترنا حتى تاريخ <b>${u}</b>، حيث يظهر الحساب بالرصيد التالي:</p>
        
        <div class="box">
          <p style="font-size:18px; text-align:center;">
            الرصيد المستحق: <b>${r(k.balance)}</b>
          </p>
        </div>

        <p>في حال وجود أي ملاحظات أو اختلاف في الرصيد، يرجى إفادتنا خلال أسبوع من تاريخه. شاكرين حسن تعاونكم.</p>

        <div class="signatures">
          <div><b>الختم والتوقيع (الشركة)</b><br><br>____________________</div>
          <div><b>المصادقة والاعتماد (العميل)</b><br><br>____________________</div>
        </div>
        <script>window.onload = () => window.print();<\/script>
      </body>
      </html>
    `),n.document.close()}}async function F(){if(!a)return;const n=document.getElementById("stmt-cust-name"),e=document.getElementById("stmt-cust-sub"),o=document.getElementById("stmt-kpi-strip");n&&(n.textContent=a.name),e&&(e.textContent=`كود: ${a.code||"—"} | الجوال: ${a.phone||"—"} | المندوب: ${a.repName||"—"} | المنطقة: ${a.zone||"—"}`);const s=(a.name||"").trim().toLowerCase(),i=await E(_.chartOfAccounts(),[I("sourceEntityId","==",a.id)]).catch(()=>[]),g=new Set,l=new Set;i.forEach(t=>{l.add(t.id),t.code&&g.add(t.code)});const[C,B,h,p]=await Promise.all([E(_.salesInvoices(),[I("customerId","==",a.id)]).catch(()=>[]),E(_.receipts(),[I("targetId","==",a.id)]).catch(()=>[]),E(_.salesReturns(),[I("customerId","==",a.id)]).catch(()=>[]),E(_.journalEntries()).catch(()=>[])]),d=[];C.forEach(t=>{const y=parseFloat(t.totalWithVat||t.total||0);d.push({date:t.date||v(),type:"invoice",typeLabel:"🧾 فاتورة بيع",refNo:t.number||t.invoiceNumber||t.id,notes:t.notes||`فاتورة مبيعات (${(t.lines||[]).length} أصناف)`,debit:y,credit:0,raw:t})}),B.forEach(t=>{const y=parseFloat(t.amount||0);d.push({date:t.date||v(),type:"receipt",typeLabel:"💵 سند قبض",refNo:t.receiptNumber||t.number||t.code||t.id,notes:t.notes||`سداد دفعة حساب (${t.method==="cash"?"نقدي":"بنكي"})`,debit:0,credit:y,raw:t})}),h.forEach(t=>{const y=parseFloat(t.totalWithVat||t.total||0);d.push({date:t.date||v(),type:"return",typeLabel:"↩️ مردود مبيعات",refNo:t.number||t.creditNoteNumber||t.id,notes:t.notes||"إشعار دائن مردودات",debit:0,credit:y,raw:t})}),p.forEach((t,y)=>{if(t.status==="cancelled"||t.isReversed)return;const b=(t.sourceType||"").toLowerCase(),z=(t.refType||"").toLowerCase(),$=(t.description||"").toLowerCase();b==="salesinvoice"||b==="sales"||b==="receipt"||b==="salesreturn"||b==="sales_return"||b==="salescogs"||b==="cogs"||b==="salesreturncogs"||b==="salesinvoice_cogs"||b==="collection"||b==="expense"||b==="supplierpayment"||z.includes("sales")||z.includes("receipt")||z.includes("invoice")||z.includes("return")||$.includes("مبيعات")||$.includes("فاتورة")||$.includes("سند قبض")||$.includes("مرتجع")||$.includes("إشعار دائن")||$.includes("تصفية")||(t.lines||[]).forEach((f,j)=>{const M=f.accountId,A=f.accountCode,P=(f.accountName||"").trim().toLowerCase();if(M&&l.has(M)||A&&g.has(A)||s&&P&&P===s){const H=parseFloat(f.debit||0),q=parseFloat(f.credit||0);if(H===0&&q===0)return;const R=(t.description||"").includes("افتتاحي")||(f.note||"").includes("افتتاحي")||t.sourceType==="opening";d.push({date:t.date||v(),type:"journal",typeLabel:R?"⚖️ قيد افتتاحى":"📝 قيد يومية",refNo:t.entryNumber||t.number||`JE-${y}`,notes:t.description||f.note||f.accountName||"قيد محاسبي مرحل",debit:H,credit:q,raw:t})}})}),d.sort((t,y)=>(t.date||"").localeCompare(y.date||"")),X(C,B);let c=parseFloat(a.openingBalance||0);d.forEach(t=>{t.date<m&&(c+=t.debit-t.credit)});const w=d.filter(t=>t.date>=m&&t.date<=u);let S=c,L=0,D=0;x=[],(c!==0||w.length>0)&&x.push({date:m,type:"opening",typeLabel:"⚖️ رصيد افتتاحي",refNo:"—",notes:"رصيد سابق قبل الفترة المحددة",debit:c>0?c:0,credit:c<0?Math.abs(c):0,runningBalance:c}),w.forEach(t=>{S+=t.debit-t.credit,L+=t.debit,D+=t.credit,x.push({...t,runningBalance:S})}),k={opening:c,debit:L,credit:D,balance:S},o&&(o.innerHTML=`
      <div style="text-align:center; padding:6px 12px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:8px;">
        <div style="font-size:10px; color:var(--text-2);">الرصيد الافتتاحي</div>
        <div class="mono" style="font-size:13px; font-weight:800;">${r(c)}</div>
      </div>
      <div style="text-align:center; padding:6px 12px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:8px;">
        <div style="font-size:10px; color:var(--text-2);">المسحوبات (مدين)</div>
        <div class="mono" style="font-size:13px; font-weight:800; color:var(--bad);">+ ${r(L)}</div>
      </div>
      <div style="text-align:center; padding:6px 12px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:8px;">
        <div style="font-size:10px; color:var(--text-2);">المدفوعات (دائن)</div>
        <div class="mono" style="font-size:13px; font-weight:800; color:var(--good);">- ${r(D)}</div>
      </div>
      <div style="text-align:center; padding:6px 14px; background:linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05)); border:1.5px solid var(--brand); border-radius:8px;">
        <div style="font-size:10.5px; font-weight:700; color:var(--brand);">الرصيد النهائي المستحق</div>
        <div class="mono" style="font-size:15px; font-weight:900; color:${S>0?"var(--bad)":"var(--good)"};">${r(S)}</div>
      </div>
    `),W()}function X(n,e){const o=new Date;let s=e.reduce((p,d)=>p+parseFloat(d.amount||0),0),i=0,g=0,l=0,C=0;[...n].sort((p,d)=>(p.date||"").localeCompare(d.date||"")).forEach(p=>{let d=parseFloat(p.totalWithVat||p.total||0);if(s>=d?(s-=d,d=0):(d-=s,s=0),d>0&&p.date){const c=new Date(p.date),w=Math.floor((o-c)/(1e3*60*60*24));w<=30?i+=d:w<=60?g+=d:w<=90?l+=d:C+=d}});const h=(p,d)=>{const c=document.getElementById(p);c&&(c.textContent=r(d))};h("aging-current",i),h("aging-30",g),h("aging-60",l),h("aging-90",C)}function W(){const n=document.getElementById("stmt-tbody");if(!n)return;let e=x;if(N!=="all"&&(e=x.filter(o=>o.type==="opening"||o.type===N)),!e.length){n.innerHTML='<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد حركات مالية مسجلة للعميل خلال هذه الفترة</td></tr>';return}n.innerHTML=e.map((o,s)=>`
    <tr style="${o.type==="opening"?"background:rgba(99,102,241,0.04); font-weight:700;":""}">
      <td class="mono font-semibold">${o.date}</td>
      <td><span class="badge neutral" style="font-size:11px;">${o.typeLabel}</span></td>
      <td class="mono" style="color:var(--brand); font-weight:700;">${o.refNo}</td>
      <td style="font-size:12px; color:var(--text-1);">${o.notes}</td>
      <td class="mono" style="text-align:left; color:${o.debit>0?"var(--bad)":"var(--text-dim)"}; font-weight:${o.debit>0?"700":"normal"};">
        ${o.debit>0?r(o.debit):"—"}
      </td>
      <td class="mono" style="text-align:left; color:${o.credit>0?"var(--good)":"var(--text-dim)"}; font-weight:${o.credit>0?"700":"normal"};">
        ${o.credit>0?r(o.credit):"—"}
      </td>
      <td class="mono font-bold" style="text-align:left; font-size:13px; color:${o.runningBalance>0?"var(--bad)":"var(--good)"};">
        ${r(o.runningBalance)}
      </td>
      <td style="text-align:center;" class="no-print">
        ${o.type!=="opening"?`
          <button class="btn btn-icon sm btn-ghost" onclick="window.previewDocDetail(${s})" title="عرض تفاصيل المستند">👁️</button>
        `:""}
      </td>
    </tr>
  `).join("")}export{rt as render};
