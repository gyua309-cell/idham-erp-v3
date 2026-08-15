// ============================================================
// IDHAM ERP — Journal Entries Module v3.0
// القيود المحاسبية اليومية — نظام محاسبي متكامل
// ============================================================
// Features:
//   ✅ Smart account search (by name OR code) with autocomplete
//   ✅ Auto sequential entry number (JE-2024-0001)
//   ✅ Draft / Posted status workflow
//   ✅ Mandatory balance validation (Debit = Credit)
//   ✅ Reversing Entry for posted entries
//   ✅ Journal Log with filters (date, account, number, user)
//   ✅ General Ledger per account with running balance
//   ✅ Real-time balance indicator while typing
// ============================================================

import { COLS, create, getAll, createJournalEntry, updateJournalEntry, isPeriodClosed, clearERPCache } from "../utils/db.js";
import {
  query, orderBy, limit, getDocs, where,
  doc, getDoc, serverTimestamp, runTransaction
} from "../utils/db.js";
import { db, COMPANY_ID } from "../firebase-config.js";
import { formatCurrency, todayString, startOfMonth } from "../utils/formatters.js";

// ──────────────────────────────────────────
// State
// ──────────────────────────────────────────
let jLines    = [];
let accounts  = [];
let _tab      = "log";          // "log" | "ledger"
let _nextNum  = null;           // cached next entry number
let _acSearch = {};             // { lineIndex: searchText }

// ──────────────────────────────────────────
// Entry Point
// ──────────────────────────────────────────
export async function render(container, user) {
  window.switchTab = switchTabLocal;
  container.innerHTML = buildLayout();
  bindGlobalHandlers();

  // Load accounts from Firestore
  accounts = await getAll(COLS.chartOfAccounts(), [orderBy("code")]);

  // Pre-fetch next entry number
  _nextNum = await getNextEntryNumber();

  switchTab("log");

  // ديبونس على حقل بحث القيود
  setTimeout(() => {
    const jeSearch = document.getElementById("je-search");
    if (jeSearch) {
      // إزالة الـ oninput القديم واستبداله بـ debounce
      jeSearch.oninput = null;
      const debouncedFilter = window.debounce ? window.debounce((e) => filterJETable(e.target.value), 300) : (e) => filterJETable(e.target.value);
      jeSearch.addEventListener("input", debouncedFilter);
    }
  }, 100);
}

