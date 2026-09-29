const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/balance-sync-C4aXi9zo.js","assets/index-3Bsn2yrt.js","assets/index-Dq7oGj9k.css"])))=>i.map(i=>d[i]);
import{g as H,a as S,s as W,t as k,h as oe,f as v,i as ne,Q as ie,e as K,_ as T,d as E,C as I}from"./index-3Bsn2yrt.js";import{orderBy as R,query as Z,limit as V,getDocs as Q,getDoc as F}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let g=[],$=[],z=null,U={};async function ve(t,e){window.switchTab=de,t.innerHTML=re(),ce(),$=await H(S.chartOfAccounts(),[R("code")]),z=await A(),switchTab("log"),setTimeout(()=>{const a=document.getElementById("je-search");if(a){a.oninput=null;const o=window.debounce?window.debounce(n=>filterJETable(n.target.value),300):n=>filterJETable(n.target.value);a.addEventListener("input",o)}},100)}function re(){return`
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
        <input type="date" id="je-from" value="${W()}" onchange="loadJournalEntries()" />
      </div>
      <div class="je-filter-group">
        <label>إلى</label>
        <input type="date" id="je-to" value="${k()}" onchange="loadJournalEntries()" />
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
        <input type="date" id="ledger-from" value="${W()}" />
      </div>
      <div class="je-filter-group">
        <label>إلى</label>
        <input type="date" id="ledger-to" value="${k()}" />
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
          <input type="date" id="je-date" class="input" value="${k()}" />
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
  `}function de(t){["log","ledger"].forEach(e=>{document.getElementById(`tab-${e}`)?.classList.toggle("active",e===t),document.getElementById(`panel-${e}`)?.classList.toggle("hidden",e!==t)}),t==="log"&&loadJournalEntries(),t==="ledger"&&se()}async function A(){try{const t=Z(S.journalEntries(),R("entryNumber","desc"),V(1)),e=await Q(t);if(!e.empty){const a=e.docs[0].data().entryNumber||"",o=parseInt(a.replace(/\D/g,""))||0;return`JE-${new Date().getFullYear()}-${String(o+1).padStart(4,"0")}`}}catch{}return`JE-${new Date().getFullYear()}-0001`}let L=[];window.loadJournalEntries=async(t=!1)=>{const e=document.getElementById("je-tbody");if(e){e.innerHTML=`<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2)">
    <i class="fas fa-spinner fa-spin"></i> جارٍ التحميل...
  </td></tr>`;try{const a=document.getElementById("je-from")?.value,o=document.getElementById("je-to")?.value,n=document.getElementById("je-type-filter")?.value,i=document.getElementById("je-status-filter")?.value;t===!0&&oe();let d=await H(S.journalEntries(),[R("createdAt","desc"),V(500)]);d.sort((r,b)=>(b.date||"").localeCompare(r.date||"")),a&&(d=d.filter(r=>(r.date||"")>=a)),o&&(d=d.filter(r=>(r.date||"")<=o)),n&&(d=d.filter(r=>r.sourceType===n)),i&&(d=d.filter(r=>(r.status||"posted")===i)),L=d,O(d);const u=d.reduce((r,b)=>{const m=parseFloat(b.totalDebit||0)||0,x=(b.lines||[]).reduce((s,h)=>s+(parseFloat(h.debit||0)||0),0);return r+Math.max(m,x)},0),f=d.reduce((r,b)=>{const m=parseFloat(b.totalCredit||0)||0,x=(b.lines||[]).reduce((s,h)=>s+(parseFloat(h.credit||0)||0),0);return r+Math.max(m,x)},0),c=d.filter(r=>r.status==="posted").length,p=Math.abs(u-f)<.01;document.getElementById("kpi-total-dr").textContent=v(u),document.getElementById("kpi-total-cr").textContent=v(f),document.getElementById("kpi-balance").textContent=p?"✓ متوازن":v(Math.abs(u-f)),document.getElementById("kpi-count").textContent=d.length,document.getElementById("kpi-posted").textContent=c}catch(a){e.innerHTML=`<tr><td colspan="9"><div class="alert bad" style="margin:8px">${a.message}</div></td></tr>`}}};function O(t){const e=document.getElementById("je-tbody");if(!e)return;if(!t.length){e.innerHTML='<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-2)">لا توجد قيود</td></tr>';return}const a={manual:"يدوي",salesInvoice:"مبيعات",purchaseInvoice:"مشتريات",salesReturn:"مردود بيع",purchaseReturn:"مردود شراء",reversing:"عكسي",pos:"POS",salesCOGS:"تكلفة البضاعة",cogs:"تكلفة مبيعات",receipt:"سند قبض",stockTransfer:"تحويل مخزون",physical_count:"جرد"},o={manual:"manual",salesInvoice:"salesInvoice",purchaseInvoice:"purchaseInvoice",salesReturn:"salesReturn",purchaseReturn:"purchaseReturn",reversing:"reversing",pos:"pos",stockTransfer:"stockTransfer",salesCOGS:"salesCOGS",cogs:"salesCOGS",receipt:"receipt",physical_count:"stockTransfer"};e.innerHTML=t.map(n=>{const i=n.status||"posted",d=i==="posted",u=n.isReversed,f=n.sourceType||"manual",c=o[f]||"manual",p=Math.max(parseFloat(n.totalDebit||0)||0,(n.lines||[]).reduce((b,m)=>b+(parseFloat(m.debit||0)||0),0)),r=Math.max(parseFloat(n.totalCredit||0)||0,(n.lines||[]).reduce((b,m)=>b+(parseFloat(m.credit||0)||0),0));return`<tr class="status-${i} je-row-${c}" onclick="viewJEEntry('${n.id}')">
      <td class="mono" style="font-size:11px;color:var(--text-2);white-space:nowrap">${n.date||""}</td>
      <td class="mono" style="color:var(--brand);font-weight:900;font-size:12px;white-space:nowrap">${n.entryNumber&&n.entryNumber!=="undefined"?n.entryNumber:n.code||"JE-"+n.id.slice(-6).toUpperCase()}</td>
      <td style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-1);font-size:12px" title="${(n.description||"").replace(/"/g,"&quot;")}">${n.description||"—"}</td>
      <td><span class="badge-type btype-${c}">${a[f]||f}</span></td>
      <td class="mono" style="text-align:right;color:#a5b4fc;font-weight:700;font-size:13px">${v(p)}</td>
      <td class="mono" style="text-align:right;color:#6ee7b7;font-weight:700;font-size:13px">${v(r)}</td>
      <td style="white-space:nowrap">
        ${u?'<span class="badge-reversed">معكوس</span>':d?'<span class="badge-posted">مرحّل</span>':'<span class="badge-draft">مسودة</span>'}
      </td>
      <td style="font-size:11px;color:var(--text-2)">${n.createdByName||"—"}</td>
      <td onclick="event.stopPropagation()" style="white-space:nowrap">
        <div style="display:flex;gap:5px;justify-content:flex-end;align-items:center">
          <button class="je-row-action info" title="طباعة سند القيد" onclick="printSingleJournalVoucher('${n.id}')">
            <i class="fas fa-print"></i>
          </button>
          <button class="je-row-action warning" title="نسخ وتكرار القيد لشهر جديد" onclick="duplicateEntry('${n.id}')">
            <i class="fas fa-copy"></i>
          </button>
          ${u?"":`
            <button class="je-row-action" title="تعديل القيد" onclick="openJournalModal('${n.id}')">
              <i class="fas fa-pen"></i>
            </button>`}
          ${!d&&!u?`
            <button class="je-row-action success" title="ترحيل القيد" onclick="postEntry('${n.id}')">
              <i class="fas fa-check"></i>
            </button>`:""}
          ${d&&!u?`
            <button class="je-row-action danger" title="عكس القيد" onclick="reverseEntry('${n.id}','${(n.entryNumber||"").replace(/'/g,"\\'")}')">
              <i class="fas fa-undo"></i>
            </button>`:""}
        </div>
      </td>
    </tr>`}).join("")}window.filterJETable=t=>{const e=t.trim().toLowerCase();if(!e){O(L);return}O(L.filter(a=>(a.entryNumber||"").toLowerCase().includes(e)||(a.code||"").toLowerCase().includes(e)||(a.description||"").toLowerCase().includes(e)))};window.openJournalModal=async(t="")=>{g=[],U={},document.getElementById("je-form-error").classList.add("hidden"),await X(),loadCustomJETemplatesDropdown();const e=document.getElementById("je-cost-center");if(t&&typeof t=="string"){const a=L.find(o=>o.id===t);if(!a)return;document.getElementById("je-edit-id").value=a.id,document.getElementById("je-desc").value=a.description||"",document.getElementById("je-ref").value=a.reference||"",document.getElementById("je-date").value=a.date||k(),e&&(e.value=a.costCenterId||""),document.getElementById("je-modal-title").textContent=`تعديل القيد: ${a.entryNumber||""}`,document.getElementById("je-entry-num-label").textContent=`رقم القيد: ${a.entryNumber||""}`,z=a.entryNumber,a.lines&&a.lines.length&&(g=a.lines.map(o=>({accountId:o.accountId||"",accountCode:o.accountCode||"",accountName:o.accountName||"",accountType:o.accountType||"",note:o.note||"",debit:parseFloat(o.debit)||0,credit:parseFloat(o.credit)||0,costCenterId:o.costCenterId||null,serviceProvider:o.serviceProvider||"",taxNumber:o.taxNumber||"",invoiceRef:o.invoiceRef||""}))),N(),C()}else{document.getElementById("je-edit-id").value="",document.getElementById("je-desc").value="",document.getElementById("je-ref").value="",document.getElementById("je-date").value=k(),e&&(e.value=""),document.getElementById("je-modal-title").textContent="قيد يدوي جديد";const a=await A();z=a,document.getElementById("je-entry-num-label").textContent=`رقم القيد: ${a}`,addJELine(),addJELine()}openModal("journal-modal")};let _=[];async function X(){const t=document.getElementById("je-cost-center");if(t)try{_=(await H(S.costCenters()).catch(()=>[])).sort((a,o)=>(a.code||"").localeCompare(o.code||"")),t.innerHTML='<option value="">بدون مركز تكلفة</option>'+_.map(a=>`<option value="${a.id}">${a.code||""} — ${a.name}</option>`).join("")}catch{}}function J(){const t=document.getElementById("je-lines-tbody");if(!t)return;t.querySelectorAll("tr[data-line]").forEach(a=>{const o=parseInt(a.getAttribute("data-line"),10);if(isNaN(o)||!g[o])return;const n=a.querySelector(".je-note-input"),i=a.querySelector("input[placeholder*='مورد الخدمة']"),d=a.querySelector("input[placeholder*='الرقم الضريبي']"),u=a.querySelector("input[placeholder*='رقم الفاتورة']"),f=a.querySelectorAll(".je-amt-input");if(n&&(g[o].note=n.value),i&&(g[o].serviceProvider=i.value.trim()),d&&(g[o].taxNumber=d.value.trim()),u&&(g[o].invoiceRef=u.value.trim()),f.length>=2){const c=parseFloat(f[0].value)||0,p=parseFloat(f[1].value)||0;g[o].debit=c,g[o].credit=p}})}window.addJELine=()=>{J(),g.push({accountId:"",accountCode:"",accountName:"",accountType:"",note:"",debit:0,credit:0,serviceProvider:"",taxNumber:"",invoiceRef:""}),N(),C()};function N(){const t=document.getElementById("je-lines-tbody");t&&(t.innerHTML=g.map((e,a)=>`
    <tr data-line="${a}" style="border-bottom:1px solid rgba(255,255,255,.03)">
      <td style="text-align:center;color:var(--text-2);font-size:11px;width:32px">${a+1}</td>

      <!-- Account Search Cell -->
      <td style="position:relative;padding:4px 6px;">
        <div class="je-acc-search-wrap" style="width:100%">
          <i class="fas fa-search" style="font-size:9px;color:var(--text-3);flex-shrink:0"></i>
          <input type="text" class="je-acc-input" id="acc-search-${a}"
                 placeholder="اكتب كود أو اسم الحساب... [F8 للبحث]"
                 value="${e.accountCode?e.accountCode+" — "+e.accountName:""}"
                 oninput="accLineSearch(${a}, this.value)"
                 onfocus="showAccDropdown(${a})"
                 onblur="hideAccDropdown(${a})"
                 autocomplete="off" />
          <div class="je-acc-dropdown hidden" id="acc-drop-${a}"></div>
        </div>
        ${e.accountId?`<div style="font-size:9px;color:var(--text-3);margin-top:1px;padding:0 4px">${e.accountType||""}</div>`:""}
      </td>

      <!-- Note & Tax info -->
      <td style="padding:4px 6px; display:flex; flex-direction:column; gap:4px;">
        <input type="text" class="je-note-input" placeholder="البيان الفرعي..."
               value="${e.note||""}" oninput="jLines[${a}].note=this.value" />
        <div style="display:flex; gap:4px; align-items:center;">
          <input type="text" class="je-sub-input" placeholder="مورد الخدمة..."
                 style="font-size:10px; padding:2px 4px; border:1px solid var(--border-soft); border-radius:4px; background:var(--bg-1); color:var(--text-0); width:120px;"
                 value="${e.serviceProvider||""}" oninput="jLines[${a}].serviceProvider=this.value" />
          <input type="text" class="je-sub-input" placeholder="الرقم الضريبي..."
                 style="font-size:10px; padding:2px 4px; border:1px solid var(--border-soft); border-radius:4px; background:var(--bg-1); color:var(--text-0); width:120px;"
                 value="${e.taxNumber||""}" oninput="jLines[${a}].taxNumber=this.value" />
          <input type="text" class="je-sub-input" placeholder="رقم الفاتورة..."
                 style="font-size:10px; padding:2px 4px; border:1px solid var(--border-soft); border-radius:4px; background:var(--bg-1); color:var(--text-0); width:100px;"
                 value="${e.invoiceRef||""}" oninput="jLines[${a}].invoiceRef=this.value" />
        </div>
      </td>

      <!-- Debit -->
      <td style="padding:4px 6px;">
        <input type="number" class="je-amt-input ${e.debit?"has-val":""}"
               placeholder="0.00" min="0" step="0.01"
               value="${e.debit||""}"
               oninput="updateJEAmt(${a},'debit',this)"
               onfocus="if(this.value=='0')this.value=''"
               onblur="if(!this.value)jLines[${a}].debit=0;updateJETotals()" />
      </td>

      <!-- Credit -->
      <td style="padding:4px 6px;">
        <input type="number" class="je-amt-input ${e.credit?"has-val-cr":""}"
               placeholder="0.00" min="0" step="0.01"
               value="${e.credit||""}"
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
  `).join(""))}const P={asset:"أصول",liability:"خصوم",equity:"ملكية",revenue:"إيرادات",expense:"مصروفات"};window.accLineSearch=(t,e)=>{const a=document.getElementById(`acc-drop-${t}`);if(!a)return;const o=e.trim().toLowerCase();if(!o){a.classList.add("hidden");return}const n=$.filter(i=>i.isActive!==!1).filter(i=>(i.code||"").toLowerCase().includes(o)||(i.name||"").toLowerCase().includes(o)).slice(0,30);n.length?a.innerHTML=n.map(i=>`
      <div class="je-acc-option" onmousedown="selectAccLine(${t},'${i.id}','${i.code}','${(i.name||"").replace(/'/g,"\\'")}','${i.type||""}')">
        <span class="je-acc-code">${i.code}</span>
        <span class="je-acc-name">${i.name}</span>
        <span class="je-acc-type">${P[i.type]||i.type||""}</span>
        ${i.nodeType==="header"?'<span style="font-size:9px;color:#f59e0b;margin-right:2px">رئيسي</span>':""}
      </div>`).join(""):a.innerHTML='<div class="je-acc-option" style="color:var(--text-2)">لا توجد نتائج</div>',a.classList.remove("hidden")};window.selectAccLine=(t,e,a,o,n)=>{J(),g[t].accountId=e,g[t].accountCode=a,g[t].accountName=o,g[t].accountType=P[n]||n;const i=document.getElementById(`acc-search-${t}`),d=document.getElementById(`acc-drop-${t}`);if(i&&(i.value=`${a} — ${o}`),d&&d.classList.add("hidden"),!g[t].debit&&!g[t].credit){const u=["asset","expense"].includes(n),f=g.reduce((r,b)=>r+(b.debit||0),0),c=g.reduce((r,b)=>r+(b.credit||0),0),p=Math.abs(f-c);p>0&&(u&&f<c&&(g[t].debit=p),!u&&c<f&&(g[t].credit=p),N())}C()};window.showAccDropdown=t=>{const e=document.getElementById(`acc-search-${t}`);e?.value&&accLineSearch(t,e.value)};window.hideAccDropdown=t=>{setTimeout(()=>document.getElementById(`acc-drop-${t}`)?.classList.add("hidden"),200)};window.updateJEAmt=(t,e,a)=>{const o=parseFloat(a.value)||0;g[t][e]=o,a.className="je-amt-input "+(o>0?e==="debit"?"has-val":"has-val-cr":""),C()};window.removeJELine=t=>{J(),g.splice(t,1),N(),C()};function C(){const t=g.reduce((u,f)=>u+(f.debit||0),0),e=g.reduce((u,f)=>u+(f.credit||0),0),a=Math.abs(t-e),o=a<.01,n=u=>u.toLocaleString("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2}),i=(u,f)=>{const c=document.getElementById(u);c&&(c.textContent=f)};i("je-sum-debit",`${n(t)} ر.س`),i("je-sum-credit",`${n(e)} ر.س`),i("meter-dr",n(t)),i("meter-cr",n(e));const d=document.getElementById("meter-status");d&&(t===0&&e===0?(d.className="je-balance-status balanced",d.innerHTML='<i class="fas fa-balance-scale"></i> أدخل مبالغ القيد'):o?(d.className="je-balance-status balanced",d.innerHTML='<i class="fas fa-check-circle"></i> قيد متوازن ✓'):(d.className="je-balance-status unbalanced",d.innerHTML=`<i class="fas fa-exclamation-triangle"></i> غير متوازن — الفرق: ${n(a)} ر.س`))}window.saveJournal=async(t="posted")=>{J();const e=document.getElementById("je-form-error");e.classList.add("hidden");const a=document.getElementById("je-date").value,o=document.getElementById("je-desc").value.trim(),n=document.getElementById("je-ref").value.trim();if(!a){e.textContent="التاريخ مطلوب",e.classList.remove("hidden");return}if(!o){e.textContent="البيان مطلوب",e.classList.remove("hidden");return}const i=g.filter(r=>r.accountId&&(r.debit>0||r.credit>0));if(i.length<2){e.textContent="يجب أن يحتوي القيد على سطرين على الأقل",e.classList.remove("hidden");return}const d=i.reduce((r,b)=>r+(b.debit||0),0),u=i.reduce((r,b)=>r+(b.credit||0),0);if(Math.abs(d-u)>.01){e.textContent=`⚖️ القيد غير متوازن — المدين (${v(d)}) ≠ الدائن (${v(u)})`,e.classList.remove("hidden");return}if(i.filter(r=>!r.accountId&&(r.debit>0||r.credit>0)).length){e.textContent="يوجد سطور بمبالغ ولكن بدون حساب محدد",e.classList.remove("hidden");return}const c=document.getElementById("save-draft-btn"),p=document.getElementById("save-post-btn");c.disabled=p.disabled=!0;try{if(await ne(a)){e.textContent=`⚠️ لا يمكن حفظ القيد لأن تاريخه (${a}) يقع في فترة محاسبية مغلقة ومقفلة نهائياً.`,e.classList.remove("hidden"),c.disabled=p.disabled=!1;return}const r=document.getElementById("je-cost-center"),b=r?.value||null,m=r&&b&&_&&_.find(s=>s.id===b)?.name||null;i.forEach(s=>{s.costCenterId||(s.costCenterId=b)});const x=document.getElementById("je-edit-id").value;if(x)await ie(x,{date:a,description:o,reference:n,costCenterId:b,costCenterName:m,lines:i,status:t}),window.showToast?.(`تم تعديل و${t==="posted"?"ترحيل":"حفظ"} القيد بنجاح`,"success");else{const s=z||await A();await K({date:a,description:o,reference:n,sourceType:"manual",entryNumber:s,status:t,costCenterId:b,costCenterName:m,lines:i}),window.showToast?.(`تم ${t==="posted"?"ترحيل":"حفظ"} القيد ${s}`,"success")}t==="posted"&&q(i).catch(()=>{}),closeModal("journal-modal"),g=[],z=null,await loadJournalEntries()}catch(r){e.textContent=r.message,e.classList.remove("hidden")}finally{c.disabled=p.disabled=!1}};async function q(t=[]){if(!(!t||!t.length))try{const{recalculateSupplierBalance:e,recalculateCustomerBalance:a}=await T(async()=>{const{recalculateSupplierBalance:p,recalculateCustomerBalance:r}=await import("./balance-sync-C4aXi9zo.js");return{recalculateSupplierBalance:p,recalculateCustomerBalance:r}},__vite__mapDeps([0,1,2])),{getAll:o,COLS:n}=await T(async()=>{const{getAll:p,COLS:r}=await import("./index-3Bsn2yrt.js").then(b=>b.T);return{getAll:p,COLS:r}},__vite__mapDeps([1,2])),[i,d,u]=await Promise.all([o(n.suppliers()).catch(()=>[]),o(n.customers()).catch(()=>[]),o(n.chartOfAccounts()).catch(()=>[])]),f=new Set,c=new Set;t.forEach(p=>{const r=p.accountId,b=p.accountCode,m=(p.accountName||"").trim().toLowerCase(),x=(u||[]).find(y=>y.id===r||y.code===b||y.name&&y.name.trim().toLowerCase()===m);x&&x.sourceEntityId&&(x.sourceModule==="suppliers"||(i||[]).some(y=>y.id===x.sourceEntityId)?f.add(x.sourceEntityId):(x.sourceModule==="customers"||(d||[]).some(y=>y.id===x.sourceEntityId))&&c.add(x.sourceEntityId));const s=(i||[]).find(y=>{const w=(y.name||"").trim().toLowerCase();return w&&(w===m||m.includes(w)||w.includes(m))});s&&f.add(s.id);const h=(d||[]).find(y=>{const w=(y.name||"").trim().toLowerCase();return w&&(w===m||m.includes(w)||w.includes(m))});h&&c.add(h.id)});for(const p of f)await e(p).catch(()=>{});for(const p of c)await a(p).catch(()=>{})}catch(e){console.warn("[JournalEntries] Error auto-syncing balances for journal lines:",e)}}window.postEntry=async t=>{if(await window.showConfirm?.("ترحيل هذا القيد؟ لن يمكن تعديله بعد الترحيل.","ترحيل القيد"))try{const{updateDoc:e,getDoc:a,doc:o}=await T(async()=>{const{updateDoc:i,getDoc:d,doc:u}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{updateDoc:i,getDoc:d,doc:u}},[]),n=await a(o(E,`companies/${I}/journalEntries`,t));await e(o(E,`companies/${I}/journalEntries`,t),{status:"posted"}),n.exists()&&q(n.data().lines||[]).catch(()=>{}),window.showToast?.("تم ترحيل القيد","success"),await loadJournalEntries()}catch(e){window.showToast?.(e.message,"error")}};window.reverseEntry=async(t,e)=>{if(await window.showConfirm?.(`سيُنشأ قيد عكسي لـ "${e}" — يعكس جميع المدينات والدائن. هل تريد المتابعة؟`,"قيد عكسي (Reversing Entry)"))try{const{getDoc:a,doc:o}=await T(async()=>{const{getDoc:p,doc:r}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:p,doc:r}},[]),n=await a(o(E,`companies/${I}/journalEntries`,t));if(!n.exists())throw new Error("القيد غير موجود");const i=n.data(),d=(i.lines||[]).map(p=>({...p,debit:p.credit||0,credit:p.debit||0,note:`عكس: ${p.note||p.accountName}`})),{updateDoc:u,doc:f}=await T(async()=>{const{updateDoc:p,doc:r}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{updateDoc:p,doc:r}},[]),c=await A();await K({date:k(),description:`قيد عكسي لـ ${i.entryNumber||e}`,sourceType:"reversing",entryNumber:c,status:"posted",reversedFrom:t,lines:d}),await u(f(E,`companies/${I}/journalEntries`,t),{isReversed:!0,reversedBy:c}),q(d).catch(()=>{}),window.showToast?.(`تم إنشاء القيد العكسي ${c}`,"success"),await loadJournalEntries()}catch(a){console.error(a),window.showToast?.(a.message,"error")}};window.duplicateEntry=async t=>{if(t)try{let e=L.find(n=>n.id===t);if(!e){const{getDoc:n,doc:i}=await T(async()=>{const{getDoc:u,doc:f}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:u,doc:f}},[]),d=await n(i(E,`companies/${I}/journalEntries`,t));d.exists()&&(e={id:d.id,...d.data()})}if(!e){window.showToast?.("تعذر العثور على القيد المطلوب نسخه","error");return}g=[],U={},document.getElementById("je-form-error")?.classList.add("hidden"),await X(),loadCustomJETemplatesDropdown();const a=document.getElementById("je-cost-center");document.getElementById("je-edit-id").value="",document.getElementById("je-desc").value=e.description||"",document.getElementById("je-ref").value=e.reference?`${e.reference} (مكرر)`:`مكرر من ${e.entryNumber||""}`,document.getElementById("je-date").value=k(),a&&(a.value=e.costCenterId||"");const o=await A();z=o,document.getElementById("je-modal-title").textContent=`نسخ وتكرار قيد: ${e.entryNumber||""}`,document.getElementById("je-entry-num-label").textContent=`رقم القيد الجديد: ${o}`,e.lines&&e.lines.length?g=e.lines.map(n=>({accountId:n.accountId||"",accountCode:n.accountCode||"",accountName:n.accountName||"",accountType:n.accountType||"",note:n.note||"",debit:parseFloat(n.debit)||0,credit:parseFloat(n.credit)||0,costCenterId:n.costCenterId||null,serviceProvider:n.serviceProvider||"",taxNumber:n.taxNumber||"",invoiceRef:n.invoiceRef||""})):(addJELine(),addJELine()),N(),C(),openModal("journal-modal"),window.showToast?.(`تم نسخ سطور القيد ${e.entryNumber||""} بنجاح. يمكنك تعديل المبالغ والتاريخ وترحيله فوراً`,"info")}catch(e){console.error("Duplicate Entry error:",e),window.showToast?.("حدث خطأ أثناء نسخ القيد: "+e.message,"error")}};window.applyJETemplate=t=>{if(!$||!$.length)return;g=[],U={};const e=(o,n)=>$.find(i=>i.code&&i.code.startsWith(o)||i.name&&i.name.includes(n))||$.find(i=>i.name&&i.name.includes(n))||null,a=new Date().toLocaleDateString("ar-SA",{month:"long",year:"numeric"});if(t==="depreciation"){document.getElementById("je-desc").value=`قيد إهلاك الأصول الثابتة لشهر ${a}`,document.getElementById("je-ref").value=`إهلاك دوري - ${k().slice(0,7)}`;const o=e("5-6-1","إهلاك السيارات")||e("5-6","إهلاك"),n=e("1-2-1-2","مجمع إهلاك السيارات")||e("1-2-1","مجمع إهلاك"),i=e("5-6-2","إهلاك المعدات"),d=e("1-2-2-2","مجمع إهلاك المعدات");o&&n&&(g.push({accountId:o.id,accountCode:o.code,accountName:o.name,accountType:o.accountType||o.type||"expense",note:"مصروف إهلاك السيارات والمركبات",debit:0,credit:0}),g.push({accountId:n.id,accountCode:n.code,accountName:n.name,accountType:n.accountType||n.type||"asset",note:"مجمع إهلاك السيارات والمركبات",debit:0,credit:0})),i&&d&&(g.push({accountId:i.id,accountCode:i.code,accountName:i.name,accountType:i.accountType||i.type||"expense",note:"مصروف إهلاك المعدات والآلات",debit:0,credit:0}),g.push({accountId:d.id,accountCode:d.code,accountName:d.name,accountType:d.accountType||d.type||"asset",note:"مجمع إهلاك المعدات والآلات",debit:0,credit:0})),g.length||(addJELine(),addJELine()),window.showToast?.("تم تجهيز نموذج قيد إهلاك الأصول. أدخل مبالغ الإهلاك الدورية","info")}else if(t==="rent"){document.getElementById("je-desc").value=`قيد استحقاق مصروف الإيجار لشهر ${a}`,document.getElementById("je-ref").value=`استحقاق إيجار - ${k().slice(0,7)}`;const o=e("5-4-1-1","ايجار المستودع")||e("5-4-1","الإيجار"),n=e("1-1-3-1","ايجار مدفوع مقدما")||e("2-1-4-1","ايجار سكن مستحق")||e("2-1-4","مستحقة");o&&g.push({accountId:o.id,accountCode:o.code,accountName:o.name,accountType:o.accountType||o.type||"expense",note:"إثبات استحقاق مصروف الإيجار الشهري",debit:0,credit:0}),n&&g.push({accountId:n.id,accountCode:n.code,accountName:n.name,accountType:n.accountType||n.type||"liability",note:"تسوية الإيجار (المستحق / المدفوع مقدماً)",debit:0,credit:0}),g.length<2&&addJELine(),window.showToast?.("تم تجهيز نموذج استحقاق الإيجار. حدد المبلغ والمراكز","info")}else if(t==="payroll"){document.getElementById("je-desc").value=`قيد استحقاق مسير رواتب الموظفين والمناديب لشهر ${a}`,document.getElementById("je-ref").value=`مسير رواتب - ${k().slice(0,7)}`;const o=e("5-2-6","رواتب واجور")||e("5-2-1","رواتب")||e("5-2","الرواتب"),n=e("2-1-5","مستحقات الموظفين")||e("2-1-4","مستحقة");o&&g.push({accountId:o.id,accountCode:o.code,accountName:o.name,accountType:o.accountType||o.type||"expense",note:"إجمالي استحقاق الرواتب والأجور والبدلات",debit:0,credit:0}),n&&g.push({accountId:n.id,accountCode:n.code,accountName:n.name,accountType:n.accountType||n.type||"liability",note:"مستحقات الرواتب للموظفين والمناديب",debit:0,credit:0}),g.length<2&&addJELine(),window.showToast?.("تم تجهيز نموذج استحقاق الرواتب","info")}else if(t==="prepaid"){document.getElementById("je-desc").value=`قيد إطفاء مصروفات وتأمينات مدفوعة مقدماً لشهر ${a}`,document.getElementById("je-ref").value=`إطفاء دوري - ${k().slice(0,7)}`;const o=e("1-1-5-1","مصروفات مدفوعة مقدماً")||e("1-1-3","مدفوع مقدما"),n=e("5-4","تشغيلية")||e("5-1","مصروف");n&&g.push({accountId:n.id,accountCode:n.code,accountName:n.name,accountType:n.accountType||n.type||"expense",note:"مصروف الفترة المحمل من المدفوع مقدماً",debit:0,credit:0}),o&&g.push({accountId:o.id,accountCode:o.code,accountName:o.name,accountType:o.accountType||o.type||"asset",note:"إطفاء / تخفيض رصيد المصروفات المدفوعة مقدماً",debit:0,credit:0}),g.length<2&&addJELine(),window.showToast?.("تم تجهيز نموذج إطفاء المصروفات المدفوعة مقدماً","info")}N(),C()};window.saveCurrentAsCustomTemplate=()=>{J();const t=g.filter(o=>o.accountId);if(!t.length){window.showToast?.("يرجى اختيار حسابات في سطور القيد أولاً لحفظها كنموذج","warning");return}const e=document.getElementById("je-desc")?.value.trim()||"قيد دوري مخصص",a=prompt("أدخل اسماً لهذا النموذج المحاسبي (مثال: قيد إيجار ينبع الشهري):",e);if(!(!a||!a.trim()))try{const o=JSON.parse(localStorage.getItem("idham_je_custom_templates")||"[]"),n={id:"tpl_"+Date.now(),name:a.trim(),description:document.getElementById("je-desc")?.value.trim()||"",costCenterId:document.getElementById("je-cost-center")?.value||null,lines:t.map(i=>({accountId:i.accountId,accountCode:i.accountCode,accountName:i.accountName,accountType:i.accountType,note:i.note,debit:i.debit||0,credit:i.credit||0}))};o.push(n),localStorage.setItem("idham_je_custom_templates",JSON.stringify(o)),loadCustomJETemplatesDropdown(),window.showToast?.(`تم حفظ النموذج "${a}" بنجاح`,"success")}catch(o){console.error(o)}};window.loadCustomJETemplatesDropdown=()=>{const t=document.getElementById("je-custom-templates");if(t)try{const e=JSON.parse(localStorage.getItem("idham_je_custom_templates")||"[]");if(!e.length){t.style.display="none";return}t.style.display="inline-block",t.innerHTML='<option value="">📂 قوالبي المحفوظة ('+e.length+")</option>"+e.map(a=>`<option value="${a.id}">${a.name}</option>`).join("")}catch{t.style.display="none"}};window.applyCustomJETemplate=t=>{if(t)try{const a=JSON.parse(localStorage.getItem("idham_je_custom_templates")||"[]").find(o=>o.id===t);if(!a)return;if(a.description&&(document.getElementById("je-desc").value=a.description),a.costCenterId){const o=document.getElementById("je-cost-center");o&&(o.value=a.costCenterId)}g=(a.lines||[]).map(o=>({accountId:o.accountId,accountCode:o.accountCode,accountName:o.accountName,accountType:o.accountType,note:o.note,debit:o.debit||0,credit:o.credit||0})),N(),C(),window.showToast?.(`تم استدعاء نموذج "${a.name}"`,"info"),document.getElementById("je-custom-templates").value=""}catch(e){console.error(e)}};window.viewJEEntry=async t=>{const e=document.getElementById("je-detail-body");e.innerHTML='<div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin"></i></div>',openModal("je-detail-modal");try{const{getDoc:a,doc:o}=await T(async()=>{const{getDoc:c,doc:p}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:c,doc:p}},[]),n=await a(o(E,`companies/${I}/journalEntries`,t));if(!n.exists())throw new Error("القيد غير موجود");const i={id:n.id,...n.data()};document.getElementById("je-detail-title").textContent=`قيد: ${i.entryNumber||t.slice(0,8)}`;const u=(i.status||"posted")==="posted";e.innerHTML=`
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;padding:0 4px">
        <div style="background:var(--bg-1);border-radius:8px;padding:10px;border:1px solid var(--border-soft)">
          <div style="font-size:10px;color:var(--text-2);margin-bottom:3px">رقم القيد</div>
          <div style="font-weight:900;color:var(--brand);font-size:15px">${i.entryNumber&&i.entryNumber!=="undefined"?i.entryNumber:"JE-"+t.slice(-6).toUpperCase()}</div>
        </div>
        <div style="background:var(--bg-1);border-radius:8px;padding:10px;border:1px solid var(--border-soft)">
          <div style="font-size:10px;color:var(--text-2);margin-bottom:3px">التاريخ</div>
          <div style="font-weight:700">${i.date||"—"}</div>
        </div>
        <div style="background:var(--bg-1);border-radius:8px;padding:10px;border:1px solid var(--border-soft)">
          <div style="font-size:10px;color:var(--text-2);margin-bottom:3px">الحالة</div>
          <div>${u?'<span class="badge-posted">مرحّل</span>':'<span class="badge-draft">مسودة</span>'}</div>
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
          ${(i.lines||[]).map(c=>`
            <tr style="border-bottom:1px solid rgba(255,255,255,.04)">
              <td style="padding:8px 10px">
                <span style="font-family:monospace;font-size:11px;color:var(--brand)">${c.accountCode}</span>
                <span style="margin-right:6px">${c.accountName}</span>
              </td>
              <td style="padding:8px 10px;color:var(--text-2);font-size:12px">
                <div>${c.note||"—"}</div>
                ${c.serviceProvider||c.taxNumber||c.invoiceRef?`
                  <div style="font-size:10px;color:var(--text-3);margin-top:4px;background:rgba(255,255,255,0.02);padding:4px 6px;border-radius:4px;border:1px dashed var(--border-soft);display:inline-block;">
                    ${c.serviceProvider?`<span>👤 مورد الخدمة: <strong>${c.serviceProvider}</strong></span>`:""}
                    ${c.taxNumber?`<span style="margin-right:10px;">🏷️ الرقم الضريبي: <strong>${c.taxNumber}</strong></span>`:""}
                    ${c.invoiceRef?`<span style="margin-right:10px;">📄 فاتورة: <strong>${c.invoiceRef}</strong></span>`:""}
                  </div>
                `:""}
              </td>
              <td style="padding:8px 10px;text-align:right;font-family:monospace;font-weight:${c.debit?"800":"400"};color:${c.debit?"#818cf8":"var(--text-3)"}">
                ${c.debit?v(c.debit):"—"}
              </td>
              <td style="padding:8px 10px;text-align:right;font-family:monospace;font-weight:${c.credit?"800":"400"};color:${c.credit?"#34d399":"var(--text-3)"}">
                ${c.credit?v(c.credit):"—"}
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
    `;const f=document.getElementById("je-detail-footer");f&&(f.innerHTML=`
        <button class="btn btn-ghost" onclick="closeModal('je-detail-modal')">إغلاق</button>
        <button class="btn btn-secondary" onclick="printSingleJournalVoucher('${t}')">
          <i class="fas fa-print"></i> طباعة سند القيد
        </button>
        <button class="btn btn-primary" onclick="closeModal('je-detail-modal'); duplicateEntry('${t}')">
          <i class="fas fa-copy"></i> نسخ وتكرار القيد
        </button>
      `)}catch(a){e.innerHTML=`<div class="alert bad">${a.message}</div>`}};let M=null;function se(){const t=document.getElementById("ledger-acc-input"),e=document.getElementById("ledger-acc-dropdown");!t||!e||(t.addEventListener("input",()=>{const a=t.value.trim().toLowerCase();if(!a){e.classList.add("hidden");return}const o=$.filter(n=>(n.code||"").toLowerCase().includes(a)||(n.name||"").toLowerCase().includes(a)).slice(0,30);e.innerHTML=o.map(n=>`
      <div class="je-acc-option" onclick="selectLedgerAcc('${n.id}','${n.code}','${(n.name||"").replace(/'/g,"\\'")}')">
        <span class="je-acc-code">${n.code}</span>
        <span class="je-acc-name">${n.name}</span>
        <span class="je-acc-type">${P[n.type]||""}</span>
      </div>`).join(""),e.classList.remove("hidden")}),t.addEventListener("blur",()=>setTimeout(()=>e.classList.add("hidden"),200)))}window.ledgerAccSearch=t=>{const e=document.getElementById("ledger-acc-input"),a=document.getElementById("ledger-acc-dropdown");if(!e||!a)return;const o=t.trim().toLowerCase();if(!o){a.classList.add("hidden");return}const n=$.filter(i=>(i.code||"").toLowerCase().includes(o)||(i.name||"").toLowerCase().includes(o)).slice(0,30);a.innerHTML=n.map(i=>`
    <div class="je-acc-option" onmousedown="selectLedgerAcc('${i.id}','${i.code}','${(i.name||"").replace(/'/g,"\\'")}')">
      <span class="je-acc-code">${i.code}</span>
      <span class="je-acc-name">${i.name}</span>
      <span class="je-acc-type">${P[i.type]||""}</span>
    </div>`).join(""),a.classList.toggle("hidden",!n.length)};window.selectLedgerAcc=(t,e,a)=>{M=t;const o=document.getElementById("ledger-acc-input"),n=document.getElementById("ledger-acc-dropdown");o&&(o.value=`${e} — ${a}`),n&&n.classList.add("hidden")};window.loadLedger=async()=>{const t=document.getElementById("ledger-content");if(!t)return;if(!M){window.showToast?.("اختر حساباً أولاً","warn");return}const e=$.find(n=>n.id===M),a=document.getElementById("ledger-from")?.value,o=document.getElementById("ledger-to")?.value;t.innerHTML='<div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin"></i></div>';try{const n=Z(S.journalEntries(),R("createdAt"),V(1e3)),d=(await Q(n)).docs.map(s=>({id:s.id,...s.data()})).filter(s=>!s.status||s.status==="posted").sort((s,h)=>(s.date||"").localeCompare(h.date||"")),u=["asset","expense"].includes(e?.type),f=[];d.forEach(s=>{(s.lines||[]).forEach(h=>{if(h.accountId!==M&&h.accountCode!==e?.code)return;const y=s.date||"";a&&y<a||o&&y>o||f.push({date:y,entryNum:(w=>w.entryNumber&&w.entryNumber!=="undefined"?w.entryNumber:"JE-"+s.id.slice(-6).toUpperCase())(s),desc:s.description||"",note:h.note||"",debit:h.debit||0,credit:h.credit||0})})}),f.sort((s,h)=>s.date.localeCompare(h.date)||s.entryNum.localeCompare(h.entryNum));const c=e?.openingBalance||0;let p=c,r=0,b=0;const m=f.map((s,h)=>{r+=s.debit,b+=s.credit,p+=u?s.debit-s.credit:s.credit-s.debit;const y=p>=0?u?"م":"د":u?"د":"م";return`
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
        </tr>`}),x=p;t.innerHTML=`
      <div class="ledger-header">
        <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:10px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i class="fas fa-book" style="color:#fff;font-size:18px"></i>
        </div>
        <div class="ledger-acc-info">
          <h4>${e?.code||""} — ${e?.name||""}</h4>
          <p>دفتر الأستاذ | ${a||"—"} إلى ${o||"—"} | الحركات المرحّلة فقط</p>
        </div>
      </div>

      <div class="ledger-summary">
        <div class="ledger-sum-card">
          <div class="ledger-sum-label">إجمالي المدين</div>
          <div class="ledger-sum-val" style="color:#818cf8">${v(r)}</div>
        </div>
        <div class="ledger-sum-card">
          <div class="ledger-sum-label">إجمالي الدائن</div>
          <div class="ledger-sum-val" style="color:#34d399">${v(b)}</div>
        </div>
        <div class="ledger-sum-card">
          <div class="ledger-sum-label">الرصيد الختامي</div>
          <div class="ledger-sum-val" style="color:${x>=0?"#10b981":"#ef4444"}">
            ${v(Math.abs(x))} ${x>=0?u?"مدين":"دائن":u?"دائن":"مدين"}
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
              <td style="text-align:right;font-weight:800;padding:8px 12px">${v(c)}</td>
            </tr>
            ${m.join("")||'<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-2)">لا توجد حركات في هذه الفترة</td></tr>'}
          </tbody>
        </table>
      </div>`}catch(n){t.innerHTML=`<div class="alert bad" style="margin:14px">${n.message}</div>`}};window.printLedger=()=>window.print();function ce(){document.addEventListener("click",t=>{!t.target.closest(".je-acc-search-wrap")&&!t.target.closest(".je-acc-dropdown")&&document.querySelectorAll(".je-acc-dropdown").forEach(e=>e.classList.add("hidden"))})}async function ee(){let t={name:"شركة نظم الإمداد الحديثة",nameEn:"Modern Supply Systems Co.",crNumber:"4700123180",vatNumber:"312448150500003",phone:"0549141648",email:"Nuzmalamdad@gmail.com",address:"7480 — الشارع: عامر الشعبي — ينبع — 13315",logoUrl:""};try{const e=localStorage.getItem("idham_company");e&&Object.assign(t,JSON.parse(e))}catch{}try{const e=await F(fsDoc(E,`companies/${I}/settings`,"company"));if(e.exists()){const o=e.data();t.name=o.name||o.companyName||t.name,t.nameEn=o.nameEn||o.legalName||t.nameEn,t.crNumber=o.crNumber||o.cr||t.crNumber,t.vatNumber=o.vatNumber||o.vat||t.vatNumber,t.phone=o.phone||t.phone,t.email=o.email||t.email,t.address=o.address?o.city?`${o.address} — ${o.city}`:o.address:t.address}const a=await F(fsDoc(E,`companies/${I}/settings`,"logo"));a.exists()&&(t.logoUrl=a.data().dataUrl||a.data().logoUrl||t.logoUrl||"")}catch(e){console.warn("Failed to load company details for journal printing:",e)}return t}function le(t,e){const a={manual:"يدوي",salesInvoice:"مبيعات",purchaseInvoice:"مشتريات",salesReturn:"مردود بيع",purchaseReturn:"مردود شراء",reversing:"عكسي",pos:"POS",stockTransfer:"تحويل مخزني",salesCOGS:"تكلفة مبيعات"},o=e.name||"شركة نظم الإمداد الحديثة",n=e.nameEn||"Modern Supply Systems Co.",i=e.address||"7480 — الشارع: عامر الشعبي — ينبع — 13315",d=e.phone||"0549141648";e.email;const u=e.vatNumber||"312448150500003",f=e.crNumber||"4700123180",c=e.logoUrl||"",p=(t.lines||[]).reduce((l,j)=>l+(j.debit||0),0),r=(t.lines||[]).reduce((l,j)=>l+(j.credit||0),0),b=(t.status||"posted")==="posted",m=Math.abs(p-r)<.01,x=(t.lines||[]).filter(l=>l.serviceProvider||l.taxNumber||l.invoiceRef),s=x.reduce((l,j)=>l||(j.serviceProvider||"").trim(),"")||(t.supplierName||t.vendorName||t.entityName||"").trim(),h=x.reduce((l,j)=>l||(j.taxNumber||"").trim(),"")||(t.taxNumber||t.supplierVatNumber||"").trim(),y=x.reduce((l,j)=>l||(j.invoiceRef||"").trim(),"")||(t.taxInvoiceNumber||t.reference||"").trim(),w=(t.lines||[]).find(l=>(l.debit||0)>0&&(l.accountCode==="2-1-1-2"||l.accountCode==="2-1-3-2"||l.accountCode==="2-2-1-2"||l.accountCode==="2-2-2"||l.accountName&&(l.accountName.includes("المدخلات")||l.accountName.includes("القيمة المضافة")))),B=w&&w.debit||0,G=(t.lines||[]).find(l=>l!==w&&(l.debit||0)>0),Y=G?G.debit||0:B>0?Math.round(B/.15*100)/100:p-B,te=p,D=!!(s||h||y||w);return`
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>${D?"سند قيد ضريبي وفاتورة معتمدة":"سند قيد محاسبي"} — ${t.entryNumber||t.id}</title>
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
          ${c?`<img src="${c}" style="height:64px;width:64px;object-fit:contain;background:#fff;border-radius:8px;padding:4px;box-shadow:0 2px 4px rgba(0,0,0,0.1);" />`:'<div style="width:60px;height:60px;background:rgba(255,255,255,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:28px;">🏢</div>'}
          <div>
            <div style="font-size:19px;font-weight:900;color:#fff !important;line-height:1.2;">${o}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.9) !important;margin-top:2px;">${n} | 📍 ${i}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.95) !important;margin-top:4px;display:flex;flex-wrap:wrap;gap:14px;">
              ${`<span>📞 الهاتف: <strong>${d}</strong></span>`}
              ${`<span>🧾 الرقم الضريبي: <strong>${u}</strong></span>`}
              ${`<span>📋 سجل تجاري: <strong>${f}</strong></span>`}
            </div>
          </div>
        </div>
        <div class="v-badge-box">
          <div style="font-size:18px;font-weight:900;color:#fff !important;">
            ${D?"سند قيد ضريبي معتمد":"سند قيد محاسبي"}
          </div>
          <div style="font-size:10.5px;color:rgba(255,255,255,0.9) !important;letter-spacing:0.5px;">
            ${D?"TAX JOURNAL VOUCHER (ZATCA)":"JOURNAL VOUCHER"}
          </div>
        </div>
      </div>
    </div>
    <div class="v-header-gold"></div>

    <!-- Metadata Grid -->
    <div class="v-meta-grid">
      <div class="v-meta-card">
        <div class="v-meta-label">رقم القيد</div>
        <div class="v-meta-val" style="color:#1d4ed8;font-family:monospace;">${t.entryNumber||t.id.slice(0,8)}</div>
      </div>
      <div class="v-meta-card">
        <div class="v-meta-label">تاريخ القيد</div>
        <div class="v-meta-val">${t.date||"—"}</div>
      </div>
      <div class="v-meta-card">
        <div class="v-meta-label">نوع القيد</div>
        <div class="v-meta-val">${D?"قيد ضريبي / خدمات":a[t.sourceType]||t.sourceType||"يدوي"}</div>
      </div>
      <div class="v-meta-card">
        <div class="v-meta-label">حالة الترحيل</div>
        <div class="v-meta-val" style="color:${b?"#059669":"#d97706"}">${b?"مرحّل نظامياً ✓":"مسودة"}</div>
      </div>
    </div>

    <!-- Prominent Supplier & Tax Details Card -->
    ${D?`
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
            <div class="v-tax-item-val" style="font-family:monospace;color:#4338ca;">${y||t.reference||"—"}</div>
          </div>
          <div>
            <div class="v-tax-item-label">📅 تاريخ الفاتورة</div>
            <div class="v-tax-item-val">${t.date||"—"}</div>
          </div>
        </div>
      </div>

      <!-- ZATCA Tax Breakdown Summary Strip -->
      <div class="v-tax-summary-strip">
        <div class="v-tax-card base">
          <div class="lbl">المبلغ الخاضع للضريبة (قبل الضريبة)</div>
          <div class="val">${v(Y)} ر.س</div>
        </div>
        <div class="v-tax-card vat">
          <div class="lbl">ضريبة القيمة المضافة 15% (مدخلات مستردة)</div>
          <div class="val">${v(B>0?B:Math.round(Y*.15*100)/100)} ر.س</div>
        </div>
        <div class="v-tax-card total">
          <div class="lbl">الإجمالي شامل الضريبة</div>
          <div class="val">${v(te)} ر.س</div>
        </div>
      </div>
    `:""}

    <!-- General Description -->
    <div class="v-desc-bar">
      <strong>البيان العام للقيد:</strong> ${t.description||"بدون بيان"}
      ${t.reference?`<span style="margin-right:20px;color:#475569;">| مرجع المستند: <strong>${t.reference}</strong></span>`:""}
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
        ${(t.lines||[]).map((l,j)=>{const ae=l.accountCode==="2-1-1-2"||l.accountCode==="2-1-3-2"||l.accountCode==="2-2-1-2"||l.accountCode==="2-2-2"||l.accountName&&l.accountName.includes("المدخلات");return`
          <tr>
            <td style="text-align:center;color:#64748b;font-size:11px;">${j+1}</td>
            <td style="font-family:monospace;font-weight:700;color:#1d4ed8;">${l.accountCode||"—"}</td>
            <td style="font-weight:700;">
              ${l.accountName||"—"}
              ${ae?'<span style="background:#dcfce7;color:#15803d;font-size:9.5px;padding:2px 6px;border-radius:4px;font-weight:800;margin-right:6px;">🏷️ ضريبة مدخلات 15%</span>':""}
            </td>
            <td>
              <div style="font-weight:600;color:#0f172a;">${l.note||t.description||"—"}</div>
              ${l.serviceProvider||l.taxNumber||l.invoiceRef?`
                <div style="font-size:10px;color:#334155;margin-top:3px;background:#f1f5f9;padding:2px 6px;border-radius:4px;display:inline-block;border:1px dashed #cbd5e1;">
                  ${l.serviceProvider?`مورد: <strong>${l.serviceProvider}</strong> `:""}
                  ${l.taxNumber?`| ضريبي: <strong>${l.taxNumber}</strong> `:""}
                  ${l.invoiceRef?`| فاتورة: <strong>${l.invoiceRef}</strong>`:""}
                </div>
              `:""}
            </td>
            <td style="text-align:right;font-family:monospace;font-weight:${l.debit?"800":"400"};color:${l.debit?"#dc2626":"#94a3b8"};">
              ${l.debit?v(l.debit)+" ر.س":"—"}
            </td>
            <td style="text-align:right;font-family:monospace;font-weight:${l.credit?"800":"400"};color:${l.credit?"#16a34a":"#94a3b8"};">
              ${l.credit?v(l.credit)+" ر.س":"—"}
            </td>
          </tr>
        `}).join("")}
        <tr class="v-totals-row">
          <td colspan="4" style="text-align:right;padding:10px;">
            الإجمالي الكلي للقيد المحاسبي
            <span style="font-size:11px;font-weight:700;color:${m?"#059669":"#dc2626"};margin-right:12px;">
              (${m?"✓ القيد متوازن ومطابق نظامياً":"⚠️ غير متوازن"})
            </span>
          </td>
          <td style="text-align:right;color:#dc2626;font-family:monospace;font-weight:900;">${v(p)} ر.س</td>
          <td style="text-align:right;color:#16a34a;font-family:monospace;font-weight:900;">${v(r)} ر.س</td>
        </tr>
      </tbody>
    </table>

    <!-- Signatures Block -->
    <div class="v-sigs">
      <div class="v-sig-box">
        <div class="v-sig-title">إعداد المحاسب المسؤول</div>
        <div class="v-sig-line">${t.createdByName||"المحاسب المسؤول"}</div>
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
  `}function pe(t,e,a){const o=e.name||"شركة نظم الإمداد الحديثة";e.nameEn;const n=e.address||"7480 — الشارع: عامر الشعبي — ينبع — 13315",i=e.phone||"0549141648",d=e.vatNumber||"312448150500003";e.crNumber;const u=e.logoUrl||"",f={manual:"يدوي",salesInvoice:"مبيعات",purchaseInvoice:"مشتريات",salesReturn:"مردود بيع",purchaseReturn:"مردود شراء",reversing:"عكسي",pos:"POS"},c=t.reduce((r,b)=>r+Math.max(parseFloat(b.totalDebit||0)||0,(b.lines||[]).reduce((m,x)=>m+(parseFloat(x.debit||0)||0),0)),0),p=t.reduce((r,b)=>r+Math.max(parseFloat(b.totalCredit||0)||0,(b.lines||[]).reduce((m,x)=>m+(parseFloat(x.credit||0)||0),0)),0);return`
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
          ${u?`<img src="${u}" style="height:56px;width:56px;object-fit:contain;background:#fff;border-radius:8px;padding:3px;" />`:'<div style="width:50px;height:50px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;">🏢</div>'}
          <div>
            <div style="font-size:18px;font-weight:900;color:#fff !important;">${o}</div>
            <div style="font-size:10.5px;color:rgba(255,255,255,0.9) !important;margin-top:2px;">📍 ${n} | 📞 ${i} | 🔢 ضريبي: ${d}</div>
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
      <span>🏷️ نوع القيود: <strong>${a.typeF?f[a.typeF]||a.typeF:"الكل"}</strong></span>
      <span>📋 الحالة: <strong>${a.statusF?a.statusF==="posted"?"مرحّل":"مسودة":"الكل"}</strong></span>
      <span>📊 إجمالي القيود: <strong>${t.length} قيد</strong></span>
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
        ${t.map((r,b)=>{const m=Math.max(parseFloat(r.totalDebit||0)||0,(r.lines||[]).reduce((s,h)=>s+(parseFloat(h.debit||0)||0),0)),x=Math.max(parseFloat(r.totalCredit||0)||0,(r.lines||[]).reduce((s,h)=>s+(parseFloat(h.credit||0)||0),0));return`
            <tr>
              <td style="text-align:center;color:#64748b;font-size:10.5px;">${b+1}</td>
              <td style="font-family:monospace;font-size:11px;">${r.date||""}</td>
              <td style="font-family:monospace;font-weight:700;color:#1d4ed8;">${r.entryNumber||r.id.slice(0,8)}</td>
              <td>${r.description||"—"}</td>
              <td>${f[r.sourceType]||r.sourceType||"يدوي"}</td>
              <td>${(r.status||"posted")==="posted"?"مرحّل":"مسودة"}</td>
              <td style="text-align:right;font-family:monospace;font-weight:700;color:#1e40af;">${v(m)}</td>
              <td style="text-align:right;font-family:monospace;font-weight:700;color:#047857;">${v(x)}</td>
              <td style="font-size:10.5px;color:#64748b;">${r.createdByName||"—"}</td>
            </tr>
          `}).join("")}
        <tr class="r-totals">
          <td colspan="6" style="text-align:right;padding:10px;">إجمالي حركات دفتر اليومية العامة</td>
          <td style="text-align:right;color:#1e40af;font-family:monospace;">${v(c)}</td>
          <td style="text-align:right;color:#047857;font-family:monospace;">${v(p)}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>
  `}window.printSingleJournalVoucher=async t=>{let e=L.find(i=>i.id===t);if(!e)try{const i=await F(fsDoc(E,`companies/${I}/journalEntries`,t));i.exists()&&(e={id:i.id,...i.data()})}catch{}if(!e){window.showToast?.("عذراً، لم يتم العثور على بيانات القيد المطلوب","bad");return}const a=await ee(),o=le(e,a),n=window.open("","_blank");if(!n){window.showToast?.("يرجى السماح بالنوافذ المنبثقة للطباعة","warn");return}n.document.write(o),n.document.close(),setTimeout(()=>{n.focus(),n.print()},400)};window.printJournalLogReport=async()=>{const t=await ee(),e=document.getElementById("je-from")?.value||"",a=document.getElementById("je-to")?.value||"",o=document.getElementById("je-type-filter")?.value||"",n=document.getElementById("je-status-filter")?.value||"",i=pe(L,t,{from:e,to:a,typeF:o,statusF:n}),d=window.open("","_blank");if(!d){window.showToast?.("يرجى السماح بالنوافذ المنبثقة للطباعة","warn");return}d.document.write(i),d.document.close(),setTimeout(()=>{d.focus(),d.print()},400)};export{ve as render};
