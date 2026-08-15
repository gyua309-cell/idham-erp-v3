const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-HrCilPJ3.js","assets/index-BTgEPYae.css"])))=>i.map(i=>d[i]);
import{g as R,C as z,f as s,_ as rt,d as ft,a as H,z as xt}from"./index-HrCilPJ3.js";import{orderBy as it,getDocs as yt,collection as ht}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let I=[],D=[],E=[];async function Dt(p,r){D=await R(z.salesReps(),[it("name")]),I=await R(z.products(),[it("name")]),p.innerHTML=vt();const e=document.getElementById("planner-product-select");e&&(e.innerHTML='<option value="">-- اختر صنف --</option>'+I.map(d=>`<option value="${d.id}" data-price="${d.salePrice||0}">${d.name} (${s(d.salePrice)})</option>`).join(""));const a=document.getElementById("daily-rep-select");a&&(a.innerHTML='<option value="">-- الكل (بدون تحديد) --</option>'+D.map(d=>`<option value="${d.id}">${d.name}</option>`).join(""));const i=document.getElementById("kpi-filter-from"),l=document.getElementById("kpi-filter-to");if(i&&l){const d=new Date,g=new Date(d.getFullYear(),d.getMonth(),1),h=b=>{const P=b.getFullYear(),u=String(b.getMonth()+1).padStart(2,"0"),f=String(b.getDate()).padStart(2,"0");return`${P}-${u}-${f}`};i.value=h(g),l.value=h(d)}const m=document.getElementById("daily-report-date");m&&(m.value=new Date().toISOString().split("T")[0]),window.openTargetPlanner=$t,window.addProductToPlannerMix=kt,window.removeProductFromPlannerMix=It,window.recalculatePlannerDaily=K,window.updateMixRowWeight=Et,window.switchRepTab=dt,window.loadRepDailyReport=st,window.setKpiRange=wt,window.loadRepPerformance=Z,dt("kpis")}function vt(){return`
    <div class="page-content">
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom: 24px;">
        <div>
          <h1 class="page-title" style="margin:0;">🏆 تقارير وأداء المناديب</h1>
          <p class="page-subtitle" style="margin:4px 0 0;">متابعة أداء المبيعات، نسب إنجاز الأهداف، والتقرير اليومي التفصيلي</p>
        </div>
        
        <!-- Tab switcher -->
        <div class="no-print" style="display:flex; background:var(--bg-2); padding:4px; border-radius:10px; border:1px solid var(--border-soft);">
          <button class="btn btn-sm" id="tab-rep-kpis" onclick="switchRepTab('kpis')" style="border-radius:8px; padding:6px 16px; border:none; cursor:pointer;">📊 تقييم الأهداف (KPIs)</button>
          <button class="btn btn-sm" id="tab-rep-daily" onclick="switchRepTab('daily')" style="border-radius:8px; padding:6px 16px; border:none; cursor:pointer;">📅 التقرير اليومي التفصيلي</button>
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
          <div class="form-group" style="margin:0; width:220px;">
            <label style="font-size:11px; margin-bottom:4px; display:block; font-weight:bold;">المندوب</label>
            <select id="daily-rep-select" class="input" style="height:38px;" onchange="loadRepDailyReport()"></select>
          </div>
          <div class="form-group" style="margin:0; width:180px;">
            <label style="font-size:11px; margin-bottom:4px; display:block; font-weight:bold;">التاريخ</label>
            <input type="date" id="daily-report-date" class="input" style="height:38px;" onchange="loadRepDailyReport()" />
          </div>
          <div style="margin-right:auto; display:flex; gap:8px;">
            <button class="btn btn-secondary" onclick="window.print()">🖨️ طباعة التقرير</button>
            <button class="btn btn-primary" onclick="loadRepDailyReport(true)">🔄 تحديث</button>
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
  `}function wt(p){const r=document.getElementById("kpi-filter-from"),e=document.getElementById("kpi-filter-to");if(!r||!e)return;const a=new Date,i=l=>{const m=l.getFullYear(),d=String(l.getMonth()+1).padStart(2,"0"),g=String(l.getDate()).padStart(2,"0");return`${m}-${d}-${g}`};if(p==="month"){const l=new Date(a.getFullYear(),a.getMonth(),1);r.value=i(l),e.value=i(a)}else if(p==="last_month"){const l=new Date(a.getFullYear(),a.getMonth()-1,1),m=new Date(a.getFullYear(),a.getMonth(),0);r.value=i(l),e.value=i(m)}else if(p==="year"){const l=new Date(a.getFullYear(),0,1);r.value=i(l),e.value=i(a)}Z()}function dt(p){const r=document.getElementById("rep-kpis-tab-content"),e=document.getElementById("rep-daily-tab-content"),a=document.getElementById("tab-rep-kpis"),i=document.getElementById("tab-rep-daily");!r||!e||!a||!i||(p==="kpis"?(r.classList.remove("hidden"),e.classList.add("hidden"),a.style.background="var(--brand)",a.style.color="#fff",a.style.fontWeight="bold",i.style.background="transparent",i.style.color="var(--text-1)",i.style.fontWeight="normal",Z()):(r.classList.add("hidden"),e.classList.remove("hidden"),i.style.background="var(--brand)",i.style.color="#fff",i.style.fontWeight="bold",a.style.background="transparent",a.style.color="var(--text-1)",a.style.fontWeight="normal",st()))}async function Z(p=!1){const r=document.getElementById("perf-cards");if(r)try{const e=D,a=document.getElementById("kpi-filter-from")?.value||"",i=document.getElementById("kpi-filter-to")?.value||"",{clearERPCache:l}=await rt(async()=>{const{clearERPCache:o}=await import("./index-HrCilPJ3.js").then(v=>v.N);return{clearERPCache:o}},__vite__mapDeps([0,1]));p&&(l(`companies/${H}/salesInvoices`),l(`companies/${H}/receipts`),l(`companies/${H}/customers`));const[m,d,g]=await Promise.all([R(z.salesInvoices()),R(z.receipts()),R(z.customers())]),h=m.filter(o=>(!a||o.date>=a)&&(!i||o.date<=i)&&o.status!=="cancelled"),b=d.filter(o=>(!a||o.date>=a)&&(!i||o.date<=i)&&o.entityType==="customer"),P={};g.forEach(o=>{P[o.id]=o.repId||null});const u={},f={},C={};if(h.forEach(o=>{o.repId&&(u[o.repId]=(u[o.repId]||0)+(o.totalWithVat||0),f[o.repId]=(f[o.repId]||0)+(o.amountPaid||o.paidAmount||0),C[o.repId]=(C[o.repId]||0)+1)}),b.forEach(o=>{const v=P[o.targetId];v&&(f[v]=(f[v]||0)+(o.amount||0))}),e.length===0){r.innerHTML='<div class="empty-state" style="grid-column:span 2;"><div class="empty-icon">🏆</div><h3>لا يوجد مناديب مسجلون</h3></div>';return}r.innerHTML=e.map(o=>{const v=u[o.id]||0,A=f[o.id]||0,L=C[o.id]||0,M=o.monthlyTarget||1,N=v/M*100,O=v<M?1:o.commissionRate||0,Y=A*(O/100),T=xt(N);return`
        <div class="card" style="padding:24px;">
          <div class="flex items-center justify-between mb-16">
            <div class="flex items-center gap-12">
              <div class="user-avatar" style="width:48px;height:48px;font-size:20px;background:var(--brand-soft);color:var(--brand);">${o.name[0]}</div>
              <div>
                <h3 style="font-family:var(--font-heading);font-size:16px;">${o.name}</h3>
                <div class="text-2" style="font-size:12px;">المسار: ${o.zone||"غير محدد"}</div>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
              <span class="badge ${T}" style="font-size:12px;padding:4px 12px;">${N.toFixed(0)}% من الهدف</span>
              <button class="btn btn-ghost sm no-print" onclick="openTargetPlanner('${o.id}','${o.name.replace(/'/g,"\\'")}',${M})" style="font-size:11px; padding:2px 8px; color:var(--brand);">🎯 مخطط التحميل اليومي</button>
            </div>
          </div>

          <div class="mb-20">
            <div class="flex justify-between mb-6" style="font-size:12px;">
              <span class="text-2">المبيعات الحالية / الهدف الشهري</span>
              <span class="mono font-bold text-${T}">${s(v)} / ${s(M)}</span>
            </div>
            <div class="progress-bar" style="height:10px;">
              <div class="fill ${T}" style="width:${Math.min(N,100)}%;"></div>
            </div>
          </div>

          <div class="grid-3 gap-12" style="font-size:12px;text-align:center;">
            <div style="background:var(--bg-2);padding:12px;border-radius:var(--radius-sm);">
              <div class="text-2 mb-4">عدد الفواتير</div>
              <div class="mono font-bold" style="font-size:16px;">${L}</div>
            </div>
            <div style="background:var(--bg-2);padding:12px;border-radius:var(--radius-sm);">
              <div class="text-2 mb-4">المبلغ المحصل</div>
              <div class="mono font-bold text-good" style="font-size:14px;">${s(A)}</div>
            </div>
            <div style="background:var(--bg-2);padding:12px;border-radius:var(--radius-sm);">
              <div class="text-2 mb-4">العمولة المستحقة</div>
              <div class="mono font-bold text-indigo" style="font-size:14px;">${s(Y)}</div>
            </div>
          </div>
        </div>`}).join("")}catch(e){r.innerHTML=`<div class="alert bad">${e.message}</div>`}}async function st(p=!1){const r=document.getElementById("daily-report-results");if(!r)return;r.innerHTML='<div class="page-loading"><div class="loading-spinner"></div><span>جارٍ إعداد التقرير اليومي للمبيعات والتحصيلات...</span></div>';const e=document.getElementById("daily-rep-select")?.value||"",a=document.getElementById("daily-report-date")?.value||new Date().toISOString().split("T")[0];try{const{clearERPCache:i}=await rt(async()=>{const{clearERPCache:t}=await import("./index-HrCilPJ3.js").then(n=>n.N);return{clearERPCache:t}},__vite__mapDeps([0,1]));p&&(i("companies/idham-main/salesInvoices"),i("companies/idham-main/receipts"),i("companies/idham-main/customers"),i("companies/idham-main/employees"));const[l,m,d,g]=await Promise.all([R(z.salesInvoices()),R(z.receipts()),R(z.customers()),R(z.employees())]),b=(await yt(ht(ft,`companies/${H}/employeeLoans`))).docs.map(t=>({id:t.id,...t.data()})),P={};d.forEach(t=>{P[t.id]=t.repId||null});const u=l.filter(t=>!(t.status==="cancelled"||t.date!==a||e&&t.repId!==e)),f=m.filter(t=>t.entityType!=="customer"||t.date!==a?!1:e?P[t.targetId]===e:!0);let C=0,o=0,v=0;u.forEach(t=>{C+=t.totalWithVat||0,o+=t.paidAmount||0;let n=0,c=t.subtotal||0;(t.lines||[]).forEach(w=>{const x=I.find(G=>G.id===w.productId),B=x?x.purchasePrice!==void 0?x.purchasePrice:x.costPrice!==void 0?x.costPrice:x.averageCost||0:w.averageCost||w.costPrice||w.purchasePrice||0,$=w.qty||0;n+=B*$}),v+=c-n}),f.forEach(t=>{o+=t.amount||0});const A=C-o,L=A<0,M=L?"good":"bad",N=L?"صافي تخفيض المديونية":"إجمالي المديونية الجديدة",O=L?"التحصيلات تفوق مبيعات اليوم":"صافي الزيادة في المديونية اليوم",Y=Math.abs(A);let T=0;d.forEach(t=>{e?(t.repId===e||t.assignedRepId===e)&&(T+=t.balance||0):(t.repId||t.assignedRepId)&&(T+=t.balance||0)});const j=D.find(t=>t.id===e);let _=j?j.employeeId:null;if(j&&!_){const t=j.name.trim(),n=g.find(c=>c.name.includes(t)||t.includes(c.name));n&&(_=n.id)}let V=0,S=[];if(e)_&&(S=b.filter(t=>t.empId===_&&t.status==="active"&&t.remainingBalance>0),V=S.reduce((t,n)=>t+(n.remainingBalance||0),0));else{const t=new Set(D.map(n=>n.employeeId).filter(Boolean));S=b.filter(n=>n.status!=="active"||!(n.remainingBalance>0)?!1:t.has(n.empId)?!0:D.some(c=>n.empName.includes(c.name)||c.name.includes(n.empName))),V=S.reduce((n,c)=>n+(c.remainingBalance||0),0)}const q=d.filter(t=>e?t.repId===e||t.assignedRepId===e:t.repId||t.assignedRepId).map(t=>{let n=0;u.forEach($=>{$.customerId===t.id&&(n+=$.totalWithVat||0)});let c=0;u.forEach($=>{$.customerId===t.id&&(c+=$.paidAmount||0)}),f.forEach($=>{$.targetId===t.id&&(c+=$.amount||0)});const w=t.balance||0,x=w-n+c,B=n>0||c>0;return{cust:t,prevBal:x,todayCustSales:n,todayCustCollections:c,currentBal:w,hasActivity:B}}).filter(t=>e?!0:t.hasActivity);q.sort((t,n)=>t.hasActivity&&!n.hasActivity?-1:!t.hasActivity&&n.hasActivity?1:n.currentBal-t.currentBal);let lt=q.map(t=>{const n=t.hasActivity?'<span class="badge good" style="font-size:9px; padding:2px 6px;">نشط اليوم</span>':'<span class="badge secondary" style="font-size:9px; padding:2px 6px; background:#e0e0e0; color:#555;">لا توجد حركة</span>',c=t.hasActivity?"rgba(46, 204, 113, 0.06)":"var(--bg-1)";return`
        <tr style="background: ${c};">
          <td style="font-weight:bold; color:var(--text-1); background: ${c} !important;">${t.cust.name}</td>
          <td class="mono font-bold" style="background: ${c} !important;">${s(t.prevBal)}</td>
          <td class="mono font-bold ${t.todayCustSales>0?"text-brand":""}" style="background: ${c} !important;">+ ${s(t.todayCustSales)}</td>
          <td class="mono font-bold ${t.todayCustCollections>0?"text-good":""}" style="background: ${c} !important;">- ${s(t.todayCustCollections)}</td>
          <td class="mono font-bold text-indigo" style="font-size:13px; background: ${c} !important;">${s(t.currentBal)}</td>
          <td class="no-print" style="text-align:center; background: ${c} !important;">${n}</td>
        </tr>
      `}).join("");const W=e?D.find(t=>t.id===e)?.name||"المندوب":"جميع المناديب";let Q=`
      <h3 class="font-heading mb-12" style="font-size:15px; border-bottom: 2px solid #64748b; padding-bottom: 6px; margin-top: 24px; color:#475569;">💸 سلف وقروض المناديب القائمة (الربط المالي مع شؤون الموظفين)</h3>
    `;S.length===0?Q+='<div class="alert info" style="text-align:center;">لا توجد سلف شخصية أو قروض قائمة مسجلة بذمة المندوب حالياً في شؤون الموظفين.</div>':Q+=`
        <div class="table-container mb-24">
          <table class="data-dense" style="width:100%;">
            <thead>
              <tr style="background:#475569;">
                ${e?"":'<th style="background:#475569 !important; color:#fff;">المندوب</th>'}
                <th style="background:#475569 !important; color:#fff;">تاريخ الصرف</th>
                <th style="background:#475569 !important; color:#fff;">البيان والملاحظات</th>
                <th style="background:#475569 !important; color:#fff;" class="mono">قيمة السلفة الكلية</th>
                <th style="background:#475569 !important; color:#fff;" class="mono">المسدد منها</th>
                <th style="background:#475569 !important; color:#fff;" class="mono">الرصيد المتبقي بذمة المندوب</th>
              </tr>
            </thead>
            <tbody>
              ${S.map(t=>{const n="var(--bg-1)";return`
                  <tr style="background:${n};">
                    ${e?"":`<td style="font-weight:bold; color:var(--text-1); background:${n} !important;">${t.empName}</td>`}
                    <td class="mono font-bold" style="background:${n} !important;">${t.date}</td>
                    <td style="background:${n} !important;">${t.notes||"سلفة شخصية"}</td>
                    <td class="mono" style="background:${n} !important;">${s(t.amount||0)}</td>
                    <td class="mono text-good" style="background:${n} !important;">${s(t.paidAmount||0)}</td>
                    <td class="mono font-bold text-bad" style="font-size:13px; color:#ef4444 !important; background:${n} !important;">${s(t.remainingBalance||0)}</td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
      `;let y=`
      <style>
        @media print {
          /* Force Chrome to render color graphics, backgrounds and borders */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background: #fff !important;
            color: #000 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print, .filterbar, .tab-switcher, button, .modal-overlay, .page-header {
            display: none !important;
          }
          .page-content {
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          .card {
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
            background: #f8fafc !important;
            page-break-inside: avoid;
            margin-bottom: 12px !important;
            padding: 12px !important;
          }
          /* Show print header */
          .print-only-header {
            display: block !important;
          }
          /* Print KPIs side-by-side in columns instead of stacking */
          .kpi-container-print {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            justify-content: space-between !important;
            gap: 6px !important;
            margin-bottom: 20px !important;
          }
          .kpi-card-print {
            flex: 1 !important;
            min-width: 90px !important;
            padding: 12px 4px !important;
            background: #f8fafc !important;
            text-align: center !important;
            border-radius: 8px !important;
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
          }
          .kpi-card-print:nth-child(1) { border-top: 4px solid #3b82f6 !important; }
          .kpi-card-print:nth-child(2) { border-top: 4px solid #10b981 !important; }
          .kpi-card-print:nth-child(3) { border-top: 4px solid ${L?"#10b981":"#ef4444"} !important; }
          .kpi-card-print:nth-child(4) { border-top: 4px solid #6366f1 !important; }
          .kpi-card-print:nth-child(5) { border-top: 4px solid #f59e0b !important; }
          .kpi-card-print:nth-child(6) { border-top: 4px solid #64748b !important; }

          .kpi-card-print div {
            font-size: 8px !important;
            color: #475569 !important;
            font-weight: bold !important;
          }
          .kpi-card-print .mono {
            font-size: 11px !important;
            margin-top: 4px !important;
            font-weight: bold !important;
          }
          /* Make table headers colorful and premium */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          th {
            background-color: #1e3c72 !important;
            color: #ffffff !important;
            font-weight: bold !important;
            font-size: 9px !important;
            text-align: center !important;
            border: 1px solid #cbd5e1 !important;
            padding: 6px !important;
          }
          td {
            border: 1px solid #e2e8f0 !important;
            padding: 5px !important;
            font-size: 9px !important;
          }
          h1, h2, h3, h4 {
            color: #0f172a !important;
            font-family: Arial, sans-serif !important;
          }
          h3 {
            font-size: 11px !important;
            margin-top: 15px !important;
            border-bottom: 2px solid #1e3c72 !important;
            padding-bottom: 4px !important;
            color: #1e3c72 !important;
          }
        }
      </style>

      <!-- Print Only Header -->
      <div class="print-only-header" style="display:none; margin-bottom:24px; border-radius:8px; overflow:hidden; border:1px solid #cbd5e1;">
        <!-- Top colored band with corporate gradients -->
        <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 16px 20px; color: #fff; display: flex; justify-content: space-between; align-items: center;">
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: bold; font-family: var(--font-heading); color: #00f2fe; text-shadow: 0 1px 3px rgba(0,0,0,0.3);">نظم الامداد الحديثة</div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.85); margin-top: 4px; text-align: right;">نظام التوزيع وإدارة المناديب</div>
          </div>
          <div style="text-align: left;">
            <div style="font-size: 14px; font-weight: bold; font-family: var(--font-heading); color: #fff; letter-spacing: 0.5px;">سجل تجاري: 4625072049</div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.85); margin-top: 4px; text-align: left;">الرقم الضريبي: 310061596700003</div>
          </div>
        </div>
        <!-- Sub-bar with metadata -->
        <div style="background: #f8fafc; padding: 10px 20px; border-bottom: 2px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #334155; font-weight: bold;">
          <div>تقرير مبيعات وحركة المديونيات اليومي</div>
          <div>التاريخ: ${a}</div>
          <div>المندوب: ${W}</div>
          <div>تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA")}</div>
        </div>
      </div>

      <!-- KPI cards -->
      <div class="kpi-container-print" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:12px; margin-bottom: 24px;">
        <div class="card kpi-card-print" style="padding:16px; border-left: 4px solid var(--brand); border-radius:14px;">
          <div class="text-2 mb-4" style="font-size:11px; font-weight:bold; color:var(--text-2);">إجمالي المبيعات (شامل الضريبة)</div>
          <div class="mono font-bold text-brand" style="font-size:20px;">${s(C)}</div>
          <div style="font-size:10px; color:var(--text-3); margin-top:4px;">مبيعات يوم ${a}</div>
        </div>
        <div class="card kpi-card-print" style="padding:16px; border-left: 4px solid var(--good); border-radius:14px;">
          <div class="text-2 mb-4" style="font-size:11px; font-weight:bold; color:var(--text-2);">إجمالي المقبوضات/المتحصلات</div>
          <div class="mono font-bold text-good" style="font-size:20px;">${s(o)}</div>
          <div style="font-size:10px; color:var(--text-3); margin-top:4px;">دفعات الفواتير + سندات القبض</div>
        </div>
        <div class="card kpi-card-print" style="padding:16px; border-left: 4px solid var(--${M}); border-radius:14px;">
          <div class="text-2 mb-4" style="font-size:11px; font-weight:bold; color:var(--text-2);">${N}</div>
          <div class="mono font-bold text-${M}" style="font-size:20px;">${s(Y)}</div>
          <div style="font-size:10px; color:var(--text-3); margin-top:4px;">${O}</div>
        </div>
        <div class="card kpi-card-print" style="padding:16px; border-left: 4px solid var(--indigo); border-radius:14px;">
          <div class="text-2 mb-4" style="font-size:11px; font-weight:bold; color:var(--text-2);">صافي أرباح المبيعات</div>
          <div class="mono font-bold text-indigo" style="font-size:20px;">${s(v)}</div>
          <div style="font-size:10px; color:var(--text-3); margin-top:4px;">الكمية × (سعر البيع - سعر الشراء)</div>
        </div>
        <div class="card kpi-card-print" style="padding:16px; border-left: 4px solid #f59e0b; border-radius:14px;">
          <div class="text-2 mb-4" style="font-size:11px; font-weight:bold; color:var(--text-2);">إجمالي مديونية العملاء الحالية</div>
          <div class="mono font-bold" style="font-size:20px; color:#d97706;">${s(T)}</div>
          <div style="font-size:10px; color:var(--text-3); margin-top:4px;">الرصيد القائم لعملاء المندوب حالياً</div>
        </div>
        <div class="card kpi-card-print" style="padding:16px; border-left: 4px solid #64748b; border-radius:14px;">
          <div class="text-2 mb-4" style="font-size:11px; font-weight:bold; color:var(--text-2);">سلف المندوب القائمة (شؤون الموظفين)</div>
          <div class="mono font-bold text-bad" style="font-size:20px; color:#ef4444 !important;">${s(V)}</div>
          <div style="font-size:10px; color:var(--text-3); margin-top:4px;">السلف النشطة: ${S.length} سلفة قائمة</div>
        </div>
      </div>

      <!-- Outstanding Loans Details Section -->
      ${Q}

      <!-- Invoices and Items Section -->
      <h3 class="font-heading mb-12" style="font-size:15px; border-bottom: 1px solid var(--border-soft); padding-bottom: 6px; margin-top: 24px;">📄 فواتير مبيعات المندوب وتفاصيل الأصناف والربحية</h3>
    `;u.length===0?y+=`<div class="alert info mb-24" style="text-align:center;">لا توجد فواتير مبيعات مسجلة لـ ${W} في تاريخ ${a}</div>`:(y+=`
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
      `,u.forEach(t=>{const n=t.number||t.invoiceNumber||t.id,c=d.find(k=>k.id===t.customerId)?.name||t.customerName||"عميل نقدي",w=t.paymentMethod==="cash"?"نقدي":t.paymentMethod==="credit"?"آجل":"جزئي";let x=0,B=t.subtotal||0;const $=(t.lines||[]).map(k=>{const F=I.find(ut=>ut.id===k.productId),gt=F?F.purchasePrice!==void 0?F.purchasePrice:F.costPrice!==void 0?F.costPrice:F.averageCost||0:k.averageCost||k.costPrice||k.purchasePrice||0,U=k.qty||0,X=U*gt;x+=X;const et=k.unitPrice!==void 0?k.unitPrice:k.price||0,ot=k.discount||0,nt=U*et*(1-ot/100),at=nt-X,bt=at>=0?"text-good":"text-bad";return`
            <tr>
              <td style="padding:6px 12px; text-align:right; font-weight:bold; color:var(--text-1);">${k.productName||"صنف غير معروف"}</td>
              <td style="padding:6px 12px;" class="mono">${U}</td>
              <td style="padding:6px 12px;" class="mono">${s(et)}</td>
              <td style="padding:6px 12px;" class="mono">${ot}%</td>
              <td style="padding:6px 12px;" class="mono font-bold">${s(nt)}</td>
              <td style="padding:6px 12px;" class="mono">${s(X)}</td>
              <td style="padding:6px 12px;" class="mono font-bold ${bt}">${s(at)}</td>
            </tr>
          `}).join(""),G=t.totalWithVat||0,ct=t.paidAmount||0,pt=t.remainingAmount||0,J=B-x,mt=B>0?J/B*100:0,tt=J>=0?"text-good":"text-bad";y+=`
          <tr style="background:var(--bg-1); font-weight:bold; border-top: 2px solid var(--border-soft);">
            <td><a href="javascript:void(0)" onclick="window.viewInvoice && window.viewInvoice('${t.id}')" style="color:var(--brand); text-decoration:underline;">${n}</a></td>
            <td>${c}</td>
            <td><span class="badge ${t.paymentMethod==="cash"?"good":"warning"}">${w}</span></td>
            <td class="mono font-bold">${s(G)}</td>
            <td class="mono text-good">${s(ct)}</td>
            <td class="mono text-bad">${s(pt)}</td>
            <td class="mono">${s(x)}</td>
            <td class="mono ${tt}">${s(J)}</td>
            <td class="mono ${tt}">${mt.toFixed(1)}%</td>
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
                  ${$}
                </tbody>
              </table>
            </td>
          </tr>
        `}),y+=`
            </tbody>
          </table>
        </div>
      `),y+=`
      <!-- Full Representative Customer Debts Report -->
      <h3 class="font-heading mb-12" style="font-size:15px; border-bottom: 1px solid var(--border-soft); padding-bottom: 6px; margin-top: 24px;">📊 تقرير حركة مديونيات وأرصدة كافة عملاء المندوب</h3>
    `,q.length===0?y+=`<div class="alert info mb-24" style="text-align:center;">لا يوجد عملاء مسجلين للمندوب ${W}</div>`:y+=`
        <div class="table-container mb-24">
          <table class="data-dense" style="width:100%;">
            <thead>
              <tr style="background:var(--bg-3);">
                <th>اسم العميل</th>
                <th class="mono">المديونية السابقة (رصيد أول اليوم)</th>
                <th class="mono">مبيعات اليوم (+)</th>
                <th class="mono">تحصيلات اليوم (-)</th>
                <th class="mono" style="color:var(--brand);">المديونية الحالية (رصيد نهاية اليوم)</th>
                <th class="no-print">حالة حركة اليوم</th>
              </tr>
            </thead>
            <tbody>
              ${lt}
            </tbody>
          </table>
        </div>
      `,y+='<h3 class="font-heading mb-12" style="font-size:15px; border-bottom: 1px solid var(--border-soft); padding-bottom: 6px;">💵 سندات القبض والتحصيلات اللاحقة لعملاء المندوب اليوم</h3>',f.length===0?y+=`<div class="alert info" style="text-align:center;">لا توجد سندات قبض مسجلة لـ ${W} في تاريخ ${a}</div>`:(y+=`
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
      `,f.forEach(t=>{const n=t.id?.slice(0,8)||"—",c=t.accountName||"عميل",w=t.method==="cash"?"نقدي":t.method==="bank"?"تحويل بنكي":"شيك",x=t.notes||"سداد حساب",B=t.amount||0;y+=`
          <tr style="background:var(--bg-1);">
            <td class="mono font-bold">${n}</td>
            <td style="font-weight:bold;">${c}</td>
            <td><span class="badge ${t.method==="cash"?"good":"info"}">${w}</span></td>
            <td>${x}</td>
            <td class="mono font-bold text-good" style="font-size:15px;">${s(B)}</td>
          </tr>
        `}),y+=`
            </tbody>
          </table>
        </div>
      `),r.innerHTML=y}catch(i){r.innerHTML=`<div class="alert bad">حدث خطأ في تحميل التقرير اليومي: ${i.message}</div>`}}function $t(p,r,e){document.getElementById("planner-rep-name").textContent=r,document.getElementById("planner-monthly-target").value=e,E=[],I.length>0&&(E.push({productId:I[0].id,productName:I[0].name,price:I[0].salePrice||100,weight:50}),I.length>1&&E.push({productId:I[1].id,productName:I[1].name,price:I[1].salePrice||100,weight:50})),K(),window.openModal("target-planner-modal")}function K(){const p=parseFloat(document.getElementById("planner-monthly-target").value)||0,r=parseFloat(document.getElementById("planner-work-days").value)||26,e=r>0?p/r:0;document.getElementById("planner-daily-needed").textContent=`${s(e)}`,Pt(e)}function kt(){const p=document.getElementById("planner-product-select"),r=p.value;if(!r)return;if(E.some(d=>d.productId===r)){window.showToast("هذا الصنف مضاف بالفعل للمزيج","warning");return}const e=p.options[p.selectedIndex],a=e.textContent.split(" (")[0],i=parseFloat(e.dataset.price)||100,l=E.reduce((d,g)=>d+g.weight,0),m=Math.max(0,100-l);E.push({productId:r,productName:a,price:i,weight:m>0?m:0}),p.value="",K()}function It(p){E.splice(p,1),K()}function Et(p,r){E[p].weight=parseFloat(r)||0;const e=parseFloat(document.getElementById("planner-monthly-target").value)||0,a=parseFloat(document.getElementById("planner-work-days").value)||26,i=a>0?e/a:0;let l=0,m=0,d=0;E.forEach((b,P)=>{l+=b.weight;const u=i*(b.weight/100);m+=u;const f=b.price>0?u/b.price:0;d+=f;const C=document.getElementById(`planner-row-amt-${P}`),o=document.getElementById(`planner-row-cart-${P}`);C&&(C.textContent=s(u)),o&&(o.textContent=`${f.toFixed(1)} كرتونة / وحدة`)}),document.getElementById("planner-total-weight-cell").textContent=`${l}%`,document.getElementById("planner-total-amount-cell").textContent=s(m),document.getElementById("planner-total-cartons-cell").textContent=`${d.toFixed(1)} كرتونة`;const g=document.getElementById("planner-weight-warning"),h=document.getElementById("planner-current-weight-sum");g&&h&&(h.textContent=l,Math.abs(l-100)>.01?g.classList.remove("hidden"):g.classList.add("hidden"))}function Pt(p){const r=document.getElementById("planner-mix-tbody");if(!r)return;if(E.length===0){r.innerHTML='<tr><td colspan="6" style="text-align:center; padding:16px; color:var(--text-2);">لا توجد أصناف في مزيج الأهداف بعد</td></tr>',document.getElementById("planner-total-weight-cell").textContent="0%",document.getElementById("planner-total-amount-cell").textContent="0.00 ر.س",document.getElementById("planner-total-cartons-cell").textContent="0 كرتونة";return}let e=0,a=0,i=0;r.innerHTML=E.map((d,g)=>{const h=p*(d.weight/100),b=d.price>0?h/d.price:0;return e+=d.weight,a+=h,i+=b,`
      <tr>
        <td><strong style="color:var(--text-1);">${d.productName}</strong></td>
        <td class="mono">${s(d.price)}</td>
        <td>
          <input type="number" class="input sm mono" style="width:80px; text-align:center; display:inline-block;"
                 value="${d.weight}" oninput="updateMixRowWeight(${g}, this.value)" /> %
        </td>
        <td class="mono text-indigo" id="planner-row-amt-${g}">${s(h)}</td>
        <td class="mono font-bold text-brand" id="planner-row-cart-${g}">${b.toFixed(1)} كرتونة / وحدة</td>
        <td class="no-print">
          <button class="btn btn-icon sm btn-ghost text-bad" onclick="removeProductFromPlannerMix(${g})">🗑️</button>
        </td>
      </tr>
    `}).join(""),document.getElementById("planner-total-weight-cell").textContent=`${e}%`,document.getElementById("planner-total-amount-cell").textContent=s(a),document.getElementById("planner-total-cartons-cell").textContent=`${i.toFixed(1)} كرتونة`;const l=document.getElementById("planner-weight-warning"),m=document.getElementById("planner-current-weight-sum");l&&m&&(m.textContent=e,Math.abs(e-100)>.01?l.classList.remove("hidden"):l.classList.add("hidden"))}export{Dt as render};