// ──────────────────────────────────────────
// Layout
// ──────────────────────────────────────────
function buildLayout() {
  return `
<div class="je-root">

  <!-- ─── Page Tabs ─── -->
  <div class="je-tabs">
    <button class="je-tab active" id="tab-log"    onclick="switchTab('log')">
      <i class="fas fa-book"></i> دفتر اليومية
    </button>
    <button class="je-tab"        id="tab-ledger" onclick="switchTab('ledger')">
      <i class="fas fa-list-alt"></i> دفتر الأستاذ
    </button>
  </div>

  <!-- ═══════════════ TAB: JOURNAL LOG ═══════════════ -->
  <div id="panel-log" class="je-panel">

    <!-- Filters -->
    <div class="je-filterbar">
      <div class="je-filter-group">
        <label>من</label>
        <input type="date" id="je-from" value="${startOfMonth()}" onchange="loadJournalEntries()" />
      </div>
      <div class="je-filter-group">
        <label>إلى</label>
        <input type="date" id="je-to" value="${todayString()}" onchange="loadJournalEntries()" />
      </div>
      <div class="je-filter-group">
        <label>الحالة</label>
        <select id="je-status-filter" onchange="loadJournalEntries()">
          <option value="">الكل</option>
          <option value="draft">مسودة</option>
          <option value="posted">مرحّل</option>
        </select>
      </div>
      <div class="je-filter-group">
        <label>النوع</label>
        <select id="je-type-filter" onchange="loadJournalEntries()">
          <option value="">الكل</option>
          <option value="manual">يدوي</option>
          <option value="salesInvoice">مبيعات</option>
          <option value="purchaseInvoice">مشتريات</option>
          <option value="salesReturn">مردود بيع</option>
          <option value="purchaseReturn">مردود شراء</option>
          <option value="salesCOGS">تكلفة البضاعة</option>
          <option value="cogs">تكلفة مبيعات</option>
          <option value="receipt">سند قبض</option>
          <option value="reversing">عكسي</option>
        </select>
      </div>
      <div class="je-filter-group">
        <label>بحث</label>
        <div class="je-search-wrap">
          <i class="fas fa-search"></i>
          <input type="text" id="je-search" placeholder="رقم القيد / البيان..." oninput="filterJETable(this.value)" />
        </div>
      </div>
      <div style="margin-right:auto;display:flex;gap:6px;align-items:center;">
        <button class="je-btn je-btn-ghost" onclick="loadJournalEntries(true)" title="إعادة تحميل القيود من السيرفر">
          <i class="fas fa-sync-alt"></i> تحديث
        </button>
        <button class="je-btn je-btn-ghost" onclick="exportPagePDF('.je-log-table','دفتر_اليومية')">
          <i class="fas fa-file-pdf"></i> PDF
        </button>
        <button class="je-btn je-btn-ghost" onclick="exportPageExcel('.je-log-table','دفتر_اليومية')">
          <i class="fas fa-file-excel"></i> Excel
        </button>
        <button class="je-btn je-btn-ghost" onclick="printJournalLogReport()" title="طباعة دفتر اليومية">
          <i class="fas fa-print"></i> طباعة
        </button>
        <button class="je-btn je-btn-primary" onclick="openJournalModal()">
          <i class="fas fa-plus"></i> قيد يدوي جديد
        </button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="je-kpis">
      <div class="je-kpi kpi-blue">
        <div class="je-kpi-icon"><i class="fas fa-arrow-down"></i></div>
        <div><div class="je-kpi-label">إجمالي المدين</div>
             <div class="je-kpi-val" id="kpi-total-dr">—</div></div>
      </div>
      <div class="je-kpi kpi-green">
        <div class="je-kpi-icon"><i class="fas fa-arrow-up"></i></div>
        <div><div class="je-kpi-label">إجمالي الدائن</div>
             <div class="je-kpi-val" id="kpi-total-cr">—</div></div>
      </div>
      <div class="je-kpi kpi-indigo">
        <div class="je-kpi-icon"><i class="fas fa-balance-scale"></i></div>
        <div><div class="je-kpi-label">ميزان الفترة</div>
             <div class="je-kpi-val" id="kpi-balance">—</div></div>
      </div>
      <div class="je-kpi kpi-amber">
        <div class="je-kpi-icon"><i class="fas fa-receipt"></i></div>
        <div><div class="je-kpi-label">عدد القيود</div>
             <div class="je-kpi-val" id="kpi-count">—</div></div>
      </div>
      <div class="je-kpi kpi-teal">
        <div class="je-kpi-icon"><i class="fas fa-check-circle"></i></div>
        <div><div class="je-kpi-label">مرحّلة</div>
             <div class="je-kpi-val" id="kpi-posted">—</div></div>
      </div>
    </div>

    <!-- Table -->
    <div class="je-table-wrap">
      <table class="je-log-table">
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>رقم القيد</th>
            <th style="min-width:200px">البيان</th>
            <th>النوع</th>
            <th style="text-align:right">مدين</th>
            <th style="text-align:right">دائن</th>
            <th>الحالة</th>
            <th>أنشأه</th>
            <th style="width:120px"></th>
          </tr>
        </thead>
        <tbody id="je-tbody">
          <tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2)">
            <i class="fas fa-spinner fa-spin"></i> جارٍ التحميل...
          </td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ═══════════════ TAB: LEDGER ═══════════════ -->
  <div id="panel-ledger" class="je-panel hidden">
    <div class="je-filterbar">
      <div class="je-filter-group" style="flex:1;max-width:400px;">
        <label>الحساب</label>
        <div class="je-acc-search-wrap" id="ledger-acc-wrap">
          <i class="fas fa-search"></i>
          <input type="text" id="ledger-acc-input" class="je-acc-input"
                 placeholder="اكتب اسم أو كود الحساب..."
                 oninput="ledgerAccSearch(this.value)"
                 autocomplete="off" />
          <div id="ledger-acc-dropdown" class="je-acc-dropdown hidden"></div>
        </div>
      </div>
      <div class="je-filter-group">
        <label>من</label>
        <input type="date" id="ledger-from" value="${startOfMonth()}" />
      </div>
      <div class="je-filter-group">
        <label>إلى</label>
        <input type="date" id="ledger-to" value="${todayString()}" />
      </div>
      <div style="display:flex;gap:6px;align-items:flex-end;">
        <button class="je-btn je-btn-primary" onclick="loadLedger()">
          <i class="fas fa-search"></i> عرض
        </button>
        <button class="je-btn je-btn-ghost" onclick="printLedger()">
          <i class="fas fa-print"></i> طباعة
        </button>
      </div>
    </div>

    <div id="ledger-content">
      <div style="text-align:center;padding:60px;color:var(--text-2)">
        <i class="fas fa-book-open" style="font-size:40px;opacity:.2;margin-bottom:12px;display:block"></i>
        اختر حساباً لعرض دفتر الأستاذ
      </div>
    </div>
  </div>

</div>

<!-- ═══════════ JOURNAL ENTRY MODAL ═══════════ -->
<div class="modal-overlay" id="journal-modal">
  <div class="modal" style="max-width:960px;width:96vw;">
    <div class="modal-header">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
          <i class="fas fa-pen-nib" style="color:#fff;font-size:15px;"></i>
        </div>
        <div>
          <h3 class="modal-title" id="je-modal-title">قيد يدوي جديد</h3>
          <div style="font-size:11px;color:var(--text-2)" id="je-entry-num-label"></div>
        </div>
      </div>
      <button class="modal-close" onclick="closeModal('journal-modal')">×</button>
    </div>
    <div class="modal-body" style="padding:20px;">
      <input type="hidden" id="je-edit-id" />

      <!-- Header Fields -->
      <div style="display:grid;grid-template-columns:140px 1fr 1fr 180px;gap:12px;margin-bottom:16px;">
        <div class="form-group">
          <label>التاريخ <span class="text-bad">*</span></label>
          <input type="date" id="je-date" class="input" value="${todayString()}" />
        </div>
        <div class="form-group">
          <label>البيان الإجمالي <span class="text-bad">*</span></label>
          <input type="text" id="je-desc" class="input" placeholder="وصف القيد المحاسبي..." />
        </div>
        <div class="form-group">
          <label>المرجع / رقم المستند</label>
          <input type="text" id="je-ref" class="input" placeholder="مثال: فاتورة رقم 1234" />
        </div>
        <div class="form-group">
          <label>🏷️ مركز التكلفة</label>
          <select id="je-cost-center" class="input">
            <option value="">بدون مركز تكلفة</option>
          </select>
        </div>
      </div>

      <!-- Lines Table -->
      <div class="je-lines-header">
        <span><i class="fas fa-list"></i> سطور القيد المحاسبي</span>
        <button class="je-btn je-btn-ghost" onclick="addJELine()" style="font-size:12px;">
          <i class="fas fa-plus"></i> إضافة سطر
        </button>
      </div>
      <div class="je-lines-wrap">
        <table class="je-lines-table">
          <thead>
            <tr>
              <th style="width:32px">#</th>
              <th style="min-width:240px">الحساب <span class="text-bad">*</span></th>
              <th>البيان الفرعي</th>
              <th style="width:130px;color:#818cf8">مدين (ر.س)</th>
              <th style="width:130px;color:#34d399">دائن (ر.س)</th>
              <th style="width:36px"></th>
            </tr>
          </thead>
          <tbody id="je-lines-tbody"></tbody>
          <tfoot>
            <tr class="je-lines-total">
              <td colspan="3" style="text-align:right;font-weight:800;padding:10px 12px;">الإجمالي</td>
              <td style="padding:10px 12px;" id="je-sum-debit">0.00</td>
              <td style="padding:10px 12px;" id="je-sum-credit">0.00</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Balance Meter -->
      <div class="je-balance-meter" id="je-balance-meter">
        <div class="je-balance-left">
          <span class="je-balance-label">مدين</span>
          <span class="je-balance-dr" id="meter-dr">0.00</span>
        </div>
        <div class="je-balance-status balanced" id="meter-status">
          <i class="fas fa-balance-scale"></i> قيد متوازن ✓
        </div>
        <div class="je-balance-right">
          <span class="je-balance-label">دائن</span>
          <span class="je-balance-cr" id="meter-cr">0.00</span>
        </div>
      </div>

      <div id="je-form-error" class="alert bad hidden" style="margin-top:8px;"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal('journal-modal')">إلغاء</button>
      <button class="btn btn-secondary" id="save-draft-btn" onclick="saveJournal('draft')">
        <i class="fas fa-save"></i> حفظ كمسودة
      </button>
      <button class="btn btn-primary" id="save-post-btn" onclick="saveJournal('posted')">
        <i class="fas fa-check-circle"></i> ترحيل القيد
      </button>
    </div>
  </div>
</div>

<!-- ═══════════ DETAIL / VIEW MODAL ═══════════ -->
<div class="modal-overlay" id="je-detail-modal">
  <div class="modal modal-lg">
    <div class="modal-header">
      <h3 class="modal-title" id="je-detail-title">تفاصيل القيد</h3>
      <button class="modal-close" onclick="closeModal('je-detail-modal')">×</button>
    </div>
    <div class="modal-body" id="je-detail-body"></div>
    <div class="modal-footer" id="je-detail-footer">
      <button class="btn btn-ghost" onclick="closeModal('je-detail-modal')">إغلاق</button>
      <button class="btn btn-secondary" onclick="window.print()"><i class="fas fa-print"></i> طباعة</button>
    </div>
  </div>
</div>

<style>
/* ══════════════════════════════════════════
   JOURNAL ENTRIES — Premium UI v4
══════════════════════════════════════════ */

/* ────── Root ────── */
.je-root { display:flex; flex-direction:column; height:100%; overflow:hidden; font-family:inherit; }

/* ────── Tabs ────── */
.je-tabs {
  display:flex; gap:2px; padding:12px 16px 0; background:var(--bg-1);
  border-bottom:2px solid var(--border-soft); flex-shrink:0;
}
.je-tab {
  padding:9px 20px; border-radius:10px 10px 0 0; border:none;
  background:transparent; color:var(--text-2); cursor:pointer;
  font-size:13px; font-weight:700; font-family:inherit;
  display:flex; align-items:center; gap:7px; transition:all .2s;
  border-bottom:3px solid transparent; margin-bottom:-2px;
}
.je-tab:hover { color:var(--text-0); background:rgba(255,255,255,.04); }
.je-tab.active {
  color:var(--brand); border-bottom-color:var(--brand);
  background:linear-gradient(180deg,rgba(99,102,241,.10),rgba(99,102,241,.03));
}

/* ────── Panels ────── */
.je-panel { display:flex; flex-direction:column; flex:1; overflow:hidden; }
.je-panel.hidden { display:none; }

/* ────── Filter Bar ────── */
.je-filterbar {
  display:flex; align-items:flex-end; gap:8px; padding:10px 16px;
  background:linear-gradient(180deg,var(--bg-1),var(--bg-0));
  border-bottom:1px solid var(--border-soft);
  flex-wrap:wrap; flex-shrink:0;
  box-shadow:0 2px 8px rgba(0,0,0,.08);
}
.je-filter-group { display:flex; flex-direction:column; gap:3px; }
.je-filter-group label {
  font-size:10px; font-weight:800; color:var(--text-2);
  text-transform:uppercase; letter-spacing:.5px;
}
.je-filter-group input, .je-filter-group select {
  padding:7px 10px; border:1.5px solid var(--border-soft); border-radius:8px;
  background:var(--bg-2); color:var(--text-0); font-size:12px; font-family:inherit;
  transition:border-color .15s, box-shadow .15s;
}
.je-filter-group input:focus, .je-filter-group select:focus {
  outline:none; border-color:var(--brand);
  box-shadow:0 0 0 3px rgba(99,102,241,.12);
}
.je-search-wrap {
  display:flex; align-items:center; gap:6px;
  background:var(--bg-2); border:1.5px solid var(--border-soft);
  border-radius:8px; padding:7px 10px; transition:all .15s;
}
.je-search-wrap:focus-within {
  border-color:var(--brand);
  box-shadow:0 0 0 3px rgba(99,102,241,.12);
}
.je-search-wrap i { color:var(--text-2); font-size:11px; }
.je-search-wrap input {
  border:none; background:transparent; color:var(--text-0);
  font-size:12px; outline:none; width:170px; font-family:inherit;
}

/* ────── Buttons ────── */
.je-btn {
  padding:7px 13px; border-radius:8px; border:none; cursor:pointer;
  font-size:12px; font-weight:700; font-family:inherit;
  display:flex; align-items:center; gap:5px; transition:all .18s;
  white-space:nowrap; letter-spacing:.1px;
}
.je-btn-primary  { background:linear-gradient(135deg,#6366f1,#4f46e5); color:#fff; box-shadow:0 2px 8px rgba(99,102,241,.35); }
.je-btn-primary:hover { transform:translateY(-1px); box-shadow:0 4px 14px rgba(99,102,241,.45); }
.je-btn-ghost    { background:var(--bg-2); color:var(--text-1); border:1.5px solid var(--border-soft); }
.je-btn-ghost:hover { border-color:var(--brand); color:var(--brand); background:rgba(99,102,241,.06); }
.je-btn-danger   { background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; box-shadow:0 2px 6px rgba(239,68,68,.25); }
.je-btn-danger:hover { transform:translateY(-1px); opacity:.9; }

/* ────── KPI Cards ────── */
.je-kpis {
  display:flex; gap:10px; padding:12px 16px;
  background:var(--bg-0); border-bottom:1px solid var(--border-soft);
  flex-shrink:0; overflow-x:auto;
}
.je-kpi {
  display:flex; align-items:center; gap:12px;
  border-radius:12px; padding:12px 16px; flex-shrink:0; min-width:150px;
  border:1px solid transparent; position:relative; overflow:hidden;
  transition:transform .2s, box-shadow .2s;
}
.je-kpi::before {
  content:""; position:absolute; inset:0; opacity:.07;
  background:inherit; filter:brightness(3);
}
.je-kpi:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,.15); }
.je-kpi-icon {
  width:38px; height:38px; border-radius:10px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  font-size:15px; position:relative; z-index:1;
}
.je-kpi-label { font-size:10px; font-weight:700; opacity:.7; margin-bottom:3px; position:relative; z-index:1; }
.je-kpi-val   {
  font-size:15px; font-weight:900; font-variant-numeric:tabular-nums;
  position:relative; z-index:1;
}
.kpi-blue   { background:linear-gradient(135deg,rgba(129,140,248,.18),rgba(99,102,241,.08)); border-color:rgba(129,140,248,.25); color:#a5b4fc; }
.kpi-blue   .je-kpi-icon { background:rgba(129,140,248,.25); color:#818cf8; }
.kpi-blue   .je-kpi-val  { color:#c7d2fe; }
.kpi-green  { background:linear-gradient(135deg,rgba(52,211,153,.18),rgba(16,185,129,.08)); border-color:rgba(52,211,153,.25); color:#6ee7b7; }
.kpi-green  .je-kpi-icon { background:rgba(52,211,153,.25); color:#34d399; }
.kpi-green  .je-kpi-val  { color:#6ee7b7; }
.kpi-indigo { background:linear-gradient(135deg,rgba(99,102,241,.18),rgba(79,70,229,.08)); border-color:rgba(99,102,241,.25); color:#a5b4fc; }
.kpi-indigo .je-kpi-icon { background:rgba(99,102,241,.25); color:#6366f1; }
.kpi-indigo .je-kpi-val  { color:#a5b4fc; }
.kpi-amber  { background:linear-gradient(135deg,rgba(245,158,11,.18),rgba(217,119,6,.08)); border-color:rgba(245,158,11,.25); color:#fcd34d; }
.kpi-amber  .je-kpi-icon { background:rgba(245,158,11,.25); color:#f59e0b; }
.kpi-amber  .je-kpi-val  { color:#fcd34d; }
.kpi-teal   { background:linear-gradient(135deg,rgba(16,185,129,.18),rgba(5,150,105,.08)); border-color:rgba(16,185,129,.25); color:#6ee7b7; }
.kpi-teal   .je-kpi-icon { background:rgba(16,185,129,.25); color:#10b981; }
.kpi-teal   .je-kpi-val  { color:#6ee7b7; }

/* ────── Log Table ────── */
.je-table-wrap { flex:1; overflow-y:auto; }
.je-log-table { width:100%; border-collapse:collapse; font-size:13px; }
.je-log-table th {
  position:sticky; top:0; z-index:2;
  background:var(--bg-2);
  padding:10px 13px;
  font-size:11px; font-weight:800; color:var(--text-2);
  border-bottom:2px solid var(--border-soft); text-align:right;
  letter-spacing:.3px; text-transform:uppercase;
}
.je-log-table td {
  padding:10px 13px;
  border-bottom:1px solid rgba(255,255,255,.04);
  vertical-align:middle;
}
.je-log-table tbody tr {
  border-right:3px solid transparent;
  transition:background .12s, border-color .12s;
}
.je-log-table tbody tr:hover td { background:rgba(99,102,241,.07); cursor:pointer; }
.je-log-table tbody tr:hover { border-right-color:var(--brand) !important; }

/* Row accent by type */
.je-row-manual       { border-right-color:rgba(99,102,241,.35) !important; }
.je-row-salesInvoice { border-right-color:rgba(16,185,129,.35) !important; }
.je-row-purchaseInvoice { border-right-color:rgba(239,68,68,.35) !important; }
.je-row-salesReturn  { border-right-color:rgba(245,158,11,.35) !important; }
.je-row-purchaseReturn { border-right-color:rgba(251,146,60,.35) !important; }
.je-row-reversing    { border-right-color:rgba(239,68,68,.5) !important; }
.je-row-pos          { border-right-color:rgba(52,211,153,.35) !important; }
.je-row-stockTransfer { border-right-color:rgba(148,163,184,.35) !important; }
.je-row-salesCOGS    { border-right-color:rgba(129,140,248,.35) !important; }

/* Status bg tints */
.status-posted { background:rgba(16,185,129,.04) !important; }
.status-draft  { background:rgba(245,158,11,.03) !important; }

/* ── Status Badges (premium pill) ── */
.badge-posted {
  display:inline-flex; align-items:center; gap:4px;
  background:linear-gradient(135deg,rgba(16,185,129,.2),rgba(5,150,105,.12));
  color:#10b981; border:1px solid rgba(16,185,129,.3);
  padding:3px 10px; border-radius:20px; font-size:10px; font-weight:800;
  box-shadow:0 1px 4px rgba(16,185,129,.15);
}
.badge-posted::before { content:"●"; font-size:7px; animation:pulse-green 2s infinite; }
@keyframes pulse-green {
  0%,100% { opacity:1; } 50% { opacity:.4; }
}
.badge-draft {
  display:inline-flex; align-items:center; gap:4px;
  background:rgba(245,158,11,.15); color:#f59e0b;
  border:1px solid rgba(245,158,11,.25);
  padding:3px 10px; border-radius:20px; font-size:10px; font-weight:800;
}
.badge-draft::before { content:"◐"; font-size:8px; }
.badge-reversed {
  display:inline-flex; align-items:center; gap:4px;
  background:rgba(239,68,68,.15); color:#ef4444;
  border:1px solid rgba(239,68,68,.25);
  padding:3px 10px; border-radius:20px; font-size:10px; font-weight:800;
}
.badge-reversed::before { content:"↩"; font-size:9px; }

/* ── Type Badges (color-coded) ── */
.badge-type { padding:3px 8px; border-radius:5px; font-size:10px; font-weight:800; }
.btype-manual          { background:rgba(99,102,241,.15); color:#818cf8; }
.btype-salesInvoice    { background:rgba(16,185,129,.15); color:#10b981; }
.btype-purchaseInvoice { background:rgba(239,68,68,.15);  color:#ef4444; }
.btype-salesReturn     { background:rgba(245,158,11,.15); color:#f59e0b; }
.btype-purchaseReturn  { background:rgba(251,146,60,.15); color:#fb923c; }
.btype-reversing       { background:rgba(239,68,68,.12);  color:#f87171; }
.btype-pos             { background:rgba(52,211,153,.15); color:#34d399; }
.btype-stockTransfer   { background:rgba(148,163,184,.15);color:#94a3b8; }
.btype-salesCOGS       { background:rgba(129,140,248,.18);color:#a5b4fc; font-weight:900; }
.btype-receipt         { background:rgba(52,211,153,.15); color:#34d399; }
.je-row-receipt        { border-right-color:rgba(52,211,153,.35) !important; }

/* ── Action Buttons inside table ── */
.je-row-action {
  display:inline-flex; align-items:center; justify-content:center;
  width:28px; height:28px; border-radius:7px; border:1px solid var(--border-soft);
  background:var(--bg-2); color:var(--text-1); cursor:pointer;
  font-size:12px; transition:all .15s; text-decoration:none;
  position:relative;
}
.je-row-action:hover { border-color:var(--brand); color:var(--brand); background:rgba(99,102,241,.1); transform:scale(1.08); }
.je-row-action.danger:hover { border-color:#ef4444; color:#ef4444; background:rgba(239,68,68,.1); }
.je-row-action.success:hover { border-color:#10b981; color:#10b981; background:rgba(16,185,129,.1); }

/* ────── Modal Lines ────── */
.je-lines-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:8px 12px; background:var(--bg-2); border-radius:8px 8px 0 0;
  border:1px solid var(--border-soft); font-size:13px; font-weight:800; color:var(--brand);
}
.je-lines-wrap { overflow-x:auto; border:1px solid var(--border-soft); border-top:none; border-radius:0 0 8px 8px; }
.je-lines-table { width:100%; border-collapse:collapse; font-size:13px; }
.je-lines-table th {
  padding:8px 10px; background:var(--bg-2); font-size:11px; font-weight:800;
  color:var(--text-2); border-bottom:1px solid var(--border-soft); text-align:right;
}
.je-lines-table td { padding:4px 6px; border-bottom:1px solid rgba(255,255,255,.03); }
.je-lines-table tfoot td { padding:10px 12px; background:var(--bg-2); font-weight:900; }
.je-lines-total td:nth-child(4) { color:#818cf8; font-variant-numeric:tabular-nums; font-size:13px; }
.je-lines-total td:nth-child(5) { color:#34d399; font-variant-numeric:tabular-nums; font-size:13px; }

/* Balance Meter */
.je-balance-meter {
  display:flex; align-items:center; justify-content:space-between;
  margin-top:12px; padding:12px 18px; border-radius:12px;
  background:rgba(99,102,241,.06); border:1px solid rgba(99,102,241,.15);
}
.je-balance-label { font-size:10px; font-weight:700; color:var(--text-2); display:block; margin-bottom:2px; }
.je-balance-dr    { font-size:17px; font-weight:900; color:#818cf8; font-variant-numeric:tabular-nums; }
.je-balance-cr    { font-size:17px; font-weight:900; color:#34d399; font-variant-numeric:tabular-nums; }
.je-balance-right { text-align:left; }
.je-balance-status {
  font-size:12px; font-weight:800; padding:8px 18px; border-radius:20px;
  display:flex; align-items:center; gap:6px;
}
.je-balance-status.balanced   { background:rgba(16,185,129,.15); color:#10b981; border:1px solid rgba(16,185,129,.25); }
.je-balance-status.unbalanced { background:rgba(239,68,68,.15);  color:#ef4444; border:1px solid rgba(239,68,68,.25); }

/* Account Search Autocomplete */
.je-acc-search-wrap {
  position:relative; display:flex; align-items:center; gap:6px;
  background:var(--bg-0); border:1px solid var(--border-soft);
  border-radius:7px; padding:5px 8px; transition:border .15s;
}
.je-acc-search-wrap:focus-within { border-color:var(--brand); }
.je-acc-input {
  border:none; background:transparent; color:var(--text-0);
  font-size:12px; outline:none; width:100%; font-family:inherit;
}
.je-acc-dropdown {
  position:absolute; top:calc(100% + 4px); right:0; left:0; z-index:999;
  background:var(--bg-1); border:1px solid var(--border-soft); border-radius:8px;
  max-height:220px; overflow-y:auto; box-shadow:0 8px 24px rgba(0,0,0,.4);
}
.je-acc-dropdown.hidden { display:none; }
.je-acc-option {
  padding:7px 10px; cursor:pointer; display:flex; align-items:center; gap:8px;
  font-size:12px; transition:background .1s; border-bottom:1px solid rgba(255,255,255,.03);
}
.je-acc-option:hover { background:var(--bg-2); }
.je-acc-code  { font-family:monospace; font-size:10px; color:var(--brand); flex-shrink:0; }
.je-acc-name  { color:var(--text-1); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.je-acc-type  { font-size:9px; background:var(--bg-2); padding:1px 5px; border-radius:3px; color:var(--text-2); flex-shrink:0; margin-right:auto; }

/* Ledger */
.ledger-header {
  background:linear-gradient(135deg, #1e1b4b, #0f172a);
  border:1px solid rgba(99,102,241,.2); border-radius:12px;
  padding:16px 20px; margin:14px; display:flex; align-items:center; gap:16px;
}
.ledger-acc-info h4 { font-size:16px; font-weight:900; color:#818cf8; margin:0 0 2px; }
.ledger-acc-info p  { font-size:11px; color:var(--text-2); margin:0; }
.ledger-table-wrap  { overflow-x:auto; margin:0 14px 14px; }
.ledger-table       { width:100%; border-collapse:collapse; font-size:13px; }
.ledger-table th    { padding:8px 12px; background:var(--bg-2); font-size:11px; font-weight:800; border-bottom:2px solid var(--border-soft); }
.ledger-table td    { padding:8px 12px; border-bottom:1px solid rgba(255,255,255,.04); }
.ledger-table tr:hover td { background:var(--bg-1); }
.ledger-running     { font-weight:800; font-variant-numeric:tabular-nums; }
.running-dr         { color:#818cf8; }
.running-cr         { color:#34d399; }
.ledger-summary     { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin:14px; }
.ledger-sum-card    { background:var(--bg-1); border:1px solid var(--border-soft); border-radius:8px; padding:12px; text-align:center; }
.ledger-sum-label   { font-size:10px; color:var(--text-2); margin-bottom:4px; }
.ledger-sum-val     { font-size:15px; font-weight:900; font-variant-numeric:tabular-nums; }

/* Inline number inputs */
.je-amt-input {
  width:100%; padding:5px 8px; border:1px solid var(--border-soft);
  border-radius:6px; background:var(--bg-0); color:var(--text-0);
  font-size:12px; font-family:monospace; text-align:right;
  transition:border .15s; outline:none;
}
.je-amt-input:focus { border-color:var(--brand); background:var(--bg-2); }
.je-amt-input.has-val { color:#818cf8; font-weight:700; }
.je-amt-input.has-val-cr { color:#34d399; font-weight:700; }
.je-note-input {
  width:100%; padding:5px 8px; border:1px solid transparent;
  border-radius:6px; background:transparent; color:var(--text-1);
  font-size:12px; font-family:inherit; outline:none; transition:all .15s;
}
.je-note-input:focus { border-color:var(--border-soft); background:var(--bg-0); }
</style>
  `;
}

