const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CF9GFeRJ.js","assets/index-7vgn-Vu2.css","assets/sync-engine-B3XmYvGy.js"])))=>i.map(i=>d[i]);
import{s as ft,t as pt,g as Y,C as Z,f as i,_ as dt,a as St,d as Tt}from"./index-CF9GFeRJ.js";import{e as xt}from"./excel-DM5XZHtQ.js";import{orderBy as Et,getDoc as It,doc as Dt}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let q=[],Q=[],rt="ledger",it=null,gt=null,N=[];async function ae(o,s){o.innerHTML=`
    <!-- Top Filter Bar -->
    <div class="filterbar no-print" style="flex-wrap:wrap; gap:10px; align-items:center;">
      <div style="display:flex; gap:6px; background:var(--bg-2); padding:3px 6px; border-radius:8px;">
        <button class="btn btn-xs btn-ghost active" id="fin-btn-month" onclick="setFinDateRange('month')">هذا الشهر</button>
        <button class="btn btn-xs btn-ghost" id="fin-btn-quarter" onclick="setFinDateRange('quarter')">الربع الحالي</button>
        <button class="btn btn-xs btn-ghost" id="fin-btn-year" onclick="setFinDateRange('year')">العام الحالي</button>
        <button class="btn btn-xs btn-ghost" id="fin-btn-all" onclick="setFinDateRange('all')">كل الفترات</button>
      </div>
      <div class="date-range-group">
        <label>من</label>
        <input type="date" id="fin-from" value="${ft()}" />
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
  `,window.setFinDateRange=t=>{const a=new Date,p=pt();document.querySelectorAll("[id^='fin-btn-']").forEach(y=>y.classList.remove("active"));const v=document.getElementById(`fin-btn-${t}`);if(v&&v.classList.add("active"),t==="quarter"){const y=Math.floor(a.getMonth()/3)*3;document.getElementById("fin-from").value=`${a.getFullYear()}-${String(y+1).padStart(2,"0")}-01`,document.getElementById("fin-to").value=p}else t==="month"?(document.getElementById("fin-from").value=`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-01`,document.getElementById("fin-to").value=p):t==="year"?(document.getElementById("fin-from").value=`${a.getFullYear()}-01-01`,document.getElementById("fin-to").value=p):t==="all"&&(document.getElementById("fin-from").value="2020-01-01",document.getElementById("fin-to").value=p);q.length>0&&Q.length>0?st():loadDataAndRender()};const d=()=>{document.querySelectorAll("[id^='fin-btn-']").forEach(t=>t.classList.remove("active")),q.length>0&&Q.length>0?st():loadDataAndRender()};document.getElementById("fin-from").addEventListener("change",d),document.getElementById("fin-to").addEventListener("change",d),document.getElementById("fin-from").addEventListener("input",d),document.getElementById("fin-to").addEventListener("input",d),await loadDataAndRender()}let vt={},yt={};function zt(o){return vt[o.accountId]||yt[o.accountCode]||null}function Rt(o){const s=o.code||"";return s==="5-1-8"||s==="5-1-1"||s==="5-1-7"||s==="5-1-9"||s==="5-1-3"||s.startsWith("5-1-")||s==="4-2-4"||o.name?.includes("تكلفة البضاعة المباعة")||o.name?.includes("تكلفة مبيعات")||o.name?.includes("نقل بضاعة")}window.loadDataAndRender=async function(o=!0){const s=document.getElementById("fin-report-body");if(s){s.innerHTML='<div class="page-loading"><div class="loading-spinner"></div><span>جارٍ تحميل البيانات المحاسبية…</span></div>';try{const{COLS:d}=await dt(async()=>{const{COLS:p}=await import("./index-CF9GFeRJ.js").then(v=>v.T);return{COLS:p}},__vite__mapDeps([0,1])),[t,a]=await Promise.all([Y(d.chartOfAccounts(),[Et("code")]),Y(d.journalEntries(),[Et("date","asc")])]);if(q=t,vt={},yt={},q.forEach(p=>{vt[p.id]=p,yt[p.code]=p}),Q=a,rt==="custperf"){const[p,v]=await Promise.all([Y(d.salesInvoices()),Y(d.receipts())]);it=p,gt=v}st()}catch(d){s.innerHTML=`<div class="alert bad">${d.message}</div>`}}};window.switchFinTab=o=>{rt=o,document.querySelectorAll(".tab-btn").forEach(d=>{d.classList.remove("active"),d.style.color="var(--text-2)",d.style.borderBottomColor="transparent"});const s=document.getElementById(`btn-tab-${o}`);s&&(s.classList.add("active"),s.style.color="var(--brand)",s.style.borderBottomColor="var(--brand)"),window.loadDataAndRender(!0)};function st(){const o=document.getElementById("fin-report-body");if(!o)return;let s=document.getElementById("fin-from")?.value||ft(),d=document.getElementById("fin-to")?.value||pt();const t=C=>{if(!C)return"";if(/^\d{4}-\d{2}-\d{2}$/.test(C))return C;const l=C.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);if(l)return`${l[3]}-${l[2].padStart(2,"0")}-${l[1].padStart(2,"0")}`;const P=new Date(C);return isNaN(P.getTime())?C:P.toISOString().split("T")[0]};let a=t(s),p=t(d);if(a&&p&&a>p){const C=a;a=p,p=C}const v=document.getElementById("fin-extra-filters");if(v)if(rt==="trial"){v.innerHTML=`
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
      `;const C=document.getElementById("trial-level");C&&C.addEventListener("change",l=>{window.trialLevel=l.target.value,st()})}else if(rt==="custperf"){const C=[...new Set((it||[]).filter(l=>l.repName).map(l=>l.repName))].sort();v.innerHTML=`
        <div class="date-range-group">
          <label>المندوب</label>
          <select id="custperf-rep" style="padding:6px 12px; border:1px solid var(--border); border-radius:6px; background:var(--bg-1); color:var(--text-1); font-weight:bold; font-size:12px; min-height:38px;">
            <option value="">كل المناديب</option>
            ${C.map(l=>`<option value="${l}" ${window.custperfRep===l?"selected":""}>${l}</option>`).join("")}
          </select>
        </div>
        <div class="date-range-group">
          <label>مؤشر الربحية</label>
          <select id="custperf-profit-filter" style="padding:6px 12px; border:1px solid var(--border); border-radius:6px; background:var(--bg-1); color:var(--text-1); font-weight:bold; font-size:12px; min-height:38px;">
            <option value="all" ${window.custperfProfitFilter==="all"||!window.custperfProfitFilter?"selected":""}>كل مستويات الربح</option>
            <option value="loss" ${window.custperfProfitFilter==="loss"?"selected":""}>🔴 ربح سالب (خسارة &lt; 0%)</option>
            <option value="low" ${window.custperfProfitFilter==="low"?"selected":""}>🟡 هامش منخفض (&lt; 3%)</option>
            <option value="good" ${window.custperfProfitFilter==="good"?"selected":""}>🟢 هامش ممتاز (≥ 3%)</option>
          </select>
        </div>
        <div class="date-range-group">
          <label>الترتيب حسب</label>
          <select id="custperf-sort" style="padding:6px 12px; border:1px solid var(--border); border-radius:6px; background:var(--bg-1); color:var(--text-1); font-weight:bold; font-size:12px; min-height:38px;">
            <option value="sales" ${window.custperfSort==="sales"||!window.custperfSort?"selected":""}>المبيعات</option>
            <option value="profit" ${window.custperfSort==="profit"?"selected":""}>الربح</option>
            <option value="profitPct" ${window.custperfSort==="profitPct"?"selected":""}>نسبة هامش الربح</option>
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
      `,document.getElementById("custperf-rep")?.addEventListener("change",l=>{window.custperfRep=l.target.value,st()}),document.getElementById("custperf-profit-filter")?.addEventListener("change",l=>{window.custperfProfitFilter=l.target.value,st()}),document.getElementById("custperf-sort")?.addEventListener("change",l=>{window.custperfSort=l.target.value,l.target.value==="sales"?window.custperfSortKey="totalSales":l.target.value==="profit"?window.custperfSortKey="profit":l.target.value==="profitPct"?window.custperfSortKey="profitPct":l.target.value==="collection"?window.custperfSortKey="collectionPct":l.target.value==="remaining"?window.custperfSortKey="remainingAmount":l.target.value==="daily"&&(window.custperfSortKey="dailyAvg"),window.custperfSortDir="desc",st()})}else v.innerHTML="";({ledger:Mt,trial:Lt,income:Nt,balance:jt,cashflow:Ht,equity:Vt,breakeven:mt,analysis:Wt,aging:Gt,custperf:qt}[rt]||Mt)(o,a,p)}function Mt(o,s,d){let t=s||document.getElementById("fin-from")?.value||ft(),a=d||document.getElementById("fin-to")?.value||pt();const p=[...q].sort((g,c)=>(g.code||"").localeCompare(c.code||""));let v=window._activeLedgerAccId||p.find(g=>g.code==="1-1-1-1"||g.code==="1-1-1"||g.code==="1")?.id||p[0]?.id;const y=g=>({asset:{label:"أصول",bg:"rgba(16,185,129,0.12)",color:"#047857"},liability:{label:"خصوم",bg:"rgba(239,68,68,0.12)",color:"#b91c1c"},equity:{label:"حقوق ملكية",bg:"rgba(99,102,241,0.12)",color:"#4338ca"},revenue:{label:"إيرادات",bg:"rgba(59,130,246,0.12)",color:"#1d4ed8"},expense:{label:"مصروفات",bg:"rgba(245,158,11,0.12)",color:"#b45309"}})[g]||{label:g||"حساب",bg:"rgba(100,116,139,0.12)",color:"#475569"},C=p.find(g=>g.id===v),l=C?`${C.code} — ${C.name}`:"",P=p.map(g=>{const c=g.isHeader||g.isGroup||g.nodeType==="header"||g.nodeType==="group";return`<option value="${g.id}" ${g.id===v?"selected":""}>${g.code} — ${g.name}${c?" 📁 (رئيسي)":""}</option>`}).join("");o.innerHTML=`
    <!-- ═══ TOP LEDGER CONTROL TOOLBAR ═══ -->
    <div class="card no-print mb-16" style="padding:16px 20px; background:var(--bg-1); border-radius:14px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm);">
      
      <div style="display:flex; gap:14px; align-items:flex-end; flex-wrap:wrap; margin-bottom:14px;">
        
        <!-- 1. Live Search Input (Auto-complete) -->
        <div style="position:relative; flex:1.5; min-width:280px;">
          <label style="font-size:11.5px; font-weight:700; margin-bottom:4px; display:block; color:var(--text-2);">🔍 ابحث عن الحساب بأي حرف أو كود</label>
          <div style="position:relative;">
            <input type="text" id="ledger-search-input" class="input" value="${l}" placeholder="اكتب اسم الحساب أو الكود (مثال: صندوق، راجحي، أصول، مبيعات)..." autocomplete="off" style="padding-right:34px; font-size:12.5px; font-weight:700; height:38px; width:100%; border-radius:8px;" />
            <span style="position:absolute; right:10px; top:50%; transform:translateY(-50%); font-size:15px; pointer-events:none; opacity:0.6;">🔎</span>
          </div>
          <!-- Dropdown Results -->
          <div id="ledger-search-results" class="shadow-lg" style="display:none; position:absolute; top:calc(100% + 4px); right:0; left:0; z-index:1050; max-height:280px; overflow-y:auto; background:var(--bg-card, #fff); border:1.5px solid var(--brand, #3b82f6); border-radius:10px; box-shadow:0 10px 25px rgba(0,0,0,0.25); padding:6px;"></div>
        </div>

        <!-- 2. Standard Select Dropdown -->
        <div class="form-group" style="flex:1.2; min-width:240px; margin:0;">
          <label style="font-size:11.5px; font-weight:700; margin-bottom:4px; display:block; color:var(--text-2);">أو اختر من شجرة الحسابات</label>
          <select id="ledger-acc-select" class="input" onchange="onLedgerAccSelectChanged()" style="font-size:12px; font-weight:700; height:38px; border-radius:8px;">
            ${P}
          </select>
        </div>

        <!-- 3. Export & Print Buttons -->
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="exportLedgerExcel()" style="height:38px; font-weight:700; border-radius:8px; display:inline-flex; align-items:center; gap:6px;">
            <span>📊</span> Excel
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="printLedgerPDF()" style="height:38px; font-weight:700; border-radius:8px; display:inline-flex; align-items:center; gap:6px;">
            <span>📄</span> PDF
          </button>
          <button type="button" class="btn btn-primary btn-sm" onclick="printLedgerReport()" style="height:38px; font-weight:700; border-radius:8px; display:inline-flex; align-items:center; gap:6px;">
            <span>🖨️</span> طباعة
          </button>
        </div>
      </div>

      <!-- ═══ DATE FILTER ROW & PRESETS ═══ -->
      <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; border-top:1px dashed var(--border-soft); padding-top:12px;">
        <div class="date-range-group" style="margin:0;">
          <label style="font-size:11px; font-weight:700; margin-bottom:3px; display:block; color:var(--text-2);">من تاريخ</label>
          <input type="date" id="ledger-from" class="input" value="${t}" onchange="onLedgerDateChanged()" style="height:32px; font-size:12px; width:135px;" />
        </div>
        <div class="date-range-group" style="margin:0;">
          <label style="font-size:11px; font-weight:700; margin-bottom:3px; display:block; color:var(--text-2);">إلى تاريخ</label>
          <input type="date" id="ledger-to" class="input" value="${a}" onchange="onLedgerDateChanged()" style="height:32px; font-size:12px; width:135px;" />
        </div>

        <!-- Quick Date Buttons -->
        <div style="display:flex; gap:4px; align-items:center; flex-wrap:wrap; margin-top:14px;">
          <button type="button" class="btn btn-sm btn-ghost led-preset-btn" data-preset="today" onclick="setLedgerPeriod('today')">اليوم</button>
          <button type="button" class="btn btn-sm btn-ghost led-preset-btn" data-preset="yesterday" onclick="setLedgerPeriod('yesterday')">أمس</button>
          <button type="button" class="btn btn-sm btn-ghost led-preset-btn" data-preset="week" onclick="setLedgerPeriod('week')">الأسبوع</button>
          <button type="button" class="btn btn-sm btn-primary led-preset-btn" data-preset="month" onclick="setLedgerPeriod('month')">هذا الشهر</button>
          <button type="button" class="btn btn-sm btn-ghost led-preset-btn" data-preset="last_month" onclick="setLedgerPeriod('last_month')">الشهر الماضي</button>
          <button type="button" class="btn btn-sm btn-ghost led-preset-btn" data-preset="quarter" onclick="setLedgerPeriod('quarter')">الربع</button>
          <button type="button" class="btn btn-sm btn-ghost led-preset-btn" data-preset="year" onclick="setLedgerPeriod('year')">العام</button>
          <button type="button" class="btn btn-sm btn-ghost led-preset-btn" data-preset="all" onclick="setLedgerPeriod('all')">شامل الكل</button>
        </div>

        <!-- Table Row Search -->
        <div style="flex:1; min-width:180px; margin-top:14px; margin-right:auto;">
          <input type="text" id="ledger-line-filter" class="input" placeholder="🔍 فلترة سريعة بالبيان أو رقم القيد..." oninput="filterLedgerTableRows()" style="height:32px; font-size:11.5px;" />
        </div>
      </div>

    </div>

    <!-- ═══ REPORT VIEW AREA ═══ -->
    <div id="ledger-report-area"></div>
  `;const $=document.getElementById("ledger-search-input"),S=document.getElementById("ledger-search-results"),m=document.getElementById("ledger-acc-select"),u=g=>{const c=(g||"").trim().toLowerCase();if(!c){S&&(S.style.display="none");return}const w=p.filter(r=>{const k=String(r.code||"").toLowerCase(),e=String(r.name||"").toLowerCase();return k.includes(c)||e.includes(c)});if(w.length===0){S.innerHTML=`<div style="padding:10px 14px; font-size:12px; color:var(--text-3); text-align:center;">لا يوجد حساب مطابق لكلمة البحث "${g}"</div>`,S.style.display="block";return}S.innerHTML=w.slice(0,30).map(r=>{const k=y(r.type),e=r.isHeader||r.isGroup||r.nodeType==="header"||r.nodeType==="group",n=r.id===v;return`
        <div class="ledger-search-item" onclick="selectLedgerAccount('${r.id}')" style="padding:8px 12px; border-radius:6px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:background 0.15s; background:${n?"rgba(59,130,246,0.1)":"transparent"}; margin-bottom:2px;">
          <div>
            <span class="mono" style="font-weight:800; color:var(--brand, #2563eb); font-size:12px; margin-left:6px;">${r.code}</span>
            <strong style="font-size:12.5px; color:var(--text-0);">${r.name}</strong>
            ${e?'<span style="font-size:10px; color:#d97706; margin-right:4px;">📁 (رئيسي)</span>':""}
          </div>
          <div>
            <span style="font-size:10.5px; font-weight:700; padding:2px 7px; border-radius:4px; background:${k.bg}; color:${k.color};">${k.label}</span>
          </div>
        </div>
      `}).join(""),S.style.display="block"};$?.addEventListener("input",g=>u(g.target.value)),$?.addEventListener("focus",g=>{g.target.value&&u(g.target.value)}),document.addEventListener("click",g=>{!g.target.closest("#ledger-search-input")&&!g.target.closest("#ledger-search-results")&&S&&(S.style.display="none")}),window.selectLedgerAccount=g=>{v=g,window._activeLedgerAccId=g,m&&(m.value=g);const c=q.find(w=>w.id===g);$&&c&&($.value=`${c.code} — ${c.name}`),S&&(S.style.display="none"),updateLedgerLines()},window.onLedgerAccSelectChanged=()=>{const g=m?.value;g&&window.selectLedgerAccount(g)},window.onLedgerDateChanged=()=>{t=document.getElementById("ledger-from")?.value||t,a=document.getElementById("ledger-to")?.value||a;const g=document.getElementById("fin-from"),c=document.getElementById("fin-to");g&&(g.value=t),c&&(c.value=a),updateLedgerLines()},window.setLedgerPeriod=g=>{const c=new Date,w=c.getFullYear(),r=c.getMonth(),k=c.getDate(),e=f=>String(f).padStart(2,"0"),n=(f,z,I)=>`${f}-${e(z)}-${e(I)}`,b=n(w,r+1,k);if(document.querySelectorAll(".led-preset-btn").forEach(f=>{const z=f.dataset.preset===g;f.classList.toggle("btn-primary",z),f.classList.toggle("btn-ghost",!z)}),g==="today")t=b,a=b;else if(g==="yesterday"){const f=new Date(c);f.setDate(k-1);const z=n(f.getFullYear(),f.getMonth()+1,f.getDate());t=z,a=z}else if(g==="week"){const f=c.getDay(),z=new Date(c);z.setDate(k-(f+1)%7),t=n(z.getFullYear(),z.getMonth()+1,z.getDate()),a=b}else if(g==="month")t=n(w,r+1,1),a=b;else if(g==="last_month"){const f=r===0?11:r-1,z=r===0?w-1:w,I=new Date(w,r,0).getDate();t=n(z,f+1,1),a=n(z,f+1,I)}else if(g==="quarter"){const f=Math.floor(r/3)*3;t=n(w,f+1,1),a=b}else g==="year"?(t=n(w,1,1),a=b):g==="all"&&(t="2020-01-01",a=b);const T=document.getElementById("ledger-from"),x=document.getElementById("ledger-to");T&&(T.value=t),x&&(x.value=a),window.onLedgerDateChanged()},window.filterLedgerTableRows=()=>{const g=(document.getElementById("ledger-line-filter")?.value||"").trim().toLowerCase();document.querySelectorAll("#ledger-table-body tr.ledger-data-row").forEach(w=>{const r=w.textContent.toLowerCase();w.style.display=!g||r.includes(g)?"":"none"})},window.updateLedgerLines=()=>{const g=v||document.getElementById("ledger-acc-select")?.value,c=q.find(E=>E.id===g);if(!c)return;const w=t,r=a,k=["liability","equity","revenue"].includes(c.type),e=q.some(E=>E.code!==c.code&&E.code.startsWith(c.code+"-"));let n=0;const b=[];if(e){const E={};for(const M of Q){const j=M.date||"";for(const A of M.lines||[]){const H=A.accountCode;if(!H||H!==c.code&&!H.startsWith(c.code+"-"))continue;const O=A.debit||0,K=A.credit||0;j<w?n+=O-K:j>=w&&j<=r&&(E[M.id]||(E[M.id]={date:j,entryNumber:ut(M.entryNumber,M.id),description:M.description||"",sourceType:M.sourceType||"",debit:0,credit:0,entryId:M.id}),E[M.id].debit+=O,E[M.id].credit+=K)}}Object.values(E).sort((M,j)=>M.date.localeCompare(j.date)).forEach(M=>b.push(M))}else{for(const E of Q){const M=E.date||"";for(const j of E.lines||[]){const A=zt(j);if(!A||A.id!==g)continue;const H=j.debit||0,O=j.credit||0;M<w?n+=H-O:M>=w&&M<=r&&b.push({date:M,entryNumber:ut(E.entryNumber,E.id),description:E.description||"",sourceType:E.sourceType||"",debit:H,credit:O,note:j.note||"",entryId:E.id})}}b.sort((E,M)=>E.date.localeCompare(M.date))}const T=b.reduce((E,M)=>E+M.debit,0),x=b.reduce((E,M)=>E+M.credit,0);window._ledgerData={acc:c,from:w,to:r,openingBalance:n,isCreditNormal:k,lines:b,totalDr:T,totalCr:x};const f=document.getElementById("ledger-report-area");if(!f)return;const z=e?'<span style="font-size:11px; background:rgba(245,158,11,0.15); color:#b45309; border:1px solid rgba(245,158,11,0.3); padding:3px 10px; border-radius:6px; margin-right:8px; font-weight:800;">📁 حساب رئيسي (مجمع يشمل الحسابات المتفرعة)</span>':"";let I=k?-n:n;const F=b.map(E=>{const M=E.debit-E.credit;I+=k?-M:M;const j=Math.abs(I),A=I>=0?"مدين":"دائن",H=(k?I<=0:I>=0)?"var(--text-1)":"#ef4444",O=E.entryId?`<span onclick="window.showJEDetail('${E.entryId}')" style="color:var(--brand, #2563eb); cursor:pointer; font-weight:bold; font-size:12px; text-decoration:underline dotted;" title="انقر لعرض تفاصيل القيد كاملاً">${E.entryNumber}</span>`:`<span style="font-size:12px; font-weight:bold; color:var(--brand);">${E.entryNumber}</span>`;return`
        <tr class="ledger-data-row" style="transition:background 0.15s ease;">
          <td class="dim" style="font-size:12px; white-space:nowrap;">${E.date}</td>
          <td class="mono font-bold">${O}</td>
          <td style="font-size:12.5px; max-width:280px; line-height:1.4;">${E.description}</td>
          <td class="dim" style="font-size:11.5px; font-weight:600;"><span class="badge" style="background:var(--bg-2); border:1px solid var(--border-soft); font-size:11px;">${Ct(E.sourceType)||E.note||"—"}</span></td>
          <td class="mono font-bold" style="color:#4338ca; font-size:12.5px; text-align:left;">${E.debit?i(E.debit):"—"}</td>
          <td class="mono font-bold" style="color:#059669; font-size:12.5px; text-align:left;">${E.credit?i(E.credit):"—"}</td>
          <td class="mono font-bold" style="color:${H}; font-size:13px; text-align:left; white-space:nowrap;">${i(j)} <span class="dim" style="font-size:10.5px; font-weight:normal;">${A}</span></td>
        </tr>`}).join(""),B=Math.abs(k?-n:n),h=(k?-n:n)>=0?"مدين":"دائن",D=Math.abs(I),_=I>=0?"مدين":"دائن",L=(k?I<=0:I>=0)?"#047857":"#ef4444";f.innerHTML=`
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("دفتر الأستاذ التفصيلي",`حساب: ${c.code} — ${c.name} | من ${w} إلى ${r}`):""}
      
      <!-- ═══ 4 KPI SUMMARY CARDS FOR ACCOUNT ═══ -->
      <div class="kpi-grid mb-16 no-print" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(190px, 1fr)); gap:12px; margin-bottom:16px;">
        <div style="background:var(--bg-card, #fff); border-radius:12px; padding:12px 16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm);">
          <div style="font-size:11px; font-weight:700; color:var(--text-3); margin-bottom:3px;">📌 الرصيد الافتتاحي (قبل ${w})</div>
          <div class="mono font-bold" style="font-size:16px; color:var(--text-0);">${i(B)} <span style="font-size:11px; font-weight:800; color:${h==="مدين"?"#2563eb":"#059669"};">(${h})</span></div>
        </div>
        <div style="background:var(--bg-card, #fff); border-radius:12px; padding:12px 16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm);">
          <div style="font-size:11px; font-weight:700; color:#4338ca; margin-bottom:3px;">📈 إجمالي حركات المدين (+)</div>
          <div class="mono font-bold" style="font-size:16px; color:#4338ca;">${i(T)}</div>
        </div>
        <div style="background:var(--bg-card, #fff); border-radius:12px; padding:12px 16px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm);">
          <div style="font-size:11px; font-weight:700; color:#059669; margin-bottom:3px;">📉 إجمالي حركات الدائن (-)</div>
          <div class="mono font-bold" style="font-size:16px; color:#059669;">${i(x)}</div>
        </div>
        <div style="background:var(--bg-card, #fff); border-radius:12px; padding:12px 16px; border:1.5px solid ${_===(k?"دائن":"مدين")?"rgba(16,185,129,0.4)":"rgba(239,68,68,0.4)"}; box-shadow:var(--shadow-sm);">
          <div style="font-size:11px; font-weight:700; color:var(--text-0); margin-bottom:3px;">🏁 الرصيد الختامي الحالي (${r})</div>
          <div class="mono font-bold" style="font-size:17px; color:${L};">${i(D)} <span style="font-size:11.5px; font-weight:900;">(${_})</span></div>
        </div>
      </div>

      <div class="no-print" style="text-align:center; margin-bottom:16px;">
        <h3 style="margin:0 0 4px; font-family:var(--font-heading); font-size:17px;">📒 دفتر الأستاذ التفصيلي ${z}</h3>
        <p class="dim" style="margin:0; font-size:12.5px;">حساب: <strong style="color:var(--brand);">${c.code}</strong> — <strong>${c.name}</strong> | للفترة من <strong>${w}</strong> إلى <strong>${r}</strong></p>
      </div>

      <div class="card" style="border-radius:14px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); overflow:hidden; background:var(--bg-card);">
        <div class="table-container" style="overflow-x:auto;">
          <table class="data-dense" style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:var(--bg-2); border-bottom:2px solid var(--border-soft);">
                <th style="width:100px; text-align:right;">التاريخ</th>
                <th style="width:130px; text-align:right;">رقم القيد</th>
                <th style="min-width:200px; text-align:right;">البيان</th>
                <th style="width:120px; text-align:right;">نوع العملية</th>
                <th class="text-indigo" style="width:120px; text-align:left; color:#4338ca;">مدين</th>
                <th class="text-lime" style="width:120px; text-align:left; color:#059669;">دائن</th>
                <th style="width:140px; text-align:left;">الرصيد الجاري</th>
              </tr>
            </thead>
            <tbody id="ledger-table-body">
              <tr style="background:rgba(0,0,0,0.02); font-weight:bold; border-bottom:1px solid var(--border-soft);">
                <td colspan="4" style="padding:10px 14px; font-size:12.5px;">📌 رصيد افتتاحي (قبل ${w})</td>
                <td class="mono" style="text-align:left;">—</td>
                <td class="mono" style="text-align:left;">—</td>
                <td class="mono font-bold" style="text-align:left; color:${B>0?"var(--text-good,#22c55e)":"var(--text-2)"}; font-size:13px;">${i(B)} <span class="dim" style="font-size:11px;">${h}</span></td>
              </tr>
              ${b.length===0?'<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-2); font-size:13px;">لا توجد أي حركات مسجلة لهذا الحساب خلال الفترة المحددة</td></tr>':""}
              ${F}
            </tbody>
            <tfoot>
              <tr style="border-top:2px solid var(--border); background:var(--bg-2); font-weight:800;">
                <td colspan="4" style="padding:12px 14px; font-size:13px;">📊 إجمالي حركات الفترة (${b.length} حركة)</td>
                <td class="mono font-bold" style="color:#4338ca; text-align:left; font-size:13.5px;">${i(T)}</td>
                <td class="mono font-bold" style="color:#059669; text-align:left; font-size:13.5px;">${i(x)}</td>
                <td class="mono font-bold" style="color:${L}; text-align:left; font-size:14px;">${i(D)} <span class="dim" style="font-size:11px;">${_}</span></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `},window.printLedgerReport=()=>{window.print()},window.printLedgerPDF=()=>{typeof exportPagePDF=="function"?exportPagePDF("#ledger-report-area",`دفتر_استاذ_${window._ledgerData?.acc?.code||"حساب"}`):window.print()},window.exportLedgerExcel=()=>{const g=window._ledgerData;if(!g)return;let c=`\uFEFFدفتر الأستاذ - ${g.acc.code} - ${g.acc.name}
`;c+=`من ${g.from} إلى ${g.to}

`,c+=`التاريخ,رقم القيد,البيان,نوع العملية,مدين,دائن,الرصيد
`;let w=g.isCreditNormal?-g.openingBalance:g.openingBalance;c+=`,,رصيد افتتاحي,,,, ${w.toFixed(2)}
`,g.lines.forEach(n=>{const b=n.debit-n.credit;w+=g.isCreditNormal?-b:b,c+=`${n.date},${n.entryNumber},"${n.description}",${Ct(n.sourceType)||"-"},${n.debit||"0"},${n.credit||"0"},${w.toFixed(2)}
`});const r=new Blob([c],{type:"text/csv;charset=utf-8;"}),k=URL.createObjectURL(r),e=document.createElement("a");e.href=k,e.download=`ledger_${g.acc.code}_${g.from}_${g.to}.csv`,e.click(),URL.revokeObjectURL(k)},window.showJEDetail=g=>{const c=Q.find(b=>b.id===g);if(!c){window.showToast?.("لم يُعثر على القيد","error");return}const w=(c.lines||[]).map(b=>{const T=vt[b.accountId]||yt[b.accountCode];return`<tr>
        <td style="font-size:13px;">${T?`${T.code} — ${T.name}`:b.accountCode||b.accountId||"—"}</td>
        <td class="mono" style="color:#6366f1;text-align:center;">${b.debit?i(b.debit):"—"}</td>
        <td class="mono" style="color:#22c55e;text-align:center;">${b.credit?i(b.credit):"—"}</td>
        <td class="dim" style="font-size:12px;">${b.note||"—"}</td>
      </tr>`}).join(""),r=(c.lines||[]).reduce((b,T)=>b+(T.debit||0),0),k=(c.lines||[]).reduce((b,T)=>b+(T.credit||0),0),e=Math.abs(r-k)<.01,n=document.createElement("div");n.id="je-detail-modal",n.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;",n.innerHTML=`
      <div style="background:var(--bg-1);border-radius:12px;max-width:760px;width:100%;max-height:85vh;overflow-y:auto;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.4);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:12px;">
          <div>
            <div style="font-size:18px;font-weight:bold;">📋 ${ut(c.entryNumber,c.id)}</div>
            <div class="dim" style="font-size:13px;margin-top:4px;">${c.date} | ${c.description||"—"} | ${Ct(c.sourceType)||c.sourceType||"يدوي"}</div>
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
          <tbody>${w}</tbody>
          <tfoot><tr style="background:var(--bg-2);font-weight:bold;border-top:2px solid var(--border);">
            <td style="padding:8px;">الإجمالي</td>
            <td style="padding:8px;text-align:center;color:#6366f1;">${i(r)}</td>
            <td style="padding:8px;text-align:center;color:#22c55e;">${i(k)}</td>
            <td style="padding:8px;font-size:12px;">${e?"✅ قيد متوازن":"⚠️ قيد غير متوازن!"}</td>
          </tr></tfoot>
        </table>

        <!-- Actions / Print Footer -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; padding-top:12px; border-top:1px solid var(--border); flex-wrap:wrap; gap:8px;">
          <button onclick="document.getElementById('je-detail-modal').remove()" class="btn btn-ghost" style="padding:6px 14px; font-size:12px;">إغلاق</button>
          <div style="display:flex; gap:8px; align-items:center;">
            ${window.isSalaryRelatedEntry&&window.isSalaryRelatedEntry(c)||(c.description||"").includes("راتب")||(c.description||"").includes("مستحقات")||(c.description||"").includes("مكاف")?`
              <button class="btn btn-primary" onclick="if(window.printSalaryVoucherFromJE){ window.printSalaryVoucherFromJE('${c.id}'); } else { import('./journal-entries.js?v=45.0').then(() => window.printSalaryVoucherFromJE && window.printSalaryVoucherFromJE('${c.id}')); }" style="background:#059669; border-color:#059669; color:#fff; font-weight:bold; font-size:12px; padding:6px 14px; display:inline-flex; align-items:center; gap:6px;">
                <span>📄</span> طباعة سند صرف واستلام راتب الموظف
              </button>`:""}
            <button class="btn btn-secondary" onclick="if(window.printSingleJournalVoucher){ window.printSingleJournalVoucher('${c.id}'); } else { import('./journal-entries.js?v=45.0').then(() => window.printSingleJournalVoucher && window.printSingleJournalVoucher('${c.id}')); }" style="font-size:12px; padding:6px 14px; display:inline-flex; align-items:center; gap:6px;">
              <span>🖨️</span> طباعة سند القيد المحاسبي
            </button>
          </div>
        </div>

      </div>`,n.addEventListener("click",b=>{b.target===n&&n.remove()}),document.body.appendChild(n)},updateLedgerLines()}function ut(o,s){return o&&o!=="undefined"&&o.trim()?o:`JE-${(s||"").slice(-6).toUpperCase()}`}function Ct(o){return o?{sales:"مبيعات",salesInvoice:"فاتورة بيع",salesCOGS:"تكلفة مباعة",salesReturn:"مردود بيع",salesInvoice_cogs:"تكلفة فاتورة بيع",salesReturnCOGS:"تكلفة مردود بيع",purchase:"مشتريات",purchaseInvoice:"فاتورة شراء",purchaseReturn:"مردود شراء",receipt:"تحصيل",payment:"سداد",cashIn:"إيداع نقدي",cashOut:"صرف نقدي",bankDeposit:"إيداع بنكي",bankWithdraw:"سحب بنكي",stockTransfer:"تحويل مخزني",inventoryAdjust:"جرد/تعديل",expense:"مصروف",payroll:"رواتب",opening:"رصيد افتتاحي",transfer:"تحويل",manual:"يدوي",pos:"نقطة بيع",posCOGS:"تكلفة POS",vatPayment:"سداد ضريبة"}[o]||o:""}function Lt(o,s,d){const t=[],a=[],p=[],v=[];let y=0,C=0,l=0,P=0,$=0,S=0;const m=h=>["liability","equity","revenue"].includes(h.type),u=window.trialLevel||"all",g=h=>(h.code.match(/-/g)||[]).length+1,c=new Set(q.map(h=>h.parentCode).filter(Boolean)),w=h=>!c.has(h.code);{const h={};for(const D of Q){const _=D.date||"";for(const L of D.lines||[]){const E=L.accountCode;E&&(h[E]||(h[E]={open:0,tD:0,tC:0}),_<s?h[E].open+=(L.debit||0)-(L.credit||0):_>=s&&_<=d&&(h[E].tD+=L.debit||0,h[E].tC+=L.credit||0))}}for(const D in h){const{open:_,tD:L,tC:E}=h[D],M=_+(L-E);_>0?y+=_:_<0&&(C+=-_),M>0?$+=M:M<0&&(S+=-M),l+=L,P+=E}}const r=(h,D)=>{const _=g(h);return _>D?!1:_===D?!0:!q.some(E=>E.code!==h.code&&E.code.startsWith(h.code+"-")&&g(E)<=D)};for(const h of q){const D=g(h),_=Math.max(0,D-1)*14,L=!w(h),E={asset:"أصول",liability:"خصوم",equity:"حقوق",revenue:"إيراد",expense:"مصروف"},j={1:"المستوى 1 (رئيسي)",2:"المستوى 2 (مساعد)",3:"المستوى 3 (فرعي)",4:"المستوى 4 (تحليلي)",5:"المستوى 5 (تحليلي تفصيلي)"}[D]||`مستوى ${D}`;let A=0,H=0,O=0;for(const tt of Q){const kt=tt.date||"";for(const at of tt.lines||[])!at.accountCode||!(at.accountCode===h.code||at.accountCode.startsWith(h.code+"-"))||(kt<s?A+=(at.debit||0)-(at.credit||0):kt>=s&&kt<=d&&(H+=at.debit||0,O+=at.credit||0))}const K=A+(H-O);if(Math.abs(A)<.01&&H===0&&O===0)continue;const X=A>0?A:0,R=A<0?-A:0,V=K>0?K:0,U=K<0?-K:0,nt={code:String(h.code),name:h.name,excelName:"    ".repeat(Math.max(0,D-1))+(L?"📁 ":"• ")+h.name,level:D,levelText:j,isHeader:L,typeText:E[h.type]||h.type,openDr:X,openCr:R,transDr:H,transCr:O,closeDr:V,closeCr:U};if(p.push(nt),u!=="all"&&!r(h,parseInt(u)))continue;a.push(nt);const J=!(h.code&&(h.code.startsWith("1-1-2")||h.code.startsWith("2-1-1")))&&(m(h)&&V>.01||!m(h)&&U>.01),et=J?'<span style="font-size:10px; background:#7f1d1d; color:#fca5a5; padding:1px 5px; border-radius:4px; margin-right:4px;">⚠️ رصيد شاذ</span>':"";J&&v.push({id:h.id,code:h.code,name:h.name,type:h.type,parentCode:h.parentCode,sourceEntityId:h.sourceEntityId||null,closeDr:V,closeCr:U}),t.push(`
      <tr ${J?'style="background:rgba(127,29,29,0.08);"':L?'style="background:var(--bg-2);"':""}>
        <td class="mono dim" style="font-size:11px;">${h.code}</td>
        <td style="padding-right:${_+8}px; ${L?"font-weight:700;":""}">${et}${L?"📁 ":""}${h.name}</td>
        <td><span style="font-size:10px; padding:1px 5px; border-radius:4px; background:var(--bg-3);">${E[h.type]||h.type}</span></td>
        <td class="mono">${X?i(X):"—"}</td>
        <td class="mono">${R?i(R):"—"}</td>
        <td class="mono text-indigo">${H?i(H):"—"}</td>
        <td class="mono text-lime">${O?i(O):"—"}</td>
        <td class="mono font-bold">${V?i(V):"—"}</td>
        <td class="mono font-bold">${U?i(U):"—"}</td>
      </tr>
    `)}let k=0,e=0;const n=[];for(const h of Q){const D=h.date||"";for(const _ of h.lines||[])if(!zt(_)){const E=_.debit||0,M=_.credit||0;if(E===0&&M===0)continue;k+=E,e+=M,n.push({entryId:h.id,entryNum:ut(h.entryNumber,h.id),date:D,desc:h.description||"—",accCode:_.accountCode||"—",accName:_.accountName||"—",accId:_.accountId||"—",dr:E,cr:M})}}const b=Math.abs($-S),T=Math.abs(l-P),x=n.length>0,f=b<.05&&!x,z=x?`
    <div class="card mb-16" style="border:2px solid #b45309; padding:20px;">
      <h4 style="color:#f59e0b; margin-bottom:12px;">⚠️ أسطر قيود يتيمة — الحسابات غير موجودة في شجرة الحسابات</h4>
      <p class="dim" style="font-size:12px; margin-bottom:12px;">
        هذه الأسطر تشير إلى حسابات محذوفة أو غير مُدرجة في الشجرة الحالية، مما يُسبب عدم التوازن.
        يجب مراجعة القيود وإعادة ربطها بحسابات صحيحة.
      </p>
      <p class="dim" style="font-size:12px; margin-bottom:12px;">
        إجمالي المدين اليتيم: <strong>${i(k)}</strong> |
        إجمالي الدائن اليتيم: <strong>${i(e)}</strong> |
        فرق الميزان بسببها: <strong>${i(Math.abs(k-e))}</strong>
      </p>
      <div class="table-container" style="max-height:250px; overflow-y:auto;">
        <table class="data-dense" style="width:100%; font-size:12px;">
          <thead><tr>
            <th>رقم القيد</th><th>التاريخ</th><th>البيان</th>
            <th>كود الحساب</th><th>اسم الحساب</th>
            <th class="text-indigo">مدين</th><th class="text-lime">دائن</th>
          </tr></thead>
          <tbody>
            ${n.slice(0,50).map(h=>`
              <tr>
                <td class="mono dim">${h.entryNum}</td>
                <td>${h.date}</td>
                <td>${h.desc}</td>
                <td class="mono text-bad">${h.accCode}</td>
                <td class="dim">${h.accName}</td>
                <td class="mono text-indigo">${h.dr?i(h.dr):"—"}</td>
                <td class="mono text-lime">${h.cr?i(h.cr):"—"}</td>
              </tr>
            `).join("")}
            ${n.length>50?`<tr><td colspan="7" style="text-align:center; color:var(--text-2);">... و ${n.length-50} سطراً آخر</td></tr>`:""}
          </tbody>
        </table>
      </div>
    </div>
  `:"",I=Math.round(b*100)/100;window._trialData={rows:t,structuredRows:a,allHierarchyRows:p,from:s,to:d,totalOpenDr:y,totalOpenCr:C,totalTransDr:l,totalTransCr:P,totalCloseDr:$,totalCloseCr:S,balanced:f},o.innerHTML=`
    ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("ميزان المراجعة بالأرصدة والمجاميع",`الفترة من ${s} إلى ${d}`):""}
    <div class="no-print" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
      <div style="text-align:center; flex:1;">
        <h3 style="margin:0 0 4px;">⚖️ ميزان المراجعة بالأرصدة والمجاميع</h3>
        <p class="dim" style="margin:0;">من <strong>${s}</strong> إلى <strong>${d}</strong></p>
      </div>
      <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
        <button class="btn btn-secondary" onclick="exportTrialExcel(false)" style="white-space:nowrap; display:inline-flex; align-items:center; gap:6px;">
          <span>📊</span> تصدير Excel (المعروض)
        </button>
        <button class="btn btn-primary" onclick="exportTrialExcel(true)" style="white-space:nowrap; background:#4338ca; color:#fff; display:inline-flex; align-items:center; gap:6px;" title="تصدير شجرة الحسابات التحليلية كاملة بجميع مستوياتها (آباء، أبناء، أحفاد)">
          <span>📑</span> تصدير تحليلي شامل (آباء وأبناء وأحفاد)
        </button>
      </div>
    </div>

    ${f?`
    <div class="alert good mb-16" style="display:flex; align-items:center; gap:12px;">
      <span style="font-size:22px;">✅</span>
      <div><strong>الميزان متوازن تماماً</strong> — مجموع القيود: ${i($)}</div>
    </div>`:`
    <div class="alert bad mb-16" style="display:flex; align-items:center; gap:12px;">
      <span style="font-size:22px;">⚠️</span>
      <div>
        <strong>تحذير: الميزان غير متوازن</strong><br>
        <span class="dim">
          فرق الأرصدة الختامية: ${i(I)}
          ${x?` | أسطر يتيمة: ${n.length} سطر (مدين: ${i(k)} / دائن: ${i(e)})`:""}
          ${T>.05?` | فرق حركات الفترة: ${i(Math.round(T*100)/100)}`:""}
        </span>
      </div>
    </div>`}

    ${z}

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
            <td class="mono">${i(y)}</td>
            <td class="mono">${i(C)}</td>
            <td class="mono text-indigo">${i(l)}</td>
            <td class="mono text-lime">${i(P)}</td>
            <td class="mono ${f?"text-good":"text-bad"}">${i($)}</td>
            <td class="mono ${f?"text-good":"text-bad"}">${i(S)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,window.exportTrialExcel=async(h=!1)=>{const D=window._trialData;if(!D)return;const _=(h?D.allHierarchyRows:D.structuredRows)||[];if(!_.length){typeof showToast=="function"&&showToast("لا توجد بيانات متاحة للتصدير","warning");return}const L=["كود الحساب","اسم الحساب","المستوى المحاسبي","النوع","رصيد أول مدين","رصيد أول دائن","حركة مدين","حركة دائن","رصيد ختامي مدين","رصيد ختامي دائن"],E=_.map(A=>[String(A.code),A.excelName,A.levelText,A.typeText,A.openDr||0,A.openCr||0,A.transDr||0,A.transCr||0,A.closeDr||0,A.closeCr||0]);E.push(["الإجمالي","إجمالي ميزان المراجعة","—","—",D.totalOpenDr,D.totalOpenCr,D.totalTransDr,D.totalTransCr,D.totalCloseDr,D.totalCloseCr]);const M=h?`ميزان_مراجعة_تحليلي_شامل_${D.from}_${D.to}`:`ميزان_المراجعة_${D.from}_${D.to}`,j=[16,42,18,12,16,16,16,16,16,16];try{await xt({title:M,headers:L,rows:E,colWidths:j,user:window._currentUser?.name||"المحاسب المالي",hasTotalRow:!0}),typeof showToast=="function"&&showToast("تم تصدير ميزان المراجعة بنجاح بصيغة Excel المتطورة","success")}catch(A){console.error("[exportTrialExcel] Error:",A),typeof showToast=="function"&&showToast("حدث خطأ أثناء تصدير Excel: "+A.message,"error")}};const F=v.filter(h=>h.type==="liability"&&h.closeDr>.01||h.type==="asset"&&h.closeCr>.01),B=F.length?`
    <div class="card mt-20" style="border:2px solid #b45309; padding:20px;">
      <h4 style="color:#f59e0b; margin-bottom:8px;">🔧 حسابات تحتاج إجراء (${F.length} حساب)</h4>
      <p class="dim" style="font-size:12px; margin-bottom:12px;">الحسابات التالية لديها رصيد بالاتجاه الخاطئ لنوعها — اضغط زر الإجراء لكل منها</p>
      <div class="table-container">
        <table class="data-dense" style="width:100%;">
          <thead><tr>
            <th>الكود</th><th>الاسم</th><th>النوع</th>
            <th>الرصيد الختامي</th><th>تشخيص المشكلة</th><th>الإجراء</th>
          </tr></thead>
          <tbody>
            ${F.map(h=>{const D=h.closeDr>.01?h.closeDr:h.closeCr,_=h.closeDr>.01;let L="",E="";return h.type==="liability"&&_?h.code?.startsWith("2-1-5")||h.code?.startsWith("2-1-4")?(L="سلفة موظف/مندوب مُصنَّفة تحت الخصوم — يجب إعادة تصنيفها كأصل",E=`<button class="btn btn-sm" style="background:#b45309;color:#fff;" onclick="fixReclassifyAccount('${h.id}','${h.code}','asset','1-1-5-4')">🔄 نقل إلى سلف مناديب</button>`):h.code?.startsWith("2-1-1-1-1-")||h.parentCode&&h.parentCode.startsWith("2-1-1-1")?(L="حساب فرعي مورد: المشتريات قُيّدت بالأب بينما الدفعات قُيّدت بالفرعي",E=`<button class="btn btn-sm" style="background:#b45309;color:#fff;" onclick="fixSupplierSubAccountJE('${h.id}','${h.code}','${h.name.replace(/'/g,"\\'")}',${D.toFixed(2)})">⚖️ إنشاء قيد تسوية</button>`):(L="التزام برصيد مدين — راجع القيود يدوياً",E='<span class="dim" style="font-size:12px;">مراجعة يدوية</span>'):h.type==="asset"&&!_&&(L="أصل برصيد دائن — قد يكون دفعة مستلمة زائدة",E='<span class="dim" style="font-size:12px;">مراجعة يدوية</span>'),`
                <tr>
                  <td class="mono dim">${h.code}</td>
                  <td><strong>${h.name}</strong></td>
                  <td><span style="font-size:11px; padding:2px 6px; border-radius:4px; background:rgba(239,68,68,0.15); color:#ef4444;">${h.type==="liability"?"خصوم":"أصول"}</span></td>
                  <td class="mono ${_?"text-indigo":"text-lime"}">${i(D)} ${_?"م":"د"}</td>
                  <td style="font-size:12px; color:var(--text-2);">${L}</td>
                  <td>${E}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `:"";o.innerHTML+=B}window.fixReclassifyAccount=async(o,s,d,t)=>{if(await window.showConfirm?.(`سيتم نقل الحساب ${s} إلى تصنيف "${d==="asset"?"أصول — سلف مناديب":"خصوم"}".

هذا يُزيل علامة "رصيد شاذ" لأن رصيد السلفة المدين يُصبح طبيعياً للأصول.`,"تغيير تصنيف الحساب"))try{const{update:p}=await dt(async()=>{const{update:m}=await import("./index-CF9GFeRJ.js").then(u=>u.T);return{update:m}},__vite__mapDeps([0,1])),{getDoc:v,doc:y}=await dt(async()=>{const{getDoc:m,doc:u}=await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");return{getDoc:m,doc:u}},[]),{db:C}=await dt(async()=>{const{db:m}=await import("./index-CF9GFeRJ.js").then(u=>u.T);return{db:m}},__vite__mapDeps([0,1])),l=["asset","expense"].includes(d)?"debit":"credit",P=await v(y(C,`companies/${St}/chartOfAccounts`,o));let $=0;if(P.exists()){const m=P.data(),u=parseFloat(m.totalDebit||0),g=parseFloat(m.totalCredit||0),c=u-g;$=Math.round((l==="credit"?-c:c)*100)/100}await p("chartOfAccounts",o,{type:d,parentCode:t,normalBalance:l,balance:$});const{recalculateCoaRollup:S}=await dt(async()=>{const{recalculateCoaRollup:m}=await import("./sync-engine-B3XmYvGy.js");return{recalculateCoaRollup:m}},__vite__mapDeps([2,0,1]));await S(),window.showToast?.("✅ تم تغيير تصنيف الحساب وتحديث الأرصدة بنجاح","success"),await window.loadDataAndRender?.()}catch(p){window.showToast?.(p.message,"error")}};window.fixSupplierSubAccountJE=async(o,s,d,t)=>{const a=q.find(y=>y.code==="2-1-1-1-1"),p=q.find(y=>y.id===o);if(!a||!p){window.showToast?.("لم يُعثر على حسابات المورد في شجرة الحسابات","error");return}if(await window.showConfirm?.(`سيتم إنشاء قيد تسوية:
  مدين: ${a.code} — ${a.name}   بمبلغ ${t.toFixed(2)} ر.س
  دائن: ${s} — ${d}   بمبلغ ${t.toFixed(2)} ر.س

هذا ينقل رصيد المشتريات من الحساب الأب إلى الحساب الفرعي للمورد.
الرصيد الإجمالي لذمم الموردين لن يتغير.`,"إنشاء قيد تسوية"))try{const{createJournalEntry:y}=await dt(async()=>{const{createJournalEntry:l}=await import("./index-CF9GFeRJ.js").then(P=>P.T);return{createJournalEntry:l}},__vite__mapDeps([0,1])),C=new Date().toISOString().split("T")[0];await y({date:C,description:`تسوية — نقل رصيد ${d} من الحساب الأب إلى الفرعي`,entryType:"correction",lines:[{accountId:a.id,accountCode:a.code,accountName:a.name,debit:t,credit:0,description:`نقل رصيد مشتريات ${d} للحساب الفرعي`},{accountId:p.id,accountCode:p.code,accountName:p.name,debit:0,credit:t,description:`تسوية رصيد مشتريات ${d}`}]}),window.showToast?.("✅ تم إنشاء قيد التسوية بنجاح","success"),await window.loadDataAndRender?.()}catch(y){window.showToast?.(y.message,"error")}};function ot(o,s){let d=0,t=0,a=0;const p=[],v=[],y=[];for(const l of q){let P=0;for(const $ of Q){const S=$.date||"";if(!o||!s||S>=o&&S<=s)for(const m of $.lines||[]){const u=zt(m);u&&(u.id===l.id||u.code===l.code)&&(P+=(m.credit||0)-(m.debit||0))}}if(!(Math.abs(P)<.01)){if(l.type==="revenue"){const $=P;Math.abs($)>.01&&(d+=$,p.push({name:l.name,code:l.code,balance:$}))}else if(l.type==="expense"){if(l.name?.includes("مشتريات البضاعة"))continue;const $=-P;if(Math.abs($)<.01)continue;Rt(l)?(t+=$,v.push({name:l.name,code:l.code,balance:$})):(a+=$,y.push({name:l.name,code:l.code,balance:$}))}}}return{grossRevenue:p.filter(l=>l.balance>0).reduce((l,P)=>l+P.balance,0)||d,revenueTotal:d,cogsTotal:t,opExpTotal:a,revItems:p,cogsItems:v,expItems:y,grossProfit:d-t,netProfit:d-t-a}}function Ot(o,s){const d=new Date(o+"T00:00:00"),t=new Date(s+"T00:00:00"),a=Math.round((t-d)/864e5)+1,p=new Date(d);p.setDate(p.getDate()-1);const v=new Date(p);v.setDate(v.getDate()-a+1);const y=C=>C.toISOString().slice(0,10);return{prevFrom:y(v),prevTo:y(p)}}window.printActiveReportPDF=()=>{const o=document.getElementById("fin-from")?.value||ft(),s=document.getElementById("fin-to")?.value||pt();rt==="income"?window.printIncomeStatementPDF(o,s):rt==="breakeven"?window.printBreakEvenPDF(o,s):window.print()};window.printIncomeStatementPDF=async(o,s)=>{const d=ot(o,s),{grossRevenue:t,revenueTotal:a,cogsTotal:p,opExpTotal:v,revItems:y,cogsItems:C,expItems:l,grossProfit:P,netProfit:$}=d,S=a>0?($/a*100).toFixed(1):"0.0",m=a>0?(P/a*100).toFixed(1):"0.0";y.sort((r,k)=>(r.code||"").localeCompare(k.code||"")),C.sort((r,k)=>(r.code||"").localeCompare(k.code||"")),l.sort((r,k)=>(r.code||"").localeCompare(k.code||""));let u={name:"شركة نظم الإمداد المتطورة",vatNumber:"314996148100003",crNumber:"7054969006",phone:"0549141648",email:"Nuzmalamdad@gmail.com",address:"مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414",logoUrl:""};try{const r=JSON.parse(localStorage.getItem("idham_company")||"{}");r.name&&Object.assign(u,r),r.cr&&(u.crNumber=r.cr),r.crNumber&&(u.crNumber=r.crNumber),r.logoBase64&&(u.logoUrl=r.logoBase64),r.logoUrl&&(u.logoUrl=r.logoUrl)}catch{}try{const[r,k]=await Promise.all([It(Dt(Tt,`companies/${St}/settings`,"company")),It(Dt(Tt,`companies/${St}/settings`,"logo"))]);if(r.exists()){const e=r.data(),n=e.crNumber||e.cr||e.commercialRegistration||"";e.crNumber=n&&(n.startsWith("70")||n.startsWith("47")||n.length>=7)?n:"7054969006",e.vatNumber=e.vatNumber||"314996148100003",e.name=e.name||"شركة نظم الإمداد المتطورة",Object.assign(u,e)}if(k.exists()){const e=k.data(),n=e.dataUrl||e.logoBase64||e.url||e.logoUrl||"";if(n){u.logoUrl=n;try{const b=JSON.parse(localStorage.getItem("idham_company")||"{}");localStorage.setItem("idham_company",JSON.stringify({...b,logoBase64:n,logoUrl:n}))}catch{}}}}catch(r){console.warn("Could not load fresh logo from Firestore:",r)}const g=u.logoUrl?`<div class="logo-circle"><img src="${u.logoUrl}" alt="Logo" /></div>`:'<div class="logo-circle"><span class="default-logo">🏢</span></div>',c=$<0,w=window.open("","_blank");w.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>قائمة الدخل والأرباح والخسائر — ${o} إلى ${s}</title>
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
        <div>الفترة المالية: <strong>من ${o} إلى ${s}</strong></div>
        <div>تاريخ الإصدار: <strong>${new Date().toLocaleDateString("ar-SA")}</strong></div>
        <div>العملة: <strong>ريال سعودي (SAR)</strong></div>
      </div>
      ${g}
      <div class="banner-right">
        <h2>${u.name}</h2>
        ${u.vatNumber?`<div>الرقم الضريبي: <strong>${u.vatNumber}</strong></div>`:""}
        ${u.crNumber?`<div>السجل التجاري: <strong>${u.crNumber}</strong></div>`:""}
        ${u.phone?`<div>الهاتف: <strong>${u.phone}</strong></div>`:""}
      </div>
    </div>

    <!-- Info Strip -->
    <div class="info-strip">
      <span><strong>بيانات المنشأة:</strong> ${u.name}</span>
      <span><strong>الرقم الضريبي:</strong> ${u.vatNumber||"—"}</span>
      <span><strong>السجل التجاري:</strong> ${u.crNumber||"—"}</span>
      <span><strong>العنوان:</strong> ${u.address||"المملكة العربية السعودية"}</span>
    </div>

    <!-- KPI Summary Strip -->
    <div class="kpi-strip">
      <div class="kpi-box blue">
        <div class="lbl">صافي الإيرادات والمبيعات</div>
        <div class="val" dir="ltr">${i(a)}</div>
      </div>
      <div class="kpi-box indigo">
        <div class="lbl">مجمل الربح (هامش ${m}%)</div>
        <div class="val" dir="ltr">${i(P)}</div>
      </div>
      <div class="kpi-box ${c?"loss":"profit"}">
        <div class="lbl">${c?"صافي الخسارة":"صافي الربح"} (هامش ${S}%)</div>
        <div class="val" dir="ltr">${i($)}</div>
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
        ${y.length?y.map(r=>`
          <tr>
            <td style="font-family:'IBM Plex Mono',monospace; font-weight:700;">${r.code}</td>
            <td style="font-weight:700;">${r.name}</td>
            <td class="mono" dir="ltr">${i(r.balance)}</td>
            <td style="text-align:center; font-size:10.5px;">${t>0?(r.balance/t*100).toFixed(1):0}%</td>
          </tr>
        `).join(""):'<tr><td colspan="4" style="text-align:center; padding:10px;">لا توجد إيرادات مسجلة</td></tr>'}
      </tbody>
    </table>
    <div class="subtotal-row">
      <span style="color:#1d4ed8;">صافي الإيرادات التشغيلية:</span>
      <span class="mono" style="color:#1d4ed8;" dir="ltr">${i(a)} (${t>0?(a/t*100).toFixed(1):100}%)</span>
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
        ${C.length?C.map(r=>`
          <tr>
            <td style="font-family:'IBM Plex Mono',monospace; font-weight:700;">${r.code}</td>
            <td style="font-weight:700;">${r.name}</td>
            <td class="mono" style="color:#b45309;" dir="ltr">(${i(r.balance)})</td>
            <td style="text-align:center; font-size:10.5px;">${a>0?(r.balance/a*100).toFixed(1):0}%</td>
          </tr>
        `).join(""):'<tr><td colspan="4" style="text-align:center; padding:10px;">لا توجد تكلفة مباشرة مسجلة</td></tr>'}
      </tbody>
    </table>
    <div class="subtotal-row">
      <span style="color:#b45309;">يخصم: إجمالي تكلفة البضاعة المباعة:</span>
      <span class="mono" style="color:#b45309;" dir="ltr">(${i(p)})</span>
    </div>

    <div class="gross-profit-box">
      <div>🏷️ مجمل الربح التشغيلي (Gross Profit) — هامش: ${m}%</div>
      <div class="val" dir="ltr">${i(P)}</div>
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
        ${l.length?l.map(r=>`
          <tr>
            <td style="font-family:'IBM Plex Mono',monospace; font-weight:700;">${r.code}</td>
            <td style="font-weight:700;">${r.name}</td>
            <td class="mono" style="color:#dc2626;" dir="ltr">(${i(r.balance)})</td>
            <td style="text-align:center; font-size:10.5px;">${v>0?(r.balance/v*100).toFixed(1):0}%</td>
          </tr>
        `).join(""):'<tr><td colspan="4" style="text-align:center; padding:10px;">لا توجد مصروفات تشغيلية مسجلة</td></tr>'}
      </tbody>
    </table>
    <div class="subtotal-row">
      <span style="color:#dc2626;">إجمالي المصروفات التشغيلية والإدارية:</span>
      <span class="mono" style="color:#dc2626;" dir="ltr">(${i(v)})</span>
    </div>

    <!-- Grand Summary Banner -->
    <div class="grand-summary ${c?"loss":"profit"}">
      <div>
        <h3>${c?"⚠️ صافي الخسارة للفترة (Net Loss)":"🎉 صافي الربح للفترة (Net Profit)"}</h3>
        <p>نسبة صافي ${c?"الخسارة":"الربح"} من الإيراد: ${S}% | تم احتساب كافة الإيرادات والتكاليف والمصروفات</p>
      </div>
      <div class="val" dir="ltr">${i($)}</div>
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
</html>`),w.document.close()};window.exportIncomeStatementExcel=(o,s)=>{const d=ot(o,s),t=[];t.push(["قائمة الدخل والأرباح والخسائر — شركة نظم الإمداد المتطورة"]),t.push([`للفترة من: ${o} إلى: ${s}`]),t.push([]),t.push(["القسم","كود الحساب","اسم الحساب","المبلغ (ر.س)"]),(d.revItems||[]).forEach(a=>t.push(["الإيرادات",a.code,a.name,a.balance])),t.push(["الإيرادات","","إجمالي الإيرادات",d.revenueTotal]),t.push([]),(d.cogsItems||[]).forEach(a=>t.push(["تكلفة المبيعات",a.code,a.name,-a.balance])),t.push(["تكلفة المبيعات","","إجمالي تكلفة المبيعات",-d.cogsTotal]),t.push(["مجمل الربح","","مجمل الربح (Gross Profit)",d.grossProfit]),t.push([]),(d.expItems||[]).forEach(a=>t.push(["المصروفات التشغيلية",a.code,a.name,-a.balance])),t.push(["المصروفات التشغيلية","","إجمالي المصروفات التشغيلية",-d.opExpTotal]),t.push([]),t.push(["النتيجة النهائية","","صافي الربح / (الخسارة)",d.netProfit]),xt(t)};function Nt(o,s,d){const t=ot(s,d),{grossRevenue:a,revenueTotal:p,cogsTotal:v,opExpTotal:y,revItems:C,cogsItems:l,expItems:P,grossProfit:$,netProfit:S}=t,m=p>0?(S/p*100).toFixed(1):"0.0",u=p>0?($/p*100).toFixed(1):"0.0";C.sort((e,n)=>(e.code||"").localeCompare(n.code||"")),l.sort((e,n)=>(e.code||"").localeCompare(n.code||"")),P.sort((e,n)=>(e.code||"").localeCompare(n.code||""));const{prevFrom:g,prevTo:c}=Ot(s,d),w=ot(g,c),r=(e,n)=>{if(!n||Math.abs(n)<.01)return"";const b=((e-n)/Math.abs(n)*100).toFixed(1),T=parseFloat(b)>=0;return`<span style="font-size:11px; font-weight:700; color:${T?"#16a34a":"#dc2626"}; margin-right:4px;">${T?"▲":"▼"} ${Math.abs(b)}%</span>`},k=S<0;o.innerHTML=`
    <!-- Top Print Header (Visible in Print) -->
    <div class="report-print-header" style="border-bottom:2px solid #3b82f6; padding-bottom:12px; margin-bottom:18px;">
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("قائمة الدخل والأرباح والخسائر (Income Statement)",`للفترة المالية من: ${s} إلى: ${d}`):""}
    </div>

    <!-- On-screen Action Toolbar -->
    <div class="no-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; background:var(--bg-1); padding:12px 18px; border-radius:12px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm);">
      <div style="font-size:13px; font-weight:700; color:var(--text-2);">
        📊 <strong style="color:var(--text-1);">قائمة الأرباح والخسائر الشاملة</strong> | مقارنة بالفترة السابقة (${g} → ${c})
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-secondary btn-sm" onclick="exportIncomeStatementExcel('${s}', '${d}')" style="font-weight:700;">📊 تصدير Excel</button>
        <button class="btn btn-primary btn-sm" onclick="printIncomeStatementPDF('${s}', '${d}')" style="font-weight:700; background:linear-gradient(135deg, #5b3ec2, #4338ca); border:none; box-shadow:0 2px 6px rgba(91,62,194,0.3);">📑 تصدير PDF المطور (الهيدر الملون الرسمي)</button>
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
            ${i(p)} ${r(p,w.revenueTotal)}
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">إجمالي المبيعات قبل المردود: <strong class="mono">${i(a)}</strong></div>
        </div>

        <!-- Gross Profit -->
        <div class="kpi-card" style="background:linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02)); border:1.5px solid rgba(99,102,241,0.3); border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:#4338ca;">🏷️ مجمل الربح (Gross Profit)</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:rgba(99,102,241,0.15); color:#4338ca;">هامش ${u}%</span>
          </div>
          <div style="font-size:20px; font-weight:900; color:#4338ca; font-family:'IBM Plex Mono', monospace;">
            ${i($)} ${r($,w.grossProfit)}
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">السابق: <strong class="mono">${i(w.grossProfit)}</strong></div>
        </div>

        <!-- Net Profit / Loss -->
        <div class="kpi-card" style="background:${k?"linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.02))":"linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02))"}; border:1.5px solid ${k?"rgba(239,68,68,0.4)":"rgba(16,185,129,0.4)"}; border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:${k?"#b91c1c":"#047857"};">${k?"⚠️ صافي الخسارة":"🏆 صافي الربح"}</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:${k?"rgba(239,68,68,0.15)":"rgba(16,185,129,0.15)"}; color:${k?"#b91c1c":"#047857"};">${m}%</span>
          </div>
          <div style="font-size:20px; font-weight:900; color:${k?"#b91c1c":"#047857"}; font-family:'IBM Plex Mono', monospace;">
            ${i(S)} ${r(S,w.netProfit)}
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">السابق: <strong class="mono">${i(w.netProfit)}</strong></div>
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
              ${C.length?C.map((e,n)=>{const b=a>0?(e.balance/a*100).toFixed(1):"0.0";return`
                <tr style="border-bottom:1px solid var(--border-soft); background:${n%2===1?"rgba(0,0,0,0.015)":"transparent"};">
                  <td style="padding:8px 10px; font-family:'IBM Plex Mono',monospace; font-weight:700; color:var(--text-3);">${e.code}</td>
                  <td style="padding:8px 10px; font-weight:700; color:var(--text-1);">${e.name}</td>
                  <td style="padding:8px 10px; text-align:left; font-family:'IBM Plex Mono',monospace; font-weight:700; color:${e.balance>=0?"#1e293b":"#dc2626"};" dir="ltr">${i(e.balance)}</td>
                  <td style="padding:8px 10px; text-align:center; font-size:11px; color:var(--text-3); font-weight:600;">${b}%</td>
                </tr>`}).join(""):'<tr><td colspan="4" style="text-align:center; padding:12px; color:var(--text-3);">لا توجد إيرادات مسجلة في هذه الفترة</td></tr>'}
            </tbody>
          </table>
          <div style="display:flex; justify-content:space-between; align-items:center; background:linear-gradient(90deg, rgba(37,99,235,0.12), rgba(37,99,235,0.04)); padding:10px 14px; border-radius:8px; border:1px solid rgba(37,99,235,0.25); font-weight:800;">
            <span style="color:#1d4ed8; font-size:14px;">صافي الإيرادات التشغيلية (بعد خصم المردودات)</span>
            <span style="font-family:'IBM Plex Mono',monospace; font-size:16px; color:#1d4ed8;" dir="ltr">${i(p)}</span>
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
              ${l.length?l.map((e,n)=>{const b=p>0?(e.balance/p*100).toFixed(1):"0.0";return`
                <tr style="border-bottom:1px solid var(--border-soft); background:${n%2===1?"rgba(0,0,0,0.015)":"transparent"};">
                  <td style="padding:8px 10px; font-family:'IBM Plex Mono',monospace; font-weight:700; color:var(--text-3);">${e.code}</td>
                  <td style="padding:8px 10px; font-weight:700; color:var(--text-1);">${e.name}</td>
                  <td style="padding:8px 10px; text-align:left; font-family:'IBM Plex Mono',monospace; font-weight:700; color:#b45309;" dir="ltr">(${i(e.balance)})</td>
                  <td style="padding:8px 10px; text-align:center; font-size:11px; color:var(--text-3);">${b}%</td>
                </tr>`}).join(""):'<tr><td colspan="4" style="text-align:center; padding:12px; color:var(--text-3);">لا توجد تكلفة مباعة مسجلة</td></tr>'}
            </tbody>
          </table>
          <div style="display:flex; justify-content:space-between; align-items:center; background:linear-gradient(90deg, rgba(217,119,6,0.12), rgba(217,119,6,0.04)); padding:10px 14px; border-radius:8px; border:1px solid rgba(217,119,6,0.25); font-weight:800; margin-bottom:12px;">
            <span style="color:#b45309; font-size:14px;">يخصم: إجمالي تكلفة البضاعة المباعة</span>
            <span style="font-family:'IBM Plex Mono',monospace; font-size:16px; color:#b45309;" dir="ltr">(${i(v)})</span>
          </div>

          <!-- GROSS PROFIT HIGHLIGHT -->
          <div style="display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.06)); padding:12px 16px; border-radius:10px; border:1.5px solid #6366f1; font-weight:900;">
            <div>
              <span style="font-size:15px; color:#4338ca;">🏷️ مجمل الربح التشغيلي (Gross Profit)</span>
              <span style="font-size:11px; color:#6366f1; margin-right:8px;">[هامش الربح الإجمالي: ${u}%]</span>
            </div>
            <span style="font-family:'IBM Plex Mono',monospace; font-size:18px; color:#4338ca;" dir="ltr">${i($)}</span>
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
              ${P.length?P.map((e,n)=>{const b=y>0?(e.balance/y*100).toFixed(1):"0.0";return`
                <tr style="border-bottom:1px solid var(--border-soft); background:${n%2===1?"rgba(0,0,0,0.015)":"transparent"};">
                  <td style="padding:8px 10px; font-family:'IBM Plex Mono',monospace; font-weight:700; color:var(--text-3);">${e.code}</td>
                  <td style="padding:8px 10px; font-weight:700; color:var(--text-1);">${e.name}</td>
                  <td style="padding:8px 10px; text-align:left; font-family:'IBM Plex Mono',monospace; font-weight:700; color:#dc2626;" dir="ltr">(${i(e.balance)})</td>
                  <td style="padding:8px 10px; text-align:center; font-size:11px; color:var(--text-3);">${b}%</td>
                </tr>`}).join(""):'<tr><td colspan="4" style="text-align:center; padding:12px; color:var(--text-3);">لا توجد مصروفات تشغيلية مسجلة</td></tr>'}
            </tbody>
          </table>
          <div style="display:flex; justify-content:space-between; align-items:center; background:linear-gradient(90deg, rgba(220,38,38,0.12), rgba(220,38,38,0.04)); padding:10px 14px; border-radius:8px; border:1px solid rgba(220,38,38,0.25); font-weight:800;">
            <span style="color:#dc2626; font-size:14px;">إجمالي المصروفات التشغيلية والإدارية</span>
            <span style="font-family:'IBM Plex Mono',monospace; font-size:16px; color:#dc2626;" dir="ltr">(${i(y)})</span>
          </div>
        </div>

        <!-- ═══ GRAND NET PROFIT / LOSS BANNER (ULTRA HIGH CONTRAST) ═══ -->
        <div class="grand-summary-box" style="page-break-inside:avoid; break-inside:avoid; margin-top:20px;">
          ${k?`
          <div style="display:flex; justify-content:space-between; align-items:center; background:#991b1b !important; color:#ffffff !important; padding:18px 24px; border-radius:14px; border:2px solid #ef4444 !important; box-shadow:0 6px 16px rgba(220,38,38,0.3); -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
            <div>
              <div style="font-size:18px; font-weight:900; color:#ffffff !important; display:flex; align-items:center; gap:8px;">
                <span>⚠️</span>
                <span style="color:#ffffff !important;">صافي الخسارة للفترة (Net Loss)</span>
              </div>
              <div style="font-size:12px; color:#fecaca !important; font-weight:700; margin-top:3px;">
                نسبة صافي الخسارة من الإيراد: ${m}% | تم احتساب كافة الإيرادات والتكاليف والمصروفات
              </div>
            </div>
            <div style="font-size:24px; font-weight:900; font-family:'IBM Plex Mono',monospace; color:#ffffff !important; text-shadow:0 1px 3px rgba(0,0,0,0.5);" dir="ltr">
              ${i(S)}
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
                هامش صافي الربح: ${m}% | تم احتساب كافة الإيرادات والتكاليف والمصروفات
              </div>
            </div>
            <div style="font-size:24px; font-weight:900; font-family:'IBM Plex Mono',monospace; color:#ffffff !important; text-shadow:0 1px 3px rgba(0,0,0,0.5);" dir="ltr">
              ${i(S)}
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
  `}function jt(o,s,d){let t=0,a=0,p=0;const v=[],y=[],C=[],l=[],P=[];let $=0,S=0;const m={};for(const x of Q)if(!((x.date||"")>d))for(const z of x.lines||[]){const I=z.accountCode;I&&(m[I]=(m[I]||0)+(z.debit||0)-(z.credit||0))}const u=x=>{let f=0;for(const z in m)(z===x.code||z.startsWith(x.code+"-"))&&(f+=m[z]);if(Math.abs(f)<.001){const z=parseFloat(x.balance||x.openingBalance||0);Math.abs(z)>.001&&(f=["liability","equity","revenue"].includes(x.type)?-z:z)}return f},g=x=>x.code?.split("-").length||1,c=x=>g(x)>4?!1:!q.some(f=>f.type===x.type&&f.code!==x.code&&f.code.startsWith(x.code+"-")&&g(f)<=4);for(const x of q){if(!c(x))continue;const f=u(x);if(x.type==="asset"){if(Math.abs(f)<.01)continue;t+=f,(x.code?.startsWith("1-2")||x.code?.startsWith("1-3")||x.name?.includes("سيارات")||x.name?.includes("أثاث")||x.name?.includes("عقارات")||x.name?.includes("معدات")?y:v).push({name:x.name,code:x.code,balance:f})}else if(x.type==="liability"){const z=-f;if(Math.abs(z)<.01)continue;a+=z,(x.code?.startsWith("2-2")||x.name?.includes("قرض طويل")||x.name?.includes("سند")?l:C).push({name:x.name,code:x.code,balance:z})}else if(x.type==="equity"){const z=-f;if(Math.abs(z)<.01)continue;p+=z,P.push({name:x.name,code:x.code,balance:z})}else x.type==="revenue"?$+=-f:x.type==="expense"&&(S+=f)}const w=$-S,r=t-a-p-w,k=p+r+w,e=a+k,n=Math.abs(t-e)<1,b=(x,f="var(--text-0)")=>`<div class="flex justify-between mb-8" style="font-size:13px;">
       <span>${x.code} — ${x.name}</span>
       <span class="mono" style="color:${f}">${i(x.balance)}</span>
     </div>`,T=(x,f,z="var(--text-0)")=>`<div class="flex justify-between font-bold" style="background:var(--bg-2); padding:8px 12px; border-radius:6px; margin:8px 0 16px;">
       <span>${x}</span>
       <span class="mono" style="color:${z}">${i(f)}</span>
     </div>`;o.innerHTML=`
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("ميزانية العمومية (Balance Sheet)",`كما هي في: ${d}`):""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>قائمة المركز المالي (Balance Sheet)</h2>
      <p class="dim">كما هي في: ${d}</p>
    </div>

    ${n?"":`<div class="alert bad mb-16">⚠️ الميزانية غير متوازنة — فرق: ${i(Math.abs(t-e))}</div>`}

    <div class="grid-2 gap-24" style="max-width:1200px; margin:0 auto;">

      <!-- ASSETS -->
      <div class="card" style="padding:24px;">
        <h3 style="color:var(--brand); border-bottom:2px solid var(--brand); padding-bottom:8px; margin-bottom:20px;">الأصول (Assets)</h3>

        <h4 style="color:var(--indigo); margin:0 0 12px;">الأصول المتداولة</h4>
        ${v.map(x=>b(x,"var(--indigo)")).join("")||"<p class='dim'>—</p>"}
        ${T("إجمالي الأصول المتداولة",v.reduce((x,f)=>x+f.balance,0),"var(--indigo)")}

        <h4 style="color:var(--indigo); margin:16px 0 12px;">الأصول الثابتة (غير المتداولة)</h4>
        ${y.map(x=>b(x)).join("")||"<p class='dim'>—</p>"}
        ${T("إجمالي الأصول الثابتة",y.reduce((x,f)=>x+f.balance,0))}

        <div class="flex justify-between font-bold" style="background:linear-gradient(135deg,var(--bg-2),var(--surface-1)); padding:14px 16px; border-radius:10px; font-size:16px; margin-top:8px; border:2px solid var(--brand);">
          <span>إجمالي الأصول</span>
          <span class="mono text-brand">${i(t)}</span>
        </div>
      </div>

      <!-- LIABILITIES & EQUITY -->
      <div class="card" style="padding:24px;">
        <h3 style="color:var(--brand); border-bottom:2px solid var(--brand); padding-bottom:8px; margin-bottom:20px;">الالتزامات وحقوق الملكية</h3>

        <h4 style="color:var(--text-bad, #ef4444); margin:0 0 12px;">الالتزامات المتداولة</h4>
        ${C.map(x=>b(x,"var(--text-bad, #ef4444)")).join("")||"<p class='dim'>—</p>"}
        ${T("إجمالي الالتزامات المتداولة",C.reduce((x,f)=>x+f.balance,0),"var(--text-bad, #ef4444)")}

        <h4 style="color:var(--text-bad, #ef4444); margin:16px 0 12px;">الالتزامات طويلة الأجل</h4>
        ${l.map(x=>b(x,"var(--warn)")).join("")||"<p class='dim'>—</p>"}
        ${T("إجمالي الالتزامات طويلة الأجل",l.reduce((x,f)=>x+f.balance,0),"var(--warn)")}

        <h4 style="color:var(--brand); margin:16px 0 12px; border-top:1px solid var(--border); padding-top:12px;">حقوق الملكية (Owner's Equity)</h4>
        ${P.map(x=>b(x,"var(--brand)")).join("")||"<p class='dim'>—</p>"}
        ${Math.abs(r)>.01?`
        <div class="flex justify-between mb-8" style="font-size:13px;">
          <span>3-1-3 — أرباح / (خسائر) مرحّلة وتعديلات افتتاحية</span>
          <span class="mono ${r>=0?"text-good":"text-bad"}">${i(r)}</span>
        </div>`:""}
        <div class="flex justify-between mb-8" style="font-size:13px;">
          <span>أرباح / (خسائر) الفترة الحالية</span>
          <span class="mono ${w>=0?"text-good":"text-bad"}">${i(w)}</span>
        </div>
        ${T("إجمالي حقوق الملكية",k,"var(--brand)")}

        <div class="flex justify-between font-bold" style="background:linear-gradient(135deg,var(--bg-2),var(--surface-1)); padding:14px 16px; border-radius:10px; font-size:16px; margin-top:8px; border:2px solid ${n?"var(--good)":"var(--bad)"};">
          <span>إجمالي الالتزامات وحقوق الملكية</span>
          <span class="mono ${n?"text-good":"text-bad"}">${i(e)}</span>
        </div>
      </div>
    </div>
  `}function Ht(o,s,d){const{netProfit:t}=ot(s,d),a=q.filter(x=>x.code?.startsWith("1-1-1-1")||x.code?.startsWith("1-1-1-3")||x.name?.includes("صندوق")||x.name?.includes("بنك")||x.name?.includes("مصرف")),p=new Set(a.map(x=>x.id)),v=new Set(a.map(x=>x.code)),y=x=>p.has(x.accountId)||v.has(x.accountCode);let C=0,l=0;for(const x of Q){const f=x.date||"";for(const z of x.lines||[]){if(!y(z))continue;const I=(z.debit||0)-(z.credit||0);f<s&&(C+=I),f<=d&&(l+=I)}}let P=0,$=0,S=0,m=0,u=0,g=0,c=0,w=0,r=0;for(const x of q){if(p.has(x.id)||x.type==="revenue"||x.type==="expense")continue;let f=0,z=0;for(const B of Q){const h=B.date||"";for(const D of B.lines||[]){if(D.accountId!==x.id&&D.accountCode!==x.code)continue;const _=(D.debit||0)-(D.credit||0);h<s&&(f+=_),h<=d&&(z+=_)}}const I=z-f;if(Math.abs(I)<.01)continue;const F=x.code||"";F.startsWith("1-1-2")?P-=I:F.startsWith("1-1-4")?$-=I:F.startsWith("1-1-5")?m-=I:F.startsWith("1-2")||F.startsWith("1-3")?w-=I:F.startsWith("2-1-1")||F.startsWith("2-1-2")?S+=-I:F.startsWith("2-1-3")?u+=-I:F.startsWith("3")?r+=-I:x.type==="asset"?g-=I:x.type==="liability"&&(c+=-I)}const k=P+$+S+m+u+g+c,e=t+k,n=e+w+r,b=(x,f,z=!0)=>`<div class="flex justify-between mb-8" style="font-size:14px;${z?"padding-right:16px; color:var(--text-1);":""}">
       <span>${x}</span>
       <span class="mono ${f>=0?"":"text-bad"}">${f>=0?"":"("}${i(Math.abs(f))}${f>=0?"":")"}</span>
     </div>`,T=(x,f)=>`<div class="flex justify-between font-bold" style="background:var(--bg-2); padding:10px 14px; border-radius:8px; margin:12px 0 24px;">
       <span>${x}</span>
       <span class="mono ${f>=0?"text-good":"text-bad"}">${f>=0?"":"("}${i(Math.abs(f))}${f>=0?"":")"}</span>
     </div>`;o.innerHTML=`
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("تقرير التدفقات النقدية (الطريقة غير المباشرة)",`الفترة من ${s} إلى ${d}`):""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>تقرير التدفقات النقدية (الطريقة غير المباشرة)</h2>
      <p class="dim">للفترة من ${s} إلى ${d}</p>
    </div>

    <div style="max-width:800px; margin:0 auto;">
      <!-- Cash KPIs -->
      <div class="grid-3 gap-16 mb-24">
        <div class="kpi-card">
          <div class="status-bar good"></div>
          <div class="kpi-content">
            <div class="kpi-label">الرصيد النقدي الافتتاحي</div>
            <div class="kpi-value">${i(C)}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="status-bar ${n>=0?"good":"bad"}"></div>
          <div class="kpi-content">
            <div class="kpi-label">صافي التغير في النقدية</div>
            <div class="kpi-value ${n>=0?"text-good":"text-bad"}">${i(n)}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="status-bar indigo"></div>
          <div class="kpi-content">
            <div class="kpi-label">الرصيد النقدي الختامي</div>
            <div class="kpi-value text-indigo">${i(l)}</div>
          </div>
        </div>
      </div>

      <div class="card" style="padding:28px;">
        <h4 style="color:var(--brand); border-bottom:1.5px solid var(--brand); padding-bottom:8px; margin-bottom:16px;">1. الأنشطة التشغيلية (Operating Activities)</h4>
        ${b("صافي ربح الفترة",t,!1)}
        <div style="padding-right:16px; margin-bottom:8px; color:var(--text-2); font-size:12px; font-weight:600;">تسويات التغير في رأس المال العامل:</div>
        ${b("(زيادة) نقص في الذمم المدينة — العملاء",P)}
        ${b("(زيادة) نقص في المخزون السلعي",$)}
        ${b("(زيادة) نقص في ضريبة القيمة المضافة المدخلات",m)}
        ${b("زيادة (نقص) في الذمم الدائنة — الموردون",S)}
        ${b("زيادة (نقص) في ضريبة القيمة المضافة المخرجات",u)}
        ${Math.abs(g)>.01?b("أصول تشغيلية أخرى",g):""}
        ${Math.abs(c)>.01?b("التزامات تشغيلية أخرى",c):""}
        ${T("صافي النقد من الأنشطة التشغيلية",e)}

        <h4 style="color:var(--brand); border-bottom:1.5px solid var(--brand); padding-bottom:8px; margin-bottom:16px;">2. الأنشطة الاستثمارية (Investing Activities)</h4>
        ${b("شراء / بيع أصول ثابتة وممتلكات",w,!1)}
        ${T("صافي النقد من الأنشطة الاستثمارية",w)}

        <h4 style="color:var(--brand); border-bottom:1.5px solid var(--brand); padding-bottom:8px; margin-bottom:16px;">3. الأنشطة التمويلية (Financing Activities)</h4>
        ${b("زيادة رأس المال / مسحوبات المالك / قروض",r,!1)}
        ${T("صافي النقد من الأنشطة التمويلية",r)}

        <div style="border-top:2px solid var(--border); padding-top:16px; margin-top:8px;">
          <div class="flex justify-between font-bold mb-8" style="font-size:15px;">
            <span>صافي التغير الكلي في النقدية خلال الفترة</span>
            <span class="mono ${n>=0?"text-good":"text-bad"}">${i(n)}</span>
          </div>
          <div class="flex justify-between dim mb-8">
            <span>رصيد النقدية في بداية الفترة</span>
            <span class="mono">${i(C)}</span>
          </div>
          <div class="flex justify-between font-bold" style="font-size:16px; background:linear-gradient(135deg,var(--bg-2),var(--surface-1)); padding:14px 16px; border-radius:10px; border:2px solid var(--brand);">
            <span>رصيد النقدية في نهاية الفترة</span>
            <span class="mono text-brand">${i(l)}</span>
          </div>
        </div>
      </div>
    </div>
  `}function Vt(o,s,d){let t=0,a=0,p=0,v=0,y=0,C=0;for(const u of q){if(u.type!=="equity")continue;let g=0,c=0;for(const w of Q){const r=w.date||"";for(const k of w.lines||[]){if(k.accountId!==u.id&&k.accountCode!==u.code)continue;const e=(k.credit||0)-(k.debit||0);r<s?g+=e:r>=s&&r<=d&&(c+=e)}}u.name?.includes("رأس المال")?(t+=g,a+=c):u.name?.includes("أرباح مبقاة")||u.name?.includes("أرباح محتجزة")||u.name?.includes("احتياطي")?(p+=g,v+=c):u.name?.includes("مسحوبات")||u.name?.includes("جاري المالك")?(y+=g,C+=c):(t+=g,a+=c)}const{netProfit:l}=ot(s,d);v+=l;const P=t+a,$=p+v,S=y+C,m=(u,g,c,w,r=!1,k="")=>`<tr ${r?'style="border-top:2px solid var(--border); background:var(--bg-2); font-weight:bold;"':""}>
      <td>${u}</td>
      <td class="mono ${k}">${i(g)}</td>
      <td class="mono ${k}">${i(c)}</td>
      <td class="mono ${k||(w<0?"text-bad":"")}">${i(w)}</td>
      <td class="mono font-bold ${k}">${i(g+c+w)}</td>
    </tr>`;o.innerHTML=`
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("تقرير الأرباح حسب مراكز التكلفة",`الفترة من ${s} إلى ${d}`):""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>قائمة التغير في حقوق الملكية</h2>
      <p class="dim">للفترة من ${s} إلى ${d}</p>
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
            ${m("رصيد بداية الفترة",t,p,y)}
            ${m("زيادات رأس المال",a,0,0)}
            ${m("صافي ربح الفترة",0,l,0)}
            ${C!==0?m("مسحوبات / توزيعات خلال الفترة",0,0,C):""}
            ${m("رصيد نهاية الفترة",P,$,S,!0,"text-brand")}
          </tbody>
        </table>
      </div>
    </div>
  `}function Wt(o,s,d){let t=0,a=0,p=0,v=0,y=0,C=0,l=0;for(const r of q){let k=0;for(const e of Q)if((e.date||"")<=d)for(const b of e.lines||[])b.accountId!==r.id&&b.accountCode!==r.code||(k+=(b.debit||0)-(b.credit||0));if(r.type==="asset")a+=k,r.code?.startsWith("1-2")||r.code?.startsWith("1-3")||r.name?.includes("سيارات")||r.name?.includes("أثاث")||r.name?.includes("معدات")||(t+=k),r.code?.startsWith("1-1-4")&&(y+=k),(r.code?.startsWith("1-1-1-1")||r.code?.startsWith("1-1-1-3"))&&(C+=k),r.code?.startsWith("1-1-2")&&(l+=k);else if(r.type==="liability"){const e=-k;v+=e,r.code?.startsWith("2-2")||r.name?.includes("طويل")||(p+=e)}}const{revenueTotal:P,cogsTotal:$,opExpTotal:S,grossProfit:m,netProfit:u}=ot(s,d),g=a-v,c=(r,k,e=!1,n=2)=>{if(!k||k===0)return"—";const b=r/k;return e?(b*100).toFixed(1)+"%":b.toFixed(n)},w=[{group:"🏦 نسب السيولة (Liquidity)",items:[{label:"نسبة السيولة الجارية (Current Ratio)",val:c(t,p),note:"الأصول المتداولة ÷ الالتزامات المتداولة — المثالي ≥ 1.5",good:parseFloat(c(t,p))>=1.5},{label:"نسبة السيولة السريعة (Quick Ratio)",val:c(t-y,p),note:"(الأصول المتداولة - المخزون) ÷ الالتزامات المتداولة — المثالي ≥ 1.0",good:parseFloat(c(t-y,p))>=1},{label:"نسبة النقدية (Cash Ratio)",val:c(C,p),note:"النقدية فقط ÷ الالتزامات المتداولة",good:parseFloat(c(C,p))>=.2},{label:"رأس المال العامل (Working Capital)",val:i(t-p),note:"الأصول المتداولة — الالتزامات المتداولة",good:t-p>=0}]},{group:"📊 نسب الربحية (Profitability)",items:[{label:"هامش مجمل الربح (Gross Margin)",val:c(m,P,!0),note:"مجمل الربح ÷ المبيعات",good:parseFloat(c(m,P,!0))>=20},{label:"هامش صافي الربح (Net Margin)",val:c(u,P,!0),note:"صافي الربح ÷ المبيعات",good:parseFloat(c(u,P,!0))>=5},{label:"العائد على الأصول ROA",val:c(u,a,!0),note:"صافي الربح ÷ إجمالي الأصول",good:parseFloat(c(u,a,!0))>=5},{label:"العائد على حقوق الملكية ROE",val:c(u,g,!0),note:"صافي الربح ÷ حقوق الملكية",good:parseFloat(c(u,g,!0))>=10}]},{group:"⚙️ نسب الكفاءة (Efficiency)",items:[{label:"معدل دوران المخزون",val:c($,y,!1,1)+"x",note:"تكلفة المباعة ÷ المخزون — كلما ارتفع كان أفضل",good:parseFloat(c($,y,!1,1))>=4},{label:"معدل دوران الذمم المدينة",val:c(P,l,!1,1)+"x",note:"المبيعات ÷ الذمم المدينة",good:parseFloat(c(P,l,!1,1))>=6},{label:"نسبة التكلفة إلى الإيراد",val:c($,P,!0),note:"COGS ÷ المبيعات — كلما انخفض كان أفضل",good:parseFloat(c($,P,!0))<=70},{label:"نسبة المصروفات إلى الإيراد",val:c(S,P,!0),note:"المصاريف التشغيلية ÷ المبيعات",good:parseFloat(c(S,P,!0))<=15}]},{group:"🏗️ نسب الرفع المالي (Leverage)",items:[{label:"نسبة الديون إلى الأصول",val:c(v,a,!0),note:"الالتزامات ÷ الأصول — المثالي ≤ 50%",good:parseFloat(c(v,a,!0))<=50},{label:"نسبة الديون إلى حقوق الملكية",val:c(v,g,!1,2),note:"الالتزامات ÷ حقوق الملكية — المثالي ≤ 1.0",good:parseFloat(c(v,g))<=1},{label:"إجمالي الأصول",val:i(a),note:"مجموع الأصول المتداولة + الثابتة",good:!0},{label:"إجمالي الالتزامات",val:i(v),note:"مجموع الالتزامات المتداولة وطويلة الأجل",good:!0}]}];o.innerHTML=`
    <div class="report-print-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #5B5CEB; padding-bottom:12px; margin-bottom:20px; direction:rtl; text-align:right;">
      ${window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("نسب التحليل المالي والربحية (Financial Ratios)",`الفترة من ${s} إلى ${d}`):""}
    </div>
    <div class="print-header no-print" style="text-align:center; margin-bottom:24px;">
      <h2>لوحة التحليل المالي والمؤشرات (Financial Ratios)</h2>
      <p class="dim">للفترة من ${s} إلى ${d}</p>
    </div>

    <!-- Summary Banner -->
    <div class="grid-4 gap-16 mb-28" style="max-width:1200px; margin:0 auto 28px;">
      ${[{label:"إجمالي الإيرادات",val:i(P),icon:"💰",color:"#22c55e"},{label:"مجمل الربح",val:i(m),icon:"📈",color:"#6366f1"},{label:"صافي الربح",val:i(u),icon:"🎯",color:u>=0?"#2dd4bf":"#ef4444"},{label:"إجمالي الأصول",val:i(a),icon:"🏛️",color:"#e58a2b"}].map(r=>`
        <div class="kpi-card">
          <div class="kpi-content">
            <div style="font-size:28px; margin-bottom:8px;">${r.icon}</div>
            <div class="kpi-label">${r.label}</div>
            <div class="kpi-value" style="color:${r.color}; font-size:20px;">${r.val}</div>
          </div>
        </div>`).join("")}
    </div>

    <!-- Ratio Groups -->
    <div style="max-width:1200px; margin:0 auto;">
      ${w.map(r=>`
        <div class="card mb-20" style="padding:24px;">
          <h3 style="color:var(--brand); margin-bottom:20px; font-family:var(--font-heading);">${r.group}</h3>
          <div class="grid-2 gap-16">
            ${r.items.map(k=>`
              <div style="background:var(--bg-2); border-radius:10px; padding:16px; border-left:4px solid ${k.good?"var(--good, #22c55e)":"var(--warn, #f59e0b)"};">
                <div style="font-size:12px; color:var(--text-2); margin-bottom:4px;">${k.label}</div>
                <div style="font-size:22px; font-weight:700; font-family:monospace; color:${k.good?"var(--good, #22c55e)":"var(--warn, #f59e0b)"};">${k.val}</div>
                <div style="font-size:11px; color:var(--text-2); margin-top:6px;">${k.note}</div>
              </div>`).join("")}
          </div>
        </div>`).join("")}
    </div>
  `}function Ut(o,s){const d=String(o||"");return d.startsWith("5-2-6")||d.startsWith("5-2-1")||d.startsWith("5-2-2")||d.startsWith("5-2-3")?{type:"fixed_salary",label:"🛡️ ثابتة (أجور ورواتب)",isCoreFixed:!0,isCash:!0,badgeBg:"rgba(59,130,246,0.12)",badgeColor:"#1d4ed8"}:d.startsWith("5-4-1")?{type:"fixed_rent",label:"🛡️ ثابتة (إيجارات)",isCoreFixed:!0,isCash:!0,badgeBg:"rgba(59,130,246,0.12)",badgeColor:"#1d4ed8"}:d.startsWith("5-6")?{type:"depreciation",label:"📉 ثابتة دفترياً (إهلاكات)",isCoreFixed:!0,isCash:!1,badgeBg:"rgba(100,116,139,0.15)",badgeColor:"#475569"}:d.startsWith("5-3-3")?{type:"mixed_fuel",label:"⚡ شبه متغيرة (ديزل ومحروقات)",isCoreFixed:!1,isCash:!0,badgeBg:"rgba(245,158,11,0.12)",badgeColor:"#b45309"}:d.startsWith("5-3-2")?{type:"mixed_maint",label:"⚡ شبه متغيرة (صيانة وإصلاح)",isCoreFixed:!1,isCash:!0,badgeBg:"rgba(245,158,11,0.12)",badgeColor:"#b45309"}:d.startsWith("5-4-7")||d.startsWith("5-4-8")||d.startsWith("5-4-3")?{type:"amortized",label:"📅 دورية سنوية (إقامات ورخص)",isCoreFixed:!1,isCash:!0,badgeBg:"rgba(168,85,247,0.12)",badgeColor:"#7e22ce"}:{type:"operating",label:"🏷️ مصاريف تشغيلية",isCoreFixed:!1,isCash:!0,badgeBg:"rgba(15,23,42,0.08)",badgeColor:"var(--text-2)"}}function ht(o,s,d=null){const t=ot(o,s),{grossRevenue:a,revenueTotal:p,cogsTotal:v,opExpTotal:y,expItems:C,grossProfit:l,netProfit:P}=t,$=new Date(o+"T00:00:00"),S=new Date(s+"T00:00:00"),m=Math.max(1,Math.round((S-$)/864e5)+1),u=l,g=p>0?u/p:0,c=g*100,w=d?new Set(d):null,r=(C||[]).map(B=>{const h=Ut(B.code,B.name),D=w?w.has(B.code):!0;return{...B,...h,isSelected:D}}),k=r.filter(B=>B.isSelected),e=k.reduce((B,h)=>B+(h.balance||0),0),n=y-e,b=g>0?e/g:0,T=m>0?b/m:0,x=m>0?p/m:0,f=p-b,z=p>0?(p-b)/p*100:0,I=x>0?Math.round(b/x):null,F=[...r].sort((B,h)=>h.balance-B.balance).map(B=>{const h=e>0&&B.isSelected?B.balance/e*100:0,D=y>0?B.balance/y*100:0,_=g>0?B.balance/g:0;return{...B,pctOfSelected:h,pctOfTotal:D,salesNeeded:_}});return{from:o,to:s,days:m,grossRevenue:a,revenueTotal:p,cogsTotal:v,opExpTotal:y,grossProfit:l,netProfit:P,contributionMargin:u,cmRatio:g,cmPct:c,fixedCosts:e,unselectedCosts:n,selectedCount:k.length,totalCount:r.length,breakEvenSales:b,dailyBreakEven:T,dailyActual:x,marginOfSafetyVal:f,marginOfSafetyPct:z,breakEvenDay:I,sortedExp:F}}window.exportBreakEvenExcel=(o,s)=>{const d=ht(o,s,window._beSelectedExpenseCodes),t=[];t.push(["تقرير تحليل نقطة التعادل والتحليل الحجمي (CVP) وسيناريوهات الأرباح ونسب الهوامش — شركة نظم الإمداد المتطورة"]),t.push([`الفترة من: ${o} إلى: ${s} (${d.days} يوماً)`]),t.push([]),t.push(["المؤشر المالي","القيمة","الوحدة / النسبة"]),t.push(["صافي الإيرادات والمبيعات الفعلية",d.revenueTotal,"ر.س"]),t.push(["تكلفة البضاعة المباعة (التكلفة المتغيرة)",d.cogsTotal,"ر.س"]),t.push(["هامش المساهمة (مجمل الربح)",d.grossProfit,"ر.س"]),t.push(["نسبة هامش المساهمة الفعلي (Contribution Margin %)",d.cmPct.toFixed(2)+"%","%"]),t.push(["المصروفات المحددة للتعادل",d.fixedCosts,"ر.س"]),t.push(["إجمالي المصروفات الكلية بالدفاتر",d.opExpTotal,"ر.س"]),t.push(["نقطة التعادل بالمبيعات (Break-Even Sales)",d.breakEvenSales,"ر.س"]),t.push(["المعدل اليومي المطلوب للتعادل",d.dailyBreakEven,"ر.س / يوم"]),t.push(["المعدل اليومي الفعلي للمبيعات",d.dailyActual,"ر.س / يوم"]),t.push(["هامش الأمان (Margin of Safety)",d.marginOfSafetyVal,"ر.س"]),t.push(["نسبة هامش الأمان",d.marginOfSafetyPct.toFixed(2)+"%","%"]),t.push(["صافي الربح الفعلي بالفترة",d.netProfit,"ر.س"]),t.push([]);const a=[{label:`الفعلي (${d.cmPct.toFixed(1)}%)`,val:d.cmRatio},{label:"8.0%",val:.08},{label:"10.0%",val:.1},{label:"12.0%",val:.12},{label:"15.0%",val:.15},{label:"18.0%",val:.18},{label:"20.0%",val:.2},{label:"25.0%",val:.25}];t.push(["مصفوفة المبيعات المطلوبة عند مختلف الأرباح ونسب هوامش الربح:"]),t.push(["صافي الربح المستهدف",...a.map(p=>`عند هامش ${p.label}`)]),[0,5e3,1e4,15e3,2e4,25e3,3e4,4e4,5e4,75e3,1e5].forEach(p=>{const v=[p===0?"0 (نقطة التعادل)":p];a.forEach(y=>{const C=y.val>0?(d.fixedCosts+p)/y.val:0;v.push(C)}),t.push(v)}),t.push([]),t.push(["تفكيك المصروفات وحالة التحديد:","كود الحساب","اسم المصروف","التصنيف","المبلغ (ر.س)","حالة التحديد","المبيعات اللازمة لتغطيته"]),d.sortedExp.forEach(p=>{t.push(["مصروف",p.code,p.name,p.label,p.balance,p.isSelected?"محدد ومدرج":"مستبعد",p.salesNeeded])}),xt(t)};window.printBreakEvenPDF=async(o,s)=>{const d=ht(o,s,window._beSelectedExpenseCodes),{revenueTotal:t,cogsTotal:a,fixedCosts:p,opExpTotal:v,grossProfit:y,netProfit:C,cmPct:l,cmRatio:P,breakEvenSales:$,dailyBreakEven:S,dailyActual:m,marginOfSafetyPct:u,marginOfSafetyVal:g,sortedExp:c,days:w,selectedCount:r,totalCount:k}=d;let e={name:"شركة نظم الإمداد المتطورة",vatNumber:"314996148100003",crNumber:"7054969006",phone:"0549141648",email:"Nuzmalamdad@gmail.com",address:"مبنى 7689 — شارع ينبع  الصناعية 2179 — حي غرناطة — ينبع — رمز 46414",logoUrl:""};try{const x=JSON.parse(localStorage.getItem("idham_company")||"{}");x.name&&Object.assign(e,x),x.logoBase64&&(e.logoUrl=x.logoBase64)}catch{}const n=C>=0,b=[{label:`الفعلي (${l.toFixed(1)}%)`,val:P},{label:"10%",val:.1},{label:"15%",val:.15},{label:"20%",val:.2},{label:"25%",val:.25}],T=window.open("","_blank");if(!T){showToast("يرجى السماح بالنوافذ المنبثقة للطباعة","warn");return}T.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تقرير تحليل نقطة التعادل والأرباح المستهدفة CVP — ${o} إلى ${s}</title>
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
        <div>الفترة المالية: <strong>من ${o} إلى ${s} (${w} يوماً)</strong></div>
        <div>تاريخ الإصدار: <strong>${new Date().toLocaleDateString("ar-SA")}</strong></div>
        <div>نقطة التعادل للمصروفات المحددة: <strong>${i($)}</strong></div>
      </div>
      <div class="banner-right">
        <h2>${e.name}</h2>
        <div>الرقم الضريبي: <strong>${e.vatNumber}</strong></div>
        <div>السجل التجاري: <strong>${e.crNumber}</strong></div>
      </div>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-box" style="border-color:#3b82f6; background:#eff6ff;">
        <div class="lbl">مبيعات نقطة التعادل</div>
        <div class="val" style="color:#1d4ed8;" dir="ltr">${i($)}</div>
      </div>
      <div class="kpi-box" style="border-color:#6366f1; background:#eef2ff;">
        <div class="lbl">الهدف اليومي للتعادل</div>
        <div class="val" style="color:#4338ca;" dir="ltr">${i(S)}</div>
      </div>
      <div class="kpi-box" style="border-color:#f59e0b; background:#fefce8;">
        <div class="lbl">نسبة هامش المساهمة</div>
        <div class="val" style="color:#b45309;" dir="ltr">${l.toFixed(1)}%</div>
      </div>
      <div class="kpi-box" style="border-color:${n?"#22c55e":"#ef4444"}; background:${n?"#f0fdf4":"#fef2f2"};">
        <div class="lbl">هامش الأمان فوق التعادل</div>
        <div class="val" style="color:${n?"#15803d":"#b91c1c"};" dir="ltr">${u.toFixed(1)}%</div>
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
          <td style="font-family:'IBM Plex Mono',monospace; font-weight:700; text-align:left;" dir="ltr">${i(t)}</td>
          <td style="text-align:center; font-weight:700;">100.0%</td>
          <td style="font-size:10.5px; color:#475569;">إجمالي الإيرادات بعد خصم المردودات</td>
        </tr>
        <tr>
          <td><strong>يخصم: التكاليف المتغيرة المباشرة (COGS)</strong></td>
          <td style="font-family:'IBM Plex Mono',monospace; font-weight:700; text-align:left; color:#b45309;" dir="ltr">(${i(a)})</td>
          <td style="text-align:center; font-weight:700; color:#b45309;">${t>0?(a/t*100).toFixed(1):0}%</td>
          <td style="font-size:10.5px; color:#475569;">تكلفة شراء البضاعة المباعة فقط</td>
        </tr>
        <tr style="background:#eef2ff; font-weight:800;">
          <td style="color:#4338ca;"><strong>هامش المساهمة (مجمل الربح)</strong></td>
          <td style="font-family:'IBM Plex Mono',monospace; text-align:left; color:#4338ca;" dir="ltr">${i(y)}</td>
          <td style="text-align:center; color:#4338ca;">${l.toFixed(1)}%</td>
          <td style="font-size:10.5px; color:#4338ca;">المبلغ المتاح لتغطية المصروفات الثابتة والأرباح</td>
        </tr>
        <tr>
          <td><strong>يخصم: المصروفات المحددة في الحسبة</strong></td>
          <td style="font-family:'IBM Plex Mono',monospace; font-weight:700; text-align:left; color:#dc2626;" dir="ltr">(${i(p)})</td>
          <td style="text-align:center; font-weight:700; color:#dc2626;">${t>0?(p/t*100).toFixed(1):0}%</td>
          <td style="font-size:10.5px; color:#475569;">المحدد: ${r} من أصل ${k} بند مصروف</td>
        </tr>
        <tr style="background:${n?"#f0fdf4":"#fef2f2"}; font-weight:900;">
          <td style="color:${n?"#15803d":"#b91c1c"};"><strong>النتيجة النهائية للفترة</strong></td>
          <td style="font-family:'IBM Plex Mono',monospace; text-align:left; color:${n?"#15803d":"#b91c1c"};" dir="ltr">${i(C)}</td>
          <td style="text-align:center; color:${n?"#15803d":"#b91c1c"};">${t>0?(C/t*100).toFixed(1):0}%</td>
          <td style="font-size:10.5px; color:${n?"#15803d":"#b91c1c"};">${n?"تحقيق أرباح تفوق نقطة التعادل":"عجز دون نقطة التعادل بالفترة"}</td>
        </tr>
      </tbody>
    </table>

    <!-- 2D Cross Sensitivity Matrix Table -->
    <div class="sec-title">ثانياً: مصفوفة المبيعات المطلوبة عند مختلف الأرباح وهوامش الربح (2D Sensitivity Matrix)</div>
    <table>
      <thead>
        <tr>
          <th>صافي الربح المستهدف</th>
          ${b.map(x=>`<th style="text-align:left;">هامش ${x.label}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${[{label:"0 ر.س (نقطة التعادل)",profit:0},{label:"10,000 ر.س",profit:1e4},{label:"20,000 ر.س",profit:2e4},{label:"30,000 ر.س",profit:3e4},{label:"50,000 ر.س",profit:5e4},{label:"100,000 ر.س",profit:1e5}].map(x=>`
          <tr>
            <td><strong>${x.label}</strong></td>
            ${b.map(f=>{const z=f.val>0?(p+x.profit)/f.val:0;return`<td style="font-family:'IBM Plex Mono',monospace; font-weight:700; text-align:left;" dir="ltr">${i(z)}</td>`}).join("")}
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
        ${c.map(x=>`
          <tr style="${x.isSelected?"":"opacity:0.6; background:#f8fafc;"}">
            <td style="text-align:center; font-weight:bold;">${x.isSelected?"☑️":"◻️"}</td>
            <td style="font-family:'IBM Plex Mono',monospace; font-weight:700; color:#64748b;">${x.code}</td>
            <td style="font-weight:700;">${x.name} ${x.isSelected?"":'<span style="font-size:9.5px; color:#94a3b8;">(مستبعد)</span>'}</td>
            <td style="font-size:10px; color:#475569;">${x.label}</td>
            <td style="font-family:'IBM Plex Mono',monospace; text-align:left; color:#dc2626;" dir="ltr">${i(x.balance)}</td>
            <td style="font-family:'IBM Plex Mono',monospace; text-align:left; font-weight:700; color:#4338ca;" dir="ltr">${i(x.salesNeeded)}</td>
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
</html>`),T.document.close()};function mt(o,s,d){window._beCurrentContainer=o,window._beCurrentFrom=s,window._beCurrentTo=d;const t=ht(s,d,null);(!window._beSelectedExpenseCodes||!(window._beSelectedExpenseCodes instanceof Set))&&(window._beSelectedExpenseCodes=new Set((t.sortedExp||[]).map(f=>f.code)));const a=ht(s,d,window._beSelectedExpenseCodes),{revenueTotal:p,cogsTotal:v,fixedCosts:y,unselectedCosts:C,opExpTotal:l,grossProfit:P,netProfit:$,cmPct:S,cmRatio:m,breakEvenSales:u,dailyBreakEven:g,dailyActual:c,marginOfSafetyPct:w,marginOfSafetyVal:r,sortedExp:k,days:e,selectedCount:n,totalCount:b}=a,T=p>=u;typeof window._beTargetProfitVal>"u"&&(window._beTargetProfitVal=2e4),typeof window._beTargetMarginVal>"u"&&(window._beTargetMarginVal=parseFloat(S.toFixed(1))||15);const x=[{label:`الفعلي (${S.toFixed(1)}%)`,val:m,isActual:!0},{label:"8.0%",val:.08},{label:"10.0%",val:.1},{label:"12.0%",val:.12},{label:"15.0%",val:.15},{label:"18.0%",val:.18},{label:"20.0%",val:.2},{label:"25.0%",val:.25}];o.innerHTML=`
    <!-- Top Action Toolbar -->
    <div class="no-print" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; background:var(--bg-1); padding:12px 18px; border-radius:12px; border:1px solid var(--border-soft); box-shadow:var(--shadow-sm); flex-wrap:wrap; gap:10px;">
      <div style="font-size:13px; font-weight:700; color:var(--text-2);">
        🎯 <strong style="color:var(--text-1);">تحليل نقطة التعادل والتحليل الحجمي للأرباح والتكاليف (CVP)</strong> | الفترة: <strong>${s}</strong> → <strong>${d}</strong> (${e} يوماً)
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="exportBreakEvenExcel('${s}', '${d}')" style="font-weight:700;">📊 تصدير Excel</button>
        <button class="btn btn-primary btn-sm" onclick="printBreakEvenPDF('${s}', '${d}')" style="font-weight:700; background:linear-gradient(135deg, #5b3ec2, #4338ca); border:none; box-shadow:0 2px 6px rgba(91,62,194,0.3);">📑 تصدير PDF التقرير التنفيذي للتعادل</button>
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
            ${i(u)}
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">لتغطية المصروفات المحددة (<strong class="mono">${i(y)}</strong>)</div>
        </div>

        <!-- Daily Target -->
        <div class="kpi-card" style="background:linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02)); border:1.5px solid rgba(99,102,241,0.3); border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:#4338ca;">📅 الهدف اليومي للتعادل</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:rgba(99,102,241,0.15); color:#4338ca;">Daily Target</span>
          </div>
          <div style="font-size:22px; font-weight:900; color:#4338ca; font-family:'IBM Plex Mono', monospace;" dir="ltr">
            ${i(g)}
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">الفعلي اليومي: <strong class="mono" dir="ltr">${i(c)}</strong></div>
        </div>

        <!-- Contribution Margin % -->
        <div class="kpi-card" style="background:linear-gradient(135deg, rgba(217,119,6,0.08), rgba(217,119,6,0.02)); border:1.5px solid rgba(217,119,6,0.3); border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:#b45309;">📈 نسبة هامش المساهمة</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:rgba(217,119,6,0.15); color:#b45309;">CM Ratio</span>
          </div>
          <div style="font-size:22px; font-weight:900; color:#b45309; font-family:'IBM Plex Mono', monospace;" dir="ltr">
            ${S.toFixed(1)}%
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">مجمل الربح: <strong class="mono" dir="ltr">${i(P)}</strong></div>
        </div>

        <!-- Margin of Safety -->
        <div class="kpi-card" style="background:${T?"linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02))":"linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.02))"}; border:1.5px solid ${T?"rgba(16,185,129,0.4)":"rgba(239,68,68,0.4)"}; border-radius:14px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:800; color:${T?"#047857":"#b91c1c"};">🛡️ هامش الأمان (Safety)</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:12px; background:${T?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.15)"}; color:${T?"#047857":"#b91c1c"};">${w.toFixed(1)}%</span>
          </div>
          <div style="font-size:22px; font-weight:900; color:${T?"#047857":"#b91c1c"}; font-family:'IBM Plex Mono', monospace;" dir="ltr">
            ${i(r)}
          </div>
          <div style="font-size:11px; color:var(--text-3); margin-top:4px;">${T?"فائض أمان فوق التعادل":"عجز دون نقطة التعادل"}</div>
        </div>

      </div>

      <!-- ═══ EXECUTIVE SUMMARY STRIP ═══ -->
      <div class="card mb-24" style="border-radius:14px; padding:18px 24px; background:linear-gradient(135deg, rgba(91,62,194,0.08), rgba(91,62,194,0.02)); border:1.5px solid rgba(91,62,194,0.25); margin-bottom:24px;">
        <h4 style="color:#5b3ec2; margin-bottom:8px; font-size:15px; font-weight:900;">📋 التقرير والتشخيص التنفيذي:</h4>
        <div style="font-size:13px; line-height:1.7; color:var(--text-1);">
          • إجمالي المصروفات المحددة في الحسبة: <strong style="color:#dc2626;">${i(y)}</strong> (تم تحديد <strong>${n}</strong> من أصل <strong>${b}</strong> بند مصروف).<br>
          • نسبة هامش الربح الإجمالي الفعلي (هامش المساهمة) تمثل <strong>${S.toFixed(1)}%</strong> من قيمة المبيعات.<br>
          • بناءً على ذلك، نقطة التعادل المطلوبة لتغطية المصروفات المحددة هي <strong style="color:#1d4ed8;">${i(u)}</strong> (بمعدل <strong>${i(g)}</strong> يومياً).<br>
          • ${T?`<span style="color:#16a34a; font-weight:700;">✅ المبيعات الحالية (${i(p)}) تجاوزت نقطة التعادل بفائض قدره ${i(r)} (هامش أمان ${w.toFixed(1)}%).</span>`:`<span style="color:#dc2626; font-weight:700;">⚠️ المبيعات الحالية (${i(p)}) دون نقطة التعادل بفارق ${i(Math.abs(r))}. لتحقيق الربحية ينصح برفع هامش الربح أو زيادة حجم التوزيع أو تقسيط المصروفات السنوية.</span>`}
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
              <button class="btn btn-sm btn-ghost" onclick="setTargetMarginPreset(${S.toFixed(1)})" style="font-size:10.5px; padding:2px 6px; color:#5b3ec2; font-weight:800; border:1px solid #5b3ec2;">الفعلي (${S.toFixed(1)}%)</button>
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
                  ${x.map(f=>`
                    <th style="text-align:left; min-width:115px; ${f.isActual?"background:rgba(91,62,194,0.12); color:#4338ca; font-weight:900;":""}">
                      هامش ${f.label}
                    </th>
                  `).join("")}
                </tr>
              </thead>
              <tbody>
                ${[{profit:0,label:"0 ر.س (نقطة التعادل)"},{profit:5e3,label:"5,000 ر.س"},{profit:1e4,label:"10,000 ر.س"},{profit:15e3,label:"15,000 ر.س"},{profit:2e4,label:"20,000 ر.س",isHighlight:!0},{profit:25e3,label:"25,000 ر.س"},{profit:3e4,label:"30,000 ر.س",isHighlight:!0},{profit:4e4,label:"40,000 ر.س"},{profit:5e4,label:"50,000 ر.س"},{profit:75e3,label:"75,000 ر.س"},{profit:1e5,label:"100,000 ر.س"}].map(f=>{const z=window._beTargetProfitVal===f.profit;return`
                    <tr style="border-bottom:1px solid var(--border-soft); ${z?"background:rgba(2,132,199,0.08); font-weight:800;":f.isHighlight?"background:rgba(91,62,194,0.03);":""}">
                      <td style="position:sticky; right:0; background:${z?"#f0f9ff":"var(--bg-1)"}; z-index:1; font-weight:800;">
                        ${f.label}
                        ${f.isHighlight?'<span style="font-size:9px; background:#5b3ec2; color:#fff; padding:1px 4px; border-radius:3px; margin-right:3px;">شائع</span>':""}
                      </td>
                      ${x.map(I=>{const F=I.val>0?(y+f.profit)/I.val:0,B=p>=F&&F>0,h=z&&Math.abs(I.val*100-window._beTargetMarginVal)<.2;return`
                          <td class="mono" style="text-align:left; ${I.isActual?"background:rgba(91,62,194,0.05); font-weight:800;":""} ${h?"outline:2px solid #0284c7; background:rgba(2,132,199,0.15); font-weight:900;":""}" dir="ltr">
                            <span style="color:${B?"#15803d":"#1e293b"}; font-weight:${B?"800":"600"};">
                              ${i(F)}
                            </span>
                            ${B?'<span style="color:#15803d; font-size:10px;"> ✅</span>':""}
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
              المحدد: ${n} من ${b} بند | الإجمالي: ${i(y)}
            </span>
            ${C>0?`
              <span style="font-size:11.5px; font-weight:700; color:var(--text-3); background:var(--bg-2); padding:4px 8px; border-radius:8px;">
                مستبعد: ${i(C)}
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
                  <input type="checkbox" id="be-master-check" ${n===b?"checked":""} onchange="toggleBEMasterCheck(this.checked)" style="cursor:pointer; width:16px; height:16px;" title="تحديد/إلغاء تحديد الكل" />
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
              ${k.map((f,z)=>`
                <tr style="border-bottom:1px solid var(--border-soft); ${f.isSelected?z%2===1?"background:rgba(0,0,0,0.015);":"":"opacity:0.5; background:var(--bg-2);"}">
                  <td style="text-align:center;">
                    <input type="checkbox" class="be-item-check" data-code="${f.code}" ${f.isSelected?"checked":""} onchange="toggleBEExpenseItem('${f.code}')" style="cursor:pointer; width:16px; height:16px;" />
                  </td>
                  <td class="mono font-bold" style="color:var(--text-3);">${f.code}</td>
                  <td style="font-weight:700; color:var(--text-1);">
                    ${f.name}
                    ${f.isSelected?"":'<span style="font-size:10px; color:#dc2626; margin-right:4px;">(مستبعد)</span>'}
                  </td>
                  <td>
                    <span style="font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:6px; background:${f.badgeBg}; color:${f.badgeColor};">
                      ${f.label}
                    </span>
                  </td>
                  <td class="mono font-bold" style="text-align:left; color:#dc2626;" dir="ltr">${i(f.balance)}</td>
                  <td style="text-align:center; font-weight:700; color:var(--text-2); font-size:11.5px;">
                    ${f.isSelected?f.pctOfSelected.toFixed(1)+"%":"—"}
                  </td>
                  <td class="mono font-bold" style="text-align:left; color:${f.isSelected?"#4338ca":"var(--text-3)"};" dir="ltr">
                    ${f.isSelected?i(f.salesNeeded):"—"}
                  </td>
                  <td class="mono dim" style="text-align:left; font-size:11.5px;" dir="ltr">
                    ${f.isSelected?i(f.salesNeeded/e):"—"}
                  </td>
                </tr>
              `).join("")}
            </tbody>
            <tfoot>
              <tr style="background:var(--bg-2); font-weight:900; border-top:2px solid var(--border);">
                <td style="text-align:center;">☑️</td>
                <td colspan="3">إجمالي المصروفات المحددة في نقطة التعادل</td>
                <td class="mono" style="text-align:left; color:#dc2626;" dir="ltr">${i(y)}</td>
                <td style="text-align:center;">100.0%</td>
                <td class="mono" style="text-align:left; color:#4338ca;" dir="ltr">${i(u)}</td>
                <td class="mono" style="text-align:left; color:#4338ca;" dir="ltr">${i(g)}</td>
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
              <span class="mono font-bold" id="sim-cm-val" style="color:#b45309; font-size:14px;">${S.toFixed(1)}%</span>
            </div>
            <input type="range" id="sim-cm-slider" min="3" max="40" step="0.5" value="${S.toFixed(1)}" oninput="updateBESimulator()" style="width:100%; cursor:pointer;" />
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
            <div class="mono font-bold" id="sim-res-be" style="font-size:20px; color:#1d4ed8;" dir="ltr">${i(u)}</div>
            <div style="font-size:11px; color:var(--text-3);" id="sim-res-be-daily">${i(g)} / يومياً</div>
          </div>

          <div>
            <div style="font-size:11.5px; font-weight:700; color:#5b3ec2; margin-bottom:4px;">🚀 المبيعات لتحقيق الربح المستهدف:</div>
            <div class="mono font-bold" id="sim-res-target-sales" style="font-size:20px; color:#4338ca;" dir="ltr">0.00 ر.س</div>
            <div style="font-size:11px; color:var(--text-3);" id="sim-res-target-daily">0.00 ر.س / يومياً</div>
          </div>

          <div>
            <div style="font-size:11.5px; font-weight:700; color:#5b3ec2; margin-bottom:4px;">🏆 الربح المتوقع عند المبيعات الحالية:</div>
            <div class="mono font-bold" id="sim-res-profit" style="font-size:20px; color:#15803d;" dir="ltr">${i($)}</div>
            <div style="font-size:11px; color:var(--text-3);" id="sim-res-profit-margin">هامش صافي: 0%</div>
          </div>

        </div>
      </div>

    </div>
  `,window._beCurrentData=a,window.toggleBEExpenseItem=f=>{window._beSelectedExpenseCodes||(window._beSelectedExpenseCodes=new Set),window._beSelectedExpenseCodes.has(f)?window._beSelectedExpenseCodes.delete(f):window._beSelectedExpenseCodes.add(f);const z=window.scrollY||document.documentElement.scrollTop;mt(window._beCurrentContainer,window._beCurrentFrom,window._beCurrentTo),window.scrollTo(0,z)},window.toggleBEMasterCheck=f=>{window._beSelectedExpenseCodes||(window._beSelectedExpenseCodes=new Set),f?window._beCurrentData.sortedExp.forEach(I=>window._beSelectedExpenseCodes.add(I.code)):window._beSelectedExpenseCodes.clear();const z=window.scrollY||document.documentElement.scrollTop;mt(window._beCurrentContainer,window._beCurrentFrom,window._beCurrentTo),window.scrollTo(0,z)},window.setBEPreset=f=>{window._beSelectedExpenseCodes||(window._beSelectedExpenseCodes=new Set),window._beSelectedExpenseCodes.clear();const z=window._beCurrentData.sortedExp;f==="all"?z.forEach(F=>window._beSelectedExpenseCodes.add(F.code)):f==="core_fixed"?z.filter(F=>F.isCoreFixed).forEach(F=>window._beSelectedExpenseCodes.add(F.code)):f==="cash_only"&&z.filter(F=>F.isCash).forEach(F=>window._beSelectedExpenseCodes.add(F.code));const I=window.scrollY||document.documentElement.scrollTop;mt(window._beCurrentContainer,window._beCurrentFrom,window._beCurrentTo),window.scrollTo(0,I)},window.setTargetProfitPreset=f=>{window._beTargetProfitVal=parseFloat(f)||0;const z=document.getElementById("be-target-profit-input");z&&(z.value=window._beTargetProfitVal);const I=document.getElementById("sim-target-profit");I&&(I.value=window._beTargetProfitVal),window.updateTargetProfitCalc(),window.updateBESimulator()},window.setTargetMarginPreset=f=>{window._beTargetMarginVal=parseFloat(f)||15;const z=document.getElementById("be-target-margin-input");z&&(z.value=window._beTargetMarginVal);const I=document.getElementById("sim-cm-slider");I&&(I.value=window._beTargetMarginVal),window.updateTargetProfitCalc(),window.updateBESimulator()},window.updateTargetProfitCalc=()=>{const f=window._beCurrentData;if(!f)return;const z=document.getElementById("be-target-profit-input"),I=parseFloat(z?.value??window._beTargetProfitVal??0);window._beTargetProfitVal=I;const F=document.getElementById("be-target-margin-input"),B=parseFloat(F?.value??window._beTargetMarginVal??f.cmPct);window._beTargetMarginVal=B;const h=B/100,D=h>0?(f.fixedCosts+I)/h:0,_=f.days>0?D/f.days:0,L=f.revenueTotal-D,E=L>=0&&D>0,M=f.revenueTotal>0&&D>f.revenueTotal?((D-f.revenueTotal)/f.revenueTotal*100).toFixed(1)+"%":"0%",j=D>0?(I/D*100).toFixed(1)+"%":"0%",A=document.getElementById("tp-res-sales"),H=document.getElementById("tp-res-daily"),O=document.getElementById("tp-res-gap"),K=document.getElementById("tp-res-status"),X=document.getElementById("tp-res-growth"),R=document.getElementById("tp-res-net-margin");A&&(A.textContent=i(D)),H&&(H.textContent=i(_)+" / يومياً"),O&&(O.textContent=(E?"+":"-")+i(Math.abs(L)),O.style.color=E?"#15803d":"#dc2626"),K&&(K.textContent=E?`✅ تم تجاوز هذا الربح بفائض قدره ${i(L)}`:`⏳ متبقي مبيعات إضافية قدرها ${i(Math.abs(L))} لتحقيق الهدف`,K.style.color=E?"#15803d":"#dc2626"),X&&(X.textContent=E?"✅ محقق بالفعل":`+${M}`,X.style.color=E?"#15803d":"#4338ca"),R&&(R.textContent="هامش صافي من المبيعات: "+j)},window.updateBESimulator=()=>{const f=window._beCurrentData;if(!f)return;const z=parseFloat(document.getElementById("sim-cm-slider")?.value||f.cmPct),I=parseFloat(document.getElementById("sim-exp-slider")?.value||0),F=parseFloat(document.getElementById("sim-target-profit")?.value||window._beTargetProfitVal||0),B=document.getElementById("sim-cm-val"),h=document.getElementById("sim-exp-adj-val");B&&(B.textContent=z.toFixed(1)+"%"),h&&(h.textContent=(I>=0?"+":"")+I+"%");const D=z/100,_=f.fixedCosts*(1+I/100),L=D>0?_/D:0,E=f.days>0?L/f.days:0,M=D>0?(_+F)/D:0,j=f.days>0?M/f.days:0,A=f.revenueTotal*D-_,H=f.revenueTotal>0?A/f.revenueTotal*100:0,O=document.getElementById("sim-res-be"),K=document.getElementById("sim-res-be-daily"),X=document.getElementById("sim-res-target-sales"),R=document.getElementById("sim-res-target-daily"),V=document.getElementById("sim-res-profit"),U=document.getElementById("sim-res-profit-margin");O&&(O.textContent=i(L)),K&&(K.textContent=i(E)+" / يومياً"),X&&(X.textContent=i(M)),R&&(R.textContent=i(j)+" / يومياً"),V&&(V.textContent=i(A),V.style.color=A>=0?"#15803d":"#b91c1c"),U&&(U.textContent="هامش صافي: "+H.toFixed(1)+"%")},window.resetBESimulator=()=>{const f=window._beCurrentData;if(!f)return;const z=document.getElementById("sim-cm-slider"),I=document.getElementById("sim-exp-slider"),F=document.getElementById("sim-target-profit");z&&(z.value=f.cmPct.toFixed(1)),I&&(I.value=0),F&&(F.value=window._beTargetProfitVal||2e4),window.updateBESimulator()},setTimeout(()=>{window.updateTargetProfitCalc(),window.updateBESimulator()},40)}let wt=[],G="balance",W="desc",_t=[],ct="full";async function Gt(o,s,d){o.innerHTML='<div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin fa-2x" style="color:var(--brand);"></i><div style="margin-top:10px;font-weight:700;color:var(--text-1);">جاري مطابقة فواتير وسندات ومردودات وقيود العملاء واحتساب أعمار الديون بدقة 100%…</div></div>';try{const[t,a,p,v,y,C]=await Promise.all([Y(Z.customers()),Y(Z.salesInvoices()),Y(Z.receipts()),Y(Z.salesReturns()),Y(Z.journalEntries()),Y(Z.chartOfAccounts())]),l={};(a||[]).forEach(c=>{if(c.status==="cancelled")return;const w=c.customerId;w&&(l[w]||(l[w]=[]),l[w].push(c))});const P={};(p||[]).forEach(c=>{if(c.status==="cancelled")return;const w=c.targetId||c.customerId;w&&(P[w]||(P[w]=[]),P[w].push(c))});const $={};(v||[]).forEach(c=>{if(c.status==="cancelled"||c.status==="void")return;const w=c.customerId;w&&($[w]||($[w]=[]),$[w].push(c))});const S=(y||[]).filter(c=>{if(c.status==="cancelled"||c.isReversed)return!1;const w=(c.sourceType||"").toLowerCase(),r=(c.refType||"").toLowerCase(),k=(c.description||"").toLowerCase();return!(w==="salesinvoice"||w==="sales"||w==="receipt"||w==="salesreturn"||w==="sales_return"||w==="salescogs"||w==="cogs"||w==="salesreturncogs"||w==="salesinvoice_cogs"||w==="collection"||w==="expense"||w==="supplierpayment"||r.includes("sales")||r.includes("receipt")||r.includes("invoice")||r.includes("return")||k.includes("مبيعات")||k.includes("فاتورة")||k.includes("سند قبض")||k.includes("مرتجع")||k.includes("إشعار دائن")||k.includes("تصفية"))}),m=new Date;m.setHours(0,0,0,0);const u=[],g=new Set;(t||[]).forEach(c=>{const w=c.id,r=(c.name||"").trim().toLowerCase(),k=new Set,e=new Set;(C||[]).forEach(R=>{R.sourceEntityId===w&&(e.add(R.id),R.code&&k.add(R.code))});const n=l[w]||[],b=P[w]||[],T=$[w]||[];let x=0,f=0;n.forEach(R=>{x+=parseFloat(R.totalWithVat||R.total||0)}),b.forEach(R=>{f+=parseFloat(R.amount||0)}),T.forEach(R=>{f+=parseFloat(R.totalWithVat||R.total||0)}),S.forEach(R=>{(R.lines||[]).forEach(V=>{const U=V.accountId,nt=V.accountCode,lt=(V.accountName||"").trim().toLowerCase();(U&&e.has(U)||nt&&k.has(nt)||r&&lt&&lt===r)&&(x+=parseFloat(V.debit||0),f+=parseFloat(V.credit||0))})});const z=parseFloat(c.openingBalance||0),I=Math.round((z+x-f)*100)/100;if(I<=.01)return;const F=(c.repName||c.salesRepName||"بدون مندوب").trim();F&&F!=="بدون مندوب"&&g.add(F);const B=parseInt(c.creditDays||0,10),D=[...b].sort((R,V)=>(V.date||"").localeCompare(R.date||""))[0]||null,_=D?.date||"",L=D?parseFloat(D.amount||0):0;let E=0,M=0,j=0,A=0,H=0,O=I;const K=[...n].sort((R,V)=>(V.date||"").localeCompare(R.date||"")),X=[];for(const R of K){if(O<=0)break;const V=parseFloat(R.totalWithVat||R.total||0);if(V<=0)continue;const U=Math.min(O,V);O-=U;const nt=R.date?new Date(R.date):m,lt=Math.max(0,Math.floor((m-nt)/(1e3*60*60*24))),J=lt-B;let et="current",tt='<span class="badge good" style="font-size:11px;">🟢 غير مستحق (ضمن المهلة)</span>';J<=0?(E+=U,et="current",tt=`<span class="badge good" style="font-size:11px;">🟢 ضمن المهلة (متبقي ${Math.abs(J)} ي)</span>`):J<=30?(M+=U,et="1_30",tt=`<span class="badge warn" style="font-size:11px; background:#fef3c7; color:#92400e;">🟡 متأخر (${J} يوم)</span>`):J<=60?(j+=U,et="31_60",tt=`<span class="badge warn" style="font-size:11px; background:#ffedd5; color:#9a3412;">🟠 متأخر (${J} يوم)</span>`):J<=90?(A+=U,et="61_90",tt=`<span class="badge bad" style="font-size:11px; background:#fee2e2; color:#991b1b;">🔴 متأخر (${J} يوم)</span>`):(H+=U,et="over90",tt=`<span class="badge bad" style="font-size:11px; background:#fecaca; color:#7f1d1d; font-weight:800;">⛔ متعثر (+${J} يوم)</span>`),X.push({id:R.id,invoiceNumber:R.invoiceNumber||R.code||R.id,date:R.date||"",total:V,allocatedRemaining:U,paidPart:Math.max(0,V-U),diffDays:lt,overdueDays:J,bucket:et,statusBadge:tt})}O>0&&(H+=O,X.push({id:"opening_balance",invoiceNumber:"رصيد افتتاحي / فواتير سابقة",date:"سابق",total:O,allocatedRemaining:O,paidPart:0,diffDays:999,overdueDays:999,bucket:"over90",statusBadge:'<span class="badge bad" style="font-size:11px; background:#fecaca; color:#7f1d1d; font-weight:800;">⛔ متعثر (رصيد قديم)</span>'})),u.push({id:c.id,name:c.name||"عميل مجهول",code:c.code||"",phone:c.phone||"",repName:F||"بدون مندوب",creditLimit:parseFloat(c.creditLimit||0),creditDays:B,balance:I,lastPaymentDate:_,lastPaymentAmount:L,current:E,aging1_30:M,aging31_60:j,aging61_90:A,agingOver90:H,totalRemaining:I,allocatedInvoices:X})}),wt=u,_t=Array.from(g).sort(),Ft(o)}catch(t){o.innerHTML=`<div class="alert bad">خطأ في احتساب أعمار الديون: ${t.message}</div>`}}function Ft(o){o.innerHTML=`
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
        <button class="btn btn-secondary" onclick="window.exportAgedReceivablesPDF('summary')" style="white-space:nowrap; display:inline-flex; align-items:center; gap:6px; background:rgba(37,99,235,0.08); color:#2563eb; border-color:rgba(37,99,235,0.3);" title="طباعة كشف تحصيل رأسي مختصر يحتوي على إجمالي المديونيات وآخر سداد فقط">
          📄 طباعة موجز (المديونيات فقط)
        </button>
        <button class="btn btn-primary" onclick="window.exportAgedReceivablesPDF('full')" style="white-space:nowrap; display:inline-flex; align-items:center; gap:6px;" title="طباعة كشف تفصيلي كامل بأعمار الديون">
          🖨️ طباعة تفصيلي (أعمار الديون)
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
        
        <!-- View Mode Selector -->
        <div style="display:flex; align-items:center; gap:6px; min-width:190px;">
          <label style="font-size:12px; font-weight:700; color:var(--text-2); white-space:nowrap;">📋 طريقة العرض:</label>
          <select id="ar-view-mode" class="input" style="padding:6px 10px; font-size:12px; font-weight:700; color:var(--brand);" onchange="window.setAgedReceivablesViewMode(this.value)">
            <option value="full" ${ct==="full"?"selected":""}>📊 تفصيلي بأعمار الديون</option>
            <option value="summary" ${ct==="summary"?"selected":""}>📄 موجز (إجمالي المديونيات وآخر سداد)</option>
          </select>
        </div>

        <!-- Rep Filter -->
        <div style="display:flex; align-items:center; gap:6px; min-width:170px;">
          <label style="font-size:12px; font-weight:700; color:var(--text-2); white-space:nowrap;">👤 المندوب:</label>
          <select id="ar-rep-filter" class="input" style="padding:6px 10px; font-size:12px;" onchange="window.filterAgedReceivables()">
            <option value="">جميع المناديب</option>
            ${_t.map(s=>`<option value="${s}">${s}</option>`).join("")}
          </select>
        </div>

        <!-- Overdue Risk Filter -->
        <div style="display:flex; align-items:center; gap:6px; min-width:170px;" id="ar-risk-filter-wrap">
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
        <div style="position:relative; flex:1; min-width:180px; max-width:280px;">
          <input type="text" id="ar-search-input" class="input" placeholder="🔍 بحث باسم العميل أو الكود..." style="padding:6px 12px; font-size:12px; width:100%;" oninput="window.filterAgedReceivables()" />
        </div>

        <!-- Quick Sort Presets -->
        <div style="margin-right:auto; display:flex; gap:6px; align-items:center;">
          <span style="font-size:11.5px; color:var(--text-2); font-weight:700;">ترتيب:</span>
          <button class="btn btn-secondary btn-sm" onclick="window.sortAgedReceivables('balance')" title="ترتيب حسب إجمالي المديونية">
            💰 المبلغ ${G==="balance"?W==="desc"?"▼":"▲":""}
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.sortAgedReceivables('lastPaymentAmount')" title="ترتيب حسب آخر سداد">
            💳 آخر سداد ${G==="lastPaymentAmount"?W==="desc"?"▼":"▲":""}
          </button>
          ${ct==="full"?`
            <button class="btn btn-secondary btn-sm" onclick="window.sortAgedReceivables('agingOver90')" title="ترتيب حسب الأكثر تعثراً (+90 يوم)">
              ⛔ الأكثر تعثراً ${G==="agingOver90"?W==="desc"?"▼":"▲":""}
            </button>
          `:""}
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card" style="padding:0; overflow:hidden;">
      <div class="table-container" style="overflow-x:auto;">
        <table class="data-dense" style="width:100%; border-collapse:collapse; font-size:12px; margin:0;" id="ar-table">
          <thead id="ar-thead"></thead>
          <tbody id="ar-tbody"></tbody>
          <tfoot id="ar-tfoot"></tfoot>
        </table>
      </div>
    </div>
  `,window.filterAgedReceivables()}window.setAgedReceivablesViewMode=o=>{ct=o;const s=document.getElementById("ar-risk-filter-wrap");s&&(s.style.opacity=o==="summary"?"0.6":"1"),window.filterAgedReceivables()};window.filterAgedReceivables=()=>{const o=document.getElementById("ar-rep-filter")?.value||"",s=document.getElementById("ar-risk-filter")?.value||"all",d=(document.getElementById("ar-search-input")?.value||"").trim().toLowerCase();let t=[...wt];o&&(t=t.filter(l=>l.repName===o)),s==="over90"?t=t.filter(l=>l.agingOver90>0):s==="over60"?t=t.filter(l=>l.agingOver90+l.aging61_90>0):s==="over30"?t=t.filter(l=>l.agingOver90+l.aging61_90+l.aging31_60>0):s==="current"&&(t=t.filter(l=>l.current>0&&l.aging1_30===0&&l.aging31_60===0&&l.aging61_90===0&&l.agingOver90===0)),d&&(t=t.filter(l=>(l.name||"").toLowerCase().includes(d)||(l.code||"").toLowerCase().includes(d)||(l.phone||"").includes(d)||(l.repName||"").toLowerCase().includes(d))),t.sort((l,P)=>{let $=l[G],S=P[G];return typeof $=="string"?W==="asc"?($||"").localeCompare(S||""):(S||"").localeCompare($||""):($=parseFloat($||0),S=parseFloat(S||0),W==="asc"?$-S:S-$)});const a={balance:0,lastPaymentTotal:0,current:0,aging1_30:0,aging31_60:0,aging61_90:0,agingOver90:0};t.forEach(l=>{a.balance+=l.balance,a.lastPaymentTotal+=l.lastPaymentAmount||0,a.current+=l.current,a.aging1_30+=l.aging1_30,a.aging31_60+=l.aging31_60,a.aging61_90+=l.aging61_90,a.agingOver90+=l.agingOver90}),window._agedReceivablesRows=t,window._agedReceivablesTotals=a;const p=(l,P)=>{const $=document.getElementById(l);$&&($.textContent=P)};p("ar-kpi-total",i(a.balance)),p("ar-kpi-current",i(a.current)),p("ar-kpi-30",i(a.aging1_30)),p("ar-kpi-60",i(a.aging31_60)),p("ar-kpi-90",i(a.aging61_90)),p("ar-kpi-over90",i(a.agingOver90)),p("ar-kpi-count",`${t.length} عميل`);const v=document.getElementById("ar-thead"),y=document.getElementById("ar-tbody"),C=document.getElementById("ar-tfoot");if(!(!v||!y||!C))if(ct==="summary"){if(v.innerHTML=`
      <tr style="background:var(--bg-2); border-bottom:2px solid var(--border);">
        <th style="padding:10px 8px; text-align:center; width:35px;">#</th>
        <th style="padding:10px 8px; text-align:right; cursor:pointer;" onclick="window.sortAgedReceivables('name')" title="انقر للترتيب حسب اسم العميل">
          العميل ${G==="name"?W==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
        </th>
        <th style="padding:10px 8px; text-align:right; cursor:pointer;" onclick="window.sortAgedReceivables('repName')" title="انقر للترتيب حسب المندوب">
          المندوب ${G==="repName"?W==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
        </th>
        <th style="padding:10px 8px; text-align:center; width:90px;">الهاتف</th>
        <th style="padding:10px 8px; text-align:center; width:60px;">المهلة</th>
        <th style="padding:10px 8px; text-align:center; cursor:pointer; color:#059669; font-weight:800;" onclick="window.sortAgedReceivables('lastPaymentAmount')" title="انقر للترتيب حسب آخر سداد">
          💳 آخر سداد (المبلغ والتاريخ) ${G==="lastPaymentAmount"?W==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
        </th>
        <th style="padding:10px 8px; text-align:left; color:var(--brand); cursor:pointer; font-weight:900; font-size:13px;" onclick="window.sortAgedReceivables('balance')" title="انقر للترتيب حسب إجمالي المديونية">
          💰 إجمالي المديونية المستحقة ${G==="balance"?W==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
        </th>
        <th style="padding:10px 8px; text-align:center; width:85px;" class="no-print">إجراءات</th>
      </tr>
    `,!t.length){y.innerHTML='<tr><td colspan="8" style="text-align:center; padding:36px; color:var(--text-2);">لا توجد مديونيات مطابقة لمعايير الفلترة المحددة</td></tr>',C.innerHTML="";return}y.innerHTML=t.map((l,P)=>`
      <tr style="border-bottom:1px solid var(--border-soft); transition:background .15s;" onmouseover="this.style.background='rgba(99,102,241,0.03)'" onmouseout="this.style.background=''">
        <td style="padding:10px 8px; text-align:center; color:var(--text-2); font-size:11px;">${P+1}</td>
        <td style="padding:10px 8px;">
          <div style="font-weight:700; color:var(--text-0); cursor:pointer; display:inline-block;" onclick="window.showAgingCustomerModal('${l.id}')" title="انقر لعرض تفكيك الفواتير غير المسددة والأعمار (FIFO)">
            ${l.name}
          </div>
          ${l.code?`<div style="font-size:10.5px; color:var(--text-2); font-family:monospace;">كود: ${l.code}</div>`:""}
        </td>
        <td style="padding:10px 8px; color:var(--text-1); font-weight:600;">${l.repName}</td>
        <td style="padding:10px 8px; text-align:center; font-family:monospace; font-size:11px; color:var(--text-2);">${l.phone||"—"}</td>
        <td style="padding:10px 8px; text-align:center; color:var(--text-2); font-family:monospace;">${l.creditDays?`${l.creditDays} ي`:"—"}</td>
        <td style="padding:8px 8px; text-align:center;">
          ${l.lastPaymentAmount>0?`
            <div class="mono" style="font-weight:800; color:#059669; font-size:12.5px;">${i(l.lastPaymentAmount)}</div>
            <div style="font-size:10px; color:var(--text-2); font-family:monospace; margin-top:2px;">📅 ${l.lastPaymentDate||"—"}</div>
          `:'<span class="dim mono">—</span>'}
        </td>
        <td class="mono font-bold" style="padding:10px 8px; text-align:left; color:var(--brand); font-size:14px;">${i(l.balance)}</td>
        <td style="padding:6px 8px; text-align:center; white-space:nowrap;" class="no-print">
          <div style="display:inline-flex; gap:4px; align-items:center;">
            <button class="btn btn-icon sm btn-ghost" onclick="window.showAgingCustomerModal('${l.id}')" title="عرض تفاصيل الفواتير غير المسددة وأعمارها (FIFO)">
              📊
            </button>
            ${l.phone?`
              <button class="btn btn-icon sm btn-ghost" onclick="window.sendCustomerDebtWhatsApp('${l.id}')" title="إرسال تذكير سداد عبر واتساب" style="color:#25D366;">
                💬
              </button>
            `:""}
          </div>
        </td>
      </tr>
    `).join(""),C.innerHTML=`
      <tr style="background:var(--bg-2); border-top:2px solid var(--border); font-weight:bold; font-size:12px;">
        <td colspan="5" style="padding:12px 8px; font-weight:900;">الإجمالي العام (${t.length} عميل)</td>
        <td class="mono font-bold" style="padding:12px 8px; text-align:center; color:#059669; font-size:13px;">${i(a.lastPaymentTotal)}</td>
        <td class="mono font-bold" style="padding:12px 8px; text-align:left; color:var(--brand); font-size:14.5px;">${i(a.balance)}</td>
        <td class="no-print"></td>
      </tr>
    `}else{if(v.innerHTML=`
      <tr style="background:var(--bg-2); border-bottom:2px solid var(--border);">
        <th style="padding:10px 8px; text-align:center; width:35px;">#</th>
        <th style="padding:10px 8px; text-align:right; cursor:pointer;" onclick="window.sortAgedReceivables('name')" title="انقر للترتيب حسب اسم العميل">
          العميل ${G==="name"?W==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
        </th>
        <th style="padding:10px 8px; text-align:right; cursor:pointer;" onclick="window.sortAgedReceivables('repName')" title="انقر للترتيب حسب المندوب">
          المندوب ${G==="repName"?W==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
        </th>
        <th style="padding:10px 8px; text-align:center; width:50px;">المهلة</th>
        <th style="padding:10px 8px; text-align:left; color:var(--brand); cursor:pointer; font-weight:800;" onclick="window.sortAgedReceivables('balance')" title="انقر للترتيب حسب إجمالي المديونية">
          إجمالي المديونية ${G==="balance"?W==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
        </th>
        <th style="padding:10px 8px; text-align:center; color:#059669; cursor:pointer; width:95px;" onclick="window.sortAgedReceivables('lastPaymentAmount')" title="آخر سداد مسجل للعميل">
          💳 آخر سداد ${G==="lastPaymentAmount"?W==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
        </th>
        <th style="padding:10px 8px; text-align:left; color:#10B981; cursor:pointer;" onclick="window.sortAgedReceivables('current')" title="انقر للترتيب">
          غير مستحق ${G==="current"?W==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
        </th>
        <th style="padding:10px 8px; text-align:left; color:#F59E0B; cursor:pointer;" onclick="window.sortAgedReceivables('aging1_30')" title="انقر للترتيب">
          متأخر (1-30) ${G==="aging1_30"?W==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
        </th>
        <th style="padding:10px 8px; text-align:left; color:#F97316; cursor:pointer;" onclick="window.sortAgedReceivables('aging31_60')" title="انقر للترتيب">
          متأخر (31-60) ${G==="aging31_60"?W==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
        </th>
        <th style="padding:10px 8px; text-align:left; color:#DC2626; cursor:pointer;" onclick="window.sortAgedReceivables('aging61_90')" title="انقر للترتيب">
          متأخر (61-90) ${G==="aging61_90"?W==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
        </th>
        <th style="padding:10px 8px; text-align:left; color:#B91C1C; font-weight:900; cursor:pointer;" onclick="window.sortAgedReceivables('agingOver90')" title="انقر للترتيب حسب الأكثر تعثراً">
          متعثر (+90 يوم) ${G==="agingOver90"?W==="desc"?"▼":"▲":'<span style="opacity:0.3;">↕</span>'}
        </th>
        <th style="padding:10px 8px; text-align:center; width:85px;" class="no-print">إجراءات</th>
      </tr>
    `,!t.length){y.innerHTML='<tr><td colspan="12" style="text-align:center; padding:36px; color:var(--text-2);">لا توجد مديونيات مطابقة لمعايير الفلترة المحددة</td></tr>',C.innerHTML="";return}y.innerHTML=t.map((l,P)=>`
      <tr style="border-bottom:1px solid var(--border-soft); transition:background .15s;" onmouseover="this.style.background='rgba(99,102,241,0.03)'" onmouseout="this.style.background=''">
        <td style="padding:10px 8px; text-align:center; color:var(--text-2); font-size:11px;">${P+1}</td>
        <td style="padding:10px 8px;">
          <div style="font-weight:700; color:var(--text-0); cursor:pointer; display:inline-block;" onclick="window.showAgingCustomerModal('${l.id}')" title="انقر لعرض تفكيك الفواتير غير المسددة والأعمار (FIFO)">
            ${l.name}
          </div>
          ${l.code?`<div style="font-size:10.5px; color:var(--text-2); font-family:monospace;">كود: ${l.code}</div>`:""}
        </td>
        <td style="padding:10px 8px; color:var(--text-1);">${l.repName}</td>
        <td style="padding:10px 8px; text-align:center; color:var(--text-2); font-family:monospace;">${l.creditDays?`${l.creditDays} ي`:"—"}</td>
        <td class="mono font-bold" style="padding:10px 8px; text-align:left; color:var(--brand); font-size:13px;">${i(l.balance)}</td>
        <td style="padding:8px 8px; text-align:center;">
          ${l.lastPaymentAmount>0?`
            <div class="mono" style="font-weight:800; color:#059669; font-size:11.5px;">${i(l.lastPaymentAmount)}</div>
            <div style="font-size:9.5px; color:var(--text-2); font-family:monospace;">${l.lastPaymentDate||"—"}</div>
          `:'<span class="dim mono">—</span>'}
        </td>
        <td class="mono" style="padding:10px 8px; text-align:left; color:${l.current?"#10B981":"var(--text-dim)"}; font-weight:${l.current?"700":"normal"};">${l.current?i(l.current):"—"}</td>
        <td class="mono" style="padding:10px 8px; text-align:left; color:${l.aging1_30?"#F59E0B":"var(--text-dim)"}; font-weight:${l.aging1_30?"700":"normal"};">${l.aging1_30?i(l.aging1_30):"—"}</td>
        <td class="mono" style="padding:10px 8px; text-align:left; color:${l.aging31_60?"#F97316":"var(--text-dim)"}; font-weight:${l.aging31_60?"700":"normal"};">${l.aging31_60?i(l.aging31_60):"—"}</td>
        <td class="mono" style="padding:10px 8px; text-align:left; color:${l.aging61_90?"#DC2626":"var(--text-dim)"}; font-weight:${l.aging61_90?"700":"normal"};">${l.aging61_90?i(l.aging61_90):"—"}</td>
        <td class="mono font-bold" style="padding:10px 8px; text-align:left; color:${l.agingOver90?"#B91C1C":"var(--text-dim)"}; font-size:${l.agingOver90?"13px":"12px"}; background:${l.agingOver90?"rgba(185,28,28,0.05)":"transparent"};">${l.agingOver90?i(l.agingOver90):"—"}</td>
        <td style="padding:6px 8px; text-align:center; white-space:nowrap;" class="no-print">
          <div style="display:inline-flex; gap:4px; align-items:center;">
            <button class="btn btn-icon sm btn-ghost" onclick="window.showAgingCustomerModal('${l.id}')" title="عرض تفاصيل الفواتير غير المسددة وأعمارها (FIFO)">
              📊
            </button>
            ${l.phone?`
              <button class="btn btn-icon sm btn-ghost" onclick="window.sendCustomerDebtWhatsApp('${l.id}')" title="إرسال تذكير سداد عبر واتساب" style="color:#25D366;">
                💬
              </button>
            `:""}
          </div>
        </td>
      </tr>
    `).join(""),C.innerHTML=`
      <tr style="background:var(--bg-2); border-top:2px solid var(--border); font-weight:bold; font-size:12px;">
        <td colspan="4" style="padding:12px 8px; font-weight:900;">الإجمالي العام (${t.length} عميل)</td>
        <td class="mono font-bold" style="padding:12px 8px; text-align:left; color:var(--brand); font-size:13.5px;">${i(a.balance)}</td>
        <td class="mono font-bold" style="padding:12px 8px; text-align:center; color:#059669; font-size:12px;">${i(a.lastPaymentTotal)}</td>
        <td class="mono font-bold" style="padding:12px 8px; text-align:left; color:#10B981;">${i(a.current)}</td>
        <td class="mono font-bold" style="padding:12px 8px; text-align:left; color:#F59E0B;">${i(a.aging1_30)}</td>
        <td class="mono font-bold" style="padding:12px 8px; text-align:left; color:#F97316;">${i(a.aging31_60)}</td>
        <td class="mono font-bold" style="padding:12px 8px; text-align:left; color:#DC2626;">${i(a.aging61_90)}</td>
        <td class="mono font-bold" style="padding:12px 8px; text-align:left; color:#B91C1C; font-size:13px; background:rgba(185,28,28,0.06);">${i(a.agingOver90)}</td>
        <td class="no-print"></td>
      </tr>
    `}};window.sortAgedReceivables=o=>{G===o?W=W==="desc"?"asc":"desc":(G=o,W=o==="name"||o==="repName"?"asc":"desc");const s=document.getElementById("fin-report-body");s&&Ft(s)};window.showAgingCustomerModal=o=>{const s=wt.find(p=>p.id===o);if(!s)return;let d=document.getElementById("aging-drilldown-modal");d||(d=document.createElement("div"),d.id="aging-drilldown-modal",d.className="modal-overlay",document.body.appendChild(d));const t=(s.aging1_30||0)+(s.aging31_60||0)+(s.aging61_90||0)+(s.agingOver90||0),a=t<=0;d.innerHTML=`
    <div class="modal" style="max-width:880px; width:95vw; max-height:92vh; overflow-y:auto; border-radius:16px; box-shadow:0 20px 40px rgba(0,0,0,0.25);">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-soft); padding:16px 20px; background:var(--bg-1);">
        <div>
          <h3 style="margin:0; font-size:17px; font-weight:900; display:flex; align-items:center; gap:8px;">
            <span>🔍 تفكيك أعمار الديون وحساب FIFO:</span>
            <span style="color:var(--brand);">${s.name}</span>
          </h3>
          <div style="font-size:12px; color:var(--text-3); margin-top:3px;">
            👤 المندوب: <b>${s.repName}</b> ${s.code?`• كود: <span class="mono">${s.code}</span>`:""} ${s.phone?`• 📞 ${s.phone}`:""} • مهلة السداد: <b>${s.creditDays?`${s.creditDays} يوماً`:"بدون مهلة (فوري)"}</b>
          </div>
        </div>
        <button class="modal-close" onclick="closeModal('aging-drilldown-modal')" style="background:none; border:none; font-size:22px; cursor:pointer; color:var(--text-2);">×</button>
      </div>

      <div class="modal-body" style="padding:20px;">
        <!-- Top Status Alert -->
        <div style="padding:12px 16px; border-radius:10px; margin-bottom:16px; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; ${a?"background:#ecfdf5; border:1px solid #a7f3d0; color:#065f46;":"background:#fef2f2; border:1px solid #fecaca; color:#991b1b;"}">
          <div>
            ${a?"✅ <b>وضع ائتماني ممتاز:</b> جميع مديونيات العميل حديثة وتقع بالكامل ضمن مهلة السداد المحددة.":`⚠️ <b>تنبيه تأخير:</b> العميل لديه مبالغ متأخرة تجاوزت مهلة السداد بقيمة إجمالية <b>${i(t)}</b>.`}
          </div>
          <div class="mono" style="font-size:16px; font-weight:900;">
            إجمالي الرصيد القائم: ${i(s.balance)}
          </div>
        </div>

        <!-- Aging Buckets Cards -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:10px; margin-bottom:18px;">
          <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; padding:10px; text-align:center;">
            <div style="font-size:11px; font-weight:700; color:#10b981;">🟢 غير مستحق (ضمن المهلة)</div>
            <div class="mono" style="font-size:14px; font-weight:800; margin-top:4px; color:#10b981;">${i(s.current)}</div>
          </div>
          <div style="background:#fefce8; border:1px solid #fef08a; border-radius:10px; padding:10px; text-align:center;">
            <div style="font-size:11px; font-weight:700; color:#ca8a04;">🟡 متأخر (1 - 30 يوم)</div>
            <div class="mono" style="font-size:14px; font-weight:800; margin-top:4px; color:#ca8a04;">${i(s.aging1_30)}</div>
          </div>
          <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:10px; padding:10px; text-align:center;">
            <div style="font-size:11px; font-weight:700; color:#ea580c;">🟠 متأخر (31 - 60 يوم)</div>
            <div class="mono" style="font-size:14px; font-weight:800; margin-top:4px; color:#ea580c;">${i(s.aging31_60)}</div>
          </div>
          <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:10px; text-align:center;">
            <div style="font-size:11px; font-weight:700; color:#dc2626;">🔴 متأخر (61 - 90 يوم)</div>
            <div class="mono" style="font-size:14px; font-weight:800; margin-top:4px; color:#dc2626;">${i(s.aging61_90)}</div>
          </div>
          <div style="background:#fef2f2; border:2px solid #b91c1c; border-radius:10px; padding:10px; text-align:center;">
            <div style="font-size:11px; font-weight:800; color:#b91c1c;">⛔ متعثر (+90 يوم)</div>
            <div class="mono" style="font-size:14px; font-weight:900; color:#b91c1c; margin-top:4px;">${i(s.agingOver90)}</div>
          </div>
        </div>

        <!-- Explanation Note -->
        <div style="font-size:12px; color:var(--text-2); background:var(--bg-2); padding:10px 14px; border-radius:8px; margin-bottom:14px; border:1px dashed var(--border-soft); line-height:1.6;">
          💡 <b>مبدأ الاحتساب المحاسبي (FIFO):</b> تم استهلاك السدادات السابقة تلقائياً لإغلاق أقدم الفواتير أولاً بأول. يعرض الجدول أدناه الفواتير المحددة التي <b>يتبقى منها الرصيد القائم حالياً</b> وتاريخ كل منها لمعرفة سبب التأخير بدقة:
        </div>

        <!-- Table of Allocated Open Invoices -->
        <div style="border:1px solid var(--border-soft); border-radius:10px; overflow:hidden;">
          <table class="data-dense" style="width:100%; border-collapse:collapse; margin:0; font-size:12px;">
            <thead>
              <tr style="background:var(--bg-2); border-bottom:1px solid var(--border);">
                <th style="padding:9px 10px; text-align:right;">رقم الفاتورة</th>
                <th style="padding:9px 10px; text-align:center;">تاريخها</th>
                <th style="padding:9px 10px; text-align:left;">قيمة الفاتورة الأصلية</th>
                <th style="padding:9px 10px; text-align:left; color:#059669;">المسدد منها (FIFO)</th>
                <th style="padding:9px 10px; text-align:left; color:var(--brand); font-weight:800;">المتبقي غير المسدد</th>
                <th style="padding:9px 10px; text-align:center;">عمر الفاتورة</th>
                <th style="padding:9px 10px; text-align:center;">حالة الاستحقاق</th>
              </tr>
            </thead>
            <tbody>
              ${s.allocatedInvoices&&s.allocatedInvoices.length>0?s.allocatedInvoices.map(p=>`
                <tr style="border-bottom:1px solid var(--border-soft);">
                  <td style="padding:9px 10px; font-weight:700;">${p.invoiceNumber}</td>
                  <td style="padding:9px 10px; text-align:center; font-family:monospace; font-size:11px;">${p.date}</td>
                  <td class="mono" style="padding:9px 10px; text-align:left;">${i(p.total)}</td>
                  <td class="mono" style="padding:9px 10px; text-align:left; color:#059669;">${i(p.paidPart)}</td>
                  <td class="mono font-bold" style="padding:9px 10px; text-align:left; color:var(--brand); font-size:13px;">${i(p.allocatedRemaining)}</td>
                  <td style="padding:9px 10px; text-align:center; font-family:monospace; font-size:11px;">${p.diffDays===999?"—":`${p.diffDays} يوم`}</td>
                  <td style="padding:9px 10px; text-align:center;">${p.statusBadge}</td>
                </tr>
              `).join(""):`
                <tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-3);">لا توجد فواتير معلقة (الرصيد مسدد بالكامل)</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal-footer" style="padding:14px 20px; background:var(--bg-1); border-top:1px solid var(--border-soft); display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary btn-sm" onclick="closeModal('aging-drilldown-modal'); window.openCustomerStatementFromAging('${s.id}');">
            📄 فتح كشف الحساب الشامل
          </button>
          ${s.phone?`
            <button class="btn btn-success btn-sm" onclick="window.sendCustomerDebtWhatsApp('${s.id}')" style="background:#25D366; color:#fff; border:none;">
              💬 تذكير سداد واتساب
            </button>
          `:""}
        </div>
        <button class="btn btn-secondary btn-sm" onclick="closeModal('aging-drilldown-modal')">إغلاق</button>
      </div>
    </div>
  `,openModal("aging-drilldown-modal")};window.openCustomerStatementFromAging=o=>{typeof window.navigate=="function"&&(window.navigate("customer-statement"),setTimeout(()=>{typeof window.selectStmtCustomer=="function"&&window.selectStmtCustomer(o)},250))};window.sendCustomerDebtWhatsApp=o=>{const s=wt.find(v=>v.id===o);if(!s)return;const d=(s.phone||"").replace(/[^0-9]/g,"");if(!d){window.showToast&&window.showToast("رقم جوال العميل غير مسجل","warning");return}const t=d.startsWith("0")?"966"+d.slice(1):d.startsWith("966")?d:"966"+d,a=window.ERP_COMPANY?.name||"مؤسسة إدهام للمواد الغذائية",p=`مرحباً ${s.name}،
تحية طيبة من ${a}.
نود تذكيركم بأن إجمالي الرصيد المستحق على حسابكم هو: *${i(s.balance)}*.
`+(s.lastPaymentAmount>0?`💳 آخر دفعة مسددة: *${i(s.lastPaymentAmount)}* بتاريخ ${s.lastPaymentDate}
`:"")+(s.agingOver90>0?`⛔ مبالغ متأخرة أكثر من 90 يوم: *${i(s.agingOver90)}*
`:"")+(s.aging61_90>0?`⚠️ مبالغ متأخرة (61-90 يوم): *${i(s.aging61_90)}*
`:"")+"يرجى التكرم بالترتيب لسداد المبلغ، شاكرين ومقدرين حسن تعاونكم الدائم معنا!";window.open(`https://api.whatsapp.com/send?phone=${t}&text=${encodeURIComponent(p)}`,"_blank")};window.exportAgedReceivablesExcel=async()=>{const o=window._agedReceivablesRows,s=window._agedReceivablesTotals;if(!o||o.length===0){window.showToast?window.showToast("لا توجد بيانات لتصديرها","warning"):alert("لا توجد بيانات لتصديرها");return}const d=`تقرير مديونيات وأعمار ديون العملاء - ${new Date().toLocaleDateString("ar-SA-u-nu-latn")}`,t=["#","العميل","الكود","المندوب","الهاتف","مهلة الائتمان (أيام)","مبلغ آخر سداد","تاريخ آخر سداد","إجمالي المديونية (الرصيد)","غير مستحق (خلال المهلة)","متأخر (1-30 يوم)","متأخر (31-60 يوم)","متأخر (61-90 يوم)","متعثر (+90 يوم)"],a=o.map((v,y)=>[y+1,v.name,v.code||"—",v.repName,v.phone||"—",v.creditDays||0,v.lastPaymentAmount||0,v.lastPaymentDate||"—",Math.round(v.balance*100)/100,Math.round(v.current*100)/100,Math.round(v.aging1_30*100)/100,Math.round(v.aging31_60*100)/100,Math.round(v.aging61_90*100)/100,Math.round(v.agingOver90*100)/100]);s&&a.push(["الإجمالي العام",`عدد العملاء: ${o.length}`,"","","","",Math.round(s.lastPaymentTotal*100)/100,"",Math.round(s.balance*100)/100,Math.round(s.current*100)/100,Math.round(s.aging1_30*100)/100,Math.round(s.aging31_60*100)/100,Math.round(s.aging61_90*100)/100,Math.round(s.agingOver90*100)/100]);const p=[6,30,12,18,15,14,16,16,20,18,16,16,16,18];try{await xt({title:d,headers:t,rows:a,colWidths:p})}catch(v){console.error("Export Aged Receivables Excel error:",v),alert("حدث خطأ أثناء التصدير: "+v.message)}};window.exportAgedReceivablesPDF=o=>{const s=o||ct||"full",d=window._agedReceivablesRows,t=window._agedReceivablesTotals;if(!d||d.length===0){window.showToast?window.showToast("لا توجد بيانات للطباعة","warning"):alert("لا توجد بيانات للطباعة");return}const a=window.ERP_COMPANY||{},p=a.name||"مؤسسة إدهام للمواد الغذائية",v=a.crNumber||a.commercialRegistration||"",y=a.vatNumber||a.taxNumber||"312448150500003",C=a.phone||a.mobile||"0549141648",l=a.logo||"icons/logo.png",P=document.getElementById("ar-rep-filter")?.value||"",$=P||"جميع المناديب",S=document.getElementById("ar-risk-filter"),m=S?.options[S.selectedIndex]?.text||"جميع المديونيات",u=new Date().toLocaleString("ar-SA-u-nu-latn",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!0}),g=s==="summary",c=g?"كشف مديونيات العملاء ومتابعة التحصيل":"تقرير مديونيات وأعمار ديون العملاء",w=window.open("","_blank");w.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>${c} — ${p}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        @page {
          size: A4 portrait;
          margin: 8mm 6mm 10mm 6mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: 'Cairo', system-ui, -apple-system, sans-serif;
          background: #fff;
          color: #0f172a;
          margin: 0;
          padding: 8px 12px;
          font-size: 11px;
          line-height: 1.35;
        }
        
        /* Company Header */
        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 10px;
          margin-bottom: 10px;
          border-bottom: 2px solid #1e3a8a;
          gap: 12px;
        }
        .co-info-right {
          flex: 1;
          text-align: right;
        }
        .co-name {
          font-size: 16px;
          font-weight: 900;
          color: #1e3a8a;
          margin: 0 0 3px 0;
        }
        .co-sub {
          font-size: 10px;
          color: #475569;
          line-height: 1.4;
        }
        .co-logo-center {
          text-align: center;
          flex: 0 0 auto;
        }
        .co-logo-img {
          max-height: 52px;
          max-width: 120px;
          object-fit: contain;
        }
        .report-badge-box {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 6px 10px;
          text-align: left;
          flex: 0 0 auto;
          font-size: 9.5px;
          min-width: 170px;
        }
        .report-badge-box div {
          margin-bottom: 2px;
        }
        
        .report-title-banner {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          color: #fff;
          text-align: center;
          padding: 6px 12px;
          border-radius: 6px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .report-title-banner h1 {
          margin: 0;
          font-size: 13.5px;
          font-weight: 800;
          letter-spacing: 0.2px;
        }
        .report-title-banner span {
          font-size: 10px;
          opacity: 0.9;
        }

        /* KPI Cards Strip */
        .kpi-grid {
          display: grid;
          grid-template-columns: ${g?"repeat(3, 1fr)":"repeat(6, 1fr)"};
          gap: 6px;
          margin-bottom: 10px;
        }
        .kpi-card {
          border-radius: 6px;
          padding: 6px 4px;
          text-align: center;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        .kpi-card.tot {
          background: #eff6ff;
          border-color: #93c5fd;
        }
        .kpi-card.c-curr {
          background: #f0fdf4;
          border-color: #86efac;
        }
        .kpi-card.c-30 {
          background: #fffbeb;
          border-color: #fde68a;
        }
        .kpi-card.c-60 {
          background: #fff7ed;
          border-color: #fed7aa;
        }
        .kpi-card.c-90 {
          background: #fef2f2;
          border-color: #fecaca;
        }
        .kpi-card.c-over90 {
          background: #450a0a;
          border-color: #b91c1c;
          color: #fff;
        }
        .kpi-lbl {
          font-size: 8.5px;
          font-weight: 700;
          margin-bottom: 2px;
          color: #475569;
        }
        .kpi-card.c-over90 .kpi-lbl {
          color: #fca5a5;
        }
        .kpi-val {
          font-size: 11.5px;
          font-weight: 800;
          font-family: monospace;
          color: #0f172a;
        }
        .kpi-card.tot .kpi-val { color: #1e3a8a; }
        .kpi-card.c-curr .kpi-val { color: #15803d; }
        .kpi-card.c-30 .kpi-val { color: #b45309; }
        .kpi-card.c-60 .kpi-val { color: #c2410c; }
        .kpi-card.c-90 .kpi-val { color: #b91c1c; }
        .kpi-card.c-over90 .kpi-val { color: #fff; }

        /* Main Data Table */
        table.ar-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
          margin-bottom: 12px;
          page-break-inside: auto;
        }
        thead {
          display: table-header-group;
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        th {
          background: #1e293b;
          color: #fff;
          font-weight: 700;
          padding: 6px 4px;
          text-align: center;
          border: 1px solid #334155;
          font-size: 9.5px;
        }
        th.th-cust {
          text-align: right;
          padding-right: 6px;
        }
        th.th-amt {
          text-align: left;
          padding-left: 5px;
        }
        td {
          padding: 5px 4px;
          border: 1px solid #cbd5e1;
          vertical-align: middle;
        }
        tbody tr:nth-child(even) {
          background: #f8fafc;
        }
        tbody tr:hover {
          background: #f1f5f9;
        }
        .cust-name {
          font-weight: 800;
          color: #0f172a;
          font-size: 10.5px;
          display: block;
        }
        .cust-code {
          font-size: 8.5px;
          color: #64748b;
          font-family: monospace;
          margin-top: 1px;
        }
        .rep-name {
          font-size: 9.5px;
          color: #334155;
          text-align: right;
        }
        .mono {
          font-family: monospace;
          font-size: 10px;
          text-align: left;
          white-space: nowrap;
        }
        .val-zero {
          color: #94a3b8;
          text-align: center;
        }
        .val-total {
          font-weight: 800;
          color: #1e3a8a;
        }
        .val-curr {
          color: #16a34a;
          font-weight: 700;
        }
        .val-30 {
          color: #d97706;
          font-weight: 700;
        }
        .val-60 {
          color: #ea580c;
          font-weight: 700;
        }
        .val-90 {
          color: #dc2626;
          font-weight: 700;
        }
        .val-over90 {
          color: #991b1b;
          font-weight: 900;
          background: #fee2e2;
          padding: 2px 4px;
          border-radius: 3px;
        }

        /* Footer Row */
        tfoot tr td {
          background: #e2e8f0;
          border-top: 2px solid #0f172a;
          border-bottom: 2px solid #0f172a;
          font-weight: 900;
          font-size: 10.5px;
          padding: 7px 4px;
        }

        /* Signatures Section */
        .signatures-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px dashed #cbd5e1;
          page-break-inside: avoid;
        }
        .sig-box {
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px 10px;
          background: #fafafa;
          min-height: 65px;
        }
        .sig-title {
          font-weight: 700;
          font-size: 10px;
          color: #1e293b;
          margin-bottom: 25px;
          text-align: center;
        }
        .sig-line {
          text-align: center;
          color: #94a3b8;
          font-size: 9px;
        }

        .print-btn-bar {
          text-align: center;
          margin: 10px 0 20px 0;
        }
        .btn-p {
          background: #1e3a8a;
          color: #fff;
          padding: 8px 24px;
          font-size: 14px;
          font-weight: 700;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        @media print {
          .print-btn-bar {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-btn-bar">
        <button class="btn-p" onclick="window.print()">🖨️ بدء الطباعة الآن (A4 رأسي — ${g?"موجز المديونيات":"تفصيلي الأعمار"})</button>
      </div>

      <!-- Header -->
      <div class="report-header">
        <div class="co-info-right">
          <div class="co-name">${p}</div>
          <div class="co-sub">
            ${v?`<span>س.ت: <b>${v}</b></span> • `:""}
            <span>الرقم الضريبي: <b>${y}</b></span><br>
            ${`<span>الهاتف: ${C}</span> • `}
            <span>المملكة العربية السعودية</span>
          </div>
        </div>
        <div class="co-logo-center">
          ${`<img src="${l}" class="co-logo-img" onerror="this.style.display='none'" />`}
        </div>
        <div class="report-badge-box">
          <div>📅 <b>تاريخ التقرير:</b> ${u}</div>
          <div>👤 <b>المندوب:</b> ${$}</div>
          <div>⏳ <b>الفئة:</b> ${m}</div>
          <div>👥 <b>العملاء المدينين:</b> ${d.length} عميل</div>
        </div>
      </div>

      <!-- Title Banner -->
      <div class="report-title-banner">
        <span>📄 نظام إدهام ERP — الإدارة المالية</span>
        <h1>⏳ ${c}</h1>
        <span>مطابق 100% لدفاتر الأستاذ</span>
      </div>

      <!-- KPI Summary -->
      <div class="kpi-grid">
        <div class="kpi-card tot">
          <div class="kpi-lbl">💰 إجمالي المديونيات المستحقة</div>
          <div class="kpi-val">${t.balance.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} ر.س</div>
        </div>
        <div class="kpi-card c-curr">
          <div class="kpi-lbl">💳 إجمالي آخر سدادات</div>
          <div class="kpi-val">${t.lastPaymentTotal.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} ر.س</div>
        </div>
        <div class="kpi-card ${g?"tot":"c-30"}">
          <div class="kpi-lbl">👥 إجمالي عدد العملاء</div>
          <div class="kpi-val">${d.length} عميل</div>
        </div>
        ${g?"":`
          <div class="kpi-card c-60">
            <div class="kpi-lbl">🟠 متأخر (31 - 60 يوم)</div>
            <div class="kpi-val">${t.aging31_60.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} ر.س</div>
          </div>
          <div class="kpi-card c-90">
            <div class="kpi-lbl">🔴 متأخر (61 - 90 يوم)</div>
            <div class="kpi-val">${t.aging61_90.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} ر.س</div>
          </div>
          <div class="kpi-card c-over90">
            <div class="kpi-lbl">⛔ متعثر (+90 يوم)</div>
            <div class="kpi-val">${t.agingOver90.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} ر.س</div>
          </div>
        `}
      </div>

      <!-- Table -->
      <table class="ar-table">
        <thead>
          ${g?`
            <tr>
              <th style="width:24px;">#</th>
              <th class="th-cust" style="width:190px;">👤 اسم العميل والبيانات</th>
              <th style="width:75px;">المندوب</th>
              <th style="width:36px;">المهلة</th>
              <th class="th-amt" style="width:105px;">💳 آخر سداد (تاريخ ومبلغ)</th>
              <th class="th-amt" style="width:95px;">💰 إجمالي المديونية</th>
              <th style="width:135px;">✍️ ملاحظات التحصيل / التوقيع</th>
            </tr>
          `:`
            <tr>
              <th style="width:24px;">#</th>
              <th class="th-cust" style="width:145px;">👤 العميل</th>
              <th style="width:55px;">المندوب</th>
              <th style="width:28px;">المهلة</th>
              <th class="th-amt" style="width:68px;">💰 الإجمالي</th>
              <th class="th-amt" style="width:75px;">💳 آخر سداد</th>
              <th class="th-amt" style="width:52px;">🟢 جاري</th>
              <th class="th-amt" style="width:52px;">🟡 1 - 30</th>
              <th class="th-amt" style="width:52px;">🟠 31 - 60</th>
              <th class="th-amt" style="width:52px;">🔴 61 - 90</th>
              <th class="th-amt" style="width:56px;">⛔ +90</th>
            </tr>
          `}
        </thead>
        <tbody>
          ${g?d.map((r,k)=>`
            <tr>
              <td style="text-align:center; color:#64748b; font-size:9px;">${k+1}</td>
              <td>
                <span class="cust-name">${r.name}</span>
                <span class="cust-code">${r.code?`كود: ${r.code}`:""} ${r.phone?`• جوال: ${r.phone}`:""}</span>
              </td>
              <td class="rep-name">${r.repName}</td>
              <td style="text-align:center; font-size:9px; font-family:monospace;">${r.creditDays?`${r.creditDays}ي`:"—"}</td>
              <td>
                ${r.lastPaymentAmount>0?`
                  <div class="mono" style="font-weight:800; color:#059669; font-size:10.5px;">${r.lastPaymentAmount.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} ر.س</div>
                  <div style="font-size:8.5px; color:#64748b; font-family:monospace;">${r.lastPaymentDate}</div>
                `:'<span class="val-zero mono">—</span>'}
              </td>
              <td class="mono val-total" style="font-size:11px;">${r.balance.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} ر.س</td>
              <td style="border-bottom:1px dashed #cbd5e1; height:24px;"></td>
            </tr>
          `).join(""):d.map((r,k)=>`
            <tr>
              <td style="text-align:center; color:#64748b; font-size:9px;">${k+1}</td>
              <td>
                <span class="cust-name">${r.name}</span>
                ${r.code?`<span class="cust-code">كود: ${r.code}</span>`:""}
              </td>
              <td class="rep-name">${r.repName}</td>
              <td style="text-align:center; font-size:9px; font-family:monospace;">${r.creditDays?`${r.creditDays}ي`:"—"}</td>
              <td class="mono val-total">${r.balance.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
              <td>
                ${r.lastPaymentAmount>0?`
                  <div class="mono" style="font-weight:700; color:#059669; font-size:9.5px;">${r.lastPaymentAmount.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                  <div style="font-size:8px; color:#64748b; font-family:monospace;">${r.lastPaymentDate}</div>
                `:'<span class="val-zero mono">—</span>'}
              </td>
              <td class="mono ${r.current>0?"val-curr":"val-zero"}">${r.current>0?r.current.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}):"—"}</td>
              <td class="mono ${r.aging1_30>0?"val-30":"val-zero"}">${r.aging1_30>0?r.aging1_30.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}):"—"}</td>
              <td class="mono ${r.aging31_60>0?"val-60":"val-zero"}">${r.aging31_60>0?r.aging31_60.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}):"—"}</td>
              <td class="mono ${r.aging61_90>0?"val-90":"val-zero"}">${r.aging61_90>0?r.aging61_90.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}):"—"}</td>
              <td class="mono ${r.agingOver90>0?"val-over90":"val-zero"}">${r.agingOver90>0?r.agingOver90.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}):"—"}</td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          ${g?`
            <tr>
              <td colspan="4" style="text-align:right; font-weight:900;">الإجمالي العام (${d.length} عميل)</td>
              <td class="mono" style="color:#059669; font-weight:900;">${t.lastPaymentTotal.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} ر.س</td>
              <td class="mono val-total" style="font-size:12px;">${t.balance.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})} ر.س</td>
              <td></td>
            </tr>
          `:`
            <tr>
              <td colspan="4" style="text-align:right; font-weight:900;">الإجمالي العام (${d.length} عميل)</td>
              <td class="mono val-total">${t.balance.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
              <td class="mono" style="color:#059669;">${t.lastPaymentTotal.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
              <td class="mono val-curr">${t.current.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
              <td class="mono val-30">${t.aging1_30.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
              <td class="mono val-60">${t.aging31_60.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
              <td class="mono val-90">${t.aging61_90.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
              <td class="mono val-over90" style="background:#fee2e2;">${t.agingOver90.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
            </tr>
          `}
        </tfoot>
      </table>

      <!-- Signatures -->
      <div class="signatures-grid">
        <div class="sig-box">
          <div class="sig-title">المحاسب المسؤول</div>
          <div class="sig-line">____________________</div>
        </div>
        <div class="sig-box">
          <div class="sig-title">المدير المالي</div>
          <div class="sig-line">____________________</div>
        </div>
        <div class="sig-box">
          <div class="sig-title">الاعتماد والختم الرسمي</div>
          <div class="sig-line">____________________</div>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      <\/script>
    </body>
    </html>
  `),w.document.close()};async function qt(o,s,d){o.innerHTML='<div class="page-loading"><div class="loading-spinner"></div><span>جارٍ تحليل بيانات وأداء العملاء…</span></div>';try{it||(it=await Y(Z.salesInvoices())),gt||(gt=await Y(Z.receipts()));let t=[];try{t=await Y(Z.salesReturns?Z.salesReturns():"salesReturns")}catch{}const a=window.custperfRep||"",p=Math.max(1,Math.round((new Date(d)-new Date(s))/864e5)+1),v=it.filter(e=>!(e.status==="cancelled"||e.date<s||e.date>d)),y=(t||[]).filter(e=>!(e.status==="cancelled"||e.status==="void"||e.date<s||e.date>d)),C=gt.filter(e=>!(!e.date||e.date<s||e.date>d||e.entityType&&e.entityType!=="customer")),[l,P]=await Promise.all([Y(Z.customers()),Y(Z.deliveryNotes()).catch(()=>[])]),$={},S={};it.forEach(e=>{if(e.status!=="cancelled"){const n=e.customerId;n&&($[n]=($[n]||0)+parseFloat(e.totalWithVat||e.total||0))}}),(P||[]).forEach(e=>{if(e.status!=="cancelled"&&e.status!=="void"&&e.status!=="converted_to_invoice"){const n=e.customerId;n&&($[n]=($[n]||0)+parseFloat(e.totalAmount||e.grandTotal||e.total||0))}}),gt.forEach(e=>{if(e.status!=="cancelled"&&(!e.entityType||e.entityType==="customer")){const n=e.targetId||e.customerId;n&&(S[n]=(S[n]||0)+parseFloat(e.amount||0))}}),(t||[]).forEach(e=>{if(e.status!=="cancelled"&&e.status!=="void"){const n=e.customerId;n&&(S[n]=(S[n]||0)+parseFloat(e.totalWithVat||e.total||0))}});const m={};l.forEach(e=>{const n=parseFloat(e.openingBalance||0),b=$[e.id]||0,T=S[e.id]||0,x=Math.round((n+b-T)*100)/100;m[e.id]={id:e.id,name:e.name,repName:e.repName||"بدون مندوب",currentTotalDebt:x,invoiceCount:0,returnCount:0,subtotalSales:0,vatSales:0,totalSales:0,totalCost:0,paidAmount:0,collectedViaReceipts:0,lastInvoiceDate:"",lastReceiptDate:"",repsSet:new Set(e.repName?[e.repName]:[])}});const u=await Y(Z.products()),g={};u.forEach(e=>{g[e.id]=e,e.name&&(g[e.name]=e)});const c=e=>{const n=e.lines||e.items||[];if(n.length===0)return parseFloat(e.totalCost||0);let b=0;return n.forEach(T=>{const x=parseFloat(T.qty||T.quantity||1),f=g[T.productId]||g[T.productName]||g[T.name],z=parseFloat(T.purchasePrice!==void 0&&T.purchasePrice>0?T.purchasePrice:T.unitCost!==void 0&&T.unitCost>0?T.unitCost:T.costPrice!==void 0&&T.costPrice>0?T.costPrice:f?.avgCostPrice||f?.costPrice||f?.lastPurchasePrice||0);b+=x*z}),b};for(const e of v){const n=e.customerId||"unknown";m[n]||(m[n]={id:n,name:e.customerName||n,repName:e.repName||"بدون مندوب",currentTotalDebt:0,invoiceCount:0,returnCount:0,subtotalSales:0,vatSales:0,totalSales:0,totalCost:0,paidAmount:0,collectedViaReceipts:0,lastInvoiceDate:"",lastReceiptDate:"",repsSet:new Set});const b=m[n];b.invoiceCount++,e.repName&&b.repsSet.add(e.repName);const T=parseFloat(e.totalWithVat||e.total||0),x=parseFloat(e.subtotal!==void 0?e.subtotal:T/1.15),f=parseFloat(e.vat!==void 0?e.vat:e.taxAmount!==void 0?e.taxAmount:T-x),z=c(e);b.totalSales+=T,b.subtotalSales+=x,b.vatSales+=f,b.totalCost+=z;const I=(e.paymentMethod||"cash").toLowerCase();(I==="cash"||I==="نقدي"||I==="partial"||I==="جزئي")&&(b.paidAmount+=parseFloat(e.paidAmount||0)),(!b.lastInvoiceDate||e.date>b.lastInvoiceDate)&&(b.lastInvoiceDate=e.date)}for(const e of y){const n=e.customerId||"unknown";if(m[n]){const b=m[n];b.returnCount++,e.repName&&b.repsSet.add(e.repName);const T=parseFloat(e.totalWithVat||e.total||0),x=parseFloat(e.subtotal!==void 0?e.subtotal:T/1.15),f=parseFloat(e.vat!==void 0?e.vat:e.totalVat!==void 0?e.totalVat:e.vatAmount!==void 0?e.vatAmount:T-x),z=c(e);b.totalSales-=T,b.subtotalSales-=x,b.vatSales-=f,b.totalCost-=z}}for(const e of C){const n=e.targetId||e.customerId||"";m[n]&&(m[n].collectedViaReceipts+=parseFloat(e.amount||0),(!m[n].lastReceiptDate||e.date>m[n].lastReceiptDate)&&(m[n].lastReceiptDate=e.date))}const w=(P||[]).filter(e=>!(e.status==="cancelled"||e.status==="void"||e.status==="converted_to_invoice"||e.date<s||e.date>d));for(const e of w){const n=e.customerId||"";if(m[n]){const b=m[n],T=parseFloat(e.totalAmount||e.grandTotal||e.total||0),x=T/1.15,f=T-x,z=c(e);b.totalSales+=T,b.subtotalSales+=x,b.vatSales+=f,b.totalCost+=z,(!b.lastInvoiceDate||e.date>b.lastInvoiceDate)&&(b.lastInvoiceDate=e.date)}}const r=document.getElementById("custperf-rep");if(r){const e=[...new Set([...it.map(b=>b.repName).filter(Boolean),...l.map(b=>b.repName).filter(Boolean)])].filter(b=>b!=="اختر المندوب"&&b!=="بدون مندوب"&&b.trim()!=="").sort(),n=window.custperfRep||"";r.innerHTML='<option value="">كل المناديب</option>'+e.map(b=>`<option value="${b}" ${n===b?"selected":""}>${b}</option>`).join("")}N=Object.values(m).filter(e=>{if(a){const n=e.repName===a||e.repName&&e.repName.includes(a),b=e.repsSet&&(e.repsSet.has(a)||[...e.repsSet].some(T=>T.includes(a)));return(n||b)&&(Math.abs(e.totalSales)>.001||e.collectedViaReceipts>0||e.invoiceCount>0)}return Math.abs(e.totalSales)>.001||e.collectedViaReceipts>0}).map(e=>{const n=e.subtotalSales,b=n-e.totalCost,T=n>0?b/n*100:0,x=e.totalCost>0?b/e.totalCost*100:0,f=e.totalSales>0?b/e.totalSales*100:0,z=e.collectedViaReceipts+e.paidAmount,I=Math.max(0,Math.round((e.totalSales-z)*100)/100),F=e.totalSales>0?z/e.totalSales*100:z>0?100:0,B=e.totalSales/p,h=e.invoiceCount>0?e.totalSales/e.invoiceCount:0,D=e.repsSet&&e.repsSet.size>1;return{...e,netRevenue:n,profit:b,profitPct:T,markupPct:x,grossProfitMargin:f,collected:z,remainingAmount:I,collectionPct:F,dailyAvg:B,avgInvoice:h,isMultiRep:D}});const k=window.custperfProfitFilter||"all";k==="loss"?N=N.filter(e=>e.profit<0):k==="low"?N=N.filter(e=>e.profitPct<3):k==="good"&&(N=N.filter(e=>e.profitPct>=3)),window.custperfSortKey||(window.custperfSortKey="totalSales",window.custperfSortDir="desc"),Bt(),Kt(o,s,d,p,a)}catch(t){o.innerHTML='<div class="alert bad">خطأ في تحميل بيانات العملاء: '+t.message+"</div>",console.error(t)}}function Bt(){const o=window.custperfSortKey,s=window.custperfSortDir==="asc"?1:-1;N.sort((d,t)=>{let a=d[o],p=t[o];if(o==="lastInvoiceDate"||o==="lastReceiptDate")a=a?new Date(a).getTime():0,p=p?new Date(p).getTime():0,isNaN(a)&&(a=0),isNaN(p)&&(p=0);else if(typeof a=="string")return a.localeCompare(p,"ar")*s;return a<p?-1*s:a>p?1*s:0})}window.toggleCustPerfSort=o=>{window.custperfSortKey===o?window.custperfSortDir=window.custperfSortDir==="desc"?"asc":"desc":(window.custperfSortKey=o,window.custperfSortDir="desc"),Bt();const s=document.getElementById("custperf-table-wrapper"),d=document.getElementById("custperf-kpi-wrapper"),t=document.getElementById("custperf-champs-wrapper");s&&d&&t&&$t(s,d,t)};function Kt(o,s,d,t,a){o.innerHTML=(window.getCompanyPrintHeaderHTML?window.getCompanyPrintHeaderHTML("تقرير أداء العملاء","الفترة من "+s+" إلى "+d):"")+'<div class="print-header no-print" style="text-align:center;margin-bottom:20px;"><h2 style="margin:0;font-size:20px;">🏆 تقرير أداء وربحية العملاء والتحصيل</h2><p style="color:var(--text-2);margin:4px 0 0;">من '+s+" إلى "+d+" ("+t+" يوم)"+(a?" • مندوب: "+a:"")+'</p></div><div id="custperf-kpi-wrapper"></div><div id="custperf-champs-wrapper"></div><div id="custperf-table-wrapper"></div>';const p=document.getElementById("custperf-table-wrapper"),v=document.getElementById("custperf-kpi-wrapper"),y=document.getElementById("custperf-champs-wrapper");$t(p,v,y)}const bt={lastInvoiceDate:!0,lastReceiptDate:!0,invoiceCount:!0,subtotalSales:!0,vatSales:!1,totalSales:!0,totalCost:!0,profit:!0,profitPct:!0,collected:!0,remainingAmount:!0,currentTotalDebt:!0,collectionPct:!0,dailyAvg:!1,avgInvoice:!1,profitKpi:!0};function Yt(){try{const o=localStorage.getItem("idham_custperf_cols_v2");if(o)return{...bt,...JSON.parse(o)}}catch{}return{...bt}}function At(o){try{localStorage.setItem("idham_custperf_cols_v2",JSON.stringify(o))}catch{}}window.custperfCols=Yt();window.toggleCustPerfCol=o=>{window.custperfCols[o]=!window.custperfCols[o],At(window.custperfCols),Pt();const s=document.getElementById("custperf-table-wrapper"),d=document.getElementById("custperf-kpi-wrapper"),t=document.getElementById("custperf-champs-wrapper");s&&d&&t&&$t(s,d,t)};window.setCustPerfPreset=o=>{o==="rep"?(window.custperfCols.totalCost=!1,window.custperfCols.profit=!1,window.custperfCols.profitPct=!1,window.custperfCols.profitKpi=!1,window.custperfCols.subtotalSales=!1,window.custperfCols.vatSales=!1,window.custperfCols.lastInvoiceDate=!0,window.custperfCols.lastReceiptDate=!0,window.custperfCols.invoiceCount=!0,window.custperfCols.totalSales=!0,window.custperfCols.collected=!0,window.custperfCols.remainingAmount=!0,window.custperfCols.currentTotalDebt=!0,window.custperfCols.collectionPct=!0,window.custperfCols.dailyAvg=!0,window.custperfCols.avgInvoice=!0):o==="all"?Object.keys(window.custperfCols).forEach(a=>window.custperfCols[a]=!0):o==="minimal"&&(window.custperfCols.lastInvoiceDate=!1,window.custperfCols.lastReceiptDate=!1,window.custperfCols.invoiceCount=!0,window.custperfCols.subtotalSales=!0,window.custperfCols.vatSales=!1,window.custperfCols.totalSales=!0,window.custperfCols.totalCost=!0,window.custperfCols.profit=!0,window.custperfCols.profitPct=!0,window.custperfCols.profitKpi=!0,window.custperfCols.collected=!0,window.custperfCols.remainingAmount=!0,window.custperfCols.currentTotalDebt=!0,window.custperfCols.collectionPct=!0,window.custperfCols.dailyAvg=!1,window.custperfCols.avgInvoice=!1),At(window.custperfCols),Pt();const s=document.getElementById("custperf-table-wrapper"),d=document.getElementById("custperf-kpi-wrapper"),t=document.getElementById("custperf-champs-wrapper");s&&d&&t&&$t(s,d,t)};window.toggleCustPerfColMenu=o=>{o&&o.stopPropagation();const s=document.getElementById("custperf-col-dropdown");if(!s)return;s.style.display==="block"?s.style.display="none":(Pt(),s.style.display="block")};function Pt(){const o=document.getElementById("custperf-col-dropdown");if(!o)return;const s=window.custperfCols,d=[{key:"subtotalSales",label:"المبيعات (قبل الضريبة)",icon:"🏷️"},{key:"vatSales",label:"الضريبة (15%)",icon:"📑"},{key:"totalSales",label:"المبيعات (شامل الضريبة)",icon:"💵"},{key:"totalCost",label:"التكلفة (خاص)",icon:"🔒"},{key:"profit",label:"مجمل الربح (ر.س) (خاص)",icon:"💰"},{key:"profitPct",label:"هامش الربح % (خاص)",icon:"📈"},{key:"collected",label:"المحصّل للفترة",icon:"✅"},{key:"remainingAmount",label:"المتبقي للفترة",icon:"⏳"},{key:"currentTotalDebt",label:"المديونية الكلية للعميل",icon:"💼"},{key:"collectionPct",label:"نسبة التحصيل",icon:"📊"},{key:"invoiceCount",label:"عدد الفواتير",icon:"📄"},{key:"lastInvoiceDate",label:"تاريخ آخر فاتورة",icon:"📅"},{key:"lastReceiptDate",label:"تاريخ آخر تحصيل",icon:"💰"},{key:"dailyAvg",label:"المعدل اليومي",icon:"📈"},{key:"avgInvoice",label:"متوسط الفاتورة",icon:"🧾"},{key:"profitKpi",label:"كروت الأرباح العلوية (خاص)",icon:"🔒"}];o.innerHTML=`
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
      ${d.map(t=>`
        <label style="display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer; padding:4px 6px; border-radius:4px; transition:background .15s;" onmouseover="this.style.background='var(--bg-2)'" onmouseout="this.style.background=''">
          <input type="checkbox" ${s[t.key]?"checked":""} onchange="toggleCustPerfCol('${t.key}')" style="cursor:pointer;" />
          <span>${t.icon} ${t.label}</span>
        </label>
      `).join("")}
    </div>
  `}window._custperfClickListenerAdded||(document.addEventListener("click",o=>{const s=document.getElementById("custperf-col-dropdown"),d=document.getElementById("btn-custperf-cols");s&&s.style.display==="block"&&!s.contains(o.target)&&!d?.contains(o.target)&&(s.style.display="none")}),window._custperfClickListenerAdded=!0);function $t(o,s,d){const t=window.custperfCols||bt,a=N.reduce((n,b)=>(n.sales+=b.totalSales,n.subtotal+=b.subtotalSales,n.vat+=b.vatSales,n.cost+=b.totalCost,n.profit+=b.profit,n.collected+=b.collected,n.remaining+=b.remainingAmount,n.totalDebt+=b.currentTotalDebt,n.invoices+=b.invoiceCount,n),{sales:0,subtotal:0,vat:0,cost:0,profit:0,collected:0,remaining:0,totalDebt:0,invoices:0}),p=a.subtotal>0?a.profit/a.subtotal*100:0,v=a.cost>0?a.profit/a.cost*100:0,y=a.sales>0?Math.min(100,a.collected/a.sales*100):a.collected>0?100:0,C=document.getElementById("fin-from")?.value,l=document.getElementById("fin-to")?.value,P=Math.max(1,Math.round((new Date(l||pt())-new Date(C||ft()))/864e5)+1),$=a.sales/P,S=[...N].sort((n,b)=>b.totalSales-n.totalSales)[0],m=[...N].sort((n,b)=>b.profit-n.profit)[0],u=[...N].sort((n,b)=>b.collectionPct-n.collectionPct)[0],g=n=>n>=80?{color:"#10b981",bg:"rgba(16,185,129,.12)",icon:"🟢"}:n>=50?{color:"#f59e0b",bg:"rgba(245,158,11,.12)",icon:"🟡"}:{color:"#ef4444",bg:"rgba(239,68,68,.12)",icon:"🔴"},c=n=>(Math.round((n||0)*100)/100).toFixed(2),w=n=>{if(!n)return"—";const b=n.split("-");return b.length===3?`${b[2]}-${b[1]}-${b[0]}`:n};s.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:20px;">
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #6366f1;">
        <div style="font-size:10.5px;color:var(--text-3);margin-bottom:4px;font-weight:700;">إجمالي المبيعات (شامل الضريبة)</div>
        <div style="font-size:17px;font-weight:900;font-family:monospace;color:#6366f1;">${i(a.sales)}</div>
        <div style="font-size:10px;color:var(--text-2);margin-top:4px;">قبل الضريبة: ${i(a.subtotal)}</div>
      </div>
      ${t.profitKpi?`
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #10b981;">
        <div style="font-size:10.5px;color:var(--text-3);margin-bottom:4px;font-weight:700;">مجمل الأرباح (صافي المبيعات)</div>
        <div style="font-size:17px;font-weight:900;font-family:monospace;color:#10b981;">${i(a.profit)}</div>
        <div style="font-size:10px;color:var(--text-2);margin-top:4px;">هامش ربح ${p>=0?"+":""}${c(p)}% • عائد ${v>=0?"+":""}${c(v)}%</div>
      </div>`:""}
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #3b82f6;">
        <div style="font-size:10.5px;color:var(--text-3);margin-bottom:4px;font-weight:700;">إجمالي التحصيل للفترة</div>
        <div style="font-size:17px;font-weight:900;font-family:monospace;color:#3b82f6;">${i(a.collected)}</div>
        <div style="font-size:10px;color:var(--text-2);margin-top:4px;">نسبة التحصيل ${c(y)}%</div>
      </div>
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #f59e0b;">
        <div style="font-size:10.5px;color:var(--text-3);margin-bottom:4px;font-weight:700;">متبقي فواتير الفترة</div>
        <div style="font-size:17px;font-weight:900;font-family:monospace;color:#f59e0b;">${i(a.remaining)}</div>
        <div style="font-size:10px;color:var(--text-2);margin-top:4px;">المديونية الكلية: ${i(a.totalDebt)}</div>
      </div>
      <div class="card" style="padding:16px;text-align:center;border-top:3px solid #8b5cf6;">
        <div style="font-size:10.5px;color:var(--text-3);margin-bottom:4px;font-weight:700;">المعدل اليومي</div>
        <div style="font-size:17px;font-weight:900;font-family:monospace;color:#8b5cf6;">${i(a.dailyAvg)}</div>
        <div style="font-size:10px;color:var(--text-2);margin-top:4px;">${a.invoices} فاتورة • ${N.length} عميل</div>
      </div>
    </div>
  `,d.innerHTML=S||t.profitKpi&&m||u?`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:20px;">
      ${S&&S.totalSales>0?`<div class="card" style="padding:12px 16px;display:flex;align-items:center;gap:12px;border:1px solid rgba(99,102,241,.3);"><span style="font-size:28px;">🥇</span><div><div style="font-size:10px;color:#6366f1;font-weight:700;margin-bottom:2px;">الأعلى مبيعاً</div><div style="font-weight:700;font-size:13px;">${S.name}</div><div style="font-size:11px;color:var(--text-2);">${i(S.totalSales)}</div></div></div>`:""}
      ${t.profitKpi&&m&&m.profit>0?`<div class="card" style="padding:12px 16px;display:flex;align-items:center;gap:12px;border:1px solid rgba(16,185,129,.3);"><span style="font-size:28px;">💰</span><div><div style="font-size:10px;color:#10b981;font-weight:700;margin-bottom:2px;">الأعلى ربحاً (صافي)</div><div style="font-weight:700;font-size:13px;">${m.name}</div><div style="font-size:11px;color:var(--text-2);">${i(m.profit)} <span style="display:inline-block;padding:1px 5px;border-radius:4px;font-size:10px;font-weight:700;background:rgba(16,185,129,.15);color:#10b981;direction:ltr;">+${c(m.profitPct)}%</span></div></div></div>`:""}
      ${u&&u.collectionPct>0?`<div class="card" style="padding:12px 16px;display:flex;align-items:center;gap:12px;border:1px solid rgba(59,130,246,.3);"><span style="font-size:28px;">🏅</span><div><div style="font-size:10px;color:#3b82f6;font-weight:700;margin-bottom:2px;">الأفضل تحصيلاً</div><div style="font-weight:700;font-size:13px;">${u.name}</div><div style="font-size:11px;color:var(--text-2);">${c(u.collectionPct)}%</div></div></div>`:""}
    </div>
  `:"";const r=n=>window.custperfSortKey!==n?' <span style="font-size:9px;color:var(--text-3);opacity:0.5;">↕</span>':window.custperfSortDir==="asc"?' <span style="font-size:10px;color:var(--brand);">▲</span>':' <span style="font-size:10px;color:var(--brand);">▼</span>',k=N.map((n,b)=>{const T=g(n.collectionPct);return`<tr style="border-bottom:1px solid rgba(255,255,255,.04); transition:background .15s;" onmouseover="this.style.background='rgba(255,255,255,.03)'" onmouseout="this.style.background=''">
      <td style="padding:10px 8px;text-align:center;color:var(--text-3);">${b+1}</td>
      <td style="padding:10px 8px;"><div style="font-weight:700;font-size:13px;cursor:pointer;color:var(--brand);" onclick="window.navigate && window.navigate('customer-statement'); setTimeout(()=>{ if(window.selectCustomerForStmt) window.selectCustomerForStmt('${n.id}'); },300);">${n.name}</div><div style="font-size:10px;color:var(--text-3);margin-top:2px;">مندوب: ${n.repName}${n.isMultiRep?` <span style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:9px;background:rgba(99,102,241,.15);color:#6366f1;font-weight:bold;" title="فواتير هذا العميل مسجلة من عدة جهات/المستودع: ${Array.from(n.repsSet||[]).join("، ")}">مشترك 🔄</span>`:""}</div></td>
      ${t.lastInvoiceDate?`<td style="padding:10px 8px;text-align:center;color:var(--text-2);white-space:nowrap;">${w(n.lastInvoiceDate)}</td>`:""}
      ${t.lastReceiptDate?`<td style="padding:10px 8px;text-align:center;color:var(--text-2);white-space:nowrap;">${w(n.lastReceiptDate)}</td>`:""}
      ${t.invoiceCount?`<td style="padding:10px 8px;text-align:center;color:var(--text-2);">${n.invoiceCount}</td>`:""}
      ${t.subtotalSales?`<td style="padding:10px 8px;text-align:right;font-family:monospace;color:var(--text-1);">${i(n.subtotalSales)}</td>`:""}
      ${t.vatSales?`<td style="padding:10px 8px;text-align:right;font-family:monospace;color:var(--text-3);">${i(n.vatSales)}</td>`:""}
      ${t.totalSales?`<td style="padding:10px 8px;text-align:right;font-family:monospace;font-weight:700;color:var(--text-0);">${i(n.totalSales)}</td>`:""}
      ${t.totalCost?`<td style="padding:10px 8px;text-align:right;font-family:monospace;color:var(--text-2);">${i(n.totalCost)}</td>`:""}
      ${t.profit?`
      <td style="padding:10px 8px;text-align:right;font-family:monospace;color:${n.profit>=0?"#10b981":"#ef4444"};font-weight:700;">
        ${i(n.profit)}
      </td>`:""}
      ${t.profitPct?`
      <td style="padding:10px 8px;text-align:center;">
        <span style="display:inline-block;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:800;font-family:monospace;background:${n.profitPct<0?"rgba(239,68,68,.12)":n.profitPct<3?"rgba(245,158,11,.12)":"rgba(16,185,129,.12)"};color:${n.profitPct<0?"#ef4444":n.profitPct<3?"#f59e0b":"#10b981"};direction:ltr;" title="هامش الربح من المبيعات قبل الضريبة: ${c(n.profitPct)}% | العائد على التكلفة: ${c(n.markupPct)}%">
          ${n.profit>=0?"+":""}${c(n.profitPct)}%
        </span>
      </td>`:""}
      ${t.collected?`<td style="padding:10px 8px;text-align:right;font-family:monospace;color:#10b981;">${i(n.collected)}</td>`:""}
      ${t.remainingAmount?`<td style="padding:10px 8px;text-align:right;font-family:monospace;color:${n.remainingAmount>0?"#f59e0b":"var(--text-3)"};">${n.remainingAmount>0?i(n.remainingAmount):"—"}</td>`:""}
      ${t.currentTotalDebt?`
      <td style="padding:10px 8px;text-align:right;font-family:monospace;font-weight:700;color:${n.currentTotalDebt>0?"#ef4444":"#10b981"};">
        ${i(n.currentTotalDebt)}
      </td>`:""}
      ${t.collectionPct?`
      <td style="padding:10px 8px;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:5px;background:${T.bg};color:${T.color};padding:4px 10px;border-radius:20px;font-weight:700;font-size:12px;">
          ${T.icon} ${c(n.collectionPct)}%
        </div>
      </td>`:""}
      ${t.dailyAvg?`<td style="padding:10px 8px;text-align:right;font-family:monospace;color:var(--text-2);">${i(n.dailyAvg)}</td>`:""}
      ${t.avgInvoice?`<td style="padding:10px 8px;text-align:right;font-family:monospace;color:var(--text-2);">${i(n.avgInvoice)}</td>`:""}
    </tr>`}).join(""),e=2+(t.lastInvoiceDate?1:0)+(t.lastReceiptDate?1:0);o.innerHTML=`
    <div class="table-container" style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr style="background:var(--bg-2);border-bottom:2px solid var(--border);user-select:none;">
            <th style="padding:10px 8px;text-align:center;">#</th>
            <th onclick="toggleCustPerfSort('name')" style="padding:10px 8px;text-align:right;cursor:pointer;">العميل${r("name")}</th>
            ${t.lastInvoiceDate?`<th onclick="toggleCustPerfSort('lastInvoiceDate')" style="padding:10px 8px;text-align:center;cursor:pointer;white-space:nowrap;">آخر فاتورة${r("lastInvoiceDate")}</th>`:""}
            ${t.lastReceiptDate?`<th onclick="toggleCustPerfSort('lastReceiptDate')" style="padding:10px 8px;text-align:center;cursor:pointer;white-space:nowrap;">آخر تحصيل${r("lastReceiptDate")}</th>`:""}
            ${t.invoiceCount?`<th onclick="toggleCustPerfSort('invoiceCount')" style="padding:10px 8px;text-align:center;cursor:pointer;white-space:nowrap;">الفواتير${r("invoiceCount")}</th>`:""}
            ${t.subtotalSales?`<th onclick="toggleCustPerfSort('subtotalSales')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;" title="صافي قيمة المبيعات بدون ضريبة">المبيعات (قبل الضريبة)${r("subtotalSales")}</th>`:""}
            ${t.vatSales?`<th onclick="toggleCustPerfSort('vatSales')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;" title="ضريبة القيمة المضافة 15%">الضريبة (15%)${r("vatSales")}</th>`:""}
            ${t.totalSales?`<th onclick="toggleCustPerfSort('totalSales')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;" title="المبلغ الإجمالي شامل الضريبة المطالب به العميل">المبيعات (شامل)${r("totalSales")}</th>`:""}
            ${t.totalCost?`<th onclick="toggleCustPerfSort('totalCost')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;" title="تكلفة البضاعة المباعة COGS">التكلفة${r("totalCost")}</th>`:""}
            ${t.profit?`<th onclick="toggleCustPerfSort('profit')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;" title="مجمل الربح = المبيعات قبل الضريبة - التكلفة">مجمل الربح (ر.س)${r("profit")}</th>`:""}
            ${t.profitPct?`<th onclick="toggleCustPerfSort('profitPct')" style="padding:10px 8px;text-align:center;cursor:pointer;white-space:nowrap;" title="نسبة هامش الربح = مجمل الربح / المبيعات قبل الضريبة">هامش الربح %${r("profitPct")}</th>`:""}
            ${t.collected?`<th onclick="toggleCustPerfSort('collected')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">المحصّل للفترة${r("collected")}</th>`:""}
            ${t.remainingAmount?`<th onclick="toggleCustPerfSort('remainingAmount')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;" title="متبقي فواتير الفترة = مبيعات الفترة شامل الضريبة - محصل الفترة">متبقي الفترة${r("remainingAmount")}</th>`:""}
            ${t.currentTotalDebt?`<th onclick="toggleCustPerfSort('currentTotalDebt')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;" title="رصيد العميل الحالي الإجمالي من واقع دفتر الأستاذ وكشف الحساب">المديونية الكلية${r("currentTotalDebt")}</th>`:""}
            ${t.collectionPct?`<th onclick="toggleCustPerfSort('collectionPct')" style="padding:10px 8px;text-align:center;cursor:pointer;white-space:nowrap;">نسبة التحصيل${r("collectionPct")}</th>`:""}
            ${t.dailyAvg?`<th onclick="toggleCustPerfSort('dailyAvg')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">معدل يومي${r("dailyAvg")}</th>`:""}
            ${t.avgInvoice?`<th onclick="toggleCustPerfSort('avgInvoice')" style="padding:10px 8px;text-align:right;cursor:pointer;white-space:nowrap;">متوسط الفاتورة${r("avgInvoice")}</th>`:""}
          </tr>
        </thead>
        <tbody>
          ${N.length===0?'<tr><td colspan="17" style="text-align:center;padding:40px;color:var(--text-2);">لا توجد بيانات للفترة المختارة</td></tr>':k}
        </tbody>
        <tfoot>
          <tr style="background:var(--bg-2);border-top:2px solid var(--border);font-weight:900;">
            <td colspan="${e}" style="padding:12px 8px;">الإجمالي (${N.length} عميل)</td>
            ${t.invoiceCount?`<td style="padding:12px 8px;text-align:center;">${a.invoices}</td>`:""}
            ${t.subtotalSales?`<td style="padding:12px 8px;text-align:right;font-family:monospace;color:var(--text-1);">${i(a.subtotal)}</td>`:""}
            ${t.vatSales?`<td style="padding:12px 8px;text-align:right;font-family:monospace;color:var(--text-3);">${i(a.vat)}</td>`:""}
            ${t.totalSales?`<td style="padding:12px 8px;text-align:right;font-family:monospace;color:#6366f1;">${i(a.sales)}</td>`:""}
            ${t.totalCost?`<td style="padding:12px 8px;text-align:right;font-family:monospace;">${i(a.cost)}</td>`:""}
            ${t.profit?`<td style="padding:12px 8px;text-align:right;font-family:monospace;color:${a.profit>=0?"#10b981":"#ef4444"};font-weight:900;">${i(a.profit)}</td>`:""}
            ${t.profitPct?`<td style="padding:12px 8px;text-align:center;"><span style="display:inline-block;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:900;font-family:monospace;background:rgba(16,185,129,.15);color:#10b981;direction:ltr;">${a.profit>=0?"+":""}${c(p)}%</span></td>`:""}
            ${t.collected?`<td style="padding:12px 8px;text-align:right;font-family:monospace;color:#10b981;">${i(a.collected)}</td>`:""}
            ${t.remainingAmount?`<td style="padding:12px 8px;text-align:right;font-family:monospace;color:#f59e0b;">${i(a.remaining)}</td>`:""}
            ${t.currentTotalDebt?`<td style="padding:12px 8px;text-align:right;font-family:monospace;color:#ef4444;">${i(a.totalDebt)}</td>`:""}
            ${t.collectionPct?`<td style="padding:12px 8px;text-align:center;font-weight:900;color:${y>=80?"#10b981":y>=50?"#f59e0b":"#ef4444"};">${c(y)}%</td>`:""}
            ${t.dailyAvg?`<td style="padding:12px 8px;text-align:right;font-family:monospace;color:#8b5cf6;">${i($)}</td>`:""}
            ${t.avgInvoice?`<td style="padding:12px 8px;text-align:right;font-family:monospace;">${i(a.invoices>0?a.sales/a.invoices:0)}</td>`:""}
          </tr>
        </tfoot>
      </table>
    </div>
    <div class="no-print" style="display:flex;gap:20px;margin-top:14px;font-size:11px;color:var(--text-3);flex-wrap:wrap;">
      <span>🟢 تحصيل ممتاز (≥80%)</span><span>🟡 تحصيل متوسط (50–79%)</span><span>🔴 تحصيل ضعيف (&lt;50%)</span>
      <span style="margin-right:auto;color:var(--text-2);">💡 <b>ملاحظة محاسبية:</b> نسبة هامش الربح تُحتسب على المبيعات قبل الضريبة (صافي الإيراد) وفقاً للمعايير المحاسبية المعتمدة.</span>
    </div>
  `}window.exportCustPerfExcel=async()=>{if(!N||N.length===0){alert("لا توجد بيانات لتصديرها");return}const o=window.custperfCols||bt,s=document.getElementById("fin-from")?.value||"",d=document.getElementById("fin-to")?.value||"",t=window.custperfRep?` (مندوب: ${window.custperfRep})`:"",a=`تقرير أداء وربحية العملاء للفترة من ${s} إلى ${d}${t}`,p=["#","اسم العميل","المندوب"],v=[6,32,20];o.lastInvoiceDate&&(p.push("آخر فاتورة"),v.push(14)),o.lastReceiptDate&&(p.push("آخر تحصيل"),v.push(14)),o.invoiceCount&&(p.push("عدد الفواتير"),v.push(12)),o.subtotalSales&&(p.push("المبيعات (قبل الضريبة)"),v.push(22)),o.vatSales&&(p.push("الضريبة (15%)"),v.push(16)),o.totalSales&&(p.push("المبيعات (شامل)"),v.push(20)),o.totalCost&&(p.push("التكلفة"),v.push(18)),o.profit&&(p.push("مجمل الربح (ر.س)"),v.push(18)),o.profitPct&&(p.push("هامش الربح %","العائد على التكلفة %"),v.push(14,16)),o.collected&&(p.push("المحصل للفترة"),v.push(18)),o.remainingAmount&&(p.push("متبقي الفترة"),v.push(18)),o.currentTotalDebt&&(p.push("المديونية الكلية"),v.push(20)),o.collectionPct&&(p.push("نسبة التحصيل %"),v.push(16)),o.dailyAvg&&(p.push("المعدل اليومي"),v.push(16)),o.avgInvoice&&(p.push("متوسط الفاتورة"),v.push(16));const y=N.map((m,u)=>{const g=[u+1,m.name,m.repName+(m.isMultiRep?" (مشترك)":"")];return o.lastInvoiceDate&&g.push(m.lastInvoiceDate||"—"),o.lastReceiptDate&&g.push(m.lastReceiptDate||"—"),o.invoiceCount&&g.push(m.invoiceCount),o.subtotalSales&&g.push(Math.round(m.subtotalSales*100)/100),o.vatSales&&g.push(Math.round(m.vatSales*100)/100),o.totalSales&&g.push(Math.round(m.totalSales*100)/100),o.totalCost&&g.push(Math.round(m.totalCost*100)/100),o.profit&&g.push(Math.round(m.profit*100)/100),o.profitPct&&g.push(`${(Math.round(m.profitPct*100)/100).toFixed(2)}%`,`${(Math.round(m.markupPct*100)/100).toFixed(2)}%`),o.collected&&g.push(Math.round(m.collected*100)/100),o.remainingAmount&&g.push(Math.round(m.remainingAmount*100)/100),o.currentTotalDebt&&g.push(Math.round(m.currentTotalDebt*100)/100),o.collectionPct&&g.push(`${(Math.round(m.collectionPct*100)/100).toFixed(2)}%`),o.dailyAvg&&g.push(Math.round(m.dailyAvg*100)/100),o.avgInvoice&&g.push(Math.round(m.avgInvoice*100)/100),g}),C=N.reduce((m,u)=>(m.sales+=u.totalSales,m.subtotal+=u.subtotalSales,m.vat+=u.vatSales,m.cost+=u.totalCost,m.profit+=u.profit,m.collected+=u.collected,m.remaining+=u.remainingAmount,m.totalDebt+=u.currentTotalDebt,m.invoices+=u.invoiceCount,m),{sales:0,subtotal:0,vat:0,cost:0,profit:0,collected:0,remaining:0,totalDebt:0,invoices:0}),l=C.subtotal>0?C.profit/C.subtotal*100:0,P=C.cost>0?C.profit/C.cost*100:0,$=C.sales>0?Math.min(100,C.collected/C.sales*100):0,S=["الإجمالي",`عدد العملاء: ${N.length}`,""];o.lastInvoiceDate&&S.push(""),o.lastReceiptDate&&S.push(""),o.invoiceCount&&S.push(C.invoices),o.subtotalSales&&S.push(Math.round(C.subtotal*100)/100),o.vatSales&&S.push(Math.round(C.vat*100)/100),o.totalSales&&S.push(Math.round(C.sales*100)/100),o.totalCost&&S.push(Math.round(C.cost*100)/100),o.profit&&S.push(Math.round(C.profit*100)/100),o.profitPct&&S.push(`${l.toFixed(2)}%`,`${P.toFixed(2)}%`),o.collected&&S.push(Math.round(C.collected*100)/100),o.remainingAmount&&S.push(Math.round(C.remaining*100)/100),o.currentTotalDebt&&S.push(Math.round(C.totalDebt*100)/100),o.collectionPct&&S.push(`${$.toFixed(2)}%`),o.dailyAvg&&S.push(""),o.avgInvoice&&S.push(""),y.push(S);try{await xt({title:a,headers:p,rows:y,colWidths:v})}catch(m){console.error("Export Excel error:",m),alert("حدث خطأ أثناء تصدير ملف Excel: "+m.message)}};window.exportCustPerfPDF=()=>{if(!N||N.length===0){alert("لا توجد بيانات للطباعة");return}const o=window.custperfCols||bt,s=document.getElementById("fin-from")?.value||"",d=document.getElementById("fin-to")?.value||"",t=window.custperfRep||"",a=window.custperfProfitFilter||"all",p=a==="loss"?"🔴 العملاء ذوي الربح السالب (خسارة)":a==="low"?"🟡 العملاء ذوي الهامش المنخفض (أقل من 3%)":a==="good"?"🟢 العملاء ذوي الهامش الممتاز (≥ 3%)":"كل المستويات",v=window.ERP_COMPANY||{name:"مؤسسة إدهام للمواد الغذائية",vatNumber:"312448150500003",crNumber:"4030456789",phone:"0549141648"},y=N.reduce((u,g)=>(u.sales+=g.totalSales,u.subtotal+=g.subtotalSales,u.vat+=g.vatSales,u.cost+=g.totalCost,u.profit+=g.profit,u.collected+=g.collected,u.remaining+=g.remainingAmount,u.totalDebt+=g.currentTotalDebt,u.invoices+=g.invoiceCount,u),{sales:0,subtotal:0,vat:0,cost:0,profit:0,collected:0,remaining:0,totalDebt:0,invoices:0}),C=y.subtotal>0?y.profit/y.subtotal*100:0;y.cost>0&&y.profit/y.cost*100;const l=y.sales>0?Math.min(100,y.collected/y.sales*100):0,P=u=>(Math.round((u||0)*100)/100).toFixed(2),$=u=>(Math.round((u||0)*100)/100).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}),S=u=>{if(!u)return"—";const g=u.split("-");return g.length===3?`${g[2]}-${g[1]}-${g[0]}`:u},m=window.open("","_blank","width=1200,height=800");if(!m){alert("يرجى السماح بالنوافذ المنبثقة لطباعة التقرير");return}m.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>تقرير أداء وربحية العملاء — ${s} إلى ${d}</title>
      <style>
        @page { size: A4 landscape; margin: 8mm 6mm; }
        * { box-sizing: border-box; }
        body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; background:#fff; color:#0f172a; margin:0; padding:10px; font-size:10px; line-height:1.3; }
        .header-grid { display:grid; grid-template-columns: 1fr auto 1fr; gap:12px; align-items:center; border-bottom:2px solid #0f172a; padding-bottom:8px; margin-bottom:10px; }
        .co-info { font-size:9.5px; color:#334155; }
        .co-name { font-size:14px; font-weight:900; color:#0f172a; margin-bottom:2px; }
        .rep-title { text-align:center; }
        .rep-title h1 { margin:0; font-size:15px; font-weight:900; color:#1e1b4b; }
        .rep-title .sub { font-size:10px; color:#475569; margin-top:2px; }
        .meta-box { font-size:9px; text-align:left; color:#334155; border:1px solid #cbd5e1; padding:6px 8px; border-radius:6px; background:#f8fafc; }
        
        .kpi-strip { display:grid; grid-template-columns:repeat(5, 1fr); gap:8px; margin-bottom:10px; }
        .kpi-box { padding:6px 8px; border-radius:6px; background:#f8fafc; border:1px solid #e2e8f0; text-align:center; }
        .kpi-box .lbl { font-size:8.5px; color:#64748b; font-weight:700; }
        .kpi-box .val { font-size:12px; font-weight:900; font-family:monospace; margin-top:2px; }

        table { width:100%; border-collapse:collapse; font-size:9.5px; }
        th { background:#f1f5f9; color:#0f172a; font-weight:800; border:1px solid #cbd5e1; padding:5px 4px; text-align:center; white-space:nowrap; }
        td { border:1px solid #e2e8f0; padding:4px 5px; vertical-align:middle; }
        tr:nth-child(even) { background:#fafafa; }
        .mono { font-family:monospace; }
        .num { text-align:left; font-family:monospace; }
        .badge-pct { display:inline-block; padding:1px 5px; border-radius:4px; font-size:8.5px; font-weight:800; font-family:monospace; direction:ltr; }
        .badge-green { background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; }
        .badge-red { background:#fee2e2; color:#b91c1c; border:1px solid #fecaca; }
        .badge-yellow { background:#fef3c7; color:#b45309; border:1px solid #fde68a; }
        
        tfoot tr { background:#e2e8f0 !important; font-weight:900; border-top:2px solid #0f172a; }
        tfoot td { border:1px solid #94a3b8; padding:6px 5px; font-size:10px; }

        .sigs { display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; margin-top:20px; padding-top:10px; border-top:1px solid #cbd5e1; text-align:center; font-size:9.5px; }
        .sig-box { padding:6px; }
        .sig-line { margin-top:30px; border-bottom:1px dashed #94a3b8; }
      </style>
    </head>
    <body onload="window.print();">
      <div class="header-grid">
        <div class="co-info">
          <div class="co-name">${v.name}</div>
          <div>الرقم الضريبي: <b>${v.vatNumber||"—"}</b></div>
          <div>السجل التجاري: <b>${v.crNumber||"—"}</b></div>
          <div>الهاتف: ${v.phone||"—"}</div>
        </div>
        <div class="rep-title">
          <h1>📊 تقرير أداء وربحية العملاء والتحصيل</h1>
          <div class="sub">الفترة من <b>${s}</b> إلى <b>${d}</b></div>
          <div style="font-size:9.5px; color:#2563eb; margin-top:2px; font-weight:700;">
            ${t?`👤 المندوب: ${t}`:"👥 كل المناديب"} • ${p}
          </div>
        </div>
        <div class="meta-box">
          <div>📅 تاريخ الطباعة: <b>${new Date().toLocaleDateString("ar-SA")}</b></div>
          <div>👥 عدد العملاء بالتقرير: <b>${N.length}</b></div>
          <div>📄 إجمالي الفواتير: <b>${y.invoices}</b></div>
        </div>
      </div>

      <div class="kpi-strip">
        <div class="kpi-box" style="border-top:2px solid #6366f1;">
          <div class="lbl">إجمالي المبيعات (قبل الضريبة)</div>
          <div class="val" style="color:#6366f1;">${$(y.subtotal)} ر.س</div>
        </div>
        ${o.profit||o.profitPct?`
        <div class="kpi-box" style="border-top:2px solid #10b981;">
          <div class="lbl">مجمل الأرباح (صافي)</div>
          <div class="val" style="color:${y.profit>=0?"#10b981":"#ef4444"};">${$(y.profit)} ر.س</div>
          <div style="font-size:8px; font-weight:800; color:${C>=0?"#10b981":"#ef4444"};">هامش: ${C>=0?"+":""}${P(C)}%</div>
        </div>
        `:""}
        <div class="kpi-box" style="border-top:2px solid #0284c7;">
          <div class="lbl">المحصل للفترة</div>
          <div class="val" style="color:#0284c7;">${$(y.collected)} ر.س</div>
          <div style="font-size:8px; color:#0284c7; font-weight:700;">تحصيل: ${P(l)}%</div>
        </div>
        <div class="kpi-box" style="border-top:2px solid #f59e0b;">
          <div class="lbl">متبقي فواتير الفترة</div>
          <div class="val" style="color:#f59e0b;">${$(y.remaining)} ر.س</div>
        </div>
        <div class="kpi-box" style="border-top:2px solid #ef4444;">
          <div class="lbl">المديونية الكلية المستحقة</div>
          <div class="val" style="color:#ef4444;">${$(y.totalDebt)} ر.س</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:22px;">#</th>
            <th style="text-align:right;">العميل</th>
            <th style="width:75px;">المندوب</th>
            ${o.lastInvoiceDate?'<th style="width:65px;">آخر فاتورة</th>':""}
            ${o.invoiceCount?'<th style="width:36px;">الفواتير</th>':""}
            ${o.subtotalSales?'<th style="width:75px;">المبيعات (قبل الضريبة)</th>':""}
            ${o.vatSales?'<th style="width:60px;">الضريبة</th>':""}
            ${o.totalSales?'<th style="width:75px;">المبيعات (شامل)</th>':""}
            ${o.totalCost?'<th style="width:70px;">التكلفة</th>':""}
            ${o.profit?'<th style="width:70px;">مجمل الربح</th>':""}
            ${o.profitPct?'<th style="width:65px;">هامش الربح %</th>':""}
            ${o.collected?'<th style="width:70px;">المحصل</th>':""}
            ${o.remainingAmount?'<th style="width:70px;">المتبقي</th>':""}
            ${o.currentTotalDebt?'<th style="width:75px;">المديونية الكلية</th>':""}
            ${o.collectionPct?'<th style="width:60px;">التحصيل %</th>':""}
          </tr>
        </thead>
        <tbody>
          ${N.map((u,g)=>{const c=u.profitPct<0?"badge-red":u.profitPct<3?"badge-yellow":"badge-green",w=u.collectionPct>=80?"badge-green":u.collectionPct>=50?"badge-yellow":"badge-red";return`
            <tr>
              <td style="text-align:center; color:#64748b;">${g+1}</td>
              <td style="font-weight:700; font-size:10px;">${u.name}</td>
              <td style="text-align:center; color:#475569; font-size:9px;">${u.repName}${u.isMultiRep?" (مشترك)":""}</td>
              ${o.lastInvoiceDate?`<td style="text-align:center; font-family:monospace; font-size:8.5px;">${S(u.lastInvoiceDate)}</td>`:""}
              ${o.invoiceCount?`<td style="text-align:center; font-weight:700;">${u.invoiceCount}</td>`:""}
              ${o.subtotalSales?`<td class="num">${$(u.subtotalSales)}</td>`:""}
              ${o.vatSales?`<td class="num" style="color:#64748b;">${$(u.vatSales)}</td>`:""}
              ${o.totalSales?`<td class="num" style="font-weight:700;">${$(u.totalSales)}</td>`:""}
              ${o.totalCost?`<td class="num" style="color:#475569;">${$(u.totalCost)}</td>`:""}
              ${o.profit?`<td class="num" style="font-weight:700; color:${u.profit>=0?"#15803d":"#b91c1c"};">${$(u.profit)}</td>`:""}
              ${o.profitPct?`
                <td style="text-align:center;">
                  <span class="badge-pct ${c}">
                    ${u.profit>=0?"+":""}${P(u.profitPct)}%
                  </span>
                </td>
              `:""}
              ${o.collected?`<td class="num" style="color:#15803d;">${$(u.collected)}</td>`:""}
              ${o.remainingAmount?`<td class="num" style="color:${u.remainingAmount>0?"#b45309":"#64748b"};">${u.remainingAmount>0?$(u.remainingAmount):"—"}</td>`:""}
              ${o.currentTotalDebt?`<td class="num" style="font-weight:700; color:${u.currentTotalDebt>0?"#b91c1c":"#15803d"};">${$(u.currentTotalDebt)}</td>`:""}
              ${o.collectionPct?`
                <td style="text-align:center;">
                  <span class="badge-pct ${w}">${P(u.collectionPct)}%</span>
                </td>
              `:""}
            </tr>
            `}).join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="text-align:right;">الإجمالي (${N.length} عميل)</td>
            ${o.lastInvoiceDate?"<td></td>":""}
            ${o.invoiceCount?`<td style="text-align:center;">${y.invoices}</td>`:""}
            ${o.subtotalSales?`<td class="num">${$(y.subtotal)}</td>`:""}
            ${o.vatSales?`<td class="num">${$(y.vat)}</td>`:""}
            ${o.totalSales?`<td class="num">${$(y.sales)}</td>`:""}
            ${o.totalCost?`<td class="num">${$(y.cost)}</td>`:""}
            ${o.profit?`<td class="num" style="font-weight:900; color:${y.profit>=0?"#15803d":"#b91c1c"};">${$(y.profit)}</td>`:""}
            ${o.profitPct?`
              <td style="text-align:center;">
                <span class="badge-pct badge-green">${y.profit>=0?"+":""}${P(C)}%</span>
              </td>
            `:""}
            ${o.collected?`<td class="num" style="color:#15803d;">${$(y.collected)}</td>`:""}
            ${o.remainingAmount?`<td class="num" style="color:#b45309;">${$(y.remaining)}</td>`:""}
            ${o.currentTotalDebt?`<td class="num" style="color:#b91c1c;">${$(y.totalDebt)}</td>`:""}
            ${o.collectionPct?`
              <td style="text-align:center;">
                <span class="badge-pct badge-green">${P(l)}%</span>
              </td>
            `:""}
          </tr>
        </tfoot>
      </table>

      <div class="sigs">
        <div class="sig-box">
          <b>إعداد المحاسب المسؤول</b>
          <div class="sig-line"></div>
        </div>
        <div class="sig-box">
          <b>تدقيق ومراجعة الإدارة المالية</b>
          <div class="sig-line"></div>
        </div>
        <div class="sig-box">
          <b>اعتماد المدير العام / مجلس الإدارة</b>
          <div class="sig-line"></div>
        </div>
      </div>
    </body>
    </html>
  `),m.document.close()};export{ae as render};
