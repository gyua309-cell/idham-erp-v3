// ============================================================
// IDHAM ERP — يومية المندوب والتقرير العام للمبيعات والمستهدفات v12.0 الملكية
// شاملة:
// 1. عمود "تحصيل اليوم" بجوار "مبيعات اليوم" مباشرة مع تفصيل النقد والشبكة
// 2. المبيعات قبل الضريبة في الكروت وتحت كل عمود مبيعات بلون مميز
// 3. حذف أعمدة السلف والمصروفات والتوريد من التقرير العام ليكون تركيزه 100% بيعي وتحصيلي
// 4. الرسوم البيانية التفاعلية وتصدير Excel وPDF الملكي الفاخر
// ============================================================
import { COLS, getAll, collection, db, COMPANY_ID, doc, updateDoc, getDocs } from "../../utils/db.js";
import { formatCurrency, formatDate } from "../../utils/formatters.js";
import { exportXLSX } from "../../utils/export.js";

// State
let _currentTab = "general"; // "general" or "daily"
let _cachedReps = [];
let _cachedBoxRepMap = {};
let _cachedBoxAccIdMap = {};
let _cachedBoxAccCodeMap = {};
let _cachedCcRepMap = {};
let _cachedRepBoxNameMap = {};
let _cachedRepCustodyAccMap = {};
let _cachedRepLoanAccMap = {};
let _cachedRepConfigs = {};

// Detailed Daily Report State
let _currentReportRows = [];
let _currentReportGrand = {};
let _currentReportMeta = {};

// General Executive Report State
let _currentGenData = null;
let _genCharts = {};

export async function render(container) {
  const today      = new Date().toISOString().split("T")[0];
  const monthStart = today.slice(0, 8) + "01";

  container.innerHTML = `
    <div class="rdj-wrap">
      <!-- ═══ الترويسة الرئيسية + التبويبات العلوية ═══ -->
      <div class="rdj-header-panel no-print">
        <div class="rdj-title-row">
          <div class="rdj-icon-badge">📊</div>
          <div>
            <h2 class="rdj-main-title">لوحة متابعة المبيعات ويومية المناديب</h2>
            <p class="rdj-sub-title">تحليل متقدم لمبيعات وتحصيلات اليوم والفترة، المبيعات قبل الضريبة، مؤشرات تحقيق المستهدفات (Target)، ويوميات حركة الصناديق</p>
          </div>
        </div>

        <!-- أزرار التبديل بين التبويبين -->
        <div class="rdj-tabs-bar">
          <button id="tab-btn-general" class="rdj-tab-btn active" onclick="window.switchRdjTab('general')">
            <span class="tab-icon">📊</span>
            <span class="tab-text">التقرير العام ومؤشرات الأداء</span>
          </button>
          <button id="tab-btn-daily" class="rdj-tab-btn" onclick="window.switchRdjTab('daily')">
            <span class="tab-icon">📋</span>
            <span class="tab-text">يومية المندوب وحركة الصندوق</span>
          </button>
        </div>
      </div>

      <!-- ═══ شريط الفلاتر المشترك ═══ -->
      <div class="rdj-filters no-print">
        <div class="rdj-fg">
          <label>المندوب</label>
          <select id="rdj-rep" class="rdj-sel">
            <option value="">🌟 جميع المناديب</option>
          </select>
        </div>
        <div class="rdj-fg">
          <label>من تاريخ</label>
          <input type="date" id="rdj-from" class="rdj-inp font-bold mono" value="${monthStart}" />
        </div>
        <div class="rdj-fg">
          <label>إلى تاريخ</label>
          <input type="date" id="rdj-to" class="rdj-inp font-bold mono" value="${today}" />
        </div>

        
        <!-- أزرار الفترات السريعة -->
        <div class="rdj-presets">
          <button type="button" class="preset-btn" onclick="window.setRdjPeriod('today')">اليوم ⚡</button>
          <button type="button" class="preset-btn" onclick="window.setRdjPeriod('week')">هذا الأسبوع 📅</button>
          <button type="button" class="preset-btn" onclick="window.setRdjPeriod('mtd')">الشهر الحالي MTD 🗓️</button>
          <button type="button" class="preset-btn" onclick="window.setRdjPeriod('lastMonth')">الشهر الماضي</button>
        </div>

        <!-- أزرار العمليات -->
        <div class="rdj-actions-group">
          <button id="rdj-run" class="rdj-btn-p">🔍 عرض التقرير</button>
          
          <!-- أزرار خاصة بالتقرير العام -->
          <button id="btn-gen-target" class="rdj-btn-gold gen-only" onclick="window.openRepTargetModal()">🎯 ضبط المستهدفات</button>
          <button id="btn-gen-whatsapp" class="rdj-btn-whatsapp gen-only" onclick="window.shareRepDailyJournalWhatsApp()">📲 إرسال للمدير المالي (واتساب)</button>
          <button id="btn-gen-excel" class="rdj-btn-green gen-only" onclick="window.exportGeneralReportExcel()">📥 تصدير Excel</button>
          <button id="btn-gen-pdf" class="rdj-btn-royal gen-only" onclick="window.printGeneralReportPDF()">👑 تصدير PDF ملكي</button>

          <!-- أزرار خاصة باليومية التفصيلية -->
          <button id="btn-daily-print" class="rdj-btn-s daily-only" style="display:none;" onclick="window.printRepDailyReport()">🖨️ طباعة اليومية (A4 مستقل)</button>
          <button id="btn-daily-excel" class="rdj-btn-green daily-only" style="display:none;" onclick="window.exportRepDailyExcel()">📥 تصدير اليومية Excel</button>
        </div>
      </div>

      <!-- ═══ منطقة المحتوى المتغيرة ═══ -->
      <div id="rdj-body">
        <div class="rdj-empty">جاري تحميل المناديب والبيانات...</div>
      </div>

      <!-- ═══ نافذة منبثقة لضبط التارجت الشهري ═══ -->
      <div id="rdj-target-modal" class="rdj-modal-overlay" style="display:none;">
        <div class="rdj-modal-box">
          <div class="rdj-modal-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:22px;">🎯</span>
              <h3 style="margin:0; font-size:1.15rem; color:#0f172a; font-weight:800;">تحديد المستهدف الشهري للمناديب (Monthly Sales Target)</h3>
            </div>
            <button class="rdj-modal-close" onclick="window.closeRepTargetModal()">×</button>
          </div>
          <div class="rdj-modal-body" id="rdj-target-modal-body"></div>
          <div class="rdj-modal-footer">
            <button class="rdj-btn-secondary" onclick="window.closeRepTargetModal()">إلغاء</button>
            <button class="rdj-btn-p" id="rdj-save-targets-btn" onclick="window.saveRepTargets()">💾 حفظ المستهدفات وتحديث التقرير</button>
          </div>
      <!-- ═══ نافذة منبثقة لفحص وتدقيق أرباح وتكاليف الفواتير ═══ -->
      <div id="rdj-profit-audit-modal" class="rdj-modal-overlay" style="display:none;">
        <div class="rdj-modal-box" style="max-width:920px; width:95%;">
          <div class="rdj-modal-header" style="background:linear-gradient(135deg, #065f46, #047857); color:#fff; border-radius:14px 14px 0 0;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:22px;">🔍</span>
              <h3 id="rdj-profit-modal-title" style="margin:0; font-size:1.15rem; color:#fff; font-weight:800;">كشف تدقيق أرباح وتكاليف فواتير المندوب</h3>
            </div>
            <button class="rdj-modal-close" style="color:#fff;" onclick="window.closeRepProfitAuditModal()">×</button>
          </div>
          <div class="rdj-modal-body" id="rdj-profit-modal-body" style="padding:16px 20px; max-height:75vh; overflow-y:auto;"></div>
          <div class="rdj-modal-footer" style="padding:12px 18px; background:#f8fafc; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size:11.5px; color:#64748b; font-weight:700;">* التكلفة مأخوذة من واقع أسعار شراء الأصناف الفعلية المسجلة في فواتير المبيعات.</div>
            <button class="rdj-btn-secondary" onclick="window.closeRepProfitAuditModal()">إغلاق</button>
          </div>
        </div>
      </div>

    </div>

    <style>
      .rdj-wrap { padding:16px 20px; font-family:'Cairo','IBM Plex Sans Arabic','Segoe UI',sans-serif; direction:rtl; color:#1e293b; }
      
      /* Header & Tabs */
      .rdj-header-panel { background:var(--card-bg,#fff); border:1px solid #e2e8f0; border-radius:14px; padding:16px 20px; margin-bottom:16px; box-shadow:0 2px 8px rgba(0,0,0,0.03); }
      .rdj-title-row { display:flex; align-items:center; gap:14px; margin-bottom:14px; }
      .rdj-icon-badge { background:linear-gradient(135deg, #1e3a8a, #2563eb); width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px; color:#fff; box-shadow:0 4px 12px rgba(37,99,235,0.25); }
      .rdj-main-title { margin:0; font-size:1.35rem; font-weight:900; color:#0f172a; }
      .rdj-sub-title { margin:3px 0 0; color:#64748b; font-size:.82rem; font-weight:600; }

      .rdj-tabs-bar { display:flex; gap:8px; border-top:1px solid #f1f5f9; padding-top:12px; }
      .rdj-tab-btn { display:inline-flex; align-items:center; gap:8px; padding:9px 18px; border-radius:10px; border:1.5px solid #cbd5e1; background:#f8fafc; color:#475569; font-size:.9rem; font-weight:800; cursor:pointer; transition:all 0.2s; }
      .rdj-tab-btn:hover { background:#f1f5f9; border-color:#94a3b8; }
      .rdj-tab-btn.active { background:linear-gradient(135deg, #1e3a8a, #2563eb); border-color:#1e3a8a; color:#fff; box-shadow:0 4px 12px rgba(37,99,235,0.25); }
      .rdj-tab-btn .tab-icon { font-size:1.05rem; }

      /* Filters */
      .rdj-filters { display:flex; flex-wrap:wrap; gap:12px; align-items:flex-end; background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:14px 18px; margin-bottom:18px; box-shadow:0 2px 8px rgba(0,0,0,0.03); }
      .rdj-fg { display:flex; flex-direction:column; gap:5px; min-width:140px; flex:1; }
      .rdj-fg label { font-size:.78rem; font-weight:800; color:#475569; }
      .rdj-sel, .rdj-inp { padding:8px 12px; border:1.5px solid #cbd5e1; border-radius:8px; font-size:.85rem; background:#f8fafc; color:#1e293b; outline:none; transition:border 0.2s; }
      .rdj-sel:focus, .rdj-inp:focus { border-color:#2563eb; background:#fff; }
      
      .rdj-presets { display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-bottom:2px; }
      .preset-btn { padding:7px 10px; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:6px; font-size:.75rem; font-weight:800; color:#334155; cursor:pointer; transition:all 0.15s; }
      .preset-btn:hover { background:#e2e8f0; color:#1e3a8a; border-color:#94a3b8; }

      .rdj-actions-group { display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:flex-end; }
      .rdj-btn-p { padding:9px 18px; background:linear-gradient(135deg, #1e3a8a, #2563eb); color:#fff; border:none; border-radius:8px; font-size:.88rem; cursor:pointer; font-weight:800; box-shadow:0 2px 8px rgba(37,99,235,0.3); transition:transform 0.1s; }
      .rdj-btn-p:active { transform:scale(0.98); }
      .rdj-btn-gold { padding:9px 14px; background:linear-gradient(135deg, #d97706, #b45309); color:#fff; border:none; border-radius:8px; font-size:.85rem; cursor:pointer; font-weight:800; box-shadow:0 2px 6px rgba(217,119,6,0.3); }
      .rdj-btn-green { padding:9px 14px; background:#10b981; color:#fff; border:none; border-radius:8px; font-size:.85rem; cursor:pointer; font-weight:800; box-shadow:0 2px 6px rgba(16,185,129,0.3); }
      .rdj-btn-whatsapp { padding:9px 15px; background:linear-gradient(135deg, #16a34a, #15803d); color:#fff; border:none; border-radius:8px; font-size:.85rem; cursor:pointer; font-weight:800; box-shadow:0 2px 6px rgba(22,163,74,0.35); display:inline-flex; align-items:center; gap:6px; transition:transform 0.1s; }
      .rdj-btn-whatsapp:active { transform:scale(0.97); }
      .rdj-btn-royal { padding:9px 16px; background:linear-gradient(135deg, #0f172a, #1e3a8a); color:#fef08a; border:1.5px solid #d97706; border-radius:8px; font-size:.88rem; cursor:pointer; font-weight:900; box-shadow:0 3px 10px rgba(15,23,42,0.35); }
      .rdj-btn-s { padding:9px 16px; background:#f1f5f9; color:#1e3a8a; border:1.5px solid #2563eb; border-radius:8px; font-size:.88rem; cursor:pointer; font-weight:800; }
      .rdj-btn-secondary { padding:8px 16px; background:#e2e8f0; color:#334155; border:none; border-radius:8px; font-size:.85rem; cursor:pointer; font-weight:800; }

      .rdj-empty { text-align:center; padding:60px; color:#94a3b8; font-size:1.05rem; font-weight:700; background:#fff; border-radius:12px; border:1px dashed #cbd5e1; }
      .rdj-loading { text-align:center; padding:50px; color:#2563eb; font-weight:800; font-size:1.1rem; }

      /* Executive General Report Styles */
      .gen-kpis-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:12px; margin-bottom:18px; }
      .gen-kpi-card { background:#fff; border:1.5px solid #e2e8f0; border-radius:12px; padding:14px 16px; position:relative; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.02); }
      .gen-kpi-card::before { content:''; position:absolute; top:0; right:0; left:0; height:3.5px; }
      .gen-kpi-card.blue::before   { background:#2563eb; }
      .gen-kpi-card.green::before  { background:#10b981; }
      .gen-kpi-card.amber::before  { background:#f59e0b; }
      .gen-kpi-card.purple::before { background:#8b5cf6; }
      .gen-kpi-card.emerald::before{ background:#059669; }
      .gen-kpi-card.cyan::before   { background:#0891b2; }

      .gen-kpi-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
      .gen-kpi-title { font-size:.76rem; font-weight:800; color:#64748b; }
      .gen-kpi-icon { font-size:1.15rem; }
      .gen-kpi-val { font-size:1.3rem; font-weight:900; color:#0f172a; font-family:monospace; line-height:1.2; }
      .gen-kpi-sub { font-size:.72rem; font-weight:700; color:#94a3b8; margin-top:4px; }
      .gen-kpi-before-vat { font-size:.78rem; font-weight:800; margin-top:3px; }

      /* Charts Section */
      .gen-charts-grid { display:grid; grid-template-columns:2fr 1fr; gap:14px; margin-bottom:18px; }
      @media (max-width:900px) { .gen-charts-grid { grid-template-columns:1fr; } }
      .chart-card { background:#fff; border:1px solid #cbd5e1; border-radius:12px; padding:14px 18px; box-shadow:0 2px 8px rgba(0,0,0,0.03); }
      .chart-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #f1f5f9; padding-bottom:8px; }
      .chart-title { font-size:.88rem; font-weight:800; color:#1e293b; display:flex; align-items:center; gap:6px; }
      .chart-canvas-wrap { position:relative; height:260px; width:100%; }

      /* Matrix Table */
      .matrix-tw { border-radius:14px; border:1px solid #cbd5e1; overflow-x:auto; background:#fff; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.03); }
      table.matrix-t { width:100%; border-collapse:collapse; font-size:.84rem; white-space:nowrap; }
      table.matrix-t thead { background:linear-gradient(135deg, #0f172a, #1e3a8a); color:#fff; }
      table.matrix-t th { padding:10px 10px; font-weight:800; font-size:.78rem; border-bottom:2px solid #0f172a; text-align:center; color:#f8fafc; }
      table.matrix-t th.r-align { text-align:right; }
      table.matrix-t tbody tr { border-bottom:1px solid #e2e8f0; transition:background 0.15s; }
      table.matrix-t tbody tr:hover { background:rgba(37,99,235,0.03); }
      table.matrix-t td { padding:9px 10px; text-align:center; color:#334155; vertical-align:middle; }
      table.matrix-t td.r-align { text-align:right; font-weight:800; color:#1e3a8a; }
      table.matrix-t tfoot tr { background:#f8fafc; border-top:2.5px solid #0f172a; font-weight:900; }
      table.matrix-t tfoot td { padding:11px 10px; vertical-align:middle; }

      /* Sales Cell Sub-Values */
      .cell-main-val { font-size:.92rem; font-family:monospace; font-weight:900; line-height:1.2; }
      .cell-sub-vat { font-size:10.5px; font-family:monospace; font-weight:800; margin-top:2px; display:block; }
      .sub-vat-blue   { color:#0284c7; }
      .sub-vat-green  { color:#0891b2; }
      .sub-vat-purple { color:#7c3aed; }

      /* Progress Mini Bars */
      .target-prog-wrap { width:85px; display:inline-block; vertical-align:middle; margin-left:6px; }
      .target-prog-track { height:7px; background:#e2e8f0; border-radius:4px; overflow:hidden; }
      .target-prog-fill { height:100%; border-radius:4px; transition:width 0.4s; }

      /* Daily Detail styles */
      .rdj-tw { border-radius:14px; border:1px solid #cbd5e1; overflow:hidden; background:#fff; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.03); }
      table.rdj-t { width:100%; border-collapse:collapse; font-size:.88rem; }
      .rdj-t thead { background:#0f172a; color:#fff; }
      .rdj-t th { padding:11px 12px; text-align:center; font-weight:800; font-size:.82rem; color:#fff; border-bottom:2px solid #0f172a; white-space:nowrap; }
      .rdj-t tbody tr.mr { border-bottom:1px solid #e2e8f0; cursor:pointer; transition:background 0.15s; }
      .rdj-t tbody tr.mr:hover { background:rgba(37,99,235,.04); }
      .rdj-t tbody tr.mr.open { background:rgba(37,99,235,.07); border-bottom:none; }
      .rdj-t td { padding:10px 12px; text-align:center; color:#334155; }
      td.td-date { font-weight:700; color:#1e293b; white-space:nowrap; }
      td.td-rep  { font-weight:900; color:#1e3a8a; text-align:right; font-size:.95rem; }
      td.td-sales { color:#059669; font-weight:800; }
      td.td-cash  { color:#d97706; font-weight:800; }
      td.td-bank  { color:#2563eb; font-weight:800; }
      td.td-exp   { color:#dc2626; font-weight:800; }
      td.td-box   { color:#047857; font-weight:900; font-size:.95rem; }
      .rdj-t tfoot tr { background:#f8fafc; border-top:2.5px solid #0f172a; }
      .rdj-t tfoot td { padding:12px; font-weight:900; font-size:.95rem; }

      .xbtn { background:#f1f5f9; border:1px solid #cbd5e1; cursor:pointer; font-size:.85rem; padding:3px 8px; border-radius:6px; color:#1e3a8a; font-weight:900; }
      .xbtn:hover { background:#e2e8f0; }

      tr.dr td { padding:0; border-bottom:2px solid #0284c7; }
      .di { display:none; padding:16px 20px; background:#f8fafc; }
      .di.open { display:block; }
      .rep-section-badge { display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%); color:#fff; padding:10px 16px; border-radius:10px; margin-bottom:14px; }
      .sub-card { background:#fff; border:1.5px solid #e2e8f0; border-radius:10px; padding:12px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.03); margin-bottom:12px; }
      .dh { font-size:.85rem; font-weight:900; padding:6px 12px; border-radius:6px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; }
      .dh.s { background:rgba(16,185,129,.12); color:#065f46; border:1px solid rgba(16,185,129,.3); }
      .dh.c { background:rgba(37,99,235,.12);  color:#1e3a8a; border:1px solid rgba(37,99,235,.3); }
      .dh.e { background:rgba(239,68,68,.12);   color:#991b1b; border:1px solid rgba(239,68,68,.3); }
      table.dt { width:100%; border-collapse:collapse; font-size:.82rem; }
      .dt th { background:#f1f5f9; padding:6px 10px; border-bottom:1.5px solid #cbd5e1; font-weight:800; color:#334155; text-align:center; white-space:nowrap; }
      .dt td { padding:6px 10px; border-bottom:1px solid #f1f5f9; text-align:center; color:#1e293b; }
      .dt td.lft { text-align:right; font-weight:700; }
      .dt tfoot td { font-weight:900; background:#f8fafc; border-top:1.5px solid #cbd5e1; }
      .dmt { text-align:center; padding:14px; color:#94a3b8; font-size:.8rem; font-weight:600; }
      .rep-box-calc-bar { background:#fff; border:1.5px solid #059669; border-radius:10px; padding:10px 16px; margin-top:8px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; font-size:.9rem; }

      .b { display:inline-block; padding:2px 8px; border-radius:6px; font-size:.72rem; font-weight:800; white-space:nowrap; }
      .b-cash { background:rgba(245,158,11,.15); color:#b45309; border:1px solid rgba(245,158,11,.3); }
      .b-bank { background:rgba(37,99,235,.15);  color:#1d4ed8; border:1px solid rgba(37,99,235,.3); }
      .b-cr   { background:rgba(239,68,68,.15);   color:#b91c1c; border:1px solid rgba(239,68,68,.3); }
      .b-adv  { background:rgba(124,58,237,.15);  color:#6d28d9; border:1px solid rgba(124,58,237,.3); }
      .b-exp  { background:rgba(220,38,38,.15);   color:#991b1b; border:1px solid rgba(220,38,38,.3); }
      .b-tr   { background:rgba(14,165,233,.15);  color:#0369a1; border:1px solid rgba(14,165,233,.3); }
      .b-cst  { background:rgba(99,102,241,.15);  color:#4338ca; border:1px solid rgba(99,102,241,.3); }
      .b-ok   { background:rgba(16,185,129,.15);  color:#047857; border:1px solid rgba(16,185,129,.3); }
      .b-warn { background:rgba(239,68,68,.15);   color:#b91c1c; border:1px solid rgba(239,68,68,.3); }
      .dh.cst { background:linear-gradient(135deg, #1e1b4b, #312e81); color:#fff; }
      .dh.adv { background:linear-gradient(135deg, #3b0764, #581c87); color:#fff; }
      .dh.clr { background:linear-gradient(135deg, #064e3b, #047857); color:#fff; }

      /* Modal */
      .rdj-modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15,23,42,0.6); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(3px); }
      .rdj-modal-box { background:#fff; border-radius:14px; width:95%; max-width:580px; box-shadow:0 20px 40px rgba(0,0,0,0.25); overflow:hidden; animation:modalPop 0.2s ease-out; }
      @keyframes modalPop { from { transform:scale(0.95); opacity:0; } to { transform:scale(1); opacity:1; } }
      .rdj-modal-header { padding:14px 18px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; }
      .rdj-modal-close { background:none; border:none; font-size:24px; cursor:pointer; color:#64748b; }
      .rdj-modal-body { padding:16px 20px; max-height:65vh; overflow-y:auto; }
      .rdj-modal-footer { padding:12px 20px; background:#f8fafc; border-top:1px solid #e2e8f0; display:flex; justify-content:flex-end; gap:10px; }
      .rep-target-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f1f5f9; gap:12px; }
      .rep-target-row:last-child { border-bottom:none; }
      .rep-target-info { font-weight:800; font-size:.9rem; color:#1e293b; }
      .rep-target-input { width:160px; padding:7px 10px; border:1.5px solid #cbd5e1; border-radius:8px; font-family:monospace; font-weight:bold; font-size:.92rem; text-align:left; direction:ltr; }

      /* ── Mobile Optimizations for Rep Daily Journal ── */
      @media (max-width: 768px) {
        .rdj-title-row {
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 10px !important;
        }
        .rdj-tabs-bar {
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch !important;
          padding-bottom: 6px !important;
          width: 100% !important;
        }
        .rdj-tab-btn {
          padding: 8px 14px !important;
          font-size: 0.82rem !important;
          white-space: nowrap !important;
        }
        .rdj-filters {
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 10px !important;
          padding: 12px 14px !important;
        }
        .rdj-fg {
          min-width: 100% !important;
          width: 100% !important;
        }
        .rdj-fg input, .rdj-fg select {
          min-height: 44px !important;
          font-size: 16px !important;
        }
        .rdj-presets {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 6px !important;
          width: 100% !important;
        }
        .preset-btn {
          width: 100% !important;
          padding: 8px 6px !important;
          font-size: 0.78rem !important;
          text-align: center !important;
        }
        .rdj-actions-group {
          width: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 8px !important;
        }
        .rdj-actions-group #rdj-run {
          width: 100% !important;
          padding: 12px !important;
          font-size: 1rem !important;
          justify-content: center !important;
        }
        .rdj-actions-group #btn-gen-whatsapp {
          width: 100% !important;
          padding: 12px !important;
          font-size: 0.95rem !important;
          justify-content: center !important;
        }
        .rdj-actions-group button:not(#rdj-run):not(#btn-gen-whatsapp) {
          width: 100% !important;
          padding: 9px 12px !important;
          font-size: 0.85rem !important;
          justify-content: center !important;
        }
        .gen-kpis-grid {
          grid-template-columns: 1fr 1fr !important;
          gap: 8px !important;
        }
        .gen-kpi-card {
          padding: 10px 12px !important;
        }
        .gen-kpi-val {
          font-size: 1.15rem !important;
          white-space: nowrap !important;
        }
        .gen-charts-grid {
          grid-template-columns: 1fr !important;
        }
        /* Sticky Rep Name on Mobile Matrix & Daily Details */
        table.matrix-t th:first-child, table.matrix-t td:first-child,
        table.rdj-t th:first-child, table.rdj-t td:first-child {
          position: sticky !important;
          right: 0 !important;
          z-index: 5 !important;
          background: #ffffff !important;
          box-shadow: -2px 0 6px rgba(0,0,0,0.08) !important;
        }
        table.matrix-t thead th:first-child, table.rdj-t thead th:first-child {
          background: #0f172a !important;
          z-index: 10 !important;
        }
        table.matrix-t tfoot td:first-child, table.rdj-t tfoot td:first-child {
          background: #f8fafc !important;
          z-index: 10 !important;
        }
        /* Mobile Modals */
        .rdj-modal-box {
          width: 96vw !important;
          max-width: 96vw !important;
          max-height: 90vh !important;
          border-radius: 16px !important;
        }
        .rdj-modal-body {
          max-height: calc(90vh - 120px) !important;
          padding: 12px 14px !important;
        }
        .rep-target-row {
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 6px !important;
        }
        .rep-target-input {
          width: 100% !important;
          min-height: 44px !important;
          font-size: 16px !important;
        }
      }

      @media (max-width: 380px) {
        .gen-kpis-grid {
          grid-template-columns: 1fr !important;
        }
      }
    </style>
  `;

  // ── 1. تحميل المناديب والصناديق ومراكز التكلفة ودليل الحسابات ──
  const [repsSnap, boxSnap, ccSnap, coaSnap] = await Promise.all([
    getDocs(collection(db, `companies/${COMPANY_ID}/salesReps`)),
    getDocs(collection(db, `companies/${COMPANY_ID}/cashBoxes`)),
    getDocs(collection(db, `companies/${COMPANY_ID}/costCenters`)).catch(() => ({ docs: [] })),
    getDocs(collection(db, `companies/${COMPANY_ID}/chartOfAccounts`)).catch(() => ({ docs: [] }))
  ]);

  _cachedReps = repsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a,b) => (a.name||"").localeCompare(b.name||"","ar"));

  _cachedBoxRepMap = {};
  _cachedBoxAccIdMap = {};
  _cachedBoxAccCodeMap = {};
  _cachedRepBoxNameMap = {};
  _cachedRepCustodyAccMap = {};
  _cachedRepLoanAccMap = {};
  _cachedRepConfigs = {};

  const allBoxes = boxSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const allCoa = coaSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  allBoxes.forEach(data => {
    let rid = data.repId || data.linkedRepId || null;
    const bname = data.name || "";
    if (!rid) {
      const matched = _cachedReps.find(r => {
        const parts = [r.name.trim(), ...r.name.split(/\s+/).filter(p => p.length >= 3)];
        return parts.some(p => bname.includes(p));
      });
      if (matched) rid = matched.id;
    }
    if (rid) {
      _cachedBoxRepMap[data.id] = rid;
      _cachedRepBoxNameMap[rid] = bname;
      if (data.accountId) _cachedBoxAccIdMap[data.accountId] = rid;
      if (data.code) _cachedBoxAccCodeMap[data.code] = rid;
      if (data.accountCode) _cachedBoxAccCodeMap[data.accountCode] = rid;
    }
  });

  _cachedCcRepMap = {};
  ccSnap.docs.forEach(d => {
    const data = d.data();
    const rid = data.repId || data.linkedRepId || null;
    if (rid) _cachedCcRepMap[d.id] = rid;
  });

  // بناء التكوين الشامل لكل مندوب (الصندوق، العهد، السلف، مراكز التكلفة)
  _cachedReps.forEach(r => {
    const rawTokens = [r.name.trim()];
    r.name.split(/\s+/).forEach(part => {
      if (part.length >= 3) rawTokens.push(part);
    });
    if (r.name.includes("عوض")) rawTokens.push("عوض", "محمد عوض");
    if (r.name.includes("مصطفى")) rawTokens.push("مصطفى");
    if (r.name.includes("السيد رضا")) rawTokens.push("السيد رضا", "رضا");
    if (r.name.includes("احمد السيد")) rawTokens.push("احمد السيد", "أحمد السيد");
    if (r.name.includes("عمرو")) rawTokens.push("عمرو", "راجح", "عمرو راجح");
    const tokens = [...new Set(rawTokens)];

    const box = allBoxes.find(b => b.repId === r.id || b.linkedRepId === r.id || tokens.some(t => b.name?.includes(t)));
    const boxId = box ? box.id : null;
    const boxAccCode = box ? (box.accountCode || box.code) : null;
    const boxAccId = box ? box.accountId : null;
    const boxName = box ? box.name : (r.name + " - صندوق");

    const custodyAccCodes = new Set();
    const custodyAccIds = new Set();
    const loanAccCodes = new Set();
    const loanAccIds = new Set();

    allCoa.forEach(a => {
      const code = a.code || "";
      const name = a.name || "";
      const matchesRep = tokens.some(t => name.includes(t));
      if (matchesRep) {
        if (code.startsWith("1-1-2-3") || name.includes("عهدة")) {
          custodyAccCodes.add(code);
          custodyAccIds.add(a.id);
          _cachedRepCustodyAccMap[code] = r.id;
          _cachedRepCustodyAccMap[a.id] = r.id;
        }
        if (code.startsWith("1-1-5-4") || name.includes("سلف")) {
          loanAccCodes.add(code);
          loanAccIds.add(a.id);
          _cachedRepLoanAccMap[code] = r.id;
          _cachedRepLoanAccMap[a.id] = r.id;
        }
      }
    });

    _cachedRepConfigs[r.id] = {
      repId: r.id,
      name: r.name,
      tokens,
      boxId,
      boxAccCode,
      boxAccId,
      boxName,
      custodyAccCodes,
      custodyAccIds,
      loanAccCodes,
      loanAccIds,
      costCenterId: r.costCenterId || (r.name.includes("مصطفى") ? "cc_301" : r.name.includes("عوض") ? "cc_302" : null)
    };
  });

  const repSel = container.querySelector("#rdj-rep");
  _cachedReps.forEach(r => {
    const o = document.createElement("option");
    const isInactive = r.status === "inactive" || r.isActive === false;
    o.value = r.id;
    o.textContent = `${isInactive ? '⚪ ' : '👤 '}${r.name || r.id}${isInactive ? ' (غير نشط)' : ''}`;
    repSel.appendChild(o);
  });

  window.switchRdjTab = (tab) => {
    _currentTab = tab;
    const bGen = document.getElementById("tab-btn-general");
    const bDay = document.getElementById("tab-btn-daily");
    const genBtns = container.querySelectorAll(".gen-only");
    const dayBtns = container.querySelectorAll(".daily-only");

    if (tab === "general") {
      bGen?.classList.add("active");
      bDay?.classList.remove("active");
      genBtns.forEach(b => b.style.display = "inline-flex");
      dayBtns.forEach(b => b.style.display = "none");
    } else {
      bDay?.classList.add("active");
      bGen?.classList.remove("active");
      genBtns.forEach(b => b.style.display = "none");
      dayBtns.forEach(b => b.style.display = "inline-flex");
    }
    runCurrentReport(container);
  };

  window.setRdjPeriod = (type) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const inpFrom = container.querySelector("#rdj-from");
    const inpTo = container.querySelector("#rdj-to");
    if (!inpFrom || !inpTo) return;

    inpTo.value = todayStr;
    const d = new Date();

    if (type === "today") {
      inpFrom.value = todayStr;
    } else if (type === "week") {
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 6 ? 0 : -7);
      const weekStart = new Date(d.setDate(diff)).toISOString().split("T")[0];
      inpFrom.value = weekStart;
    } else if (type === "mtd") {
      inpFrom.value = todayStr.slice(0, 8) + "01";
    } else if (type === "lastMonth") {
      const firstThisMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const lastMonthEnd = new Date(firstThisMonth - 1);
      const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);
      inpFrom.value = lastMonthStart.toISOString().split("T")[0];
      inpTo.value = lastMonthEnd.toISOString().split("T")[0];
    }
    runCurrentReport(container);
  };

  container.querySelector("#rdj-run").addEventListener("click", () => runCurrentReport(container));
  container.querySelector("#rdj-rep")?.addEventListener("change", () => runCurrentReport(container));

  runCurrentReport(container);
}

