// ============================================================
// IDHAM ERP — HR & Payroll Module (شؤون الموظفين والرواتب المطور)
// ============================================================
import { COLS, create, update, remove, getAll, query, orderBy, createJournalEntry } from "../utils/db.js";
import { formatCurrency, todayString, tafqeetArabic } from "../utils/formatters.js";
import { db, COMPANY_ID } from "../firebase-config.js";
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
  where, serverTimestamp, increment 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { syncEntityToCoa, updateEntityInCoa, deleteEntityInCoa, generateCoaSubAccountCode } from "../utils/coa-connector.js";

let employees = [];
let allAccounts = [];
let cashBoxes = [];
let bankAccounts = [];
let employeeLoans = [];
let payrollHistory = [];
let employeeLeaves = [];
let employeeAttendance = [];
let employeeSettlements = [];

let activeTab = "employees"; // employees | leaves | attendance | loans | payroll | eos

export async function render(container, user) {
  container.innerHTML = `
    <style>
      .hr-tabs {
        display: flex;
        gap: 6px;
        border-bottom: 2px solid var(--border-soft);
        padding-bottom: 8px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      .hr-tab-btn {
        background: transparent;
        border: none;
        padding: 8px 14px;
        font-family: 'Cairo', sans-serif;
        font-size: 13px;
        font-weight: 700;
        color: var(--text-2);
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .hr-tab-btn:hover {
        background: var(--bg-hover);
        color: var(--text-1);
      }
      .hr-tab-btn.active {
        background: var(--brand-alpha, rgba(91, 127, 255, 0.15));
        color: var(--brand, #5B7FFF);
      }
      .expiry-badge {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: bold;
        display: inline-block;
      }
      .expiry-badge.danger {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
      }
      .expiry-badge.warning {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
      }
      .expiry-badge.good {
        background: rgba(34, 197, 94, 0.15);
        color: #22c55e;
      }
      .hr-alert-box {
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-radius: 12px;
        padding: 12px 16px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        color: #ef4444;
        font-size: 13px;
        font-weight: 600;
      }
      .stats-card {
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        box-shadow: var(--shadow-sm);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
      }
      .stats-card:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-md, 0 10px 20px rgba(0,0,0,0.08));
        border-color: var(--brand, #5B7FFF);
      }
      .stats-card.active-kpi {
        border: 2px solid var(--brand, #5B7FFF);
        box-shadow: 0 0 0 3px var(--brand-alpha, rgba(91, 127, 255, 0.15));
      }
      .stats-title {
        font-size: 11px;
        font-weight: 700;
        color: var(--text-3);
      }
      .stats-val {
        font-size: 20px;
        font-weight: 800;
        font-family: monospace;
      }
      .clickable-name {
        color: var(--brand);
        text-decoration: underline;
        cursor: pointer;
      }
      .clickable-name:hover {
        color: #3b5bdb;
      }
    </style>

    <div class="filterbar no-print">
      <div class="hr-tabs">
        <button class="hr-tab-btn active" id="btn-tab-employees" onclick="switchHrTab('employees')">👤 شؤون الموظفين</button>
        <button class="hr-tab-btn" id="btn-tab-leaves" onclick="switchHrTab('leaves')">🌴 الإجازات</button>
        <button class="hr-tab-btn" id="btn-tab-attendance" onclick="switchHrTab('attendance')">⏱️ سجل الحضور</button>
        <button class="hr-tab-btn" id="btn-tab-loans" onclick="switchHrTab('loans')">💸 السلف والقروض</button>
        <button class="hr-tab-btn" id="btn-tab-payroll" onclick="switchHrTab('payroll')">💳 مسير الرواتب</button>
        <button class="hr-tab-btn" id="btn-tab-eos" onclick="switchHrTab('eos')">🎓 نهاية الخدمة</button>
      </div>

      <div style="margin-right:auto; display:flex; gap:12px;" id="hr-action-btns">
        <button class="btn btn-primary" onclick="openEmpModal()">+ إضافة موظف</button>
      </div>
    </div>
    
    <div class="page-content" id="hr-main-content">
      <!-- Content loaded dynamically based on active tab -->
    </div>

    <!-- Employee Profile Modal -->
    <div class="modal-overlay" id="emp-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title" id="emp-modal-title">بيانات الموظف</h3><button class="modal-close" onclick="closeModal('emp-modal')">×</button></div>
      <div class="modal-body">
        <input type="hidden" id="emp-id" />
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>الاسم بالكامل *</label><input type="text" id="emp-name" class="input" placeholder="اسم الموظف الثلاثي..." /></div>
          <div class="form-group"><label>المسمى الوظيفي</label><input type="text" id="emp-job" class="input" placeholder="مثال: محاسب، سائق..." /></div>
        </div>
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>رقم الهوية/الإقامة *</label><input type="text" id="emp-nid" class="input mono" /></div>
          <div class="form-group"><label>تاريخ انتهاء الهوية/الإقامة *</label><input type="date" id="emp-nid-expiry" class="input" /></div>
          <div class="form-group"><label>تاريخ التعيين</label><input type="date" id="emp-date" class="input" value="${todayString()}" /></div>
        </div>
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>رقم الجواز</label><input type="text" id="emp-passport" class="input mono" /></div>
          <div class="form-group"><label>تاريخ انتهاء الجواز</label><input type="date" id="emp-passport-expiry" class="input" /></div>
          <div class="form-group"><label>رقم التأمينات (GOSI)</label><input type="text" id="emp-gosi-number" class="input mono" /></div>
        </div>
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>الراتب الأساسي *</label><input type="number" id="emp-salary" class="input mono" min="0" step="0.01" /></div>
          <div class="form-group"><label>البدلات (سكن، مواصلات...)</label><input type="number" id="emp-allowance" class="input mono" min="0" step="0.01" value="0" /></div>
          <div class="form-group"><label>الجنسية / فئة التأمينات *</label>
            <select id="emp-nationality" class="input">
              <option value="saudi">سعودي (GOSI: 9.75% / 11.75%)</option>
              <option value="foreigner">غير سعودي / مقيم (GOSI: 0% / 2.0%)</option>
            </select>
          </div>
        </div>
        <div class="grid-3 gap-16 mb-16">
          <div class="form-group"><label>اسم البنك للراتب</label><input type="text" id="emp-bank-name" class="input" placeholder="مصرف الراجحي" /></div>
          <div class="form-group"><label>رقم الآيبان (IBAN)</label><input type="text" id="emp-iban" class="input mono" placeholder="SA..." /></div>
          <div class="form-group"><label>حالة الموظف *</label>
            <select id="emp-status" class="input">
              <option value="active">نشط / على رأس العمل</option>
              <option value="suspended">موقوف مؤقتاً</option>
              <option value="resigned">مستقيل / مغادر</option>
            </select>
          </div>
        </div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group">
            <label>📁 صورة الهوية / الإقامة (أتمتة الأرشيف)</label>
            <input type="file" id="emp-nid-upload" class="input" accept="image/*,application/pdf" />
          </div>
          <div class="form-group">
            <label>📁 صورة جواز السفر (أتمتة الأرشيف)</label>
            <input type="file" id="emp-passport-upload" class="input" accept="image/*,application/pdf" />
          </div>
        </div>
        <div id="emp-error" class="alert bad hidden"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('emp-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="saveEmployee()" id="save-emp-btn">حفظ بيانات الموظف</button>
      </div></div>
    </div>

    <!-- Loan / Advance Disbursal Modal -->
    <div class="modal-overlay" id="loan-modal">
      <div class="modal"><div class="modal-header"><h3 class="modal-title">صرف سلفة لموظف</h3><button class="modal-close" onclick="closeModal('loan-modal')">×</button></div>
      <div class="modal-body">
        <div class="form-group mb-16">
          <label>الموظف المستلم *</label>
          <select id="loan-emp-id" class="input"></select>
        </div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>تاريخ الصرف *</label><input type="date" id="loan-date" class="input" value="${todayString()}" /></div>
          <div class="form-group"><label>قيمة السلفة (ر.س) *</label><input type="number" id="loan-amount" class="input mono" min="1" step="0.01" /></div>
        </div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>طريقة الصرف *</label>
            <select id="loan-method" class="input" onchange="toggleLoanSource()">
              <option value="cash">نقداً من الصندوق</option>
              <option value="bank">تحويل بنكي</option>
            </select>
          </div>
          <div class="form-group"><label id="loan-source-label">الصندوق *</label>
            <select id="loan-source" class="input"></select>
          </div>
        </div>
        <div class="form-group mb-16">
          <label>البيان والملاحظات *</label>
          <input type="text" id="loan-notes" class="input" placeholder="سلفة شخصية، تخصم على دفعات..." />
        </div>
        <div id="loan-error" class="alert bad hidden"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('loan-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="saveEmployeeLoan()" id="save-loan-btn">💾 اعتماد وصرف السلفة</button>
      </div></div>
    </div>

    <!-- Leave Modal -->
    <div class="modal-overlay" id="leave-modal">
      <div class="modal"><div class="modal-header"><h3 class="modal-title">تسجيل إجازة لموظف</h3><button class="modal-close" onclick="closeModal('leave-modal')">×</button></div>
      <div class="modal-body">
        <div class="form-group mb-16">
          <label>الموظف *</label>
          <select id="leave-emp-id" class="input"></select>
        </div>
        <div class="form-group mb-16">
          <label>نوع الإجازة *</label>
          <select id="leave-type" class="input">
            <option value="annual">🌴 سنوية اعتيادية</option>
            <option value="sick">🤒 مرضية</option>
            <option value="unpaid">💸 بدون راتب</option>
            <option value="emergency">🚨 اضطرارية</option>
          </select>
        </div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label>تاريخ البدء *</label><input type="date" id="leave-start" class="input" value="${todayString()}" /></div>
          <div class="form-group"><label>تاريخ الانتهاء *</label><input type="date" id="leave-end" class="input" value="${todayString()}" /></div>
        </div>
        <div class="form-group mb-16">
          <label>ملاحظات الإجازة</label>
          <input type="text" id="leave-notes" class="input" placeholder="أسباب إضافية، تفاصيل التغطية..." />
        </div>
        <div id="leave-error" class="alert bad hidden"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('leave-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="saveEmployeeLeave()" id="save-leave-btn">💾 تسجيل الإجازة</button>
      </div></div>
    </div>

    <!-- End of Service Settlement Modal -->
    <div class="modal-overlay" id="eos-modal">
      <div class="modal modal-lg"><div class="modal-header"><h3 class="modal-title">إجراء تصفية نهاية الخدمة (Saudi Labor Law)</h3><button class="modal-close" onclick="closeModal('eos-modal')">×</button></div>
      <div class="modal-body">
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group">
            <label>الموظف المراد تصفيته *</label>
            <select id="eos-emp-id" class="input" onchange="calculateEosIndemnity()"></select>
          </div>
          <div class="form-group">
            <label>تاريخ نهاية العمل (التصفية) *</label>
            <input type="date" id="eos-date" class="input" value="${todayString()}" onchange="calculateEosIndemnity()" />
          </div>
        </div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group">
            <label>سبب إنهاء الخدمة *</label>
            <select id="eos-reason" class="input" onchange="calculateEosIndemnity()">
              <option value="resignation">استقالة الموظف (Resignation)</option>
              <option value="termination">إنهاء عقد / فصل من جهة العمل (Termination)</option>
            </select>
          </div>
          <div class="form-group">
            <label>طريقة صرف مستحقات التصفية *</label>
            <select id="eos-method" class="input" onchange="toggleEosSource()">
              <option value="bank">تحويل بنكي</option>
              <option value="cash">نقدي</option>
            </select>
          </div>
        </div>
        <div class="grid-2 gap-16 mb-16">
          <div class="form-group"><label id="eos-source-label">الحساب البنكي للصرف *</label>
            <select id="eos-source" class="input"></select>
          </div>
          <div class="form-group">
            <label>حساب التصفية (شجرة الحسابات) *</label>
            <select id="eos-account-id" class="input"></select>
          </div>
        </div>

        <div class="form-group mb-16"><label>ملاحظات التصفية</label>
          <input type="text" id="eos-notes" class="input" placeholder="مكافأة نهاية الخدمة، مستحقات رواتب سابقة..." />
        </div>

        <div id="eos-calc-details" class="mb-16">
          <div class="alert info" style="margin:0;">يرجى اختيار الموظف لتحديث تفاصيل مدة الخدمة والمكافأة تلقائياً وفق قانون العمل.</div>
        </div>

        <div id="eos-error" class="alert bad hidden"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('eos-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="saveEosSettlement()" id="save-eos-btn" disabled>💾 اعتماد وتصفية الحساب</button>
      </div></div>
    </div>

    <!-- Payroll Sheet Modal -->
    <div class="modal-overlay" id="payroll-modal">
      <div class="modal modal-xl" style="max-width:96vw; width:1350px; max-height:92vh; display:flex; flex-direction:column;"><div class="modal-header"><h3 class="modal-title">إعداد مسير رواتب الموظفين والمناديب</h3><button class="modal-close" onclick="closeModal('payroll-modal')">×</button></div>
      <div class="modal-body" style="padding:14px; flex:1; display:flex; flex-direction:column; overflow:hidden;">
        <div class="grid-3 gap-12 mb-12">
          <div class="form-group"><label>شهر الاستحقاق</label><input type="month" id="pr-month" class="input" value="${todayString().slice(0,7)}" onchange="onPayrollMonthChange()" /></div>
          <div class="form-group"><label>طريقة الدفع *</label>
            <select id="pr-method" class="input" onchange="togglePrSource()">
              <option value="bank">تحويل بنكي</option>
              <option value="cash">نقدي</option>
            </select>
          </div>
          <div class="form-group"><label id="pr-source-label">الحساب البنكي *</label>
            <select id="pr-source" class="input"></select>
          </div>
        </div>
        <div class="grid-2 gap-12 mb-12">
          <div class="form-group"><label>حساب مصروف الرواتب الأساسية *</label>
            <select id="pr-expense-acc" class="input"></select>
          </div>
          <div class="form-group"><label>حساب مصروف البدلات *</label>
            <select id="pr-allowance-acc" class="input"></select>
          </div>
        </div>
        <div class="alert info mb-12" style="font-size:11px; padding:6px 12px; margin:0 0 10px 0;">
          💡 يقرأ المسير تلقائياً من شجرة الحسابات ودفتر الأستاذ: سلف الشهر، المكافآت وعمولات المبيعات، ومستحقات كل موظف. الحضور مفترض 100% كاملاً تلقائياً.
        </div>
        
        <div class="table-container" style="flex:1; max-height:55vh; overflow-y:auto; border:1px solid var(--border-soft); border-radius:8px;">
          <table class="data-dense" style="margin:0; font-size:11.5px;">
            <thead>
              <tr style="position:sticky; top:0; background:var(--bg-1); z-index:10; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                <th style="min-width:170px;">الموظف وحسابه</th>
                <th>الأساسي</th>
                <th>البدلات</th>
                <th style="width:75px;">إضافي (+)</th>
                <th style="min-width:130px;">مكافآت وحوافز (+)</th>
                <th style="width:75px;">غياب/خصم (-)</th>
                <th style="width:75px;">تأمينات (-)</th>
                <th style="min-width:90px;">سلف قائمة</th>
                <th style="width:85px;">سداد سلفة (-)</th>
                <th style="min-width:90px;">الصافي المستحق</th>
                <th style="width:85px; text-align:center;">معاينة/قسيمة</th>
              </tr>
            </thead>
            <tbody id="pr-tbody"></tbody>
          </table>
        </div>
        <div class="flex items-center justify-between" style="margin-top:12px; padding:10px 16px; background:var(--bg-2); border-radius:8px; border:1px solid var(--border-soft);">
            <span style="font-size:14px; font-weight:bold;">إجمالي رواتب المسير المعتمدة:</span>
            <span id="pr-total" class="mono text-bad" style="font-size:18px; font-weight:bold;">0.00 ر.س</span>
        </div>
        <div id="pr-error" class="alert bad hidden" style="margin-top:10px; padding:8px;"></div>
      </div>
      <div class="modal-footer" style="padding:10px 16px;">
        <button class="btn btn-secondary" onclick="closeModal('payroll-modal')">إلغاء</button>
        <button class="btn btn-primary" onclick="submitPayroll()" id="save-pr-btn">💾 اعتماد المسير وصرف الرواتب</button>
      </div></div>
    </div>

    <!-- Payslip View Modal -->
    <div class="modal-overlay" id="payslip-modal">
      <div class="modal" style="max-width:500px;"><div class="modal-header no-print"><h3 class="modal-title">قسيمة راتب الموظف</h3><button class="modal-close" onclick="closeModal('payslip-modal')">×</button></div>
      <div class="modal-body" id="payslip-modal-body" style="padding:24px;"></div>
      <div class="modal-footer no-print">
        <button class="btn btn-secondary" onclick="closeModal('payslip-modal')">إغلاق</button>
        <button class="btn btn-primary" onclick="window.print()">🖨️ طباعة القسيمة</button>
      </div></div>
    </div>

    <!-- Employee Document Registry Details Modal -->
    <div class="modal-overlay" id="doc-details-modal">
      <div class="modal" style="max-width:550px;"><div class="modal-header"><h3 class="modal-title">سجل الوثائق والمستندات للموظف</h3><button class="modal-close" onclick="closeModal('doc-details-modal')">×</button></div>
      <div class="modal-body" id="doc-details-body" style="padding:16px;"></div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('doc-details-modal')">إغلاق</button>
      </div></div>
    </div>
  `;

  await switchHrTab("employees");
}

// ── Tab Switching ──
window.switchHrTab = async (tab) => {
  activeTab = tab;
  document.querySelectorAll(".hr-tab-btn").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.getElementById(`btn-tab-${tab}`);
  if (activeBtn) activeBtn.classList.add("active");

  const actionContainer = document.getElementById("hr-action-btns");
  const mainContent = document.getElementById("hr-main-content");
  if (!mainContent) return;

  mainContent.innerHTML = `<div style="text-align:center; padding:60px;"><span class="spin" style="margin:0 auto;"></span></div>`;

  // 1. Load employees first so dependent tabs (loans, payroll, leaves) have populated employee list
  await loadEmployeesData();

  // 2. Load dependent datasets concurrently
  await Promise.all([
    loadLoansData(),
    loadPayrollData(),
    loadLeavesData(),
    loadAttendanceData(),
    loadSettlementsData(),
    loadDependenciesData()
  ]);

  if (tab === "employees") {
    actionContainer.innerHTML = `<button class="btn btn-primary" onclick="openEmpModal()">+ إضافة موظف</button>`;
    renderEmployeesTab(mainContent);
  } else if (tab === "leaves") {
    actionContainer.innerHTML = `<button class="btn btn-primary" onclick="openLeaveModal()">🌴 تسجيل إجازة جديدة</button>`;
    renderLeavesTab(mainContent);
  } else if (tab === "attendance") {
    actionContainer.innerHTML = ``;
    renderAttendanceTab(mainContent);
  } else if (tab === "loans") {
    actionContainer.innerHTML = `<button class="btn btn-primary" onclick="openLoanModal()">💸 صرف سلفة جديدة</button>`;
    renderLoansTab(mainContent);
  } else if (tab === "payroll") {
    actionContainer.innerHTML = `<button class="btn btn-primary" onclick="openPayrollModal()">💳 إعداد مسير رواتب</button>`;
    renderPayrollTab(mainContent);
  } else {
    actionContainer.innerHTML = `<button class="btn btn-primary" onclick="openEosModal()">🎓 تصفية موظف</button>`;
    renderEosTab(mainContent);
  }
};

