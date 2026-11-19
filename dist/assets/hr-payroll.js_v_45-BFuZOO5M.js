import{t as k,g as _,C as S,f as b,d as z,a as C,u as Bt,c as Mt,r as Dt,k as ut,b as kt}from"./index-CF9GFeRJ.js";import{getDocs as Lt,orderBy as ht,doc as D,getDoc as st,setDoc as lt,serverTimestamp as Y,collection as gt,deleteDoc as Tt,updateDoc as dt,increment as At}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import{updateEntityInCoa as Ht,syncEntityToCoa as jt,deleteEntityInCoa as Ft,generateCoaSubAccountCode as Rt}from"./coa-connector-9pNG4b1x.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let h=[],f=[],J=[],K=[],P=[],bt=[],$t=[],It=[];async function de(a,t){a.innerHTML=`
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
          <div class="form-group"><label>تاريخ التعيين</label><input type="date" id="emp-date" class="input" value="${k()}" /></div>
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
          <div class="form-group"><label>تاريخ الصرف *</label><input type="date" id="loan-date" class="input" value="${k()}" /></div>
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
          <div class="form-group"><label>تاريخ البدء *</label><input type="date" id="leave-start" class="input" value="${k()}" /></div>
          <div class="form-group"><label>تاريخ الانتهاء *</label><input type="date" id="leave-end" class="input" value="${k()}" /></div>
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
            <input type="date" id="eos-date" class="input" value="${k()}" onchange="calculateEosIndemnity()" />
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
          <div class="form-group"><label>شهر الاستحقاق</label><input type="month" id="pr-month" class="input" value="${k().slice(0,7)}" onchange="onPayrollMonthChange()" /></div>
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
  `,await switchHrTab("employees")}window.switchHrTab=async a=>{document.querySelectorAll(".hr-tab-btn").forEach(p=>p.classList.remove("active"));const t=document.getElementById(`btn-tab-${a}`);t&&t.classList.add("active");const o=document.getElementById("hr-action-btns"),e=document.getElementById("hr-main-content");e&&(e.innerHTML='<div style="text-align:center; padding:60px;"><span class="spin" style="margin:0 auto;"></span></div>',await _t(),await Promise.all([Pt(),Ot(),qt(),Wt(),Gt(),Yt()]),a==="employees"?(o.innerHTML='<button class="btn btn-primary" onclick="openEmpModal()">+ إضافة موظف</button>',Ut(e)):a==="leaves"?(o.innerHTML='<button class="btn btn-primary" onclick="openLeaveModal()">🌴 تسجيل إجازة جديدة</button>',Jt(e)):a==="attendance"?(o.innerHTML="",Ct(e)):a==="loans"?(o.innerHTML='<button class="btn btn-primary" onclick="openLoanModal()">💸 صرف سلفة جديدة</button>',Nt(e)):a==="payroll"?(o.innerHTML='<button class="btn btn-primary" onclick="openPayrollModal()">💳 إعداد مسير رواتب</button>',Vt(e)):(o.innerHTML='<button class="btn btn-primary" onclick="openEosModal()">🎓 تصفية موظف</button>',Xt(e)))};async function _t(){h=await _(S.employees()),h.sort((a,t)=>(a.name||"").localeCompare(t.name||""))}async function Pt(){try{(!h||!h.length)&&(h=await _(S.employees()),h.sort((o,e)=>(o.name||"").localeCompare(e.name||"")));const t=(await Lt(S.employeeLoans())).docs.map(o=>({id:o.id,...o.data()}));t.forEach(o=>{o.empName=o.empName||o.employeeName||"مصطفى الاسيوطى",o.remainingBalance=o.remainingBalance??o.remainingAmount??o.amount-(o.paidAmount||0)}),P=t,P.sort((o,e)=>(e.date||"").localeCompare(o.date||""))}catch(a){console.warn("Failed to fetch loans:",a)}}async function Ot(){bt=await _(S.payrolls(),[ht("month","desc")])}async function qt(){$t=await _(S.employeeLeaves(),[ht("startDate","desc")])}async function Wt(){await _(S.employeeAttendance(),[ht("month","desc")])}async function Gt(){It=await _(S.employeeSettlements(),[ht("date","desc")])}async function Yt(){f=await _(S.chartOfAccounts()),J=await _(S.cashBoxes()),K=await _(S.bankAccounts())}function Ut(a){const t=[],o=new Date,e=30*24*60*60*1e3;let p=0,i=0;h.forEach(d=>{if(d.status==="active"&&(p++,i+=(d.salary||0)+(d.allowance||0)),d.status==="active"){if(d.nidExpiry){const g=new Date(d.nidExpiry)-o;g>0&&g<e?t.push(`⚠️ إقامة/هوية الموظف <strong>${d.name}</strong> تنتهي قريباً بتاريخ ${d.nidExpiry}`):g<=0&&t.push(`🚨 إقامة/هوية الموظف <strong>${d.name}</strong> منتهية الصلاحية منذ ${d.nidExpiry}`)}if(d.passportExpiry){const g=new Date(d.passportExpiry)-o;g>0&&g<e?t.push(`⚠️ جواز سفر الموظف <strong>${d.name}</strong> ينتهي قريباً بتاريخ ${d.passportExpiry}`):g<=0&&t.push(`🚨 جواز سفر الموظف <strong>${d.name}</strong> منتهية الصلاحية منذ ${d.passportExpiry}`)}}});let n="";t.length>0&&(n=`
      <div class="hr-alert-box">
        <div style="font-size:20px;">🚨</div>
        <div style="flex:1; display:flex; flex-direction:column; gap:4px;">
          ${t.map(d=>`<div>${d}</div>`).join("")}
        </div>
      </div>
    `);const r=p>0?i/p:0,l=h.filter(d=>d.nationality==="saudi").length,s=h.length,m=s>0?(l/s*100).toFixed(1):"0.0",c=`
    <!-- Executive HR KPIs Grid -->
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap:12px; margin-bottom:20px;">
      <div class="stats-card">
        <span class="stats-title">👥 إجمالي القوة العاملة</span>
        <span class="stats-val text-brand">${h.length} موظف</span>
      </div>
      <div class="stats-card" style="background:linear-gradient(135deg, rgba(34,197,94,0.06), rgba(248,250,252,0.95)); border:1.5px solid rgba(34,197,94,0.25);">
        <span class="stats-title">🇸🇦 نسبة السعودة (نطاقات)</span>
        <span class="stats-val text-ok">${m}% <small style="font-size:11px; font-weight:700;">(${l} سعودي)</small></span>
      </div>
      <div class="stats-card">
        <span class="stats-title">✅ الموظفون النشطون</span>
        <span class="stats-val text-ok">${p} موظف</span>
      </div>
      <div class="stats-card">
        <span class="stats-title">💼 متوسط الرواتب الإجمالية</span>
        <span class="stats-val text-brand">${b(r)}</span>
      </div>
      <div class="stats-card">
        <span class="stats-title">📈 التزام الرواتب شهرياً</span>
        <span class="stats-val text-bad">${b(i)}</span>
      </div>
    </div>
  `;if(!h.length){a.innerHTML=c+n+`
      <div class="card" style="text-align:center; padding:60px; color:var(--text-3);">
        <div style="font-size:40px; margin-bottom:12px;">👤</div>
        <div style="font-weight:700; font-size:15px; color:var(--text-1); margin-bottom:4px;">لا يوجد موظفين مسجلين حالياً</div>
        <div>انقر على زر "إضافة موظف" لإنشاء ملف الموظف الأول في نظام الموارد البشرية.</div>
      </div>`;return}a.innerHTML=c+n+`
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
            ${h.map(d=>{let g='<span class="badge" style="background:rgba(34,197,94,0.1); color:#22c55e;">نشط</span>';d.status==="suspended"&&(g='<span class="badge" style="background:rgba(245,158,11,0.1); color:#f59e0b;">موقوف</span>'),d.status==="resigned"&&(g='<span class="badge" style="background:rgba(100,116,139,0.1); color:#64748b;">مستقيل</span>');let y="";if(d.nidExpiry){const $=Math.ceil((new Date(d.nidExpiry)-new Date)/864e5);$<=0?y='<br><span class="badge" style="background:rgba(239,68,68,0.12); color:#dc2626; font-size:9.5px; font-weight:800; padding:1px 6px;">🚨 منتهية!</span>':$<=30&&(y=`<br><span class="badge" style="background:rgba(245,158,11,0.12); color:#d97706; font-size:9.5px; font-weight:800; padding:1px 6px;">⚠️ تنتهي خلال ${$} يوم</span>`)}return`
              <tr>
                <td><strong class="clickable-name" onclick="viewEmpDocumentDetails('${d.id}')">${d.name}</strong></td>
                <td>${d.job||"—"}</td>
                <td>
                  <span class="mono">${d.nid||"—"}</span><br>
                  <small style="color:var(--text-3); font-size:10px;">انتهاء: ${d.nidExpiry||"—"}</small>${y}
                </td>
                <td class="mono font-bold">${b(d.salary)}</td>
                <td class="mono">${b(d.allowance||0)}</td>
                <td>${d.nationality==="saudi"?"🇸🇦 سعودي":"🌍 مقيم"}</td>
                <td>
                  <span style="font-size:12px;">${d.bankName||"—"}</span><br>
                  <small class="mono" style="color:var(--text-3); font-size:10px;">${d.iban||"—"}</small>
                </td>
                <td>${g}</td>
                <td style="white-space:nowrap; text-align:center;">
                  <button class="btn btn-primary sm" style="padding:3px 9px; font-size:11px; margin-left:4px;" onclick="openDetailedEmployeePayslipModal('${d.id}')" title="عرض وطباعة قسيمة استلام الراتب وبراءة الذمة">
                    📄 قسيمة راتب
                  </button>
                  <button class="btn btn-icon sm btn-ghost" onclick="editEmp('${d.id}')" title="تعديل البيانات">✏️</button>
                  <button class="btn btn-icon sm btn-ghost text-bad" onclick="delEmp('${d.id}','${d.name}')" title="حذف الموظف">🗑️</button>
                </td>
              </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function Jt(a){if(!$t.length){a.innerHTML=`
      <div class="card" style="text-align:center; padding:60px; color:var(--text-3);">
        <div style="font-size:40px; margin-bottom:12px;">🌴</div>
        <div style="font-weight:700; font-size:15px; color:var(--text-1); margin-bottom:4px;">لا توجد إجازات مسجلة حالياً</div>
        <div>انقر على زر "تسجيل إجازة جديدة" لتسجيل إجازة سنوية أو مرضية لموظف.</div>
      </div>`;return}a.innerHTML=`
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
            ${$t.map(t=>{let o="سنوية";t.type==="sick"&&(o="🤒 مرضية"),t.type==="unpaid"&&(o="💸 بدون راتب"),t.type==="emergency"&&(o="🚨 اضطرارية");const e=new Date(t.startDate),p=new Date(t.endDate),i=Math.round((p-e)/(24*60*60*1e3))+1;return`
              <tr>
                <td><strong>${t.empName}</strong></td>
                <td>${o}</td>
                <td class="mono">${t.startDate}</td>
                <td class="mono">${t.endDate}</td>
                <td class="mono font-bold">${i} أيام</td>
                <td><small style="color:var(--text-2);">${t.notes||"—"}</small></td>
                <td>
                  <button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteLeave('${t.id}')">🗑️</button>
                </td>
              </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}let ft="daily";function Ct(a){k().slice(0,7),k(),a.innerHTML=`
    <!-- Top Mode Selector Tabs -->
    <div class="card mb-16" style="padding:12px 18px; background:linear-gradient(135deg, rgba(91,127,255,0.06), rgba(248,250,252,0.95)); border:1.5px solid rgba(91,127,255,0.2);">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; gap:8px;">
          <button class="btn ${ft==="daily"?"btn-primary":"btn-secondary"} sm" onclick="switchAttendanceMode('daily')">📅 سجل الحضور اليومي والشفتات</button>
          <button class="btn ${ft==="monthly"?"btn-primary":"btn-secondary"} sm" onclick="switchAttendanceMode('monthly')">📊 التجميع والإعداد الشهري للمسير</button>
        </div>
        <div id="att-top-controls">
          <!-- Populated dynamically based on active mode -->
        </div>
      </div>
    </div>

    <!-- Main Content Container -->
    <div id="att-mode-content"></div>
  `,Kt()}window.switchAttendanceMode=a=>{ft=a;const t=document.getElementById("hr-main-content");t&&Ct(t)};function Kt(){const a=document.getElementById("att-mode-content"),t=document.getElementById("att-top-controls");if(a)if(h.filter(o=>o.status==="active"),ft==="daily"){const o=k();t.innerHTML=`
      <div style="display:flex; align-items:center; gap:8px;">
        <label style="font-weight:800; font-size:12px; color:var(--text-1);">تاريخ اليوم:</label>
        <input type="date" id="daily-att-date" class="input mono" style="width:140px; height:32px; font-size:12px;" value="${o}" onchange="loadDailyAttendanceLog()" />
        <button class="btn btn-primary sm" onclick="saveDailyAttendanceLog()" id="save-daily-att-btn" style="margin:0;">💾 حفظ حضور اليوم</button>
      </div>
    `,a.innerHTML=`
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
    `,loadDailyAttendanceLog()}else{const o=k().slice(0,7);t.innerHTML=`
      <div style="display:flex; align-items:center; gap:8px;">
        <label style="font-weight:800; font-size:12px; color:var(--text-1);">تحديد الشهر:</label>
        <input type="month" id="att-selected-month" class="input mono" style="width:150px; height:32px; font-size:12px;" value="${o}" onchange="loadAttendanceForMonth()" />
        <button class="btn btn-primary sm" onclick="saveAttendanceLog()" id="save-att-btn" style="margin:0;">⏱️ حفظ واعتماد السجل الشهري</button>
      </div>
    `,a.innerHTML=`
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
    `,loadAttendanceForMonth()}}window.loadDailyAttendanceLog=async()=>{const a=document.getElementById("daily-att-date"),t=document.getElementById("daily-att-tbody");if(!t||!a)return;const o=a.value||k();t.innerHTML='<tr><td colspan="8" style="text-align:center; padding:20px;"><span class="spin"></span> جاري تحميل سجل الحضور لهذا اليوم…</td></tr>';const e=h.filter(r=>r.status==="active"),p=D(z,`companies/${C}/dailyAttendance`,o),i=await st(p),n=i.exists()?i.data().items||[]:[];t.innerHTML=e.map(r=>{const l=n.find(s=>s.empId===r.id)||{status:"present",checkIn:"08:00",checkOut:"17:00",lateMins:0,overtimeHours:0,notes:""};return`
      <tr class="daily-att-row" data-id="${r.id}">
        <td><strong style="color:var(--text-1);">${r.name}</strong></td>
        <td><small style="color:var(--text-3); font-weight:600;">${r.job||"—"}</small></td>
        <td>
          <select class="input daily-status" style="height:28px; padding:2px; font-size:11px; font-weight:700;" onchange="recalculateDailyRow('${r.id}')">
            <option value="present" ${l.status==="present"?"selected":""}>🟢 حاضر</option>
            <option value="late" ${l.status==="late"?"selected":""}>🟡 متأخر</option>
            <option value="absent" ${l.status==="absent"?"selected":""}>🔴 غائب</option>
            <option value="leave" ${l.status==="leave"?"selected":""}>🌴 إجازة</option>
            <option value="field" ${l.status==="field"?"selected":""}>🚚 مهمة ميدانية</option>
          </select>
        </td>
        <td>
          <input type="time" class="input mono daily-in" value="${l.checkIn||"08:00"}" style="height:28px; padding:2px; font-size:11px;" onchange="recalculateDailyRow('${r.id}')" />
        </td>
        <td>
          <input type="time" class="input mono daily-out" value="${l.checkOut||"17:00"}" style="height:28px; padding:2px; font-size:11px;" onchange="recalculateDailyRow('${r.id}')" />
        </td>
        <td class="mono font-bold text-bad daily-late-txt" id="daily-late-${r.id}">${l.lateMins||0} دقيقة</td>
        <td class="mono font-bold text-ok daily-ot-txt" id="daily-ot-${r.id}">${l.overtimeHours||0} ساعة</td>
        <td>
          <input type="text" class="input daily-notes" value="${l.notes||""}" placeholder="ملاحظات..." style="height:28px; padding:2px; font-size:11px;" />
        </td>
      </tr>
    `}).join("")};window.recalculateDailyRow=a=>{const t=document.querySelector(`.daily-att-row[data-id="${a}"]`);if(!t)return;const o=t.querySelector(".daily-status").value,e=t.querySelector(".daily-in").value,p=t.querySelector(".daily-out").value,i=document.getElementById(`daily-late-${a}`),n=document.getElementById(`daily-ot-${a}`);if(o==="absent"||o==="leave"){i.textContent="0 دقيقة",n.textContent="0 ساعة";return}let r=0;if(e){const[s,m]=e.split(":").map(Number),c=s*60+m,d=8*60+15;c>d&&(r=c-8*60)}let l=0;if(p){const[s,m]=p.split(":").map(Number),c=s*60+m,d=17*60;c>d&&(l=parseFloat(((c-d)/60).toFixed(1)))}i.textContent=`${r} دقيقة`,n.textContent=`${l} ساعة`};window.saveDailyAttendanceLog=async()=>{const a=document.getElementById("daily-att-date"),t=document.getElementById("save-daily-att-btn");if(!a||!t)return;const o=a.value||k();t.disabled=!0,t.textContent="جاري الحفظ…";try{const e=[];document.querySelectorAll(".daily-att-row").forEach(i=>{const n=i.dataset.id,r=h.find(x=>x.id===n),l=i.querySelector(".daily-status").value,s=i.querySelector(".daily-in").value,m=i.querySelector(".daily-out").value,c=i.querySelector(".daily-notes").value,d=document.getElementById(`daily-late-${n}`)?.textContent||"0",g=document.getElementById(`daily-ot-${n}`)?.textContent||"0",y=parseInt(d)||0,$=parseFloat(g)||0;e.push({empId:n,empName:r?r.name:"",status:l,checkIn:s,checkOut:m,lateMins:y,overtimeHours:$,notes:c})});const p=D(z,`companies/${C}/dailyAttendance`,o);await lt(p,{date:o,items:e,updatedAt:Y()}),showToast(`✅ تم حفظ سجل حضور الموظفين لليوم (${o}) بنجاح`,"success")}catch(e){showToast(e.message,"error")}finally{t.disabled=!1,t.textContent="💾 حفظ حضور اليوم"}};window.loadAttendanceForMonth=async()=>{const a=document.getElementById("att-selected-month"),t=document.getElementById("att-tbody");if(!t||!a)return;const o=a.value||k().slice(0,7);t.innerHTML='<tr><td colspan="7" style="text-align:center; padding:20px;"><span class="spin"></span> جاري تحميل سجلات الحضور الشهرية…</td></tr>';const e=h.filter(n=>n.status==="active"),p=D(z,`companies/${C}/employeeAttendance`,o),i=await st(p);if(i.exists()){const n=i.data().items||[];t.innerHTML=e.map(r=>{const l=n.find(c=>c.empId===r.id)||{absentDays:0,overtimeHours:0,lateMins:0},m=(r.salary||0)/240*(l.overtimeHours||0)*1.5;return`
        <tr class="att-row" data-id="${r.id}">
          <td><strong>${r.name}</strong></td>
          <td><small style="color:var(--text-3); font-weight:600;">${r.job||"—"}</small></td>
          <td class="mono font-bold">${b(r.salary)}</td>
          <td><input type="number" class="input mono att-absent" value="${l.absentDays||0}" min="0" max="30" step="0.5" style="width:80px; height:28px;" /></td>
          <td><input type="number" class="input mono att-overtime" value="${l.overtimeHours||0}" min="0" step="0.5" style="width:80px; height:28px;" /></td>
          <td><input type="number" class="input mono att-late" value="${l.lateMins||0}" min="0" step="1" style="width:80px; height:28px;" /></td>
          <td class="mono font-bold text-ok">${b(m)}</td>
        </tr>
      `}).join("")}else t.innerHTML=e.map(n=>`
      <tr class="att-row" data-id="${n.id}">
        <td><strong>${n.name}</strong></td>
        <td><small style="color:var(--text-3); font-weight:600;">${n.job||"—"}</small></td>
        <td class="mono font-bold">${b(n.salary)}</td>
        <td><input type="number" class="input mono att-absent" value="0" min="0" max="30" step="0.5" style="width:80px; height:28px;" /></td>
        <td><input type="number" class="input mono att-overtime" value="0" min="0" step="0.5" style="width:80px; height:28px;" /></td>
        <td><input type="number" class="input mono att-late" value="0" min="0" step="1" style="width:80px; height:28px;" /></td>
        <td class="mono font-bold text-ok">0.00 ر.س</td>
      </tr>
    `).join("")};window.saveAttendanceLog=async()=>{const a=document.getElementById("att-selected-month"),t=document.getElementById("save-att-btn");if(!a||!t)return;const o=a.value||k().slice(0,7);t.disabled=!0,t.textContent="جاري الحفظ…";try{const e=[];document.querySelectorAll(".att-row").forEach(i=>{const n=i.dataset.id,r=h.find(c=>c.id===n),l=parseFloat(i.querySelector(".att-absent").value)||0,s=parseFloat(i.querySelector(".att-overtime").value)||0,m=parseInt(i.querySelector(".att-late")?.value)||0;e.push({empId:n,empName:r?r.name:"",absentDays:l,overtimeHours:s,lateMins:m})});const p=D(z,`companies/${C}/employeeAttendance`,o);await lt(p,{month:o,items:e,updatedAt:Y()}),showToast(`✅ تم حفظ سجل حضور الموظفين المعتمد لشهر (${o}) بنجاح`,"success")}catch(e){showToast(e.message,"error")}finally{t.disabled=!1,t.textContent="⏱️ حفظ واعتماد السجل الشهري"}};window.onPayrollMonthChange=async()=>{document.getElementById("pr-month")?.value&&await window.openPayrollModal()};let F="all";window.filterLoansByStatus=a=>{F=a;const t=document.getElementById("hr-main-content");t&&Nt(t)};function Nt(a){let t=P;F==="active"?t=P.filter(l=>(l.remainingBalance||0)>0):F==="paid"&&(t=P.filter(l=>(l.remainingBalance||0)<=0));const o=P.reduce((l,s)=>l+(s.remainingBalance||0),0),e=P.reduce((l,s)=>l+(s.paidAmount||0),0),p=P.reduce((l,s)=>l+(s.amount||0),0),i=P.filter(l=>(l.remainingBalance||0)>0).length,n=P.filter(l=>(l.remainingBalance||0)<=0).length;let r="";t.length?r=`
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
            ${t.map(l=>{let s='<span class="badge" style="background:rgba(239,68,68,0.12); color:#dc2626; font-weight:800; border:1px solid rgba(239,68,68,0.25);">قائمة</span>';return l.remainingBalance<=0&&(s='<span class="badge" style="background:rgba(34,197,94,0.12); color:#16a34a; font-weight:800; border:1px solid rgba(34,197,94,0.25);">مسددة بالكامل</span>'),`
              <tr>
                <td class="mono font-bold" style="font-size:12.5px;">${l.date}</td>
                <td><strong style="color:var(--text-1);">${l.empName}</strong></td>
                <td class="mono font-bold">${b(l.amount)}</td>
                <td class="mono text-ok font-bold">${b(l.paidAmount||0)}</td>
                <td class="mono text-bad font-bold" style="font-size:13.5px;">${b(l.remainingBalance)}</td>
                <td>${l.method==="cash"?"💵 نقدي":l.method==="journal"?"📑 قيد يومية":"🏦 تحويل بنكي"}</td>
                <td>${s}</td>
                <td><small style="color:var(--text-2);font-weight:600;">${l.notes||"—"}</small></td>
                <td>
                  <button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteLoan('${l.id}','${l.empName}',${l.amount})" title="حذف / استبعاد من السلف">🗑️</button>
                </td>
              </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    `:r=`<div style="text-align:center; padding:40px; color:var(--text-3);">
      <div style="font-size:32px; margin-bottom:8px;">🔍</div>
      <div style="font-weight:700;">لا توجد سلف ضمن التصفية المختارة (${F==="active"?"السلف القائمة":F==="paid"?"المسددة بالكامل":"الكل"}).</div>
      <button class="btn btn-secondary sm" style="margin-top:12px;" onclick="filterLoansByStatus('all')">عرض كافة السلف</button>
    </div>`,a.innerHTML=`
    <!-- Summary KPIs (Interactive Filter Cards - Outstanding Balance FIRST) -->
    <div class="grid-3 gap-16 mb-20">
      <!-- 1. ACTIVE OUTSTANDING LOANS (PROMINENT FIRST CARD ON RIGHT) -->
      <div class="stats-card ${F==="active"?"active-kpi":""}" onclick="filterLoansByStatus('active')" style="cursor:pointer; background:linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02)); border:1.5px solid rgba(239,68,68,0.3); border-radius:16px; padding:18px; transition:all 0.2s ease;" title="انقر لتصفية السلف القائمة المتخلفة فقط (600.00 ر.س)">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span class="stats-title" style="font-weight:800; color:#dc2626;">⚠️ صافي السلف القائمة (المستحقة)</span>
          <span class="badge sm" style="font-size:10px; background:${F==="active"?"#dc2626":"rgba(239,68,68,0.15)"}; color:${F==="active"?"#fff":"#dc2626"}; font-weight:800;">${F==="active"?"نشط 🎯":`${i} قائمة 🔍`}</span>
        </div>
        <span class="stats-val text-bad" style="font-size:24px; font-weight:900;">${b(o)}</span>
      </div>

      <!-- 2. REPAID LOANS (MIDDLE CARD) -->
      <div class="stats-card ${F==="paid"?"active-kpi":""}" onclick="filterLoansByStatus('paid')" style="cursor:pointer; background:linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02)); border:1.5px solid rgba(34,197,94,0.3); border-radius:16px; padding:18px; transition:all 0.2s ease;" title="انقر لتصفية السلف المسددة بالكامل فقط (500.00 ر.س)">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span class="stats-title" style="font-weight:800; color:#16a34a;">✅ إجمالي المبالغ المستردة</span>
          <span class="badge sm" style="font-size:10px; background:${F==="paid"?"#16a34a":"rgba(34,197,94,0.15)"}; color:${F==="paid"?"#fff":"#16a34a"}; font-weight:800;">${F==="paid"?"نشط 🎯":`${n} مسددة 🔍`}</span>
        </div>
        <span class="stats-val text-ok" style="font-size:24px; font-weight:900;">${b(e)}</span>
      </div>

      <!-- 3. TOTAL HISTORICAL DISBURSED LOANS (LEFT CARD) -->
      <div class="stats-card ${F==="all"?"active-kpi":""}" onclick="filterLoansByStatus('all')" style="cursor:pointer; background:linear-gradient(135deg, rgba(91,127,255,0.08), rgba(91,127,255,0.02)); border:1.5px solid rgba(91,127,255,0.3); border-radius:16px; padding:18px; transition:all 0.2s ease;" title="انقر لتصفية كافة السلف التراكمية">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span class="stats-title" style="font-weight:800; color:var(--brand);">💰 إجمالي السلف المصروفة (تاريخياً)</span>
          <span class="badge sm" style="font-size:10px; background:${F==="all"?"var(--brand)":"rgba(91,127,255,0.15)"}; color:${F==="all"?"#fff":"var(--brand)"}; font-weight:800;">${F==="all"?"عرض الكل 🎯":`${P.length} سلفة 🔍`}</span>
        </div>
        <span class="stats-val text-brand" style="font-size:24px; font-weight:900;">${b(p)}</span>
      </div>
    </div>

    ${F!=="all"?`
      <div class="flex items-center justify-between mb-16" style="padding:10px 16px; background:var(--bg-2); border-radius:10px; border:1px solid var(--border-soft);">
        <span style="font-size:13px; font-weight:700;">🔍 تصفية الجدول حالياً: <strong>${F==="active"?"السلف القائمة فقط":"السلف المسددة بالكامل فقط"}</strong> (${t.length} سجل)</span>
        <button class="btn btn-secondary sm" onclick="filterLoansByStatus('all')">✕ إزالة التصفية (عرض الكل)</button>
      </div>
    `:""}

    <div class="card">
      ${r}
    </div>
  `}function Vt(a){if(!bt.length){a.innerHTML=`
      <div class="card" style="text-align:center; padding:60px; color:var(--text-3);">
        <div style="font-size:40px; margin-bottom:12px;">💳</div>
        <div style="font-weight:700; font-size:15px; color:var(--text-1); margin-bottom:4px;">لا توجد مسيرات رواتب سابقة</div>
        <div>انقر على زر "إعداد مسير رواتب" لإنشاء وصرف رواتب الموظفين للشهر الحالي.</div>
      </div>`;return}a.innerHTML=`
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
            ${bt.map(t=>`
              <tr>
                <td><strong>${t.month}</strong></td>
                <td class="mono">${t.date}</td>
                <td>${t.method==="cash"?"💵 نقدي":"🏦 بنك"}</td>
                <td>${t.employeeCount} موظف</td>
                <td class="mono font-bold text-bad">${b(t.amount)}</td>
                <td><small>${t.expenseAccName||"—"}</small></td>
                <td><small style="color:var(--text-3);">${t.notes||"—"}</small></td>
                <td>
                  <button class="btn btn-secondary sm" onclick="viewPayrollDetails('${t.id}')">📂 عرض الموظفين وقسائمهم</button>
                  <button class="btn btn-primary sm" onclick="printPayrollSheet('${t.id}')">🖨️ طباعة المسير</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function Xt(a){if(!It.length){a.innerHTML=`
      <div class="card" style="text-align:center; padding:60px; color:var(--text-3);">
        <div style="font-size:40px; margin-bottom:12px;">🎓</div>
        <div style="font-weight:700; font-size:15px; color:var(--text-1); margin-bottom:4px;">لا توجد تسويات نهاية خدمة سابقة</div>
        <div>انقر على زر "تصفية موظف" لإجراء احتساب مكافأة نهاية الخدمة وصرفها لموظف منتهي عقده.</div>
      </div>`;return}a.innerHTML=`
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
            ${It.map(t=>`
              <tr>
                <td class="mono">${t.date}</td>
                <td><strong>${t.empName}</strong></td>
                <td>${t.reason==="resignation"?"استقالة":"إنهاء عقد / فصل"}</td>
                <td class="mono font-bold text-bad">${b(t.indemnityAmount)}</td>
                <td>${t.method==="cash"?"💵 نقدي":"🏦 بنك"}</td>
                <td><small style="color:var(--text-3);">${t.notes||"—"}</small></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.openEmpModal=(a=null)=>{document.getElementById("emp-modal-title").textContent=a?"تعديل موظف":"إضافة موظف",document.getElementById("emp-id").value=a?.id||"",document.getElementById("emp-name").value=a?.name||"",document.getElementById("emp-job").value=a?.job||"",document.getElementById("emp-nid").value=a?.nid||"",document.getElementById("emp-nid-expiry").value=a?.nidExpiry||"",document.getElementById("emp-date").value=a?.date||k(),document.getElementById("emp-passport").value=a?.passportNo||"",document.getElementById("emp-passport-expiry").value=a?.passportExpiry||"",document.getElementById("emp-gosi-number").value=a?.gosiNumber||"",document.getElementById("emp-salary").value=a?.salary||"",document.getElementById("emp-allowance").value=a?.allowance||0,document.getElementById("emp-status").value=a?.status||"active",document.getElementById("emp-nationality").value=a?.nationality||"saudi",document.getElementById("emp-bank-name").value=a?.bankName||"",document.getElementById("emp-iban").value=a?.iban||"",document.getElementById("emp-error").classList.add("hidden"),openModal("emp-modal")};window.editEmp=a=>{const t=h.find(o=>o.id===a);t&&openEmpModal(t)};window.saveEmployee=async()=>{const a=document.getElementById("emp-error");a.classList.add("hidden");const t=document.getElementById("emp-id").value,o=document.getElementById("emp-name").value.trim(),e=parseFloat(document.getElementById("emp-salary").value),p=document.getElementById("emp-nid").value.trim(),i=document.getElementById("emp-nid-expiry").value;if(!o||isNaN(e)||!p||!i){a.textContent="يرجى إدخال الاسم بالكامل، رقم الهوية، تاريخ الانتهاء، والراتب الأساسي",a.classList.remove("hidden");return}const n={name:o,job:document.getElementById("emp-job").value.trim(),nid:p,nidExpiry:i,date:document.getElementById("emp-date").value,passportNo:document.getElementById("emp-passport").value.trim(),passportExpiry:document.getElementById("emp-passport-expiry").value,gosiNumber:document.getElementById("emp-gosi-number").value.trim(),salary:e,allowance:parseFloat(document.getElementById("emp-allowance").value)||0,status:document.getElementById("emp-status").value,nationality:document.getElementById("emp-nationality").value,bankName:document.getElementById("emp-bank-name").value.trim(),iban:document.getElementById("emp-iban").value.trim()},r=document.getElementById("save-emp-btn");r.disabled=!0;try{let l=t;if(t){await Bt("employees",t,n);const c=h.find(d=>d.id===t);c&&c.accountId&&c.name!==o&&await Ht(c.accountId,o)}else{const c=await Mt(S.employees(),n);l=typeof c=="string"?c:c.id;try{const d=await jt("employees",l,o);d&&await Bt("employees",l,{accountId:d.accountId,accountCode:d.accountCode})}catch(d){console.warn("[syncEntityToCoa] فشل ربط الموظف بشجرة الحسابات:",d.message)}}const s=document.getElementById("emp-nid-upload");if(s&&s.files.length>0){const c=s.files[0];window.uploadFileToArchive(c,"employee_docs",l,`صورة إقامة/هوية الموظف: ${o}`).catch(d=>console.warn(d))}const m=document.getElementById("emp-passport-upload");if(m&&m.files.length>0){const c=m.files[0];window.uploadFileToArchive(c,"employee_docs",l,`صورة جواز سفر الموظف: ${o}`).catch(d=>console.warn(d))}showToast("تم حفظ بيانات الموظف","success"),closeModal("emp-modal"),await switchHrTab("employees")}catch(l){a.textContent=l.message,a.classList.remove("hidden")}finally{r.disabled=!1}};window.delEmp=async(a,t)=>{if(confirm(`تأكيد حذف الموظف ${t} نهائياً من سجل الموارد البشرية؟`))try{const o=h.find(e=>e.id===a);o&&o.accountId&&await Ft("employees",a,o.accountId),await Dt("employees",a),showToast("تم حذف ملف الموظف بنجاح","success"),await switchHrTab("employees")}catch(o){showToast(o.message,"error")}};window.viewEmpDocumentDetails=a=>{const t=h.find(i=>i.id===a);if(!t)return;const o=new Date,e=i=>{if(!i)return'<span class="expiry-badge" style="background:#ddd; color:#333;">غير متوفر</span>';const r=new Date(i)-o,l=Math.ceil(r/(24*60*60*1e3));return l<=0?`<span class="expiry-badge danger">منتهية منذ ${Math.abs(l)} يوم</span>`:l<30?`<span class="expiry-badge warning">تنتهي خلال ${l} يوم</span>`:`<span class="expiry-badge good">صالحة (متبقي ${l} يوم)</span>`},p=document.getElementById("doc-details-body");p&&(p.innerHTML=`
    <div style="font-family:'Cairo', sans-serif; direction:rtl; line-height:1.8;">
      <div style="text-align:center; margin-bottom:16px; border-bottom:1px solid var(--border-soft); padding-bottom:12px;">
        <h3 style="margin:0; color:var(--text-1);">${t.name}</h3>
        <span style="font-size:12px; color:var(--text-3);">${t.job||"بدون مسمى وظيفي"}</span>
      </div>

      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-soft); padding-bottom:6px;">
          <span>📋 الهوية الوطنية / الإقامة:</span>
          <div style="text-align:left;">
            <strong class="mono">${t.nid||"—"}</strong><br>
            ${e(t.nidExpiry)}
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-soft); padding-bottom:6px;">
          <span>✈️ جواز السفر:</span>
          <div style="text-align:left;">
            <strong class="mono">${t.passportNo||"—"}</strong><br>
            ${e(t.passportExpiry)}
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-soft); padding-bottom:6px;">
          <span>🇸🇦 فئة الجنسية / التأمينات:</span>
          <strong>${t.nationality==="saudi"?"سعودي (خاضع للتأمينات)":"مقيم / أجنبي"}</strong>
        </div>

        <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-soft); padding-bottom:6px;">
          <span>🏦 تفاصيل البنك للراتب:</span>
          <div style="text-align:left;">
            <strong>${t.bankName||"—"}</strong><br>
            <span class="mono" style="font-size:11px; color:var(--text-2);">${t.iban||"—"}</span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-soft); padding-bottom:6px;">
          <span>💼 الراتب الأساسي والبدلات:</span>
          <div>
            الأساسي: <strong class="mono text-brand">${b(t.salary)}</strong> | 
            البدلات: <strong class="mono text-ok">${b(t.allowance||0)}</strong>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; padding-bottom:6px;">
          <span>📅 تاريخ التوظيف والتعيين:</span>
          <strong class="mono">${t.date||"—"}</strong>
        </div>
      </div>
    </div>
  `,openModal("doc-details-modal"))};window.openLeaveModal=()=>{const a=h.filter(t=>t.status==="active");if(!a.length){showToast("لا يوجد موظفون نشطون لتسجيل إجازة لهم","warning");return}document.getElementById("leave-emp-id").innerHTML=a.map(t=>`<option value="${t.id}">${t.name}</option>`).join(""),document.getElementById("leave-start").value=k(),document.getElementById("leave-end").value=k(),document.getElementById("leave-notes").value="",document.getElementById("leave-error").classList.add("hidden"),openModal("leave-modal")};window.saveEmployeeLeave=async()=>{const a=document.getElementById("leave-error");a.classList.add("hidden");const t=document.getElementById("leave-emp-id").value,o=document.getElementById("leave-type").value,e=document.getElementById("leave-start").value,p=document.getElementById("leave-end").value,i=document.getElementById("leave-notes").value.trim();if(!t||!e||!p){a.textContent="يرجى ملء جميع الحقول الإجبارية",a.classList.remove("hidden");return}const n=new Date(e);if(new Date(p)<n){a.textContent="تاريخ الانتهاء لا يمكن أن يكون قبل تاريخ البدء",a.classList.remove("hidden");return}const l=h.find(m=>m.id===t),s=document.getElementById("save-leave-btn");s.disabled=!0;try{const m=D(gt(z,`companies/${C}/employeeLeaves`));await lt(m,{empId:t,empName:l.name,type:o,startDate:e,endDate:p,notes:i,createdAt:Y()}),showToast("✅ تم تسجيل إجازة الموظف بنجاح","success"),closeModal("leave-modal"),await switchHrTab("leaves")}catch(m){a.textContent=m.message,a.classList.remove("hidden")}finally{s.disabled=!1}};window.deleteLeave=async a=>{if(confirm("هل تريد بالتأكيد حذف سجل هذه الإجازة؟"))try{await Tt(D(z,`companies/${C}/employeeLeaves`,a)),showToast("تم حذف سجل الإجازة","success"),await switchHrTab("leaves")}catch(t){showToast(t.message,"error")}};window.openLoanModal=()=>{const a=document.getElementById("loan-emp-id"),t=h.filter(o=>o.status==="active");if(!t.length){showToast("لا يوجد موظفون نشطون لصرف سلف لهم","warning");return}a.innerHTML=t.map(o=>`<option value="${o.id}">${o.name}</option>`).join(""),document.getElementById("loan-date").value=k(),document.getElementById("loan-amount").value="",document.getElementById("loan-notes").value="",document.getElementById("loan-error").classList.add("hidden"),toggleLoanSource(),openModal("loan-modal")};window.toggleLoanSource=()=>{const a=document.getElementById("loan-method").value,t=document.getElementById("loan-source-label"),o=document.getElementById("loan-source");o.innerHTML='<option value="">اختر...</option>',a==="cash"?(t.textContent="صندوق الصرف *",o.innerHTML+=J.map(e=>`<option value="${e.id}">${e.name}</option>`).join("")):(t.textContent="الحساب البنكي المخصوم منه *",o.innerHTML+=K.map(e=>`<option value="${e.id}">${e.bankName} - ${e.accountNumber}</option>`).join(""))};async function St(a){if(!a)return f.find(e=>e.code==="1-1-5-4")||{id:"OcKzxqDbfrKjheMgJAYp",code:"1-1-5-4",name:"سلف للموظفين والمناديب"};if(a.loanAccountId){const e=f.find(p=>p.id===a.loanAccountId);if(e)return e}const t=f.find(e=>{const p=e.parentCode==="1-1-5-4"||e.code&&e.code.startsWith("1-1-5-4"),i=e.sourceEntityId&&e.sourceEntityId===a.id||e.linkedEmpId&&e.linkedEmpId===a.id||e.linkedRepId&&e.linkedRepId===a.id||e.name&&a.name&&(e.name.includes(a.name)||a.name.includes(e.name));return p&&i});if(t)return t;const o=f.find(e=>e.name&&a.name&&(e.name.includes(a.name)||a.name.includes(e.name))&&(e.parentCode==="1-1-5-4"||e.code&&e.code.startsWith("1-1-5-4")||e.name&&e.name.includes("سلف")));if(o)return o;try{const e="1-1-5-4",p=await Rt(e),i=gt(z,`companies/${C}/chartOfAccounts`),n=f.find(m=>m.code===e)||{id:"OcKzxqDbfrKjheMgJAYp"},r=D(i),l={code:p,name:`سلف الموظف ${a.name}`,parentCode:e,parentId:n.id||"OcKzxqDbfrKjheMgJAYp",type:"asset",nodeType:"detail",level:4,balance:0,totalDebit:0,totalCredit:0,normalBalance:"debit",companyId:C,sourceEntityId:a.id,linkedEmpId:a.id,isActive:!0,createdAt:Y()};await lt(r,l);const s={id:r.id,...l};f.push(s);try{await dt(D(z,`companies/${C}/employees`,a.id),{loanAccountId:r.id}),a.loanAccountId=r.id}catch{}return s}catch(e){return console.error("Failed to auto-create employee loan sub-account:",e),f.find(p=>p.code==="1-1-5-4")||{id:"OcKzxqDbfrKjheMgJAYp",code:"1-1-5-4",name:"سلف للموظفين والمناديب"}}}window.saveEmployeeLoan=async()=>{const a=document.getElementById("loan-error");a.classList.add("hidden");const t=document.getElementById("loan-emp-id").value,o=document.getElementById("loan-date").value,e=parseFloat(document.getElementById("loan-amount").value),p=document.getElementById("loan-method").value,i=document.getElementById("loan-source").value,n=document.getElementById("loan-notes").value.trim();if(!t||!o||isNaN(e)||e<=0||!i||!n){a.textContent="الرجاء تعبئة كافة الحقول المطلوبة وكتابة بيان صحيح للسلفة",a.classList.remove("hidden");return}const r=h.find(s=>s.id===t),l=document.getElementById("save-loan-btn");l.disabled=!0;try{const s=await St(r);let m="",c="",d="",g=null;if(p==="cash"){const E=J.find(L=>L.id===i);m=E?.accountId,c=E?.code||"",d=E?.name||"",g=D(z,`companies/${C}/cashBoxes`,i)}else{const E=K.find(L=>L.id===i);m=E?.accountId,c=E?.code||"",d=E?.bankName||"",g=D(z,`companies/${C}/bankAccounts`,i)}if(!m)throw new Error("حساب الدفع المختار غير مربوط بشجرة الحسابات");const y=f.find(E=>E.id===m)||{id:m,code:c,name:d},$=D(gt(z,`companies/${C}/employeeLoans`)),x={empId:t,empName:r.name,date:o,amount:e,paidAmount:0,remainingBalance:e,method:p,sourceId:i,notes:n,status:"active",createdAt:Y()};if(await lt($,x),await ut({date:o,description:`صرف سلفة للموظف ${r.name} - مستند ${$.id.slice(-6)}`,sourceType:"employee_advance",sourceId:$.id,lines:[{accountId:s.id,accountCode:s.code,accountName:s.name,debit:e,credit:0,note:`سلفة للموظف ${r.name}`},{accountId:y.id,accountCode:y.code,accountName:y.name,debit:0,credit:e,note:`صرف سلفة للموظف ${r.name} من ${y.name}`}]}),g){const E=await st(g);if(E.exists()){const L=parseFloat(E.data().balance||0);await dt(g,{balance:L-e,updatedAt:Y()})}}showToast(`✅ تم صرف السلفة بنجاح للموظف ${r.name} على حسابه الفرعي (${s.name})`,"success"),closeModal("loan-modal"),await switchHrTab("loans")}catch(s){a.textContent=s.message,a.classList.remove("hidden")}finally{l.disabled=!1}};window.deleteLoan=async(a,t,o)=>{if(confirm(`تأكيد حذف وإلغاء سلفة الموظف ${t} بمبلغ ${o} ر.س من قسم الموارد البشرية؟`))try{if(a.startsWith("je_")||a.startsWith("manual_")){const c=JSON.parse(localStorage.getItem("ignored_hr_loans")||"[]");c.includes(a)||c.push(a),localStorage.setItem("ignored_hr_loans",JSON.stringify(c)),showToast("تم استبعاد وإخفاء السلفة من قسم الموارد البشرية بنجاح","success"),await switchHrTab("loans");return}const e=D(z,`companies/${C}/employeeLoans`,a),p=await st(e);if(!p.exists()){const c=JSON.parse(localStorage.getItem("ignored_hr_loans")||"[]");c.includes(a)||c.push(a),localStorage.setItem("ignored_hr_loans",JSON.stringify(c)),showToast("تم استبعاد السلفة من قسم الموارد البشرية بنجاح","success"),await switchHrTab("loans");return}const i=p.data();let n=null;if(i.method==="cash"?n=D(z,`companies/${C}/cashBoxes`,i.sourceId):n=D(z,`companies/${C}/bankAccounts`,i.sourceId),n){const c=await st(n);if(c.exists()){const d=parseFloat(c.data().balance||0);await dt(n,{balance:d+o,updatedAt:Y()})}}const r=h.find(c=>c.name===i.empName||c.id===i.empId),l=await St(r);let s="";i.method==="cash"?s=J.find(c=>c.id===i.sourceId)?.accountId:s=K.find(c=>c.id===i.sourceId)?.accountId;const m=f.find(c=>c.id===s);m&&await ut({date:k(),description:`عكس وإلغاء قيد سلفة الموظف ${t} - مستند ${a.slice(-6)}`,sourceType:"employee_advance_reversal",sourceId:a,lines:[{accountId:m.id,accountCode:m.code,accountName:m.name,debit:o,credit:0,note:"عكس قيد صرف سلفة ملغاة"},{accountId:l.id,accountCode:l.code,accountName:l.name,debit:0,credit:o,note:"تخفيض ذمة السلف للموظف بالإلغاء"}]}),await Tt(e),showToast("تم إلغاء السلفة وعكس القيد المحاسبي المترتب عليها","success"),await switchHrTab("loans")}catch(e){showToast(e.message,"error")}};window.openEosModal=()=>{const a=h.filter(e=>e.status==="active"||e.status==="suspended");if(!a.length){showToast("لا يوجد موظفون نشطون لإجراء تصفية نهاية خدمة لهم","warning");return}document.getElementById("eos-emp-id").innerHTML='<option value="">اختر الموظف...</option>'+a.map(e=>`<option value="${e.id}">${e.name}</option>`).join(""),document.getElementById("eos-date").value=k(),document.getElementById("eos-notes").value="",document.getElementById("eos-error").classList.add("hidden"),document.getElementById("eos-calc-details").innerHTML='<div class="alert info" style="margin:0;">يرجى اختيار الموظف لتحديث تفاصيل مدة الخدمة والمكافأة تلقائياً وفق قانون العمل.</div>';const t=f.filter(e=>e.type==="liability");document.getElementById("eos-account-id").innerHTML='<option value="">اختر...</option>'+t.map(e=>`<option value="${e.id}">${e.code} - ${e.name}</option>`).join("");const o=f.find(e=>e.code==="2-1-5-2");o&&(document.getElementById("eos-account-id").value=o.id),toggleEosSource(),openModal("eos-modal"),document.getElementById("save-eos-btn").disabled=!0};window.toggleEosSource=()=>{const a=document.getElementById("eos-method").value,t=document.getElementById("eos-source-label"),o=document.getElementById("eos-source");o.innerHTML='<option value="">اختر...</option>',a==="cash"?(t.textContent="صندوق الصرف *",o.innerHTML+=J.map(e=>`<option value="${e.id}">${e.name}</option>`).join("")):(t.textContent="الحساب البنكي المخصوم منه *",o.innerHTML+=K.map(e=>`<option value="${e.id}">${e.bankName} - ${e.accountNumber}</option>`).join(""))};window.calculateEosIndemnity=()=>{const a=document.getElementById("eos-emp-id").value,t=document.getElementById("eos-date").value,o=document.getElementById("eos-reason").value,e=document.getElementById("eos-calc-details"),p=document.getElementById("save-eos-btn");if(!a||!t||!e){p&&(p.disabled=!0);return}const i=h.find(A=>A.id===a);if(!i){p&&(p.disabled=!0);return}const n=new Date(i.date||k()),r=new Date(t);if(r-n<0){e.innerHTML=`<div class="text-bad" style="font-weight:bold; padding:8px; border:1px solid var(--border); border-radius:6px; background:rgba(239,68,68,0.05);">⚠️ تاريخ التصفية يجب أن يكون بعد تاريخ التعيين للموظف وهو (${i.date})</div>`,p&&(p.disabled=!0);return}p&&(p.disabled=!1);let s=r.getFullYear()-n.getFullYear(),m=r.getMonth()-n.getMonth(),c=r.getDate()-n.getDate();if(c<0){m--;const A=new Date(r.getFullYear(),r.getMonth(),0);c+=A.getDate()}m<0&&(s--,m+=12);const d=s+m/12+c/365.25,g=i.salary||0,y=i.allowance||0,$=g+y;let x=0,E="",L=0;if(d<=5)L=d*($/2),E+=`• حساب أول 5 سنوات: ${d.toFixed(2)} سنة × نصف راتب (${b($/2)}) = ${b(L)} ر.س<br>`;else{const A=5*($/2),V=d-5,Z=V*$;L=A+Z,E+=`• حساب أول 5 سنوات: 5 سنوات × نصف راتب (${b($/2)}) = ${b(A)} ر.س<br>`,E+=`• حساب ما بعد 5 سنوات: ${V.toFixed(2)} سنة × راتب كامل (${b($)}) = ${b(Z)} ر.س<br>`}let I=1,B="إنهاء عقد / فصل من العمل (تستحق المكافأة كاملة 100%)";o==="resignation"&&(d<2?(I=0,B="الخدمة أقل من سنتين في حالة الاستقالة (لا تستحق مكافأة 0%)"):d>=2&&d<5?(I=1/3,B="الخدمة بين 2 إلى 5 سنوات في حالة الاستقالة (تستحق ثلث المكافأة 33.3%)"):d>=5&&d<10?(I=2/3,B="الخدمة بين 5 إلى 10 سنوات في حالة الاستقالة (تستحق ثلثي المكافأة 66.6%)"):(I=1,B="الخدمة أكثر من 10 سنوات في حالة الاستقالة (تستحق المكافأة كاملة 100%)")),x=L*I,e.innerHTML=`
    <div style="background:var(--bg-2); border:1px solid var(--border); border-radius:12px; padding:16px; font-size:12px; line-height:1.6; color:var(--text-1);">
      <div style="margin-bottom:6px;"><strong>📅 تاريخ التعيين:</strong> ${i.date}</div>
      <div style="margin-bottom:8px;"><strong>⏱️ مدة الخدمة الفعلية:</strong> ${s} سنة، و ${m} شهر، و ${c} يوم (${d.toFixed(3)} سنة)</div>
      
      <div style="margin-top:8px; padding-top:8px; border-top:1px dashed var(--border); font-size:11px; color:var(--text-2);">
        <strong>⚙️ تفاصيل حساب المكافأة (حسب نظام العمل السعودي):</strong><br>
        ${E}
        <strong>الحالة:</strong> ${B}<br>
      </div>

      <div style="margin-top:12px; padding:12px; background:var(--brand-alpha, rgba(91, 127, 255, 0.1)); border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-weight:bold; font-size:14px; border:1px solid var(--brand-alpha);">
        <span>صافي مكافأة نهاية الخدمة المستحقة:</span>
        <span class="mono text-bad" style="font-size:16px;" id="calculated-eos-amount" data-val="${x.toFixed(2)}">${b(x)} ر.س</span>
      </div>
    </div>
  `};window.saveEosSettlement=async()=>{const a=document.getElementById("eos-error");a.classList.add("hidden");const t=document.getElementById("eos-emp-id").value,o=document.getElementById("eos-date").value,e=document.getElementById("eos-reason").value,p=document.getElementById("eos-method").value,i=document.getElementById("eos-source").value,n=document.getElementById("eos-account-id").value,r=document.getElementById("eos-notes").value.trim(),l=document.getElementById("calculated-eos-amount"),s=l&&parseFloat(l.dataset.val)||0;if(!t||!o||!i||!n){a.textContent="الرجاء تحديد كافة الحقول المطلوبة ومراجعة الحساب",a.classList.remove("hidden");return}const m=h.find(d=>d.id===t),c=document.getElementById("save-eos-btn");c.disabled=!0;try{let d="",g="",y="",$=null;if(p==="cash"){const I=J.find(B=>B.id===i);d=I?.accountId,g=I?.code||"",y=I?.name||"",$=D(z,`companies/${C}/cashBoxes`,i)}else{const I=K.find(B=>B.id===i);d=I?.accountId,g=I?.code||"",y=I?.bankName||"",$=D(z,`companies/${C}/bankAccounts`,i)}if(!d)throw new Error("حساب الصرف المختار غير مربوط بشجرة الحسابات");const x=f.find(I=>I.id===d)||{id:d,code:g,name:y},E=f.find(I=>I.id===n);await dt(D(z,`companies/${C}/employees`,t),{status:"resigned"});const L=D(gt(z,`companies/${C}/employeeSettlements`));if(await lt(L,{empId:t,empName:m.name,date:o,reason:e,indemnityAmount:s,method:p,sourceId:i,expenseAccId:n,notes:r||"تصفية نهاية خدمة الموظف المعتمدة",createdAt:Y()}),s>0&&(await ut({date:o,description:`تصفية مستحقات ومكافأة نهاية خدمة الموظف ${m.name}`,sourceType:"employee_settlement",sourceId:L.id,lines:[{accountId:n,accountCode:E?.code||"",accountName:E?.name||"",debit:s,credit:0,note:`مكافأة نهاية خدمة الموظف ${m.name}`},{accountId:x.id,accountCode:x.code,accountName:x.name,debit:0,credit:s,note:`صرف مستحقات تصفية الموظف ${m.name}`}]}),$)){const I=await st($);if(I.exists()){const B=parseFloat(I.data().balance||0);await dt($,{balance:B-s,updatedAt:Y()})}}showToast(`✅ تم اعتماد تصفية الموظف ${m.name} وصرف مستحقاته بنجاح`,"success"),closeModal("eos-modal"),await switchHrTab("eos")}catch(d){a.textContent=d.message,a.classList.remove("hidden")}finally{c.disabled=!1}};function T(a){return a?a.replace(/[أإآ]/g,"ا").replace(/[ى]/g,"ي").replace(/[ة]/g,"ه").replace(/[\/\-_]/g," ").replace(/\s+/g," ").trim().toLowerCase():""}function mt(a,t){if(!a||!t||!t.length)return{liabAcc:null,loanAcc:null,custodyAcc:null};const o=T(a.name);let e=null,p=null,i=null;if(o.includes("ابراهيم")?(e=t.find(n=>n.code==="2-1-5-6"||n.code?.startsWith("2-1-5")&&T(n.name).includes("ابراهيم")),p=t.find(n=>n.code==="1-1-5-4-5"||T(n.name).includes("ابراهيم")&&(n.code?.startsWith("1-1-5")||n.code?.startsWith("1-1-3")))):o.includes("مصطفي")||o.includes("الاسيوطي")?(e=t.find(n=>n.code==="2-1-5-1"||n.code?.startsWith("2-1-5")&&(T(n.name).includes("مصطفي")||T(n.name).includes("الاسيوطي"))&&n.type==="liability"),p=t.find(n=>n.code==="2-1-5-3"||n.code?.startsWith("1-1-5")&&T(n.name).includes("مصطفي"))):o.includes("عوض")||o.includes("محمد")&&!o.includes("محمود")?(e=t.find(n=>n.code==="2-1-5-2"||n.code?.startsWith("2-1-5")&&T(n.name).includes("محمد")&&!o.includes("محمود")),p=t.find(n=>n.code==="1-1-5-4-7"||n.code?.startsWith("1-1-5")&&T(n.name).includes("محمد")),i=t.find(n=>n.code==="1-1-2-3-1"||n.code?.startsWith("1-1-2-3")&&T(n.name).includes("محمد"))):o.includes("علي")||o.includes("عبده")?(e=t.find(n=>n.code==="2-1-5-4"||n.code?.startsWith("2-1-5")&&T(n.name).includes("علي")),p=t.find(n=>n.code==="1-1-5-4-4"||n.code?.startsWith("1-1-5")&&T(n.name).includes("علي"))):o.includes("السيد رضا")||o.includes("رضا")&&!o.includes("رياض")?(e=t.find(n=>n.code==="2-1-5-10"||n.code?.startsWith("2-1-5")&&T(n.name).includes("رضا")),p=t.find(n=>n.code==="1-1-5-4-8"||n.code?.startsWith("1-1-5")&&T(n.name).includes("رضا")),i=t.find(n=>n.code==="1-1-2-3-2"||n.code?.startsWith("1-1-2-3")&&T(n.name).includes("رضا"))):o.includes("احمد السيد")||o.includes("احمد")?(e=t.find(n=>n.code==="2-1-5-9"||n.code?.startsWith("2-1-5")&&T(n.name).includes("احمد")),p=t.find(n=>n.code==="1-1-5-4-6"||n.code?.startsWith("1-1-5")&&T(n.name).includes("احمد"))):o.includes("محمود")?e=t.find(n=>n.code==="2-1-5-8"||n.code?.startsWith("2-1-5")&&T(n.name).includes("محمود")):o.includes("عبد الرحمن")?e=t.find(n=>n.code==="2-1-5-7"||n.code?.startsWith("2-1-5")&&T(n.name).includes("عبد الرحمن")):(o.includes("ناجي")||o.includes("عاطف"))&&(e=t.find(n=>n.code==="2-1-5-5"||n.code?.startsWith("2-1-5")&&T(n.name).includes("ناجي"))),!e&&a.accountId&&(e=t.find(n=>n.id===a.accountId)),!e&&a.accountCode&&(e=t.find(n=>n.code===a.accountCode)),!e){const n=o.split(" ").filter(r=>r.length>=3);e=t.find(r=>r.code?.startsWith("2-1-5")&&r.type==="liability"&&n.some(l=>T(r.name).includes(l)))}return{liabAcc:e,loanAcc:p,custodyAcc:i}}window.calculateGrandTotal=()=>{let a=0;document.querySelectorAll(".pr-row").forEach(o=>{const e=o.dataset.id,p=document.getElementById(`net-${e}`);if(p){const i=p.textContent.replace(/[^0-9.-]+/g,""),n=parseFloat(i)||0;a+=n}});const t=document.getElementById("pr-total");t&&(t.textContent=`${b(a)} ر.س`)};window.openPayrollModal=async()=>{try{if((!h||!h.length)&&(h=await _(S.employees())),(!f||!f.length)&&(f=await _(S.chartOfAccounts())),(!J||!J.length)&&(J=await _(S.cashBoxes())),(!K||!K.length)&&(K=await _(S.bankAccounts())),!P||!P.length)try{P=(await Lt(S.employeeLoans())).docs.map(m=>({id:m.id,...m.data()}))}catch{}let a=[];try{a=await _(S.journalEntries())}catch{}const t=h.filter(s=>s.status==="active");if(!t.length){showToast("لا يوجد موظفون نشطون لإصدار رواتب لهم","warning");return}togglePrSource();const o=f.filter(s=>s.type==="expense");document.getElementById("pr-expense-acc").innerHTML='<option value="">اختر...</option>'+o.map(s=>`<option value="${s.id}">${s.code} - ${s.name}</option>`).join(""),document.getElementById("pr-allowance-acc").innerHTML='<option value="">اختر...</option>'+o.map(s=>`<option value="${s.id}">${s.code} - ${s.name}</option>`).join("");const e=f.find(s=>s.code==="5-2-1"||s.code==="5-2-1-1")||f.find(s=>s.code?.startsWith("5-2-1"))||f.find(s=>s.name?.includes("رواتب")&&s.type==="expense")||f.find(s=>s.code?.startsWith("5-2")),p=f.find(s=>s.code==="5-2-2"||s.code==="5-2-5"||s.code==="5-2-5-1")||f.find(s=>(s.code?.startsWith("5-2-2")||s.code?.startsWith("5-2-5"))&&s.type==="expense")||f.find(s=>s.name?.includes("بدلات")&&s.type==="expense");e&&(document.getElementById("pr-expense-acc").value=e.id),p&&(document.getElementById("pr-allowance-acc").value=p.id);const i=document.getElementById("pr-month")?.value||new Date().toISOString().slice(0,7),n={};try{const[s,m,c]=await Promise.all([_(S.salesReps()),_(S.receipts()),_(S.salesInvoices())]),d=m.filter(y=>y.date&&y.date.slice(0,7)===i&&y.entityType==="customer"),g=c.filter(y=>y.date&&y.date.slice(0,7)===i&&y.status!=="cancelled");s.forEach(y=>{let $=0;d.forEach(A=>{(A.repId===y.id||A.targetId===y.id)&&($+=parseFloat(A.amount||0))});let x=0;g.forEach(A=>{A.repId===y.id&&(x+=parseFloat(A.totalWithVat||A.total||0))});const E=y.monthlyTarget||0,L=x<E?1:parseFloat(y.commissionRate||2.5),I=$*L/100,B=h.find(A=>A.id===y.employeeId||A.name.includes(y.name)||y.name.includes(A.name));B&&(n[B.id]=(n[B.id]||0)+I)})}catch(s){console.error("Error calculating rep commission for payroll:",s)}const r=document.getElementById("pr-tbody");let l=0;r.innerHTML=t.map(s=>{const{liabAcc:m,loanAcc:c}=mt(s,f),d=parseFloat(s.salary||0),g=parseFloat(s.allowance||0),y=n[s.id]||0,$=T(s.name).split(" ").filter(R=>R.length>=3);let x=0,E=0,L=0;for(const R of a){const et=R.date||"",at=et.startsWith(i),ot=et<=`${i}-31`,q=T(R.description||""),ct=q.includes("اقفال سلف")||q.includes("اقفال السلف")||q.includes("صرف راتب")||q.includes("صرف رواتب")||q.includes("تصفية مستحقات")||q.includes("قيد اثبات مستحقات")||q.includes("قيد رواتب");for(const nt of R.lines||[]){const u=nt.accountId,v=nt.accountCode||"",w=parseFloat(nt.debit||0)||0,M=parseFloat(nt.credit||0)||0,H=T(nt.desc||"");c&&(u===c.id||v===c.code)&&(at&&w>0&&!ct&&(x+=w),ot&&!ct&&(L+=w-M)),m&&(u===m.id||v===m.code)&&at&&w>0&&(q.includes("سلف")||q.includes("سلفة")||q.includes("مخالف"))&&!ct&&(x+=w),at&&v.startsWith("5-2-7")&&w>0&&($.some(j=>q.includes(j)||H.includes(j))||m&&u===m.id)&&(E+=w)}}const B=(P||[]).filter(R=>(R.remainingBalance||0)>0&&(R.empId===s.id||R.empName&&s.name&&(R.empName.includes(s.name)||s.name.includes(R.empName)))).reduce((R,et)=>R+(et.remainingBalance||0),0),A=Math.max(x,L,B),V=y>0?y:E,Z=d+g+V,X=x>0?Math.min(x,d+g):A>0?Math.min(A,(d+g)*.25):0,it=s.nationality==="saudi"?(d+g)*.0975:0,W=Math.max(0,Z-it-X);l+=W;const xt=m?`<span class="badge" style="font-size:9.5px; background:rgba(37,99,235,0.1); color:#1d4ed8; border:1px solid rgba(37,99,235,0.25); margin-right:4px;" title="حساب المستحقات: ${m.name}">${m.code}</span>`:"",G=c?`<span class="badge" style="font-size:9.5px; background:rgba(220,38,38,0.1); color:#b91c1c; border:1px solid rgba(220,38,38,0.25); margin-right:4px;" title="حساب السلف: ${c.name}">${c.code}</span>`:"";return`
        <tr class="pr-row" data-id="${s.id}" data-nationality="${s.nationality||"saudi"}" data-liab-acc="${m?.id||""}" data-loan-acc="${c?.id||""}">
          <td style="white-space:nowrap;">
            <strong>${s.name}</strong> ${xt} ${G}<br>
            <small style="color:var(--text-3);">${s.job||"موظف"}</small>
          </td>
          <td class="mono font-bold">${b(d)}</td>
          <td class="mono">${b(g)}</td>
          <td>
            <input type="number" class="input mono pr-overtime" value="0" min="0" step="0.01" style="height:28px; padding:2px; font-size:11px;" onchange="calculateRowNet('${s.id}', ${d}, ${g})" />
          </td>
          <td>
            <div style="display:flex; flex-direction:column; gap:2px;">
              <input type="number" class="input mono pr-bonus" value="${V.toFixed(2)}" min="0" step="0.01" style="height:26px; padding:2px; font-size:11px;" onchange="calculateRowNet('${s.id}', ${d}, ${g})" title="${y>0?"عمولة مبيعات مناديب":"مكافآت وحوافز"}" placeholder="0.00" />
              <input type="text" class="input pr-bonus-desc" value="${y>0?"عمولة مبيعات شهر "+i:""}" placeholder="بيان المكافأة..." style="height:20px; padding:1px 4px; font-size:9.5px; color:var(--text-1);" title="بيان المكافأة ليظهر تفصيلياً في كشف حساب المستحقات" />
            </div>
          </td>
          <td>
            <input type="number" class="input mono pr-deduct" value="0" min="0" step="0.01" style="height:28px; padding:2px; font-size:11px;" onchange="calculateRowNet('${s.id}', ${d}, ${g})" title="حاضر الشهر بالكامل افتراضياً (0 خصم)" />
          </td>
          <td>
            <input type="number" class="input mono pr-gosi" value="${it.toFixed(2)}" min="0" step="0.01" style="height:28px; padding:2px; font-size:11px;" onchange="calculateRowNet('${s.id}', ${d}, ${g})" />
          </td>
          <td class="mono text-bad font-bold" id="loan-bal-${s.id}" title="سلف الشهر القائمة من دفتر الأستاذ">${b(A)}</td>
          <td>
            <input type="number" class="input mono pr-repay" id="repay-input-${s.id}" data-max="${A}" value="${X.toFixed(2)}" min="0" max="${Math.max(A,d+g)}" step="0.01" style="height:28px; padding:2px; font-size:11px;" onchange="calculateRowNet('${s.id}', ${d}, ${g})" />
          </td>
          <td class="mono font-bold text-ok" id="net-${s.id}" style="font-size:12px;">${b(W)}</td>
          <td style="text-align:center;">
            <button type="button" class="btn btn-secondary sm" style="padding:2px 8px; font-size:10.5px;" onclick="window.printRowPayslip('${s.id}')" title="معاينة وطباعة قسيمة استلام الراتب للموظف">🖨️ قسيمة</button>
          </td>
        </tr>
      `}).join(""),document.getElementById("pr-total").textContent=`${b(l)} ر.س`,document.getElementById("pr-error").classList.add("hidden"),calculateGrandTotal(),openModal("payroll-modal")}catch(a){console.error("Error opening payroll modal:",a),showToast(`حدث خطأ أثناء فتح مسير الرواتب: ${a.message}`,"error")}};window.printRowPayslip=a=>{const t=document.querySelector(`.pr-row[data-id="${a}"]`);if(!t)return;const o=h.find(g=>g.id===a),e=o?.salary||0,p=o?.allowance||0,i=parseFloat(t.querySelector(".pr-overtime")?.value)||0,n=parseFloat(t.querySelector(".pr-bonus")?.value)||0,r=t.querySelector(".pr-bonus-desc")?.value?.trim()||"",l=parseFloat(t.querySelector(".pr-deduct")?.value)||0,s=parseFloat(t.querySelector(".pr-gosi")?.value)||0,m=parseFloat(t.querySelector(".pr-repay")?.value)||0,c=Math.max(0,e+p+i+n-(l+s+m)),d=document.getElementById("pr-month")?.value||k().slice(0,7);window.printEmployeePayslip(a,e,p,i,n,l,s,m,c,d,r)};window.calculateRowNet=(a,t,o)=>{const e=document.querySelector(`.pr-row[data-id="${a}"]`);if(!e)return;const p=parseFloat(e.querySelector(".pr-overtime").value)||0,i=parseFloat(e.querySelector(".pr-bonus").value)||0,n=parseFloat(e.querySelector(".pr-deduct").value)||0,r=parseFloat(e.querySelector(".pr-gosi").value)||0,l=e.querySelector(".pr-repay"),s=parseFloat(l.dataset.max)||0;let m=parseFloat(l.value)||0;m>s&&s>0&&(m=s,l.value=s);const c=t+o+p+i,d=Math.max(0,c-(n+r+m));document.getElementById(`net-${a}`).textContent=b(d),calculateGrandTotal()};window.submitPayroll=async()=>{const a=document.getElementById("pr-error");a.classList.add("hidden");const t=document.getElementById("pr-month").value,o=document.getElementById("pr-method").value,e=document.getElementById("pr-source").value,p=document.getElementById("pr-expense-acc").value,i=document.getElementById("pr-allowance-acc").value;if(!e||!p||!i){a.textContent="الرجاء تحديد مصدر الدفع وحسابات المصروفات للرواتب والبدلات",a.classList.remove("hidden");return}const n=document.getElementById("save-pr-btn");n.disabled=!0;try{let r=0,l=0,s=0,m=0,c=0,d=0,g=0,y=0,$=0;const x=[],E=await _(S.salesReps()),L=document.querySelectorAll(".pr-row");for(const u of L){const v=u.dataset.id,w=h.find(Q=>Q.id===v),M=w.salary||0,H=w.allowance||0,j=parseFloat(u.querySelector(".pr-overtime").value)||0,N=parseFloat(u.querySelector(".pr-bonus").value)||0,O=u.querySelector(".pr-bonus-desc")?.value?.trim()||"",rt=parseFloat(u.querySelector(".pr-deduct").value)||0,pt=parseFloat(u.querySelector(".pr-gosi").value)||0,U=parseFloat(u.querySelector(".pr-repay").value)||0,yt=Math.max(0,M+H+j+N-(rt+pt+U)),Et=M+H;let vt=0;if(w.nationality==="saudi"?vt=Et*.1175:vt=Et*.02,r+=yt,l+=M,s+=H,m+=j,E.some(Q=>Q.employeeId===v||Q.name.includes(w.name)||w.name.includes(Q.name))?d+=N:c+=N,g+=U,y+=pt,$+=vt,x.push({empId:v,empName:w.name,basic:M,allowance:H,overtime:j,bonus:N,bonusDesc:O,deduct:rt,gosi:pt,repay:U,employerGosi:vt,net:yt}),U>0){let Q=U;const zt=P.filter(tt=>(tt.remainingBalance||0)>0&&(tt.empId===v||w&&tt.empName&&w.name&&(tt.empName.includes(w.name)||w.name.includes(tt.empName))));for(const tt of zt){if(Q<=0)break;const wt=Math.min(Q,tt.remainingBalance);await dt(D(z,`companies/${C}/employeeLoans`,tt.id),{paidAmount:At(wt),remainingBalance:At(-wt),updatedAt:Y()}),Q-=wt}}}if(r<=0&&g<=0)throw new Error("لا توجد مبالغ في هذا المسير");const I=f.find(u=>u.id===p)||{id:"EXP_SAL",code:"5-2-1",name:"رواتب وأجور"},B=f.find(u=>u.id===i)||{id:"EXP_ALLOW",code:"5-2-5",name:"بدلات الموظفين"},A=f.find(u=>u.code==="5-2-7")||{id:"REP_COMMISSIONS",code:"5-2-7",name:"مصروف عمولات المناديب"},V=f.find(u=>u.code==="5-2-5-1"||u.code==="5-2-7")||{id:"PR_BONUSES",code:"5-2-7",name:"مصروف حوافز ومكافآت الموظفين"},Z=f.find(u=>u.code==="1-1-5-4")||{id:"EMP_ADVANCES",code:"1-1-5-4",name:"سلف للموظفين والمناديب"},X=f.find(u=>u.code==="2-1-3"||u.code==="2-1-4")||{id:"GOSI_LIABILITY",code:"2-1-3",name:"التأمينات الاجتماعية المستحقة"},it=f.find(u=>u.code==="5-7"||u.code==="5-2-6")||{id:"GOSI_EXPENSE",code:"5-7",name:"التأمينات الاجتماعية — حصة صاحب العمل"},W=[];l+m>0&&W.push({accountId:p,accountCode:I?.code||"5-2-1",accountName:I?.name||"رواتب وأجور",debit:l+m,credit:0,note:`مصروف الرواتب الأساسية والإضافي لشهر ${t}`}),s>0&&W.push({accountId:i,accountCode:B?.code||"5-2-5",accountName:B?.name||"بدلات",debit:s,credit:0,note:`مصروف بدلات الموظفين لشهر ${t}`}),d>0&&W.push({accountId:A.id,accountCode:A.code,accountName:A.name,debit:d,credit:0,note:`مصروف عمولات مبيعات المناديب لشهر ${t}`}),c>0&&W.push({accountId:V.id,accountCode:V.code,accountName:V.name,debit:c,credit:0,note:`مصروف الحوافز والمكافآت للموظفين لشهر ${t}`}),$>0&&W.push({accountId:it.id,accountCode:it.code,accountName:it.name,debit:$,credit:0,note:`مصروف مساهمة الشركة في التأمينات الاجتماعية شهر ${t}`});for(const u of x){const v=h.find(O=>O.id===u.empId),{liabAcc:w}=mt(v,f);let M=w?.id||v?.accountId,H=w?.code||v?.accountCode||"",j=w?.name||(v?`مستحقات الموظف ${v.name}`:"");if(!M){const O=f.find(rt=>rt.code==="2-1-5")||{id:"ACCRUED_SALARIES",code:"2-1-5",name:"مستحقات الموظفين والمناديب"};M=O.id,H=O.code,j=O.name}const N=(u.basic||0)+(u.allowance||0)+(u.overtime||0);if(N>0&&W.push({accountId:M,accountCode:H,accountName:j,debit:0,credit:N,note:`استحقاق راتب وبدلات شهر ${t} للموظف ${u.empName}`}),u.bonus>0){const O=u.bonusDesc?`${u.bonusDesc} — ${u.empName}`:`إثبات مكافآت وحوافز شهر ${t} للموظف ${u.empName}`;W.push({accountId:M,accountCode:H,accountName:j,debit:0,credit:u.bonus,note:O})}}$>0&&W.push({accountId:X.id,accountCode:X.code,accountName:X.name,debit:0,credit:$,note:`التأمينات الاجتماعية المستحقة (حصة الشركة) لشهر ${t}`});const xt=`JE-PR-ACC-${t.replace("-","")}`;await ut({date:k(),description:`قيد استحقاق رواتب ومكافآت الموظفين والمناديب لشهر ${t}`,sourceType:"payroll_accrual",sourceId:t,lines:W,entryNumber:xt});const G=[];for(const u of x)if(u.repay>0){const v=h.find(U=>U.id===u.empId),{liabAcc:w,loanAcc:M}=mt(v,f);let H=w?.id||v?.accountId,j=w?.code||v?.accountCode||"",N=w?.name||(v?`مستحقات الموظف ${v.name}`:"");if(!H){const U=f.find(yt=>yt.code==="2-1-5")||{id:"ACCRUED_SALARIES",code:"2-1-5",name:"مستحقات الموظفين والمناديب"};H=U.id,j=U.code,N=U.name}G.push({accountId:H,accountCode:j,accountName:N,debit:u.repay,credit:0,note:`إقفال سلفة الموظف ${u.empName} فى المستحقات عن شهر ${t}`});const O=M?.id||Z.id,rt=M?.code||Z.code,pt=M?.name||Z.name;G.push({accountId:O,accountCode:rt,accountName:pt,debit:0,credit:u.repay,note:`إقفال سلفة الموظف ${u.empName} فى المستحقات عن شهر ${t}`})}for(const u of x)if(u.net>0){const v=h.find(N=>N.id===u.empId),{liabAcc:w}=mt(v,f);let M=w?.id||v?.accountId,H=w?.code||v?.accountCode||"",j=w?.name||(v?`مستحقات الموظف ${v.name}`:"");if(!M){const N=f.find(O=>O.code==="2-1-5")||{id:"ACCRUED_SALARIES",code:"2-1-5",name:"مستحقات الموظفين والمناديب"};M=N.id,H=N.code,j=N.name}G.push({accountId:M,accountCode:H,accountName:j,debit:u.net,credit:0,note:`صرف صافي راتب ومستحقات شهر ${t} للموظف ${u.empName}`})}for(const u of x){const v=h.find(N=>N.id===u.empId),{liabAcc:w}=mt(v,f);let M=w?.id||v?.accountId,H=w?.code||v?.accountCode||"",j=w?.name||(v?`مستحقات الموظف ${v.name}`:"");if(!M){const N=f.find(O=>O.code==="2-1-5")||{id:"ACCRUED_SALARIES",code:"2-1-5",name:"مستحقات الموظفين والمناديب"};M=N.id,H=N.code,j=N.name}u.gosi>0&&G.push({accountId:M,accountCode:H,accountName:j,debit:u.gosi,credit:0,note:`خصم حصة التأمينات الاجتماعية من راتب ${u.empName} شهر ${t}`}),u.deduct>0&&G.push({accountId:M,accountCode:H,accountName:j,debit:u.deduct,credit:0,note:`خصومات وغياب شهر ${t} للموظف ${u.empName}`})}let R="",et="",at="",ot=null;if(o==="cash"){const u=J.find(v=>v.id===e);R=u?.accountId,et=u?.code||"",at=u?.name||"",ot=D(z,`companies/${C}/cashBoxes`,e)}else{const u=K.find(v=>v.id===e);R=u?.accountId,et=u?.code||"",at=u?.bankName||"",ot=D(z,`companies/${C}/bankAccounts`,e)}const q=f.find(u=>u.id===R);r>0&&G.push({accountId:R,accountCode:q?.code||"",accountName:q?.name||"",debit:0,credit:r,note:`دفع وصرف مسير رواتب شهر ${t} من حساب ${at}`}),y>0&&G.push({accountId:X.id,accountCode:X.code,accountName:X.name,debit:0,credit:y,note:`التأمينات الاجتماعية المستقطعة من رواتب الموظفين لشهر ${t}`});const ct=x.reduce((u,v)=>u+(v.deduct||0),0);if(ct>0){const u=f.find(v=>v.code==="4-3"||v.code==="4-2"||v.type==="revenue")||I;G.push({accountId:u.id,accountCode:u.code,accountName:u.name,debit:0,credit:ct,note:`استقطاعات غياب وجزاءات من رواتب شهر ${t}`})}if(G.length>0){const u=`JE-PR-PAY-${t.replace("-","")}`;if(await ut({date:k(),description:`قيد صرف وتسوية مسير رواتب وإقفال السلف لشهر ${t}`,sourceType:"payroll_payment",sourceId:t,lines:G,entryNumber:u}),ot){const v=await st(ot);if(v.exists()){const w=parseFloat(v.data().balance||0);await dt(ot,{balance:w-r,updatedAt:Y()})}}}const nt=D(gt(z,`companies/${C}/payrolls`));await lt(nt,{month:t,date:k(),amount:r,employeeCount:x.length,method:o,sourceId:e,expenseAccId:p,expenseAccName:I?.name||"",items:x,notes:`مسير رواتب شهر ${t} المعتمد من شجرة الحسابات`,createdAt:Y()}),await Mt(S.expenses(),{date:k(),amount:r,accountId:p,accountName:"مصروف رواتب وأجور",method:o,sourceId:e,sourceName:o==="cash"?"صندوق":"بنك",notes:`صرف مسير رواتب شهر ${t}`}),showToast("✅ تم اعتماد مسير الرواتب وترحيل القيود والرواتب بنجاح","success"),closeModal("payroll-modal"),await switchHrTab("payroll")}catch(r){a.textContent=r.message,a.classList.remove("hidden")}finally{n.disabled=!1}};window.printEmployeePayslip=async(a,t,o,e,p,i,n,r,l,s,m="")=>{const c=(h||[]).find(B=>B.id===a)||{name:"الموظف المستحق"},d=(t||0)+(o||0)+(e||0)+(p||0),g=(i||0)+(n||0)+(r||0),y=l!==void 0?l:Math.max(0,d-g),$=typeof kt=="function"?kt(y):`${y} ريال سعودي`;let x={name:"شركة نظم الإمداد المتطورة",nameEn:"Modern Supply Systems Co.",crNumber:"7054969006",vatNumber:"314996148100003",phone:"0549141648",logoUrl:""};try{const B=localStorage.getItem("idham_company");B&&Object.assign(x,JSON.parse(B))}catch{}const E=`SAL-${c.code||c.id?.slice(-4)||"EMP"}-${s?.replace(/[^0-9]/g,"")||k().replace(/-/g,"")}`,L=`
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>سند صرف واستلام راتب — ${c.name} — ${s}</title>
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
          ${x.logoUrl?`<img src="${x.logoUrl}" alt="Logo" style="height:52px;max-width:100px;object-fit:contain;background:#fff;padding:2px;border-radius:6px;" />`:'<div style="font-size:28px;">🏢</div>'}
          <div>
            <div style="font-size:16px;font-weight:900;color:#fff;">${x.name}</div>
            <div style="font-size:10.5px;opacity:0.85;font-weight:600;color:#fff;">${x.nameEn}</div>
            <div style="font-size:9.5px;opacity:0.8;margin-top:2px;color:#fff;">
              <span>الهاتف: <strong>${x.phone}</strong></span> |
              <span>الرقم الضريبي: <strong>${x.vatNumber}</strong></span> |
              <span>سجل تجاري: <strong>${x.crNumber}</strong></span>
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
      <div class="sal-meta-card"><div class="sal-meta-label">رقم السند</div><div class="sal-meta-val mono" style="color:#047857;">${E}</div></div>
      <div class="sal-meta-card"><div class="sal-meta-label">تاريخ الصرف</div><div class="sal-meta-val mono">${k()}</div></div>
      <div class="sal-meta-card"><div class="sal-meta-label">شهر الاستحقاق</div><div class="sal-meta-val" style="color:#1d4ed8;">شهر ${s}</div></div>
      <div class="sal-meta-card"><div class="sal-meta-label">طريقة الصرف</div><div class="sal-meta-val" style="font-size:11px;">نقدي / تحويل بنكي</div></div>
    </div>

    <div class="sal-emp-box">
      <div class="sal-emp-grid">
        <div><div class="sal-emp-item-lbl">👤 اسم الموظف المستحق</div><div class="sal-emp-item-val" style="font-size:13.5px;color:#1e3a8a;">${c.name}</div></div>
        <div><div class="sal-emp-item-lbl">💼 المسمى الوظيفي</div><div class="sal-emp-item-val">${c.job||"موظف / مندوب"}</div></div>
        <div><div class="sal-emp-item-lbl">🆔 رقم الهوية / الإقامة</div><div class="sal-emp-item-val mono">${c.nid||"—"}</div></div>
        <div><div class="sal-emp-item-lbl">💳 الآيبان / الحساب</div><div class="sal-emp-item-val mono" style="font-size:10.5px;">${c.iban||"—"}</div></div>
      </div>
    </div>

    <div class="sal-breakdown-section">
      <div class="sal-panel earnings">
        <div class="sal-panel-head"><span>➕ مفردات الاستحقاقات والمكافآت</span><span style="font-size:10px;">(Earnings)</span></div>
        <table class="sal-items-table">
          <tbody>
            <tr><td><strong>الراتب الأساسي</strong></td><td class="mono font-bold" style="text-align:left;color:#047857;">+${b(t)} ر.س</td></tr>
            <tr><td><strong>البدلات الشهرية</strong></td><td class="mono font-bold" style="text-align:left;color:#047857;">+${b(o)} ر.س</td></tr>
            ${e?`<tr><td><strong>أجر ساعات إضافية</strong></td><td class="mono font-bold" style="text-align:left;color:#047857;">+${b(e)} ر.س</td></tr>`:""}
            ${p?`<tr><td><strong>${m||"مكافآت وحوافز تشجيعية"}</strong></td><td class="mono font-bold" style="text-align:left;color:#047857;">+${b(p)} ر.س</td></tr>`:""}
          </tbody>
        </table>
        <div class="sal-panel-foot"><span>إجمالي الاستحقاقات:</span><span class="mono font-bold">${b(d)} ر.س</span></div>
      </div>

      <div class="sal-panel deductions">
        <div class="sal-panel-head"><span>➖ مفردات الاستقطاعات والسلف</span><span style="font-size:10px;">(Deductions)</span></div>
        <table class="sal-items-table">
          <tbody>
            ${i?`<tr><td><strong>خصومات وغياب</strong></td><td class="mono font-bold" style="text-align:left;color:#b91c1c;">-${b(i)} ر.س</td></tr>`:""}
            ${n?`<tr><td><strong>تأمينات اجتماعية (GOSI)</strong></td><td class="mono font-bold" style="text-align:left;color:#b91c1c;">-${b(n)} ر.س</td></tr>`:""}
            ${r?`<tr><td><strong>إقفال وتسوية سلفة الموظف</strong></td><td class="mono font-bold" style="text-align:left;color:#b91c1c;">-${b(r)} ر.س</td></tr>`:""}
            ${g===0?'<tr><td style="color:#94a3b8;text-align:center;padding:12px;">لا توجد أي استقطاعات</td></tr>':""}
          </tbody>
        </table>
        <div class="sal-panel-foot"><span>إجمالي الاستقطاعات:</span><span class="mono font-bold">${b(g)} ر.س</span></div>
      </div>
    </div>

    <div class="sal-net-ribbon">
      <div><div style="font-size:11.5px;opacity:0.9;font-weight:700;">💰 صافي الراتب المنصرف للموظف</div><div style="font-size:9.5px;opacity:0.8;">Net Salary Payable</div></div>
      <div style="text-align:left;"><span class="sal-net-val">${b(y)}</span> <span style="font-size:13px;font-weight:700;margin-right:4px;">ريال سعودي</span></div>
    </div>

    <div class="sal-tafqeet-box">
      <strong>✍️ المبلغ كتابةً وتفقيطاً:</strong> <span style="color:#047857;font-weight:800;">فقط ${$} لا غير.</span>
    </div>

    <div class="sal-legal-box">
      <strong>📝 إقرار واستلام الموظف وبراءة ذمة:</strong>
      <p style="margin-top:2px;">
        أقر أنا الموظف الموضحة بياناتي أعلاه بأنني استلمت كامل صافي راتبي ومستحقاتي ومكافآتي عن شهر (<strong>${s}</strong>) الموضحة في هذا السند، ولا يحق لي المطالبة بأي مبالغ أخرى أو متأخرات عن هذه الفترة لدى الشركة، ويعد توقيعي أدناه إقراراً نهائياً بالاستلام وبراءة ذمة شاملة.
      </p>
    </div>

    <div class="sal-sigs">
      <div class="sal-sig-box" style="border:1.5px solid #2563eb;background:#f8fafc;">
        <div class="sal-sig-title" style="color:#1e3a8a;">✍️ توقيع واستلام الموظف</div>
        <div style="text-align:right;font-size:10px;color:#334155;margin-bottom:4px;">الاسم: <strong>${c.name}</strong></div>
        <div class="sal-sig-line">التوقيع / البصمة: ............................................</div>
      </div>
      <div class="sal-sig-box">
        <div class="sal-sig-title">💼 أمين الصندوق / المحاسب الصارف</div>
        <div style="text-align:right;font-size:10px;color:#334155;margin-bottom:4px;">الاسم: <strong>المحاسب المسؤول</strong></div>
        <div class="sal-sig-line">التوقيع: ............................................</div>
      </div>
      <div class="sal-sig-box">
        <div class="sal-sig-title">🏢 اعتماد الإدارة العامة والختم</div>
        <div style="text-align:right;font-size:10px;color:#334155;margin-bottom:4px;">الاعتماد: <strong>${x.name}</strong></div>
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
  `,I=window.open("","_blank");if(I)I.document.write(L),I.document.close(),setTimeout(()=>{I.focus(),I.print()},400);else{const B=document.getElementById("payslip-modal-body");B&&(B.innerHTML=L,openModal("payslip-modal"))}};window.viewPayrollDetails=a=>{const t=bt.find(e=>e.id===a);if(!t)return;const o=document.createElement("div");o.className="modal-overlay active",o.id="payroll-details-overlay",o.style.zIndex="1002",o.innerHTML=`
    <div class="modal modal-lg" style="max-width:90vw;"><div class="modal-header"><h3 class="modal-title">تفاصيل مسير رواتب شهر ${t.month}</h3><button class="modal-close" onclick="document.getElementById('payroll-details-overlay').remove()">×</button></div>
    <div class="modal-body" style="padding:16px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:16px; font-size:12px; background:var(--bg-2); padding:10px; border-radius:8px;">
        <div><strong>تاريخ الصرف:</strong> ${t.date}</div>
        <div><strong>طريقة الدفع:</strong> ${t.method==="cash"?"💵 نقدي":"🏦 تحويل بنكي"}</div>
        <div><strong>إجمالي صافي المسير:</strong> <span class="text-bad font-bold">${b(t.amount)}</span></div>
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
            ${t.items.map(e=>`
              <tr>
                <td><strong>${e.empName}</strong></td>
                <td class="mono">${b(e.basic)}</td>
                <td class="mono">${b(e.allowance)}</td>
                <td class="mono text-ok">+${b(e.overtime||0)}</td>
                <td class="mono text-ok">+${b(e.bonus||0)}${e.bonusDesc?`<br><small style="color:var(--text-3); font-size:9.5px;">${e.bonusDesc}</small>`:""}</td>
                <td class="mono text-bad">-${b(e.deduct||0)}</td>
                <td class="mono text-bad">-${b(e.gosi||0)}</td>
                <td class="mono text-bad font-bold">-${b(e.repay||0)}</td>
                <td class="font-bold text-ok mono">${b(e.net)}</td>
                <td>
                  <button class="btn btn-secondary sm" style="padding:2px 8px; font-size:10px; margin:0;" onclick="printEmployeePayslip('${e.empId}', ${e.basic}, ${e.allowance}, ${e.overtime||0}, ${e.bonus||0}, ${e.deduct||0}, ${e.gosi||0}, ${e.repay||0}, ${e.net}, '${t.month}', '${(e.bonusDesc||"").replace(/'/g,"\\'")}')">🖨️ قسيمة</button>
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
  `,o.onclick=e=>{e.target===o&&o.remove()},document.body.appendChild(o)};window.printPayrollSheet=a=>{const t=bt.find(e=>e.id===a);if(!t)return;const o=window.open("","_blank");o.document.write(`
    <html>
    <head>
      <title>مسير رواتب شهر ${t.month}</title>
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
        <div><strong>شهر الاستحقاق:</strong> ${t.month}</div>
        <div><strong>تاريخ الصرف:</strong> ${t.date}</div>
        <div><strong>طريقة الدفع:</strong> ${t.method==="cash"?"نقدي":"تحويل بنكي"}</div>
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
          ${t.items.map(e=>`
            <tr>
              <td><strong>${e.empName}</strong></td>
              <td class="mono">${b(e.basic)}</td>
              <td class="mono">${b(e.allowance)}</td>
              <td class="mono">${b(e.overtime||0)}</td>
              <td class="mono">${b(e.bonus||0)}</td>
              <td class="mono">${b(e.deduct||0)}</td>
              <td class="mono">${b(e.gosi||0)}</td>
              <td class="mono">${b(e.repay||0)}</td>
              <td class="mono"><strong>${b(e.net)} ر.س</strong></td>
            </tr>
          `).join("")}
          <tr style="background:#f5f5f5; font-weight:bold;">
            <td colspan="8">إجمالي رواتب المسير المعتمدة:</td>
            <td class="mono">${b(t.amount)} ر.س</td>
          </tr>
        </tbody>
      </table>

      <div class="footer-sigs">
        <div>إعداد القسم المالي: __________________</div>
        <div>اعتماد المدير العام: __________________</div>
      </div>
    </body>
    </html>
  `),o.document.close()};window.togglePrSource=()=>{const a=document.getElementById("pr-method").value,t=document.getElementById("pr-source-label"),o=document.getElementById("pr-source");o.innerHTML='<option value="">اختر...</option>',a==="cash"?(t.textContent="الصندوق *",o.innerHTML+=J.map(e=>`<option value="${e.id}">${e.name}</option>`).join("")):(t.textContent="الحساب البنكي *",o.innerHTML+=K.map(e=>`<option value="${e.id}">${e.bankName} - ${e.accountNumber}</option>`).join(""))};window.openDetailedEmployeePayslipModal=async a=>{const t=h.find(c=>c.id===a);if(!t)return;const o=t.salary||0,e=t.allowance||0,p=o/240,i=o/30,r=P.filter(c=>(c.remainingBalance||0)>0&&(c.empId===t.id||c.empName&&t.name&&(c.empName.includes(t.name)||t.name.includes(c.empName)))).reduce((c,d)=>c+(d.remainingBalance||0),0),l=t.nationality==="saudi"?(o+e)*.0975:0,s=k().slice(0,7),m=document.createElement("div");m.className="modal-overlay active",m.id="emp-payslip-statement-overlay",m.style.zIndex="1005",m.innerHTML=`
    <div class="modal modal-lg" style="max-width:750px; background:#f8fafc; border-radius:18px;">
      <div class="modal-header" style="background:linear-gradient(135deg, #1e293b, #0f172a); color:#fff; padding:16px 24px; border-top-left-radius:18px; border-top-right-radius:18px;">
        <div>
          <h3 class="modal-title" style="color:#fff; font-size:16px; margin:0;">📄 كشف مسير مفصل وقسيمة راتب الموظف</h3>
          <small style="color:#94a3b8; font-weight:600;">${t.name} — ${t.job||"موظف"} (شهر ${s})</small>
        </div>
        <button class="modal-close" style="color:#fff;" onclick="document.getElementById('emp-payslip-statement-overlay').remove()">×</button>
      </div>

      <div class="modal-body" style="padding:20px;">
        <!-- Employee Contract Specs KPI -->
        <div class="grid-4 gap-12 mb-16">
          <div style="background:#fff; border:1px solid #e2e8f0; padding:12px; border-radius:12px; text-align:center;">
            <div style="font-size:10px; font-weight:700; color:#64748b;">الراتب الأساسي</div>
            <div class="mono font-bold" style="font-size:15px; color:#0f172a;">${b(o)}</div>
          </div>
          <div style="background:#fff; border:1px solid #e2e8f0; padding:12px; border-radius:12px; text-align:center;">
            <div style="font-size:10px; font-weight:700; color:#64748b;">إجمالي البدلات</div>
            <div class="mono font-bold" style="font-size:15px; color:#0f172a;">${b(e)}</div>
          </div>
          <div style="background:#fff; border:1px solid #e2e8f0; padding:12px; border-radius:12px; text-align:center;">
            <div style="font-size:10px; font-weight:700; color:#64748b;">أجر اليوم الفعلي</div>
            <div class="mono font-bold" style="font-size:15px; color:#2563eb;">${b(i)}</div>
          </div>
          <div style="background:#fff; border:1px solid #e2e8f0; padding:12px; border-radius:12px; text-align:center;">
            <div style="font-size:10px; font-weight:700; color:#64748b;">أجر الساعة الأساسي</div>
            <div class="mono font-bold" style="font-size:15px; color:#2563eb;">${b(p)}</div>
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
                <td class="mono font-bold text-ok">${b(o)}</td>
              </tr>
              <tr>
                <td><strong>➕ البدلات الشهرية</strong></td>
                <td><small class="text-muted">سكن + مواصلات + طعام</small></td>
                <td class="mono font-bold text-ok">${b(e)}</td>
              </tr>
              <tr>
                <td><strong>➕ أجر الساعات الإضافية (Overtime)</strong></td>
                <td><small class="text-muted">المادة 107 (150% × أجر الساعة)</small></td>
                <td class="mono font-bold text-ok">+0.00 ر.س</td>
              </tr>
              <tr>
                <td><strong>➖ التأمينات الاجتماعية (GOSI)</strong></td>
                <td><small class="text-muted">${t.nationality==="saudi"?"خصم الموظف السعودي (9.75%)":"غير سعودي (0%)"}</small></td>
                <td class="mono font-bold text-bad">-${b(l)}</td>
              </tr>
              <tr>
                <td><strong>➖ السلف القائمة المستحقة</strong></td>
                <td><small class="text-muted">رصيد السلف القائمة المتبقية</small></td>
                <td class="mono font-bold text-bad">-${b(r)}</td>
              </tr>
            </tbody>
            <tfoot style="background:#f8fafc; font-weight:bold;">
              <tr>
                <td colspan="2" style="font-size:13px;">🟢 تقدير صافي الراتب المستحق للصرف:</td>
                <td class="mono text-bad" style="font-size:16px;">${b(o+e-l)} ر.س</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div class="modal-footer" style="background:#f1f5f9; padding:14px 24px; display:flex; justify-content:space-between; align-items:center;">
        <button class="btn btn-secondary" onclick="document.getElementById('emp-payslip-statement-overlay').remove()">إغلاق</button>
        <button class="btn btn-primary" onclick="printEmployeePayslip('${t.id}', ${o}, ${e}, 0, 0, 0, ${l}, ${r>0?Math.min(r,(o+e)*.25):0}, ${o+e-l}, '${s}')">🖨️ طباعة قسيمة الراتب الرسمية</button>
      </div>
    </div>
  `,m.onclick=c=>{c.target===m&&m.remove()},document.body.appendChild(m)};export{de as render};
