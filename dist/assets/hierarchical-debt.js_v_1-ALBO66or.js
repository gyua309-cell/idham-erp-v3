import{t as U,s as W,H as K,g as w,a as R,d as G,C as Q,f as c}from"./index-_yt5fKo2.js";import{collection as X}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let M=[],$=[],T=[],O=[],N=[],_=[],B=[],f={totalDebt:0,totalCreditBal:0,netReceivables:0,periodSales:0,periodReceipts:0,periodReturns:0,debtorCount:0,totalCustomers:0,collectionRate:0},x=new Set,v=new Set;async function le(t,o){const n=U(),r=W();t.innerHTML=`
    <div class="hdebt-root">
      
      <!-- ═══ HEADER PANEL ═══ -->
      <div class="hdebt-header-card no-print">
        <div class="hdebt-header-main">
          <div class="hdebt-icon-box">📊</div>
          <div>
            <h1 class="hdebt-title">تقرير المديونيات الهرمي الشجري</h1>
            <p class="hdebt-sub">تحليل هرمي شامل لمديونيات العملاء ومتابعة تحصيلات المناديب — معتمد 100% على فواتير المبيعات وسندات القبض والمرتجعات الفعلية</p>
          </div>
        </div>
        <div class="hdebt-header-actions">
          <button class="hdebt-btn hdebt-btn-ghost" onclick="window.expandAllHierarchicalDebt(true)">
            <span>➕</span> فتح الكل
          </button>
          <button class="hdebt-btn hdebt-btn-ghost" onclick="window.expandAllHierarchicalDebt(false)">
            <span>➖</span> طي الكل
          </button>
          <button class="hdebt-btn hdebt-btn-excel" onclick="window.exportHierarchicalDebtExcel()">
            <span>📊</span> تصدير Excel
          </button>
          <button class="hdebt-btn hdebt-btn-print" onclick="window.printHierarchicalDebt()">
            <span>🖨️</span> طباعة A4
          </button>
          <button class="hdebt-btn hdebt-btn-primary" onclick="window.loadHierarchicalDebtData(true)">
            <span>🔄</span> تحديث
          </button>
        </div>
      </div>

      <!-- ═══ FILTER BAR ═══ -->
      <div class="hdebt-filterbar no-print">
        
        <!-- Rep Selector -->
        <div class="hdebt-fg" style="min-width:180px;">
          <label>المندوب</label>
          <select id="hdebt-rep-filter" class="hdebt-select" onchange="window.applyHierarchicalDebtFilters()">
            <option value="">🌟 جميع المناديب</option>
          </select>
        </div>

        <!-- Date Range -->
        <div class="hdebt-fg" style="min-width:135px;">
          <label>من تاريخ</label>
          <input type="date" id="hdebt-from" class="hdebt-input font-bold mono" value="${r}" onchange="window.loadHierarchicalDebtData()" />
        </div>
        <div class="hdebt-fg" style="min-width:135px;">
          <label>إلى تاريخ</label>
          <input type="date" id="hdebt-to" class="hdebt-input font-bold mono" value="${n}" onchange="window.loadHierarchicalDebtData()" />
        </div>

        <!-- Debt Status Filter -->
        <div class="hdebt-fg" style="min-width:160px;">
          <label>حالة المديونية</label>
          <select id="hdebt-status-filter" class="hdebt-select" onchange="window.applyHierarchicalDebtFilters()">
            <option value="all">الكل (مدين / مسدد / دائن)</option>
            <option value="debtors" selected>🔴 المدينون فقط (رصيد > 0)</option>
            <option value="settled">🟢 المسددون بالكامل (0.00)</option>
            <option value="creditors">🔵 أرصدة دائنة (رصيد < 0)</option>
          </select>
        </div>

        <!-- Quick Presets -->
        <div class="hdebt-presets">
          <button type="button" class="hdebt-preset-btn" onclick="window.setHierarchicalDebtPeriod('today')">اليوم ⚡</button>
          <button type="button" class="hdebt-preset-btn" onclick="window.setHierarchicalDebtPeriod('week')">هذا الأسبوع 📅</button>
          <button type="button" class="hdebt-preset-btn" onclick="window.setHierarchicalDebtPeriod('mtd')">الشهر الحالي MTD 🗓️</button>
          <button type="button" class="hdebt-preset-btn" onclick="window.setHierarchicalDebtPeriod('lastMonth')">الشهر الماضي</button>
          <button type="button" class="hdebt-preset-btn" onclick="window.setHierarchicalDebtPeriod('all')">الكل (من البداية) ♾️</button>
        </div>

        <!-- Search Box -->
        <div class="hdebt-search-wrap">
          <label>🔍 بحث فوري</label>
          <input type="text" id="hdebt-search" class="hdebt-input" placeholder="ابحث باسم العميل أو الكود أو المندوب..." oninput="window.applyHierarchicalDebtFilters()" />
        </div>

      </div>

      <!-- ═══ KPI CARDS ═══ -->
      <div class="hdebt-kpis-grid" id="hdebt-kpis-container">
        
        <!-- Card 1: Total Debt -->
        <div class="hdebt-kpi-card kpi-red">
          <div class="hdebt-kpi-header">
            <span class="hdebt-kpi-icon">💳</span>
            <span class="hdebt-kpi-label">إجمالي المديونيات المستحقة</span>
          </div>
          <div class="hdebt-kpi-value" id="kpi-total-debt">0.00 ر.س</div>
          <div class="hdebt-kpi-sub" id="kpi-debtors-count">0 عميل مدين قائم</div>
        </div>

        <!-- Card 2: Period Sales -->
        <div class="hdebt-kpi-card kpi-blue">
          <div class="hdebt-kpi-header">
            <span class="hdebt-kpi-icon">📈</span>
            <span class="hdebt-kpi-label">مبيعات الفترة (فواتير)</span>
          </div>
          <div class="hdebt-kpi-value" id="kpi-period-sales">0.00 ر.س</div>
          <div class="hdebt-kpi-sub" id="kpi-sales-inv-count">إجمالي الفواتير الصادرة</div>
        </div>

        <!-- Card 3: Period Collections -->
        <div class="hdebt-kpi-card kpi-green">
          <div class="hdebt-kpi-header">
            <span class="hdebt-kpi-icon">💰</span>
            <span class="hdebt-kpi-label">تحصيلات وسدادات الفترة</span>
          </div>
          <div class="hdebt-kpi-value" id="kpi-period-receipts">0.00 ر.س</div>
          <div class="hdebt-kpi-sub" id="kpi-receipts-count">سندات قبض وتحصيل</div>
        </div>

        <!-- Card 4: Period Returns -->
        <div class="hdebt-kpi-card kpi-amber">
          <div class="hdebt-kpi-header">
            <span class="hdebt-kpi-icon">🔄</span>
            <span class="hdebt-kpi-label">مردودات الفترة (مرتجعات)</span>
          </div>
          <div class="hdebt-kpi-value" id="kpi-period-returns">0.00 ر.س</div>
          <div class="hdebt-kpi-sub" id="kpi-returns-count">خصم مرتجع مبيعات</div>
        </div>

        <!-- Card 5: Collection Rate -->
        <div class="hdebt-kpi-card kpi-indigo">
          <div class="hdebt-kpi-header">
            <span class="hdebt-kpi-icon">🎯</span>
            <span class="hdebt-kpi-label">نسبة التحصيل الإجمالية</span>
          </div>
          <div class="hdebt-kpi-value" id="kpi-collection-rate">0.0%</div>
          <div class="hdebt-kpi-sub" id="kpi-net-receivables">صافي الذمم: 0.00 ر.س</div>
        </div>

      </div>

      <!-- ═══ PRINT TITLE (PRINT ONLY) ═══ -->
      <div class="hdebt-print-banner print-only" style="display:none;">
        <div style="text-align:center; margin-bottom:12px;">
          <h2 style="margin:0; font-size:18px; color:#1e3a8a;">تقرير المديونيات الهرمي الشجري لمتابعة العملاء والمناديب</h2>
          <div style="font-size:12px; color:#475569; margin-top:4px;" id="hdebt-print-period-label">الفترة: --</div>
        </div>
      </div>

      <!-- ═══ HIERARCHICAL TREE CONTAINER ═══ -->
      <div id="hdebt-tree-content" class="hdebt-tree-wrap">
        <div class="hdebt-loading">
          <div class="hdebt-spinner"></div>
          <div>جارٍ استخراج وتدقيق المديونيات من فواتير المبيعات وسندات القبض...</div>
        </div>
      </div>

    </div>

    <!-- ═══ STYLES ═══ -->
    <style>
      .hdebt-root { padding: 18px 22px; direction: rtl; font-family: 'IBM Plex Sans Arabic', 'Cairo', sans-serif; color: var(--text-0, #0f172a); }
      
      /* Header Panel */
      .hdebt-header-card {
        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%);
        border-radius: 16px; padding: 20px 24px; color: #fff;
        display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;
        box-shadow: 0 6px 20px rgba(30, 64, 175, 0.25); margin-bottom: 18px;
      }
      .hdebt-header-main { display: flex; align-items: center; gap: 14px; }
      .hdebt-icon-box {
        width: 50px; height: 50px; border-radius: 14px; background: rgba(255,255,255,0.18);
        display: flex; align-items: center; justify-content: center; font-size: 24px;
        backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.25);
      }
      .hdebt-title { margin: 0; font-size: 1.45rem; font-weight: 900; letter-spacing: -0.3px; color: #fff; }
      .hdebt-sub { margin: 4px 0 0; font-size: 0.84rem; color: rgba(255,255,255,0.85); font-weight: 500; }
      .hdebt-header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

      .hdebt-btn {
        display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 9px;
        font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; font-family: inherit;
      }
      .hdebt-btn-ghost { background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); }
      .hdebt-btn-ghost:hover { background: rgba(255,255,255,0.28); transform: translateY(-1px); }
      .hdebt-btn-excel { background: #10b981; color: #fff; box-shadow: 0 2px 8px rgba(16,185,129,0.3); }
      .hdebt-btn-excel:hover { background: #059669; transform: translateY(-1px); }
      .hdebt-btn-print { background: #3b82f6; color: #fff; box-shadow: 0 2px 8px rgba(59,130,246,0.3); }
      .hdebt-btn-print:hover { background: #2563eb; transform: translateY(-1px); }
      .hdebt-btn-primary { background: #f59e0b; color: #000; font-weight: 800; box-shadow: 0 2px 8px rgba(245,158,11,0.3); }
      .hdebt-btn-primary:hover { background: #d97706; color: #fff; transform: translateY(-1px); }

      /* Filter Bar */
      .hdebt-filterbar {
        background: var(--bg-1, #ffffff); border: 1.5px solid var(--border-soft, #e2e8f0);
        border-radius: 14px; padding: 14px 18px; margin-bottom: 18px;
        display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end;
        box-shadow: 0 2px 8px rgba(0,0,0,0.03);
      }
      .hdebt-fg { display: flex; flex-direction: column; gap: 4px; }
      .hdebt-fg label, .hdebt-search-wrap label { font-size: 11px; font-weight: 800; color: var(--text-2, #64748b); }
      .hdebt-select, .hdebt-input {
        padding: 7px 11px; border: 1.5px solid var(--border-soft, #cbd5e1); border-radius: 8px;
        background: var(--bg-0, #f8fafc); color: var(--text-0, #0f172a); font-size: 12.5px;
        outline: none; transition: border-color 0.2s, box-shadow 0.2s; font-family: inherit;
      }
      .hdebt-select:focus, .hdebt-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.12); background: #fff; }
      
      .hdebt-presets { display: flex; gap: 5px; flex-wrap: wrap; align-items: center; margin-bottom: 1px; }
      .hdebt-preset-btn {
        padding: 6px 10px; border-radius: 6px; background: var(--bg-2, #f1f5f9);
        border: 1px solid var(--border-soft, #cbd5e1); font-size: 11px; font-weight: 700;
        color: var(--text-1, #334155); cursor: pointer; transition: all 0.15s; font-family: inherit;
      }
      .hdebt-preset-btn:hover { background: #2563eb; color: #fff; border-color: #2563eb; }

      .hdebt-search-wrap { flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 4px; }
      .hdebt-search-wrap input { width: 100%; box-sizing: border-box; }

      /* KPIs Grid */
      .hdebt-kpis-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; margin-bottom: 22px;
      }
      .hdebt-kpi-card {
        border-radius: 14px; padding: 14px 16px; position: relative; overflow: hidden;
        border: 1.5px solid transparent; transition: transform 0.2s, box-shadow 0.2s;
      }
      .hdebt-kpi-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.06); }
      .hdebt-kpi-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
      .hdebt-kpi-icon { font-size: 18px; }
      .hdebt-kpi-label { font-size: 11px; font-weight: 800; opacity: 0.85; }
      .hdebt-kpi-value { font-size: 21px; font-weight: 900; font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; margin-bottom: 2px; }
      .hdebt-kpi-sub { font-size: 11px; font-weight: 600; opacity: 0.75; }

      .kpi-red    { background: linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04)); border-color: rgba(239,68,68,0.25); color: #dc2626; }
      .kpi-blue   { background: linear-gradient(135deg, rgba(37,99,235,0.12), rgba(37,99,235,0.04)); border-color: rgba(37,99,235,0.25); color: #1d4ed8; }
      .kpi-green  { background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04)); border-color: rgba(16,185,129,0.25); color: #059669; }
      .kpi-amber  { background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04)); border-color: rgba(245,158,11,0.25); color: #d97706; }
      .kpi-indigo { background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.04)); border-color: rgba(99,102,241,0.25); color: #4f46e5; }

      /* Loading State */
      .hdebt-loading {
        background: var(--bg-1, #fff); border-radius: 14px; padding: 50px 20px; text-align: center;
        border: 1px solid var(--border-soft, #e2e8f0); color: var(--text-2, #64748b); font-size: 14px; font-weight: 700;
        display: flex; flex-direction: column; align-items: center; gap: 12px;
      }
      .hdebt-spinner {
        width: 36px; height: 36px; border: 3.5px solid var(--border-soft, #e2e8f0); border-top-color: #2563eb;
        border-radius: 50%; animation: hdebt-spin 0.8s linear infinite;
      }
      @keyframes hdebt-spin { to { transform: rotate(360deg); } }

      /* Tree Accordion Level 1: Rep Card */
      .hdebt-rep-card {
        background: var(--bg-1, #fff); border: 1.5px solid var(--border-soft, #e2e8f0); border-radius: 14px;
        margin-bottom: 14px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .hdebt-rep-card.is-open { border-color: #3b82f6; box-shadow: 0 4px 16px rgba(59,130,246,0.1); }
      
      .hdebt-rep-header {
        padding: 14px 18px; background: var(--bg-0, #f8fafc); cursor: pointer;
        display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
        user-select: none; border-bottom: 1px solid transparent; transition: background 0.15s;
      }
      .hdebt-rep-card.is-open .hdebt-rep-header { border-bottom-color: var(--border-soft, #e2e8f0); background: #f0f7ff; }
      .hdebt-rep-header:hover { background: #e8f2ff; }

      .hdebt-rep-title-group { display: flex; align-items: center; gap: 12px; }
      .hdebt-rep-avatar {
        width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #1e3a8a, #3b82f6);
        color: #fff; font-size: 16px; font-weight: 900; display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 6px rgba(37,99,235,0.25);
      }
      .hdebt-rep-name { font-size: 14.5px; font-weight: 900; color: var(--text-0, #0f172a); }
      .hdebt-rep-meta { font-size: 11px; color: var(--text-2, #64748b); margin-top: 2px; }

      .hdebt-rep-metrics-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
      .hdebt-rep-metric { text-align: left; }
      .hdebt-rep-metric-lbl { font-size: 10px; font-weight: 800; color: var(--text-2, #64748b); text-transform: uppercase; }
      .hdebt-rep-metric-val { font-size: 13.5px; font-weight: 900; font-family: 'IBM Plex Mono', monospace; }

      .hdebt-rep-coll-bar {
        width: 90px; height: 6px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-top: 3px;
      }
      .hdebt-rep-coll-fill { height: 100%; background: #10b981; border-radius: 4px; }

      .hdebt-rep-chevron {
        width: 28px; height: 28px; border-radius: 7px; background: rgba(0,0,0,0.04);
        display: flex; align-items: center; justify-content: center; font-size: 11px; color: var(--text-2, #64748b);
        transition: transform 0.2s;
      }
      .hdebt-rep-card.is-open .hdebt-rep-chevron { transform: rotate(180deg); background: #2563eb; color: #fff; }

      /* Tree Accordion Level 2: Customer List */
      .hdebt-cust-list { padding: 8px 14px 14px 14px; background: #fafcff; }
      
      .hdebt-cust-card {
        background: #fff; border: 1px solid var(--border-soft, #e2e8f0); border-radius: 10px;
        margin-top: 8px; overflow: hidden; transition: all 0.15s;
      }
      .hdebt-cust-card.is-open { border-color: #6366f1; box-shadow: 0 2px 10px rgba(99,102,241,0.08); }

      .hdebt-cust-header {
        padding: 10px 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;
        flex-wrap: wrap; gap: 10px; user-select: none; transition: background 0.15s;
      }
      .hdebt-cust-card.is-open .hdebt-cust-header { background: #f5f3ff; border-bottom: 1px solid #ede9fe; }
      .hdebt-cust-header:hover { background: #f8fafc; }

      .hdebt-cust-info { display: flex; align-items: center; gap: 10px; }
      .hdebt-cust-code {
        font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 800; padding: 2px 6px;
        border-radius: 5px; background: var(--bg-2, #e2e8f0); color: var(--text-1, #334155);
      }
      .hdebt-cust-name { font-size: 13px; font-weight: 800; color: var(--text-0, #0f172a); }
      .hdebt-cust-phone { font-size: 11px; color: var(--text-2, #64748b); font-family: monospace; }

      .hdebt-cust-cols { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
      .hdebt-col-cell { text-align: left; min-width: 80px; }
      .hdebt-col-lbl { font-size: 9.5px; font-weight: 700; color: var(--text-2, #64748b); }
      .hdebt-col-val { font-size: 12px; font-weight: 800; font-family: 'IBM Plex Mono', monospace; }

      .hdebt-badge {
        font-size: 10.5px; font-weight: 800; padding: 3px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;
      }
      .hdebt-badge-debtor   { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
      .hdebt-badge-settled  { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
      .hdebt-badge-creditor { background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; }

      .hdebt-stmt-btn {
        background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px;
        font-size: 11px; font-weight: 700; color: #1e3a8a; cursor: pointer; transition: all 0.15s;
      }
      .hdebt-stmt-btn:hover { background: #1e3a8a; color: #fff; border-color: #1e3a8a; }

      /* Tree Accordion Level 3: Transaction Timeline Table */
      .hdebt-txns-wrap { padding: 12px 14px; background: #ffffff; }
      .hdebt-txns-table { width: 100%; border-collapse: collapse; font-size: 12px; }
      .hdebt-txns-table th {
        background: var(--bg-1, #f8fafc); color: var(--text-2, #475569); padding: 7px 10px;
        font-size: 10.5px; font-weight: 800; text-align: right; border-bottom: 2px solid var(--border-soft, #e2e8f0);
      }
      .hdebt-txns-table td {
        padding: 7px 10px; border-bottom: 1px solid var(--border-soft, #f1f5f9); vertical-align: middle;
      }
      .hdebt-txns-table tr:hover td { background: #f8fafc; }
      
      .hdebt-txns-table tfoot td {
        background: #f8fafc; font-weight: 900; border-top: 2px solid var(--border-soft, #cbd5e1); padding: 9px 10px;
      }

      .tx-badge {
        font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; display: inline-block;
      }
      .tx-inv  { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
      .tx-rcpt { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
      .tx-ret  { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
      .tx-ob   { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }

      /* Print Optimizations */
      @media print {
        .no-print, .hdebt-header-card, .hdebt-filterbar, .hdebt-header-actions, .hdebt-stmt-btn, .hdebt-rep-chevron { display: none !important; }
        .print-only, .hdebt-print-banner { display: block !important; }
        .hdebt-root { padding: 0 !important; color: #000 !important; }
        .hdebt-rep-card, .hdebt-cust-card { border: 1px solid #ccc !important; box-shadow: none !important; break-inside: avoid; margin-bottom: 8px !important; }
        .hdebt-cust-list, .hdebt-txns-wrap { display: block !important; }
        .hdebt-kpis-grid { grid-template-columns: repeat(5, 1fr) !important; gap: 6px !important; }
        .hdebt-kpi-card { border: 1px solid #ccc !important; padding: 6px 8px !important; }
        .hdebt-kpi-value { font-size: 14px !important; }
      }
    </style>
  `,oe(),await z()}async function z(t=!1){const o=document.getElementById("hdebt-tree-content");o&&(o.innerHTML=`
      <div class="hdebt-loading">
        <div class="hdebt-spinner"></div>
        <div>جارٍ جلب وتدقيق الحركات من فواتير المبيعات وسندات القبض والمرتجعات...</div>
      </div>
    `);try{const[n,r,i,p,d,h]=await Promise.all([w(R.customers()),w(R.salesReps()),w(R.salesInvoices()),w(R.receipts()),w(X(G,`companies/${Q}/collections`)),w(R.salesReturns())]);M=n,$=r,T=i.filter(s=>s.status!=="cancelled"&&s.status!=="void"),O=p.filter(s=>s.status!=="cancelled"&&s.status!=="void"),N=d.filter(s=>s.status!=="cancelled"&&s.status!=="void"),_=h.filter(s=>s.status!=="cancelled"&&s.status!=="void"),q(),J(),Z(),y()}catch(n){console.error("[HierarchicalDebt] Error loading operational data:",n),o&&(o.innerHTML=`<div class="alert bad" style="margin:20px;">حدث خطأ أثناء تحميل البيانات: ${n.message}</div>`)}}window.loadHierarchicalDebtData=z;function q(){const t=document.getElementById("hdebt-rep-filter");if(!t)return;const o=t.value;let n=`<option value="">🌟 جميع المناديب (${$.length})</option>`;$.forEach(r=>{n+=`<option value="${r.id}" ${r.id===o?"selected":""}>👤 ${r.name||"مندوب"}</option>`}),n+=`<option value="__unassigned__" ${o==="__unassigned__"?"selected":""}>🏢 مبيعات مباشرة / بدون مندوب</option>`,t.innerHTML=n}function J(){const t=document.getElementById("hdebt-from")?.value||"",o=document.getElementById("hdebt-to")?.value||"9999-12-31",n={};$.forEach(e=>{n[e.id]={id:e.id,name:e.name||"مندوب",code:e.code||"",phone:e.phone||"",zone:e.zone||"",customers:[],totals:{openingBalance:0,sales:0,receipts:0,returns:0,closingBalance:0,debtorCount:0,totalCustomers:0}}});const r={id:"__unassigned__",name:"مبيعات مباشرة / إدارة (بدون مندوب)",code:"DIRECT",phone:"",zone:"المركز الرئيسي",customers:[],totals:{openingBalance:0,sales:0,receipts:0,returns:0,closingBalance:0,debtorCount:0,totalCustomers:0}},i={};M.forEach(e=>{i[e.id]={openingBal:parseFloat(e.openingBalance)||0,priorInvoices:0,priorReceipts:0,priorReturns:0,periodInvoices:[],periodReceipts:[],periodReturns:[]}}),T.forEach(e=>{const a=e.customerId;if(!a)return;i[a]||(i[a]={openingBal:0,priorInvoices:0,priorReceipts:0,priorReturns:0,periodInvoices:[],periodReceipts:[],periodReturns:[]});const l=e.date||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:""),b=parseFloat(e.totalWithVat!==void 0?e.totalWithVat:e.netTotal!==void 0?e.netTotal:e.total||0)||0;t&&l<t?i[a].priorInvoices+=b:l<=o&&i[a].periodInvoices.push({type:"invoice",date:l,docNum:e.number||e.invoiceNumber||e.id?.slice(0,8),notes:`فاتورة مبيعات (${(e.lines||[]).length} صنف) — ${e.paymentMethod==="cash"?"نقدي":"آجل"}`,paymentMethod:e.paymentMethod||"credit",debit:b,credit:0})}),O.forEach(e=>{const a=e.targetId||e.customerId;if(!a)return;i[a]||(i[a]={openingBal:0,priorInvoices:0,priorReceipts:0,priorReturns:0,periodInvoices:[],periodReceipts:[],periodReturns:[]});const l=e.date||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:""),b=parseFloat(e.amount||0)||0;t&&l<t?i[a].priorReceipts+=b:l<=o&&i[a].periodReceipts.push({type:"receipt",date:l,docNum:e.number||`RC-${e.id?.slice(0,6).toUpperCase()}`,notes:`سند قبض — طريقة السداد: ${e.method==="cash"?"نقدي":e.method==="transfer"?"تحويل بنكي":e.method||"سداد"} ${e.notes?"— "+e.notes:""}`,paymentMethod:e.method||"cash",debit:0,credit:b})}),N.forEach(e=>{const a=e.customerId;if(!a)return;i[a]||(i[a]={openingBal:0,priorInvoices:0,priorReceipts:0,priorReturns:0,periodInvoices:[],periodReceipts:[],periodReturns:[]});const l=e.date||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:""),b=parseFloat(e.amount||0)||0;t&&l<t?i[a].priorReceipts+=b:l<=o&&i[a].periodReceipts.push({type:"receipt",date:l,docNum:e.number||`COL-${e.id?.slice(0,5)}`,notes:`تحصيل مبيعات — ${e.method||"نقدي"} ${e.notes?"— "+e.notes:""}`,paymentMethod:e.method||"cash",debit:0,credit:b})}),_.forEach(e=>{const a=e.customerId;if(!a)return;i[a]||(i[a]={openingBal:0,priorInvoices:0,priorReceipts:0,priorReturns:0,periodInvoices:[],periodReceipts:[],periodReturns:[]});const l=e.date||(e.createdAt?.toDate?e.createdAt.toDate().toISOString().split("T")[0]:""),b=parseFloat(e.totalWithVat!==void 0?e.totalWithVat:e.total!==void 0?e.total:e.subtotal||0)||0;t&&l<t?i[a].priorReturns+=b:l<=o&&i[a].periodReturns.push({type:"return",date:l,docNum:e.number||e.creditNoteNumber||`CR-${e.id?.slice(0,6)}`,notes:`إشعار مردود مبيعات ${e.refInvoice?"للفاتورة "+e.refInvoice:""} ${e.reason?"— "+e.reason:""}`,debit:0,credit:b})});const p=[];M.forEach(e=>{const a=i[e.id]||{openingBal:0,priorInvoices:0,priorReceipts:0,priorReturns:0,periodInvoices:[],periodReceipts:[],periodReturns:[]},l=a.openingBal+a.priorInvoices-a.priorReceipts-a.priorReturns,b=a.periodInvoices.reduce((g,u)=>g+u.debit,0),C=a.periodReceipts.reduce((g,u)=>g+u.credit,0),E=a.periodReturns.reduce((g,u)=>g+u.credit,0),D=Math.round((l+b-C-E)*100)/100,P=[...a.periodInvoices,...a.periodReceipts,...a.periodReturns];P.sort((g,u)=>(g.date||"").localeCompare(u.date||""));let S=l;const Y=P.map(g=>(S=Math.round((S+(g.debit||0)-(g.credit||0))*100)/100,{...g,runningBalance:S})),V={id:e.id,name:e.name||"عميل غير مسمى",code:e.code||"",phone:e.phone||"",zone:e.zone||e.address||"",repId:e.assignedRepId||e.repId||null,repName:e.repName||"",openingBalance:Math.round(l*100)/100,periodSales:Math.round(b*100)/100,periodReceipts:Math.round(C*100)/100,periodReturns:Math.round(E*100)/100,closingBalance:D,transactions:Y,status:D>.01?"debtor":D<-.01?"creditor":"settled",hasActivity:Math.abs(l)>.001||b>0||C>0||E>0};p.push(V)}),p.forEach(e=>{let a=n[e.repId];if(!a){const l=T.find(b=>b.customerId===e.id&&(b.repId||b.salesRepId));l&&n[l.repId||l.salesRepId]&&(a=n[l.repId||l.salesRepId])}a?(a.customers.push(e),a.totals.openingBalance+=e.openingBalance,a.totals.sales+=e.periodSales,a.totals.receipts+=e.periodReceipts,a.totals.returns+=e.periodReturns,a.totals.closingBalance+=e.closingBalance,a.totals.totalCustomers++,e.closingBalance>.01&&a.totals.debtorCount++):(r.customers.push(e),r.totals.openingBalance+=e.openingBalance,r.totals.sales+=e.periodSales,r.totals.receipts+=e.periodReceipts,r.totals.returns+=e.periodReturns,r.totals.closingBalance+=e.closingBalance,r.totals.totalCustomers++,e.closingBalance>.01&&r.totals.debtorCount++)});const d=Object.values(n);r.customers.length>0&&d.push(r),d.forEach(e=>{e.customers.sort((a,l)=>l.closingBalance-a.closingBalance)}),d.sort((e,a)=>a.totals.closingBalance-e.totals.closingBalance),B=d;let h=0,s=0,m=0,k=0,I=0,H=0,L=0,F=p.length;p.forEach(e=>{e.closingBalance>.01?(h+=e.closingBalance,L++):e.closingBalance<-.01&&(s+=Math.abs(e.closingBalance)),m+=e.closingBalance,k+=e.periodSales,I+=e.periodReceipts,H+=e.periodReturns});const A=Math.max(0,k+p.reduce((e,a)=>e+Math.max(0,a.openingBalance),0)),j=A>0?I/A*100:0;f={totalDebt:Math.round(h*100)/100,totalCreditBal:Math.round(s*100)/100,netReceivables:Math.round(m*100)/100,periodSales:Math.round(k*100)/100,periodReceipts:Math.round(I*100)/100,periodReturns:Math.round(H*100)/100,debtorCount:L,totalCustomers:F,collectionRate:Math.min(100,Math.round(j*10)/10)}}function Z(){document.getElementById("kpi-total-debt").textContent=c(f.totalDebt),document.getElementById("kpi-debtors-count").textContent=`${f.debtorCount} عميل مدين (من أصل ${f.totalCustomers})`,document.getElementById("kpi-period-sales").textContent=c(f.periodSales),document.getElementById("kpi-period-receipts").textContent=c(f.periodReceipts),document.getElementById("kpi-period-returns").textContent=c(f.periodReturns),document.getElementById("kpi-collection-rate").textContent=`${f.collectionRate.toFixed(1)}%`,document.getElementById("kpi-net-receivables").textContent=`صافي الذمم: ${c(f.netReceivables)}`;const t=document.getElementById("hdebt-from")?.value||"البداية",o=document.getElementById("hdebt-to")?.value||"الآن",n=document.getElementById("hdebt-print-period-label");n&&(n.textContent=`الفترة من: ${t}  إلى: ${o} | إجمالي المديونيات القائمة: ${c(f.totalDebt)}`)}function y(){const t=document.getElementById("hdebt-tree-content");if(!t)return;const o=document.getElementById("hdebt-rep-filter")?.value||"",n=document.getElementById("hdebt-status-filter")?.value||"all",r=(document.getElementById("hdebt-search")?.value||"").trim().toLowerCase();let i=B.map(d=>{let h=d.customers;return n==="debtors"?h=h.filter(s=>s.closingBalance>.01):n==="settled"?h=h.filter(s=>Math.abs(s.closingBalance)<=.01&&s.hasActivity):n==="creditors"&&(h=h.filter(s=>s.closingBalance<-.01)),r&&(h=h.filter(s=>(s.name||"").toLowerCase().includes(r)||(s.code||"").toLowerCase().includes(r)||(s.phone||"").includes(r)||(d.name||"").toLowerCase().includes(r))),{...d,visibleCustomers:h}});if(o&&(i=i.filter(d=>d.id===o)),i=i.filter(d=>d.visibleCustomers.length>0),i.length===0){t.innerHTML=`
      <div style="background:var(--bg-1,#fff); border-radius:14px; padding:40px 20px; text-align:center; border:1px solid var(--border-soft,#e2e8f0); color:var(--text-2,#64748b);">
        <div style="font-size:32px; margin-bottom:8px;">🔍</div>
        <div style="font-weight:800; font-size:15px; color:var(--text-0,#0f172a);">لا توجد مديونيات أو حركات مطابقة للفلاتر المحددة</div>
        <div style="font-size:12px; margin-top:4px;">جرّب تغيير حالة المديونية أو توسيع نطاق الفترة الزمنية</div>
      </div>
    `;return}let p="";i.forEach(d=>{const h=x.has(d.id),s=Math.max(0,d.totals.sales+Math.max(0,d.totals.openingBalance)),m=s>0?Math.min(100,Math.round(d.totals.receipts/s*100)):0;p+=`
      <div class="hdebt-rep-card ${h?"is-open":""}" id="rep-card-${d.id}">
        
        <!-- ══ LEVEL 1: REP HEADER ══ -->
        <div class="hdebt-rep-header" onclick="window.toggleHierarchicalRep('${d.id}')">
          
          <div class="hdebt-rep-title-group">
            <div class="hdebt-rep-avatar">
              ${d.id==="__unassigned__"?"🏢":d.name?d.name.charAt(0):"👤"}
            </div>
            <div>
              <div class="hdebt-rep-name">${d.name} ${d.code?`<span style="font-size:11px; font-weight:normal; opacity:0.75;">(${d.code})</span>`:""}</div>
              <div class="hdebt-rep-meta">
                <span>👥 ${d.visibleCustomers.length} عميل</span>
                <span style="margin: 0 4px;">•</span>
                <span style="color:#dc2626; font-weight:700;">🔴 ${d.totals.debtorCount} مدين</span>
                ${d.phone?`<span style="margin: 0 4px;">•</span> <span>📞 ${d.phone}</span>`:""}
              </div>
            </div>
          </div>

          <div class="hdebt-rep-metrics-row">
            
            <!-- Opening Balance -->
            <div class="hdebt-rep-metric">
              <div class="hdebt-rep-metric-lbl">رصيد أول المدة</div>
              <div class="hdebt-rep-metric-val" style="color:#475569;">${c(d.totals.openingBalance)}</div>
            </div>

            <!-- Sales -->
            <div class="hdebt-rep-metric">
              <div class="hdebt-rep-metric-lbl">مبيعات (+)</div>
              <div class="hdebt-rep-metric-val" style="color:#1d4ed8;">${c(d.totals.sales)}</div>
            </div>

            <!-- Receipts -->
            <div class="hdebt-rep-metric">
              <div class="hdebt-rep-metric-lbl">سدادات (-)</div>
              <div class="hdebt-rep-metric-val" style="color:#059669;">${c(d.totals.receipts)}</div>
            </div>

            <!-- Returns -->
            <div class="hdebt-rep-metric">
              <div class="hdebt-rep-metric-lbl">مردودات (-)</div>
              <div class="hdebt-rep-metric-val" style="color:#d97706;">${c(d.totals.returns)}</div>
            </div>

            <!-- Current Debt -->
            <div class="hdebt-rep-metric" style="background:rgba(239,68,68,0.06); padding:4px 10px; border-radius:8px; border:1px solid rgba(239,68,68,0.15);">
              <div class="hdebt-rep-metric-lbl" style="color:#dc2626;">صافي المديونية</div>
              <div class="hdebt-rep-metric-val" style="color:#dc2626; font-size:14.5px;">${c(d.totals.closingBalance)}</div>
            </div>

            <!-- Progress & Chevron -->
            <div style="display:flex; align-items:center; gap:8px;">
              <div title="نسبة التحصيل: ${m}%">
                <div style="font-size:10px; font-weight:800; color:#10b981; text-align:left;">${m}%</div>
                <div class="hdebt-rep-coll-bar"><div class="hdebt-rep-coll-fill" style="width:${m}%;"></div></div>
              </div>
              <div class="hdebt-rep-chevron">▼</div>
            </div>

          </div>

        </div>

        <!-- ══ LEVEL 2: CUSTOMERS LIST ══ -->
        <div class="hdebt-cust-list" style="display:${h?"block":"none"};" id="rep-custs-${d.id}">
          ${d.visibleCustomers.map(k=>ee(k)).join("")}
        </div>

      </div>
    `}),t.innerHTML=p}function ee(t,o){const n=v.has(t.id),r=t.status==="debtor"?"hdebt-badge-debtor":t.status==="creditor"?"hdebt-badge-creditor":"hdebt-badge-settled",i=t.status==="debtor"?"🔴 مدين":t.status==="creditor"?"🔵 دائن":"🟢 مسدد";return`
    <div class="hdebt-cust-card ${n?"is-open":""}" id="cust-card-${t.id}">
      
      <!-- Customer Row Header -->
      <div class="hdebt-cust-header" onclick="window.toggleHierarchicalCust('${t.id}')">
        
        <div class="hdebt-cust-info">
          <span class="hdebt-cust-code">${t.code||"CUST"}</span>
          <div>
            <div class="hdebt-cust-name">${t.name}</div>
            <div class="hdebt-cust-phone">
              ${t.phone?`<span>📞 ${t.phone}</span>`:""}
              ${t.zone?`<span style="margin:0 4px;">•</span><span>📍 ${t.zone}</span>`:""}
            </div>
          </div>
        </div>

        <div class="hdebt-cust-cols">
          
          <!-- Opening -->
          <div class="hdebt-col-cell">
            <div class="hdebt-col-lbl">رصيد أول المدة</div>
            <div class="hdebt-col-val" style="color:#64748b;">${c(t.openingBalance)}</div>
          </div>

          <!-- Sales -->
          <div class="hdebt-col-cell">
            <div class="hdebt-col-lbl">مبيعات (+)</div>
            <div class="hdebt-col-val" style="color:#1d4ed8;">${c(t.periodSales)}</div>
          </div>

          <!-- Receipts -->
          <div class="hdebt-col-cell">
            <div class="hdebt-col-lbl">سدادات (-)</div>
            <div class="hdebt-col-val" style="color:#059669;">${c(t.periodReceipts)}</div>
          </div>

          <!-- Returns -->
          <div class="hdebt-col-cell">
            <div class="hdebt-col-lbl">مردودات (-)</div>
            <div class="hdebt-col-val" style="color:#d97706;">${c(t.periodReturns)}</div>
          </div>

          <!-- Current Balance -->
          <div class="hdebt-col-cell" style="min-width:100px;">
            <div class="hdebt-col-lbl" style="color:${t.closingBalance>0?"#dc2626":"#059669"}; font-weight:800;">الرصيد النهائي</div>
            <div class="hdebt-col-val" style="font-size:13.5px; color:${t.closingBalance>0?"#dc2626":t.closingBalance<0?"#1d4ed8":"#059669"};">
              ${c(t.closingBalance)}
            </div>
          </div>

          <!-- Status Badge -->
          <div class="hdebt-badge ${r}">${i}</div>

          <!-- Action & Chevron -->
          <div style="display:flex; align-items:center; gap:6px;" onclick="event.stopPropagation()">
            <button class="hdebt-stmt-btn" title="فتح كشف حساب رسمي للعميل" onclick="window.openCustomerUnifiedStatement('${t.id}')">
              📄 كشف حساب
            </button>
            <div class="hdebt-rep-chevron" style="width:24px; height:24px; font-size:9px; cursor:pointer;" onclick="window.toggleHierarchicalCust('${t.id}')">▼</div>
          </div>

        </div>

      </div>

      <!-- ══ LEVEL 3: TIMELINE TRANSACTIONS ══ -->
      <div class="hdebt-txns-wrap" style="display:${n?"block":"none"};" id="cust-txns-${t.id}">
        ${te(t)}
      </div>

    </div>
  `}function te(t){return!t.transactions||t.transactions.length===0?`
      <div style="padding:14px; text-align:center; color:var(--text-2,#64748b); font-size:12px; background:#f8fafc; border-radius:8px;">
        ℹ️ لا توجد حركات بيع أو تحصيل أو مرتجع مسجلة لهذا العميل خلال الفترة المحددة. (رصيد أول المدة: ${c(t.openingBalance)})
      </div>
    `:(t.openingBalance,`
    <table class="hdebt-txns-table">
      <thead>
        <tr>
          <th>التاريخ</th>
          <th>نوع المستند</th>
          <th>رقم المستند / المرجع</th>
          <th>البيان والتفاصيل</th>
          <th style="color:#1d4ed8; text-align:left;">مدين (+)</th>
          <th style="color:#059669; text-align:left;">دائن (-)</th>
          <th style="color:#dc2626; text-align:left;">الرصيد المترتب</th>
        </tr>
      </thead>
      <tbody>
        <!-- Opening Balance Row -->
        <tr style="background:#f8fafc; font-weight:700;">
          <td style="color:#64748b;">—</td>
          <td><span class="tx-badge tx-ob">رصيد سابق</span></td>
          <td style="font-family:monospace; color:#64748b;">OPENING</td>
          <td style="color:#64748b;">رصيد أول المدة ما قبل تاريخ بداية التقرير</td>
          <td style="text-align:left; font-family:monospace;">${t.openingBalance>0?c(t.openingBalance):"—"}</td>
          <td style="text-align:left; font-family:monospace;">${t.openingBalance<0?c(Math.abs(t.openingBalance)):"—"}</td>
          <td style="text-align:left; font-family:monospace; font-weight:900;">${c(t.openingBalance)}</td>
        </tr>

        <!-- Transaction Rows -->
        ${t.transactions.map(o=>{const n=o.type==="invoice"?"tx-inv":o.type==="receipt"?"tx-rcpt":"tx-ret",r=o.type==="invoice"?"فاتورة مبيعات":o.type==="receipt"?"سند قبض":"مرتجع مبيعات";return`
            <tr>
              <td style="font-family:monospace; color:#475569; white-space:nowrap;">${o.date||"—"}</td>
              <td><span class="tx-badge ${n}">${r}</span></td>
              <td style="font-family:monospace; font-weight:800; color:#1e40af;">${o.docNum||"—"}</td>
              <td style="color:#334155;">${o.notes||"—"}</td>
              <td style="text-align:left; font-family:monospace; font-weight:${o.debit?"800":"normal"}; color:${o.debit?"#1d4ed8":"#94a3b8"};">
                ${o.debit?c(o.debit):"—"}
              </td>
              <td style="text-align:left; font-family:monospace; font-weight:${o.credit?"800":"normal"}; color:${o.credit?"#059669":"#94a3b8"};">
                ${o.credit?c(o.credit):"—"}
              </td>
              <td style="text-align:left; font-family:monospace; font-weight:900; color:${o.runningBalance>0?"#dc2626":o.runningBalance<0?"#1d4ed8":"#059669"};">
                ${c(o.runningBalance)}
              </td>
            </tr>
          `}).join("")}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4">إجمالي حركات الفترة وصافي المديونية الختامية للعميل</td>
          <td style="text-align:left; color:#1d4ed8;">${c(t.periodSales)}</td>
          <td style="text-align:left; color:#059669;">${c(t.periodReceipts+t.periodReturns)}</td>
          <td style="text-align:left; color:${t.closingBalance>0?"#dc2626":"#059669"};">${c(t.closingBalance)}</td>
        </tr>
      </tfoot>
    </table>
  `)}function oe(){window.toggleHierarchicalRep=t=>{x.has(t)?x.delete(t):x.add(t),y()},window.toggleHierarchicalCust=t=>{v.has(t)?v.delete(t):v.add(t),y()},window.expandAllHierarchicalDebt=(t=!0)=>{t?B.forEach(o=>{x.add(o.id),o.customers.forEach(n=>v.add(n.id))}):(x.clear(),v.clear()),y()},window.applyHierarchicalDebtFilters=()=>{y()},window.setHierarchicalDebtPeriod=t=>{const o=new Date,n=document.getElementById("hdebt-to"),r=document.getElementById("hdebt-from");if(!(!n||!r)){if(n.value=o.toISOString().split("T")[0],t==="today")r.value=o.toISOString().split("T")[0];else if(t==="week"){const i=new Date(o);i.setDate(i.getDate()-7),r.value=i.toISOString().split("T")[0]}else if(t==="mtd")r.value=o.toISOString().split("T")[0].slice(0,8)+"01";else if(t==="lastMonth"){const i=new Date(o.getFullYear(),o.getMonth()-1,1),p=new Date(o.getFullYear(),o.getMonth(),0);r.value=i.toISOString().split("T")[0],n.value=p.toISOString().split("T")[0]}else t==="all"&&(r.value="2024-01-01");z()}},window.openCustomerUnifiedStatement=t=>{typeof window.navigate=="function"&&(window._preselectedStatementEntity={type:"customer",id:t},window.navigate("report-customer-statement"))},window.printHierarchicalDebt=()=>{B.forEach(t=>{x.add(t.id),t.customers.forEach(o=>v.add(o.id))}),y(),setTimeout(()=>{window.print()},250)},window.exportHierarchicalDebtExcel=async()=>{try{const t=[];t.push(["المندوب","كود العميل","اسم العميل","الهاتف","المنطقة","رصيد أول المدة","مبيعات الفترة","سدادات الفترة","مردودات الفترة","صافي المديونية","حالة المديونية"]),B.forEach(i=>{i.customers.forEach(p=>{t.push([i.name,p.code||"—",p.name,p.phone||"—",p.zone||"—",p.openingBalance,p.periodSales,p.periodReceipts,p.periodReturns,p.closingBalance,p.status==="debtor"?"مدين":p.status==="creditor"?"دائن":"مسدد"])})});const o=document.getElementById("hdebt-from")?.value||"الكل",n=document.getElementById("hdebt-to")?.value||"الكل",r=`تقرير_المديونيات_الهرمي_${o}_إلى_${n}`;await K({filename:r,sheetName:"المديونيات",title:"تقرير المديونيات الهرمي الشجري لمتابعة العملاء والمناديب",headers:["المندوب","كود العميل","اسم العميل","الهاتف","المنطقة","رصيد أول المدة","مبيعات الفترة","سدادات الفترة","مردودات الفترة","صافي المديونية","حالة المديونية"],rows:t,summaryRows:[["الإجمالي العام","","","","","",f.periodSales,f.periodReceipts,f.periodReturns,f.totalDebt,`إجمالي المدينين: ${f.debtorCount}`]]}),window.showToast?.("✅ تم تصدير تقرير المديونيات إلى Excel بنجاح","success")}catch(t){console.error("Excel Export Error:",t),window.showToast?.("❌ فشل تصدير Excel: "+t.message,"error")}}}export{le as render};
