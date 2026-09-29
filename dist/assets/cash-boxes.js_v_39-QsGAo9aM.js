import{h as O,a as h,g as H,u as M,f as u,b as I,d as w,C as B,t as k,o as X,r as Y,e as R}from"./index-DgsnACKa.js";import{s as K,d as Q}from"./coa-connector-DAdMHvuF.js";import{orderBy as _,query as L,limit as Z,getDocs as z,where as j,collection as S,doc as T,runTransaction as P,serverTimestamp as E}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let m=[],U=[],N="",F=null,J=[];function tt(o){const e=(o.name||"").toLowerCase(),i=o.type||"",t=o.accountCode||"";return i==="main"||e.includes("الرئيسي")?{gradient:"linear-gradient(135deg, #059669 0%, #064e3b 100%)",border:"1.5px solid #10b981",shadow:"0 10px 25px -5px rgba(5,150,105,0.4)",icon:"🏛️",badgeText:"خزينة رئيسية",accentBg:"rgba(255,255,255,0.2)"}:i==="owner_current"||t==="3-1-4"||e.includes("مالك")?{gradient:"linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",border:"1.5px solid #8b5cf6",shadow:"0 10px 25px -5px rgba(109,40,217,0.4)",icon:"👑",badgeText:"👤 جاري المالك",accentBg:"rgba(255,255,255,0.2)"}:e.includes("مصطفى")?{gradient:"linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)",border:"1.5px solid #3b82f6",shadow:"0 10px 25px -5px rgba(29,78,216,0.4)",icon:"🚚",badgeText:"عهدة مندوب",accentBg:"rgba(255,255,255,0.2)"}:e.includes("عوض")?{gradient:"linear-gradient(135deg, #0d9488 0%, #115e59 100%)",border:"1.5px solid #14b8a6",shadow:"0 10px 25px -5px rgba(13,148,136,0.4)",icon:"📦",badgeText:"عهدة مندوب",accentBg:"rgba(255,255,255,0.2)"}:e.includes("خالد")?{gradient:"linear-gradient(135deg, #ea580c 0%, #9a3412 100%)",border:"1.5px solid #f97316",shadow:"0 10px 25px -5px rgba(234,88,12,0.4)",icon:"🚛",badgeText:"عهدة مندوب",accentBg:"rgba(255,255,255,0.2)"}:{gradient:"linear-gradient(135deg, #334155 0%, #0f172a 100%)",border:"1.5px solid #64748b",shadow:"0 10px 25px -5px rgba(51,65,85,0.4)",icon:"💼",badgeText:o.type==="petty"?"نثريات":"صندوق فرعي",accentBg:"rgba(255,255,255,0.2)"}}async function lt(o,e){o.innerHTML=`
    <!-- Top Actions Header -->
    <div class="filterbar" style="flex-wrap:wrap;gap:10px;align-items:center;background:var(--bg-1);padding:14px 18px;border-radius:14px;border:1px solid var(--border-soft);margin-bottom:20px;">
      <div style="margin-right:auto;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="exportPagePDF('.data-dense','الصناديق_والعهد')" title="تصدير PDF">📄 PDF</button>
        <button class="btn btn-secondary btn-sm" onclick="exportPageExcel('.data-dense','الصناديق_والعهد')" title="تصدير Excel">📊 Excel</button>
        <button class="btn btn-secondary btn-sm" onclick="window.print()" title="طباعة">🖨️ طباعة</button>
        <button class="btn btn-secondary btn-sm" onclick="openCashTxnModal()">+ حركة نقدية جديدة</button>
        <button class="btn btn-primary" onclick="openCashBoxModal()">+ صندوق / عهدة جديدة</button>
      </div>
    </div>

    <div class="page-content">
      <div class="page-header" style="margin-bottom:16px;">
        <h1 class="page-title" style="font-size:22px;font-weight:900;">💵 إدارة الصناديق النقدية والعهَد والتمويل الشخصي</h1>
        <p class="page-subtitle" style="color:var(--text-3);font-size:13px;">إدارة عهد المناديـب، الخزائن الرئيسية والفرعية، وحسابات جاري المالك مع كشوفات الحركات النقدية</p>
      </div>

      <!-- Luxury Color Cards Grid -->
      <div class="grid-3 gap-16 mb-24" id="cb-grid">
        <div class="page-loading"><div class="loading-spinner"></div></div>
      </div>

      <!-- Filter Bar for Transactions -->
      <div class="card" style="margin-bottom:24px;">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border-soft);">
          <div>
            <h3 style="font-size:16px;font-weight:800;margin:0;" id="cb-txn-table-title">📑 سجل ودعم كشف حركات الصناديق والعهد</h3>
            <p style="font-size:12px;color:var(--text-3);margin:2px 0 0 0;" id="cb-txn-table-subtitle">انقر على أي كارت صندوق بالأعلى للتصفية المباشرة عليه أو استعراض كشف الحساب الشامل</p>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-reset-box-filter" onclick="filterCashBoxTxnsByCard('')" style="display:none;">✕ عرض كافة الصناديق</button>
        </div>

        <div style="padding:14px 20px;background:var(--bg-2);border-bottom:1px solid var(--border-soft);display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <div style="flex:1;min-width:180px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">تصفية بالصندوق</label>
            <select id="filter-cb-box" class="input" onchange="applyCashTxnFilters()" style="font-size:12.5px;">
              <option value="">جميع الصناديق والعهد</option>
            </select>
          </div>
          <div style="width:140px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">من تاريخ</label>
            <input type="date" id="filter-cb-from" class="input" onchange="applyCashTxnFilters()" style="font-size:12px;" />
          </div>
          <div style="width:140px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">إلى تاريخ</label>
            <input type="date" id="filter-cb-to" class="input" onchange="applyCashTxnFilters()" style="font-size:12px;" />
          </div>
          <div style="width:140px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">نوع الحركة</label>
            <select id="filter-cb-type" class="input" onchange="applyCashTxnFilters()" style="font-size:12.5px;">
              <option value="">كل الحركات</option>
              <option value="in">إيداعات / مقبوضات (+)</option>
              <option value="out">سحوبات / مصروفات (-)</option>
            </select>
          </div>
          <div style="flex:1;min-width:200px;">
            <label style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">🔍 بحث بالبيان / المرجع</label>
            <input type="text" id="filter-cb-search" class="input" placeholder="اكتب بياناً أو مرجعاً للبحث..." oninput="applyCashTxnFilters()" style="font-size:12.5px;" />
          </div>
        </div>

        <div class="table-container">
          <table class="data-dense">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>الصندوق / العهدة</th>
                <th>نوع الحركة</th>
                <th>البيان والسبب</th>
                <th>المبلغ</th>
                <th>الرصيد بعد الحركة</th>
                <th>المستخدم</th>
              </tr>
            </thead>
            <tbody id="cb-txn-tbody">
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

    <!-- ═══ MODAL: NEW / EDIT CASH BOX ═══ -->
    <div class="modal-overlay" id="cb-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="cb-modal-title">إضافة صندوق نقدي</h3>
          <button class="modal-close" onclick="closeModal('cb-modal')">×</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="cb-edit-id" />
          <div class="form-group mb-16">
            <label>اسم الصندوق / العهدة *</label>
            <input type="text" id="cb-name" class="input" placeholder="مثال: عهدة المندوب أحمد / الصندوق الرئيسي" />
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>نوع الصندوق</label>
              <select id="cb-type">
                <option value="main">خزينة رئيسية</option>
                <option value="rep">عهدة مندوب</option>
                <option value="owner_current">👤 جاري المالك (تمويل شخصي)</option>
                <option value="petty">مصروفات نثرية</option>
              </select>
            </div>
            <div class="form-group">
              <label>المسؤول</label>
              <input type="text" id="cb-keeper" class="input" placeholder="اسم المندوب / أمين الصندوق" />
            </div>
          </div>
          <div class="form-group mb-16">
            <label>الرصيد الافتتاحي (ر.س)</label>
            <input type="number" id="cb-opening" class="input mono" step="0.01" placeholder="0.00" />
          </div>
          <div class="form-group mb-16" id="cb-coa-toggle-wrap" style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="cb-coa-toggle" checked style="width:16px;height:16px;cursor:pointer;" />
            <label for="cb-coa-toggle" style="margin-bottom:0;cursor:pointer;font-weight:bold;">إنشاء حساب مستقل في شجرة الحسابات</label>
          </div>
          <div id="cb-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('cb-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveCashBox()" id="save-cb-btn">حفظ الصندوق</button>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: CASH TRANSACTION ═══ -->
    <div class="modal-overlay" id="cb-txn-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">سند حركة نقدية</h3>
          <button class="modal-close" onclick="closeModal('cb-txn-modal')">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group mb-16">
            <label>الصندوق *</label>
            <select id="ctxn-box" onchange="toggleTxnTypeFields()"></select>
          </div>
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group">
              <label>نوع الحركة *</label>
              <select id="ctxn-type" onchange="toggleTxnTypeFields()">
                <option value="in">إيداع / تزويد نقدية (+)</option>
                <option value="out">سحب / مصاريف (-)</option>
                <option value="transfer">تحويل بين الصناديق 🔄</option>
              </select>
            </div>
            <div class="form-group">
              <label>المبلغ (ر.س) *</label>
              <input type="number" id="ctxn-amount" class="input mono" step="0.01" min="0.01" />
            </div>
          </div>
          <div class="form-group mb-16 hidden" id="ctxn-target-box-wrap">
            <label>الصندوق المستلم (إلى) *</label>
            <select id="ctxn-target-box"></select>
          </div>
          <div class="form-group mb-16">
            <label>البيان / السبب *</label>
            <input type="text" id="ctxn-notes" class="input" placeholder="مثال: توريد مبيعات يومية، تسليم نقدية المندوب..." />
          </div>
          <div id="ctxn-error" class="alert bad hidden"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('cb-txn-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="saveCashTxn()" id="save-ctxn-btn">💾 حفظ الحركة</button>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: DETAILED STATEMENT OF ACCOUNT ═══ -->
    <div class="modal-overlay" id="cb-statement-modal">
      <div class="modal modal-lg" style="max-width:920px;border-radius:20px;overflow:hidden;">
        <div class="modal-header" style="background:linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);color:#fff;padding:18px 24px;">
          <h3 class="modal-title" id="cb-stmt-modal-title" style="color:#fff;font-size:18px;font-weight:900;">📄 كشف حساب تفصيلي للصندوق</h3>
          <button class="modal-close" onclick="closeModal('cb-statement-modal')" style="color:#fff;opacity:0.8;">×</button>
        </div>
        <div class="modal-body" id="cb-stmt-body" style="padding:20px;background:#f8fafc;">
          <!-- Loaded dynamically -->
        </div>
        <div class="modal-footer" style="background:#f1f5f9;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;">
          <button class="btn btn-secondary" onclick="closeModal('cb-statement-modal')">إلغاء</button>
          <button class="btn btn-primary" onclick="printCashBoxStatementHTML()">🖨️ طباعة رسمية لكشف الحساب</button>
        </div>
      </div>
    </div>
  `,await A(),await V()}async function A(){const o=document.getElementById("cb-grid"),e=document.getElementById("filter-cb-box");if(o)try{O(h.cashBoxes().path),O(h.chartOfAccounts().path),m=await H(h.cashBoxes(),[_("name")]);const i=await H(h.chartOfAccounts());for(const t of m){const s=t.name||"",f=i.find(r=>r.id===t.accountId||r.code===t.accountCode||r.name&&r.name.includes(s)||s.includes("مصطفى")&&r.code==="1-1-1-2-01"||(s.includes("الرئيسى")||s.includes("الرئيسي"))&&r.code==="1-1-1-1-3"||s.includes("رضا")&&r.code==="1-1-1-2-04");if(f){const r=Number(f.balance||0);let x=!1;const l={};Number(t.balance||0)!==r&&(l.balance=r,x=!0),t.balance=r,t.accountCode!==f.code&&(t.accountCode=f.code,t.code=f.code,l.accountCode=f.code,l.code=f.code,x=!0),x&&await M("cashBoxes",t.id,l)}}if(e&&(e.innerHTML='<option value="">جميع الصناديق والعهد</option>'+m.map(t=>`<option value="${t.id}" ${t.id===N?"selected":""}>${t.name}</option>`).join("")),m.length===0){o.innerHTML='<div class="empty-state" style="grid-column:span 3;"><div class="empty-icon">💵</div><h3>لا توجد صناديق نقدية</h3><p>اضغط على "صندوق جديد" لإضافة خزينة أو عهدة مندوب</p></div>';return}o.innerHTML=m.map(t=>{const s=tt(t),f=N===t.id;return`
        <div class="card cb-card-luxury cb-card-interactive" onclick="filterCashBoxTxnsByCard('${t.id}')" style="background:${s.gradient}; border:${s.border}; box-shadow:${s.shadow}; cursor:pointer; ${f?"outline:3.5px solid #ffffff;transform:scale(1.02);":""}">
          
          <div style="position:absolute; top:-15px; left:-15px; font-size:95px; opacity:0.12; pointer-events:none; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">${s.icon}</div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; position:relative; z-index:2;">
            <span class="cb-badge" style="font-size:11.5px; display:inline-flex; align-items:center; gap:6px;">
              <span>${s.icon}</span> <span>${s.badgeText}</span>
            </span>
            <div style="display:flex; gap:6px;" onclick="event.stopPropagation();">
              <button class="btn btn-icon sm" onclick="openCashBoxStatementModal('${t.id}')" style="background:rgba(255,255,255,0.22); color:#ffffff !important; border:1px solid rgba(255,255,255,0.3); border-radius:8px;" title="كشف حساب تفصيلي">📄</button>
              <button class="btn btn-icon sm" onclick="openCashBoxModal('${t.id}')" style="background:rgba(255,255,255,0.22); color:#ffffff !important; border:1px solid rgba(255,255,255,0.3); border-radius:8px;" title="تعديل">✏️</button>
              <button class="btn btn-icon sm" onclick="deleteCashBox('${t.id}','${t.name}')" style="background:rgba(239,68,68,0.4); color:#ffffff !important; border:1px solid rgba(239,68,68,0.6); border-radius:8px;" title="حذف">🗑️</button>
            </div>
          </div>

          <h3 class="cb-box-title" style="margin:0 0 6px 0; position:relative; z-index:2;">${t.name}</h3>
          <div class="cb-sub-text" style="margin-bottom:14px; position:relative; z-index:2;">👤 المسؤول: <strong style="color:#ffffff !important;">${t.keeper||"غير محدد"}</strong> ${t.accountCode?`| كود: <span dir="ltr" style="font-family:var(--font-mono, monospace);font-weight:800;direction:ltr;unicode-bidi:isolate;display:inline-block;color:#ffffff !important;">${t.accountCode}</span>`:""}</div>

          <div class="cb-amount-box" style="position:relative; z-index:2;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:12px; font-weight:800; color:rgba(255,255,255,0.95) !important;">💵 الرصيد النقدي المتوفر</span>
              <span style="font-size:10.5px; font-weight:800; background:rgba(16,185,129,0.35); border:1px solid rgba(16,185,129,0.6); padding:2px 8px; border-radius:12px; color:#a7f3d0 !important;">نقد فوري</span>
            </div>
            <div class="cb-balance-value" style="direction:ltr; text-align:right;">
              ${u(t.balance||0)}
            </div>
          </div>

          <div style="margin-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:11.5px; position:relative; z-index:2;">
            <span style="color:rgba(255,255,255,0.95) !important; font-weight:700;">
              ${f?"🎯 تصفية نشطة للجدول":"🔍 انقر لتصفية الحركات"}
            </span>
            <button onclick="event.stopPropagation(); openCashBoxStatementModal('${t.id}')" style="background:transparent; border:none; color:#ffffff !important; text-decoration:underline; font-size:11.5px; font-weight:800; cursor:pointer; padding:0;">
              كشف الحساب التفصيلي 📄
            </button>
          </div>
        </div>`}).join("")}catch(i){o.innerHTML=`<div class="alert bad">${i.message}</div>`}}async function V(){const o=document.getElementById("cb-txn-tbody");if(o)try{const e=L(h.cashTransactions(),_("createdAt","desc"),Z(200));U=(await z(e)).docs.map(t=>({id:t.id,...t.data()})),applyCashTxnFilters()}catch(e){o.innerHTML=`<tr><td colspan="7"><div class="alert bad" style="margin:8px;">${e.message}</div></td></tr>`}}window.filterCashBoxTxnsByCard=o=>{N=o;const e=document.getElementById("filter-cb-box");e&&(e.value=o);const i=document.getElementById("btn-reset-box-filter");i&&(i.style.display=o?"inline-block":"none"),A(),applyCashTxnFilters()};window.applyCashTxnFilters=()=>{const o=document.getElementById("filter-cb-box")?.value||N||"",e=document.getElementById("filter-cb-from")?.value||"",i=document.getElementById("filter-cb-to")?.value||"",t=document.getElementById("filter-cb-type")?.value||"",s=(document.getElementById("filter-cb-search")?.value||"").trim().toLowerCase(),f=document.getElementById("cb-txn-tbody"),r=document.getElementById("cb-txn-table-title"),x=document.getElementById("cb-txn-table-subtitle");if(!f)return;let l=[...U];if(o){l=l.filter(c=>c.cashBoxId===o);const d=m.find(c=>c.id===o);r&&(r.textContent=`📑 كشف حركات: ${d?d.name:"الصندوق المالي"}`),x&&(x.textContent=`سجل الحركات المصروفة والمقبوضة للصندوق المالي المقتطع (${l.length} حركة)`)}else r&&(r.textContent="📑 سجل ودعم كشف حركات كافة الصناديق والعهد"),x&&(x.textContent="انقر على أي كارت صندوق بالأعلى للتصفية المباشرة عليه أو استعراض كشف الحساب الشامل");const p=d=>d.date&&/^\d{4}-\d{2}-\d{2}$/.test(d.date)?d.date:d.createdAt?.toDate?d.createdAt.toDate().toISOString().split("T")[0]:d.createdAt?.seconds?new Date(d.createdAt.seconds*1e3).toISOString().split("T")[0]:"";e&&(l=l.filter(d=>{const c=p(d);return c?c>=e:!0})),i&&(l=l.filter(d=>{const c=p(d);return c?c<=i:!0})),t&&(l=l.filter(d=>d.type===t)),s&&(l=l.filter(d=>(d.notes||"").toLowerCase().includes(s)||(d.userName||"").toLowerCase().includes(s)||(d.cashBoxId||"").toLowerCase().includes(s))),l.sort((d,c)=>{const g=p(d),a=p(c);if(g!==a)return a.localeCompare(g);const n=d.createdAt?.seconds||0;return(c.createdAt?.seconds||0)-n});const b={};if(m.forEach(d=>b[d.id]=d.name),l.length===0){f.innerHTML='<tr><td colspan="7" style="text-align:center;padding:36px;color:var(--text-2);font-weight:700;">🔍 لا توجد حركات نقدية مطابقة للتصفية المختارة</td></tr>';return}f.innerHTML=l.map(d=>{const c=d.type==="in",g=c?"background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;font-weight:800;":"background:#fef2f2;color:#dc2626;border:1px solid #fecaca;font-weight:800;";return`
      <tr style="transition:all 0.15s ease;">
        <td class="mono font-bold" style="font-size:12.5px;">${d.date?I(d.date):d.createdAt?I(d.createdAt):"—"}</td>
        <td><strong style="color:var(--text-1);">${b[d.cashBoxId]||d.cashBoxId}</strong></td>
        <td><span class="badge" style="${g}padding:4px 10px;border-radius:8px;">${c?"إيداع / تحصيل (+)":"سحب / مصروف (-)"}</span></td>
        <td><span style="font-size:12.5px;color:var(--text-2);font-weight:600;">${d.notes||"—"}</span></td>
        <td class="mono font-bold ${c?"text-ok":"text-bad"}" style="font-size:13.5px;">${c?"+":"-"}${u(d.amount)}</td>
        <td class="mono font-bold" style="font-size:12.5px;"><span dir="ltr" style="display:inline-block;direction:ltr;background:var(--bg-2);padding:2px 8px;border-radius:6px;">${u(d.balanceAfter||0)}</span></td>
        <td style="font-size:11.5px;color:var(--text-3);">${d.userName||"النظام"}</td>
      </tr>`}).join("")};window.openCashBoxStatementModal=async o=>{const e=m.find(s=>s.id===o);if(!e)return;F=e;const i=document.getElementById("cb-stmt-modal-title"),t=document.getElementById("cb-stmt-body");i&&(i.textContent=`📄 كشف حساب تفصيلي شامل — ${e.name}`),t&&(t.innerHTML=`<div style="text-align:center;padding:40px;"><span class="spin"></span> جاري تجميع وتحليل كشف الحساب المالي والقيود لـ ${e.name}…</div>`),openModal("cb-statement-modal");try{const s=e.accountCode||e.code||"",[f,r,x,l]=await Promise.all([z(L(h.cashTransactions(),j("cashBoxId","==",o))),z(L(h.receipts(),j("sourceId","==",o))),z(L(h.expenses(),j("sourceId","==",o))),z(S(w,`companies/${B}/journalEntries`))]),p=[],b=new Set;f.forEach(a=>{const n=a.data(),y=n.date?I(n.date):n.createdAt?.seconds?I(n.createdAt):k();b.add(a.id),n.sourceId&&b.add(n.sourceId);const v=n.type==="in";p.push({id:a.id,date:y,icon:v?"📥":"📤",badgeText:v?"إيداع نقدي":"سحب نقدي",badgeClass:v?"good":"bad",notes:n.notes||"حركة نقدية بالصندوق",inflow:v&&n.amount||0,outflow:v?0:n.amount||0,ref:n.sourceType==="receipt"?`RV-${(n.sourceId||a.id).substring(0,6).toUpperCase()}`:`TXN-${a.id.substring(0,6).toUpperCase()}`})}),r.forEach(a=>{if(b.has(a.id))return;const n=a.data();b.add(a.id),p.push({id:a.id,date:n.date?I(n.date):k(),icon:"🟢 📥",badgeText:"تحصيل مبيعات (سند قبض)",badgeClass:"good",notes:`تحصيل من العميل: ${n.customerName||n.accountName||"عميل"} — ${n.notes||""}`,inflow:n.amount||0,outflow:0,ref:n.displayCode||n.code||`RV-${a.id.substring(0,6).toUpperCase()}`})}),x.forEach(a=>{if(b.has(a.id))return;const n=a.data();b.add(a.id),p.push({id:a.id,date:n.date?I(n.date):k(),icon:"🔴 📤",badgeText:"مصروفات (سند صرف)",badgeClass:"bad",notes:`صرف لصالح: ${n.supplierName||n.accountName||"جهة"} — ${n.category||n.notes||""}`,inflow:0,outflow:n.amount||0,ref:n.code||`PV-${a.id.substring(0,6).toUpperCase()}`})}),s&&l.forEach(a=>{const n=a.data();n.status==="cancelled"||n.isReversed||n.sourceId&&b.has(n.sourceId)||(n.lines||[]).forEach(y=>{if(y.accountCode===s||y.accountName&&y.accountName.includes(e.name)){const v=n.code||n.entryNumber||n.id.slice(0,8);if(b.has(v)||b.has(a.id))return;b.add(a.id);const C=Number(y.debit||0),$=Number(y.credit||0);C>0?p.push({id:a.id,date:n.date||k(),icon:"📥",badgeText:"قيد يومية مدين (+)",badgeClass:"good",notes:`${n.description||y.note||"إيداع بقيد يومية"}`,inflow:C,outflow:0,ref:v}):$>0&&p.push({id:a.id,date:n.date||k(),icon:"📤",badgeText:"قيد يومية دائن (-)",badgeClass:"bad",notes:`${n.description||y.note||"سحب بقيد يومية"}`,inflow:0,outflow:$,ref:v})}})}),p.sort((a,n)=>(a.date||"").localeCompare(n.date||""));let d=0,c=0,g=0;p.forEach(a=>{c+=a.inflow,g+=a.outflow,d+=a.inflow-a.outflow,a.balanceAfter=d}),J=p,t.innerHTML=`
      <!-- Box Info Banner -->
      <div style="background:linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius:16px; padding:20px 24px; color:#fff; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; box-shadow:0 8px 20px rgba(30,27,75,0.25);">
        <div>
          <div style="font-size:11px; color:#a5b4fc; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">كشف الحساب التفصيلي الموحد</div>
          <h2 style="font-size:22px; font-weight:900; margin:4px 0 4px 0; color:#ffffff;">${e.name}</h2>
          <div style="font-size:12.5px; color:#cbd5e1;">المسؤول: <strong style="color:#ffffff;">${e.keeper||"غير محدد"}</strong> ${s?`| رمز الحساب المحاسبي: <span style="font-family:monospace;font-weight:800;color:#67e8f9;">${s}</span>`:""}</div>
        </div>
        <div style="text-align:left; background:rgba(255,255,255,0.12); padding:12px 20px; border-radius:14px; border:1px solid rgba(255,255,255,0.25);">
          <div style="font-size:11px; color:#a5b4fc; font-weight:700;">الرصيد النهائي الفعلي الحالي</div>
          <div class="mono" style="font-size:24px; font-weight:900; direction:ltr; color:#ffffff;">${u(e.balance||0)}</div>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid-3 gap-12 mb-20">
        <div style="background:#ecfdf5; border:1.5px solid #a7f3d0; border-radius:14px; padding:16px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
          <div style="font-size:11.5px; color:#047857; font-weight:800;">إجمالي المقبوضات والإيداعات (+)</div>
          <div class="mono text-ok" style="font-size:20px; font-weight:900; margin-top:4px;">+${u(c)}</div>
        </div>
        <div style="background:#fef2f2; border:1.5px solid #fecaca; border-radius:14px; padding:16px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
          <div style="font-size:11.5px; color:#dc2626; font-weight:800;">إجمالي المصروفات والسحوبات (-)</div>
          <div class="mono text-bad" style="font-size:20px; font-weight:900; margin-top:4px;">-${u(g)}</div>
        </div>
        <div style="background:#eff6ff; border:1.5px solid #bfdbfe; border-radius:14px; padding:16px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
          <div style="font-size:11.5px; color:#1d4ed8; font-weight:800;">إجمالي عدد الحركات المقيدة</div>
          <div class="mono" style="font-size:20px; font-weight:900; color:#1d4ed8; margin-top:4px;">${p.length} حركة</div>
        </div>
      </div>

      <!-- Statement Table -->
      <div class="table-container" style="background:#fff; border-radius:14px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.03);">
        <table class="data-dense" style="width:100%; font-size:12px;">
          <thead>
            <tr style="background:#1e293b; color:#ffffff;">
              <th style="padding:10px 12px; width:90px;">التاريخ</th>
              <th style="padding:10px 12px; width:170px;">نوع الحركة والرمز</th>
              <th style="padding:10px 12px; width:100px;">المرجع</th>
              <th style="padding:10px 12px;">البيان والسبب التفصيلي</th>
              <th style="padding:10px 12px; text-align:left; width:110px;">وارد (+)</th>
              <th style="padding:10px 12px; text-align:left; width:110px;">صادر (-)</th>
              <th style="padding:10px 12px; text-align:left; width:125px;">الرصيد التراكمي</th>
            </tr>
          </thead>
          <tbody>
            ${p.length?p.map(a=>`
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td class="mono font-bold" style="font-size:12px; padding:10px 12px;">${a.date}</td>
                <td style="padding:10px 12px;">
                  <span style="display:inline-flex; align-items:center; gap:6px; background:${a.inflow?"#ecfdf5":"#fef2f2"}; color:${a.inflow?"#047857":"#991b1b"}; padding:4px 10px; border-radius:8px; font-weight:800; font-size:11.5px; border:1px solid ${a.inflow?"#a7f3d0":"#fca5a5"};">
                    <span>${a.icon}</span> <span>${a.badgeText}</span>
                  </span>
                </td>
                <td class="mono" style="font-size:11px; padding:10px 12px;"><span dir="ltr" style="background:#f1f5f9; padding:2px 8px; border-radius:6px; font-weight:800; color:#334155;">${a.ref}</span></td>
                <td style="font-size:12px; color:#1e293b; font-weight:600; padding:10px 12px;">${a.notes}</td>
                <td class="mono text-ok font-bold" style="text-align:left; font-size:13px; padding:10px 12px;">${a.inflow?"+"+u(a.inflow):"—"}</td>
                <td class="mono text-bad font-bold" style="text-align:left; font-size:13px; padding:10px 12px;">${a.outflow?"-"+u(a.outflow):"—"}</td>
                <td class="mono font-bold" style="text-align:left; font-size:13px; padding:10px 12px;"><span dir="ltr" style="display:inline-block; direction:ltr; background:#f8fafc; padding:3px 10px; border-radius:8px; border:1px solid #cbd5e1; color:#0f172a;">${u(a.balanceAfter)}</span></td>
              </tr>
            `).join(""):'<tr><td colspan="7" style="text-align:center; padding:36px; color:#64748b; font-weight:700;">لا توجد حركات مقيدة لهذا الصندوق حالياً</td></tr>'}
          </tbody>
        </table>
      </div>
    `}catch(s){t.innerHTML=`<div class="alert bad">خطأ في جلب كشف الحساب التفصيلي: ${s.message}</div>`}};window.printCashBoxStatementHTML=()=>{if(!F)return;const o=window.open("","_blank","width=900,height=750"),e=F,i=J;o.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>كشف حساب رسمي — ${e.name}</title>
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
      <h1 style="font-size:20px;font-weight:900;">كشف حساب تفصيلي رسمي</h1>
      <h2 style="font-size:16px;font-weight:700;color:#93c5fd;margin-top:4px;">${e.name}</h2>
      <div style="font-size:11px;color:#cbd5e1;margin-top:4px;">مسؤول الصندوق: ${e.keeper||"—"} ${e.accountCode?`| كود الحساب: ${e.accountCode}`:""}</div>
    </div>
    <div style="text-align:left;">
      <div style="font-size:11px;color:#93c5fd;">الرصيد الفعلي الحالي</div>
      <div class="mono" style="font-size:24px;font-weight:900;direction:ltr;">${u(e.balance||0)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>التاريخ</th>
        <th>نوع الحركة</th>
        <th>المرجع</th>
        <th>البيان والتفاصيل</th>
        <th style="text-align:left;">وارد (+)</th>
        <th style="text-align:left;">صادر (-)</th>
        <th style="text-align:left;">الرصيد التراكمي</th>
      </tr>
    </thead>
    <tbody>
      ${i.map(t=>`
        <tr>
          <td class="mono">${t.date}</td>
          <td><strong>${t.type}</strong></td>
          <td class="mono" dir="ltr">${t.ref}</td>
          <td>${t.notes}</td>
          <td class="mono" style="text-align:left;color:#047857;">${t.inflow?"+"+u(t.inflow):"—"}</td>
          <td class="mono" style="text-align:left;color:#dc2626;">${t.outflow?"-"+u(t.outflow):"—"}</td>
          <td class="mono" style="text-align:left;font-weight:900;" dir="ltr">${u(t.balanceAfter)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <div style="margin-top:30px;padding-top:15px;border-top:1px dashed #94a3b8;display:flex;justify-content:space-between;font-size:11px;color:#64748b;">
    <div>طُبع رسمياً من نظام إدهام ERP بتاريخ: ${new Date().toLocaleString("ar-SA")}</div>
    <div>توقيع أمين الصندوق / المحاسب المسؤول: .......................................</div>
  </div>
</body>
</html>`),o.document.close(),setTimeout(()=>{o.focus(),o.print(),o.close()},600)};window.openCashBoxModal=(o="")=>{const e=document.getElementById("cb-opening")?.closest(".form-group"),i=document.getElementById("cb-coa-toggle-wrap");if(o){const t=m.find(s=>s.id===o);if(!t)return;document.getElementById("cb-edit-id").value=t.id,document.getElementById("cb-name").value=t.name||"",document.getElementById("cb-keeper").value=t.keeper||"",document.getElementById("cb-type").value=t.type||"main",document.getElementById("cb-opening").value=t.openingBalance||0,e&&(e.style.display="none"),i&&(i.style.display="none")}else document.getElementById("cb-edit-id").value="",document.getElementById("cb-name").value="",document.getElementById("cb-keeper").value="",document.getElementById("cb-type").value="main",document.getElementById("cb-opening").value="",e&&(e.style.display="block"),i&&(i.style.display="flex");document.getElementById("cb-error").classList.add("hidden"),openModal("cb-modal")};window.saveCashBox=async()=>{const o=document.getElementById("cb-error");o.classList.add("hidden");const e=document.getElementById("cb-edit-id").value,i=document.getElementById("cb-name").value.trim(),t=document.getElementById("cb-type").value,s=document.getElementById("cb-keeper").value.trim(),f=parseFloat(document.getElementById("cb-opening")?.value)||0,r=document.getElementById("cb-coa-toggle")?.checked??!0;if(!i){o.textContent="يرجى أدخال اسم الصندوق / العهدة",o.classList.remove("hidden");return}const x=document.getElementById("save-cb-btn");x.disabled=!0;try{if(e){const l=m.find(p=>p.id===e);await M(h.cashBoxes(),e,{name:i,type:t,keeper:s}),l?.accountId&&await M(h.chartOfAccounts(),l.accountId,{name:i}),showToast("تم تحديث بيانات الصندوق بنجاح","success")}else{let l=null,p=null;if(r){const c=await K({entityId:"temp",entityType:"cashBox",name:i,parentCode:t==="owner_current"?"3-1-4":"1-1-1-2"});c&&(l=c.id||c.accountId,p=c.code||c.accountCode)}const b=await X(h.cashBoxes(),{name:i,type:t,keeper:s,openingBalance:f,balance:f,accountId:l,accountCode:p});l&&b?.id&&await M(h.chartOfAccounts(),l,{sourceEntityId:b.id}),showToast("تم إضافة الصندوق النقدي بنجاح","success")}closeModal("cb-modal"),await A()}catch(l){o.textContent=l.message,o.classList.remove("hidden")}finally{x.disabled=!1}};window.deleteCashBox=async(o,e)=>{if(await window.showConfirm?.(`هل أنت متأكد من حذف ${e}؟`,"حذف الصندوق"))try{const t=m.find(s=>s.id===o);await Y(h.cashBoxes(),o),t?.accountId&&await Q(t.accountId),showToast("تم حذف الصندوق بنجاح","success"),await A()}catch(t){showToast("خطأ في الحذف: "+t.message,"error")}};window.toggleTxnTypeFields=()=>{const o=document.getElementById("ctxn-type").value,e=document.getElementById("ctxn-target-box-wrap"),i=document.getElementById("ctxn-target-box"),t=document.getElementById("ctxn-box").value;if(o==="transfer"){e.classList.remove("hidden");const s=m.filter(f=>f.id!==t);i.innerHTML=s.map(f=>`<option value="${f.id}">${f.name}</option>`).join("")}else e.classList.add("hidden")};window.openCashTxnModal=()=>{const o=document.getElementById("ctxn-box");if(m.length===0){showToast("قم بإضافة صندوق نقدي أولاً","warning");return}o.innerHTML=m.map(e=>`<option value="${e.id}">${e.name} (${u(e.balance||0)})</option>`).join(""),document.getElementById("ctxn-type").value="in",document.getElementById("ctxn-amount").value="",document.getElementById("ctxn-notes").value="",document.getElementById("ctxn-error").classList.add("hidden"),toggleTxnTypeFields(),openModal("cb-txn-modal")};window.saveCashTxn=async()=>{const o=document.getElementById("ctxn-error");o.classList.add("hidden");const e=document.getElementById("ctxn-box").value,i=document.getElementById("ctxn-type").value,t=parseFloat(document.getElementById("ctxn-amount").value)||0,s=document.getElementById("ctxn-notes").value.trim();if(!e){o.textContent="اختر الصندوق",o.classList.remove("hidden");return}if(t<=0){o.textContent="المبلغ غير صحيح",o.classList.remove("hidden");return}if(!s){o.textContent="أدخل البيان",o.classList.remove("hidden");return}const f=document.getElementById("save-ctxn-btn");f.disabled=!0;try{if(i==="transfer"){const r=document.getElementById("ctxn-target-box").value;if(!r)throw new Error("اختر الصندوق المستلم");if(r===e)throw new Error("لا يمكن التحويل لنفس الصندوق");const x=T(w,`companies/${B}/cashBoxes`,e),l=T(w,`companies/${B}/cashBoxes`,r);let p=0,b=0,d="",c="",g="",a="";await P(w,async n=>{const y=await n.get(x),v=await n.get(l);if(!y.exists())throw new Error("الصندوق المرسل غير موجود");if(!v.exists())throw new Error("الصندوق المستلم غير موجود");const C=y.data(),$=v.data(),D=C.balance||0,q=$.balance||0;if(d=C.name,c=$.name,g=C.accountCode||"1-1-1-1-3",a=$.accountCode||"1-1-1-1-3",D<t)throw new Error(`رصيد الصندوق المرسل غير كافٍ: ${D} < ${t}`);p=D-t,b=q+t,n.update(x,{balance:p,updatedAt:E()}),n.update(l,{balance:b,updatedAt:E()});const G=T(S(w,`companies/${B}/cashTransactions`));n.set(G,{cashBoxId:e,type:"out",amount:t,notes:`تحويل إلى ${c} — ${s}`,balanceAfter:p,createdAt:E()});const W=T(S(w,`companies/${B}/cashTransactions`));n.set(W,{cashBoxId:r,type:"in",amount:t,notes:`تحويل من ${d} — ${s}`,balanceAfter:b,createdAt:E()})});try{await R({date:new Date().toISOString().split("T")[0],description:`تحويل نقدي من صندوق ${d} إلى ${c} — ${s}`,sourceType:"cashTransaction",lines:[{accountCode:a,accountName:c,debit:t,credit:0},{accountCode:g,accountName:d,debit:0,credit:t}],status:"posted",createdByName:"النظام"})}catch(n){console.warn("[CashTxn JE] Failed (non-fatal):",n.message)}}else{const r=T(w,`companies/${B}/cashBoxes`,e);let x=0,l="1-1-1-1-3",p="الصندوق";await P(w,async b=>{const d=await b.get(r);if(!d.exists())throw new Error("الصندوق غير موجود");const c=d.data(),g=c.balance||0,a=i==="in"?+t:-t;if(x=g+a,x<0&&i==="out")throw new Error(`رصيد الصندوق غير كافٍ: ${g} < ${t}`);l=c.accountCode||"1-1-1-1-3",p=c.name,b.update(r,{balance:x,updatedAt:E()});const n=T(S(w,`companies/${B}/cashTransactions`));b.set(n,{cashBoxId:e,type:i,amount:t,notes:s,balanceAfter:x,createdAt:E()})});try{const b=i==="in"?l:"6-9-1",d=i==="in"?p:"مصاريف متنوعة",c=i==="in"?"4-9-1":l,g=i==="in"?"إيرادات متنوعة":p;await R({date:new Date().toISOString().split("T")[0],description:`حركة نقدية — ${s} — صندوق: ${p}`,sourceType:"cashTransaction",lines:[{accountCode:b,accountName:d,debit:t,credit:0},{accountCode:c,accountName:g,debit:0,credit:t}],status:"posted",createdByName:"النظام"})}catch(b){console.warn("[CashTxn JE] Failed (non-fatal):",b.message)}}showToast("تم تسجيل الحركة النقدية بنجاح","success"),closeModal("cb-txn-modal"),await A(),await V()}catch(r){o.textContent=r.message,o.classList.remove("hidden")}finally{f.disabled=!1}};export{lt as render};
