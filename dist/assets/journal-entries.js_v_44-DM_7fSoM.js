const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/balance-sync-CUiyFg8g.js","assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css"])))=>i.map(i=>d[i]);
import{g as U,C as H,s as ye,t as D,d as S,a as M,l as Te,f as h,j as Ne,Q as ze,k as $e,_ as P,b as we}from"./index-CF9GFeRJ.js";import{orderBy as Le,getDoc as ae,doc as ge}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let x=[],A=[],K=null,be={};async function Ue(t,e){window.switchTab=Be,t.innerHTML=Ae(),Se();const[a,o]=await Promise.all([U(H.chartOfAccounts(),[Le("code")]),oe()]);A=a,K=o,switchTab("log"),setTimeout(()=>{const n=document.getElementById("je-search");if(n){n.oninput=null;const i=window.debounce?window.debounce(s=>filterJETable(s.target.value),300):s=>filterJETable(s.target.value);n.addEventListener("input",i)}},100)}function Ae(){return`
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
        <input type="date" id="je-from" value="${ye()}" onchange="loadJournalEntries()" />
      </div>
      <div class="je-filter-group">
        <label>إلى</label>
        <input type="date" id="je-to" value="${D()}" onchange="loadJournalEntries()" />
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
        <input type="date" id="ledger-from" value="${ye()}" />
      </div>
      <div class="je-filter-group">
        <label>إلى</label>
        <input type="date" id="ledger-to" value="${D()}" />
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
          <input type="date" id="je-date" class="input" value="${D()}" />
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
  `}function Be(t){["log","ledger"].forEach(e=>{document.getElementById(`tab-${e}`)?.classList.toggle("active",e===t),document.getElementById(`panel-${e}`)?.classList.toggle("hidden",e!==t)}),t==="log"&&loadJournalEntries(),t==="ledger"&&De()}async function oe(){try{const t=await ae(ge(S,`companies/${M}/counters`,"journal")),e=t.exists()?(t.data().seq||0)+1:1;return`JE-${String(e).padStart(6,"0")}`}catch{return"JE-000001"}}let _=[];window.loadJournalEntries=async(t=!1)=>{const e=document.getElementById("je-tbody");if(e){e.innerHTML=`<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-2)">
    <i class="fas fa-spinner fa-spin"></i> جارٍ التحميل...
  </td></tr>`;try{const a=document.getElementById("je-from")?.value,o=document.getElementById("je-to")?.value,n=document.getElementById("je-type-filter")?.value,i=document.getElementById("je-status-filter")?.value;t===!0&&await Te(H.journalEntries().path);let s=await U(H.journalEntries());s.sort((l,d)=>(d.date||"").localeCompare(l.date||"")),a&&(s=s.filter(l=>(l.date||"")>=a)),o&&(s=s.filter(l=>(l.date||"")<=o)),n&&(s=s.filter(l=>l.sourceType===n)),i&&(s=s.filter(l=>(l.status||"posted")===i)),_=s;const p=document.getElementById("je-search")?.value;p&&p.trim()?filterJETable(p):(ue(s),pe(s))}catch(a){e.innerHTML=`<tr><td colspan="9"><div class="alert bad" style="margin:8px">${a.message}</div></td></tr>`}}};function je(t){return t?String(t).toLowerCase().replace(/[أإآٱ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/[\u064B-\u065F\u0670\u0640]/g,"").trim():""}function pe(t){const e=(t||[]).reduce((m,r)=>{const g=parseFloat(r.totalDebit||0)||0,y=(r.lines||[]).reduce((u,v)=>u+(parseFloat(v.debit||0)||0),0);return m+Math.max(g,y)},0),a=(t||[]).reduce((m,r)=>{const g=parseFloat(r.totalCredit||0)||0,y=(r.lines||[]).reduce((u,v)=>u+(parseFloat(v.credit||0)||0),0);return m+Math.max(g,y)},0),o=(t||[]).filter(m=>(m.status||"posted")==="posted").length,n=Math.abs(e-a)<.01,i=document.getElementById("kpi-total-dr"),s=document.getElementById("kpi-total-cr"),p=document.getElementById("kpi-balance"),l=document.getElementById("kpi-count"),d=document.getElementById("kpi-posted");i&&(i.textContent=h(e)),s&&(s.textContent=h(a)),p&&(p.textContent=n?"✓ متوازن":h(Math.abs(e-a))),l&&(l.textContent=t.length),d&&(d.textContent=o)}function ue(t){const e=document.getElementById("je-tbody");if(!e)return;if(!t.length){e.innerHTML='<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-2)">لا توجد قيود</td></tr>';return}const a={manual:"يدوي",salesInvoice:"مبيعات",purchaseInvoice:"مشتريات",salesReturn:"مردود بيع",purchaseReturn:"مردود شراء",reversing:"عكسي",pos:"POS",salesCOGS:"تكلفة البضاعة",cogs:"تكلفة مبيعات",receipt:"سند قبض",stockTransfer:"تحويل مخزون",physical_count:"جرد"},o={manual:"manual",salesInvoice:"salesInvoice",purchaseInvoice:"purchaseInvoice",salesReturn:"salesReturn",purchaseReturn:"purchaseReturn",reversing:"reversing",pos:"pos",stockTransfer:"stockTransfer",salesCOGS:"salesCOGS",cogs:"salesCOGS",receipt:"receipt",physical_count:"stockTransfer"};e.innerHTML=t.map(n=>{const i=n.status||"posted",s=i==="posted",p=n.isReversed,l=n.sourceType||"manual",d=o[l]||"manual",m=Math.max(parseFloat(n.totalDebit||0)||0,(n.lines||[]).reduce((g,y)=>g+(parseFloat(y.debit||0)||0),0)),r=Math.max(parseFloat(n.totalCredit||0)||0,(n.lines||[]).reduce((g,y)=>g+(parseFloat(y.credit||0)||0),0));return`<tr class="status-${i} je-row-${d}" onclick="viewJEEntry('${n.id}')">
      <td class="mono" style="font-size:11px;color:var(--text-2);white-space:nowrap">${n.date||""}</td>
      <td class="mono" style="color:var(--brand);font-weight:900;font-size:12px;white-space:nowrap">${n.entryNumber&&n.entryNumber!=="undefined"?n.entryNumber:n.code||"JE-"+n.id.slice(-6).toUpperCase()}</td>
      <td style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-1);font-size:12px" title="${(n.description||"").replace(/"/g,"&quot;")}">${n.description||"—"}</td>
      <td><span class="badge-type btype-${d}">${a[l]||l}</span></td>
      <td class="mono" style="text-align:right;color:#a5b4fc;font-weight:700;font-size:13px">${h(m)}</td>
      <td class="mono" style="text-align:right;color:#6ee7b7;font-weight:700;font-size:13px">${h(r)}</td>
      <td style="white-space:nowrap">
        ${p?'<span class="badge-reversed">معكوس</span>':s?'<span class="badge-posted">مرحّل</span>':'<span class="badge-draft">مسودة</span>'}
      </td>
      <td style="font-size:11px;color:var(--text-2)">${n.createdByName||"—"}</td>
      <td onclick="event.stopPropagation()" style="white-space:nowrap">
        <div style="display:flex;gap:5px;justify-content:flex-end;align-items:center">
          ${xe(n)?`
            <button class="je-row-action" style="color:#059669;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);" title="طباعة سند صرف واستلام راتب ومسير" onclick="printSalaryVoucherFromJE('${n.id}')">
              <i class="fas fa-file-invoice-dollar"></i>
            </button>
          `:""}
          <button class="je-row-action info" title="طباعة سند القيد المحاسبي" onclick="printSingleJournalVoucher('${n.id}')">
            <i class="fas fa-print"></i>
          </button>
          <button class="je-row-action warning" title="نسخ وتكرار القيد لشهر جديد" onclick="duplicateEntry('${n.id}')">
            <i class="fas fa-copy"></i>
          </button>
          ${p?"":`
            <button class="je-row-action" title="تعديل القيد" onclick="openJournalModal('${n.id}')">
              <i class="fas fa-pen"></i>
            </button>`}
          ${!s&&!p?`
            <button class="je-row-action success" title="ترحيل القيد" onclick="postEntry('${n.id}')">
              <i class="fas fa-check"></i>
            </button>`:""}
          ${s&&!p?`
            <button class="je-row-action danger" title="عكس القيد" onclick="reverseEntry('${n.id}','${(n.entryNumber||"").replace(/'/g,"\\'")}')">
              <i class="fas fa-undo"></i>
            </button>`:""}
        </div>
      </td>
    </tr>`}).join("")}window.filterJETable=t=>{const e=je(t);if(!e){ue(_),pe(_);return}const a=e.split(/\s+/).filter(Boolean),o={manual:"يدوي",salesInvoice:"مبيعات",purchaseInvoice:"مشتريات",salesReturn:"مردود بيع",purchaseReturn:"مردود شراء",reversing:"عكسي",pos:"POS",salesCOGS:"تكلفة البضاعة",cogs:"تكلفة مبيعات",receipt:"سند قبض",stockTransfer:"تحويل مخزون",physical_count:"جرد"},n=_.filter(i=>{const s=(i.lines||[]).map(d=>`${d.accountCode||""} ${d.accountName||""} ${d.note||""} ${d.costCenterName||""}`).join(" "),p=`${i.entryNumber||""} ${i.code||""} ${i.description||""} ${i.reference||""} ${i.createdByName||""} ${o[i.sourceType]||""} ${s}`,l=je(p);return a.every(d=>l.includes(d))});ue(n),pe(n)};window.openJournalModal=async(t="")=>{x=[],be={},document.getElementById("je-form-error").classList.add("hidden"),await ke(),loadCustomJETemplatesDropdown();const e=document.getElementById("je-cost-center");if(t&&typeof t=="string"){const a=_.find(o=>o.id===t);if(!a)return;document.getElementById("je-edit-id").value=a.id,document.getElementById("je-desc").value=a.description||"",document.getElementById("je-ref").value=a.reference||"",document.getElementById("je-date").value=a.date||D(),e&&(e.value=a.costCenterId||""),document.getElementById("je-modal-title").textContent=`تعديل القيد: ${a.entryNumber||""}`,document.getElementById("je-entry-num-label").textContent=`رقم القيد: ${a.entryNumber||""}`,K=a.entryNumber,a.lines&&a.lines.length&&(x=a.lines.map(o=>({accountId:o.accountId||"",accountCode:o.accountCode||"",accountName:o.accountName||"",accountType:o.accountType||"",note:o.note||"",debit:parseFloat(o.debit)||0,credit:parseFloat(o.credit)||0,costCenterId:o.costCenterId||null,serviceProvider:o.serviceProvider||"",taxNumber:o.taxNumber||"",invoiceRef:o.invoiceRef||""}))),G(),W()}else{document.getElementById("je-edit-id").value="",document.getElementById("je-desc").value="",document.getElementById("je-ref").value="",document.getElementById("je-date").value=D(),e&&(e.value=""),document.getElementById("je-modal-title").textContent="قيد يدوي جديد";const a=await oe();K=a,document.getElementById("je-entry-num-label").textContent=`رقم القيد: ${a}`,addJELine(),addJELine()}openModal("journal-modal")};let le=[];async function ke(){const t=document.getElementById("je-cost-center");if(t)try{le=(await U(H.costCenters()).catch(()=>[])).sort((a,o)=>(a.code||"").localeCompare(o.code||"")),t.innerHTML='<option value="">بدون مركز تكلفة</option>'+le.map(a=>`<option value="${a.id}">${a.code||""} — ${a.name}</option>`).join("")}catch{}}function ne(){const t=document.getElementById("je-lines-tbody");if(!t)return;t.querySelectorAll("tr[data-line]").forEach(a=>{const o=parseInt(a.getAttribute("data-line"),10);if(isNaN(o)||!x[o])return;const n=a.querySelector(".je-note-input"),i=a.querySelector("input[placeholder*='مورد الخدمة']"),s=a.querySelector("input[placeholder*='الرقم الضريبي']"),p=a.querySelector("input[placeholder*='رقم الفاتورة']"),l=a.querySelectorAll(".je-amt-input");if(n&&(x[o].note=n.value),i&&(x[o].serviceProvider=i.value.trim()),s&&(x[o].taxNumber=s.value.trim()),p&&(x[o].invoiceRef=p.value.trim()),l.length>=2){const d=parseFloat(l[0].value)||0,m=parseFloat(l[1].value)||0;x[o].debit=d,x[o].credit=m}})}window.addJELine=()=>{ne(),x.push({accountId:"",accountCode:"",accountName:"",accountType:"",note:"",debit:0,credit:0,serviceProvider:"",taxNumber:"",invoiceRef:""}),G(),W()};function G(){const t=document.getElementById("je-lines-tbody");t&&(t.innerHTML=x.map((e,a)=>`
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
  `).join(""))}const ce={asset:"أصول",liability:"خصوم",equity:"ملكية",revenue:"إيرادات",expense:"مصروفات"};window.accLineSearch=(t,e)=>{const a=document.getElementById(`acc-drop-${t}`);if(!a)return;const o=e.trim().toLowerCase();if(!o){a.classList.add("hidden");return}const n=A.filter(i=>i.isActive!==!1).filter(i=>(i.code||"").toLowerCase().includes(o)||(i.name||"").toLowerCase().includes(o)).slice(0,30);n.length?a.innerHTML=n.map(i=>`
      <div class="je-acc-option" onmousedown="selectAccLine(${t},'${i.id}','${i.code}','${(i.name||"").replace(/'/g,"\\'")}','${i.type||""}')">
        <span class="je-acc-code">${i.code}</span>
        <span class="je-acc-name">${i.name}</span>
        <span class="je-acc-type">${ce[i.type]||i.type||""}</span>
        ${i.nodeType==="header"?'<span style="font-size:9px;color:#f59e0b;margin-right:2px">رئيسي</span>':""}
      </div>`).join(""):a.innerHTML='<div class="je-acc-option" style="color:var(--text-2)">لا توجد نتائج</div>',a.classList.remove("hidden")};window.selectAccLine=(t,e,a,o,n)=>{ne(),x[t].accountId=e,x[t].accountCode=a,x[t].accountName=o,x[t].accountType=ce[n]||n;const i=document.getElementById(`acc-search-${t}`),s=document.getElementById(`acc-drop-${t}`);if(i&&(i.value=`${a} — ${o}`),s&&s.classList.add("hidden"),!x[t].debit&&!x[t].credit){const p=["asset","expense"].includes(n),l=x.reduce((r,g)=>r+(g.debit||0),0),d=x.reduce((r,g)=>r+(g.credit||0),0),m=Math.abs(l-d);m>0&&(p&&l<d&&(x[t].debit=m),!p&&d<l&&(x[t].credit=m),G())}W()};window.showAccDropdown=t=>{const e=document.getElementById(`acc-search-${t}`);e?.value&&accLineSearch(t,e.value)};window.hideAccDropdown=t=>{setTimeout(()=>document.getElementById(`acc-drop-${t}`)?.classList.add("hidden"),200)};window.updateJEAmt=(t,e,a)=>{const o=parseFloat(a.value)||0;x[t][e]=o,a.className="je-amt-input "+(o>0?e==="debit"?"has-val":"has-val-cr":""),W()};window.removeJELine=t=>{ne(),x.splice(t,1),G(),W()};function W(){const t=x.reduce((p,l)=>p+(l.debit||0),0),e=x.reduce((p,l)=>p+(l.credit||0),0),a=Math.abs(t-e),o=a<.01,n=p=>p.toLocaleString("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2}),i=(p,l)=>{const d=document.getElementById(p);d&&(d.textContent=l)};i("je-sum-debit",`${n(t)} ر.س`),i("je-sum-credit",`${n(e)} ر.س`),i("meter-dr",n(t)),i("meter-cr",n(e));const s=document.getElementById("meter-status");s&&(t===0&&e===0?(s.className="je-balance-status balanced",s.innerHTML='<i class="fas fa-balance-scale"></i> أدخل مبالغ القيد'):o?(s.className="je-balance-status balanced",s.innerHTML='<i class="fas fa-check-circle"></i> قيد متوازن ✓'):(s.className="je-balance-status unbalanced",s.innerHTML=`<i class="fas fa-exclamation-triangle"></i> غير متوازن — الفرق: ${n(a)} ر.س`))}window.saveJournal=async(t="posted")=>{ne();const e=document.getElementById("je-form-error");e.classList.add("hidden");const a=document.getElementById("je-date").value,o=document.getElementById("je-desc").value.trim(),n=document.getElementById("je-ref").value.trim();if(!a){e.textContent="التاريخ مطلوب",e.classList.remove("hidden");return}if(!o){e.textContent="البيان مطلوب",e.classList.remove("hidden");return}const i=x.filter(r=>r.accountId&&(r.debit>0||r.credit>0));if(i.length<2){e.textContent="يجب أن يحتوي القيد على سطرين على الأقل",e.classList.remove("hidden");return}const s=i.reduce((r,g)=>r+(g.debit||0),0),p=i.reduce((r,g)=>r+(g.credit||0),0);if(Math.abs(s-p)>.01){e.textContent=`⚖️ القيد غير متوازن — المدين (${h(s)}) ≠ الدائن (${h(p)})`,e.classList.remove("hidden");return}if(i.filter(r=>!r.accountId&&(r.debit>0||r.credit>0)).length){e.textContent="يوجد سطور بمبالغ ولكن بدون حساب محدد",e.classList.remove("hidden");return}const d=document.getElementById("save-draft-btn"),m=document.getElementById("save-post-btn");d.disabled=m.disabled=!0;try{if(await Ne(a)){e.textContent=`⚠️ لا يمكن حفظ القيد لأن تاريخه (${a}) يقع في فترة محاسبية مغلقة ومقفلة نهائياً.`,e.classList.remove("hidden"),d.disabled=m.disabled=!1;return}const r=document.getElementById("je-cost-center"),g=r?.value||null,y=r&&g&&le&&le.find(j=>j.id===g)?.name||null;i.forEach(j=>{j.costCenterId||(j.costCenterId=g)});const u=document.getElementById("je-edit-id").value;let v="",k=u||"";u?(v=document.getElementById("je-number")?.value||"",await ze(u,{date:a,description:o,reference:n,costCenterId:g,costCenterName:y,lines:i,status:t}),window.showToast?.(`تم تعديل و${t==="posted"?"ترحيل":"حفظ"} القيد بنجاح`,"success")):(v=K||await oe(),k=await $e({date:a,description:o,reference:n,sourceType:"manual",entryNumber:v,status:t,costCenterId:g,costCenterName:y,lines:i}),window.showToast?.(`تم ${t==="posted"?"ترحيل":"حفظ"} القيد ${v}`,"success")),t==="posted"&&fe(i,{entryId:k,entryNumber:v,date:a,description:o}).catch(j=>{console.warn("[saveJournal] syncBalances error:",j)}),closeModal("journal-modal"),x=[],K=null,await loadJournalEntries()}catch(r){e.textContent=r.message,e.classList.remove("hidden")}finally{d.disabled=m.disabled=!1}};async function fe(t=[],e={}){if(!(!t||!t.length))try{const{recalculateSupplierBalance:a,recalculateCustomerBalance:o}=await P(async()=>{const{recalculateSupplierBalance:r,recalculateCustomerBalance:g}=await import("./balance-sync-CUiyFg8g.js");return{recalculateSupplierBalance:r,recalculateCustomerBalance:g}},__vite__mapDeps([0,1,2])),{getAll:n,COLS:i}=await P(async()=>{const{getAll:r,COLS:g}=await import("./index-CF9GFeRJ.js").then(y=>y.T);return{getAll:r,COLS:g}},__vite__mapDeps([1,2])),[s,p,l]=await Promise.all([n(i.suppliers()).catch(()=>[]),n(i.customers()).catch(()=>[]),n(i.chartOfAccounts()).catch(()=>[])]),d=new Set,m=new Set;t.forEach(r=>{const g=r.accountId,y=r.accountCode,u=(r.accountName||"").trim().toLowerCase(),v=(l||[]).find(E=>E.id===g||E.code===y||E.name&&E.name.trim().toLowerCase()===u);v&&v.sourceEntityId&&(v.sourceModule==="suppliers"||(s||[]).some(E=>E.id===v.sourceEntityId)?d.add(v.sourceEntityId):(v.sourceModule==="customers"||(p||[]).some(E=>E.id===v.sourceEntityId))&&m.add(v.sourceEntityId));const k=(s||[]).find(E=>{const I=(E.name||"").trim().toLowerCase();return I&&(I===u||u.includes(I)||I.includes(u))});k&&d.add(k.id);const j=(p||[]).find(E=>{const I=(E.name||"").trim().toLowerCase();return I&&(I===u||u.includes(I)||I.includes(u))});j&&m.add(j.id)});for(const r of d)await a(r).catch(()=>{});for(const r of m)await o(r).catch(()=>{});try{const r=await n(i.bankAccounts()).catch(()=>[]),{doc:g,setDoc:y,updateDoc:u,serverTimestamp:v,increment:k}=await P(async()=>{const{doc:N,setDoc:C,updateDoc:$,serverTimestamp:c,increment:T}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{doc:N,setDoc:C,updateDoc:$,serverTimestamp:c,increment:T}},[]),{db:j,COMPANY_ID:E}=await P(async()=>{const{db:N,COMPANY_ID:C}=await import("./index-CF9GFeRJ.js").then($=>$.S);return{db:N,COMPANY_ID:C}},__vite__mapDeps([1,2])),I=new Map,O=e.entryNumber||"JE";for(let N=0;N<t.length;N++){const C=t[N],$=C.accountCode||"",c=C.accountId||"",T=(C.accountName||"").trim().toLowerCase();if($.startsWith("1-1-2")||$.startsWith("1-1-5")||$.startsWith("1-1-3")||$.startsWith("2-1-1")||$.startsWith("5-")||$.startsWith("4-"))continue;const R=(r||[]).find(z=>{if(z.id&&(z.id===c||z.accountId===c)||z.accountCode&&z.accountCode===$)return!0;const V=(z.name||"").trim().toLowerCase().replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي"),J=T.replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي");return!!(V&&J===V)});if(R){const z=Number(C.debit||0),V=Number(C.credit||0),J=z>0?z:V;if(J>0){const Z=z>0,Q=Z?J:-J;I.set(R.id,(I.get(R.id)||0)+Q);const X=`btx_je_${e.entryId||Date.now()}_${R.id}_${N}`.replace(/[^a-zA-Z0-9_]/g,"_"),q=C.note?`${e.description||"قيد محاسبي"} (${C.note})`:e.description||"قيد محاسبي";await y(g(j,`companies/${E}/bankTransactions`,X),{bankAccountId:R.id,amount:J,type:Z?"in":"out",date:e.date||new Date().toISOString().split("T")[0],refNumber:O,notes:`قيد يومية: ${q}`,sourceType:"manualJE",sourceId:e.entryId||null,createdAt:v()}).catch(ie=>console.warn("Error creating bank transaction:",ie))}}}for(const[N,C]of I.entries())await u(g(j,`companies/${E}/bankAccounts`,N),{balance:k(C),updatedAt:v()}).catch($=>console.warn("Error updating bank balance:",$))}catch(r){console.warn("[JournalEntries] Error auto-syncing bank accounts:",r)}}catch(a){console.warn("[JournalEntries] Error auto-syncing balances for journal lines:",a)}}window.postEntry=async t=>{if(await window.showConfirm?.("ترحيل هذا القيد؟ لن يمكن تعديله بعد الترحيل.","ترحيل القيد"))try{const{updateDoc:e,getDoc:a,doc:o}=await P(async()=>{const{updateDoc:i,getDoc:s,doc:p}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{updateDoc:i,getDoc:s,doc:p}},[]),n=await a(o(S,`companies/${M}/journalEntries`,t));if(await e(o(S,`companies/${M}/journalEntries`,t),{status:"posted"}),n.exists()){const i=n.data();fe(i.lines||[],{entryId:t,entryNumber:i.entryNumber,date:i.date,description:i.description}).catch(()=>{})}window.showToast?.("تم ترحيل القيد","success"),await loadJournalEntries()}catch(e){window.showToast?.(e.message,"error")}};window.reverseEntry=async(t,e)=>{if(await window.showConfirm?.(`سيُنشأ قيد عكسي لـ "${e}" — يعكس جميع المدينات والدائن. هل تريد المتابعة؟`,"قيد عكسي (Reversing Entry)"))try{const{getDoc:a,doc:o}=await P(async()=>{const{getDoc:m,doc:r}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:m,doc:r}},[]),n=await a(o(S,`companies/${M}/journalEntries`,t));if(!n.exists())throw new Error("القيد غير موجود");const i=n.data(),s=(i.lines||[]).map(m=>({...m,debit:m.credit||0,credit:m.debit||0,note:`عكس: ${m.note||m.accountName}`})),{updateDoc:p,doc:l}=await P(async()=>{const{updateDoc:m,doc:r}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{updateDoc:m,doc:r}},[]),d=await oe();await $e({date:D(),description:`قيد عكسي لـ ${i.entryNumber||e}`,sourceType:"reversing",entryNumber:d,status:"posted",reversedFrom:t,lines:s}),await p(l(S,`companies/${M}/journalEntries`,t),{isReversed:!0,reversedBy:d}),fe(s).catch(()=>{}),window.showToast?.(`تم إنشاء القيد العكسي ${d}`,"success"),await loadJournalEntries()}catch(a){console.error(a),window.showToast?.(a.message,"error")}};window.duplicateEntry=async t=>{if(t)try{let e=_.find(n=>n.id===t);if(!e){const{getDoc:n,doc:i}=await P(async()=>{const{getDoc:p,doc:l}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:p,doc:l}},[]),s=await n(i(S,`companies/${M}/journalEntries`,t));s.exists()&&(e={id:s.id,...s.data()})}if(!e){window.showToast?.("تعذر العثور على القيد المطلوب نسخه","error");return}x=[],be={},document.getElementById("je-form-error")?.classList.add("hidden"),await ke(),loadCustomJETemplatesDropdown();const a=document.getElementById("je-cost-center");document.getElementById("je-edit-id").value="",document.getElementById("je-desc").value=e.description||"",document.getElementById("je-ref").value=e.reference?`${e.reference} (مكرر)`:`مكرر من ${e.entryNumber||""}`,document.getElementById("je-date").value=D(),a&&(a.value=e.costCenterId||"");const o=await oe();K=o,document.getElementById("je-modal-title").textContent=`نسخ وتكرار قيد: ${e.entryNumber||""}`,document.getElementById("je-entry-num-label").textContent=`رقم القيد الجديد: ${o}`,e.lines&&e.lines.length?x=e.lines.map(n=>({accountId:n.accountId||"",accountCode:n.accountCode||"",accountName:n.accountName||"",accountType:n.accountType||"",note:n.note||"",debit:parseFloat(n.debit)||0,credit:parseFloat(n.credit)||0,costCenterId:n.costCenterId||null,serviceProvider:n.serviceProvider||"",taxNumber:n.taxNumber||"",invoiceRef:n.invoiceRef||""})):(addJELine(),addJELine()),G(),W(),openModal("journal-modal"),window.showToast?.(`تم نسخ سطور القيد ${e.entryNumber||""} بنجاح. يمكنك تعديل المبالغ والتاريخ وترحيله فوراً`,"info")}catch(e){console.error("Duplicate Entry error:",e),window.showToast?.("حدث خطأ أثناء نسخ القيد: "+e.message,"error")}};window.applyJETemplate=t=>{if(!A||!A.length)return;x=[],be={};const e=(o,n)=>A.find(i=>i.code&&i.code.startsWith(o)||i.name&&i.name.includes(n))||A.find(i=>i.name&&i.name.includes(n))||null,a=new Date().toLocaleDateString("ar-SA",{month:"long",year:"numeric"});if(t==="depreciation"){document.getElementById("je-desc").value=`قيد إهلاك الأصول الثابتة لشهر ${a}`,document.getElementById("je-ref").value=`إهلاك دوري - ${D().slice(0,7)}`;const o=e("5-6-1","إهلاك السيارات")||e("5-6","إهلاك"),n=e("1-2-1-2","مجمع إهلاك السيارات")||e("1-2-1","مجمع إهلاك"),i=e("5-6-2","إهلاك المعدات"),s=e("1-2-2-2","مجمع إهلاك المعدات");o&&n&&(x.push({accountId:o.id,accountCode:o.code,accountName:o.name,accountType:o.accountType||o.type||"expense",note:"مصروف إهلاك السيارات والمركبات",debit:0,credit:0}),x.push({accountId:n.id,accountCode:n.code,accountName:n.name,accountType:n.accountType||n.type||"asset",note:"مجمع إهلاك السيارات والمركبات",debit:0,credit:0})),i&&s&&(x.push({accountId:i.id,accountCode:i.code,accountName:i.name,accountType:i.accountType||i.type||"expense",note:"مصروف إهلاك المعدات والآلات",debit:0,credit:0}),x.push({accountId:s.id,accountCode:s.code,accountName:s.name,accountType:s.accountType||s.type||"asset",note:"مجمع إهلاك المعدات والآلات",debit:0,credit:0})),x.length||(addJELine(),addJELine()),window.showToast?.("تم تجهيز نموذج قيد إهلاك الأصول. أدخل مبالغ الإهلاك الدورية","info")}else if(t==="rent"){document.getElementById("je-desc").value=`قيد استحقاق مصروف الإيجار لشهر ${a}`,document.getElementById("je-ref").value=`استحقاق إيجار - ${D().slice(0,7)}`;const o=e("5-4-1-1","ايجار المستودع")||e("5-4-1","الإيجار"),n=e("1-1-3-1","ايجار مدفوع مقدما")||e("2-1-4-1","ايجار سكن مستحق")||e("2-1-4","مستحقة");o&&x.push({accountId:o.id,accountCode:o.code,accountName:o.name,accountType:o.accountType||o.type||"expense",note:"إثبات استحقاق مصروف الإيجار الشهري",debit:0,credit:0}),n&&x.push({accountId:n.id,accountCode:n.code,accountName:n.name,accountType:n.accountType||n.type||"liability",note:"تسوية الإيجار (المستحق / المدفوع مقدماً)",debit:0,credit:0}),x.length<2&&addJELine(),window.showToast?.("تم تجهيز نموذج استحقاق الإيجار. حدد المبلغ والمراكز","info")}else if(t==="payroll"){document.getElementById("je-desc").value=`قيد استحقاق مسير رواتب الموظفين والمناديب لشهر ${a}`,document.getElementById("je-ref").value=`مسير رواتب - ${D().slice(0,7)}`;const o=e("5-2-6","رواتب واجور")||e("5-2-1","رواتب")||e("5-2","الرواتب"),n=e("2-1-5","مستحقات الموظفين")||e("2-1-4","مستحقة");o&&x.push({accountId:o.id,accountCode:o.code,accountName:o.name,accountType:o.accountType||o.type||"expense",note:"إجمالي استحقاق الرواتب والأجور والبدلات",debit:0,credit:0}),n&&x.push({accountId:n.id,accountCode:n.code,accountName:n.name,accountType:n.accountType||n.type||"liability",note:"مستحقات الرواتب للموظفين والمناديب",debit:0,credit:0}),x.length<2&&addJELine(),window.showToast?.("تم تجهيز نموذج استحقاق الرواتب","info")}else if(t==="prepaid"){document.getElementById("je-desc").value=`قيد إطفاء مصروفات وتأمينات مدفوعة مقدماً لشهر ${a}`,document.getElementById("je-ref").value=`إطفاء دوري - ${D().slice(0,7)}`;const o=e("1-1-5-1","مصروفات مدفوعة مقدماً")||e("1-1-3","مدفوع مقدما"),n=e("5-4","تشغيلية")||e("5-1","مصروف");n&&x.push({accountId:n.id,accountCode:n.code,accountName:n.name,accountType:n.accountType||n.type||"expense",note:"مصروف الفترة المحمل من المدفوع مقدماً",debit:0,credit:0}),o&&x.push({accountId:o.id,accountCode:o.code,accountName:o.name,accountType:o.accountType||o.type||"asset",note:"إطفاء / تخفيض رصيد المصروفات المدفوعة مقدماً",debit:0,credit:0}),x.length<2&&addJELine(),window.showToast?.("تم تجهيز نموذج إطفاء المصروفات المدفوعة مقدماً","info")}G(),W()};window.saveCurrentAsCustomTemplate=()=>{ne();const t=x.filter(o=>o.accountId);if(!t.length){window.showToast?.("يرجى اختيار حسابات في سطور القيد أولاً لحفظها كنموذج","warning");return}const e=document.getElementById("je-desc")?.value.trim()||"قيد دوري مخصص",a=prompt("أدخل اسماً لهذا النموذج المحاسبي (مثال: قيد إيجار ينبع الشهري):",e);if(!(!a||!a.trim()))try{const o=JSON.parse(localStorage.getItem("idham_je_custom_templates")||"[]"),n={id:"tpl_"+Date.now(),name:a.trim(),description:document.getElementById("je-desc")?.value.trim()||"",costCenterId:document.getElementById("je-cost-center")?.value||null,lines:t.map(i=>({accountId:i.accountId,accountCode:i.accountCode,accountName:i.accountName,accountType:i.accountType,note:i.note,debit:i.debit||0,credit:i.credit||0}))};o.push(n),localStorage.setItem("idham_je_custom_templates",JSON.stringify(o)),loadCustomJETemplatesDropdown(),window.showToast?.(`تم حفظ النموذج "${a}" بنجاح`,"success")}catch(o){console.error(o)}};window.loadCustomJETemplatesDropdown=()=>{const t=document.getElementById("je-custom-templates");if(t)try{const e=JSON.parse(localStorage.getItem("idham_je_custom_templates")||"[]");if(!e.length){t.style.display="none";return}t.style.display="inline-block",t.innerHTML='<option value="">📂 قوالبي المحفوظة ('+e.length+")</option>"+e.map(a=>`<option value="${a.id}">${a.name}</option>`).join("")}catch{t.style.display="none"}};window.applyCustomJETemplate=t=>{if(t)try{const a=JSON.parse(localStorage.getItem("idham_je_custom_templates")||"[]").find(o=>o.id===t);if(!a)return;if(a.description&&(document.getElementById("je-desc").value=a.description),a.costCenterId){const o=document.getElementById("je-cost-center");o&&(o.value=a.costCenterId)}x=(a.lines||[]).map(o=>({accountId:o.accountId,accountCode:o.accountCode,accountName:o.accountName,accountType:o.accountType,note:o.note,debit:o.debit||0,credit:o.credit||0})),G(),W(),window.showToast?.(`تم استدعاء نموذج "${a.name}"`,"info"),document.getElementById("je-custom-templates").value=""}catch(e){console.error(e)}};window.viewJEEntry=async t=>{const e=document.getElementById("je-detail-body");e.innerHTML='<div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin"></i></div>',openModal("je-detail-modal");try{const{getDoc:a,doc:o}=await P(async()=>{const{getDoc:d,doc:m}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:d,doc:m}},[]),n=await a(o(S,`companies/${M}/journalEntries`,t));if(!n.exists())throw new Error("القيد غير موجود");const i={id:n.id,...n.data()};document.getElementById("je-detail-title").textContent=`قيد: ${i.entryNumber||t.slice(0,8)}`;const p=(i.status||"posted")==="posted";e.innerHTML=`
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
          <div>${p?'<span class="badge-posted">مرحّل</span>':'<span class="badge-draft">مسودة</span>'}</div>
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
          ${(i.lines||[]).map(d=>`
            <tr style="border-bottom:1px solid rgba(255,255,255,.04)">
              <td style="padding:8px 10px">
                <span style="font-family:monospace;font-size:11px;color:var(--brand)">${d.accountCode}</span>
                <span style="margin-right:6px">${d.accountName}</span>
              </td>
              <td style="padding:8px 10px;color:var(--text-2);font-size:12px">
                <div>${d.note||"—"}</div>
                ${d.serviceProvider||d.taxNumber||d.invoiceRef?`
                  <div style="font-size:10px;color:var(--text-3);margin-top:4px;background:rgba(255,255,255,0.02);padding:4px 6px;border-radius:4px;border:1px dashed var(--border-soft);display:inline-block;">
                    ${d.serviceProvider?`<span>👤 مورد الخدمة: <strong>${d.serviceProvider}</strong></span>`:""}
                    ${d.taxNumber?`<span style="margin-right:10px;">🏷️ الرقم الضريبي: <strong>${d.taxNumber}</strong></span>`:""}
                    ${d.invoiceRef?`<span style="margin-right:10px;">📄 فاتورة: <strong>${d.invoiceRef}</strong></span>`:""}
                  </div>
                `:""}
              </td>
              <td style="padding:8px 10px;text-align:right;font-family:monospace;font-weight:${d.debit?"800":"400"};color:${d.debit?"#818cf8":"var(--text-3)"}">
                ${d.debit?h(d.debit):"—"}
              </td>
              <td style="padding:8px 10px;text-align:right;font-family:monospace;font-weight:${d.credit?"800":"400"};color:${d.credit?"#34d399":"var(--text-3)"}">
                ${d.credit?h(d.credit):"—"}
              </td>
            </tr>`).join("")}
        </tbody>
        <tfoot>
          <tr style="background:var(--bg-2);border-top:2px solid var(--border-soft)">
            <td colspan="2" style="padding:10px;font-weight:800">الإجمالي</td>
            <td style="padding:10px;text-align:right;font-weight:900;color:#818cf8">${h(i.totalDebit||0)}</td>
            <td style="padding:10px;text-align:right;font-weight:900;color:#34d399">${h(i.totalCredit||0)}</td>
          </tr>
        </tfoot>
      </table>
      <div style="font-size:10px;color:var(--text-3);margin-top:10px;text-align:left">
        أنشأه: ${i.createdByName||"—"} | ${i.createdAt?.toDate?i.createdAt.toDate().toLocaleString("ar-SA"):""}
      </div>
    `;const l=document.getElementById("je-detail-footer");if(l){const d=xe(i);l.innerHTML=`
        <button class="btn btn-ghost" onclick="closeModal('je-detail-modal')">إغلاق</button>
        ${d?`
          <button class="btn btn-primary" onclick="printSalaryVoucherFromJE('${t}')" style="background:#059669; border-color:#059669; color:#fff; font-weight:bold; display:inline-flex; align-items:center; gap:6px;">
            <i class="fas fa-file-invoice-dollar"></i> 📄 طباعة سند صرف واستلام راتب الموظف
          </button>`:""}
        <button class="btn btn-secondary" onclick="printSingleJournalVoucher('${t}')">
          <i class="fas fa-print"></i> طباعة سند القيد المحاسبي
        </button>
        <button class="btn btn-primary" onclick="closeModal('je-detail-modal'); duplicateEntry('${t}')">
          <i class="fas fa-copy"></i> نسخ وتكرار القيد
        </button>
      `}}catch(a){e.innerHTML=`<div class="alert bad">${a.message}</div>`}};let de=null;function De(){const t=document.getElementById("ledger-acc-input"),e=document.getElementById("ledger-acc-dropdown");!t||!e||(t.addEventListener("input",()=>{const a=t.value.trim().toLowerCase();if(!a){e.classList.add("hidden");return}const o=A.filter(n=>(n.code||"").toLowerCase().includes(a)||(n.name||"").toLowerCase().includes(a)).slice(0,30);e.innerHTML=o.map(n=>`
      <div class="je-acc-option" onclick="selectLedgerAcc('${n.id}','${n.code}','${(n.name||"").replace(/'/g,"\\'")}')">
        <span class="je-acc-code">${n.code}</span>
        <span class="je-acc-name">${n.name}</span>
        <span class="je-acc-type">${ce[n.type]||""}</span>
      </div>`).join(""),e.classList.remove("hidden")}),t.addEventListener("blur",()=>setTimeout(()=>e.classList.add("hidden"),200)))}window.ledgerAccSearch=t=>{const e=document.getElementById("ledger-acc-input"),a=document.getElementById("ledger-acc-dropdown");if(!e||!a)return;const o=t.trim().toLowerCase();if(!o){a.classList.add("hidden");return}const n=A.filter(i=>(i.code||"").toLowerCase().includes(o)||(i.name||"").toLowerCase().includes(o)).slice(0,30);a.innerHTML=n.map(i=>`
    <div class="je-acc-option" onmousedown="selectLedgerAcc('${i.id}','${i.code}','${(i.name||"").replace(/'/g,"\\'")}')">
      <span class="je-acc-code">${i.code}</span>
      <span class="je-acc-name">${i.name}</span>
      <span class="je-acc-type">${ce[i.type]||""}</span>
    </div>`).join(""),a.classList.toggle("hidden",!n.length)};window.selectLedgerAcc=(t,e,a)=>{de=t;const o=document.getElementById("ledger-acc-input"),n=document.getElementById("ledger-acc-dropdown");o&&(o.value=`${e} — ${a}`),n&&n.classList.add("hidden")};window.loadLedger=async()=>{const t=document.getElementById("ledger-content");if(!t)return;if(!de){window.showToast?.("اختر حساباً أولاً","warn");return}const e=A.find(n=>n.id===de),a=document.getElementById("ledger-from")?.value,o=document.getElementById("ledger-to")?.value;t.innerHTML='<div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin"></i></div>';try{const i=(await U(H.journalEntries())).filter(u=>!u.status||u.status==="posted").sort((u,v)=>(u.date||"").localeCompare(v.date||"")),s=["asset","expense"].includes(e?.type),p=[];i.forEach(u=>{(u.lines||[]).forEach(v=>{if(v.accountId!==de&&v.accountCode!==e?.code)return;const k=u.date||"";a&&k<a||o&&k>o||p.push({date:k,entryNum:(j=>j.entryNumber&&j.entryNumber!=="undefined"?j.entryNumber:"JE-"+u.id.slice(-6).toUpperCase())(u),desc:u.description||"",note:v.note||"",debit:v.debit||0,credit:v.credit||0})})}),p.sort((u,v)=>u.date.localeCompare(v.date)||u.entryNum.localeCompare(v.entryNum));const l=e?.openingBalance||0;let d=l,m=0,r=0;const g=p.map((u,v)=>{m+=u.debit,r+=u.credit,d+=s?u.debit-u.credit:u.credit-u.debit;const k=d>=0?s?"م":"د":s?"د":"م";return`
        <tr>
          <td class="mono" style="font-size:11px;color:var(--text-2)">${v+1}</td>
          <td class="mono" style="font-size:11px">${u.date}</td>
          <td style="color:var(--brand);font-size:11px;font-family:monospace">${u.entryNum}</td>
          <td style="font-size:12px">${u.desc}${u.note?` — <span style="color:var(--text-2)">${u.note}</span>`:""}</td>
          <td style="text-align:right;font-family:monospace;color:${u.debit?"#818cf8":"var(--text-3)"};font-weight:${u.debit?"800":"400"}">
            ${u.debit?h(u.debit):"—"}
          </td>
          <td style="text-align:right;font-family:monospace;color:${u.credit?"#34d399":"var(--text-3)"};font-weight:${u.credit?"800":"400"}">
            ${u.credit?h(u.credit):"—"}
          </td>
          <td class="ledger-running ${d>=0?"running-dr":"running-cr"}" style="text-align:right">
            ${h(Math.abs(d))} ${k}
          </td>
        </tr>`}),y=d;t.innerHTML=`
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
          <div class="ledger-sum-val" style="color:#818cf8">${h(m)}</div>
        </div>
        <div class="ledger-sum-card">
          <div class="ledger-sum-label">إجمالي الدائن</div>
          <div class="ledger-sum-val" style="color:#34d399">${h(r)}</div>
        </div>
        <div class="ledger-sum-card">
          <div class="ledger-sum-label">الرصيد الختامي</div>
          <div class="ledger-sum-val" style="color:${y>=0?"#10b981":"#ef4444"}">
            ${h(Math.abs(y))} ${y>=0?s?"مدين":"دائن":s?"دائن":"مدين"}
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
              <td style="text-align:right;font-weight:800;padding:8px 12px">${h(l)}</td>
            </tr>
            ${g.join("")||'<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-2)">لا توجد حركات في هذه الفترة</td></tr>'}
          </tbody>
        </table>
      </div>`}catch(n){t.innerHTML=`<div class="alert bad" style="margin:14px">${n.message}</div>`}};window.printLedger=()=>window.print();function Se(){document.addEventListener("click",t=>{!t.target.closest(".je-acc-search-wrap")&&!t.target.closest(".je-acc-dropdown")&&document.querySelectorAll(".je-acc-dropdown").forEach(e=>e.classList.add("hidden"))})}async function me(){let t={name:"شركة نظم الإمداد المتطورة",nameEn:"Modern Supply Systems Co.",crNumber:"7054969006",vatNumber:"314996148100003",phone:"0549141648",email:"Nuzmalamdad@gmail.com",address:"مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414",logoUrl:""};try{const e=localStorage.getItem("idham_company");e&&Object.assign(t,JSON.parse(e))}catch{}try{const e=await ae(fsDoc(S,`companies/${M}/settings`,"company"));if(e.exists()){const o=e.data();t.name=o.name||o.companyName||t.name,t.nameEn=o.nameEn||o.legalName||t.nameEn,t.crNumber=o.crNumber||o.cr||t.crNumber,t.vatNumber=o.vatNumber||o.vat||t.vatNumber,t.phone=o.phone||t.phone,t.email=o.email||t.email,t.address=o.address?o.city?`${o.address} — ${o.city}`:o.address:t.address}const a=await ae(fsDoc(S,`companies/${M}/settings`,"logo"));a.exists()&&(t.logoUrl=a.data().dataUrl||a.data().logoUrl||t.logoUrl||"")}catch(e){console.warn("Failed to load company details for journal printing:",e)}return t}function Me(t,e){const a={manual:"يدوي",salesInvoice:"مبيعات",purchaseInvoice:"مشتريات",salesReturn:"مردود بيع",purchaseReturn:"مردود شراء",reversing:"عكسي",pos:"POS",stockTransfer:"تحويل مخزني",salesCOGS:"تكلفة مبيعات"},o=e.name||"شركة نظم الإمداد المتطورة",n=e.nameEn||"Modern Supply Systems Co.",i=e.address||"مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414",s=e.phone||"0549141648";e.email;const p=e.vatNumber||"314996148100003",l=e.crNumber||"7054969006",d=e.logoUrl||"",m=(t.lines||[]).reduce((c,T)=>c+(T.debit||0),0),r=(t.lines||[]).reduce((c,T)=>c+(T.credit||0),0),g=(t.status||"posted")==="posted",y=Math.abs(m-r)<.01,u=(t.lines||[]).filter(c=>c.serviceProvider||c.taxNumber||c.invoiceRef),v=u.reduce((c,T)=>c||(T.serviceProvider||"").trim(),"")||(t.supplierName||t.vendorName||t.entityName||"").trim(),k=u.reduce((c,T)=>c||(T.taxNumber||"").trim(),"")||(t.taxNumber||t.supplierVatNumber||"").trim(),j=u.reduce((c,T)=>c||(T.invoiceRef||"").trim(),"")||(t.taxInvoiceNumber||t.reference||"").trim(),E=(t.lines||[]).find(c=>(c.debit||0)>0&&(c.accountCode==="2-1-1-2"||c.accountCode==="2-1-3-2"||c.accountCode==="2-2-1-2"||c.accountCode==="2-2-2"||c.accountName&&(c.accountName.includes("المدخلات")||c.accountName.includes("القيمة المضافة")))),I=E&&E.debit||0,O=(t.lines||[]).find(c=>c!==E&&(c.debit||0)>0),N=O?O.debit||0:I>0?Math.round(I/.15*100)/100:m-I,C=m,$=!!(v||k||j||E);return`
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>${$?"سند قيد ضريبي وفاتورة معتمدة":"سند قيد محاسبي"} — ${t.entryNumber||t.id}</title>
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
          ${d?`<img src="${d}" style="height:64px;width:64px;object-fit:contain;background:#fff;border-radius:8px;padding:4px;box-shadow:0 2px 4px rgba(0,0,0,0.1);" />`:'<div style="width:60px;height:60px;background:rgba(255,255,255,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:28px;">🏢</div>'}
          <div>
            <div style="font-size:19px;font-weight:900;color:#fff !important;line-height:1.2;">${o}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.9) !important;margin-top:2px;">${n} | 📍 ${i}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.95) !important;margin-top:4px;display:flex;flex-wrap:wrap;gap:14px;">
              ${`<span>📞 الهاتف: <strong>${s}</strong></span>`}
              ${`<span>🧾 الرقم الضريبي: <strong>${p}</strong></span>`}
              ${`<span>📋 سجل تجاري: <strong>${l}</strong></span>`}
            </div>
          </div>
        </div>
        <div class="v-badge-box">
          <div style="font-size:18px;font-weight:900;color:#fff !important;">
            ${$?"سند قيد ضريبي معتمد":"سند قيد محاسبي"}
          </div>
          <div style="font-size:10.5px;color:rgba(255,255,255,0.9) !important;letter-spacing:0.5px;">
            ${$?"TAX JOURNAL VOUCHER (ZATCA)":"JOURNAL VOUCHER"}
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
        <div class="v-meta-val">${$?"قيد ضريبي / خدمات":a[t.sourceType]||t.sourceType||"يدوي"}</div>
      </div>
      <div class="v-meta-card">
        <div class="v-meta-label">حالة الترحيل</div>
        <div class="v-meta-val" style="color:${g?"#059669":"#d97706"}">${g?"مرحّل نظامياً ✓":"مسودة"}</div>
      </div>
    </div>

    <!-- Prominent Supplier & Tax Details Card -->
    ${$?`
      <div class="v-tax-box">
        <div style="font-size:11px;font-weight:800;color:#166534;margin-bottom:8px;display:flex;align-items:center;gap:6px;">
          <span>📋 بيانات المورد والفاتورة الضريبية المرجعية (ZATCA Tax Reference):</span>
        </div>
        <div class="v-tax-grid">
          <div>
            <div class="v-tax-item-label">🏢 اسم المورد / مقدم الخدمة</div>
            <div class="v-tax-item-val">${v||"مورد خدمات"}</div>
          </div>
          <div>
            <div class="v-tax-item-label">🧾 الرقم الضريبي للمورد</div>
            <div class="v-tax-item-val" style="font-family:monospace;color:#1e3a8a;">${k||"—"}</div>
          </div>
          <div>
            <div class="v-tax-item-label">📄 رقم فاتورة المورد الضريبية</div>
            <div class="v-tax-item-val" style="font-family:monospace;color:#4338ca;">${j||t.reference||"—"}</div>
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
          <div class="val">${h(N)} ر.س</div>
        </div>
        <div class="v-tax-card vat">
          <div class="lbl">ضريبة القيمة المضافة 15% (مدخلات مستردة)</div>
          <div class="val">${h(I>0?I:Math.round(N*.15*100)/100)} ر.س</div>
        </div>
        <div class="v-tax-card total">
          <div class="lbl">الإجمالي شامل الضريبة</div>
          <div class="val">${h(C)} ر.س</div>
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
        ${(t.lines||[]).map((c,T)=>{const R=c.accountCode==="2-1-1-2"||c.accountCode==="2-1-3-2"||c.accountCode==="2-2-1-2"||c.accountCode==="2-2-2"||c.accountName&&c.accountName.includes("المدخلات");return`
          <tr>
            <td style="text-align:center;color:#64748b;font-size:11px;">${T+1}</td>
            <td style="font-family:monospace;font-weight:700;color:#1d4ed8;">${c.accountCode||"—"}</td>
            <td style="font-weight:700;">
              ${c.accountName||"—"}
              ${R?'<span style="background:#dcfce7;color:#15803d;font-size:9.5px;padding:2px 6px;border-radius:4px;font-weight:800;margin-right:6px;">🏷️ ضريبة مدخلات 15%</span>':""}
            </td>
            <td>
              <div style="font-weight:600;color:#0f172a;">${c.note||t.description||"—"}</div>
              ${c.serviceProvider||c.taxNumber||c.invoiceRef?`
                <div style="font-size:10px;color:#334155;margin-top:3px;background:#f1f5f9;padding:2px 6px;border-radius:4px;display:inline-block;border:1px dashed #cbd5e1;">
                  ${c.serviceProvider?`مورد: <strong>${c.serviceProvider}</strong> `:""}
                  ${c.taxNumber?`| ضريبي: <strong>${c.taxNumber}</strong> `:""}
                  ${c.invoiceRef?`| فاتورة: <strong>${c.invoiceRef}</strong>`:""}
                </div>
              `:""}
            </td>
            <td style="text-align:right;font-family:monospace;font-weight:${c.debit?"800":"400"};color:${c.debit?"#dc2626":"#94a3b8"};">
              ${c.debit?h(c.debit)+" ر.س":"—"}
            </td>
            <td style="text-align:right;font-family:monospace;font-weight:${c.credit?"800":"400"};color:${c.credit?"#16a34a":"#94a3b8"};">
              ${c.credit?h(c.credit)+" ر.س":"—"}
            </td>
          </tr>
        `}).join("")}
        <tr class="v-totals-row">
          <td colspan="4" style="text-align:right;padding:10px;">
            الإجمالي الكلي للقيد المحاسبي
            <span style="font-size:11px;font-weight:700;color:${y?"#059669":"#dc2626"};margin-right:12px;">
              (${y?"✓ القيد متوازن ومطابق نظامياً":"⚠️ غير متوازن"})
            </span>
          </td>
          <td style="text-align:right;color:#dc2626;font-family:monospace;font-weight:900;">${h(m)} ر.س</td>
          <td style="text-align:right;color:#16a34a;font-family:monospace;font-weight:900;">${h(r)} ر.س</td>
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
  `}function _e(t,e,a){const o=e.name||"شركة نظم الإمداد المتطورة";e.nameEn;const n=e.address||"مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414",i=e.phone||"0549141648",s=e.vatNumber||"314996148100003";e.crNumber;const p=e.logoUrl||"",l={manual:"يدوي",salesInvoice:"مبيعات",purchaseInvoice:"مشتريات",salesReturn:"مردود بيع",purchaseReturn:"مردود شراء",reversing:"عكسي",pos:"POS"},d=t.reduce((r,g)=>r+Math.max(parseFloat(g.totalDebit||0)||0,(g.lines||[]).reduce((y,u)=>y+(parseFloat(u.debit||0)||0),0)),0),m=t.reduce((r,g)=>r+Math.max(parseFloat(g.totalCredit||0)||0,(g.lines||[]).reduce((y,u)=>y+(parseFloat(u.credit||0)||0),0)),0);return`
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
          ${p?`<img src="${p}" style="height:56px;width:56px;object-fit:contain;background:#fff;border-radius:8px;padding:3px;" />`:'<div style="width:50px;height:50px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;">🏢</div>'}
          <div>
            <div style="font-size:18px;font-weight:900;color:#fff !important;">${o}</div>
            <div style="font-size:10.5px;color:rgba(255,255,255,0.9) !important;margin-top:2px;">📍 ${n} | 📞 ${i} | 🔢 ضريبي: ${s}</div>
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
      <span>🏷️ نوع القيود: <strong>${a.typeF?l[a.typeF]||a.typeF:"الكل"}</strong></span>
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
        ${t.map((r,g)=>{const y=Math.max(parseFloat(r.totalDebit||0)||0,(r.lines||[]).reduce((v,k)=>v+(parseFloat(k.debit||0)||0),0)),u=Math.max(parseFloat(r.totalCredit||0)||0,(r.lines||[]).reduce((v,k)=>v+(parseFloat(k.credit||0)||0),0));return`
            <tr>
              <td style="text-align:center;color:#64748b;font-size:10.5px;">${g+1}</td>
              <td style="font-family:monospace;font-size:11px;">${r.date||""}</td>
              <td style="font-family:monospace;font-weight:700;color:#1d4ed8;">${r.entryNumber||r.id.slice(0,8)}</td>
              <td>${r.description||"—"}</td>
              <td>${l[r.sourceType]||r.sourceType||"يدوي"}</td>
              <td>${(r.status||"posted")==="posted"?"مرحّل":"مسودة"}</td>
              <td style="text-align:right;font-family:monospace;font-weight:700;color:#1e40af;">${h(y)}</td>
              <td style="text-align:right;font-family:monospace;font-weight:700;color:#047857;">${h(u)}</td>
              <td style="font-size:10.5px;color:#64748b;">${r.createdByName||"—"}</td>
            </tr>
          `}).join("")}
        <tr class="r-totals">
          <td colspan="6" style="text-align:right;padding:10px;">إجمالي حركات دفتر اليومية العامة</td>
          <td style="text-align:right;color:#1e40af;font-family:monospace;">${h(d)}</td>
          <td style="text-align:right;color:#047857;font-family:monospace;">${h(m)}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>
  `}function xe(t){if(!t)return!1;const e=(t.description||"").toLowerCase(),a=["راتب","رواتب","مسير","مستحقات","سلفة","سلفه","سلف","مكافأة","مكافآت","مكافات","أجور","اجور","حوافز","بدل","إكرامية","اكرامية"];return a.some(n=>e.includes(n))?!0:(t.lines||[]).some(n=>{const i=n.accountCode||"",s=(n.accountName||"").toLowerCase();return i.startsWith("2-1-5")||i.startsWith("5-2-1")||i.startsWith("5-2-2")||i.startsWith("5-2-3")||i.startsWith("5-2-7")||i.startsWith("1-1-3")?!0:a.some(p=>s.includes(p))})}window.isSalaryRelatedEntry=xe;function Re(t,e=[],a=[],o=[]){const n=t.lines||[],i=(t.description||"")+" "+(t.notes||"");let s="",p="",l="",d=null;for(const f of n){const b=f.accountCode||"",w=f.accountName||"";if(b.startsWith("2-1-5")||b.startsWith("1-1-5-4")||b.startsWith("1-1-3")||w.includes("مستحقات")||w.includes("سلف")){b.startsWith("2-1-5")&&(p=b),(b.startsWith("1-1-5-4")||b.startsWith("1-1-3"))&&(l=b);let L=w.replace(/مستحقات\s+الموظف\s*/g,"").replace(/مستحقات\s+المندوب\s*/g,"").replace(/مستحقات\s+الاستاذ\s*\/?\s*/g,"").replace(/مستحقات\s*/g,"").replace(/سلف\s+الموظف\s*/g,"").replace(/سلف\s+المندوب\s*/g,"").replace(/سلفة\s+الموظف\s*/g,"").replace(/سلف\s*/g,"").replace(/سلفة\s*/g,"").replace(/الموظف\s*/g,"").replace(/المندوب\s*/g,"").trim();L&&L.length>1&&!L.includes("الموظفين")&&(s=L)}}if(!s&&i){const f=i.match(/(?:للموظف|للمندوب|الموظف|المندوب|مرتب|راتب|الاستاذ)\s+([^\s,]+(?:\s+[^\s,]+)?)/);if(f&&f[1]){let b=f[1].replace(/شهر\s*\d+/g,"").replace(/شهرين/g,"").trim();b&&(s=b)}}const m=Array.isArray(e)&&e.length>0?e:window._cachedEmployees||[];s&&m.length>0&&(d=m.find(f=>{const b=(f.name||"").trim().toLowerCase(),w=s.toLowerCase();return b===w||b.includes(w)||w.includes(b)}));const r=d?.name||s||"الموظف المستحق",g=d?.job||d?.position||d?.role||"مندوب مبيعات / موظف",y=d?.nid||d?.nationalId||d?.iqama||"—",u=d?.code||d?.empNumber||"—",v=d?.iban||"—",k=parseFloat(d?.salary||0)||0;let j="";const E=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],I=i.replace(/شهرين/g,"").replace(/شهرياً/g,"").replace(/شهريا/g,""),O=I.match(/شهر\s*([0-9]{1,2})/),N=I.match(/شهر\s*(يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر|محرم|صفر|رجب|شعبان|رمضان|شوال)/);let C="";if(O&&O[1]){const f=parseInt(O[1],10),b=f<10?`0${f}`:`${f}`,w=t.date?t.date.slice(0,4):new Date().getFullYear();j=`شهر ${b} (${E[f-1]||""}) / ${w}`,C=`${w}-${b}`}else if(N&&N[1])j=`شهر ${N[1]}`;else if(t.date){const f=t.date.split("-");if(f.length>=2){let b=parseInt(f[1],10)-1,w=f[0];parseInt(f[2]||"15",10)<=7&&b>0&&(b-=1);const B=b+1<10?`0${b+1}`:`${b+1}`;j=`شهر ${B} (${E[b]||""}) / ${w}`,C=`${w}-${B}`}}const $=Array.isArray(o)&&o.length>0?o:typeof A<"u"&&Array.isArray(A)?A:window._accounts||[];if(!p&&$.length>0){const f=$.find(b=>(b.code||"").startsWith("2-1-5")&&((b.nameAr||"").includes(r)||(b.name||"").includes(r)));f&&(p=f.code)}if(!l&&$.length>0){const f=$.find(b=>(b.code||"").startsWith("1-1-5-4")&&((b.nameAr||"").includes(r)||(b.name||"").includes(r)));f&&(l=f.code)}let c=0;const T=[];for(const f of n){const b=parseFloat(f.credit||0)||0,w=f.accountCode||"",L=f.accountName||"";if(b>0&&!w.startsWith("1-1-5-4")&&!L.includes("سلف")){let B="نقدي / عهدة";w.startsWith("1-1-1")?B="نقداً من الصندوق الرئيسي":w.startsWith("1-1-2")?B="تحويل بنكي رسمي":w.startsWith("3-1-4")?B="جاري المالك / حساب الإدارة":B=L||"صرف مباشر",T.push({accountName:L,accountCode:w,method:B,amount:b}),c+=b}}if(c===0)for(const f of n){const b=parseFloat(f.debit||0)||0;b>0&&(c+=b)}const R=Array.isArray(a)&&a.length>0?a:window._allEntries||[];let z=0,V=[],J=0,Z=0;for(const f of R){const b=f.date||"",w=(f.description||"")+" "+(f.notes||""),L=C?b.startsWith(C):!0;for(const B of f.lines||[]){const Y=B.accountCode||"",ee=B.accountName||"",se=parseFloat(B.debit||0)||0,te=parseFloat(B.credit||0)||0,he=p&&Y===p||!p&&Y.startsWith("2-1-5")&&(ee.includes(r)||w.includes(r)),Ce=l&&Y===l||!l&&(Y.startsWith("1-1-5-4")||Y.startsWith("1-1-3")||ee.includes("سلف"))&&(ee.includes(r)||w.includes(r));he&&te>0&&(L||Math.abs((new Date(b)-new Date(t.date))/(1e3*3600*24))<=35)&&te>z&&(z=te),he&&se>0&&f.id!==t.id&&L&&(w.includes("مخالف")||w.includes("جزاء")||w.includes("خصم")||ee.includes("خصم")||(B.note||"").includes("مخالف"))&&V.push({title:w.replace(/اثبات\s*/g,"").trim()||"خصومات ومخالفات",accountName:ee,accountCode:Y,amount:se}),Ce&&(se>0&&(L||Math.abs((new Date(b)-new Date(t.date))/(1e3*3600*24))<=40)&&(J+=se),te>0&&f.id!==t.id&&b<(t.date||"9999")&&b<(C?`${C}-15`:"2026-09-15")&&(Z+=te))}}z===0&&(k>0?z=k:z=c);const Q=[{title:"الراتب الأساسي والمستحق",accountName:"مستحقات الموظف",accountCode:p||"2-1-5",note:`استحقاق ${j}`,amount:z}];for(const f of n){const b=parseFloat(f.debit||0)||0,w=f.accountCode||"",L=f.accountName||"";b>0&&(w.startsWith("5-2-7")||L.includes("مكافآت")||L.includes("حوافز"))&&Q.push({title:"مكافآت وحوافز تشجيعية",accountName:L,accountCode:w,note:f.note||"",amount:b})}const X=Q.reduce((f,b)=>f+(b.amount||0),0),q=[];let ie=0;for(const f of V)q.push(f),ie+=f.amount;let F=X-ie-c;F<0&&(F=0),F>0&&q.push({title:"استقطاع قسط سلفة عن الشهر (تقسيط السلف)",accountName:"سلف الموظفين",accountCode:l||"1-1-5-4",note:`قسط مستقطع من راتب ${j}`,amount:F});const ve=q.reduce((f,b)=>f+(b.amount||0),0);let re=Math.max(0,J-Z);re<=0&&F>0&&(re=F*2);const Ee=Math.max(0,re-F),Ie=Math.max(0,X-ve-c);return{voucherNumber:t.entryNumber?`SAL-${t.entryNumber.replace(/[^0-9A-Za-z_-]/g,"")}`:`SAL-${t.id.slice(-6).toUpperCase()}`,jeNumber:t.entryNumber||t.id,date:t.date||D(),month:j||`شهر ${t.date?.slice(0,7)||D().slice(0,7)}`,employeeName:r,jobTitle:g,nid:y,empCode:u,iban:v,paymentMethod:T.map(f=>f.method).join(" + ")||"صرف نقدي / إداري",generalDescription:i||`إثبات صرف راتب ${r}`,earnings:Q,deductions:q,totalGross:X,totalDeduct:ve,netAmount:c,totalAdvancesIssued:re,advanceDeductedThisVoucher:F,remainingAdvances:Ee,remainingDuesForMonth:Ie,amountInWords:typeof we=="function"?we(c):`${h(c)} ريال سعودي`}}function Je(t,e,a=[],o=[],n=[]){const i=e.name||"شركة نظم الإمداد المتطورة",s=e.nameEn||"Modern Supply Systems Co.";e.address;const p=e.phone||"0549141648",l=e.vatNumber||"314996148100003",d=e.crNumber||"7054969006",m=e.logoUrl||"",r=Re(t,a,o,n);return`
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>سند صرف واستلام راتب ومسير — ${r.employeeName} — ${r.voucherNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', Arial, sans-serif;
      direction: rtl;
      color: #0f172a;
      background: #fff;
      padding: 16px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @media print {
      body { padding: 0; }
      @page { size: A4 portrait; margin: 5mm 6mm; }
      .no-print { display: none !important; }
    }
    .sal-container {
      max-width: 860px;
      margin: 0 auto;
      border: 1.5px solid #cbd5e1;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    }
    /* Header */
    .sal-header {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%) !important;
      padding: 14px 20px;
      color: #fff !important;
    }
    .sal-header-gold {
      height: 4px;
      background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b) !important;
    }
    .sal-badge-box {
      background: rgba(255,255,255,0.18) !important;
      border: 1px solid rgba(255,255,255,0.35) !important;
      border-radius: 12px;
      padding: 8px 18px;
      text-align: center;
    }
    /* Metadata Grid */
    .sal-meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 8px 16px;
    }
    .sal-meta-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 6px 10px;
      text-align: center;
    }
    .sal-meta-label { font-size: 10px; color: #64748b; font-weight: 700; margin-bottom: 2px; }
    .sal-meta-val { font-size: 12px; font-weight: 800; color: #0f172a; }

    /* Employee Profile Box */
    .sal-emp-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-right: 5px solid #2563eb;
      border-radius: 10px;
      margin: 10px 16px;
      padding: 8px 14px;
    }
    .sal-emp-grid {
      display: grid;
      grid-template-columns: 1.5fr 1.2fr 1.2fr 1fr;
      gap: 10px;
    }
    .sal-emp-item-lbl { font-size: 10px; color: #1e40af; font-weight: 700; margin-bottom: 2px; }
    .sal-emp-item-val { font-size: 12.5px; font-weight: 800; color: #0f172a; }

    /* Financial Position Summary Bar (4 Cards) */
    .sal-summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin: 0 16px 10px 16px;
    }
    .sal-summary-card {
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      padding: 8px 10px;
      text-align: center;
    }
    .sal-sum-lbl { font-size: 10px; font-weight: 800; margin-bottom: 2px; }
    .sal-sum-val { font-size: 13.5px; font-weight: 900; font-family: monospace; }
    .sal-sum-sub { font-size: 9px; color: #64748b; margin-top: 2px; }

    /* Breakdown 2-Column Section */
    .sal-breakdown-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 0 16px 10px 16px;
    }
    .sal-panel {
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .sal-panel.earnings { border-color: #a7f3d0; background: #fff; }
    .sal-panel.deductions { border-color: #fecaca; background: #fff; }
    
    .sal-panel-head {
      padding: 6px 12px;
      font-weight: 800;
      font-size: 11.5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .sal-panel.earnings .sal-panel-head { background: #d1fae5; color: #065f46; }
    .sal-panel.deductions .sal-panel-head { background: #fee2e2; color: #991b1b; }

    .sal-items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .sal-items-table td {
      padding: 6px 10px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    .sal-items-table tr:last-child td { border-bottom: none; }
    .sal-panel-foot {
      padding: 6px 12px;
      font-weight: 800;
      font-size: 11.5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e2e8f0;
    }
    .sal-panel.earnings .sal-panel-foot { background: #ecfdf5; color: #047857; }
    .sal-panel.deductions .sal-panel-foot { background: #fef2f2; color: #b91c1c; }

    /* Net Pay Ribbon */
    .sal-net-ribbon {
      margin: 0 16px 8px 16px;
      background: linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%);
      border-radius: 10px;
      padding: 10px 16px;
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(4,120,87,0.2);
    }
    .sal-net-val {
      font-size: 21px;
      font-weight: 900;
      font-family: monospace;
      letter-spacing: 0.5px;
    }

    /* Tafqeet & Notes */
    .sal-tafqeet-box {
      margin: 0 16px 8px 16px;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      padding: 7px 12px;
      font-size: 11px;
    }

    /* Legal Acknowledgment Box */
    .sal-legal-box {
      margin: 0 16px 10px 16px;
      background: #fffbeb;
      border: 1.5px solid #fde68a;
      border-right: 5px solid #f59e0b;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 10.5px;
      line-height: 1.5;
      color: #92400e;
    }

    /* Signatures */
    .sal-sigs {
      display: grid;
      grid-template-columns: 1.2fr 1fr 1fr;
      gap: 8px;
      margin: 0 16px 12px 16px;
    }
    .sal-sig-box {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
      text-align: center;
    }
    .sal-sig-title { font-size: 10px; font-weight: 800; color: #334155; margin-bottom: 24px; }
    .sal-sig-line { border-top: 1px dashed #94a3b8; padding-top: 4px; font-size: 9px; color: #64748b; }

    /* Footer */
    .sal-footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 6px 16px;
      display: flex;
      justify-content: space-between;
      font-size: 9.5px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <!-- ═══ TOP PRINT CONTROLS (NO PRINT) ═══ -->
  <div class="no-print" style="max-width:860px; margin:0 auto 12px auto; display:flex; justify-content:space-between; align-items:center; background:#0f172a; color:#fff; padding:10px 18px; border-radius:10px; box-shadow:0 4px 14px rgba(0,0,0,0.18);">
    <div style="font-size:13.5px; font-weight:800; display:flex; align-items:center; gap:8px;">
      <span style="font-size:18px;">📄</span>
      <span>معاينة سند صرف الراتب — <strong style="color:#60a5fa;">${r.employeeName}</strong> (${r.month})</span>
    </div>
    <div style="display:flex; gap:10px; align-items:center;">
      <button onclick="window.print()" style="background:#059669; color:#fff; border:none; padding:8px 22px; border-radius:8px; font-weight:800; font-size:13.5px; font-family:'Cairo',sans-serif; cursor:pointer; display:inline-flex; align-items:center; gap:6px; box-shadow:0 2px 8px rgba(5,150,105,0.4);">
        <span>🖨️</span> طباعة السند الآن
      </button>
      <button onclick="window.close()" style="background:#475569; color:#fff; border:none; padding:8px 16px; border-radius:8px; font-weight:700; font-size:12px; font-family:'Cairo',sans-serif; cursor:pointer;">
        ✕ إغلاق
      </button>
    </div>
  </div>

  <div class="sal-container">
    
    <!-- ═══ HEADER ═══ -->
    <div class="sal-header">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:14px;">
        <div style="display:flex;align-items:center;gap:12px;">
          ${m?`<img src="${m}" alt="Logo" style="height:48px;max-width:90px;object-fit:contain;background:#fff;padding:2px;border-radius:6px;" />`:'<div style="font-size:26px;">🏢</div>'}
          <div>
            <div style="font-size:15px;font-weight:900;letter-spacing:-0.3px;color:#fff;">${i}</div>
            <div style="font-size:10px;opacity:0.85;font-weight:600;color:#fff;">${s}</div>
            <div style="font-size:9px;opacity:0.8;margin-top:2px;color:#fff;">
              <span>الهاتف: <strong>${p}</strong></span> |
              <span>الرقم الضريبي: <strong>${l}</strong></span> |
              <span>سجل تجاري: <strong>${d}</strong></span>
            </div>
          </div>
        </div>

        <div class="sal-badge-box">
          <div style="font-size:15px;font-weight:900;color:#fff !important;">سند صرف واستلام راتب</div>
          <div style="font-size:9.5px;color:rgba(255,255,255,0.9) !important;letter-spacing:0.5px;">SALARY PAYMENT & PAYSLIP VOUCHER</div>
        </div>
      </div>
    </div>
    <div class="sal-header-gold"></div>

    <!-- ═══ METADATA STRIP ═══ -->
    <div class="sal-meta-grid">
      <div class="sal-meta-card">
        <div class="sal-meta-label">رقم السند</div>
        <div class="sal-meta-val mono" style="color:#047857;">${r.voucherNumber}</div>
      </div>
      <div class="sal-meta-card">
        <div class="sal-meta-label">تاريخ الصرف</div>
        <div class="sal-meta-val mono">${r.date}</div>
      </div>
      <div class="sal-meta-card">
        <div class="sal-meta-label">شهر الاستحقاق</div>
        <div class="sal-meta-val" style="color:#1d4ed8;">${r.month}</div>
      </div>
      <div class="sal-meta-card">
        <div class="sal-meta-label">طريقة ومصدر الصرف</div>
        <div class="sal-meta-val" style="font-size:10.5px;">${r.paymentMethod}</div>
      </div>
    </div>

    <!-- ═══ EMPLOYEE PROFILE BOX ═══ -->
    <div class="sal-emp-box">
      <div class="sal-emp-grid">
        <div>
          <div class="sal-emp-item-lbl">👤 اسم الموظف المستحق</div>
          <div class="sal-emp-item-val" style="font-size:13px;color:#1e3a8a;">${r.employeeName}</div>
        </div>
        <div>
          <div class="sal-emp-item-lbl">💼 المسمى الوظيفي</div>
          <div class="sal-emp-item-val">${r.jobTitle}</div>
        </div>
        <div>
          <div class="sal-emp-item-lbl">🆔 رقم الهوية / الإقامة</div>
          <div class="sal-emp-item-val mono">${r.nid}</div>
        </div>
        <div>
          <div class="sal-emp-item-lbl">📑 رقم القيد المرجعي</div>
          <div class="sal-emp-item-val mono" style="color:#6366f1;">${r.jeNumber}</div>
        </div>
      </div>
    </div>

    <!-- ═══ FINANCIAL POSITION & LEDGER SUMMARY BAR ═══ -->
    <div class="sal-summary-grid">
      <div class="sal-summary-card" style="border-color:#bfdbfe;background:#eff6ff;">
        <div class="sal-sum-lbl" style="color:#1e40af;">💼 إجمالي الراتب المستحق</div>
        <div class="sal-sum-val" style="color:#1e3a8a;">${h(r.totalGross)} ر.س</div>
        <div class="sal-sum-sub">الاستحقاق المسجل بالدفاتر</div>
      </div>

      <div class="sal-summary-card" style="border-color:#fecaca;background:#fef2f2;">
        <div class="sal-sum-lbl" style="color:#991b1b;">💳 إجمالي الاستقطاعات</div>
        <div class="sal-sum-val" style="color:#b91c1c;">${h(r.totalDeduct)} ر.س</div>
        <div class="sal-sum-sub">مخالفات + قسط السلفة المستقطع</div>
      </div>

      <div class="sal-summary-card" style="border-color:#a7f3d0;background:#ecfdf5;">
        <div class="sal-sum-lbl" style="color:#065f46;">💵 الصافي المنصرف بالسند</div>
        <div class="sal-sum-val" style="color:#047857;">${h(r.netAmount)} ر.س</div>
        <div class="sal-sum-sub">المبلغ المستلم فعلياً</div>
      </div>

      <div class="sal-summary-card" style="border-color:#fed7aa;background:#fff7ed;">
        <div class="sal-sum-lbl" style="color:#9a3412;">⚖️ الموقف المالي بعد الصرف</div>
        <div class="sal-sum-val" style="color:#c2410c;font-size:12px;">${r.remainingAdvances>0?`متبقي سلف: ${h(r.remainingAdvances)} ر.س`:r.remainingDuesForMonth>0?`متبقي له: ${h(r.remainingDuesForMonth)} ر.س`:"0.00 (مسدد بالكامل)"}</div>
        <div class="sal-sum-sub">${r.remainingAdvances>0?"رصيد سلف مؤجل للشهر القادم":"تمت تسوية استحقاق الفترة"}</div>
      </div>
    </div>

    <!-- ═══ BREAKDOWN 2-COLUMN SECTION ═══ -->
    <div class="sal-breakdown-section">
      
      <!-- 1. Earnings (الاستحقاقات) -->
      <div class="sal-panel earnings">
        <div class="sal-panel-head">
          <span>➕ مفردات الاستحقاقات والمكافآت</span>
          <span style="font-size:10px;">(Earnings)</span>
        </div>
        <table class="sal-items-table">
          <tbody>
            ${r.earnings.length===0?`
              <tr><td style="color:#94a3b8;text-align:center;">لا توجد بنود استحقاق مسجلة</td></tr>
            `:r.earnings.map(g=>`
              <tr>
                <td>
                  <strong style="color:#0f172a;">${g.title}</strong>
                  <div style="font-size:9px;color:#64748b;">${g.note||g.accountName} (${g.accountCode})</div>
                </td>
                <td class="mono font-bold" style="text-align:left;color:#047857;font-size:11.5px;white-space:nowrap;">
                  +${h(g.amount)} ر.س
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="sal-panel-foot">
          <span>إجمالي الاستحقاقات:</span>
          <span class="mono font-bold" style="font-size:12px;">${h(r.totalGross)} ر.س</span>
        </div>
      </div>

      <!-- 2. Deductions (الاستقطاعات) -->
      <div class="sal-panel deductions">
        <div class="sal-panel-head">
          <span>➖ مفردات الاستقطاعات والسلف</span>
          <span style="font-size:10px;">(Deductions)</span>
        </div>
        <table class="sal-items-table">
          <tbody>
            ${r.deductions.length===0?`
              <tr><td style="color:#94a3b8;text-align:center;padding:12px;">لا توجد استقطاعات أو سلف</td></tr>
            `:r.deductions.map(g=>`
              <tr>
                <td>
                  <strong style="color:#0f172a;">${g.title}</strong>
                  <div style="font-size:9px;color:#64748b;">${g.note||g.accountName} (${g.accountCode})</div>
                </td>
                <td class="mono font-bold" style="text-align:left;color:#b91c1c;font-size:11.5px;white-space:nowrap;">
                  -${h(g.amount)} ر.س
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="sal-panel-foot">
          <span>إجمالي الاستقطاعات:</span>
          <span class="mono font-bold" style="font-size:12px;">${h(r.totalDeduct)} ر.س</span>
        </div>
      </div>

    </div>

    <!-- ═══ NET SALARY RIBBON ═══ -->
    <div class="sal-net-ribbon">
      <div>
        <div style="font-size:11px;opacity:0.9;font-weight:700;">💰 صافي الراتب المنصرف للموظف</div>
        <div style="font-size:9px;opacity:0.8;">Net Salary Payable</div>
      </div>
      <div style="text-align:left;">
        <span class="sal-net-val">${h(r.netAmount)}</span>
        <span style="font-size:12px;font-weight:700;margin-right:4px;">ريال سعودي</span>
      </div>
    </div>

    <!-- ═══ TAFQEET & DESCRIPTION ═══ -->
    <div class="sal-tafqeet-box">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">
        <div>
          <strong>✍️ المبلغ كتابةً وتفقيطاً:</strong>
          <span style="color:#047857;font-weight:800;margin-right:6px;">فقط ${r.amountInWords} لا غير.</span>
        </div>
        <div style="font-size:9.5px;color:#64748b;">
          البيان: <strong>${r.generalDescription}</strong>
        </div>
      </div>
    </div>

    <!-- ═══ LEGAL ACKNOWLEDGMENT ═══ -->
    <div class="sal-legal-box">
      <strong>📝 إقرار واستلام الموظف وبراءة ذمة:</strong>
      <p style="margin-top:2px;">
        أقر أنا الموظف الموضحة بياناتي أعلاه بأنني استلمت كامل صافي راتبي ومستحقاتي ومكافآتي عن شهر (<strong>${r.month}</strong>) الموضحة في هذا السند، ولا يحق لي المطالبة بأي مبالغ أخرى أو متأخرات عن هذه الفترة لدى الشركة، ويعد توقيعي أدناه إقراراً نهائياً بالاستلام وبراءة ذمة شاملة.
      </p>
    </div>

    <!-- ═══ 3 SIGNATURE BOXES ═══ -->
    <div class="sal-sigs">
      
      <!-- 1. Employee Signature -->
      <div class="sal-sig-box" style="border:1.5px solid #2563eb;background:#f8fafc;">
        <div class="sal-sig-title" style="color:#1e3a8a;">
          ✍️ توقيع واستلام الموظف
          <div style="font-size:8.5px;color:#64748b;font-weight:normal;margin-top:1px;">(Employee Signature)</div>
        </div>
        <div style="text-align:right;font-size:9.5px;color:#334155;margin-bottom:4px;">
          الاسم: <strong>${r.employeeName}</strong>
        </div>
        <div class="sal-sig-line">
          التوقيع / البصمة: ............................................
        </div>
      </div>

      <!-- 2. Cashier / Accountant -->
      <div class="sal-sig-box">
        <div class="sal-sig-title">
          💼 أمين الصندوق / المحاسب الصارف
          <div style="font-size:8.5px;color:#64748b;font-weight:normal;margin-top:1px;">(Cashier / Accountant)</div>
        </div>
        <div style="text-align:right;font-size:9.5px;color:#334155;margin-bottom:4px;">
          الاسم: <strong>${t.createdByName||"المحاسب المسؤول"}</strong>
        </div>
        <div class="sal-sig-line">
          التوقيع: ............................................
        </div>
      </div>

      <!-- 3. General Management Approval -->
      <div class="sal-sig-box">
        <div class="sal-sig-title">
          🏢 اعتماد الإدارة العامة والختم
          <div style="font-size:8.5px;color:#64748b;font-weight:normal;margin-top:1px;">(Management Stamp)</div>
        </div>
        <div style="text-align:right;font-size:9.5px;color:#334155;margin-bottom:4px;">
          الاعتماد: <strong>${i}</strong>
        </div>
        <div class="sal-sig-line">
          الختم والتوقيع: ............................................
        </div>
      </div>

    </div>

    <!-- ═══ FOOTER ═══ -->
    <div class="sal-footer">
      <span>طُبع عبر: <strong>نظام إدهام للمواد الغذائية ERP — قسم الموارد البشرية والمالية</strong></span>
      <span>تاريخ وساعة الطباعة: <strong>${new Date().toLocaleString("ar-SA")}</strong></span>
    </div>

  </div>
</body>
</html>
  `}window.printSingleJournalVoucher=async t=>{const e=window.open("","_blank");if(!e){window.showToast?.("يرجى السماح بالنوافذ المنبثقة في المتصفح للطباعة","warn");return}e.document.open(),e.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8" />
      <title>جاري تجهيز سند القيد...</title>
      <style>
        body { font-family: 'Cairo', Arial, sans-serif; display:flex; align-items:center; justify-content:center; height:85vh; margin:0; background:#f8fafc; direction:rtl; }
        .box { background:#fff; border:1px solid #cbd5e1; border-radius:12px; padding:30px 40px; text-align:center; box-shadow:0 4px 20px rgba(0,0,0,0.06); }
      </style>
    </head>
    <body>
      <div class="box">
        <div style="font-size:36px; margin-bottom:12px;">⏳</div>
        <div style="font-size:16px; font-weight:bold; color:#1e3a8a;">جاري تجهيز سند القيد المحاسبي...</div>
        <div style="font-size:12px; color:#64748b; margin-top:6px;">يرجى الانتظار لحظات</div>
      </div>
    </body>
    </html>
  `),e.document.close();try{let a=_.find(i=>i.id===t);if(!a)try{const i=await ae(ge(S,`companies/${M}/journalEntries`,t));i.exists()&&(a={id:i.id,...i.data()})}catch{}if(!a){e.close(),window.showToast?.("عذراً، لم يتم العثور على بيانات القيد المطلوب","bad");return}const o=await me(),n=Me(a,o);e.document.open(),e.document.write(n),e.document.close(),setTimeout(()=>{e.focus(),e.print()},450)}catch(a){console.error("Error generating journal voucher:",a),e.document.body.innerHTML=`<div style="color:#b91c1c;padding:30px;text-align:center;direction:rtl;font-family:Arial,sans-serif;">⚠️ حدث خطأ أثناء إعداد السند: ${a.message}</div>`}};window.printSalaryVoucherFromJE=async t=>{const e=window.open("","_blank");if(!e){window.showToast?.("يرجى السماح بالنوافذ المنبثقة في المتصفح لطباعة السند","warn");return}e.document.open(),e.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8" />
      <title>جاري تجهيز سند الراتب...</title>
      <style>
        body { font-family: 'Cairo', Arial, sans-serif; display:flex; align-items:center; justify-content:center; height:85vh; margin:0; background:#f8fafc; direction:rtl; }
        .box { background:#fff; border:1px solid #cbd5e1; border-radius:12px; padding:30px 40px; text-align:center; box-shadow:0 4px 20px rgba(0,0,0,0.06); }
      </style>
    </head>
    <body>
      <div class="box">
        <div style="font-size:36px; margin-bottom:12px;">⏳</div>
        <div style="font-size:16px; font-weight:bold; color:#1e3a8a;">جاري تجهيز سند صرف واستلام الراتب والموقف المالي...</div>
        <div style="font-size:12px; color:#64748b; margin-top:6px;">يرجى الانتظار لحظات</div>
      </div>
    </body>
    </html>
  `),e.document.close();try{let a=_.find(l=>l.id===t);if(!a)try{const l=await ae(ge(S,`companies/${M}/journalEntries`,t));l.exists()&&(a={id:l.id,...l.data()})}catch{}if(!a){e.close(),window.showToast?.("عذراً، لم يتم العثور على بيانات القيد المطلوب","bad");return}let o=window._cachedEmployees||[];if(!o.length)try{o=await U(H.employees()),window._cachedEmployees=o}catch{}let n=[];try{n=await U(H.journalEntries())}catch{n=_||[]}let i=[];try{i=await U(H.chartOfAccounts())}catch{i=typeof A<"u"&&Array.isArray(A)?A:window._accounts||[]}const s=await me(),p=Je(a,s,o,n,i);e.document.open(),e.document.write(p),e.document.close(),setTimeout(()=>{e.focus(),e.print()},450)}catch(a){console.error("Error generating salary voucher:",a),e.document.body.innerHTML=`<div style="color:#b91c1c;padding:30px;text-align:center;direction:rtl;font-family:Arial,sans-serif;">⚠️ حدث خطأ أثناء إعداد السند: ${a.message}</div>`}};window.printJournalLogReport=async()=>{const t=await me(),e=document.getElementById("je-from")?.value||"",a=document.getElementById("je-to")?.value||"",o=document.getElementById("je-type-filter")?.value||"",n=document.getElementById("je-status-filter")?.value||"",i=_e(_,t,{from:e,to:a,typeF:o,statusF:n}),s=window.open("","_blank");if(!s){window.showToast?.("يرجى السماح بالنوافذ المنبثقة للطباعة","warn");return}s.document.write(i),s.document.close(),setTimeout(()=>{s.focus(),s.print()},400)};export{xe as isSalaryRelatedEntry,Ue as render};
