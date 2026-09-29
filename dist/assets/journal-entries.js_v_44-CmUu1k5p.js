const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/balance-sync-Cpo3qtSB.js","assets/index-CnctmNGr.js","assets/index-Dq7oGj9k.css"])))=>i.map(i=>d[i]);
import{g as H,a as T,s as Y,t as E,h as te,f as v,i as ae,Q as oe,e as K,_ as L,d as k,C as $}from"./index-CnctmNGr.js";import{orderBy as M,query as W,limit as U,getDocs as Z,getDoc as _}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let m=[],B=[],N=null;async function ve(e,t){window.switchTab=ie,e.innerHTML=re(),de(),B=await H(T.chartOfAccounts(),[M("code")]),N=await R(),switchTab("log"),setTimeout(()=>{const a=document.getElementById("je-search");if(a){a.oninput=null;const o=window.debounce?window.debounce(r=>filterJETable(r.target.value),300):r=>filterJETable(r.target.value);a.addEventListener("input",o)}},100)}function re(){return`
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
        <input type="date" id="je-from" value="${Y()}" onchange="loadJournalEntries()" />
      </div>
      <div class="je-filter-group">
        <label>إلى</label>
        <input type="date" id="je-to" value="${E()}" onchange="loadJournalEntries()" />
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
        <input type="date" id="ledger-from" value="${Y()}" />
      </div>
      <div class="je-filter-group">
        <label>إلى</label>
        <input type="date" id="ledger-to" value="${E()}" />
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
          <input type="date" id="je-date" class="input" value="${E()}" />
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
  `}function ie(e){["log","ledger"].forEach(t=>{document.getElementById(`tab-${t}`)?.classList.toggle("active",t===e),document.getElementById(`panel-${t}`)?.classList.toggle("hidden",t!==e)}),e==="log"&&loadJournalEntries(),e==="ledger"&&se()}async function R(){try{const e=W(T.journalEntries(),M("entryNumber","desc"),U(1)),t=await Z(e);if(!t.empty){const a=t.docs[0].data().entryNumber||"",o=parseInt(a.replace(/\D/g,""))||0;return`JE-${new Date().getFullYear()}-${String(o+1).padStart(4,"0")}`}}catch{}return`JE-${new Date().getFullYear()}-0001`}let z=[];window.loadJournalEntries=async(e=!1)=>{const t=document.getElementById("je-tbody");if(t){t.innerHTML=`<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2)">
    <i class="fas fa-spinner fa-spin"></i> جارٍ التحميل...
  </td></tr>`;try{const a=document.getElementById("je-from")?.value,o=document.getElementById("je-to")?.value,r=document.getElementById("je-type-filter")?.value,i=document.getElementById("je-status-filter")?.value;e===!0&&te();let d=await H(T.journalEntries(),[M("createdAt","desc"),U(500)]);d.sort((n,b)=>(b.date||"").localeCompare(n.date||"")),a&&(d=d.filter(n=>(n.date||"")>=a)),o&&(d=d.filter(n=>(n.date||"")<=o)),r&&(d=d.filter(n=>n.sourceType===r)),i&&(d=d.filter(n=>(n.status||"posted")===i)),z=d,O(d);const g=d.reduce((n,b)=>{const f=parseFloat(b.totalDebit||0)||0,x=(b.lines||[]).reduce((s,h)=>s+(parseFloat(h.debit||0)||0),0);return n+Math.max(f,x)},0),u=d.reduce((n,b)=>{const f=parseFloat(b.totalCredit||0)||0,x=(b.lines||[]).reduce((s,h)=>s+(parseFloat(h.credit||0)||0),0);return n+Math.max(f,x)},0),l=d.filter(n=>n.status==="posted").length,p=Math.abs(g-u)<.01;document.getElementById("kpi-total-dr").textContent=v(g),document.getElementById("kpi-total-cr").textContent=v(u),document.getElementById("kpi-balance").textContent=p?"✓ متوازن":v(Math.abs(g-u)),document.getElementById("kpi-count").textContent=d.length,document.getElementById("kpi-posted").textContent=l}catch(a){t.innerHTML=`<tr><td colspan="9"><div class="alert bad" style="margin:8px">${a.message}</div></td></tr>`}}};function O(e){const t=document.getElementById("je-tbody");if(!t)return;if(!e.length){t.innerHTML='<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-2)">لا توجد قيود</td></tr>';return}const a={manual:"يدوي",salesInvoice:"مبيعات",purchaseInvoice:"مشتريات",salesReturn:"مردود بيع",purchaseReturn:"مردود شراء",reversing:"عكسي",pos:"POS",salesCOGS:"تكلفة البضاعة",cogs:"تكلفة مبيعات",receipt:"سند قبض",stockTransfer:"تحويل مخزون",physical_count:"جرد"},o={manual:"manual",salesInvoice:"salesInvoice",purchaseInvoice:"purchaseInvoice",salesReturn:"salesReturn",purchaseReturn:"purchaseReturn",reversing:"reversing",pos:"pos",stockTransfer:"stockTransfer",salesCOGS:"salesCOGS",cogs:"salesCOGS",receipt:"receipt",physical_count:"stockTransfer"};t.innerHTML=e.map(r=>{const i=r.status||"posted",d=i==="posted",g=r.isReversed,u=r.sourceType||"manual",l=o[u]||"manual",p=Math.max(parseFloat(r.totalDebit||0)||0,(r.lines||[]).reduce((b,f)=>b+(parseFloat(f.debit||0)||0),0)),n=Math.max(parseFloat(r.totalCredit||0)||0,(r.lines||[]).reduce((b,f)=>b+(parseFloat(f.credit||0)||0),0));return`<tr class="status-${i} je-row-${l}" onclick="viewJEEntry('${r.id}')">
      <td class="mono" style="font-size:11px;color:var(--text-2);white-space:nowrap">${r.date||""}</td>
      <td class="mono" style="color:var(--brand);font-weight:900;font-size:12px;white-space:nowrap">${r.entryNumber&&r.entryNumber!=="undefined"?r.entryNumber:r.code||"JE-"+r.id.slice(-6).toUpperCase()}</td>
      <td style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-1);font-size:12px" title="${(r.description||"").replace(/"/g,"&quot;")}">${r.description||"—"}</td>
      <td><span class="badge-type btype-${l}">${a[u]||u}</span></td>
      <td class="mono" style="text-align:right;color:#a5b4fc;font-weight:700;font-size:13px">${v(p)}</td>
      <td class="mono" style="text-align:right;color:#6ee7b7;font-weight:700;font-size:13px">${v(n)}</td>
      <td style="white-space:nowrap">
        ${g?'<span class="badge-reversed">معكوس</span>':d?'<span class="badge-posted">مرحّل</span>':'<span class="badge-draft">مسودة</span>'}
      </td>
      <td style="font-size:11px;color:var(--text-2)">${r.createdByName||"—"}</td>
      <td onclick="event.stopPropagation()" style="white-space:nowrap">
        <div style="display:flex;gap:5px;justify-content:flex-end;align-items:center">
          <button class="je-row-action info" title="طباعة سند القيد" onclick="printSingleJournalVoucher('${r.id}')">
            <i class="fas fa-print"></i>
          </button>
          ${g?"":`
            <button class="je-row-action" title="تعديل القيد" onclick="openJournalModal('${r.id}')">
              <i class="fas fa-pen"></i>
            </button>`}
          ${!d&&!g?`
            <button class="je-row-action success" title="ترحيل القيد" onclick="postEntry('${r.id}')">
              <i class="fas fa-check"></i>
            </button>`:""}
          ${d&&!g?`
            <button class="je-row-action danger" title="عكس القيد" onclick="reverseEntry('${r.id}','${(r.entryNumber||"").replace(/'/g,"\\'")}')">
              <i class="fas fa-undo"></i>
            </button>`:""}
        </div>
      </td>
    </tr>`}).join("")}window.filterJETable=e=>{const t=e.trim().toLowerCase();if(!t){O(z);return}O(z.filter(a=>(a.entryNumber||"").toLowerCase().includes(t)||(a.code||"").toLowerCase().includes(t)||(a.description||"").toLowerCase().includes(t)))};window.openJournalModal=async(e="")=>{m=[],document.getElementById("je-form-error").classList.add("hidden"),await ne();const t=document.getElementById("je-cost-center");if(e&&typeof e=="string"){const a=z.find(o=>o.id===e);if(!a)return;document.getElementById("je-edit-id").value=a.id,document.getElementById("je-desc").value=a.description||"",document.getElementById("je-ref").value=a.reference||"",document.getElementById("je-date").value=a.date||E(),t&&(t.value=a.costCenterId||""),document.getElementById("je-modal-title").textContent=`تعديل القيد: ${a.entryNumber||""}`,document.getElementById("je-entry-num-label").textContent=`رقم القيد: ${a.entryNumber||""}`,N=a.entryNumber,a.lines&&a.lines.length&&(m=a.lines.map(o=>({accountId:o.accountId||"",accountCode:o.accountCode||"",accountName:o.accountName||"",accountType:o.accountType||"",note:o.note||"",debit:parseFloat(o.debit)||0,credit:parseFloat(o.credit)||0,costCenterId:o.costCenterId||null,serviceProvider:o.serviceProvider||"",taxNumber:o.taxNumber||"",invoiceRef:o.invoiceRef||""}))),F(),A()}else{document.getElementById("je-edit-id").value="",document.getElementById("je-desc").value="",document.getElementById("je-ref").value="",document.getElementById("je-date").value=E(),t&&(t.value=""),document.getElementById("je-modal-title").textContent="قيد يدوي جديد";const a=await R();N=a,document.getElementById("je-entry-num-label").textContent=`رقم القيد: ${a}`,addJELine(),addJELine()}openModal("journal-modal")};let S=[];async function ne(){const e=document.getElementById("je-cost-center");if(e)try{S=(await H(T.costCenters()).catch(()=>[])).sort((a,o)=>(a.code||"").localeCompare(o.code||"")),e.innerHTML='<option value="">بدون مركز تكلفة</option>'+S.map(a=>`<option value="${a.id}">${a.code||""} — ${a.name}</option>`).join("")}catch{}}function J(){const e=document.getElementById("je-lines-tbody");if(!e)return;e.querySelectorAll("tr[data-line]").forEach(a=>{const o=parseInt(a.getAttribute("data-line"),10);if(isNaN(o)||!m[o])return;const r=a.querySelector(".je-note-input"),i=a.querySelector("input[placeholder*='مورد الخدمة']"),d=a.querySelector("input[placeholder*='الرقم الضريبي']"),g=a.querySelector("input[placeholder*='رقم الفاتورة']"),u=a.querySelectorAll(".je-amt-input");if(r&&(m[o].note=r.value),i&&(m[o].serviceProvider=i.value.trim()),d&&(m[o].taxNumber=d.value.trim()),g&&(m[o].invoiceRef=g.value.trim()),u.length>=2){const l=parseFloat(u[0].value)||0,p=parseFloat(u[1].value)||0;m[o].debit=l,m[o].credit=p}})}window.addJELine=()=>{J(),m.push({accountId:"",accountCode:"",accountName:"",accountType:"",note:"",debit:0,credit:0,serviceProvider:"",taxNumber:"",invoiceRef:""}),F(),A()};function F(){const e=document.getElementById("je-lines-tbody");e&&(e.innerHTML=m.map((t,a)=>`
    <tr data-line="${a}" style="border-bottom:1px solid rgba(255,255,255,.03)">
      <td style="text-align:center;color:var(--text-2);font-size:11px;width:32px">${a+1}</td>

      <!-- Account Search Cell -->
      <td style="position:relative;padding:4px 6px;">
        <div class="je-acc-search-wrap" style="width:100%">
          <i class="fas fa-search" style="font-size:9px;color:var(--text-3);flex-shrink:0"></i>
          <input type="text" class="je-acc-input" id="acc-search-${a}"
                 placeholder="اكتب كود أو اسم الحساب... [F8 للبحث]"
                 value="${t.accountCode?t.accountCode+" — "+t.accountName:""}"
                 oninput="accLineSearch(${a}, this.value)"
                 onfocus="showAccDropdown(${a})"
                 onblur="hideAccDropdown(${a})"
                 autocomplete="off" />
          <div class="je-acc-dropdown hidden" id="acc-drop-${a}"></div>
        </div>
        ${t.accountId?`<div style="font-size:9px;color:var(--text-3);margin-top:1px;padding:0 4px">${t.accountType||""}</div>`:""}
      </td>

      <!-- Note & Tax info -->
      <td style="padding:4px 6px; display:flex; flex-direction:column; gap:4px;">
        <input type="text" class="je-note-input" placeholder="البيان الفرعي..."
               value="${t.note||""}" oninput="jLines[${a}].note=this.value" />
        <div style="display:flex; gap:4px; align-items:center;">
          <input type="text" class="je-sub-input" placeholder="مورد الخدمة..."
                 style="font-size:10px; padding:2px 4px; border:1px solid var(--border-soft); border-radius:4px; background:var(--bg-1); color:var(--text-0); width:120px;"
                 value="${t.serviceProvider||""}" oninput="jLines[${a}].serviceProvider=this.value" />
          <input type="text" class="je-sub-input" placeholder="الرقم الضريبي..."
                 style="font-size:10px; padding:2px 4px; border:1px solid var(--border-soft); border-radius:4px; background:var(--bg-1); color:var(--text-0); width:120px;"
                 value="${t.taxNumber||""}" oninput="jLines[${a}].taxNumber=this.value" />
          <input type="text" class="je-sub-input" placeholder="رقم الفاتورة..."
                 style="font-size:10px; padding:2px 4px; border:1px solid var(--border-soft); border-radius:4px; background:var(--bg-1); color:var(--text-0); width:100px;"
                 value="${t.invoiceRef||""}" oninput="jLines[${a}].invoiceRef=this.value" />
        </div>
      </td>

      <!-- Debit -->
      <td style="padding:4px 6px;">
        <input type="number" class="je-amt-input ${t.debit?"has-val":""}"
               placeholder="0.00" min="0" step="0.01"
               value="${t.debit||""}"
               oninput="updateJEAmt(${a},'debit',this)"
               onfocus="if(this.value=='0')this.value=''"
               onblur="if(!this.value)jLines[${a}].debit=0;updateJETotals()" />
      </td>

      <!-- Credit -->
      <td style="padding:4px 6px;">
        <input type="number" class="je-amt-input ${t.credit?"has-val-cr":""}"
               placeholder="0.00" min="0" step="0.01"
               value="${t.credit||""}"
               oninput="updateJEAmt(${a},'credit',this)"
               onfocus="if(this.value=='0')this.value=''"
               onblur="if(!this.value)jLines[${a}].credit=0;updateJETotals()" />
      </td>

      <!-- Delete -->
      <td style="text-align:center;width:36px">
        <button onclick="removeJELine(${a})"
                style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:14px;padding:2px 4px;border-radius:4px;transition:color .15s"
                onmouseover="this.style.color='#ef4444'"
                onmouseout="this.style.color='var(--text-3)'">×</button>
      </td>
    </tr>
  `).join(""))}const P={asset:"أصول",liability:"خصوم",equity:"ملكية",revenue:"إيرادات",expense:"مصروفات"};window.accLineSearch=(e,t)=>{const a=document.getElementById(`acc-drop-${e}`);if(!a)return;const o=t.trim().toLowerCase();if(!o){a.classList.add("hidden");return}const r=B.filter(i=>i.isActive!==!1).filter(i=>(i.code||"").toLowerCase().includes(o)||(i.name||"").toLowerCase().includes(o)).slice(0,30);r.length?a.innerHTML=r.map(i=>`
      <div class="je-acc-option" onmousedown="selectAccLine(${e},'${i.id}','${i.code}','${(i.name||"").replace(/'/g,"\\'")}','${i.type||""}')">
        <span class="je-acc-code">${i.code}</span>
        <span class="je-acc-name">${i.name}</span>
        <span class="je-acc-type">${P[i.type]||i.type||""}</span>
        ${i.nodeType==="header"?'<span style="font-size:9px;color:#f59e0b;margin-right:2px">رئيسي</span>':""}
      </div>`).join(""):a.innerHTML='<div class="je-acc-option" style="color:var(--text-2)">لا توجد نتائج</div>',a.classList.remove("hidden")};window.selectAccLine=(e,t,a,o,r)=>{J(),m[e].accountId=t,m[e].accountCode=a,m[e].accountName=o,m[e].accountType=P[r]||r;const i=document.getElementById(`acc-search-${e}`),d=document.getElementById(`acc-drop-${e}`);if(i&&(i.value=`${a} — ${o}`),d&&d.classList.add("hidden"),!m[e].debit&&!m[e].credit){const g=["asset","expense"].includes(r),u=m.reduce((n,b)=>n+(b.debit||0),0),l=m.reduce((n,b)=>n+(b.credit||0),0),p=Math.abs(u-l);p>0&&(g&&u<l&&(m[e].debit=p),!g&&l<u&&(m[e].credit=p),F())}A()};window.showAccDropdown=e=>{const t=document.getElementById(`acc-search-${e}`);t?.value&&accLineSearch(e,t.value)};window.hideAccDropdown=e=>{setTimeout(()=>document.getElementById(`acc-drop-${e}`)?.classList.add("hidden"),200)};window.updateJEAmt=(e,t,a)=>{const o=parseFloat(a.value)||0;m[e][t]=o,a.className="je-amt-input "+(o>0?t==="debit"?"has-val":"has-val-cr":""),A()};window.removeJELine=e=>{J(),m.splice(e,1),F(),A()};function A(){const e=m.reduce((g,u)=>g+(u.debit||0),0),t=m.reduce((g,u)=>g+(u.credit||0),0),a=Math.abs(e-t),o=a<.01,r=g=>g.toLocaleString("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2}),i=(g,u)=>{const l=document.getElementById(g);l&&(l.textContent=u)};i("je-sum-debit",`${r(e)} ر.س`),i("je-sum-credit",`${r(t)} ر.س`),i("meter-dr",r(e)),i("meter-cr",r(t));const d=document.getElementById("meter-status");d&&(e===0&&t===0?(d.className="je-balance-status balanced",d.innerHTML='<i class="fas fa-balance-scale"></i> أدخل مبالغ القيد'):o?(d.className="je-balance-status balanced",d.innerHTML='<i class="fas fa-check-circle"></i> قيد متوازن ✓'):(d.className="je-balance-status unbalanced",d.innerHTML=`<i class="fas fa-exclamation-triangle"></i> غير متوازن — الفرق: ${r(a)} ر.س`))}window.saveJournal=async(e="posted")=>{J();const t=document.getElementById("je-form-error");t.classList.add("hidden");const a=document.getElementById("je-date").value,o=document.getElementById("je-desc").value.trim(),r=document.getElementById("je-ref").value.trim();if(!a){t.textContent="التاريخ مطلوب",t.classList.remove("hidden");return}if(!o){t.textContent="البيان مطلوب",t.classList.remove("hidden");return}const i=m.filter(n=>n.accountId&&(n.debit>0||n.credit>0));if(i.length<2){t.textContent="يجب أن يحتوي القيد على سطرين على الأقل",t.classList.remove("hidden");return}const d=i.reduce((n,b)=>n+(b.debit||0),0),g=i.reduce((n,b)=>n+(b.credit||0),0);if(Math.abs(d-g)>.01){t.textContent=`⚖️ القيد غير متوازن — المدين (${v(d)}) ≠ الدائن (${v(g)})`,t.classList.remove("hidden");return}if(i.filter(n=>!n.accountId&&(n.debit>0||n.credit>0)).length){t.textContent="يوجد سطور بمبالغ ولكن بدون حساب محدد",t.classList.remove("hidden");return}const l=document.getElementById("save-draft-btn"),p=document.getElementById("save-post-btn");l.disabled=p.disabled=!0;try{if(await ae(a)){t.textContent=`⚠️ لا يمكن حفظ القيد لأن تاريخه (${a}) يقع في فترة محاسبية مغلقة ومقفلة نهائياً.`,t.classList.remove("hidden"),l.disabled=p.disabled=!1;return}const n=document.getElementById("je-cost-center"),b=n?.value||null,f=n&&b&&S&&S.find(s=>s.id===b)?.name||null;i.forEach(s=>{s.costCenterId||(s.costCenterId=b)});const x=document.getElementById("je-edit-id").value;if(x)await oe(x,{date:a,description:o,reference:r,costCenterId:b,costCenterName:f,lines:i,status:e}),window.showToast?.(`تم تعديل و${e==="posted"?"ترحيل":"حفظ"} القيد بنجاح`,"success");else{const s=N||await R();await K({date:a,description:o,reference:r,sourceType:"manual",entryNumber:s,status:e,costCenterId:b,costCenterName:f,lines:i}),window.showToast?.(`تم ${e==="posted"?"ترحيل":"حفظ"} القيد ${s}`,"success")}e==="posted"&&V(i).catch(()=>{}),closeModal("journal-modal"),m=[],N=null,await loadJournalEntries()}catch(n){t.textContent=n.message,t.classList.remove("hidden")}finally{l.disabled=p.disabled=!1}};async function V(e=[]){if(!(!e||!e.length))try{const{recalculateSupplierBalance:t,recalculateCustomerBalance:a}=await L(async()=>{const{recalculateSupplierBalance:p,recalculateCustomerBalance:n}=await import("./balance-sync-Cpo3qtSB.js");return{recalculateSupplierBalance:p,recalculateCustomerBalance:n}},__vite__mapDeps([0,1,2])),{getAll:o,COLS:r}=await L(async()=>{const{getAll:p,COLS:n}=await import("./index-CnctmNGr.js").then(b=>b.T);return{getAll:p,COLS:n}},__vite__mapDeps([1,2])),[i,d,g]=await Promise.all([o(r.suppliers()).catch(()=>[]),o(r.customers()).catch(()=>[]),o(r.chartOfAccounts()).catch(()=>[])]),u=new Set,l=new Set;e.forEach(p=>{const n=p.accountId,b=p.accountCode,f=(p.accountName||"").trim().toLowerCase(),x=(g||[]).find(y=>y.id===n||y.code===b||y.name&&y.name.trim().toLowerCase()===f);x&&x.sourceEntityId&&(x.sourceModule==="suppliers"||(i||[]).some(y=>y.id===x.sourceEntityId)?u.add(x.sourceEntityId):(x.sourceModule==="customers"||(d||[]).some(y=>y.id===x.sourceEntityId))&&l.add(x.sourceEntityId));const s=(i||[]).find(y=>{const w=(y.name||"").trim().toLowerCase();return w&&(w===f||f.includes(w)||w.includes(f))});s&&u.add(s.id);const h=(d||[]).find(y=>{const w=(y.name||"").trim().toLowerCase();return w&&(w===f||f.includes(w)||w.includes(f))});h&&l.add(h.id)});for(const p of u)await t(p).catch(()=>{});for(const p of l)await a(p).catch(()=>{})}catch(t){console.warn("[JournalEntries] Error auto-syncing balances for journal lines:",t)}}window.postEntry=async e=>{if(await window.showConfirm?.("ترحيل هذا القيد؟ لن يمكن تعديله بعد الترحيل.","ترحيل القيد"))try{const{updateDoc:t,getDoc:a,doc:o}=await L(async()=>{const{updateDoc:i,getDoc:d,doc:g}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{updateDoc:i,getDoc:d,doc:g}},[]),r=await a(o(k,`companies/${$}/journalEntries`,e));await t(o(k,`companies/${$}/journalEntries`,e),{status:"posted"}),r.exists()&&V(r.data().lines||[]).catch(()=>{}),window.showToast?.("تم ترحيل القيد","success"),await loadJournalEntries()}catch(t){window.showToast?.(t.message,"error")}};window.reverseEntry=async(e,t)=>{if(await window.showConfirm?.(`سيُنشأ قيد عكسي لـ "${t}" — يعكس جميع المدينات والدائن. هل تريد المتابعة؟`,"قيد عكسي (Reversing Entry)"))try{const{getDoc:a,doc:o}=await L(async()=>{const{getDoc:p,doc:n}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:p,doc:n}},[]),r=await a(o(k,`companies/${$}/journalEntries`,e));if(!r.exists())throw new Error("القيد غير موجود");const i=r.data(),d=(i.lines||[]).map(p=>({...p,debit:p.credit||0,credit:p.debit||0,note:`عكس: ${p.note||p.accountName}`})),{updateDoc:g,doc:u}=await L(async()=>{const{updateDoc:p,doc:n}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{updateDoc:p,doc:n}},[]),l=await R();await K({date:E(),description:`قيد عكسي لـ ${i.entryNumber||t}`,sourceType:"reversing",entryNumber:l,status:"posted",reversedFrom:e,lines:d}),await g(u(k,`companies/${$}/journalEntries`,e),{isReversed:!0,reversedBy:l}),V(d).catch(()=>{}),window.showToast?.(`تم إنشاء القيد العكسي ${l}`,"success"),await loadJournalEntries()}catch(a){console.error(a),window.showToast?.(a.message,"error")}};window.viewJEEntry=async e=>{const t=document.getElementById("je-detail-body");t.innerHTML='<div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin"></i></div>',openModal("je-detail-modal");try{const{getDoc:a,doc:o}=await L(async()=>{const{getDoc:l,doc:p}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:l,doc:p}},[]),r=await a(o(k,`companies/${$}/journalEntries`,e));if(!r.exists())throw new Error("القيد غير موجود");const i={id:r.id,...r.data()};document.getElementById("je-detail-title").textContent=`قيد: ${i.entryNumber||e.slice(0,8)}`;const g=(i.status||"posted")==="posted";t.innerHTML=`
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;padding:0 4px">
        <div style="background:var(--bg-1);border-radius:8px;padding:10px;border:1px solid var(--border-soft)">
          <div style="font-size:10px;color:var(--text-2);margin-bottom:3px">رقم القيد</div>
          <div style="font-weight:900;color:var(--brand);font-size:15px">${i.entryNumber&&i.entryNumber!=="undefined"?i.entryNumber:"JE-"+e.slice(-6).toUpperCase()}</div>
        </div>
        <div style="background:var(--bg-1);border-radius:8px;padding:10px;border:1px solid var(--border-soft)">
          <div style="font-size:10px;color:var(--text-2);margin-bottom:3px">التاريخ</div>
          <div style="font-weight:700">${i.date||"—"}</div>
        </div>
        <div style="background:var(--bg-1);border-radius:8px;padding:10px;border:1px solid var(--border-soft)">
          <div style="font-size:10px;color:var(--text-2);margin-bottom:3px">الحالة</div>
          <div>${g?'<span class="badge-posted">مرحّل</span>':'<span class="badge-draft">مسودة</span>'}</div>
        </div>
      </div>
      <div style="background:var(--bg-1);border-radius:8px;padding:10px;border:1px solid var(--border-soft);margin-bottom:14px">
        <div style="font-size:10px;color:var(--text-2);margin-bottom:3px">البيان</div>
        <div style="font-weight:600">${i.description}</div>
        ${i.reference?`<div style="font-size:11px;color:var(--text-2);margin-top:3px">مرجع: ${i.reference}</div>`:""}
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
          ${(i.lines||[]).map(l=>`
            <tr style="border-bottom:1px solid rgba(255,255,255,.04)">
              <td style="padding:8px 10px">
                <span style="font-family:monospace;font-size:11px;color:var(--brand)">${l.accountCode}</span>
                <span style="margin-right:6px">${l.accountName}</span>
              </td>
              <td style="padding:8px 10px;color:var(--text-2);font-size:12px">
                <div>${l.note||"—"}</div>
                ${l.serviceProvider||l.taxNumber||l.invoiceRef?`
                  <div style="font-size:10px;color:var(--text-3);margin-top:4px;background:rgba(255,255,255,0.02);padding:4px 6px;border-radius:4px;border:1px dashed var(--border-soft);display:inline-block;">
                    ${l.serviceProvider?`<span>👤 مورد الخدمة: <strong>${l.serviceProvider}</strong></span>`:""}
                    ${l.taxNumber?`<span style="margin-right:10px;">🏷️ الرقم الضريبي: <strong>${l.taxNumber}</strong></span>`:""}
                    ${l.invoiceRef?`<span style="margin-right:10px;">📄 فاتورة: <strong>${l.invoiceRef}</strong></span>`:""}
                  </div>
                `:""}
              </td>
              <td style="padding:8px 10px;text-align:right;font-family:monospace;font-weight:${l.debit?"800":"400"};color:${l.debit?"#818cf8":"var(--text-3)"}">
                ${l.debit?v(l.debit):"—"}
              </td>
              <td style="padding:8px 10px;text-align:right;font-family:monospace;font-weight:${l.credit?"800":"400"};color:${l.credit?"#34d399":"var(--text-3)"}">
                ${l.credit?v(l.credit):"—"}
              </td>
            </tr>`).join("")}
        </tbody>
        <tfoot>
          <tr style="background:var(--bg-2);border-top:2px solid var(--border-soft)">
            <td colspan="2" style="padding:10px;font-weight:800">الإجمالي</td>
            <td style="padding:10px;text-align:right;font-weight:900;color:#818cf8">${v(i.totalDebit||0)}</td>
            <td style="padding:10px;text-align:right;font-weight:900;color:#34d399">${v(i.totalCredit||0)}</td>
          </tr>
        </tfoot>
      </table>
      <div style="font-size:10px;color:var(--text-3);margin-top:10px;text-align:left">
        أنشأه: ${i.createdByName||"—"} | ${i.createdAt?.toDate?i.createdAt.toDate().toLocaleString("ar-SA"):""}
      </div>
    `;const u=document.getElementById("je-detail-footer");u&&(u.innerHTML=`
        <button class="btn btn-ghost" onclick="closeModal('je-detail-modal')">إغلاق</button>
        <button class="btn btn-secondary" onclick="printSingleJournalVoucher('${e}')">
          <i class="fas fa-print"></i> طباعة سند القيد
        </button>
      `)}catch(a){t.innerHTML=`<div class="alert bad">${a.message}</div>`}};let D=null;function se(){const e=document.getElementById("ledger-acc-input"),t=document.getElementById("ledger-acc-dropdown");!e||!t||(e.addEventListener("input",()=>{const a=e.value.trim().toLowerCase();if(!a){t.classList.add("hidden");return}const o=B.filter(r=>(r.code||"").toLowerCase().includes(a)||(r.name||"").toLowerCase().includes(a)).slice(0,30);t.innerHTML=o.map(r=>`
      <div class="je-acc-option" onclick="selectLedgerAcc('${r.id}','${r.code}','${(r.name||"").replace(/'/g,"\\'")}')">
        <span class="je-acc-code">${r.code}</span>
        <span class="je-acc-name">${r.name}</span>
        <span class="je-acc-type">${P[r.type]||""}</span>
      </div>`).join(""),t.classList.remove("hidden")}),e.addEventListener("blur",()=>setTimeout(()=>t.classList.add("hidden"),200)))}window.ledgerAccSearch=e=>{const t=document.getElementById("ledger-acc-input"),a=document.getElementById("ledger-acc-dropdown");if(!t||!a)return;const o=e.trim().toLowerCase();if(!o){a.classList.add("hidden");return}const r=B.filter(i=>(i.code||"").toLowerCase().includes(o)||(i.name||"").toLowerCase().includes(o)).slice(0,30);a.innerHTML=r.map(i=>`
    <div class="je-acc-option" onmousedown="selectLedgerAcc('${i.id}','${i.code}','${(i.name||"").replace(/'/g,"\\'")}')">
      <span class="je-acc-code">${i.code}</span>
      <span class="je-acc-name">${i.name}</span>
      <span class="je-acc-type">${P[i.type]||""}</span>
    </div>`).join(""),a.classList.toggle("hidden",!r.length)};window.selectLedgerAcc=(e,t,a)=>{D=e;const o=document.getElementById("ledger-acc-input"),r=document.getElementById("ledger-acc-dropdown");o&&(o.value=`${t} — ${a}`),r&&r.classList.add("hidden")};window.loadLedger=async()=>{const e=document.getElementById("ledger-content");if(!e)return;if(!D){window.showToast?.("اختر حساباً أولاً","warn");return}const t=B.find(r=>r.id===D),a=document.getElementById("ledger-from")?.value,o=document.getElementById("ledger-to")?.value;e.innerHTML='<div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin"></i></div>';try{const r=W(T.journalEntries(),M("createdAt"),U(1e3)),d=(await Z(r)).docs.map(s=>({id:s.id,...s.data()})).filter(s=>!s.status||s.status==="posted").sort((s,h)=>(s.date||"").localeCompare(h.date||"")),g=["asset","expense"].includes(t?.type),u=[];d.forEach(s=>{(s.lines||[]).forEach(h=>{if(h.accountId!==D&&h.accountCode!==t?.code)return;const y=s.date||"";a&&y<a||o&&y>o||u.push({date:y,entryNum:(w=>w.entryNumber&&w.entryNumber!=="undefined"?w.entryNumber:"JE-"+s.id.slice(-6).toUpperCase())(s),desc:s.description||"",note:h.note||"",debit:h.debit||0,credit:h.credit||0})})}),u.sort((s,h)=>s.date.localeCompare(h.date)||s.entryNum.localeCompare(h.entryNum));const l=t?.openingBalance||0;let p=l,n=0,b=0;const f=u.map((s,h)=>{n+=s.debit,b+=s.credit,p+=g?s.debit-s.credit:s.credit-s.debit;const y=p>=0?g?"م":"د":g?"د":"م";return`
        <tr>
          <td class="mono" style="font-size:11px;color:var(--text-2)">${h+1}</td>
          <td class="mono" style="font-size:11px">${s.date}</td>
          <td style="color:var(--brand);font-size:11px;font-family:monospace">${s.entryNum}</td>
          <td style="font-size:12px">${s.desc}${s.note?` — <span style="color:var(--text-2)">${s.note}</span>`:""}</td>
          <td style="text-align:right;font-family:monospace;color:${s.debit?"#818cf8":"var(--text-3)"};font-weight:${s.debit?"800":"400"}">
            ${s.debit?v(s.debit):"—"}
          </td>
          <td style="text-align:right;font-family:monospace;color:${s.credit?"#34d399":"var(--text-3)"};font-weight:${s.credit?"800":"400"}">
            ${s.credit?v(s.credit):"—"}
          </td>
          <td class="ledger-running ${p>=0?"running-dr":"running-cr"}" style="text-align:right">
            ${v(Math.abs(p))} ${y}
          </td>
        </tr>`}),x=p;e.innerHTML=`
      <div class="ledger-header">
        <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:10px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i class="fas fa-book" style="color:#fff;font-size:18px"></i>
        </div>
        <div class="ledger-acc-info">
          <h4>${t?.code||""} — ${t?.name||""}</h4>
          <p>دفتر الأستاذ | ${a||"—"} إلى ${o||"—"} | الحركات المرحّلة فقط</p>
        </div>
      </div>

      <div class="ledger-summary">
        <div class="ledger-sum-card">
          <div class="ledger-sum-label">إجمالي المدين</div>
          <div class="ledger-sum-val" style="color:#818cf8">${v(n)}</div>
        </div>
        <div class="ledger-sum-card">
          <div class="ledger-sum-label">إجمالي الدائن</div>
          <div class="ledger-sum-val" style="color:#34d399">${v(b)}</div>
        </div>
        <div class="ledger-sum-card">
          <div class="ledger-sum-label">الرصيد الختامي</div>
          <div class="ledger-sum-val" style="color:${x>=0?"#10b981":"#ef4444"}">
            ${v(Math.abs(x))} ${x>=0?g?"مدين":"دائن":g?"دائن":"مدين"}
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
              <td style="text-align:right;font-weight:800;padding:8px 12px">${v(l)}</td>
            </tr>
            ${f.join("")||'<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-2)">لا توجد حركات في هذه الفترة</td></tr>'}
          </tbody>
        </table>
      </div>`}catch(r){e.innerHTML=`<div class="alert bad" style="margin:14px">${r.message}</div>`}};window.printLedger=()=>window.print();function de(){document.addEventListener("click",e=>{!e.target.closest(".je-acc-search-wrap")&&!e.target.closest(".je-acc-dropdown")&&document.querySelectorAll(".je-acc-dropdown").forEach(t=>t.classList.add("hidden"))})}async function Q(){let e={name:"شركة نظم الإمداد الحديثة",nameEn:"Modern Supply Systems Co.",crNumber:"4700123180",vatNumber:"312448150500003",phone:"0549141648",email:"Nuzmalamdad@gmail.com",address:"7480 — الشارع: عامر الشعبي — ينبع — 13315",logoUrl:""};try{const t=localStorage.getItem("idham_company");t&&Object.assign(e,JSON.parse(t))}catch{}try{const t=await _(fsDoc(k,`companies/${$}/settings`,"company"));if(t.exists()){const o=t.data();e.name=o.name||o.companyName||e.name,e.nameEn=o.nameEn||o.legalName||e.nameEn,e.crNumber=o.crNumber||o.cr||e.crNumber,e.vatNumber=o.vatNumber||o.vat||e.vatNumber,e.phone=o.phone||e.phone,e.email=o.email||e.email,e.address=o.address?o.city?`${o.address} — ${o.city}`:o.address:e.address}const a=await _(fsDoc(k,`companies/${$}/settings`,"logo"));a.exists()&&(e.logoUrl=a.data().dataUrl||a.data().logoUrl||e.logoUrl||"")}catch(t){console.warn("Failed to load company details for journal printing:",t)}return e}function le(e,t){const a={manual:"يدوي",salesInvoice:"مبيعات",purchaseInvoice:"مشتريات",salesReturn:"مردود بيع",purchaseReturn:"مردود شراء",reversing:"عكسي",pos:"POS",stockTransfer:"تحويل مخزني",salesCOGS:"تكلفة مبيعات"},o=t.name||"شركة نظم الإمداد الحديثة",r=t.nameEn||"Modern Supply Systems Co.",i=t.address||"7480 — الشارع: عامر الشعبي — ينبع — 13315",d=t.phone||"0549141648";t.email;const g=t.vatNumber||"312448150500003",u=t.crNumber||"4700123180",l=t.logoUrl||"",p=(e.lines||[]).reduce((c,j)=>c+(j.debit||0),0),n=(e.lines||[]).reduce((c,j)=>c+(j.credit||0),0),b=(e.status||"posted")==="posted",f=Math.abs(p-n)<.01,x=(e.lines||[]).filter(c=>c.serviceProvider||c.taxNumber||c.invoiceRef),s=x.reduce((c,j)=>c||(j.serviceProvider||"").trim(),"")||(e.supplierName||e.vendorName||e.entityName||"").trim(),h=x.reduce((c,j)=>c||(j.taxNumber||"").trim(),"")||(e.taxNumber||e.supplierVatNumber||"").trim(),y=x.reduce((c,j)=>c||(j.invoiceRef||"").trim(),"")||(e.taxInvoiceNumber||e.reference||"").trim(),w=(e.lines||[]).find(c=>(c.debit||0)>0&&(c.accountCode==="2-1-1-2"||c.accountCode==="2-1-3-2"||c.accountCode==="2-2-1-2"||c.accountCode==="2-2-2"||c.accountName&&(c.accountName.includes("المدخلات")||c.accountName.includes("القيمة المضافة")))),C=w&&w.debit||0,q=(e.lines||[]).find(c=>c!==w&&(c.debit||0)>0),G=q?q.debit||0:C>0?Math.round(C/.15*100)/100:p-C,X=p,I=!!(s||h||y||w);return`
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>${I?"سند قيد ضريبي وفاتورة معتمدة":"سند قيد محاسبي"} — ${e.entryNumber||e.id}</title>
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
          ${l?`<img src="${l}" style="height:64px;width:64px;object-fit:contain;background:#fff;border-radius:8px;padding:4px;box-shadow:0 2px 4px rgba(0,0,0,0.1);" />`:'<div style="width:60px;height:60px;background:rgba(255,255,255,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:28px;">🏢</div>'}
          <div>
            <div style="font-size:19px;font-weight:900;color:#fff !important;line-height:1.2;">${o}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.9) !important;margin-top:2px;">${r} | 📍 ${i}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.95) !important;margin-top:4px;display:flex;flex-wrap:wrap;gap:14px;">
              ${`<span>📞 الهاتف: <strong>${d}</strong></span>`}
              ${`<span>🧾 الرقم الضريبي: <strong>${g}</strong></span>`}
              ${`<span>📋 سجل تجاري: <strong>${u}</strong></span>`}
            </div>
          </div>
        </div>
        <div class="v-badge-box">
          <div style="font-size:18px;font-weight:900;color:#fff !important;">
            ${I?"سند قيد ضريبي معتمد":"سند قيد محاسبي"}
          </div>
          <div style="font-size:10.5px;color:rgba(255,255,255,0.9) !important;letter-spacing:0.5px;">
            ${I?"TAX JOURNAL VOUCHER (ZATCA)":"JOURNAL VOUCHER"}
          </div>
        </div>
      </div>
    </div>
    <div class="v-header-gold"></div>

    <!-- Metadata Grid -->
    <div class="v-meta-grid">
      <div class="v-meta-card">
        <div class="v-meta-label">رقم القيد</div>
        <div class="v-meta-val" style="color:#1d4ed8;font-family:monospace;">${e.entryNumber||e.id.slice(0,8)}</div>
      </div>
      <div class="v-meta-card">
        <div class="v-meta-label">تاريخ القيد</div>
        <div class="v-meta-val">${e.date||"—"}</div>
      </div>
      <div class="v-meta-card">
        <div class="v-meta-label">نوع القيد</div>
        <div class="v-meta-val">${I?"قيد ضريبي / خدمات":a[e.sourceType]||e.sourceType||"يدوي"}</div>
      </div>
      <div class="v-meta-card">
        <div class="v-meta-label">حالة الترحيل</div>
        <div class="v-meta-val" style="color:${b?"#059669":"#d97706"}">${b?"مرحّل نظامياً ✓":"مسودة"}</div>
      </div>
    </div>

    <!-- Prominent Supplier & Tax Details Card -->
    ${I?`
      <div class="v-tax-box">
        <div style="font-size:11px;font-weight:800;color:#166534;margin-bottom:8px;display:flex;align-items:center;gap:6px;">
          <span>📋 بيانات المورد والفاتورة الضريبية المرجعية (ZATCA Tax Reference):</span>
        </div>
        <div class="v-tax-grid">
          <div>
            <div class="v-tax-item-label">🏢 اسم المورد / مقدم الخدمة</div>
            <div class="v-tax-item-val">${s||"مورد خدمات"}</div>
          </div>
          <div>
            <div class="v-tax-item-label">🧾 الرقم الضريبي للمورد</div>
            <div class="v-tax-item-val" style="font-family:monospace;color:#1e3a8a;">${h||"—"}</div>
          </div>
          <div>
            <div class="v-tax-item-label">📄 رقم فاتورة المورد الضريبية</div>
            <div class="v-tax-item-val" style="font-family:monospace;color:#4338ca;">${y||e.reference||"—"}</div>
          </div>
          <div>
            <div class="v-tax-item-label">📅 تاريخ الفاتورة</div>
            <div class="v-tax-item-val">${e.date||"—"}</div>
          </div>
        </div>
      </div>

      <!-- ZATCA Tax Breakdown Summary Strip -->
      <div class="v-tax-summary-strip">
        <div class="v-tax-card base">
          <div class="lbl">المبلغ الخاضع للضريبة (قبل الضريبة)</div>
          <div class="val">${v(G)} ر.س</div>
        </div>
        <div class="v-tax-card vat">
          <div class="lbl">ضريبة القيمة المضافة 15% (مدخلات مستردة)</div>
          <div class="val">${v(C>0?C:Math.round(G*.15*100)/100)} ر.س</div>
        </div>
        <div class="v-tax-card total">
          <div class="lbl">الإجمالي شامل الضريبة</div>
          <div class="val">${v(X)} ر.س</div>
        </div>
      </div>
    `:""}

    <!-- General Description -->
    <div class="v-desc-bar">
      <strong>البيان العام للقيد:</strong> ${e.description||"بدون بيان"}
      ${e.reference?`<span style="margin-right:20px;color:#475569;">| مرجع المستند: <strong>${e.reference}</strong></span>`:""}
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
        ${(e.lines||[]).map((c,j)=>{const ee=c.accountCode==="2-1-1-2"||c.accountCode==="2-1-3-2"||c.accountCode==="2-2-1-2"||c.accountCode==="2-2-2"||c.accountName&&c.accountName.includes("المدخلات");return`
          <tr>
            <td style="text-align:center;color:#64748b;font-size:11px;">${j+1}</td>
            <td style="font-family:monospace;font-weight:700;color:#1d4ed8;">${c.accountCode||"—"}</td>
            <td style="font-weight:700;">
              ${c.accountName||"—"}
              ${ee?'<span style="background:#dcfce7;color:#15803d;font-size:9.5px;padding:2px 6px;border-radius:4px;font-weight:800;margin-right:6px;">🏷️ ضريبة مدخلات 15%</span>':""}
            </td>
            <td>
              <div style="font-weight:600;color:#0f172a;">${c.note||e.description||"—"}</div>
              ${c.serviceProvider||c.taxNumber||c.invoiceRef?`
                <div style="font-size:10px;color:#334155;margin-top:3px;background:#f1f5f9;padding:2px 6px;border-radius:4px;display:inline-block;border:1px dashed #cbd5e1;">
                  ${c.serviceProvider?`مورد: <strong>${c.serviceProvider}</strong> `:""}
                  ${c.taxNumber?`| ضريبي: <strong>${c.taxNumber}</strong> `:""}
                  ${c.invoiceRef?`| فاتورة: <strong>${c.invoiceRef}</strong>`:""}
                </div>
              `:""}
            </td>
            <td style="text-align:right;font-family:monospace;font-weight:${c.debit?"800":"400"};color:${c.debit?"#dc2626":"#94a3b8"};">
              ${c.debit?v(c.debit)+" ر.س":"—"}
            </td>
            <td style="text-align:right;font-family:monospace;font-weight:${c.credit?"800":"400"};color:${c.credit?"#16a34a":"#94a3b8"};">
              ${c.credit?v(c.credit)+" ر.س":"—"}
            </td>
          </tr>
        `}).join("")}
        <tr class="v-totals-row">
          <td colspan="4" style="text-align:right;padding:10px;">
            الإجمالي الكلي للقيد المحاسبي
            <span style="font-size:11px;font-weight:700;color:${f?"#059669":"#dc2626"};margin-right:12px;">
              (${f?"✓ القيد متوازن ومطابق نظامياً":"⚠️ غير متوازن"})
            </span>
          </td>
          <td style="text-align:right;color:#dc2626;font-family:monospace;font-weight:900;">${v(p)} ر.س</td>
          <td style="text-align:right;color:#16a34a;font-family:monospace;font-weight:900;">${v(n)} ر.س</td>
        </tr>
      </tbody>
    </table>

    <!-- Signatures Block -->
    <div class="v-sigs">
      <div class="v-sig-box">
        <div class="v-sig-title">إعداد المحاسب المسؤول</div>
        <div class="v-sig-line">${e.createdByName||"المحاسب المسؤول"}</div>
      </div>
      <div class="v-sig-box">
        <div class="v-sig-title">المراجعة والتدقيق المالي</div>
        <div class="v-sig-line">إدارة الحسابات</div>
      </div>
      <div class="v-sig-box">
        <div class="v-sig-title">الاعتماد والختم الرسمي</div>
        <div class="v-sig-line">${o}</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="v-footer">
      <span>طُبع بواسطة: <strong>نظام إدهام للمواد الغذائية ERP — ${o}</strong></span>
      <span>تاريخ الطباعة: <strong>${new Date().toLocaleString("ar-SA")}</strong></span>
    </div>

  </div>
