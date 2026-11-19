const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/sales-invoices.js_v_50-CLkyFk9f.js","assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css","assets/zatca-qr-BvSwEdXN.js","assets/accounting-engine-C71tPcGM.js","assets/excel-DM5XZHtQ.js","assets/balance-sync-CUiyFg8g.js","assets/receipts.js_v_44-BPPIluv1.js","assets/sales-returns.js_v_39-ZkztOXvM.js","assets/journal-entries.js_v_44-DM_7fSoM.js","assets/delivery-notes.js_v_50-BpGyqBo2.js","assets/trust-receipts.js_v_2-C9I3kW4K.js","assets/debt-acknowledgment.js_v_2-H-BqRKEN.js"])))=>i.map(i=>d[i]);
import{g as F,C as S,w as Y,f as s,d as J,a as G,_ as N}from"./index-CF9GFeRJ.js";import{e as Q}from"./excel-DM5XZHtQ.js";import{orderBy as U,getDoc as K,doc as X,where as L}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let P=[],d=null,_=[],f={opening:0,debit:0,credit:0,returns:0,balance:0},h="",w="",M="all";const $=()=>new Date().toISOString().slice(0,10),q=()=>{const i=new Date;return i.setMonth(i.getMonth()-1),i.toISOString().slice(0,10)},Z=()=>`${new Date().getFullYear()}-01-01`;async function vt(i,t){h=q(),w=$(),i.innerHTML=`
    <div class="filterbar no-print">
      <div style="position:relative; min-width:280px; flex:1; max-width:360px;">
        <input type="text" id="stmt-cust-search" class="input" placeholder="🔍 ابحث عن العميل (الاسم / الهاتف / الكود)..." autocomplete="off" />
        <div id="stmt-cust-results" class="autocomplete-dropdown hidden" style="position:absolute; top:100%; left:0; right:0; z-index:999; max-height:260px; overflow-y:auto; background:var(--bg-card); border:1px solid var(--border); border-radius:8px; box-shadow:var(--shadow-lg);"></div>
      </div>
      
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="stmt-from" class="input" value="${h}" style="width:135px;" onchange="window.onStmtDateChange()" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="stmt-to" class="input" value="${w}" style="width:135px;" onchange="window.onStmtDateChange()" />
      </div>

      <div style="display:flex; gap:4px;">
        <button class="btn btn-secondary btn-sm" onclick="window.setStmtPeriod('month')">الشهر</button>
        <button class="btn btn-secondary btn-sm" onclick="window.setStmtPeriod('quarter')">الربع</button>
        <button class="btn btn-secondary btn-sm" onclick="window.setStmtPeriod('year')">السنة</button>
        <button class="btn btn-secondary btn-sm" onclick="window.setStmtPeriod('all')">شامل</button>
      </div>

      <div style="margin-right:auto; display:flex; gap:6px; flex-wrap:wrap;">
        <button class="btn btn-secondary" onclick="window.printCustomerStatement()" id="stmt-print-btn" disabled>🖨️ طباعة</button>
        <button class="btn btn-secondary" onclick="window.exportCustomerStatementPDF()" id="stmt-pdf-btn" disabled>📄 تصدير PDF</button>
        <button class="btn btn-secondary" onclick="window.exportCustomerStatementExcel()" id="stmt-excel-btn" disabled>📊 Excel</button>
        <button class="btn btn-primary" style="background:#25D366; border-color:#25D366;" onclick="window.shareCustomerStatementWhatsApp()" id="stmt-wa-btn" disabled>💬 واتساب</button>
        <button class="btn btn-secondary" style="background:rgba(124,58,237,.1); color:#7C3AED; border-color:rgba(124,58,237,.3);" onclick="window.printBalanceConfirmation()" id="stmt-confirm-btn" disabled>📑 مصادقة رصيد</button>
        <button class="btn btn-secondary" style="background:rgba(220,38,38,.08); color:#dc2626; border-color:rgba(220,38,38,.3);" onclick="window.openDebtAcknowledgmentForCurrentCustomer()" id="stmt-debt-ack-btn" title="إصدار إقرار مديونية وتعهد سداد قضائي">⚖️ إقرار مديونية</button>
        <button class="btn btn-secondary" style="background:rgba(3,105,161,.08); color:#0284c7; border-color:rgba(3,105,161,.3);" onclick="window.openTrustReceiptForCurrentCustomer()" id="stmt-trust-btn" title="إصدار سند أمانة وعهدة مالية (م/79)">🛡️ سند أمانة</button>
      </div>
    </div>

    <div class="page-content">
      <!-- Customer Info Header Card -->
      <div id="stmt-cust-header" class="card mb-16" style="padding:16px 20px; background:linear-gradient(135deg, var(--bg-card), rgba(99,102,241,0.03)); border:1px solid var(--border-soft);">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:48px; height:48px; border-radius:12px; background:rgba(99,102,241,0.1); color:var(--brand); display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:800;">👤</div>
            <div>
              <h2 id="stmt-cust-name" style="margin:0; font-size:18px; font-weight:800; color:var(--text-0);">اختر عميلاً لعرض كشف الحساب</h2>
              <div id="stmt-cust-sub" style="font-size:12px; color:var(--text-2); margin-top:2px;">قم بالبحث عن العميل بالأعلى لبدء استعراض الحركات المالية وأعمار الديون</div>
            </div>
          </div>
          <div id="stmt-kpi-strip" style="display:flex; gap:12px; flex-wrap:wrap;"></div>
        </div>
      </div>

      <!-- Aging of Receivables (أعمار الديون) Strip -->
      <div id="stmt-aging-strip" class="mb-16" style="display:none;">
        <div style="font-size:12px; font-weight:800; color:var(--text-2); margin-bottom:8px; display:flex; align-items:center; gap:6px;">
          <span>⏳ تحليل أعمار الديون والمستحقات (Aging Analysis):</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px;">
          <div style="padding:12px 14px; background:var(--bg-card); border:1px solid rgba(16,185,129,0.25); border-radius:10px;">
            <div style="font-size:11px; color:#10B981; font-weight:700;">🟢 جارية (0 - 30 يوم)</div>
            <div class="mono" id="aging-current" style="font-size:16px; font-weight:900; color:#10B981; margin-top:3px;">0.00 ر.س</div>
          </div>
          <div style="padding:12px 14px; background:var(--bg-card); border:1px solid rgba(245,158,11,0.25); border-radius:10px;">
            <div style="font-size:11px; color:#F59E0B; font-weight:700;">🟡 معتدلة (31 - 60 يوم)</div>
            <div class="mono" id="aging-30" style="font-size:16px; font-weight:900; color:#F59E0B; margin-top:3px;">0.00 ر.س</div>
          </div>
          <div style="padding:12px 14px; background:var(--bg-card); border:1px solid rgba(249,115,22,0.25); border-radius:10px;">
            <div style="font-size:11px; color:#F97316; font-weight:700;">🟠 متأخرة (61 - 90 يوم)</div>
            <div class="mono" id="aging-60" style="font-size:16px; font-weight:900; color:#F97316; margin-top:3px;">0.00 ر.س</div>
          </div>
          <div style="padding:12px 14px; background:var(--bg-card); border:1px solid rgba(239,68,68,0.25); border-radius:10px;">
            <div style="font-size:11px; color:#EF4444; font-weight:700;">🔴 متعثرة (+90 يوم)</div>
            <div class="mono" id="aging-90" style="font-size:16px; font-weight:900; color:#EF4444; margin-top:3px;">0.00 ر.س</div>
          </div>
        </div>
      </div>

      <!-- Quick Type Filter Buttons -->
      <div id="stmt-type-bar" class="mb-12 no-print" style="display:none; align-items:center; gap:8px;">
        <span style="font-size:12px; font-weight:700; color:var(--text-2);">نوع الحركة:</span>
        <button class="btn btn-primary btn-sm" id="btn-flt-all" onclick="window.setStmtTypeFilter('all')">الكل</button>
        <button class="btn btn-secondary btn-sm" id="btn-flt-inv" onclick="window.setStmtTypeFilter('invoice')">🧾 فواتير فقط</button>
        <button class="btn btn-secondary btn-sm" id="btn-flt-rcpt" onclick="window.setStmtTypeFilter('receipt')">💵 سندات قبض فقط</button>
        <button class="btn btn-secondary btn-sm" id="btn-flt-ret" onclick="window.setStmtTypeFilter('return')">↩️ مردودات فقط</button>
        <button class="btn btn-secondary btn-sm" id="btn-flt-dn" onclick="window.setStmtTypeFilter('delivery_note')">📦 سندات تسليم فقط</button>
      </div>

      <!-- Statement Ledger Table -->
      <div class="card" id="stmt-table-card">
        <div class="table-container">
          <table class="data-dense" id="stmt-table">
            <thead>
              <tr>
                <th style="width:105px;">التاريخ</th>
                <th style="width:115px;">نوع الحركة</th>
                <th style="width:125px;">رقم المرجع</th>
                <th>البيان والتفاصيل</th>
                <th style="width:115px; text-align:left;">مدين (+)</th>
                <th style="width:115px; text-align:left;">دائن (-)</th>
                <th style="width:125px; text-align:left;">الرصيد المستحق</th>
                <th style="width:85px; text-align:center;" class="no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody id="stmt-tbody">
              <tr>
                <td colspan="8" style="text-align:center; padding:48px; color:var(--text-2);">
                  <div style="font-size:36px; margin-bottom:8px;">📊</div>
                  <div style="font-size:15px; font-weight:700;">الرجاء اختيار العميل من شريط البحث أعلاه</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Drill-down Details Modal -->
    <div class="modal-overlay" id="stmt-detail-modal">
      <div class="modal modal-lg" style="max-width:820px; width:95%;">
        <div class="modal-header">
          <h3 class="modal-title" id="stmt-detail-title">تفاصيل المستند</h3>
          <button class="modal-close" onclick="closeModal('stmt-detail-modal')">×</button>
        </div>
        <div class="modal-body" id="stmt-detail-body" style="padding:20px; max-height:calc(85vh - 140px); overflow-y:auto;"></div>
        <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; padding:14px 20px; background:var(--bg-card); border-top:1px solid var(--border-soft);">
          <div id="stmt-modal-actions" style="display:flex; gap:8px; flex-wrap:wrap;"></div>
          <button class="btn btn-secondary" onclick="closeModal('stmt-detail-modal')">إغلاق</button>
        </div>
      </div>
    </div>
  `,await tt(),et(),ot()}async function tt(){try{P=await F(S.customers(),[U("name")])}catch(i){console.warn("Failed to load customers for statement:",i)}}function et(){const i=document.getElementById("stmt-cust-search"),t=document.getElementById("stmt-cust-results");!i||!t||(i.addEventListener("input",Y(()=>{const e=i.value.trim().toLowerCase();if(!e){t.classList.add("hidden");return}const l=P.filter(r=>(r.name||"").toLowerCase().includes(e)||(r.code||"").toLowerCase().includes(e)||(r.phone||"").includes(e)).slice(0,15);if(!l.length){t.innerHTML='<div style="padding:12px; text-align:center; color:var(--text-2); font-size:12px;">لا يوجد نتائج</div>',t.classList.remove("hidden");return}t.innerHTML=l.map(r=>`
      <div class="autocomplete-item" onclick="window.selectStmtCustomer('${r.id}')" style="padding:10px 14px; border-bottom:1px solid var(--border-soft); cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:700; font-size:13px; color:var(--text-0);">${r.name}</div>
          <div style="font-size:11px; color:var(--text-2);">${r.phone||"—"} • كود: ${r.code||"—"}</div>
        </div>
        <div class="mono" style="font-weight:800; font-size:13px; color:${(r.balance||0)>0?"var(--bad)":"var(--good)"};">
          ${s(r.balance||0)}
        </div>
      </div>
    `).join(""),t.classList.remove("hidden")},200)),document.addEventListener("click",e=>{!i.contains(e.target)&&!t.contains(e.target)&&t.classList.add("hidden")}))}function ot(){window.selectStmtCustomer=async i=>{if(document.getElementById("stmt-cust-results")?.classList.add("hidden"),d=P.find(r=>r.id===i),!d)return;const t=document.getElementById("stmt-cust-search");t&&(t.value=d.name),["stmt-print-btn","stmt-pdf-btn","stmt-excel-btn","stmt-wa-btn","stmt-confirm-btn","stmt-debt-ack-btn"].forEach(r=>{const n=document.getElementById(r);n&&(n.disabled=!1)});const e=document.getElementById("stmt-aging-strip"),l=document.getElementById("stmt-type-bar");e&&(e.style.display="block"),l&&(l.style.display="flex"),await A()},window.onStmtDateChange=async()=>{h=document.getElementById("stmt-from")?.value||"",w=document.getElementById("stmt-to")?.value||"",d&&await A()},window.setStmtPeriod=async i=>{if(i==="month")h=q(),w=$();else if(i==="quarter"){const t=new Date;t.setMonth(t.getMonth()-3),h=t.toISOString().slice(0,10),w=$()}else i==="year"?(h=Z(),w=$()):i==="all"&&(h="2020-01-01",w=$());document.getElementById("stmt-from").value=h,document.getElementById("stmt-to").value=w,d&&await A()},window.setStmtTypeFilter=i=>{M=i,["all","inv","rcpt","ret","dn"].forEach(t=>{const e=document.getElementById(`btn-flt-${t}`);if(e){const l=t==="all"&&i==="all"||t==="inv"&&i==="invoice"||t==="rcpt"&&i==="receipt"||t==="ret"&&i==="return"||t==="dn"&&i==="delivery_note";e.className=l?"btn btn-primary btn-sm":"btn btn-secondary btn-sm"}}),j()},window.previewDocDetail=async i=>{const t=_[i];if(!t||!t.raw)return;const e=document.getElementById("stmt-detail-title"),l=document.getElementById("stmt-detail-body"),r=document.getElementById("stmt-modal-actions");if(e&&(e.innerHTML=`
        <div style="display:flex; align-items:center; gap:8px;">
          <span>${t.typeLabel}</span>
          <span class="mono" style="color:var(--brand); font-weight:800; font-size:14px;">${t.refNo}</span>
        </div>
      `),r&&(r.innerHTML=""),t.type==="invoice"){let n=t.raw;if((!n.lines||!n.lines.length)&&(!n.items||!n.items.length)&&n.id)try{const a=await K(X(J,`companies/${G}/salesInvoices`,n.id));a.exists()&&(n={id:a.id,...a.data()},t.raw=n)}catch{}const m=n.lines||n.items||[],c=parseFloat(n.subtotal||0),b=parseFloat(n.totalDiscount||n.discount||0),p=parseFloat(n.totalVat||n.vatAmount||0),v=parseFloat(n.totalWithVat||n.total||0);l.innerHTML=`
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px; margin-bottom:16px;">
          <div style="background:var(--bg-card); padding:10px 12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:10.5px; color:var(--text-2);">رقم الفاتورة</div>
            <div class="mono" style="font-weight:800; font-size:13px; color:var(--brand);">${n.number||n.invoiceNumber||t.refNo}</div>
          </div>
          <div style="background:var(--bg-card); padding:10px 12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:10.5px; color:var(--text-2);">تاريخ الفاتورة</div>
            <div class="mono" style="font-weight:700; font-size:13px;">${n.date||t.date}</div>
          </div>
          <div style="background:var(--bg-card); padding:10px 12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:10.5px; color:var(--text-2);">نوع الدفع</div>
            <div style="font-weight:700; font-size:12px;">${n.paymentMethod==="cash"?"💵 نقدي":"📑 آجل (على الحساب)"}</div>
          </div>
          ${n.repName?`
            <div style="background:var(--bg-card); padding:10px 12px; border-radius:8px; border:1px solid var(--border-soft);">
              <div style="font-size:10.5px; color:var(--text-2);">المندوب المسؤول</div>
              <div style="font-weight:700; font-size:12px;">👤 ${n.repName}</div>
            </div>
          `:""}
        </div>

        <div class="table-container mb-16" style="border:1px solid var(--border-soft); border-radius:8px; max-height:280px; overflow-y:auto;">
          <table class="data-dense" style="margin:0; font-size:12px;">
            <thead>
              <tr style="background:var(--bg-2);">
                <th style="width:35px; text-align:center;">#</th>
                <th>الصنف</th>
                <th style="width:65px; text-align:center;">الكمية</th>
                <th style="width:85px; text-align:left;">السعر</th>
                ${b>0?'<th style="width:70px; text-align:left;">الخصم</th>':""}
                <th style="width:75px; text-align:left;">الضريبة</th>
                <th style="width:95px; text-align:left;">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${m.length?m.map((a,g)=>{const x=parseFloat(a.qty||a.quantity||0),T=parseFloat(a.unitPrice||a.price||0),z=parseFloat(a.discount||0),C=x*T-z,D=parseFloat(a.vat||a.vatAmount||C*.15),o=parseFloat(a.totalWithVat||a.total||C+D);return`
                  <tr>
                    <td class="dim" style="text-align:center;">${g+1}</td>
                    <td><b>${a.name||a.productName||"—"}</b> ${a.code?`<span class="dim mono" style="font-size:10.5px;">(${a.code})</span>`:""}</td>
                    <td class="mono" style="text-align:center; font-weight:700;">${x} ${a.unit?`<small class="dim">${a.unit}</small>`:""}</td>
                    <td class="mono" style="text-align:left;">${s(T)}</td>
                    ${b>0?`<td class="mono" style="text-align:left; color:var(--bad);">${z>0?s(z):"—"}</td>`:""}
                    <td class="mono" style="text-align:left; color:var(--text-2); font-size:11px;">${s(D)}</td>
                    <td class="mono font-bold" style="text-align:left; color:var(--text-0);">${s(o)}</td>
                  </tr>
                `}).join(""):'<tr><td colspan="7" style="text-align:center; padding:16px; color:var(--text-2);">لا توجد بنود تفصيلية</td></tr>'}
            </tbody>
          </table>
        </div>

        <div style="background:linear-gradient(135deg, var(--bg-card), rgba(99,102,241,0.04)); padding:12px 16px; border-radius:8px; border:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; gap:16px; flex-wrap:wrap;">
            <div>
              <div style="font-size:10.5px; color:var(--text-2);">قبل الضريبة</div>
              <div class="mono font-bold" style="font-size:13px;">${s(c||v-p)}</div>
            </div>
            <div>
              <div style="font-size:10.5px; color:var(--text-2);">ضريبة القيمة المضافة (15%)</div>
              <div class="mono font-bold" style="font-size:13px; color:var(--text-1);">${s(p)}</div>
            </div>
            ${b>0?`
              <div>
                <div style="font-size:10.5px; color:var(--text-2);">الخصم الممنوح</div>
                <div class="mono font-bold" style="font-size:13px; color:var(--bad);">${s(b)}</div>
              </div>
            `:""}
          </div>
          <div style="text-align:left;">
            <div style="font-size:11px; font-weight:700; color:var(--brand);">الإجمالي الصافي الشامل</div>
            <div class="mono" style="font-size:18px; font-weight:900; color:var(--brand);">${s(v)}</div>
          </div>
        </div>
      `,r&&(r.innerHTML=`
          <button class="btn btn-primary" onclick="window.printDocFromStatement(${i})" style="background:linear-gradient(135deg, #1e3a8a, #2563eb); border:none; display:flex; align-items:center; gap:6px; font-weight:700;">
            <i class="fas fa-print"></i> 🖨️ طباعة الفاتورة الضريبية الرسمية (A4)
          </button>
          <button class="btn btn-secondary" onclick="window.printInvoiceThermalFromStatement(${i})" style="display:flex; align-items:center; gap:6px;">
            <i class="fas fa-receipt"></i> 🧾 إيصال حراري (80mm)
          </button>
        `)}else if(t.type==="receipt"){const n=t.raw;l.innerHTML=`
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:12px; margin-bottom:16px;">
          <div style="background:var(--bg-card); padding:12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:11px; color:var(--text-2);">رقم سند القبض</div>
            <div class="mono font-bold" style="font-size:14px; color:var(--brand);">${n.number||n.code||n.receiptNumber||t.refNo}</div>
          </div>
          <div style="background:var(--bg-card); padding:12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:11px; color:var(--text-2);">تاريخ السند</div>
            <div class="mono font-bold" style="font-size:13px;">${n.date||t.date}</div>
          </div>
          <div style="background:var(--bg-card); padding:12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:11px; color:var(--text-2);">طريقة الاستلام</div>
            <div style="font-weight:800; font-size:13px; color:var(--good);">${n.method==="cash"?"💵 نقدي":"🏦 تحويل بنكي / شيك"}</div>
          </div>
        </div>

        <div style="background:linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02)); padding:16px 20px; border-radius:10px; border:1px solid rgba(16,185,129,0.25); margin-bottom:16px;">
          <div style="font-size:12px; color:var(--text-2); margin-bottom:4px;">المبلغ المقبوض:</div>
          <div class="mono" style="font-size:24px; font-weight:900; color:#059669;">${s(n.amount||t.credit||0)}</div>
        </div>

        <div style="background:var(--bg-card); padding:14px; border-radius:8px; border:1px solid var(--border-soft); line-height:1.8;">
          <div><span style="color:var(--text-2);">البيان / الملاحظات:</span> <b>${n.notes||n.note||"سداد دفعة حساب"}</b></div>
          ${n.repName?`<div><span style="color:var(--text-2);">المحصل / المندوب:</span> <b>${n.repName}</b></div>`:""}
          ${n.bankName?`<div><span style="color:var(--text-2);">الحساب المودع فيه:</span> <b>${n.bankName}</b></div>`:""}
        </div>
      `,r&&(r.innerHTML=`
          <button class="btn btn-primary" onclick="window.printDocFromStatement(${i})" style="background:#059669; border-color:#059669; display:flex; align-items:center; gap:6px; font-weight:700;">
            <i class="fas fa-print"></i> 🖨️ طباعة سند القبض
          </button>
        `)}else if(t.type==="return"){const n=t.raw,m=n.lines||n.items||[];l.innerHTML=`
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px; margin-bottom:16px;">
          <div style="background:var(--bg-card); padding:10px 12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:10.5px; color:var(--text-2);">رقم إشعار المردود</div>
            <div class="mono" style="font-weight:800; font-size:13px; color:var(--brand);">${n.number||n.creditNoteNumber||t.refNo}</div>
          </div>
          <div style="background:var(--bg-card); padding:10px 12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:10.5px; color:var(--text-2);">التاريخ</div>
            <div class="mono" style="font-weight:700; font-size:13px;">${n.date||t.date}</div>
          </div>
          <div style="background:var(--bg-card); padding:10px 12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:10.5px; color:var(--text-2);">قيمة المردود الإجمالية</div>
            <div class="mono font-bold" style="font-size:14px; color:var(--bad);">${s(n.totalWithVat||n.total||t.credit||0)}</div>
          </div>
        </div>

        <div class="table-container mb-16" style="border:1px solid var(--border-soft); border-radius:8px; max-height:250px; overflow-y:auto;">
          <table class="data-dense" style="margin:0; font-size:12px;">
            <thead>
              <tr style="background:var(--bg-2);">
                <th>الصنف المرتجع</th>
                <th style="width:70px; text-align:center;">الكمية</th>
                <th style="width:90px; text-align:left;">السعر</th>
                <th style="width:100px; text-align:left;">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${m.map(c=>`
                <tr>
                  <td><b>${c.productName||c.name||"—"}</b></td>
                  <td class="mono" style="text-align:center;">${c.qty||1}</td>
                  <td class="mono" style="text-align:left;">${s(c.unitPrice||c.price||0)}</td>
                  <td class="mono font-bold" style="text-align:left;">${s((c.qty||1)*(c.unitPrice||c.price||0))}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `,r&&(r.innerHTML=`
          <button class="btn btn-primary" onclick="window.printDocFromStatement(${i})" style="background:#dc2626; border-color:#dc2626; display:flex; align-items:center; gap:6px; font-weight:700;">
            <i class="fas fa-print"></i> 🖨️ طباعة إشعار المردود
          </button>
        `)}else if(t.type==="journal"){const n=t.raw,m=n.lines||[];l.innerHTML=`
        <div style="background:var(--bg-card); padding:14px; border-radius:8px; border:1px solid var(--border-soft); margin-bottom:14px; line-height:1.8;">
          <div><span style="color:var(--text-2);">رقم القيد:</span> <b class="mono">${n.entryNumber||n.code||t.refNo}</b></div>
          <div><span style="color:var(--text-2);">التاريخ:</span> <b class="mono">${n.date||t.date}</b></div>
          <div><span style="color:var(--text-2);">البيان:</span> <b>${n.description||t.notes||"—"}</b></div>
        </div>
        <div class="table-container" style="border:1px solid var(--border-soft); border-radius:8px;">
          <table class="data-dense" style="margin:0; font-size:12px;">
            <thead>
              <tr style="background:var(--bg-2);">
                <th>الحساب</th>
                <th style="width:100px; text-align:left;">مدين</th>
                <th style="width:100px; text-align:left;">دائن</th>
                <th>ملاحظة</th>
              </tr>
            </thead>
            <tbody>
              ${m.map(c=>`
                <tr>
                  <td><b>${c.accountName||c.accountCode||"—"}</b></td>
                  <td class="mono" style="text-align:left; color:#1d4ed8;">${c.debit>0?s(c.debit):"—"}</td>
                  <td class="mono" style="text-align:left; color:#059669;">${c.credit>0?s(c.credit):"—"}</td>
                  <td style="font-size:11px; color:var(--text-2);">${c.note||"—"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `,r&&(r.innerHTML=`
          <button class="btn btn-primary" onclick="window.printDocFromStatement(${i})" style="display:flex; align-items:center; gap:6px; font-weight:700;">
            <i class="fas fa-print"></i> 🖨️ طباعة سند القيد
          </button>
        `)}else if(t.type==="delivery_note"){let n=t.raw;const m=n.lines||n.items||[],c=parseFloat(n.totalAmount||n.grandTotal||n.total||0);l.innerHTML=`
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px; margin-bottom:16px;">
          <div style="background:var(--bg-card); padding:10px 12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:10.5px; color:var(--text-2);">رقم سند التسليم</div>
            <div class="mono" style="font-weight:800; font-size:13px; color:var(--brand);">${n.number||n.dnNumber||t.refNo}</div>
          </div>
          <div style="background:var(--bg-card); padding:10px 12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:10.5px; color:var(--text-2);">تاريخ التسليم</div>
            <div class="mono" style="font-weight:700; font-size:13px;">${n.date||t.date}</div>
          </div>
          <div style="background:var(--bg-card); padding:10px 12px; border-radius:8px; border:1px solid var(--border-soft);">
            <div style="font-size:10.5px; color:var(--text-2);">المستودع / السيارة</div>
            <div style="font-weight:700; font-size:12px;">🏢 ${n.warehouseName||"—"}</div>
          </div>
          ${n.repName?`
            <div style="background:var(--bg-card); padding:10px 12px; border-radius:8px; border:1px solid var(--border-soft);">
              <div style="font-size:10.5px; color:var(--text-2);">المندوب / السائق</div>
              <div style="font-weight:700; font-size:12px;">👤 ${n.repName}</div>
            </div>
          `:""}
        </div>

        <div class="table-container mb-16" style="border:1px solid var(--border-soft); border-radius:8px; max-height:280px; overflow-y:auto;">
          <table class="data-dense" style="margin:0; font-size:12px;">
            <thead>
              <tr style="background:var(--bg-2);">
                <th style="width:35px; text-align:center;">#</th>
                <th>الصنف المسلّم</th>
                <th style="width:75px; text-align:center;">الكمية</th>
                <th style="width:95px; text-align:left;">السعر</th>
                <th style="width:110px; text-align:left;">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${m.length?m.map((b,p)=>{const v=parseFloat(b.qty||b.quantity||0),a=parseFloat(b.unitPrice||b.price||0),g=parseFloat(b.lineTotal||v*a||0);return`
                  <tr>
                    <td style="text-align:center;" class="mono dim">${p+1}</td>
                    <td><b>${b.productName||b.name||"—"}</b></td>
                    <td style="text-align:center;" class="mono font-bold">${formatQuantity(v)} ${b.unit||"كرتون"}</td>
                    <td style="text-align:left;" class="mono">${s(a)}</td>
                    <td style="text-align:left;" class="mono font-bold">${s(g)}</td>
                  </tr>
                `}).join(""):'<tr><td colspan="5" style="text-align:center; padding:16px;">لا توجد بنود</td></tr>'}
            </tbody>
          </table>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-2); padding:12px 16px; border-radius:8px; margin-bottom:12px;">
          <span style="font-weight:700;">إجمالي سند التسليم:</span>
          <span class="mono" style="font-size:18px; font-weight:900; color:var(--brand);">${s(c)}</span>
        </div>
      `,r&&(r.innerHTML=`
          <button class="btn btn-primary" onclick="window.printDocFromStatement(${i})" style="display:flex; align-items:center; gap:6px; font-weight:700;">
            <i class="fas fa-print"></i> 🖨️ طباعة سند التسليم (A4)
          </button>
        `)}else l.innerHTML=`<pre style="background:var(--bg-2); padding:12px; border-radius:8px;">${JSON.stringify(t.raw,null,2)}</pre>`;openModal("stmt-detail-modal")},window.printDocFromStatement=async i=>{const t=_[i];if(!(!t||!t.raw))try{if(t.type==="invoice"){if(typeof window.printInvoice!="function")try{await N(()=>import("./sales-invoices.js_v_50-CLkyFk9f.js"),__vite__mapDeps([0,1,2,3,4,5,6]))}catch(e){console.error("Failed to load sales-invoices module:",e)}typeof window.printInvoice=="function"?window.printInvoice(t.raw):window.printInvoiceThermalFromStatement(i)}else if(t.type==="receipt"){if(typeof window.printSingleReceiptVoucher!="function")try{await N(()=>import("./receipts.js_v_44-BPPIluv1.js"),__vite__mapDeps([7,1,2,6]))}catch(e){console.error("Failed to load receipts module:",e)}typeof window.printSingleReceiptVoucher=="function"&&window.printSingleReceiptVoucher(t.raw.id||t.raw.receiptNumber)}else if(t.type==="return"){if(typeof window.printSalesReturn!="function")try{await N(()=>import("./sales-returns.js_v_39-ZkztOXvM.js"),__vite__mapDeps([8,1,2,4,5]))}catch(e){console.error("Failed to load sales-returns module:",e)}typeof window.printSalesReturn=="function"&&window.printSalesReturn(t.raw.id||t.raw.creditNoteNumber)}else if(t.type==="journal"){if(typeof window.printSingleJournalVoucher!="function")try{await N(()=>import("./journal-entries.js_v_44-DM_7fSoM.js"),__vite__mapDeps([9,1,2]))}catch(e){console.error("Failed to load journal-entries module:",e)}typeof window.printSingleJournalVoucher=="function"&&window.printSingleJournalVoucher(t.raw.id)}else if(t.type==="delivery_note"){if(typeof window.directPrintDNA4!="function")try{await N(()=>import("./delivery-notes.js_v_50-BpGyqBo2.js"),__vite__mapDeps([10,1,2,5]))}catch(e){console.error("Failed to load delivery-notes module:",e)}typeof window.directPrintDNA4=="function"&&window.directPrintDNA4(t.raw.id)}}catch(e){console.error("Error printing document from statement:",e),window.showToast?.("حدث خطأ أثناء محاولة طباعة المستند","error")}},window.printInvoiceThermalFromStatement=i=>{const t=_[i];if(!t||!t.raw)return;const e=t.raw,l=window.ERP_COMPANY||{name:"مؤسسة إدهام للمواد الغذائية",vatNumber:"312448150500003",phone:"0549141648"},r=e.lines||e.items||[],n=parseFloat(e.totalWithVat||e.total||0),m=parseFloat(e.totalVat||0),c=parseFloat(e.subtotal||n-m),b=window.open("","_blank","width=400,height=600");b.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة مبسطة حرارية — ${e.number||e.invoiceNumber||t.refNo}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { font-family: 'Cairo', monospace, sans-serif; width: 72mm; margin: 0 auto; padding: 10px 4px; font-size: 11px; color: #000; line-height: 1.4; }
          .text-center { text-align: center; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .bold { font-weight: bold; }
          .flex-between { display: flex; justify-content: space-between; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; margin: 6px 0; }
          th, td { padding: 4px 2px; text-align: right; }
          th { border-bottom: 1px solid #000; }
          .total-row { font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body onload="window.print();">
        <div class="text-center bold" style="font-size:14px;">${l.name}</div>
        <div class="text-center" style="font-size:10px;">الرقم الضريبي: ${l.vatNumber||"—"}</div>
        <div class="text-center" style="font-size:10px;">الهاتف: ${l.phone||"—"}</div>
        <div class="divider"></div>
        <div class="text-center bold">فاتورة ضريبية مبسطة</div>
        <div class="flex-between"><span>رقم الفاتورة:</span><span class="bold">${e.number||e.invoiceNumber||t.refNo}</span></div>
        <div class="flex-between"><span>التاريخ:</span><span>${e.date||t.date}</span></div>
        <div class="flex-between"><span>العميل:</span><span>${e.customerName||d?.name||"—"}</span></div>
        ${e.repName?`<div class="flex-between"><span>المندوب:</span><span>${e.repName}</span></div>`:""}
        <div class="divider"></div>
        <table>
          <thead>
            <tr>
              <th>الصنف</th>
              <th style="text-align:center;">الكمية</th>
              <th style="text-align:left;">السعر</th>
              <th style="text-align:left;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${r.map(p=>`
              <tr>
                <td>${p.name||p.productName}</td>
                <td style="text-align:center;">${p.qty||p.quantity}</td>
                <td style="text-align:left;">${s(p.unitPrice||p.price||0)}</td>
                <td style="text-align:left;">${s((p.qty||p.quantity||1)*(p.unitPrice||p.price||0))}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="divider"></div>
        <div class="flex-between"><span>المجموع قبل الضريبة:</span><span>${s(c)}</span></div>
        <div class="flex-between"><span>ضريبة القيمة المضافة (15%):</span><span>${s(m)}</span></div>
        <div class="divider"></div>
        <div class="flex-between total-row" style="font-size:13px;"><span>الإجمالي النهائي:</span><span>${s(n)}</span></div>
        <div class="divider"></div>
        <div class="text-center" style="font-size:10px; margin-top:8px;">شكراً لتعاملكم معنا!</div>
      </body>
      </html>
    `),b.document.close()},window.printCustomerStatement=()=>{d&&window.print()},window.exportCustomerStatementPDF=()=>{d&&window.print()},window.exportCustomerStatementExcel=()=>{if(!d||!_.length)return;const i=_.map(t=>({التاريخ:t.date,"نوع الحركة":t.typeLabel,"رقم المرجع":t.refNo,البيان:t.notes,مدين:t.debit||0,دائن:t.credit||0,الرصيد:t.runningBalance}));Q(i,`كشف_حساب_${d.name.replace(/\s+/g,"_")}`)},window.shareCustomerStatementWhatsApp=()=>{if(!d)return;const i=(d.phone||"").replace(/[^0-9]/g,""),t=i.startsWith("0")?"966"+i.slice(1):i.startsWith("966")?i:"966"+i,e=`مرحباً ${d.name}،
مرفق ملخص كشف الحساب الخاص بكم لدى ${window.ERP_COMPANY?.name||"مؤسسة إدهام للمواد الغذائية"}:

📅 الفترة: من ${h} إلى ${w}
💵 إجمالي المسحوبات (مدين): ${s(f.debit)}
💳 إجمالي المدفوعات (دائن): ${s(f.credit)}
💰 الرصيد الحالي المستحق: ${s(f.balance)}

شاكرين ومقدرين تعاملكم معنا!`,l=`https://api.whatsapp.com/send?phone=${t}&text=${encodeURIComponent(e)}`;window.open(l,"_blank")},window.openTrustReceiptForCurrentCustomer=async()=>{try{const{openTrustReceiptModal:i}=await N(async()=>{const{openTrustReceiptModal:e}=await import("./trust-receipts.js_v_2-C9I3kW4K.js");return{openTrustReceiptModal:e}},__vite__mapDeps([11,1,2])),t=typeof f<"u"&&f&&f.balance!==void 0&&!isNaN(f.balance)?f.balance:d?parseFloat(d.balance||0):0;i(d||null,{amount:t>0?t:0,notes:d?"حساب عميل: "+d.name:""})}catch(i){console.error("Failed to open trust receipt modal:",i),alert("تعذر فتح نموذج سند الأمانة: "+(i.message||i))}},window.openDebtAcknowledgmentForCurrentCustomer=async()=>{try{const{openDebtAcknowledgmentModal:i}=await N(async()=>{const{openDebtAcknowledgmentModal:e}=await import("./debt-acknowledgment.js_v_2-H-BqRKEN.js");return{openDebtAcknowledgmentModal:e}},__vite__mapDeps([12,1,2]));if(!d){i(null);return}const t=typeof f<"u"&&f&&f.balance!==void 0&&!isNaN(f.balance)?f.balance:parseFloat(d.balance||0);i(d,{amount:t,asOfDate:w||$()})}catch(i){console.error("Failed to open debt acknowledgment modal:",i),alert("تعذر فتح نموذج إقرار المديونية: "+(i.message||i))}},window.printBalanceConfirmation=()=>{if(!d)return;const i=window.open("","_blank"),t=window.ERP_COMPANY?.name||"شركة نظم الإمداد المتطورة";i.document.write(`
      <html dir="rtl">
      <head>
        <title>خطاب مصادقة رصيد — ${d.name}</title>
        <style>
          body { font-family:'Cairo',sans-serif; padding:40px; line-height:1.8; color:#1e293b; }
          .header { text-align:center; border-bottom:2px solid #334155; padding-bottom:20px; margin-bottom:30px; }
          .box { border:1px solid #cbd5e1; padding:20px; border-radius:8px; margin:20px 0; background:#f8fafc; }
          .signatures { display:flex; justify-content:space-between; margin-top:80px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${t}</h2>
          <h3>خطاب مصادقة رصيد (Balance Confirmation)</h3>
        </div>
        <p>التاريخ: <b>${$()}</b></p>
        <p>السادة / <b>${d.name}</b> المحترمين</p>
        <p>تحية طيبة وبعد،،،</p>
        <p>يرجى التكرم بمطابقة رصيد حسابكم المسجل بدفاترنا حتى تاريخ <b>${w}</b>، حيث يظهر الحساب بالرصيد التالي:</p>
        
        <div class="box">
          <p style="font-size:18px; text-align:center;">
            الرصيد المستحق: <b>${s(f.balance)}</b>
          </p>
        </div>

        <p>في حال وجود أي ملاحظات أو اختلاف في الرصيد، يرجى إفادتنا خلال أسبوع من تاريخه. شاكرين حسن تعاونكم.</p>

        <div class="signatures">
          <div><b>الختم والتوقيع (الشركة)</b><br><br>____________________</div>
          <div><b>المصادقة والاعتماد (العميل)</b><br><br>____________________</div>
        </div>
        <script>window.onload = () => window.print();<\/script>
      </body>
      </html>
    `),i.document.close()}}async function A(){if(!d)return;const i=document.getElementById("stmt-cust-name"),t=document.getElementById("stmt-cust-sub"),e=document.getElementById("stmt-kpi-strip");i&&(i.textContent=d.name),t&&(t.textContent=`كود: ${d.code||"—"} | الجوال: ${d.phone||"—"} | المندوب: ${d.repName||"—"} | المنطقة: ${d.zone||"—"}`);const l=(d.name||"").trim().toLowerCase(),r=await F(S.chartOfAccounts(),[L("sourceEntityId","==",d.id)]).catch(()=>[]),n=new Set,m=new Set;r.forEach(o=>{m.add(o.id),o.code&&n.add(o.code)});const[c,b,p,v,a]=await Promise.all([F(S.salesInvoices(),[L("customerId","==",d.id)]).catch(()=>[]),F(S.receipts(),[L("targetId","==",d.id)]).catch(()=>[]),F(S.salesReturns(),[L("customerId","==",d.id)]).catch(()=>[]),F(S.deliveryNotes(),[L("customerId","==",d.id)]).catch(()=>[]),F(S.journalEntries()).catch(()=>[])]),g=[];c.forEach(o=>{const y=parseFloat(o.totalWithVat||o.total||0);g.push({date:o.date||$(),type:"invoice",typeLabel:"🧾 فاتورة بيع",refNo:o.number||o.invoiceNumber||o.id,notes:o.notes||`فاتورة مبيعات (${(o.lines||[]).length} أصناف)`,debit:y,credit:0,raw:o})}),b.forEach(o=>{const y=parseFloat(o.amount||0);g.push({date:o.date||$(),type:"receipt",typeLabel:"💵 سند قبض",refNo:o.receiptNumber||o.number||o.code||o.id,notes:o.notes||`سداد دفعة حساب (${o.method==="cash"?"نقدي":"بنكي"})`,debit:0,credit:y,raw:o})}),p.forEach(o=>{const y=parseFloat(o.totalWithVat||o.total||0);g.push({date:o.date||$(),type:"return",typeLabel:"↩️ مردود مبيعات",refNo:o.number||o.creditNoteNumber||o.id,notes:o.notes||"إشعار دائن مردودات",debit:0,credit:y,raw:o})}),(v||[]).forEach(o=>{if(o.status==="cancelled"||o.status==="void")return;const y=o.status==="converted_to_invoice",u=parseFloat(o.totalAmount||o.grandTotal||o.total||0);g.push({date:o.date||$(),type:"delivery_note",typeLabel:"📦 سند تسليم بضاعة (DN)",refNo:o.number||o.dnNumber||o.id,notes:o.notes||(y?"سند تسليم بضاعة (تم إصدار فاتورة ضريبية له)":`سند تسليم بضاعة غير ضريبي (${(o.lines||[]).length} أصناف)`),debit:y?0:u,credit:0,raw:o})}),a.forEach((o,y)=>{if(o.status==="cancelled"||o.isReversed)return;const u=(o.sourceType||"").toLowerCase(),I=(o.refType||"").toLowerCase(),E=(o.description||"").toLowerCase();u==="salesinvoice"||u==="sales"||u==="receipt"||u==="salesreturn"||u==="sales_return"||u==="salescogs"||u==="cogs"||u==="salesreturncogs"||u==="salesinvoice_cogs"||u==="collection"||u==="expense"||u==="supplierpayment"||u==="deliverynote"||u==="delivery_note"||u==="deliverynote_cogs"||I.includes("sales")||I.includes("receipt")||I.includes("invoice")||I.includes("return")||I.includes("delivery")||E.includes("مبيعات")||E.includes("فاتورة")||E.includes("سند قبض")||E.includes("مرتجع")||E.includes("إشعار دائن")||E.includes("تصفية")||E.includes("سند تسليم")||(o.lines||[]).forEach((k,at)=>{const B=k.accountId,R=k.accountCode,V=(k.accountName||"").trim().toLowerCase();if(B&&m.has(B)||R&&n.has(R)||l&&V&&V===l){const H=parseFloat(k.debit||0),O=parseFloat(k.credit||0);if(H===0&&O===0)return;const W=(o.description||"").includes("افتتاحي")||(k.note||"").includes("افتتاحي")||o.sourceType==="opening";g.push({date:o.date||$(),type:"journal",typeLabel:W?"⚖️ قيد افتتاحى":"📝 قيد يومية",refNo:o.entryNumber||o.number||`JE-${y}`,notes:o.description||k.note||k.accountName||"قيد محاسبي مرحل",debit:H,credit:O,raw:o})}})}),g.sort((o,y)=>(o.date||"").localeCompare(y.date||"")),nt(c,b);let x=parseFloat(d.openingBalance||0);g.forEach(o=>{o.date<h&&(x+=o.debit-o.credit)});const T=g.filter(o=>o.date>=h&&o.date<=w);let z=x,C=0,D=0;_=[],(x!==0||T.length>0)&&_.push({date:h,type:"opening",typeLabel:"⚖️ رصيد افتتاحي",refNo:"—",notes:"رصيد سابق قبل الفترة المحددة",debit:x>0?x:0,credit:x<0?Math.abs(x):0,runningBalance:x}),T.forEach(o=>{z+=o.debit-o.credit,C+=o.debit,D+=o.credit,_.push({...o,runningBalance:z})}),f={opening:x,debit:C,credit:D,balance:z},e&&(e.innerHTML=`
      <div style="text-align:center; padding:6px 12px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:8px;">
        <div style="font-size:10px; color:var(--text-2);">الرصيد الافتتاحي</div>
        <div class="mono" style="font-size:13px; font-weight:800;">${s(x)}</div>
      </div>
      <div style="text-align:center; padding:6px 12px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:8px;">
        <div style="font-size:10px; color:var(--text-2);">المسحوبات (مدين)</div>
        <div class="mono" style="font-size:13px; font-weight:800; color:var(--bad);">+ ${s(C)}</div>
      </div>
      <div style="text-align:center; padding:6px 12px; background:var(--bg-card); border:1px solid var(--border-soft); border-radius:8px;">
        <div style="font-size:10px; color:var(--text-2);">المدفوعات (دائن)</div>
        <div class="mono" style="font-size:13px; font-weight:800; color:var(--good);">- ${s(D)}</div>
      </div>
      <div style="text-align:center; padding:6px 14px; background:linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05)); border:1.5px solid var(--brand); border-radius:8px;">
        <div style="font-size:10.5px; font-weight:700; color:var(--brand);">الرصيد النهائي المستحق</div>
        <div class="mono" style="font-size:15px; font-weight:900; color:${z>0?"var(--bad)":"var(--good)"};">${s(z)}</div>
      </div>
    `),j()}function nt(i,t){const e=new Date;let l=t.reduce((v,a)=>v+parseFloat(a.amount||0),0),r=0,n=0,m=0,c=0;[...i].sort((v,a)=>(v.date||"").localeCompare(a.date||"")).forEach(v=>{let a=parseFloat(v.totalWithVat||v.total||0);if(l>=a?(l-=a,a=0):(a-=l,l=0),a>0&&v.date){const g=new Date(v.date),x=Math.floor((e-g)/(1e3*60*60*24));x<=30?r+=a:x<=60?n+=a:x<=90?m+=a:c+=a}});const p=(v,a)=>{const g=document.getElementById(v);g&&(g.textContent=s(a))};p("aging-current",r),p("aging-30",n),p("aging-60",m),p("aging-90",c)}function j(){const i=document.getElementById("stmt-tbody");if(!i)return;let t=_;if(M!=="all"&&(t=_.filter(e=>e.type==="opening"||e.type===M)),!t.length){i.innerHTML='<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--text-2);">لا توجد حركات مالية مسجلة للعميل خلال هذه الفترة</td></tr>';return}i.innerHTML=t.map((e,l)=>`
    <tr style="${e.type==="opening"?"background:rgba(99,102,241,0.04); font-weight:700;":""}">
      <td class="mono font-semibold">${e.date}</td>
      <td><span class="badge neutral" style="font-size:11px;">${e.typeLabel}</span></td>
      <td class="mono" style="color:var(--brand); font-weight:700; ${e.type!=="opening"?"cursor:pointer;":""}" ${e.type!=="opening"?`onclick="window.previewDocDetail(${l})" title="انقر لعرض وطباعة التفاصيل"`:""}>
        ${e.type!=="opening"?`<span style="text-decoration:underline; text-underline-offset:3px;">${e.refNo}</span>`:e.refNo}
      </td>
      <td style="font-size:12px; color:var(--text-1);">${e.notes}</td>
      <td class="mono" style="text-align:left; color:${e.debit>0?"var(--bad)":"var(--text-dim)"}; font-weight:${e.debit>0?"700":"normal"};">
        ${e.debit>0?s(e.debit):"—"}
      </td>
      <td class="mono" style="text-align:left; color:${e.credit>0?"var(--good)":"var(--text-dim)"}; font-weight:${e.credit>0?"700":"normal"};">
        ${e.credit>0?s(e.credit):"—"}
      </td>
      <td class="mono font-bold" style="text-align:left; font-size:13px; color:${e.runningBalance>0?"var(--bad)":"var(--good)"};">
        ${s(e.runningBalance)}
      </td>
      <td style="text-align:center; white-space:nowrap;" class="no-print">
        ${e.type!=="opening"?`
          <div style="display:inline-flex; gap:4px; align-items:center; justify-content:center;">
            <button class="btn btn-icon sm btn-ghost" onclick="window.previewDocDetail(${l})" title="استعراض تفاصيل المستند">
              👁️
            </button>
            <button class="btn btn-icon sm btn-ghost" onclick="window.printDocFromStatement(${l})" title="طباعة فورية" style="color:var(--brand);">
              🖨️
            </button>
          </div>
        `:""}
      </td>
    </tr>
  `).join("")}export{vt as render};
