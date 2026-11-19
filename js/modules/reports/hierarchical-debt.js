// ============================================================
// IDHAM ERP — Hierarchical Customer Receivables & Debt Report
// تقرير المديونيات الهرمي الشجري v1.0
// 100% معتمد على المستندات التشغيلية الأصلية:
// (فواتير المبيعات + سندات القبض والتحصيل + مردودات المبيعات + الأرصدة الافتتاحية)
// ============================================================

import { COLS, getAll } from "../../utils/db.js";
import { query, where, getDocs, collection, orderBy } from "../../utils/db.js";
import { formatCurrency, formatDate, startOfMonth, todayString } from "../../utils/formatters.js";
import { db, COMPANY_ID } from "../../firebase-config.js";
import { exportXLSX } from "../../utils/export.js";
import { getDefaultCompanyInfo, getHijriDate } from "../agreement-print-template.js";

// State
let rawCustomers = [];
let rawReps = [];
let rawInvoices = [];
let rawReceipts = [];
let rawCollections = [];
let rawReturns = [];
let rawDeliveryNotes = [];
let rawProducts = [];
let prodMap = {};

// ──────────────────────────────────────────
// Column Customization & Print/Export Config
// ──────────────────────────────────────────
const HDEBT_CFG_STORAGE_KEY = "idham_hdebt_export_cfg_v3";

const DEFAULT_COLUMNS_ORDER = [
  { id: "col_code",         enabled: true,  locked: false, weight: 8,  label: "كود العميل",                   short: "الكود",           desc: "الرمز التعريفي للعميل" },
  { id: "col_last_payment", enabled: false, locked: false, weight: 12, label: "آخر تحصيل (مبلغ وتاريخ)",     short: "آخر تحصيل",       desc: "أحدث دفعة مسددة للعميل وتاريخها وعدد الأيام" },
  { id: "_name",            enabled: true,  locked: true,  weight: 20, label: "اسم العميل (أساسي)",           short: "اسم العميل",      desc: "اسم العميل (عمود أساسي يظهر دائماً)" },
  { id: "col_contact",      enabled: true,  locked: false, weight: 13, label: "معلومات العميل (هاتف/منطقة)",  short: "معلومات العميل",  desc: "رقم الهاتف والمنطقة المختصرة" },
  { id: "col_profit",       enabled: false, locked: false, weight: 11, label: "هامش الربح (المبلغ والنسبة)",  short: "هامش الربح",      desc: "صافي الربح (قبل الضريبة - التكلفة) ونسبة الهامش %" },
  { id: "col_opening",      enabled: true,  locked: false, weight: 10, label: "رصيد أول المدة",               short: "رصيد سابق",       desc: "الرصيد التراكمي قبل بداية الفترة" },
  { id: "col_sales",        enabled: true,  locked: false, weight: 10, label: "مبيعات الفترة (+)",            short: "مبيعات (+)",      desc: "فواتير المبيعات وأذون التسليم الآجلة" },
  { id: "col_receipts",     enabled: true,  locked: false, weight: 10, label: "سدادات الفترة (-)",            short: "سدادات (-)",      desc: "سندات القبض والتحصيل خلال الفترة" },
  { id: "col_returns",      enabled: true,  locked: false, weight: 8.5,label: "مردودات الفترة (-)",           short: "مرتجعات (-)",     desc: "إشعارات مرتجعات المبيعات" },
  { id: "col_closing",      enabled: true,  locked: false, weight: 11, label: "صافي المديونية",               short: "صافي المديونية",  desc: "الرصيد النهائي المستحق حالياً" },
  { id: "col_coll_rate",    enabled: true,  locked: false, weight: 6.5,label: "نسبة التحصيل %",               short: "التحصيل",         desc: "نسبة المحصل من إجمالي المستحق" },
  { id: "col_status",       enabled: true,  locked: false, weight: 6.5,label: "حالة المديونية",               short: "الحالة",          desc: "مدين / مسدد / دائن" },
  { id: "col_notes",        enabled: false, locked: false, weight: 13, label: "ملاحظات / توقيع المتابعة",     short: "ملاحظات التحصيل", desc: "خانة فارغة للتوقيع والملاحظات الميدانية" },
];

const PRESET_LABELS = {
  standard: "🏛️ القالب القياسي",
  profit_collection: "💎 الربحية وآخر تحصيل",
  field_followup: "📋 متابعة المندوب الميدانية",
  comprehensive: "📊 الشامل الكامل (أفقي)",
  custom: "⚙️ مخصص يدوياً"
};

function getDefaultExportConfig() {
  return {
    preset: "standard",
    orientation: "portrait",
    profitScope: "period",
    showRepMatrix: true,
    showKpis: true,
    showSignatures: true,
    hideNegligible: false,
    columns: DEFAULT_COLUMNS_ORDER.map(c => ({ ...c }))
  };
}

function loadExportConfig() {
  try {
    const raw = localStorage.getItem(HDEBT_CFG_STORAGE_KEY);
    if (!raw) return getDefaultExportConfig();
    const parsed = JSON.parse(raw);
    const base = getDefaultExportConfig();
    const validIds = new Set(DEFAULT_COLUMNS_ORDER.map(c => c.id));
    const mergedCols = [];
    const seen = new Set();
    if (Array.isArray(parsed.columns)) {
      parsed.columns.forEach(pc => {
        if (validIds.has(pc.id) && !seen.has(pc.id)) {
          const def = DEFAULT_COLUMNS_ORDER.find(d => d.id === pc.id);
          mergedCols.push({ ...def, enabled: def.locked ? true : !!pc.enabled });
          seen.add(pc.id);
        }
      });
    }
    DEFAULT_COLUMNS_ORDER.forEach(def => {
      if (!seen.has(def.id)) mergedCols.push({ ...def });
    });
    return {
      preset: parsed.preset || base.preset,
      orientation: parsed.orientation === "landscape" ? "landscape" : "portrait",
      profitScope: parsed.profitScope === "allTime" ? "allTime" : "period",
      showRepMatrix: parsed.showRepMatrix !== undefined ? !!parsed.showRepMatrix : true,
      showKpis: parsed.showKpis !== undefined ? !!parsed.showKpis : true,
      showSignatures: parsed.showSignatures !== undefined ? !!parsed.showSignatures : true,
      hideNegligible: !!parsed.hideNegligible,
      columns: mergedCols
    };
  } catch (_) {
    return getDefaultExportConfig();
  }
}

function saveExportConfig(cfg) {
  try {
    localStorage.setItem(HDEBT_CFG_STORAGE_KEY, JSON.stringify(cfg));
  } catch (_) {}
  updateCustomizerBadge(cfg);
}

function updateCustomizerBadge(cfg) {
  const pill = document.getElementById("hdebt-custom-preset-pill");
  if (!pill) return;
  const activeCnt = (cfg.columns || []).filter(c => c.enabled || c.locked).length;
  const pName = PRESET_LABELS[cfg.preset] || PRESET_LABELS.custom;
  pill.textContent = `${pName} (${activeCnt})`;
}

function getPresetConfig(presetKey) {
  const cfg = getDefaultExportConfig();
  cfg.preset = presetKey;

  if (presetKey === "profit_collection") {
    const order = ["col_last_payment", "_name", "col_profit", "col_opening", "col_sales", "col_receipts", "col_returns", "col_closing", "col_coll_rate", "col_status", "col_code", "col_contact", "col_notes"];
    const enabledSet = new Set(["col_last_payment", "_name", "col_profit", "col_opening", "col_sales", "col_receipts", "col_returns", "col_closing", "col_coll_rate", "col_status"]);
    cfg.columns = order.map(id => {
      const def = DEFAULT_COLUMNS_ORDER.find(d => d.id === id);
      return { ...def, enabled: enabledSet.has(id) };
    });
    cfg.orientation = "portrait";
  } else if (presetKey === "field_followup") {
    const order = ["_name", "col_contact", "col_last_payment", "col_closing", "col_coll_rate", "col_notes", "col_opening", "col_sales", "col_receipts", "col_returns", "col_profit", "col_code", "col_status"];
    const enabledSet = new Set(["_name", "col_contact", "col_last_payment", "col_closing", "col_coll_rate", "col_notes"]);
    cfg.columns = order.map(id => {
      const def = DEFAULT_COLUMNS_ORDER.find(d => d.id === id);
      return { ...def, enabled: enabledSet.has(id) };
    });
    cfg.orientation = "portrait";
  } else if (presetKey === "comprehensive") {
    const enabledSet = new Set(["col_code", "col_last_payment", "_name", "col_contact", "col_profit", "col_opening", "col_sales", "col_receipts", "col_returns", "col_closing", "col_coll_rate", "col_status"]);
    cfg.columns = DEFAULT_COLUMNS_ORDER.map(d => ({ ...d, enabled: enabledSet.has(d.id) }));
    cfg.orientation = "landscape";
  } else {
    return getDefaultExportConfig();
  }
  return cfg;
}

let processedData = []; // Hierarchical Rep -> Customers -> Transactions
let grandKPIs = {
  totalDebt: 0,
  totalCreditBal: 0,
  netReceivables: 0,
  periodSales: 0,
  periodReceipts: 0,
  periodReturns: 0,
  debtorCount: 0,
  totalCustomers: 0,
  collectionRate: 0,
};

let expandedReps = new Set();
let expandedCusts = new Set();

// ──────────────────────────────────────────
// Main Render Entrypoint
// ──────────────────────────────────────────
export async function render(container, user) {
  const today = todayString();
  const mStart = startOfMonth();

  container.innerHTML = `
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
          <button class="hdebt-btn hdebt-btn-custom" onclick="window.openHierarchicalDebtCustomizer()" title="تخصيص واستبدال أعمدة الطباعة والتصدير (مثل استبدال الكود بآخر تحصيل والمعلومات بهامش الربح)">
            <span>⚙️</span> تخصيص الأعمدة
            <span id="hdebt-custom-preset-pill" class="hdebt-preset-pill">🏛️ القياسي</span>
          </button>
          <button class="hdebt-btn hdebt-btn-excel" onclick="window.exportHierarchicalDebtExcel()" title="تصدير الجدول بالأعمدة المختارة إلى Excel">
            <span>📊</span> تصدير Excel
          </button>
          <button class="hdebt-btn hdebt-btn-print" onclick="window.exportHierarchicalDebtPDF('summary')" title="تصدير كشف ملخص تنفيذي (موجز) بصيغة PDF / A4">
            <span>📄</span> PDF مختصر
          </button>
          <button class="hdebt-btn hdebt-btn-detailed" style="background:#4338ca; border-color:#3730a3; color:#fff;" onclick="window.exportHierarchicalDebtPDF('detailed')" title="تصدير كشف تفصيلي بحركات كل عميل بصيغة PDF / A4">
            <span>📑</span> PDF موسع
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
          <input type="date" id="hdebt-from" class="hdebt-input font-bold mono" value="${mStart}" onchange="window.loadHierarchicalDebtData()" />
        </div>
        <div class="hdebt-fg" style="min-width:135px;">
          <label>إلى تاريخ</label>
          <input type="date" id="hdebt-to" class="hdebt-input font-bold mono" value="${today}" onchange="window.loadHierarchicalDebtData()" />
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

    <!-- ═══ COLUMN CUSTOMIZATION MODAL ═══ -->
    <div id="hdebt-col-modal" class="hdebt-modal-backdrop no-print" style="display:none;" onclick="if(event.target===this) window.closeHierarchicalDebtCustomizer()">
      <div class="hdebt-modal" role="dialog" aria-modal="true">
        <div class="hdebt-modal-head">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:22px;">⚙️</span>
            <div>
              <h2 style="margin:0; font-size:15.5px; font-weight:900; color:#fff;">تخصيص واستبدال أعمدة الطباعة والتصدير (PDF و Excel)</h2>
              <div style="font-size:11px; color:rgba(255,255,255,0.85);">اختر الأعمدة الظاهرة أو استبدلها ورتبها كما يناسب الإدارة أو المندوبين</div>
            </div>
          </div>
          <button class="hdebt-modal-close" onclick="window.closeHierarchicalDebtCustomizer()">✕</button>
        </div>

        <div class="hdebt-modal-body" id="hdebt-col-modal-body">
          <!-- Dynamically populated -->
        </div>

        <div class="hdebt-modal-foot">
          <button class="hdebt-btn hdebt-btn-excel" onclick="window.saveAndRunHierarchicalExport('excel')">
            <span>📊</span> حفظ وتصدير Excel
          </button>
          <button class="hdebt-btn hdebt-btn-print" onclick="window.saveAndRunHierarchicalExport('summary')">
            <span>📄</span> حفظ ومعاينة PDF مختصر
          </button>
          <button class="hdebt-btn hdebt-btn-detailed" onclick="window.saveAndRunHierarchicalExport('detailed')">
            <span>📑</span> حفظ ومعاينة PDF موسع
          </button>
          <button class="hdebt-btn" style="background:#e2e8f0; color:#0f172a; margin-right:auto;" onclick="window.saveAndCloseHierarchicalCustomizer()">
            💾 حفظ فقط
          </button>
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
      .hdebt-btn-detailed { background: #4338ca; color: #fff; box-shadow: 0 2px 8px rgba(67, 56, 202, 0.3); }
      .hdebt-btn-detailed:hover { background: #3730a3; transform: translateY(-1px); }
      .hdebt-btn-custom { background: #0f172a; color: #fff; border: 1px solid rgba(255,255,255,0.28); box-shadow: 0 2px 8px rgba(15,23,42,0.25); }
      .hdebt-btn-custom:hover { background: #1e293b; transform: translateY(-1px); }
      .hdebt-preset-pill { background: rgba(250,204,21,0.18); color: #fde047; border: 1px solid rgba(250,204,21,0.35); padding: 1px 7px; border-radius: 999px; font-size: 10.5px; font-weight: 800; }

      .hdebt-modal-backdrop {
        position: fixed; inset: 0; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px);
        z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 16px;
      }
      .hdebt-modal {
        background: #fff; border-radius: 16px; width: 100%; max-width: 780px; max-height: 92vh;
        display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        direction: rtl; font-family: 'IBM Plex Sans Arabic', 'Cairo', sans-serif;
      }
      .hdebt-modal-head {
        background: linear-gradient(135deg, #0f2e5a 0%, #1e40af 100%); padding: 14px 20px;
        display: flex; justify-content: space-between; align-items: center; color: #fff;
      }
      .hdebt-modal-close {
        background: rgba(255,255,255,0.18); border: none; color: #fff; width: 32px; height: 32px;
        border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 800;
      }
      .hdebt-modal-close:hover { background: #dc2626; }
      .hdebt-modal-body { padding: 16px 20px; overflow-y: auto; flex: 1; background: #f8fafc; }
      .hdebt-modal-foot {
        padding: 12px 20px; background: #fff; border-top: 1px solid #e2e8f0;
        display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      }
      .hdebt-presets-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(165px, 1fr)); gap: 8px; margin-bottom: 14px; }
      .hdebt-preset-card {
        background: #fff; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 9px 11px;
        cursor: pointer; text-align: right; transition: all 0.15s; font-family: inherit;
      }
      .hdebt-preset-card:hover { border-color: #2563eb; background: #eff6ff; }
      .hdebt-preset-card.is-active { border-color: #1e40af; background: #eff6ff; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
      .hdebt-swap-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
      .hdebt-swap-btn {
        background: #fff; border: 1.5px dashed #2563eb; color: #1e40af; padding: 6px 12px; border-radius: 8px;
        font-size: 11.5px; font-weight: 800; cursor: pointer; font-family: inherit; transition: all 0.15s;
      }
      .hdebt-swap-btn:hover { background: #1e40af; color: #fff; border-style: solid; }
      .hdebt-col-list { display: flex; flex-direction: column; gap: 5px; }
      .hdebt-col-item {
        background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 7px 12px;
        display: flex; align-items: center; justify-content: space-between; gap: 10px;
      }
      .hdebt-col-item.is-enabled { border-color: #93c5fd; background: #fcfdff; }
      .hdebt-col-item.is-locked { border-color: #cbd5e1; background: #f1f5f9; }
      .hdebt-order-btn {
        background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155; width: 26px; height: 24px;
        border-radius: 5px; cursor: pointer; font-size: 10px; font-weight: 800;
      }
      .hdebt-order-btn:hover:not(:disabled) { background: #1e40af; color: #fff; border-color: #1e40af; }
      .hdebt-order-btn:disabled { opacity: 0.35; cursor: not-allowed; }
      .hdebt-preview-ribbon {
        background: #0f2e5a; color: #fff; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px;
        font-size: 11px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
      }
      .hdebt-preview-chip { background: rgba(255,255,255,0.16); padding: 2px 8px; border-radius: 4px; font-weight: 700; }
      .hdebt-opt-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;
        background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-top: 12px;
      }
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
      .tx-dn   { background: #fdf4ff; color: #86198f; border: 1px solid #f0abfc; }
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
  `;

  // Bind global functions
  setupGlobalHandlers();
  updateCustomizerBadge(loadExportConfig());

  // Load Initial Data
  await loadHierarchicalDebtData();
}

