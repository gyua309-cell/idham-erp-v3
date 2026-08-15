import{s as A,t as b,g as B,C as h,f as u}from"./index-HrCilPJ3.js";import{orderBy as I,getDocs as P,query as S,where as F,limit as O}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let k=[],L=[],w=[];async function Y(n,o){n.innerHTML=`
    <style>
      .print-only-header { display: none; }
      @media print {
        .print-only-header { display: block !important; }
        .no-print { display: none !important; }
      }
    </style>
    <div class="filterbar no-print">
      <div class="date-range-group"><label>من</label>
        <input type="date" id="exp-from" value="${A()}" onchange="loadExpenseAnalysis()" /></div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="exp-to" value="${b()}" onchange="loadExpenseAnalysis()" /></div>
      <div class="quick-filters">
        <button class="quick-filter-btn" onclick="expRange('today', event)">اليوم</button>
        <button class="quick-filter-btn active" onclick="expRange('month', event)">هذا الشهر</button>
        <button class="quick-filter-btn" onclick="expRange('last_month', event)">الشهر الماضي</button>
      </div>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn-export" onclick="exportPagePDF('#exp-category-table','تحليل المصروفات حسب فئة الحساب')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportPageExcel('#exp-category-table','تحليل المصروفات حسب فئة الحساب')" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
      </div>
    </div>

    <div class="page-content">
      <!-- Luxury Print Header -->
      <div class="print-only-header" style="border-bottom:3px double var(--brand); padding-bottom:12px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:16px; align-items:center;">
            <img id="exp-print-logo" style="max-height:64px; max-width:120px;" src="" alt="شعار الشركة" />
            <div>
              <h2 id="exp-print-co-name" style="margin:0; font-family:var(--font-heading); color:var(--brand);"></h2>
              <div id="exp-print-co-details" class="dim" style="font-size:11px; margin-top:4px;"></div>
            </div>
          </div>
          <div style="text-align:left;">
            <h3 style="margin:0; font-family:var(--font-heading);">تقرير تحليل المصروفات ومراكز التكلفة</h3>
            <p style="margin:4px 0 0 0; font-size:11px; color:var(--text-2);" id="exp-print-period"></p>
          </div>
        </div>
      </div>

      <div class="page-header no-print">
        <h1 class="page-title">تحليل المصروفات المتقدم ومراكز التكلفة</h1>
        <p class="page-subtitle" id="exp-period"></p>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid mb-24">
        <div class="kpi-card"><div class="status-bar bad"></div>
          <div class="kpi-icon bad">💸</div>
          <div class="kpi-content"><div class="kpi-label">إجمالي المصروفات</div>
            <div class="kpi-value mono" id="exp-total-amount">—</div></div></div>
        <div class="kpi-card"><div class="status-bar indigo"></div>
          <div class="kpi-icon indigo">📈</div>
          <div class="kpi-content"><div class="kpi-label">إجمالي الإيرادات</div>
            <div class="kpi-value mono" id="exp-total-rev">—</div></div></div>
        <div class="kpi-card"><div class="status-bar lime"></div>
          <div class="kpi-icon lime">📊</div>
          <div class="kpi-content"><div class="kpi-label">نسبة المصروفات للإيرادات</div>
            <div class="kpi-value mono" id="exp-ratio">—</div></div></div>
        <div class="kpi-card"><div class="status-bar warn"></div>
          <div class="kpi-icon warn">🏢</div>
          <div class="kpi-content"><div class="kpi-label">أعلى فئة صرف</div>
            <div class="kpi-value" id="exp-top-category" style="font-size:14px;">—</div></div></div>
      </div>

      <div class="grid-2 gap-20">
        <!-- Expenses by Category -->
        <div class="card">
          <div class="card-header"><h3 style="font-family:var(--font-heading);font-size:15px;">المصروفات حسب فئة الحساب</h3></div>
          <div class="table-container">
            <table class="data-dense" id="exp-category-table">
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>الحساب</th>
                  <th style="text-align:left;">المبلغ (ر.س)</th>
                  <th style="width:100px;">النسبة %</th>
                </tr>
              </thead>
              <tbody id="exp-category-tbody">
                <tr><td colspan="4" style="text-align:center;padding:16px;color:var(--text-2);">لا توجد بيانات</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Expenses by Cost Center -->
        <div class="card">
          <div class="card-header"><h3 style="font-family:var(--font-heading);font-size:15px;">المصروفات حسب مراكز التكلفة</h3></div>
          <div class="table-container">
            <table class="data-dense" id="exp-cc-table">
              <thead>
                <tr>
                  <th>مركز التكلفة</th>
                  <th style="text-align:left;">المبلغ (ر.س)</th>
                  <th style="width:100px;">النسبة %</th>
                </tr>
              </thead>
              <tbody id="exp-cc-tbody">
                <tr><td colspan="3" style="text-align:center;padding:16px;color:var(--text-2);">لا توجد بيانات</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,window.expRange=R,window.loadExpenseAnalysis=E,window.exportExpensesCSV=T,await E()}async function E(){const n=document.getElementById("exp-from")?.value||"",o=document.getElementById("exp-to")?.value||"",t=document.getElementById("exp-period");t&&(t.textContent=`الفترة من ${n||"البداية"} إلى ${o||"اليوم"}`);try{const[a,s,r]=await Promise.all([B(h.chartOfAccounts(),[I("code")]),B(h.costCenters(),[I("name")]),P(S(h.journalEntries(),F("date",">=",n),F("date","<=",o),O(2e3)))]);k=a,L=s,w=r.docs.map(p=>({id:p.id,...p.data()})),j(),_(n,o)}catch(a){window.showToast("فشل تحميل المصروفات: "+a.message,"danger")}}function _(n,o){let t={};try{const i=localStorage.getItem("idham_company");i?t=JSON.parse(i):window.ERP_COMPANY&&(t=window.ERP_COMPANY)}catch{}const a=document.getElementById("exp-print-logo");a&&(t.logoBase64||t.logoUrl?(a.src=t.logoBase64||t.logoUrl,a.style.display="block"):a.style.display="none");const s=document.getElementById("exp-print-co-name");s&&(s.textContent=t.name||"مؤسسة إدهام للمواد الغذائية");const r=document.getElementById("exp-print-co-details");if(r){const i=[];t.address&&i.push(`📍 ${t.address}`),t.phone&&i.push(`📞 ${t.phone}`),t.vatNumber&&i.push(`🔢 الرقم الضريبي: ${t.vatNumber}`),t.crNumber&&i.push(`📋 السجل التجاري: ${t.crNumber}`),r.textContent=i.join(" | ")}const p=document.getElementById("exp-print-period");p&&(p.textContent=`الفترة من ${n||"البداية"} إلى ${o||"اليوم"}`)}function j(){let n=0,o=0;const t={},a={},s={};k.forEach(e=>{s[e.code]=e});const r={};L.forEach(e=>{r[e.id]=e}),w.forEach(e=>{(e.lines||[]).forEach(l=>{const v=l.accountCode,f=s[v];if(!f)return;const C=parseFloat(l.debit||0),$=parseFloat(l.credit||0);if(f.type==="expense"){const x=C-$;if(x>.01){n+=x,t[v]||(t[v]={code:v,name:f.name,amount:0}),t[v].amount+=x;const y=l.costCenterId||e.costCenterId||"unassigned",M=l.costCenterName||e.costCenterName||r[y]?.name||"غير محدد";a[y]||(a[y]={id:y,name:M,amount:0}),a[y].amount+=x}}else if(f.type==="revenue"){const x=$-C;x>.01&&(o+=x)}})});const p=o>0?n/o*100:0;document.getElementById("exp-total-amount").textContent=u(n),document.getElementById("exp-total-rev").textContent=u(o),document.getElementById("exp-ratio").textContent=`${p.toFixed(1)}%`;let i="—",d=0;const c=Object.values(t).sort((e,l)=>l.amount-e.amount);c.length>0?(i=c[0].name,d=c[0].amount,document.getElementById("exp-top-category").innerHTML=`${i}<br><span class="mono" style="font-size:11px;color:var(--text-2);">${u(d)}</span>`):document.getElementById("exp-top-category").textContent="—";const m=document.getElementById("exp-category-tbody");m&&(c.length===0?m.innerHTML='<tr><td colspan="4" style="text-align:center;padding:16px;color:var(--text-2);">لا توجد مصروفات مسجلة</td></tr>':m.innerHTML=c.map(e=>{const l=n>0?e.amount/n*100:0;return`
          <tr>
            <td class="mono dim">${e.code}</td>
            <td><strong>${e.name}</strong></td>
            <td class="mono font-bold" style="text-align:left;">${u(e.amount)}</td>
            <td>
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="mono" style="width:36px; text-align:right;">${l.toFixed(0)}%</span>
                <div class="progress-bar" style="height:6px; flex:1;"><div class="fill indigo" style="width:${l}%;"></div></div>
              </div>
            </td>
          </tr>
        `}).join(""));const g=document.getElementById("exp-cc-tbody");if(g){const e=Object.values(a).sort((l,v)=>v.amount-l.amount);e.length===0?g.innerHTML='<tr><td colspan="3" style="text-align:center;padding:16px;color:var(--text-2);">لا توجد مصروفات لمراكز التكلفة</td></tr>':g.innerHTML=e.map(l=>{const v=n>0?l.amount/n*100:0;return`
          <tr>
            <td><strong>${l.name}</strong></td>
            <td class="mono font-bold" style="text-align:left;">${u(l.amount)}</td>
            <td>
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="mono" style="width:36px; text-align:right;">${v.toFixed(0)}%</span>
                <div class="progress-bar" style="height:6px; flex:1;"><div class="fill lime" style="width:${v}%;"></div></div>
              </div>
            </td>
          </tr>
        `}).join("")}}function R(n,o){const t=document.getElementById("exp-from"),a=document.getElementById("exp-to");if(!t||!a)return;const s=new Date;let r=b(),p=b();n==="today"||(n==="month"?r=A():n==="last_month"&&(r=new Date(s.getFullYear(),s.getMonth()-1,1).toISOString().split("T")[0],p=new Date(s.getFullYear(),s.getMonth(),0).toISOString().split("T")[0])),t.value=r,a.value=p,document.querySelectorAll(".quick-filter-btn").forEach(i=>{i.classList.remove("active")}),o&&o.target&&o.target.classList.add("active"),E()}function T(){const n=document.getElementById("exp-from")?.value||"",o=document.getElementById("exp-to")?.value||"",t=[["تحليل المصروفات المتقدم",`من: ${n} إلى: ${o}`],[],["الكود","اسم الحساب","المصروفات (ر.س)"]],a={};k.forEach(d=>{a[d.code]=d});const s={};let r=0;w.forEach(d=>{(d.lines||[]).forEach(c=>{const m=c.accountCode,g=a[m];if(g&&g.type==="expense"){const e=parseFloat(c.debit||0)-parseFloat(c.credit||0);e>.01&&(r+=e,s[m]=(s[m]||0)+e)}})}),Object.entries(s).sort((d,c)=>c[1]-d[1]).forEach(([d,c])=>{const m=a[d];t.push([d,m?m.name:"",c.toFixed(2)])}),t.push([]),t.push(["إجمالي المصروفات","",r.toFixed(2)]);const p=t.map(d=>d.map(c=>`"${String(c??"").replace(/"/g,'""')}"`).join(",")).join(`
`),i=document.createElement("a");i.href=URL.createObjectURL(new Blob(["\uFEFF"+p],{type:"text/csv"})),i.download=`Expense_Analysis_${n}_to_${o}.csv`,i.click()}export{Y as render};
