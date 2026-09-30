import{s as L,t as N,d as q,C as H,g as m,a as k,f as i,b as bt,c as vt}from"./index-DaYejt0r.js";import{collection as G,getDocs as xt,where as ft}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function Wt(d,c){const S=c?.displayName||"مدير النظام";d.innerHTML=`
    <!-- Advanced Dashboard Hero Header -->
    <div class="dashboard-hero animate-fade-in">
      <div class="hero-greeting">
        <h1>مرحباً بك مجدداً، ${S} 👋</h1>
        <p>إليك ملخص الأداء التنفيذي والمؤشرات المالية والبيعية المباشرة</p>
      </div>
      <div class="hero-actions">
        <div class="quick-filters" style="margin:0; border:none; background:transparent;">
          <button class="quick-filter-btn" onclick="dashSetRange('today')">اليوم</button>
          <button class="quick-filter-btn" onclick="dashSetRange('week')">الأسبوع</button>
          <button class="quick-filter-btn active" onclick="dashSetRange('month')">هذا الشهر</button>
          <button class="quick-filter-btn" onclick="dashSetRange('last_month')">الشهر الماضي</button>
        </div>
        <div style="width:1px; height:24px; background:var(--border-soft); margin:0 8px;"></div>
        <input type="date" id="dash-from" value="${L()}" style="background:var(--bg-2); border:1px solid var(--border-soft); color:var(--text-0); padding:6px 10px; border-radius:8px;" />
        <span style="color:var(--text-2); font-size:12px;">إلى</span>
        <input type="date" id="dash-to" value="${N()}" style="background:var(--bg-2); border:1px solid var(--border-soft); color:var(--text-0); padding:6px 10px; border-radius:8px;" />
        <button class="btn btn-primary btn-sm" onclick="loadDashboard()" style="margin-right:8px; border-radius:8px; padding:6px 16px;">
          🔄 تحديث
        </button>
      </div>
    </div>

    <div class="page-content" id="dash-content" style="padding: 0;">
      <div class="page-loading"><div class="loading-spinner"></div><span>جارٍ تحليل البيانات…</span></div>
    </div>`,window.dashSetRange=h=>{const g=N(),r=new Date;if(document.querySelectorAll(".quick-filter-btn").forEach(p=>p.classList.remove("active")),window.event&&window.event.target&&window.event.target.classList.add("active"),h==="today")document.getElementById("dash-from").value=g,document.getElementById("dash-to").value=g;else if(h==="week"){const p=new Date(r);p.setDate(r.getDate()-r.getDay()+1),document.getElementById("dash-from").value=p.toISOString().split("T")[0],document.getElementById("dash-to").value=g}else if(h==="month")document.getElementById("dash-from").value=L(),document.getElementById("dash-to").value=g;else if(h==="last_month"){const p=new Date(r.getFullYear(),r.getMonth()-1,1),v=new Date(r.getFullYear(),r.getMonth(),0);document.getElementById("dash-from").value=p.toISOString().split("T")[0],document.getElementById("dash-to").value=v.toISOString().split("T")[0]}loadDashboard()},window.loadDashboard=async()=>{const h=document.getElementById("dash-from")?.value||L(),g=document.getElementById("dash-to")?.value||N();await ot(h,g)},await ot(L(),N())}async function ot(d,c){const S=document.getElementById("dash-content");if(!S)return;S.innerHTML=`
    <div class="animate-fade-in">
      <div class="kpi-grid mb-24">
        ${[1,2,3,4].map(()=>`
          <div class="kpi-card" style="min-height:120px;">
            <div class="skeleton" style="width:40px;height:40px;border-radius:10px;margin-bottom:12px;"></div>
            <div class="skeleton" style="width:60%;height:14px;margin-bottom:8px;"></div>
            <div class="skeleton" style="width:80%;height:22px;margin-bottom:6px;"></div>
            <div class="skeleton" style="width:50%;height:12px;"></div>
          </div>`).join("")}
      </div>
      <div class="content-grid-sidebar mb-24">
        <div class="card" style="border-radius:16px;min-height:340px;">
          <div class="skeleton" style="width:100%;height:100%;min-height:340px;border-radius:16px;"></div>
        </div>
        <div class="card" style="border-radius:16px;min-height:340px;">
          <div class="skeleton" style="width:100%;height:100%;min-height:340px;border-radius:16px;"></div>
        </div>
      </div>
    </div>`;let h=[],g=[],r=[],p=[],v=[],$=[],V=[],Y=[],z=[],W=[],R=[];const y=t=>t?t.date?t.date:t.createdAt?t.createdAt.toDate?t.createdAt.toDate().toISOString().split("T")[0]:t.createdAt.seconds?new Date(t.createdAt.seconds*1e3).toISOString().split("T")[0]:typeof t.createdAt=="string"?t.createdAt.split("T")[0]:"":"":"";try{const t=G(q,`companies/${H}/collections`),e=G(q,`companies/${H}/journalEntries`),o=G(q,`companies/${H}/chartOfAccounts`),[l,F,j,lt,rt,dt,ct,pt,ut,ht,gt]=await Promise.all([xt(G(q,`companies/${H}/salesInvoices`)).then(s=>s.docs.map(u=>({id:u.id,...u.data()}))).catch(s=>(console.warn(s),[])),m(k.salesReturns?k.salesReturns():"salesReturns").catch(s=>(console.warn(s),[])),m(k.purchaseInvoices()).catch(s=>(console.warn(s),[])),m(k.stockByWarehouse()).catch(s=>(console.warn(s),[])),m(k.receipts()).catch(s=>(console.warn(s),[])),m(e,[ft("status","==","posted")]).catch(s=>(console.warn(s),[])),m(o).catch(s=>(console.warn(s),[])),m(t).catch(s=>(console.warn(s),[])),m(k.products()).catch(s=>(console.warn(s),[])),m(k.salesReps?k.salesReps():"salesReps").catch(s=>(console.warn(s),[])),m(k.customers?k.customers():"customers").catch(s=>(console.warn(s),[]))]);h=l||[],g=F||[],r=j||[],v=rt||[],$=pt||[],V=dt||[],Y=ct||[],z=ut||[],W=ht||[],R=gt||[],p=(lt||[]).filter(s=>s.stockStatus==="out"||s.stockStatus==="low").slice(0,10),h=h.filter(s=>{const u=y(s);return(!d||u>=d)&&(!c||u<=c)}),g=g.filter(s=>{const u=y(s);return(!d||u>=d)&&(!c||u<=c)}),r=r.filter(s=>{const u=y(s);return(!d||u>=d)&&(!c||u<=c)}),v=v.filter(s=>{const u=y(s);return(!d||u>=d)&&(!c||u<=c)}),$=$.filter(s=>{const u=y(s);return(!d||u>=d)&&(!c||u<=c)})}catch(t){console.error("Dashboard fetch error",t)}const x=h.filter(t=>t.status!=="cancelled"),f=g.filter(t=>t.status!=="cancelled");let C=0,I=0;x.forEach(t=>{const e=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total||0),o=parseFloat(t.subtotal||t.totalWithoutVat||t.netTotal||(e>0?e/1.15:0));C+=e,I+=o});const D=Math.max(0,C-I),a=x.length,b=a>0?C/a:0;let B=0,J=0;f.forEach(t=>{const e=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total||0),o=parseFloat(t.subtotal||t.totalWithoutVat||(e>0?e/1.15:0));B+=e,J+=o});const nt=f.length,M=Math.max(0,C-B),K=Math.max(0,I-J),Q={};z.forEach(t=>{Q[t.id]=parseFloat(t.costPrice||t.purchasePrice||0)});let w=0;x.forEach(t=>{if(t.totalCost!==void 0&&t.totalCost!==null)w+=parseFloat(t.totalCost);else{let e=0;(t.items||t.lines||[]).forEach(o=>{const l=parseFloat(o.qty||o.quantity||0),F=parseFloat(o.averageCost||o.costPrice||o.purchasePrice||Q[o.productId||o.id]||0);e+=l*F}),w+=e}});let X=0;f.forEach(t=>{(t.items||t.lines||[]).forEach(e=>{const o=parseFloat(e.qty||e.quantity||0),l=parseFloat(e.averageCost||e.costPrice||e.purchasePrice||Q[e.productId||e.id]||0);X+=o*l})}),w=Math.max(0,w-X),w===0&&V.length>0&&V.filter(t=>t.type==="salesCOGS"||t.sourceType==="salesCOGS"||t.description&&t.description.includes("تكلفة بضاعة")).forEach(t=>{w+=parseFloat(t.totalDebit||t.amount||0)});const U=K-w,tt=K>0?(U/K*100).toFixed(1):"0.0",Z=v.filter(t=>t.entityType==="customer"||!t.entityType||t.type==="receipt");let E=Z.reduce((t,e)=>t+parseFloat(e.amount||0),0);$.forEach(t=>{E+=parseFloat(t.amount||0)});const it=Math.max(0,M-E),et=M>0?Math.min(100,E/M*100).toFixed(1):E>0?"100.0":"0.0",A={};R.forEach(t=>{t.id&&(t.repId||t.assignedRepId)&&(A[t.id]=t.repId||t.assignedRepId)});const n={};W.forEach(t=>{n[t.id]={id:t.id,name:t.name||"مندوب",zone:t.zone||"مسار ميداني",costCenterId:t.costCenterId||null,target:parseFloat(t.monthlyTarget||0),salesWithVat:0,salesSubtotal:0,returnsWithVat:0,returnsSubtotal:0,netSalesWithVat:0,netSalesSubtotal:0,collections:0,invoiceCount:0,returnCount:0}});const T="rep_direct_warehouse";n[T]={id:T,name:"المستودع الرئيسي (مبيعات مباشرة)",zone:"إدارة المبيعات المركزية",costCenterId:null,target:0,salesWithVat:0,salesSubtotal:0,returnsWithVat:0,returnsSubtotal:0,netSalesWithVat:0,netSalesSubtotal:0,collections:0,invoiceCount:0,returnCount:0};const O=t=>{if(t.repId&&n[t.repId])return t.repId;if(t.salesRepId&&n[t.salesRepId])return t.salesRepId;if(t.repName){const o=W.find(l=>l.name===t.repName||l.id===t.repName);if(o)return o.id}if(t.costCenterId){const o=W.find(l=>l.costCenterId===t.costCenterId||l.name&&t.costCenterName&&t.costCenterName.includes(l.name));if(o)return o.id}const e=t.customerId||t.targetId;return e&&A[e]&&n[A[e]]?A[e]:T};x.forEach(t=>{const e=O(t),o=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total||0),l=parseFloat(t.subtotal||t.totalWithoutVat||(o>0?o/1.15:0));n[e]||(n[e]={id:e,name:t.repName||"مندوب مبيعات",zone:"مسار ميداني",target:0,salesWithVat:0,salesSubtotal:0,returnsWithVat:0,returnsSubtotal:0,netSalesWithVat:0,netSalesSubtotal:0,collections:0,invoiceCount:0,returnCount:0}),n[e].salesWithVat+=o,n[e].salesSubtotal+=l,n[e].invoiceCount+=1}),f.forEach(t=>{const e=O(t),o=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total||0),l=parseFloat(t.subtotal||t.totalWithoutVat||(o>0?o/1.15:0));n[e]||(n[e]={id:e,name:t.repName||"مندوب مبيعات",zone:"مسار ميداني",target:0,salesWithVat:0,salesSubtotal:0,returnsWithVat:0,returnsSubtotal:0,netSalesWithVat:0,netSalesSubtotal:0,collections:0,invoiceCount:0,returnCount:0}),n[e].returnsWithVat+=o,n[e].returnsSubtotal+=l,n[e].returnCount+=1}),Z.forEach(t=>{const e=O(t);n[e]&&(n[e].collections+=parseFloat(t.amount||0))}),$.forEach(t=>{const e=O(t);n[e]&&(n[e].collections+=parseFloat(t.amount||0))});const P=Object.values(n).map(t=>{const e=Math.max(0,t.salesWithVat-t.returnsWithVat),o=Math.max(0,t.salesSubtotal-t.returnsSubtotal),l=Math.max(0,e-t.collections),F=e>0?Math.min(100,t.collections/e*100):t.collections>0?100:0;return{...t,netSalesWithVat:e,netSalesSubtotal:o,gap:l,colRate:F}}).filter(t=>t.salesWithVat>0||t.returnsWithVat>0||t.collections>0||t.id!==T).sort((t,e)=>e.netSalesWithVat-t.netSalesWithVat||e.salesWithVat-t.salesWithVat).slice(0,6),at=P.length>0?Math.max(...P.map(t=>t.netSalesWithVat||t.salesWithVat||1)):1,st=x.slice(0,8);S.innerHTML=`
    <div class="animate-fade-in">
      <!-- Top Primary Financial KPI Grid -->
      <div class="kpi-grid mb-24">
        ${_("💰","إجمالي المبيعات (شامل الضريبة 15%)",i(C),`صافي: <b>${i(M)}</b> • قبل الضريبة: ${i(I)}`,"sales",`${i(D)} ضريبة`)}
        
        ${_("✅","المبالغ المحصلة (سندات ونقدي)",i(E),`نسبة التغطية: <b>${et}%</b> • المتبقي: ${i(it)}`,"receipts",`${et}% تحصيل`)}
        
        ${_("🧾","الفواتير والمردودات",`${a.toLocaleString("ar")} فاتورة`,`المردودات: <b>${i(B)}</b> (${nt} إشعار) • متوسط: ${i(b)}`,"invoices",`${a} حركة`)}
        
        ${_("📈","مجمل الربح التقديري (Gross Profit)",i(U),`هامش الربح: <b>${tt}%</b> • تكلفة البضاعة: ${i(w)}`,"profit",`${tt}% هامش`,U>=0?"up":"down")}
      </div>

      <!-- Charts & Top Reps Row -->
      <div class="content-grid-sidebar mb-24" style="align-items: stretch;">
        
        <!-- Daily Sales & Collections Chart Card -->
        <div class="card" style="border-radius:16px; background:var(--bg-1); border:1px solid var(--border-soft); display:flex; flex-direction:column;">
          <div class="card-header" style="border-bottom: 1px solid var(--border-soft); padding:18px 20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="kpi-icon-glass" style="width:38px; height:38px; font-size:18px; border-radius:10px; background:rgba(99,102,241,0.12); color:#6366F1; display:flex; align-items:center; justify-content:center;">📊</div>
              <div>
                <h3 style="font-size:16px; font-family:var(--font-heading); color:var(--text-0); margin:0;">تحليل المبيعات والتحصيلات اليومية</h3>
                <span class="text-2" style="font-size:12px;">مقارنة صافي المبيعات بالمبالغ المحصلة فعلياً للفترة</span>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:12px; font-size:12px; font-weight:700;">
              <span style="display:flex; align-items:center; gap:6px; color:#6366F1;">
                <span style="width:10px; height:10px; border-radius:50%; background:#6366F1;"></span>
                صافي المبيعات
              </span>
              <span style="display:flex; align-items:center; gap:6px; color:#10B981;">
                <span style="width:10px; height:10px; border-radius:50%; background:#10B981;"></span>
                التحصيلات النقدية
              </span>
            </div>
          </div>
          <div class="card-body" style="padding:20px; flex:1; min-height:300px; position:relative;">
            <div class="chart-container" style="height:300px; width:100%; position:relative;">
              <canvas id="sales-chart"></canvas>
            </div>
          </div>
        </div>

        <!-- Upgraded Sales Reps Leaderboard Card -->
        <div class="card" style="border-radius:16px; background:var(--bg-1); border:1px solid var(--border-soft); display:flex; flex-direction:column;">
          <div class="card-header" style="border-bottom: 1px solid var(--border-soft); padding:18px 20px; display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="kpi-icon-glass" style="width:38px; height:38px; font-size:18px; border-radius:10px; background:rgba(245,158,11,0.12); color:#F59E0B; display:flex; align-items:center; justify-content:center;">🏆</div>
              <div>
                <h3 style="font-size:16px; font-family:var(--font-heading); color:var(--text-0); margin:0;">نخبة المناديب ومؤشرات التحصيل</h3>
                <span class="text-2" style="font-size:12px;">المبيعات قبل/بعد الضريبة والصافي والتحصيلات</span>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="navigate('sales-reps')" style="font-size:12px; color:var(--brand); padding:4px 8px;" title="فتح تقرير المناديب الكامل">
              عرض الكل ❯
            </button>
          </div>
          
          <div class="card-body" style="padding:16px 20px; flex:1; overflow-y:auto; max-height:480px;">
            ${P.length===0?`
              <div class="empty-state" style="padding:40px 0; text-align:center;">
                <div class="empty-icon" style="font-size:36px; margin-bottom:8px;">🚚</div>
                <h4 style="color:var(--text-0); margin-bottom:4px;">لا توجد حركات مناديب مسجلة</h4>
                <p style="font-size:12px; color:var(--text-2);">لم تسجل فواتير أو تحصيلات للمناديب خلال هذه الفترة</p>
              </div>`:`
              <div style="display:flex; flex-direction:column; gap:16px;">
                ${P.map((t,e)=>{const o=["🥇","🥈","🥉","4","5","6"],F=["#F59E0B","#94A3B8","#D97706","#6366F1","#3B82F6","#8B5CF6"][e]||"#6366F1";at>0&&Math.min(100,Math.max(8,t.netSalesWithVat/at*100));const j=t.colRate>=80?"#10B981":t.colRate>=50?"#3B82F6":"#F59E0B";return`
                  <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:14px 16px; transition:all 0.2s ease;">
                    <!-- Rep Header Row -->
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
                      <div style="display:flex; align-items:center; gap:10px;">
                        <span style="display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:8px; font-weight:800; font-size:${e<3?"16px":"12px"}; background:${e<3?"transparent":"rgba(255,255,255,0.08)"}; color:var(--text-0);">
                          ${o[e]}
                        </span>
                        <div>
                          <div style="font-weight:700; font-size:14px; color:var(--text-0); font-family:var(--font-heading); display:flex; align-items:center; gap:6px;">
                            ${t.name}
                            ${t.invoiceCount>0?`<span style="font-size:10.5px; padding:1px 6px; border-radius:6px; background:var(--primary-dim); color:var(--brand); font-weight:600;">${t.invoiceCount} فواتير</span>`:""}
                          </div>
                          <div style="font-size:11px; color:var(--text-2); margin-top:2px;">📍 ${t.zone}</div>
                        </div>
                      </div>

                      <div style="text-align:left;">
                        <div style="font-size:10px; color:var(--text-2); font-weight:600;">صافي المبيعات</div>
                        <div class="mono" style="font-weight:800; font-size:15px; color:${F};">
                          ${i(t.netSalesWithVat)}
                        </div>
                      </div>
                    </div>

                    <!-- Breakdown Financial Mini-Grid -->
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap:6px; background:var(--bg-card); border-radius:8px; padding:8px 10px; margin-bottom:10px; font-size:11px;">
                      <div>
                        <span style="color:var(--text-2); display:block; font-size:10px;">شامل الضريبة 15%:</span>
                        <span class="mono font-bold" style="color:var(--text-0);">${i(t.salesWithVat)}</span>
                      </div>
                      <div>
                        <span style="color:var(--text-2); display:block; font-size:10px;">قبل الضريبة:</span>
                        <span class="mono font-bold" style="color:var(--text-1);">${i(t.salesSubtotal)}</span>
                      </div>
                      <div>
                        <span style="color:var(--text-2); display:block; font-size:10px;">المردودات:</span>
                        <span class="mono font-bold" style="color:${t.returnsWithVat>0?"#EF4444":"var(--text-2)"};">
                          ${t.returnsWithVat>0?`- ${i(t.returnsWithVat)}`:"0.00 ر.س"}
                        </span>
                      </div>
                      <div>
                        <span style="color:var(--text-2); display:block; font-size:10px;">المحصل الفعلي:</span>
                        <span class="mono font-bold" style="color:#10B981;">${i(t.collections)}</span>
                      </div>
                    </div>

                    <!-- Collection Progress Bar & Gap -->
                    <div>
                      <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; margin-bottom:4px;">
                        <span style="color:var(--text-2);">
                          نسبة التحصيل: <b style="color:${j};">${t.colRate.toFixed(1)}%</b>
                        </span>
                        <span style="color:var(--text-2);">
                          المتبقي (الفجوة): <b class="mono" style="color:${t.gap>0?"#F59E0B":"#10B981"};">${i(t.gap)}</b>
                        </span>
                      </div>
                      <div style="height:6px; background:rgba(255,255,255,0.06); border-radius:4px; overflow:hidden; display:flex;">
                        <div style="width:${t.colRate}%; background:${j}; border-radius:4px; transition:width 0.4s ease;"></div>
                      </div>
                    </div>
                  </div>`}).join("")}
              </div>`}
          </div>
        </div>
      </div>

      <!-- Recent Invoices Table (Full Width) -->
      <div class="card mb-24" style="border-radius:16px; background:var(--bg-1); border:1px solid var(--border-soft);">
        <div class="card-header" style="padding:18px 20px; border-bottom:1px solid var(--border-soft); display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:20px;">🧾</span>
            <div>
              <h3 style="font-size:16px; font-family:var(--font-heading); color:var(--text-0); margin:0;">أحدث فواتير المبيعات</h3>
              <span class="text-2" style="font-size:12px;">سجل الحركات الأحدث الصادرة خلال الفترة المحددة</span>
            </div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="navigate('sales-invoices')">عرض السجل الكامل</button>
        </div>
        <div class="table-container" style="margin:0; border:none;">
          <table class="data-dense">
            <thead>
              <tr>
                <th>الرقم المرجعي</th>
                <th>العميل</th>
                <th>المندوب</th>
                <th>التاريخ</th>
                <th>طريقة الدفع</th>
                <th>الحالة</th>
                <th style="text-align:left;">المبلغ قبل الضريبة</th>
                <th style="text-align:left;">الإجمالي شامل الضريبة</th>
              </tr>
            </thead>
            <tbody>
              ${st.length===0?`
                <tr><td colspan="8" style="text-align:center; color:var(--text-2); padding:40px;">
                  <div class="empty-icon" style="font-size:36px; margin-bottom:8px;">📄</div>
                  <div>لا توجد حركات مسجلة في هذه الفترة</div>
                </td></tr>`:st.map(t=>{const e=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total||0),o=parseFloat(t.subtotal||t.totalWithoutVat||(e>0?e/1.15:0));return`
                  <tr onclick="navigate('sales-invoices')" style="cursor:pointer; transition: background 0.2s;">
                    <td class="mono font-bold" style="color:var(--brand);">#${t.invoiceNumber||t.number||t.id.slice(0,8)}</td>
                    <td class="font-semibold" style="color:var(--text-0);">${t.customerName||"عميل نقدي"}</td>
                    <td style="color:var(--text-1);">${t.repName||t.salesRepName||"المستودع الرئيسي"}</td>
                    <td class="dim">${bt(t.createdAt||t.date)}</td>
                    <td><span class="badge ${t.paymentMethod==="cash"?"good":"warn"}">${t.paymentMethod==="cash"?"نقدي":"آجل"}</span></td>
                    <td>${vt(t.status||"pending")}</td>
                    <td class="mono" style="text-align:left; color:var(--text-2);">${i(o)}</td>
                    <td class="mono font-bold text-good" style="text-align:left; font-size:14px;">${i(e)}</td>
                  </tr>`}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>`,yt(x,Z,f,d,c)}function _(d,c,S,h,g,r,p="up"){return`
    <div class="kpi-card ${{sales:"g-blue",invoices:"g-purple",receipts:"g-green",profit:"g-orange"}[g]||"g-blue"}">
      <div class="kpi-header-row">
        <div class="kpi-icon-glass">${d}</div>
        ${r?`<div class="trend-badge">${r}</div>`:""}
      </div>
      <div class="kpi-content">
        <div class="kpi-label">${c}</div>
        <div class="kpi-value mono">${S}</div>
        <div class="kpi-sub">${h}</div>
      </div>
    </div>`}function yt(d,c,S,h,g){const r=document.getElementById("sales-chart");if(!r||typeof Chart>"u")return;const p={},v={},$=new Date(h),V=new Date(g);for(let a=new Date($);a<=V;a.setDate(a.getDate()+1)){const b=a.toISOString().split("T")[0];p[b]=0,v[b]=0}d.forEach(a=>{const b=a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:a.date||"";p[b]!==void 0&&(p[b]+=parseFloat(a.totalWithVat!==void 0?a.totalWithVat:a.total||0))}),S.forEach(a=>{const b=a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:a.date||"";p[b]!==void 0&&(p[b]-=parseFloat(a.totalWithVat!==void 0?a.totalWithVat:a.total||0))}),c.forEach(a=>{const b=a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:a.date||"";v[b]!==void 0&&(v[b]+=parseFloat(a.amount||0))});const Y=Object.keys(p).map(a=>a.slice(5)),z=Object.values(p).map(a=>Math.max(0,a)),W=Object.values(v).map(a=>Math.max(0,a)),R=r.getContext("2d"),y=R.createLinearGradient(0,0,0,280);y.addColorStop(0,"rgba(99, 102, 241, 0.35)"),y.addColorStop(.6,"rgba(99, 102, 241, 0.08)"),y.addColorStop(1,"rgba(99, 102, 241, 0.0)");const x=R.createLinearGradient(0,0,0,280);x.addColorStop(0,"rgba(16, 185, 129, 0.35)"),x.addColorStop(.6,"rgba(16, 185, 129, 0.08)"),x.addColorStop(1,"rgba(16, 185, 129, 0.0)");const f=document.body.classList.contains("theme-light"),C=f?"#0F172A":"#9CA3AF",I=f?"rgba(15, 23, 42, 0.08)":"rgba(255, 255, 255, 0.06)",D=f?"#CBD5E1":"#334155";new Chart(r,{type:"line",data:{labels:Y,datasets:[{label:"صافي المبيعات (ر.س)",data:z,borderColor:"#6366F1",backgroundColor:y,borderWidth:2.5,pointBackgroundColor:"#6366F1",pointBorderColor:f?"#FFFFFF":"#0F172A",pointBorderWidth:2,pointRadius:4,pointHoverRadius:6,fill:!0,tension:.35},{label:"التحصيلات النقدية (ر.س)",data:W,borderColor:"#10B981",backgroundColor:x,borderWidth:2.5,pointBackgroundColor:"#10B981",pointBorderColor:f?"#FFFFFF":"#0F172A",pointBorderWidth:2,pointRadius:4,pointHoverRadius:6,fill:!0,tension:.35}]},options:{responsive:!0,maintainAspectRatio:!1,interaction:{mode:"index",intersect:!1},plugins:{legend:{display:!0,position:"top",align:"end",labels:{color:C,font:{family:"IBM Plex Sans Arabic",size:12,weight:"600"},boxWidth:12,boxHeight:12,usePointStyle:!0}},tooltip:{backgroundColor:"rgba(15, 23, 42, 0.95)",titleFont:{family:"IBM Plex Sans Arabic",size:13,weight:"700"},bodyFont:{family:"IBM Plex Mono",size:13},padding:12,cornerRadius:8,callbacks:{label:function(a){const b=a.dataset.label||"",B=a.parsed.y||0;return` ${b}: ${i(B)}`}}}},scales:{y:{beginAtZero:!0,grid:{color:I},border:{color:D},ticks:{color:C,font:{family:"IBM Plex Mono",size:11,weight:"600"},callback:a=>i(a,!0)}},x:{grid:{display:!1},border:{color:D},ticks:{color:C,font:{family:"IBM Plex Sans Arabic",size:11,weight:"600"}}}}}})}export{Wt as render};