// ──────────────────────────────────────────
// Data Extraction & Pure Operational Collation
// ──────────────────────────────────────────
async function loadHierarchicalDebtData(force = false) {
  const treeContainer = document.getElementById("hdebt-tree-content");
  if (treeContainer) {
    treeContainer.innerHTML = `
      <div class="hdebt-loading">
        <div class="hdebt-spinner"></div>
        <div>جارٍ جلب وتدقيق الحركات من فواتير المبيعات وسندات القبض والمرتجعات...</div>
      </div>
    `;
  }

  try {
    // 1. Fetch source collections directly (all L1/L2 cached!)
    const [custSnap, repSnap, invSnap, rcptSnap, colSnap, retSnap, dnSnap, prodSnap] = await Promise.all([
      getAll(COLS.customers()),
      getAll(COLS.salesReps()),
      getAll(COLS.salesInvoices()),
      getAll(COLS.receipts()),
      getAll(collection(db, `companies/${COMPANY_ID}/collections`)),
      getAll(COLS.salesReturns()),
      getAll(COLS.deliveryNotes()).catch(() => []),
      getAll(COLS.products()).catch(() => [])
    ]);

    rawCustomers     = custSnap;
    rawReps          = repSnap;
    rawInvoices      = invSnap.filter(x => x.status !== "cancelled" && x.status !== "void");
    rawReceipts      = rcptSnap.filter(x => x.status !== "cancelled" && x.status !== "void");
    rawCollections   = colSnap.filter(x => x.status !== "cancelled" && x.status !== "void");
    rawReturns       = retSnap.filter(x => x.status !== "cancelled" && x.status !== "void");
    rawDeliveryNotes = (dnSnap || []).filter(x => x.status !== "cancelled" && x.status !== "void" && x.status !== "converted_to_invoice");
    rawProducts      = prodSnap || [];

    prodMap = {};
    rawProducts.forEach(p => {
      if (p.id) prodMap[p.id] = p;
      if (p.name) prodMap[p.name] = p;
    });

    // Populate Rep dropdown
    populateRepDropdown();

    // Collate & Render
    processHierarchicalData();
    renderKPIs();
    renderTree();

  } catch (err) {
    console.error("[HierarchicalDebt] Error loading operational data:", err);
    if (treeContainer) {
      treeContainer.innerHTML = `<div class="alert bad" style="margin:20px;">حدث خطأ أثناء تحميل البيانات: ${err.message}</div>`;
    }
  }
}
window.loadHierarchicalDebtData = loadHierarchicalDebtData;

function populateRepDropdown() {
  const repSelect = document.getElementById("hdebt-rep-filter");
  if (!repSelect) return;
  const currentVal = repSelect.value;
  
  let html = `<option value="">🌟 جميع المناديب (${rawReps.length})</option>`;
  rawReps.forEach(r => {
    html += `<option value="${r.id}" ${r.id === currentVal ? "selected" : ""}>👤 ${r.name || "مندوب"}</option>`;
  });
  html += `<option value="__unassigned__" ${currentVal === "__unassigned__" ? "selected" : ""}>🏢 مبيعات مباشرة / بدون مندوب</option>`;
  repSelect.innerHTML = html;
}

// ──────────────────────────────────────────
// Processing Engine (100% Operational Math + Last Payment & Profitability)
// ──────────────────────────────────────────
function getDocExactCost(docObj) {
  if (!docObj) return 0;
  if (typeof docObj.totalCost === "number" && docObj.totalCost > 0) {
    return docObj.totalCost;
  }
  const lines = docObj.lines || docObj.items || [];
  if (lines.length === 0) return parseFloat(docObj.totalCost || 0) || 0;
  let total = 0;
  lines.forEach(l => {
    const qty = parseFloat(l.qty || l.quantity || 0);
    if (!qty) return;
    const p = prodMap[l.productId] || prodMap[l.productName] || prodMap[l.name];
    const unitCost = parseFloat(
      (l.averageCost && l.averageCost > 0) ? l.averageCost :
      (l.costPrice && l.costPrice > 0) ? l.costPrice :
      (l.purchasePrice && l.purchasePrice > 0) ? l.purchasePrice :
      (l.unitCost && l.unitCost > 0) ? l.unitCost :
      (p?.averageCost || p?.costPrice || p?.lastPurchasePrice || p?.avgCostPrice || p?.purchasePrice || 0)
    );
    total += (qty * unitCost);
  });
  return total;
}

function extractShortLocation(cust) {
  const z = (cust.zone || cust.city || "").trim();
  if (z && z.length <= 28) return z;
  const rawAddr = (cust.zone || cust.address || "").trim();
  if (!rawAddr) return "";
  const cityMatch = rawAddr.match(/المدينة\s*:\s*([^—\-|\n]+)/);
  const distMatch = rawAddr.match(/الحي\s*:\s*([^—\-|\n]+)/);
  if (distMatch && cityMatch) {
    const dist = distMatch[1].replace(/^حي\s+/, "").trim();
    const city = cityMatch[1].trim();
    return `${dist} - ${city}`.slice(0, 30);
  }
  if (cityMatch) return cityMatch[1].trim().slice(0, 28);
  if (distMatch) return distMatch[1].trim().slice(0, 28);
  return rawAddr.length > 26 ? rawAddr.slice(0, 24) + "…" : rawAddr;
}

function processHierarchicalData() {
  const fromDate = document.getElementById("hdebt-from")?.value || "";
  const toDate   = document.getElementById("hdebt-to")?.value || "9999-12-31";
  const refDateStr = (toDate && toDate !== "9999-12-31") ? toDate : todayString();

  // Build Rep Lookup Map
  const repsMap = {};
  rawReps.forEach(r => {
    repsMap[r.id] = {
      id: r.id,
      name: r.name || "مندوب",
      code: r.code || "",
      phone: r.phone || "",
      zone: r.zone || "",
      customers: [],
      totals: {
        openingBalance: 0,
        sales: 0,
        receipts: 0,
        returns: 0,
        closingBalance: 0,
        debtorCount: 0,
        totalCustomers: 0,
        lastPaymentTotal: 0,
        periodSalesSub: 0,
        periodCogs: 0,
        periodProfit: 0,
        allTimeSalesSub: 0,
        allTimeCogs: 0,
        allTimeProfit: 0,
      }
    };
  });

  const unassignedBucket = {
    id: "__unassigned__",
    name: "مبيعات مباشرة / إدارة (بدون مندوب)",
    code: "DIRECT",
    phone: "",
    zone: "المركز الرئيسي",
    customers: [],
    totals: {
      openingBalance: 0,
      sales: 0,
      receipts: 0,
      returns: 0,
      closingBalance: 0,
      debtorCount: 0,
      totalCustomers: 0,
      lastPaymentTotal: 0,
      periodSalesSub: 0,
      periodCogs: 0,
      periodProfit: 0,
      allTimeSalesSub: 0,
      allTimeCogs: 0,
      allTimeProfit: 0,
    }
  };

  // Group transactions & metrics by customer
  const txByCustomer = {};
  const initBucket = (ob = 0) => ({
    openingBal: ob,
    priorInvoices: 0,
    priorReceipts: 0,
    priorReturns: 0,
    periodInvoices: [],
    periodReceipts: [],
    periodReturns: [],
    periodSalesSub: 0,
    periodGrossCogs: 0,
    periodRetSub: 0,
    periodRetCogs: 0,
    allTimeSalesSub: 0,
    allTimeGrossCogs: 0,
    allTimeRetSub: 0,
    allTimeRetCogs: 0,
    allPayments: [],
  });

  rawCustomers.forEach(c => {
    txByCustomer[c.id] = initBucket(parseFloat(c.openingBalance) || 0);
  });

  // Process Sales Invoices
  rawInvoices.forEach(inv => {
    const cId = inv.customerId;
    if (!cId) return;
    if (!txByCustomer[cId]) txByCustomer[cId] = initBucket(0);
    const invDate = inv.date || (inv.createdAt?.toDate ? inv.createdAt.toDate().toISOString().split("T")[0] : "");
    const invTotal = parseFloat(inv.totalWithVat !== undefined ? inv.totalWithVat : (inv.netTotal !== undefined ? inv.netTotal : (inv.total || 0))) || 0;
    const invSub   = parseFloat(inv.subtotal !== undefined ? inv.subtotal : (invTotal / 1.15)) || 0;
    const invCost  = getDocExactCost(inv);

    if (!toDate || invDate <= toDate) {
      txByCustomer[cId].allTimeSalesSub += invSub;
      txByCustomer[cId].allTimeGrossCogs += invCost;
    }

    if (fromDate && invDate < fromDate) {
      txByCustomer[cId].priorInvoices += invTotal;
    } else if (!toDate || invDate <= toDate) {
      txByCustomer[cId].periodSalesSub += invSub;
      txByCustomer[cId].periodGrossCogs += invCost;
      txByCustomer[cId].periodInvoices.push({
        type: "invoice",
        date: invDate,
        docNum: inv.number || inv.invoiceNumber || inv.id?.slice(0,8),
        notes: `فاتورة مبيعات (${(inv.lines || []).length} صنف) — ${inv.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}`,
        paymentMethod: inv.paymentMethod || "credit",
        debit: invTotal,
        credit: 0,
      });
    }
  });

  // Process Delivery Notes (أذون التسليم الآجلة غير الضريبية)
  rawDeliveryNotes.forEach(dn => {
    const cId = dn.customerId;
    if (!cId) return;
    if (!txByCustomer[cId]) txByCustomer[cId] = initBucket(0);
    const dnDate = dn.date || (dn.createdAt?.toDate ? dn.createdAt.toDate().toISOString().split("T")[0] : "");
    const dnTotal = parseFloat(dn.totalAmount !== undefined ? dn.totalAmount : (dn.grandTotal !== undefined ? dn.grandTotal : (dn.total || 0))) || 0;
    const payMethod = (dn.paymentMethod || "credit").toLowerCase();
    if (payMethod === "cash") return;

    const dnSub  = parseFloat(dn.subtotal !== undefined ? dn.subtotal : dnTotal) || 0;
    const dnCost = getDocExactCost(dn);

    if (!toDate || dnDate <= toDate) {
      txByCustomer[cId].allTimeSalesSub += dnSub;
      txByCustomer[cId].allTimeGrossCogs += dnCost;
    }

    if (fromDate && dnDate < fromDate) {
      txByCustomer[cId].priorInvoices += dnTotal;
    } else if (!toDate || dnDate <= toDate) {
      txByCustomer[cId].periodSalesSub += dnSub;
      txByCustomer[cId].periodGrossCogs += dnCost;
      txByCustomer[cId].periodInvoices.push({
        type: "delivery_note",
        date: dnDate,
        docNum: dn.number || dn.dnNumber || `DN-${dn.id?.slice(0,6)}`,
        notes: `سند تسليم بضاعة (${(dn.lines || []).length} صنف) — آجل ${dn.notes ? '— ' + dn.notes : ''}`,
        paymentMethod: "credit",
        debit: dnTotal,
        credit: 0,
      });
    }
  });

  // Process Receipts (سندات القبض)
  rawReceipts.forEach(rcpt => {
    const cId = rcpt.targetId || rcpt.customerId;
    if (!cId) return;
    if (!txByCustomer[cId]) txByCustomer[cId] = initBucket(0);
    const rcptDate = rcpt.date || (rcpt.createdAt?.toDate ? rcpt.createdAt.toDate().toISOString().split("T")[0] : "");
    const rcptAmt = parseFloat(rcpt.amount || 0) || 0;
    const ts = rcpt.createdAt?.seconds ? rcpt.createdAt.seconds : 0;

    if (rcptAmt > 0 && (!toDate || rcptDate <= toDate)) {
      txByCustomer[cId].allPayments.push({
        amount: rcptAmt,
        date: rcptDate,
        method: rcpt.method || "cash",
        docNum: rcpt.number || "",
        ts
      });
    }

    if (fromDate && rcptDate < fromDate) {
      txByCustomer[cId].priorReceipts += rcptAmt;
    } else if (!toDate || rcptDate <= toDate) {
      txByCustomer[cId].periodReceipts.push({
        type: "receipt",
        date: rcptDate,
        docNum: rcpt.number || `RC-${rcpt.id?.slice(0,6).toUpperCase()}`,
        notes: `سند قبض — طريقة السداد: ${rcpt.method === 'cash' ? 'نقدي' : rcpt.method === 'transfer' ? 'تحويل بنكي' : rcpt.method || 'سداد'} ${rcpt.notes ? '— ' + rcpt.notes : ''}`,
        paymentMethod: rcpt.method || "cash",
        debit: 0,
        credit: rcptAmt,
      });
    }
  });

  // Process Collections (التحصيلات الميدانية)
  rawCollections.forEach(col => {
    const cId = col.customerId;
    if (!cId) return;
    if (!txByCustomer[cId]) txByCustomer[cId] = initBucket(0);
    const colDate = col.date || (col.createdAt?.toDate ? col.createdAt.toDate().toISOString().split("T")[0] : "");
    const colAmt = parseFloat(col.amount || 0) || 0;
    const ts = col.createdAt?.seconds ? col.createdAt.seconds : 0;

    if (colAmt > 0 && (!toDate || colDate <= toDate)) {
      txByCustomer[cId].allPayments.push({
        amount: colAmt,
        date: colDate,
        method: col.method || "cash",
        docNum: col.number || "",
        ts
      });
    }

    if (fromDate && colDate < fromDate) {
      txByCustomer[cId].priorReceipts += colAmt;
    } else if (!toDate || colDate <= toDate) {
      txByCustomer[cId].periodReceipts.push({
        type: "receipt",
        date: colDate,
        docNum: col.number || `COL-${col.id?.slice(0,5)}`,
        notes: `تحصيل مبيعات — ${col.method || 'نقدي'} ${col.notes ? '— ' + col.notes : ''}`,
        paymentMethod: col.method || "cash",
        debit: 0,
        credit: colAmt,
      });
    }
  });

  // Process Sales Returns (مردودات المبيعات)
  rawReturns.forEach(ret => {
    const cId = ret.customerId;
    if (!cId) return;
    if (!txByCustomer[cId]) txByCustomer[cId] = initBucket(0);
    const retDate = ret.date || (ret.createdAt?.toDate ? ret.createdAt.toDate().toISOString().split("T")[0] : "");
    const retTotal = parseFloat(ret.totalWithVat !== undefined ? ret.totalWithVat : (ret.total !== undefined ? ret.total : (ret.subtotal || 0))) || 0;
    const retSub   = parseFloat(ret.subtotal !== undefined ? ret.subtotal : (retTotal / 1.15)) || 0;
    const retCost  = getDocExactCost(ret);

    if (!toDate || retDate <= toDate) {
      txByCustomer[cId].allTimeRetSub += retSub;
      txByCustomer[cId].allTimeRetCogs += retCost;
    }

    if (fromDate && retDate < fromDate) {
      txByCustomer[cId].priorReturns += retTotal;
    } else if (!toDate || retDate <= toDate) {
      txByCustomer[cId].periodRetSub += retSub;
      txByCustomer[cId].periodRetCogs += retCost;
      txByCustomer[cId].periodReturns.push({
        type: "return",
        date: retDate,
        docNum: ret.number || ret.creditNoteNumber || `CR-${ret.id?.slice(0,6)}`,
        notes: `إشعار مردود مبيعات ${ret.refInvoice ? 'للفاتورة ' + ret.refInvoice : ''} ${ret.reason ? '— ' + ret.reason : ''}`,
        debit: 0,
        credit: retTotal,
      });
    }
  });

  // Calculate each customer's balances, profitability, last payment, and chronological ledger
  const calculatedCustomers = [];

  rawCustomers.forEach(cust => {
    const tx = txByCustomer[cust.id] || initBucket(0);

    // 1. Opening Balance strictly before from date
    const openingBal = tx.openingBal + tx.priorInvoices - tx.priorReceipts - tx.priorReturns;

    // 2. Period sums
    const pSales = tx.periodInvoices.reduce((s, x) => s + x.debit, 0);
    const pReceipts = tx.periodReceipts.reduce((s, x) => s + x.credit, 0);
    const pReturns = tx.periodReturns.reduce((s, x) => s + x.credit, 0);

    // 3. Current Closing Balance
    const closingBal = Math.round((openingBal + pSales - pReceipts - pReturns) * 100) / 100;

    // 4. Last Payment / Collection lookup (across all payments up to toDate)
    tx.allPayments.sort((a, b) => {
      const cmp = (b.date || "").localeCompare(a.date || "");
      return cmp !== 0 ? cmp : (b.ts || 0) - (a.ts || 0);
    });
    const lastPay = tx.allPayments[0] || null;
    const lastPaymentAmount = lastPay ? Math.round(lastPay.amount * 100) / 100 : 0;
    const lastPaymentDate   = lastPay ? (lastPay.date || "") : "";
    let daysSinceLastPayment = null;
    if (lastPaymentDate) {
      const diffMs = new Date(refDateStr).getTime() - new Date(lastPaymentDate).getTime();
      if (!isNaN(diffMs)) daysSinceLastPayment = Math.max(0, Math.floor(diffMs / 86400000));
    }

    // 5. Profitability & Margin (Period & All-Time, Pre-VAT Revenue - Net COGS)
    const pNetSub  = Math.round((tx.periodSalesSub - tx.periodRetSub) * 100) / 100;
    const pNetCogs = Math.round((tx.periodGrossCogs - tx.periodRetCogs) * 100) / 100;
    const pProfit  = Math.round((pNetSub - pNetCogs) * 100) / 100;
    const pMargin  = pNetSub > 0 ? (pProfit / pNetSub) * 100 : 0;

    const aNetSub  = Math.round((tx.allTimeSalesSub - tx.allTimeRetSub) * 100) / 100;
    const aNetCogs = Math.round((tx.allTimeGrossCogs - tx.allTimeRetCogs) * 100) / 100;
    const aProfit  = Math.round((aNetSub - aNetCogs) * 100) / 100;
    const aMargin  = aNetSub > 0 ? (aProfit / aNetSub) * 100 : 0;

    // 6. Chronological Ledger for Level 3
    const allTxns = [
      ...tx.periodInvoices,
      ...tx.periodReceipts,
      ...tx.periodReturns,
    ];
    allTxns.sort((a, b) => (a.date || "").localeCompare(b.date || ""));

    let rBal = openingBal;
    const ledgerRows = allTxns.map(row => {
      rBal = Math.round((rBal + (row.debit || 0) - (row.credit || 0)) * 100) / 100;
      return { ...row, runningBalance: rBal };
    });

    const custObj = {
      id: cust.id,
      name: cust.name || "عميل غير مسمى",
      code: cust.code || "",
      phone: cust.phone || "",
      zone: cust.zone || cust.address || "",
      shortLocation: extractShortLocation(cust),
      repId: cust.repId || cust.assignedRepId || null,
      repName: cust.repName || "",
      openingBalance: Math.round(openingBal * 100) / 100,
      periodSales: Math.round(pSales * 100) / 100,
      periodReceipts: Math.round(pReceipts * 100) / 100,
      periodReturns: Math.round(pReturns * 100) / 100,
      closingBalance: closingBal,
      lastPaymentAmount,
      lastPaymentDate,
      daysSinceLastPayment,
      lastPaymentMethod: lastPay?.method || "",
      periodSalesSub: pNetSub,
      periodCogs: pNetCogs,
      periodProfit: pProfit,
      periodMarginPct: Math.round(pMargin * 10) / 10,
      allTimeSalesSub: aNetSub,
      allTimeCogs: aNetCogs,
      allTimeProfit: aProfit,
      allTimeMarginPct: Math.round(aMargin * 10) / 10,
      transactions: ledgerRows,
      status: closingBal > 0.01 ? "debtor" : closingBal < -0.01 ? "creditor" : "settled",
      hasActivity: (Math.abs(openingBal) > 0.001 || pSales > 0 || pReceipts > 0 || pReturns > 0)
    };

    calculatedCustomers.push(custObj);
  });

  // Assign customers to Reps
  calculatedCustomers.forEach(c => {
    let repBucket = repsMap[c.repId];
    if (!repBucket && c.repName) {
      repBucket = Object.values(repsMap).find(r => (r.name || "").trim().toLowerCase() === (c.repName || "").trim().toLowerCase());
    }
    if (!repBucket) {
      const invWithRep = rawInvoices.find(i => i.customerId === c.id && (i.repId || i.salesRepId));
      const dnWithRep = rawDeliveryNotes.find(d => d.customerId === c.id && (d.repId || d.salesRepId));
      const repKey = invWithRep?.repId || invWithRep?.salesRepId || dnWithRep?.repId || dnWithRep?.salesRepId;
      if (repKey && repsMap[repKey]) repBucket = repsMap[repKey];
    }

    const bucket = repBucket || unassignedBucket;
    bucket.customers.push(c);
    bucket.totals.openingBalance += c.openingBalance;
    bucket.totals.sales += c.periodSales;
    bucket.totals.receipts += c.periodReceipts;
    bucket.totals.returns += c.periodReturns;
    bucket.totals.closingBalance += c.closingBalance;
    bucket.totals.lastPaymentTotal += c.lastPaymentAmount;
    bucket.totals.periodSalesSub += c.periodSalesSub;
    bucket.totals.periodCogs += c.periodCogs;
    bucket.totals.periodProfit += c.periodProfit;
    bucket.totals.allTimeSalesSub += c.allTimeSalesSub;
    bucket.totals.allTimeCogs += c.allTimeCogs;
    bucket.totals.allTimeProfit += c.allTimeProfit;
    bucket.totals.totalCustomers++;
    if (c.closingBalance > 0.01) bucket.totals.debtorCount++;
  });

  // Compile final array of Reps
  const repList = Object.values(repsMap);
  if (unassignedBucket.customers.length > 0) repList.push(unassignedBucket);

  repList.forEach(rep => {
    rep.customers.sort((a, b) => b.closingBalance - a.closingBalance);
  });
  repList.sort((a, b) => b.totals.closingBalance - a.totals.closingBalance);

  processedData = repList;

  // Calculate Grand KPIs
  let gDebt = 0, gCredit = 0, gNet = 0, gSales = 0, gReceipts = 0, gReturns = 0, gDebtorCount = 0;
  calculatedCustomers.forEach(c => {
    if (c.closingBalance > 0.01) { gDebt += c.closingBalance; gDebtorCount++; }
    else if (c.closingBalance < -0.01) gCredit += Math.abs(c.closingBalance);
    gNet += c.closingBalance;
    gSales += c.periodSales;
    gReceipts += c.periodReceipts;
    gReturns += c.periodReturns;
  });

  const totalDemand = Math.max(0, gSales + (calculatedCustomers.reduce((s, c) => s + Math.max(0, c.openingBalance), 0)));
  const collRate = totalDemand > 0 ? (gReceipts / totalDemand) * 100 : 0;

  grandKPIs = {
    totalDebt: Math.round(gDebt * 100) / 100,
    totalCreditBal: Math.round(gCredit * 100) / 100,
    netReceivables: Math.round(gNet * 100) / 100,
    periodSales: Math.round(gSales * 100) / 100,
    periodReceipts: Math.round(gReceipts * 100) / 100,
    periodReturns: Math.round(gReturns * 100) / 100,
    debtorCount: gDebtorCount,
    totalCustomers: calculatedCustomers.length,
    collectionRate: Math.min(100, Math.round(collRate * 10) / 10),
  };
}

