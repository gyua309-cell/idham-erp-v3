import{q as ot,t as nt,f as m,g as A,a as D}from"./index-_yt5fKo2.js";import{orderBy as J}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";const B=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];let X=[],q=[],U=[],tt=[],P=[],G=[],f=new Date().getFullYear(),j="all",O="all",_="both",F="",u="total_sales_desc",y=null,V=null,W=null,b=[];async function xt(o,l){f=new Date().getFullYear(),y=null,F="",u="total_sales_desc",o.innerHTML=`
    <!-- Top Filter Bar -->
    <div class="filterbar no-print" style="flex-wrap:wrap; gap:10px; align-items:flex-end; background:var(--bg-1); padding:14px 18px; border-radius:14px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); margin-bottom:16px;">
      
      <!-- Year Selector -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">📅 السنة المالية</label>
        <select id="cmm-year-select" onchange="window.onCmmYearChange(this.value)" style="min-width:105px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12.5px; font-weight:700;">
          <option value="2026" ${f===2026?"selected":""}>2026</option>
          <option value="2025" ${f===2025?"selected":""}>2025</option>
          <option value="2024" ${f===2024?"selected":""}>2024</option>
          <option value="2023" ${f===2023?"selected":""}>2023</option>
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
            ${B.map((t,e)=>`<option value="month_${e}_sales_desc">الأعلى مبيعات شهر ${t} 🛒</option>`).join("")}
          </optgroup>
          <optgroup label="ترتيب حسب أعلى تحصيلات شهر معين">
            ${B.map((t,e)=>`<option value="month_${e}_col_desc">الأعلى تحصيلاً شهر ${t} 📥</option>`).join("")}
          </optgroup>
          <optgroup label="ترتيب حسب الأقل مبيعات أو تحصيلاً">
            ${B.map((t,e)=>`<option value="month_${e}_sales_asc">الأقل مبيعات شهر ${t} 📉</option>`).join("")}
            ${B.map((t,e)=>`<option value="month_${e}_col_asc">الأقل تحصيلاً شهر ${t} ⚠️</option>`).join("")}
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
            <span style="font-size:11.5px; font-weight:700; color:var(--indigo);">💳 إجمالي مبيعات السنة (${f})</span>
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
              <h3 style="margin:0; font-size:14px; font-weight:800; color:var(--text-0);">جدول التحليل المالي للأشهر (${f})</h3>
              <p style="margin:2px 0 0; font-size:11px; color:var(--text-2);">توزيع أداء المبيعات والمردودات وصافي التدفقات والتحصيلات وأفضل العملاء شهراً بشهر</p>
            </div>
          </div>
          <div style="font-size:11.5px; font-weight:700; color:var(--brand);">
            💡 انقر على زر "فرز المصفوفة" لأي شهر لترتيب جدول العملاء مباشرة حسب ذلك الشهر
          </div>
        </div>
        <div class="table-container" style="overflow:auto;">
          <table class="data-dense" id="cmm-monthly-breakdown-table" style="width:100%; border-collapse:collapse; min-width:1150px;">
            <thead style="background:var(--bg-1);">
              <tr>
                <th style="width:120px; text-align:right; padding:10px 12px; font-weight:800;">📅 عمود الشهر</th>
                <th style="min-width:110px; text-align:left; color:var(--indigo);">🧾 إجمالي المبيعات</th>
                <th style="min-width:95px; text-align:left; color:var(--bad);">↩️ المردودات</th>
                <th style="min-width:110px; text-align:left; color:var(--text-0);">✨ صافي المبيعات</th>
                <th style="min-width:110px; text-align:left; color:#10B981;">📥 التحصيلات المقبوضة</th>
                <th style="min-width:110px; text-align:left; color:var(--text-1);">⚖️ فجوة الشهر</th>
                <th style="width:95px; text-align:center;">🎯 نسبة التحصيل</th>
                <th style="width:90px; text-align:center;">📊 حصة السنة %</th>
                <th style="width:90px; text-align:center;">👥 عملاء نشطون</th>
                <th style="min-width:160px; text-align:right;">🥇 أعلى عميل مبيعات</th>
                <th style="min-width:160px; text-align:right;">💵 أعلى عميل تحصيلاً</th>
                <th style="width:110px; text-align:center;" class="no-print">⚡ فرز المصفوفة</th>
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
                  📅 عمود الأشهر (${f}) — مبيعات وتحصيلات الـ 12 شهراً
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

                ${B.map((t,e)=>`
                  <th style="min-width:105px; text-align:center; padding:8px 4px; user-select:none;" id="th-month-${e}">
                    <div style="display:flex; flex-direction:column; align-items:center; gap:3px;">
                      <span style="font-size:11.5px; font-weight:800; color:var(--text-0);">${e+1} - ${t}</span>
                      <div style="display:flex; gap:3px; align-items:center;">
                        <button class="btn btn-ghost btn-icon sm" title="ترتيب حسب مبيعات ${t}" onclick="window.setMonthQuickSort(${e}, 'sales')" style="padding:2px 4px; font-size:9px; height:18px; border-radius:4px; background:rgba(99,102,241,0.08); color:var(--brand);">
                          🧾 مبيعات
                        </button>
                        <button class="btn btn-ghost btn-icon sm" title="ترتيب حسب تحصيلات ${t}" onclick="window.setMonthQuickSort(${e}, 'col')" style="padding:2px 4px; font-size:9px; height:18px; border-radius:4px; background:rgba(16,185,129,0.08); color:#10B981;">
                          📥 تحصيل
                        </button>
                      </div>
                    </div>
                  </th>
                `).join("")}

                <th style="min-width:115px; text-align:left; background:rgba(99,102,241,0.08); color:var(--indigo); cursor:pointer;" onclick="window.toggleCmmHeaderSort('total_sales')">
                  <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span>مبيعات ${f}</span>
                    <span style="font-size:10px;">⇅</span>
                  </div>
                </th>

                <th style="min-width:115px; text-align:left; background:rgba(16,185,129,0.08); color:#10B981; cursor:pointer;" onclick="window.toggleCmmHeaderSort('total_col')">
                  <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span>تحصيلات ${f}</span>
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
  `,await at(),await loadCmmData()}async function at(){window.onCmmYearChange=o=>{f=parseInt(o,10),y=null,H()},window.onCmmRepChange=o=>{j=o,H()},window.onCmmZoneChange=o=>{O=o,H()},window.onCmmMetricChange=o=>{_=o,E()},window.onCmmSortChange=o=>{u=o,N(),E()},window.setMonthQuickSort=(o,l)=>{const t=u,e=`month_${o}_${l}_desc`,a=`month_${o}_${l}_asc`;t===e?u=a:u=e;const n=document.getElementById("cmm-sort-select");n&&(n.value=u),N(),E()},window.toggleCmmHeaderSort=o=>{o==="total_sales"?u=u==="total_sales_desc"?"total_sales_asc":"total_sales_desc":o==="total_col"?u=u==="total_col_desc"?"total_col_asc":"total_col_desc":o==="balance"?u=u==="balance_desc"?"balance_asc":"balance_desc":o==="name"&&(u=u==="name_asc"?"name_desc":"name_asc");const l=document.getElementById("cmm-sort-select");l&&(l.value=u),N(),E()},window.setCmmView=o=>{const l=document.getElementById("cmm-months-table-card"),t=document.getElementById("cmm-matrix-table-card"),e=document.getElementById("cmm-view-both-btn"),a=document.getElementById("cmm-view-matrix-btn"),n=document.getElementById("cmm-view-months-btn");[e,a,n].forEach(c=>{c&&(c.style.background="transparent",c.style.color="var(--text-2)")}),o==="both"?(l&&(l.style.display="block"),t&&(t.style.display="block"),e&&(e.style.background="var(--brand)",e.style.color="#fff")):o==="matrix"?(l&&(l.style.display="none"),t&&(t.style.display="block"),a&&(a.style.background="var(--brand)",a.style.color="#fff")):o==="months"&&(l&&(l.style.display="block"),t&&(t.style.display="none"),n&&(n.style.background="var(--brand)",n.style.color="#fff"))},window.scrollCmmToMatrix=()=>{const o=document.getElementById("cmm-matrix-table-card");o&&(o.style.display==="none"&&window.setCmmView("both"),o.scrollIntoView({behavior:"smooth",block:"start"}))},window.onCmmSearchInput=ot(o=>{F=(o||"").trim().toLowerCase(),E()},200),window.focusCmmCustomer=o=>{y=o,Y(),K(),Q(),Z(),E()},window.resetCmmCustomerFocus=()=>{y=null,Y(),K(),Q(),Z(),E()},window.openCmmCustomerStatement=()=>{y&&typeof window.navigate=="function"&&(window._preselectedStatementEntity={type:"customer",id:y},window.navigate("report-customer-statement"))},window.exportCmmExcel=()=>{if(!b.length)return;const o=[],l=["كود العميل","اسم العميل","المنطقة","المندوب","رصيد كشف الحساب الفعلي",...B,`إجمالي مبيعات ${f}`,`إجمالي تحصيلات ${f}`,"نسبة التحصيل %","اتجاه النمو"];b.forEach(t=>{const e=[t.customer.code||"",t.customer.name||"",t.customer.zone||"",t.customer.repName||"",t.actualStatementBalance,...t.monthlySales.map(a=>a.sales),t.totalSales,t.totalCollections,t.collectionRate.toFixed(1)+"%",t.trendLabel];o.push(e)}),window.exportXLSX({filename:`مصفوفة_مبيعات_العملاء_${f}_${nt()}`,headers:l,rows:o,sheetName:`مبيعات_${f}`})},window.printCmmReport=()=>{window.print()}}function N(){const o=u||"total_sales_desc",l=document.getElementById("cmm-active-sort-badge");if(B.forEach((t,e)=>{const a=document.getElementById(`th-month-${e}`);a&&(a.style.background="",a.style.boxShadow="")}),o==="total_sales_desc")b.sort((t,e)=>e.totalSales-t.totalSales),l&&(l.textContent="⚡ الترتيب الحالي: الأعلى مبيعات في السنة كلها 🏆");else if(o==="total_sales_asc")b.sort((t,e)=>t.totalSales-e.totalSales),l&&(l.textContent="⚡ الترتيب الحالي: الأقل مبيعات في السنة كلها 📉");else if(o==="total_col_desc")b.sort((t,e)=>e.totalCollections-t.totalCollections),l&&(l.textContent="⚡ الترتيب الحالي: الأعلى تحصيلاً في السنة كلها 💵");else if(o==="total_col_asc")b.sort((t,e)=>t.totalCollections-e.totalCollections),l&&(l.textContent="⚡ الترتيب الحالي: الأقل تحصيلاً في السنة كلها ⚠️");else if(o==="balance_desc")b.sort((t,e)=>e.actualStatementBalance-t.actualStatementBalance),l&&(l.textContent="⚡ الترتيب الحالي: الأعلى مديونية (رصيد كشف الحساب) ⚠️");else if(o==="balance_asc")b.sort((t,e)=>t.actualStatementBalance-e.actualStatementBalance),l&&(l.textContent="⚡ الترتيب الحالي: الأقل مديونية / دائن 🟢");else if(o==="name_asc")b.sort((t,e)=>(t.customer.name||"").localeCompare(e.customer.name||"","ar")),l&&(l.textContent="⚡ الترتيب الحالي: أبجدياً (أ - ي)");else if(o==="name_desc")b.sort((t,e)=>(e.customer.name||"").localeCompare(t.customer.name||"","ar")),l&&(l.textContent="⚡ الترتيب الحالي: أبجدياً (ي - أ)");else if(o.startsWith("month_")){const t=o.split("_"),e=parseInt(t[1],10),a=t[2],n=t[3],c=B[e]||"",r=document.getElementById(`th-month-${e}`);r&&(r.style.background=a==="sales"?"rgba(99,102,241,0.16)":"rgba(16,185,129,0.16)",r.style.boxShadow="inset 0 0 0 1.5px var(--brand)"),b.sort((s,d)=>{const p=a==="sales"?s.monthlySales[e].sales:s.monthlySales[e].collections,x=a==="sales"?d.monthlySales[e].sales:d.monthlySales[e].collections;return n==="desc"?x-p:p-x}),l&&(l.textContent=`⚡ الترتيب الحالي: ${n==="desc"?"الأعلى":"الأقل"} ${a==="sales"?"مبيعات":"تحصيلاً"} لشهر (${c}) ${n==="desc"?"▾":"▴"}`)}}window.loadCmmData=async function(){const l=document.getElementById("cmm-tbody");l&&(l.innerHTML='<tr><td colspan="19" style="text-align:center; padding:50px; color:var(--text-2);"><div class="loading-spinner" style="margin-bottom:8px;"></div><div>جاري جلب البيانات وحساب الأرصدة من كشوف الحسابات...</div></td></tr>');try{const[t,e,a,n,c,r]=await Promise.all([A(D.customers(),[J("name")]).catch(()=>[]),A(D.salesReps(),[J("name")]).catch(()=>[]),A(D.salesInvoices()).catch(()=>[]),A(D.salesReturns()).catch(()=>[]),A(D.collections()).catch(()=>[]),A(D.receipts()).catch(()=>[])]);X=t||[],q=e||[],U=(a||[]).filter(s=>s.status!=="cancelled"),tt=(n||[]).filter(s=>s.status!=="cancelled"&&s.status!=="void"),P=c||[],G=(r||[]).filter(s=>s.status!=="cancelled"&&(!s.entityType||s.entityType==="customer")),lt(),H()}catch(t){console.error("[CustomerMatrix] Data load error:",t),l&&(l.innerHTML=`<tr><td colspan="19" style="text-align:center; color:var(--bad); padding:30px;">فشل تحميل البيانات: ${t.message}</td></tr>`)}};function lt(){const o=document.getElementById("cmm-rep-select");if(o){const t=o.value;o.innerHTML='<option value="all">كل المناديب (مجمع)</option>'+q.map(e=>`<option value="${e.id}">${e.name}</option>`).join(""),t&&(o.value=t)}const l=document.getElementById("cmm-zone-select");if(l){const t=new Set;X.forEach(a=>{a.zone&&a.zone.trim()&&t.add(a.zone.trim())});const e=Array.from(t).sort();l.innerHTML='<option value="all">كل المناطق</option>'+e.map(a=>`<option value="${a}">${a}</option>`).join("")}}function H(){const o=String(f);b=X.filter(t=>{if(j!=="all"&&t.repId!==j){const e=q.find(a=>a.id===j);if(!e||t.repName!==e.name)return!1}return!(O!=="all"&&t.zone!==O)}).map(t=>{const e=Array(12).fill(0).map(()=>({sales:0,returns:0,netSales:0,collections:0}));let a=0,n=0,c=0,r=0,s=0;const d=(t.name||"").trim().toLowerCase();U.forEach(i=>{if(!(i.customerId===t.id||i.customerName&&i.customerName.trim().toLowerCase()===d))return;const z=parseFloat(i.totalWithVat||i.total||0);a+=z;const $=i.date||(i.createdAt?.toDate?i.createdAt.toDate().toISOString().split("T")[0]:"");if($.startsWith(o)){const h=parseInt($.slice(5,7),10)-1;h>=0&&h<12&&(e[h].sales+=z)}i.paidAmount>0&&(G.some(w=>(w.date||(w.createdAt?.toDate?w.createdAt.toDate().toISOString().split("T")[0]:""))===$&&(w.targetId===t.id||w.customerName&&w.customerName.trim().toLowerCase()===d)&&Math.abs((w.amount||0)-i.paidAmount)<.01)||P.some(w=>(w.date||(w.createdAt?.toDate?w.createdAt.toDate().toISOString().split("T")[0]:""))===$&&(w.customerId===t.id||w.customerName&&w.customerName.trim().toLowerCase()===d)&&Math.abs((w.amount||0)-i.paidAmount)<.01)||(s+=parseFloat(i.paidAmount||0)))}),tt.forEach(i=>{if(!(i.customerId===t.id||i.customerName&&i.customerName.trim().toLowerCase()===d))return;const z=parseFloat(i.totalWithVat!==void 0?i.totalWithVat:i.total||0);n+=z;const $=i.date||(i.createdAt?.toDate?i.createdAt.toDate().toISOString().split("T")[0]:"");if($.startsWith(o)){const h=parseInt($.slice(5,7),10)-1;h>=0&&h<12&&(e[h].returns+=z)}}),P.forEach(i=>{if(!(i.customerId===t.id||i.customerName&&i.customerName.trim().toLowerCase()===d))return;const z=parseFloat(i.amount||0);c+=z;const $=i.date||(i.createdAt?.toDate?i.createdAt.toDate().toISOString().split("T")[0]:"");if($.startsWith(o)){const h=parseInt($.slice(5,7),10)-1;h>=0&&h<12&&(e[h].collections+=z)}}),G.forEach(i=>{if(!(i.targetId===t.id||i.customerId===t.id||i.customerName&&i.customerName.trim().toLowerCase()===d))return;const z=parseFloat(i.amount||0);r+=z;const $=i.date||(i.createdAt?.toDate?i.createdAt.toDate().toISOString().split("T")[0]:"");if($.startsWith(o)){const h=parseInt($.slice(5,7),10)-1;h>=0&&h<12&&(e[h].collections+=z)}});const p=parseFloat(t.openingBalance||0),x=Math.round((p+a-n-c-r-s)*100)/100;e.forEach(i=>{i.netSales=Math.max(0,i.sales-i.returns)});const g=e.reduce((i,v)=>i+v.sales,0),I=e.reduce((i,v)=>i+v.returns,0),k=e.reduce((i,v)=>i+v.netSales,0),M=e.reduce((i,v)=>i+v.collections,0),T=g>0?M/g*100:M>0?100:0,S=e.slice(0,6).reduce((i,v)=>i+v.sales,0),C=e.slice(6,12).reduce((i,v)=>i+v.sales,0);let R="🟢 مستقر",L="good";return g>0?C>S*1.15?(R="📈 صاعد",L="indigo"):C<S*.7&&S>0&&(R="📉 متراجع",L="bad"):(R="⚪ غير نشط",L="neutral"),{customer:t,monthlySales:e,totalSales:g,totalReturns:I,totalNetSales:k,totalCollections:M,collectionRate:T,trendLabel:R,trendClass:L,actualStatementBalance:x}}),N(),st(),Y(),K(),Q(),Z(),E()}function st(){const o=y?b.filter(s=>s.customer.id===y):b,l=o.reduce((s,d)=>s+d.totalSales,0),t=o.reduce((s,d)=>s+d.totalCollections,0),e=l-t,a=l>0?t/l*100:t>0?100:0,n=o.reduce((s,d)=>s+d.actualStatementBalance,0);document.getElementById("cmm-kpi-sales").textContent=m(l),document.getElementById("cmm-kpi-sales-avg").textContent=`متوسط شهري: ${m(l/12)}`,document.getElementById("cmm-kpi-collections").textContent=m(t),document.getElementById("cmm-kpi-col-avg").textContent=`متوسط شهري: ${m(t/12)}`;const c=document.getElementById("cmm-kpi-rate");c.textContent=`${a.toFixed(1)}%`,c.style.color=a>=90?"#10B981":a>=70?"#F59E0B":"#EF4444",document.getElementById("cmm-kpi-gap").textContent=`فجوة التحصيل: ${m(e)}`;const r=document.getElementById("cmm-kpi-total-balance");r.textContent=m(n),r.style.color=n>0?"#EF4444":n<0?"#10B981":"#8B5CF6"}function Y(){const o=document.getElementById("cmm-focus-banner");if(o){if(y){const l=b.find(t=>t.customer.id===y);if(l){const t=l.customer;document.getElementById("cmm-focus-name").textContent=`${t.name}`,document.getElementById("cmm-focus-details").textContent=`كود: ${t.code||"—"} | المندوب: ${t.repName||"—"} | المنطقة: ${t.zone||"—"} | رصيد كشف الحساب الفعلي الصافي: ${m(l.actualStatementBalance)}`,o.style.display="block",document.getElementById("cmm-chart-title").textContent=`👤 منحنى أداء العميل: ${t.name} (${f})`,document.getElementById("cmm-chart-subtitle").textContent="تحليل تفصيلي لمشتريات وتحصيلات العميل على مدار أشهر السنة";return}}o.style.display="none",document.getElementById("cmm-chart-title").textContent=`📊 منحنى المبيعات والتحصيلات المجمعة لسنة ${f}`,document.getElementById("cmm-chart-subtitle").textContent="مقارنة بصرية ديناميكية بين مسحوبات المبيعات والتدفقات النقدية المحصلة"}}function K(){const o=document.getElementById("cmm-trend-canvas");if(!o||typeof Chart>"u")return;const l=Array(12).fill(0),t=Array(12).fill(0),e=Array(12).fill(0);(y?b.filter(s=>s.customer.id===y):b).forEach(s=>{s.monthlySales.forEach((d,p)=>{l[p]+=d.sales,t[p]+=d.collections,e[p]+=d.returns})}),V&&V.destroy();const n=o.getContext("2d"),c=n.createLinearGradient(0,0,0,320);c.addColorStop(0,"rgba(79, 70, 229, 0.40)"),c.addColorStop(1,"rgba(79, 70, 229, 0.0)");const r=n.createLinearGradient(0,0,0,320);r.addColorStop(0,"rgba(16, 185, 129, 0.30)"),r.addColorStop(1,"rgba(16, 185, 129, 0.0)"),V=new Chart(o,{type:"line",data:{labels:B,datasets:[{label:"المبيعات (ر.س)",data:l,borderColor:"#4F46E5",backgroundColor:c,borderWidth:3.5,tension:.38,pointRadius:5.5,pointHoverRadius:9,pointBackgroundColor:"#4F46E5",pointBorderColor:"#FFFFFF",pointBorderWidth:2.5,fill:!0},{label:"التحصيلات (ر.س)",data:t,borderColor:"#10B981",backgroundColor:r,borderWidth:3.5,borderDash:[6,4],tension:.38,pointRadius:5.5,pointHoverRadius:9,pointBackgroundColor:"#10B981",pointBorderColor:"#FFFFFF",pointBorderWidth:2.5,fill:!0},{label:"المردودات (ر.س)",data:e,borderColor:"#EF4444",backgroundColor:"rgba(239, 68, 68, 0.1)",borderWidth:2,borderDash:[2,2],tension:.3,pointRadius:4,pointBackgroundColor:"#EF4444",fill:!1}]},options:{responsive:!0,maintainAspectRatio:!1,interaction:{mode:"index",intersect:!1},plugins:{legend:{display:!1},tooltip:{backgroundColor:"rgba(15, 23, 42, 0.95)",titleFont:{family:"IBM Plex Sans Arabic",size:13,weight:"bold"},bodyFont:{family:"IBM Plex Mono",size:12.5},padding:14,cornerRadius:10,borderColor:"rgba(255, 255, 255, 0.12)",borderWidth:1,callbacks:{label:function(s){const d=s.raw||0;return`  ${s.dataset.label}: ${m(d)}`},afterBody:function(s){const d=s[0]?.raw||0,p=s[1]?.raw||0,x=d-p;return`  ⚖️ فجوة الشهر: ${m(x)}`}}}},scales:{x:{grid:{color:"rgba(150, 150, 150, 0.08)"},ticks:{font:{family:"IBM Plex Sans Arabic",size:11.5,weight:"600"},color:"var(--text-2)"}},y:{grid:{color:"rgba(150, 150, 150, 0.08)"},ticks:{font:{family:"IBM Plex Mono",size:11},color:"var(--text-2)",callback:s=>s>=1e3?`${(s/1e3).toFixed(0)}k`:s}}}}})}function Q(){const o=document.getElementById("cmm-donut-canvas");if(!o||typeof Chart>"u")return;W&&W.destroy();const l=document.getElementById("cmm-donut-legend"),t=document.getElementById("cmm-donut-subtitle");let e=[],a=[];const n=["#4F46E5","#10B981","#F59E0B","#EC4899","#8B5CF6","#06B6D4","#64748B"];if(y){const r=b.find(s=>s.customer.id===y);r&&(t&&(t.textContent=`هيكل حساب ${r.customer.name}`),e=["صافي المبيعات","التحصيلات","المردودات"],a=[r.totalNetSales,r.totalCollections,r.totalReturns])}else{t&&(t.textContent=`أعلى 5 مساهمات في مبيعات ${f}`);const r=b.slice(0,5);e=r.map(d=>d.customer.name),a=r.map(d=>d.totalSales);const s=b.slice(5).reduce((d,p)=>d+p.totalSales,0);s>0&&(e.push("باقي العملاء"),a.push(s))}const c=a.reduce((r,s)=>r+s,0);W=new Chart(o,{type:"doughnut",data:{labels:e,datasets:[{data:a,backgroundColor:n.slice(0,e.length),borderWidth:2,borderColor:"var(--bg-card)"}]},options:{responsive:!0,maintainAspectRatio:!1,cutout:"68%",plugins:{legend:{display:!1},tooltip:{callbacks:{label:r=>{const s=r.raw||0,d=c>0?(s/c*100).toFixed(1):"0";return` ${r.label}: ${m(s)} (${d}%)`}}}}}}),l&&(l.innerHTML=e.map((r,s)=>{const d=a[s]||0,p=c>0?(d/c*100).toFixed(1):"0";return`
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="display:inline-flex; align-items:center; gap:6px;">
            <span style="width:8px; height:8px; border-radius:50%; background:${n[s]}; display:inline-block;"></span>
            <span style="max-width:130px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r}</span>
          </span>
          <span class="mono font-bold" style="font-size:11px;">${p}%</span>
        </div>
      `}).join(""))}function E(){const o=document.getElementById("cmm-tbody"),l=document.getElementById("cmm-tfoot");if(!o)return;let t=b;if(F&&(t=t.filter(a=>(a.customer.name||"").toLowerCase().includes(F)||(a.customer.code||"").toLowerCase().includes(F)||(a.customer.phone||"").includes(F)||(a.customer.repName||"").toLowerCase().includes(F))),document.getElementById("cmm-table-rows-count").textContent=`عرض ${t.length} من أصل ${b.length} عميل`,!t.length){o.innerHTML='<tr><td colspan="19" style="text-align:center; padding:40px; color:var(--text-2);">لا توجد سجلات تطابق الفلتر والبحث الحالي</td></tr>',l&&(l.innerHTML="");return}let e=1;if(t.forEach(a=>{a.monthlySales.forEach(n=>{const c=_==="collections"?n.collections:_==="net_sales"?n.netSales:n.sales;c>e&&(e=c)})}),o.innerHTML=t.map((a,n)=>{const c=a.customer,r=y===c.id,s=a.monthlySales.map((g,I)=>{const k=_==="collections"?g.collections:_==="net_sales"?g.netSales:g.sales,M=u.startsWith(`month_${I}_`),T=k>0?Math.min(.28,Math.max(.04,k/e*.35)):0;let S=k>0?`background: rgba(79, 70, 229, ${T});`:"";return M&&(S=k>0?`background: rgba(99, 102, 241, ${Math.max(.12,T+.08)});`:"background: rgba(99, 102, 241, 0.03);"),_==="both"?`
          <td style="${S} text-align:center; padding:6px 6px; border-left:1px solid var(--border-soft); font-size:11px;">
            ${g.sales>0?`
              <div style="display:flex; justify-content:space-between; align-items:center; gap:2px;">
                <span style="font-size:9.5px; color:var(--text-2);">🧾</span>
                <span class="mono font-bold" style="color:var(--text-0);">${m(g.sales)}</span>
              </div>
            `:'<div style="color:var(--text-3); font-size:10px;">—</div>'}
            ${g.collections>0?`
              <div style="display:flex; justify-content:space-between; align-items:center; gap:2px; margin-top:2px;">
                <span style="font-size:9.5px; color:#10B981;">📥</span>
                <span class="mono font-bold" style="color:#10B981;">${m(g.collections)}</span>
              </div>
            `:""}
          </td>
        `:`
        <td style="${S} text-align:center; padding:8px 4px; border-left:1px solid var(--border-soft);">
          <span class="mono ${k>0?"font-bold":"dim"}" style="font-size:11.5px; color:${k>0?"var(--text-0)":"var(--text-3)"};">
            ${k>0?m(k):"—"}
          </span>
        </td>
      `}).join(""),d=a.actualStatementBalance,p=d>0,x=d<0;return`
      <tr onclick="window.focusCmmCustomer('${c.id}')"
          style="cursor:pointer; transition:background 0.15s; ${r?"background:rgba(99,102,241,0.14) !important; outline:2px solid var(--brand);":""}"
          class="cmm-row ${r?"active":""}">
        
        <!-- Sticky Customer Column -->
        <td style="position:sticky; right:0; z-index:5; background:var(--bg-card); box-shadow:-2px 0 6px rgba(0,0,0,0.06); padding:8px 12px;">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <div style="font-weight:800; font-size:12.5px; color:${r?"var(--brand)":"var(--text-0)"};">${c.name}</div>
            ${n<3&&u.includes("desc")?`<span style="font-size:13px;">${n===0?"🥇":n===1?"🥈":"🥉"}</span>`:""}
          </div>
          <div style="font-size:10.5px; color:var(--text-2); margin-top:2px; display:flex; gap:6px; align-items:center;">
            <span>${c.code?`[${c.code}]`:""}</span>
            <span>👔 ${c.repName||"—"}</span>
            <span>📍 ${c.zone||"—"}</span>
          </div>
        </td>

        <!-- Exact Statement Balance (Calculated Dynamically) -->
        <td style="text-align:left; font-size:11.5px; background:rgba(99,102,241,0.03);">
          <span class="mono font-bold" style="color:${p?"var(--bad)":x?"#10B981":"var(--text-2)"}; font-size:12px;">
            ${p?m(d):x?`(${m(Math.abs(d))}) دائن`:"0.00"}
          </span>
        </td>

        <!-- 12 Month Cells -->
        ${s}

        <!-- Total Sales of Year -->
        <td class="mono font-bold" style="text-align:left; color:var(--indigo); background:rgba(99,102,241,0.04); font-size:12px;">
          ${m(a.totalSales)}
        </td>

        <!-- Total Collections of Year -->
        <td class="mono font-bold" style="text-align:left; color:#10B981; background:rgba(16,185,129,0.04); font-size:12px;">
          ${m(a.totalCollections)}
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
          <button class="btn btn-icon sm btn-ghost" title="كشف الحساب التفصيلي" onclick="window.focusCmmCustomer('${c.id}'); window.openCmmCustomerStatement();">
            📊
          </button>
        </td>

      </tr>
    `}).join(""),l){const a=Array(12).fill(0),n=Array(12).fill(0);t.forEach(p=>{p.monthlySales.forEach((x,g)=>{a[g]+=_==="collections"?x.collections:_==="net_sales"?x.netSales:x.sales,n[g]+=x.collections})});const c=t.reduce((p,x)=>p+x.totalSales,0),r=t.reduce((p,x)=>p+x.totalCollections,0),s=c>0?r/c*100:0,d=t.reduce((p,x)=>p+x.actualStatementBalance,0);l.innerHTML=`
      <tr>
        <td style="position:sticky; right:0; z-index:11; background:var(--bg-2); padding:10px 12px; font-size:12px; color:var(--text-0);">
          الإجمالي العام (${t.length} عميل)
        </td>
        <td class="mono font-bold" style="text-align:left; font-size:12px; color:${d>0?"var(--bad)":"var(--text-0)"};">
          ${m(d)}
        </td>
        ${a.map(p=>`
          <td class="mono font-bold" style="text-align:center; font-size:11.5px; color:var(--text-0); padding:8px 4px;">
            ${p>0?m(p):"0.00"}
          </td>
        `).join("")}
        <td class="mono font-bold" style="text-align:left; color:var(--indigo); font-size:12.5px;">
          ${m(c)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:#10B981; font-size:12.5px;">
          ${m(r)}
        </td>
        <td style="text-align:center; font-size:11.5px; color:var(--text-0);">
          ${s.toFixed(0)}%
        </td>
        <td colspan="2"></td>
      </tr>
    `}}function Z(){const o=document.getElementById("cmm-monthly-breakdown-tbody"),l=document.getElementById("cmm-monthly-breakdown-tfoot");if(!o)return;const t=y?b.filter(n=>n.customer.id===y):b,e=t.reduce((n,c)=>n+c.totalSales,0),a=Array(12).fill(0).map((n,c)=>{let r=0,s=0,d=0,p=0,x=0,g={name:"—",amount:0},I={name:"—",amount:0};t.forEach(S=>{const C=S.monthlySales[c];r+=C.sales,s+=C.returns,d+=C.netSales,p+=C.collections,(C.sales>0||C.collections>0)&&x++,C.sales>g.amount&&(g={name:S.customer.name,amount:C.sales}),C.collections>I.amount&&(I={name:S.customer.name,amount:C.collections})});const k=d-p,M=r>0?p/r*100:p>0?100:0,T=e>0?r/e*100:0;return{mIdx:c,monthName:B[c],sales:r,returns:s,netSales:d,collections:p,gap:k,rate:M,share:T,activeCusts:x,topBuyer:g,topPayer:I}});if(o.innerHTML=a.map(n=>{const c=u.startsWith(`month_${n.mIdx}_`),r=n.rate>=95?"good":n.rate>=70?"warn":n.sales===0?"neutral":"bad",s=n.gap>0?"var(--bad)":n.gap<0?"#10B981":"var(--text-2)";return`
      <tr style="transition:background 0.15s; ${c?"background:rgba(99,102,241,0.08); font-weight:700;":""}">
        <td style="padding:10px 12px; font-weight:800; color:var(--text-0);">
          <span style="display:inline-flex; align-items:center; gap:6px;">
            <span class="badge" style="background:var(--bg-1); color:var(--brand); font-size:10px; font-weight:900; border:1px solid var(--border-soft); width:26px; text-align:center;">
              ${String(n.mIdx+1).padStart(2,"0")}
            </span>
            <span style="font-size:12.5px;">${n.monthName}</span>
          </span>
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--indigo);">
          ${m(n.sales)}
        </td>
        <td class="mono" style="text-align:left; color:${n.returns>0?"var(--bad)":"var(--text-3)"};">
          ${n.returns>0?m(n.returns):"0.00"}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--text-0);">
          ${m(n.netSales)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:#10B981;">
          ${m(n.collections)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:${s};">
          ${n.gap>0?m(n.gap):n.gap<0?`(${m(Math.abs(n.gap))}) فائض`:"0.00"}
        </td>
        <td style="text-align:center;">
          <span class="badge ${r}" style="font-size:10.5px; font-weight:800;">
            ${n.rate.toFixed(0)}%
          </span>
        </td>
        <td style="text-align:center;" class="mono">
          <span style="font-size:11.5px; color:var(--text-1); font-weight:700;">${n.share.toFixed(1)}%</span>
        </td>
        <td style="text-align:center;" class="mono">
          <span class="badge neutral" style="font-size:10.5px;">${n.activeCusts}</span>
        </td>
        <td style="text-align:right; font-size:11px;">
          ${n.topBuyer.amount>0?`
            <div style="font-weight:700; color:var(--text-0); max-width:160px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${n.topBuyer.name}</div>
            <div class="mono" style="font-size:10px; color:var(--indigo);">${m(n.topBuyer.amount)}</div>
          `:'<span style="color:var(--text-3);">—</span>'}
        </td>
        <td style="text-align:right; font-size:11px;">
          ${n.topPayer.amount>0?`
            <div style="font-weight:700; color:var(--text-0); max-width:160px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${n.topPayer.name}</div>
            <div class="mono" style="font-size:10px; color:#10B981;">${m(n.topPayer.amount)}</div>
          `:'<span style="color:var(--text-3);">—</span>'}
        </td>
        <td style="text-align:center;" class="no-print">
          <div style="display:flex; gap:4px; justify-content:center;">
            <button class="btn btn-ghost btn-sm" title="فرز مصفوفة العملاء حسب مبيعات ${n.monthName}" onclick="window.setMonthQuickSort(${n.mIdx}, 'sales'); window.scrollCmmToMatrix();" style="padding:2px 6px; font-size:10.5px; font-weight:700; border-radius:6px; background:rgba(99,102,241,0.08); color:var(--brand);">
              🛒 مبيعات
            </button>
            <button class="btn btn-ghost btn-sm" title="فرز مصفوفة العملاء حسب تحصيلات ${n.monthName}" onclick="window.setMonthQuickSort(${n.mIdx}, 'col'); window.scrollCmmToMatrix();" style="padding:2px 6px; font-size:10.5px; font-weight:700; border-radius:6px; background:rgba(16,185,129,0.08); color:#10B981;">
              📥 تحصيل
            </button>
          </div>
        </td>
      </tr>
    `}).join(""),l){const n=a.reduce((x,g)=>x+g.sales,0),c=a.reduce((x,g)=>x+g.returns,0),r=a.reduce((x,g)=>x+g.netSales,0),s=a.reduce((x,g)=>x+g.collections,0),d=r-s,p=n>0?s/n*100:0;l.innerHTML=`
      <tr>
        <td style="padding:10px 12px; font-size:12px; color:var(--text-0);">
          الإجمالي العام (${f})
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--indigo); font-size:12.5px;">
          ${m(n)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--bad); font-size:12px;">
          ${m(c)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:var(--text-0); font-size:12.5px;">
          ${m(r)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:#10B981; font-size:12.5px;">
          ${m(s)}
        </td>
        <td class="mono font-bold" style="text-align:left; color:${d>0?"var(--bad)":"#10B981"}; font-size:12.5px;">
          ${d>0?m(d):`(${m(Math.abs(d))}) فائض`}
        </td>
        <td style="text-align:center; font-size:12px;">
          ${p.toFixed(0)}%
        </td>
        <td style="text-align:center; font-size:12px;" class="mono">100%</td>
        <td style="text-align:center; font-size:12px;" class="mono">${t.length}</td>
        <td colspan="3"></td>
      </tr>
    `}}export{xt as render};