// ── Helpers ──────────────────────────────────────────────────
const isBank = (m) => {
  const p = (m || "").toLowerCase().trim();
  return p === "bank" || p === "transfer" || p === "تحويل" || p === "network" || p === "شبكة" || p === "شبكه" || p === "مدى" || p === "mada" || p === "card" || p === "pos" || p === "شيك" || p === "cheque";
};
const badge  = (m) => {
  const p = (m || "").toLowerCase().trim();
  if (p === "cash" || p === "نقدي" || p === "نقدى") return `<span class="b b-cash">💵 نقدي</span>`;
  if (p === "bank" || p === "transfer" || p === "تحويل") return `<span class="b b-bank">🏦 تحويل</span>`;
  if (p === "network" || p === "شبكة" || p === "شبكه" || p === "مدى" || p === "mada" || p === "pos" || p === "card") return `<span class="b b-bank">💳 شبكة</span>`;
  if (p === "credit" || p === "آجل" || p === "اجل" || p === "deferred") return `<span class="b b-cr">📑 آجل</span>`;
  if (p === "cheque" || p === "شيك") return `<span class="b b-bank">📄 شيك</span>`;
  return `<span class="b b-cash">${m || "—"}</span>`;
};

// ── Runner Controller ─────────────────────────────────────────
async function runCurrentReport(container) {
  if (_currentTab === "general") {
    await renderGeneralExecutiveReport(container);
  } else {
    await renderDailyJournalReport(container);
  }
}

/**
 * ══════════════════════════════════════════════════════════════
 * TAB 1: التقرير العام ومؤشرات الأداء (Executive Report & Analytics)
 * ══════════════════════════════════════════════════════════════
 */