// ──────────────────────────────────────────
// Render KPIs
// ──────────────────────────────────────────
function renderKPIs() {
  document.getElementById("kpi-total-debt").textContent      = formatCurrency(grandKPIs.totalDebt);
  document.getElementById("kpi-debtors-count").textContent   = `${grandKPIs.debtorCount} عميل مدين (من أصل ${grandKPIs.totalCustomers})`;
  document.getElementById("kpi-period-sales").textContent    = formatCurrency(grandKPIs.periodSales);
  document.getElementById("kpi-period-receipts").textContent = formatCurrency(grandKPIs.periodReceipts);
  document.getElementById("kpi-period-returns").textContent  = formatCurrency(grandKPIs.periodReturns);
  document.getElementById("kpi-collection-rate").textContent = `${grandKPIs.collectionRate.toFixed(1)}%`;
  document.getElementById("kpi-net-receivables").textContent = `صافي الذمم: ${formatCurrency(grandKPIs.netReceivables)}`;

  // Print period label
  const from = document.getElementById("hdebt-from")?.value || "البداية";
  const to = document.getElementById("hdebt-to")?.value || "الآن";
  const printLbl = document.getElementById("hdebt-print-period-label");
  if (printLbl) printLbl.textContent = `الفترة من: ${from}  إلى: ${to} | إجمالي المديونيات القائمة: ${formatCurrency(grandKPIs.totalDebt)}`;
}

// ──────────────────────────────────────────
// Filtering Helper (Unified for Screen, PDF & Excel Export)
// ──────────────────────────────────────────
function getFilteredHierarchy(forExport = false, cfgOverride = null) {
  const repFilter    = document.getElementById("hdebt-rep-filter")?.value || "";
  const statusFilter = document.getElementById("hdebt-status-filter")?.value || "all";
  const searchQ      = (document.getElementById("hdebt-search")?.value || "").trim().toLowerCase();
  const cfg          = forExport ? (cfgOverride || loadExportConfig()) : null;

  let hiddenNegligibleCount = 0;
  let hiddenNegligibleSum   = 0;

  let filteredReps = (processedData || []).map(rep => {
    let custs = rep.customers || [];

    if (statusFilter === "debtors") {
      custs = custs.filter(c => c.closingBalance > 0.01);
    } else if (statusFilter === "settled") {
      custs = custs.filter(c => Math.abs(c.closingBalance) <= 0.01 && c.hasActivity);
    } else if (statusFilter === "creditors") {
      custs = custs.filter(c => c.closingBalance < -0.01);
    }

    if (searchQ) {
      custs = custs.filter(c => 
        (c.name || "").toLowerCase().includes(searchQ) ||
        (c.code || "").toLowerCase().includes(searchQ) ||
        (c.phone || "").includes(searchQ) ||
        (rep.name || "").toLowerCase().includes(searchQ)
      );
    }

    if (forExport && cfg && cfg.hideNegligible) {
      custs = custs.filter(c => {
        if (Math.abs(c.closingBalance) < 1.0 && c.periodSales === 0 && c.periodReceipts === 0 && c.periodReturns === 0) {
          hiddenNegligibleCount++;
          hiddenNegligibleSum += c.closingBalance;
          return false;
        }
        return true;
      });
    }

    return {
      ...rep,
      visibleCustomers: custs
    };
  });

  if (repFilter) {
    filteredReps = filteredReps.filter(r => r.id === repFilter);
  }

  filteredReps = filteredReps.filter(r => r.visibleCustomers.length > 0);
  filteredReps._hiddenNegligibleCount = hiddenNegligibleCount;
  filteredReps._hiddenNegligibleSum   = Math.round(hiddenNegligibleSum * 100) / 100;
  return filteredReps;
}

// ──────────────────────────────────────────
// Render Hierarchical Tree (3 Levels)
// ──────────────────────────────────────────
function renderTree() {
  const treeContainer = document.getElementById("hdebt-tree-content");
  if (!treeContainer) return;

  const filteredReps = getFilteredHierarchy(false);

  if (filteredReps.length === 0) {
    treeContainer.innerHTML = `
      <div style="background:var(--bg-1,#fff); border-radius:14px; padding:40px 20px; text-align:center; border:1px solid var(--border-soft,#e2e8f0); color:var(--text-2,#64748b);">
        <div style="font-size:32px; margin-bottom:8px;">🔍</div>
        <div style="font-weight:800; font-size:15px; color:var(--text-0,#0f172a);">لا توجد مديونيات أو حركات مطابقة للفلاتر المحددة</div>
        <div style="font-size:12px; margin-top:4px;">جرّب تغيير حالة المديونية أو توسيع نطاق الفترة الزمنية</div>
      </div>
    `;
    return;
  }

  let html = "";
  filteredReps.forEach(rep => {
    const isRepOpen = expandedReps.has(rep.id);
    const repDemand = Math.max(0, rep.totals.sales + Math.max(0, rep.totals.openingBalance));
    const repCollPct = repDemand > 0 ? Math.min(100, Math.round((rep.totals.receipts / repDemand) * 100)) : 0;

    html += `
      <div class="hdebt-rep-card ${isRepOpen ? 'is-open' : ''}" id="rep-card-${rep.id}">
        <div class="hdebt-rep-header" onclick="window.toggleHierarchicalRep('${rep.id}')">
          <div class="hdebt-rep-title-group">
            <div class="hdebt-rep-avatar">
              ${rep.id === '__unassigned__' ? '🏢' : (rep.name ? rep.name.charAt(0) : '👤')}
            </div>
            <div>
              <div class="hdebt-rep-name">${rep.name} ${rep.code ? `<span style="font-size:11px; font-weight:normal; opacity:0.75;">(${rep.code})</span>` : ''}</div>
              <div class="hdebt-rep-meta">
                <span>👥 ${rep.visibleCustomers.length} عميل</span>
                <span style="margin: 0 4px;">•</span>
                <span style="color:#dc2626; font-weight:700;">🔴 ${rep.totals.debtorCount} مدين</span>
                ${rep.phone ? `<span style="margin: 0 4px;">•</span> <span>📞 ${rep.phone}</span>` : ''}
              </div>
            </div>
          </div>

          <div class="hdebt-rep-metrics-row">
            <div class="hdebt-rep-metric">
              <div class="hdebt-rep-metric-lbl">رصيد أول المدة</div>
              <div class="hdebt-rep-metric-val" style="color:#475569;">${formatCurrency(rep.totals.openingBalance)}</div>
            </div>
            <div class="hdebt-rep-metric">
              <div class="hdebt-rep-metric-lbl">مبيعات (+)</div>
              <div class="hdebt-rep-metric-val" style="color:#1d4ed8;">${formatCurrency(rep.totals.sales)}</div>
            </div>
            <div class="hdebt-rep-metric">
              <div class="hdebt-rep-metric-lbl">سدادات (-)</div>
              <div class="hdebt-rep-metric-val" style="color:#059669;">${formatCurrency(rep.totals.receipts)}</div>
            </div>
            <div class="hdebt-rep-metric">
              <div class="hdebt-rep-metric-lbl">مردودات (-)</div>
              <div class="hdebt-rep-metric-val" style="color:#d97706;">${formatCurrency(rep.totals.returns)}</div>
            </div>
            <div class="hdebt-rep-metric" style="background:rgba(239,68,68,0.06); padding:4px 10px; border-radius:8px; border:1px solid rgba(239,68,68,0.15);">
              <div class="hdebt-rep-metric-lbl" style="color:#dc2626;">صافي المديونية</div>
              <div class="hdebt-rep-metric-val" style="color:#dc2626; font-size:14.5px;">${formatCurrency(rep.totals.closingBalance)}</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <div title="نسبة التحصيل: ${repCollPct}%">
                <div style="font-size:10px; font-weight:800; color:#10b981; text-align:left;">${repCollPct}%</div>
                <div class="hdebt-rep-coll-bar"><div class="hdebt-rep-coll-fill" style="width:${repCollPct}%;"></div></div>
              </div>
              <div class="hdebt-rep-chevron">▼</div>
            </div>
          </div>
        </div>

        <div class="hdebt-cust-list" style="display:${isRepOpen ? 'block' : 'none'};" id="rep-custs-${rep.id}">
          ${rep.visibleCustomers.map(cust => renderCustomerCard(cust, rep)).join("")}
        </div>
      </div>
    `;
  });

  treeContainer.innerHTML = html;
}

