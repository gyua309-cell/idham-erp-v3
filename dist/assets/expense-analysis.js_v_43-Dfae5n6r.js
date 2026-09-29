import{s as O,t as S,q as G,b as k,g as q,a as A,f as g,d as K,C as Y}from"./index-ClmVJz2W.js";import{e as st}from"./excel-zCoXiaxq.js";import{orderBy as V,getDocs as rt,query as dt,where as Q,limit as lt,getDoc as J,doc as X}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let Z=[],R=[],tt=[],c=null,v="opex",y="all",j="",$=null,_="",z="amount_desc";async function jt(t,e){const a=O(),o=S();t.innerHTML=`
    <!-- Top Filter Bar -->
    <div class="filterbar no-print" style="flex-wrap:wrap; gap:12px; align-items:flex-end; background:var(--bg-1); padding:14px 18px; border-radius:14px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); margin-bottom:20px;">
      
      <!-- Date Range -->
      <div class="date-range-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">من تاريخ</label>
        <input type="date" id="exp-from" value="${a}" onchange="onExpDateChange()" style="padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12.5px;" />
      </div>
      <div class="date-range-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">إلى تاريخ</label>
        <input type="date" id="exp-to" value="${o}" onchange="onExpDateChange()" style="padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12.5px;" />
      </div>

      <!-- Quick Date Presets -->
      <div style="display:flex; gap:4px; align-items:center; flex-wrap:wrap;">
        <button class="btn btn-sm btn-ghost exp-preset-btn" data-preset="today" onclick="setExpDatePreset('today')" style="font-size:11px; padding:5px 9px;">اليوم</button>
        <button class="btn btn-sm btn-ghost exp-preset-btn" data-preset="yesterday" onclick="setExpDatePreset('yesterday')" style="font-size:11px; padding:5px 9px;">أمس</button>
        <button class="btn btn-sm btn-ghost exp-preset-btn" data-preset="week" onclick="setExpDatePreset('week')" style="font-size:11px; padding:5px 9px;">هذا الأسبوع</button>
        <button class="btn btn-sm btn-ghost exp-preset-btn active" data-preset="month" onclick="setExpDatePreset('month')" style="font-size:11px; padding:5px 9px;">هذا الشهر</button>
        <button class="btn btn-sm btn-ghost exp-preset-btn" data-preset="last_month" onclick="setExpDatePreset('last_month')" style="font-size:11px; padding:5px 9px;">الشهر الماضي</button>
        <button class="btn btn-sm btn-ghost exp-preset-btn" data-preset="quarter" onclick="setExpDatePreset('quarter')" style="font-size:11px; padding:5px 9px;">الربع الحالي</button>
        <button class="btn btn-sm btn-ghost exp-preset-btn" data-preset="year" onclick="setExpDatePreset('year')" style="font-size:11px; padding:5px 9px;">هذا العام</button>
      </div>

      <!-- Scope Filter (نطاق المصروفات) -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">نطاق التحليل المحاسبي</label>
        <select id="exp-scope" onchange="onExpScopeChange()" style="min-width:210px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px; font-weight:600;">
          <option value="opex" selected>المصروفات التشغيلية والإدارية (OpEx)</option>
          <option value="selling">مصروفات البيع والتوزيع (5-3)</option>
          <option value="admin">المصروفات الإدارية والعمومية (5-2)</option>
          <option value="all_with_cogs">جميع المصروفات شاملة تكلفة المبيعات (COGS)</option>
        </select>
      </div>

      <!-- Cost Center Filter -->
      <div class="filter-select-group">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">مركز التكلفة / المندوب</label>
        <select id="exp-cc-filter" onchange="onExpCCChange()" style="min-width:180px; padding:6px 10px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px;">
          <option value="all">الكل (جميع مراكز التكلفة)</option>
        </select>
      </div>

      <!-- Search Input -->
      <div style="flex:1; min-width:160px;">
        <label style="font-weight:700; font-size:12px; color:var(--text-2);">بحث في المصروفات</label>
        <input type="text" id="exp-search" placeholder="كود أو اسم الحساب..." oninput="onExpSearchInput(this.value)" style="width:100%; padding:6px 12px; border:1px solid var(--border); border-radius:8px; background:var(--bg-card); color:var(--text-1); font-size:12px;" />
      </div>

      <!-- Export & Print Actions -->
      <div style="margin-right:auto; display:flex; gap:8px; align-items:center;">
        <button class="btn btn-secondary btn-sm" onclick="exportExpensesExcel()" style="font-weight:700; display:inline-flex; align-items:center; gap:6px; border-radius:8px;">
          <span>📊</span> تصدير Excel
        </button>
        <button class="btn btn-secondary btn-sm" onclick="printExpenseAnalysisPDF()" style="font-weight:700; display:inline-flex; align-items:center; gap:6px; border-radius:8px;">
          <span>🖨️</span> طباعة / PDF
        </button>
      </div>
    </div>

    <!-- Main Page Content -->
    <div class="page-content" style="padding:0 4px;">
      
      <!-- Page Header with Subtitle info -->
      <div class="page-header" style="margin-bottom:18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h1 class="page-title" style="font-size:21px; font-weight:900; color:var(--text-1); margin-bottom:3px; display:flex; align-items:center; gap:8px;">
            <span>💼</span> تقرير تحليل المصروفات ومراكز التكلفة
          </h1>
          <p class="page-subtitle" id="exp-period-label" style="font-size:12.5px; color:var(--text-2); font-weight:600;">
            جاري تحميل البيانات المالية...
          </p>
        </div>
        <div id="exp-scope-badge-container">
          <!-- Dynamic Scope Badge -->
        </div>
      </div>

      <!-- KPIs Grid (5 Cards) -->
      <div class="kpi-grid mb-24" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:14px; margin-bottom:24px;">
        
        <!-- KPI 1: Total Expenses -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:16px 18px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar bad" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#ef4444,#dc2626);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kpi-label" style="font-size:12px; font-weight:700; color:var(--text-2); margin-bottom:4px;" id="kpi-exp-title">إجمالي المصروفات (OpEx)</div>
              <div class="kpi-value mono" id="kpi-exp-total" style="font-size:20px; font-weight:900; color:#ef4444;">—</div>
            </div>
            <div style="width:40px; height:40px; border-radius:10px; background:rgba(239,68,68,0.12); display:flex; align-items:center; justify-content:center; font-size:18px;">💸</div>
          </div>
          <div class="kpi-subtext" id="kpi-exp-subtitle" style="font-size:11px; color:var(--text-3); margin-top:8px; font-weight:600;">
            مصاريف الفترة التشغيلية والإدارية
          </div>
        </div>

        <!-- KPI 2: Net Revenue -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:16px 18px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar indigo" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#6366f1,#4f46e5);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kpi-label" style="font-size:12px; font-weight:700; color:var(--text-2); margin-bottom:4px;">صافي المبيعات والإيرادات</div>
              <div class="kpi-value mono" id="kpi-rev-total" style="font-size:20px; font-weight:900; color:var(--text-1);">—</div>
            </div>
            <div style="width:40px; height:40px; border-radius:10px; background:rgba(99,102,241,0.12); display:flex; align-items:center; justify-content:center; font-size:18px;">📈</div>
          </div>
          <div class="kpi-subtext" style="font-size:11px; color:var(--text-3); margin-top:8px; font-weight:600;">
            إيراد النشاط بعد خصم المردودات
          </div>
        </div>

        <!-- KPI 3: Expense to Revenue Ratio -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:16px 18px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar lime" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#10b981,#059669);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kpi-label" style="font-size:12px; font-weight:700; color:var(--text-2); margin-bottom:4px;">نسبة المصروفات للإيراد</div>
              <div class="kpi-value mono" id="kpi-exp-ratio" style="font-size:20px; font-weight:900; color:#10b981;">—</div>
            </div>
            <div style="width:40px; height:40px; border-radius:10px; background:rgba(16,185,129,0.12); display:flex; align-items:center; justify-content:center; font-size:18px;">📊</div>
          </div>
          <div class="kpi-subtext" id="kpi-ratio-subtitle" style="font-size:11px; color:var(--text-3); margin-top:8px; font-weight:600;">
            التحليل الرأسي لكفاءة الإنفاق
          </div>
        </div>

        <!-- KPI 4: Daily Burn Rate -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:16px 18px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar warn" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#f59e0b,#d97706);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kpi-label" style="font-size:12px; font-weight:700; color:var(--text-2); margin-bottom:4px;">معدل الصرف اليومي</div>
              <div class="kpi-value mono" id="kpi-burn-rate" style="font-size:20px; font-weight:900; color:#f59e0b;">—</div>
            </div>
            <div style="width:40px; height:40px; border-radius:10px; background:rgba(245,158,11,0.12); display:flex; align-items:center; justify-content:center; font-size:18px;">🔥</div>
          </div>
          <div class="kpi-subtext" id="kpi-burn-subtitle" style="font-size:11px; color:var(--text-3); margin-top:8px; font-weight:600;">
            متوسط التكلفة لكل يوم
          </div>
        </div>

        <!-- KPI 5: Top Expense Driver -->
        <div class="kpi-card" style="background:var(--bg-card); border-radius:14px; padding:16px 18px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); position:relative; overflow:hidden;">
          <div class="status-bar purple" style="position:absolute; top:0; right:0; left:0; height:4px; background:linear-gradient(90deg,#8b5cf6,#7c3aed);"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div style="overflow:hidden; max-width:80%;">
              <div class="kpi-label" style="font-size:12px; font-weight:700; color:var(--text-2); margin-bottom:4px;">أكبر بند استهلاكاً للميزانية</div>
              <div class="kpi-value" id="kpi-top-driver" style="font-size:15px; font-weight:800; color:var(--text-1); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">—</div>
            </div>
            <div style="width:40px; height:40px; border-radius:10px; background:rgba(139,92,246,0.12); display:flex; align-items:center; justify-content:center; font-size:18px;">🏆</div>
          </div>
          <div class="kpi-subtext" id="kpi-top-driver-sub" style="font-size:11px; color:var(--text-3); margin-top:8px; font-weight:600;">
            —
          </div>
        </div>

      </div>

      <!-- Visual Composition Bar Card -->
      <div class="card mb-24" style="background:var(--bg-card); border-radius:14px; padding:18px 22px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
          <div>
            <h3 style="font-family:var(--font-heading); font-size:15px; font-weight:800; margin:0 0 2px; color:var(--text-1); display:flex; align-items:center; gap:8px;">
              <span>📊</span> التوزيع الهيكلي والنسبي لبنود المصروفات
            </h3>
            <p style="font-size:12px; color:var(--text-3); margin:0;">
              الوزن النسبي لأهم بنود المصروفات مقارنة بالميزانية التشغيلية
            </p>
          </div>
          <div id="exp-stacked-total-badge" style="font-size:12px; font-weight:700; padding:4px 10px; background:var(--bg-2); border-radius:8px; color:var(--text-2);">
            —
          </div>
        </div>

        <!-- Stacked Percentage Bar -->
        <div id="exp-composition-bar" style="width:100%; height:22px; border-radius:8px; overflow:hidden; display:flex; background:var(--bg-3); margin-bottom:14px; box-shadow:inset 0 1px 3px rgba(0,0,0,0.1);">
          <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-3); font-size:11px;">جاري الاحتساب...</div>
        </div>

        <!-- Legend Chips -->
        <div id="exp-composition-legend" style="display:flex; flex-wrap:wrap; gap:10px 16px; font-size:12px; align-items:center;">
          <!-- Generated chips -->
        </div>
      </div>

      <!-- Main Tables Grid -->
      <div class="grid-2 gap-20" style="display:grid; grid-template-columns:1fr; gap:24px;">
        
        <!-- Table 1: Category Breakdown with Dual Ratio Analysis -->
        <div class="card" style="background:var(--bg-card); border-radius:14px; padding:18px 20px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm);">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
            <div>
              <h3 style="font-family:var(--font-heading); font-size:16px; font-weight:800; margin:0 0 3px; color:var(--text-1); display:flex; align-items:center; gap:8px;">
                <span>📑</span> تفصيل المصروفات والتحليل المالي المزدوج
              </h3>
              <p style="font-size:12px; color:var(--text-3); margin:0;">
                تحليل كل بند: نسبته من ميزانية الصرف (%) والتحليل الرأسي من المبيعات (كم هللة لكل ريال)
              </p>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <label style="font-size:12px; color:var(--text-2); font-weight:700;">ترتيب حسب:</label>
              <select id="exp-sort-select" onchange="onExpSortChange(this.value)" style="padding:4px 8px; border:1px solid var(--border); border-radius:6px; background:var(--bg-1); color:var(--text-1); font-size:11.5px; font-weight:600;">
                <option value="amount_desc" selected>الأعلى مبلغاً</option>
                <option value="amount_asc">الأقل مبلغاً</option>
                <option value="pct_rev_desc">الأعلى نسبة من المبيعات</option>
                <option value="name_asc">أبجدياً (اسم الحساب)</option>
              </select>
            </div>
          </div>

          <div class="table-container" style="overflow-x:auto;">
            <table class="data-dense" style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:var(--bg-2); border-bottom:2px solid var(--border);">
                  <th style="padding:10px 12px; text-align:right; font-size:12px; width:90px;">الكود</th>
                  <th style="padding:10px 12px; text-align:right; font-size:12px;">اسم المصروف / الحساب</th>
                  <th style="padding:10px 12px; text-align:right; font-size:12px; width:130px;">التصنيف</th>
                  <th style="padding:10px 12px; text-align:center; font-size:12px; width:75px;">الحركات</th>
                  <th style="padding:10px 12px; text-align:left; font-size:12px; width:125px;">المبلغ (ر.س)</th>
                  <th style="padding:10px 12px; text-align:center; font-size:12px; width:140px;">حصة المصروف %</th>
                  <th style="padding:10px 12px; text-align:center; font-size:12px; width:140px;">نسبته من المبيعات %</th>
                  <th style="padding:10px 12px; text-align:center; font-size:12px; width:90px;" class="no-print">إجراءات</th>
                </tr>
              </thead>
              <tbody id="exp-category-tbody">
                <tr><td colspan="8" style="text-align:center; padding:24px; color:var(--text-2);">جاري تحميل المصروفات...</td></tr>
              </tbody>
              <tfoot id="exp-category-tfoot" style="background:var(--bg-2); font-weight:800; border-top:2px solid var(--border);">
                <!-- Dynamic Totals -->
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Table 2: Cost Centers Breakdown -->
        <div class="card" style="background:var(--bg-card); border-radius:14px; padding:18px 20px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm);">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
            <div>
              <h3 style="font-family:var(--font-heading); font-size:16px; font-weight:800; margin:0 0 3px; color:var(--text-1); display:flex; align-items:center; gap:8px;">
                <span>🚚</span> توزيع المصروفات حسب مراكز التكلفة والمناديب
              </h3>
              <p style="font-size:12px; color:var(--text-3); margin:0;">
                تحليل تكاليف كل سيارة توزيع، فرع، أو قسم إداري مع البند الأكثر استهلاكاً
              </p>
            </div>
            <div id="exp-cc-count-badge" style="font-size:12px; font-weight:700; padding:4px 10px; background:var(--bg-2); border-radius:8px; color:var(--text-2);">
              —
            </div>
          </div>

          <div class="table-container" style="overflow-x:auto;">
            <table class="data-dense" style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:var(--bg-2); border-bottom:2px solid var(--border);">
                  <th style="padding:10px 12px; text-align:right; font-size:12px;">مركز التكلفة / المندوب</th>
                  <th style="padding:10px 12px; text-align:right; font-size:12px; width:120px;">النوع / التصنيف</th>
                  <th style="padding:10px 12px; text-align:center; font-size:12px; width:75px;">الحركات</th>
                  <th style="padding:10px 12px; text-align:left; font-size:12px; width:130px;">إجمالي المصروف (ر.س)</th>
                  <th style="padding:10px 12px; text-align:center; font-size:12px; width:140px;">الحصة من الإجمالي %</th>
                  <th style="padding:10px 12px; text-align:right; font-size:12px;">أعلى بند مصروف في المركز</th>
                  <th style="padding:10px 12px; text-align:center; font-size:12px; width:100px;" class="no-print">إجراءات</th>
                </tr>
              </thead>
              <tbody id="exp-cc-tbody">
                <tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-2);">جاري تحميل مراكز التكلفة...</td></tr>
              </tbody>
              <tfoot id="exp-cc-tfoot" style="background:var(--bg-2); font-weight:800; border-top:2px solid var(--border);">
                <!-- Dynamic Totals -->
              </tfoot>
            </table>
          </div>
        </div>

      </div>

    </div>

    <!-- Drill Down Modal Container -->
    <div id="exp-drilldown-modal-container"></div>
  `,window.setExpDatePreset=ut,window.onExpDateChange=mt,window.onExpScopeChange=vt,window.onExpCCChange=ht,window.onExpSearchInput=G(wt,200),window.onExpSortChange=kt,window.openAccountDrillDown=$t,window.closeAccountDrillDown=Ct,window.filterByCostCenter=yt,window.exportExpensesExcel=Dt,window.exportAccountDrillDownCSV=Et,window.printExpenseAnalysisPDF=St,window.onModalSearchInput=G(zt,150),await P()}async function P(){const t=document.getElementById("exp-from")?.value||O(),e=document.getElementById("exp-to")?.value||S(),a=document.getElementById("exp-period-label");a&&(a.innerHTML=`📅 الفترة المالية من <span style="color:var(--primary);">${k(t)}</span> إلى <span style="color:var(--primary);">${k(e)}</span>`);try{const[o,i,d]=await Promise.all([q(A.chartOfAccounts(),[V("code")]),q(A.costCenters(),[V("name")]),rt(dt(A.journalEntries(),Q("date",">=",t),Q("date","<=",e),lt(3e3)))]);Z=o||[],R=i||[],tt=d.docs.map(r=>({id:r.id,...r.data()})),pt(),T()}catch(o){console.error("Error loading expense analysis:",o),window.showToast&&window.showToast("فشل تحميل بيانات المصروفات: "+o.message,"danger")}}function pt(){const t=document.getElementById("exp-cc-filter");if(!t)return;const e=y||"all",a=['<option value="all">الكل (جميع مراكز التكلفة)</option>'];R.forEach(o=>{const i=o.type==="vehicle"?"🚐 مركبة":o.type==="branch"?"🏢 فرع":o.type==="warehouse"?"📦 مستودع":"📁 مركز";a.push(`<option value="${o.id}" ${e===o.id?"selected":""}>${i} — ${o.name}</option>`)}),a.push(`<option value="unassigned" ${e==="unassigned"?"selected":""}>⚪ غير محدد / عام</option>`),t.innerHTML=a.join("")}function et(t){const e=t.code||"";return e.startsWith("5-1-1")?!1:e==="5-1-8"||e==="5-1-7"||e==="5-1-9"||e==="5-1-3"||e.startsWith("5-1-")&&!e.startsWith("5-1-1")||e==="4-2-4"||t.name?.includes("تكلفة البضاعة المباعة")||t.name?.includes("تكلفة مبيعات")||t.name?.includes("نقل بضاعة")}function ct(t){const e=t.code||"";return et(t)||e.startsWith("5-1")?{key:"cogs",name:"تكلفة المبيعات (COGS)",badgeClass:"badge-cogs",color:"#64748b",bg:"rgba(100,116,139,0.15)",text:"#475569"}:e.startsWith("5-3")||t.name?.includes("تسويق")||t.name?.includes("بيع")||t.name?.includes("توزيع")||t.name?.includes("سيارات")||t.name?.includes("محروقات")||t.name?.includes("بنزين")||t.name?.includes("عمولة")?{key:"selling",name:"مصروفات بيع وتوزيع",badgeClass:"badge-selling",color:"#f59e0b",bg:"rgba(245,158,11,0.15)",text:"#b45309"}:e.startsWith("5-2")||t.name?.includes("إداري")||t.name?.includes("رواتب")||t.name?.includes("إيجار")||t.name?.includes("عمومية")||t.name?.includes("بدل")||t.name?.includes("إقامة")||t.name?.includes("تأمينات")?{key:"admin",name:"مصروفات إدارية وعمومية",badgeClass:"badge-admin",color:"#6366f1",bg:"rgba(99,102,241,0.15)",text:"#4338ca"}:e.startsWith("5-4")||e.startsWith("5-6")||t.name?.includes("صيانة")||t.name?.includes("تشغيل")||t.name?.includes("إهلاك")||t.name?.includes("استهلاك")?{key:"operations",name:"صيانة وتشغيل وإهلاك",badgeClass:"badge-ops",color:"#10b981",bg:"rgba(16,185,129,0.15)",text:"#047857"}:e.startsWith("5-5")||t.name?.includes("بنك")||t.name?.includes("تمويل")||t.name?.includes("رسوم بنكية")||t.name?.includes("فوائد")?{key:"finance",name:"مصروفات بنكية وتمويلية",badgeClass:"badge-finance",color:"#ec4899",bg:"rgba(236,72,153,0.15)",text:"#be185d"}:{key:"other",name:"مصروفات تشغيلية متنوعة",badgeClass:"badge-other",color:"#8b5cf6",bg:"rgba(139,92,246,0.15)",text:"#6d28d9"}}function F(t){return t?{sales:"مبيعات",salesInvoice:"فاتورة بيع",salesCOGS:"تكلفة مبيعات",salesReturn:"مردود مبيعات",salesReturnCOGS:"تكلفة مردود مبيعات",purchase:"مشتريات",purchaseInvoice:"فاتورة شراء",purchaseReturn:"مردود شراء",receipt:"سند قبض",payment:"سند صرف",cashOut:"صرف نقدي",cashIn:"إيداع نقدي",bankDeposit:"إيداع بنكي",bankWithdraw:"سحب بنكي",payroll:"مسير رواتب",expense:"سند مصروف",manual:"قيد يدوي",pos:"نقطة بيع",inventoryAdjust:"تسوية مخزنية",vatPayment:"سداد ضريبة",opening:"رصيد افتتاحي"}[t]||t:"قيد عام"}function T(){const t=document.getElementById("exp-from")?.value||"",e=document.getElementById("exp-to")?.value||"",a={};Z.forEach(l=>{a[l.code]=l,l.id&&(a[l.id]=l)});const o={};R.forEach(l=>{o[l.id]=l,l.code&&(o[l.code]=l)});let i=0,d=0,r=0,s=0,n=0;const p={},b={};tt.forEach(l=>{(l.lines||[]).forEach(u=>{const C=u.accountCode,E=u.accountId,x=C&&a[C]||E&&a[E];if(!x)return;const I=parseFloat(u.debit||0),L=parseFloat(u.credit||0);if(x.type==="revenue"){const m=L-I;i+=m,m>0?d+=m:r+=Math.abs(m)}else if(x.type==="expense"){if(x.code?.startsWith("5-1-1")||x.name?.includes("مشتريات البضاعة"))return;const m=I-L;if(Math.abs(m)<.01)return;const at=et(x),B=ct(x);s+=m;let w=!1;v==="opex"?w=!at&&!x.code?.startsWith("5-1"):v==="selling"?w=B.key==="selling"||x.code?.startsWith("5-3"):v==="admin"?w=B.key==="admin"||x.code?.startsWith("5-2"):v==="all_with_cogs"&&(w=!0);const f=u.costCenterId||l.costCenterId||"unassigned",M=u.costCenterName||l.costCenterName||o[f]?.name||(f==="unassigned"?"غير محدد / عام":f);let D=!1;if(y==="all"?D=!0:y==="unassigned"?D=f==="unassigned"||!f:D=f===y,w&&D&&(n+=m,p[x.code]||(p[x.code]={code:x.code,name:x.name,category:B,amount:0,count:0,lines:[],costCenters:{}}),p[x.code].amount+=m,p[x.code].count+=1,p[x.code].lines.push({jeId:l.id,jeNumber:l.entryNumber||(l.id?`JE-${l.id.slice(-6).toUpperCase()}`:"—"),date:l.date,sourceType:l.sourceType,description:u.note||l.description||"—",costCenterId:f,costCenterName:M,debit:I,credit:L,net:m}),p[x.code].costCenters[f]||(p[x.code].costCenters[f]={name:M,amount:0}),p[x.code].costCenters[f].amount+=m),w){if(!b[f]){const W=o[f];b[f]={id:f,name:M,type:W?.type||(f==="unassigned"?"general":"other"),code:W?.code||"",amount:0,count:0,byAcc:{}}}b[f].amount+=m,b[f].count+=1,b[f].byAcc[x.code]||(b[f].byAcc[x.code]={code:x.code,name:x.name,amount:0}),b[f].byAcc[x.code].amount+=m}}})});let h=1;if(t&&e){const l=new Date(t),u=new Date(e);h=Math.max(1,Math.round((u-l)/(1e3*60*60*24))+1)}const N=Object.values(p);ot(N);const U=Object.values(b).sort((l,u)=>u.amount-l.amount);U.forEach(l=>{const u=Object.values(l.byAcc).sort((C,E)=>E.amount-C.amount)[0];l.topAcc=u||{name:"—",amount:0}}),c={from:t,to:e,daysInPeriod:h,totalRevenue:i,totalGrossSales:d,totalSalesReturns:r,totalAllExpenses:s,totalScopeExpenses:n,accList:N,ccList:U,scope:v,costCenterFilter:y},xt(),gt(),ft(),H(),bt()}function ot(t){z==="amount_desc"?t.sort((e,a)=>a.amount-e.amount):z==="amount_asc"?t.sort((e,a)=>e.amount-a.amount):z==="pct_rev_desc"?t.sort((e,a)=>{const o=c?.totalRevenue>0?e.amount/c.totalRevenue:0;return(c?.totalRevenue>0?a.amount/c.totalRevenue:0)-o}):z==="name_asc"&&t.sort((e,a)=>(e.name||"").localeCompare(a.name||""))}function xt(){const t=document.getElementById("exp-scope-badge-container");if(!t)return;const e={opex:{text:"التحليل: المصروفات التشغيلية والإدارية (OpEx)",color:"#4f46e5",bg:"rgba(79,70,229,0.1)"},selling:{text:"التحليل: مصروفات البيع والتوزيع فقط (5-3)",color:"#d97706",bg:"rgba(217,119,6,0.1)"},admin:{text:"التحليل: المصروفات الإدارية والعمومية (5-2)",color:"#7c3aed",bg:"rgba(124,58,237,0.1)"},all_with_cogs:{text:"التحليل: جميع المصروفات شاملة تكلفة المبيعات (COGS)",color:"#475569",bg:"rgba(71,85,105,0.1)"}},a=e[v]||e.opex;t.innerHTML=`
    <span style="font-size:12px; font-weight:800; padding:6px 14px; border-radius:20px; background:${a.bg}; color:${a.color}; border:1px solid ${a.color}30; display:inline-flex; align-items:center; gap:6px;">
      <span>📌</span> ${a.text}
    </span>
  `}function gt(){const t=c;if(!t)return;const e=document.getElementById("kpi-exp-title");e&&(v==="opex"?e.textContent="المصروفات التشغيلية (OpEx)":v==="selling"?e.textContent="مصروفات البيع والتوزيع":v==="admin"?e.textContent="المصروفات الإدارية":e.textContent="إجمالي المصروفات و COGS"),document.getElementById("kpi-exp-total").textContent=g(t.totalScopeExpenses),document.getElementById("kpi-rev-total").textContent=g(t.totalRevenue);const a=t.totalRevenue>0?t.totalScopeExpenses/t.totalRevenue*100:0,o=document.getElementById("kpi-exp-ratio");o.textContent=`${a.toFixed(1)}%`,v==="opex"&&(a<=15?o.style.color="#10b981":a<=25?o.style.color="#f59e0b":o.style.color="#ef4444");const i=t.totalScopeExpenses/t.daysInPeriod;document.getElementById("kpi-burn-rate").textContent=`${g(i)} / يوم`,document.getElementById("kpi-burn-subtitle").textContent=`على مدار ${t.daysInPeriod} يوماً في الفترة`;const d=t.accList[0],r=document.getElementById("kpi-top-driver"),s=document.getElementById("kpi-top-driver-sub");if(d){const n=t.totalScopeExpenses>0?d.amount/t.totalScopeExpenses*100:0;r.textContent=d.name,r.title=`${d.name} (${g(d.amount)})`,s.innerHTML=`<strong style="color:var(--text-1);">${g(d.amount)}</strong> (${n.toFixed(1)}% من المصروفات)`}else r.textContent="لا توجد مصروفات",s.textContent="—"}function ft(){const t=document.getElementById("exp-composition-bar"),e=document.getElementById("exp-composition-legend"),a=document.getElementById("exp-stacked-total-badge"),o=c;if(!t||!e||!o)return;const i=o.totalScopeExpenses;if(a&&(a.innerHTML=`المجموع: <strong style="color:var(--text-1);">${g(i)}</strong>`),i<=0||o.accList.length===0){t.innerHTML='<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-3); font-size:11px;">لا توجد مصروفات مسجلة في هذا النطاق والفترة</div>',e.innerHTML="";return}const d=[{fill:"#4f46e5",text:"#ffffff"},{fill:"#10b981",text:"#ffffff"},{fill:"#f59e0b",text:"#ffffff"},{fill:"#06b6d4",text:"#ffffff"},{fill:"#ec4899",text:"#ffffff"},{fill:"#8b5cf6",text:"#ffffff"},{fill:"#64748b",text:"#ffffff"}],r=[];let s=0;o.accList.forEach((n,p)=>{p<5?r.push({name:n.name,code:n.code,amount:n.amount,pct:n.amount/i*100,color:d[p%d.length]}):s+=n.amount}),s>0&&r.push({name:`باقي المصروفات (${o.accList.length-5} بنود)`,code:"OTHER",amount:s,pct:s/i*100,color:d[d.length-1]}),t.innerHTML=r.map(n=>`
      <div style="width:${n.pct}%; height:100%; background:${n.color.fill}; position:relative; transition:width 0.4s ease;" 
           title="${n.name}: ${g(n.amount)} (${n.pct.toFixed(1)}%)">
      </div>
    `).join(""),e.innerHTML=r.map(n=>`
      <div style="display:inline-flex; align-items:center; gap:6px; background:var(--bg-2); padding:4px 10px; border-radius:8px; border:1px solid var(--border-soft);">
        <span style="width:10px; height:10px; border-radius:3px; background:${n.color.fill}; display:inline-block;"></span>
        <span style="font-weight:700; color:var(--text-1);">${n.name}:</span>
        <span class="mono" style="color:var(--text-2); font-weight:600;">${g(n.amount)}</span>
        <span class="mono" style="font-weight:800; color:${n.color.fill};">(${n.pct.toFixed(1)}%)</span>
      </div>
    `).join("")}function H(){const t=document.getElementById("exp-category-tbody"),e=document.getElementById("exp-category-tfoot"),a=c;if(!t||!a)return;let o=[...a.accList];if(j.trim()){const s=j.toLowerCase().trim();o=o.filter(n=>n.code.toLowerCase().includes(s)||n.name.toLowerCase().includes(s)||n.category.name.toLowerCase().includes(s))}if(o.length===0){t.innerHTML='<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--text-3); font-size:13px;">لا توجد مصروفات تطابق معايير البحث والفلترة</td></tr>',e&&(e.innerHTML="");return}const i=a.totalScopeExpenses,d=a.totalRevenue;t.innerHTML=o.map(s=>{const n=i>0?s.amount/i*100:0,p=d>0?s.amount/d*100:0;return`
      <tr style="border-bottom:1px solid var(--border-soft); transition:background 0.15s;" onmouseover="this.style.background='var(--bg-2)'" onmouseout="this.style.background='transparent'">
        <td class="mono" style="padding:10px 12px; font-weight:700; color:var(--text-3); font-size:11.5px;">${s.code}</td>
        <td style="padding:10px 12px;">
          <div style="font-weight:800; color:var(--text-1); font-size:13px; cursor:pointer;" onclick="openAccountDrillDown('${s.code}')">${s.name}</div>
          <div style="font-size:11px; color:var(--text-3); margin-top:2px;">
            ${nt(s.costCenters)}
          </div>
        </td>
        <td style="padding:10px 12px;">
          <span style="font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px; background:${s.category.bg}; color:${s.category.text}; border:1px solid ${s.category.color}30; white-space:nowrap;">
            ${s.category.name}
          </span>
        </td>
        <td class="mono" style="padding:10px 12px; text-align:center; font-weight:600; font-size:12px; color:var(--text-2);">${s.count}</td>
        <td class="mono font-bold" style="padding:10px 12px; text-align:left; font-size:13px; color:#ef4444;">${g(s.amount)}</td>
        <td style="padding:10px 12px;">
          <div style="display:flex; align-items:center; gap:8px; justify-content:center;">
            <span class="mono" style="font-weight:700; font-size:12px; width:45px; text-align:right;">${n.toFixed(1)}%</span>
            <div style="height:6px; width:70px; background:var(--bg-3); border-radius:3px; overflow:hidden;">
              <div style="height:100%; width:${Math.min(100,n)}%; background:${s.category.color}; border-radius:3px;"></div>
            </div>
          </div>
        </td>
        <td style="padding:10px 12px;">
          <div style="display:flex; align-items:center; gap:8px; justify-content:center;">
            <span class="mono font-bold" style="font-size:12px; width:45px; text-align:right; color:${p>10?"#ef4444":"var(--text-1)"};">
              ${d>0?p.toFixed(1)+"%":"—"}
            </span>
            <div style="height:6px; width:70px; background:var(--bg-3); border-radius:3px; overflow:hidden;">
              <div style="height:100%; width:${Math.min(100,p)}%; background:#6366f1; border-radius:3px;"></div>
            </div>
          </div>
        </td>
        <td style="padding:10px 12px; text-align:center;" class="no-print">
          <button class="btn btn-ghost btn-sm" onclick="openAccountDrillDown('${s.code}')" title="عرض كشف الحركات التفصيلي" style="padding:4px 8px; font-size:11.5px; font-weight:700; color:var(--primary); background:rgba(99,102,241,0.08); border-radius:6px;">
            🔍 كشف
          </button>
        </td>
      </tr>
    `}).join("");const r=d>0?i/d*100:0;e&&(e.innerHTML=`
      <tr>
        <td colspan="3" style="padding:12px; font-size:13px; color:var(--text-1);">الإجمالي المالي لبنود المصروفات (${o.length} بند)</td>
        <td class="mono" style="padding:12px; text-align:center; font-size:13px;">${o.reduce((s,n)=>s+n.count,0)}</td>
        <td class="mono font-bold" style="padding:12px; text-align:left; font-size:14px; color:#ef4444;">${g(i)}</td>
        <td class="mono" style="padding:12px; text-align:center; font-size:13px;">100.0%</td>
        <td class="mono font-bold" style="padding:12px; text-align:center; font-size:13px; color:#6366f1;">${d>0?r.toFixed(1)+"%":"—"}</td>
        <td class="no-print"></td>
      </tr>
    `)}function nt(t){const e=Object.values(t||{});return e.length===0?"مركز التكلفة: عام":e.length===1?`مركز التكلفة: ${e[0].name}`:(e.sort((a,o)=>o.amount-a.amount),`المركز الأبرز: ${e[0].name} (${e.length} مراكز)`)}function bt(){const t=document.getElementById("exp-cc-tbody"),e=document.getElementById("exp-cc-tfoot"),a=document.getElementById("exp-cc-count-badge"),o=c;if(!t||!o)return;const i=o.totalScopeExpenses,d=o.ccList||[];if(a&&(a.textContent=`${d.length} مراكز نشطة`),d.length===0){t.innerHTML='<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-3); font-size:13px;">لا توجد مصروفات مسجلة لمراكز التكلفة في هذه الفترة</td></tr>',e&&(e.innerHTML="");return}t.innerHTML=d.map(r=>{const s=i>0?r.amount/i*100:0,n=r.type==="vehicle"?'<span style="font-size:11px; padding:3px 8px; border-radius:6px; background:rgba(16,185,129,0.12); color:#047857; font-weight:700;">🚐 مركبة توزيع</span>':r.type==="warehouse"?'<span style="font-size:11px; padding:3px 8px; border-radius:6px; background:rgba(245,158,11,0.12); color:#b45309; font-weight:700;">📦 مستودع</span>':r.type==="branch"?'<span style="font-size:11px; padding:3px 8px; border-radius:6px; background:rgba(99,102,241,0.12); color:#4338ca; font-weight:700;">🏢 فرع / إدارة</span>':'<span style="font-size:11px; padding:3px 8px; border-radius:6px; background:var(--bg-3); color:var(--text-2); font-weight:600;">📁 مركز عام</span>';return`
      <tr style="border-bottom:1px solid var(--border-soft); transition:background 0.15s;" onmouseover="this.style.background='var(--bg-2)'" onmouseout="this.style.background='transparent'">
        <td style="padding:10px 12px;">
          <div style="font-weight:800; color:var(--text-1); font-size:13px;">${r.name}</div>
          ${r.code?`<div class="mono" style="font-size:11px; color:var(--text-3);">${r.code}</div>`:""}
        </td>
        <td style="padding:10px 12px;">${n}</td>
        <td class="mono" style="padding:10px 12px; text-align:center; font-weight:600; font-size:12px; color:var(--text-2);">${r.count}</td>
        <td class="mono font-bold" style="padding:10px 12px; text-align:left; font-size:13px; color:#ef4444;">${g(r.amount)}</td>
        <td style="padding:10px 12px;">
          <div style="display:flex; align-items:center; gap:8px; justify-content:center;">
            <span class="mono" style="font-weight:700; font-size:12px; width:45px; text-align:right;">${s.toFixed(1)}%</span>
            <div style="height:6px; width:75px; background:var(--bg-3); border-radius:3px; overflow:hidden;">
              <div style="height:100%; width:${Math.min(100,s)}%; background:#10b981; border-radius:3px;"></div>
            </div>
          </div>
        </td>
        <td style="padding:10px 12px;">
          <div style="font-weight:700; color:var(--text-1); font-size:12px;">${r.topAcc?.name||"—"}</div>
          ${r.topAcc?.amount?`<div class="mono" style="font-size:11px; color:var(--text-3);">${g(r.topAcc.amount)}</div>`:""}
        </td>
        <td style="padding:10px 12px; text-align:center;" class="no-print">
          <button class="btn btn-ghost btn-sm" onclick="filterByCostCenter('${r.id}')" title="تصفية التقرير بالكامل لهذا المركز" style="padding:4px 8px; font-size:11px; font-weight:700; color:#10b981; background:rgba(16,185,129,0.08); border-radius:6px;">
            🎯 تصفية
          </button>
        </td>
      </tr>
    `}).join(""),e&&(e.innerHTML=`
      <tr>
        <td colspan="2" style="padding:12px; font-size:13px; color:var(--text-1);">إجمالي مراكز التكلفة (${d.length} مركز)</td>
        <td class="mono" style="padding:12px; text-align:center; font-size:13px;">${d.reduce((r,s)=>r+s.count,0)}</td>
        <td class="mono font-bold" style="padding:12px; text-align:left; font-size:14px; color:#ef4444;">${g(i)}</td>
        <td class="mono" style="padding:12px; text-align:center; font-size:13px;">100.0%</td>
        <td colspan="2" class="no-print"></td>
      </tr>
    `)}function ut(t){const e=document.getElementById("exp-from"),a=document.getElementById("exp-to");if(!e||!a)return;const o=new Date;let i=S(),d=S();if(t!=="today")if(t==="yesterday"){const r=new Date(o);r.setDate(r.getDate()-1),i=r.toISOString().split("T")[0],d=i}else if(t==="week"){const r=new Date(o),s=r.getDay(),n=r.getDate()-s+(s===6?0:-1);i=new Date(r.setDate(n)).toISOString().split("T")[0]}else if(t==="month")i=O();else if(t==="last_month")i=new Date(o.getFullYear(),o.getMonth()-1,1).toISOString().split("T")[0],d=new Date(o.getFullYear(),o.getMonth(),0).toISOString().split("T")[0];else if(t==="quarter"){const r=Math.floor(o.getMonth()/3);i=new Date(o.getFullYear(),r*3,1).toISOString().split("T")[0]}else t==="year"&&(i=`${o.getFullYear()}-01-01`);e.value=i,a.value=d,document.querySelectorAll(".exp-preset-btn").forEach(r=>{r.classList.toggle("active",r.getAttribute("data-preset")===t)}),P()}function mt(){document.querySelectorAll(".exp-preset-btn").forEach(t=>t.classList.remove("active")),P()}function vt(){v=document.getElementById("exp-scope")?.value||"opex",T()}function ht(){y=document.getElementById("exp-cc-filter")?.value||"all",T()}function yt(t){y=t;const e=document.getElementById("exp-cc-filter");e&&(e.value=t),T(),window.showToast&&window.showToast("تمت تصفية التقرير لمركز التكلفة المختار 🎯","info")}function wt(t){j=t||"",H()}function kt(t){z=t||"amount_desc",c?.accList&&(ot(c.accList),H())}function $t(t){$=t,_="";const e=c?.accList.find(r=>r.code===t);if(!e)return;const a=document.getElementById("exp-drilldown-modal-container");if(!a)return;const o=c.totalRevenue||0,i=c.totalScopeExpenses>0?e.amount/c.totalScopeExpenses*100:0,d=o>0?e.amount/o*100:0;a.innerHTML=`
    <div id="exp-modal-backdrop" style="position:fixed; inset:0; background:rgba(15,23,42,0.7); backdrop-filter:blur(4px); z-index:9999; display:flex; align-items:center; justify-content:center; padding:16px;">
      <div style="background:var(--bg-card); border-radius:16px; width:100%; max-width:900px; max-height:90vh; display:flex; flex-direction:column; box-shadow:0 25px 50px -12px rgba(0,0,0,0.4); border:1px solid var(--border-soft); overflow:hidden; animation:modalSlideUp 0.2s ease-out;">
        
        <!-- Modal Header -->
        <div style="padding:18px 22px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:flex-start; background:var(--bg-1);">
          <div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
              <span class="mono" style="font-size:12px; font-weight:800; padding:2px 8px; border-radius:6px; background:var(--bg-3); color:var(--text-2);">${e.code}</span>
              <h2 style="font-size:18px; font-weight:900; margin:0; color:var(--text-1);">${e.name}</h2>
              <span style="font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px; background:${e.category.bg}; color:${e.category.text};">
                ${e.category.name}
              </span>
            </div>
            <p style="font-size:12px; color:var(--text-3); margin:0;">
              الفترة من ${k(c.from)} إلى ${k(c.to)} | إجمالي الحركات: <strong>${e.lines.length} قيد</strong>
            </p>
          </div>
          <button onclick="closeAccountDrillDown()" style="background:var(--bg-3); border:none; border-radius:8px; width:34px; height:34px; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; color:var(--text-2);">✕</button>
        </div>

        <!-- Mini Stats in Modal -->
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; padding:14px 22px; background:var(--bg-2); border-bottom:1px solid var(--border-soft);">
          <div>
            <div style="font-size:11px; color:var(--text-3); font-weight:600;">إجمالي الصرف في الفترة</div>
            <div class="mono" style="font-size:16px; font-weight:900; color:#ef4444;">${g(e.amount)}</div>
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-3); font-weight:600;">الحصة من ميزانية المصروفات</div>
            <div class="mono" style="font-size:16px; font-weight:900; color:var(--text-1);">${i.toFixed(1)}%</div>
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-3); font-weight:600;">التحليل الرأسي (% من المبيعات)</div>
            <div class="mono" style="font-size:16px; font-weight:900; color:#6366f1;">${o>0?d.toFixed(1)+"%":"—"}</div>
          </div>
        </div>

        <!-- Filter in Modal -->
        <div style="padding:12px 22px; border-bottom:1px solid var(--border-soft); display:flex; gap:10px; align-items:center;">
          <div style="flex:1;">
            <input type="text" id="modal-search" placeholder="بحث في البيان، رقم القيد، أو مركز التكلفة..." oninput="onModalSearchInput(this.value)" style="width:100%; padding:6px 12px; border:1px solid var(--border); border-radius:8px; background:var(--bg-1); color:var(--text-1); font-size:12px;" />
          </div>
          <button class="btn btn-secondary btn-sm" onclick="exportAccountDrillDownCSV()" style="font-weight:700; display:inline-flex; align-items:center; gap:6px;">
            <span>📥</span> تصدير الحركات
          </button>
        </div>

        <!-- Modal Table Body -->
        <div style="flex:1; overflow-y:auto; padding:0 22px;">
          <table class="data-dense" style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead style="position:sticky; top:0; background:var(--bg-card); z-index:10; border-bottom:2px solid var(--border);">
              <tr>
                <th style="padding:10px 8px; text-align:right; width:95px;">التاريخ</th>
                <th style="padding:10px 8px; text-align:right; width:110px;">رقم القيد</th>
                <th style="padding:10px 8px; text-align:right; width:100px;">نوع المستند</th>
                <th style="padding:10px 8px; text-align:right; width:130px;">مركز التكلفة</th>
                <th style="padding:10px 8px; text-align:right;">البيان / الشرح</th>
                <th style="padding:10px 8px; text-align:left; width:110px;">المبلغ (ر.س)</th>
              </tr>
            </thead>
            <tbody id="exp-modal-tbody">
              <!-- Rendered via renderModalTableRows() -->
            </tbody>
          </table>
        </div>

        <!-- Modal Footer -->
        <div style="padding:14px 22px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:10px; background:var(--bg-1);">
          <button class="btn btn-secondary" onclick="closeAccountDrillDown()">إغلاق</button>
        </div>

      </div>
    </div>
  `,it()}function it(){const t=document.getElementById("exp-modal-tbody");if(!t||!$||!c)return;const e=c.accList.find(o=>o.code===$);if(!e)return;let a=[...e.lines];if(_.trim()){const o=_.toLowerCase().trim();a=a.filter(i=>(i.description||"").toLowerCase().includes(o)||(i.jeNumber||"").toLowerCase().includes(o)||(i.costCenterName||"").toLowerCase().includes(o)||F(i.sourceType).toLowerCase().includes(o))}if(a.length===0){t.innerHTML='<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-3);">لا توجد حركات تطابق البحث</td></tr>';return}t.innerHTML=a.map(o=>`
      <tr style="border-bottom:1px solid var(--border-soft);">
        <td class="mono" style="padding:8px; color:var(--text-2); font-size:11.5px;">${o.date}</td>
        <td class="mono font-bold" style="padding:8px; color:var(--primary);">${o.jeNumber}</td>
        <td style="padding:8px;">
          <span style="font-size:10.5px; padding:2px 6px; border-radius:4px; background:var(--bg-3); color:var(--text-2); font-weight:600;">
            ${F(o.sourceType)}
          </span>
        </td>
        <td style="padding:8px; font-weight:600; color:var(--text-1); font-size:11.5px;">${o.costCenterName}</td>
        <td style="padding:8px; color:var(--text-1);">${o.description}</td>
        <td class="mono font-bold" style="padding:8px; text-align:left; color:#ef4444;">${g(o.net)}</td>
      </tr>
    `).join("")}function zt(t){_=t||"",it()}function Ct(){const t=document.getElementById("exp-drilldown-modal-container");t&&(t.innerHTML=""),$=null}function Et(){if(!$||!c)return;const t=c.accList.find(i=>i.code===$);if(!t)return;const e=[["كشف حركات المصروف",`${t.code} - ${t.name}`],["الفترة",`من: ${c.from} إلى: ${c.to}`],[],["التاريخ","رقم القيد","نوع المستند","مركز التكلفة","البيان / الشرح","المبلغ (ر.س)"]];t.lines.forEach(i=>{e.push([i.date,i.jeNumber,F(i.sourceType),i.costCenterName,i.description,i.net.toFixed(2)])}),e.push([]),e.push(["الإجمالي","","","","",t.amount.toFixed(2)]);const a=e.map(i=>i.map(d=>`"${String(d??"").replace(/"/g,'""')}"`).join(",")).join(`
`),o=document.createElement("a");o.href=URL.createObjectURL(new Blob(["\uFEFF"+a],{type:"text/csv"})),o.download=`Expense_${t.code}_${c.from}_to_${c.to}.csv`,o.click()}async function Dt(){const t=c;if(!t){window.showToast&&window.showToast("لا توجد بيانات للتصدير","warning");return}const e=`تقرير تحليل المصروفات ومراكز التكلفة (${t.from} إلى ${t.to})`,a=["كود الحساب","اسم المصروف / الحساب","التصنيف المحاسبي","عدد الحركات","المبلغ (ر.س)","حصة المصروف %","نسبته من المبيعات %","مركز التكلفة السائد"],o=t.totalScopeExpenses,i=t.totalRevenue,d=t.accList.map(s=>{const n=o>0?(s.amount/o*100).toFixed(2)+"%":"0%",p=i>0?(s.amount/i*100).toFixed(2)+"%":"—";return[s.code,s.name,s.category.name,s.count,s.amount.toFixed(2),n,p,nt(s.costCenters)]});d.push(["الإجمالي","إجمالي المصروفات","",t.accList.reduce((s,n)=>s+n.count,0),o.toFixed(2),"100.0%",i>0?(o/i*100).toFixed(2)+"%":"—",""]);const r=[14,30,24,12,18,16,18,28];try{await st({title:e,headers:a,rows:d,colWidths:r,user:window.currentUser?.name||"المحاسب المالي"}),window.showToast&&window.showToast("تم تصدير تقرير المصروفات إلى Excel بنجاح 📊","success")}catch(s){console.error("Excel export error:",s),window.showToast&&window.showToast("فشل تصدير Excel: "+s.message,"danger")}}async function St(){const t=c;if(!t)return;let e={name:"شركة نظم الإمداد الحديثة",vatNumber:"312448150500003",crNumber:"4700123180",phone:"0549141648",email:"Nuzmalamdad@gmail.com",address:"7480 - الشارع: عامر الشعبي، ينبع",logoUrl:""};try{const n=JSON.parse(localStorage.getItem("idham_company")||"{}");n.name&&Object.assign(e,n),n.logoBase64&&(e.logoUrl=n.logoBase64),n.logoUrl&&(e.logoUrl=n.logoUrl);const[p,b]=await Promise.all([J(X(K,`companies/${Y}/settings`,"company")),J(X(K,`companies/${Y}/settings`,"logo"))]);if(p.exists()&&Object.assign(e,p.data()),b.exists()){const h=b.data();e.logoUrl=h.dataUrl||h.logoBase64||h.url||h.logoUrl||e.logoUrl}}catch(n){console.warn("Could not load company branding for print:",n)}const a=e.logoUrl?`<img src="${e.logoUrl}" style="max-height:65px; max-width:180px; object-fit:contain;" alt="Logo" />`:'<span style="font-size:32px;">🏢</span>',o=t.totalScopeExpenses,i=t.totalRevenue,d=i>0?o/i*100:0,r=o/t.daysInPeriod,s=window.open("","_blank");s.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تقرير تحليل المصروفات ومراكز التكلفة</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Cairo', sans-serif; }
    body { background: #fff; color: #1e293b; padding: 24px; font-size: 12px; }
    .print-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 18px; }
    .co-info h2 { font-size: 17px; font-weight: 900; color: #0f172a; }
    .co-info p { font-size: 11px; color: #64748b; margin-top: 2px; }
    .rep-title { text-align: center; margin-bottom: 20px; }
    .rep-title h1 { font-size: 19px; font-weight: 900; color: #1e3a8a; }
    .rep-title p { font-size: 12px; color: #475569; font-weight: 600; margin-top: 3px; }
    
    .kpi-row { display: flex; gap: 12px; margin-bottom: 20px; }
    .kpi-box { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; background: #f8fafc; }
    .kpi-box .lbl { font-size: 10.5px; color: #64748b; font-weight: 700; }
    .kpi-box .val { font-size: 16px; font-weight: 900; margin-top: 2px; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 22px; font-size: 11px; }
    th { background: #f1f5f9; color: #1e293b; font-weight: 800; text-align: right; padding: 8px 10px; border: 1px solid #cbd5e1; }
    td { padding: 7px 10px; border: 1px solid #e2e8f0; }
    .mono { font-family: 'Courier New', monospace; font-weight: bold; }
    .text-left { text-align: left; }
    .text-center { text-align: center; }
    .total-row { background: #f8fafc; font-weight: 900; }
    .footer { display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 11px; color: #64748b; margin-top: 30px; }
    @media print {
      body { padding: 10px; }
      @page { size: A4 portrait; margin: 12mm; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="print-header">
    <div class="co-info">
      <h2>${e.name}</h2>
      <p>الرقم الضريبي: ${e.vatNumber} | السجل التجاري: ${e.crNumber}</p>
      <p>${e.address} | هاتف: ${e.phone}</p>
    </div>
    <div>${a}</div>
  </div>

  <!-- Title -->
  <div class="rep-title">
    <h1>تقرير تحليل المصروفات ومراكز التكلفة</h1>
    <p>للفترة المالية من: ${k(t.from)} إلى: ${k(t.to)}</p>
  </div>

  <!-- KPIs -->
  <div class="kpi-row">
    <div class="kpi-box">
      <div class="lbl">إجمالي المصروفات</div>
      <div class="val mono" style="color:#ef4444;">${g(o)}</div>
    </div>
    <div class="kpi-box">
      <div class="lbl">صافي المبيعات</div>
      <div class="val mono" style="color:#1e3a8a;">${g(i)}</div>
    </div>
    <div class="kpi-box">
      <div class="lbl">نسبة المصروفات للمبيعات</div>
      <div class="val mono" style="color:#10b981;">${d.toFixed(1)}%</div>
    </div>
    <div class="kpi-box">
      <div class="lbl">معدل الصرف اليومي</div>
      <div class="val mono" style="color:#f59e0b;">${g(r)} / يوم</div>
    </div>
  </div>

  <!-- Category Table -->
  <h3 style="font-size:13px; font-weight:800; margin-bottom:8px; color:#1e293b;">1. التحليل المالي والنسبي لبنود المصروفات</h3>
  <table>
    <thead>
      <tr>
        <th style="width:70px;">الكود</th>
        <th>اسم المصروف / الحساب</th>
        <th style="width:110px;">التصنيف</th>
        <th class="text-center" style="width:60px;">الحركات</th>
        <th class="text-left" style="width:110px;">المبلغ (ر.س)</th>
        <th class="text-center" style="width:95px;">حصة المصروف %</th>
        <th class="text-center" style="width:105px;">نسبته من المبيعات %</th>
      </tr>
    </thead>
    <tbody>
      ${t.accList.map(n=>{const p=o>0?(n.amount/o*100).toFixed(1)+"%":"0%",b=i>0?(n.amount/i*100).toFixed(1)+"%":"—";return`
          <tr>
            <td class="mono">${n.code}</td>
            <td><strong>${n.name}</strong></td>
            <td>${n.category.name}</td>
            <td class="mono text-center">${n.count}</td>
            <td class="mono text-left">${g(n.amount)}</td>
            <td class="mono text-center">${p}</td>
            <td class="mono text-center">${b}</td>
          </tr>
        `}).join("")}
      <tr class="total-row">
        <td colspan="3">الإجمالي</td>
        <td class="mono text-center">${t.accList.reduce((n,p)=>n+p.count,0)}</td>
        <td class="mono text-left">${g(o)}</td>
        <td class="mono text-center">100.0%</td>
        <td class="mono text-center">${i>0?d.toFixed(1)+"%":"—"}</td>
      </tr>
    </tbody>
  </table>

  <!-- Cost Centers Table -->
  <h3 style="font-size:13px; font-weight:800; margin-bottom:8px; color:#1e293b; margin-top:20px;">2. توزيع المصروفات حسب مراكز التكلفة</h3>
  <table>
    <thead>
      <tr>
        <th>مركز التكلفة / المندوب</th>
        <th class="text-center" style="width:70px;">الحركات</th>
        <th class="text-left" style="width:120px;">المبلغ (ر.س)</th>
        <th class="text-center" style="width:100px;">الحصة %</th>
        <th>أعلى بند مصروف في المركز</th>
      </tr>
    </thead>
    <tbody>
      ${t.ccList.map(n=>{const p=o>0?(n.amount/o*100).toFixed(1)+"%":"0%";return`
          <tr>
            <td><strong>${n.name}</strong></td>
            <td class="mono text-center">${n.count}</td>
            <td class="mono text-left">${g(n.amount)}</td>
            <td class="mono text-center">${p}</td>
            <td>${n.topAcc?.name||"—"} (${g(n.topAcc?.amount||0)})</td>
          </tr>
        `}).join("")}
    </tbody>
  </table>

  <!-- Signatures -->
  <div class="footer">
    <div>تاريخ الطباعة: ${new Date().toLocaleString("ar-SA")}</div>
    <div>المحاسب المسؤول: _______________</div>
    <div>المدير المالي: _______________</div>
  </div>

  <script>
    window.onload = () => { window.print(); };
  <\/script>
</body>
</html>`),s.document.close()}export{jt as render};
