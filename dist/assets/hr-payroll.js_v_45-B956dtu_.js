import{t as M,g as P,C as H,d as w,a as E,f as p,u as wt,n as It,r as kt,e as Z}from"./index-HrCilPJ3.js";import{orderBy as K,getDocs as et,query as at,collection as z,doc as k,getDoc as Y,setDoc as ot,serverTimestamp as j,deleteDoc as Bt,updateDoc as U,increment as Et}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import{u as Mt,s as Tt,d as St}from"./coa-connector-Bwq94sQ7.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let x=[],$=[],q=[],O=[],R=[],tt=[],bt=[],vt=[];async function Zt(a,t){a.innerHTML=`
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
          <div class="form-group"><label>تاريخ التعيين</label><input type="date" id="emp-date" class="input" value="${M()}" /></div>
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
          <div class="form-group"><label>تاريخ الصرف *</label><input type="date" id="loan-date" class="input" value="${M()}" /></div>
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
          <div class="form-group"><label>تاريخ البدء *</label><input type="date" id="leave-start" class="input" value="${M()}" /></div>
          <div class="form-group"><label>تاريخ الانتهاء *</label><input type="date" id="leave-end" class="input" value="${M()}" /></div>
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
            <input type="date" id="eos-date" class="input" value="${M()}" onchange="calculateEosIndemnity()" />
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
          <div class="form-group"><label>شهر الاستحقاق</label><input type="month" id="pr-month" class="input" value="${M().slice(0,7)}" onchange="onPayrollMonthChange()" /></div>
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
  `,await switchHrTab("employees")}window.switchHrTab=async a=>{document.querySelectorAll(".hr-tab-btn").forEach(i=>i.classList.remove("active"));const t=document.getElementById(`btn-tab-${a}`);t&&t.classList.add("active");const o=document.getElementById("hr-action-btns"),e=document.getElementById("hr-main-content");e&&(e.innerHTML='<div style="text-align:center; padding:60px;"><span class="spin" style="margin:0 auto;"></span></div>',await Promise.all([Ct(),Nt(),Dt(),Ht(),jt(),_t(),zt()]),a==="employees"?(o.innerHTML='<button class="btn btn-primary" onclick="openEmpModal()">+ إضافة موظف</button>',Ft(e)):a==="leaves"?(o.innerHTML='<button class="btn btn-primary" onclick="openLeaveModal()">🌴 تسجيل إجازة جديدة</button>',Rt(e)):a==="attendance"?(o.innerHTML="",Pt(e)):a==="loans"?(o.innerHTML='<button class="btn btn-primary" onclick="openLoanModal()">💸 صرف سلفة جديدة</button>',qt(e)):a==="payroll"?(o.innerHTML='<button class="btn btn-primary" onclick="openPayrollModal()">💳 إعداد مسير رواتب</button>',Ot(e)):(o.innerHTML='<button class="btn btn-primary" onclick="openEosModal()">🎓 تصفية موظف</button>',Gt(e)))};async function Ct(){x=await P(H.employees(),[K("name")])}async function Nt(){R=(await et(at(z(w,`companies/${E}/employeeLoans`),K("date","desc")))).docs.map(t=>({id:t.id,...t.data()}))}async function Dt(){tt=(await et(at(z(w,`companies/${E}/payrolls`),K("month","desc")))).docs.map(t=>({id:t.id,...t.data()}))}async function Ht(){bt=(await et(at(z(w,`companies/${E}/employeeLeaves`),K("startDate","desc")))).docs.map(t=>({id:t.id,...t.data()}))}async function jt(){(await et(at(z(w,`companies/${E}/employeeAttendance`),K("month","desc")))).docs.map(t=>({id:t.id,...t.data()}))}async function _t(){vt=(await et(at(z(w,`companies/${E}/employeeSettlements`),K("date","desc")))).docs.map(t=>({id:t.id,...t.data()}))}async function zt(){$=await P(H.chartOfAccounts()),q=await P(H.cashBoxes()),O=await P(H.bankAccounts())}function Ft(a){const t=[],o=new Date,e=30*24*60*60*1e3;let i=0,n=0;x.forEach(d=>{if(d.status==="active"&&(i++,n+=(d.salary||0)+(d.allowance||0)),d.status==="active"){if(d.nidExpiry){const l=new Date(d.nidExpiry)-o;l>0&&l<e?t.push(`⚠️ إقامة/هوية الموظف <strong>${d.name}</strong> تنتهي قريباً بتاريخ ${d.nidExpiry}`):l<=0&&t.push(`🚨 إقامة/هوية الموظف <strong>${d.name}</strong> منتهية الصلاحية منذ ${d.nidExpiry}`)}if(d.passportExpiry){const l=new Date(d.passportExpiry)-o;l>0&&l<e?t.push(`⚠️ جواز سفر الموظف <strong>${d.name}</strong> ينتهي قريباً بتاريخ ${d.passportExpiry}`):l<=0&&t.push(`🚨 جواز سفر الموظف <strong>${d.name}</strong> منتهية الصلاحية منذ ${d.passportExpiry}`)}}});let c="";t.length>0&&(c=`
      <div class="hr-alert-box">
        <div style="font-size:20px;">🚨</div>
        <div style="flex:1; display:flex; flex-direction:column; gap:4px;">
          ${t.map(d=>`<div>${d}</div>`).join("")}
        </div>
      </div>
    `);const m=i>0?n/i:0,s=`
    <!-- Summary KPIs -->
    <div class="grid-4 gap-16 mb-20">
      <div class="stats-card">
        <span class="stats-title">👥 إجمالي الموظفين</span>
        <span class="stats-val text-brand">${x.length} موظف</span>
      </div>
      <div class="stats-card">
        <span class="stats-title">✅ الموظفون النشطون</span>
        <span class="stats-val text-ok">${i} موظف</span>
      </div>
      <div class="stats-card">
        <span class="stats-title">💼 متوسط الرواتب الإجمالية</span>
        <span class="stats-val text-brand">${p(m)}</span>
      </div>
      <div class="stats-card">
        <span class="stats-title">📈 إجمالي التزام الرواتب شهرياً</span>
        <span class="stats-val text-bad">${p(n)}</span>
      </div>
    </div>
  `;if(!x.length){a.innerHTML=s+c+`
      <div class="card" style="text-align:center; padding:60px; color:var(--text-3);">
        <div style="font-size:40px; margin-bottom:12px;">👤</div>
        <div style="font-weight:700; font-size:15px; color:var(--text-1); margin-bottom:4px;">لا يوجد موظفين مسجلين حالياً</div>
        <div>انقر على زر "إضافة موظف" لإنشاء ملف الموظف الأول في نظام الموارد البشرية.</div>
      </div>`;return}a.innerHTML=s+c+`
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
            ${x.map(d=>{let l='<span class="badge" style="background:rgba(34,197,94,0.1); color:#22c55e;">نشط</span>';return d.status==="suspended"&&(l='<span class="badge" style="background:rgba(245,158,11,0.1); color:#f59e0b;">موقوف</span>'),d.status==="resigned"&&(l='<span class="badge" style="background:rgba(100,116,139,0.1); color:#64748b;">مستقيل</span>'),`
              <tr>
                <td><strong class="clickable-name" onclick="viewEmpDocumentDetails('${d.id}')">${d.name}</strong></td>
                <td>${d.job||"—"}</td>
                <td>
                  <span class="mono">${d.nid||"—"}</span><br>
                  <small style="color:var(--text-3); font-size:10px;">انتهاء: ${d.nidExpiry||"—"}</small>
                </td>
                <td class="mono">${p(d.salary)}</td>
                <td class="mono">${p(d.allowance||0)}</td>
                <td>${d.nationality==="saudi"?"🇸🇦 سعودي":"🌍 مقيم"}</td>
                <td>
                  <span style="font-size:12px;">${d.bankName||"—"}</span><br>
                  <small class="mono" style="color:var(--text-3); font-size:10px;">${d.iban||"—"}</small>
                </td>
                <td>${l}</td>
                <td>
                  <button class="btn btn-icon sm btn-ghost" onclick="editEmp('${d.id}')" title="تعديل">✏️</button>
                  <button class="btn btn-icon sm btn-ghost text-bad" onclick="delEmp('${d.id}','${d.name}')" title="حذف">🗑️</button>
                </td>
              </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function Rt(a){if(!bt.length){a.innerHTML=`
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
            ${bt.map(t=>{let o="سنوية";t.type==="sick"&&(o="🤒 مرضية"),t.type==="unpaid"&&(o="💸 بدون راتب"),t.type==="emergency"&&(o="🚨 اضطرارية");const e=new Date(t.startDate),i=new Date(t.endDate),n=Math.round((i-e)/(24*60*60*1e3))+1;return`
              <tr>
                <td><strong>${t.empName}</strong></td>
                <td>${o}</td>
                <td class="mono">${t.startDate}</td>
                <td class="mono">${t.endDate}</td>
                <td class="mono font-bold">${n} أيام</td>
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
  `}function Pt(a){const t=M().slice(0,7);a.innerHTML=`
    <div class="card mb-16" style="padding:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <label style="font-weight:700; font-size:13px;">تحديد الشهر:</label>
          <input type="month" id="att-selected-month" class="input" style="width:160px; height:36px; padding:4px 8px;" value="${t}" onchange="loadAttendanceForMonth()" />
        </div>
        <div>
          <button class="btn btn-primary" onclick="saveAttendanceLog()" id="save-att-btn" style="margin:0;">⏱️ حفظ سجل الحضور لهذا الشهر</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="table-container">
        <table class="data-dense" id="att-table" style="font-size:12px;">
          <thead>
            <tr>
              <th>الموظف</th>
              <th>المسمى الوظيفي</th>
              <th>الراتب الأساسي</th>
              <th>أيام الغياب</th>
              <th>ساعات العمل الإضافي</th>
            </tr>
          </thead>
          <tbody id="att-tbody"></tbody>
        </table>
      </div>
    </div>
  `,loadAttendanceForMonth()}window.loadAttendanceForMonth=async()=>{const a=document.getElementById("att-selected-month").value,t=document.getElementById("att-tbody");if(!t||!a)return;t.innerHTML='<tr><td colspan="5" style="text-align:center; padding:20px;"><span class="spin"></span> جاري تحميل سجلات الحضور…</td></tr>';const o=k(w,`companies/${E}/employeeAttendance`,a),e=await Y(o),i=x.filter(n=>n.status==="active");if(e.exists()){const n=e.data().items||[];t.innerHTML=i.map(c=>{const m=n.find(s=>s.empId===c.id)||{absentDays:0,overtimeHours:0};return`
        <tr class="att-row" data-id="${c.id}">
          <td><strong>${c.name}</strong></td>
          <td>${c.job||"—"}</td>
          <td class="mono">${p(c.salary)}</td>
          <td><input type="number" class="input mono att-absent" value="${m.absentDays||0}" min="0" max="30" step="0.5" style="width:80px; height:28px;" /></td>
          <td><input type="number" class="input mono att-overtime" value="${m.overtimeHours||0}" min="0" step="0.5" style="width:80px; height:28px;" /></td>
        </tr>
      `}).join("")}else t.innerHTML=i.map(n=>`
      <tr class="att-row" data-id="${n.id}">
        <td><strong>${n.name}</strong></td>
        <td>${n.job||"—"}</td>
        <td class="mono">${p(n.salary)}</td>
        <td><input type="number" class="input mono att-absent" value="0" min="0" max="30" step="0.5" style="width:80px; height:28px;" /></td>
        <td><input type="number" class="input mono att-overtime" value="0" min="0" step="0.5" style="width:80px; height:28px;" /></td>
      </tr>
    `).join("")};window.saveAttendanceLog=async()=>{const a=document.getElementById("att-selected-month").value,t=document.getElementById("save-att-btn");if(!(!a||!t)){t.disabled=!0,t.textContent="جاري الحفظ…";try{const o=[];document.querySelectorAll(".att-row").forEach(i=>{const n=i.dataset.id,c=x.find(d=>d.id===n),m=parseFloat(i.querySelector(".att-absent").value)||0,s=parseFloat(i.querySelector(".att-overtime").value)||0;o.push({empId:n,empName:c.name,absentDays:m,overtimeHours:s})});const e=k(w,`companies/${E}/employeeAttendance`,a);await ot(e,{month:a,items:o,updatedAt:j()}),showToast("✅ تم حفظ سجل حضور الموظفين لهذا الشهر بنجاح","success")}catch(o){showToast(o.message,"error")}finally{t.disabled=!1,t.textContent="⏱️ حفظ سجل الحضور لهذا الشهر"}}};window.onPayrollMonthChange=async()=>{const a=document.getElementById("pr-month").value;if(!a)return;const t=k(w,`companies/${E}/employeeAttendance`,a),o=await Y(t);if(o.exists()){const e=o.data().items||[];showToast(`📝 تم اكتشاف سجل حضور لشهر ${a} وتعبئة الحقول تلقائياً.`,"info"),document.querySelectorAll(".pr-row").forEach(i=>{const n=i.dataset.id,c=x.find(v=>v.id===n),m=e.find(v=>v.empId===n)||{absentDays:0,overtimeHours:0},s=i.querySelector(".pr-deduct"),d=i.querySelector(".pr-overtime"),l=c.salary||0,u=l/240*m.overtimeHours*1.5,r=l/30*m.absentDays;d&&(d.value=u.toFixed(2)),s&&(s.value=r.toFixed(2)),calculateRowNet(n,l,c.allowance||0)})}};function qt(a){const t=R.reduce((n,c)=>n+(c.amount||0),0),o=R.reduce((n,c)=>n+(c.paidAmount||0),0),e=R.reduce((n,c)=>n+(c.remainingBalance||0),0);let i="";R.length?i=`
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
            ${R.map(n=>{let c='<span class="badge" style="background:rgba(239,68,68,0.1); color:#ef4444;">قائمة</span>';return n.remainingBalance<=0&&(c='<span class="badge" style="background:rgba(34,197,94,0.1); color:#22c55e;">مسددة بالكامل</span>'),`
              <tr>
                <td class="mono">${n.date}</td>
                <td><strong>${n.empName}</strong></td>
                <td class="mono">${p(n.amount)}</td>
                <td class="mono text-ok">${p(n.paidAmount||0)}</td>
                <td class="mono text-bad font-bold">${p(n.remainingBalance)}</td>
                <td>${n.method==="cash"?"💵 نقدي":"🏦 تحويل بنكي"}</td>
                <td>${c}</td>
                <td><small style="color:var(--text-2);">${n.notes||"—"}</small></td>
                <td>
                  <button class="btn btn-icon sm btn-ghost text-bad" onclick="deleteLoan('${n.id}','${n.empName}',${n.amount})" ${n.paidAmount>0?"disabled":""} title="حذف">🗑️</button>
                </td>
              </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    `:i='<div style="text-align:center; padding:32px; color:var(--text-3);">لا توجد سلف أو قروض مسجلة حالياً للموظفين.</div>',a.innerHTML=`
    <!-- Summary KPIs -->
    <div class="grid-3 gap-16 mb-20">
      <div class="stats-card">
        <span class="stats-title">💰 إجمالي السلف المنصرفة</span>
        <span class="stats-val text-brand">${p(t)}</span>
      </div>
      <div class="stats-card">
        <span class="stats-title">✅ إجمالي المبالغ المستردة</span>
        <span class="stats-val text-ok">${p(o)}</span>
      </div>
      <div class="stats-card" style="background:rgba(239, 68, 68, 0.03);">
        <span class="stats-title">⚠️ صافي السلف القائمة</span>
        <span class="stats-val text-bad">${p(e)}</span>
      </div>
    </div>

    <div class="card">
      ${i}
    </div>
  `}function Ot(a){if(!tt.length){a.innerHTML=`
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
                <td class="mono font-bold text-bad">${p(t.amount)}</td>
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
  `}function Gt(a){if(!vt.length){a.innerHTML=`
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
            ${vt.map(t=>`
              <tr>
                <td class="mono">${t.date}</td>
                <td><strong>${t.empName}</strong></td>
                <td>${t.reason==="resignation"?"استقالة":"إنهاء عقد / فصل"}</td>
                <td class="mono font-bold text-bad">${p(t.indemnityAmount)}</td>
                <td>${t.method==="cash"?"💵 نقدي":"🏦 بنك"}</td>
                <td><small style="color:var(--text-3);">${t.notes||"—"}</small></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}window.openEmpModal=(a=null)=>{document.getElementById("emp-modal-title").textContent=a?"تعديل موظف":"إضافة موظف",document.getElementById("emp-id").value=a?.id||"",document.getElementById("emp-name").value=a?.name||"",document.getElementById("emp-job").value=a?.job||"",document.getElementById("emp-nid").value=a?.nid||"",document.getElementById("emp-nid-expiry").value=a?.nidExpiry||"",document.getElementById("emp-date").value=a?.date||M(),document.getElementById("emp-passport").value=a?.passportNo||"",document.getElementById("emp-passport-expiry").value=a?.passportExpiry||"",document.getElementById("emp-gosi-number").value=a?.gosiNumber||"",document.getElementById("emp-salary").value=a?.salary||"",document.getElementById("emp-allowance").value=a?.allowance||0,document.getElementById("emp-status").value=a?.status||"active",document.getElementById("emp-nationality").value=a?.nationality||"saudi",document.getElementById("emp-bank-name").value=a?.bankName||"",document.getElementById("emp-iban").value=a?.iban||"",document.getElementById("emp-error").classList.add("hidden"),openModal("emp-modal")};window.editEmp=a=>{const t=x.find(o=>o.id===a);t&&openEmpModal(t)};window.saveEmployee=async()=>{const a=document.getElementById("emp-error");a.classList.add("hidden");const t=document.getElementById("emp-id").value,o=document.getElementById("emp-name").value.trim(),e=parseFloat(document.getElementById("emp-salary").value),i=document.getElementById("emp-nid").value.trim(),n=document.getElementById("emp-nid-expiry").value;if(!o||isNaN(e)||!i||!n){a.textContent="يرجى إدخال الاسم بالكامل، رقم الهوية، تاريخ الانتهاء، والراتب الأساسي",a.classList.remove("hidden");return}const c={name:o,job:document.getElementById("emp-job").value.trim(),nid:i,nidExpiry:n,date:document.getElementById("emp-date").value,passportNo:document.getElementById("emp-passport").value.trim(),passportExpiry:document.getElementById("emp-passport-expiry").value,gosiNumber:document.getElementById("emp-gosi-number").value.trim(),salary:e,allowance:parseFloat(document.getElementById("emp-allowance").value)||0,status:document.getElementById("emp-status").value,nationality:document.getElementById("emp-nationality").value,bankName:document.getElementById("emp-bank-name").value.trim(),iban:document.getElementById("emp-iban").value.trim()},m=document.getElementById("save-emp-btn");m.disabled=!0;try{let s=t;if(t){await wt("employees",t,c);const u=x.find(r=>r.id===t);u&&u.accountId&&u.name!==o&&await Mt(u.accountId,o)}else{const u=await It(H.employees(),c);s=typeof u=="string"?u:u.id;try{const r=await Tt("employees",s,o);r&&await wt("employees",s,{accountId:r.accountId,accountCode:r.accountCode})}catch(r){console.warn("[syncEntityToCoa] فشل ربط الموظف بشجرة الحسابات:",r.message)}}const d=document.getElementById("emp-nid-upload");if(d&&d.files.length>0){const u=d.files[0];window.uploadFileToArchive(u,"employee_docs",s,`صورة إقامة/هوية الموظف: ${o}`).catch(r=>console.warn(r))}const l=document.getElementById("emp-passport-upload");if(l&&l.files.length>0){const u=l.files[0];window.uploadFileToArchive(u,"employee_docs",s,`صورة جواز سفر الموظف: ${o}`).catch(r=>console.warn(r))}showToast("تم حفظ بيانات الموظف","success"),closeModal("emp-modal"),await switchHrTab("employees")}catch(s){a.textContent=s.message,a.classList.remove("hidden")}finally{m.disabled=!1}};window.delEmp=async(a,t)=>{if(confirm(`تأكيد حذف الموظف ${t} نهائياً من سجل الموارد البشرية؟`))try{const o=x.find(e=>e.id===a);o&&o.accountId&&await St("employees",a,o.accountId),await kt("employees",a),showToast("تم حذف ملف الموظف بنجاح","success"),await switchHrTab("employees")}catch(o){showToast(o.message,"error")}};window.viewEmpDocumentDetails=a=>{const t=x.find(n=>n.id===a);if(!t)return;const o=new Date,e=n=>{if(!n)return'<span class="expiry-badge" style="background:#ddd; color:#333;">غير متوفر</span>';const m=new Date(n)-o,s=Math.ceil(m/(24*60*60*1e3));return s<=0?`<span class="expiry-badge danger">منتهية منذ ${Math.abs(s)} يوم</span>`:s<30?`<span class="expiry-badge warning">تنتهي خلال ${s} يوم</span>`:`<span class="expiry-badge good">صالحة (متبقي ${s} يوم)</span>`},i=document.getElementById("doc-details-body");i&&(i.innerHTML=`
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
            الأساسي: <strong class="mono text-brand">${p(t.salary)}</strong> | 
            البدلات: <strong class="mono text-ok">${p(t.allowance||0)}</strong>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; padding-bottom:6px;">
          <span>📅 تاريخ التوظيف والتعيين:</span>
          <strong class="mono">${t.date||"—"}</strong>
        </div>
      </div>
    </div>
  `,openModal("doc-details-modal"))};window.openLeaveModal=()=>{const a=x.filter(t=>t.status==="active");if(!a.length){showToast("لا يوجد موظفون نشطون لتسجيل إجازة لهم","warning");return}document.getElementById("leave-emp-id").innerHTML=a.map(t=>`<option value="${t.id}">${t.name}</option>`).join(""),document.getElementById("leave-start").value=M(),document.getElementById("leave-end").value=M(),document.getElementById("leave-notes").value="",document.getElementById("leave-error").classList.add("hidden"),openModal("leave-modal")};window.saveEmployeeLeave=async()=>{const a=document.getElementById("leave-error");a.classList.add("hidden");const t=document.getElementById("leave-emp-id").value,o=document.getElementById("leave-type").value,e=document.getElementById("leave-start").value,i=document.getElementById("leave-end").value,n=document.getElementById("leave-notes").value.trim();if(!t||!e||!i){a.textContent="يرجى ملء جميع الحقول الإجبارية",a.classList.remove("hidden");return}const c=new Date(e);if(new Date(i)<c){a.textContent="تاريخ الانتهاء لا يمكن أن يكون قبل تاريخ البدء",a.classList.remove("hidden");return}const s=x.find(l=>l.id===t),d=document.getElementById("save-leave-btn");d.disabled=!0;try{const l=k(z(w,`companies/${E}/employeeLeaves`));await ot(l,{empId:t,empName:s.name,type:o,startDate:e,endDate:i,notes:n,createdAt:j()}),showToast("✅ تم تسجيل إجازة الموظف بنجاح","success"),closeModal("leave-modal"),await switchHrTab("leaves")}catch(l){a.textContent=l.message,a.classList.remove("hidden")}finally{d.disabled=!1}};window.deleteLeave=async a=>{if(confirm("هل تريد بالتأكيد حذف سجل هذه الإجازة؟"))try{await Bt(k(w,`companies/${E}/employeeLeaves`,a)),showToast("تم حذف سجل الإجازة","success"),await switchHrTab("leaves")}catch(t){showToast(t.message,"error")}};window.openLoanModal=()=>{const a=document.getElementById("loan-emp-id"),t=x.filter(o=>o.status==="active");if(!t.length){showToast("لا يوجد موظفون نشطون لصرف سلف لهم","warning");return}a.innerHTML=t.map(o=>`<option value="${o.id}">${o.name}</option>`).join(""),document.getElementById("loan-date").value=M(),document.getElementById("loan-amount").value="",document.getElementById("loan-notes").value="",document.getElementById("loan-error").classList.add("hidden"),toggleLoanSource(),openModal("loan-modal")};window.toggleLoanSource=()=>{const a=document.getElementById("loan-method").value,t=document.getElementById("loan-source-label"),o=document.getElementById("loan-source");o.innerHTML='<option value="">اختر...</option>',a==="cash"?(t.textContent="صندوق الصرف *",o.innerHTML+=q.map(e=>`<option value="${e.id}">${e.name}</option>`).join("")):(t.textContent="الحساب البنكي المخصوم منه *",o.innerHTML+=O.map(e=>`<option value="${e.id}">${e.bankName} - ${e.accountNumber}</option>`).join(""))};window.saveEmployeeLoan=async()=>{const a=document.getElementById("loan-error");a.classList.add("hidden");const t=document.getElementById("loan-emp-id").value,o=document.getElementById("loan-date").value,e=parseFloat(document.getElementById("loan-amount").value),i=document.getElementById("loan-method").value,n=document.getElementById("loan-source").value,c=document.getElementById("loan-notes").value.trim();if(!t||!o||isNaN(e)||e<=0||!n||!c){a.textContent="الرجاء تعبئة كافة الحقول المطلوبة وكتابة بيان صحيح للسلفة",a.classList.remove("hidden");return}const m=x.find(d=>d.id===t),s=document.getElementById("save-loan-btn");s.disabled=!0;try{const d=$.find(y=>y.code==="1-1-5-4-1")||{id:"EMP_ADVANCES",code:"1-1-5-4-1",name:"سلف موظفين"};let l="",u="",r="",v=null;if(i==="cash"){const y=q.find(A=>A.id===n);l=y?.accountId,u=y?.code||"",r=y?.name||"",v=k(w,`companies/${E}/cashBoxes`,n)}else{const y=O.find(A=>A.id===n);l=y?.accountId,u=y?.code||"",r=y?.bankName||"",v=k(w,`companies/${E}/bankAccounts`,n)}if(!l)throw new Error("حساب الدفع المختار غير مربوط بشجرة الحسابات");const L=$.find(y=>y.id===l)||{id:l,code:u,name:r},h=k(z(w,`companies/${E}/employeeLoans`)),I={empId:t,empName:m.name,date:o,amount:e,paidAmount:0,remainingBalance:e,method:i,sourceId:n,notes:c,status:"active",createdAt:j()};if(await ot(h,I),await Z({date:o,description:`صرف سلفة للموظف ${m.name} - مستند ${h.id.slice(-6)}`,sourceType:"employee_advance",sourceId:h.id,lines:[{accountId:d.id,accountCode:d.code,accountName:d.name,debit:e,credit:0,note:`سلفة للموظف ${m.name}`},{accountId:L.id,accountCode:L.code,accountName:L.name,debit:0,credit:e,note:`صرف سلفة للموظف ${m.name} من ${L.name}`}]}),v){const y=await Y(v);if(y.exists()){const A=parseFloat(y.data().balance||0);await U(v,{balance:A-e,updatedAt:j()})}}showToast(`✅ تم صرف السلفة بنجاح للموظف ${m.name}`,"success"),closeModal("loan-modal"),await switchHrTab("loans")}catch(d){a.textContent=d.message,a.classList.remove("hidden")}finally{s.disabled=!1}};window.deleteLoan=async(a,t,o)=>{if(confirm(`تأكيد حذف وإلغاء سلفة الموظف ${t} بمبلغ ${o} ر.س؟`))try{const e=k(w,`companies/${E}/employeeLoans`,a),i=await Y(e);if(!i.exists())return;const n=i.data();let c=null;if(n.method==="cash"?c=k(w,`companies/${E}/cashBoxes`,n.sourceId):c=k(w,`companies/${E}/bankAccounts`,n.sourceId),c){const l=await Y(c);if(l.exists()){const u=parseFloat(l.data().balance||0);await U(c,{balance:u+o,updatedAt:j()})}}const m=$.find(l=>l.code==="1-1-5-4-1")||{id:"EMP_ADVANCES",code:"1-1-5-4-1"};let s="";n.method==="cash"?s=q.find(l=>l.id===n.sourceId)?.accountId:s=O.find(l=>l.id===n.sourceId)?.accountId;const d=$.find(l=>l.id===s);d&&await Z({date:M(),description:`عكس وإلغاء قيد سلفة الموظف ${t} - مستند ${a.slice(-6)}`,sourceType:"employee_advance_reversal",sourceId:a,lines:[{accountId:d.id,accountCode:d.code,accountName:d.name,debit:o,credit:0,note:"عكس قيد صرف سلفة ملغاة"},{accountId:m.id,accountCode:m.code,accountName:m.name,debit:0,credit:o,note:"تخفيض ذمة السلف للموظف بالإلغاء"}]}),await Bt(e),showToast("تم إلغاء السلفة وعكس القيد المحاسبي المترتب عليها","success"),await switchHrTab("loans")}catch(e){showToast(e.message,"error")}};window.openEosModal=()=>{const a=x.filter(e=>e.status==="active"||e.status==="suspended");if(!a.length){showToast("لا يوجد موظفون نشطون لإجراء تصفية نهاية خدمة لهم","warning");return}document.getElementById("eos-emp-id").innerHTML='<option value="">اختر الموظف...</option>'+a.map(e=>`<option value="${e.id}">${e.name}</option>`).join(""),document.getElementById("eos-date").value=M(),document.getElementById("eos-notes").value="",document.getElementById("eos-error").classList.add("hidden"),document.getElementById("eos-calc-details").innerHTML='<div class="alert info" style="margin:0;">يرجى اختيار الموظف لتحديث تفاصيل مدة الخدمة والمكافأة تلقائياً وفق قانون العمل.</div>';const t=$.filter(e=>e.type==="liability");document.getElementById("eos-account-id").innerHTML='<option value="">اختر...</option>'+t.map(e=>`<option value="${e.id}">${e.code} - ${e.name}</option>`).join("");const o=$.find(e=>e.code==="2-1-5-2");o&&(document.getElementById("eos-account-id").value=o.id),toggleEosSource(),openModal("eos-modal"),document.getElementById("save-eos-btn").disabled=!0};window.toggleEosSource=()=>{const a=document.getElementById("eos-method").value,t=document.getElementById("eos-source-label"),o=document.getElementById("eos-source");o.innerHTML='<option value="">اختر...</option>',a==="cash"?(t.textContent="صندوق الصرف *",o.innerHTML+=q.map(e=>`<option value="${e.id}">${e.name}</option>`).join("")):(t.textContent="الحساب البنكي المخصوم منه *",o.innerHTML+=O.map(e=>`<option value="${e.id}">${e.bankName} - ${e.accountNumber}</option>`).join(""))};window.calculateEosIndemnity=()=>{const a=document.getElementById("eos-emp-id").value,t=document.getElementById("eos-date").value,o=document.getElementById("eos-reason").value,e=document.getElementById("eos-calc-details"),i=document.getElementById("save-eos-btn");if(!a||!t||!e){i&&(i.disabled=!0);return}const n=x.find(C=>C.id===a);if(!n){i&&(i.disabled=!0);return}const c=new Date(n.date||M()),m=new Date(t);if(m-c<0){e.innerHTML=`<div class="text-bad" style="font-weight:bold; padding:8px; border:1px solid var(--border); border-radius:6px; background:rgba(239,68,68,0.05);">⚠️ تاريخ التصفية يجب أن يكون بعد تاريخ التعيين للموظف وهو (${n.date})</div>`,i&&(i.disabled=!0);return}i&&(i.disabled=!1);let d=m.getFullYear()-c.getFullYear(),l=m.getMonth()-c.getMonth(),u=m.getDate()-c.getDate();if(u<0){l--;const C=new Date(m.getFullYear(),m.getMonth(),0);u+=C.getDate()}l<0&&(d--,l+=12);const r=d+l/12+u/365.25,v=n.salary||0,L=n.allowance||0,h=v+L;let I=0,y="",A=0;if(r<=5)A=r*(h/2),y+=`• حساب أول 5 سنوات: ${r.toFixed(2)} سنة × نصف راتب (${p(h/2)}) = ${p(A)} ر.س<br>`;else{const C=5*(h/2),V=r-5,J=V*h;A=C+J,y+=`• حساب أول 5 سنوات: 5 سنوات × نصف راتب (${p(h/2)}) = ${p(C)} ر.س<br>`,y+=`• حساب ما بعد 5 سنوات: ${V.toFixed(2)} سنة × راتب كامل (${p(h)}) = ${p(J)} ر.س<br>`}let g=1,f="إنهاء عقد / فصل من العمل (تستحق المكافأة كاملة 100%)";o==="resignation"&&(r<2?(g=0,f="الخدمة أقل من سنتين في حالة الاستقالة (لا تستحق مكافأة 0%)"):r>=2&&r<5?(g=1/3,f="الخدمة بين 2 إلى 5 سنوات في حالة الاستقالة (تستحق ثلث المكافأة 33.3%)"):r>=5&&r<10?(g=2/3,f="الخدمة بين 5 إلى 10 سنوات في حالة الاستقالة (تستحق ثلثي المكافأة 66.6%)"):(g=1,f="الخدمة أكثر من 10 سنوات في حالة الاستقالة (تستحق المكافأة كاملة 100%)")),I=A*g,e.innerHTML=`
    <div style="background:var(--bg-2); border:1px solid var(--border); border-radius:12px; padding:16px; font-size:12px; line-height:1.6; color:var(--text-1);">
      <div style="margin-bottom:6px;"><strong>📅 تاريخ التعيين:</strong> ${n.date}</div>
      <div style="margin-bottom:8px;"><strong>⏱️ مدة الخدمة الفعلية:</strong> ${d} سنة، و ${l} شهر، و ${u} يوم (${r.toFixed(3)} سنة)</div>
      
      <div style="margin-top:8px; padding-top:8px; border-top:1px dashed var(--border); font-size:11px; color:var(--text-2);">
        <strong>⚙️ تفاصيل حساب المكافأة (حسب نظام العمل السعودي):</strong><br>
        ${y}
        <strong>الحالة:</strong> ${f}<br>
      </div>

      <div style="margin-top:12px; padding:12px; background:var(--brand-alpha, rgba(91, 127, 255, 0.1)); border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-weight:bold; font-size:14px; border:1px solid var(--brand-alpha);">
        <span>صافي مكافأة نهاية الخدمة المستحقة:</span>
        <span class="mono text-bad" style="font-size:16px;" id="calculated-eos-amount" data-val="${I.toFixed(2)}">${p(I)} ر.س</span>
      </div>
    </div>
  `};window.saveEosSettlement=async()=>{const a=document.getElementById("eos-error");a.classList.add("hidden");const t=document.getElementById("eos-emp-id").value,o=document.getElementById("eos-date").value,e=document.getElementById("eos-reason").value,i=document.getElementById("eos-method").value,n=document.getElementById("eos-source").value,c=document.getElementById("eos-account-id").value,m=document.getElementById("eos-notes").value.trim(),s=document.getElementById("calculated-eos-amount"),d=s&&parseFloat(s.dataset.val)||0;if(!t||!o||!n||!c){a.textContent="الرجاء تحديد كافة الحقول المطلوبة ومراجعة الحساب",a.classList.remove("hidden");return}const l=x.find(r=>r.id===t),u=document.getElementById("save-eos-btn");u.disabled=!0;try{let r="",v="",L="",h=null;if(i==="cash"){const g=q.find(f=>f.id===n);r=g?.accountId,v=g?.code||"",L=g?.name||"",h=k(w,`companies/${E}/cashBoxes`,n)}else{const g=O.find(f=>f.id===n);r=g?.accountId,v=g?.code||"",L=g?.bankName||"",h=k(w,`companies/${E}/bankAccounts`,n)}if(!r)throw new Error("حساب الصرف المختار غير مربوط بشجرة الحسابات");const I=$.find(g=>g.id===r)||{id:r,code:v,name:L},y=$.find(g=>g.id===c);await U(k(w,`companies/${E}/employees`,t),{status:"resigned"});const A=k(z(w,`companies/${E}/employeeSettlements`));if(await ot(A,{empId:t,empName:l.name,date:o,reason:e,indemnityAmount:d,method:i,sourceId:n,expenseAccId:c,notes:m||"تصفية نهاية خدمة الموظف المعتمدة",createdAt:j()}),d>0&&(await Z({date:o,description:`تصفية مستحقات ومكافأة نهاية خدمة الموظف ${l.name}`,sourceType:"employee_settlement",sourceId:A.id,lines:[{accountId:c,accountCode:y?.code||"",accountName:y?.name||"",debit:d,credit:0,note:`مكافأة نهاية خدمة الموظف ${l.name}`},{accountId:I.id,accountCode:I.code,accountName:I.name,debit:0,credit:d,note:`صرف مستحقات تصفية الموظف ${l.name}`}]}),h)){const g=await Y(h);if(g.exists()){const f=parseFloat(g.data().balance||0);await U(h,{balance:f-d,updatedAt:j()})}}showToast(`✅ تم اعتماد تصفية الموظف ${l.name} وصرف مستحقاته بنجاح`,"success"),closeModal("eos-modal"),await switchHrTab("eos")}catch(r){a.textContent=r.message,a.classList.remove("hidden")}finally{u.disabled=!1}};window.openPayrollModal=async()=>{const a=x.filter(s=>s.status==="active");if(!a.length){showToast("لا يوجد موظفون نشطون لإصدار رواتب لهم","warning");return}togglePrSource();const t=$.filter(s=>s.type==="expense");document.getElementById("pr-expense-acc").innerHTML='<option value="">اختر...</option>'+t.map(s=>`<option value="${s.id}">${s.code} - ${s.name}</option>`).join(""),document.getElementById("pr-allowance-acc").innerHTML='<option value="">اختر...</option>'+t.map(s=>`<option value="${s.id}">${s.code} - ${s.name}</option>`).join("");const o=$.find(s=>s.code==="5-2-2")||$.find(s=>s.code.startsWith("5-2")),e=$.find(s=>s.code==="5-2-5-1")||$.find(s=>s.code==="5-2-5");o&&(document.getElementById("pr-expense-acc").value=o.id),e&&(document.getElementById("pr-allowance-acc").value=e.id);const i=document.getElementById("pr-month")?.value||new Date().toISOString().slice(0,7),n={};try{const[s,d,l]=await Promise.all([P(H.salesReps()),P(H.receipts()),P(H.salesInvoices())]),u=d.filter(v=>v.date&&v.date.slice(0,7)===i&&v.entityType==="customer"),r=l.filter(v=>v.date&&v.date.slice(0,7)===i&&v.status!=="cancelled");s.forEach(v=>{let L=0;u.forEach(f=>{(f.repId===v.id||f.targetId===v.id)&&(L+=parseFloat(f.amount||0))});let h=0;r.forEach(f=>{f.repId===v.id&&(h+=parseFloat(f.totalWithVat||f.total||0))});const I=v.monthlyTarget||0,y=h<I?1:parseFloat(v.commissionRate||2.5),A=L*y/100,g=x.find(f=>f.id===v.employeeId||f.name.includes(v.name)||v.name.includes(f.name));g&&(n[g.id]=(n[g.id]||0)+A)})}catch(s){console.error("Error calculating rep commission for payroll:",s)}const c=document.getElementById("pr-tbody");let m=0;c.innerHTML=a.map(s=>{const l=R.filter(y=>y.empId===s.id&&y.remainingBalance>0).reduce((y,A)=>y+A.remainingBalance,0),u=s.salary||0,r=s.allowance||0,v=n[s.id]||0,L=u+r+v;m+=L;const h=l>0?Math.min(l,(u+r)*.25):0;let I=0;return s.nationality==="saudi"?I=(u+r)*.0975:I=0,`
      <tr class="pr-row" data-id="${s.id}" data-nationality="${s.nationality||"saudi"}">
        <td><strong>${s.name}</strong><br><small style="color:var(--text-3);">${s.job||""}</small></td>
        <td class="mono">${p(u)}</td>
        <td class="mono">${p(r)}</td>
        <td>
          <input type="number" class="input mono pr-overtime" value="0" min="0" step="0.01" style="height:28px; padding:2px; font-size:11px;" onchange="calculateRowNet('${s.id}', ${u}, ${r})" />
        </td>
        <td>
          <input type="number" class="input mono pr-bonus" value="${v.toFixed(2)}" min="0" step="0.01" style="height:28px; padding:2px; font-size:11px;" onchange="calculateRowNet('${s.id}', ${u}, ${r})" />
        </td>
        <td>
          <input type="number" class="input mono pr-deduct" value="0" min="0" step="0.01" style="height:28px; padding:2px; font-size:11px;" onchange="calculateRowNet('${s.id}', ${u}, ${r})" />
        </td>
        <td>
          <input type="number" class="input mono pr-gosi" value="${I.toFixed(2)}" min="0" step="0.01" style="height:28px; padding:2px; font-size:11px;" onchange="calculateRowNet('${s.id}', ${u}, ${r})" />
        </td>
        <td class="mono text-bad font-bold" id="loan-bal-${s.id}">${p(l)}</td>
        <td>
          <input type="number" class="input mono pr-repay" id="repay-input-${s.id}" data-max="${l}" value="${h.toFixed(2)}" min="0" max="${l}" step="0.01" style="height:28px; padding:2px; font-size:11px;" ${l<=0?"disabled":""} onchange="calculateRowNet('${s.id}', ${u}, ${r})" />
        </td>
        <td class="mono font-bold text-ok" id="net-${s.id}">${p(L-I-h)}</td>
      </tr>
    `}).join(""),document.getElementById("pr-total").textContent=`${p(m)} ر.س`,document.getElementById("pr-error").classList.add("hidden"),calculateGrandTotal(),openModal("payroll-modal")};window.calculateRowNet=(a,t,o)=>{const e=document.querySelector(`.pr-row[data-id="${a}"]`);if(!e)return;const i=parseFloat(e.querySelector(".pr-overtime").value)||0,n=parseFloat(e.querySelector(".pr-bonus").value)||0,c=parseFloat(e.querySelector(".pr-deduct").value)||0,m=parseFloat(e.querySelector(".pr-gosi").value)||0,s=e.querySelector(".pr-repay"),d=parseFloat(s.dataset.max)||0;let l=parseFloat(s.value)||0;l>d&&(l=d,s.value=d);const r=t+o+i+n-(c+m+l);document.getElementById(`net-${a}`).textContent=p(r),calculateGrandTotal()};window.submitPayroll=async()=>{const a=document.getElementById("pr-error");a.classList.add("hidden");const t=document.getElementById("pr-month").value,o=document.getElementById("pr-method").value,e=document.getElementById("pr-source").value,i=document.getElementById("pr-expense-acc").value,n=document.getElementById("pr-allowance-acc").value;if(!e||!i||!n){a.textContent="الرجاء تحديد مصدر الدفع وحسابات المصروفات للرواتب والبدلات",a.classList.remove("hidden");return}const c=document.getElementById("save-pr-btn");c.disabled=!0;try{let m=0,s=0,d=0,l=0,u=0,r=0,v=0,L=0,h=0;const I=[],y=await P(H.salesReps()),A=document.querySelectorAll(".pr-row");for(const b of A){const B=b.dataset.id,S=x.find(_=>_.id===B),N=S.salary||0,D=S.allowance||0,T=parseFloat(b.querySelector(".pr-overtime").value)||0,F=parseFloat(b.querySelector(".pr-bonus").value)||0,ft=parseFloat(b.querySelector(".pr-deduct").value)||0,mt=parseFloat(b.querySelector(".pr-gosi").value)||0,X=parseFloat(b.querySelector(".pr-repay").value)||0,xt=N+D+T+F-(ft+mt+X),$t=N+D;let st=0;if(S.nationality==="saudi"?st=$t*.1175:st=$t*.02,m+=xt,s+=N,d+=D,l+=T,y.some(_=>_.employeeId===B||_.name.includes(S.name)||S.name.includes(_.name))?r+=F:u+=F,v+=X,L+=mt,h+=st,I.push({empId:B,empName:S.name,basic:N,allowance:D,overtime:T,bonus:F,deduct:ft,gosi:mt,repay:X,employerGosi:st,net:xt}),X>0){let _=X;const At=R.filter(Q=>Q.empId===B&&Q.remainingBalance>0);for(const Q of At){if(_<=0)break;const ut=Math.min(_,Q.remainingBalance);await U(k(w,`companies/${E}/employeeLoans`,Q.id),{paidAmount:Et(ut),remainingBalance:Et(-ut),updatedAt:j()}),_-=ut}}}if(m<=0)throw new Error("لا توجد مبالغ صافية للصرف في هذا المسير");const g=$.find(b=>b.id===i),f=$.find(b=>b.id===n),C=$.find(b=>b.code==="5-2-7")||{id:"REP_COMMISSIONS",code:"5-2-7",name:"مصروف عمولات المناديب"},V=$.find(b=>b.code==="5-2-5-1")||{id:"PR_BONUSES",code:"5-2-5-1",name:"مصروف حوافز ومكافآت الموظفين"},J=$.find(b=>b.code==="1-1-5-4-1")||{id:"EMP_ADVANCES",code:"1-1-5-4-1",name:"سلف موظفين"},dt=$.find(b=>b.code==="2-1-5-1")||{id:"GOSI_LIABILITY",code:"2-1-5-1",name:"التأمينات الاجتماعية المستحقة"},lt=$.find(b=>b.code==="5-2-6")||{id:"GOSI_EXPENSE",code:"5-2-6",name:"التأمينات الاجتماعية — حصة صاحب العمل"},G=[{accountId:i,accountCode:g?.code||"",accountName:g?.name||"",debit:s+l,credit:0,note:`مصروف الرواتب الأساسية والإضافي لشهر ${t}`},{accountId:n,accountCode:f?.code||"",accountName:f?.name||"",debit:d,credit:0,note:`مصروف بدلات الموظفين لشهر ${t}`}];r>0&&G.push({accountId:C.id,accountCode:C.code,accountName:C.name,debit:r,credit:0,note:`مصروف عمولات مبيعات المناديب لشهر ${t}`}),u>0&&G.push({accountId:V.id,accountCode:V.code,accountName:V.name,debit:u,credit:0,note:`مصروف الحوافز والمكافآت للموظفين لشهر ${t}`}),h>0&&G.push({accountId:lt.id,accountCode:lt.code,accountName:lt.name,debit:h,credit:0,note:`مصروف مساهمة الشركة في التأمينات الاجتماعية شهر ${t}`});for(const b of I){const B=x.find(T=>T.id===b.empId);let S=B?.accountId,N=B?.accountCode||"",D=B?`رواتب مستحقة - ${B.name}`:"";if(!S){const T=$.find(F=>F.code==="2-1-5-2")||{id:"ACCRUED_SALARIES",code:"2-1-5-2",name:"رواتب ومستحقات الموظفين المستحقة"};S=T.id,N=T.code,D=T.name}G.push({accountId:S,accountCode:N,accountName:D,debit:0,credit:b.net,note:`استحقاق صافي راتب الموظف ${b.empName} لشهر ${t}`})}v>0&&G.push({accountId:J.id,accountCode:J.code,accountName:J.name,debit:0,credit:v,note:`استرداد سلف موظفين مستقطعة من الرواتب شهر ${t}`});const yt=L+h;yt>0&&G.push({accountId:dt.id,accountCode:dt.code,accountName:dt.name,debit:0,credit:yt,note:`التأمينات الاجتماعية المستحقة (خصم الموظفين + حصة الشركة) لشهر ${t}`});const it=`JE-PR-ACC-${t.replace("-","")}`;await Z({date:M(),description:`قيد استحقاق رواتب وعمولات الموظفين والمناديب لشهر ${t}`,sourceType:"payroll_accrual",sourceId:t,lines:G,entryNumber:it});const ct=[];for(const b of I){const B=x.find(T=>T.id===b.empId);let S=B?.accountId,N=B?.accountCode||"",D=B?`رواتب مستحقة - ${B.name}`:"";if(!S){const T=$.find(F=>F.code==="2-1-5-2")||{id:"ACCRUED_SALARIES",code:"2-1-5-2",name:"رواتب ومستحقات الموظفين المستحقة"};S=T.id,N=T.code,D=T.name}ct.push({accountId:S,accountCode:N,accountName:D,debit:b.net,credit:0,note:`تسوية وصرف صافي راتب الموظف ${b.empName} لشهر ${t}`})}let nt="",gt="",rt="",W=null;if(o==="cash"){const b=q.find(B=>B.id===e);nt=b?.accountId,gt=b?.code||"",rt=b?.name||"",W=k(w,`companies/${E}/cashBoxes`,e)}else{const b=O.find(B=>B.id===e);nt=b?.accountId,gt=b?.code||"",rt=b?.bankName||"",W=k(w,`companies/${E}/bankAccounts`,e)}const ht=$.find(b=>b.id===nt);ct.push({accountId:nt,accountCode:ht?.code||"",accountName:ht?.name||"",debit:0,credit:m,note:`دفع وصرف مسير رواتب شهر ${t} من حساب ${rt}`});const pt=`JE-PR-PAY-${t.replace("-","")}`;await Z({date:M(),description:`قيد صرف وتسوية مسير رواتب شهر ${t}`,sourceType:"payroll_payment",sourceId:t,lines:ct,entryNumber:pt});const Lt=k(z(w,`companies/${E}/payrolls`));if(await ot(Lt,{month:t,date:M(),amount:m,employeeCount:I.length,method:o,sourceId:e,expenseAccId:i,expenseAccName:g?.name||"",items:I,notes:`مسير رواتب شهر ${t} المعتمد - قيود: ${it} & ${pt}`,createdAt:j()}),await It(H.expenses(),{date:M(),amount:m,accountId:i,accountName:"مصروف رواتب وأجور",method:o,sourceId:e,sourceName:o==="cash"?"صندوق":"بنك",notes:`صرف مسير رواتب شهر ${t} - قيود: ${it} & ${pt}`}),W){const b=await Y(W);if(b.exists()){const B=parseFloat(b.data().balance||0);await U(W,{balance:B-m,updatedAt:j()})}}showToast("✅ تم اعتماد مسير الرواتب وترحيل القيود والرواتب بنجاح","success"),closeModal("payroll-modal"),await switchHrTab("payroll")}catch(m){a.textContent=m.message,a.classList.remove("hidden")}finally{c.disabled=!1}};window.printEmployeePayslip=(a,t,o,e,i,n,c,m,s,d)=>{const l=document.getElementById("payslip-modal-body");if(!l)return;const u=x.find(r=>r.id===a)||{name:"موظف"};l.innerHTML=`
    <div style="border:1px solid #ddd; padding:16px; border-radius:12px; background:#fff; font-family:'Cairo', sans-serif; direction:rtl;">
      <div style="text-align:center; border-bottom:2px dashed #ddd; padding-bottom:12px; margin-bottom:12px;">
        <h3 style="margin:0 0 4px 0; color:#111;">إدهام للمواد الغذائية</h3>
        <h4 style="margin:0; color:#555;">قسيمة تفصيل الراتب (Payslip)</h4>
        <span style="font-size:12px; color:#888;">شهر الاستحقاق: ${d}</span>
      </div>

      <div style="font-size:12px; display:flex; flex-direction:column; gap:6px; margin-bottom:16px; border-bottom:1px solid #eee; padding-bottom:10px;">
        <div><strong>الموظف:</strong> ${u.name}</div>
        <div><strong>المسمى الوظيفي:</strong> ${u.job||"—"}</div>
        <div><strong>رقم الهوية/الإقامة:</strong> ${u.nid||"—"}</div>
        ${u.iban?`<div><strong>رقم الآيبان:</strong> <span class="mono">${u.iban}</span></div>`:""}
      </div>

      <div style="display:flex; justify-content:space-between; gap:16px; font-size:12px;">
        <div style="flex:1;">
          <h5 style="margin:0 0 6px 0; color:#22c55e; border-bottom:1px solid #eee; padding-bottom:4px;">➕ المستحقات</h5>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>الراتب الأساسي:</span><span class="mono">${p(t)}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>البدلات:</span><span class="mono">${p(o)}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>الإضافي:</span><span class="mono">${p(e)}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>المكافآت:</span><span class="mono">${p(i)}</span></div>
          <div style="display:flex; justify-content:space-between; font-weight:bold; border-top:1px solid #eee; padding-top:4px;"><span>إجمالي المستحقات:</span><span class="mono">${p(t+o+e+i)}</span></div>
        </div>
        
        <div style="flex:1; border-right:1px solid #eee; padding-right:12px; margin-right:12px;">
          <h5 style="margin:0 0 6px 0; color:#ef4444; border-bottom:1px solid #eee; padding-bottom:4px;">➖ الاستقطاعات</h5>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>الخصومات/الغياب:</span><span class="mono">${p(n)}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>تأمينات (GOSI):</span><span class="mono">${p(c)}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>قسط السلفة:</span><span class="mono">${p(m)}</span></div>
          <div style="display:flex; justify-content:space-between; font-weight:bold; border-top:1px solid #eee; padding-top:4px;"><span>إجمالي الاستقطاعات:</span><span class="mono">${p(n+c+m)}</span></div>
        </div>
      </div>

      <div style="margin-top:20px; background:#f4f6fa; padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-weight:bold; font-size:14px; border:1px solid #e2e8f0;">
        <span>صافي الراتب المستحق:</span>
        <span class="mono text-bad" style="font-size:16px;">${p(s)} ر.س</span>
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
        <div><strong>إجمالي صافي المسير:</strong> <span class="text-bad font-bold">${p(t.amount)}</span></div>
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
                <td class="mono">${p(e.basic)}</td>
                <td class="mono">${p(e.allowance)}</td>
                <td class="mono text-ok">+${p(e.overtime||0)}</td>
                <td class="mono text-ok">+${p(e.bonus||0)}</td>
                <td class="mono text-bad">-${p(e.deduct||0)}</td>
                <td class="mono text-bad">-${p(e.gosi||0)}</td>
                <td class="mono text-bad font-bold">-${p(e.repay||0)}</td>
                <td class="font-bold text-ok mono">${p(e.net)}</td>
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
              <td class="mono">${p(e.basic)}</td>
              <td class="mono">${p(e.allowance)}</td>
              <td class="mono">${p(e.overtime||0)}</td>
              <td class="mono">${p(e.bonus||0)}</td>
              <td class="mono">${p(e.deduct||0)}</td>
              <td class="mono">${p(e.gosi||0)}</td>
              <td class="mono">${p(e.repay||0)}</td>
              <td class="mono"><strong>${p(e.net)} ر.س</strong></td>
            </tr>
          `).join("")}
          <tr style="background:#f5f5f5; font-weight:bold;">
            <td colspan="8">إجمالي رواتب المسير المعتمدة:</td>
            <td class="mono">${p(t.amount)} ر.س</td>
          </tr>
        </tbody>
      </table>

      <div class="footer-sigs">
        <div>إعداد القسم المالي: __________________</div>
        <div>اعتماد المدير العام: __________________</div>
      </div>
    </body>
    </html>
  `),o.document.close()};window.togglePrSource=()=>{const a=document.getElementById("pr-method").value,t=document.getElementById("pr-source-label"),o=document.getElementById("pr-source");o.innerHTML='<option value="">اختر...</option>',a==="cash"?(t.textContent="الصندوق *",o.innerHTML+=q.map(e=>`<option value="${e.id}">${e.name}</option>`).join("")):(t.textContent="الحساب البنكي *",o.innerHTML+=O.map(e=>`<option value="${e.id}">${e.bankName} - ${e.accountNumber}</option>`).join(""))};export{Zt as render};
