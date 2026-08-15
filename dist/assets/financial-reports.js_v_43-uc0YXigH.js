const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-HrCilPJ3.js","assets/index-BTgEPYae.css"])))=>i.map(i=>d[i]);
import{s as Q,t as U,_ as N,g as G,C as J,f as e}from"./index-HrCilPJ3.js";import{orderBy as Y}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let E=[],A=[],X="ledger";async function vt(b,p){b.innerHTML=`
    <!-- Top Filter Bar -->
    <div class="filterbar no-print">
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="fin-from" value="${Q()}" />
      </div>
      <div class="date-range-group">
        <label>إلى</label>
        <input type="date" id="fin-to" value="${U()}" />
      </div>
      <div style="margin-right:auto; display:flex; gap:8px;">
        <button class="btn btn-secondary" onclick="window.print()">🖨️ طباعة التقرير</button>
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
      <button class="tab-btn" id="btn-tab-analysis" onclick="switchFinTab('analysis')" style="padding:14px 16px; border:none; background:none; cursor:pointer; font-weight:bold; color:var(--text-2); border-bottom:2px solid transparent; white-space:nowrap;">📈 التحليل المالي والنسب</button>
    </div>

    <!-- Main Content Area -->
    <div class="page-content" id="fin-report-body" style="padding:24px;">
       <div class="page-loading"><div class="loading-spinner"></div></div>
    </div>
  `,document.getElementById("fin-from").addEventListener("change",()=>loadDataAndRender()),document.getElementById("fin-to").addEventListener("change",()=>loadDataAndRender()),await loadDataAndRender()}let W={},_={};function H(b){return W[b.accountId]||_[b.accountCode]||null}function tt(b){return b.type==="expense"&&(b.code==="5-1-8"||b.code==="5-1-2-1"||b.code==="5-1-7"||b.name?.includes("تكلفة البضاعة المباعة")||b.name?.includes("تكلفة مبيعات")||b.name?.includes("نقل بضاعة (للداخل)"))}function et(b){return b.type==="expense"&&b.code?.startsWith("5-1-1")}window.loadDataAndRender=async function(b=!1){const p=document.getElementById("fin-report-body");if(p){p.innerHTML='<div class="page-loading"><div class="loading-spinner"></div><span>جارٍ تحميل البيانات المحاسبية…</span></div>';try{const{clearERPCache:o,COMPANY_ID:r}=await N(async()=>{const{clearERPCache:s,COMPANY_ID:l}=await import("./index-HrCilPJ3.js").then(h=>h.N);return{clearERPCache:s,COMPANY_ID:l}},__vite__mapDeps([0,1]));b&&(o(`companies/${r}/chartOfAccounts`),o(`companies/${r}/journalEntries`)),E=await G(J.chartOfAccounts(),[Y("code")]),W={},_={},E.forEach(s=>{W[s.id]=s,_[s.code]=s}),A=await G(J.journalEntries(),[Y("date","asc")]),Z()}catch(o){p.innerHTML=`<div class="alert bad">${o.message}</div>`}}};window.switchFinTab=b=>{X=b,document.querySelectorAll(".tab-btn").forEach(o=>{o.classList.remove("active"),o.style.color="var(--text-2)",o.style.borderBottomColor="transparent"});const p=document.getElementById(`btn-tab-${b}`);p&&(p.classList.add("active"),p.style.color="var(--brand)",p.style.borderBottomColor="var(--brand)"),Z()};function Z(){const b=document.getElementById("fin-report-body");if(!b)return;let p=document.getElementById("fin-from")?.value||Q(),o=document.getElementById("fin-to")?.value||U();const r=m=>{if(!m)return"";if(/^\d{4}-\d{2}-\d{2}$/.test(m))return m;const c=m.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);if(c)return`${c[3]}-${c[2].padStart(2,"0")}-${c[1].padStart(2,"0")}`;const v=new Date(m);return isNaN(v.getTime())?m:v.toISOString().split("T")[0]};let s=r(p),l=r(o);if(s&&l&&s>l){const m=s;s=l,l=m}({ledger:K,trial:nt,income:ot,balance:st,cashflow:it,equity:dt,analysis:rt}[X]||K)(b,s,l)}function K(b,p,o){const r=E.map(s=>`<option value="${s.id}">${s.code} — ${s.name}</option>`).join("");b.innerHTML=`
    <div class="card no-print mb-16" style="padding:16px;">
      <div class="form-group" style="max-width:500px; margin:0;">
        <label>اختر الحساب لعرض حركاته</label>
        <select id="ledger-acc-select" class="input" onchange="updateLedgerLines()">
          ${r}
        </select>
      </div>
    </div>
    <div id="ledger-report-area"></div>
  `,window.updateLedgerLines=()=>{const s=document.getElementById("ledger-acc-select")?.value,l=E.find(n=>n.id===s);if(!l)return;const h=["liability","equity","revenue"].includes(l.type);let m=0;const c=[];for(const n of A){const x=n.date||"";for(const i of n.lines||[]){const w=H(i);if(!w||w.id!==s)continue;const t=i.debit||0,d=i.credit||0,$=t-d;x<p?m+=$:x>=p&&x<=o&&c.push({date:x,entryNumber:n.entryNumber||n.id.substring(0,8),description:n.description||"",sourceType:n.sourceType||"",debit:t,credit:d,note:i.note||""})}}let v=h?-m:m;const g=v>=0?"مدين":"دائن",k=c.reduce((n,x)=>n+x.debit,0),C=c.reduce((n,x)=>n+x.credit,0),f=document.getElementById("ledger-report-area");f.innerHTML=`
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("دفتر الأستاذ التفصيلي",`حساب: ${l.code} — ${l.name} | من ${p} إلى ${o}`):""}
      <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
        <h2>دفتر الأستاذ التفصيلي</h2>
        <h4>حساب: ${l.code} — ${l.name}</h4>
        <p class="dim">من ${p} إلى ${o}</p>
      </div>
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead>
            <tr>
              <th>التاريخ</th><th>رقم القيد</th><th>البيان</th><th>نوع العملية</th>
              <th class="text-indigo">مدين (Dr)</th>
              <th class="text-lime">دائن (Cr)</th>
              <th>الرصيد الجاري</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:var(--bg-2);">
              <td colspan="4"><strong>رصيد افتتاحي (قبل الفترة)</strong></td>
              <td class="mono">—</td><td class="mono">—</td>
              <td class="mono font-bold">${e(Math.abs(v))} <span class="dim">${g}</span></td>
            </tr>
            ${c.map(n=>{const x=n.debit-n.credit;v+=h?-x:x;const i=Math.abs(v),w=v>=0?"مدين":"دائن";return`
              <tr>
                <td class="dim">${n.date}</td>
                <td class="mono font-bold text-indigo">${n.entryNumber}</td>
                <td>${n.description}</td>
                <td class="dim">${at(n.sourceType)||n.note||"—"}</td>
                <td class="mono text-indigo">${n.debit?e(n.debit):"—"}</td>
                <td class="mono text-lime">${n.credit?e(n.credit):"—"}</td>
                <td class="mono font-bold">${e(i)} <span class="dim">${w}</span></td>
              </tr>`}).join("")}
            <tr style="border-top:2px solid var(--border); background:var(--bg-2);">
              <td colspan="4"><strong>الإجمالي</strong></td>
              <td class="mono font-bold text-indigo">${e(k)}</td>
              <td class="mono font-bold text-lime">${e(C)}</td>
              <td class="mono font-bold">${e(Math.abs(v))} <span class="dim">${v>=0?"مدين":"دائن"}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `},updateLedgerLines()}function at(b){return b?{sales:"مبيعات",salesCOGS:"تكلفة مباعة",purchase:"مشتريات",receipt:"تحصيل",payment:"سداد",expense:"مصروف",opening:"رصيد افتتاحي",transfer:"تحويل",salesReturn:"مردود بيع",purchaseReturn:"مردود شراء",payroll:"رواتب"}[b]||b:""}function nt(b,p,o){const r=[],s=[];let l=0,h=0,m=0,c=0,v=0,g=0;const k=a=>["liability","equity","revenue"].includes(a.type);for(const a of E){let u=0,y=0,M=0;for(const q of A){const R=q.date||"";for(const O of q.lines||[]){const V=H(O);!V||V.id!==a.id||(R<p?u+=(O.debit||0)-(O.credit||0):R>=p&&R<=o&&(y+=O.debit||0,M+=O.credit||0))}}const T=u+(y-M);if(Math.abs(u)<.01&&y===0&&M===0)continue;const j=u>0?u:0,F=u<0?-u:0,B=T>0?T:0,P=T<0?-T:0;l+=j,h+=F,m+=y,c+=M,v+=B,g+=P;const z=k(a)&&B>.01||!k(a)&&P>.01,D=z?'<span style="font-size:10px; background:#7f1d1d; color:#fca5a5; padding:1px 5px; border-radius:4px; margin-right:4px;">⚠️ رصيد شاذ</span>':"";z&&s.push({id:a.id,code:a.code,name:a.name,type:a.type,parentCode:a.parentCode,sourceEntityId:a.sourceEntityId||null,closeDr:B,closeCr:P}),r.push(`
      <tr ${z?'style="background:rgba(127,29,29,0.08);"':""}>
        <td class="mono dim">${a.code}</td>
        <td>${D}<strong>${a.name}</strong></td>
        <td class="mono">${j?e(j):"—"}</td>
        <td class="mono">${F?e(F):"—"}</td>
        <td class="mono text-indigo">${y?e(y):"—"}</td>
        <td class="mono text-lime">${M?e(M):"—"}</td>
        <td class="mono font-bold">${B?e(B):"—"}</td>
        <td class="mono font-bold">${P?e(P):"—"}</td>
      </tr>
    `)}let C=0,f=0;const n=[];for(const a of A){const u=a.date||"";for(const y of a.lines||[])if(!H(y)){const T=y.debit||0,j=y.credit||0;C+=T,f+=j,n.push({entryId:a.id,entryNum:a.entryNumber||a.id?.slice(0,8)||"—",date:u,desc:a.description||"—",accCode:y.accountCode||"—",accName:y.accountName||"—",accId:y.accountId||"—",dr:T,cr:j})}}const x=Math.abs(v-g),i=Math.abs(m-c),w=n.length>0,t=x<.05&&!w,d=w?`
    <div class="card mb-16" style="border:2px solid #b45309; padding:20px;">
      <h4 style="color:#f59e0b; margin-bottom:12px;">⚠️ أسطر قيود يتيمة — الحسابات غير موجودة في شجرة الحسابات</h4>
      <p class="dim" style="font-size:12px; margin-bottom:12px;">
        هذه الأسطر تشير إلى حسابات محذوفة أو غير مُدرجة في الشجرة الحالية، مما يُسبب عدم التوازن.
        يجب مراجعة القيود وإعادة ربطها بحسابات صحيحة.
      </p>
      <p class="dim" style="font-size:12px; margin-bottom:12px;">
        إجمالي المدين اليتيم: <strong>${e(C)}</strong> |
        إجمالي الدائن اليتيم: <strong>${e(f)}</strong> |
        فرق الميزان بسببها: <strong>${e(Math.abs(C-f))}</strong>
      </p>
      <div class="table-container" style="max-height:250px; overflow-y:auto;">
        <table class="data-dense" style="width:100%; font-size:12px;">
          <thead><tr>
            <th>رقم القيد</th><th>التاريخ</th><th>البيان</th>
            <th>كود الحساب</th><th>اسم الحساب</th>
            <th class="text-indigo">مدين</th><th class="text-lime">دائن</th>
          </tr></thead>
          <tbody>
            ${n.slice(0,50).map(a=>`
              <tr>
                <td class="mono dim">${a.entryNum}</td>
                <td>${a.date}</td>
                <td>${a.desc}</td>
                <td class="mono text-bad">${a.accCode}</td>
                <td class="dim">${a.accName}</td>
                <td class="mono text-indigo">${a.dr?e(a.dr):"—"}</td>
                <td class="mono text-lime">${a.cr?e(a.cr):"—"}</td>
              </tr>
            `).join("")}
            ${n.length>50?`<tr><td colspan="7" style="text-align:center; color:var(--text-2);">... و ${n.length-50} سطراً آخر</td></tr>`:""}
          </tbody>
        </table>
      </div>
    </div>
  `:"",$=Math.round(x*100)/100;b.innerHTML=`
    ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("ميزان المراجعة بالأرصدة والمجاميع",`الفترة من ${p} إلى ${o}`):""}
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>ميزان المراجعة بالأرصدة والمجاميع</h2>
      <p class="dim">من ${p} إلى ${o}</p>
    </div>

    ${t?`
    <div class="alert good mb-16" style="display:flex; align-items:center; gap:12px;">
      <span style="font-size:22px;">✅</span>
      <div><strong>الميزان متوازن تماماً</strong> — مجموع القيود: ${e(v)}</div>
    </div>`:`
    <div class="alert bad mb-16" style="display:flex; align-items:center; gap:12px;">
      <span style="font-size:22px;">⚠️</span>
      <div>
        <strong>تحذير: الميزان غير متوازن</strong><br>
        <span class="dim">
          فرق الأرصدة الختامية: ${e($)}
          ${w?` | أسطر يتيمة: ${n.length} سطر (مدين: ${e(C)} / دائن: ${e(f)})`:""}
          ${i>.05?` | فرق حركات الفترة: ${e(Math.round(i*100)/100)}`:""}
        </span>
      </div>
    </div>`}

    ${d}

    <div class="table-container">
      <table class="data-dense" style="width:100%;">
        <thead>
          <tr>
            <th rowspan="2">الكود</th>
            <th rowspan="2">اسم الحساب</th>
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
          ${r.join("")}
          <tr style="border-top:2.5px solid var(--border); background:var(--surface-1); font-weight:bold;">
            <td colspan="2">الإجمالي</td>
            <td class="mono">${e(l)}</td>
            <td class="mono">${e(h)}</td>
            <td class="mono text-indigo">${e(m)}</td>
            <td class="mono text-lime">${e(c)}</td>
            <td class="mono ${t?"text-good":"text-bad"}">${e(v)}</td>
            <td class="mono ${t?"text-good":"text-bad"}">${e(g)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;const I=s.filter(a=>a.type==="liability"&&a.closeDr>.01||a.type==="asset"&&a.closeCr>.01),L=I.length?`
    <div class="card mt-20" style="border:2px solid #b45309; padding:20px;">
      <h4 style="color:#f59e0b; margin-bottom:8px;">🔧 حسابات تحتاج إجراء (${I.length} حساب)</h4>
      <p class="dim" style="font-size:12px; margin-bottom:12px;">الحسابات التالية لديها رصيد بالاتجاه الخاطئ لنوعها — اضغط زر الإجراء لكل منها</p>
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead><tr>
            <th>الكود</th><th>الاسم</th><th>النوع</th>
            <th>الرصيد الختامي</th><th>تشخيص المشكلة</th><th>الإجراء</th>
          </tr></thead>
          <tbody>
            ${I.map(a=>{const u=a.closeDr>.01?a.closeDr:a.closeCr,y=a.closeDr>.01;let M="",T="";return a.type==="liability"&&y?a.code?.startsWith("2-1-5")||a.code?.startsWith("2-1-4")?(M="سلفة موظف/مندوب مُصنَّفة تحت الخصوم — يجب إعادة تصنيفها كأصل",T=`<button class="btn btn-sm" style="background:#b45309;color:#fff;" onclick="fixReclassifyAccount('${a.id}','${a.code}','asset','1-1-5-4')">🔄 نقل إلى سلف مناديب</button>`):a.code?.startsWith("2-1-1-1-1-")||a.parentCode&&a.parentCode.startsWith("2-1-1-1")?(M="حساب فرعي مورد: المشتريات قُيّدت بالأب بينما الدفعات قُيّدت بالفرعي",T=`<button class="btn btn-sm" style="background:#b45309;color:#fff;" onclick="fixSupplierSubAccountJE('${a.id}','${a.code}','${a.name.replace(/'/g,"\\'")}',${u.toFixed(2)})">⚖️ إنشاء قيد تسوية</button>`):(M="التزام برصيد مدين — راجع القيود يدوياً",T='<span class="dim" style="font-size:12px;">مراجعة يدوية</span>'):a.type==="asset"&&!y&&(M="أصل برصيد دائن — قد يكون دفعة مستلمة زائدة",T='<span class="dim" style="font-size:12px;">مراجعة يدوية</span>'),`
                <tr>
                  <td class="mono dim">${a.code}</td>
                  <td><strong>${a.name}</strong></td>
                  <td><span style="font-size:11px; padding:2px 6px; border-radius:4px; background:rgba(239,68,68,0.15); color:#ef4444;">${a.type==="liability"?"خصوم":"أصول"}</span></td>
                  <td class="mono ${y?"text-indigo":"text-lime"}">${e(u)} ${y?"م":"د"}</td>
                  <td style="font-size:12px; color:var(--text-2);">${M}</td>
                  <td>${T}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `:"";b.innerHTML+=L}window.fixReclassifyAccount=async(b,p,o,r)=>{if(await window.showConfirm?.(`سيتم نقل الحساب ${p} إلى تصنيف "${o==="asset"?"أصول — سلف مناديب":"خصوم"}".

هذا يُزيل علامة "رصيد شاذ" لأن رصيد السلفة المدين يُصبح طبيعياً للأصول.`,"تغيير تصنيف الحساب"))try{const{update:l}=await N(async()=>{const{update:m}=await import("./index-HrCilPJ3.js").then(c=>c.N);return{update:m}},__vite__mapDeps([0,1])),h=["asset","expense"].includes(o)?"debit":"credit";await l("chartOfAccounts",b,{type:o,parentCode:r,normalBalance:h}),window.showToast?.("✅ تم تغيير تصنيف الحساب بنجاح","success"),await window.loadDataAndRender?.()}catch(l){window.showToast?.(l.message,"error")}};window.fixSupplierSubAccountJE=async(b,p,o,r)=>{const s=E.find(m=>m.code==="2-1-1-1-1"),l=E.find(m=>m.id===b);if(!s||!l){window.showToast?.("لم يُعثر على حسابات المورد في شجرة الحسابات","error");return}if(await window.showConfirm?.(`سيتم إنشاء قيد تسوية:
  مدين: ${s.code} — ${s.name}   بمبلغ ${r.toFixed(2)} ر.س
  دائن: ${p} — ${o}   بمبلغ ${r.toFixed(2)} ر.س

هذا ينقل رصيد المشتريات من الحساب الأب إلى الحساب الفرعي للمورد.
الرصيد الإجمالي لذمم الموردين لن يتغير.`,"إنشاء قيد تسوية"))try{const{createJournalEntry:m}=await N(async()=>{const{createJournalEntry:v}=await import("./index-HrCilPJ3.js").then(g=>g.N);return{createJournalEntry:v}},__vite__mapDeps([0,1])),c=new Date().toISOString().split("T")[0];await m({date:c,description:`تسوية — نقل رصيد ${o} من الحساب الأب إلى الفرعي`,entryType:"correction",lines:[{accountId:s.id,accountCode:s.code,accountName:s.name,debit:r,credit:0,description:`نقل رصيد مشتريات ${o} للحساب الفرعي`},{accountId:l.id,accountCode:l.code,accountName:l.name,debit:0,credit:r,description:`تسوية رصيد مشتريات ${o}`}]}),window.showToast?.("✅ تم إنشاء قيد التسوية بنجاح","success"),await window.loadDataAndRender?.()}catch(m){window.showToast?.(m.message,"error")}};function S(b,p){let o=0,r=0,s=0;const l=[],h=[],m=[];for(const c of E){let v=0;for(const g of A){const k=g.date||"";if(k>=b&&k<=p)for(const C of g.lines||[]){const f=H(C);!f||f.id!==c.id||(v+=(C.credit||0)-(C.debit||0))}}if(c.type==="revenue")Math.abs(v)>.01&&(o+=v,l.push({name:c.name,code:c.code,balance:v}));else if(c.type==="expense"){const g=-v;if(Math.abs(g)<.01)continue;tt(c)?(r+=g,h.push({name:c.name,code:c.code,balance:g})):et(c)?r===0&&(r+=g,h.push({name:c.name+" (مشتريات)",code:c.code,balance:g})):(s+=g,m.push({name:c.name,code:c.code,balance:g}))}}return{revenueTotal:o,cogsTotal:r,opExpTotal:s,revItems:l,cogsItems:h,expItems:m,grossProfit:o-r,netProfit:o-r-s}}function ot(b,p,o){const{revenueTotal:r,cogsTotal:s,opExpTotal:l,revItems:h,cogsItems:m,expItems:c,grossProfit:v,netProfit:g}=S(p,o),k=r>0?(g/r*100).toFixed(1):"0.0",C=r>0?(v/r*100).toFixed(1):"0.0";b.innerHTML=`
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("تقرير الأرباح والخسائر (Income Statement)",`الفترة من ${p} إلى ${o}`):""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>قائمة الدخل والدخل الشامل (Income Statement)</h2>
      <p class="dim">للفترة من ${p} إلى ${o}</p>
    </div>

    <div style="max-width:800px; margin:0 auto;">
      <!-- KPI row -->
      <div class="grid-3 gap-16 mb-24">
        <div class="kpi-card">
          <div class="status-bar good"></div>
          <div class="kpi-content">
            <div class="kpi-label">صافي الربح</div>
            <div class="kpi-value ${g>=0?"text-good":"text-bad"}">${e(g)}</div>
            <div class="dim" style="font-size:11px;">هامش ${k}%</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="status-bar indigo"></div>
          <div class="kpi-content">
            <div class="kpi-label">مجمل الربح</div>
            <div class="kpi-value text-indigo">${e(v)}</div>
            <div class="dim" style="font-size:11px;">هامش ${C}%</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="status-bar warn"></div>
          <div class="kpi-content">
            <div class="kpi-label">إجمالي الإيرادات</div>
            <div class="kpi-value">${e(r)}</div>
            <div class="dim" style="font-size:11px;">بدون ضريبة القيمة المضافة</div>
          </div>
        </div>
      </div>

      <div class="card" style="padding:28px;">
        <!-- Revenues -->
        <h4 style="color:var(--brand); border-bottom:2px solid var(--brand); padding-bottom:8px; margin-bottom:16px;">أولاً: الإيرادات والمبيعات</h4>
        ${h.length?h.map(f=>`
          <div class="flex justify-between mb-8" style="font-size:14px;">
            <span class="dim">${f.code} — ${f.name}</span>
            <span class="mono">${e(f.balance)}</span>
          </div>`).join(""):'<p class="dim" style="font-size:13px;">لا توجد إيرادات مسجلة في هذه الفترة</p>'}
        <div class="flex justify-between font-bold" style="background:var(--bg-2); padding:10px 12px; border-radius:8px; margin:12px 0 28px;">
          <span>إجمالي الإيرادات</span>
          <span class="mono text-good">${e(r)}</span>
        </div>

        <!-- COGS -->
        <h4 style="color:var(--warn); border-bottom:2px solid var(--warn); padding-bottom:8px; margin-bottom:16px;">ثانياً: تكلفة البضاعة المباعة (COGS)</h4>
        ${m.length?m.map(f=>`
          <div class="flex justify-between mb-8" style="font-size:14px;">
            <span class="dim">${f.code} — ${f.name}</span>
            <span class="mono text-bad">(${e(f.balance)})</span>
          </div>`).join(""):'<p class="dim" style="font-size:13px;">لا توجد تكلفة مباعة في هذه الفترة</p>'}
        <div class="flex justify-between font-bold" style="background:var(--bg-2); padding:10px 12px; border-radius:8px; margin:12px 0 8px;">
          <span>يخصم: تكلفة البضاعة المباعة</span>
          <span class="mono text-bad">(${e(s)})</span>
        </div>
        <div class="flex justify-between font-bold" style="padding:10px 12px; margin-bottom:28px; border-bottom:1px solid var(--border);">
          <span>مجمل الربح (Gross Profit)</span>
          <span class="mono text-indigo">${e(v)}</span>
        </div>

        <!-- Operating Expenses -->
        <h4 style="color:var(--text-bad, #ef4444); border-bottom:2px solid var(--text-bad, #ef4444); padding-bottom:8px; margin-bottom:16px;">ثالثاً: المصروفات التشغيلية والإدارية</h4>
        ${c.length?c.map(f=>`
          <div class="flex justify-between mb-8" style="font-size:14px;">
            <span class="dim">${f.code} — ${f.name}</span>
            <span class="mono text-bad">(${e(f.balance)})</span>
          </div>`).join(""):'<p class="dim" style="font-size:13px;">لا توجد مصروفات تشغيلية مسجلة</p>'}
        <div class="flex justify-between font-bold" style="background:var(--bg-2); padding:10px 12px; border-radius:8px; margin:12px 0 28px;">
          <span>إجمالي المصروفات التشغيلية</span>
          <span class="mono text-bad">(${e(l)})</span>
        </div>

        <!-- Net Profit -->
        <div class="flex justify-between font-bold" style="background:${g>=0?"linear-gradient(135deg, #1e3a2f, #14532d)":"linear-gradient(135deg, #3b1f1f, #7f1d1d)"}; color:#fff; padding:16px 20px; border-radius:12px; font-size:18px;">
          <span>صافي الربح / (الخسارة) للفترة</span>
          <span class="mono">${e(g)}</span>
        </div>
      </div>
    </div>
  `}function st(b,p,o){let r=0,s=0,l=0;const h=[],m=[],c=[],v=[],g=[];let k=0,C=0;for(const t of E){let d=0;for(const $ of A)if(($.date||"")<=o)for(const L of $.lines||[]){const a=H(L);!a||a.id!==t.id||(d+=(L.debit||0)-(L.credit||0))}if(t.type==="asset"){if(Math.abs(d)<.01)continue;r+=d,(t.code?.startsWith("1-2")||t.code?.startsWith("1-3")||t.name?.includes("سيارات")||t.name?.includes("أثاث")||t.name?.includes("عقارات")||t.name?.includes("معدات")?m:h).push({name:t.name,code:t.code,balance:d})}else if(t.type==="liability"){const $=-d;if(Math.abs($)<.01)continue;s+=$,(t.code?.startsWith("2-2")||t.name?.includes("قرض طويل")||t.name?.includes("سند")?v:c).push({name:t.name,code:t.code,balance:$})}else if(t.type==="equity"){const $=-d;if(Math.abs($)<.01)continue;l+=$,g.push({name:t.name,code:t.code,balance:$})}else t.type==="revenue"?k+=-d:t.type==="expense"&&(C+=d)}const f=k-C,n=s+l+f,x=Math.abs(r-n)<1,i=(t,d="var(--text-0)")=>`<div class="flex justify-between mb-8" style="font-size:13px;">
       <span>${t.code} — ${t.name}</span>
       <span class="mono" style="color:${d}">${e(t.balance)}</span>
     </div>`,w=(t,d,$="var(--text-0)")=>`<div class="flex justify-between font-bold" style="background:var(--bg-2); padding:8px 12px; border-radius:6px; margin:8px 0 16px;">
       <span>${t}</span>
       <span class="mono" style="color:${$}">${e(d)}</span>
     </div>`;b.innerHTML=`
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("ميزانية العمومية (Balance Sheet)",`كما هي في: ${o}`):""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>قائمة المركز المالي (Balance Sheet)</h2>
      <p class="dim">كما هي في: ${o}</p>
    </div>

    ${x?"":`<div class="alert bad mb-16">⚠️ الميزانية غير متوازنة — فرق: ${e(Math.abs(r-n))}</div>`}

    <div class="grid-2 gap-24" style="max-width:1200px; margin:0 auto;">

      <!-- ASSETS -->
      <div class="card" style="padding:24px;">
        <h3 style="color:var(--brand); border-bottom:2px solid var(--brand); padding-bottom:8px; margin-bottom:20px;">الأصول (Assets)</h3>

        <h4 style="color:var(--indigo); margin:0 0 12px;">الأصول المتداولة</h4>
        ${h.map(t=>i(t,"var(--indigo)")).join("")||"<p class='dim'>—</p>"}
        ${w("إجمالي الأصول المتداولة",h.reduce((t,d)=>t+d.balance,0),"var(--indigo)")}

        <h4 style="color:var(--indigo); margin:16px 0 12px;">الأصول الثابتة (غير المتداولة)</h4>
        ${m.map(t=>i(t)).join("")||"<p class='dim'>—</p>"}
        ${w("إجمالي الأصول الثابتة",m.reduce((t,d)=>t+d.balance,0))}

        <div class="flex justify-between font-bold" style="background:linear-gradient(135deg,var(--bg-2),var(--surface-1)); padding:14px 16px; border-radius:10px; font-size:16px; margin-top:8px; border:2px solid var(--brand);">
          <span>إجمالي الأصول</span>
          <span class="mono text-brand">${e(r)}</span>
        </div>
      </div>

      <!-- LIABILITIES & EQUITY -->
      <div class="card" style="padding:24px;">
        <h3 style="color:var(--brand); border-bottom:2px solid var(--brand); padding-bottom:8px; margin-bottom:20px;">الالتزامات وحقوق الملكية</h3>

        <h4 style="color:var(--text-bad, #ef4444); margin:0 0 12px;">الالتزامات المتداولة</h4>
        ${c.map(t=>i(t,"var(--text-bad, #ef4444)")).join("")||"<p class='dim'>—</p>"}
        ${w("إجمالي الالتزامات المتداولة",c.reduce((t,d)=>t+d.balance,0),"var(--text-bad, #ef4444)")}

        <h4 style="color:var(--text-bad, #ef4444); margin:16px 0 12px;">الالتزامات طويلة الأجل</h4>
        ${v.map(t=>i(t,"var(--warn)")).join("")||"<p class='dim'>—</p>"}
        ${w("إجمالي الالتزامات طويلة الأجل",v.reduce((t,d)=>t+d.balance,0),"var(--warn)")}

        <h4 style="color:var(--brand); margin:16px 0 12px; border-top:1px solid var(--border); padding-top:12px;">حقوق الملكية (Owner's Equity)</h4>
        ${g.map(t=>i(t,"var(--brand)")).join("")||"<p class='dim'>—</p>"}
        <div class="flex justify-between mb-8" style="font-size:13px;">
          <span>أرباح / (خسائر) الفترة الحالية</span>
          <span class="mono ${f>=0?"text-good":"text-bad"}">${e(f)}</span>
        </div>
        ${w("إجمالي حقوق الملكية",l+f,"var(--brand)")}

        <div class="flex justify-between font-bold" style="background:linear-gradient(135deg,var(--bg-2),var(--surface-1)); padding:14px 16px; border-radius:10px; font-size:16px; margin-top:8px; border:2px solid ${x?"var(--good)":"var(--bad)"};">
          <span>إجمالي الالتزامات وحقوق الملكية</span>
          <span class="mono ${x?"text-good":"text-bad"}">${e(n)}</span>
        </div>
      </div>
    </div>
  `}function it(b,p,o){const{netProfit:r}=S(p,o),s=E.filter(u=>u.code?.startsWith("1-1-1-1")||u.code?.startsWith("1-1-1-3")||u.name?.includes("صندوق")||u.name?.includes("بنك")||u.name?.includes("مصرف")),l=new Set(s.map(u=>u.id)),h=new Set(s.map(u=>u.code)),m=u=>l.has(u.accountId)||h.has(u.accountCode);let c=0,v=0;for(const u of A){const y=u.date||"";for(const M of u.lines||[]){if(!m(M))continue;const T=(M.debit||0)-(M.credit||0);y<p&&(c+=T),y<=o&&(v+=T)}}let g=0,k=0,C=0,f=0,n=0,x=0,i=0,w=0,t=0;for(const u of E){if(l.has(u.id)||u.type==="revenue"||u.type==="expense")continue;let y=0,M=0;for(const F of A){const B=F.date||"";for(const P of F.lines||[]){const z=H(P);if(!z||z.id!==u.id)continue;const D=(P.debit||0)-(P.credit||0);B<p&&(y+=D),B<=o&&(M+=D)}}const T=M-y;if(Math.abs(T)<.01)continue;const j=u.code||"";j.startsWith("1-1-2")?g-=T:j.startsWith("1-1-4")?k-=T:j.startsWith("1-1-5")?f-=T:j.startsWith("1-2")||j.startsWith("1-3")?w-=T:j.startsWith("2-1-1")||j.startsWith("2-1-2")?C+=-T:j.startsWith("2-1-3")?n+=-T:j.startsWith("3")?t+=-T:u.type==="asset"?x-=T:u.type==="liability"&&(i+=-T)}const d=g+k+C+f+n+x+i,$=r+d,I=$+w+t,L=(u,y,M=!0)=>`<div class="flex justify-between mb-8" style="font-size:14px;${M?"padding-right:16px; color:var(--text-1);":""}">
       <span>${u}</span>
       <span class="mono ${y>=0?"":"text-bad"}">${y>=0?"":"("}${e(Math.abs(y))}${y>=0?"":")"}</span>
     </div>`,a=(u,y)=>`<div class="flex justify-between font-bold" style="background:var(--bg-2); padding:10px 14px; border-radius:8px; margin:12px 0 24px;">
       <span>${u}</span>
       <span class="mono ${y>=0?"text-good":"text-bad"}">${y>=0?"":"("}${e(Math.abs(y))}${y>=0?"":")"}</span>
     </div>`;b.innerHTML=`
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("تقرير التدفقات النقدية (الطريقة غير المباشرة)",`الفترة من ${p} إلى ${o}`):""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>تقرير التدفقات النقدية (الطريقة غير المباشرة)</h2>
      <p class="dim">للفترة من ${p} إلى ${o}</p>
    </div>

    <div style="max-width:800px; margin:0 auto;">
      <!-- Cash KPIs -->
      <div class="grid-3 gap-16 mb-24">
        <div class="kpi-card">
          <div class="status-bar good"></div>
          <div class="kpi-content">
            <div class="kpi-label">الرصيد النقدي الافتتاحي</div>
            <div class="kpi-value">${e(c)}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="status-bar ${I>=0?"good":"bad"}"></div>
          <div class="kpi-content">
            <div class="kpi-label">صافي التغير في النقدية</div>
            <div class="kpi-value ${I>=0?"text-good":"text-bad"}">${e(I)}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="status-bar indigo"></div>
          <div class="kpi-content">
            <div class="kpi-label">الرصيد النقدي الختامي</div>
            <div class="kpi-value text-indigo">${e(v)}</div>
          </div>
        </div>
      </div>

      <div class="card" style="padding:28px;">
        <h4 style="color:var(--brand); border-bottom:1.5px solid var(--brand); padding-bottom:8px; margin-bottom:16px;">1. الأنشطة التشغيلية (Operating Activities)</h4>
        ${L("صافي ربح الفترة",r,!1)}
        <div style="padding-right:16px; margin-bottom:8px; color:var(--text-2); font-size:12px; font-weight:600;">تسويات التغير في رأس المال العامل:</div>
        ${L("(زيادة) نقص في الذمم المدينة — العملاء",g)}
        ${L("(زيادة) نقص في المخزون السلعي",k)}
        ${L("(زيادة) نقص في ضريبة القيمة المضافة المدخلات",f)}
        ${L("زيادة (نقص) في الذمم الدائنة — الموردون",C)}
        ${L("زيادة (نقص) في ضريبة القيمة المضافة المخرجات",n)}
        ${Math.abs(x)>.01?L("أصول تشغيلية أخرى",x):""}
        ${Math.abs(i)>.01?L("التزامات تشغيلية أخرى",i):""}
        ${a("صافي النقد من الأنشطة التشغيلية",$)}

        <h4 style="color:var(--brand); border-bottom:1.5px solid var(--brand); padding-bottom:8px; margin-bottom:16px;">2. الأنشطة الاستثمارية (Investing Activities)</h4>
        ${L("شراء / بيع أصول ثابتة وممتلكات",w,!1)}
        ${a("صافي النقد من الأنشطة الاستثمارية",w)}

        <h4 style="color:var(--brand); border-bottom:1.5px solid var(--brand); padding-bottom:8px; margin-bottom:16px;">3. الأنشطة التمويلية (Financing Activities)</h4>
        ${L("زيادة رأس المال / مسحوبات المالك / قروض",t,!1)}
        ${a("صافي النقد من الأنشطة التمويلية",t)}

        <div style="border-top:2px solid var(--border); padding-top:16px; margin-top:8px;">
          <div class="flex justify-between font-bold mb-8" style="font-size:15px;">
            <span>صافي التغير الكلي في النقدية خلال الفترة</span>
            <span class="mono ${I>=0?"text-good":"text-bad"}">${e(I)}</span>
          </div>
          <div class="flex justify-between dim mb-8">
            <span>رصيد النقدية في بداية الفترة</span>
            <span class="mono">${e(c)}</span>
          </div>
          <div class="flex justify-between font-bold" style="font-size:16px; background:linear-gradient(135deg,var(--bg-2),var(--surface-1)); padding:14px 16px; border-radius:10px; border:2px solid var(--brand);">
            <span>رصيد النقدية في نهاية الفترة</span>
            <span class="mono text-brand">${e(v)}</span>
          </div>
        </div>
      </div>
    </div>
  `}function dt(b,p,o){let r=0,s=0,l=0,h=0,m=0,c=0;for(const n of E){if(n.type!=="equity")continue;let x=0,i=0;for(const w of A){const t=w.date||"";for(const d of w.lines||[]){const $=H(d);if(!$||$.id!==n.id)continue;const I=(d.credit||0)-(d.debit||0);t<p?x+=I:t>=p&&t<=o&&(i+=I)}}n.name?.includes("رأس المال")?(r+=x,s+=i):n.name?.includes("أرباح مبقاة")||n.name?.includes("أرباح محتجزة")||n.name?.includes("احتياطي")?(l+=x,h+=i):n.name?.includes("مسحوبات")||n.name?.includes("جاري المالك")?(m+=x,c+=i):(r+=x,s+=i)}const{netProfit:v}=S(p,o);h+=v;const g=r+s,k=l+h,C=m+c,f=(n,x,i,w,t=!1,d="")=>`<tr ${t?'style="border-top:2px solid var(--border); background:var(--bg-2); font-weight:bold;"':""}>
      <td>${n}</td>
      <td class="mono ${d}">${e(x)}</td>
      <td class="mono ${d}">${e(i)}</td>
      <td class="mono ${d||(w<0?"text-bad":"")}">${e(w)}</td>
      <td class="mono font-bold ${d}">${e(x+i+w)}</td>
    </tr>`;b.innerHTML=`
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("تقرير الأرباح حسب مراكز التكلفة",`الفترة من ${p} إلى ${o}`):""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>قائمة التغير في حقوق الملكية</h2>
      <p class="dim">للفترة من ${p} إلى ${o}</p>
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
            ${f("رصيد بداية الفترة",r,l,m)}
            ${f("زيادات رأس المال",s,0,0)}
            ${f("صافي ربح الفترة",0,v,0)}
            ${c!==0?f("مسحوبات / توزيعات خلال الفترة",0,0,c):""}
            ${f("رصيد نهاية الفترة",g,k,C,!0,"text-brand")}
          </tbody>
        </table>
      </div>
    </div>
  `}function rt(b,p,o){let r=0,s=0,l=0,h=0,m=0,c=0,v=0;for(const t of E){let d=0;for(const $ of A)if(($.date||"")<=o)for(const L of $.lines||[]){const a=H(L);!a||a.id!==t.id||(d+=(L.debit||0)-(L.credit||0))}if(t.type==="asset")s+=d,t.code?.startsWith("1-2")||t.code?.startsWith("1-3")||t.name?.includes("سيارات")||t.name?.includes("أثاث")||t.name?.includes("معدات")||(r+=d),t.code?.startsWith("1-1-4")&&(m+=d),(t.code?.startsWith("1-1-1-1")||t.code?.startsWith("1-1-1-3"))&&(c+=d),t.code?.startsWith("1-1-2")&&(v+=d);else if(t.type==="liability"){const $=-d;h+=$,t.code?.startsWith("2-2")||t.name?.includes("طويل")||(l+=$)}}const{revenueTotal:g,cogsTotal:k,opExpTotal:C,grossProfit:f,netProfit:n}=S(p,o),x=s-h,i=(t,d,$=!1,I=2)=>{if(!d||d===0)return"—";const L=t/d;return $?(L*100).toFixed(1)+"%":L.toFixed(I)},w=[{group:"🏦 نسب السيولة (Liquidity)",items:[{label:"نسبة السيولة الجارية (Current Ratio)",val:i(r,l),note:"الأصول المتداولة ÷ الالتزامات المتداولة — المثالي ≥ 1.5",good:parseFloat(i(r,l))>=1.5},{label:"نسبة السيولة السريعة (Quick Ratio)",val:i(r-m,l),note:"(الأصول المتداولة - المخزون) ÷ الالتزامات المتداولة — المثالي ≥ 1.0",good:parseFloat(i(r-m,l))>=1},{label:"نسبة النقدية (Cash Ratio)",val:i(c,l),note:"النقدية فقط ÷ الالتزامات المتداولة",good:parseFloat(i(c,l))>=.2},{label:"رأس المال العامل (Working Capital)",val:e(r-l),note:"الأصول المتداولة — الالتزامات المتداولة",good:r-l>=0}]},{group:"📊 نسب الربحية (Profitability)",items:[{label:"هامش مجمل الربح (Gross Margin)",val:i(f,g,!0),note:"مجمل الربح ÷ المبيعات",good:parseFloat(i(f,g,!0))>=20},{label:"هامش صافي الربح (Net Margin)",val:i(n,g,!0),note:"صافي الربح ÷ المبيعات",good:parseFloat(i(n,g,!0))>=5},{label:"العائد على الأصول ROA",val:i(n,s,!0),note:"صافي الربح ÷ إجمالي الأصول",good:parseFloat(i(n,s,!0))>=5},{label:"العائد على حقوق الملكية ROE",val:i(n,x,!0),note:"صافي الربح ÷ حقوق الملكية",good:parseFloat(i(n,x,!0))>=10}]},{group:"⚙️ نسب الكفاءة (Efficiency)",items:[{label:"معدل دوران المخزون",val:i(k,m,!1,1)+"x",note:"تكلفة المباعة ÷ المخزون — كلما ارتفع كان أفضل",good:parseFloat(i(k,m,!1,1))>=4},{label:"معدل دوران الذمم المدينة",val:i(g,v,!1,1)+"x",note:"المبيعات ÷ الذمم المدينة",good:parseFloat(i(g,v,!1,1))>=6},{label:"نسبة التكلفة إلى الإيراد",val:i(k,g,!0),note:"COGS ÷ المبيعات — كلما انخفض كان أفضل",good:parseFloat(i(k,g,!0))<=70},{label:"نسبة المصروفات إلى الإيراد",val:i(C,g,!0),note:"المصاريف التشغيلية ÷ المبيعات",good:parseFloat(i(C,g,!0))<=15}]},{group:"🏗️ نسب الرفع المالي (Leverage)",items:[{label:"نسبة الديون إلى الأصول",val:i(h,s,!0),note:"الالتزامات ÷ الأصول — المثالي ≤ 50%",good:parseFloat(i(h,s,!0))<=50},{label:"نسبة الديون إلى حقوق الملكية",val:i(h,x,!1,2),note:"الالتزامات ÷ حقوق الملكية — المثالي ≤ 1.0",good:parseFloat(i(h,x))<=1},{label:"إجمالي الأصول",val:e(s),note:"مجموع الأصول المتداولة + الثابتة",good:!0},{label:"إجمالي الالتزامات",val:e(h),note:"مجموع الالتزامات المتداولة وطويلة الأجل",good:!0}]}];b.innerHTML=`
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("نسب التحليل المالي والربحية (Financial Ratios)",`الفترة من ${p} إلى ${o}`):""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>لوحة التحليل المالي والمؤشرات (Financial Ratios)</h2>
      <p class="dim">للفترة من ${p} إلى ${o}</p>
    </div>

    <!-- Summary Banner -->
    <div class="grid-4 gap-16 mb-28" style="max-width:1200px; margin:0 auto 28px;">
      ${[{label:"إجمالي الإيرادات",val:e(g),icon:"💰",color:"#22c55e"},{label:"مجمل الربح",val:e(f),icon:"📈",color:"#6366f1"},{label:"صافي الربح",val:e(n),icon:"🎯",color:n>=0?"#2dd4bf":"#ef4444"},{label:"إجمالي الأصول",val:e(s),icon:"🏛️",color:"#e58a2b"}].map(t=>`
        <div class="kpi-card">
          <div class="kpi-content">
            <div style="font-size:28px; margin-bottom:8px;">${t.icon}</div>
            <div class="kpi-label">${t.label}</div>
            <div class="kpi-value" style="color:${t.color}; font-size:20px;">${t.val}</div>
          </div>
        </div>`).join("")}
    </div>

    <!-- Ratio Groups -->
    <div style="max-width:1200px; margin:0 auto;">
      ${w.map(t=>`
        <div class="card mb-20" style="padding:24px;">
          <h3 style="color:var(--brand); margin-bottom:20px; font-family:var(--font-heading);">${t.group}</h3>
          <div class="grid-2 gap-16">
            ${t.items.map(d=>`
              <div style="background:var(--bg-2); border-radius:10px; padding:16px; border-left:4px solid ${d.good?"var(--good, #22c55e)":"var(--warn, #f59e0b)"};">
                <div style="font-size:12px; color:var(--text-2); margin-bottom:4px;">${d.label}</div>
                <div style="font-size:22px; font-weight:700; font-family:monospace; color:${d.good?"var(--good, #22c55e)":"var(--warn, #f59e0b)"};">${d.val}</div>
                <div style="font-size:11px; color:var(--text-2); margin-top:6px;">${d.note}</div>
              </div>`).join("")}
          </div>
        </div>`).join("")}
    </div>
  `}export{vt as render};
