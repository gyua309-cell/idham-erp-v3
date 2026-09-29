import{q as N,t as P,f as g,g as C,a as S}from"./index-C8cvrlnW.js";import{orderBy as D}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";const R=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];let _=[],A=[],L=[],j=[],H=[],W=[],v=new Date().getFullYear(),$="all",I="all",h="both",w="",b=null,B=null,E=null,y=[];async function J(n,s){v=new Date().getFullYear(),b=null,w="",n.innerHTML=`
    <!-- Top Filter Bar -->
    <div class="filterbar no-print" style="flex-wrap:wrap; gap:10px; align-items:flex-end; background:var(--bg-1); padding:14px 18px; border-radius:14px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); margin-bottom:16px;">
      
      <!-- Year Selector -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">📅 السنة المالية</label>
        <select id="cmm-year-select" onchange="window.onCmmYearChange(this.value)" style="min-width:110px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12.5px; font-weight:700;">
          <option value="2026" ${v===2026?"selected":""}>2026</option>
          <option value="2025" ${v===2025?"selected":""}>2025</option>
          <option value="2024" ${v===2024?"selected":""}>2024</option>
          <option value="2023" ${v===2023?"selected":""}>2023</option>
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
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">👁️ نوع العرض في الجدول</label>
        <select id="cmm-metric-select" onchange="window.onCmmMetricChange(this.value)" style="min-width:190px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px; font-weight:700;">
          <option value="both" selected>المبيعات والتحصيلات معاً</option>
          <option value="sales">المبيعات فقط (Sales)</option>
          <option value="collections">التحصيلات فقط (Collections)</option>
          <option value="net_sales">صافي المبيعات (بعد المردودات)</option>
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
      <div id="cmm-focus-banner" class="card mb-16" style="display:none; padding:12px 18px; background:linear-gradient(135deg, rgba(99,102,241,0.12), rgba(16,185,129,0.08)); border:1.5px solid var(--brand); border-radius:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:24px;">👤</span>
            <div>
              <div style="font-size:15px; font-weight:900; color:var(--brand);" id="cmm-focus-name">اسم العميل</div>
              <div style="font-size:11.5px; color:var(--text-2);" id="cmm-focus-details">كود العميل | المندوب | الرصيد الحالي</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button class="btn btn-secondary btn-sm" id="cmm-focus-stmt-btn" onclick="window.openCmmCustomerStatement()">📊 كشف الحساب التفصيلي</button>
            <button class="btn btn-primary btn-sm" onclick="window.resetCmmCustomerFocus()" style="background:#4F46E5; border-color:#4F46E5;">🔙 عرض كل العملاء (مجمع)</button>
          </div>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:16px;" id="cmm-kpi-cards">
        
        <div class="card" style="padding:14px 18px; background:linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02)); border:1px solid rgba(99,102,241,0.25); border-radius:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:700; color:var(--indigo);">💳 إجمالي المبيعات السنوية</span>
            <span style="font-size:18px;">📈</span>
          </div>
          <div class="mono font-bold" id="cmm-kpi-sales" style="font-size:20px; color:var(--indigo); margin-top:6px;">0.00 ر.س</div>
          <div style="font-size:11px; color:var(--text-2); margin-top:4px;" id="cmm-kpi-sales-avg">متوسط شهري: 0.00 ر.س</div>
        </div>

        <div class="card" style="padding:14px 18px; background:linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02)); border:1px solid rgba(16,185,129,0.25); border-radius:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:700; color:#10B981;">💵 إجمالي التحصيلات السنوية</span>
            <span style="font-size:18px;">📥</span>
          </div>
          <div class="mono font-bold" id="cmm-kpi-collections" style="font-size:20px; color:#10B981; margin-top:6px;">0.00 ر.س</div>
          <div style="font-size:11px; color:var(--text-2); margin-top:4px;" id="cmm-kpi-col-avg">متوسط شهري: 0.00 ر.س</div>
        </div>

        <div class="card" style="padding:14px 18px; background:linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02)); border:1px solid rgba(245,158,11,0.25); border-radius:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:700; color:#F59E0B;">🎯 نسبة كفاءة التحصيل</span>
            <span style="font-size:18px;">⚖️</span>
          </div>
          <div class="mono font-bold" id="cmm-kpi-rate" style="font-size:20px; color:#F59E0B; margin-top:6px;">0.0%</div>
          <div style="font-size:11px; color:var(--text-2); margin-top:4px;" id="cmm-kpi-gap">الفجوة: 0.00 ر.س</div>
        </div>

        <div class="card" style="padding:14px 18px; background:linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.02)); border:1px solid rgba(139,92,246,0.25); border-radius:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:700; color:#8B5CF6;">👥 العملاء المشمولين</span>
            <span style="font-size:18px;">🏢</span>
          </div>
          <div class="mono font-bold" id="cmm-kpi-cust-count" style="font-size:20px; color:#8B5CF6; margin-top:6px;">0 عميل</div>
          <div style="font-size:11px; color:var(--text-2); margin-top:4px;" id="cmm-kpi-active-info">النشطين خلال السنة: 0</div>
        </div>

      </div>

      <!-- Interactive Charts Container (Side by Side) -->
      <div style="display:grid; grid-template-columns: 2.2fr 1fr; gap:14px; margin-bottom:18px;" id="cmm-charts-grid">
        
        <!-- Main Line & Bar Trend Chart -->
        <div class="card" style="padding:18px 20px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft); display:flex; flex-direction:column; min-height:360px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
            <div>
              <h3 style="font-size:15px; font-weight:800; color:var(--text-0); margin:0; display:flex; align-items:center; gap:8px;">
                <span id="cmm-chart-title">📊 منحنى المبيعات والتحصيلات عبر أشهر السنة</span>
              </h3>
              <p style="font-size:11px; color:var(--text-2); margin:3px 0 0;" id="cmm-chart-subtitle">مقارنة بصرية ديناميكية بين مسحوبات المبيعات والتدفقات النقدية المحصلة</p>
            </div>
            <div style="display:flex; align-items:center; gap:12px; font-size:11.5px; font-weight:700;">
              <span style="display:inline-flex; align-items:center; gap:5px; color:#4F46E5;"><span style="width:10px; height:10px; border-radius:2px; background:#4F46E5; display:inline-block;"></span> مبيعات</span>
              <span style="display:inline-flex; align-items:center; gap:5px; color:#10B981;"><span style="width:10px; height:10px; border-radius:2px; background:#10B981; display:inline-block;"></span> تحصيلات</span>
              <span style="display:inline-flex; align-items:center; gap:5px; color:#EF4444;"><span style="width:10px; height:10px; border-radius:2px; background:#EF4444; display:inline-block;"></span> مردودات</span>
            </div>
          </div>
          <div style="flex:1; position:relative; min-height:270px; width:100%;">
            <canvas id="cmm-trend-canvas"></canvas>
          </div>
        </div>

        <!-- Secondary Performance Breakdown Donut Chart -->
        <div class="card" style="padding:18px 20px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft); display:flex; flex-direction:column; min-height:360px;">
          <div style="margin-bottom:12px;">
            <h3 style="font-size:15px; font-weight:800; color:var(--text-0); margin:0;">
              🥧 توزيع الحصص والأنشطة
            </h3>
            <p style="font-size:11px; color:var(--text-2); margin:3px 0 0;" id="cmm-donut-subtitle">أعلى المساهمات الإجمالية</p>
          </div>
          <div style="flex:1; position:relative; min-height:220px; display:flex; align-items:center; justify-content:center;">
            <canvas id="cmm-donut-canvas"></canvas>
          </div>
          <div id="cmm-donut-legend" style="margin-top:10px; font-size:11px; color:var(--text-2); display:flex; flex-direction:column; gap:4px;"></div>
        </div>

      </div>

      <!-- Customer Monthly Matrix Table -->
      <div class="card" style="border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft); overflow:hidden;">
        <div class="card-header" style="padding:14px 20px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <h3 style="font-size:15px; font-weight:800; color:var(--text-0); margin:0;">
              📋 مصفوفة المبيعات الشهرية للعملاء (Customer Monthly Matrix)
            </h3>
            <p style="font-size:11px; color:var(--text-2); margin:2px 0 0;">
              💡 انقر على أي صف عميل لتخصيص المنحنى البياني ومقارنته فوراً بمفرده
            </p>
          </div>
          <div style="font-size:12px; color:var(--text-2); font-weight:700;" id="cmm-table-rows-count">
            عرض 0 عميل
          </div>
        </div>

        <div class="table-container" style="max-height:680px; overflow:auto;">
          <table class="data-dense" id="cmm-matrix-table" style="width:100%; border-collapse:collapse; min-width:1300px;">
            <thead style="position:sticky; top:0; z-index:10; background:var(--bg-1);">
              <tr>
                <th style="min-width:210px; position:sticky; right:0; z-index:11; background:var(--bg-1); box-shadow:-2px 0 6px rgba(0,0,0,0.06);">العميل / المندوب</th>
                <th style="width:100px; text-align:left;">الرصيد الحالي</th>
                ${R.map(t=>`<th style="min-width:90px; text-align:center;">${t}</th>`).join("")}
                <th style="min-width:115px; text-align:left; background:rgba(99,102,241,0.08); color:var(--indigo);">إجمالي المبيعات</th>
                <th style="min-width:115px; text-align:left; background:rgba(16,185,129,0.08); color:#10B981;">إجمالي التحصيل</th>
                <th style="width:85px; text-align:center;">التغطية %</th>
                <th style="width:95px; text-align:center;">الاتجاه</th>
                <th style="width:80px; text-align:center;" class="no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody id="cmm-tbody">
              <tr>
                <td colspan="19" style="text-align:center; padding:50px; color:var(--text-2);">
                  <div class="loading-spinner" style="margin-bottom:8px;"></div>
                  <div>جاري تجميع مصفوفة الشهور والتحليلات البيعية...</div>
                </td>
              </tr>
            </tbody>
            <tfoot id="cmm-tfoot" style="position:sticky; bottom:0; z-index:10; background:var(--bg-2); font-weight:900; border-top:2px solid var(--border);">
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  `,await G(),await loadCmmData()}async function G(){window.onCmmYearChange=n=>{v=parseInt(n,10),b=null,z()},window.onCmmRepChange=n=>{$=n,z()},window.onCmmZoneChange=n=>{I=n,z()},window.onCmmMetricChange=n=>{h=n,k()},window.onCmmSearchInput=N(n=>{w=(n||"").trim().toLowerCase(),k()},200),window.focusCmmCustomer=n=>{b=n,F(),M(),T(),k()},window.resetCmmCustomerFocus=()=>{b=null,F(),M(),T(),k()},window.openCmmCustomerStatement=()=>{b&&typeof window.navigate=="function"&&(window._preselectedStatementEntity={type:"customer",id:b},window.navigate("report-customer-statement"))},window.exportCmmExcel=()=>{if(!y.length)return;const n=[],s=["كود العميل","اسم العميل","المنطقة","المندوب","الرصيد المدين الحالي",...R,"إجمالي المبيعات","إجمالي التحصيلات","نسبة التحصيل %","اتجاه النمو"];y.forEach(t=>{const i=[t.customer.code||"",t.customer.name||"",t.customer.zone||"",t.customer.repName||"",t.customer.balance||0,...t.monthlySales.map(e=>e.sales),t.totalSales,t.totalCollections,t.collectionRate.toFixed(1)+"%",t.trendLabel];n.push(i)}),window.exportXLSX({filename:`مصفوفة_مبيعات_العملاء_${v}_${P()}`,headers:s,rows:n,sheetName:`مبيعات_${v}`})},window.printCmmReport=()=>{window.print()}}window.loadCmmData=async function(){const s=document.getElementById("cmm-tbody");s&&(s.innerHTML='<tr><td colspan="19" style="text-align:center; padding:50px; color:var(--text-2);"><div class="loading-spinner" style="margin-bottom:8px;"></div><div>جاري جلب البيانات من السيرفر...</div></td></tr>');try{const[t,i,e,r,d,l]=await Promise.all([C(S.customers(),[D("name")]).catch(()=>[]),C(S.salesReps(),[D("name")]).catch(()=>[]),C(S.salesInvoices()).catch(()=>[]),C(S.salesReturns()).catch(()=>[]),C(S.collections()).catch(()=>[]),C(S.receipts()).catch(()=>[])]);_=t||[],A=i||[],L=(e||[]).filter(a=>a.status!=="cancelled"),j=(r||[]).filter(a=>a.status!=="cancelled"&&a.status!=="void"),H=d||[],W=(l||[]).filter(a=>a.status!=="cancelled"&&(!a.entityType||a.entityType==="customer")),O(),z()}catch(t){console.error("[CustomerMatrix] Data load error:",t),s&&(s.innerHTML=`<tr><td colspan="19" style="text-align:center; color:var(--bad); padding:30px;">فشل تحميل البيانات: ${t.message}</td></tr>`)}};function O(){const n=document.getElementById("cmm-rep-select");if(n){const t=n.value;n.innerHTML='<option value="all">كل المناديب (مجمع)</option>'+A.map(i=>`<option value="${i.id}">${i.name}</option>`).join(""),t&&(n.value=t)}const s=document.getElementById("cmm-zone-select");if(s){const t=new Set;_.forEach(e=>{e.zone&&e.zone.trim()&&t.add(e.zone.trim())});const i=Array.from(t).sort();s.innerHTML='<option value="all">كل المناطق</option>'+i.map(e=>`<option value="${e}">${e}</option>`).join("")}}function z(){const n=String(v);y=_.filter(t=>{if($!=="all"&&t.repId!==$){const i=A.find(e=>e.id===$);if(!i||t.repName!==i.name)return!1}return!(I!=="all"&&t.zone!==I)}).map(t=>{const i=Array(12).fill(0).map(()=>({sales:0,returns:0,netSales:0,collections:0}));L.forEach(o=>{if(o.customerId!==t.id&&o.customerName!==t.name)return;const c=o.date||(o.createdAt?.toDate?o.createdAt.toDate().toISOString().split("T")[0]:"");if(!c.startsWith(n))return;const f=parseInt(c.slice(5,7),10)-1;f>=0&&f<12&&(i[f].sales+=parseFloat(o.totalWithVat||o.total||0))}),j.forEach(o=>{if(o.customerId!==t.id&&o.customerName!==t.name)return;const c=o.date||(o.createdAt?.toDate?o.createdAt.toDate().toISOString().split("T")[0]:"");if(!c.startsWith(n))return;const f=parseInt(c.slice(5,7),10)-1;f>=0&&f<12&&(i[f].returns+=parseFloat(o.totalWithVat!==void 0?o.totalWithVat:o.total||0))}),H.forEach(o=>{if(o.customerId!==t.id&&o.customerName!==t.name)return;const c=o.date||(o.createdAt?.toDate?o.createdAt.toDate().toISOString().split("T")[0]:"");if(!c.startsWith(n))return;const f=parseInt(c.slice(5,7),10)-1;f>=0&&f<12&&(i[f].collections+=parseFloat(o.amount||0))}),W.forEach(o=>{if(o.targetId!==t.id&&o.customerId!==t.id&&o.customerName!==t.name)return;const c=o.date||(o.createdAt?.toDate?o.createdAt.toDate().toISOString().split("T")[0]:"");if(!c.startsWith(n))return;const f=parseInt(c.slice(5,7),10)-1;f>=0&&f<12&&(i[f].collections+=parseFloat(o.amount||0))}),i.forEach(o=>{o.netSales=Math.max(0,o.sales-o.returns)});const e=i.reduce((o,c)=>o+c.sales,0),r=i.reduce((o,c)=>o+c.returns,0),d=i.reduce((o,c)=>o+c.netSales,0),l=i.reduce((o,c)=>o+c.collections,0),a=e>0?l/e*100:l>0?100:0,p=i.slice(0,6).reduce((o,c)=>o+c.sales,0),m=i.slice(6,12).reduce((o,c)=>o+c.sales,0);let x="🟢 مستقر",u="good";return e>0?m>p*1.15?(x="📈 صاعد",u="indigo"):m<p*.7&&p>0&&(x="📉 متراجع",u="bad"):(x="⚪ غير نشط",u="neutral"),{customer:t,monthlySales:i,totalSales:e,totalReturns:r,totalNetSales:d,totalCollections:l,collectionRate:a,trendLabel:x,trendClass:u}}),y.sort((t,i)=>i.totalSales-t.totalSales),V(),F(),M(),T(),k()}function V(){const n=b?y.filter(l=>l.customer.id===b):y,s=n.reduce((l,a)=>l+a.totalSales,0),t=n.reduce((l,a)=>l+a.totalCollections,0),i=s-t,e=s>0?t/s*100:t>0?100:0,r=n.filter(l=>l.totalSales>0).length;document.getElementById("cmm-kpi-sales").textContent=g(s),document.getElementById("cmm-kpi-sales-avg").textContent=`متوسط شهري: ${g(s/12)}`,document.getElementById("cmm-kpi-collections").textContent=g(t),document.getElementById("cmm-kpi-col-avg").textContent=`متوسط شهري: ${g(t/12)}`;const d=document.getElementById("cmm-kpi-rate");d.textContent=`${e.toFixed(1)}%`,d.style.color=e>=90?"#10B981":e>=70?"#F59E0B":"#EF4444",document.getElementById("cmm-kpi-gap").textContent=`الفجوة: ${g(i)}`,document.getElementById("cmm-kpi-cust-count").textContent=`${n.length} عميل`,document.getElementById("cmm-kpi-active-info").textContent=`المشترين في ${v}: ${r} عميل`}function F(){const n=document.getElementById("cmm-focus-banner");if(n){if(b){const s=y.find(t=>t.customer.id===b);if(s){const t=s.customer;document.getElementById("cmm-focus-name").textContent=`${t.name}`,document.getElementById("cmm-focus-details").textContent=`كود: ${t.code||"—"} | المندوب: ${t.repName||"—"} | المنطقة: ${t.zone||"—"} | الرصيد الحالي: ${g(t.balance||0)}`,n.style.display="block",document.getElementById("cmm-chart-title").textContent=`👤 منحنى أداء العميل: ${t.name} (${v})`,document.getElementById("cmm-chart-subtitle").textContent="تحليل تفصيلي لمشتريات وتحصيلات العميل على مدار أشهر السنة";return}}n.style.display="none",document.getElementById("cmm-chart-title").textContent=`📊 منحنى المبيعات والتحصيلات المجمعة لسنة ${v}`,document.getElementById("cmm-chart-subtitle").textContent="مقارنة بصرية ديناميكية بين مسحوبات المبيعات والتدفقات النقدية المحصلة"}}function M(){const n=document.getElementById("cmm-trend-canvas");if(!n||typeof Chart>"u")return;const s=Array(12).fill(0),t=Array(12).fill(0),i=Array(12).fill(0);(b?y.filter(a=>a.customer.id===b):y).forEach(a=>{a.monthlySales.forEach((p,m)=>{s[m]+=p.sales,t[m]+=p.collections,i[m]+=p.returns})}),B&&B.destroy();const r=n.getContext("2d"),d=r.createLinearGradient(0,0,0,300);d.addColorStop(0,"rgba(79, 70, 229, 0.35)"),d.addColorStop(1,"rgba(79, 70, 229, 0.0)");const l=r.createLinearGradient(0,0,0,300);l.addColorStop(0,"rgba(16, 185, 129, 0.25)"),l.addColorStop(1,"rgba(16, 185, 129, 0.0)"),B=new Chart(n,{type:"line",data:{labels:R,datasets:[{label:"المبيعات (ر.س)",data:s,borderColor:"#4F46E5",backgroundColor:d,borderWidth:3,tension:.38,pointRadius:5,pointHoverRadius:8,pointBackgroundColor:"#4F46E5",pointBorderColor:"#FFFFFF",pointBorderWidth:2,fill:!0},{label:"التحصيلات (ر.س)",data:t,borderColor:"#10B981",backgroundColor:l,borderWidth:3,borderDash:[5,4],tension:.38,pointRadius:5,pointHoverRadius:8,pointBackgroundColor:"#10B981",pointBorderColor:"#FFFFFF",pointBorderWidth:2,fill:!0},{label:"المردودات (ر.س)",data:i,borderColor:"#EF4444",backgroundColor:"rgba(239, 68, 68, 0.1)",borderWidth:1.5,borderDash:[2,2],tension:.3,pointRadius:3,pointBackgroundColor:"#EF4444",fill:!1}]},options:{responsive:!0,maintainAspectRatio:!1,interaction:{mode:"index",intersect:!1},plugins:{legend:{display:!1},tooltip:{backgroundColor:"rgba(15, 23, 42, 0.95)",titleFont:{family:"IBM Plex Sans Arabic",size:13,weight:"bold"},bodyFont:{family:"IBM Plex Mono",size:13},padding:14,cornerRadius:10,borderColor:"rgba(255, 255, 255, 0.1)",borderWidth:1,callbacks:{label:function(a){const p=a.raw||0;return`  ${a.dataset.label}: ${g(p)}`}}}},scales:{x:{grid:{color:"rgba(150, 150, 150, 0.08)"},ticks:{font:{family:"IBM Plex Sans Arabic",size:11,weight:"600"},color:"var(--text-2)"}},y:{grid:{color:"rgba(150, 150, 150, 0.08)"},ticks:{font:{family:"IBM Plex Mono",size:11},color:"var(--text-2)",callback:a=>a>=1e3?`${(a/1e3).toFixed(0)}k`:a}}}}})}function T(){const n=document.getElementById("cmm-donut-canvas");if(!n||typeof Chart>"u")return;E&&E.destroy();const s=document.getElementById("cmm-donut-legend"),t=document.getElementById("cmm-donut-subtitle");let i=[],e=[];const r=["#4F46E5","#10B981","#F59E0B","#EC4899","#8B5CF6","#06B6D4","#64748B"];if(b){const l=y.find(a=>a.customer.id===b);l&&(t&&(t.textContent=`هيكل حساب ${l.customer.name}`),i=["صافي المبيعات","التحصيلات","المردودات"],e=[l.totalNetSales,l.totalCollections,l.totalReturns])}else{t&&(t.textContent=`أعلى 5 مساهمات في مبيعات ${v}`);const l=y.slice(0,5);i=l.map(p=>p.customer.name),e=l.map(p=>p.totalSales);const a=y.slice(5).reduce((p,m)=>p+m.totalSales,0);a>0&&(i.push("باقي العملاء"),e.push(a))}const d=e.reduce((l,a)=>l+a,0);E=new Chart(n,{type:"doughnut",data:{labels:i,datasets:[{data:e,backgroundColor:r.slice(0,i.length),borderWidth:2,borderColor:"var(--bg-card)"}]},options:{responsive:!0,maintainAspectRatio:!1,cutout:"68%",plugins:{legend:{display:!1},tooltip:{callbacks:{label:l=>{const a=l.raw||0,p=d>0?(a/d*100).toFixed(1):"0";return` ${l.label}: ${g(a)} (${p}%)`}}}}}}),s&&(s.innerHTML=i.map((l,a)=>{const p=e[a]||0,m=d>0?(p/d*100).toFixed(1):"0";return`
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="display:inline-flex; align-items:center; gap:6px;">
            <span style="width:8px; height:8px; border-radius:50%; background:${r[a]}; display:inline-block;"></span>
            <span style="max-width:130px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${l}</span>
          </span>
          <span class="mono font-bold" style="font-size:11px;">${m}%</span>
        </div>
      `}).join(""))}function k(){const n=document.getElementById("cmm-tbody"),s=document.getElementById("cmm-tfoot");if(!n)return;let t=y;if(w&&(t=t.filter(e=>(e.customer.name||"").toLowerCase().includes(w)||(e.customer.code||"").toLowerCase().includes(w)||(e.customer.phone||"").includes(w)||(e.customer.repName||"").toLowerCase().includes(w))),document.getElementById("cmm-table-rows-count").textContent=`عرض ${t.length} من أصل ${y.length} عميل`,!t.length){n.innerHTML='<tr><td colspan="19" style="text-align:center; padding:40px; color:var(--text-2);">لا توجد سجلات تطابق الفلتر والبحث الحالي</td></tr>',s&&(s.innerHTML="");return}let i=1;if(t.forEach(e=>{e.monthlySales.forEach(r=>{const d=h==="collections"?r.collections:h==="net_sales"?r.netSales:r.sales;d>i&&(i=d)})}),n.innerHTML=t.map(e=>{const r=e.customer,d=b===r.id,l=e.monthlySales.map(x=>{const u=h==="collections"?x.collections:h==="net_sales"?x.netSales:x.sales,o=u>0?Math.min(.28,Math.max(.04,u/i*.35)):0,c=u>0?`background: rgba(79, 70, 229, ${o});`:"";return h==="both"?`
          <td style="${c} text-align:center; padding:6px 4px; border-left:1px solid var(--border-soft); font-size:11px;">
            ${x.sales>0?`<div class="mono font-bold" style="color:var(--text-0);">${g(x.sales)}</div>`:'<div style="color:var(--text-3); font-size:10px;">—</div>'}
            ${x.collections>0?`<div class="mono" style="color:#10B981; font-size:10px; margin-top:2px;">📥 ${g(x.collections)}</div>`:""}
          </td>
        `:`
        <td style="${c} text-align:center; padding:8px 4px; border-left:1px solid var(--border-soft);">
          <span class="mono ${u>0?"font-bold":"dim"}" style="font-size:11.5px; color:${u>0?"var(--text-0)":"var(--text-3)"};">
            ${u>0?g(u):"—"}
          </span>
        </td>
      `}).join(""),a=r.balance||0,p=a>0,m=a<0;return`
      <tr onclick="window.focusCmmCustomer('${r.id}')"
          style="cursor:pointer; transition:background 0.15s; ${d?"background:rgba(99,102,241,0.14) !important; outline:2px solid var(--brand);":""}"
          class="cmm-row ${d?"active":""}">
        
        <!-- Sticky Customer Column -->
        <td style="position:sticky; right:0; z-index:5; background:var(--bg-card); box-shadow:-2px 0 6px rgba(0,0,0,0.06); padding:8px 12px;">
          <div style="font-weight:800; font-size:12.5px; color:${d?"var(--brand)":"var(--text-0)"};">${r.name}</div>
          <div style="font-size:10.5px; color:var(--text-2); margin-top:2px; display:flex; gap:6px; align-items:center;">
            <span>${r.code?`[${r.code}]`:""}</span>
            <span>👔 ${r.repName||"—"}</span>
            <span>📍 ${r.zone||"—"}</span>
          </div>
        </td>

        <!-- Current Debt Balance -->
        <td style="text-align:left; font-size:11.5px;">
          <span class="mono font-bold" style="color:${p?"var(--bad)":m?"#10B981":"var(--text-2)"};">
            ${g(a)}
          </span>
        </td>

        <!-- 12 Month Cells -->
        ${l}

        <!-- Total Sales -->
        <td class="mono font-bold" style="text-align:left; color:var(--indigo); background:rgba(99,102,241,0.04); font-size:12px;">
          ${g(e.totalSales)}
        </td>

        <!-- Total Collections -->
        <td class="mono font-bold" style="text-align:left; color:#10B981; background:rgba(16,185,129,0.04); font-size:12px;">
          ${g(e.totalCollections)}
        </td>

        <!-- Collection Coverage Rate % -->
        <td style="text-align:center;">
          <span class="badge ${e.collectionRate>=95?"good":e.collectionRate>=70?"warn":"bad"}" style="font-size:10px; font-weight:800; padding:2px 6px;">
            ${e.collectionRate.toFixed(0)}%
          </span>
        </td>

        <!-- Growth Trend -->
        <td style="text-align:center;">
          <span class="badge ${e.trendClass}" style="font-size:10.5px; font-weight:700;">
            ${e.trendLabel}
          </span>
        </td>

        <!-- Actions -->
        <td style="text-align:center;" class="no-print" onclick="event.stopPropagation();">
          <button class="btn btn-icon sm btn-ghost" title="كشف الحساب التفصيلي" onclick="window.focusCmmCustomer('${r.id}'); window.openCmmCustomerStatement();">
            📊
          </button>
        </td>

      </tr>
    `}).join(""),s){const e=Array(12).fill(0),r=Array(12).fill(0);t.forEach(m=>{m.monthlySales.forEach((x,u)=>{e[u]+=h==="collections"?x.collections:h==="net_sales"?x.netSales:x.sales,r[u]+=x.collections})});const d=t.reduce((m,x)=>m+x.totalSales,0),l=t.reduce((m,x)=>m+x.totalCollections,0),a=d>0?l/d*100:0,p=t.reduce((m,x)=>m+(x.customer.balance||0),0);s.innerHTML=`
      <tr>
        <td style="position:sticky; right:0; z-index:11; background:var(--bg-2); padding:10px 12px; font-size:12px; color:var(--text-0);">
          الإجمالي العام (${t.length} عميل)
        </td>
        <td class="mono font-bold" style="text-align:left; font-size:12px; color:${p>0?"var(--bad)":"var(--text-0)"};">
          ${g(p)}
        </td>
        ${e.map(m=>`
          <td class="mono font-bold" style="text-align:center; font-size:11.5px; color:var(--text-0); padding:8px 4px;">
            ${m>0?g(m):"0.00"}
          </td>
        `).join("")}
        <td class="mono font-bold" style="text-align:left; color:var(--indigo); font-size:12.5px;">
          ${g(d)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:#10B981; font-size:12.5px;">
          ${g(l)}
        </td>
        <td style="text-align:center; font-size:11.5px; color:var(--text-0);">
          ${a.toFixed(0)}%
        </td>
        <td colspan="2"></td>
      </tr>
    `}}export{J as render};