function renderCustomerCard(cust, rep) {
  const isCustOpen = expandedCusts.has(cust.id);
  const badgeClass = cust.status === "debtor" ? "hdebt-badge-debtor" : cust.status === "creditor" ? "hdebt-badge-creditor" : "hdebt-badge-settled";
  const badgeText  = cust.status === "debtor" ? "🔴 مدين" : cust.status === "creditor" ? "🔵 دائن" : "🟢 مسدد";

  return `
    <div class="hdebt-cust-card ${isCustOpen ? 'is-open' : ''}" id="cust-card-${cust.id}">
      <div class="hdebt-cust-header" onclick="window.toggleHierarchicalCust('${cust.id}')">
        <div class="hdebt-cust-info">
          <span class="hdebt-cust-code">${cust.code || 'CUST'}</span>
          <div>
            <div class="hdebt-cust-name">${cust.name}</div>
            <div class="hdebt-cust-phone" style="display:flex; flex-wrap:wrap; align-items:center; gap:6px; margin-top:2px;">
              ${cust.phone ? `<span>📞 ${cust.phone}</span>` : ''}
              ${cust.shortLocation ? `<span title="${(cust.zone || '').replace(/"/g, '&quot;')}">• 📍 ${cust.shortLocation}</span>` : ''}
              ${cust.lastPaymentAmount > 0 ? `<span style="background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; padding:0px 5px; border-radius:4px; font-size:10px; font-weight:700;">💳 آخر سداد: ${formatCurrency(cust.lastPaymentAmount)} (${cust.lastPaymentDate})</span>` : ''}
              ${Math.abs(cust.periodSalesSub) > 0.01 ? `<span style="background:${cust.periodProfit >= 0 ? '#eff6ff' : '#fef2f2'}; color:${cust.periodProfit >= 0 ? '#1d4ed8' : '#dc2626'}; border:1px solid #bfdbfe; padding:0px 5px; border-radius:4px; font-size:10px; font-weight:700;">📈 هامش الفترة: ${cust.periodMarginPct.toFixed(1)}%</span>` : ''}
            </div>
          </div>
        </div>

        <div class="hdebt-cust-cols">
          <div class="hdebt-col-cell">
            <div class="hdebt-col-lbl">رصيد أول المدة</div>
            <div class="hdebt-col-val" style="color:#64748b;">${formatCurrency(cust.openingBalance)}</div>
          </div>
          <div class="hdebt-col-cell">
            <div class="hdebt-col-lbl">مبيعات (+)</div>
            <div class="hdebt-col-val" style="color:#1d4ed8;">${formatCurrency(cust.periodSales)}</div>
          </div>
          <div class="hdebt-col-cell">
            <div class="hdebt-col-lbl">سدادات (-)</div>
            <div class="hdebt-col-val" style="color:#059669;">${formatCurrency(cust.periodReceipts)}</div>
          </div>
          <div class="hdebt-col-cell">
            <div class="hdebt-col-lbl">مردودات (-)</div>
            <div class="hdebt-col-val" style="color:#d97706;">${formatCurrency(cust.periodReturns)}</div>
          </div>
          <div class="hdebt-col-cell" style="min-width:100px;">
            <div class="hdebt-col-lbl" style="color:${cust.closingBalance > 0 ? '#dc2626' : '#059669'}; font-weight:800;">الرصيد النهائي</div>
            <div class="hdebt-col-val" style="font-size:13.5px; color:${cust.closingBalance > 0 ? '#dc2626' : cust.closingBalance < 0 ? '#1d4ed8' : '#059669'};">
              ${formatCurrency(cust.closingBalance)}
            </div>
          </div>
          <div class="hdebt-badge ${badgeClass}">${badgeText}</div>
          <div style="display:flex; align-items:center; gap:6px;" onclick="event.stopPropagation()">
            <button class="hdebt-stmt-btn" title="فتح كشف حساب رسمي للعميل" onclick="window.openCustomerUnifiedStatement('${cust.id}')">
              📄 كشف حساب
            </button>
            <div class="hdebt-rep-chevron" style="width:24px; height:24px; font-size:9px; cursor:pointer;" onclick="window.toggleHierarchicalCust('${cust.id}')">▼</div>
          </div>
        </div>
      </div>

      <div class="hdebt-txns-wrap" style="display:${isCustOpen ? 'block' : 'none'};" id="cust-txns-${cust.id}">
        ${renderCustomerTransactionsTable(cust)}
      </div>
    </div>
  `;
}

function renderCustomerTransactionsTable(cust) {
  if (!cust.transactions || cust.transactions.length === 0) {
    return `
      <div style="padding:14px; text-align:center; color:var(--text-2,#64748b); font-size:12px; background:#f8fafc; border-radius:8px;">
        ℹ️ لا توجد حركات بيع أو تحصيل أو مرتجع مسجلة لهذا العميل خلال الفترة المحددة. (رصيد أول المدة: ${formatCurrency(cust.openingBalance)})
      </div>
    `;
  }

  return `
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
        <tr style="background:#f8fafc; font-weight:700;">
          <td style="color:#64748b;">—</td>
          <td><span class="tx-badge tx-ob">رصيد سابق</span></td>
          <td style="font-family:monospace; color:#64748b;">OPENING</td>
          <td style="color:#64748b;">رصيد أول المدة ما قبل تاريخ بداية التقرير</td>
          <td style="text-align:left; font-family:monospace;">${cust.openingBalance > 0 ? formatCurrency(cust.openingBalance) : '—'}</td>
          <td style="text-align:left; font-family:monospace;">${cust.openingBalance < 0 ? formatCurrency(Math.abs(cust.openingBalance)) : '—'}</td>
          <td style="text-align:left; font-family:monospace; font-weight:900;">${formatCurrency(cust.openingBalance)}</td>
        </tr>
        ${cust.transactions.map(t => {
          const badgeType = t.type === 'invoice' ? 'tx-inv' : t.type === 'receipt' ? 'tx-rcpt' : t.type === 'delivery_note' ? 'tx-dn' : 'tx-ret';
          const typeLabel = t.type === 'invoice' ? 'فاتورة مبيعات' : t.type === 'receipt' ? 'سند قبض' : t.type === 'delivery_note' ? 'سند تسليم (DN)' : 'مرتجع مبيعات';
          return `
            <tr>
              <td style="font-family:monospace; color:#475569; white-space:nowrap;">${t.date || '—'}</td>
              <td><span class="tx-badge ${badgeType}">${typeLabel}</span></td>
              <td style="font-family:monospace; font-weight:800; color:#1e40af;">${t.docNum || '—'}</td>
              <td style="color:#334155;">${t.notes || '—'}</td>
              <td style="text-align:left; font-family:monospace; font-weight:${t.debit ? '800' : 'normal'}; color:${t.debit ? '#1d4ed8' : '#94a3b8'};">
                ${t.debit ? formatCurrency(t.debit) : '—'}
              </td>
              <td style="text-align:left; font-family:monospace; font-weight:${t.credit ? '800' : 'normal'}; color:${t.credit ? '#059669' : '#94a3b8'};">
                ${t.credit ? formatCurrency(t.credit) : '—'}
              </td>
              <td style="text-align:left; font-family:monospace; font-weight:900; color:${t.runningBalance > 0 ? '#dc2626' : t.runningBalance < 0 ? '#1d4ed8' : '#059669'};">
                ${formatCurrency(t.runningBalance)}
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4">إجمالي حركات الفترة وصافي المديونية الختامية للعميل</td>
          <td style="text-align:left; color:#1d4ed8;">${formatCurrency(cust.periodSales)}</td>
          <td style="text-align:left; color:#059669;">${formatCurrency(cust.periodReceipts + cust.periodReturns)}</td>
          <td style="text-align:left; color:${cust.closingBalance > 0 ? '#dc2626' : '#059669'};">${formatCurrency(cust.closingBalance)}</td>
        </tr>
      </tfoot>
    </table>
  `;
}

// ──────────────────────────────────────────
// Formatting & Totals Helpers for PDF & Excel
// ──────────────────────────────────────────
function formatPrintNum(num) {
  if (num === null || num === undefined || isNaN(num)) return "0.00";
  return Number(num).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateRepVisibleTotals(custs) {
  let opening = 0, sales = 0, receipts = 0, returns = 0, closing = 0, debtors = 0;
  let lastPaymentTotal = 0, paidCustomersCount = 0;
  let pSub = 0, pCogs = 0, pProfit = 0;
  let aSub = 0, aCogs = 0, aProfit = 0;

  custs.forEach(c => {
    opening  += (c.openingBalance || 0);
    sales    += (c.periodSales || 0);
    receipts += (c.periodReceipts || 0);
    returns  += (c.periodReturns || 0);
    closing  += (c.closingBalance || 0);
    if (c.closingBalance > 0.01) debtors++;
    if (c.lastPaymentAmount > 0) {
      lastPaymentTotal += c.lastPaymentAmount;
      paidCustomersCount++;
    }
    pSub    += (c.periodSalesSub || 0);
    pCogs   += (c.periodCogs || 0);
    pProfit += (c.periodProfit || 0);
    aSub    += (c.allTimeSalesSub || 0);
    aCogs   += (c.allTimeCogs || 0);
    aProfit += (c.allTimeProfit || 0);
  });

  const demand = Math.max(0, sales + Math.max(0, opening));
  const collPct = demand > 0 ? Math.min(100, Math.round((receipts / demand) * 100)) : (closing <= 0.01 ? 100 : 0);
  const pMarginPct = pSub > 0 ? (pProfit / pSub) * 100 : 0;
  const aMarginPct = aSub > 0 ? (aProfit / aSub) * 100 : 0;

  return {
    openingBalance: Math.round(opening * 100) / 100,
    sales: Math.round(sales * 100) / 100,
    receipts: Math.round(receipts * 100) / 100,
    returns: Math.round(returns * 100) / 100,
    closingBalance: Math.round(closing * 100) / 100,
    debtorCount: debtors,
    totalCustomers: custs.length,
    collectionRate: collPct,
    lastPaymentTotal: Math.round(lastPaymentTotal * 100) / 100,
    paidCustomersCount,
    periodSalesSub: Math.round(pSub * 100) / 100,
    periodProfit: Math.round(pProfit * 100) / 100,
    periodMarginPct: Math.round(pMarginPct * 10) / 10,
    allTimeSalesSub: Math.round(aSub * 100) / 100,
    allTimeProfit: Math.round(aProfit * 100) / 100,
    allTimeMarginPct: Math.round(aMarginPct * 10) / 10,
  };
}

function calculateFilteredTotals(filteredReps) {
  let gDebt = 0, gCredit = 0, gNet = 0, gSales = 0, gReceipts = 0, gReturns = 0, gOpening = 0;
  let gDebtorCount = 0, gTotalCust = 0, gLastPayTotal = 0, gPaidCust = 0;
  let gpSub = 0, gpProfit = 0, gaSub = 0, gaProfit = 0;

  filteredReps.forEach(rep => {
    rep.visibleCustomers.forEach(c => {
      gTotalCust++;
      gOpening  += (c.openingBalance || 0);
      gSales    += (c.periodSales || 0);
      gReceipts += (c.periodReceipts || 0);
      gReturns  += (c.periodReturns || 0);
      gNet      += (c.closingBalance || 0);
      if (c.closingBalance > 0.01) { gDebt += c.closingBalance; gDebtorCount++; }
      else if (c.closingBalance < -0.01) gCredit += Math.abs(c.closingBalance);
      if (c.lastPaymentAmount > 0) { gLastPayTotal += c.lastPaymentAmount; gPaidCust++; }
      gpSub    += (c.periodSalesSub || 0);
      gpProfit += (c.periodProfit || 0);
      gaSub    += (c.allTimeSalesSub || 0);
      gaProfit += (c.allTimeProfit || 0);
    });
  });

  const totalDemand = Math.max(0, gSales + (filteredReps.reduce((s, r) => s + r.visibleCustomers.reduce((cs, c) => cs + Math.max(0, c.openingBalance), 0), 0)));
  const collRate = totalDemand > 0 ? (gReceipts / totalDemand) * 100 : 0;

  return {
    openingBalance: Math.round(gOpening * 100) / 100,
    sales: Math.round(gSales * 100) / 100,
    receipts: Math.round(gReceipts * 100) / 100,
    returns: Math.round(gReturns * 100) / 100,
    totalDebt: Math.round(gDebt * 100) / 100,
    totalCredit: Math.round(gCredit * 100) / 100,
    netReceivables: Math.round(gNet * 100) / 100,
    closingBalance: Math.round(gNet * 100) / 100,
    debtorCount: gDebtorCount,
    totalCustomers: gTotalCust,
    collectionRate: Math.min(100, Math.round(collRate * 10) / 10),
    lastPaymentTotal: Math.round(gLastPayTotal * 100) / 100,
    paidCustomersCount: gPaidCust,
    periodSalesSub: Math.round(gpSub * 100) / 100,
    periodProfit: Math.round(gpProfit * 100) / 100,
    periodMarginPct: gpSub > 0 ? Math.round((gpProfit / gpSub) * 1000) / 10 : 0,
    allTimeSalesSub: Math.round(gaSub * 100) / 100,
    allTimeProfit: Math.round(gaProfit * 100) / 100,
    allTimeMarginPct: gaSub > 0 ? Math.round((gaProfit / gaSub) * 1000) / 10 : 0,
  };
}

async function getStampBase64() {
  try {
    const res = await fetch("/icons/company-stamp.png?t=" + Date.now());
    if (!res.ok) return "/icons/company-stamp.png";
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve("/icons/company-stamp.png");
      reader.readAsDataURL(blob);
    });
  } catch (_) {
    return "/icons/company-stamp.png";
  }
}

// ──────────────────────────────────────────
// Dynamic Column Renderer for Summary Table (Exact Ordering + Proportional Colgroup)
// ──────────────────────────────────────────
function getActiveSummaryColumns(cfg) {
  const enabled = (cfg.columns || []).filter(c => c.enabled || c.locked);
  const rawCols = [
    { id: "_idx", label: "#", short: "#", weight: 3.2 },
    ...enabled
  ];
  const totalWeight = rawCols.reduce((s, c) => s + (c.weight || 10), 0) || 100;
  return rawCols.map(c => ({
    ...c,
    pctWidth: ((c.weight || 10) / totalWeight * 100).toFixed(2) + "%"
  }));
}

function getColAlign(colId) {
  switch (colId) {
    case "_idx":
    case "col_code":
    case "col_last_payment":
    case "col_coll_rate":
    case "col_status":
    case "col_notes":
      return "center";
    case "_name":
    case "col_contact":
      return "right";
    default:
      return "left";
  }
}

function renderColHeaderHtml(col, cfg) {
  const isAllTime = cfg.profitScope === "allTime";
  const unitTag = `<span class="th-unit">(ر.س)</span>`;
  switch (col.id) {
    case "_idx":             return `#`;
    case "_name":            return `اسم العميل`;
    case "col_code":         return `كود العميل`;
    case "col_last_payment": return `آخر تحصيل ${unitTag}`;
    case "col_contact":      return `معلومات العميل`;
    case "col_profit":       return `هامش الربح ${isAllTime ? '<span class="th-unit">(تراكمي)</span>' : unitTag}`;
    case "col_opening":      return `رصيد سابق ${unitTag}`;
    case "col_sales":        return `مبيعات (+) ${unitTag}`;
    case "col_receipts":     return `سدادات (-) ${unitTag}`;
    case "col_returns":      return `مرتجعات (-) ${unitTag}`;
    case "col_closing":      return `صافي المديونية ${unitTag}`;
    case "col_coll_rate":    return `التحصيل`;
    case "col_status":       return `الحالة`;
    case "col_notes":        return `ملاحظات / توقيع`;
    default:                 return col.short;
  }
}

function renderColCellHtml(col, c, idx, cfg) {
  const isAllTime = cfg.profitScope === "allTime";
  switch (col.id) {
    case "_idx":
      return `<td style="text-align:center; color:#64748b;" class="mono">${idx + 1}</td>`;
    case "_name":
      return `<td style="font-weight:700; color:#0f172a; line-height:1.25;">${c.name}</td>`;
    case "col_code":
      return `<td style="text-align:center; font-weight:700; font-size:7.8px; word-break:break-word; color:#334155;" class="mono">${c.code || '—'}</td>`;
    case "col_last_payment":
      if (c.lastPaymentAmount > 0) {
        const ageColor = c.daysSinceLastPayment > 30 ? '#dc2626' : c.daysSinceLastPayment > 15 ? '#d97706' : '#64748b';
        return `
          <td style="text-align:center; line-height:1.2;">
            <div class="mono" style="font-weight:800; color:#059669; white-space:nowrap;">${formatPrintNum(c.lastPaymentAmount)}</div>
            <div class="mono" style="font-size:7px; color:${ageColor}; white-space:nowrap;">${c.lastPaymentDate || ''}${c.daysSinceLastPayment !== null ? ` • ${c.daysSinceLastPayment}ي` : ''}</div>
          </td>
        `;
      }
      return `<td style="text-align:center; color:#94a3b8; font-size:7.8px;">لم يسدد</td>`;
    case "col_contact":
      return `
        <td style="color:#475569; font-size:7.8px; line-height:1.25; overflow-wrap:anywhere;">
          ${c.phone ? `<div class="mono" style="white-space:nowrap;">📞 ${c.phone}</div>` : ''}
          ${c.shortLocation ? `<div>📍 ${c.shortLocation}</div>` : ''}
          ${!c.phone && !c.shortLocation ? '—' : ''}
        </td>
      `;
    case "col_profit": {
      const pAmt = isAllTime ? c.allTimeProfit : c.periodProfit;
      const pSub = isAllTime ? c.allTimeSalesSub : c.periodSalesSub;
      const pPct = isAllTime ? c.allTimeMarginPct : c.periodMarginPct;
      if (Math.abs(pSub) > 0.01 || Math.abs(pAmt) > 0.01) {
        const pColor = pAmt >= 0 ? '#059669' : '#dc2626';
        const pctColor = pPct >= 15 ? '#047857' : pPct >= 5 ? '#0369a1' : '#b45309';
        return `
          <td style="text-align:left; line-height:1.2;">
            <div class="mono" style="font-weight:800; color:${pColor}; white-space:nowrap;">${pAmt >= 0 ? '+' : ''}${formatPrintNum(pAmt)}</div>
            <div class="mono" style="font-size:7.2px; font-weight:800; color:${pctColor}; white-space:nowrap;">هامش ${pPct.toFixed(1)}%</div>
          </td>
        `;
      }
      return `<td style="text-align:left; color:#94a3b8;" class="mono">—</td>`;
    }
    case "col_opening":
      return `<td style="text-align:left; white-space:nowrap; color:#334155;" class="mono">${formatPrintNum(c.openingBalance)}</td>`;
    case "col_sales":
      return `<td style="text-align:left; white-space:nowrap; color:#1d4ed8;" class="mono">${c.periodSales ? formatPrintNum(c.periodSales) : '—'}</td>`;
    case "col_receipts":
      return `<td style="text-align:left; white-space:nowrap; color:#059669;" class="mono">${c.periodReceipts ? formatPrintNum(c.periodReceipts) : '—'}</td>`;
    case "col_returns":
      return `<td style="text-align:left; white-space:nowrap; color:#d97706;" class="mono">${c.periodReturns ? formatPrintNum(c.periodReturns) : '—'}</td>`;
    case "col_closing":
      return `
        <td style="text-align:left; white-space:nowrap; font-weight:900; color:${c.closingBalance > 0 ? '#dc2626' : c.closingBalance < 0 ? '#1d4ed8' : '#059669'}; background:${c.closingBalance > 0 ? 'rgba(254,226,226,0.35)' : 'transparent'};" class="mono">
          ${formatPrintNum(c.closingBalance)}
        </td>
      `;
    case "col_coll_rate": {
      const cDemand = Math.max(0, (c.periodSales || 0) + Math.max(0, (c.openingBalance || 0)));
      const cCollPct = cDemand > 0 ? Math.min(100, Math.round(((c.periodReceipts || 0) / cDemand) * 100)) : (c.closingBalance <= 0.01 ? 100 : 0);
      return `<td style="text-align:center; white-space:nowrap;" class="mono">${cCollPct}%</td>`;
    }
    case "col_status": {
      const badgeClass = c.status === "debtor" ? "badge-red" : c.status === "creditor" ? "badge-blue" : "badge-green";
      const badgeText  = c.status === "debtor" ? "مدين" : c.status === "creditor" ? "دائن" : "مسدد";
      return `<td style="text-align:center;"><span class="badge ${badgeClass}">${badgeText}</span></td>`;
    }
    case "col_notes":
      return `<td style="border-bottom:1px dashed #cbd5e1;"></td>`;
    default:
      return `<td></td>`;
  }
}

function renderColTotalCellHtml(col, totals, labelText, cfg, isGrand = false) {
  const isAllTime = cfg.profitScope === "allTime";
  switch (col.id) {
    case "_idx":
      return `<td style="text-align:center; font-weight:900;">Σ</td>`;
    case "_name":
      return `<td style="text-align:right; font-weight:900; line-height:1.25;">${labelText}</td>`;
    case "col_code":
    case "col_contact":
    case "col_notes":
      return `<td style="text-align:center; opacity:0.65;">—</td>`;
    case "col_last_payment":
      return `
        <td style="text-align:center; line-height:1.2;">
          <div class="mono" style="font-weight:900; color:${isGrand ? '#6ee7b7' : '#059669'}; white-space:nowrap;">${formatPrintNum(totals.lastPaymentTotal)}</div>
          <div style="font-size:6.8px; opacity:0.85;">${totals.paidCustomersCount} مسدد</div>
        </td>
      `;
    case "col_profit": {
      const pAmt = isAllTime ? totals.allTimeProfit : totals.periodProfit;
      const pPct = isAllTime ? totals.allTimeMarginPct : totals.periodMarginPct;
      return `
        <td style="text-align:left; line-height:1.2;">
          <div class="mono" style="font-weight:900; color:${isGrand ? (pAmt >= 0 ? '#6ee7b7' : '#fca5a5') : (pAmt >= 0 ? '#059669' : '#dc2626')}; white-space:nowrap;">${pAmt >= 0 ? '+' : ''}${formatPrintNum(pAmt)}</div>
          <div class="mono" style="font-size:7px; opacity:0.9;">${pPct.toFixed(1)}%</div>
        </td>
      `;
    }
    case "col_opening":
      return `<td style="text-align:left; white-space:nowrap;" class="mono">${formatPrintNum(totals.openingBalance)}</td>`;
    case "col_sales":
      return `<td style="text-align:left; white-space:nowrap; color:${isGrand ? '#93c5fd' : '#1d4ed8'};" class="mono">${formatPrintNum(totals.sales)}</td>`;
    case "col_receipts":
      return `<td style="text-align:left; white-space:nowrap; color:${isGrand ? '#6ee7b7' : '#059669'};" class="mono">${formatPrintNum(totals.receipts)}</td>`;
    case "col_returns":
      return `<td style="text-align:left; white-space:nowrap; color:${isGrand ? '#fde68a' : '#d97706'};" class="mono">${formatPrintNum(totals.returns)}</td>`;
    case "col_closing":
      return `<td style="text-align:left; white-space:nowrap; font-weight:900; color:${isGrand ? '#fca5a5' : (totals.closingBalance > 0 ? '#dc2626' : '#059669')};" class="mono">${formatPrintNum(isGrand ? totals.totalDebt : totals.closingBalance)}</td>`;
    case "col_coll_rate":
      return `<td style="text-align:center; white-space:nowrap;" class="mono">${totals.collectionRate}%</td>`;
    case "col_status":
      return `<td style="text-align:center; white-space:nowrap;">${totals.debtorCount} مدين</td>`;
    default:
      return `<td></td>`;
  }
}

function generateRepComparisonHtml(filteredReps, grandTotals, cfg) {
  if (!cfg.showRepMatrix || filteredReps.length <= 1) return "";
  const isAllTime = cfg.profitScope === "allTime";
  let rowsHtml = filteredReps.map((rep, idx) => {
    const rt = calculateRepVisibleTotals(rep.visibleCustomers);
    const pAmt = isAllTime ? rt.allTimeProfit : rt.periodProfit;
    const pPct = isAllTime ? rt.allTimeMarginPct : rt.periodMarginPct;
    return `
      <tr>
        <td style="text-align:center; color:#64748b;" class="mono">${idx + 1}</td>
        <td style="font-weight:800; color:#0f2e5a;">${rep.name}</td>
        <td style="text-align:center;" class="mono">${rt.totalCustomers} <span style="color:#dc2626;">(${rt.debtorCount})</span></td>
        <td style="text-align:left; white-space:nowrap; color:#059669;" class="mono">${formatPrintNum(rt.lastPaymentTotal)}</td>
        <td style="text-align:left; white-space:nowrap; color:${pAmt >= 0 ? '#059669' : '#dc2626'};" class="mono">${pAmt >= 0 ? '+' : ''}${formatPrintNum(pAmt)} <span style="font-size:7px;">(${pPct.toFixed(1)}%)</span></td>
        <td style="text-align:left; white-space:nowrap;" class="mono">${formatPrintNum(rt.openingBalance)}</td>
        <td style="text-align:left; white-space:nowrap; color:#1d4ed8;" class="mono">${formatPrintNum(rt.sales)}</td>
        <td style="text-align:left; white-space:nowrap; color:#059669;" class="mono">${formatPrintNum(rt.receipts)}</td>
        <td style="text-align:left; white-space:nowrap; color:#d97706;" class="mono">${formatPrintNum(rt.returns)}</td>
        <td style="text-align:left; white-space:nowrap; font-weight:900; color:#dc2626;" class="mono">${formatPrintNum(rt.closingBalance)}</td>
        <td style="text-align:center; font-weight:800;" class="mono">${rt.collectionRate}%</td>
      </tr>
    `;
  }).join("");

  const gpAmt = isAllTime ? grandTotals.allTimeProfit : grandTotals.periodProfit;
  const gpPct = isAllTime ? grandTotals.allTimeMarginPct : grandTotals.periodMarginPct;

  return `
    <div class="rep-matrix-box avoid-break">
      <div class="rep-matrix-title">📊 الملخص التنفيذي المقارن للمناديب (${filteredReps.length} مناديب)</div>
      <table class="summary-table" style="margin-bottom:2px; table-layout:auto;">
        <thead>
          <tr>
            <th style="width:22px; text-align:center;">#</th>
            <th style="text-align:right;">اسم المندوب</th>
            <th style="text-align:center;">العملاء</th>
            <th style="text-align:left;">آخر دفعات</th>
            <th style="text-align:left;">هامش الربح</th>
            <th style="text-align:left;">رصيد سابق</th>
            <th style="text-align:left;">مبيعات (+)</th>
            <th style="text-align:left;">سدادات (-)</th>
            <th style="text-align:left;">مرتجع (-)</th>
            <th style="text-align:left;">المديونية</th>
            <th style="text-align:center;">التحصيل</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
        <tfoot>
          <tr class="subtotal-row">
            <td colspan="2" style="text-align:right;">الإجمالي العام</td>
            <td style="text-align:center;" class="mono">${grandTotals.totalCustomers} (${grandTotals.debtorCount})</td>
            <td style="text-align:left; color:#059669;" class="mono">${formatPrintNum(grandTotals.lastPaymentTotal)}</td>
            <td style="text-align:left; color:${gpAmt >= 0 ? '#059669' : '#dc2626'};" class="mono">${gpAmt >= 0 ? '+' : ''}${formatPrintNum(gpAmt)} (${gpPct.toFixed(1)}%)</td>
            <td style="text-align:left;" class="mono">${formatPrintNum(grandTotals.openingBalance)}</td>
            <td style="text-align:left; color:#1d4ed8;" class="mono">${formatPrintNum(grandTotals.sales)}</td>
            <td style="text-align:left; color:#059669;" class="mono">${formatPrintNum(grandTotals.receipts)}</td>
            <td style="text-align:left; color:#d97706;" class="mono">${formatPrintNum(grandTotals.returns)}</td>
            <td style="text-align:left; color:#dc2626; font-weight:900;" class="mono">${formatPrintNum(grandTotals.closingBalance)}</td>
            <td style="text-align:center;" class="mono">${grandTotals.collectionRate}%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

function generateSummaryBodyHtml(filteredReps, grandTotals, cfg) {
  const activeCols = getActiveSummaryColumns(cfg);
  const colGroupHtml = `<colgroup>${activeCols.map(col => `<col style="width:${col.pctWidth};">`).join("")}</colgroup>`;
  const theadHtml = `<thead><tr>${activeCols.map(col => `<th style="text-align:${getColAlign(col.id)};">${renderColHeaderHtml(col, cfg)}</th>`).join("")}</tr></thead>`;

  let html = generateRepComparisonHtml(filteredReps, grandTotals, cfg);

  filteredReps.forEach(rep => {
    const repTotals = calculateRepVisibleTotals(rep.visibleCustomers);
    html += `
      <div class="rep-banner">
        <div class="rep-title">
          <span>${rep.id === '__unassigned__' ? '🏢' : '👤'}</span>
          <span>المندوب: <b>${rep.name}</b> ${rep.code ? '(' + rep.code + ')' : ''}</span>
          ${rep.phone ? `<span style="font-size:9px; opacity:0.85; margin-right:6px;">📞 ${rep.phone}</span>` : ''}
          ${rep.zone ? `<span style="font-size:9px; opacity:0.85; margin-right:6px;">📍 ${rep.zone}</span>` : ''}
        </div>
        <div class="rep-meta">
          <span class="rep-meta-chip">👥 ${repTotals.totalCustomers} عميل</span>
          <span class="rep-meta-chip" style="background:rgba(239,68,68,0.28); color:#fecaca;">🔴 ${repTotals.debtorCount} مدين</span>
          <span class="rep-meta-chip">🎯 تحصيل: ${repTotals.collectionRate}%</span>
        </div>
      </div>

      <table class="summary-table fixed-table">
        ${colGroupHtml}
        ${theadHtml}
        <tbody>
          ${rep.visibleCustomers.map((c, idx) => `<tr>${activeCols.map(col => renderColCellHtml(col, c, idx, cfg)).join("")}</tr>`).join("")}
        </tbody>
        <tfoot>
          <tr class="subtotal-row">
            ${activeCols.map(col => renderColTotalCellHtml(col, repTotals, `مجموع: ${rep.name} (${repTotals.totalCustomers})`, cfg, false)).join("")}
          </tr>
        </tfoot>
      </table>
    `;
  });

  // Grand Total Table using IDENTICAL percentage colgroup so every column aligns pixel-for-pixel!
  html += `
    <table class="summary-table fixed-table" style="margin-top:10px;">
      ${colGroupHtml}
      <tbody>
        <tr class="grandtotal-row">
          ${activeCols.map(col => renderColTotalCellHtml(col, grandTotals, `الإجمالي العام (${grandTotals.totalCustomers} عميل)`, cfg, true)).join("")}
        </tr>
      </tbody>
    </table>
  `;

  return html;
}

function generateDetailedBodyHtml(filteredReps, grandTotals, cfg) {
  const isAllTime = cfg.profitScope === "allTime";
  const showLastPay = (cfg.columns || []).some(c => c.id === "col_last_payment" && c.enabled);
  const showProfit  = (cfg.columns || []).some(c => c.id === "col_profit" && c.enabled);

  let html = generateRepComparisonHtml(filteredReps, grandTotals, cfg);

  filteredReps.forEach(rep => {
    const repTotals = calculateRepVisibleTotals(rep.visibleCustomers);

    html += `
      <div class="rep-banner avoid-break">
        <div class="rep-title">
          <span>${rep.id === '__unassigned__' ? '🏢' : '👤'}</span>
          <span>المندوب: <b>${rep.name}</b> ${rep.code ? '(' + rep.code + ')' : ''}</span>
          ${rep.phone ? `<span style="font-size:9px; opacity:0.85; margin-right:6px;">📞 ${rep.phone}</span>` : ''}
          ${rep.zone ? `<span style="font-size:9px; opacity:0.85; margin-right:6px;">📍 ${rep.zone}</span>` : ''}
        </div>
        <div class="rep-meta">
          <span class="rep-meta-chip">👥 ${repTotals.totalCustomers} عميل</span>
          <span class="rep-meta-chip" style="background:rgba(239,68,68,0.28); color:#fecaca;">🔴 ${repTotals.debtorCount} مدين</span>
          <span class="rep-meta-chip">💰 صافي المديونية: ${formatPrintNum(repTotals.closingBalance)} ر.س</span>
        </div>
      </div>
    `;

    rep.visibleCustomers.forEach(c => {
      const badgeClass = c.status === "debtor" ? "badge-red" : c.status === "creditor" ? "badge-blue" : "badge-green";
      const badgeText  = c.status === "debtor" ? "مدين" : c.status === "creditor" ? "دائن" : "مسدد";
      const hasTx = c.transactions && c.transactions.length > 0;
      const pAmt = isAllTime ? c.allTimeProfit : c.periodProfit;
      const pPct = isAllTime ? c.allTimeMarginPct : c.periodMarginPct;

      html += `
        <div class="cust-card avoid-break">
          <div class="cust-card-header">
            <div class="cust-header-info">
              ${showLastPay
                ? (c.lastPaymentAmount > 0 ? `<span class="cust-code-pill mono" style="background:#059669;">💳 آخر سداد: ${formatPrintNum(c.lastPaymentAmount)} (${c.lastPaymentDate})</span>` : `<span class="cust-code-pill" style="background:#64748b;">لم يسدد</span>`)
                : `<span class="cust-code-pill mono">${c.code || 'CUST'}</span>`}
              <span class="cust-title-text">${c.name}</span>
              <span class="cust-phone-zone">
                ${c.phone ? `<span>📞 ${c.phone}</span>` : ''}
                ${c.shortLocation ? `<span style="margin-right:4px;">📍 ${c.shortLocation}</span>` : ''}
              </span>
              ${showProfit && (Math.abs(pAmt) > 0.01) ? `<span class="badge badge-blue">📈 ربح: ${formatPrintNum(pAmt)} (${pPct.toFixed(1)}%)</span>` : ''}
              <span class="badge ${badgeClass}">${badgeText}</span>
            </div>
            <div class="cust-card-kpis">
              <div class="cust-card-kpi-item"><span class="lbl">أول المدة:</span> <span class="val mono">${formatPrintNum(c.openingBalance)}</span></div>
              <div class="cust-card-kpi-item"><span class="lbl">مبيعات:</span> <span class="val mono" style="color:#1d4ed8;">${formatPrintNum(c.periodSales)}</span></div>
              <div class="cust-card-kpi-item"><span class="lbl">سدادات:</span> <span class="val mono" style="color:#059669;">${formatPrintNum(c.periodReceipts)}</span></div>
              <div class="cust-card-kpi-item"><span class="lbl">مرتجع:</span> <span class="val mono" style="color:#d97706;">${formatPrintNum(c.periodReturns)}</span></div>
              <div class="cust-card-kpi-item" style="background:#fee2e2; padding:1px 6px; border-radius:4px;">
                <span class="lbl" style="color:#991b1b;">الرصيد:</span> 
                <span class="val mono" style="color:${c.closingBalance > 0 ? '#dc2626' : c.closingBalance < 0 ? '#1d4ed8' : '#059669'}; font-weight:900;">
                  ${formatPrintNum(c.closingBalance)}
                </span>
              </div>
            </div>
          </div>
      `;

      if (hasTx) {
        html += `
          <table class="txns-table">
            <thead>
              <tr>
                <th style="width:72px;">التاريخ</th>
                <th style="width:82px;">نوع المستند</th>
                <th style="width:90px;">رقم المرجع</th>
                <th>البيان والتفاصيل</th>
                <th style="width:72px; text-align:left;">مدين (+) <span class="th-unit">(ر.س)</span></th>
                <th style="width:72px; text-align:left;">دائن (-) <span class="th-unit">(ر.س)</span></th>
                <th style="width:82px; text-align:left;">الرصيد المترتب</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background:#f8fafc; font-weight:700;">
                <td style="color:#64748b;">—</td>
                <td><span class="badge badge-blue">رصيد سابق</span></td>
                <td class="mono" style="color:#64748b;">OPENING</td>
                <td style="color:#64748b;">رصيد أول المدة ما قبل تاريخ بداية التقرير</td>
                <td style="text-align:left;" class="mono">${c.openingBalance > 0 ? formatPrintNum(c.openingBalance) : '—'}</td>
                <td style="text-align:left;" class="mono">${c.openingBalance < 0 ? formatPrintNum(Math.abs(c.openingBalance)) : '—'}</td>
                <td style="text-align:left; font-weight:900;" class="mono">${formatPrintNum(c.openingBalance)}</td>
              </tr>
              ${c.transactions.map(t => {
                const typeLabel = t.type === 'invoice' ? 'فاتورة مبيعات' : t.type === 'receipt' ? 'سند قبض' : t.type === 'delivery_note' ? 'سند تسليم (DN)' : 'مرتجع مبيعات';
                const badgeStyle = t.type === 'invoice' ? 'badge-blue' : t.type === 'receipt' ? 'badge-green' : t.type === 'return' ? 'badge-amber' : 'badge-gray';
                return `
                  <tr>
                    <td class="mono" style="white-space:nowrap; color:#475569;">${t.date || '—'}</td>
                    <td><span class="badge ${badgeStyle}">${typeLabel}</span></td>
                    <td class="mono" style="font-weight:800; color:#1e40af;">${t.docNum || '—'}</td>
                    <td style="color:#334155;">${t.notes || '—'}</td>
                    <td style="text-align:left; white-space:nowrap; font-weight:${t.debit ? '800' : 'normal'}; color:${t.debit ? '#1d4ed8' : '#94a3b8'};" class="mono">
                      ${t.debit ? formatPrintNum(t.debit) : '—'}
                    </td>
                    <td style="text-align:left; white-space:nowrap; font-weight:${t.credit ? '800' : 'normal'}; color:${t.credit ? '#059669' : '#94a3b8'};" class="mono">
                      ${t.credit ? formatPrintNum(t.credit) : '—'}
                    </td>
                    <td style="text-align:left; white-space:nowrap; font-weight:900; color:${t.runningBalance > 0 ? '#dc2626' : t.runningBalance < 0 ? '#1d4ed8' : '#059669'};" class="mono">
                      ${formatPrintNum(t.runningBalance)}
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" style="text-align:right;">مجموع حركات الفترة وصافي رصيد العميل الختامي (ر.س)</td>
                <td style="text-align:left; color:#1d4ed8;" class="mono">${formatPrintNum(c.periodSales)}</td>
                <td style="text-align:left; color:#059669;" class="mono">${formatPrintNum(c.periodReceipts + c.periodReturns)}</td>
                <td style="text-align:left; font-weight:900; color:${c.closingBalance > 0 ? '#dc2626' : '#059669'};" class="mono">${formatPrintNum(c.closingBalance)}</td>
              </tr>
            </tfoot>
          </table>
        `;
      } else {
        html += `
          <div class="empty-txns-line">
            <span>ℹ️ لا توجد حركات بيع أو سداد أو مرتجع مسجلة خلال الفترة المحددة</span>
            <span>رصيد أول المدة: <b class="mono">${formatPrintNum(c.openingBalance)}</b> &nbsp;|&nbsp; صافي المديونية القائمة: <b class="mono" style="color:${c.closingBalance > 0 ? '#dc2626' : '#059669'};">${formatPrintNum(c.closingBalance)} ر.س</b></span>
          </div>
        `;
      }

      html += `</div>`;
    });
  });

  return html;
}

