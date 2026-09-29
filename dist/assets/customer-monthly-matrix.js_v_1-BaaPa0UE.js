import{q as pt,t as mt,f as p,g as W,a as P}from"./index-ClmVJz2W.js";import{orderBy as st}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";const N=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];let nt=[],lt=[],it=[],rt=[],tt=[],et=[],v=new Date().getFullYear(),K="all",ot="all",A="both",b="with_vat",H="",k="total_sales_desc",_=null,J=null,U=null,w=[];async function wt(o,i){v=new Date().getFullYear(),_=null,H="",b="with_vat",k="total_sales_desc",o.innerHTML=`
    <!-- Top Filter Bar -->
    <div class="filterbar no-print" style="flex-wrap:wrap; gap:10px; align-items:flex-end; background:var(--bg-1); padding:14px 18px; border-radius:14px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); margin-bottom:16px;">
      
      <!-- Year Selector -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">📅 السنة المالية</label>
        <select id="cmm-year-select" onchange="window.onCmmYearChange(this.value)" style="min-width:105px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12.5px; font-weight:700;">
          <option value="2026" ${v===2026?"selected":""}>2026</option>
          <option value="2025" ${v===2025?"selected":""}>2025</option>
          <option value="2024" ${v===2024?"selected":""}>2024</option>
          <option value="2023" ${v===2023?"selected":""}>2023</option>
        </select>
      </div>

      <!-- Tax Mode Filter -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">🏛️ المعاملة الضريبية بالمصفوفة</label>
        <select id="cmm-tax-mode" onchange="window.onCmmTaxModeChange(this.value)" style="min-width:175px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px; font-weight:700;">
          <option value="with_vat" ${b==="with_vat"?"selected":""}>شامل الضريبة (بعد الضريبة 15%)</option>
          <option value="no_vat" ${b==="no_vat"?"selected":""}>قبل الضريبة (بدون الضريبة)</option>
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
            <option value="total_sales_desc" selected>الأعلى صافي مبيعات في السنة كلها 🏆</option>
            <option value="total_sales_asc">الأقل صافي مبيعات في السنة كلها 📉</option>
            <option value="total_col_desc">الأعلى تحصيلاً في السنة كلها 💵</option>
            <option value="total_col_asc">الأقل تحصيلاً في السنة كلها ⚠️</option>
            <option value="balance_desc">الأعلى مديونية (رصيد كشف الحساب) ⚠️</option>
            <option value="name_asc">أبجدياً (اسم العميل أ - ي)</option>
          </optgroup>
          <optgroup label="ترتيب حسب أعلى صافي مبيعات شهر معين">
            ${N.map((n,t)=>`<option value="month_${t}_sales_desc">الأعلى صافي مبيعات شهر ${n} 🛒</option>`).join("")}
          </optgroup>
          <optgroup label="ترتيب حسب أعلى تحصيلات شهر معين">
            ${N.map((n,t)=>`<option value="month_${t}_col_desc">الأعلى تحصيلاً شهر ${n} 📥</option>`).join("")}
          </optgroup>
          <optgroup label="ترتيب حسب الأقل صافي مبيعات أو تحصيلاً">
            ${N.map((n,t)=>`<option value="month_${t}_sales_asc">الأقل صافي مبيعات شهر ${n} 📉</option>`).join("")}
            ${N.map((n,t)=>`<option value="month_${t}_col_asc">الأقل تحصيلاً شهر ${n} ⚠️</option>`).join("")}
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
            <span style="font-size:11.5px; font-weight:700; color:var(--indigo);">✨ صافي مبيعات السنة (${v})</span>
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
              <p style="font-size:11px; color:var(--text-2); margin:3px 0 0;" id="cmm-chart-subtitle">مقارنة بصرية ديناميكية بين صافي مسحوبات المبيعات والتدفقات النقدية المحصلة</p>
            </div>
            <div style="display:flex; align-items:center; gap:14px; font-size:11.5px; font-weight:700;">
              <span style="display:inline-flex; align-items:center; gap:5px; color:#4F46E5;"><span style="width:12px; height:12px; border-radius:3px; background:#4F46E5; display:inline-block;"></span> ✨ صافي المبيعات</span>
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
          <span style="display:inline-flex; align-items:center; gap:5px;"><b style="color:var(--text-0);">السطر العلوي:</b> ✨ صافي مبيعات الشهر (المبيعات − المردودات)</span>
          <span style="display:inline-flex; align-items:center; gap:5px;"><b style="color:#10B981;">السطر السفلي:</b> 📥 المبالغ المحصلة والمقبوضة فعلياً في الشهر</span>
          <span style="display:inline-flex; align-items:center; gap:5px;"><b style="color:var(--indigo);">⚖️ رصيد كشف الحساب:</b> ناتج (الرصيد الافتتاحي + إجمالي المبيعات − المردودات − إجمالي التحصيلات)</span>
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
            ⚡ الترتيب الحالي: الأعلى صافي مبيعات
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
              <h3 style="margin:0; font-size:14px; font-weight:800; color:var(--text-0);">جدول التحليل المالي للأشهر (${v})</h3>
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
                  📅 عمود الأشهر (${v}) — صافي المبيعات والتحصيلات
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

                ${N.map((n,t)=>`
                  <th style="min-width:105px; text-align:center; padding:8px 4px; user-select:none;" id="th-month-${t}">
                    <div style="display:flex; flex-direction:column; align-items:center; gap:3px;">
                      <span style="font-size:11.5px; font-weight:800; color:var(--text-0);">${t+1} - ${n}</span>
                      <div style="display:flex; gap:3px; align-items:center;">
                        <button class="btn btn-ghost btn-icon sm" title="ترتيب حسب صافي مبيعات ${n}" onclick="window.setMonthQuickSort(${t}, 'sales')" style="padding:2px 4px; font-size:9px; height:18px; border-radius:4px; background:rgba(99,102,241,0.08); color:var(--brand);">
                          🛒 مبيعات
                        </button>
                        <button class="btn btn-ghost btn-icon sm" title="ترتيب حسب تحصيلات ${n}" onclick="window.setMonthQuickSort(${t}, 'col')" style="padding:2px 4px; font-size:9px; height:18px; border-radius:4px; background:rgba(16,185,129,0.08); color:#10B981;">
                          📥 تحصيل
                        </button>
                      </div>
                    </div>
                  </th>
                `).join("")}

                <th style="min-width:120px; text-align:left; background:rgba(99,102,241,0.08); color:var(--indigo); cursor:pointer;" onclick="window.toggleCmmHeaderSort('total_sales')">
                  <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span id="cmm-th-total-sales-label">✨ صافي مبيعات ${v}</span>
                    <span style="font-size:10px;">⇅</span>
                  </div>
                </th>

                <th style="min-width:115px; text-align:left; background:rgba(16,185,129,0.08); color:#10B981; cursor:pointer;" onclick="window.toggleCmmHeaderSort('total_col')">
                  <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span>تحصيلات ${v}</span>
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
  `,await xt(),await loadCmmData()}async function xt(){window.onCmmYearChange=o=>{v=parseInt(o,10),_=null,Q()},window.onCmmRepChange=o=>{K=o,Q()},window.onCmmZoneChange=o=>{ot=o,Q()},window.onCmmTaxModeChange=o=>{b=o,O(),dt(),Z(),X(),q(),R()},window.onCmmMetricChange=o=>{A=o,R()},window.onCmmSortChange=o=>{k=o,O(),R()},window.setMonthQuickSort=(o,i)=>{const n=k,t=`month_${o}_${i}_desc`,l=`month_${o}_${i}_asc`;n===t?k=l:k=t;const e=document.getElementById("cmm-sort-select");e&&(e.value=k),O(),R()},window.toggleCmmHeaderSort=o=>{o==="total_sales"?k=k==="total_sales_desc"?"total_sales_asc":"total_sales_desc":o==="total_col"?k=k==="total_col_desc"?"total_col_asc":"total_col_desc":o==="balance"?k=k==="balance_desc"?"balance_asc":"balance_desc":o==="name"&&(k=k==="name_asc"?"name_desc":"name_asc");const i=document.getElementById("cmm-sort-select");i&&(i.value=k),O(),R()},window.setCmmView=o=>{const i=document.getElementById("cmm-months-table-card"),n=document.getElementById("cmm-matrix-table-card"),t=document.getElementById("cmm-view-both-btn"),l=document.getElementById("cmm-view-matrix-btn"),e=document.getElementById("cmm-view-months-btn");[t,l,e].forEach(d=>{d&&(d.style.background="transparent",d.style.color="var(--text-2)")}),o==="both"?(i&&(i.style.display="block"),n&&(n.style.display="block"),t&&(t.style.background="var(--brand)",t.style.color="#fff")):o==="matrix"?(i&&(i.style.display="none"),n&&(n.style.display="block"),l&&(l.style.background="var(--brand)",l.style.color="#fff")):o==="months"&&(i&&(i.style.display="block"),n&&(n.style.display="none"),e&&(e.style.background="var(--brand)",e.style.color="#fff"))},window.scrollCmmToMatrix=()=>{const o=document.getElementById("cmm-matrix-table-card");o&&(o.style.display==="none"&&window.setCmmView("both"),o.scrollIntoView({behavior:"smooth",block:"start"}))},window.onCmmSearchInput=pt(o=>{H=(o||"").trim().toLowerCase(),R()},200),window.focusCmmCustomer=o=>{_=o,at(),Z(),X(),q(),R()},window.resetCmmCustomerFocus=()=>{_=null,at(),Z(),X(),q(),R()},window.openCmmCustomerStatement=()=>{_&&typeof window.navigate=="function"&&(window._preselectedStatementEntity={type:"customer",id:_},window.navigate("report-customer-statement"))},window.exportCmmExcel=()=>{if(!w.length)return;const o=b==="no_vat",i=[],n=["كود العميل","اسم العميل","المنطقة","المندوب","رصيد كشف الحساب الفعلي",...N.map(t=>`صافي ${t}`),`إجمالي المبيعات ${v}`,`إجمالي المردودات ${v}`,`صافي المبيعات ${v}`,`إجمالي التحصيلات ${v}`,"فجوة التحصيل","نسبة التحصيل %","اتجاه النمو"];w.forEach(t=>{const l=o?t.totalSalesSubtotal:t.totalSales,e=o?t.totalReturnsSubtotal:t.totalReturns,d=o?t.totalNetSalesSubtotal:t.totalNetSales,r=d-t.totalCollections,s=[t.customer.code||"",t.customer.name||"",t.customer.zone||"",t.customer.repName||"",t.actualStatementBalance,...t.monthlySales.map(c=>o?c.netSalesSubtotal:c.netSales),l,e,d,t.totalCollections,r,t.collectionRate.toFixed(1)+"%",t.trendLabel];i.push(s)}),window.exportXLSX({filename:`مصفوفة_صافي_مبيعات_العملاء_${v}_${mt()}`,headers:n,rows:i,sheetName:`مبيعات_${v}`})},window.printCmmReport=()=>{window.print()}}function O(){const o=k||"total_sales_desc",i=document.getElementById("cmm-active-sort-badge");N.forEach((t,l)=>{const e=document.getElementById(`th-month-${l}`);e&&(e.style.background="",e.style.boxShadow="")});const n=t=>b==="no_vat"?t.totalNetSalesSubtotal:t.totalNetSales;if(o==="total_sales_desc")w.sort((t,l)=>n(l)-n(t)),i&&(i.textContent="⚡ الترتيب الحالي: الأعلى صافي مبيعات في السنة كلها 🏆");else if(o==="total_sales_asc")w.sort((t,l)=>n(t)-n(l)),i&&(i.textContent="⚡ الترتيب الحالي: الأقل صافي مبيعات في السنة كلها 📉");else if(o==="total_col_desc")w.sort((t,l)=>l.totalCollections-t.totalCollections),i&&(i.textContent="⚡ الترتيب الحالي: الأعلى تحصيلاً في السنة كلها 💵");else if(o==="total_col_asc")w.sort((t,l)=>t.totalCollections-l.totalCollections),i&&(i.textContent="⚡ الترتيب الحالي: الأقل تحصيلاً في السنة كلها ⚠️");else if(o==="balance_desc")w.sort((t,l)=>l.actualStatementBalance-t.actualStatementBalance),i&&(i.textContent="⚡ الترتيب الحالي: الأعلى مديونية (رصيد كشف الحساب) ⚠️");else if(o==="balance_asc")w.sort((t,l)=>t.actualStatementBalance-l.actualStatementBalance),i&&(i.textContent="⚡ الترتيب الحالي: الأقل مديونية / دائن 🟢");else if(o==="name_asc")w.sort((t,l)=>(t.customer.name||"").localeCompare(l.customer.name||"","ar")),i&&(i.textContent="⚡ الترتيب الحالي: أبجدياً (أ - ي)");else if(o==="name_desc")w.sort((t,l)=>(l.customer.name||"").localeCompare(t.customer.name||"","ar")),i&&(i.textContent="⚡ الترتيب الحالي: أبجدياً (ي - أ)");else if(o.startsWith("month_")){const t=o.split("_"),l=parseInt(t[1],10),e=t[2],d=t[3],r=N[l]||"",s=document.getElementById(`th-month-${l}`);s&&(s.style.background=e==="sales"?"rgba(99,102,241,0.16)":"rgba(16,185,129,0.16)",s.style.boxShadow="inset 0 0 0 1.5px var(--brand)"),w.sort((c,m)=>{const x=e==="sales"?b==="no_vat"?c.monthlySales[l].netSalesSubtotal:c.monthlySales[l].netSales:c.monthlySales[l].collections,g=e==="sales"?b==="no_vat"?m.monthlySales[l].netSalesSubtotal:m.monthlySales[l].netSales:m.monthlySales[l].collections;return d==="desc"?g-x:x-g}),i&&(i.textContent=`⚡ الترتيب الحالي: ${d==="desc"?"الأعلى":"الأقل"} ${e==="sales"?"صافي مبيعات":"تحصيلاً"} لشهر (${r}) ${d==="desc"?"▾":"▴"}`)}}window.loadCmmData=async function(){const i=document.getElementById("cmm-tbody");i&&(i.innerHTML='<tr><td colspan="19" style="text-align:center; padding:50px; color:var(--text-2);"><div class="loading-spinner" style="margin-bottom:8px;"></div><div>جاري جلب البيانات وحساب الأرصدة من كشوف الحسابات...</div></td></tr>');try{const[n,t,l,e,d,r]=await Promise.all([W(P.customers(),[st("name")]).catch(()=>[]),W(P.salesReps(),[st("name")]).catch(()=>[]),W(P.salesInvoices()).catch(()=>[]),W(P.salesReturns()).catch(()=>[]),W(P.collections()).catch(()=>[]),W(P.receipts()).catch(()=>[])]);nt=n||[],lt=t||[],it=(l||[]).filter(s=>s.status!=="cancelled"),rt=(e||[]).filter(s=>s.status!=="cancelled"&&s.status!=="void"),tt=d||[],et=(r||[]).filter(s=>s.status!=="cancelled"&&(!s.entityType||s.entityType==="customer")),gt(),Q()}catch(n){console.error("[CustomerMatrix] Data load error:",n),i&&(i.innerHTML=`<tr><td colspan="19" style="text-align:center; color:var(--bad); padding:30px;">فشل تحميل البيانات: ${n.message}</td></tr>`)}};function gt(){const o=document.getElementById("cmm-rep-select");if(o){const n=o.value;o.innerHTML='<option value="all">كل المناديب (مجمع)</option>'+lt.map(t=>`<option value="${t.id}">${t.name}</option>`).join(""),n&&(o.value=n)}const i=document.getElementById("cmm-zone-select");if(i){const n=new Set;nt.forEach(l=>{l.zone&&l.zone.trim()&&n.add(l.zone.trim())});const t=Array.from(n).sort();i.innerHTML='<option value="all">كل المناطق</option>'+t.map(l=>`<option value="${l}">${l}</option>`).join("")}}function Q(){const o=String(v);w=nt.filter(n=>{if(K!=="all"&&n.repId!==K){const t=lt.find(l=>l.id===K);if(!t||n.repName!==t.name)return!1}return!(ot!=="all"&&n.zone!==ot)}).map(n=>{const t=Array(12).fill(0).map(()=>({sales:0,salesSubtotal:0,salesVat:0,returns:0,returnsSubtotal:0,returnsVat:0,netSales:0,netSalesSubtotal:0,netSalesVat:0,collections:0}));let l=0,e=0,d=0,r=0,s=0;const c=(n.name||"").trim().toLowerCase();it.forEach(a=>{if(!(a.customerId===n.id||a.customerName&&a.customerName.trim().toLowerCase()===c))return;const B=parseFloat(a.totalWithVat!==void 0?a.totalWithVat:a.total||a.grandTotal||0),M=parseFloat(a.subtotal!==void 0?a.subtotal:B-parseFloat(a.taxTotal||a.vatAmount||0)),F=parseFloat(a.taxTotal!==void 0?a.taxTotal:a.vatAmount!==void 0?a.vatAmount:B-M);l+=B;const j=a.date||(a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:"");if(j.startsWith(o)){const I=parseInt(j.slice(5,7),10)-1;I>=0&&I<12&&(t[I].sales+=B,t[I].salesSubtotal+=M,t[I].salesVat+=F)}a.paidAmount>0&&(et.some(E=>(E.date||(E.createdAt?.toDate?E.createdAt.toDate().toISOString().split("T")[0]:""))===j&&(E.targetId===n.id||E.customerName&&E.customerName.trim().toLowerCase()===c)&&Math.abs((E.amount||0)-a.paidAmount)<.01)||tt.some(E=>(E.date||(E.createdAt?.toDate?E.createdAt.toDate().toISOString().split("T")[0]:""))===j&&(E.customerId===n.id||E.customerName&&E.customerName.trim().toLowerCase()===c)&&Math.abs((E.amount||0)-a.paidAmount)<.01)||(s+=parseFloat(a.paidAmount||0)))}),rt.forEach(a=>{if(!(a.customerId===n.id||a.customerName&&a.customerName.trim().toLowerCase()===c))return;const B=parseFloat(a.totalWithVat!==void 0?a.totalWithVat:a.totalAmount||a.grandTotal||a.total||0),M=parseFloat(a.subtotal!==void 0?a.subtotal:B-parseFloat(a.taxTotal||a.vatAmount||0)),F=parseFloat(a.taxTotal!==void 0?a.taxTotal:a.vatAmount!==void 0?a.vatAmount:B-M);e+=B;const j=a.date||a.returnDate||(a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:"");if(j.startsWith(o)){const I=parseInt(j.slice(5,7),10)-1;I>=0&&I<12&&(t[I].returns+=B,t[I].returnsSubtotal+=M,t[I].returnsVat+=F)}}),tt.forEach(a=>{if(!(a.customerId===n.id||a.customerName&&a.customerName.trim().toLowerCase()===c))return;const B=parseFloat(a.amount||0);d+=B;const M=a.date||(a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:"");if(M.startsWith(o)){const F=parseInt(M.slice(5,7),10)-1;F>=0&&F<12&&(t[F].collections+=B)}}),et.forEach(a=>{if(!(a.targetId===n.id||a.customerId===n.id||a.customerName&&a.customerName.trim().toLowerCase()===c))return;const B=parseFloat(a.amount||0);r+=B;const M=a.date||(a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:"");if(M.startsWith(o)){const F=parseInt(M.slice(5,7),10)-1;F>=0&&F<12&&(t[F].collections+=B)}});const m=parseFloat(n.openingBalance||0),x=Math.round((m+l-e-d-r-s)*100)/100;t.forEach(a=>{a.netSales=a.sales-a.returns,a.netSalesSubtotal=a.salesSubtotal-a.returnsSubtotal,a.netSalesVat=a.salesVat-a.returnsVat});const g=t.reduce((a,$)=>a+$.sales,0),f=t.reduce((a,$)=>a+$.salesSubtotal,0),S=t.reduce((a,$)=>a+$.salesVat,0),h=t.reduce((a,$)=>a+$.returns,0),T=t.reduce((a,$)=>a+$.returnsSubtotal,0),y=t.reduce((a,$)=>a+$.returnsVat,0),u=g-h,D=f-T,z=t.reduce((a,$)=>a+$.collections,0),G=u>0?z/u*100:g>0?z/g*100:z>0?100:0,V=t.slice(0,6).reduce((a,$)=>a+$.sales,0),C=t.slice(6,12).reduce((a,$)=>a+$.sales,0);let L="🟢 مستقر",Y="good";return g>0?C>V*1.15?(L="📈 صاعد",Y="indigo"):C<V*.7&&V>0&&(L="📉 متراجع",Y="bad"):(L="⚪ غير نشط",Y="neutral"),{customer:n,monthlySales:t,totalSales:g,totalSalesSubtotal:f,totalSalesVat:S,totalReturns:h,totalReturnsSubtotal:T,totalReturnsVat:y,totalNetSales:u,totalNetSalesSubtotal:D,totalCollections:z,collectionRate:G,trendLabel:L,trendClass:Y,actualStatementBalance:x}}),O(),dt(),at(),Z(),X(),q(),R()}function dt(){const o=_?w.filter(y=>y.customer.id===_):w,i=o.reduce((y,u)=>y+u.totalSales,0),n=o.reduce((y,u)=>y+u.totalSalesSubtotal,0),t=o.reduce((y,u)=>y+u.totalSalesVat,0),l=o.reduce((y,u)=>y+u.totalReturns,0),e=o.reduce((y,u)=>y+u.totalReturnsSubtotal,0),d=o.reduce((y,u)=>y+u.totalNetSales,0),r=o.reduce((y,u)=>y+u.totalNetSalesSubtotal,0),s=o.reduce((y,u)=>y+u.totalCollections,0),c=d-s,m=d>0?s/d*100:i>0?s/i*100:0,x=o.reduce((y,u)=>y+u.actualStatementBalance,0),g=b==="no_vat"?r:d,f=b==="no_vat"?n:i,S=b==="no_vat"?e:l;document.getElementById("cmm-kpi-sales").textContent=p(g),document.getElementById("cmm-kpi-sales-avg").textContent=b==="no_vat"?`فواتير: ${p(f)} | مردودات: ${p(S)}`:`فواتير: ${p(f)} | مردودات: ${p(S)} (الضريبة: ${p(t)})`,document.getElementById("cmm-kpi-collections").textContent=p(s),document.getElementById("cmm-kpi-col-avg").textContent=`متوسط شهري: ${p(s/12)}`;const h=document.getElementById("cmm-kpi-rate");h.textContent=`${m.toFixed(1)}%`,h.style.color=m>=90?"#10B981":m>=70?"#F59E0B":"#EF4444",document.getElementById("cmm-kpi-gap").textContent=`فجوة التحصيل: ${p(c)} (صافي المستحق - المقبوض)`;const T=document.getElementById("cmm-kpi-total-balance");T.textContent=p(x),T.style.color=x>0?"#EF4444":x<0?"#10B981":"#8B5CF6"}function at(){const o=document.getElementById("cmm-focus-banner");if(o){if(_){const i=w.find(n=>n.customer.id===_);if(i){const n=i.customer;document.getElementById("cmm-focus-name").textContent=`${n.name}`,document.getElementById("cmm-focus-details").textContent=`كود: ${n.code||"—"} | المندوب: ${n.repName||"—"} | المنطقة: ${n.zone||"—"} | رصيد كشف الحساب الفعلي الصافي: ${p(i.actualStatementBalance)}`,o.style.display="block",document.getElementById("cmm-chart-title").textContent=`👤 منحنى أداء العميل: ${n.name} (${v})`,document.getElementById("cmm-chart-subtitle").textContent="تحليل تفصيلي لمشتريات وتحصيلات العميل على مدار أشهر السنة";return}}o.style.display="none",document.getElementById("cmm-chart-title").textContent=`📊 منحنى المبيعات والتحصيلات المجمعة لسنة ${v}`,document.getElementById("cmm-chart-subtitle").textContent="مقارنة بصرية ديناميكية بين صافي مسحوبات المبيعات والتدفقات النقدية المحصلة"}}function Z(){const o=document.getElementById("cmm-trend-canvas");if(!o||typeof Chart>"u")return;const i=Array(12).fill(0),n=Array(12).fill(0),t=Array(12).fill(0);(_?w.filter(s=>s.customer.id===_):w).forEach(s=>{s.monthlySales.forEach((c,m)=>{const x=b==="no_vat"?c.netSalesSubtotal:c.netSales,g=b==="no_vat"?c.returnsSubtotal:c.returns;i[m]+=x,n[m]+=c.collections,t[m]+=g})}),J&&J.destroy();const e=o.getContext("2d"),d=e.createLinearGradient(0,0,0,320);d.addColorStop(0,"rgba(79, 70, 229, 0.40)"),d.addColorStop(1,"rgba(79, 70, 229, 0.0)");const r=e.createLinearGradient(0,0,0,320);r.addColorStop(0,"rgba(16, 185, 129, 0.30)"),r.addColorStop(1,"rgba(16, 185, 129, 0.0)"),J=new Chart(o,{type:"line",data:{labels:N,datasets:[{label:"صافي المبيعات (المبيعات − المردودات)",data:i,borderColor:"#4F46E5",backgroundColor:d,borderWidth:3.5,tension:.38,pointRadius:5.5,pointHoverRadius:9,pointBackgroundColor:"#4F46E5",pointBorderColor:"#FFFFFF",pointBorderWidth:2.5,fill:!0},{label:"التحصيلات المقبوضة",data:n,borderColor:"#10B981",backgroundColor:r,borderWidth:3.5,borderDash:[6,4],tension:.38,pointRadius:5.5,pointHoverRadius:9,pointBackgroundColor:"#10B981",pointBorderColor:"#FFFFFF",pointBorderWidth:2.5,fill:!0},{label:"المردودات المسترجعة",data:t,borderColor:"#EF4444",backgroundColor:"rgba(239, 68, 68, 0.1)",borderWidth:2,borderDash:[3,3],tension:.3,pointRadius:4,pointBackgroundColor:"#EF4444",fill:!1}]},options:{responsive:!0,maintainAspectRatio:!1,interaction:{mode:"index",intersect:!1},plugins:{legend:{display:!1},tooltip:{backgroundColor:"rgba(15, 23, 42, 0.95)",titleFont:{family:"IBM Plex Sans Arabic",size:13,weight:"bold"},bodyFont:{family:"IBM Plex Mono",size:12.5},padding:14,cornerRadius:10,borderColor:"rgba(255, 255, 255, 0.12)",borderWidth:1,callbacks:{label:function(s){const c=s.raw||0;return`  ${s.dataset.label}: ${p(c)}`},afterBody:function(s){const c=s[0]?.raw||0,m=s[1]?.raw||0,x=c-m;return`  ⚖️ فجوة التحصيل (صافي − مقبوض): ${p(x)}`}}}},scales:{x:{grid:{color:"rgba(150, 150, 150, 0.08)"},ticks:{font:{family:"IBM Plex Sans Arabic",size:11.5,weight:"600"},color:"var(--text-2)"}},y:{grid:{color:"rgba(150, 150, 150, 0.08)"},ticks:{font:{family:"IBM Plex Mono",size:11},color:"var(--text-2)",callback:s=>s>=1e3?`${(s/1e3).toFixed(0)}k`:s}}}}})}function X(){const o=document.getElementById("cmm-donut-canvas");if(!o||typeof Chart>"u")return;U&&U.destroy();const i=document.getElementById("cmm-donut-legend"),n=document.getElementById("cmm-donut-subtitle");let t=[],l=[];const e=["#4F46E5","#10B981","#F59E0B","#EC4899","#8B5CF6","#06B6D4","#64748B"];if(_){const r=w.find(s=>s.customer.id===_);r&&(n&&(n.textContent=`هيكل حساب ${r.customer.name}`),t=["صافي المبيعات","التحصيلات","المردودات"],l=[b==="no_vat"?r.totalNetSalesSubtotal:r.totalNetSales,r.totalCollections,b==="no_vat"?r.totalReturnsSubtotal:r.totalReturns])}else{n&&(n.textContent=`أعلى 5 مساهمات في صافي مبيعات ${v}`);const r=w.slice(0,5);t=r.map(c=>c.customer.name),l=r.map(c=>b==="no_vat"?c.totalNetSalesSubtotal:c.totalNetSales);const s=w.slice(5).reduce((c,m)=>c+(b==="no_vat"?m.totalNetSalesSubtotal:m.totalNetSales),0);s>0&&(t.push("باقي العملاء"),l.push(s))}const d=l.reduce((r,s)=>r+s,0);U=new Chart(o,{type:"doughnut",data:{labels:t,datasets:[{data:l,backgroundColor:e.slice(0,t.length),borderWidth:2,borderColor:"var(--bg-card)"}]},options:{responsive:!0,maintainAspectRatio:!1,cutout:"68%",plugins:{legend:{display:!1},tooltip:{callbacks:{label:r=>{const s=r.raw||0,c=d>0?(s/d*100).toFixed(1):"0";return` ${r.label}: ${p(s)} (${c}%)`}}}}}}),i&&(i.innerHTML=t.map((r,s)=>{const c=l[s]||0,m=d>0?(c/d*100).toFixed(1):"0";return`
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="display:inline-flex; align-items:center; gap:6px;">
            <span style="width:8px; height:8px; border-radius:50%; background:${e[s]}; display:inline-block;"></span>
            <span style="max-width:130px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r}</span>
          </span>
          <span class="mono font-bold" style="font-size:11px;">${m}%</span>
        </div>
      `}).join(""))}function R(){const o=document.getElementById("cmm-tbody"),i=document.getElementById("cmm-tfoot");if(!o)return;let n=w;H&&(n=n.filter(e=>(e.customer.name||"").toLowerCase().includes(H)||(e.customer.code||"").toLowerCase().includes(H)||(e.customer.phone||"").includes(H)||(e.customer.repName||"").toLowerCase().includes(H))),document.getElementById("cmm-table-rows-count").textContent=`عرض ${n.length} من أصل ${w.length} عميل`;const t=document.getElementById("cmm-th-total-sales-label");if(t&&(t.textContent=b==="no_vat"?`✨ صافي مبيعات ${v} (قبل الضريبة)`:`✨ صافي مبيعات ${v} (شامل الضريبة)`),!n.length){o.innerHTML='<tr><td colspan="19" style="text-align:center; padding:40px; color:var(--text-2);">لا توجد سجلات تطابق الفلتر والبحث الحالي</td></tr>',i&&(i.innerHTML="");return}let l=1;if(n.forEach(e=>{e.monthlySales.forEach(d=>{const r=b==="no_vat"?d.salesSubtotal:d.sales,s=b==="no_vat"?d.netSalesSubtotal:d.netSales,c=A==="collections"?d.collections:A==="sales"?r:s;c>l&&(l=c)})}),o.innerHTML=n.map((e,d)=>{const r=e.customer,s=_===r.id,c=e.monthlySales.map((h,T)=>{const y=b==="no_vat"?h.salesSubtotal:h.sales,u=b==="no_vat"?h.returnsSubtotal:h.returns,D=b==="no_vat"?h.netSalesSubtotal:h.netSales,z=A==="collections"?h.collections:A==="sales"?y:D,G=k.startsWith(`month_${T}_`),V=z>0?Math.min(.28,Math.max(.04,z/l*.35)):0;let C=z>0?`background: rgba(79, 70, 229, ${V});`:"";return G&&(C=z>0?`background: rgba(99, 102, 241, ${Math.max(.12,V+.08)});`:"background: rgba(99, 102, 241, 0.03);"),A==="both"?`
          <td style="${C} text-align:center; padding:6px 6px; border-left:1px solid var(--border-soft); font-size:11px;">
            ${y>0||u>0?`
              <div style="display:flex; justify-content:space-between; align-items:center; gap:2px;">
                <span style="font-size:9.5px; color:var(--text-2);" title="صافي المبيعات بعد خصم المردودات">✨</span>
                <span class="mono font-bold" style="color:${D<0?"var(--bad)":"var(--text-0)"};">${p(D)}</span>
              </div>
              ${u>0?`
                <div style="font-size:8.5px; color:var(--bad); text-align:left; line-height:1; margin-top:1px;" title="مردودات مخصومة: ${p(u)}">
                  ↩️ -${p(u)}
                </div>
              `:""}
            `:'<div style="color:var(--text-3); font-size:10px;">—</div>'}
            ${h.collections>0?`
              <div style="display:flex; justify-content:space-between; align-items:center; gap:2px; margin-top:2px;">
                <span style="font-size:9.5px; color:#10B981;">📥</span>
                <span class="mono font-bold" style="color:#10B981;">${p(h.collections)}</span>
              </div>
            `:""}
          </td>
        `:`
        <td style="${C} text-align:center; padding:8px 4px; border-left:1px solid var(--border-soft);">
          <span class="mono ${z>0?"font-bold":"dim"}" style="font-size:11.5px; color:${z>0?"var(--text-0)":"var(--text-3)"};">
            ${z!==0?p(z):"—"}
          </span>
        </td>
      `}).join(""),m=e.actualStatementBalance,x=m>0,g=m<0,f=b==="no_vat"?e.totalNetSalesSubtotal:e.totalNetSales,S=b==="no_vat"?e.totalReturnsSubtotal:e.totalReturns;return`
      <tr onclick="window.focusCmmCustomer('${r.id}')"
          style="cursor:pointer; transition:background 0.15s; ${s?"background:rgba(99,102,241,0.14) !important; outline:2px solid var(--brand);":""}"
          class="cmm-row ${s?"active":""}">
        
        <!-- Sticky Customer Column -->
        <td style="position:sticky; right:0; z-index:5; background:var(--bg-card); box-shadow:-2px 0 6px rgba(0,0,0,0.06); padding:8px 12px;">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <div style="font-weight:800; font-size:12.5px; color:${s?"var(--brand)":"var(--text-0)"};">${r.name}</div>
            ${d<3&&k.includes("desc")?`<span style="font-size:13px;">${d===0?"🥇":d===1?"🥈":"🥉"}</span>`:""}
          </div>
          <div style="font-size:10.5px; color:var(--text-2); margin-top:2px; display:flex; gap:6px; align-items:center;">
            <span>${r.code?`[${r.code}]`:""}</span>
            <span>👔 ${r.repName||"—"}</span>
            <span>📍 ${r.zone||"—"}</span>
          </div>
        </td>

        <!-- Exact Statement Balance (Calculated Dynamically) -->
        <td style="text-align:left; font-size:11.5px; background:rgba(99,102,241,0.03);">
          <span class="mono font-bold" style="color:${x?"var(--bad)":g?"#10B981":"var(--text-2)"}; font-size:12px;">
            ${x?p(m):g?`(${p(Math.abs(m))}) دائن`:"0.00"}
          </span>
        </td>

        <!-- 12 Month Cells -->
        ${c}

        <!-- Total Net Sales of Year -->
        <td class="mono font-bold" style="text-align:left; color:var(--indigo); background:rgba(99,102,241,0.04); font-size:12px;">
          <div>${p(f)}</div>
          ${e.totalReturns>0?`
            <div style="font-size:9px; font-weight:normal; color:var(--bad);" title="إجمالي مردودات السنة المسترجعة">
              ↩️ مردود: ${p(S)}
            </div>
          `:""}
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
          <button class="btn btn-icon sm btn-ghost" title="كشف الحساب التفصيلي" onclick="window.focusCmmCustomer('${r.id}'); window.openCmmCustomerStatement();">
            📊
          </button>
        </td>

      </tr>
    `}).join(""),i){const e=Array(12).fill(0),d=Array(12).fill(0);n.forEach(x=>{x.monthlySales.forEach((g,f)=>{const S=b==="no_vat"?g.salesSubtotal:g.sales,h=b==="no_vat"?g.netSalesSubtotal:g.netSales;e[f]+=A==="collections"?g.collections:A==="sales"?S:h,d[f]+=g.collections})});const r=n.reduce((x,g)=>x+(b==="no_vat"?g.totalNetSalesSubtotal:g.totalNetSales),0),s=n.reduce((x,g)=>x+g.totalCollections,0),c=r>0?s/r*100:0,m=n.reduce((x,g)=>x+g.actualStatementBalance,0);i.innerHTML=`
      <tr>
        <td style="position:sticky; right:0; z-index:11; background:var(--bg-2); padding:10px 12px; font-size:12px; color:var(--text-0);">
          الإجمالي العام (${n.length} عميل)
        </td>
        <td class="mono font-bold" style="text-align:left; font-size:12px; color:${m>0?"var(--bad)":"var(--text-0)"};">
          ${p(m)}
        </td>
        ${e.map(x=>`
          <td class="mono font-bold" style="text-align:center; font-size:11.5px; color:var(--text-0); padding:8px 4px;">
            ${x!==0?p(x):"0.00"}
          </td>
        `).join("")}
        <td class="mono font-bold" style="text-align:left; color:var(--indigo); font-size:12.5px;">
          ${p(r)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:#10B981; font-size:12.5px;">
          ${p(s)}
        </td>
        <td style="text-align:center; font-size:11.5px; color:var(--text-0);">
          ${c.toFixed(0)}%
        </td>
        <td colspan="2"></td>
      </tr>
    `}}function q(){const o=document.getElementById("cmm-monthly-breakdown-tbody"),i=document.getElementById("cmm-monthly-breakdown-tfoot");if(!o)return;const n=_?w.filter(e=>e.customer.id===_):w,t=n.reduce((e,d)=>e+d.totalSales,0),l=Array(12).fill(0).map((e,d)=>{let r=0,s=0,c=0,m=0,x=0,g=0,f=0,S=0,h=0,T=0,y={name:"—",amount:0},u={name:"—",amount:0};n.forEach(V=>{const C=V.monthlySales[d];r+=C.sales,s+=C.salesSubtotal,c+=C.salesVat,m+=C.returns,x+=C.returnsSubtotal,g+=C.returnsVat,f+=C.netSales,S+=C.netSalesSubtotal,h+=C.collections,(C.sales>0||C.collections>0||C.returns>0)&&T++;const L=b==="no_vat"?C.netSalesSubtotal:C.netSales;L>y.amount&&(y={name:V.customer.name,amount:L}),C.collections>u.amount&&(u={name:V.customer.name,amount:C.collections})});const D=f-h,z=f>0?h/f*100:r>0?h/r*100:h>0?100:0,G=t>0?r/t*100:0;return{mIdx:d,monthName:N[d],sales:r,salesSubtotal:s,salesVat:c,returns:m,returnsSubtotal:x,returnsVat:g,netSales:f,netSalesSubtotal:S,collections:h,gap:D,rate:z,share:G,activeCusts:T,topBuyer:y,topPayer:u}});if(o.innerHTML=l.map(e=>{const d=k.startsWith(`month_${e.mIdx}_`),r=e.rate>=95?"good":e.rate>=70?"warn":e.sales===0?"neutral":"bad",s=e.gap>0?"var(--bad)":e.gap<0?"#10B981":"var(--text-2)";return`
      <tr style="transition:background 0.15s; ${d?"background:rgba(99,102,241,0.08); font-weight:700;":""}">
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
          <span class="badge ${r}" style="font-size:10.5px; font-weight:800;">
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
    `}).join(""),i){const e=l.reduce((f,S)=>f+S.sales,0),d=l.reduce((f,S)=>f+S.salesSubtotal,0),r=l.reduce((f,S)=>f+S.salesVat,0),s=l.reduce((f,S)=>f+S.returns,0),c=l.reduce((f,S)=>f+S.netSales,0),m=l.reduce((f,S)=>f+S.collections,0),x=c-m,g=c>0?m/c*100:e>0?m/e*100:0;i.innerHTML=`
      <tr>
        <td style="padding:10px 12px; font-size:12px; color:var(--text-0);">
          الإجمالي العام (${v})
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--text-1); font-size:12px;">
          ${p(d)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--brand); font-size:12px;">
          ${p(r)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--indigo); font-size:12.5px;">
          ${p(e)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--bad); font-size:12px;">
          ${p(s)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--text-0); font-size:12.5px;">
          ${p(c)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:#10B981; font-size:12.5px;">
          ${p(m)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:${x>0?"var(--bad)":"#10B981"}; font-size:12.5px;">
          ${x>0?p(x):`(${p(Math.abs(x))}) فائض`}
        </td>
        <td style="text-align:center; font-size:12px;">
          ${g.toFixed(0)}%
        </td>
        <td style="text-align:center; font-size:12px;" class="mono">100%</td>
        <td style="text-align:center; font-size:12px;" class="mono">${n.length}</td>
        <td colspan="3"></td>
      </tr>
    `}}export{wt as render};