// ──────────────────────────────────────────
// Tab Switching
// ──────────────────────────────────────────
function switchTabLocal(tab) {
  _tab = tab;
  ["log","ledger"].forEach(t => {
    document.getElementById(`tab-${t}`)?.classList.toggle("active", t === tab);
    document.getElementById(`panel-${t}`)?.classList.toggle("hidden", t !== tab);
  });
  if (tab === "log")    loadJournalEntries();
  if (tab === "ledger") setupLedgerSearch();
};

// ──────────────────────────────────────────
// Next Entry Number
// ──────────────────────────────────────────
async function getNextEntryNumber() {
  try {
    const q    = query(COLS.journalEntries(), orderBy("entryNumber","desc"), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const last = snap.docs[0].data().entryNumber || "";
      const num  = parseInt(last.replace(/\D/g,"")) || 0;
      const year = new Date().getFullYear();
      return `JE-${year}-${String(num + 1).padStart(4,"0")}`;
    }
  } catch {}
  return `JE-${new Date().getFullYear()}-0001`;
}

// ──────────────────────────────────────────
// Journal Log
// ──────────────────────────────────────────
let _allEntries = [];

window.loadJournalEntries = async (forceRefresh = false) => {
  const tbody = document.getElementById("je-tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2)">
    <i class="fas fa-spinner fa-spin"></i> جارٍ التحميل...
  </td></tr>`;

  try {
    const from    = document.getElementById("je-from")?.value;
    const to      = document.getElementById("je-to")?.value;
    const typeF   = document.getElementById("je-type-filter")?.value;
    const statusF = document.getElementById("je-status-filter")?.value;

    if (forceRefresh === true) {
      clearERPCache();
    }

    // جلب القيود من الـ Cache (15 دقيقة) — بدلاً من Firestore في كل زيارة
    let entries = await getAll(COLS.journalEntries(), [orderBy("createdAt","desc"), limit(500)]);

    // Client-side sort by date desc (avoids composite index requirement)
    entries.sort((a,b) => (b.date||"").localeCompare(a.date||""));


    if (from)    entries = entries.filter(e => (e.date||"") >= from);
    if (to)      entries = entries.filter(e => (e.date||"") <= to);
    if (typeF)   entries = entries.filter(e => e.sourceType === typeF);
    if (statusF) entries = entries.filter(e => (e.status||"posted") === statusF);

    _allEntries = entries;
    renderJETable(entries);

    // KPIs — احسب من بنود القيد إذا لم تكن الحقول المجمّعة محسوبة
    const totalDr  = entries.reduce((s,e) => {
      const fromField = e.totalDebit || 0;
      const fromLines = (e.lines||[]).reduce((a,l) => a + (l.debit||0), 0);
      return s + Math.max(fromField, fromLines);
    }, 0);
    const totalCr  = entries.reduce((s,e) => {
      const fromField = e.totalCredit || 0;
      const fromLines = (e.lines||[]).reduce((a,l) => a + (l.credit||0), 0);
      return s + Math.max(fromField, fromLines);
    }, 0);
    const posted   = entries.filter(e => e.status === "posted").length;
    const balanced = Math.abs(totalDr - totalCr) < 0.01;

    document.getElementById("kpi-total-dr").textContent = formatCurrency(totalDr);
    document.getElementById("kpi-total-cr").textContent = formatCurrency(totalCr);
    document.getElementById("kpi-balance").textContent  = balanced ? "✓ متوازن" : formatCurrency(Math.abs(totalDr - totalCr));
    document.getElementById("kpi-count").textContent    = entries.length;
    document.getElementById("kpi-posted").textContent   = posted;
  } catch(err) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="alert bad" style="margin:8px">${err.message}</div></td></tr>`;
  }
};