function generateHierarchicalDebtHtml(mode, data, autoPrint = true) {
  const {
    company,
    filteredReps,
    totals,
    fromDate,
    toDate,
    repFilterName,
    statusFilterName,
    stampSrc,
    cfg
  } = data;

  const isSummary   = mode === 'summary';
  const isLandscape = cfg.orientation === "landscape";
  const hiddenCnt   = filteredReps._hiddenNegligibleCount || 0;
  const hiddenSum   = filteredReps._hiddenNegligibleSum || 0;
  const reportTitle = isSummary
    ? "تقرير المديونيات الهرمي الشجري ومتابعة التحصيل (ملخص تنفيذي)"
    : "تقرير المديونيات الهرمي الشجري وكشوف الحركات (تفصيلي موسع)";

  const hijriNow   = getHijriDate();
  const dateNowStr = todayString();
  const timeNow    = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

  const logoHtml = company.logoUrl ? `
    <img src="${company.logoUrl}" alt="${company.name}" class="header-logo" />
  ` : `
    <div style="border:2px solid #0f2e5a; padding:4px 10px; border-radius:6px; text-align:center; background:#f8fafc;">
      <div style="font-size:16px; line-height:1.1;">🏢</div>
      <div style="font-size:8pt; font-weight:900; color:#0f2e5a;">${company.name}</div>
    </div>
  `;

  const bodyHtml = isSummary
    ? generateSummaryBodyHtml(filteredReps, totals, cfg)
    : generateDetailedBodyHtml(filteredReps, totals, cfg);

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>${reportTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #0f2e5a;
      --primary-light: #1e40af;
      --accent: #b45309;
      --success: #059669;
      --danger: #dc2626;
      --border: #cbd5e1;
      --text: #0f172a;
      --text-muted: #475569;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Cairo', system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 0;
      color: var(--text);
      background: #e2e8f0;
      font-size: 10.5px;
      line-height: 1.35;
      direction: rtl;
    }
    .mono {
      font-family: 'IBM Plex Mono', monospace, sans-serif;
      font-variant-numeric: tabular-nums;
    }

    /* Sticky Preview Control Bar */
    .screen-control-bar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #0f2e5a;
      color: #fff;
      padding: 9px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .screen-control-bar .btn-group {
      display: flex;
      gap: 7px;
      align-items: center;
      flex-wrap: wrap;
    }
    .screen-btn, .screen-select {
      border: none;
      border-radius: 6px;
      padding: 6px 12px;
      font-weight: 700;
      font-family: inherit;
      font-size: 11.5px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s;
    }
    .screen-select { background: #1e3a8a; color: #fff; border: 1px solid rgba(255,255,255,0.3); }
    .screen-btn-primary { background: #f59e0b; color: #0f172a; font-weight: 900; }
    .screen-btn-primary:hover { background: #d97706; color: #fff; }
    .screen-btn-secondary { background: rgba(255,255,255,0.16); color: #fff; border: 1px solid rgba(255,255,255,0.3); }
    .screen-btn-secondary:hover { background: rgba(255,255,255,0.28); }
    .screen-btn-close { background: #dc2626; color: #fff; }
    .screen-btn-close:hover { background: #b91c1c; }

    /* Print Paper Container */
    .print-sheet {
      width: ${isLandscape ? '297mm' : '210mm'};
      min-height: ${isLandscape ? '210mm' : '297mm'};
      margin: 14px auto;
      background: #fff;
      padding: 8mm 8mm;
      box-shadow: 0 6px 24px rgba(0,0,0,0.12);
      border-radius: 4px;
    }

    /* Official Header */
    .official-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-top: 3.5px solid var(--primary);
      border-bottom: 2px solid var(--primary);
      padding: 8px 6px;
      margin-bottom: 10px;
      gap: 12px;
      background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
    }
    .company-col { flex: 1.25; text-align: right; }
    .company-name { font-size: 14px; font-weight: 900; color: var(--primary); margin-bottom: 2px; }
    .company-sub { font-size: 9px; color: var(--text-muted); font-weight: 600; margin-bottom: 3px; }
    .company-meta-item { font-size: 8.5px; color: #334155; font-weight: 600; margin-top: 2px; }
    .center-col { flex: 1.55; text-align: center; }
    .report-title-badge {
      display: inline-block;
      background: linear-gradient(135deg, #0f2e5a 0%, #1e3a8a 100%);
      color: #fff;
      padding: 4px 14px;
      border-radius: 6px;
      font-size: 12.5px;
      font-weight: 900;
    }
    .report-mode-tag {
      display: inline-block;
      margin-top: 4px;
      padding: 2px 10px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      border-radius: 4px;
      font-weight: 800;
      font-size: 9px;
    }
    .report-period-text { margin-top: 4px; font-size: 9px; color: #475569; font-weight: 700; }
    .logo-col { flex: 1; text-align: left; display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
    .header-logo { max-height: 46px; max-width: 115px; object-fit: contain; }
    .meta-tag { font-size: 8px; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 1px 6px; border-radius: 4px; color: #475569; font-weight: 600; }

    /* KPI Summary Strip */
    .kpi-strip { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-bottom: 8px; }
    .kpi-box { border: 1.2px solid var(--border); border-radius: 6px; padding: 5px 6px; background: #fff; text-align: center; }
    .kpi-box.debt { border-color: #fca5a5; background: #fef2f2; }
    .kpi-box.sales { border-color: #bfdbfe; background: #eff6ff; }
    .kpi-box.receipts { border-color: #a7f3d0; background: #ecfdf5; }
    .kpi-box.returns { border-color: #fde68a; background: #fffbeb; }
    .kpi-box.rate { border-color: #ddd6fe; background: #f5f3ff; }
    .kpi-box-lbl { font-size: 8px; font-weight: 700; color: #475569; margin-bottom: 1px; }
    .kpi-box-val { font-size: 11px; font-weight: 900; font-family: 'IBM Plex Mono', monospace; white-space: nowrap; }
    .kpi-box.debt .kpi-box-val { color: #dc2626; }
    .kpi-box.sales .kpi-box-val { color: #1d4ed8; }
    .kpi-box.receipts .kpi-box-val { color: #059669; }
    .kpi-box.returns .kpi-box-val { color: #d97706; }
    .kpi-box.rate .kpi-box-val { color: #7c3aed; }
    .kpi-box-sub { font-size: 7.5px; font-weight: 600; color: #64748b; }

    /* Filter Context Banner */
    .filter-context-banner {
      background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 5px;
      padding: 4px 8px; margin-bottom: 9px; display: flex; justify-content: space-between;
      align-items: center; font-size: 8.5px; color: #334155; flex-wrap: wrap; gap: 4px;
    }

    /* Rep Matrix Summary */
    .rep-matrix-box { margin-bottom: 10px; border: 1.5px solid #bfdbfe; border-radius: 6px; padding: 6px; background: #f8fafc; }
    .rep-matrix-title { font-size: 10px; font-weight: 900; color: #0f2e5a; margin-bottom: 5px; }

    /* Rep Banner */
    .rep-banner {
      background: #0f2e5a; color: #fff; padding: 4px 8px; border-radius: 4px;
      margin-top: 9px; margin-bottom: 4px; display: flex; justify-content: space-between;
      align-items: center; page-break-after: avoid; break-after: avoid;
    }
    .rep-title { font-size: 10.5px; font-weight: 800; display: flex; align-items: center; gap: 6px; }
    .rep-meta { font-size: 8.5px; font-weight: 600; display: flex; gap: 6px; align-items: center; }
    .rep-meta-chip { background: rgba(255,255,255,0.16); padding: 1.5px 6px; border-radius: 4px; }

    /* Summary Table */
    table.summary-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 8.6px; }
    table.summary-table.fixed-table { table-layout: fixed; }
    table.summary-table th {
      background: #1e3a8a; color: #fff; padding: 4px 3px; font-weight: 800;
      border: 1px solid #1e3a8a; font-size: 8.2px; line-height: 1.15;
    }
    .th-unit { display: block; font-size: 6.8px; font-weight: 500; opacity: 0.85; }
    table.summary-table td {
      padding: 3.5px 3.5px; border: 1px solid #cbd5e1; vertical-align: middle; font-size: 8.6px; overflow: hidden;
    }
    table.summary-table tbody tr:nth-child(even) { background: #f8fafc; }
    table.summary-table tr.subtotal-row {
      background: #e2e8f0 !important; font-weight: 900;
      border-top: 2px solid #0f2e5a; border-bottom: 2px solid #0f2e5a;
    }
    table.summary-table tr.grandtotal-row {
      background: #0f2e5a !important; color: #fff !important; font-weight: 900; font-size: 9px;
    }
    table.summary-table tr.grandtotal-row td { border-color: #0f2e5a; color: #fff; padding: 5px 3.5px; }

    /* Badges */
    .badge { display: inline-block; padding: 1.5px 5px; border-radius: 4px; font-size: 7.4px; font-weight: 800; text-align: center; white-space: nowrap; }
    .badge-red { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    .badge-green { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
    .badge-blue { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
    .badge-amber { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
    .badge-gray { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }

    /* Detailed Cards */
    .cust-card {
      border: 1.2px solid var(--border); border-radius: 5px; margin-bottom: 6px;
      background: #fff; overflow: hidden; page-break-inside: avoid; break-inside: avoid;
    }
    .cust-card-header {
      background: #f8fafc; padding: 4px 8px; border-bottom: 1px solid var(--border);
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 4px;
    }
    .cust-header-info { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .cust-code-pill { background: #0f2e5a; color: #fff; padding: 1px 5px; border-radius: 3px; font-size: 8px; font-weight: 800; }
    .cust-title-text { font-size: 10px; font-weight: 800; color: #0f172a; }
    .cust-phone-zone { font-size: 8px; color: #64748b; }
    .cust-card-kpis { display: flex; gap: 7px; align-items: center; font-size: 8.5px; }
    .cust-card-kpi-item { display: flex; gap: 3px; }
    .cust-card-kpi-item span.lbl { color: #64748b; font-weight: 700; }
    .cust-card-kpi-item span.val { font-weight: 800; font-family: 'IBM Plex Mono', monospace; white-space: nowrap; }

    table.txns-table { width: 100%; border-collapse: collapse; font-size: 8.2px; }
    table.txns-table th { background: #334155; color: #fff; padding: 3px 5px; font-size: 7.8px; font-weight: 700; text-align: right; border: 1px solid #334155; }
    table.txns-table td { padding: 2.5px 5px; border: 1px solid #e2e8f0; vertical-align: middle; font-size: 8.2px; }
    table.txns-table tbody tr:nth-child(even) { background: #fafafa; }
    table.txns-table tfoot tr { background: #f1f5f9; font-weight: 800; border-top: 1.2px solid #94a3b8; }
    .empty-txns-line {
      padding: 3px 8px; background: #f8fafc; font-size: 8.2px; color: #475569;
      border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: center;
    }

    /* Signatures */
    .signatures-block {
      margin-top: 14px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
      page-break-inside: avoid; break-inside: avoid; border-top: 1.5px solid #cbd5e1; padding-top: 8px;
    }
    .signature-box {
      border: 1px dashed #94a3b8; border-radius: 5px; padding: 5px 8px; text-align: center;
      background: #fff; min-height: 66px; display: flex; flex-direction: column; justify-content: space-between;
    }
    .sig-title { font-size: 8.5px; font-weight: 800; color: var(--primary); }
    .sig-line { border-bottom: 1px solid #cbd5e1; margin-top: 22px; margin-bottom: 2px; }
    .sig-sub { font-size: 7.2px; color: #94a3b8; }
    .report-footer {
      margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 4px;
      display: flex; justify-content: space-between; align-items: center; font-size: 7.8px; color: #64748b;
      page-break-inside: avoid; break-inside: avoid;
    }

    @media print {
      body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
      .no-print { display: none !important; }
      .print-sheet {
        width: 100% !important; min-height: auto !important;
        margin: 0 !important; padding: 0 !important; box-shadow: none !important; border-radius: 0 !important;
      }
      @page {
        size: A4 ${cfg.orientation};
        margin: 6mm 6mm 8mm 6mm;
      }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; break-inside: avoid; }
      .avoid-break { page-break-inside: avoid !important; break-inside: avoid !important; }
    }
  </style>
</head>
<body>

  <!-- Interactive Sticky Preview Bar -->
  <div class="screen-control-bar no-print">
    <div style="display:flex; align-items:center; gap:8px;">
      <span style="font-size:12.5px; font-weight:800;">📊 ${isSummary ? 'معاينة PDF (مختصر)' : 'معاينة PDF (موسع)'}</span>
      <select class="screen-select" onchange="window._hdebtSwitchPreset(this.value)" title="تبديل قالب الأعمدة فوراً">
        <option value="standard" ${cfg.preset === 'standard' ? 'selected' : ''}>🏛️ القالب القياسي</option>
        <option value="profit_collection" ${cfg.preset === 'profit_collection' ? 'selected' : ''}>💎 قالب الربحية وآخر تحصيل</option>
        <option value="field_followup" ${cfg.preset === 'field_followup' ? 'selected' : ''}>📋 متابعة المندوب الميدانية</option>
        <option value="comprehensive" ${cfg.preset === 'comprehensive' ? 'selected' : ''}>📊 القالب الشامل (أفقي)</option>
        ${cfg.preset === 'custom' ? '<option value="custom" selected>⚙️ مخصص يدوياً</option>' : ''}
      </select>
    </div>
    <div class="btn-group">
      <button class="screen-btn screen-btn-secondary" onclick="window._hdebtSwitchOrientation()">
        ${isLandscape ? '↕️ تبديل إلى عمودي' : '↔️ تبديل إلى أفقي'}
      </button>
      <button class="screen-btn screen-btn-secondary" onclick="window._hdebtSwitchMode('${isSummary ? 'detailed' : 'summary'}')">
        🔄 ${isSummary ? 'التبديل إلى الموسع' : 'التبديل إلى المختصر'}
      </button>
      <button class="screen-btn screen-btn-primary" onclick="window.print()">🖨️ طباعة الآن (A4) / حفظ PDF</button>
      <button class="screen-btn screen-btn-close" onclick="window.close()">✕ إغلاق</button>
    </div>
  </div>

  <!-- A4 Printable Sheet -->
  <div class="print-sheet">
    <!-- 1. Official Header -->
    <div class="official-header">
      <div class="company-col">
        <div class="company-name">${company.name || 'شركة نظم الإمداد المتطورة'}</div>
        <div class="company-sub">${company.subNameAr || 'تجارة وتوريد المواد الغذائية بالجملة'}</div>
        <div class="company-meta-item"><span>س.ت:</span> <b>${company.crNumber || '7054969006'}</b> &nbsp;|&nbsp; <span>الرقم الضريبي:</span> <b class="mono">${company.vatNumber || '314996148100003'}</b></div>
        <div class="company-meta-item"><span>هاتف:</span> <b>${company.phone || '0549141648'}</b> &nbsp;|&nbsp; <span>المدينة:</span> <b>${company.cityAr || 'ينبع - المملكة العربية السعودية'}</b></div>
      </div>

      <div class="center-col">
        <div class="report-title-badge">${reportTitle}</div>
        <div><span class="report-mode-tag">${PRESET_LABELS[cfg.preset] || 'نموذج معتمد'} — ${isLandscape ? 'أفقي' : 'عمودي'}</span></div>
        <div class="report-period-text">الفترة من: <b class="mono">${fromDate || 'بداية التعامل'}</b> إلى: <b class="mono">${toDate || 'تاريخ اليوم'}</b></div>
      </div>

      <div class="logo-col">
        ${logoHtml}
        <div class="meta-tag">تاريخ الاستخراج: ${dateNowStr}</div>
        <div class="meta-tag">الوقت: ${timeNow}</div>
      </div>
    </div>

    ${cfg.showKpis ? `
    <!-- 2. KPI Summary Strip -->
    <div class="kpi-strip">
      <div class="kpi-box debt">
        <div class="kpi-box-lbl">إجمالي المديونيات القائمة</div>
        <div class="kpi-box-val">${formatCurrency(totals.totalDebt)}</div>
        <div class="kpi-box-sub">${totals.debtorCount} عميل مدين (من ${totals.totalCustomers})</div>
      </div>
      <div class="kpi-box sales">
        <div class="kpi-box-lbl">إجمالي مبيعات الفترة</div>
        <div class="kpi-box-val">${formatCurrency(totals.sales)}</div>
        <div class="kpi-box-sub">ربح الفترة: ${formatCurrency(totals.periodProfit)} (${totals.periodMarginPct}%)</div>
      </div>
      <div class="kpi-box receipts">
        <div class="kpi-box-lbl">إجمالي التحصيلات (سدادات)</div>
        <div class="kpi-box-val">${formatCurrency(totals.receipts)}</div>
        <div class="kpi-box-sub">آخر سدادات: ${formatCurrency(totals.lastPaymentTotal)}</div>
      </div>
      <div class="kpi-box returns">
        <div class="kpi-box-lbl">إجمالي المردودات</div>
        <div class="kpi-box-val">${formatCurrency(totals.returns)}</div>
        <div class="kpi-box-sub">إشعارات دائنة ومرتجع</div>
      </div>
      <div class="kpi-box rate">
        <div class="kpi-box-lbl">نسبة التحصيل الكلية</div>
        <div class="kpi-box-val">${totals.collectionRate}%</div>
        <div class="kpi-box-sub">صافي الذمم: ${formatCurrency(totals.netReceivables)}</div>
      </div>
    </div>` : ''}

    <!-- 3. Filter Context Banner -->
    <div class="filter-context-banner">
      <div>
        <span>📅 <b>الفترة:</b> ${fromDate || 'البداية'} ➔ ${toDate || 'اليوم'}</span>
        <span style="margin:0 5px;">|</span>
        <span>👤 <b>المندوب:</b> ${repFilterName}</span>
        <span style="margin:0 5px;">|</span>
        <span>⚖️ <b>الحالة:</b> ${statusFilterName}</span>
        ${hiddenCnt > 0 ? `<span style="margin:0 5px;">|</span><span style="color:#b45309;">🧹 مستثنى ${hiddenCnt} عميل (&lt; 1 ر.س) بإجمالي ${formatPrintNum(hiddenSum)} ر.س</span>` : ''}
      </div>
      <div style="font-weight:700;">
        <span>المناديب: <b>${filteredReps.length}</b> &nbsp;|&nbsp; العملاء: <b>${totals.totalCustomers}</b></span>
      </div>
    </div>

    <!-- 4. Body -->
    ${bodyHtml}

    ${cfg.showSignatures ? `
    <!-- 5. Signatures -->
    <div class="signatures-block">
      <div class="signature-box">
        <div class="sig-title">إعداد / محاسب المبيعات والعملاء</div>
        <div class="sig-line"></div>
        <div class="sig-sub">التوقيع والتاريخ</div>
      </div>
      <div class="signature-box">
        <div class="sig-title">مراجعة / مشرف التحصيل</div>
        <div class="sig-line"></div>
        <div class="sig-sub">التوقيع والتاريخ</div>
      </div>
      <div class="signature-box">
        <div class="sig-title">اعتماد / المدير المالي</div>
        <div class="sig-line"></div>
        <div class="sig-sub">التوقيع والتاريخ</div>
      </div>
      <div class="signature-box" style="position:relative; display:flex; align-items:center; justify-content:center;">
        <div class="sig-title" style="position:absolute; top:5px; right:6px;">الختم الرسمي للمنشأة</div>
        ${stampSrc ? `<img src="${stampSrc}" style="max-height:52px; max-width:78px; object-fit:contain; opacity:0.85; margin-top:10px;" />` : `<div style="font-size:9px; color:#94a3b8; margin-top:16px;">[ ختم الشركة المعتمد ]</div>`}
      </div>
    </div>` : ''}

    <!-- 6. Footer -->
    <div class="report-footer">
      <div>نظام إدهام ERP — تقرير المديونيات الهرمي الشجري | رقم الوثيقة: HDEBT-${dateNowStr.replace(/-/g,'')}</div>
      <div>صفحة رسمية معتمدة محاسبياً 100% مستخرجة بتاريخ ${dateNowStr}م (${hijriNow}هـ)</div>
    </div>
  </div>

  <script>
    window._hdebtSwitchMode = function(newMode) {
      if (window.opener && window.opener._reopenHierarchicalDebtPreview) {
        window.opener._reopenHierarchicalDebtPreview(window, { mode: newMode });
      }
    };
    window._hdebtSwitchOrientation = function() {
      if (window.opener && window.opener._reopenHierarchicalDebtPreview) {
        window.opener._reopenHierarchicalDebtPreview(window, { mode: '${mode}', toggleOrientation: true });
      }
    };
    window._hdebtSwitchPreset = function(presetKey) {
      if (window.opener && window.opener._reopenHierarchicalDebtPreview) {
        window.opener._reopenHierarchicalDebtPreview(window, { mode: '${mode}', preset: presetKey });
      }
    };
    ${autoPrint ? `
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 420);
    });
    ` : ''}
  </script>
</body>
</html>`;
}

// ──────────────────────────────────────────
// Column Customizer Modal Controller
// ──────────────────────────────────────────
let _draftExportCfg = null;

function renderCustomizerModalBody() {
  const body = document.getElementById("hdebt-col-modal-body");
  if (!body || !_draftExportCfg) return;
  const cfg = _draftExportCfg;
  const previewCols = getActiveSummaryColumns(cfg);

  body.innerHTML = `
    <!-- Live Preview Column Order Ribbon -->
    <div style="font-size:11px; font-weight:800; color:#475569; margin-bottom:5px;">👁️ ترتيب الأعمدة الفعلي في التقرير المطبوع (من اليمين لليسار):</div>
    <div class="hdebt-preview-ribbon">
      ${previewCols.map(c => `<span class="hdebt-preview-chip">${c.short}</span>`).join('<span style="opacity:0.5;">➔</span>')}
    </div>

    <!-- Presets -->
    <div style="font-size:12px; font-weight:900; color:#0f2e5a; margin-bottom:6px;">⚡ 1. قوالب جاهزة بضغطة زر:</div>
    <div class="hdebt-presets-grid">
      <button type="button" class="hdebt-preset-card ${cfg.preset === 'profit_collection' ? 'is-active' : ''}" onclick="window.applyHierarchicalPreset('profit_collection')">
        <div style="font-weight:900; font-size:12px; color:#0f2e5a;">💎 الربحية وآخر تحصيل</div>
        <div style="font-size:10px; color:#475569; margin-top:2px;">يستبدل الكود بـ <b>آخر تحصيل</b> والمعلومات بـ <b>هامش الربح</b></div>
      </button>
      <button type="button" class="hdebt-preset-card ${cfg.preset === 'standard' ? 'is-active' : ''}" onclick="window.applyHierarchicalPreset('standard')">
        <div style="font-weight:900; font-size:12px; color:#0f2e5a;">🏛️ القالب القياسي</div>
        <div style="font-size:10px; color:#475569; margin-top:2px;">كود العميل + معلومات التواصل + الحركات المالية</div>
      </button>
      <button type="button" class="hdebt-preset-card ${cfg.preset === 'field_followup' ? 'is-active' : ''}" onclick="window.applyHierarchicalPreset('field_followup')">
        <div style="font-weight:900; font-size:12px; color:#0f2e5a;">📋 متابعة المندوب الميدانية</div>
        <div style="font-size:10px; color:#475569; margin-top:2px;">العميل + التواصل + آخر تحصيل + المديونية + توقيع</div>
      </button>
      <button type="button" class="hdebt-preset-card ${cfg.preset === 'comprehensive' ? 'is-active' : ''}" onclick="window.applyHierarchicalPreset('comprehensive')">
        <div style="font-weight:900; font-size:12px; color:#0f2e5a;">📊 الشامل الكامل (أفقي)</div>
        <div style="font-size:10px; color:#475569; margin-top:2px;">يعرض كافة الأعمدة معاً في ورقة A4 أفقية</div>
      </button>
    </div>

    <!-- Quick Swaps -->
    <div style="font-size:12px; font-weight:900; color:#0f2e5a; margin-bottom:6px;">🔄 2. أزرار استبدال الأعمدة الفورية (استبدال المكان والمحتوى):</div>
    <div class="hdebt-swap-bar">
      <button type="button" class="hdebt-swap-btn" onclick="window.swapHierarchicalColumns('col_code', 'col_last_payment')">
        🔄 استبدال [كود العميل] ⇄ [آخر تحصيل (مبلغ وتاريخ)]
      </button>
      <button type="button" class="hdebt-swap-btn" onclick="window.swapHierarchicalColumns('col_contact', 'col_profit')">
        🔄 استبدال [معلومات العميل] ⇄ [هامش الربح والمجمل %]
      </button>
    </div>

    <!-- Column List with Reorder -->
    <div style="font-size:12px; font-weight:900; color:#0f2e5a; margin-bottom:6px;">🎛️ 3. التحكم الدقيق في الأعمدة والترتيب:</div>
    <div class="hdebt-col-list">
      ${cfg.columns.map((col, i) => `
        <div class="hdebt-col-item ${col.locked ? 'is-locked' : (col.enabled ? 'is-enabled' : '')}">
          <label style="display:flex; align-items:center; gap:10px; cursor:${col.locked ? 'default' : 'pointer'}; flex:1;">
            <input type="checkbox" ${(col.enabled || col.locked) ? 'checked' : ''} ${col.locked ? 'disabled' : ''} onchange="window.toggleHierarchicalCol(${i}, this.checked)" style="width:16px; height:16px; accent-color:#1e40af;" />
            <div>
              <div style="font-weight:800; font-size:12px; color:#0f172a;">${col.label} ${col.locked ? '<span style="font-size:10px; color:#1e40af;">(ثابت)</span>' : ''}</div>
              <div style="font-size:10px; color:#64748b;">${col.desc}</div>
            </div>
          </label>
          <div style="display:flex; gap:4px; align-items:center;">
            <button type="button" class="hdebt-order-btn" onclick="window.moveHierarchicalCol(${i}, -1)" ${i === 0 ? 'disabled' : ''} title="تحريك لليمين / للأعلى">▲</button>
            <button type="button" class="hdebt-order-btn" onclick="window.moveHierarchicalCol(${i}, 1)" ${i === cfg.columns.length - 1 ? 'disabled' : ''} title="تحريك لليسار / للأسفل">▼</button>
          </div>
        </div>
      `).join("")}
    </div>

    <!-- Layout & Metric Options -->
    <div class="hdebt-opt-grid">
      <div>
        <label style="display:block; font-size:11px; font-weight:800; color:#334155; margin-bottom:4px;">📐 اتجاه ورقة الطباعة (PDF)</label>
        <select class="hdebt-select" style="width:100%;" onchange="window.updateHierarchicalOption('orientation', this.value)">
          <option value="portrait" ${cfg.orientation === 'portrait' ? 'selected' : ''}>📄 عمودي (A4 Portrait)</option>
          <option value="landscape" ${cfg.orientation === 'landscape' ? 'selected' : ''}>↔️ أفقي (A4 Landscape — مثالي للأعمدة الكثيرة)</option>
        </select>
      </div>
      <div>
        <label style="display:block; font-size:11px; font-weight:800; color:#334155; margin-bottom:4px;">📈 نطاق احتساب هامش الربح</label>
        <select class="hdebt-select" style="width:100%;" onchange="window.updateHierarchicalOption('profitScope', this.value)">
          <option value="period" ${cfg.profitScope === 'period' ? 'selected' : ''}>📅 مبيعات الفترة المحددة فقط (افتراضي)</option>
          <option value="allTime" ${cfg.profitScope === 'allTime' ? 'selected' : ''}>♾️ التراكمي الكامل لتاريخ العميل</option>
        </select>
      </div>
      <div style="grid-column: 1 / -1; display:flex; flex-wrap:wrap; gap:14px; padding-top:4px;">
        <label style="display:flex; align-items:center; gap:6px; font-size:11.5px; font-weight:700; cursor:pointer;">
          <input type="checkbox" ${cfg.showRepMatrix ? 'checked' : ''} onchange="window.updateHierarchicalOption('showRepMatrix', this.checked)" />
          📊 إظهار جدول مقارنة المناديب بأعلى التقرير
        </label>
        <label style="display:flex; align-items:center; gap:6px; font-size:11.5px; font-weight:700; cursor:pointer;">
          <input type="checkbox" ${cfg.showKpis ? 'checked' : ''} onchange="window.updateHierarchicalOption('showKpis', this.checked)" />
          📌 إظهار بطاقات المؤشرات (KPIs)
        </label>
        <label style="display:flex; align-items:center; gap:6px; font-size:11.5px; font-weight:700; cursor:pointer;">
          <input type="checkbox" ${cfg.showSignatures ? 'checked' : ''} onchange="window.updateHierarchicalOption('showSignatures', this.checked)" />
          ✍️ إظهار التوقيعات والختم الرسمي
        </label>
        <label style="display:flex; align-items:center; gap:6px; font-size:11.5px; font-weight:700; color:#b45309; cursor:pointer;">
          <input type="checkbox" ${cfg.hideNegligible ? 'checked' : ''} onchange="window.updateHierarchicalOption('hideNegligible', this.checked)" />
          🧹 استبعاد الأرصدة الهامشية (&lt; 1 ر.س بدون حركة)
        </label>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────
// Interaction & Export Global Handlers
// ──────────────────────────────────────────
function setupGlobalHandlers() {
  window.toggleHierarchicalRep = (repId) => {
    if (expandedReps.has(repId)) expandedReps.delete(repId);
    else expandedReps.add(repId);
    renderTree();
  };

  window.toggleHierarchicalCust = (custId) => {
    if (expandedCusts.has(custId)) expandedCusts.delete(custId);
    else expandedCusts.add(custId);
    renderTree();
  };

  window.expandAllHierarchicalDebt = (expand = true) => {
    if (expand) {
      processedData.forEach(r => {
        expandedReps.add(r.id);
        r.customers.forEach(c => expandedCusts.add(c.id));
      });
    } else {
      expandedReps.clear();
      expandedCusts.clear();
    }
    renderTree();
  };

  window.applyHierarchicalDebtFilters = () => renderTree();

  window.setHierarchicalDebtPeriod = (preset) => {
    const today = new Date();
    const toInput = document.getElementById("hdebt-to");
    const fromInput = document.getElementById("hdebt-from");
    if (!toInput || !fromInput) return;

    toInput.value = today.toISOString().split("T")[0];
    if (preset === "today") fromInput.value = today.toISOString().split("T")[0];
    else if (preset === "week") {
      const d = new Date(today); d.setDate(d.getDate() - 7);
      fromInput.value = d.toISOString().split("T")[0];
    } else if (preset === "mtd") {
      fromInput.value = today.toISOString().split("T")[0].slice(0, 8) + "01";
    } else if (preset === "lastMonth") {
      const d = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endD = new Date(today.getFullYear(), today.getMonth(), 0);
      fromInput.value = d.toISOString().split("T")[0];
      toInput.value = endD.toISOString().split("T")[0];
    } else if (preset === "all") {
      fromInput.value = "2024-01-01";
    }
    loadHierarchicalDebtData();
  };

  window.openCustomerUnifiedStatement = (custId) => {
    if (typeof window.navigate === "function") {
      window._preselectedStatementEntity = { type: "customer", id: custId };
      window.navigate("report-customer-statement");
    }
  };

  // Modal Handlers
  window.openHierarchicalDebtCustomizer = () => {
    _draftExportCfg = loadExportConfig();
    renderCustomizerModalBody();
    const modal = document.getElementById("hdebt-col-modal");
    if (modal) modal.style.display = "flex";
  };

  window.closeHierarchicalDebtCustomizer = () => {
    const modal = document.getElementById("hdebt-col-modal");
    if (modal) modal.style.display = "none";
  };

  window.applyHierarchicalPreset = (presetKey) => {
    const prev = _draftExportCfg || loadExportConfig();
    const next = getPresetConfig(presetKey);
    next.profitScope    = prev.profitScope;
    next.showRepMatrix  = prev.showRepMatrix;
    next.showKpis       = prev.showKpis;
    next.showSignatures = prev.showSignatures;
    next.hideNegligible = prev.hideNegligible;
    _draftExportCfg = next;
    renderCustomizerModalBody();
  };

  window.swapHierarchicalColumns = (idA, idB) => {
    if (!_draftExportCfg) return;
    const cols = _draftExportCfg.columns;
    const idxA = cols.findIndex(c => c.id === idA);
    const idxB = cols.findIndex(c => c.id === idB);
    if (idxA === -1 || idxB === -1) return;
    const colA = cols[idxA];
    const colB = cols[idxB];
    // Swap enabled states cleanly (if both were same, turn A off & B on)
    if (colA.enabled === colB.enabled) {
      colA.enabled = false;
      colB.enabled = true;
    } else {
      colA.enabled = !colA.enabled;
      colB.enabled = !colB.enabled;
    }
    // Also swap their exact array positions so the replacement lands in the exact same column slot!
    cols[idxA] = colB;
    cols[idxB] = colA;
    _draftExportCfg.preset = "custom";
    renderCustomizerModalBody();
  };

  window.toggleHierarchicalCol = (index, checked) => {
    if (!_draftExportCfg || !_draftExportCfg.columns[index] || _draftExportCfg.columns[index].locked) return;
    _draftExportCfg.columns[index].enabled = checked;
    _draftExportCfg.preset = "custom";
    renderCustomizerModalBody();
  };

  window.moveHierarchicalCol = (index, delta) => {
    if (!_draftExportCfg) return;
    const cols = _draftExportCfg.columns;
    const newIdx = index + delta;
    if (newIdx < 0 || newIdx >= cols.length) return;
    const [item] = cols.splice(index, 1);
    cols.splice(newIdx, 0, item);
    _draftExportCfg.preset = "custom";
    renderCustomizerModalBody();
  };

  window.updateHierarchicalOption = (key, value) => {
    if (!_draftExportCfg) return;
    _draftExportCfg[key] = value;
    renderCustomizerModalBody();
  };

  window.saveAndCloseHierarchicalCustomizer = () => {
    if (_draftExportCfg) saveExportConfig(_draftExportCfg);
    window.closeHierarchicalDebtCustomizer();
    window.showToast?.("✅ تم حفظ إعدادات أعمدة الطباعة والتصدير بنجاح", "success");
  };

  window.saveAndRunHierarchicalExport = (target) => {
    if (_draftExportCfg) saveExportConfig(_draftExportCfg);
    window.closeHierarchicalDebtCustomizer();
    if (target === "excel") window.exportHierarchicalDebtExcel();
    else window.exportHierarchicalDebtPDF(target);
  };

  async function buildPdfExportPayload(cfg) {
    const filteredReps = getFilteredHierarchy(true, cfg);
    if (!filteredReps || filteredReps.length === 0) return null;

    const fromDate = document.getElementById("hdebt-from")?.value || "";
    const toDate   = document.getElementById("hdebt-to")?.value || "";
    const repSelect = document.getElementById("hdebt-rep-filter");
    const repFilterName = repSelect && repSelect.selectedIndex >= 0 ? repSelect.options[repSelect.selectedIndex].text : "جميع المناديب";
    const statusSelect = document.getElementById("hdebt-status-filter");
    const statusFilterName = statusSelect && statusSelect.selectedIndex >= 0 ? statusSelect.options[statusSelect.selectedIndex].text : "كافة الحالات";

    const totals   = calculateFilteredTotals(filteredReps);
    const company  = getDefaultCompanyInfo();
    const stampSrc = await getStampBase64();

    return { company, filteredReps, totals, fromDate, toDate, repFilterName, statusFilterName, stampSrc, cfg };
  }

  window._reopenHierarchicalDebtPreview = async (targetWin, opts = {}) => {
    try {
      let cfg = loadExportConfig();
      if (opts.preset && opts.preset !== "custom") {
        const next = getPresetConfig(opts.preset);
        next.profitScope    = cfg.profitScope;
        next.showRepMatrix  = cfg.showRepMatrix;
        next.showKpis       = cfg.showKpis;
        next.showSignatures = cfg.showSignatures;
        next.hideNegligible = cfg.hideNegligible;
        cfg = next;
      }
      if (opts.toggleOrientation) {
        cfg.orientation = cfg.orientation === "landscape" ? "portrait" : "landscape";
      }
      saveExportConfig(cfg);
      const payload = await buildPdfExportPayload(cfg);
      if (!payload) return;
      const html = generateHierarchicalDebtHtml(opts.mode || 'summary', payload, false);
      targetWin.document.open();
      targetWin.document.write(html);
      targetWin.document.close();
    } catch (err) {
      console.error("[HierarchicalDebt] Preview Update Error:", err);
    }
  };

  window.exportHierarchicalDebtPDF = async (mode = 'summary') => {
    try {
      const cfg = loadExportConfig();
      const payload = await buildPdfExportPayload(cfg);
      if (!payload) {
        if (window.showToast) window.showToast("لا توجد بيانات مطابقة للفلاتر لتصديرها", "warning");
        else alert("لا توجد بيانات مطابقة للفلاتر لتصديرها");
        return;
      }

      const printWin = window.open("", "_blank");
      if (!printWin) {
        if (window.showToast) window.showToast("يرجى السماح بالنوافذ المنبثقة لفتح تقرير الطباعة", "error");
        else alert("يرجى السماح بالنوافذ المنبثقة لفتح تقرير الطباعة");
        return;
      }

      const html = generateHierarchicalDebtHtml(mode, payload, true);
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();

      window.showToast?.(`✅ تم فتح معاينة تقرير المديونيات (${mode === 'summary' ? 'ملخص موجز' : 'تفصيلي موسع'}) بنجاح`, "success");
    } catch (err) {
      console.error("[HierarchicalDebt] PDF Export Error:", err);
      if (window.showToast) window.showToast("حدث خطأ أثناء إعداد تقرير الطباعة: " + err.message, "error");
      else alert("حدث خطأ أثناء إعداد تقرير الطباعة: " + err.message);
    }
  };

  window.printHierarchicalDebt = (mode = 'summary') => {
    window.exportHierarchicalDebtPDF(mode);
  };

  window.exportHierarchicalDebtExcel = async () => {
    try {
      const cfg = loadExportConfig();
      const filteredReps = getFilteredHierarchy(true, cfg);
      if (!filteredReps || filteredReps.length === 0) {
        window.showToast?.("لا توجد بيانات مطابقة للفلاتر للتصدير", "warning");
        return;
      }

      const isAllTime = cfg.profitScope === "allTime";
      const orderedCustCols = (cfg.columns || []).filter(c => c.enabled || c.locked);
      const totals = calculateFilteredTotals(filteredReps);

      // Build Dynamic Excel Headers matching exact selected custom order
      const headers = ["المندوب"];
      orderedCustCols.forEach(col => {
        if (col.id === "_name") headers.push("اسم العميل");
        else if (col.id === "col_code") headers.push("كود العميل");
        else if (col.id === "col_last_payment") headers.push("مبلغ آخر تحصيل", "تاريخ آخر تحصيل");
        else if (col.id === "col_contact") headers.push("الهاتف", "المنطقة");
        else if (col.id === "col_profit") headers.push(isAllTime ? "صافي الربح التراكمي" : "صافي ربح الفترة", "هامش الربح %");
        else if (col.id === "col_opening") headers.push("رصيد أول المدة");
        else if (col.id === "col_sales") headers.push("مبيعات الفترة");
        else if (col.id === "col_receipts") headers.push("سدادات الفترة");
        else if (col.id === "col_returns") headers.push("مردودات الفترة");
        else if (col.id === "col_closing") headers.push("صافي المديونية");
        else if (col.id === "col_coll_rate") headers.push("نسبة التحصيل %");
        else if (col.id === "col_status") headers.push("حالة المديونية");
        else if (col.id === "col_notes") headers.push("ملاحظات المتابعة");
      });

      const rows = [];
      filteredReps.forEach(rep => {
        rep.visibleCustomers.forEach(c => {
          const row = [rep.name];
          orderedCustCols.forEach(col => {
            if (col.id === "_name") row.push(c.name);
            else if (col.id === "col_code") row.push(c.code || "—");
            else if (col.id === "col_last_payment") row.push(c.lastPaymentAmount || 0, c.lastPaymentDate || "—");
            else if (col.id === "col_contact") row.push(c.phone || "—", c.shortLocation || c.zone || "—");
            else if (col.id === "col_profit") {
              const pAmt = isAllTime ? c.allTimeProfit : c.periodProfit;
              const pPct = isAllTime ? c.allTimeMarginPct : c.periodMarginPct;
              row.push(pAmt, `${pPct.toFixed(1)}%`);
            }
            else if (col.id === "col_opening") row.push(c.openingBalance);
            else if (col.id === "col_sales") row.push(c.periodSales);
            else if (col.id === "col_receipts") row.push(c.periodReceipts);
            else if (col.id === "col_returns") row.push(c.periodReturns);
            else if (col.id === "col_closing") row.push(c.closingBalance);
            else if (col.id === "col_coll_rate") {
              const cDemand = Math.max(0, (c.periodSales || 0) + Math.max(0, (c.openingBalance || 0)));
              const cCollPct = cDemand > 0 ? Math.min(100, Math.round(((c.periodReceipts || 0) / cDemand) * 100)) : (c.closingBalance <= 0.01 ? 100 : 0);
              row.push(`${cCollPct}%`);
            }
            else if (col.id === "col_status") row.push(c.status === "debtor" ? "مدين" : c.status === "creditor" ? "دائن" : "مسدد");
            else if (col.id === "col_notes") row.push("");
          });
          rows.push(row);
        });
      });

      const sumRow = ["الإجمالي العام"];
      orderedCustCols.forEach(col => {
        if (col.id === "_name") sumRow.push(`${totals.totalCustomers} عميل`);
        else if (col.id === "col_code") sumRow.push("");
        else if (col.id === "col_last_payment") sumRow.push(totals.lastPaymentTotal, `${totals.paidCustomersCount} مسدد`);
        else if (col.id === "col_contact") sumRow.push("", "");
        else if (col.id === "col_profit") {
          const gpAmt = isAllTime ? totals.allTimeProfit : totals.periodProfit;
          const gpPct = isAllTime ? totals.allTimeMarginPct : totals.periodMarginPct;
          sumRow.push(gpAmt, `${gpPct.toFixed(1)}%`);
        }
        else if (col.id === "col_opening") sumRow.push(totals.openingBalance);
        else if (col.id === "col_sales") sumRow.push(totals.sales);
        else if (col.id === "col_receipts") sumRow.push(totals.receipts);
        else if (col.id === "col_returns") sumRow.push(totals.returns);
        else if (col.id === "col_closing") sumRow.push(totals.totalDebt);
        else if (col.id === "col_coll_rate") sumRow.push(`${totals.collectionRate}%`);
        else if (col.id === "col_status") sumRow.push(`${totals.debtorCount} مدين`);
        else if (col.id === "col_notes") sumRow.push("");
      });

      const from = document.getElementById("hdebt-from")?.value || "الكل";
      const to   = document.getElementById("hdebt-to")?.value || "الكل";
      const filename = `تقرير_المديونيات_الهرمي_${from}_إلى_${to}`;

      await exportXLSX({
        filename,
        sheetName: "المديونيات",
        title: `تقرير المديونيات الهرمي الشجري (${PRESET_LABELS[cfg.preset] || 'مخصص'})`,
        headers,
        rows,
        summaryRows: [sumRow]
      });

      window.showToast?.("✅ تم تصدير التقرير إلى Excel بالأعمدة المختارة بنجاح", "success");
    } catch (err) {
      console.error("Excel Export Error:", err);
      window.showToast?.("❌ فشل تصدير Excel: " + err.message, "error");
    }
  };
}
