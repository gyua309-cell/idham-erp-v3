import{t as E,g as D,a as L,f as u,d as k,C as B,u as $t,o as Et,r as St,e as Z}from"./index-DgsnACKa.js";import{getDocs as Bt,orderBy as st,doc as A,getDoc as Y,setDoc as U,serverTimestamp as H,collection as et,deleteDoc as kt,updateDoc as K,increment as It}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import{u as Nt,s as Dt,d as zt,e as Ht}from"./coa-connector-DAdMHvuF.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let v=[],h=[],j=[],R=[],N=[],tt=[],bt=[],yt=[];async function oe(a,t){a.innerHTML=`
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
          <div class="form-group"><label>تاريخ التعيين</label><input type="date" id="emp-date" class="input" value="${E()}" /></div>
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
          <div class="form-group"><label>تاريخ الصرف *</label><input type="date" id="loan-date" class="input" value="${E()}" /></div>
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
          <div class="form-group"><label>تاريخ البدء *</label><input type="date" id="leave-start" class="input" value="${E()}" /></div>
          <div class="form-group"><label>تاريخ الانتهاء *</label><input type="date" id="leave-end" class="input" value="${E()}" /></div>
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
            <input type="date" id="eos-date" class="input" value="${E()}" onchange="calculateEosIndemnity()" />
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
          <div class="form-group"><label>شهر الاستحقاق</label><input type="month" id="pr-month" class="input" value="${E().slice(0,7)}" onchange="onPayrollMonthChange()" /></div>
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
  `,await switchHrTab("employees")}window.switchHrTab=async a=>{document.querySelectorAll(".hr-tab-btn").forEach(c=>c.classList.remove("active"));const t=document.getElementById(`btn-tab-${a}`);t&&t.classList.add("active");const o=document.getElementById("hr-action-btns"),e=document.getElementById("hr-main-content");e&&(e.innerHTML='<div style="text-align:center; padding:60px;"><span class="spin" style="margin:0 auto;"></span></div>',await jt(),await Promise.all([Rt(),Ft(),_t(),Pt(),Ot(),qt()]),a==="employees"?(o.innerHTML='<button class="btn btn-primary" onclick="openEmpModal()">+ إضافة موظف</button>',Gt(e)):a==="leaves"?(o.innerHTML='<button class="btn btn-primary" onclick="openLeaveModal()">🌴 تسجيل إجازة جديدة</button>',Yt(e)):a==="attendance"?(o.innerHTML="",At(e)):a==="loans"?(o.innerHTML='<button class="btn btn-primary" onclick="openLoanModal()">💸 صرف سلفة جديدة</button>',Lt(e)):a==="payroll"?(o.innerHTML='<button class="btn btn-primary" onclick="openPayrollModal()">💳 إعداد مسير رواتب</button>',Kt(e)):(o.innerHTML='<button class="btn btn-primary" onclick="openEosModal()">🎓 تصفية موظف</button>',Ut(e)))};async function jt(){v=await D(L.employees()),v.sort((a,t)=>(a.name||"").localeCompare(t.name||""))}async function Rt(){try{(!v||!v.length)&&(v=await D(L.employees()),v.sort((o,e)=>(o.name||"").localeCompare(e.name||"")));const t=(await Bt(L.employeeLoans())).docs.map(o=>({id:o.id,...o.data()}));t.forEach(o=>{o.empName=o.empName||o.employeeName||"مصطفى الاسيوطى",o.remainingBalance=o.remainingBalance??o.remainingAmount??o.amount-(o.paidAmount||0)}),N=t,N.sort((o,e)=>(e.date||"").localeCompare(o.date||""))}catch(a){console.warn("Failed to fetch loans:",a)}}async function Ft(){tt=await D(L.payrolls(),[st("month","desc")])}async function _t(){bt=await D(L.employeeLeaves(),[st("startDate","desc")])}async function Pt(){await D(L.employeeAttendance(),[st("month","desc")])}async function Ot(){yt=await D(L.employeeSettlements(),[st("date","desc")])}async function qt(){h=await D(L.chartOfAccounts()),j=await D(L.cashBoxes()),R=await D(L.bankAccounts())}function Gt(a){const t=[],o=new Date,e=30*24*60*60*1e3;let c=0,l=0;v.forEach(s=>{if(s.status==="active"&&(c++,l+=(s.salary||0)+(s.allowance||0)),s.status==="active"){if(s.nidExpiry){const b=new Date(s.nidExpiry)-o;b>0&&b<e?t.push(`⚠️ إقامة/هوية الموظف <strong>${s.name}</strong> تنتهي قريباً بتاريخ ${s.nidExpiry}`):b<=0&&t.push(`🚨 إقامة/هوية الموظف <strong>${s.name}</strong> منتهية الصلاحية منذ ${s.nidExpiry}`)}if(s.passportExpiry){const b=new Date(s.passportExpiry)-o;b>0&&b<e?t.push(`⚠️ جواز سفر الموظف <strong>${s.name}</strong> ينتهي قريباً بتاريخ ${s.passportExpiry}`):b<=0&&t.push(`🚨 جواز سفر الموظف <strong>${s.name}</strong> منتهية الصلاحية منذ ${s.passportExpiry}`)}}});let m="";t.length>0&&(m=`
      <div class="hr-alert-box">
        <div style="font-size:20px;">🚨</div>
        <div style="flex:1; display:flex; flex-direction:column; gap:4px;">
          ${t.map(s=>`<div>${s}</div>`).join("")}
        </div>
      </div>
    `);const i=c>0?l/c:0,n=v.filter(s=>s.nationality==="saudi").length,p=v.length,r=p>0?(n/p*100).toFixed(1):"0.0",d=`
    <!-- Executive HR KPIs Grid -->
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap:12px; margin-bottom:20px;">
      <div class="stats-card">
        <span class="stats-title">👥 إجمالي القوة العاملة</span>
        <span class="stats-val text-brand">${v.length} موظف</span>
      </div>
      <div class="stats-card" style="background:linear-gradient(135deg, rgba(34,197,94,0.06), rgba(248,250,252,0.95)); border:1.5px solid rgba(34,197,94,0.25);">
        <span class="stats-title">🇸🇦 نسبة السعودة (نطاقات)</span>
        <span class="stats-val text-ok">${r}% <small style="font-size:11px; font-weight:700;">(${n} سعودي)</small></span>
      </div>
      <div class="stats-card">
        <span class="stats-title">✅ الموظفون النشطون</span>
        <span class="stats-val text-ok">${c} موظف</span>
      </div>
      <div class="stats-card">
        <span class="stats-title">💼 متوسط الرواتب الإجمالية</span>
        <span class="stats-val text-brand">${u(i)}</span>
      </div>
      <div class="stats-card">
        <span class="stats-title">📈 التزام الرواتب شهرياً</span>
        <span class="stats-val text-bad">${u(l)}</span>
      </div>
    </div>
  `;if(!v.length){a.innerHTML=d+m+`
      <div class="card" style="text-align:center; padding:60px; color:var(--text-3);">
        <div style="font-size:40px; margin-bottom:12px;">👤</div>
        <div style="font-weight:700; font-size:15px; color:var(--text-1); margin-bottom:4px;">لا يوجد موظفين مسجلين حالياً</div>
        <div>انقر على زر "إضافة موظف" لإنشاء ملف الموظف الأول في نظام الموارد البشرية.</div>
      </div>`;return}a.innerHTML=d+m+`
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
            ${v.map(s=>{let b='<span class="badge" style="background:rgba(34,197,94,0.1); color:#22c55e;">نشط</span>';s.status==="suspended"&&(b='<span class="badge" style="background:rgba(245,158,11,0.1); color:#f59e0b;">موقوف</span>'),s.status==="resigned"&&(b='<span class="badge" style="background:rgba(100,116,139,0.1); color:#64748b;">مستقيل</span>');let $="";if(s.nidExpiry){const g=Math.ceil((new Date(s.nidExpiry)-new Date)/864e5);g<=0?$='<br><span class="badge" style="background:rgba(239,68,68,0.12); color:#dc2626; font-size:9.5px; font-weight:800; padding:1px 6px;">🚨 منتهية!</span>':g<=30&&($=`<br><span class="badge" style="background:rgba(245,158,11,0.12); color:#d97706; font-size:9.5px; font-weight:800; padding:1px 6px;">⚠️ تنتهي خلال ${g} يوم</span>`)}return`
              <tr>
                <td><strong class="clickable-name" onclick="viewEmpDocumentDetails('${s.id}')">${s.name}</strong></td>
                <td>${s.job||"—"}</td>
                <td>
                  <span class="mono">${s.nid||"—"}</span><br>
                  <small style="color:var(--text-3); font-size:10px;">انتهاء: ${s.nidExpiry||"—"}</small>${$}
                </td>
                <td class="mono font-bold">${u(s.salary)}</td>
                <td class="mono">${u(s.allowance||0)}</td>
                <td>${s.nationality==="saudi"?"🇸🇦 سعودي":"🌍 مقيم"}</td>
                <td>
                  <span style="font-size:12px;">${s.bankName||"—"}</span><br>
                  <small class="mono" style="color:var(--text-3); font-size:10px;">${s.iban||"—"}</small>
                </td>
                <td>${b}</td>
                <td>
                  <button class="btn btn-icon sm btn-ghost text-brand" onclick="openDetailedEmployeePayslipModal('${s.id}')" title="كشف حساب ومسير تفصيلي للموظف">📄</button>
                  <button class="btn btn-icon sm btn-ghost" onclick="editEmp('${s.id}')" title="تعديل البيانات">✏️</button>
                  <button class="btn btn-icon sm btn-ghost text-bad" onclick="delEmp('${s.id}','${s.name}')" title="حذف الموظف">🗑️</button>
                </td>
              </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function Yt(a){if(!bt.length){a.innerHTML=`
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
            ${bt.map(t=>{let o="سنوية";t.type==="sick"&&(o="🤒 مرضية"),t.type==="unpaid"&&(o="💸 بدون راتب"),t.type==="emergency"&&(o="🚨 اضطرارية");const e=new Date(t.startDate),c=new Date(t.endDate),l=Math.round((c-e)/(24*60*60*1e3))+1;return`
              <tr>
                <td><strong>${t.empName}</strong></td>
                <td>${o}</td>
                <td class="mono">${t.startDate}</td>
                <td class="mono">${t.endDate}</td>
                <td class="mono font-bold">${l} أيام</td>
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
  `}let nt="daily";function At(a){E().slice(0,7),E(),a.innerHTML=`
    <!-- Top Mode Selector Tabs -->
    <div class="card mb-16" style="padding:12px 18px; background:linear-gradient(135deg, rgba(91,127,255,0.06), rgba(248,250,252,0.95)); border:1.5px solid rgba(91,127,255,0.2);">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; gap:8px;">
          <button class="btn ${nt==="daily"?"btn-primary":"btn-secondary"} sm" onclick="switchAttendanceMode('daily')">📅 سجل الحضور اليومي والشفتات</button>
          <button class="btn ${nt==="monthly"?"btn-primary":"btn-secondary"} sm" onclick="switchAttendanceMode('monthly')">📊 التجميع والإعداد الشهري للمسير</button>
        </div>
        <div id="att-top-controls">
          <!-- Populated dynamically based on active mode -->
        </div>
      </div>
    </div>

    <!-- Main Content Container -->
    <div id="att-mode-content"></div>
  `,Jt()}window.switchAttendanceMode=a=>{nt=a;const t=document.getElementById("hr-main-content");t&&At(t)};function Jt(){const a=document.getElementById("att-mode-content"),t=document.getElementById("att-top-controls");if(a)if(v.filter(o=>o.status==="active"),nt==="daily"){const o=E();t.innerHTML=`
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
    `,loadDailyAttendanceLog()}else{const o=E().slice(0,7);t.innerHTML=`
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
    `,loadAttendanceForMonth()}}window.loadDailyAttendanceLog=async()=>{const a=document.getElementById("daily-att-date"),t=document.getElementById("daily-att-tbody");if(!t||!a)return;const o=a.value||E();t.innerHTML='<tr><td colspan="8" style="text-align:center; padding:20px;"><span class="spin"></span> جاري تحميل سجل الحضور لهذا اليوم…</td></tr>';const e=v.filter(i=>i.status==="active"),c=A(k,`companies/${B}/dailyAttendance`,o),l=await Y(c),m=l.exists()?l.data().items||[]:[];t.innerHTML=e.map(i=>{const n=m.find(p=>p.empId===i.id)||{status:"present",checkIn:"08:00",checkOut:"17:00",lateMins:0,overtimeHours:0,notes:""};return`
      <tr class="daily-att-row" data-id="${i.id}">
        <td><strong style="color:var(--text-1);">${i.name}</strong></td>
        <td><small style="color:var(--text-3); font-weight:600;">${i.job||"—"}</small></td>
        <td>
          <select class="input daily-status" style="height:28px; padding:2px; font-size:11px; font-weight:700;" onchange="recalculateDailyRow('${i.id}')">
            <option value="present" ${n.status==="present"?"selected":""}>🟢 حاضر</option>
            <option value="late" ${n.status==="late"?"selected":""}>🟡 متأخر</option>
            <option value="absent" ${n.status==="absent"?"selected":""}>🔴 غائب</option>
            <option value="leave" ${n.status==="leave"?"selected":""}>🌴 إجازة</option>
            <option value="field" ${n.status==="field"?"selected":""}>🚚 مهمة ميدانية</option>
          </select>
        </td>
        <td>
          <input type="time" class="input mono daily-in" value="${n.checkIn||"08:00"}" style="height:28px; padding:2px; font-size:11px;" onchange="recalculateDailyRow('${i.id}')" />
        </td>
        <td>
          <input type="time" class="input mono daily-out" value="${n.checkOut||"17:00"}" style="height:28px; padding:2px; font-size:11px;" onchange="recalculateDailyRow('${i.id}')" />
        </td>
        <td class="mono font-bold text-bad daily-late-txt" id="daily-late-${i.id}">${n.lateMins||0} دقيقة</td>
        <td class="mono font-bold text-ok daily-ot-txt" id="daily-ot-${i.id}">${n.overtimeHours||0} ساعة</td>
        <td>
          <input type="text" class="input daily-notes" value="${n.notes||""}" placeholder="ملاحظات..." style="height:28px; padding:2px; font-size:11px;" />
        </td>
      </tr>
    `}).join("")};window.recalculateDailyRow=a=>{const t=document.querySelector(`.daily-att-row[data-id="${a}"]`);if(!t)return;const o=t.querySelector(".daily-status").value,e=t.querySelector(".daily-in").value,c=t.querySelector(".daily-out").value,l=document.getElementById(`daily-late-${a}`),m=document.getElementById(`daily-ot-${a}`);if(o==="absent"||o==="leave"){l.textContent="0 دقيقة",m.textContent="0 ساعة";return}let i=0;if(e){const[p,r]=e.split(":").map(Number),d=p*60+r,s=8*60+15;d>s&&(i=d-8*60)}let n=0;if(c){const[p,r]=c.split(":").map(Number),d=p*60+r,s=17*60;d>s&&(n=parseFloat(((d-s)/60).toFixed(1)))}l.textContent=`${i} دقيقة`,m.textContent=`${n} ساعة`};window.saveDailyAttendanceLog=async()=>{const a=document.getElementById("daily-att-date"),t=document.getElementById("save-daily-att-btn");if(!a||!t)return;const o=a.value||E();t.disabled=!0,t.textContent="جاري الحفظ…";try{const e=[];document.querySelectorAll(".daily-att-row").forEach(l=>{const m=l.dataset.id,i=v.find(x=>x.id===m),n=l.querySelector(".daily-status").value,p=l.querySelector(".daily-in").value,r=l.querySelector(".daily-out").value,d=l.querySelector(".daily-notes").value,s=document.getElementById(`daily-late-${m}`)?.textContent||"0",b=document.getElementById(`daily-ot-${m}`)?.textContent||"0",$=parseInt(s)||0,g=parseFloat(b)||0;e.push({empId:m,empName:i?i.name:"",status:n,checkIn:p,checkOut:r,lateMins:$,overtimeHours:g,notes:d})});const c=A(k,`companies/${B}/dailyAttendance`,o);await U(c,{date:o,items:e,updatedAt:H()}),showToast(`✅ تم حفظ سجل حضور الموظفين لليوم (${o}) بنجاح`,"success")}catch(e){showToast(e.message,"error")}finally{t.disabled=!1,t.textContent="💾 حفظ حضور اليوم"}};window.loadAttendanceForMonth=async()=>{const a=document.getElementById("att-selected-month"),t=document.getElementById("att-tbody");if(!t||!a)return;const o=a.value||E().slice(0,7);t.innerHTML='<tr><td colspan="7" style="text-align:center; padding:20px;"><span class="spin"></span> جاري تحميل سجلات الحضور الشهرية…</td></tr>';const e=v.filter(m=>m.status==="active"),c=A(k,`companies/${B}/employeeAttendance`,o),l=await Y(c);if(l.exists()){const m=l.data().items||[];t.innerHTML=e.map(i=>{const n=m.find(d=>d.empId===i.id)||{absentDays:0,overtimeHours:0,lateMins:0},r=(i.salary||0)/240*(n.overtimeHours||0)*1.5;return`
        <tr class="att-row" data-id="${i.id}">
          <td><strong>${i.name}</strong></td>
          <td><small style="color:var(--text-3); font-weight:600;">${i.job||"—"}</small></td>
          <td class="mono font-bold">${u(i.salary)}</td>
          <td><input type="number" class="input mono att-absent" value="${n.absentDays||0}" min="0" max="30" step="0.5" style="width:80px; height:28px;" /></td>
          <td><input type="number" class="input mono att-overtime" value="${n.overtimeHours||0}" min="0" step="0.5" style="width:80px; height:28px;" /></td>
          <td><input type="number" class="input mono att-late" value="${n.lateMins||0}" min="0" step="1" style="width:80px; height:28px;" /></td>
          <td class="mono font-bold text-ok">${u(r)}</td>
        </tr>
      `}).join("")}else t.innerHTML=e.map(m=>`
      <tr class="att-row" data-id="${m.id}">
        <td><strong>${m.name}</strong></td>
        <td><small style="color:var(--text-3); font-weight:600;">${m.job||"—"}</small></td>
        <td class="mono font-bold">${u(m.salary)}</td>
        <td><input type="number" class="input mono att-absent" value="0" min="0" max="30" step="0.5" style="width:80px; height:28px;" /></td>
        <td><input type="number" class="input mono att-overtime" value="0" min="0" step="0.5" style="width:80px; height:28px;" /></td>
        <td><input type="number" class="input mono att-late" value="0" min="0" step="1" style="width:80px; height:28px;" /></td>
        <td class="mono font-bold text-ok">0.00 ر.س</td>
      </tr>
    `).join("")};window.saveAttendanceLog=async()=>{const a=document.getElementById("att-selected-month"),t=document.getElementById("save-att-btn");if(!a||!t)return;const o=a.value||E().slice(0,7);t.disabled=!0,t.textContent="جاري الحفظ…";try{const e=[];document.querySelectorAll(".att-row").forEach(l=>{const m=l.dataset.id,i=v.find(d=>d.id===m),n=parseFloat(l.querySelector(".att-absent").value)||0,p=parseFloat(l.querySelector(".att-overtime").value)||0,r=parseInt(l.querySelector(".att-late")?.value)||0;e.push({empId:m,empName:i?i.name:"",absentDays:n,overtimeHours:p,lateMins:r})});const c=A(k,`companies/${B}/employeeAttendance`,o);await U(c,{month:o,items:e,updatedAt:H()}),showToast(`✅ تم حفظ سجل حضور الموظفين المعتمد لشهر (${o}) بنجاح`,"success")}catch(e){showToast(e.message,"error")}finally{t.disabled=!1,t.textContent="⏱️ حفظ واعتماد السجل الشهري"}};window.onPayrollMonthChange=async()=>{const a=document.getElementById("pr-month").value;if(!a)return;const t=A(k,`companies/${B}/employeeAttendance`,a),o=await Y(t);if(o.exists()){const e=o.data().items||[];showToast(`📝 تم اكتشاف سجل حضور لشهر ${a} وتعبئة الحقول تلقائياً.`,"info"),document.querySelectorAll(".pr-row").forEach(c=>{const l=c.dataset.id,m=v.find(x=>x.id===l),i=e.find(x=>x.empId===l)||{absentDays:0,overtimeHours:0,lateMins:0},n=c.querySelector(".pr-deduct"),p=c.querySelector(".pr-overtime"),r=m.salary||0,d=r/240,s=d*(i.overtimeHours||0)*1.5,b=r/30*(i.absentDays||0),$=(i.lateMins||0)*(d/60),g=b+$;p&&(p.value=s.toFixed(2)),n&&(n.value=g.toFixed(2)),calculateRowNet(l,r,m.allowance||0)})}};let C="all";window.filterLoansByStatus=a=>{C=a;const t=document.getElementById("hr-main-content");t&&Lt(t)};function Lt(a){let t=N;C==="active"?t=N.filter(n=>(n.remainingBalance||0)>0):C==="paid"&&(t=N.filter(n=>(n.remainingBalance||0)<=0));const o=N.reduce((n,p)=>n+(p.remainingBalance||0),0),e=N.reduce((n,p)=>n+(p.paidAmount||0),0),c=N.reduce((n,p)=>n+(p.amount||0),0),l=N.filter(n=>(n.remainingBalance||0)>0).length,m=N.filter(n=>(n.remainingBalance||0)<=0).length;let i="";t.length?i=`
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
            ${t.map(n=>{let p='<span class="badge" style="background:rgba(239,68,68,0.12); color:#dc2626; font-weight:800; border:1px solid rgba(239,68,68,0.25);">قائمة</span>';return n.remainingBalance<=0&&(p='<span class="badge" style="background:rgba(34,197,94,0.12); color:#16a34a; font-weight:800; border:1px solid rgba(34,197,94,0.25);">مسددة بالكامل</span>'),`
              <tr>
                <td class="mono font-bold" style="font-size:12.5px;">${n.date}</td>
                <td><strong style="color:var(--text-1);">${n.empName}</strong></td>
                <td class="mono font-bold">${u(n.amount)}</td>
                <td class="mono text-ok font-bold">${u(n.paidAmount||0)}</td>
                <td class="mono text-bad font-bold" style="font-size:13.5px;">${u(n.remainingBalance)}</td>
                <td>${n.method==="cash"?"💵 نقدي":n.method==="journal"?"📑 قيد يومية":"🏦 تحويل بنكي"}</td>
                <td>${p}</td>
                <td><small style="color:var(--text-2);font-weight:600;">${n.notes||"—"}</small></td>
                <td>
                  <button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteLoan('${n.id}','${n.empName}',${n.amount})" title="حذف / استبعاد من السلف">🗑️</button>
                </td>
              </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    `:i=`<div style="text-align:center; padding:40px; color:var(--text-3);">
      <div style="font-size:32px; margin-bottom:8px;">🔍</div>
      <div style="font-weight:700;">لا توجد سلف ضمن التصفية المختارة (${C==="active"?"السلف القائمة":C==="paid"?"المسددة بالكامل":"الكل"}).</div>
      <button class="btn btn-secondary sm" style="margin-top:12px;" onclick="filterLoansByStatus('all')">عرض كافة السلف</button>
    </div>`,a.innerHTML=`
    <!-- Summary KPIs (Interactive Filter Cards - Outstanding Balance FIRST) -->
    <div class="grid-3 gap-16 mb-20">
      <!-- 1. ACTIVE OUTSTANDING LOANS (PROMINENT FIRST CARD ON RIGHT) -->
      <div class="stats-card ${C==="active"?"active-kpi":""}" onclick="filterLoansByStatus('active')" style="cursor:pointer; background:linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02)); border:1.5px solid rgba(239,68,68,0.3); border-radius:16px; padding:18px; transition:all 0.2s ease;" title="انقر لتصفية السلف القائمة المتخلفة فقط (600.00 ر.س)">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span class="stats-title" style="font-weight:800; color:#dc2626;">⚠️ صافي السلف القائمة (المستحقة)</span>
          <span class="badge sm" style="font-size:10px; background:${C==="active"?"#dc2626":"rgba(239,68,68,0.15)"}; color:${C==="active"?"#fff":"#dc2626"}; font-weight:800;">${C==="active"?"نشط 🎯":`${l} قائمة 🔍`}</span>
        </div>
        <span class="stats-val text-bad" style="font-size:24px; font-weight:900;">${u(o)}</span>
      </div>

      <!-- 2. REPAID LOANS (MIDDLE CARD) -->
      <div class="stats-card ${C==="paid"?"active-kpi":""}" onclick="filterLoansByStatus('paid')" style="cursor:pointer; background:linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02)); border:1.5px solid rgba(34,197,94,0.3); border-radius:16px; padding:18px; transition:all 0.2s ease;" title="انقر لتصفية السلف المسددة بالكامل فقط (500.00 ر.س)">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span class="stats-title" style="font-weight:800; color:#16a34a;">✅ إجمالي المبالغ المستردة</span>
          <span class="badge sm" style="font-size:10px; background:${C==="paid"?"#16a34a":"rgba(34,197,94,0.15)"}; color:${C==="paid"?"#fff":"#16a34a"}; font-weight:800;">${C==="paid"?"نشط 🎯":`${m} مسددة 🔍`}</span>
        </div>
        <span class="stats-val text-ok" style="font-size:24px; font-weight:900;">${u(e)}</span>
      </div>

      <!-- 3. TOTAL HISTORICAL DISBURSED LOANS (LEFT CARD) -->
      <div class="stats-card ${C==="all"?"active-kpi":""}" onclick="filterLoansByStatus('all')" style="cursor:pointer; background:linear-gradient(135deg, rgba(91,127,255,0.08), rgba(91,127,255,0.02)); border:1.5px solid rgba(91,127,255,0.3); border-radius:16px; padding:18px; transition:all 0.2s ease;" title="انقر لتصفية كافة السلف التراكمية">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span class="stats-title" style="font-weight:800; color:var(--brand);">💰 إجمالي السلف المصروفة (تاريخياً)</span>
          <span class="badge sm" style="font-size:10px; background:${C==="all"?"var(--brand)":"rgba(91,127,255,0.15)"}; color:${C==="all"?"#fff":"var(--brand)"}; font-weight:800;">${C==="all"?"عرض الكل 🎯":`${N.length} سلفة 🔍`}</span>
        </div>
        <span class="stats-val text-brand" style="font-size:24px; font-weight:900;">${u(c)}</span>
      </div>
    </div>

    ${C!=="all"?`
      <div class="flex items-center justify-between mb-16" style="padding:10px 16px; background:var(--bg-2); border-radius:10px; border:1px solid var(--border-soft);">
        <span style="font-size:13px; font-weight:700;">🔍 تصفية الجدول حالياً: <strong>${C==="active"?"السلف القائمة فقط":"السلف المسددة بالكامل فقط"}</strong> (${t.length} سجل)</span>
        <button class="btn btn-secondary sm" onclick="filterLoansByStatus('all')">✕ إزالة التصفية (عرض الكل)</button>
      </div>
    `:""}

    <div class="card">
      ${i}
    </div>
  `}function Kt(a){if(!tt.length){a.innerHTML=`
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
            ${tt.map(t=>`
              <tr>
                <td><strong>${t.month}</strong></td>
                <td class="mono">${t.date}</td>
                <td>${t.method==="cash"?"💵 نقدي":"🏦 بنك"}</td>
                <td>${t.employeeCount} موظف</td>
                <td class="mono font-bold text-bad">${u(t.amount)}</td>
                <td><small>${t.expenseAccName||"—"}</small></td>
                <td><small style="color:var(--text-3);">${t.notes||"—"}</small></td>
                <td>
                  <button class="btn btn-secondary sm" onclick="viewPayrollDetails('${t.id}')">📂 عرض التفاصيل</button>
                  <button class="btn btn-primary sm" onclick="printPayrollSheet('${t.id}')">🖨️ طباعة المسير</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function Ut(a){if(!yt.length){a.innerHTML=`
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
            ${yt.map(t=>`
              <tr>
                <td class="mono">${t.date}</td>
                <td><strong>${t.empName}</strong></td>
                <td>${t.reason==="resignation"?"استقالة":"إنهاء عقد / فصل"}</td>
                <td class="mono font-bold text-bad">${u(t.indemnityAmount)}</td>
                <td>${t.method==="cash"?"💵 نقدي":"🏦 بنك"}</td>
                <td><small style="color:var(--text-3);">${t.notes||"—"}</small></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.openEmpModal=(a=null)=>{document.getElementById("emp-modal-title").textContent=a?"تعديل موظف":"إضافة موظف",document.getElementById("emp-id").value=a?.id||"",document.getElementById("emp-name").value=a?.name||"",document.getElementById("emp-job").value=a?.job||"",document.getElementById("emp-nid").value=a?.nid||"",document.getElementById("emp-nid-expiry").value=a?.nidExpiry||"",document.getElementById("emp-date").value=a?.date||E(),document.getElementById("emp-passport").value=a?.passportNo||"",document.getElementById("emp-passport-expiry").value=a?.passportExpiry||"",document.getElementById("emp-gosi-number").value=a?.gosiNumber||"",document.getElementById("emp-salary").value=a?.salary||"",document.getElementById("emp-allowance").value=a?.allowance||0,document.getElementById("emp-status").value=a?.status||"active",document.getElementById("emp-nationality").value=a?.nationality||"saudi",document.getElementById("emp-bank-name").value=a?.bankName||"",document.getElementById("emp-iban").value=a?.iban||"",document.getElementById("emp-error").classList.add("hidden"),openModal("emp-modal")};window.editEmp=a=>{const t=v.find(o=>o.id===a);t&&openEmpModal(t)};window.saveEmployee=async()=>{const a=document.getElementById("emp-error");a.classList.add("hidden");const t=document.getElementById("emp-id").value,o=document.getElementById("emp-name").value.trim(),e=parseFloat(document.getElementById("emp-salary").value),c=document.getElementById("emp-nid").value.trim(),l=document.getElementById("emp-nid-expiry").value;if(!o||isNaN(e)||!c||!l){a.textContent="يرجى إدخال الاسم بالكامل، رقم الهوية، تاريخ الانتهاء، والراتب الأساسي",a.classList.remove("hidden");return}const m={name:o,job:document.getElementById("emp-job").value.trim(),nid:c,nidExpiry:l,date:document.getElementById("emp-date").value,passportNo:document.getElementById("emp-passport").value.trim(),passportExpiry:document.getElementById("emp-passport-expiry").value,gosiNumber:document.getElementById("emp-gosi-number").value.trim(),salary:e,allowance:parseFloat(document.getElementById("emp-allowance").value)||0,status:document.getElementById("emp-status").value,nationality:document.getElementById("emp-nationality").value,bankName:document.getElementById("emp-bank-name").value.trim(),iban:document.getElementById("emp-iban").value.trim()},i=document.getElementById("save-emp-btn");i.disabled=!0;try{let n=t;if(t){await $t("employees",t,m);const d=v.find(s=>s.id===t);d&&d.accountId&&d.name!==o&&await Nt(d.accountId,o)}else{const d=await Et(L.employees(),m);n=typeof d=="string"?d:d.id;try{const s=await Dt("employees",n,o);s&&await $t("employees",n,{accountId:s.accountId,accountCode:s.accountCode})}catch(s){console.warn("[syncEntityToCoa] فشل ربط الموظف بشجرة الحسابات:",s.message)}}const p=document.getElementById("emp-nid-upload");if(p&&p.files.length>0){const d=p.files[0];window.uploadFileToArchive(d,"employee_docs",n,`صورة إقامة/هوية الموظف: ${o}`).catch(s=>console.warn(s))}const r=document.getElementById("emp-passport-upload");if(r&&r.files.length>0){const d=r.files[0];window.uploadFileToArchive(d,"employee_docs",n,`صورة جواز سفر الموظف: ${o}`).catch(s=>console.warn(s))}showToast("تم حفظ بيانات الموظف","success"),closeModal("emp-modal"),await switchHrTab("employees")}catch(n){a.textContent=n.message,a.classList.remove("hidden")}finally{i.disabled=!1}};window.delEmp=async(a,t)=>{if(confirm(`تأكيد حذف الموظف ${t} نهائياً من سجل الموارد البشرية؟`))try{const o=v.find(e=>e.id===a);o&&o.accountId&&await zt("employees",a,o.accountId),await St("employees",a),showToast("تم حذف ملف الموظف بنجاح","success"),await switchHrTab("employees")}catch(o){showToast(o.message,"error")}};window.viewEmpDocumentDetails=a=>{const t=v.find(l=>l.id===a);if(!t)return;const o=new Date,e=l=>{if(!l)return'<span class="expiry-badge" style="background:#ddd; color:#333;">غير متوفر</span>';const i=new Date(l)-o,n=Math.ceil(i/(24*60*60*1e3));return n<=0?`<span class="expiry-badge danger">منتهية منذ ${Math.abs(n)} يوم</span>`:n<30?`<span class="expiry-badge warning">تنتهي خلال ${n} يوم</span>`:`<span class="expiry-badge good">صالحة (متبقي ${n} يوم)</span>`},c=document.getElementById("doc-details-body");c&&(c.innerHTML=`
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
            الأساسي: <strong class="mono text-brand">${u(t.salary)}</strong> | 
            البدلات: <strong class="mono text-ok">${u(t.allowance||0)}</strong>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; padding-bottom:6px;">
          <span>📅 تاريخ التوظيف والتعيين:</span>
          <strong class="mono">${t.date||"—"}</strong>
        </div>
      </div>
    </div>
  `,openModal("doc-details-modal"))};window.openLeaveModal=()=>{const a=v.filter(t=>t.status==="active");if(!a.length){showToast("لا يوجد موظفون نشطون لتسجيل إجازة لهم","warning");return}document.getElementById("leave-emp-id").innerHTML=a.map(t=>`<option value="${t.id}">${t.name}</option>`).join(""),document.getElementById("leave-start").value=E(),document.getElementById("leave-end").value=E(),document.getElementById("leave-notes").value="",document.getElementById("leave-error").classList.add("hidden"),openModal("leave-modal")};window.saveEmployeeLeave=async()=>{const a=document.getElementById("leave-error");a.classList.add("hidden");const t=document.getElementById("leave-emp-id").value,o=document.getElementById("leave-type").value,e=document.getElementById("leave-start").value,c=document.getElementById("leave-end").value,l=document.getElementById("leave-notes").value.trim();if(!t||!e||!c){a.textContent="يرجى ملء جميع الحقول الإجبارية",a.classList.remove("hidden");return}const m=new Date(e);if(new Date(c)<m){a.textContent="تاريخ الانتهاء لا يمكن أن يكون قبل تاريخ البدء",a.classList.remove("hidden");return}const n=v.find(r=>r.id===t),p=document.getElementById("save-leave-btn");p.disabled=!0;try{const r=A(et(k,`companies/${B}/employeeLeaves`));await U(r,{empId:t,empName:n.name,type:o,startDate:e,endDate:c,notes:l,createdAt:H()}),showToast("✅ تم تسجيل إجازة الموظف بنجاح","success"),closeModal("leave-modal"),await switchHrTab("leaves")}catch(r){a.textContent=r.message,a.classList.remove("hidden")}finally{p.disabled=!1}};window.deleteLeave=async a=>{if(confirm("هل تريد بالتأكيد حذف سجل هذه الإجازة؟"))try{await kt(A(k,`companies/${B}/employeeLeaves`,a)),showToast("تم حذف سجل الإجازة","success"),await switchHrTab("leaves")}catch(t){showToast(t.message,"error")}};window.openLoanModal=()=>{const a=document.getElementById("loan-emp-id"),t=v.filter(o=>o.status==="active");if(!t.length){showToast("لا يوجد موظفون نشطون لصرف سلف لهم","warning");return}a.innerHTML=t.map(o=>`<option value="${o.id}">${o.name}</option>`).join(""),document.getElementById("loan-date").value=E(),document.getElementById("loan-amount").value="",document.getElementById("loan-notes").value="",document.getElementById("loan-error").classList.add("hidden"),toggleLoanSource(),openModal("loan-modal")};window.toggleLoanSource=()=>{const a=document.getElementById("loan-method").value,t=document.getElementById("loan-source-label"),o=document.getElementById("loan-source");o.innerHTML='<option value="">اختر...</option>',a==="cash"?(t.textContent="صندوق الصرف *",o.innerHTML+=j.map(e=>`<option value="${e.id}">${e.name}</option>`).join("")):(t.textContent="الحساب البنكي المخصوم منه *",o.innerHTML+=R.map(e=>`<option value="${e.id}">${e.bankName} - ${e.accountNumber}</option>`).join(""))};async function Mt(a){if(!a)return h.find(e=>e.code==="1-1-5-4")||{id:"OcKzxqDbfrKjheMgJAYp",code:"1-1-5-4",name:"سلف للموظفين والمناديب"};if(a.loanAccountId){const e=h.find(c=>c.id===a.loanAccountId);if(e)return e}const t=h.find(e=>{const c=e.parentCode==="1-1-5-4"||e.code&&e.code.startsWith("1-1-5-4"),l=e.sourceEntityId&&e.sourceEntityId===a.id||e.linkedEmpId&&e.linkedEmpId===a.id||e.linkedRepId&&e.linkedRepId===a.id||e.name&&a.name&&(e.name.includes(a.name)||a.name.includes(e.name));return c&&l});if(t)return t;const o=h.find(e=>e.name&&a.name&&(e.name.includes(a.name)||a.name.includes(e.name))&&(e.parentCode==="1-1-5-4"||e.code&&e.code.startsWith("1-1-5-4")||e.name&&e.name.includes("سلف")));if(o)return o;try{const e="1-1-5-4",c=await Ht(e),l=et(k,`companies/${B}/chartOfAccounts`),m=h.find(r=>r.code===e)||{id:"OcKzxqDbfrKjheMgJAYp"},i=A(l),n={code:c,name:`سلف الموظف ${a.name}`,parentCode:e,parentId:m.id||"OcKzxqDbfrKjheMgJAYp",type:"asset",nodeType:"detail",level:4,balance:0,totalDebit:0,totalCredit:0,normalBalance:"debit",companyId:B,sourceEntityId:a.id,linkedEmpId:a.id,isActive:!0,createdAt:H()};await U(i,n);const p={id:i.id,...n};h.push(p);try{await K(A(k,`companies/${B}/employees`,a.id),{loanAccountId:i.id}),a.loanAccountId=i.id}catch{}return p}catch(e){return console.error("Failed to auto-create employee loan sub-account:",e),h.find(c=>c.code==="1-1-5-4")||{id:"OcKzxqDbfrKjheMgJAYp",code:"1-1-5-4",name:"سلف للموظفين والمناديب"}}}window.saveEmployeeLoan=async()=>{const a=document.getElementById("loan-error");a.classList.add("hidden");const t=document.getElementById("loan-emp-id").value,o=document.getElementById("loan-date").value,e=parseFloat(document.getElementById("loan-amount").value),c=document.getElementById("loan-method").value,l=document.getElementById("loan-source").value,m=document.getElementById("loan-notes").value.trim();if(!t||!o||isNaN(e)||e<=0||!l||!m){a.textContent="الرجاء تعبئة كافة الحقول المطلوبة وكتابة بيان صحيح للسلفة",a.classList.remove("hidden");return}const i=v.find(p=>p.id===t),n=document.getElementById("save-loan-btn");n.disabled=!0;try{const p=await Mt(i);let r="",d="",s="",b=null;if(c==="cash"){const f=j.find(T=>T.id===l);r=f?.accountId,d=f?.code||"",s=f?.name||"",b=A(k,`companies/${B}/cashBoxes`,l)}else{const f=R.find(T=>T.id===l);r=f?.accountId,d=f?.code||"",s=f?.bankName||"",b=A(k,`companies/${B}/bankAccounts`,l)}if(!r)throw new Error("حساب الدفع المختار غير مربوط بشجرة الحسابات");const $=h.find(f=>f.id===r)||{id:r,code:d,name:s},g=A(et(k,`companies/${B}/employeeLoans`)),x={empId:t,empName:i.name,date:o,amount:e,paidAmount:0,remainingBalance:e,method:c,sourceId:l,notes:m,status:"active",createdAt:H()};if(await U(g,x),await Z({date:o,description:`صرف سلفة للموظف ${i.name} - مستند ${g.id.slice(-6)}`,sourceType:"employee_advance",sourceId:g.id,lines:[{accountId:p.id,accountCode:p.code,accountName:p.name,debit:e,credit:0,note:`سلفة للموظف ${i.name}`},{accountId:$.id,accountCode:$.code,accountName:$.name,debit:0,credit:e,note:`صرف سلفة للموظف ${i.name} من ${$.name}`}]}),b){const f=await Y(b);if(f.exists()){const T=parseFloat(f.data().balance||0);await K(b,{balance:T-e,updatedAt:H()})}}showToast(`✅ تم صرف السلفة بنجاح للموظف ${i.name} على حسابه الفرعي (${p.name})`,"success"),closeModal("loan-modal"),await switchHrTab("loans")}catch(p){a.textContent=p.message,a.classList.remove("hidden")}finally{n.disabled=!1}};window.deleteLoan=async(a,t,o)=>{if(confirm(`تأكيد حذف وإلغاء سلفة الموظف ${t} بمبلغ ${o} ر.س من قسم الموارد البشرية؟`))try{if(a.startsWith("je_")||a.startsWith("manual_")){const d=JSON.parse(localStorage.getItem("ignored_hr_loans")||"[]");d.includes(a)||d.push(a),localStorage.setItem("ignored_hr_loans",JSON.stringify(d)),showToast("تم استبعاد وإخفاء السلفة من قسم الموارد البشرية بنجاح","success"),await switchHrTab("loans");return}const e=A(k,`companies/${B}/employeeLoans`,a),c=await Y(e);if(!c.exists()){const d=JSON.parse(localStorage.getItem("ignored_hr_loans")||"[]");d.includes(a)||d.push(a),localStorage.setItem("ignored_hr_loans",JSON.stringify(d)),showToast("تم استبعاد السلفة من قسم الموارد البشرية بنجاح","success"),await switchHrTab("loans");return}const l=c.data();let m=null;if(l.method==="cash"?m=A(k,`companies/${B}/cashBoxes`,l.sourceId):m=A(k,`companies/${B}/bankAccounts`,l.sourceId),m){const d=await Y(m);if(d.exists()){const s=parseFloat(d.data().balance||0);await K(m,{balance:s+o,updatedAt:H()})}}const i=v.find(d=>d.name===l.empName||d.id===l.empId),n=await Mt(i);let p="";l.method==="cash"?p=j.find(d=>d.id===l.sourceId)?.accountId:p=R.find(d=>d.id===l.sourceId)?.accountId;const r=h.find(d=>d.id===p);r&&await Z({date:E(),description:`عكس وإلغاء قيد سلفة الموظف ${t} - مستند ${a.slice(-6)}`,sourceType:"employee_advance_reversal",sourceId:a,lines:[{accountId:r.id,accountCode:r.code,accountName:r.name,debit:o,credit:0,note:"عكس قيد صرف سلفة ملغاة"},{accountId:n.id,accountCode:n.code,accountName:n.name,debit:0,credit:o,note:"تخفيض ذمة السلف للموظف بالإلغاء"}]}),await kt(e),showToast("تم إلغاء السلفة وعكس القيد المحاسبي المترتب عليها","success"),await switchHrTab("loans")}catch(e){showToast(e.message,"error")}};window.openEosModal=()=>{const a=v.filter(e=>e.status==="active"||e.status==="suspended");if(!a.length){showToast("لا يوجد موظفون نشطون لإجراء تصفية نهاية خدمة لهم","warning");return}document.getElementById("eos-emp-id").innerHTML='<option value="">اختر الموظف...</option>'+a.map(e=>`<option value="${e.id}">${e.name}</option>`).join(""),document.getElementById("eos-date").value=E(),document.getElementById("eos-notes").value="",document.getElementById("eos-error").classList.add("hidden"),document.getElementById("eos-calc-details").innerHTML='<div class="alert info" style="margin:0;">يرجى اختيار الموظف لتحديث تفاصيل مدة الخدمة والمكافأة تلقائياً وفق قانون العمل.</div>';const t=h.filter(e=>e.type==="liability");document.getElementById("eos-account-id").innerHTML='<option value="">اختر...</option>'+t.map(e=>`<option value="${e.id}">${e.code} - ${e.name}</option>`).join("");const o=h.find(e=>e.code==="2-1-5-2");o&&(document.getElementById("eos-account-id").value=o.id),toggleEosSource(),openModal("eos-modal"),document.getElementById("save-eos-btn").disabled=!0};window.toggleEosSource=()=>{const a=document.getElementById("eos-method").value,t=document.getElementById("eos-source-label"),o=document.getElementById("eos-source");o.innerHTML='<option value="">اختر...</option>',a==="cash"?(t.textContent="صندوق الصرف *",o.innerHTML+=j.map(e=>`<option value="${e.id}">${e.name}</option>`).join("")):(t.textContent="الحساب البنكي المخصوم منه *",o.innerHTML+=R.map(e=>`<option value="${e.id}">${e.bankName} - ${e.accountNumber}</option>`).join(""))};window.calculateEosIndemnity=()=>{const a=document.getElementById("eos-emp-id").value,t=document.getElementById("eos-date").value,o=document.getElementById("eos-reason").value,e=document.getElementById("eos-calc-details"),c=document.getElementById("save-eos-btn");if(!a||!t||!e){c&&(c.disabled=!0);return}const l=v.find(F=>F.id===a);if(!l){c&&(c.disabled=!0);return}const m=new Date(l.date||E()),i=new Date(t);if(i-m<0){e.innerHTML=`<div class="text-bad" style="font-weight:bold; padding:8px; border:1px solid var(--border); border-radius:6px; background:rgba(239,68,68,0.05);">⚠️ تاريخ التصفية يجب أن يكون بعد تاريخ التعيين للموظف وهو (${l.date})</div>`,c&&(c.disabled=!0);return}c&&(c.disabled=!1);let p=i.getFullYear()-m.getFullYear(),r=i.getMonth()-m.getMonth(),d=i.getDate()-m.getDate();if(d<0){r--;const F=new Date(i.getFullYear(),i.getMonth(),0);d+=F.getDate()}r<0&&(p--,r+=12);const s=p+r/12+d/365.25,b=l.salary||0,$=l.allowance||0,g=b+$;let x=0,f="",T=0;if(s<=5)T=s*(g/2),f+=`• حساب أول 5 سنوات: ${s.toFixed(2)} سنة × نصف راتب (${u(g/2)}) = ${u(T)} ر.س<br>`;else{const F=5*(g/2),V=s-5,W=V*g;T=F+W,f+=`• حساب أول 5 سنوات: 5 سنوات × نصف راتب (${u(g/2)}) = ${u(F)} ر.س<br>`,f+=`• حساب ما بعد 5 سنوات: ${V.toFixed(2)} سنة × راتب كامل (${u(g)}) = ${u(W)} ر.س<br>`}let w=1,I="إنهاء عقد / فصل من العمل (تستحق المكافأة كاملة 100%)";o==="resignation"&&(s<2?(w=0,I="الخدمة أقل من سنتين في حالة الاستقالة (لا تستحق مكافأة 0%)"):s>=2&&s<5?(w=1/3,I="الخدمة بين 2 إلى 5 سنوات في حالة الاستقالة (تستحق ثلث المكافأة 33.3%)"):s>=5&&s<10?(w=2/3,I="الخدمة بين 5 إلى 10 سنوات في حالة الاستقالة (تستحق ثلثي المكافأة 66.6%)"):(w=1,I="الخدمة أكثر من 10 سنوات في حالة الاستقالة (تستحق المكافأة كاملة 100%)")),x=T*w,e.innerHTML=`
    <div style="background:var(--bg-2); border:1px solid var(--border); border-radius:12px; padding:16px; font-size:12px; line-height:1.6; color:var(--text-1);">
      <div style="margin-bottom:6px;"><strong>📅 تاريخ التعيين:</strong> ${l.date}</div>
      <div style="margin-bottom:8px;"><strong>⏱️ مدة الخدمة الفعلية:</strong> ${p} سنة، و ${r} شهر، و ${d} يوم (${s.toFixed(3)} سنة)</div>
      
      <div style="margin-top:8px; padding-top:8px; border-top:1px dashed var(--border); font-size:11px; color:var(--text-2);">
        <strong>⚙️ تفاصيل حساب المكافأة (حسب نظام العمل السعودي):</strong><br>
        ${f}
        <strong>الحالة:</strong> ${I}<br>
      </div>

      <div style="margin-top:12px; padding:12px; background:var(--brand-alpha, rgba(91, 127, 255, 0.1)); border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-weight:bold; font-size:14px; border:1px solid var(--brand-alpha);">
        <span>صافي مكافأة نهاية الخدمة المستحقة:</span>
        <span class="mono text-bad" style="font-size:16px;" id="calculated-eos-amount" data-val="${x.toFixed(2)}">${u(x)} ر.س</span>
      </div>
    </div>
  `};window.saveEosSettlement=async()=>{const a=document.getElementById("eos-error");a.classList.add("hidden");const t=document.getElementById("eos-emp-id").value,o=document.getElementById("eos-date").value,e=document.getElementById("eos-reason").value,c=document.getElementById("eos-method").value,l=document.getElementById("eos-source").value,m=document.getElementById("eos-account-id").value,i=document.getElementById("eos-notes").value.trim(),n=document.getElementById("calculated-eos-amount"),p=n&&parseFloat(n.dataset.val)||0;if(!t||!o||!l||!m){a.textContent="الرجاء تحديد كافة الحقول المطلوبة ومراجعة الحساب",a.classList.remove("hidden");return}const r=v.find(s=>s.id===t),d=document.getElementById("save-eos-btn");d.disabled=!0;try{let s="",b="",$="",g=null;if(c==="cash"){const w=j.find(I=>I.id===l);s=w?.accountId,b=w?.code||"",$=w?.name||"",g=A(k,`companies/${B}/cashBoxes`,l)}else{const w=R.find(I=>I.id===l);s=w?.accountId,b=w?.code||"",$=w?.bankName||"",g=A(k,`companies/${B}/bankAccounts`,l)}if(!s)throw new Error("حساب الصرف المختار غير مربوط بشجرة الحسابات");const x=h.find(w=>w.id===s)||{id:s,code:b,name:$},f=h.find(w=>w.id===m);await K(A(k,`companies/${B}/employees`,t),{status:"resigned"});const T=A(et(k,`companies/${B}/employeeSettlements`));if(await U(T,{empId:t,empName:r.name,date:o,reason:e,indemnityAmount:p,method:c,sourceId:l,expenseAccId:m,notes:i||"تصفية نهاية خدمة الموظف المعتمدة",createdAt:H()}),p>0&&(await Z({date:o,description:`تصفية مستحقات ومكافأة نهاية خدمة الموظف ${r.name}`,sourceType:"employee_settlement",sourceId:T.id,lines:[{accountId:m,accountCode:f?.code||"",accountName:f?.name||"",debit:p,credit:0,note:`مكافأة نهاية خدمة الموظف ${r.name}`},{accountId:x.id,accountCode:x.code,accountName:x.name,debit:0,credit:p,note:`صرف مستحقات تصفية الموظف ${r.name}`}]}),g)){const w=await Y(g);if(w.exists()){const I=parseFloat(w.data().balance||0);await K(g,{balance:I-p,updatedAt:H()})}}showToast(`✅ تم اعتماد تصفية الموظف ${r.name} وصرف مستحقاته بنجاح`,"success"),closeModal("eos-modal"),await switchHrTab("eos")}catch(s){a.textContent=s.message,a.classList.remove("hidden")}finally{d.disabled=!1}};window.calculateGrandTotal=()=>{let a=0;document.querySelectorAll(".pr-row").forEach(o=>{const e=o.dataset.id,c=document.getElementById(`net-${e}`);if(c){const l=c.textContent.replace(/[^0-9.-]+/g,""),m=parseFloat(l)||0;a+=m}});const t=document.getElementById("pr-total");t&&(t.textContent=`${u(a)} ر.س`)};window.openPayrollModal=async()=>{try{(!v||!v.length)&&(v=await D(L.employees())),(!h||!h.length)&&(h=await D(L.chartOfAccounts())),(!j||!j.length)&&(j=await D(L.cashBoxes())),(!R||!R.length)&&(R=await D(L.bankAccounts())),(!N||!N.length)&&(N=(await Bt(L.employeeLoans())).docs.map(p=>({id:p.id,...p.data()})));const a=v.filter(n=>n.status==="active");if(!a.length){showToast("لا يوجد موظفون نشطون لإصدار رواتب لهم","warning");return}togglePrSource();const t=h.filter(n=>n.type==="expense");document.getElementById("pr-expense-acc").innerHTML='<option value="">اختر...</option>'+t.map(n=>`<option value="${n.id}">${n.code} - ${n.name}</option>`).join(""),document.getElementById("pr-allowance-acc").innerHTML='<option value="">اختر...</option>'+t.map(n=>`<option value="${n.id}">${n.code} - ${n.name}</option>`).join("");const o=h.find(n=>n.code==="5-2-2")||h.find(n=>n.code.startsWith("5-2")),e=h.find(n=>n.code==="5-2-5-1")||h.find(n=>n.code==="5-2-5");o&&(document.getElementById("pr-expense-acc").value=o.id),e&&(document.getElementById("pr-allowance-acc").value=e.id);const c=document.getElementById("pr-month")?.value||new Date().toISOString().slice(0,7),l={};try{const[n,p,r]=await Promise.all([D(L.salesReps()),D(L.receipts()),D(L.salesInvoices())]),d=p.filter(b=>b.date&&b.date.slice(0,7)===c&&b.entityType==="customer"),s=r.filter(b=>b.date&&b.date.slice(0,7)===c&&b.status!=="cancelled");n.forEach(b=>{let $=0;d.forEach(I=>{(I.repId===b.id||I.targetId===b.id)&&($+=parseFloat(I.amount||0))});let g=0;s.forEach(I=>{I.repId===b.id&&(g+=parseFloat(I.totalWithVat||I.total||0))});const x=b.monthlyTarget||0,f=g<x?1:parseFloat(b.commissionRate||2.5),T=$*f/100,w=v.find(I=>I.id===b.employeeId||I.name.includes(b.name)||b.name.includes(I.name));w&&(l[w.id]=(l[w.id]||0)+T)})}catch(n){console.error("Error calculating rep commission for payroll:",n)}const m=document.getElementById("pr-tbody");let i=0;m.innerHTML=a.map(n=>{const r=N.filter(f=>(f.remainingBalance||0)>0&&(f.empId===n.id||f.empName&&n.name&&(f.empName.includes(n.name)||n.name.includes(f.empName)))).reduce((f,T)=>f+(T.remainingBalance||0),0),d=n.salary||0,s=n.allowance||0,b=l[n.id]||0,$=d+s+b;i+=$;const g=r>0?Math.min(r,(d+s)*.25):0;let x=0;return n.nationality==="saudi"?x=(d+s)*.0975:x=0,`
        <tr class="pr-row" data-id="${n.id}" data-nationality="${n.nationality||"saudi"}">
          <td><strong>${n.name}</strong><br><small style="color:var(--text-3);">${n.job||""}</small></td>
          <td class="mono">${u(d)}</td>
          <td class="mono">${u(s)}</td>
          <td>
            <input type="number" class="input mono pr-overtime" value="0" min="0" step="0.01" style="height:28px; padding:2px; font-size:11px;" onchange="calculateRowNet('${n.id}', ${d}, ${s})" />
          </td>
          <td>
            <input type="number" class="input mono pr-bonus" value="${b.toFixed(2)}" min="0" step="0.01" style="height:28px; padding:2px; font-size:11px;" onchange="calculateRowNet('${n.id}', ${d}, ${s})" />
          </td>
          <td>
            <input type="number" class="input mono pr-deduct" value="0" min="0" step="0.01" style="height:28px; padding:2px; font-size:11px;" onchange="calculateRowNet('${n.id}', ${d}, ${s})" />
          </td>
          <td>
            <input type="number" class="input mono pr-gosi" value="${x.toFixed(2)}" min="0" step="0.01" style="height:28px; padding:2px; font-size:11px;" onchange="calculateRowNet('${n.id}', ${d}, ${s})" />
          </td>
          <td class="mono text-bad font-bold" id="loan-bal-${n.id}">${u(r)}</td>
          <td>
            <input type="number" class="input mono pr-repay" id="repay-input-${n.id}" data-max="${r}" value="${g.toFixed(2)}" min="0" max="${r}" step="0.01" style="height:28px; padding:2px; font-size:11px;" ${r<=0?"disabled":""} onchange="calculateRowNet('${n.id}', ${d}, ${s})" />
          </td>
          <td class="mono font-bold text-ok" id="net-${n.id}">${u($-x-g)}</td>
        </tr>
      `}).join(""),document.getElementById("pr-total").textContent=`${u(i)} ر.س`,document.getElementById("pr-error").classList.add("hidden"),calculateGrandTotal(),openModal("payroll-modal")}catch(a){console.error("Error opening payroll modal:",a),showToast(`حدث خطأ أثناء فتح مسير الرواتب: ${a.message}`,"error")}};window.calculateRowNet=(a,t,o)=>{const e=document.querySelector(`.pr-row[data-id="${a}"]`);if(!e)return;const c=parseFloat(e.querySelector(".pr-overtime").value)||0,l=parseFloat(e.querySelector(".pr-bonus").value)||0,m=parseFloat(e.querySelector(".pr-deduct").value)||0,i=parseFloat(e.querySelector(".pr-gosi").value)||0,n=e.querySelector(".pr-repay"),p=parseFloat(n.dataset.max)||0;let r=parseFloat(n.value)||0;r>p&&(r=p,n.value=p);const s=t+o+c+l-(m+i+r);document.getElementById(`net-${a}`).textContent=u(s),calculateGrandTotal()};window.submitPayroll=async()=>{const a=document.getElementById("pr-error");a.classList.add("hidden");const t=document.getElementById("pr-month").value,o=document.getElementById("pr-method").value,e=document.getElementById("pr-source").value,c=document.getElementById("pr-expense-acc").value,l=document.getElementById("pr-allowance-acc").value;if(!e||!c||!l){a.textContent="الرجاء تحديد مصدر الدفع وحسابات المصروفات للرواتب والبدلات",a.classList.remove("hidden");return}const m=document.getElementById("save-pr-btn");m.disabled=!0;try{let i=0,n=0,p=0,r=0,d=0,s=0,b=0,$=0,g=0;const x=[],f=await D(L.salesReps()),T=document.querySelectorAll(".pr-row");for(const y of T){const M=y.dataset.id,S=v.find(O=>O.id===M),_=S.salary||0,P=S.allowance||0,z=parseFloat(y.querySelector(".pr-overtime").value)||0,q=parseFloat(y.querySelector(".pr-bonus").value)||0,ht=parseFloat(y.querySelector(".pr-deduct").value)||0,mt=parseFloat(y.querySelector(".pr-gosi").value)||0,Q=parseFloat(y.querySelector(".pr-repay").value)||0,xt=_+P+z+q-(ht+mt+Q),wt=_+P;let ot=0;if(S.nationality==="saudi"?ot=wt*.1175:ot=wt*.02,i+=xt,n+=_,p+=P,r+=z,f.some(O=>O.employeeId===M||O.name.includes(S.name)||S.name.includes(O.name))?s+=q:d+=q,b+=Q,$+=mt,g+=ot,x.push({empId:M,empName:S.name,basic:_,allowance:P,overtime:z,bonus:q,deduct:ht,gosi:mt,repay:Q,employerGosi:ot,net:xt}),Q>0){let O=Q;const Ct=N.filter(G=>(G.remainingBalance||0)>0&&(G.empId===M||S&&G.empName&&S.name&&(G.empName.includes(S.name)||S.name.includes(G.empName))));for(const G of Ct){if(O<=0)break;const ut=Math.min(O,G.remainingBalance);await K(A(k,`companies/${B}/employeeLoans`,G.id),{paidAmount:It(ut),remainingBalance:It(-ut),updatedAt:H()}),O-=ut}}}if(i<=0)throw new Error("لا توجد مبالغ صافية للصرف في هذا المسير");const w=h.find(y=>y.id===c),I=h.find(y=>y.id===l),F=h.find(y=>y.code==="5-2-7")||{id:"REP_COMMISSIONS",code:"5-2-7",name:"مصروف عمولات المناديب"},V=h.find(y=>y.code==="5-2-5-1")||{id:"PR_BONUSES",code:"5-2-5-1",name:"مصروف حوافز ومكافآت الموظفين"},W=h.find(y=>y.code==="1-1-5-4-1")||{id:"EMP_ADVANCES",code:"1-1-5-4-1",name:"سلف موظفين"},dt=h.find(y=>y.code==="2-1-5-1")||{id:"GOSI_LIABILITY",code:"2-1-5-1",name:"التأمينات الاجتماعية المستحقة"},lt=h.find(y=>y.code==="5-2-6")||{id:"GOSI_EXPENSE",code:"5-2-6",name:"التأمينات الاجتماعية — حصة صاحب العمل"},J=[{accountId:c,accountCode:w?.code||"",accountName:w?.name||"",debit:n+r,credit:0,note:`مصروف الرواتب الأساسية والإضافي لشهر ${t}`},{accountId:l,accountCode:I?.code||"",accountName:I?.name||"",debit:p,credit:0,note:`مصروف بدلات الموظفين لشهر ${t}`}];s>0&&J.push({accountId:F.id,accountCode:F.code,accountName:F.name,debit:s,credit:0,note:`مصروف عمولات مبيعات المناديب لشهر ${t}`}),d>0&&J.push({accountId:V.id,accountCode:V.code,accountName:V.name,debit:d,credit:0,note:`مصروف الحوافز والمكافآت للموظفين لشهر ${t}`}),g>0&&J.push({accountId:lt.id,accountCode:lt.code,accountName:lt.name,debit:g,credit:0,note:`مصروف مساهمة الشركة في التأمينات الاجتماعية شهر ${t}`});for(const y of x){const M=v.find(z=>z.id===y.empId);let S=M?.accountId,_=M?.accountCode||"",P=M?`رواتب مستحقة - ${M.name}`:"";if(!S){const z=h.find(q=>q.code==="2-1-5-2")||{id:"ACCRUED_SALARIES",code:"2-1-5-2",name:"رواتب ومستحقات الموظفين المستحقة"};S=z.id,_=z.code,P=z.name}J.push({accountId:S,accountCode:_,accountName:P,debit:0,credit:y.net,note:`استحقاق صافي راتب الموظف ${y.empName} لشهر ${t}`})}b>0&&J.push({accountId:W.id,accountCode:W.code,accountName:W.name,debit:0,credit:b,note:`استرداد سلف موظفين مستقطعة من الرواتب شهر ${t}`});const vt=$+g;vt>0&&J.push({accountId:dt.id,accountCode:dt.code,accountName:dt.name,debit:0,credit:vt,note:`التأمينات الاجتماعية المستحقة (خصم الموظفين + حصة الشركة) لشهر ${t}`});const it=`JE-PR-ACC-${t.replace("-","")}`;await Z({date:E(),description:`قيد استحقاق رواتب وعمولات الموظفين والمناديب لشهر ${t}`,sourceType:"payroll_accrual",sourceId:t,lines:J,entryNumber:it});const ct=[];for(const y of x){const M=v.find(z=>z.id===y.empId);let S=M?.accountId,_=M?.accountCode||"",P=M?`رواتب مستحقة - ${M.name}`:"";if(!S){const z=h.find(q=>q.code==="2-1-5-2")||{id:"ACCRUED_SALARIES",code:"2-1-5-2",name:"رواتب ومستحقات الموظفين المستحقة"};S=z.id,_=z.code,P=z.name}ct.push({accountId:S,accountCode:_,accountName:P,debit:y.net,credit:0,note:`تسوية وصرف صافي راتب الموظف ${y.empName} لشهر ${t}`})}let at="",gt="",rt="",X=null;if(o==="cash"){const y=j.find(M=>M.id===e);at=y?.accountId,gt=y?.code||"",rt=y?.name||"",X=A(k,`companies/${B}/cashBoxes`,e)}else{const y=R.find(M=>M.id===e);at=y?.accountId,gt=y?.code||"",rt=y?.bankName||"",X=A(k,`companies/${B}/bankAccounts`,e)}const ft=h.find(y=>y.id===at);ct.push({accountId:at,accountCode:ft?.code||"",accountName:ft?.name||"",debit:0,credit:i,note:`دفع وصرف مسير رواتب شهر ${t} من حساب ${rt}`});const pt=`JE-PR-PAY-${t.replace("-","")}`;await Z({date:E(),description:`قيد صرف وتسوية مسير رواتب شهر ${t}`,sourceType:"payroll_payment",sourceId:t,lines:ct,entryNumber:pt});const Tt=A(et(k,`companies/${B}/payrolls`));if(await U(Tt,{month:t,date:E(),amount:i,employeeCount:x.length,method:o,sourceId:e,expenseAccId:c,expenseAccName:w?.name||"",items:x,notes:`مسير رواتب شهر ${t} المعتمد - قيود: ${it} & ${pt}`,createdAt:H()}),await Et(L.expenses(),{date:E(),amount:i,accountId:c,accountName:"مصروف رواتب وأجور",method:o,sourceId:e,sourceName:o==="cash"?"صندوق":"بنك",notes:`صرف مسير رواتب شهر ${t} - قيود: ${it} & ${pt}`}),X){const y=await Y(X);if(y.exists()){const M=parseFloat(y.data().balance||0);await K(X,{balance:M-i,updatedAt:H()})}}showToast("✅ تم اعتماد مسير الرواتب وترحيل القيود والرواتب بنجاح","success"),closeModal("payroll-modal"),await switchHrTab("payroll")}catch(i){a.textContent=i.message,a.classList.remove("hidden")}finally{m.disabled=!1}};window.printEmployeePayslip=(a,t,o,e,c,l,m,i,n,p)=>{const r=document.getElementById("payslip-modal-body");if(!r)return;const d=v.find(s=>s.id===a)||{name:"موظف"};r.innerHTML=`
    <div style="border:1px solid #ddd; padding:16px; border-radius:12px; background:#fff; font-family:'Cairo', sans-serif; direction:rtl;">
      <div style="text-align:center; border-bottom:2px dashed #ddd; padding-bottom:12px; margin-bottom:12px;">
        <h3 style="margin:0 0 4px 0; color:#111;">إدهام للمواد الغذائية</h3>
        <h4 style="margin:0; color:#555;">قسيمة تفصيل الراتب (Payslip)</h4>
        <span style="font-size:12px; color:#888;">شهر الاستحقاق: ${p}</span>
      </div>

      <div style="font-size:12px; display:flex; flex-direction:column; gap:6px; margin-bottom:16px; border-bottom:1px solid #eee; padding-bottom:10px;">
        <div><strong>الموظف:</strong> ${d.name}</div>
        <div><strong>المسمى الوظيفي:</strong> ${d.job||"—"}</div>
        <div><strong>رقم الهوية/الإقامة:</strong> ${d.nid||"—"}</div>
        ${d.iban?`<div><strong>رقم الآيبان:</strong> <span class="mono">${d.iban}</span></div>`:""}
      </div>

      <div style="display:flex; justify-content:space-between; gap:16px; font-size:12px;">
        <div style="flex:1;">
          <h5 style="margin:0 0 6px 0; color:#22c55e; border-bottom:1px solid #eee; padding-bottom:4px;">➕ المستحقات</h5>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>الراتب الأساسي:</span><span class="mono">${u(t)}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>البدلات:</span><span class="mono">${u(o)}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>الإضافي:</span><span class="mono">${u(e)}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>المكافآت:</span><span class="mono">${u(c)}</span></div>
          <div style="display:flex; justify-content:space-between; font-weight:bold; border-top:1px solid #eee; padding-top:4px;"><span>إجمالي المستحقات:</span><span class="mono">${u(t+o+e+c)}</span></div>
        </div>
        
        <div style="flex:1; border-right:1px solid #eee; padding-right:12px; margin-right:12px;">
          <h5 style="margin:0 0 6px 0; color:#ef4444; border-bottom:1px solid #eee; padding-bottom:4px;">➖ الاستقطاعات</h5>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>الخصومات/الغياب:</span><span class="mono">${u(l)}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>تأمينات (GOSI):</span><span class="mono">${u(m)}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>قسط السلفة:</span><span class="mono">${u(i)}</span></div>
          <div style="display:flex; justify-content:space-between; font-weight:bold; border-top:1px solid #eee; padding-top:4px;"><span>إجمالي الاستقطاعات:</span><span class="mono">${u(l+m+i)}</span></div>
        </div>
      </div>

      <div style="margin-top:20px; background:#f4f6fa; padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-weight:bold; font-size:14px; border:1px solid #e2e8f0;">
        <span>صافي الراتب المستحق:</span>
        <span class="mono text-bad" style="font-size:16px;">${u(n)} ر.س</span>
      </div>

      <div style="margin-top:24px; text-align:center; font-size:10px; color:#aaa; border-top:1px solid #eee; padding-top:12px;">
        تمت معالجة القسيمة آلياً عبر نظام إدهام لإدارة الموارد البشرية
      </div>
    </div>
  `,openModal("payslip-modal")};window.viewPayrollDetails=a=>{const t=tt.find(e=>e.id===a);if(!t)return;const o=document.createElement("div");o.className="modal-overlay active",o.id="payroll-details-overlay",o.style.zIndex="1002",o.innerHTML=`
    <div class="modal modal-lg" style="max-width:90vw;"><div class="modal-header"><h3 class="modal-title">تفاصيل مسير رواتب شهر ${t.month}</h3><button class="modal-close" onclick="document.getElementById('payroll-details-overlay').remove()">×</button></div>
    <div class="modal-body" style="padding:16px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:16px; font-size:12px; background:var(--bg-2); padding:10px; border-radius:8px;">
        <div><strong>تاريخ الصرف:</strong> ${t.date}</div>
        <div><strong>طريقة الدفع:</strong> ${t.method==="cash"?"💵 نقدي":"🏦 تحويل بنكي"}</div>
        <div><strong>إجمالي صافي المسير:</strong> <span class="text-bad font-bold">${u(t.amount)}</span></div>
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
                <td class="mono">${u(e.basic)}</td>
                <td class="mono">${u(e.allowance)}</td>
                <td class="mono text-ok">+${u(e.overtime||0)}</td>
                <td class="mono text-ok">+${u(e.bonus||0)}</td>
                <td class="mono text-bad">-${u(e.deduct||0)}</td>
                <td class="mono text-bad">-${u(e.gosi||0)}</td>
                <td class="mono text-bad font-bold">-${u(e.repay||0)}</td>
                <td class="font-bold text-ok mono">${u(e.net)}</td>
                <td>
                  <button class="btn btn-secondary sm" style="padding:2px 8px; font-size:10px; margin:0;" onclick="printEmployeePayslip('${e.empId}', ${e.basic}, ${e.allowance}, ${e.overtime||0}, ${e.bonus||0}, ${e.deduct||0}, ${e.gosi||0}, ${e.repay||0}, ${e.net}, '${t.month}')">🖨️ قسيمة</button>
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
  `,o.onclick=e=>{e.target===o&&o.remove()},document.body.appendChild(o)};window.printPayrollSheet=a=>{const t=tt.find(e=>e.id===a);if(!t)return;const o=window.open("","_blank");o.document.write(`
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
              <td class="mono">${u(e.basic)}</td>
              <td class="mono">${u(e.allowance)}</td>
              <td class="mono">${u(e.overtime||0)}</td>
              <td class="mono">${u(e.bonus||0)}</td>
              <td class="mono">${u(e.deduct||0)}</td>
              <td class="mono">${u(e.gosi||0)}</td>
              <td class="mono">${u(e.repay||0)}</td>
              <td class="mono"><strong>${u(e.net)} ر.س</strong></td>
            </tr>
          `).join("")}
          <tr style="background:#f5f5f5; font-weight:bold;">
            <td colspan="8">إجمالي رواتب المسير المعتمدة:</td>
            <td class="mono">${u(t.amount)} ر.س</td>
          </tr>
        </tbody>
      </table>

      <div class="footer-sigs">
        <div>إعداد القسم المالي: __________________</div>
        <div>اعتماد المدير العام: __________________</div>
      </div>
    </body>
    </html>
  `),o.document.close()};window.togglePrSource=()=>{const a=document.getElementById("pr-method").value,t=document.getElementById("pr-source-label"),o=document.getElementById("pr-source");o.innerHTML='<option value="">اختر...</option>',a==="cash"?(t.textContent="الصندوق *",o.innerHTML+=j.map(e=>`<option value="${e.id}">${e.name}</option>`).join("")):(t.textContent="الحساب البنكي *",o.innerHTML+=R.map(e=>`<option value="${e.id}">${e.bankName} - ${e.accountNumber}</option>`).join(""))};window.openDetailedEmployeePayslipModal=async a=>{const t=v.find(d=>d.id===a);if(!t)return;const o=t.salary||0,e=t.allowance||0,c=o/240,l=o/30,i=N.filter(d=>(d.remainingBalance||0)>0&&(d.empId===t.id||d.empName&&t.name&&(d.empName.includes(t.name)||t.name.includes(d.empName)))).reduce((d,s)=>d+(s.remainingBalance||0),0),n=t.nationality==="saudi"?(o+e)*.0975:0,p=E().slice(0,7),r=document.createElement("div");r.className="modal-overlay active",r.id="emp-payslip-statement-overlay",r.style.zIndex="1005",r.innerHTML=`
    <div class="modal modal-lg" style="max-width:750px; background:#f8fafc; border-radius:18px;">
      <div class="modal-header" style="background:linear-gradient(135deg, #1e293b, #0f172a); color:#fff; padding:16px 24px; border-top-left-radius:18px; border-top-right-radius:18px;">
        <div>
          <h3 class="modal-title" style="color:#fff; font-size:16px; margin:0;">📄 كشف مسير مفصل وقسيمة راتب الموظف</h3>
          <small style="color:#94a3b8; font-weight:600;">${t.name} — ${t.job||"موظف"} (شهر ${p})</small>
        </div>
        <button class="modal-close" style="color:#fff;" onclick="document.getElementById('emp-payslip-statement-overlay').remove()">×</button>
      </div>

      <div class="modal-body" style="padding:20px;">
        <!-- Employee Contract Specs KPI -->
        <div class="grid-4 gap-12 mb-16">
          <div style="background:#fff; border:1px solid #e2e8f0; padding:12px; border-radius:12px; text-align:center;">
            <div style="font-size:10px; font-weight:700; color:#64748b;">الراتب الأساسي</div>
            <div class="mono font-bold" style="font-size:15px; color:#0f172a;">${u(o)}</div>
          </div>
          <div style="background:#fff; border:1px solid #e2e8f0; padding:12px; border-radius:12px; text-align:center;">
            <div style="font-size:10px; font-weight:700; color:#64748b;">إجمالي البدلات</div>
            <div class="mono font-bold" style="font-size:15px; color:#0f172a;">${u(e)}</div>
          </div>
          <div style="background:#fff; border:1px solid #e2e8f0; padding:12px; border-radius:12px; text-align:center;">
            <div style="font-size:10px; font-weight:700; color:#64748b;">أجر اليوم الفعلي</div>
            <div class="mono font-bold" style="font-size:15px; color:#2563eb;">${u(l)}</div>
          </div>
          <div style="background:#fff; border:1px solid #e2e8f0; padding:12px; border-radius:12px; text-align:center;">
            <div style="font-size:10px; font-weight:700; color:#64748b;">أجر الساعة الأساسي</div>
            <div class="mono font-bold" style="font-size:15px; color:#2563eb;">${u(c)}</div>
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
                <td class="mono font-bold text-ok">${u(o)}</td>
              </tr>
              <tr>
                <td><strong>➕ البدلات الشهرية</strong></td>
                <td><small class="text-muted">سكن + مواصلات + طعام</small></td>
                <td class="mono font-bold text-ok">${u(e)}</td>
              </tr>
              <tr>
                <td><strong>➕ أجر الساعات الإضافية (Overtime)</strong></td>
                <td><small class="text-muted">المادة 107 (150% × أجر الساعة)</small></td>
                <td class="mono font-bold text-ok">+0.00 ر.س</td>
              </tr>
              <tr>
                <td><strong>➖ التأمينات الاجتماعية (GOSI)</strong></td>
                <td><small class="text-muted">${t.nationality==="saudi"?"خصم الموظف السعودي (9.75%)":"غير سعودي (0%)"}</small></td>
                <td class="mono font-bold text-bad">-${u(n)}</td>
              </tr>
              <tr>
                <td><strong>➖ السلف القائمة المستحقة</strong></td>
                <td><small class="text-muted">رصيد السلف القائمة المتبقية</small></td>
                <td class="mono font-bold text-bad">-${u(i)}</td>
              </tr>
            </tbody>
            <tfoot style="background:#f8fafc; font-weight:bold;">
              <tr>
                <td colspan="2" style="font-size:13px;">🟢 تقدير صافي الراتب المستحق للصرف:</td>
                <td class="mono text-bad" style="font-size:16px;">${u(o+e-n)} ر.س</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div class="modal-footer" style="background:#f1f5f9; padding:14px 24px; display:flex; justify-content:space-between; align-items:center;">
        <button class="btn btn-secondary" onclick="document.getElementById('emp-payslip-statement-overlay').remove()">إغلاق</button>
        <button class="btn btn-primary" onclick="printEmployeePayslip('${t.id}', ${o}, ${e}, 0, 0, 0, ${n}, ${i>0?Math.min(i,(o+e)*.25):0}, ${o+e-n}, '${p}')">🖨️ طباعة قسيمة الراتب الرسمية</button>
      </div>
    </div>
  `,r.onclick=d=>{d.target===r&&r.remove()},document.body.appendChild(r)};export{oe as render};
