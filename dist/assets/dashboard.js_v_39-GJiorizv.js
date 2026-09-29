import{s as q,t as H,d as G,C as _,g as k,a as S,f as l,b as bt,c as ft}from"./index-DgsnACKa.js";import{collection as Y,getDocs as xt,where as vt}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function Wt(d,c){const w=c?.displayName||"مدير النظام";d.innerHTML=`
    <!-- Advanced Dashboard Hero Header -->
    <div class="dashboard-hero animate-fade-in">
      <div class="hero-greeting">
        <h1>مرحباً بك مجدداً، ${w} 👋</h1>
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
        <input type="date" id="dash-from" value="${q()}" style="background:var(--bg-2); border:1px solid var(--border-soft); color:var(--text-0); padding:6px 10px; border-radius:8px;" />
        <span style="color:var(--text-2); font-size:12px;">إلى</span>
        <input type="date" id="dash-to" value="${H()}" style="background:var(--bg-2); border:1px solid var(--border-soft); color:var(--text-0); padding:6px 10px; border-radius:8px;" />
        <button class="btn btn-primary btn-sm" onclick="loadDashboard()" style="margin-right:8px; border-radius:8px; padding:6px 16px;">
          🔄 تحديث
        </button>
      </div>
    </div>

    <div class="page-content" id="dash-content" style="padding: 0;">
      <div class="page-loading"><div class="loading-spinner"></div><span>جارٍ تحليل البيانات…</span></div>
    </div>`,window.dashSetRange=b=>{const f=H(),p=new Date;if(document.querySelectorAll(".quick-filter-btn").forEach(u=>u.classList.remove("active")),window.event&&window.event.target&&window.event.target.classList.add("active"),b==="today")document.getElementById("dash-from").value=f,document.getElementById("dash-to").value=f;else if(b==="week"){const u=new Date(p);u.setDate(p.getDate()-p.getDay()+1),document.getElementById("dash-from").value=u.toISOString().split("T")[0],document.getElementById("dash-to").value=f}else if(b==="month")document.getElementById("dash-from").value=q(),document.getElementById("dash-to").value=f;else if(b==="last_month"){const u=new Date(p.getFullYear(),p.getMonth()-1,1),x=new Date(p.getFullYear(),p.getMonth(),0);document.getElementById("dash-from").value=u.toISOString().split("T")[0],document.getElementById("dash-to").value=x.toISOString().split("T")[0]}loadDashboard()},window.loadDashboard=async()=>{const b=document.getElementById("dash-from")?.value||q(),f=document.getElementById("dash-to")?.value||H();await nt(b,f)},await nt(q(),H())}async function nt(d,c){const w=document.getElementById("dash-content");if(!w)return;w.innerHTML=`
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
    </div>`;let b=[],f=[],p=[],u=[],x=[],C=[],B=[],Q=[],A=[],E=[],D=[];const m=t=>t?t.date?t.date:t.createdAt?t.createdAt.toDate?t.createdAt.toDate().toISOString().split("T")[0]:t.createdAt.seconds?new Date(t.createdAt.seconds*1e3).toISOString().split("T")[0]:typeof t.createdAt=="string"?t.createdAt.split("T")[0]:"":"":"";try{const t=Y(G,`companies/${_}/collections`),e=Y(G,`companies/${_}/journalEntries`),s=Y(G,`companies/${_}/chartOfAccounts`),[h,i,j,lt,rt,dt,ct,pt,ut,ht,gt]=await Promise.all([xt(Y(G,`companies/${_}/salesInvoices`)).then(o=>o.docs.map(g=>({id:g.id,...g.data()}))).catch(o=>(console.warn(o),[])),k(S.salesReturns?S.salesReturns():"salesReturns").catch(o=>(console.warn(o),[])),k(S.purchaseInvoices()).catch(o=>(console.warn(o),[])),k(S.stockByWarehouse()).catch(o=>(console.warn(o),[])),k(S.receipts()).catch(o=>(console.warn(o),[])),k(e,[vt("status","==","posted")]).catch(o=>(console.warn(o),[])),k(s).catch(o=>(console.warn(o),[])),k(t).catch(o=>(console.warn(o),[])),k(S.products()).catch(o=>(console.warn(o),[])),k(S.salesReps?S.salesReps():"salesReps").catch(o=>(console.warn(o),[])),k(S.customers?S.customers():"customers").catch(o=>(console.warn(o),[]))]);b=h||[],f=i||[],p=j||[],x=rt||[],C=pt||[],B=dt||[],Q=ct||[],A=ut||[],E=ht||[],D=gt||[],u=(lt||[]).filter(o=>o.stockStatus==="out"||o.stockStatus==="low").slice(0,10),b=b.filter(o=>{const g=m(o);return(!d||g>=d)&&(!c||g<=c)}),f=f.filter(o=>{const g=m(o);return(!d||g>=d)&&(!c||g<=c)}),p=p.filter(o=>{const g=m(o);return(!d||g>=d)&&(!c||g<=c)}),x=x.filter(o=>{const g=m(o);return(!d||g>=d)&&(!c||g<=c)}),C=C.filter(o=>{const g=m(o);return(!d||g>=d)&&(!c||g<=c)})}catch(t){console.error("Dashboard fetch error",t)}const v=b.filter(t=>t.status!=="cancelled"),y=f.filter(t=>t.status!=="cancelled");let F=0,V=0;v.forEach(t=>{const e=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total||0),s=parseFloat(t.subtotal||t.totalWithoutVat||t.netTotal||(e>0?e/1.15:0));F+=e,V+=s});const T=Math.max(0,F-V),a=v.length,r=a>0?F/a:0;let $=0,O=0;y.forEach(t=>{const e=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total||0),s=parseFloat(t.subtotal||t.totalWithoutVat||(e>0?e/1.15:0));$+=e,O+=s});const X=y.length,I=Math.max(0,F-$),U=Math.max(0,V-O),Z={};A.forEach(t=>{Z[t.id]=parseFloat(t.costPrice||t.purchasePrice||0)});let W=0;v.forEach(t=>{if(t.totalCost!==void 0&&t.totalCost!==null)W+=parseFloat(t.totalCost);else{let e=0;(t.items||t.lines||[]).forEach(s=>{const h=parseFloat(s.qty||s.quantity||0),i=parseFloat(s.averageCost||s.costPrice||s.purchasePrice||Z[s.productId||s.id]||0);e+=h*i}),W+=e}});let tt=0;y.forEach(t=>{(t.items||t.lines||[]).forEach(e=>{const s=parseFloat(e.qty||e.quantity||0),h=parseFloat(e.averageCost||e.costPrice||e.purchasePrice||Z[e.productId||e.id]||0);tt+=s*h})}),W=Math.max(0,W-tt),W===0&&B.length>0&&B.filter(t=>t.type==="salesCOGS"||t.sourceType==="salesCOGS"||t.description&&t.description.includes("تكلفة بضاعة")).forEach(t=>{W+=parseFloat(t.totalDebit||t.amount||0)});const J=U-W,et=U>0?(J/U*100).toFixed(1):"0.0",z=x.filter(t=>t.entityType==="customer"||!t.entityType||t.type==="receipt");let R=z.reduce((t,e)=>t+parseFloat(e.amount||0),0);C.forEach(t=>{R+=parseFloat(t.amount||0)}),v.forEach(t=>{const e=(t.paymentMethod||"").toLowerCase();if(e==="cash"||e==="نقدي"||e==="paid"||e==="partial"||e==="جزئي"){const s=parseFloat(t.paidAmount||(e==="cash"||e==="نقدي"||e==="paid")&&(t.totalWithVat||t.total)||0);s>0&&(z.some(i=>i.invoiceId===t.id||i.invoiceNumber===t.invoiceNumber)||C.some(i=>i.invoiceId===t.id)||(R+=s))}});const it=Math.max(0,I-R),at=I>0?Math.min(100,R/I*100).toFixed(1):R>0?"100.0":"0.0",P={};D.forEach(t=>{t.id&&(t.repId||t.assignedRepId)&&(P[t.id]=t.repId||t.assignedRepId)});const n={};E.forEach(t=>{n[t.id]={id:t.id,name:t.name||"مندوب",zone:t.zone||"مسار ميداني",target:parseFloat(t.monthlyTarget||0),salesWithVat:0,salesSubtotal:0,returnsWithVat:0,returnsSubtotal:0,netSalesWithVat:0,netSalesSubtotal:0,collections:0,invoiceCount:0,returnCount:0}});const L="rep_direct_warehouse";n[L]={id:L,name:"المستودع الرئيسي (مبيعات مباشرة)",zone:"إدارة المبيعات المركزية",target:0,salesWithVat:0,salesSubtotal:0,returnsWithVat:0,returnsSubtotal:0,netSalesWithVat:0,netSalesSubtotal:0,collections:0,invoiceCount:0,returnCount:0};const M=t=>{if(t.repId&&n[t.repId])return t.repId;if(t.salesRepId&&n[t.salesRepId])return t.salesRepId;if(t.repName){const s=E.find(h=>h.name===t.repName||h.id===t.repName);if(s)return s.id}const e=t.customerId||t.targetId;return e&&P[e]&&n[P[e]]?P[e]:L};v.forEach(t=>{const e=M(t),s=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total||0),h=parseFloat(t.subtotal||t.totalWithoutVat||(s>0?s/1.15:0));n[e]||(n[e]={id:e,name:t.repName||"مندوب مبيعات",zone:"مسار ميداني",target:0,salesWithVat:0,salesSubtotal:0,returnsWithVat:0,returnsSubtotal:0,netSalesWithVat:0,netSalesSubtotal:0,collections:0,invoiceCount:0,returnCount:0}),n[e].salesWithVat+=s,n[e].salesSubtotal+=h,n[e].invoiceCount+=1}),y.forEach(t=>{const e=M(t),s=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total||0),h=parseFloat(t.subtotal||t.totalWithoutVat||(s>0?s/1.15:0));n[e]||(n[e]={id:e,name:t.repName||"مندوب مبيعات",zone:"مسار ميداني",target:0,salesWithVat:0,salesSubtotal:0,returnsWithVat:0,returnsSubtotal:0,netSalesWithVat:0,netSalesSubtotal:0,collections:0,invoiceCount:0,returnCount:0}),n[e].returnsWithVat+=s,n[e].returnsSubtotal+=h,n[e].returnCount+=1}),z.forEach(t=>{const e=M(t);n[e]&&(n[e].collections+=parseFloat(t.amount||0))}),C.forEach(t=>{const e=M(t);n[e]&&(n[e].collections+=parseFloat(t.amount||0))}),v.forEach(t=>{const e=(t.paymentMethod||"").toLowerCase();if(e==="cash"||e==="نقدي"||e==="paid"||e==="partial"||e==="جزئي"){const s=parseFloat(t.paidAmount||(e==="cash"||e==="نقدي"||e==="paid")&&(t.totalWithVat||t.total)||0);if(s>0&&!(z.some(i=>i.invoiceId===t.id||i.invoiceNumber===t.invoiceNumber)||C.some(i=>i.invoiceId===t.id))){const i=M(t);n[i]&&(n[i].collections+=s)}}});const N=Object.values(n).map(t=>{const e=Math.max(0,t.salesWithVat-t.returnsWithVat),s=Math.max(0,t.salesSubtotal-t.returnsSubtotal),h=Math.max(0,e-t.collections),i=e>0?Math.min(100,t.collections/e*100):t.collections>0?100:0;return{...t,netSalesWithVat:e,netSalesSubtotal:s,gap:h,colRate:i}}).filter(t=>t.salesWithVat>0||t.returnsWithVat>0||t.collections>0||t.id!==L).sort((t,e)=>e.netSalesWithVat-t.netSalesWithVat||e.salesWithVat-t.salesWithVat).slice(0,6),st=N.length>0?Math.max(...N.map(t=>t.netSalesWithVat||t.salesWithVat||1)):1,ot=v.slice(0,8);w.innerHTML=`
    <div class="animate-fade-in">
      <!-- Top Primary Financial KPI Grid -->
      <div class="kpi-grid mb-24">
        ${K("💰","إجمالي المبيعات (شامل الضريبة 15%)",l(F),`صافي: <b>${l(I)}</b> • قبل الضريبة: ${l(V)}`,"sales",`${l(T)} ضريبة`)}
        
        ${K("✅","المبالغ المحصلة (سندات ونقدي)",l(R),`نسبة التغطية: <b>${at}%</b> • المتبقي: ${l(it)}`,"receipts",`${at}% تحصيل`)}
        
        ${K("🧾","الفواتير والمردودات",`${a.toLocaleString("ar")} فاتورة`,`المردودات: <b>${l($)}</b> (${X} إشعار) • متوسط: ${l(r)}`,"invoices",`${a} حركة`)}
        
        ${K("📈","مجمل الربح التقديري (Gross Profit)",l(J),`هامش الربح: <b>${et}%</b> • تكلفة البضاعة: ${l(W)}`,"profit",`${et}% هامش`,J>=0?"up":"down")}
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
            ${N.length===0?`
              <div class="empty-state" style="padding:40px 0; text-align:center;">
                <div class="empty-icon" style="font-size:36px; margin-bottom:8px;">🚚</div>
                <h4 style="color:var(--text-0); margin-bottom:4px;">لا توجد حركات مناديب مسجلة</h4>
                <p style="font-size:12px; color:var(--text-2);">لم تسجل فواتير أو تحصيلات للمناديب خلال هذه الفترة</p>
              </div>`:`
              <div style="display:flex; flex-direction:column; gap:16px;">
                ${N.map((t,e)=>{const s=["🥇","🥈","🥉","4","5","6"],i=["#F59E0B","#94A3B8","#D97706","#6366F1","#3B82F6","#8B5CF6"][e]||"#6366F1";st>0&&Math.min(100,Math.max(8,t.netSalesWithVat/st*100));const j=t.colRate>=80?"#10B981":t.colRate>=50?"#3B82F6":"#F59E0B";return`
                  <div style="background:var(--bg-2); border:1px solid var(--border-soft); border-radius:12px; padding:14px 16px; transition:all 0.2s ease;">
                    <!-- Rep Header Row -->
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
                      <div style="display:flex; align-items:center; gap:10px;">
                        <span style="display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:8px; font-weight:800; font-size:${e<3?"16px":"12px"}; background:${e<3?"transparent":"rgba(255,255,255,0.08)"}; color:var(--text-0);">
                          ${s[e]}
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
                        <div class="mono" style="font-weight:800; font-size:15px; color:${i};">
                          ${l(t.netSalesWithVat)}
                        </div>
                      </div>
                    </div>

                    <!-- Breakdown Financial Mini-Grid -->
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap:6px; background:var(--bg-card); border-radius:8px; padding:8px 10px; margin-bottom:10px; font-size:11px;">
                      <div>
                        <span style="color:var(--text-2); display:block; font-size:10px;">شامل الضريبة 15%:</span>
                        <span class="mono font-bold" style="color:var(--text-0);">${l(t.salesWithVat)}</span>
                      </div>
                      <div>
                        <span style="color:var(--text-2); display:block; font-size:10px;">قبل الضريبة:</span>
                        <span class="mono font-bold" style="color:var(--text-1);">${l(t.salesSubtotal)}</span>
                      </div>
                      <div>
                        <span style="color:var(--text-2); display:block; font-size:10px;">المردودات:</span>
                        <span class="mono font-bold" style="color:${t.returnsWithVat>0?"#EF4444":"var(--text-2)"};">
                          ${t.returnsWithVat>0?`- ${l(t.returnsWithVat)}`:"0.00 ر.س"}
                        </span>
                      </div>
                      <div>
                        <span style="color:var(--text-2); display:block; font-size:10px;">المحصل الفعلي:</span>
                        <span class="mono font-bold" style="color:#10B981;">${l(t.collections)}</span>
                      </div>
                    </div>

                    <!-- Collection Progress Bar & Gap -->
                    <div>
                      <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; margin-bottom:4px;">
                        <span style="color:var(--text-2);">
                          نسبة التحصيل: <b style="color:${j};">${t.colRate.toFixed(1)}%</b>
                        </span>
                        <span style="color:var(--text-2);">
                          المتبقي (الفجوة): <b class="mono" style="color:${t.gap>0?"#F59E0B":"#10B981"};">${l(t.gap)}</b>
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
              ${ot.length===0?`
                <tr><td colspan="8" style="text-align:center; color:var(--text-2); padding:40px;">
                  <div class="empty-icon" style="font-size:36px; margin-bottom:8px;">📄</div>
                  <div>لا توجد حركات مسجلة في هذه الفترة</div>
                </td></tr>`:ot.map(t=>{const e=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total||0),s=parseFloat(t.subtotal||t.totalWithoutVat||(e>0?e/1.15:0));return`
                  <tr onclick="navigate('sales-invoices')" style="cursor:pointer; transition: background 0.2s;">
                    <td class="mono font-bold" style="color:var(--brand);">#${t.invoiceNumber||t.number||t.id.slice(0,8)}</td>
                    <td class="font-semibold" style="color:var(--text-0);">${t.customerName||"عميل نقدي"}</td>
                    <td style="color:var(--text-1);">${t.repName||t.salesRepName||"المستودع الرئيسي"}</td>
                    <td class="dim">${bt(t.createdAt||t.date)}</td>
                    <td><span class="badge ${t.paymentMethod==="cash"?"good":"warn"}">${t.paymentMethod==="cash"?"نقدي":"آجل"}</span></td>
                    <td>${ft(t.status||"pending")}</td>
                    <td class="mono" style="text-align:left; color:var(--text-2);">${l(s)}</td>
                    <td class="mono font-bold text-good" style="text-align:left; font-size:14px;">${l(e)}</td>
                  </tr>`}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>`,yt(v,z,y,d,c)}function K(d,c,w,b,f,p,u="up"){return`
    <div class="kpi-card ${{sales:"g-blue",invoices:"g-purple",receipts:"g-green",profit:"g-orange"}[f]||"g-blue"}">
      <div class="kpi-header-row">
        <div class="kpi-icon-glass">${d}</div>
        ${p?`<div class="trend-badge">${p}</div>`:""}
      </div>
      <div class="kpi-content">
        <div class="kpi-label">${c}</div>
        <div class="kpi-value mono">${w}</div>
        <div class="kpi-sub">${b}</div>
      </div>
    </div>`}function yt(d,c,w,b,f){const p=document.getElementById("sales-chart");if(!p||typeof Chart>"u")return;const u={},x={},C=new Date(b),B=new Date(f);for(let a=new Date(C);a<=B;a.setDate(a.getDate()+1)){const r=a.toISOString().split("T")[0];u[r]=0,x[r]=0}d.forEach(a=>{const r=a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:a.date||"";u[r]!==void 0&&(u[r]+=parseFloat(a.totalWithVat!==void 0?a.totalWithVat:a.total||0))}),w.forEach(a=>{const r=a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:a.date||"";u[r]!==void 0&&(u[r]-=parseFloat(a.totalWithVat!==void 0?a.totalWithVat:a.total||0))}),c.forEach(a=>{const r=a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:a.date||"";x[r]!==void 0&&(x[r]+=parseFloat(a.amount||0))}),d.forEach(a=>{const r=(a.paymentMethod||"").toLowerCase();if(r==="cash"||r==="نقدي"||r==="paid"){const $=a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:a.date||"";if(x[$]!==void 0){const O=parseFloat(a.paidAmount||a.totalWithVat||a.total||0);c.some(I=>I.invoiceId===a.id)||(x[$]+=O)}}});const Q=Object.keys(u).map(a=>a.slice(5)),A=Object.values(u).map(a=>Math.max(0,a)),E=Object.values(x).map(a=>Math.max(0,a)),D=p.getContext("2d"),m=D.createLinearGradient(0,0,0,280);m.addColorStop(0,"rgba(99, 102, 241, 0.35)"),m.addColorStop(.6,"rgba(99, 102, 241, 0.08)"),m.addColorStop(1,"rgba(99, 102, 241, 0.0)");const v=D.createLinearGradient(0,0,0,280);v.addColorStop(0,"rgba(16, 185, 129, 0.35)"),v.addColorStop(.6,"rgba(16, 185, 129, 0.08)"),v.addColorStop(1,"rgba(16, 185, 129, 0.0)");const y=document.body.classList.contains("theme-light"),F=y?"#0F172A":"#9CA3AF",V=y?"rgba(15, 23, 42, 0.08)":"rgba(255, 255, 255, 0.06)",T=y?"#CBD5E1":"#334155";new Chart(p,{type:"line",data:{labels:Q,datasets:[{label:"صافي المبيعات (ر.س)",data:A,borderColor:"#6366F1",backgroundColor:m,borderWidth:2.5,pointBackgroundColor:"#6366F1",pointBorderColor:y?"#FFFFFF":"#0F172A",pointBorderWidth:2,pointRadius:4,pointHoverRadius:6,fill:!0,tension:.35},{label:"التحصيلات النقدية (ر.س)",data:E,borderColor:"#10B981",backgroundColor:v,borderWidth:2.5,pointBackgroundColor:"#10B981",pointBorderColor:y?"#FFFFFF":"#0F172A",pointBorderWidth:2,pointRadius:4,pointHoverRadius:6,fill:!0,tension:.35}]},options:{responsive:!0,maintainAspectRatio:!1,interaction:{mode:"index",intersect:!1},plugins:{legend:{display:!0,position:"top",align:"end",labels:{color:F,font:{family:"IBM Plex Sans Arabic",size:12,weight:"600"},boxWidth:12,boxHeight:12,usePointStyle:!0}},tooltip:{backgroundColor:"rgba(15, 23, 42, 0.95)",titleFont:{family:"IBM Plex Sans Arabic",size:13,weight:"700"},bodyFont:{family:"IBM Plex Mono",size:13},padding:12,cornerRadius:8,callbacks:{label:function(a){const r=a.dataset.label||"",$=a.parsed.y||0;return` ${r}: ${l($)}`}}}},scales:{y:{beginAtZero:!0,grid:{color:V},border:{color:T},ticks:{color:F,font:{family:"IBM Plex Mono",size:11,weight:"600"},callback:a=>l(a,!0)}},x:{grid:{display:!1},border:{color:T},ticks:{color:F,font:{family:"IBM Plex Sans Arabic",size:11,weight:"600"}}}}}})}export{Wt as render};
