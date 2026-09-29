import{q as pt,t as mt,f as p,g as H,a as W}from"./index-CnctmNGr.js";import{orderBy as st}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";const F=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];let nt=[],lt=[],it=[],rt=[],tt=[],et=[],y=new Date().getFullYear(),K="all",ot="all",A="both",z="with_vat",j="",v="total_sales_desc",S=null,J=null,U=null,f=[];async function wt(n,l){y=new Date().getFullYear(),S=null,j="",z="with_vat",v="total_sales_desc",n.innerHTML=`
    <!-- Top Filter Bar -->
    <div class="filterbar no-print" style="flex-wrap:wrap; gap:10px; align-items:flex-end; background:var(--bg-1); padding:14px 18px; border-radius:14px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); margin-bottom:16px;">
      
      <!-- Year Selector -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">📅 السنة المالية</label>
        <select id="cmm-year-select" onchange="window.onCmmYearChange(this.value)" style="min-width:105px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12.5px; font-weight:700;">
          <option value="2026" ${y===2026?"selected":""}>2026</option>
          <option value="2025" ${y===2025?"selected":""}>2025</option>
          <option value="2024" ${y===2024?"selected":""}>2024</option>
          <option value="2023" ${y===2023?"selected":""}>2023</option>
        </select>
      </div>

      <!-- Tax Mode Filter -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">🏛️ المعاملة الضريبية بالمصفوفة</label>
        <select id="cmm-tax-mode" onchange="window.onCmmTaxModeChange(this.value)" style="min-width:175px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px; font-weight:700;">
          <option value="with_vat" ${z==="with_vat"?"selected":""}>شامل الضريبة (بعد الضريبة 15%)</option>
          <option value="no_vat" ${z==="no_vat"?"selected":""}>قبل الضريبة (بدون الضريبة)</option>
        </select>
      </div>

      <!-- Sales Rep Filter -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">👔 المندوب</label>
        <select id="cmm-rep-select" onchange="window.onCmmRepChange(this.value)" style="min-width:165px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px; font-weight:600;">
          <option value="all">كل المناديب (مجمع)</option>
        </select>
      </div>

      <!-- Zone Filter -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">📍 المنطقة / المسار</label>
        <select id="cmm-zone-select" onchange="window.onCmmZoneChange(this.value)" style="min-width:130px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px;">
          <option value="all">كل المناطق</option>
        </select>
      </div>

      <!-- Metric View Toggle -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">👁️ نمط العرض في الخلايا</label>
        <select id="cmm-metric-select" onchange="window.onCmmMetricChange(this.value)" style="min-width:190px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px; font-weight:700;">
          <option value="both" selected>المبيعات والتحصيلات معاً</option>
          <option value="sales">المبيعات فقط (Sales)</option>
          <option value="collections">التحصيلات فقط (Collections)</option>
          <option value="net_sales">صافي المبيعات (بعد المردودات)</option>
        </select>
      </div>

      <!-- Sort Filter Dropdown -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">⚡ ترتيب الجدول والمصفوفة</label>
        <select id="cmm-sort-select" onchange="window.onCmmSortChange(this.value)" style="min-width:210px; padding:6px 10px; border:1px solid var(--brand); border-radius:8px; background:var(--bg-card); color:var(--brand); font-size:12px; font-weight:700;">
          <optgroup label="ترتيب سنوي عام">
            <option value="total_sales_desc" selected>الأعلى مبيعات في السنة كلها 🏆</option>
            <option value="total_sales_asc">الأقل مبيعات في السنة كلها</option>
            <option value="total_col_desc">الأعلى تحصيلاً في السنة كلها 💵</option>
            <option value="total_col_asc">الأقل تحصيلاً في السنة كلها</option>
            <option value="balance_desc">الأعلى مديونية (رصيد كشف الحساب) ⚠️</option>
            <option value="name_asc">أبجدياً (اسم العميل أ - ي)</option>
          </optgroup>
          <optgroup label="ترتيب حسب أعلى مبيعات شهر معين">
            ${F.map((t,o)=>`<option value="month_${o}_sales_desc">الأعلى مبيعات شهر ${t} 🛒</option>`).join("")}
          </optgroup>
          <optgroup label="ترتيب حسب أعلى تحصيلات شهر معين">
            ${F.map((t,o)=>`<option value="month_${o}_col_desc">الأعلى تحصيلاً شهر ${t} 📥</option>`).join("")}
          </optgroup>
          <optgroup label="ترتيب حسب الأقل مبيعات أو تحصيلاً">
            ${F.map((t,o)=>`<option value="month_${o}_sales_asc">الأقل مبيعات شهر ${t} 📉</option>`).join("")}
            ${F.map((t,o)=>`<option value="month_${o}_col_asc">الأقل تحصيلاً شهر ${t} ⚠️</option>`).join("")}
          </optgroup>
        </select>
      </div>

      <!-- Search Input -->
      <div style="flex:1; min-width:180px; max-width:280px;">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">🔍 بحث فوري</label>
        <input type="text" id="cmm-search-input" placeholder="اسم العميل أو الكود..." oninput="window.onCmmSearchInput(this.value)" style="width:100%; padding:6px 12px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px;" />
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
            <span style="font-size:11.5px; font-weight:700; color:var(--indigo);">💳 إجمالي مبيعات السنة (${y})</span>
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

      <!-- Explanatory Guide & Key Legend Strip with Current Active Sort Badge -->
      <div class="card mb-12" style="padding:10px 18px; background:linear-gradient(135deg, var(--bg-card), rgba(99,102,241,0.03)); border:1px solid var(--border-soft); border-radius:12px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; font-size:11.5px;">
        <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
          <span style="font-weight:800; color:var(--brand);">💡 دليل قراءة الخلايا:</span>
          <span style="display:inline-flex; align-items:center; gap:5px;"><b style="color:var(--text-0);">السطر العلوي:</b> 🧾 قيمة فواتير المبيعات الصادرة في الشهر</span>
          <span style="display:inline-flex; align-items:center; gap:5px;"><b style="color:#10B981;">السطر السفلي:</b> 📥 المبالغ المحصلة والمقبوضة فعلياً في الشهر</span>
          <span style="display:inline-flex; align-items:center; gap:5px;"><b style="color:var(--indigo);">⚖️ رصيد كشف الحساب:</b> ناتج (إجمالي المبيعات التاريخية - المردودات - إجمالي التحصيلات)</span>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <!-- View Switcher -->
          <div style="display:inline-flex; background:var(--bg-1); padding:2px; border-radius:8px; border:1px solid var(--border-soft);">
            <button class="btn btn-sm btn-ghost" id="cmm-view-both-btn" onclick="window.setCmmView('both')" style="padding:4px 10px; font-size:11px; font-weight:700; border-radius:6px; background:var(--brand); color:#fff;">
              📊 العرض المتكامل
            </button>
            <button class="btn btn-sm btn-ghost" id="cmm-view-matrix-btn" onclick="window.setCmmView('matrix')" style="padding:4px 10px; font-size:11px; font-weight:700; border-radius:6px; color:var(--text-2);">
              📑 مصفوفة العملاء
            </button>
            <button class="btn btn-sm btn-ghost" id="cmm-view-months-btn" onclick="window.setCmmView('months')" style="padding:4px 10px; font-size:11px; font-weight:700; border-radius:6px; color:var(--text-2);">
              📅 جدول تحليل الأشهر
            </button>
          </div>
          <span class="badge" id="cmm-active-sort-badge" style="background:rgba(99,102,241,0.12); color:var(--brand); font-weight:800; font-size:11px; padding:4px 10px; border:1px solid rgba(99,102,241,0.25);">
            ⚡ الترتيب الحالي: الأعلى مبيعات
          </span>
          <div style="font-weight:700; color:var(--text-2);" id="cmm-table-rows-count">
            عرض 0 عميل
          </div>
        </div>
      </div>

      <!-- Dedicated Monthly Analysis Breakdown Table Card (جدول تحليل الأشهر ومؤشرات الأداء) -->
      <div id="cmm-months-table-card" class="card mb-16" style="border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft); overflow:hidden;">
        <div style="padding:12px 18px; background:linear-gradient(90deg, rgba(99,102,241,0.06), rgba(16,185,129,0.06)); border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">📅</span>
            <div>
              <h3 style="margin:0; font-size:14px; font-weight:800; color:var(--text-0);">جدول التحليل المالي للأشهر (${y})</h3>
              <p style="margin:2px 0 0; font-size:11px; color:var(--text-2);">توزيع أداء المبيعات (قبل وبعد الضريبة 15%) والمردودات وصافي التدفقات والتحصيلات وأفضل العملاء شهراً بشهر</p>
            </div>
          </div>
          <div style="font-size:11.5px; font-weight:700; color:var(--brand);">
            💡 انقر على زر "فرز المصفوفة" لأي شهر لترتيب جدول العملاء مباشرة حسب ذلك الشهر
          </div>
        </div>
        <div class="table-container" style="overflow:auto;">
          <table class="data-dense" id="cmm-monthly-breakdown-table" style="width:100%; border-collapse:collapse; min-width:1300px;">
            <thead style="background:var(--bg-1);">
              <tr>
                <th style="width:110px; text-align:right; padding:10px 12px; font-weight:800;">📅 عمود الشهر</th>
                <th style="min-width:115px; text-align:left; color:var(--text-1);">🧾 قبل الضريبة</th>
                <th style="min-width:100px; text-align:left; color:var(--brand);">🏛️ الضريبة 15%</th>
                <th style="min-width:115px; text-align:left; color:var(--indigo);">💳 مبيعات (شامل الضريبة)</th>
                <th style="min-width:105px; text-align:left; color:var(--bad);">↩️ المردودات</th>
                <th style="min-width:115px; text-align:left; color:var(--text-0);">✨ صافي المبيعات</th>
                <th style="min-width:115px; text-align:left; color:#10B981;">📥 التحصيلات</th>
                <th style="min-width:110px; text-align:left; color:var(--text-1);">⚖️ فجوة الشهر</th>
                <th style="width:90px; text-align:center;">🎯 نسبة التحصيل</th>
                <th style="width:85px; text-align:center;">📊 حصة السنة</th>
                <th style="width:80px; text-align:center;">👥 عملاء</th>
                <th style="min-width:150px; text-align:right;">🥇 أعلى عميل مبيعات</th>
                <th style="min-width:150px; text-align:right;">💵 أعلى عميل تحصيلاً</th>
                <th style="width:105px; text-align:center;" class="no-print">⚡ فرز المصفوفة</th>
              </tr>
            </thead>
            <tbody id="cmm-monthly-breakdown-tbody">
              <!-- Rendered Dynamically -->
            </tbody>
            <tfoot id="cmm-monthly-breakdown-tfoot" style="background:var(--bg-2); font-weight:900; border-top:2px solid var(--border);">
              <!-- Rendered Dynamically -->
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Customer Monthly Matrix Table (مصفوفة العملاء في صفوف والأشهر في أعمدة) -->
      <div id="cmm-matrix-table-card" class="card" style="border-radius:14px; background:var(--bg-card); border:1px solid var(--border-soft); overflow:hidden;">
        <div class="table-container" style="max-height:720px; overflow:auto;">
          <table class="data-dense" id="cmm-matrix-table" style="width:100%; border-collapse:collapse; min-width:1450px;">
            <thead style="position:sticky; top:0; z-index:10; background:var(--bg-1);">
              <!-- Top Tier: Explicit Group Header Categorization -->
              <tr style="border-bottom:1px solid var(--border-soft);">
                <th colspan="2" style="position:sticky; right:0; z-index:12; background:var(--bg-1); text-align:center; padding:7px 10px; font-size:12px; font-weight:800; color:var(--text-1); border-left:1px solid var(--border);">
                  🏢 بيانات العملاء والرصيد
                </th>
                <th colspan="12" style="text-align:center; padding:7px 10px; font-size:12.5px; font-weight:900; color:var(--brand); background:linear-gradient(90deg, rgba(99,102,241,0.08), rgba(16,185,129,0.08)); border-left:1px solid var(--border);">
                  📅 عمود الأشهر (${y}) — مبيعات وتحصيلات الـ 12 شهراً
                </th>
                <th colspan="5" style="text-align:center; padding:7px 10px; font-size:12px; font-weight:800; color:var(--text-1); background:var(--bg-1);">
                  📊 الإجماليات ومؤشرات الأداء السنوية
                </th>
              </tr>

              <!-- Second Tier: Detailed Columns -->
              <tr>
                <th style="min-width:220px; position:sticky; right:0; z-index:11; background:var(--bg-1); box-shadow:-2px 0 6px rgba(0,0,0,0.06); padding:10px 12px; cursor:pointer;" onclick="window.toggleCmmHeaderSort('name')">
                  <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span>العميل / المندوب / المسار</span>
                    <span style="font-size:10px; color:var(--text-2);">⇅</span>
                  </div>
                </th>

                <th style="min-width:125px; text-align:left; background:rgba(99,102,241,0.04); cursor:pointer;" onclick="window.toggleCmmHeaderSort('balance')">
                  <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span>⚖️ رصيد كشف الحساب</span>
                    <span style="font-size:10px; color:var(--text-2);">⇅</span>
                  </div>
                  <div style="font-size:9.5px; font-weight:normal; color:var(--text-2);">(الصافي الفعلي التراكمي)</div>
                </th>

                ${F.map((t,o)=>`
                  <th style="min-width:105px; text-align:center; padding:8px 4px; user-select:none;" id="th-month-${o}">
                    <div style="display:flex; flex-direction:column; align-items:center; gap:3px;">
                      <span style="font-size:11.5px; font-weight:800; color:var(--text-0);">${o+1} - ${t}</span>
                      <div style="display:flex; gap:3px; align-items:center;">
                        <button class="btn btn-ghost btn-icon sm" title="ترتيب حسب مبيعات ${t}" onclick="window.setMonthQuickSort(${o}, 'sales')" style="padding:2px 4px; font-size:9px; height:18px; border-radius:4px; background:rgba(99,102,241,0.08); color:var(--brand);">
                          🧾 مبيعات
                        </button>
                        <button class="btn btn-ghost btn-icon sm" title="ترتيب حسب تحصيلات ${t}" onclick="window.setMonthQuickSort(${o}, 'col')" style="padding:2px 4px; font-size:9px; height:18px; border-radius:4px; background:rgba(16,185,129,0.08); color:#10B981;">
                          📥 تحصيل
                        </button>
                      </div>
                    </div>
                  </th>
                `).join("")}

                <th style="min-width:120px; text-align:left; background:rgba(99,102,241,0.08); color:var(--indigo); cursor:pointer;" onclick="window.toggleCmmHeaderSort('total_sales')">
                  <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span id="cmm-th-total-sales-label">مبيعات ${y}</span>
                    <span style="font-size:10px;">⇅</span>
                  </div>
                </th>

                <th style="min-width:115px; text-align:left; background:rgba(16,185,129,0.08); color:#10B981; cursor:pointer;" onclick="window.toggleCmmHeaderSort('total_col')">
                  <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span>تحصيلات ${y}</span>
                    <span style="font-size:10px;">⇅</span>
                  </div>
                </th>

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
  `,await xt(),await loadCmmData()}async function xt(){window.onCmmYearChange=n=>{y=parseInt(n,10),S=null,Q()},window.onCmmRepChange=n=>{K=n,Q()},window.onCmmZoneChange=n=>{ot=n,Q()},window.onCmmTaxModeChange=n=>{z=n,G(),dt(),Z(),X(),q(),V()},window.onCmmMetricChange=n=>{A=n,V()},window.onCmmSortChange=n=>{v=n,G(),V()},window.setMonthQuickSort=(n,l)=>{const t=v,o=`month_${n}_${l}_desc`,r=`month_${n}_${l}_asc`;t===o?v=r:v=o;const e=document.getElementById("cmm-sort-select");e&&(e.value=v),G(),V()},window.toggleCmmHeaderSort=n=>{n==="total_sales"?v=v==="total_sales_desc"?"total_sales_asc":"total_sales_desc":n==="total_col"?v=v==="total_col_desc"?"total_col_asc":"total_col_desc":n==="balance"?v=v==="balance_desc"?"balance_asc":"balance_desc":n==="name"&&(v=v==="name_asc"?"name_desc":"name_asc");const l=document.getElementById("cmm-sort-select");l&&(l.value=v),G(),V()},window.setCmmView=n=>{const l=document.getElementById("cmm-months-table-card"),t=document.getElementById("cmm-matrix-table-card"),o=document.getElementById("cmm-view-both-btn"),r=document.getElementById("cmm-view-matrix-btn"),e=document.getElementById("cmm-view-months-btn");[o,r,e].forEach(c=>{c&&(c.style.background="transparent",c.style.color="var(--text-2)")}),n==="both"?(l&&(l.style.display="block"),t&&(t.style.display="block"),o&&(o.style.background="var(--brand)",o.style.color="#fff")):n==="matrix"?(l&&(l.style.display="none"),t&&(t.style.display="block"),r&&(r.style.background="var(--brand)",r.style.color="#fff")):n==="months"&&(l&&(l.style.display="block"),t&&(t.style.display="none"),e&&(e.style.background="var(--brand)",e.style.color="#fff"))},window.scrollCmmToMatrix=()=>{const n=document.getElementById("cmm-matrix-table-card");n&&(n.style.display==="none"&&window.setCmmView("both"),n.scrollIntoView({behavior:"smooth",block:"start"}))},window.onCmmSearchInput=pt(n=>{j=(n||"").trim().toLowerCase(),V()},200),window.focusCmmCustomer=n=>{S=n,at(),Z(),X(),q(),V()},window.resetCmmCustomerFocus=()=>{S=null,at(),Z(),X(),q(),V()},window.openCmmCustomerStatement=()=>{S&&typeof window.navigate=="function"&&(window._preselectedStatementEntity={type:"customer",id:S},window.navigate("report-customer-statement"))},window.exportCmmExcel=()=>{if(!f.length)return;const n=[],l=["كود العميل","اسم العميل","المنطقة","المندوب","رصيد كشف الحساب الفعلي",...F,`إجمالي مبيعات ${y}`,`إجمالي تحصيلات ${y}`,"نسبة التحصيل %","اتجاه النمو"];f.forEach(t=>{const o=[t.customer.code||"",t.customer.name||"",t.customer.zone||"",t.customer.repName||"",t.actualStatementBalance,...t.monthlySales.map(r=>r.sales),t.totalSales,t.totalCollections,t.collectionRate.toFixed(1)+"%",t.trendLabel];n.push(o)}),window.exportXLSX({filename:`مصفوفة_مبيعات_العملاء_${y}_${mt()}`,headers:l,rows:n,sheetName:`مبيعات_${y}`})},window.printCmmReport=()=>{window.print()}}function G(){const n=v||"total_sales_desc",l=document.getElementById("cmm-active-sort-badge");if(F.forEach((t,o)=>{const r=document.getElementById(`th-month-${o}`);r&&(r.style.background="",r.style.boxShadow="")}),n==="total_sales_desc")f.sort((t,o)=>o.totalSales-t.totalSales),l&&(l.textContent="⚡ الترتيب الحالي: الأعلى مبيعات في السنة كلها 🏆");else if(n==="total_sales_asc")f.sort((t,o)=>t.totalSales-o.totalSales),l&&(l.textContent="⚡ الترتيب الحالي: الأقل مبيعات في السنة كلها 📉");else if(n==="total_col_desc")f.sort((t,o)=>o.totalCollections-t.totalCollections),l&&(l.textContent="⚡ الترتيب الحالي: الأعلى تحصيلاً في السنة كلها 💵");else if(n==="total_col_asc")f.sort((t,o)=>t.totalCollections-o.totalCollections),l&&(l.textContent="⚡ الترتيب الحالي: الأقل تحصيلاً في السنة كلها ⚠️");else if(n==="balance_desc")f.sort((t,o)=>o.actualStatementBalance-t.actualStatementBalance),l&&(l.textContent="⚡ الترتيب الحالي: الأعلى مديونية (رصيد كشف الحساب) ⚠️");else if(n==="balance_asc")f.sort((t,o)=>t.actualStatementBalance-o.actualStatementBalance),l&&(l.textContent="⚡ الترتيب الحالي: الأقل مديونية / دائن 🟢");else if(n==="name_asc")f.sort((t,o)=>(t.customer.name||"").localeCompare(o.customer.name||"","ar")),l&&(l.textContent="⚡ الترتيب الحالي: أبجدياً (أ - ي)");else if(n==="name_desc")f.sort((t,o)=>(o.customer.name||"").localeCompare(t.customer.name||"","ar")),l&&(l.textContent="⚡ الترتيب الحالي: أبجدياً (ي - أ)");else if(n.startsWith("month_")){const t=n.split("_"),o=parseInt(t[1],10),r=t[2],e=t[3],c=F[o]||"",i=document.getElementById(`th-month-${o}`);i&&(i.style.background=r==="sales"?"rgba(99,102,241,0.16)":"rgba(16,185,129,0.16)",i.style.boxShadow="inset 0 0 0 1.5px var(--brand)"),f.sort((s,d)=>{const g=r==="sales"?s.monthlySales[o].sales:s.monthlySales[o].collections,u=r==="sales"?d.monthlySales[o].sales:d.monthlySales[o].collections;return e==="desc"?u-g:g-u}),l&&(l.textContent=`⚡ الترتيب الحالي: ${e==="desc"?"الأعلى":"الأقل"} ${r==="sales"?"مبيعات":"تحصيلاً"} لشهر (${c}) ${e==="desc"?"▾":"▴"}`)}}window.loadCmmData=async function(){const l=document.getElementById("cmm-tbody");l&&(l.innerHTML='<tr><td colspan="19" style="text-align:center; padding:50px; color:var(--text-2);"><div class="loading-spinner" style="margin-bottom:8px;"></div><div>جاري جلب البيانات وحساب الأرصدة من كشوف الحسابات...</div></td></tr>');try{const[t,o,r,e,c,i]=await Promise.all([H(W.customers(),[st("name")]).catch(()=>[]),H(W.salesReps(),[st("name")]).catch(()=>[]),H(W.salesInvoices()).catch(()=>[]),H(W.salesReturns()).catch(()=>[]),H(W.collections()).catch(()=>[]),H(W.receipts()).catch(()=>[])]);nt=t||[],lt=o||[],it=(r||[]).filter(s=>s.status!=="cancelled"),rt=(e||[]).filter(s=>s.status!=="cancelled"&&s.status!=="void"),tt=c||[],et=(i||[]).filter(s=>s.status!=="cancelled"&&(!s.entityType||s.entityType==="customer")),gt(),Q()}catch(t){console.error("[CustomerMatrix] Data load error:",t),l&&(l.innerHTML=`<tr><td colspan="19" style="text-align:center; color:var(--bad); padding:30px;">فشل تحميل البيانات: ${t.message}</td></tr>`)}};function gt(){const n=document.getElementById("cmm-rep-select");if(n){const t=n.value;n.innerHTML='<option value="all">كل المناديب (مجمع)</option>'+lt.map(o=>`<option value="${o.id}">${o.name}</option>`).join(""),t&&(n.value=t)}const l=document.getElementById("cmm-zone-select");if(l){const t=new Set;nt.forEach(r=>{r.zone&&r.zone.trim()&&t.add(r.zone.trim())});const o=Array.from(t).sort();l.innerHTML='<option value="all">كل المناطق</option>'+o.map(r=>`<option value="${r}">${r}</option>`).join("")}}function Q(){const n=String(y);f=nt.filter(t=>{if(K!=="all"&&t.repId!==K){const o=lt.find(r=>r.id===K);if(!o||t.repName!==o.name)return!1}return!(ot!=="all"&&t.zone!==ot)}).map(t=>{const o=Array(12).fill(0).map(()=>({sales:0,salesSubtotal:0,salesVat:0,returns:0,returnsSubtotal:0,returnsVat:0,netSales:0,netSalesSubtotal:0,netSalesVat:0,collections:0}));let r=0,e=0,c=0,i=0,s=0;const d=(t.name||"").trim().toLowerCase();it.forEach(a=>{if(!(a.customerId===t.id||a.customerName&&a.customerName.trim().toLowerCase()===d))return;const $=parseFloat(a.totalWithVat!==void 0?a.totalWithVat:a.total||a.grandTotal||0),E=parseFloat(a.subtotal!==void 0?a.subtotal:$-parseFloat(a.taxTotal||a.vatAmount||0)),I=parseFloat(a.taxTotal!==void 0?a.taxTotal:a.vatAmount!==void 0?a.vatAmount:$-E);r+=$;const N=a.date||(a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:"");if(N.startsWith(n)){const B=parseInt(N.slice(5,7),10)-1;B>=0&&B<12&&(o[B].sales+=$,o[B].salesSubtotal+=E,o[B].salesVat+=I)}a.paidAmount>0&&(et.some(k=>(k.date||(k.createdAt?.toDate?k.createdAt.toDate().toISOString().split("T")[0]:""))===N&&(k.targetId===t.id||k.customerName&&k.customerName.trim().toLowerCase()===d)&&Math.abs((k.amount||0)-a.paidAmount)<.01)||tt.some(k=>(k.date||(k.createdAt?.toDate?k.createdAt.toDate().toISOString().split("T")[0]:""))===N&&(k.customerId===t.id||k.customerName&&k.customerName.trim().toLowerCase()===d)&&Math.abs((k.amount||0)-a.paidAmount)<.01)||(s+=parseFloat(a.paidAmount||0)))}),rt.forEach(a=>{if(!(a.customerId===t.id||a.customerName&&a.customerName.trim().toLowerCase()===d))return;const $=parseFloat(a.totalWithVat!==void 0?a.totalWithVat:a.totalAmount||a.grandTotal||a.total||0),E=parseFloat(a.subtotal!==void 0?a.subtotal:$-parseFloat(a.taxTotal||a.vatAmount||0)),I=parseFloat(a.taxTotal!==void 0?a.taxTotal:a.vatAmount!==void 0?a.vatAmount:$-E);e+=$;const N=a.date||a.returnDate||(a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:"");if(N.startsWith(n)){const B=parseInt(N.slice(5,7),10)-1;B>=0&&B<12&&(o[B].returns+=$,o[B].returnsSubtotal+=E,o[B].returnsVat+=I)}}),tt.forEach(a=>{if(!(a.customerId===t.id||a.customerName&&a.customerName.trim().toLowerCase()===d))return;const $=parseFloat(a.amount||0);c+=$;const E=a.date||(a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:"");if(E.startsWith(n)){const I=parseInt(E.slice(5,7),10)-1;I>=0&&I<12&&(o[I].collections+=$)}}),et.forEach(a=>{if(!(a.targetId===t.id||a.customerId===t.id||a.customerName&&a.customerName.trim().toLowerCase()===d))return;const $=parseFloat(a.amount||0);i+=$;const E=a.date||(a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:"");if(E.startsWith(n)){const I=parseInt(E.slice(5,7),10)-1;I>=0&&I<12&&(o[I].collections+=$)}});const g=parseFloat(t.openingBalance||0),u=Math.round((g+r-e-c-i-s)*100)/100;o.forEach(a=>{a.netSales=a.sales-a.returns,a.netSalesSubtotal=a.salesSubtotal-a.returnsSubtotal,a.netSalesVat=a.salesVat-a.returnsVat});const b=o.reduce((a,h)=>a+h.sales,0),m=o.reduce((a,h)=>a+h.salesSubtotal,0),x=o.reduce((a,h)=>a+h.salesVat,0),_=o.reduce((a,h)=>a+h.returns,0),M=o.reduce((a,h)=>a+h.returnsSubtotal,0),D=o.reduce((a,h)=>a+h.returnsVat,0),C=b-_,P=m-M,T=o.reduce((a,h)=>a+h.collections,0),R=C>0?T/C*100:b>0?T/b*100:T>0?100:0,L=o.slice(0,6).reduce((a,h)=>a+h.sales,0),w=o.slice(6,12).reduce((a,h)=>a+h.sales,0);let O="🟢 مستقر",Y="good";return b>0?w>L*1.15?(O="📈 صاعد",Y="indigo"):w<L*.7&&L>0&&(O="📉 متراجع",Y="bad"):(O="⚪ غير نشط",Y="neutral"),{customer:t,monthlySales:o,totalSales:b,totalSalesSubtotal:m,totalSalesVat:x,totalReturns:_,totalReturnsSubtotal:M,totalReturnsVat:D,totalNetSales:C,totalNetSalesSubtotal:P,totalCollections:T,collectionRate:R,trendLabel:O,trendClass:Y,actualStatementBalance:u}}),G(),dt(),at(),Z(),X(),q(),V()}function dt(){const n=S?f.filter(m=>m.customer.id===S):f,l=n.reduce((m,x)=>m+x.totalSales,0),t=n.reduce((m,x)=>m+x.totalSalesSubtotal,0),o=n.reduce((m,x)=>m+x.totalSalesVat,0),r=n.reduce((m,x)=>m+x.totalReturns,0),e=n.reduce((m,x)=>m+x.totalNetSales,0),c=n.reduce((m,x)=>m+x.totalCollections,0),i=e-c,s=e>0?c/e*100:0,d=n.reduce((m,x)=>m+x.actualStatementBalance,0),g=z==="no_vat"?t:l;document.getElementById("cmm-kpi-sales").textContent=p(g),document.getElementById("cmm-kpi-sales-avg").textContent=z==="no_vat"?`شامل الضريبة: ${p(l)} | الضريبة: ${p(o)}`:`قبل الضريبة: ${p(t)} | الضريبة (15%): ${p(o)}`,document.getElementById("cmm-kpi-collections").textContent=p(c),document.getElementById("cmm-kpi-col-avg").textContent=`صافي المبيعات: ${p(e)} | مردودات: ${p(r)}`;const u=document.getElementById("cmm-kpi-rate");u.textContent=`${s.toFixed(1)}%`,u.style.color=s>=90?"#10B981":s>=70?"#F59E0B":"#EF4444",document.getElementById("cmm-kpi-gap").textContent=`فجوة التحصيل: ${p(i)}`;const b=document.getElementById("cmm-kpi-total-balance");b.textContent=p(d),b.style.color=d>0?"#EF4444":d<0?"#10B981":"#8B5CF6"}function at(){const n=document.getElementById("cmm-focus-banner");if(n){if(S){const l=f.find(t=>t.customer.id===S);if(l){const t=l.customer;document.getElementById("cmm-focus-name").textContent=`${t.name}`,document.getElementById("cmm-focus-details").textContent=`كود: ${t.code||"—"} | المندوب: ${t.repName||"—"} | المنطقة: ${t.zone||"—"} | رصيد كشف الحساب الفعلي الصافي: ${p(l.actualStatementBalance)}`,n.style.display="block",document.getElementById("cmm-chart-title").textContent=`👤 منحنى أداء العميل: ${t.name} (${y})`,document.getElementById("cmm-chart-subtitle").textContent="تحليل تفصيلي لمشتريات وتحصيلات العميل على مدار أشهر السنة";return}}n.style.display="none",document.getElementById("cmm-chart-title").textContent=`📊 منحنى المبيعات والتحصيلات المجمعة لسنة ${y}`,document.getElementById("cmm-chart-subtitle").textContent="مقارنة بصرية ديناميكية بين مسحوبات المبيعات والتدفقات النقدية المحصلة"}}function Z(){const n=document.getElementById("cmm-trend-canvas");if(!n||typeof Chart>"u")return;const l=Array(12).fill(0),t=Array(12).fill(0),o=Array(12).fill(0);(S?f.filter(s=>s.customer.id===S):f).forEach(s=>{s.monthlySales.forEach((d,g)=>{l[g]+=d.sales,t[g]+=d.collections,o[g]+=d.returns})}),J&&J.destroy();const e=n.getContext("2d"),c=e.createLinearGradient(0,0,0,320);c.addColorStop(0,"rgba(79, 70, 229, 0.40)"),c.addColorStop(1,"rgba(79, 70, 229, 0.0)");const i=e.createLinearGradient(0,0,0,320);i.addColorStop(0,"rgba(16, 185, 129, 0.30)"),i.addColorStop(1,"rgba(16, 185, 129, 0.0)"),J=new Chart(n,{type:"line",data:{labels:F,datasets:[{label:"المبيعات (ر.س)",data:l,borderColor:"#4F46E5",backgroundColor:c,borderWidth:3.5,tension:.38,pointRadius:5.5,pointHoverRadius:9,pointBackgroundColor:"#4F46E5",pointBorderColor:"#FFFFFF",pointBorderWidth:2.5,fill:!0},{label:"التحصيلات (ر.س)",data:t,borderColor:"#10B981",backgroundColor:i,borderWidth:3.5,borderDash:[6,4],tension:.38,pointRadius:5.5,pointHoverRadius:9,pointBackgroundColor:"#10B981",pointBorderColor:"#FFFFFF",pointBorderWidth:2.5,fill:!0},{label:"المردودات (ر.س)",data:o,borderColor:"#EF4444",backgroundColor:"rgba(239, 68, 68, 0.1)",borderWidth:2,borderDash:[2,2],tension:.3,pointRadius:4,pointBackgroundColor:"#EF4444",fill:!1}]},options:{responsive:!0,maintainAspectRatio:!1,interaction:{mode:"index",intersect:!1},plugins:{legend:{display:!1},tooltip:{backgroundColor:"rgba(15, 23, 42, 0.95)",titleFont:{family:"IBM Plex Sans Arabic",size:13,weight:"bold"},bodyFont:{family:"IBM Plex Mono",size:12.5},padding:14,cornerRadius:10,borderColor:"rgba(255, 255, 255, 0.12)",borderWidth:1,callbacks:{label:function(s){const d=s.raw||0;return`  ${s.dataset.label}: ${p(d)}`},afterBody:function(s){const d=s[0]?.raw||0,g=s[1]?.raw||0,u=d-g;return`  ⚖️ فجوة الشهر: ${p(u)}`}}}},scales:{x:{grid:{color:"rgba(150, 150, 150, 0.08)"},ticks:{font:{family:"IBM Plex Sans Arabic",size:11.5,weight:"600"},color:"var(--text-2)"}},y:{grid:{color:"rgba(150, 150, 150, 0.08)"},ticks:{font:{family:"IBM Plex Mono",size:11},color:"var(--text-2)",callback:s=>s>=1e3?`${(s/1e3).toFixed(0)}k`:s}}}}})}function X(){const n=document.getElementById("cmm-donut-canvas");if(!n||typeof Chart>"u")return;U&&U.destroy();const l=document.getElementById("cmm-donut-legend"),t=document.getElementById("cmm-donut-subtitle");let o=[],r=[];const e=["#4F46E5","#10B981","#F59E0B","#EC4899","#8B5CF6","#06B6D4","#64748B"];if(S){const i=f.find(s=>s.customer.id===S);i&&(t&&(t.textContent=`هيكل حساب ${i.customer.name}`),o=["صافي المبيعات","التحصيلات","المردودات"],r=[i.totalNetSales,i.totalCollections,i.totalReturns])}else{t&&(t.textContent=`أعلى 5 مساهمات في مبيعات ${y}`);const i=f.slice(0,5);o=i.map(d=>d.customer.name),r=i.map(d=>d.totalSales);const s=f.slice(5).reduce((d,g)=>d+g.totalSales,0);s>0&&(o.push("باقي العملاء"),r.push(s))}const c=r.reduce((i,s)=>i+s,0);U=new Chart(n,{type:"doughnut",data:{labels:o,datasets:[{data:r,backgroundColor:e.slice(0,o.length),borderWidth:2,borderColor:"var(--bg-card)"}]},options:{responsive:!0,maintainAspectRatio:!1,cutout:"68%",plugins:{legend:{display:!1},tooltip:{callbacks:{label:i=>{const s=i.raw||0,d=c>0?(s/c*100).toFixed(1):"0";return` ${i.label}: ${p(s)} (${d}%)`}}}}}}),l&&(l.innerHTML=o.map((i,s)=>{const d=r[s]||0,g=c>0?(d/c*100).toFixed(1):"0";return`
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="display:inline-flex; align-items:center; gap:6px;">
            <span style="width:8px; height:8px; border-radius:50%; background:${e[s]}; display:inline-block;"></span>
            <span style="max-width:130px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${i}</span>
          </span>
          <span class="mono font-bold" style="font-size:11px;">${g}%</span>
        </div>
      `}).join(""))}function V(){const n=document.getElementById("cmm-tbody"),l=document.getElementById("cmm-tfoot");if(!n)return;let t=f;j&&(t=t.filter(e=>(e.customer.name||"").toLowerCase().includes(j)||(e.customer.code||"").toLowerCase().includes(j)||(e.customer.phone||"").includes(j)||(e.customer.repName||"").toLowerCase().includes(j))),document.getElementById("cmm-table-rows-count").textContent=`عرض ${t.length} من أصل ${f.length} عميل`;const o=document.getElementById("cmm-th-total-sales-label");if(o&&(o.textContent=z==="no_vat"?`مبيعات ${y} (قبل الضريبة)`:`مبيعات ${y} (شامل الضريبة)`),!t.length){n.innerHTML='<tr><td colspan="19" style="text-align:center; padding:40px; color:var(--text-2);">لا توجد سجلات تطابق الفلتر والبحث الحالي</td></tr>',l&&(l.innerHTML="");return}let r=1;if(t.forEach(e=>{e.monthlySales.forEach(c=>{const i=z==="no_vat"?c.salesSubtotal:c.sales,s=z==="no_vat"?c.netSalesSubtotal:c.netSales,d=A==="collections"?c.collections:A==="net_sales"?s:i;d>r&&(r=d)})}),n.innerHTML=t.map((e,c)=>{const i=e.customer,s=S===i.id,d=e.monthlySales.map((x,_)=>{const M=z==="no_vat"?x.salesSubtotal:x.sales,D=z==="no_vat"?x.netSalesSubtotal:x.netSales,C=A==="collections"?x.collections:A==="net_sales"?D:M,P=v.startsWith(`month_${_}_`),T=C>0?Math.min(.28,Math.max(.04,C/r*.35)):0;let R=C>0?`background: rgba(79, 70, 229, ${T});`:"";return P&&(R=C>0?`background: rgba(99, 102, 241, ${Math.max(.12,T+.08)});`:"background: rgba(99, 102, 241, 0.03);"),A==="both"?`
          <td style="${R} text-align:center; padding:6px 6px; border-left:1px solid var(--border-soft); font-size:11px;">
            ${M>0?`
              <div style="display:flex; justify-content:space-between; align-items:center; gap:2px;">
                <span style="font-size:9.5px; color:var(--text-2);">🧾</span>
                <span class="mono font-bold" style="color:var(--text-0);">${p(M)}</span>
              </div>
            `:'<div style="color:var(--text-3); font-size:10px;">—</div>'}
            ${x.collections>0?`
              <div style="display:flex; justify-content:space-between; align-items:center; gap:2px; margin-top:2px;">
                <span style="font-size:9.5px; color:#10B981;">📥</span>
                <span class="mono font-bold" style="color:#10B981;">${p(x.collections)}</span>
              </div>
            `:""}
          </td>
        `:`
        <td style="${R} text-align:center; padding:8px 4px; border-left:1px solid var(--border-soft);">
          <span class="mono ${C>0?"font-bold":"dim"}" style="font-size:11.5px; color:${C>0?"var(--text-0)":"var(--text-3)"};">
            ${C>0?p(C):"—"}
          </span>
        </td>
      `}).join(""),g=e.actualStatementBalance,u=g>0,b=g<0,m=z==="no_vat"?e.totalSalesSubtotal:e.totalSales;return`
      <tr onclick="window.focusCmmCustomer('${i.id}')"
          style="cursor:pointer; transition:background 0.15s; ${s?"background:rgba(99,102,241,0.14) !important; outline:2px solid var(--brand);":""}"
          class="cmm-row ${s?"active":""}">
        
        <!-- Sticky Customer Column -->
        <td style="position:sticky; right:0; z-index:5; background:var(--bg-card); box-shadow:-2px 0 6px rgba(0,0,0,0.06); padding:8px 12px;">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <div style="font-weight:800; font-size:12.5px; color:${s?"var(--brand)":"var(--text-0)"};">${i.name}</div>
            ${c<3&&v.includes("desc")?`<span style="font-size:13px;">${c===0?"🥇":c===1?"🥈":"🥉"}</span>`:""}
          </div>
          <div style="font-size:10.5px; color:var(--text-2); margin-top:2px; display:flex; gap:6px; align-items:center;">
            <span>${i.code?`[${i.code}]`:""}</span>
            <span>👔 ${i.repName||"—"}</span>
            <span>📍 ${i.zone||"—"}</span>
          </div>
        </td>

        <!-- Exact Statement Balance (Calculated Dynamically) -->
        <td style="text-align:left; font-size:11.5px; background:rgba(99,102,241,0.03);">
          <span class="mono font-bold" style="color:${u?"var(--bad)":b?"#10B981":"var(--text-2)"}; font-size:12px;">
            ${u?p(g):b?`(${p(Math.abs(g))}) دائن`:"0.00"}
          </span>
        </td>

        <!-- 12 Month Cells -->
        ${d}

        <!-- Total Sales of Year -->
        <td class="mono font-bold" style="text-align:left; color:var(--indigo); background:rgba(99,102,241,0.04); font-size:12px;">
          ${p(m)}
        </td>

        <!-- Total Collections of Year -->
        <td class="mono font-bold" style="text-align:left; color:#10B981; background:rgba(16,185,129,0.04); font-size:12px;">
          ${p(e.totalCollections)}
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
          <button class="btn btn-icon sm btn-ghost" title="كشف الحساب التفصيلي" onclick="window.focusCmmCustomer('${i.id}'); window.openCmmCustomerStatement();">
            📊
          </button>
        </td>

      </tr>
    `}).join(""),l){const e=Array(12).fill(0),c=Array(12).fill(0);t.forEach(u=>{u.monthlySales.forEach((b,m)=>{const x=z==="no_vat"?b.salesSubtotal:b.sales,_=z==="no_vat"?b.netSalesSubtotal:b.netSales;e[m]+=A==="collections"?b.collections:A==="net_sales"?_:x,c[m]+=b.collections})});const i=t.reduce((u,b)=>u+(z==="no_vat"?b.totalSalesSubtotal:b.totalSales),0),s=t.reduce((u,b)=>u+b.totalCollections,0),d=i>0?s/i*100:0,g=t.reduce((u,b)=>u+b.actualStatementBalance,0);l.innerHTML=`
      <tr>
        <td style="position:sticky; right:0; z-index:11; background:var(--bg-2); padding:10px 12px; font-size:12px; color:var(--text-0);">
          الإجمالي العام (${t.length} عميل)
        </td>
        <td class="mono font-bold" style="text-align:left; font-size:12px; color:${g>0?"var(--bad)":"var(--text-0)"};">
          ${p(g)}
        </td>
        ${e.map(u=>`
          <td class="mono font-bold" style="text-align:center; font-size:11.5px; color:var(--text-0); padding:8px 4px;">
            ${u>0?p(u):"0.00"}
          </td>
        `).join("")}
        <td class="mono font-bold" style="text-align:left; color:var(--indigo); font-size:12.5px;">
          ${p(i)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:#10B981; font-size:12.5px;">
          ${p(s)}
        </td>
        <td style="text-align:center; font-size:11.5px; color:var(--text-0);">
          ${d.toFixed(0)}%
        </td>
        <td colspan="2"></td>
      </tr>
    `}}function q(){const n=document.getElementById("cmm-monthly-breakdown-tbody"),l=document.getElementById("cmm-monthly-breakdown-tfoot");if(!n)return;const t=S?f.filter(e=>e.customer.id===S):f,o=t.reduce((e,c)=>e+c.totalSales,0),r=Array(12).fill(0).map((e,c)=>{let i=0,s=0,d=0,g=0,u=0,b=0,m=0,x=0,_=0,M=0,D={name:"—",amount:0},C={name:"—",amount:0};t.forEach(L=>{const w=L.monthlySales[c];i+=w.sales,s+=w.salesSubtotal,d+=w.salesVat,g+=w.returns,u+=w.returnsSubtotal,b+=w.returnsVat,m+=w.netSales,x+=w.netSalesSubtotal,_+=w.collections,(w.sales>0||w.collections>0)&&M++,w.sales>D.amount&&(D={name:L.customer.name,amount:w.sales}),w.collections>C.amount&&(C={name:L.customer.name,amount:w.collections})});const P=m-_,T=m>0?_/m*100:i>0?_/i*100:_>0?100:0,R=o>0?i/o*100:0;return{mIdx:c,monthName:F[c],sales:i,salesSubtotal:s,salesVat:d,returns:g,returnsSubtotal:u,returnsVat:b,netSales:m,netSalesSubtotal:x,collections:_,gap:P,rate:T,share:R,activeCusts:M,topBuyer:D,topPayer:C}});if(n.innerHTML=r.map(e=>{const c=v.startsWith(`month_${e.mIdx}_`),i=e.rate>=95?"good":e.rate>=70?"warn":e.sales===0?"neutral":"bad",s=e.gap>0?"var(--bad)":e.gap<0?"#10B981":"var(--text-2)";return`
      <tr style="transition:background 0.15s; ${c?"background:rgba(99,102,241,0.08); font-weight:700;":""}">
        <td style="padding:10px 12px; font-weight:800; color:var(--text-0);">
          <span style="display:inline-flex; align-items:center; gap:6px;">
            <span class="badge" style="background:var(--bg-1); color:var(--brand); font-size:10px; font-weight:900; border:1px solid var(--border-soft); width:26px; text-align:center;">
              ${String(e.mIdx+1).padStart(2,"0")}
            </span>
            <span style="font-size:12.5px;">${e.monthName}</span>
          </span>
        </td>
        <td class="mono" style="text-align:left; color:var(--text-1); font-size:12px;">
          ${e.salesSubtotal>0?p(e.salesSubtotal):"0.00"}
        </td>
        <td class="mono" style="text-align:left; color:var(--brand); font-size:11.5px;">
          ${e.salesVat>0?p(e.salesVat):"0.00"}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--indigo); font-size:12.5px;">
          ${e.sales>0?p(e.sales):"0.00"}
        </td>
        <td class="mono" style="text-align:left; color:${e.returns>0?"var(--bad)":"var(--text-3)"}; font-size:12px;">
          ${e.returns>0?p(e.returns):"0.00"}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--text-0); font-size:12.5px;">
          ${e.netSales!==0?p(e.netSales):"0.00"}
        </td>
        <td class="mono font-bold" style="text-align:left; color:#10B981; font-size:12.5px;">
          ${e.collections>0?p(e.collections):"0.00"}
        </td>
        <td class="mono font-bold" style="text-align:left; color:${s}; font-size:12px;">
          ${e.gap>0?p(e.gap):e.gap<0?`(${p(Math.abs(e.gap))}) فائض`:"0.00"}
        </td>
        <td style="text-align:center;">
          <span class="badge ${i}" style="font-size:10.5px; font-weight:800;">
            ${e.rate.toFixed(0)}%
          </span>
        </td>
        <td style="text-align:center;" class="mono">
          <span style="font-size:11.5px; color:var(--text-1); font-weight:700;">${e.share.toFixed(1)}%</span>
        </td>
        <td style="text-align:center;" class="mono">
          <span class="badge neutral" style="font-size:10.5px;">${e.activeCusts}</span>
        </td>
        <td style="text-align:right; font-size:11px;">
          ${e.topBuyer.amount>0?`
            <div style="font-weight:700; color:var(--text-0); max-width:150px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${e.topBuyer.name}</div>
            <div class="mono" style="font-size:10px; color:var(--indigo);">${p(e.topBuyer.amount)}</div>
          `:'<span style="color:var(--text-3);">—</span>'}
        </td>
        <td style="text-align:right; font-size:11px;">
          ${e.topPayer.amount>0?`
            <div style="font-weight:700; color:var(--text-0); max-width:150px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${e.topPayer.name}</div>
            <div class="mono" style="font-size:10px; color:#10B981;">${p(e.topPayer.amount)}</div>
          `:'<span style="color:var(--text-3);">—</span>'}
        </td>
        <td style="text-align:center;" class="no-print">
          <div style="display:flex; gap:4px; justify-content:center;">
            <button class="btn btn-ghost btn-sm" title="فرز مصفوفة العملاء حسب مبيعات ${e.monthName}" onclick="window.setMonthQuickSort(${e.mIdx}, 'sales'); window.scrollCmmToMatrix();" style="padding:2px 6px; font-size:10.5px; font-weight:700; border-radius:6px; background:rgba(99,102,241,0.08); color:var(--brand);">
              🛒 مبيعات
            </button>
            <button class="btn btn-ghost btn-sm" title="فرز مصفوفة العملاء حسب تحصيلات ${e.monthName}" onclick="window.setMonthQuickSort(${e.mIdx}, 'col'); window.scrollCmmToMatrix();" style="padding:2px 6px; font-size:10.5px; font-weight:700; border-radius:6px; background:rgba(16,185,129,0.08); color:#10B981;">
              📥 تحصيل
            </button>
          </div>
        </td>
      </tr>
    `}).join(""),l){const e=r.reduce((m,x)=>m+x.sales,0),c=r.reduce((m,x)=>m+x.salesSubtotal,0),i=r.reduce((m,x)=>m+x.salesVat,0),s=r.reduce((m,x)=>m+x.returns,0),d=r.reduce((m,x)=>m+x.netSales,0),g=r.reduce((m,x)=>m+x.collections,0),u=d-g,b=d>0?g/d*100:e>0?g/e*100:0;l.innerHTML=`
      <tr>
        <td style="padding:10px 12px; font-size:12px; color:var(--text-0);">
          الإجمالي العام (${y})
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--text-1); font-size:12px;">
          ${p(c)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--brand); font-size:12px;">
          ${p(i)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--indigo); font-size:12.5px;">
          ${p(e)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--bad); font-size:12px;">
          ${p(s)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--text-0); font-size:12.5px;">
          ${p(d)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:#10B981; font-size:12.5px;">
          ${p(g)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:${u>0?"var(--bad)":"#10B981"}; font-size:12.5px;">
          ${u>0?p(u):`(${p(Math.abs(u))}) فائض`}
        </td>
        <td style="text-align:center; font-size:12px;">
          ${b.toFixed(0)}%
        </td>
        <td style="text-align:center; font-size:12px;" class="mono">100%</td>
        <td style="text-align:center; font-size:12px;" class="mono">${t.length}</td>
        <td colspan="3"></td>
      </tr>
    `}}export{wt as render};
