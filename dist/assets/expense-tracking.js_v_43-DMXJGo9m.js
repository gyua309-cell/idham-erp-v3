import{s as Q,t as Z,C as T,f as w,g as R}from"./index-CF9GFeRJ.js";import{e as G}from"./excel-DM5XZHtQ.js";import{query as j,where as B,limit as H,getDocs as V,orderBy as q}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let P=[],K=[],_=[],N={},E={},I=new Set(["cat_transport","cat_payroll","cat_admin","cat_finance","cat_deprec"]),S=new Set,D=null,M=null;async function Ct(t,s){const a=Q(),e=Z();t.innerHTML=`
    <style>
      .print-only-header { display: none; }
      @media print {
        .print-only-header { display: block !important; }
        .no-print { display: none !important; }
        .chart-container-card { display: none !important; }
        .filterbar { display: none !important; }
        .view-mode-bar { display: none !important; }
        .tree-exp-sub-body { display: block !important; }
        .tree-cat-body { display: block !important; }
        body, .page-content { background: #fff !important; padding: 0 !important; }
        .card { box-shadow: none !important; border: 1px solid #ccc !important; }
        table { width: 100% !important; border-collapse: collapse !important; font-size: 11px !important; }
        th, td { border: 1px solid #999 !important; padding: 5px 6px !important; }
      }
      .chart-container-card {
        background: var(--bg-1);
        border: 1px solid var(--border-soft);
        border-radius: 14px;
        padding: 16px 20px;
        box-shadow: var(--shadow-sm);
      }
      .exp-preset-btn {
        font-size: 11.5px;
        font-weight: 700;
        padding: 5px 10px;
        border-radius: 7px;
        transition: all 0.15s ease;
      }
      .badge-logistics {
        background: rgba(16, 185, 129, 0.12);
        color: #047857;
        border: 1px solid rgba(16, 185, 129, 0.25);
      }
      .badge-staff {
        background: rgba(37, 99, 235, 0.12);
        color: #1d4ed8;
        border: 1px solid rgba(37, 99, 235, 0.25);
      }
      .badge-admin {
        background: rgba(124, 58, 237, 0.12);
        color: #6d28d9;
        border: 1px solid rgba(124, 58, 237, 0.25);
      }
      .badge-finance {
        background: rgba(245, 158, 11, 0.12);
        color: #b45309;
        border: 1px solid rgba(245, 158, 11, 0.25);
      }
      .badge-deprec {
        background: rgba(107, 114, 128, 0.12);
        color: #374151;
        border: 1px solid rgba(107, 114, 128, 0.25);
      }
      .badge-cash {
        background: rgba(16, 185, 129, 0.08);
        color: #065f46;
        border: 1px solid rgba(16, 185, 129, 0.2);
      }
      .badge-bank {
        background: rgba(37, 99, 235, 0.08);
        color: #1e40af;
        border: 1px solid rgba(37, 99, 235, 0.2);
      }
      .badge-journal {
        background: rgba(139, 92, 246, 0.08);
        color: #6d28d9;
        border: 1px solid rgba(139, 92, 246, 0.2);
      }
      
      /* Tree View Styles */
      .tree-cat-card {
        background: var(--bg-card);
        border: 1.5px solid var(--border-soft);
        border-radius: 14px;
        margin-bottom: 16px;
        box-shadow: var(--shadow-sm);
        overflow: hidden;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .tree-cat-card:hover {
        border-color: var(--brand);
        box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      }
      .tree-cat-header {
        padding: 14px 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        user-select: none;
        transition: background 0.15s ease;
      }
      .tree-cat-header:hover {
        background: rgba(0,0,0,0.02);
      }
      .tree-cat-body {
        border-top: 1px solid var(--border-soft);
        background: var(--bg-1);
        padding: 12px 14px;
      }
      .tree-sub-card {
        background: var(--bg-card);
        border: 1px solid var(--border-soft);
        border-radius: 10px;
        margin-bottom: 10px;
        overflow: hidden;
        transition: border-color 0.15s ease;
      }
      .tree-sub-card:last-child {
        margin-bottom: 0;
      }
      .tree-sub-card:hover {
        border-color: rgba(30,58,138,0.3);
      }
      .tree-sub-header {
        padding: 10px 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        user-select: none;
        background: var(--bg-2);
        transition: background 0.15s ease;
      }
      .tree-sub-header:hover {
        background: rgba(30,58,138,0.04);
      }
      .tree-sub-body {
        border-top: 1px solid var(--border-soft);
        padding: 0;
        background: var(--bg-card);
      }
      .chevron-icon {
        display: inline-block;
        transition: transform 0.2s ease;
        font-size: 11px;
        color: var(--text-3);
      }
      .chevron-icon.open {
        transform: rotate(90deg);
        color: var(--brand);
      }
      .view-mode-tab {
        padding: 7px 16px;
        border-radius: 9px;
        font-size: 13px;
        font-weight: 800;
        cursor: pointer;
        border: 1.5px solid transparent;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .view-mode-tab.active {
        background: var(--brand);
        color: #fff;
        box-shadow: 0 2px 8px rgba(30,58,138,0.25);
      }
      .view-mode-tab:not(.active) {
        background: var(--bg-2);
        color: var(--text-1);
        border-color: var(--border-soft);
      }
      .view-mode-tab:not(.active):hover {
        background: var(--bg-3);
      }
    </style>

    <!-- ═══ TOP FILTER BAR ═══ -->
    <div class="filterbar no-print" style="flex-wrap:wrap; gap:12px; height:auto; padding:14px 18px; background:var(--bg-1); border-radius:14px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); margin-bottom:20px; align-items:flex-end;">
      
      <!-- Date Inputs -->
      <div class="date-range-group" style="margin:0;">
        <label style="font-size:11.5px; font-weight:700; margin-bottom:4px; display:block; color:var(--text-2);">من تاريخ</label>
        <input type="date" id="et-from" value="${a}" onchange="loadExpenseTracking()" class="input" style="height:34px; font-size:12.5px;" />
      </div>
      <div class="date-range-group" style="margin:0;">
        <label style="font-size:11.5px; font-weight:700; margin-bottom:4px; display:block; color:var(--text-2);">إلى تاريخ</label>
        <input type="date" id="et-to" value="${e}" onchange="loadExpenseTracking()" class="input" style="height:34px; font-size:12.5px;" />
      </div>

      <!-- Date Presets -->
      <div style="display:flex; gap:4px; align-items:center; flex-wrap:wrap; margin-bottom:2px;">
        <button type="button" class="btn btn-sm btn-ghost exp-preset-btn" data-preset="today" onclick="setExpDatePreset('today')">اليوم</button>
        <button type="button" class="btn btn-sm btn-ghost exp-preset-btn" data-preset="yesterday" onclick="setExpDatePreset('yesterday')">أمس</button>
        <button type="button" class="btn btn-sm btn-ghost exp-preset-btn" data-preset="week" onclick="setExpDatePreset('week')">هذا الأسبوع</button>
        <button type="button" class="btn btn-sm btn-primary exp-preset-btn" data-preset="month" onclick="setExpDatePreset('month')">هذا الشهر</button>
        <button type="button" class="btn btn-sm btn-ghost exp-preset-btn" data-preset="last_month" onclick="setExpDatePreset('last_month')">الشهر الماضي</button>
        <button type="button" class="btn btn-sm btn-ghost exp-preset-btn" data-preset="quarter" onclick="setExpDatePreset('quarter')">الربع الحالي</button>
        <button type="button" class="btn btn-sm btn-ghost exp-preset-btn" data-preset="year" onclick="setExpDatePreset('year')">هذا العام</button>
        <button type="button" class="btn btn-sm btn-ghost exp-preset-btn" data-preset="all" onclick="setExpDatePreset('all')">الكل</button>
      </div>
      
      <!-- Expense Classification Filter -->
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11.5px; font-weight:700; margin-bottom:4px; display:block; color:var(--text-2);">تصنيف المصروف</label>
        <select id="et-class-filter" onchange="filterExpenseTracking()" class="input" style="min-width:170px; height:34px; font-size:12px; font-weight:700;">
          <option value="">الكل (جميع التصنيفات)</option>
          <option value="نقل ولوجستيات">🚚 نقل ولوجستيات وتوزيع (شحن، ديزل، صيانة)</option>
          <option value="موظفين وعمالة">👥 موظفين وعمالة (رواتب، بدلات، إقامات)</option>
          <option value="إدارية وعمومية">🏢 إدارية وعمومية (إيجارات، فواتير، خدمات، وسيط)</option>
          <option value="تمويلية وبنكية">💳 تمويلية وبنكية (رسوم بنكية، نقاط بيع)</option>
          <option value="إهلاك ومخصصات">📉 إهلاك أصول ومخصصات</option>
        </select>
      </div>

      <!-- Detailed Account Filter -->
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11.5px; font-weight:700; margin-bottom:4px; display:block; color:var(--text-2);">الحساب التفصيلي</label>
        <select id="et-account-filter" onchange="filterExpenseTracking()" class="input" style="min-width:210px; height:34px; font-size:12px;">
          <option value="">الكل (جميع الحسابات)</option>
        </select>
      </div>

      <!-- Cost Center Filter -->
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11.5px; font-weight:700; margin-bottom:4px; display:block; color:var(--text-2);">مركز التكلفة / المندوب / السيارة</label>
        <select id="et-cc-filter" onchange="filterExpenseTracking()" class="input" style="min-width:160px; height:34px; font-size:12px;">
          <option value="">الكل (جميع المراكز)</option>
        </select>
      </div>

      <!-- Payment Method Filter -->
      <div class="filter-select-group" style="margin:0;">
        <label style="font-size:11.5px; font-weight:700; margin-bottom:4px; display:block; color:var(--text-2);">طريقة الصرف</label>
        <select id="et-method-filter" onchange="filterExpenseTracking()" class="input" style="min-width:140px; height:34px; font-size:12px;">
          <option value="">الكل (جميع الطرق)</option>
          <option value="cash">💵 نقدي (الصناديق والعهد)</option>
          <option value="bank">🏦 بنكي (التحويلات والحسابات)</option>
          <option value="journal">📝 قيود يومية وتسويات</option>
        </select>
      </div>

      <!-- Quick Text Search -->
      <div style="flex:1; min-width:180px; margin:0;">
        <label style="font-size:11.5px; font-weight:700; margin-bottom:4px; display:block; color:var(--text-2);">🔍 بحث سريع</label>
        <input type="text" id="et-search" class="input" placeholder="رقم السند، البيان، الحساب، الصندوق..." oninput="filterExpenseTracking()" style="height:34px; font-size:12px;" />
      </div>

      <!-- Action Buttons -->
      <div style="margin-right:auto; display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="exportExpenseTrackingExcel()" title="تصدير Excel" style="font-weight:700; height:34px; border-radius:8px;">
          <span>📊</span> Excel
        </button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="exportExpenseTrackingPDF()" title="تصدير PDF" style="font-weight:700; height:34px; border-radius:8px;">
          <span>📄</span> PDF
        </button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="printExpenseTrackingReport()" title="طباعة فورية" style="font-weight:700; height:34px; border-radius:8px;">
          <span>🖨️</span> طباعة
        </button>
        <button type="button" class="btn btn-primary btn-sm" onclick="loadExpenseTracking()" title="تحديث البيانات" style="font-weight:700; height:34px; border-radius:8px;">
          <span>🔄</span> تحديث
        </button>
      </div>
    </div>

    <div class="page-content" style="padding:0 4px;">
      <!-- Luxury Print Header -->
      <div class="print-only-header" style="border-bottom:3px double #1e3a8a; padding-bottom:14px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:16px; align-items:center;">
            <img id="et-print-logo" style="max-height:64px; max-width:120px;" src="" alt="شعار الشركة" />
            <div>
              <h2 id="et-print-co-name" style="margin:0; font-family:var(--font-heading); color:#1e3a8a; font-size:18px;">مؤسسة إدهام للمواد الغذائية</h2>
              <div id="et-print-co-details" class="dim" style="font-size:11px; margin-top:4px; color:#475569;"></div>
            </div>
          </div>
          <div style="text-align:left;">
            <h3 style="margin:0; font-family:var(--font-heading); font-size:16px;">تقرير تتبع وتحليل مصروفات الشركة</h3>
            <p style="margin:4px 0 0 0; font-size:11.5px; color:#64748b; font-weight:700;" id="et-print-period"></p>
          </div>
        </div>
      </div>

      <div class="page-header no-print" style="margin-bottom:18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h1 class="page-title" style="font-size:20px; font-weight:900; margin:0 0 4px 0; display:flex; align-items:center; gap:8px;">
            <span>💼</span> تتبع وتحليل المصروفات (تشغيلية / لوجستية / إدارية)
          </h1>
          <p class="page-subtitle" id="et-period" style="font-size:12.5px; color:var(--text-2); font-weight:600; margin:0;"></p>
        </div>
        <div>
          <span class="badge" id="et-count-badge" style="font-size:12px; font-weight:800; background:rgba(30,58,138,0.08); color:var(--brand); border:1.5px solid rgba(30,58,138,0.2); padding:6px 12px;">0 حركة مسجلة</span>
        </div>
      </div>

      <!-- ═══ 6 KPI SUMMARY CARDS ═══ -->
      <div class="kpi-grid mb-24" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:24px;">
        
        <!-- KPI 1: Logistics & Fleet Expenses -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:15px 16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar good" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#10b981,#059669);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kpi-label" style="font-size:11.5px; font-weight:700; color:var(--text-2); margin-bottom:4px;">النقل واللوجستيات والأسطول</div>
              <div class="kpi-value mono" id="et-total-logistics" style="font-size:17.5px; font-weight:900; color:#059669;">0.00 ر.س</div>
            </div>
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(16,185,129,0.12); display:flex; align-items:center; justify-content:center; font-size:16px;">🚚</div>
          </div>
          <div class="kpi-subtext" style="font-size:10.5px; color:#059669; margin-top:6px; font-weight:700;">
            شحن بضائع، ديزل، صيانة <span id="et-pct-logistics" class="mono">(0%)</span>
          </div>
        </div>

        <!-- KPI 2: Staff & Payroll Expenses -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:15px 16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar blue" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#3b82f6,#1d4ed8);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kpi-label" style="font-size:11.5px; font-weight:700; color:var(--text-2); margin-bottom:4px;">الموظفين والعمالة</div>
              <div class="kpi-value mono" id="et-total-payroll" style="font-size:17.5px; font-weight:900; color:#1d4ed8;">0.00 ر.س</div>
            </div>
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(59,130,246,0.12); display:flex; align-items:center; justify-content:center; font-size:16px;">👥</div>
          </div>
          <div class="kpi-subtext" style="font-size:10.5px; color:#1d4ed8; margin-top:6px; font-weight:700;">
            رواتب، بدلات، إقامات، تأمينات <span id="et-pct-payroll" class="mono">(0%)</span>
          </div>
        </div>

        <!-- KPI 3: Admin & Overhead Expenses -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:15px 16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar purple" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#8b5cf6,#6d28d9);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kpi-label" style="font-size:11.5px; font-weight:700; color:var(--text-2); margin-bottom:4px;">الإدارية والعمومية</div>
              <div class="kpi-value mono" id="et-total-admin" style="font-size:17.5px; font-weight:900; color:#6d28d9;">0.00 ر.س</div>
            </div>
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(139,92,246,0.12); display:flex; align-items:center; justify-content:center; font-size:16px;">🏢</div>
          </div>
          <div class="kpi-subtext" style="font-size:10.5px; color:#6d28d9; margin-top:6px; font-weight:700;">
            إيجار، كهرباء، تراخيص، وسيط <span id="et-pct-admin" class="mono">(0%)</span>
          </div>
        </div>

        <!-- KPI 4: Financial & Depreciation -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:15px 16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar warn" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#f59e0b,#d97706);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kpi-label" style="font-size:11.5px; font-weight:700; color:var(--text-2); margin-bottom:4px;">التمويلية والإهلاك</div>
              <div class="kpi-value mono" id="et-total-fin" style="font-size:17.5px; font-weight:900; color:#d97706;">0.00 ر.س</div>
            </div>
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(245,158,11,0.12); display:flex; align-items:center; justify-content:center; font-size:16px;">💳</div>
          </div>
          <div class="kpi-subtext" style="font-size:10.5px; color:#d97706; margin-top:6px; font-weight:700;">
            رسوم بنكية، نقاط بيع، إهلاك <span id="et-pct-fin" class="mono">(0%)</span>
          </div>
        </div>

        <!-- KPI 5: Grand Total -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:15px 16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar bad" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#ef4444,#dc2626);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kpi-label" style="font-size:11.5px; font-weight:700; color:var(--text-2); margin-bottom:4px;">إجمالي المصروفات</div>
              <div class="kpi-value mono" id="et-total-amount" style="font-size:19px; font-weight:900; color:#dc2626;">0.00 ر.س</div>
            </div>
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(239,68,68,0.12); display:flex; align-items:center; justify-content:center; font-size:16px;">💸</div>
          </div>
          <div class="kpi-subtext" style="font-size:10.5px; color:#dc2626; margin-top:6px; font-weight:700;">
            كافة المصروفات خلال الفترة
          </div>
        </div>

        <!-- KPI 6: Daily Burn Rate -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:15px 16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar cyan" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#0ea5e9,#0284c7);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kpi-label" style="font-size:11.5px; font-weight:700; color:var(--text-2); margin-bottom:4px;">معدل الصرف اليومي</div>
              <div class="kpi-value mono" id="et-burn-rate" style="font-size:17.5px; font-weight:900; color:#0284c7;">0.00 ر.س / يوم</div>
            </div>
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(14,165,233,0.12); display:flex; align-items:center; justify-content:center; font-size:16px;">📈</div>
          </div>
          <div class="kpi-subtext" style="font-size:10.5px; color:#0284c7; margin-top:6px; font-weight:700;">
            متوسط الإنفاق اليومي
          </div>
        </div>
      </div>

      <!-- ═══ DASHBOARD CHARTS ROW ═══ -->
      <div class="grid-2 gap-20 mb-24 no-print" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(340px, 1fr)); gap:20px; margin-bottom:24px;">
        
        <!-- Chart 1: Expenses by Top Accounts (Bar Chart) -->
        <div class="chart-container-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 style="font-family:var(--font-heading); font-size:14px; font-weight:800; margin:0; color:var(--text-1); display:flex; align-items:center; gap:6px;">
              <span>📊</span> أعلى بنود المصروفات استهلاكاً
            </h3>
            <span style="font-size:11px; color:var(--text-3); font-weight:600;">(حسب الحساب المدين)</span>
          </div>
          <div style="position:relative; height:240px; width:100%;">
            <canvas id="et-category-chart"></canvas>
          </div>
        </div>

        <!-- Chart 2: Time Progression (Line Chart) -->
        <div class="chart-container-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 style="font-family:var(--font-heading); font-size:14px; font-weight:800; margin:0; color:var(--text-1); display:flex; align-items:center; gap:6px;">
              <span>📈</span> تتبع حركة وتراكم المصروفات بالفترة
            </h3>
            <span style="font-size:11px; color:var(--text-3); font-weight:600;">(مقارنة التصنيفات الرئيسية)</span>
          </div>
          <div style="position:relative; height:240px; width:100%;">
            <canvas id="et-trend-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- ═══ VIEW MODE SWITCHER & TREE CONTROLS ═══ -->
      <div class="view-mode-bar no-print" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px; background:var(--bg-1); padding:10px 16px; border-radius:12px; border:1px solid var(--border-soft);">
        <div style="display:flex; gap:8px; align-items:center;">
          <button type="button" class="view-mode-tab active" id="et-btn-mode-tree" onclick="switchExpenseViewMode('tree')">
            <span>🌲</span> شجرة المصروفات التفاعلية (Tree View)
          </button>
          <button type="button" class="view-mode-tab" id="et-btn-mode-table" onclick="switchExpenseViewMode('table')">
            <span>📋</span> جدول الحركات المسطح (Flat Table)
          </button>
        </div>

        <div id="et-tree-controls" style="display:flex; gap:8px; align-items:center;">
          <button type="button" class="btn btn-sm btn-ghost" onclick="expandAllTreeNodes()" style="font-size:12px; font-weight:700;">
            <span>➕</span> توسيع الكل
          </button>
          <button type="button" class="btn btn-sm btn-ghost" onclick="collapseAllTreeNodes()" style="font-size:12px; font-weight:700;">
            <span>➖</span> طي الكل
          </button>
        </div>
      </div>

      <!-- ═══ 1. INTERACTIVE TREE VIEW CONTAINER ═══ -->
      <div id="et-tree-container" style="display:block;">
        <div id="et-tree-content">
          <div style="text-align:center; padding:36px; color:var(--text-2);">
            <div class="loading-spinner" style="margin:0 auto 12px auto; width:32px; height:32px;"></div>
            جارٍ تحميل وبناء شجرة المصروفات...
          </div>
        </div>
      </div>

      <!-- ═══ 2. FLAT TRANSACTIONS TABLE CARD ═══ -->
      <div class="card" id="et-table-card" style="display:none; border-radius:14px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); overflow:hidden; background:var(--bg-card); margin-bottom:24px;">
        <div class="card-header no-print" style="padding:14px 18px; border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <h3 style="font-family:var(--font-heading); font-size:15px; font-weight:800; margin:0; display:flex; align-items:center; gap:8px;">
            <span>📋</span> سجل حركة المصروفات التفصيلي
          </h3>
          <div style="font-size:12px; color:var(--text-2);">
            * يعرض جميع الحركات المسجلة مرتبة زمنياً
          </div>
        </div>
        <div class="table-container" style="overflow-x:auto;">
          <table class="data-dense" id="et-table" style="width:100%; margin:0; border-collapse:collapse;">
            <thead>
              <tr style="background:var(--bg-2); border-bottom:2px solid var(--border-soft);">
                <th style="width:36px; text-align:center;">#</th>
                <th style="width:95px; text-align:right;">التاريخ</th>
                <th style="width:115px; text-align:right;">رقم السند / القيد</th>
                <th style="min-width:180px; text-align:right;">الحساب المدين / البند</th>
                <th style="width:140px; text-align:right;">التصنيف</th>
                <th style="width:140px; text-align:right;">طريقة الصرف (الدفع من)</th>
                <th style="width:130px; text-align:right;">مركز التكلفة</th>
                <th style="min-width:180px; text-align:right;">البيان / الملاحظات</th>
                <th style="width:125px; text-align:left; color:#dc2626;">المبلغ (ر.س)</th>
                <th style="width:60px; text-align:center;" class="no-print">معاينة</th>
              </tr>
            </thead>
            <tbody id="et-tbody">
              <tr><td colspan="10" style="text-align:center; padding:32px; color:var(--text-2);">جاري تحميل المصروفات...</td></tr>
            </tbody>
            <tfoot id="et-tfoot"></tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL FOR TRANSACTION PREVIEW ═══ -->
    <div class="modal-overlay hidden" id="et-voucher-modal" style="z-index: 1050;">
      <div class="modal modal-md" style="max-width:580px; border-radius:14px;">
        <div class="modal-header" style="background:linear-gradient(135deg,#1e3a8a,#0f172a); color:#fff; border-radius:14px 14px 0 0; padding:14px 20px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">📄</span>
            <h3 class="modal-title" style="color:#fff; font-size:15px; font-weight:800; margin:0;" id="et-vm-title">تفاصيل حركة المصروف</h3>
          </div>
          <button type="button" class="modal-close" style="color:#fff; opacity:0.8;" onclick="closeModal('et-voucher-modal')">×</button>
        </div>
        <div class="modal-body" style="padding:20px;" id="et-vm-body">
          <!-- Dynamic details content -->
        </div>
        <div class="modal-footer" style="padding:12px 20px; background:var(--bg-2); border-radius:0 0 14px 14px; display:flex; justify-content:space-between; align-items:center;">
          <button type="button" class="btn btn-ghost" onclick="closeModal('et-voucher-modal')">إغلاق</button>
          <button type="button" class="btn btn-primary" id="et-vm-print-btn" onclick="printExpenseTrackingVoucherModal()" style="font-weight:700;">
            🖨️ طباعة السند
          </button>
        </div>
      </div>
    </div>
  `,window.loadExpenseTracking=W,window.filterExpenseTracking=U,window.setExpDatePreset=tt,window.switchExpenseViewMode=st,window.toggleExpenseCategory=at,window.toggleExpenseSubAccount=it,window.expandAllTreeNodes=rt,window.collapseAllTreeNodes=dt,window.exportExpenseTrackingExcel=gt,window.exportExpenseTrackingPDF=ut,window.printExpenseTrackingReport=bt,window.viewExpenseTrackingDetail=ct,window.printExpenseTrackingVoucherModal=pt,await et(),await W()}function Y(t,s=""){const a=String(t||"").trim(),e=String(s||"").trim().toLowerCase();return a.startsWith("5-1-7")||a.startsWith("5-3")||e.includes("نقل بضاعة")||e.includes("شحن")||e.includes("ديزل")||e.includes("سيار")||e.includes("بنزين")||e.includes("محروقات")||e.includes("توزيع")||e.includes("فحص دوري")||e.includes("مرور")?"نقل ولوجستيات":a.startsWith("5-2")||e.includes("رواتب")||e.includes("أجور")||e.includes("بدل")||e.includes("تأمين طبي")||e.includes("مكافأة")||e.includes("عمالة")||e.includes("سعوديين")||e.includes("إقامة")||e.includes("اقامة")||e.includes("تأشير")||e.includes("جوازات")?"موظفين وعمالة":a.startsWith("5-5")||e.includes("تمويل")||e.includes("رسوم بنكي")||e.includes("عمولة بنكي")||e.includes("نقاط بيع")||e.includes("مدى")||e.includes("فوائد")||e.includes("بوابة دفع")?"تمويلية وبنكية":a.startsWith("5-6")||a.startsWith("5-7")||e.includes("إهلاك")||e.includes("اهلاك")||e.includes("استهلاك")||e.includes("مخصص")||e.includes("هالك")?"إهلاك ومخصصات":"إدارية وعمومية"}function L(t){const s={"نقل ولوجستيات":{id:"cat_transport",title:"مصروفات النقل والتوزيع واللوجستيات",codeRange:"5-3, 5-1-7",icon:"🚚",color:"#059669",bgLight:"rgba(16, 185, 129, 0.08)",border:"rgba(16, 185, 129, 0.25)",badgeClass:"badge-logistics"},"موظفين وعمالة":{id:"cat_payroll",title:"مصروفات الموظفين والعمالة والرواتب",codeRange:"5-2",icon:"👥",color:"#1d4ed8",bgLight:"rgba(37, 99, 235, 0.08)",border:"rgba(37, 99, 235, 0.25)",badgeClass:"badge-staff"},"إدارية وعمومية":{id:"cat_admin",title:"المصروفات الإدارية والعمومية والتشغيلية",codeRange:"5-4",icon:"🏢",color:"#6d28d9",bgLight:"rgba(124, 58, 237, 0.08)",border:"rgba(124, 58, 237, 0.25)",badgeClass:"badge-admin"},"تمويلية وبنكية":{id:"cat_finance",title:"المصروفات التمويلية والبنكية",codeRange:"5-5",icon:"💳",color:"#d97706",bgLight:"rgba(217, 119, 6, 0.08)",border:"rgba(217, 119, 6, 0.25)",badgeClass:"badge-finance"},"إهلاك ومخصصات":{id:"cat_deprec",title:"الإهلاك والاستهلاك والمخصصات",codeRange:"5-6, 5-7",icon:"📉",color:"#374151",bgLight:"rgba(107, 114, 128, 0.08)",border:"rgba(107, 114, 128, 0.25)",badgeClass:"badge-deprec"}};return s[t]||s["إدارية وعمومية"]}function X(t){return t?{expense:"سند صرف",cash:"صرف نقدي",bank:"تحويل بنكي",journal:"قيد يومية",manual:"قيد يدوي",payroll:"مسير رواتب",pos:"نقطة بيع",payment:"سند صرف"}[t]||t:"قيد محاسبي"}function tt(t){const s=document.getElementById("et-from"),a=document.getElementById("et-to");if(!s||!a)return;const e=new Date,o=e.getFullYear(),i=e.getMonth(),d=e.getDate(),p=b=>String(b).padStart(2,"0"),c=(b,f,h)=>`${b}-${p(f)}-${p(h)}`,y=c(o,i+1,d);if(document.querySelectorAll(".exp-preset-btn").forEach(b=>{const f=b.dataset.preset===t;b.classList.toggle("btn-primary",f),b.classList.toggle("btn-ghost",!f)}),t==="today")s.value=y,a.value=y;else if(t==="yesterday"){const b=new Date(e);b.setDate(d-1);const f=c(b.getFullYear(),b.getMonth()+1,b.getDate());s.value=f,a.value=f}else if(t==="week"){const b=e.getDay(),f=new Date(e);f.setDate(d-(b+1)%7),s.value=c(f.getFullYear(),f.getMonth()+1,f.getDate()),a.value=y}else if(t==="month")s.value=c(o,i+1,1),a.value=y;else if(t==="last_month"){const b=i===0?11:i-1,f=i===0?o-1:o,h=new Date(o,i,0).getDate();s.value=c(f,b+1,1),a.value=c(f,b+1,h)}else if(t==="quarter"){const b=Math.floor(i/3)*3;s.value=c(o,b+1,1),a.value=y}else t==="year"?(s.value=c(o,1,1),a.value=y):t==="all"&&(s.value="2020-01-01",a.value=y);W()}async function et(){try{const[t,s]=await Promise.all([R(T.chartOfAccounts(),[q("code")]).catch(()=>[]),R(T.costCenters(),[q("name")]).catch(()=>[])]);E={},t.forEach(o=>{o.id&&(E[o.id]=o),o.code&&(E[o.code]=o),o.name&&(E[o.name.trim().toLowerCase()]=o)}),_=s||[],N={},_.forEach(o=>{o.id&&(N[o.id]=o),o.name&&(N[o.name]=o,N[o.name.trim().toLowerCase()]=o)}),K=t.filter(o=>{const i=String(o.code||"").trim(),d=String(o.name||"").trim().toLowerCase();return i.startsWith("1")||i.startsWith("2")||i.startsWith("3")||i.startsWith("4")?!1:i.startsWith("5-1")?i.startsWith("5-1-7")||d.includes("نقل بضاعة"):d.includes("بضاعة مباعة")||d.includes("بضاعه مباعه")||d.includes("تكلفة مبيعات")||d.includes("تكلفة المبيعات")||d.includes("تكلفة البضاعة")?!1:o.type==="expense"||i.startsWith("5")});const a=document.getElementById("et-account-filter");a&&(a.innerHTML='<option value="">الكل (جميع الحسابات)</option>'+K.map(o=>`<option value="${o.id||o.code}">${o.code} — ${o.name}</option>`).join(""));const e=document.getElementById("et-cc-filter");e&&(e.innerHTML='<option value="">الكل (جميع المراكز والمناديب)</option>'+_.map(o=>{const i=o.type==="vehicle"?"🚐":o.type==="branch"?"🏢":"📁";return`<option value="${o.id}">${i} ${o.name}</option>`}).join("")+'<option value="unassigned">⚪ غير محدد / عام (بدون مركز)</option>')}catch(t){console.error("loadFilters error:",t)}}async function W(){const t=document.getElementById("et-from")?.value||"",s=document.getElementById("et-to")?.value||"",a=document.getElementById("et-period");a&&(a.textContent=`الفترة من ${t||"البداية"} إلى ${s||"اليوم"}`);const e=document.getElementById("et-tbody");e&&(e.innerHTML='<tr><td colspan="10" style="text-align:center;padding:36px;color:var(--text-2);"><div class="loading-spinner" style="margin:0 auto 12px auto;width:32px;height:32px;"></div>جارٍ استخراج وتدقيق بيانات المصروفات وسندات الصرف والقيود...</td></tr>');const o=document.getElementById("et-tree-content");o&&(o.innerHTML='<div style="text-align:center;padding:36px;color:var(--text-2);"><div class="loading-spinner" style="margin:0 auto 12px auto;width:32px;height:32px;"></div>جارٍ استخراج وتدقيق بيانات المصروفات وسندات الصرف والقيود...</div>');try{let i=T.expenses();t&&s&&(i=j(T.expenses(),B("date",">=",t),B("date","<=",s),H(3e3)));const p=(await V(i).catch(()=>({docs:[]}))).docs.map(r=>({id:r.id,...r.data()}));let c=T.journalEntries();t&&s&&(c=j(T.journalEntries(),B("date",">=",t),B("date","<=",s),H(4e3)));const b=(await V(c).catch(()=>({docs:[]}))).docs.map(r=>({id:r.id,...r.data()}));p.sort((r,x)=>(r.date||"").localeCompare(x.date||"")),p.forEach((r,x)=>{r.displayCode||(r.displayCode=`PV-${String(x+101).padStart(5,"0")}`)});const f=[],h=new Set;p.forEach(r=>{const x=E[r.targetId]||E[r.accountId]||E[r.accountCode]||E[r.accountName]||E[(r.accountName||"").trim().toLowerCase()],m=String(x?.code||r.accountCode||"").trim(),v=x?.name||r.accountName||r.destinationName||"",u=String(r.entityType||"").trim().toLowerCase();if(u==="supplier"||u==="customer"||m.startsWith("1-")||m.startsWith("2-")||m.startsWith("3-")||m.startsWith("4-"))return;const l=(v+" "+(r.notes||"")).toLowerCase();if((l.includes("جاري المالك")||l.includes("جاري الشريك")||l.includes("عهدة")||l.includes("سلفة")||l.includes("سداد مورد")||l.includes("سداد مستحقات"))&&!m.startsWith("5")||m.startsWith("5-1")&&!m.startsWith("5-1-7")||l.includes("تكلفة بضاعة")||l.includes("تكلفة مبيعات")||l.includes("تكلفة البضاعة")||!(m.startsWith("5")&&(!m.startsWith("5-1")||m.startsWith("5-1-7"))||x?.type==="expense"&&(!m.startsWith("5-1")||m.startsWith("5-1-7"))||l.includes("نقل بضاعة")||l.includes("شحن")||l.includes("ضيافة")||l.includes("ديزل")||l.includes("محروقات")||l.includes("صيانة")))return;const n=m||(l.includes("نقل بضاعة")?"5-1-7":"5-4-14"),g=v||(l.includes("نقل بضاعة")?"مصروفات نقل بضاعة (للداخل)":"مصروف عام"),k=Y(n,g),C=r.costCenterName||N[r.costCenterId]?.name||"—",A=parseFloat(r.amount||0);A<=0||isNaN(A)||(h.add(r.id),f.push({id:r.id,sourceDocId:r.id,sourceType:"expense",date:r.date||"",refNumber:r.displayCode||r.number||"PV-"+r.id.substring(0,6).toUpperCase(),accountName:g,accountCode:n,targetId:x?.id||r.targetId||"",expenseClass:k,method:r.method||"cash",sourceName:r.sourceName||(r.method==="cash"?"الصندوق":"البنك"),costCenterId:r.costCenterId||null,costCenterName:C,notes:r.notes||"سند صرف",amount:A,rawObj:r}))});const z=new Set(["salescogs","sales_cogs","cogs","salesreturncogs","sales_return_cogs","poscogs","salesinvoice","sales","salesreturn","sales_return","purchaseinvoice","purchase","purchasereturn","purchase_return","stocktransfer","stockadjustment","physical_count","initialbalance","receipt"]);b.forEach(r=>{const x=String(r.sourceType||"").trim().toLowerCase();if(z.has(x)||x==="expense"&&r.sourceId&&h.has(r.sourceId))return;const m=String(r.description||"").toLowerCase();m.includes("تكلفة بضاعة")||m.includes("تكلفة مبيعات")||m.includes("تكلفة بضاعه")||m.includes("تكلفة البضاعة")||(r.lines||[]).forEach((v,u)=>{const l=parseFloat(v.debit||0);if(l<=0||isNaN(l))return;const $=E[v.accountCode]||E[v.accountId]||E[v.accountName]||E[(v.accountName||"").trim().toLowerCase()],n=String(v.accountCode||$?.code||"").trim(),g=v.accountName||$?.name||"";if(n.startsWith("1-")||n.startsWith("2-")||n.startsWith("3-")||n.startsWith("4-")||n.startsWith("5-1")&&!n.startsWith("5-1-7")||g.includes("بضاعة مباعة")||g.includes("بضاعه مباعه")||g.includes("تكلفة مبيعات")||g.includes("تكلفة المبيعات")||g.includes("تكلفة البضاعة"))return;const k=String(v.note||"").toLowerCase();if(k.includes("تكلفة بضاعة")||k.includes("تكلفة مبيعات")||k.includes("تكلفة بضاعه")||!(n.startsWith("5")&&(!n.startsWith("5-1")||n.startsWith("5-1-7"))||$?.type==="expense"&&(!n.startsWith("5-1")||n.startsWith("5-1-7"))))return;const A=Y(n,g),O=v.costCenterId||r.costCenterId||null,J=v.costCenterName||r.costCenterName||N[O]?.name||"—";f.push({id:`${r.id}_${u}`,sourceDocId:r.id,sourceType:r.sourceType||"journal",date:r.date||"",refNumber:r.entryNumber||r.refNumber||"JE-"+(r.number||r.id.substring(0,6)).toUpperCase(),accountName:g||"مصروف",accountCode:n,targetId:$?.id||v.accountId||"",expenseClass:A,method:r.sourceType==="payroll"?"payroll":"journal",sourceName:X(r.sourceType),costCenterId:O,costCenterName:J,notes:v.note||r.description||"قيد يومية",amount:l,rawObj:r})})}),P=f,U(),xt(t,s)}catch(i){console.error("loadExpenseTracking error:",i),window.showToast&&window.showToast("فشل تحميل تتبع المصروفات: "+i.message,"danger")}}function U(){const t=document.getElementById("et-class-filter")?.value||"",s=document.getElementById("et-account-filter")?.value||"",a=document.getElementById("et-cc-filter")?.value||"",e=document.getElementById("et-method-filter")?.value||"",o=(document.getElementById("et-search")?.value||"").trim().toLowerCase();let i=[...P];if(t&&(i=i.filter(n=>n.expenseClass===t)),s){const n=E[s],g=n?.code||s,k=n?.name||"";i=i.filter(C=>!!(C.targetId===s||C.accountCode===g||g&&C.accountCode&&C.accountCode.startsWith(g)||k&&C.accountName&&C.accountName.trim().toLowerCase()===k.trim().toLowerCase()))}if(a)if(a==="unassigned")i=i.filter(n=>!n.costCenterId||n.costCenterName==="—"||n.costCenterName===""||n.costCenterName==="بدون مركز تكلفة");else{const g=(N[a]?.name||a).trim().toLowerCase();i=i.filter(k=>{if(k.costCenterId===a)return!0;const C=(k.costCenterName||"").trim().toLowerCase();return!!(C&&C===g||C&&g&&(C.includes(g)||g.includes(C)))})}e&&(e==="cash"?i=i.filter(n=>n.method==="cash"):e==="bank"?i=i.filter(n=>n.method==="bank"):e==="journal"&&(i=i.filter(n=>n.method!=="cash"&&n.method!=="bank"))),o&&(i=i.filter(n=>(n.refNumber||"").toLowerCase().includes(o)||(n.accountName||"").toLowerCase().includes(o)||(n.accountCode||"").toLowerCase().includes(o)||(n.notes||"").toLowerCase().includes(o)||(n.sourceName||"").toLowerCase().includes(o)||(n.costCenterName||"").toLowerCase().includes(o)||String(n.amount||"").includes(o))),i.sort((n,g)=>(g.date||"").localeCompare(n.date||"")||(g.refNumber||"").localeCompare(n.refNumber||""));const d=i.reduce((n,g)=>n+(parseFloat(g.amount)||0),0),p=i.filter(n=>n.expenseClass==="نقل ولوجستيات").reduce((n,g)=>n+(parseFloat(g.amount)||0),0),c=i.filter(n=>n.expenseClass==="موظفين وعمالة").reduce((n,g)=>n+(parseFloat(g.amount)||0),0),y=i.filter(n=>n.expenseClass==="إدارية وعمومية").reduce((n,g)=>n+(parseFloat(g.amount)||0),0),b=i.filter(n=>n.expenseClass==="تمويلية وبنكية"||n.expenseClass==="إهلاك ومخصصات").reduce((n,g)=>n+(parseFloat(g.amount)||0),0),f=d>0?Math.round(p/d*1e3)/10:0,h=d>0?Math.round(c/d*1e3)/10:0,z=d>0?Math.round(y/d*1e3)/10:0,r=d>0?Math.round(b/d*1e3)/10:0,x=document.getElementById("et-from")?.value||"",m=document.getElementById("et-to")?.value||"";let v=1;if(x&&m){const n=new Date(x),g=new Date(m);v=Math.max(1,Math.round((g-n)/(1e3*60*60*24))+1)}const u=Math.round(d/v*100)/100,l=(n,g)=>{const k=document.getElementById(n);k&&(k.textContent=g)};l("et-total-amount",w(d)),l("et-total-logistics",w(p)),l("et-total-payroll",w(c)),l("et-total-admin",w(y)),l("et-total-fin",w(b)),l("et-burn-rate",`${w(u)} / يوم`),l("et-count-badge",`${i.length} حركة مسجلة`);const $=(n,g)=>{const k=document.getElementById(n);k&&(k.textContent=`(${g}%)`)};$("et-pct-logistics",f),$("et-pct-payroll",h),$("et-pct-admin",z),$("et-pct-fin",r),(o||t||s)&&i.forEach(n=>{const g=L(n.expenseClass);I.add(g.id);const k=`${g.id}_${n.accountCode||n.accountName}`;S.add(k)}),ot(i,d),nt(i,d,p,c,y,b),lt(i)}function ot(t,s){const a=document.getElementById("et-tree-content");if(!a)return;if(t.length===0){a.innerHTML=`
      <div style="text-align:center; padding:48px 20px; background:var(--bg-card); border-radius:14px; border:1px solid var(--border-soft); color:var(--text-2);">
        <div style="font-size:36px; margin-bottom:12px;">🔍</div>
        <div style="font-size:15px; font-weight:800; color:var(--text-1); margin-bottom:6px;">لا توجد مصروفات مطابقة للبحث أو الفلاتر</div>
        <div style="font-size:12px; color:var(--text-3);">جرب تغيير نطاق التواريخ أو تصفير الفلاتر لمعاينة المصروفات</div>
      </div>
    `;return}const e=["نقل ولوجستيات","موظفين وعمالة","إدارية وعمومية","تمويلية وبنكية","إهلاك ومخصصات"],o={};e.forEach(d=>{const p=L(d);o[d]={meta:p,total:0,subAccounts:{}}}),t.forEach(d=>{const p=d.expenseClass||"إدارية وعمومية";o[p]||(o[p]={meta:L(p),total:0,subAccounts:{}}),o[p].total+=parseFloat(d.amount||0);const c=d.accountCode||d.accountName||"other";o[p].subAccounts[c]||(o[p].subAccounts[c]={code:d.accountCode||"—",name:d.accountName||"بند مصروف",total:0,txns:[]}),o[p].subAccounts[c].total+=parseFloat(d.amount||0),o[p].subAccounts[c].txns.push(d)});let i="";e.forEach(d=>{const p=o[d];if(!p||p.total<=0)return;const c=p.meta,y=I.has(c.id),b=s>0?(p.total/s*100).toFixed(1):"0.0",f=Object.keys(p.subAccounts).length,h=Object.values(p.subAccounts).reduce((r,x)=>r+x.txns.length,0);i+=`
      <div class="tree-cat-card" id="tree-cat-${c.id}">
        <!-- Level 1: Category Header -->
        <div class="tree-cat-header" onclick="toggleExpenseCategory('${c.id}')">
          <div style="display:flex; align-items:center; gap:12px; flex:1; flex-wrap:wrap;">
            <span class="chevron-icon ${y?"open":""}" id="chevron-${c.id}">▶</span>
            <span style="font-size:20px; line-height:1;">${c.icon}</span>
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:15px; font-weight:900; color:var(--text-0);">${c.title}</span>
                <span class="mono badge ${c.badgeClass}" style="font-size:11px; padding:2px 8px;">[${c.codeRange}]</span>
              </div>
              <div style="font-size:11.5px; color:var(--text-3); margin-top:2px; font-weight:600;">
                <span>${f} بند تفصيلي</span> • <span>${h} حركة مسجلة</span>
              </div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:16px;">
            <!-- Mini Progress Bar -->
            <div class="no-print" style="width:90px; text-align:left; display:none; @media (min-width:640px){ display:block; }">
              <div style="font-size:10.5px; font-weight:800; color:var(--text-2); margin-bottom:3px; text-align:left;" class="mono">${b}%</div>
              <div style="width:100%; height:6px; background:rgba(0,0,0,0.06); border-radius:3px; overflow:hidden;">
                <div style="width:${Math.min(100,Math.max(2,b))}%; height:100%; background:${c.color}; border-radius:3px;"></div>
              </div>
            </div>

            <div style="text-align:left;">
              <div class="mono font-bold" style="font-size:16.5px; color:${c.color};">${w(p.total)}</div>
              <div class="mono" style="font-size:11px; color:var(--text-3); font-weight:700;">${b}% من الإجمالي</div>
            </div>
          </div>
        </div>

        <!-- Level 2: Sub-Accounts List -->
        <div class="tree-cat-body" id="body-${c.id}" style="display:${y?"block":"none"};">
    `,Object.keys(p.subAccounts).sort((r,x)=>p.subAccounts[x].total-p.subAccounts[r].total).forEach(r=>{const x=p.subAccounts[r],m=`${c.id}_${x.code.replace(/[^a-zA-Z0-9]/g,"_")}`,v=S.has(m),u=p.total>0?(x.total/p.total*100).toFixed(1):"0.0";i+=`
        <div class="tree-sub-card" id="subcard-${m}">
          <!-- Sub-Account Header -->
          <div class="tree-sub-header" onclick="toggleExpenseSubAccount('${m}')">
            <div style="display:flex; align-items:center; gap:10px; flex:1; flex-wrap:wrap;">
              <span class="chevron-icon ${v?"open":""}" id="chevron-${m}">▶</span>
              <span class="mono badge" style="font-size:11px; font-weight:800; background:rgba(30,58,138,0.06); color:#1e3a8a; border:1px solid rgba(30,58,138,0.18);">
                ${x.code}
              </span>
              <span style="font-size:13.5px; font-weight:800; color:var(--text-0);">${x.name}</span>
              <span style="font-size:11px; color:var(--text-3); font-weight:600;">(${x.txns.length} حركة)</span>
            </div>

            <div style="display:flex; align-items:center; gap:12px;">
              <span class="mono" style="font-size:11px; color:var(--text-3); font-weight:700;">(${u}% من الفئة)</span>
              <span class="mono font-bold" style="font-size:14.5px; color:#dc2626;">${w(x.total)}</span>
            </div>
          </div>

          <!-- Level 3: Detailed Transactions Table -->
          <div class="tree-sub-body" id="body-${m}" style="display:${v?"block":"none"};">
            <div style="overflow-x:auto;">
              <table class="data-dense" style="width:100%; margin:0; border-collapse:collapse; font-size:12px;">
                <thead>
                  <tr style="background:var(--bg-1); border-bottom:1.5px solid var(--border-soft); color:var(--text-2);">
                    <th style="width:32px; text-align:center;">#</th>
                    <th style="width:90px; text-align:right;">التاريخ</th>
                    <th style="width:110px; text-align:right;">رقم السند/القيد</th>
                    <th style="width:125px; text-align:right;">طريقة الصرف</th>
                    <th style="width:130px; text-align:right;">مركز التكلفة / المندوب</th>
                    <th style="min-width:180px; text-align:right;">البيان والملاحظات</th>
                    <th style="width:110px; text-align:left; color:#dc2626;">المبلغ</th>
                    <th style="width:50px; text-align:center;" class="no-print">معاينة</th>
                  </tr>
                </thead>
                <tbody>
      `,x.txns.forEach((l,$)=>{let n="badge-journal",g="📝";l.method==="cash"?(n="badge-cash",g="💵"):l.method==="bank"&&(n="badge-bank",g="🏦"),i+=`
          <tr style="border-bottom:1px solid var(--border-soft); transition:background 0.15s ease;">
            <td style="text-align:center; font-size:11px; color:var(--text-3);">${$+1}</td>
            <td class="mono font-bold" style="white-space:nowrap; font-size:11.5px;">${l.date||"—"}</td>
            <td class="mono font-bold" style="white-space:nowrap;">
              <span class="badge" style="font-size:11px; background:rgba(30,58,138,0.06); color:#1e3a8a; border:1px solid rgba(30,58,138,0.18);">
                ${l.refNumber}
              </span>
            </td>
            <td>
              <span class="badge ${n}" style="font-size:11px; font-weight:700;">
                ${g} ${l.sourceName}
              </span>
            </td>
            <td>
              <span style="font-size:11.5px; color:${l.costCenterName!=="—"?"#0f766e":"var(--text-3)"}; font-weight:${l.costCenterName!=="—"?"700":"normal"};">
                ${l.costCenterName!=="—"?"🏷️ "+l.costCenterName:"—"}
              </span>
            </td>
            <td style="font-size:11.5px; max-width:260px; line-height:1.4;" title="${(l.notes||"").replace(/"/g,"&quot;")}">
              ${l.notes||"—"}
            </td>
            <td class="mono font-bold" style="text-align:left; color:#dc2626; font-size:12.5px; white-space:nowrap;">
              ${w(l.amount)}
            </td>
            <td class="no-print" style="text-align:center; white-space:nowrap;">
              <button type="button" class="btn btn-icon sm btn-ghost" onclick="viewExpenseTrackingDetail('${l.id}')" title="معاينة تفاصيل الحركة" style="color:var(--brand); font-size:13px; padding:2px 6px;">
                👁️
              </button>
            </td>
          </tr>
        `}),i+=`
                </tbody>
                <tfoot>
                  <tr style="background:var(--bg-1); border-top:1.5px solid var(--border-soft); font-weight:800; font-size:11.5px;">
                    <td colspan="6" style="text-align:right; padding:6px 12px; color:var(--text-2);">
                      مجموع بند [${x.name}] (${x.txns.length} حركة)
                    </td>
                    <td class="mono font-bold" style="text-align:left; color:#dc2626; padding:6px 12px;">
                      ${w(x.total)}
                    </td>
                    <td class="no-print"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      `}),i+=`
        </div>
      </div>
    `}),a.innerHTML=i}function nt(t,s,a,e,o,i){const d=document.getElementById("et-tbody");if(!d)return;if(t.length===0){d.innerHTML='<tr><td colspan="10" style="text-align:center;padding:36px;color:var(--text-2);font-size:13px;">لا توجد أي مصروفات تطابق الفلاتر المحددة</td></tr>';const c=document.getElementById("et-tfoot");c&&(c.innerHTML="");return}d.innerHTML=t.map((c,y)=>{const b=L(c.expenseClass);let f="badge-journal",h="📝";return c.method==="cash"?(f="badge-cash",h="💵"):c.method==="bank"&&(f="badge-bank",h="🏦"),`
      <tr style="transition:background 0.15s ease;">
        <td style="text-align:center; font-size:11px; color:var(--text-3); width:36px;">${y+1}</td>
        <td class="mono font-bold" style="white-space:nowrap; font-size:12px;">${c.date||"—"}</td>
        <td class="mono font-bold" style="white-space:nowrap;">
          <span class="badge" style="font-size:11.5px; background:rgba(30,58,138,0.08); color:#1e3a8a; border:1px solid rgba(30,58,138,0.2);">
            ${c.refNumber}
          </span>
        </td>
        <td>
          <div style="font-weight:700; font-size:12.5px; color:var(--text-0);">${c.accountName}</div>
          ${c.accountCode?`<div class="mono" style="font-size:11px; color:var(--text-3);">${c.accountCode}</div>`:""}
        </td>
        <td>
          <span class="badge ${b.badgeClass}" style="font-size:11.5px; font-weight:700;">
            ${b.icon} ${b.title}
          </span>
        </td>
        <td>
          <span class="badge ${f}" style="font-size:11.5px; font-weight:700;">
            ${h} ${c.sourceName}
          </span>
        </td>
        <td>
          <span style="font-size:12px; color:${c.costCenterName!=="—"?"#0f766e":"var(--text-3)"}; font-weight:${c.costCenterName!=="—"?"700":"normal"};">
            ${c.costCenterName!=="—"?"🏷️ "+c.costCenterName:"—"}
          </span>
        </td>
        <td style="font-size:12px; max-width:280px; line-height:1.4;" title="${(c.notes||"").replace(/"/g,"&quot;")}">
          ${c.notes||"—"}
        </td>
        <td class="mono font-bold" style="text-align:left; color:#dc2626; font-size:13.5px; white-space:nowrap;">
          ${w(c.amount)}
        </td>
        <td class="no-print" style="text-align:center; white-space:nowrap;">
          <button type="button" class="btn btn-icon sm btn-ghost" onclick="viewExpenseTrackingDetail('${c.id}')" title="معاينة تفاصيل الحركة" style="color:var(--brand); font-size:14px;">
            👁️
          </button>
        </td>
      </tr>
    `}).join("");const p=document.getElementById("et-tfoot");p&&(p.innerHTML=`
      <tr style="background:var(--bg-2); border-top:2px solid var(--border-soft); font-weight:800;">
        <td colspan="3" style="text-align:right; padding:12px 16px; font-size:13px;">
          إجمالي المصروفات المعروضة (${t.length} حركة)
        </td>
        <td colspan="5" style="text-align:left; font-size:12px; color:var(--text-2); padding:12px 16px;">
          لوجستيات ونقل: <strong style="color:#059669;">${w(a)}</strong> |
          رواتب وعمالة: <strong style="color:#1d4ed8;">${w(e)}</strong> |
          إدارية: <strong style="color:#6d28d9;">${w(o)}</strong> |
          تمويلية وإهلاك: <strong style="color:#d97706;">${w(i)}</strong>
        </td>
        <td class="mono font-bold" style="text-align:left; font-size:15px; color:#dc2626; padding:12px 16px;">
          ${w(s)}
        </td>
        <td class="no-print"></td>
      </tr>
    `)}function st(t){const s=document.getElementById("et-tree-container"),a=document.getElementById("et-table-card"),e=document.getElementById("et-tree-controls"),o=document.getElementById("et-btn-mode-tree"),i=document.getElementById("et-btn-mode-table");t==="tree"?(s&&(s.style.display="block"),a&&(a.style.display="none"),e&&(e.style.display="flex"),o?.classList.add("active"),i?.classList.remove("active")):(s&&(s.style.display="none"),a&&(a.style.display="block"),e&&(e.style.display="none"),i?.classList.add("active"),o?.classList.remove("active"))}function at(t){const s=document.getElementById(`body-${t}`),a=document.getElementById(`chevron-${t}`);if(!s)return;s.style.display!=="none"?(s.style.display="none",a?.classList.remove("open"),I.delete(t)):(s.style.display="block",a?.classList.add("open"),I.add(t))}function it(t){const s=document.getElementById(`body-${t}`),a=document.getElementById(`chevron-${t}`);if(!s)return;s.style.display!=="none"?(s.style.display="none",a?.classList.remove("open"),S.delete(t)):(s.style.display="block",a?.classList.add("open"),S.add(t))}function rt(){document.querySelectorAll(".tree-cat-body").forEach(t=>t.style.display="block"),document.querySelectorAll(".tree-sub-body").forEach(t=>t.style.display="block"),document.querySelectorAll(".chevron-icon").forEach(t=>t.classList.add("open")),I=new Set(["cat_transport","cat_payroll","cat_admin","cat_finance","cat_deprec"]),document.querySelectorAll("[id^='subcard-']").forEach(t=>{S.add(t.id.replace("subcard-",""))})}function dt(){document.querySelectorAll(".tree-cat-body").forEach(t=>t.style.display="none"),document.querySelectorAll(".tree-sub-body").forEach(t=>t.style.display="none"),document.querySelectorAll(".chevron-icon").forEach(t=>t.classList.remove("open")),I.clear(),S.clear()}function lt(t){D&&(D.destroy(),D=null),M&&(M.destroy(),M=null);const s=document.getElementById("et-category-chart"),a=document.getElementById("et-trend-chart");if(!s||!a||t.length===0)return;const e={};t.forEach(u=>{const l=u.accountName||"مصروف عام";e[l]=(e[l]||0)+parseFloat(u.amount||0)});const o=Object.entries(e).sort((u,l)=>l[1]-u[1]),i=o.slice(0,8),d=o.slice(8).reduce((u,l)=>u+l[1],0);d>0&&i.push(["أخرى",d]);const p=i.map(u=>u[0]),c=i.map(u=>u[1]);D=new Chart(s,{type:"bar",data:{labels:p,datasets:[{label:"المبلغ (ر.س)",data:c,backgroundColor:["#059669","#1d4ed8","#6d28d9","#d97706","#06b6d4","#ec4899","#f97316","#64748b","#94a3b8"],borderRadius:8,borderSkipped:!1,maxBarThickness:32}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{callbacks:{label:u=>` الصرف: ${w(u.raw||0)}`}}},scales:{x:{grid:{display:!1},ticks:{font:{size:11}}},y:{beginAtZero:!0,grid:{color:"rgba(0,0,0,0.05)"}}}}});const y=document.getElementById("et-from")?.value||"",b=document.getElementById("et-to")?.value||"";let f=!1;y&&b&&Math.ceil(Math.abs(new Date(b)-new Date(y))/864e5)<=45&&(f=!0);const h={},z=new Set;t.forEach(u=>{if(!u.date)return;const l=f?u.date:u.date.substring(0,7);z.add(l),h[l]||(h[l]={"نقل ولوجستيات":0,"موظفين وعمالة":0,"إدارية وعمومية":0,"تمويلية وبنكية":0,"إهلاك ومخصصات":0}),h[l][u.expenseClass]!==void 0&&(h[l][u.expenseClass]+=parseFloat(u.amount||0))});const r=Array.from(z).sort(),x=["نقل ولوجستيات","موظفين وعمالة","إدارية وعمومية","تمويلية وبنكية"],m={"نقل ولوجستيات":"#059669","موظفين وعمالة":"#1d4ed8","إدارية وعمومية":"#6d28d9","تمويلية وبنكية":"#d97706"},v=x.map(u=>({label:u,data:r.map(l=>h[l]?.[u]||0),borderColor:m[u],backgroundColor:m[u]+"15",borderWidth:2.5,tension:.3,pointRadius:r.length>20?1:4,pointHoverRadius:6,fill:!0}));M=new Chart(a,{type:"line",data:{labels:r,datasets:v},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"bottom",labels:{boxWidth:12,usePointStyle:!0,font:{size:11,weight:"bold"}}},tooltip:{callbacks:{label:u=>` ${u.dataset.label}: ${w(u.raw||0)}`}}},scales:{x:{grid:{display:!1},ticks:{font:{size:10}}},y:{beginAtZero:!0,grid:{color:"rgba(0,0,0,0.05)"}}}}})}let F=null;function ct(t){const s=P.find(i=>i.id===t);if(!s)return;F=s;const a=L(s.expenseClass),e=document.getElementById("et-vm-title"),o=document.getElementById("et-vm-body");e&&(e.textContent=`تفاصيل حركة المصروف [${s.refNumber}]`),o&&(o.innerHTML=`
      <div style="background:var(--bg-2); border:1.5px solid var(--border-soft); border-radius:12px; padding:16px; margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px dashed var(--border); padding-bottom:8px;">
          <div>
            <span style="font-size:11.5px; color:var(--text-3); font-weight:700;">رقم المرجع:</span>
            <span class="mono font-bold" style="font-size:14px; color:#1e3a8a; margin-right:6px;">${s.refNumber}</span>
          </div>
          <div>
            <span style="font-size:11.5px; color:var(--text-3); font-weight:700;">التاريخ:</span>
            <span class="mono font-bold" style="font-size:13px; color:var(--text-0); margin-right:6px;">${s.date}</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:12.5px;">
          <div>
            <div style="font-size:11px; color:var(--text-3); font-weight:700;">الحساب المدين / البند:</div>
            <div style="font-weight:800; color:var(--text-0); margin-top:2px;">${s.accountName}</div>
            <div class="mono" style="font-size:11px; color:var(--text-3);">${s.accountCode||"—"}</div>
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-3); font-weight:700;">التصنيف المحاسبي:</div>
            <div style="font-weight:800; color:${a.color}; margin-top:2px;">${a.icon} ${a.title}</div>
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-3); font-weight:700;">طريقة الصرف (الدفع من):</div>
            <div style="font-weight:800; color:var(--text-0); margin-top:2px;">${s.sourceName}</div>
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-3); font-weight:700;">مركز التكلفة / المندوب / السيارة:</div>
            <div style="font-weight:800; color:var(--text-0); margin-top:2px;">${s.costCenterName}</div>
          </div>
        </div>
      </div>

      <div style="background:var(--bg-2); border:1.5px solid var(--border-soft); border-radius:12px; padding:16px; margin-bottom:14px;">
        <div style="font-size:11px; color:var(--text-3); font-weight:700; margin-bottom:4px;">البيان والملاحظات:</div>
        <div style="font-size:13px; color:var(--text-0); font-weight:600; line-height:1.5;">${s.notes||"لا توجد ملاحظات إضافية"}</div>
      </div>

      <div style="background:rgba(239,68,68,0.06); border:1.5px solid rgba(239,68,68,0.25); border-radius:12px; padding:16px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:13.5px; font-weight:800; color:#dc2626;">المبلغ الإجمالي المصروف:</span>
        <span class="mono font-bold" style="font-size:20px; color:#dc2626;">${w(s.amount)}</span>
      </div>
    `),typeof openModal=="function"&&openModal("et-voucher-modal")}function pt(){if(!F)return;const t=F;let s={};try{const e=localStorage.getItem("idham_company");e?s=JSON.parse(e):window.ERP_COMPANY&&(s=window.ERP_COMPANY)}catch{}const a=window.open("","_blank","width=850,height=700");a.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>سند صرف - ${t.refNumber}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 24px; color: #1e293b; direction: rtl; }
        .box { border: 2px solid #1e3a8a; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 16px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
        .row-item { background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .lbl { font-size: 11px; color: #64748b; font-weight: bold; margin-bottom: 3px; }
        .val { font-size: 13.5px; font-weight: 800; color: #0f172a; }
        .amount-card { background: #fef2f2; border: 2px solid #ef4444; border-radius: 10px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; }
        .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; }
        .sign-col { text-align: center; width: 180px; }
        .sign-line { border-bottom: 1px dashed #64748b; margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="header">
          <div>
            <h2 style="margin:0; color:#1e3a8a;">${s.name||"مؤسسة إدهام للمواد الغذائية"}</h2>
            <div style="font-size:11px; color:#64748b; margin-top:4px;">سجل تجاري: ${s.crNumber||"—"} | الرقم الضريبي: ${s.vatNumber||"—"}</div>
          </div>
          <div style="text-align:left;">
            <h3 style="margin:0; color:#dc2626;">سـنـد صـرف</h3>
            <div style="font-family:monospace; font-size:14px; font-weight:bold; color:#1e3a8a; margin-top:4px;">${t.refNumber}</div>
            <div style="font-size:11px; color:#64748b; margin-top:2px;">التاريخ: ${t.date}</div>
          </div>
        </div>

        <div class="grid">
          <div class="row-item"><div class="lbl">الحساب المدين / البند:</div><div class="val">${t.accountName} (${t.accountCode||"—"})</div></div>
          <div class="row-item"><div class="lbl">التصنيف المحاسبي:</div><div class="val">${t.expenseClass}</div></div>
          <div class="row-item"><div class="lbl">طريقة الدفع (الحساب الدائن):</div><div class="val">${t.sourceName}</div></div>
          <div class="row-item"><div class="lbl">مركز التكلفة / المندوب:</div><div class="val">${t.costCenterName}</div></div>
        </div>

        <div class="row-item" style="margin-bottom:16px;">
          <div class="lbl">البيان والملاحظات:</div>
          <div class="val" style="font-weight:600;">${t.notes||"—"}</div>
        </div>

        <div class="amount-card">
          <span style="font-size:14px; font-weight:800; color:#991b1b;">المبلغ المصروف:</span>
          <span style="font-size:22px; font-weight:900; color:#dc2626; font-family:monospace;">${w(t.amount)}</span>
        </div>

        <div class="signatures">
          <div class="sign-col"><div class="lbl">المحاسب المسؤول</div><div class="sign-line"></div></div>
          <div class="sign-col"><div class="lbl">المدير المالي</div><div class="sign-line"></div></div>
          <div class="sign-col"><div class="lbl">المستلم / صاحب الصرف</div><div class="sign-line"></div></div>
        </div>
      </div>
      <script>window.onload = function() { window.print(); };<\/script>
    </body>
    </html>
  `),a.document.close()}async function gt(){const t=document.getElementById("et-from")?.value||"",s=document.getElementById("et-to")?.value||"",a=[...P];if(a.length===0){window.showToast&&window.showToast("لا توجد بيانات لتصديرها","warn");return}const e=["#","التاريخ","رقم السند/القيد","كود الحساب","اسم الحساب المدين","التصنيف الرئيسي","طريقة الصرف","مركز التكلفة","البيان والملاحظات","المبلغ (ر.س)"],o=a.map((d,p)=>[p+1,d.date||"",d.refNumber||"",d.accountCode||"",d.accountName||"",d.expenseClass||"",d.sourceName||"",d.costCenterName||"",d.notes||"",parseFloat(d.amount||0)]),i=a.reduce((d,p)=>d+(parseFloat(p.amount)||0),0);o.push(["","","","","الإجمالي العام لمصروفات الشركة","","","","",i]),await G({title:`تتبع_مصروفات_الشركة_${t}_إلى_${s}`,headers:e,rows:o,colWidths:[6,12,16,12,26,18,18,18,32,16]}),window.showToast&&window.showToast("تم تصدير ملف الإكسيل بنجاح 📊","success")}function ut(){typeof exportPagePDF=="function"?exportPagePDF("#et-tree-container","تقرير_تتبع_مصروفات_الشركة_التفصيلي"):window.print()}function bt(){window.print()}function xt(t,s){let a={};try{const p=localStorage.getItem("idham_company");p?a=JSON.parse(p):window.ERP_COMPANY&&(a=window.ERP_COMPANY)}catch{}const e=document.getElementById("et-print-logo");e&&(a.logoBase64||a.logoUrl?(e.src=a.logoBase64||a.logoUrl,e.style.display="block"):e.style.display="none");const o=document.getElementById("et-print-co-name");o&&(o.textContent=a.name||"مؤسسة إدهام للمواد الغذائية");const i=document.getElementById("et-print-co-details");if(i){const p=[];a.address&&p.push(`📍 ${a.address}`),a.phone&&p.push(`📞 ${a.phone}`),a.vatNumber&&p.push(`🔢 الرقم الضريبي: ${a.vatNumber}`),a.crNumber&&p.push(`📋 السجل التجاري: ${a.crNumber}`),i.textContent=p.join(" | ")}const d=document.getElementById("et-print-period");d&&(d.textContent=`الفترة من ${t||"البداية"} إلى ${s||"اليوم"}`)}export{Ct as render};
