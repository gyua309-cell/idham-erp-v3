import{s as D,t as F,a as b,f as v,g as C}from"./index-DaYejt0r.js";import{query as W,where as E,limit as L,getDocs as O,orderBy as k}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let T=[],w=[],I=[],h={},g=null,f=null;async function Z(e,c){e.innerHTML=`
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
        <input type="date" id="et-from" value="${D()}" onchange="loadExpenseTracking()" /></div>
      <div class="date-range-group"><label>إلى</label>
        <input type="date" id="et-to" value="${F()}" onchange="loadExpenseTracking()" /></div>
      
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
  `,window.loadExpenseTracking=B,window.filterExpenseTracking=N,await H(),await B()}function _(e){return e?e.startsWith("5-5")?"تمويلية":e.startsWith("5-4")||e.startsWith("5-6")||e.startsWith("5-7")?"إدارية وعمومية":e.startsWith("5-2")||e.startsWith("5-3")||e.startsWith("5-1")?"تشغيلية":"أخرى":"أخرى"}async function H(){try{const[e,c]=await Promise.all([C(b.chartOfAccounts(),[k("code")]),C(b.costCenters(),[k("name")])]);h={},e.forEach(n=>{h[n.id]=n}),w=e.filter(n=>n.type==="expense"||String(n.code).startsWith("5")),I=c;const a=document.getElementById("et-account-filter");a&&(a.innerHTML='<option value="">الكل</option>'+w.map(n=>`<option value="${n.name}">${n.code} — ${n.name}</option>`).join(""));const s=document.getElementById("et-cc-filter");s&&(s.innerHTML='<option value="">الكل</option>'+I.map(n=>`<option value="${n.name}">${n.name}</option>`).join(""))}catch(e){console.error("loadFilters error:",e)}}async function B(){const e=document.getElementById("et-from")?.value||"",c=document.getElementById("et-to")?.value||"",a=document.getElementById("et-period");a&&(a.textContent=`الفترة من ${e||"البداية"} إلى ${c||"اليوم"}`);try{const s=W(b.expenses(),E("date",">=",e),E("date","<=",c),L(1500));T=(await O(s)).docs.map(l=>({id:l.id,...l.data()})).filter(l=>{if(l.entityType!=="account")return!1;const i=h[l.targetId];return i?i.type==="expense"||String(i.code).startsWith("5"):!1}).map(l=>{const i=h[l.targetId],u=_(i?.code);return{...l,accountCode:i?.code||"",expenseClass:u}}),N(),R(e,c)}catch(s){window.showToast("فشل تحميل تتبع المصروفات: "+s.message,"danger")}}function N(){const e=document.getElementById("et-class-filter")?.value||"",c=document.getElementById("et-account-filter")?.value||"",a=document.getElementById("et-cc-filter")?.value||"",s=document.getElementById("et-method-filter")?.value||"",n=document.getElementById("et-tbody");if(!n)return;let o=[...T];e&&(o=o.filter(t=>t.expenseClass===e)),c&&(o=o.filter(t=>t.accountName===c)),a&&(o=o.filter(t=>t.costCenterName===a)),s&&(o=o.filter(t=>t.method===s)),o.sort((t,r)=>r.date.localeCompare(t.date));const l=o.reduce((t,r)=>t+parseFloat(r.amount||0),0),i=o.filter(t=>t.expenseClass==="تشغيلية").reduce((t,r)=>t+parseFloat(r.amount||0),0),u=o.filter(t=>t.expenseClass==="إدارية وعمومية").reduce((t,r)=>t+parseFloat(r.amount||0),0),m=o.filter(t=>t.expenseClass==="تمويلية").reduce((t,r)=>t+parseFloat(r.amount||0),0);if(document.getElementById("et-total-amount").textContent=v(l),document.getElementById("et-total-op").textContent=v(i),document.getElementById("et-total-admin").textContent=v(u),document.getElementById("et-total-fin").textContent=v(m),o.length===0){n.innerHTML='<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد مصروفات تطابق الفلاتر المحددة</td></tr>',$([]);return}n.innerHTML=o.map(t=>{let r="neutral";return t.expenseClass==="تشغيلية"&&(r="good"),t.expenseClass==="إدارية وعمومية"&&(r="indigo"),t.expenseClass==="تمويلية"&&(r="warn"),`
      <tr>
        <td class="mono dim">${t.date}</td>
        <td class="mono font-bold">${t.id.substring(0,8).toUpperCase()}</td>
        <td><strong>${t.accountName||"مصروف"}</strong> <span class="mono dim" style="font-size:11px;">(${t.accountCode})</span></td>
        <td><span class="badge ${r}">${t.expenseClass}</span></td>
        <td>
          <span class="badge ${t.method==="cash"?"neutral":"indigo"}">
            ${t.method==="cash"?"💵 ":"🏦 "} ${t.sourceName||(t.method==="cash"?"الصندوق":"البنك")}
          </span>
        </td>
        <td><span class="dim">${t.costCenterName||"—"}</span></td>
        <td>${t.notes||"—"}</td>
        <td class="mono font-bold text-bad" style="text-align:left;">${v(t.amount)}</td>
      </tr>
    `}).join(""),$(o)}function $(e){g&&(g.destroy(),g=null),f&&(f.destroy(),f=null);const c=document.getElementById("et-category-chart"),a=document.getElementById("et-trend-chart");if(!c||!a||e.length===0)return;const s={};e.forEach(d=>{const p=d.accountName||"مصروف عام";s[p]=(s[p]||0)+parseFloat(d.amount||0)});const n=Object.keys(s),o=Object.values(s);g=new Chart(c,{type:"bar",data:{labels:n,datasets:[{label:"إجمالي الصرف (ر.س)",data:o,backgroundColor:"rgba(79, 70, 229, 0.8)",borderColor:"#4f46e5",borderWidth:1.5,borderRadius:6,borderSkipped:!1,barThickness:n.length>5?16:28}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},scales:{x:{grid:{display:!1}},y:{beginAtZero:!0,grid:{color:"rgba(0,0,0,0.05)"}}}}});const l=document.getElementById("et-from")?.value||"",i=document.getElementById("et-to")?.value||"";let u=!1;if(l&&i){const d=Math.abs(new Date(i)-new Date(l));Math.ceil(d/(1e3*60*60*24))<=31&&(u=!0)}const m={},t=new Set,r=new Set(["تشغيلية","إدارية وعمومية","تمويلية"]);e.forEach(d=>{if(!d.date)return;const p=u?d.date:d.date.substring(0,7);t.add(p),m[p]||(m[p]={}),m[p][d.expenseClass]=(m[p][d.expenseClass]||0)+parseFloat(d.amount||0)});const y=Array.from(t).sort(),P=Array.from(r),S={تشغيلية:"#10b981","إدارية وعمومية":"#4f46e5",تمويلية:"#f59e0b"},A=P.map(d=>{const p=y.map(M=>m[M][d]||0),x=S[d]||"#6b7280";return{label:d,data:p,borderColor:x,backgroundColor:x+"12",borderWidth:2.5,tension:.3,pointRadius:y.length>15?1:4,pointHoverRadius:6,fill:!0}});f=new Chart(a,{type:"line",data:{labels:y,datasets:A},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"bottom",labels:{boxWidth:10,usePointStyle:!0,font:{size:10}}}},scales:{x:{grid:{display:!1}},y:{beginAtZero:!0,grid:{color:"rgba(0,0,0,0.05)"}}}}})}function R(e,c){let a={};try{const i=localStorage.getItem("idham_company");i?a=JSON.parse(i):window.ERP_COMPANY&&(a=window.ERP_COMPANY)}catch{}const s=document.getElementById("et-print-logo");s&&(a.logoBase64||a.logoUrl?(s.src=a.logoBase64||a.logoUrl,s.style.display="block"):s.style.display="none");const n=document.getElementById("et-print-co-name");n&&(n.textContent=a.name||"مؤسسة إدهام للمواد الغذائية");const o=document.getElementById("et-print-co-details");if(o){const i=[];a.address&&i.push(`📍 ${a.address}`),a.phone&&i.push(`📞 ${a.phone}`),a.vatNumber&&i.push(`🔢 الرقم الضريبي: ${a.vatNumber}`),a.crNumber&&i.push(`📋 السجل التجاري: ${a.crNumber}`),o.textContent=i.join(" | ")}const l=document.getElementById("et-print-period");l&&(l.textContent=`الفترة من ${e||"البداية"} إلى ${c||"اليوم"}`)}export{Z as render};
