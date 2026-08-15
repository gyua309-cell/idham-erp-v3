// ============================================================
// IDHAM ERP — HR & Payroll Module (شؤون الموظفين والرواتب المطور)
// ============================================================
import { COLS, create, update, remove, getAll, query, orderBy, createJournalEntry } from "../utils/db.js";
import { formatCurrency, todayString } from "../utils/formatters.js";
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
      <div class="modal modal-xl" style="max-width:95vw;"><div class="modal-header"><h3 class="modal-title">إعداد مسير رواتب الموظفين والمناديب</h3><button class="modal-close" onclick="closeModal('payroll-modal')">×</button></div>
      <div class="modal-body" style="padding:12px;">
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
          سيقوم النظام بتوليد قيد يومية محاسبي مركب متكامل، وسندات صرف وتحديث أرصدة سلف الموظفين مباشرة بعد الاعتماد.
        </div>
        
        <div class="table-container" style="max-height:40vh; overflow-y:auto; border:1px solid var(--border-soft);">
          <table class="data-dense" style="margin:0; font-size:11px;">
            <thead>
              <tr style="position:sticky; top:0; background:var(--bg-1); z-index:10;">
                <th>الموظف</th>
                <th>الأساسي</th>
                <th>البدلات</th>
                <th style="width:80px;">إضافي (+)</th>
                <th style="width:80px;">مكافآت (+)</th>
                <th style="width:80px;">غياب/خصم (-)</th>
                <th style="width:80px;">تأمينات (-)</th>
                <th>سلف قائمة</th>
                <th style="width:90px;">سداد سلفة (-)</th>
                <th>الصافي</th>
              </tr>
            </thead>
            <tbody id="pr-tbody"></tbody>
          </table>
        </div>
        <div class="flex items-center justify-between" style="margin-top:12px; padding:12px; background:var(--bg-2); border-radius:8px;">
            <span style="font-size:14px; font-weight:bold;">إجمالي رواتب المسير:</span>
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
  employees = await getAll(COLS.employees(), [orderBy("name")]);
}

