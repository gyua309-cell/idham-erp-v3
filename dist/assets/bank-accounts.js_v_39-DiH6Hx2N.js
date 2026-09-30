import{g as S,a as g,u as $,f,b as E,d as T,C,t as w,o as _,r as U,e as K}from"./index-BfKDPs3D.js";import{s as q,d as G}from"./coa-connector-CQfidtcM.js";import{orderBy as D,query as I,limit as J,getDocs as k,where as z,collection as H,doc as j,runTransaction as V,serverTimestamp as F}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let u=[],O=[],A="",N=null,P=[];function W(n){const t=(n.name||"").toLowerCase();return t.includes("راجحي")||t.includes("alrajhi")?{gradient:"linear-gradient(135deg, #1e3a8a 0%, #172554 100%)",border:"1.5px solid #3b82f6",shadow:"0 14px 30px -5px rgba(30,58,138,0.5)",icon:"🏛️",badgeText:"مصرف الراجحي"}:t.includes("أهلي")||t.includes("اهلي")||t.includes("snb")?{gradient:"linear-gradient(135deg, #065f46 0%, #022c22 100%)",border:"1.5px solid #10b981",shadow:"0 14px 30px -5px rgba(6,95,70,0.5)",icon:"🏢",badgeText:"البنك الأهلي SNB"}:t.includes("جزيرة")||t.includes("jazira")?{gradient:"linear-gradient(135deg, #0369a1 0%, #082f49 100%)",border:"1.5px solid #38bdf8",shadow:"0 14px 30px -5px rgba(2,132,199,0.5)",icon:"🌊",badgeText:"بنك الجزيرة"}:t.includes("رياض")||t.includes("riyad")?{gradient:"linear-gradient(135deg, #9a3412 0%, #431407 100%)",border:"1.5px solid #f97316",shadow:"0 14px 30px -5px rgba(154,52,18,0.5)",icon:"🏧",badgeText:"بنك الرياض"}:t.includes("إنماء")||t.includes("انماء")||t.includes("alinma")?{gradient:"linear-gradient(135deg, #78350f 0%, #451a03 100%)",border:"1.5px solid #f59e0b",shadow:"0 14px 30px -5px rgba(217,119,6,0.5)",icon:"🌾",badgeText:"مصرف الإنماء"}:t.includes("بلاد")||t.includes("bilad")?{gradient:"linear-gradient(135deg, #831843 0%, #500724 100%)",border:"1.5px solid #f43f5e",shadow:"0 14px 30px -5px rgba(225,29,72,0.5)",icon:"💎",badgeText:"بنك البلاد"}:{gradient:"linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",border:"1.5px solid #64748b",shadow:"0 14px 30px -5px rgba(15,23,42,0.5)",icon:"🏦",badgeText:"حساب بنكي رسمي"}}async function at(n,t){n.innerHTML=`
    <!-- Top Actions Header -->
    <div class="filterbar" style="flex-wrap:wrap;gap:10px;align-items:center;background:var(--bg-1);padding:14px 18px;border-radius:14px;border:1px solid var(--border-soft);margin-bottom:20px;">
      <div style="margin-right:auto;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="exportPagePDF('.data-dense','الحسابات_البنكية')" title="تصدير PDF">📄 PDF</button>
        <button class="btn btn-secondary btn-sm" onclick="exportPageExcel('.data-dense','الحسابات_البنكية')" title="تصدير Excel">📊 Excel</button>
        <button class="btn btn-secondary btn-sm" onclick="window.print()" title="طباعة">🖨️ طباعة</button>
        <button class="btn btn-secondary btn-sm" onclick="openBankTxnModal()">+ حركة بنكية جديد</button>
        <button class="btn btn-primary" onclick="openBankModal()">+ حساب بنكي جديد</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header" style="margin-bottom:16px;">
        <h1 class="page-title" style="font-size:22px;font-weight:900;">🏦 إدارة الحسابات البنكية والتحويلات الرسمية</h1>
        <p class="page-subtitle" style="color:var(--text-3);font-size:13px;">إدارة الحسابات البنكية السعودية (الراجحي، الأهلي، الرياض...) والتحويلات الإيداعية والمصروفات البنكية</p>
      </div>

      <!-- Luxury Color Cards Grid for Banks -->
      <div class="grid-3 gap-16 mb-24" id="ba-grid">
        <div class="page-loading"><div class="loading-spinner"></div></div>
      </div>

      <!-- Filter Bar for Bank Transactions -->
      <div class="card" style="margin-bottom:24px;">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border-soft);">
          <div>
            <h3 style="font-size:16px;font-weight:800;margin:0;" id="ba-txn-table-title">📑 سجل ودعم كشف الحركات البنكية</h3>
            <p style="font-size:12px;color:var(--text-3);margin:2px 0 0 0;" id="ba-txn-table-subtitle">انقر على أي كارت بنكي بالأعلى للتصفية المباشرة عليه أو استعراض كشف الحساب البنكي التفصيلي</p>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-reset-bank-filter" onclick="filterBankTxnsByCard('')" style="display:none;">✕ عرض كافة البنوك</button>
        </div>

        <div style="padding:14px 20px;background:var(--bg-2);border-bottom:1px solid var(--border-soft);display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <div style="flex:1;min-width:180px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">تصفية بالبنك</label>
            <select id="filter-ba-box" class="input" onchange="applyBankTxnFilters()" style="font-size:12.5px;">
              <option value="">جميع الحسابات البنكية</option>
            </select>
          </div>
          <div style="width:140px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">من تاريخ</label>
            <input type="date" id="filter-ba-from" class="input" onchange="applyBankTxnFilters()" style="font-size:12px;" />
          </div>
          <div style="width:140px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">إلى تاريخ</label>
            <input type="date" id="filter-ba-to" class="input" onchange="applyBankTxnFilters()" style="font-size:12px;" />
          </div>
          <div style="width:140px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">نوع الحركة</label>
            <select id="filter-ba-type" class="input" onchange="applyBankTxnFilters()" style="font-size:12.5px;">
              <option value="">كل الحركات</option>
              <option value="in">إيداعات واردة (+)</option>
              <option value="out">حوالات صادرة (-)</option>
            </select>
          </div>
          <div style="flex:1;min-width:200px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">🔍 بحث بالبيان / المرجع</label>
            <input type="text" id="filter-ba-search" class="input" placeholder="اكتب بياناً أو مرجعاً للبحث..." oninput="applyBankTxnFilters()" style="font-size:12.5px;" />
          </div>
        </div>

        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>البنك</th>
                <th>نوع الحركة</th>
                <th>رقم المرجع / الحوالة</th>
                <th>البيان</th>
                <th>المبلغ</th>
                <th>الرصيد بعد الحركة</th>
              </tr>
            </thead>
            <tbody id="ba-tbody">
              ${Array(6).fill(0).map(()=>`
                <tr class="skeleton-row">
                  ${Array(7).fill(0).map(()=>`<td><div class="sk" style="width:${40+Math.random()*80|0}px; height:12px; margin:4px 0;"></div></td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: NEW / EDIT BANK ACCOUNT ═══ -->
    <div class="modal-overlay" id="ba-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="ba-modal-title">إضافة حساب بنكي</h3>
          <button class="modal-close" onclick="closeModal('ba-modal')">×</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="ba-edit-id" />
          <div class="form-group mb-16">
            <label>اسم البنك / الحساب *</label>
            <input type="text" id="ba-name" class="input" placeholder="مثال: مصرف الراجحي — الحساب الرئيسي" />
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>رقم الحساب</label>
              <input type="text" id="ba-acc-num" class="input mono" placeholder="1234567890" />
            </div>
            <div class="form-group">
              <label>رقم الآيبان (IBAN)</label>
              <input type="text" id="ba-iban" class="input mono" placeholder="SA0000000000000000000000" />
            </div>
          </div>
          <div class="form-group mb-16">
            <label>الرصيد الافتتاحي (ر.س)</label>
            <input type="number" id="ba-opening" class="input mono" step="0.01" placeholder="0.00" />
          </div>
          <div class="form-group mb-16" id="ba-coa-toggle-wrap" style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="ba-coa-toggle" checked style="width:16px;height:16px;cursor:pointer;" />
            <label for="ba-coa-toggle" style="margin-bottom:0;cursor:pointer;font-weight:bold;">إنشاء حساب مستقل في شجرة الحسابات</label>
          </div>
          <div id="ba-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('ba-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveBankAccount()" id="save-ba-btn">حفظ الحساب</button>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: BANK TRANSACTION ═══ -->
    <div class="modal-overlay" id="ba-txn-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">تسجيل حركة بنكية</h3>
          <button class="modal-close" onclick="closeModal('ba-txn-modal')">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group mb-16">
            <label>الحساب البنكي *</label>
            <select id="btxn-acc"></select>
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>نوع الحركة *</label>
              <select id="btxn-type">
                <option value="in">إيداع / تحويل وارد (+)</option>
                <option value="out">سحب / تحويل صادرة (-)</option>
              </select>
            </div>
            <div class="form-group">
              <label>المبلغ (ر.س) *</label>
              <input type="number" id="btxn-amount" class="input mono" step="0.01" min="0.01" />
            </div>
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>رقم مرجع الحوالة</label>
              <input type="text" id="btxn-ref" class="input mono" placeholder="TRX-987654" />
            </div>
            <div class="form-group">
              <label>البيان / الملاحظات *</label>
              <input type="text" id="btxn-notes" class="input" placeholder="مثال: تحويل سداد عميل، سداد مورد..." />
            </div>
          </div>
          <div id="btxn-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('ba-txn-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveBankTxn()" id="save-btxn-btn">💾 حفظ الحركة</button>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: DETAILED BANK STATEMENT OF ACCOUNT ═══ -->
    <div class="modal-overlay" id="ba-statement-modal">
      <div class="modal modal-lg" style="max-width:920px;border-radius:20px;overflow:hidden;">
        <div class="modal-header" style="background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);color:#fff;padding:18px 24px;">
          <h3 class="modal-title" id="ba-stmt-modal-title" style="color:#fff;font-size:18px;font-weight:900;">📄 كشف حساب بنكي تفصيلي رسمي</h3>
          <button class="modal-close" onclick="closeModal('ba-statement-modal')" style="color:#fff;opacity:0.8;">×</button>
        </div>
        <div class="modal-body" id="ba-stmt-body" style="padding:20px;background:#f8fafc;">
          <!-- Loaded dynamically -->
        </div>
        <div class="modal-footer" style="background:#f1f5f9;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;">
          <button class="btn btn-secondary" onclick="closeModal('ba-statement-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="printBankStatementHTML()">🖨️ طباعة رسمية لكشف الحساب البنكي</button>
        </div>
      </div>
    </div>
  `,await B(),await R()}async function B(){const n=document.getElementById("ba-grid"),t=document.getElementById("filter-ba-box");if(n)try{u=await S(g.bankAccounts(),[D("name")]);const d=await S(g.chartOfAccounts());for(const e of u){const s=d.find(p=>p.id===e.accountId||p.code===e.accountCode);if(s){const p=s.balance||0;e.balance!==p&&(e.balance=p,await $("bankAccounts",e.id,{balance:p}))}}if(t&&(t.innerHTML='<option value="">جميع الحسابات البنكية</option>'+u.map(e=>`<option value="${e.id}" ${e.id===A?"selected":""}>${e.name}</option>`).join("")),u.length===0){n.innerHTML='<div class="empty-state" style="grid-column:span 3;"><div class="empty-icon">🏦</div><h3>لا توجد حسابات بنكية</h3><p>اضغط على "حساب بنكي جديد" لإضافة حسابك في البنك</p></div>';return}n.innerHTML=u.map(e=>{const s=W(e),p=A===e.id;return`
        <div class="card ba-card-luxury ba-card-interactive" onclick="filterBankTxnsByCard('${e.id}')" style="background:${s.gradient}; border:${s.border}; box-shadow:${s.shadow}; cursor:pointer; ${p?"outline:3.5px solid #ffffff;transform:scale(1.02);":""}">
          
          <div style="position:absolute; top:-15px; left:-15px; font-size:95px; opacity:0.12; pointer-events:none; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">${s.icon}</div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; position:relative; z-index:2;">
            <span class="ba-badge" style="font-size:11.5px; display:inline-flex; align-items:center; gap:6px;">
              <span>${s.icon}</span> <span>${s.badgeText}</span>
            </span>
            <div style="display:flex; gap:6px;" onclick="event.stopPropagation();">
              <button class="btn btn-icon sm" onclick="openBankStatementModal('${e.id}')" style="background:rgba(255,255,255,0.22); color:#ffffff !important; border:1px solid rgba(255,255,255,0.3); border-radius:8px;" title="كشف حساب تفصيلي">📄</button>
              <button class="btn btn-icon sm" onclick="openBankModal('${e.id}')" style="background:rgba(255,255,255,0.22); color:#ffffff !important; border:1px solid rgba(255,255,255,0.3); border-radius:8px;" title="تعديل">✏️</button>
              <button class="btn btn-icon sm" onclick="deleteBankAccount('${e.id}','${e.name}')" style="background:rgba(239,68,68,0.4); color:#ffffff !important; border:1px solid rgba(239,68,68,0.6); border-radius:8px;" title="حذف">🗑️</button>
            </div>
          </div>

          <h3 class="ba-bank-title" style="margin:0 0 6px 0; position:relative; z-index:2;">${e.name}</h3>
          
          <div class="ba-iban-text" style="margin-bottom:14px; position:relative; z-index:2; display:flex; align-items:center; gap:6px;">
            <span style="opacity:0.85;">الآيبان:</span>
            <span style="font-family:var(--font-mono, monospace); font-weight:800; direction:ltr; letter-spacing:0.5px; color:#ffffff !important;">${e.iban||"غير مسجل"}</span>
            ${e.iban?`<button class="btn btn-icon sm" onclick="event.stopPropagation(); navigator.clipboard.writeText('${e.iban}'); alert('تم نسخ الآيبان ✅');" style="background:transparent; border:none; color:#ffffff !important; padding:0 2px; font-size:12px; cursor:pointer;" title="نسخ الآيبان">📋</button>`:""}
          </div>

          <div class="ba-amount-box" style="position:relative; z-index:2;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:12px; font-weight:800; color:rgba(255,255,255,0.95) !important;">💰 الرصيد الحالي المتاح</span>
              <span style="font-size:10.5px; font-weight:800; background:rgba(16,185,129,0.35); border:1px solid rgba(16,185,129,0.6); padding:2px 8px; border-radius:12px; color:#a7f3d0 !important;">رصيد مباشر</span>
            </div>
            <div class="ba-balance-value" style="direction:ltr; text-align:right;">
              ${f(e.balance||0)}
            </div>
          </div>

          <div style="margin-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:11.5px; position:relative; z-index:2;">
            <span style="color:rgba(255,255,255,0.95) !important; font-weight:700;">
              ${p?"🎯 تصفية نشطة للجدول":"🔍 انقر لتصفية الحركات"}
            </span>
            <button onclick="event.stopPropagation(); openBankStatementModal('${e.id}')" style="background:transparent; border:none; color:#ffffff !important; text-decoration:underline; font-size:11.5px; font-weight:800; cursor:pointer; padding:0;">
              كشف الحساب التفصيلي 📄
            </button>
          </div>
        </div>`}).join("")}catch(d){n.innerHTML=`<div class="alert bad">${d.message}</div>`}}async function R(){const n=document.getElementById("ba-tbody");if(n)try{const t=I(g.bankTransactions(),D("createdAt","desc"),J(200));O=(await k(t)).docs.map(e=>({id:e.id,...e.data()})),applyBankTxnFilters()}catch(t){n.innerHTML=`<tr><td colspan="7"><div class="alert bad" style="margin:8px;">${t.message}</div></td></tr>`}}window.filterBankTxnsByCard=n=>{A=n;const t=document.getElementById("filter-ba-box");t&&(t.value=n);const d=document.getElementById("btn-reset-bank-filter");d&&(d.style.display=n?"inline-block":"none"),B(),applyBankTxnFilters()};window.applyBankTxnFilters=()=>{const n=document.getElementById("filter-ba-box")?.value||A||"",t=document.getElementById("filter-ba-from")?.value||"",d=document.getElementById("filter-ba-to")?.value||"",e=document.getElementById("filter-ba-type")?.value||"",s=(document.getElementById("filter-ba-search")?.value||"").trim().toLowerCase(),p=document.getElementById("ba-tbody"),x=document.getElementById("ba-txn-table-title"),b=document.getElementById("ba-txn-table-subtitle");if(!p)return;let l=[...O];if(n){l=l.filter(r=>r.bankAccountId===n);const o=u.find(r=>r.id===n);x&&(x.textContent=`📑 كشف حركات: ${o?o.name:"الحساب البنكي"}`),b&&(b.textContent=`سجل الحركات المصروفة والمقيدة للحساب البنكي (${l.length} حركة)`)}else x&&(x.textContent="📑 سجل ودعم كشف الحركات البنكية الأخيرة"),b&&(b.textContent="انقر على أي كارت بنكي بالأعلى للتصفية المباشرة عليه أو استعراض كشف الحساب التفصيلي");t&&(l=l.filter(o=>o.createdAt&&(o.createdAt.seconds?E(o.createdAt)>=t:!0))),d&&(l=l.filter(o=>o.createdAt&&(o.createdAt.seconds?E(o.createdAt)<=d:!0))),e&&(l=l.filter(o=>o.type===e)),s&&(l=l.filter(o=>(o.notes||"").toLowerCase().includes(s)||(o.refNumber||"").toLowerCase().includes(s)||(o.bankAccountId||"").toLowerCase().includes(s)));const c={};if(u.forEach(o=>c[o.id]=o.name),l.length===0){p.innerHTML='<tr><td colspan="7" style="text-align:center;padding:36px;color:var(--text-2);font-weight:700;">🔍 لا توجد حركات بنكية مطابقة للتصفية المختارة</td></tr>';return}p.innerHTML=l.map(o=>{const r=o.type==="in",y=r?"background:#eff6ff;color:#1d4ed8;border:1px solid #93c5fd;font-weight:800;":"background:#fef2f2;color:#dc2626;border:1px solid #fecaca;font-weight:800;";return`
      <tr style="transition:all 0.15s ease;">
        <td class="mono font-bold" style="font-size:12.5px;">${E(o.createdAt)}</td>
        <td><strong style="color:var(--text-1);">${c[o.bankAccountId]||o.bankAccountId}</strong></td>
        <td><span class="badge" style="${y}padding:4px 10px;border-radius:8px;">${r?"إيداع وارد (+)":"سحب / تحويل (-)"}</span></td>
        <td class="mono font-bold" style="font-size:11.5px;"><span dir="ltr" style="background:var(--bg-2);padding:2px 8px;border-radius:6px;">${o.refNumber||"—"}</span></td>
        <td><span style="font-size:12.5px;color:var(--text-2);font-weight:600;">${o.notes||"—"}</span></td>
        <td class="mono font-bold ${r?"text-ok":"text-bad"}" style="font-size:13.5px;">${r?"+":"-"}${f(o.amount)}</td>
        <td class="mono font-bold" style="font-size:12.5px;"><span dir="ltr" style="display:inline-block;direction:ltr;background:var(--bg-2);padding:2px 8px;border-radius:6px;">${f(o.balanceAfter||0)}</span></td>
      </tr>`}).join("")};window.openBankAccountStatementModal=async n=>{const t=u.find(s=>s.id===n);if(!t)return;N=t;const d=document.getElementById("ba-stmt-modal-title"),e=document.getElementById("ba-stmt-body");d&&(d.textContent=`📄 كشف حساب بنكي تفصيلي شامل — ${t.name}`),e&&(e.innerHTML=`<div style="text-align:center;padding:40px;"><span class="spin"></span> جاري تجميع وتحليل كشف الحساب البنكي والتحويلات لحساب ${t.name}…</div>`),openModal("ba-statement-modal");try{const s=t.accountCode||t.code||"",[p,x,b,l]=await Promise.all([k(I(g.bankTransactions(),z("bankAccountId","==",n))),k(I(g.receipts(),z("sourceId","==",n))),k(I(g.expenses(),z("sourceId","==",n))),k(H(T,`companies/${C}/journalEntries`))]),c=[],o=new Set;p.forEach(a=>{const i=a.data(),m=i.createdAt?.seconds?E(i.createdAt):i.date||w();o.add(a.id);const v=i.type==="in";c.push({id:a.id,date:m,icon:v?"🏛️ 📥":"🏦 📤",badgeText:v?"إيداع بنكي":"حوالة بنكية صادرة",badgeClass:v?"good":"bad",notes:i.notes||"حركة بنكية رسمية",inflow:v&&i.amount||0,outflow:v?0:i.amount||0,ref:i.refNumber||`BTX-${a.id.substring(0,6).toUpperCase()}`})}),x.forEach(a=>{if(o.has(a.id))return;const i=a.data();o.add(a.id),c.push({id:a.id,date:i.date||w(),icon:"💳 📥",badgeText:"تحصيل تحويل بنكي (سند قبض)",badgeClass:"good",notes:`تحصيل من العميل: ${i.customerName||i.accountName||"عميل"} — ${i.notes||""}`,inflow:i.amount||0,outflow:0,ref:i.displayCode||i.code||`RV-${a.id.substring(0,6).toUpperCase()}`})}),b.forEach(a=>{if(o.has(a.id))return;const i=a.data();o.add(a.id),c.push({id:a.id,date:i.date||w(),icon:"🏦 📤",badgeText:"مصروفات بنكية (سند صرف)",badgeClass:"bad",notes:`صرف تحويل لصالح: ${i.supplierName||i.accountName||"جهة"} — ${i.category||i.notes||""}`,inflow:0,outflow:i.amount||0,ref:i.code||`PV-${a.id.substring(0,6).toUpperCase()}`})}),s&&l.forEach(a=>{const i=a.data();i.status==="cancelled"||i.isReversed||(i.lines||[]).forEach(m=>{if(m.accountCode===s||m.accountName&&m.accountName.includes(t.name)){const v=i.code||i.entryNumber||i.id.slice(0,8);if(o.has(v)||o.has(a.id))return;o.add(a.id);const M=Number(m.debit||0),L=Number(m.credit||0);M>0?c.push({id:a.id,date:i.date||w(),icon:"🏛️ 📥",badgeText:"قيد بنكي مدين (+)",badgeClass:"good",notes:`${i.description||m.note||"إيداع بنكي بقيد يومية"}`,inflow:M,outflow:0,ref:v}):L>0&&c.push({id:a.id,date:i.date||w(),icon:"🏦 📤",badgeText:"قيد بنكي دائن (-)",badgeClass:"bad",notes:`${i.description||m.note||"سحب بنكي بقيد يومية"}`,inflow:0,outflow:L,ref:v})}})}),c.sort((a,i)=>(a.date||"").localeCompare(i.date||""));let r=0,y=0,h=0;c.forEach(a=>{y+=a.inflow,h+=a.outflow,r+=a.inflow-a.outflow,a.balanceAfter=r}),P=c,e.innerHTML=`
      <!-- Bank Info Banner -->
      <div style="background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); border-radius:16px; padding:20px 24px; color:#fff; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; box-shadow:0 8px 20px rgba(15,23,42,0.3);">
        <div>
          <div style="font-size:11px; color:#93c5fd; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">كشف الحساب البنكي التفصيلي المعتمد</div>
          <h2 style="font-size:22px; font-weight:900; margin:4px 0 4px 0; color:#ffffff;">${t.name}</h2>
          <div style="font-size:12.5px; color:#cbd5e1;">رقم الآيبان IBAN: <span style="font-family:monospace;font-weight:800;color:#67e8f9;">${t.iban||"—"}</span> ${t.accountNumber?`| رقم الحساب: <span style="font-family:monospace;color:#ffffff;">${t.accountNumber}</span>`:""} ${s?`| كود الشجرة: <span style="font-family:monospace;color:#67e8f9;">${s}</span>`:""}</div>
        </div>
        <div style="text-align:left; background:rgba(255,255,255,0.12); padding:12px 20px; border-radius:14px; border:1px solid rgba(255,255,255,0.25);">
          <div style="font-size:11px; color:#93c5fd; font-weight:700;">الرصيد النهائي الفعلي في البنك</div>
          <div class="mono" style="font-size:24px; font-weight:900; direction:ltr; color:#ffffff;">${f(t.balance||0)}</div>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid-3 gap-12 mb-20">
        <div style="background:#eff6ff; border:1.5px solid #bfdbfe; border-radius:14px; padding:16px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
          <div style="font-size:11.5px; color:#1d4ed8; font-weight:800;">إجمالي التحويلات والإيداعات الواردة (+)</div>
          <div class="mono text-ok" style="font-size:20px; font-weight:900; margin-top:4px;">+${f(y)}</div>
        </div>
        <div style="background:#fef2f2; border:1.5px solid #fecaca; border-radius:14px; padding:16px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
          <div style="font-size:11.5px; color:#dc2626; font-weight:800;">إجمالي التحويلات والمصروفات الصادرة (-)</div>
          <div class="mono text-bad" style="font-size:20px; font-weight:900; margin-top:4px;">-${f(h)}</div>
        </div>
        <div style="background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:14px; padding:16px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
          <div style="font-size:11.5px; color:#334155; font-weight:800;">إجمالي عدد العمليات المقيدة</div>
          <div class="mono" style="font-size:20px; font-weight:900; color:#0f172a; margin-top:4px;">${c.length} حركة</div>
        </div>
      </div>

      <!-- Statement Table -->
      <div class="table-container" style="background:#fff; border-radius:14px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.03);">
        <table class="data-dense" style="width:100%; font-size:12px;">
          <thead>
            <tr style="background:#0f172a; color:#ffffff;">
              <th style="padding:10px 12px; width:90px;">التاريخ</th>
              <th style="padding:10px 12px; width:180px;">نوع الحركة والرمز</th>
              <th style="padding:10px 12px; width:110px;">المرجع / الحوالة</th>
              <th style="padding:10px 12px;">البيان والسبب التفصيلي</th>
              <th style="padding:10px 12px; text-align:left; width:110px;">وارد (+)</th>
              <th style="padding:10px 12px; text-align:left; width:110px;">صادر (-)</th>
              <th style="padding:10px 12px; text-align:left; width:125px;">الرصيد التراكمي</th>
            </tr>
          </thead>
          <tbody>
            ${c.length?c.map(a=>`
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td class="mono font-bold" style="font-size:12px; padding:10px 12px;">${a.date}</td>
                <td style="padding:10px 12px;">
                  <span style="display:inline-flex; align-items:center; gap:6px; background:${a.inflow?"#eff6ff":"#fef2f2"}; color:${a.inflow?"#1d4ed8":"#991b1b"}; padding:4px 10px; border-radius:8px; font-weight:800; font-size:11.5px; border:1px solid ${a.inflow?"#bfdbfe":"#fca5a5"};">
                    <span>${a.icon}</span> <span>${a.badgeText}</span>
                  </span>
                </td>
                <td class="mono" style="font-size:11px; padding:10px 12px;"><span dir="ltr" style="background:#f1f5f9; padding:2px 8px; border-radius:6px; font-weight:800; color:#334155;">${a.ref}</span></td>
                <td style="font-size:12px; color:#1e293b; font-weight:600; padding:10px 12px;">${a.notes}</td>
                <td class="mono text-ok font-bold" style="text-align:left; font-size:13px; padding:10px 12px;">${a.inflow?"+"+f(a.inflow):"—"}</td>
                <td class="mono text-bad font-bold" style="text-align:left; font-size:13px; padding:10px 12px;">${a.outflow?"-"+f(a.outflow):"—"}</td>
                <td class="mono font-bold" style="text-align:left; font-size:13px; padding:10px 12px;"><span dir="ltr" style="display:inline-block; direction:ltr; background:#f8fafc; padding:3px 10px; border-radius:8px; border:1px solid #cbd5e1; color:#0f172a;">${f(a.balanceAfter)}</span></td>
              </tr>
            `).join(""):'<tr><td colspan="7" style="text-align:center; padding:36px; color:#64748b; font-weight:700;">لا توجد حركات بنكية مقيدة لهذا الحساب حالياً</td></tr>'}
          </tbody>
        </table>
      </div>
    `}catch(s){e.innerHTML=`<div class="alert bad">خطأ في جلب كشف الحساب التفصيلي: ${s.message}</div>`}};window.printBankStatementHTML=()=>{if(!N)return;const n=window.open("","_blank","width=900,height=750"),t=N,d=P;n.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>كشف حساب بنكي رسمي — ${t.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Cairo',sans-serif; direction:rtl; padding:25px; background:#fff; color:#0f172a; }
    .header-box { background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color:#fff; padding:24px; border-radius:14px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; }
    table { width:100%; border-collapse:collapse; margin-top:15px; }
    th { background:#f1f5f9; color:#1e293b; padding:10px; font-size:12px; font-weight:800; text-align:right; border-bottom:2px solid #cbd5e1; }
    td { padding:10px; border-bottom:1px solid #e2e8f0; font-size:12px; }
    .mono { font-family:monospace; font-weight:700; }
    @media print {
      body { padding:0; }
      .header-box { background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%) !important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div>
      <h1 style="font-size:20px;font-weight:900;">كشف حساب بنكي تفصيلي رسمي</h1>
      <h2 style="font-size:16px;font-weight:700;color:#93c5fd;margin-top:4px;">${t.name}</h2>
      <div style="font-size:11px;color:#cbd5e1;margin-top:4px;">رقم الآيبان IBAN: ${t.iban||"—"} ${t.accountNumber?`| رقم الحساب: ${t.accountNumber}`:""}</div>
    </div>
    <div style="text-align:left;">
      <div style="font-size:11px;color:#93c5fd;">الرصيد الفعلي الحسابي</div>
      <div class="mono" style="font-size:24px;font-weight:900;direction:ltr;">${f(t.balance||0)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>التاريخ</th>
        <th>نوع الحركة</th>
        <th>المرجع / الحوالة</th>
        <th>البيان والتفاصيل</th>
        <th style="text-align:left;">وارد (+)</th>
        <th style="text-align:left;">صادر (-)</th>
        <th style="text-align:left;">الرصيد التراكمي</th>
      </tr>
    </thead>
    <tbody>
      ${d.map(e=>`
        <tr>
          <td class="mono">${e.date}</td>
          <td><strong>${e.type}</strong></td>
          <td class="mono" dir="ltr">${e.ref}</td>
          <td>${e.notes}</td>
          <td class="mono" style="text-align:left;color:#047857;">${e.inflow?"+"+f(e.inflow):"—"}</td>
          <td class="mono" style="text-align:left;color:#dc2626;">${e.outflow?"-"+f(e.outflow):"—"}</td>
          <td class="mono" style="text-align:left;font-weight:900;" dir="ltr">${f(e.balanceAfter)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <div style="margin-top:30px;padding-top:15px;border-top:1px dashed #94a3b8;display:flex;justify-content:space-between;font-size:11px;color:#64748b;">
    <div>طُبع رسمياً من نظام إدهام ERP بتاريخ: ${new Date().toLocaleString("ar-SA")}</div>
    <div>توقيع المحاسب / اعتماد المدير المالي: .......................................</div>
  </div>
</body>
</html>`),n.document.close(),setTimeout(()=>{n.focus(),n.print(),n.close()},600)};window.openBankModal=(n="")=>{const t=document.getElementById("ba-opening")?.closest(".form-group"),d=document.getElementById("ba-coa-toggle-wrap");if(n){const e=u.find(s=>s.id===n);if(!e)return;document.getElementById("ba-edit-id").value=e.id,document.getElementById("ba-name").value=e.name||"",document.getElementById("ba-acc-num").value=e.accountNumber||"",document.getElementById("ba-iban").value=e.iban||"",document.getElementById("ba-opening").value=e.openingBalance||0,t&&(t.style.display="none"),d&&(d.style.display="none")}else document.getElementById("ba-edit-id").value="",document.getElementById("ba-name").value="",document.getElementById("ba-acc-num").value="",document.getElementById("ba-iban").value="",document.getElementById("ba-opening").value="",t&&(t.style.display="block"),d&&(d.style.display="flex");document.getElementById("ba-error").classList.add("hidden"),openModal("ba-modal")};window.saveBankAccount=async()=>{const n=document.getElementById("ba-error");n.classList.add("hidden");const t=document.getElementById("ba-edit-id").value,d=document.getElementById("ba-name").value.trim(),e=document.getElementById("ba-acc-num").value.trim(),s=document.getElementById("ba-iban").value.trim(),p=parseFloat(document.getElementById("ba-opening")?.value)||0,x=document.getElementById("ba-coa-toggle")?.checked??!0;if(!d){n.textContent="يرجى أدخال اسم الحساب البنكي",n.classList.remove("hidden");return}const b=document.getElementById("save-ba-btn");b.disabled=!0;try{if(t){const l=u.find(c=>c.id===t);await $(g.bankAccounts(),t,{name:d,accountNumber:e,iban:s}),l?.accountId&&await $(g.chartOfAccounts(),l.accountId,{name:d}),showToast("تم تحديث بيانات الحساب البنكي بنجاح","success")}else{let l=null,c=null;if(x){const r=await q({entityId:"temp",entityType:"bankAccount",name:d,parentCode:"1-1-1-3"});r&&(l=r.id||r.accountId,c=r.code||r.accountCode)}const o=await _(g.bankAccounts(),{name:d,bankName:d,accountName:d,accountNumber:e,iban:s,openingBalance:p,balance:p,accountId:l,accountCode:c,active:!0});l&&o?.id&&await $(g.chartOfAccounts(),l,{sourceEntityId:o.id}),showToast("تم إضافة الحساب البنكي بنجاح","success")}closeModal("ba-modal"),await B()}catch(l){n.textContent=l.message,n.classList.remove("hidden")}finally{b.disabled=!1}};window.deleteBankAccount=async(n,t)=>{if(await window.showConfirm?.(`هل أنت متأكد من حذف الحساب البنكي ${t}؟`,"حذف حساب بنكي"))try{const e=u.find(s=>s.id===n);await U(g.bankAccounts(),n),e?.accountId&&await G(e.accountId),showToast("تم حذف الحساب البنكي بنجاح","success"),await B()}catch(e){showToast("خطأ في الحذف: "+e.message,"error")}};window.openBankTxnModal=()=>{const n=document.getElementById("btxn-acc");if(u.length===0){showToast("قم بإضافة حساب بنكي أولاً","warning");return}n.innerHTML=u.map(t=>`<option value="${t.id}">${t.name} (${f(t.balance||0)})</option>`).join(""),document.getElementById("btxn-type").value="in",document.getElementById("btxn-amount").value="",document.getElementById("btxn-ref").value="",document.getElementById("btxn-notes").value="",document.getElementById("btxn-error").classList.add("hidden"),openModal("ba-txn-modal")};window.saveBankTxn=async()=>{const n=document.getElementById("btxn-error");n.classList.add("hidden");const t=document.getElementById("btxn-acc").value,d=document.getElementById("btxn-type").value,e=parseFloat(document.getElementById("btxn-amount").value)||0,s=document.getElementById("btxn-ref").value.trim(),p=document.getElementById("btxn-notes").value.trim();if(!t){n.textContent="اختر الحساب البنكي",n.classList.remove("hidden");return}if(e<=0){n.textContent="المبلغ غير صحيح",n.classList.remove("hidden");return}if(!p){n.textContent="أدخل البيان والتفاصيل",n.classList.remove("hidden");return}const x=document.getElementById("save-btxn-btn");x.disabled=!0;try{const b=j(T,`companies/${C}/bankAccounts`,t);let l=0,c="1-1-1-3-2",o="مصرف الراجحي";await V(T,async r=>{const y=await r.get(b);if(!y.exists())throw new Error("الحساب البنكي غير موجود");const h=y.data(),a=h.balance||0,i=d==="in"?+e:-e;if(l=a+i,l<0&&d==="out")throw new Error(`رصيد الحساب البنكي غير كافٍ: ${a} < ${e}`);c=h.accountCode||"1-1-1-3-2",o=h.name,r.update(b,{balance:l,updatedAt:F()});const m=j(H(T,`companies/${C}/bankTransactions`));r.set(m,{bankAccountId:t,type:d,amount:e,refNumber:s,notes:p,balanceAfter:l,createdAt:F()})});try{const r=d==="in"?c:"6-9-1",y=d==="in"?o:"مصاريف بنكية ومشاريع",h=d==="in"?"4-9-1":c,a=d==="in"?"إيرادات بنكية":o;await K({date:new Date().toISOString().split("T")[0],description:`حركة بنكية — ${p} — مرجع: ${s||"—"} — بنك: ${o}`,sourceType:"bankTransaction",lines:[{accountCode:r,accountName:y,debit:e,credit:0},{accountCode:h,accountName:a,debit:0,credit:e}],status:"posted",createdByName:"النظام"})}catch(r){console.warn("[BankTxn JE] Failed (non-fatal):",r.message)}showToast("تم تسجيل الحركة البنكية بنجاح","success"),closeModal("ba-txn-modal"),await B(),await R()}catch(b){n.textContent=b.message,n.classList.remove("hidden")}finally{x.disabled=!1}};export{at as render};
