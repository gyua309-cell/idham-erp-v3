const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-DaYejt0r.js","assets/index-Dq7oGj9k.css","assets/sync-engine-BjikcleC.js"])))=>i.map(i=>d[i]);
import{s as gt,t as bt,_ as X,g as Q,f as o,C as vt,d as $t,a as ot}from"./index-DaYejt0r.js";import{e as xt}from"./excel-zCoXiaxq.js";import{orderBy as Ct,getDoc as kt,doc as Et}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let R=[],N=[],Z="ledger",nt=null,it=null,D=[];async function Xt(n,i){n.innerHTML=`
    <!-- Top Filter Bar -->
    <div class="filterbar no-print">
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="fin-from" value="${gt()}" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="fin-to" value="${bt()}" />
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
  `,document.getElementById("fin-from").addEventListener("change",()=>loadDataAndRender()),document.getElementById("fin-to").addEventListener("change",()=>loadDataAndRender()),await loadDataAndRender()}let dt={},lt={};function yt(n){return dt[n.accountId]||lt[n.accountCode]||null}function Mt(n){const i=n.code||"";return i.startsWith("5-1-1")?!1:i==="5-1-8"||i==="5-1-7"||i==="5-1-9"||i==="5-1-3"||i.startsWith("5-1-")&&!i.startsWith("5-1-1")||i==="4-2-4"||n.name?.includes("تكلفة البضاعة المباعة")||n.name?.includes("تكلفة مبيعات")||n.name?.includes("نقل بضاعة")}window.loadDataAndRender=async function(n=!0){const i=document.getElementById("fin-report-body");if(i){i.innerHTML='<div class="page-loading"><div class="loading-spinner"></div><span>جارٍ تحميل البيانات المحاسبية…</span></div>';try{const{clearERPCache:s,COLS:t}=await X(async()=>{const{clearERPCache:d,COLS:a}=await import("./index-DaYejt0r.js").then(p=>p.T);return{clearERPCache:d,COLS:a}},__vite__mapDeps([0,1]));s(t.chartOfAccounts().path),s(t.journalEntries().path),s(t.salesInvoices().path),s(t.receipts().path),nt=null,it=null,R=await Q(t.chartOfAccounts(),[Ct("code")]),dt={},lt={},R.forEach(d=>{dt[d.id]=d,lt[d.code]=d}),N=await Q(t.journalEntries(),[Ct("date","asc")]),at()}catch(s){i.innerHTML=`<div class="alert bad">${s.message}</div>`}}};window.switchFinTab=n=>{Z=n,document.querySelectorAll(".tab-btn").forEach(s=>{s.classList.remove("active"),s.style.color="var(--text-2)",s.style.borderBottomColor="transparent"});const i=document.getElementById(`btn-tab-${n}`);i&&(i.classList.add("active"),i.style.color="var(--brand)",i.style.borderBottomColor="var(--brand)"),window.loadDataAndRender(!0)};function at(){const n=document.getElementById("fin-report-body");if(!n)return;let i=document.getElementById("fin-from")?.value||gt(),s=document.getElementById("fin-to")?.value||bt();const t=r=>{if(!r)return"";if(/^\d{4}-\d{2}-\d{2}$/.test(r))return r;const e=r.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);if(e)return`${e[3]}-${e[2].padStart(2,"0")}-${e[1].padStart(2,"0")}`;const x=new Date(r);return isNaN(x.getTime())?r:x.toISOString().split("T")[0]};let d=t(i),a=t(s);if(d&&a&&d>a){const r=d;d=a,a=r}const p=document.getElementById("fin-extra-filters");if(p)if(Z==="trial"){p.innerHTML=`
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
      `;const r=document.getElementById("trial-level");r&&r.addEventListener("change",e=>{window.trialLevel=e.target.value,at()})}else if(Z==="custperf"){const r=[...new Set((nt||[]).filter(e=>e.repName).map(e=>e.repName))].sort();p.innerHTML=`
        <div class="date-range-group">
          <label>المندوب</label>
          <select id="custperf-rep" style="padding:6px 12px; border:1px solid var(--border); border-radius:6px; background:var(--bg-1); color:var(--text-1); font-weight:bold; font-size:12px; min-height:38px;">
            <option value="">كل المناديب</option>
            ${r.map(e=>`<option value="${e}" ${window.custperfRep===e?"selected":""}>${e}</option>`).join("")}
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
      `,document.getElementById("custperf-rep")?.addEventListener("change",e=>{window.custperfRep=e.target.value,at()}),document.getElementById("custperf-sort")?.addEventListener("change",e=>{window.custperfSort=e.target.value,at()})}else p.innerHTML="";({ledger:Tt,trial:Bt,income:At,balance:Dt,cashflow:Rt,equity:Ft,breakeven:rt,analysis:Lt,aging:Ot,custperf:Nt}[Z]||Tt)(n,d,a)}function Tt(n,i,s){const d=[...R].sort((a,p)=>(a.code||"").localeCompare(p.code||"")).map(a=>`<option value="${a.id}">${a.code} — ${a.name}${a.nodeType==="header"?" 📁":""}</option>`).join("");n.innerHTML=`
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
  `,window.updateLedgerLines=()=>{const a=document.getElementById("ledger-acc-select")?.value,p=R.find(v=>v.id===a);if(!p)return;const h=["liability","equity","revenue"].includes(p.type),r=R.some(v=>v.code!==p.code&&v.code.startsWith(p.code+"-"));let e=0;const x=[];if(r){const v={};for(const P of N){const c=P.date||"";for(const l of P.lines||[]){const C=l.accountCode;if(!C||C!==p.code&&!C.startsWith(p.code+"-"))continue;const S=l.debit||0,b=l.credit||0;c<i?e+=S-b:c>=i&&c<=s&&(v[P.id]||(v[P.id]={date:c,entryNumber:st(P.entryNumber,P.id),description:P.description||"",sourceType:P.sourceType||"",debit:0,credit:0,entryId:P.id}),v[P.id].debit+=S,v[P.id].credit+=b)}}Object.values(v).sort((P,c)=>P.date.localeCompare(c.date)).forEach(P=>x.push(P))}else{for(const v of N){const P=v.date||"";for(const c of v.lines||[]){const l=yt(c);if(!l||l.id!==a)continue;const C=c.debit||0,S=c.credit||0;P<i?e+=C-S:P>=i&&P<=s&&x.push({date:P,entryNumber:st(v.entryNumber,v.id),description:v.description||"",sourceType:v.sourceType||"",debit:C,credit:S,note:c.note||"",entryId:v.id})}}x.sort((v,P)=>v.date.localeCompare(P.date))}const f=x.reduce((v,P)=>v+P.debit,0),u=x.reduce((v,P)=>v+P.credit,0);window._ledgerData={acc:p,from:i,to:s,openingBalance:e,isCreditNormal:h,lines:x,totalDr:f,totalCr:u};const w=document.getElementById("ledger-report-area");if(!w)return;const y=r?'<span style="font-size:11px; background:var(--bg-3); padding:2px 8px; border-radius:4px; margin-right:8px;">📁 حساب أب — يشمل كل الأبناء</span>':"";let T=h?-e:e;const k=x.map(v=>{const P=v.debit-v.credit;T+=h?-P:P;const c=Math.abs(T),l=T>=0?"مدين":"دائن",C=(h?T<=0:T>=0)?"var(--text-1)":"#ef4444",S=v.entryId?`<span onclick="window.showJEDetail('${v.entryId}')" style="color:var(--brand);cursor:pointer;font-weight:bold;font-size:12px;text-decoration:underline dotted;" title="انقر لعرض القيد كاملاً">${v.entryNumber}</span>`:`<span style="font-size:12px;font-weight:bold;color:var(--brand);">${v.entryNumber}</span>`;return`
        <tr>
          <td class="dim" style="font-size:12px;">${v.date}</td>
          <td class="mono">${S}</td>
          <td style="font-size:12px;max-width:250px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${v.description}</td>
          <td class="dim" style="font-size:11px;">${mt(v.sourceType)||v.note||"—"}</td>
          <td class="mono" style="color:var(--text-indigo,#6366f1);font-size:12px;">${v.debit?o(v.debit):"—"}</td>
          <td class="mono" style="color:var(--text-lime,#22c55e);font-size:12px;">${v.credit?o(v.credit):"—"}</td>
          <td class="mono font-bold" style="color:${C};font-size:12px;">${o(c)} <span class="dim" style="font-size:10px;">${l}</span></td>
        </tr>`}).join(""),z=Math.abs(h?-e:e),m=(h?-e:e)>=0?"مدين":"دائن",E=Math.abs(T),g=T>=0?"مدين":"دائن",$=(h?T<=0:T>=0)?"var(--text-1)":"#ef4444";w.innerHTML=`
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("دفتر الأستاذ التفصيلي",`حساب: ${p.code} — ${p.name} | من ${i} إلى ${s}`):""}
      <div class="no-print" style="text-align:center; margin-bottom:16px;">
        <h3 style="margin:0 0 4px;">📒 دفتر الأستاذ التفصيلي ${y}</h3>
        <p class="dim" style="margin:0;">حساب: <strong>${p.code}</strong> — ${p.name} | من <strong>${i}</strong> إلى <strong>${s}</strong></p>
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
              <td colspan="4">📌 رصيد افتتاحي (قبل ${i})</td>
              <td class="mono">—</td><td class="mono">—</td>
              <td class="mono font-bold" style="color:${z>0?"var(--text-good,#22c55e)":"var(--text-2)"};">${o(z)} <span class="dim" style="font-size:11px;">${m}</span></td>
            </tr>
            ${x.length===0?'<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-2);">لا توجد حركات في هذه الفترة</td></tr>':""}
            ${k}
            <tr style="border-top:2px solid var(--border); background:var(--bg-2); font-weight:bold;">
              <td colspan="4">📊 الإجمالي (${x.length} حركة)</td>
              <td class="mono font-bold" style="color:var(--text-indigo,#6366f1);">${o(f)}</td>
              <td class="mono font-bold" style="color:var(--text-lime,#22c55e);">${o(u)}</td>
              <td class="mono font-bold" style="color:${$};">${o(E)} <span class="dim" style="font-size:11px;">${g}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `},window.showJEDetail=a=>{const p=N.find(u=>u.id===a);if(!p){window.showToast?.("لم يُعثر على القيد","error");return}const h=(p.lines||[]).map(u=>{const w=dt[u.accountId]||lt[u.accountCode];return`<tr>
        <td style="font-size:13px;">${w?`${w.code} — ${w.name}`:u.accountCode||u.accountId||"—"}</td>
        <td class="mono" style="color:#6366f1;text-align:center;">${u.debit?o(u.debit):"—"}</td>
        <td class="mono" style="color:#22c55e;text-align:center;">${u.credit?o(u.credit):"—"}</td>
        <td class="dim" style="font-size:12px;">${u.note||"—"}</td>
      </tr>`}).join(""),r=(p.lines||[]).reduce((u,w)=>u+(w.debit||0),0),e=(p.lines||[]).reduce((u,w)=>u+(w.credit||0),0),x=Math.abs(r-e)<.01,f=document.createElement("div");f.id="je-detail-modal",f.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;",f.innerHTML=`
      <div style="background:var(--bg-1);border-radius:12px;max-width:760px;width:100%;max-height:85vh;overflow-y:auto;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.4);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:12px;">
          <div>
            <div style="font-size:18px;font-weight:bold;">📋 ${st(p.entryNumber,p.id)}</div>
            <div class="dim" style="font-size:13px;margin-top:4px;">${p.date} | ${p.description||"—"} | ${mt(p.sourceType)||p.sourceType||"يدوي"}</div>
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
            <td style="padding:8px;text-align:center;color:#6366f1;">${o(r)}</td>
            <td style="padding:8px;text-align:center;color:#22c55e;">${o(e)}</td>
            <td style="padding:8px;font-size:12px;">${x?"✅ قيد متوازن":"⚠️ قيد غير متوازن!"}</td>
          </tr></tfoot>
        </table>
      </div>`,f.addEventListener("click",u=>{u.target===f&&f.remove()}),document.body.appendChild(f)},window.exportLedgerExcel=()=>{const a=window._ledgerData;if(!a)return;let p=`\uFEFFدفتر الأستاذ - ${a.acc.code} - ${a.acc.name}
`;p+=`من ${a.from} إلى ${a.to}

`,p+=`التاريخ,رقم القيد,البيان,نوع العملية,مدين,دائن,الرصيد
`;let h=a.isCreditNormal?-a.openingBalance:a.openingBalance;p+=`,,رصيد افتتاحي,,,, ${h.toFixed(2)}
`,a.lines.forEach(f=>{const u=f.debit-f.credit;h+=a.isCreditNormal?-u:u,p+=`${f.date},${f.entryNumber},"${f.description}",${mt(f.sourceType)||"-"},${f.debit||"0"},${f.credit||"0"},${h.toFixed(2)}
`});const r=new Blob([p],{type:"text/csv;charset=utf-8;"}),e=URL.createObjectURL(r),x=document.createElement("a");x.href=e,x.download=`ledger_${a.acc.code}_${a.from}_${a.to}.csv`,x.click(),URL.revokeObjectURL(e)},updateLedgerLines()}function st(n,i){return n&&n!=="undefined"&&n.trim()?n:`JE-${(i||"").slice(-6).toUpperCase()}`}function mt(n){return n?{sales:"مبيعات",salesInvoice:"فاتورة بيع",salesCOGS:"تكلفة مباعة",salesReturn:"مردود بيع",salesInvoice_cogs:"تكلفة فاتورة بيع",salesReturnCOGS:"تكلفة مردود بيع",purchase:"مشتريات",purchaseInvoice:"فاتورة شراء",purchaseReturn:"مردود شراء",receipt:"تحصيل",payment:"سداد",cashIn:"إيداع نقدي",cashOut:"صرف نقدي",bankDeposit:"إيداع بنكي",bankWithdraw:"سحب بنكي",stockTransfer:"تحويل مخزني",inventoryAdjust:"جرد/تعديل",expense:"مصروف",payroll:"رواتب",opening:"رصيد افتتاحي",transfer:"تحويل",manual:"يدوي",pos:"نقطة بيع",posCOGS:"تكلفة POS",vatPayment:"سداد ضريبة"}[n]||n:""}function Bt(n,i,s){const t=[],d=[];let a=0,p=0,h=0,r=0,e=0,x=0;const f=b=>["liability","equity","revenue"].includes(b.type),u=window.trialLevel||"all",w=b=>(b.code.match(/-/g)||[]).length+1,y=new Set(R.map(b=>b.parentCode).filter(Boolean)),T=b=>!y.has(b.code);{const b={};for(const I of N){const M=I.date||"";for(const B of I.lines||[]){const _=B.accountCode;_&&(b[_]||(b[_]={open:0,tD:0,tC:0}),M<i?b[_].open+=(B.debit||0)-(B.credit||0):M>=i&&M<=s&&(b[_].tD+=B.debit||0,b[_].tC+=B.credit||0))}}for(const I in b){const{open:M,tD:B,tC:_}=b[I],A=M+(B-_);M>0?a+=M:M<0&&(p+=-M),A>0?e+=A:A<0&&(x+=-A),h+=B,r+=_}}const k=(b,I)=>{const M=w(b);return M>I?!1:M===I?!0:!R.some(_=>_.code!==b.code&&_.code.startsWith(b.code+"-")&&w(_)<=I)};for(const b of R){const I=w(b),M=Math.max(0,I-1)*14,B=!T(b),_={asset:"أصول",liability:"خصوم",equity:"حقوق",revenue:"إيراد",expense:"مصروف"};if(u!=="all"&&!k(b,parseInt(u)))continue;let A=0,F=0,O=0;for(const et of N){const ut=et.date||"";for(const Y of et.lines||[])!Y.accountCode||!(Y.accountCode===b.code||Y.accountCode.startsWith(b.code+"-"))||(ut<i?A+=(Y.debit||0)-(Y.credit||0):ut>=i&&ut<=s&&(F+=Y.debit||0,O+=Y.credit||0))}const W=A+(F-O);if(Math.abs(A)<.01&&F===0&&O===0)continue;const U=A>0?A:0,q=A<0?-A:0,H=W>0?W:0,V=W<0?-W:0,G=!(b.code&&(b.code.startsWith("1-1-2")||b.code.startsWith("2-1-1")))&&(f(b)&&H>.01||!f(b)&&V>.01),tt=G?'<span style="font-size:10px; background:#7f1d1d; color:#fca5a5; padding:1px 5px; border-radius:4px; margin-right:4px;">⚠️ رصيد شاذ</span>':"";G&&d.push({id:b.id,code:b.code,name:b.name,type:b.type,parentCode:b.parentCode,sourceEntityId:b.sourceEntityId||null,closeDr:H,closeCr:V}),t.push(`
      <tr ${G?'style="background:rgba(127,29,29,0.08);"':B?'style="background:var(--bg-2);"':""}>
        <td class="mono dim" style="font-size:11px;">${b.code}</td>
        <td style="padding-right:${M+8}px; ${B?"font-weight:700;":""}">${tt}${B?"📁 ":""}${b.name}</td>
        <td><span style="font-size:10px; padding:1px 5px; border-radius:4px; background:var(--bg-3);">${_[b.type]||b.type}</span></td>
        <td class="mono">${U?o(U):"—"}</td>
        <td class="mono">${q?o(q):"—"}</td>
        <td class="mono text-indigo">${F?o(F):"—"}</td>
        <td class="mono text-lime">${O?o(O):"—"}</td>
        <td class="mono font-bold">${H?o(H):"—"}</td>
        <td class="mono font-bold">${V?o(V):"—"}</td>
      </tr>
    `)}let z=0,m=0;const E=[];for(const b of N){const I=b.date||"";for(const M of b.lines||[])if(!yt(M)){const _=M.debit||0,A=M.credit||0;if(_===0&&A===0)continue;z+=_,m+=A,E.push({entryId:b.id,entryNum:st(b.entryNumber,b.id),date:I,desc:b.description||"—",accCode:M.accountCode||"—",accName:M.accountName||"—",accId:M.accountId||"—",dr:_,cr:A})}}const g=Math.abs(e-x),$=Math.abs(h-r),v=E.length>0,P=g<.05&&!v,c=v?`
    <div class="card mb-16" style="border:2px solid #b45309; padding:20px;">
      <h4 style="color:#f59e0b; margin-bottom:12px;">⚠️ أسطر قيود يتيمة — الحسابات غير موجودة في شجرة الحسابات</h4>
      <p class="dim" style="font-size:12px; margin-bottom:12px;">
        هذه الأسطر تشير إلى حسابات محذوفة أو غير مُدرجة في الشجرة الحالية، مما يُسبب عدم التوازن.
        يجب مراجعة القيود وإعادة ربطها بحسابات صحيحة.
      </p>
      <p class="dim" style="font-size:12px; margin-bottom:12px;">
        إجمالي المدين اليتيم: <strong>${o(z)}</strong> |
        إجمالي الدائن اليتيم: <strong>${o(m)}</strong> |
        فرق الميزان بسببها: <strong>${o(Math.abs(z-m))}</strong>
      </p>
      <div class="table-container" style="max-height:250px; overflow-y:auto;">
        <table class="data-dense" style="width:100%; font-size:12px;">
          <thead><tr>
            <th>رقم القيد</th><th>التاريخ</th><th>البيان</th>
            <th>كود الحساب</th><th>اسم الحساب</th>
            <th class="text-indigo">مدين</th><th class="text-lime">دائن</th>
          </tr></thead>
          <tbody>
            ${E.slice(0,50).map(b=>`
              <tr>
                <td class="mono dim">${b.entryNum}</td>
                <td>${b.date}</td>
                <td>${b.desc}</td>
                <td class="mono text-bad">${b.accCode}</td>
                <td class="dim">${b.accName}</td>
                <td class="mono text-indigo">${b.dr?o(b.dr):"—"}</td>
                <td class="mono text-lime">${b.cr?o(b.cr):"—"}</td>
              </tr>
            `).join("")}
            ${E.length>50?`<tr><td colspan="7" style="text-align:center; color:var(--text-2);">... و ${E.length-50} سطراً آخر</td></tr>`:""}
          </tbody>
        </table>
      </div>
    </div>
  `:"",l=Math.round(g*100)/100;window._trialData={rows:t,from:i,to:s,totalOpenDr:a,totalOpenCr:p,totalTransDr:h,totalTransCr:r,totalCloseDr:e,totalCloseCr:x,balanced:P},n.innerHTML=`
    ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("ميزان المراجعة بالأرصدة والمجاميع",`الفترة من ${i} إلى ${s}`):""}
    <div class="no-print" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
      <div style="text-align:center; flex:1;">
        <h3 style="margin:0 0 4px;">⚖️ ميزان المراجعة بالأرصدة والمجاميع</h3>
        <p class="dim" style="margin:0;">من <strong>${i}</strong> إلى <strong>${s}</strong></p>
      </div>
      <button class="btn btn-secondary" onclick="exportTrialExcel()" style="white-space:nowrap;">📥 تصدير Excel</button>
    </div>

    ${P?`
    <div class="alert good mb-16" style="display:flex; align-items:center; gap:12px;">
      <span style="font-size:22px;">✅</span>
      <div><strong>الميزان متوازن تماماً</strong> — مجموع القيود: ${o(e)}</div>
    </div>`:`
    <div class="alert bad mb-16" style="display:flex; align-items:center; gap:12px;">
      <span style="font-size:22px;">⚠️</span>
      <div>
        <strong>تحذير: الميزان غير متوازن</strong><br>
        <span class="dim">
          فرق الأرصدة الختامية: ${o(l)}
          ${v?` | أسطر يتيمة: ${E.length} سطر (مدين: ${o(z)} / دائن: ${o(m)})`:""}
          ${$>.05?` | فرق حركات الفترة: ${o(Math.round($*100)/100)}`:""}
        </span>
      </div>
    </div>`}

    ${c}

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
            <td class="mono">${o(a)}</td>
            <td class="mono">${o(p)}</td>
            <td class="mono text-indigo">${o(h)}</td>
            <td class="mono text-lime">${o(r)}</td>
            <td class="mono ${P?"text-good":"text-bad"}">${o(e)}</td>
            <td class="mono ${P?"text-good":"text-bad"}">${o(x)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,window.exportTrialExcel=()=>{const b=window._trialData;if(!b)return;let I=`\uFEFFميزان المراجعة - من ${b.from} إلى ${b.to}

`;I+=`الكود,اسم الحساب,النوع,رصيد افتتاحي مدين,رصيد افتتاحي دائن,حركات مدين,حركات دائن,رصيد ختامي مدين,رصيد ختامي دائن
`;const M=document.querySelector("#fin-report-body .data-dense tbody");M&&[...M.querySelectorAll("tr")].forEach(F=>{const O=[...F.querySelectorAll("td")].map(W=>`"${W.textContent.trim().replace(/"/g,'""')}"`);O.length>=8&&(I+=O.join(",")+`
`)});const B=new Blob([I],{type:"text/csv;charset=utf-8;"}),_=URL.createObjectURL(B),A=document.createElement("a");A.href=_,A.download=`trial_balance_${b.from}_${b.to}.csv`,A.click(),URL.revokeObjectURL(_)};const C=d.filter(b=>b.type==="liability"&&b.closeDr>.01||b.type==="asset"&&b.closeCr>.01),S=C.length?`
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
            ${C.map(b=>{const I=b.closeDr>.01?b.closeDr:b.closeCr,M=b.closeDr>.01;let B="",_="";return b.type==="liability"&&M?b.code?.startsWith("2-1-5")||b.code?.startsWith("2-1-4")?(B="سلفة موظف/مندوب مُصنَّفة تحت الخصوم — يجب إعادة تصنيفها كأصل",_=`<button class="btn btn-sm" style="background:#b45309;color:#fff;" onclick="fixReclassifyAccount('${b.id}','${b.code}','asset','1-1-5-4')">🔄 نقل إلى سلف مناديب</button>`):b.code?.startsWith("2-1-1-1-1-")||b.parentCode&&b.parentCode.startsWith("2-1-1-1")?(B="حساب فرعي مورد: المشتريات قُيّدت بالأب بينما الدفعات قُيّدت بالفرعي",_=`<button class="btn btn-sm" style="background:#b45309;color:#fff;" onclick="fixSupplierSubAccountJE('${b.id}','${b.code}','${b.name.replace(/'/g,"\\'")}',${I.toFixed(2)})">⚖️ إنشاء قيد تسوية</button>`):(B="التزام برصيد مدين — راجع القيود يدوياً",_='<span class="dim" style="font-size:12px;">مراجعة يدوية</span>'):b.type==="asset"&&!M&&(B="أصل برصيد دائن — قد يكون دفعة مستلمة زائدة",_='<span class="dim" style="font-size:12px;">مراجعة يدوية</span>'),`
                <tr>
                  <td class="mono dim">${b.code}</td>
                  <td><strong>${b.name}</strong></td>
                  <td><span style="font-size:11px; padding:2px 6px; border-radius:4px; background:rgba(239,68,68,0.15); color:#ef4444;">${b.type==="liability"?"خصوم":"أصول"}</span></td>
                  <td class="mono ${M?"text-indigo":"text-lime"}">${o(I)} ${M?"م":"د"}</td>
                  <td style="font-size:12px; color:var(--text-2);">${B}</td>
                  <td>${_}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `:"";n.innerHTML+=S}window.fixReclassifyAccount=async(n,i,s,t)=>{if(await window.showConfirm?.(`سيتم نقل الحساب ${i} إلى تصنيف "${s==="asset"?"أصول — سلف مناديب":"خصوم"}".

هذا يُزيل علامة "رصيد شاذ" لأن رصيد السلفة المدين يُصبح طبيعياً للأصول.`,"تغيير تصنيف الحساب"))try{const{update:a}=await X(async()=>{const{update:w}=await import("./index-DaYejt0r.js").then(y=>y.T);return{update:w}},__vite__mapDeps([0,1])),{getDoc:p,doc:h}=await X(async()=>{const{getDoc:w,doc:y}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:w,doc:y}},[]),{db:r}=await X(async()=>{const{db:w}=await import("./index-DaYejt0r.js").then(y=>y.T);return{db:w}},__vite__mapDeps([0,1])),e=["asset","expense"].includes(s)?"debit":"credit",x=await p(h(r,`companies/${vt}/chartOfAccounts`,n));let f=0;if(x.exists()){const w=x.data(),y=parseFloat(w.totalDebit||0),T=parseFloat(w.totalCredit||0),k=y-T;f=Math.round((e==="credit"?-k:k)*100)/100}await a("chartOfAccounts",n,{type:s,parentCode:t,normalBalance:e,balance:f});const{recalculateCoaRollup:u}=await X(async()=>{const{recalculateCoaRollup:w}=await import("./sync-engine-BjikcleC.js");return{recalculateCoaRollup:w}},__vite__mapDeps([2,0,1]));await u(),window.showToast?.("✅ تم تغيير تصنيف الحساب وتحديث الأرصدة بنجاح","success"),await window.loadDataAndRender?.()}catch(a){window.showToast?.(a.message,"error")}};window.fixSupplierSubAccountJE=async(n,i,s,t)=>{const d=R.find(h=>h.code==="2-1-1-1-1"),a=R.find(h=>h.id===n);if(!d||!a){window.showToast?.("لم يُعثر على حسابات المورد في شجرة الحسابات","error");return}if(await window.showConfirm?.(`سيتم إنشاء قيد تسوية:
  مدين: ${d.code} — ${d.name}   بمبلغ ${t.toFixed(2)} ر.س
  دائن: ${i} — ${s}   بمبلغ ${t.toFixed(2)} ر.س

هذا ينقل رصيد المشتريات من الحساب الأب إلى الحساب الفرعي للمورد.
الرصيد الإجمالي لذمم الموردين لن يتغير.`,"إنشاء قيد تسوية"))try{const{createJournalEntry:h}=await X(async()=>{const{createJournalEntry:e}=await import("./index-DaYejt0r.js").then(x=>x.T);return{createJournalEntry:e}},__vite__mapDeps([0,1])),r=new Date().toISOString().split("T")[0];await h({date:r,description:`تسوية — نقل رصيد ${s} من الحساب الأب إلى الفرعي`,entryType:"correction",lines:[{accountId:d.id,accountCode:d.code,accountName:d.name,debit:t,credit:0,description:`نقل رصيد مشتريات ${s} للحساب الفرعي`},{accountId:a.id,accountCode:a.code,accountName:a.name,debit:0,credit:t,description:`تسوية رصيد مشتريات ${s}`}]}),window.showToast?.("✅ تم إنشاء قيد التسوية بنجاح","success"),await window.loadDataAndRender?.()}catch(h){window.showToast?.(h.message,"error")}};function K(n,i){let s=0,t=0,d=0;const a=[],p=[],h=[];for(const e of R){if(e.isGroup||e.isHeader||e.nodeType==="header"||e.nodeType==="group")continue;let x=0;for(const f of N){const u=f.date||"";if(!n||!i||u>=n&&u<=i)for(const w of f.lines||[]){const y=yt(w);y&&(y.id===e.id||y.code===e.code)&&(x+=(w.credit||0)-(w.debit||0))}}if(!(Math.abs(x)<.01)){if(e.type==="revenue"){const f=x;Math.abs(f)>.01&&(s+=f,a.push({name:e.name,code:e.code,balance:f}))}else if(e.type==="expense"){if(e.code?.startsWith("5-1-1")||e.name?.includes("مشتريات البضاعة"))continue;const f=-x;if(Math.abs(f)<.01)continue;Mt(e)?(t+=f,p.push({name:e.name,code:e.code,balance:f})):(d+=f,h.push({name:e.name,code:e.code,balance:f}))}}}return{grossRevenue:a.filter(e=>e.balance>0).reduce((e,x)=>e+x.balance,0)||s,revenueTotal:s,cogsTotal:t,opExpTotal:d,revItems:a,cogsItems:p,expItems:h,grossProfit:s-t,netProfit:s-t-d}}function _t(n,i){const s=new Date(n+"T00:00:00"),t=new Date(i+"T00:00:00"),d=Math.round((t-s)/864e5)+1,a=new Date(s);a.setDate(a.getDate()-1);const p=new Date(a);p.setDate(p.getDate()-d+1);const h=r=>r.toISOString().slice(0,10);return{prevFrom:h(p),prevTo:h(a)}}window.printActiveReportPDF=()=>{const n=document.getElementById("fin-from")?.value||gt(),i=document.getElementById("fin-to")?.value||bt();Z==="income"?window.printIncomeStatementPDF(n,i):Z==="breakeven"?window.printBreakEvenPDF(n,i):window.print()};window.printIncomeStatementPDF=async(n,i)=>{const s=K(n,i),{grossRevenue:t,revenueTotal:d,cogsTotal:a,opExpTotal:p,revItems:h,cogsItems:r,expItems:e,grossProfit:x,netProfit:f}=s,u=d>0?(f/d*100).toFixed(1):"0.0",w=d>0?(x/d*100).toFixed(1):"0.0";h.sort((m,E)=>(m.code||"").localeCompare(E.code||"")),r.sort((m,E)=>(m.code||"").localeCompare(E.code||"")),e.sort((m,E)=>(m.code||"").localeCompare(E.code||""));let y={name:"شركة نظم الإمداد الحديثة",vatNumber:"312448150500003",crNumber:"4700123180",phone:"0549141648",email:"Nuzmalamdad@gmail.com",address:"7480 - الشارع: عامر الشعبي، ينبع",logoUrl:""};try{const m=JSON.parse(localStorage.getItem("idham_company")||"{}");m.name&&Object.assign(y,m),m.cr&&(y.crNumber=m.cr),m.crNumber&&(y.crNumber=m.crNumber),m.logoBase64&&(y.logoUrl=m.logoBase64),m.logoUrl&&(y.logoUrl=m.logoUrl)}catch{}try{const[m,E]=await Promise.all([kt(Et($t,`companies/${vt}/settings`,"company")),kt(Et($t,`companies/${vt}/settings`,"logo"))]);if(m.exists()){const g=m.data(),$=g.crNumber||g.cr||g.commercialRegistration||"";g.crNumber=$&&$.startsWith("47")?$:"4700123180",g.vatNumber=g.vatNumber||"312448150500003",g.name=g.name||"شركة نظم الإمداد الحديثة",Object.assign(y,g)}if(E.exists()){const g=E.data(),$=g.dataUrl||g.logoBase64||g.url||g.logoUrl||"";if($){y.logoUrl=$;try{const v=JSON.parse(localStorage.getItem("idham_company")||"{}");localStorage.setItem("idham_company",JSON.stringify({...v,logoBase64:$,logoUrl:$}))}catch{}}}}catch(m){console.warn("Could not load fresh logo from Firestore:",m)}const T=y.logoUrl?`<div class="logo-circle"><img src="${y.logoUrl}" alt="Logo" /></div>`:'<div class="logo-circle"><span class="default-logo">🏢</span></div>',k=f<0,z=window.open("","_blank");z.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>قائمة الدخل والأرباح والخسائر — ${n} إلى ${i}</title>
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
        <div>الفترة المالية: <strong>من ${n} إلى ${i}</strong></div>
        <div>تاريخ الإصدار: <strong>${new Date().toLocaleDateString("ar-SA")}</strong></div>
        <div>العملة: <strong>ريال سعودي (SAR)</strong></div>
      </div>
      ${T}
      <div class="banner-right">
        <h2>${y.name}</h2>
        ${y.vatNumber?`<div>الرقم الضريبي: <strong>${y.vatNumber}</strong></div>`:""}
        ${y.crNumber?`<div>السجل التجاري: <strong>${y.crNumber}</strong></div>`:""}
        ${y.phone?`<div>الهاتف: <strong>${y.phone}</strong></div>`:""}
      </div>
    </div>

    <!-- Info Strip -->
    <div class="info-strip">
      <span><strong>بيانات المنشأة:</strong> ${y.name}</span>
      <span><strong>الرقم الضريبي:</strong> ${y.vatNumber||"—"}</span>
      <span><strong>السجل التجاري:</strong> ${y.crNumber||"—"}</span>
      <span><strong>العنوان:</strong> ${y.address||"المملكة العربية السعودية"}</span>
    </div>

    <!-- KPI Summary Strip -->
    <div class="kpi-strip">
      <div class="kpi-box blue">
        <div class="lbl">صافي الإيرادات والمبيعات</div>
        <div class="val" dir="ltr">${o(d)}</div>
      </div>
      <div class="kpi-box indigo">
        <div class="lbl">مجمل الربح (هامش ${w}%)</div>
        <div class="val" dir="ltr">${o(x)}</div>
      </div>
      <div class="kpi-box ${k?"loss":"profit"}">
        <div class="lbl">${k?"صافي الخسارة":"صافي الربح"} (هامش ${u}%)</div>
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
        ${h.length?h.map(m=>`
          <tr>
            <td style="font-family:'IBM Plex Mono',monospace; font-weight:700;">${m.code}</td>
            <td style="font-weight:700;">${m.name}</td>
            <td class="mono" dir="ltr">${o(m.balance)}</td>
            <td style="text-align:center; font-size:10.5px;">${t>0?(m.balance/t*100).toFixed(1):0}%</td>
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
        ${r.length?r.map(m=>`
          <tr>
            <td style="font-family:'IBM Plex Mono',monospace; font-weight:700;">${m.code}</td>
            <td style="font-weight:700;">${m.name}</td>
            <td class="mono" style="color:#b45309;" dir="ltr">(${o(m.balance)})</td>
            <td style="text-align:center; font-size:10.5px;">${d>0?(m.balance/d*100).toFixed(1):0}%</td>
          </tr>
        `).join(""):'<tr><td colspan="4" style="text-align:center; padding:10px;">لا توجد تكلفة مباشرة مسجلة</td></tr>'}
      </tbody>
    </table>
    <div class="subtotal-row">
      <span style="color:#b45309;">يخصم: إجمالي تكلفة البضاعة المباعة:</span>
      <span class="mono" style="color:#b45309;" dir="ltr">(${o(a)})</span>
    </div>

    <div class="gross-profit-box">
      <div>🏷️ مجمل الربح التشغيلي (Gross Profit) — هامش: ${w}%</div>
      <div class="val" dir="ltr">${o(x)}</div>
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
        ${e.length?e.map(m=>`
          <tr>
            <td style="font-family:'IBM Plex Mono',monospace; font-weight:700;">${m.code}</td>
            <td style="font-weight:700;">${m.name}</td>
            <td class="mono" style="color:#dc2626;" dir="ltr">(${o(m.balance)})</td>
            <td style="text-align:center; font-size:10.5px;">${p>0?(m.balance/p*100).toFixed(1):0}%</td>
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
        <p>نسبة صافي ${k?"الخسارة":"الربح"} من الإيراد: ${u}% | تم احتساب كافة الإيرادات والتكاليف والمصروفات</p>
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
</html>`),z.document.close()};window.exportIncomeStatementExcel=(n,i)=>{const s=K(n,i),t=[];t.push(["قائمة الدخل والأرباح والخسائر — شركة نظم الإمداد الحديثة"]),t.push([`للفترة من: ${n} إلى: ${i}`]),t.push([]),t.push(["القسم","كود الحساب","اسم الحساب","المبلغ (ر.س)"]),(s.revItems||[]).forEach(d=>t.push(["الإيرادات",d.code,d.name,d.balance])),t.push(["الإيرادات","","إجمالي الإيرادات",s.revenueTotal]),t.push([]),(s.cogsItems||[]).forEach(d=>t.push(["تكلفة المبيعات",d.code,d.name,-d.balance])),t.push(["تكلفة المبيعات","","إجمالي تكلفة المبيعات",-s.cogsTotal]),t.push(["مجمل الربح","","مجمل الربح (Gross Profit)",s.grossProfit]),t.push([]),(s.expItems||[]).forEach(d=>t.push(["المصروفات التشغيلية",d.code,d.name,-d.balance])),t.push(["المصروفات التشغيلية","","إجمالي المصروفات التشغيلية",-s.opExpTotal]),t.push([]),t.push(["النتيجة النهائية","","صافي الربح / (الخسارة)",s.netProfit]),xt(t)};function At(n,i,s){const t=K(i,s),{grossRevenue:d,revenueTotal:a,cogsTotal:p,opExpTotal:h,revItems:r,cogsItems:e,expItems:x,grossProfit:f,netProfit:u}=t,w=a>0?(u/a*100).toFixed(1):"0.0",y=a>0?(f/a*100).toFixed(1):"0.0";r.sort((g,$)=>(g.code||"").localeCompare($.code||"")),e.sort((g,$)=>(g.code||"").localeCompare($.code||"")),x.sort((g,$)=>(g.code||"").localeCompare($.code||""));const{prevFrom:T,prevTo:k}=_t(i,s),z=K(T,k),m=(g,$)=>{if(!$||Math.abs($)<.01)return"";const v=((g-$)/Math.abs($)*100).toFixed(1),P=parseFloat(v)>=0;return`<span style="font-size:11px; font-weight:700; color:${P?"#16a34a":"#dc2626"}; margin-right:4px;">${P?"▲":"▼"} ${Math.abs(v)}%</span>`},E=u<0;n.innerHTML=`
    <!-- Top Print Header (Visible in Print) -->
    <div class="report-print-header" style="border-bottom:2px solid #3b82f6; padding-bottom:12px; margin-bottom:18px;">
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("قائمة الدخل والأرباح والخسائر (Income Statement)",`للفترة المالية من: ${i} إلى: ${s}`):""}
    </div>

    <!-- On-screen Action Toolbar -->
    <div class="no-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; background:var(--bg-1); padding:12px 18px; border-radius:12px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm);">
      <div style="font-size:13px; font-weight:700; color:var(--text-2);">
        📊 <strong style="color:var(--text-1);">قائمة الأرباح والخسائر الشاملة</strong> | مقارنة بالفترة السابقة (${T} → ${k})
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-secondary btn-sm" onclick="exportIncomeStatementExcel('${i}', '${s}')" style="font-weight:700;">📊 تصدير Excel</button>
        <button class="btn btn-primary btn-sm" onclick="printIncomeStatementPDF('${i}', '${s}')" style="font-weight:700; background:linear-gradient(135deg, #5b3ec2, #4338ca); border:none; box-shadow:0 2px 6px rgba(91,62,194,0.3);">📑 تصدير PDF المطور (الهيدر الملون الرسمي)</button>
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
            ${o(a)} ${m(a,z.revenueTotal)}
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">إجمالي المبيعات قبل المردود: <strong class="mono">${o(d)}</strong></div>
        </div>

        <!-- Gross Profit -->
        <div class="kpi-card" style="background:linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02)); border:1.5px solid rgba(99,102,241,0.3); border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:#4338ca;">🏷️ مجمل الربح (Gross Profit)</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:rgba(99,102,241,0.15); color:#4338ca;">هامش ${y}%</span>
          </div>
          <div style="font-size:20px; font-weight:900; color:#4338ca; font-family:'IBM Plex Mono', monospace;">
            ${o(f)} ${m(f,z.grossProfit)}
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
            ${o(u)} ${m(u,z.netProfit)}
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
              ${r.length?r.map((g,$)=>{const v=d>0?(g.balance/d*100).toFixed(1):"0.0";return`
                <tr style="border-bottom:1px solid var(--border-soft); background:${$%2===1?"rgba(0,0,0,0.015)":"transparent"};">
                  <td style="padding:8px 10px; font-family:'IBM Plex Mono',monospace; font-weight:700; color:var(--text-3);">${g.code}</td>
                  <td style="padding:8px 10px; font-weight:700; color:var(--text-1);">${g.name}</td>
                  <td style="padding:8px 10px; text-align:left; font-family:'IBM Plex Mono',monospace; font-weight:700; color:${g.balance>=0?"#1e293b":"#dc2626"};" dir="ltr">${o(g.balance)}</td>
                  <td style="padding:8px 10px; text-align:center; font-size:11px; color:var(--text-3); font-weight:600;">${v}%</td>
                </tr>`}).join(""):'<tr><td colspan="4" style="text-align:center; padding:12px; color:var(--text-3);">لا توجد إيرادات مسجلة في هذه الفترة</td></tr>'}
            </tbody>
          </table>
          <div style="display:flex; justify-content:space-between; align-items:center; background:linear-gradient(90deg, rgba(37,99,235,0.12), rgba(37,99,235,0.04)); padding:10px 14px; border-radius:8px; border:1px solid rgba(37,99,235,0.25); font-weight:800;">
            <span style="color:#1d4ed8; font-size:14px;">صافي الإيرادات التشغيلية (بعد خصم المردودات)</span>
            <span style="font-family:'IBM Plex Mono',monospace; font-size:16px; color:#1d4ed8;" dir="ltr">${o(a)}</span>
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
              ${e.length?e.map((g,$)=>{const v=a>0?(g.balance/a*100).toFixed(1):"0.0";return`
                <tr style="border-bottom:1px solid var(--border-soft); background:${$%2===1?"rgba(0,0,0,0.015)":"transparent"};">
                  <td style="padding:8px 10px; font-family:'IBM Plex Mono',monospace; font-weight:700; color:var(--text-3);">${g.code}</td>
                  <td style="padding:8px 10px; font-weight:700; color:var(--text-1);">${g.name}</td>
                  <td style="padding:8px 10px; text-align:left; font-family:'IBM Plex Mono',monospace; font-weight:700; color:#b45309;" dir="ltr">(${o(g.balance)})</td>
                  <td style="padding:8px 10px; text-align:center; font-size:11px; color:var(--text-3);">${v}%</td>
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
              <span style="font-size:11px; color:#6366f1; margin-right:8px;">[هامش الربح الإجمالي: ${y}%]</span>
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
              ${x.length?x.map((g,$)=>{const v=h>0?(g.balance/h*100).toFixed(1):"0.0";return`
                <tr style="border-bottom:1px solid var(--border-soft); background:${$%2===1?"rgba(0,0,0,0.015)":"transparent"};">
                  <td style="padding:8px 10px; font-family:'IBM Plex Mono',monospace; font-weight:700; color:var(--text-3);">${g.code}</td>
                  <td style="padding:8px 10px; font-weight:700; color:var(--text-1);">${g.name}</td>
                  <td style="padding:8px 10px; text-align:left; font-family:'IBM Plex Mono',monospace; font-weight:700; color:#dc2626;" dir="ltr">(${o(g.balance)})</td>
                  <td style="padding:8px 10px; text-align:center; font-size:11px; color:var(--text-3);">${v}%</td>
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
              ${o(u)}
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
              ${o(u)}
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
  `}function Dt(n,i,s){let t=0,d=0,a=0;const p=[],h=[],r=[],e=[],x=[];let f=0,u=0;const w={};for(const c of N)if(!((c.date||"")>s))for(const C of c.lines||[]){const S=C.accountCode;S&&(w[S]=(w[S]||0)+(C.debit||0)-(C.credit||0))}const y=c=>{let l=0;for(const C in w)(C===c.code||C.startsWith(c.code+"-"))&&(l+=w[C]);if(Math.abs(l)<.001){const C=parseFloat(c.balance||c.openingBalance||0);Math.abs(C)>.001&&(l=["liability","equity","revenue"].includes(c.type)?-C:C)}return l},T=c=>c.code?.split("-").length||1,k=c=>T(c)>4?!1:!R.some(l=>l.type===c.type&&l.code!==c.code&&l.code.startsWith(c.code+"-")&&T(l)<=4);for(const c of R){if(!k(c))continue;const l=y(c);if(c.type==="asset"){if(Math.abs(l)<.01)continue;t+=l,(c.code?.startsWith("1-2")||c.code?.startsWith("1-3")||c.name?.includes("سيارات")||c.name?.includes("أثاث")||c.name?.includes("عقارات")||c.name?.includes("معدات")?h:p).push({name:c.name,code:c.code,balance:l})}else if(c.type==="liability"){const C=-l;if(Math.abs(C)<.01)continue;d+=C,(c.code?.startsWith("2-2")||c.name?.includes("قرض طويل")||c.name?.includes("سند")?e:r).push({name:c.name,code:c.code,balance:C})}else if(c.type==="equity"){const C=-l;if(Math.abs(C)<.01)continue;a+=C,x.push({name:c.name,code:c.code,balance:C})}else c.type==="revenue"?f+=-l:c.type==="expense"&&(u+=l)}const z=f-u,m=t-d-a-z,E=a+m+z,g=d+E,$=Math.abs(t-g)<1,v=(c,l="var(--text-0)")=>`<div class="flex justify-between mb-8" style="font-size:13px;">
       <span>${c.code} — ${c.name}</span>
       <span class="mono" style="color:${l}">${o(c.balance)}</span>
     </div>`,P=(c,l,C="var(--text-0)")=>`<div class="flex justify-between font-bold" style="background:var(--bg-2); padding:8px 12px; border-radius:6px; margin:8px 0 16px;">
       <span>${c}</span>
       <span class="mono" style="color:${C}">${o(l)}</span>
     </div>`;n.innerHTML=`
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("ميزانية العمومية (Balance Sheet)",`كما هي في: ${s}`):""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>قائمة المركز المالي (Balance Sheet)</h2>
      <p class="dim">كما هي في: ${s}</p>
    </div>

    ${$?"":`<div class="alert bad mb-16">⚠️ الميزانية غير متوازنة — فرق: ${o(Math.abs(t-g))}</div>`}

    <div class="grid-2 gap-24" style="max-width:1200px; margin:0 auto;">

      <!-- ASSETS -->
      <div class="card" style="padding:24px;">
        <h3 style="color:var(--brand); border-bottom:2px solid var(--brand); padding-bottom:8px; margin-bottom:20px;">الأصول (Assets)</h3>

        <h4 style="color:var(--indigo); margin:0 0 12px;">الأصول المتداولة</h4>
        ${p.map(c=>v(c,"var(--indigo)")).join("")||"<p class='dim'>—</p>"}
        ${P("إجمالي الأصول المتداولة",p.reduce((c,l)=>c+l.balance,0),"var(--indigo)")}

        <h4 style="color:var(--indigo); margin:16px 0 12px;">الأصول الثابتة (غير المتداولة)</h4>
        ${h.map(c=>v(c)).join("")||"<p class='dim'>—</p>"}
        ${P("إجمالي الأصول الثابتة",h.reduce((c,l)=>c+l.balance,0))}

        <div class="flex justify-between font-bold" style="background:linear-gradient(135deg,var(--bg-2),var(--surface-1)); padding:14px 16px; border-radius:10px; font-size:16px; margin-top:8px; border:2px solid var(--brand);">
          <span>إجمالي الأصول</span>
          <span class="mono text-brand">${o(t)}</span>
        </div>
      </div>

      <!-- LIABILITIES & EQUITY -->
      <div class="card" style="padding:24px;">
        <h3 style="color:var(--brand); border-bottom:2px solid var(--brand); padding-bottom:8px; margin-bottom:20px;">الالتزامات وحقوق الملكية</h3>

        <h4 style="color:var(--text-bad, #ef4444); margin:0 0 12px;">الالتزامات المتداولة</h4>
        ${r.map(c=>v(c,"var(--text-bad, #ef4444)")).join("")||"<p class='dim'>—</p>"}
        ${P("إجمالي الالتزامات المتداولة",r.reduce((c,l)=>c+l.balance,0),"var(--text-bad, #ef4444)")}

        <h4 style="color:var(--text-bad, #ef4444); margin:16px 0 12px;">الالتزامات طويلة الأجل</h4>
        ${e.map(c=>v(c,"var(--warn)")).join("")||"<p class='dim'>—</p>"}
        ${P("إجمالي الالتزامات طويلة الأجل",e.reduce((c,l)=>c+l.balance,0),"var(--warn)")}

        <h4 style="color:var(--brand); margin:16px 0 12px; border-top:1px solid var(--border); padding-top:12px;">حقوق الملكية (Owner's Equity)</h4>
        ${x.map(c=>v(c,"var(--brand)")).join("")||"<p class='dim'>—</p>"}
        ${Math.abs(m)>.01?`
        <div class="flex justify-between mb-8" style="font-size:13px;">
          <span>3-1-3 — أرباح / (خسائر) مرحّلة وتعديلات افتتاحية</span>
          <span class="mono ${m>=0?"text-good":"text-bad"}">${o(m)}</span>
        </div>`:""}
        <div class="flex justify-between mb-8" style="font-size:13px;">
          <span>أرباح / (خسائر) الفترة الحالية</span>
          <span class="mono ${z>=0?"text-good":"text-bad"}">${o(z)}</span>
        </div>
        ${P("إجمالي حقوق الملكية",E,"var(--brand)")}

        <div class="flex justify-between font-bold" style="background:linear-gradient(135deg,var(--bg-2),var(--surface-1)); padding:14px 16px; border-radius:10px; font-size:16px; margin-top:8px; border:2px solid ${$?"var(--good)":"var(--bad)"};">
          <span>إجمالي الالتزامات وحقوق الملكية</span>
          <span class="mono ${$?"text-good":"text-bad"}">${o(g)}</span>
        </div>
      </div>
    </div>
  `}function Rt(n,i,s){const{netProfit:t}=K(i,s),d=R.filter(c=>c.code?.startsWith("1-1-1-1")||c.code?.startsWith("1-1-1-3")||c.name?.includes("صندوق")||c.name?.includes("بنك")||c.name?.includes("مصرف")),a=new Set(d.map(c=>c.id)),p=new Set(d.map(c=>c.code)),h=c=>a.has(c.accountId)||p.has(c.accountCode);let r=0,e=0;for(const c of N){const l=c.date||"";for(const C of c.lines||[]){if(!h(C))continue;const S=(C.debit||0)-(C.credit||0);l<i&&(r+=S),l<=s&&(e+=S)}}let x=0,f=0,u=0,w=0,y=0,T=0,k=0,z=0,m=0;for(const c of R){if(a.has(c.id)||c.type==="revenue"||c.type==="expense")continue;let l=0,C=0;for(const I of N){const M=I.date||"";for(const B of I.lines||[]){if(B.accountId!==c.id&&B.accountCode!==c.code)continue;const _=(B.debit||0)-(B.credit||0);M<i&&(l+=_),M<=s&&(C+=_)}}const S=C-l;if(Math.abs(S)<.01)continue;const b=c.code||"";b.startsWith("1-1-2")?x-=S:b.startsWith("1-1-4")?f-=S:b.startsWith("1-1-5")?w-=S:b.startsWith("1-2")||b.startsWith("1-3")?z-=S:b.startsWith("2-1-1")||b.startsWith("2-1-2")?u+=-S:b.startsWith("2-1-3")?y+=-S:b.startsWith("3")?m+=-S:c.type==="asset"?T-=S:c.type==="liability"&&(k+=-S)}const E=x+f+u+w+y+T+k,g=t+E,$=g+z+m,v=(c,l,C=!0)=>`<div class="flex justify-between mb-8" style="font-size:14px;${C?"padding-right:16px; color:var(--text-1);":""}">
       <span>${c}</span>
       <span class="mono ${l>=0?"":"text-bad"}">${l>=0?"":"("}${o(Math.abs(l))}${l>=0?"":")"}</span>
     </div>`,P=(c,l)=>`<div class="flex justify-between font-bold" style="background:var(--bg-2); padding:10px 14px; border-radius:8px; margin:12px 0 24px;">
       <span>${c}</span>
       <span class="mono ${l>=0?"text-good":"text-bad"}">${l>=0?"":"("}${o(Math.abs(l))}${l>=0?"":")"}</span>
     </div>`;n.innerHTML=`
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("تقرير التدفقات النقدية (الطريقة غير المباشرة)",`الفترة من ${i} إلى ${s}`):""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>تقرير التدفقات النقدية (الطريقة غير المباشرة)</h2>
      <p class="dim">للفترة من ${i} إلى ${s}</p>
    </div>

    <div style="max-width:800px; margin:0 auto;">
      <!-- Cash KPIs -->
      <div class="grid-3 gap-16 mb-24">
        <div class="kpi-card">
          <div class="status-bar good"></div>
          <div class="kpi-content">
            <div class="kpi-label">الرصيد النقدي الافتتاحي</div>
            <div class="kpi-value">${o(r)}</div>
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
        ${v("صافي ربح الفترة",t,!1)}
        <div style="padding-right:16px; margin-bottom:8px; color:var(--text-2); font-size:12px; font-weight:600;">تسويات التغير في رأس المال العامل:</div>
        ${v("(زيادة) نقص في الذمم المدينة — العملاء",x)}
        ${v("(زيادة) نقص في المخزون السلعي",f)}
        ${v("(زيادة) نقص في ضريبة القيمة المضافة المدخلات",w)}
        ${v("زيادة (نقص) في الذمم الدائنة — الموردون",u)}
        ${v("زيادة (نقص) في ضريبة القيمة المضافة المخرجات",y)}
        ${Math.abs(T)>.01?v("أصول تشغيلية أخرى",T):""}
        ${Math.abs(k)>.01?v("التزامات تشغيلية أخرى",k):""}
        ${P("صافي النقد من الأنشطة التشغيلية",g)}

        <h4 style="color:var(--brand); border-bottom:1.5px solid var(--brand); padding-bottom:8px; margin-bottom:16px;">2. الأنشطة الاستثمارية (Investing Activities)</h4>
        ${v("شراء / بيع أصول ثابتة وممتلكات",z,!1)}
        ${P("صافي النقد من الأنشطة الاستثمارية",z)}

        <h4 style="color:var(--brand); border-bottom:1.5px solid var(--brand); padding-bottom:8px; margin-bottom:16px;">3. الأنشطة التمويلية (Financing Activities)</h4>
        ${v("زيادة رأس المال / مسحوبات المالك / قروض",m,!1)}
        ${P("صافي النقد من الأنشطة التمويلية",m)}

        <div style="border-top:2px solid var(--border); padding-top:16px; margin-top:8px;">
          <div class="flex justify-between font-bold mb-8" style="font-size:15px;">
            <span>صافي التغير الكلي في النقدية خلال الفترة</span>
            <span class="mono ${$>=0?"text-good":"text-bad"}">${o($)}</span>
          </div>
          <div class="flex justify-between dim mb-8">
            <span>رصيد النقدية في بداية الفترة</span>
            <span class="mono">${o(r)}</span>
          </div>
          <div class="flex justify-between font-bold" style="font-size:16px; background:linear-gradient(135deg,var(--bg-2),var(--surface-1)); padding:14px 16px; border-radius:10px; border:2px solid var(--brand);">
            <span>رصيد النقدية في نهاية الفترة</span>
            <span class="mono text-brand">${o(e)}</span>
          </div>
        </div>
      </div>
    </div>
  `}function Ft(n,i,s){let t=0,d=0,a=0,p=0,h=0,r=0;for(const y of R){if(y.type!=="equity")continue;let T=0,k=0;for(const z of N){const m=z.date||"";for(const E of z.lines||[]){if(E.accountId!==y.id&&E.accountCode!==y.code)continue;const g=(E.credit||0)-(E.debit||0);m<i?T+=g:m>=i&&m<=s&&(k+=g)}}y.name?.includes("رأس المال")?(t+=T,d+=k):y.name?.includes("أرباح مبقاة")||y.name?.includes("أرباح محتجزة")||y.name?.includes("احتياطي")?(a+=T,p+=k):y.name?.includes("مسحوبات")||y.name?.includes("جاري المالك")?(h+=T,r+=k):(t+=T,d+=k)}const{netProfit:e}=K(i,s);p+=e;const x=t+d,f=a+p,u=h+r,w=(y,T,k,z,m=!1,E="")=>`<tr ${m?'style="border-top:2px solid var(--border); background:var(--bg-2); font-weight:bold;"':""}>
      <td>${y}</td>
      <td class="mono ${E}">${o(T)}</td>
      <td class="mono ${E}">${o(k)}</td>
      <td class="mono ${E||(z<0?"text-bad":"")}">${o(z)}</td>
      <td class="mono font-bold ${E}">${o(T+k+z)}</td>
    </tr>`;n.innerHTML=`
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("تقرير الأرباح حسب مراكز التكلفة",`الفترة من ${i} إلى ${s}`):""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>قائمة التغير في حقوق الملكية</h2>
      <p class="dim">للفترة من ${i} إلى ${s}</p>
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
            ${w("رصيد بداية الفترة",t,a,h)}
            ${w("زيادات رأس المال",d,0,0)}
            ${w("صافي ربح الفترة",0,e,0)}
            ${r!==0?w("مسحوبات / توزيعات خلال الفترة",0,0,r):""}
            ${w("رصيد نهاية الفترة",x,f,u,!0,"text-brand")}
          </tbody>
        </table>
      </div>
    </div>
  `}function Lt(n,i,s){let t=0,d=0,a=0,p=0,h=0,r=0,e=0;for(const m of R){let E=0;for(const g of N)if((g.date||"")<=s)for(const v of g.lines||[])v.accountId!==m.id&&v.accountCode!==m.code||(E+=(v.debit||0)-(v.credit||0));if(m.type==="asset")d+=E,m.code?.startsWith("1-2")||m.code?.startsWith("1-3")||m.name?.includes("سيارات")||m.name?.includes("أثاث")||m.name?.includes("معدات")||(t+=E),m.code?.startsWith("1-1-4")&&(h+=E),(m.code?.startsWith("1-1-1-1")||m.code?.startsWith("1-1-1-3"))&&(r+=E),m.code?.startsWith("1-1-2")&&(e+=E);else if(m.type==="liability"){const g=-E;p+=g,m.code?.startsWith("2-2")||m.name?.includes("طويل")||(a+=g)}}const{revenueTotal:x,cogsTotal:f,opExpTotal:u,grossProfit:w,netProfit:y}=K(i,s),T=d-p,k=(m,E,g=!1,$=2)=>{if(!E||E===0)return"—";const v=m/E;return g?(v*100).toFixed(1)+"%":v.toFixed($)},z=[{group:"🏦 نسب السيولة (Liquidity)",items:[{label:"نسبة السيولة الجارية (Current Ratio)",val:k(t,a),note:"الأصول المتداولة ÷ الالتزامات المتداولة — المثالي ≥ 1.5",good:parseFloat(k(t,a))>=1.5},{label:"نسبة السيولة السريعة (Quick Ratio)",val:k(t-h,a),note:"(الأصول المتداولة - المخزون) ÷ الالتزامات المتداولة — المثالي ≥ 1.0",good:parseFloat(k(t-h,a))>=1},{label:"نسبة النقدية (Cash Ratio)",val:k(r,a),note:"النقدية فقط ÷ الالتزامات المتداولة",good:parseFloat(k(r,a))>=.2},{label:"رأس المال العامل (Working Capital)",val:o(t-a),note:"الأصول المتداولة — الالتزامات المتداولة",good:t-a>=0}]},{group:"📊 نسب الربحية (Profitability)",items:[{label:"هامش مجمل الربح (Gross Margin)",val:k(w,x,!0),note:"مجمل الربح ÷ المبيعات",good:parseFloat(k(w,x,!0))>=20},{label:"هامش صافي الربح (Net Margin)",val:k(y,x,!0),note:"صافي الربح ÷ المبيعات",good:parseFloat(k(y,x,!0))>=5},{label:"العائد على الأصول ROA",val:k(y,d,!0),note:"صافي الربح ÷ إجمالي الأصول",good:parseFloat(k(y,d,!0))>=5},{label:"العائد على حقوق الملكية ROE",val:k(y,T,!0),note:"صافي الربح ÷ حقوق الملكية",good:parseFloat(k(y,T,!0))>=10}]},{group:"⚙️ نسب الكفاءة (Efficiency)",items:[{label:"معدل دوران المخزون",val:k(f,h,!1,1)+"x",note:"تكلفة المباعة ÷ المخزون — كلما ارتفع كان أفضل",good:parseFloat(k(f,h,!1,1))>=4},{label:"معدل دوران الذمم المدينة",val:k(x,e,!1,1)+"x",note:"المبيعات ÷ الذمم المدينة",good:parseFloat(k(x,e,!1,1))>=6},{label:"نسبة التكلفة إلى الإيراد",val:k(f,x,!0),note:"COGS ÷ المبيعات — كلما انخفض كان أفضل",good:parseFloat(k(f,x,!0))<=70},{label:"نسبة المصروفات إلى الإيراد",val:k(u,x,!0),note:"المصاريف التشغيلية ÷ المبيعات",good:parseFloat(k(u,x,!0))<=15}]},{group:"🏗️ نسب الرفع المالي (Leverage)",items:[{label:"نسبة الديون إلى الأصول",val:k(p,d,!0),note:"الالتزامات ÷ الأصول — المثالي ≤ 50%",good:parseFloat(k(p,d,!0))<=50},{label:"نسبة الديون إلى حقوق الملكية",val:k(p,T,!1,2),note:"الالتزامات ÷ حقوق الملكية — المثالي ≤ 1.0",good:parseFloat(k(p,T))<=1},{label:"إجمالي الأصول",val:o(d),note:"مجموع الأصول المتداولة + الثابتة",good:!0},{label:"إجمالي الالتزامات",val:o(p),note:"مجموع الالتزامات المتداولة وطويلة الأجل",good:!0}]}];n.innerHTML=`
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("نسب التحليل المالي والربحية (Financial Ratios)",`الفترة من ${i} إلى ${s}`):""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>لوحة التحليل المالي والمؤشرات (Financial Ratios)</h2>
      <p class="dim">للفترة من ${i} إلى ${s}</p>
    </div>

    <!-- Summary Banner -->
    <div class="grid-4 gap-16 mb-28" style="max-width:1200px; margin:0 auto 28px;">
      ${[{label:"إجمالي الإيرادات",val:o(x),icon:"💰",color:"#22c55e"},{label:"مجمل الربح",val:o(w),icon:"📈",color:"#6366f1"},{label:"صافي الربح",val:o(y),icon:"🎯",color:y>=0?"#2dd4bf":"#ef4444"},{label:"إجمالي الأصول",val:o(d),icon:"🏛️",color:"#e58a2b"}].map(m=>`
        <div class="kpi-card">
          <div class="kpi-content">
            <div style="font-size:28px; margin-bottom:8px;">${m.icon}</div>
            <div class="kpi-label">${m.label}</div>
            <div class="kpi-value" style="color:${m.color}; font-size:20px;">${m.val}</div>
          </div>
        </div>`).join("")}
    </div>

    <!-- Ratio Groups -->
    <div style="max-width:1200px; margin:0 auto;">
      ${z.map(m=>`
        <div class="card mb-20" style="padding:24px;">
          <h3 style="color:var(--brand); margin-bottom:20px; font-family:var(--font-heading);">${m.group}</h3>
          <div class="grid-2 gap-16">
            ${m.items.map(E=>`
              <div style="background:var(--bg-2); border-radius:10px; padding:16px; border-left:4px solid ${E.good?"var(--good, #22c55e)":"var(--warn, #f59e0b)"};">
                <div style="font-size:12px; color:var(--text-2); margin-bottom:4px;">${E.label}</div>
                <div style="font-size:22px; font-weight:700; font-family:monospace; color:${E.good?"var(--good, #22c55e)":"var(--warn, #f59e0b)"};">${E.val}</div>
                <div style="font-size:11px; color:var(--text-2); margin-top:6px;">${E.note}</div>
              </div>`).join("")}
          </div>
        </div>`).join("")}
    </div>
  `}function jt(n,i){const s=String(n||"");return s.startsWith("5-2-6")||s.startsWith("5-2-1")||s.startsWith("5-2-2")||s.startsWith("5-2-3")?{type:"fixed_salary",label:"🛡️ ثابتة (أجور ورواتب)",isCoreFixed:!0,isCash:!0,badgeBg:"rgba(59,130,246,0.12)",badgeColor:"#1d4ed8"}:s.startsWith("5-4-1")?{type:"fixed_rent",label:"🛡️ ثابتة (إيجارات)",isCoreFixed:!0,isCash:!0,badgeBg:"rgba(59,130,246,0.12)",badgeColor:"#1d4ed8"}:s.startsWith("5-6")?{type:"depreciation",label:"📉 ثابتة دفترياً (إهلاكات)",isCoreFixed:!0,isCash:!1,badgeBg:"rgba(100,116,139,0.15)",badgeColor:"#475569"}:s.startsWith("5-3-3")?{type:"mixed_fuel",label:"⚡ شبه متغيرة (ديزل ومحروقات)",isCoreFixed:!1,isCash:!0,badgeBg:"rgba(245,158,11,0.12)",badgeColor:"#b45309"}:s.startsWith("5-3-2")?{type:"mixed_maint",label:"⚡ شبه متغيرة (صيانة وإصلاح)",isCoreFixed:!1,isCash:!0,badgeBg:"rgba(245,158,11,0.12)",badgeColor:"#b45309"}:s.startsWith("5-4-7")||s.startsWith("5-4-8")||s.startsWith("5-4-3")?{type:"amortized",label:"📅 دورية سنوية (إقامات ورخص)",isCoreFixed:!1,isCash:!0,badgeBg:"rgba(168,85,247,0.12)",badgeColor:"#7e22ce"}:{type:"operating",label:"🏷️ مصاريف تشغيلية",isCoreFixed:!1,isCash:!0,badgeBg:"rgba(15,23,42,0.08)",badgeColor:"var(--text-2)"}}function ct(n,i,s=null){const t=K(n,i),{grossRevenue:d,revenueTotal:a,cogsTotal:p,opExpTotal:h,expItems:r,grossProfit:e,netProfit:x}=t,f=new Date(n+"T00:00:00"),u=new Date(i+"T00:00:00"),w=Math.max(1,Math.round((u-f)/864e5)+1),y=e,T=a>0?y/a:0,k=T*100,z=s?new Set(s):null,m=(r||[]).map(I=>{const M=jt(I.code,I.name),B=z?z.has(I.code):!0;return{...I,...M,isSelected:B}}),E=m.filter(I=>I.isSelected),g=E.reduce((I,M)=>I+(M.balance||0),0),$=h-g,v=T>0?g/T:0,P=w>0?v/w:0,c=w>0?a/w:0,l=a-v,C=a>0?(a-v)/a*100:0,S=c>0?Math.round(v/c):null,b=[...m].sort((I,M)=>M.balance-I.balance).map(I=>{const M=g>0&&I.isSelected?I.balance/g*100:0,B=h>0?I.balance/h*100:0,_=T>0?I.balance/T:0;return{...I,pctOfSelected:M,pctOfTotal:B,salesNeeded:_}});return{from:n,to:i,days:w,grossRevenue:d,revenueTotal:a,cogsTotal:p,opExpTotal:h,grossProfit:e,netProfit:x,contributionMargin:y,cmRatio:T,cmPct:k,fixedCosts:g,unselectedCosts:$,selectedCount:E.length,totalCount:m.length,breakEvenSales:v,dailyBreakEven:P,dailyActual:c,marginOfSafetyVal:l,marginOfSafetyPct:C,breakEvenDay:S,sortedExp:b}}window.exportBreakEvenExcel=(n,i)=>{const s=ct(n,i,window._beSelectedExpenseCodes),t=[];t.push(["تقرير تحليل نقطة التعادل والتحليل الحجمي (CVP) وسيناريوهات الأرباح ونسب الهوامش — شركة نظم الإمداد الحديثة"]),t.push([`الفترة من: ${n} إلى: ${i} (${s.days} يوماً)`]),t.push([]),t.push(["المؤشر المالي","القيمة","الوحدة / النسبة"]),t.push(["صافي الإيرادات والمبيعات الفعلية",s.revenueTotal,"ر.س"]),t.push(["تكلفة البضاعة المباعة (التكلفة المتغيرة)",s.cogsTotal,"ر.س"]),t.push(["هامش المساهمة (مجمل الربح)",s.grossProfit,"ر.س"]),t.push(["نسبة هامش المساهمة الفعلي (Contribution Margin %)",s.cmPct.toFixed(2)+"%","%"]),t.push(["المصروفات المحددة للتعادل",s.fixedCosts,"ر.س"]),t.push(["إجمالي المصروفات الكلية بالدفاتر",s.opExpTotal,"ر.س"]),t.push(["نقطة التعادل بالمبيعات (Break-Even Sales)",s.breakEvenSales,"ر.س"]),t.push(["المعدل اليومي المطلوب للتعادل",s.dailyBreakEven,"ر.س / يوم"]),t.push(["المعدل اليومي الفعلي للمبيعات",s.dailyActual,"ر.س / يوم"]),t.push(["هامش الأمان (Margin of Safety)",s.marginOfSafetyVal,"ر.س"]),t.push(["نسبة هامش الأمان",s.marginOfSafetyPct.toFixed(2)+"%","%"]),t.push(["صافي الربح الفعلي بالفترة",s.netProfit,"ر.س"]),t.push([]);const d=[{label:`الفعلي (${s.cmPct.toFixed(1)}%)`,val:s.cmRatio},{label:"8.0%",val:.08},{label:"10.0%",val:.1},{label:"12.0%",val:.12},{label:"15.0%",val:.15},{label:"18.0%",val:.18},{label:"20.0%",val:.2},{label:"25.0%",val:.25}];t.push(["مصفوفة المبيعات المطلوبة عند مختلف الأرباح ونسب هوامش الربح:"]),t.push(["صافي الربح المستهدف",...d.map(a=>`عند هامش ${a.label}`)]),[0,5e3,1e4,15e3,2e4,25e3,3e4,4e4,5e4,75e3,1e5].forEach(a=>{const p=[a===0?"0 (نقطة التعادل)":a];d.forEach(h=>{const r=h.val>0?(s.fixedCosts+a)/h.val:0;p.push(r)}),t.push(p)}),t.push([]),t.push(["تفكيك المصروفات وحالة التحديد:","كود الحساب","اسم المصروف","التصنيف","المبلغ (ر.س)","حالة التحديد","المبيعات اللازمة لتغطيته"]),s.sortedExp.forEach(a=>{t.push(["مصروف",a.code,a.name,a.label,a.balance,a.isSelected?"محدد ومدرج":"مستبعد",a.salesNeeded])}),xt(t)};window.printBreakEvenPDF=async(n,i)=>{const s=ct(n,i,window._beSelectedExpenseCodes),{revenueTotal:t,cogsTotal:d,fixedCosts:a,opExpTotal:p,grossProfit:h,netProfit:r,cmPct:e,cmRatio:x,breakEvenSales:f,dailyBreakEven:u,dailyActual:w,marginOfSafetyPct:y,marginOfSafetyVal:T,sortedExp:k,days:z,selectedCount:m,totalCount:E}=s;let g={name:"شركة نظم الإمداد الحديثة",vatNumber:"312448150500003",crNumber:"4700123180",phone:"0549141648",email:"Nuzmalamdad@gmail.com",address:"7480 - الشارع: عامر الشعبي، ينبع",logoUrl:""};try{const c=JSON.parse(localStorage.getItem("idham_company")||"{}");c.name&&Object.assign(g,c),c.logoBase64&&(g.logoUrl=c.logoBase64)}catch{}const $=r>=0,v=[{label:`الفعلي (${e.toFixed(1)}%)`,val:x},{label:"10%",val:.1},{label:"15%",val:.15},{label:"20%",val:.2},{label:"25%",val:.25}],P=window.open("","_blank");if(!P){showToast("يرجى السماح بالنوافذ المنبثقة للطباعة","warn");return}P.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تقرير تحليل نقطة التعادل والأرباح المستهدفة CVP — ${n} إلى ${i}</title>
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
        <div>الفترة المالية: <strong>من ${n} إلى ${i} (${z} يوماً)</strong></div>
        <div>تاريخ الإصدار: <strong>${new Date().toLocaleDateString("ar-SA")}</strong></div>
        <div>نقطة التعادل للمصروفات المحددة: <strong>${o(f)}</strong></div>
      </div>
      <div class="banner-right">
        <h2>${g.name}</h2>
        <div>الرقم الضريبي: <strong>${g.vatNumber}</strong></div>
        <div>السجل التجاري: <strong>${g.crNumber}</strong></div>
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
        <div class="val" style="color:#4338ca;" dir="ltr">${o(u)}</div>
      </div>
      <div class="kpi-box" style="border-color:#f59e0b; background:#fefce8;">
        <div class="lbl">نسبة هامش المساهمة</div>
        <div class="val" style="color:#b45309;" dir="ltr">${e.toFixed(1)}%</div>
      </div>
      <div class="kpi-box" style="border-color:${$?"#22c55e":"#ef4444"}; background:${$?"#f0fdf4":"#fef2f2"};">
        <div class="lbl">هامش الأمان فوق التعادل</div>
        <div class="val" style="color:${$?"#15803d":"#b91c1c"};" dir="ltr">${y.toFixed(1)}%</div>
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
          <td style="font-family:'IBM Plex Mono',monospace; font-weight:700; text-align:left; color:#dc2626;" dir="ltr">(${o(a)})</td>
          <td style="text-align:center; font-weight:700; color:#dc2626;">${t>0?(a/t*100).toFixed(1):0}%</td>
          <td style="font-size:10.5px; color:#475569;">المحدد: ${m} من أصل ${E} بند مصروف</td>
        </tr>
        <tr style="background:${$?"#f0fdf4":"#fef2f2"}; font-weight:900;">
          <td style="color:${$?"#15803d":"#b91c1c"};"><strong>النتيجة النهائية للفترة</strong></td>
          <td style="font-family:'IBM Plex Mono',monospace; text-align:left; color:${$?"#15803d":"#b91c1c"};" dir="ltr">${o(r)}</td>
          <td style="text-align:center; color:${$?"#15803d":"#b91c1c"};">${t>0?(r/t*100).toFixed(1):0}%</td>
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
          ${v.map(c=>`<th style="text-align:left;">هامش ${c.label}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${[{label:"0 ر.س (نقطة التعادل)",profit:0},{label:"10,000 ر.س",profit:1e4},{label:"20,000 ر.س",profit:2e4},{label:"30,000 ر.س",profit:3e4},{label:"50,000 ر.س",profit:5e4},{label:"100,000 ر.س",profit:1e5}].map(c=>`
          <tr>
            <td><strong>${c.label}</strong></td>
            ${v.map(l=>{const C=l.val>0?(a+c.profit)/l.val:0;return`<td style="font-family:'IBM Plex Mono',monospace; font-weight:700; text-align:left;" dir="ltr">${o(C)}</td>`}).join("")}
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
        ${k.map(c=>`
          <tr style="${c.isSelected?"":"opacity:0.6; background:#f8fafc;"}">
            <td style="text-align:center; font-weight:bold;">${c.isSelected?"☑️":"◻️"}</td>
            <td style="font-family:'IBM Plex Mono',monospace; font-weight:700; color:#64748b;">${c.code}</td>
            <td style="font-weight:700;">${c.name} ${c.isSelected?"":'<span style="font-size:9.5px; color:#94a3b8;">(مستبعد)</span>'}</td>
            <td style="font-size:10px; color:#475569;">${c.label}</td>
            <td style="font-family:'IBM Plex Mono',monospace; text-align:left; color:#dc2626;" dir="ltr">${o(c.balance)}</td>
            <td style="font-family:'IBM Plex Mono',monospace; text-align:left; font-weight:700; color:#4338ca;" dir="ltr">${o(c.salesNeeded)}</td>
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
</html>`),P.document.close()};function rt(n,i,s){window._beCurrentContainer=n,window._beCurrentFrom=i,window._beCurrentTo=s;const t=ct(i,s,null);(!window._beSelectedExpenseCodes||!(window._beSelectedExpenseCodes instanceof Set))&&(window._beSelectedExpenseCodes=new Set((t.sortedExp||[]).map(l=>l.code)));const d=ct(i,s,window._beSelectedExpenseCodes),{revenueTotal:a,cogsTotal:p,fixedCosts:h,unselectedCosts:r,opExpTotal:e,grossProfit:x,netProfit:f,cmPct:u,cmRatio:w,breakEvenSales:y,dailyBreakEven:T,dailyActual:k,marginOfSafetyPct:z,marginOfSafetyVal:m,sortedExp:E,days:g,selectedCount:$,totalCount:v}=d,P=a>=y;typeof window._beTargetProfitVal>"u"&&(window._beTargetProfitVal=2e4),typeof window._beTargetMarginVal>"u"&&(window._beTargetMarginVal=parseFloat(u.toFixed(1))||15);const c=[{label:`الفعلي (${u.toFixed(1)}%)`,val:w,isActual:!0},{label:"8.0%",val:.08},{label:"10.0%",val:.1},{label:"12.0%",val:.12},{label:"15.0%",val:.15},{label:"18.0%",val:.18},{label:"20.0%",val:.2},{label:"25.0%",val:.25}];n.innerHTML=`
    <!-- Top Action Toolbar -->
    <div class="no-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; background:var(--bg-1); padding:12px 18px; border-radius:12px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); flex-wrap:wrap; gap:10px;">
      <div style="font-size:13px; font-weight:700; color:var(--text-2);">
        🎯 <strong style="color:var(--text-1);">تحليل نقطة التعادل والتحليل الحجمي للأرباح والتكاليف (CVP)</strong> | الفترة: <strong>${i}</strong> → <strong>${s}</strong> (${g} يوماً)
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="exportBreakEvenExcel('${i}', '${s}')" style="font-weight:700;">📊 تصدير Excel</button>
        <button class="btn btn-primary btn-sm" onclick="printBreakEvenPDF('${i}', '${s}')" style="font-weight:700; background:linear-gradient(135deg, #5b3ec2, #4338ca); border:none; box-shadow:0 2px 6px rgba(91,62,194,0.3);">📑 تصدير PDF التقرير التنفيذي للتعادل</button>
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
            ${o(y)}
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
            ${o(T)}
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
            ${u.toFixed(1)}%
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">مجمل الربح: <strong class="mono" dir="ltr">${o(x)}</strong></div>
        </div>

        <!-- Margin of Safety -->
        <div class="kpi-card" style="background:${P?"linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02))":"linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.02))"}; border:1.5px solid ${P?"rgba(16,185,129,0.4)":"rgba(239,68,68,0.4)"}; border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:${P?"#047857":"#b91c1c"};">🛡️ هامش الأمان (Safety)</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:${P?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.15)"}; color:${P?"#047857":"#b91c1c"};">${z.toFixed(1)}%</span>
          </div>
          <div style="font-size:22px; font-weight:900; color:${P?"#047857":"#b91c1c"}; font-family:'IBM Plex Mono', monospace;" dir="ltr">
            ${o(m)}
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">${P?"فائض أمان فوق التعادل":"عجز دون نقطة التعادل"}</div>
        </div>

      </div>

      <!-- ═══ EXECUTIVE SUMMARY STRIP ═══ -->
      <div class="card mb-24" style="border-radius:14px; padding:18px 24px; background:linear-gradient(135deg, rgba(91,62,194,0.08), rgba(91,62,194,0.02)); border:1.5px solid rgba(91,62,194,0.25); margin-bottom:24px;">
        <h4 style="color:#5b3ec2; margin-bottom:8px; font-size:15px; font-weight:900;">📋 التقرير والتشخيص التنفيذي:</h4>
        <div style="font-size:13px; line-height:1.7; color:var(--text-1);">
          • إجمالي المصروفات المحددة في الحسبة: <strong style="color:#dc2626;">${o(h)}</strong> (تم تحديد <strong>${$}</strong> من أصل <strong>${v}</strong> بند مصروف).<br>
          • نسبة هامش الربح الإجمالي الفعلي (هامش المساهمة) تمثل <strong>${u.toFixed(1)}%</strong> من قيمة المبيعات.<br>
          • بناءً على ذلك، نقطة التعادل المطلوبة لتغطية المصروفات المحددة هي <strong style="color:#1d4ed8;">${o(y)}</strong> (بمعدل <strong>${o(T)}</strong> يومياً).<br>
          • ${P?`<span style="color:#16a34a; font-weight:700;">✅ المبيعات الحالية (${o(a)}) تجاوزت نقطة التعادل بفائض قدره ${o(m)} (هامش أمان ${z.toFixed(1)}%).</span>`:`<span style="color:#dc2626; font-weight:700;">⚠️ المبيعات الحالية (${o(a)}) دون نقطة التعادل بفارق ${o(Math.abs(m))}. لتحقيق الربحية ينصح برفع هامش الربح أو زيادة حجم التوزيع أو تقسيط المصروفات السنوية.</span>`}
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
              <button class="btn btn-sm btn-ghost" onclick="setTargetMarginPreset(${u.toFixed(1)})" style="font-size:10.5px; padding:2px 6px; color:#5b3ec2; font-weight:800; border:1px solid #5b3ec2;">الفعلي (${u.toFixed(1)}%)</button>
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
                  ${c.map(l=>`
                    <th style="text-align:left; min-width:115px; ${l.isActual?"background:rgba(91,62,194,0.12); color:#4338ca; font-weight:900;":""}">
                      هامش ${l.label}
                    </th>
                  `).join("")}
                </tr>
              </thead>
              <tbody>
                ${[{profit:0,label:"0 ر.س (نقطة التعادل)"},{profit:5e3,label:"5,000 ر.س"},{profit:1e4,label:"10,000 ر.س"},{profit:15e3,label:"15,000 ر.س"},{profit:2e4,label:"20,000 ر.س",isHighlight:!0},{profit:25e3,label:"25,000 ر.س"},{profit:3e4,label:"30,000 ر.س",isHighlight:!0},{profit:4e4,label:"40,000 ر.س"},{profit:5e4,label:"50,000 ر.س"},{profit:75e3,label:"75,000 ر.س"},{profit:1e5,label:"100,000 ر.س"}].map(l=>{const C=window._beTargetProfitVal===l.profit;return`
                    <tr style="border-bottom:1px solid var(--border-soft); ${C?"background:rgba(2,132,199,0.08); font-weight:800;":l.isHighlight?"background:rgba(91,62,194,0.03);":""}">
                      <td style="position:sticky; right:0; background:${C?"#f0f9ff":"var(--bg-1)"}; z-index:1; font-weight:800;">
                        ${l.label}
                        ${l.isHighlight?'<span style="font-size:9px; background:#5b3ec2; color:#fff; padding:1px 4px; border-radius:3px; margin-right:3px;">شائع</span>':""}
                      </td>
                      ${c.map(S=>{const b=S.val>0?(h+l.profit)/S.val:0,I=a>=b&&b>0,M=C&&Math.abs(S.val*100-window._beTargetMarginVal)<.2;return`
                          <td class="mono" style="text-align:left; ${S.isActual?"background:rgba(91,62,194,0.05); font-weight:800;":""} ${M?"outline:2px solid #0284c7; background:rgba(2,132,199,0.15); font-weight:900;":""}" dir="ltr">
                            <span style="color:${I?"#15803d":"#1e293b"}; font-weight:${I?"800":"600"};">
                              ${o(b)}
                            </span>
                            ${I?'<span style="color:#15803d; font-size:10px;"> ✅</span>':""}
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
              المحدد: ${$} من ${v} بند | الإجمالي: ${o(h)}
            </span>
            ${r>0?`
              <span style="font-size:11.5px; font-weight:700; color:var(--text-3); background:var(--bg-2); padding:4px 8px; border-radius:8px;">
                مستبعد: ${o(r)}
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
                  <input type="checkbox" id="be-master-check" ${$===v?"checked":""} onchange="toggleBEMasterCheck(this.checked)" style="cursor:pointer; width:16px; height:16px;" title="تحديد/إلغاء تحديد الكل" />
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
              ${E.map((l,C)=>`
                <tr style="border-bottom:1px solid var(--border-soft); ${l.isSelected?C%2===1?"background:rgba(0,0,0,0.015);":"":"opacity:0.5; background:var(--bg-2);"}">
                  <td style="text-align:center;">
                    <input type="checkbox" class="be-item-check" data-code="${l.code}" ${l.isSelected?"checked":""} onchange="toggleBEExpenseItem('${l.code}')" style="cursor:pointer; width:16px; height:16px;" />
                  </td>
                  <td class="mono font-bold" style="color:var(--text-3);">${l.code}</td>
                  <td style="font-weight:700; color:var(--text-1);">
                    ${l.name}
                    ${l.isSelected?"":'<span style="font-size:10px; color:#dc2626; margin-right:4px;">(مستبعد)</span>'}
                  </td>
                  <td>
                    <span style="font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:6px; background:${l.badgeBg}; color:${l.badgeColor};">
                      ${l.label}
                    </span>
                  </td>
                  <td class="mono font-bold" style="text-align:left; color:#dc2626;" dir="ltr">${o(l.balance)}</td>
                  <td style="text-align:center; font-weight:700; color:var(--text-2); font-size:11.5px;">
                    ${l.isSelected?l.pctOfSelected.toFixed(1)+"%":"—"}
                  </td>
                  <td class="mono font-bold" style="text-align:left; color:${l.isSelected?"#4338ca":"var(--text-3)"};" dir="ltr">
                    ${l.isSelected?o(l.salesNeeded):"—"}
                  </td>
                  <td class="mono dim" style="text-align:left; font-size:11.5px;" dir="ltr">
                    ${l.isSelected?o(l.salesNeeded/g):"—"}
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
                <td class="mono" style="text-align:left; color:#4338ca;" dir="ltr">${o(y)}</td>
                <td class="mono" style="text-align:left; color:#4338ca;" dir="ltr">${o(T)}</td>
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
              <span class="mono font-bold" id="sim-cm-val" style="color:#b45309; font-size:14px;">${u.toFixed(1)}%</span>
            </div>
            <input type="range" id="sim-cm-slider" min="3" max="40" step="0.5" value="${u.toFixed(1)}" oninput="updateBESimulator()" style="width:100%; cursor:pointer;" />
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
            <div class="mono font-bold" id="sim-res-be" style="font-size:20px; color:#1d4ed8;" dir="ltr">${o(y)}</div>
            <div style="font-size:11px; color:var(--text-3);" id="sim-res-be-daily">${o(T)} / يومياً</div>
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
  `,window._beCurrentData=d,window.toggleBEExpenseItem=l=>{window._beSelectedExpenseCodes||(window._beSelectedExpenseCodes=new Set),window._beSelectedExpenseCodes.has(l)?window._beSelectedExpenseCodes.delete(l):window._beSelectedExpenseCodes.add(l);const C=window.scrollY||document.documentElement.scrollTop;rt(window._beCurrentContainer,window._beCurrentFrom,window._beCurrentTo),window.scrollTo(0,C)},window.toggleBEMasterCheck=l=>{window._beSelectedExpenseCodes||(window._beSelectedExpenseCodes=new Set),l?window._beCurrentData.sortedExp.forEach(S=>window._beSelectedExpenseCodes.add(S.code)):window._beSelectedExpenseCodes.clear();const C=window.scrollY||document.documentElement.scrollTop;rt(window._beCurrentContainer,window._beCurrentFrom,window._beCurrentTo),window.scrollTo(0,C)},window.setBEPreset=l=>{window._beSelectedExpenseCodes||(window._beSelectedExpenseCodes=new Set),window._beSelectedExpenseCodes.clear();const C=window._beCurrentData.sortedExp;l==="all"?C.forEach(b=>window._beSelectedExpenseCodes.add(b.code)):l==="core_fixed"?C.filter(b=>b.isCoreFixed).forEach(b=>window._beSelectedExpenseCodes.add(b.code)):l==="cash_only"&&C.filter(b=>b.isCash).forEach(b=>window._beSelectedExpenseCodes.add(b.code));const S=window.scrollY||document.documentElement.scrollTop;rt(window._beCurrentContainer,window._beCurrentFrom,window._beCurrentTo),window.scrollTo(0,S)},window.setTargetProfitPreset=l=>{window._beTargetProfitVal=parseFloat(l)||0;const C=document.getElementById("be-target-profit-input");C&&(C.value=window._beTargetProfitVal);const S=document.getElementById("sim-target-profit");S&&(S.value=window._beTargetProfitVal),window.updateTargetProfitCalc(),window.updateBESimulator()},window.setTargetMarginPreset=l=>{window._beTargetMarginVal=parseFloat(l)||15;const C=document.getElementById("be-target-margin-input");C&&(C.value=window._beTargetMarginVal);const S=document.getElementById("sim-cm-slider");S&&(S.value=window._beTargetMarginVal),window.updateTargetProfitCalc(),window.updateBESimulator()},window.updateTargetProfitCalc=()=>{const l=window._beCurrentData;if(!l)return;const C=document.getElementById("be-target-profit-input"),S=parseFloat(C?.value??window._beTargetProfitVal??0);window._beTargetProfitVal=S;const b=document.getElementById("be-target-margin-input"),I=parseFloat(b?.value??window._beTargetMarginVal??l.cmPct);window._beTargetMarginVal=I;const M=I/100,B=M>0?(l.fixedCosts+S)/M:0,_=l.days>0?B/l.days:0,A=l.revenueTotal-B,F=A>=0&&B>0,O=l.revenueTotal>0&&B>l.revenueTotal?((B-l.revenueTotal)/l.revenueTotal*100).toFixed(1)+"%":"0%",W=B>0?(S/B*100).toFixed(1)+"%":"0%",U=document.getElementById("tp-res-sales"),q=document.getElementById("tp-res-daily"),H=document.getElementById("tp-res-gap"),V=document.getElementById("tp-res-status"),J=document.getElementById("tp-res-growth"),G=document.getElementById("tp-res-net-margin");U&&(U.textContent=o(B)),q&&(q.textContent=o(_)+" / يومياً"),H&&(H.textContent=(F?"+":"-")+o(Math.abs(A)),H.style.color=F?"#15803d":"#dc2626"),V&&(V.textContent=F?`✅ تم تجاوز هذا الربح بفائض قدره ${o(A)}`:`⏳ متبقي مبيعات إضافية قدرها ${o(Math.abs(A))} لتحقيق الهدف`,V.style.color=F?"#15803d":"#dc2626"),J&&(J.textContent=F?"✅ محقق بالفعل":`+${O}`,J.style.color=F?"#15803d":"#4338ca"),G&&(G.textContent="هامش صافي من المبيعات: "+W)},window.updateBESimulator=()=>{const l=window._beCurrentData;if(!l)return;const C=parseFloat(document.getElementById("sim-cm-slider")?.value||l.cmPct),S=parseFloat(document.getElementById("sim-exp-slider")?.value||0),b=parseFloat(document.getElementById("sim-target-profit")?.value||window._beTargetProfitVal||0),I=document.getElementById("sim-cm-val"),M=document.getElementById("sim-exp-adj-val");I&&(I.textContent=C.toFixed(1)+"%"),M&&(M.textContent=(S>=0?"+":"")+S+"%");const B=C/100,_=l.fixedCosts*(1+S/100),A=B>0?_/B:0,F=l.days>0?A/l.days:0,O=B>0?(_+b)/B:0,W=l.days>0?O/l.days:0,U=l.revenueTotal*B-_,q=l.revenueTotal>0?U/l.revenueTotal*100:0,H=document.getElementById("sim-res-be"),V=document.getElementById("sim-res-be-daily"),J=document.getElementById("sim-res-target-sales"),G=document.getElementById("sim-res-target-daily"),tt=document.getElementById("sim-res-profit"),et=document.getElementById("sim-res-profit-margin");H&&(H.textContent=o(A)),V&&(V.textContent=o(F)+" / يومياً"),J&&(J.textContent=o(O)),G&&(G.textContent=o(W)+" / يومياً"),tt&&(tt.textContent=o(U),tt.style.color=U>=0?"#15803d":"#b91c1c"),et&&(et.textContent="هامش صافي: "+q.toFixed(1)+"%")},window.resetBESimulator=()=>{const l=window._beCurrentData;if(!l)return;const C=document.getElementById("sim-cm-slider"),S=document.getElementById("sim-exp-slider"),b=document.getElementById("sim-target-profit");C&&(C.value=l.cmPct.toFixed(1)),S&&(S.value=0),b&&(b.value=window._beTargetProfitVal||2e4),window.updateBESimulator()},setTimeout(()=>{window.updateTargetProfitCalc(),window.updateBESimulator()},40)}let ht=[],j="balance",L="desc",Pt=[];async function Ot(n,i,s){n.innerHTML='<div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin fa-2x" style="color:var(--brand);"></i><div style="margin-top:10px;font-weight:700;color:var(--text-1);">جاري مطابقة فواتير وسندات ومديونيات العملاء واحتساب أعمار الديون بدقة…</div></div>';try{const[t,d]=await Promise.all([Q(ot.customers()),Q(ot.salesInvoices())]),a={};(d||[]).forEach(e=>{if(e.status==="cancelled")return;const x=e.customerId;x&&(a[x]||(a[x]=[]),a[x].push(e))}),Object.values(a).forEach(e=>{e.sort((x,f)=>(f.date||"").localeCompare(x.date||""))});const p=new Date;p.setHours(0,0,0,0);const h=[],r=new Set;(t||[]).forEach(e=>{const x=parseFloat(e.balance||0);if(x<=0)return;const f=(e.repName||e.salesRepName||"بدون مندوب").trim();f&&f!=="بدون مندوب"&&r.add(f);const u=parseInt(e.creditDays||0,10);let w=0,y=0,T=0,k=0,z=0,m=x;const E=a[e.id]||[];for(const g of E){if(m<=0)break;const $=parseFloat(g.totalWithVat||g.total||0);if($<=0)continue;const v=Math.min(m,$);m-=v;const P=g.date?new Date(g.date):p,l=Math.max(0,Math.floor((p-P)/(1e3*60*60*24)))-u;l<=0?w+=v:l<=30?y+=v:l<=60?T+=v:l<=90?k+=v:z+=v}m>0&&(z+=m),h.push({id:e.id,name:e.name||"عميل مجهول",code:e.code||"",phone:e.phone||"",repName:f||"بدون مندوب",creditLimit:parseFloat(e.creditLimit||0),creditDays:u,balance:x,current:w,aging1_30:y,aging31_60:T,aging61_90:k,agingOver90:z,totalRemaining:x})}),ht=h,Pt=Array.from(r).sort(),zt(n)}catch(t){n.innerHTML=`<div class="alert bad">خطأ في احتساب أعمار الديون: ${t.message}</div>`}}function zt(n){n.innerHTML=`
    <!-- Header & Action Buttons -->
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:16px;">
      <div>
        <h2 style="margin:0;color:var(--brand);font-size:18px;display:flex;align-items:center;gap:8px;">
          <span>⏳ تقرير مديونيات وأعمار ديون العملاء</span>
        </h2>
        <div style="font-size:12px;color:var(--text-2);margin-top:4px;">
          تاريخ التقرير: ${new Date().toLocaleDateString("ar-SA-u-nu-latn")} • مطابق 100% لأرصدة كشوف الحسابات ودفاتر الأستاذ
        </div>
      </div>
      <div class="no-print" style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn btn-secondary" onclick="window.exportAgedReceivablesExcel()" style="white-space:nowrap; display:inline-flex; align-items:center; gap:6px;">
          📥 تصدير Excel
        </button>
        <button class="btn btn-primary" onclick="window.exportAgedReceivablesPDF()" style="white-space:nowrap; display:inline-flex; align-items:center; gap:6px;">
          🖨️ طباعة / PDF
        </button>
      </div>
    </div>

    <!-- Live KPI Summary Strip -->
    <div class="grid-4 gap-12 mb-16" id="ar-kpi-strip" style="grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));">
      <div style="background:var(--bg-card); padding:12px 14px; border-radius:10px; border:1px solid rgba(99,102,241,0.25);">
        <div style="font-size:11px; color:var(--text-2); font-weight:700;">💰 إجمالي المديونيات المستحقة</div>
        <div class="mono" id="ar-kpi-total" style="font-size:17px; font-weight:900; color:var(--brand); margin-top:4px;">0.00 ر.س</div>
      </div>
      <div style="background:var(--bg-card); padding:12px 14px; border-radius:10px; border:1px solid rgba(16,185,129,0.25);">
        <div style="font-size:11px; color:#10B981; font-weight:700;">🟢 غير مستحق (خلال المهلة)</div>
        <div class="mono" id="ar-kpi-current" style="font-size:17px; font-weight:900; color:#10B981; margin-top:4px;">0.00 ر.س</div>
      </div>
      <div style="background:var(--bg-card); padding:12px 14px; border-radius:10px; border:1px solid rgba(245,158,11,0.25);">
        <div style="font-size:11px; color:#F59E0B; font-weight:700;">🟡 متأخر (1 - 30 يوم)</div>
        <div class="mono" id="ar-kpi-30" style="font-size:17px; font-weight:900; color:#F59E0B; margin-top:4px;">0.00 ر.س</div>
      </div>
      <div style="background:var(--bg-card); padding:12px 14px; border-radius:10px; border:1px solid rgba(249,115,22,0.25);">
        <div style="font-size:11px; color:#F97316; font-weight:700;">🟠 متأخر (31 - 60 يوم)</div>
        <div class="mono" id="ar-kpi-60" style="font-size:17px; font-weight:900; color:#F97316; margin-top:4px;">0.00 ر.س</div>
      </div>
      <div style="background:var(--bg-card); padding:12px 14px; border-radius:10px; border:1px solid rgba(220,38,38,0.25);">
        <div style="font-size:11px; color:#DC2626; font-weight:700;">🔴 متأخر (61 - 90 يوم)</div>
        <div class="mono" id="ar-kpi-90" style="font-size:17px; font-weight:900; color:#DC2626; margin-top:4px;">0.00 ر.س</div>
      </div>
      <div style="background:var(--bg-card); padding:12px 14px; border-radius:10px; border:1px solid rgba(185,28,28,0.35); background:linear-gradient(135deg, var(--bg-card), rgba(185,28,28,0.05));">
        <div style="font-size:11px; color:#B91C1C; font-weight:800;">⛔ متعثر حرج (+90 يوم)</div>
        <div class="mono" id="ar-kpi-over90" style="font-size:17px; font-weight:900; color:#B91C1C; margin-top:4px;">0.00 ر.س</div>
      </div>
      <div style="background:var(--bg-card); padding:12px 14px; border-radius:10px; border:1px solid var(--border-soft);">
        <div style="font-size:11px; color:var(--text-2); font-weight:700;">👥 عدد العملاء المدينين</div>
        <div class="mono" id="ar-kpi-count" style="font-size:17px; font-weight:900; color:var(--text-0); margin-top:4px;">0 عميل</div>
      </div>
    </div>

    <!-- Filter Control Bar -->
    <div class="card mb-16 no-print" style="padding:12px 16px; background:var(--bg-card); border:1px solid var(--border-soft);">
      <div style="display:flex; align-items:center; flex-wrap:wrap; gap:12px;">
        
        <!-- Rep Filter -->
        <div style="display:flex; align-items:center; gap:6px; min-width:180px;">
          <label style="font-size:12px; font-weight:700; color:var(--text-2); white-space:nowrap;">👤 المندوب:</label>
          <select id="ar-rep-filter" class="input" style="padding:6px 10px; font-size:12px;" onchange="window.filterAgedReceivables()">
            <option value="">جميع المناديب</option>
            ${Pt.map(i=>`<option value="${i}">${i}</option>`).join("")}
          </select>
        </div>

        <!-- Overdue Risk Filter -->
        <div style="display:flex; align-items:center; gap:6px; min-width:180px;">
          <label style="font-size:12px; font-weight:700; color:var(--text-2); white-space:nowrap;">⏳ فئة التأخير:</label>
          <select id="ar-risk-filter" class="input" style="padding:6px 10px; font-size:12px;" onchange="window.filterAgedReceivables()">
            <option value="all">جميع المديونيات</option>
            <option value="over90">🔴 متعثرة حرجة (+90 يوم)</option>
            <option value="over60">🟠 متأخرة (+60 يوم فما فوق)</option>
            <option value="over30">🟡 متأخرة (+30 يوم فما فوق)</option>
            <option value="current">🟢 جارية / غير متأخرة فقط</option>
          </select>
        </div>

        <!-- Search Input -->
        <div style="position:relative; flex:1; min-width:200px; max-width:320px;">
          <input type="text" id="ar-search-input" class="input" placeholder="🔍 بحث باسم العميل أو الكود..." style="padding:6px 12px; font-size:12px; width:100%;" oninput="window.filterAgedReceivables()" />
        </div>

        <!-- Quick Sort Presets -->
        <div style="margin-right:auto; display:flex; gap:6px; align-items:center;">
          <span style="font-size:11.5px; color:var(--text-2); font-weight:700;">ترتيب سريع:</span>
          <button class="btn btn-secondary btn-sm" onclick="window.sortAgedReceivables('balance')" title="ترتيب حسب إجمالي المديونية">
            💰 المبلغ ${j==="balance"?L==="desc"?"▼":"▲":""}
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.sortAgedReceivables('agingOver90')" title="ترتيب حسب الأكثر تعثراً (+90 يوم)">
            ⛔ الأكثر تعثراً ${j==="agingOver90"?L==="desc"?"▼":"▲":""}
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card" style="padding:0; overflow:hidden;">
      <div class="table-container" style="overflow-x:auto;">
        <table class="data-dense" style="width:100%; border-collapse:collapse; font-size:12px; margin:0;" id="ar-table">
          <thead>
            <tr style="background:var(--bg-2); border-bottom:2px solid var(--border);">
              <th style="padding:10px 8px; text-align:center; width:35px;">#</th>
              <th style="padding:10px 8px; text-align:right; cursor:pointer;" onclick="window.sortAgedReceivables('name')" title="انقر للترتيب حسب اسم العميل">
                العميل ${j==="name"?L==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
              </th>
              <th style="padding:10px 8px; text-align:right; cursor:pointer;" onclick="window.sortAgedReceivables('repName')" title="انقر للترتيب حسب المندوب">
                المندوب ${j==="repName"?L==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
              </th>
              <th style="padding:10px 8px; text-align:center; width:55px;">المهلة</th>
              <th style="padding:10px 8px; text-align:left; color:var(--brand); cursor:pointer; font-weight:800;" onclick="window.sortAgedReceivables('balance')" title="انقر للترتيب حسب إجمالي المديونية">
                إجمالي المديونية ${j==="balance"?L==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
              </th>
              <th style="padding:10px 8px; text-align:left; color:#10B981; cursor:pointer;" onclick="window.sortAgedReceivables('current')" title="انقر للترتيب">
                غير مستحق ${j==="current"?L==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
              </th>
              <th style="padding:10px 8px; text-align:left; color:#F59E0B; cursor:pointer;" onclick="window.sortAgedReceivables('aging1_30')" title="انقر للترتيب">
                متأخر (1-30) ${j==="aging1_30"?L==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
              </th>
              <th style="padding:10px 8px; text-align:left; color:#F97316; cursor:pointer;" onclick="window.sortAgedReceivables('aging31_60')" title="انقر للترتيب">
                متأخر (31-60) ${j==="aging31_60"?L==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
              </th>
              <th style="padding:10px 8px; text-align:left; color:#DC2626; cursor:pointer;" onclick="window.sortAgedReceivables('aging61_90')" title="انقر للترتيب">
                متأخر (61-90) ${j==="aging61_90"?L==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
              </th>
              <th style="padding:10px 8px; text-align:left; color:#B91C1C; font-weight:900; cursor:pointer;" onclick="window.sortAgedReceivables('agingOver90')" title="انقر للترتيب حسب الأكثر تعثراً">
                متعثر (+90 يوم) ${j==="agingOver90"?L==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
              </th>
              <th style="padding:10px 8px; text-align:center; width:85px;" class="no-print">إجراءات</th>
            </tr>
          </thead>
          <tbody id="ar-tbody"></tbody>
          <tfoot id="ar-tfoot"></tfoot>
        </table>
      </div>
    </div>
  `,window.filterAgedReceivables()}window.filterAgedReceivables=()=>{const n=document.getElementById("ar-rep-filter")?.value||"",i=document.getElementById("ar-risk-filter")?.value||"all",s=(document.getElementById("ar-search-input")?.value||"").trim().toLowerCase();let t=[...ht];n&&(t=t.filter(r=>r.repName===n)),i==="over90"?t=t.filter(r=>r.agingOver90>0):i==="over60"?t=t.filter(r=>r.agingOver90+r.aging61_90>0):i==="over30"?t=t.filter(r=>r.agingOver90+r.aging61_90+r.aging31_60>0):i==="current"&&(t=t.filter(r=>r.current>0&&r.aging1_30===0&&r.aging31_60===0&&r.aging61_90===0&&r.agingOver90===0)),s&&(t=t.filter(r=>(r.name||"").toLowerCase().includes(s)||(r.code||"").toLowerCase().includes(s)||(r.phone||"").includes(s)||(r.repName||"").toLowerCase().includes(s))),t.sort((r,e)=>{let x=r[j],f=e[j];return typeof x=="string"?L==="asc"?x.localeCompare(f):f.localeCompare(x):(x=parseFloat(x||0),f=parseFloat(f||0),L==="asc"?x-f:f-x)});const d={balance:0,current:0,aging1_30:0,aging31_60:0,aging61_90:0,agingOver90:0};t.forEach(r=>{d.balance+=r.balance,d.current+=r.current,d.aging1_30+=r.aging1_30,d.aging31_60+=r.aging31_60,d.aging61_90+=r.aging61_90,d.agingOver90+=r.agingOver90}),window._agedReceivablesRows=t,window._agedReceivablesTotals=d;const a=(r,e)=>{const x=document.getElementById(r);x&&(x.textContent=e)};a("ar-kpi-total",o(d.balance)),a("ar-kpi-current",o(d.current)),a("ar-kpi-30",o(d.aging1_30)),a("ar-kpi-60",o(d.aging31_60)),a("ar-kpi-90",o(d.aging61_90)),a("ar-kpi-over90",o(d.agingOver90)),a("ar-kpi-count",`${t.length} عميل`);const p=document.getElementById("ar-tbody"),h=document.getElementById("ar-tfoot");if(!(!p||!h)){if(!t.length){p.innerHTML='<tr><td colspan="11" style="text-align:center; padding:36px; color:var(--text-2);">لا توجد مديونيات مطابقة لمعايير الفلترة المحددة</td></tr>',h.innerHTML="";return}p.innerHTML=t.map((r,e)=>`
    <tr style="border-bottom:1px solid var(--border-soft); transition:background .15s;" onmouseover="this.style.background='rgba(99,102,241,0.03)'" onmouseout="this.style.background=''">
      <td style="padding:10px 8px; text-align:center; color:var(--text-2); font-size:11px;">${e+1}</td>
      <td style="padding:10px 8px;">
        <div style="font-weight:700; color:var(--text-0); cursor:pointer; display:inline-block;" onclick="window.openCustomerStatementFromAging('${r.id}')" title="انقر لفتح كشف الحساب">
          ${r.name}
        </div>
        ${r.code?`<div style="font-size:10.5px; color:var(--text-2); font-family:monospace;">كود: ${r.code}</div>`:""}
      </td>
      <td style="padding:10px 8px; color:var(--text-1);">${r.repName}</td>
      <td style="padding:10px 8px; text-align:center; color:var(--text-2); font-family:monospace;">${r.creditDays?`${r.creditDays} ي`:"—"}</td>
      <td class="mono font-bold" style="padding:10px 8px; text-align:left; color:var(--brand); font-size:13px;">${o(r.balance)}</td>
      <td class="mono" style="padding:10px 8px; text-align:left; color:${r.current?"#10B981":"var(--text-dim)"}; font-weight:${r.current?"700":"normal"};">${r.current?o(r.current):"—"}</td>
      <td class="mono" style="padding:10px 8px; text-align:left; color:${r.aging1_30?"#F59E0B":"var(--text-dim)"}; font-weight:${r.aging1_30?"700":"normal"};">${r.aging1_30?o(r.aging1_30):"—"}</td>
      <td class="mono" style="padding:10px 8px; text-align:left; color:${r.aging31_60?"#F97316":"var(--text-dim)"}; font-weight:${r.aging31_60?"700":"normal"};">${r.aging31_60?o(r.aging31_60):"—"}</td>
      <td class="mono" style="padding:10px 8px; text-align:left; color:${r.aging61_90?"#DC2626":"var(--text-dim)"}; font-weight:${r.aging61_90?"700":"normal"};">${r.aging61_90?o(r.aging61_90):"—"}</td>
      <td class="mono font-bold" style="padding:10px 8px; text-align:left; color:${r.agingOver90?"#B91C1C":"var(--text-dim)"}; font-size:${r.agingOver90?"13px":"12px"}; background:${r.agingOver90?"rgba(185,28,28,0.05)":"transparent"};">${r.agingOver90?o(r.agingOver90):"—"}</td>
      <td style="padding:6px 8px; text-align:center; white-space:nowrap;" class="no-print">
        <div style="display:inline-flex; gap:4px; align-items:center;">
          <button class="btn btn-icon sm btn-ghost" onclick="window.openCustomerStatementFromAging('${r.id}')" title="عرض كشف حساب العميل">
            📊
          </button>
          ${r.phone?`
            <button class="btn btn-icon sm btn-ghost" onclick="window.sendCustomerDebtWhatsApp('${r.id}')" title="إرسال تذكير سداد عبر واتساب" style="color:#25D366;">
              💬
            </button>
          `:""}
        </div>
      </td>
    </tr>
  `).join(""),h.innerHTML=`
    <tr style="background:var(--bg-2); border-top:2px solid var(--border); font-weight:bold; font-size:12px;">
      <td colspan="4" style="padding:12px 8px; font-weight:900;">الإجمالي العام (${t.length} عميل)</td>
      <td class="mono font-bold" style="padding:12px 8px; text-align:left; color:var(--brand); font-size:13.5px;">${o(d.balance)}</td>
      <td class="mono font-bold" style="padding:12px 8px; text-align:left; color:#10B981;">${o(d.current)}</td>
      <td class="mono font-bold" style="padding:12px 8px; text-align:left; color:#F59E0B;">${o(d.aging1_30)}</td>
      <td class="mono font-bold" style="padding:12px 8px; text-align:left; color:#F97316;">${o(d.aging31_60)}</td>
      <td class="mono font-bold" style="padding:12px 8px; text-align:left; color:#DC2626;">${o(d.aging61_90)}</td>
      <td class="mono font-bold" style="padding:12px 8px; text-align:left; color:#B91C1C; font-size:13px; background:rgba(185,28,28,0.06);">${o(d.agingOver90)}</td>
      <td class="no-print"></td>
    </tr>
  `}};window.sortAgedReceivables=n=>{j===n?L=L==="desc"?"asc":"desc":(j=n,L=n==="name"||n==="repName"?"asc":"desc");const i=document.getElementById("fin-report-body");i&&zt(i)};window.openCustomerStatementFromAging=n=>{typeof window.navigate=="function"&&(window.navigate("customer-statement"),setTimeout(()=>{typeof window.selectStmtCustomer=="function"&&window.selectStmtCustomer(n)},250))};window.sendCustomerDebtWhatsApp=n=>{const i=ht.find(p=>p.id===n);if(!i)return;const s=(i.phone||"").replace(/[^0-9]/g,"");if(!s){window.showToast&&window.showToast("رقم جوال العميل غير مسجل","warning");return}const t=s.startsWith("0")?"966"+s.slice(1):s.startsWith("966")?s:"966"+s,d=window.ERP_COMPANY?.name||"مؤسسة إدهام للمواد الغذائية",a=`مرحباً ${i.name}،
تحية طيبة من ${d}.
نود تذكيركم بأن إجمالي الرصيد المستحق على حسابكم هو: *${o(i.balance)}*.
`+(i.agingOver90>0?`⛔ مبالغ متأخرة أكثر من 90 يوم: *${o(i.agingOver90)}*
`:"")+(i.aging61_90>0?`⚠️ مبالغ متأخرة (61-90 يوم): *${o(i.aging61_90)}*
`:"")+"يرجى التكرم بالترتيب لسداد المبلغ، شاكرين ومقدرين حسن تعاونكم الدائم معنا!";window.open(`https://api.whatsapp.com/send?phone=${t}&text=${encodeURIComponent(a)}`,"_blank")};window.exportAgedReceivablesExcel=async()=>{const n=window._agedReceivablesRows,i=window._agedReceivablesTotals;if(!n||n.length===0){window.showToast?window.showToast("لا توجد بيانات لتصديرها","warning"):alert("لا توجد بيانات لتصديرها");return}const s=`تقرير مديونيات وأعمار ديون العملاء - ${new Date().toLocaleDateString("ar-SA-u-nu-latn")}`,t=["#","العميل","الكود","المندوب","الهاتف","مهلة الائتمان (أيام)","إجمالي المديونية (الرصيد)","غير مستحق (خلال المهلة)","متأخر (1-30 يوم)","متأخر (31-60 يوم)","متأخر (61-90 يوم)","متعثر (+90 يوم)"],d=n.map((p,h)=>[h+1,p.name,p.code||"—",p.repName,p.phone||"—",p.creditDays||0,Math.round(p.balance*100)/100,Math.round(p.current*100)/100,Math.round(p.aging1_30*100)/100,Math.round(p.aging31_60*100)/100,Math.round(p.aging61_90*100)/100,Math.round(p.agingOver90*100)/100]);i&&d.push(["الإجمالي العام",`عدد العملاء: ${n.length}`,"","","","",Math.round(i.balance*100)/100,Math.round(i.current*100)/100,Math.round(i.aging1_30*100)/100,Math.round(i.aging31_60*100)/100,Math.round(i.aging61_90*100)/100,Math.round(i.agingOver90*100)/100]);const a=[6,32,14,20,16,16,20,20,18,18,18,20];try{await xt({title:s,headers:t,rows:d,colWidths:a})}catch(p){console.error("Export Aged Receivables Excel error:",p),alert("حدث خطأ أثناء التصدير: "+p.message)}};window.exportAgedReceivablesPDF=()=>{if(!window._agedReceivablesRows||window._agedReceivablesRows.length===0){window.showToast?window.showToast("لا توجد بيانات للطباعة","warning"):alert("لا توجد بيانات للطباعة");return}window.print()};async function Nt(n,i,s){n.innerHTML='<div class="page-loading"><div class="loading-spinner"></div><span>جارٍ تحليل بيانات العملاء…</span></div>';try{nt||(nt=await Q(ot.salesInvoices())),it||(it=await Q(ot.receipts()));const t=window.custperfRep||"",d=Math.max(1,Math.round((new Date(s)-new Date(i))/864e5)+1),a=nt.filter(e=>!(e.status==="cancelled"||e.date<i||e.date>s||t&&e.repName!==t)),p=it.filter(e=>!(!e.date||e.date<i||e.date>s||e.entityType&&e.entityType!=="customer")),h=await Q(ot.customers()),r={};h.forEach(e=>{r[e.id]={id:e.id,name:e.name,repName:e.repName||"بدون مندوب",invoiceCount:0,totalSales:0,netRevenue:0,totalCost:0,paidAmount:0,collectedViaReceipts:0,lastInvoiceDate:"",lastReceiptDate:""}});for(const e of a){const x=e.customerId||"unknown";r[x]||(r[x]={id:x,name:e.customerName||x,repName:e.repName||"بدون مندوب",invoiceCount:0,totalSales:0,netRevenue:0,totalCost:0,paidAmount:0,collectedViaReceipts:0,lastInvoiceDate:"",lastReceiptDate:""});const f=r[x];f.invoiceCount++,f.totalSales+=parseFloat(e.totalWithVat||e.total||0),f.netRevenue+=parseFloat(e.subtotal||e.total||0),f.totalCost+=parseFloat(e.totalCost||0);const u=(e.paymentMethod||"cash").toLowerCase();(u==="cash"||u==="نقدي"||u==="partial"||u==="جزئي")&&(f.paidAmount+=parseFloat(e.paidAmount||0)),(!f.lastInvoiceDate||e.date>f.lastInvoiceDate)&&(f.lastInvoiceDate=e.date)}for(const e of p){const x=e.targetId||e.customerId||"";r[x]&&(r[x].collectedViaReceipts+=parseFloat(e.amount||0),(!r[x].lastReceiptDate||e.date>r[x].lastReceiptDate)&&(r[x].lastReceiptDate=e.date))}D=Object.values(r).filter(e=>e.totalSales>0||e.collectedViaReceipts>0).map(e=>{const x=e.netRevenue-e.totalCost,f=e.netRevenue>0?x/e.netRevenue*100:0,u=e.collectedViaReceipts+e.paidAmount,w=Math.max(0,e.totalSales-u),y=e.totalSales>0?Math.min(100,u/e.totalSales*100):0,T=e.totalSales/d,k=e.invoiceCount>0?e.totalSales/e.invoiceCount:0;return{...e,profit:x,profitPct:f,collected:u,remainingAmount:w,collectionPct:y,dailyAvg:T,avgInvoice:k}}),window.custperfSortKey||(window.custperfSortKey="totalSales",window.custperfSortDir="desc"),St(),Ht(n,i,s,d,t)}catch(t){n.innerHTML='<div class="alert bad">خطأ في تحميل بيانات العملاء: '+t.message+"</div>",console.error(t)}}function St(){const n=window.custperfSortKey,i=window.custperfSortDir==="asc"?1:-1;D.sort((s,t)=>{let d=s[n],a=t[n];if(n==="lastInvoiceDate"||n==="lastReceiptDate")d=d?new Date(d).getTime():0,a=a?new Date(a).getTime():0,isNaN(d)&&(d=0),isNaN(a)&&(a=0);else if(typeof d=="string")return d.localeCompare(a,"ar")*i;return d<a?-1*i:d>a?1*i:0})}window.toggleCustPerfSort=n=>{window.custperfSortKey===n?window.custperfSortDir=window.custperfSortDir==="desc"?"asc":"desc":(window.custperfSortKey=n,window.custperfSortDir="desc"),St();const i=document.getElementById("custperf-table-wrapper"),s=document.getElementById("custperf-kpi-wrapper"),t=document.getElementById("custperf-champs-wrapper");i&&s&&t&&ft(i,s,t)};function Ht(n,i,s,t,d){n.innerHTML=(window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("تقرير أداء العملاء","الفترة من "+i+" إلى "+s):"")+'<div class="print-header no-print" style="text-align:center;margin-bottom:20px;"><h2 style="margin:0;font-size:20px;">🏆 تقرير أداء العملاء</h2><p style="color:var(--text-2);margin:4px 0 0;">من '+i+" إلى "+s+" ("+t+" يوم)"+(d?" • مندوب: "+d:"")+'</p></div><div id="custperf-kpi-wrapper"></div><div id="custperf-champs-wrapper"></div><div id="custperf-table-wrapper"></div>';const a=document.getElementById("custperf-table-wrapper"),p=document.getElementById("custperf-kpi-wrapper"),h=document.getElementById("custperf-champs-wrapper");ft(a,p,h)}const pt={lastInvoiceDate:!0,lastReceiptDate:!0,invoiceCount:!0,totalSales:!0,totalCost:!0,profit:!0,collected:!0,remainingAmount:!0,collectionPct:!0,dailyAvg:!0,avgInvoice:!0,profitKpi:!0};function Vt(){try{const n=localStorage.getItem("idham_custperf_cols");if(n)return{...pt,...JSON.parse(n)}}catch{}return{...pt}}function It(n){try{localStorage.setItem("idham_custperf_cols",JSON.stringify(n))}catch{}}window.custperfCols=Vt();window.toggleCustPerfCol=n=>{window.custperfCols[n]=!window.custperfCols[n],It(window.custperfCols),wt();const i=document.getElementById("custperf-table-wrapper"),s=document.getElementById("custperf-kpi-wrapper"),t=document.getElementById("custperf-champs-wrapper");i&&s&&t&&ft(i,s,t)};window.setCustPerfPreset=n=>{n==="rep"?(window.custperfCols.totalCost=!1,window.custperfCols.profit=!1,window.custperfCols.profitKpi=!1,window.custperfCols.lastInvoiceDate=!0,window.custperfCols.lastReceiptDate=!0,window.custperfCols.invoiceCount=!0,window.custperfCols.totalSales=!0,window.custperfCols.collected=!0,window.custperfCols.remainingAmount=!0,window.custperfCols.collectionPct=!0,window.custperfCols.dailyAvg=!0,window.custperfCols.avgInvoice=!0):n==="all"?Object.keys(window.custperfCols).forEach(d=>window.custperfCols[d]=!0):n==="minimal"&&(window.custperfCols.lastInvoiceDate=!1,window.custperfCols.lastReceiptDate=!1,window.custperfCols.invoiceCount=!0,window.custperfCols.totalSales=!0,window.custperfCols.totalCost=!1,window.custperfCols.profit=!1,window.custperfCols.profitKpi=!1,window.custperfCols.collected=!0,window.custperfCols.remainingAmount=!0,window.custperfCols.collectionPct=!0,window.custperfCols.dailyAvg=!1,window.custperfCols.avgInvoice=!1),It(window.custperfCols),wt();const i=document.getElementById("custperf-table-wrapper"),s=document.getElementById("custperf-kpi-wrapper"),t=document.getElementById("custperf-champs-wrapper");i&&s&&t&&ft(i,s,t)};window.toggleCustPerfColMenu=n=>{n&&n.stopPropagation();const i=document.getElementById("custperf-col-dropdown");if(!i)return;i.style.display==="block"?i.style.display="none":(wt(),i.style.display="block")};function wt(){const n=document.getElementById("custperf-col-dropdown");if(!n)return;const i=window.custperfCols,s=[{key:"totalSales",label:"المبيعات (شامل)",icon:"💵"},{key:"collected",label:"المحصّل",icon:"✅"},{key:"remainingAmount",label:"المتبقي (الذمم)",icon:"⏳"},{key:"collectionPct",label:"نسبة التحصيل",icon:"📊"},{key:"invoiceCount",label:"عدد الفواتير",icon:"📄"},{key:"lastInvoiceDate",label:"تاريخ آخر فاتورة",icon:"📅"},{key:"lastReceiptDate",label:"تاريخ آخر تحصيل",icon:"💰"},{key:"dailyAvg",label:"المعدل اليومي",icon:"📈"},{key:"avgInvoice",label:"متوسط الفاتورة",icon:"🧾"},{key:"totalCost",label:"التكلفة (خاص)",icon:"🔒"},{key:"profit",label:"الربح وهامش الربح (خاص)",icon:"🔒"},{key:"profitKpi",label:"كروت الأرباح العلوية (خاص)",icon:"🔒"}];n.innerHTML=`
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
      ${s.map(t=>`
        <label style="display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer; padding:4px 6px; border-radius:4px; transition:background .15s;" onmouseover="this.style.background='var(--bg-2)'" onmouseout="this.style.background=''">
          <input type="checkbox" ${i[t.key]?"checked":""} onchange="toggleCustPerfCol('${t.key}')" style="cursor:pointer;" />
          <span>${t.icon} ${t.label}</span>
        </label>
      `).join("")}
    </div>
  `}window._custperfClickListenerAdded||(document.addEventListener("click",n=>{const i=document.getElementById("custperf-col-dropdown"),s=document.getElementById("btn-custperf-cols");i&&i.style.display==="block"&&!i.contains(n.target)&&!s?.contains(n.target)&&(i.style.display="none")}),window._custperfClickListenerAdded=!0);function ft(n,i,s){const t=window.custperfCols||pt,d=D.reduce((g,$)=>(g.sales+=$.totalSales,g.netRevenue+=$.netRevenue,g.cost+=$.totalCost,g.profit+=$.profit,g.collected+=$.collected,g.remaining+=$.remainingAmount,g.invoices+=$.invoiceCount,g),{sales:0,netRevenue:0,cost:0,profit:0,collected:0,remaining:0,invoices:0}),a=d.netRevenue>0?d.profit/d.netRevenue*100:0,p=d.sales>0?Math.min(100,d.collected/d.sales*100):0,h=document.getElementById("fin-from")?.value,r=document.getElementById("fin-to")?.value,e=Math.max(1,Math.round((new Date(r||bt())-new Date(h||gt()))/864e5)+1),x=d.sales/e,f=[...D].sort((g,$)=>$.totalSales-g.totalSales)[0],u=[...D].sort((g,$)=>$.profit-g.profit)[0],w=[...D].sort((g,$)=>$.collectionPct-g.collectionPct)[0],y=g=>g>=80?{color:"#10b981",bg:"rgba(16,185,129,.12)",icon:"🟢"}:g>=50?{color:"#f59e0b",bg:"rgba(245,158,11,.12)",icon:"🟡"}:{color:"#ef4444",bg:"rgba(239,68,68,.12)",icon:"🔴"},T=g=>(Math.round(g*100)/100).toLocaleString("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2}),k=g=>{if(!g)return"—";const $=g.split("-");return $.length===3?`${$[2]}-${$[1]}-${$[0]}`:g};i.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:12px;margin-bottom:20px;">
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #6366f1;"><div style="font-size:10px;color:var(--text-3);margin-bottom:4px;">إجمالي المبيعات (شامل الضريبة)</div><div style="font-size:17px;font-weight:900;font-family:monospace;color:#6366f1;">${o(d.sales)}</div><div style="font-size:10px;color:var(--text-3);margin-top:4px;">${d.invoices} فاتورة • ${D.length} عميل</div></div>
      ${t.profitKpi?`<div class="card" style="padding:16px;text-align:center;border-top:3px solid #10b981;"><div style="font-size:10px;color:var(--text-3);margin-bottom:4px;">إجمالي الأرباح (صافي المبيعات)</div><div style="font-size:17px;font-weight:900;font-family:monospace;color:#10b981;">${o(d.profit)}</div><div style="font-size:10px;color:var(--text-3);margin-top:4px;">هامش ربح ${T(a)}%</div></div>`:""}
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #3b82f6;"><div style="font-size:10px;color:var(--text-3);margin-bottom:4px;">إجمالي التحصيل</div><div style="font-size:17px;font-weight:900;font-family:monospace;color:#3b82f6;">${o(d.collected)}</div><div style="font-size:10px;color:var(--text-3);margin-top:4px;">نسبة ${T(p)}%</div></div>
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #f59e0b;"><div style="font-size:10px;color:var(--text-3);margin-bottom:4px;">إجمالي المتبقي</div><div style="font-size:17px;font-weight:900;font-family:monospace;color:#f59e0b;">${o(d.remaining)}</div><div style="font-size:10px;color:var(--text-3);margin-top:4px;">ذمم متبقية</div></div>
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #8b5cf6;"><div style="font-size:10px;color:var(--text-3);margin-bottom:4px;">المعدل اليومي</div><div style="font-size:17px;font-weight:900;font-family:monospace;color:#8b5cf6;">${o(x)}</div><div style="font-size:10px;color:var(--text-3);margin-top:4px;">ر.س / يوم</div></div>
    </div>
  `,s.innerHTML=f||t.profitKpi&&u||w?`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:20px;">
      ${f&&f.totalSales>0?`<div class="card" style="padding:12px 16px;display:flex;align-items:center;gap:12px;border:1px solid rgba(99,102,241,.3);"><span style="font-size:28px;">🥇</span><div><div style="font-size:10px;color:#6366f1;font-weight:700;margin-bottom:2px;">الأعلى مبيعاً</div><div style="font-weight:700;font-size:13px;">${f.name}</div><div style="font-size:11px;color:var(--text-2);">${o(f.totalSales)}</div></div></div>`:""}
      ${t.profitKpi&&u&&u.profit>0?`<div class="card" style="padding:12px 16px;display:flex;align-items:center;gap:12px;border:1px solid rgba(16,185,129,.3);"><span style="font-size:28px;">💰</span><div><div style="font-size:10px;color:#10b981;font-weight:700;margin-bottom:2px;">الأعلى ربحاً (صافي)</div><div style="font-weight:700;font-size:13px;">${u.name}</div><div style="font-size:11px;color:var(--text-2);">${o(u.profit)} (${T(u.profitPct)}%)</div></div></div>`:""}
      ${w&&w.collectionPct>0?`<div class="card" style="padding:12px 16px;display:flex;align-items:center;gap:12px;border:1px solid rgba(59,130,246,.3);"><span style="font-size:28px;">🏅</span><div><div style="font-size:10px;color:#3b82f6;font-weight:700;margin-bottom:2px;">الأفضل تحصيلاً</div><div style="font-weight:700;font-size:13px;">${w.name}</div><div style="font-size:11px;color:var(--text-2);">${T(w.collectionPct)}%</div></div></div>`:""}
    </div>
  `:"";const z=g=>window.custperfSortKey!==g?' <span style="font-size:9px;color:var(--text-3);opacity:0.5;">↕</span>':window.custperfSortDir==="asc"?' <span style="font-size:10px;color:var(--brand);">▲</span>':' <span style="font-size:10px;color:var(--brand);">▼</span>',m=D.map((g,$)=>{const v=y(g.collectionPct);return`<tr style="border-bottom:1px solid rgba(255,255,255,.04); transition:background .15s;" onmouseover="this.style.background='rgba(255,255,255,.03)'" onmouseout="this.style.background=''">
      <td style="padding:10px 8px;text-align:center;color:var(--text-3);">${$+1}</td>
      <td style="padding:10px 8px;"><div style="font-weight:700;font-size:13px;">${g.name}</div><div style="font-size:10px;color:var(--text-3);margin-top:2px;">مندوب: ${g.repName}</div></td>
      ${t.lastInvoiceDate?`<td style="padding:10px 8px;text-align:center;color:var(--text-2);white-space:nowrap;">${k(g.lastInvoiceDate)}</td>`:""}
      ${t.lastReceiptDate?`<td style="padding:10px 8px;text-align:center;color:var(--text-2);white-space:nowrap;">${k(g.lastReceiptDate)}</td>`:""}
      ${t.invoiceCount?`<td style="padding:10px 8px;text-align:center;color:var(--text-2);">${g.invoiceCount}</td>`:""}
      ${t.totalSales?`<td style="padding:10px 8px;text-align:right;font-family:monospace;font-weight:700;">${o(g.totalSales)}</td>`:""}
      ${t.totalCost?`<td style="padding:10px 8px;text-align:right;font-family:monospace;color:var(--text-2);">${o(g.totalCost)}</td>`:""}
      ${t.profit?`
      <td style="padding:10px 8px;text-align:right;font-family:monospace;color:${g.profit>=0?"#10b981":"#ef4444"};font-weight:700;">
        ${o(g.profit)}
        <div style="font-size:10px;font-weight:400;opacity:0.8;">${T(g.profitPct)}%</div>
      </td>`:""}
      ${t.collected?`<td style="padding:10px 8px;text-align:right;font-family:monospace;">${o(g.collected)}</td>`:""}
      ${t.remainingAmount?`<td style="padding:10px 8px;text-align:right;font-family:monospace;color:${g.remainingAmount>0?"#f59e0b":"var(--text-3)"};">${g.remainingAmount>0?o(g.remainingAmount):"—"}</td>`:""}
      ${t.collectionPct?`
      <td style="padding:10px 8px;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:5px;background:${v.bg};color:${v.color};padding:4px 10px;border-radius:20px;font-weight:700;font-size:12px;">
          ${v.icon} ${T(g.collectionPct)}%
        </div>
      </td>`:""}
      ${t.dailyAvg?`<td style="padding:10px 8px;text-align:right;font-family:monospace;color:var(--text-2);">${o(g.dailyAvg)}</td>`:""}
      ${t.avgInvoice?`<td style="padding:10px 8px;text-align:right;font-family:monospace;color:var(--text-2);">${o(g.avgInvoice)}</td>`:""}
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
          ${D.length===0?'<tr><td colspan="15" style="text-align:center;padding:40px;color:var(--text-2);">لا توجد بيانات للفترة المختارة</td></tr>':m}
        </tbody>
        <tfoot>
          <tr style="background:var(--bg-2);border-top:2px solid var(--border);font-weight:900;">
            <td colspan="${E}" style="padding:12px 8px;">الإجمالي (${D.length} عميل)</td>
            ${t.invoiceCount?`<td style="padding:12px 8px;text-align:center;">${d.invoices}</td>`:""}
            ${t.totalSales?`<td style="padding:12px 8px;text-align:right;font-family:monospace;color:#6366f1;">${o(d.sales)}</td>`:""}
            ${t.totalCost?`<td style="padding:12px 8px;text-align:right;font-family:monospace;">${o(d.cost)}</td>`:""}
            ${t.profit?`<td style="padding:12px 8px;text-align:right;font-family:monospace;color:#10b981;">${o(d.profit)} <span style="font-size:10px;font-weight:400;">(${T(a)}%)</span></td>`:""}
            ${t.collected?`<td style="padding:12px 8px;text-align:right;font-family:monospace;color:#3b82f6;">${o(d.collected)}</td>`:""}
            ${t.remainingAmount?`<td style="padding:12px 8px;text-align:right;font-family:monospace;color:#f59e0b;">${o(d.remaining)}</td>`:""}
            ${t.collectionPct?`<td style="padding:12px 8px;text-align:center;font-weight:900;color:${p>=80?"#10b981":p>=50?"#f59e0b":"#ef4444"};">${T(p)}%</td>`:""}
            ${t.dailyAvg?`<td style="padding:12px 8px;text-align:right;font-family:monospace;color:#8b5cf6;">${o(x)}</td>`:""}
            ${t.avgInvoice?`<td style="padding:12px 8px;text-align:right;font-family:monospace;">${o(d.invoices>0?d.sales/d.invoices:0)}</td>`:""}
          </tr>
        </tfoot>
      </table>
    </div>
    <div class="no-print" style="display:flex;gap:20px;margin-top:14px;font-size:11px;color:var(--text-3);flex-wrap:wrap;">
      <span>🟢 تحصيل ممتاز (≥80%)</span><span>🟡 تحصيل متوسط (50–79%)</span><span>🔴 تحصيل ضعيف (&lt;50%)</span>
    </div>
  `}window.exportCustPerfExcel=async()=>{if(!D||D.length===0){alert("لا توجد بيانات لتصديرها");return}const n=window.custperfCols||pt,i=document.getElementById("fin-from")?.value||"",s=document.getElementById("fin-to")?.value||"",t=window.custperfRep?` (مندوب: ${window.custperfRep})`:"",d=`تقرير أداء العملاء للفترة من ${i} إلى ${s}${t}`,a=["#","اسم العميل","المندوب"],p=[6,32,20];n.lastInvoiceDate&&(a.push("آخر فاتورة"),p.push(14)),n.lastReceiptDate&&(a.push("آخر تحصيل"),p.push(14)),n.invoiceCount&&(a.push("عدد الفواتير"),p.push(12)),n.totalSales&&(a.push("المبيعات (شامل)"),p.push(20)),n.totalCost&&(a.push("التكلفة"),p.push(18)),n.profit&&(a.push("صافي الربح","نسبة الربح %"),p.push(18,14)),n.collected&&(a.push("المحصل"),p.push(18)),n.remainingAmount&&(a.push("المتبقي (الذمم)"),p.push(18)),n.collectionPct&&(a.push("نسبة التحصيل %"),p.push(16)),n.dailyAvg&&(a.push("المعدل اليومي"),p.push(16)),n.avgInvoice&&(a.push("متوسط الفاتورة"),p.push(16));const h=D.map((u,w)=>{const y=[w+1,u.name,u.repName];return n.lastInvoiceDate&&y.push(u.lastInvoiceDate||"—"),n.lastReceiptDate&&y.push(u.lastReceiptDate||"—"),n.invoiceCount&&y.push(u.invoiceCount),n.totalSales&&y.push(Math.round(u.totalSales*100)/100),n.totalCost&&y.push(Math.round(u.totalCost*100)/100),n.profit&&y.push(Math.round(u.profit*100)/100,`${(Math.round(u.profitPct*100)/100).toFixed(2)}%`),n.collected&&y.push(Math.round(u.collected*100)/100),n.remainingAmount&&y.push(Math.round(u.remainingAmount*100)/100),n.collectionPct&&y.push(`${(Math.round(u.collectionPct*100)/100).toFixed(2)}%`),n.dailyAvg&&y.push(Math.round(u.dailyAvg*100)/100),n.avgInvoice&&y.push(Math.round(u.avgInvoice*100)/100),y}),r=D.reduce((u,w)=>(u.sales+=w.totalSales,u.cost+=w.totalCost,u.profit+=w.profit,u.collected+=w.collected,u.remaining+=w.remainingAmount,u.invoices+=w.invoiceCount,u),{sales:0,cost:0,profit:0,collected:0,remaining:0,invoices:0}),e=r.sales>0?r.profit/(r.sales/1.15)*100:0,x=r.sales>0?Math.min(100,r.collected/r.sales*100):0,f=["الإجمالي",`عدد العملاء: ${D.length}`,""];n.lastInvoiceDate&&f.push(""),n.lastReceiptDate&&f.push(""),n.invoiceCount&&f.push(r.invoices),n.totalSales&&f.push(Math.round(r.sales*100)/100),n.totalCost&&f.push(Math.round(r.cost*100)/100),n.profit&&f.push(Math.round(r.profit*100)/100,`${e.toFixed(2)}%`),n.collected&&f.push(Math.round(r.collected*100)/100),n.remainingAmount&&f.push(Math.round(r.remaining*100)/100),n.collectionPct&&f.push(`${x.toFixed(2)}%`),n.dailyAvg&&f.push(""),n.avgInvoice&&f.push(""),h.push(f);try{await xt({title:d,headers:a,rows:h,colWidths:p})}catch(u){console.error("Export Excel error:",u),alert("حدث خطأ أثناء تصدير ملف Excel: "+u.message)}};window.exportCustPerfPDF=()=>{if(!D||D.length===0){alert("لا توجد بيانات للطباعة");return}window.print()};export{Xt as render};