function renderJETable(entries) {
  const tbody = document.getElementById("je-tbody");
  if (!tbody) return;

  if (!entries.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-2)">لا توجد قيود</td></tr>`;
    return;
  }

  const typeLabels = {
    manual:"يدوي", salesInvoice:"مبيعات", purchaseInvoice:"مشتريات",
    salesReturn:"مردود بيع", purchaseReturn:"مردود شراء", reversing:"عكسي", pos:"POS",
    salesCOGS:"تكلفة البضاعة", cogs:"تكلفة مبيعات", receipt:"سند قبض",
    stockTransfer:"تحويل مخزون", physical_count:"جرد"
  };

  const typeColors = {
    manual:"manual", salesInvoice:"salesInvoice", purchaseInvoice:"purchaseInvoice",
    salesReturn:"salesReturn", purchaseReturn:"purchaseReturn",
    reversing:"reversing", pos:"pos", stockTransfer:"stockTransfer",
    salesCOGS:"salesCOGS", cogs:"salesCOGS", receipt:"receipt", physical_count:"stockTransfer"
  };

  tbody.innerHTML = entries.map(e => {
    const status   = e.status || "posted";
    const isPost   = status === "posted";
    const isRev    = e.isReversed;
    const srcType  = e.sourceType || "manual";
    const typeKey  = typeColors[srcType] || "manual";
    const dr = Math.max(e.totalDebit  || 0, (e.lines||[]).reduce((a,l)=>a+(l.debit||0),  0));
    const cr = Math.max(e.totalCredit || 0, (e.lines||[]).reduce((a,l)=>a+(l.credit||0), 0));

    return `<tr class="status-${status} je-row-${typeKey}" onclick="viewJEEntry('${e.id}')">
      <td class="mono" style="font-size:11px;color:var(--text-2);white-space:nowrap">${e.date || ""}</td>
      <td class="mono" style="color:var(--brand);font-weight:900;font-size:12px;white-space:nowrap">${e.entryNumber && e.entryNumber !== 'undefined' ? e.entryNumber : 'JE-' + e.id.slice(-6).toUpperCase()}</td>
      <td style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-1);font-size:12px" title="${(e.description||'').replace(/"/g,'&quot;')}">${e.description||"—"}</td>
      <td><span class="badge-type btype-${typeKey}">${typeLabels[srcType]||srcType||"يدوي"}</span></td>
      <td class="mono" style="text-align:right;color:#a5b4fc;font-weight:700;font-size:13px">${formatCurrency(dr)}</td>
      <td class="mono" style="text-align:right;color:#6ee7b7;font-weight:700;font-size:13px">${formatCurrency(cr)}</td>
      <td style="white-space:nowrap">
        ${isRev   ? `<span class="badge-reversed">معكوس</span>` :
          isPost  ? `<span class="badge-posted">مرحّل</span>` :
                    `<span class="badge-draft">مسودة</span>`}
      </td>
      <td style="font-size:11px;color:var(--text-2)">${e.createdByName||"—"}</td>
      <td onclick="event.stopPropagation()" style="white-space:nowrap">
        <div style="display:flex;gap:5px;justify-content:flex-end;align-items:center">
          <button class="je-row-action info" title="طباعة سند القيد" onclick="printSingleJournalVoucher('${e.id}')">
            <i class="fas fa-print"></i>
          </button>
          ${!isRev ? `
            <button class="je-row-action" title="تعديل القيد" onclick="openJournalModal('${e.id}')">
              <i class="fas fa-pen"></i>
            </button>` : ""}
          ${!isPost && !isRev ? `
            <button class="je-row-action success" title="ترحيل القيد" onclick="postEntry('${e.id}')">
              <i class="fas fa-check"></i>
            </button>` : ""}
          ${isPost && !isRev ? `
            <button class="je-row-action danger" title="عكس القيد" onclick="reverseEntry('${e.id}','${(e.entryNumber||"").replace(/'/g,"\\'")}')">
              <i class="fas fa-undo"></i>
            </button>` : ""}
        </div>
      </td>
    </tr>`;
  }).join("");
}

window.filterJETable = val => {
  const q = val.trim().toLowerCase();
  if (!q) { renderJETable(_allEntries); return; }
  renderJETable(_allEntries.filter(e =>
    (e.entryNumber||"").toLowerCase().includes(q) ||
    (e.description||"").toLowerCase().includes(q)
  ));
};

// ──────────────────────────────────────────
// Open Journal Modal
// ──────────────────────────────────────────
window.openJournalModal = async (id = "") => {
  jLines = [];
  _acSearch = {};
  document.getElementById("je-form-error").classList.add("hidden");
  
  await loadCostCentersDropdown();
  const ccSel = document.getElementById("je-cost-center");

  if (id && typeof id === "string") {
    // Edit mode
    const je = _allEntries.find(x => x.id === id);
    if (!je) return;
    document.getElementById("je-edit-id").value = je.id;
    document.getElementById("je-desc").value    = je.description || "";
    document.getElementById("je-ref").value     = je.reference || "";
    document.getElementById("je-date").value    = je.date || todayString();
    if (ccSel) ccSel.value                      = je.costCenterId || "";
    document.getElementById("je-modal-title").textContent   = `تعديل القيد: ${je.entryNumber || ""}`;
    document.getElementById("je-entry-num-label").textContent = `رقم القيد: ${je.entryNumber || ""}`;
    _nextNum = je.entryNumber;
    
    // Load existing lines
    if (je.lines && je.lines.length) {
      jLines = je.lines.map(l => ({
        accountId:   l.accountId || "",
        accountCode: l.accountCode || "",
        accountName: l.accountName || "",
        accountType: l.accountType || "",
        note:        l.note || "",
        debit:       parseFloat(l.debit) || 0,
        credit:      parseFloat(l.credit) || 0,
        costCenterId: l.costCenterId || null,
        serviceProvider: l.serviceProvider || "",
        taxNumber:   l.taxNumber || "",
        invoiceRef:  l.invoiceRef || ""
      }));
    }
    renderJELines();
    updateJETotals();
  } else {
    // Create mode
    document.getElementById("je-edit-id").value = "";
    document.getElementById("je-desc").value    = "";
    document.getElementById("je-ref").value     = "";
    document.getElementById("je-date").value    = todayString();
    if (ccSel) ccSel.value                      = "";
    document.getElementById("je-modal-title").textContent   = "قيد يدوي جديد";
    
    const nextNum = await getNextEntryNumber();
    _nextNum = nextNum;
    document.getElementById("je-entry-num-label").textContent = `رقم القيد: ${nextNum}`;
    
    addJELine(); addJELine();
  }
  
  openModal("journal-modal");
};

let _costCenters = [];
async function loadCostCentersDropdown() {
  const sel = document.getElementById("je-cost-center");
  if (!sel) return;
  try {
    const ccList = await getAll(COLS.costCenters()).catch(() => []);
    _costCenters = ccList.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
    sel.innerHTML = '<option value="">بدون مركز تكلفة</option>' +
      _costCenters.map(cc => `<option value="${cc.id}">${cc.code || ''} — ${cc.name}</option>`).join("");
  } catch {}
}

// ──────────────────────────────────────────
// Lines Management
// ──────────────────────────────────────────
window.addJELine = () => {
  jLines.push({ accountId:"", accountCode:"", accountName:"", accountType:"", note:"", debit:0, credit:0, serviceProvider:"", taxNumber:"", invoiceRef:"" });
  renderJELines();
  updateJETotals();
};

function renderJELines() {
  const tbody = document.getElementById("je-lines-tbody");
  if (!tbody) return;

  tbody.innerHTML = jLines.map((l, i) => `
    <tr data-line="${i}" style="border-bottom:1px solid rgba(255,255,255,.03)">
      <td style="text-align:center;color:var(--text-2);font-size:11px;width:32px">${i+1}</td>

      <!-- Account Search Cell -->
      <td style="position:relative;padding:4px 6px;">
        <div class="je-acc-search-wrap" style="width:100%">
          <i class="fas fa-search" style="font-size:9px;color:var(--text-3);flex-shrink:0"></i>
          <input type="text" class="je-acc-input" id="acc-search-${i}"
                 placeholder="اكتب كود أو اسم الحساب... [F8 للبحث]"
                 value="${l.accountCode ? l.accountCode + ' — ' + l.accountName : ''}"
                 oninput="accLineSearch(${i}, this.value)"
                 onfocus="showAccDropdown(${i})"
                 onblur="hideAccDropdown(${i})"
                 autocomplete="off" />
          <div class="je-acc-dropdown hidden" id="acc-drop-${i}"></div>
        </div>
        ${l.accountId ? `<div style="font-size:9px;color:var(--text-3);margin-top:1px;padding:0 4px">${l.accountType||""}</div>` : ""}
      </td>

      <!-- Note & Tax info -->
      <td style="padding:4px 6px; display:flex; flex-direction:column; gap:4px;">
        <input type="text" class="je-note-input" placeholder="البيان الفرعي..."
               value="${l.note || ''}" onchange="jLines[${i}].note=this.value" />
        <div style="display:flex; gap:4px; align-items:center;">
          <input type="text" class="je-sub-input" placeholder="مورد الخدمة..."
                 style="font-size:10px; padding:2px 4px; border:1px solid var(--border-soft); border-radius:4px; background:var(--bg-1); color:var(--text-0); width:120px;"
                 value="${l.serviceProvider || ''}" onchange="jLines[${i}].serviceProvider=this.value" />
          <input type="text" class="je-sub-input" placeholder="الرقم الضريبي..."
                 style="font-size:10px; padding:2px 4px; border:1px solid var(--border-soft); border-radius:4px; background:var(--bg-1); color:var(--text-0); width:120px;"
                 value="${l.taxNumber || ''}" onchange="jLines[${i}].taxNumber=this.value" />
          <input type="text" class="je-sub-input" placeholder="رقم الفاتورة..."
                 style="font-size:10px; padding:2px 4px; border:1px solid var(--border-soft); border-radius:4px; background:var(--bg-1); color:var(--text-0); width:100px;"
                 value="${l.invoiceRef || ''}" onchange="jLines[${i}].invoiceRef=this.value" />
        </div>
      </td>

      <!-- Debit -->
      <td style="padding:4px 6px;">
        <input type="number" class="je-amt-input ${l.debit ? 'has-val' : ''}"
               placeholder="0.00" min="0" step="0.01"
               value="${l.debit || ''}"
               oninput="updateJEAmt(${i},'debit',this)"
               onfocus="if(this.value=='0')this.value=''"
               onblur="if(!this.value)jLines[${i}].debit=0;updateJETotals()" />
      </td>

      <!-- Credit -->
      <td style="padding:4px 6px;">
        <input type="number" class="je-amt-input ${l.credit ? 'has-val-cr' : ''}"
               placeholder="0.00" min="0" step="0.01"
               value="${l.credit || ''}"
               oninput="updateJEAmt(${i},'credit',this)"
               onfocus="if(this.value=='0')this.value=''"
               onblur="if(!this.value)jLines[${i}].credit=0;updateJETotals()" />
      </td>

      <!-- Delete -->
      <td style="text-align:center;width:36px">
        <button onclick="removeJELine(${i})"
                style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:14px;padding:2px 4px;border-radius:4px;transition:color .15s"
                onmouseover="this.style.color='#ef4444'"
                onmouseout="this.style.color='var(--text-3)'">×</button>
      </td>
    </tr>
  `).join("");
}

