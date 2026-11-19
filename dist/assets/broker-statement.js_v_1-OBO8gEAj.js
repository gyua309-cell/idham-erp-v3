const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css"])))=>i.map(i=>d[i]);
import{t as P,_ as E,f as r,e as A,g as $,C as M}from"./index-CF9GFeRJ.js";import{e as D}from"./excel-DM5XZHtQ.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";const g=(...o)=>window.showToast?window.showToast(...o):console.log(...o);let F=[],_=[],n={totalSalesTaxable:0,totalCommissionCalculated:0,totalCommissionEarned:0,totalCommissionPending:0,totalCommissionPaidOut:0,currentNetPayable:0};async function W(o){o.innerHTML=`
    <div style="padding: 16px 20px; max-width: 1400px; margin: 0 auto;">
      
      <!-- Top Title & Action Bar -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; margin-bottom: 18px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #004d80 0%, #0284c7 100%); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);">
              💼
            </div>
            <div>
              <h2 style="margin: 0; font-size: 20px; font-weight: 900; color: var(--text-0, #0f172a);">كشف حساب ومستحقات الوسيط — زياد</h2>
              <div style="font-size: 12.5px; color: var(--text-2, #64748b); font-weight: 600; margin-top: 2px;">
                متابعة مبيعات العملاء المرتبطين، حساب نسبة (1%) قبل الضريبة، توليد القيود التلقائية، وإدارة صرف المستحقات
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Action Buttons -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="window.openPayBrokerCommissionModal()" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 800; background: #059669; border-color: #059669;">
            <span>💳</span>
            <span>صرف عمولة للوسيط (سند صرف)</span>
          </button>
          <button class="btn btn-secondary" onclick="window.exportBrokerStatementExcel()" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
            <span>📥</span>
            <span>تصدير إكسيل</span>
          </button>
          <button class="btn btn-secondary" onclick="window.printBrokerStatementA4()" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
            <span>🖨️</span>
            <span>طباعة كشف الحساب A4</span>
          </button>
          <button class="btn btn-ghost" onclick="window.reloadBrokerStatementData()" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
            <span>🔄</span>
            <span>تحديث</span>
          </button>
        </div>
      </div>

      <!-- Broker Profile & Integration Info Banner -->
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%); border: 1.5px solid #bae6fd; border-radius: 14px; padding: 14px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #004d80; color: #fff; font-size: 22px; display: flex; align-items: center; justify-content: center; font-weight: 900;">
            ز
          </div>
          <div>
            <div style="font-size: 15px; font-weight: 900; color: #004d80; display: flex; align-items: center; gap: 8px;">
              <span>الوسيط التجاري: زياد</span>
              <span style="font-size: 11px; background: #0284c7; color: #fff; padding: 2px 10px; border-radius: 20px; font-weight: 800;">نسبة العمولة: 1.0%</span>
            </div>
            <div style="font-size: 12px; color: #334155; margin-top: 3px; font-weight: 600;">
              العميل المرتبط حالياً: <strong style="color: #0f172a;">مؤسسة عماد ابراهيم الفت حلواني لتقديم الوجبات</strong> &nbsp;|&nbsp; بداية سريان الاتفاق: <strong style="color: #0284c7;">من الفاتورة الأخيرة INV-042070 وما بعدها</strong> &nbsp;|&nbsp; شرط الاستحقاق: <strong style="color: #059669;">فور إصدار فاتورة المبيعات (استحقاق فوري ومباشر)</strong>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 16px; font-size: 11.5px; font-weight: 700; color: #475569;">
          <div style="background: #fff; padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1;">
            حساب الالتزام بالشجرة: <strong style="color: #004d80; font-family: monospace;">2-1-4-2 (مستحقات عمولات الوسطاء - زياد)</strong>
          </div>
          <div style="background: #fff; padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1;">
            حساب المصروف بالشجرة: <strong style="color: #004d80; font-family: monospace;">5-4-10 (مصروفات عمولات وسيط)</strong>
          </div>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div id="broker-kpis-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; margin-bottom: 20px;">
        <div class="card" style="padding: 14px 16px; border-radius: 12px; border-right: 4px solid #0284c7;">
          <div style="font-size: 11.5px; font-weight: 700; color: var(--text-2);">إجمالي المبيعات قبل الضريبة</div>
          <div id="kpi-broker-sales" style="font-size: 20px; font-weight: 900; color: #004d80; margin-top: 4px; font-family: monospace;">—</div>
          <div style="font-size: 10.5px; color: var(--text-dim); margin-top: 2px;">الأساس الخاضع للعمولة (1%)</div>
        </div>

        <div class="card" style="padding: 14px 16px; border-radius: 12px; border-right: 4px solid #f59e0b;">
          <div style="font-size: 11.5px; font-weight: 700; color: var(--text-2);">إجمالي العمولات المحسوبة</div>
          <div id="kpi-broker-total-comm" style="font-size: 20px; font-weight: 900; color: #d97706; margin-top: 4px; font-family: monospace;">—</div>
          <div style="font-size: 10.5px; color: var(--text-dim); margin-top: 2px;">شاملة المسددة والمعلقة</div>
        </div>

        <div class="card" style="padding: 14px 16px; border-radius: 12px; border-right: 4px solid #10b981;">
          <div style="font-size: 11.5px; font-weight: 700; color: var(--text-2);">العمولات المكتسبة (المسددة)</div>
          <div id="kpi-broker-earned" style="font-size: 20px; font-weight: 900; color: #059669; margin-top: 4px; font-family: monospace;">—</div>
          <div style="font-size: 10.5px; color: #059669; margin-top: 2px; font-weight: 700;">تم تحصيل فواتيرها وقيدت محاسبياً</div>
        </div>

        <div class="card" style="padding: 14px 16px; border-radius: 12px; border-right: 4px solid #6366f1;">
          <div style="font-size: 11.5px; font-weight: 700; color: var(--text-2);">العمولات المعلقة (بانتظار السداد)</div>
          <div id="kpi-broker-pending" style="font-size: 20px; font-weight: 900; color: #4f46e5; margin-top: 4px; font-family: monospace;">—</div>
          <div style="font-size: 10.5px; color: var(--text-dim); margin-top: 2px;">تتحول لمكتسبة فور سداد العميل</div>
        </div>

        <div class="card" style="padding: 14px 16px; border-radius: 12px; border-right: 4px solid #ec4899;">
          <div style="font-size: 11.5px; font-weight: 700; color: var(--text-2);">العمولات المصروفة لزياد</div>
          <div id="kpi-broker-paidout" style="font-size: 20px; font-weight: 900; color: #db2777; margin-top: 4px; font-family: monospace;">—</div>
          <div style="font-size: 10.5px; color: var(--text-dim); margin-top: 2px;">بموجب سندات صرف معتمدة</div>
        </div>

        <div class="card" style="padding: 14px 16px; border-radius: 12px; background: linear-gradient(135deg, #004d80 0%, #0369a1 100%); color: #fff; border-right: 4px solid #38bdf8;">
          <div style="font-size: 11.5px; font-weight: 800; color: #bae6fd;">صافي الرصيد المستحق لزياد الآن</div>
          <div id="kpi-broker-net-due" style="font-size: 22px; font-weight: 900; color: #facc15; margin-top: 4px; font-family: monospace;">—</div>
          <div style="font-size: 10.5px; color: #e0f2fe; margin-top: 2px;">المكتسب المتاح للصرف الفوري</div>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="card" style="padding: 12px 16px; border-radius: 12px; margin-bottom: 16px;">
        <div style="display: flex; gap: 14px; flex-wrap: wrap; align-items: flex-end;">
          <div style="flex: 1; min-width: 220px;">
            <label style="font-size: 11.5px; font-weight: 800; color: var(--text-1); display: block; margin-bottom: 4px;">بحث في الفواتير أو العميل</label>
            <input type="text" id="broker-search-input" class="input" placeholder="رقم الفاتورة، اسم العميل..." oninput="window.applyBrokerStatementFilters()" />
          </div>

          <div style="width: 170px;">
            <label style="font-size: 11.5px; font-weight: 800; color: var(--text-1); display: block; margin-bottom: 4px;">حالة العمولة</label>
            <select id="broker-status-filter" class="input" onchange="window.applyBrokerStatementFilters()">
              <option value="all">كافة الحالات</option>
              <option value="earned">مكتسبة وجاهزة للصرف ✅</option>
              <option value="pending">معلقة لحين سداد العميل ⏳</option>
            </select>
          </div>

          <div style="width: 160px;">
            <label style="font-size: 11.5px; font-weight: 800; color: var(--text-1); display: block; margin-bottom: 4px;">من تاريخ</label>
            <input type="date" id="broker-date-from" class="input mono" onchange="window.applyBrokerStatementFilters()" />
          </div>

          <div style="width: 160px;">
            <label style="font-size: 11.5px; font-weight: 800; color: var(--text-1); display: block; margin-bottom: 4px;">إلى تاريخ</label>
            <input type="date" id="broker-date-to" class="input mono" value="${P()}" onchange="window.applyBrokerStatementFilters()" />
          </div>

          <div>
            <button class="btn btn-secondary" onclick="window.resetBrokerFilters()" style="font-weight: 700;">إعادة ضبط</button>
          </div>
        </div>
      </div>

      <!-- Invoices and Commission Table -->
      <div class="card" style="padding: 0; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color);">
        <div style="padding: 12px 18px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-1);">
          <div style="font-size: 13.5px; font-weight: 900; color: var(--text-0);">
            سجل الفواتير الخاضعة للعمولة وحالة استحقاقها (<span id="broker-records-count">0</span> فاتورة)
          </div>
          <div style="font-size: 11.5px; color: var(--text-2);">
            * تتولد القيود اليومية أوتوماتيكياً فور تسجيل سداد العميل للفاتورة
          </div>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 12.5px;">
            <thead>
              <tr style="background: var(--bg-2); border-bottom: 1.5px solid var(--border-color); color: var(--text-1); font-weight: 800;">
                <th style="padding: 10px 14px;">رقم الفاتورة</th>
                <th style="padding: 10px 14px;">التاريخ</th>
                <th style="padding: 10px 14px;">العميل</th>
                <th style="padding: 10px 14px; text-align: left;">المبلغ قبل الضريبة</th>
                <th style="padding: 10px 14px; text-align: center;">نسبة العمولة</th>
                <th style="padding: 10px 14px; text-align: left;">قيمة العمولة (1%)</th>
                <th style="padding: 10px 14px; text-align: center;">سداد العميل</th>
                <th style="padding: 10px 14px; text-align: center;">حالة استحقاق العمولة</th>
                <th style="padding: 10px 14px;">القيد المحاسبي</th>
                <th style="padding: 10px 14px; text-align: center;">الإجراءات</th>
              </tr>
            </thead>
            <tbody id="broker-table-tbody">
              <tr>
                <td colspan="10" style="text-align: center; padding: 32px; color: var(--text-dim);">
                  <i class="fas fa-spinner fa-spin" style="font-size: 20px; color: #0284c7;"></i>
                  <div style="margin-top: 8px; font-weight: 700;">جاري تحميل كشف حساب الوسيط زياد...</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Payout Modal Container -->
    <div id="broker-payout-modal-container"></div>
  `,await S()}async function S(){try{const{collection:o,getDocs:t,query:d,where:a}=await E(async()=>{const{collection:i,getDocs:e,query:x,where:f}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{collection:i,getDocs:e,query:x,where:f}},[]),{db:p,COMPANY_ID:c}=await E(async()=>{const{db:i,COMPANY_ID:e}=await import("./index-CF9GFeRJ.js").then(x=>x.S);return{db:i,COMPANY_ID:e}},__vite__mapDeps([0,1])),u=o(p,`companies/${c}/salesInvoices`),y=await t(u),l=[];y.forEach(i=>{const e=i.data();if(e.status==="cancelled"||e.status==="draft"||(e.date||"")<"2026-10-19"||e.number==="INV-042056"||e.invoiceNumber==="INV-042056")return;if(e.hasBrokerCommission&&(e.brokerName||"").includes("زياد")||(e.brokerName||"").includes("زياد")&&parseFloat(e.brokerCommissionTotal||0)>0||e.hasBrokerCommission&&parseFloat(e.brokerCommissionTotal||0)>0){const f=parseFloat(e.subtotal||e.taxableAmount||0),T=parseFloat(e.brokerRate)||1,C=parseFloat(e.brokerCommissionTotal)||(e.hasBrokerCommission?Math.round(f*(T/100)*100)/100:0);if(C<=0)return;const B=parseFloat(e.totalWithVat||e.total||0),z=parseFloat(e.paidAmount||0),v=B>0&&z>=B-.05||e.payment==="cash"||e.paymentMethod==="cash",k=!v&&z>0,w=e.brokerTrigger==="on_invoice"||!e.brokerTrigger;let I=e.brokerCommissionStatus||(w||v?"earned":"pending_payment"),m=parseFloat(e.brokerCommissionEarned||0);(w||v||I==="earned")&&m<=0?m=C:k&&m<=0&&!w&&(m=Math.round(C*(z/B)*100)/100),l.push({id:i.id,number:e.number||e.invoiceNumber||i.id.slice(0,8),date:e.date||"2026-10-19",customerId:e.customerId,customerName:e.customerName||"مؤسسة عماد ابراهيم الفت حلواني لتقديم الوجبات",subtotal:f,totalWithVat:B,paidAmount:z,brokerRate:T,brokerCommissionTotal:C,brokerCommissionEarned:m,isPaidFull:v,isPaidPartial:k,status:I,journalEntryId:e.brokerJournalEntryId||e.journalEntryId||null})}}),l.sort((i,e)=>(e.date||"").localeCompare(i.date||"")),F=l;let b=0;try{const i=o(p,`companies/${c}/expenses`);(await t(i)).forEach(x=>{const f=x.data();((f.notes||"").includes("زياد")||(f.beneficiary||"").includes("زياد")||f.accountCode==="2-1-4-2")&&(b+=parseFloat(f.amount||0))})}catch{}n.totalCommissionPaidOut=b,window.applyBrokerStatementFilters()}catch(o){console.error("loadBrokerStatementData error:",o),g("خطأ في تحميل كشف حساب الوسيط: "+o.message,"error")}}window.applyBrokerStatementFilters=()=>{const o=(document.getElementById("broker-search-input")?.value||"").toLowerCase().trim(),t=document.getElementById("broker-status-filter")?.value||"all",d=document.getElementById("broker-date-from")?.value||"",a=document.getElementById("broker-date-to")?.value||"";_=F.filter(i=>{if(o){const e=i.number.toLowerCase().includes(o),x=(i.customerName||"").toLowerCase().includes(o);if(!e&&!x)return!1}return!(t==="earned"&&!i.isPaidFull&&i.brokerCommissionEarned<=0||t==="pending"&&i.isPaidFull||d&&i.date<d||a&&i.date>a)});let p=0,c=0,u=0,y=0;F.forEach(i=>{p+=i.subtotal,c+=i.brokerCommissionTotal,u+=i.brokerCommissionEarned,i.isPaidFull||(y+=i.brokerCommissionTotal-i.brokerCommissionEarned)}),n.totalSalesTaxable=Math.round(p*100)/100,n.totalCommissionCalculated=Math.round(c*100)/100,n.totalCommissionEarned=Math.round(u*100)/100,n.totalCommissionPending=Math.round(y*100)/100,n.currentNetPayable=Math.max(0,Math.round((u-n.totalCommissionPaidOut)*100)/100);const l=(i,e)=>{const x=document.getElementById(i);x&&(x.textContent=e)};l("kpi-broker-sales",r(n.totalSalesTaxable)),l("kpi-broker-total-comm",r(n.totalCommissionCalculated)),l("kpi-broker-earned",r(n.totalCommissionEarned)),l("kpi-broker-pending",r(n.totalCommissionPending)),l("kpi-broker-paidout",r(n.totalCommissionPaidOut)),l("kpi-broker-net-due",r(n.currentNetPayable));const b=document.getElementById("broker-records-count");b&&(b.textContent=_.length),O()};function O(){const o=document.getElementById("broker-table-tbody");if(o){if(_.length===0){o.innerHTML=`
      <tr>
        <td colspan="10" style="text-align: center; padding: 28px; color: var(--text-dim); font-weight: 700;">
          لا توجد فواتير مطابقة لخيارات الفلترة المحددة
        </td>
      </tr>
    `;return}o.innerHTML=_.map((t,d)=>{let a="";t.isPaidFull?a='<span class="badge good" style="font-weight: 800; font-size: 11px;">تم السداد بالكامل ✅</span>':t.isPaidPartial?a=`<span class="badge warn" style="font-weight: 800; font-size: 11px;">سداد جزئي (${r(t.paidAmount)})</span>`:a='<span class="badge" style="background:#fef3c7; color:#92400e; font-weight:800; font-size:11px;">آجل معلق (غير مسدد)</span>';let p="";return t.status==="earned"||t.isPaidFull||t.brokerCommissionEarned>=t.brokerCommissionTotal-.05?p=`<span style="background: #dcfce7; color: #15803d; padding: 3px 10px; border-radius: 20px; font-weight: 800; font-size: 11.5px; display: inline-flex; align-items: center; gap: 4px;">
        <span>✅</span> <span>مستحقة ومكتسبة وجاهزة للصرف</span>
      </span>`:p=`<span style="background: #ede9fe; color: #5b21b6; padding: 3px 10px; border-radius: 20px; font-weight: 800; font-size: 11.5px; display: inline-flex; align-items: center; gap: 4px;">
        <span>⏳</span> <span>معلقة لحين سداد العميل</span>
      </span>`,`
      <tr style="border-bottom: 1px solid var(--border-color); ${d%2===1?"background: rgba(0,0,0,0.015);":""}">
        <td style="padding: 10px 14px; font-weight: 900; font-family: monospace; color: #0284c7;">
          <a href="javascript:void(0)" onclick="window.viewBrokerLinkedInvoice('${t.id}')" style="text-decoration: underline; color: inherit;">
            ${t.number}
          </a>
        </td>
        <td style="padding: 10px 14px; font-family: monospace; color: var(--text-1); font-weight: 700;">
          ${A(t.date)}
        </td>
        <td style="padding: 10px 14px; font-weight: 800; color: var(--text-0);">
          ${t.customerName}
        </td>
        <td style="padding: 10px 14px; text-align: left; font-family: monospace; font-weight: 800; color: #004d80;">
          ${r(t.subtotal)}
        </td>
        <td style="padding: 10px 14px; text-align: center;">
          <span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 12px; font-weight: 900; font-size: 11px;">
            ${t.brokerRate}%
          </span>
        </td>
        <td style="padding: 10px 14px; text-align: left; font-family: monospace; font-weight: 900; color: #d97706; font-size: 13.5px;">
          ${r(t.brokerCommissionTotal)}
        </td>
        <td style="padding: 10px 14px; text-align: center;">
          ${a}
        </td>
        <td style="padding: 10px 14px; text-align: center;">
          ${p}
        </td>
        <td style="padding: 10px 14px; font-size: 11px;">
          ${t.journalEntryId?`
            <span style="font-family: monospace; color: #059669; font-weight: 800;">قيد آلي معتمد</span>
          `:`
            <span style="color: var(--text-dim);">يتولد عند السداد</span>
          `}
        </td>
        <td style="padding: 10px 14px; text-align: center; white-space: nowrap;">
          <button class="btn btn-icon btn-ghost sm" onclick="window.viewBrokerLinkedInvoice('${t.id}')" title="معاينة الفاتورة">
            👁️
          </button>
        </td>
      </tr>
    `}).join("")}}window.resetBrokerFilters=()=>{const o=document.getElementById("broker-search-input");o&&(o.value="");const t=document.getElementById("broker-status-filter");t&&(t.value="all");const d=document.getElementById("broker-date-from");d&&(d.value="");const a=document.getElementById("broker-date-to");a&&(a.value=P()),window.applyBrokerStatementFilters()};window.reloadBrokerStatementData=async()=>{g("جاري تحديث كشف الحساب من السيرفر...","info"),await S(),g("تم تحديث البيانات بنجاح","success")};window.viewBrokerLinkedInvoice=o=>{typeof window.viewInvoice=="function"?window.viewInvoice(o):g("رقم الفاتورة: "+o,"info")};window.openPayBrokerCommissionModal=async()=>{const o=document.getElementById("broker-payout-modal-container");if(!o)return;const t=n.currentNetPayable||0;let d=[];try{(await $(M.cashBoxes())).forEach(c=>d.push({id:c.id,name:`خزينة: ${c.name}`,type:"cash",balance:c.balance||0})),(await $("bankAccounts")).forEach(c=>d.push({id:c.id,name:`بنك: ${c.bankName||c.name}`,type:"bank",balance:c.balance||0}))}catch{}o.innerHTML=`
    <div class="modal-overlay active" id="broker-payout-modal" style="z-index: 10000;">
      <div class="modal" style="max-width: 500px; border-radius: 16px;">
        <div class="modal-header" style="background: #004d80; color: #fff; border-radius: 16px 16px 0 0;">
          <div style="font-weight: 900; font-size: 15px; display: flex; align-items: center; gap: 8px;">
            <span>💳</span>
            <span>تسجيل صرف عمولة للوسيط — زياد</span>
          </div>
          <button class="btn btn-icon btn-ghost" onclick="window.closeBrokerPayoutModal()" style="color:#fff;">✕</button>
        </div>

        <div class="modal-body" style="padding: 18px 22px;">
          <div style="background: #ecfdf5; border: 1.2px solid #a7f3d0; border-radius: 10px; padding: 10px 14px; margin-bottom: 14px;">
            <div style="font-size: 11.5px; color: #065f46; font-weight: 700;">الرصيد المكتسب المتاح للصرف حالياً:</div>
            <div style="font-size: 20px; font-weight: 900; color: #047857; font-family: monospace;">${r(t)}</div>
            <div style="font-size: 10.5px; color: #065f46; margin-top: 2px;">(الحساب المدين: 2-1-4-2 مستحقات عمولات الوسطاء - زياد)</div>
          </div>

          <div class="form-group mb-14">
            <label style="font-size: 12px; font-weight: 800;">المبلغ المراد صرفه (ريال سعودي) *</label>
            <input type="number" id="payout-amount" class="input mono font-bold" style="font-size: 17px; color: #004d80;" value="${t>0?t:""}" step="0.01" min="1" placeholder="أدخل المبلغ" />
          </div>

          <div class="form-group mb-14">
            <label style="font-size: 12px; font-weight: 800;">طريقة ومصدر الصرف (الخزينة / البنك) *</label>
            <select id="payout-source-id" class="input">
              ${d.map(a=>`
                <option value="${a.id}" data-type="${a.type}">${a.name} (الرصيد: ${r(a.balance)})</option>
              `).join("")}
            </select>
          </div>

          <div class="form-group mb-14">
            <label style="font-size: 12px; font-weight: 800;">تاريخ الصرف *</label>
            <input type="date" id="payout-date" class="input mono" value="${P()}" />
          </div>

          <div class="form-group mb-14">
            <label style="font-size: 12px; font-weight: 800;">البيان والملاحظات</label>
            <input type="text" id="payout-notes" class="input" value="صرف عمولة مبيعات للوسيط زياد عن فواتير العملاء المحصلة" />
          </div>
        </div>

        <div class="modal-footer" style="padding: 12px 20px;">
          <button class="btn btn-secondary" onclick="window.closeBrokerPayoutModal()">إلغاء</button>
          <button class="btn btn-primary" id="save-broker-payout-btn" onclick="window.executeBrokerPayout()" style="background:#059669; border-color:#059669; font-weight:800;">
            💾 اعتماد وسداد الصرف
          </button>
        </div>
      </div>
    </div>
  `};window.closeBrokerPayoutModal=()=>{const o=document.getElementById("broker-payout-modal");o&&o.remove()};window.executeBrokerPayout=async()=>{const o=document.getElementById("payout-amount"),t=parseFloat(o?.value)||0;if(t<=0){g("يرجى إدخال مبلغ صحيح للصرف","warning");return}const d=document.getElementById("payout-source-id"),a=d?.value,p=d?.selectedOptions[0]?.getAttribute("data-type")||"cash",c=d?.selectedOptions[0]?.textContent||"الخزينة",u=document.getElementById("payout-date")?.value||P(),y=document.getElementById("payout-notes")?.value.trim()||"صرف عمولة الوسيط زياد",l=document.getElementById("save-broker-payout-btn");l&&(l.disabled=!0,l.textContent="جاري الحفظ والترحيل...");try{const{addDoc:b,collection:i,serverTimestamp:e}=await E(async()=>{const{addDoc:m,collection:s,serverTimestamp:h}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{addDoc:m,collection:s,serverTimestamp:h}},[]),{db:x,COMPANY_ID:f}=await E(async()=>{const{db:m,COMPANY_ID:s}=await import("./index-CF9GFeRJ.js").then(h=>h.S);return{db:m,COMPANY_ID:s}},__vite__mapDeps([0,1])),{autoCashTransaction:T,autoBankTransaction:C,createJournalEntry:B}=await E(async()=>{const{autoCashTransaction:m,autoBankTransaction:s,createJournalEntry:h}=await import("./index-CF9GFeRJ.js").then(N=>N.T);return{autoCashTransaction:m,autoBankTransaction:s,createJournalEntry:h}},__vite__mapDeps([0,1])),z={date:u,amount:t,beneficiary:"زياد (وسيط مبيعات)",category:"عمولات وساطة تجارية",accountCode:"2-1-4-2",accountName:"مستحقات عمولات الوسطاء - زياد",paymentMethod:p,sourceId:a,sourceName:c,notes:y,createdAt:e(),updatedAt:e()},v=await b(i(x,`companies/${f}/expenses`),z);p==="cash"?await T({type:"out",amount:t,notes:`صرف عمولة وسيط — ${y}`,sourceType:"expense",sourceId:v.id,cashBoxId:a,date:u}):await C({type:"out",amount:t,notes:`صرف عمولة وسيط — ${y}`,sourceType:"expense",sourceId:v.id,date:u});let k="1-1-1-1",w="الصندوق الرئيسي";if(p==="cash")try{const s=(await $("cashBoxes")||[]).find(h=>h.id===a);s&&s.accountCode&&(k=s.accountCode),s&&s.name&&(w=s.name)}catch{}else try{const s=(await $("bankAccounts")||[]).find(h=>h.id===a);s&&s.accountCode?k=s.accountCode:k="1-1-1-3-02",s&&(s.name||s.bankName)&&(w=s.name||s.bankName)}catch{}const I=[{accountCode:"2-1-4-2",accountName:"مستحقات عمولات الوسطاء - زياد",debit:t,credit:0,note:`سداد وتخفيض مستحقات عمولة الوسيط زياد — ${y}`},{accountCode:k,accountName:w,debit:0,credit:t,note:`صرف نقدي/بنكي للوسيط زياد بموجب سند رقم ${v.id.slice(0,8)}`}];await B({date:u,sourceType:"broker_payout",sourceId:v.id,description:`قيد سداد وتخفيض مستحقات عمولة الوسيط زياد بمبلغ ${r(t)} من ${w}`,lines:I}),window.closeBrokerPayoutModal(),g(`✅ تم صرف ${r(t)} للوسيط زياد وتوليد القيد المحاسبي بنجاح`,"success"),await S()}catch(b){console.error("Payout error:",b),g("خطأ في تسجيل الصرف: "+b.message,"error"),l&&(l.disabled=!1,l.textContent="💾 اعتماد وسداد الصرف")}};window.exportBrokerStatementExcel=()=>{if(_.length===0){g("لا توجد بيانات للتصدير","warning");return}_.map(t=>[t.number,t.date,t.customerName,t.subtotal,`${t.brokerRate}%`,t.brokerCommissionTotal,t.isPaidFull?"مسددة بالكامل":t.isPaidPartial?"سداد جزئي":"آجل غير مسدد",t.isPaidFull?"مكتسبة وجاهزة للصرف":"معلقة لحين سداد العميل"]).push(["الإجمالي","","",n.totalSalesTaxable,"1%",n.totalCommissionCalculated,`المكتسب: ${n.totalCommissionEarned}`,`الصافي المستحق: ${n.currentNetPayable}`]),D("كشف_حساب_عمولات_الوسيط_زياد"),g("تم تصدير كشف الحساب إلى Excel بنجاح","success")};window.printBrokerStatementA4=()=>{const o=window.open("","_blank");if(!o){g("يرجى السماح بالنوافذ المنبثقة للطباعة","error");return}const t=_.map((a,p)=>`
    <tr>
      <td style="text-align:center; padding:6px;">${p+1}</td>
      <td style="font-weight:bold; font-family:monospace; padding:6px;">${a.number}</td>
      <td style="text-align:center; font-family:monospace; padding:6px;">${a.date}</td>
      <td style="padding:6px;">${a.customerName}</td>
      <td style="text-align:left; font-family:monospace; font-weight:bold; padding:6px;">${r(a.subtotal)}</td>
      <td style="text-align:center; padding:6px;">${a.brokerRate}%</td>
      <td style="text-align:left; font-family:monospace; font-weight:bold; color:#b45309; padding:6px;">${r(a.brokerCommissionTotal)}</td>
      <td style="text-align:center; font-size:11px; padding:6px;">${a.isPaidFull?"مسددة بالكامل":"آجل معلق"}</td>
      <td style="text-align:center; font-size:11px; font-weight:bold; padding:6px;">${a.isPaidFull?"مكتسبة وجاهزة للصرف":"معلقة لحين السداد"}</td>
    </tr>
  `).join(""),d=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>كشف حساب عمولات الوسيط — زياد</title>
  <style>
    @page { size: A4 landscape; margin: 8mm; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 11px; direction: rtl; margin: 0; padding: 10px; color: #000; }
    .hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #004d80; padding-bottom: 8px; margin-bottom: 12px; }
    .kpi-row { display: flex; gap: 10px; margin-bottom: 14px; }
    .kpi-box { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; background: #f8fafc; }
    .kpi-title { font-size: 10px; color: #64748b; font-weight: bold; }
    .kpi-val { font-size: 15px; font-weight: 900; color: #004d80; font-family: monospace; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 6px; }
    th, td { border: 1px solid #cbd5e1; padding: 5px 8px; }
    th { background: #e0f2fe; color: #004d80; font-weight: 900; }
    .ftr { margin-top: 20px; display: flex; justify-content: space-between; font-weight: bold; padding-top: 10px; border-top: 1px dashed #cbd5e1; }
  </style>
</head>
<body>
  <div class="hdr">
    <div>
      <h2 style="margin:0; font-size:18px; color:#004d80;">شركة نظم الإمداد المتطورة</h2>
      <div style="font-size:11px; color:#475569; margin-top:2px;">كشف حساب وتصفية عمولات مبيعات الوسيط</div>
    </div>
    <div style="text-align:center;">
      <h3 style="margin:0; font-size:16px;">كشف مستحقات الوسيط: زياد</h3>
      <div style="font-size:11px; color:#0284c7; font-weight:bold; margin-top:2px;">نسبة العمولة: 1.0% قبل الضريبة</div>
    </div>
    <div style="text-align:left; font-size:11px; font-family:monospace;">
      التاريخ: ${P()}<br />
      الحساب: 2-1-4-2
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi-box"><div class="kpi-title">إجمالي المبيعات الخاضعة</div><div class="kpi-val">${r(n.totalSalesTaxable)}</div></div>
    <div class="kpi-box"><div class="kpi-title">إجمالي العمولات المحسوبة</div><div class="kpi-val" style="color:#d97706;">${r(n.totalCommissionCalculated)}</div></div>
    <div class="kpi-box"><div class="kpi-title">العمولات المكتسبة (المسددة)</div><div class="kpi-val" style="color:#059669;">${r(n.totalCommissionEarned)}</div></div>
    <div class="kpi-box"><div class="kpi-title">العمولات المعلقة بالسداد</div><div class="kpi-val" style="color:#4f46e5;">${r(n.totalCommissionPending)}</div></div>
    <div class="kpi-box"><div class="kpi-title">العمولات المصروفة نقداً/بنكاً</div><div class="kpi-val" style="color:#db2777;">${r(n.totalCommissionPaidOut)}</div></div>
    <div class="kpi-box" style="background:#004d80; color:#fff;"><div class="kpi-title" style="color:#e0f2fe;">الرصيد الصافي المستحق للصرف</div><div class="kpi-val" style="color:#facc15;">${r(n.currentNetPayable)}</div></div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:30px;">#</th>
        <th>رقم الفاتورة</th>
        <th>التاريخ</th>
        <th>العميل</th>
        <th>المبلغ قبل الضريبة</th>
        <th>النسبة</th>
        <th>العمولة (ر.س)</th>
        <th>سداد العميل</th>
        <th>حالة الاستحقاق</th>
      </tr>
    </thead>
    <tbody>
      ${t}
    </tbody>
  </table>

  <div class="ftr">
    <div>إعداد المحاسب المسؤول: _______________________</div>
    <div>المراجعة والتدقيق المالي: _______________________</div>
    <div>توقيع المستفيد (زياد): _______________________</div>
    <div>اعتماد الإدارة: _______________________</div>
  </div>

  <script>
    window.onload = function() { window.print(); };
  <\/script>
</body>
</html>`;o.document.open(),o.document.write(d),o.document.close()};export{W as render};
