import{q as U,t as tt,f as x,g as $,a as z}from"./index-CEMoTDyX.js";import{orderBy as K}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";const O=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];let G=[],Y=[],X=[],q=[],N=[],j=[],g=new Date().getFullYear(),M="all",H="all",S="both",k="",v=null,R=null,_=null,h=[];async function ct(n,i){g=new Date().getFullYear(),v=null,k="",n.innerHTML=`
    <!-- Top Filter Bar -->
    <div class="filterbar no-print" style="flex-wrap:wrap; gap:10px; align-items:flex-end; background:var(--bg-1); padding:14px 18px; border-radius:14px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); margin-bottom:16px;">
      
      <!-- Year Selector -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">📅 السنة المالية</label>
        <select id="cmm-year-select" onchange="window.onCmmYearChange(this.value)" style="min-width:110px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12.5px; font-weight:700;">
          <option value="2026" ${g===2026?"selected":""}>2026</option>
          <option value="2025" ${g===2025?"selected":""}>2025</option>
          <option value="2024" ${g===2024?"selected":""}>2024</option>
          <option value="2023" ${g===2023?"selected":""}>2023</option>
        </select>
      </div>

      <!-- Sales Rep Filter -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">👔 المندوب</label>
        <select id="cmm-rep-select" onchange="window.onCmmRepChange(this.value)" style="min-width:170px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px; font-weight:600;">
          <option value="all">كل المناديب (مجمع)</option>
        </select>
      </div>

      <!-- Zone Filter -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">📍 المنطقة / المسار</label>
        <select id="cmm-zone-select" onchange="window.onCmmZoneChange(this.value)" style="min-width:140px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px;">
          <option value="all">كل المناطق</option>
        </select>
      </div>

      <!-- Metric View Toggle -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">👁️ نمط العرض في الخلايا</label>
        <select id="cmm-metric-select" onchange="window.onCmmMetricChange(this.value)" style="min-width:210px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px; font-weight:700;">
          <option value="both" selected>المبيعات والتحصيلات معاً (سطرين)</option>
          <option value="sales">المبيعات فقط (Sales)</option>
          <option value="collections">التحصيلات فقط (Collections)</option>
          <option value="net_sales">صافي المبيعات (بعد خصم المردودات)</option>
        </select>
      </div>

      <!-- Search Input -->
      <div style="flex:1; min-width:200px; max-width:320px;">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">🔍 بحث فوري عن عميل</label>
        <input type="text" id="cmm-search-input" placeholder="اكتب اسم العميل أو الكود..." oninput="window.onCmmSearchInput(this.value)" style="width:100%; padding:6px 12px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px;" />
      </div>

      <!-- Export & Print Actions -->
      <div style="margin-right:auto; display:flex; gap:8px; align-items:center;">
        <button class="btn btn-secondary btn-sm" onclick="window.exportCmmExcel()" style="font-weight:700; display:inline-flex; align-items:center; gap:6px; border-radius:8px;">
          <span>📊</span> تصدير Excel
        </button>
        <button class="btn btn-secondary btn-sm" onclick="window.printCmmReport()" style="font-weight:700; display:inline-flex; align-items:center; gap:6px; border-radius:8px;">
          <span>🖨️</span> طباعة
        </button>
        <button class="btn btn-primary btn-sm" onclick="window.loadCmmData()" style="font-weight:700; display:inline-flex; align-items:center; gap:6px; border-radius:8px;">
          <span>🔄</span> تحديث
        </button>
      </div>
    </div>

    <!-- Page Content Container -->
    <div class="page-content" style="padding:0 4px;">
      
      <!-- Selected Focus Header Alert (When single customer is selected) -->
      <div id="cmm-focus-banner" class="card mb-16" style="display:none; padding:14px 20px; background:linear-gradient(135deg, rgba(99,102,241,0.15), rgba(16,185,129,0.1)); border:1.5px solid var(--brand); border-radius:14px; box-shadow:0 4px 16px rgba(0,0,0,0.06);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:28px;">👤</span>
            <div>
              <div style="font-size:17px; font-weight:900; color:var(--brand);" id="cmm-focus-name">اسم العميل</div>
              <div style="font-size:12px; color:var(--text-2); margin-top:2px;" id="cmm-focus-details">كود العميل | المندوب | رصيد كشف الحساب الفعلي</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <button class="btn btn-secondary btn-sm" id="cmm-focus-stmt-btn" onclick="window.openCmmCustomerStatement()" style="font-weight:700; font-size:12px;">📊 كشف الحساب التفصيلي للعميل</button>
            <button class="btn btn-primary btn-sm" onclick="window.resetCmmCustomerFocus()" style="background:#4F46E5; border-color:#4F46E5; font-weight:700; font-size:12px;">🔙 العودة للمنحنى الإجمالي (كل العملاء)</button>
          </div>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:16px;" id="cmm-kpi-cards">
        
        <div class="card" style="padding:14px 18px; background:linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02)); border:1px solid rgba(99,102,241,0.25); border-radius:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:700; color:var(--indigo);">💳 إجمالي مبيعات السنة (${g})</span>
            <span style="font-size:18px;">📈</span>
          </div>
          <div class="mono font-bold" id="cmm-kpi-sales" style="font-size:20px; color:var(--indigo); margin-top:6px;">0.00 ر.س</div>
          <div style="font-size:11px; color:var(--text-2); margin-top:4px;" id="cmm-kpi-sales-avg">متوسط شهري: 0.00 ر.س</div>
        </div>

        <div class="card" style="padding:14px 18px; background:linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02)); border:1px solid rgba(16,185,129,0.25); border-radius:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:700; color:#10B981;">💵 إجمالي التحصيلات المقبوضة</span>
            <span style="font-size:18px;">📥</span>
          </div>
          <div class="mono font-bold" id="cmm-kpi-collections" style="font-size:20px; color:#10B981; margin-top:6px;">0.00 ر.س</div>
          <div style="font-size:11px; color:var(--text-2); margin-top:4px;" id="cmm-kpi-col-avg">متوسط شهري: 0.00 ر.س</div>
        </div>

        <div class="card" style="padding:14px 18px; background:linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02)); border:1px solid rgba(245,158,11,0.25); border-radius:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:700; color:#F59E0B;">🎯 نسبة كفاءة التحصيل والتغطية</span>
            <span style="font-size:18px;">⚖️</span>
          </div>
          <div class="mono font-bold" id="cmm-kpi-rate" style="font-size:20px; color:#F59E0B; margin-top:6px;">0.0%</div>
          <div style="font-size:11px; color:var(--text-2); margin-top:4px;" id="cmm-kpi-gap">فجوة التحصيل: 0.00 ر.س</div>
        </div>

        <div class="card" style="padding:14px 18px; background:linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.02)); border:1px solid rgba(139,92,246,0.25); border-radius:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:700; color:#8B5CF6;">👥 إجمالي الذمم والمديونيات الفعلية</span>
            <span style="font-size:18px;">🏢</span>
          </div>
          <div class="mono font-bold" id="cmm-kpi-total-balance" style="font-size:20px; color:#8B5CF6; margin-top:6px;">0.00 ر.س</div>
          <div style="font-size:11px; color:var(--text-2); margin-top:4px;" id="cmm-kpi-active-info">حسابات مطابقة لكشف الحسابات</div>
        </div>

      </div>

      <!-- Interactive Charts Container (Side by Side) -->
      <div style="display:grid; grid-template-columns: 2.2fr 1fr; gap:14px; margin-bottom:18px;" id="cmm-charts-grid">
        
        <!-- Main Line & Bar Trend Chart -->
        <div class="card" style="padding:18px 20px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft); display:flex; flex-direction:column; min-height:370px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
            <div>
              <h3 style="font-size:15px; font-weight:800; color:var(--text-0); margin:0; display:flex; align-items:center; gap:8px;">
                <span id="cmm-chart-title">📊 منحنى المبيعات والتحصيلات عبر أشهر السنة</span>
              </h3>
              <p style="font-size:11px; color:var(--text-2); margin:3px 0 0;" id="cmm-chart-subtitle">مقارنة بصرية ديناميكية بين مسحوبات المبيعات والتدفقات النقدية المحصلة</p>
            </div>
            <div style="display:flex; align-items:center; gap:14px; font-size:11.5px; font-weight:700;">
              <span style="display:inline-flex; align-items:center; gap:5px; color:#4F46E5;"><span style="width:12px; height:12px; border-radius:3px; background:#4F46E5; display:inline-block;"></span> 🧾 مبيعات</span>
              <span style="display:inline-flex; align-items:center; gap:5px; color:#10B981;"><span style="width:12px; height:12px; border-radius:3px; background:#10B981; display:inline-block;"></span> 📥 تحصيلات</span>
              <span style="display:inline-flex; align-items:center; gap:5px; color:#EF4444;"><span style="width:12px; height:12px; border-radius:3px; background:#EF4444; display:inline-block;"></span> ↩️ مردودات</span>
            </div>
          </div>
          <div style="flex:1; position:relative; min-height:280px; width:100%;">
            <canvas id="cmm-trend-canvas"></canvas>
          </div>
        </div>

        <!-- Secondary Performance Breakdown Donut Chart -->
        <div class="card" style="padding:18px 20px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft); display:flex; flex-direction:column; min-height:370px;">
          <div style="margin-bottom:12px;">
            <h3 style="font-size:15px; font-weight:800; color:var(--text-0); margin:0;">
              🥧 تحليل المساهمات والحصص
            </h3>
            <p style="font-size:11px; color:var(--text-2); margin:3px 0 0;" id="cmm-donut-subtitle">أعلى المساهمات الإجمالية</p>
          </div>
          <div style="flex:1; position:relative; min-height:220px; display:flex; align-items:center; justify-content:center;">
            <canvas id="cmm-donut-canvas"></canvas>
          </div>
          <div id="cmm-donut-legend" style="margin-top:10px; font-size:11px; color:var(--text-2); display:flex; flex-direction:column; gap:4px;"></div>
        </div>

      </div>

      <!-- Explanatory Guide & Key Legend Strip -->
      <div class="card mb-12" style="padding:10px 18px; background:linear-gradient(135deg, var(--bg-card), rgba(99,102,241,0.03)); border:1px solid var(--border-soft); border-radius:12px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; font-size:11.5px;">
        <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
          <span style="font-weight:800; color:var(--brand);">💡 دليل قراءة الخلايا:</span>
          <span style="display:inline-flex; align-items:center; gap:5px;"><b style="color:var(--text-0);">السطر العلوي:</b> 🧾 قيمة فواتير المبيعات الصادرة في الشهر</span>
          <span style="display:inline-flex; align-items:center; gap:5px;"><b style="color:#10B981;">السطر السفلي:</b> 📥 المبالغ المحصلة والمقبوضة فعلياً في الشهر</span>
          <span style="display:inline-flex; align-items:center; gap:5px;"><b style="color:var(--indigo);">⚖️ رصيد كشف الحساب:</b> ناتج (إجمالي المبيعات التاريخية - المردودات - إجمالي التحصيلات)</span>
        </div>
        <div style="font-weight:700; color:var(--text-2);" id="cmm-table-rows-count">
          عرض 0 عميل
        </div>
      </div>

      <!-- Customer Monthly Matrix Table -->
      <div class="card" style="border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft); overflow:hidden;">
        <div class="table-container" style="max-height:720px; overflow:auto;">
          <table class="data-dense" id="cmm-matrix-table" style="width:100%; border-collapse:collapse; min-width:1380px;">
            <thead style="position:sticky; top:0; z-index:10; background:var(--bg-1);">
              <tr>
                <th style="min-width:220px; position:sticky; right:0; z-index:11; background:var(--bg-1); box-shadow:-2px 0 6px rgba(0,0,0,0.06); padding:10px 12px;">
                  العميل / المندوب / المسار
                </th>
                <th style="min-width:125px; text-align:left; background:rgba(99,102,241,0.04);">
                  <div>⚖️ رصيد كشف الحساب</div>
                  <div style="font-size:9.5px; font-weight:normal; color:var(--text-2);">(الصافي الفعلي التراكمي)</div>
                </th>
                ${O.map(t=>`<th style="min-width:100px; text-align:center;">${t}</th>`).join("")}
                <th style="min-width:115px; text-align:left; background:rgba(99,102,241,0.08); color:var(--indigo);">مبيعات ${g}</th>
                <th style="min-width:115px; text-align:left; background:rgba(16,185,129,0.08); color:#10B981;">تحصيلات ${g}</th>
                <th style="width:85px; text-align:center;">التغطية %</th>
                <th style="width:95px; text-align:center;">الاتجاه</th>
                <th style="width:80px; text-align:center;" class="no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody id="cmm-tbody">
              <tr>
                <td colspan="19" style="text-align:center; padding:50px; color:var(--text-2);">
                  <div class="loading-spinner" style="margin-bottom:8px;"></div>
                  <div>جاري تجميع مصفوفة الشهور والتحليلات البيعية وحساب الأرصدة الفعلية...</div>
                </td>
              </tr>
            </tbody>
            <tfoot id="cmm-tfoot" style="position:sticky; bottom:0; z-index:10; background:var(--bg-2); font-weight:900; border-top:2px solid var(--border);">
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  `,await et(),await loadCmmData()}async function et(){window.onCmmYearChange=n=>{g=parseInt(n,10),v=null,T()},window.onCmmRepChange=n=>{M=n,T()},window.onCmmZoneChange=n=>{H=n,T()},window.onCmmMetricChange=n=>{S=n,B()},window.onCmmSearchInput=U(n=>{k=(n||"").trim().toLowerCase(),B()},200),window.focusCmmCustomer=n=>{v=n,W(),P(),V(),B()},window.resetCmmCustomerFocus=()=>{v=null,W(),P(),V(),B()},window.openCmmCustomerStatement=()=>{v&&typeof window.navigate=="function"&&(window._preselectedStatementEntity={type:"customer",id:v},window.navigate("report-customer-statement"))},window.exportCmmExcel=()=>{if(!h.length)return;const n=[],i=["كود العميل","اسم العميل","المنطقة","المندوب","رصيد كشف الحساب الفعلي",...O,`إجمالي مبيعات ${g}`,`إجمالي تحصيلات ${g}`,"نسبة التحصيل %","اتجاه النمو"];h.forEach(t=>{const l=[t.customer.code||"",t.customer.name||"",t.customer.zone||"",t.customer.repName||"",t.actualStatementBalance,...t.monthlySales.map(a=>a.sales),t.totalSales,t.totalCollections,t.collectionRate.toFixed(1)+"%",t.trendLabel];n.push(l)}),window.exportXLSX({filename:`مصفوفة_مبيعات_العملاء_${g}_${tt()}`,headers:i,rows:n,sheetName:`مبيعات_${g}`})},window.printCmmReport=()=>{window.print()}}window.loadCmmData=async function(){const i=document.getElementById("cmm-tbody");i&&(i.innerHTML='<tr><td colspan="19" style="text-align:center; padding:50px; color:var(--text-2);"><div class="loading-spinner" style="margin-bottom:8px;"></div><div>جاري جلب البيانات وحساب الأرصدة من كشوف الحسابات...</div></td></tr>');try{const[t,l,a,d,c,r]=await Promise.all([$(z.customers(),[K("name")]).catch(()=>[]),$(z.salesReps(),[K("name")]).catch(()=>[]),$(z.salesInvoices()).catch(()=>[]),$(z.salesReturns()).catch(()=>[]),$(z.collections()).catch(()=>[]),$(z.receipts()).catch(()=>[])]);G=t||[],Y=l||[],X=(a||[]).filter(o=>o.status!=="cancelled"),q=(d||[]).filter(o=>o.status!=="cancelled"&&o.status!=="void"),N=c||[],j=(r||[]).filter(o=>o.status!=="cancelled"&&(!o.entityType||o.entityType==="customer")),ot(),T()}catch(t){console.error("[CustomerMatrix] Data load error:",t),i&&(i.innerHTML=`<tr><td colspan="19" style="text-align:center; color:var(--bad); padding:30px;">فشل تحميل البيانات: ${t.message}</td></tr>`)}};function ot(){const n=document.getElementById("cmm-rep-select");if(n){const t=n.value;n.innerHTML='<option value="all">كل المناديب (مجمع)</option>'+Y.map(l=>`<option value="${l.id}">${l.name}</option>`).join(""),t&&(n.value=t)}const i=document.getElementById("cmm-zone-select");if(i){const t=new Set;G.forEach(a=>{a.zone&&a.zone.trim()&&t.add(a.zone.trim())});const l=Array.from(t).sort();i.innerHTML='<option value="all">كل المناطق</option>'+l.map(a=>`<option value="${a}">${a}</option>`).join("")}}function T(){const n=String(g);h=G.filter(t=>{if(M!=="all"&&t.repId!==M){const l=Y.find(a=>a.id===M);if(!l||t.repName!==l.name)return!1}return!(H!=="all"&&t.zone!==H)}).map(t=>{const l=Array(12).fill(0).map(()=>({sales:0,returns:0,netSales:0,collections:0}));let a=0,d=0,c=0,r=0,o=0;const s=(t.name||"").trim().toLowerCase();X.forEach(e=>{if(!(e.customerId===t.id||e.customerName&&e.customerName.trim().toLowerCase()===s))return;const C=parseFloat(e.totalWithVat||e.total||0);a+=C;const w=e.date||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:"");if(w.startsWith(n)){const u=parseInt(w.slice(5,7),10)-1;u>=0&&u<12&&(l[u].sales+=C)}e.paidAmount>0&&(j.some(y=>(y.date||(y.createdAt?.toDate?y.createdAt.toDate().toISOString().split("T")[0]:""))===w&&(y.targetId===t.id||y.customerName&&y.customerName.trim().toLowerCase()===s)&&Math.abs((y.amount||0)-e.paidAmount)<.01)||N.some(y=>(y.date||(y.createdAt?.toDate?y.createdAt.toDate().toISOString().split("T")[0]:""))===w&&(y.customerId===t.id||y.customerName&&y.customerName.trim().toLowerCase()===s)&&Math.abs((y.amount||0)-e.paidAmount)<.01)||(o+=parseFloat(e.paidAmount||0)))}),q.forEach(e=>{if(!(e.customerId===t.id||e.customerName&&e.customerName.trim().toLowerCase()===s))return;const C=parseFloat(e.totalWithVat!==void 0?e.totalWithVat:e.total||0);d+=C;const w=e.date||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:"");if(w.startsWith(n)){const u=parseInt(w.slice(5,7),10)-1;u>=0&&u<12&&(l[u].returns+=C)}}),N.forEach(e=>{if(!(e.customerId===t.id||e.customerName&&e.customerName.trim().toLowerCase()===s))return;const C=parseFloat(e.amount||0);c+=C;const w=e.date||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:"");if(w.startsWith(n)){const u=parseInt(w.slice(5,7),10)-1;u>=0&&u<12&&(l[u].collections+=C)}}),j.forEach(e=>{if(!(e.targetId===t.id||e.customerId===t.id||e.customerName&&e.customerName.trim().toLowerCase()===s))return;const C=parseFloat(e.amount||0);r+=C;const w=e.date||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:"");if(w.startsWith(n)){const u=parseInt(w.slice(5,7),10)-1;u>=0&&u<12&&(l[u].collections+=C)}});const p=parseFloat(t.openingBalance||0),m=Math.round((p+a-d-c-r-o)*100)/100;l.forEach(e=>{e.netSales=Math.max(0,e.sales-e.returns)});const f=l.reduce((e,b)=>e+b.sales,0),A=l.reduce((e,b)=>e+b.returns,0),E=l.reduce((e,b)=>e+b.netSales,0),D=l.reduce((e,b)=>e+b.collections,0),Q=f>0?D/f*100:D>0?100:0,L=l.slice(0,6).reduce((e,b)=>e+b.sales,0),Z=l.slice(6,12).reduce((e,b)=>e+b.sales,0);let I="🟢 مستقر",F="good";return f>0?Z>L*1.15?(I="📈 صاعد",F="indigo"):Z<L*.7&&L>0&&(I="📉 متراجع",F="bad"):(I="⚪ غير نشط",F="neutral"),{customer:t,monthlySales:l,totalSales:f,totalReturns:A,totalNetSales:E,totalCollections:D,collectionRate:Q,trendLabel:I,trendClass:F,actualStatementBalance:m}}),h.sort((t,l)=>l.totalSales-t.totalSales),at(),W(),P(),V(),B()}function at(){const n=v?h.filter(o=>o.customer.id===v):h,i=n.reduce((o,s)=>o+s.totalSales,0),t=n.reduce((o,s)=>o+s.totalCollections,0),l=i-t,a=i>0?t/i*100:t>0?100:0,d=n.reduce((o,s)=>o+s.actualStatementBalance,0);document.getElementById("cmm-kpi-sales").textContent=x(i),document.getElementById("cmm-kpi-sales-avg").textContent=`متوسط شهري: ${x(i/12)}`,document.getElementById("cmm-kpi-collections").textContent=x(t),document.getElementById("cmm-kpi-col-avg").textContent=`متوسط شهري: ${x(t/12)}`;const c=document.getElementById("cmm-kpi-rate");c.textContent=`${a.toFixed(1)}%`,c.style.color=a>=90?"#10B981":a>=70?"#F59E0B":"#EF4444",document.getElementById("cmm-kpi-gap").textContent=`فجوة التحصيل: ${x(l)}`;const r=document.getElementById("cmm-kpi-total-balance");r.textContent=x(d),r.style.color=d>0?"#EF4444":d<0?"#10B981":"#8B5CF6"}function W(){const n=document.getElementById("cmm-focus-banner");if(n){if(v){const i=h.find(t=>t.customer.id===v);if(i){const t=i.customer;document.getElementById("cmm-focus-name").textContent=`${t.name}`,document.getElementById("cmm-focus-details").textContent=`كود: ${t.code||"—"} | المندوب: ${t.repName||"—"} | المنطقة: ${t.zone||"—"} | رصيد كشف الحساب الفعلي الصافي: ${x(i.actualStatementBalance)}`,n.style.display="block",document.getElementById("cmm-chart-title").textContent=`👤 منحنى أداء العميل: ${t.name} (${g})`,document.getElementById("cmm-chart-subtitle").textContent="تحليل تفصيلي لمشتريات وتحصيلات العميل على مدار أشهر السنة";return}}n.style.display="none",document.getElementById("cmm-chart-title").textContent=`📊 منحنى المبيعات والتحصيلات المجمعة لسنة ${g}`,document.getElementById("cmm-chart-subtitle").textContent="مقارنة بصرية ديناميكية بين مسحوبات المبيعات والتدفقات النقدية المحصلة"}}function P(){const n=document.getElementById("cmm-trend-canvas");if(!n||typeof Chart>"u")return;const i=Array(12).fill(0),t=Array(12).fill(0),l=Array(12).fill(0);(v?h.filter(o=>o.customer.id===v):h).forEach(o=>{o.monthlySales.forEach((s,p)=>{i[p]+=s.sales,t[p]+=s.collections,l[p]+=s.returns})}),R&&R.destroy();const d=n.getContext("2d"),c=d.createLinearGradient(0,0,0,320);c.addColorStop(0,"rgba(79, 70, 229, 0.40)"),c.addColorStop(1,"rgba(79, 70, 229, 0.0)");const r=d.createLinearGradient(0,0,0,320);r.addColorStop(0,"rgba(16, 185, 129, 0.30)"),r.addColorStop(1,"rgba(16, 185, 129, 0.0)"),R=new Chart(n,{type:"line",data:{labels:O,datasets:[{label:"المبيعات (ر.س)",data:i,borderColor:"#4F46E5",backgroundColor:c,borderWidth:3.5,tension:.38,pointRadius:5.5,pointHoverRadius:9,pointBackgroundColor:"#4F46E5",pointBorderColor:"#FFFFFF",pointBorderWidth:2.5,fill:!0},{label:"التحصيلات (ر.س)",data:t,borderColor:"#10B981",backgroundColor:r,borderWidth:3.5,borderDash:[6,4],tension:.38,pointRadius:5.5,pointHoverRadius:9,pointBackgroundColor:"#10B981",pointBorderColor:"#FFFFFF",pointBorderWidth:2.5,fill:!0},{label:"المردودات (ر.س)",data:l,borderColor:"#EF4444",backgroundColor:"rgba(239, 68, 68, 0.1)",borderWidth:2,borderDash:[2,2],tension:.3,pointRadius:4,pointBackgroundColor:"#EF4444",fill:!1}]},options:{responsive:!0,maintainAspectRatio:!1,interaction:{mode:"index",intersect:!1},plugins:{legend:{display:!1},tooltip:{backgroundColor:"rgba(15, 23, 42, 0.95)",titleFont:{family:"IBM Plex Sans Arabic",size:13,weight:"bold"},bodyFont:{family:"IBM Plex Mono",size:12.5},padding:14,cornerRadius:10,borderColor:"rgba(255, 255, 255, 0.12)",borderWidth:1,callbacks:{label:function(o){const s=o.raw||0;return`  ${o.dataset.label}: ${x(s)}`},afterBody:function(o){const s=o[0]?.raw||0,p=o[1]?.raw||0,m=s-p;return`  ⚖️ فجوة الشهر: ${x(m)}`}}}},scales:{x:{grid:{color:"rgba(150, 150, 150, 0.08)"},ticks:{font:{family:"IBM Plex Sans Arabic",size:11.5,weight:"600"},color:"var(--text-2)"}},y:{grid:{color:"rgba(150, 150, 150, 0.08)"},ticks:{font:{family:"IBM Plex Mono",size:11},color:"var(--text-2)",callback:o=>o>=1e3?`${(o/1e3).toFixed(0)}k`:o}}}}})}function V(){const n=document.getElementById("cmm-donut-canvas");if(!n||typeof Chart>"u")return;_&&_.destroy();const i=document.getElementById("cmm-donut-legend"),t=document.getElementById("cmm-donut-subtitle");let l=[],a=[];const d=["#4F46E5","#10B981","#F59E0B","#EC4899","#8B5CF6","#06B6D4","#64748B"];if(v){const r=h.find(o=>o.customer.id===v);r&&(t&&(t.textContent=`هيكل حساب ${r.customer.name}`),l=["صافي المبيعات","التحصيلات","المردودات"],a=[r.totalNetSales,r.totalCollections,r.totalReturns])}else{t&&(t.textContent=`أعلى 5 مساهمات في مبيعات ${g}`);const r=h.slice(0,5);l=r.map(s=>s.customer.name),a=r.map(s=>s.totalSales);const o=h.slice(5).reduce((s,p)=>s+p.totalSales,0);o>0&&(l.push("باقي العملاء"),a.push(o))}const c=a.reduce((r,o)=>r+o,0);_=new Chart(n,{type:"doughnut",data:{labels:l,datasets:[{data:a,backgroundColor:d.slice(0,l.length),borderWidth:2,borderColor:"var(--bg-card)"}]},options:{responsive:!0,maintainAspectRatio:!1,cutout:"68%",plugins:{legend:{display:!1},tooltip:{callbacks:{label:r=>{const o=r.raw||0,s=c>0?(o/c*100).toFixed(1):"0";return` ${r.label}: ${x(o)} (${s}%)`}}}}}}),i&&(i.innerHTML=l.map((r,o)=>{const s=a[o]||0,p=c>0?(s/c*100).toFixed(1):"0";return`
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="display:inline-flex; align-items:center; gap:6px;">
            <span style="width:8px; height:8px; border-radius:50%; background:${d[o]}; display:inline-block;"></span>
            <span style="max-width:130px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r}</span>
          </span>
          <span class="mono font-bold" style="font-size:11px;">${p}%</span>
        </div>
      `}).join(""))}function B(){const n=document.getElementById("cmm-tbody"),i=document.getElementById("cmm-tfoot");if(!n)return;let t=h;if(k&&(t=t.filter(a=>(a.customer.name||"").toLowerCase().includes(k)||(a.customer.code||"").toLowerCase().includes(k)||(a.customer.phone||"").includes(k)||(a.customer.repName||"").toLowerCase().includes(k))),document.getElementById("cmm-table-rows-count").textContent=`عرض ${t.length} من أصل ${h.length} عميل`,!t.length){n.innerHTML='<tr><td colspan="19" style="text-align:center; padding:40px; color:var(--text-2);">لا توجد سجلات تطابق الفلتر والبحث الحالي</td></tr>',i&&(i.innerHTML="");return}let l=1;if(t.forEach(a=>{a.monthlySales.forEach(d=>{const c=S==="collections"?d.collections:S==="net_sales"?d.netSales:d.sales;c>l&&(l=c)})}),n.innerHTML=t.map(a=>{const d=a.customer,c=v===d.id,r=a.monthlySales.map(m=>{const f=S==="collections"?m.collections:S==="net_sales"?m.netSales:m.sales,A=f>0?Math.min(.28,Math.max(.04,f/l*.35)):0,E=f>0?`background: rgba(79, 70, 229, ${A});`:"";return S==="both"?`
          <td style="${E} text-align:center; padding:6px 6px; border-left:1px solid var(--border-soft); font-size:11px;">
            ${m.sales>0?`
              <div style="display:flex; justify-content:space-between; align-items:center; gap:2px;">
                <span style="font-size:9.5px; color:var(--text-2);">🧾</span>
                <span class="mono font-bold" style="color:var(--text-0);">${x(m.sales)}</span>
              </div>
            `:'<div style="color:var(--text-3); font-size:10px;">—</div>'}
            ${m.collections>0?`
              <div style="display:flex; justify-content:space-between; align-items:center; gap:2px; margin-top:2px;">
                <span style="font-size:9.5px; color:#10B981;">📥</span>
                <span class="mono font-bold" style="color:#10B981;">${x(m.collections)}</span>
              </div>
            `:""}
          </td>
        `:`
        <td style="${E} text-align:center; padding:8px 4px; border-left:1px solid var(--border-soft);">
          <span class="mono ${f>0?"font-bold":"dim"}" style="font-size:11.5px; color:${f>0?"var(--text-0)":"var(--text-3)"};">
            ${f>0?x(f):"—"}
          </span>
        </td>
      `}).join(""),o=a.actualStatementBalance,s=o>0,p=o<0;return`
      <tr onclick="window.focusCmmCustomer('${d.id}')"
          style="cursor:pointer; transition:background 0.15s; ${c?"background:rgba(99,102,241,0.14) !important; outline:2px solid var(--brand);":""}"
          class="cmm-row ${c?"active":""}">
        
        <!-- Sticky Customer Column -->
        <td style="position:sticky; right:0; z-index:5; background:var(--bg-card); box-shadow:-2px 0 6px rgba(0,0,0,0.06); padding:8px 12px;">
          <div style="font-weight:800; font-size:12.5px; color:${c?"var(--brand)":"var(--text-0)"};">${d.name}</div>
          <div style="font-size:10.5px; color:var(--text-2); margin-top:2px; display:flex; gap:6px; align-items:center;">
            <span>${d.code?`[${d.code}]`:""}</span>
            <span>👔 ${d.repName||"—"}</span>
            <span>📍 ${d.zone||"—"}</span>
          </div>
        </td>

        <!-- Exact Statement Balance (Calculated Dynamically) -->
        <td style="text-align:left; font-size:11.5px; background:rgba(99,102,241,0.03);">
          <span class="mono font-bold" style="color:${s?"var(--bad)":p?"#10B981":"var(--text-2)"}; font-size:12px;">
            ${s?x(o):p?`(${x(Math.abs(o))}) دائن`:"0.00"}
          </span>
        </td>

        <!-- 12 Month Cells -->
        ${r}

        <!-- Total Sales of Year -->
        <td class="mono font-bold" style="text-align:left; color:var(--indigo); background:rgba(99,102,241,0.04); font-size:12px;">
          ${x(a.totalSales)}
        </td>

        <!-- Total Collections of Year -->
        <td class="mono font-bold" style="text-align:left; color:#10B981; background:rgba(16,185,129,0.04); font-size:12px;">
          ${x(a.totalCollections)}
        </td>

        <!-- Collection Coverage Rate % -->
        <td style="text-align:center;">
          <span class="badge ${a.collectionRate>=95?"good":a.collectionRate>=70?"warn":"bad"}" style="font-size:10px; font-weight:800; padding:2px 6px;">
            ${a.collectionRate.toFixed(0)}%
          </span>
        </td>

        <!-- Growth Trend -->
        <td style="text-align:center;">
          <span class="badge ${a.trendClass}" style="font-size:10.5px; font-weight:700;">
            ${a.trendLabel}
          </span>
        </td>

        <!-- Actions -->
        <td style="text-align:center;" class="no-print" onclick="event.stopPropagation();">
          <button class="btn btn-icon sm btn-ghost" title="كشف الحساب التفصيلي" onclick="window.focusCmmCustomer('${d.id}'); window.openCmmCustomerStatement();">
            📊
          </button>
        </td>

      </tr>
    `}).join(""),i){const a=Array(12).fill(0),d=Array(12).fill(0);t.forEach(p=>{p.monthlySales.forEach((m,f)=>{a[f]+=S==="collections"?m.collections:S==="net_sales"?m.netSales:m.sales,d[f]+=m.collections})});const c=t.reduce((p,m)=>p+m.totalSales,0),r=t.reduce((p,m)=>p+m.totalCollections,0),o=c>0?r/c*100:0,s=t.reduce((p,m)=>p+m.actualStatementBalance,0);i.innerHTML=`
      <tr>
        <td style="position:sticky; right:0; z-index:11; background:var(--bg-2); padding:10px 12px; font-size:12px; color:var(--text-0);">
          الإجمالي العام (${t.length} عميل)
        </td>
        <td class="mono font-bold" style="text-align:left; font-size:12px; color:${s>0?"var(--bad)":"var(--text-0)"};">
          ${x(s)}
        </td>
        ${a.map(p=>`
          <td class="mono font-bold" style="text-align:center; font-size:11.5px; color:var(--text-0); padding:8px 4px;">
            ${p>0?x(p):"0.00"}
          </td>
        `).join("")}
        <td class="mono font-bold" style="text-align:left; color:var(--indigo); font-size:12.5px;">
          ${x(c)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:#10B981; font-size:12.5px;">
          ${x(r)}
        </td>
        <td style="text-align:center; font-size:11.5px; color:var(--text-0);">
          ${o.toFixed(0)}%
        </td>
        <td colspan="2"></td>
      </tr>
    `}}export{ct as render};