async function renderGeneralExecutiveReport(container) {
  const repId = container.querySelector("#rdj-rep").value;
  const from  = container.querySelector("#rdj-from").value;
  const to    = container.querySelector("#rdj-to").value;
  if (!from || !to) { alert("يرجى تحديد الفترة من وإلى"); return; }

  const body = container.querySelector("#rdj-body");
  body.innerHTML = `<div class="rdj-loading">⏳ جاري تدقيق فواتير المبيعات، احتساب تكلفة البضاعة المباعة (COGS)، وهوامش أرباح المناديب، والتحصيلات...</div>`;

  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const mtdStart = (to || todayStr).slice(0, 8) + "01";
    // تحديد اليوم المستهدف لحساب مؤشرات "مبيعات وتحصيل اليوم":
    // 1) إذا حدد المستخدم يوماً محدداً (from === to)، فإن اليوم المستهدف هو هذا اليوم المختار حصراً (to)
    // 2) إذا حدد فترة متعددة، فإذا كان اليوم الفعلي todayStr يقع ضمن نطاق [from, to] نستخدمه، وإلا نستخدم تاريخ نهاية الفترة to
    const targetDay = (from === to) ? to : (todayStr >= from && todayStr <= to ? todayStr : to);

    const [invSnap, retSnap, rcptSnap, custSnap, prodSnap] = await Promise.all([
      getDocs(collection(db, `companies/${COMPANY_ID}/salesInvoices`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/salesReturns`)).catch(() => ({ docs: [] })),
      getDocs(collection(db, `companies/${COMPANY_ID}/receipts`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/customers`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/products`)).catch(() => ({ docs: [] }))
    ]);

    const prodMap = {};
    (prodSnap.docs || []).forEach(d => {
      const p = d.data();
      prodMap[d.id] = p;
      if (p.name) prodMap[p.name] = p;
    });

    const getDocExactCost = (docObj) => {
      const lines = docObj.lines || docObj.items || [];
      if (lines.length === 0) return parseFloat(docObj.totalCost || 0);
      let total = 0;
      lines.forEach(l => {
        const qty = parseFloat(l.qty || l.quantity || 1);
        const p = prodMap[l.productId] || prodMap[l.productName] || prodMap[l.name];
        const unitCost = parseFloat(
          l.costPrice !== undefined && l.costPrice > 0 ? l.costPrice :
          l.purchasePrice !== undefined && l.purchasePrice > 0 ? l.purchasePrice :
          l.unitCost !== undefined && l.unitCost > 0 ? l.unitCost :
          (p?.costPrice || p?.purchasePrice || p?.avgCostPrice || p?.lastPurchasePrice || 0)
        );
        total += (qty * unitCost);
      });
      return total;
    };

    const custRepMap  = Object.fromEntries(custSnap.docs.map(d => [d.id, d.data().repId || null]));
    const custNameMap = Object.fromEntries(custSnap.docs.map(d => [d.id, d.data().name || d.data().customerName || d.id]));
    const repMap      = Object.fromEntries(_cachedReps.map(r => [r.id, r.name || r.id]));

    // 1. فواتير المبيعات
    const allInvoices = invSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(i => i.status !== "cancelled");

    // 2. مردودات المبيعات (إشعارات دائنة)
    const allReturns = retSnap.docs.map(d => {
      const data = d.data();
      const rid = data.repId || data.salesRepId || custRepMap[data.customerId] || null;
      return { id: d.id, ...data, _repId: rid };
    }).filter(r => r.status !== "cancelled");

    // 3. سندات القبض (التحصيلات)
    const allReceipts = rcptSnap.docs.map(d => {
      const data = d.data();
      const rid = data.repId
        || _cachedBoxRepMap[data.sourceId]
        || _cachedCcRepMap[data.costCenterId]
        || custRepMap[data.targetId]
        || null;
      return { id: d.id, ...data, _repId: rid };
    }).filter(r => r.entityType === "customer");

    // استبعاد المناديب الذين تركوا العمل بداية من تاريخ محدد (مثل المندوب أحمد السيد من 10/10/2026)
    let repList = repId ? _cachedReps.filter(r => r.id === repId) : _cachedReps;
    repList = repList.filter(r => {
      const isAhmed = (r.id === "61pG3jXw8Ps7HCJc9ljI" || (r.name && r.name.includes("احمد السيد")));
      if (isAhmed && (from >= "2026-10-10" || to >= "2026-10-10")) {
        return false;
      }
      if (r.resignedDate && from >= r.resignedDate) {
        return false;
      }
      if (r.status === "inactive" || r.isActive === false) {
        const hasInv = allInvoices.some(i => i.repId === r.id && i.date >= from && i.date <= to);
        const hasRc  = allReceipts.some(rc => rc._repId === r.id && rc.date >= from && rc.date <= to);
        if (!hasInv && !hasRc) return false;
      }
      return true;
    });

    // ── تجميع المؤشرات لكل مندوب ──
    const repDataList = repList.map(rep => {
      const rid = rep.id;

      // أ) مبيعات اليوم (شامل ومردودات وصافي) لليوم المستهدف
      const repInvoicesToday = allInvoices.filter(i => i.repId === rid && i.date === targetDay);
      let todayGrossSales = 0, todayGrossSubtotal = 0;
      repInvoicesToday.forEach(i => {
        const tot = parseFloat(i.totalWithVat || i.total || 0);
        const sub = parseFloat(i.subtotal || i.subTotal || (tot / 1.15) || 0);
        todayGrossSales += tot; todayGrossSubtotal += sub;
      });

      const repReturnsToday = allReturns.filter(r => r._repId === rid && r.date === targetDay);
      let todayReturnSales = 0, todayReturnSubtotal = 0;
      repReturnsToday.forEach(r => {
        const tot = parseFloat(r.totalWithVat || r.total || 0);
        const sub = parseFloat(r.subtotal || r.subTotal || (tot / 1.15) || 0);
        todayReturnSales += tot; todayReturnSubtotal += sub;
      });

      const todaySales    = todayGrossSales - todayReturnSales;
      const todaySubtotal = todayGrossSubtotal - todayReturnSubtotal;

      // ب) تحصيل اليوم (نقد + شبكة في اليوم المستهدف)
      const repRcptsToday = allReceipts.filter(r => r._repId === rid && r.date === targetDay);
      let todayCashCol = 0, todayBankCol = 0;
      repRcptsToday.forEach(rc => {
        const a = parseFloat(rc.amount || 0);
        if (isBank(rc.method || rc.paymentMethod)) todayBankCol += a; else todayCashCol += a;
      });
      const todayCol = todayCashCol + todayBankCol;

      // ج) مبيعات الفترة المحددة (شامل ومردودات وصافي)
      const repInvoicesPeriod = allInvoices.filter(i => i.repId === rid && i.date >= from && i.date <= to);
      let periodGrossSales = 0, periodGrossSubtotal = 0;
      repInvoicesPeriod.forEach(i => {
        const tot = parseFloat(i.totalWithVat || i.total || 0);
        const sub = parseFloat(i.subtotal || i.subTotal || (tot / 1.15) || 0);
        periodGrossSales += tot; periodGrossSubtotal += sub;
      });

      const repReturnsPeriod = allReturns.filter(r => r._repId === rid && r.date >= from && r.date <= to);
      let periodReturnSales = 0, periodReturnSubtotal = 0;
      repReturnsPeriod.forEach(r => {
        const tot = parseFloat(r.totalWithVat || r.total || 0);
        const sub = parseFloat(r.subtotal || r.subTotal || (tot / 1.15) || 0);
        periodReturnSales += tot; periodReturnSubtotal += sub;
      });

      const periodSales    = periodGrossSales - periodReturnSales;
      const periodSubtotal = periodGrossSubtotal - periodReturnSubtotal;
      const invoiceCount   = repInvoicesPeriod.length;
      const returnCount    = repReturnsPeriod.length;
      const avgInvoice     = invoiceCount > 0 ? (periodGrossSales / invoiceCount) : 0;

      // د) مبيعات الشهر التراكمية MTD (شامل ومردودات وصافي)
      const repInvoicesMtd = allInvoices.filter(i => i.repId === rid && i.date >= mtdStart && i.date <= to);
      let mtdGrossSales = 0, mtdGrossSubtotal = 0;
      repInvoicesMtd.forEach(i => {
        const tot = parseFloat(i.totalWithVat || i.total || 0);
        const sub = parseFloat(i.subtotal || i.subTotal || (tot / 1.15) || 0);
        mtdGrossSales += tot; mtdGrossSubtotal += sub;
      });

      const repReturnsMtd = allReturns.filter(r => r._repId === rid && r.date >= mtdStart && r.date <= to);
      let mtdReturnSales = 0, mtdReturnSubtotal = 0;
      repReturnsMtd.forEach(r => {
        const tot = parseFloat(r.totalWithVat || r.total || 0);
        const sub = parseFloat(r.subtotal || r.subTotal || (tot / 1.15) || 0);
        mtdReturnSales += tot; mtdReturnSubtotal += sub;
      });

      const mtdSales    = mtdGrossSales - mtdReturnSales;
      const mtdSubtotal = mtdGrossSubtotal - mtdReturnSubtotal;

      // هـ) الهدف البيعي والتارجت (محسوب على صافي مبيعات الشهر)
      const monthlyTarget = parseFloat(rep.monthlyTarget || 0);
      const targetPct = monthlyTarget > 0 ? (mtdSales / monthlyTarget) * 100 : 0;

      // و) التحصيلات للفترة كاملة وعمولة التحصيل
      const repRcptsPeriod = allReceipts.filter(r => r._repId === rid && r.date >= from && r.date <= to);
      let cashCol = 0, bankCol = 0;
      repRcptsPeriod.forEach(rc => {
        const a = parseFloat(rc.amount || 0);
        if (isBank(rc.method || rc.paymentMethod)) bankCol += a; else cashCol += a;
      });
      const totalCol = cashCol + bankCol;
      const collectionRate = periodSales > 0 ? (totalCol / periodSales) * 100 : (totalCol > 0 ? 100 : 0);

      // تفاصيل فواتير ومردودات المندوب لغايات التدقيق
      const repInvoicesDetails = repInvoicesPeriod.map(i => {
        const gross = parseFloat(i.totalWithVat || i.total || 0);
        const sub = parseFloat(i.subtotal !== undefined ? i.subtotal : (gross / 1.15) || 0);
        const cost = getDocExactCost(i);
        const profit = sub - cost;
        const marginPct = sub > 0 ? (profit / sub * 100) : 0;
        return {
          type: "invoice",
          id: i.id,
          number: i.invoiceNumber || i.number || i.id,
          date: i.date,
          customerName: i.customerName || custNameMap[i.customerId] || "عميل",
          gross,
          sub,
          cost,
          profit,
          marginPct
        };
      });

      const repReturnsDetails = repReturnsPeriod.map(r => {
        const gross = parseFloat(r.totalWithVat || r.total || 0);
        const sub = parseFloat(r.subtotal !== undefined ? r.subtotal : (gross / 1.15) || 0);
        const cost = getDocExactCost(r);
        const profit = sub - cost;
        const marginPct = sub > 0 ? (profit / sub * 100) : 0;
        return {
          type: "return",
          id: r.id,
          number: r.returnNumber || r.number || r.id,
          date: r.date,
          customerName: r.customerName || custNameMap[r.customerId] || "عميل",
          gross: -gross,
          sub: -sub,
          cost: -cost,
          profit: -profit,
          marginPct
        };
      });

      const invoicesDetails = [...repInvoicesDetails, ...repReturnsDetails];

      // حساب تكلفة البضاعة المباعة (COGS) ومجمل الربح للفترة
      let periodGrossCogs = 0;
      repInvoicesPeriod.forEach(i => {
        periodGrossCogs += getDocExactCost(i);
      });

      let periodReturnCogs = 0;
      repReturnsPeriod.forEach(r => {
        periodReturnCogs += getDocExactCost(r);
      });

      const periodNetCogs = periodGrossCogs - periodReturnCogs;
      const periodProfit  = periodSubtotal - periodNetCogs;
      const periodMarginPct = periodSubtotal > 0 ? (periodProfit / periodSubtotal * 100) : 0;

      return {
        id: rid,
        name: rep.name || "مندوب",
        code: rep.code || rid.slice(-4),
        todayGrossSales, todayGrossSubtotal, todayReturnSales, todayReturnSubtotal,
        todaySales, todaySubtotal,
        todayCashCol, todayBankCol, todayCol,
        periodGrossSales, periodGrossSubtotal, periodReturnSales, periodReturnSubtotal,
        periodSales, periodSubtotal,
        invoiceCount, returnCount, avgInvoice,
        periodGrossCogs, periodReturnCogs, periodNetCogs,
        periodProfit, periodMarginPct,
        invoicesDetails,
        mtdGrossSales, mtdGrossSubtotal, mtdReturnSales, mtdReturnSubtotal,
        mtdSales, mtdSubtotal,
        monthlyTarget, targetPct,
        cashCol, bankCol, totalCol,
        collectionRate
      };
    });

    // ترتيب المناديب حسب أعلى صافي مبيعات في الفترة
    repDataList.sort((a, b) => b.periodSales - a.periodSales);

    // حساب الإجماليات العامة للشركة
    const grand = repDataList.reduce((acc, r) => {
      acc.todayGrossSales     += r.todayGrossSales;
      acc.todayGrossSubtotal  += r.todayGrossSubtotal;
      acc.todayReturnSales    += r.todayReturnSales;
      acc.todayReturnSubtotal += r.todayReturnSubtotal;
      acc.todaySales          += r.todaySales;
      acc.todaySubtotal       += r.todaySubtotal;
      acc.todayCashCol        += r.todayCashCol;
      acc.todayBankCol        += r.todayBankCol;
      acc.todayCol            += r.todayCol;

      acc.periodGrossSales    += r.periodGrossSales;
      acc.periodGrossSubtotal += r.periodGrossSubtotal;
      acc.periodReturnSales   += r.periodReturnSales;
      acc.periodReturnSubtotal+= r.periodReturnSubtotal;
      acc.periodSales         += r.periodSales;
      acc.periodSubtotal      += r.periodSubtotal;
      acc.invoiceCount        += r.invoiceCount;
      acc.returnCount         += r.returnCount;

      acc.periodGrossCogs     += r.periodGrossCogs;
      acc.periodReturnCogs    += r.periodReturnCogs;
      acc.periodNetCogs       += r.periodNetCogs;
      acc.periodProfit        += r.periodProfit;

      acc.mtdGrossSales       += r.mtdGrossSales;
      acc.mtdGrossSubtotal    += r.mtdGrossSubtotal;
      acc.mtdReturnSales      += r.mtdReturnSales;
      acc.mtdReturnSubtotal   += r.mtdReturnSubtotal;
      acc.mtdSales            += r.mtdSales;
      acc.mtdSubtotal         += r.mtdSubtotal;

      acc.monthlyTarget       += r.monthlyTarget;
      acc.cashCol             += r.cashCol;
      acc.bankCol             += r.bankCol;
      acc.totalCol            += r.totalCol;
      return acc;
    }, {
      todayGrossSales: 0, todayGrossSubtotal: 0, todayReturnSales: 0, todayReturnSubtotal: 0,
      todaySales: 0, todaySubtotal: 0, todayCashCol: 0, todayBankCol: 0, todayCol: 0,
      periodGrossSales: 0, periodGrossSubtotal: 0, periodReturnSales: 0, periodReturnSubtotal: 0,
      periodSales: 0, periodSubtotal: 0, invoiceCount: 0, returnCount: 0,
      periodGrossCogs: 0, periodReturnCogs: 0, periodNetCogs: 0, periodProfit: 0,
      mtdGrossSales: 0, mtdGrossSubtotal: 0, mtdReturnSales: 0, mtdReturnSubtotal: 0,
      mtdSales: 0, mtdSubtotal: 0, monthlyTarget: 0, cashCol: 0, bankCol: 0, totalCol: 0
    });

    grand.avgInvoice      = grand.invoiceCount > 0 ? (grand.periodGrossSales / grand.invoiceCount) : 0;
    grand.targetPct       = grand.monthlyTarget > 0 ? (grand.mtdSales / grand.monthlyTarget) * 100 : 0;
    grand.collectionRate  = grand.periodSales > 0 ? (grand.totalCol / grand.periodSales) * 100 : (grand.totalCol > 0 ? 100 : 0);
    grand.periodMarginPct = grand.periodSubtotal > 0 ? (grand.periodProfit / grand.periodSubtotal * 100) : 0;

    _currentGenData = {
      from, to, mtdStart, todayStr,
      reps: repDataList,
      grand,
      repLabel: repId ? (repMap[repId] || repId) : "جميع المناديب"
    };

    // ── بناء أسطر جدول المناديب للشاشة ──
    let matrixRows = "";
    repDataList.forEach((r, idx) => {
      const isTop = idx === 0 && r.periodSales > 0;
      const tColor = r.targetPct >= 100 ? "#10b981" : r.targetPct >= 80 ? "#2563eb" : r.targetPct >= 50 ? "#f59e0b" : "#ef4444";
      const cColor = r.collectionRate >= 90 ? "#10b981" : r.collectionRate >= 70 ? "#2563eb" : "#f59e0b";

      matrixRows += `
        <tr>
          <td style="font-weight:bold; color:#64748b;">${idx + 1}</td>
          <td class="r-align">
            ${isTop ? '🏆 ' : '👤 '}<strong>${r.name}</strong>
            ${isTop ? '<span style="font-size:10px; background:#fef08a; color:#854d0e; padding:1px 6px; border-radius:4px; margin-right:4px;">المتصدر</span>' : ''}
          </td>
          
          <!-- مبيعات اليوم شامل وقبل الضريبة -->
          <td style="background:rgba(2,132,199,0.03);">
            <div class="cell-main-val" style="color:#0284c7;">${formatCurrency(r.todaySales)}</div>
            <span class="cell-sub-vat sub-vat-blue">قبل: ${formatCurrency(r.todaySubtotal)}</span>
            ${r.todayReturnSales > 0 ? `<span style="font-size:9.5px; color:#dc2626; font-weight:800; display:block;">(مردود: -${formatCurrency(r.todayReturnSales)})</span>` : ''}
          </td>

          <!-- تحصيل اليوم بجانب مبيعات اليوم مباشرة -->
          <td style="background:rgba(245,158,11,0.04);">
            <div class="cell-main-val" style="color:#d97706;">${formatCurrency(r.todayCol)}</div>
            ${r.todayCol > 0 ? `<span style="font-size:10px; color:#64748b; font-family:monospace; display:block;">نقد: ${formatCurrency(r.todayCashCol)} • شبكة: ${formatCurrency(r.todayBankCol)}</span>` : '<span style="font-size:10px; color:#94a3b8;">—</span>'}
          </td>

          <!-- صافي مبيعات الفترة شامل وقبل الضريبة -->
          <td style="background:rgba(5,150,105,0.03);">
            <div class="cell-main-val" style="color:#059669; font-size:.98rem;">${formatCurrency(r.periodSales)}</div>
            <span class="cell-sub-vat sub-vat-green">قبل: ${formatCurrency(r.periodSubtotal)}</span>
            ${r.periodReturnSales > 0 ? `<span style="font-size:9.5px; color:#dc2626; font-weight:800; display:block; margin-top:2px;">(مردود: -${formatCurrency(r.periodReturnSales)})</span>` : ''}
          </td>

          <td class="mono font-bold">${r.invoiceCount}${r.returnCount > 0 ? ` <span style="font-size:10px; color:#dc2626;" title="${r.returnCount} إشعار دائن/مردود">(-${r.returnCount})</span>` : ''}</td>
          <td class="mono" style="color:#64748b;">${formatCurrency(r.avgInvoice)}</td>
          <td class="mono font-bold" style="color:#d97706;">${formatCurrency(r.cashCol)}</td>
          <td class="mono font-bold" style="color:#2563eb;">${formatCurrency(r.bankCol)}</td>
          <td class="mono font-bold" style="color:#1e3a8a; font-size:.94rem;">${formatCurrency(r.totalCol)}</td>

          <!-- مجمل الربح وهامش الربح للفترة مع بيان التكلفة وزر التدقيق -->
          <td style="background:rgba(16,185,129,0.06); cursor:pointer;" 
              onclick="window.showRepProfitAuditModal('${r.id}')"
              title="المعادلة: المبيعات قبل الضريبة (${formatCurrency(r.periodSubtotal)}) - التكلفة (${formatCurrency(r.periodNetCogs)}) = مجمل الربح (${formatCurrency(r.periodProfit)})&#10;انقر هنا لفحص وتدقيق الفواتير بالتفصيل">
            <div class="cell-main-val" style="color:#047857; font-size:.98rem; font-weight:900;">${formatCurrency(r.periodProfit)}</div>
            <div style="font-size:10px; color:#475569; font-family:monospace; font-weight:700; margin:1px 0;">تكلفة: ${formatCurrency(r.periodNetCogs)}</div>
            <div style="font-size:10.5px; color:${r.periodProfit >= 0 ? '#059669' : '#dc2626'}; font-weight:800;">
              (${r.periodMarginPct.toFixed(1)}%) <span style="font-size:9.5px; color:#2563eb; text-decoration:underline;">🔍 فحص</span>
            </div>
          </td>

          <!-- مبيعات الشهر MTD شامل وقبل الضريبة -->
          <td style="background:rgba(79,70,229,0.03);">
            <div class="cell-main-val" style="color:#4338ca;">${formatCurrency(r.mtdSales)}</div>
            <span class="cell-sub-vat sub-vat-purple">قبل: ${formatCurrency(r.mtdSubtotal)}</span>
            ${r.mtdReturnSales > 0 ? `<span style="font-size:9.5px; color:#dc2626; font-weight:800; display:block;">(مردود: -${formatCurrency(r.mtdReturnSales)})</span>` : ''}
          </td>

          <td class="mono">${r.monthlyTarget > 0 ? formatCurrency(r.monthlyTarget) : '<span style="color:#94a3b8">غير محدد</span>'}</td>
          <td>
            <div style="display:flex; align-items:center; justify-content:center; gap:6px;">
              <div class="target-prog-wrap">
                <div class="target-prog-track">
                  <div class="target-prog-fill" style="width:${Math.min(r.targetPct, 100)}%; background:${tColor};"></div>
                </div>
              </div>
              <span class="mono font-bold" style="color:${tColor}; font-size:.82rem;">${r.targetPct.toFixed(1)}%</span>
            </div>
          </td>
          <td>
            <span class="mono font-bold" style="color:${cColor};">${r.collectionRate.toFixed(1)}%</span>
          </td>
        </tr>
      `;
    });

    body.innerHTML = `
      <!-- ═══ 1. بطاقات المؤشرات التنفيذية للشركة ═══ -->
      <div class="gen-kpis-grid">
        <!-- كرت مبيعات اليوم مع قبل الضريبة -->
        <div class="gen-kpi-card cyan">
          <div class="gen-kpi-top">
            <span class="gen-kpi-title">${from === to ? `صافي مبيعات يوم (${formatDate(to)})` : 'صافي مبيعات اليوم'}</span>
            <span class="gen-kpi-icon">⚡</span>
          </div>
          <div class="gen-kpi-val" style="color:#0891b2;">${formatCurrency(grand.todaySales)}</div>
          <div class="gen-kpi-before-vat" style="color:#0284c7;">قبل الضريبة: ${formatCurrency(grand.todaySubtotal)}</div>
          <div class="gen-kpi-sub">تاريخ: ${targetDay}${grand.todayReturnSales > 0 ? ` • مردود: -${formatCurrency(grand.todayReturnSales)}` : ''}</div>
        </div>

        <!-- كرت تحصيل اليوم -->
        <div class="gen-kpi-card amber">
          <div class="gen-kpi-top">
            <span class="gen-kpi-title">${from === to ? `تحصيل يوم (${formatDate(to)})` : 'تحصيل اليوم'}</span>
            <span class="gen-kpi-icon">💵</span>
          </div>
          <div class="gen-kpi-val" style="color:#d97706;">${formatCurrency(grand.todayCol)}</div>
          <div class="gen-kpi-before-vat" style="color:#b45309;">نقد: ${formatCurrency(grand.todayCashCol)} • شبكة: ${formatCurrency(grand.todayBankCol)}</div>
          <div class="gen-kpi-sub">متحصلات تاريخ: ${targetDay}</div>
        </div>

        <!-- كرت مبيعات الفترة مع قبل الضريبة -->
        <div class="gen-kpi-card green">
          <div class="gen-kpi-top">
            <span class="gen-kpi-title">صافي مبيعات الفترة (بعد المردود)</span>
            <span class="gen-kpi-icon">📈</span>
          </div>
          <div class="gen-kpi-val" style="color:#059669;">${formatCurrency(grand.periodSales)}</div>
          <div class="gen-kpi-before-vat" style="color:#047857;">قبل الضريبة: ${formatCurrency(grand.periodSubtotal)}</div>
          <div class="gen-kpi-sub">${grand.invoiceCount} فاتورة${grand.periodReturnSales > 0 ? ` • مردودات: -${formatCurrency(grand.periodReturnSales)}` : ''}</div>
        </div>

        <!-- كرت إجمالي تحصيلات ومجمل أرباح الفترة -->
        <div class="gen-kpi-card blue">
          <div class="gen-kpi-top">
            <span class="gen-kpi-title">إجمالي التحصيلات والربحية</span>
            <span class="gen-kpi-icon">💳</span>
          </div>
          <div class="gen-kpi-val" style="color:#2563eb;">${formatCurrency(grand.totalCol)}</div>
          <div class="gen-kpi-before-vat" style="color:#047857;">📈 مجمل أرباح الفترة: ${formatCurrency(grand.periodProfit)} (${grand.periodMarginPct.toFixed(1)}%)</div>
          <div class="gen-kpi-sub">نقد: ${formatCurrency(grand.cashCol)} • شبكة: ${formatCurrency(grand.bankCol)}</div>
        </div>

        <!-- كرت مبيعات الشهر MTD مع قبل الضريبة -->
        <div class="gen-kpi-card purple">
          <div class="gen-kpi-top">
            <span class="gen-kpi-title">مبيعات الشهر حتى اليوم (MTD)</span>
            <span class="gen-kpi-icon">🗓️</span>
          </div>
          <div class="gen-kpi-val" style="color:#7c3aed;">${formatCurrency(grand.mtdSales)}</div>
          <div class="gen-kpi-before-vat" style="color:#6366f1;">قبل الضريبة: ${formatCurrency(grand.mtdSubtotal)}</div>
          <div class="gen-kpi-sub">من تاريخ ${mtdStart}${grand.mtdReturnSales > 0 ? ` • مردود: -${formatCurrency(grand.mtdReturnSales)}` : ''}</div>
        </div>

        <!-- كرت تحقيق المستهدف العام -->
        <div class="gen-kpi-card emerald">
          <div class="gen-kpi-top">
            <span class="gen-kpi-title">تحقيق المستهدف العام (Target)</span>
            <span class="gen-kpi-icon">🎯</span>
          </div>
          <div class="gen-kpi-val" style="color:#059669;">${grand.targetPct.toFixed(1)}%</div>
          <div class="gen-kpi-sub">الهدف: ${formatCurrency(grand.monthlyTarget)} • كفاءة: ${grand.collectionRate.toFixed(1)}%</div>
        </div>
      </div>

      <!-- ═══ 2. الرسوم البيانية المعبرة ═══ -->
      <div class="gen-charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">📊 مقارنة مبيعات الشهر (MTD) بالمستهدف الشهري (Target)</span>
            <span style="font-size:.78rem; color:#64748b; font-weight:700;">لكل مندوب</span>
          </div>
          <div class="chart-canvas-wrap">
            <canvas id="rdj-gen-chart-target"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">🥧 الحصة البيعية للمناديب (Market Share)</span>
            <span style="font-size:.78rem; color:#64748b; font-weight:700;">نسبة المساهمة</span>
          </div>
          <div class="chart-canvas-wrap">
            <canvas id="rdj-gen-chart-share"></canvas>
          </div>
        </div>
      </div>

      <!-- ═══ 3. جدول مصفوفة أداء المناديب الشامل ═══ -->
      <div class="matrix-tw">
        <table class="matrix-t">
          <thead>
            <tr>
              <th style="width:35px;">#</th>
              <th class="r-align" style="min-width:140px;">👤 المندوب</th>
              <th>⚡ ${from === to ? `مبيعات (${formatDate(to)})` : 'مبيعات اليوم'}</th>
              <th>💵 ${from === to ? `تحصيل (${formatDate(to)})` : 'تحصيل اليوم'}</th>
              <th>📈 صافي مبيعات الفترة</th>
              <th>🧾 الفواتير</th>
              <th>📊 متوسط الفاتورة</th>
              <th>💵 تحصيل نقدي (الفترة)</th>
              <th>🏦 تحصيل شبكة/بنك</th>
              <th>💰 إجمالي التحصيل</th>
              <th style="background:linear-gradient(135deg, #065f46, #047857); color:#fef08a;">📈 مجمل الربح (الهامش %)</th>
              <th>🗓️ مبيعات الشهر MTD</th>
              <th>🎯 الهدف الشهري</th>
              <th style="min-width:130px;">🏁 نسبة التارجت %</th>
              <th>⚖️ نسبة التحصيل %</th>
            </tr>
          </thead>
          <tbody>${matrixRows}</tbody>
          <tfoot>
            <tr>
              <td>Σ</td>
              <td class="r-align" style="font-size:.9rem; color:#1e3a8a;">الإجمالي العام للشركة</td>
              
              <!-- مبيعات اليوم إجمالي الشركة شامل وقبل الضريبة -->
              <td style="background:rgba(2,132,199,0.04);">
                <div class="cell-main-val" style="color:#0284c7;">${formatCurrency(grand.todaySales)}</div>
                <span class="cell-sub-vat sub-vat-blue">قبل: ${formatCurrency(grand.todaySubtotal)}</span>
                ${grand.todayReturnSales > 0 ? `<span style="font-size:9.5px; color:#dc2626; font-weight:800; display:block;">(مردود: -${formatCurrency(grand.todayReturnSales)})</span>` : ''}
              </td>

              <!-- تحصيل اليوم إجمالي الشركة -->
              <td style="background:rgba(245,158,11,0.04);">
                <div class="cell-main-val" style="color:#d97706;">${formatCurrency(grand.todayCol)}</div>
                ${grand.todayCol > 0 ? `<span style="font-size:10px; color:#64748b; font-family:monospace; display:block;">نقد: ${formatCurrency(grand.todayCashCol)} • شبكة: ${formatCurrency(grand.todayBankCol)}</span>` : ''}
              </td>

              <!-- مبيعات الفترة إجمالي الشركة شامل وقبل الضريبة -->
              <td style="background:rgba(5,150,105,0.04);">
                <div class="cell-main-val" style="color:#059669; font-size:1.02rem;">${formatCurrency(grand.periodSales)}</div>
                <span class="cell-sub-vat sub-vat-green">قبل: ${formatCurrency(grand.periodSubtotal)}</span>
                ${grand.periodReturnSales > 0 ? `<span style="font-size:9.5px; color:#dc2626; font-weight:800; display:block;">(مردود: -${formatCurrency(grand.periodReturnSales)})</span>` : ''}
              </td>

              <td class="mono">${grand.invoiceCount}${grand.returnCount > 0 ? ` (-${grand.returnCount})` : ''}</td>
              <td class="mono">${formatCurrency(grand.avgInvoice)}</td>
              <td class="mono" style="color:#d97706;">${formatCurrency(grand.cashCol)}</td>
              <td class="mono" style="color:#2563eb;">${formatCurrency(grand.bankCol)}</td>
              <td class="mono" style="color:#1e3a8a; font-size:.98rem;">${formatCurrency(grand.totalCol)}</td>

              <!-- إجمالي مجمل الربح للشركة مع بيان التكلفة وزر التدقيق -->
              <td style="background:rgba(16,185,129,0.09); cursor:pointer;"
                  onclick="window.showRepProfitAuditModal('all')"
                  title="المعادلة: إجمالي المبيعات قبل الضريبة (${formatCurrency(grand.periodSubtotal)}) - إجمالي التكلفة (${formatCurrency(grand.periodNetCogs)}) = مجمل الربح (${formatCurrency(grand.periodProfit)})&#10;انقر هنا لفحص وتدقيق فواتير وتكاليف الشركة بالكامل">
                <div class="cell-main-val" style="color:#047857; font-size:1.05rem; font-weight:900;">${formatCurrency(grand.periodProfit)}</div>
                <div style="font-size:10.5px; color:#334155; font-family:monospace; font-weight:800; margin:1px 0;">تكلفة: ${formatCurrency(grand.periodNetCogs)}</div>
                <div style="font-size:11px; color:${grand.periodProfit >= 0 ? '#059669' : '#dc2626'}; font-weight:800;">
                  (${grand.periodMarginPct.toFixed(1)}%) <span style="font-size:9.5px; color:#2563eb; text-decoration:underline;">🔍 فحص الكل</span>
                </div>
              </td>

              <!-- مبيعات الشهر MTD إجمالي الشركة شامل وقبل الضريبة -->
              <td style="background:rgba(79,70,229,0.04);">
                <div class="cell-main-val" style="color:#4338ca;">${formatCurrency(grand.mtdSales)}</div>
                <span class="cell-sub-vat sub-vat-purple">قبل: ${formatCurrency(grand.mtdSubtotal)}</span>
                ${grand.mtdReturnSales > 0 ? `<span style="font-size:9.5px; color:#dc2626; font-weight:800; display:block;">(مردود: -${formatCurrency(grand.mtdReturnSales)})</span>` : ''}
              </td>

              <td class="mono">${formatCurrency(grand.monthlyTarget)}</td>
              <td class="mono" style="color:#1e3a8a; font-size:.95rem;">${grand.targetPct.toFixed(1)}%</td>
              <td class="mono" style="color:#047857;">${grand.collectionRate.toFixed(1)}%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;

    renderGenCharts(repDataList);

  } catch (err) {
    body.innerHTML = `<div class="rdj-empty" style="color:#ef4444">❌ خطأ في تحميل التقرير العام: ${err.message}</div>`;
    console.error("[GeneralExecutiveReport]", err);
  }
}

// ── رسم المخططات البيانية ──
function renderGenCharts(reps) {
  if (typeof window.Chart === "undefined") {
    console.warn("Chart.js not loaded, skipping charts");
    return;
  }

  if (_genCharts.target) try { _genCharts.target.destroy(); } catch(e){}
  if (_genCharts.share) try { _genCharts.share.destroy(); } catch(e){}

  const names = reps.map(r => r.name);
  const mtdSales = reps.map(r => r.mtdSales);
  const targets = reps.map(r => r.monthlyTarget);
  const periodSales = reps.map(r => r.periodSales);

  const ctx1 = document.getElementById("rdj-gen-chart-target");
  if (ctx1) {
    _genCharts.target = new window.Chart(ctx1, {
      type: "bar",
      data: {
        labels: names,
        datasets: [
          {
            label: "مبيعات الشهر MTD (ر.س)",
            data: mtdSales,
            backgroundColor: "rgba(37, 99, 235, 0.85)",
            borderColor: "#1d4ed8",
            borderWidth: 1.5,
            borderRadius: 6
          },
          {
            label: "الهدف الشهري Target (ر.س)",
            data: targets,
            backgroundColor: "rgba(245, 158, 11, 0.75)",
            borderColor: "#d97706",
            borderWidth: 1.5,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", rtl: true, labels: { font: { family: "Cairo" } } }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  const ctx2 = document.getElementById("rdj-gen-chart-share");
  if (ctx2) {
    const palette = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];
    _genCharts.share = new window.Chart(ctx2, {
      type: "doughnut",
      data: {
        labels: names,
        datasets: [{
          data: periodSales,
          backgroundColor: palette.slice(0, names.length),
          borderWidth: 2,
          borderColor: "#fff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", rtl: true, labels: { font: { family: "Cairo" } } }
        },
        cutout: "60%"
      }
    });
  }
}

/**
 * ══════════════════════════════════════════════════════════════
 * TAB 2: يومية المندوب وحركة الصندوق (Daily Journal & Cashbox)
 * ══════════════════════════════════════════════════════════════
 */
async function renderDailyJournalReport(container) {
  const repId = container.querySelector("#rdj-rep").value;
  const from  = container.querySelector("#rdj-from").value;
  const to    = container.querySelector("#rdj-to").value;
  if (!from || !to) { alert("يرجى تحديد الفترة من وإلى"); return; }

  const body = container.querySelector("#rdj-body");
  body.innerHTML = `<div class="rdj-loading">⏳ جاري جلب وتحليل الحركات اليومية وسندات الصرف والسلف والمردودات...</div>`;

  try {
    const [invSnap, retSnap, rcptSnap, expSnap, jeSnap, custSnap] = await Promise.all([
      getDocs(collection(db, `companies/${COMPANY_ID}/salesInvoices`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/salesReturns`)).catch(() => ({ docs: [] })),
      getDocs(collection(db, `companies/${COMPANY_ID}/receipts`)),
      getDocs(collection(db, `companies/${COMPANY_ID}/expenses`)).catch(() => ({ docs: [] })),
      getDocs(collection(db, `companies/${COMPANY_ID}/journalEntries`)).catch(() => ({ docs: [] })),
      getDocs(collection(db, `companies/${COMPANY_ID}/customers`))
    ]);

    const custMap    = Object.fromEntries(custSnap.docs.map(d => [d.id, d.data().name || "عميل"]));
    const custRepMap = Object.fromEntries(custSnap.docs.map(d => [d.id, d.data().repId || null]));
    const repMap     = Object.fromEntries(_cachedReps.map(r => [r.id, r.name || r.id]));
    const repIdSet   = repId ? new Set([repId]) : new Set(_cachedReps.map(r => r.id));

    // 1. الفواتير
    const invoices = invSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(i => i.status !== "cancelled" && i.date >= from && i.date <= to);

    // 2. مردودات المبيعات
    const returns = retSnap.docs.map(d => {
      const data = d.data();
      const rid = data.repId || data.salesRepId || custRepMap[data.customerId] || null;
      return { id: d.id, ...data, _repId: rid };
    }).filter(r => r.status !== "cancelled" && r.date >= from && r.date <= to);

    // 3. التحصيلات
    const receipts = rcptSnap.docs.map(d => {
      const data = d.data();
      const rid = data.repId
        || _cachedBoxRepMap[data.sourceId]
        || _cachedCcRepMap[data.costCenterId]
        || custRepMap[data.targetId]
        || null;
      return { id: d.id, ...data, _repId: rid };
    }).filter(r => r.date >= from && r.date <= to && r.entityType === "customer");

    // 4. المصروفات وسندات الصرف
    const expensesList = expSnap.docs.map(d => {
      const data = d.data();
      let rid = data.repId
        || _cachedBoxRepMap[data.sourceId]
        || _cachedCcRepMap[data.costCenterId]
        || null;
      if (!rid && data.sourceName) {
        if (data.sourceName.includes("مصطفى")) rid = _cachedReps.find(r => r.name?.includes("مصطفى"))?.id || null;
        else if (data.sourceName.includes("السيد رضا")) rid = _cachedReps.find(r => r.name?.includes("السيد رضا"))?.id || null;
        else if (data.sourceName.includes("محمد عوض")) rid = _cachedReps.find(r => r.name?.includes("محمد عوض"))?.id || null;
        else if (data.sourceName.includes("احمد السيد")) rid = _cachedReps.find(r => r.name?.includes("احمد السيد"))?.id || null;
      }
      return { id: d.id, ...data, _repId: rid, _isExpenseDoc: true };
    }).filter(e => e.date >= from && e.date <= to);

    // 5. القيود اليومية (سلف المناديب، مصاريف الصيانة والزيوت، التوريدات)
    const journalCashOut = [];
    const loadedExpenseCodes = new Set();
    expensesList.forEach(e => {
      if (e.code) loadedExpenseCodes.add(e.code.replace("#", "").toUpperCase().trim());
      if (e.id) {
        loadedExpenseCodes.add(e.id.slice(0, 6).toUpperCase());
        loadedExpenseCodes.add(e.id.slice(-6).toUpperCase());
        loadedExpenseCodes.add(e.id.toUpperCase());
      }
    });

    jeSnap.docs.forEach(d => {
      const data = d.data();
      const jDate = data.date;
      if (!jDate || jDate < from || jDate > to) return;
      const desc = data.description || data.desc || "";

      // استبعاد القيود الآلية الناتجة عن موديولات أخرى لعدم تكرار الاحتساب
      if (
        desc.startsWith("مبيعات") ||
        desc.startsWith("تكلفة بضاعة") ||
        desc.startsWith("تكلفة البضاعة") ||
        desc.startsWith("تحويل مخزني") ||
        desc.startsWith("تسوية مخزنية") ||
        desc.startsWith("سند قبض") ||
        desc.startsWith("سند صرف") ||
        desc.startsWith("مشتريات") ||
        desc.startsWith("مردود") ||
        data.sourceType === "expense" ||
        data.sourceType === "receipt" ||
        data.sourceType === "customer_receipt" ||
        data.sourceType === "invoice" ||
        data.sourceType === "stockTransfer" ||
        data.refType === "expense" ||
        data.refType === "receipt" ||
        data.refType === "invoice" ||
        data.type === "expense" ||
        data.type === "receipt"
      ) {
        return;
      }

      // تخطي أي قيد يرتبط بسند صرف تم تحميله بالفعل
      const descUpper = desc.toUpperCase();
      const codeUpper = (data.code || "").toUpperCase();
      for (const expCode of loadedExpenseCodes) {
        if (expCode && (descUpper.includes(expCode) || codeUpper.includes(expCode))) {
          return;
        }
      }

      const lines = data.lines || [];
      const ENHANCED_CUTOFF_DATE = "2026-10-08";
      const isPostCutoff = jDate >= ENHANCED_CUTOFF_DATE;

      // أ) حركات صندوق المندوب النقدي (1-1-1-2)
      lines.forEach((l, lIdx) => {
        const cr = parseFloat(l.credit || 0);
        const dr = parseFloat(l.debit || 0);
        const accId   = l.accountId;
        const accCode = String(l.accountCode || "");
        const accName = l.accountName || "";

        // المطابقة الصارمة على حساب صندوق المندوب النقدي (1-1-1-2)
        let matchedRepId = _cachedBoxAccIdMap[accId] || _cachedBoxAccCodeMap[accCode] || null;
        if (!matchedRepId && (accCode.startsWith("1-1-1-2") || accName.includes("صندوق"))) {
          const matched = _cachedReps.find(r => {
            const parts = [r.name.trim(), ...r.name.split(/\s+/).filter(p => p.length >= 3)];
            return parts.some(p => accName.includes(p));
          });
          if (matched) matchedRepId = matched.id;
        }

        if (matchedRepId && repIdSet.has(matchedRepId)) {
          if (cr > 0) {
            const debitLine = lines.find((dl, di) => di !== lIdx && parseFloat(dl.debit || 0) > 0);
            const debitAccCode = String(debitLine?.accountCode || "");
            const debitAccName = debitLine?.accountName || "";

            const isTransferToTreasury = debitAccCode.startsWith("3-1-4")
              || debitAccCode.startsWith("1-1-1-1") || debitAccCode.startsWith("1-1-1-3")
              || desc.includes("جارى") || desc.includes("جاري")
              || desc.includes("تصفية") || desc.includes("توريد للخزينة") || desc.includes("تحويل الى جارى");

            const isAdvFromBox = debitAccCode.startsWith("1-1-5-4") || debitAccCode.startsWith("2-1-5-3") || desc.includes("سلفة");
            const isCustOut = debitAccCode.startsWith("1-1-2-3") || desc.includes("عهدة");

            journalCashOut.push({
              id: d.id,
              date: jDate,
              _repId: matchedRepId,
              description: desc || debitAccName || (isTransferToTreasury ? "توريد نقدية للخزينة" : "مصروف نقدي"),
              category: debitAccName,
              amount: cr,
              refNumber: data.code || d.id.slice(-6),
              isTransfer: isTransferToTreasury,
              isActualHandover: isTransferToTreasury,
              isAdvanceFromBox: isAdvFromBox,
              isCustodyOut: isCustOut,
              isFieldExpense: !isTransferToTreasury && !isAdvFromBox,
              typeBadge: isTransferToTreasury ? "توريد للخزينة" : isAdvFromBox ? "سلفة من الصندوق" : isCustOut ? "عهدة منصرفة" : desc.includes("صيانة") || desc.includes("زيت") ? "صيانة وتشغيل" : "مصروف نقدي"
            });
          } else if (dr > 0 && isPostCutoff) {
            // عهدة نقدية مستلمة بالصندوق
            const creditLine = lines.find((cl, ci) => ci !== lIdx && parseFloat(cl.credit || 0) > 0);
            const crCode = String(creditLine?.accountCode || "");
            if (crCode.startsWith("1-1-1-1") || crCode.startsWith("3-1-4") || crCode.startsWith("1-1-1-3") || desc.includes("عهدة") || desc.includes("تمويل")) {
              journalCashOut.push({
                id: d.id,
                date: jDate,
                _repId: matchedRepId,
                description: desc || "عهدة نقدية مستلمة لتمويل الصندوق",
                category: creditLine?.accountName || "الخزينة المركزية",
                amount: dr,
                refNumber: data.code || d.id.slice(-6),
                isCustodyIn: true,
                typeBadge: "عهدة نقدية مستلمة (+)"
              });
            }
          }
        }
      });

      // ب) السلف الشخصية المنصرفة من الخزينة المركزية (استقطاع راتب - مثل الـ 127 ر.س)
      if (isPostCutoff) {
        lines.forEach((l, lIdx) => {
          const dr = parseFloat(l.debit || 0);
          if (dr <= 0) return;
          const accId   = l.accountId;
          const accCode = String(l.accountCode || "");
          const accName = l.accountName || "";

          let loanRepId = _cachedRepLoanAccMap[accId] || _cachedRepLoanAccMap[accCode] || null;
          if (!loanRepId && (accCode.startsWith("1-1-5-4") || accName.includes("سلف"))) {
            const matched = _cachedReps.find(r => {
              const parts = [r.name.trim(), ...r.name.split(/\s+/).filter(p => p.length >= 3)];
              return parts.some(p => accName.includes(p));
            });
            if (matched) loanRepId = matched.id;
          }

          if (loanRepId && repIdSet.has(loanRepId)) {
            const crLine = lines.find((cl, ci) => ci !== lIdx && parseFloat(cl.credit || 0) > 0);
            const crCode = String(crLine?.accountCode || "");
            const isBoxCr = _cachedBoxAccCodeMap[crCode] || crCode.startsWith("1-1-1-2");
            // إذا صُرفت السلفة من الخزينة المركزية أو المالك أو البنك وليس من صندوق المندوب
            if (!isBoxCr) {
              journalCashOut.push({
                id: d.id,
                date: jDate,
                _repId: loanRepId,
                description: desc || "سلفة موظف من الخزينة المركزية (استقطاع راتب)",
                category: crLine?.accountName || "الخزينة المركزية",
                amount: dr,
                refNumber: data.code || d.id.slice(-6),
                isCentralAdvance: true,
                typeBadge: "سلفة إدارة مركزية (استقطاع راتب)"
              });
            }
          }
        });

        // ج) حركات عهد المشتريات والعمليات وتسوياتها (1-1-2-3)
        lines.forEach((l, lIdx) => {
          const dr = parseFloat(l.debit || 0);
          const cr = parseFloat(l.credit || 0);
          if (dr <= 0 && cr <= 0) return;
          const accId   = l.accountId;
          const accCode = String(l.accountCode || "");
          const accName = l.accountName || "";

          let custRepId = _cachedRepCustodyAccMap[accId] || _cachedRepCustodyAccMap[accCode] || null;
          if (!custRepId && (accCode.startsWith("1-1-2-3") || accName.includes("عهدة"))) {
            const matched = _cachedReps.find(r => {
              const parts = [r.name.trim(), ...r.name.split(/\s+/).filter(p => p.length >= 3)];
              return parts.some(p => accName.includes(p));
            });
            if (matched) custRepId = matched.id;
          }

          if (custRepId && repIdSet.has(custRepId)) {
            const otherLine = lines.find((ol, oi) => oi !== lIdx);
            const otherCode = String(otherLine?.accountCode || "");
            if (cr > 0) {
              // تسوية عهدة بسداد موردين أو مصروفات
              journalCashOut.push({
                id: d.id,
                date: jDate,
                _repId: custRepId,
                description: desc || "تسوية عهدة مشتريات وسداد موردين",
                category: otherLine?.accountName || "تسوية عهدة",
                amount: cr,
                refNumber: data.code || d.id.slice(-6),
                isCustodySettled: true,
                typeBadge: "تسوية عهدة مشتريات"
              });
            } else if (dr > 0 && !otherCode.startsWith("1-1-1-2")) {
              // عهدة مستلمة من الخزينة أو المالك
              journalCashOut.push({
                id: d.id,
                date: jDate,
                _repId: custRepId,
                description: desc || "عهدة مشتريات مستلمة",
                category: otherLine?.accountName || "الخزينة",
                amount: dr,
                refNumber: data.code || d.id.slice(-6),
                isCustodyReceived: true,
                typeBadge: "عهدة مشتريات مستلمة"
              });
            }
          }
        });
      }
    });

    // 6. التجميع حسب التاريخ والمندوب
    const map = {};
    const addGroup = (date, rid) => {
      const k = `${date}|${rid}`;
      if (!map[k]) {
        map[k] = {
          date,
          repId: rid,
          invoices: [],
          returns: [],
          receipts: [],
          cashOuts: [],
          custodiesIn: [],
          fieldExpenses: [],
          advancesFromBox: [],
          centralAdvances: [],
          custodySettlements: [],
          actualHandovers: []
        };
      }
      return map[k];
    };

    invoices.forEach(inv => {
      const rid = inv.repId;
      if (!rid || !repIdSet.has(rid)) return;
      addGroup(inv.date || from, rid).invoices.push(inv);
    });

    returns.forEach(ret => {
      const rid = ret._repId;
      if (!rid || !repIdSet.has(rid)) return;
      addGroup(ret.date || from, rid).returns.push(ret);
    });

    receipts.forEach(rcpt => {
      const rid = rcpt._repId;
      if (!rid || !repIdSet.has(rid)) return;
      addGroup(rcpt.date || from, rid).receipts.push(rcpt);
    });

    expensesList.forEach(exp => {
      const rid = exp._repId;
      if (!rid || !repIdSet.has(rid)) return;
      const item = {
        id: exp.id,
        date: exp.date,
        _repId: rid,
        description: exp.notes || exp.expenseName || exp.name || "سند صرف",
        category: exp.entityName || exp.accountName || "مصروف عام",
        amount: parseFloat(exp.amount || 0),
        refNumber: exp.code || exp.id.slice(-6),
        isTransfer: false,
        isFieldExpense: true,
        typeBadge: "سند صرف"
      };
      const grp = addGroup(exp.date || from, rid);
      grp.cashOuts.push(item);
      grp.fieldExpenses.push(item);
    });

    journalCashOut.forEach(je => {
      const grp = addGroup(je.date, je._repId);
      if (je.isCentralAdvance) {
        grp.centralAdvances.push(je);
      } else if (je.isCustodySettled || je.isCustodyReceived) {
        grp.custodySettlements.push(je);
      } else if (je.isCustodyIn) {
        grp.custodiesIn.push(je);
      } else {
        if (je.isActualHandover || je.isTransfer) grp.actualHandovers.push(je);
        else if (je.isAdvanceFromBox) grp.advancesFromBox.push(je);
        else grp.fieldExpenses.push(je);
        grp.cashOuts.push(je);
      }
    });

    // 7. حساب المجاميع والنتائج
    const ENHANCED_CUTOFF_DATE = "2026-10-08";
    const rows = Object.values(map)
      .sort((a,b) => a.date.localeCompare(b.date) || (repMap[a.repId]||"").localeCompare(repMap[b.repId]||""));

    rows.forEach(r => {
      r.grossSales = r.invoices.reduce((s,i) => s + parseFloat(i.totalWithVat || i.total || 0), 0);
      r.returnSales = (r.returns || []).reduce((s,ret) => s + parseFloat(ret.totalWithVat || ret.total || 0), 0);
      r.totalSales = r.grossSales - r.returnSales;

      r.cashCol = 0; r.bankCol = 0;
      r.receipts.forEach(rc => {
        const m = rc.method || rc.paymentMethod || "cash";
        const a = parseFloat(rc.amount || 0);
        if (isBank(m)) r.bankCol += a; else r.cashCol += a;
      });
      r.totalCol = r.cashCol + r.bankCol;

      if (r.date >= ENHANCED_CUTOFF_DATE) {
        r.isEnhanced = true;
        r.totCustodyIn = (r.custodiesIn || []).reduce((s,c) => s + (c.amount || 0), 0);
        r.totFieldExp = (r.fieldExpenses || []).reduce((s,e) => s + (e.amount || 0), 0);
        r.totAdvFromBox = (r.advancesFromBox || []).reduce((s,a) => s + (a.amount || 0), 0);
        r.totCentralAdv = (r.centralAdvances || []).reduce((s,a) => s + (a.amount || 0), 0);
        r.totActualHandover = (r.actualHandovers || []).reduce((s,h) => s + (h.amount || 0), 0);

        // المعادلة المحاسبية الدقيقة لتصفية يومية المندوب:
        // صافي النقد المطلوب توريده للخزينة = (التحصيل النقدي + العهد المستلمة صباحاً) - (المصروفات الميدانية + السلف المقتطعة من الصندوق)
        r.netBoxRequired = (r.cashCol + r.totCustodyIn) - (r.totFieldExp + r.totAdvFromBox);
        r.clearanceDiff = r.totActualHandover - r.netBoxRequired;
        r.clearanceStatus = Math.abs(r.clearanceDiff) < 0.05 ? "MATCHED" : r.clearanceDiff < 0 ? "REMAINING" : "SURPLUS";

        // حقول التوافق مع الشاشة والتصدير
        r.pureExpenses = r.totFieldExp + r.totAdvFromBox;
        r.treasuryTransfers = r.totActualHandover;
        r.totalCashOut = r.pureExpenses + r.treasuryTransfers;
        r.netBoxDay = r.netBoxRequired;
      } else {
        r.isEnhanced = false;
        r.pureExpenses = r.cashOuts.filter(o => !o.isTransfer).reduce((s, o) => s + (o.amount || 0), 0);
        r.treasuryTransfers = r.cashOuts.filter(o => o.isTransfer).reduce((s, o) => s + (o.amount || 0), 0);
        r.totalCashOut = r.pureExpenses + r.treasuryTransfers;
        r.netBoxDay = r.cashCol - r.pureExpenses;
        r.totActualHandover = r.treasuryTransfers;
        r.netBoxRequired = r.netBoxDay;
        r.clearanceDiff = 0;
        r.clearanceStatus = "LEGACY";
      }
    });

    const repRunning = {};
    rows.forEach(r => {
      if (!repRunning[r.repId]) repRunning[r.repId] = 0;
      repRunning[r.repId] += (r.cashCol - r.totalCashOut);
      r.boxBal = repRunning[r.repId];
    });

    const grand = rows.reduce((t,r) => {
      t.grossSales         += r.grossSales;
      t.returnSales        += r.returnSales;
      t.totalSales         += r.totalSales;
      t.cashCol            += r.cashCol;
      t.bankCol            += r.bankCol;
      t.pureExpenses       += r.pureExpenses;
      t.treasuryTransfers  += r.treasuryTransfers;
      t.totalCashOut       += r.totalCashOut;
      t.netBoxTotal        += r.netBoxDay;
      t.totCentralAdv      = (t.totCentralAdv || 0) + (r.totCentralAdv || 0);
      t.totActualHandover  = (t.totActualHandover || 0) + (r.totActualHandover || 0);
      return t;
    }, { grossSales:0, returnSales:0, totalSales:0, cashCol:0, bankCol:0, pureExpenses:0, treasuryTransfers:0, totalCashOut:0, netBoxTotal:0, totCentralAdv:0, totActualHandover:0 });

    if (!rows.length) {
      body.innerHTML = `<div class="rdj-empty">لا توجد حركات مسجلة في هذه الفترة</div>`;
      return;
    }

    const dateRange = from === to ? formatDate(from) : `${formatDate(from)} إلى ${formatDate(to)}`;
    const repLabel  = repId ? (repMap[repId] || repId) : "جميع المناديب";

    _currentReportRows = rows;
    _currentReportGrand = grand;
    _currentReportMeta = { dateRange, repLabel, from, to, custMap, repMap, repBoxNameMap: _cachedRepBoxNameMap };

    // ── بناء أسطر اليومية للشاشة ──
    let tbody = "";
    rows.forEach((r, idx) => {
      const repNameStr = repMap[r.repId] || r.repId || "مندوب";
      const boxNameStr = _cachedRepBoxNameMap[r.repId] || "صندوق المندوب";

      // 1. جدول الفواتير
      let invHtml = r.invoices.length === 0
        ? `<tr><td colspan="4" class="dmt">لا توجد فواتير مبيعات مسجلة في هذا اليوم</td></tr>`
        : "";
      let invTot = 0;
      r.invoices.forEach(inv => {
        const a = parseFloat(inv.totalWithVat || inv.total || 0); invTot += a;
        invHtml += `<tr>
          <td class="mono font-bold" style="color:#1e3a8a;">${inv.code || inv.invoiceNumber || inv.id.slice(-6)}</td>
          <td class="lft">${custMap[inv.customerId] || "عميل"}</td>
          <td>${badge(inv.paymentMethod)}</td>
          <td class="mono font-bold" style="color:#059669;">${formatCurrency(a)}</td>
        </tr>`;
      });
      if (r.invoices.length) {
        invHtml += `<tfoot><tr>
          <td colspan="3" style="text-align:right;">الإجمالي (${r.invoices.length} فاتورة)</td>
          <td class="mono font-bold" style="color:#059669;">${formatCurrency(invTot)}</td>
        </tr></tfoot>`;
      }

      // 1-ب. جدول المردودات (إن وجدت)
      let retHtml = "";
      if (r.returns && r.returns.length > 0) {
        let retTot = 0;
        r.returns.forEach(ret => {
          const a = parseFloat(ret.totalWithVat || ret.total || 0); retTot += a;
          retHtml += `<tr>
            <td class="mono font-bold" style="color:#dc2626;">${ret.number || ret.creditNoteNumber || ret.id.slice(-6)}</td>
            <td class="lft">${custMap[ret.customerId] || ret.customerName || "عميل"}</td>
            <td><span class="b b-exp">↩️ إشعار دائن</span></td>
            <td class="mono font-bold" style="color:#dc2626;">-${formatCurrency(a)}</td>
          </tr>`;
        });
        retHtml = `
          <div class="sub-card" style="border-color:rgba(239,68,68,0.3);">
            <div class="dh e" style="background:rgba(239,68,68,0.12); color:#991b1b;">
              <span>↩️ مردودات المبيعات (إشعارات دائنة)</span>
              <span class="mono">-${formatCurrency(retTot)}</span>
            </div>
            <table class="dt">
              <thead><tr><th style="width:120px;">رقم الإشعار</th><th style="text-align:right;">اسم العميل</th><th style="width:110px;">النوع</th><th style="width:120px;">المبلغ المسترد</th></tr></thead>
              <tbody>${retHtml}</tbody>
              <tfoot><tr><td colspan="3" style="text-align:right;">إجمالي المردودات (${r.returns.length} إشعار دائن)</td><td class="mono font-bold" style="color:#dc2626;">-${formatCurrency(retTot)}</td></tr></tfoot>
            </table>
          </div>
        `;
      }

      // 2. جدول التحصيلات
      let rcHtml = r.receipts.length === 0
        ? `<tr><td colspan="5" class="dmt">لا توجد تحصيلات مسجلة في هذا اليوم</td></tr>`
        : "";
      let rcTot = 0;
      r.receipts.forEach(rc => {
        const a = parseFloat(rc.amount || 0); rcTot += a;
        const m = rc.method || rc.paymentMethod || "cash";
        rcHtml += `<tr>
          <td class="mono font-bold" style="color:#1e3a8a;">${rc.code || rc.id.slice(-6)}</td>
          <td class="lft">${custMap[rc.targetId] || rc.accountName || "عميل"}</td>
          <td>${badge(m)}</td>
          <td style="font-size:.75rem; color:#64748b;">${rc.sourceName || boxNameStr}</td>
          <td class="mono font-bold" style="color:${isBank(m)?'#2563eb':'#d97706'};">${formatCurrency(a)}</td>
        </tr>`;
      });
      if (r.receipts.length) {
        rcHtml += `<tfoot><tr>
          <td colspan="4" style="text-align:right;">
            الإجمالي (${r.receipts.length} سند قبض) &nbsp;—&nbsp;
            <span style="color:#d97706; font-size:11.5px; font-weight:800;">💵 نقدي: ${formatCurrency(r.cashCol)}</span>
            &nbsp;•&nbsp;
            <span style="color:#2563eb; font-size:11.5px; font-weight:800;">💳 شبكة/تحويل: ${formatCurrency(r.bankCol)}</span>
          </td>
          <td class="mono font-bold" style="color:#1e3a8a; font-size:.95rem;">${formatCurrency(rcTot)}</td>
        </tr></tfoot>`;
      }

      // 3. جدول المصروفات والسلف
      let outHtml = r.cashOuts.length === 0
        ? `<tr><td colspan="4" class="dmt">لا توجد مصروفات أو مسحوبات نقدية من الصندوق</td></tr>`
        : "";
      let outTot = 0;
      r.cashOuts.forEach(co => {
        outTot += co.amount;
        const bClass = co.isTransfer ? "b-tr" : co.typeBadge.includes('سلفة') ? "b-adv" : "b-exp";
        outHtml += `<tr>
          <td class="mono" style="font-size:.75rem; color:#64748b;">${co.refNumber}</td>
          <td class="lft font-bold" style="color:${co.isTransfer ? '#0369a1' : '#991b1b'};">${co.description}</td>
          <td><span class="b ${bClass}">${co.typeBadge}</span></td>
          <td class="mono font-bold" style="color:${co.isTransfer ? '#0369a1' : '#dc2626'};">${formatCurrency(co.amount)}</td>
        </tr>`;
      });
      if (r.cashOuts.length) {
        outHtml += `<tfoot><tr>
          <td colspan="3" style="text-align:right;">إجمالي المصروفات والسلف والتوريدات (${r.cashOuts.length} حركة)</td>
          <td class="mono font-bold" style="color:#dc2626;">${formatCurrency(outTot)}</td>
        </tr></tfoot>`;
      }

      // كروت إيضاحية خاصة بالنظام المطور (من تاريخ 2026-10-08)
      let centralAdvHtml = "";
      if (r.isEnhanced && r.centralAdvances && r.centralAdvances.length > 0) {
        let advItems = r.centralAdvances.map(a => `
          <tr>
            <td class="mono font-bold" style="color:#0284c7;">${a.refNumber || a.ref}</td>
            <td class="lft font-bold">${a.description || a.desc}</td>
            <td><span class="b b-cst">💳 استقطاع راتب</span></td>
            <td style="font-size:11px; color:#64748b;">${a.source || a.category || "الخزينة المركزية"}</td>
            <td class="mono font-bold" style="color:#0284c7;">${formatCurrency(a.amount)}</td>
          </tr>
        `).join("");

        centralAdvHtml = `
          <div class="sub-card" style="border-color:#38bdf8; background:#f0f9ff; margin-bottom:12px;">
            <div class="dh" style="background:linear-gradient(135deg, #0284c7, #0369a1); color:#fff; display:flex; justify-content:space-between; align-items:center;">
              <span>💳 سلف شخصية مستلمة من الإدارة / الخزينة المركزية (استقطاع من الراتب الشهري)</span>
              <span class="mono" style="font-size:1.05rem; font-weight:900;">${formatCurrency(r.totCentralAdv)}</span>
            </div>
            <table class="dt">
              <thead><tr><th style="width:120px;">رقم القيد</th><th style="text-align:right;">البيان</th><th style="width:110px;">النوع</th><th style="width:140px;">الجهة المصدرة</th><th style="width:120px;">المبلغ</th></tr></thead>
              <tbody>${advItems}</tbody>
            </table>
            <div style="padding:8px 12px; font-size:11.5px; color:#0369a1; font-weight:700; border-top:1px dashed #bae6fd; background:#e0f2fe;">
              📌 <strong>إيضاح رقابي:</strong> هذا المبلغ صُرف للموظف مباشرة من الخزينة المركزية (الصندوق الرئيسي/المالك) ويُستقطع من الراتب الشهري عند صرف الرواتب، ولا يُخصم من نقدية توريد سيارة المبيعات الميدانية لضمان دقة ومطابقة عهدة السيارة.
            </div>
          </div>
        `;
      }

      let custodySettlementHtml = "";
      if (r.isEnhanced && r.custodySettlements && r.custodySettlements.length > 0) {
        let custTotRec = 0, custTotSet = 0;
        let cItems = r.custodySettlements.map(c => {
          const isRec = c.isCustodyReceived || c.type === 'received';
          if (isRec) custTotRec += c.amount; else custTotSet += c.amount;
          return `
            <tr>
              <td class="mono font-bold">${c.refNumber || c.ref}</td>
              <td class="lft font-bold">${c.description || c.desc}</td>
              <td><span class="b ${isRec ? 'b-cst' : 'b-ok'}">${isRec ? '📥 عهدة مستلمة' : '📤 تسوية عهدة (سداد)'}</span></td>
              <td class="mono font-bold" style="color:${isRec ? '#0284c7' : '#059669'};">${isRec ? '+' : '-'}${formatCurrency(c.amount)}</td>
            </tr>
          `;
        }).join("");

        custodySettlementHtml = `
          <div class="sub-card" style="border-color:#cbd5e1; margin-bottom:12px;">
            <div class="dh" style="background:#475569; color:#fff; display:flex; justify-content:space-between; align-items:center;">
              <span>📦 حركة وتسوية عهد المشتريات والعمليات</span>
              <span class="mono" style="font-size:11.5px;">مستلم: ${formatCurrency(custTotRec)} | مسوى: ${formatCurrency(custTotSet)} | رصيد العهدة: ${formatCurrency(custTotRec - custTotSet)}</span>
            </div>
            <table class="dt">
              <thead><tr><th style="width:120px;">المرجع</th><th style="text-align:right;">البيان</th><th style="width:140px;">نوع الحركة</th><th style="width:120px;">المبلغ</th></tr></thead>
              <tbody>${cItems}</tbody>
            </table>
          </div>
        `;
      }

      let handoverCardHtml = "";
      if (r.isEnhanced && r.actualHandovers && r.actualHandovers.length > 0) {
        let hItems = r.actualHandovers.map(h => `
          <tr>
            <td class="mono font-bold" style="color:#0284c7;">${h.refNumber || h.ref}</td>
            <td class="lft font-bold" style="color:#0369a1;">${h.description || h.desc}</td>
            <td><span class="b b-tr">🤝 توريد رسمي للخزينة</span></td>
            <td class="mono font-bold" style="color:#0284c7;">${formatCurrency(h.amount)}</td>
          </tr>
        `).join("");

        handoverCardHtml = `
          <div class="sub-card" style="border-color:#0284c7; margin-bottom:12px;">
            <div class="dh" style="background:linear-gradient(135deg, #0369a1, #0284c7); color:#fff; display:flex; justify-content:space-between; align-items:center;">
              <span>🤝 المبالغ الموردة فعلياً إلى جاري المالك / الخزينة الرئيسية</span>
              <span class="mono" style="font-size:1.05rem; font-weight:900;">${formatCurrency(r.totActualHandover)}</span>
            </div>
            <table class="dt">
              <thead><tr><th style="width:120px;">رقم القيد</th><th style="text-align:right;">البيان والحساب المستلم</th><th style="width:140px;">النوع</th><th style="width:120px;">المبلغ المورد</th></tr></thead>
              <tbody>${hItems}</tbody>
            </table>
          </div>
        `;
      }

      let clearanceBarHtml = "";
      if (r.isEnhanced) {
        const statusBadgeClass = r.clearanceStatus === 'MATCHED' ? 'b-ok' : r.clearanceStatus === 'REMAINING' ? 'b-warn' : 'b-cst';
        const statusBadgeText  = r.clearanceStatus === 'MATCHED' ? '✅ مطابق ومقفل بالكامل (0.00 ر.س)' : r.clearanceStatus === 'REMAINING' ? `⚠️ متبقي في ذمة المندوب للتوريد (${formatCurrency(Math.abs(r.clearanceDiff))})` : `ℹ️ توريد فائض للخزينة (+${formatCurrency(r.clearanceDiff)})`;

        clearanceBarHtml = `
          <div class="rep-box-calc-bar" style="background:#f8fafc; border:2px solid #0284c7; border-radius:10px; padding:12px 16px; margin-top:12px;">
            <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; width:100%;">
              <div>💵 التحصيل النقدي: <strong class="mono text-good">${formatCurrency(r.cashCol)}</strong></div>
              ${r.totCustodyIn > 0 ? `<div>➕ 📦 عهدة مستلمة: <strong class="mono" style="color:#0284c7;">+${formatCurrency(r.totCustodyIn)}</strong></div>` : ''}
              <div>➖ 💸 مصروفات وسلف الصندوق: <strong class="mono text-bad">-${formatCurrency(r.pureExpenses)}</strong></div>
              <div>🟰 🏦 صافي النقد المفترض توريده: <strong class="mono font-bold" style="color:#0f172a; font-size:1.1rem;">${formatCurrency(r.netBoxRequired)}</strong></div>
            </div>
            <div style="width:100%; height:1px; background:#cbd5e1; margin:8px 0;"></div>
            <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; width:100%;">
              <div>🤝 المورد الفعلي للجاري/الخزينة: <strong class="mono font-bold" style="color:#0284c7; font-size:1.1rem;">${formatCurrency(r.totActualHandover)}</strong></div>
              <div>⮞ فارق الإقفال والتسوية: <strong class="mono font-bold" style="color:${Math.abs(r.clearanceDiff) < 0.05 ? '#059669' : '#dc2626'}; font-size:1.15rem;">${formatCurrency(r.clearanceDiff)}</strong></div>
              <div>الحالة: <span class="b ${statusBadgeClass}" style="font-size:12px; padding:4px 10px;">${statusBadgeText}</span></div>
            </div>
          </div>
        `;
      } else {
        clearanceBarHtml = `
          <div class="rep-box-calc-bar">
            <div>💵 التحصيل النقدي: <strong class="mono text-good">${formatCurrency(r.cashCol)}</strong></div>
            <div style="color:#64748b;">➖</div>
            <div>💸 المصروفات والسلف: <strong class="mono text-bad">${formatCurrency(r.pureExpenses)}</strong></div>
            <div style="color:#64748b;">🟰</div>
            <div>🏦 صافي النقد المتاح للتوريد: <strong class="mono font-bold" style="color:#047857; font-size:1.05rem;">${formatCurrency(r.netBoxDay)}</strong></div>
            ${r.treasuryTransfers > 0 ? `<div style="font-size:11px; color:#0369a1; width:100%; border-top:1px dashed #cbd5e1; padding-top:4px; margin-top:4px;">(تم توريد ${formatCurrency(r.treasuryTransfers)} إلى جاري المالك/الخزينة)</div>` : ''}
          </div>
        `;
      }

      const rowStatusBadge = !r.isEnhanced ? '' : `
        <div style="margin-top:3px;">
          ${r.clearanceStatus === 'MATCHED'
            ? '<span class="b b-ok" style="font-size:10px; padding:1px 6px;">✅ مقفل ومطابق</span>'
            : r.clearanceStatus === 'REMAINING'
            ? `<span class="b b-warn" style="font-size:10px; padding:1px 6px;">⚠️ متبقي ${formatCurrency(Math.abs(r.clearanceDiff))}</span>`
            : `<span class="b b-cst" style="font-size:10px; padding:1px 6px;">ℹ️ فائض +${formatCurrency(r.clearanceDiff)}</span>`
          }
        </div>
      `;

      tbody += `
        <tr class="mr" onclick="rdjX(${idx})">
          <td><button class="xbtn" id="xb${idx}">▶</button></td>
          <td class="td-date mono">${r.date}</td>
          <td class="td-rep">👤 ${repNameStr}</td>
          <td class="td-sales mono">${formatCurrency(r.totalSales)}</td>
          <td class="td-cash mono">${r.cashCol > 0 ? formatCurrency(r.cashCol) : '—'}</td>
          <td class="td-bank mono">${r.bankCol > 0 ? formatCurrency(r.bankCol) : '—'}</td>
          <td class="td-exp mono">${r.pureExpenses > 0 ? formatCurrency(r.pureExpenses) : '—'}</td>
          <td class="td-box mono ${(r.netBoxDay || r.netBoxRequired) < 0 ? 'text-bad' : 'text-good'}">
            🏦 ${formatCurrency(r.isEnhanced ? r.netBoxRequired : r.netBoxDay)}
            ${rowStatusBadge}
          </td>
        </tr>

        <tr class="dr">
          <td colspan="8">
            <div class="di" id="di${idx}">
              <div class="rep-section-badge">
                <div>
                  <h4>👤 يومية المندوب: ${repNameStr} &nbsp;|&nbsp; 📅 التاريخ: ${r.date}</h4>
                  <div style="font-size:.78rem; opacity:0.9; margin-top:2px;">📦 الصندوق المعتمد: ${boxNameStr}</div>
                </div>
                <div style="text-align:left; font-size:.85rem; font-weight:800;">
                  صافي النقدية المفترض توريدها: <span style="font-size:1.1rem; color:#fef08a; font-family:monospace;">${formatCurrency(r.isEnhanced ? r.netBoxRequired : r.netBoxDay)}</span>
                </div>
              </div>

              <div class="sub-card">
                <div class="dh s">
                  <span>📈 1. فواتير المبيعات الصادرة</span>
                  <span class="mono">${formatCurrency(r.grossSales ?? r.totalSales)}</span>
                </div>
                <table class="dt">
                  <thead><tr><th style="width:120px;">رقم الفاتورة</th><th style="text-align:right;">اسم العميل</th><th style="width:110px;">طريقة الدفع</th><th style="width:120px;">المبلغ</th></tr></thead>
                  <tbody>${invHtml}</tbody>
                </table>
              </div>

              ${retHtml}

              <div class="sub-card">
                <div class="dh c" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                  <span>💰 2. سندات التحصيل والقبض (المقبوضات)</span>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:11px; opacity:0.9; font-weight:700;">(💵 نقدي: ${formatCurrency(r.cashCol)} • 💳 شبكة/بنك: ${formatCurrency(r.bankCol)})</span>
                    <span class="mono" style="font-size:1rem; font-weight:900;">${formatCurrency(r.totalCol)}</span>
                  </div>
                </div>
                <table class="dt">
                  <thead><tr><th style="width:120px;">رقم السند</th><th style="text-align:right;">العميل / الحساب</th><th style="width:110px;">طريقة التحصيل</th><th style="width:140px;">الصندوق</th><th style="width:120px;">المبلغ</th></tr></thead>
                  <tbody>${rcHtml}</tbody>
                </table>
              </div>

              <div class="sub-card">
                <div class="dh e">
                  <span>💸 3. المصروفات والسلف التشغيلية ومسحوبات الصندوق</span>
                  <span class="mono">${formatCurrency(r.totalCashOut)}</span>
                </div>
                <table class="dt">
                  <thead><tr><th style="width:120px;">رقم القيد / السند</th><th style="text-align:right;">البيان والتفاصيل</th><th style="width:120px;">النوع</th><th style="width:120px;">المبلغ المنصرف</th></tr></thead>
                  <tbody>${outHtml}</tbody>
                </table>
              </div>

              ${centralAdvHtml}
              ${custodySettlementHtml}
              ${handoverCardHtml}
              ${clearanceBarHtml}

            </div>
          </td>
        </tr>
      `;
    });

    body.innerHTML = `
      <div class="gen-kpis-grid no-print">
        <div class="gen-kpi-card green">
          <div class="gen-kpi-top"><span class="gen-kpi-title">إجمالي المبيعات</span><span>📈</span></div>
          <div class="gen-kpi-val" style="color:#059669">${formatCurrency(grand.totalSales)}</div>
        </div>
        <div class="gen-kpi-card amber">
          <div class="gen-kpi-top"><span class="gen-kpi-title">إجمالي التحصيل النقدي</span><span>💵</span></div>
          <div class="gen-kpi-val" style="color:#d97706">${formatCurrency(grand.cashCol)}</div>
        </div>
        <div class="gen-kpi-card blue">
          <div class="gen-kpi-top"><span class="gen-kpi-title">إجمالي تحصيل بنك / شبكة</span><span>🏦</span></div>
          <div class="gen-kpi-val" style="color:#2563eb">${formatCurrency(grand.bankCol)}</div>
        </div>
        <div class="gen-kpi-card purple" style="border-color:rgba(239,68,68,.4)">
          <div class="gen-kpi-top"><span class="gen-kpi-title">المصروفات والسلف التشغيلية</span><span>💸</span></div>
          <div class="gen-kpi-val" style="color:#dc2626">${formatCurrency(grand.pureExpenses)}</div>
        </div>
        <div class="gen-kpi-card emerald">
          <div class="gen-kpi-top"><span class="gen-kpi-title">صافي النقد المتاح للتوريد</span><span>🏦</span></div>
          <div class="gen-kpi-val" style="color:#047857;">${formatCurrency(grand.netBoxTotal)}</div>
        </div>
      </div>

      <div class="rdj-tw">
        <table class="rdj-t">
          <thead>
            <tr>
              <th style="width:36px"></th>
              <th>📅 التاريخ</th>
              <th style="text-align:right;">👤 اسم المندوب</th>
              <th>📈 إجمالي المبيعات</th>
              <th>💵 تحصيل نقدي</th>
              <th>🏦 تحصيل بنك/شبكة</th>
              <th>💸 مصروفات وسلف (-)</th>
              <th>🏦 صافي النقد المتاح للتوريد</th>
            </tr>
          </thead>
          <tbody>${tbody}</tbody>
          <tfoot>
            <tr>
              <td></td>
              <td colspan="2" style="text-align:right; font-size:.85rem; color:#475569;">الإجمالي العام (${rows.length} يومية مندوب)</td>
              <td class="td-sales mono">${formatCurrency(grand.totalSales)}</td>
              <td class="td-cash mono">${formatCurrency(grand.cashCol)}</td>
              <td class="td-bank mono">${formatCurrency(grand.bankCol)}</td>
              <td class="td-exp mono">${formatCurrency(grand.pureExpenses)}</td>
              <td class="td-box mono">${formatCurrency(grand.netBoxTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;

    window.rdjX = (idx) => {
      const d = document.getElementById(`di${idx}`);
      const b = document.getElementById(`xb${idx}`);
      const r = b?.closest("tr");
      if (!d) return;
      const o = d.classList.toggle("open");
      if (b) b.textContent = o ? "▼" : "▶";
      if (r) r.classList.toggle("open", o);
    };

  } catch (err) {
    body.innerHTML = `<div class="rdj-empty" style="color:#ef4444">❌ خطأ في إعداد اليومية: ${err.message}</div>`;
    console.error("[DailyJournalReport]", err);
  }
}

/**
 * ══════════════════════════════════════════════════════════════
 * نافذة ضبط المستهدفات الشهرية (Monthly Targets Modal)
 * ══════════════════════════════════════════════════════════════
 */
window.openRepTargetModal = () => {
  const modal = document.getElementById("rdj-target-modal");
  const body  = document.getElementById("rdj-target-modal-body");
  if (!modal || !body) return;

  body.innerHTML = _cachedReps.map(r => {
    const isInactive = r.status === "inactive" || r.isActive === false;
    return `
    <div class="rep-target-row" style="${isInactive ? 'opacity:0.6; background:#f8fafc;' : ''}">
      <div class="rep-target-info">
        <div>${isInactive ? '⚪' : '👤'} ${r.name} ${isInactive ? '<span style="color:#ef4444; font-size:11px; font-weight:bold;">(غير نشط)</span>' : ''}</div>
        <div style="font-size:11px; color:#64748b; font-weight:normal;">كود: ${r.code || r.id.slice(-4)}</div>
      </div>
      <div style="display:flex; align-items:center; gap:6px;">
        <input type="number" id="target-inp-${r.id}" class="rep-target-input" value="${parseFloat(r.monthlyTarget || 0)}" min="0" step="1000" />
        <span style="font-size:12px; font-weight:bold; color:#475569;">ر.س</span>
      </div>
    </div>
  `;
  }).join("");

  modal.style.display = "flex";
};

window.closeRepTargetModal = () => {
  const modal = document.getElementById("rdj-target-modal");
  if (modal) modal.style.display = "none";
};

window.saveRepTargets = async () => {
  const btn = document.getElementById("rdj-save-targets-btn");
  if (btn) { btn.disabled = true; btn.textContent = "⏳ جاري الحفظ..."; }

  try {
    const updates = [];
    _cachedReps.forEach(r => {
      const inp = document.getElementById(`target-inp-${r.id}`);
      if (inp) {
        const val = parseFloat(inp.value) || 0;
        r.monthlyTarget = val;
        updates.push(updateDoc(doc(db, `companies/${COMPANY_ID}/salesReps`, r.id), { monthlyTarget: val }));
      }
    });

    await Promise.all(updates);
    if (typeof window.showToast === "function") window.showToast("تم تحديث مستهدفات المناديب بنجاح ✅", "success");
    window.closeRepTargetModal();
    const c = document.querySelector(".rdj-wrap")?.parentElement;
    if (c) runCurrentReport(c);
  } catch (err) {
    alert("فشل حفظ المستهدفات: " + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "💾 حفظ المستهدفات وتحديث التقرير"; }
  }
};

/**
 * ══════════════════════════════════════════════════════════════
 * نافذة فحص وتدقيق أرباح وتكاليف الفواتير بالتفصيل
 * ══════════════════════════════════════════════════════════════
 */
window.closeRepProfitAuditModal = () => {
  const m = document.getElementById("rdj-profit-audit-modal");
  if (m) m.style.display = "none";
};

window.showRepProfitAuditModal = (repId) => {
  if (!_currentGenData || !_currentGenData.reps) return;
  const modal = document.getElementById("rdj-profit-audit-modal");
  const body  = document.getElementById("rdj-profit-modal-body");
  const title = document.getElementById("rdj-profit-modal-title");
  if (!modal || !body) return;

  let repName = "";
  let items = [];
  let subtotal = 0;
  let netCogs = 0;
  let profit = 0;
  let marginPct = 0;

  if (repId === "all") {
    repName = "الإجمالي العام لكافة مناديب الشركة";
    _currentGenData.reps.forEach(r => {
      items.push(...(r.invoicesDetails || []));
    });
    subtotal = _currentGenData.grand.periodSubtotal;
    netCogs  = _currentGenData.grand.periodNetCogs;
    profit   = _currentGenData.grand.periodProfit;
    marginPct= _currentGenData.grand.periodMarginPct;
  } else {
    const rep = _currentGenData.reps.find(r => r.id === repId);
    if (!rep) return;
    repName  = rep.name;
    items    = rep.invoicesDetails || [];
    subtotal = rep.periodSubtotal;
    netCogs  = rep.periodNetCogs;
    profit   = rep.periodProfit;
    marginPct= rep.periodMarginPct;
  }

  // فرز الفواتير حسب التاريخ تنازلياً
  items.sort((a,b) => (b.date || "").localeCompare(a.date || ""));

  if (title) title.textContent = `كشف تدقيق أرباح وتكاليف المبيعات — ${repName}`;

  body.innerHTML = `
    <!-- كروت ملخص المعادلة المحاسبية -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px; margin-bottom:16px;">
      <div style="background:#f0fdf4; border:1.5px solid #86efac; border-radius:10px; padding:10px 14px;">
        <div style="font-size:11px; font-weight:700; color:#15803d;">صافي المبيعات (قبل الضريبة)</div>
        <div style="font-size:16px; font-weight:900; color:#166534; font-family:monospace;">${formatCurrency(subtotal)}</div>
      </div>
      <div style="background:#fef2f2; border:1.5px solid #fca5a5; border-radius:10px; padding:10px 14px;">
        <div style="font-size:11px; font-weight:700; color:#b91c1c;">تكلفة البضاعة المباعة (COGS)</div>
        <div style="font-size:16px; font-weight:900; color:#991b1b; font-family:monospace;">${formatCurrency(netCogs)}</div>
      </div>
      <div style="background:#eff6ff; border:1.5px solid #93c5fd; border-radius:10px; padding:10px 14px;">
        <div style="font-size:11px; font-weight:700; color:#1d4ed8;">صافي مجمل الربح (ر.س)</div>
        <div style="font-size:16px; font-weight:900; color:#1e40af; font-family:monospace;">${formatCurrency(profit)}</div>
      </div>
      <div style="background:#faf5ff; border:1.5px solid #d8b4fe; border-radius:10px; padding:10px 14px;">
        <div style="font-size:11px; font-weight:700; color:#7e22ce;">نسبة هامش الربح %</div>
        <div style="font-size:16px; font-weight:900; color:#6b21a8; font-family:monospace;">${marginPct.toFixed(2)}%</div>
      </div>
    </div>

    <!-- شريط توضيح المعادلة -->
    <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:8px 14px; font-size:11.5px; color:#334155; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
      <div><strong>المعادلة المحاسبية:</strong> ${formatCurrency(subtotal)} (صافي المبيعات) - ${formatCurrency(netCogs)} (التكلفة) = <strong>${formatCurrency(profit)} ر.س (مجمل الربح)</strong></div>
      <div style="color:#059669; font-weight:800;">نسبة الهامش = (${formatCurrency(profit)} ÷ ${formatCurrency(subtotal)}) × 100 = ${marginPct.toFixed(2)}%</div>
    </div>

    <!-- جدول الفواتير التفصيلي -->
    <div style="overflow-x:auto; border:1px solid #e2e8f0; border-radius:10px;">
      <table style="width:100%; border-collapse:collapse; font-size:11.5px;">
        <thead>
          <tr style="background:#f1f5f9; border-bottom:1.5px solid #cbd5e1; color:#334155;">
            <th style="padding:7px 10px; text-align:center;">#</th>
            <th style="padding:7px 10px; text-align:center;">النوع</th>
            <th style="padding:7px 10px; text-align:center;">رقم المستند</th>
            <th style="padding:7px 10px; text-align:center;">التاريخ</th>
            <th style="padding:7px 10px; text-align:right;">العميل</th>
            <th style="padding:7px 10px; text-align:center;">القيمة قبل الضريبة</th>
            <th style="padding:7px 10px; text-align:center;">التكلفة (COGS)</th>
            <th style="padding:7px 10px; text-align:center;">الربح (ر.س)</th>
            <th style="padding:7px 10px; text-align:center;">الهامش %</th>
          </tr>
        </thead>
        <tbody>
          ${items.length === 0 ? '<tr><td colspan="9" style="text-align:center; padding:16px; color:#94a3b8;">لا توجد فواتير لهذه الفترة</td></tr>' : ''}
          ${items.map((it, idx) => {
            const isRet = it.type === "return";
            const prfCol = it.profit >= 0 ? "#059669" : "#dc2626";
            return `
              <tr style="border-bottom:1px solid #f1f5f9; ${isRet ? 'background:rgba(239,68,68,0.04);' : ''}">
                <td style="padding:6px 10px; text-align:center; color:#64748b;">${idx + 1}</td>
                <td style="padding:6px 10px; text-align:center;">
                  ${isRet ? '<span style="background:#fee2e2; color:#b91c1c; font-weight:800; font-size:10px; padding:2px 6px; border-radius:4px;">↩️ مردود</span>' : '<span style="background:#e0f2fe; color:#0369a1; font-weight:800; font-size:10px; padding:2px 6px; border-radius:4px;">📄 فاتورة</span>'}
                </td>
                <td style="padding:6px 10px; text-align:center; font-family:monospace; font-weight:700;">${it.number}</td>
                <td style="padding:6px 10px; text-align:center; font-family:monospace; color:#64748b;">${it.date || "—"}</td>
                <td style="padding:6px 10px; text-align:right; font-weight:700; color:#0f172a;">${it.customerName}</td>
                <td style="padding:6px 10px; text-align:center; font-family:monospace; font-weight:700; ${isRet ? 'color:#dc2626;' : ''}">${formatCurrency(it.sub)}</td>
                <td style="padding:6px 10px; text-align:center; font-family:monospace; color:#475569;">${formatCurrency(it.cost)}</td>
                <td style="padding:6px 10px; text-align:center; font-family:monospace; font-weight:800; color:${prfCol};">${formatCurrency(it.profit)}</td>
                <td style="padding:6px 10px; text-align:center; font-family:monospace; font-weight:800; color:${prfCol};">${it.marginPct.toFixed(1)}%</td>
              </tr>
            `;
          }).join("")}
        </tbody>
        <tfoot>
          <tr style="background:#f8fafc; border-top:2px solid #0f172a; font-weight:900;">
            <td colspan="5" style="padding:8px 12px; text-align:right; color:#1e3a8a;">الإجمالي (${items.length} مستند)</td>
            <td style="padding:8px 10px; text-align:center; font-family:monospace; color:#059669;">${formatCurrency(subtotal)}</td>
            <td style="padding:8px 10px; text-align:center; font-family:monospace; color:#475569;">${formatCurrency(netCogs)}</td>
            <td style="padding:8px 10px; text-align:center; font-family:monospace; color:#047857; font-size:12px;">${formatCurrency(profit)}</td>
            <td style="padding:8px 10px; text-align:center; font-family:monospace; color:#047857; font-size:12px;">${marginPct.toFixed(1)}%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  modal.style.display = "flex";
};

/**
 * ══════════════════════════════════════════════════════════════
 * مشاركة تقرير اليومية للمدير المالي عبر WhatsApp بضغطة واحدة
 * ══════════════════════════════════════════════════════════════
 */
window.shareRepDailyJournalWhatsApp = () => {
  if (!_currentGenData || !_currentGenData.reps || !_currentGenData.reps.length) {
    alert("يرجى الضغط على زر عرض التقرير أولاً لتحميل البيانات قبل الإرسال للمدير المالي.");
    return;
  }
  const { from, to, todayStr, reps, grand } = _currentGenData;
  const isSingleDay = from === to;

  let msg = `📊 *تقرير يومية المبيعات والتحصيلات التنفيذي — إدهام ERP*\n`;
  msg += `📅 *التاريخ:* ${todayStr || to}\n`;
  if (!isSingleDay) {
    msg += `🗓️ *الفترة:* من ${from} إلى ${to}\n`;
  }
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *مبيعات اليوم (شامل الضريبة):* ${formatCurrency(grand.todaySales || 0)}\n`;
  msg += `💵 *مبيعات اليوم (قبل الضريبة):* ${formatCurrency(grand.todaySubtotal || 0)}\n`;
  msg += `💳 *تحصيلات اليوم:* ${formatCurrency(grand.todayCol || 0)} (نقد: ${formatCurrency(grand.todayCashCol || 0)} • شبكة: ${formatCurrency(grand.todayBankCol || 0)})\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  if (!isSingleDay) {
    msg += `📈 *إجمالي مبيعات الفترة:* ${formatCurrency(grand.periodSales || 0)}\n`;
    msg += `💵 *صافي الفترة (قبل الضريبة):* ${formatCurrency(grand.periodSubtotal || 0)}\n`;
    msg += `🎯 *نسبة تحقيق التارجت:* ${(grand.targetPct || 0).toFixed(1)}%\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  }
  msg += `👥 *تفصيل أداء المناديب:*\n`;
  reps.forEach(r => {
    const s = r.todaySales > 0 ? formatCurrency(r.todaySales) : "0.00 ر.س";
    const c = r.todayCol > 0 ? formatCurrency(r.todayCol) : "0.00 ر.س";
    msg += `• *${r.name}:* مبيعات: ${s} | تحصيل: ${c}\n`;
  });
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🔗 *رابط التقرير المباشر والمفصل:*\nhttps://idham-b3a7e.web.app/#rep-daily-journal`;

  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
};

/**
 * ══════════════════════════════════════════════════════════════
 * تصدير التقرير العام إلى Excel
 * ══════════════════════════════════════════════════════════════
 */
window.exportGeneralReportExcel = () => {
  if (!_currentGenData || !_currentGenData.reps || !_currentGenData.reps.length) {
    alert("يرجى عرض التقرير أولاً قبل التصدير");
    return;
  }

  const { reps, grand, from, to } = _currentGenData;
  const headers = [
    "م", "اسم المندوب",
    "صافي مبيعات اليوم شامل الضريبة", "مبيعات اليوم قبل الضريبة", "مردودات اليوم",
    "تحصيل اليوم (ر.س)",
    "صافي مبيعات الفترة شامل الضريبة", "مبيعات الفترة قبل الضريبة", "مردودات الفترة",
    "عدد الفواتير", "متوسط الفاتورة",
    "تحصيل نقدي الفترة", "تحصيل شبكة الفترة", "إجمالي تحصيل الفترة",
    "مجمل الربح للفترة (ر.س)", "نسبة هامش الربح %",
    "مبيعات الشهر MTD صافي شامل", "مبيعات الشهر MTD قبل", "مردودات الشهر MTD",
    "الهدف الشهري", "نسبة تحقيق التارجت %", "نسبة التحصيل من المبيعات %"
  ];

  const rows = reps.map((r, i) => [
    i + 1,
    r.name,
    r.todaySales,
    r.todaySubtotal,
    r.todayReturnSales || 0,
    r.todayCol,
    r.periodSales,
    r.periodSubtotal,
    r.periodReturnSales || 0,
    r.invoiceCount,
    Math.round(r.avgInvoice),
    r.cashCol,
    r.bankCol,
    r.totalCol,
    Math.round((r.periodProfit || 0) * 100) / 100,
    (r.periodMarginPct || 0).toFixed(2) + "%",
    r.mtdSales,
    r.mtdSubtotal,
    r.mtdReturnSales || 0,
    r.monthlyTarget,
    r.targetPct.toFixed(1) + "%",
    r.collectionRate.toFixed(1) + "%"
  ]);

  rows.push([
    "Σ",
    "الإجمالي العام للشركة",
    grand.todaySales,
    grand.todaySubtotal,
    grand.todayReturnSales || 0,
    grand.todayCol,
    grand.periodSales,
    grand.periodSubtotal,
    grand.periodReturnSales || 0,
    grand.invoiceCount,
    Math.round(grand.avgInvoice),
    grand.cashCol,
    grand.bankCol,
    grand.totalCol,
    Math.round((grand.periodProfit || 0) * 100) / 100,
    (grand.periodMarginPct || 0).toFixed(2) + "%",
    grand.mtdSales,
    grand.mtdSubtotal,
    grand.mtdReturnSales || 0,
    grand.monthlyTarget,
    grand.targetPct.toFixed(1) + "%",
    grand.collectionRate.toFixed(1) + "%"
  ]);

  exportXLSX({
    filename: `تقرير_أداء_وربحية_المناديب_التنفيذي_${to}`,
    title: `التقرير التنفيذي لأداء ومبيعات وهوامش أرباح المناديب (من ${from} إلى ${to})`,
    headers,
    rows
  });
};

/**
 * ══════════════════════════════════════════════════════════════
 * تصدير اليومية التفصيلية وحركة الصناديق والتسويات إلى Excel
 * ══════════════════════════════════════════════════════════════
 */
window.exportRepDailyExcel = () => {
  if (!_currentReportRows || !_currentReportRows.length) {
    alert("يرجى عرض اليومية أولاً قبل التصدير");
    return;
  }

  const { dateRange, repLabel, from, to, repMap, repBoxNameMap } = _currentReportMeta;

  const headers = [
    "م",
    "التاريخ",
    "اسم المندوب",
    "الصندوق المعتمد",
    "إجمالي فواتير المبيعات (ر.س)",
    "مردودات المبيعات (ر.س)",
    "صافي المبيعات (ر.س)",
    "التحصيل النقدي (ر.س)",
    "تحصيل بنك / شبكة (ر.س)",
    "إجمالي التحصيل (ر.س)",
    "العهدة النقدية المستلمة (ر.س)",
    "المصروفات الميدانية (ر.س)",
    "سلف مقتطعة من الصندوق (ر.س)",
    "سلف الخزينة المركزية - استقطاع راتب (ر.س)",
    "صافي النقد المفترض توريده (ر.س)",
    "المورد الفعلي لجاري المالك / الخزينة (ر.س)",
    "فارق المطابقة والتسوية (ر.س)",
    "حالة الإقفال والمطابقة"
  ];

  const rows = _currentReportRows.map((r, idx) => {
    const repName = repMap[r.repId] || r.repId || "مندوب";
    const boxName = repBoxNameMap[r.repId] || "صندوق المندوب";
    const statusText = !r.isEnhanced ? "سابق (تاريخ قديم)"
      : r.clearanceStatus === "MATCHED" ? "مطابق ومقفل بالكامل"
      : r.clearanceStatus === "REMAINING" ? `متبقي في ذمة المندوب (${formatCurrency(Math.abs(r.clearanceDiff))})`
      : `فائض مورد (+${formatCurrency(r.clearanceDiff)})`;

    return [
      idx + 1,
      r.date,
      repName,
      boxName,
      r.grossSales || r.totalSales,
      r.returnSales || 0,
      r.totalSales,
      r.cashCol,
      r.bankCol,
      r.totalCol,
      r.isEnhanced ? (r.totCustodyIn || 0) : 0,
      r.isEnhanced ? (r.totFieldExp || 0) : (r.pureExpenses || 0),
      r.isEnhanced ? (r.totAdvFromBox || 0) : 0,
      r.isEnhanced ? (r.totCentralAdv || 0) : 0,
      r.isEnhanced ? r.netBoxRequired : r.netBoxDay,
      r.isEnhanced ? (r.totActualHandover || 0) : (r.treasuryTransfers || 0),
      r.isEnhanced ? r.clearanceDiff : 0,
      statusText
    ];
  });

  // سطر الإجمالي العام
  const grandSales = _currentReportRows.reduce((s, r) => s + (r.totalSales || 0), 0);
  const grandGross = _currentReportRows.reduce((s, r) => s + (r.grossSales || r.totalSales || 0), 0);
  const grandRet   = _currentReportRows.reduce((s, r) => s + (r.returnSales || 0), 0);
  const grandCash  = _currentReportRows.reduce((s, r) => s + (r.cashCol || 0), 0);
  const grandBank  = _currentReportRows.reduce((s, r) => s + (r.bankCol || 0), 0);
  const grandTotCol= _currentReportRows.reduce((s, r) => s + (r.totalCol || 0), 0);
  const grandCstIn = _currentReportRows.reduce((s, r) => s + (r.isEnhanced ? (r.totCustodyIn||0) : 0), 0);
  const grandExp   = _currentReportRows.reduce((s, r) => s + (r.isEnhanced ? (r.totFieldExp||0) : (r.pureExpenses||0)), 0);
  const grandAdvBox= _currentReportRows.reduce((s, r) => s + (r.isEnhanced ? (r.totAdvFromBox || 0) : 0), 0);
  const grandCentralAdv = _currentReportRows.reduce((s, r) => s + (r.isEnhanced ? (r.totCentralAdv || 0) : 0), 0);
  const grandNetReq= _currentReportRows.reduce((s, r) => s + (r.isEnhanced ? r.netBoxRequired : r.netBoxDay), 0);
  const grandHandover = _currentReportRows.reduce((s, r) => s + (r.isEnhanced ? (r.totActualHandover||0) : (r.treasuryTransfers||0)), 0);
  const grandDiff  = _currentReportRows.reduce((s, r) => s + (r.isEnhanced ? r.clearanceDiff : 0), 0);

  rows.push([
    "Σ",
    "الإجمالي العام للفترة",
    repLabel,
    "—",
    grandGross,
    grandRet,
    grandSales,
    grandCash,
    grandBank,
    grandTotCol,
    grandCstIn,
    grandExp,
    grandAdvBox,
    grandCentralAdv,
    grandNetReq,
    grandHandover,
    grandDiff,
    Math.abs(grandDiff) < 0.05 ? "مطابق ومقفل بالكامل" : "يوجد فوارق تسوية"
  ]);

  exportXLSX({
    filename: `يومية_المناديب_وحركة_الصناديق_${to}`,
    title: `كشف تفريغ يوميات المناديب وحركة الصناديق والتوريدات والتسويات (${dateRange}) — ${repLabel}`,
    headers,
    rows
  });
};

/**
 * ══════════════════════════════════════════════════════════════
 * محرك التصدير والطباعة الملكية الفاخرة لـ PDF (Royal Landscape PDF)
 * ══════════════════════════════════════════════════════════════
 */
window.printGeneralReportPDF = () => {
  if (!_currentGenData || !_currentGenData.reps || !_currentGenData.reps.length) {
    alert("يرجى عرض التقرير أولاً قبل التصدير أو الطباعة");
    return;
  }

  const { reps, grand, from, to, mtdStart, todayStr, repLabel } = _currentGenData;
  const co = window.ERP_COMPANY || {};
  const coName = co.name || "مؤسسة أدهام للمواد الغذائية";
  const coSub  = "تجارة وتوريد المواد الغذائية بالجملة والتموين — ينبع البحر";
  const vatNum = co.vatNumber || "310123456700003";
  const crNum  = co.crNumber || "4650054321";
  const phone  = co.phone || "0500000000";
  const printDateStr = new Date().toLocaleDateString("ar-SA");
  const printTimeStr = new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });

  let chartTargetImg = "";
  let chartShareImg  = "";
  try {
    const c1 = document.getElementById("rdj-gen-chart-target");
    if (c1) chartTargetImg = c1.toDataURL("image/png");
    const c2 = document.getElementById("rdj-gen-chart-share");
    if (c2) chartShareImg = c2.toDataURL("image/png");
  } catch(e) {
    console.warn("Chart image extract error:", e);
  }

  const fmtNum = (val) => {
    if (val === null || val === undefined || isNaN(val)) return "0.00";
    return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  };

  const rowsHtml = reps.map((r, idx) => {
    const isTop = idx === 0 && r.periodSales > 0;
    const tColor = r.targetPct >= 100 ? "#059669" : r.targetPct >= 80 ? "#1d4ed8" : r.targetPct >= 50 ? "#d97706" : "#dc2626";
    const cColor = r.collectionRate >= 90 ? "#059669" : r.collectionRate >= 70 ? "#1d4ed8" : "#d97706";

    return `
      <tr>
        <td style="font-weight:900; color:#475569; font-size:10px;">${idx + 1}</td>
        <td style="text-align:right; font-weight:900; color:#0f172a; font-size:10.5px;">
          ${isTop ? '🏆 ' : ''}${r.name}
        </td>
        
        <!-- مبيعات اليوم شامل وقبل -->
        <td style="background:rgba(2,132,199,0.03);">
          <div style="font-family:monospace; font-weight:900; color:#0284c7; font-size:10px;">${fmtNum(r.todaySales)}</div>
          <div style="font-size:8px; color:#475569; font-family:monospace; font-weight:700;">قبل: ${fmtNum(r.todaySubtotal)}</div>
        </td>

        <!-- تحصيل اليوم بجانب مبيعات اليوم -->
        <td style="background:rgba(245,158,11,0.04); font-family:monospace; font-weight:900; color:#b45309; font-size:10px;">
          ${fmtNum(r.todayCol)}
        </td>

        <!-- مبيعات الفترة شامل وقبل -->
        <td style="background:rgba(5,150,105,0.03);">
          <div style="font-family:monospace; font-weight:900; color:#047857; font-size:10px;">${fmtNum(r.periodSales)}</div>
          <div style="font-size:8px; color:#0e7490; font-family:monospace; font-weight:700;">قبل: ${fmtNum(r.periodSubtotal)}</div>
        </td>

        <td style="font-family:monospace; font-weight:900; font-size:10px; color:#1e293b;">${r.invoiceCount}${r.returnCount > 0 ? ` (-${r.returnCount})` : ''}</td>
        <td style="font-family:monospace; color:#334155; font-weight:800; font-size:9.5px;">${fmtNum(r.avgInvoice)}</td>
        <td style="font-family:monospace; font-weight:900; color:#b45309; font-size:10px;">${fmtNum(r.cashCol)}</td>
        <td style="font-family:monospace; font-weight:900; color:#1d4ed8; font-size:10px;">${fmtNum(r.bankCol)}</td>
        <td style="font-family:monospace; font-weight:900; color:#1e3a8a; font-size:10.5px;">${fmtNum(r.totalCol)}</td>

        <!-- مجمل الربح وهامش الربح للفترة -->
        <td style="font-family:monospace; font-weight:900; color:#047857; font-size:10px; background:rgba(16,185,129,0.06);">
          <div>${fmtNum(r.periodProfit || 0)}</div>
          <div style="font-size:7.5px; color:#475569; font-weight:700;">تكلفة: ${fmtNum(r.periodNetCogs || 0)}</div>
          <span style="font-size:8px; color:${r.periodProfit >= 0 ? '#059669' : '#dc2626'}; font-weight:800;">(${r.periodMarginPct.toFixed(1)}%)</span>
        </td>

        <!-- مبيعات الشهر MTD شامل وقبل -->
        <td style="background:rgba(79,70,229,0.03);">
          <div style="font-family:monospace; font-weight:900; color:#4338ca; font-size:10px;">${fmtNum(r.mtdSales)}</div>
          <div style="font-size:8px; color:#6366f1; font-family:monospace; font-weight:700;">قبل: ${fmtNum(r.mtdSubtotal)}</div>
        </td>

        <td style="font-family:monospace; font-weight:800; font-size:10px; color:#334155;">${r.monthlyTarget > 0 ? fmtNum(r.monthlyTarget) : '—'}</td>
        <td style="font-family:monospace; font-weight:900; color:${tColor}; font-size:10.5px;">${r.targetPct.toFixed(1)}%</td>
        <td style="font-family:monospace; font-weight:900; color:${cColor}; font-size:10.5px;">${r.collectionRate.toFixed(1)}%</td>
      </tr>
    `;
  }).join("");

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("يرجى السماح بالنوافذ المنبثقة للطباعة أو تصدير الـ PDF");
    return;
  }

  const printDocHtml = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>التقرير العام لمبيعات ومتحصلات وعمولات المناديب والمستهدف الشهري</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    @page { size: A4 landscape; margin: 4mm 5mm; }
    body {
      font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
      font-size: 9.5px; color: #0f172a; background: #fff; direction: rtl; line-height: 1.25;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .report-wrap { width: 100%; max-width: 100%; margin: 0 auto; }
    .royal-header {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1e40af 100%);
      color: #fff; border-radius: 8px; padding: 6px 14px; display: flex; justify-content: space-between; align-items: center; border: 1.5px solid #d97706; box-shadow: 0 4px 12px rgba(15,23,42,0.15); margin-bottom: 5px;
    }
    .co-title-box { display: flex; align-items: center; gap: 10px; }
    .co-logo-circle { width: 38px; height: 38px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #1e3a8a; border: 2px solid #d97706; }
    .co-name { font-size: 14px; font-weight: 900; color: #fff; }
    .co-sub  { font-size: 8px; color: #cbd5e1; font-weight: 600; margin-top: 1px; }
    .doc-badge-center { text-align: center; }
    .doc-main-title { font-size: 14px; font-weight: 900; color: #fef08a; }
    .doc-period-text { font-size: 9px; color: #e2e8f0; font-weight: 700; margin-top: 1px; }
    .meta-box-left { text-align: left; font-size: 8px; color: #cbd5e1; line-height: 1.35; }
    .meta-box-left strong { color: #fff; }

    .kpi-row { display: flex; gap: 5px; margin-bottom: 5px; }
    .kpi-item { flex: 1; background: #f8fafc; border: 1.2px solid #cbd5e1; border-radius: 6px; padding: 4px 5px; text-align: center; border-top: 3px solid #2563eb; }
    .kpi-item.cyan    { border-top-color: #0891b2; }
    .kpi-item.green   { border-top-color: #059669; }
    .kpi-item.purple  { border-top-color: #7c3aed; }
    .kpi-item.blue    { border-top-color: #2563eb; }
    .kpi-item.amber   { border-top-color: #d97706; }
    .kpi-item.emerald { border-top-color: #047857; }
    .kpi-label { font-size: 8px; font-weight: 800; color: #334155; margin-bottom: 1px; }
    .kpi-val   { font-size: 12.5px; font-weight: 900; font-family: monospace; }
    .kpi-before { font-size: 8px; font-weight: 800; margin-top: 1px; }
    .kpi-note  { font-size: 7.5px; color: #64748b; font-weight: 700; }

    .charts-row { display: flex; gap: 6px; margin-bottom: 5px; }
    .chart-box { flex: 1; border: 1.2px solid #cbd5e1; border-radius: 6px; padding: 4px; background: #fff; text-align: center; }
    .chart-box-title { font-size: 8.5px; font-weight: 900; color: #1e3a8a; margin-bottom: 2px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 2px; }
    .chart-img { max-height: 85px; width: auto; max-width: 100%; object-fit: contain; }

    .table-card { border: 1.5px solid #0f172a; border-radius: 6px; overflow: hidden; margin-bottom: 6px; width: 100%; }
    .tbl-banner { background: #0f172a; color: #fff; padding: 4px 10px; font-size: 9px; font-weight: 800; display: flex; justify-content: space-between; align-items: center; }
    table.rep-tbl { width: 100%; border-collapse: collapse; font-size: 9.8px; table-layout: fixed; }
    table.rep-tbl th { background: #1e293b; color: #fff; padding: 5px 2px; font-weight: 900; text-align: center; border: 1px solid #334155; white-space: normal; line-height: 1.2; word-break: keep-all; font-size: 8.8px; }
    table.rep-tbl td { padding: 4px 2px; text-align: center; border: 1px solid #cbd5e1; white-space: nowrap; vertical-align: middle; overflow: hidden; text-overflow: ellipsis; font-size: 9.8px; }
    table.rep-tbl tbody tr:nth-child(even) { background: #f8fafc; }
    table.rep-tbl tfoot tr { background: #f1f5f9; font-weight: 900; border-top: 2.5px solid #0f172a; }
    table.rep-tbl tfoot td { padding: 5px 2px; vertical-align: middle; overflow: hidden; text-overflow: ellipsis; }

    .footer-signatures { display: flex; justify-content: space-between; gap: 16px; margin-top: 6px; border-top: 1.5px dashed #94a3b8; padding-top: 5px; }
    .sig-block { flex: 1; text-align: center; }
    .sig-role  { font-size: 9px; font-weight: 800; color: #1e3a8a; margin-bottom: 12px; }
    .sig-name  { font-size: 8px; color: #64748b; }

    @media print {
      body { zoom: 100%; }
      .report-wrap { width: 100% !important; max-width: 100% !important; }
    }
  </style>
</head>
<body>
  <div class="report-wrap">
    <div class="royal-header">
      <div class="co-title-box">
        <div class="co-logo-circle">🏢</div>
        <div>
          <div class="co-name">${coName}</div>
          <div class="co-sub">${coSub}</div>
        </div>
      </div>
      <div class="doc-badge-center">
        <div class="doc-main-title">التقرير التنفيذي الشامل لأداء ومبيعات وهوامش أرباح المناديب والمستهدف الشهري</div>
        <div class="doc-period-text">📅 الفترة: من ${formatDate(from)} إلى ${formatDate(to)} &nbsp;|&nbsp; النطاق: ${repLabel} &nbsp;|&nbsp; هامش الربح الإجمالي: ${grand.periodMarginPct.toFixed(1)}%</div>
      </div>
      <div class="meta-box-left">
        <div><strong>الرقم الضريبي:</strong> ${vatNum}</div>
        <div><strong>السجل التجاري:</strong> ${crNum}</div>
        <div><strong>تاريخ الطباعة:</strong> ${printDateStr} — ${printTimeStr}</div>
      </div>
    </div>

    <!-- كروت KPI السريعة مع قبل الضريبة وتحصيل اليوم -->
    <div class="kpi-row">
      <div class="kpi-item cyan">
        <div class="kpi-label">⚡ مبيعات اليوم (صافي)</div>
        <div class="kpi-val" style="color:#0891b2;">${formatCurrency(grand.todaySales)}</div>
        <div class="kpi-before" style="color:#0284c7;">قبل: ${formatCurrency(grand.todaySubtotal)}</div>
      </div>
      <div class="kpi-item amber">
        <div class="kpi-label">💵 تحصيل اليوم</div>
        <div class="kpi-val" style="color:#d97706;">${formatCurrency(grand.todayCol)}</div>
        <div class="kpi-note">نقد: ${formatCurrency(grand.todayCashCol)} • شبكة: ${formatCurrency(grand.todayBankCol)}</div>
      </div>
      <div class="kpi-item green">
        <div class="kpi-label">📈 صافي مبيعات الفترة</div>
        <div class="kpi-val" style="color:#059669;">${formatCurrency(grand.periodSales)}</div>
        <div class="kpi-before" style="color:#047857;">قبل: ${formatCurrency(grand.periodSubtotal)}</div>
      </div>
      <div class="kpi-item blue">
        <div class="kpi-label">💳 إجمالي التحصيلات والربحية</div>
        <div class="kpi-val" style="color:#2563eb;">${formatCurrency(grand.totalCol)}</div>
        <div class="kpi-before" style="color:#047857;">📈 مجمل أرباح الفترة: ${formatCurrency(grand.periodProfit || 0)} (${grand.periodMarginPct.toFixed(1)}%)</div>
      </div>
      <div class="kpi-item purple">
        <div class="kpi-label">🗓️ مبيعات الشهر MTD</div>
        <div class="kpi-val" style="color:#7c3aed;">${formatCurrency(grand.mtdSales)}</div>
        <div class="kpi-before" style="color:#6366f1;">قبل: ${formatCurrency(grand.mtdSubtotal)}</div>
      </div>
      <div class="kpi-item emerald">
        <div class="kpi-label">🎯 تحقيق المستهدف</div>
        <div class="kpi-val" style="color:#059669;">${grand.targetPct.toFixed(1)}%</div>
        <div class="kpi-note">كفاءة التحصيل: ${grand.collectionRate.toFixed(1)}%</div>
      </div>
    </div>

    ${chartTargetImg || chartShareImg ? `
      <div class="charts-row">
        ${chartTargetImg ? `
          <div class="chart-box" style="flex:2;">
            <div class="chart-box-title">📊 المبيعات التراكمية (MTD) مقابل الهدف الشهري (Target) لكل مندوب</div>
            <img src="${chartTargetImg}" class="chart-img" alt="Sales vs Target" />
          </div>
        ` : ''}
        ${chartShareImg ? `
          <div class="chart-box" style="flex:1;">
            <div class="chart-box-title">🥧 الحصة البيعية للمناديب (Market Share)</div>
            <img src="${chartShareImg}" class="chart-img" alt="Market Share" />
          </div>
        ` : ''}
      </div>
    ` : ''}

    <div class="table-card">
      <div class="tbl-banner">
        <span>📋 جدول أداء ومبيعات وتحصيلات وهوامش أرباح المناديب والمستهدف الشهري</span>
        <span style="color:#fef08a;">(جميع المبالغ بالريال السعودي ر.س)</span>
      </div>
      <table class="rep-tbl">
        <colgroup>
          <col style="width:2.5%;">
          <col style="width:11%;">
          <col style="width:8%;">
          <col style="width:6.5%;">
          <col style="width:8%;">
          <col style="width:4.5%;">
          <col style="width:6%;">
          <col style="width:6.5%;">
          <col style="width:6.5%;">
          <col style="width:7%;">
          <col style="width:6.5%;">
          <col style="width:8.5%;">
          <col style="width:7.5%;">
          <col style="width:5%;">
          <col style="width:6%;">
        </colgroup>
        <thead>
          <tr>
            <th>#</th>
            <th style="text-align:right;">👤 المندوب</th>
            <th>⚡ ${from === to ? `مبيعات (${formatDate(to)})` : 'مبيعات اليوم'}</th>
            <th>💵 ${from === to ? `تحصيل (${formatDate(to)})` : 'تحصيل اليوم'}</th>
            <th>📈 صافي الفترة</th>
            <th>🧾 الفواتير</th>
            <th>📊 متوسط الفاتورة</th>
            <th>💵 تحصيل نقدي</th>
            <th>🏦 تحصيل شبكة</th>
            <th>💰 إجمالي التحصيل</th>
            <th style="background:#065f46; color:#fef08a;">📈 مجمل الربح (الهامش %)</th>
            <th>🗓️ مبيعات الشهر</th>
            <th>🎯 الهدف الشهري</th>
            <th>🏁 نسبة التارجت</th>
            <th>⚖️ نسبة التحصيل</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
        <tfoot>
          <tr>
            <td style="font-size:11px; font-weight:900;">Σ</td>
            <td style="text-align:right; font-weight:900; color:#1e3a8a; font-size:11px;">الإجمالي العام</td>
            
            <td style="background:rgba(2,132,199,0.04);">
              <div style="font-family:monospace; color:#0284c7; font-weight:900; font-size:10.5px;">${fmtNum(grand.todaySales)}</div>
              <div style="font-size:8px; color:#475569; font-family:monospace; font-weight:700;">قبل: ${fmtNum(grand.todaySubtotal)}</div>
            </td>

            <td style="background:rgba(245,158,11,0.04); font-family:monospace; font-weight:900; color:#b45309; font-size:10.5px;">
              ${fmtNum(grand.todayCol)}
            </td>

            <td style="background:rgba(5,150,105,0.04);">
              <div style="font-family:monospace; color:#047857; font-weight:900; font-size:10.5px;">${fmtNum(grand.periodSales)}</div>
              <div style="font-size:8px; color:#0e7490; font-family:monospace; font-weight:700;">قبل: ${fmtNum(grand.periodSubtotal)}</div>
            </td>

            <td style="font-family:monospace; font-weight:900; font-size:10.5px; color:#1e293b;">${grand.invoiceCount}${grand.returnCount > 0 ? ` (-${grand.returnCount})` : ''}</td>
            <td style="font-family:monospace; font-weight:800; font-size:10px; color:#334155;">${fmtNum(grand.avgInvoice)}</td>
            <td style="font-family:monospace; color:#b45309; font-weight:900; font-size:10.5px;">${fmtNum(grand.cashCol)}</td>
            <td style="font-family:monospace; color:#1d4ed8; font-weight:900; font-size:10.5px;">${fmtNum(grand.bankCol)}</td>
            <td style="font-family:monospace; color:#1e3a8a; font-weight:900; font-size:11px;">${fmtNum(grand.totalCol)}</td>

            <!-- إجمالي مجمل الربح للشركة -->
            <td style="font-family:monospace; color:#047857; font-weight:900; font-size:10.5px; background:rgba(16,185,129,0.08);">
              <div>${fmtNum(grand.periodProfit || 0)}</div>
              <div style="font-size:8px; color:#334155; font-weight:700;">تكلفة: ${fmtNum(grand.periodNetCogs || 0)}</div>
              <span style="font-size:8.5px; color:${grand.periodProfit >= 0 ? '#059669' : '#dc2626'}; font-weight:800;">(${grand.periodMarginPct.toFixed(1)}%)</span>
            </td>

            <td style="background:rgba(79,70,229,0.04);">
              <div style="font-family:monospace; color:#4338ca; font-weight:900; font-size:10.5px;">${fmtNum(grand.mtdSales)}</div>
              <div style="font-size:8px; color:#6366f1; font-family:monospace; font-weight:700;">قبل: ${fmtNum(grand.mtdSubtotal)}</div>
            </td>

            <td style="font-family:monospace; font-weight:900; font-size:10.5px; color:#334155;">${fmtNum(grand.monthlyTarget)}</td>
            <td style="font-family:monospace; color:#1e3a8a; font-weight:900; font-size:11px;">${grand.targetPct.toFixed(1)}%</td>
            <td style="font-family:monospace; color:#047857; font-weight:900; font-size:11px;">${grand.collectionRate.toFixed(1)}%</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="footer-signatures">
      <div class="sig-block">
        <div class="sig-role">إعداد مشرف المبيعات</div>
        <div class="sig-name">الاسم والتوقيع: __________________</div>
      </div>
      <div class="sig-block">
        <div class="sig-role">تدقيق الإدارة المالية والحسابات</div>
        <div class="sig-name">الاسم والتوقيع: __________________</div>
      </div>
      <div class="sig-block">
        <div class="sig-role">اعتماد المدير العام / الرئيس التنفيذي</div>
        <div class="sig-name">الختم والتوقيع: __________________</div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(printDocHtml);
  printWindow.document.close();
};

/**
 * ═══════════════════════════════════════════════════════════
 * محرك طباعة اليومية التفصيلية المستقل (A4 Multi-Page Print Engine)
 * ═══════════════════════════════════════════════════════════
 */
window.printRepDailyReport = () => {
  if (!_currentReportRows || _currentReportRows.length === 0) {
    alert("يرجى عرض اليومية أولاً قبل الطباعة");
    return;
  }

  const { dateRange, repLabel, custMap, repMap, repBoxNameMap } = _currentReportMeta;
  const co = window.ERP_COMPANY || {};
  const coName = co.name || "مؤسسة أدهام للمواد الغذائية";
  const coSub  = co.activity || "تجارة وتوريد المواد الغذائية بالجملة والتموين — ينبع البحر";
  const vatNum = co.vatNumber || "";
  const crNum  = co.crNumber || "";
  const printDateStr = new Date().toLocaleDateString("ar-SA");
  const printTimeStr = new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("يرجى السماح بالنوافذ المنبثقة لطباعة التقرير");
    return;
  }

  // فلترة الأيام النشطة فقط التي تحتوي على مبيعات أو تحصيلات أو مصروفات
  const activeRows = _currentReportRows.filter(r => {
    const hasInv = r.invoices && r.invoices.length > 0;
    const hasRc  = r.receipts && r.receipts.length > 0;
    const hasOut = r.cashOuts && r.cashOuts.length > 0;
    const hasRet = r.returns && r.returns.length > 0;
    const hasVal = Math.abs(r.totalSales || 0) > 0.001 || 
                   Math.abs(r.totalCol || 0) > 0.001 || 
                   Math.abs(r.totalCashOut || 0) > 0.001;
    return hasInv || hasRc || hasOut || hasRet || hasVal;
  });

  const rowsToPrint = activeRows.length > 0 ? activeRows : _currentReportRows;
  const isMultiDay = rowsToPrint.length > 1;
  const totalPages = isMultiDay ? rowsToPrint.length + 1 : 1;

  // 1. صفحة الملخص التنفيذي التراكمي في حال طباعة فترة بها أكثر من يوم نشط
  let summarySheetHtml = "";
  if (isMultiDay) {
    const pGrand = rowsToPrint.reduce((acc, r) => {
      acc.totalSales       += (r.totalSales || 0);
      acc.cashCol          += (r.cashCol || 0);
      acc.bankCol          += (r.bankCol || 0);
      acc.totalCol         += (r.totalCol || 0);
      acc.pureExpenses     += (r.pureExpenses || 0);
      acc.totalCashOut     += (r.totalCashOut || 0);
      acc.netBoxTotal      += (r.netBoxDay || 0);
      acc.totActualHandover+= (r.isEnhanced ? (r.totActualHandover || 0) : (r.treasuryTransfers || 0));
      acc.clearanceDiff    += (r.isEnhanced ? (r.clearanceDiff || 0) : 0);
      acc.invCount         += (r.invoices?.length || 0);
      acc.rcCount          += (r.receipts?.length || 0);
      acc.outCount         += (r.cashOuts?.length || 0);
      return acc;
    }, { totalSales:0, cashCol:0, bankCol:0, totalCol:0, pureExpenses:0, totalCashOut:0, netBoxTotal:0, totActualHandover:0, clearanceDiff:0, invCount:0, rcCount:0, outCount:0 });

    const summaryTableRows = rowsToPrint.map((r, sIdx) => {
      const repNameStr = repMap[r.repId] || r.repId || "مندوب";
      const actualHandover = r.isEnhanced ? (r.totActualHandover || 0) : (r.treasuryTransfers || 0);
      const diff = r.isEnhanced ? (r.clearanceDiff || 0) : 0;
      const isMatched = Math.abs(diff) < 0.05;
      const statusText = isMatched ? "✅ مقفل" : diff < 0 ? `⚠️ متبقي` : `ℹ️ فائض`;
      const statusColor = isMatched ? "#059669" : diff < 0 ? "#dc2626" : "#2563eb";

      return `
        <tr>
          <td style="font-weight:bold; color:#64748b; font-size:10px;">${sIdx + 1}</td>
          <td style="font-family:monospace; font-weight:bold; color:#1e3a8a; font-size:10px;">${r.date}</td>
          <td style="text-align:right; font-weight:800; font-size:10.5px;">${repNameStr}</td>
          <td style="font-family:monospace; font-weight:bold; color:#059669; text-align:left; font-size:10px;">${formatCurrency(r.totalSales)}</td>
          <td style="font-family:monospace; font-weight:bold; color:#d97706; text-align:left; font-size:10px;">${formatCurrency(r.cashCol)}</td>
          <td style="font-family:monospace; font-weight:bold; color:#2563eb; text-align:left; font-size:10px;">${formatCurrency(r.bankCol)}</td>
          <td style="font-family:monospace; font-weight:bold; color:#dc2626; text-align:left; font-size:10px;">${formatCurrency(r.pureExpenses)}</td>
          <td style="font-family:monospace; font-weight:900; color:#0f172a; text-align:left; background:rgba(15,23,42,0.04); font-size:10.5px;">${formatCurrency(r.netBoxDay)}</td>
          <td style="font-family:monospace; font-weight:900; color:#0284c7; text-align:left; background:rgba(2,132,199,0.06); font-size:10.5px;">${formatCurrency(actualHandover)}</td>
          <td style="font-family:monospace; font-weight:900; color:${statusColor}; text-align:left; font-size:10.5px;">${formatCurrency(diff)}</td>
          <td style="font-size:10px; font-weight:900; color:${statusColor}; text-align:center;">${statusText}</td>
        </tr>
      `;
    }).join("");

    summarySheetHtml = `
      <div class="print-sheet">
        <div class="print-header">
          <div style="text-align:right;">
            <div class="co-name">${coName}</div>
            <div class="co-sub">${coSub}</div>
          </div>
          <div style="text-align:center;">
            <div class="report-title">ملخص حركة يوميات المناديب وتوريدات الخزينة والتسوية</div>
            <div class="report-period">📅 الفترة: ${dateRange} &nbsp;|&nbsp; النطاق: ${repLabel}</div>
          </div>
          <div class="meta-box">
            <div>${printDateStr} — ${printTimeStr}</div>
            ${vatNum ? `<div>الرقم الضريبي: ${vatNum}</div>` : ''}
            <div class="page-badge">الصفحة 1 من ${totalPages}</div>
          </div>
        </div>

        <div class="rep-card-header">
          <div>
            <div class="rep-title">📊 الملخص الإجمالي التراكمي لحركة وتصفية الفترة</div>
            <div class="rep-sub">👤 النطاق: ${repLabel} &nbsp;|&nbsp; 🗓️ عدد الأيام النشطة: ${rowsToPrint.length} يوم عمل &nbsp;|&nbsp; 🤝 المورد فعلياً للجاري/الخزينة: <strong style="color:#fef08a; font-family:monospace;">${formatCurrency(pGrand.totActualHandover)}</strong></div>
          </div>
          <div style="text-align:left;">
            <div class="net-box-label">صافي النقد المفترض توريده:</div>
            <div class="net-box-val">${formatCurrency(pGrand.netBoxTotal)}</div>
          </div>
        </div>

        <div class="kpi-print-row">
          <div class="kpi-box" style="border-top:3.5px solid #059669;">
            <div class="kpi-lbl">📈 إجمالي المبيعات</div>
            <div class="kpi-val" style="color:#059669;">${formatCurrency(pGrand.totalSales)}</div>
            <div style="font-size:9.5px; color:#64748b; font-weight:700; margin-top:2px;">${pGrand.invCount} فاتورة</div>
          </div>
          <div class="kpi-box" style="border-top:3.5px solid #d97706;">
            <div class="kpi-lbl">💵 التحصيل النقدي</div>
            <div class="kpi-val" style="color:#d97706;">${formatCurrency(pGrand.cashCol)}</div>
          </div>
          <div class="kpi-box" style="border-top:3.5px solid #dc2626;">
            <div class="kpi-lbl">💸 المصروفات والسلف (-)</div>
            <div class="kpi-val" style="color:#dc2626;">${formatCurrency(pGrand.pureExpenses)}</div>
            <div style="font-size:9.5px; color:#64748b; font-weight:700; margin-top:2px;">${pGrand.outCount} حركة</div>
          </div>
          <div class="kpi-box" style="border-top:3.5px solid #0f172a; background:rgba(15,23,42,0.03);">
            <div class="kpi-lbl">🏦 صافي المفترض توريده</div>
            <div class="kpi-val" style="color:#0f172a;">${formatCurrency(pGrand.netBoxTotal)}</div>
          </div>
          <div class="kpi-box" style="border-top:3.5px solid #0284c7; background:rgba(2,132,199,0.06);">
            <div class="kpi-lbl">🤝 المورد فعلياً للجاري/الخزينة</div>
            <div class="kpi-val" style="color:#0284c7;">${formatCurrency(pGrand.totActualHandover)}</div>
          </div>
          <div class="kpi-box" style="border-top:3.5px solid ${Math.abs(pGrand.clearanceDiff) < 0.05 ? '#059669' : '#dc2626'}; background:rgba(5,150,105,0.06);">
            <div class="kpi-lbl">⚖️ الرصيد المتبقي بالصناديق</div>
            <div class="kpi-val" style="color:${Math.abs(pGrand.clearanceDiff) < 0.05 ? '#059669' : '#dc2626'};">${formatCurrency(pGrand.clearanceDiff)}</div>
            <div style="font-size:9.5px; color:${Math.abs(pGrand.clearanceDiff) < 0.05 ? '#059669' : '#dc2626'}; font-weight:800; margin-top:2px;">${Math.abs(pGrand.clearanceDiff) < 0.05 ? '✅ مطابق ومقفل 100%' : 'يوجد فوارق'}</div>
          </div>
        </div>

        <div class="table-card">
          <div class="tbl-head-banner s">
            <span>📋 كشف تفريغ اليوميات المجمعة والتوريدات الفعلية للأيام النشطة للفترة (${rowsToPrint.length} يوم)</span>
            <span style="font-family:monospace; font-size:11.5px; font-weight:900;">المورد الفعلي: ${formatCurrency(pGrand.totActualHandover)}</span>
          </div>
          <table class="data-tbl">
            <thead>
              <tr>
                <th style="width:26px;">#</th>
                <th style="width:78px;">التاريخ</th>
                <th style="text-align:right;">المندوب</th>
                <th style="width:85px; text-align:left;">المبيعات</th>
                <th style="width:80px; text-align:left;">تحصيل نقد</th>
                <th style="width:80px; text-align:left;">تحصيل بنك</th>
                <th style="width:75px; text-align:left;">المصروفات</th>
                <th style="width:88px; text-align:left; background:#1e293b;">المطلوب توريده</th>
                <th style="width:92px; text-align:left; background:#0369a1;">المورد للجاري/الخزينة</th>
                <th style="width:82px; text-align:left; background:#065f46;">المتبقي بالصندوق</th>
                <th style="width:78px; text-align:center;">حالة الإقفال</th>
              </tr>
            </thead>
            <tbody>${summaryTableRows}</tbody>
            <tfoot>
              <tr>
                <td>Σ</td>
                <td colspan="2" style="text-align:right;">الإجمالي العام للفترة</td>
                <td style="font-family:monospace; font-weight:bold; color:#059669; text-align:left;">${formatCurrency(pGrand.totalSales)}</td>
                <td style="font-family:monospace; font-weight:bold; color:#d97706; text-align:left;">${formatCurrency(pGrand.cashCol)}</td>
                <td style="font-family:monospace; font-weight:bold; color:#2563eb; text-align:left;">${formatCurrency(pGrand.bankCol)}</td>
                <td style="font-family:monospace; font-weight:bold; color:#dc2626; text-align:left;">${formatCurrency(pGrand.pureExpenses)}</td>
                <td style="font-family:monospace; font-weight:900; color:#0f172a; text-align:left; background:rgba(15,23,42,0.06); font-size:11.5px;">${formatCurrency(pGrand.netBoxTotal)}</td>
                <td style="font-family:monospace; font-weight:900; color:#0284c7; text-align:left; background:rgba(2,132,199,0.1); font-size:11.5px;">${formatCurrency(pGrand.totActualHandover)}</td>
                <td style="font-family:monospace; font-weight:900; color:${Math.abs(pGrand.clearanceDiff) < 0.05 ? '#059669' : '#dc2626'}; text-align:left; font-size:11.5px;">${formatCurrency(pGrand.clearanceDiff)}</td>
                <td style="font-size:10px; font-weight:900; color:${Math.abs(pGrand.clearanceDiff) < 0.05 ? '#059669' : '#dc2626'}; text-align:center;">${Math.abs(pGrand.clearanceDiff) < 0.05 ? '✅ مقفل ومطابق' : 'يوجد فوارق'}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="formula-strip" style="background:#f8fafc; border:1.5px solid #0284c7; flex-direction:column; gap:6px; align-items:stretch; border-radius:8px; padding:8px 12px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>💵 إجمالي التحصيل النقدي: <strong style="color:#059669; font-family:monospace; font-size:12.5px;">${formatCurrency(pGrand.cashCol)}</strong></div>
            <div style="color:#64748b; font-weight:bold;">➖</div>
            <div>💸 إجمالي المصروفات والسلف: <strong style="color:#dc2626; font-family:monospace; font-size:12.5px;">-${formatCurrency(pGrand.pureExpenses)}</strong></div>
            <div style="color:#64748b; font-weight:bold;">🟰</div>
            <div>🏦 صافي النقد المفترض توريده: <strong style="color:#0f172a; font-family:monospace; font-size:13px;">${formatCurrency(pGrand.netBoxTotal)}</strong></div>
          </div>
          <div style="border-top:1px dashed #cbd5e1; padding-top:6px; display:flex; justify-content:space-between; align-items:center; font-size:11px;">
            <div>🤝 المبالغ الموردة فعلياً للجاري / الخزينة: <strong style="color:#0284c7; font-family:monospace; font-size:13px;">${formatCurrency(pGrand.totActualHandover)}</strong></div>
            <div>فارق الإقفال والرصيد المتبقي: <strong style="color:${Math.abs(pGrand.clearanceDiff) < 0.05 ? '#059669' : '#dc2626'}; font-family:monospace; font-size:13px;">${formatCurrency(pGrand.clearanceDiff)}</strong></div>
            <div>حالة التصفية: <strong style="color:${Math.abs(pGrand.clearanceDiff) < 0.05 ? '#059669' : '#dc2626'}; font-size:11.5px;">${Math.abs(pGrand.clearanceDiff) < 0.05 ? '✅ تم التوريد والإقفال بالكامل (مطابق 100%)' : '⚠️ يوجد مبالغ متبقية بالصناديق'}</strong></div>
          </div>
        </div>

        <div class="signatures-grid">
          <div class="sig-col">
            <div class="sig-title">إعداد وتوريد المندوب المسلّم</div>
            <div class="sig-line"></div>
            <div style="font-size:10px; color:#64748b; margin-top:4px;">التوقيع: __________________</div>
          </div>
          <div class="sig-col">
            <div class="sig-title">استلام أمين الخزينة / الصندوق</div>
            <div class="sig-line"></div>
            <div style="font-size:10px; color:#64748b; margin-top:4px;">التوقيع: __________________</div>
          </div>
          <div class="sig-col">
            <div class="sig-title">اعتماد الإدارة المالية والتدقيق</div>
            <div class="sig-line"></div>
            <div style="font-size:10px; color:#64748b; margin-top:4px;">الختم والتوقيع: __________________</div>
        </div>
      </div>
    `;
  }

  // 2. صفحات اليوميات التفصيلية لكل يوم نشط
  const sheetsHtml = rowsToPrint.map((r, idx) => {
    const pageNum = isMultiDay ? idx + 2 : idx + 1;
    const repNameStr = repMap[r.repId] || r.repId || "مندوب";
    const boxNameStr = repBoxNameMap[r.repId] || "صندوق المندوب";

    // أ) فواتير المبيعات
    const invRows = r.invoices.length === 0
      ? `<tr><td colspan="4" style="text-align:center; padding:9px; color:#94a3b8; font-weight:700;">لا توجد فواتير مبيعات مسجلة في هذا اليوم</td></tr>`
      : r.invoices.map(inv => `
          <tr>
            <td style="font-family:monospace; font-weight:bold; color:#1e3a8a; font-size:11.5px;">${inv.code || inv.invoiceNumber || inv.id.slice(-6)}</td>
            <td style="text-align:right; font-weight:700; font-size:11.5px;">${custMap[inv.customerId] || "عميل"}</td>
            <td style="font-size:11px;">${inv.paymentMethod === 'cash' ? '💵 نقدي' : inv.paymentMethod === 'bank' ? '🏦 تحويل / شبكة' : '📑 آجل'}</td>
            <td style="font-family:monospace; font-weight:bold; color:#059669; text-align:left; font-size:12px;">${formatCurrency(inv.totalWithVat || inv.total || 0)}</td>
          </tr>
        `).join("");

    // ب) مردودات المبيعات (إن وجدت)
    let retSection = "";
    if (r.returns && r.returns.length > 0) {
      let retTot = 0;
      const retRows = r.returns.map(ret => {
        const a = parseFloat(ret.totalWithVat || ret.total || 0);
        retTot += a;
        return `
          <tr>
            <td style="font-family:monospace; font-weight:bold; color:#dc2626; font-size:11.5px;">${ret.number || ret.creditNoteNumber || ret.id.slice(-6)}</td>
            <td style="text-align:right; font-weight:700; font-size:11.5px;">${custMap[ret.customerId] || ret.customerName || "عميل"}</td>
            <td><span style="background:rgba(239,68,68,0.12); color:#dc2626; border:1px solid rgba(239,68,68,0.3); padding:2px 8px; border-radius:4px; font-weight:bold; font-size:10.5px;">↩️ إشعار دائن</span></td>
            <td style="font-family:monospace; font-weight:bold; color:#dc2626; text-align:left; font-size:12px;">-${formatCurrency(a)}</td>
          </tr>
        `;
      }).join("");

      retSection = `
        <div class="table-card" style="border-color:#fca5a5;">
          <div class="tbl-head-banner r">
            <span>↩️ مردودات المبيعات (إشعارات دائنة)</span>
            <span style="font-family:monospace; font-size:12px;">-${formatCurrency(retTot)}</span>
          </div>
          <table class="data-tbl">
            <thead><tr><th style="width:120px;">رقم الإشعار</th><th style="text-align:right;">اسم العميل</th><th style="width:110px;">النوع</th><th style="width:130px; text-align:left;">المبلغ المسترد</th></tr></thead>
            <tbody>${retRows}</tbody>
            <tfoot><tr><td colspan="3" style="text-align:right;">إجمالي المردودات (${r.returns.length} إشعار دائن)</td><td style="font-family:monospace; font-weight:bold; color:#dc2626; text-align:left;">-${formatCurrency(retTot)}</td></tr></tfoot>
          </table>
        </div>
      `;
    }

    // ج) سندات التحصيل
    const rcRows = r.receipts.length === 0
      ? `<tr><td colspan="4" style="text-align:center; padding:9px; color:#94a3b8; font-weight:700;">لا توجد تحصيلات أو مقبوضات مسجلة في هذا اليوم</td></tr>`
      : r.receipts.map(rc => {
          const m = rc.method || rc.paymentMethod || "cash";
          const a = parseFloat(rc.amount || 0);
          return `
            <tr>
              <td style="font-family:monospace; font-weight:bold; color:#1e3a8a; font-size:11.5px;">${rc.code || rc.id.slice(-6)}</td>
              <td style="text-align:right; font-weight:700; font-size:11.5px;">${custMap[rc.targetId] || rc.accountName || "عميل"}</td>
              <td style="font-size:11px;">${isBank(m) ? '🏦 بنك / شبكة' : '💵 نقدي'}</td>
              <td style="font-family:monospace; font-weight:bold; color:${isBank(m)?'#2563eb':'#d97706'}; text-align:left; font-size:12px;">${formatCurrency(a)}</td>
            </tr>
          `;
        }).join("");

    // د) المصروفات والسلف
    const outRows = r.cashOuts.length === 0
      ? `<tr><td colspan="4" style="text-align:center; padding:9px; color:#94a3b8; font-weight:700;">لا توجد مصروفات أو مسحوبات نقدية من الصندوق في هذا اليوم</td></tr>`
      : r.cashOuts.map(co => {
          const bStyle = co.isTransfer ? "background:rgba(14,165,233,0.12); color:#0369a1; border:1px solid rgba(14,165,233,0.3);" : "background:rgba(239,68,68,0.12); color:#dc2626; border:1px solid rgba(239,68,68,0.3);";
          return `
            <tr>
              <td style="font-family:monospace; font-size:11px; color:#64748b; font-weight:bold;">${co.refNumber}</td>
              <td style="text-align:right; font-weight:700; font-size:11.5px; color:${co.isTransfer ? '#0369a1' : '#991b1b'};">${co.description}</td>
              <td><span style="${bStyle} padding:2px 8px; border-radius:4px; font-size:10.5px; font-weight:bold;">${co.typeBadge}</span></td>
              <td style="font-family:monospace; font-weight:bold; color:${co.isTransfer ? '#0369a1' : '#dc2626'}; text-align:left; font-size:12px;">${formatCurrency(co.amount)}</td>
            </tr>
          `;
        }).join("");

    return `
      <div class="print-sheet">
        <div class="print-header">
          <div style="text-align:right;">
            <div class="co-name">${coName}</div>
            <div class="co-sub">${coSub}</div>
          </div>
          <div style="text-align:center;">
            <div class="report-title">يومية المندوب وخزينة المبيعات</div>
            <div class="report-period">📅 التاريخ: ${r.date} &nbsp;|&nbsp; المندوب: ${repNameStr}</div>
          </div>
          <div class="meta-box">
            <div>${printDateStr} — ${printTimeStr}</div>
            ${vatNum ? `<div>الرقم الضريبي: ${vatNum}</div>` : ''}
            <div class="page-badge">الصفحة ${pageNum} من ${totalPages}</div>
          </div>
        </div>

        <div class="rep-card-header">
          <div>
            <div class="rep-title">👤 المندوب المسؤول: ${repNameStr}</div>
            <div class="rep-sub">📅 تاريخ اليومية: ${r.date} &nbsp;|&nbsp; 📦 الصندوق: ${boxNameStr}</div>
          </div>
          <div style="text-align:left;">
            <div class="net-box-label">${r.isEnhanced ? 'صافي النقد المفترض توريده:' : 'صافي نقدية العهدة اليوم:'}</div>
            <div class="net-box-val">${formatCurrency(r.isEnhanced ? r.netBoxRequired : r.netBoxDay)}</div>
          </div>
        </div>

        <div class="kpi-print-row">
          <div class="kpi-box" style="border-top:3.5px solid #059669;">
            <div class="kpi-lbl">📈 إجمالي المبيعات</div>
            <div class="kpi-val" style="color:#059669;">${formatCurrency(r.totalSales)}</div>
            <div style="font-size:9.5px; color:#64748b; font-weight:700; margin-top:2px;">${r.invoices.length} فاتورة</div>
          </div>
          <div class="kpi-box" style="border-top:3.5px solid #d97706;">
            <div class="kpi-lbl">💵 التحصيل النقدي</div>
            <div class="kpi-val" style="color:#d97706;">${formatCurrency(r.cashCol)}</div>
          </div>
          <div class="kpi-box" style="border-top:3.5px solid #2563eb;">
            <div class="kpi-lbl">🏦 تحصيل بنك / شبكة</div>
            <div class="kpi-val" style="color:#2563eb;">${formatCurrency(r.bankCol)}</div>
          </div>
          <div class="kpi-box" style="border-top:3.5px solid #dc2626;">
            <div class="kpi-lbl">💸 المصروفات والسلف (-)</div>
            <div class="kpi-val" style="color:#dc2626;">${formatCurrency(r.pureExpenses)}</div>
            <div style="font-size:9.5px; color:#64748b; font-weight:700; margin-top:2px;">${r.cashOuts.length} حركة</div>
          </div>
          <div class="kpi-box" style="border-top:3.5px solid #047857; background:rgba(4,120,87,0.06);">
            <div class="kpi-lbl">🏦 ${r.isEnhanced ? 'المطلوب توريده' : 'صافي النقد للتوريد'}</div>
            <div class="kpi-val" style="color:#047857;">${formatCurrency(r.isEnhanced ? r.netBoxRequired : r.netBoxDay)}</div>
          </div>
        </div>

        ${r.isEnhanced && r.totCentralAdv > 0 ? `
          <div style="background:#f0f9ff; border:1.2px solid #38bdf8; border-radius:6px; padding:6px 10px; margin-bottom:8px; font-size:10px; font-weight:700; color:#0369a1; page-break-inside:avoid;">
            💳 <strong>سلف شخصية من الخزينة المركزية (استقطاع راتب شهري):</strong> ${formatCurrency(r.totCentralAdv)} — (صُرفت من الخزينة المركزية، ولا تخصم من نقدية توريد سيارة المبيعات الميدانية).
          </div>
        ` : ''}

        <div class="tables-section">
          <!-- 1. فواتير المبيعات -->
          <div class="table-card">
            <div class="tbl-head-banner s">
              <span>📈 1. فواتير المبيعات الصادرة</span>
              <span style="font-family:monospace; font-size:12px;">${formatCurrency(r.totalSales)}</span>
            </div>
            <table class="data-tbl">
              <thead><tr><th style="width:115px;">رقم الفاتورة</th><th style="text-align:right;">اسم العميل</th><th style="width:105px;">الدفع</th><th style="width:125px; text-align:left;">المبلغ شامل الضريبة</th></tr></thead>
              <tbody>${invRows}</tbody>
              <tfoot><tr><td colspan="3" style="text-align:right;">الإجمالي (${r.invoices.length} فاتورة)</td><td style="font-family:monospace; font-weight:bold; color:#059669; text-align:left;">${formatCurrency(r.totalSales)}</td></tr></tfoot>
            </table>
          </div>

          <!-- مردودات المبيعات إن وجدت -->
          ${retSection}

          <!-- 2. التحصيلات والمقبوضات -->
          <div class="table-card">
            <div class="tbl-head-banner c">
              <span>💰 2. سندات التحصيل والقبض (المقبوضات)</span>
              <span style="font-family:monospace; font-size:12px;">${formatCurrency(r.totalCol)}</span>
            </div>
            <table class="data-tbl">
              <thead><tr><th style="width:115px;">رقم السند</th><th style="text-align:right;">العميل / الحساب</th><th style="width:105px;">طريقة التحصيل</th><th style="width:125px; text-align:left;">المبلغ المحصل</th></tr></thead>
              <tbody>${rcRows}</tbody>
              <tfoot><tr><td colspan="3" style="text-align:right;">إجمالي التحصيل (${r.receipts.length} سند) &nbsp;—&nbsp; <span style="color:#d97706;">💵 نقدي: ${formatCurrency(r.cashCol)}</span> &nbsp;•&nbsp; <span style="color:#2563eb;">🏦 بنك: ${formatCurrency(r.bankCol)}</span></td><td style="font-family:monospace; font-weight:bold; color:#2563eb; text-align:left;">${formatCurrency(r.totalCol)}</td></tr></tfoot>
            </table>
          </div>

          <!-- 3. المصروفات والسلف -->
          <div class="table-card">
            <div class="tbl-head-banner e">
              <span>💸 3. المصروفات والسلف ومسحوبات الصندوق</span>
              <span style="font-family:monospace; font-size:12px;">${formatCurrency(r.totalCashOut)}</span>
            </div>
            <table class="data-tbl">
              <thead><tr><th style="width:115px;">المرجع</th><th style="text-align:right;">البيان والتفاصيل</th><th style="width:105px;">النوع</th><th style="width:125px; text-align:left;">المبلغ المنصرف</th></tr></thead>
              <tbody>${outRows}</tbody>
              <tfoot><tr><td colspan="3" style="text-align:right;">إجمالي المصروفات والسلف (${r.cashOuts.length} حركة)</td><td style="font-family:monospace; font-weight:bold; color:#dc2626; text-align:left;">${formatCurrency(r.totalCashOut)}</td></tr></tfoot>
            </table>
          </div>
        </div>

        ${r.isEnhanced ? `
          <div class="formula-strip" style="background:#f8fafc; border:1.5px solid #0284c7; flex-direction:column; gap:6px; align-items:stretch;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>💵 التحصيل النقدي: <strong style="color:#059669; font-family:monospace;">${formatCurrency(r.cashCol)}</strong></div>
              ${r.totCustodyIn > 0 ? `<div>➕ عهدة: <strong style="color:#0284c7; font-family:monospace;">+${formatCurrency(r.totCustodyIn)}</strong></div>` : ''}
              <div>➖ المصروفات والسلف: <strong style="color:#dc2626; font-family:monospace;">-${formatCurrency(r.pureExpenses)}</strong></div>
              <div>🟰 صافي المطلوب توريده: <strong style="color:#0f172a; font-family:monospace; font-size:13.5px;">${formatCurrency(r.netBoxRequired)}</strong></div>
            </div>
            <div style="border-top:1px dashed #cbd5e1; padding-top:4px; display:flex; justify-content:space-between; align-items:center; font-size:11px;">
              <div>🤝 المورد الفعلي للجاري/الخزينة: <strong style="color:#0284c7; font-family:monospace;">${formatCurrency(r.totActualHandover)}</strong></div>
              <div>فارق الإقفال: <strong style="color:${Math.abs(r.clearanceDiff) < 0.05 ? '#059669' : '#dc2626'}; font-family:monospace;">${formatCurrency(r.clearanceDiff)}</strong></div>
              <div>حالة الإقفال: <strong>${r.clearanceStatus === 'MATCHED' ? '✅ مطابق ومقفل بالكامل' : r.clearanceStatus === 'REMAINING' ? '⚠️ متبقي في ذمة المندوب' : 'ℹ️ توريد فائض'}</strong></div>
            </div>
          </div>
        ` : `
          <div class="formula-strip">
            <div>💵 التحصيل النقدي: <strong style="color:#059669; font-family:monospace; font-size:13.5px;">${formatCurrency(r.cashCol)}</strong></div>
            <div style="color:#64748b; font-weight:bold; font-size:15px;">➖</div>
            <div>💸 المصروفات والسلف: <strong style="color:#dc2626; font-family:monospace; font-size:13.5px;">${formatCurrency(r.pureExpenses)}</strong></div>
            <div style="color:#64748b; font-weight:bold; font-size:15px;">🟰</div>
            <div>🏦 صافي النقدية المتاح للتوريد: <strong style="color:#047857; font-family:monospace; font-size:14.5px;">${formatCurrency(r.netBoxDay)}</strong></div>
          </div>
          ${r.treasuryTransfers > 0 ? `<div style="font-size:11px; color:#0369a1; font-weight:bold; text-align:center; margin-bottom:8px;">(تم توريد مبلغ ${formatCurrency(r.treasuryTransfers)} إلى جاري المالك/الخزينة الرئيسية)</div>` : ''}
        `}

        <div class="signatures-grid">
          <div class="sig-col">
            <div class="sig-title">توقيع المندوب المسلّم</div>
            <div class="sig-line"></div>
            <div style="font-size:10px; color:#64748b; margin-top:4px;">التوقيع: __________________</div>
          </div>
          <div class="sig-col">
            <div class="sig-title">توقيع أمين الصندوق / الخزينة</div>
            <div class="sig-line"></div>
            <div style="font-size:10px; color:#64748b; margin-top:4px;">التوقيع: __________________</div>
          </div>
          <div class="sig-col">
            <div class="sig-title">اعتماد الإدارة المالية والتدقيق</div>
            <div class="sig-line"></div>
            <div style="font-size:10px; color:#64748b; margin-top:4px;">الختم والتوقيع: __________________</div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  const printHtml = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>يومية المندوب وخزينة المبيعات — ${repLabel}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    body {
      font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;
      font-size: 11px;
      color: #0f172a;
      background: #fff;
      direction: rtl;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-sheet {
      width: 100%;
      max-width: 195mm;
      margin: 0 auto;
      page-break-after: always;
      break-after: page;
      padding-bottom: 12px;
    }
    .print-sheet:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .print-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2.5px solid #1e3a8a;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .co-name {
      font-size: 16px;
      font-weight: 900;
      color: #1e3a8a;
      line-height: 1.2;
    }
    .co-sub {
      font-size: 10px;
      font-weight: 700;
      color: #475569;
      margin-top: 3px;
    }
    .report-title {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.3px;
    }
    .report-period {
      font-size: 11px;
      font-weight: 800;
      color: #1e3a8a;
      margin-top: 3px;
    }
    .meta-box {
      text-align: left;
      font-size: 10px;
      color: #64748b;
      font-weight: 700;
      line-height: 1.4;
    }
    .page-badge {
      display: inline-block;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 800;
      color: #1e3a8a;
      margin-top: 3px;
    }

    .rep-card-header {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%);
      color: #fff;
      padding: 9px 14px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      border: 1.5px solid #d97706;
      box-shadow: 0 2px 6px rgba(15,23,42,0.1);
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .rep-title {
      font-size: 15px;
      font-weight: 900;
      color: #fff;
      letter-spacing: -0.2px;
    }
    .rep-sub {
      font-size: 11px;
      color: #e2e8f0;
      font-weight: 600;
      margin-top: 3px;
    }
    .net-box-label {
      font-size: 11px;
      color: #e2e8f0;
      font-weight: 700;
    }
    .net-box-val {
      font-size: 18px;
      font-weight: 900;
      font-family: monospace;
      color: #fef08a;
      line-height: 1.2;
    }

    .kpi-print-row {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .kpi-box {
      flex: 1;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 7px 6px;
      text-align: center;
      background: #f8fafc;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .kpi-lbl {
      font-size: 10.5px;
      font-weight: 800;
      color: #475569;
      margin-bottom: 2px;
    }
    .kpi-val {
      font-size: 14.5px;
      font-weight: 900;
      font-family: monospace;
      line-height: 1.2;
    }

    .tables-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 10px;
    }
    .table-card {
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      background: #fff;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .tbl-head-banner {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 900;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .tbl-head-banner.s {
      background: #dcfce7;
      color: #166534;
      border-bottom: 1.5px solid #86efac;
    }
    .tbl-head-banner.c {
      background: #dbeafe;
      color: #1e40af;
      border-bottom: 1.5px solid #93c5fd;
    }
    .tbl-head-banner.e {
      background: #fee2e2;
      color: #991b1b;
      border-bottom: 1.5px solid #fca5a5;
    }
    .tbl-head-banner.r {
      background: #fef3c7;
      color: #92400e;
      border-bottom: 1.5px solid #fcd34d;
    }

    .data-tbl {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .data-tbl thead {
      display: table-header-group;
    }
    .data-tbl tfoot {
      display: table-footer-group;
    }
    .data-tbl tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .data-tbl th {
      background: #0f172a;
      color: #fff;
      padding: 6px 8px;
      font-size: 11px;
      font-weight: 800;
      text-align: center;
      border: 1px solid #1e293b;
      white-space: nowrap;
    }
    .data-tbl td {
      border: 1px solid #e2e8f0;
      padding: 6px 8px;
      text-align: center;
      font-weight: 600;
      color: #0f172a;
      vertical-align: middle;
    }
    .data-tbl tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    .data-tbl tfoot td {
      background: #f1f5f9;
      font-weight: 900;
      font-size: 11.5px;
      border-top: 2px solid #0f172a;
      padding: 6px 8px;
    }

    .formula-strip {
      background: #f0fdf4;
      border: 1.5px solid #10b981;
      border-radius: 8px;
      padding: 9px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 10px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .signatures-grid {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding-top: 10px;
      border-top: 1.5px dashed #cbd5e1;
      margin-top: 10px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .sig-col {
      flex: 1;
      text-align: center;
    }
    .sig-title {
      font-size: 11.5px;
      font-weight: 800;
      color: #1e3a8a;
      margin-bottom: 24px;
    }
    .sig-line {
      font-size: 11px;
      color: #94a3b8;
      border-bottom: 1px dotted #94a3b8;
      width: 80%;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  ${summarySheetHtml}
  ${sheetsHtml}
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(printHtml);
  printWindow.document.close();
};
