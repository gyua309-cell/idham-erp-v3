import{f as u,g as pt,C as $,e as N,d as Y,a as lt,u as at,c as Ht,r as _t,k as Pt}from"./index-CF9GFeRJ.js";import{syncEntityToCoa as Kt,deleteEntityInCoa as Ut}from"./coa-connector-9pNG4b1x.js";import{orderBy as mt,query as gt,limit as Gt,getDocs as ut,collection as xt,where as Jt,doc as ft,runTransaction as Vt,serverTimestamp as bt}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";window.openBankStatementModal=e=>window.openBankAccountStatementModal(e);let x=[],E=[],R="",Q=null,yt=[];function j(e){return(e||"").toLowerCase().replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي")}function Wt(e){const t=j(e.name||"");return t.includes("راجحي")||t.includes("alrajhi")||t.includes("al-rajhi")?{gradient:"linear-gradient(135deg, #1e3a8a 0%, #172554 100%)",border:"1.5px solid #3b82f6",shadow:"0 14px 30px -5px rgba(30,58,138,0.5)",icon:"🏛️",badgeText:"مصرف الراجحي"}:t.includes("اهلي")||t.includes("snb")?{gradient:"linear-gradient(135deg, #065f46 0%, #022c22 100%)",border:"1.5px solid #10b981",shadow:"0 14px 30px -5px rgba(6,95,70,0.5)",icon:"🏢",badgeText:"البنك الأهلي SNB"}:t.includes("جزير")||t.includes("jazira")?{gradient:"linear-gradient(135deg, #0369a1 0%, #082f49 100%)",border:"1.5px solid #38bdf8",shadow:"0 14px 30px -5px rgba(2,132,199,0.5)",icon:"🌊",badgeText:"بنك الجزيرة"}:t.includes("رياض")||t.includes("riyad")?{gradient:"linear-gradient(135deg, #9a3412 0%, #431407 100%)",border:"1.5px solid #f97316",shadow:"0 14px 30px -5px rgba(154,52,18,0.5)",icon:"🏧",badgeText:"بنك الرياض"}:t.includes("انما")||t.includes("alinma")?{gradient:"linear-gradient(135deg, #78350f 0%, #451a03 100%)",border:"1.5px solid #f59e0b",shadow:"0 14px 30px -5px rgba(217,119,6,0.5)",icon:"🌾",badgeText:"مصرف الإنماء"}:t.includes("بلاد")||t.includes("bilad")?{gradient:"linear-gradient(135deg, #831843 0%, #500724 100%)",border:"1.5px solid #f43f5e",shadow:"0 14px 30px -5px rgba(225,29,72,0.5)",icon:"💎",badgeText:"بنك البلاد"}:{gradient:"linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",border:"1.5px solid #64748b",shadow:"0 14px 30px -5px rgba(15,23,42,0.5)",icon:"🏦",badgeText:"حساب بنكي رسمي"}}function vt(e){return!e||e.length===0?'<div class="empty-state" style="grid-column:span 3;"><div class="empty-icon">🏦</div><h3>لا توجد حسابات بنكية</h3><p>اضغط على "حساب بنكي جديد" لإضافة حسابك في البنك</p></div>':e.map(t=>{const n=Wt(t),o=R===t.id;return`
      <div class="card ba-card-luxury ba-card-interactive" onclick="filterBankTxnsByCard('${t.id}')" style="background:${n.gradient}; border:${n.border}; box-shadow:${n.shadow}; cursor:pointer; ${o?"outline:3.5px solid #ffffff;transform:scale(1.02);":""}">
        
        <div style="position:absolute; top:-15px; left:-15px; font-size:95px; opacity:0.12; pointer-events:none; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">${n.icon}</div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; position:relative; z-index:2;">
          <span class="ba-badge" style="font-size:11.5px; display:inline-flex; align-items:center; gap:6px;">
            <span>${n.icon}</span> <span>${n.badgeText}</span>
          </span>
          <div style="display:flex; gap:6px;" onclick="event.stopPropagation();">
            <button class="btn btn-icon sm" onclick="openBankStatementModal('${t.id}')" style="background:rgba(255,255,255,0.22); color:#ffffff !important; border:1px solid rgba(255,255,255,0.3); border-radius:8px;" title="كشف حساب تفصيلي">📄</button>
            <button class="btn btn-icon sm" onclick="openBankModal('${t.id}')" style="background:rgba(255,255,255,0.22); color:#ffffff !important; border:1px solid rgba(255,255,255,0.3); border-radius:8px;" title="تعديل">✏️</button>
            <button class="btn btn-icon sm" onclick="deleteBankAccount('${t.id}','${t.name}')" style="background:rgba(239,68,68,0.4); color:#ffffff !important; border:1px solid rgba(239,68,68,0.6); border-radius:8px;" title="حذف">🗑️</button>
          </div>
        </div>

        <h3 class="ba-bank-title" style="margin:0 0 6px 0; position:relative; z-index:2;">${t.name}</h3>
        
        <div class="ba-iban-text" style="margin-bottom:14px; position:relative; z-index:2; display:flex; align-items:center; gap:6px;">
          <span style="opacity:0.85;">الآيبان:</span>
          <span style="font-family:var(--font-mono, monospace); font-weight:800; direction:ltr; letter-spacing:0.5px; color:#ffffff !important;">${t.iban||"غير مسجل"}</span>
          ${t.iban?`<button class="btn btn-icon sm" onclick="event.stopPropagation(); navigator.clipboard.writeText('${t.iban}'); alert('تم نسخ الآيبان ✅');" style="background:transparent; border:none; color:#ffffff !important; padding:0 2px; font-size:12px; cursor:pointer;" title="نسخ الآيبان">📋</button>`:""}
        </div>

        <div class="ba-amount-box" style="position:relative; z-index:2;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:rgba(255,255,255,0.95) !important;">💰 الرصيد الحالي المتاح</span>
            <span style="font-size:10.5px; font-weight:800; background:rgba(16,185,129,0.35); border:1px solid rgba(16,185,129,0.6); padding:2px 8px; border-radius:12px; color:#a7f3d0 !important;">رصيد مباشر</span>
          </div>
          <div class="ba-balance-value" style="direction:ltr; text-align:right;">
            ${u(t.balance||0)}
          </div>
        </div>

        <div style="margin-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:11.5px; position:relative; z-index:2;">
          <span style="color:rgba(255,255,255,0.95) !important; font-weight:700;">
            ${o?"🎯 تصفية نشطة للجدول":"🔍 انقر لتصفية الحركات"}
          </span>
          <button onclick="event.stopPropagation(); openBankStatementModal('${t.id}')" style="background:transparent; border:none; color:#ffffff !important; text-decoration:underline; font-size:11.5px; font-weight:800; cursor:pointer; padding:0;">
            كشف الحساب التفصيلي 📄
          </button>
        </div>
      </div>`}).join("")}async function ae(e,t){e.innerHTML=`
    <!-- Top Actions Header -->
    <div class="filterbar" style="flex-wrap:wrap;gap:10px;align-items:center;background:var(--bg-1);padding:14px 18px;border-radius:14px;border:1px solid var(--border-soft);margin-bottom:20px;">
      <div style="margin-right:auto;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="exportPagePDF('.data-dense','الحسابات_البنكية')" title="تصدير PDF">📄 PDF</button>
        <button class="btn btn-secondary btn-sm" onclick="exportBankStatementExcel()" title="تصدير كشف حساب بنكي Excel منسق" style="background:#10b981;color:#fff;border-color:#059669;font-weight:700;">📊 Excel منسق</button>
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
        ${x&&x.length>0?vt(x):'<div class="page-loading"><div class="loading-spinner"></div></div>'}
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

        <!-- Dynamic Period Summary Strip -->
        <div id="ba-period-summary" style="display:none;padding:14px 20px;background:var(--bg-1);border-bottom:1px solid var(--border-soft);border-top:1px solid var(--border-soft);"></div>

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
        <div class="modal-footer" style="background:#f1f5f9;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <button class="btn btn-secondary" onclick="closeModal('ba-statement-modal')">إغلاق</button>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary" onclick="exportBankStatementExcel()" style="background:#10b981;color:#fff;border-color:#059669;font-weight:800;">📊 تصدير Excel منسق</button>
            <button class="btn btn-primary" onclick="printBankStatementHTML()">🖨️ طباعة رسمية لكشف الحساب البنكي</button>
          </div>
        </div>
      </div>
    </div>
  `,await S(),await wt()}async function S(){const e=document.getElementById("ba-grid"),t=document.getElementById("filter-ba-box");if(e)try{const[n,o]=await Promise.all([pt($.bankAccounts(),[mt("name")]),pt($.chartOfAccounts())]);x=n;for(const d of x){const f=o.find(c=>c.id===d.accountId||c.code===d.accountCode);f&&f.balance!==void 0&&(d.balance=f.balance)}t&&(t.innerHTML='<option value="">جميع الحسابات البنكية</option>'+x.map(d=>`<option value="${d.id}" ${d.id===R?"selected":""}>${d.name}</option>`).join("")),e.innerHTML=vt(x),E&&E.length>0&&(ht(),applyBankTxnFilters())}catch(n){e.innerHTML=`<div class="alert bad">${n.message}</div>`}}function ot(e){if(!e)return null;const t=String(e).trim(),n=j(t);return(x||[]).find(o=>o.id===t||o.accountId===t||o.accountCode===t||j(o.name)===n||j(o.name).includes(n)||n.includes(j(o.name)))||null}function ht(){if(!E||E.length===0)return;const e={};E.forEach(t=>{const n=t.bankAccountId||"unknown";e[n]||(e[n]=[]),e[n].push(t)}),Object.keys(e).forEach(t=>{const n=e[t];n.sort((p,b)=>{const y=p.isoDate||"",r=b.isoDate||"",m=y.localeCompare(r);return m!==0?m:(p.ts||0)-(b.ts||0)});const o=n[0]||{},d=ot(t)||ot(o.bankAccountName)||ot(o.bankName),f=Number(d?.balance||0);let c=0,g=0;n.forEach(p=>{c+=p.inflow,g+=p.outflow});let i=f-(c-g);n.forEach(p=>{i+=p.inflow-p.outflow,p.computedBalanceAfter=Math.round(i*100)/100})})}async function wt(){const e=document.getElementById("ba-tbody");if(e){(!x||x.length===0)&&await S();try{const t=gt($.bankTransactions(),mt("createdAt","desc"),Gt(400));E=(await ut(t)).docs.map(d=>{const f=d.data(),c=M(f),g=f.type==="in",s=Number(f.amount||0);return{id:d.id,...f,isoDate:c,ts:f.createdAt?.seconds?f.createdAt.seconds*1e3:c?new Date(c).getTime():0,inflow:g?s:0,outflow:g?0:s}}),ht(),applyBankTxnFilters()}catch(t){e.innerHTML=`<tr><td colspan="7"><div class="alert bad" style="margin:8px;">${t.message}</div></td></tr>`}}}window.filterBankTxnsByCard=e=>{R=e;const t=document.getElementById("filter-ba-box");t&&(t.value=e);const n=document.getElementById("btn-reset-bank-filter");n&&(n.style.display=e?"inline-block":"none"),S(),applyBankTxnFilters()};let X=[];function M(e){if(e.date&&/^\d{4}-\d{2}-\d{2}$/.test(e.date))return e.date;if(e.createdAt?.seconds){const t=new Date(e.createdAt.seconds*1e3),n=t.getFullYear(),o=String(t.getMonth()+1).padStart(2,"0"),d=String(t.getDate()).padStart(2,"0");return`${n}-${o}-${d}`}return typeof e.createdAt=="string"&&/^\d{4}-\d{2}-\d{2}/.test(e.createdAt)?e.createdAt.substring(0,10):""}window.applyBankTxnFilters=()=>{const e=document.getElementById("filter-ba-box")?.value||R||"",t=document.getElementById("filter-ba-from")?.value||"",n=document.getElementById("filter-ba-to")?.value||"",o=document.getElementById("filter-ba-type")?.value||"",d=(document.getElementById("filter-ba-search")?.value||"").trim().toLowerCase(),f=document.getElementById("ba-tbody"),c=document.getElementById("ba-txn-table-title"),g=document.getElementById("ba-txn-table-subtitle"),s=document.getElementById("ba-period-summary");if(!f)return;let i=[...E];if(e){i=i.filter(l=>l.bankAccountId===e);const a=x.find(l=>l.id===e);c&&(c.textContent=`📑 كشف حركات: ${a?a.name:"الحساب البنكي"}`)}else c&&(c.textContent="📑 سجل ودعم كشف الحركات البنكية الأخيرة");const p=i.length;t&&(i=i.filter(a=>{const l=M(a);return!l||l>=t})),n&&(i=i.filter(a=>{const l=M(a);return!l||l<=n})),o&&(i=i.filter(a=>a.type===o)),d&&(i=i.filter(a=>(a.notes||"").toLowerCase().includes(d)||(a.refNumber||"").toLowerCase().includes(d)||(a.bankAccountId||"").toLowerCase().includes(d)||String(a.amount||"").includes(d))),i.sort((a,l)=>{const w=M(a)+(a.createdAt?.seconds||0);return(M(l)+(l.createdAt?.seconds||0)).localeCompare(w)}),X=i,g&&(i.length===p?g.textContent=`سجل الحركات المصروفة والمقيدة للحساب البنكي (${i.length} حركة)`:g.textContent=`عرض ${i.length} حركة مطابقة للتصفية من إجمالي ${p} حركة`);let b=0,y=0;i.forEach(a=>{const l=Number(a.amount||0);a.type==="in"?b+=l:y+=l});const r=b-y;if(s){const a=x.find(l=>l.id===e);s.style.display="block",s.innerHTML=`
      <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:center;justify-content:space-between;width:100%;">
        <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:center;">
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:11.5px;font-weight:700;color:var(--text-3);">الحركات المعروضة:</span>
            <span class="badge" style="background:#f1f5f9;color:#0f172a;font-weight:900;font-size:12px;">${i.length} حركة</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:11.5px;font-weight:700;color:#15803d;">📥 إجمالي الوارد (+):</span>
            <span class="mono font-bold text-ok" style="font-size:13.5px;">+${u(b)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:11.5px;font-weight:700;color:#b91c1c;">📤 إجمالي المنصرف (-):</span>
            <span class="mono font-bold text-bad" style="font-size:13.5px;">-${u(y)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:11.5px;font-weight:700;color:var(--text-2);">⚖️ صافي حركة الفترة:</span>
            <span class="mono font-bold ${r>=0?"text-ok":"text-bad"}" style="font-size:13.5px;direction:ltr;">${r>=0?"+":""}${u(r)}</span>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          ${a?`
            <div style="display:flex;align-items:center;gap:8px;background:rgba(30,58,138,0.08);padding:5px 14px;border-radius:10px;border:1px solid rgba(30,58,138,0.2);">
              <span style="font-size:11.5px;font-weight:800;color:#1e3a8a;">💰 الرصيد المتاح الحالي:</span>
              <span class="mono font-bold" style="font-size:14.5px;color:#1e3a8a;direction:ltr;">${u(a.balance||0)}</span>
            </div>
          `:""}
          <button class="btn btn-secondary btn-sm" onclick="exportBankStatementExcel()" style="background:#10b981;color:#fff;border-color:#059669;font-weight:800;padding:5px 12px;border-radius:8px;" title="تصدير كشف الحساب الحالي لإكسيل">📊 تصدير Excel منسق</button>
        </div>
      </div>
    `}const m={};if(x.forEach(a=>m[a.id]=a.name),i.length===0){f.innerHTML='<tr><td colspan="7" style="text-align:center;padding:36px;color:var(--text-2);font-weight:700;">🔍 لا توجد حركات بنكية مطابقة للتصفية المختارة</td></tr>';return}f.innerHTML=i.map(a=>{const l=a.type==="in",w=l?"background:#eff6ff;color:#1d4ed8;border:1px solid #93c5fd;font-weight:800;":"background:#fef2f2;color:#dc2626;border:1px solid #fecaca;font-weight:800;";return`
      <tr style="transition:all 0.15s ease;">
        <td class="mono font-bold" style="font-size:12.5px;">${N(a.date||a.createdAt)}</td>
        <td><strong style="color:var(--text-1);">${m[a.bankAccountId]||a.bankAccountId}</strong></td>
        <td><span class="badge" style="${w}padding:4px 10px;border-radius:8px;">${l?"إيداع وارد (+)":"سحب / تحويل (-)"}</span></td>
        <td class="mono font-bold" style="font-size:11.5px;"><span dir="ltr" style="background:var(--bg-2);padding:2px 8px;border-radius:6px;">${a.refNumber||"—"}</span></td>
        <td><span style="font-size:12.5px;color:var(--text-2);font-weight:600;">${a.notes||"—"}</span></td>
        <td class="mono font-bold ${l?"text-ok":"text-bad"}" style="font-size:13.5px;">${l?"+":"-"}${u(a.amount)}</td>
        <td class="mono font-bold" style="font-size:12.5px;"><span dir="ltr" style="display:inline-block;direction:ltr;background:var(--bg-2);padding:2px 8px;border-radius:6px;">${u(a.computedBalanceAfter!==void 0?a.computedBalanceAfter:a.balanceAfter||0)}</span></td>
      </tr>`}).join("")};window.openBankAccountStatementModal=async e=>{const t=x.find(c=>c.id===e);if(!t)return;Q=t;const n=document.getElementById("ba-stmt-modal-title"),o=document.getElementById("ba-stmt-body"),d=document.getElementById("filter-ba-from")?.value||"",f=document.getElementById("filter-ba-to")?.value||"";n&&(n.textContent=`📄 كشف حساب بنكي تفصيلي معتمد — ${t.name}`),o&&(o.innerHTML=`<div style="text-align:center;padding:40px;"><span class="spin"></span> جاري تجميع وتحليل كشف الحساب البنكي لحساب ${t.name}…</div>`),openModal("ba-statement-modal");try{const c=gt(xt(Y,`companies/${lt}/bankTransactions`),Jt("bankAccountId","==",e)),s=(await ut(c)).docs.map(m=>{const a=m.data(),l=M(a),w=a.type==="in",D=Number(a.amount||0);return{id:m.id,isoDate:l,ts:a.createdAt?.seconds?a.createdAt.seconds*1e3:l?new Date(l).getTime():0,date:N(a.date||a.createdAt),icon:w?"🏛️ 📥":"🏦 📤",badgeText:w?"إيداع بنكي":"حوالة بنكية صادرة",badgeClass:w?"good":"bad",notes:a.notes||"حركة بنكية رسمية",inflow:w?D:0,outflow:w?0:D,ref:a.refNumber||`BTX-${m.id.substring(0,6).toUpperCase()}`}});s.sort((m,a)=>{const l=(m.isoDate||"").localeCompare(a.isoDate||"");return l!==0?l:(m.ts||0)-(a.ts||0)});const i=Number(t.balance||0);let p=0,b=0;s.forEach(m=>{p+=m.inflow,b+=m.outflow});const y=i-(p-b);let r=y;s.forEach(m=>{r+=m.inflow-m.outflow,m.computedBalanceAfter=Math.round(r*100)/100}),kt=s,Bt=y,window.renderModalStatementView(d,f)}catch(c){o.innerHTML=`<div class="alert bad">خطأ في جلب كشف الحساب التفصيلي: ${c.message}</div>`}};let kt=[],Bt=0;window.renderModalStatementView=(e="",t="")=>{const n=Q,o=document.getElementById("ba-stmt-body");if(!o||!n)return;const d=kt||[],f=Bt||0,c=d.filter(r=>!(e&&r.isoDate<e||t&&r.isoDate>t)),g=d.filter(r=>e&&r.isoDate<e),s=g.length>0?g[g.length-1].computedBalanceAfter:f;let i=0,p=0;c.forEach(r=>{i+=r.inflow,p+=r.outflow});const b=i-p,y=Math.round((s+b)*100)/100;yt=c,o.innerHTML=`
    <!-- Bank Info Banner -->
    <div style="background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); border-radius:16px; padding:18px 22px; color:#fff; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; box-shadow:0 8px 20px rgba(15,23,42,0.3);">
      <div>
        <div style="font-size:11px; color:#93c5fd; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">كشف الحساب البنكي التفصيلي المعتمد</div>
        <h2 style="font-size:22px; font-weight:900; margin:3px 0; color:#ffffff;">${n.name}</h2>
        <div style="font-size:12px; color:#cbd5e1;">رقم الآيبان IBAN: <span style="font-family:monospace;font-weight:800;color:#67e8f9;">${n.iban||"—"}</span> ${n.accountNumber?`| رقم الحساب: <span style="font-family:monospace;color:#ffffff;">${n.accountNumber}</span>`:""}</div>
      </div>
      <div style="text-align:left; background:rgba(255,255,255,0.12); padding:10px 18px; border-radius:14px; border:1px solid rgba(255,255,255,0.25);">
        <div style="font-size:11px; color:#93c5fd; font-weight:700;">الرصيد الفعلي الحالي في البنك</div>
        <div class="mono" style="font-size:22px; font-weight:900; direction:ltr; color:#ffffff;">${u(n.balance||0)}</div>
      </div>
    </div>

    <!-- Interactive Period Filter Bar Inside Modal -->
    <div style="display:flex;gap:12px;align-items:center;background:#fff;padding:12px 18px;border-radius:14px;border:1px solid #e2e8f0;margin-bottom:16px;flex-wrap:wrap;box-shadow:0 2px 6px rgba(0,0,0,0.02);">
      <span style="font-size:12px;font-weight:800;color:#0f172a;">📅 تصفية فترة الكشف:</span>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="font-size:11.5px;color:#64748b;">من:</span>
        <input type="date" id="modal-stmt-from" class="input" value="${e}" style="width:135px;font-size:12px;padding:4px 8px;" onchange="window.onModalDateFilterChange()" />
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="font-size:11.5px;color:#64748b;">إلى:</span>
        <input type="date" id="modal-stmt-to" class="input" value="${t}" style="width:135px;font-size:12px;padding:4px 8px;" onchange="window.onModalDateFilterChange()" />
      </div>
      <button class="btn btn-secondary btn-sm" onclick="window.resetModalDateFilter()" style="font-size:11.5px;padding:4px 10px;">عرض كافة الحركات</button>
      <div style="margin-right:auto;display:flex;gap:8px;">
        <button class="btn btn-secondary btn-sm" onclick="exportBankStatementExcel()" style="background:#10b981;color:#fff;border-color:#059669;font-weight:800;font-size:12px;padding:5px 14px;">📊 تصدير Excel منسق</button>
      </div>
    </div>

    <!-- KPI Summary Cards for the Period -->
    <div class="grid-4 gap-10 mb-16" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:16px;">
      <div style="background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:12px; padding:12px; text-align:center;">
        <div style="font-size:11px; color:#64748b; font-weight:800;">الرصيد السابق للفترة</div>
        <div class="mono" style="font-size:16px; font-weight:900; margin-top:3px; color:#0f172a;">${u(s)}</div>
      </div>
      <div style="background:#eff6ff; border:1.5px solid #bfdbfe; border-radius:12px; padding:12px; text-align:center;">
        <div style="font-size:11px; color:#1d4ed8; font-weight:800;">إجمالي الوارد للفترة (+)</div>
        <div class="mono text-ok" style="font-size:16px; font-weight:900; margin-top:3px;">+${u(i)}</div>
      </div>
      <div style="background:#fef2f2; border:1.5px solid #fecaca; border-radius:12px; padding:12px; text-align:center;">
        <div style="font-size:11px; color:#dc2626; font-weight:800;">إجمالي المنصرف للفترة (-)</div>
        <div class="mono text-bad" style="font-size:16px; font-weight:900; margin-top:3px;">-${u(p)}</div>
      </div>
      <div style="background:#ecfdf5; border:1.5px solid #a7f3d0; border-radius:12px; padding:12px; text-align:center;">
        <div style="font-size:11px; color:#065f46; font-weight:800;">الرصيد الختامي في نهاية الفترة</div>
        <div class="mono" style="font-size:16px; font-weight:900; margin-top:3px; color:#047857;">${u(y)}</div>
      </div>
    </div>

    <!-- Statement Table -->
    <div class="table-container" style="background:#fff; border-radius:14px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.03);">
      <table class="data-dense" style="width:100%; font-size:12px;">
        <thead>
          <tr style="background:#0f172a; color:#ffffff;">
            <th style="padding:10px 12px; width:45px; text-align:center;">م</th>
            <th style="padding:10px 12px; width:95px; text-align:center;">التاريخ</th>
            <th style="padding:10px 12px; width:170px;">نوع الحركة والرمز</th>
            <th style="padding:10px 12px; width:120px;">المرجع / الحوالة</th>
            <th style="padding:10px 12px;">البيان والسبب التفصيلي</th>
            <th style="padding:10px 12px; text-align:left; width:110px;">وارد (+)</th>
            <th style="padding:10px 12px; text-align:left; width:110px;">صادر (-)</th>
            <th style="padding:10px 12px; text-align:left; width:130px;">الرصيد بعد الحركة</th>
          </tr>
        </thead>
        <tbody>
          ${e?`
            <tr style="background:#f8fafc; font-weight:800; border-bottom:2px solid #cbd5e1;">
              <td style="text-align:center;">—</td>
              <td class="mono font-bold" style="text-align:center;">${N(e)}</td>
              <td colspan="3"><span style="color:#475569;">💼 الرصيد الافتتاحي السابق لبداية الفترة</span></td>
              <td style="text-align:left;">—</td>
              <td style="text-align:left;">—</td>
              <td class="mono font-bold" style="text-align:left;"><span dir="ltr" style="display:inline-block;direction:ltr;background:#e2e8f0;padding:2px 8px;border-radius:6px;color:#0f172a;">${u(s)}</span></td>
            </tr>
          `:""}
          ${c.length?c.map((r,m)=>`
            <tr style="border-bottom:1px solid #f1f5f9; transition:background 0.15s ease;">
              <td style="text-align:center;color:var(--text-3);font-weight:700;">${m+1}</td>
              <td class="mono font-bold" style="font-size:12px; padding:10px 12px; text-align:center;">${r.date}</td>
              <td style="padding:10px 12px;">
                <span style="display:inline-flex; align-items:center; gap:6px; background:${r.inflow?"#eff6ff":"#fef2f2"}; color:${r.inflow?"#1d4ed8":"#991b1b"}; padding:4px 10px; border-radius:8px; font-weight:800; font-size:11.5px; border:1px solid ${r.inflow?"#bfdbfe":"#fca5a5"};">
                  <span>${r.icon}</span> <span>${r.badgeText}</span>
                </span>
              </td>
              <td class="mono" style="font-size:11px; padding:10px 12px;"><span dir="ltr" style="background:#f1f5f9; padding:2px 8px; border-radius:6px; font-weight:800; color:#334155;">${r.ref}</span></td>
              <td style="font-size:12px; color:#1e293b; font-weight:600; padding:10px 12px;">${r.notes}</td>
              <td class="mono text-ok font-bold" style="text-align:left; font-size:13px; padding:10px 12px;">${r.inflow?"+"+u(r.inflow):"—"}</td>
              <td class="mono text-bad font-bold" style="text-align:left; font-size:13px; padding:10px 12px;">${r.outflow?"-"+u(r.outflow):"—"}</td>
              <td class="mono font-bold" style="text-align:left; font-size:13px; padding:10px 12px;"><span dir="ltr" style="display:inline-block; direction:ltr; background:#f8fafc; padding:3px 10px; border-radius:8px; border:1px solid #cbd5e1; color:#0f172a;">${u(r.computedBalanceAfter)}</span></td>
            </tr>
          `).join(""):'<tr><td colspan="8" style="text-align:center; padding:36px; color:#64748b; font-weight:700;">لا توجد حركات بنكية مقيدة في الفترة المحددة</td></tr>'}
        </tbody>
      </table>
    </div>
  `};window.onModalDateFilterChange=()=>{const e=document.getElementById("modal-stmt-from")?.value||"",t=document.getElementById("modal-stmt-to")?.value||"",n=document.getElementById("filter-ba-from"),o=document.getElementById("filter-ba-to");n&&(n.value=e),o&&(o.value=t),window.renderModalStatementView(e,t)};window.resetModalDateFilter=()=>{const e=document.getElementById("filter-ba-from"),t=document.getElementById("filter-ba-to");e&&(e.value=""),t&&(t.value=""),window.renderModalStatementView("","")};window.printBankStatementHTML=()=>{if(!Q)return;const e=window.open("","_blank","width=900,height=750"),t=Q,n=yt;e.document.write(`<!DOCTYPE html>
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
      <div class="mono" style="font-size:24px;font-weight:900;direction:ltr;">${u(t.balance||0)}</div>
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
      ${n.map(o=>`
        <tr>
          <td class="mono">${o.date}</td>
          <td><strong>${o.badgeText||(o.inflow?"إيداع وارد (+)":"تحويل صادر (-)")}</strong></td>
          <td class="mono" dir="ltr">${o.ref}</td>
          <td>${o.notes}</td>
          <td class="mono" style="text-align:left;color:#047857;">${o.inflow?"+"+u(o.inflow):"—"}</td>
          <td class="mono" style="text-align:left;color:#dc2626;">${o.outflow?"-"+u(o.outflow):"—"}</td>
          <td class="mono" style="text-align:left;font-weight:900;" dir="ltr">${u(o.balanceAfter)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <div style="margin-top:30px;padding-top:15px;border-top:1px dashed #94a3b8;display:flex;justify-content:space-between;font-size:11px;color:#64748b;">
    <div>طُبع رسمياً من نظام إدهام ERP بتاريخ: ${new Date().toLocaleString("ar-SA")}</div>
    <div>توقيع المحاسب / اعتماد المدير المالي: .......................................</div>
  </div>
</body>
</html>`),e.document.close(),setTimeout(()=>{e.focus(),e.print(),e.close()},600)};window.openBankModal=(e="")=>{const t=document.getElementById("ba-opening")?.closest(".form-group"),n=document.getElementById("ba-coa-toggle-wrap");if(e){const o=x.find(d=>d.id===e);if(!o)return;document.getElementById("ba-edit-id").value=o.id,document.getElementById("ba-name").value=o.name||"",document.getElementById("ba-acc-num").value=o.accountNumber||"",document.getElementById("ba-iban").value=o.iban||"",document.getElementById("ba-opening").value=o.openingBalance||0,t&&(t.style.display="none"),n&&(n.style.display="none")}else document.getElementById("ba-edit-id").value="",document.getElementById("ba-name").value="",document.getElementById("ba-acc-num").value="",document.getElementById("ba-iban").value="",document.getElementById("ba-opening").value="",t&&(t.style.display="block"),n&&(n.style.display="flex");document.getElementById("ba-error").classList.add("hidden"),openModal("ba-modal")};window.saveBankAccount=async()=>{const e=document.getElementById("ba-error");e.classList.add("hidden");const t=document.getElementById("ba-edit-id").value,n=document.getElementById("ba-name").value.trim(),o=document.getElementById("ba-acc-num").value.trim(),d=document.getElementById("ba-iban").value.trim(),f=parseFloat(document.getElementById("ba-opening")?.value)||0,c=document.getElementById("ba-coa-toggle")?.checked??!0;if(!n){e.textContent="يرجى أدخال اسم الحساب البنكي",e.classList.remove("hidden");return}const g=document.getElementById("save-ba-btn");g.disabled=!0;try{if(t){const s=x.find(i=>i.id===t);await at($.bankAccounts(),t,{name:n,accountNumber:o,iban:d}),s?.accountId&&await at($.chartOfAccounts(),s.accountId,{name:n}),showToast("تم تحديث بيانات الحساب البنكي بنجاح","success")}else{let s=null,i=null;if(c){const b=await Kt({entityId:"temp",entityType:"bankAccount",name:n,parentCode:"1-1-1-3"});b&&(s=b.id||b.accountId,i=b.code||b.accountCode)}const p=await Ht($.bankAccounts(),{name:n,bankName:n,accountName:n,accountNumber:o,iban:d,openingBalance:f,balance:f,accountId:s,accountCode:i,active:!0});s&&p?.id&&await at($.chartOfAccounts(),s,{sourceEntityId:p.id}),showToast("تم إضافة الحساب البنكي بنجاح","success")}closeModal("ba-modal"),await S()}catch(s){e.textContent=s.message,e.classList.remove("hidden")}finally{g.disabled=!1}};window.deleteBankAccount=async(e,t)=>{if(await window.showConfirm?.(`هل أنت متأكد من حذف الحساب البنكي ${t}؟`,"حذف حساب بنكي"))try{const o=x.find(d=>d.id===e);await _t($.bankAccounts(),e),o?.accountId&&await Ut(o.accountId),showToast("تم حذف الحساب البنكي بنجاح","success"),await S()}catch(o){showToast("خطأ في الحذف: "+o.message,"error")}};window.openBankTxnModal=()=>{const e=document.getElementById("btxn-acc");if(x.length===0){showToast("قم بإضافة حساب بنكي أولاً","warning");return}e.innerHTML=x.map(t=>`<option value="${t.id}">${t.name} (${u(t.balance||0)})</option>`).join(""),document.getElementById("btxn-type").value="in",document.getElementById("btxn-amount").value="",document.getElementById("btxn-ref").value="",document.getElementById("btxn-notes").value="",document.getElementById("btxn-error").classList.add("hidden"),openModal("ba-txn-modal")};window.saveBankTxn=async()=>{const e=document.getElementById("btxn-error");e.classList.add("hidden");const t=document.getElementById("btxn-acc").value,n=document.getElementById("btxn-type").value,o=parseFloat(document.getElementById("btxn-amount").value)||0,d=document.getElementById("btxn-ref").value.trim(),f=document.getElementById("btxn-notes").value.trim();if(!t){e.textContent="اختر الحساب البنكي",e.classList.remove("hidden");return}if(o<=0){e.textContent="المبلغ غير صحيح",e.classList.remove("hidden");return}if(!f){e.textContent="أدخل البيان والتفاصيل",e.classList.remove("hidden");return}const c=document.getElementById("save-btxn-btn");c.disabled=!0;try{const g=ft(Y,`companies/${lt}/bankAccounts`,t);let s=0,i="1-1-1-3-2",p="مصرف الراجحي";await Vt(Y,async b=>{const y=await b.get(g);if(!y.exists())throw new Error("الحساب البنكي غير موجود");const r=y.data(),m=r.balance||0,a=n==="in"?+o:-o;if(s=m+a,s<0&&n==="out")throw new Error(`رصيد الحساب البنكي غير كافٍ: ${m} < ${o}`);i=r.accountCode||"1-1-1-3-2",p=r.name,b.update(g,{balance:s,updatedAt:bt()});const l=ft(xt(Y,`companies/${lt}/bankTransactions`));b.set(l,{bankAccountId:t,type:n,amount:o,refNumber:d,notes:f,balanceAfter:s,createdAt:bt()})});try{const b=n==="in"?i:"6-9-1",y=n==="in"?p:"مصاريف بنكية ومشاريع",r=n==="in"?"4-9-1":i,m=n==="in"?"إيرادات بنكية":p;await Pt({date:new Date().toISOString().split("T")[0],description:`حركة بنكية — ${f} — مرجع: ${d||"—"} — بنك: ${p}`,sourceType:"bankTransaction",lines:[{accountCode:b,accountName:y,debit:o,credit:0},{accountCode:r,accountName:m,debit:0,credit:o}],status:"posted",createdByName:"النظام"})}catch(b){console.warn("[BankTxn JE] Failed (non-fatal):",b.message)}showToast("تم تسجيل الحركة البنكية بنجاح","success"),closeModal("ba-txn-modal"),await S(),await wt()}catch(g){e.textContent=g.message,e.classList.remove("hidden")}finally{c.disabled=!1}};window.exportBankStatementExcel=async()=>{const e=document.getElementById("filter-ba-box")?.value||R||"",t=x.find(a=>a.id===e),n=t?t.name:"جميع الحسابات البنكية",o=t?.iban||"غير مسجل",d=t?.accountNumber||"—",f=t&&t.balance||0,c=document.getElementById("filter-ba-from")?.value||"",g=document.getElementById("filter-ba-to")?.value||"",s=X&&X.length>0?X:e?E.filter(a=>a.bankAccountId===e):E;if(!s||s.length===0){window.showToast?window.showToast("لا توجد حركات بنكية للتصدير","warning"):alert("لا توجد حركات بنكية للتصدير");return}let i=0,p=0;s.forEach(a=>{const l=Number(a.amount||0);a.type==="in"?i+=l:p+=l});const b=i-p,y={};x.forEach(a=>y[a.id]=a.name);const m=`كشف_حساب_${n.replace(/[\\/:*?"<>|]/g,"_")}_${new Date().toISOString().slice(0,10)}`;if(window.ExcelJS)try{const a=new window.ExcelJS.Workbook;a.creator="نظام إدهام ERP",a.created=new Date;const l=a.addWorksheet("كشف حساب بنكي",{views:[{rtl:!0,showGridLines:!0}],pageSetup:{orientation:"landscape",paperSize:9}});l.columns=[{key:"num",width:7},{key:"date",width:14},{key:"bank",width:20},{key:"type",width:18},{key:"ref",width:18},{key:"notes",width:42},{key:"inflow",width:16},{key:"outflow",width:16},{key:"balance",width:18}];const w={name:"Arial",size:13,bold:!0,color:{argb:"FFFFFFFF"}},D={name:"Arial",size:10.5,bold:!0,color:{argb:"FFFFFFFF"}},Et={name:"Arial",size:9.5,italic:!0,color:{argb:"FF1E293B"}},$t={name:"Arial",size:10,bold:!0,color:{argb:"FFFFFFFF"}},Z={name:"Arial",size:9.5},B={name:"Arial",size:9.5,bold:!0},tt={name:"Arial",size:9.5,bold:!0,color:{argb:"FF15803D"}},et={name:"Arial",size:9.5,bold:!0,color:{argb:"FFB91C1C"}},Ft={type:"pattern",pattern:"solid",fgColor:{argb:"FF1E3A8A"}},At={type:"pattern",pattern:"solid",fgColor:{argb:"FF2563EB"}},zt={type:"pattern",pattern:"solid",fgColor:{argb:"FFEFF6FF"}},Ct={type:"pattern",pattern:"solid",fgColor:{argb:"FF0F172A"}},It={type:"pattern",pattern:"solid",fgColor:{argb:"FFF8FAFC"}},H={type:"pattern",pattern:"solid",fgColor:{argb:"FFE2E8F0"}},it={type:"pattern",pattern:"solid",fgColor:{argb:"FFF1F5F9"}},Tt={type:"pattern",pattern:"solid",fgColor:{argb:"FFECFDF5"}},Mt={type:"pattern",pattern:"solid",fgColor:{argb:"FFFEF2F2"}},A={top:{style:"thin",color:{argb:"FFCBD5E1"}},bottom:{style:"thin",color:{argb:"FFCBD5E1"}},left:{style:"thin",color:{argb:"FFCBD5E1"}},right:{style:"thin",color:{argb:"FFCBD5E1"}}};l.mergeCells("A1:I1");const _=l.getCell("A1");_.value="شركة نظم الإمداد المتطورة — المنظومة المحاسبية المتكاملة",_.font=w,_.fill=Ft,_.alignment={horizontal:"center",vertical:"middle"},l.getRow(1).height=32,l.mergeCells("A2:I2");const P=l.getCell("A2");P.value=`كشف حساب بنكي رسمي: ${n} — الآيبان: ${o} ${d!=="—"?`| رقم الحساب: ${d}`:""}`,P.font=D,P.fill=At,P.alignment={horizontal:"center",vertical:"middle"},l.getRow(2).height=26,l.mergeCells("A3:I3");const K=l.getCell("A3"),Nt=c?N(c):"بداية الحركات",St=g?N(g):"تاريخ اليوم";K.value=`الفترة المستخرجة: من ${Nt} إلى ${St} | تاريخ الاستخراج: ${new Date().toLocaleString("ar-SA")} | إجمالي الحركات: ${s.length}`,K.font=Et,K.fill=zt,K.alignment={horizontal:"center",vertical:"middle"},l.getRow(3).height=22,l.mergeCells("A4:B4");const U=l.getCell("A4");U.value=`الرصيد المتاح: ${u(f)}`,U.font=B,U.fill=it,U.alignment={horizontal:"center",vertical:"middle"},l.mergeCells("C4:D4");const G=l.getCell("C4");G.value=`إجمالي الوارد (+): +${u(i)}`,G.font={...B,color:{argb:"FF15803D"}},G.fill=Tt,G.alignment={horizontal:"center",vertical:"middle"},l.mergeCells("E4:F4");const J=l.getCell("E4");J.value=`إجمالي المنصرف (-): -${u(p)}`,J.font={...B,color:{argb:"FFB91C1C"}},J.fill=Mt,J.alignment={horizontal:"center",vertical:"middle"},l.mergeCells("G4:I4");const V=l.getCell("G4");V.value=`صافي حركة الفترة: ${b>=0?"+":""}${u(b)}`,V.font={...B,color:{argb:b>=0?"FF15803D":"FFB91C1C"}},V.fill=it,V.alignment={horizontal:"center",vertical:"middle"},l.getRow(4).height=26;const Dt=["م","التاريخ","البنك","نوع الحركة","رقم المرجع / الحوالة","البيان والتفاصيل","وارد (+) (ر.س)","صادر (-) (ر.س)","الرصيد بعد الحركة (ر.س)"],dt=l.getRow(5);Dt.forEach((v,O)=>{const F=dt.getCell(O+1);F.value=v,F.font=$t,F.fill=Ct,F.alignment={horizontal:"center",vertical:"middle",wrapText:!0},F.border=A}),dt.height=28,s.forEach((v,O)=>{const F=6+O,rt=l.getRow(F),q=v.type==="in",ct=Number(v.amount||0),jt=O%2===1;[O+1,N(v.date||v.createdAt),y[v.bankAccountId]||v.bankAccountId,q?"إيداع وارد (+)":"تحويل صادر (-)",v.refNumber||"—",v.notes||"—",q?ct:0,q?0:ct,Number(v.computedBalanceAfter!==void 0?v.computedBalanceAfter:v.balanceAfter||0)].forEach((Rt,k)=>{const h=rt.getCell(k+1);h.value=Rt,h.border=A,h.fill=jt?It:{type:"pattern",pattern:"solid",fgColor:{argb:"FFFFFFFF"}},k===0?(h.font=B,h.alignment={horizontal:"center",vertical:"middle"}):k===1?(h.font=B,h.alignment={horizontal:"center",vertical:"middle"}):k===2||k===3?(h.font=k===3?q?tt:et:Z,h.alignment={horizontal:"center",vertical:"middle"}):k===4?(h.font=Z,h.alignment={horizontal:"center",vertical:"middle"}):k===5?(h.font=Z,h.alignment={horizontal:"right",vertical:"middle"}):k>=6&&(h.font=k===6?tt:k===7?et:B,h.alignment={horizontal:"left",vertical:"middle"},h.numFmt="#,##0.00")}),rt.height=22});const nt=6+s.length,z=l.getRow(nt);l.mergeCells(`A${nt}:F${nt}`);const W=z.getCell(1);W.value="الإجمالي الكلي للحركات المعروضة",W.font=B,W.fill=H,W.alignment={horizontal:"center",vertical:"middle"};for(let v=1;v<=6;v++)z.getCell(v).border=A;const C=z.getCell(7);C.value=i,C.font=tt,C.fill=H,C.numFmt="#,##0.00",C.alignment={horizontal:"left",vertical:"middle"},C.border=A;const I=z.getCell(8);I.value=p,I.font=et,I.fill=H,I.numFmt="#,##0.00",I.alignment={horizontal:"left",vertical:"middle"},I.border=A;const T=z.getCell(9);T.value=f,T.font=B,T.fill=H,T.numFmt="#,##0.00",T.alignment={horizontal:"left",vertical:"middle"},T.border=A,z.height=26;const Lt=await a.xlsx.writeBuffer(),Ot=new Blob([Lt],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),st=window.URL.createObjectURL(Ot),L=document.createElement("a");L.href=st,L.download=`${m}.xlsx`,document.body.appendChild(L),L.click(),document.body.removeChild(L),window.URL.revokeObjectURL(st),window.showToast&&window.showToast("تم تصدير كشف الحساب البنكي إلى Excel بنجاح ✅","success");return}catch(a){console.warn("ExcelJS export failed, falling back to basic export:",a)}typeof exportPageExcel=="function"&&exportPageExcel(".data-dense",m)};export{ae as render};
