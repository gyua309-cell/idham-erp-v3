import{g as R,a as B,f as r,d as G,C as Q,G as Dt}from"./index-ClmVJz2W.js";import{orderBy as wt,getDocs as dt,collection as it,where as $t,doc as St,updateDoc as At}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let C=[],L=[],z=[];async function Ut(g,d){L=await R(B.salesReps(),[wt("name")]).catch(()=>[]),C=await R(B.products(),[wt("name")]).catch(()=>[]),g.innerHTML=Nt();const n=document.getElementById("planner-product-select");n&&(n.innerHTML='<option value="">-- اختر صنف --</option>'+C.map(y=>`<option value="${y.id}" data-price="${y.salePrice||0}">${y.name} (${r(y.salePrice)})</option>`).join(""));const i=document.getElementById("daily-rep-select");i&&(i.innerHTML='<option value="">-- الكل (بدون تحديد) --</option>'+L.map(y=>`<option value="${y.id}">${y.name}</option>`).join(""));const s=document.getElementById("kpi-filter-from"),l=document.getElementById("kpi-filter-to");if(s&&l){const y=new Date,$=new Date(y.getFullYear(),y.getMonth(),1),I=v=>{const P=v.getFullYear(),a=String(v.getMonth()+1).padStart(2,"0"),w=String(v.getDate()).padStart(2,"0");return`${P}-${a}-${w}`};s.value=I($),l.value=I(y)}const x=document.getElementById("daily-report-from"),b=document.getElementById("daily-report-to"),f=new Date().toISOString().split("T")[0];x&&(x.value=f),b&&(b.value=f),window.openTargetPlanner=Wt,window.addProductToPlannerMix=Ht,window.removeProductFromPlannerMix=Kt,window.recalculatePlannerDaily=U,window.updateMixRowWeight=Vt,window.switchRepTab=kt,window.loadRepDailyReport=It,window.setKpiRange=Ft,window.loadRepPerformance=rt,kt("kpis")}function Nt(){return`
    <div class="page-content">
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom: 24px;">
        <div>
          <h1 class="page-title" style="margin:0;">🏆 تقارير وأداء المناديب</h1>
          <p class="page-subtitle" style="margin:4px 0 0;">متابعة أداء المبيعات، نسب إنجاز الأهداف، والتقرير اليومي التفصيلي</p>
        </div>
        
        <!-- Tab switcher -->
        <div class="no-print" style="display:flex; background:var(--bg-2); padding:4px; border-radius:10px; border:1px solid var(--border-soft);">
          <button class="btn btn-sm" id="tab-rep-kpis" onclick="switchRepTab('kpis')" style="border-radius:8px; padding:6px 16px; border:none; cursor:pointer;">📊 تقييم الأهداف (KPIs)</button>
          <button class="btn btn-sm" id="tab-rep-daily" onclick="switchRepTab('daily')" style="border-radius:8px; padding:6px 16px; border:none; cursor:pointer;">📑 التقرير اليومي التفصيلي</button>
        </div>
      </div>

      <!-- Tab 1: KPIs -->
      <div id="rep-kpis-tab-content">
        <!-- Filter bar for KPIs -->
        <div class="filterbar no-print" style="margin-bottom:20px; display:flex; gap:12px; align-items:center; flex-wrap:wrap; background:var(--bg-2); padding:16px; border-radius:12px; border:1px solid var(--border-soft);">
          <div class="form-group" style="margin:0; width:180px;">
            <label style="font-size:11px; margin-bottom:4px; display:block; font-weight:bold;">البداية</label>
            <input type="date" id="kpi-filter-from" class="input" style="height:38px;" onchange="loadRepPerformance()" />
          </div>
          <div class="form-group" style="margin:0; width:180px;">
            <label style="font-size:11px; margin-bottom:4px; display:block; font-weight:bold;">النهاية</label>
            <input type="date" id="kpi-filter-to" class="input" style="height:38px;" onchange="loadRepPerformance()" />
          </div>
          <div class="quick-filters" style="margin:0; border:none; background:transparent; display:flex; gap:4px; align-items:center; height:38px; margin-top:20px;">
            <button class="btn btn-secondary btn-sm" onclick="setKpiRange('month')">هذا الشهر</button>
            <button class="btn btn-secondary btn-sm" onclick="setKpiRange('last_month')">الشهر السابق</button>
            <button class="btn btn-secondary btn-sm" onclick="setKpiRange('year')">هذه السنة</button>
          </div>
          <div style="margin-right:auto; display:flex; gap:8px; align-items:center; height:38px; margin-top:20px;">
            <button class="btn btn-primary" onclick="loadRepPerformance(true)">🔄 تحديث</button>
          </div>
        </div>

        <div class="grid-2 gap-20" id="perf-cards">
          <div class="page-loading"><div class="loading-spinner"></div></div>
        </div>
      </div>

      <!-- Tab 2: Daily Report -->
      <div id="rep-daily-tab-content" class="hidden">
        <!-- Filter bar -->
        <div class="filterbar no-print" style="margin-bottom:20px; display:flex; gap:12px; align-items:center; flex-wrap:wrap; background:var(--bg-2); padding:16px; border-radius:12px; border:1px solid var(--border-soft);">
          <div class="form-group" style="margin:0; width:180px;">
            <label style="font-size:11px; margin-bottom:4px; display:block; font-weight:bold;">المندوب</label>
            <select id="daily-rep-select" class="input" style="height:38px;" onchange="loadRepDailyReport()"></select>
          </div>
          <div class="form-group" style="margin:0; width:150px;">
            <label style="font-size:11px; margin-bottom:4px; display:block; font-weight:bold;">التاريخ من</label>
            <input type="date" id="daily-report-from" class="input" style="height:38px;" onchange="loadRepDailyReport()" />
          </div>
          <div class="form-group" style="margin:0; width:150px;">
            <label style="font-size:11px; margin-bottom:4px; display:block; font-weight:bold;">التاريخ إلى</label>
            <input type="date" id="daily-report-to" class="input" style="height:38px;" onchange="loadRepDailyReport()" />
          </div>
          <div style="margin-right:auto; display:flex; gap:8px; margin-top:20px;">
            <button class="btn btn-secondary" onclick="window.print()">🖨️ طباعة التقرير</button>
            <button class="btn btn-primary" id="update-report-btn" onclick="loadRepDailyReport(true)">🔄 تحديث</button>
          </div>
        </div>

        <!-- Daily Report Results -->
        <div id="daily-report-results">
          <div class="page-loading"><div class="loading-spinner"></div></div>
        </div>
      </div>
    </div>

    <!-- target planner modal -->
    <div class="modal-overlay" id="target-planner-modal">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">مخطط التحميل اليومي والأهداف للمندوب: <span id="planner-rep-name" style="color:var(--brand);"></span></h3>
          <button class="modal-close" onclick="closeModal('target-planner-modal')">×</button>
        </div>
        <div class="modal-body">
          <div class="grid-3 gap-16 mb-20" style="background:var(--bg-2); padding:16px; border-radius:var(--radius-md);">
            <div class="form-group">
              <label>الهدف الشهري المالي (ر.س) *</label>
              <input type="number" id="planner-monthly-target" class="input mono" oninput="recalculatePlannerDaily()" />
            </div>
            <div class="form-group">
              <label>عدد أيام العمل في الشهر</label>
              <input type="number" id="planner-work-days" class="input mono" value="26" oninput="recalculatePlannerDaily()" />
            </div>
            <div class="form-group" style="display:flex; flex-direction:column; justify-content:center;">
              <span class="text-2" style="font-size:12px; margin-bottom:4px;">المبيعات اليومية المطلوبة</span>
              <span class="mono font-bold text-indigo" id="planner-daily-needed" style="font-size:18px;">0.00 ر.س</span>
            </div>
          </div>

          <h4 class="mb-12 font-heading" style="font-size:14px; border-bottom:1px solid var(--border-soft); padding-bottom:6px;">تخطيط الكراتين اليومية بناءً على مزيج المنتجات</h4>
          <p class="text-2 mb-12" style="font-size:11px;">حدد المنتجات ونسبة مساهمة كل منتج في تحقيق الهدف اليومي لمعرفة عدد الكراتين المطلوبة يومياً.</p>

          <div style="display:flex; gap:12px; align-items:flex-end; margin-bottom:16px;" class="no-print">
            <div class="form-group" style="flex:1;">
              <label>اختر المنتج لإضافته للمزيج</label>
              <select id="planner-product-select" class="input">
                <option value="">-- اختر صنف --</option>
              </select>
            </div>
            <button class="btn btn-secondary" onclick="addProductToPlannerMix()">إضافة للمزيج</button>
          </div>

          <div class="table-container">
            <table class="data-dense">
              <thead>
                <tr>
                  <th>الصنف</th>
                  <th>سعر بيع الكرتونة / الوحدة</th>
                  <th style="width:120px;">نسبة المساهمة (%)</th>
                  <th>الهدف اليومي المالي (ر.س)</th>
                  <th style="color:var(--brand);">الكراتين المطلوبة يومياً</th>
                  <th class="no-print"></th>
                </tr>
              </thead>
              <tbody id="planner-mix-tbody">
                <tr><td colspan="6" style="text-align:center; padding:16px; color:var(--text-2);">لا توجد أصناف في مزيج الأهداف بعد</td></tr>
              </tbody>
              <tfoot>
                <tr style="background:var(--bg-2); font-weight:bold;">
                  <td>الإجمالي</td>
                  <td>—</td>
                  <td id="planner-total-weight-cell" class="mono">0%</td>
                  <td id="planner-total-amount-cell" class="mono">0.00 ر.س</td>
                  <td id="planner-total-cartons-cell" class="mono text-brand">0 كرتونة</td>
                  <td class="no-print">—</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div id="planner-weight-warning" class="alert bad hidden" style="margin-top:12px; font-size:12px; padding:8px 12px;">
            ⚠️ مجموع نسب المساهمة يجب أن يساوي 100% (المجموع الحالي: <span id="planner-current-weight-sum">0</span>%)
          </div>
        </div>
        <div class="modal-footer no-print">
          <button class="btn btn-ghost" onclick="closeModal('target-planner-modal')">إغلاق</button>
          <button class="btn btn-primary" onclick="window.print()">🖨️ طباعة مخطط التحميل</button>
        </div>
      </div>
    </div>
  `}function Ft(g){const d=document.getElementById("kpi-filter-from"),n=document.getElementById("kpi-filter-to");if(!d||!n)return;const i=new Date,s=l=>{const x=l.getFullYear(),b=String(l.getMonth()+1).padStart(2,"0"),f=String(l.getDate()).padStart(2,"0");return`${x}-${b}-${f}`};if(g==="month"){const l=new Date(i.getFullYear(),i.getMonth(),1);d.value=s(l),n.value=s(i)}else if(g==="last_month"){const l=new Date(i.getFullYear(),i.getMonth()-1,1),x=new Date(i.getFullYear(),i.getMonth(),0);d.value=s(l),n.value=s(x)}else if(g==="year"){const l=new Date(i.getFullYear(),0,1);d.value=s(l),n.value=s(i)}rt()}function kt(g){const d=document.getElementById("rep-kpis-tab-content"),n=document.getElementById("rep-daily-tab-content"),i=document.getElementById("tab-rep-kpis"),s=document.getElementById("tab-rep-daily");!d||!n||!i||!s||(g==="kpis"?(d.classList.remove("hidden"),n.classList.add("hidden"),i.style.background="var(--brand)",i.style.color="#ffffff",i.style.fontWeight="bold",s.style.background="transparent",s.style.color="var(--text-1)",s.style.fontWeight="normal",rt()):(d.classList.add("hidden"),n.classList.remove("hidden"),s.style.background="var(--brand)",s.style.color="#ffffff",s.style.fontWeight="bold",i.style.background="transparent",i.style.color="var(--text-1)",i.style.fontWeight="normal",It()))}async function rt(g=!1){const d=document.getElementById("perf-cards");if(d)try{const n=L,i=document.getElementById("kpi-filter-from")?.value||"",s=document.getElementById("kpi-filter-to")?.value||"",[l,x,b]=await Promise.all([R(B.salesInvoices()),R(B.receipts()),R(B.customers())]),f=l.filter(a=>(!i||a.date>=i)&&(!s||a.date<=s)&&a.status!=="cancelled"),y=x.filter(a=>(!i||a.date>=i)&&(!s||a.date<=s)&&a.entityType==="customer"),$={};b.forEach(a=>{$[a.id]=a.repId||null});const I={},v={},P={};if(f.forEach(a=>{a.repId&&(I[a.repId]=(I[a.repId]||0)+(a.totalWithVat||0),v[a.repId]=(v[a.repId]||0)+(a.amountPaid||a.paidAmount||0),P[a.repId]=(P[a.repId]||0)+1)}),y.forEach(a=>{const w=$[a.targetId];w&&(v[w]=(v[w]||0)+(a.amount||0))}),n.length===0){d.innerHTML='<div class="empty-state" style="grid-column:span 2;"><div class="empty-icon">🏆</div><h3>لا يوجد مناديب مسجلون</h3></div>';return}d.innerHTML=n.map(a=>{const w=I[a.id]||0,T=v[a.id]||0,X=P[a.id]||0,D=a.monthlyTarget||1,F=w/D*100,S=w<D?1:a.commissionRate||0,V=T*(S/100),M=Dt(F);return`
        <div class="card" style="padding:24px;">
          <div class="flex items-center justify-between mb-16">
            <div class="flex items-center gap-12">
              <div class="user-avatar" style="width:48px;height:48px;font-size:20px;background:var(--brand-soft);color:var(--brand);">${a.name[0]}</div>
              <div>
                <h3 style="font-family:var(--font-heading);font-size:16px;">${a.name}</h3>
                <div class="text-2" style="font-size:12px;">المسار: ${a.zone||"غير محدد"}</div>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
              <span class="badge ${M}" style="font-size:12px;padding:4px 12px;">${F.toFixed(0)}% من الهدف</span>
              <button class="btn btn-ghost sm no-print" onclick="openTargetPlanner('${a.id}','${a.name.replace(/'/g,"\\'")}',${D})" style="font-size:11px; padding:2px 8px; color:var(--brand);">🎯 مخطط التحميل اليومي</button>
            </div>
          </div>

          <div class="mb-20">
            <div class="flex justify-between mb-6" style="font-size:12px;">
              <span class="text-2">المبيعات الحالية / الهدف الشهري</span>
              <span class="mono font-bold text-${M}">${r(w)} / ${r(D)}</span>
            </div>
            <div class="progress-bar" style="height:10px;">
              <div class="fill ${M}" style="width:${Math.min(F,100)}%;"></div>
            </div>
          </div>

          <div class="grid-3 gap-12" style="font-size:12px;text-align:center;">
            <div style="background:var(--bg-2);padding:12px;border-radius:var(--radius-sm);">
              <div class="text-2 mb-4">عدد الفواتير</div>
              <div class="mono font-bold" style="font-size:16px;">${X}</div>
            </div>
            <div style="background:var(--bg-2);padding:12px;border-radius:var(--radius-sm);">
              <div class="text-2 mb-4">المبلغ المحصل</div>
              <div class="mono font-bold text-good" style="font-size:14px;">${r(T)}</div>
            </div>
            <div style="background:var(--bg-2);padding:12px;border-radius:var(--radius-sm);">
              <div class="text-2 mb-4">العمولة المستحقة</div>
              <div class="mono font-bold text-indigo" style="font-size:14px;">${r(V)}</div>
            </div>
          </div>
        </div>`}).join("")}catch(n){d.innerHTML=`<div class="alert bad">${n.message}</div>`}}async function It(g=!1){const d=document.getElementById("daily-report-results");if(!d)return;d.innerHTML='<div class="page-loading"><div class="loading-spinner"></div><span>جارٍ إعداد التقرير اليومي للمبيعات والتحصيلات...</span></div>';const n=document.getElementById("daily-rep-select")?.value||"",i=new Date().toISOString().split("T")[0],s=document.getElementById("daily-report-from")?.value||i,l=document.getElementById("daily-report-to")?.value||i;try{const[x,b,f,y,$,I,v,P,a]=await Promise.all([R(B.salesInvoices()),R(B.receipts()),dt(it(G,`companies/${Q}/customers`)).then(t=>t.docs.map(e=>({id:e.id,...e.data()}))),R(B.salesReturns?B.salesReturns():"salesReturns").catch(()=>[]),R(B.employees()),R(B.journalEntries(),[$t("date",">=","2026-08-01")]).catch(()=>[]),R(B.chartOfAccounts(),[$t("parentCode","==","1-1-2-1-2")]).catch(()=>[]),dt(it(G,`companies/${Q}/employeeLoans`)).catch(()=>({docs:[]})),dt(it(G,`companies/${Q}/collections`)).then(t=>t.docs.map(e=>({id:e.id,...e.data()}))).catch(()=>[])]),w=(P.docs||[]).map(t=>({id:t.id,...t.data()})),T={},X=x.filter(t=>t.status!=="cancelled"),D=(y||[]).filter(t=>t.status!=="cancelled"),F=b.filter(t=>t.entityType==="customer");for(const t of f){let e=parseFloat(t.openingBalance||0);X.filter(o=>o.customerId===t.id).forEach(o=>{e+=parseFloat(o.totalWithVat||o.total||0)}),D.filter(o=>o.customerId===t.id).forEach(o=>{e-=parseFloat(o.totalWithVat!==void 0?o.totalWithVat:o.total!==void 0?o.total:o.subtotal||0)}),F.filter(o=>o.targetId===t.id).forEach(o=>{e-=parseFloat(o.amount||0)}),(a||[]).filter(o=>o.customerId===t.id).forEach(o=>{e-=parseFloat(o.amount||0)}),T[t.id]=Math.round(e*100)/100}const S={};L.forEach(t=>{const e=(t.name||"").trim().toLowerCase(),o=v.find(p=>{const c=(p.name||"").toLowerCase();return c.includes(e)||e.split(" ").some(m=>m.length>1&&c.includes(m))});o&&(S[t.id]=o)});const V={};f.forEach(t=>{V[t.id]=t.repId||null});const M=x.filter(t=>!(t.status==="cancelled"||t.date<s||t.date>l||n&&t.repId!==n)),O=b.filter(t=>t.entityType!=="customer"||!t.date||t.date<s||t.date>l?!1:n?V[t.targetId]===n:!0);let Z=0,Y=0,lt=0;M.forEach(t=>{Z+=t.totalWithVat||0,Y+=t.paidAmount||0;let e=0;const o=t.subtotal||0;(t.lines||[]).forEach(p=>{const c=C.find(K=>K.id===p.productId),m=c?c.purchasePrice!==void 0?c.purchasePrice:c.costPrice!==void 0?c.costPrice:c.averageCost||0:p.averageCost||p.costPrice||p.purchasePrice||0,u=p.qty||0;e+=m*u}),lt+=o-e}),O.forEach(t=>{Y+=t.amount||0});const ct=Z-Y,j=ct<0,pt=j?"good":"bad",Et=j?"صافي تخفيض المديونية":"إجمالي المديونية الجديدة",Ct=j?"التحصيلات تفوق مبيعات اليوم":"صافي الزيادة في المديونية اليوم",Bt=Math.abs(ct);let tt=0;f.forEach(t=>{const e=T[t.id]||0;e<=0||(n?(t.repId===n||t.assignedRepId===n)&&(tt+=e):(t.repId||t.assignedRepId)&&(tt+=e))});const Rt=new Set(["المندوب","مندوب","السيد","أحمد","احمد","شركة","مؤسسة","السيارة","سيارة"]),mt=(t,e)=>{const o=(t.description||"").toLowerCase();if(o.includes("تقفيل")||o.includes("إقفال")||o.includes("اقفال")||o.includes("اققال")||o.includes("سداد")||o.includes("عكس")||o.includes("تسوية")||o.includes("خصم")||o.includes("مقاصة")||t.date&&t.date<"2026-08-01")return!1;const p=S[e.id],c=(e.name||"").trim().toLowerCase().split(" ").filter(h=>h.length>1&&!Rt.has(h)),m=["سلفة","سلف","قرض","استلاف","advance","loan"].some(h=>o.includes(h)),u=p&&(t.lines||[]).some(h=>(h.accountId===p.id||h.accountCode===p.code)&&(h.debit||0)>0),K=(t.lines||[]).some(h=>{const nt=(h.notes||h.note||h.accountName||"").toLowerCase();return m&&c.length>0&&c.some(_=>nt.includes(_))&&(h.debit||0)>0}),ot=m&&c.length>0&&c.some(h=>o.includes(h));return p&&(t.lines||[]).some(h=>(h.accountId===p.id||h.accountCode===p.code)&&(h.credit||0)>0)?!1:ot||u||K};let W=[];if(n){const t=L.find(e=>e.id===n);t&&(W=I.filter(e=>mt(e,t)).map(e=>{const o=S[n];let p=0;if(o){const c=(e.lines||[]).find(m=>(m.accountId===o.id||m.accountCode===o.code)&&(m.debit||0)>0);p=c&&c.debit||0}return p||(p=(e.lines||[]).reduce((c,m)=>c+(m.debit||0),0)),{id:e.id,entryNumber:e.entryNumber||e.id.slice(0,8),date:e.date,description:e.description,amount:p,status:e.status||"posted",repName:t.name}}))}else L.forEach(t=>{const e=I.filter(o=>mt(o,t)).map(o=>{const p=S[t.id];let c=0;if(p){const m=(o.lines||[]).find(u=>(u.accountId===p.id||u.accountCode===p.code)&&(u.debit||0)>0);c=m&&m.debit||0}return c||(c=(o.lines||[]).reduce((m,u)=>m+(u.debit||0),0)),{id:o.id,entryNumber:o.entryNumber||o.id.slice(0,8),date:o.date,description:o.description,amount:c,status:o.status||"posted",repName:t.name}});W.push(...e)});const zt=(W||[]).reduce((t,e)=>t+(e.amount||0),0);let A=[],ut=0;const H=L.find(t=>t.id===n);let q=H?H.employeeId:null;if(H&&!q){const t=$.find(e=>e.name.includes(H.name.trim())||H.name.trim().includes(e.name));t&&(q=t.id)}if(n)q&&(A=w.filter(t=>t.empId===q&&t.status==="active"&&t.remainingBalance>0),ut=A.reduce((t,e)=>t+(e.remainingBalance||0),0));else{const t=new Set(L.map(e=>e.employeeId).filter(Boolean));A=w.filter(e=>e.status!=="active"||!(e.remainingBalance>0)?!1:t.has(e.empId)?!0:L.some(o=>e.empName?.includes(o.name)||o.name?.includes(e.empName))),ut=A.reduce((e,o)=>e+(o.remainingBalance||0),0)}const et=f.filter(t=>n?t.repId===n||t.assignedRepId===n:t.repId||t.assignedRepId).map(t=>{let e=0;M.forEach(u=>{u.customerId===t.id&&(e+=u.totalWithVat||0)});let o=0;M.forEach(u=>{u.customerId===t.id&&(o+=u.paidAmount||0)}),(y||[]).forEach(u=>{u.customerId===t.id&&u.status!=="cancelled"&&(o+=u.totalWithVat||u.total||u.amount||0)}),O.forEach(u=>{u.targetId===t.id&&(o+=u.amount||0)});const p=T[t.id]??0,c=p-e+o,m=e>0||o>0;return{cust:t,prevBal:c,todayCustSales:e,todayCustCollections:o,currentBal:p,hasActivity:m}}).filter(t=>n?!0:t.hasActivity);et.sort((t,e)=>t.hasActivity&&!e.hasActivity?-1:!t.hasActivity&&e.hasActivity?1:e.currentBal-t.currentBal);const Pt=et.map(t=>{const e=t.hasActivity?'<span class="badge good" style="font-size:9px; padding:2px 6px;">نشط بالفترة</span>':'<span class="badge secondary" style="font-size:9px; padding:2px 6px; background:#e0e0e0; color:#555;">لا توجد حركة</span>',o=t.hasActivity?"rgba(46, 204, 113, 0.06)":"var(--bg-1)";return`
        <tr style="background: ${o};">
          <td style="font-weight:bold; color:var(--text-1); background: ${o} !important;">${t.cust.name}</td>
          <td class="mono font-bold" style="background: ${o} !important;">${r(t.prevBal)}</td>
          <td class="mono font-bold ${t.todayCustSales>0?"text-brand":""}" style="background: ${o} !important;">+ ${r(t.todayCustSales)}</td>
          <td class="mono font-bold ${t.todayCustCollections>0?"text-good":""}" style="background: ${o} !important;">- ${r(t.todayCustCollections)}</td>
          <td class="mono font-bold text-indigo" style="font-size:13px; background: ${o} !important;">${r(t.currentBal)}</td>
          <td class="no-print" style="text-align:center; background: ${o} !important;">${e}</td>
        </tr>
      `}).join(""),J=n?L.find(t=>t.id===n)?.name||"المندوب":"جميع المناديب";let gt=`
      <h3 class="font-heading mb-12" style="font-size:15px; border-bottom: 2px solid #64748b; padding-bottom: 6px; margin-top: 24px; color:#475569;">💸 سلف وقروض المناديب القائمة (الربط المالي مع شؤون الموظفين)</h3>
    `;A.length===0?gt+='<div class="alert info" style="text-align:center;">لا توجد سلف شخصية أو قروض قائمة مسجلة بذمة المندوب حالياً في شؤون الموظفين.</div>':gt+=`
        <div class="table-container mb-24">
          <table class="data-dense" style="width:100%;">
            <thead>
              <tr style="background:#475569;">
                ${n?"":'<th style="background:#475569 !important; color:#fff;">المندوب</th>'}
                <th style="background:#475569 !important; color:#fff;">تاريخ الصرف</th>
                <th style="background:#475569 !important; color:#fff;">البيان والملاحظات</th>
                <th style="background:#475569 !important; color:#fff;" class="mono">قيمة السلفة الكلية</th>
                <th style="background:#475569 !important; color:#fff;" class="mono">المسدد منها</th>
                <th style="background:#475569 !important; color:#fff;" class="mono">الرصيد المتبقي بذمة المندوب</th>
                <th style="background:#475569 !important; color:#fff;">إجراء</th>
              </tr>
            </thead>
            <tbody>
              ${A.map(t=>{const e="var(--bg-1)";return`
                  <tr style="background:${e};">
                    ${n?"":`<td style="font-weight:bold; color:var(--text-1); background:${e} !important;">${t.empName}</td>`}
                    <td class="mono font-bold" style="background:${e} !important;">${t.date}</td>
                    <td style="background:${e} !important;">${t.notes||"سلفة شخصية"}</td>
                    <td class="mono" style="background:${e} !important;">${r(t.amount||0)}</td>
                    <td class="mono text-good" style="background:${e} !important;">${r(t.paidAmount||0)}</td>
                    <td class="mono font-bold text-bad" style="font-size:13px; color:#ef4444 !important; background:${e} !important;">${r(t.remainingBalance||0)}</td>
                    <td style="background:${e} !important; text-align:center;">
                      <button
                        onclick="settleRepLoanByJournal('${t.id}', ${t.amount||0}, '${t.empName||""}')"
                        style="background:#10b981;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;font-weight:700;"
                        title="تسوية السلفة بقيد محاسبي — تصفير الرصيد">✓ تسوية بقيد</button>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
      `;let bt=`
      <h3 class="font-heading mb-12" style="font-size:15px; border-bottom:2px solid #6366f1; padding-bottom:6px; margin-top:24px; color:#818cf8;">
        📒 سلف مسجّلة بالقيود المحاسبية (مباشرة من دفتر اليومية)
      </h3>
    `;W.length===0?bt+=`
        <div class="alert info" style="text-align:center;">
          لا توجد سلف مُسجَّلة بقيود محاسبية لهذا المندوب.
          <br><small style="opacity:.7">يُكتشف القيد تلقائياً إذا تضمّن كلمة «سلفة» مع اسم المندوب، أو إذا استخدم حسابه في شجرة الحسابات.</small>
        </div>`:bt+=`
        <div class="table-container mb-24">
          <table class="data-dense" style="width:100%;">
            <thead>
              <tr style="background:#4f46e5;">
                ${n?"":'<th style="background:#4f46e5 !important; color:#fff;">المندوب</th>'}
                <th style="background:#4f46e5 !important; color:#fff;">رقم القيد</th>
                <th style="background:#4f46e5 !important; color:#fff;">التاريخ</th>
                <th style="background:#4f46e5 !important; color:#fff;">البيان</th>
                <th style="background:#4f46e5 !important; color:#fff;" class="mono">المبلغ</th>
                <th style="background:#4f46e5 !important; color:#fff;">الحالة</th>
                <th style="background:#4f46e5 !important; color:#fff; text-align:center;">إجراء التسوية</th>
              </tr>
            </thead>
            <tbody>
              ${W.map(t=>{const e="var(--bg-1)";return`
                  <tr style="background:${e};">
                    ${n?"":`<td style="font-weight:bold;color:var(--text-1);background:${e} !important;">${t.repName||""}</td>`}
                    <td class="mono font-bold" style="color:#818cf8;background:${e} !important;">${t.entryNumber}</td>
                    <td class="mono" style="background:${e} !important;">${t.date||""}</td>
                    <td style="background:${e} !important;">${t.description||"سلفة"}</td>
                    <td class="mono font-bold text-bad" style="font-size:13px;color:#ef4444 !important;background:${e} !important;">${r(t.amount)}</td>
                    <td style="background:${e} !important;">
                      <span style="background:rgba(16,185,129,.15);color:#10b981;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:800;">
                        ${t.status==="posted"?"✅ مرحّل":"📝 مسودة"}
                      </span>
                    </td>
                    <td style="background:${e} !important; text-align:center;">
                      <button
                        onclick="window.settleJeLoanInteractive('${t.id}', ${t.amount}, '${(t.repName||"").replace(/'/g,"\\'")}', '${t.entryNumber}')"
                        style="background:#10b981; color:#fff; border:none; border-radius:6px; padding:4px 10px; font-size:11px; cursor:pointer; font-weight:700;"
                        title="تسوية هذه السلفة بقيد محاسبي">✓ تسوية السلفة</button>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
            <tfoot>
              <tr style="background:var(--bg-3); border-top:2px solid #6366f1;">
                ${n?"":'<td style="background:var(--bg-3) !important;"></td>'}
                <td colspan="3" style="background:var(--bg-3) !important; font-weight:900; color:var(--text-0); text-align:right; font-size:13px;">إجمالي السلف المسجلة بالقيود المحاسبية</td>
                <td class="mono font-bold text-bad" style="background:var(--bg-3) !important; color:#dc2626 !important; font-size:16px;">${r(zt)}</td>
                <td style="background:var(--bg-3) !important;"></td>
                <td style="background:var(--bg-3) !important;"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;let k=`
      <style>
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { background: #fff !important; color: #000 !important; padding: 0 !important; margin: 0 !important; }
          .no-print, .filterbar, .tab-switcher, button, .modal-overlay, .page-header { display: none !important; }
          .page-content { padding: 0 !important; margin: 0 !important; box-shadow: none !important; }
          .card { border: 1px solid #e2e8f0 !important; box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important; background: #f8fafc !important; page-break-inside: avoid; margin-bottom: 12px !important; padding: 12px !important; }
          .print-only-header { display: block !important; }
          .kpi-container-print { display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; justify-content: space-between !important; gap: 6px !important; margin-bottom: 20px !important; }
          .kpi-card-print { flex: 1 !important; min-width: 90px !important; padding: 12px 4px !important; background: #f8fafc !important; text-align: center !important; border-radius: 8px !important; box-shadow: none !important; border: 1px solid #cbd5e1 !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th { background-color: #1e3c72 !important; color: #ffffff !important; font-weight: bold !important; font-size: 9px !important; text-align: center !important; border: 1px solid #cbd5e1 !important; padding: 6px !important; }
          td { border: 1px solid #e2e8f0 !important; padding: 5px !important; font-size: 9px !important; }
        }
      </style>

      <!-- Print Header -->
      <div class="print-only-header" style="display:none; margin-bottom:24px; border-radius:8px; overflow:hidden; border:1px solid #cbd5e1;">
        <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 16px 20px; color: #fff; display: flex; justify-content: space-between; align-items: center;">
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: bold; color: #00f2fe;">نظم الامداد الحديثة</div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.85); margin-top: 4px;">نظام التوزيع وإدارة المناديب</div>
          </div>
          <div style="text-align: left;">
            <div style="font-size: 14px; font-weight: bold; color: #fff;">سجل تجاري: 4625072049</div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.85); margin-top: 4px;">الرقم الضريبي: 310061596700003</div>
          </div>
        </div>
        <div style="background: #f8fafc; padding: 10px 20px; border-bottom: 2px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #334155; font-weight: bold;">
          <div>تقرير مبيعات وحركة المديونيات اليومي</div>
          <div>الفترة: من ${s} إلى ${l}</div>
          <div>المندوب: ${J}</div>
          <div>تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA")}</div>
        </div>
      </div>

      <!-- KPI cards -->
      <div class="kpi-container-print" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:12px; margin-bottom: 24px;">
        <div class="card kpi-card-print" style="padding:16px; border-left: 4px solid var(--brand); border-radius:14px;">
          <div class="text-2 mb-4" style="font-size:11px; font-weight:bold; color:var(--text-2);">إجمالي المبيعات (شامل الضريبة)</div>
          <div class="mono font-bold text-brand" style="font-size:20px;">${r(Z)}</div>
          <div style="font-size:10px; color:var(--text-3); margin-top:4px;">مبيعات الفترة</div>
        </div>
        <div class="card kpi-card-print" style="padding:16px; border-left: 4px solid var(--good); border-radius:14px;">
          <div class="text-2 mb-4" style="font-size:11px; font-weight:bold; color:var(--text-2);">إجمالي المقبوضات/المتحصلات</div>
          <div class="mono font-bold text-good" style="font-size:20px;">${r(Y)}</div>
          <div style="font-size:10px; color:var(--text-3); margin-top:4px;">دفعات الفواتير + سندات القبض</div>
        </div>
        <div class="card kpi-card-print" style="padding:16px; border-left: 4px solid var(--${pt}); border-radius:14px;">
          <div class="text-2 mb-4" style="font-size:11px; font-weight:bold; color:var(--text-2);">${Et}</div>
          <div class="mono font-bold text-${pt}" style="font-size:20px;">${r(Bt)}</div>
          <div style="font-size:10px; color:var(--text-3); margin-top:4px;">${Ct}</div>
        </div>
        <div class="card kpi-card-print" style="padding:16px; border-left: 4px solid var(--indigo); border-radius:14px;">
          <div class="text-2 mb-4" style="font-size:11px; font-weight:bold; color:var(--text-2);">صافي أرباح المبيعات</div>
          <div class="mono font-bold text-indigo" style="font-size:20px;">${r(lt)}</div>
          <div style="font-size:10px; color:var(--text-3); margin-top:4px;">الكمية × (سعر البيع - سعر الشراء)</div>
        </div>
        <div class="card kpi-card-print" style="padding:16px; border-left: 4px solid #f59e0b; border-radius:14px;">
          <div class="text-2 mb-4" style="font-size:11px; font-weight:bold; color:var(--text-2);">إجمالي مديونية العملاء الحالية</div>
          <div class="mono font-bold" style="font-size:20px; color:#d97706;">${r(tt)}</div>
          <div style="font-size:10px; color:var(--text-3); margin-top:4px;">الرصيد القائم لعملاء المندوب حالياً</div>
        </div>
      </div>

      <!-- Invoices and Items Section -->
      <h3 class="font-heading mb-12" style="font-size:15px; border-bottom: 1px solid var(--border-soft); padding-bottom: 6px; margin-top: 24px;">📄 فواتير مبيعات المندوب وتفاصيل الأصناف والربحية</h3>
    `;M.length===0?k+=`<div class="alert info mb-24" style="text-align:center;">لا توجد فواتير مبيعات مسجلة لـ ${J} في الفترة من ${s} إلى ${l}</div>`:(k+=`
        <div class="table-container mb-24">
          <table class="data-dense" style="width:100%;">
            <thead>
              <tr style="background:var(--bg-3);">
                <th>رقم الفاتورة</th>
                <th>العميل</th>
                <th>طريقة الدفع</th>
                <th class="mono">الإجمالي</th>
                <th class="mono">المحصل</th>
                <th class="mono">المديونية</th>
                <th class="mono">التكلفة</th>
                <th class="mono">الربح</th>
                <th>نسبة الربح</th>
              </tr>
            </thead>
            <tbody>
      `,M.forEach(t=>{const e=t.number||t.invoiceNumber||t.id,o=f.find(E=>E.id===t.customerId)?.name||t.customerName||"عميل نقدي",p=t.paymentMethod==="cash"?"نقدي":t.paymentMethod==="credit"?"آجل":"جزئي";let c=0;const m=t.subtotal||0,u=(t.lines||[]).map(E=>{const N=C.find(Tt=>Tt.id===E.productId),Lt=N?N.purchasePrice!==void 0?N.purchasePrice:N.costPrice!==void 0?N.costPrice:N.averageCost||0:E.averageCost||E.costPrice||E.purchasePrice||0,at=E.qty||0,st=at*Lt;c+=st;const yt=E.unitPrice!==void 0?E.unitPrice:E.price||0,ht=E.discount||0,xt=at*yt*(1-ht/100),vt=xt-st,Mt=vt>=0?"text-good":"text-bad";return`
            <tr>
              <td style="padding:6px 12px; text-align:right; font-weight:bold; color:var(--text-1);">${E.productName||"صنف غير معروف"}</td>
              <td style="padding:6px 12px;" class="mono">${at}</td>
              <td style="padding:6px 12px;" class="mono">${r(yt)}</td>
              <td style="padding:6px 12px;" class="mono">${ht}%</td>
              <td style="padding:6px 12px;" class="mono font-bold">${r(xt)}</td>
              <td style="padding:6px 12px;" class="mono">${r(st)}</td>
              <td style="padding:6px 12px;" class="mono font-bold ${Mt}">${r(vt)}</td>
            </tr>
          `}).join(""),K=t.totalWithVat||0,ot=t.paidAmount||0,ft=t.remainingAmount||0,h=m-c,nt=m>0?h/m*100:0,_=h>=0?"text-good":"text-bad";k+=`
          <tr style="background:var(--bg-1); font-weight:bold; border-top: 2px solid var(--border-soft);">
            <td><a href="javascript:void(0)" onclick="window.viewInvoice && window.viewInvoice('${t.id}')" style="color:var(--brand); text-decoration:underline;">${e}</a></td>
            <td>${o}</td>
            <td><span class="badge ${t.paymentMethod==="cash"?"good":"warning"}">${p}</span></td>
            <td class="mono font-bold">${r(K)}</td>
            <td class="mono text-good">${r(ot)}</td>
            <td class="mono text-bad">${r(ft)}</td>
            <td class="mono">${r(c)}</td>
            <td class="mono ${_}">${r(h)}</td>
            <td class="mono ${_}">${nt.toFixed(1)}%</td>
          </tr>
          <!-- Invoice items details -->
          <tr style="background:var(--bg-2);">
            <td colspan="9" style="padding:8px 24px; background:var(--bg-2);">
              <div style="font-size:11px; color:var(--text-2); margin-bottom:4px; font-weight:bold;">📦 تفاصيل الأصناف المباعة بالتسعير الحقيقي (التكلفة = سعر الشراء الأخير):</div>
              <table style="width:100%; border:1px solid var(--border-soft); background:var(--bg-0); font-size:11px; margin-bottom:8px; border-radius:8px;">
                <thead>
                  <tr style="background:var(--bg-1);">
                    <th style="padding:6px 12px; text-align:right;">الصنف</th>
                    <th style="padding:6px 12px;" class="mono">الكمية</th>
                    <th style="padding:6px 12px;" class="mono">سعر البيع</th>
                    <th style="padding:6px 12px;" class="mono">الخصم</th>
                    <th style="padding:6px 12px;" class="mono">إجمالي المبيعات</th>
                    <th style="padding:6px 12px;" class="mono">التكلفة</th>
                    <th style="padding:6px 12px;" class="mono">الربح</th>
                  </tr>
                </thead>
                <tbody>
                  ${u}
                </tbody>
              </table>
            </td>
          </tr>
        `}),k+=`
            </tbody>
          </table>
        </div>
      `),k+=`
      <!-- Full Representative Customer Debts Report -->
      <h3 class="font-heading mb-12" style="font-size:15px; border-bottom: 1px solid var(--border-soft); padding-bottom: 6px; margin-top: 24px;">📊 تقرير حركة مديونيات وأرصدة كافة عملاء المندوب</h3>
    `,et.length===0?k+=`<div class="alert info mb-24" style="text-align:center;">لا يوجد عملاء مسجلين للمندوب ${J}</div>`:k+=`
        <div class="table-container mb-24">
          <table class="data-dense" style="width:100%;">
            <thead>
              <tr style="background:var(--bg-3);">
                <th>اسم العميل</th>
                <th class="mono">المديونية السابقة (رصيد أول الفترة)</th>
                <th class="mono">مبيعات الفترة (+)</th>
                <th class="mono">تحصيلات الفترة (-)</th>
                <th class="mono" style="color:var(--brand);">المديونية الحالية (رصيد نهاية الفترة)</th>
                <th class="no-print">حالة حركة الفترة</th>
              </tr>
            </thead>
            <tbody>
              ${Pt}
            </tbody>
          </table>
        </div>
      `,k+='<h3 class="font-heading mb-12" style="font-size:15px; border-bottom: 1px solid var(--border-soft); padding-bottom: 6px;">💵 سندات القبض والتحصيلات اللاحقة لعملاء المندوب خلال الفترة</h3>',O.length===0?k+=`<div class="alert info" style="text-align:center;">لا توجد سندات قبض مسجلة لـ ${J} في الفترة من ${s} إلى ${l}</div>`:(k+=`
        <div class="table-container">
          <table class="data-dense" style="width:100%;">
            <thead>
              <tr style="background:var(--bg-3);">
                <th>رقم السند</th>
                <th>اسم العميل</th>
                <th>طريقة التحصيل</th>
                <th>البيان/الملاحظات</th>
                <th class="mono">القيمة المحصلة</th>
              </tr>
            </thead>
            <tbody>
      `,O.forEach(t=>{const e=t.receiptNumber||t.number||t.code||t.id?.slice(0,8)||"—",o=t.accountName||t.targetName||t.customerName||"عميل",p=t.method==="cash"?"نقدي":t.method==="bank"?"تحويل بنكي":"شيك",c=t.notes||"سداد حساب",m=t.amount||0;k+=`
          <tr style="background:var(--bg-1);">
            <td class="mono font-bold">${e}</td>
            <td style="font-weight:bold;">${o}</td>
            <td><span class="badge ${t.method==="cash"?"good":"info"}">${p}</span></td>
            <td>${c}</td>
            <td class="mono font-bold text-good" style="font-size:15px;">${r(m)}</td>
          </tr>
        `}),k+=`
            </tbody>
          </table>
        </div>
      `),d.innerHTML=k}catch(x){d.innerHTML=`<div class="alert bad">حدث خطأ في تحميل التقرير اليومي: ${x.message}</div>`}}function Wt(g,d,n){document.getElementById("planner-rep-name").textContent=d,document.getElementById("planner-monthly-target").value=n,z=[],C.length>0&&(z.push({productId:C[0].id,productName:C[0].name,price:C[0].salePrice||100,weight:50}),C.length>1&&z.push({productId:C[1].id,productName:C[1].name,price:C[1].salePrice||100,weight:50})),U(),window.openModal("target-planner-modal")}function U(){const g=parseFloat(document.getElementById("planner-monthly-target").value)||0,d=parseFloat(document.getElementById("planner-work-days").value)||26,n=d>0?g/d:0;document.getElementById("planner-daily-needed").textContent=`${r(n)}`,Ot(n)}function Ht(){const g=document.getElementById("planner-product-select"),d=g?.value;if(!d)return;if(z.some(b=>b.productId===d)){window.showToast&&window.showToast("هذا الصنف مضاف بالفعل للمزيج","warning");return}const n=g.options[g.selectedIndex],i=n.textContent.split(" (")[0],s=parseFloat(n.dataset.price)||100,l=z.reduce((b,f)=>b+f.weight,0),x=Math.max(0,100-l);z.push({productId:d,productName:i,price:s,weight:x>0?x:0}),g.value="",U()}function Kt(g){z.splice(g,1),U()}function Vt(g,d){z[g].weight=parseFloat(d)||0;const n=parseFloat(document.getElementById("planner-monthly-target").value)||0,i=parseFloat(document.getElementById("planner-work-days").value)||26,s=i>0?n/i:0;let l=0,x=0,b=0;z.forEach(($,I)=>{l+=$.weight;const v=s*($.weight/100);x+=v;const P=$.price>0?v/$.price:0;b+=P;const a=document.getElementById(`planner-row-amt-${I}`),w=document.getElementById(`planner-row-cart-${I}`);a&&(a.textContent=r(v)),w&&(w.textContent=`${P.toFixed(1)} كرتونة / وحدة`)}),document.getElementById("planner-total-weight-cell").textContent=`${l}%`,document.getElementById("planner-total-amount-cell").textContent=r(x),document.getElementById("planner-total-cartons-cell").textContent=`${b.toFixed(1)} كرتونة`;const f=document.getElementById("planner-weight-warning"),y=document.getElementById("planner-current-weight-sum");f&&y&&(y.textContent=l,Math.abs(l-100)>.01?f.classList.remove("hidden"):f.classList.add("hidden"))}function Ot(g){const d=document.getElementById("planner-mix-tbody");if(!d)return;if(z.length===0){d.innerHTML='<tr><td colspan="6" style="text-align:center; padding:16px; color:var(--text-2);">لا توجد أصناف في مزيج الأهداف بعد</td></tr>',document.getElementById("planner-total-weight-cell").textContent="0%",document.getElementById("planner-total-amount-cell").textContent="0.00 ر.س",document.getElementById("planner-total-cartons-cell").textContent="0 كرتونة";return}let n=0,i=0,s=0;d.innerHTML=z.map((b,f)=>{const y=g*(b.weight/100),$=b.price>0?y/b.price:0;return n+=b.weight,i+=y,s+=$,`
      <tr>
        <td><strong style="color:var(--text-1);">${b.productName}</strong></td>
        <td class="mono">${r(b.price)}</td>
        <td>
          <input type="number" class="input sm mono" style="width:80px; text-align:center; display:inline-block;"
                 value="${b.weight}" oninput="updateMixRowWeight(${f}, this.value)" /> %
        </td>
        <td class="mono text-indigo" id="planner-row-amt-${f}">${r(y)}</td>
        <td class="mono font-bold text-brand" id="planner-row-cart-${f}">${$.toFixed(1)} كرتونة / وحدة</td>
        <td class="no-print">
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="removeProductFromPlannerMix(${f})">🗑️</button>
        </td>
      </tr>
    `}).join(""),document.getElementById("planner-total-weight-cell").textContent=`${n}%`,document.getElementById("planner-total-amount-cell").textContent=r(i),document.getElementById("planner-total-cartons-cell").textContent=`${s.toFixed(1)} كرتونة`;const l=document.getElementById("planner-weight-warning"),x=document.getElementById("planner-current-weight-sum");l&&x&&(x.textContent=n,Math.abs(n-100)>.01?l.classList.remove("hidden"):l.classList.add("hidden"))}window.settleRepLoanByJournal=async(g,d,n)=>{if(typeof showConfirm=="function"?await showConfirm(`تسوية سلفة ${n} بمبلغ ${d} ر.س عبر القيد المحاسبي؟
سيتم تصفير الرصيد المتبقي وتغيير حالة السلفة إلى "مسوّاة".`,"تأكيد التسوية"):confirm(`تسوية سلفة ${n} بمبلغ ${d} ر.س ؟`))try{const s=St(G,`companies/${Q}/employeeLoans`,g);await At(s,{paidAmount:d,remainingBalance:0,status:"settled_journal",settledAt:new Date().toISOString(),settledNote:`تمت التسوية بقيد محاسبي — ${new Date().toLocaleDateString("ar-SA")}`}),typeof showToast=="function"&&showToast(`✅ تمت تسوية سلفة ${n} — الرصيد صفر الآن`,"success");const l=document.getElementById("update-report-btn");l&&l.click()}catch(s){console.error("[settleRepLoanByJournal]",s),typeof showToast=="function"&&showToast("حدث خطأ أثناء التسوية: "+s.message,"error")}};export{Ut as render};
