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

  <!-- ═══════ HERO HEADER ═══════ -->
  <div class="je-hero">
    <div class="je-hero-bg"></div>
    <div class="je-hero-content">
      <div class="je-hero-right">
        <div class="je-hero-icon">
          <i class="fas fa-book-open"></i>
        </div>
        <div>
          <h1 class="je-hero-title">القيود اليومية</h1>
          <p class="je-hero-sub">دفتر اليومية — تسجيل وترحيل القيود المحاسبية</p>
        </div>
      </div>
      <div class="je-hero-left">
        <button class="je-btn je-btn-hero-ghost" onclick="loadJournalEntries(true)">
          <i class="fas fa-sync-alt"></i> تحديث
        </button>
        <button class="je-btn je-btn-hero-ghost" onclick="exportPagePDF('.je-log-table','دفتر_اليومية')">
          <i class="fas fa-file-pdf"></i> PDF
        </button>
        <button class="je-btn je-btn-hero-ghost" onclick="exportPageExcel('.je-log-table','دفتر_اليومية')">
          <i class="fas fa-file-excel"></i> Excel
        </button>
        <button class="je-btn je-btn-hero-ghost" onclick="printJournalLogReport()">
          <i class="fas fa-print"></i> طباعة
        </button>
        <button class="je-btn je-btn-hero-primary" onclick="openJournalModal()">
          <i class="fas fa-plus"></i> قيد يدوي جديد
        </button>
      </div>
    </div>

    <!-- KPI Chips داخل الهيدر -->
    <div class="je-hero-kpis">
      <div class="je-hkpi">
        <div class="je-hkpi-icon hk-blue"><i class="fas fa-arrow-down"></i></div>
        <div>
          <div class="je-hkpi-lbl">إجمالي المدين</div>
          <div class="je-hkpi-val" id="kpi-total-dr">—</div>
        </div>
      </div>
      <div class="je-hkpi-sep"></div>
      <div class="je-hkpi">
        <div class="je-hkpi-icon hk-green"><i class="fas fa-arrow-up"></i></div>
        <div>
          <div class="je-hkpi-lbl">إجمالي الدائن</div>
          <div class="je-hkpi-val" id="kpi-total-cr">—</div>
        </div>
      </div>
      <div class="je-hkpi-sep"></div>
      <div class="je-hkpi">
        <div class="je-hkpi-icon hk-indigo"><i class="fas fa-balance-scale"></i></div>
        <div>
          <div class="je-hkpi-lbl">ميزان الفترة</div>
          <div class="je-hkpi-val" id="kpi-balance">—</div>
        </div>
      </div>
      <div class="je-hkpi-sep"></div>
      <div class="je-hkpi">
        <div class="je-hkpi-icon hk-amber"><i class="fas fa-receipt"></i></div>
        <div>
          <div class="je-hkpi-lbl">عدد القيود</div>
          <div class="je-hkpi-val" id="kpi-count">—</div>
        </div>
      </div>
      <div class="je-hkpi-sep"></div>
      <div class="je-hkpi">
        <div class="je-hkpi-icon hk-teal"><i class="fas fa-check-circle"></i></div>
        <div>
          <div class="je-hkpi-lbl">مرحّلة</div>
          <div class="je-hkpi-val" id="kpi-posted">—</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ─── Page Tabs ─── -->
  <div class="je-tabs">
    <button class="je-tab active" id="tab-log" onclick="switchTab('log')">
      <i class="fas fa-book"></i> دفتر اليومية
    </button>
    <button class="je-tab" id="tab-ledger" onclick="switchTab('ledger')">
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
          <option value="stockTransfer">تحويل مخزني</option>
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

      <!-- Quick Accrual & Recurring Templates Bar -->
      <div style="background:var(--bg-2);border:1px solid var(--border-soft);border-radius:10px;padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span style="font-size:12.5px;font-weight:800;color:var(--brand);display:flex;align-items:center;gap:5px;">
            <i class="fas fa-magic"></i> نماذج استحقاق دورية:
          </span>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button type="button" class="btn btn-sm btn-ghost" onclick="applyJETemplate('depreciation')" style="font-size:11.5px;padding:3px 8px;border:1px solid var(--border-soft);" title="قيد إهلاك الأصول الثابتة">📉 إهلاك الأصول</button>
            <button type="button" class="btn btn-sm btn-ghost" onclick="applyJETemplate('rent')" style="font-size:11.5px;padding:3px 8px;border:1px solid var(--border-soft);" title="قيد استحقاق الإيجار الشهري">🏢 استحقاق الإيجار</button>
            <button type="button" class="btn btn-sm btn-ghost" onclick="applyJETemplate('payroll')" style="font-size:11.5px;padding:3px 8px;border:1px solid var(--border-soft);" title="قيد استحقاق الرواتب والأجور">👥 استحقاق الرواتب</button>
            <button type="button" class="btn btn-sm btn-ghost" onclick="applyJETemplate('prepaid')" style="font-size:11.5px;padding:3px 8px;border:1px solid var(--border-soft);" title="قيد إطفاء مصروفات مدفوعة مقدماً / تأمين">🛡️ إطفاء مدفوع مقدماً</button>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <button type="button" class="btn btn-sm btn-ghost" onclick="saveCurrentAsCustomTemplate()" style="font-size:11px;padding:3px 8px;color:var(--text-1);border:1px dashed var(--border-soft);" title="حفظ سطور القيد الحالي كنموذج دوري خاص لاستدعائه كل شهر">
            💾 حفظ كقالب مخصص
          </button>
          <select id="je-custom-templates" onchange="applyCustomJETemplate(this.value)" class="input" style="font-size:11px;padding:2px 8px;height:28px;max-width:140px;display:none;">
            <option value="">📂 قوالبي المحفوظة</option>
          </select>
        </div>
      </div>

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