</body>
</html>
  `}function ce(e,t,a){const o=t.name||"شركة نظم الإمداد الحديثة";t.nameEn;const r=t.address||"7480 — الشارع: عامر الشعبي — ينبع — 13315",i=t.phone||"0549141648",d=t.vatNumber||"312448150500003";t.crNumber;const g=t.logoUrl||"",u={manual:"يدوي",salesInvoice:"مبيعات",purchaseInvoice:"مشتريات",salesReturn:"مردود بيع",purchaseReturn:"مردود شراء",reversing:"عكسي",pos:"POS"},l=e.reduce((n,b)=>n+Math.max(parseFloat(b.totalDebit||0)||0,(b.lines||[]).reduce((f,x)=>f+(parseFloat(x.debit||0)||0),0)),0),p=e.reduce((n,b)=>n+Math.max(parseFloat(b.totalCredit||0)||0,(b.lines||[]).reduce((f,x)=>f+(parseFloat(x.credit||0)||0),0)),0);return`
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>تقرير دفتر اليومية العامة — ${o}</title>
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
          ${g?`<img src="${g}" style="height:56px;width:56px;object-fit:contain;background:#fff;border-radius:8px;padding:3px;" />`:'<div style="width:50px;height:50px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;">🏢</div>'}
          <div>
            <div style="font-size:18px;font-weight:900;color:#fff !important;">${o}</div>
            <div style="font-size:10.5px;color:rgba(255,255,255,0.9) !important;margin-top:2px;">📍 ${r} | 📞 ${i} | 🔢 ضريبي: ${d}</div>
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
      <span>📅 الفترة: <strong>${a.from||"بداية الفترة"}</strong> إلى <strong>${a.to||"اليوم"}</strong></span>
      <span>🏷️ نوع القيود: <strong>${a.typeF?u[a.typeF]||a.typeF:"الكل"}</strong></span>
      <span>📋 الحالة: <strong>${a.statusF?a.statusF==="posted"?"مرحّل":"مسودة":"الكل"}</strong></span>
      <span>📊 إجمالي القيود: <strong>${e.length} قيد</strong></span>
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
        ${e.map((n,b)=>{const f=Math.max(parseFloat(n.totalDebit||0)||0,(n.lines||[]).reduce((s,h)=>s+(parseFloat(h.debit||0)||0),0)),x=Math.max(parseFloat(n.totalCredit||0)||0,(n.lines||[]).reduce((s,h)=>s+(parseFloat(h.credit||0)||0),0));return`
            <tr>
              <td style="text-align:center;color:#64748b;font-size:10.5px;">${b+1}</td>
              <td style="font-family:monospace;font-size:11px;">${n.date||""}</td>
              <td style="font-family:monospace;font-weight:700;color:#1d4ed8;">${n.entryNumber||n.id.slice(0,8)}</td>
              <td>${n.description||"—"}</td>
              <td>${u[n.sourceType]||n.sourceType||"يدوي"}</td>
              <td>${(n.status||"posted")==="posted"?"مرحّل":"مسودة"}</td>
              <td style="text-align:right;font-family:monospace;font-weight:700;color:#1e40af;">${v(f)}</td>
              <td style="text-align:right;font-family:monospace;font-weight:700;color:#047857;">${v(x)}</td>
              <td style="font-size:10.5px;color:#64748b;">${n.createdByName||"—"}</td>
            </tr>
          `}).join("")}
        <tr class="r-totals">
          <td colspan="6" style="text-align:right;padding:10px;">إجمالي حركات دفتر اليومية العامة</td>
          <td style="text-align:right;color:#1e40af;font-family:monospace;">${v(l)}</td>
          <td style="text-align:right;color:#047857;font-family:monospace;">${v(p)}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>
  `}window.printSingleJournalVoucher=async e=>{let t=z.find(i=>i.id===e);if(!t)try{const i=await _(fsDoc(k,`companies/${$}/journalEntries`,e));i.exists()&&(t={id:i.id,...i.data()})}catch{}if(!t){window.showToast?.("عذراً، لم يتم العثور على بيانات القيد المطلوب","bad");return}const a=await Q(),o=le(t,a),r=window.open("","_blank");if(!r){window.showToast?.("يرجى السماح بالنوافذ المنبثقة للطباعة","warn");return}r.document.write(o),r.document.close(),setTimeout(()=>{r.focus(),r.print()},400)};window.printJournalLogReport=async()=>{const e=await Q(),t=document.getElementById("je-from")?.value||"",a=document.getElementById("je-to")?.value||"",o=document.getElementById("je-type-filter")?.value||"",r=document.getElementById("je-status-filter")?.value||"",i=ce(z,e,{from:t,to:a,typeF:o,statusF:r}),d=window.open("","_blank");if(!d){window.showToast?.("يرجى السماح بالنوافذ المنبثقة للطباعة","warn");return}d.document.write(i),d.document.close(),setTimeout(()=>{d.focus(),d.print()},400)};export{ve as render};