async function loadLoansData() {
  try {
    if (!employees || !employees.length) {
      employees = await getAll(COLS.employees(), [orderBy("name")]);
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
              <th style="width:100px;">إجراءات</th>
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
                <td>
                  <button class="btn btn-icon sm btn-ghost text-brand" onclick="openDetailedEmployeePayslipModal('${e.id}')" title="كشف حساب ومسير تفصيلي للموظف">📄</button>
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

// ── On Month Change in Payroll modal, auto-inject attendance log if exists ──
window.onPayrollMonthChange = async () => {
  const month = document.getElementById("pr-month").value;
  if (!month) return;

  const docRef = doc(db, `companies/${COMPANY_ID}/employeeAttendance`, month);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const data = snap.data().items || [];
    showToast(`📝 تم اكتشاف سجل حضور لشهر ${month} وتعبئة الحقول تلقائياً.`, "info");
    
    document.querySelectorAll(".pr-row").forEach(row => {
      const empId = row.dataset.id;
      const emp = employees.find(e => e.id === empId);
      const att = data.find(x => x.empId === empId) || { absentDays: 0, overtimeHours: 0, lateMins: 0 };
      
      const absentInput   = row.querySelector(".pr-deduct");
      const overtimeInput = row.querySelector(".pr-overtime");

      // ── Calculations according to Saudi Labor Law ──
      const basic = emp.salary || 0;
      const hourlyRate = basic / 240;
      const overtimePay = hourlyRate * (att.overtimeHours || 0) * 1.5;
      const absenceDeduction = (basic / 30) * (att.absentDays || 0);
      const lateDeduction = (att.lateMins || 0) * (hourlyRate / 60);

      const totalDeductions = absenceDeduction + lateDeduction;

      if (overtimeInput) {
        overtimeInput.value = overtimePay.toFixed(2);
      }
      if (absentInput) {
        absentInput.value = totalDeductions.toFixed(2);
      }

      calculateRowNet(empId, basic, emp.allowance || 0);
    });
  }
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
                  <button class="btn btn-secondary sm" onclick="viewPayrollDetails('${p.id}')">📂 عرض التفاصيل</button>
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

// ── Payroll modal UI & Logic ──
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
      const snap = await getDocs(COLS.employeeLoans());
      employeeLoans = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    const activeEmps = employees.filter(e => e.status === "active");
    if (!activeEmps.length) { showToast("لا يوجد موظفون نشطون لإصدار رواتب لهم", "warning"); return; }
    
    togglePrSource();

    const expAccs = allAccounts.filter(a => a.type === 'expense');
    document.getElementById("pr-expense-acc").innerHTML = '<option value="">اختر...</option>' + 
      expAccs.map(a => `<option value="${a.id}">${a.code} - ${a.name}</option>`).join("");
    
    document.getElementById("pr-allowance-acc").innerHTML = '<option value="">اختر...</option>' + 
      expAccs.map(a => `<option value="${a.id}">${a.code} - ${a.name}</option>`).join("");

    const basicAcc = allAccounts.find(a => a.code === "5-2-2") || allAccounts.find(a => a.code.startsWith("5-2"));
    const allowAcc = allAccounts.find(a => a.code === "5-2-5-1") || allAccounts.find(a => a.code === "5-2-5");
    if (basicAcc) document.getElementById("pr-expense-acc").value = basicAcc.id;
    if (allowAcc) document.getElementById("pr-allowance-acc").value = allowAcc.id;

    // Calculate representatives commission dynamically for selected month
    const selectedMonth = document.getElementById("pr-month")?.value || new Date().toISOString().slice(0, 7);
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
        
        // Calculate representative sales for target check
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
      const outstandingLoans = employeeLoans.filter(l => 
        (l.remainingBalance || 0) > 0 && 
        (l.empId === e.id || (l.empName && e.name && (l.empName.includes(e.name) || e.name.includes(l.empName))))
      );
      const totalLoanBalance = outstandingLoans.reduce((sum, l) => sum + (l.remainingBalance || 0), 0);

      const basic = e.salary || 0;
      const allowance = e.allowance || 0;
      
      // Auto-fill calculated rep commission if exists
      const repComm = commByEmployeeId[e.id] || 0;
      const gross = basic + allowance + repComm;
      grandTotal += gross;

      const suggestedRepay = totalLoanBalance > 0 ? Math.min(totalLoanBalance, (basic + allowance) * 0.25) : 0;

      // ── Native Saudi GOSI auto calculations ──
      let empGosi = 0;
      if (e.nationality === "saudi") {
        empGosi = (basic + allowance) * 0.0975; // Saudi employee GOSI share: 9.75%
      } else {
        empGosi = 0; // Resident/Foreigner employee share: 0%
      }

      return `
        <tr class="pr-row" data-id="${e.id}" data-nationality="${e.nationality || 'saudi'}">
          <td><strong>${e.name}</strong><br><small style="color:var(--text-3);">${e.job || ""}</small></td>
          <td class="mono">${formatCurrency(basic)}</td>
          <td class="mono">${formatCurrency(allowance)}</td>
          <td>
            <input type="number" class="input mono pr-overtime" value="0" min="0" step="0.01" style="height:28px; padding:2px; font-size:11px;" onchange="calculateRowNet('${e.id}', ${basic}, ${allowance})" />
          </td>
          <td>
            <input type="number" class="input mono pr-bonus" value="${repComm.toFixed(2)}" min="0" step="0.01" style="height:28px; padding:2px; font-size:11px;" onchange="calculateRowNet('${e.id}', ${basic}, ${allowance})" />
          </td>
          <td>
            <input type="number" class="input mono pr-deduct" value="0" min="0" step="0.01" style="height:28px; padding:2px; font-size:11px;" onchange="calculateRowNet('${e.id}', ${basic}, ${allowance})" />
          </td>
          <td>
            <input type="number" class="input mono pr-gosi" value="${empGosi.toFixed(2)}" min="0" step="0.01" style="height:28px; padding:2px; font-size:11px;" onchange="calculateRowNet('${e.id}', ${basic}, ${allowance})" />
          </td>
          <td class="mono text-bad font-bold" id="loan-bal-${e.id}">${formatCurrency(totalLoanBalance)}</td>
          <td>
            <input type="number" class="input mono pr-repay" id="repay-input-${e.id}" data-max="${totalLoanBalance}" value="${suggestedRepay.toFixed(2)}" min="0" max="${totalLoanBalance}" step="0.01" style="height:28px; padding:2px; font-size:11px;" ${totalLoanBalance<=0?'disabled':''} onchange="calculateRowNet('${e.id}', ${basic}, ${allowance})" />
          </td>
          <td class="mono font-bold text-ok" id="net-${e.id}">${formatCurrency(gross - empGosi - suggestedRepay)}</td>
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

  if (repay > maxRepay) {
    repay = maxRepay;
    repayInput.value = maxRepay;
  }

  const gross = basic + allowance + overtime + bonus;
  const net = gross - (deduct + gosi + repay);

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
      const deduct = parseFloat(row.querySelector(".pr-deduct").value) || 0;
      const gosi = parseFloat(row.querySelector(".pr-gosi").value) || 0;
      const repay = parseFloat(row.querySelector(".pr-repay").value) || 0;

      const net = (basic + allowance + overtime + bonus) - (deduct + gosi + repay);

      // ── Saudi GOSI Employer Share Auto Calculations ──
      const gross = basic + allowance;
      let employerGosi = 0;
      if (emp.nationality === "saudi") {
        employerGosi = gross * 0.1175; // Saudi employer GOSI share: 11.75%
      } else {
        employerGosi = gross * 0.02; // Foreigner employer GOSI share (Occupational Hazard): 2.0%
      }

      grandNet += net;
      grandBasic += basic;
      grandAllowances += allowance;
      grandOvertime += overtime;
      
      // Separate standard bonuses from rep sales commissions
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

    if (grandNet <= 0) throw new Error("لا توجد مبالغ صافية للصرف في هذا المسير");

    // Retrieve accounts for the compound ledger entry
    const basicExpenseAcc = allAccounts.find(a => a.id === expAccId);
    const allowancesExpenseAcc = allAccounts.find(a => a.id === allowAccId);
    const commExpenseAcc = allAccounts.find(a => a.code === "5-2-7") || { id: "REP_COMMISSIONS", code: "5-2-7", name: "مصروف عمولات المناديب" };
    const bonusExpenseAcc = allAccounts.find(a => a.code === "5-2-5-1") || { id: "PR_BONUSES", code: "5-2-5-1", name: "مصروف حوافز ومكافآت الموظفين" };
    const loanAssetAcc = allAccounts.find(a => a.code === "1-1-5-4-1") || { id: "EMP_ADVANCES", code: "1-1-5-4-1", name: "سلف موظفين" };
    const gosiAccruedAcc = allAccounts.find(a => a.code === "2-1-5-1") || { id: "GOSI_LIABILITY", code: "2-1-5-1", name: "التأمينات الاجتماعية المستحقة" };
    const gosiExpenseAcc = allAccounts.find(a => a.code === "5-2-6") || { id: "GOSI_EXPENSE", code: "5-2-6", name: "التأمينات الاجتماعية — حصة صاحب العمل" };

    // ── 1. Accrual Journal Entry (قيد استحقاق الرواتب والالتزامات) ──
    const accrualLines = [
      // Debit: Basic Salaries & Wages Expense
      { 
        accountId: expAccId, 
        accountCode: basicExpenseAcc?.code || "", 
        accountName: basicExpenseAcc?.name || "", 
        debit: grandBasic + grandOvertime, 
        credit: 0, 
        note: `مصروف الرواتب الأساسية والإضافي لشهر ${month}` 
      },
      // Debit: Allowances Expense
      { 
        accountId: allowAccId, 
        accountCode: allowancesExpenseAcc?.code || "", 
        accountName: allowancesExpenseAcc?.name || "", 
        debit: grandAllowances, 
        credit: 0, 
        note: `مصروف بدلات الموظفين لشهر ${month}` 
      }
    ];

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
      let empAccId = emp?.accountId;
      let empAccCode = emp?.accountCode || "";
      let empAccName = emp ? `رواتب مستحقة - ${emp.name}` : "";
      if (!empAccId) {
        const generalLiab = allAccounts.find(a => a.code === "2-1-5-2") || { id: "ACCRUED_SALARIES", code: "2-1-5-2", name: "رواتب ومستحقات الموظفين المستحقة" };
        empAccId = generalLiab.id;
        empAccCode = generalLiab.code;
        empAccName = generalLiab.name;
      }
      accrualLines.push({
        accountId: empAccId,
        accountCode: empAccCode,
        accountName: empAccName,
        debit: 0,
        credit: it.net,
        note: `استحقاق صافي راتب الموظف ${it.empName} لشهر ${month}`
      });
    }

    // Credit: Employee Advances (Asset reduction)
    if (grandTotalLoanDeductions > 0) {
      accrualLines.push({
        accountId: loanAssetAcc.id,
        accountCode: loanAssetAcc.code,
        accountName: loanAssetAcc.name,
        debit: 0,
        credit: grandTotalLoanDeductions,
        note: `استرداد سلف موظفين مستقطعة من الرواتب شهر ${month}`
      });
    }

    // Credit: Accrued GOSI (Employee deductions + Employer Share)
    const totalGosiCredit = grandTotalGosiDeductions + grandTotalGosiEmployerShare;
    if (totalGosiCredit > 0) {
      accrualLines.push({
        accountId: gosiAccruedAcc.id,
        accountCode: gosiAccruedAcc.code,
        accountName: gosiAccruedAcc.name,
        debit: 0,
        credit: totalGosiCredit,
        note: `التأمينات الاجتماعية المستحقة (خصم الموظفين + حصة الشركة) لشهر ${month}`
      });
    }

    const jeAccNo = `JE-PR-ACC-${month.replace("-", "")}`;
    await createJournalEntry({
      date: todayString(),
      description: `قيد استحقاق رواتب وعمولات الموظفين والمناديب لشهر ${month}`,
      sourceType: "payroll_accrual",
      sourceId: month,
      lines: accrualLines,
      entryNumber: jeAccNo
    });

    // ── 2. Payment Journal Entry (قيد صرف وتسوية الرواتب) ──
    const paymentLines = [];
    
    // Debit: Individual Accrued Salary accounts (settling the liability)
    for (const it of items) {
      const emp = employees.find(e => e.id === it.empId);
      let empAccId = emp?.accountId;
      let empAccCode = emp?.accountCode || "";
      let empAccName = emp ? `رواتب مستحقة - ${emp.name}` : "";
      if (!empAccId) {
        const generalLiab = allAccounts.find(a => a.code === "2-1-5-2") || { id: "ACCRUED_SALARIES", code: "2-1-5-2", name: "رواتب ومستحقات الموظفين المستحقة" };
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
        note: `تسوية وصرف صافي راتب الموظف ${it.empName} لشهر ${month}`
      });
    }

    // Credit: Paid Cash or Bank
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

    paymentLines.push({
      accountId: creditAccId,
      accountCode: creditAccountObj?.code || "",
      accountName: creditAccountObj?.name || "",
      debit: 0,
      credit: grandNet,
      note: `دفع وصرف مسير رواتب شهر ${month} من حساب ${creditAccName}`
    });

    const jePayNo = `JE-PR-PAY-${month.replace("-", "")}`;
    await createJournalEntry({
      date: todayString(),
      description: `قيد صرف وتسوية مسير رواتب شهر ${month}`,
      sourceType: "payroll_payment",
      sourceId: month,
      lines: paymentLines,
      entryNumber: jePayNo
    });

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
      notes: `مسير رواتب شهر ${month} المعتمد - قيود: ${jeAccNo} & ${jePayNo}`,
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
      notes: `صرف مسير رواتب شهر ${month} - قيود: ${jeAccNo} & ${jePayNo}`
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
window.printEmployeePayslip = (empId, basic, allowance, overtime, bonus, deduct, gosi, repay, net, month) => {
  const body = document.getElementById("payslip-modal-body");
  if (!body) return;

  const emp = employees.find(e => e.id === empId) || { name: "موظف" };

  body.innerHTML = `
    <div style="border:1px solid #ddd; padding:16px; border-radius:12px; background:#fff; font-family:'Cairo', sans-serif; direction:rtl;">
      <div style="text-align:center; border-bottom:2px dashed #ddd; padding-bottom:12px; margin-bottom:12px;">
        <h3 style="margin:0 0 4px 0; color:#111;">إدهام للمواد الغذائية</h3>
        <h4 style="margin:0; color:#555;">قسيمة تفصيل الراتب (Payslip)</h4>
        <span style="font-size:12px; color:#888;">شهر الاستحقاق: ${month}</span>
      </div>

      <div style="font-size:12px; display:flex; flex-direction:column; gap:6px; margin-bottom:16px; border-bottom:1px solid #eee; padding-bottom:10px;">
        <div><strong>الموظف:</strong> ${emp.name}</div>
        <div><strong>المسمى الوظيفي:</strong> ${emp.job || "—"}</div>
        <div><strong>رقم الهوية/الإقامة:</strong> ${emp.nid || "—"}</div>
        ${emp.iban ? `<div><strong>رقم الآيبان:</strong> <span class="mono">${emp.iban}</span></div>` : ""}
      </div>

      <div style="display:flex; justify-content:space-between; gap:16px; font-size:12px;">
        <div style="flex:1;">
          <h5 style="margin:0 0 6px 0; color:#22c55e; border-bottom:1px solid #eee; padding-bottom:4px;">➕ المستحقات</h5>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>الراتب الأساسي:</span><span class="mono">${formatCurrency(basic)}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>البدلات:</span><span class="mono">${formatCurrency(allowance)}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>الإضافي:</span><span class="mono">${formatCurrency(overtime)}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>المكافآت:</span><span class="mono">${formatCurrency(bonus)}</span></div>
          <div style="display:flex; justify-content:space-between; font-weight:bold; border-top:1px solid #eee; padding-top:4px;"><span>إجمالي المستحقات:</span><span class="mono">${formatCurrency(basic+allowance+overtime+bonus)}</span></div>
        </div>
        
        <div style="flex:1; border-right:1px solid #eee; padding-right:12px; margin-right:12px;">
          <h5 style="margin:0 0 6px 0; color:#ef4444; border-bottom:1px solid #eee; padding-bottom:4px;">➖ الاستقطاعات</h5>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>الخصومات/الغياب:</span><span class="mono">${formatCurrency(deduct)}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>تأمينات (GOSI):</span><span class="mono">${formatCurrency(gosi)}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>قسط السلفة:</span><span class="mono">${formatCurrency(repay)}</span></div>
          <div style="display:flex; justify-content:space-between; font-weight:bold; border-top:1px solid #eee; padding-top:4px;"><span>إجمالي الاستقطاعات:</span><span class="mono">${formatCurrency(deduct+gosi+repay)}</span></div>
        </div>
      </div>

      <div style="margin-top:20px; background:#f4f6fa; padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-weight:bold; font-size:14px; border:1px solid #e2e8f0;">
        <span>صافي الراتب المستحق:</span>
        <span class="mono text-bad" style="font-size:16px;">${formatCurrency(net)} ر.س</span>
      </div>

      <div style="margin-top:24px; text-align:center; font-size:10px; color:#aaa; border-top:1px solid #eee; padding-top:12px;">
        تمت معالجة القسيمة آلياً عبر نظام إدهام لإدارة الموارد البشرية
      </div>
    </div>
  `;

  openModal("payslip-modal");
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
                <td class="mono text-ok">+${formatCurrency(item.bonus || 0)}</td>
                <td class="mono text-bad">-${formatCurrency(item.deduct || 0)}</td>
                <td class="mono text-bad">-${formatCurrency(item.gosi || 0)}</td>
                <td class="mono text-bad font-bold">-${formatCurrency(item.repay || 0)}</td>
                <td class="font-bold text-ok mono">${formatCurrency(item.net)}</td>
                <td>
                  <button class="btn btn-secondary sm" style="padding:2px 8px; font-size:10px; margin:0;" onclick="printEmployeePayslip('${item.empId}', ${item.basic}, ${item.allowance}, ${item.overtime || 0}, ${item.bonus || 0}, ${item.deduct || 0}, ${item.gosi || 0}, ${item.repay || 0}, ${item.net}, '${p.month}')">🖨️ قسيمة</button>
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