/* ────── Hero Header ────── */
.je-hero {
  position: relative; flex-shrink: 0; overflow: hidden;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 75%, #4f46e5 100%);
  padding: 0;
}
.je-hero-bg {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse at 10% 50%, rgba(99,102,241,.25) 0%, transparent 60%),
    radial-gradient(ellipse at 90% 20%, rgba(139,92,246,.20) 0%, transparent 50%);
}
.je-hero-content {
  position: relative; z-index: 1;
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 24px 14px;
  gap: 16px; flex-wrap: wrap;
}
.je-hero-right { display: flex; align-items: center; gap: 16px; }
.je-hero-icon {
  width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0;
  background: rgba(255,255,255,.15); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,.25);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; color: #fff;
  box-shadow: 0 4px 16px rgba(0,0,0,.2);
}
.je-hero-title {
  font-size: 22px; font-weight: 900; color: #fff; margin: 0 0 3px;
  letter-spacing: -.3px;
}
.je-hero-sub {
  font-size: 11.5px; color: rgba(255,255,255,.65); margin: 0;
}
.je-hero-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.je-btn-hero-ghost {
  padding: 8px 14px; border-radius: 9px; border: 1.5px solid rgba(255,255,255,.25);
  background: rgba(255,255,255,.1); color: #fff; cursor: pointer;
  font-size: 12px; font-weight: 700; font-family: inherit;
  display: flex; align-items: center; gap: 6px; transition: all .18s;
  backdrop-filter: blur(4px);
}
.je-btn-hero-ghost:hover { background: rgba(255,255,255,.2); border-color: rgba(255,255,255,.4); }
.je-btn-hero-primary {
  padding: 8px 16px; border-radius: 9px; border: none;
  background: rgba(255,255,255,.95); color: #4338ca; cursor: pointer;
  font-size: 12px; font-weight: 800; font-family: inherit;
  display: flex; align-items: center; gap: 6px; transition: all .18s;
  box-shadow: 0 3px 12px rgba(0,0,0,.2);
}
.je-btn-hero-primary:hover { background: #fff; transform: translateY(-1px); box-shadow: 0 5px 18px rgba(0,0,0,.3); }

/* Hero KPI Chips */
.je-hero-kpis {
  position: relative; z-index: 1;
  display: flex; align-items: center; gap: 0;
  padding: 0 24px 16px; overflow-x: auto;
}
.je-hkpi {
  display: flex; align-items: center; gap: 10px;
  padding: 0 20px; flex-shrink: 0;
}
.je-hkpi-sep {
  width: 1px; height: 32px; background: rgba(255,255,255,.15); flex-shrink: 0;
}
.je-hkpi-icon {
  width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px;
}
.hk-blue   { background: rgba(129,140,248,.25); color: #c7d2fe; }
.hk-green  { background: rgba(52,211,153,.25);  color: #6ee7b7; }
.hk-indigo { background: rgba(167,139,250,.25); color: #ddd6fe; }
.hk-amber  { background: rgba(251,191,36,.25);  color: #fde68a; }
.hk-teal   { background: rgba(45,212,191,.25);  color: #99f6e4; }
.je-hkpi-lbl { font-size: 9.5px; font-weight: 700; color: rgba(255,255,255,.55); margin-bottom: 2px; }
.je-hkpi-val { font-size: 14px; font-weight: 900; color: #fff; font-variant-numeric: tabular-nums; }

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
.je-row-action.warning:hover { border-color:#f59e0b; color:#f59e0b; background:rgba(245,158,11,.1); }

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

    // جلب كل القيود من الـ Cache أو السيرفر بدون تحديد limit مجتزأ
    let entries = await getAll(COLS.journalEntries());

    // Client-side sort by date desc (avoids composite index requirement)
    entries.sort((a,b) => (b.date||"").localeCompare(a.date||""));

    if (from)    entries = entries.filter(e => (e.date||"") >= from);
    if (to)      entries = entries.filter(e => (e.date||"") <= to);
    if (typeF)   entries = entries.filter(e => e.sourceType === typeF);
    if (statusF) entries = entries.filter(e => (e.status||"posted") === statusF);

    _allEntries = entries;

    const searchVal = document.getElementById("je-search")?.value;
    if (searchVal && searchVal.trim()) {
      filterJETable(searchVal);
    } else {
      renderJETable(entries);
      updateJEKPIs(entries);
    }
  } catch(err) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="alert bad" style="margin:8px">${err.message}</div></td></tr>`;
  }
};

function normAr(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .trim();
}

function updateJEKPIs(entries) {
  const totalDr  = (entries || []).reduce((s,e) => {
    const fromField = parseFloat(e.totalDebit || 0) || 0;
    const fromLines = (e.lines||[]).reduce((a,l) => a + (parseFloat(l.debit || 0) || 0), 0);
    return s + Math.max(fromField, fromLines);
  }, 0);
  const totalCr  = (entries || []).reduce((s,e) => {
    const fromField = parseFloat(e.totalCredit || 0) || 0;
    const fromLines = (e.lines||[]).reduce((a,l) => a + (parseFloat(l.credit || 0) || 0), 0);
    return s + Math.max(fromField, fromLines);
  }, 0);
  const posted   = (entries || []).filter(e => (e.status||"posted") === "posted").length;
  const balanced = Math.abs(totalDr - totalCr) < 0.01;

  const elDr = document.getElementById("kpi-total-dr");
  const elCr = document.getElementById("kpi-total-cr");
  const elBal = document.getElementById("kpi-balance");
  const elCnt = document.getElementById("kpi-count");
  const elPost = document.getElementById("kpi-posted");

  if (elDr) elDr.textContent = formatCurrency(totalDr);
  if (elCr) elCr.textContent = formatCurrency(totalCr);
  if (elBal) elBal.textContent = balanced ? "✓ متوازن" : formatCurrency(Math.abs(totalDr - totalCr));
  if (elCnt) elCnt.textContent = entries.length;
  if (elPost) elPost.textContent = posted;
}

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
    const dr = Math.max(parseFloat(e.totalDebit || 0) || 0, (e.lines||[]).reduce((a,l)=>a+(parseFloat(l.debit || 0) || 0),  0));
    const cr = Math.max(parseFloat(e.totalCredit || 0) || 0, (e.lines||[]).reduce((a,l)=>a+(parseFloat(l.credit || 0) || 0), 0));

    return `<tr class="status-${status} je-row-${typeKey}" onclick="viewJEEntry('${e.id}')">
      <td class="mono" style="font-size:11px;color:var(--text-2);white-space:nowrap">${e.date || ""}</td>
      <td class="mono" style="color:var(--brand);font-weight:900;font-size:12px;white-space:nowrap">${e.entryNumber && e.entryNumber !== 'undefined' ? e.entryNumber : (e.code || 'JE-' + e.id.slice(-6).toUpperCase())}</td>
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
          <button class="je-row-action warning" title="نسخ وتكرار القيد لشهر جديد" onclick="duplicateEntry('${e.id}')">
            <i class="fas fa-copy"></i>
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
  const q = normAr(val);
  if (!q) {
    renderJETable(_allEntries);
    updateJEKPIs(_allEntries);
    return;
  }

  const tokens = q.split(/\s+/).filter(Boolean);
  const typeLabels = {
    manual:"يدوي", salesInvoice:"مبيعات", purchaseInvoice:"مشتريات",
    salesReturn:"مردود بيع", purchaseReturn:"مردود شراء", reversing:"عكسي", pos:"POS",
    salesCOGS:"تكلفة البضاعة", cogs:"تكلفة مبيعات", receipt:"سند قبض",
    stockTransfer:"تحويل مخزون", physical_count:"جرد"
  };

  const filtered = _allEntries.filter(e => {
    const linesStr = (e.lines || []).map(l => 
      `${l.accountCode || ''} ${l.accountName || ''} ${l.note || ''} ${l.costCenterName || ''}`
    ).join(' ');

    const blob = `${e.entryNumber || ''} ${e.code || ''} ${e.description || ''} ${e.reference || ''} ${e.createdByName || ''} ${typeLabels[e.sourceType] || ''} ${linesStr}`;
    const normBlob = normAr(blob);

    return tokens.every(tok => normBlob.includes(tok));
  });

  renderJETable(filtered);
  updateJEKPIs(filtered);
};

// ──────────────────────────────────────────
// Open Journal Modal
// ──────────────────────────────────────────
window.openJournalModal = async (id = "") => {
  jLines = [];
  _acSearch = {};
  document.getElementById("je-form-error").classList.add("hidden");
  
  await loadCostCentersDropdown();
  loadCustomJETemplatesDropdown();
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
// Line Items Synchronization & Rendering
// ──────────────────────────────────────────
function syncDOMToLines() {
  const tbody = document.getElementById("je-lines-tbody");
  if (!tbody) return;
  const rows = tbody.querySelectorAll("tr[data-line]");
  rows.forEach(tr => {
    const idx = parseInt(tr.getAttribute("data-line"), 10);
    if (isNaN(idx) || !jLines[idx]) return;
    const noteInp = tr.querySelector(".je-note-input");
    const spInp = tr.querySelector("input[placeholder*='مورد الخدمة']");
    const taxInp = tr.querySelector("input[placeholder*='الرقم الضريبي']");
    const refInp = tr.querySelector("input[placeholder*='رقم الفاتورة']");
    const amtInps = tr.querySelectorAll(".je-amt-input");

    if (noteInp) jLines[idx].note = noteInp.value;
    if (spInp) jLines[idx].serviceProvider = spInp.value.trim();
    if (taxInp) jLines[idx].taxNumber = taxInp.value.trim();
    if (refInp) jLines[idx].invoiceRef = refInp.value.trim();
    if (amtInps.length >= 2) {
      const drVal = parseFloat(amtInps[0].value) || 0;
      const crVal = parseFloat(amtInps[1].value) || 0;
      jLines[idx].debit = drVal;
      jLines[idx].credit = crVal;
    }
  });
}

window.addJELine = () => {
  syncDOMToLines();
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
               value="${l.note || ''}" oninput="jLines[${i}].note=this.value" />
        <div style="display:flex; gap:4px; align-items:center;">
          <input type="text" class="je-sub-input" placeholder="مورد الخدمة..."
                 style="font-size:10px; padding:2px 4px; border:1px solid var(--border-soft); border-radius:4px; background:var(--bg-1); color:var(--text-0); width:120px;"
                 value="${l.serviceProvider || ''}" oninput="jLines[${i}].serviceProvider=this.value" />
          <input type="text" class="je-sub-input" placeholder="الرقم الضريبي..."
                 style="font-size:10px; padding:2px 4px; border:1px solid var(--border-soft); border-radius:4px; background:var(--bg-1); color:var(--text-0); width:120px;"
                 value="${l.taxNumber || ''}" oninput="jLines[${i}].taxNumber=this.value" />
          <input type="text" class="je-sub-input" placeholder="رقم الفاتورة..."
                 style="font-size:10px; padding:2px 4px; border:1px solid var(--border-soft); border-radius:4px; background:var(--bg-1); color:var(--text-0); width:100px;"
                 value="${l.invoiceRef || ''}" oninput="jLines[${i}].invoiceRef=this.value" />
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
  syncDOMToLines();
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

window.removeJELine = i => { syncDOMToLines(); jLines.splice(i,1); renderJELines(); updateJETotals(); };

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
  syncDOMToLines();
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
    
    // Auto-sync supplier & customer balances in real-time
    if (status === "posted") {
      syncBalancesForJournalLines(validLines).catch(() => {});
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
// Helper: Auto-sync Balances for Journal Lines
// ──────────────────────────────────────────
async function syncBalancesForJournalLines(lines = []) {
  if (!lines || !lines.length) return;
  try {
    const { recalculateSupplierBalance, recalculateCustomerBalance } = await import("../utils/balance-sync.js");
    const { getAll, COLS } = await import("../utils/db.js");
    const [allSuppliers, allCustomers, coa] = await Promise.all([
      getAll(COLS.suppliers()).catch(() => []),
      getAll(COLS.customers()).catch(() => []),
      getAll(COLS.chartOfAccounts()).catch(() => [])
    ]);

    const supIdSet = new Set();
    const custIdSet = new Set();

    lines.forEach(l => {
      const accId = l.accountId;
      const accCode = l.accountCode;
      const accName = (l.accountName || "").trim().toLowerCase();

      // Match in COA
      const coaMatch = (coa || []).find(a => a.id === accId || a.code === accCode || (a.name && a.name.trim().toLowerCase() === accName));
      if (coaMatch && coaMatch.sourceEntityId) {
        if (coaMatch.sourceModule === "suppliers" || (allSuppliers || []).some(s => s.id === coaMatch.sourceEntityId)) {
          supIdSet.add(coaMatch.sourceEntityId);
        } else if (coaMatch.sourceModule === "customers" || (allCustomers || []).some(c => c.id === coaMatch.sourceEntityId)) {
          custIdSet.add(coaMatch.sourceEntityId);
        }
      }

      // Match by supplier name
      const matchedSup = (allSuppliers || []).find(s => {
        const sName = (s.name || "").trim().toLowerCase();
        return sName && (sName === accName || accName.includes(sName) || sName.includes(accName));
      });
      if (matchedSup) supIdSet.add(matchedSup.id);

      // Match by customer name
      const matchedCust = (allCustomers || []).find(c => {
        const cName = (c.name || "").trim().toLowerCase();
        return cName && (cName === accName || accName.includes(cName) || cName.includes(accName));
      });
      if (matchedCust) custIdSet.add(matchedCust.id);
    });

    for (const sId of supIdSet) {
      await recalculateSupplierBalance(sId).catch(() => {});
    }
    for (const cId of custIdSet) {
      await recalculateCustomerBalance(cId).catch(() => {});
    }
  } catch(e) {
    console.warn("[JournalEntries] Error auto-syncing balances for journal lines:", e);
  }
}

// ──────────────────────────────────────────
// Post Draft Entry
// ──────────────────────────────────────────
window.postEntry = async (id) => {
  if (!await window.showConfirm?.("ترحيل هذا القيد؟ لن يمكن تعديله بعد الترحيل.", "ترحيل القيد")) return;
  try {
    const { updateDoc, getDoc, doc: fsDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const snap = await getDoc(fsDoc(db, `companies/${COMPANY_ID}/journalEntries`, id));
    await updateDoc(fsDoc(db, `companies/${COMPANY_ID}/journalEntries`, id), { status: "posted" });
    if (snap.exists()) {
      syncBalancesForJournalLines(snap.data().lines || []).catch(() => {});
    }
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

    syncBalancesForJournalLines(reversedLines).catch(() => {});

    window.showToast?.(`تم إنشاء القيد العكسي ${revNumber}`, "success");
    await loadJournalEntries();
  } catch(err) {
    console.error(err);
    window.showToast?.(err.message, "error");
  }
};

// ──────────────────────────────────────────
// Duplicate / Clone Journal Entry (نسخ وتكرار القيد)
// ──────────────────────────────────────────
window.duplicateEntry = async (id) => {
  if (!id) return;
  try {
    let je = _allEntries.find(x => x.id === id);
    if (!je) {
      const { getDoc, doc: fsDoc } = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
      const snap = await getDoc(fsDoc(db, `companies/${COMPANY_ID}/journalEntries`, id));
      if (snap.exists()) je = { id: snap.id, ...snap.data() };
    }
    if (!je) {
      window.showToast?.("تعذر العثور على القيد المطلوب نسخه", "error");
      return;
    }

    jLines = [];
    _acSearch = {};
    document.getElementById("je-form-error")?.classList.add("hidden");
    
    await loadCostCentersDropdown();
    loadCustomJETemplatesDropdown();

    const ccSel = document.getElementById("je-cost-center");

    // Create mode for duplicate
    document.getElementById("je-edit-id").value = "";
    document.getElementById("je-desc").value    = je.description || "";
    document.getElementById("je-ref").value     = je.reference ? `${je.reference} (مكرر)` : `مكرر من ${je.entryNumber || ''}`;
    document.getElementById("je-date").value    = todayString();
    if (ccSel) ccSel.value                      = je.costCenterId || "";

    const nextNum = await getNextEntryNumber();
    _nextNum = nextNum;
    document.getElementById("je-modal-title").textContent   = `نسخ وتكرار قيد: ${je.entryNumber || ''}`;
    document.getElementById("je-entry-num-label").textContent = `رقم القيد الجديد: ${nextNum}`;

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
    } else {
      addJELine(); addJELine();
    }

    renderJELines();
    updateJETotals();
    openModal("journal-modal");
    window.showToast?.(`تم نسخ سطور القيد ${je.entryNumber || ''} بنجاح. يمكنك تعديل المبالغ والتاريخ وترحيله فوراً`, "info");
  } catch(err) {
    console.error("Duplicate Entry error:", err);
    window.showToast?.("حدث خطأ أثناء نسخ القيد: " + err.message, "error");
  }
};

// ──────────────────────────────────────────
// Predefined Accrual & Recurring Templates (قوالب الاستحقاق)
// ──────────────────────────────────────────
window.applyJETemplate = (type) => {
  if (!accounts || !accounts.length) return;
  jLines = [];
  _acSearch = {};

  const findAcc = (codePrefix, nameKeyword) => {
    return accounts.find(a => (a.code && a.code.startsWith(codePrefix)) || (a.name && a.name.includes(nameKeyword))) ||
           accounts.find(a => a.name && a.name.includes(nameKeyword)) || null;
  };

  const currentMonthName = new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });

  if (type === 'depreciation') {
    document.getElementById("je-desc").value = `قيد إهلاك الأصول الثابتة لشهر ${currentMonthName}`;
    document.getElementById("je-ref").value = `إهلاك دوري - ${todayString().slice(0,7)}`;
    
    // Find Depreciation Expenses (5-6) & Accumulated Depreciation (1-2)
    const depVehicles = findAcc("5-6-1", "إهلاك السيارات") || findAcc("5-6", "إهلاك");
    const accVehicles = findAcc("1-2-1-2", "مجمع إهلاك السيارات") || findAcc("1-2-1", "مجمع إهلاك");
    
    const depEquip = findAcc("5-6-2", "إهلاك المعدات");
    const accEquip = findAcc("1-2-2-2", "مجمع إهلاك المعدات");

    if (depVehicles && accVehicles) {
      jLines.push({
        accountId: depVehicles.id, accountCode: depVehicles.code, accountName: depVehicles.name,
        accountType: depVehicles.accountType || depVehicles.type || 'expense',
        note: "مصروف إهلاك السيارات والمركبات", debit: 0, credit: 0
      });
      jLines.push({
        accountId: accVehicles.id, accountCode: accVehicles.code, accountName: accVehicles.name,
        accountType: accVehicles.accountType || accVehicles.type || 'asset',
        note: "مجمع إهلاك السيارات والمركبات", debit: 0, credit: 0
      });
    }
    if (depEquip && accEquip) {
      jLines.push({
        accountId: depEquip.id, accountCode: depEquip.code, accountName: depEquip.name,
        accountType: depEquip.accountType || depEquip.type || 'expense',
        note: "مصروف إهلاك المعدات والآلات", debit: 0, credit: 0
      });
      jLines.push({
        accountId: accEquip.id, accountCode: accEquip.code, accountName: accEquip.name,
        accountType: accEquip.accountType || accEquip.type || 'asset',
        note: "مجمع إهلاك المعدات والآلات", debit: 0, credit: 0
      });
    }
    if (!jLines.length) { addJELine(); addJELine(); }

    window.showToast?.("تم تجهيز نموذج قيد إهلاك الأصول. أدخل مبالغ الإهلاك الدورية", "info");
  } 
  else if (type === 'rent') {
    document.getElementById("je-desc").value = `قيد استحقاق مصروف الإيجار لشهر ${currentMonthName}`;
    document.getElementById("je-ref").value = `استحقاق إيجار - ${todayString().slice(0,7)}`;

    const rentExp = findAcc("5-4-1-1", "ايجار المستودع") || findAcc("5-4-1", "الإيجار");
    const rentAccruedOrPrepaid = findAcc("1-1-3-1", "ايجار مدفوع مقدما") || findAcc("2-1-4-1", "ايجار سكن مستحق") || findAcc("2-1-4", "مستحقة");

    if (rentExp) {
      jLines.push({
        accountId: rentExp.id, accountCode: rentExp.code, accountName: rentExp.name,
        accountType: rentExp.accountType || rentExp.type || 'expense',
        note: "إثبات استحقاق مصروف الإيجار الشهري", debit: 0, credit: 0
      });
    }
    if (rentAccruedOrPrepaid) {
      jLines.push({
        accountId: rentAccruedOrPrepaid.id, accountCode: rentAccruedOrPrepaid.code, accountName: rentAccruedOrPrepaid.name,
        accountType: rentAccruedOrPrepaid.accountType || rentAccruedOrPrepaid.type || 'liability',
        note: "تسوية الإيجار (المستحق / المدفوع مقدماً)", debit: 0, credit: 0
      });
    }
    if (jLines.length < 2) { addJELine(); }
    window.showToast?.("تم تجهيز نموذج استحقاق الإيجار. حدد المبلغ والمراكز", "info");
  }
  else if (type === 'payroll') {
    document.getElementById("je-desc").value = `قيد استحقاق مسير رواتب الموظفين والمناديب لشهر ${currentMonthName}`;
    document.getElementById("je-ref").value = `مسير رواتب - ${todayString().slice(0,7)}`;

    const salExp = findAcc("5-2-6", "رواتب واجور") || findAcc("5-2-1", "رواتب") || findAcc("5-2", "الرواتب");
    const salPayable = findAcc("2-1-5", "مستحقات الموظفين") || findAcc("2-1-4", "مستحقة");

    if (salExp) {
      jLines.push({
        accountId: salExp.id, accountCode: salExp.code, accountName: salExp.name,
        accountType: salExp.accountType || salExp.type || 'expense',
        note: "إجمالي استحقاق الرواتب والأجور والبدلات", debit: 0, credit: 0
      });
    }
    if (salPayable) {
      jLines.push({
        accountId: salPayable.id, accountCode: salPayable.code, accountName: salPayable.name,
        accountType: salPayable.accountType || salPayable.type || 'liability',
        note: "مستحقات الرواتب للموظفين والمناديب", debit: 0, credit: 0
      });
    }
    if (jLines.length < 2) { addJELine(); }
    window.showToast?.("تم تجهيز نموذج استحقاق الرواتب", "info");
  }
  else if (type === 'prepaid') {
    document.getElementById("je-desc").value = `قيد إطفاء مصروفات وتأمينات مدفوعة مقدماً لشهر ${currentMonthName}`;
    document.getElementById("je-ref").value = `إطفاء دوري - ${todayString().slice(0,7)}`;

    const prepaidAsset = findAcc("1-1-5-1", "مصروفات مدفوعة مقدماً") || findAcc("1-1-3", "مدفوع مقدما");
    const genExp = findAcc("5-4", "تشغيلية") || findAcc("5-1", "مصروف");

    if (genExp) {
      jLines.push({
        accountId: genExp.id, accountCode: genExp.code, accountName: genExp.name,
        accountType: genExp.accountType || genExp.type || 'expense',
        note: "مصروف الفترة المحمل من المدفوع مقدماً", debit: 0, credit: 0
      });
    }
    if (prepaidAsset) {
      jLines.push({
        accountId: prepaidAsset.id, accountCode: prepaidAsset.code, accountName: prepaidAsset.name,
        accountType: prepaidAsset.accountType || prepaidAsset.type || 'asset',
        note: "إطفاء / تخفيض رصيد المصروفات المدفوعة مقدماً", debit: 0, credit: 0
      });
    }
    if (jLines.length < 2) { addJELine(); }
    window.showToast?.("تم تجهيز نموذج إطفاء المصروفات المدفوعة مقدماً", "info");
  }

  renderJELines();
  updateJETotals();
};

// ──────────────────────────────────────────
// Custom User Templates (حفظ واستدعاء القوالب المخصصة)
// ──────────────────────────────────────────
window.saveCurrentAsCustomTemplate = () => {
  syncDOMToLines();
  const validLines = jLines.filter(l => l.accountId);
  if (!validLines.length) {
    window.showToast?.("يرجى اختيار حسابات في سطور القيد أولاً لحفظها كنموذج", "warning");
    return;
  }
  const defaultName = document.getElementById("je-desc")?.value.trim() || "قيد دوري مخصص";
  const name = prompt("أدخل اسماً لهذا النموذج المحاسبي (مثال: قيد إيجار ينبع الشهري):", defaultName);
  if (!name || !name.trim()) return;

  try {
    const saved = JSON.parse(localStorage.getItem("idham_je_custom_templates") || "[]");
    const template = {
      id: "tpl_" + Date.now(),
      name: name.trim(),
      description: document.getElementById("je-desc")?.value.trim() || "",
      costCenterId: document.getElementById("je-cost-center")?.value || null,
      lines: validLines.map(l => ({
        accountId: l.accountId,
        accountCode: l.accountCode,
        accountName: l.accountName,
        accountType: l.accountType,
        note: l.note,
        debit: l.debit || 0,
        credit: l.credit || 0
      }))
    };
    saved.push(template);
    localStorage.setItem("idham_je_custom_templates", JSON.stringify(saved));
    loadCustomJETemplatesDropdown();
    window.showToast?.(`تم حفظ النموذج "${name}" بنجاح`, "success");
  } catch(e) {
    console.error(e);
  }
};

window.loadCustomJETemplatesDropdown = () => {
  const sel = document.getElementById("je-custom-templates");
  if (!sel) return;
  try {
    const saved = JSON.parse(localStorage.getItem("idham_je_custom_templates") || "[]");
    if (!saved.length) {
      sel.style.display = "none";
      return;
    }
    sel.style.display = "inline-block";
    sel.innerHTML = '<option value="">📂 قوالبي المحفوظة (' + saved.length + ')</option>' +
      saved.map(t => `<option value="${t.id}">${t.name}</option>`).join("");
  } catch(e) {
    sel.style.display = "none";
  }
};

window.applyCustomJETemplate = (templateId) => {
  if (!templateId) return;
  try {
    const saved = JSON.parse(localStorage.getItem("idham_je_custom_templates") || "[]");
    const tpl = saved.find(t => t.id === templateId);
    if (!tpl) return;

    if (tpl.description) document.getElementById("je-desc").value = tpl.description;
    if (tpl.costCenterId) {
      const ccSel = document.getElementById("je-cost-center");
      if (ccSel) ccSel.value = tpl.costCenterId;
    }

    jLines = (tpl.lines || []).map(l => ({
      accountId: l.accountId,
      accountCode: l.accountCode,
      accountName: l.accountName,
      accountType: l.accountType,
      note: l.note,
      debit: l.debit || 0,
      credit: l.credit || 0
    }));

    renderJELines();
    updateJETotals();
    window.showToast?.(`تم استدعاء نموذج "${tpl.name}"`, "info");
    document.getElementById("je-custom-templates").value = "";
  } catch(e) {
    console.error(e);
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
        <button class="btn btn-primary" onclick="closeModal('je-detail-modal'); duplicateEntry('${id}')">
          <i class="fas fa-copy"></i> نسخ وتكرار القيد
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
    const rawEntries = await getAll(COLS.journalEntries());
    const entries = rawEntries
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
  let company = {
    name: "شركة نظم الإمداد الحديثة",
    nameEn: "Modern Supply Systems Co.",
    crNumber: "4700123180",
    vatNumber: "312448150500003",
    phone: "0549141648",
    email: "Nuzmalamdad@gmail.com",
    address: "7480 — الشارع: عامر الشعبي — ينبع — 13315",
    logoUrl: ""
  };
  try {
    const cached = localStorage.getItem("idham_company");
    if (cached) Object.assign(company, JSON.parse(cached));
  } catch(e) {}

  try {
    const compSnap = await getDoc(fsDoc(db, `companies/${COMPANY_ID}/settings`, "company"));
    if (compSnap.exists()) {
      const cd = compSnap.data();
      company.name = cd.name || cd.companyName || company.name;
      company.nameEn = cd.nameEn || cd.legalName || company.nameEn;
      company.crNumber = cd.crNumber || cd.cr || company.crNumber;
      company.vatNumber = cd.vatNumber || cd.vat || company.vatNumber;
      company.phone = cd.phone || company.phone;
      company.email = cd.email || company.email;
      company.address = cd.address ? (cd.city ? `${cd.address} — ${cd.city}` : cd.address) : company.address;
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

  const coName    = company.name || "شركة نظم الإمداد الحديثة";
  const coNameEn  = company.nameEn || "Modern Supply Systems Co.";
  const coAddress = company.address || "7480 — الشارع: عامر الشعبي — ينبع — 13315";
  const coPhone   = company.phone || "0549141648";
  const coEmail   = company.email || "Nuzmalamdad@gmail.com";
  const coVat     = company.vatNumber || "312448150500003";
  const coCr      = company.crNumber || "4700123180";
  const coLogo    = company.logoUrl || "";

  const totalDr = (je.lines || []).reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalCr = (je.lines || []).reduce((sum, l) => sum + (l.credit || 0), 0);
  const isPost  = (je.status || "posted") === "posted";
  const isBal   = Math.abs(totalDr - totalCr) < 0.01;

  // ─── Extract Tax & Supplier Information ───
  const linesWithTax = (je.lines || []).filter(l => l.serviceProvider || l.taxNumber || l.invoiceRef);
  const spName = linesWithTax.reduce((n, l) => n || (l.serviceProvider || "").trim(), "")
                 || (je.supplierName || je.vendorName || je.entityName || "").trim();
  const spTax  = linesWithTax.reduce((n, l) => n || (l.taxNumber || "").trim(), "")
                 || (je.taxNumber || je.supplierVatNumber || "").trim();
  const spRef  = linesWithTax.reduce((n, l) => n || (l.invoiceRef || "").trim(), "")
                 || (je.taxInvoiceNumber || je.reference || "").trim();

  // Detect VAT input line
  const vatInputLine = (je.lines || []).find(l =>
    (l.debit || 0) > 0 && (
      l.accountCode === "2-1-1-2" ||
      l.accountCode === "2-1-3-2" ||
      l.accountCode === "2-2-1-2" ||
      l.accountCode === "2-2-2" ||
      (l.accountName && (l.accountName.includes("المدخلات") || l.accountName.includes("القيمة المضافة")))
    )
  );

  const vatAmt = vatInputLine ? (vatInputLine.debit || 0) : 0;
  const baseLine = (je.lines || []).find(l =>
    l !== vatInputLine &&
    (l.debit || 0) > 0
  );
  const baseAmt = baseLine ? (baseLine.debit || 0) : (vatAmt > 0 ? Math.round((vatAmt / 0.15) * 100) / 100 : (totalDr - vatAmt));
  const totalWithVat = totalDr;
  const isTaxEntry = !!(spName || spTax || spRef || vatInputLine);

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>${isTaxEntry ? "سند قيد ضريبي وفاتورة معتمدة" : "سند قيد محاسبي"} — ${je.entryNumber || je.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', Arial, sans-serif;
      direction: rtl;
      color: #0f172a;
      background: #fff;
      padding: 24px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @media print {
      body { padding: 0; }
      @page { size: A4 portrait; margin: 8mm; }
      .no-print { display: none !important; }
    }
    .v-container {
      max-width: 860px;
      margin: 0 auto;
      border: 1px solid #cbd5e1;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    }
    /* Header */
    .v-header {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%) !important;
      padding: 20px 26px;
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
      padding: 8px 18px;
      text-align: center;
    }
    /* Metadata Grid */
    .v-meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 12px 20px;
    }
    .v-meta-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
      text-align: center;
    }
    .v-meta-label { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
    .v-meta-val { font-size: 13px; font-weight: 800; color: #0f172a; }

    /* Tax / Supplier Box */
    .v-tax-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-right: 4px solid #16a34a;
      border-radius: 8px;
      margin: 14px 20px;
      padding: 12px 16px;
    }
    .v-tax-grid {
      display: grid;
      grid-template-columns: 1.5fr 1.2fr 1.2fr 1fr;
      gap: 12px;
    }
    .v-tax-item-label { font-size: 10.5px; color: #166534; font-weight: 700; margin-bottom: 2px; }
    .v-tax-item-val { font-size: 12.5px; font-weight: 800; color: #0f172a; }

    /* Tax Breakdown Strip */
    .v-tax-summary-strip {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin: 0 20px 14px 20px;
    }
    .v-tax-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      text-align: center;
    }
    .v-tax-card.base { border-top: 3px solid #6366f1; }
    .v-tax-card.vat { border-top: 3px solid #16a34a; background: #f0fdf4; }
    .v-tax-card.total { border-top: 3px solid #1e40af; background: #eff6ff; }
    .v-tax-card .lbl { font-size: 10px; color: #64748b; font-weight: 700; margin-bottom: 2px; }
    .v-tax-card .val { font-size: 14px; font-weight: 900; font-family: monospace; }
    .v-tax-card.vat .val { color: #15803d; }
    .v-tax-card.total .val { color: #1e3a8a; }

    /* Description Bar */
    .v-desc-bar {
      padding: 10px 20px;
      background: #eff6ff;
      border-bottom: 1px solid #dbeafe;
      font-size: 12px;
      color: #1e40af;
      line-height: 1.5;
    }

    /* Lines Table */
    .v-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
    }
    .v-table th {
      background: #1e3a8a !important;
      color: #fff !important;
      font-weight: 800;
      padding: 8px 10px;
      border: 1px solid #1e3a8a;
      text-align: right;
    }
    .v-table td {
      padding: 8px 10px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
      vertical-align: middle;
    }
    .v-table tr:nth-child(even) td { background: #fafafa; }
    .v-totals-row td {
      background: #f8fafc !important;
      font-weight: 900;
      font-size: 12.5px;
      border-top: 2px solid #94a3b8;
      border-bottom: 2px solid #94a3b8;
    }
    /* Signatures */
    .v-sigs {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      padding: 20px;
      background: #fff;
      border-top: 1px solid #e2e8f0;
      page-break-inside: avoid;
    }
    .v-sig-box {
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    .v-sig-title { font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 30px; }
    .v-sig-line { border-top: 1px solid #94a3b8; width: 80%; margin: 0 auto; padding-top: 4px; font-size: 10.5px; color: #334155; font-weight: 700; }
    .v-footer {
      background: #f8fafc;
      padding: 8px 20px;
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
            <div style="font-size:19px;font-weight:900;color:#fff !important;line-height:1.2;">${coName}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.9) !important;margin-top:2px;">${coNameEn} | 📍 ${coAddress}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.95) !important;margin-top:4px;display:flex;flex-wrap:wrap;gap:14px;">
              ${coPhone ? `<span>📞 الهاتف: <strong>${coPhone}</strong></span>` : ""}
              ${coVat ? `<span>🧾 الرقم الضريبي: <strong>${coVat}</strong></span>` : ""}
              ${coCr ? `<span>📋 سجل تجاري: <strong>${coCr}</strong></span>` : ""}
            </div>
          </div>
        </div>
        <div class="v-badge-box">
          <div style="font-size:18px;font-weight:900;color:#fff !important;">
            ${isTaxEntry ? "سند قيد ضريبي معتمد" : "سند قيد محاسبي"}
          </div>
          <div style="font-size:10.5px;color:rgba(255,255,255,0.9) !important;letter-spacing:0.5px;">
            ${isTaxEntry ? "TAX JOURNAL VOUCHER (ZATCA)" : "JOURNAL VOUCHER"}
          </div>
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
        <div class="v-meta-val">${isTaxEntry ? "قيد ضريبي / خدمات" : (typeMap[je.sourceType] || je.sourceType || "يدوي")}</div>
      </div>
      <div class="v-meta-card">
        <div class="v-meta-label">حالة الترحيل</div>
        <div class="v-meta-val" style="color:${isPost ? '#059669' : '#d97706'}">${isPost ? "مرحّل نظامياً ✓" : "مسودة"}</div>
      </div>
    </div>

    <!-- Prominent Supplier & Tax Details Card -->
    ${isTaxEntry ? `
      <div class="v-tax-box">
        <div style="font-size:11px;font-weight:800;color:#166534;margin-bottom:8px;display:flex;align-items:center;gap:6px;">
          <span>📋 بيانات المورد والفاتورة الضريبية المرجعية (ZATCA Tax Reference):</span>
        </div>
        <div class="v-tax-grid">
          <div>
            <div class="v-tax-item-label">🏢 اسم المورد / مقدم الخدمة</div>
            <div class="v-tax-item-val">${spName || "مورد خدمات"}</div>
          </div>
          <div>
            <div class="v-tax-item-label">🧾 الرقم الضريبي للمورد</div>
            <div class="v-tax-item-val" style="font-family:monospace;color:#1e3a8a;">${spTax || "—"}</div>
          </div>
          <div>
            <div class="v-tax-item-label">📄 رقم فاتورة المورد الضريبية</div>
            <div class="v-tax-item-val" style="font-family:monospace;color:#4338ca;">${spRef || je.reference || "—"}</div>
          </div>
          <div>
            <div class="v-tax-item-label">📅 تاريخ الفاتورة</div>
            <div class="v-tax-item-val">${je.date || "—"}</div>
          </div>
        </div>
      </div>

      <!-- ZATCA Tax Breakdown Summary Strip -->
      <div class="v-tax-summary-strip">
        <div class="v-tax-card base">
          <div class="lbl">المبلغ الخاضع للضريبة (قبل الضريبة)</div>
          <div class="val">${formatCurrency(baseAmt)} ر.س</div>
        </div>
        <div class="v-tax-card vat">
          <div class="lbl">ضريبة القيمة المضافة 15% (مدخلات مستردة)</div>
          <div class="val">${formatCurrency(vatAmt > 0 ? vatAmt : Math.round(baseAmt * 0.15 * 100)/100)} ر.س</div>
        </div>
        <div class="v-tax-card total">
          <div class="lbl">الإجمالي شامل الضريبة</div>
          <div class="val">${formatCurrency(totalWithVat)} ر.س</div>
        </div>
      </div>
    ` : ""}

    <!-- General Description -->
    <div class="v-desc-bar">
      <strong>البيان العام للقيد:</strong> ${je.description || "بدون بيان"}
      ${je.reference ? `<span style="margin-right:20px;color:#475569;">| مرجع المستند: <strong>${je.reference}</strong></span>` : ""}
    </div>

    <!-- Lines Table -->
    <table class="v-table">
      <thead>
        <tr>
          <th style="width:34px;text-align:center;">#</th>
          <th style="width:105px;">كود الحساب</th>
          <th style="min-width:180px;">اسم الحساب المحاسبي</th>
          <th>البيان والتفاصيل المحاسبية</th>
          <th style="width:120px;text-align:right;">مدين (ر.س)</th>
          <th style="width:120px;text-align:right;">دائن (ر.س)</th>
        </tr>
      </thead>
      <tbody>
        ${(je.lines || []).map((l, idx) => {
          const isLineVat = l.accountCode === "2-1-1-2" || l.accountCode === "2-1-3-2" || l.accountCode === "2-2-1-2" || l.accountCode === "2-2-2" || (l.accountName && l.accountName.includes("المدخلات"));
          return `
          <tr>
            <td style="text-align:center;color:#64748b;font-size:11px;">${idx + 1}</td>
            <td style="font-family:monospace;font-weight:700;color:#1d4ed8;">${l.accountCode || "—"}</td>
            <td style="font-weight:700;">
              ${l.accountName || "—"}
              ${isLineVat ? `<span style="background:#dcfce7;color:#15803d;font-size:9.5px;padding:2px 6px;border-radius:4px;font-weight:800;margin-right:6px;">🏷️ ضريبة مدخلات 15%</span>` : ""}
            </td>
            <td>
              <div style="font-weight:600;color:#0f172a;">${l.note || je.description || "—"}</div>
              ${(l.serviceProvider || l.taxNumber || l.invoiceRef) ? `
                <div style="font-size:10px;color:#334155;margin-top:3px;background:#f1f5f9;padding:2px 6px;border-radius:4px;display:inline-block;border:1px dashed #cbd5e1;">
                  ${l.serviceProvider ? `مورد: <strong>${l.serviceProvider}</strong> ` : ""}
                  ${l.taxNumber ? `| ضريبي: <strong>${l.taxNumber}</strong> ` : ""}
                  ${l.invoiceRef ? `| فاتورة: <strong>${l.invoiceRef}</strong>` : ""}
                </div>
              ` : ""}
            </td>
            <td style="text-align:right;font-family:monospace;font-weight:${l.debit ? '800' : '400'};color:${l.debit ? '#dc2626' : '#94a3b8'};">
              ${l.debit ? formatCurrency(l.debit) + " ر.س" : "—"}
            </td>
            <td style="text-align:right;font-family:monospace;font-weight:${l.credit ? '800' : '400'};color:${l.credit ? '#16a34a' : '#94a3b8'};">
              ${l.credit ? formatCurrency(l.credit) + " ر.س" : "—"}
            </td>
          </tr>
        `;}).join("")}
        <tr class="v-totals-row">
          <td colspan="4" style="text-align:right;padding:10px;">
            الإجمالي الكلي للقيد المحاسبي
            <span style="font-size:11px;font-weight:700;color:${isBal ? '#059669' : '#dc2626'};margin-right:12px;">
              (${isBal ? '✓ القيد متوازن ومطابق نظامياً' : '⚠️ غير متوازن'})
            </span>
          </td>
          <td style="text-align:right;color:#dc2626;font-family:monospace;font-weight:900;">${formatCurrency(totalDr)} ر.س</td>
          <td style="text-align:right;color:#16a34a;font-family:monospace;font-weight:900;">${formatCurrency(totalCr)} ر.س</td>
        </tr>
      </tbody>
    </table>

    <!-- Signatures Block -->
    <div class="v-sigs">
      <div class="v-sig-box">
        <div class="v-sig-title">إعداد المحاسب المسؤول</div>
        <div class="v-sig-line">${je.createdByName || "المحاسب المسؤول"}</div>
      </div>
      <div class="v-sig-box">
        <div class="v-sig-title">المراجعة والتدقيق المالي</div>
        <div class="v-sig-line">إدارة الحسابات</div>
      </div>
      <div class="v-sig-box">
        <div class="v-sig-title">الاعتماد والختم الرسمي</div>
        <div class="v-sig-line">${coName}</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="v-footer">
      <span>طُبع بواسطة: <strong>نظام إدهام للمواد الغذائية ERP — ${coName}</strong></span>
      <span>تاريخ الطباعة: <strong>${new Date().toLocaleString("ar-SA")}</strong></span>
    </div>

  </div>
</body>
</html>
  `;
}

function _buildJournalLogReportHTML(entries, company, filters) {
  const coName    = company.name || "شركة نظم الإمداد الحديثة";
  const coNameEn  = company.nameEn || "Modern Supply Systems Co.";
  const coAddress = company.address || "7480 — الشارع: عامر الشعبي — ينبع — 13315";
  const coPhone   = company.phone || "0549141648";
  const coVat     = company.vatNumber || "312448150500003";
  const coCr      = company.crNumber || "4700123180";
  const coLogo    = company.logoUrl || "";

  const typeLabels = {
    manual: "يدوي", salesInvoice: "مبيعات", purchaseInvoice: "مشتريات",
    salesReturn: "مردود بيع", purchaseReturn: "مردود شراء", reversing: "عكسي", pos: "POS"
  };

  const totalDr = entries.reduce((s, e) => s + Math.max(parseFloat(e.totalDebit || 0) || 0, (e.lines || []).reduce((a, l) => a + (parseFloat(l.debit || 0) || 0), 0)), 0);
  const totalCr = entries.reduce((s, e) => s + Math.max(parseFloat(e.totalCredit || 0) || 0, (e.lines || []).reduce((a, l) => a + (parseFloat(l.credit || 0) || 0), 0)), 0);

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
          const dr = Math.max(parseFloat(e.totalDebit || 0) || 0, (e.lines || []).reduce((a, l) => a + (parseFloat(l.debit || 0) || 0), 0));
          const cr = Math.max(parseFloat(e.totalCredit || 0) || 0, (e.lines || []).reduce((a, l) => a + (parseFloat(l.credit || 0) || 0), 0));
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
