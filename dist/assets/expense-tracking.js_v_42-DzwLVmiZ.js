import{s as L,t as D,g as k,C as w,d as F,a as O,f as x}from"./index-HrCilPJ3.js";import{orderBy as $,getDocs as H,query as _,collection as R,where as S,limit as z}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let P=[],I=[],B=[],y={},C=null,E=null;async function V(e,p){e.innerHTML=`
    <style>
      .print-only-header { display: none; }
      @media print {
        .print-only-header { display: block !important; }
        .no-print { display: none !important; }
        .chart-container-card { display: none !important; }
      }
      .chart-container-card {
        background: var(--bg-1);
        border: 1px solid var(--border-soft);
        border-radius: 12px;
        padding: 16px;
        box-shadow: var(--shadow-sm);
      }
    </style>
    <div class="filterbar no-print" style="flex-wrap: wrap; gap: 12px; height: auto; padding: 12px;">
      <div class="date-range-group"><label>من</label>
        <input type="date" id="et-from" value="${L()}" onchange="loadExpenseTracking()" /></div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="et-to" value="${D()}" onchange="loadExpenseTracking()" /></div>
      
      <div class="filter-select-group"><label>تصنيف المصروف</label>
        <select id="et-class-filter" onchange="filterExpenseTracking()" style="min-width:140px;">
          <option value="">الكل</option>
          <option value="تشغيلية">تشغيلية</option>
          <option value="إدارية وعمومية">إدارية وعمومية</option>
          <option value="تمويلية">تمويلية</option>
        </select>
      </div>

      <div class="filter-select-group"><label>الحساب التفصيلي</label>
        <select id="et-account-filter" onchange="filterExpenseTracking()" style="min-width:160px;">
          <option value="">الكل</option>
        </select>
      </div>

      <div class="filter-select-group"><label>مركز التكلفة</label>
        <select id="et-cc-filter" onchange="filterExpenseTracking()" style="min-width:140px;">
          <option value="">الكل</option>
        </select>
      </div>

      <div class="filter-select-group"><label>طريقة الصرف</label>
        <select id="et-method-filter" onchange="filterExpenseTracking()" style="min-width:120px;">
          <option value="">الكل</option>
          <option value="cash">نقدي (الصناديق)</option>
          <option value="bank">بنكي (الحسابات)</option>
        </select>
      </div>

      <div style="margin-right:auto;display:flex;gap:8px;align-items:center;">
        <button class="btn-export" onclick="exportPagePDF('#et-table','تقرير تتبع مصروفات الشركة')" title="تصدير PDF"><span>📄</span> PDF</button>
        <button class="btn-export excel" onclick="exportPageExcel('#et-table','تقرير تتبع مصروفات الشركة')" title="تصدير Excel"><span>📊</span> Excel</button>
        <button class="btn-export print" onclick="window.print()" title="طباعة"><span>🖨️</span> طباعة</button>
      </div>
    </div>

    <div class="page-content">
      <!-- Luxury Print Header -->
      <div class="print-only-header" style="border-bottom:3px double var(--brand); padding-bottom:12px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:16px; align-items:center;">
            <img id="et-print-logo" style="max-height:64px; max-width:120px;" src="" alt="شعار الشركة" />
            <div>
              <h2 id="et-print-co-name" style="margin:0; font-family:var(--font-heading); color:var(--brand);"></h2>
              <div id="et-print-co-details" class="dim" style="font-size:11px; margin-top:4px;"></div>
            </div>
          </div>
          <div style="text-align:left;">
            <h3 style="margin:0; font-family:var(--font-heading);">تقرير تتبع مصروفات الشركة التفصيلي</h3>
            <p style="margin:4px 0 0 0; font-size:11px; color:var(--text-2);" id="et-print-period"></p>
          </div>
        </div>
      </div>

      <div class="page-header no-print">
        <h1 class="page-title">لوحة تتبع وتحليل المصروفات (تشغيلية / إدارية / تمويلية)</h1>
        <p class="page-subtitle" id="et-period"></p>
      </div>

      <!-- KPI Summary -->
      <div class="kpi-grid mb-24">
        <div class="kpi-card"><div class="status-bar good"></div>
          <div class="kpi-icon good">⚙️</div>
          <div class="kpi-content"><div class="kpi-label">المصروفات التشغيلية</div>
            <div class="kpi-value mono" id="et-total-op">—</div></div></div>
        <div class="kpi-card"><div class="status-bar indigo"></div>
          <div class="kpi-icon indigo">🏢</div>
          <div class="kpi-content"><div class="kpi-label">المصروفات الإدارية والعمومية</div>
            <div class="kpi-value mono" id="et-total-admin">—</div></div></div>
        <div class="kpi-card"><div class="status-bar warn"></div>
          <div class="kpi-icon warn">💳</div>
          <div class="kpi-content"><div class="kpi-label">المصروفات التمويلية</div>
            <div class="kpi-value mono" id="et-total-fin">—</div></div></div>
        <div class="kpi-card"><div class="status-bar bad"></div>
          <div class="kpi-icon bad">💸</div>
          <div class="kpi-content"><div class="kpi-label">إجمالي مصروفات الشركة</div>
            <div class="kpi-value mono" id="et-total-amount">—</div></div></div>
      </div>

      <!-- Dashboard Charts Row -->
      <div class="grid-2 gap-20 mb-24 no-print">
        <!-- Chart 1: Expenses by Account (Column Chart) -->
        <div class="chart-container-card">
          <h3 style="font-family:var(--font-heading);font-size:14px;margin-top:0;margin-bottom:16px;color:var(--text-1);">📊 توزيع المصروفات حسب الحسابات</h3>
          <div style="position:relative; height:240px; width:100%;">
            <canvas id="et-category-chart"></canvas>
          </div>
        </div>

        <!-- Chart 2: Monthly Trend (Line Chart) -->
        <div class="chart-container-card">
          <h3 style="font-family:var(--font-heading);font-size:14px;margin-top:0;margin-bottom:16px;color:var(--text-1);">📈 تتبع زيادة ونقص المصروفات بالفترة</h3>
          <div style="position:relative; height:240px; width:100%;">
            <canvas id="et-trend-chart"></canvas>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header no-print" style="margin-bottom: 12px;">
          <h3 style="font-family:var(--font-heading);font-size:15px;margin:0;">📋 سجل حركة المصروفات التفصيلي</h3>
        </div>
        <div class="table-container">
          <table class="data-dense" id="et-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>رقم السند</th>
                <th>البند / الحساب المدين</th>
                <th>نوع المصروف</th>
                <th>طريقة الصرف (الدفع من)</th>
                <th>مركز التكلفة</th>
                <th>البيان / الملاحظات</th>
                <th style="text-align:left; color:var(--bad);">المبلغ (ر.س)</th>
              </tr>
            </thead>
            <tbody id="et-tbody">
              <tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد مصروفات مسجلة</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,window.loadExpenseTracking=T,window.filterExpenseTracking=W,await K(),await T()}function j(e){return e?e.startsWith("5-5")?"تمويلية":e.startsWith("5-4")||e.startsWith("5-6")||e.startsWith("5-7")?"إدارية وعمومية":e.startsWith("5-2")||e.startsWith("5-3")||e.startsWith("5-1")?"تشغيلية":"أخرى":"أخرى"}async function K(){try{const[e,p]=await Promise.all([k(w.chartOfAccounts(),[$("code")]),k(w.costCenters(),[$("name")])]);y={},e.forEach(o=>{y[o.id]=o}),I=e.filter(o=>o.type==="expense"||String(o.code).startsWith("5")),B=p;const a=document.getElementById("et-account-filter");a&&(a.innerHTML='<option value="">الكل</option>'+I.map(o=>`<option value="${o.name}">${o.code} — ${o.name}</option>`).join(""));const s=document.getElementById("et-cc-filter");s&&(s.innerHTML='<option value="">الكل</option>'+B.map(o=>`<option value="${o.name}">${o.name}</option>`).join(""))}catch(e){console.error("loadFilters error:",e)}}async function T(){const e=document.getElementById("et-from")?.value||"",p=document.getElementById("et-to")?.value||"",a=document.getElementById("et-period");a&&(a.textContent=`الفترة من ${e||"البداية"} إلى ${p||"اليوم"}`);try{const[s,o,i]=await Promise.all([k(w.chartOfAccounts(),[$("code")]),k(w.costCenters(),[$("name")]),H(_(R(F,`companies/${O}/journalEntries`),S("date",">=",e),S("date","<=",p),z(2e3)))]);y={},s.forEach(t=>{y[t.id]=t}),I=s.filter(t=>t.type==="expense"||String(t.code||"").startsWith("5")),B=o;const u=i.docs.map(t=>({id:t.id,...t.data()})),d=[];u.forEach(t=>{if(t.status&&t.status!=="posted")return;const r=t.lines||[];let v="",g="";const h=r.filter(c=>(c.credit||0)>0);if(h.length>0){const c=h.find(n=>String(n.accountCode||"").startsWith("1-1-1-1"));if(c)v="cash",g=c.accountName;else{const n=h.find(l=>String(l.accountCode||"").startsWith("1-1-1-3"));if(n)v="bank",g=n.accountName;else{const l=h.find(b=>String(b.accountCode||"").startsWith("2-1-1"));l?(v="supplier",g=l.accountName):(v="other",g=h[0].accountName)}}}r.forEach(c=>{if((c.debit||0)<=0)return;const n=c.accountCode||"",l=Object.values(y).find(A=>A.code===n)||y[c.accountId];if(!(l?.type==="expense"||n.startsWith("5")||String(n).startsWith("5")))return;const N=j(n);d.push({id:t.id,entryNumber:t.entryNumber,date:t.date||"",amount:parseFloat(c.debit||0),entityType:"account",targetId:c.accountId||"",accountCode:n,accountName:c.accountName||l?.name||"مصروف",expenseClass:N,method:v||"other",sourceName:g||"—",costCenterName:c.costCenterName||"—",notes:c.note||t.description||"—"})})}),P=d;const f=document.getElementById("et-account-filter");f&&(f.innerHTML='<option value="">الكل</option>'+I.map(t=>`<option value="${t.name}">${t.code} — ${t.name}</option>`).join(""));const m=document.getElementById("et-cc-filter");m&&(m.innerHTML='<option value="">الكل</option>'+B.map(t=>`<option value="${t.name}">${t.name}</option>`).join("")),W(),U(e,p)}catch(s){window.showToast("فشل تحميل تتبع المصروفات: "+s.message,"danger")}}function W(){const e=document.getElementById("et-class-filter")?.value||"",p=document.getElementById("et-account-filter")?.value||"",a=document.getElementById("et-cc-filter")?.value||"",s=document.getElementById("et-method-filter")?.value||"",o=document.getElementById("et-tbody");if(!o)return;let i=[...P];e&&(i=i.filter(t=>t.expenseClass===e)),p&&(i=i.filter(t=>t.accountName===p)),a&&(i=i.filter(t=>t.costCenterName===a)),s&&(i=i.filter(t=>t.method===s)),i.sort((t,r)=>r.date.localeCompare(t.date));const u=i.reduce((t,r)=>t+parseFloat(r.amount||0),0),d=i.filter(t=>t.expenseClass==="تشغيلية").reduce((t,r)=>t+parseFloat(r.amount||0),0),f=i.filter(t=>t.expenseClass==="إدارية وعمومية").reduce((t,r)=>t+parseFloat(r.amount||0),0),m=i.filter(t=>t.expenseClass==="تمويلية").reduce((t,r)=>t+parseFloat(r.amount||0),0);if(document.getElementById("et-total-amount").textContent=x(u),document.getElementById("et-total-op").textContent=x(d),document.getElementById("et-total-admin").textContent=x(f),document.getElementById("et-total-fin").textContent=x(m),i.length===0){o.innerHTML='<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد مصروفات تطابق الفلاتر المحددة</td></tr>',M([]);return}o.innerHTML=i.map(t=>{let r="neutral";return t.expenseClass==="تشغيلية"&&(r="good"),t.expenseClass==="إدارية وعمومية"&&(r="indigo"),t.expenseClass==="تمويلية"&&(r="warn"),`
      <tr>
        <td class="mono dim">${t.date}</td>
        <td class="mono font-bold">${t.entryNumber||t.id.substring(0,8).toUpperCase()}</td>
        <td><strong>${t.accountName||"مصروف"}</strong> <span class="mono dim" style="font-size:11px;">(${t.accountCode})</span></td>
        <td><span class="badge ${r}">${t.expenseClass}</span></td>
        <td>
          <span class="badge ${t.method==="cash"?"neutral":"indigo"}">
            ${t.method==="cash"?"💵 ":"🏦 "} ${t.sourceName||(t.method==="cash"?"الصندوق":"البنك")}
          </span>
        </td>
        <td><span class="dim">${t.costCenterName||"—"}</span></td>
        <td>${t.notes||"—"}</td>
        <td class="mono font-bold text-bad" style="text-align:left;">${x(t.amount)}</td>
      </tr>
    `}).join(""),M(i)}function M(e){C&&(C.destroy(),C=null),E&&(E.destroy(),E=null);const p=document.getElementById("et-category-chart"),a=document.getElementById("et-trend-chart");if(!p||!a||e.length===0)return;const s={};e.forEach(n=>{const l=n.accountName||"مصروف عام";s[l]=(s[l]||0)+parseFloat(n.amount||0)});const o=Object.keys(s),i=Object.values(s);C=new Chart(p,{type:"bar",data:{labels:o,datasets:[{label:"إجمالي الصرف (ر.س)",data:i,backgroundColor:"rgba(79, 70, 229, 0.8)",borderColor:"#4f46e5",borderWidth:1.5,borderRadius:6,borderSkipped:!1,barThickness:o.length>5?16:28}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},scales:{x:{grid:{display:!1}},y:{beginAtZero:!0,grid:{color:"rgba(0,0,0,0.05)"}}}}});const u=document.getElementById("et-from")?.value||"",d=document.getElementById("et-to")?.value||"";let f=!1;if(u&&d){const n=Math.abs(new Date(d)-new Date(u));Math.ceil(n/(1e3*60*60*24))<=31&&(f=!0)}const m={},t=new Set,r=new Set(["تشغيلية","إدارية وعمومية","تمويلية"]);e.forEach(n=>{if(!n.date)return;const l=f?n.date:n.date.substring(0,7);t.add(l),m[l]||(m[l]={}),m[l][n.expenseClass]=(m[l][n.expenseClass]||0)+parseFloat(n.amount||0)});const v=Array.from(t).sort(),g=Array.from(r),h={تشغيلية:"#10b981","إدارية وعمومية":"#4f46e5",تمويلية:"#f59e0b"},c=g.map(n=>{const l=v.map(N=>m[N][n]||0),b=h[n]||"#6b7280";return{label:n,data:l,borderColor:b,backgroundColor:b+"12",borderWidth:2.5,tension:.3,pointRadius:v.length>15?1:4,pointHoverRadius:6,fill:!0}});E=new Chart(a,{type:"line",data:{labels:v,datasets:c},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"bottom",labels:{boxWidth:10,usePointStyle:!0,font:{size:10}}}},scales:{x:{grid:{display:!1}},y:{beginAtZero:!0,grid:{color:"rgba(0,0,0,0.05)"}}}}})}function U(e,p){let a={};try{const d=localStorage.getItem("idham_company");d?a=JSON.parse(d):window.ERP_COMPANY&&(a=window.ERP_COMPANY)}catch{}const s=document.getElementById("et-print-logo");s&&(a.logoBase64||a.logoUrl?(s.src=a.logoBase64||a.logoUrl,s.style.display="block"):s.style.display="none");const o=document.getElementById("et-print-co-name");o&&(o.textContent=a.name||"مؤسسة إدهام للمواد الغذائية");const i=document.getElementById("et-print-co-details");if(i){const d=[];a.address&&d.push(`📍 ${a.address}`),a.phone&&d.push(`📞 ${a.phone}`),a.vatNumber&&d.push(`🔢 الرقم الضريبي: ${a.vatNumber}`),a.crNumber&&d.push(`📋 السجل التجاري: ${a.crNumber}`),i.textContent=d.join(" | ")}const u=document.getElementById("et-print-period");u&&(u.textContent=`الفترة من ${e||"البداية"} إلى ${p||"اليوم"}`)}export{V as render};