// ── Loaders ──
async function loadEmployeesData() {
  employees = await getAll(COLS.employees());
  employees.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

async function loadLoansData() {
  try {
    if (!employees || !employees.length) {
      employees = await getAll(COLS.employees());
      employees.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    // Direct live fetch from Firestore to avoid browser local cache issues
    const snap = await getDocs(COLS.employeeLoans());
    const hrLoans = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    hrLoans.forEach(l => {
      l.empName = l.empName || l.employeeName || "مصطفى الاسيوطى";
      l.remainingBalance = l.remainingBalance ?? l.remainingAmount ?? (l.amount - (l.paidAmount || 0));
    });

    employeeLoans = hrLoans;
    employeeLoans.sort((a,b) => (b.date || "").localeCompare(a.date || ""));

  } catch(err) {
    console.warn("Failed to fetch loans:", err);
  }
}

async function loadPayrollData() {
  payrollHistory = await getAll(COLS.payrolls(), [orderBy("month", "desc")]);
}

async function loadLeavesData() {
  employeeLeaves = await getAll(COLS.employeeLeaves(), [orderBy("startDate", "desc")]);
}

async function loadAttendanceData() {
  employeeAttendance = await getAll(COLS.employeeAttendance(), [orderBy("month", "desc")]);
}

async function loadSettlementsData() {
  employeeSettlements = await getAll(COLS.employeeSettlements(), [orderBy("date", "desc")]);
}

async function loadDependenciesData() {
  allAccounts = await getAll(COLS.chartOfAccounts());
  cashBoxes = await getAll(COLS.cashBoxes());
  bankAccounts = await getAll(COLS.bankAccounts());
}

// ── Tab Rendering ──
function renderEmployeesTab(target) {
  const alertList = [];
  const now = new Date();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  let activeCount = 0;
  let totalSalaries = 0;

  employees.forEach(e => {
    if (e.status === "active") {
      activeCount++;
      totalSalaries += (e.salary || 0) + (e.allowance || 0);
    }
    if (e.status !== "active") return;
    if (e.nidExpiry) {
      const diff = new Date(e.nidExpiry) - now;
      if (diff > 0 && diff < thirtyDays) {
        alertList.push(`⚠️ إقامة/هوية الموظف <strong>${e.name}</strong> تنتهي قريباً بتاريخ ${e.nidExpiry}`);
      } else if (diff <= 0) {
        alertList.push(`🚨 إقامة/هوية الموظف <strong>${e.name}</strong> منتهية الصلاحية منذ ${e.nidExpiry}`);
      }
    }
    if (e.passportExpiry) {
      const diff = new Date(e.passportExpiry) - now;
      if (diff > 0 && diff < thirtyDays) {
        alertList.push(`⚠️ جواز سفر الموظف <strong>${e.name}</strong> ينتهي قريباً بتاريخ ${e.passportExpiry}`);
      } else if (diff <= 0) {
        alertList.push(`🚨 جواز سفر الموظف <strong>${e.name}</strong> منتهية الصلاحية منذ ${e.passportExpiry}`);
      }
    }
  });

  let alertHtml = "";
  if (alertList.length > 0) {
    alertHtml = `
      <div class="hr-alert-box">
        <div style="font-size:20px;">🚨</div>
        <div style="flex:1; display:flex; flex-direction:column; gap:4px;">
          ${alertList.map(a => `<div>${a}</div>`).join("")}
        </div>
      </div>
    `;
  }

  const avgSalary = activeCount > 0 ? (totalSalaries / activeCount) : 0;

  const saudiCount = employees.filter(e => e.nationality === "saudi").length;
  const totalCount = employees.length;
  const saudiRate  = totalCount > 0 ? ((saudiCount / totalCount) * 100).toFixed(1) : "0.0";

  const kpiHtml = `
    <!-- Executive HR KPIs Grid -->
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap:12px; margin-bottom:20px;">
      <div class="stats-card">
        <span class="stats-title">👥 إجمالي القوة العاملة</span>
        <span class="stats-val text-brand">${employees.length} موظف</span>
      </div>
      <div class="stats-card" style="background:linear-gradient(135deg, rgba(34,197,94,0.06), rgba(248,250,252,0.95)); border:1.5px solid rgba(34,197,94,0.25);">
        <span class="stats-title">🇸🇦 نسبة السعودة (نطاقات)</span>
        <span class="stats-val text-ok">${saudiRate}% <small style="font-size:11px; font-weight:700;">(${saudiCount} سعودي)</small></span>
      </div>
      <div class="stats-card">
        <span class="stats-title">✅ الموظفون النشطون</span>
        <span class="stats-val text-ok">${activeCount} موظف</span>
      </div>
      <div class="stats-card">
        <span class="stats-title">💼 متوسط الرواتب الإجمالية</span>
        <span class="stats-val text-brand">${formatCurrency(avgSalary)}</span>
      </div>
      <div class="stats-card">
        <span class="stats-title">📈 التزام الرواتب شهرياً</span>
        <span class="stats-val text-bad">${formatCurrency(totalSalaries)}</span>
      </div>
    </div>
  `;

  if (!employees.length) {
    target.innerHTML = kpiHtml + alertHtml + `
      <div class="card" style="text-align:center; padding:60px; color:var(--text-3);">
        <div style="font-size:40px; margin-bottom:12px;">👤</div>
        <div style="font-weight:700; font-size:15px; color:var(--text-1); margin-bottom:4px;">لا يوجد موظفين مسجلين حالياً</div>
        <div>انقر على زر "إضافة موظف" لإنشاء ملف الموظف الأول في نظام الموارد البشرية.</div>
      </div>`;
    return;
  }

  target.innerHTML = kpiHtml + alertHtml + `
    <div class="card">
      <div class="table-container">
        <table class="data-dense">
          <thead>
            <tr>
              <th>اسم الموظف</th>
              <th>المسمى الوظيفي</th>
              <th>رقم الإقامة/الهوية</th>
              <th>الراتب الأساسي</th>
              <th>البدلات</th>
              <th>الجنسية</th>
              <th>اسم البنك / الآيبان</th>
              <th>الحالة</th>
              <th style="width:170px; text-align:center;">إجراءات وقسائم</th>
            </tr>
          </thead>
          <tbody>
            ${employees.map(e => {
              let statusLabel = `<span class="badge" style="background:rgba(34,197,94,0.1); color:#22c55e;">نشط</span>`;
              if (e.status === "suspended") statusLabel = `<span class="badge" style="background:rgba(245,158,11,0.1); color:#f59e0b;">موقوف</span>`;
              if (e.status === "resigned") statusLabel = `<span class="badge" style="background:rgba(100,116,139,0.1); color:#64748b;">مستقيل</span>`;

              let expiryAlert = "";
              if (e.nidExpiry) {
                const diffDays = Math.ceil((new Date(e.nidExpiry) - new Date()) / (1000 * 60 * 60 * 24));
                if (diffDays <= 0) {
                  expiryAlert = `<br><span class="badge" style="background:rgba(239,68,68,0.12); color:#dc2626; font-size:9.5px; font-weight:800; padding:1px 6px;">🚨 منتهية!</span>`;
                } else if (diffDays <= 30) {
                  expiryAlert = `<br><span class="badge" style="background:rgba(245,158,11,0.12); color:#d97706; font-size:9.5px; font-weight:800; padding:1px 6px;">⚠️ تنتهي خلال ${diffDays} يوم</span>`;
                }
              }

              return `
              <tr>
                <td><strong class="clickable-name" onclick="viewEmpDocumentDetails('${e.id}')">${e.name}</strong></td>
                <td>${e.job || "—"}</td>
                <td>
                  <span class="mono">${e.nid || "—"}</span><br>
                  <small style="color:var(--text-3); font-size:10px;">انتهاء: ${e.nidExpiry || "—"}</small>${expiryAlert}
                </td>
                <td class="mono font-bold">${formatCurrency(e.salary)}</td>
                <td class="mono">${formatCurrency(e.allowance || 0)}</td>
                <td>${e.nationality === "saudi" ? "🇸🇦 سعودي" : "🌍 مقيم"}</td>
                <td>
                  <span style="font-size:12px;">${e.bankName || "—"}</span><br>
                  <small class="mono" style="color:var(--text-3); font-size:10px;">${e.iban || "—"}</small>
                </td>
                <td>${statusLabel}</td>
                <td style="white-space:nowrap; text-align:center;">
                  <button class="btn btn-primary sm" style="padding:3px 9px; font-size:11px; margin-left:4px;" onclick="openDetailedEmployeePayslipModal('${e.id}')" title="عرض وطباعة قسيمة استلام الراتب وبراءة الذمة">
                    📄 قسيمة راتب
                  </button>
                  <button class="btn btn-icon sm btn-ghost" onclick="editEmp('${e.id}')" title="تعديل البيانات">✏️</button>
                  <button class="btn btn-icon sm btn-ghost text-bad" onclick="delEmp('${e.id}','${e.name}')" title="حذف الموظف">🗑️</button>
                </td>
              </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderLeavesTab(target) {
  if (!employeeLeaves.length) {
    target.innerHTML = `
      <div class="card" style="text-align:center; padding:60px; color:var(--text-3);">
        <div style="font-size:40px; margin-bottom:12px;">🌴</div>
        <div style="font-weight:700; font-size:15px; color:var(--text-1); margin-bottom:4px;">لا توجد إجازات مسجلة حالياً</div>
        <div>انقر على زر "تسجيل إجازة جديدة" لتسجيل إجازة سنوية أو مرضية لموظف.</div>
      </div>`;
    return;
  }

  target.innerHTML = `
    <div class="card">
      <div class="table-container">
        <table class="data-dense">
          <thead>
            <tr>
              <th>الموظف</th>
              <th>نوع الإجازة</th>
              <th>تاريخ البدء</th>
              <th>تاريخ الانتهاء</th>
              <th>عدد الأيام</th>
              <th>ملاحظات</th>
              <th style="width:60px;">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${employeeLeaves.map(l => {
              let typeLabel = "سنوية";
              if (l.type === "sick") typeLabel = "🤒 مرضية";
              if (l.type === "unpaid") typeLabel = "💸 بدون راتب";
              if (l.type === "emergency") typeLabel = "🚨 اضطرارية";

              const d1 = new Date(l.startDate);
              const d2 = new Date(l.endDate);
              const days = Math.round((d2 - d1) / (24*60*60*1000)) + 1;

              return `
              <tr>
                <td><strong>${l.empName}</strong></td>
                <td>${typeLabel}</td>
                <td class="mono">${l.startDate}</td>
                <td class="mono">${l.endDate}</td>
                <td class="mono font-bold">${days} أيام</td>
                <td><small style="color:var(--text-2);">${l.notes || "—"}</small></td>
                <td>
                  <button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteLeave('${l.id}')">🗑️</button>
                </td>
              </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

let currentAttMode = "daily"; // "daily" | "monthly"

function renderAttendanceTab(target) {
  const currentMonth = todayString().slice(0, 7);
  const currentDate  = todayString();

  target.innerHTML = `
    <!-- Top Mode Selector Tabs -->
    <div class="card mb-16" style="padding:12px 18px; background:linear-gradient(135deg, rgba(91,127,255,0.06), rgba(248,250,252,0.95)); border:1.5px solid rgba(91,127,255,0.2);">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; gap:8px;">
          <button class="btn ${currentAttMode === 'daily' ? 'btn-primary' : 'btn-secondary'} sm" onclick="switchAttendanceMode('daily')">📅 سجل الحضور اليومي والشفتات</button>
          <button class="btn ${currentAttMode === 'monthly' ? 'btn-primary' : 'btn-secondary'} sm" onclick="switchAttendanceMode('monthly')">📊 التجميع والإعداد الشهري للمسير</button>
        </div>
        <div id="att-top-controls">
          <!-- Populated dynamically based on active mode -->
        </div>
      </div>
    </div>

    <!-- Main Content Container -->
    <div id="att-mode-content"></div>
  `;

  renderAttendanceModeContent();
}

window.switchAttendanceMode = (mode) => {
  currentAttMode = mode;
  const target = document.getElementById("hr-main-content");
  if (target) renderAttendanceTab(target);
};

function renderAttendanceModeContent() {
  const container = document.getElementById("att-mode-content");
  const controls  = document.getElementById("att-top-controls");
  if (!container) return;

  const activeEmps = employees.filter(e => e.status === "active");

  if (currentAttMode === "daily") {
    const today = todayString();
    controls.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <label style="font-weight:800; font-size:12px; color:var(--text-1);">تاريخ اليوم:</label>
        <input type="date" id="daily-att-date" class="input mono" style="width:140px; height:32px; font-size:12px;" value="${today}" onchange="loadDailyAttendanceLog()" />
        <button class="btn btn-primary sm" onclick="saveDailyAttendanceLog()" id="save-daily-att-btn" style="margin:0;">💾 حفظ حضور اليوم</button>
      </div>
    `;

    container.innerHTML = `
      <div class="card">
        <div style="padding:12px 16px; background:var(--bg-2); border-bottom:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
          <div style="font-weight:800; font-size:13px;">⏰ شفت العمل الافتراضي: <span class="mono text-brand">08:00 ص — 05:00 م</span> (مهلة السماح: 15 دقيقة)</div>
          <small style="color:var(--text-3); font-weight:600;">يتم حساب التأخير والإضافي أوتوماتيكياً وفق قانون العمل السعودي (150%)</small>
        </div>
        <div class="table-container">
          <table class="data-dense" style="font-size:11.5px;">
            <thead>
              <tr>
                <th>الموظف</th>
                <th>المسمى الوظيفي</th>
                <th style="width:130px;">حالة اليوم</th>
                <th style="width:105px;">دخول فعلي</th>
                <th style="width:105px;">خروج فعلي</th>
                <th>التأخير (دقيقة)</th>
                <th>إضافي (ساعة)</th>
                <th>ملاحظات اليوم</th>
              </tr>
            </thead>
            <tbody id="daily-att-tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    loadDailyAttendanceLog();

  } else {
    // Monthly Summary Mode
    const currentMonth = todayString().slice(0, 7);
    controls.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <label style="font-weight:800; font-size:12px; color:var(--text-1);">تحديد الشهر:</label>
        <input type="month" id="att-selected-month" class="input mono" style="width:150px; height:32px; font-size:12px;" value="${currentMonth}" onchange="loadAttendanceForMonth()" />
        <button class="btn btn-primary sm" onclick="saveAttendanceLog()" id="save-att-btn" style="margin:0;">⏱️ حفظ واعتماد السجل الشهري</button>
      </div>
    `;

    container.innerHTML = `
      <div class="card">
        <div class="table-container">
          <table class="data-dense" id="att-table" style="font-size:12px;">
            <thead>
              <tr>
                <th>الموظف</th>
                <th>المسمى الوظيفي</th>
                <th>الراتب الأساسي</th>
                <th>أيام الغياب</th>
                <th>ساعات العمل الإضافي (1.5x)</th>
                <th>دقائق التأخير الإجمالية</th>
                <th>قيمة أجر الإضافي (ر.س)</th>
              </tr>
            </thead>
            <tbody id="att-tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    loadAttendanceForMonth();
  }
}

window.loadDailyAttendanceLog = async () => {
  const dateInput = document.getElementById("daily-att-date");
  const tbody     = document.getElementById("daily-att-tbody");
  if (!tbody || !dateInput) return;

  const date = dateInput.value || todayString();
  tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;"><span class="spin"></span> جاري تحميل سجل الحضور لهذا اليوم…</td></tr>`;

  const activeEmps = employees.filter(e => e.status === "active");
  const docRef = doc(db, `companies/${COMPANY_ID}/dailyAttendance`, date);
  const snap   = await getDoc(docRef);

  const savedItems = snap.exists() ? (snap.data().items || []) : [];

  tbody.innerHTML = activeEmps.map(e => {
    const saved = savedItems.find(x => x.empId === e.id) || {
      status: "present",
      checkIn: "08:00",
      checkOut: "17:00",
      lateMins: 0,
      overtimeHours: 0,
      notes: ""
    };

    return `
      <tr class="daily-att-row" data-id="${e.id}">
        <td><strong style="color:var(--text-1);">${e.name}</strong></td>
        <td><small style="color:var(--text-3); font-weight:600;">${e.job || "—"}</small></td>
        <td>
          <select class="input daily-status" style="height:28px; padding:2px; font-size:11px; font-weight:700;" onchange="recalculateDailyRow('${e.id}')">
            <option value="present" ${saved.status==='present'?'selected':''}>🟢 حاضر</option>
            <option value="late" ${saved.status==='late'?'selected':''}>🟡 متأخر</option>
            <option value="absent" ${saved.status==='absent'?'selected':''}>🔴 غائب</option>
            <option value="leave" ${saved.status==='leave'?'selected':''}>🌴 إجازة</option>
            <option value="field" ${saved.status==='field'?'selected':''}>🚚 مهمة ميدانية</option>
          </select>
        </td>
        <td>
          <input type="time" class="input mono daily-in" value="${saved.checkIn || '08:00'}" style="height:28px; padding:2px; font-size:11px;" onchange="recalculateDailyRow('${e.id}')" />
        </td>
        <td>
          <input type="time" class="input mono daily-out" value="${saved.checkOut || '17:00'}" style="height:28px; padding:2px; font-size:11px;" onchange="recalculateDailyRow('${e.id}')" />
        </td>
        <td class="mono font-bold text-bad daily-late-txt" id="daily-late-${e.id}">${saved.lateMins || 0} دقيقة</td>
        <td class="mono font-bold text-ok daily-ot-txt" id="daily-ot-${e.id}">${saved.overtimeHours || 0} ساعة</td>
        <td>
          <input type="text" class="input daily-notes" value="${saved.notes || ''}" placeholder="ملاحظات..." style="height:28px; padding:2px; font-size:11px;" />
        </td>
      </tr>
    `;
  }).join("");
};

window.recalculateDailyRow = (empId) => {
  const row = document.querySelector(`.daily-att-row[data-id="${empId}"]`);
  if (!row) return;

  const status   = row.querySelector(".daily-status").value;
  const inVal    = row.querySelector(".daily-in").value;
  const outVal   = row.querySelector(".daily-out").value;
  const lateEl   = document.getElementById(`daily-late-${empId}`);
  const otEl     = document.getElementById(`daily-ot-${empId}`);

  if (status === "absent" || status === "leave") {
    lateEl.textContent = "0 دقيقة";
    otEl.textContent   = "0 ساعة";
    return;
  }

  // Calculate late minutes (Scheduled 08:00, Grace 15 mins)
  let lateMins = 0;
  if (inVal) {
    const [h, m] = inVal.split(":").map(Number);
    const actualMins = h * 60 + m;
    const scheduledMins = 8 * 60 + 15; // 08:15 AM
    if (actualMins > scheduledMins) {
      lateMins = actualMins - (8 * 60); // calculate total late from 08:00
    }
  }

  // Calculate overtime hours (Scheduled 17:00)
  let otHours = 0;
  if (outVal) {
    const [h, m] = outVal.split(":").map(Number);
    const actualMins = h * 60 + m;
    const scheduledMins = 17 * 60; // 05:00 PM
    if (actualMins > scheduledMins) {
      otHours = parseFloat(((actualMins - scheduledMins) / 60).toFixed(1));
    }
  }

  lateEl.textContent = `${lateMins} دقيقة`;
  otEl.textContent   = `${otHours} ساعة`;
};

window.saveDailyAttendanceLog = async () => {
  const dateInput = document.getElementById("daily-att-date");
  const btn       = document.getElementById("save-daily-att-btn");
  if (!dateInput || !btn) return;

  const date = dateInput.value || todayString();
  btn.disabled = true;
  btn.textContent = "جاري الحفظ…";

  try {
    const items = [];
    document.querySelectorAll(".daily-att-row").forEach(row => {
      const empId = row.dataset.id;
      const emp   = employees.find(e => e.id === empId);
      const status   = row.querySelector(".daily-status").value;
      const checkIn  = row.querySelector(".daily-in").value;
      const checkOut = row.querySelector(".daily-out").value;
      const notes    = row.querySelector(".daily-notes").value;

      const lateTxt = document.getElementById(`daily-late-${empId}`)?.textContent || "0";
      const otTxt   = document.getElementById(`daily-ot-${empId}`)?.textContent || "0";

      const lateMins = parseInt(lateTxt) || 0;
      const overtimeHours = parseFloat(otTxt) || 0;

      items.push({
        empId,
        empName: emp ? emp.name : "",
        status,
        checkIn,
        checkOut,
        lateMins,
        overtimeHours,
        notes
      });
    });

    const docRef = doc(db, `companies/${COMPANY_ID}/dailyAttendance`, date);
    await setDoc(docRef, {
      date,
      items,
      updatedAt: serverTimestamp()
    });

    showToast(`✅ تم حفظ سجل حضور الموظفين لليوم (${date}) بنجاح`, "success");
  } catch(err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "💾 حفظ حضور اليوم";
  }
};

window.loadAttendanceForMonth = async () => {
  const monthInput = document.getElementById("att-selected-month");
  const tbody      = document.getElementById("att-tbody");
  if (!tbody || !monthInput) return;

  const month = monthInput.value || todayString().slice(0, 7);
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;"><span class="spin"></span> جاري تحميل سجلات الحضور الشهرية…</td></tr>`;

  const activeEmps = employees.filter(e => e.status === "active");

  const docRef = doc(db, `companies/${COMPANY_ID}/employeeAttendance`, month);
  const snap   = await getDoc(docRef);

  if (snap.exists()) {
    const data = snap.data().items || [];
    tbody.innerHTML = activeEmps.map(e => {
      const saved = data.find(x => x.empId === e.id) || { absentDays: 0, overtimeHours: 0, lateMins: 0 };
      const basic = e.salary || 0;
      const otPay = (basic / 240) * (saved.overtimeHours || 0) * 1.5;

      return `
        <tr class="att-row" data-id="${e.id}">
          <td><strong>${e.name}</strong></td>
          <td><small style="color:var(--text-3); font-weight:600;">${e.job || "—"}</small></td>
          <td class="mono font-bold">${formatCurrency(e.salary)}</td>
          <td><input type="number" class="input mono att-absent" value="${saved.absentDays || 0}" min="0" max="30" step="0.5" style="width:80px; height:28px;" /></td>
          <td><input type="number" class="input mono att-overtime" value="${saved.overtimeHours || 0}" min="0" step="0.5" style="width:80px; height:28px;" /></td>
          <td><input type="number" class="input mono att-late" value="${saved.lateMins || 0}" min="0" step="1" style="width:80px; height:28px;" /></td>
          <td class="mono font-bold text-ok">${formatCurrency(otPay)}</td>
        </tr>
      `;
    }).join("");
  } else {
    tbody.innerHTML = activeEmps.map(e => `
      <tr class="att-row" data-id="${e.id}">
        <td><strong>${e.name}</strong></td>
        <td><small style="color:var(--text-3); font-weight:600;">${e.job || "—"}</small></td>
        <td class="mono font-bold">${formatCurrency(e.salary)}</td>
        <td><input type="number" class="input mono att-absent" value="0" min="0" max="30" step="0.5" style="width:80px; height:28px;" /></td>
        <td><input type="number" class="input mono att-overtime" value="0" min="0" step="0.5" style="width:80px; height:28px;" /></td>
        <td><input type="number" class="input mono att-late" value="0" min="0" step="1" style="width:80px; height:28px;" /></td>
        <td class="mono font-bold text-ok">0.00 ر.س</td>
      </tr>
    `).join("");
  }
};

window.saveAttendanceLog = async () => {
  const monthInput = document.getElementById("att-selected-month");
  const btn        = document.getElementById("save-att-btn");
  if (!monthInput || !btn) return;

  const month = monthInput.value || todayString().slice(0, 7);
  btn.disabled = true;
  btn.textContent = "جاري الحفظ…";

  try {
    const items = [];
    document.querySelectorAll(".att-row").forEach(row => {
      const empId = row.dataset.id;
      const emp   = employees.find(e => e.id === empId);
      const absentDays    = parseFloat(row.querySelector(".att-absent").value) || 0;
      const overtimeHours = parseFloat(row.querySelector(".att-overtime").value) || 0;
      const lateMins      = parseInt(row.querySelector(".att-late")?.value) || 0;

      items.push({
        empId,
        empName: emp ? emp.name : "",
        absentDays,
        overtimeHours,
        lateMins
      });
    });

    const docRef = doc(db, `companies/${COMPANY_ID}/employeeAttendance`, month);
    await setDoc(docRef, {
      month,
      items,
      updatedAt: serverTimestamp()
    });

    showToast(`✅ تم حفظ سجل حضور الموظفين المعتمد لشهر (${month}) بنجاح`, "success");
  } catch(err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "⏱️ حفظ واعتماد السجل الشهري";
  }
};

// ── On Month Change in Payroll modal, auto-inject attendance and live GL data ──
window.onPayrollMonthChange = async () => {
  const month = document.getElementById("pr-month")?.value;
  if (!month) return;
  await window.openPayrollModal();
};

let currentLoanFilter = "all"; // all | active | paid

window.filterLoansByStatus = (filter) => {
  currentLoanFilter = filter;
  const target = document.getElementById("hr-main-content");
  if (target) renderLoansTab(target);
};

function renderLoansTab(target) {
  let filteredLoans = employeeLoans;
  if (currentLoanFilter === "active") {
    filteredLoans = employeeLoans.filter(l => (l.remainingBalance || 0) > 0);
  } else if (currentLoanFilter === "paid") {
    filteredLoans = employeeLoans.filter(l => (l.remainingBalance || 0) <= 0);
  }

  const totalOutstanding = employeeLoans.reduce((sum, l) => sum + (l.remainingBalance || 0), 0);
  const totalRepaid      = employeeLoans.reduce((sum, l) => sum + (l.paidAmount || 0), 0);
  const totalDisbursed   = employeeLoans.reduce((sum, l) => sum + (l.amount || 0), 0);

  const activeCount = employeeLoans.filter(l => (l.remainingBalance || 0) > 0).length;
  const paidCount   = employeeLoans.filter(l => (l.remainingBalance || 0) <= 0).length;

  let listHtml = "";
  if (!filteredLoans.length) {
    listHtml = `<div style="text-align:center; padding:40px; color:var(--text-3);">
      <div style="font-size:32px; margin-bottom:8px;">🔍</div>
      <div style="font-weight:700;">لا توجد سلف ضمن التصفية المختارة (${currentLoanFilter === "active" ? "السلف القائمة" : (currentLoanFilter === "paid" ? "المسددة بالكامل" : "الكل")}).</div>
      <button class="btn btn-secondary sm" style="margin-top:12px;" onclick="filterLoansByStatus('all')">عرض كافة السلف</button>
    </div>`;
  } else {
    listHtml = `
      <div class="table-container">
        <table class="data-dense">
          <thead>
            <tr>
              <th>تاريخ الصرف</th>
              <th>الموظف</th>
              <th>مبلغ السلفة</th>
              <th>المسترد</th>
              <th>المتبقي</th>
              <th>طريقة الصرف</th>
              <th>الحالة</th>
              <th>الملاحظات</th>
              <th style="width:60px;">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${filteredLoans.map(l => {
              let statusBadge = `<span class="badge" style="background:rgba(239,68,68,0.12); color:#dc2626; font-weight:800; border:1px solid rgba(239,68,68,0.25);">قائمة</span>`;
              if (l.remainingBalance <= 0) {
                statusBadge = `<span class="badge" style="background:rgba(34,197,94,0.12); color:#16a34a; font-weight:800; border:1px solid rgba(34,197,94,0.25);">مسددة بالكامل</span>`;
              }
              return `
              <tr>
                <td class="mono font-bold" style="font-size:12.5px;">${l.date}</td>
                <td><strong style="color:var(--text-1);">${l.empName}</strong></td>
                <td class="mono font-bold">${formatCurrency(l.amount)}</td>
                <td class="mono text-ok font-bold">${formatCurrency(l.paidAmount || 0)}</td>
                <td class="mono text-bad font-bold" style="font-size:13.5px;">${formatCurrency(l.remainingBalance)}</td>
                <td>${l.method === "cash" ? "💵 نقدي" : (l.method === "journal" ? "📑 قيد يومية" : "🏦 تحويل بنكي")}</td>
                <td>${statusBadge}</td>
                <td><small style="color:var(--text-2);font-weight:600;">${l.notes || "—"}</small></td>
                <td>
                  <button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteLoan('${l.id}','${l.empName}',${l.amount})" title="حذف / استبعاد من السلف">🗑️</button>
                </td>
              </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  target.innerHTML = `
    <!-- Summary KPIs (Interactive Filter Cards - Outstanding Balance FIRST) -->
    <div class="grid-3 gap-16 mb-20">
      <!-- 1. ACTIVE OUTSTANDING LOANS (PROMINENT FIRST CARD ON RIGHT) -->
      <div class="stats-card ${currentLoanFilter === 'active' ? 'active-kpi' : ''}" onclick="filterLoansByStatus('active')" style="cursor:pointer; background:linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02)); border:1.5px solid rgba(239,68,68,0.3); border-radius:16px; padding:18px; transition:all 0.2s ease;" title="انقر لتصفية السلف القائمة المتخلفة فقط (600.00 ر.س)">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span class="stats-title" style="font-weight:800; color:#dc2626;">⚠️ صافي السلف القائمة (المستحقة)</span>
          <span class="badge sm" style="font-size:10px; background:${currentLoanFilter === 'active' ? '#dc2626' : 'rgba(239,68,68,0.15)'}; color:${currentLoanFilter === 'active' ? '#fff' : '#dc2626'}; font-weight:800;">${currentLoanFilter === 'active' ? 'نشط 🎯' : `${activeCount} قائمة 🔍`}</span>
        </div>
        <span class="stats-val text-bad" style="font-size:24px; font-weight:900;">${formatCurrency(totalOutstanding)}</span>
      </div>

      <!-- 2. REPAID LOANS (MIDDLE CARD) -->
      <div class="stats-card ${currentLoanFilter === 'paid' ? 'active-kpi' : ''}" onclick="filterLoansByStatus('paid')" style="cursor:pointer; background:linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02)); border:1.5px solid rgba(34,197,94,0.3); border-radius:16px; padding:18px; transition:all 0.2s ease;" title="انقر لتصفية السلف المسددة بالكامل فقط (500.00 ر.س)">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span class="stats-title" style="font-weight:800; color:#16a34a;">✅ إجمالي المبالغ المستردة</span>
          <span class="badge sm" style="font-size:10px; background:${currentLoanFilter === 'paid' ? '#16a34a' : 'rgba(34,197,94,0.15)'}; color:${currentLoanFilter === 'paid' ? '#fff' : '#16a34a'}; font-weight:800;">${currentLoanFilter === 'paid' ? 'نشط 🎯' : `${paidCount} مسددة 🔍`}</span>
        </div>
        <span class="stats-val text-ok" style="font-size:24px; font-weight:900;">${formatCurrency(totalRepaid)}</span>
      </div>

      <!-- 3. TOTAL HISTORICAL DISBURSED LOANS (LEFT CARD) -->
      <div class="stats-card ${currentLoanFilter === 'all' ? 'active-kpi' : ''}" onclick="filterLoansByStatus('all')" style="cursor:pointer; background:linear-gradient(135deg, rgba(91,127,255,0.08), rgba(91,127,255,0.02)); border:1.5px solid rgba(91,127,255,0.3); border-radius:16px; padding:18px; transition:all 0.2s ease;" title="انقر لتصفية كافة السلف التراكمية">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span class="stats-title" style="font-weight:800; color:var(--brand);">💰 إجمالي السلف المصروفة (تاريخياً)</span>
          <span class="badge sm" style="font-size:10px; background:${currentLoanFilter === 'all' ? 'var(--brand)' : 'rgba(91,127,255,0.15)'}; color:${currentLoanFilter === 'all' ? '#fff' : 'var(--brand)'}; font-weight:800;">${currentLoanFilter === 'all' ? 'عرض الكل 🎯' : `${employeeLoans.length} سلفة 🔍`}</span>
        </div>
        <span class="stats-val text-brand" style="font-size:24px; font-weight:900;">${formatCurrency(totalDisbursed)}</span>
      </div>
    </div>

    ${currentLoanFilter !== 'all' ? `
      <div class="flex items-center justify-between mb-16" style="padding:10px 16px; background:var(--bg-2); border-radius:10px; border:1px solid var(--border-soft);">
        <span style="font-size:13px; font-weight:700;">🔍 تصفية الجدول حالياً: <strong>${currentLoanFilter === 'active' ? 'السلف القائمة فقط' : 'السلف المسددة بالكامل فقط'}</strong> (${filteredLoans.length} سجل)</span>
        <button class="btn btn-secondary sm" onclick="filterLoansByStatus('all')">✕ إزالة التصفية (عرض الكل)</button>
      </div>
    ` : ''}

    <div class="card">
      ${listHtml}
    </div>
  `;
}

function renderPayrollTab(target) {
  if (!payrollHistory.length) {
    target.innerHTML = `
      <div class="card" style="text-align:center; padding:60px; color:var(--text-3);">
        <div style="font-size:40px; margin-bottom:12px;">💳</div>
        <div style="font-weight:700; font-size:15px; color:var(--text-1); margin-bottom:4px;">لا توجد مسيرات رواتب سابقة</div>
        <div>انقر على زر "إعداد مسير رواتب" لإنشاء وصرف رواتب الموظفين للشهر الحالي.</div>
      </div>`;
    return;
  }

  target.innerHTML = `
    <div class="card">
      <div class="table-container">
        <table class="data-dense">
          <thead>
            <tr>
              <th>شهر الاستحقاق</th>
              <th>تاريخ الصرف</th>
              <th>طريقة الدفع</th>
              <th>عدد الموظفين</th>
              <th>إجمالي مبلغ الصرف</th>
              <th>حساب المصروف</th>
              <th>البيان والملاحظات</th>
              <th style="width:230px;">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${payrollHistory.map(p => `
              <tr>
                <td><strong>${p.month}</strong></td>
                <td class="mono">${p.date}</td>
                <td>${p.method === "cash" ? "💵 نقدي" : "🏦 بنك"}</td>
                <td>${p.employeeCount} موظف</td>
                <td class="mono font-bold text-bad">${formatCurrency(p.amount)}</td>
                <td><small>${p.expenseAccName || "—"}</small></td>
                <td><small style="color:var(--text-3);">${p.notes || "—"}</small></td>
                <td>
                  <button class="btn btn-secondary sm" onclick="viewPayrollDetails('${p.id}')">📂 عرض الموظفين وقسائمهم</button>
                  <button class="btn btn-primary sm" onclick="printPayrollSheet('${p.id}')">🖨️ طباعة المسير</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderEosTab(target) {
  if (!employeeSettlements.length) {
    target.innerHTML = `
      <div class="card" style="text-align:center; padding:60px; color:var(--text-3);">
        <div style="font-size:40px; margin-bottom:12px;">🎓</div>
        <div style="font-weight:700; font-size:15px; color:var(--text-1); margin-bottom:4px;">لا توجد تسويات نهاية خدمة سابقة</div>
        <div>انقر على زر "تصفية موظف" لإجراء احتساب مكافأة نهاية الخدمة وصرفها لموظف منتهي عقده.</div>
      </div>`;
    return;
  }

  target.innerHTML = `
    <div class="card">
      <div class="table-container">
        <table class="data-dense">
          <thead>
            <tr>
              <th>تاريخ التصفية</th>
              <th>الموظف</th>
              <th>السبب</th>
              <th>المكافأة المصروفة</th>
              <th>طريقة الصرف</th>
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${employeeSettlements.map(s => `
              <tr>
                <td class="mono">${s.date}</td>
                <td><strong>${s.empName}</strong></td>
                <td>${s.reason === "resignation" ? "استقالة" : "إنهاء عقد / فصل"}</td>
                <td class="mono font-bold text-bad">${formatCurrency(s.indemnityAmount)}</td>
                <td>${s.method === "cash" ? "💵 نقدي" : "🏦 بنك"}</td>
                <td><small style="color:var(--text-3);">${s.notes || "—"}</small></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── Employee Profile actions ──
window.openEmpModal = (e = null) => {
  document.getElementById("emp-modal-title").textContent = e ? "تعديل موظف" : "إضافة موظف";
  document.getElementById("emp-id").value = e?.id || "";
  document.getElementById("emp-name").value = e?.name || "";
  document.getElementById("emp-job").value = e?.job || "";
  document.getElementById("emp-nid").value = e?.nid || "";
  document.getElementById("emp-nid-expiry").value = e?.nidExpiry || "";
  document.getElementById("emp-date").value = e?.date || todayString();
  document.getElementById("emp-passport").value = e?.passportNo || "";
  document.getElementById("emp-passport-expiry").value = e?.passportExpiry || "";
  document.getElementById("emp-gosi-number").value = e?.gosiNumber || "";
  document.getElementById("emp-salary").value = e?.salary || "";
  document.getElementById("emp-allowance").value = e?.allowance || 0;
  document.getElementById("emp-status").value = e?.status || "active";
  document.getElementById("emp-nationality").value = e?.nationality || "saudi";
  document.getElementById("emp-bank-name").value = e?.bankName || "";
  document.getElementById("emp-iban").value = e?.iban || "";
  document.getElementById("emp-error").classList.add("hidden");
  openModal("emp-modal");
};

window.editEmp = (id) => {
  const e = employees.find(x => x.id === id);
  if (e) openEmpModal(e);
};

window.saveEmployee = async () => {
  const errEl = document.getElementById("emp-error"); errEl.classList.add("hidden");
  const id = document.getElementById("emp-id").value;
  const name = document.getElementById("emp-name").value.trim();
  const salary = parseFloat(document.getElementById("emp-salary").value);
  const nid = document.getElementById("emp-nid").value.trim();
  const nidExpiry = document.getElementById("emp-nid-expiry").value;

  if (!name || isNaN(salary) || !nid || !nidExpiry) { 
    errEl.textContent = "يرجى إدخال الاسم بالكامل، رقم الهوية، تاريخ الانتهاء، والراتب الأساسي"; 
    errEl.classList.remove("hidden"); 
    return; 
  }
  
  const data = {
    name,
    job: document.getElementById("emp-job").value.trim(),
    nid,
    nidExpiry,
    date: document.getElementById("emp-date").value,
    passportNo: document.getElementById("emp-passport").value.trim(),
    passportExpiry: document.getElementById("emp-passport-expiry").value,
    gosiNumber: document.getElementById("emp-gosi-number").value.trim(),
    salary,
    allowance: parseFloat(document.getElementById("emp-allowance").value) || 0,
    status: document.getElementById("emp-status").value,
    nationality: document.getElementById("emp-nationality").value,
    bankName: document.getElementById("emp-bank-name").value.trim(),
    iban: document.getElementById("emp-iban").value.trim()
  };

  const btn = document.getElementById("save-emp-btn"); btn.disabled = true;
  try {
    let empId = id;
    if (id) {
      await update("employees", id, data);
      const oldEmp = employees.find(x => x.id === id);
      if (oldEmp && oldEmp.accountId && oldEmp.name !== name) {
        await updateEntityInCoa(oldEmp.accountId, name);
      }
    } else {
      const res = await create(COLS.employees(), data);
      empId = typeof res === "string" ? res : res.id;
      try {
        const coaData = await syncEntityToCoa("employees", empId, name);
        if (coaData) {
          await update("employees", empId, {
            accountId: coaData.accountId,
            accountCode: coaData.accountCode
          });
        }
      } catch (coaErr) {
        console.warn("[syncEntityToCoa] فشل ربط الموظف بشجرة الحسابات:", coaErr.message);
      }
    }

    // Archive NID & Passport if uploaded
    const nidInput = document.getElementById("emp-nid-upload");
    if (nidInput && nidInput.files.length > 0) {
      const file = nidInput.files[0];
      window.uploadFileToArchive(file, "employee_docs", empId, `صورة إقامة/هوية الموظف: ${name}`).catch(e => console.warn(e));
    }
    const passInput = document.getElementById("emp-passport-upload");
    if (passInput && passInput.files.length > 0) {
      const file = passInput.files[0];
      window.uploadFileToArchive(file, "employee_docs", empId, `صورة جواز سفر الموظف: ${name}`).catch(e => console.warn(e));
    }

    showToast("تم حفظ بيانات الموظف", "success");
    closeModal("emp-modal");
    await switchHrTab("employees");
  } catch (err) { errEl.textContent = err.message; errEl.classList.remove("hidden"); }
  finally { btn.disabled = false; }
};

window.delEmp = async (id, name) => {
  if (confirm(`تأكيد حذف الموظف ${name} نهائياً من سجل الموارد البشرية؟`)) {
    try { 
      const emp = employees.find(x => x.id === id);
      if (emp && emp.accountId) {
        await deleteEntityInCoa("employees", id, emp.accountId);
      }
      await remove("employees", id); 
      showToast("تم حذف ملف الموظف بنجاح", "success"); 
      await switchHrTab("employees"); 
    }
    catch (err) { showToast(err.message, "error"); }
  }
};

// ── View Employee Document Registry Details Modal ──
window.viewEmpDocumentDetails = (empId) => {
  const e = employees.find(x => x.id === empId);
  if (!e) return;

  const now = new Date();
  const getExpiryBadge = (expiryDateStr) => {
    if (!expiryDateStr) return `<span class="expiry-badge" style="background:#ddd; color:#333;">غير متوفر</span>`;
    const expDate = new Date(expiryDateStr);
    const diff = expDate - now;
    const days = Math.ceil(diff / (24*60*60*1000));

    if (days <= 0) return `<span class="expiry-badge danger">منتهية منذ ${Math.abs(days)} يوم</span>`;
    if (days < 30) return `<span class="expiry-badge warning">تنتهي خلال ${days} يوم</span>`;
    return `<span class="expiry-badge good">صالحة (متبقي ${days} يوم)</span>`;
  };

  const body = document.getElementById("doc-details-body");
  if (!body) return;

  body.innerHTML = `
    <div style="font-family:'Cairo', sans-serif; direction:rtl; line-height:1.8;">
      <div style="text-align:center; margin-bottom:16px; border-bottom:1px solid var(--border-soft); padding-bottom:12px;">
        <h3 style="margin:0; color:var(--text-1);">${e.name}</h3>
        <span style="font-size:12px; color:var(--text-3);">${e.job || "بدون مسمى وظيفي"}</span>
      </div>

      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-soft); padding-bottom:6px;">
          <span>📋 الهوية الوطنية / الإقامة:</span>
          <div style="text-align:left;">
            <strong class="mono">${e.nid || "—"}</strong><br>
            ${getExpiryBadge(e.nidExpiry)}
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-soft); padding-bottom:6px;">
          <span>✈️ جواز السفر:</span>
          <div style="text-align:left;">
            <strong class="mono">${e.passportNo || "—"}</strong><br>
            ${getExpiryBadge(e.passportExpiry)}
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-soft); padding-bottom:6px;">
          <span>🇸🇦 فئة الجنسية / التأمينات:</span>
          <strong>${e.nationality === "saudi" ? "سعودي (خاضع للتأمينات)" : "مقيم / أجنبي"}</strong>
        </div>

        <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-soft); padding-bottom:6px;">
          <span>🏦 تفاصيل البنك للراتب:</span>
          <div style="text-align:left;">
            <strong>${e.bankName || "—"}</strong><br>
            <span class="mono" style="font-size:11px; color:var(--text-2);">${e.iban || "—"}</span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-soft); padding-bottom:6px;">
          <span>💼 الراتب الأساسي والبدلات:</span>
          <div>
            الأساسي: <strong class="mono text-brand">${formatCurrency(e.salary)}</strong> | 
            البدلات: <strong class="mono text-ok">${formatCurrency(e.allowance || 0)}</strong>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; padding-bottom:6px;">
          <span>📅 تاريخ التوظيف والتعيين:</span>
          <strong class="mono">${e.date || "—"}</strong>
        </div>
      </div>
    </div>
  `;

  openModal("doc-details-modal");
};

// ── Leave Actions ──
window.openLeaveModal = () => {
  const activeEmps = employees.filter(e => e.status === "active");
  if (!activeEmps.length) {
    showToast("لا يوجد موظفون نشطون لتسجيل إجازة لهم", "warning");
    return;
  }

  document.getElementById("leave-emp-id").innerHTML = activeEmps.map(e => `<option value="${e.id}">${e.name}</option>`).join("");
  document.getElementById("leave-start").value = todayString();
  document.getElementById("leave-end").value = todayString();
  document.getElementById("leave-notes").value = "";
  document.getElementById("leave-error").classList.add("hidden");
  openModal("leave-modal");
};

window.saveEmployeeLeave = async () => {
  const errEl = document.getElementById("leave-error"); errEl.classList.add("hidden");
  const empId = document.getElementById("leave-emp-id").value;
  const type = document.getElementById("leave-type").value;
  const start = document.getElementById("leave-start").value;
  const end = document.getElementById("leave-end").value;
  const notes = document.getElementById("leave-notes").value.trim();

  if (!empId || !start || !end) {
    errEl.textContent = "يرجى ملء جميع الحقول الإجبارية"; errEl.classList.remove("hidden"); return;
  }

  const d1 = new Date(start); const d2 = new Date(end);
  if (d2 < d1) {
    errEl.textContent = "تاريخ الانتهاء لا يمكن أن يكون قبل تاريخ البدء"; errEl.classList.remove("hidden"); return;
  }

  const emp = employees.find(e => e.id === empId);
  const btn = document.getElementById("save-leave-btn"); btn.disabled = true;

  try {
    const ref = doc(collection(db, `companies/${COMPANY_ID}/employeeLeaves`));
    await setDoc(ref, {
      empId,
      empName: emp.name,
      type,
      startDate: start,
      endDate: end,
      notes,
      createdAt: serverTimestamp()
    });

    showToast("✅ تم تسجيل إجازة الموظف بنجاح", "success");
    closeModal("leave-modal");
    await switchHrTab("leaves");
  } catch(err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

window.deleteLeave = async (id) => {
  if (confirm("هل تريد بالتأكيد حذف سجل هذه الإجازة؟")) {
    try {
      await deleteDoc(doc(db, `companies/${COMPANY_ID}/employeeLeaves`, id));
      showToast("تم حذف سجل الإجازة", "success");
      await switchHrTab("leaves");
    } catch(err) {
      showToast(err.message, "error");
    }
  }
};

// ── Loan / Advance Actions ──
window.openLoanModal = () => {
  const empSel = document.getElementById("loan-emp-id");
  const activeEmps = employees.filter(e => e.status === "active");

  if (!activeEmps.length) {
    showToast("لا يوجد موظفون نشطون لصرف سلف لهم", "warning");
    return;
  }

  empSel.innerHTML = activeEmps.map(e => `<option value="${e.id}">${e.name}</option>`).join("");
  document.getElementById("loan-date").value = todayString();
  document.getElementById("loan-amount").value = "";
  document.getElementById("loan-notes").value = "";
  document.getElementById("loan-error").classList.add("hidden");
  toggleLoanSource();
  openModal("loan-modal");
};

window.toggleLoanSource = () => {
  const method = document.getElementById("loan-method").value;
  const label = document.getElementById("loan-source-label");
  const sel = document.getElementById("loan-source");
  sel.innerHTML = '<option value="">اختر...</option>';

  if (method === 'cash') {
    label.textContent = "صندوق الصرف *";
    sel.innerHTML += cashBoxes.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  } else {
    label.textContent = "الحساب البنكي المخصوم منه *";
    sel.innerHTML += bankAccounts.map(b => `<option value="${b.id}">${b.bankName} - ${b.accountNumber}</option>`).join("");
  }
};

async function resolveEmployeeLoanAccount(emp) {
  if (!emp) {
    return allAccounts.find(a => a.code === "1-1-5-4") || { id: "OcKzxqDbfrKjheMgJAYp", code: "1-1-5-4", name: "سلف للموظفين والمناديب" };
  }

  // 1. If employee document has explicit loanAccountId
  if (emp.loanAccountId) {
    const acc = allAccounts.find(a => a.id === emp.loanAccountId);
    if (acc) return acc;
  }

  // 2. Search allAccounts for an account linked to this employee or matching name under 1-1-5-4
  const specificAcc = allAccounts.find(a => {
    const isUnderLoan = (a.parentCode === "1-1-5-4" || (a.code && a.code.startsWith("1-1-5-4")));
    const matchesEmp = (
      (a.sourceEntityId && a.sourceEntityId === emp.id) ||
      (a.linkedEmpId && a.linkedEmpId === emp.id) ||
      (a.linkedRepId && a.linkedRepId === emp.id) ||
      (a.name && emp.name && (a.name.includes(emp.name) || emp.name.includes(a.name)))
    );
    return isUnderLoan && matchesEmp;
  });
  if (specificAcc) return specificAcc;

  // Also check any account matching employee name that is under 1-1-5-4 (e.g. NCR8atLvaqjUZyizHU6R with code 2-1-5-3 and parentCode 1-1-5-4)
  const nameMatchAcc = allAccounts.find(a => 
    a.name && emp.name && 
    (a.name.includes(emp.name) || emp.name.includes(a.name)) &&
    (a.parentCode === "1-1-5-4" || (a.code && a.code.startsWith("1-1-5-4")) || (a.name && a.name.includes("سلف")))
  );
  if (nameMatchAcc) return nameMatchAcc;

  // 3. Dynamically create a sub-account for this employee under 1-1-5-4
  try {
    const parentCode = "1-1-5-4";
    const newCode = await generateCoaSubAccountCode(parentCode);
    const colRef = collection(db, `companies/${COMPANY_ID}/chartOfAccounts`);
    const parentAcc = allAccounts.find(a => a.code === parentCode) || { id: "OcKzxqDbfrKjheMgJAYp" };

    const newAccRef = doc(colRef);
    const newAccData = {
      code: newCode,
      name: `سلف الموظف ${emp.name}`,
      parentCode: parentCode,
      parentId: parentAcc.id || "OcKzxqDbfrKjheMgJAYp",
      type: "asset",
      nodeType: "detail",
      level: 4,
      balance: 0,
      totalDebit: 0,
      totalCredit: 0,
      normalBalance: "debit",
      companyId: COMPANY_ID,
      sourceEntityId: emp.id,
      linkedEmpId: emp.id,
      isActive: true,
      createdAt: serverTimestamp()
    };

    await setDoc(newAccRef, newAccData);

    const createdAcc = { id: newAccRef.id, ...newAccData };
    allAccounts.push(createdAcc);

    // Update employee doc with loanAccountId
    try {
      await updateDoc(doc(db, `companies/${COMPANY_ID}/employees`, emp.id), { loanAccountId: newAccRef.id });
      emp.loanAccountId = newAccRef.id;
    } catch(e) {}

    return createdAcc;
  } catch (err) {
    console.error("Failed to auto-create employee loan sub-account:", err);
    return allAccounts.find(a => a.code === "1-1-5-4") || { id: "OcKzxqDbfrKjheMgJAYp", code: "1-1-5-4", name: "سلف للموظفين والمناديب" };
  }
}

window.saveEmployeeLoan = async () => {
  const errEl = document.getElementById("loan-error"); errEl.classList.add("hidden");
  const empId = document.getElementById("loan-emp-id").value;
  const date = document.getElementById("loan-date").value;
  const amount = parseFloat(document.getElementById("loan-amount").value);
  const method = document.getElementById("loan-method").value;
  const sourceId = document.getElementById("loan-source").value;
  const notes = document.getElementById("loan-notes").value.trim();

  if (!empId || !date || isNaN(amount) || amount <= 0 || !sourceId || !notes) {
    errEl.textContent = "الرجاء تعبئة كافة الحقول المطلوبة وكتابة بيان صحيح للسلفة";
    errEl.classList.remove("hidden");
    return;
  }

  const emp = employees.find(e => e.id === empId);
  const btn = document.getElementById("save-loan-btn"); btn.disabled = true;

  try {
    const loanAssetAcc = await resolveEmployeeLoanAccount(emp);
    let payAccId = "";
    let payAccCode = "";
    let payAccName = "";
    let sourceDocRef = null;

    if (method === "cash") {
      const cb = cashBoxes.find(c => c.id === sourceId);
      payAccId = cb?.accountId;
      payAccCode = cb?.code || "";
      payAccName = cb?.name || "";
      sourceDocRef = doc(db, `companies/${COMPANY_ID}/cashBoxes`, sourceId);
    } else {
      const ba = bankAccounts.find(b => b.id === sourceId);
      payAccId = ba?.accountId;
      payAccCode = ba?.code || "";
      payAccName = ba?.bankName || "";
      sourceDocRef = doc(db, `companies/${COMPANY_ID}/bankAccounts`, sourceId);
    }

    if (!payAccId) throw new Error("حساب الدفع المختار غير مربوط بشجرة الحسابات");

    const payAcc = allAccounts.find(a => a.id === payAccId) || { id: payAccId, code: payAccCode, name: payAccName };

    const loanRef = doc(collection(db, `companies/${COMPANY_ID}/employeeLoans`));
    const loanData = {
      empId,
      empName: emp.name,
      date,
      amount,
      paidAmount: 0,
      remainingBalance: amount,
      method,
      sourceId,
      notes,
      status: "active",
      createdAt: serverTimestamp()
    };
    await setDoc(loanRef, loanData);

    await createJournalEntry({
      date,
      description: `صرف سلفة للموظف ${emp.name} - مستند ${loanRef.id.slice(-6)}`,
      sourceType: "employee_advance",
      sourceId: loanRef.id,
      lines: [
        { accountId: loanAssetAcc.id, accountCode: loanAssetAcc.code, accountName: loanAssetAcc.name, debit: amount, credit: 0, note: `سلفة للموظف ${emp.name}` },
        { accountId: payAcc.id, accountCode: payAcc.code, accountName: payAcc.name, debit: 0, credit: amount, note: `صرف سلفة للموظف ${emp.name} من ${payAcc.name}` }
      ]
    });

    if (sourceDocRef) {
      const snap = await getDoc(sourceDocRef);
      if (snap.exists()) {
        const curBal = parseFloat(snap.data().balance || 0);
        await updateDoc(sourceDocRef, {
          balance: curBal - amount,
          updatedAt: serverTimestamp()
        });
      }
    }

    showToast(`✅ تم صرف السلفة بنجاح للموظف ${emp.name} على حسابه الفرعي (${loanAssetAcc.name})`, "success");
    closeModal("loan-modal");
    await switchHrTab("loans");
  } catch (err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

window.deleteLoan = async (id, empName, amount) => {
  if (confirm(`تأكيد حذف وإلغاء سلفة الموظف ${empName} بمبلغ ${amount} ر.س من قسم الموارد البشرية؟`)) {
    try {
      if (id.startsWith("je_") || id.startsWith("manual_")) {
        const ignoredIds = JSON.parse(localStorage.getItem("ignored_hr_loans") || "[]");
        if (!ignoredIds.includes(id)) ignoredIds.push(id);
        localStorage.setItem("ignored_hr_loans", JSON.stringify(ignoredIds));
        showToast("تم استبعاد وإخفاء السلفة من قسم الموارد البشرية بنجاح", "success");
        await switchHrTab("loans");
        return;
      }

      const loanRef = doc(db, `companies/${COMPANY_ID}/employeeLoans`, id);
      const snap = await getDoc(loanRef);
      if (!snap.exists()) {
        const ignoredIds = JSON.parse(localStorage.getItem("ignored_hr_loans") || "[]");
        if (!ignoredIds.includes(id)) ignoredIds.push(id);
        localStorage.setItem("ignored_hr_loans", JSON.stringify(ignoredIds));
        showToast("تم استبعاد السلفة من قسم الموارد البشرية بنجاح", "success");
        await switchHrTab("loans");
        return;
      }
      const l = snap.data();

      let sourceDocRef = null;
      if (l.method === "cash") {
        sourceDocRef = doc(db, `companies/${COMPANY_ID}/cashBoxes`, l.sourceId);
      } else {
        sourceDocRef = doc(db, `companies/${COMPANY_ID}/bankAccounts`, l.sourceId);
      }

      if (sourceDocRef) {
        const sSnap = await getDoc(sourceDocRef);
        if (sSnap.exists()) {
          const curBal = parseFloat(sSnap.data().balance || 0);
          await updateDoc(sourceDocRef, {
            balance: curBal + amount,
            updatedAt: serverTimestamp()
          });
        }
      }

      const empForLoan = employees.find(e => e.name === l.empName || e.id === l.empId);
      const loanAssetAcc = await resolveEmployeeLoanAccount(empForLoan);
      let payAccId = "";
      if (l.method === "cash") {
        payAccId = cashBoxes.find(c => c.id === l.sourceId)?.accountId;
      } else {
        payAccId = bankAccounts.find(b => b.id === l.sourceId)?.accountId;
      }
      const payAcc = allAccounts.find(a => a.id === payAccId);

      if (payAcc) {
        await createJournalEntry({
          date: todayString(),
          description: `عكس وإلغاء قيد سلفة الموظف ${empName} - مستند ${id.slice(-6)}`,
          sourceType: "employee_advance_reversal",
          sourceId: id,
          lines: [
            { accountId: payAcc.id, accountCode: payAcc.code, accountName: payAcc.name, debit: amount, credit: 0, note: "عكس قيد صرف سلفة ملغاة" },
            { accountId: loanAssetAcc.id, accountCode: loanAssetAcc.code, accountName: loanAssetAcc.name, debit: 0, credit: amount, note: "تخفيض ذمة السلف للموظف بالإلغاء" }
          ]
        });
      }

      await deleteDoc(loanRef);
      showToast("تم إلغاء السلفة وعكس القيد المحاسبي المترتب عليها", "success");
      await switchHrTab("loans");
    } catch(err) {
      showToast(err.message, "error");
    }
  }
};

// ── End of Service (EOS) Settlements UI & Logic ──
window.openEosModal = () => {
  const activeEmps = employees.filter(e => e.status === "active" || e.status === "suspended");
  if (!activeEmps.length) {
    showToast("لا يوجد موظفون نشطون لإجراء تصفية نهاية خدمة لهم", "warning");
    return;
  }

  document.getElementById("eos-emp-id").innerHTML = '<option value="">اختر الموظف...</option>' + 
    activeEmps.map(e => `<option value="${e.id}">${e.name}</option>`).join("");
  document.getElementById("eos-date").value = todayString();
  document.getElementById("eos-notes").value = "";
  document.getElementById("eos-error").classList.add("hidden");
  document.getElementById("eos-calc-details").innerHTML = `<div class="alert info" style="margin:0;">يرجى اختيار الموظف لتحديث تفاصيل مدة الخدمة والمكافأة تلقائياً وفق قانون العمل.</div>`;
  
  const liabAccs = allAccounts.filter(a => a.type === "liability");
  document.getElementById("eos-account-id").innerHTML = '<option value="">اختر...</option>' +
    liabAccs.map(a => `<option value="${a.id}">${a.code} - ${a.name}</option>`).join("");

  const eosDefaultAcc = allAccounts.find(a => a.code === "2-1-5-2");
  if (eosDefaultAcc) {
    document.getElementById("eos-account-id").value = eosDefaultAcc.id;
  }

  toggleEosSource();
  openModal("eos-modal");
  
  document.getElementById("save-eos-btn").disabled = true;
};

window.toggleEosSource = () => {
  const method = document.getElementById("eos-method").value;
  const label = document.getElementById("eos-source-label");
  const sel = document.getElementById("eos-source");
  sel.innerHTML = '<option value="">اختر...</option>';

  if (method === 'cash') {
    label.textContent = "صندوق الصرف *";
    sel.innerHTML += cashBoxes.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  } else {
    label.textContent = "الحساب البنكي المخصوم منه *";
    sel.innerHTML += bankAccounts.map(b => `<option value="${b.id}">${b.bankName} - ${b.accountNumber}</option>`).join("");
  }
};

window.calculateEosIndemnity = () => {
  const empId = document.getElementById("eos-emp-id").value;
  const endDateStr = document.getElementById("eos-date").value;
  const reason = document.getElementById("eos-reason").value;
  const calcEl = document.getElementById("eos-calc-details");
  const saveBtn = document.getElementById("save-eos-btn");

  if (!empId || !endDateStr || !calcEl) {
    if (saveBtn) saveBtn.disabled = true;
    return;
  }

  const emp = employees.find(e => e.id === empId);
  if (!emp) {
    if (saveBtn) saveBtn.disabled = true;
    return;
  }

  const hireDate = new Date(emp.date || todayString());
  const endDate = new Date(endDateStr);

  const diffTime = endDate - hireDate;
  if (diffTime < 0) {
    calcEl.innerHTML = `<div class="text-bad" style="font-weight:bold; padding:8px; border:1px solid var(--border); border-radius:6px; background:rgba(239,68,68,0.05);">⚠️ تاريخ التصفية يجب أن يكون بعد تاريخ التعيين للموظف وهو (${emp.date})</div>`;
    if (saveBtn) saveBtn.disabled = true;
    return;
  }

  if (saveBtn) saveBtn.disabled = false;

  let years = endDate.getFullYear() - hireDate.getFullYear();
  let months = endDate.getMonth() - hireDate.getMonth();
  let days = endDate.getDate() - hireDate.getDate();

  if (days < 0) {
    months--;
    const lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
    days += lastMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalYearsDecimal = years + (months / 12) + (days / 365.25);
  const basicSalary = emp.salary || 0;
  const monthlyAllowance = emp.allowance || 0;
  const fullSalary = basicSalary + monthlyAllowance;

  let gratuity = 0;
  let breakdown = "";

  let baseGratuity = 0;
  if (totalYearsDecimal <= 5) {
    baseGratuity = totalYearsDecimal * (fullSalary / 2);
    breakdown += `• حساب أول 5 سنوات: ${totalYearsDecimal.toFixed(2)} سنة × نصف راتب (${formatCurrency(fullSalary / 2)}) = ${formatCurrency(baseGratuity)} ر.س<br>`;
  } else {
    const first5 = 5 * (fullSalary / 2);
    const extraYears = totalYearsDecimal - 5;
    const extraGrat = extraYears * fullSalary;
    baseGratuity = first5 + extraGrat;
    breakdown += `• حساب أول 5 سنوات: 5 سنوات × نصف راتب (${formatCurrency(fullSalary / 2)}) = ${formatCurrency(first5)} ر.س<br>`;
    breakdown += `• حساب ما بعد 5 سنوات: ${extraYears.toFixed(2)} سنة × راتب كامل (${formatCurrency(fullSalary)}) = ${formatCurrency(extraGrat)} ر.س<br>`;
  }

  let multiplier = 1;
  let multiplierExplanation = "إنهاء عقد / فصل من العمل (تستحق المكافأة كاملة 100%)";

  if (reason === "resignation") {
    if (totalYearsDecimal < 2) {
      multiplier = 0;
      multiplierExplanation = "الخدمة أقل من سنتين في حالة الاستقالة (لا تستحق مكافأة 0%)";
    } else if (totalYearsDecimal >= 2 && totalYearsDecimal < 5) {
      multiplier = 1/3;
      multiplierExplanation = "الخدمة بين 2 إلى 5 سنوات في حالة الاستقالة (تستحق ثلث المكافأة 33.3%)";
    } else if (totalYearsDecimal >= 5 && totalYearsDecimal < 10) {
      multiplier = 2/3;
      multiplierExplanation = "الخدمة بين 5 إلى 10 سنوات في حالة الاستقالة (تستحق ثلثي المكافأة 66.6%)";
    } else {
      multiplier = 1;
      multiplierExplanation = "الخدمة أكثر من 10 سنوات في حالة الاستقالة (تستحق المكافأة كاملة 100%)";
    }
  }

  gratuity = baseGratuity * multiplier;

  calcEl.innerHTML = `
    <div style="background:var(--bg-2); border:1px solid var(--border); border-radius:12px; padding:16px; font-size:12px; line-height:1.6; color:var(--text-1);">
      <div style="margin-bottom:6px;"><strong>📅 تاريخ التعيين:</strong> ${emp.date}</div>
      <div style="margin-bottom:8px;"><strong>⏱️ مدة الخدمة الفعلية:</strong> ${years} سنة، و ${months} شهر، و ${days} يوم (${totalYearsDecimal.toFixed(3)} سنة)</div>
      
      <div style="margin-top:8px; padding-top:8px; border-top:1px dashed var(--border); font-size:11px; color:var(--text-2);">
        <strong>⚙️ تفاصيل حساب المكافأة (حسب نظام العمل السعودي):</strong><br>
        ${breakdown}
        <strong>الحالة:</strong> ${multiplierExplanation}<br>
      </div>

      <div style="margin-top:12px; padding:12px; background:var(--brand-alpha, rgba(91, 127, 255, 0.1)); border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-weight:bold; font-size:14px; border:1px solid var(--brand-alpha);">
        <span>صافي مكافأة نهاية الخدمة المستحقة:</span>
        <span class="mono text-bad" style="font-size:16px;" id="calculated-eos-amount" data-val="${gratuity.toFixed(2)}">${formatCurrency(gratuity)} ر.س</span>
      </div>
    </div>
  `;
};

window.saveEosSettlement = async () => {
  const errEl = document.getElementById("eos-error"); errEl.classList.add("hidden");
  const empId = document.getElementById("eos-emp-id").value;
  const date = document.getElementById("eos-date").value;
  const reason = document.getElementById("eos-reason").value;
  const method = document.getElementById("eos-method").value;
  const sourceId = document.getElementById("eos-source").value;
  const expAccId = document.getElementById("eos-account-id").value;
  const notes = document.getElementById("eos-notes").value.trim();

  const calcedAmountEl = document.getElementById("calculated-eos-amount");
  const indemnityAmount = calcedAmountEl ? parseFloat(calcedAmountEl.dataset.val) || 0 : 0;

  if (!empId || !date || !sourceId || !expAccId) {
    errEl.textContent = "الرجاء تحديد كافة الحقول المطلوبة ومراجعة الحساب";
    errEl.classList.remove("hidden");
    return;
  }

  const emp = employees.find(e => e.id === empId);
  const btn = document.getElementById("save-eos-btn"); btn.disabled = true;

  try {
    let payAccId = "";
    let payAccCode = "";
    let payAccName = "";
    let sourceDocRef = null;

    if (method === "cash") {
      const cb = cashBoxes.find(c => c.id === sourceId);
      payAccId = cb?.accountId;
      payAccCode = cb?.code || "";
      payAccName = cb?.name || "";
      sourceDocRef = doc(db, `companies/${COMPANY_ID}/cashBoxes`, sourceId);
    } else {
      const ba = bankAccounts.find(b => b.id === sourceId);
      payAccId = ba?.accountId;
      payAccCode = ba?.code || "";
      payAccName = ba?.bankName || "";
      sourceDocRef = doc(db, `companies/${COMPANY_ID}/bankAccounts`, sourceId);
    }

    if (!payAccId) throw new Error("حساب الصرف المختار غير مربوط بشجرة الحسابات");

    const payAccObj = allAccounts.find(a => a.id === payAccId) || { id: payAccId, code: payAccCode, name: payAccName };
    const debitAccObj = allAccounts.find(a => a.id === expAccId);

    await updateDoc(doc(db, `companies/${COMPANY_ID}/employees`, empId), {
      status: "resigned"
    });

    const setRef = doc(collection(db, `companies/${COMPANY_ID}/employeeSettlements`));
    await setDoc(setRef, {
      empId,
      empName: emp.name,
      date,
      reason,
      indemnityAmount,
      method,
      sourceId,
      expenseAccId: expAccId,
      notes: notes || "تصفية نهاية خدمة الموظف المعتمدة",
      createdAt: serverTimestamp()
    });

    if (indemnityAmount > 0) {
      await createJournalEntry({
        date,
        description: `تصفية مستحقات ومكافأة نهاية خدمة الموظف ${emp.name}`,
        sourceType: "employee_settlement",
        sourceId: setRef.id,
        lines: [
          { accountId: expAccId, accountCode: debitAccObj?.code || "", accountName: debitAccObj?.name || "", debit: indemnityAmount, credit: 0, note: `مكافأة نهاية خدمة الموظف ${emp.name}` },
          { accountId: payAccObj.id, accountCode: payAccObj.code, accountName: payAccObj.name, debit: 0, credit: indemnityAmount, note: `صرف مستحقات تصفية الموظف ${emp.name}` }
        ]
      });

      if (sourceDocRef) {
        const snap = await getDoc(sourceDocRef);
        if (snap.exists()) {
          const curBal = parseFloat(snap.data().balance || 0);
          await updateDoc(sourceDocRef, {
            balance: curBal - indemnityAmount,
            updatedAt: serverTimestamp()
          });
        }
      }
    }

    showToast(`✅ تم اعتماد تصفية الموظف ${emp.name} وصرف مستحقاته بنجاح`, "success");
    closeModal("eos-modal");
    await switchHrTab("eos");
  } catch (err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

// ── Helper: Normalize Arabic Text ──
function normalizeText(str) {
  if (!str) return "";
  return str.replace(/[أإآ]/g, "ا")
            .replace(/[ى]/g, "ي")
            .replace(/[ة]/g, "ه")
            .replace(/[\/\-_]/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();
}

// ── Helper: Resolve Employee Specific Accounts in Chart of Accounts ──
function resolveEmployeeAccounts(emp, accList) {
  if (!emp || !accList || !accList.length) return { liabAcc: null, loanAcc: null, custodyAcc: null };
  const norm = normalizeText(emp.name);
  let liabAcc = null;
  let loanAcc = null;
  let custodyAcc = null;

  if (norm.includes("ابراهيم")) {
    liabAcc = accList.find(a => a.code === "2-1-5-6" || (a.code?.startsWith("2-1-5") && normalizeText(a.name).includes("ابراهيم")));
    loanAcc = accList.find(a => a.code === "1-1-5-4-5" || (normalizeText(a.name).includes("ابراهيم") && (a.code?.startsWith("1-1-5") || a.code?.startsWith("1-1-3"))));
  } else if (norm.includes("مصطفي") || norm.includes("الاسيوطي")) {
    liabAcc = accList.find(a => a.code === "2-1-5-1" || (a.code?.startsWith("2-1-5") && (normalizeText(a.name).includes("مصطفي") || normalizeText(a.name).includes("الاسيوطي")) && a.type === "liability"));
    loanAcc = accList.find(a => a.code === "2-1-5-3" || (a.code?.startsWith("1-1-5") && normalizeText(a.name).includes("مصطفي")));
  } else if (norm.includes("عوض") || (norm.includes("محمد") && !norm.includes("محمود"))) {
    liabAcc = accList.find(a => a.code === "2-1-5-2" || (a.code?.startsWith("2-1-5") && normalizeText(a.name).includes("محمد") && !norm.includes("محمود")));
    loanAcc = accList.find(a => a.code === "1-1-5-4-7" || (a.code?.startsWith("1-1-5") && normalizeText(a.name).includes("محمد")));
    custodyAcc = accList.find(a => a.code === "1-1-2-3-1" || (a.code?.startsWith("1-1-2-3") && normalizeText(a.name).includes("محمد")));
  } else if (norm.includes("علي") || norm.includes("عبده")) {
    liabAcc = accList.find(a => a.code === "2-1-5-4" || (a.code?.startsWith("2-1-5") && normalizeText(a.name).includes("علي")));
    loanAcc = accList.find(a => a.code === "1-1-5-4-4" || (a.code?.startsWith("1-1-5") && normalizeText(a.name).includes("علي")));
  } else if (norm.includes("السيد رضا") || (norm.includes("رضا") && !norm.includes("رياض"))) {
    liabAcc = accList.find(a => a.code === "2-1-5-10" || (a.code?.startsWith("2-1-5") && normalizeText(a.name).includes("رضا")));
    loanAcc = accList.find(a => a.code === "1-1-5-4-8" || (a.code?.startsWith("1-1-5") && normalizeText(a.name).includes("رضا")));
    custodyAcc = accList.find(a => a.code === "1-1-2-3-2" || (a.code?.startsWith("1-1-2-3") && normalizeText(a.name).includes("رضا")));
  } else if (norm.includes("احمد السيد") || norm.includes("احمد")) {
    liabAcc = accList.find(a => a.code === "2-1-5-9" || (a.code?.startsWith("2-1-5") && normalizeText(a.name).includes("احمد")));
    loanAcc = accList.find(a => a.code === "1-1-5-4-6" || (a.code?.startsWith("1-1-5") && normalizeText(a.name).includes("احمد")));
  } else if (norm.includes("محمود")) {
    liabAcc = accList.find(a => a.code === "2-1-5-8" || (a.code?.startsWith("2-1-5") && normalizeText(a.name).includes("محمود")));
  } else if (norm.includes("عبد الرحمن")) {
    liabAcc = accList.find(a => a.code === "2-1-5-7" || (a.code?.startsWith("2-1-5") && normalizeText(a.name).includes("عبد الرحمن")));
  } else if (norm.includes("ناجي") || norm.includes("عاطف")) {
    liabAcc = accList.find(a => a.code === "2-1-5-5" || (a.code?.startsWith("2-1-5") && normalizeText(a.name).includes("ناجي")));
  }

  // Fallbacks
  if (!liabAcc && emp.accountId) liabAcc = accList.find(a => a.id === emp.accountId);
  if (!liabAcc && emp.accountCode) liabAcc = accList.find(a => a.code === emp.accountCode);
  if (!liabAcc) {
    const tokens = norm.split(" ").filter(t => t.length >= 3);
    liabAcc = accList.find(a => a.code?.startsWith("2-1-5") && a.type === "liability" && tokens.some(t => normalizeText(a.name).includes(t)));
  }

  return { liabAcc, loanAcc, custodyAcc };
}

window.calculateGrandTotal = () => {
  let totalNet = 0;
  document.querySelectorAll(".pr-row").forEach(row => {
    const empId = row.dataset.id;
    const netEl = document.getElementById(`net-${empId}`);
    if (netEl) {
      const txt = netEl.textContent.replace(/[^0-9.-]+/g, "");
      const val = parseFloat(txt) || 0;
      totalNet += val;
    }
  });
  const totalEl = document.getElementById("pr-total");
  if (totalEl) {
    totalEl.textContent = `${formatCurrency(totalNet)} ر.س`;
  }
};

// ── Payroll modal UI & Logic (Automatic CoA & GL Integration) ──
window.openPayrollModal = async () => {
  try {
    if (!employees || !employees.length) {
      employees = await getAll(COLS.employees());
    }
    if (!allAccounts || !allAccounts.length) {
      allAccounts = await getAll(COLS.chartOfAccounts());
    }
    if (!cashBoxes || !cashBoxes.length) {
      cashBoxes = await getAll(COLS.cashBoxes());
    }
    if (!bankAccounts || !bankAccounts.length) {
      bankAccounts = await getAll(COLS.bankAccounts());
    }
    if (!employeeLoans || !employeeLoans.length) {
      try {
        const snap = await getDocs(COLS.employeeLoans());
        employeeLoans = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch(e) {}
    }

    let allJournalEntries = [];
    try {
      allJournalEntries = await getAll(COLS.journalEntries());
    } catch(e) {}

    const activeEmps = employees.filter(e => e.status === "active");
    if (!activeEmps.length) { showToast("لا يوجد موظفون نشطون لإصدار رواتب لهم", "warning"); return; }
    
    togglePrSource();

    const expAccs = allAccounts.filter(a => a.type === 'expense');
    document.getElementById("pr-expense-acc").innerHTML = '<option value="">اختر...</option>' + 
      expAccs.map(a => `<option value="${a.id}">${a.code} - ${a.name}</option>`).join("");
    
    document.getElementById("pr-allowance-acc").innerHTML = '<option value="">اختر...</option>' + 
      expAccs.map(a => `<option value="${a.id}">${a.code} - ${a.name}</option>`).join("");

    // Smart default expense accounts mapping (5-2-1 for salaries, 5-2-2 / 5-2-5 for allowances)
    const basicAcc = allAccounts.find(a => a.code === "5-2-1" || a.code === "5-2-1-1") ||
                     allAccounts.find(a => a.code?.startsWith("5-2-1")) ||
                     allAccounts.find(a => a.name?.includes("رواتب") && a.type === "expense") ||
                     allAccounts.find(a => a.code?.startsWith("5-2"));
    const allowAcc = allAccounts.find(a => a.code === "5-2-2" || a.code === "5-2-5" || a.code === "5-2-5-1") ||
                     allAccounts.find(a => (a.code?.startsWith("5-2-2") || a.code?.startsWith("5-2-5")) && a.type === "expense") ||
                     allAccounts.find(a => a.name?.includes("بدلات") && a.type === "expense");
    if (basicAcc) document.getElementById("pr-expense-acc").value = basicAcc.id;
    if (allowAcc) document.getElementById("pr-allowance-acc").value = allowAcc.id;

    const selectedMonth = document.getElementById("pr-month")?.value || new Date().toISOString().slice(0, 7);
    
    // Calculate representatives commission dynamically for selected month
    const commByEmployeeId = {};
    try {
      const [reps, receipts, invoices] = await Promise.all([
        getAll(COLS.salesReps()),
        getAll(COLS.receipts()),
        getAll(COLS.salesInvoices())
      ]);
      const monthlyReceipts = receipts.filter(rcpt => rcpt.date && rcpt.date.slice(0, 7) === selectedMonth && rcpt.entityType === "customer");
      const monthlyInvoices = invoices.filter(inv => inv.date && inv.date.slice(0, 7) === selectedMonth && inv.status !== "cancelled");
      
      reps.forEach(rep => {
        let repCollections = 0;
        monthlyReceipts.forEach(rcpt => {
          if (rcpt.repId === rep.id || rcpt.targetId === rep.id) {
            repCollections += parseFloat(rcpt.amount || 0);
          }
        });
        
        let repSales = 0;
        monthlyInvoices.forEach(inv => {
          if (inv.repId === rep.id) {
            repSales += parseFloat(inv.totalWithVat || inv.total || 0);
          }
        });
        
        const target = rep.monthlyTarget || 0;
        const commRate = repSales < target ? 1.0 : parseFloat(rep.commissionRate || 2.5);
        const earnedCommission = (repCollections * commRate) / 100;
        
        const matchedEmp = employees.find(e => e.id === rep.employeeId || e.name.includes(rep.name) || rep.name.includes(e.name));
        if (matchedEmp) {
          commByEmployeeId[matchedEmp.id] = (commByEmployeeId[matchedEmp.id] || 0) + earnedCommission;
        }
      });
    } catch (err) {
      console.error("Error calculating rep commission for payroll:", err);
    }

    const tbody = document.getElementById("pr-tbody");
    let grandTotal = 0;

    tbody.innerHTML = activeEmps.map(e => {
      const { liabAcc, loanAcc } = resolveEmployeeAccounts(e, allAccounts);
      const basic = parseFloat(e.salary || 0);
      const allowance = parseFloat(e.allowance || 0);
      const repComm = commByEmployeeId[e.id] || 0;
      const empTokens = normalizeText(e.name).split(" ").filter(t => t.length >= 3);

      // Parse GL / Journal Entries for this specific employee
      let monthAdvancesTaken = 0;
      let monthBonuses = 0;
      let historicalUnsettledBalance = 0;

      for (const je of allJournalEntries) {
        const jeDate = je.date || "";
        const isSelectedMonth = jeDate.startsWith(selectedMonth);
        const isBeforeOrInMonth = jeDate <= `${selectedMonth}-31`;
        const jeDesc = normalizeText(je.description || "");

        const isPayrollSettlement = jeDesc.includes("اقفال سلف") || jeDesc.includes("اقفال السلف") || 
                                    jeDesc.includes("صرف راتب") || jeDesc.includes("صرف رواتب") ||
                                    jeDesc.includes("تصفية مستحقات") || jeDesc.includes("قيد اثبات مستحقات") ||
                                    jeDesc.includes("قيد رواتب");

        for (const line of (je.lines || [])) {
          const accId = line.accountId;
          const accCode = line.accountCode || "";
          const dr = parseFloat(line.debit || 0) || 0;
          const cr = parseFloat(line.credit || 0) || 0;
          const lineDesc = normalizeText(line.desc || "");

          // 1. Advance / Loan Account
          if (loanAcc && (accId === loanAcc.id || accCode === loanAcc.code)) {
            if (isSelectedMonth && dr > 0 && !isPayrollSettlement) {
              monthAdvancesTaken += dr;
            }
            if (isBeforeOrInMonth && !isPayrollSettlement) {
              historicalUnsettledBalance += (dr - cr);
            }
          }

          // 2. Direct advance debit on liability account
          if (liabAcc && (accId === liabAcc.id || accCode === liabAcc.code)) {
            if (isSelectedMonth && dr > 0 && (jeDesc.includes("سلف") || jeDesc.includes("سلفة") || jeDesc.includes("مخالف")) && !isPayrollSettlement) {
              monthAdvancesTaken += dr;
            }
          }

          // 3. Bonuses / Incentives from 5-2-7
          if (isSelectedMonth && accCode.startsWith("5-2-7") && dr > 0) {
            if (empTokens.some(t => jeDesc.includes(t) || lineDesc.includes(t)) || (liabAcc && accId === liabAcc.id)) {
              monthBonuses += dr;
            }
          }
        }
      }

      // Legacy loans from HR section
      const legacyLoans = (employeeLoans || []).filter(l => 
        (l.remainingBalance || 0) > 0 && 
        (l.empId === e.id || (l.empName && e.name && (l.empName.includes(e.name) || e.name.includes(l.empName))))
      );
      const legacyLoanBal = legacyLoans.reduce((sum, l) => sum + (l.remainingBalance || 0), 0);

      const totalLoanBalance = Math.max(monthAdvancesTaken, historicalUnsettledBalance, legacyLoanBal);
      const effectiveBonus = repComm > 0 ? repComm : monthBonuses;
      const gross = basic + allowance + effectiveBonus;

      // Suggested repayment: exactly matches the month's taken advances (or up to gross)
      const suggestedRepay = monthAdvancesTaken > 0 ? Math.min(monthAdvancesTaken, basic + allowance) : (totalLoanBalance > 0 ? Math.min(totalLoanBalance, (basic + allowance) * 0.25) : 0);

      // Saudi GOSI (9.75% for Saudi, 0 for Non-Saudi)
      const empGosi = e.nationality === "saudi" ? (basic + allowance) * 0.0975 : 0;
      const net = Math.max(0, gross - empGosi - suggestedRepay);
      grandTotal += net;

      const liabBadge = liabAcc ? `<span class="badge" style="font-size:9.5px; background:rgba(37,99,235,0.1); color:#1d4ed8; border:1px solid rgba(37,99,235,0.25); margin-right:4px;" title="حساب المستحقات: ${liabAcc.name}">${liabAcc.code}</span>` : '';
      const loanBadge = loanAcc ? `<span class="badge" style="font-size:9.5px; background:rgba(220,38,38,0.1); color:#b91c1c; border:1px solid rgba(220,38,38,0.25); margin-right:4px;" title="حساب السلف: ${loanAcc.name}">${loanAcc.code}</span>` : '';

      return `
        <tr class="pr-row" data-id="${e.id}" data-nationality="${e.nationality || 'saudi'}" data-liab-acc="${liabAcc?.id || ''}" data-loan-acc="${loanAcc?.id || ''}">
          <td style="white-space:nowrap;">
            <strong>${e.name}</strong> ${liabBadge} ${loanBadge}<br>
            <small style="color:var(--text-3);">${e.job || "موظف"}</small>
          </td>
          <td class="mono font-bold">${formatCurrency(basic)}</td>
          <td class="mono">${formatCurrency(allowance)}</td>
          <td>
            <input type="number" class="input mono pr-overtime" value="0" min="0" step="0.01" style="height:28px; padding:2px; font-size:11px;" onchange="calculateRowNet('${e.id}', ${basic}, ${allowance})" />
          </td>
          <td>
            <div style="display:flex; flex-direction:column; gap:2px;">
              <input type="number" class="input mono pr-bonus" value="${effectiveBonus.toFixed(2)}" min="0" step="0.01" style="height:26px; padding:2px; font-size:11px;" onchange="calculateRowNet('${e.id}', ${basic}, ${allowance})" title="${repComm > 0 ? 'عمولة مبيعات مناديب' : 'مكافآت وحوافز'}" placeholder="0.00" />
              <input type="text" class="input pr-bonus-desc" value="${repComm > 0 ? 'عمولة مبيعات شهر ' + selectedMonth : ''}" placeholder="بيان المكافأة..." style="height:20px; padding:1px 4px; font-size:9.5px; color:var(--text-1);" title="بيان المكافأة ليظهر تفصيلياً في كشف حساب المستحقات" />
            </div>
          </td>
          <td>
            <input type="number" class="input mono pr-deduct" value="0" min="0" step="0.01" style="height:28px; padding:2px; font-size:11px;" onchange="calculateRowNet('${e.id}', ${basic}, ${allowance})" title="حاضر الشهر بالكامل افتراضياً (0 خصم)" />
          </td>
          <td>
            <input type="number" class="input mono pr-gosi" value="${empGosi.toFixed(2)}" min="0" step="0.01" style="height:28px; padding:2px; font-size:11px;" onchange="calculateRowNet('${e.id}', ${basic}, ${allowance})" />
          </td>
          <td class="mono text-bad font-bold" id="loan-bal-${e.id}" title="سلف الشهر القائمة من دفتر الأستاذ">${formatCurrency(totalLoanBalance)}</td>
          <td>
            <input type="number" class="input mono pr-repay" id="repay-input-${e.id}" data-max="${totalLoanBalance}" value="${suggestedRepay.toFixed(2)}" min="0" max="${Math.max(totalLoanBalance, (basic+allowance))}" step="0.01" style="height:28px; padding:2px; font-size:11px;" onchange="calculateRowNet('${e.id}', ${basic}, ${allowance})" />
          </td>
          <td class="mono font-bold text-ok" id="net-${e.id}" style="font-size:12px;">${formatCurrency(net)}</td>
          <td style="text-align:center;">
            <button type="button" class="btn btn-secondary sm" style="padding:2px 8px; font-size:10.5px;" onclick="window.printRowPayslip('${e.id}')" title="معاينة وطباعة قسيمة استلام الراتب للموظف">🖨️ قسيمة</button>
          </td>
        </tr>
      `;
    }).join("");

    document.getElementById("pr-total").textContent = `${formatCurrency(grandTotal)} ر.س`;
    document.getElementById("pr-error").classList.add("hidden");
    
    calculateGrandTotal();
    openModal("payroll-modal");
  } catch(err) {
    console.error("Error opening payroll modal:", err);
    showToast(`حدث خطأ أثناء فتح مسير الرواتب: ${err.message}`, "error");
  }
};

window.printRowPayslip = (empId) => {
  const row = document.querySelector(`.pr-row[data-id="${empId}"]`);
  if (!row) return;
  const emp = employees.find(e => e.id === empId);
  const basic = emp?.salary || 0;
  const allowance = emp?.allowance || 0;
  const overtime = parseFloat(row.querySelector(".pr-overtime")?.value) || 0;
  const bonus = parseFloat(row.querySelector(".pr-bonus")?.value) || 0;
  const bonusDesc = row.querySelector(".pr-bonus-desc")?.value?.trim() || "";
  const deduct = parseFloat(row.querySelector(".pr-deduct")?.value) || 0;
  const gosi = parseFloat(row.querySelector(".pr-gosi")?.value) || 0;
  const repay = parseFloat(row.querySelector(".pr-repay")?.value) || 0;
  const net = Math.max(0, (basic + allowance + overtime + bonus) - (deduct + gosi + repay));
  const month = document.getElementById("pr-month")?.value || todayString().slice(0, 7);

  window.printEmployeePayslip(empId, basic, allowance, overtime, bonus, deduct, gosi, repay, net, month, bonusDesc);
};

window.calculateRowNet = (empId, basic, allowance) => {
  const row = document.querySelector(`.pr-row[data-id="${empId}"]`);
  if (!row) return;

  const overtime = parseFloat(row.querySelector(".pr-overtime").value) || 0;
  const bonus = parseFloat(row.querySelector(".pr-bonus").value) || 0;
  const deduct = parseFloat(row.querySelector(".pr-deduct").value) || 0;
  const gosi = parseFloat(row.querySelector(".pr-gosi").value) || 0;
  const repayInput = row.querySelector(".pr-repay");
  const maxRepay = parseFloat(repayInput.dataset.max) || 0;
  let repay = parseFloat(repayInput.value) || 0;

  if (repay > maxRepay && maxRepay > 0) {
    repay = maxRepay;
    repayInput.value = maxRepay;
  }

  const gross = basic + allowance + overtime + bonus;
  const net = Math.max(0, gross - (deduct + gosi + repay));

  document.getElementById(`net-${empId}`).textContent = formatCurrency(net);
  calculateGrandTotal();
};

window.submitPayroll = async () => {
  const errEl = document.getElementById("pr-error"); errEl.classList.add("hidden");
  
  const month = document.getElementById("pr-month").value;
  const method = document.getElementById("pr-method").value;
  const sourceId = document.getElementById("pr-source").value;
  const expAccId = document.getElementById("pr-expense-acc").value;
  const allowAccId = document.getElementById("pr-allowance-acc").value;

  if (!sourceId || !expAccId || !allowAccId) { 
    errEl.textContent = "الرجاء تحديد مصدر الدفع وحسابات المصروفات للرواتب والبدلات"; 
    errEl.classList.remove("hidden"); 
    return; 
  }

  const btn = document.getElementById("save-pr-btn"); btn.disabled = true;

  try {
    let grandNet = 0;
    let grandBasic = 0;
    let grandAllowances = 0;
    let grandOvertime = 0;
    let grandBonuses = 0; // standard employee incentives
    let grandCommissions = 0; // rep commission incentives
    let grandTotalLoanDeductions = 0;
    let grandTotalGosiDeductions = 0;
    let grandTotalGosiEmployerShare = 0;

    const items = [];
    const reps = await getAll(COLS.salesReps());

    const rows = document.querySelectorAll(".pr-row");
    for (const row of rows) {
      const empId = row.dataset.id;
      const emp = employees.find(e => e.id === empId);

      const basic = emp.salary || 0;
      const allowance = emp.allowance || 0;
      const overtime = parseFloat(row.querySelector(".pr-overtime").value) || 0;
      const bonus = parseFloat(row.querySelector(".pr-bonus").value) || 0;
      const bonusDesc = row.querySelector(".pr-bonus-desc")?.value?.trim() || "";
      const deduct = parseFloat(row.querySelector(".pr-deduct").value) || 0;
      const gosi = parseFloat(row.querySelector(".pr-gosi").value) || 0;
      const repay = parseFloat(row.querySelector(".pr-repay").value) || 0;

      const net = Math.max(0, (basic + allowance + overtime + bonus) - (deduct + gosi + repay));

      // Saudi GOSI Employer Share Auto Calculations
      const gross = basic + allowance;
      let employerGosi = 0;
      if (emp.nationality === "saudi") {
        employerGosi = gross * 0.1175; // Saudi employer GOSI share: 11.75%
      } else {
        employerGosi = gross * 0.02; // Foreigner employer GOSI share: 2.0%
      }

      grandNet += net;
      grandBasic += basic;
      grandAllowances += allowance;
      grandOvertime += overtime;
      
      const isRep = reps.some(r => r.employeeId === empId || r.name.includes(emp.name) || emp.name.includes(r.name));
      if (isRep) {
        grandCommissions += bonus;
      } else {
        grandBonuses += bonus;
      }

      grandTotalLoanDeductions += repay;
      grandTotalGosiDeductions += gosi;
      grandTotalGosiEmployerShare += employerGosi;

      items.push({
        empId,
        empName: emp.name,
        basic,
        allowance,
        overtime,
        bonus,
        bonusDesc,
        deduct,
        gosi,
        repay,
        employerGosi,
        net
      });

      if (repay > 0) {
        let remainingToRepay = repay;
        const outstandingLoans = employeeLoans.filter(l => 
          (l.remainingBalance || 0) > 0 && 
          (l.empId === empId || (emp && l.empName && emp.name && (l.empName.includes(emp.name) || emp.name.includes(l.empName))))
        );
        
        for (const loan of outstandingLoans) {
          if (remainingToRepay <= 0) break;
          const payAmount = Math.min(remainingToRepay, loan.remainingBalance);
          
          await updateDoc(doc(db, `companies/${COMPANY_ID}/employeeLoans`, loan.id), {
            paidAmount: increment(payAmount),
            remainingBalance: increment(-payAmount),
            updatedAt: serverTimestamp()
          });

          remainingToRepay -= payAmount;
        }
      }
    }

    if (grandNet <= 0 && grandTotalLoanDeductions <= 0) throw new Error("لا توجد مبالغ في هذا المسير");

    // Retrieve accounts for the compound ledger entry
    const basicExpenseAcc = allAccounts.find(a => a.id === expAccId) || { id: "EXP_SAL", code: "5-2-1", name: "رواتب وأجور" };
    const allowancesExpenseAcc = allAccounts.find(a => a.id === allowAccId) || { id: "EXP_ALLOW", code: "5-2-5", name: "بدلات الموظفين" };
    const commExpenseAcc = allAccounts.find(a => a.code === "5-2-7") || { id: "REP_COMMISSIONS", code: "5-2-7", name: "مصروف عمولات المناديب" };
    const bonusExpenseAcc = allAccounts.find(a => a.code === "5-2-5-1" || a.code === "5-2-7") || { id: "PR_BONUSES", code: "5-2-7", name: "مصروف حوافز ومكافآت الموظفين" };
    const loanAssetAcc = allAccounts.find(a => a.code === "1-1-5-4") || { id: "EMP_ADVANCES", code: "1-1-5-4", name: "سلف للموظفين والمناديب" };
    const gosiAccruedAcc = allAccounts.find(a => a.code === "2-1-3" || a.code === "2-1-4") || { id: "GOSI_LIABILITY", code: "2-1-3", name: "التأمينات الاجتماعية المستحقة" };
    const gosiExpenseAcc = allAccounts.find(a => a.code === "5-7" || a.code === "5-2-6") || { id: "GOSI_EXPENSE", code: "5-7", name: "التأمينات الاجتماعية — حصة صاحب العمل" };

    // ── 1. Accrual Journal Entry (قيد استحقاق الرواتب والالتزامات) ──
    const accrualLines = [];

    // Debit: Basic Salaries & Wages Expense
    if (grandBasic + grandOvertime > 0) {
      accrualLines.push({ 
        accountId: expAccId, 
        accountCode: basicExpenseAcc?.code || "5-2-1", 
        accountName: basicExpenseAcc?.name || "رواتب وأجور", 
        debit: grandBasic + grandOvertime, 
        credit: 0, 
        note: `مصروف الرواتب الأساسية والإضافي لشهر ${month}` 
      });
    }

    // Debit: Allowances Expense
    if (grandAllowances > 0) {
      accrualLines.push({ 
        accountId: allowAccId, 
        accountCode: allowancesExpenseAcc?.code || "5-2-5", 
        accountName: allowancesExpenseAcc?.name || "بدلات", 
        debit: grandAllowances, 
        credit: 0, 
        note: `مصروف بدلات الموظفين لشهر ${month}` 
      });
    }

    if (grandCommissions > 0) {
      accrualLines.push({
        accountId: commExpenseAcc.id,
        accountCode: commExpenseAcc.code,
        accountName: commExpenseAcc.name,
        debit: grandCommissions,
        credit: 0,
        note: `مصروف عمولات مبيعات المناديب لشهر ${month}`
      });
    }
    if (grandBonuses > 0) {
      accrualLines.push({
        accountId: bonusExpenseAcc.id,
        accountCode: bonusExpenseAcc.code,
        accountName: bonusExpenseAcc.name,
        debit: grandBonuses,
        credit: 0,
        note: `مصروف الحوافز والمكافآت للموظفين لشهر ${month}`
      });
    }

    // Debit: GOSI Employer Share Expense
    if (grandTotalGosiEmployerShare > 0) {
      accrualLines.push({
        accountId: gosiExpenseAcc.id,
        accountCode: gosiExpenseAcc.code,
        accountName: gosiExpenseAcc.name,
        debit: grandTotalGosiEmployerShare,
        credit: 0,
        note: `مصروف مساهمة الشركة في التأمينات الاجتماعية شهر ${month}`
      });
    }

    // Credit: Individual Accrued Salary accounts for each employee
    for (const it of items) {
      const emp = employees.find(e => e.id === it.empId);
      const { liabAcc } = resolveEmployeeAccounts(emp, allAccounts);
      let empAccId = liabAcc?.id || emp?.accountId;
      let empAccCode = liabAcc?.code || emp?.accountCode || "";
      let empAccName = liabAcc?.name || (emp ? `مستحقات الموظف ${emp.name}` : "");
      if (!empAccId) {
        const generalLiab = allAccounts.find(a => a.code === "2-1-5") || { id: "ACCRUED_SALARIES", code: "2-1-5", name: "مستحقات الموظفين والمناديب" };
        empAccId = generalLiab.id;
        empAccCode = generalLiab.code;
        empAccName = generalLiab.name;
      }

      // 1. Credit: Basic Salary + Allowances + Overtime
      const salEarn = (it.basic || 0) + (it.allowance || 0) + (it.overtime || 0);
      if (salEarn > 0) {
        accrualLines.push({
          accountId: empAccId,
          accountCode: empAccCode,
          accountName: empAccName,
          debit: 0,
          credit: salEarn,
          note: `استحقاق راتب وبدلات شهر ${month} للموظف ${it.empName}`
        });
      }

      // 2. Credit: Bonuses / Incentives with distinct note (ليظهر ببيانه المستقل في كشف حساب المستحقات)
      if (it.bonus > 0) {
        const bNote = it.bonusDesc ? `${it.bonusDesc} — ${it.empName}` : `إثبات مكافآت وحوافز شهر ${month} للموظف ${it.empName}`;
        accrualLines.push({
          accountId: empAccId,
          accountCode: empAccCode,
          accountName: empAccName,
          debit: 0,
          credit: it.bonus,
          note: bNote
        });
      }
    }

    // Credit: Accrued GOSI (Employer Share)
    if (grandTotalGosiEmployerShare > 0) {
      accrualLines.push({
        accountId: gosiAccruedAcc.id,
        accountCode: gosiAccruedAcc.code,
        accountName: gosiAccruedAcc.name,
        debit: 0,
        credit: grandTotalGosiEmployerShare,
        note: `التأمينات الاجتماعية المستحقة (حصة الشركة) لشهر ${month}`
      });
    }

    const jeAccNo = `JE-PR-ACC-${month.replace("-", "")}`;
    await createJournalEntry({
      date: todayString(),
      description: `قيد استحقاق رواتب ومكافآت الموظفين والمناديب لشهر ${month}`,
      sourceType: "payroll_accrual",
      sourceId: month,
      lines: accrualLines,
      entryNumber: jeAccNo
    });

    // ── 2. Payment & Settlement Journal Entry (قيد صرف الرواتب وتسوية وإقفال السلف في المستحقات) ──
    const paymentLines = [];

    // A. Debit: Employee dues for loan repayments & Credit: Loan Accounts (إقفال سلفة الموظف في المستحقات)
    for (const it of items) {
      if (it.repay > 0) {
        const emp = employees.find(e => e.id === it.empId);
        const { liabAcc, loanAcc } = resolveEmployeeAccounts(emp, allAccounts);
        let empAccId = liabAcc?.id || emp?.accountId;
        let empAccCode = liabAcc?.code || emp?.accountCode || "";
        let empAccName = liabAcc?.name || (emp ? `مستحقات الموظف ${emp.name}` : "");
        if (!empAccId) {
          const generalLiab = allAccounts.find(a => a.code === "2-1-5") || { id: "ACCRUED_SALARIES", code: "2-1-5", name: "مستحقات الموظفين والمناديب" };
          empAccId = generalLiab.id;
          empAccCode = generalLiab.code;
          empAccName = generalLiab.name;
        }

        // Debit: Employee dues account
        paymentLines.push({
          accountId: empAccId,
          accountCode: empAccCode,
          accountName: empAccName,
          debit: it.repay,
          credit: 0,
          note: `إقفال سلفة الموظف ${it.empName} فى المستحقات عن شهر ${month}`
        });

        // Credit: Employee loan account (clearing advance balance)
        const lId = loanAcc?.id || loanAssetAcc.id;
        const lCode = loanAcc?.code || loanAssetAcc.code;
        const lName = loanAcc?.name || loanAssetAcc.name;
        paymentLines.push({
          accountId: lId,
          accountCode: lCode,
          accountName: lName,
          debit: 0,
          credit: it.repay,
          note: `إقفال سلفة الموظف ${it.empName} فى المستحقات عن شهر ${month}`
        });
      }
    }

    // B. Debit: Employee dues for Net Salary Disbursed
    for (const it of items) {
      if (it.net > 0) {
        const emp = employees.find(e => e.id === it.empId);
        const { liabAcc } = resolveEmployeeAccounts(emp, allAccounts);
        let empAccId = liabAcc?.id || emp?.accountId;
        let empAccCode = liabAcc?.code || emp?.accountCode || "";
        let empAccName = liabAcc?.name || (emp ? `مستحقات الموظف ${emp.name}` : "");
        if (!empAccId) {
          const generalLiab = allAccounts.find(a => a.code === "2-1-5") || { id: "ACCRUED_SALARIES", code: "2-1-5", name: "مستحقات الموظفين والمناديب" };
          empAccId = generalLiab.id;
          empAccCode = generalLiab.code;
          empAccName = generalLiab.name;
        }
        paymentLines.push({
          accountId: empAccId,
          accountCode: empAccCode,
          accountName: empAccName,
          debit: it.net,
          credit: 0,
          note: `صرف صافي راتب ومستحقات شهر ${month} للموظف ${it.empName}`
        });
      }
    }

    // C. Debit: Employee dues for GOSI & Other Deductions
    for (const it of items) {
      const emp = employees.find(e => e.id === it.empId);
      const { liabAcc } = resolveEmployeeAccounts(emp, allAccounts);
      let empAccId = liabAcc?.id || emp?.accountId;
      let empAccCode = liabAcc?.code || emp?.accountCode || "";
      let empAccName = liabAcc?.name || (emp ? `مستحقات الموظف ${emp.name}` : "");
      if (!empAccId) {
        const generalLiab = allAccounts.find(a => a.code === "2-1-5") || { id: "ACCRUED_SALARIES", code: "2-1-5", name: "مستحقات الموظفين والمناديب" };
        empAccId = generalLiab.id;
        empAccCode = generalLiab.code;
        empAccName = generalLiab.name;
      }

      if (it.gosi > 0) {
        paymentLines.push({
          accountId: empAccId,
          accountCode: empAccCode,
          accountName: empAccName,
          debit: it.gosi,
          credit: 0,
          note: `خصم حصة التأمينات الاجتماعية من راتب ${it.empName} شهر ${month}`
        });
      }

      if (it.deduct > 0) {
        paymentLines.push({
          accountId: empAccId,
          accountCode: empAccCode,
          accountName: empAccName,
          debit: it.deduct,
          credit: 0,
          note: `خصومات وغياب شهر ${month} للموظف ${it.empName}`
        });
      }
    }

    // D. Credit: Paid Cash or Bank
    let creditAccId = "";
    let creditAccCode = "";
    let creditAccName = "";
    let sourceDocRef = null;

    if (method === 'cash') {
      const cb = cashBoxes.find(c => c.id === sourceId);
      creditAccId = cb?.accountId;
      creditAccCode = cb?.code || "";
      creditAccName = cb?.name || "";
      sourceDocRef = doc(db, `companies/${COMPANY_ID}/cashBoxes`, sourceId);
    } else {
      const ba = bankAccounts.find(b => b.id === sourceId);
      creditAccId = ba?.accountId;
      creditAccCode = ba?.code || "";
      creditAccName = ba?.bankName || "";
      sourceDocRef = doc(db, `companies/${COMPANY_ID}/bankAccounts`, sourceId);
    }
    const creditAccountObj = allAccounts.find(a => a.id === creditAccId);

    if (grandNet > 0) {
      paymentLines.push({
        accountId: creditAccId,
        accountCode: creditAccountObj?.code || "",
        accountName: creditAccountObj?.name || "",
        debit: 0,
        credit: grandNet,
        note: `دفع وصرف مسير رواتب شهر ${month} من حساب ${creditAccName}`
      });
    }

    // E. Credit: Accrued GOSI (Employee deductions)
    if (grandTotalGosiDeductions > 0) {
      paymentLines.push({
        accountId: gosiAccruedAcc.id,
        accountCode: gosiAccruedAcc.code,
        accountName: gosiAccruedAcc.name,
        debit: 0,
        credit: grandTotalGosiDeductions,
        note: `التأمينات الاجتماعية المستقطعة من رواتب الموظفين لشهر ${month}`
      });
    }

    // F. Credit: Deductions contra if any
    const grandDeductions = items.reduce((sum, it) => sum + (it.deduct || 0), 0);
    if (grandDeductions > 0) {
      const deductContraAcc = allAccounts.find(a => a.code === "4-3" || a.code === "4-2" || a.type === "revenue") || basicExpenseAcc;
      paymentLines.push({
        accountId: deductContraAcc.id,
        accountCode: deductContraAcc.code,
        accountName: deductContraAcc.name,
        debit: 0,
        credit: grandDeductions,
        note: `استقطاعات غياب وجزاءات من رواتب شهر ${month}`
      });
    }

    if (paymentLines.length > 0) {
      const jePayNo = `JE-PR-PAY-${month.replace("-", "")}`;
      await createJournalEntry({
        date: todayString(),
        description: `قيد صرف وتسوية مسير رواتب وإقفال السلف لشهر ${month}`,
        sourceType: "payroll_payment",
        sourceId: month,
        lines: paymentLines,
        entryNumber: jePayNo
      });

      if (sourceDocRef) {
        const sSnap = await getDoc(sourceDocRef);
        if (sSnap.exists()) {
          const curBal = parseFloat(sSnap.data().balance || 0);
          await updateDoc(sourceDocRef, {
            balance: curBal - grandNet,
            updatedAt: serverTimestamp()
          });
        }
      }
    }

    // Save payroll history record
    const prRef = doc(collection(db, `companies/${COMPANY_ID}/payrolls`));
    await setDoc(prRef, {
      month,
      date: todayString(),
      amount: grandNet,
      employeeCount: items.length,
      method,
      sourceId,
      expenseAccId: expAccId,
      expenseAccName: basicExpenseAcc?.name || "",
      items,
      notes: `مسير رواتب شهر ${month} المعتمد من شجرة الحسابات`,
      createdAt: serverTimestamp()
    });

    await create(COLS.expenses(), {
      date: todayString(),
      amount: grandNet,
      accountId: expAccId,
      accountName: "مصروف رواتب وأجور",
      method,
      sourceId,
      sourceName: method === 'cash' ? "صندوق" : "بنك",
      notes: `صرف مسير رواتب شهر ${month}`
    });

    showToast("✅ تم اعتماد مسير الرواتب وترحيل القيود والرواتب بنجاح", "success");
    closeModal("payroll-modal");
    await switchHrTab("payroll");
  } catch (err) {
    errEl.textContent = err.message; errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
  }
};

// ── Print individual employee payslip ──
window.printEmployeePayslip = async (empId, basic, allowance, overtime, bonus, deduct, gosi, repay, net, month, bonusDesc = "") => {
  const emp = (employees || []).find(e => e.id === empId) || { name: "الموظف المستحق" };
  const totalGross = (basic || 0) + (allowance || 0) + (overtime || 0) + (bonus || 0);
  const totalDeduct = (deduct || 0) + (gosi || 0) + (repay || 0);
  const finalNet = net !== undefined ? net : Math.max(0, totalGross - totalDeduct);
  const amountWords = (typeof tafqeetArabic === "function") ? tafqeetArabic(finalNet) : `${finalNet} ريال سعودي`;

  let company = {
    name: "شركة نظم الإمداد المتطورة",
    nameEn: "Modern Supply Systems Co.",
    crNumber: "7054969006",
    vatNumber: "314996148100003",
    phone: "0549141648",
    logoUrl: ""
  };
  try {
    const cached = localStorage.getItem("idham_company");
    if (cached) Object.assign(company, JSON.parse(cached));
  } catch(e) {}

  const voucherNumber = `SAL-${emp.code || emp.id?.slice(-4) || 'EMP'}-${month?.replace(/[^0-9]/g,'') || todayString().replace(/-/g,'')}`;

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>سند صرف واستلام راتب — ${emp.name} — ${month}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', Arial, sans-serif;
      direction: rtl;
      color: #0f172a;
      background: #fff;
      padding: 20px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @media print {
      body { padding: 0; }
      @page { size: A4 portrait; margin: 6mm 8mm; }
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
    .sal-header {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%) !important;
      padding: 16px 22px;
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
    .sal-meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 10px 18px;
    }
    .sal-meta-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 6px 10px;
      text-align: center;
    }
    .sal-meta-label { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
    .sal-meta-val { font-size: 12.5px; font-weight: 800; color: #0f172a; }
    .sal-emp-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-right: 5px solid #2563eb;
      border-radius: 10px;
      margin: 12px 18px;
      padding: 10px 16px;
    }
    .sal-emp-grid {
      display: grid;
      grid-template-columns: 1.5fr 1.2fr 1.2fr 1fr;
      gap: 10px;
    }
    .sal-emp-item-lbl { font-size: 10px; color: #1e40af; font-weight: 700; margin-bottom: 2px; }
    .sal-emp-item-val { font-size: 12.5px; font-weight: 800; color: #0f172a; }
    .sal-breakdown-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 0 18px 12px 18px;
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
      font-size: 12px;
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
      padding: 7px 10px;
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
    .sal-net-ribbon {
      margin: 0 18px 10px 18px;
      background: linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%);
      border-radius: 10px;
      padding: 12px 18px;
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(4,120,87,0.2);
    }
    .sal-net-val {
      font-size: 22px;
      font-weight: 900;
      font-family: monospace;
      letter-spacing: 0.5px;
    }
    .sal-tafqeet-box {
      margin: 0 18px 10px 18px;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 11px;
    }
    .sal-legal-box {
      margin: 0 18px 12px 18px;
      background: #fffbeb;
      border: 1.5px solid #fde68a;
      border-right: 5px solid #f59e0b;
      border-radius: 8px;
      padding: 9px 14px;
      font-size: 10.5px;
      line-height: 1.5;
      color: #92400e;
    }
    .sal-sigs {
      display: grid;
      grid-template-columns: 1.2fr 1fr 1fr;
      gap: 10px;
      margin: 0 18px 14px 18px;
    }
    .sal-sig-box {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      text-align: center;
    }
    .sal-sig-title { font-size: 10.5px; font-weight: 800; color: #334155; margin-bottom: 26px; }
    .sal-sig-line { border-top: 1px dashed #94a3b8; padding-top: 5px; font-size: 9.5px; color: #64748b; }
    .sal-footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 6px 18px;
      display: flex;
      justify-content: space-between;
      font-size: 9.5px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="sal-container">
    <div class="sal-header">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:14px;">
        <div style="display:flex;align-items:center;gap:12px;">
          ${company.logoUrl ? `<img src="${company.logoUrl}" alt="Logo" style="height:52px;max-width:100px;object-fit:contain;background:#fff;padding:2px;border-radius:6px;" />` : `<div style="font-size:28px;">🏢</div>`}
          <div>
            <div style="font-size:16px;font-weight:900;color:#fff;">${company.name}</div>
            <div style="font-size:10.5px;opacity:0.85;font-weight:600;color:#fff;">${company.nameEn}</div>
            <div style="font-size:9.5px;opacity:0.8;margin-top:2px;color:#fff;">
              <span>الهاتف: <strong>${company.phone}</strong></span> |
              <span>الرقم الضريبي: <strong>${company.vatNumber}</strong></span> |
              <span>سجل تجاري: <strong>${company.crNumber}</strong></span>
            </div>
          </div>
        </div>
        <div class="sal-badge-box">
          <div style="font-size:16px;font-weight:900;color:#fff !important;">سند صرف واستلام راتب</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.9) !important;letter-spacing:0.5px;">SALARY PAYMENT & PAYSLIP VOUCHER</div>
        </div>
      </div>
    </div>
    <div class="sal-header-gold"></div>

    <div class="sal-meta-grid">
      <div class="sal-meta-card"><div class="sal-meta-label">رقم السند</div><div class="sal-meta-val mono" style="color:#047857;">${voucherNumber}</div></div>
      <div class="sal-meta-card"><div class="sal-meta-label">تاريخ الصرف</div><div class="sal-meta-val mono">${todayString()}</div></div>
      <div class="sal-meta-card"><div class="sal-meta-label">شهر الاستحقاق</div><div class="sal-meta-val" style="color:#1d4ed8;">شهر ${month}</div></div>
      <div class="sal-meta-card"><div class="sal-meta-label">طريقة الصرف</div><div class="sal-meta-val" style="font-size:11px;">نقدي / تحويل بنكي</div></div>
    </div>

    <div class="sal-emp-box">
      <div class="sal-emp-grid">
        <div><div class="sal-emp-item-lbl">👤 اسم الموظف المستحق</div><div class="sal-emp-item-val" style="font-size:13.5px;color:#1e3a8a;">${emp.name}</div></div>
        <div><div class="sal-emp-item-lbl">💼 المسمى الوظيفي</div><div class="sal-emp-item-val">${emp.job || "موظف / مندوب"}</div></div>
        <div><div class="sal-emp-item-lbl">🆔 رقم الهوية / الإقامة</div><div class="sal-emp-item-val mono">${emp.nid || "—"}</div></div>
        <div><div class="sal-emp-item-lbl">💳 الآيبان / الحساب</div><div class="sal-emp-item-val mono" style="font-size:10.5px;">${emp.iban || "—"}</div></div>
      </div>
    </div>

    <div class="sal-breakdown-section">
      <div class="sal-panel earnings">
        <div class="sal-panel-head"><span>➕ مفردات الاستحقاقات والمكافآت</span><span style="font-size:10px;">(Earnings)</span></div>
        <table class="sal-items-table">
          <tbody>
            <tr><td><strong>الراتب الأساسي</strong></td><td class="mono font-bold" style="text-align:left;color:#047857;">+${formatCurrency(basic)} ر.س</td></tr>
            <tr><td><strong>البدلات الشهرية</strong></td><td class="mono font-bold" style="text-align:left;color:#047857;">+${formatCurrency(allowance)} ر.س</td></tr>
            ${overtime ? `<tr><td><strong>أجر ساعات إضافية</strong></td><td class="mono font-bold" style="text-align:left;color:#047857;">+${formatCurrency(overtime)} ر.س</td></tr>` : ''}
            ${bonus ? `<tr><td><strong>${bonusDesc || "مكافآت وحوافز تشجيعية"}</strong></td><td class="mono font-bold" style="text-align:left;color:#047857;">+${formatCurrency(bonus)} ر.س</td></tr>` : ''}
          </tbody>
        </table>
        <div class="sal-panel-foot"><span>إجمالي الاستحقاقات:</span><span class="mono font-bold">${formatCurrency(totalGross)} ر.س</span></div>
      </div>

      <div class="sal-panel deductions">
        <div class="sal-panel-head"><span>➖ مفردات الاستقطاعات والسلف</span><span style="font-size:10px;">(Deductions)</span></div>
        <table class="sal-items-table">
          <tbody>
            ${deduct ? `<tr><td><strong>خصومات وغياب</strong></td><td class="mono font-bold" style="text-align:left;color:#b91c1c;">-${formatCurrency(deduct)} ر.س</td></tr>` : ''}
            ${gosi ? `<tr><td><strong>تأمينات اجتماعية (GOSI)</strong></td><td class="mono font-bold" style="text-align:left;color:#b91c1c;">-${formatCurrency(gosi)} ر.س</td></tr>` : ''}
            ${repay ? `<tr><td><strong>إقفال وتسوية سلفة الموظف</strong></td><td class="mono font-bold" style="text-align:left;color:#b91c1c;">-${formatCurrency(repay)} ر.س</td></tr>` : ''}
            ${totalDeduct === 0 ? `<tr><td style="color:#94a3b8;text-align:center;padding:12px;">لا توجد أي استقطاعات</td></tr>` : ''}
          </tbody>
        </table>
        <div class="sal-panel-foot"><span>إجمالي الاستقطاعات:</span><span class="mono font-bold">${formatCurrency(totalDeduct)} ر.س</span></div>
      </div>
    </div>

    <div class="sal-net-ribbon">
      <div><div style="font-size:11.5px;opacity:0.9;font-weight:700;">💰 صافي الراتب المنصرف للموظف</div><div style="font-size:9.5px;opacity:0.8;">Net Salary Payable</div></div>
      <div style="text-align:left;"><span class="sal-net-val">${formatCurrency(finalNet)}</span> <span style="font-size:13px;font-weight:700;margin-right:4px;">ريال سعودي</span></div>
    </div>

    <div class="sal-tafqeet-box">
      <strong>✍️ المبلغ كتابةً وتفقيطاً:</strong> <span style="color:#047857;font-weight:800;">فقط ${amountWords} لا غير.</span>
    </div>

    <div class="sal-legal-box">
      <strong>📝 إقرار واستلام الموظف وبراءة ذمة:</strong>
      <p style="margin-top:2px;">
        أقر أنا الموظف الموضحة بياناتي أعلاه بأنني استلمت كامل صافي راتبي ومستحقاتي ومكافآتي عن شهر (<strong>${month}</strong>) الموضحة في هذا السند، ولا يحق لي المطالبة بأي مبالغ أخرى أو متأخرات عن هذه الفترة لدى الشركة، ويعد توقيعي أدناه إقراراً نهائياً بالاستلام وبراءة ذمة شاملة.
      </p>
    </div>

    <div class="sal-sigs">
      <div class="sal-sig-box" style="border:1.5px solid #2563eb;background:#f8fafc;">
        <div class="sal-sig-title" style="color:#1e3a8a;">✍️ توقيع واستلام الموظف</div>
        <div style="text-align:right;font-size:10px;color:#334155;margin-bottom:4px;">الاسم: <strong>${emp.name}</strong></div>
        <div class="sal-sig-line">التوقيع / البصمة: ............................................</div>
      </div>
      <div class="sal-sig-box">
        <div class="sal-sig-title">💼 أمين الصندوق / المحاسب الصارف</div>
        <div style="text-align:right;font-size:10px;color:#334155;margin-bottom:4px;">الاسم: <strong>المحاسب المسؤول</strong></div>
        <div class="sal-sig-line">التوقيع: ............................................</div>
      </div>
      <div class="sal-sig-box">
        <div class="sal-sig-title">🏢 اعتماد الإدارة العامة والختم</div>
        <div style="text-align:right;font-size:10px;color:#334155;margin-bottom:4px;">الاعتماد: <strong>${company.name}</strong></div>
        <div class="sal-sig-line">الختم والتوقيع: ............................................</div>
      </div>
    </div>

    <div class="sal-footer">
      <span>طُبع عبر: <strong>نظام إدهام للمواد الغذائية ERP — قسم الموارد البشرية والرواتب</strong></span>
      <span>تاريخ وساعة الطباعة: <strong>${new Date().toLocaleString("ar-SA")}</strong></span>
    </div>
  </div>
</body>
</html>
  `;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 400);
  } else {
    // Fallback to modal if popups are blocked
    const body = document.getElementById("payslip-modal-body");
    if (body) {
      body.innerHTML = html;
      openModal("payslip-modal");
    }
  }
};

// ── View Historical Payroll Details ──
window.viewPayrollDetails = (payrollId) => {
  const p = payrollHistory.find(x => x.id === payrollId);
  if (!p) return;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "payroll-details-overlay";
  overlay.style.zIndex = "1002";
  overlay.innerHTML = `
    <div class="modal modal-lg" style="max-width:90vw;"><div class="modal-header"><h3 class="modal-title">تفاصيل مسير رواتب شهر ${p.month}</h3><button class="modal-close" onclick="document.getElementById('payroll-details-overlay').remove()">×</button></div>
    <div class="modal-body" style="padding:16px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:16px; font-size:12px; background:var(--bg-2); padding:10px; border-radius:8px;">
        <div><strong>تاريخ الصرف:</strong> ${p.date}</div>
        <div><strong>طريقة الدفع:</strong> ${p.method === 'cash' ? '💵 نقدي' : '🏦 تحويل بنكي'}</div>
        <div><strong>إجمالي صافي المسير:</strong> <span class="text-bad font-bold">${formatCurrency(p.amount)}</span></div>
      </div>
      <div class="table-container" style="max-height:350px; overflow-y:auto; border:1px solid var(--border-soft);">
        <table class="data-dense" style="font-size:11px; margin:0;">
          <thead>
            <tr>
              <th>الموظف</th>
              <th>الأساسي</th>
              <th>البدلات</th>
              <th>الإضافي (+)</th>
              <th>مكافآت (+)</th>
              <th>خصم (-)</th>
              <th>تأمينات (-)</th>
              <th>سلف (-)</th>
              <th>الصافي</th>
              <th>إجراء</th>
            </tr>
          </thead>
          <tbody>
            ${p.items.map(item => `
              <tr>
                <td><strong>${item.empName}</strong></td>
                <td class="mono">${formatCurrency(item.basic)}</td>
                <td class="mono">${formatCurrency(item.allowance)}</td>
                <td class="mono text-ok">+${formatCurrency(item.overtime || 0)}</td>
                <td class="mono text-ok">+${formatCurrency(item.bonus || 0)}${item.bonusDesc ? `<br><small style="color:var(--text-3); font-size:9.5px;">${item.bonusDesc}</small>` : ''}</td>
                <td class="mono text-bad">-${formatCurrency(item.deduct || 0)}</td>
                <td class="mono text-bad">-${formatCurrency(item.gosi || 0)}</td>
                <td class="mono text-bad font-bold">-${formatCurrency(item.repay || 0)}</td>
                <td class="font-bold text-ok mono">${formatCurrency(item.net)}</td>
                <td>
                  <button class="btn btn-secondary sm" style="padding:2px 8px; font-size:10px; margin:0;" onclick="printEmployeePayslip('${item.empId}', ${item.basic}, ${item.allowance}, ${item.overtime || 0}, ${item.bonus || 0}, ${item.deduct || 0}, ${item.gosi || 0}, ${item.repay || 0}, ${item.net}, '${p.month}', '${(item.bonusDesc || "").replace(/'/g, "\\'")}')">🖨️ قسيمة</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer" style="padding:12px 16px;">
      <button class="btn btn-secondary" onclick="document.getElementById('payroll-details-overlay').remove()">إغلاق</button>
    </div></div>
  `;
  overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
};

// ── Print Entire Payroll Sheet ──
window.printPayrollSheet = (payrollId) => {
  const pr = payrollHistory.find(x => x.id === payrollId);
  if (!pr) return;

  const w = window.open("", "_blank");
  w.document.write(`
    <html>
    <head>
      <title>مسير رواتب شهر ${pr.month}</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Cairo', sans-serif; direction: rtl; padding: 30px; color: #333; }
        h2 { text-align: center; margin-bottom: 4px; }
        h4 { text-align: center; margin-top: 0; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
        th { background-color: #f5f5f5; }
        .mono { font-family: monospace; }
        .text-right { text-align: left; }
        .footer-sigs { display: flex; justify-content: space-between; margin-top: 60px; font-weight: bold; }
      </style>
    </head>
    <body onload="window.print()">
      <h2>إدهام للمواد الغذائية</h2>
      <h4>مسير رواتب وأجور الموظفين والمناديب المعتمد</h4>
      <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:13px;">
        <div><strong>شهر الاستحقاق:</strong> ${pr.month}</div>
        <div><strong>تاريخ الصرف:</strong> ${pr.date}</div>
        <div><strong>طريقة الدفع:</strong> ${pr.method === "cash" ? "نقدي" : "تحويل بنكي"}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>الموظف</th>
            <th>الأساسي</th>
            <th>البدلات</th>
            <th>إضافي (+)</th>
            <th>مكافآت (+)</th>
            <th>خصم (-)</th>
            <th>تأمينات (-)</th>
            <th>سداد سلفة (-)</th>
            <th>صافي الصرف</th>
          </tr>
        </thead>
        <tbody>
          ${pr.items.map(item => `
            <tr>
              <td><strong>${item.empName}</strong></td>
              <td class="mono">${formatCurrency(item.basic)}</td>
              <td class="mono">${formatCurrency(item.allowance)}</td>
              <td class="mono">${formatCurrency(item.overtime || 0)}</td>
              <td class="mono">${formatCurrency(item.bonus || 0)}</td>
              <td class="mono">${formatCurrency(item.deduct || 0)}</td>
              <td class="mono">${formatCurrency(item.gosi || 0)}</td>
              <td class="mono">${formatCurrency(item.repay || 0)}</td>
              <td class="mono"><strong>${formatCurrency(item.net)} ر.س</strong></td>
            </tr>
          `).join("")}
          <tr style="background:#f5f5f5; font-weight:bold;">
            <td colspan="8">إجمالي رواتب المسير المعتمدة:</td>
            <td class="mono">${formatCurrency(pr.amount)} ر.س</td>
          </tr>
        </tbody>
      </table>

      <div class="footer-sigs">
        <div>إعداد القسم المالي: __________________</div>
        <div>اعتماد المدير العام: __________________</div>
      </div>
    </body>
    </html>
  `);
  w.document.close();
};

window.togglePrSource = () => {
  const method = document.getElementById("pr-method").value;
  const label = document.getElementById("pr-source-label");
  const sel = document.getElementById("pr-source");
  sel.innerHTML = '<option value="">اختر...</option>';
  if (method === 'cash') {
    label.textContent = "الصندوق *";
    sel.innerHTML += cashBoxes.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  } else {
    label.textContent = "الحساب البنكي *";
    sel.innerHTML += bankAccounts.map(b => `<option value="${b.id}">${b.bankName} - ${b.accountNumber}</option>`).join("");
  }
};

// ── Open Detailed Employee Payslip & Statement Modal ──
window.openDetailedEmployeePayslipModal = async (empId) => {
  const emp = employees.find(e => e.id === empId);
  if (!emp) return;

  const basic = emp.salary || 0;
  const allowance = emp.allowance || 0;
  const hourlyRate = basic / 240;
  const dailyRate  = basic / 30;

  const outstandingLoans = employeeLoans.filter(l => 
    (l.remainingBalance || 0) > 0 && 
    (l.empId === emp.id || (l.empName && emp.name && (l.empName.includes(emp.name) || emp.name.includes(l.empName))))
  );
  const totalLoanBalance = outstandingLoans.reduce((sum, l) => sum + (l.remainingBalance || 0), 0);

  // Saudi GOSI
  const empGosi = emp.nationality === "saudi" ? (basic + allowance) * 0.0975 : 0;

  const month = todayString().slice(0, 7);

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.id = "emp-payslip-statement-overlay";
  overlay.style.zIndex = "1005";
  overlay.innerHTML = `
    <div class="modal modal-lg" style="max-width:750px; background:#f8fafc; border-radius:18px;">
      <div class="modal-header" style="background:linear-gradient(135deg, #1e293b, #0f172a); color:#fff; padding:16px 24px; border-top-left-radius:18px; border-top-right-radius:18px;">
        <div>
          <h3 class="modal-title" style="color:#fff; font-size:16px; margin:0;">📄 كشف مسير مفصل وقسيمة راتب الموظف</h3>
          <small style="color:#94a3b8; font-weight:600;">${emp.name} — ${emp.job || 'موظف'} (شهر ${month})</small>
        </div>
        <button class="modal-close" style="color:#fff;" onclick="document.getElementById('emp-payslip-statement-overlay').remove()">×</button>
      </div>

      <div class="modal-body" style="padding:20px;">
        <!-- Employee Contract Specs KPI -->
        <div class="grid-4 gap-12 mb-16">
          <div style="background:#fff; border:1px solid #e2e8f0; padding:12px; border-radius:12px; text-align:center;">
            <div style="font-size:10px; font-weight:700; color:#64748b;">الراتب الأساسي</div>
            <div class="mono font-bold" style="font-size:15px; color:#0f172a;">${formatCurrency(basic)}</div>
          </div>
          <div style="background:#fff; border:1px solid #e2e8f0; padding:12px; border-radius:12px; text-align:center;">
            <div style="font-size:10px; font-weight:700; color:#64748b;">إجمالي البدلات</div>
            <div class="mono font-bold" style="font-size:15px; color:#0f172a;">${formatCurrency(allowance)}</div>
          </div>
          <div style="background:#fff; border:1px solid #e2e8f0; padding:12px; border-radius:12px; text-align:center;">
            <div style="font-size:10px; font-weight:700; color:#64748b;">أجر اليوم الفعلي</div>
            <div class="mono font-bold" style="font-size:15px; color:#2563eb;">${formatCurrency(dailyRate)}</div>
          </div>
          <div style="background:#fff; border:1px solid #e2e8f0; padding:12px; border-radius:12px; text-align:center;">
            <div style="font-size:10px; font-weight:700; color:#64748b;">أجر الساعة الأساسي</div>
            <div class="mono font-bold" style="font-size:15px; color:#2563eb;">${formatCurrency(hourlyRate)}</div>
          </div>
        </div>

        <!-- Detailed Itemized Table -->
        <div class="table-container mb-16" style="border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; background:#fff;">
          <table class="data-dense" style="margin:0; font-size:12px;">
            <thead style="background:#f1f5f9;">
              <tr>
                <th>بند الاستحقاق / الاستقطاع</th>
                <th>النوع / المعادلة</th>
                <th>المبلغ التقديري</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>➕ الراتب الأساسي</strong></td>
                <td><small class="text-muted">الراتب المتفق عليه بالعقد</small></td>
                <td class="mono font-bold text-ok">${formatCurrency(basic)}</td>
              </tr>
              <tr>
                <td><strong>➕ البدلات الشهرية</strong></td>
                <td><small class="text-muted">سكن + مواصلات + طعام</small></td>
                <td class="mono font-bold text-ok">${formatCurrency(allowance)}</td>
              </tr>
              <tr>
                <td><strong>➕ أجر الساعات الإضافية (Overtime)</strong></td>
                <td><small class="text-muted">المادة 107 (150% × أجر الساعة)</small></td>
                <td class="mono font-bold text-ok">+0.00 ر.س</td>
              </tr>
              <tr>
                <td><strong>➖ التأمينات الاجتماعية (GOSI)</strong></td>
                <td><small class="text-muted">${emp.nationality==='saudi'?'خصم الموظف السعودي (9.75%)':'غير سعودي (0%)'}</small></td>
                <td class="mono font-bold text-bad">-${formatCurrency(empGosi)}</td>
              </tr>
              <tr>
                <td><strong>➖ السلف القائمة المستحقة</strong></td>
                <td><small class="text-muted">رصيد السلف القائمة المتبقية</small></td>
                <td class="mono font-bold text-bad">-${formatCurrency(totalLoanBalance)}</td>
              </tr>
            </tbody>
            <tfoot style="background:#f8fafc; font-weight:bold;">
              <tr>
                <td colspan="2" style="font-size:13px;">🟢 تقدير صافي الراتب المستحق للصرف:</td>
                <td class="mono text-bad" style="font-size:16px;">${formatCurrency(basic + allowance - empGosi)} ر.س</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div class="modal-footer" style="background:#f1f5f9; padding:14px 24px; display:flex; justify-content:space-between; align-items:center;">
        <button class="btn btn-secondary" onclick="document.getElementById('emp-payslip-statement-overlay').remove()">إغلاق</button>
        <button class="btn btn-primary" onclick="printEmployeePayslip('${emp.id}', ${basic}, ${allowance}, 0, 0, 0, ${empGosi}, ${totalLoanBalance>0?Math.min(totalLoanBalance, (basic+allowance)*0.25):0}, ${basic+allowance-empGosi}, '${month}')">🖨️ طباعة قسيمة الراتب الرسمية</button>
      </div>
    </div>
  `;

  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  document.body.appendChild(overlay);
};
