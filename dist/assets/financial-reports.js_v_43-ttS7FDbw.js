const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-C8cvrlnW.js","assets/index-Dq7oGj9k.css","assets/sync-engine-Dp3HOS_8.js"])))=>i.map(i=>d[i]);
import{s as ct,t as pt,_ as Y,g as J,f as o,C as ut,d as yt,a as tt}from"./index-C8cvrlnW.js";import{e as gt}from"./excel-zCoXiaxq.js";import{orderBy as ht,getDoc as wt,doc as $t}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let R=[],j=[],Q="ledger",et=null,ot=null,A=[];async function Kt(n,r){n.innerHTML=`
    <!-- Top Filter Bar -->
    <div class="filterbar no-print">
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="fin-from" value="${ct()}" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="fin-to" value="${pt()}" />
      </div>
      <!-- Extra Filters Area (Trial Balance Levels) -->
      <div id="fin-extra-filters" style="display:flex; gap:16px; align-items:center;"></div>
      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="printActiveReportPDF()" style="font-weight:700; background:linear-gradient(135deg,#5b3ec2,#4338ca); color:#fff; border:none; box-shadow:0 2px 6px rgba(91,62,194,0.3);">📑 تصدير PDF / طباعة التقرير</button>
        <button class="btn btn-primary btn-sm" onclick="loadDataAndRender(true)">🔄 تحديث</button>
      </div>
    </div>

    <!-- Tab Bar -->
    <div class="modal-tabs no-print" style="display:flex; border-bottom:1px solid var(--border-soft); background:var(--bg-1); padding:0 16px; gap:8px; overflow-x:auto;">
      <button class="tab-btn active" id="btn-tab-ledger"   onclick="switchFinTab('ledger')"   style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--brand); border-bottom:2px solid var(--brand); white-space:nowrap;">📒 دفتر الأستاذ</button>
      <button class="tab-btn" id="btn-tab-trial"    onclick="switchFinTab('trial')"    style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--text-2); border-bottom:2px solid transparent; white-space:nowrap;">⚖️ ميزان المراجعة</button>
      <button class="tab-btn" id="btn-tab-income"   onclick="switchFinTab('income')"   style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--text-2); border-bottom:2px solid transparent; white-space:nowrap;">📊 قائمة الدخل</button>
      <button class="tab-btn" id="btn-tab-balance"  onclick="switchFinTab('balance')"  style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--text-2); border-bottom:2px solid transparent; white-space:nowrap;">🏛️ المركز المالي</button>
      <button class="tab-btn" id="btn-tab-cashflow" onclick="switchFinTab('cashflow')" style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--text-2); border-bottom:2px solid transparent; white-space:nowrap;">💧 التدفقات النقدية</button>
      <button class="tab-btn" id="btn-tab-equity"   onclick="switchFinTab('equity')"   style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--text-2); border-bottom:2px solid transparent; white-space:nowrap;">🏦 التغير في الملكية</button>
      <button class="tab-btn" id="btn-tab-breakeven" onclick="switchFinTab('breakeven')" style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--text-2); border-bottom:2px solid transparent; white-space:nowrap;">🎯 نقطة التعادل CVP</button>
      <button class="tab-btn" id="btn-tab-analysis" onclick="switchFinTab('analysis')" style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--text-2); border-bottom:2px solid transparent; white-space:nowrap;">📈 التحليل المالي والنسب</button>
      <button class="tab-btn" id="btn-tab-aging"    onclick="switchFinTab('aging')"    style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--text-2); border-bottom:2px solid transparent; white-space:nowrap;">⏳ أعمار الديون</button>
      <button class="tab-btn" id="btn-tab-custperf" onclick="switchFinTab('custperf')" style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--text-2); border-bottom:2px solid transparent; white-space:nowrap;">🏆 أداء العملاء</button>
    </div>

    <!-- Main Content Area -->
    <div class="page-content" id="fin-report-body" style="padding:24px;">
       <div class="page-loading"><div class="loading-spinner"></div></div>
    </div>
  `,document.getElementById("fin-from").addEventListener("change",()=>loadDataAndRender()),document.getElementById("fin-to").addEventListener("change",()=>loadDataAndRender()),await loadDataAndRender()}let st={},rt={};function mt(n){return st[n.accountId]||rt[n.accountCode]||null}function Pt(n){const r=n.code||"";return r.startsWith("5-1-1")?!1:r==="5-1-8"||r==="5-1-7"||r==="5-1-9"||r==="5-1-3"||r.startsWith("5-1-")&&!r.startsWith("5-1-1")||r==="4-2-4"||n.name?.includes("تكلفة البضاعة المباعة")||n.name?.includes("تكلفة مبيعات")||n.name?.includes("نقل بضاعة")}window.loadDataAndRender=async function(n=!0){const r=document.getElementById("fin-report-body");if(r){r.innerHTML='<div class="page-loading"><div class="loading-spinner"></div><span>جارٍ تحميل البيانات المحاسبية…</span></div>';try{const{clearERPCache:a,COLS:t}=await Y(async()=>{const{clearERPCache:d,COLS:i}=await import("./index-C8cvrlnW.js").then(p=>p.T);return{clearERPCache:d,COLS:i}},__vite__mapDeps([0,1]));a(t.chartOfAccounts().path),a(t.journalEntries().path),a(t.salesInvoices().path),a(t.receipts().path),et=null,ot=null,R=await J(t.chartOfAccounts(),[ht("code")]),st={},rt={},R.forEach(d=>{st[d.id]=d,rt[d.code]=d}),j=await J(t.journalEntries(),[ht("date","asc")]),nt()}catch(a){r.innerHTML=`<div class="alert bad">${a.message}</div>`}}};window.switchFinTab=n=>{Q=n,document.querySelectorAll(".tab-btn").forEach(a=>{a.classList.remove("active"),a.style.color="var(--text-2)",a.style.borderBottomColor="transparent"});const r=document.getElementById(`btn-tab-${n}`);r&&(r.classList.add("active"),r.style.color="var(--brand)",r.style.borderBottomColor="var(--brand)"),window.loadDataAndRender(!0)};function nt(){const n=document.getElementById("fin-report-body");if(!n)return;let r=document.getElementById("fin-from")?.value||ct(),a=document.getElementById("fin-to")?.value||pt();const t=m=>{if(!m)return"";if(/^\d{4}-\d{2}-\d{2}$/.test(m))return m;const e=m.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);if(e)return`${e[3]}-${e[2].padStart(2,"0")}-${e[1].padStart(2,"0")}`;const s=new Date(m);return isNaN(s.getTime())?m:s.toISOString().split("T")[0]};let d=t(r),i=t(a);if(d&&i&&d>i){const m=d;d=i,i=m}const p=document.getElementById("fin-extra-filters");if(p)if(Q==="trial"){p.innerHTML=`
        <div class="date-range-group">
          <label>مستوى الحسابات</label>
          <select id="trial-level" style="padding:6px 12px; border:1px solid var(--border); border-radius:6px; background:var(--bg-1); color:var(--text-1); font-weight:bold; font-size:12px; min-height:38px;">
            <option value="all" ${window.trialLevel==="all"?"selected":""}>كل المستويات</option>
            <option value="1" ${window.trialLevel==="1"?"selected":""}>المستوى 1 (رئيسي)</option>
            <option value="2" ${window.trialLevel==="2"?"selected":""}>المستوى 2</option>
            <option value="3" ${window.trialLevel==="3"?"selected":""}>المستوى 3</option>
            <option value="4" ${window.trialLevel==="4"?"selected":""}>المستوى 4</option>
            <option value="5" ${window.trialLevel==="5"?"selected":""}>المستوى 5 (تحليلي)</option>
          </select>
        </div>
      `;const m=document.getElementById("trial-level");m&&m.addEventListener("change",e=>{window.trialLevel=e.target.value,nt()})}else if(Q==="custperf"){const m=[...new Set((et||[]).filter(e=>e.repName).map(e=>e.repName))].sort();p.innerHTML=`
        <div class="date-range-group">
          <label>المندوب</label>
          <select id="custperf-rep" style="padding:6px 12px; border:1px solid var(--border); border-radius:6px; background:var(--bg-1); color:var(--text-1); font-weight:bold; font-size:12px; min-height:38px;">
            <option value="">كل المناديب</option>
            ${m.map(e=>`<option value="${e}" ${window.custperfRep===e?"selected":""}>${e}</option>`).join("")}
          </select>
        </div>
        <div class="date-range-group">
          <label>الترتيب حسب</label>
          <select id="custperf-sort" style="padding:6px 12px; border:1px solid var(--border); border-radius:6px; background:var(--bg-1); color:var(--text-1); font-weight:bold; font-size:12px; min-height:38px;">
            <option value="sales" ${window.custperfSort==="sales"?"selected":""}>المبيعات</option>
            <option value="profit" ${window.custperfSort==="profit"?"selected":""}>الربح</option>
            <option value="collection" ${window.custperfSort==="collection"?"selected":""}>نسبة التحصيل</option>
            <option value="remaining" ${window.custperfSort==="remaining"?"selected":""}>المتبقي</option>
            <option value="daily" ${window.custperfSort==="daily"?"selected":""}>المعدل اليومي</option>
          </select>
        </div>
        <div style="display:flex; gap:8px; align-items:flex-end; flex-wrap:wrap;">
          <div style="position:relative; display:inline-block;">
            <button id="btn-custperf-cols" class="btn btn-secondary" onclick="toggleCustPerfColMenu(event)" style="white-space:nowrap; min-height:38px; display:inline-flex; align-items:center; gap:6px; background:var(--bg-1); border:1px solid var(--border); cursor:pointer;">
              ⚙️ تخصيص الأعمدة ▾
            </button>
            <div id="custperf-col-dropdown" class="card shadow-lg" style="display:none; position:absolute; top:calc(100% + 6px); left:0; min-width:280px; z-index:1050; padding:12px; border-radius:10px; border:1px solid var(--border); background:var(--bg-card, var(--bg-1)); box-shadow:0 12px 30px rgba(0,0,0,0.35);">
            </div>
          </div>
          <button class="btn btn-secondary" onclick="exportCustPerfExcel()" style="white-space:nowrap; min-height:38px; display:inline-flex; align-items:center; gap:6px;">
            📥 تصدير Excel
          </button>
          <button class="btn btn-primary" onclick="exportCustPerfPDF()" style="white-space:nowrap; min-height:38px; display:inline-flex; align-items:center; gap:6px;">
            🖨️ طباعة / PDF
          </button>
        </div>
      `,document.getElementById("custperf-rep")?.addEventListener("change",e=>{window.custperfRep=e.target.value,nt()}),document.getElementById("custperf-sort")?.addEventListener("change",e=>{window.custperfSort=e.target.value,nt()})}else p.innerHTML="";({ledger:Ct,trial:Tt,income:It,balance:St,cashflow:Mt,equity:Bt,breakeven:it,analysis:_t,aging:At,custperf:Rt}[Q]||Ct)(n,d,i)}function Ct(n,r,a){const d=[...R].sort((i,p)=>(i.code||"").localeCompare(p.code||"")).map(i=>`<option value="${i.id}">${i.code} — ${i.name}${i.nodeType==="header"?" 📁":""}</option>`).join("");n.innerHTML=`
    <div class="card no-print mb-16" style="padding:16px;">
      <div style="display:flex; gap:16px; align-items:flex-end; flex-wrap:wrap;">
        <div class="form-group" style="flex:1; min-width:280px; margin:0;">
          <label>اختر الحساب لعرض حركاته</label>
          <select id="ledger-acc-select" class="input" onchange="updateLedgerLines()">
            ${d}
          </select>
        </div>
        <button class="btn btn-secondary" onclick="exportLedgerExcel()" style="white-space:nowrap;">📥 تصدير Excel</button>
      </div>
    </div>
    <div id="ledger-report-area"></div>
  `,window.updateLedgerLines=()=>{const i=document.getElementById("ledger-acc-select")?.value,p=R.find(y=>y.id===i);if(!p)return;const h=["liability","equity","revenue"].includes(p.type),m=R.some(y=>y.code!==p.code&&y.code.startsWith(p.code+"-"));let e=0;const s=[];if(m){const y={};for(const T of j){const l=T.date||"";for(const c of T.lines||[]){const C=c.accountCode;if(!C||C!==p.code&&!C.startsWith(p.code+"-"))continue;const I=c.debit||0,g=c.credit||0;l<r?e+=I-g:l>=r&&l<=a&&(y[T.id]||(y[T.id]={date:l,entryNumber:at(T.entryNumber,T.id),description:T.description||"",sourceType:T.sourceType||"",debit:0,credit:0,entryId:T.id}),y[T.id].debit+=I,y[T.id].credit+=g)}}Object.values(y).sort((T,l)=>T.date.localeCompare(l.date)).forEach(T=>s.push(T))}else{for(const y of j){const T=y.date||"";for(const l of y.lines||[]){const c=mt(l);if(!c||c.id!==i)continue;const C=l.debit||0,I=l.credit||0;T<r?e+=C-I:T>=r&&T<=a&&s.push({date:T,entryNumber:at(y.entryNumber,y.id),description:y.description||"",sourceType:y.sourceType||"",debit:C,credit:I,note:l.note||"",entryId:y.id})}}s.sort((y,T)=>y.date.localeCompare(T.date))}const f=s.reduce((y,T)=>y+T.debit,0),x=s.reduce((y,T)=>y+T.credit,0);window._ledgerData={acc:p,from:r,to:a,openingBalance:e,isCreditNormal:h,lines:s,totalDr:f,totalCr:x};const w=document.getElementById("ledger-report-area");if(!w)return;const v=m?'<span style="font-size:11px; background:var(--bg-3); padding:2px 8px; border-radius:4px; margin-right:8px;">📁 حساب أب — يشمل كل الأبناء</span>':"";let P=h?-e:e;const k=s.map(y=>{const T=y.debit-y.credit;P+=h?-T:T;const l=Math.abs(P),c=P>=0?"مدين":"دائن",C=(h?P<=0:P>=0)?"var(--text-1)":"#ef4444",I=y.entryId?`<span onclick="window.showJEDetail('${y.entryId}')" style="color:var(--brand);cursor:pointer;font-weight:bold;font-size:12px;text-decoration:underline dotted;" title="انقر لعرض القيد كاملاً">${y.entryNumber}</span>`:`<span style="font-size:12px;font-weight:bold;color:var(--brand);">${y.entryNumber}</span>`;return`
        <tr>
          <td class="dim" style="font-size:12px;">${y.date}</td>
          <td class="mono">${I}</td>
          <td style="font-size:12px;max-width:250px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${y.description}</td>
          <td class="dim" style="font-size:11px;">${ft(y.sourceType)||y.note||"—"}</td>
          <td class="mono" style="color:var(--text-indigo,#6366f1);font-size:12px;">${y.debit?o(y.debit):"—"}</td>
          <td class="mono" style="color:var(--text-lime,#22c55e);font-size:12px;">${y.credit?o(y.credit):"—"}</td>
          <td class="mono font-bold" style="color:${C};font-size:12px;">${o(l)} <span class="dim" style="font-size:10px;">${c}</span></td>
        </tr>`}).join(""),z=Math.abs(h?-e:e),u=(h?-e:e)>=0?"مدين":"دائن",E=Math.abs(P),b=P>=0?"مدين":"دائن",$=(h?P<=0:P>=0)?"var(--text-1)":"#ef4444";w.innerHTML=`
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("دفتر الأستاذ التفصيلي",`حساب: ${p.code} — ${p.name} | من ${r} إلى ${a}`):""}
      <div class="no-print" style="text-align:center; margin-bottom:16px;">
        <h3 style="margin:0 0 4px;">📒 دفتر الأستاذ التفصيلي ${v}</h3>
        <p class="dim" style="margin:0;">حساب: <strong>${p.code}</strong> — ${p.name} | من <strong>${r}</strong> إلى <strong>${a}</strong></p>
      </div>
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr>
              <th style="width:100px;">التاريخ</th>
              <th style="width:130px;">رقم القيد</th>
              <th>البيان</th>
              <th style="width:90px;">نوع العملية</th>
              <th class="text-indigo" style="width:110px;">مدين</th>
              <th class="text-lime" style="width:110px;">دائن</th>
              <th style="width:120px;">الرصيد الجاري</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:var(--bg-2); font-weight:bold;">
              <td colspan="4">📌 رصيد افتتاحي (قبل ${r})</td>
              <td class="mono">—</td><td class="mono">—</td>
              <td class="mono font-bold" style="color:${z>0?"var(--text-good,#22c55e)":"var(--text-2)"};">${o(z)} <span class="dim" style="font-size:11px;">${u}</span></td>
            </tr>
            ${s.length===0?'<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-2);">لا توجد حركات في هذه الفترة</td></tr>':""}
            ${k}
            <tr style="border-top:2px solid var(--border); background:var(--bg-2); font-weight:bold;">
              <td colspan="4">📊 الإجمالي (${s.length} حركة)</td>
              <td class="mono font-bold" style="color:var(--text-indigo,#6366f1);">${o(f)}</td>
              <td class="mono font-bold" style="color:var(--text-lime,#22c55e);">${o(x)}</td>
              <td class="mono font-bold" style="color:${$};">${o(E)} <span class="dim" style="font-size:11px;">${b}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `},window.showJEDetail=i=>{const p=j.find(x=>x.id===i);if(!p){window.showToast?.("لم يُعثر على القيد","error");return}const h=(p.lines||[]).map(x=>{const w=st[x.accountId]||rt[x.accountCode];return`<tr>
        <td style="font-size:13px;">${w?`${w.code} — ${w.name}`:x.accountCode||x.accountId||"—"}</td>
        <td class="mono" style="color:#6366f1;text-align:center;">${x.debit?o(x.debit):"—"}</td>
        <td class="mono" style="color:#22c55e;text-align:center;">${x.credit?o(x.credit):"—"}</td>
        <td class="dim" style="font-size:12px;">${x.note||"—"}</td>
      </tr>`}).join(""),m=(p.lines||[]).reduce((x,w)=>x+(w.debit||0),0),e=(p.lines||[]).reduce((x,w)=>x+(w.credit||0),0),s=Math.abs(m-e)<.01,f=document.createElement("div");f.id="je-detail-modal",f.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;",f.innerHTML=`
      <div style="background:var(--bg-1);border-radius:12px;max-width:760px;width:100%;max-height:85vh;overflow-y:auto;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.4);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:12px;">
          <div>
            <div style="font-size:18px;font-weight:bold;">📋 ${at(p.entryNumber,p.id)}</div>
            <div class="dim" style="font-size:13px;margin-top:4px;">${p.date} | ${p.description||"—"} | ${ft(p.sourceType)||p.sourceType||"يدوي"}</div>
          </div>
          <button onclick="document.getElementById('je-detail-modal').remove()" style="border:none;background:var(--bg-3);border-radius:8px;padding:8px 14px;cursor:pointer;font-size:16px;">✕</button>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:var(--bg-2);">
            <th style="padding:8px;text-align:right;">الحساب</th>
            <th style="padding:8px;text-align:center;color:#6366f1;">مدين</th>
            <th style="padding:8px;text-align:center;color:#22c55e;">دائن</th>
            <th style="padding:8px;text-align:right;">بيان</th>
          </tr></thead>
          <tbody>${h}</tbody>
          <tfoot><tr style="background:var(--bg-2);font-weight:bold;border-top:2px solid var(--border);">
            <td style="padding:8px;">الإجمالي</td>
            <td style="padding:8px;text-align:center;color:#6366f1;">${o(m)}</td>
            <td style="padding:8px;text-align:center;color:#22c55e;">${o(e)}</td>
            <td style="padding:8px;font-size:12px;">${s?"✅ قيد متوازن":"⚠️ قيد غير متوازن!"}</td>
          </tr></tfoot>
        </table>
      </div>`,f.addEventListener("click",x=>{x.target===f&&f.remove()}),document.body.appendChild(f)},window.exportLedgerExcel=()=>{const i=window._ledgerData;if(!i)return;let p=`\uFEFFدفتر الأستاذ - ${i.acc.code} - ${i.acc.name}
`;p+=`من ${i.from} إلى ${i.to}

`,p+=`التاريخ,رقم القيد,البيان,نوع العملية,مدين,دائن,الرصيد
`;let h=i.isCreditNormal?-i.openingBalance:i.openingBalance;p+=`,,رصيد افتتاحي,,,, ${h.toFixed(2)}
`,i.lines.forEach(f=>{const x=f.debit-f.credit;h+=i.isCreditNormal?-x:x,p+=`${f.date},${f.entryNumber},"${f.description}",${ft(f.sourceType)||"-"},${f.debit||"0"},${f.credit||"0"},${h.toFixed(2)}
`});const m=new Blob([p],{type:"text/csv;charset=utf-8;"}),e=URL.createObjectURL(m),s=document.createElement("a");s.href=e,s.download=`ledger_${i.acc.code}_${i.from}_${i.to}.csv`,s.click(),URL.revokeObjectURL(e)},updateLedgerLines()}function at(n,r){return n&&n!=="undefined"&&n.trim()?n:`JE-${(r||"").slice(-6).toUpperCase()}`}function ft(n){return n?{sales:"مبيعات",salesInvoice:"فاتورة بيع",salesCOGS:"تكلفة مباعة",salesReturn:"مردود بيع",salesInvoice_cogs:"تكلفة فاتورة بيع",salesReturnCOGS:"تكلفة مردود بيع",purchase:"مشتريات",purchaseInvoice:"فاتورة شراء",purchaseReturn:"مردود شراء",receipt:"تحصيل",payment:"سداد",cashIn:"إيداع نقدي",cashOut:"صرف نقدي",bankDeposit:"إيداع بنكي",bankWithdraw:"سحب بنكي",stockTransfer:"تحويل مخزني",inventoryAdjust:"جرد/تعديل",expense:"مصروف",payroll:"رواتب",opening:"رصيد افتتاحي",transfer:"تحويل",manual:"يدوي",pos:"نقطة بيع",posCOGS:"تكلفة POS",vatPayment:"سداد ضريبة"}[n]||n:""}function Tt(n,r,a){const t=[],d=[];let i=0,p=0,h=0,m=0,e=0,s=0;const f=g=>["liability","equity","revenue"].includes(g.type),x=window.trialLevel||"all",w=g=>(g.code.match(/-/g)||[]).length+1,v=new Set(R.map(g=>g.parentCode).filter(Boolean)),P=g=>!v.has(g.code);{const g={};for(const S of j){const M=S.date||"";for(const B of S.lines||[]){const _=B.accountCode;_&&(g[_]||(g[_]={open:0,tD:0,tC:0}),M<r?g[_].open+=(B.debit||0)-(B.credit||0):M>=r&&M<=a&&(g[_].tD+=B.debit||0,g[_].tC+=B.credit||0))}}for(const S in g){const{open:M,tD:B,tC:_}=g[S],D=M+(B-_);M>0?i+=M:M<0&&(p+=-M),D>0?e+=D:D<0&&(s+=-D),h+=B,m+=_}}const k=(g,S)=>{const M=w(g);return M>S?!1:M===S?!0:!R.some(_=>_.code!==g.code&&_.code.startsWith(g.code+"-")&&w(_)<=S)};for(const g of R){const S=w(g),M=Math.max(0,S-1)*14,B=!P(g),_={asset:"أصول",liability:"خصوم",equity:"حقوق",revenue:"إيراد",expense:"مصروف"};if(x!=="all"&&!k(g,parseInt(x)))continue;let D=0,F=0,L=0;for(const Z of j){const xt=Z.date||"";for(const q of Z.lines||[])!q.accountCode||!(q.accountCode===g.code||q.accountCode.startsWith(g.code+"-"))||(xt<r?D+=(q.debit||0)-(q.credit||0):xt>=r&&xt<=a&&(F+=q.debit||0,L+=q.credit||0))}const H=D+(F-L);if(Math.abs(D)<.01&&F===0&&L===0)continue;const V=D>0?D:0,G=D<0?-D:0,O=H>0?H:0,N=H<0?-H:0,W=!(g.code&&(g.code.startsWith("1-1-2")||g.code.startsWith("2-1-1")))&&(f(g)&&O>.01||!f(g)&&N>.01),X=W?'<span style="font-size:10px; background:#7f1d1d; color:#fca5a5; padding:1px 5px; border-radius:4px; margin-right:4px;">⚠️ رصيد شاذ</span>':"";W&&d.push({id:g.id,code:g.code,name:g.name,type:g.type,parentCode:g.parentCode,sourceEntityId:g.sourceEntityId||null,closeDr:O,closeCr:N}),t.push(`
      <tr ${W?'style="background:rgba(127,29,29,0.08);"':B?'style="background:var(--bg-2);"':""}>
        <td class="mono dim" style="font-size:11px;">${g.code}</td>
        <td style="padding-right:${M+8}px; ${B?"font-weight:700;":""}">${X}${B?"📁 ":""}${g.name}</td>
        <td><span style="font-size:10px; padding:1px 5px; border-radius:4px; background:var(--bg-3);">${_[g.type]||g.type}</span></td>
        <td class="mono">${V?o(V):"—"}</td>
        <td class="mono">${G?o(G):"—"}</td>
        <td class="mono text-indigo">${F?o(F):"—"}</td>
        <td class="mono text-lime">${L?o(L):"—"}</td>
        <td class="mono font-bold">${O?o(O):"—"}</td>
        <td class="mono font-bold">${N?o(N):"—"}</td>
      </tr>
    `)}let z=0,u=0;const E=[];for(const g of j){const S=g.date||"";for(const M of g.lines||[])if(!mt(M)){const _=M.debit||0,D=M.credit||0;if(_===0&&D===0)continue;z+=_,u+=D,E.push({entryId:g.id,entryNum:at(g.entryNumber,g.id),date:S,desc:g.description||"—",accCode:M.accountCode||"—",accName:M.accountName||"—",accId:M.accountId||"—",dr:_,cr:D})}}const b=Math.abs(e-s),$=Math.abs(h-m),y=E.length>0,T=b<.05&&!y,l=y?`
    <div class="card mb-16" style="border:2px solid #b45309; padding:20px;">
      <h4 style="color:#f59e0b; margin-bottom:12px;">⚠️ أسطر قيود يتيمة — الحسابات غير موجودة في شجرة الحسابات</h4>
      <p class="dim" style="font-size:12px; margin-bottom:12px;">
        هذه الأسطر تشير إلى حسابات محذوفة أو غير مُدرجة في الشجرة الحالية، مما يُسبب عدم التوازن.
        يجب مراجعة القيود وإعادة ربطها بحسابات صحيحة.
      </p>
      <p class="dim" style="font-size:12px; margin-bottom:12px;">
        إجمالي المدين اليتيم: <strong>${o(z)}</strong> |
        إجمالي الدائن اليتيم: <strong>${o(u)}</strong> |
        فرق الميزان بسببها: <strong>${o(Math.abs(z-u))}</strong>
      </p>
      <div class="table-container" style="max-height:250px; overflow-y:auto;">
        <table class="data-dense" style="width:100%; font-size:12px;">
          <thead><tr>
            <th>رقم القيد</th><th>التاريخ</th><th>البيان</th>
            <th>كود الحساب</th><th>اسم الحساب</th>
            <th class="text-indigo">مدين</th><th class="text-lime">دائن</th>
          </tr></thead>
          <tbody>
            ${E.slice(0,50).map(g=>`
              <tr>
                <td class="mono dim">${g.entryNum}</td>
                <td>${g.date}</td>
                <td>${g.desc}</td>
                <td class="mono text-bad">${g.accCode}</td>
                <td class="dim">${g.accName}</td>
                <td class="mono text-indigo">${g.dr?o(g.dr):"—"}</td>
                <td class="mono text-lime">${g.cr?o(g.cr):"—"}</td>
              </tr>
            `).join("")}
            ${E.length>50?`<tr><td colspan="7" style="text-align:center; color:var(--text-2);">... و ${E.length-50} سطراً آخر</td></tr>`:""}
          </tbody>
        </table>
      </div>
    </div>
  `:"",c=Math.round(b*100)/100;window._trialData={rows:t,from:r,to:a,totalOpenDr:i,totalOpenCr:p,totalTransDr:h,totalTransCr:m,totalCloseDr:e,totalCloseCr:s,balanced:T},n.innerHTML=`
    ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("ميزان المراجعة بالأرصدة والمجاميع",`الفترة من ${r} إلى ${a}`):""}
    <div class="no-print" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
      <div style="text-align:center; flex:1;">
        <h3 style="margin:0 0 4px;">⚖️ ميزان المراجعة بالأرصدة والمجاميع</h3>
        <p class="dim" style="margin:0;">من <strong>${r}</strong> إلى <strong>${a}</strong></p>
      </div>
      <button class="btn btn-secondary" onclick="exportTrialExcel()" style="white-space:nowrap;">📥 تصدير Excel</button>
    </div>

    ${T?`
    <div class="alert good mb-16" style="display:flex; align-items:center; gap:12px;">
      <span style="font-size:22px;">✅</span>
      <div><strong>الميزان متوازن تماماً</strong> — مجموع القيود: ${o(e)}</div>
    </div>`:`
    <div class="alert bad mb-16" style="display:flex; align-items:center; gap:12px;">
      <span style="font-size:22px;">⚠️</span>
      <div>
        <strong>تحذير: الميزان غير متوازن</strong><br>
        <span class="dim">
          فرق الأرصدة الختامية: ${o(c)}
          ${y?` | أسطر يتيمة: ${E.length} سطر (مدين: ${o(z)} / دائن: ${o(u)})`:""}
          ${$>.05?` | فرق حركات الفترة: ${o(Math.round($*100)/100)}`:""}
        </span>
      </div>
    </div>`}

    ${l}

    <div class="table-container">
      <table class="data-dense" style="width:100%;">
        <thead>
          <tr>
            <th rowspan="2" style="width:120px;">الكود</th>
            <th rowspan="2">اسم الحساب</th>
            <th rowspan="2" style="width:70px;">النوع</th>
            <th colspan="2" style="text-align:center; background:var(--bg-2);">الأرصدة الافتتاحية</th>
            <th colspan="2" style="text-align:center; background:var(--bg-2);">حركات الفترة</th>
            <th colspan="2" style="text-align:center; background:var(--bg-2);">الأرصدة الختامية</th>
          </tr>
          <tr>
            <th>مدين</th><th>دائن</th>
            <th class="text-indigo">مدين</th><th class="text-lime">دائن</th>
            <th>مدين</th><th>دائن</th>
          </tr>
        </thead>
        <tbody>
          ${t.join("")}
          <tr style="border-top:2.5px solid var(--border); background:var(--surface-1); font-weight:bold;">
            <td colspan="3">الإجمالي</td>
            <td class="mono">${o(i)}</td>
            <td class="mono">${o(p)}</td>
            <td class="mono text-indigo">${o(h)}</td>
            <td class="mono text-lime">${o(m)}</td>
            <td class="mono ${T?"text-good":"text-bad"}">${o(e)}</td>
            <td class="mono ${T?"text-good":"text-bad"}">${o(s)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,window.exportTrialExcel=()=>{const g=window._trialData;if(!g)return;let S=`\uFEFFميزان المراجعة - من ${g.from} إلى ${g.to}

`;S+=`الكود,اسم الحساب,النوع,رصيد افتتاحي مدين,رصيد افتتاحي دائن,حركات مدين,حركات دائن,رصيد ختامي مدين,رصيد ختامي دائن
`;const M=document.querySelector("#fin-report-body .data-dense tbody");M&&[...M.querySelectorAll("tr")].forEach(F=>{const L=[...F.querySelectorAll("td")].map(H=>`"${H.textContent.trim().replace(/"/g,'""')}"`);L.length>=8&&(S+=L.join(",")+`
`)});const B=new Blob([S],{type:"text/csv;charset=utf-8;"}),_=URL.createObjectURL(B),D=document.createElement("a");D.href=_,D.download=`trial_balance_${g.from}_${g.to}.csv`,D.click(),URL.revokeObjectURL(_)};const C=d.filter(g=>g.type==="liability"&&g.closeDr>.01||g.type==="asset"&&g.closeCr>.01),I=C.length?`
    <div class="card mt-20" style="border:2px solid #b45309; padding:20px;">
      <h4 style="color:#f59e0b; margin-bottom:8px;">🔧 حسابات تحتاج إجراء (${C.length} حساب)</h4>
      <p class="dim" style="font-size:12px; margin-bottom:12px;">الحسابات التالية لديها رصيد بالاتجاه الخاطئ لنوعها — اضغط زر الإجراء لكل منها</p>
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead><tr>
            <th>الكود</th><th>الاسم</th><th>النوع</th>
            <th>الرصيد الختامي</th><th>تشخيص المشكلة</th><th>الإجراء</th>
          </tr></thead>
          <tbody>
            ${C.map(g=>{const S=g.closeDr>.01?g.closeDr:g.closeCr,M=g.closeDr>.01;let B="",_="";return g.type==="liability"&&M?g.code?.startsWith("2-1-5")||g.code?.startsWith("2-1-4")?(B="سلفة موظف/مندوب مُصنَّفة تحت الخصوم — يجب إعادة تصنيفها كأصل",_=`<button class="btn btn-sm" style="background:#b45309;color:#fff;" onclick="fixReclassifyAccount('${g.id}','${g.code}','asset','1-1-5-4')">🔄 نقل إلى سلف مناديب</button>`):g.code?.startsWith("2-1-1-1-1-")||g.parentCode&&g.parentCode.startsWith("2-1-1-1")?(B="حساب فرعي مورد: المشتريات قُيّدت بالأب بينما الدفعات قُيّدت بالفرعي",_=`<button class="btn btn-sm" style="background:#b45309;color:#fff;" onclick="fixSupplierSubAccountJE('${g.id}','${g.code}','${g.name.replace(/'/g,"\\'")}',${S.toFixed(2)})">⚖️ إنشاء قيد تسوية</button>`):(B="التزام برصيد مدين — راجع القيود يدوياً",_='<span class="dim" style="font-size:12px;">مراجعة يدوية</span>'):g.type==="asset"&&!M&&(B="أصل برصيد دائن — قد يكون دفعة مستلمة زائدة",_='<span class="dim" style="font-size:12px;">مراجعة يدوية</span>'),`
                <tr>
                  <td class="mono dim">${g.code}</td>
                  <td><strong>${g.name}</strong></td>
                  <td><span style="font-size:11px; padding:2px 6px; border-radius:4px; background:rgba(239,68,68,0.15); color:#ef4444;">${g.type==="liability"?"خصوم":"أصول"}</span></td>
                  <td class="mono ${M?"text-indigo":"text-lime"}">${o(S)} ${M?"م":"د"}</td>
                  <td style="font-size:12px; color:var(--text-2);">${B}</td>
                  <td>${_}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `:"";n.innerHTML+=I}window.fixReclassifyAccount=async(n,r,a,t)=>{if(await window.showConfirm?.(`سيتم نقل الحساب ${r} إلى تصنيف "${a==="asset"?"أصول — سلف مناديب":"خصوم"}".

هذا يُزيل علامة "رصيد شاذ" لأن رصيد السلفة المدين يُصبح طبيعياً للأصول.`,"تغيير تصنيف الحساب"))try{const{update:i}=await Y(async()=>{const{update:w}=await import("./index-C8cvrlnW.js").then(v=>v.T);return{update:w}},__vite__mapDeps([0,1])),{getDoc:p,doc:h}=await Y(async()=>{const{getDoc:w,doc:v}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:w,doc:v}},[]),{db:m}=await Y(async()=>{const{db:w}=await import("./index-C8cvrlnW.js").then(v=>v.T);return{db:w}},__vite__mapDeps([0,1])),e=["asset","expense"].includes(a)?"debit":"credit",s=await p(h(m,`companies/${ut}/chartOfAccounts`,n));let f=0;if(s.exists()){const w=s.data(),v=parseFloat(w.totalDebit||0),P=parseFloat(w.totalCredit||0),k=v-P;f=Math.round((e==="credit"?-k:k)*100)/100}await i("chartOfAccounts",n,{type:a,parentCode:t,normalBalance:e,balance:f});const{recalculateCoaRollup:x}=await Y(async()=>{const{recalculateCoaRollup:w}=await import("./sync-engine-Dp3HOS_8.js");return{recalculateCoaRollup:w}},__vite__mapDeps([2,0,1]));await x(),window.showToast?.("✅ تم تغيير تصنيف الحساب وتحديث الأرصدة بنجاح","success"),await window.loadDataAndRender?.()}catch(i){window.showToast?.(i.message,"error")}};window.fixSupplierSubAccountJE=async(n,r,a,t)=>{const d=R.find(h=>h.code==="2-1-1-1-1"),i=R.find(h=>h.id===n);if(!d||!i){window.showToast?.("لم يُعثر على حسابات المورد في شجرة الحسابات","error");return}if(await window.showConfirm?.(`سيتم إنشاء قيد تسوية:
  مدين: ${d.code} — ${d.name}   بمبلغ ${t.toFixed(2)} ر.س
  دائن: ${r} — ${a}   بمبلغ ${t.toFixed(2)} ر.س

هذا ينقل رصيد المشتريات من الحساب الأب إلى الحساب الفرعي للمورد.
الرصيد الإجمالي لذمم الموردين لن يتغير.`,"إنشاء قيد تسوية"))try{const{createJournalEntry:h}=await Y(async()=>{const{createJournalEntry:e}=await import("./index-C8cvrlnW.js").then(s=>s.T);return{createJournalEntry:e}},__vite__mapDeps([0,1])),m=new Date().toISOString().split("T")[0];await h({date:m,description:`تسوية — نقل رصيد ${a} من الحساب الأب إلى الفرعي`,entryType:"correction",lines:[{accountId:d.id,accountCode:d.code,accountName:d.name,debit:t,credit:0,description:`نقل رصيد مشتريات ${a} للحساب الفرعي`},{accountId:i.id,accountCode:i.code,accountName:i.name,debit:0,credit:t,description:`تسوية رصيد مشتريات ${a}`}]}),window.showToast?.("✅ تم إنشاء قيد التسوية بنجاح","success"),await window.loadDataAndRender?.()}catch(h){window.showToast?.(h.message,"error")}};function U(n,r){let a=0,t=0,d=0;const i=[],p=[],h=[];for(const e of R){if(e.isGroup||e.isHeader||e.nodeType==="header"||e.nodeType==="group")continue;let s=0;for(const f of j){const x=f.date||"";if(!n||!r||x>=n&&x<=r)for(const w of f.lines||[]){const v=mt(w);v&&(v.id===e.id||v.code===e.code)&&(s+=(w.credit||0)-(w.debit||0))}}if(!(Math.abs(s)<.01)){if(e.type==="revenue"){const f=s;Math.abs(f)>.01&&(a+=f,i.push({name:e.name,code:e.code,balance:f}))}else if(e.type==="expense"){if(e.code?.startsWith("5-1-1")||e.name?.includes("مشتريات البضاعة"))continue;const f=-s;if(Math.abs(f)<.01)continue;Pt(e)?(t+=f,p.push({name:e.name,code:e.code,balance:f})):(d+=f,h.push({name:e.name,code:e.code,balance:f}))}}}return{grossRevenue:i.filter(e=>e.balance>0).reduce((e,s)=>e+s.balance,0)||a,revenueTotal:a,cogsTotal:t,opExpTotal:d,revItems:i,cogsItems:p,expItems:h,grossProfit:a-t,netProfit:a-t-d}}function zt(n,r){const a=new Date(n+"T00:00:00"),t=new Date(r+"T00:00:00"),d=Math.round((t-a)/864e5)+1,i=new Date(a);i.setDate(i.getDate()-1);const p=new Date(i);p.setDate(p.getDate()-d+1);const h=m=>m.toISOString().slice(0,10);return{prevFrom:h(p),prevTo:h(i)}}window.printActiveReportPDF=()=>{const n=document.getElementById("fin-from")?.value||ct(),r=document.getElementById("fin-to")?.value||pt();Q==="income"?window.printIncomeStatementPDF(n,r):Q==="breakeven"?window.printBreakEvenPDF(n,r):window.print()};window.printIncomeStatementPDF=async(n,r)=>{const a=U(n,r),{grossRevenue:t,revenueTotal:d,cogsTotal:i,opExpTotal:p,revItems:h,cogsItems:m,expItems:e,grossProfit:s,netProfit:f}=a,x=d>0?(f/d*100).toFixed(1):"0.0",w=d>0?(s/d*100).toFixed(1):"0.0";h.sort((u,E)=>(u.code||"").localeCompare(E.code||"")),m.sort((u,E)=>(u.code||"").localeCompare(E.code||"")),e.sort((u,E)=>(u.code||"").localeCompare(E.code||""));let v={name:"شركة نظم الإمداد الحديثة",vatNumber:"312448150500003",crNumber:"4700123180",phone:"0549141648",email:"Nuzmalamdad@gmail.com",address:"7480 - الشارع: عامر الشعبي، ينبع",logoUrl:""};try{const u=JSON.parse(localStorage.getItem("idham_company")||"{}");u.name&&Object.assign(v,u),u.cr&&(v.crNumber=u.cr),u.crNumber&&(v.crNumber=u.crNumber),u.logoBase64&&(v.logoUrl=u.logoBase64),u.logoUrl&&(v.logoUrl=u.logoUrl)}catch{}try{const[u,E]=await Promise.all([wt($t(yt,`companies/${ut}/settings`,"company")),wt($t(yt,`companies/${ut}/settings`,"logo"))]);if(u.exists()){const b=u.data(),$=b.crNumber||b.cr||b.commercialRegistration||"";b.crNumber=$&&$.startsWith("47")?$:"4700123180",b.vatNumber=b.vatNumber||"312448150500003",b.name=b.name||"شركة نظم الإمداد الحديثة",Object.assign(v,b)}if(E.exists()){const b=E.data(),$=b.dataUrl||b.logoBase64||b.url||b.logoUrl||"";if($){v.logoUrl=$;try{const y=JSON.parse(localStorage.getItem("idham_company")||"{}");localStorage.setItem("idham_company",JSON.stringify({...y,logoBase64:$,logoUrl:$}))}catch{}}}}catch(u){console.warn("Could not load fresh logo from Firestore:",u)}const P=v.logoUrl?`<div class="logo-circle"><img src="${v.logoUrl}" alt="Logo" /></div>`:'<div class="logo-circle"><span class="default-logo">🏢</span></div>',k=f<0,z=window.open("","_blank");z.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>قائمة الدخل والأرباح والخسائر — ${n} إلى ${r}</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'IBM Plex Sans Arabic', sans-serif; direction: rtl; color: #1f2937; background: #f8fafc; padding: 12px; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    
    .no-print { background: #1f2937; padding: 10px; display: flex; gap: 12px; justify-content: center; margin-bottom: 12px; border-radius: 8px; }
    .btn { padding: 8px 20px; font-weight: 700; border-radius: 8px; cursor: pointer; border: none; font-size: 13px; font-family: inherit; }
    
    .report-container { background: #fff; max-width: 210mm; margin: 0 auto; padding: 18px 22px; border: 1.5px solid #5b3ec2; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    
    /* Top Title */
    .top-title { text-align: center; margin-bottom: 12px; }
    .top-title h1 { font-size: 20px; color: #5b3ec2; font-weight: 800; margin-bottom: 2px; }
    .top-title h2 { font-size: 10px; color: #5b3ec2; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
    
    /* Purple Company Banner */
    .company-banner { background: #5b3ec2 !important; color: #fff !important; border-radius: 8px; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .banner-left { text-align: right; font-size: 11.5px; font-weight: 500; line-height: 1.5; color: #fff !important; }
    .banner-left div { color: #fff !important; }
    .banner-left strong { color: #fff !important; }
    .banner-right { text-align: left; line-height: 1.4; color: #fff !important; }
    .banner-right h2 { font-size: 16px; font-weight: 800; margin-bottom: 3px; color: #fff !important; }
    .banner-right div { font-size: 11.5px; color: #fff !important; }
    .banner-right strong { color: #fff !important; }
    .logo-circle { width: 68px; height: 68px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 4px; border: 1.5px solid #5b3ec2; box-shadow: 0 2px 6px rgba(0,0,0,0.12); flex-shrink: 0; }
    .logo-circle img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .logo-circle .default-logo { font-size: 28px; }
    
    /* Info Strip */
    .info-strip { border: 1px solid #5b3ec2; border-radius: 6px; padding: 6px 12px; font-size: 10.5px; background: #fdfcff; margin-bottom: 14px; display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
    .info-strip span { color: #1f2937; }
    .info-strip strong { color: #5b3ec2; }
    
    /* KPI Strip */
    .kpi-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 14px; }
    .kpi-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; background: #f8fafc; text-align: center; }
    .kpi-box.blue { border-color: #3b82f6; background: #eff6ff; }
    .kpi-box.indigo { border-color: #6366f1; background: #eef2ff; }
    .kpi-box.loss { border-color: #ef4444; background: #fef2f2; }
    .kpi-box.profit { border-color: #22c55e; background: #f0fdf4; }
    .kpi-box .lbl { font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px; }
    .kpi-box .val { font-size: 16px; font-weight: 900; font-family: 'IBM Plex Mono', monospace; }
    .kpi-box.blue .val { color: #1d4ed8; }
    .kpi-box.indigo .val { color: #4338ca; }
    .kpi-box.loss .val { color: #b91c1c; }
    .kpi-box.profit .val { color: #15803d; }
    
    /* Section Head */
    .sec-head { background: #5b3ec2 !important; color: #fff !important; font-size: 12px; font-weight: 800; padding: 7px 12px; border-radius: 6px 6px 0 0; margin-top: 14px; display: flex; justify-content: space-between; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .sec-head span { color: #fff !important; }
    
    /* Accounting Table */
    .acc-table { width: 100%; border-collapse: collapse; margin-bottom: 4px; border: 1px solid #5b3ec2; border-top: none; }
    .acc-table thead tr { background: #f1f5f9; border-bottom: 1px solid #cbd5e1; }
    .acc-table thead th { font-size: 10.5px; font-weight: 700; padding: 6px 8px; color: #334155; text-align: right; }
    .acc-table tbody tr { border-bottom: 1px solid #e2e8f0; }
    .acc-table tbody tr:nth-child(even) { background: #fcfcfd; }
    .acc-table tbody td { padding: 6px 8px; font-size: 11px; color: #1f2937; }
    .acc-table tbody td.mono { font-family: 'IBM Plex Mono', monospace; font-weight: 700; text-align: left; }
    
    .subtotal-row { background: #f8fafc; border: 1px solid #cbd5e1; border-top: none; padding: 7px 10px; display: flex; justify-content: space-between; font-weight: 800; font-size: 11.5px; margin-bottom: 12px; border-radius: 0 0 6px 6px; }
    .gross-profit-box { background: #eef2ff !important; border: 1.5px solid #6366f1; border-radius: 8px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; font-weight: 900; margin-bottom: 14px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .gross-profit-box .val { font-family: 'IBM Plex Mono', monospace; font-size: 15px; color: #4338ca; }
    
    /* Grand Summary Box */
    .grand-summary { border-radius: 8px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; margin-top: 18px; margin-bottom: 18px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .grand-summary.loss { background: #991b1b !important; color: #fff !important; border: 2px solid #ef4444; }
    .grand-summary.profit { background: #166534 !important; color: #fff !important; border: 2px solid #22c55e; }
    .grand-summary h3 { font-size: 16px; font-weight: 900; color: #fff !important; }
    .grand-summary p { font-size: 11px; opacity: 0.9; color: #fff !important; }
    .grand-summary .val { font-size: 22px; font-weight: 900; font-family: 'IBM Plex Mono', monospace; color: #fff !important; }
    
    /* Signatures */
    .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 25px; padding-top: 15px; border-top: 1px dashed #5b3ec2; text-align: center; }
    .signatures .role { font-size: 11px; font-weight: 800; color: #334155; margin-bottom: 35px; }
    .signatures .line { border-top: 1px dotted #94a3b8; width: 110px; margin: 0 auto; font-size: 10px; color: #64748b; padding-top: 3px; }
    
    @page {
      size: A4;
      margin: 8mm 10mm 8mm 10mm;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .no-print { display: none !important; }
      .report-container { max-width: 100%; box-shadow: none; border-radius: 0; border: 1px solid #5b3ec2; padding: 10px; }
      .company-banner { background: #5b3ec2 !important; color: #fff !important; }
      .sec-head { background: #5b3ec2 !important; color: #fff !important; }
      .grand-summary.loss { background: #991b1b !important; color: #fff !important; }
      .grand-summary.profit { background: #166534 !important; color: #fff !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn" style="background:#5b3ec2;color:#fff;" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
    <button class="btn" style="background:#374151;color:#fff;" onclick="window.close()">✕ إغلاق</button>
  </div>

  <div class="report-container">
    <!-- Top Title -->
    <div class="top-title">
      <h1>قائمة الدخل والأرباح والخسائر</h1>
      <h2>INCOME STATEMENT & COMPREHENSIVE PROFIT / LOSS REPORT</h2>
    </div>

    <!-- Purple Company Banner -->
    <div class="company-banner">
      <div class="banner-left">
        <div>الفترة المالية: <strong>من ${n} إلى ${r}</strong></div>
        <div>تاريخ الإصدار: <strong>${new Date().toLocaleDateString("ar-SA")}</strong></div>
        <div>العملة: <strong>ريال سعودي (SAR)</strong></div>
      </div>
      ${P}
      <div class="banner-right">
        <h2>${v.name}</h2>
        ${v.vatNumber?`<div>الرقم الضريبي: <strong>${v.vatNumber}</strong></div>`:""}
        ${v.crNumber?`<div>السجل التجاري: <strong>${v.crNumber}</strong></div>`:""}
        ${v.phone?`<div>الهاتف: <strong>${v.phone}</strong></div>`:""}
      </div>
    </div>

    <!-- Info Strip -->
    <div class="info-strip">
      <span><strong>بيانات المنشأة:</strong> ${v.name}</span>
      <span><strong>الرقم الضريبي:</strong> ${v.vatNumber||"—"}</span>
      <span><strong>السجل التجاري:</strong> ${v.crNumber||"—"}</span>
      <span><strong>العنوان:</strong> ${v.address||"المملكة العربية السعودية"}</span>
    </div>

    <!-- KPI Summary Strip -->
    <div class="kpi-strip">
      <div class="kpi-box blue">
        <div class="lbl">صافي الإيرادات والمبيعات</div>
        <div class="val" dir="ltr">${o(d)}</div>
      </div>
      <div class="kpi-box indigo">
        <div class="lbl">مجمل الربح (هامش ${w}%)</div>
        <div class="val" dir="ltr">${o(s)}</div>
      </div>
      <div class="kpi-box ${k?"loss":"profit"}">
        <div class="lbl">${k?"صافي الخسارة":"صافي الربح"} (هامش ${x}%)</div>
        <div class="val" dir="ltr">${o(f)}</div>
      </div>
    </div>

    <!-- 1. Revenues -->
    <div class="sec-head">
      <span>أولاً: الإيرادات التشغيلية والمبيعات (Revenues)</span>
      <span>100.0%</span>
    </div>
    <table class="acc-table">
      <thead>
        <tr>
          <th style="width:130px;">كود الحساب</th>
          <th>اسم الحساب والبيان</th>
          <th style="width:140px; text-align:left;">المبلغ (ر.س)</th>
          <th style="width:70px; text-align:center;">النسبة</th>
        </tr>
      </thead>
      <tbody>
        ${h.length?h.map(u=>`
          <tr>
            <td style="font-family:'IBM Plex Mono',monospace; font-weight:700;">${u.code}</td>
            <td style="font-weight:700;">${u.name}</td>
            <td class="mono" dir="ltr">${o(u.balance)}</td>
            <td style="text-align:center; font-size:10.5px;">${t>0?(u.balance/t*100).toFixed(1):0}%</td>
          </tr>
        `).join(""):'<tr><td colspan="4" style="text-align:center; padding:10px;">لا توجد إيرادات مسجلة</td></tr>'}
      </tbody>
    </table>
    <div class="subtotal-row">
      <span style="color:#1d4ed8;">صافي الإيرادات التشغيلية:</span>
      <span class="mono" style="color:#1d4ed8;" dir="ltr">${o(d)} (${t>0?(d/t*100).toFixed(1):100}%)</span>
    </div>

    <!-- 2. COGS -->
    <div class="sec-head">
      <span>ثانياً: تكلفة البضاعة المباعة (COGS)</span>
      <span>تكلفة مباشرة</span>
    </div>
    <table class="acc-table">
      <thead>
        <tr>
          <th style="width:130px;">كود الحساب</th>
          <th>اسم الحساب والبيان</th>
          <th style="width:140px; text-align:left;">المبلغ (ر.س)</th>
          <th style="width:70px; text-align:center;">النسبة</th>
        </tr>
      </thead>
      <tbody>
        ${m.length?m.map(u=>`
          <tr>
            <td style="font-family:'IBM Plex Mono',monospace; font-weight:700;">${u.code}</td>
            <td style="font-weight:700;">${u.name}</td>
            <td class="mono" style="color:#b45309;" dir="ltr">(${o(u.balance)})</td>
            <td style="text-align:center; font-size:10.5px;">${d>0?(u.balance/d*100).toFixed(1):0}%</td>
          </tr>
        `).join(""):'<tr><td colspan="4" style="text-align:center; padding:10px;">لا توجد تكلفة مباشرة مسجلة</td></tr>'}
      </tbody>
    </table>
    <div class="subtotal-row">
      <span style="color:#b45309;">يخصم: إجمالي تكلفة البضاعة المباعة:</span>
      <span class="mono" style="color:#b45309;" dir="ltr">(${o(i)})</span>
    </div>

    <div class="gross-profit-box">
      <div>🏷️ مجمل الربح التشغيلي (Gross Profit) — هامش: ${w}%</div>
      <div class="val" dir="ltr">${o(s)}</div>
    </div>

    <!-- 3. Operating Expenses -->
    <div class="sec-head">
      <span>ثالثاً: المصروفات التشغيلية والعمومية والإدارية (Operating Expenses)</span>
      <span>مصروفات تشغيلية</span>
    </div>
    <table class="acc-table">
      <thead>
        <tr>
          <th style="width:130px;">كود الحساب</th>
          <th>اسم الحساب والبيان</th>
          <th style="width:140px; text-align:left;">المبلغ (ر.س)</th>
          <th style="width:70px; text-align:center;">النسبة</th>
        </tr>
      </thead>
      <tbody>
        ${e.length?e.map(u=>`
          <tr>
            <td style="font-family:'IBM Plex Mono',monospace; font-weight:700;">${u.code}</td>
            <td style="font-weight:700;">${u.name}</td>
            <td class="mono" style="color:#dc2626;" dir="ltr">(${o(u.balance)})</td>
            <td style="text-align:center; font-size:10.5px;">${p>0?(u.balance/p*100).toFixed(1):0}%</td>
          </tr>
        `).join(""):'<tr><td colspan="4" style="text-align:center; padding:10px;">لا توجد مصروفات تشغيلية مسجلة</td></tr>'}
      </tbody>
    </table>
    <div class="subtotal-row">
      <span style="color:#dc2626;">إجمالي المصروفات التشغيلية والإدارية:</span>
      <span class="mono" style="color:#dc2626;" dir="ltr">(${o(p)})</span>
    </div>

    <!-- Grand Summary Banner -->
    <div class="grand-summary ${k?"loss":"profit"}">
      <div>
        <h3>${k?"⚠️ صافي الخسارة للفترة (Net Loss)":"🎉 صافي الربح للفترة (Net Profit)"}</h3>
        <p>نسبة صافي ${k?"الخسارة":"الربح"} من الإيراد: ${x}% | تم احتساب كافة الإيرادات والتكاليف والمصروفات</p>
      </div>
      <div class="val" dir="ltr">${o(f)}</div>
    </div>

    <!-- Signatures -->
    <div class="signatures">
      <div>
        <div class="role">إعداد / المحاسب المالي</div>
        <div class="line">التوقيع</div>
      </div>
      <div>
        <div class="role">مراجعة / الإدارة المالية</div>
        <div class="line">التوقيع</div>
      </div>
      <div>
        <div class="role">اعتماد / المدير العام</div>
        <div class="line">الختم والتوقيع</div>
      </div>
    </div>

  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  <\/script>
</body>
</html>`),z.document.close()};window.exportIncomeStatementExcel=(n,r)=>{const a=U(n,r),t=[];t.push(["قائمة الدخل والأرباح والخسائر — شركة نظم الإمداد الحديثة"]),t.push([`للفترة من: ${n} إلى: ${r}`]),t.push([]),t.push(["القسم","كود الحساب","اسم الحساب","المبلغ (ر.س)"]),(a.revItems||[]).forEach(d=>t.push(["الإيرادات",d.code,d.name,d.balance])),t.push(["الإيرادات","","إجمالي الإيرادات",a.revenueTotal]),t.push([]),(a.cogsItems||[]).forEach(d=>t.push(["تكلفة المبيعات",d.code,d.name,-d.balance])),t.push(["تكلفة المبيعات","","إجمالي تكلفة المبيعات",-a.cogsTotal]),t.push(["مجمل الربح","","مجمل الربح (Gross Profit)",a.grossProfit]),t.push([]),(a.expItems||[]).forEach(d=>t.push(["المصروفات التشغيلية",d.code,d.name,-d.balance])),t.push(["المصروفات التشغيلية","","إجمالي المصروفات التشغيلية",-a.opExpTotal]),t.push([]),t.push(["النتيجة النهائية","","صافي الربح / (الخسارة)",a.netProfit]),gt(t)};function It(n,r,a){const t=U(r,a),{grossRevenue:d,revenueTotal:i,cogsTotal:p,opExpTotal:h,revItems:m,cogsItems:e,expItems:s,grossProfit:f,netProfit:x}=t,w=i>0?(x/i*100).toFixed(1):"0.0",v=i>0?(f/i*100).toFixed(1):"0.0";m.sort((b,$)=>(b.code||"").localeCompare($.code||"")),e.sort((b,$)=>(b.code||"").localeCompare($.code||"")),s.sort((b,$)=>(b.code||"").localeCompare($.code||""));const{prevFrom:P,prevTo:k}=zt(r,a),z=U(P,k),u=(b,$)=>{if(!$||Math.abs($)<.01)return"";const y=((b-$)/Math.abs($)*100).toFixed(1),T=parseFloat(y)>=0;return`<span style="font-size:11px; font-weight:700; color:${T?"#16a34a":"#dc2626"}; margin-right:4px;">${T?"▲":"▼"} ${Math.abs(y)}%</span>`},E=x<0;n.innerHTML=`
    <!-- Top Print Header (Visible in Print) -->
    <div class="report-print-header" style="border-bottom:2px solid #3b82f6; padding-bottom:12px; margin-bottom:18px;">
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("قائمة الدخل والأرباح والخسائر (Income Statement)",`للفترة المالية من: ${r} إلى: ${a}`):""}
    </div>

    <!-- On-screen Action Toolbar -->
    <div class="no-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; background:var(--bg-1); padding:12px 18px; border-radius:12px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm);">
      <div style="font-size:13px; font-weight:700; color:var(--text-2);">
        📊 <strong style="color:var(--text-1);">قائمة الأرباح والخسائر الشاملة</strong> | مقارنة بالفترة السابقة (${P} → ${k})
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-secondary btn-sm" onclick="exportIncomeStatementExcel('${r}', '${a}')" style="font-weight:700;">📊 تصدير Excel</button>
        <button class="btn btn-primary btn-sm" onclick="printIncomeStatementPDF('${r}', '${a}')" style="font-weight:700; background:linear-gradient(135deg, #5b3ec2, #4338ca); border:none; box-shadow:0 2px 6px rgba(91,62,194,0.3);">📑 تصدير PDF المطور (الهيدر الملون الرسمي)</button>
      </div>
    </div>

    <div class="income-statement-doc" style="max-width:920px; margin:0 auto;">
      
      <!-- ═══ KPI SUMMARY CARDS ═══ -->
      <div class="grid-3 gap-16 mb-24 kpi-row" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin-bottom:20px;">
        
        <!-- Total Revenues -->
        <div class="kpi-card" style="background:linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02)); border:1.5px solid rgba(59,130,246,0.3); border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:#1d4ed8;">💰 صافي الإيرادات والمبيعات</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:rgba(59,130,246,0.15); color:#1d4ed8;">صافي الإيراد 📈</span>
          </div>
          <div style="font-size:20px; font-weight:900; color:#1d4ed8; font-family:'IBM Plex Mono', monospace;">
            ${o(i)} ${u(i,z.revenueTotal)}
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">إجمالي المبيعات قبل المردود: <strong class="mono">${o(d)}</strong></div>
        </div>

        <!-- Gross Profit -->
        <div class="kpi-card" style="background:linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02)); border:1.5px solid rgba(99,102,241,0.3); border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:#4338ca;">🏷️ مجمل الربح (Gross Profit)</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:rgba(99,102,241,0.15); color:#4338ca;">هامش ${v}%</span>
          </div>
          <div style="font-size:20px; font-weight:900; color:#4338ca; font-family:'IBM Plex Mono', monospace;">
            ${o(f)} ${u(f,z.grossProfit)}
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">السابق: <strong class="mono">${o(z.grossProfit)}</strong></div>
        </div>

        <!-- Net Profit / Loss -->
        <div class="kpi-card" style="background:${E?"linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.02))":"linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02))"}; border:1.5px solid ${E?"rgba(239,68,68,0.4)":"rgba(16,185,129,0.4)"}; border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:${E?"#b91c1c":"#047857"};">${E?"⚠️ صافي الخسارة":"🏆 صافي الربح"}</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:${E?"rgba(239,68,68,0.15)":"rgba(16,185,129,0.15)"}; color:${E?"#b91c1c":"#047857"};">${w}%</span>
          </div>
          <div style="font-size:20px; font-weight:900; color:${E?"#b91c1c":"#047857"}; font-family:'IBM Plex Mono', monospace;">
            ${o(x)} ${u(x,z.netProfit)}
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">السابق: <strong class="mono">${o(z.netProfit)}</strong></div>
        </div>

      </div>

      <!-- ═══ MAIN STATEMENT REPORT CARD ═══ -->
      <div class="card income-report-body" style="border-radius:16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); overflow:hidden; padding:24px; background:var(--bg-1);">
        
        <!-- SECTION 1: REVENUES -->
        <div class="income-sec mb-24" style="page-break-inside:avoid; break-inside:avoid; margin-bottom:24px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #2563eb; padding-bottom:8px; margin-bottom:12px;">
            <h4 style="margin:0; font-size:15px; font-weight:900; color:#1d4ed8;">أولاً: الإيرادات التشغيلية والمبيعات (Revenues)</h4>
            <span style="font-size:11px; font-weight:700; color:#1d4ed8; background:rgba(37,99,235,0.1); padding:2px 8px; border-radius:6px;">حسابات الإيراد</span>
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:8px;">
            <thead>
              <tr style="background:var(--bg-2); color:var(--text-2); font-size:11.5px; border-bottom:1px solid var(--border-soft);">
                <th style="text-align:right; padding:6px 10px; width:130px;">كود الحساب</th>
                <th style="text-align:right; padding:6px 10px;">اسم الحساب / البند</th>
                <th style="text-align:left; padding:6px 10px; width:140px;">المبلغ (ر.س)</th>
                <th style="text-align:center; padding:6px 10px; width:80px;">النسبة</th>
              </tr>
            </thead>
            <tbody>
              ${m.length?m.map((b,$)=>{const y=d>0?(b.balance/d*100).toFixed(1):"0.0";return`
                <tr style="border-bottom:1px solid var(--border-soft); background:${$%2===1?"rgba(0,0,0,0.015)":"transparent"};">
                  <td style="padding:8px 10px; font-family:'IBM Plex Mono',monospace; font-weight:700; color:var(--text-3);">${b.code}</td>
                  <td style="padding:8px 10px; font-weight:700; color:var(--text-1);">${b.name}</td>
                  <td style="padding:8px 10px; text-align:left; font-family:'IBM Plex Mono',monospace; font-weight:700; color:${b.balance>=0?"#1e293b":"#dc2626"};" dir="ltr">${o(b.balance)}</td>
                  <td style="padding:8px 10px; text-align:center; font-size:11px; color:var(--text-3); font-weight:600;">${y}%</td>
                </tr>`}).join(""):'<tr><td colspan="4" style="text-align:center; padding:12px; color:var(--text-3);">لا توجد إيرادات مسجلة في هذه الفترة</td></tr>'}
            </tbody>
          </table>
          <div style="display:flex; justify-content:space-between; align-items:center; background:linear-gradient(90deg, rgba(37,99,235,0.12), rgba(37,99,235,0.04)); padding:10px 14px; border-radius:8px; border:1px solid rgba(37,99,235,0.25); font-weight:800;">
            <span style="color:#1d4ed8; font-size:14px;">صافي الإيرادات التشغيلية (بعد خصم المردودات)</span>
            <span style="font-family:'IBM Plex Mono',monospace; font-size:16px; color:#1d4ed8;" dir="ltr">${o(i)}</span>
          </div>
        </div>

        <!-- SECTION 2: COGS & GROSS PROFIT -->
        <div class="income-sec mb-24" style="page-break-inside:avoid; break-inside:avoid; margin-bottom:24px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #d97706; padding-bottom:8px; margin-bottom:12px;">
            <h4 style="margin:0; font-size:15px; font-weight:900; color:#b45309;">ثانياً: تكلفة البضاعة المباعة (Cost of Goods Sold - COGS)</h4>
            <span style="font-size:11px; font-weight:700; color:#b45309; background:rgba(217,119,6,0.1); padding:2px 8px; border-radius:6px;">تكلفة مباشرة</span>
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:8px;">
            <thead>
              <tr style="background:var(--bg-2); color:var(--text-2); font-size:11.5px; border-bottom:1px solid var(--border-soft);">
                <th style="text-align:right; padding:6px 10px; width:130px;">كود الحساب</th>
                <th style="text-align:right; padding:6px 10px;">اسم الحساب / البند</th>
                <th style="text-align:left; padding:6px 10px; width:140px;">المبلغ (ر.س)</th>
                <th style="text-align:center; padding:6px 10px; width:80px;">النسبة</th>
              </tr>
            </thead>
            <tbody>
              ${e.length?e.map((b,$)=>{const y=i>0?(b.balance/i*100).toFixed(1):"0.0";return`
                <tr style="border-bottom:1px solid var(--border-soft); background:${$%2===1?"rgba(0,0,0,0.015)":"transparent"};">
                  <td style="padding:8px 10px; font-family:'IBM Plex Mono',monospace; font-weight:700; color:var(--text-3);">${b.code}</td>
                  <td style="padding:8px 10px; font-weight:700; color:var(--text-1);">${b.name}</td>
                  <td style="padding:8px 10px; text-align:left; font-family:'IBM Plex Mono',monospace; font-weight:700; color:#b45309;" dir="ltr">(${o(b.balance)})</td>
                  <td style="padding:8px 10px; text-align:center; font-size:11px; color:var(--text-3);">${y}%</td>
                </tr>`}).join(""):'<tr><td colspan="4" style="text-align:center; padding:12px; color:var(--text-3);">لا توجد تكلفة مباعة مسجلة</td></tr>'}
            </tbody>
          </table>
          <div style="display:flex; justify-content:space-between; align-items:center; background:linear-gradient(90deg, rgba(217,119,6,0.12), rgba(217,119,6,0.04)); padding:10px 14px; border-radius:8px; border:1px solid rgba(217,119,6,0.25); font-weight:800; margin-bottom:12px;">
            <span style="color:#b45309; font-size:14px;">يخصم: إجمالي تكلفة البضاعة المباعة</span>
            <span style="font-family:'IBM Plex Mono',monospace; font-size:16px; color:#b45309;" dir="ltr">(${o(p)})</span>
          </div>

          <!-- GROSS PROFIT HIGHLIGHT -->
          <div style="display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.06)); padding:12px 16px; border-radius:10px; border:1.5px solid #6366f1; font-weight:900;">
            <div>
              <span style="font-size:15px; color:#4338ca;">🏷️ مجمل الربح التشغيلي (Gross Profit)</span>
              <span style="font-size:11px; color:#6366f1; margin-right:8px;">[هامش الربح الإجمالي: ${v}%]</span>
            </div>
            <span style="font-family:'IBM Plex Mono',monospace; font-size:18px; color:#4338ca;" dir="ltr">${o(f)}</span>
          </div>
        </div>

        <!-- SECTION 3: OPERATING EXPENSES -->
        <div class="income-sec mb-24" style="page-break-inside:avoid; break-inside:avoid; margin-bottom:24px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #dc2626; padding-bottom:8px; margin-bottom:12px;">
            <h4 style="margin:0; font-size:15px; font-weight:900; color:#dc2626;">ثالثاً: المصروفات التشغيلية والعمومية والإدارية (Operating Expenses)</h4>
            <span style="font-size:11px; font-weight:700; color:#dc2626; background:rgba(220,38,38,0.1); padding:2px 8px; border-radius:6px;">مصروفات عامة</span>
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:8px;">
            <thead>
              <tr style="background:var(--bg-2); color:var(--text-2); font-size:11.5px; border-bottom:1px solid var(--border-soft);">
                <th style="text-align:right; padding:6px 10px; width:130px;">كود الحساب</th>
                <th style="text-align:right; padding:6px 10px;">اسم الحساب / البند</th>
                <th style="text-align:left; padding:6px 10px; width:140px;">المبلغ (ر.س)</th>
                <th style="text-align:center; padding:6px 10px; width:80px;">النسبة</th>
              </tr>
            </thead>
            <tbody>
              ${s.length?s.map((b,$)=>{const y=h>0?(b.balance/h*100).toFixed(1):"0.0";return`
                <tr style="border-bottom:1px solid var(--border-soft); background:${$%2===1?"rgba(0,0,0,0.015)":"transparent"};">
                  <td style="padding:8px 10px; font-family:'IBM Plex Mono',monospace; font-weight:700; color:var(--text-3);">${b.code}</td>
                  <td style="padding:8px 10px; font-weight:700; color:var(--text-1);">${b.name}</td>
                  <td style="padding:8px 10px; text-align:left; font-family:'IBM Plex Mono',monospace; font-weight:700; color:#dc2626;" dir="ltr">(${o(b.balance)})</td>
                  <td style="padding:8px 10px; text-align:center; font-size:11px; color:var(--text-3);">${y}%</td>
                </tr>`}).join(""):'<tr><td colspan="4" style="text-align:center; padding:12px; color:var(--text-3);">لا توجد مصروفات تشغيلية مسجلة</td></tr>'}
            </tbody>
          </table>
          <div style="display:flex; justify-content:space-between; align-items:center; background:linear-gradient(90deg, rgba(220,38,38,0.12), rgba(220,38,38,0.04)); padding:10px 14px; border-radius:8px; border:1px solid rgba(220,38,38,0.25); font-weight:800;">
            <span style="color:#dc2626; font-size:14px;">إجمالي المصروفات التشغيلية والإدارية</span>
            <span style="font-family:'IBM Plex Mono',monospace; font-size:16px; color:#dc2626;" dir="ltr">(${o(h)})</span>
          </div>
        </div>

        <!-- ═══ GRAND NET PROFIT / LOSS BANNER (ULTRA HIGH CONTRAST) ═══ -->
        <div class="grand-summary-box" style="page-break-inside:avoid; break-inside:avoid; margin-top:20px;">
          ${E?`
          <div style="display:flex; justify-content:space-between; align-items:center; background:#991b1b !important; color:#ffffff !important; padding:18px 24px; border-radius:14px; border:2px solid #ef4444 !important; box-shadow:0 6px 16px rgba(220,38,38,0.3); -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
            <div>
              <div style="font-size:18px; font-weight:900; color:#ffffff !important; display:flex; align-items:center; gap:8px;">
                <span>⚠️</span>
                <span style="color:#ffffff !important;">صافي الخسارة للفترة (Net Loss)</span>
              </div>
              <div style="font-size:12px; color:#fecaca !important; font-weight:700; margin-top:3px;">
                نسبة صافي الخسارة من الإيراد: ${w}% | تم احتساب كافة الإيرادات والتكاليف والمصروفات
              </div>
            </div>
            <div style="font-size:24px; font-weight:900; font-family:'IBM Plex Mono',monospace; color:#ffffff !important; text-shadow:0 1px 3px rgba(0,0,0,0.5);" dir="ltr">
              ${o(x)}
            </div>
          </div>
          `:`
          <div style="display:flex; justify-content:space-between; align-items:center; background:#166534 !important; color:#ffffff !important; padding:18px 24px; border-radius:14px; border:2px solid #22c55e !important; box-shadow:0 6px 16px rgba(22,163,74,0.3); -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
            <div>
              <div style="font-size:18px; font-weight:900; color:#ffffff !important; display:flex; align-items:center; gap:8px;">
                <span>🎉</span>
                <span style="color:#ffffff !important;">صافي الربح للفترة (Net Profit)</span>
              </div>
              <div style="font-size:12px; color:#bbf7d0 !important; font-weight:700; margin-top:3px;">
                هامش صافي الربح: ${w}% | تم احتساب كافة الإيرادات والتكاليف والمصروفات
              </div>
            </div>
            <div style="font-size:24px; font-weight:900; font-family:'IBM Plex Mono',monospace; color:#ffffff !important; text-shadow:0 1px 3px rgba(0,0,0,0.5);" dir="ltr">
              ${o(x)}
            </div>
          </div>
          `}
        </div>

        <!-- ═══ AUDIT & SIGNATURES FOOTER (PRINT ONLY) ═══ -->
        <div class="print-signatures" style="margin-top:35px; border-top:1.5px dashed #94a3b8; padding-top:20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; text-align:center;">
          <div>
            <div style="font-size:12px; font-weight:800; color:#334155; margin-bottom:40px;">إعداد / المحاسب المالي</div>
            <div style="font-size:11px; color:#64748b; border-top:1px dotted #94a3b8; width:130px; margin:0 auto; padding-top:4px;">التوقيع</div>
          </div>
          <div>
            <div style="font-size:12px; font-weight:800; color:#334155; margin-bottom:40px;">مراجعة / الإدارة المالية</div>
            <div style="font-size:11px; color:#64748b; border-top:1px dotted #94a3b8; width:130px; margin:0 auto; padding-top:4px;">التوقيع</div>
          </div>
          <div>
            <div style="font-size:12px; font-weight:800; color:#334155; margin-bottom:40px;">اعتماد / المدير العام</div>
            <div style="font-size:11px; color:#64748b; border-top:1px dotted #94a3b8; width:130px; margin:0 auto; padding-top:4px;">الختم والتوقيع</div>
          </div>
        </div>

      </div>
    </div>
  `}function St(n,r,a){let t=0,d=0,i=0;const p=[],h=[],m=[],e=[],s=[];let f=0,x=0;const w={};for(const l of j)if(!((l.date||"")>a))for(const C of l.lines||[]){const I=C.accountCode;I&&(w[I]=(w[I]||0)+(C.debit||0)-(C.credit||0))}const v=l=>{let c=0;for(const C in w)(C===l.code||C.startsWith(l.code+"-"))&&(c+=w[C]);if(Math.abs(c)<.001){const C=parseFloat(l.balance||l.openingBalance||0);Math.abs(C)>.001&&(c=["liability","equity","revenue"].includes(l.type)?-C:C)}return c},P=l=>l.code?.split("-").length||1,k=l=>P(l)>4?!1:!R.some(c=>c.type===l.type&&c.code!==l.code&&c.code.startsWith(l.code+"-")&&P(c)<=4);for(const l of R){if(!k(l))continue;const c=v(l);if(l.type==="asset"){if(Math.abs(c)<.01)continue;t+=c,(l.code?.startsWith("1-2")||l.code?.startsWith("1-3")||l.name?.includes("سيارات")||l.name?.includes("أثاث")||l.name?.includes("عقارات")||l.name?.includes("معدات")?h:p).push({name:l.name,code:l.code,balance:c})}else if(l.type==="liability"){const C=-c;if(Math.abs(C)<.01)continue;d+=C,(l.code?.startsWith("2-2")||l.name?.includes("قرض طويل")||l.name?.includes("سند")?e:m).push({name:l.name,code:l.code,balance:C})}else if(l.type==="equity"){const C=-c;if(Math.abs(C)<.01)continue;i+=C,s.push({name:l.name,code:l.code,balance:C})}else l.type==="revenue"?f+=-c:l.type==="expense"&&(x+=c)}const z=f-x,u=t-d-i-z,E=i+u+z,b=d+E,$=Math.abs(t-b)<1,y=(l,c="var(--text-0)")=>`<div class="flex justify-between mb-8" style="font-size:13px;">
       <span>${l.code} — ${l.name}</span>
       <span class="mono" style="color:${c}">${o(l.balance)}</span>
     </div>`,T=(l,c,C="var(--text-0)")=>`<div class="flex justify-between font-bold" style="background:var(--bg-2); padding:8px 12px; border-radius:6px; margin:8px 0 16px;">
       <span>${l}</span>
       <span class="mono" style="color:${C}">${o(c)}</span>
     </div>`;n.innerHTML=`
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("ميزانية العمومية (Balance Sheet)",`كما هي في: ${a}`):""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>قائمة المركز المالي (Balance Sheet)</h2>
      <p class="dim">كما هي في: ${a}</p>
    </div>

    ${$?"":`<div class="alert bad mb-16">⚠️ الميزانية غير متوازنة — فرق: ${o(Math.abs(t-b))}</div>`}

    <div class="grid-2 gap-24" style="max-width:1200px; margin:0 auto;">

      <!-- ASSETS -->
      <div class="card" style="padding:24px;">
        <h3 style="color:var(--brand); border-bottom:2px solid var(--brand); padding-bottom:8px; margin-bottom:20px;">الأصول (Assets)</h3>

        <h4 style="color:var(--indigo); margin:0 0 12px;">الأصول المتداولة</h4>
        ${p.map(l=>y(l,"var(--indigo)")).join("")||"<p class='dim'>—</p>"}
        ${T("إجمالي الأصول المتداولة",p.reduce((l,c)=>l+c.balance,0),"var(--indigo)")}

        <h4 style="color:var(--indigo); margin:16px 0 12px;">الأصول الثابتة (غير المتداولة)</h4>
        ${h.map(l=>y(l)).join("")||"<p class='dim'>—</p>"}
        ${T("إجمالي الأصول الثابتة",h.reduce((l,c)=>l+c.balance,0))}

        <div class="flex justify-between font-bold" style="background:linear-gradient(135deg,var(--bg-2),var(--surface-1)); padding:14px 16px; border-radius:10px; font-size:16px; margin-top:8px; border:2px solid var(--brand);">
          <span>إجمالي الأصول</span>
          <span class="mono text-brand">${o(t)}</span>
        </div>
      </div>

      <!-- LIABILITIES & EQUITY -->
      <div class="card" style="padding:24px;">
        <h3 style="color:var(--brand); border-bottom:2px solid var(--brand); padding-bottom:8px; margin-bottom:20px;">الالتزامات وحقوق الملكية</h3>

        <h4 style="color:var(--text-bad, #ef4444); margin:0 0 12px;">الالتزامات المتداولة</h4>
        ${m.map(l=>y(l,"var(--text-bad, #ef4444)")).join("")||"<p class='dim'>—</p>"}
        ${T("إجمالي الالتزامات المتداولة",m.reduce((l,c)=>l+c.balance,0),"var(--text-bad, #ef4444)")}

        <h4 style="color:var(--text-bad, #ef4444); margin:16px 0 12px;">الالتزامات طويلة الأجل</h4>
        ${e.map(l=>y(l,"var(--warn)")).join("")||"<p class='dim'>—</p>"}
        ${T("إجمالي الالتزامات طويلة الأجل",e.reduce((l,c)=>l+c.balance,0),"var(--warn)")}

        <h4 style="color:var(--brand); margin:16px 0 12px; border-top:1px solid var(--border); padding-top:12px;">حقوق الملكية (Owner's Equity)</h4>
        ${s.map(l=>y(l,"var(--brand)")).join("")||"<p class='dim'>—</p>"}
        ${Math.abs(u)>.01?`
        <div class="flex justify-between mb-8" style="font-size:13px;">
          <span>3-1-3 — أرباح / (خسائر) مرحّلة وتعديلات افتتاحية</span>
          <span class="mono ${u>=0?"text-good":"text-bad"}">${o(u)}</span>
        </div>`:""}
        <div class="flex justify-between mb-8" style="font-size:13px;">
          <span>أرباح / (خسائر) الفترة الحالية</span>
          <span class="mono ${z>=0?"text-good":"text-bad"}">${o(z)}</span>
        </div>
        ${T("إجمالي حقوق الملكية",E,"var(--brand)")}

        <div class="flex justify-between font-bold" style="background:linear-gradient(135deg,var(--bg-2),var(--surface-1)); padding:14px 16px; border-radius:10px; font-size:16px; margin-top:8px; border:2px solid ${$?"var(--good)":"var(--bad)"};">
          <span>إجمالي الالتزامات وحقوق الملكية</span>
          <span class="mono ${$?"text-good":"text-bad"}">${o(b)}</span>
        </div>
      </div>
    </div>
  `}function Mt(n,r,a){const{netProfit:t}=U(r,a),d=R.filter(l=>l.code?.startsWith("1-1-1-1")||l.code?.startsWith("1-1-1-3")||l.name?.includes("صندوق")||l.name?.includes("بنك")||l.name?.includes("مصرف")),i=new Set(d.map(l=>l.id)),p=new Set(d.map(l=>l.code)),h=l=>i.has(l.accountId)||p.has(l.accountCode);let m=0,e=0;for(const l of j){const c=l.date||"";for(const C of l.lines||[]){if(!h(C))continue;const I=(C.debit||0)-(C.credit||0);c<r&&(m+=I),c<=a&&(e+=I)}}let s=0,f=0,x=0,w=0,v=0,P=0,k=0,z=0,u=0;for(const l of R){if(i.has(l.id)||l.type==="revenue"||l.type==="expense")continue;let c=0,C=0;for(const S of j){const M=S.date||"";for(const B of S.lines||[]){if(B.accountId!==l.id&&B.accountCode!==l.code)continue;const _=(B.debit||0)-(B.credit||0);M<r&&(c+=_),M<=a&&(C+=_)}}const I=C-c;if(Math.abs(I)<.01)continue;const g=l.code||"";g.startsWith("1-1-2")?s-=I:g.startsWith("1-1-4")?f-=I:g.startsWith("1-1-5")?w-=I:g.startsWith("1-2")||g.startsWith("1-3")?z-=I:g.startsWith("2-1-1")||g.startsWith("2-1-2")?x+=-I:g.startsWith("2-1-3")?v+=-I:g.startsWith("3")?u+=-I:l.type==="asset"?P-=I:l.type==="liability"&&(k+=-I)}const E=s+f+x+w+v+P+k,b=t+E,$=b+z+u,y=(l,c,C=!0)=>`<div class="flex justify-between mb-8" style="font-size:14px;${C?"padding-right:16px; color:var(--text-1);":""}">
       <span>${l}</span>
       <span class="mono ${c>=0?"":"text-bad"}">${c>=0?"":"("}${o(Math.abs(c))}${c>=0?"":")"}</span>
     </div>`,T=(l,c)=>`<div class="flex justify-between font-bold" style="background:var(--bg-2); padding:10px 14px; border-radius:8px; margin:12px 0 24px;">
       <span>${l}</span>
       <span class="mono ${c>=0?"text-good":"text-bad"}">${c>=0?"":"("}${o(Math.abs(c))}${c>=0?"":")"}</span>
     </div>`;n.innerHTML=`
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("تقرير التدفقات النقدية (الطريقة غير المباشرة)",`الفترة من ${r} إلى ${a}`):""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>تقرير التدفقات النقدية (الطريقة غير المباشرة)</h2>
      <p class="dim">للفترة من ${r} إلى ${a}</p>
    </div>

    <div style="max-width:800px; margin:0 auto;">
      <!-- Cash KPIs -->
      <div class="grid-3 gap-16 mb-24">
        <div class="kpi-card">
          <div class="status-bar good"></div>
          <div class="kpi-content">
            <div class="kpi-label">الرصيد النقدي الافتتاحي</div>
            <div class="kpi-value">${o(m)}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="status-bar ${$>=0?"good":"bad"}"></div>
          <div class="kpi-content">
            <div class="kpi-label">صافي التغير في النقدية</div>
            <div class="kpi-value ${$>=0?"text-good":"text-bad"}">${o($)}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="status-bar indigo"></div>
          <div class="kpi-content">
            <div class="kpi-label">الرصيد النقدي الختامي</div>
            <div class="kpi-value text-indigo">${o(e)}</div>
          </div>
        </div>
      </div>

      <div class="card" style="padding:28px;">
        <h4 style="color:var(--brand); border-bottom:1.5px solid var(--brand); padding-bottom:8px; margin-bottom:16px;">1. الأنشطة التشغيلية (Operating Activities)</h4>
        ${y("صافي ربح الفترة",t,!1)}
        <div style="padding-right:16px; margin-bottom:8px; color:var(--text-2); font-size:12px; font-weight:600;">تسويات التغير في رأس المال العامل:</div>
        ${y("(زيادة) نقص في الذمم المدينة — العملاء",s)}
        ${y("(زيادة) نقص في المخزون السلعي",f)}
        ${y("(زيادة) نقص في ضريبة القيمة المضافة المدخلات",w)}
        ${y("زيادة (نقص) في الذمم الدائنة — الموردون",x)}
        ${y("زيادة (نقص) في ضريبة القيمة المضافة المخرجات",v)}
        ${Math.abs(P)>.01?y("أصول تشغيلية أخرى",P):""}
        ${Math.abs(k)>.01?y("التزامات تشغيلية أخرى",k):""}
        ${T("صافي النقد من الأنشطة التشغيلية",b)}

        <h4 style="color:var(--brand); border-bottom:1.5px solid var(--brand); padding-bottom:8px; margin-bottom:16px;">2. الأنشطة الاستثمارية (Investing Activities)</h4>
        ${y("شراء / بيع أصول ثابتة وممتلكات",z,!1)}
        ${T("صافي النقد من الأنشطة الاستثمارية",z)}

        <h4 style="color:var(--brand); border-bottom:1.5px solid var(--brand); padding-bottom:8px; margin-bottom:16px;">3. الأنشطة التمويلية (Financing Activities)</h4>
        ${y("زيادة رأس المال / مسحوبات المالك / قروض",u,!1)}
        ${T("صافي النقد من الأنشطة التمويلية",u)}

        <div style="border-top:2px solid var(--border); padding-top:16px; margin-top:8px;">
          <div class="flex justify-between font-bold mb-8" style="font-size:15px;">
            <span>صافي التغير الكلي في النقدية خلال الفترة</span>
            <span class="mono ${$>=0?"text-good":"text-bad"}">${o($)}</span>
          </div>
          <div class="flex justify-between dim mb-8">
            <span>رصيد النقدية في بداية الفترة</span>
            <span class="mono">${o(m)}</span>
          </div>
          <div class="flex justify-between font-bold" style="font-size:16px; background:linear-gradient(135deg,var(--bg-2),var(--surface-1)); padding:14px 16px; border-radius:10px; border:2px solid var(--brand);">
            <span>رصيد النقدية في نهاية الفترة</span>
            <span class="mono text-brand">${o(e)}</span>
          </div>
        </div>
      </div>
    </div>
  `}function Bt(n,r,a){let t=0,d=0,i=0,p=0,h=0,m=0;for(const v of R){if(v.type!=="equity")continue;let P=0,k=0;for(const z of j){const u=z.date||"";for(const E of z.lines||[]){if(E.accountId!==v.id&&E.accountCode!==v.code)continue;const b=(E.credit||0)-(E.debit||0);u<r?P+=b:u>=r&&u<=a&&(k+=b)}}v.name?.includes("رأس المال")?(t+=P,d+=k):v.name?.includes("أرباح مبقاة")||v.name?.includes("أرباح محتجزة")||v.name?.includes("احتياطي")?(i+=P,p+=k):v.name?.includes("مسحوبات")||v.name?.includes("جاري المالك")?(h+=P,m+=k):(t+=P,d+=k)}const{netProfit:e}=U(r,a);p+=e;const s=t+d,f=i+p,x=h+m,w=(v,P,k,z,u=!1,E="")=>`<tr ${u?'style="border-top:2px solid var(--border); background:var(--bg-2); font-weight:bold;"':""}>
      <td>${v}</td>
      <td class="mono ${E}">${o(P)}</td>
      <td class="mono ${E}">${o(k)}</td>
      <td class="mono ${E||(z<0?"text-bad":"")}">${o(z)}</td>
      <td class="mono font-bold ${E}">${o(P+k+z)}</td>
    </tr>`;n.innerHTML=`
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("تقرير الأرباح حسب مراكز التكلفة",`الفترة من ${r} إلى ${a}`):""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>قائمة التغير في حقوق الملكية</h2>
      <p class="dim">للفترة من ${r} إلى ${a}</p>
    </div>

    <div style="max-width:900px; margin:0 auto;">
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr>
              <th>البند</th>
              <th>رأس المال المدفوع</th>
              <th>الأرباح المبقاة</th>
              <th>مسحوبات المالك</th>
              <th>إجمالي حقوق الملكية</th>
            </tr>
          </thead>
          <tbody>
            ${w("رصيد بداية الفترة",t,i,h)}
            ${w("زيادات رأس المال",d,0,0)}
            ${w("صافي ربح الفترة",0,e,0)}
            ${m!==0?w("مسحوبات / توزيعات خلال الفترة",0,0,m):""}
            ${w("رصيد نهاية الفترة",s,f,x,!0,"text-brand")}
          </tbody>
        </table>
      </div>
    </div>
  `}function _t(n,r,a){let t=0,d=0,i=0,p=0,h=0,m=0,e=0;for(const u of R){let E=0;for(const b of j)if((b.date||"")<=a)for(const y of b.lines||[])y.accountId!==u.id&&y.accountCode!==u.code||(E+=(y.debit||0)-(y.credit||0));if(u.type==="asset")d+=E,u.code?.startsWith("1-2")||u.code?.startsWith("1-3")||u.name?.includes("سيارات")||u.name?.includes("أثاث")||u.name?.includes("معدات")||(t+=E),u.code?.startsWith("1-1-4")&&(h+=E),(u.code?.startsWith("1-1-1-1")||u.code?.startsWith("1-1-1-3"))&&(m+=E),u.code?.startsWith("1-1-2")&&(e+=E);else if(u.type==="liability"){const b=-E;p+=b,u.code?.startsWith("2-2")||u.name?.includes("طويل")||(i+=b)}}const{revenueTotal:s,cogsTotal:f,opExpTotal:x,grossProfit:w,netProfit:v}=U(r,a),P=d-p,k=(u,E,b=!1,$=2)=>{if(!E||E===0)return"—";const y=u/E;return b?(y*100).toFixed(1)+"%":y.toFixed($)},z=[{group:"🏦 نسب السيولة (Liquidity)",items:[{label:"نسبة السيولة الجارية (Current Ratio)",val:k(t,i),note:"الأصول المتداولة ÷ الالتزامات المتداولة — المثالي ≥ 1.5",good:parseFloat(k(t,i))>=1.5},{label:"نسبة السيولة السريعة (Quick Ratio)",val:k(t-h,i),note:"(الأصول المتداولة - المخزون) ÷ الالتزامات المتداولة — المثالي ≥ 1.0",good:parseFloat(k(t-h,i))>=1},{label:"نسبة النقدية (Cash Ratio)",val:k(m,i),note:"النقدية فقط ÷ الالتزامات المتداولة",good:parseFloat(k(m,i))>=.2},{label:"رأس المال العامل (Working Capital)",val:o(t-i),note:"الأصول المتداولة — الالتزامات المتداولة",good:t-i>=0}]},{group:"📊 نسب الربحية (Profitability)",items:[{label:"هامش مجمل الربح (Gross Margin)",val:k(w,s,!0),note:"مجمل الربح ÷ المبيعات",good:parseFloat(k(w,s,!0))>=20},{label:"هامش صافي الربح (Net Margin)",val:k(v,s,!0),note:"صافي الربح ÷ المبيعات",good:parseFloat(k(v,s,!0))>=5},{label:"العائد على الأصول ROA",val:k(v,d,!0),note:"صافي الربح ÷ إجمالي الأصول",good:parseFloat(k(v,d,!0))>=5},{label:"العائد على حقوق الملكية ROE",val:k(v,P,!0),note:"صافي الربح ÷ حقوق الملكية",good:parseFloat(k(v,P,!0))>=10}]},{group:"⚙️ نسب الكفاءة (Efficiency)",items:[{label:"معدل دوران المخزون",val:k(f,h,!1,1)+"x",note:"تكلفة المباعة ÷ المخزون — كلما ارتفع كان أفضل",good:parseFloat(k(f,h,!1,1))>=4},{label:"معدل دوران الذمم المدينة",val:k(s,e,!1,1)+"x",note:"المبيعات ÷ الذمم المدينة",good:parseFloat(k(s,e,!1,1))>=6},{label:"نسبة التكلفة إلى الإيراد",val:k(f,s,!0),note:"COGS ÷ المبيعات — كلما انخفض كان أفضل",good:parseFloat(k(f,s,!0))<=70},{label:"نسبة المصروفات إلى الإيراد",val:k(x,s,!0),note:"المصاريف التشغيلية ÷ المبيعات",good:parseFloat(k(x,s,!0))<=15}]},{group:"🏗️ نسب الرفع المالي (Leverage)",items:[{label:"نسبة الديون إلى الأصول",val:k(p,d,!0),note:"الالتزامات ÷ الأصول — المثالي ≤ 50%",good:parseFloat(k(p,d,!0))<=50},{label:"نسبة الديون إلى حقوق الملكية",val:k(p,P,!1,2),note:"الالتزامات ÷ حقوق الملكية — المثالي ≤ 1.0",good:parseFloat(k(p,P))<=1},{label:"إجمالي الأصول",val:o(d),note:"مجموع الأصول المتداولة + الثابتة",good:!0},{label:"إجمالي الالتزامات",val:o(p),note:"مجموع الالتزامات المتداولة وطويلة الأجل",good:!0}]}];n.innerHTML=`
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("نسب التحليل المالي والربحية (Financial Ratios)",`الفترة من ${r} إلى ${a}`):""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>لوحة التحليل المالي والمؤشرات (Financial Ratios)</h2>
      <p class="dim">للفترة من ${r} إلى ${a}</p>
    </div>

    <!-- Summary Banner -->
    <div class="grid-4 gap-16 mb-28" style="max-width:1200px; margin:0 auto 28px;">
      ${[{label:"إجمالي الإيرادات",val:o(s),icon:"💰",color:"#22c55e"},{label:"مجمل الربح",val:o(w),icon:"📈",color:"#6366f1"},{label:"صافي الربح",val:o(v),icon:"🎯",color:v>=0?"#2dd4bf":"#ef4444"},{label:"إجمالي الأصول",val:o(d),icon:"🏛️",color:"#e58a2b"}].map(u=>`
        <div class="kpi-card">
          <div class="kpi-content">
            <div style="font-size:28px; margin-bottom:8px;">${u.icon}</div>
            <div class="kpi-label">${u.label}</div>
            <div class="kpi-value" style="color:${u.color}; font-size:20px;">${u.val}</div>
          </div>
        </div>`).join("")}
    </div>

    <!-- Ratio Groups -->
    <div style="max-width:1200px; margin:0 auto;">
      ${z.map(u=>`
        <div class="card mb-20" style="padding:24px;">
          <h3 style="color:var(--brand); margin-bottom:20px; font-family:var(--font-heading);">${u.group}</h3>
          <div class="grid-2 gap-16">
            ${u.items.map(E=>`
              <div style="background:var(--bg-2); border-radius:10px; padding:16px; border-left:4px solid ${E.good?"var(--good, #22c55e)":"var(--warn, #f59e0b)"};">
                <div style="font-size:12px; color:var(--text-2); margin-bottom:4px;">${E.label}</div>
                <div style="font-size:22px; font-weight:700; font-family:monospace; color:${E.good?"var(--good, #22c55e)":"var(--warn, #f59e0b)"};">${E.val}</div>
                <div style="font-size:11px; color:var(--text-2); margin-top:6px;">${E.note}</div>
              </div>`).join("")}
          </div>
        </div>`).join("")}
    </div>
  `}function Dt(n,r){const a=String(n||"");return a.startsWith("5-2-6")||a.startsWith("5-2-1")||a.startsWith("5-2-2")||a.startsWith("5-2-3")?{type:"fixed_salary",label:"🛡️ ثابتة (أجور ورواتب)",isCoreFixed:!0,isCash:!0,badgeBg:"rgba(59,130,246,0.12)",badgeColor:"#1d4ed8"}:a.startsWith("5-4-1")?{type:"fixed_rent",label:"🛡️ ثابتة (إيجارات)",isCoreFixed:!0,isCash:!0,badgeBg:"rgba(59,130,246,0.12)",badgeColor:"#1d4ed8"}:a.startsWith("5-6")?{type:"depreciation",label:"📉 ثابتة دفترياً (إهلاكات)",isCoreFixed:!0,isCash:!1,badgeBg:"rgba(100,116,139,0.15)",badgeColor:"#475569"}:a.startsWith("5-3-3")?{type:"mixed_fuel",label:"⚡ شبه متغيرة (ديزل ومحروقات)",isCoreFixed:!1,isCash:!0,badgeBg:"rgba(245,158,11,0.12)",badgeColor:"#b45309"}:a.startsWith("5-3-2")?{type:"mixed_maint",label:"⚡ شبه متغيرة (صيانة وإصلاح)",isCoreFixed:!1,isCash:!0,badgeBg:"rgba(245,158,11,0.12)",badgeColor:"#b45309"}:a.startsWith("5-4-7")||a.startsWith("5-4-8")||a.startsWith("5-4-3")?{type:"amortized",label:"📅 دورية سنوية (إقامات ورخص)",isCoreFixed:!1,isCash:!0,badgeBg:"rgba(168,85,247,0.12)",badgeColor:"#7e22ce"}:{type:"operating",label:"🏷️ مصاريف تشغيلية",isCoreFixed:!1,isCash:!0,badgeBg:"rgba(15,23,42,0.08)",badgeColor:"var(--text-2)"}}function dt(n,r,a=null){const t=U(n,r),{grossRevenue:d,revenueTotal:i,cogsTotal:p,opExpTotal:h,expItems:m,grossProfit:e,netProfit:s}=t,f=new Date(n+"T00:00:00"),x=new Date(r+"T00:00:00"),w=Math.max(1,Math.round((x-f)/864e5)+1),v=e,P=i>0?v/i:0,k=P*100,z=a?new Set(a):null,u=(m||[]).map(S=>{const M=Dt(S.code,S.name),B=z?z.has(S.code):!0;return{...S,...M,isSelected:B}}),E=u.filter(S=>S.isSelected),b=E.reduce((S,M)=>S+(M.balance||0),0),$=h-b,y=P>0?b/P:0,T=w>0?y/w:0,l=w>0?i/w:0,c=i-y,C=i>0?(i-y)/i*100:0,I=l>0?Math.round(y/l):null,g=[...u].sort((S,M)=>M.balance-S.balance).map(S=>{const M=b>0&&S.isSelected?S.balance/b*100:0,B=h>0?S.balance/h*100:0,_=P>0?S.balance/P:0;return{...S,pctOfSelected:M,pctOfTotal:B,salesNeeded:_}});return{from:n,to:r,days:w,grossRevenue:d,revenueTotal:i,cogsTotal:p,opExpTotal:h,grossProfit:e,netProfit:s,contributionMargin:v,cmRatio:P,cmPct:k,fixedCosts:b,unselectedCosts:$,selectedCount:E.length,totalCount:u.length,breakEvenSales:y,dailyBreakEven:T,dailyActual:l,marginOfSafetyVal:c,marginOfSafetyPct:C,breakEvenDay:I,sortedExp:g}}window.exportBreakEvenExcel=(n,r)=>{const a=dt(n,r,window._beSelectedExpenseCodes),t=[];t.push(["تقرير تحليل نقطة التعادل والتحليل الحجمي (CVP) وسيناريوهات الأرباح ونسب الهوامش — شركة نظم الإمداد الحديثة"]),t.push([`الفترة من: ${n} إلى: ${r} (${a.days} يوماً)`]),t.push([]),t.push(["المؤشر المالي","القيمة","الوحدة / النسبة"]),t.push(["صافي الإيرادات والمبيعات الفعلية",a.revenueTotal,"ر.س"]),t.push(["تكلفة البضاعة المباعة (التكلفة المتغيرة)",a.cogsTotal,"ر.س"]),t.push(["هامش المساهمة (مجمل الربح)",a.grossProfit,"ر.س"]),t.push(["نسبة هامش المساهمة الفعلي (Contribution Margin %)",a.cmPct.toFixed(2)+"%","%"]),t.push(["المصروفات المحددة للتعادل",a.fixedCosts,"ر.س"]),t.push(["إجمالي المصروفات الكلية بالدفاتر",a.opExpTotal,"ر.س"]),t.push(["نقطة التعادل بالمبيعات (Break-Even Sales)",a.breakEvenSales,"ر.س"]),t.push(["المعدل اليومي المطلوب للتعادل",a.dailyBreakEven,"ر.س / يوم"]),t.push(["المعدل اليومي الفعلي للمبيعات",a.dailyActual,"ر.س / يوم"]),t.push(["هامش الأمان (Margin of Safety)",a.marginOfSafetyVal,"ر.س"]),t.push(["نسبة هامش الأمان",a.marginOfSafetyPct.toFixed(2)+"%","%"]),t.push(["صافي الربح الفعلي بالفترة",a.netProfit,"ر.س"]),t.push([]);const d=[{label:`الفعلي (${a.cmPct.toFixed(1)}%)`,val:a.cmRatio},{label:"8.0%",val:.08},{label:"10.0%",val:.1},{label:"12.0%",val:.12},{label:"15.0%",val:.15},{label:"18.0%",val:.18},{label:"20.0%",val:.2},{label:"25.0%",val:.25}];t.push(["مصفوفة المبيعات المطلوبة عند مختلف الأرباح ونسب هوامش الربح:"]),t.push(["صافي الربح المستهدف",...d.map(i=>`عند هامش ${i.label}`)]),[0,5e3,1e4,15e3,2e4,25e3,3e4,4e4,5e4,75e3,1e5].forEach(i=>{const p=[i===0?"0 (نقطة التعادل)":i];d.forEach(h=>{const m=h.val>0?(a.fixedCosts+i)/h.val:0;p.push(m)}),t.push(p)}),t.push([]),t.push(["تفكيك المصروفات وحالة التحديد:","كود الحساب","اسم المصروف","التصنيف","المبلغ (ر.س)","حالة التحديد","المبيعات اللازمة لتغطيته"]),a.sortedExp.forEach(i=>{t.push(["مصروف",i.code,i.name,i.label,i.balance,i.isSelected?"محدد ومدرج":"مستبعد",i.salesNeeded])}),gt(t)};window.printBreakEvenPDF=async(n,r)=>{const a=dt(n,r,window._beSelectedExpenseCodes),{revenueTotal:t,cogsTotal:d,fixedCosts:i,opExpTotal:p,grossProfit:h,netProfit:m,cmPct:e,cmRatio:s,breakEvenSales:f,dailyBreakEven:x,dailyActual:w,marginOfSafetyPct:v,marginOfSafetyVal:P,sortedExp:k,days:z,selectedCount:u,totalCount:E}=a;let b={name:"شركة نظم الإمداد الحديثة",vatNumber:"312448150500003",crNumber:"4700123180",phone:"0549141648",email:"Nuzmalamdad@gmail.com",address:"7480 - الشارع: عامر الشعبي، ينبع",logoUrl:""};try{const l=JSON.parse(localStorage.getItem("idham_company")||"{}");l.name&&Object.assign(b,l),l.logoBase64&&(b.logoUrl=l.logoBase64)}catch{}const $=m>=0,y=[{label:`الفعلي (${e.toFixed(1)}%)`,val:s},{label:"10%",val:.1},{label:"15%",val:.15},{label:"20%",val:.2},{label:"25%",val:.25}],T=window.open("","_blank");if(!T){showToast("يرجى السماح بالنوافذ المنبثقة للطباعة","warn");return}T.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تقرير تحليل نقطة التعادل والأرباح المستهدفة CVP — ${n} إلى ${r}</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'IBM Plex Sans Arabic', sans-serif; direction: rtl; color: #1e293b; background: #f8fafc; padding: 12px; }
    .no-print { background: #1e293b; padding: 10px; display: flex; gap: 10px; justify-content: center; margin-bottom: 12px; border-radius: 8px; }
    .btn { padding: 8px 18px; border-radius: 6px; cursor: pointer; border: none; font-family: inherit; font-size: 13px; font-weight: 700; }
    .report-container { background: #fff; max-width: 210mm; margin: 0 auto; padding: 18px 22px; border: 1.5px solid #5b3ec2; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .company-banner { background: #5b3ec2 !important; color: #fff !important; border-radius: 8px; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .banner-left { font-size: 11.5px; line-height: 1.5; color: #fff !important; }
    .banner-right h2 { font-size: 16px; font-weight: 800; margin-bottom: 3px; color: #fff !important; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
    .kpi-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; text-align: center; background: #f8fafc; }
    .kpi-box .lbl { font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px; }
    .kpi-box .val { font-size: 15px; font-weight: 900; font-family: 'IBM Plex Mono', monospace; }
    .sec-title { background: #5b3ec2 !important; color: #fff !important; font-size: 12px; font-weight: 800; padding: 6px 12px; border-radius: 6px 6px 0 0; margin-top: 14px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11px; border: 1px solid #5b3ec2; border-top: none; }
    thead tr { background: #f1f5f9; border-bottom: 1px solid #cbd5e1; }
    thead th { padding: 6px 8px; font-weight: 700; color: #334155; text-align: right; }
    tbody tr { border-bottom: 1px solid #e2e8f0; }
    tbody tr:nth-child(even) { background: #fcfcfd; }
    tbody td { padding: 6px 8px; color: #1e293b; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 25px; padding-top: 15px; border-top: 1px dashed #5b3ec2; text-align: center; }
    .signatures .role { font-size: 11px; font-weight: 800; color: #334155; margin-bottom: 35px; }
    .signatures .line { border-top: 1px dotted #94a3b8; width: 110px; margin: 0 auto; font-size: 10px; color: #64748b; padding-top: 3px; }
    @page { size: A4; margin: 8mm 10mm 8mm 10mm; }
    @media print {
      body { background: #fff; padding: 0; }
      .no-print { display: none !important; }
      .report-container { max-width: 100%; box-shadow: none; border: none; padding: 0; }
      .company-banner { background: #5b3ec2 !important; color: #fff !important; }
      .sec-title { background: #5b3ec2 !important; color: #fff !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn" style="background:#5b3ec2;color:#fff;" onclick="window.print()">🖨️ طباعة التقرير</button>
    <button class="btn" style="background:#475569;color:#fff;" onclick="window.close()">✕ إغلاق</button>
  </div>

  <div class="report-container">
    <div style="text-align:center; margin-bottom:12px;">
      <h1 style="font-size:20px; color:#5b3ec2; font-weight:800;">تقرير تحليل نقطة التعادل والتحليل الحجمي للأرباح (CVP)</h1>
      <h2 style="font-size:10px; color:#5b3ec2; font-weight:700; letter-spacing:1px; text-transform:uppercase;">BREAK-EVEN POINT & PROFIT MARGIN SENSITIVITY</h2>
    </div>

    <div class="company-banner">
      <div class="banner-left">
        <div>الفترة المالية: <strong>من ${n} إلى ${r} (${z} يوماً)</strong></div>
        <div>تاريخ الإصدار: <strong>${new Date().toLocaleDateString("ar-SA")}</strong></div>
        <div>نقطة التعادل للمصروفات المحددة: <strong>${o(f)}</strong></div>
      </div>
      <div class="banner-right">
        <h2>${b.name}</h2>
        <div>الرقم الضريبي: <strong>${b.vatNumber}</strong></div>
        <div>السجل التجاري: <strong>${b.crNumber}</strong></div>
      </div>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-box" style="border-color:#3b82f6; background:#eff6ff;">
        <div class="lbl">مبيعات نقطة التعادل</div>
        <div class="val" style="color:#1d4ed8;" dir="ltr">${o(f)}</div>
      </div>
      <div class="kpi-box" style="border-color:#6366f1; background:#eef2ff;">
        <div class="lbl">الهدف اليومي للتعادل</div>
        <div class="val" style="color:#4338ca;" dir="ltr">${o(x)}</div>
      </div>
      <div class="kpi-box" style="border-color:#f59e0b; background:#fefce8;">
        <div class="lbl">نسبة هامش المساهمة</div>
        <div class="val" style="color:#b45309;" dir="ltr">${e.toFixed(1)}%</div>
      </div>
      <div class="kpi-box" style="border-color:${$?"#22c55e":"#ef4444"}; background:${$?"#f0fdf4":"#fef2f2"};">
        <div class="lbl">هامش الأمان فوق التعادل</div>
        <div class="val" style="color:${$?"#15803d":"#b91c1c"};" dir="ltr">${v.toFixed(1)}%</div>
      </div>
    </div>

    <!-- CVP Summary Table -->
    <div class="sec-title">أولاً: ملخص معادلة التعادل للفترة (CVP Summary)</div>
    <table>
      <thead>
        <tr>
          <th>البند المالي</th>
          <th style="width:130px; text-align:left;">المبلغ (ر.س)</th>
          <th style="width:90px; text-align:center;">النسبة</th>
          <th>ملاحظات وتفسير إداري</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>صافي المبيعات والإيرادات</strong></td>
          <td style="font-family:'IBM Plex Mono',monospace; font-weight:700; text-align:left;" dir="ltr">${o(t)}</td>
          <td style="text-align:center; font-weight:700;">100.0%</td>
          <td style="font-size:10.5px; color:#475569;">إجمالي الإيرادات بعد خصم المردودات</td>
        </tr>
        <tr>
          <td><strong>يخصم: التكاليف المتغيرة المباشرة (COGS)</strong></td>
          <td style="font-family:'IBM Plex Mono',monospace; font-weight:700; text-align:left; color:#b45309;" dir="ltr">(${o(d)})</td>
          <td style="text-align:center; font-weight:700; color:#b45309;">${t>0?(d/t*100).toFixed(1):0}%</td>
          <td style="font-size:10.5px; color:#475569;">تكلفة شراء البضاعة المباعة فقط</td>
        </tr>
        <tr style="background:#eef2ff; font-weight:800;">
          <td style="color:#4338ca;"><strong>هامش المساهمة (مجمل الربح)</strong></td>
          <td style="font-family:'IBM Plex Mono',monospace; text-align:left; color:#4338ca;" dir="ltr">${o(h)}</td>
          <td style="text-align:center; color:#4338ca;">${e.toFixed(1)}%</td>
          <td style="font-size:10.5px; color:#4338ca;">المبلغ المتاح لتغطية المصروفات الثابتة والأرباح</td>
        </tr>
        <tr>
          <td><strong>يخصم: المصروفات المحددة في الحسبة</strong></td>
          <td style="font-family:'IBM Plex Mono',monospace; font-weight:700; text-align:left; color:#dc2626;" dir="ltr">(${o(i)})</td>
          <td style="text-align:center; font-weight:700; color:#dc2626;">${t>0?(i/t*100).toFixed(1):0}%</td>
          <td style="font-size:10.5px; color:#475569;">المحدد: ${u} من أصل ${E} بند مصروف</td>
        </tr>
        <tr style="background:${$?"#f0fdf4":"#fef2f2"}; font-weight:900;">
          <td style="color:${$?"#15803d":"#b91c1c"};"><strong>النتيجة النهائية للفترة</strong></td>
          <td style="font-family:'IBM Plex Mono',monospace; text-align:left; color:${$?"#15803d":"#b91c1c"};" dir="ltr">${o(m)}</td>
          <td style="text-align:center; color:${$?"#15803d":"#b91c1c"};">${t>0?(m/t*100).toFixed(1):0}%</td>
          <td style="font-size:10.5px; color:${$?"#15803d":"#b91c1c"};">${$?"تحقيق أرباح تفوق نقطة التعادل":"عجز دون نقطة التعادل بالفترة"}</td>
        </tr>
      </tbody>
    </table>

    <!-- 2D Cross Sensitivity Matrix Table -->
    <div class="sec-title">ثانياً: مصفوفة المبيعات المطلوبة عند مختلف الأرباح وهوامش الربح (2D Sensitivity Matrix)</div>
    <table>
      <thead>
        <tr>
          <th>صافي الربح المستهدف</th>
          ${y.map(l=>`<th style="text-align:left;">هامش ${l.label}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${[{label:"0 ر.س (نقطة التعادل)",profit:0},{label:"10,000 ر.س",profit:1e4},{label:"20,000 ر.س",profit:2e4},{label:"30,000 ر.س",profit:3e4},{label:"50,000 ر.س",profit:5e4},{label:"100,000 ر.س",profit:1e5}].map(l=>`
          <tr>
            <td><strong>${l.label}</strong></td>
            ${y.map(c=>{const C=c.val>0?(i+l.profit)/c.val:0;return`<td style="font-family:'IBM Plex Mono',monospace; font-weight:700; text-align:left;" dir="ltr">${o(C)}</td>`}).join("")}
          </tr>
        `).join("")}
      </tbody>
    </table>

    <!-- Expense Breakdown Table -->
    <div class="sec-title">ثالثاً: تفكيك المصروفات وحالة التحديد</div>
    <table>
      <thead>
        <tr>
          <th style="width:40px; text-align:center;">الحالة</th>
          <th style="width:90px;">كود الحساب</th>
          <th>اسم المصروف</th>
          <th style="width:120px;">التصنيف</th>
          <th style="width:110px; text-align:left;">المبلغ الفعلي</th>
          <th style="width:130px; text-align:left;">المبيعات لتغطيته</th>
        </tr>
      </thead>
      <tbody>
        ${k.map(l=>`
          <tr style="${l.isSelected?"":"opacity:0.6; background:#f8fafc;"}">
            <td style="text-align:center; font-weight:bold;">${l.isSelected?"☑️":"◻️"}</td>
            <td style="font-family:'IBM Plex Mono',monospace; font-weight:700; color:#64748b;">${l.code}</td>
            <td style="font-weight:700;">${l.name} ${l.isSelected?"":'<span style="font-size:9.5px; color:#94a3b8;">(مستبعد)</span>'}</td>
            <td style="font-size:10px; color:#475569;">${l.label}</td>
            <td style="font-family:'IBM Plex Mono',monospace; text-align:left; color:#dc2626;" dir="ltr">${o(l.balance)}</td>
            <td style="font-family:'IBM Plex Mono',monospace; text-align:left; font-weight:700; color:#4338ca;" dir="ltr">${o(l.salesNeeded)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <!-- Signatures -->
    <div class="signatures">
      <div>
        <div class="role">إعداد / التحليل المالي</div>
        <div class="line">التوقيع</div>
      </div>
      <div>
        <div class="role">مراجعة / الإدارة المالية</div>
        <div class="line">التوقيع</div>
      </div>
      <div>
        <div class="role">اعتماد / المدير العام</div>
        <div class="line">الختم والتوقيع</div>
      </div>
    </div>
  </div>
</body>
</html>`),T.document.close()};function it(n,r,a){window._beCurrentContainer=n,window._beCurrentFrom=r,window._beCurrentTo=a;const t=dt(r,a,null);(!window._beSelectedExpenseCodes||!(window._beSelectedExpenseCodes instanceof Set))&&(window._beSelectedExpenseCodes=new Set((t.sortedExp||[]).map(c=>c.code)));const d=dt(r,a,window._beSelectedExpenseCodes),{revenueTotal:i,cogsTotal:p,fixedCosts:h,unselectedCosts:m,opExpTotal:e,grossProfit:s,netProfit:f,cmPct:x,cmRatio:w,breakEvenSales:v,dailyBreakEven:P,dailyActual:k,marginOfSafetyPct:z,marginOfSafetyVal:u,sortedExp:E,days:b,selectedCount:$,totalCount:y}=d,T=i>=v;typeof window._beTargetProfitVal>"u"&&(window._beTargetProfitVal=2e4),typeof window._beTargetMarginVal>"u"&&(window._beTargetMarginVal=parseFloat(x.toFixed(1))||15);const l=[{label:`الفعلي (${x.toFixed(1)}%)`,val:w,isActual:!0},{label:"8.0%",val:.08},{label:"10.0%",val:.1},{label:"12.0%",val:.12},{label:"15.0%",val:.15},{label:"18.0%",val:.18},{label:"20.0%",val:.2},{label:"25.0%",val:.25}];n.innerHTML=`
    <!-- Top Action Toolbar -->
    <div class="no-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; background:var(--bg-1); padding:12px 18px; border-radius:12px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); flex-wrap:wrap; gap:10px;">
      <div style="font-size:13px; font-weight:700; color:var(--text-2);">
        🎯 <strong style="color:var(--text-1);">تحليل نقطة التعادل والتحليل الحجمي للأرباح والتكاليف (CVP)</strong> | الفترة: <strong>${r}</strong> → <strong>${a}</strong> (${b} يوماً)
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="exportBreakEvenExcel('${r}', '${a}')" style="font-weight:700;">📊 تصدير Excel</button>
        <button class="btn btn-primary btn-sm" onclick="printBreakEvenPDF('${r}', '${a}')" style="font-weight:700; background:linear-gradient(135deg, #5b3ec2, #4338ca); border:none; box-shadow:0 2px 6px rgba(91,62,194,0.3);">📑 تصدير PDF التقرير التنفيذي للتعادل</button>
      </div>
    </div>

    <div class="breakeven-doc" style="max-width:1150px; margin:0 auto;">

      <!-- ═══ 4 TOP KPI CARDS ═══ -->
      <div class="grid-4 gap-16 mb-24" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:16px; margin-bottom:24px;">
        
        <!-- Break-Even Sales -->
        <div class="kpi-card" style="background:linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02)); border:1.5px solid rgba(59,130,246,0.3); border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:#1d4ed8;">🎯 مبيعات نقطة التعادل</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:rgba(59,130,246,0.15); color:#1d4ed8;">Break-Even</span>
          </div>
          <div style="font-size:22px; font-weight:900; color:#1d4ed8; font-family:'IBM Plex Mono', monospace;" dir="ltr">
            ${o(v)}
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">لتغطية المصروفات المحددة (<strong class="mono">${o(h)}</strong>)</div>
        </div>

        <!-- Daily Target -->
        <div class="kpi-card" style="background:linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02)); border:1.5px solid rgba(99,102,241,0.3); border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:#4338ca;">📅 الهدف اليومي للتعادل</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:rgba(99,102,241,0.15); color:#4338ca;">Daily Target</span>
          </div>
          <div style="font-size:22px; font-weight:900; color:#4338ca; font-family:'IBM Plex Mono', monospace;" dir="ltr">
            ${o(P)}
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">الفعلي اليومي: <strong class="mono" dir="ltr">${o(k)}</strong></div>
        </div>

        <!-- Contribution Margin % -->
        <div class="kpi-card" style="background:linear-gradient(135deg, rgba(217,119,6,0.08), rgba(217,119,6,0.02)); border:1.5px solid rgba(217,119,6,0.3); border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:#b45309;">📈 نسبة هامش المساهمة</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:rgba(217,119,6,0.15); color:#b45309;">CM Ratio</span>
          </div>
          <div style="font-size:22px; font-weight:900; color:#b45309; font-family:'IBM Plex Mono', monospace;" dir="ltr">
            ${x.toFixed(1)}%
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">مجمل الربح: <strong class="mono" dir="ltr">${o(s)}</strong></div>
        </div>

        <!-- Margin of Safety -->
        <div class="kpi-card" style="background:${T?"linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02))":"linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.02))"}; border:1.5px solid ${T?"rgba(16,185,129,0.4)":"rgba(239,68,68,0.4)"}; border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:${T?"#047857":"#b91c1c"};">🛡️ هامش الأمان (Safety)</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:${T?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.15)"}; color:${T?"#047857":"#b91c1c"};">${z.toFixed(1)}%</span>
          </div>
          <div style="font-size:22px; font-weight:900; color:${T?"#047857":"#b91c1c"}; font-family:'IBM Plex Mono', monospace;" dir="ltr">
            ${o(u)}
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">${T?"فائض أمان فوق التعادل":"عجز دون نقطة التعادل"}</div>
        </div>

      </div>

      <!-- ═══ EXECUTIVE SUMMARY STRIP ═══ -->
      <div class="card mb-24" style="border-radius:14px; padding:18px 24px; background:linear-gradient(135deg, rgba(91,62,194,0.08), rgba(91,62,194,0.02)); border:1.5px solid rgba(91,62,194,0.25); margin-bottom:24px;">
        <h4 style="color:#5b3ec2; margin-bottom:8px; font-size:15px; font-weight:900;">📋 التقرير والتشخيص التنفيذي:</h4>
        <div style="font-size:13px; line-height:1.7; color:var(--text-1);">
          • إجمالي المصروفات المحددة في الحسبة: <strong style="color:#dc2626;">${o(h)}</strong> (تم تحديد <strong>${$}</strong> من أصل <strong>${y}</strong> بند مصروف).<br>
          • نسبة هامش الربح الإجمالي الفعلي (هامش المساهمة) تمثل <strong>${x.toFixed(1)}%</strong> من قيمة المبيعات.<br>
          • بناءً على ذلك، نقطة التعادل المطلوبة لتغطية المصروفات المحددة هي <strong style="color:#1d4ed8;">${o(v)}</strong> (بمعدل <strong>${o(P)}</strong> يومياً).<br>
          • ${T?`<span style="color:#16a34a; font-weight:700;">✅ المبيعات الحالية (${o(i)}) تجاوزت نقطة التعادل بفائض قدره ${o(u)} (هامش أمان ${z.toFixed(1)}%).</span>`:`<span style="color:#dc2626; font-weight:700;">⚠️ المبيعات الحالية (${o(i)}) دون نقطة التعادل بفارق ${o(Math.abs(u))}. لتحقيق الربحية ينصح برفع هامش الربح أو زيادة حجم التوزيع أو تقسيط المصروفات السنوية.</span>`}
        </div>
      </div>

      <!-- ═══ 1. TARGET PROFIT & MARGIN SENSITIVITY (قسم الأرباح ونسب الهوامش المستهدفة) ═══ -->
      <div class="card mb-24" style="border-radius:16px; border:1.5px solid #0284c7; box-shadow:0 4px 14px rgba(2,132,199,0.12); padding:24px; background:var(--bg-1); margin-bottom:24px;">
        
        <div style="border-bottom:2px solid #0284c7; padding-bottom:12px; margin-bottom:18px;">
          <h4 style="margin:0; font-size:17px; font-weight:900; color:#0284c7;">🎯 حاسبة وسيناريوهات تحقيق الأرباح عند مختلف نسب هوامش الربح</h4>
          <p style="margin:3px 0 0; font-size:12px; color:var(--text-3);">جرب تغيير صافي الربح المطلوب ونسبة هامش الربح لمشاهدة تأثيرهما المباشر على المبيعات المطلوبة والهدف اليومي</p>
        </div>

        <!-- 2 Controls: Target Profit & Assumed Margin % -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
          
          <!-- Control 1: Target Net Profit -->
          <div style="background:rgba(2,132,199,0.04); padding:16px; border-radius:12px; border:1px solid rgba(2,132,199,0.2);">
            <label style="font-size:12.5px; font-weight:800; color:#0369a1; display:block; margin-bottom:6px;">💰 صافي الربح المستهدف للفترة (ر.س):</label>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <input type="number" id="be-target-profit-input" class="input mono font-bold" value="${window._beTargetProfitVal}" step="1000" min="0" oninput="updateTargetProfitCalc()" style="font-size:18px; color:#0369a1; height:40px; width:100%; border:2px solid #0284c7; border-radius:8px; padding:0 12px;" />
              <span style="font-weight:800; font-size:13px; color:var(--text-2);">ر.س</span>
            </div>
            
            <!-- Quick Profit Presets -->
            <div style="display:flex; gap:4px; flex-wrap:wrap;">
              <button class="btn btn-sm btn-ghost" onclick="setTargetProfitPreset(0)" style="font-size:10.5px; padding:2px 6px;">0 (تعادل)</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetProfitPreset(5000)" style="font-size:10.5px; padding:2px 6px;">+5K</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetProfitPreset(10000)" style="font-size:10.5px; padding:2px 6px;">+10K</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetProfitPreset(20000)" style="font-size:10.5px; padding:2px 6px; color:#0284c7; font-weight:800; border:1px solid #0284c7;">⭐ +20K</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetProfitPreset(30000)" style="font-size:10.5px; padding:2px 6px; color:#0284c7; font-weight:800; border:1px solid #0284c7;">⭐ +30K</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetProfitPreset(50000)" style="font-size:10.5px; padding:2px 6px;">+50K</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetProfitPreset(100000)" style="font-size:10.5px; padding:2px 6px;">+100K</button>
            </div>
          </div>

          <!-- Control 2: Assumed Profit Margin % -->
          <div style="background:rgba(217,119,6,0.04); padding:16px; border-radius:12px; border:1px solid rgba(217,119,6,0.25);">
            <label style="font-size:12.5px; font-weight:800; color:#b45309; display:block; margin-bottom:6px;">📈 نسبة مجمل الربح المفترضة (Gross Margin %):</label>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <input type="number" id="be-target-margin-input" class="input mono font-bold" value="${window._beTargetMarginVal}" step="0.5" min="1" max="99" oninput="updateTargetProfitCalc()" style="font-size:18px; color:#b45309; height:40px; width:100%; border:2px solid #d97706; border-radius:8px; padding:0 12px;" />
              <span style="font-weight:800; font-size:15px; color:#b45309;">%</span>
            </div>
            
            <!-- Quick Margin Presets -->
            <div style="display:flex; gap:4px; flex-wrap:wrap;">
              <button class="btn btn-sm btn-ghost" onclick="setTargetMarginPreset(${x.toFixed(1)})" style="font-size:10.5px; padding:2px 6px; color:#5b3ec2; font-weight:800; border:1px solid #5b3ec2;">الفعلي (${x.toFixed(1)}%)</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetMarginPreset(8)" style="font-size:10.5px; padding:2px 6px;">8%</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetMarginPreset(10)" style="font-size:10.5px; padding:2px 6px;">10%</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetMarginPreset(12)" style="font-size:10.5px; padding:2px 6px;">12%</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetMarginPreset(15)" style="font-size:10.5px; padding:2px 6px;">15%</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetMarginPreset(18)" style="font-size:10.5px; padding:2px 6px;">18%</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetMarginPreset(20)" style="font-size:10.5px; padding:2px 6px;">20%</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetMarginPreset(25)" style="font-size:10.5px; padding:2px 6px;">25%</button>
              <button class="btn btn-sm btn-ghost" onclick="setTargetMarginPreset(30)" style="font-size:10.5px; padding:2px 6px;">30%</button>
            </div>
          </div>

        </div>

        <!-- Dynamic Output Metrics Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:20px;">
          
          <div style="background:var(--bg-2); padding:14px; border-radius:10px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm);">
            <div style="font-size:11px; font-weight:700; color:var(--text-3);">🚀 المبيعات الإجمالية المطلوبة:</div>
            <div class="mono font-bold" id="tp-res-sales" style="font-size:19px; color:#0284c7; margin:3px 0;" dir="ltr">0.00 ر.س</div>
            <div style="font-size:11px; color:var(--text-3);" id="tp-res-daily">0.00 ر.س / يومياً</div>
          </div>

          <div style="background:var(--bg-2); padding:14px; border-radius:10px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm);">
            <div style="font-size:11px; font-weight:700; color:var(--text-3);">⚖️ الفجوة عن المبيعات الحالية:</div>
            <div class="mono font-bold" id="tp-res-gap" style="font-size:19px; margin:3px 0;" dir="ltr">0.00 ر.س</div>
            <div style="font-size:11px; font-weight:700;" id="tp-res-status">جاري الاحتساب...</div>
          </div>

          <div style="background:var(--bg-2); padding:14px; border-radius:10px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm);">
            <div style="font-size:11px; font-weight:700; color:var(--text-3);">📈 نمو المبيعات المطلوب:</div>
            <div class="mono font-bold" id="tp-res-growth" style="font-size:19px; color:#4338ca; margin:3px 0;" dir="ltr">0%</div>
            <div style="font-size:11px; color:var(--text-3);" id="tp-res-net-margin">صافي الهامش: 0%</div>
          </div>

        </div>

        <!-- 2D Cross Matrix Table (الأرباح المستهدفة × نسب هوامش الربح المختلفة) -->
        <div style="margin-top:14px;">
          <div style="font-size:13px; font-weight:800; color:var(--text-1); margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
            <span>🧭 <strong>مصفوفة السيناريوهات المتقاطعة (الأرباح المستهدفة × نسب هوامش الربح):</strong></span>
            <span style="font-size:11px; color:var(--text-3);">توضح كيف تنخفض المبيعات المطلوبة بشدة كلما زادت نسبة هامش الربح</span>
          </div>

          <div class="table-container" style="max-height:320px; overflow:auto; border:1px solid var(--border-soft); border-radius:10px;">
            <table class="data-dense" style="width:100%; font-size:11.5px; border-collapse:collapse;">
              <thead>
                <tr style="background:var(--bg-2); position:sticky; top:0; z-index:2; border-bottom:1.5px solid var(--border-soft);">
                  <th style="min-width:130px; position:sticky; right:0; background:var(--bg-2); z-index:3;">صافي الربح المستهدف</th>
                  ${l.map(c=>`
                    <th style="text-align:left; min-width:115px; ${c.isActual?"background:rgba(91,62,194,0.12); color:#4338ca; font-weight:900;":""}">
                      هامش ${c.label}
                    </th>
                  `).join("")}
                </tr>
              </thead>
              <tbody>
                ${[{profit:0,label:"0 ر.س (نقطة التعادل)"},{profit:5e3,label:"5,000 ر.س"},{profit:1e4,label:"10,000 ر.س"},{profit:15e3,label:"15,000 ر.س"},{profit:2e4,label:"20,000 ر.س",isHighlight:!0},{profit:25e3,label:"25,000 ر.س"},{profit:3e4,label:"30,000 ر.س",isHighlight:!0},{profit:4e4,label:"40,000 ر.س"},{profit:5e4,label:"50,000 ر.س"},{profit:75e3,label:"75,000 ر.س"},{profit:1e5,label:"100,000 ر.س"}].map(c=>{const C=window._beTargetProfitVal===c.profit;return`
                    <tr style="border-bottom:1px solid var(--border-soft); ${C?"background:rgba(2,132,199,0.08); font-weight:800;":c.isHighlight?"background:rgba(91,62,194,0.03);":""}">
                      <td style="position:sticky; right:0; background:${C?"#f0f9ff":"var(--bg-1)"}; z-index:1; font-weight:800;">
                        ${c.label}
                        ${c.isHighlight?'<span style="font-size:9px; background:#5b3ec2; color:#fff; padding:1px 4px; border-radius:3px; margin-right:3px;">شائع</span>':""}
                      </td>
                      ${l.map(I=>{const g=I.val>0?(h+c.profit)/I.val:0,S=i>=g&&g>0,M=C&&Math.abs(I.val*100-window._beTargetMarginVal)<.2;return`
                          <td class="mono" style="text-align:left; ${I.isActual?"background:rgba(91,62,194,0.05); font-weight:800;":""} ${M?"outline:2px solid #0284c7; background:rgba(2,132,199,0.15); font-weight:900;":""}" dir="ltr">
                            <span style="color:${S?"#15803d":"#1e293b"}; font-weight:${S?"800":"600"};">
                              ${o(g)}
                            </span>
                            ${S?'<span style="color:#15803d; font-size:10px;"> ✅</span>':""}
                          </td>
                        `}).join("")}
                    </tr>
                  `}).join("")}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- ═══ 2. INTERACTIVE EXPENSES CHECKLIST TABLE (جدول تحديد المصروفات) ═══ -->
      <div class="card mb-24" style="border-radius:16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); padding:24px; background:var(--bg-1); margin-bottom:24px;">
        
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #dc2626; padding-bottom:12px; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
          <div>
            <h4 style="margin:0; font-size:16px; font-weight:900; color:#dc2626;">📊 تحديد وتفكيك المصروفات واحتساب نقطة التعادل</h4>
            <p style="margin:2px 0 0; font-size:11.5px; color:var(--text-3);">حدد بالمربعات ☑️ المصروفات التي ترغب بإدراجها في الحسبة (أو استبعد أي مصروف)، وسيقوم النظام فوراً بإعادة احتساب نقطة التعادل</p>
          </div>
          
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span style="font-size:11.5px; font-weight:800; color:#dc2626; background:rgba(220,38,38,0.1); padding:4px 10px; border-radius:8px;">
              المحدد: ${$} من ${y} بند | الإجمالي: ${o(h)}
            </span>
            ${m>0?`
              <span style="font-size:11.5px; font-weight:700; color:var(--text-3); background:var(--bg-2); padding:4px 8px; border-radius:8px;">
                مستبعد: ${o(m)}
              </span>
            `:""}
          </div>
        </div>

        <!-- Quick Filter Preset Buttons Bar -->
        <div style="display:flex; gap:8px; align-items:center; margin-bottom:14px; background:var(--bg-2); padding:10px 14px; border-radius:10px; border:1px solid var(--border-soft); flex-wrap:wrap;">
          <span style="font-size:12px; font-weight:800; color:var(--text-1); margin-left:6px;">🔘 فلاتر وتحديدات سريعة:</span>
          <button class="btn btn-sm" onclick="setBEPreset('all')" style="font-size:11.5px; font-weight:700; background:var(--bg-1); border:1px solid var(--border); cursor:pointer;">
            ☑️ تحديد الكل (الوضع الشامل)
          </button>
          <button class="btn btn-sm" onclick="setBEPreset('core_fixed')" style="font-size:11.5px; font-weight:700; background:rgba(59,130,246,0.1); color:#1d4ed8; border:1px solid rgba(59,130,246,0.3); cursor:pointer;">
            🛡️ المصروفات الثابتة فقط (رواتب + إيجارات + إهلاكات)
          </button>
          <button class="btn btn-sm" onclick="setBEPreset('cash_only')" style="font-size:11.5px; font-weight:700; background:rgba(16,185,129,0.1); color:#047857; border:1px solid rgba(16,185,129,0.3); cursor:pointer;">
            💵 المصروفات النقدية التشغيلية (بدون إهلاك)
          </button>
          <button class="btn btn-sm" onclick="setBEPreset('none')" style="font-size:11.5px; font-weight:700; background:var(--bg-1); color:#dc2626; border:1px solid var(--border); cursor:pointer;">
            ◻️ إلغاء التحديد
          </button>
        </div>

        <div class="table-container">
          <table class="data-dense" style="width:100%; font-size:12.5px;">
            <thead>
              <tr style="background:var(--bg-2); border-bottom:1.5px solid var(--border-soft);">
                <th style="width:45px; text-align:center;">
                  <input type="checkbox" id="be-master-check" ${$===y?"checked":""} onchange="toggleBEMasterCheck(this.checked)" style="cursor:pointer; width:16px; height:16px;" title="تحديد/إلغاء تحديد الكل" />
                </th>
                <th style="width:110px;">كود الحساب</th>
                <th>اسم المصروف / البند</th>
                <th style="width:180px;">التصنيف المحاسبي</th>
                <th style="width:130px; text-align:left;">المبلغ الفعلي (ر.س)</th>
                <th style="width:85px; text-align:center;">النسبة</th>
                <th style="width:160px; text-align:left;">المبيعات المطلوبة لتغطيته</th>
                <th style="width:130px; text-align:left;">المعدل اليومي</th>
              </tr>
            </thead>
            <tbody>
              ${E.map((c,C)=>`
                <tr style="border-bottom:1px solid var(--border-soft); ${c.isSelected?C%2===1?"background:rgba(0,0,0,0.015);":"":"opacity:0.5; background:var(--bg-2);"}">
                  <td style="text-align:center;">
                    <input type="checkbox" class="be-item-check" data-code="${c.code}" ${c.isSelected?"checked":""} onchange="toggleBEExpenseItem('${c.code}')" style="cursor:pointer; width:16px; height:16px;" />
                  </td>
                  <td class="mono font-bold" style="color:var(--text-3);">${c.code}</td>
                  <td style="font-weight:700; color:var(--text-1);">
                    ${c.name}
                    ${c.isSelected?"":'<span style="font-size:10px; color:#dc2626; margin-right:4px;">(مستبعد)</span>'}
                  </td>
                  <td>
                    <span style="font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:6px; background:${c.badgeBg}; color:${c.badgeColor};">
                      ${c.label}
                    </span>
                  </td>
                  <td class="mono font-bold" style="text-align:left; color:#dc2626;" dir="ltr">${o(c.balance)}</td>
                  <td style="text-align:center; font-weight:700; color:var(--text-2); font-size:11.5px;">
                    ${c.isSelected?c.pctOfSelected.toFixed(1)+"%":"—"}
                  </td>
                  <td class="mono font-bold" style="text-align:left; color:${c.isSelected?"#4338ca":"var(--text-3)"};" dir="ltr">
                    ${c.isSelected?o(c.salesNeeded):"—"}
                  </td>
                  <td class="mono dim" style="text-align:left; font-size:11.5px;" dir="ltr">
                    ${c.isSelected?o(c.salesNeeded/b):"—"}
                  </td>
                </tr>
              `).join("")}
            </tbody>
            <tfoot>
              <tr style="background:var(--bg-2); font-weight:900; border-top:2px solid var(--border);">
                <td style="text-align:center;">☑️</td>
                <td colspan="3">إجمالي المصروفات المحددة في نقطة التعادل</td>
                <td class="mono" style="text-align:left; color:#dc2626;" dir="ltr">${o(h)}</td>
                <td style="text-align:center;">100.0%</td>
                <td class="mono" style="text-align:left; color:#4338ca;" dir="ltr">${o(v)}</td>
                <td class="mono" style="text-align:left; color:#4338ca;" dir="ltr">${o(P)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- ═══ 3. INTERACTIVE DECISION & WHAT-IF SIMULATOR ═══ -->
      <div class="card mb-24" style="border-radius:16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); padding:24px; background:var(--bg-1); margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5b3ec2; padding-bottom:10px; margin-bottom:18px;">
          <div>
            <h4 style="margin:0; font-size:16px; font-weight:900; color:#5b3ec2;">🎛️ محاكي القرارات الإدارية وتوقعات التعادل (What-If Simulator)</h4>
            <p style="margin:2px 0 0; font-size:11.5px; color:var(--text-3);">جرب تغيير الهوامش والمصروفات لمشاهدة تأثيرها الفوري على نقطة التعادل والأرباح المتوقعة</p>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="resetBESimulator()" style="font-size:11px;">🔄 إعادة ضبط</button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:20px; margin-bottom:20px;">
          
          <!-- Slider 1: Margin % -->
          <div style="background:var(--bg-2); padding:14px; border-radius:10px; border:1px solid var(--border-soft);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <label style="font-weight:800; font-size:12px; color:var(--text-1);">هامش الربح المتوقع (CM %)</label>
              <span class="mono font-bold" id="sim-cm-val" style="color:#b45309; font-size:14px;">${x.toFixed(1)}%</span>
            </div>
            <input type="range" id="sim-cm-slider" min="3" max="40" step="0.5" value="${x.toFixed(1)}" oninput="updateBESimulator()" style="width:100%; cursor:pointer;" />
            <div style="font-size:10px; color:var(--text-3); display:flex; justify-content:space-between; margin-top:2px;">
              <span>3%</span><span>15%</span><span>25%</span><span>40%</span>
            </div>
          </div>

          <!-- Slider 2: Fixed Cost Adj % -->
          <div style="background:var(--bg-2); padding:14px; border-radius:10px; border:1px solid var(--border-soft);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <label style="font-weight:800; font-size:12px; color:var(--text-1);">تعديل المصاريف المحددة</label>
              <span class="mono font-bold" id="sim-exp-adj-val" style="color:#dc2626; font-size:14px;">0%</span>
            </div>
            <input type="range" id="sim-exp-slider" min="-50" max="50" step="5" value="0" oninput="updateBESimulator()" style="width:100%; cursor:pointer;" />
            <div style="font-size:10px; color:var(--text-3); display:flex; justify-content:space-between; margin-top:2px;">
              <span>-50% (ترشيد)</span><span>0% (الحالي)</span><span>+50% (توسع)</span>
            </div>
          </div>

          <!-- Input 3: Target Profit Simulator -->
          <div style="background:var(--bg-2); padding:14px; border-radius:10px; border:1px solid var(--border-soft);">
            <label style="font-weight:800; font-size:12px; color:var(--text-1); display:block; margin-bottom:6px;">صافي الربح المستهدف (ر.س)</label>
            <input type="number" id="sim-target-profit" class="input mono font-bold" value="${window._beTargetProfitVal}" step="1000" min="0" oninput="updateBESimulator()" style="width:100%; height:34px;" />
            <div style="font-size:10px; color:var(--text-3); margin-top:4px;">حدد الربح المطلوب لمعرفة المبيعات اللازمة</div>
          </div>

        </div>

        <!-- Simulator Result Cards -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; background:linear-gradient(135deg, rgba(91,62,194,0.12), rgba(91,62,194,0.03)); padding:18px; border-radius:12px; border:1.5px solid #5b3ec2;">
          
          <div>
            <div style="font-size:11.5px; font-weight:700; color:#5b3ec2; margin-bottom:4px;">🎯 نقطة التعادل المحاكاة:</div>
            <div class="mono font-bold" id="sim-res-be" style="font-size:20px; color:#1d4ed8;" dir="ltr">${o(v)}</div>
            <div style="font-size:11px; color:var(--text-3);" id="sim-res-be-daily">${o(P)} / يومياً</div>
          </div>

          <div>
            <div style="font-size:11.5px; font-weight:700; color:#5b3ec2; margin-bottom:4px;">🚀 المبيعات لتحقيق الربح المستهدف:</div>
            <div class="mono font-bold" id="sim-res-target-sales" style="font-size:20px; color:#4338ca;" dir="ltr">0.00 ر.س</div>
            <div style="font-size:11px; color:var(--text-3);" id="sim-res-target-daily">0.00 ر.س / يومياً</div>
          </div>

          <div>
            <div style="font-size:11.5px; font-weight:700; color:#5b3ec2; margin-bottom:4px;">🏆 الربح المتوقع عند المبيعات الحالية:</div>
            <div class="mono font-bold" id="sim-res-profit" style="font-size:20px; color:#15803d;" dir="ltr">${o(f)}</div>
            <div style="font-size:11px; color:var(--text-3);" id="sim-res-profit-margin">هامش صافي: 0%</div>
          </div>

        </div>
      </div>

    </div>
  `,window._beCurrentData=d,window.toggleBEExpenseItem=c=>{window._beSelectedExpenseCodes||(window._beSelectedExpenseCodes=new Set),window._beSelectedExpenseCodes.has(c)?window._beSelectedExpenseCodes.delete(c):window._beSelectedExpenseCodes.add(c);const C=window.scrollY||document.documentElement.scrollTop;it(window._beCurrentContainer,window._beCurrentFrom,window._beCurrentTo),window.scrollTo(0,C)},window.toggleBEMasterCheck=c=>{window._beSelectedExpenseCodes||(window._beSelectedExpenseCodes=new Set),c?window._beCurrentData.sortedExp.forEach(I=>window._beSelectedExpenseCodes.add(I.code)):window._beSelectedExpenseCodes.clear();const C=window.scrollY||document.documentElement.scrollTop;it(window._beCurrentContainer,window._beCurrentFrom,window._beCurrentTo),window.scrollTo(0,C)},window.setBEPreset=c=>{window._beSelectedExpenseCodes||(window._beSelectedExpenseCodes=new Set),window._beSelectedExpenseCodes.clear();const C=window._beCurrentData.sortedExp;c==="all"?C.forEach(g=>window._beSelectedExpenseCodes.add(g.code)):c==="core_fixed"?C.filter(g=>g.isCoreFixed).forEach(g=>window._beSelectedExpenseCodes.add(g.code)):c==="cash_only"&&C.filter(g=>g.isCash).forEach(g=>window._beSelectedExpenseCodes.add(g.code));const I=window.scrollY||document.documentElement.scrollTop;it(window._beCurrentContainer,window._beCurrentFrom,window._beCurrentTo),window.scrollTo(0,I)},window.setTargetProfitPreset=c=>{window._beTargetProfitVal=parseFloat(c)||0;const C=document.getElementById("be-target-profit-input");C&&(C.value=window._beTargetProfitVal);const I=document.getElementById("sim-target-profit");I&&(I.value=window._beTargetProfitVal),window.updateTargetProfitCalc(),window.updateBESimulator()},window.setTargetMarginPreset=c=>{window._beTargetMarginVal=parseFloat(c)||15;const C=document.getElementById("be-target-margin-input");C&&(C.value=window._beTargetMarginVal);const I=document.getElementById("sim-cm-slider");I&&(I.value=window._beTargetMarginVal),window.updateTargetProfitCalc(),window.updateBESimulator()},window.updateTargetProfitCalc=()=>{const c=window._beCurrentData;if(!c)return;const C=document.getElementById("be-target-profit-input"),I=parseFloat(C?.value??window._beTargetProfitVal??0);window._beTargetProfitVal=I;const g=document.getElementById("be-target-margin-input"),S=parseFloat(g?.value??window._beTargetMarginVal??c.cmPct);window._beTargetMarginVal=S;const M=S/100,B=M>0?(c.fixedCosts+I)/M:0,_=c.days>0?B/c.days:0,D=c.revenueTotal-B,F=D>=0&&B>0,L=c.revenueTotal>0&&B>c.revenueTotal?((B-c.revenueTotal)/c.revenueTotal*100).toFixed(1)+"%":"0%",H=B>0?(I/B*100).toFixed(1)+"%":"0%",V=document.getElementById("tp-res-sales"),G=document.getElementById("tp-res-daily"),O=document.getElementById("tp-res-gap"),N=document.getElementById("tp-res-status"),K=document.getElementById("tp-res-growth"),W=document.getElementById("tp-res-net-margin");V&&(V.textContent=o(B)),G&&(G.textContent=o(_)+" / يومياً"),O&&(O.textContent=(F?"+":"-")+o(Math.abs(D)),O.style.color=F?"#15803d":"#dc2626"),N&&(N.textContent=F?`✅ تم تجاوز هذا الربح بفائض قدره ${o(D)}`:`⏳ متبقي مبيعات إضافية قدرها ${o(Math.abs(D))} لتحقيق الهدف`,N.style.color=F?"#15803d":"#dc2626"),K&&(K.textContent=F?"✅ محقق بالفعل":`+${L}`,K.style.color=F?"#15803d":"#4338ca"),W&&(W.textContent="هامش صافي من المبيعات: "+H)},window.updateBESimulator=()=>{const c=window._beCurrentData;if(!c)return;const C=parseFloat(document.getElementById("sim-cm-slider")?.value||c.cmPct),I=parseFloat(document.getElementById("sim-exp-slider")?.value||0),g=parseFloat(document.getElementById("sim-target-profit")?.value||window._beTargetProfitVal||0),S=document.getElementById("sim-cm-val"),M=document.getElementById("sim-exp-adj-val");S&&(S.textContent=C.toFixed(1)+"%"),M&&(M.textContent=(I>=0?"+":"")+I+"%");const B=C/100,_=c.fixedCosts*(1+I/100),D=B>0?_/B:0,F=c.days>0?D/c.days:0,L=B>0?(_+g)/B:0,H=c.days>0?L/c.days:0,V=c.revenueTotal*B-_,G=c.revenueTotal>0?V/c.revenueTotal*100:0,O=document.getElementById("sim-res-be"),N=document.getElementById("sim-res-be-daily"),K=document.getElementById("sim-res-target-sales"),W=document.getElementById("sim-res-target-daily"),X=document.getElementById("sim-res-profit"),Z=document.getElementById("sim-res-profit-margin");O&&(O.textContent=o(D)),N&&(N.textContent=o(F)+" / يومياً"),K&&(K.textContent=o(L)),W&&(W.textContent=o(H)+" / يومياً"),X&&(X.textContent=o(V),X.style.color=V>=0?"#15803d":"#b91c1c"),Z&&(Z.textContent="هامش صافي: "+G.toFixed(1)+"%")},window.resetBESimulator=()=>{const c=window._beCurrentData;if(!c)return;const C=document.getElementById("sim-cm-slider"),I=document.getElementById("sim-exp-slider"),g=document.getElementById("sim-target-profit");C&&(C.value=c.cmPct.toFixed(1)),I&&(I.value=0),g&&(g.value=window._beTargetProfitVal||2e4),window.updateBESimulator()},setTimeout(()=>{window.updateTargetProfitCalc(),window.updateBESimulator()},40)}async function At(n,r,a){n.innerHTML='<div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin fa-2x"></i><div style="margin-top:10px;">جاري تحميل الفواتير والعملاء واحتساب أعمار الديون…</div></div>';try{const t=await J(tt.customers()),i=(await J(tt.salesInvoices())||[]).filter(s=>{if(s.status==="cancelled")return!1;const f=s.payment==="credit"||s.paymentMethod==="credit"||s.paymentMethod==="آجل"||s.paymentMethod==="partial"||s.paymentMethod==="جزئي",x=parseFloat(s.remainingAmount||s.dueAmount||0);return f||x>0}),p={};(t||[]).forEach(s=>{p[s.id]={name:s.name,code:s.code||"",repName:s.repName||"بدون مندوب",creditLimit:parseFloat(s.creditLimit||0),creditDays:parseInt(s.creditDays||0,10),balance:parseFloat(s.balance||0),current:0,aging1_30:0,aging31_60:0,aging61_90:0,agingOver90:0,totalRemaining:0}});const h=new Date;i.forEach(s=>{const f=s.customerId;if(!f)return;p[f]||(p[f]={name:s.customerName||"عميل مجهول",code:"",repName:s.repName||"بدون مندوب",creditLimit:0,creditDays:0,balance:0,current:0,aging1_30:0,aging31_60:0,aging61_90:0,agingOver90:0,totalRemaining:0});const x=parseFloat(s.remainingAmount||s.dueAmount||0);if(x<=0)return;const w=p[f];w.totalRemaining+=x;const v=new Date(s.date||h),P=h-v,k=Math.floor(P/(1e3*60*60*24)),z=w.creditDays||0,u=k-z;u<=0?w.current+=x:u<=30?w.aging1_30+=x:u<=60?w.aging31_60+=x:u<=90?w.aging61_90+=x:w.agingOver90+=x});const m=Object.values(p).filter(s=>s.balance>0||s.totalRemaining>0);m.sort((s,f)=>(f.totalRemaining||f.balance)-(s.totalRemaining||s.balance));const e={balance:0,current:0,aging1_30:0,aging31_60:0,aging61_90:0,agingOver90:0,totalRemaining:0};m.forEach(s=>{e.balance+=s.balance,e.current+=s.current,e.aging1_30+=s.aging1_30,e.aging31_60+=s.aging31_60,e.aging61_90+=s.aging61_90,e.agingOver90+=s.agingOver90,e.totalRemaining+=s.totalRemaining}),window._agedReceivablesRows=m,window._agedReceivablesTotals=e,n.innerHTML=`
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:20px;">
        <div>
          <h2 style="margin:0;color:var(--brand);font-size:18px;">⏳ تقرير أعمار الديون والمستحقات للعملاء</h2>
          <div style="font-size:12px;color:var(--text-2);margin-top:4px;">تاريخ التقرير: ${new Date().toLocaleDateString("ar-SA-u-nu-latn")} • ${m.length} عميل عليهم مديونيات</div>
        </div>
        <div class="no-print" style="display:flex; gap:8px;">
          <button class="btn btn-secondary" onclick="exportAgedReceivablesExcel()" style="white-space:nowrap; display:inline-flex; align-items:center; gap:6px;">
            📥 تصدير Excel
          </button>
          <button class="btn btn-primary" onclick="exportAgedReceivablesPDF()" style="white-space:nowrap; display:inline-flex; align-items:center; gap:6px;">
            🖨️ طباعة / PDF
          </button>
        </div>
      </div>
      
      <div class="card" style="padding:16px;">
        <div class="table-container" style="overflow-x:auto;">
          <table class="data-dense" style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr style="background:var(--bg-2);border-bottom:2px solid var(--border);">
                <th style="padding:10px 8px;text-align:right;">العميل</th>
                <th style="padding:10px 8px;text-align:right;">المندوب</th>
                <th style="padding:10px 8px;text-align:center;width:60px;">المهلة</th>
                <th style="padding:10px 8px;text-align:right;color:var(--brand);">الرصيد الدفتري</th>
                <th style="padding:10px 8px;text-align:right;color:#10b981;">غير مستحق</th>
                <th style="padding:10px 8px;text-align:right;color:#f59e0b;">متأخر (1-30 يوم)</th>
                <th style="padding:10px 8px;text-align:right;color:#d97706;">متأخر (31-60 يوم)</th>
                <th style="padding:10px 8px;text-align:right;color:#dc2626;">متأخر (61-90 يوم)</th>
                <th style="padding:10px 8px;text-align:right;color:#b91c1c;font-weight:900;">متأخر (>90 يوم)</th>
                <th style="padding:10px 8px;text-align:right;font-weight:bold;">مجموع المتبقي</th>
              </tr>
            </thead>
            <tbody>
              ${m.length===0?'<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--text-2);">لا توجد مديونيات مستحقة على العملاء حالياً</td></tr>':m.map(s=>`
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.03); transition:background .15s;" onmouseover="this.style.background='rgba(255,255,255,.03)'" onmouseout="this.style.background=''">
                    <td style="padding:10px 8px;">
                      <div style="font-weight:bold;">${s.name}</div>
                      ${s.code?`<div style="font-size:10px;color:var(--text-3);">${s.code}</div>`:""}
                    </td>
                    <td style="padding:10px 8px;color:var(--text-2);">${s.repName}</td>
                    <td style="padding:10px 8px;text-align:center;color:var(--text-2);font-family:monospace;">${s.creditDays?`${s.creditDays} ي`:"—"}</td>
                    <td style="padding:10px 8px;text-align:right;font-family:monospace;font-weight:600;">${o(s.balance)}</td>
                    <td style="padding:10px 8px;text-align:right;font-family:monospace;color:${s.current?"#10b981":"var(--text-3)"};">${s.current?o(s.current):"—"}</td>
                    <td style="padding:10px 8px;text-align:right;font-family:monospace;color:${s.aging1_30?"#f59e0b":"var(--text-3)"};">${s.aging1_30?o(s.aging1_30):"—"}</td>
                    <td style="padding:10px 8px;text-align:right;font-family:monospace;color:${s.aging31_60?"#d97706":"var(--text-3)"};">${s.aging31_60?o(s.aging31_60):"—"}</td>
                    <td style="padding:10px 8px;text-align:right;font-family:monospace;color:${s.aging61_90?"#dc2626":"var(--text-3)"};">${s.aging61_90?o(s.aging61_90):"—"}</td>
                    <td style="padding:10px 8px;text-align:right;font-family:monospace;font-weight:bold;color:${s.agingOver90?"#b91c1c":"var(--text-3)"};">${s.agingOver90?o(s.agingOver90):"—"}</td>
                    <td style="padding:10px 8px;text-align:right;font-family:monospace;font-weight:bold;background:rgba(255,255,255,0.01);">${o(s.totalRemaining)}</td>
                  </tr>
                `).join("")}
            </tbody>
            <tfoot>
              <tr style="background:var(--bg-2);border-top:2px solid var(--border);font-weight:bold;font-size:12px;">
                <td colspan="3" style="padding:12px 8px;font-weight:900;">الإجمالي العام (${m.length} عميل)</td>
                <td style="padding:12px 8px;text-align:right;font-family:monospace;color:var(--brand);">${o(e.balance)}</td>
                <td style="padding:12px 8px;text-align:right;font-family:monospace;color:#10b981;">${o(e.current)}</td>
                <td style="padding:12px 8px;text-align:right;font-family:monospace;color:#f59e0b;">${o(e.aging1_30)}</td>
                <td style="padding:12px 8px;text-align:right;font-family:monospace;color:#d97706;">${o(e.aging31_60)}</td>
                <td style="padding:12px 8px;text-align:right;font-family:monospace;color:#dc2626;">${o(e.aging61_90)}</td>
                <td style="padding:12px 8px;text-align:right;font-family:monospace;color:#b91c1c;">${o(e.agingOver90)}</td>
                <td style="padding:12px 8px;text-align:right;font-family:monospace;font-weight:900;background:rgba(255,255,255,0.02);">${o(e.totalRemaining)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `}catch(t){n.innerHTML=`<div class="alert bad">خطأ في احتساب أعمار الديون: ${t.message}</div>`}}window.exportAgedReceivablesExcel=async()=>{const n=window._agedReceivablesRows,r=window._agedReceivablesTotals;if(!n||n.length===0){alert("لا توجد بيانات لتصديرها");return}const a=`تقرير أعمار الديون والمستحقات للعملاء - ${new Date().toLocaleDateString("ar-SA-u-nu-latn")}`,t=["#","العميل","المندوب","مهلة الائتمان (أيام)","الرصيد الدفتري","غير مستحق (خلال المهلة)","متأخر (1-30 يوم)","متأخر (31-60 يوم)","متأخر (61-90 يوم)","متأخر (أكثر من 90 يوم)","مجموع المتبقي"],d=n.map((p,h)=>[h+1,p.name,p.repName,p.creditDays||0,Math.round(p.balance*100)/100,Math.round(p.current*100)/100,Math.round(p.aging1_30*100)/100,Math.round(p.aging31_60*100)/100,Math.round(p.aging61_90*100)/100,Math.round(p.agingOver90*100)/100,Math.round(p.totalRemaining*100)/100]);r&&d.push(["الإجمالي",`عدد العملاء: ${n.length}`,"","",Math.round(r.balance*100)/100,Math.round(r.current*100)/100,Math.round(r.aging1_30*100)/100,Math.round(r.aging31_60*100)/100,Math.round(r.aging61_90*100)/100,Math.round(r.agingOver90*100)/100,Math.round(r.totalRemaining*100)/100]);const i=[6,32,20,18,18,20,18,18,18,20,20];try{await gt({title:a,headers:t,rows:d,colWidths:i})}catch(p){console.error("Export Aged Receivables Excel error:",p),alert("حدث خطأ أثناء التصدير: "+p.message)}};window.exportAgedReceivablesPDF=()=>{if(!window._agedReceivablesRows||window._agedReceivablesRows.length===0){alert("لا توجد بيانات للطباعة");return}window.print()};async function Rt(n,r,a){n.innerHTML='<div class="page-loading"><div class="loading-spinner"></div><span>جارٍ تحليل بيانات العملاء…</span></div>';try{et||(et=await J(tt.salesInvoices())),ot||(ot=await J(tt.receipts()));const t=window.custperfRep||"",d=Math.max(1,Math.round((new Date(a)-new Date(r))/864e5)+1),i=et.filter(e=>!(e.status==="cancelled"||e.date<r||e.date>a||t&&e.repName!==t)),p=ot.filter(e=>!(!e.date||e.date<r||e.date>a||e.entityType&&e.entityType!=="customer")),h=await J(tt.customers()),m={};h.forEach(e=>{m[e.id]={id:e.id,name:e.name,repName:e.repName||"بدون مندوب",invoiceCount:0,totalSales:0,netRevenue:0,totalCost:0,paidAmount:0,collectedViaReceipts:0,lastInvoiceDate:"",lastReceiptDate:""}});for(const e of i){const s=e.customerId||"unknown";m[s]||(m[s]={id:s,name:e.customerName||s,repName:e.repName||"بدون مندوب",invoiceCount:0,totalSales:0,netRevenue:0,totalCost:0,paidAmount:0,collectedViaReceipts:0,lastInvoiceDate:"",lastReceiptDate:""});const f=m[s];f.invoiceCount++,f.totalSales+=parseFloat(e.totalWithVat||e.total||0),f.netRevenue+=parseFloat(e.subtotal||e.total||0),f.totalCost+=parseFloat(e.totalCost||0);const x=(e.paymentMethod||"cash").toLowerCase();(x==="cash"||x==="نقدي"||x==="partial"||x==="جزئي")&&(f.paidAmount+=parseFloat(e.paidAmount||0)),(!f.lastInvoiceDate||e.date>f.lastInvoiceDate)&&(f.lastInvoiceDate=e.date)}for(const e of p){const s=e.targetId||e.customerId||"";m[s]&&(m[s].collectedViaReceipts+=parseFloat(e.amount||0),(!m[s].lastReceiptDate||e.date>m[s].lastReceiptDate)&&(m[s].lastReceiptDate=e.date))}A=Object.values(m).filter(e=>e.totalSales>0||e.collectedViaReceipts>0).map(e=>{const s=e.netRevenue-e.totalCost,f=e.netRevenue>0?s/e.netRevenue*100:0,x=e.collectedViaReceipts+e.paidAmount,w=Math.max(0,e.totalSales-x),v=e.totalSales>0?Math.min(100,x/e.totalSales*100):0,P=e.totalSales/d,k=e.invoiceCount>0?e.totalSales/e.invoiceCount:0;return{...e,profit:s,profitPct:f,collected:x,remainingAmount:w,collectionPct:v,dailyAvg:P,avgInvoice:k}}),window.custperfSortKey||(window.custperfSortKey="totalSales",window.custperfSortDir="desc"),kt(),Ft(n,r,a,d,t)}catch(t){n.innerHTML='<div class="alert bad">خطأ في تحميل بيانات العملاء: '+t.message+"</div>",console.error(t)}}function kt(){const n=window.custperfSortKey,r=window.custperfSortDir==="asc"?1:-1;A.sort((a,t)=>{let d=a[n],i=t[n];if(n==="lastInvoiceDate"||n==="lastReceiptDate")d=d?new Date(d).getTime():0,i=i?new Date(i).getTime():0,isNaN(d)&&(d=0),isNaN(i)&&(i=0);else if(typeof d=="string")return d.localeCompare(i,"ar")*r;return d<i?-1*r:d>i?1*r:0})}window.toggleCustPerfSort=n=>{window.custperfSortKey===n?window.custperfSortDir=window.custperfSortDir==="desc"?"asc":"desc":(window.custperfSortKey=n,window.custperfSortDir="desc"),kt();const r=document.getElementById("custperf-table-wrapper"),a=document.getElementById("custperf-kpi-wrapper"),t=document.getElementById("custperf-champs-wrapper");r&&a&&t&&bt(r,a,t)};function Ft(n,r,a,t,d){n.innerHTML=(window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("تقرير أداء العملاء","الفترة من "+r+" إلى "+a):"")+'<div class="print-header no-print" style="text-align:center;margin-bottom:20px;"><h2 style="margin:0;font-size:20px;">🏆 تقرير أداء العملاء</h2><p style="color:var(--text-2);margin:4px 0 0;">من '+r+" إلى "+a+" ("+t+" يوم)"+(d?" • مندوب: "+d:"")+'</p></div><div id="custperf-kpi-wrapper"></div><div id="custperf-champs-wrapper"></div><div id="custperf-table-wrapper"></div>';const i=document.getElementById("custperf-table-wrapper"),p=document.getElementById("custperf-kpi-wrapper"),h=document.getElementById("custperf-champs-wrapper");bt(i,p,h)}const lt={lastInvoiceDate:!0,lastReceiptDate:!0,invoiceCount:!0,totalSales:!0,totalCost:!0,profit:!0,collected:!0,remainingAmount:!0,collectionPct:!0,dailyAvg:!0,avgInvoice:!0,profitKpi:!0};function Lt(){try{const n=localStorage.getItem("idham_custperf_cols");if(n)return{...lt,...JSON.parse(n)}}catch{}return{...lt}}function Et(n){try{localStorage.setItem("idham_custperf_cols",JSON.stringify(n))}catch{}}window.custperfCols=Lt();window.toggleCustPerfCol=n=>{window.custperfCols[n]=!window.custperfCols[n],Et(window.custperfCols),vt();const r=document.getElementById("custperf-table-wrapper"),a=document.getElementById("custperf-kpi-wrapper"),t=document.getElementById("custperf-champs-wrapper");r&&a&&t&&bt(r,a,t)};window.setCustPerfPreset=n=>{n==="rep"?(window.custperfCols.totalCost=!1,window.custperfCols.profit=!1,window.custperfCols.profitKpi=!1,window.custperfCols.lastInvoiceDate=!0,window.custperfCols.lastReceiptDate=!0,window.custperfCols.invoiceCount=!0,window.custperfCols.totalSales=!0,window.custperfCols.collected=!0,window.custperfCols.remainingAmount=!0,window.custperfCols.collectionPct=!0,window.custperfCols.dailyAvg=!0,window.custperfCols.avgInvoice=!0):n==="all"?Object.keys(window.custperfCols).forEach(d=>window.custperfCols[d]=!0):n==="minimal"&&(window.custperfCols.lastInvoiceDate=!1,window.custperfCols.lastReceiptDate=!1,window.custperfCols.invoiceCount=!0,window.custperfCols.totalSales=!0,window.custperfCols.totalCost=!1,window.custperfCols.profit=!1,window.custperfCols.profitKpi=!1,window.custperfCols.collected=!0,window.custperfCols.remainingAmount=!0,window.custperfCols.collectionPct=!0,window.custperfCols.dailyAvg=!1,window.custperfCols.avgInvoice=!1),Et(window.custperfCols),vt();const r=document.getElementById("custperf-table-wrapper"),a=document.getElementById("custperf-kpi-wrapper"),t=document.getElementById("custperf-champs-wrapper");r&&a&&t&&bt(r,a,t)};window.toggleCustPerfColMenu=n=>{n&&n.stopPropagation();const r=document.getElementById("custperf-col-dropdown");if(!r)return;r.style.display==="block"?r.style.display="none":(vt(),r.style.display="block")};function vt(){const n=document.getElementById("custperf-col-dropdown");if(!n)return;const r=window.custperfCols,a=[{key:"totalSales",label:"المبيعات (شامل)",icon:"💵"},{key:"collected",label:"المحصّل",icon:"✅"},{key:"remainingAmount",label:"المتبقي (الذمم)",icon:"⏳"},{key:"collectionPct",label:"نسبة التحصيل",icon:"📊"},{key:"invoiceCount",label:"عدد الفواتير",icon:"📄"},{key:"lastInvoiceDate",label:"تاريخ آخر فاتورة",icon:"📅"},{key:"lastReceiptDate",label:"تاريخ آخر تحصيل",icon:"💰"},{key:"dailyAvg",label:"المعدل اليومي",icon:"📈"},{key:"avgInvoice",label:"متوسط الفاتورة",icon:"🧾"},{key:"totalCost",label:"التكلفة (خاص)",icon:"🔒"},{key:"profit",label:"الربح وهامش الربح (خاص)",icon:"🔒"},{key:"profitKpi",label:"كروت الأرباح العلوية (خاص)",icon:"🔒"}];n.innerHTML=`
    <div style="font-weight:bold; font-size:13px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
      <span>⚙️ تخصيص أعمدة العرض</span>
      <span style="font-size:10px; color:var(--text-3);">اختر ما ترغب بإظهاره</span>
    </div>
    <div style="display:flex; gap:6px; margin-bottom:10px; flex-wrap:wrap;">
      <button type="button" class="btn btn-sm" onclick="setCustPerfPreset('rep')" style="font-size:11px; padding:4px 8px; background:#6366f1; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
        🛡️ وضع المندوب
      </button>
      <button type="button" class="btn btn-sm" onclick="setCustPerfPreset('all')" style="font-size:11px; padding:4px 8px; background:var(--bg-2); border:1px solid var(--border); border-radius:6px; font-weight:bold; cursor:pointer;">
        عرض الكل
      </button>
      <button type="button" class="btn btn-sm" onclick="setCustPerfPreset('minimal')" style="font-size:11px; padding:4px 8px; background:var(--bg-2); border:1px solid var(--border); border-radius:6px; font-weight:bold; cursor:pointer;">
        الأساسي
      </button>
    </div>
    <div style="border-top:1px solid var(--border); padding-top:8px; display:grid; grid-template-columns:1fr; gap:6px; max-height:260px; overflow-y:auto;">
      ${a.map(t=>`
        <label style="display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer; padding:4px 6px; border-radius:4px; transition:background .15s;" onmouseover="this.style.background='var(--bg-2)'" onmouseout="this.style.background=''">
          <input type="checkbox" ${r[t.key]?"checked":""} onchange="toggleCustPerfCol('${t.key}')" style="cursor:pointer;" />
          <span>${t.icon} ${t.label}</span>
        </label>
      `).join("")}
    </div>
  `}window._custperfClickListenerAdded||(document.addEventListener("click",n=>{const r=document.getElementById("custperf-col-dropdown"),a=document.getElementById("btn-custperf-cols");r&&r.style.display==="block"&&!r.contains(n.target)&&!a?.contains(n.target)&&(r.style.display="none")}),window._custperfClickListenerAdded=!0);function bt(n,r,a){const t=window.custperfCols||lt,d=A.reduce((b,$)=>(b.sales+=$.totalSales,b.netRevenue+=$.netRevenue,b.cost+=$.totalCost,b.profit+=$.profit,b.collected+=$.collected,b.remaining+=$.remainingAmount,b.invoices+=$.invoiceCount,b),{sales:0,netRevenue:0,cost:0,profit:0,collected:0,remaining:0,invoices:0}),i=d.netRevenue>0?d.profit/d.netRevenue*100:0,p=d.sales>0?Math.min(100,d.collected/d.sales*100):0,h=document.getElementById("fin-from")?.value,m=document.getElementById("fin-to")?.value,e=Math.max(1,Math.round((new Date(m||pt())-new Date(h||ct()))/864e5)+1),s=d.sales/e,f=[...A].sort((b,$)=>$.totalSales-b.totalSales)[0],x=[...A].sort((b,$)=>$.profit-b.profit)[0],w=[...A].sort((b,$)=>$.collectionPct-b.collectionPct)[0],v=b=>b>=80?{color:"#10b981",bg:"rgba(16,185,129,.12)",icon:"🟢"}:b>=50?{color:"#f59e0b",bg:"rgba(245,158,11,.12)",icon:"🟡"}:{color:"#ef4444",bg:"rgba(239,68,68,.12)",icon:"🔴"},P=b=>(Math.round(b*100)/100).toLocaleString("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2}),k=b=>{if(!b)return"—";const $=b.split("-");return $.length===3?`${$[2]}-${$[1]}-${$[0]}`:b};r.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:12px;margin-bottom:20px;">
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #6366f1;"><div style="font-size:10px;color:var(--text-3);margin-bottom:4px;">إجمالي المبيعات (شامل الضريبة)</div><div style="font-size:17px;font-weight:900;font-family:monospace;color:#6366f1;">${o(d.sales)}</div><div style="font-size:10px;color:var(--text-3);margin-top:4px;">${d.invoices} فاتورة • ${A.length} عميل</div></div>
      ${t.profitKpi?`<div class="card" style="padding:16px;text-align:center;border-top:3px solid #10b981;"><div style="font-size:10px;color:var(--text-3);margin-bottom:4px;">إجمالي الأرباح (صافي المبيعات)</div><div style="font-size:17px;font-weight:900;font-family:monospace;color:#10b981;">${o(d.profit)}</div><div style="font-size:10px;color:var(--text-3);margin-top:4px;">هامش ربح ${P(i)}%</div></div>`:""}
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #3b82f6;"><div style="font-size:10px;color:var(--text-3);margin-bottom:4px;">إجمالي التحصيل</div><div style="font-size:17px;font-weight:900;font-family:monospace;color:#3b82f6;">${o(d.collected)}</div><div style="font-size:10px;color:var(--text-3);margin-top:4px;">نسبة ${P(p)}%</div></div>
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #f59e0b;"><div style="font-size:10px;color:var(--text-3);margin-bottom:4px;">إجمالي المتبقي</div><div style="font-size:17px;font-weight:900;font-family:monospace;color:#f59e0b;">${o(d.remaining)}</div><div style="font-size:10px;color:var(--text-3);margin-top:4px;">ذمم متبقية</div></div>
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #8b5cf6;"><div style="font-size:10px;color:var(--text-3);margin-bottom:4px;">المعدل اليومي</div><div style="font-size:17px;font-weight:900;font-family:monospace;color:#8b5cf6;">${o(s)}</div><div style="font-size:10px;color:var(--text-3);margin-top:4px;">ر.س / يوم</div></div>
    </div>
  `,a.innerHTML=f||t.profitKpi&&x||w?`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:20px;">
      ${f&&f.totalSales>0?`<div class="card" style="padding:12px 16px;display:flex;align-items:center;gap:12px;border:1px solid rgba(99,102,241,.3);"><span style="font-size:28px;">🥇</span><div><div style="font-size:10px;color:#6366f1;font-weight:700;margin-bottom:2px;">الأعلى مبيعاً</div><div style="font-weight:700;font-size:13px;">${f.name}</div><div style="font-size:11px;color:var(--text-2);">${o(f.totalSales)}</div></div></div>`:""}
      ${t.profitKpi&&x&&x.profit>0?`<div class="card" style="padding:12px 16px;display:flex;align-items:center;gap:12px;border:1px solid rgba(16,185,129,.3);"><span style="font-size:28px;">💰</span><div><div style="font-size:10px;color:#10b981;font-weight:700;margin-bottom:2px;">الأعلى ربحاً (صافي)</div><div style="font-weight:700;font-size:13px;">${x.name}</div><div style="font-size:11px;color:var(--text-2);">${o(x.profit)} (${P(x.profitPct)}%)</div></div></div>`:""}
      ${w&&w.collectionPct>0?`<div class="card" style="padding:12px 16px;display:flex;align-items:center;gap:12px;border:1px solid rgba(59,130,246,.3);"><span style="font-size:28px;">🏅</span><div><div style="font-size:10px;color:#3b82f6;font-weight:700;margin-bottom:2px;">الأفضل تحصيلاً</div><div style="font-weight:700;font-size:13px;">${w.name}</div><div style="font-size:11px;color:var(--text-2);">${P(w.collectionPct)}%</div></div></div>`:""}
    </div>
  `:"";const z=b=>window.custperfSortKey!==b?' <span style="font-size:9px;color:var(--text-3);opacity:0.5;">↕</span>':window.custperfSortDir==="asc"?' <span style="font-size:10px;color:var(--brand);">▲</span>':' <span style="font-size:10px;color:var(--brand);">▼</span>',u=A.map((b,$)=>{const y=v(b.collectionPct);return`<tr style="border-bottom:1px solid rgba(255,255,255,.04); transition:background .15s;" onmouseover="this.style.background='rgba(255,255,255,.03)'" onmouseout="this.style.background=''">
      <td style="padding:10px 8px;text-align:center;color:var(--text-3);">${$+1}</td>
      <td style="padding:10px 8px;"><div style="font-weight:700;font-size:13px;">${b.name}</div><div style="font-size:10px;color:var(--text-3);margin-top:2px;">مندوب: ${b.repName}</div></td>
      ${t.lastInvoiceDate?`<td style="padding:10px 8px;text-align:center;color:var(--text-2);white-space:nowrap;">${k(b.lastInvoiceDate)}</td>`:""}
      ${t.lastReceiptDate?`<td style="padding:10px 8px;text-align:center;color:var(--text-2);white-space:nowrap;">${k(b.lastReceiptDate)}</td>`:""}
      ${t.invoiceCount?`<td style="padding:10px 8px;text-align:center;color:var(--text-2);">${b.invoiceCount}</td>`:""}
      ${t.totalSales?`<td style="padding:10px 8px;text-align:right;font-family:monospace;font-weight:700;">${o(b.totalSales)}</td>`:""}
      ${t.totalCost?`<td style="padding:10px 8px;text-align:right;font-family:monospace;color:var(--text-2);">${o(b.totalCost)}</td>`:""}
      ${t.profit?`
      <td style="padding:10px 8px;text-align:right;font-family:monospace;color:${b.profit>=0?"#10b981":"#ef4444"};font-weight:700;">
        ${o(b.profit)}
        <div style="font-size:10px;font-weight:400;opacity:0.8;">${P(b.profitPct)}%</div>
      </td>`:""}
      ${t.collected?`<td style="padding:10px 8px;text-align:right;font-family:monospace;">${o(b.collected)}</td>`:""}
      ${t.remainingAmount?`<td style="padding:10px 8px;text-align:right;font-family:monospace;color:${b.remainingAmount>0?"#f59e0b":"var(--text-3)"};">${b.remainingAmount>0?o(b.remainingAmount):"—"}</td>`:""}
      ${t.collectionPct?`
      <td style="padding:10px 8px;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:5px;background:${y.bg};color:${y.color};padding:4px 10px;border-radius:20px;font-weight:700;font-size:12px;">
          ${y.icon} ${P(b.collectionPct)}%
        </div>
      </td>`:""}
      ${t.dailyAvg?`<td style="padding:10px 8px;text-align:right;font-family:monospace;color:var(--text-2);">${o(b.dailyAvg)}</td>`:""}
      ${t.avgInvoice?`<td style="padding:10px 8px;text-align:right;font-family:monospace;color:var(--text-2);">${o(b.avgInvoice)}</td>`:""}
    </tr>`}).join(""),E=2+(t.lastInvoiceDate?1:0)+(t.lastReceiptDate?1:0);n.innerHTML=`
    <div class="table-container" style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr style="background:var(--bg-2);border-bottom:2px solid var(--border);user-select:none;">
            <th style="padding:10px 8px;text-align:center;">#</th>
            <th onclick="toggleCustPerfSort('name')" style="padding:10px 8px;text-align:right;cursor:pointer;">العميل${z("name")}</th>
            ${t.lastInvoiceDate?`<th onclick="toggleCustPerfSort('lastInvoiceDate')" style="padding:10px 8px;text-align:center;cursor:pointer;white-space:nowrap;">آخر فاتورة${z("lastInvoiceDate")}</th>`:""}
            ${t.lastReceiptDate?`<th onclick="toggleCustPerfSort('lastReceiptDate')" style="padding:10px 8px;text-align:center;cursor:pointer;white-space:nowrap;">آخر تحصيل${z("lastReceiptDate")}</th>`:""}
            ${t.invoiceCount?`<th onclick="toggleCustPerfSort('invoiceCount')" style="padding:10px 8px;text-align:center;cursor:pointer;white-space:nowrap;">الفواتير${z("invoiceCount")}</th>`:""}
            ${t.totalSales?`<th onclick="toggleCustPerfSort('totalSales')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">المبيعات${z("totalSales")}</th>`:""}
            ${t.totalCost?`<th onclick="toggleCustPerfSort('totalCost')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">التكلفة${z("totalCost")}</th>`:""}
            ${t.profit?`<th onclick="toggleCustPerfSort('profit')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">الربح / %${z("profit")}</th>`:""}
            ${t.collected?`<th onclick="toggleCustPerfSort('collected')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">المحصّل${z("collected")}</th>`:""}
            ${t.remainingAmount?`<th onclick="toggleCustPerfSort('remainingAmount')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">المتبقي${z("remainingAmount")}</th>`:""}
            ${t.collectionPct?`<th onclick="toggleCustPerfSort('collectionPct')" style="padding:10px 8px;text-align:center;cursor:pointer;white-space:nowrap;">نسبة التحصيل${z("collectionPct")}</th>`:""}
            ${t.dailyAvg?`<th onclick="toggleCustPerfSort('dailyAvg')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">معدل يومي${z("dailyAvg")}</th>`:""}
            ${t.avgInvoice?`<th onclick="toggleCustPerfSort('avgInvoice')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">متوسط الفاتورة${z("avgInvoice")}</th>`:""}
          </tr>
        </thead>
        <tbody>
          ${A.length===0?'<tr><td colspan="15" style="text-align:center;padding:40px;color:var(--text-2);">لا توجد بيانات للفترة المختارة</td></tr>':u}
        </tbody>
        <tfoot>
          <tr style="background:var(--bg-2);border-top:2px solid var(--border);font-weight:900;">
            <td colspan="${E}" style="padding:12px 8px;">الإجمالي (${A.length} عميل)</td>
            ${t.invoiceCount?`<td style="padding:12px 8px;text-align:center;">${d.invoices}</td>`:""}
            ${t.totalSales?`<td style="padding:12px 8px;text-align:right;font-family:monospace;color:#6366f1;">${o(d.sales)}</td>`:""}
            ${t.totalCost?`<td style="padding:12px 8px;text-align:right;font-family:monospace;">${o(d.cost)}</td>`:""}
            ${t.profit?`<td style="padding:12px 8px;text-align:right;font-family:monospace;color:#10b981;">${o(d.profit)} <span style="font-size:10px;font-weight:400;">(${P(i)}%)</span></td>`:""}
            ${t.collected?`<td style="padding:12px 8px;text-align:right;font-family:monospace;color:#3b82f6;">${o(d.collected)}</td>`:""}
            ${t.remainingAmount?`<td style="padding:12px 8px;text-align:right;font-family:monospace;color:#f59e0b;">${o(d.remaining)}</td>`:""}
            ${t.collectionPct?`<td style="padding:12px 8px;text-align:center;font-weight:900;color:${p>=80?"#10b981":p>=50?"#f59e0b":"#ef4444"};">${P(p)}%</td>`:""}
            ${t.dailyAvg?`<td style="padding:12px 8px;text-align:right;font-family:monospace;color:#8b5cf6;">${o(s)}</td>`:""}
            ${t.avgInvoice?`<td style="padding:12px 8px;text-align:right;font-family:monospace;">${o(d.invoices>0?d.sales/d.invoices:0)}</td>`:""}
          </tr>
        </tfoot>
      </table>
    </div>
    <div class="no-print" style="display:flex;gap:20px;margin-top:14px;font-size:11px;color:var(--text-3);flex-wrap:wrap;">
      <span>🟢 تحصيل ممتاز (≥80%)</span><span>🟡 تحصيل متوسط (50–79%)</span><span>🔴 تحصيل ضعيف (&lt;50%)</span>
    </div>
  `}window.exportCustPerfExcel=async()=>{if(!A||A.length===0){alert("لا توجد بيانات لتصديرها");return}const n=window.custperfCols||lt,r=document.getElementById("fin-from")?.value||"",a=document.getElementById("fin-to")?.value||"",t=window.custperfRep?` (مندوب: ${window.custperfRep})`:"",d=`تقرير أداء العملاء للفترة من ${r} إلى ${a}${t}`,i=["#","اسم العميل","المندوب"],p=[6,32,20];n.lastInvoiceDate&&(i.push("آخر فاتورة"),p.push(14)),n.lastReceiptDate&&(i.push("آخر تحصيل"),p.push(14)),n.invoiceCount&&(i.push("عدد الفواتير"),p.push(12)),n.totalSales&&(i.push("المبيعات (شامل)"),p.push(20)),n.totalCost&&(i.push("التكلفة"),p.push(18)),n.profit&&(i.push("صافي الربح","نسبة الربح %"),p.push(18,14)),n.collected&&(i.push("المحصل"),p.push(18)),n.remainingAmount&&(i.push("المتبقي (الذمم)"),p.push(18)),n.collectionPct&&(i.push("نسبة التحصيل %"),p.push(16)),n.dailyAvg&&(i.push("المعدل اليومي"),p.push(16)),n.avgInvoice&&(i.push("متوسط الفاتورة"),p.push(16));const h=A.map((x,w)=>{const v=[w+1,x.name,x.repName];return n.lastInvoiceDate&&v.push(x.lastInvoiceDate||"—"),n.lastReceiptDate&&v.push(x.lastReceiptDate||"—"),n.invoiceCount&&v.push(x.invoiceCount),n.totalSales&&v.push(Math.round(x.totalSales*100)/100),n.totalCost&&v.push(Math.round(x.totalCost*100)/100),n.profit&&v.push(Math.round(x.profit*100)/100,`${(Math.round(x.profitPct*100)/100).toFixed(2)}%`),n.collected&&v.push(Math.round(x.collected*100)/100),n.remainingAmount&&v.push(Math.round(x.remainingAmount*100)/100),n.collectionPct&&v.push(`${(Math.round(x.collectionPct*100)/100).toFixed(2)}%`),n.dailyAvg&&v.push(Math.round(x.dailyAvg*100)/100),n.avgInvoice&&v.push(Math.round(x.avgInvoice*100)/100),v}),m=A.reduce((x,w)=>(x.sales+=w.totalSales,x.cost+=w.totalCost,x.profit+=w.profit,x.collected+=w.collected,x.remaining+=w.remainingAmount,x.invoices+=w.invoiceCount,x),{sales:0,cost:0,profit:0,collected:0,remaining:0,invoices:0}),e=m.sales>0?m.profit/(m.sales/1.15)*100:0,s=m.sales>0?Math.min(100,m.collected/m.sales*100):0,f=["الإجمالي",`عدد العملاء: ${A.length}`,""];n.lastInvoiceDate&&f.push(""),n.lastReceiptDate&&f.push(""),n.invoiceCount&&f.push(m.invoices),n.totalSales&&f.push(Math.round(m.sales*100)/100),n.totalCost&&f.push(Math.round(m.cost*100)/100),n.profit&&f.push(Math.round(m.profit*100)/100,`${e.toFixed(2)}%`),n.collected&&f.push(Math.round(m.collected*100)/100),n.remainingAmount&&f.push(Math.round(m.remaining*100)/100),n.collectionPct&&f.push(`${s.toFixed(2)}%`),n.dailyAvg&&f.push(""),n.avgInvoice&&f.push(""),h.push(f);try{await gt({title:d,headers:i,rows:h,colWidths:p})}catch(x){console.error("Export Excel error:",x),alert("حدث خطأ أثناء تصدير ملف Excel: "+x.message)}};window.exportCustPerfPDF=()=>{if(!A||A.length===0){alert("لا توجد بيانات للطباعة");return}window.print()};export{Kt as render};