// ──────────────────────────────────────────
// Account Autocomplete for Lines
// ──────────────────────────────────────────
const ACC_TYPE_LABELS = { asset:"أصول", liability:"خصوم", equity:"ملكية", revenue:"إيرادات", expense:"مصروفات" };

window.accLineSearch = (i, val) => {
  const drop = document.getElementById(`acc-drop-${i}`);
  if (!drop) return;
  const q = val.trim().toLowerCase();
  if (!q) { drop.classList.add("hidden"); return; }

  // Only show detail accounts (can post to them)
  const filtered = accounts
    .filter(a => a.isActive !== false)
    .filter(a =>
      (a.code||"").toLowerCase().includes(q) ||
      (a.name||"").toLowerCase().includes(q)
    )
    .slice(0, 30);

  if (!filtered.length) { drop.innerHTML = `<div class="je-acc-option" style="color:var(--text-2)">لا توجد نتائج</div>`; }
  else {
    drop.innerHTML = filtered.map(a => `
      <div class="je-acc-option" onmousedown="selectAccLine(${i},'${a.id}','${a.code}','${(a.name||"").replace(/'/g,"\\'")}','${a.type||""}')">
        <span class="je-acc-code">${a.code}</span>
        <span class="je-acc-name">${a.name}</span>
        <span class="je-acc-type">${ACC_TYPE_LABELS[a.type]||a.type||""}</span>
        ${a.nodeType==="header" ? `<span style="font-size:9px;color:#f59e0b;margin-right:2px">رئيسي</span>` : ""}
      </div>`).join("");
  }
  drop.classList.remove("hidden");
};

window.selectAccLine = (i, id, code, name, type) => {
  jLines[i].accountId   = id;
  jLines[i].accountCode = code;
  jLines[i].accountName = name;
  jLines[i].accountType = ACC_TYPE_LABELS[type] || type;
  const inp = document.getElementById(`acc-search-${i}`);
  const drp = document.getElementById(`acc-drop-${i}`);
  if (inp) inp.value = `${code} — ${name}`;
  if (drp) drp.classList.add("hidden");

  // Auto-suggest debit/credit based on account type
  if (!jLines[i].debit && !jLines[i].credit) {
    const isDebitNature = ["asset","expense"].includes(type);
    const totalDr = jLines.reduce((s,l) => s + (l.debit||0), 0);
    const totalCr = jLines.reduce((s,l) => s + (l.credit||0), 0);
    const diff    = Math.abs(totalDr - totalCr);
    if (diff > 0) {
      if (isDebitNature && totalDr < totalCr) jLines[i].debit  = diff;
      if (!isDebitNature && totalCr < totalDr) jLines[i].credit = diff;
      renderJELines();
    }
  }
  updateJETotals();
};

window.showAccDropdown = i => {
  const inp  = document.getElementById(`acc-search-${i}`);
  if (inp?.value) accLineSearch(i, inp.value);
};
window.hideAccDropdown = i => {
  setTimeout(() => document.getElementById(`acc-drop-${i}`)?.classList.add("hidden"), 200);
};

window.updateJEAmt = (i, field, inp) => {
  const val = parseFloat(inp.value) || 0;
  jLines[i][field] = val;
  inp.className = "je-amt-input " + (val > 0 ? (field==="debit" ? "has-val" : "has-val-cr") : "");
  updateJETotals();
};

window.removeJELine = i => { jLines.splice(i,1); renderJELines(); updateJETotals(); };

