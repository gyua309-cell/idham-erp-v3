import{g as J,C as w,s as H,t as h,f,i as R,K as O,e as S,_ as L,d as I,a as C}from"./index-HrCilPJ3.js";import{orderBy as T,query as P,limit as _,getDocs as F}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let g=[],k=[],j=null;async function ee(a,e){a.innerHTML=q(),G(),k=await J(w.chartOfAccounts(),[T("code")]),j=await D(),switchTab("log"),setTimeout(()=>{const t=document.getElementById("je-search");if(t){t.oninput=null;const n=window.debounce?window.debounce(i=>filterJETable(i.target.value),300):i=>filterJETable(i.target.value);t.addEventListener("input",n)}},100)}function q(){return`
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
        <input type="date" id="je-from" value="${H()}" onchange="loadJournalEntries()" />
      </div>
      <div class="je-filter-group">
        <label>إلى</label>
        <input type="date" id="je-to" value="${h()}" onchange="loadJournalEntries()" />
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
        <button class="je-btn je-btn-ghost" onclick="exportPagePDF('.je-log-table','دفتر_اليومية')">
          <i class="fas fa-file-pdf"></i> PDF
        </button>
        <button class="je-btn je-btn-ghost" onclick="exportPageExcel('.je-log-table','دفتر_اليومية')">
          <i class="fas fa-file-excel"></i> Excel
        </button>
        <button class="je-btn je-btn-ghost" onclick="window.print()" title="طباعة">
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
        <input type="date" id="ledger-from" value="${H()}" />
      </div>
      <div class="je-filter-group">
        <label>إلى</label>
        <input type="date" id="ledger-to" value="${h()}" />
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
          <input type="date" id="je-date" class="input" value="${h()}" />
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
/* ────── Root ────── */
.je-root { display:flex; flex-direction:column; height:100%; overflow:hidden; }

/* ────── Tabs ────── */
.je-tabs {
  display:flex; gap:0; padding:10px 14px 0; background:var(--bg-1);
  border-bottom:2px solid var(--border-soft); flex-shrink:0;
}
.je-tab {
  padding:8px 18px; border-radius:8px 8px 0 0; border:none;
  background:transparent; color:var(--text-2); cursor:pointer;
  font-size:13px; font-weight:700; font-family:inherit;
  display:flex; align-items:center; gap:6px; transition:all .15s;
  border-bottom:2px solid transparent; margin-bottom:-2px;
}
.je-tab:hover { color:var(--text-0); }
.je-tab.active { color:var(--brand); border-bottom-color:var(--brand); background:rgba(99,102,241,.06); }

/* ────── Panels ────── */
.je-panel { display:flex; flex-direction:column; flex:1; overflow:hidden; }
.je-panel.hidden { display:none; }

/* ────── Filter Bar ────── */
.je-filterbar {
  display:flex; align-items:flex-end; gap:10px; padding:10px 14px;
  background:var(--bg-0); border-bottom:1px solid var(--border-soft);
  flex-wrap:wrap; flex-shrink:0;
}
.je-filter-group { display:flex; flex-direction:column; gap:4px; }
.je-filter-group label { font-size:10px; font-weight:800; color:var(--text-2); }
.je-filter-group input, .je-filter-group select {
  padding:6px 9px; border:1px solid var(--border-soft); border-radius:7px;
  background:var(--bg-2); color:var(--text-0); font-size:12px; font-family:inherit;
}
.je-filter-group input:focus, .je-filter-group select:focus {
  outline:none; border-color:var(--brand);
}
.je-search-wrap {
  display:flex; align-items:center; gap:6px;
  background:var(--bg-2); border:1px solid var(--border-soft);
  border-radius:7px; padding:6px 9px;
}
.je-search-wrap:focus-within { border-color:var(--brand); }
.je-search-wrap input { border:none; background:transparent; color:var(--text-0); font-size:12px; outline:none; width:160px; font-family:inherit; }

/* ────── Buttons ────── */
.je-btn {
  padding:7px 12px; border-radius:7px; border:none; cursor:pointer;
  font-size:12px; font-weight:700; font-family:inherit;
  display:flex; align-items:center; gap:5px; transition:all .15s; white-space:nowrap;
}
.je-btn-primary  { background:var(--brand); color:#fff; }
.je-btn-primary:hover { opacity:.88; }
.je-btn-ghost    { background:var(--bg-2); color:var(--text-1); border:1px solid var(--border-soft); }
.je-btn-ghost:hover { border-color:var(--brand); color:var(--brand); }
.je-btn-danger   { background:#ef4444; color:#fff; }
.je-btn-danger:hover { opacity:.88; }

/* ────── KPIs ────── */
.je-kpis {
  display:flex; gap:8px; padding:10px 14px;
  background:var(--bg-0); border-bottom:1px solid var(--border-soft); flex-shrink:0;
  overflow-x:auto;
}
.je-kpi {
  display:flex; align-items:center; gap:10px;
  background:var(--bg-1); border:1px solid var(--border-soft);
  border-radius:10px; padding:10px 14px; flex-shrink:0; min-width:140px;
}
.je-kpi-icon {
  width:32px; height:32px; border-radius:8px;
  display:flex; align-items:center; justify-content:center; font-size:13px;
}
.je-kpi-label { font-size:10px; color:var(--text-2); margin-bottom:2px; }
.je-kpi-val   { font-size:14px; font-weight:900; font-variant-numeric:tabular-nums; }
.kpi-blue   .je-kpi-icon { background:#818cf822; color:#818cf8; }
.kpi-blue   .je-kpi-val  { color:#818cf8; }
.kpi-green  .je-kpi-icon { background:#34d39922; color:#34d399; }
.kpi-green  .je-kpi-val  { color:#34d399; }
.kpi-indigo .je-kpi-icon { background:#6366f122; color:#6366f1; }
.kpi-indigo .je-kpi-val  { color:#6366f1; }
.kpi-amber  .je-kpi-icon { background:#f59e0b22; color:#f59e0b; }
.kpi-amber  .je-kpi-val  { color:#f59e0b; }
.kpi-teal   .je-kpi-icon { background:#10b98122; color:#10b981; }
.kpi-teal   .je-kpi-val  { color:#10b981; }

/* ────── Log Table ────── */
.je-table-wrap { flex:1; overflow-y:auto; }
.je-log-table {
  width:100%; border-collapse:collapse; font-size:13px;
}
.je-log-table th {
  position:sticky; top:0; z-index:2;
  background:var(--bg-2); padding:9px 12px;
  font-size:11px; font-weight:800; color:var(--text-2);
  border-bottom:2px solid var(--border-soft); text-align:right;
}
.je-log-table td {
  padding:9px 12px; border-bottom:1px solid rgba(255,255,255,.03);
  vertical-align:middle;
}
.je-log-table tr:hover td { background:var(--bg-1); cursor:pointer; }
.status-posted { background:rgba(16,185,129,.08) !important; }
.status-draft  { background:rgba(245,158,11,.04)  !important; }
.badge-posted  { background:rgba(16,185,129,.15); color:#10b981; padding:2px 8px; border-radius:20px; font-size:10px; font-weight:800; }
.badge-draft   { background:rgba(245,158,11,.15); color:#f59e0b; padding:2px 8px; border-radius:20px; font-size:10px; font-weight:800; }
.badge-reversed{ background:rgba(239,68,68,.15);  color:#ef4444; padding:2px 8px; border-radius:20px; font-size:10px; font-weight:800; }
.badge-type    { background:rgba(99,102,241,.12);  color:#818cf8; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:800; }

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
  margin-top:12px; padding:10px 16px; border-radius:10px;
  background:rgba(99,102,241,.06); border:1px solid rgba(99,102,241,.15);
}
.je-balance-label { font-size:10px; color:var(--text-2); display:block; }
.je-balance-dr    { font-size:16px; font-weight:900; color:#818cf8; font-variant-numeric:tabular-nums; }
.je-balance-cr    { font-size:16px; font-weight:900; color:#34d399; font-variant-numeric:tabular-nums; }
.je-balance-right { text-align:left; }
.je-balance-status {
  font-size:12px; font-weight:800; padding:6px 14px; border-radius:20px;
  display:flex; align-items:center; gap:6px;
}
.je-balance-status.balanced   { background:rgba(16,185,129,.15); color:#10b981; }
.je-balance-status.unbalanced { background:rgba(239,68,68,.15);  color:#ef4444; }

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
  `}window.switchTab=function(a){["log","ledger"].forEach(e=>{document.getElementById(`tab-${e}`)?.classList.toggle("active",e===a),document.getElementById(`panel-${e}`)?.classList.toggle("hidden",e!==a)}),a==="log"&&loadJournalEntries(),a==="ledger"&&Y()};async function D(){try{const a=P(w.journalEntries(),T("entryNumber","desc"),_(1)),e=await F(a);if(!e.empty){const t=e.docs[0].data().entryNumber||"",n=parseInt(t.replace(/\D/g,""))||0;return`JE-${new Date().getFullYear()}-${String(n+1).padStart(4,"0")}`}}catch{}return`JE-${new Date().getFullYear()}-0001`}let z=[];window.loadJournalEntries=async()=>{const a=document.getElementById("je-tbody");if(a){a.innerHTML=`<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2)">
    <i class="fas fa-spinner fa-spin"></i> جارٍ التحميل...
  </td></tr>`;try{const e=document.getElementById("je-from")?.value,t=document.getElementById("je-to")?.value,n=document.getElementById("je-type-filter")?.value,i=document.getElementById("je-status-filter")?.value;let o=await J(w.journalEntries(),[T("createdAt","desc"),_(500)]);o.sort((r,l)=>(l.date||"").localeCompare(r.date||"")),e&&(o=o.filter(r=>(r.date||"")>=e)),t&&(o=o.filter(r=>(r.date||"")<=t)),n&&(o=o.filter(r=>r.sourceType===n)),i&&(o=o.filter(r=>(r.status||"posted")===i)),z=o,A(o);const p=o.reduce((r,l)=>{const b=l.totalDebit||0,m=(l.lines||[]).reduce((x,d)=>x+(d.debit||0),0);return r+Math.max(b,m)},0),c=o.reduce((r,l)=>{const b=l.totalCredit||0,m=(l.lines||[]).reduce((x,d)=>x+(d.credit||0),0);return r+Math.max(b,m)},0),s=o.filter(r=>r.status==="posted").length,u=Math.abs(p-c)<.01;document.getElementById("kpi-total-dr").textContent=f(p),document.getElementById("kpi-total-cr").textContent=f(c),document.getElementById("kpi-balance").textContent=u?"✓ متوازن":f(Math.abs(p-c)),document.getElementById("kpi-count").textContent=o.length,document.getElementById("kpi-posted").textContent=s}catch(e){a.innerHTML=`<tr><td colspan="9"><div class="alert bad" style="margin:8px">${e.message}</div></td></tr>`}}};function A(a){const e=document.getElementById("je-tbody");if(!e)return;if(!a.length){e.innerHTML='<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-2)">لا توجد قيود</td></tr>';return}const t={manual:"يدوي",salesInvoice:"مبيعات",purchaseInvoice:"مشتريات",salesReturn:"مردود بيع",purchaseReturn:"مردود شراء",reversing:"عكسي",pos:"POS"};e.innerHTML=a.map(n=>{const i=n.status||"posted",o=i==="posted",p=n.isReversed;return`<tr class="status-${i}" onclick="viewJEEntry('${n.id}')">
      <td class="mono" style="font-size:11px;color:var(--text-2)">${n.date||""}</td>
      <td class="mono" style="color:var(--brand);font-weight:800">${n.entryNumber||n.id.slice(0,8)}</td>
      <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${n.description||"—"}</td>
      <td><span class="badge-type">${t[n.sourceType]||n.sourceType||"يدوي"}</span></td>
      <td class="mono" style="text-align:right; color:#818cf8">${f(Math.max(n.totalDebit||0,(n.lines||[]).reduce((c,s)=>c+(s.debit||0),0)))}</td>
      <td class="mono" style="text-align:right; color:#34d399">${f(Math.max(n.totalCredit||0,(n.lines||[]).reduce((c,s)=>c+(s.credit||0),0)))}</td>
      <td>
        ${p?'<span class="badge-reversed">معكوس</span>':o?'<span class="badge-posted">مرحّل</span>':'<span class="badge-draft">مسودة</span>'}
      </td>
      <td style="font-size:11px;color:var(--text-2)">${n.createdByName||"—"}</td>
      <td onclick="event.stopPropagation()">
        <div style="display:flex;gap:4px;justify-content:flex-end">
          ${p?"":`
            <button class="je-btn" style="padding:4px 8px;font-size:10px;background:var(--bg-3);color:var(--text-1);"
                    onclick="openJournalModal('${n.id}')">
              ✏️ تعديل
            </button>`}
          ${!o&&!p?`
            <button class="je-btn je-btn-primary" style="padding:4px 8px;font-size:10px"
                    onclick="postEntry('${n.id}')">
              <i class="fas fa-check"></i> ترحيل
            </button>`:""}
          ${o&&!p?`
            <button class="je-btn je-btn-danger" style="padding:4px 8px;font-size:10px"
                    onclick="reverseEntry('${n.id}','${(n.entryNumber||"").replace(/'/g,"\\'")}')">
              <i class="fas fa-undo"></i> عكس
            </button>`:""}
        </div>
      </td>
    </tr>`}).join("")}window.filterJETable=a=>{const e=a.trim().toLowerCase();if(!e){A(z);return}A(z.filter(t=>(t.entryNumber||"").toLowerCase().includes(e)||(t.description||"").toLowerCase().includes(e)))};window.openJournalModal=async(a="")=>{g=[],document.getElementById("je-form-error").classList.add("hidden"),await V();const e=document.getElementById("je-cost-center");if(a&&typeof a=="string"){const t=z.find(n=>n.id===a);if(!t)return;document.getElementById("je-edit-id").value=t.id,document.getElementById("je-desc").value=t.description||"",document.getElementById("je-ref").value=t.reference||"",document.getElementById("je-date").value=t.date||h(),e&&(e.value=t.costCenterId||""),document.getElementById("je-modal-title").textContent=`تعديل القيد: ${t.entryNumber||""}`,document.getElementById("je-entry-num-label").textContent=`رقم القيد: ${t.entryNumber||""}`,j=t.entryNumber,t.lines&&t.lines.length&&(g=t.lines.map(n=>({accountId:n.accountId||"",accountCode:n.accountCode||"",accountName:n.accountName||"",accountType:n.accountType||"",note:n.note||"",debit:parseFloat(n.debit)||0,credit:parseFloat(n.credit)||0,costCenterId:n.costCenterId||null}))),M(),$()}else{document.getElementById("je-edit-id").value="",document.getElementById("je-desc").value="",document.getElementById("je-ref").value="",document.getElementById("je-date").value=h(),e&&(e.value=""),document.getElementById("je-modal-title").textContent="قيد يدوي جديد";const t=await D();j=t,document.getElementById("je-entry-num-label").textContent=`رقم القيد: ${t}`,addJELine(),addJELine()}openModal("journal-modal")};let B=[];async function V(){const a=document.getElementById("je-cost-center");if(a)try{B=(await J(w.costCenters()).catch(()=>[])).sort((t,n)=>(t.code||"").localeCompare(n.code||"")),a.innerHTML='<option value="">بدون مركز تكلفة</option>'+B.map(t=>`<option value="${t.id}">${t.code||""} — ${t.name}</option>`).join("")}catch{}}window.addJELine=()=>{g.push({accountId:"",accountCode:"",accountName:"",accountType:"",note:"",debit:0,credit:0}),M(),$()};function M(){const a=document.getElementById("je-lines-tbody");a&&(a.innerHTML=g.map((e,t)=>`
    <tr data-line="${t}" style="border-bottom:1px solid rgba(255,255,255,.03)">
      <td style="text-align:center;color:var(--text-2);font-size:11px;width:32px">${t+1}</td>

      <!-- Account Search Cell -->
      <td style="position:relative;padding:4px 6px;">
        <div class="je-acc-search-wrap" style="width:100%">
          <i class="fas fa-search" style="font-size:9px;color:var(--text-3);flex-shrink:0"></i>
          <input type="text" class="je-acc-input" id="acc-search-${t}"
                 placeholder="اكتب كود أو اسم الحساب... [F8 للبحث]"
                 value="${e.accountCode?e.accountCode+" — "+e.accountName:""}"
                 oninput="accLineSearch(${t}, this.value)"
                 onfocus="showAccDropdown(${t})"
                 onblur="hideAccDropdown(${t})"
                 autocomplete="off" />
          <div class="je-acc-dropdown hidden" id="acc-drop-${t}"></div>
        </div>
        ${e.accountId?`<div style="font-size:9px;color:var(--text-3);margin-top:1px;padding:0 4px">${e.accountType||""}</div>`:""}
      </td>

      <!-- Note -->
      <td style="padding:4px 6px;">
        <input type="text" class="je-note-input" placeholder="البيان الفرعي..."
               value="${e.note}" onchange="jLines[${t}].note=this.value" />
      </td>

      <!-- Debit -->
      <td style="padding:4px 6px;">
        <input type="number" class="je-amt-input ${e.debit?"has-val":""}"
               placeholder="0.00" min="0" step="0.01"
               value="${e.debit||""}"
               oninput="updateJEAmt(${t},'debit',this)"
               onfocus="if(this.value=='0')this.value=''"
               onblur="if(!this.value)jLines[${t}].debit=0;updateJETotals()" />
      </td>

      <!-- Credit -->
      <td style="padding:4px 6px;">
        <input type="number" class="je-amt-input ${e.credit?"has-val-cr":""}"
               placeholder="0.00" min="0" step="0.01"
               value="${e.credit||""}"
               oninput="updateJEAmt(${t},'credit',this)"
               onfocus="if(this.value=='0')this.value=''"
               onblur="if(!this.value)jLines[${t}].credit=0;updateJETotals()" />
      </td>

      <!-- Delete -->
      <td style="text-align:center;width:36px">
        <button onclick="removeJELine(${t})"
                style="background:none;border:none;cursor:pointer;color:var(--text-3);font-size:14px;padding:2px 4px;border-radius:4px;transition:color .15s"
                onmouseover="this.style.color='#ef4444'"
                onmouseout="this.style.color='var(--text-3)'">×</button>
      </td>
    </tr>
  `).join(""))}const N={asset:"أصول",liability:"خصوم",equity:"ملكية",revenue:"إيرادات",expense:"مصروفات"};window.accLineSearch=(a,e)=>{const t=document.getElementById(`acc-drop-${a}`);if(!t)return;const n=e.trim().toLowerCase();if(!n){t.classList.add("hidden");return}const i=k.filter(o=>o.isActive!==!1).filter(o=>(o.code||"").toLowerCase().includes(n)||(o.name||"").toLowerCase().includes(n)).slice(0,30);i.length?t.innerHTML=i.map(o=>`
      <div class="je-acc-option" onmousedown="selectAccLine(${a},'${o.id}','${o.code}','${(o.name||"").replace(/'/g,"\\'")}','${o.type||""}')">
        <span class="je-acc-code">${o.code}</span>
        <span class="je-acc-name">${o.name}</span>
        <span class="je-acc-type">${N[o.type]||o.type||""}</span>
        ${o.nodeType==="header"?'<span style="font-size:9px;color:#f59e0b;margin-right:2px">رئيسي</span>':""}
      </div>`).join(""):t.innerHTML='<div class="je-acc-option" style="color:var(--text-2)">لا توجد نتائج</div>',t.classList.remove("hidden")};window.selectAccLine=(a,e,t,n,i)=>{g[a].accountId=e,g[a].accountCode=t,g[a].accountName=n,g[a].accountType=N[i]||i;const o=document.getElementById(`acc-search-${a}`),p=document.getElementById(`acc-drop-${a}`);if(o&&(o.value=`${t} — ${n}`),p&&p.classList.add("hidden"),!g[a].debit&&!g[a].credit){const c=["asset","expense"].includes(i),s=g.reduce((l,b)=>l+(b.debit||0),0),u=g.reduce((l,b)=>l+(b.credit||0),0),r=Math.abs(s-u);r>0&&(c&&s<u&&(g[a].debit=r),!c&&u<s&&(g[a].credit=r),M())}$()};window.showAccDropdown=a=>{const e=document.getElementById(`acc-search-${a}`);e?.value&&accLineSearch(a,e.value)};window.hideAccDropdown=a=>{setTimeout(()=>document.getElementById(`acc-drop-${a}`)?.classList.add("hidden"),200)};window.updateJEAmt=(a,e,t)=>{const n=parseFloat(t.value)||0;g[a][e]=n,t.className="je-amt-input "+(n>0?e==="debit"?"has-val":"has-val-cr":""),$()};window.removeJELine=a=>{g.splice(a,1),M(),$()};function $(){const a=g.reduce((c,s)=>c+(s.debit||0),0),e=g.reduce((c,s)=>c+(s.credit||0),0),t=Math.abs(a-e),n=t<.01,i=c=>c.toLocaleString("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2}),o=(c,s)=>{const u=document.getElementById(c);u&&(u.textContent=s)};o("je-sum-debit",`${i(a)} ر.س`),o("je-sum-credit",`${i(e)} ر.س`),o("meter-dr",i(a)),o("meter-cr",i(e));const p=document.getElementById("meter-status");p&&(a===0&&e===0?(p.className="je-balance-status balanced",p.innerHTML='<i class="fas fa-balance-scale"></i> أدخل مبالغ القيد'):n?(p.className="je-balance-status balanced",p.innerHTML='<i class="fas fa-check-circle"></i> قيد متوازن ✓'):(p.className="je-balance-status unbalanced",p.innerHTML=`<i class="fas fa-exclamation-triangle"></i> غير متوازن — الفرق: ${i(t)} ر.س`))}window.saveJournal=async(a="posted")=>{const e=document.getElementById("je-form-error");e.classList.add("hidden");const t=document.getElementById("je-date").value,n=document.getElementById("je-desc").value.trim(),i=document.getElementById("je-ref").value.trim();if(!t){e.textContent="التاريخ مطلوب",e.classList.remove("hidden");return}if(!n){e.textContent="البيان مطلوب",e.classList.remove("hidden");return}const o=g.filter(l=>l.accountId&&(l.debit>0||l.credit>0));if(o.length<2){e.textContent="يجب أن يحتوي القيد على سطرين على الأقل",e.classList.remove("hidden");return}const p=o.reduce((l,b)=>l+(b.debit||0),0),c=o.reduce((l,b)=>l+(b.credit||0),0);if(Math.abs(p-c)>.01){e.textContent=`⚖️ القيد غير متوازن — المدين (${f(p)}) ≠ الدائن (${f(c)})`,e.classList.remove("hidden");return}if(o.filter(l=>!l.accountId&&(l.debit>0||l.credit>0)).length){e.textContent="يوجد سطور بمبالغ ولكن بدون حساب محدد",e.classList.remove("hidden");return}const u=document.getElementById("save-draft-btn"),r=document.getElementById("save-post-btn");u.disabled=r.disabled=!0;try{if(await R(t)){e.textContent=`⚠️ لا يمكن حفظ القيد لأن تاريخه (${t}) يقع في فترة محاسبية مغلقة ومقفلة نهائياً.`,e.classList.remove("hidden"),u.disabled=r.disabled=!1;return}const l=document.getElementById("je-cost-center"),b=l?.value||null,m=l&&b&&B&&B.find(d=>d.id===b)?.name||null;o.forEach(d=>{d.costCenterId||(d.costCenterId=b)});const x=document.getElementById("je-edit-id").value;if(x)await O(x,{date:t,description:n,reference:i,costCenterId:b,costCenterName:m,lines:o,status:a}),window.showToast?.(`تم تعديل و${a==="posted"?"ترحيل":"حفظ"} القيد بنجاح`,"success");else{const d=j||await D();await S({date:t,description:n,reference:i,sourceType:"manual",entryNumber:d,status:a,costCenterId:b,costCenterName:m,lines:o}),window.showToast?.(`تم ${a==="posted"?"ترحيل":"حفظ"} القيد ${d}`,"success")}closeModal("journal-modal"),g=[],j=null,await loadJournalEntries()}catch(l){e.textContent=l.message,e.classList.remove("hidden")}finally{u.disabled=r.disabled=!1}};window.postEntry=async a=>{if(await window.showConfirm?.("ترحيل هذا القيد؟ لن يمكن تعديله بعد الترحيل.","ترحيل القيد"))try{const{updateDoc:e,doc:t}=await L(async()=>{const{updateDoc:n,doc:i}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{updateDoc:n,doc:i}},[]);await e(t(I,`companies/${C}/journalEntries`,a),{status:"posted"}),window.showToast?.("تم ترحيل القيد","success"),await loadJournalEntries()}catch(e){window.showToast?.(e.message,"error")}};window.reverseEntry=async(a,e)=>{if(await window.showConfirm?.(`سيُنشأ قيد عكسي لـ "${e}" — يعكس جميع المدينات والدائن. هل تريد المتابعة؟`,"قيد عكسي (Reversing Entry)"))try{const{getDoc:t,doc:n}=await L(async()=>{const{getDoc:r,doc:l}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:r,doc:l}},[]),i=await t(n(I,`companies/${C}/journalEntries`,a));if(!i.exists())throw new Error("القيد غير موجود");const o=i.data(),p=(o.lines||[]).map(r=>({...r,debit:r.credit||0,credit:r.debit||0,note:`عكس: ${r.note||r.accountName}`})),{updateDoc:c,doc:s}=await L(async()=>{const{updateDoc:r,doc:l}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{updateDoc:r,doc:l}},[]),u=await D();await S({date:h(),description:`قيد عكسي لـ ${o.entryNumber||e}`,sourceType:"reversing",entryNumber:u,status:"posted",reversedFrom:a,lines:p}),await c(s(I,`companies/${C}/journalEntries`,a),{isReversed:!0,reversedBy:u}),window.showToast?.(`تم إنشاء القيد العكسي ${u}`,"success"),await loadJournalEntries()}catch(t){console.error(t),window.showToast?.(t.message,"error")}};window.viewJEEntry=async a=>{const e=document.getElementById("je-detail-body");e.innerHTML='<div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin"></i></div>',openModal("je-detail-modal");try{const{getDoc:t,doc:n}=await L(async()=>{const{getDoc:s,doc:u}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:s,doc:u}},[]),i=await t(n(I,`companies/${C}/journalEntries`,a));if(!i.exists())throw new Error("القيد غير موجود");const o={id:i.id,...i.data()};document.getElementById("je-detail-title").textContent=`قيد: ${o.entryNumber||a.slice(0,8)}`;const c=(o.status||"posted")==="posted";e.innerHTML=`
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;padding:0 4px">
        <div style="background:var(--bg-1);border-radius:8px;padding:10px;border:1px solid var(--border-soft)">
          <div style="font-size:10px;color:var(--text-2);margin-bottom:3px">رقم القيد</div>
          <div style="font-weight:900;color:var(--brand);font-size:15px">${o.entryNumber||a.slice(0,8)}</div>
        </div>
        <div style="background:var(--bg-1);border-radius:8px;padding:10px;border:1px solid var(--border-soft)">
          <div style="font-size:10px;color:var(--text-2);margin-bottom:3px">التاريخ</div>
          <div style="font-weight:700">${o.date||"—"}</div>
        </div>
        <div style="background:var(--bg-1);border-radius:8px;padding:10px;border:1px solid var(--border-soft)">
          <div style="font-size:10px;color:var(--text-2);margin-bottom:3px">الحالة</div>
          <div>${c?'<span class="badge-posted">مرحّل</span>':'<span class="badge-draft">مسودة</span>'}</div>
        </div>
      </div>
      <div style="background:var(--bg-1);border-radius:8px;padding:10px;border:1px solid var(--border-soft);margin-bottom:14px">
        <div style="font-size:10px;color:var(--text-2);margin-bottom:3px">البيان</div>
        <div style="font-weight:600">${o.description}</div>
        ${o.reference?`<div style="font-size:11px;color:var(--text-2);margin-top:3px">مرجع: ${o.reference}</div>`:""}
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
          ${(o.lines||[]).map(s=>`
            <tr style="border-bottom:1px solid rgba(255,255,255,.04)">
              <td style="padding:8px 10px">
                <span style="font-family:monospace;font-size:11px;color:var(--brand)">${s.accountCode}</span>
                <span style="margin-right:6px">${s.accountName}</span>
              </td>
              <td style="padding:8px 10px;color:var(--text-2);font-size:12px">${s.note||"—"}</td>
              <td style="padding:8px 10px;text-align:right;font-family:monospace;font-weight:${s.debit?"800":"400"};color:${s.debit?"#818cf8":"var(--text-3)"}">
                ${s.debit?f(s.debit):"—"}
              </td>
              <td style="padding:8px 10px;text-align:right;font-family:monospace;font-weight:${s.credit?"800":"400"};color:${s.credit?"#34d399":"var(--text-3)"}">
                ${s.credit?f(s.credit):"—"}
              </td>
            </tr>`).join("")}
        </tbody>
        <tfoot>
          <tr style="background:var(--bg-2);border-top:2px solid var(--border-soft)">
            <td colspan="2" style="padding:10px;font-weight:800">الإجمالي</td>
            <td style="padding:10px;text-align:right;font-weight:900;color:#818cf8">${f(o.totalDebit||0)}</td>
            <td style="padding:10px;text-align:right;font-weight:900;color:#34d399">${f(o.totalCredit||0)}</td>
          </tr>
        </tfoot>
      </table>
      <div style="font-size:10px;color:var(--text-3);margin-top:10px;text-align:left">
        أنشأه: ${o.createdByName||"—"} | ${o.createdAt?.toDate?o.createdAt.toDate().toLocaleString("ar-SA"):""}
      </div>
    `}catch(t){e.innerHTML=`<div class="alert bad">${t.message}</div>`}};let E=null;function Y(){const a=document.getElementById("ledger-acc-input"),e=document.getElementById("ledger-acc-dropdown");!a||!e||(a.addEventListener("input",()=>{const t=a.value.trim().toLowerCase();if(!t){e.classList.add("hidden");return}const n=k.filter(i=>(i.code||"").toLowerCase().includes(t)||(i.name||"").toLowerCase().includes(t)).slice(0,30);e.innerHTML=n.map(i=>`
      <div class="je-acc-option" onclick="selectLedgerAcc('${i.id}','${i.code}','${(i.name||"").replace(/'/g,"\\'")}')">
        <span class="je-acc-code">${i.code}</span>
        <span class="je-acc-name">${i.name}</span>
        <span class="je-acc-type">${N[i.type]||""}</span>
      </div>`).join(""),e.classList.remove("hidden")}),a.addEventListener("blur",()=>setTimeout(()=>e.classList.add("hidden"),200)))}window.ledgerAccSearch=a=>{const e=document.getElementById("ledger-acc-input"),t=document.getElementById("ledger-acc-dropdown");if(!e||!t)return;const n=a.trim().toLowerCase();if(!n){t.classList.add("hidden");return}const i=k.filter(o=>(o.code||"").toLowerCase().includes(n)||(o.name||"").toLowerCase().includes(n)).slice(0,30);t.innerHTML=i.map(o=>`
    <div class="je-acc-option" onmousedown="selectLedgerAcc('${o.id}','${o.code}','${(o.name||"").replace(/'/g,"\\'")}')">
      <span class="je-acc-code">${o.code}</span>
      <span class="je-acc-name">${o.name}</span>
      <span class="je-acc-type">${N[o.type]||""}</span>
    </div>`).join(""),t.classList.toggle("hidden",!i.length)};window.selectLedgerAcc=(a,e,t)=>{E=a;const n=document.getElementById("ledger-acc-input"),i=document.getElementById("ledger-acc-dropdown");n&&(n.value=`${e} — ${t}`),i&&i.classList.add("hidden")};window.loadLedger=async()=>{const a=document.getElementById("ledger-content");if(!a)return;if(!E){window.showToast?.("اختر حساباً أولاً","warn");return}const e=k.find(i=>i.id===E),t=document.getElementById("ledger-from")?.value,n=document.getElementById("ledger-to")?.value;a.innerHTML='<div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin"></i></div>';try{const i=P(w.journalEntries(),T("createdAt"),_(1e3)),p=(await F(i)).docs.map(d=>({id:d.id,...d.data()})).filter(d=>!d.status||d.status==="posted").sort((d,v)=>(d.date||"").localeCompare(v.date||"")),c=["asset","expense"].includes(e?.type),s=[];p.forEach(d=>{(d.lines||[]).forEach(v=>{if(v.accountId!==E&&v.accountCode!==e?.code)return;const y=d.date||"";t&&y<t||n&&y>n||s.push({date:y,entryNum:d.entryNumber||d.id.slice(0,8),desc:d.description||"",note:v.note||"",debit:v.debit||0,credit:v.credit||0})})}),s.sort((d,v)=>d.date.localeCompare(v.date)||d.entryNum.localeCompare(v.entryNum));const u=e?.openingBalance||0;let r=u,l=0,b=0;const m=s.map((d,v)=>{l+=d.debit,b+=d.credit,r+=c?d.debit-d.credit:d.credit-d.debit;const y=r>=0?c?"م":"د":c?"د":"م";return`
        <tr>
          <td class="mono" style="font-size:11px;color:var(--text-2)">${v+1}</td>
          <td class="mono" style="font-size:11px">${d.date}</td>
          <td style="color:var(--brand);font-size:11px;font-family:monospace">${d.entryNum}</td>
          <td style="font-size:12px">${d.desc}${d.note?` — <span style="color:var(--text-2)">${d.note}</span>`:""}</td>
          <td style="text-align:right;font-family:monospace;color:${d.debit?"#818cf8":"var(--text-3)"};font-weight:${d.debit?"800":"400"}">
            ${d.debit?f(d.debit):"—"}
          </td>
          <td style="text-align:right;font-family:monospace;color:${d.credit?"#34d399":"var(--text-3)"};font-weight:${d.credit?"800":"400"}">
            ${d.credit?f(d.credit):"—"}
          </td>
          <td class="ledger-running ${r>=0?"running-dr":"running-cr"}" style="text-align:right">
            ${f(Math.abs(r))} ${y}
          </td>
        </tr>`}),x=r;a.innerHTML=`
      <div class="ledger-header">
        <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:10px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i class="fas fa-book" style="color:#fff;font-size:18px"></i>
        </div>
        <div class="ledger-acc-info">
          <h4>${e?.code||""} — ${e?.name||""}</h4>
          <p>دفتر الأستاذ | ${t||"—"} إلى ${n||"—"} | الحركات المرحّلة فقط</p>
        </div>
      </div>

      <div class="ledger-summary">
        <div class="ledger-sum-card">
          <div class="ledger-sum-label">إجمالي المدين</div>
          <div class="ledger-sum-val" style="color:#818cf8">${f(l)}</div>
        </div>
        <div class="ledger-sum-card">
          <div class="ledger-sum-label">إجمالي الدائن</div>
          <div class="ledger-sum-val" style="color:#34d399">${f(b)}</div>
        </div>
        <div class="ledger-sum-card">
          <div class="ledger-sum-label">الرصيد الختامي</div>
          <div class="ledger-sum-val" style="color:${x>=0?"#10b981":"#ef4444"}">
            ${f(Math.abs(x))} ${x>=0?c?"مدين":"دائن":c?"دائن":"مدين"}
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
              <td style="text-align:right;font-weight:800;padding:8px 12px">${f(u)}</td>
            </tr>
            ${m.join("")||'<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-2)">لا توجد حركات في هذه الفترة</td></tr>'}
          </tbody>
        </table>
      </div>`}catch(i){a.innerHTML=`<div class="alert bad" style="margin:14px">${i.message}</div>`}};window.printLedger=()=>window.print();function G(){document.addEventListener("click",a=>{!a.target.closest(".je-acc-search-wrap")&&!a.target.closest(".je-acc-dropdown")&&document.querySelectorAll(".je-acc-dropdown").forEach(e=>e.classList.add("hidden"))})}export{ee as render};
