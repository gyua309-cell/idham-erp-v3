import{s as G,t as j,C as m,g as z,f as n}from"./index-HrCilPJ3.js";import{query as x,limit as w,getDocs as y}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function K(f,h){f.innerHTML=`
    <div class="filterbar">
      <div class="date-range-group"><label>من</label>
        <input type="date" id="pl-from" value="${G()}" onchange="loadProfitLoss()" /></div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="pl-to" value="${j()}" onchange="loadProfitLoss()" /></div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="window.print()">🖨️ طباعة التقرير</button>
        <button class="btn btn-secondary btn-sm" onclick="loadProfitLoss()">🔄 تحديث</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">قائمة الأرباح والخسائر (Income Statement)</h1>
        <p class="page-subtitle" id="pl-period"></p>
      </div>

      <div style="max-width:800px;margin:0 auto;">
        <!-- Net Profit KPI Banner -->
        <div class="card mb-24" style="background:linear-gradient(135deg, var(--surface-1), var(--bg-1));">
          <div class="card-body" style="padding:30px;text-align:center;">
            <div class="section-label mb-8" style="font-size:13px;">صافي الربح / الخسارة</div>
            <div class="mono font-bold" style="font-size:36px;line-height:1.2;" id="pl-net-profit">—</div>
            <div class="text-2 mt-8" style="font-size:12px;" id="pl-profit-margin">هامش الصافي: 0%</div>
          </div>
        </div>

        <!-- Income Statement Financial Table -->
        <div class="card">
          <div class="card-header"><h3 style="font-family:var(--font-heading);">تفاصيل الحسابات الختامية</h3></div>
          <div class="table-container">
            <table class="data-dense">
              <tbody>
                <!-- REVENUE SECTION -->
                <tr style="background:var(--bg-2);"><td colspan="2" class="font-heading font-bold text-indigo">1. الإيرادات والمبيعات</td></tr>
                <tr><td style="padding-right:24px;">إجمالي إيراد المبيعات (بدون VAT)</td><td class="mono font-bold text-right" id="pl-gross-sales">0.00 ر.س</td></tr>
                <tr><td style="padding-right:24px;" class="text-bad">يخصم: مردودات المبيعات والخصومات</td><td class="mono text-bad text-right" id="pl-sales-returns">0.00 ر.س</td></tr>
                <tr style="border-top:1px solid var(--border);"><td class="font-bold">صافي المبيعات (Net Revenue)</td><td class="mono font-bold text-good text-right" id="pl-net-sales">0.00 ر.س</td></tr>

                <!-- COST OF GOODS SOLD -->
                <tr style="background:var(--bg-2);"><td colspan="2" class="font-heading font-bold text-warn">2. تكلفة المبيعات (COGS)</td></tr>
                <tr><td style="padding-right:24px;">تكلفة البضاعة المباعة (المشتريات)</td><td class="mono text-right" id="pl-cogs">0.00 ر.س</td></tr>
                <tr style="border-top:1px solid var(--border);"><td class="font-bold">مجمل الربح (Gross Profit)</td><td class="mono font-bold text-indigo text-right" id="pl-gross-profit">0.00 ر.س</td></tr>

                <!-- OPERATING EXPENSES -->
                <tr style="background:var(--bg-2);"><td colspan="2" class="font-heading font-bold text-bad">3. المصروفات التشغيلية والعمومية</td></tr>
                <tr><td style="padding-right:24px;">مصروفات عُملات المناديب والتوزيع</td><td class="mono text-right" id="pl-exp-comm">0.00 ر.س</td></tr>
                <tr><td style="padding-right:24px;">مصروفات رواتب وإيجارات ومصروفات عامة</td><td class="mono text-right" id="pl-exp-general">0.00 ر.س</td></tr>
                <tr style="border-top:1px solid var(--border);"><td class="font-bold">إجمالي المصروفات التشغيلية</td><td class="mono font-bold text-bad text-right" id="pl-total-expenses">0.00 ر.س</td></tr>

                <!-- NET PROFIT -->
                <tr style="background:var(--surface-1);border-top:2px solid var(--border);"><td class="font-heading font-bold style=font-size:16px;">صافي الربح قبل الضريبة</td><td class="mono font-bold text-right" style="font-size:18px;" id="pl-final-net">0.00 ر.س</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`,await F()}async function F(){let f=document.getElementById("pl-from")?.value,h=document.getElementById("pl-to")?.value;const v=o=>{if(!o)return"";if(/^\d{4}-\d{2}-\d{2}$/.test(o))return o;const l=o.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);if(l)return`${l[3]}-${l[2].padStart(2,"0")}-${l[1].padStart(2,"0")}`;const i=new Date(o);return isNaN(i.getTime())?o:i.toISOString().split("T")[0]};let s=v(f),d=v(h);if(s&&d&&s>d){const o=s;s=d,d=o}document.getElementById("pl-period").textContent=`الفترة من ${s} إلى ${d}`;try{const o=x(m.salesInvoices(),w(2e3)),i=(await y(o)).docs.map(t=>t.data()).filter(t=>{const e=t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:t.date||"";return e>=s&&e<=d&&t.status!=="cancelled"}),D=x(m.salesReturns(),w(500)),N=(await y(D)).docs.map(t=>t.data()).filter(t=>{const e=t.createdAt?.toDate?t.createdAt.toDate().toISOString().split("T")[0]:t.date||"";return e>=s&&e<=d}),A=await z(m.chartOfAccounts()),k=x(m.journalEntries()),E=(await y(k)).docs.map(t=>({id:t.id,...t.data()}));let u=0,b=0,S=0;E.forEach(t=>{const e=t.date||"";e>=s&&e<=d&&(t.lines||[]).forEach(a=>{const r=a.accountCode||"";(r==="5-1-8"||r==="5-1-7"||r.startsWith("5-1-8")||r.startsWith("5-1-7"))&&(S+=(a.debit||0)-(a.credit||0))})}),A.forEach(t=>{if(t.type!=="expense"||t.code?.startsWith("5-1"))return;let a=0;E.forEach(r=>{const $=r.date||"";$>=s&&$<=d&&(r.lines||[]).forEach(g=>{(g.accountId===t.id||g.accountCode===t.code)&&(a+=(g.debit||0)-(g.credit||0))})}),!(a<=0)&&(t.name.includes("عمولة")||t.name.includes("توزيع")||t.name.includes("مندوب")||t.name.includes("مناديب")?u+=a:b+=a)});const I=i.reduce((t,e)=>t+(e.subtotal||0),0),C=N.reduce((t,e)=>t+(e.subtotal||0),0),c=I-C,O=S,B=c-O,P=u+b,p=B-P,L=c>0?p/c*100:0;document.getElementById("pl-gross-sales").textContent=n(I),document.getElementById("pl-sales-returns").textContent=`- ${n(C)}`,document.getElementById("pl-net-sales").textContent=n(c),document.getElementById("pl-cogs").textContent=n(O),document.getElementById("pl-gross-profit").textContent=n(B),document.getElementById("pl-exp-comm").textContent=n(u),document.getElementById("pl-exp-general").textContent=n(b),document.getElementById("pl-total-expenses").textContent=n(P),document.getElementById("pl-final-net").textContent=n(p);const T=document.getElementById("pl-net-profit");T.textContent=n(p),T.className=`mono font-bold ${p>=0?"text-good":"text-bad"}`,document.getElementById("pl-profit-margin").textContent=`هامش صافي الربح: ${L.toFixed(1)}%`}catch(o){console.error(o)}}export{K as render};