function updateJETotals() {
  const totalDr = jLines.reduce((s,l) => s + (l.debit||0), 0);
  const totalCr = jLines.reduce((s,l) => s + (l.credit||0), 0);
  const diff    = Math.abs(totalDr - totalCr);
  const balanced = diff < 0.01;

  const fmt = v => v.toLocaleString("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2});
  const el = (id,v) => { const e = document.getElementById(id); if(e) e.textContent = v; };

  el("je-sum-debit",  `${fmt(totalDr)} ر.س`);
  el("je-sum-credit", `${fmt(totalCr)} ر.س`);
  el("meter-dr", fmt(totalDr));
  el("meter-cr", fmt(totalCr));

  const meter = document.getElementById("meter-status");
  if (meter) {
    if (totalDr === 0 && totalCr === 0) {
      meter.className = "je-balance-status balanced";
      meter.innerHTML = `<i class="fas fa-balance-scale"></i> أدخل مبالغ القيد`;
    } else if (balanced) {
      meter.className = "je-balance-status balanced";
      meter.innerHTML = `<i class="fas fa-check-circle"></i> قيد متوازن ✓`;
    } else {
      meter.className = "je-balance-status unbalanced";
      meter.innerHTML = `<i class="fas fa-exclamation-triangle"></i> غير متوازن — الفرق: ${fmt(diff)} ر.س`;
    }
  }
}

// ──────────────────────────────────────────
// Save Journal Entry
// ──────────────────────────────────────────
window.saveJournal = async (status = "posted") => {
  const errEl = document.getElementById("je-form-error");
  errEl.classList.add("hidden");

  const date = document.getElementById("je-date").value;
  const desc = document.getElementById("je-desc").value.trim();
  const ref  = document.getElementById("je-ref").value.trim();

  if (!date) { errEl.textContent = "التاريخ مطلوب"; errEl.classList.remove("hidden"); return; }
  if (!desc) { errEl.textContent = "البيان مطلوب";  errEl.classList.remove("hidden"); return; }

  const validLines = jLines.filter(l => l.accountId && (l.debit > 0 || l.credit > 0));
  if (validLines.length < 2) {
    errEl.textContent = "يجب أن يحتوي القيد على سطرين على الأقل";
    errEl.classList.remove("hidden"); return;
  }

  const totalDr = validLines.reduce((s,l) => s + (l.debit||0), 0);
  const totalCr = validLines.reduce((s,l) => s + (l.credit||0), 0);
  if (Math.abs(totalDr - totalCr) > 0.01) {
    errEl.textContent = `⚖️ القيد غير متوازن — المدين (${formatCurrency(totalDr)}) ≠ الدائن (${formatCurrency(totalCr)})`;
    errEl.classList.remove("hidden"); return;
  }

  const incomplete = validLines.filter(l => !l.accountId && (l.debit > 0 || l.credit > 0));
  if (incomplete.length) {
    errEl.textContent = "يوجد سطور بمبالغ ولكن بدون حساب محدد";
    errEl.classList.remove("hidden"); return;
  }

  const btn1 = document.getElementById("save-draft-btn");
  const btn2 = document.getElementById("save-post-btn");
  btn1.disabled = btn2.disabled = true;

  try {
    // التحقق من إقفال الفترة المالية لمنع التلاعب بأثر رجعي
    if (await isPeriodClosed(date)) {
      errEl.textContent = `⚠️ لا يمكن حفظ القيد لأن تاريخه (${date}) يقع في فترة محاسبية مغلقة ومقفلة نهائياً.`;
      errEl.classList.remove("hidden");
      btn1.disabled = btn2.disabled = false;
      return;
    }
    const ccSel = document.getElementById("je-cost-center");
    const costCenterId = ccSel?.value || null;
    const costCenterName = (ccSel && costCenterId && _costCenters) ? _costCenters.find(c => c.id === costCenterId)?.name || null : null;

    validLines.forEach(l => {
      if (!l.costCenterId) l.costCenterId = costCenterId;
    });

    const editId = document.getElementById("je-edit-id").value;
    if (editId) {
      // Edit mode
      await updateJournalEntry(editId, {
        date,
        description: desc,
        reference: ref,
        costCenterId,
        costCenterName,
        lines: validLines,
        status,
      });
      window.showToast?.(`تم تعديل و${status === "posted" ? "ترحيل" : "حفظ"} القيد بنجاح`, "success");
    } else {
      // Create mode
      const entryNumber = _nextNum || await getNextEntryNumber();
      await createJournalEntry({
        date,
        description: desc,
        reference: ref,
        sourceType: "manual",
        entryNumber,
        status,
        costCenterId,
        costCenterName,
        lines: validLines,
      });
      window.showToast?.(`تم ${status === "posted" ? "ترحيل" : "حفظ"} القيد ${entryNumber}`, "success");
    }
    closeModal("journal-modal");
    jLines = [];
    _nextNum = null;
    await loadJournalEntries();
  } catch(err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally {
    btn1.disabled = btn2.disabled = false;
  }
};

// ──────────────────────────────────────────
// Post Draft Entry
// ──────────────────────────────────────────
window.postEntry = async (id) => {
  if (!await window.showConfirm?.("ترحيل هذا القيد؟ لن يمكن تعديله بعد الترحيل.", "ترحيل القيد")) return;
  try {
    const { updateDoc, doc: fsDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    await updateDoc(fsDoc(db, `companies/${COMPANY_ID}/journalEntries`, id), { status: "posted" });
    window.showToast?.("تم ترحيل القيد", "success");
    await loadJournalEntries();
  } catch(err) { window.showToast?.(err.message, "error"); }
};

// ──────────────────────────────────────────
// Reverse Posted Entry
// ──────────────────────────────────────────
window.reverseEntry = async (id, entryNum) => {
  if (!await window.showConfirm?.(
    `سيُنشأ قيد عكسي لـ "${entryNum}" — يعكس جميع المدينات والدائن. هل تريد المتابعة؟`,
    "قيد عكسي (Reversing Entry)"
  )) return;

  try {
    const { getDoc, doc: fsDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const snap = await getDoc(fsDoc(db, `companies/${COMPANY_ID}/journalEntries`, id));
    if (!snap.exists()) throw new Error("القيد غير موجود");
    const orig = snap.data();

    // Build reversed lines
    const reversedLines = (orig.lines || []).map(l => ({
      ...l,
      debit:  l.credit || 0,
      credit: l.debit  || 0,
      note:   `عكس: ${l.note||l.accountName}`,
    }));

    const { updateDoc, doc: fsDoc2 } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");

    const revNumber = await getNextEntryNumber();
    await createJournalEntry({
      date:        todayString(),
      description: `قيد عكسي لـ ${orig.entryNumber || entryNum}`,
      sourceType:  "reversing",
      entryNumber: revNumber,
      status:      "posted",
      reversedFrom: id,
      lines:       reversedLines,
    });

    // Mark original as reversed
    await updateDoc(fsDoc2(db, `companies/${COMPANY_ID}/journalEntries`, id), {
      isReversed: true, reversedBy: revNumber
    });

    window.showToast?.(`تم إنشاء القيد العكسي ${revNumber}`, "success");
    await loadJournalEntries();
  } catch(err) {
    console.error(err);
    window.showToast?.(err.message, "error");
  }
};

// ──────────────────────────────────────────
// View Entry Detail
// ──────────────────────────────────────────
window.viewJEEntry = async (id) => {
  const body = document.getElementById("je-detail-body");
  body.innerHTML = `<div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin"></i></div>`;
  openModal("je-detail-modal");

  try {
    const { getDoc, doc: fsDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const snap = await getDoc(fsDoc(db, `companies/${COMPANY_ID}/journalEntries`, id));
    if (!snap.exists()) throw new Error("القيد غير موجود");
    const e = { id: snap.id, ...snap.data() };

    document.getElementById("je-detail-title").textContent = `قيد: ${e.entryNumber || id.slice(0,8)}`;
    const status   = e.status || "posted";
    const isPost   = status === "posted";

    body.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;padding:0 4px">
        <div style="background:var(--bg-1);border-radius:8px;padding:10px;border:1px solid var(--border-soft)">
          <div style="font-size:10px;color:var(--text-2);margin-bottom:3px">رقم القيد</div>
          <div style="font-weight:900;color:var(--brand);font-size:15px">${e.entryNumber && e.entryNumber !== 'undefined' ? e.entryNumber : 'JE-' + id.slice(-6).toUpperCase()}</div>
        </div>
        <div style="background:var(--bg-1);border-radius:8px;padding:10px;border:1px solid var(--border-soft)">
          <div style="font-size:10px;color:var(--text-2);margin-bottom:3px">التاريخ</div>
          <div style="font-weight:700">${e.date||"—"}</div>
        </div>
        <div style="background:var(--bg-1);border-radius:8px;padding:10px;border:1px solid var(--border-soft)">
          <div style="font-size:10px;color:var(--text-2);margin-bottom:3px">الحالة</div>
          <div>${isPost ? '<span class="badge-posted">مرحّل</span>' :
                          '<span class="badge-draft">مسودة</span>'}</div>
        </div>
      </div>
      <div style="background:var(--bg-1);border-radius:8px;padding:10px;border:1px solid var(--border-soft);margin-bottom:14px">
        <div style="font-size:10px;color:var(--text-2);margin-bottom:3px">البيان</div>
        <div style="font-weight:600">${e.description}</div>
        ${e.reference ? `<div style="font-size:11px;color:var(--text-2);margin-top:3px">مرجع: ${e.reference}</div>` : ""}
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="background:var(--bg-2)">
            <th style="padding:8px 10px;font-size:11px;font-weight:800">الحساب</th>
            <th style="padding:8px 10px;font-size:11px;font-weight:800">البيان الفرعي</th>
            <th style="padding:8px 10px;font-size:11px;font-weight:800;color:#818cf8;text-align:right">مدين</th>
            <th style="padding:8px 10px;font-size:11px;font-weight:800;color:#34d399;text-align:right">دائن</th>
          </tr>
        </thead>
        <tbody>
          ${(e.lines||[]).map(l => `
            <tr style="border-bottom:1px solid rgba(255,255,255,.04)">
              <td style="padding:8px 10px">
                <span style="font-family:monospace;font-size:11px;color:var(--brand)">${l.accountCode}</span>
                <span style="margin-right:6px">${l.accountName}</span>
              </td>
              <td style="padding:8px 10px;color:var(--text-2);font-size:12px">
                <div>${l.note||"—"}</div>
                ${(l.serviceProvider || l.taxNumber || l.invoiceRef) ? `
                  <div style="font-size:10px;color:var(--text-3);margin-top:4px;background:rgba(255,255,255,0.02);padding:4px 6px;border-radius:4px;border:1px dashed var(--border-soft);display:inline-block;">
                    ${l.serviceProvider ? `<span>👤 مورد الخدمة: <strong>${l.serviceProvider}</strong></span>` : ""}
                    ${l.taxNumber ? `<span style="margin-right:10px;">🏷️ الرقم الضريبي: <strong>${l.taxNumber}</strong></span>` : ""}
                    ${l.invoiceRef ? `<span style="margin-right:10px;">📄 فاتورة: <strong>${l.invoiceRef}</strong></span>` : ""}
                  </div>
                ` : ""}
              </td>
              <td style="padding:8px 10px;text-align:right;font-family:monospace;font-weight:${l.debit?"800":"400"};color:${l.debit?"#818cf8":"var(--text-3)"}">
                ${l.debit ? formatCurrency(l.debit) : "—"}
              </td>
              <td style="padding:8px 10px;text-align:right;font-family:monospace;font-weight:${l.credit?"800":"400"};color:${l.credit?"#34d399":"var(--text-3)"}">
                ${l.credit ? formatCurrency(l.credit) : "—"}
              </td>
            </tr>`).join("")}
        </tbody>
        <tfoot>
          <tr style="background:var(--bg-2);border-top:2px solid var(--border-soft)">
            <td colspan="2" style="padding:10px;font-weight:800">الإجمالي</td>
            <td style="padding:10px;text-align:right;font-weight:900;color:#818cf8">${formatCurrency(e.totalDebit||0)}</td>
            <td style="padding:10px;text-align:right;font-weight:900;color:#34d399">${formatCurrency(e.totalCredit||0)}</td>
          </tr>
        </tfoot>
      </table>
      <div style="font-size:10px;color:var(--text-3);margin-top:10px;text-align:left">
        أنشأه: ${e.createdByName||"—"} | ${e.createdAt?.toDate ? e.createdAt.toDate().toLocaleString("ar-SA") : ""}
      </div>
    `;

    const footer = document.getElementById("je-detail-footer");
    if (footer) {
      footer.innerHTML = `
        <button class="btn btn-ghost" onclick="closeModal('je-detail-modal')">إغلاق</button>
        <button class="btn btn-secondary" onclick="printSingleJournalVoucher('${id}')">
          <i class="fas fa-print"></i> طباعة سند القيد
        </button>
      `;
    }
  } catch(err) {
    body.innerHTML = `<div class="alert bad">${err.message}</div>`;
  }
};

// ──────────────────────────────────────────
// GENERAL LEDGER (دفتر الأستاذ)
// ──────────────────────────────────────────
let _ledgerAccId = null;

function setupLedgerSearch() {
  const inp  = document.getElementById("ledger-acc-input");
  const drop = document.getElementById("ledger-acc-dropdown");
  if (!inp || !drop) return;

  inp.addEventListener("input", () => {
    const q = inp.value.trim().toLowerCase();
    if (!q) { drop.classList.add("hidden"); return; }
    const filtered = accounts.filter(a =>
      (a.code||"").toLowerCase().includes(q) ||
      (a.name||"").toLowerCase().includes(q)
    ).slice(0,30);

    drop.innerHTML = filtered.map(a => `
      <div class="je-acc-option" onclick="selectLedgerAcc('${a.id}','${a.code}','${(a.name||"").replace(/'/g,"\\'")}')">
        <span class="je-acc-code">${a.code}</span>
        <span class="je-acc-name">${a.name}</span>
        <span class="je-acc-type">${ACC_TYPE_LABELS[a.type]||""}</span>
      </div>`).join("");
    drop.classList.remove("hidden");
  });
  inp.addEventListener("blur", () => setTimeout(() => drop.classList.add("hidden"), 200));
}

window.ledgerAccSearch = (val) => {
  const inp  = document.getElementById("ledger-acc-input");
  const drop = document.getElementById("ledger-acc-dropdown");
  if (!inp || !drop) return;
  const q = val.trim().toLowerCase();
  if (!q) { drop.classList.add("hidden"); return; }
  const filtered = accounts.filter(a =>
    (a.code||"").toLowerCase().includes(q) ||
    (a.name||"").toLowerCase().includes(q)
  ).slice(0,30);

  drop.innerHTML = filtered.map(a => `
    <div class="je-acc-option" onmousedown="selectLedgerAcc('${a.id}','${a.code}','${(a.name||"").replace(/'/g,"\\'")}')">
      <span class="je-acc-code">${a.code}</span>
      <span class="je-acc-name">${a.name}</span>
      <span class="je-acc-type">${ACC_TYPE_LABELS[a.type]||""}</span>
    </div>`).join("");
  drop.classList.toggle("hidden", !filtered.length);
};

window.selectLedgerAcc = (id, code, name) => {
  _ledgerAccId = id;
  const inp  = document.getElementById("ledger-acc-input");
  const drop = document.getElementById("ledger-acc-dropdown");
  if (inp)  inp.value = `${code} — ${name}`;
  if (drop) drop.classList.add("hidden");
};

window.loadLedger = async () => {
  const content = document.getElementById("ledger-content");
  if (!content) return;

  if (!_ledgerAccId) {
    window.showToast?.("اختر حساباً أولاً","warn"); return;
  }
  const acc  = accounts.find(a => a.id === _ledgerAccId);
  const from = document.getElementById("ledger-from")?.value;
  const to   = document.getElementById("ledger-to")?.value;

  content.innerHTML = `<div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin"></i></div>`;

  try {
    const q    = query(COLS.journalEntries(), orderBy("createdAt"), limit(1000));
    const snap = await getDocs(q);
    const entries = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(e => !e.status || e.status === "posted")
      .sort((a,b) => (a.date||"").localeCompare(b.date||""));


    const isDebitNature = ["asset","expense"].includes(acc?.type);

    // Collect relevant movements
    const movements = [];
    entries.forEach(entry => {
      (entry.lines||[]).forEach(line => {
        if (line.accountId !== _ledgerAccId && line.accountCode !== acc?.code) return;
        const date = entry.date || "";
        if (from && date < from) return;
        if (to   && date > to)   return;
        movements.push({
          date,
          entryNum: (e => e.entryNumber && e.entryNumber !== 'undefined' ? e.entryNumber : 'JE-' + entry.id.slice(-6).toUpperCase())(entry),
          desc:     entry.description || "",
          note:     line.note || "",
          debit:    line.debit  || 0,
          credit:   line.credit || 0,
        });
      });
    });

    movements.sort((a,b) => a.date.localeCompare(b.date) || a.entryNum.localeCompare(b.entryNum));

    const openBal = acc?.openingBalance || 0;
    let running   = openBal;
    let totalDr   = 0, totalCr = 0;

    const rows = movements.map((m, i) => {
      totalDr  += m.debit;
      totalCr  += m.credit;
      running  += isDebitNature ? (m.debit - m.credit) : (m.credit - m.debit);
      const side = running >= 0 ? (isDebitNature ? "م" : "د") : (isDebitNature ? "د" : "م");
      return `
        <tr>
          <td class="mono" style="font-size:11px;color:var(--text-2)">${i+1}</td>
          <td class="mono" style="font-size:11px">${m.date}</td>
          <td style="color:var(--brand);font-size:11px;font-family:monospace">${m.entryNum}</td>
          <td style="font-size:12px">${m.desc}${m.note ? ` — <span style="color:var(--text-2)">${m.note}</span>` : ""}</td>
          <td style="text-align:right;font-family:monospace;color:${m.debit?"#818cf8":"var(--text-3)"};font-weight:${m.debit?"800":"400"}">
            ${m.debit ? formatCurrency(m.debit) : "—"}
          </td>
          <td style="text-align:right;font-family:monospace;color:${m.credit?"#34d399":"var(--text-3)"};font-weight:${m.credit?"800":"400"}">
            ${m.credit ? formatCurrency(m.credit) : "—"}
          </td>
          <td class="ledger-running ${running>=0?"running-dr":"running-cr"}" style="text-align:right">
            ${formatCurrency(Math.abs(running))} ${side}
          </td>
        </tr>`;
    });

    const closingBal = running;

    content.innerHTML = `
      <div class="ledger-header">
        <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:10px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i class="fas fa-book" style="color:#fff;font-size:18px"></i>
        </div>
        <div class="ledger-acc-info">
          <h4>${acc?.code||""} — ${acc?.name||""}</h4>
          <p>دفتر الأستاذ | ${from||"—"} إلى ${to||"—"} | الحركات المرحّلة فقط</p>
        </div>
      </div>

      <div class="ledger-summary">
        <div class="ledger-sum-card">
          <div class="ledger-sum-label">إجمالي المدين</div>
          <div class="ledger-sum-val" style="color:#818cf8">${formatCurrency(totalDr)}</div>
        </div>
        <div class="ledger-sum-card">
          <div class="ledger-sum-label">إجمالي الدائن</div>
          <div class="ledger-sum-val" style="color:#34d399">${formatCurrency(totalCr)}</div>
        </div>
        <div class="ledger-sum-card">
          <div class="ledger-sum-label">الرصيد الختامي</div>
          <div class="ledger-sum-val" style="color:${closingBal>=0?"#10b981":"#ef4444"}">
            ${formatCurrency(Math.abs(closingBal))} ${closingBal>=0?(isDebitNature?"مدين":"دائن"):(isDebitNature?"دائن":"مدين")}
          </div>
        </div>
      </div>

      <div class="ledger-table-wrap">
        <table class="ledger-table">
          <thead>
            <tr>
              <th style="width:32px">#</th>
              <th>التاريخ</th>
              <th>رقم القيد</th>
              <th>البيان</th>
              <th style="text-align:right;color:#818cf8">مدين</th>
              <th style="text-align:right;color:#34d399">دائن</th>
              <th style="text-align:right">الرصيد المتحرك</th>
            </tr>
          </thead>
          <tbody>
            <tr style="color:var(--text-2);font-style:italic;background:rgba(99,102,241,.05)">
              <td colspan="4" style="padding:8px 12px">رصيد افتتاحي</td>
              <td></td><td></td>
              <td style="text-align:right;font-weight:800;padding:8px 12px">${formatCurrency(openBal)}</td>
            </tr>
            ${rows.join("") || `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-2)">لا توجد حركات في هذه الفترة</td></tr>`}
          </tbody>
        </table>
      </div>`;
  } catch(err) {
    content.innerHTML = `<div class="alert bad" style="margin:14px">${err.message}</div>`;
  }
};

window.printLedger = () => window.print();

// ──────────────────────────────────────────
// Bind Global Handlers
// ──────────────────────────────────────────
function bindGlobalHandlers() {
  // Close account dropdowns on outside click
  document.addEventListener("click", e => {
    if (!e.target.closest(".je-acc-search-wrap") && !e.target.closest(".je-acc-dropdown")) {
      document.querySelectorAll(".je-acc-dropdown").forEach(d => d.classList.add("hidden"));
    }
  });
}

// ──────────────────────────────────────────
// Professional Journal Voucher & Log Printing Engine
// ──────────────────────────────────────────

async function fetchCompanyDetails() {
  let company = {};
  try {
    const cached = localStorage.getItem("idham_company");
    if (cached) company = JSON.parse(cached);
  } catch(e) {}

  try {
    const compSnap = await getDoc(fsDoc(db, `companies/${COMPANY_ID}/settings`, "company"));
    if (compSnap.exists()) {
      company = { ...company, ...compSnap.data() };
    }
    const logoSnap = await getDoc(fsDoc(db, `companies/${COMPANY_ID}/settings`, "logo"));
    if (logoSnap.exists()) {
      company.logoUrl = logoSnap.data().dataUrl || logoSnap.data().logoUrl || company.logoUrl || "";
    }
  } catch (err) {
    console.warn("Failed to load company details for journal printing:", err);
  }
  return company;
}

function _buildJournalVoucherHTML(je, company) {
  const typeMap = {
    manual: "يدوي", salesInvoice: "مبيعات", purchaseInvoice: "مشتريات",
    salesReturn: "مردود بيع", purchaseReturn: "مردود شراء", reversing: "عكسي", pos: "POS",
    stockTransfer: "تحويل مخزني", salesCOGS: "تكلفة مبيعات"
  };

  const coName    = company.name || company.companyName || "مؤسسة إدهام للمواد الغذائية";
  const coAddress = [company.address, company.city, company.zip, company.country].filter(Boolean).join("، ") || "ينبع، المملكة العربية السعودية";
  const coPhone   = company.phone || "";
  const coEmail   = company.email || "";
  const coVat     = company.vatNumber || company.vat || company.taxNumber || "";
  const coCr      = company.crNumber || company.cr || "";
  const coLogo    = company.logoUrl || company.logoBase64 || company.logo || "";

  const totalDr = (je.lines || []).reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalCr = (je.lines || []).reduce((sum, l) => sum + (l.credit || 0), 0);
  const isPost  = (je.status || "posted") === "posted";
  const isBal   = Math.abs(totalDr - totalCr) < 0.01;

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>سند قيد محاسبي — ${je.entryNumber || je.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', Arial, sans-serif;
      direction: rtl;
      color: #1e293b;
      background: #fff;
      padding: 24px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @media print {
      body { padding: 0; }
      @page { size: A4 portrait; margin: 10mm; }
      .no-print { display: none !important; }
    }
    .v-container {
      max-width: 840px;
      margin: 0 auto;
      border: 1px solid #cbd5e1;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    }
    /* Header */
    .v-header {
      background: linear-gradient(135deg, #0f2460 0%, #1d4ed8 60%, #2563eb 100%) !important;
      padding: 22px 30px;
      color: #fff !important;
    }
    .v-header-gold {
      height: 4px;
      background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b) !important;
    }
    .v-badge-box {
      background: rgba(255,255,255,0.18) !important;
      border: 1px solid rgba(255,255,255,0.3) !important;
      border-radius: 12px;
      padding: 8px 20px;
      text-align: center;
    }
    /* Metadata Grid */
    .v-meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 16px 24px;
    }
    .v-meta-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
      text-align: center;
    }
    .v-meta-label { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
    .v-meta-val { font-size: 13px; font-weight: 800; color: #0f172a; }
    /* Description Bar */
    .v-desc-bar {
      padding: 12px 24px;
      background: #eff6ff;
      border-bottom: 1px solid #dbeafe;
      font-size: 12.5px;
      color: #1e40af;
      line-height: 1.5;
    }
    /* Lines Table */
    .v-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .v-table th {
      background: #f1f5f9 !important;
      color: #334155;
      font-weight: 800;
      padding: 10px 12px;
      border-bottom: 2px solid #cbd5e1;
      text-align: right;
    }
    .v-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }
    .v-table tr:nth-child(even) td { background: #fafafa; }
    .v-totals-row td {
      background: #f8fafc !important;
      font-weight: 900;
      font-size: 13px;
      border-top: 2px solid #94a3b8;
      border-bottom: 2px solid #94a3b8;
    }
    /* Signatures */
    .v-sigs {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      padding: 24px;
      background: #fff;
      border-top: 1px solid #e2e8f0;
    }
    .v-sig-box {
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      padding: 14px;
      text-align: center;
    }
    .v-sig-title { font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 30px; }
    .v-sig-line { border-top: 1px solid #94a3b8; width: 80%; margin: 0 auto; padding-top: 4px; font-size: 11px; color: #334155; font-weight: 700; }
    .v-footer {
      background: #f8fafc;
      padding: 8px 24px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>
  <div class="v-container">

    <!-- Header -->
    <div class="v-header">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:14px;">
          ${coLogo ? `<img src="${coLogo}" style="height:64px;width:64px;object-fit:contain;background:#fff;border-radius:8px;padding:4px;box-shadow:0 2px 4px rgba(0,0,0,0.1);" />` : `<div style="width:60px;height:60px;background:rgba(255,255,255,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:28px;">🏢</div>`}
          <div>
            <div style="font-size:20px;font-weight:900;color:#fff !important;line-height:1.2;">${coName}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.9) !important;margin-top:3px;">📍 ${coAddress}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.85) !important;margin-top:2px;display:flex;gap:12px;">
              ${coPhone ? `<span>📞 الهاتف: ${coPhone}</span>` : ""}
              ${coVat ? `<span>🔢 الرقم الضريبي: <strong>${coVat}</strong></span>` : ""}
              ${coCr ? `<span>📋 سجل تجاري: <strong>${coCr}</strong></span>` : ""}
            </div>
          </div>
        </div>
        <div class="v-badge-box">
          <div style="font-size:22px;font-weight:900;color:#fff !important;">سند قيد محاسبي</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.85) !important;letter-spacing:1px;">JOURNAL VOUCHER</div>
        </div>
      </div>
    </div>
    <div class="v-header-gold"></div>

    <!-- Metadata Grid -->
    <div class="v-meta-grid">
      <div class="v-meta-card">
        <div class="v-meta-label">رقم القيد</div>
        <div class="v-meta-val" style="color:#1d4ed8;font-family:monospace;">${je.entryNumber || je.id.slice(0,8)}</div>
      </div>
      <div class="v-meta-card">
        <div class="v-meta-label">تاريخ القيد</div>
        <div class="v-meta-val">${je.date || "—"}</div>
      </div>
      <div class="v-meta-card">
        <div class="v-meta-label">نوع القيد</div>
        <div class="v-meta-val">${typeMap[je.sourceType] || je.sourceType || "يدوي"}</div>
      </div>
      <div class="v-meta-card">
        <div class="v-meta-label">حالة القيد</div>
        <div class="v-meta-val" style="color:${isPost ? '#059669' : '#d97706'}">${isPost ? "مرحّل ✓" : "مسودة"}</div>
      </div>
    </div>

    <!-- General Description -->
    <div class="v-desc-bar">
      <strong>البيان العام للقيد:</strong> ${je.description || "بدون بيان"}
      ${je.reference ? `<span style="margin-right:20px;color:#475569;">| مرجع المستند: <strong>${je.reference}</strong></span>` : ""}
    </div>

    <!-- Lines Table -->
    <table class="v-table">
      <thead>
        <tr>
          <th style="width:36px;text-align:center;">#</th>
          <th style="width:110px;">كود الحساب</th>
          <th>اسم الحساب</th>
          <th>البيان الفرعي والتفاصيل</th>
          <th style="width:125px;text-align:right;color:#1d4ed8;">مدين (ر.س)</th>
          <th style="width:125px;text-align:right;color:#059669;">دائن (ر.س)</th>
        </tr>
      </thead>
      <tbody>
        ${(je.lines || []).map((l, idx) => `
          <tr>
            <td style="text-align:center;color:#64748b;font-size:11px;">${idx + 1}</td>
            <td style="font-family:monospace;font-weight:700;color:#1d4ed8;">${l.accountCode || "—"}</td>
            <td style="font-weight:700;">${l.accountName || "—"}</td>
            <td>
              <div>${l.note || "—"}</div>
              ${(l.serviceProvider || l.taxNumber || l.invoiceRef) ? `
                <div style="font-size:10.5px;color:#475569;margin-top:2px;background:#f1f5f9;padding:2px 6px;border-radius:4px;display:inline-block;">
                  ${l.serviceProvider ? `مورد: ${l.serviceProvider} ` : ""}
                  ${l.taxNumber ? `| ضريبي: ${l.taxNumber} ` : ""}
                  ${l.invoiceRef ? `| فاتورة: ${l.invoiceRef}` : ""}
                </div>
              ` : ""}
            </td>
            <td style="text-align:right;font-family:monospace;font-weight:${l.debit ? '800' : '400'};color:${l.debit ? '#1e40af' : '#94a3b8'};">
              ${l.debit ? formatCurrency(l.debit) : "—"}
            </td>
            <td style="text-align:right;font-family:monospace;font-weight:${l.credit ? '800' : '400'};color:${l.credit ? '#047857' : '#94a3b8'};">
              ${l.credit ? formatCurrency(l.credit) : "—"}
            </td>
          </tr>
        `).join("")}
        <tr class="v-totals-row">
          <td colspan="4" style="text-align:right;padding:12px;">
            الإجمالي الكلي للقيد المحاسبي
            <span style="font-size:11px;font-weight:700;color:${isBal ? '#059669' : '#dc2626'};margin-right:12px;">
              (${isBal ? '✓ القيد متوازن ومطابق' : '⚠️ غير متوازن'})
            </span>
          </td>
          <td style="text-align:right;color:#1e40af;font-family:monospace;">${formatCurrency(totalDr)}</td>
          <td style="text-align:right;color:#047857;font-family:monospace;">${formatCurrency(totalCr)}</td>
        </tr>
      </tbody>
    </table>

    <!-- Signatures Block -->
    <div class="v-sigs">
      <div class="v-sig-box">
        <div class="v-sig-title">إعداد المحاسب المنشئ</div>
        <div class="v-sig-line">${je.createdByName || "المحاسب المسؤول"}</div>
      </div>
      <div class="v-sig-box">
        <div class="v-sig-title">المراجعة المحاسبية</div>
        <div class="v-sig-line">إدارة الحسابات</div>
      </div>
      <div class="v-sig-box">
        <div class="v-sig-title">الاعتماد والترخيص</div>
        <div class="v-sig-line">المدير المالي / العام</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="v-footer">
      <span>طُبع بواسطة: <strong>نظام إدهام للمواد الغذائية ERP</strong></span>
      <span>تاريخ الطباعة: <strong>${new Date().toLocaleString("ar-SA")}</strong></span>
    </div>

  </div>
</body>
</html>
  `;
}

function _buildJournalLogReportHTML(entries, company, filters) {
  const coName    = company.name || company.companyName || "مؤسسة إدهام للمواد الغذائية";
  const coAddress = [company.address, company.city, company.zip, company.country].filter(Boolean).join("، ") || "ينبع، المملكة العربية السعودية";
  const coPhone   = company.phone || "";
  const coVat     = company.vatNumber || company.vat || company.taxNumber || "";
  const coCr      = company.crNumber || company.cr || "";
  const coLogo    = company.logoUrl || company.logoBase64 || company.logo || "";

  const typeLabels = {
    manual: "يدوي", salesInvoice: "مبيعات", purchaseInvoice: "مشتريات",
    salesReturn: "مردود بيع", purchaseReturn: "مردود شراء", reversing: "عكسي", pos: "POS"
  };

  const totalDr = entries.reduce((s, e) => s + Math.max(e.totalDebit || 0, (e.lines || []).reduce((a, l) => a + (l.debit || 0), 0)), 0);
  const totalCr = entries.reduce((s, e) => s + Math.max(e.totalCredit || 0, (e.lines || []).reduce((a, l) => a + (l.credit || 0), 0)), 0);

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>تقرير دفتر اليومية العامة — ${coName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', Arial, sans-serif;
      direction: rtl;
      color: #1e293b;
      background: #fff;
      padding: 20px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @media print {
      body { padding: 0; }
      @page { size: A4 landscape; margin: 10mm; }
      .no-print { display: none !important; }
    }
    .r-container {
      max-width: 1100px;
      margin: 0 auto;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      overflow: hidden;
    }
    .r-header {
      background: linear-gradient(135deg, #0f2460 0%, #1d4ed8 60%, #2563eb 100%) !important;
      padding: 20px 24px;
      color: #fff !important;
    }
    .r-header-gold {
      height: 4px;
      background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b) !important;
    }
    .r-filter-bar {
      background: #f8fafc;
      padding: 10px 20px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11.5px;
      color: #475569;
      display: flex;
      gap: 24px;
    }
    .r-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
    }
    .r-table th {
      background: #f1f5f9 !important;
      color: #334155;
      font-weight: 800;
      padding: 8px 10px;
      border-bottom: 2px solid #cbd5e1;
      text-align: right;
    }
    .r-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    .r-table tr:nth-child(even) td { background: #fafafa; }
    .r-totals td {
      background: #f8fafc !important;
      font-weight: 900;
      font-size: 12px;
      border-top: 2px solid #94a3b8;
    }
  </style>
</head>
<body>
  <div class="r-container">
    <div class="r-header">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:14px;">
          ${coLogo ? `<img src="${coLogo}" style="height:56px;width:56px;object-fit:contain;background:#fff;border-radius:8px;padding:3px;" />` : `<div style="width:50px;height:50px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;">🏢</div>`}
          <div>
            <div style="font-size:18px;font-weight:900;color:#fff !important;">${coName}</div>
            <div style="font-size:10.5px;color:rgba(255,255,255,0.9) !important;margin-top:2px;">📍 ${coAddress} | 📞 ${coPhone} | 🔢 ضريبي: ${coVat}</div>
          </div>
        </div>
        <div style="text-align:left;background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.3);border-radius:10px;padding:6px 16px;">
          <div style="font-size:20px;font-weight:900;color:#fff !important;">تقرير دفتر اليومية العامة</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.85) !important;letter-spacing:1px;">GENERAL JOURNAL LOG</div>
        </div>
      </div>
    </div>
    <div class="r-header-gold"></div>

    <div class="r-filter-bar">
      <span>📅 الفترة: <strong>${filters.from || "بداية الفترة"}</strong> إلى <strong>${filters.to || "اليوم"}</strong></span>
      <span>🏷️ نوع القيود: <strong>${filters.typeF ? (typeLabels[filters.typeF] || filters.typeF) : "الكل"}</strong></span>
      <span>📋 الحالة: <strong>${filters.statusF ? (filters.statusF === 'posted' ? 'مرحّل' : 'مسودة') : "الكل"}</strong></span>
      <span>📊 إجمالي القيود: <strong>${entries.length} قيد</strong></span>
    </div>

    <table class="r-table">
      <thead>
        <tr>
          <th style="width:32px;text-align:center;">#</th>
          <th style="width:90px;">التاريخ</th>
          <th style="width:110px;">رقم القيد</th>
          <th>البيان المحاسبي</th>
          <th style="width:80px;">النوع</th>
          <th style="width:70px;">الحالة</th>
          <th style="width:115px;text-align:right;color:#1d4ed8;">مدين (ر.س)</th>
          <th style="width:115px;text-align:right;color:#059669;">دائن (ر.س)</th>
          <th style="width:100px;">المنشئ</th>
        </tr>
      </thead>
      <tbody>
        ${entries.map((e, idx) => {
          const dr = Math.max(e.totalDebit || 0, (e.lines || []).reduce((a, l) => a + (l.debit || 0), 0));
          const cr = Math.max(e.totalCredit || 0, (e.lines || []).reduce((a, l) => a + (l.credit || 0), 0));
          return `
            <tr>
              <td style="text-align:center;color:#64748b;font-size:10.5px;">${idx + 1}</td>
              <td style="font-family:monospace;font-size:11px;">${e.date || ""}</td>
              <td style="font-family:monospace;font-weight:700;color:#1d4ed8;">${e.entryNumber || e.id.slice(0,8)}</td>
              <td>${e.description || "—"}</td>
              <td>${typeLabels[e.sourceType] || e.sourceType || "يدوي"}</td>
              <td>${(e.status || "posted") === "posted" ? "مرحّل" : "مسودة"}</td>
              <td style="text-align:right;font-family:monospace;font-weight:700;color:#1e40af;">${formatCurrency(dr)}</td>
              <td style="text-align:right;font-family:monospace;font-weight:700;color:#047857;">${formatCurrency(cr)}</td>
              <td style="font-size:10.5px;color:#64748b;">${e.createdByName || "—"}</td>
            </tr>
          `;
        }).join("")}
        <tr class="r-totals">
          <td colspan="6" style="text-align:right;padding:10px;">إجمالي حركات دفتر اليومية العامة</td>
          <td style="text-align:right;color:#1e40af;font-family:monospace;">${formatCurrency(totalDr)}</td>
          <td style="text-align:right;color:#047857;font-family:monospace;">${formatCurrency(totalCr)}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>
  `;
}

window.printSingleJournalVoucher = async (id) => {
  let je = _allEntries.find(x => x.id === id);
  if (!je) {
    try {
      const snap = await getDoc(fsDoc(db, `companies/${COMPANY_ID}/journalEntries`, id));
      if (snap.exists()) je = { id: snap.id, ...snap.data() };
    } catch(err) {}
  }
  if (!je) {
    window.showToast?.("عذراً، لم يتم العثور على بيانات القيد المطلوب", "bad");
    return;
  }

  const company = await fetchCompanyDetails();
  const html = _buildJournalVoucherHTML(je, company);

  const win = window.open("", "_blank");
  if (!win) {
    window.showToast?.("يرجى السماح بالنوافذ المنبثقة للطباعة", "warn");
    return;
  }
  win.document.write(html);
  win.document.close();
  setTimeout(() => {
    win.focus();
    win.print();
  }, 400);
};

window.printJournalLogReport = async () => {
  const company = await fetchCompanyDetails();
  const from    = document.getElementById("je-from")?.value || "";
  const to      = document.getElementById("je-to")?.value || "";
  const typeF   = document.getElementById("je-type-filter")?.value || "";
  const statusF = document.getElementById("je-status-filter")?.value || "";

  const html = _buildJournalLogReportHTML(_allEntries, company, { from, to, typeF, statusF });

  const win = window.open("", "_blank");
  if (!win) {
    window.showToast?.("يرجى السماح بالنوافذ المنبثقة للطباعة", "warn");
    return;
  }
  win.document.write(html);
  win.document.close();
  setTimeout(() => {
    win.focus();
    win.print();
  }, 400);
};
