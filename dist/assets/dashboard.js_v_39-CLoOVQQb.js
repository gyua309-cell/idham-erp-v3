import{s as q,t as _,d as at,a as st,g as v,C as b,f as r,e as ft,i as vt}from"./index-CF9GFeRJ.js";import{where as ot,collection as nt,limit as yt}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";async function Vt(l,d){const k=d?.displayName||"مدير النظام";l.innerHTML=`
    <!-- Advanced Dashboard Hero Header -->
    <div class="dashboard-hero animate-fade-in" style="background:var(--bg-1); border:1px solid var(--border-soft); border-radius:18px; padding:20px 24px; box-shadow:0 1px 3px rgba(0,0,0,0.03), 0 10px 25px -5px rgba(15,23,42,0.03); margin-bottom:24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
      <div class="hero-greeting">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
          <h1 style="font-size:22px; font-weight:800; color:var(--text-0); margin:0; font-family:var(--font-heading);">مرحباً بك مجدداً، ${k} 👋</h1>
          <span style="font-size:11px; font-weight:700; background:rgba(34,197,94,0.12); color:#15803d; border:1px solid rgba(34,197,94,0.25); padding:2px 8px; border-radius:20px; display:inline-flex; align-items:center; gap:5px;">
            <span style="width:6px; height:6px; border-radius:50%; background:#22c55e;"></span> متصل
          </span>
        </div>
        <p style="font-size:13px; color:var(--text-2); margin:0;">إليك ملخص الأداء التنفيذي والمؤشرات المالية والبيعية المباشرة</p>
      </div>
      <div class="hero-actions" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; background:transparent; padding:0; border:none;">
        <div class="quick-filters" style="background:var(--bg-2); border:1px solid var(--border-soft); padding:3px; border-radius:12px; display:inline-flex; align-items:center; gap:2px; margin:0;">
          <button class="quick-filter-btn" style="border:none; padding:6px 14px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer;" onclick="dashSetRange('today')">اليوم</button>
          <button class="quick-filter-btn" style="border:none; padding:6px 14px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer;" onclick="dashSetRange('week')">الأسبوع</button>
          <button class="quick-filter-btn active" style="border:none; padding:6px 14px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer;" onclick="dashSetRange('month')">هذا الشهر</button>
          <button class="quick-filter-btn" style="border:none; padding:6px 14px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer;" onclick="dashSetRange('last_month')">الشهر الماضي</button>
        </div>
        <div style="display:inline-flex; align-items:center; gap:6px; background:var(--bg-card); border:1.5px solid var(--border-soft); padding:5px 12px; border-radius:10px;">
          <span style="font-size:13px; opacity:0.8;">📅</span>
          <input type="date" id="dash-from" value="${q()}" style="border:none; background:transparent; font-size:12px; font-weight:700; color:var(--text-0); outline:none; padding:1px 0;" />
          <span style="color:var(--text-2); font-size:11px; font-weight:600;">إلى</span>
          <input type="date" id="dash-to" value="${_()}" style="border:none; background:transparent; font-size:12px; font-weight:700; color:var(--text-0); outline:none; padding:1px 0;" />
        </div>
        <button class="btn btn-primary btn-sm" onclick="loadDashboard()" style="background:linear-gradient(135deg, #2563eb, #1d4ed8); border:none; padding:8px 18px; border-radius:10px; font-size:12.5px; font-weight:800; box-shadow:0 2px 8px rgba(37,99,235,0.25); display:inline-flex; align-items:center; gap:6px;">
          🔄 تحديث
        </button>
      </div>
    </div>

    <div class="page-content" id="dash-content" style="padding: 0;">
      <div class="page-loading"><div class="loading-spinner"></div><span>جارٍ تحليل البيانات…</span></div>
    </div>`,window.dashSetRange=g=>{const x=_(),c=new Date;if(document.querySelectorAll(".quick-filter-btn").forEach(p=>p.classList.remove("active")),window.event&&window.event.target&&window.event.target.classList.add("active"),g==="today")document.getElementById("dash-from").value=x,document.getElementById("dash-to").value=x;else if(g==="week"){const p=new Date(c);p.setDate(c.getDate()-c.getDay()+1),document.getElementById("dash-from").value=p.toISOString().split("T")[0],document.getElementById("dash-to").value=x}else if(g==="month")document.getElementById("dash-from").value=q(),document.getElementById("dash-to").value=x;else if(g==="last_month"){const p=new Date(c.getFullYear(),c.getMonth()-1,1),f=new Date(c.getFullYear(),c.getMonth(),0);document.getElementById("dash-from").value=p.toISOString().split("T")[0],document.getElementById("dash-to").value=f.toISOString().split("T")[0]}loadDashboard()},window.loadDashboard=async()=>{const g=document.getElementById("dash-from")?.value||q(),x=document.getElementById("dash-to")?.value||_();await it(g,x)},await it(q(),_())}async function it(l,d){const k=document.getElementById("dash-content");if(!k)return;k.innerHTML=`
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
    </div>`;let g=[],x=[],c=[],p=[],f=[],y=[],I=[],E=[],z=[],B=[],D=[];const V=t=>t?t.date?t.date:t.createdAt?t.createdAt.toDate?t.createdAt.toDate().toISOString().split("T")[0]:t.createdAt.seconds?new Date(t.createdAt.seconds*1e3).toISOString().split("T")[0]:typeof t.createdAt=="string"?t.createdAt.split("T")[0]:"":"":"";try{const t=[];l&&t.push(ot("date",">=",l)),d&&t.push(ot("date","<=",d));const e=nt(at,`companies/${st}/collections`),s=nt(at,`companies/${st}/journalEntries`),[n,S,lt,dt,ct,pt,ut,gt,xt,ht,bt]=await Promise.all([v(b.salesInvoices(),t).catch(o=>(console.warn(o),[])),v(b.salesReturns?b.salesReturns():"salesReturns",t).catch(o=>(console.warn(o),[])),v(b.purchaseInvoices(),t).catch(o=>(console.warn(o),[])),v(b.stockByWarehouse(),[yt(150)]).catch(o=>(console.warn(o),[])),v(b.receipts(),t).catch(o=>(console.warn(o),[])),v(s,t).catch(o=>(console.warn(o),[])),v(e,t).catch(o=>(console.warn(o),[])),v(b.products()).catch(o=>(console.warn(o),[])),v(b.salesReps?b.salesReps():"salesReps").catch(o=>(console.warn(o),[])),v(b.customers?b.customers():"customers").catch(o=>(console.warn(o),[])),v(b.cashBoxes?b.cashBoxes():"cashBoxes").catch(o=>(console.warn(o),[]))]);g=n||[],x=S||[],c=lt||[],f=ct||[],y=ut||[],I=(pt||[]).filter(o=>o.status==="posted"),E=gt||[],z=xt||[],B=ht||[],D=bt||[],p=(dt||[]).filter(o=>o.stockStatus==="out"||o.stockStatus==="low").slice(0,10),g=g.filter(o=>{const h=V(o);return(!l||h>=l)&&(!d||h<=d)}),x=x.filter(o=>{const h=V(o);return(!l||h>=l)&&(!d||h<=d)}),c=c.filter(o=>{const h=V(o);return(!l||h>=l)&&(!d||h<=d)}),f=f.filter(o=>{const h=V(o);return(!l||h>=l)&&(!d||h<=d)}),y=y.filter(o=>{const h=V(o);return(!l||h>=l)&&(!d||h<=d)})}catch(t){console.error("Dashboard fetch error",t)}const C=g.filter(t=>t.status!=="cancelled"),m=x.filter(t=>t.status!=="cancelled");let w=0,$=0;C.forEach(t=>{const e=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total||0),s=parseFloat(t.subtotal||t.totalWithoutVat||t.netTotal||(e>0?e/1.15:0));w+=e,$+=s});const M=Math.max(0,w-$),F=C.length,A=F>0?w/F:0;let a=0,u=0;m.forEach(t=>{const e=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total||0),s=parseFloat(t.subtotal||t.totalWithoutVat||(e>0?e/1.15:0));a+=e,u+=s});const H=m.length,T=Math.max(0,w-a),Y=Math.max(0,$-u),K={};E.forEach(t=>{K[t.id]=parseFloat(t.costPrice||t.purchasePrice||0)});let W=0;C.forEach(t=>{if(t.totalCost!==void 0&&t.totalCost!==null)W+=parseFloat(t.totalCost);else{let e=0;(t.items||t.lines||[]).forEach(s=>{const n=parseFloat(s.qty||s.quantity||0),S=parseFloat(s.averageCost||s.costPrice||s.purchasePrice||K[s.productId||s.id]||0);e+=n*S}),W+=e}});let U=0;m.forEach(t=>{(t.items||t.lines||[]).forEach(e=>{const s=parseFloat(e.qty||e.quantity||0),n=parseFloat(e.averageCost||e.costPrice||e.purchasePrice||K[e.productId||e.id]||0);U+=s*n})}),W=Math.max(0,W-U),W===0&&I.length>0&&I.filter(t=>t.type==="salesCOGS"||t.sourceType==="salesCOGS"||t.description&&t.description.includes("تكلفة بضاعة")).forEach(t=>{W+=parseFloat(t.totalDebit||t.amount||0)});const Z=Y-W,J=Y>0?(Z/Y*100).toFixed(1):"0.0",Q=f.filter(t=>t.entityType==="customer"||!t.entityType||t.type==="receipt");let R=Q.reduce((t,e)=>t+parseFloat(e.amount||0),0);y.forEach(t=>{R+=parseFloat(t.amount||0)});const rt=Math.max(0,T-R),X=T>0?Math.min(100,R/T*100).toFixed(1):R>0?"100.0":"0.0",O={};B.forEach(t=>{t.id&&(t.repId||t.assignedRepId)&&(O[t.id]=t.repId||t.assignedRepId)});const P={};D.forEach(t=>{let e=t.repId||t.salesRepId||t.linkedRepId||null;const s=t.name||"";if(!e&&s){const n=z.find(S=>S.name&&s.includes(S.name));n&&(e=n.id)}e&&(P[t.id]=e)});const i={};z.forEach(t=>{i[t.id]={id:t.id,name:t.name||"مندوب",zone:t.zone||"مسار ميداني",costCenterId:t.costCenterId||null,target:parseFloat(t.monthlyTarget||0),salesWithVat:0,salesSubtotal:0,returnsWithVat:0,returnsSubtotal:0,netSalesWithVat:0,netSalesSubtotal:0,collections:0,invoiceCount:0,returnCount:0}});const j="rep_direct_warehouse";i[j]={id:j,name:"المستودع الرئيسي (مبيعات مباشرة)",zone:"إدارة المبيعات المركزية",costCenterId:null,target:0,salesWithVat:0,salesSubtotal:0,returnsWithVat:0,returnsSubtotal:0,netSalesWithVat:0,netSalesSubtotal:0,collections:0,invoiceCount:0,returnCount:0};const L=t=>{if(t.repId&&i[t.repId])return t.repId;if(t.salesRepId&&i[t.salesRepId])return t.salesRepId;if(t.sourceId&&P[t.sourceId]&&i[P[t.sourceId]])return P[t.sourceId];if(t.repName){const s=z.find(n=>n.name===t.repName||n.id===t.repName);if(s)return s.id}if(t.costCenterId){const s=z.find(n=>n.costCenterId===t.costCenterId||n.name&&t.costCenterName&&t.costCenterName.includes(n.name));if(s)return s.id}const e=t.customerId||t.targetId;return e&&O[e]&&i[O[e]]?O[e]:j};C.forEach(t=>{const e=L(t),s=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total||0),n=parseFloat(t.subtotal||t.totalWithoutVat||(s>0?s/1.15:0));i[e]||(i[e]={id:e,name:t.repName||"مندوب مبيعات",zone:"مسار ميداني",target:0,salesWithVat:0,salesSubtotal:0,returnsWithVat:0,returnsSubtotal:0,netSalesWithVat:0,netSalesSubtotal:0,collections:0,invoiceCount:0,returnCount:0}),i[e].salesWithVat+=s,i[e].salesSubtotal+=n,i[e].invoiceCount+=1}),m.forEach(t=>{const e=L(t),s=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total||0),n=parseFloat(t.subtotal||t.totalWithoutVat||(s>0?s/1.15:0));i[e]||(i[e]={id:e,name:t.repName||"مندوب مبيعات",zone:"مسار ميداني",target:0,salesWithVat:0,salesSubtotal:0,returnsWithVat:0,returnsSubtotal:0,netSalesWithVat:0,netSalesSubtotal:0,collections:0,invoiceCount:0,returnCount:0}),i[e].returnsWithVat+=s,i[e].returnsSubtotal+=n,i[e].returnCount+=1}),Q.forEach(t=>{const e=L(t);i[e]&&(i[e].collections+=parseFloat(t.amount||0))}),y.forEach(t=>{const e=L(t);i[e]&&(i[e].collections+=parseFloat(t.amount||0))});const N=Object.values(i).map(t=>{const e=Math.max(0,t.salesWithVat-t.returnsWithVat),s=Math.max(0,t.salesSubtotal-t.returnsSubtotal),n=Math.max(0,e-t.collections),S=e>0?Math.min(100,t.collections/e*100):t.collections>0?100:0;return{...t,netSalesWithVat:e,netSalesSubtotal:s,gap:n,colRate:S}}).filter(t=>t.salesWithVat>0||t.returnsWithVat>0||t.collections>0||t.id!==j).sort((t,e)=>e.netSalesWithVat-t.netSalesWithVat||e.salesWithVat-t.salesWithVat).slice(0,6),tt=N.length>0?Math.max(...N.map(t=>t.netSalesWithVat||t.salesWithVat||1)):1,et=C.slice(0,8);k.innerHTML=`
    <div class="animate-fade-in">
      <!-- Top Primary Financial KPI Grid -->
      <div class="kpi-grid mb-24">
        ${G("💰","إجمالي المبيعات (شامل الضريبة 15%)",r(w),`صافي: <b>${r(T)}</b> • قبل الضريبة: ${r($)}`,"sales",`${r(M)} ضريبة`)}
        
        ${G("✅","المبالغ المحصلة (سندات ونقدي)",r(R),`نسبة التغطية: <b>${X}%</b> • المتبقي: ${r(rt)}`,"receipts",`${X}% تحصيل`)}
        
        ${G("🧾","الفواتير والمردودات",`${F.toLocaleString("ar")} فاتورة`,`المردودات: <b>${r(a)}</b> (${H} إشعار) • متوسط: ${r(A)}`,"invoices",`${F} حركة`)}
        
        ${G("📈","مجمل الربح التقديري (Gross Profit)",r(Z),`هامش الربح: <b>${J}%</b> • تكلفة البضاعة: ${r(W)}`,"profit",`${J}% هامش`,Z>=0?"up":"down")}
      </div>

      <!-- Charts & Top Reps Row -->
      <div class="content-grid-sidebar mb-24" style="align-items: stretch;">
        
        <!-- Daily Sales & Collections Chart Card -->
        <div class="card" style="border-radius:16px; background:var(--bg-1); border:1px solid var(--border-soft); box-shadow:0 1px 3px rgba(0,0,0,0.03), 0 6px 16px -2px rgba(15,23,42,0.03); display:flex; flex-direction:column;">
          <div class="card-header" style="border-bottom: 1px solid var(--border-soft); padding:16px 20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="kpi-icon-glass" style="width:38px; height:38px; font-size:18px; border-radius:10px; background:rgba(37,99,235,0.1); color:#2563EB; display:flex; align-items:center; justify-content:center;">📊</div>
              <div>
                <h3 style="font-size:15.5px; font-family:var(--font-heading); color:var(--text-0); margin:0; font-weight:800;">تحليل المبيعات والتحصيلات اليومية</h3>
                <span class="text-2" style="font-size:11.5px;">مقارنة صافي المبيعات بالمبالغ المحصلة فعلياً للفترة</span>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px; font-size:12px; font-weight:700;">
              <span style="display:flex; align-items:center; gap:6px; color:#2563EB; background:rgba(37,99,235,0.08); padding:4px 10px; border-radius:20px;">
                <span style="width:8px; height:8px; border-radius:50%; background:#2563EB;"></span>
                صافي المبيعات
              </span>
              <span style="display:flex; align-items:center; gap:6px; color:#059669; background:rgba(5,150,105,0.08); padding:4px 10px; border-radius:20px;">
                <span style="width:8px; height:8px; border-radius:50%; background:#059669;"></span>
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
        <div class="card" style="border-radius:16px; background:var(--bg-1); border:1px solid var(--border-soft); box-shadow:0 1px 3px rgba(0,0,0,0.03), 0 6px 16px -2px rgba(15,23,42,0.03); display:flex; flex-direction:column;">
          <div class="card-header" style="border-bottom: 1px solid var(--border-soft); padding:16px 20px; display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="kpi-icon-glass" style="width:38px; height:38px; font-size:18px; border-radius:10px; background:rgba(245,158,11,0.12); color:#D97706; display:flex; align-items:center; justify-content:center;">🏆</div>
              <div>
                <h3 style="font-size:15.5px; font-family:var(--font-heading); color:var(--text-0); margin:0; font-weight:800;">نخبة المناديب ومؤشرات التحصيل</h3>
                <span class="text-2" style="font-size:11.5px;">المبيعات قبل/بعد الضريبة والصافي والتحصيلات</span>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="navigate('sales-reps')" style="font-size:12px; color:var(--brand); font-weight:700; padding:4px 10px; border-radius:8px;" title="فتح تقرير المناديب الكامل">
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
              <div style="display:flex; flex-direction:column; gap:14px;">
                ${N.map((t,e)=>{const s=["🥇","🥈","🥉","4","5","6"];tt>0&&Math.min(100,Math.max(8,t.netSalesWithVat/tt*100));const n=t.colRate>=80?"#10B981":t.colRate>=50?"#2563EB":"#F59E0B";return t.netSalesWithVat===0&&t.collections===0&&t.invoiceCount===0?`
                    <div style="display:flex; align-items:center; justify-content:space-between; background:var(--bg-2); border:1px dashed var(--border-soft); border-radius:10px; padding:10px 14px; font-size:12px; opacity:0.85;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:14px; opacity:0.6;">👤</span>
                        <span style="font-weight:700; color:var(--text-0);">${t.name}</span>
                        <span style="font-size:10.5px; color:var(--text-2);">(${t.zone})</span>
                      </div>
                      <span style="font-size:11px; color:var(--text-2); font-weight:600;">لا توجد مبيعات في الفترة — 0.00 ر.س</span>
                    </div>`:`
                  <div style="background:var(--bg-1); border:1.5px solid var(--border-soft); border-radius:14px; padding:16px 18px; box-shadow:0 1px 3px rgba(0,0,0,0.03); transition:all 0.2s ease;">
                    <!-- Rep Header Row -->
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
                      <div style="display:flex; align-items:center; gap:10px;">
                        <span style="display:inline-flex; align-items:center; justify-content:center; width:34px; height:34px; border-radius:10px; font-weight:800; font-size:16px; background:${e===0?"linear-gradient(135deg, #fef3c7, #fde68a)":e===1?"linear-gradient(135deg, #f1f5f9, #e2e8f0)":"linear-gradient(135deg, #ffedd5, #fed7aa)"}; border:1px solid ${e===0?"#f59e0b":e===1?"#94a3b8":"#d97706"};">
                          ${s[e]}
                        </span>
                        <div>
                          <div style="font-weight:800; font-size:14.5px; color:var(--text-0); font-family:var(--font-heading); display:flex; align-items:center; gap:6px;">
                            ${t.name}
                            ${t.invoiceCount>0?`<span style="font-size:11px; padding:2px 8px; border-radius:6px; background:rgba(37,99,235,0.1); color:#2563EB; font-weight:700;">${t.invoiceCount} فواتير</span>`:""}
                          </div>
                          <div style="font-size:11.5px; color:var(--text-2); margin-top:2px;">📍 ${t.zone}</div>
                        </div>
                      </div>

                      <div style="text-align:left;">
                        <div style="font-size:10.5px; color:var(--text-2); font-weight:700;">صافي المبيعات</div>
                        <div class="mono" style="font-weight:800; font-size:16px; color:#2563EB;">
                          ${r(t.netSalesWithVat)}
                        </div>
                      </div>
                    </div>

                    <!-- Breakdown Financial Mini-Grid -->
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; background:var(--bg-2); border:1px solid var(--border-soft); border-radius:10px; padding:10px 12px; margin-bottom:12px; font-size:11.5px;">
                      <div>
                        <span style="color:var(--text-2); display:block; font-size:10.5px; margin-bottom:2px;">شامل الضريبة 15%:</span>
                        <span class="mono font-bold" style="color:var(--text-0);">${r(t.salesWithVat)}</span>
                      </div>
                      <div>
                        <span style="color:var(--text-2); display:block; font-size:10.5px; margin-bottom:2px;">قبل الضريبة:</span>
                        <span class="mono font-bold" style="color:var(--text-1);">${r(t.salesSubtotal)}</span>
                      </div>
                      <div>
                        <span style="color:var(--text-2); display:block; font-size:10.5px; margin-bottom:2px;">المردودات:</span>
                        <span class="mono font-bold" style="color:${t.returnsWithVat>0?"#EF4444":"var(--text-2)"};">
                          ${t.returnsWithVat>0?`- ${r(t.returnsWithVat)}`:"0.00 ر.س"}
                        </span>
                      </div>
                      <div>
                        <span style="color:var(--text-2); display:block; font-size:10.5px; margin-bottom:2px;">المحصل الفعلي:</span>
                        <span class="mono font-bold" style="color:#10B981;">${r(t.collections)}</span>
                      </div>
                    </div>

                    <!-- Collection Progress Bar & Gap -->
                    <div>
                      <div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px; margin-bottom:4px;">
                        <span style="color:var(--text-1); font-weight:600;">
                          نسبة التحصيل: <b style="color:${n}; font-weight:800;">${t.colRate.toFixed(1)}%</b>
                        </span>
                        <span style="color:var(--text-1); font-weight:600;">
                          المتبقي (الفجوة): <b class="mono" style="color:${t.gap>0?"#F59E0B":"#10B981"}; font-weight:800;">${r(t.gap)}</b>
                        </span>
                      </div>
                      <div style="height:8px; background:var(--bg-3); border-radius:99px; overflow:hidden; display:flex;">
                        <div style="width:${t.colRate}%; background:linear-gradient(90deg, #10B981, #059669); border-radius:99px; transition:width 0.5s ease;"></div>
                      </div>
                    </div>
                  </div>`}).join("")}
              </div>`}
          </div>
        </div>
      </div>

      <!-- Recent Invoices Table (Full Width) -->
      <div class="card mb-24" style="border-radius:16px; background:var(--bg-1); border:1px solid var(--border-soft); box-shadow:0 1px 3px rgba(0,0,0,0.03), 0 6px 16px -2px rgba(15,23,42,0.03);">
        <div class="card-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:20px;">🧾</span>
            <div>
              <h3 style="font-size:15.5px; font-family:var(--font-heading); color:var(--text-0); margin:0; font-weight:800;">أحدث فواتير المبيعات</h3>
              <span class="text-2" style="font-size:11.5px;">سجل الحركات الأحدث الصادرة خلال الفترة المحددة</span>
            </div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="navigate('sales-invoices')" style="font-weight:700; font-size:12px; padding:5px 12px; border-radius:8px;">عرض السجل الكامل</button>
        </div>
        <div class="table-container" style="margin:0; border:none;">
          <table class="data-dense table-sticky-col">
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
              ${et.length===0?`
                <tr><td colspan="8" style="text-align:center; color:var(--text-2); padding:40px;">
                  <div class="empty-icon" style="font-size:36px; margin-bottom:8px;">📄</div>
                  <div>لا توجد حركات مسجلة في هذه الفترة</div>
                </td></tr>`:et.map(t=>{const e=parseFloat(t.totalWithVat!==void 0?t.totalWithVat:t.total||0),s=parseFloat(t.subtotal||t.totalWithoutVat||(e>0?e/1.15:0));return`
                  <tr onclick="navigate('sales-invoices')" style="cursor:pointer; transition: background 0.2s;">
                    <td class="mono font-bold" style="color:var(--brand);">#${t.invoiceNumber||t.number||t.id.slice(0,8)}</td>
                    <td class="font-semibold" style="color:var(--text-0);">${t.customerName||"عميل نقدي"}</td>
                    <td style="color:var(--text-1);">${t.repName||t.salesRepName||"المستودع الرئيسي"}</td>
                    <td class="dim">${ft(t.createdAt||t.date)}</td>
                    <td><span class="badge ${t.paymentMethod==="cash"?"good":"warn"}">${t.paymentMethod==="cash"?"💵 نقدي":"⏳ آجل"}</span></td>
                    <td>${vt(t.status||"pending")}</td>
                    <td class="mono" style="text-align:left; color:var(--text-2);">${r(s)}</td>
                    <td class="mono font-bold text-good" style="text-align:left; font-size:14px;">${r(e)}</td>
                  </tr>`}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>`,mt(C,Q,m,l,d)}function G(l,d,k,g,x,c,p="up"){return`
    <div class="kpi-card ${{sales:"g-blue",invoices:"g-purple",receipts:"g-green",profit:"g-orange"}[x]||"g-blue"}">
      <div class="kpi-header-row">
        <div class="kpi-icon-glass">${l}</div>
        ${c?`<div class="trend-badge">${c}</div>`:""}
      </div>
      <div class="kpi-content">
        <div class="kpi-label">${d}</div>
        <div class="kpi-value mono">${k}</div>
        <div class="kpi-sub">${g}</div>
      </div>
    </div>`}function mt(l,d,k,g,x){const c=document.getElementById("sales-chart");if(!c||typeof Chart>"u")return;if(window._salesChartInstance){try{window._salesChartInstance.destroy()}catch{}window._salesChartInstance=null}const p={},f={};let y=new Date(g),I=new Date(x);const E=Math.abs(I-y);Math.ceil(E/(1e3*60*60*24))+1<7&&(y=new Date(I),y.setDate(I.getDate()-6));for(let a=new Date(y);a<=I;a.setDate(a.getDate()+1)){const u=a.toISOString().split("T")[0];p[u]=0,f[u]=0}l.forEach(a=>{const u=a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:a.date||"";p[u]!==void 0&&(p[u]+=parseFloat(a.totalWithVat!==void 0?a.totalWithVat:a.total||0))}),k.forEach(a=>{const u=a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:a.date||"";p[u]!==void 0&&(p[u]-=parseFloat(a.totalWithVat!==void 0?a.totalWithVat:a.total||0))}),d.forEach(a=>{const u=a.createdAt?.toDate?a.createdAt.toDate().toISOString().split("T")[0]:a.date||"";f[u]!==void 0&&(f[u]+=parseFloat(a.amount||0))});const B=Object.keys(p).map(a=>a.slice(5)),D=Object.values(p).map(a=>Math.max(0,a)),V=Object.values(f).map(a=>Math.max(0,a)),C=c.getContext("2d"),m=C.createLinearGradient(0,0,0,280);m.addColorStop(0,"rgba(37, 99, 235, 0.28)"),m.addColorStop(.7,"rgba(37, 99, 235, 0.04)"),m.addColorStop(1,"rgba(37, 99, 235, 0.0)");const w=C.createLinearGradient(0,0,0,280);w.addColorStop(0,"rgba(16, 185, 129, 0.28)"),w.addColorStop(.7,"rgba(16, 185, 129, 0.04)"),w.addColorStop(1,"rgba(16, 185, 129, 0.0)");const $=document.body.classList.contains("theme-light")||!document.body.classList.contains("theme-dark"),M=$?"#475569":"#9CA3AF",F=$?"rgba(15, 23, 42, 0.06)":"rgba(255, 255, 255, 0.06)",A=$?"#E2E8F0":"#334155";window._salesChartInstance=new Chart(c,{type:"line",data:{labels:B,datasets:[{label:"صافي المبيعات (ر.س)",data:D,borderColor:"#2563EB",backgroundColor:m,borderWidth:2.5,pointBackgroundColor:"#2563EB",pointBorderColor:"#FFFFFF",pointBorderWidth:2,pointRadius:4,pointHoverRadius:7,fill:!0,tension:.38},{label:"التحصيلات النقدية (ر.س)",data:V,borderColor:"#10B981",backgroundColor:w,borderWidth:2.5,pointBackgroundColor:"#10B981",pointBorderColor:"#FFFFFF",pointBorderWidth:2,pointRadius:4,pointHoverRadius:7,fill:!0,tension:.38}]},options:{responsive:!0,maintainAspectRatio:!1,interaction:{mode:"index",intersect:!1},plugins:{legend:{display:!1},tooltip:{backgroundColor:"rgba(15, 23, 42, 0.95)",titleFont:{family:"IBM Plex Sans Arabic",size:12,weight:"700"},bodyFont:{family:"IBM Plex Mono",size:12},padding:12,cornerRadius:10,boxPadding:6,usePointStyle:!0,callbacks:{title:function(a){return`📅 التاريخ: ${a[0]?.label||""}`},label:function(a){const u=a.dataset.label||"",H=a.parsed.y||0;return` ${u}: ${r(H)}`}}}},scales:{y:{beginAtZero:!0,grid:{color:F},border:{color:A},ticks:{color:M,font:{family:"IBM Plex Mono",size:11,weight:"600"},callback:a=>r(a,!0)}},x:{grid:{display:!1},border:{color:A},ticks:{color:M,font:{family:"IBM Plex Sans Arabic",size:11,weight:"600"}}}}}})}export{Vt as render};
